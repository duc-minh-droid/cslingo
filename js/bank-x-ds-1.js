/* Revision bank, third set of varied, visual questions (ds-1).
   Modules: the three workshops (ds-ops, ds-querylab, ds-engine) and the seven regular sessions.
   Every question stands on its own: the figure (or the question text) carries the data it needs.
   Numbers checked with node. Each figure kind is used once per module. */
(function () {
  const B = NIC.bank;

  /* ---- tiny SVG helpers (theme tokens only) ---- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 12}px var(--sans);fill:${o.c || "var(--text)"}">${t}</text>`;
  const rc = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx === undefined ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" ${o.fo != null ? `fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2.5}" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2.5}" stroke-linecap="round" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const ci = (x, y, r, o = {}) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}" ${o.fo != null ? `fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2.5}"/>`;
  /* a transparent overlay that makes a region tappable (the highlight is its outline) */
  const hit = (id, x, y, w, h, rx = 8) => `<rect data-pick="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="transparent" stroke="none" style="cursor:pointer"/>`;
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;
  const arrow = (x1, y1, x2, y2, o = {}) => {
    const a = Math.atan2(y2 - y1, x2 - x1), c = o.s || "var(--text-dim)", k = 8;
    const p = [[x2, y2], [x2 - k * Math.cos(a - 0.45), y2 - k * Math.sin(a - 0.45)], [x2 - k * Math.cos(a + 0.45), y2 - k * Math.sin(a + 0.45)]].map((q) => q.join(",")).join(" ");
    return ln(x1, y1, x2 - 3 * Math.cos(a), y2 - 3 * Math.sin(a), { s: c, sw: o.sw || 2.5, d: o.d }) + `<polygon points="${p}" fill="${c}"/>`;
  };
  const xm = (x, y, r, c = "var(--rose)") => ln(x - r, y - r, x + r, y + r, { s: c, sw: 3.5 }) + ln(x - r, y + r, x + r, y - r, { s: c, sw: 3.5 });
  const table = (head, rows) => `<table class="t"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const chipH = (t, c) => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:3px 9px;border:2px solid ${c || "var(--line-2)"};border-radius:10px;font:800 12px var(--sans);background:var(--panel)">${t}</span>`;

  /* =====================================================================
     1.W  ds-ops
     ===================================================================== */

  // heat grid: how busy each server is NOW, by fleet size and traffic
  const opsHeat = (() => {
    const loads = [150, 250, 350, 450], ns = [3, 4, 5, 6, 7], x0 = 86, y0 = 40, cw = 68, ch = 34;
    let s = tx(x0 + 2 * cw, 13, "traffic, requests per second", { c: "var(--text-dim)" });
    loads.forEach((l, j) => (s += tx(x0 + j * cw + cw / 2, 33, l)));
    ns.forEach((n, i) => {
      s += tx(x0 - 10, y0 + i * ch + ch / 2 + 4, `${n} servers`, { a: "end" });
      loads.forEach((l, j) => {
        const p = Math.round((l / (100 * n)) * 100), col = p >= 100 ? "var(--rose)" : p >= 85 ? "var(--amber)" : "var(--teal)", op = p >= 100 ? 0.55 : p >= 85 ? 0.5 : p >= 50 ? 0.34 : 0.16;
        s += rc(x0 + j * cw + 2, y0 + i * ch + 2, cw - 4, ch - 4, { rx: 6, s: "var(--line)", sw: 2 }) + rc(x0 + j * cw + 2, y0 + i * ch + 2, cw - 4, ch - 4, { rx: 6, f: col, fo: op, s: "none", sw: 0 }) + tx(x0 + j * cw + cw / 2, y0 + i * ch + ch / 2 + 4, p + "%");
        s += hit(`n${n}-${l}`, x0 + j * cw + 2, y0 + i * ch + 2, cw - 4, ch - 4, 6);
      });
    });
    return svg(x0 + 4 * cw + 6, y0 + 5 * ch + 6, s);
  })();

  // small multiples: median vs p99 at three busy levels (model: median = 20 / (1 - 0.9 u), p99 = 3.5 x median)
  const opsPanels = (() => {
    const P = [["50% busy", 36, 126], ["80% busy", 71, 249], ["95% busy", 138, 483]], k = 0.24, base = 178, w = 140;
    let s = "";
    P.forEach(([t, m, p], i) => {
      const x = 4 + i * (w + 4);
      s += rc(x, 4, w, 206, { sw: 2, s: "var(--line)" }) + tx(x + w / 2, 24, t, { s: 13 });
      s += ln(x + 10, base, x + w - 10, base, { s: "var(--line-2)", sw: 2 });
      s += ln(x + 8, base - 300 * k, x + w - 8, base - 300 * k, { s: "var(--rose)", sw: 2, d: "5 4" }) + tx(x + 10, base - 300 * k - 5, "goal 300", { a: "start", s: 12, c: "var(--rose-ink)" });
      s += rc(x + 26, base - m * k, 34, m * k, { f: "var(--teal)", fo: 0.6, s: "var(--teal)", sw: 2, rx: 4 }) + tx(x + 43, base - m * k - 5, m, { s: 13 }) + tx(x + 43, base + 17, "median", { s: 12, c: "var(--text-dim)" });
      s += rc(x + 82, base - p * k, 34, p * k, { f: "var(--blue)", fo: 0.6, s: "var(--blue)", sw: 2, rx: 4 }) + tx(x + 99, base - p * k + 16, p, { s: 13 }) + tx(x + 99, base + 17, "p99", { s: 12, c: "var(--text-dim)" });
      s += hit(`u${[50, 80, 95][i]}`, x, 4, w, 206, 10);
    });
    return svg(3 * (w + 4) + 4, 214, s);
  })();

  // Gantt: a staged rollout, one more server every 10 minutes
  const opsGantt = (() => {
    const x0 = 66, k = 8.5, t0 = [0, 10, 20, 30];
    let s = "";
    [0, 10, 20, 30, 40].forEach((t) => (s += ln(x0 + t * k, 34, x0 + t * k, 188, { s: "var(--line)", sw: 1.5 }) + tx(x0 + t * k, 204, t, { s: 11, c: "var(--text-dim)" })));
    s += tx(x0 + 20 * k, 222, "minutes since the rollout began", { s: 11, c: "var(--text-dim)" });
    t0.forEach((t, i) => {
      const y = 44 + i * 36;
      s += tx(x0 - 8, y + 16, `Server ${i + 1}`, { a: "end" });
      if (t) s += rc(x0, y, t * k, 24, { f: "var(--blue)", fo: 0.3, s: "var(--blue)", sw: 2, rx: 5 }) + (t >= 10 ? tx(x0 + (t * k) / 2, y + 16, "v1", { s: 11 }) : "");
      s += rc(x0 + t * k, y, (40 - t) * k, 24, { f: "var(--rose)", fo: 0.45, s: "var(--rose)", sw: 2, rx: 5 }) + tx(x0 + t * k + ((40 - t) * k) / 2, y + 16, "v2", { s: 11 });
      s += hit(`s${i + 1}`, 4, y - 5, 432, 34, 8);
    });
    s += ln(x0 + 12 * k, 30, x0 + 12 * k, 190, { s: "var(--amber)", sw: 3, d: "6 4" }) + tx(x0 + 12 * k, 22, "alarm at minute 12", { c: "var(--amber-ink)" });
    return svg(440, 230, s);
  })();

  // rack: six servers, two down
  const opsRack = (() => {
    let s = rc(6, 20, 428, 96, { sw: 2.5, s: "var(--line-2)", rx: 12 }) + tx(220, 14, "the fleet: each server handles 100 requests per second", { c: "var(--text-dim)", s: 12 });
    for (let i = 0; i < 6; i++) {
      const x = 18 + i * 68, dead = i === 1 || i === 4;
      s += rc(x, 34, 58, 66, { s: dead ? "var(--rose)" : "var(--teal)", f: dead ? "var(--rose)" : "var(--teal)", fo: 0.16, sw: 2.5, rx: 8 }) + tx(x + 29, 62, dead ? "down" : "100", { c: dead ? "var(--rose-ink)" : "var(--text)" });
      s += dead ? xm(x + 29, 80, 8) : tx(x + 29, 82, "req/s", { s: 11, c: "var(--text-dim)" });
    }
    return svg(440, 126, s);
  })();

  // state machine: a canary pipeline
  const opsFsm = (() => {
    const box = (x, y, w, a, b, c) => rc(x, y, w, 44, { s: c, f: c, fo: 0.14, sw: 2.5, rx: 10 }) + tx(x + w / 2, y + 19, a) + tx(x + w / 2, y + 35, b, { s: 11, c: "var(--text-dim)" });
    let s = box(110, 6, 220, "v1 on all 4 servers", "everything is fine", "var(--blue)");
    s += arrow(220, 50, 220, 104) + box(110, 104, 220, "canary: v2 on 1 of 4", "the other 3 stay on v1", "var(--amber)");
    s += arrow(170, 148, 100, 230) + arrow(270, 148, 340, 230);
    s += box(10, 232, 180, "v2 on all 4 servers", "bug now everywhere", "var(--rose)") + box(250, 232, 180, "back to v1", "rolled back", "var(--teal)");
    const pill = (id, x, y, w, t) => pk(id, rc(x, y, w, 26, { sw: 2.5, rx: 13 }) + tx(x + w / 2, y + 17, t, { s: 12 }));
    s += pill("deploy", 232, 66, 152, "deploy to 1 server") + pill("promote", 40, 176, 148, "1 min later: promote") + pill("rollback", 252, 176, 138, "alarm: roll back");
    return svg(440, 282, s);
  })();

  // scatter: one dot per hour, busy % against p99 (model: median = 20 / (1 - 0.9 u), p99 = 3.5 x median)
  const opsScatter = (() => {
    const X = (b) => 56 + b * 3.6, Y = (m) => 226 - m / 3;
    let s = ln(56, 226, 424, 226, { s: "var(--line-2)" }) + ln(56, 26, 56, 226, { s: "var(--line-2)" });
    [0, 25, 50, 75, 100].forEach((b) => (s += tx(X(b), 244, b + "%", { s: 11, c: "var(--text-dim)" })));
    [0, 200, 400, 600].forEach((m) => (s += tx(48, Y(m) + 4, m, { a: "end", s: 11, c: "var(--text-dim)" })));
    s += tx(240, 262, "how busy the servers were that hour", { s: 11, c: "var(--text-dim)" }) + tx(14, 126, "p99 (ms)", { s: 11, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 14 126)" `);
    s += ln(56, Y(300), 424, Y(300), { s: "var(--rose)", sw: 2, d: "6 4" }) + tx(62, Y(300) - 6, "goal 300 ms", { a: "start", c: "var(--rose-ink)", s: 12 });
    const D = [[25, 91], [40, 520], [50, 126], [62, 158], [72, 200], [80, 249], [88, 336], [94, 455]];
    D.forEach(([b, m], i) => (s += ci(X(b), Y(m), 8, { f: "var(--blue)", fo: 0.7, s: "var(--blue)", sw: 2.5 }) + `<circle data-pick="h${i + 1}" cx="${X(b)}" cy="${Y(m)}" r="15" fill="transparent" stroke="none" style="cursor:pointer"/>`));
    return svg(440, 270, s);
  })();

  B.add("ds-ops", [
    { type: "pick", q: "Each server handles 100 requests per second. The grid shows how busy each server is right now, with every server up. Traffic is 350 requests per second, and after ONE server dies the survivors must stay under 85% busy. Tap the smallest fleet that qualifies.",
      fig: opsHeat, a: "n6-350", hint: "After a failure, 350 is shared by one fewer server. Under 85% means under 85 req/s each.",
      why: "With 5 servers, losing one leaves 4 that share 350, so each runs at 87.5% busy, over the line. With 6 servers, losing one leaves 5 at 70% busy. The 70% shown in the grid today is the headroom you pay for, so that an ordinary fault stays a fault and never becomes a failure." },
    { type: "pick", q: "A teammate says: \"The median is under 150 ms in all three cases, so Snapbox is healthy at any of these loads.\" The goal is a p99 under 300 ms. Tap the panel that proves them wrong.",
      fig: opsPanels, a: "u95",
      why: "At 95% busy the median is still only 138 ms, but p99 is 483 ms, well past the 300 ms goal. Queues build at the busiest moments, and the slowest requests suffer first, so the median can look fine while one user in a hundred is already unhappy." },
    { type: "pick", q: "Version 2 of the app has a bug. It is rolled out to one more server every 10 minutes (one bar per server), and an alarm fires at minute 12. Tap every server that is running the buggy v2 at that moment.",
      fig: opsGantt, a: ["s1", "s2"],
      why: "Server 1 got v2 at minute 0 and server 2 at minute 10, so both are on v2 when the alarm fires. Servers 3 and 4 are still on v1, so half the fleet is untouched and can be kept as it is. Rolling out gradually turns a bad release into a small, catchable fault." },
    { type: "slider", q: "Six servers handle 100 requests per second each, and two of them have died (shown). The four survivors must stay under 85% busy. Roughly what is the most traffic the service can take?",
      fig: opsRack, min: 0, max: 600, step: 20, ans: 340, tol: 20, unit: " req/s", hint: "Four survivors, each allowed 85 req/s.",
      why: "Four servers at 85 requests per second each is 340. Capacity you only need when something breaks is still capacity you need: planning for two failures at once costs a third of the fleet." },
    { type: "pick", q: "A release pipeline runs a canary. The bug in v2 is a memory leak: a server crashes only after about 10 minutes of running it. Tap the arrow that lets this bug reach every server.",
      fig: opsFsm, a: "promote",
      why: "Promoting after one minute is far shorter than the time the leak needs to show itself, so the canary looks healthy and v2 goes everywhere. A canary only protects you if you watch it for longer than the bugs you fear take to appear." },
    { type: "pick", q: "Each dot is one hour of Snapbox traffic. For this system p99 climbs steadily as the servers get busier. Tap the hour where something other than load is the problem.",
      fig: opsScatter, a: "h2",
      why: "The hour at 40% busy has a p99 of about 520 ms, far above the other hours with similar load. Busy servers explain the two right-hand dots, but not this one. Look for a bad release, a failing disk or a slow dependency." },
    { type: "bug", q: "The team wants a warning BEFORE users get slow responses. Which line makes the warning fire too late?",
      code: ["goal_p99_ms: 300", "alert_busy_over_pct: 100", "rollout: one_server_first", "keep_spare_servers: 1"], a: 1,
      why: "In the ops room, p99 passes 300 ms at roughly 85% busy, and at 100% busy it is about 700 ms with timeouts close behind. An alert at 100% only fires once users are already suffering. Alert at around 80%." },
    { type: "match", q: "Match each dashboard reading in the ops room to the most likely cause.",
      pairs: [["Every server climbs to 95% busy and p99 rises with them", "Too little capacity for the traffic"], ["One server shows 0% busy while the others run hot", "A server has died or been pulled out"], ["All servers crash minutes after a deploy", "A correlated software fault"], ["Only the server with the new version shows errors", "A canary catching a bad release"]],
      why: "Shared load shows up on every server at once. A silent server means it is gone. A crash on every machine right after a deploy is the same bug on the same code. Errors confined to one server running new code are exactly what a canary is for." },
  ]);

  /* =====================================================================
     2.W  ds-querylab
     ===================================================================== */

  // Venn: who lives in York, who works at Acme (everyone else outside both)
  const qlVenn = (() => {
    const chip = (id, x, y, t) => pk(id, rc(x - 21, y - 14, 42, 28, { rx: 14, sw: 2.5 }) + tx(x, y + 5, t, { s: 13 }));
    let s = rc(4, 28, 372, 206, { sw: 2, s: "var(--line)", rx: 12 }) + tx(14, 46, "everyone", { a: "start", c: "var(--text-dim)", s: 12 });
    s += ci(130, 130, 80, { f: "var(--blue)", fo: 0.16, s: "var(--blue)" }) + ci(240, 130, 80, { f: "var(--amber)", fo: 0.16, s: "var(--amber)" });
    s += tx(110, 20, "lives in York", { s: 13, c: "var(--blue-ink)" }) + tx(270, 20, "works at Acme", { s: 13, c: "var(--amber-ink)" });
    s += chip("dee", 90, 130, "Dee") + chip("cy", 185, 130, "Cy") + chip("ana", 268, 100, "Ana") + chip("eli", 268, 160, "Eli") + chip("ben", 340, 208, "Ben");
    return svg(380, 240, s);
  })();

  // graph: friendships, hop by hop from Ana
  const qlGraph = (() => {
    const P = { Ana: [48, 100], Ben: [150, 42], Cy: [150, 158], Dee: [270, 42], Eli: [270, 158], Fay: [392, 42] };
    const E = [["Ana", "Ben"], ["Ana", "Cy"], ["Ben", "Dee"], ["Cy", "Dee"], ["Cy", "Eli"], ["Dee", "Fay"]];
    let s = E.map(([a, b]) => ln(...P[a], ...P[b], { s: "var(--line-2)", sw: 3 })).join("");
    Object.entries(P).forEach(([n, [x, y]]) => {
      s += n === "Ana" ? ci(x, y, 24, { f: "var(--violet)", fo: 0.3, s: "var(--violet)" }) + tx(x, y + 4, n) : ci(x, y, 24) + tx(x, y + 4, n);
      if (n !== "Ana") s += `<circle data-pick="${n.toLowerCase()}" cx="${x}" cy="${y}" r="27" fill="transparent" stroke="none" style="cursor:pointer"/>`;
    });
    s += tx(48, 140, "start", { s: 11, c: "var(--violet-ink)" });
    return svg(440, 200, s);
  })();

  // two pipelines as block chains, with the five-person chain underneath
  const qlPipes = (() => {
    const blk = (x, y, w, t, c) => rc(x, y, w, 30, { s: c, f: c, fo: 0.15, sw: 2.5, rx: 8 }) + tx(x + w / 2, y + 19, t, { s: 11 });
    const row = (y, lbl, start, n) => {
      let r = tx(6, y + 20, lbl, { a: "start", s: 14 }) + blk(24, y, 92, start, "var(--violet)");
      let x = 116;
      for (let i = 0; i < n; i++) { r += tx(x + 7, y + 20, "▸", { c: "var(--text-dim)" }) + blk(x + 14, y, 84, "Go to friends", "var(--amber)"); x += 98; }
      return r;
    };
    let s = row(8, "A", "Start: Ana", 3) + row(52, "B", "Start: everyone", 1);
    const P = ["Ana", "Ben", "Cy", "Dee", "Eli"];
    P.forEach((n, i) => { const x = 50 + i * 76; if (i) s += ln(x - 54, 118, x - 22, 118, { sw: 3 }); s += ci(x, 118, 22) + tx(x, 123, n, { s: 12.5 }); });
    s += tx(210, 160, "the five people, friends in a chain", { c: "var(--text-dim)", s: 12 });
    return svg(420, 168, s);
  })();

  // documents: five JSON-like cards
  const qlDocs = (() => {
    const D = [["Ana", ["Ben"]], ["Ben", ["Ana", "Cy"]], ["Cy", ["Ben", "Dee"]], ["Dee", ["Cy", "Eli"]], ["Eli", ["Dee"]]];
    let s = "";
    D.forEach(([n, f], i) => {
      const y = 6 + i * 46;
      s += rc(6, y, 428, 38, { sw: 2.5, rx: 8 }) + tx(20, y + 24, `{ "name": "${n}", "friends": [${f.map((x) => `"${x}"`).join(", ")}] }`, { a: "start", s: 15 });
      s += hit(n.toLowerCase(), 6, y, 428, 38, 8);
    });
    return svg(440, 238, s);
  })();

  // tree: how far a friendship search fans out
  const qlTree = (() => {
    let s = "";
    const lvl = [["hop 0", 28], ["hop 1", 92], ["hop 2", 156], ["hop 3", 220]];
    lvl.forEach(([t, y]) => (s += tx(8, y + 4, t, { a: "start", c: "var(--text-dim)", s: 12 })));
    s += ci(240, 28, 18, { f: "var(--violet)", fo: 0.3, s: "var(--violet)" }) + tx(240, 32, "Ana", { s: 11 });
    const x1 = [130, 240, 350];
    x1.forEach((x) => { s += ln(240, 46, x, 78) + ci(x, 92, 14); });
    const x2 = [];
    x1.forEach((x) => [-36, 0, 36].forEach((d) => x2.push(x + d)));
    x2.forEach((x, i) => { s += ln(x1[Math.floor(i / 3)], 106, x, 144) + ci(x, 156, 9); });
    x2.forEach((x) => [-9, 9].forEach((d) => (s += ln(x, 165, x + d, 205, { sw: 1.5, s: "var(--line)" }))));
    s += tx(300, 124, "× 100", { c: "var(--amber-ink)", a: "start", s: 13 }) + tx(398, 150, "× 100", { c: "var(--amber-ink)", a: "start", s: 13 }) + tx(418, 214, "× 100", { c: "var(--amber-ink)", a: "end", s: 13 });
    s += tx(432, 20, "each person has 100 friends, none shared", { c: "var(--text-dim)", s: 12, a: "end" });
    return svg(440, 236, s);
  })();

  // table plus two pipelines
  const qlTable = `${table(["name", "city", "works at", "friends with"], [["Ana", "Leeds", "Acme", "Ben"], ["Ben", "Leeds", "<b>Bolt</b>", "Ana, Cy"], ["Cy", "York", "Acme", "Ben, Dee"], ["Dee", "York", "<b>Bolt</b>", "Cy, Eli"], ["Eli", "Hull", "Acme", "Dee"]])}
    <div style="margin-top:10px;font:800 12px var(--sans);color:var(--text-dim)">Pipeline X</div>${chipH("Start: Ana", "var(--violet)")}${chipH("▸", "transparent")}${chipH("Works at Bolt", "var(--blue)")}${chipH("▸", "transparent")}${chipH("Go to friends", "var(--amber)")}
    <div style="margin-top:8px;font:800 12px var(--sans);color:var(--text-dim)">Pipeline Y</div>${chipH("Start: Ana", "var(--violet)")}${chipH("▸", "transparent")}${chipH("Go to friends", "var(--amber)")}${chipH("▸", "transparent")}${chipH("Works at Bolt", "var(--blue)")}`;

  B.add("ds-querylab", [
    { type: "pick", q: "The Venn diagram shows who lives in York and who works at Acme. A query starts with everyone, then chains <b>Works at Acme</b> followed by <b>City is York</b>. Tap everyone the FIRST filter throws out.",
      fig: qlVenn, a: ["ben", "dee"],
      why: "The first filter keeps only the Acme circle, so Ben and Dee, who are outside it, go. The second filter then removes Ana and Eli, leaving Cy. In the other order the filters remove different people at each step but the final answer is the same, because chained filters are an intersection." },
    { type: "pick", q: "Friendships are shown as lines. Start at Ana and press <b>Go to friends</b> twice. A hop only adds people not already reached. Tap everyone who first appears on the SECOND hop.",
      fig: qlGraph, a: ["dee", "eli"],
      why: "Hop 1 reaches Ben and Cy. Hop 2 reaches Dee, through either of them, and Eli through Cy. Ana is already known and Dee is added only once even though two paths lead to her. Fay would only appear on hop 3." },
    { type: "cat", q: "Five people are friends in a chain (Ana, Ben, Cy, Dee, Eli). A hop costs a self-join in tables, one document fetch for every person you start the hop from, and one edge hop in the graph. Which query is larger on each cost?",
      fig: qlPipes, buckets: ["Query A is larger", "Query B is larger"],
      items: [["Self-joins on the friendships table", 0], ["Extra documents fetched by your code", 1], ["Edge hops followed in the graph", 0], ["People a document hop starts from", 1]], hint: "Query B starts a single hop from all five people at once.",
      why: "Query A makes 3 hops, so 3 joins and 3 graph hops, but each hop starts from just one person, 3 fetches in total. Query B makes 1 hop from all 5 people, so only 1 join but 5 fetches. Documents pay per person you expand, tables per hop you write." },
    { type: "pick", q: "Each person is stored as a document that lists their friends. Ben and Cy stop being friends. Tap every document the application must change.",
      fig: qlDocs, a: ["ben", "cy"],
      why: "Each friendship is stored twice, once in each person's list, so ending one friendship means editing two documents, and forgetting one leaves them disagreeing. In a table it is one row to delete and in a graph one edge." },
    { type: "bug", q: "Five people are friends in a chain: Ana, Ben, Cy, Dee, Eli. Ana, Cy and Eli work at Acme. A hop adds only people not reached before. This trace of a query has one wrong step. Which line?",
      code: ["Start: Ana  ->  {Ana}", "Go to friends  ->  {Ben}", "Go to friends  ->  {Ana, Cy}", "Works at Acme  ->  {Ana, Cy}"], a: 2,
      why: "On the second hop Ana is already reached, so only Cy is new and the result is {Cy}. The Acme filter then correctly keeps Cy. The error in line 3 spreads into line 4, which looks right only because it follows the wrong input." },
    { type: "mcq", q: "Each person has 100 friends and nobody's friends overlap. The document model must fetch the document of every person at hop 2 to find the people at hop 3 (tree shown). Roughly how many fetches is that one step?",
      fig: qlTree, o: ["About 100", "About 10,000", "About 1,000,000", "About 100,000,000"], a: 1, hint: "People at hop 2 = 100 × 100.",
      why: "Hop 1 has 100 people and hop 2 has 100 × 100 = 10,000, so expanding hop 2 needs 10,000 document fetches, each a round trip from your own code. The frontier multiplies at every hop, which is why variable-depth relationship questions strain tables and documents." },
    { type: "cat", q: "Which data model fits each job best?", buckets: ["Tables", "Documents", "Graph"],
      items: [["Total sales per city per month over millions of rows", 0], ["Load a whole user profile, with settings and address, in one read", 1], ["Find the shortest chain of introductions between two strangers", 2], ["Join orders to customers, then group and add up", 0], ["Store records whose fields differ from one to the next", 1], ["Who bought what my friends' friends bought?", 2]],
      why: "Tables suit filtering, joining and aggregating many uniform rows. Documents suit self-contained records that are read and written whole. Graphs suit questions about how things connect, especially to unknown depth." },
    { type: "mcq", q: "Using the people and friendships in the table, which pipeline returns Ben?",
      fig: qlTable, o: ["Only pipeline Y", "Only pipeline X", "Both pipelines", "Neither pipeline"], a: 0,
      why: "Order matters between a filter and a hop. In X, filtering Ana for Bolt leaves nobody (she works at Acme), so the hop has nothing to start from. In Y the hop reaches Ben first, and the Bolt filter then keeps him. Two filters in a row can swap, but a hop changes who you are looking at." },
  ]);

  /* =====================================================================
     3.W  ds-engine
     ===================================================================== */

  // layers: memory, then segments newest to oldest
  const enLayers = (() => {
    const chip = (x, y, t, tomb) => rc(x, y, 104, 30, { sw: 2.2, rx: 7, s: tomb ? "var(--rose)" : "var(--line-2)", f: tomb ? "var(--rose)" : "var(--panel)", fo: tomb ? 0.14 : null, d: tomb ? "5 3" : null }) + tx(x + 52, y + 20, t, { s: 12 });
    const rows = [["mem", "Memtable", "in memory", [["date: v9"]]], ["s3", "Segment 3", "newest", [["apple: v5"], ["fig: deleted", 1]]], ["s2", "Segment 2", "", [["fig: v2"], ["kiwi: v3"]]], ["s1", "Segment 1", "oldest", [["apple: v1"], ["fig: v1"]]]];
    let s = "";
    rows.forEach(([id, a, b, cells], i) => {
      const y = 8 + i * 60;
      s += rc(4, y, 346, 52, { sw: 2, s: "var(--line)", rx: 10 }) + tx(14, y + 24, a, { a: "start", s: 13 }) + (b ? tx(14, y + 40, b, { a: "start", s: 11, c: "var(--text-dim)" }) : "");
      cells.forEach(([t, tomb], j) => (s += chip(122 + j * 112, y + 11, t, tomb)));
      s += hit(id, 4, y, 346, 52, 10);
    });
    return svg(354, 252, s);
  })();

  // sawtooth: segments on disk over 16 minutes
  const enSaw = (() => {
    const X = (m) => 50 + m * 23, Y = (n) => 224 - n * 28;
    const ev = [[2, 3], [4, 4], [6, 5], [8, 6], [9, 1], [10, 2], [12, 3], [14, 4], [16, 4]];
    let s = ln(50, 224, 420, 224, { s: "var(--line-2)" }) + ln(50, 20, 50, 224, { s: "var(--line-2)" });
    for (let m = 0; m <= 16; m += 2) s += tx(X(m), 242, m, { s: 11, c: "var(--text-dim)" });
    for (let n = 0; n <= 7; n++) s += tx(42, Y(n) + 4, n, { a: "end", s: 11, c: "var(--text-dim)" }) + (n ? ln(50, Y(n), 420, Y(n), { s: "var(--line)", sw: 1 }) : "");
    s += tx(235, 262, "minutes", { s: 11, c: "var(--text-dim)" }) + tx(12, 120, "segments on disk", { s: 11, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 12 120)" `);
    let d = `M ${X(0)} ${Y(2)}`;
    ev.forEach(([m, n]) => (d += ` H ${X(m)} V ${Y(n)}`));
    s += `<path d="${d}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    s += ln(X(15), 24, X(15), 224, { s: "var(--amber)", sw: 2.5, d: "6 4" }) + tx(X(15), 16, "read here", { c: "var(--amber-ink)" });
    s += tx(X(9) - 6, Y(3), "compaction", { a: "end", c: "var(--rose-ink)", s: 12 });
    return svg(440, 270, s);
  })();

  // swimlane: writes, the log, the disk, a power cut
  const enLanes = (() => {
    const W = [["fig"], ["kiwi"], ["date"], ["plum"], ["apple"], ["fig"]];
    const X = (i) => 62 + i * 58;
    let s = tx(4, 38, "writes", { a: "start", c: "var(--text-dim)", s: 11 }) + tx(4, 110, "log file", { a: "start", c: "var(--text-dim)", s: 11 }) + tx(4, 178, "disk", { a: "start", c: "var(--text-dim)", s: 11 });
    s += rc(56, 90, 2 * 58 - 2, 30, { f: "var(--teal)", fo: 0.3, s: "var(--teal)", sw: 2, rx: 6 }) + tx(56 + 56, 110, "log ON", { s: 12 });
    s += rc(56 + 2 * 58 + 2, 90, 4 * 58 - 8, 30, { f: "var(--rose)", fo: 0.25, s: "var(--rose)", sw: 2, rx: 6 }) + tx(56 + 2 * 58 + 2 + (4 * 58 - 8) / 2, 110, "log OFF", { s: 12 });
    s += rc(268, 160, 134, 30, { f: "var(--blue)", fo: 0.28, s: "var(--blue)", sw: 2, rx: 6 }) + tx(335, 180, "segment saved", { s: 12 });
    s += ln(268, 126, 268, 160, { s: "var(--blue)", sw: 2, d: "4 3" }) + tx(274, 143, "memtable full: flush", { a: "start", s: 11.5, c: "var(--blue-ink)" });
    W.forEach(([k], i) => (s += pk(`w${i + 1}`, rc(X(i) - 24, 16, 52, 40, { sw: 2.5, rx: 8 }) + tx(X(i) + 2, 32, `#${i + 1}`, { s: 10, c: "var(--text-dim)" }) + tx(X(i) + 2, 48, k, { s: 12 }))));
    s += ln(56 + 6 * 58 - 2, 12, 56 + 6 * 58 - 2, 200, { s: "var(--rose)", sw: 3, d: "6 4" }) + tx(56 + 6 * 58 - 2, 212, "power cut", { c: "var(--rose-ink)", a: "end" });
    return svg(440, 222, s);
  })();

  // sequence diagram: a risky write path
  const enSeq = (() => {
    const L = [["Client", 56], ["Engine", 160], ["Log (disk)", 272], ["Memtable (RAM)", 370]];
    let s = "";
    L.forEach(([t, x], i) => {
      const w = i === 3 ? 118 : 92;
      s += ln(x, 44, x, 222, { s: "var(--line)", sw: 2, d: "4 4" }) + rc(x - w / 2, 8, w, 32, { sw: 2.5, rx: 8 }) + tx(x, 28, t, { s: 13 });
    });
    const msg = (id, x1, x2, y, t, w) => arrow(x1, y, x2, y, { s: "var(--text)" }) + pk(id, rc((x1 + x2) / 2 - w / 2, y - 29, w, 24, { sw: 2.2, rx: 12 }) + tx((x1 + x2) / 2, y - 12, t, { s: 12.5 }));
    s += msg("m1", 56, 160, 78, "1 put fig=v9", 100) + msg("m2", 160, 56, 120, "2 ok, saved!", 98) + msg("m3", 160, 370, 162, "3 insert into memory", 164) + msg("m4", 160, 272, 204, "4 append", 84);
    return svg(440, 232, s);
  })();

  // tape: a run of writes
  const enTape = (() => {
    const K = ["fig", "kiwi", "kiwi", "fig", "date", "fig", "plum", "apple"];
    let s = tx(220, 14, "writes, in the order they arrive", { c: "var(--text-dim)", s: 12 });
    K.forEach((k, i) => {
      const x = 8 + i * 53;
      s += rc(x, 40, 49, 50, { sw: 2.5, rx: 8 }) + tx(x + 24.5, 36, i + 1, { s: 12, c: "var(--text-dim)" }) + tx(x + 24.5, 71, k, { s: 13.5 }) + hit(`w${i + 1}`, x, 40, 49, 50, 8);
    });
    s += tx(220, 112, "memtable: full at 4 different keys", { c: "var(--blue-ink)", s: 12.5 });
    return svg(440, 122, s);
  })();

  // strips: three segments before compaction
  const enStrips = (() => {
    const S = [["Segment 3", ["date: deleted", "fig: deleted", "kiwi: v9"]], ["Segment 2", ["apple: v5", "date: v6", "kiwi: v7", "plum: v8"]], ["Segment 1", ["apple: v1", "fig: v2", "kiwi: v3", "mango: v4"]]];
    let s = "";
    S.forEach(([n, cells], i) => {
      const y = 8 + i * 48;
      s += tx(4, y + 24, n, { a: "start", s: 11 });
      cells.forEach((c, j) => {
        const tomb = c.includes("deleted");
        s += rc(76 + j * 90, y + 4, 86, 34, { sw: 2.2, rx: 7, s: tomb ? "var(--rose)" : "var(--line-2)", f: tomb ? "var(--rose)" : "var(--panel)", fo: tomb ? 0.14 : null, d: tomb ? "5 3" : null }) + tx(76 + j * 90 + 43, y + 26, c, { s: 11.5 });
      });
    });
    s += tx(4, 160, "dashed red = a tombstone: a record that the key was deleted", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(440, 168, s);
  })();

  // bars: places checked per key
  const enBars = (() => {
    const K = [["apple", 3], ["date", 2], ["fig", 4], ["kiwi", 1], ["mango", 3], ["plum", 2]];
    let s = ln(10, 176, 430, 176, { s: "var(--line-2)" }) + tx(220, 14, "places checked by a read of each key", { c: "var(--text-dim)", s: 11 });
    K.forEach(([k, n], i) => {
      const x = 22 + i * 68, h = n * 34;
      s += rc(x, 176 - h, 48, h, { f: "var(--blue)", fo: 0.55, s: "var(--blue)", sw: 2.5, rx: 6 }) + tx(x + 24, 176 - h - 6, n, { s: 13 }) + tx(x + 24, 194, k, { s: 12 });
      s += hit(k, x - 6, 20, 60, 180, 8);
    });
    return svg(440, 204, s);
  })();

  B.add("ds-engine", [
    { type: "pick", q: "A read for <b>fig</b> checks memory first, then the segments from newest to oldest, and stops at the first layer that mentions the key. Tap the layer where this search stops.",
      fig: enLayers, a: "s3",
      why: "Memory has no fig, but Segment 3 holds a tombstone for it. That is the newest word on the key, so the read stops there and answers deleted. The older fig in Segment 2 and Segment 1 is hidden until compaction removes it for good." },
    { type: "mcq", q: "Each flush adds one segment on disk and one compaction merges all segments into one (chart). A read for a key that lives only in the oldest segment checks the memtable, then every segment, newest first. How many places does it check at minute 15? (Memory counts as one.)",
      fig: enSaw, o: ["3 places", "4 places", "5 places", "6 places"], a: 2, hint: "Read the height of the line at the dashed marker, then add one for memory.",
      why: "At minute 15 there are 4 segments (flushes at 10, 12 and 14 after the merge at 9), plus the memtable: 5 places. The saw-tooth is the cost of fast writes: reads slow down as segments pile up, and compaction pulls them back." },
    { type: "pick", q: "The memtable is flushed to a segment as soon as it holds 4 different keys, and a flush covers every write so far. The log was switched off after write 2. The machine then loses power. Tap every write that is lost for ever.",
      fig: enLanes, a: ["w5", "w6"],
      why: "Writes 3 and 4 were never logged, but write 4 filled the memtable, so the flush saved both to disk. Only writes 5 and 6 sat in memory with no log, so they are gone. Durability comes from either the log or a flush, and the log only matters for what has not been flushed." },
    { type: "bug", q: "Users keep seeing values that were overwritten days ago. Which line of the engine's settings explains it?",
      code: ["memtable_max_keys: 4", "log_before_ack: true", "read_segments: oldest_to_newest", "stop_at_first_match: true"], a: 2,
      why: "Stopping at the first match is right only when you look at the newest data first. Reading oldest to newest, the first match is the oldest copy of the key, which is the stale one. The newest value must win." },
    { type: "cat", q: "The three segments (shown) are merged into a single new segment, keeping the newest value for every key and dropping deleted keys. Sort each record: kept, dropped as overwritten, or dropped as deleted?",
      fig: enStrips, buckets: ["Kept", "Overwritten", "Deleted"],
      items: [["apple: v5 (Segment 2)", 0], ["apple: v1 (Segment 1)", 1], ["kiwi: v7 (Segment 2)", 1], ["date: v6 (Segment 2)", 2], ["mango: v4 (Segment 1)", 0], ["date tombstone (Segment 3)", 2]],
      why: "Kiwi has three copies, so only the newest (v9) survives. Date was deleted last, so both its value and the tombstone vanish. Apple v1 was overwritten by v5. The merged segment holds apple v5, kiwi v9, mango v4 and plum v8: four keys instead of eleven records." },
    { type: "pick", q: "The write path is drawn in a risky order: the engine says \"ok\" before it has saved anything safely. Power fails right after step 2. Tap the step that must happen BEFORE the ok to keep the write.",
      fig: enSeq, a: "m4",
      why: "Memory is wiped by a power cut, so inserting into the memtable (step 3) is not enough. The append to the log on disk is what survives, so it has to happen before the ok. Write-ahead means log first, acknowledge second." },
    { type: "pick", q: "The memtable flushes the moment it holds 4 different keys, and writing a key it already holds does not add a new one. Tap the write that triggers the first flush.",
      fig: enTape, a: "w7",
      why: "Counting different keys: fig (1), kiwi (2), date (3), then plum is the fourth at write 7. The repeats at writes 3, 4 and 6 only overwrite entries already in memory, so they never fill it. Updating hot keys is cheap for the memtable." },
    { type: "pick", q: "The bars show how many places a read of each key checks now: memory first, then the segments, newest to oldest. All segments on disk are then compacted into one. Tap every key whose read becomes cheaper.",
      fig: enBars, a: ["apple", "fig", "mango"], hint: "After compaction a disk read costs at most 2 places: memory, then the one segment.",
      why: "After compaction the most any key can cost is 2: memory, then the single merged segment. Apple (3), mango (3) and fig (4) all drop to 2. Kiwi is found in memory at 1 and date and plum at 2 already, so they stay as they are." },
  ]);

  /* =====================================================================
     1.1  ds-why
     ===================================================================== */

  // sequence: a write at London, a lag of 2 s, reads at two copies
  const whySeq = (() => {
    const Y = (t) => 66 + t * 48, xl = 58, xs = 322;
    let s = ln(xl, 38, xl, 268, { s: "var(--line)", sw: 2, d: "4 4" }) + ln(xs, 38, xs, 268, { s: "var(--line)", sw: 2, d: "4 4" });
    s += rc(xl - 54, 6, 108, 30, { sw: 2.5 }) + tx(xl, 26, "London copy", { s: 13 }) + rc(xs - 54, 6, 108, 30, { sw: 2.5 }) + tx(xs, 26, "Sydney copy", { s: 13 });
    s += tx(xl + 10, Y(0) - 8, "write: balance 60 (was 100)", { a: "start", s: 12, c: "var(--teal-ink)" });
    s += arrow(xl, Y(0), xs, Y(2), { s: "var(--teal)" }) + tx(250, Y(2) + 22, "copy lands at 2 s", { a: "end", s: 12, c: "var(--teal-ink)" });
    [["r1", 0.5, "read 0.5 s", 1], ["r2", 1, "read 1 s", 0], ["r3", 1.5, "read 1.5 s", 1], ["r4", 2.5, "read 2.5 s", 1], ["r5", 4, "read 4 s", 1]].forEach(([id, t, lbl, syd]) => {
      const px = syd ? xs + 8 : xl + 8;
      s += ln(syd ? xs : xl, Y(t), px, Y(t), { s: "var(--text-dim)", sw: 2 }) + pk(id, rc(px, Y(t) - 13, 88, 26, { sw: 2.2, rx: 13 }) + tx(px + 44, Y(t) + 5, lbl, { s: 12 }));
    });
    s += tx(14, 160, "time", { s: 12, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 14 160)" `) + arrow(24, 100, 24, 230, { s: "var(--text-dim)", sw: 1.5 });
    return svg(424, 276, s);
  })();

  // stacked bar: where one server's downtime comes from
  const whyStack = (() => {
    const S = [["disk dies", 4, "var(--rose)"], ["upgrade restarts", 10, "var(--amber)"], ["power cut", 3, "var(--violet)"], ["network outage", 2, "var(--blue)"], ["app bug crash", 5, "var(--teal)"]];
    const k = 16.4;
    let s = tx(220, 16, "one server in one building: hours of downtime in a year", { c: "var(--text-dim)", s: 11.5 });
    let x = 20;
    S.forEach(([t, h, c]) => { s += rc(x, 30, h * k, 44, { f: c, fo: 0.55, s: c, sw: 2.5, rx: 4 }) + tx(x + (h * k) / 2, 58, h + "h", { s: 13 }); x += h * k; });
    S.forEach(([t, h, c], i) => { const lx = 20 + (i % 2) * 210, ly = 104 + Math.floor(i / 2) * 26; s += rc(lx, ly - 11, 16, 16, { f: c, fo: 0.55, s: c, sw: 2, rx: 4 }) + tx(lx + 24, ly + 2, `${t}, ${h} h`, { a: "start", s: 12 }); });
    s += tx(220, 184, "total 24 hours a year", { c: "var(--text-dim)", s: 11.5 });
    return svg(440, 194, s);
  })();

  // scatter quadrant: harm of stale data against harm of waiting
  const whyScatter = (() => {
    const X = (v) => 52 + v * 37, Y = (v) => 244 - v * 22;
    let s = ln(52, 244, 424, 244, { s: "var(--line-2)" }) + ln(52, 24, 52, 244, { s: "var(--line-2)" });
    s += ln(X(0), Y(0), X(10), Y(10), { s: "var(--line-2)", sw: 2, d: "6 5" });
    s += tx(238, 270, "harm if a user sees slightly old data  →", { s: 11, c: "var(--text-dim)" }) + tx(12, 134, "harm if the app makes them wait  →", { s: 11, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 12 134)" `);
    [0, 5, 10].forEach((v) => (s += tx(X(v), 258, v === 0 ? "none" : v === 10 ? "huge" : "", { s: 10, c: "var(--text-dim)" })));
    const P = [["a", 1, 8.3, "like counter"], ["b", 9, 3, "bank transfer"], ["c", 2.1, 5.6, "online status"], ["d", 8, 5, "last flight seat"], ["e", 3.6, 7.2, "photo feed"], ["f", 6.5, 2, "medicine stock"]];
    P.forEach(([id, x, y, t]) => {
      const anchor = x > 6 ? "end" : "start", dx = x > 6 ? -14 : 14;
      s += pk(id, ci(X(x), Y(y), 8, { f: "var(--blue)", fo: 0.7, s: "var(--blue)" }) + tx(X(x) + dx, Y(y) + 4, t, { a: anchor, s: 12 }));
    });
    s += tx(100, 40, "wait hurts more", { s: 11, c: "var(--text-dim)", a: "start" }) + tx(420, 232, "stale hurts more", { s: 11, c: "var(--text-dim)", a: "end" });
    return svg(440, 276, s);
  })();

  B.add("ds-why", [
    { type: "pick", q: "A bank balance is changed in London and copied to Sydney, which takes 2 seconds. Reads happen at both places (drawn on a time line). Tap every read that returns the OLD balance of 100.",
      fig: whySeq, a: ["r1", "r3"],
      why: "The new balance only lands in Sydney at 2 seconds. Sydney's reads at 0.5 s and 1.5 s come before it, so they are stale. London already holds 60, so its read at 1 s is right, and Sydney is right from 2.5 s on. Stale reads are the price of answering from a copy that has not caught up." },
    { type: "slider", q: "Over a year, one server in one building is down for the 24 hours shown. A second identical server is added in the same building, behind a load balancer, and upgrades are done one server at a time. Roughly how many of the 24 hours disappear?",
      fig: whyStack, min: 0, max: 24, step: 1, ans: 14, tol: 2, unit: " hours", hint: "Which causes would the second server NOT share?",
      why: "A second server covers its own disk failing (4 h) and lets upgrades happen without downtime (10 h): 14 hours. The power cut, the network outage and the app bug hit both servers at the same time, so those 10 hours stay. Copies only help against faults they do not share." },
    { type: "pick", q: "Each dot is a feature that keeps copies of its data in two data centres. During a network split it must either answer from its own copy (availability) or refuse until the copies agree (consistency). Tap every feature that should choose availability.",
      fig: whyScatter, a: ["a", "c", "e"],
      why: "Points above the dashed line are where waiting hurts more than seeing slightly old data: a like counter, an online status and a photo feed. For a bank transfer, the last seat on a flight or medicine stock, a wrong answer costs more than a pause, so those should choose consistency." },
  ]);

  /* =====================================================================
     1.2  ds-blocks
     ===================================================================== */

  // tree: a sorted index of names
  const blkTree = (() => {
    const N = { M: [190, 34], F: [100, 100], S: [280, 100], C: [55, 170], H: [145, 170], P: [235, 170], V: [325, 170] };
    const E = [["M", "F"], ["M", "S"], ["F", "C"], ["F", "H"], ["S", "P"], ["S", "V"]];
    let s = E.map(([a, b]) => ln(N[a][0], N[a][1] + 16, N[b][0], N[b][1] - 16, { sw: 2.5 })).join("");
    Object.entries(N).forEach(([k, [x, y]]) => (s += pk(k.toLowerCase(), rc(x - 24, y - 17, 48, 34, { sw: 2.5, rx: 10 }) + tx(x, y + 5, k, { s: 14 }))));
    s += tx(190, 218, "left = earlier in the alphabet, right = later", { s: 12, c: "var(--text-dim)" });
    return svg(380, 228, s);
  })();

  // heat strip: requests per minute in 2-hour blocks
  const blkHeat = (() => {
    const V = [120, 40, 30, 260, 700, 650, 540, 480, 560, 820, 600, 300], T = (i) => `${String((i * 2) % 24).padStart(2, "0")}–${String((i * 2 + 2) % 24).padStart(2, "0")}`;
    let s = tx(220, 14, "requests per minute from users, in 2-hour blocks", { c: "var(--text-dim)", s: 11.5 });
    V.forEach((v, i) => {
      const x = 8 + (i % 6) * 71, y = 28 + Math.floor(i / 6) * 78;
      s += rc(x, y, 67, 66, { sw: 2, s: "var(--line)", rx: 8 }) + rc(x, y, 67, 66, { f: "var(--rose)", fo: +(0.08 + (v / 820) * 0.6).toFixed(2), s: "none", sw: 0, rx: 8 }) + tx(x + 33.5, y + 25, T(i), { s: 12 }) + tx(x + 33.5, y + 48, v, { s: 14 });
      s += hit(`b${i}`, x, y, 67, 66, 8);
    });
    return svg(440, 186, s);
  })();

  // small multiples: popularity of 20 items; the cache holds the top 2
  const blkPop = (() => {
    const zip = (s) => Array.from({ length: 20 }, (_, i) => Math.pow(i + 1, -s));
    const P = [["A", zip(1)], ["B", zip(0.5)], ["C", zip(0)]], w = 142;
    let s = "";
    P.forEach(([t, v], i) => {
      const x = 4 + i * (w + 4), mx = v[0], sh = (j) => (v[j] / mx) * 110;
      s += rc(x, 4, w, 190, { sw: 2, s: "var(--line)", rx: 10 }) + tx(x + w / 2, 24, "Panel " + t) + ln(x + 8, 160, x + w - 8, 160, { sw: 2 });
      v.forEach((_, j) => (s += `<rect x="${x + 9 + j * 6.4}" y="${160 - sh(j)}" width="5" height="${sh(j)}" rx="1.5" fill="${j < 2 ? "var(--teal)" : "var(--line-2)"}"/>`));
      s += tx(x + w / 2, 180, "requests per item", { s: 10.5, c: "var(--text-dim)" });
    });
    return svg(3 * (w + 4) + 4, 198, s);
  })();

  B.add("ds-blocks", [
    { type: "pick", q: "A sorted index stores names as a tree: at each node, go left for an earlier name and right for a later one. Tap every node examined while searching for <b>Q</b>, which is not in the index.",
      fig: blkTree, a: ["m", "s", "p"],
      why: "Q comes after M, so go right to S. Q is before S, so go left to P. Q comes after P, and nothing is to the right, so Q is not there. Three looks settled it, where a scan of all 7 names would take 7. Each step halves what is left, which is why indexes stay fast on a million records." },
    { type: "pick", q: "A nightly batch job needs 4 hours in a row and must finish before the 08:00 report. It competes with users, so it should run when they are quietest. Tap the block where it should START.",
      fig: blkHeat, a: "b1", hint: "Add up the two neighbouring blocks that make 4 hours, and look for the smallest total.",
      why: "Starting at 02:00 uses the 02–04 and 04–06 blocks, 40 + 30 requests per minute, the quietest pair, and it ends at 06:00. Starting at 00:00 would cross a busier 120 block, and 04:00 would run into the morning rise. Batch work runs on accumulated data, so it can wait for the quiet hours." },
    { type: "mcq", q: "Each panel shows how popular 20 items are (taller bar = more requests). A cache can hold only 2 items (the green bars, the most popular). Which workload does it help most?",
      fig: blkPop, o: ["Panel A: a few items take most requests", "Panel B: popularity falls away gently", "Panel C: every item is equally popular", "All three panels benefit the same"], a: 0,
      why: "A cache works because popularity is skewed. In Panel A the top two items draw about 42% of requests. In B it is about 22% and in C only 10%, no better than a random pick. If everything is equally popular, a small cache catches little." },
  ]);

  /* =====================================================================
     1.3  ds-reliability
     ===================================================================== */

  // racks: where do the copies of each shard live?
  const relRacks = (() => {
    const C = { A: "var(--violet)", B: "var(--blue)", C: "var(--amber)", D: "var(--teal)", E: "var(--rose)" };
    const R = [["Rack 1", ["A", "A", "B", "C"]], ["Rack 2", ["B", "D", "D", "E"]], ["Rack 3", ["C", "E", "E", "D"]]];
    let s = "";
    R.forEach(([t, sl], i) => {
      const x = 8 + i * 144, dead = i === 0;
      s += rc(x, 30, 136, 222, { sw: 2.5, rx: 12, s: dead ? "var(--rose)" : "var(--line-2)", d: dead ? "7 5" : null }) + tx(x + 68, 22, t + (dead ? "  ⚡ power cut" : ""), { c: dead ? "var(--rose-ink)" : "var(--text)" });
      sl.forEach((k, j) => (s += pk(k, rc(x + 14, 42 + j * 50, 108, 42, { f: C[k], fo: 0.35, s: C[k], sw: 2.5, rx: 8 }) + tx(x + 68, 69 + j * 50, "shard " + k, { s: 13 }))));
    });
    return svg(440, 260, s);
  })();

  // Gantt: a mirrored pair loses a disk and rebuilds
  const relGantt = (() => {
    const x0 = 64, k = 30;
    let s = "";
    [0, 2, 4, 6, 8, 10, 12].forEach((t) => (s += ln(x0 + t * k, 40, x0 + t * k, 158, { s: "var(--line)", sw: 1.5 }) + tx(x0 + t * k, 176, t, { s: 12, c: "var(--text-dim)" })));
    s += tx(x0 + 6 * k, 194, "hours since Disk A died", { s: 12, c: "var(--text-dim)" });
    s += tx(x0 - 8, 61, "Disk A", { a: "end", s: 13 }) + rc(x0, 44, 7 * k, 26, { f: "var(--amber)", fo: 0.4, s: "var(--amber)", sw: 2, rx: 5 }) + tx(x0 + 3.5 * k, 62, "rebuilding from B", { s: 12 }) + rc(x0 + 7 * k, 44, 5 * k, 26, { f: "var(--teal)", fo: 0.3, s: "var(--teal)", sw: 2, rx: 5 }) + tx(x0 + 9.5 * k, 62, "healthy again", { s: 12 });
    s += tx(x0 - 8, 101, "Disk B", { a: "end", s: 13 }) + rc(x0, 84, 12 * k, 26, { f: "var(--teal)", fo: 0.3, s: "var(--teal)", sw: 2, rx: 5 }) + tx(x0 + 6 * k, 102, "healthy so far", { s: 12 });
    s += tx(x0 - 8, 138, "dies here?", { a: "end", s: 12, c: "var(--rose-ink)" });
    [2, 5, 8, 11].forEach((t) => {
      const x = x0 + t * k;
      s += ln(x, 112, x, 124, { s: "var(--rose)", sw: 2, d: "3 3" }) + pk(`t${t}`, ci(x, 138, 14, { f: "var(--rose)", fo: 0.12, s: "var(--rose)", sw: 2.5 }) + xm(x, 138, 5));
    });
    return svg(440, 202, s);
  })();

  // DAG: who needs whom
  const relDag = (() => {
    const N = { Web: [220, 30], Cart: [120, 100], Search: [320, 100], StockDB: [60, 180], Auth: [210, 180], Index: [370, 180] };
    const E = [["Web", "Cart"], ["Web", "Search"], ["Cart", "Auth"], ["Cart", "StockDB"], ["Search", "Auth"], ["Search", "Index"]];
    let s = "";
    E.forEach(([a, b]) => (s += arrow(N[a][0], N[a][1] + 17, N[b][0], N[b][1] - 20, { s: "var(--text-dim)", sw: 2.2 })));
    Object.entries(N).forEach(([k, [x, y]]) => {
      const dead = k === "Auth";
      s += rc(x - 42, y - 17, 84, 34, { sw: 2.5, rx: 9, s: dead ? "var(--rose)" : "var(--line-2)", f: dead ? "var(--rose)" : "var(--panel)", fo: dead ? 0.25 : null }) + tx(x, y + 5, dead ? "Auth (down)" : k, { c: dead ? "var(--rose-ink)" : "var(--text)" });
    });
    s += tx(222, 224, "an arrow means: needs", { s: 11, c: "var(--text-dim)" });
    return svg(440, 234, s);
  })();

  B.add("ds-reliability", [
    { type: "pick", q: "Every shard of data has at least 2 copies, each in a slot of a rack. Rack 1 loses power (dashed). Tap the shard that becomes completely unavailable.",
      fig: relRacks, a: "A",
      why: "Both copies of shard A sit in Rack 1, so the power cut removes them together. Every other shard has a copy in another rack. Copies protect you only when their faults are independent, and a shared rack is a shared cause: spread the replicas." },
    { type: "pick", q: "Two disks mirror each other. Disk A dies at hour 0 and its replacement takes until hour 7 to be rebuilt from Disk B. Tap every moment at which Disk B dying would lose data.",
      fig: relGantt, a: ["t2", "t5"],
      why: "While the rebuild runs, Disk B holds the only copy, so a failure at hour 2 or 5 loses everything. By hour 8 the mirror is whole again and Disk B can die safely. A faster rebuild, or a third copy, shrinks the window in which one more ordinary fault becomes a failure." },
    { type: "cat", q: "Each arrow means \"needs\". Every dependency is a hard one. Auth has crashed. What happens to each of the other services?",
      fig: relDag, buckets: ["Still works", "Breaks too"],
      items: [["Web", 1], ["Cart", 1], ["Search", 1], ["StockDB", 0], ["Index", 0]],
      why: "Failure travels up the arrows: Cart and Search need Auth, and Web needs both of them, so all three break. StockDB and Index never depend on Auth, so they keep running. One small fault in a shared service can become a failure of the whole page, which is why optional dependencies should degrade gracefully." },
  ]);

  /* =====================================================================
     1.4  ds-load
     ===================================================================== */

  // CDF: share of requests finished within a time, for two services
  const loadCdf = (() => {
    const X = (ms) => 50 + ms * 0.185, Y = (p) => 240 - p * 2;
    const A = [[0, 0], [50, 22], [100, 50], [200, 76], [500, 90], [1000, 96], [1800, 99], [2000, 99.4]];
    const Bp = [[0, 0], [100, 4], [200, 24], [300, 50], [500, 90], [700, 99], [1000, 100], [2000, 100]];
    const path = (a) => a.map(([m, p], i) => `${i ? "L" : "M"} ${X(m).toFixed(1)} ${Y(p).toFixed(1)}`).join(" ");
    let s = ln(50, 240, 420, 240, { s: "var(--line-2)" }) + ln(50, 30, 50, 240, { s: "var(--line-2)" });
    [0, 500, 1000, 1500, 2000].forEach((m) => (s += tx(X(m), 258, m, { s: 12, c: "var(--text-dim)" })));
    [0, 50, 100].forEach((p) => (s += tx(42, Y(p) + 4, p + "%", { a: "end", s: 12, c: "var(--text-dim)" })));
    s += tx(235, 276, "response time (ms)", { s: 12, c: "var(--text-dim)" });
    s += ln(50, Y(99), 420, Y(99), { s: "var(--rose)", sw: 2, d: "6 4" }) + tx(414, Y(99) - 8, "99% of requests", { a: "end", s: 12, c: "var(--rose-ink)" });
    s += ln(X(1000), 30, X(1000), 240, { s: "var(--amber)", sw: 2.5, d: "6 4" }) + tx(X(1000) + 6, 226, "1 s limit", { a: "start", s: 12, c: "var(--amber-ink)" });
    s += pk("A", `<path d="${path(A)}" fill="none" stroke="var(--violet)" stroke-width="4" stroke-linejoin="round"/>` + rc(X(2000) - 66, Y(60), 62, 24, { sw: 2.2, rx: 12, s: "var(--violet)" }) + tx(X(2000) - 35, Y(60) + 16, "Service A", { s: 11.5 }));
    s += pk("B", `<path d="${path(Bp)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>` + rc(X(700) - 30, Y(30), 62, 24, { sw: 2.2, rx: 12, s: "var(--blue)" }) + tx(X(700) + 1, Y(30) + 16, "Service B", { s: 11.5 }));
    s += tx(14, 136, "share finished", { s: 12, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 14 136)" `);
    return svg(440, 284, s);
  })();

  // waterfall: one page, four backend calls (two chains)
  const loadFall = (() => {
    const x0 = 80, k = 0.85;
    let s = "";
    [0, 100, 200, 300, 400].forEach((t) => (s += ln(x0 + t * k, 30, x0 + t * k, 190, { s: "var(--line)", sw: 1.5 }) + tx(x0 + t * k, 206, t, { s: 11, c: "var(--text-dim)" })));
    s += tx(x0 + 200 * k, 224, "milliseconds", { s: 11, c: "var(--text-dim)" });
    const R = [["auth", "Auth", 0, 120, "var(--blue)"], ["profile", "Profile", 0, 300, "var(--violet)"], ["orders", "Orders", 120, 220, "var(--amber)"], ["recs", "Recs", 300, 380, "var(--teal)"]];
    R.forEach(([id, t, a, b, c], i) => {
      const y = 40 + i * 38;
      s += tx(x0 - 8, y + 17, t, { a: "end" }) + rc(x0 + a * k, y, (b - a) * k, 26, { f: c, fo: 0.45, s: c, sw: 2.2, rx: 5 }) + tx(x0 + ((a + b) / 2) * k, y + 17, `${b - a} ms`, { s: 11 });
      s += hit(id, 4, y - 5, 432, 36, 8);
    });
    s += `<path d="M ${x0 + 120 * k} 66 V 78 H ${x0 + 120 * k} V 116" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-dasharray="4 3"/>` + `<path d="M ${x0 + 300 * k} 92 V 104 V 154" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-dasharray="4 3"/>`;
    return svg(440, 232, s);
  })();

  // stacked bars: where the time goes at p50 and p99
  const loadStack = (() => {
    const S = [["network", "var(--blue)", 20, 25], ["waiting in a queue", "var(--amber)", 5, 400], ["app code", "var(--violet)", 30, 40], ["database", "var(--teal)", 25, 60]], k = 0.66;
    let s = "";
    [["typical request (p50)", 2], ["slowest 1 in 100 (p99)", 3]].forEach(([t, ix], r) => {
      const y = 28 + r * 70;
      s += tx(12, y - 8, t, { a: "start", s: 12 });
      let x = 12;
      S.forEach(([n, c, a, b]) => { const v = r ? b : a; s += rc(x, y, v * k, 34, { f: c, fo: 0.55, s: c, sw: 2, rx: 3 }); x += v * k; });
      s += tx(x + 8, y + 22, (r ? 525 : 80) + " ms", { a: "start", s: 13 });
    });
    S.forEach(([n, c], i) => { const lx = 12 + (i % 2) * 210, ly = 176 + Math.floor(i / 2) * 24; s += rc(lx, ly - 11, 16, 16, { f: c, fo: 0.55, s: c, sw: 2, rx: 4 }) + tx(lx + 24, ly + 2, n, { a: "start", s: 12 }); });
    return svg(440, 226, s);
  })();

  B.add("ds-load", [
    { type: "pick", q: "The promise is: \"at least 99% of requests finish within 1 second\". Each curve shows the share of requests finished by a given time. Tap the service that keeps the promise.",
      fig: loadCdf, a: "B",
      why: "Service B is at 99% by about 700 ms, inside the 1 s limit. Service A is quicker for the typical request (half done in 100 ms against 300 ms) but only 96% are done at 1 s, because its slowest few take almost 2 s. A promise about the tail needs the tail, not the median." },
    { type: "pick", q: "A page waits for all four backend calls (bars). Orders can only start once Auth has answered, and Recs once Profile has. Tap every call whose speed-up would make the page load sooner.",
      fig: loadFall, a: ["profile", "recs"],
      why: "The page is done when its longest chain finishes: Profile then Recs, 300 + 80 = 380 ms. Auth then Orders ends at 220 ms, which is not holding anything up, so speeding it up changes nothing. Look for the slowest chain, not the single biggest bar." },
    { type: "mcq", q: "The bars show where the time goes for a typical request and for the slowest 1 in 100. Which single change would shrink the 99th-percentile response the most?",
      fig: loadStack, o: ["Faster network links between regions", "Spare servers, so requests rarely queue", "A quicker database query plan", "Smaller JSON responses"], a: 1,
      why: "The slow requests are not slow because of their network, app or database work, which grow only a little. They are slow because they waited about 400 ms in a queue. Cutting the wait, by keeping servers less busy, fixes the tail; shaving the other parts barely touches it." },
  ]);

  /* =====================================================================
     1.5  ds-twitter
     ===================================================================== */

  // log-log scatter: followers against posts per day
  const twScatter = (() => {
    const X = (f) => 60 + 72 * (Math.log10(f) - 2), Y = (p) => 246 - 100 * Math.log10(p);
    let s = ln(60, 246, 420, 246, { s: "var(--line-2)" }) + ln(60, 40, 60, 246, { s: "var(--line-2)" });
    [["100", 2], ["1k", 3], ["10k", 4], ["100k", 5], ["1M", 6], ["10M", 7]].forEach(([t, e]) => (s += tx(X(Math.pow(10, e)), 264, t, { s: 11, c: "var(--text-dim)" })));
    [[1, "1"], [10, "10"], [100, "100"]].forEach(([p, t]) => (s += tx(52, Y(p) + 4, t, { a: "end", s: 11, c: "var(--text-dim)" })));
    s += tx(240, 282, "followers (each tick is 10 times more)", { s: 11, c: "var(--text-dim)" }) + tx(12, 140, "posts per day (log scale)", { s: 11, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 12 140)" `);
    s += ln(X(1e4), Y(100), X(1e6), Y(1), { s: "var(--rose)", sw: 2.5, d: "7 5" }) + tx(424, 104, "1 million writes a day", { a: "end", s: 12, c: "var(--rose-ink)" });
    const P = [["a", 200, 5, "Maya"], ["b", 5e4, 10, "BrightNews"], ["c", 2e6, 2, "StarCo"], ["d", 3e4, 80, "TickerBot"], ["e", 300, 40, "Sam"], ["f", 5e5, 1, "ClubFC"]];
    P.forEach(([id, f, p, t]) => {
      const x = X(f), y = Y(p), left = id === "b" || id === "f";
      s += pk(id, ci(x, y, 8, { f: "var(--blue)", fo: 0.7, s: "var(--blue)" }) + tx(x + (left ? -12 : 12), y + (id === "f" ? -8 : 4), t, { a: left ? "end" : "start", s: 12 }));
    });
    return svg(440, 292, s);
  })();

  // small multiples: posts and timeline reads per second, in three workloads
  const twPanels = (() => {
    const P = [["Panel X", 5, 300], ["Panel Y", 100, 10], ["Panel Z", 20, 20]], w = 140, k = 0.4;
    let s = "";
    P.forEach(([t, po, re], i) => {
      const x = 4 + i * (w + 4), base = 172;
      s += rc(x, 4, w, 208, { sw: 2, s: "var(--line)", rx: 10 }) + tx(x + w / 2, 24, t) + ln(x + 10, base, x + w - 10, base, { sw: 2 });
      s += rc(x + 26, base - po * k, 38, po * k, { f: "var(--violet)", fo: 0.55, s: "var(--violet)", sw: 2, rx: 4 }) + tx(x + 45, base - po * k - 6, po + "k", { s: 13 }) + tx(x + 45, base + 17, "posts/s", { s: 11.5, c: "var(--text-dim)" });
      s += rc(x + 84, base - re * k, 38, re * k, { f: "var(--amber)", fo: 0.55, s: "var(--amber)", sw: 2, rx: 4 }) + tx(x + 103, base - re * k - 6, re + "k", { s: 13 }) + tx(x + 103, base + 17, "reads/s", { s: 11.5, c: "var(--text-dim)" });
      s += hit(["x", "y", "z"][i], x, 4, w, 208, 10);
    });
    return svg(3 * (w + 4) + 4, 216, s);
  })();

  // Venn: followers of two accounts
  const twVenn = (() => {
    let s = ci(160, 110, 88, { f: "var(--violet)", fo: 0.14, s: "var(--violet)" }) + ci(280, 110, 88, { f: "var(--amber)", fo: 0.14, s: "var(--amber)" });
    s += tx(130, 14, "followers of Bob", { c: "var(--violet-ink)" }) + tx(310, 14, "followers of Cara", { c: "var(--amber-ink)" });
    const dot = (x, y) => ci(x, y, 9, { f: "var(--blue)", fo: 0.6, s: "var(--blue)", sw: 2 });
    [[110, 80], [110, 118], [125, 150]].forEach(([x, y]) => (s += dot(x, y)));
    [[220, 92], [220, 132]].forEach(([x, y]) => (s += dot(x, y)));
    [[320, 90], [335, 135]].forEach(([x, y]) => (s += dot(x, y)));
    s += tx(220, 212, "each dot is one user; Bob and Cara each post once", { s: 11.5, c: "var(--text-dim)" });
    return svg(440, 222, s);
  })();

  B.add("ds-twitter", [
    { type: "pick", q: "Fan-out on write does one cache write per follower for every post, so an account's daily cost is followers × posts per day. The dashed line marks 1 million writes a day (both axes are log scales). Tap every account whose cost is above that line.",
      fig: twScatter, a: ["c", "d"], hint: "Points to the right of the dashed line cost more than 1 million a day.",
      why: "StarCo has 2 million followers and posts twice: 4 million writes a day. TickerBot has only 30,000 followers but posts 80 times a day: 2.4 million. A bot can be as costly as a celebrity, so a hybrid scheme should choose by followers × posts, not by fame alone." },
    { type: "pick", q: "Merge-on-read costs 1 write per post and 100 fetches per timeline read. Fan-out-on-write costs 75 writes per post and 1 fetch per read. Each panel shows a workload (thousands per second). Tap the panel where merge-on-read is the cheaper choice.",
      fig: twPanels, a: "y", hint: "Work out each approach's total for Panel Y, then check Panel Z.",
      why: "In Panel Y there are ten times more posts than reads: merge-on-read costs about 1.1 million operations a second, fan-out about 7.5 million. Panel Z looks balanced but fan-out still wins slightly (1.5 against 2.0 million). Only when reads are rarer than posts does doing the work at read time pay off." },
    { type: "mcq", q: "Bob and Cara each post once. Under fan-out on write, each post is copied into the timeline cache of every follower (the diagram shows both followings). How many timeline-cache writes happen in total?",
      fig: twVenn, o: ["7 writes", "9 writes", "5 writes", "2 writes"], a: 1, hint: "Count the dots in each circle, then add the two circles.",
      why: "Bob has 5 followers and Cara has 4, so 5 + 4 = 9 writes. The 2 users who follow both get two writes, one per post, because the cost is counted per post and follower pair, not per user. The 7 would be the number of different users." },
  ]);

  /* =====================================================================
     1.6  ds-scaling
     ===================================================================== */

  // line plot: demand through a day
  const scDemand = (() => {
    const D = [100, 80, 70, 60, 60, 80, 150, 300, 450, 500, 480, 450, 500, 520, 480, 450, 500, 600, 750, 800, 700, 500, 300, 150];
    const X = (h) => 52 + h * 15.4, Y = (v) => 222 - v * 0.22;
    let s = ln(52, 222, 420, 222, { s: "var(--line-2)" }) + ln(52, 30, 52, 222, { s: "var(--line-2)" });
    [0, 6, 12, 18, 24].forEach((h) => (s += tx(X(h), 240, h + ":00", { s: 11, c: "var(--text-dim)" })));
    [0, 400, 800].forEach((v) => (s += tx(44, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-dim)" })));
    let d = `M ${X(0)} ${Y(0)}`;
    D.forEach((v, h) => (d += ` L ${X(h + 0.5).toFixed(1)} ${Y(v).toFixed(1)}`));
    d += ` L ${X(24)} ${Y(0)} Z`;
    s += `<path d="${d}" fill="var(--blue)" fill-opacity="0.3" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    s += ln(52, Y(800), 420, Y(800), { s: "var(--rose)", sw: 2.5, d: "7 5" }) + tx(414, Y(800) - 6, "one big machine, sized for the peak (800)", { a: "end", s: 11, c: "var(--rose-ink)" });
    s += tx(236, 258, "time of day", { s: 11, c: "var(--text-dim)" }) + tx(12, 126, "requests per second", { s: 11, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 12 126)" `);
    return svg(440, 266, s);
  })();

  // heat grid: load per node per hour
  const scHeat = (() => {
    const V = [[22, 25, 24, 23, 26, 24], [21, 24, 23, 22, 25, 23], [96, 99, 100, 100, 98, 100], [20, 22, 21, 24, 22, 23]];
    let s = tx(240, 13, "hour of the day", { c: "var(--text-dim)", s: 11.5 });
    ["9", "10", "11", "12", "13", "14"].forEach((h, j) => (s += tx(100 + j * 54 + 25, 32, h + ":00", { s: 11 })));
    V.forEach((row, i) => {
      s += tx(88, 58 + i * 36 + 4, `Node ${i + 1}`, { a: "end" });
      row.forEach((v, j) => (s += rc(100 + j * 54, 40 + i * 36, 50, 32, { sw: 2, s: "var(--line)", rx: 6 }) + rc(100 + j * 54, 40 + i * 36, 50, 32, { f: v > 90 ? "var(--rose)" : "var(--teal)", fo: v > 90 ? 0.55 : 0.2, s: "none", sw: 0, rx: 6 }) + tx(125 + j * 54, 61 + i * 36, v + "%")));
    });
    s += tx(220, 200, "% of each node's capacity in use", { s: 11.5, c: "var(--text-dim)" });
    return svg(440, 208, s);
  })();

  B.add("ds-scaling", [
    { type: "slider", q: "One big machine is bought for the peak (dashed line), and demand through the day is shown. Roughly what share of the big machine's capacity sits idle on average over the 24 hours?",
      fig: scDemand, min: 0, max: 100, step: 5, ans: 53, tol: 10, unit: "%", hint: "Most hours run at about 300 to 500, against a capacity of 800.",
      why: "Average demand is about 376 against a capacity of 800, so roughly half the machine is idle, all day, because it was sized for 8 pm. A fleet of small machines that grows and shrinks with demand (elasticity) pays for what is used. That is a cost argument for scaling out." },
    { type: "mcq", q: "A cluster stores customer data on 4 nodes, split by customer. The map shows how busy each node is across six hours. What does this pattern show, and what is the sensible fix?",
      fig: scHeat, o: ["A hot partition: split up the busy node's data", "Too few machines: add more nodes of the same kind", "A network fault: nodes 1, 2 and 4 get no traffic", "A new machine that will balance itself in time"], a: 0,
      why: "Nodes 1, 2 and 4 are only about a quarter busy, so capacity is not the problem. Node 3 is pinned near 100% hour after hour: one customer or key sends it most of the work. New nodes would get only the leftovers, so the busy partition itself has to be split across machines." },
    { type: "bug", q: "A web fleet is meant to scale with demand, but servers are added and removed over and over, every few minutes, wasting money and causing blips. Which line of the autoscaler's settings is the cause?",
      code: ["scale_out_when_cpu_over: 70", "scale_in_when_cpu_under: 70", "check_every_seconds: 10", "min_servers: 2"], a: 1,
      why: "When CPU passes 70% a server is added, which spreads the load and pushes CPU just below 70%, so the same rule removes it again. Scale in should trigger well below scale out, say under 30%, leaving a gap so the fleet settles instead of flapping." },
  ]);

  /* =====================================================================
     1.7  ds-maintain
     ===================================================================== */

  // two incident timelines
  const mtBars = (() => {
    const S = [["finding it", "var(--amber)"], ["working out why", "var(--blue)"], ["fixing it", "var(--teal)"]], k = 3.7;
    const I = [["Incident last year", [40, 30, 20]], ["Incident this year", [2, 25, 3]]];
    let s = "";
    I.forEach(([t, v], r) => {
      const y = 28 + r * 62;
      s += tx(12, y - 8, t, { a: "start", s: 12 });
      let x = 12;
      v.forEach((m, i) => { s += rc(x, y, m * k, 34, { f: S[i][1], fo: 0.55, s: S[i][1], sw: 2, rx: 3 }) + (m >= 8 ? tx(x + (m * k) / 2, y + 22, m + " min", { s: 11.5 }) : ""); x += m * k; });
      s += tx(x + 8, y + 22, `${v.reduce((a, b) => a + b)} min`, { a: "start", s: 13 });
    });
    S.forEach(([n, c], i) => { const lx = 12 + i * 142; s += rc(lx, 148, 16, 16, { f: c, fo: 0.55, s: c, sw: 2, rx: 4 }) + tx(lx + 22, 161, n, { a: "start", s: 12 }); });
    s += tx(12, 185, "2 min and 3 min are too thin to label inside the bars", { a: "start", s: 10.5, c: "var(--text-dim)" });
    return svg(440, 194, s);
  })();

  // dependency matrix: a filled cell means the ROW module calls the COLUMN module
  const mtMatrix = (() => {
    const M = ["Web", "Orders", "Users", "Billing", "DB"], D = { Web: ["Orders", "Users", "Billing"], Orders: ["Users", "DB"], Users: ["DB"], Billing: ["Orders", "DB"], DB: [] };
    const x0 = 84, y0 = 54, c = 62, r = 34;
    let s = tx(x0 + 2.5 * c, 14, "the module that is CALLED", { c: "var(--text-dim)", s: 11.5 });
    M.forEach((m, j) => (s += pk(m.toLowerCase(), rc(x0 + j * c + 3, 22, c - 6, 26, { sw: 2.2, rx: 8 }) + tx(x0 + j * c + c / 2, 40, m, { s: 12 }))));
    M.forEach((m, i) => {
      s += tx(x0 - 10, y0 + i * r + r / 2 + 4, m, { a: "end" });
      M.forEach((n, j) => {
        const on = D[m].includes(n);
        s += rc(x0 + j * c + 3, y0 + i * r + 3, c - 6, r - 6, { sw: 2, s: i === j ? "var(--line-2)" : "var(--line)", rx: 5, f: i === j ? "var(--bg-2)" : "var(--panel)" });
        if (on) s += rc(x0 + j * c + 3, y0 + i * r + 3, c - 6, r - 6, { f: "var(--amber)", fo: 0.55, s: "var(--amber)", sw: 2, rx: 5 }) + tx(x0 + j * c + c / 2, y0 + i * r + r / 2 + 5, "●", { s: 12 });
      });
    });
    s += tx(x0 - 10, 42, "caller ↓", { a: "end", s: 11.5, c: "var(--text-dim)" });
    return svg(440, 232, s);
  })();

  const mtTable = table(["Server", "What is special about it"], [["web-01", "Built from the standard image, restarts itself after a crash"], ["web-02", "Holds the only copy of the licence file, in one person's home folder"], ["batch-1", "The only box that can send invoices, because its IP address is whitelisted"], ["web-03", "Pulls its settings from the shared store when it starts"], ["db-2", "Settings tweaked by hand over SSH, with no copy kept anywhere"]]);

  B.add("ds-maintain", [
    { type: "mcq", q: "The bars show how two incidents' time was spent, before and after the team improved how it runs the system. Which improvement saved the most time?",
      fig: mtBars, o: ["Monitoring that alerts the team at once", "Scripts that make rollbacks repeatable", "Simpler code that is easier to follow", "Hand-written notes for each machine"], a: 0, hint: "Compare the saving in each colour: how many minutes did each phase shrink by?",
      why: "Finding the problem fell from 40 minutes to 2, a saving of 38. Fixing it fell from 20 to 3 (17 saved) and working out why only from 30 to 25. Operability starts with visibility: you cannot fix quickly what you have not noticed." },
    { type: "pick", q: "A filled cell means that the row's module calls the column's module. One module's interface is about to change, and every module that depends on it, directly or through others, must be retested. Tap the module whose change would affect the most others.",
      fig: mtMatrix, a: "db",
      why: "Orders, Users and Billing call DB directly, and Web calls all three, so all four other modules are affected. Changing Users reaches Web, Orders and Billing, but not DB. A module everyone leans on is the most expensive to change. Putting a clean abstraction in front of it is how you protect evolvability." },
    { type: "multi", q: "Operators want any machine to be replaceable by a fresh one in minutes, at 3 a.m. Which rows of the table would make that hard? Select all.",
      fig: mtTable, o: ["web-01", "web-02", "batch-1", "web-03", "db-2"], a: [1, 2, 4],
      why: "web-02's licence, batch-1's whitelisted address and db-2's hand-made settings each live in one machine only, so it cannot be swapped without losing something. web-01 and web-03 can be rebuilt from an image and a shared store. Operability means no dependency on individual machines." },
  ]);
})();

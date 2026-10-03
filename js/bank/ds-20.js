/* ===== bank-x-ds-1.js ===== */
/* Revision bank, third set of varied, visual questions (ds-1).
   Modules: the three workshops (ds-ops, ds-querylab, ds-engine) and the seven regular sessions.
   Every question stands on its own: the figure (or the question text) carries the data it needs.
   Numbers checked with node. Each figure kind is used once per module. */
(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});

  const B = NIC.bank;

  /* ---- tiny SVG helpers (theme tokens only) ---- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, t, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 12}px var(--sans);fill:${o.c || "var(--text)"}">${t}</text>`;
  const rc = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx === undefined ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" ${o.fo != null ? `fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2.5}" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2.5}" stroke-linecap="round" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const ci = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}" ${o.fo != null ? `fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2.5}"/>`;
  /* a transparent overlay that makes a region tappable (the highlight is its outline) */
  const hit = (id, x, y, w, h, rx = 8) =>
    `<rect data-pick="${id}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="transparent" stroke="none" style="cursor:pointer"/>`;
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;
  const arrow = (x1, y1, x2, y2, o = {}) => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      c = o.s || "var(--text-dim)",
      k = 8;
    const p = [
      [x2, y2],
      [x2 - k * Math.cos(a - 0.45), y2 - k * Math.sin(a - 0.45)],
      [x2 - k * Math.cos(a + 0.45), y2 - k * Math.sin(a + 0.45)],
    ]
      .map((q) => q.join(","))
      .join(" ");
    return (
      ln(x1, y1, x2 - 3 * Math.cos(a), y2 - 3 * Math.sin(a), { s: c, sw: o.sw || 2.5, d: o.d }) +
      `<polygon points="${p}" fill="${c}"/>`
    );
  };
  const xm = (x, y, r, c = "var(--rose)") =>
    ln(x - r, y - r, x + r, y + r, { s: c, sw: 3.5 }) + ln(x - r, y + r, x + r, y - r, { s: c, sw: 3.5 });
  const table = (head, rows) =>
    `<table class="t"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const chipH = (t, c) =>
    `<span style="display:inline-block;margin:2px 4px 2px 0;padding:3px 9px;border:2px solid ${c || "var(--line-2)"};border-radius:10px;font:800 12px var(--sans);background:var(--panel)">${t}</span>`;

  /* =====================================================================
     1.W  ds-ops
     ===================================================================== */

  // heat grid: how busy each server is NOW, by fleet size and traffic
  const opsHeat = (() => {
    const loads = [150, 250, 350, 450],
      ns = [3, 4, 5, 6, 7],
      x0 = 86,
      y0 = 40,
      cw = 68,
      ch = 34;
    let s = tx(x0 + 2 * cw, 13, "traffic, requests per second", { c: "var(--text-dim)" });
    loads.forEach((l, j) => (s += tx(x0 + j * cw + cw / 2, 33, l)));
    ns.forEach((n, i) => {
      s += tx(x0 - 10, y0 + i * ch + ch / 2 + 4, `${n} servers`, { a: "end" });
      loads.forEach((l, j) => {
        const p = Math.round((l / (100 * n)) * 100),
          col = p >= 100 ? "var(--rose)" : p >= 85 ? "var(--amber)" : "var(--teal)",
          op = p >= 100 ? 0.55 : p >= 85 ? 0.5 : p >= 50 ? 0.34 : 0.16;
        s +=
          rc(x0 + j * cw + 2, y0 + i * ch + 2, cw - 4, ch - 4, { rx: 6, s: "var(--line)", sw: 2 }) +
          rc(x0 + j * cw + 2, y0 + i * ch + 2, cw - 4, ch - 4, { rx: 6, f: col, fo: op, s: "none", sw: 0 }) +
          tx(x0 + j * cw + cw / 2, y0 + i * ch + ch / 2 + 4, p + "%");
        s += hit(`n${n}-${l}`, x0 + j * cw + 2, y0 + i * ch + 2, cw - 4, ch - 4, 6);
      });
    });
    return svg(x0 + 4 * cw + 6, y0 + 5 * ch + 6, s);
  })();

  // small multiples: median vs p99 at three busy levels (model: median = 20 / (1 - 0.9 u), p99 = 3.5 x median)
  const opsPanels = (() => {
    const P = [
        ["50% busy", 36, 126],
        ["80% busy", 71, 249],
        ["95% busy", 138, 483],
      ],
      k = 0.24,
      base = 178,
      w = 140;
    let s = "";
    P.forEach(([t, m, p], i) => {
      const x = 4 + i * (w + 4);
      s += rc(x, 4, w, 206, { sw: 2, s: "var(--line)" }) + tx(x + w / 2, 24, t, { s: 13 });
      s += ln(x + 10, base, x + w - 10, base, { s: "var(--line-2)", sw: 2 });
      s +=
        ln(x + 8, base - 300 * k, x + w - 8, base - 300 * k, { s: "var(--rose)", sw: 2, d: "5 4" }) +
        tx(x + 10, base - 300 * k - 5, "goal 300", { a: "start", s: 12, c: "var(--rose-ink)" });
      s +=
        rc(x + 26, base - m * k, 34, m * k, { f: "var(--teal)", fo: 0.6, s: "var(--teal)", sw: 2, rx: 4 }) +
        tx(x + 43, base - m * k - 5, m, { s: 13 }) +
        tx(x + 43, base + 17, "median", { s: 12, c: "var(--text-dim)" });
      s +=
        rc(x + 82, base - p * k, 34, p * k, { f: "var(--blue)", fo: 0.6, s: "var(--blue)", sw: 2, rx: 4 }) +
        tx(x + 99, base - p * k + 16, p, { s: 13 }) +
        tx(x + 99, base + 17, "p99", { s: 12, c: "var(--text-dim)" });
      s += hit(`u${[50, 80, 95][i]}`, x, 4, w, 206, 10);
    });
    return svg(3 * (w + 4) + 4, 214, s);
  })();

  // Gantt: a staged rollout, one more server every 10 minutes
  const opsGantt = (() => {
    const x0 = 66,
      k = 8.5,
      t0 = [0, 10, 20, 30];
    let s = "";
    [0, 10, 20, 30, 40].forEach(
      (t) =>
        (s +=
          ln(x0 + t * k, 34, x0 + t * k, 188, { s: "var(--line)", sw: 1.5 }) +
          tx(x0 + t * k, 204, t, { s: 11, c: "var(--text-dim)" })),
    );
    s += tx(x0 + 20 * k, 222, "minutes since the rollout began", { s: 11, c: "var(--text-dim)" });
    t0.forEach((t, i) => {
      const y = 44 + i * 36;
      s += tx(x0 - 8, y + 16, `Server ${i + 1}`, { a: "end" });
      if (t)
        s +=
          rc(x0, y, t * k, 24, { f: "var(--blue)", fo: 0.3, s: "var(--blue)", sw: 2, rx: 5 }) +
          (t >= 10 ? tx(x0 + (t * k) / 2, y + 16, "v1", { s: 11 }) : "");
      s +=
        rc(x0 + t * k, y, (40 - t) * k, 24, { f: "var(--rose)", fo: 0.45, s: "var(--rose)", sw: 2, rx: 5 }) +
        tx(x0 + t * k + ((40 - t) * k) / 2, y + 16, "v2", { s: 11 });
      s += hit(`s${i + 1}`, 4, y - 5, 432, 34, 8);
    });
    s +=
      ln(x0 + 12 * k, 30, x0 + 12 * k, 190, { s: "var(--amber)", sw: 3, d: "6 4" }) +
      tx(x0 + 12 * k, 22, "alarm at minute 12", { c: "var(--amber-ink)" });
    return svg(440, 230, s);
  })();

  // rack: six servers, two down
  const opsRack = (() => {
    let s =
      rc(6, 20, 428, 96, { sw: 2.5, s: "var(--line-2)", rx: 12 }) +
      tx(220, 14, "the fleet: each server handles 100 requests per second", { c: "var(--text-dim)", s: 12 });
    for (let i = 0; i < 6; i++) {
      const x = 18 + i * 68,
        dead = i === 1 || i === 4;
      s +=
        rc(x, 34, 58, 66, {
          s: dead ? "var(--rose)" : "var(--teal)",
          f: dead ? "var(--rose)" : "var(--teal)",
          fo: 0.16,
          sw: 2.5,
          rx: 8,
        }) + tx(x + 29, 62, dead ? "down" : "100", { c: dead ? "var(--rose-ink)" : "var(--text)" });
      s += dead ? xm(x + 29, 80, 8) : tx(x + 29, 82, "req/s", { s: 11, c: "var(--text-dim)" });
    }
    return svg(440, 126, s);
  })();

  // state machine: a canary pipeline
  const opsFsm = (() => {
    const box = (x, y, w, a, b, c) =>
      rc(x, y, w, 44, { s: c, f: c, fo: 0.14, sw: 2.5, rx: 10 }) +
      tx(x + w / 2, y + 19, a) +
      tx(x + w / 2, y + 35, b, { s: 11, c: "var(--text-dim)" });
    let s = box(110, 6, 220, "v1 on all 4 servers", "everything is fine", "var(--blue)");
    s +=
      arrow(220, 50, 220, 104) + box(110, 104, 220, "canary: v2 on 1 of 4", "the other 3 stay on v1", "var(--amber)");
    s += arrow(170, 148, 100, 230) + arrow(270, 148, 340, 230);
    s +=
      box(10, 232, 180, "v2 on all 4 servers", "bug now everywhere", "var(--rose)") +
      box(250, 232, 180, "back to v1", "rolled back", "var(--teal)");
    const pill = (id, x, y, w, t) => pk(id, rc(x, y, w, 26, { sw: 2.5, rx: 13 }) + tx(x + w / 2, y + 17, t, { s: 12 }));
    s +=
      pill("deploy", 232, 66, 152, "deploy to 1 server") +
      pill("promote", 40, 176, 148, "1 min later: promote") +
      pill("rollback", 252, 176, 138, "alarm: roll back");
    return svg(440, 282, s);
  })();

  // scatter: one dot per hour, busy % against p99 (model: median = 20 / (1 - 0.9 u), p99 = 3.5 x median)
  const opsScatter = (() => {
    const X = (b) => 56 + b * 3.6,
      Y = (m) => 226 - m / 3;
    let s = ln(56, 226, 424, 226, { s: "var(--line-2)" }) + ln(56, 26, 56, 226, { s: "var(--line-2)" });
    [0, 25, 50, 75, 100].forEach((b) => (s += tx(X(b), 244, b + "%", { s: 11, c: "var(--text-dim)" })));
    [0, 200, 400, 600].forEach((m) => (s += tx(48, Y(m) + 4, m, { a: "end", s: 11, c: "var(--text-dim)" })));
    s +=
      tx(240, 262, "how busy the servers were that hour", { s: 11, c: "var(--text-dim)" }) +
      tx(14, 126, "p99 (ms)", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 14 126)" `,
      );
    s +=
      ln(56, Y(300), 424, Y(300), { s: "var(--rose)", sw: 2, d: "6 4" }) +
      tx(62, Y(300) - 6, "goal 300 ms", { a: "start", c: "var(--rose-ink)", s: 12 });
    const D = [
      [25, 91],
      [40, 520],
      [50, 126],
      [62, 158],
      [72, 200],
      [80, 249],
      [88, 336],
      [94, 455],
    ];
    D.forEach(
      ([b, m], i) =>
        (s +=
          ci(X(b), Y(m), 8, { f: "var(--blue)", fo: 0.7, s: "var(--blue)", sw: 2.5 }) +
          `<circle data-pick="h${i + 1}" cx="${X(b)}" cy="${Y(m)}" r="15" fill="transparent" stroke="none" style="cursor:pointer"/>`),
    );
    return svg(440, 270, s);
  })();

  B.add("ds-ops", [
    {
      type: "pick",
      q: "Each server handles 100 requests per second. The grid shows how busy each server is right now, with every server up. Traffic is 350 requests per second, and after ONE server dies the survivors must stay under 85% busy. Tap the smallest fleet that qualifies.",
      fig: opsHeat,
      a: "n6-350",
      hint: "After a failure, 350 is shared by one fewer server. Under 85% means under 85 req/s each.",
      why: "With 5 servers, losing one leaves 4 that share 350, so each runs at 87.5% busy, over the line. With 6 servers, losing one leaves 5 at 70% busy. The 70% shown in the grid today is the headroom you pay for, so that an ordinary fault stays a fault and never becomes a failure.",
    },
    {
      type: "pick",
      q: 'A teammate says: "The median is under 150 ms in all three cases, so Snapbox is healthy at any of these loads." The goal is a p99 under 300 ms. Tap the panel that proves them wrong.',
      fig: opsPanels,
      a: "u95",
      why: "At 95% busy the median is still only 138 ms, but p99 is 483 ms, well past the 300 ms goal. Queues build at the busiest moments, and the slowest requests suffer first, so the median can look fine while one user in a hundred is already unhappy.",
    },
    {
      type: "pick",
      q: "Version 2 of the app has a bug. It is rolled out to one more server every 10 minutes (one bar per server), and an alarm fires at minute 12. Tap every server that is running the buggy v2 at that moment.",
      fig: opsGantt,
      a: ["s1", "s2"],
      why: "Server 1 got v2 at minute 0 and server 2 at minute 10, so both are on v2 when the alarm fires. Servers 3 and 4 are still on v1, so half the fleet is untouched and can be kept as it is. Rolling out gradually turns a bad release into a small, catchable fault.",
    },
    {
      type: "slider",
      q: "Six servers handle 100 requests per second each, and two of them have died (shown). The four survivors must stay under 85% busy. Roughly what is the most traffic the service can take?",
      fig: opsRack,
      min: 0,
      max: 600,
      step: 20,
      ans: 340,
      tol: 20,
      unit: " req/s",
      hint: "Four survivors, each allowed 85 req/s.",
      why: "Four servers at 85 requests per second each is 340. Capacity you only need when something breaks is still capacity you need: planning for two failures at once costs a third of the fleet.",
    },
    {
      type: "pick",
      q: "A release pipeline runs a canary. The bug in v2 is a memory leak: a server crashes only after about 10 minutes of running it. Tap the arrow that lets this bug reach every server.",
      fig: opsFsm,
      a: "promote",
      why: "Promoting after one minute is far shorter than the time the leak needs to show itself, so the canary looks healthy and v2 goes everywhere. A canary only protects you if you watch it for longer than the bugs you fear take to appear.",
    },
    {
      type: "pick",
      q: "Each dot is one hour of Snapbox traffic. For this system p99 climbs steadily as the servers get busier. Tap the hour where something other than load is the problem.",
      fig: opsScatter,
      a: "h2",
      why: "The hour at 40% busy has a p99 of about 520 ms, far above the other hours with similar load. Busy servers explain the two right-hand dots, but not this one. Look for a bad release, a failing disk or a slow dependency.",
    },
    {
      type: "bug",
      q: "The team wants a warning BEFORE users get slow responses. Which line makes the warning fire too late?",
      code: ["goal_p99_ms: 300", "alert_busy_over_pct: 100", "rollout: one_server_first", "keep_spare_servers: 1"],
      a: 1,
      why: "In the ops room, p99 passes 300 ms at roughly 85% busy, and at 100% busy it is about 700 ms with timeouts close behind. An alert at 100% only fires once users are already suffering. Alert at around 80%.",
    },
    {
      type: "match",
      q: "Match each dashboard reading in the ops room to the most likely cause.",
      pairs: [
        ["Every server climbs to 95% busy and p99 rises with them", "Too little capacity for the traffic"],
        ["One server shows 0% busy while the others run hot", "A server has died or been pulled out"],
        ["All servers crash minutes after a deploy", "A correlated software fault"],
        ["Only the server with the new version shows errors", "A canary catching a bad release"],
      ],
      why: "Shared load shows up on every server at once. A silent server means it is gone. A crash on every machine right after a deploy is the same bug on the same code. Errors confined to one server running new code are exactly what a canary is for.",
    },
  ]);

  /* =====================================================================
     2.W  ds-querylab
     ===================================================================== */

  // Venn: who lives in York, who works at Acme (everyone else outside both)
  const qlVenn = (() => {
    const chip = (id, x, y, t) => pk(id, rc(x - 21, y - 14, 42, 28, { rx: 14, sw: 2.5 }) + tx(x, y + 5, t, { s: 13 }));
    let s =
      rc(4, 28, 372, 206, { sw: 2, s: "var(--line)", rx: 12 }) +
      tx(14, 46, "everyone", { a: "start", c: "var(--text-dim)", s: 12 });
    s +=
      ci(130, 130, 80, { f: "var(--blue)", fo: 0.16, s: "var(--blue)" }) +
      ci(240, 130, 80, { f: "var(--amber)", fo: 0.16, s: "var(--amber)" });
    s +=
      tx(110, 20, "lives in York", { s: 13, c: "var(--blue-ink)" }) +
      tx(270, 20, "works at Acme", { s: 13, c: "var(--amber-ink)" });
    s +=
      chip("dee", 90, 130, "Dee") +
      chip("cy", 185, 130, "Cy") +
      chip("ana", 268, 100, "Ana") +
      chip("eli", 268, 160, "Eli") +
      chip("ben", 340, 208, "Ben");
    return svg(380, 240, s);
  })();

  // graph: friendships, hop by hop from Ana
  const qlGraph = (() => {
    const P = { Ana: [48, 100], Ben: [150, 42], Cy: [150, 158], Dee: [270, 42], Eli: [270, 158], Fay: [392, 42] };
    const E = [
      ["Ana", "Ben"],
      ["Ana", "Cy"],
      ["Ben", "Dee"],
      ["Cy", "Dee"],
      ["Cy", "Eli"],
      ["Dee", "Fay"],
    ];
    let s = E.map(([a, b]) => ln(...P[a], ...P[b], { s: "var(--line-2)", sw: 3 })).join("");
    Object.entries(P).forEach(([n, [x, y]]) => {
      s +=
        n === "Ana"
          ? ci(x, y, 24, { f: "var(--violet)", fo: 0.3, s: "var(--violet)" }) + tx(x, y + 4, n)
          : ci(x, y, 24) + tx(x, y + 4, n);
      if (n !== "Ana")
        s += `<circle data-pick="${n.toLowerCase()}" cx="${x}" cy="${y}" r="27" fill="transparent" stroke="none" style="cursor:pointer"/>`;
    });
    s += tx(48, 140, "start", { s: 11, c: "var(--violet-ink)" });
    return svg(440, 200, s);
  })();

  // two pipelines as block chains, with the five-person chain underneath
  const qlPipes = (() => {
    const blk = (x, y, w, t, c) =>
      rc(x, y, w, 30, { s: c, f: c, fo: 0.15, sw: 2.5, rx: 8 }) + tx(x + w / 2, y + 19, t, { s: 11 });
    const row = (y, lbl, start, n) => {
      let r = tx(6, y + 20, lbl, { a: "start", s: 14 }) + blk(24, y, 92, start, "var(--violet)");
      let x = 116;
      for (let i = 0; i < n; i++) {
        r += tx(x + 7, y + 20, "▸", { c: "var(--text-dim)" }) + blk(x + 14, y, 84, "Go to friends", "var(--amber)");
        x += 98;
      }
      return r;
    };
    let s = row(8, "A", "Start: Ana", 3) + row(52, "B", "Start: everyone", 1);
    const P = ["Ana", "Ben", "Cy", "Dee", "Eli"];
    P.forEach((n, i) => {
      const x = 50 + i * 76;
      if (i) s += ln(x - 54, 118, x - 22, 118, { sw: 3 });
      s += ci(x, 118, 22) + tx(x, 123, n, { s: 12.5 });
    });
    s += tx(210, 160, "the five people, friends in a chain", { c: "var(--text-dim)", s: 12 });
    return svg(420, 168, s);
  })();

  // documents: five JSON-like cards
  const qlDocs = (() => {
    const D = [
      ["Ana", ["Ben"]],
      ["Ben", ["Ana", "Cy"]],
      ["Cy", ["Ben", "Dee"]],
      ["Dee", ["Cy", "Eli"]],
      ["Eli", ["Dee"]],
    ];
    let s = "";
    D.forEach(([n, f], i) => {
      const y = 6 + i * 46;
      s +=
        rc(6, y, 428, 38, { sw: 2.5, rx: 8 }) +
        tx(20, y + 24, `{ "name": "${n}", "friends": [${f.map((x) => `"${x}"`).join(", ")}] }`, { a: "start", s: 15 });
      s += hit(n.toLowerCase(), 6, y, 428, 38, 8);
    });
    return svg(440, 238, s);
  })();
  Object.assign(partScope, { arrow, chipH, ci, hit, ln, pk, qlDocs, qlGraph, qlPipes, qlVenn, rc, svg, table, tx, xm });
})();

/* ALGO revision bank, third set of varied, visual questions (part 1).
   Workshops (a1-code, a2-watch, a2-code) plus Phase 1 (anatomy, big-O, surfer, PageRank), Dijkstra, A*, routing, linear programming.
   Every number was checked by running the real algorithm in node or Python; the figures are drawn from the same data. */
(function () {
  const B = NIC.bank;

  /* ---------- small SVG helpers (all colours come from theme tokens) ---------- */
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const SVG = (w, h, body, label) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px" role="img" aria-label="${label || "Diagram"}">${body}</svg>`;
  const R = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.op ? ` fill-opacity="${o.op}"` : ""}/>`;
  const C = (x, y, r, o = {}) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 3}"${o.op ? ` fill-opacity="${o.op}"` : ""}${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const L = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""} stroke-linecap="round"/>`;
  const P = (d, o = {}) => `<path d="${d}" fill="${o.fill || "none"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""} stroke-linecap="round" stroke-linejoin="round"${o.mk ? ` marker-end="url(#${o.mk})"` : ""}/>`;
  const hit = (x, y, w, h, rx = 10) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="transparent" stroke="none"/>`;
  const pk = (id, shape) => `<g data-pick="${id}">${shape}</g>`;
  const arrowDef = (id, col = "var(--text-faint)") => `<defs><marker id="${id}" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2,2 L10,6 L2,10" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`;
  const ink = (n) => `var(--${n}-ink)`;
  const tint = (n) => `var(--${n}-dim)`;
  const col = (n) => `var(--${n})`;
  const codeBox = (lines) => `<div style="font:700 13px var(--mono);background:var(--bg-2);border:2px solid var(--line);border-radius:12px;padding:8px 12px;margin-bottom:8px;white-space:pre;overflow-x:auto">${lines.join("\n")}</div>`;
  /** A coloured circle node: label inside, optional small caption underneath. */
  const node = (x, y, label, o = {}) => C(x, y, o.r || 19, { fill: o.fill ? tint(o.fill) : "var(--panel)", stroke: o.stroke ? col(o.stroke) : "var(--line-2)" }) + T(x, y + 5, label, { sz: o.sz || 15, c: "var(--ink)", w: 900 }) + (o.cap != null ? T(x, y + (o.r || 19) + 15, o.cap, { sz: 13, c: o.capc || "var(--text)" }) : "");
  /** A weight pill on the midpoint of an edge. */
  const wpill = (x, y, s) => R(x - 13, y - 11, 26, 22, { rx: 8, sw: 2 }) + T(x, y + 5, s, { sz: 13 });

  /* =====================================================================
     a1-code  (PageRank code lab)
     ===================================================================== */
  // 1. trace panel: one row of a hand trace is wrong
  const codeTrace = (() => {
    const rows = [
      ["rowA", "A", "1/3", "2 links", "sends 0.333 down each"],
      ["rowB", "B", "1/3", "1 link", "sends 0.333 down it"],
      ["rowC", "C", "1/3", "1 link", "sends 0.333 down it"],
    ];
    let b = T(26, 20, "page", { a: "start", sz: 12, c: "var(--text-faint)" }) + T(100, 20, "rank", { a: "start", sz: 12, c: "var(--text-faint)" }) + T(170, 20, "links", { a: "start", sz: 12, c: "var(--text-faint)" }) + T(270, 20, "what it passes on", { a: "start", sz: 12, c: "var(--text-faint)" });
    rows.forEach(([id, p, r, l, s], i) => {
      const y = 30 + i * 46;
      b += R(8, y, 484, 38, { rx: 10 }) + T(26, y + 25, p, { a: "start", sz: 16, c: "var(--ink)", w: 900 }) + T(100, y + 25, r, { a: "start", sz: 15, f: "var(--mono)" }) + T(170, y + 25, l, { a: "start", sz: 14 }) + T(270, y + 25, s, { a: "start", sz: 14 }) + pk(id, hit(8, y, 484, 38));
    });
    const y = 30 + 3 * 46;
    b += R(8, y, 484, 38, { rx: 10, fill: "var(--bg-2)" }) + T(26, y + 25, "arrives", { a: "start", sz: 14, c: "var(--text-dim)" }) + T(110, y + 25, "A 0.333", { a: "start", sz: 14, f: "var(--mono)" }) + T(210, y + 25, "B 0.333", { a: "start", sz: 14, f: "var(--mono)" }) + T(310, y + 25, "C 0.667", { a: "start", sz: 14, f: "var(--mono)" }) + pk("rowArr", hit(8, y, 484, 38));
    b += R(8, y + 50, 484, 36, { rx: 10, fill: tint("rose"), stroke: col("rose") }) + T(250, y + 74, "Total rank after the round: 1.333", { sz: 15, c: ink("rose") });
    return SVG(500, y + 94, b, "A hand trace of one PageRank round, one row per page");
  })();

  // 2. three buggy runs, total rank per round (4-page web with a dead end, d = 0.85); numbers from the real iteration
  const leakRun = (kind) => {
    const g = { A: ["B", "C"], B: ["C"], C: ["A", "D"], D: [] }, pages = ["A", "B", "C", "D"], n = 4, d = 0.85;
    let r = { A: 0.25, B: 0.25, C: 0.25, D: 0.25 };
    const out = [1];
    for (let k = 0; k < 10; k++) {
      const nx = { A: 0, B: 0, C: 0, D: 0 };
      pages.forEach((p) => { const l = g[p]; if (!l.length) { if (kind !== "skip") pages.forEach((q) => (nx[q] += r[p] / n)); } else l.forEach((q) => (nx[q] += r[p] / l.length)); });
      pages.forEach((p) => { nx[p] = kind === "nofloor" ? d * nx[p] : kind === "nodamp" ? nx[p] + (1 - d) / n : d * nx[p] + (1 - d) / n; });
      r = nx; out.push(pages.reduce((s, p) => s + r[p], 0));
    }
    return out;
  };
  const miniLine = (ox, title, ys, colr) => {
    const w = 140, h = 110, x0 = ox + 26, y0 = 28, ymax = 2.4, X = (i) => x0 + (i / 10) * (w - 28), Y = (v) => y0 + h - (v / ymax) * h;
    let b = T(ox + 86, 16, title, { sz: 15, c: "var(--ink)", w: 900 });
    b += R(x0, y0, w - 28, h, { rx: 4, fill: "var(--panel)" });
    [0, 1, 2].forEach((v) => (b += T(x0 - 5, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })));
    b += L(x0, Y(1), x0 + w - 28, Y(1), { dash: "4 4", stroke: "var(--text-faint)", sw: 1.5 });
    b += P(ys.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" "), { stroke: col(colr), sw: 3 });
    ys.forEach((v, i) => { if (i % 5 === 0) b += C(X(i), Y(v), 4, { fill: col(colr), stroke: col(colr), sw: 1 }); });
    b += T(x0 + (w - 28) / 2, y0 + h + 18, "rounds 0 to 10", { sz: 12, c: "var(--text-faint)" });
    return b;
  };
  const leakCharts = SVG(500, 178,
    miniLine(0, "Chart P", leakRun("nodamp"), "amber") + miniLine(166, "Chart Q", leakRun("skip"), "blue") + miniLine(332, "Chart R", leakRun("nofloor"), "violet") +
    T(250, 172, "dashed line = total rank 1 (it should stay there)", { sz: 12, c: "var(--text-faint)" }),
    "Three charts of total rank per round for three buggy versions");

  // 3. transfer grid for the first round (4 pages, 1/4 each), dead-end row hidden
  const transferGrid = (() => {
    const names = ["A", "B", "C", "D"], cell = 62, x0 = 96, y0 = 44;
    const amt = { A: { B: "1/8", C: "1/8" }, B: { C: "1/4" }, C: { A: "1/8", D: "1/8" } };
    const shade = { "1/8": 0.35, "1/4": 0.7 };
    let b = T(x0 + 2 * cell, 16, "receiver", { sz: 13, c: "var(--text-dim)" }) + T(40, y0 + 2 * cell + 4, "sender", { sz: 13, c: "var(--text-dim)" });
    names.forEach((p, j) => (b += T(x0 + j * cell + cell / 2, y0 - 8, p, { sz: 16, c: "var(--ink)", w: 900 })));
    names.forEach((s, i) => {
      b += T(x0 - 14, y0 + i * cell + cell / 2 + 6, s, { a: "end", sz: 16, c: "var(--ink)", w: 900 });
      names.forEach((r, j) => {
        const x = x0 + j * cell, y = y0 + i * cell;
        if (s === "D") { b += R(x, y, cell, cell, { rx: 0, sw: 1.5, fill: "var(--bg-2)" }); return; }
        const v = amt[s] && amt[s][r];
        b += R(x, y, cell, cell, { rx: 0, sw: 1.5, fill: v ? col("blue") : "var(--panel)", op: v ? shade[v] : 1 }) + (v ? T(x + cell / 2, y + cell / 2 + 6, v, { sz: 17, c: "var(--ink)", w: 900 }) : T(x + cell / 2, y + cell / 2 + 5, "0", { sz: 13, c: "var(--text-faint)" }));
      });
    });
    b += T(x0 + 2 * cell, y0 + 3 * cell + cell / 2 + 6, "D links nowhere: row hidden", { sz: 14, c: ink("amber") });
    b += T(x0 + 2 * cell, y0 + 4 * cell + 22, "Each page started with 1/4.", { sz: 13, c: "var(--text-dim)" });
    return SVG(400, y0 + 4 * cell + 30, b, "Who sends rank to whom in round 1, with the dead end D hidden");
  })();

  // 4. biggest change per round on a log scale (3-page web, d = 0.85): real iteration
  const changeData = (() => {
    const g = { A: ["B", "C"], B: ["C"], C: ["A"] }, pages = ["A", "B", "C"], d = 0.85;
    let r = { A: 1 / 3, B: 1 / 3, C: 1 / 3 };
    const ch = [];
    for (let k = 0; k < 16; k++) {
      const nx = { A: 0, B: 0, C: 0 };
      pages.forEach((p) => g[p].forEach((q) => (nx[q] += r[p] / g[p].length)));
      pages.forEach((p) => (nx[p] = d * nx[p] + (1 - d) / 3));
      ch.push(Math.max(...pages.map((p) => Math.abs(nx[p] - r[p])))); r = nx;
    }
    return ch;
  })();
  const changeLog = (() => {
    const x0 = 64, w = 420, y0 = 20, h = 230, lo = -5, hi = -0.5, X = (k) => x0 + 14 + ((k - 1) / 15) * (w - 28), Y = (v) => y0 + ((hi - Math.log10(v)) / (hi - lo)) * h;
    let b = R(x0, y0, w, h, { rx: 4 });
    [["0.1", -1], ["0.01", -2], ["0.001", -3], ["0.0001", -4], ["0.00001", -5]].forEach(([s, e]) => { b += L(x0, Y(10 ** e), x0 + w, Y(10 ** e), { sw: 1, stroke: "var(--line)" }) + T(x0 - 6, Y(10 ** e) + 4, s, { a: "end", sz: 12, c: "var(--text-faint)" }); });
    b += L(x0, Y(0.001), x0 + w, Y(0.001), { stroke: col("rose"), dash: "6 4", sw: 2.5 }) + T(x0 + w - 8, Y(0.001) - 8, "settled below this line", { a: "end", sz: 12, c: ink("rose") });
    b += P(changeData.map((v, i) => `${i ? "L" : "M"}${X(i + 1).toFixed(1)},${Y(v).toFixed(1)}`).join(" "), { stroke: "var(--line-2)", sw: 2 });
    changeData.forEach((v, i) => { b += pk("r" + (i + 1), C(X(i + 1), Y(v), 8, { fill: tint("blue"), stroke: col("blue"), sw: 2.5 })); if ((i + 1) % 2 === 0) b += T(X(i + 1), y0 + h + 18, String(i + 1), { sz: 13, c: "var(--text-dim)" }); });
    b += T(x0 + w / 2, y0 + h + 38, "round", { sz: 13, c: "var(--text-dim)" });
    return SVG(500, y0 + h + 46, b, "Biggest change in any page's rank after each round, on a log scale");
  })();
  const firstSettled = "r" + (changeData.findIndex((v) => v < 0.001) + 1);

  // 5. one round of a 4-page web with a dead end
  const flowBoxes = (() => {
    const pos = { P: [90, 70], Q: [330, 70], R: [330, 190], D: [90, 190] }, rk = { P: "0.40", Q: "0.20", R: "0.20", D: "0.20" };
    let b = arrowDef("xa-fb");
    b += P("M138,70 L282,70", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-fb" }) + P("M128,102 L292,160", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-fb" }) + P("M330,106 L330,154", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-fb" }) + P("M282,190 L138,190", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-fb" });
    Object.entries(pos).forEach(([k, [x, y]]) => {
      const dead = k === "D";
      b += R(x - 44, y - 32, 88, 64, { rx: 14, fill: dead ? tint("amber") : "var(--panel)", stroke: dead ? col("amber") : "var(--line-2)", dash: dead ? "6 4" : null }) + T(x, y - 6, k, { sz: 17, c: "var(--ink)", w: 900 }) + T(x, y + 18, "rank " + rk[k], { sz: 14 });
    });
    b += T(90, 250, "D links nowhere", { sz: 13, c: ink("amber") }) + T(210, 58, "P has two links", { sz: 13, c: "var(--text-dim)" });
    return SVG(420, 262, b, "Four pages: P links to Q and R, Q links to R, R links to D, D links nowhere");
  })();

  B.add("a1-code", [
    { type: "pick", q: "A friend worked round 1 of PageRank by hand for A → B, A → C, B → C, C → A. Every page started on 1/3 and there is no damping yet. The total came out above 1, so one row is wrong. Click it.",
      fig: codeTrace, a: "rowA",
      why: "A has two links, so it must split its rank: 1/3 ÷ 2 = 0.167 down each. Sending 0.333 down both creates rank from nothing, which is why the total is 1.333. B and C each have one link, so passing on everything is right." },
    { type: "match", q: "These charts show the total rank each round on a web with one dead end, for three buggy versions of the lab code. The total should stay at 1. Match each bug to its chart.", fig: leakCharts,
      pairs: [["Teleport floor added, but the arrived rank is never multiplied by <code>d</code>", "Chart P"], ["The dead-end branch is left empty, so its rank is never handed on", "Chart Q"], ["Teleport floor left out: <code>nxt[p] = d * nxt[p]</code>", "Chart R"]],
      why: "Adding 0.15 every round with nothing taken away makes the total climb for ever (P). Dropping the dead end's rank loses a slice each round, so the total sinks but levels off above zero (Q). With no floor, each round keeps only 85% of what is left, so the total decays towards 0 (R)." },
    { type: "mcq", q: "Round 1 of PageRank on a 4-page web, before damping. A row is the sender and a column the receiver. Page D links nowhere, so its row is hidden. In total, how much does page A receive?", fig: transferGrid,
      o: ["1/16", "1/8", "3/16", "3/8"], a: 2, hint: "D has 1/4 to give, and a dead end pours it equally over all 4 pages.",
      why: "A gets 1/8 from C. D has no links, so it shares its 1/4 equally over all four pages: 1/16 each, including A. 1/8 + 1/16 = 3/16. Forgetting D gives 1/8, and sending all of D's rank to A gives 3/8." },
    { type: "pick", q: "The lab calls a run settled when the biggest change in any page's rank is under 0.001. The chart shows that change after each round (log scale) for A → B, C; B → C; C → A with d = 0.85. Click the first round that counts as settled.",
      fig: changeLog, a: firstSettled,
      why: "The change shrinks by a roughly constant factor every few rounds, so it falls along a slanting line on a log scale. Round 12 is the first dot below the 0.001 line (about 0.0007). Round 11 is still about 0.0017, too big." },
    { type: "mcq", q: "Round 1 of a 4-page web before damping. The arrows are the links, and D links nowhere. How much rank does page Q receive?", fig: flowBoxes,
      o: ["0.05", "0.20", "0.25", "0.45"], a: 2, hint: "P splits 0.40 over two links. D splits 0.20 over all four pages.",
      why: "P has two links, so Q gets 0.40 ÷ 2 = 0.20 from P. D's 0.20 is poured over all four pages, which adds 0.05. Together that is 0.25. Passing P's whole 0.40 to Q gives 0.45, and ignoring D gives 0.20." },
    { type: "bug", q: "Each round must read last round's ranks and write the new ones into a fresh dict. This loop mixes old and new values, so the total rank drifts above 1. Click the line that breaks the rule.",
      code: ["nxt = {p: 0 for p in pages}", "for p in pages:", "    for q in out[p]:", "        r[q] += r[p] / len(out[p])"], a: 3,
      why: "The share is written into <code>r</code> (the ranks), the same dict being read. A page that comes later in the loop then reads values already changed this round, so rank is counted twice. It should add to <code>nxt[q]</code>, which is why <code>nxt</code> is created at the top." },
  ]);

  /* =====================================================================
     a2-watch  (be Dijkstra, no code)
     ===================================================================== */
  // 1. a map part-way through a run: put the next three settles in order (verified by running Dijkstra below)
  const dijkRun = (edges, start) => {
    const adj = {}; edges.forEach(([a, b, w]) => { (adj[a] = adj[a] || []).push([b, w]); (adj[b] = adj[b] || []).push([a, w]); });
    const dist = {}, done = new Set(), order = [], prev = {}; Object.keys(adj).forEach((k) => (dist[k] = Infinity)); dist[start] = 0;
    for (;;) {
      let u = null; Object.keys(adj).forEach((k) => { if (!done.has(k) && dist[k] < Infinity && (u === null || dist[k] < dist[u])) u = k; });
      if (u === null) break; done.add(u); order.push(u);
      adj[u].forEach(([v, w]) => { if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; } });
    }
    return { dist, order, prev };
  };
  const mapState = (() => {
    const pos = { S: [44, 104], A: [140, 38], B: [140, 170], C: [300, 38], D: [300, 170], E: [436, 104] };
    const edges = [["S", "A", 3], ["S", "B", 6], ["A", "B", 2], ["A", "C", 7], ["B", "D", 3], ["C", "D", 1], ["C", "E", 5], ["D", "E", 6]];
    const st = { S: ["teal", "0"], A: ["teal", "3"], B: ["amber", "5"], C: ["amber", "10"], D: [null, "∞"], E: [null, "∞"] };
    let b = "";
    edges.forEach(([u, v]) => (b += L(pos[u][0], pos[u][1], pos[v][0], pos[v][1], { sw: 2.5 })));
    edges.forEach(([u, v, w]) => (b += wpill((pos[u][0] + pos[v][0]) / 2, (pos[u][1] + pos[v][1]) / 2, w)));
    Object.entries(pos).forEach(([k, [x, y]]) => { const [c, cap] = st[k]; b += node(x, y, k, { fill: c, stroke: c }) + T(x + (k === "S" ? -2 : 0), y - 27, cap, { sz: 14, c: c ? ink(c) : "var(--text-faint)", w: 900 }); });
    b += C(24, 216, 7, { fill: tint("teal"), stroke: col("teal"), sw: 2 }) + T(36, 220, "settled", { a: "start", sz: 12, c: "var(--text-dim)" }) + C(120, 216, 7, { fill: tint("amber"), stroke: col("amber"), sw: 2 }) + T(132, 220, "waiting room", { a: "start", sz: 12, c: "var(--text-dim)" }) + C(250, 216, 7, { sw: 2 }) + T(262, 220, "not reached", { a: "start", sz: 12, c: "var(--text-dim)" }) + T(400, 220, "number above = distance", { sz: 12, c: "var(--text-faint)" });
    return { fig: SVG(480, 230, b, "A weighted map with S and A settled, B and C in the waiting room"), run: dijkRun(edges, "S") };
  })();

  // 2. relaxing the roads out of a freshly settled node
  const hubFig = (() => {
    const hub = [170, 124], sat = { P: [170, 28], Q: [280, 76], R: [280, 176], S: [170, 224], T: [60, 124] };
    const road = { P: 3, Q: 4, R: 2, S: 1, T: 6 }, now = { P: ["9", null], Q: ["9", null], R: ["2, settled", "teal"], S: ["∞", null], T: ["10", null] };
    let b = "";
    Object.entries(sat).forEach(([k, [x, y]]) => { b += L(hub[0], hub[1], x, y, { sw: 2.5 }) + wpill((hub[0] + x) / 2, (hub[1] + y) / 2, road[k]); });
    b += C(hub[0], hub[1], 27, { fill: tint("teal"), stroke: col("teal") }) + T(hub[0], hub[1] - 2, "X", { sz: 16, c: "var(--ink)", w: 900 }) + T(hub[0], hub[1] + 15, "5", { sz: 13, c: ink("teal"), w: 900 });
    Object.entries(sat).forEach(([k, [x, y]]) => {
      const [t, c] = now[k]; b += node(x, y, k, { fill: c, stroke: c });
      b += k === "T" ? T(x, y + 36, "now " + t, { sz: 13, c: c ? ink(c) : "var(--text)" }) : T(x + 28, y + 5, "now " + t, { a: "start", sz: 13, c: c ? ink(c) : "var(--text)" });
    });
    b += T(330, 124, "X is settled at 5.", { a: "start", sz: 13, c: ink("teal") });
    return SVG(430, 252, b, "Node X, settled at 5, with five neighbours and the road lengths to them");
  })();

  // 3. shortest-path tree (verified: roads S-A 2, S-B 4, A-C 3, A-D 7, B-D 4, B-E 3, C-D 6, D-F 2, E-F 6)
  const treeRun = dijkRun([["S", "A", 2], ["S", "B", 4], ["A", "C", 3], ["A", "D", 7], ["B", "D", 4], ["B", "E", 3], ["C", "D", 6], ["D", "F", 2], ["E", "F", 6]], "S");
  const treeFig = (() => {
    const pos = { S: [250, 28], A: [130, 100], B: [370, 100], C: [130, 176], D: [310, 176], E: [430, 176], F: [310, 252] };
    const tree = [["S", "A", 2], ["S", "B", 4], ["A", "C", 3], ["B", "D", 4], ["B", "E", 3], ["D", "F", 2]];
    let b = "";
    tree.forEach(([u, v]) => (b += L(pos[u][0], pos[u][1], pos[v][0], pos[v][1], { sw: 3, stroke: "var(--line-2)" })));
    tree.forEach(([u, v, w]) => (b += wpill((pos[u][0] + pos[v][0]) / 2, (pos[u][1] + pos[v][1]) / 2, w)));
    Object.entries(pos).forEach(([k, [x, y]]) => {
      const sh = k === "S"; b += (sh ? "" : "") + (k === "S" ? node(x, y, k, { fill: "teal", stroke: "teal" }) : pk(k, C(x, y, 19, { fill: "var(--panel)", stroke: "var(--line-2)" }) + T(x, y + 5, k, { sz: 15, c: "var(--ink)", w: 900 })));
      b += T(x + 28, y + 5, String(treeRun.dist[k]), { a: "start", sz: 14, c: ink("amber"), w: 900 });
    });
    b += T(250, 284, "number beside a node = its shortest distance from S", { sz: 12, c: "var(--text-faint)" });
    return SVG(500, 292, b, "The shortest-path tree from S, with each node's distance");
  })();

  // 4. distance each node had when it was settled, in settling order
  const settleLog = [["S", 0], ["A", 2], ["B", 3], ["C", 3], ["D", 6], ["E", 5], ["F", 8], ["G", 9]];
  const settlePlot = (() => {
    const x0 = 56, w = 424, y0 = 16, h = 200, X = (i) => x0 + 26 + i * ((w - 52) / 7), Y = (v) => y0 + h - (v / 10) * h;
    let b = R(x0, y0, w, h, { rx: 4 });
    [0, 2, 4, 6, 8, 10].forEach((v) => (b += L(x0, Y(v), x0 + w, Y(v), { sw: 1, stroke: "var(--line)" }) + T(x0 - 8, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })));
    b += P(settleLog.map(([, v], i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" "), { stroke: "var(--line-2)", sw: 2.5 });
    settleLog.forEach(([k, v], i) => { b += pk("p" + (i + 1), C(X(i), Y(v), 11, { fill: tint("blue"), stroke: col("blue"), sw: 3 })) + T(X(i), y0 + h + 20, k, { sz: 15, c: "var(--ink)", w: 900 }); });
    b += T(x0 + w / 2, y0 + h + 42, "nodes in the order they were settled", { sz: 12, c: "var(--text-faint)" }) + T(14, y0 + h / 2, "distance", { sz: 12, c: "var(--text-faint)" }).replace("<text ", `<text transform="rotate(-90 14 ${y0 + h / 2})" `);
    return SVG(500, y0 + h + 52, b, "The distance of each node when it was settled, in order");
  })();

  // 5. nested regions: settled, waiting room, not reached
  const regionFig = (() => {
    const nodes = { S: [88, 104, "0"], C: [88, 170, "2"], B: [88, 236, "3"], D: [220, 104, "8"], H: [220, 170, "9"], E: [220, 236, "10"], F: [390, 130, "∞"], G: [390, 220, "∞"] };
    let b = R(6, 6, 488, 288, { rx: 22, fill: "var(--bg-2)", dash: "8 6" }) + T(400, 36, "not reached yet", { sz: 13, c: "var(--text-dim)" });
    b += R(16, 46, 286, 240, { rx: 20, fill: tint("amber"), stroke: col("amber") }) + T(224, 68, "waiting room", { sz: 13, c: ink("amber") });
    b += R(26, 76, 124, 200, { rx: 16, fill: tint("teal"), stroke: col("teal") }) + T(88, 94, "settled", { sz: 13, c: ink("teal") });
    Object.entries(nodes).forEach(([k, [x, y, d]]) => { b += pk(k, C(x, y, 19, { fill: "var(--panel)", stroke: "var(--line-2)" }) + T(x, y + 5, k, { sz: 15, c: "var(--ink)", w: 900 })) + T(x + 28, y + 5, d, { a: "start", sz: 14, c: "var(--text)", w: 900 }); });
    return SVG(500, 300, b, "Eight nodes: three settled, three in the waiting room, two not reached");
  })();

  // 6. tentative distance of each node after each settle (roads S-A 1, S-B 4, S-C 9, A-B 2, A-C 5, B-C 2, B-D 7, C-D 1)
  const stepRun = (() => {
    const edges = [["S", "A", 1], ["S", "B", 4], ["S", "C", 9], ["A", "B", 2], ["A", "C", 5], ["B", "C", 2], ["B", "D", 7], ["C", "D", 1]];
    const adj = {}; edges.forEach(([a, b, w]) => { (adj[a] = adj[a] || []).push([b, w]); (adj[b] = adj[b] || []).push([a, w]); });
    const dist = { S: 0, A: Infinity, B: Infinity, C: Infinity, D: Infinity }, done = new Set(), snaps = [], order = [];
    for (;;) {
      let u = null; Object.keys(dist).forEach((k) => { if (!done.has(k) && dist[k] < Infinity && (u === null || dist[k] < dist[u])) u = k; });
      if (u === null) break; done.add(u); order.push(u); adj[u].forEach(([v, w]) => { if (dist[u] + w < dist[v]) dist[v] = dist[u] + w; }); snaps.push({ ...dist });
    }
    return { snaps, order };
  })();
  const stepFig = (() => {
    const x0 = 60, w = 420, y0 = 14, h = 190, X = (i) => x0 + 34 + i * ((w - 68) / 4), Y = (v) => y0 + h - (v / 10) * h;
    const colr = { A: "teal", B: "blue", C: "amber", D: "violet" }, ord = stepRun.order, snaps = stepRun.snaps;
    let b = R(x0, y0, w, h, { rx: 4 });
    [0, 2, 4, 6, 8, 10].forEach((v) => (b += L(x0, Y(v), x0 + w, Y(v), { sw: 1, stroke: "var(--line)" }) + T(x0 - 8, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })));
    ["A", "B", "C", "D"].forEach((k) => {
      const last = ord.indexOf(k), pts = [];
      snaps.forEach((s, i) => { if (i <= last && s[k] < Infinity) pts.push([i, s[k]]); });
      b += P(pts.map(([i, v], j) => `${j ? "L" : "M"}${X(i)},${Y(v)}`).join(" "), { stroke: col(colr[k]), sw: 3.5 });
      pts.forEach(([i, v]) => (b += C(X(i), Y(v), 4.5, { fill: col(colr[k]), stroke: col(colr[k]), sw: 1 })));
      const [li, lv] = pts[pts.length - 1]; b += T(X(li) + 16, Y(lv) + 5, k, { sz: 15, c: ink(colr[k]), w: 900 });
    });
    ord.slice(0, 5).forEach((k, i) => (b += T(X(i), y0 + h + 20, "after " + k, { sz: 13, c: "var(--text-dim)" })));
    b += T(x0 + w / 2, y0 + h + 42, "A line starts when a node is first reached and ends when it is settled.", { sz: 12, c: "var(--text-faint)" });
    return SVG(500, y0 + h + 52, b, "Tentative distance of A, B, C and D after each node is settled");
  })();
  const twiceDrop = ["A", "B", "C", "D"].filter((k) => { const s = stepRun.snaps.map((x) => x[k]).filter((v) => v < Infinity); let n = 0; for (let i = 1; i < s.length; i++) if (s[i] < s[i - 1]) n++; return n === 2; });

  B.add("a2-watch", [
    { type: "order", q: "Dijkstra from S. S and A are settled. The amber nodes are in the waiting room with the distances shown, and the grey nodes have not been reached. Put the next three nodes in the order they get settled.", fig: mapState.fig,
      items: mapState.run.order.slice(2, 5).map((k) => `<b>${k}</b>`),
      why: "B (5) is the smallest in the waiting room, so it goes first, and its road to D reaches D at 8. Now D (8) beats C (10), so D is settled second, and its road to C of length 1 drops C from 10 to 9. C is third. Taking C before D would settle it at 10, when 9 is available." },
    { type: "cat", q: "Node X has just been settled at distance 5. The diagram shows the road lengths from X and what each neighbour holds now. Sort the neighbours by what happens when you check the roads out of X.", fig: hubFig,
      buckets: ["Gets updated", "Left alone"],
      items: [["Node <b>P</b>", 0], ["Node <b>Q</b>", 1], ["Node <b>R</b>", 1], ["Node <b>S</b>", 0], ["Node <b>T</b>", 1]],
      hint: "New distance = 5 + the road length. Compare it with what the node holds now.",
      why: "P: 5 + 3 = 8 beats 9. S: 5 + 1 = 6 beats ∞, a first way in. Q: 5 + 4 = 9 only ties 9, and a tie is not better, so Q is left alone. R is already settled, so its distance is final. T: 5 + 6 = 11 is worse than 10." },
    { type: "pick", q: "This is the shortest-path tree Dijkstra built from S, with each node's distance. The road between B and D closes. Click every node whose best route in this tree used that road.", fig: treeFig, a: ["D", "F"],
      why: "A node's route is the chain of tree roads back to S. D hangs off B by that road, and F hangs off D, so both routes pass over it. E is also below B, but it uses the B–E road, so it is unaffected. A and C do not touch B at all." },
    { type: "pick", q: "A friend logged the distance each node had at the moment it was settled, in the order they were settled. One dot proves a mistake was made. Click it.", fig: settlePlot, a: "p6",
      why: "Dijkstra always settles the smallest waiting distance, and roads never subtract, so the settled distances can only stay level or rise. E at 5 comes after D at 6, which cannot happen. The two 3s are fine: a tie is allowed." },
    { type: "pick", q: "In Dijkstra, which nodes could still end up with a smaller distance than the one shown? Roads are never negative. Click every one.", fig: regionFig, a: ["H", "E", "F", "G"],
      why: "Settled nodes are final. D (8) is the smallest in the waiting room, so any other route would have to leave through a node that is already 8 or more away, and it cannot win: D is final too. H and E could still be beaten via D, and the unreached nodes F and G have no distance at all yet." },
    { type: "mcq", q: "Dijkstra ran on a small map. The chart shows the distance each node held after each node was settled. A drop means a shorter way in was found. Which node's distance dropped twice after it was first reached?", fig: stepFig,
      o: ["Node A", "Node B", "Node C", "Node D"], a: 2,
      why: "C was first reached at 9, dropped to 6 when A was settled, and dropped again to 5 when B was settled. B dropped once (4 to 3) and D once (10 to 6). A was reached at 1 and never improved, because nothing can beat the node next to the start." },
  ]);

  /* =====================================================================
     a2-code  (Dijkstra code lab)
     ===================================================================== */
  // 1. printed result of a buggy relax step (Python run on the map S-X 7, S-Y 2, Y-X 3, X-Z 1)
  const outDiff = (() => {
    const rows = [["S", "0", "0"], ["X", "5", "1"], ["Y", "2", "2"], ["Z", "6", "1"]];
    let b = T(70, 18, "node", { sz: 12, c: "var(--text-faint)" }) + T(190, 18, "should print", { sz: 12, c: "var(--text-faint)" }) + T(330, 18, "your code printed", { sz: 12, c: "var(--text-faint)" });
    rows.forEach(([k, e, g], i) => {
      const y = 28 + i * 40, bad = e !== g;
      b += R(20, y, 440, 32, { rx: 8 }) + T(70, y + 22, k, { sz: 16, c: "var(--ink)", w: 900 }) + T(190, y + 22, e, { sz: 16, f: "var(--mono)" });
      b += R(270, y + 3, 120, 26, { rx: 8, fill: bad ? tint("rose") : tint("teal"), stroke: bad ? col("rose") : col("teal") }) + T(330, y + 22, g, { sz: 16, f: "var(--mono)", c: bad ? ink("rose") : ink("teal") });
    });
    return SVG(480, 196, b, "Expected and printed distances for the map");
  })();

  // 2. look-by-look trace of a student's relax step that only writes a distance the first time (Python run)
  const lookTrace = (() => {
    const rows = [["S – X", "7", "∞", "7"], ["S – Y", "2", "∞", "2"], ["Y – S", "4", "0", "0"], ["Y – X", "5", "7", "7"], ["X – S", "14", "0", "0"], ["X – Y", "10", "2", "2"], ["X – Z", "8", "∞", "8"]];
    let b = T(40, 18, "road checked", { a: "start", sz: 12, c: "var(--text-faint)" }) + T(190, 18, "cand", { sz: 12, c: "var(--text-faint)" }) + T(290, 18, "dist[v] was", { sz: 12, c: "var(--text-faint)" }) + T(410, 18, "dist[v] now", { sz: 12, c: "var(--text-faint)" });
    rows.forEach(([r, c, w, n], i) => {
      const y = 26 + i * 38;
      b += R(8, y, 484, 32, { rx: 10 }) + T(40, y + 22, r, { a: "start", sz: 15, c: "var(--ink)", w: 900 }) + T(190, y + 22, c, { sz: 15, f: "var(--mono)" }) + T(290, y + 22, w, { sz: 15, f: "var(--mono)" }) + T(410, y + 22, n, { sz: 15, f: "var(--mono)" }) + pk("l" + (i + 1), hit(8, y, 484, 32));
    });
    return SVG(500, 26 + rows.length * 38 + 4, b, "A trace of the roads checked, with the candidate and the distance before and after");
  })();

  // 3. a one-way adjacency table for four towns (row = from, column = to)
  const adjTable = (() => {
    const names = ["S", "X", "Y", "Z"], have = { SX: 7, SY: 2, YX: 3, XZ: 1 }, cell = 62, x0 = 90, y0 = 46;
    let b = T(x0 + 2 * cell, 16, "to", { sz: 13, c: "var(--text-dim)" }) + T(36, y0 + 2 * cell + 4, "from", { sz: 13, c: "var(--text-dim)" });
    names.forEach((p, j) => (b += T(x0 + j * cell + cell / 2, y0 - 8, p, { sz: 16, c: "var(--ink)", w: 900 })));
    names.forEach((s, i) => {
      b += T(x0 - 14, y0 + i * cell + cell / 2 + 6, s, { a: "end", sz: 16, c: "var(--ink)", w: 900 });
      names.forEach((r, j) => {
        const x = x0 + j * cell, y = y0 + i * cell, v = have[s + r];
        if (s === r) { b += R(x, y, cell, cell, { rx: 0, sw: 1.5, fill: "var(--bg-2)" }); return; }
        b += R(x, y, cell, cell, { rx: 0, sw: 1.5, fill: v ? tint("blue") : "var(--panel)", stroke: v ? col("blue") : "var(--line-2)" }) + (v ? T(x + cell / 2, y + cell / 2 + 6, String(v), { sz: 18, c: "var(--ink)", w: 900 }) : pk(s + r, hit(x + 3, y + 3, cell - 6, cell - 6, 6)));
      });
    });
    b += T(x0 + 2 * cell, y0 + 4 * cell + 22, "Row S says: from S, road to X is 7 and to Y is 2.", { sz: 12, c: "var(--text-dim)" });
    return SVG(400, y0 + 4 * cell + 32, b, "A table of roads, row = from, column = to, with four filled cells");
  })();

  // 4. a map with an island (verified by counting looks in the Python run: 8)
  const islandMap = (() => {
    const pos = { S: [44, 96], A: [140, 36], B: [140, 156], C: [250, 156], D: [350, 44], E: [440, 96], F: [380, 160] };
    const edges = [["S", "A", 2], ["S", "B", 5], ["A", "B", 1], ["B", "C", 3], ["D", "E", 4], ["E", "F", 2]];
    let b = R(300, 8, 192, 188, { rx: 18, fill: "var(--bg-2)", dash: "7 5" }) + T(396, 188, "no road to S", { sz: 12, c: "var(--text-dim)" });
    edges.forEach(([u, v]) => (b += L(pos[u][0], pos[u][1], pos[v][0], pos[v][1], { sw: 2.5 })));
    edges.forEach(([u, v, w]) => (b += wpill((pos[u][0] + pos[v][0]) / 2, (pos[u][1] + pos[v][1]) / 2, w)));
    Object.entries(pos).forEach(([k, [x, y]]) => (b += node(x, y, k, { fill: k === "S" ? "teal" : null, stroke: k === "S" ? "teal" : null })));
    b += T(44, 134, "start", { sz: 12, c: ink("teal") });
    return SVG(500, 204, b, "A map with a connected part containing S and a separate island");
  })();

  // 5. four frames of a table of distances (run on S-A 2, S-B 5, A-B 1, B-C 3, A-C 7); frame 3 is corrupted
  const frameFig = (() => {
    const frames = [[0, 2, 5, null], [0, 2, 3, 9], [0, 2, 4, 6], [0, 2, 3, 6]], nm = ["S", "A", "B", "C"];
    const pw = 114, bw = 18, h = 110, y0 = 34, Y = (v) => y0 + h - (v / 10) * h;
    let b = "";
    frames.forEach((f, k) => {
      const ox = 6 + k * (pw + 10);
      b += R(ox, 4, pw, 196, { rx: 12, fill: "var(--panel)" }) + T(ox + pw / 2, 24, "after settle " + (k + 1), { sz: 13, c: "var(--ink)", w: 900 });
      f.forEach((v, i) => {
        const x = ox + 12 + i * 25;
        if (v === null) b += R(x, y0, bw, h, { rx: 3, fill: "var(--bg-2)", dash: "3 3", sw: 1.5 }) + T(x + bw / 2, y0 + h / 2 + 5, "∞", { sz: 14, c: "var(--text-dim)" });
        else b += R(x, Y(v), bw, h - (Y(v) - y0), { rx: 3, fill: col("blue"), stroke: col("blue"), sw: 1, op: 0.8 }) + T(x + bw / 2, Y(v) - 5, String(v), { sz: 13, c: "var(--ink)", w: 900 });
        b += T(x + bw / 2, y0 + h + 18, nm[i], { sz: 13, c: "var(--text-dim)" });
      });
      b += pk("f" + (k + 1), hit(ox, 4, pw, 196, 12));
    });
    return SVG(500, 206, b, "Four small bar charts of the distances to S, A, B and C after each settle");
  })();

  B.add("a2-code", [
    { type: "bug", q: "On the map S–X 7, S–Y 2, Y–X 3, X–Z 1 (start S) this relax step prints X = 1 and Z = 1, as the table shows. Click the faulty line.", fig: outDiff,
      code: ["for v, w in graph[u]:", "    cand = dist[u] + w", "    if cand < dist[v]:", "        dist[v] = w"], a: 3,
      why: "The test compares the right thing (<code>cand</code>), but the update stores <code>w</code>, the length of one road, instead of the whole route length. Every distance then forgets how far it took to reach u. It should be <code>dist[v] = cand</code>." },
    { type: "pick", q: "A student's relax step only writes a distance when the node has none yet. Their code printed this trace on the map S–X 7, S–Y 2, Y–X 3, X–Z 1. Click the row where an improvement was missed.", fig: lookTrace, a: "l4",
      why: "On Y – X the candidate is 5, which beats the 7 that X holds, yet X is still 7 afterwards. A shorter way was found and thrown away, so X and everything beyond it (Z comes out at 8 instead of 6) is too big. The other rows are fine: their candidates either fill an empty ∞ or are not better." },
    { type: "pick", q: "The roads S–X, S–Y, Y–X and X–Z are two-way, but the code reads <code>graph[u]</code>, the roads out of u. This table only lists each road in one direction. Click every empty cell that must be filled so that every road works both ways.", fig: adjTable, a: ["XS", "YS", "XY", "ZX"],
      why: "A two-way road needs an entry in both rows: S–X gives S → X (7) and X → S (7), and so on. The missing mirrors are X → S, Y → S, X → Y and Z → X. The other empty cells, such as S to Z, are pairs with no road at all and stay empty." },
    { type: "mcq", q: "The lab's code records one 'look' for every road it checks out of a node it settles. All roads are two-way and Dijkstra starts at S. How many looks are recorded?", fig: islandMap,
      o: ["4", "6", "8", "12"], a: 2, hint: "Each road is checked from both ends, but only from nodes that actually get settled.",
      why: "S, A, B and C are settled. The four roads among them are each looked at from both ends: 8 looks. The island is never reached, so D, E and F are never settled and their two roads are never looked at. Counting every road from both ends would give 12." },
    { type: "pick", q: "A student's code prints the table of distances after each settle, drawn as four small charts (a dashed bar = ∞, not reached). One frame cannot come from a correct Dijkstra run. Click it.", fig: frameFig, a: "f3",
      why: "Distances only ever fall or stay level. In frame 3, B has risen from 3 to 4. A route was found for B at 3, so a correct run can never give that up. Frame 4 shows B back at 3, which is why 3 looks like the odd one out." },
    { type: "match", q: "Four students each made one slip in their Dijkstra code. Match each slip to what they saw when they ran the tests.",
      pairs: [["The node is never marked as done", "The run never finishes: it hits the 2-second limit"], ["The relax test is written <code>cand &gt; dist[v]</code>", "Only the start gets a distance; everything else stays at ∞"], ["The update is <code>dist[v] = w</code>", "Distances are tiny: each is just one road's length"], ["The next node is the first reached one, not the smallest", "Right on some maps, too big where a side road is shorter"]],
      why: "Without a done mark, the same smallest node is picked for ever. A reversed test is never true when the old value is ∞, so nothing updates. Storing w forgets the distance so far. Taking any reached node, not the smallest, locks in a node before its shortcut is found, so it works only by luck." },
  ]);
})();

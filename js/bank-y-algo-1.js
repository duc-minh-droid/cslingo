/* Revision bank, fourth set (algo-1): the random surfer, PageRank, Dijkstra, A*, routing and linear programming.
   New diagram kinds for these modules: tape strips, number line, flowchart, trace tables, heatmap, dot plot, log bars,
   priority-queue boxes, cost grid, search tree, f-plot, sequence diagram, small multiples, stacked bars, feasible regions.
   Every number was produced by running the real algorithm (the PageRank and A* parts are computed below). */
(function () {
  const B = NIC.bank, Qf = NIC.qfig;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body, pick) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px${pick ? "" : ";display:block"}">${body}</svg>`;
  const rect = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 9}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 2}" ${o.dash ? 'stroke-dasharray="5 4"' : ""}/>`;
  const line = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.w || 2}" ${o.dash ? 'stroke-dasharray="5 4"' : ""} ${o.arrow ? `marker-end="url(#${o.arrow})"` : ""} stroke-linecap="round"/>`;
  let uid = 0;
  const defsArrow = (id, col) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${col || "var(--text-dim)"}"/></marker></defs>`;
  const note = (s) => `<div class="faint" style="margin:0 0 6px;font-weight:800">${s}</div>`;
  const dim = "var(--text-dim)";

  /* ---------- PageRank (power iteration), used by several figures ---------- */
  const WEB = { A: ["B", "C"], B: ["C"], C: ["A"], D: ["C"] }, IDS = ["A", "B", "C", "D"];
  const prStep = (p, d) => { const q = {}; IDS.forEach((k) => (q[k] = (1 - d) / 4)); IDS.forEach((k) => WEB[k].forEach((t) => (q[t] += d * p[k] / WEB[k].length))); return q; };
  const prRun = (start, d, n) => { const r = [start]; for (let i = 0; i < n; i++) r.push(prStep(r[i], d)); return r; };
  const uni = { A: 0.25, B: 0.25, C: 0.25, D: 0.25 };
  let prLimit = uni; for (let i = 0; i < 400; i++) prLimit = prStep(prLimit, 0.85);

  /* =====================================================================
     a1-surfer
     ===================================================================== */
  // 1. tape strips: who jumps most?
  const tapeFig = () => {
    const tapes = { A: [1, 4, 7, 9, 12, 14, 17, 19], B: [11], C: [0, 1, 2, 4, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 19] };
    let s = rect(10, 4, 14, 14, { fill: "var(--teal-dim)", stroke: "var(--teal)", r: 4 }) + tx(30, 16, "followed a link", { a: "start", sz: 12 }) +
      rect(170, 4, 14, 14, { fill: "var(--amber-dim)", stroke: "var(--amber)", r: 4 }) + tx(190, 16, "teleported", { a: "start", sz: 12 });
    Object.entries(tapes).forEach(([k, js], r) => {
      const y = 34 + r * 46;
      s += tx(6, y + 20, "Surfer " + k, { a: "start", sz: 13 });
      for (let i = 0; i < 20; i++) {
        const j = js.includes(i);
        s += rect(84 + i * 20.5, y, 18, 28, { fill: j ? "var(--amber-dim)" : "var(--teal-dim)", stroke: j ? "var(--amber)" : "var(--teal)", r: 5 });
      }
    });
    return svg(510, 176, s);
  };
  // 2. number line for d
  const numLineFig = () => {
    const X = (d) => 20 + (d - 0.4) / 0.6 * 400, marks = [[0.5, 0], [0.75, 1], [0.9, 0], [0.95, 1], [0.99, 0]];
    let s = line(20, 60, 420, 60, { w: 4 });
    [0.4, 0.6, 0.8, 1].forEach((d) => (s += line(X(d), 54, X(d), 66, { w: 2 }) + tx(X(d), 92 + (d === 1 ? 0 : 0), d === 1 ? "1.0" : d.toFixed(1), { sz: 11, c: dim })));
    marks.forEach(([d, dn]) => {
      const ly = dn ? 100 : 28;
      s += `<g data-pick="${d}"><rect x="${X(d) - 22}" y="6" width="44" height="108" fill="transparent"/>${line(X(d), 60, X(d), dn ? 90 : 36, { w: 2, dash: true })}<circle cx="${X(d)}" cy="60" r="9" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(d), ly + (dn ? 12 : 4), d, { sz: 14, c: "var(--blue-ink)" })}</g>`;
    });
    return svg(440, 120, s, true);
  };
  // 3. convergence plot for page A
  const convFig = () => {
    const a = prRun({ A: 0, B: 0, C: 0, D: 1 }, 0.85, 12).map((r) => r.A), b = prRun(uni, 0.85, 12).map((r) => r.A);
    const X = (i) => 46 + i * 36, Y = (v) => 190 - v * 170;
    let s = "";
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => (s += line(46, Y(v), 478, Y(v), { c: "var(--line)", w: 1 }) + tx(38, Y(v) + 4, v, { a: "end", sz: 11, c: dim })));
    for (let i = 0; i <= 12; i += 2) s += tx(X(i), 208, i, { sz: 11, c: dim });
    s += tx(262, 224, "steps", { sz: 12, c: dim }) + tx(6, 10, "rank of A", { a: "start", sz: 12, c: dim });
    const path = (v, c) => `<path d="${v.map((y, i) => `${i ? "L" : "M"}${X(i)} ${Y(y)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += path(a, "var(--violet)") + path(b, "var(--blue)");
    s += line(300, 14, 324, 14, { c: "var(--violet)", w: 4 }) + tx(330, 18, "start: all on D", { a: "start", sz: 12 }) + line(300, 32, 324, 32, { c: "var(--blue)", w: 4 }) + tx(330, 36, "start: equal", { a: "start", sz: 12 });
    return note("Links: A→B, A→C, B→C, C→A, D→C. Damping d = 0.85.") + svg(500, 232, s);
  };
  // 4. flowchart
  const flowFig = () => {
    const id = "fl" + ++uid, bx = (x, y, w, h, lines, pid) => `<g ${pid ? `data-pick="${pid}"` : ""}>${rect(x, y, w, h, { fill: "var(--panel)" })}${lines.map((l, i) => tx(x + w / 2, y + h / 2 + 5 - (lines.length - 1) * 8 + i * 17, l, { sz: 13 })).join("")}</g>`;
    let s = defsArrow(id) + line(250, 46, 250, 66, { arrow: id }) + line(200, 112, 120, 140, { arrow: id }) + line(300, 112, 380, 140, { arrow: id }) + line(110, 196, 190, 220, { arrow: id }) + line(390, 196, 310, 220, { arrow: id });
    s += bx(165, 4, 170, 42, ["Start on a page"], "start") + bx(130, 68, 240, 44, ["Flip a coin: heads", "with probability d"], "flip") +
      bx(10, 140, 210, 56, ["Pick one of this page's", "links at random"], "links") + bx(280, 140, 210, 56, ["Jump to any page", "at random"], "jump") + bx(130, 222, 240, 40, ["Move there, then repeat"], "move");
    s += tx(140, 118, "heads", { sz: 12, c: "var(--teal-ink)", a: "end" }) + tx(360, 118, "tails", { sz: 12, c: "var(--amber-ink)", a: "start" });
    return svg(500, 268, s, true);
  };

  B.add("a1-surfer", [
    { type: "order", q: "Each strip records 20 steps of one surfer: green = followed a link, orange = jumped to a random page. The three surfers used d = 0.95, 0.6 and 0.25. Put them in order, from the <b>biggest</b> d to the smallest.",
      fig: tapeFig(), items: ["Surfer B", "Surfer A", "Surfer C"],
      hint: "d is the chance of following a link, so the jump rate is 1 − d.",
      why: "Surfer B jumped once in 20 steps (about 5%), so d is about 0.95. Surfer A jumped 8 times (40%), so d is about 0.6. Surfer C jumped 15 times (75%), so d is about 0.25. A short strip is noisy, but the jump rate always estimates 1 − d." },
    { type: "pick", q: "A surfer follows a link with probability d at each step, and otherwise teleports. On average the surfer takes about <b>10 steps between one teleport and the next</b>. Click the value of d that does this.",
      fig: numLineFig(), a: "0.9", hint: "A teleport happens with probability 1 − d. Waiting for something of probability p takes about 1 ÷ p steps.",
      why: "The wait is about 1 ÷ (1 − d). With d = 0.9 that is 1 ÷ 0.1 = 10 steps. d = 0.75 gives 4, d = 0.95 gives 20 and d = 0.99 gives 100. Near 1, a tiny change in d makes a huge change in how long the surfer wanders before jumping." },
    { type: "mcq", q: "Page A's rank over 12 steps, from two different starting guesses. A third run starts with <b>all the rank on A</b> (so A begins at 1). Where is A's rank after 12 steps?",
      fig: convFig(), o: ["Close to where the other two lines settle", "Still near 1, since it began as the top page", "Lower than the others, a gap that never closes", "Zero, because every page gives all its rank away"], a: 0,
      why: "The long-run ranks are fixed by the links and by d, not by the starting guess. Each step shrinks the leftover effect of the start by about a factor d, so every start ends at the same level (A is about 0.37 here)." },
    { type: "pick", q: "Your simulator crashes on one particular page with <code>IndexError: Cannot choose from an empty sequence</code>. Click the box of the flowchart where that happens.",
      fig: flowFig(), a: "links",
      why: "Choosing at random needs at least one link to choose from. A page with no outgoing links (a dangling page) has none, so \"pick one of this page's links\" fails there. The usual fix is to let such a page jump anywhere, as if it linked to every page. The coin flip and the jump box work on any page." },
  ]);

  /* =====================================================================
     a1-pagerank
     ===================================================================== */
  // 1. worked trace with a wrong number
  const traceTable = () => {
    const rows = [[0.25, 0.25, 0.25, 0.25], [0.25, 0.125, 0.625, 0], [0.625, 0.125, 0.375, 0], [0.375, 0.3125, 0.4375, 0]];
    let s = tx(40, 18, "step", { sz: 12, c: dim }) + IDS.map((k, j) => tx(140 + j * 105, 18, "page " + k, { sz: 12, c: dim })).join("");
    rows.forEach((r, i) => {
      const y = 28 + i * 38;
      s += tx(40, y + 22, i, { sz: 14, f: "var(--mono)" });
      r.forEach((v, j) => (s += `<g data-pick="${i}${IDS[j]}">${rect(92 + j * 105, y, 96, 32)}${tx(140 + j * 105, y + 21, v, { sz: 15, f: "var(--mono)" })}</g>`));
    });
    return note("Links: A→B, A→C, B→C, C→A, D→C. No damping. Each page splits its rank equally between its links.") + svg(520, 186, s, true);
  };
  // 2. dot plot (in-links vs rank)
  const dotFig = () => {
    const L = { a: ["H", "Q"], b: ["H"], c: ["H"], H: ["Z"], Z: ["a"], Q: ["b"] }, ks = Object.keys(L);
    let r = {}; ks.forEach((k) => (r[k] = 1 / 6));
    for (let t = 0; t < 400; t++) { const q = {}; ks.forEach((k) => (q[k] = 0.15 / 6)); ks.forEach((k) => L[k].forEach((x) => (q[x] += 0.85 * r[k] / L[k].length))); r = q; }
    const inl = {}; ks.forEach((k) => (inl[k] = 0)); ks.forEach((k) => L[k].forEach((x) => inl[x]++));
    const off = { a: -33, Z: -11, b: 11, Q: 33 }, Y = (v) => 190 - v / 0.3 * 165, X = (n) => 70 + n * 130;
    let s = "";
    [0, 0.1, 0.2, 0.3].forEach((v) => (s += line(50, Y(v), 500, Y(v), { c: "var(--line)", w: 1 }) + tx(42, Y(v) + 4, v.toFixed(1), { a: "end", sz: 11, c: dim })));
    [0, 1, 2, 3].forEach((n) => (s += tx(X(n), 216, n, { sz: 12, c: dim })));
    s += tx(280, 236, "number of in-links", { sz: 12, c: dim }) + tx(6, 12, "rank", { a: "start", sz: 12, c: dim });
    ks.forEach((k) => (s += `<g data-pick="${k}"><circle cx="${X(inl[k]) + (off[k] || 0)}" cy="${Y(r[k])}" r="12" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(inl[k]) + (off[k] || 0), Y(r[k]) + 5, k, { sz: 13, c: "var(--blue-ink)" })}</g>`));
    return note("Links: a→H, a→Q, b→H, c→H, H→Z, Z→a, Q→b. d = 0.85. (Pages with the same number of in-links are spread sideways so they don't overlap.)") + svg(520, 244, s, true);
  };
  // 3. heatmap of iterations
  const heatRows = prRun(uni, 0.85, 13), fin = IDS.map((k) => prLimit[k].toFixed(2));
  const settleRow = heatRows.findIndex((_, i) => heatRows.slice(i).every((r) => IDS.every((k, j) => r[k].toFixed(2) === fin[j])));
  const heatFig = () => {
    let s = tx(34, 16, "step", { sz: 12, c: dim }) + IDS.map((k, j) => tx(140 + j * 90, 16, "page " + k, { sz: 12, c: dim })).join("");
    heatRows.forEach((r, i) => {
      const y = 24 + i * 22;
      s += `<g data-pick="${i}">` + rect(52, y, 360, 20, { r: 4, fill: "transparent", stroke: "var(--line)", sw: 1 }) + tx(34, y + 15, i, { sz: 12, f: "var(--mono)" });
      IDS.forEach((k, j) => (s += `<rect x="${55 + j * 90}" y="${y + 1}" width="86" height="18" rx="3" fill="var(--blue)" opacity="${(0.08 + r[k] * 0.9).toFixed(2)}"/>` + tx(98 + j * 90, y + 15, r[k].toFixed(2), { sz: 12, f: "var(--mono)" })));
      s += "</g>";
    });
    return svg(430, 24 + heatRows.length * 22 + 4, s, true);
  };
  // 4. log bars
  const logFig = () => {
    const bars = [["A", 6], ["B", 7], ["C", 12], ["D", 18]], Y = (e) => 200 - e * 10;
    let s = "";
    const SUPS = { 0: "10⁰", 6: "10⁶", 12: "10¹²", 18: "10¹⁸" };
    [0, 6, 12, 18].forEach((e) => (s += line(60, Y(e), 480, Y(e), { c: "var(--line)", w: 1 }) + tx(52, Y(e) + 4, SUPS[e], { a: "end", sz: 12, c: dim })));
    bars.forEach(([k, e], i) => (s += `<g data-pick="${k}"><rect x="${90 + i * 100}" y="${Y(e)}" width="64" height="${200 - Y(e)}" rx="8" fill="var(--blue-dim)" stroke="var(--blue)" stroke-width="3"/>${tx(122 + i * 100, 222, "Bar " + k, { sz: 13 })}</g>`));
    return svg(500, 234, s, true);
  };

  B.add("a1-pagerank", [
    { type: "pick", q: "A student hand-runs PageRank (no damping) and the table shows rank after each step. <b>One number is wrong</b>, and the later rows were built on it. Click the first wrong number.",
      fig: traceTable(), a: "2C", hint: "Row 2 comes from row 1. Page C gets a share of A's rank, all of B's and all of D's.",
      why: "Page A has two links, so it sends only half of its 0.25 to C. C therefore gets 0.125 from A, 0.125 from B and 0 from D, a total of 0.25, not 0.375. The 0.375 comes from sending all of A's rank to C. Quick check: row 2 now adds up to 1.125, but PageRank never creates rank, so the total must stay 1." },
    { type: "pick", q: "Four of these six pages have exactly <b>one</b> in-link, yet two of them rank far above the other two. Click those two pages.",
      fig: dotFig(), a: ["Z", "a"], hint: "Look at who the single in-link comes from, and how many other links that page has.",
      why: "Z's only in-link comes from H, the best-linked page, and H sends all its rank to Z. a's only in-link comes from Z, which passes everything on. Q and b are fed by pages that split their rank (a shares between H and Q) or by a weak page. What matters is not how many links point at you but how much rank each one carries." },
    { type: "pick", q: "Each row is one step of damped PageRank (d = 0.85, all pages start equal). The final answer is A 0.37, B 0.20, C 0.39, D 0.04. Click the first row from which the rounded numbers <b>never change again</b>.",
      fig: heatFig(), a: String(settleRow), hint: "Row 8 matches the final numbers, but check the row after it.",
      why: "Row 8 matches, but row 9 has B = 0.19 and C = 0.40, so it wobbles back out. A, B and C form a loop that sloshes rank around, and each step only shrinks the leftover error by about a factor d = 0.85. From row " + settleRow + " on, every row rounds to the final numbers." },
    { type: "pick", q: "A web has 1,000,000 pages with about 10 links each. The dense matrix G has an entry for every pair of pages, and multiplying G by p touches each entry once. Click the bar that shows the work for that dense product (log scale: each gridline is 1,000,000 times the one below).",
      fig: logFig(), a: "C", hint: "Pairs of pages: a million times a million.",
      why: "G has 1,000,000 × 1,000,000 = 10¹² entries. The link list has only about 1,000,000 × 10 = 10⁷, a hundred thousand times less work, which is why real PageRank code keeps the links in a sparse list and never builds the dense matrix." },
  ]);

  /* =====================================================================
     a2-dijkstra
     ===================================================================== */
  // 1. priority queue boxes
  const pqFig = () => {
    let s = tx(4, 14, "settled so far", { a: "start", sz: 12, c: dim });
    [["S", 0], ["B", 1], ["A", 3], ["C", 4]].forEach(([k, d], i) => (s += rect(4 + i * 84, 22, 78, 34, { fill: "var(--teal-dim)", stroke: "var(--teal)" }) + tx(43 + i * 84, 44, `${k} = ${d}`, { sz: 14 })));
    s += tx(4, 88, "priority queue (smallest first)", { a: "start", sz: 12, c: dim });
    [["7", "C"], ["7", "T"], ["10", "T"]].forEach(([k, n], i) => (s += `<g data-pick="${k}${n}">${rect(4 + i * 104, 98, 96, 44)}${tx(52 + i * 104, 126, `(${k}, ${n})`, { sz: 16, f: "var(--mono)" })}</g>`));
    return note("Roads: S–A 4, S–B 1, B–A 2, A–C 1, B–C 6, C–T 3, A–T 7. Entries are (distance, node).") + svg(340, 150, s, true);
  };
  // 2. cost grid
  const GRID = [[0, 4, 1, 4, 9], [1, 4, 9, 1, 4], [1, 9, 1, 1, 1], [1, 1, 1, 9, 1], [4, 4, 9, 9, 0]];
  const gridFig = () => {
    let s = "";
    GRID.forEach((row, y) => row.forEach((c, x) => {
      const fill = c === 9 ? "var(--rose-dim)" : c === 4 ? "var(--amber-dim)" : "var(--panel)", stroke = c === 9 ? "var(--rose)" : c === 4 ? "var(--amber)" : "var(--line-2)";
      const t = x === 0 && y === 0 ? "S" : x === 4 && y === 4 ? "G" : c;
      const g = rect(10 + x * 52, 6 + y * 52, 48, 48, { r: 8, fill: x === 0 && y === 0 || x === 4 && y === 4 ? "var(--blue-dim)" : fill, stroke: x === 0 && y === 0 || x === 4 && y === 4 ? "var(--blue)" : stroke }) + tx(34 + x * 52, 36 + y * 52, t, { sz: 17 });
      s += (x === 0 && y === 0) || (x === 4 && y === 4) ? g : `<g data-pick="${x},${y}">${g}</g>`;
    }));
    return note("S and G cost nothing. Moves are up, down, left or right.") + svg(280, 270, s, true);
  };
  // 3. trace table
  const djTable = () => {
    const rows = [["settle S", ["3", "7", "∞", "∞", "∞"], []], ["settle A", ["3", "5", "11", "∞", "∞"], [0]], ["settle B", ["3", "5", "8", "10", "∞"], [0, 1]], ["settle C", ["3", "5", "8", "10", "12"], [0, 1, 2]]];
    let s = ["A", "B", "C", "D", "E"].map((k, j) => tx(176 + j * 62, 16, k, { sz: 13, c: dim })).join("");
    rows.forEach(([lab, v, set], i) => {
      const y = 26 + i * 36;
      s += tx(8, y + 22, lab, { a: "start", sz: 13 });
      v.forEach((x, j) => (s += `<g data-pick="${i + 1}${"ABCDE"[j]}">${rect(148 + j * 62, y, 58, 30, { r: 8, fill: set.includes(j) ? "var(--teal-dim)" : "var(--panel)", stroke: set.includes(j) ? "var(--teal)" : "var(--line-2)" })}${tx(177 + j * 62, y + 21, x, { sz: 15, f: "var(--mono)" })}</g>`));
    });
    return note("Roads: S–A 3, S–B 7, A–B 2, A–C 8, B–C 3, B–D 5, C–D 1, C–E 4, D–E 2. Green = settled.") + svg(470, 176, s, true);
  };
  // 4. negative road
  const negFig = Qf.graph({ S: [50, 125], A: [230, 50], B: [230, 200], T: [410, 50] }, [["S", "A", 1], ["S", "B", 3], ["B", "A", "−5"], ["A", "T", 4]], { w: 460, h: 250, directed: true });

  B.add("a2-dijkstra", [
    { type: "pick", q: "Dijkstra uses a priority queue with <b>lazy deletion</b>: it never edits the queue, it just skips any entry popped for a node that is already settled. C has just been settled. Click every entry that will be <b>skipped</b> when it is popped.",
      fig: pqFig(), a: ["7C", "10T"], hint: "Which nodes will be settled by the time each entry comes to the front?",
      why: "(7, C) is skipped because C is already settled at 4. (10, T) is skipped too: T is not settled yet, but (7, T) comes off first and settles it at 7, so by the time (10, T) is popped it is stale. Only (7, T) is a real step. Stale entries are not just those for settled nodes now, but for any node that will already be settled when they are popped." },
    { type: "pick", q: "Each cell shows the price of stepping onto it. Dijkstra finds the cheapest route from S to G. Click <b>every cell on that route</b> (apart from S and G).",
      fig: gridFig(), a: ["0,1", "0,2", "0,3", "1,3", "2,3", "2,2", "3,2", "4,2", "4,3"], hint: "Count prices, not steps. A detour of 1s can beat a short path through a 9.",
      why: "The cheapest route goes down the left edge, along the bottom-left 1s, up through the middle and across to the right edge, then down into G. It takes 10 steps but every cell on it costs 1, so the total is 9. The route with the fewest steps (8) has to cross at least one 4 or 9 and costs at least 13." },
    { type: "pick", q: "A student traces Dijkstra from S, writing the tentative distances after each settle (green = settled). <b>Exactly one number is wrong</b>. Click it.",
      fig: djTable(), a: "4D", hint: "Settling C at 8 relaxes C–D and C–E. Check both.",
      why: "When C (distance 8) is settled, its road to D costs 1, so D can be reached at 8 + 1 = 9, better than 10. The student left D at 10. E = 8 + 4 = 12 was updated correctly." },
    { type: "mcq", q: "Dijkstra is run on this directed map even though one road has a negative cost. What does it report for the distance from S to T, and is that right?",
      fig: negFig, o: ["It reports 5, but the true shortest is 2", "It reports 2, which is the true shortest", "It reports 5, which is the true shortest", "It never finishes, as the −5 road keeps lowering A"], a: 0,
      why: "Dijkstra settles A at 1 (cheaper than B at 3) and never looks at it again. Only later does B show the route S → B → A costing 3 − 5 = −2, which would make T = −2 + 4 = 2. But A is already settled, so T stays 5. Its promise that a settled distance is final needs every road to cost zero or more." },
  ]);

  /* =====================================================================
     a2-astar
     ===================================================================== */
  // 1. open list boxes
  const openFig = () => {
    const items = [["P", 3, 9], ["Q", 5, 4], ["R", 7, 2], ["S", 2, 8], ["T", 6, 6]], pos = [[6, 24], [176, 24], [346, 24], [6, 100], [176, 100]];
    let s = tx(6, 14, "open list, in the order the cells were found", { a: "start", sz: 12, c: dim });
    items.forEach(([n, g, h], i) => (s += `<g data-pick="${n}">${rect(pos[i][0], pos[i][1], 160, 66)}${tx(pos[i][0] + 80, pos[i][1] + 28, "Cell " + n, { sz: 15 })}${tx(pos[i][0] + 80, pos[i][1] + 52, `g = ${g}   h = ${h}`, { sz: 14, f: "var(--mono)", c: dim })}</g>`));
    return svg(512, 176, s, true);
  };
  // 2. f along a path
  const AP = { names: ["S", "a", "b", "c", "d", "e", "G"], cost: [2, 3, 2, 4, 1, 2], h: [12, 10, 9, 4, 3, 2, 0] };
  const apG = [0]; AP.cost.forEach((c, i) => apG.push(apG[i] + c));
  const apF = AP.h.map((h, i) => h + apG[i]), apDrop = apF.findIndex((f, i) => i && f < apF[i - 1]);
  const fPlot = () => {
    const X = (i) => 50 + i * 68, Y = (f) => 190 - (f - 10) / 5 * 150;
    let s = "";
    [10, 11, 12, 13, 14, 15].forEach((f) => (s += line(36, Y(f), 490, Y(f), { c: "var(--line)", w: 1 }) + tx(30, Y(f) + 4, f, { a: "end", sz: 11, c: dim })));
    s += line(36, Y(14), 490, Y(14), { c: "var(--teal)", w: 2, dash: true }) + tx(490, Y(14) + 18, "optimal cost 14", { a: "end", sz: 12, c: "var(--teal-ink)" });
    s += `<path d="${apF.map((f, i) => `${i ? "L" : "M"}${X(i)} ${Y(f)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
    AP.names.forEach((n, i) => (s += `<g data-pick="${n}"><rect x="${X(i) - 30}" y="20" width="60" height="215" fill="transparent"/><circle cx="${X(i)}" cy="${Y(apF[i])}" r="10" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(i), 214, n, { sz: 14 })}${tx(X(i), 232, "h = " + AP.h[i], { sz: 11, c: dim, f: "var(--mono)" })}</g>`));
    return svg(510, 240, s, true);
  };
  // 3. search tree
  const TREE = { R: [0, 8, null, 0], A: [2, 7, "R", 2], B: [3, 5, "R", 3], C: [1, 9, "R", 1], D: [6, 3, "A", 4], E: [4, 5, "A", 2], F: [5, 3, "B", 2], J: [7, 2, "B", 4], H: [3, 7, "C", 2], Z: [8, 0, "F", 3] };
  // (name: [g, h, parent, edge cost]) -- run A* to find what it expands
  const aExp = (() => {
    const open = ["R"], out = [];
    while (open.length) {
      open.sort((x, y) => TREE[x][0] + TREE[x][1] - TREE[y][0] - TREE[y][1] || TREE[x][1] - TREE[y][1]);
      const n = open.shift(); if (n === "Z") break; out.push(n);
      Object.keys(TREE).filter((k) => TREE[k][2] === n).forEach((k) => open.push(k));
    }
    return out;
  })();
  const treeFig = () => {
    const P = { R: [250, 6], A: [100, 80], B: [250, 80], C: [400, 80], D: [40, 154], E: [140, 154], F: [220, 154], J: [320, 154], H: [400, 154], Z: [220, 228] };
    let s = "";
    Object.entries(TREE).forEach(([k, [g, h, p, c]]) => { if (!p) return; const [x, y] = P[k], [px, py] = P[p]; s += line(px, py + 40, x, y, { w: 2 }) + tx((x + px) / 2 + (x < px ? -10 : 10), (y + py + 40) / 2 + 3, c, { sz: 12, c: dim }); });
    Object.entries(P).forEach(([k, [x, y]]) => (s += rect(x - 36, y, 72, 40, { fill: k === "Z" ? "var(--teal-dim)" : "var(--panel)", stroke: k === "Z" ? "var(--teal)" : "var(--line-2)" }) + tx(x, y + 17, k, { sz: 14 }) + tx(x, y + 33, `${TREE[k][0]} + ${TREE[k][1]}`, { sz: 11, c: dim, f: "var(--mono)" })));
    return note("Each box shows <b>g + h</b>. Numbers on the lines are road costs. Z is the goal.") + svg(500, 274, s);
  };
  // 4. admissibility table
  const admFig = () => {
    const nodes = ["P", "Q", "R", "S", "G"], cols = [["true", [9, 7, 6, 3, 0]], ["h1", [0, 0, 0, 0, 0]], ["h2", [11, 7, 6, 3, 0]], ["h3", [9, 6, 5, 3, 0]], ["h4", [9, 7, 7, 3, 0]], ["h5", [8, 6, 4, 2, 1]]];
    let s = tx(26, 18, "node", { sz: 12, c: dim });
    cols.forEach(([n], j) => (s += tx(100 + j * 72, 18, n === "true" ? "true cost" : n, { sz: 13, c: n === "true" ? "var(--teal-ink)" : dim })));
    nodes.forEach((n, i) => {
      const y = 28 + i * 30;
      s += tx(26, y + 20, n, { sz: 14 });
      cols.forEach(([c, v], j) => (s += rect(66 + j * 72, y, 68, 26, { r: 7, fill: j === 0 ? "var(--teal-dim)" : "var(--panel)", stroke: j === 0 ? "var(--teal)" : "var(--line-2)" }) + tx(100 + j * 72, y + 19, v[i], { sz: 14, f: "var(--mono)" })));
    });
    return svg(510, 184, s);
  };

  B.add("a2-astar", [
    { type: "pick", q: "A* expands the open cell with the smallest <b>f = g + h</b>, and when two cells tie it takes the one with the smaller h (closer to the goal). Click the cell it expands next.",
      fig: openFig(), a: "R", hint: "Add g and h for every cell. Two cells share the lowest total.",
      why: "The f values are P 12, Q 9, R 9, S 10 and T 12. Q and R tie on 9, so the smaller h wins: R (h = 2) goes before Q (h = 4). Either order still finds an optimal path, but preferring the cell nearer the goal tends to expand fewer cells." },
    { type: "pick", q: "A heuristic is <b>consistent</b> if f = g + h never goes down as A* moves along a path. This plot shows f at each node along one route (h is written under each node). Click the node where consistency breaks.",
      fig: fPlot(), a: AP.names[apDrop], hint: "Look for the node where f falls.",
      why: "f reads 12, 12, 14, then drops to 11 at c. Going from b to c costs 2, but h fell from 9 to 4, a drop of 5. Consistency needs h(b) ≤ cost(b→c) + h(c), that is 9 ≤ 2 + 4, which fails. This h is still admissible (at c the real remaining cost is 7 and h = 4): admissible does not guarantee consistent." },
    { type: "multi", q: "A* searches this tree for the goal Z (g + h is shown in each box). Besides the root R, which nodes does A* <b>expand</b> before it takes Z off the open list and stops? Select all.",
      fig: treeFig(), o: ["A", "B", "C", "D", "F", "J"], a: ["A", "B", "C", "D", "F", "J"].map((n, i) => (aExp.includes(n) ? i : -1)).filter((i) => i >= 0),
      hint: "Always expand the smallest f. The best route costs 8.",
      why: "R opens A (9), B (8) and C (10), so B goes next. B opens F (8) and J (9), so F goes next and reveals Z with f = 8, the smallest on the list, so the search stops. A, C and J were seen but never expanded (their f is worse than 8) and D, E and H were never even generated. A* never touches nodes whose f exceeds the optimal cost." },
    { type: "cat", q: "The table gives the true remaining cost from each node to the goal G, and five candidate heuristics. Sort each heuristic: is it admissible?",
      fig: admFig(), buckets: ["Admissible", "Not admissible"],
      items: [["<code>h1</code>", 0], ["<code>h2</code>", 1], ["<code>h3</code>", 0], ["<code>h4</code>", 1], ["<code>h5</code>", 1]],
      why: "Admissible means h never exceeds the true remaining cost at any node, and is 0 at the goal. h1 = 0 is always safe (it just turns A* into Dijkstra). h3 is at or below the truth everywhere. h2 says 11 at P (true 9), h4 says 7 at R (true 6) and h5 says 1 at G (true 0): a single overestimate is enough to lose the guarantee of an optimal path." },
  ]);

  /* =====================================================================
     a2-routing
     ===================================================================== */
  // 1. sequence diagram
  const seqFig = () => {
    const id = "sq" + ++uid, LX = { A: 90, B: 250, C: 410 };
    let s = defsArrow(id);
    Object.entries(LX).forEach(([k, x]) => (s += rect(x - 26, 4, 52, 30, { fill: "var(--panel)" }) + tx(x, 25, k, { sz: 15 }) + line(x, 34, x, 296, { c: "var(--line-2)", w: 2, dash: true })));
    s += tx(90, 54, "C = 2 via B", { sz: 12, c: dim }) + tx(250, 54, "C = 1 direct", { sz: 12, c: dim });
    s += line(318, 82, 342, 106, { c: "var(--rose)", w: 5 }) + line(342, 82, 318, 106, { c: "var(--rose)", w: 5 }) + tx(330, 126, "B–C fails", { sz: 12, c: "var(--rose-ink)" });
    [["m1", "A", "B", "C = 2"], ["m2", "B", "A", "C = 3"], ["m3", "A", "B", "C = 4"], ["m4", "B", "A", "C = 5"]].forEach(([id2, f, t, lab], i) => {
      const y = 170 + i * 36, x1 = LX[f] + (LX[t] > LX[f] ? 6 : -6), x2 = LX[t] + (LX[t] > LX[f] ? -6 : 6);
      s += `<g data-pick="${id2}"><rect x="${Math.min(LX[f], LX[t])}" y="${y - 18}" width="160" height="32" fill="transparent"/>${line(x1, y, x2, y, { c: "var(--blue)", w: 3, arrow: id })}${tx(170, y - 6, lab, { sz: 15, c: "var(--blue-ink)" })}</g>`;
    });
    return note("Line of routers A–B–C, every link costs 1. Messages go down the page in time order.") + svg(500, 304, s, true);
  };
  // 2. small multiples of networks
  const netFig = () => {
    const id = "nt" + ++uid;
    const nets = [
      { t: "Network 1", n: { A: [22, 90], B: [64, 90], C: [106, 90], X: [142, 90], D: [64, 128] }, e: [["A", "B"], ["B", "C"], ["B", "D"], ["C", "X", 1]] },
      { t: "Network 2", n: { A: [22, 90], B: [80, 56], C: [80, 126], X: [138, 90] }, e: [["A", "B"], ["A", "C"], ["B", "X", 1], ["C", "X"]] },
      { t: "Network 3", n: { A: [22, 100], B: [42, 62], C: [42, 134], D: [118, 62], X: [140, 100], E: [118, 134] }, e: [["A", "B"], ["A", "C"], ["B", "C"], ["B", "D", 1], ["D", "X"], ["X", "E"], ["D", "E"]] },
    ];
    let s = "";
    nets.forEach((nt, i) => {
      const ox = i * 170;
      s += `<g data-pick="n${i + 1}" transform="translate(${ox},0)">${rect(2, 2, 162, 156, { r: 12 })}${tx(83, 22, nt.t, { sz: 13 })}`;
      nt.e.forEach(([a, b, f]) => { const [x1, y1] = nt.n[a], [x2, y2] = nt.n[b]; s += line(x1, y1, x2, y2, { c: f ? "var(--rose)" : "var(--text-dim)", w: f ? 3 : 2.5, dash: !!f }); });
      Object.entries(nt.n).forEach(([k, [x, y]]) => (s += `<circle cx="${x}" cy="${y}" r="12" fill="${k === "X" ? "var(--teal-dim)" : "var(--panel)"}" stroke="${k === "X" ? "var(--teal)" : "var(--line-2)"}" stroke-width="3"/>` + tx(x, y + 4, k, { sz: 12 })));
      s += "</g>";
    });
    return svg(510, 162, s, true);
  };
  // 3. stacked bars of per-link delay
  const stackFig = () => {
    const routes = [["Route 1", [20, 25]], ["Route 2", [9, 8, 10]], ["Route 3", [5, 6, 5, 7]]];
    let s = tx(80, 14, "delay of each link in the route, in milliseconds", { a: "start", sz: 12, c: dim });
    routes.forEach(([n, segs], i) => {
      const y = 28 + i * 52; let x = 80;
      s += tx(6, y + 28, n, { a: "start", sz: 13 });
      segs.forEach((d, j) => { s += rect(x, y, d * 8, 40, { r: 6, fill: j % 2 ? "var(--violet-dim)" : "var(--blue-dim)", stroke: j % 2 ? "var(--violet)" : "var(--blue)" }) + tx(x + d * 4, y + 26, d, { sz: 15 }); x += d * 8; });
    });
    return svg(500, 190, s);
  };
  // 4. flooding graph
  const floodFig = Qf.graph({ A: [40, 60], B: [170, 40], D: [330, 50], C: [80, 180], E: [230, 180], F: [390, 170] },
    [["A", "B"], ["A", "C"], ["B", "C"], ["B", "D"], ["C", "E"], ["D", "E"], ["D", "F"], ["E", "F"], ["B", "E"]], { w: 430, h: 220 });

  B.add("a2-routing", [
    { type: "pick", q: "C's link to B breaks, and the routers keep swapping distance-vector messages about destination C (no poisoned reverse). Click the message that first makes a router believe in a route to C that does not exist.",
      fig: seqFig(), a: "m1", hint: "After the break, who still thinks they can reach C, and whose route goes through whom?",
      why: "After the break B has no route to C. A, not yet knowing, advertises \"C = 2\", a route that goes through B itself. B accepts it and believes C is 3 away via A. Everything after that just feeds on this first false belief: B tells A 3, A moves to 4, and so on, counting to infinity. Poisoned reverse would stop it, since A would tell B \"C = ∞\"." },
    { type: "pick", q: "Distance-vector routers \"count to infinity\" when a destination becomes unreachable and the news spreads slowly. In each network the dashed red link fails, and X is the destination. In which network do the costs to X settle at a real, finite value afterwards?",
      fig: netFig(), a: "n2", hint: "After the failure, can every router still get to X by some path?",
      why: "In network 2 the failed link has a spare route: X is still reachable through C, so costs rise for a while and then settle on a true path. In networks 1 and 3 the failed link is X's only connection to the rest, so nobody can reach X any more and the routers keep raising each other's cost until it hits the maximum." },
    { type: "mcq", q: "A packet from A to Z can take one of three routes. Each segment shows one link's delay in milliseconds. Which pair of choices is right?",
      fig: stackFig(), o: ["Hop count: Route 1. Delay: Route 3", "Hop count: Route 3. Delay: Route 1", "Hop count: Route 2. Delay: Route 3", "Hop count: Route 1. Delay: Route 2 (the middle one)"], a: 0,
      why: "A hop count just counts links: Route 1 has 2, Route 2 has 3 and Route 3 has 4, so a hop-count metric picks Route 1. A delay metric adds the milliseconds: 20 + 25 = 45, 9 + 8 + 10 = 27 and 5 + 6 + 5 + 7 = 23, so it picks Route 3. Fewer hops is not the same as a faster route." },
    { type: "slider", q: "Router A's link cost changes, so A floods a link-state advertisement. Every router that gets the <b>first copy</b> forwards it out of all its links except the one it arrived on, and ignores later copies. About how many times is the advertisement sent over links in total (count each direction separately)?",
      fig: floodFig, min: 0, max: 40, step: 1, ans: 13, tol: 3, unit: "sends", hint: "A sends it on its 2 links. Each other router forwards it on all its links except one.",
      why: "A sends on its 2 links. Each other router forwards on its links minus one: B 3, C 2, D 2, E 3, F 1, which is 11. The total is 2 + 11 = 13, which is 2 × 9 links − 5. Duplicate copies still cross the links (and are discarded), so flooding costs about twice the number of links." },
  ]);

  /* =====================================================================
     a3-lp
     ===================================================================== */
  // 1. unbounded region
  const openRegion = () => {
    const X = (x) => 40 + x * 45, Y = (y) => 270 - y * 30;
    let s = "";
    for (let i = 0; i <= 8; i += 2) s += line(X(i), Y(0), X(i), Y(8), { c: "var(--line)", w: 1 }) + line(X(0), Y(i), X(8), Y(i), { c: "var(--line)", w: 1 }) + tx(X(i), Y(0) + 16, i, { sz: 11, c: dim }) + tx(X(0) - 8, Y(i) + 4, i, { a: "end", sz: 11, c: dim });
    s += `<polygon points="${[[0, 8], [0, 6], [1.6, 1.2], [4, 0], [8, 0], [8, 8]].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3"/>`;
    [[0, 6], [1.6, 1.2], [4, 0]].forEach(([x, y]) => (s += `<circle cx="${X(x)}" cy="${Y(y)}" r="6" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>`));
    s += tx(X(5.6), Y(5), "feasible region", { sz: 14, c: "var(--teal-ink)" }) + tx(X(5.6), Y(4.2), "(goes on for ever →)", { sz: 12, c: "var(--teal-ink)" });
    s += tx(X(0.95), Y(4.4), "3x + y = 6", { a: "start", sz: 12, c: dim }) + tx(X(2.3), Y(1.9), "x + 2y = 4", { a: "start", sz: 12, c: dim });
    return svg(420, 300, s);
  };
  // 2. best profit against the shared limit
  const profitFig = () => {
    const X = (b) => 50 + b * 42, Y = (z) => 220 - z * 9;
    let s = "";
    [0, 6, 12, 18].forEach((z) => (s += line(50, Y(z), 480, Y(z), { c: "var(--line)", w: 1 }) + tx(42, Y(z) + 4, z, { a: "end", sz: 11, c: dim })));
    for (let b = 0; b <= 10; b += 2) s += tx(X(b), 242, b, { sz: 11, c: dim });
    s += tx(270, 258, "shared limit b  (x + y ≤ b)", { sz: 12, c: dim }) + tx(6, 14, "best profit", { a: "start", sz: 12, c: dim });
    s += `<path d="M${X(0)} ${Y(0)} L${X(4)} ${Y(12)} L${X(7)} ${Y(18)} L${X(10)} ${Y(18)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>`;
    [[3, 9], [4, 12], [5, 14], [7, 18], [9, 18]].forEach(([b, z]) => (s += `<g data-pick="${b}"><rect x="${X(b) - 20}" y="20" width="40" height="225" fill="transparent"/><circle cx="${X(b)}" cy="${Y(z)}" r="12" fill="var(--panel)" stroke="var(--violet)" stroke-width="3"/>${tx(X(b), Y(z) + 5, b, { sz: 13, c: "var(--violet-ink)" })}</g>`));
    return svg(500, 264, s, true);
  };
  // 3. small multiples: objective directions
  const dirFig = () => {
    const id = "dr" + ++uid, X = (x) => 20 + x * 30, Y = (y) => 150 - y * 30, poly = [[0, 0], [4, 0], [4, 2], [2, 4], [0, 4]];
    const panels = [["a", "A: maximise 2x + y", [2, 1]], ["b", "B: maximise x + y", [1, 1]], ["c", "C: maximise x + 3y", [1, 3]]];
    let s = defsArrow(id, "var(--amber)");
    panels.forEach(([k, t, [dx, dy]], i) => {
      const L = Math.hypot(dx, dy), ex = 1.6 + dx / L * 1.3, ey = 1.6 + dy / L * 1.3;
      s += `<g data-pick="${k}" transform="translate(${i * 170},0)">${rect(2, 2, 162, 186, { r: 12 })}${tx(83, 22, t, { sz: 12 })}<polygon points="${poly.map(([x, y]) => `${X(x) + 6},${Y(y) + 18}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>` +
        line(X(1.6) + 6, Y(1.6) + 18, X(ex) + 6, Y(ey) + 18, { c: "var(--amber)", w: 4, arrow: id }) + tx(83, 182, "arrow = direction of better", { sz: 10, c: dim }) + "</g>";
    });
    return svg(510, 192, s, true);
  };
  // 4. resource usage bars
  const useFig = () => {
    const bars = [["Wood", 100, "24 of 24 kg used"], ["Labour", 100, "6 of 6 hours used"], ["Paint", 75, "1.5 of 2 litres used"]], Y = (p) => 190 - p * 1.6;
    let s = "";
    [0, 50, 100].forEach((p) => (s += line(50, Y(p), 490, Y(p), { c: "var(--line)", w: 1 }) + tx(42, Y(p) + 4, p + "%", { a: "end", sz: 11, c: dim })));
    bars.forEach(([n, u, lab], i) => {
      const x = 90 + i * 140;
      s += `<rect x="${x}" y="${Y(u)}" width="80" height="${190 - Y(u)}" rx="8" fill="var(--blue-dim)" stroke="var(--blue)" stroke-width="3"/>`;
      if (u < 100) s += `<rect x="${x}" y="${Y(100)}" width="80" height="${Y(u) - Y(100)}" rx="8" fill="none" stroke="var(--line-2)" stroke-width="3" stroke-dasharray="5 4"/>` + tx(x + 40, Y(100) + (Y(u) - Y(100)) / 2 + 5, "left over", { sz: 12, c: dim });
      s += tx(x + 40, 210, n, { sz: 14 }) + tx(x + 40, 228, lab, { sz: 11, c: dim });
    });
    return svg(500, 238, s);
  };

  B.add("a3-lp", [
    { type: "mcq", q: "Constraints: x + 2y ≥ 4, 3x + y ≥ 6 and x, y ≥ 0. The feasible region has no upper edge. Which objective has a finite best value on it?",
      fig: openRegion(), o: ["Maximise x + y", "Maximise 3x − y", "Minimise x + y", "Maximise y − 2x"], a: 2,
      hint: "Can you walk off the right or the top of the region and make the objective keep growing?",
      why: "The region runs on for ever to the right and upwards. x + y gets bigger as either grows, 3x − y keeps growing as x grows, and y − 2x keeps growing as y grows, so none of those has a maximum (the solver reports \"unbounded\"). Minimising x + y pushes towards the origin: the corners give 6 at (0, 6), 2.8 at (1.6, 1.2) and 4 at (4, 0), so the best is 2.8 at (1.6, 1.2)." },
    { type: "pick", q: "A factory maximises profit 3x + 2y with x ≤ 4, y ≤ 3 and one shared limit x + y ≤ b. The curve shows the best profit for each b. Click the <b>smallest</b> marked b at which raising the limit further stops helping.",
      fig: profitFig(), a: "7", hint: "Find where the curve goes flat.",
      why: "From b = 7 on, the best plan is x = 4, y = 3 (profit 18): the other two limits are the ones holding profit back, so extra shared room is worth nothing. Between b = 4 and 7 each extra unit buys 2 profit (one more y), and below 4 each unit buys 3 (one more x). The slope of the curve is what one more unit of the limit is worth." },
    { type: "pick", q: "Same feasible region in each picture, with a different objective. The amber arrow points the way the objective improves. Click the picture where the best plan is <b>not one corner</b> but a whole edge of equally good plans.",
      fig: dirFig(), a: "b", hint: "Slide the objective line along its arrow until it leaves the region. Does it touch a corner or an edge last?",
      why: "In B the objective x + y gives lines parallel to the slanted edge x + y = 6, so the whole edge from (4, 2) to (2, 4) is optimal, with value 6 everywhere along it. In A (2x + y) the last point is the corner (4, 2), value 10. In C (x + 3y) it is the corner (2, 4), value 14. A tie happens when the objective is parallel to an edge." },
    { type: "multi", q: "A bakery maximises profit 5x + 4y with wood 6x + 4y ≤ 24, labour x + 2y ≤ 6 and paint y ≤ 2. The best plan (x = 3, y = 1.5) uses the resources as shown. If you could get one more unit of just one resource, which would raise the best profit? Select all that apply.",
      fig: useFig(), o: ["Wood", "Labour", "Paint"], a: [0, 1], hint: "A resource with something left over is not what is holding profit back.",
      why: "Wood and labour are used up, so they are the binding limits: one more wood lifts the best profit from 21 to 21.75, and one more labour to about 21.33. Paint still has 0.5 left over, so more paint changes nothing and the best profit stays 21." },
  ]);
})();

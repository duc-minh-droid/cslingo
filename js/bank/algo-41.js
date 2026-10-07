/* ===== bank-y-algo-1.js ===== */
/* Revision bank, fourth set (algo-1): the random surfer, PageRank, Dijkstra, A*, routing and linear programming.
   New diagram kinds for these modules: tape strips, number line, flowchart, trace tables, heatmap, dot plot, log bars,
   priority-queue boxes, cost grid, search tree, f-plot, sequence diagram, small multiples, stacked bars, feasible regions.
   Every number was produced by running the real algorithm (the PageRank and A* parts are computed below). */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const B = NIC.bank;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body, pick) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px${pick ? "" : ";display:block"}">${body}</svg>`;
  const rect = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 9}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 2}" ${o.dash ? 'stroke-dasharray="5 4"' : ""}/>`;
  const line = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.w || 2}" ${o.dash ? 'stroke-dasharray="5 4"' : ""} ${o.arrow ? `marker-end="url(#${o.arrow})"` : ""} stroke-linecap="round"/>`;
  partScope.uid = 0;
  const defsArrow = (id, col) =>
    `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${col || "var(--text-dim)"}"/></marker></defs>`;
  const note = (s) => `<div class="faint" style="margin:0 0 6px;font-weight:800">${s}</div>`;
  const dim = "var(--text-dim)";

  /* ---------- PageRank (power iteration), used by several figures ---------- */
  const WEB = { A: ["B", "C"], B: ["C"], C: ["A"], D: ["C"] },
    IDS = ["A", "B", "C", "D"];
  const prStep = (p, d) => {
    const q = {};
    IDS.forEach((k) => (q[k] = (1 - d) / 4));
    IDS.forEach((k) => WEB[k].forEach((t) => (q[t] += (d * p[k]) / WEB[k].length)));
    return q;
  };
  const prRun = (start, d, n) => {
    const r = [start];
    for (let i = 0; i < n; i++) r.push(prStep(r[i], d));
    return r;
  };
  const uni = { A: 0.25, B: 0.25, C: 0.25, D: 0.25 };
  let prLimit = uni;
  for (let i = 0; i < 400; i++) prLimit = prStep(prLimit, 0.85);

  /* =====================================================================
     a1-surfer
     ===================================================================== */
  // 1. tape strips: who jumps most?
  const tapeFig = () => {
    const tapes = { A: [1, 4, 7, 9, 12, 14, 17, 19], B: [11], C: [0, 1, 2, 4, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 19] };
    let s =
      rect(10, 4, 14, 14, { fill: "var(--teal-dim)", stroke: "var(--teal)", r: 4 }) +
      tx(30, 16, "followed a link", { a: "start", sz: 12 }) +
      rect(170, 4, 14, 14, { fill: "var(--amber-dim)", stroke: "var(--amber)", r: 4 }) +
      tx(190, 16, "teleported", { a: "start", sz: 12 });
    Object.entries(tapes).forEach(([k, js], r) => {
      const y = 34 + r * 46;
      s += tx(6, y + 20, "Surfer " + k, { a: "start", sz: 13 });
      for (let i = 0; i < 20; i++) {
        const j = js.includes(i);
        s += rect(84 + i * 20.5, y, 18, 28, {
          fill: j ? "var(--amber-dim)" : "var(--teal-dim)",
          stroke: j ? "var(--amber)" : "var(--teal)",
          r: 5,
        });
      }
    });
    return svg(510, 176, s);
  };
  // 2. number line for d
  const numLineFig = () => {
    const X = (d) => 20 + ((d - 0.4) / 0.6) * 400,
      marks = [
        [0.5, 0],
        [0.75, 1],
        [0.9, 0],
        [0.95, 1],
        [0.99, 0],
      ];
    let s = line(20, 60, 420, 60, { w: 4 });
    [0.4, 0.6, 0.8, 1].forEach(
      (d) =>
        (s +=
          line(X(d), 54, X(d), 66, { w: 2 }) +
          tx(X(d), 92 + (d === 1 ? 0 : 0), d === 1 ? "1.0" : d.toFixed(1), { sz: 11, c: dim })),
    );
    marks.forEach(([d, dn]) => {
      const ly = dn ? 100 : 28;
      s += `<g data-pick="${d}"><rect x="${X(d) - 22}" y="6" width="44" height="108" fill="transparent"/>${line(X(d), 60, X(d), dn ? 90 : 36, { w: 2, dash: true })}<circle cx="${X(d)}" cy="60" r="9" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(d), ly + (dn ? 12 : 4), d, { sz: 14, c: "var(--blue-ink)" })}</g>`;
    });
    return svg(440, 120, s, true);
  };
  // 3. convergence plot for page A
  const convFig = () => {
    const a = prRun({ A: 0, B: 0, C: 0, D: 1 }, 0.85, 12).map((r) => r.A),
      b = prRun(uni, 0.85, 12).map((r) => r.A);
    const X = (i) => 46 + i * 36,
      Y = (v) => 190 - v * 170;
    let s = "";
    [0, 0.25, 0.5, 0.75, 1].forEach(
      (v) =>
        (s +=
          line(46, Y(v), 478, Y(v), { c: "var(--line)", w: 1 }) + tx(38, Y(v) + 4, v, { a: "end", sz: 11, c: dim })),
    );
    for (let i = 0; i <= 12; i += 2) s += tx(X(i), 208, i, { sz: 11, c: dim });
    s += tx(262, 224, "steps", { sz: 12, c: dim }) + tx(6, 10, "rank of A", { a: "start", sz: 12, c: dim });
    const path = (v, c) =>
      `<path d="${v.map((y, i) => `${i ? "L" : "M"}${X(i)} ${Y(y)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
    s += path(a, "var(--violet)") + path(b, "var(--blue)");
    s +=
      line(300, 14, 324, 14, { c: "var(--violet)", w: 4 }) +
      tx(330, 18, "start: all on D", { a: "start", sz: 12 }) +
      line(300, 32, 324, 32, { c: "var(--blue)", w: 4 }) +
      tx(330, 36, "start: equal", { a: "start", sz: 12 });
    return note("Links: A→B, A→C, B→C, C→A, D→C. Damping d = 0.85.") + svg(500, 232, s);
  };
  // 4. flowchart
  const flowFig = () => {
    const id = "fl" + ++partScope.uid,
      bx = (x, y, w, h, lines, pid) =>
        `<g ${pid ? `data-pick="${pid}"` : ""}>${rect(x, y, w, h, { fill: "var(--panel)" })}${lines.map((l, i) => tx(x + w / 2, y + h / 2 + 5 - (lines.length - 1) * 8 + i * 17, l, { sz: 13 })).join("")}</g>`;
    let s =
      defsArrow(id) +
      line(250, 46, 250, 66, { arrow: id }) +
      line(200, 112, 120, 140, { arrow: id }) +
      line(300, 112, 380, 140, { arrow: id }) +
      line(110, 196, 190, 220, { arrow: id }) +
      line(390, 196, 310, 220, { arrow: id });
    s +=
      bx(165, 4, 170, 42, ["Start on a page"], "start") +
      bx(130, 68, 240, 44, ["Flip a coin: heads", "with probability d"], "flip") +
      bx(10, 140, 210, 56, ["Pick one of this page's", "links at random"], "links") +
      bx(280, 140, 210, 56, ["Jump to any page", "at random"], "jump") +
      bx(130, 222, 240, 40, ["Move there, then repeat"], "move");
    s +=
      tx(140, 118, "heads", { sz: 12, c: "var(--teal-ink)", a: "end" }) +
      tx(360, 118, "tails", { sz: 12, c: "var(--amber-ink)", a: "start" });
    return svg(500, 268, s, true);
  };

  B.add("a1-surfer", [
    {
      type: "order",
      q: "Each strip records 20 steps of one surfer: green = followed a link, orange = jumped to a random page. The three surfers used d = 0.95, 0.6 and 0.25. Put them in order, from the <b>biggest</b> d to the smallest.",
      fig: tapeFig(),
      items: ["Surfer B", "Surfer A", "Surfer C"],
      hint: "d is the chance of following a link, so the jump rate is 1 − d.",
      why: "Surfer B jumped once in 20 steps (about 5%), so d is about 0.95. Surfer A jumped 8 times (40%), so d is about 0.6. Surfer C jumped 15 times (75%), so d is about 0.25. A short strip is noisy, but the jump rate always estimates 1 − d.",
    },
    {
      type: "pick",
      q: "A surfer follows a link with probability d at each step, and otherwise teleports. On average the surfer takes about <b>10 steps between one teleport and the next</b>. Click the value of d that does this.",
      fig: numLineFig(),
      a: "0.9",
      hint: "A teleport happens with probability 1 − d. Waiting for something of probability p takes about 1 ÷ p steps.",
      why: "The wait is about 1 ÷ (1 − d). With d = 0.9 that is 1 ÷ 0.1 = 10 steps. d = 0.75 gives 4, d = 0.95 gives 20 and d = 0.99 gives 100. Near 1, a tiny change in d makes a huge change in how long the surfer wanders before jumping.",
    },
    {
      type: "mcq",
      q: "Page A's rank over 12 steps, from two different starting guesses. A third run starts with <b>all the rank on A</b> (so A begins at 1). Where is A's rank after 12 steps?",
      fig: convFig(),
      o: [
        "Close to where the other two lines settle",
        "Still near 1, since it began as the top page",
        "Lower than the others, a gap that never closes",
        "Zero, because every page gives all its rank away",
      ],
      a: 0,
      why: "The long-run ranks are fixed by the links and by d, not by the starting guess. Each step shrinks the leftover effect of the start by about a factor d, so every start ends at the same level (A is about 0.37 here).",
    },
    {
      type: "pick",
      q: "Your simulator crashes on one particular page with <code>IndexError: Cannot choose from an empty sequence</code>. Click the box of the flowchart where that happens.",
      fig: flowFig(),
      a: "links",
      why: 'Choosing at random needs at least one link to choose from. A page with no outgoing links (a dangling page) has none, so "pick one of this page\'s links" fails there. The usual fix is to let such a page jump anywhere, as if it linked to every page. The coin flip and the jump box work on any page.',
    },
  ]);

  /* =====================================================================
     a1-pagerank
     ===================================================================== */
  // 1. worked trace with a wrong number
  const traceTable = () => {
    const rows = [
      [0.25, 0.25, 0.25, 0.25],
      [0.25, 0.125, 0.625, 0],
      [0.625, 0.125, 0.375, 0],
      [0.375, 0.3125, 0.4375, 0],
    ];
    let s =
      tx(40, 18, "step", { sz: 12, c: dim }) +
      IDS.map((k, j) => tx(140 + j * 105, 18, "page " + k, { sz: 12, c: dim })).join("");
    rows.forEach((r, i) => {
      const y = 28 + i * 38;
      s += tx(40, y + 22, i, { sz: 14, f: "var(--mono)" });
      r.forEach(
        (v, j) =>
          (s += `<g data-pick="${i}${IDS[j]}">${rect(92 + j * 105, y, 96, 32)}${tx(140 + j * 105, y + 21, v, { sz: 15, f: "var(--mono)" })}</g>`),
      );
    });
    return (
      note("Links: A→B, A→C, B→C, C→A, D→C. No damping. Each page splits its rank equally between its links.") +
      svg(520, 186, s, true)
    );
  };
  // 2. dot plot (in-links vs rank)
  const dotFig = () => {
    const L = { a: ["H", "Q"], b: ["H"], c: ["H"], H: ["Z"], Z: ["a"], Q: ["b"] },
      ks = Object.keys(L);
    let r = {};
    ks.forEach((k) => (r[k] = 1 / 6));
    for (let t = 0; t < 400; t++) {
      const q = {};
      ks.forEach((k) => (q[k] = 0.15 / 6));
      ks.forEach((k) => L[k].forEach((x) => (q[x] += (0.85 * r[k]) / L[k].length)));
      r = q;
    }
    const inl = {};
    ks.forEach((k) => (inl[k] = 0));
    ks.forEach((k) => L[k].forEach((x) => inl[x]++));
    const off = { a: -33, Z: -11, b: 11, Q: 33 },
      Y = (v) => 190 - (v / 0.3) * 165,
      X = (n) => 70 + n * 130;
    let s = "";
    [0, 0.1, 0.2, 0.3].forEach(
      (v) =>
        (s +=
          line(50, Y(v), 500, Y(v), { c: "var(--line)", w: 1 }) +
          tx(42, Y(v) + 4, v.toFixed(1), { a: "end", sz: 11, c: dim })),
    );
    [0, 1, 2, 3].forEach((n) => (s += tx(X(n), 216, n, { sz: 12, c: dim })));
    s += tx(280, 236, "number of in-links", { sz: 12, c: dim }) + tx(6, 12, "rank", { a: "start", sz: 12, c: dim });
    ks.forEach(
      (k) =>
        (s += `<g data-pick="${k}"><circle cx="${X(inl[k]) + (off[k] || 0)}" cy="${Y(r[k])}" r="12" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(inl[k]) + (off[k] || 0), Y(r[k]) + 5, k, { sz: 13, c: "var(--blue-ink)" })}</g>`),
    );
    return (
      note(
        "Links: a→H, a→Q, b→H, c→H, H→Z, Z→a, Q→b. d = 0.85. (Pages with the same number of in-links are spread sideways so they don't overlap.)",
      ) + svg(520, 244, s, true)
    );
  };
  // 3. heatmap of iterations
  const heatRows = prRun(uni, 0.85, 13),
    fin = IDS.map((k) => prLimit[k].toFixed(2));
  const settleRow = heatRows.findIndex((_, i) =>
    heatRows.slice(i).every((r) => IDS.every((k, j) => r[k].toFixed(2) === fin[j])),
  );
  const heatFig = () => {
    let s =
      tx(34, 16, "step", { sz: 12, c: dim }) +
      IDS.map((k, j) => tx(140 + j * 90, 16, "page " + k, { sz: 12, c: dim })).join("");
    heatRows.forEach((r, i) => {
      const y = 24 + i * 22;
      s +=
        `<g data-pick="${i}">` +
        rect(52, y, 360, 20, { r: 4, fill: "transparent", stroke: "var(--line)", sw: 1 }) +
        tx(34, y + 15, i, { sz: 12, f: "var(--mono)" });
      IDS.forEach(
        (k, j) =>
          (s +=
            `<rect x="${55 + j * 90}" y="${y + 1}" width="86" height="18" rx="3" fill="var(--blue)" opacity="${(0.08 + r[k] * 0.9).toFixed(2)}"/>` +
            tx(98 + j * 90, y + 15, r[k].toFixed(2), { sz: 12, f: "var(--mono)" })),
      );
      s += "</g>";
    });
    return svg(430, 24 + heatRows.length * 22 + 4, s, true);
  };
  // 4. log bars
  const logFig = () => {
    const bars = [
        ["A", 6],
        ["B", 7],
        ["C", 12],
        ["D", 18],
      ],
      Y = (e) => 200 - e * 10;
    let s = "";
    const SUPS = { 0: "10⁰", 6: "10⁶", 12: "10¹²", 18: "10¹⁸" };
    [0, 6, 12, 18].forEach(
      (e) =>
        (s +=
          line(60, Y(e), 480, Y(e), { c: "var(--line)", w: 1 }) +
          tx(52, Y(e) + 4, SUPS[e], { a: "end", sz: 12, c: dim })),
    );
    bars.forEach(
      ([k, e], i) =>
        (s += `<g data-pick="${k}"><rect x="${90 + i * 100}" y="${Y(e)}" width="64" height="${200 - Y(e)}" rx="8" fill="var(--blue-dim)" stroke="var(--blue)" stroke-width="3"/>${tx(122 + i * 100, 222, "Bar " + k, { sz: 13 })}</g>`),
    );
    return svg(500, 234, s, true);
  };

  B.add("a1-pagerank", [
    {
      type: "pick",
      q: "A student hand-runs PageRank (no damping) and the table shows rank after each step. <b>One number is wrong</b>, and the later rows were built on it. Click the first wrong number.",
      fig: traceTable(),
      a: "2C",
      hint: "Row 2 comes from row 1. Page C gets a share of A's rank, all of B's and all of D's.",
      why: "Page A has two links, so it sends only half of its 0.25 to C. C therefore gets 0.125 from A, 0.125 from B and 0 from D, a total of 0.25, not 0.375. The 0.375 comes from sending all of A's rank to C. Quick check: row 2 now adds up to 1.125, but PageRank never creates rank, so the total must stay 1.",
    },
    {
      type: "pick",
      q: "Four of these six pages have exactly <b>one</b> in-link, yet two of them rank far above the other two. Click those two pages.",
      fig: dotFig(),
      a: ["Z", "a"],
      hint: "Look at who the single in-link comes from, and how many other links that page has.",
      why: "Z's only in-link comes from H, the best-linked page, and H sends all its rank to Z. a's only in-link comes from Z, which passes everything on. Q and b are fed by pages that split their rank (a shares between H and Q) or by a weak page. What matters is not how many links point at you but how much rank each one carries.",
    },
    {
      type: "pick",
      q: "Each row is one step of damped PageRank (d = 0.85, all pages start equal). The final answer is A 0.37, B 0.20, C 0.39, D 0.04. Click the first row from which the rounded numbers <b>never change again</b>.",
      fig: heatFig(),
      a: String(settleRow),
      hint: "Row 8 matches the final numbers, but check the row after it.",
      why:
        "Row 8 matches, but row 9 has B = 0.19 and C = 0.40, so it wobbles back out. A, B and C form a loop that sloshes rank around, and each step only shrinks the leftover error by about a factor d = 0.85. From row " +
        settleRow +
        " on, every row rounds to the final numbers.",
    },
    {
      type: "pick",
      q: "A web has 1,000,000 pages with about 10 links each. The dense matrix G has an entry for every pair of pages, and multiplying G by p touches each entry once. Click the bar that shows the work for that dense product (log scale: each gridline is 1,000,000 times the one below).",
      fig: logFig(),
      a: "C",
      hint: "Pairs of pages: a million times a million.",
      why: "G has 1,000,000 × 1,000,000 = 10¹² entries. The link list has only about 1,000,000 × 10 = 10⁷, a hundred thousand times less work, which is why real PageRank code keeps the links in a sparse list and never builds the dense matrix.",
    },
  ]);

  /* =====================================================================
     a2-dijkstra
     ===================================================================== */
  // 1. priority queue boxes
  const pqFig = () => {
    let s = tx(4, 14, "settled so far", { a: "start", sz: 12, c: dim });
    [
      ["S", 0],
      ["B", 1],
      ["A", 3],
      ["C", 4],
    ].forEach(
      ([k, d], i) =>
        (s +=
          rect(4 + i * 84, 22, 78, 34, { fill: "var(--teal-dim)", stroke: "var(--teal)" }) +
          tx(43 + i * 84, 44, `${k} = ${d}`, { sz: 14 })),
    );
    s += tx(4, 88, "priority queue (smallest first)", { a: "start", sz: 12, c: dim });
    [
      ["7", "C"],
      ["7", "T"],
      ["10", "T"],
    ].forEach(
      ([k, n], i) =>
        (s += `<g data-pick="${k}${n}">${rect(4 + i * 104, 98, 96, 44)}${tx(52 + i * 104, 126, `(${k}, ${n})`, { sz: 16, f: "var(--mono)" })}</g>`),
    );
    return (
      note("Roads: S–A 4, S–B 1, B–A 2, A–C 1, B–C 6, C–T 3, A–T 7. Entries are (distance, node).") +
      svg(340, 150, s, true)
    );
  };
  // 2. cost grid
  const GRID = [
    [0, 4, 1, 4, 9],
    [1, 4, 9, 1, 4],
    [1, 9, 1, 1, 1],
    [1, 1, 1, 9, 1],
    [4, 4, 9, 9, 0],
  ];
  const gridFig = () => {
    let s = "";
    GRID.forEach((row, y) =>
      row.forEach((c, x) => {
        const fill = c === 9 ? "var(--rose-dim)" : c === 4 ? "var(--amber-dim)" : "var(--panel)",
          stroke = c === 9 ? "var(--rose)" : c === 4 ? "var(--amber)" : "var(--line-2)";
        const t = x === 0 && y === 0 ? "S" : x === 4 && y === 4 ? "G" : c;
        const g =
          rect(10 + x * 52, 6 + y * 52, 48, 48, {
            r: 8,
            fill: (x === 0 && y === 0) || (x === 4 && y === 4) ? "var(--blue-dim)" : fill,
            stroke: (x === 0 && y === 0) || (x === 4 && y === 4) ? "var(--blue)" : stroke,
          }) + tx(34 + x * 52, 36 + y * 52, t, { sz: 17 });
        s += (x === 0 && y === 0) || (x === 4 && y === 4) ? g : `<g data-pick="${x},${y}">${g}</g>`;
      }),
    );
    return note("S and G cost nothing. Moves are up, down, left or right.") + svg(280, 270, s, true);
  };
  Object.assign(partScope, { defsArrow, gridFig, line, note, pqFig, rect, svg, tx });
})();

/* ===== bank-x-algo-1.js ===== */
/* ALGO revision bank, third set of varied, visual questions (part 1).
   Workshops (a1-code, a2-watch, a2-code) plus Phase 1 (anatomy, big-O, surfer, PageRank), Dijkstra, A*, routing, linear programming.
   Every number was checked by running the real algorithm in node or Python; the figures are drawn from the same data. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const B = NIC.bank;

  /* ---------- small SVG helpers (all colours come from theme tokens) ---------- */
  const T = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const SVG = (w, h, body, label) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px" role="img" aria-label="${label || "Diagram"}">${body}</svg>`;
  const R = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.op ? ` fill-opacity="${o.op}"` : ""}/>`;
  const C = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 3}"${o.op ? ` fill-opacity="${o.op}"` : ""}${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const L = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""} stroke-linecap="round"/>`;
  const P = (d, o = {}) =>
    `<path d="${d}" fill="${o.fill || "none"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""} stroke-linecap="round" stroke-linejoin="round"${o.mk ? ` marker-end="url(#${o.mk})"` : ""}/>`;
  const hit = (x, y, w, h, rx = 10) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="transparent" stroke="none"/>`;
  const pk = (id, shape) => `<g data-pick="${id}">${shape}</g>`;
  const arrowDef = (id, col = "var(--text-faint)") =>
    `<defs><marker id="${id}" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M2,2 L10,6 L2,10" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`;
  const ink = (n) => `var(--${n}-ink)`;
  const tint = (n) => `var(--${n}-dim)`;
  const col = (n) => `var(--${n})`;
  const codeBox = (lines) =>
    `<div style="font:700 13px var(--mono);background:var(--bg-2);border:2px solid var(--line);border-radius:12px;padding:8px 12px;margin-bottom:8px;white-space:pre;overflow-x:auto">${lines.join("\n")}</div>`;
  /** A coloured circle node: label inside, optional small caption underneath. */
  const node = (x, y, label, o = {}) =>
    C(x, y, o.r || 19, {
      fill: o.fill ? tint(o.fill) : "var(--panel)",
      stroke: o.stroke ? col(o.stroke) : "var(--line-2)",
    }) +
    T(x, y + 5, label, { sz: o.sz || 15, c: "var(--ink)", w: 900 }) +
    (o.cap != null ? T(x, y + (o.r || 19) + 15, o.cap, { sz: 13, c: o.capc || "var(--text)" }) : "");
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
    let b =
      T(26, 20, "page", { a: "start", sz: 12, c: "var(--text-faint)" }) +
      T(100, 20, "rank", { a: "start", sz: 12, c: "var(--text-faint)" }) +
      T(170, 20, "links", { a: "start", sz: 12, c: "var(--text-faint)" }) +
      T(270, 20, "what it passes on", { a: "start", sz: 12, c: "var(--text-faint)" });
    rows.forEach(([id, p, r, l, s], i) => {
      const y = 30 + i * 46;
      b +=
        R(8, y, 484, 38, { rx: 10 }) +
        T(26, y + 25, p, { a: "start", sz: 16, c: "var(--ink)", w: 900 }) +
        T(100, y + 25, r, { a: "start", sz: 15, f: "var(--mono)" }) +
        T(170, y + 25, l, { a: "start", sz: 14 }) +
        T(270, y + 25, s, { a: "start", sz: 14 }) +
        pk(id, hit(8, y, 484, 38));
    });
    const y = 30 + 3 * 46;
    b +=
      R(8, y, 484, 38, { rx: 10, fill: "var(--bg-2)" }) +
      T(26, y + 25, "arrives", { a: "start", sz: 14, c: "var(--text-dim)" }) +
      T(110, y + 25, "A 0.333", { a: "start", sz: 14, f: "var(--mono)" }) +
      T(210, y + 25, "B 0.333", { a: "start", sz: 14, f: "var(--mono)" }) +
      T(310, y + 25, "C 0.667", { a: "start", sz: 14, f: "var(--mono)" }) +
      pk("rowArr", hit(8, y, 484, 38));
    b +=
      R(8, y + 50, 484, 36, { rx: 10, fill: tint("rose"), stroke: col("rose") }) +
      T(250, y + 74, "Total rank after the round: 1.333", { sz: 15, c: ink("rose") });
    return SVG(500, y + 94, b, "A hand trace of one PageRank round, one row per page");
  })();

  // 2. three buggy runs, total rank per round (4-page web with a dead end, d = 0.85); numbers from the real iteration
  const leakRun = (kind) => {
    const g = { A: ["B", "C"], B: ["C"], C: ["A", "D"], D: [] },
      pages = ["A", "B", "C", "D"],
      n = 4,
      d = 0.85;
    let r = { A: 0.25, B: 0.25, C: 0.25, D: 0.25 };
    const out = [1];
    for (let k = 0; k < 10; k++) {
      const nx = { A: 0, B: 0, C: 0, D: 0 };
      pages.forEach((p) => {
        const l = g[p];
        if (!l.length) {
          if (kind !== "skip") pages.forEach((q) => (nx[q] += r[p] / n));
        } else l.forEach((q) => (nx[q] += r[p] / l.length));
      });
      pages.forEach((p) => {
        nx[p] = kind === "nofloor" ? d * nx[p] : kind === "nodamp" ? nx[p] + (1 - d) / n : d * nx[p] + (1 - d) / n;
      });
      r = nx;
      out.push(pages.reduce((s, p) => s + r[p], 0));
    }
    return out;
  };
  const miniLine = (ox, title, ys, colr) => {
    const w = 140,
      h = 110,
      x0 = ox + 26,
      y0 = 28,
      ymax = 2.4,
      X = (i) => x0 + (i / 10) * (w - 28),
      Y = (v) => y0 + h - (v / ymax) * h;
    let b = T(ox + 86, 16, title, { sz: 15, c: "var(--ink)", w: 900 });
    b += R(x0, y0, w - 28, h, { rx: 4, fill: "var(--panel)" });
    [0, 1, 2].forEach((v) => (b += T(x0 - 5, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })));
    b += L(x0, Y(1), x0 + w - 28, Y(1), { dash: "4 4", stroke: "var(--text-faint)", sw: 1.5 });
    b += P(ys.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" "), {
      stroke: col(colr),
      sw: 3,
    });
    ys.forEach((v, i) => {
      if (i % 5 === 0) b += C(X(i), Y(v), 4, { fill: col(colr), stroke: col(colr), sw: 1 });
    });
    b += T(x0 + (w - 28) / 2, y0 + h + 18, "rounds 0 to 10", { sz: 12, c: "var(--text-faint)" });
    return b;
  };
  const leakCharts = SVG(
    500,
    178,
    miniLine(0, "Chart P", leakRun("nodamp"), "amber") +
      miniLine(166, "Chart Q", leakRun("skip"), "blue") +
      miniLine(332, "Chart R", leakRun("nofloor"), "violet") +
      T(250, 172, "dashed line = total rank 1 (it should stay there)", { sz: 12, c: "var(--text-faint)" }),
    "Three charts of total rank per round for three buggy versions",
  );

  // 3. transfer grid for the first round (4 pages, 1/4 each), dead-end row hidden
  const transferGrid = (() => {
    const names = ["A", "B", "C", "D"],
      cell = 62,
      x0 = 96,
      y0 = 44;
    const amt = { A: { B: "1/8", C: "1/8" }, B: { C: "1/4" }, C: { A: "1/8", D: "1/8" } };
    const shade = { "1/8": 0.35, "1/4": 0.7 };
    let b =
      T(x0 + 2 * cell, 16, "receiver", { sz: 13, c: "var(--text-dim)" }) +
      T(40, y0 + 2 * cell + 4, "sender", { sz: 13, c: "var(--text-dim)" });
    names.forEach((p, j) => (b += T(x0 + j * cell + cell / 2, y0 - 8, p, { sz: 16, c: "var(--ink)", w: 900 })));
    names.forEach((s, i) => {
      b += T(x0 - 14, y0 + i * cell + cell / 2 + 6, s, { a: "end", sz: 16, c: "var(--ink)", w: 900 });
      names.forEach((r, j) => {
        const x = x0 + j * cell,
          y = y0 + i * cell;
        if (s === "D") {
          b += R(x, y, cell, cell, { rx: 0, sw: 1.5, fill: "var(--bg-2)" });
          return;
        }
        const v = amt[s] && amt[s][r];
        b +=
          R(x, y, cell, cell, { rx: 0, sw: 1.5, fill: v ? col("blue") : "var(--panel)", op: v ? shade[v] : 1 }) +
          (v
            ? T(x + cell / 2, y + cell / 2 + 6, v, { sz: 17, c: "var(--ink)", w: 900 })
            : T(x + cell / 2, y + cell / 2 + 5, "0", { sz: 13, c: "var(--text-faint)" }));
      });
    });
    b += T(x0 + 2 * cell, y0 + 3 * cell + cell / 2 + 6, "D links nowhere: row hidden", { sz: 14, c: ink("amber") });
    b += T(x0 + 2 * cell, y0 + 4 * cell + 22, "Each page started with 1/4.", { sz: 13, c: "var(--text-dim)" });
    return SVG(400, y0 + 4 * cell + 30, b, "Who sends rank to whom in round 1, with the dead end D hidden");
  })();

  // 4. biggest change per round on a log scale (3-page web, d = 0.85): real iteration
  const changeData = (() => {
    const g = { A: ["B", "C"], B: ["C"], C: ["A"] },
      pages = ["A", "B", "C"],
      d = 0.85;
    let r = { A: 1 / 3, B: 1 / 3, C: 1 / 3 };
    const ch = [];
    for (let k = 0; k < 16; k++) {
      const nx = { A: 0, B: 0, C: 0 };
      pages.forEach((p) => g[p].forEach((q) => (nx[q] += r[p] / g[p].length)));
      pages.forEach((p) => (nx[p] = d * nx[p] + (1 - d) / 3));
      ch.push(Math.max(...pages.map((p) => Math.abs(nx[p] - r[p]))));
      r = nx;
    }
    return ch;
  })();
  const changeLog = (() => {
    const x0 = 64,
      w = 420,
      y0 = 20,
      h = 230,
      lo = -5,
      hi = -0.5,
      X = (k) => x0 + 14 + ((k - 1) / 15) * (w - 28),
      Y = (v) => y0 + ((hi - Math.log10(v)) / (hi - lo)) * h;
    let b = R(x0, y0, w, h, { rx: 4 });
    [
      ["0.1", -1],
      ["0.01", -2],
      ["0.001", -3],
      ["0.0001", -4],
      ["0.00001", -5],
    ].forEach(([s, e]) => {
      b +=
        L(x0, Y(10 ** e), x0 + w, Y(10 ** e), { sw: 1, stroke: "var(--line)" }) +
        T(x0 - 6, Y(10 ** e) + 4, s, { a: "end", sz: 12, c: "var(--text-faint)" });
    });
    b +=
      L(x0, Y(0.001), x0 + w, Y(0.001), { stroke: col("rose"), dash: "6 4", sw: 2.5 }) +
      T(x0 + w - 8, Y(0.001) - 8, "settled below this line", { a: "end", sz: 12, c: ink("rose") });
    b += P(changeData.map((v, i) => `${i ? "L" : "M"}${X(i + 1).toFixed(1)},${Y(v).toFixed(1)}`).join(" "), {
      stroke: "var(--line-2)",
      sw: 2,
    });
    changeData.forEach((v, i) => {
      b += pk("r" + (i + 1), C(X(i + 1), Y(v), 8, { fill: tint("blue"), stroke: col("blue"), sw: 2.5 }));
      if ((i + 1) % 2 === 0) b += T(X(i + 1), y0 + h + 18, String(i + 1), { sz: 13, c: "var(--text-dim)" });
    });
    b += T(x0 + w / 2, y0 + h + 38, "round", { sz: 13, c: "var(--text-dim)" });
    return SVG(500, y0 + h + 46, b, "Biggest change in any page's rank after each round, on a log scale");
  })();
  const firstSettled = "r" + (changeData.findIndex((v) => v < 0.001) + 1);

  // 5. one round of a 4-page web with a dead end
  const flowBoxes = (() => {
    const pos = { P: [90, 70], Q: [330, 70], R: [330, 190], D: [90, 190] },
      rk = { P: "0.40", Q: "0.20", R: "0.20", D: "0.20" };
    let b = arrowDef("xa-fb");
    b +=
      P("M138,70 L282,70", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-fb" }) +
      P("M128,102 L292,160", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-fb" }) +
      P("M330,106 L330,154", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-fb" }) +
      P("M282,190 L138,190", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-fb" });
    Object.entries(pos).forEach(([k, [x, y]]) => {
      const dead = k === "D";
      b +=
        R(x - 44, y - 32, 88, 64, {
          rx: 14,
          fill: dead ? tint("amber") : "var(--panel)",
          stroke: dead ? col("amber") : "var(--line-2)",
          dash: dead ? "6 4" : null,
        }) +
        T(x, y - 6, k, { sz: 17, c: "var(--ink)", w: 900 }) +
        T(x, y + 18, "rank " + rk[k], { sz: 14 });
    });
    b +=
      T(90, 250, "D links nowhere", { sz: 13, c: ink("amber") }) +
      T(210, 58, "P has two links", { sz: 13, c: "var(--text-dim)" });
    return SVG(420, 262, b, "Four pages: P links to Q and R, Q links to R, R links to D, D links nowhere");
  })();

  B.add("a1-code", [
    {
      type: "pick",
      q: "A friend worked round 1 of PageRank by hand for A → B, A → C, B → C, C → A. Every page started on 1/3 and there is no damping yet. The total came out above 1, so one row is wrong. Click it.",
      fig: codeTrace,
      a: "rowA",
      why: "A has two links, so it must split its rank: 1/3 ÷ 2 = 0.167 down each. Sending 0.333 down both creates rank from nothing, which is why the total is 1.333. B and C each have one link, so passing on everything is right.",
    },
    {
      type: "match",
      q: "These charts show the total rank each round on a web with one dead end, for three buggy versions of the lab code. The total should stay at 1. Match each bug to its chart.",
      fig: leakCharts,
      pairs: [
        ["Teleport floor added, but the arrived rank is never multiplied by <code>d</code>", "Chart P"],
        ["The dead-end branch is left empty, so its rank is never handed on", "Chart Q"],
        ["Teleport floor left out: <code>nxt[p] = d * nxt[p]</code>", "Chart R"],
      ],
      why: "Adding 0.15 every round with nothing taken away makes the total climb for ever (P). Dropping the dead end's rank loses a slice each round, so the total sinks but levels off above zero (Q). With no floor, each round keeps only 85% of what is left, so the total decays towards 0 (R).",
    },
    {
      type: "mcq",
      q: "Round 1 of PageRank on a 4-page web, before damping. A row is the sender and a column the receiver. Page D links nowhere, so its row is hidden. In total, how much does page A receive?",
      fig: transferGrid,
      o: ["1/16", "1/8", "3/16", "3/8"],
      a: 2,
      hint: "D has 1/4 to give, and a dead end pours it equally over all 4 pages.",
      why: "A gets 1/8 from C. D has no links, so it shares its 1/4 equally over all four pages: 1/16 each, including A. 1/8 + 1/16 = 3/16. Forgetting D gives 1/8, and sending all of D's rank to A gives 3/8.",
    },
    {
      type: "pick",
      q: "The lab calls a run settled when the biggest change in any page's rank is under 0.001. The chart shows that change after each round (log scale) for A → B, C; B → C; C → A with d = 0.85. Click the first round that counts as settled.",
      fig: changeLog,
      a: firstSettled,
      why: "The change shrinks by a roughly constant factor every few rounds, so it falls along a slanting line on a log scale. Round 12 is the first dot below the 0.001 line (about 0.0007). Round 11 is still about 0.0017, too big.",
    },
    {
      type: "mcq",
      q: "Round 1 of a 4-page web before damping. The arrows are the links, and D links nowhere. How much rank does page Q receive?",
      fig: flowBoxes,
      o: ["0.05", "0.20", "0.25", "0.45"],
      a: 2,
      hint: "P splits 0.40 over two links. D splits 0.20 over all four pages.",
      why: "P has two links, so Q gets 0.40 ÷ 2 = 0.20 from P. D's 0.20 is poured over all four pages, which adds 0.05. Together that is 0.25. Passing P's whole 0.40 to Q gives 0.45, and ignoring D gives 0.20.",
    },
    {
      type: "bug",
      q: "Each round must read last round's ranks and write the new ones into a fresh dict. This loop mixes old and new values, so the total rank drifts above 1. Click the line that breaks the rule.",
      code: [
        "nxt = {p: 0 for p in pages}",
        "for p in pages:",
        "    for q in out[p]:",
        "        r[q] += r[p] / len(out[p])",
      ],
      a: 3,
      why: "The share is written into <code>r</code> (the ranks), the same dict being read. A page that comes later in the loop then reads values already changed this round, so rank is counted twice. It should add to <code>nxt[q]</code>, which is why <code>nxt</code> is created at the top.",
    },
  ]);

  /* =====================================================================
     a2-watch  (be Dijkstra, no code)
     ===================================================================== */
  // 1. a map part-way through a run: put the next three settles in order (verified by running Dijkstra below)
  const dijkRun = (edges, start) => {
    const adj = {};
    edges.forEach(([a, b, w]) => {
      (adj[a] = adj[a] || []).push([b, w]);
      (adj[b] = adj[b] || []).push([a, w]);
    });
    const dist = {},
      done = new Set(),
      order = [],
      prev = {};
    Object.keys(adj).forEach((k) => (dist[k] = Infinity));
    dist[start] = 0;
    for (;;) {
      let u = null;
      Object.keys(adj).forEach((k) => {
        if (!done.has(k) && dist[k] < Infinity && (u === null || dist[k] < dist[u])) u = k;
      });
      if (u === null) break;
      done.add(u);
      order.push(u);
      adj[u].forEach(([v, w]) => {
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          prev[v] = u;
        }
      });
    }
    return { dist, order, prev };
  };
  const mapState = (() => {
    const pos = { S: [44, 104], A: [140, 38], B: [140, 170], C: [300, 38], D: [300, 170], E: [436, 104] };
    const edges = [
      ["S", "A", 3],
      ["S", "B", 6],
      ["A", "B", 2],
      ["A", "C", 7],
      ["B", "D", 3],
      ["C", "D", 1],
      ["C", "E", 5],
      ["D", "E", 6],
    ];
    const st = {
      S: ["teal", "0"],
      A: ["teal", "3"],
      B: ["amber", "5"],
      C: ["amber", "10"],
      D: [null, "∞"],
      E: [null, "∞"],
    };
    let b = "";
    edges.forEach(([u, v]) => (b += L(pos[u][0], pos[u][1], pos[v][0], pos[v][1], { sw: 2.5 })));
    edges.forEach(([u, v, w]) => (b += wpill((pos[u][0] + pos[v][0]) / 2, (pos[u][1] + pos[v][1]) / 2, w)));
    Object.entries(pos).forEach(([k, [x, y]]) => {
      const [c, cap] = st[k];
      b +=
        node(x, y, k, { fill: c, stroke: c }) +
        T(x + (k === "S" ? -2 : 0), y - 27, cap, { sz: 14, c: c ? ink(c) : "var(--text-faint)", w: 900 });
    });
    b +=
      C(24, 216, 7, { fill: tint("teal"), stroke: col("teal"), sw: 2 }) +
      T(36, 220, "settled", { a: "start", sz: 12, c: "var(--text-dim)" }) +
      C(120, 216, 7, { fill: tint("amber"), stroke: col("amber"), sw: 2 }) +
      T(132, 220, "waiting room", { a: "start", sz: 12, c: "var(--text-dim)" }) +
      C(250, 216, 7, { sw: 2 }) +
      T(262, 220, "not reached", { a: "start", sz: 12, c: "var(--text-dim)" }) +
      T(400, 220, "number above = distance", { sz: 12, c: "var(--text-faint)" });
    return {
      fig: SVG(480, 230, b, "A weighted map with S and A settled, B and C in the waiting room"),
      run: dijkRun(edges, "S"),
    };
  })();
  Object.assign(partScope, {
    C,
    L,
    P,
    R,
    SVG,
    T,
    arrowDef,
    codeBox,
    col,
    dijkRun,
    hit,
    ink,
    mapState,
    node,
    pk,
    tint,
    wpill,
  });
})();

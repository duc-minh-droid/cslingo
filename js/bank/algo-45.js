(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { arrow, circ, dot, forest, ln, orders, pk, rect, sgn, svg, txt, wl } = partScope;
  const B = NIC.bank;

  // Prim key table with one wrong entry
  const keyTable = (() => {
    const cols = [110, 72, 72, 72, 72],
      rows = [
        ["Step", "key B", "key C", "key D", "key E"],
        ["add A", 4, 2, "∞", "∞"],
        ["add C", 1, "–", 8, 10],
        ["add B", "–", "–", 8, 10],
        ["add D", "–", "–", "–", 3],
      ];
    const x0 = 8,
      y0 = 38,
      rh = 38;
    let g = txt(220, 20, "A–B 4, A–C 2, B–C 1, B–D 5, C–D 8, C–E 10, D–E 3", { s: 13, c: "var(--ink)" });
    rows.forEach((row, r) => {
      let x = x0;
      row.forEach((cell, c) => {
        const head = r === 0 || c === 0,
          w = cols[c],
          y = y0 + r * rh;
        const inner =
          rect(x, y, w, rh, head ? "var(--panel-2)" : "var(--panel)", "var(--line-2)", 1.5, 0) +
          txt(x + w / 2, y + rh / 2 + 5, cell, { s: 14, c: head ? "var(--text-dim)" : "var(--ink)" });
        g += r > 0 && c > 0 && cell !== "–" ? pk(`${r}${"BCDE"[c - 1]}`, inner) : inner;
        x += w;
      });
    });
    g += txt(220, y0 + 5 * rh + 18, "– means the town is already in the tree", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(440, y0 + 5 * rh + 28, g);
  })();

  // grouped bars: estimated work for three algorithms on a sparse and a dense network
  const costBars = (() => {
    const P = [
      ["Sparse: 1,000 towns, 4,000 cables", [1000, 40, 48], "s"],
      ["Dense: 1,000 towns, 300,000 cables", [1000, 3000, 5470], "d"],
    ];
    const names = ["Prim, array", "Prim, heap", "Kruskal"],
      ids = ["arr", "heap", "kr"],
      cols = ["var(--violet)", "var(--blue)", "var(--amber)"];
    let g = "";
    P.forEach(([title, vals, key], p) => {
      const x0 = 6 + p * 228,
        base = 190;
      g +=
        rect(x0, 4, 220, 232, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 110, 24, title, { s: 11, c: "var(--ink)" });
      vals.forEach((v, i) => {
        const h = Math.max(3, (v / 5470) * 130),
          x = x0 + 22 + i * 62;
        g +=
          pk(
            `${key}-${ids[i]}`,
            `<rect x="${x}" y="${base - h}" width="44" height="${h}" rx="5" fill="${cols[i]}"/>` +
              txt(x + 22, base - h - 6, v.toLocaleString("en-GB") + "k", { s: 11, c: "var(--ink)" }),
          ) +
          txt(x + 22, base + 16, names[i].split(", ")[0], { s: 11, w: 700, c: "var(--text-dim)" }) +
          txt(x + 22, base + 30, names[i].split(", ")[1] || "", { s: 11, w: 700, c: "var(--text-dim)" });
      });
      g += ln(x0 + 12, base, x0 + 208, base, "var(--line-2)", 2);
    });
    return svg(460, 242, g);
  })();

  // regions: three groups of towns, no links between groups
  const regions = (() => {
    const R = [
      [
        8,
        10,
        205,
        170,
        "var(--blue)",
        { A: [50, 50], B: [120, 40], C: [180, 70], D: [70, 130], E: [150, 135] },
        [
          ["A", "B"],
          ["B", "C"],
          ["A", "D"],
          ["D", "E"],
          ["C", "E"],
          ["B", "E"],
          ["A", "E"],
        ],
      ],
      [
        220,
        10,
        140,
        170,
        "var(--amber)",
        { F: [20, 50], G: [100, 45], H: [30, 130], I: [105, 125] },
        [
          ["F", "G"],
          ["F", "H"],
          ["G", "I"],
          ["H", "I"],
          ["F", "I"],
        ],
      ],
      [372, 10, 80, 170, "var(--violet)", { J: [22, 60], K: [55, 120] }, [["J", "K"]]],
    ];
    let g = "";
    R.forEach(([x, y, w, h, c, nd, ed]) => {
      g += rect(x, y, w, h, "var(--panel-2)", c, 3, 14);
      ed.forEach(([a, b]) => (g += ln(x + nd[a][0], y + nd[a][1], x + nd[b][0], y + nd[b][1], "var(--line-2)", 3)));
      Object.entries(nd).forEach(([k, [px, py]]) => (g += dot(x + px, y + py, k, { r: 13, stroke: c })));
    });
    return svg(460, 188, g);
  })();

  B.add("a4-mst", [
    {
      type: "cat",
      q: "Kruskal keeps each group of connected towns in a union-find forest, drawn below. It now looks at these edges. For each one, does Kruskal accept it (the ends are in different groups) or reject it (the same group)?",
      fig: forest,
      buckets: ["Accepts it", "Rejects it"],
      items: [
        ["C–F", 0],
        ["E–H", 0],
        ["B–G", 0],
        ["D–F", 1],
        ["A–C", 1],
        ["H–G", 1],
      ],
      hint: "Follow the arrows up to the root. Two towns are in the same group when their roots match.",
      why: "The roots are A (towns A, B, C), D (D, E, F) and G (G, H). C–F joins roots A and D, E–H joins D and G, and B–G joins A and G, so those three are accepted. D–F, A–C and H–G have both ends under the same root, so adding them would close a loop. Neither end needs to be a root itself: only the roots matter.",
    },
    {
      type: "pick",
      q: "Each panel lists the weights of the edges one run accepted, in the order they were added. Click every panel that could be a run of KRUSKAL's algorithm.",
      fig: orders,
      a: ["r1", "r3"],
      hint: "What does Kruskal do to the edge list before it starts? Look for a panel where a lighter edge comes after a heavier one.",
      why: "Kruskal sorts all edges by weight and walks through them once, so the accepted weights never go down. Runs 1 and 3 rise or stay level (equal weights are fine). Run 2 goes 3 then 1, which Kruskal can never do. It could be a Prim run: Prim grows one tree and may have to take a heavier edge now and a lighter one later.",
    },
    {
      type: "pick",
      q: "Prim's algorithm started at A on the network listed above the table. key[v] is the cheapest link from town v to the tree built so far. A student filled in the table after each step, and one entry is wrong. Click it.",
      fig: keyTable,
      a: "3D",
      hint: "After B joins, check every link from B to a town still outside the tree.",
      why: "When B joins the tree, link B–D (5) becomes available, which beats the old key of 8 (C–D). So key D should drop to 5, not stay at 8. The other rows are right: after A, B is 4 and C is 2; after C, B falls to 1, D is 8 and E is 10; after D joins, key E drops to 3 through D–E.",
    },
    {
      type: "pick",
      q: "Which algorithm needs the fewest steps? The bars model the work (in thousands of steps): Prim with a plain array is about n², Prim with a heap is about m × log₂ n, and Kruskal is about m × log₂ m. Click the cheapest bar in EACH panel.",
      fig: costBars,
      a: ["s-heap", "d-arr"],
      hint: "Sparse: m is only 4 times n. Dense: m is 300 times n, so n² is smaller than m log n.",
      why: "On the sparse network, heap-Prim does about 4,000 × 10 = 40 thousand steps and Kruskal about 4,000 × 12 = 48 thousand, far under the array version's 1,000 × 1,000 = 1 million. On the dense network the picture flips: the heap versions pay for every one of 300,000 cables (3 million and about 5.5 million) while the array version still costs 1 million. The fancier algorithm is not always the cheapest.",
    },
    {
      type: "slider",
      min: 0,
      max: 12,
      step: 1,
      start: 3,
      ans: 8,
      tol: 0,
      unit: "links",
      q: "Eleven towns are joined by the cables drawn, but the three coloured areas are not connected to each other. Kruskal runs through every cable. How many cables does it accept in total?",
      fig: regions,
      hint: "Each area ends as one tree. A tree on k towns has k − 1 edges.",
      why: "The areas hold 5, 4 and 2 towns. Kruskal builds one tree per area with 4, 3 and 1 edges: 8 in all. That is 11 towns minus 3 groups. The graph is disconnected, so no spanning TREE exists, but Kruskal quietly returns a minimum spanning FOREST. The extra cables inside each area (7, 5 and 1 in all) change nothing: they only close loops.",
    },
  ]);

  /* =====================================================================
     a5-orient
     ===================================================================== */
  const dial = (() => {
    const cx = 210,
      cy = 160,
      R = 112,
      d2r = Math.PI / 180;
    const P = (a, r) => [cx + r * Math.cos(a * d2r), cy - r * Math.sin(a * d2r)];
    let g = circ(cx, cy, R, "var(--panel)", "var(--line-2)", 3) + circ(cx, cy, 4, "var(--ink)", "var(--ink)", 1);
    g += txt(cx + R + 4, cy + 20, "east", { a: "start", s: 11, w: 700, c: "var(--text-dim)" });
    const [ux, uy] = P(30, 80);
    g += arrow(cx, cy, ux, uy, "var(--blue)", 5) + txt(ux + 14, uy - 6, "u", { s: 17, c: "var(--blue-ink)" });
    [
      ["a", 0],
      ["b", 60],
      ["c", 150],
      ["d", 180],
      ["e", 210],
      ["f", 300],
    ].forEach(([id, a]) => {
      const [x, y] = P(a, R),
        [lx, ly] = P(a, R + 30);
      g +=
        ln(cx, cy, x, y, "var(--line-2)", 2, 'stroke-dasharray="3 5"') +
        pk(id, circ(x, y, 13, "var(--panel)", "var(--amber)", 3) + txt(x, y + 5, id, { s: 13, c: "var(--ink)" })) +
        txt(lx, ly + 4, a + "°", { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(420, 320, g);
  })();

  // cross product against t, P slides along y = 5
  const crossPlot = (() => {
    const x0 = 58,
      x1 = 440,
      y0 = 22,
      y1 = 226,
      X = (t) => x0 + (t / 13) * (x1 - x0),
      Y = (v) => y1 - ((v + 8) / 22) * (y1 - y0);
    let g = "";
    [-8, -4, 0, 4, 8, 12].forEach(
      (v) =>
        (g +=
          ln(x0, Y(v), x1, Y(v), v === 0 ? "var(--ink)" : "var(--line)", v === 0 ? 2.5 : 1) +
          txt(x0 - 8, Y(v) + 4, v === 0 ? "0" : sgn(v), { a: "end", s: 12, w: 700, c: "var(--text-dim)" })),
    );
    for (let t = 0; t <= 12; t += 2) g += txt(X(t), y1 + 18, t, { s: 12, w: 700, c: "var(--text-dim)" });
    g += `<polyline points="${[2, 13].map((t) => `${X(t)},${Y(18 - 2 * t)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
    [3, 6, 8, 9, 10, 12].forEach(
      (t) =>
        (g +=
          dot(X(t), Y(18 - 2 * t), "", { r: 10, id: "t" + t, stroke: "var(--blue)" }) +
          txt(X(t) + (t === 12 ? -4 : t === 10 ? 4 : 6), Y(18 - 2 * t) + (t === 10 ? 26 : -15), "t=" + t, {
            s: 11,
            c: "var(--ink)",
          })),
    );
    g +=
      txt((x0 + x1) / 2, y1 + 38, "t, where P = (t, 5)", { s: 12, c: "var(--text-dim)" }) +
      txt(6, 12, "(B−A) × (P−A)", { a: "start", s: 11, c: "var(--text-dim)" });
    return svg(460, 268, g);
  })();

  // triangle on a grid
  const gridTri = (() => {
    const u = 40,
      x0 = 24,
      y0 = 18,
      X = (x) => x0 + x * u,
      Y = (y) => y0 + (7 - y) * u * 0.8;
    let g = "";
    for (let i = 0; i <= 8; i++) g += ln(X(i), Y(0), X(i), Y(7), "var(--line)", 1);
    for (let j = 0; j <= 7; j++) g += ln(X(0), Y(j), X(8), Y(j), "var(--line)", 1);
    const A = [1, 1],
      Bp = [7, 2],
      C = [3, 6];
    g += `<polygon points="${[A, Bp, C].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--blue)" fill-opacity=".2" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    [
      ["A", A, -26, 28],
      ["B", Bp, 26, 28],
      ["C", C, 0, -22],
    ].forEach(
      ([n, [x, y], dx, dy]) =>
        (g +=
          dot(X(x), Y(y), n, { r: 11, stroke: "var(--blue)" }) +
          wl(X(x) + dx, Y(y) + dy, `(${x},${y})`, "var(--text-dim)", 11)),
    );
    return svg(350, 246, g);
  })();

  // turn strips
  const strips = (() => {
    const row = (y, vals, labels, id, name) => {
      let s = "";
      vals.forEach((v, i) => {
        const x = 52 + i * 62;
        s +=
          rect(x, y, 58, 44, "var(--panel)", "var(--line-2)", 2, 6) +
          txt(x + 29, y + 15, labels[i], { s: 11, w: 700, c: "var(--text-dim)" }) +
          txt(x + 29, y + 35, sgn(v), {
            s: 15,
            c: v > 0 ? "var(--teal-ink)" : v < 0 ? "var(--rose-ink)" : "var(--ink)",
          });
      });
      s += txt(24, y + 28, name, { s: 14, c: "var(--ink)" });
      return id ? pk(id, rect(2, y - 5, 428, 54, "transparent", "none", 0, 8) + s) : s;
    };
    const L = ["A", "B", "C", "D", "E", "F"],
      V = [8, 5, -3, 6, 0, 7],
      Rl = ["F", "E", "D", "C", "B", "A"];
    let g =
      txt(215, 16, "Cross product at each corner, walking A → B → C → D → E → F", { s: 12, c: "var(--ink)" }) +
      row(26, V, L, null, "");
    g += txt(215, 98, "Same polygon, walked F → E → D → C → B → A. Which strip?", { s: 12, c: "var(--ink)" });
    const cands = [
      ["s2", [-8, -5, 3, -6, 0, -7], L, "2"],
      ["s4", [8, 5, -3, 6, 0, 7], L, "4"],
      ["s3", [-7, 0, -6, 3, -5, -8], Rl, "3"],
      ["s1", [7, 0, 6, -3, 5, 8], Rl, "1"],
    ];
    cands.forEach(([id, vals, labs, name], i) => (g += row(110 + i * 56, vals, labs, id, name)));
    return svg(440, 110 + 4 * 56 + 4, g);
  })();

  // four panels, each walks A -> B -> C
  const triPanels = (() => {
    const T = [
      [
        "W",
        [
          [1, 1],
          [3, 3],
          [5, 5],
        ],
      ],
      [
        "X",
        [
          [1, 1],
          [4, 1],
          [2, 6],
        ],
      ],
      [
        "Y",
        [
          [2, 6],
          [6, 6],
          [6, 3],
        ],
      ],
      [
        "Z",
        [
          [1, 1],
          [7, 1],
          [7, 4],
        ],
      ],
    ];
    let g = "";
    T.forEach(([name, pts], k) => {
      const ox = 8 + (k % 2) * 220,
        oy = 6 + Math.floor(k / 2) * 178,
        sx = 23,
        sy = 18;
      const X = (x) => ox + 14 + x * sx,
        Y = (y) => oy + 154 - y * sy;
      g += rect(ox, oy, 212, 170, "var(--panel)", "var(--line-2)", 3, 12);
      for (let i = 0; i <= 8; i++) g += ln(X(i), Y(0), X(i), Y(7), "var(--line)", 1);
      for (let j = 0; j <= 7; j++) g += ln(X(0), Y(j), X(8), Y(j), "var(--line)", 1);
      g +=
        arrow(X(pts[0][0]), Y(pts[0][1]), X(pts[1][0]), Y(pts[1][1]), "var(--blue)", 3) +
        arrow(X(pts[1][0]), Y(pts[1][1]), X(pts[2][0]), Y(pts[2][1]), "var(--blue)", 3);
      pts.forEach(([x, y], i) => (g += dot(X(x), Y(y), "ABC"[i], { r: 10, s: 11 })));
      g += txt(ox + 192, oy + 20, name, { s: 16, c: "var(--ink)" });
    });
    return svg(440, 362, g);
  })();

  B.add("a5-orient", [
    {
      type: "pick",
      q: "A robot at the centre faces along u (30° above east, y pointing up). Each dot is a direction v it could turn to. The turn from u to v is a LEFT turn when v is anticlockwise from u by less than half a turn. Click every direction that is a left turn.",
      fig: dial,
      a: ["b", "c", "d"],
      hint: "Left turns are the directions between 30° and 30° + 180° = 210°. What does a turn of exactly 180° count as?",
      why: "The cross product u × v is positive for v at 60°, 150° and 180° (all within 180° anticlockwise of u). 0° and 300° are clockwise of u, so they are right turns. The direction at 210° points exactly opposite to u: the cross product is 0, so the points are collinear and it is NEITHER a left nor a right turn.",
    },
    {
      type: "pick",
      q: "A = (1, 1) and B = (5, 3). Point P slides along the line y = 5 and sits at (t, 5). The chart plots the cross product (B − A) × (P − A), which is positive when A → B → P is a left turn. Click every marked t for which the walk A → P → B (visiting P first) is a RIGHT turn.",
      fig: crossPlot,
      a: ["t3", "t6", "t8"],
      hint: "Swapping the last two points of a walk flips the sign of the turn.",
      why: "The chart value is the cross product for A → B → P. Visiting P first reverses the order of the last two points, which flips the sign. So A → P → B turns right wherever the chart is POSITIVE: t = 3, 6 and 8 (values 12, 6 and 2). At t = 9 the value is 0: the three points are in a straight line, which is not a right turn. At t = 10 and 12 the chart is negative, so A → P → B turns left.",
    },
    {
      type: "slider",
      min: 0,
      max: 40,
      step: 1,
      start: 30,
      ans: 14,
      tol: 1,
      unit: "squares",
      q: "A triangle has corners A (1, 1), B (7, 2) and C (3, 6) on the grid. Slide to its area in grid squares. Remember: the cross product (B − A) × (C − A) is twice the signed area.",
      fig: gridTri,
      hint: "B − A = (6, 1) and C − A = (2, 5). Cross product = 6 × 5 − 1 × 2. The area is half of that.",
      why: "The cross product is 6 × 5 − 1 × 2 = 28. It is positive, so A → B → C is a left turn, and the triangle's area is half of it: 14 squares. One cross product gives both the turn direction (its sign) and the area (half its size).",
    },
    {
      type: "pick",
      q: "The top strip lists the cross product at each corner of a polygon, walked A → B → C → D → E → F. The polygon is now walked in the opposite order, F → E → D → C → B → A. Click the strip that shows the cross products for the reversed walk.",
      fig: strips,
      a: "s3",
      hint: "Reversing a walk swaps 'came from' and 'going to' at every corner. What does that do to the sign? And what happens to the order of the corners?",
      why: "At each corner the turn goes the opposite way when you walk the polygon backwards, so every sign flips (zero stays zero), and the corners now come in the order F, E, D, C, B, A. Strip 3 does both: F −7, E 0, D −6, C +3, B −5, A −8. Strip 1 reverses the order but forgets to flip. Strip 2 flips but keeps the order. Strip 4 does neither.",
    },
    {
      type: "order",
      q: "Each panel walks A → B → C. Put the panels in order of their cross product (B − A) × (C − A), from the most positive to the most negative.",
      fig: triPanels,
      items: ["Panel Z", "Panel X", "Panel W", "Panel Y"],
      hint: "For a flat first edge, the cross product is its length times how far C sits above it (or below it, for a right turn).",
      why: "Z: (6, 0) × (6, 3) = 18. X: (3, 0) × (1, 5) = 15, a left turn but a slimmer triangle. W: the three points lie on one straight line, so the product is 0. Y: (4, 0) × (4, −3) = −12, a right turn (clockwise), so it is negative. The order is therefore Z (18), X (15), W (0), Y (−12).",
    },
  ]);
})();

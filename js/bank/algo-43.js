(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { defsArrow, gridFig, line, note, pqFig, rect, svg, tx } = partScope;
  const B = NIC.bank,
    Qf = NIC.qfig;
  const dim = "var(--text-dim)";
  // 3. trace table
  const djTable = () => {
    const rows = [
      ["settle S", ["3", "7", "∞", "∞", "∞"], []],
      ["settle A", ["3", "5", "11", "∞", "∞"], [0]],
      ["settle B", ["3", "5", "8", "10", "∞"], [0, 1]],
      ["settle C", ["3", "5", "8", "10", "12"], [0, 1, 2]],
    ];
    let s = ["A", "B", "C", "D", "E"].map((k, j) => tx(176 + j * 62, 16, k, { sz: 13, c: dim })).join("");
    rows.forEach(([lab, v, set], i) => {
      const y = 26 + i * 36;
      s += tx(8, y + 22, lab, { a: "start", sz: 13 });
      v.forEach(
        (x, j) =>
          (s += `<g data-pick="${i + 1}${"ABCDE"[j]}">${rect(148 + j * 62, y, 58, 30, { r: 8, fill: set.includes(j) ? "var(--teal-dim)" : "var(--panel)", stroke: set.includes(j) ? "var(--teal)" : "var(--line-2)" })}${tx(177 + j * 62, y + 21, x, { sz: 15, f: "var(--mono)" })}</g>`),
      );
    });
    return (
      note("Roads: S–A 3, S–B 7, A–B 2, A–C 8, B–C 3, B–D 5, C–D 1, C–E 4, D–E 2. Green = settled.") +
      svg(470, 176, s, true)
    );
  };
  // 4. negative road
  const negFig = Qf.graph(
    { S: [50, 125], A: [230, 50], B: [230, 200], T: [410, 50] },
    [
      ["S", "A", 1],
      ["S", "B", 3],
      ["B", "A", "−5"],
      ["A", "T", 4],
    ],
    { w: 460, h: 250, directed: true },
  );

  B.add("a2-dijkstra", [
    {
      type: "pick",
      q: "Dijkstra uses a priority queue with <b>lazy deletion</b>: it never edits the queue, it just skips any entry popped for a node that is already settled. C has just been settled. Click every entry that will be <b>skipped</b> when it is popped.",
      fig: pqFig(),
      a: ["7C", "10T"],
      hint: "Which nodes will be settled by the time each entry comes to the front?",
      why: "(7, C) is skipped because C is already settled at 4. (10, T) is skipped too: T is not settled yet, but (7, T) comes off first and settles it at 7, so by the time (10, T) is popped it is stale. Only (7, T) is a real step. Stale entries are not just those for settled nodes now, but for any node that will already be settled when they are popped.",
    },
    {
      type: "pick",
      q: "Each cell shows the price of stepping onto it. Dijkstra finds the cheapest route from S to G. Click <b>every cell on that route</b> (apart from S and G).",
      fig: gridFig(),
      a: ["0,1", "0,2", "0,3", "1,3", "2,3", "2,2", "3,2", "4,2", "4,3"],
      hint: "Count prices, not steps. A detour of 1s can beat a short path through a 9.",
      why: "The cheapest route goes down the left edge, along the bottom-left 1s, up through the middle and across to the right edge, then down into G. It takes 10 steps but every cell on it costs 1, so the total is 9. The route with the fewest steps (8) has to cross at least one 4 or 9 and costs at least 13.",
    },
    {
      type: "pick",
      q: "A student traces Dijkstra from S, writing the tentative distances after each settle (green = settled). <b>Exactly one number is wrong</b>. Click it.",
      fig: djTable(),
      a: "4D",
      hint: "Settling C at 8 relaxes C–D and C–E. Check both.",
      why: "When C (distance 8) is settled, its road to D costs 1, so D can be reached at 8 + 1 = 9, better than 10. The student left D at 10. E = 8 + 4 = 12 was updated correctly.",
    },
    {
      type: "mcq",
      q: "Dijkstra is run on this directed map even though one road has a negative cost. What does it report for the distance from S to T, and is that right?",
      fig: negFig,
      o: [
        "It reports 5, but the true shortest is 2",
        "It reports 2, which is the true shortest",
        "It reports 5, which is the true shortest",
        "It never finishes, as the −5 road keeps lowering A",
      ],
      a: 0,
      why: "Dijkstra settles A at 1 (cheaper than B at 3) and never looks at it again. Only later does B show the route S → B → A costing 3 − 5 = −2, which would make T = −2 + 4 = 2. But A is already settled, so T stays 5. Its promise that a settled distance is final needs every road to cost zero or more.",
    },
  ]);

  /* =====================================================================
     a2-astar
     ===================================================================== */
  // 1. open list boxes
  const openFig = () => {
    const items = [
        ["P", 3, 9],
        ["Q", 5, 4],
        ["R", 7, 2],
        ["S", 2, 8],
        ["T", 6, 6],
      ],
      pos = [
        [6, 24],
        [176, 24],
        [346, 24],
        [6, 100],
        [176, 100],
      ];
    let s = tx(6, 14, "open list, in the order the cells were found", { a: "start", sz: 12, c: dim });
    items.forEach(
      ([n, g, h], i) =>
        (s += `<g data-pick="${n}">${rect(pos[i][0], pos[i][1], 160, 66)}${tx(pos[i][0] + 80, pos[i][1] + 28, "Cell " + n, { sz: 15 })}${tx(pos[i][0] + 80, pos[i][1] + 52, `g = ${g}   h = ${h}`, { sz: 14, f: "var(--mono)", c: dim })}</g>`),
    );
    return svg(512, 176, s, true);
  };
  // 2. f along a path
  const AP = { names: ["S", "a", "b", "c", "d", "e", "G"], cost: [2, 3, 2, 4, 1, 2], h: [12, 10, 9, 4, 3, 2, 0] };
  const apG = [0];
  AP.cost.forEach((c, i) => apG.push(apG[i] + c));
  const apF = AP.h.map((h, i) => h + apG[i]),
    apDrop = apF.findIndex((f, i) => i && f < apF[i - 1]);
  const fPlot = () => {
    const X = (i) => 50 + i * 68,
      Y = (f) => 190 - ((f - 10) / 5) * 150;
    let s = "";
    [10, 11, 12, 13, 14, 15].forEach(
      (f) =>
        (s +=
          line(36, Y(f), 490, Y(f), { c: "var(--line)", w: 1 }) + tx(30, Y(f) + 4, f, { a: "end", sz: 11, c: dim })),
    );
    s +=
      line(36, Y(14), 490, Y(14), { c: "var(--teal)", w: 2, dash: true }) +
      tx(490, Y(14) + 18, "optimal cost 14", { a: "end", sz: 12, c: "var(--teal-ink)" });
    s += `<path d="${apF.map((f, i) => `${i ? "L" : "M"}${X(i)} ${Y(f)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
    AP.names.forEach(
      (n, i) =>
        (s += `<g data-pick="${n}"><rect x="${X(i) - 30}" y="20" width="60" height="215" fill="transparent"/><circle cx="${X(i)}" cy="${Y(apF[i])}" r="10" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(i), 214, n, { sz: 14 })}${tx(X(i), 232, "h = " + AP.h[i], { sz: 11, c: dim, f: "var(--mono)" })}</g>`),
    );
    return svg(510, 240, s, true);
  };
  // 3. search tree
  const TREE = {
    R: [0, 8, null, 0],
    A: [2, 7, "R", 2],
    B: [3, 5, "R", 3],
    C: [1, 9, "R", 1],
    D: [6, 3, "A", 4],
    E: [4, 5, "A", 2],
    F: [5, 3, "B", 2],
    J: [7, 2, "B", 4],
    H: [3, 7, "C", 2],
    Z: [8, 0, "F", 3],
  };
  // (name: [g, h, parent, edge cost]) -- run A* to find what it expands
  const aExp = (() => {
    const open = ["R"],
      out = [];
    while (open.length) {
      open.sort((x, y) => TREE[x][0] + TREE[x][1] - TREE[y][0] - TREE[y][1] || TREE[x][1] - TREE[y][1]);
      const n = open.shift();
      if (n === "Z") break;
      out.push(n);
      Object.keys(TREE)
        .filter((k) => TREE[k][2] === n)
        .forEach((k) => open.push(k));
    }
    return out;
  })();
  const treeFig = () => {
    const P = {
      R: [250, 6],
      A: [100, 80],
      B: [250, 80],
      C: [400, 80],
      D: [40, 154],
      E: [140, 154],
      F: [220, 154],
      J: [320, 154],
      H: [400, 154],
      Z: [220, 228],
    };
    let s = "";
    Object.entries(TREE).forEach(([k, [g, h, p, c]]) => {
      if (!p) return;
      const [x, y] = P[k],
        [px, py] = P[p];
      s +=
        line(px, py + 40, x, y, { w: 2 }) +
        tx((x + px) / 2 + (x < px ? -10 : 10), (y + py + 40) / 2 + 3, c, { sz: 12, c: dim });
    });
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (s +=
          rect(x - 36, y, 72, 40, {
            fill: k === "Z" ? "var(--teal-dim)" : "var(--panel)",
            stroke: k === "Z" ? "var(--teal)" : "var(--line-2)",
          }) +
          tx(x, y + 17, k, { sz: 14 }) +
          tx(x, y + 33, `${TREE[k][0]} + ${TREE[k][1]}`, { sz: 11, c: dim, f: "var(--mono)" })),
    );
    return note("Each box shows <b>g + h</b>. Numbers on the lines are road costs. Z is the goal.") + svg(500, 274, s);
  };
  // 4. admissibility table
  const admFig = () => {
    const nodes = ["P", "Q", "R", "S", "G"],
      cols = [
        ["true", [9, 7, 6, 3, 0]],
        ["h1", [0, 0, 0, 0, 0]],
        ["h2", [11, 7, 6, 3, 0]],
        ["h3", [9, 6, 5, 3, 0]],
        ["h4", [9, 7, 7, 3, 0]],
        ["h5", [8, 6, 4, 2, 1]],
      ];
    let s = tx(26, 18, "node", { sz: 12, c: dim });
    cols.forEach(
      ([n], j) =>
        (s += tx(100 + j * 72, 18, n === "true" ? "true cost" : n, {
          sz: 13,
          c: n === "true" ? "var(--teal-ink)" : dim,
        })),
    );
    nodes.forEach((n, i) => {
      const y = 28 + i * 30;
      s += tx(26, y + 20, n, { sz: 14 });
      cols.forEach(
        ([c, v], j) =>
          (s +=
            rect(66 + j * 72, y, 68, 26, {
              r: 7,
              fill: j === 0 ? "var(--teal-dim)" : "var(--panel)",
              stroke: j === 0 ? "var(--teal)" : "var(--line-2)",
            }) + tx(100 + j * 72, y + 19, v[i], { sz: 14, f: "var(--mono)" })),
      );
    });
    return svg(510, 184, s);
  };

  B.add("a2-astar", [
    {
      type: "pick",
      q: "A* expands the open cell with the smallest <b>f = g + h</b>, and when two cells tie it takes the one with the smaller h (closer to the goal). Click the cell it expands next.",
      fig: openFig(),
      a: "R",
      hint: "Add g and h for every cell. Two cells share the lowest total.",
      why: "The f values are P 12, Q 9, R 9, S 10 and T 12. Q and R tie on 9, so the smaller h wins: R (h = 2) goes before Q (h = 4). Either order still finds an optimal path, but preferring the cell nearer the goal tends to expand fewer cells.",
    },
    {
      type: "pick",
      q: "A heuristic is <b>consistent</b> if f = g + h never goes down as A* moves along a path. This plot shows f at each node along one route (h is written under each node). Click the node where consistency breaks.",
      fig: fPlot(),
      a: AP.names[apDrop],
      hint: "Look for the node where f falls.",
      why: "f reads 12, 12, 14, then drops to 11 at c. Going from b to c costs 2, but h fell from 9 to 4, a drop of 5. Consistency needs h(b) ≤ cost(b→c) + h(c), that is 9 ≤ 2 + 4, which fails. This h is still admissible (at c the real remaining cost is 7 and h = 4): admissible does not guarantee consistent.",
    },
    {
      type: "multi",
      q: "A* searches this tree for the goal Z (g + h is shown in each box). Besides the root R, which nodes does A* <b>expand</b> before it takes Z off the open list and stops? Select all.",
      fig: treeFig(),
      o: ["A", "B", "C", "D", "F", "J"],
      a: ["A", "B", "C", "D", "F", "J"].map((n, i) => (aExp.includes(n) ? i : -1)).filter((i) => i >= 0),
      hint: "Always expand the smallest f. The best route costs 8.",
      why: "R opens A (9), B (8) and C (10), so B goes next. B opens F (8) and J (9), so F goes next and reveals Z with f = 8, the smallest on the list, so the search stops. A, C and J were seen but never expanded (their f is worse than 8) and D, E and H were never even generated. A* never touches nodes whose f exceeds the optimal cost.",
    },
    {
      type: "cat",
      q: "The table gives the true remaining cost from each node to the goal G, and five candidate heuristics. Sort each heuristic: is it admissible?",
      fig: admFig(),
      buckets: ["Admissible", "Not admissible"],
      items: [
        ["<code>h1</code>", 0],
        ["<code>h2</code>", 1],
        ["<code>h3</code>", 0],
        ["<code>h4</code>", 1],
        ["<code>h5</code>", 1],
      ],
      why: "Admissible means h never exceeds the true remaining cost at any node, and is 0 at the goal. h1 = 0 is always safe (it just turns A* into Dijkstra). h3 is at or below the truth everywhere. h2 says 11 at P (true 9), h4 says 7 at R (true 6) and h5 says 1 at G (true 0): a single overestimate is enough to lose the guarantee of an optimal path.",
    },
  ]);

  /* =====================================================================
     a2-routing
     ===================================================================== */
  // 1. sequence diagram
  const seqFig = () => {
    const id = "sq" + ++partScope.uid,
      LX = { A: 90, B: 250, C: 410 };
    let s = defsArrow(id);
    Object.entries(LX).forEach(
      ([k, x]) =>
        (s +=
          rect(x - 26, 4, 52, 30, { fill: "var(--panel)" }) +
          tx(x, 25, k, { sz: 15 }) +
          line(x, 34, x, 296, { c: "var(--line-2)", w: 2, dash: true })),
    );
    s += tx(90, 54, "C = 2 via B", { sz: 12, c: dim }) + tx(250, 54, "C = 1 direct", { sz: 12, c: dim });
    s +=
      line(318, 82, 342, 106, { c: "var(--rose)", w: 5 }) +
      line(342, 82, 318, 106, { c: "var(--rose)", w: 5 }) +
      tx(330, 126, "B–C fails", { sz: 12, c: "var(--rose-ink)" });
    [
      ["m1", "A", "B", "C = 2"],
      ["m2", "B", "A", "C = 3"],
      ["m3", "A", "B", "C = 4"],
      ["m4", "B", "A", "C = 5"],
    ].forEach(([id2, f, t, lab], i) => {
      const y = 170 + i * 36,
        x1 = LX[f] + (LX[t] > LX[f] ? 6 : -6),
        x2 = LX[t] + (LX[t] > LX[f] ? -6 : 6);
      s += `<g data-pick="${id2}"><rect x="${Math.min(LX[f], LX[t])}" y="${y - 18}" width="160" height="32" fill="transparent"/>${line(x1, y, x2, y, { c: "var(--blue)", w: 3, arrow: id })}${tx(170, y - 6, lab, { sz: 15, c: "var(--blue-ink)" })}</g>`;
    });
    return (
      note("Line of routers A–B–C, every link costs 1. Messages go down the page in time order.") +
      svg(500, 304, s, true)
    );
  };
  // 2. small multiples of networks
  const netFig = () => {
    const nets = [
      {
        t: "Network 1",
        n: { A: [22, 90], B: [64, 90], C: [106, 90], X: [142, 90], D: [64, 128] },
        e: [
          ["A", "B"],
          ["B", "C"],
          ["B", "D"],
          ["C", "X", 1],
        ],
      },
      {
        t: "Network 2",
        n: { A: [22, 90], B: [80, 56], C: [80, 126], X: [138, 90] },
        e: [
          ["A", "B"],
          ["A", "C"],
          ["B", "X", 1],
          ["C", "X"],
        ],
      },
      {
        t: "Network 3",
        n: { A: [22, 100], B: [42, 62], C: [42, 134], D: [118, 62], X: [140, 100], E: [118, 134] },
        e: [
          ["A", "B"],
          ["A", "C"],
          ["B", "C"],
          ["B", "D", 1],
          ["D", "X"],
          ["X", "E"],
          ["D", "E"],
        ],
      },
    ];
    let s = "";
    nets.forEach((nt, i) => {
      const ox = i * 170;
      s += `<g data-pick="n${i + 1}" transform="translate(${ox},0)">${rect(2, 2, 162, 156, { r: 12 })}${tx(83, 22, nt.t, { sz: 13 })}`;
      nt.e.forEach(([a, b, f]) => {
        const [x1, y1] = nt.n[a],
          [x2, y2] = nt.n[b];
        s += line(x1, y1, x2, y2, { c: f ? "var(--rose)" : "var(--text-dim)", w: f ? 3 : 2.5, dash: !!f });
      });
      Object.entries(nt.n).forEach(
        ([k, [x, y]]) =>
          (s +=
            `<circle cx="${x}" cy="${y}" r="12" fill="${k === "X" ? "var(--teal-dim)" : "var(--panel)"}" stroke="${k === "X" ? "var(--teal)" : "var(--line-2)"}" stroke-width="3"/>` +
            tx(x, y + 4, k, { sz: 12 })),
      );
      s += "</g>";
    });
    return svg(510, 162, s, true);
  };
  // 3. stacked bars of per-link delay
  const stackFig = () => {
    const routes = [
      ["Route 1", [20, 25]],
      ["Route 2", [9, 8, 10]],
      ["Route 3", [5, 6, 5, 7]],
    ];
    let s = tx(80, 14, "delay of each link in the route, in milliseconds", { a: "start", sz: 12, c: dim });
    routes.forEach(([n, segs], i) => {
      const y = 28 + i * 52;
      let x = 80;
      s += tx(6, y + 28, n, { a: "start", sz: 13 });
      segs.forEach((d, j) => {
        s +=
          rect(x, y, d * 8, 40, {
            r: 6,
            fill: j % 2 ? "var(--violet-dim)" : "var(--blue-dim)",
            stroke: j % 2 ? "var(--violet)" : "var(--blue)",
          }) + tx(x + d * 4, y + 26, d, { sz: 15 });
        x += d * 8;
      });
    });
    return svg(500, 190, s);
  };
  // 4. flooding graph
  const floodFig = Qf.graph(
    { A: [40, 60], B: [170, 40], D: [330, 50], C: [80, 180], E: [230, 180], F: [390, 170] },
    [
      ["A", "B"],
      ["A", "C"],
      ["B", "C"],
      ["B", "D"],
      ["C", "E"],
      ["D", "E"],
      ["D", "F"],
      ["E", "F"],
      ["B", "E"],
    ],
    { w: 430, h: 220 },
  );
  Object.assign(partScope, { floodFig, netFig, seqFig, stackFig });
})();

(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { CE, CN, LE, LN, chip, dot, nmPlane, plane, svg, tail, txt, uid } = partScope;
  const B = NIC.bank;
  const G = NIC.qfig.graph;
  B.add("a3-nm", [
    {
      type: "pick",
      q: "Nelder–Mead is minimising f. The triangle's corners have the values shown (lower is better). Click where the reflected point lands when the worst corner is flipped through the midpoint of the other two.",
      fig: nmPlane(),
      a: "P",
      hint: "Find the midpoint of the two better corners first: halfway between B (5, 1) and C (3, 5).",
      why: "A is the worst (f = 29). The midpoint of B and C is (4, 3), which is Q. Reflecting A through Q puts the new point as far beyond Q as A is on the near side: (4 + 3, 3 + 2) = (7, 5), point P. Landing on Q itself would be only half a reflection.",
    },
    {
      type: "cat",
      q: "For each situation, decide what Nelder–Mead does with it.",
      buckets: ["Keep the reflection", "Expand", "Contract", "Shrink"],
      items: [
        ["The reflected point is better than the best corner.", 1],
        ["The reflected point beats the old worst corner but is not a new record.", 0],
        ["The reflected point is worse than all three corners.", 2],
        ["The contracted point is no better than the old worst corner.", 3],
        ["The expanded point turns out worse than the reflected point.", 0],
        ["Reflecting overshot: the new point is worse than the old worst corner.", 2],
      ],
      why: "A record-breaking reflection invites a bolder expansion, but if the expansion does worse you keep the reflection. A bad reflection means you overshot, so contract back. Only when even a contraction fails do you shrink everything toward the best corner.",
    },
    {
      type: "bug",
      q: "reflect() should flip the worst corner through the midpoint of the OTHER TWO corners. Click the faulty line.",
      code: [
        "def reflect(f, pts):",
        "    best, mid, worst = sorted(pts, key=f)",
        "    centre = [(best[i] + mid[i] + worst[i]) / 3 for i in range(2)]",
        "    refl = [2 * centre[i] - worst[i] for i in range(2)]",
        "    return refl",
      ],
      a: 2,
      why: "The centre must be the average of the two better corners, (best + mid) / 2. Including the worst corner drags the centre towards it, so the reflection barely leaves the triangle and the search crawls.",
    },
    {
      type: "mcq",
      q: "After many iterations the triangle looks like the last panel. Why is that a problem?",
      fig: svg(
        480,
        130,
        `<polygon points="50,95 120,100 80,35" fill="var(--violet)" fill-opacity=".15" stroke="var(--violet)" stroke-width="2.5"/>${txt(85, 122, "start", { c: "var(--text-dim)", s: 12 })}<polygon points="190,100 270,98 225,60" fill="var(--violet)" fill-opacity=".15" stroke="var(--violet)" stroke-width="2.5"/>${txt(230, 122, "iteration 20", { c: "var(--text-dim)", s: 12 })}<polygon points="320,95 450,70 450,64" fill="var(--violet)" fill-opacity=".15" stroke="var(--violet)" stroke-width="2.5"/>${txt(385, 122, "iteration 60", { c: "var(--text-dim)", s: 12 })}`,
      ),
      o: [
        "Every reflection stays close to one line, so the search can barely move sideways and stalls",
        "The three corners can no longer be ranked, so the best and worst are chosen at random",
        "A thin triangle means the minimum has been found, so the search should already have stopped",
        "Reflections now always land outside the valley, so expansions are never allowed",
      ],
      a: 0,
      why: "A sliver has almost no width, so flipping a corner only moves the point along the sliver's own line. Without a spread in the second direction the triangle cannot turn or follow a bend in the valley. Restarting with a fresh full-size triangle usually fixes it.",
    },
    {
      type: "mcq",
      q: "A run's progress is plotted. You know the true minimum value of f is 0. What is the sensible next move?",
      fig: (() => {
        const best = [90, 40, 18, 9, 6, 4.6, 4.2, 4.1, 4.1, 4.1, 4.1],
          size = [3, 2.4, 1.9, 1.5, 1.2, 1, 0.8, 0.5, 0.2, 0.05, 0.01];
        const px = (i) => 24 + i * 20,
          ln = (arr, max, c, ox) =>
            `<polyline points="${arr.map((v, i) => `${ox + px(i)},${120 - (v / max) * 96}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>`;
        return svg(
          500,
          168,
          `<rect x="6" y="8" width="236" height="124" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><rect x="258" y="8" width="236" height="124" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/>` +
            ln(best, 90, "var(--blue)", 0) +
            ln(size, 3, "var(--amber)", 252) +
            txt(124, 156, "best value found per iteration (ends at 4.1)", { s: 11, c: "var(--text-dim)" }) +
            txt(376, 156, "triangle size per iteration (ends near 0)", { s: 11, c: "var(--text-dim)" }),
        );
      })(),
      o: [
        "Restart from the best point with a new, full-size triangle",
        "Keep running, because the triangle will grow back by itself",
        "Accept 4.1, because Nelder–Mead guarantees the global minimum",
        "Remove the worst corner so only two corners are left",
      ],
      a: 0,
      why: "Both curves have flattened: the triangle has collapsed to a dot and cannot move, yet the value is still far from the known minimum 0. The simplex never re-expands once it is tiny, so you restart from the best point with a new full-size triangle. Nelder–Mead has no global guarantee.",
    },
    {
      type: "match",
      q: "Match each starting situation to the trouble it causes.",
      pairs: [
        ["Starting triangle far too small", "Progress crawls, since every step is tiny"],
        ["Starting triangle far too large", "Early moves overshoot the valley and need many contractions"],
        ["Starting triangle is a thin sliver", "It can only explore along one line and stalls"],
        ["Function is flat across the triangle", "All corners compare equal, so there is no clear worst"],
      ],
      why: "Every Nelder–Mead move is built from the triangle's own size and shape, so a bad start shapes the whole run. It is why the initial triangle should be a reasonable, non-degenerate size.",
    },
  ]);

  /* =====================================================================
     a4-cut
     ===================================================================== */
  const hlSides = {
    A: "var(--blue)",
    B: "var(--blue)",
    C: "var(--blue)",
    D: "var(--amber)",
    E: "var(--amber)",
    F: "var(--amber)",
  };
  B.add("a4-cut", [
    {
      type: "pick",
      q: "The dashed line cuts the graph into {A, B, C} and {D, E, F}. All weights are different. Click the one edge the cut property guarantees is in some minimum spanning tree.",
      fig: tail(
        G(CN, CE, { pick: "edges", w: 460, h: 260, hl: hlSides }),
        `<line x1="262" y1="26" x2="262" y2="258" stroke="var(--rose)" stroke-width="3" stroke-dasharray="7 6"/>${txt(262, 16, "cut", { c: "var(--rose-ink)" })}`,
      ),
      a: "C-D",
      why: "Only B–D (7), C–D (3) and C–E (8) cross the cut. The cheapest crossing edge, C–D, is safe. E–F (1) is the lightest in the whole graph, but it lies inside one side, so the cut says nothing about it here.",
    },
    {
      type: "pick",
      q: "All weights are different. Click every edge that the cycle property rules out (an edge that is the heaviest on some cycle).",
      fig: G(CN, CE, { pick: "edges", w: 460, h: 260 }),
      a: ["B-C", "B-D", "C-E", "D-F"],
      hint: "Look for triangles. A–B–C has edges 4, 2 and 5. Which is heaviest?",
      why: "B–C (5) is the heaviest on A–B–C. B–D (7) is the heaviest on B–C–D (5, 3, 7). C–E (8) is the heaviest on C–D–E (3, 6, 8), and D–F (9) is the heaviest on D–E–F (6, 1, 9). The five edges left are the minimum spanning tree, total 16.",
    },
    {
      type: "cat",
      q: "All edge weights are distinct. For each edge e, what do the facts guarantee?",
      buckets: ["Safe: in an MST", "Out: in no MST", "Can't tell from this"],
      items: [
        ["Edge e (6) crosses a cut. The other crossing edges weigh 9 and 11.", 0],
        ["Edge e (9) closes a cycle with edges of weight 3 and 5.", 1],
        ["Edge e (5) crosses a cut. The other crossing edges weigh 2 and 4.", 2],
        ["Edge e (8) closes a cycle with edges of weight 2 and 9.", 2],
        ["Edge e (1) is the lightest edge touching a particular node.", 0],
        ["Edge e (7) is the heaviest in a cycle of four edges: 2, 3, 4 and 7.", 1],
      ],
      why: "The cut property only vouches for the LIGHTEST crossing edge, and a node's edges form a cut of that single node. The cycle property only condemns the HEAVIEST edge on a cycle. An edge that is merely heavier-than-some or lighter-than-some tells you nothing yet.",
    },
    {
      type: "bug",
      q: "lightest_crossing(edges, S) should return the lightest edge with one end in S and the other outside. Click the faulty line.",
      code: [
        "def lightest_crossing(edges, S):",
        "    best = None",
        "    for u, v, w in edges:",
        "        if (u in S) == (v in S):",
        "            if best is None or w < best[2]:",
        "                best = (u, v, w)",
        "    return best",
      ],
      a: 3,
      why: "An edge crosses the cut when exactly one end is in S, so the test is (u in S) != (v in S). As written it keeps edges with both ends on the same side, which is the opposite of crossing.",
    },
    {
      type: "order",
      q: "Put the swap argument for the cut property in order. It shows the lightest crossing edge e is in some MST.",
      items: [
        "Suppose some MST T does not contain e",
        "Add e to T: this closes exactly one cycle",
        "That cycle must cross the cut again, through another edge f",
        "f crosses the cut too, so it is at least as heavy as e",
        "Remove f and keep e: still a spanning tree, and no heavier",
        "So some MST contains e",
      ],
      why: "Adding an edge to a tree makes one cycle, and a cycle that crosses a cut has to cross it an even number of times. The second crossing edge is the one you can swap out without losing weight.",
    },
    {
      type: "mcq",
      q: "How many different minimum spanning trees does this graph have?",
      fig: svg(
        320,
        230,
        `<line x1="60" y1="40" x2="260" y2="40" stroke="var(--line-2)" stroke-width="3"/><line x1="260" y1="40" x2="260" y2="180" stroke="var(--line-2)" stroke-width="3"/><line x1="260" y1="180" x2="60" y2="180" stroke="var(--line-2)" stroke-width="3"/><line x1="60" y1="180" x2="60" y2="40" stroke="var(--line-2)" stroke-width="3"/><line x1="60" y1="40" x2="260" y2="180" stroke="var(--line-2)" stroke-width="3"/>` +
          txt(160, 30, "1") +
          txt(272, 114, "1", { a: "start" }) +
          txt(160, 202, "1") +
          txt(48, 114, "1", { a: "end" }) +
          txt(176, 92, "3", { c: "var(--amber-ink)" }) +
          [
            ["A", 60, 40],
            ["B", 260, 40],
            ["C", 260, 180],
            ["D", 60, 180],
          ]
            .map(([k, x, y]) => dot(x, y, k, { r: 18, s: 15 }))
            .join(""),
      ),
      o: ["1", "2", "4", "8"],
      a: 2,
      why: "The diagonal (3) is the heaviest edge on both its triangles, so no MST uses it. The four weight-1 edges form a cycle, and an MST must drop exactly one of them, with four equal choices. That gives 4 MSTs, each of weight 3. A graph has many spanning trees, but only these 4 are minimum.",
    },
  ]);

  /* =====================================================================
     a4-mst
     ===================================================================== */
  const teal = "var(--teal)";
  B.add("a4-mst", [
    {
      type: "pick",
      q: "Prim's algorithm started at A. Its tree so far is the green part (A, D, B, C). Click the edge it adds next.",
      fig: tail(
        G(LN, LE, {
          pick: "edges",
          w: 400,
          h: 250,
          hl: { A: teal, B: teal, C: teal, D: teal, "A-D": teal, "A-B": teal, "B-C": teal },
        }),
        txt(200, 244, "green = already in the tree", { a: "middle", s: 12, c: "var(--teal-ink)" }),
      ),
      a: "C-F",
      hint: "Only edges with exactly one green end can be added. List those three weights.",
      why: "Edges leaving the tree are B–E (6), D–E (5) and C–F (4). Prim takes the cheapest one that crosses from the tree to the rest, which is C–F. E–F (7) touches no tree node, so it cannot be picked yet.",
    },
    {
      type: "pick",
      q: "Kruskal takes the edges in weight order, skipping any that join two nodes already connected. Click the first edge it REJECTS.",
      fig: G(LN, LE, { pick: "edges", w: 400, h: 250 }),
      a: "B-E",
      hint: "Order: 1, 2, 3, 4, 5, 6, 7. After the first five are taken, which nodes are still apart?",
      why: "A–D (1), B–C (2), A–B (3), C–F (4) and D–E (5) all join different groups, so they are accepted. After them, B and E are already connected (B–A–D–E), so B–E (6) would close a loop and is rejected. E–F (7) is rejected too, but later.",
    },
    {
      type: "mcq",
      q: "Prim (from A) and Kruskal both ran on the ladder graph with weights A–D 1, B–C 2, A–B 3, C–F 4, D–E 5, B–E 6, E–F 7. Their accepted edges are shown in order. Why does Kruskal take B–C before A–B, while Prim takes A–B first?",
      fig: `<div style="margin:6px 0"><div><b style="display:inline-block;width:90px">Prim from A</b>${[
        ["A–D", 1],
        ["A–B", 3],
        ["B–C", 2],
        ["C–F", 4],
        ["D–E", 5],
      ]
        .map(([e, w]) => chip(e, w))
        .join("")}</div><div><b style="display:inline-block;width:90px">Kruskal</b>${[
        ["A–D", 1],
        ["B–C", 2],
        ["A–B", 3],
        ["C–F", 4],
        ["D–E", 5],
      ]
        .map(([e, w]) => chip(e, w))
        .join("")}</div></div>`,
      o: [
        "Prim can only add edges touching its tree, while Kruskal sees every edge",
        "Kruskal is quicker per edge, so it reaches the lighter edge sooner than Prim does",
        "Prim has to take edges in the order they were drawn, whatever their weight",
        "B–C would close a loop in Prim's tree, but not in Kruskal's forest",
      ],
      a: 0,
      why: "Both pick cheapest-first, but Prim's choice is restricted to the cut around its single growing tree. B–C (2) cannot be taken until B has joined, and B joins via A–B. Kruskal sees the whole list and takes B–C as a separate small tree. The final tree is the same, total 15.",
    },
    {
      type: "cat",
      q: "Which algorithm suits each job better?",
      buckets: ["Prim (with a heap)", "Kruskal (with union-find)"],
      items: [
        ["A dense graph where nearly every pair of towns has a possible cable", 0],
        ["A sparse road map stored as a plain list of edges", 1],
        ["Group 500 data points into 4 clusters by stopping when 4 groups remain", 1],
        ["Grow the network outward from one head office, adding one town at a time", 0],
        ["The edge list arrives already sorted by cost", 1],
        ["The graph is stored as adjacency lists and you have a priority queue ready", 0],
      ],
      why: "Prim spends its effort per node and scans neighbours, which pays off when edges are plentiful. Kruskal's cost is the sort, so it shines on sparse or pre-sorted edge lists, and stopping it early leaves the forest you want for clustering.",
    },
    {
      type: "bug",
      q: "This Kruskal code returns a spanning tree that is never the cheapest one, however the weights are set. Click the faulty line.",
      code: [
        "def kruskal(n, edges):",
        "    parent = list(range(n))",
        "    def find(x):",
        "        while parent[x] != x:",
        "            x = parent[x]",
        "        return x",
        "    edges = sorted(edges, key=lambda e: -e[2])",
        "    tree = []",
        "    for u, v, w in edges:",
        "        ru, rv = find(u), find(v)",
        "        if ru != rv:",
        "            parent[ru] = rv",
        "            tree.append((u, v, w))",
        "    return tree",
      ],
      a: 6,
      why: "Sorting by -weight puts the heaviest edges first, so the loop builds a MAXIMUM spanning tree. The union-find part is fine. Kruskal's greedy rule only works when the cheapest edges come first.",
    },
    {
      type: "slider",
      q: "A network has 12 towns. Kruskal has accepted 7 edges so far and has rejected 3 other edges for closing a loop. How many separate groups of connected towns remain?",
      min: 1,
      max: 12,
      step: 1,
      ans: 5,
      tol: 0,
      unit: "groups",
      why: "Every accepted edge joins two groups into one, so 12 groups drop by one per accepted edge: 12 − 7 = 5. Rejected edges change nothing, as they connect towns that are already together. It finishes with 1 group after 11 accepted edges.",
    },
  ]);

  /* =====================================================================
     a5-orient
     ===================================================================== */
  function arrowAB(p, a, b, c) {
    const id = uid();
    return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker></defs><line x1="${p.X(a[0])}" y1="${p.Y(a[1])}" x2="${p.X(b[0])}" y2="${p.Y(b[1])}" stroke="${c}" stroke-width="3.5" marker-end="url(#${id})"/>`;
  }
  const o1 = (() => {
    const p = plane(9, 8, 420, 320),
      A = [1, 2],
      Bp = [6, 4];
    const pts = { 1: [2, 6], 2: [7, 1], 3: [5, 7], 4: [3, 1], 5: [8, 6], 6: [0, 4], 7: [7, 3] };
    return svg(
      420,
      320,
      p.g +
        `<line x1="${p.X(-1)}" y1="${p.Y(1.6)}" x2="${p.X(9)}" y2="${p.Y(5.6)}" stroke="var(--line-2)" stroke-dasharray="5 5"/>` +
        arrowAB(p, A, Bp, "var(--blue)") +
        dot(p.X(1), p.Y(2), "A", { fill: "var(--blue)", stroke: "var(--blue)", tc: "#fff" }) +
        dot(p.X(6), p.Y(4), "B", { fill: "var(--blue)", stroke: "var(--blue)", tc: "#fff" }) +
        Object.entries(pts)
          .map(([k, [x, y]]) => dot(p.X(x), p.Y(y), k, { id: k }))
          .join(""),
    );
  })();
  const o2 = (() => {
    const p = plane(9, 8, 420, 320),
      A = [1, 1],
      Bp = [7, 2];
    const pts = { 1: [2, 5], 2: [5, 7], 3: [8, 4], 4: [4, 0], 5: [3, 3] };
    return svg(
      420,
      320,
      p.g +
        arrowAB(p, A, Bp, "var(--blue)") +
        dot(p.X(1), p.Y(1), "A", { fill: "var(--blue)", stroke: "var(--blue)", tc: "#fff" }) +
        dot(p.X(7), p.Y(2), "B", { fill: "var(--blue)", stroke: "var(--blue)", tc: "#fff" }) +
        Object.entries(pts)
          .map(([k, [x, y]]) => dot(p.X(x), p.Y(y), k, { id: k }))
          .join(""),
    );
  })();
  const o3 = (() => {
    const p = plane(9, 8, 420, 320),
      V = { A: [1, 1], B: [7, 1], C: [8, 4], D: [5, 3], E: [6, 7], F: [2, 6] },
      ks = Object.keys(V);
    const id = uid();
    return svg(
      420,
      320,
      p.g +
        `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink)"/></marker></defs>` +
        `<polygon points="${ks.map((k) => `${p.X(V[k][0])},${p.Y(V[k][1])}`).join(" ")}" fill="var(--violet)" fill-opacity=".1" stroke="none"/>` +
        ks
          .map((k, i) => {
            const a = V[k],
              b = V[ks[(i + 1) % 6]],
              dx = p.X(b[0]) - p.X(a[0]),
              dy = p.Y(b[1]) - p.Y(a[1]),
              L = Math.hypot(dx, dy);
            return `<line x1="${p.X(a[0]) + (dx / L) * 12}" y1="${p.Y(a[1]) + (dy / L) * 12}" x2="${p.X(b[0]) - (dx / L) * 13}" y2="${p.Y(b[1]) - (dy / L) * 13}" stroke="var(--ink)" stroke-width="2.5" marker-end="url(#${id})"/>`;
          })
          .join("") +
        ks.map((k) => dot(p.X(V[k][0]), p.Y(V[k][1]), k, { id: k })).join(""),
    );
  })();
  const o6 = svg(
    320,
    230,
    `<polygon points="60,190 270,160 140,40" fill="var(--violet)" fill-opacity=".12" stroke="var(--violet)" stroke-width="3"/>` +
      dot(60, 190, "P", { r: 16, s: 14 }) +
      dot(270, 160, "Q", { r: 16, s: 14 }) +
      dot(140, 40, "R", { r: 16, s: 14 }) +
      txt(160, 222, "P, Q, R are a counter-clockwise triangle (y up)", { s: 12, w: 700, c: "var(--text-dim)" }),
  );
  Object.assign(partScope, { o1, o2, o3, o6 });
})();

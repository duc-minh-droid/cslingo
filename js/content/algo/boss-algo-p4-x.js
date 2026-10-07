/* boss-algo-p4-x: extra Phase 4 boss questions (Prim details, Kruskal stopping, proof ideas, TSP heuristic). New seven-node network; numbers checked with node. */
(function () {
  const Qf = NIC.qfig;
  const G = { P: [50, 130], Q: [150, 45], R: [150, 215], S: [270, 130], T: [370, 50], U: [370, 210], V: [460, 130] };
  const E = [
    ["P", "Q", 7],
    ["P", "R", 9],
    ["Q", "R", 12],
    ["Q", "S", 6],
    ["R", "S", 10],
    ["S", "T", 5],
    ["S", "U", 8],
    ["T", "V", 4],
    ["U", "V", 3],
    ["T", "U", 11],
    ["Q", "T", 14],
  ];
  // Kruskal order: UV3+ TV4+ ST5+ QS6+ PQ7+ SU8- PR9+ (stop at 6 edges). MST = 34. Prim from P: PQ7 QS6 ST5 TV4 UV3 PR9.
  const def = NIC.bossDef("a4-boss");
  def.qs.push(
    {
      type: "pick",
      q: "Prim starts at <b>P</b>. Tap the vertex it moves into the tree <b>third</b> (after P and the vertex chosen second).",
      fig: Qf.graph(G, E, { pick: "nodes", w: 500, h: 270 }),
      a: ["S"],
      why: "From {P} the cheapest link is P–Q (7), so Q joins second. Now the candidates are R (9, via P), S (6, via Q) and T (14, via Q): <b>S</b> costs least.",
    },
    {
      type: "pick",
      q: "Kruskal sorts these edges and works down the list. Tap the <b>first</b> edge it examines and <b>rejects</b>.",
      fig: Qf.graph(G, E, { pick: "edges", w: 500, h: 270 }),
      a: ["S-U"],
      why: "It takes U–V (3), T–V (4), S–T (5), Q–S (6) and P–Q (7). Then S–U (8) arrives: S and U are already joined through S–T–V–U, so it would close a loop.",
    },
    {
      type: "mcq",
      q: "On this 7-vertex network with 11 edges, how many edges does Kruskal <b>never even read</b>?",
      fig: Qf.graph(G, E, { w: 500, h: 270 }),
      o: ["0", "4", "7", "11"],
      a: 1,
      why: "A tree on 7 vertices needs 6 edges. Kruskal adds its 6th (P–R, 9) as the 7th edge it reads, so the loop stops. The last four in the sorted list (10, 11, 12, 14) are never read.",
    },
    {
      type: "bug",
      q: "This Prim code should always choose the <b>cheapest</b> link to the tree, but it builds expensive trees. Click the faulty line.",
      code: [
        "def prim(V, w, v0):",
        "    tree, near, cost = {v0}, {}, {}",
        "    for v in V - tree:",
        "        near[v], cost[v] = v0, w(v, v0)",
        "    while len(tree) < len(V):",
        "        nxt = max(V - tree, key=lambda v: cost[v])",
        "        tree.add(nxt)",
        "        for v in V - tree:",
        "            if w(v, nxt) < cost[v]:",
        "                near[v], cost[v] = nxt, w(v, nxt)",
      ],
      a: 5,
      why: "<code>max</code> picks the most expensive outside vertex. Prim must select the vertex with the <b>smallest</b> stored cost, so this line needs <code>min</code>.",
    },
    {
      type: "slider",
      q: "Estimate the number of steps the array version of Prim takes on a network with 31 vertices (loops over vertices only).",
      min: 100,
      max: 2000,
      step: 100,
      start: 500,
      ans: 900,
      tol: 150,
      unit: " steps",
      hint: "The total is (V − 1)². Here V − 1 = 30, and 30 × 30 = 900.",
      why: "The two inner loops add up to (V − 1)² = 30² = 900, quadratic in the number of vertices.",
    },
    {
      type: "match",
      q: "Match each algorithm to the right description.",
      pairs: [
        ["Prim: what it remembers", "nearest tree vertex and cost for each outsider"],
        ["Kruskal: what it remembers", "which group each vertex is in"],
        ["Prim with arrays: cost", "about V², however few edges"],
        ["Kruskal: cost", "about E log V, mostly the sort"],
      ],
      why: "Prim keeps a nearest/cost note per outside vertex and loops over vertices, giving O(V²). Kruskal keeps groups, sorts the edges, and costs O(E log V).",
    },
    {
      type: "cat",
      q: "A tour is built from an MST by walking round it twice and shortcutting repeated towns. Which statements does the argument guarantee?",
      buckets: ["Guaranteed", "Not guaranteed"],
      items: [
        ["Tour length is at most twice the MST weight", 0],
        ["Tour length is at most twice the shortest circuit", 0],
        ["The shortest circuit weighs at least as much as the MST", 0],
        ["The tour is the shortest possible circuit", 1],
        ["The tour uses only edges of the MST", 1],
      ],
      why: "The walk is exactly 2 × MST and shortcuts never lengthen it. Removing an edge from the best circuit leaves a spanning tree, so best ≥ MST. Nothing says the tour is optimal, and shortcuts use new direct legs that are not tree edges.",
    },
    {
      type: "multi",
      q: "Which statements about the cut lemma and its proof are true? Select all that apply.",
      o: [
        "Adding a non-tree edge to a spanning tree creates exactly one cycle",
        "The lemma works for any non-empty proper subset X of the vertices",
        "X must contain the lightest edge of the whole graph",
        "An edge Kruskal skipped can later become the lightest edge leaving a component",
      ],
      a: [0, 1],
      why: "The new edge closes one loop, and the swap argument needs only a non-empty proper X (something on both sides). The lightest crossing edge need not be the graph's lightest. A skipped edge has both ends in one component, and components only merge, so it never leaves a component.",
    },
  );
  (NIC.modules || []).forEach((m) => {
    if (m.id === "a4-boss") m.qCount = def.qs.length;
  });
})();

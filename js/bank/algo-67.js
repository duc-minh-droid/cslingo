/* js/bank/algo-70.js: revision questions for a4-tsp and the a4-cut / a4-mst top-ups. */
(function () {
  const N = NIC,
    B = N.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({
    type: "mcq",
    q: `True or false? ${q}`,
    o: ["True", "False"],
    a: yes ? 0 : 1,
    why,
  });

  /* ---------------- a4-tsp ---------------- */
  B.add("a4-tsp", [
    M(
      "What does the travelling-salesman problem ask for?",
      [
        "The shortest circuit that visits every vertex once",
        "The cheapest tree that links every vertex",
        "The shortest path between two vertices",
        "The most edges in a cycle-free subgraph",
      ],
      0,
      "A circuit is a cycle through all vertices; TSP wants the shortest one.",
    ),
    M(
      "TSP is NP-complete. What does that mean in practice here?",
      [
        "No feasible exact algorithm is known, so heuristics are used",
        "It can be solved exactly in time linear in the input",
        "It has no solution for graphs with many vertices",
        "It only applies to graphs that are already trees",
      ],
      0,
      "We settle for good-enough tours.",
    ),
    M(
      "An MST has weight 22. How long is the walk that goes down and back along every tree edge?",
      ["22", "44", "66", "11"],
      1,
      "Each edge is used twice: 2 × 22 = 44.",
    ),
    M(
      "The MST of a network weighs 22. What is true of the shortest circuit?",
      ["It weighs at least 22", "It weighs at most 22", "It weighs exactly 44", "It weighs less than 11"],
      0,
      "Remove one edge from the shortest circuit and you have a spanning tree, so the circuit weighs at least as much as the MST.",
    ),
    TF(
      "The doubled-tree tour is always the shortest possible circuit.",
      false,
      "It is only guaranteed to be at most twice the best.",
    ),
    {
      type: "order",
      q: "Order the steps of the MST tour heuristic.",
      items: [
        "Build a minimum spanning tree",
        "Walk round it, down and back every edge",
        "Skip any town already visited",
        "Return to the start",
      ],
      why: "MST, walk, shortcut, close.",
    },
    M(
      "A walk goes C, B, A, D, where B has already been visited and A and D are new. What does the tour do?",
      [
        "Goes C to A directly, then A to D",
        "Keeps the walk unchanged",
        "Goes C to D directly, skipping A",
        "Starts again from B",
      ],
      0,
      "Skip the repeat B: go straight from C to A, then on to D.",
      { hint: "Skip only towns already visited." },
    ),
    M(
      "A tour found by the heuristic is 31 and the MST is 18. What do you know about the shortest circuit?",
      [
        "It lies between 18 and 31",
        "It is exactly 31, the tour found",
        "It is less than 18, below the tree",
        "It is at least 36, double the tree",
      ],
      0,
      "The best circuit is at least the MST (18) and at most any tour found (31).",
    ),
    M(
      "What does the triangle inequality give the shortcut step?",
      [
        "A direct leg is never longer than the detour it replaces",
        "Every tour built this way is automatically optimal",
        "The minimum spanning tree is always unique",
        "The walk itself visits each town exactly once already",
      ],
      0,
      "Going straight from A to C is no longer than A to B to C.",
    ),
    {
      type: "slider",
      q: "An MST weighs 35. Estimate the length of the doubled walk.",
      min: 10,
      max: 120,
      step: 5,
      ans: 70,
      tol: 5,
      unit: "",
      hint: "Each edge is used twice.",
      why: "2 × 35 = 70, an upper bound on the tour.",
    },
    M(
      "Why does removing one edge from a circuit give a spanning tree?",
      [
        "What is left is a path through every vertex",
        "The edge removed was always the heaviest one",
        "It leaves the graph in two disconnected pieces",
        "It adds one more vertex to the circuit",
      ],
      0,
      "A cycle through all vertices becomes a path through all vertices, a tree.",
    ),
    M(
      "How many edges does a circuit through 12 vertices have, compared with a spanning tree of those vertices?",
      ["12 against 11", "11 against 12", "12 against 12", "24 against 12"],
      0,
      "A circuit returns to the start, so it has n edges. A tree has n − 1.",
    ),
  ]);

  /* ---------------- top-ups for existing modules ---------------- */
  B.add("a4-cut", [
    M(
      "Why can X not be the whole vertex set in the cut lemma?",
      [
        "Then no edge crosses from X to the rest",
        "The tree would then contain a cycle",
        "The graph would then become directed",
        "The weights would then all be zero",
      ],
      0,
      "A proper subset leaves vertices outside, so some edges cross.",
    ),
    M(
      "A cut has crossing edges of weights 6, 9 and 14, all different. Which is guaranteed to be in the MST?",
      ["6", "9", "14", "none of them"],
      0,
      "The lightest crossing edge is forced in.",
    ),
    TF(
      "The lemma applies to a cut where X is a single vertex.",
      true,
      "A single vertex is a non-empty proper subset: its lightest incident edge is in the MST.",
    ),
  ]);
  B.add("a4-mst", [
    M(
      "Which is true when all edge weights are distinct?",
      [
        "Prim and Kruskal return the same tree",
        "Prim and Kruskal return different trees of equal cost",
        "Only Kruskal is correct",
        "The tree depends on the start vertex",
      ],
      0,
      "The MST is unique, so any correct algorithm finds it.",
    ),
    M(
      "Which has the smaller cost on a graph with 300 vertices and about 450 edges?",
      ["Kruskal", "Prim's array version", "They are equal", "Neither runs"],
      0,
      "Kruskal ≈ 450 × 8 = 3 600. Prim ≈ 299² ≈ 90 000.",
    ),
    M(
      "Kruskal has accepted 3 edges on a graph of 8 vertices. How many groups are there?",
      ["3", "5", "8", "11"],
      1,
      "8 − 3 = 5, since each accepted edge merges two groups.",
    ),
  ]);
})();

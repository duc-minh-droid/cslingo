/* js/bank/algo-69.js: revision questions for a4-proof, a4-cost and a4-edge. */
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

  /* ---------------- a4-proof ---------------- */
  B.add("a4-proof", [
    M(
      "Which statement is the cut lemma?",
      [
        "The lightest edge between X and the rest is in the MST",
        "The heaviest edge in the graph never belongs to any spanning tree",
        "Every cycle in the graph contains the lightest edge of all",
        "A spanning tree contains the lightest edge at each vertex",
      ],
      0,
      "For a non-empty proper subset X, the shortest edge crossing from X to V \\ X is forced into the MST.",
    ),
    M(
      "In the proof, why does adding e to a spanning tree T create a cycle?",
      [
        "e's ends are already joined through T",
        "e is heavier than the edges of T",
        "T has too few edges",
        "e is the lightest edge",
      ],
      0,
      "T connects all vertices, so there is already a path between e's two ends. e closes it into a loop.",
    ),
    M(
      "T is a spanning tree costing 40 without e. e (weight 5) is the lightest edge across a cut, and f (weight 9) is on the cycle e creates and crosses the same cut. What does T − f + e cost?",
      ["36", "40", "44", "49"],
      0,
      "Remove 9 and add 5: 40 − 9 + 5 = 36. It is cheaper, so T was not minimal.",
      { hint: "40 − 9 = 31, then 31 + 5." },
    ),
    M(
      "What is X in Prim's correctness proof?",
      [
        "The set of vertices already in the tree",
        "The set of vertices not yet reached",
        "The two ends of the lightest edge overall",
        "The set of rejected edges",
      ],
      0,
      "Prim picks the lightest edge between the tree and the rest, exactly the lemma with X = the tree.",
    ),
    M(
      "What is X in Kruskal's correctness proof, when it adds an edge?",
      [
        "One of the current components",
        "The whole vertex set",
        "The vertices the edge's heavier end connects to",
        "The first edge in the sorted list",
      ],
      0,
      "The edge joins two components; it is the shortest edge leaving a component, so the lemma applies to that component.",
    ),
    {
      type: "order",
      q: "Put the steps of the exchange proof in order.",
      items: [
        "Take any spanning tree T that lacks e",
        "Add e to T, creating one cycle",
        "Find another edge f on that cycle crossing the same cut",
        "Replace f by e: the new tree is cheaper",
      ],
      why: "Assume T lacks e, add e to form a cycle, find the crossing edge f, swap.",
    },
    TF(
      "The proof as given needs every pair of edges to have different weights.",
      true,
      "It uses “the shortest edge”; with ties the MST may not be unique and the argument needs adapting.",
    ),
    M(
      "A triangle has all three edges of weight 6. How many minimum spanning trees does it have?",
      ["1", "2", "3", "6"],
      2,
      "Any two of the three edges form a spanning tree of weight 12: three choices.",
    ),
    M(
      "What does “totally correct” mean for Prim's algorithm?",
      [
        "For every valid input it ends with a minimum spanning tree",
        "It gives the right answer on all the tests that were tried",
        "It runs in time that grows linearly with the input size",
        "It never reads the same edge twice during one run",
      ],
      0,
      "Total correctness is about every valid input, which tests alone cannot show.",
    ),
    M(
      "Why does a cycle containing a crossing edge e always cross the border at least twice?",
      [
        "A cycle that leaves X must come back into X",
        "Cycles have an even number of vertices",
        "e is always paired with the heaviest edge",
        "X has two vertices",
      ],
      0,
      "A closed loop returns to where it began, so it crosses the border an even number of times.",
    ),
    {
      type: "multi",
      q: "Which statements are true? Select all that apply.",
      o: [
        "X in the lemma may be a single vertex",
        "X in the lemma may be the whole vertex set",
        "The lemma's edge e need not be the lightest edge in the whole graph",
        "After the swap the new tree has the same number of edges",
      ],
      a: [0, 2, 3],
      why: "A single vertex is a valid proper subset. All of V is not proper, so there is nothing to cross. e is the lightest across that cut only. A swap removes one edge and adds one, so n − 1 edges remain.",
    },
  ]);

  /* ---------------- a4-cost ---------------- */
  B.add("a4-cost", [
    M(
      "The array version of Prim runs in…",
      ["O(|V|²)", "O(|E| log |E|)", "O(|V| log |V|)", "O(|E|²)"],
      0,
      "Two loops over the remaining vertices inside a loop that runs |V| − 1 times.",
    ),
    M(
      "Kruskal's running time is…",
      ["O(|E| log |V|)", "O(|V|²)", "O(|V| log |E|)", "O(|E|²)"],
      0,
      "Sort edges and do about |E| group lookups.",
    ),
    TF(
      "The array version of Prim takes longer on a graph with many more edges, even with the same vertices.",
      false,
      "Its loops count vertices only; the edge count does not appear in (V − 1)².",
    ),
    M(
      "A graph has 100 vertices and 200 edges. Comparing 99² with 200 × 7, which is cheaper?",
      ["Kruskal: about 1 400 against 9 800", "Prim: about 1 400 against 9 800", "Equal", "Impossible to compare"],
      0,
      "Kruskal ≈ E log₂ V ≈ 200 × 7 = 1 400. Prim ≈ 99² ≈ 9 800. The graph is sparse.",
      { hint: "99² is about 100² = 10 000." },
    ),
    M(
      "A complete graph has 200 vertices (about 20 000 edges). Which does less work?",
      [
        "Prim: about 40 000 steps against 150 000",
        "Kruskal: about 40 000 steps against 150 000",
        "They cost exactly the same amount of work",
        "Neither of them can run on a graph this dense",
      ],
      0,
      "Prim ≈ 199² ≈ 40 000. Kruskal ≈ 20 000 × 7.6 ≈ 150 000.",
      { hint: "log₂ 200 is about 7.6." },
    ),
    M(
      "You double the number of vertices of a road network, keeping about 3 roads per vertex. Roughly how does Kruskal's work change?",
      ["A bit more than doubles", "Quadruples", "Stays the same", "Increases eight times"],
      0,
      "E doubles and log V grows slightly, so E log V a little more than doubles. Prim's array version would quadruple.",
    ),
    {
      type: "slider",
      q: "Estimate Kruskal's step count (E log₂ V) for E = 1 000 edges and V = 1 024 vertices.",
      min: 1000,
      max: 40000,
      step: 1000,
      ans: 10000,
      tol: 2500,
      unit: " steps",
      hint: "log₂ 1 024 = 10, so 1 000 × 10.",
      why: "1 000 × 10 = 10 000.",
    },
    M(
      "Why is log |E| the same order as log |V| for a simple graph?",
      [
        "|E| ≤ |V|², so log |E| ≤ 2 log |V|",
        "The edge count always equals the vertex count",
        "Both of them are constants whatever the graph",
        "The logarithm ignores whatever its argument is",
      ],
      0,
      "Doubling a log only changes a constant factor.",
    ),
    M(
      "Prim with a priority queue in place of arrays runs in…",
      ["O(|E| log |V|)", "O(|V|²) as before", "O(|V|) at best", "O(|E|²) overall"],
      0,
      "Each edge may cause one queue update costing log |V|.",
    ),
    {
      type: "match",
      q: "Match each graph to the cheaper algorithm.",
      pairs: [
        ["Road map: 3 roads per junction", "Kruskal"],
        ["Every pair of 500 cities linked", "Prim, array version"],
        ["10 000 vertices, 12 000 edges", "Kruskal"],
        ["100 vertices, 4 950 edges (complete)", "Prim, array version"],
      ],
      why: "Sparse graphs have E log V far below V². Complete graphs have E near V²/2, so E log V exceeds V².",
    },
    M(
      "Sorting m edges before Kruskal's loop costs…",
      ["O(m log m)", "O(m) at best", "O(log m) only", "O(m²) always"],
      0,
      "A comparison sort costs m log m.",
    ),
    M(
      "What does big-O notation hide?",
      [
        "Constant factors, so small inputs can favour either",
        "The input size that the algorithm is run on",
        "Whether the output of the algorithm is correct",
        "Which data structure the algorithm happens to use",
      ],
      0,
      "Order of growth ignores constants, which matter for small graphs.",
    ),
  ]);

  /* ---------------- a4-edge ---------------- */
  B.add("a4-edge", [
    M(
      "A graph is a triangle with all three edges the same weight. How many different minimum spanning trees does it have?",
      ["1", "2", "3", "6"],
      2,
      "Drop any one of the three edges: three trees, all the same total.",
    ),
    M(
      "Two correct implementations return different edge lists for the same graph with tied weights. What should you compare?",
      ["The total weights", "The order of the edges", "The first edge in each list", "The run times"],
      0,
      "Ties allow several minimum trees, but each must have the same total weight.",
    ),
    M(
      "How do you make a tie-break repeatable?",
      [
        "Sort by weight, then by vertex names",
        "Pick a random edge each time",
        "Always take the edge read last",
        "Drop all tied edges",
      ],
      0,
      "A fixed rule gives identical output on every run.",
    ),
    M(
      "Two separate pieces have 5 and 3 vertices. How many edges does the largest cycle-free selection (a spanning forest) have?",
      ["6", "7", "8", "2"],
      0,
      "A tree on each piece: (5 − 1) + (3 − 1) = 6. No edge joins the pieces.",
    ),
    M(
      "Kruskal's list runs out with fewer than |V| − 1 edges chosen. What does that tell you?",
      ["The graph is disconnected", "There was a tie", "The weights were not distinct", "Sorting was wrong"],
      0,
      "Some groups never found an edge to join them.",
    ),
    M(
      "You build the MST of 50 points and delete its 2 heaviest edges. How many groups do you get?",
      ["2", "3", "48", "52"],
      1,
      "Each deletion splits the tree: 1 + 2 = 3 groups.",
    ),
    M(
      "In image segmentation with an MST, what are the vertices and weights?",
      [
        "Pixels, with weights from colour difference between neighbours",
        "Colours, with weights taken from the pixel counts of each",
        "Image files, with weights taken from the file sizes",
        "Rows of pixels, with weights taken from the image width",
      ],
      0,
      "Neighbouring pixels are linked; similar colours cost little, so cutting heavy edges separates regions.",
    ),
    {
      type: "cat",
      q: "Is a minimum spanning tree the right tool?",
      buckets: ["MST fits", "Needs another tool"],
      items: [
        ["Cheapest cabling that links 40 offices", 0],
        ["Splitting survey points into groups by cutting the weakest links", 0],
        ["Fastest route from a depot to one customer", 1],
        ["Shortest route between every pair of towns", 1],
      ],
      why: "An MST minimises the total network cost and gives hierarchical clusters. Pairwise or point-to-point journeys are shortest-path problems.",
    },
    {
      type: "multi",
      q: "Which statements about equal weights and missing links are true? Select all that apply.",
      o: [
        "Equal weights can give several minimum spanning trees",
        "A disconnected graph has no spanning tree",
        "Equal weights make Kruskal fail",
        "A disconnected graph has a spanning forest",
      ],
      a: [0, 1, 3],
      why: "Ties give multiple MSTs but the algorithms still work. A disconnected graph has no spanning tree, only a forest with one tree per piece.",
    },
    M(
      "A square has four sides of weight 3 and nothing else. What is the weight of a minimum spanning tree?",
      ["6", "9", "12", "4"],
      1,
      "Three of the four sides: 3 × 3 = 9.",
    ),
    M(
      "Why does cutting the heaviest MST edges separate distant groups?",
      [
        "It is the lightest link across its split, so a big gap",
        "Heavy edges are always bridges in the original graph",
        "The heaviest edges of the tree are chosen at random each time",
        "Cutting edges lowers the total weight of the whole graph",
      ],
      0,
      "By the cut property each tree edge is the cheapest way to join its two sides.",
    ),
  ]);
})();

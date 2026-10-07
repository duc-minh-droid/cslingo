/* js/bank/algo-68.js: revision questions for a4-intro, a4-prim and a4-kruskal. */
(function () {
  const N = NIC,
    B = N.bank,
    Qf = N.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({
    type: "mcq",
    q: `True or false? ${q}`,
    o: ["True", "False"],
    a: yes ? 0 : 1,
    why,
  });
  const PGN = {
    A: [50, 130],
    B: [160, 50],
    C: [160, 210],
    D: [300, 50],
    E: [300, 210],
    F: [420, 130],
  };
  const PGE = [
    ["A", "B", 4],
    ["A", "C", 2],
    ["B", "C", 5],
    ["B", "D", 9],
    ["C", "E", 3],
    ["D", "E", 7],
    ["D", "F", 6],
    ["E", "F", 10],
  ];
  const pg = (x = {}) => Qf.graph(PGN, PGE, { w: 480, h: 260, ...x });

  /* ---------------- a4-intro ---------------- */
  B.add("a4-intro", [
    M(
      "A connected network has 15 towns. How many edges does any spanning tree of it contain?",
      ["14", "15", "16", "105"],
      0,
      "A spanning tree on n vertices has n − 1 edges: 14.",
    ),
    M(
      "Which description is a tree?",
      [
        "6 vertices, 5 edges, all connected",
        "6 vertices, 6 edges, all connected",
        "6 vertices, 5 edges, in two pieces, one containing a cycle",
        "6 vertices, 3 edges, all connected",
      ],
      0,
      "Connected with n − 1 edges means no cycle. 6 edges connected has a cycle; the third description has a cycle; 3 edges cannot connect 6 vertices.",
    ),
    {
      type: "cat",
      q: "A network has 5 towns. Sort each chosen set of cables.",
      buckets: ["A spanning tree", "Not a spanning tree"],
      items: [
        ["4 cables linking all 5 towns, no loop", 0],
        ["4 cables in a chain through all 5 towns", 0],
        ["5 cables linking all 5 towns", 1],
        ["3 cables linking only 4 of the towns", 1],
        ["4 cables: a triangle plus a separate cable", 1],
      ],
      why: "A spanning tree touches all towns, has n − 1 = 4 edges and no cycle. 5 cables contain a loop; 3 cables cannot reach all five; a triangle plus a lone cable leaves a loop and a stranded piece.",
    },
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Path", "a sequence of vertices, each joined to the next"],
        ["Cycle", "a path that returns to where it began"],
        ["Tree", "a graph with no cycles"],
        ["Spanning tree", "a tree that includes every vertex"],
      ],
      why: "These are the lecture's definitions: path, then cycle (a path that closes), then tree (cycle-free), then spanning tree (a tree using all vertices).",
    },
    M(
      "Four towns W, X, Y, Z have cables W–X 2, X–Y 3, Y–Z 4, W–Y 5, W–Z 6. What is the cheapest total to connect all four?",
      ["9", "11", "13", "20"],
      0,
      "Take 2, 3 and 4 (no loops): 2 + 3 + 4 = 9. The 5 and 6 would close loops.",
      {
        fig: Qf.graph(
          { W: [60, 60], X: [200, 40], Y: [200, 190], Z: [60, 190] },
          [
            ["W", "X", 2],
            ["X", "Y", 3],
            ["Y", "Z", 4],
            ["W", "Y", 5],
            ["W", "Z", 6],
          ],
          { w: 300, h: 240 },
        ),
        hint: "Pick the three cheapest edges that do not close a loop.",
      },
    ),
    M(
      "Who first formalised the minimum spanning tree problem, and why?",
      [
        "Borůvka, designing an electricity network in 1926",
        "Dijkstra, finding routes for a road atlas",
        "Prim, laying out circuits on a computer chip",
        "Kruskal, scheduling jobs on a mainframe",
      ],
      0,
      "Otakar Borůvka addressed efficient electric distribution networks and gave the first known algorithm.",
    ),
    TF(
      "A minimum spanning tree gives the shortest route between every pair of towns.",
      false,
      "It minimises the total weight of the network, not any one pair's distance.",
    ),
    TF(
      "A disconnected graph can still have a spanning tree.",
      false,
      "A spanning tree must reach every vertex, which is impossible when the graph is in separate pieces.",
    ),
    M(
      "You delete one edge from a spanning tree of 10 vertices. How many separate pieces remain?",
      ["1", "2", "9", "10"],
      1,
      "Every edge of a tree is a bridge: removing it splits the tree into exactly two pieces.",
    ),
    M(
      "What does the weight function w: E → ℝ⁺ do?",
      [
        "Gives every edge a positive cost",
        "Gives every vertex a positive cost",
        "Counts the cycles through each edge",
        "Orders the vertices alphabetically",
      ],
      0,
      "ℝ⁺ means positive real numbers, and the domain E means each edge gets one.",
    ),
    M(
      "A spanning tree is a maximal cycle-free subgraph. What happens if you add any further edge of the graph to it?",
      ["A cycle appears", "A vertex is left out", "It becomes disconnected", "Nothing changes"],
      0,
      "It is maximal: one more edge makes a loop.",
    ),
  ]);

  /* ---------------- a4-prim ---------------- */
  B.add("a4-prim", [
    {
      type: "pick",
      q: "Prim starts at <b>A</b>. Tap the vertex that joins the tree <b>fourth</b> (A is first).",
      fig: pg({ pick: "nodes" }),
      a: ["B"],
      why: "A–C (2) gives C, then C–E (3) gives E. Now the candidates are A–B (4), B–C (5), D–E (7) and E–F (10): B costs least.",
    },
    M(
      "Prim's tree is {A, C}. What does vertex E record, if the graph has edges C–E 3, D–E 7 and E–F 10?",
      ["nearest C, cost 3", "nearest A, cost ∞", "nearest E, cost 0", "nearest D, cost 7"],
      0,
      "Adding C lets E reach the tree through C–E (3), which beats its old ∞ (no edge to A).",
      { fig: pg() },
    ),
    {
      type: "order",
      q: "Put the steps of one Prim pass in order.",
      items: [
        "Pick the outside vertex with the smallest stored cost",
        "Move it into the tree and add its edge",
        "Compare each remaining vertex's cost with the edge to the newcomer",
        "Repeat while any vertex is still outside",
      ],
      why: "Select, add, update, then loop.",
    },
    M(
      "In Prim's pseudocode, a vertex with cost ∞ means…",
      [
        "it has no edge to any vertex in the tree yet",
        "it is already in the tree",
        "its edge is the heaviest in the graph",
        "it has been rejected for ever",
      ],
      0,
      "∞ marks “no known link to the tree”. It can still be reached later.",
    ),
    TF(
      "Prim must start at the vertex with the lightest edge.",
      false,
      "Any start vertex works; with distinct weights the final tree is the same.",
    ),
    M(
      "Prim's array version runs on a 6-vertex graph. About how many inner-loop steps does it take in total, using (V − 1)²?",
      ["12", "25", "36", "720"],
      1,
      "The two inner loops sum to (V − 1)² = 5² = 25.",
      { hint: "5 × 5." },
    ),
    {
      type: "bug",
      q: "This Prim update step should lower a vertex's cost when the new vertex is closer. Click the faulty line.",
      code: [
        "for v in outside:",
        "    cand = w(v, nxt)",
        "    if cand > cost[v]:",
        "        near[v] = nxt",
        "        cost[v] = cand",
      ],
      a: 2,
      why: "It should replace the stored cost only when the new link is <b>cheaper</b>: <code>cand &lt; cost[v]</code>.",
    },
    {
      type: "cat",
      q: "Which algorithm does each statement describe?",
      buckets: ["Prim", "Kruskal"],
      items: [
        ["Keeps a nearest tree vertex for each outsider", 0],
        ["Always has exactly one connected tree", 0],
        ["Sorts all the edges first", 1],
        ["Merges groups of vertices", 1],
        ["Starts from an arbitrary vertex", 0],
      ],
      why: "Prim grows one tree from a chosen start with nearest/cost notes. Kruskal sorts edges and merges groups.",
    },
    {
      type: "slider",
      q: "Estimate the inner-loop steps of array Prim on 11 vertices.",
      min: 20,
      max: 300,
      step: 10,
      ans: 100,
      tol: 20,
      unit: " steps",
      hint: "(V − 1)² with V − 1 = 10.",
      why: "10 × 10 = 100.",
    },
    M(
      "All remaining vertices still have cost ∞ when Prim goes to select the next vertex. What does it output?",
      [
        "No spanning tree",
        "The tree built so far, as the answer",
        "The tree plus the heaviest edge",
        "An error from the sorting step",
      ],
      0,
      "Nothing outside is connected to the tree, so the graph is disconnected.",
    ),
    M(
      "After a new vertex x joins the tree, which outside vertices does the update loop look at?",
      [
        "Every vertex still outside",
        "Only x's neighbours",
        "Only the cheapest outside vertex",
        "Every vertex in the graph, including the tree's",
      ],
      0,
      "It loops over R, but only a cheaper link through x changes a note.",
    ),
  ]);
  /* ---------------- a4-kruskal ---------------- */
  B.add("a4-kruskal", [
    {
      type: "order",
      q: "In what order does Kruskal <b>accept</b> edges on this graph?",
      fig: pg(),
      items: ["A–C (2)", "C–E (3)", "A–B (4)", "D–F (6)", "D–E (7)"],
      why: "Sorted: 2, 3, 4, 5, 6, 7, 9, 10. B–C (5) closes the loop A–B–C so is skipped; D–F (6) and D–E (7) join the other side, giving 5 edges.",
    },
    {
      type: "pick",
      q: "Tap the edge Kruskal <b>skips</b> (rejects) on this graph.",
      fig: pg({ pick: "edges" }),
      a: ["B-C"],
      why: "By the time B–C (5) is read, A–B and A–C already connect B and C, so it would close a loop.",
    },
    M(
      "On the same graph, how many of the 8 edges does Kruskal actually look at before stopping?",
      ["5", "6", "7", "8"],
      1,
      "It reads 2, 3, 4, 5, 6, 7 (six edges), adds its fifth tree edge at 7, and stops. The 9 and 10 are never read.",
      { fig: pg() },
    ),
    M(
      "Groups are {A, B}, {C, D} and {E}. Kruskal reads edge B–E. What happens?",
      [
        "It is added and {A, B} and {E} merge",
        "It is skipped as a loop",
        "It is added and all three groups merge",
        "It is held back until the end",
      ],
      0,
      "B and E are in different groups, so the edge is safe. Only those two groups merge: {A, B, E}, {C, D}.",
    ),
    M(
      "A graph has 9 vertices. Kruskal has accepted 4 edges. How many groups exist now?",
      ["4", "5", "8", "9"],
      1,
      "Start with 9 groups; each accepted edge merges two groups, so 9 − 4 = 5.",
    ),
    M(
      "The Kruskal loop runs while |R| > 0 and |ET| < |V| − 1. Which case ends it through the second condition?",
      [
        "A spanning tree has just been completed",
        "The graph was found to be disconnected",
        "Every edge read so far was a loop",
        "The sort step failed part way through",
      ],
      0,
      "|ET| = |V| − 1 means the tree is complete, so unread edges are never needed.",
    ),
    TF(
      "Kruskal always reads every edge in the sorted list.",
      false,
      "It stops as soon as it has |V| − 1 edges, leaving the rest unread.",
    ),
    {
      type: "bug",
      q: "This Kruskal loop should add an edge only if it does not close a loop. Click the faulty line.",
      code: [
        "for (a, b, w) in sorted_edges:",
        "    ga = group_of(a)",
        "    gb = group_of(b)",
        "    if ga == gb:",
        "        tree.append((a, b, w))",
        "        merge(ga, gb)",
      ],
      a: 3,
      why: "The test is reversed. Edges whose ends are in the <b>same</b> group are loops. The condition should be <code>ga != gb</code>.",
    },
    {
      type: "match",
      q: "Match each line of the lecture's Kruskal pseudocode to its job.",
      pairs: [
        ["R ← sorted(E)", "list the edges lightest first"],
        ["groups ← {{v} | v in V}", "start with every vertex alone"],
        ["Gi ≠ Gj", "test that the edge creates no loop"],
        ["merge Gi and Gj", "record the new connection"],
      ],
      why: "Sort, singleton groups, the group test, and the merge.",
    },
    M(
      "Looking up which group a vertex is in takes O(V) because a list of groups is scanned. How does that change Kruskal's loop cost, with E edges?",
      [
        "About E × V instead of E × log V",
        "It does not change the cost at all",
        "About V² only, with no edge term",
        "About log E only, with no vertex term",
      ],
      0,
      "Two O(V) lookups per edge give about E × V, much worse than the O(log V) a better structure achieves.",
    ),
    M(
      "Why is O(E log E + E log V) the same order as O(E log V)?",
      ["log E is at most about 2 log V", "E always equals V", "Sorting is free", "Logs of different numbers are equal"],
      0,
      "A simple graph has fewer than V² edges, so log E < 2 log V.",
    ),
    M(
      "Kruskal's list is exhausted with 4 edges chosen on 7 vertices. What is the output?",
      ["No spanning tree", "A spanning tree of 4 edges", "A tree with 6 edges", "The 4 edges plus 2 guesses"],
      0,
      "A tree on 7 vertices needs 6. With only 4 there are separate pieces.",
    ),
  ]);
})();

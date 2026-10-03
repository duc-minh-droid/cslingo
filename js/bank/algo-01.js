/* Revision bank content for one course, merged from the earlier part files (loaded on demand by js/bank.js, never on startup). Append new questions at the end with NIC.bank.add(...). */
/* ===== bank-algo.js ===== */
/* Algorithms revision bank — new graphs, numbers and scenarios per session, no calculator needed. Numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const N = NIC,
    B = N.bank,
    Qf = N.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  const GD = { S: [60, 130], A: [190, 50], B: [190, 210], C: [330, 130], T: [450, 130] };
  const ED = [
    ["S", "A", 2],
    ["S", "B", 5],
    ["A", "B", 1],
    ["A", "C", 6],
    ["B", "C", 2],
    ["C", "T", 1],
  ]; // dist S0 A2 B3 C5 T6

  /* ---------- Phase 1 ---------- */
  B.add("a1-anatomy", [
    {
      type: "multi",
      q: "Which properties must a procedure have to count as an algorithm? Select all.",
      o: [
        "Every step is unambiguous",
        "It finishes after a finite number of steps",
        "It's written in a programming language",
        "It produces the right output for every valid input",
      ],
      a: [0, 1, 3],
      why: "Language doesn't matter: a recipe on paper can be an algorithm. Clarity, termination and correctness do.",
    },
    M(
      "A loop sums a list. Which invariant proves it correct?",
      [
        "total is always positive, whatever the list holds",
        "after k items, total = sum of the first k",
        "total equals the last item seen so far",
        "k is always an even number",
      ],
      1,
      "True at the start (0 items, total 0), kept by each step, and at the end it says total = sum of everything.",
    ),
    {
      type: "bug",
      q: "This should return the <b>smallest</b> item of a non-empty list. Click the faulty line.",
      code: [
        "def smallest(xs):",
        "    best = xs[0]",
        "    for x in xs:",
        "        if x > best:",
        "            best = x",
        "    return best",
      ],
      a: 3,
      why: "<code>x &gt; best</code> keeps the largest. It should be <code>x &lt; best</code>.",
    },
    {
      type: "order",
      q: "Order the three checks that turn a loop invariant into a proof.",
      items: [
        "Initialisation: it's true before the loop starts",
        "Maintenance: one iteration keeps it true",
        "Termination: when the loop ends, it gives the result you want",
      ],
      why: "Start true, stay true, finish useful.",
    },
    M(
      "An <code>average(xs)</code> function works in every test. Which input is most likely to break it?",
      ["[1, 2, 3] (several items)", "[] (the empty list)", "[5] (a single item)", "[0, 0] (all zeros)"],
      1,
      "Dividing by the length of an empty list is division by zero.",
    ),
  ]);
  B.add("a1-bigo", [
    M(
      "A loop halves n each time until it reaches 1. About how many iterations for n = 1,000,000?",
      ["20", "1,000", "500,000", "1,000,000"],
      0,
      "2²⁰ ≈ 10⁶, so about 20 halvings.",
    ),
    M(
      "3n² + 100n + 5 simplifies to…",
      ["O(n)", "O(n²)", "O(100n)", "O(3n² + 100n)"],
      1,
      "Keep the fastest-growing term, drop constants.",
    ),
    {
      type: "match",
      q: "Match each loop shape to its growth.",
      pairs: [
        ["One loop over n items", "O(n)"],
        ["A full loop inside another full loop", "O(n²)"],
        ["Halve the problem each step", "O(log n)"],
        ["A full pass over n items at each of log n levels", "O(n log n)"],
      ],
      why: "These four shapes cover most everyday code.",
    },
    M(
      "An O(n²) algorithm takes 1 second for n = 1,000. Roughly how long for n = 2,000?",
      ["2 s", "4 s", "8 s", "1 s"],
      1,
      "Doubling n quadruples n².",
    ),
    TF(
      "An O(n) algorithm is faster than an O(n²) one for every input size.",
      false,
      "Big-O ignores constants. For small n, a well-tuned O(n²) can win.",
    ),
  ]);
  B.add("a1-surfer", [
    M(
      "A page has rank 0.2 and 4 outgoing links. How much rank does each link pass on?",
      ["0.2", "0.05", "0.8", "0.5"],
      1,
      "Rank is split equally: 0.2 / 4 = 0.05.",
    ),
    {
      type: "match",
      q: "Match each problem to its fix.",
      pairs: [
        ["A page with no outgoing links", "Spread its rank evenly over all pages"],
        ["Two pages that only link to each other", "Teleport: occasionally jump to a random page"],
        ["1,000 junk pages linking to one shop", "Weight each link by the rank of the page it comes from"],
      ],
      why: "Dangling pages leak, closed loops trap, and link spam is defeated by rank-weighted links.",
    },
    M(
      "Rank flows into the cycle A → B → A and never leaves. What does the ranking look like without teleportation?",
      ["Uniform", "A and B hoard the rank", "Every page gets equal rank", "The ranks go negative"],
      1,
      "A closed loop is a rank trap.",
    ),
    M(
      "You lower damping from 0.85 to 0.5. What happens to the ranks?",
      ["They become more extreme", "They become more uniform", "Nothing", "They all become zero"],
      1,
      "More random jumps means links matter less.",
    ),
    TF(
      "A link from a highly ranked page is worth more than a link from an obscure one.",
      true,
      "That's the core PageRank idea: rank comes from rank.",
    ),
  ]);
  B.add("a1-pagerank", [
    M(
      "Page P links to 3 pages. What's in P's column of the link matrix H?",
      [
        "1 in each of the 3 rows it links to",
        "1/3 in those 3 rows, 0 elsewhere",
        "3 in each of the 3 rows",
        "1/3 in every row of the column",
      ],
      1,
      "Columns are sources; P's rank splits three ways.",
    ),
    M(
      "Why is every entry of the Google matrix G strictly positive?",
      [
        "Because links always have positive weight",
        "The teleport term adds (1 − d)/N to every entry",
        "Because of floating-point rounding",
        "Because dangling pages are removed",
      ],
      1,
      "That tiny floor is what guarantees convergence.",
    ),
    M(
      "N = 4 pages, d = 0.8. What does teleportation add to every entry of G?",
      ["0.2", "0.05", "0.8", "0.25"],
      1,
      "(1 − d)/N = 0.2/4 = 0.05.",
    ),
    M(
      "What do the entries of the PageRank vector add up to?",
      ["0", "1", "N", "It varies"],
      1,
      "It's a probability distribution over pages.",
    ),
    M(
      "The web has billions of pages but each links to only a few. Per iteration, the work grows with…",
      ["N² (every pair of pages)", "the number of links", "N³", "a constant"],
      1,
      "Sparse multiplication only touches existing links, plus a cheap teleport term.",
    ),
  ]);

  /* ---------- Phase 2 ---------- */
  B.add("a2-dijkstra", [
    {
      type: "pick",
      q: "Dijkstra from S. <b>Click every node whose tentative distance gets lowered after it was first set.</b>",
      fig: Qf.graph(GD, ED, { pick: "nodes", w: 510, h: 260 }),
      a: ["B", "C"],
      why: "B starts at 5 (from S), then drops to 3 via A. C starts at 8 (via A), then drops to 5 via B. A and T are set once.",
    },
    M(
      "Using the map shown, what is the shortest distance from S to T?",
      ["5", "6", "8", "9"],
      1,
      "S→A→B→C→T = 2 + 1 + 2 + 1 = 6.",
      { fig: Qf.graph(GD, ED, { w: 510, h: 260 }) },
    ),
    M(
      "Every edge has weight 1. Dijkstra then behaves like…",
      ["Depth-first search", "Breadth-first search", "Random search", "Prim's algorithm"],
      1,
      "It settles nodes in order of hop count, exactly like BFS.",
    ),
    M(
      "Why can one negative edge break Dijkstra?",
      [
        "Negative numbers can't be stored in the queue",
        "A settled node could later be reached more cheaply",
        "It turns the graph into a directed graph",
        "It always creates an infinite loop",
      ],
      1,
      'The "settled means final" rule assumes paths never get cheaper.',
    ),
    M(
      "With a binary heap, Dijkstra's running time is about…",
      ["O(V) (one step per node)", "O((V + E) log V)", "O(V³) (every triple)", "O(2^V) (every subset)"],
      1,
      "Each node is popped once and each edge can trigger a heap update.",
    ),
  ]);
  B.add("a2-astar", [
    M(
      "A* frontier: node X has g = 4, h = 3; node Y has g = 2, h = 6. Which is expanded first?",
      ["X (f = 7)", "Y (f = 8)", "Y, because g is smaller", "Either"],
      0,
      "A* expands the lowest f = g + h.",
    ),
    M(
      "With h = 0 everywhere, A* becomes…",
      ["Breadth-first search", "Dijkstra", "Greedy best-first", "Random"],
      1,
      "f = g, which is exactly Dijkstra's ordering.",
    ),
    M(
      "Your heuristic sometimes overestimates. What can happen?",
      [
        "Nothing: it still finds the shortest path",
        "A* may return a path that isn't the shortest",
        "A* never terminates",
        "A* explores every node",
      ],
      1,
      "Admissibility is what guarantees optimality.",
    ),
    {
      type: "cat",
      q: "4-direction grid (no diagonal moves), each step costs 1. Admissible?",
      buckets: ["Admissible", "Not admissible"],
      items: [
        ["Manhattan distance", 0],
        ["Straight-line distance", 0],
        ["2 × Manhattan distance", 1],
        ["h = 0", 0],
      ],
      why: "Manhattan is the exact cost with no walls, so it never overestimates; straight-line is even smaller. Doubling it overestimates.",
    },
    M(
      "Why does A* usually explore fewer nodes than Dijkstra?",
      [
        "It uses less memory for each node it stores",
        "The heuristic steers it towards the goal",
        "It skips some of the edges",
        "It stops early without checking",
      ],
      1,
      "Dijkstra grows in circles; A* grows towards the target.",
    ),
  ]);
  B.add("a2-routing", [
    {
      type: "cat",
      q: "Link-state or distance-vector?",
      buckets: ["Link-state", "Distance-vector"],
      items: [
        ["Every router holds the full network map", 0],
        ["Routers share distance tables only with neighbours", 1],
        ["Each router runs Dijkstra locally", 0],
        ["Vulnerable to count-to-infinity", 1],
      ],
      why: "Link-state floods the map and computes locally. Distance-vector gossips estimates hop by hop.",
    },
    M(
      'Router A reaches C at cost 6 via D. Neighbour B (1 hop away) now advertises "C is 3 from me". What does A do?',
      ["Keep 6 via D", "Switch to 4 via B", "Switch to 3 via B", "Drop C"],
      1,
      "Via B costs 1 + 3 = 4, which beats 6.",
    ),
    M(
      "What does poisoned reverse do?",
      [
        "Encrypts routes so that neighbours can't read or forge them",
        'Tells a neighbour "my route to X via you is infinite"',
        "Clears the routing table after a failure",
        "Doubles every cost to slow the loop",
      ],
      1,
      "It kills the two-node loop behind count-to-infinity.",
    ),
    M(
      "RIP treats 16 as infinity. What does that imply?",
      [
        "Networks can have at most 16 routers",
        "No usable path can be longer than 15 hops",
        "Costs are in seconds",
        "Loops are impossible",
      ],
      1,
      "A small infinity makes counting up quick, but limits network diameter.",
    ),
    M(
      "Why is internet routing hierarchical?",
      [
        "To encrypt traffic as it passes between regions",
        "So routers needn't know a route to every machine",
        "Because Dijkstra only works on trees",
        "To keep traffic inside one country",
      ],
      1,
      "Aggregation keeps routing tables and updates manageable.",
    ),
  ]);

  /* ---------- Phase 3 ---------- */
  B.add("a3-lp", [
    M(
      "Maximise 3x + y with x ≤ 4, x + y ≤ 6, x, y ≥ 0. The corners are (0,0), (4,0), (4,2), (0,6). Which is optimal?",
      ["(4,0), z = 12", "(4,2), z = 14", "(0,6), z = 6", "(0,0), z = 0"],
      1,
      "3·4 + 2 = 14 is the largest corner value.",
    ),
    M(
      "Why is an LP optimum always at a corner of the feasible region?",
      ["Corners are easy to draw", "The objective is linear", "Corners are always integers", "It isn't"],
      1,
      "A linear function has no interior peaks.",
    ),
    {
      type: "cat",
      q: "Can this constraint appear in a linear program?",
      buckets: ["Linear", "Not linear"],
      items: [
        ["3x + 2y ≤ 12", 0],
        ["x · y ≤ 5", 1],
        ["x² + y ≤ 4", 1],
        ["x − y ≥ 1", 0],
      ],
      why: "Linear means variables only multiplied by constants and added.",
    },
    M(
      "The constraints contradict each other, so no point satisfies all of them. What does the solver report?",
      ["Unbounded", "Infeasible", "Optimal at (0,0)", "Degenerate"],
      1,
      "Empty feasible region = infeasible.",
    ),
    M(
      "You add one more constraint to a maximisation LP. The optimum can…",
      [
        "only get better",
        "stay the same or get worse",
        "only get better or stay the same",
        "become negative infinity always",
      ],
      1,
      "Extra constraints shrink the region, so the best available can't improve.",
    ),
  ]);
  Object.assign(partScope, { M, TF });
})();

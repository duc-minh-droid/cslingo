/* Revision bank content for one course, merged from the earlier part files (loaded on demand by js/bank.js, never on startup). Append new questions at the end with NIC.bank.add(...). */
/* ===== bank-algo.js ===== */
/* Algorithms revision bank — new graphs, numbers and scenarios per session, no calculator needed. Numbers verified with node. */
(function () {
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
  B.add("a3-simplex", [
    M(
      "Each simplex pivot moves…",
      [
        "to a random point somewhere inside the region",
        "along an edge to a neighbouring, better corner",
        "to the centre of the region",
        "to every corner in turn",
      ],
      1,
      "Corner to adjacent corner, uphill each time.",
    ),
    M(
      "Why does the ratio test pick the <b>smallest</b> ratio?",
      [
        "It's faster to compute",
        "To stop at the first constraint you hit",
        "To gain the most profit in one step",
        "It's an arbitrary convention",
      ],
      1,
      "Going further would cross a constraint.",
    ),
    M(
      "When does simplex stop?",
      [
        "After exactly n pivots, one per variable",
        "When no neighbouring corner improves the objective",
        "When it reaches the origin",
        "When all variables are equal",
      ],
      1,
      "Local optimality at a corner is global optimality for an LP.",
    ),
    M(
      "How does simplex usually perform in practice?",
      [
        "Always exponential in the number of variables",
        "Usually fast, though bad worst cases exist",
        "Always exactly one pivot",
        "Slower than checking every corner",
      ],
      1,
      "Contrived examples can make it exponential, but real problems rarely do.",
    ),
    TF(
      "Simplex evaluates every corner of the feasible region.",
      false,
      "It only visits a path of improving corners, usually a tiny fraction.",
    ),
  ]);
  B.add("a3-bracket", [
    M(
      "By what factor does golden-section search shrink the bracket each step?",
      ["0.5", "about 0.618", "0.9", "0.1"],
      1,
      "Each step keeps about 61.8% of the interval.",
      { hint: "It keeps the larger part of a golden split: a bit more than half." },
    ),
    M(
      "What must be true about the function inside the bracket?",
      ["It's linear", "It's unimodal", "It's differentiable", "It's positive"],
      1,
      "With two dips, discarding a side can throw away the true minimum.",
    ),
    M(
      "Starting width 1, about how wide is the bracket after 10 steps?",
      ["about 0.5", "about 0.1", "about 0.008", "about 0.0001"],
      2,
      "0.618¹⁰ ≈ 0.008, roughly 1/120.",
      { hint: "0.618⁵ ≈ 0.09. Square it." },
    ),
    M(
      "Minimising on [0, 10] with probes at 3.82 and 6.18: f(3.82) = 5, f(6.18) = 2. The new bracket is…",
      ["[0, 6.18]", "[3.82, 10]", "[3.82, 6.18]", "[0, 3.82]"],
      1,
      "The lower value is at 6.18, so the minimum can't be left of 3.82.",
    ),
    M(
      "What's special about the golden ratio here?",
      [
        "It keeps the two probes evenly spaced every step",
        "One of the two probes can be reused next step",
        "It guarantees an exact answer",
        "It removes the need for unimodality",
      ],
      1,
      "Re-using a point halves the evaluations per step.",
    ),
  ]);
  B.add("a3-nm", [
    {
      type: "match",
      q: "Match each Nelder–Mead move to what it does.",
      pairs: [
        ["Reflect", "Flip the worst corner through the others' midpoint"],
        ["Expand", "Go even further in a direction that paid off"],
        ["Contract", "Pull the worst corner partway back in"],
        ["Shrink", "Pull every corner towards the best one"],
      ],
      why: "Reflect first, stretch if it worked, pull back if it overshot, shrink as the last resort.",
    },
    M(
      "How many corners does Nelder–Mead's simplex have in 5 dimensions?",
      ["5", "6", "10", "2"],
      1,
      "n + 1 points: a triangle in 2D, a tetrahedron in 3D.",
    ),
    M(
      "What does Nelder–Mead need from the function?",
      [
        "Its gradient at each point",
        "Only function values to compare",
        "Its second derivative",
        "A linear formula for it",
      ],
      1,
      "It works purely by comparing values, so it suits black-box simulations.",
    ),
    M(
      "A limitation of Nelder–Mead?",
      [
        "It can't handle problems with two or more dimensions",
        "It can stall, with no optimality guarantee",
        "It needs the points in sorted order",
        "It only works along a line",
      ],
      1,
      "It's a heuristic local method.",
    ),
    M(
      "The reflected point is better than every current corner. What does Nelder–Mead try next?",
      [
        "Shrink the whole simplex",
        "Expand further in that direction",
        "Contract towards the centre",
        "Stop, since it's optimal",
      ],
      1,
      "A good direction is worth pushing.",
    ),
  ]);

  /* ---------- Phase 4 ---------- */
  B.add("a4-cut", [
    M(
      "A cut is crossed by edges of weight 7, 3 and 9. Which must some MST use?",
      ["7", "3", "9", "All of them"],
      1,
      "The lightest crossing edge is always safe.",
    ),
    M(
      "A cycle has edges 4, 6 and 11 (all distinct). Which one can no MST contain?",
      ["4", "6", "11", "Any of them"],
      2,
      "The heaviest edge on a cycle is never needed.",
    ),
    TF(
      "The heaviest edge in the whole graph can never be in an MST.",
      false,
      "If it's the only link to some node (a bridge), every spanning tree must use it.",
    ),
    M(
      "Node Z has exactly one edge. What's true?",
      [
        "That edge is never in the MST, since Z is a dead end",
        "That edge is in every spanning tree, so every MST",
        "Z is left out of the MST",
        "It depends on the edge weights",
      ],
      1,
      "It's the only way to reach Z.",
    ),
    M(
      "Why is the cut property enough to prove Prim correct?",
      [
        "It isn't: Prim needs a completely separate proof",
        "Each Prim step adds the lightest edge across a cut",
        "Prim checks every possible tree",
        "Prim sorts all the edges first",
      ],
      1,
      "Every greedy choice is a safe edge.",
    ),
  ]);
  B.add("a4-mst", [
    M(
      "Edges A–B 1, B–C 4, A–C 3, C–D 2, B–D 5. What's the MST weight?",
      ["6", "7", "8", "10"],
      0,
      "Kruskal takes A–B 1, C–D 2, A–C 3; the rest close loops. Total 6.",
    ),
    M(
      "What does union-find do inside Kruskal?",
      [
        "Sorts the edges by weight before the main loop",
        'Answers "already connected?" quickly',
        "Finds shortest paths between nodes",
        "Chooses the node to start from",
      ],
      1,
      "It's the cycle check.",
    ),
    M(
      "Which usually suits a very dense graph better?",
      ["Kruskal", "Prim", "Neither can handle it", "Dijkstra"],
      1,
      "Kruskal must sort all ~n² edges; Prim grows from nodes.",
    ),
    M(
      "All edges have weight 1. How many different MSTs can there be?",
      ["Exactly one", "Possibly many", "None", "Two"],
      1,
      "Ties allow multiple minimum trees.",
    ),
    {
      type: "order",
      q: "Order Kruskal's steps.",
      items: [
        "Sort all edges by weight",
        "Take the next cheapest edge",
        "Keep it if its ends are in different components; otherwise skip",
        "Stop once n − 1 edges are kept",
      ],
      why: "Sort, scan, skip loop-makers, stop at n − 1.",
    },
  ]);

  /* ---------- Phase 5 ---------- */
  B.add("a5-orient", [
    {
      type: "cat",
      q: "Which way does each path turn?",
      buckets: ["Left", "Right", "Straight"],
      items: [
        ["(0,0) → (1,0) → (1,1)", 0],
        ["(0,0) → (1,0) → (2,−1)", 1],
        ["(0,0) → (1,1) → (3,3)", 2],
      ],
      why: "Cross products: 1 (left), −1 (right), 0 (collinear).",
    },
    M(
      "Cross product (a − p) × (b − p) for p = (0,0), a = (2,1), b = (1,3)?",
      ["−5, right", "5, left", "0, straight", "7, left"],
      1,
      "2·3 − 1·1 = 5, positive, so a left turn.",
    ),
    M(
      "Why use the cross product instead of measuring angles?",
      ["It's the only option", "No trigonometry", "Angles are illegal", "It's slower but prettier"],
      1,
      "Exact integer arithmetic avoids rounding problems.",
    ),
    M(
      "Walking around a convex polygon counter-clockwise, every turn is…",
      ["right", "left", "straight", "alternating"],
      1,
      "Convexity means turning the same way throughout.",
    ),
    M(
      "Three points are collinear. What must hull code decide?",
      [
        "Nothing: collinear points never happen in real data",
        "Whether to keep the middle point, consistently",
        "To stop and report an error",
        "To re-sort all the points",
      ],
      1,
      "Collinear points are the classic edge case.",
    ),
  ]);
  B.add("a5-wrap", [
    M(
      "Why start gift wrapping at the leftmost point?",
      [
        "It has the smallest label",
        "Nothing lies further left",
        "Any point would work equally well",
        "It's closest to the centre",
      ],
      1,
      "Any extreme point would do.",
    ),
    M(
      "100 points, 6 on the hull. About how many point checks does gift wrapping make?",
      ["about 100", "about 600", "about 10,000", "about 6"],
      1,
      "n · h = 100 × 6.",
    ),
    M(
      "Gift wrapping is slowest when…",
      [
        "all the points lie inside a small triangle",
        "every point is on the hull: O(n²)",
        "there are only three points",
        "the points arrive already sorted by angle",
      ],
      1,
      "One sweep per hull point, and every point is a hull point.",
    ),
    M(
      "When does gift wrapping stop?",
      [
        "After n steps",
        "When it returns to the starting point",
        "When it hits the rightmost point",
        "When the stack is empty",
      ],
      1,
      "The wrap closes the loop.",
    ),
    TF(
      "Gift wrapping must sort the points first.",
      false,
      "It only uses turn tests; Graham scan is the one that sorts.",
    ),
  ]);
  B.add("a5-graham", [
    M(
      "Graham scan's anchor is…",
      [
        "a randomly chosen point",
        "the lowest point (leftmost if tied)",
        "the centre of mass of all points",
        "the last point in the list",
      ],
      1,
      "It's guaranteed to be on the hull.",
    ),
    M(
      "Why is the scan part O(n)?",
      [
        "It skips most of the points after sorting them",
        "Each point is pushed once, popped at most once",
        "It uses a heap to find points",
        "It doesn't loop over the points",
      ],
      1,
      "Total stack operations are at most 2n.",
    ),
    M(
      "Stack is [P₀, A, B]. Next point C. A → B → C is a right turn. What happens?",
      [
        "Push C on top of B and move on to the next point",
        "Pop B, then re-check with the new top",
        "Pop A from the middle of the stack",
        "Stop: the hull is complete",
      ],
      1,
      "A right turn means B dents the hull.",
    ),
    M(
      "Graham scan's total cost is O(n log n) because of…",
      ["the stack", "the angle sort", "the turn tests", "the anchor search"],
      1,
      "Sorting dominates.",
    ),
    M(
      "1,000 points all lying on a circle. Which is faster?",
      ["Gift wrapping", "Graham scan", "Equal", "Neither works"],
      1,
      "h = n makes wrapping O(n²); Graham stays O(n log n).",
    ),
  ]);

  /* ---------- Phase 6 ---------- */
  B.add("a6-crc", [
    {
      type: "multi",
      q: "One even-parity bit. Which errors are detected? Select all.",
      o: ["1 flipped bit", "2 flipped bits", "3 flipped bits", "5 flipped bits", "6 flipped bits"],
      a: [0, 2, 3],
      why: "Odd numbers of flips change the parity; even numbers cancel.",
    },
    M(
      "Even parity on data 1100101. What's the parity bit?",
      ["0", "1"],
      0,
      "Four 1s is already even, so the parity bit is 0.",
    ),
    M(
      "A CRC generator has degree 3 (4 bits, e.g. 1011). How many zeros are appended, and how long is the remainder?",
      ["3 zeros, 3-bit remainder", "4 zeros, 4-bit remainder", "1 zero, 1-bit remainder", "none"],
      0,
      "Degree k means k zeros and a k-bit remainder.",
    ),
    M(
      "Message 1101, generator 101. Append two zeros and divide by XOR. The remainder is…",
      ["00", "01", "10", "11"],
      2,
      "110100 ÷ 101 leaves 10, so the frame sent is 110110.",
      { hint: "110 ⊕ 101 = 011, then bring down the next bit and keep going." },
    ),
    M(
      "The receiver divides a frame and gets a non-zero remainder. What does that mean?",
      [
        "The frame is clean",
        "Something was corrupted in transit",
        "The generator polynomial is wrong",
        "The sender should resend the generator",
      ],
      1,
      "A clean frame divides exactly.",
    ),
  ]);
  B.add("a6-hamming", [
    M("Hamming(7,4) syndrome p4 p2 p1 = 101. Which position is wrong?", ["2", "3", "5", "6"], 2, "101 in binary is 5."),
    M(
      "Where do the parity bits sit in Hamming(15,11)?",
      ["1, 2, 3, 4", "1, 2, 4, 8", "12–15", "odd positions"],
      1,
      "Powers of two.",
    ),
    M(
      "Which positions does p2 check in Hamming(7,4)?",
      ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "2, 4, 6"],
      1,
      "Every position whose binary has the middle bit set.",
    ),
    M(
      "Data 0001 encodes to 1101001. Bit 2 flips, giving 1001001. What syndrome does the receiver compute?",
      ["000", "010", "110", "001"],
      1,
      "Only p2's group is disturbed, so the syndrome is 010 = position 2.",
    ),
    M(
      "What's SECDED's extra bit for?",
      [
        "Making decoding faster by skipping the syndrome",
        "An overall parity bit that detects double errors",
        "Encrypting the codeword",
        "Compressing the data bits",
      ],
      1,
      "Single-error correcting, double-error detecting.",
    ),
  ]);

  /* ---------- Phase 7 ---------- */
  B.add("a7-entropy", [
    M("A fair 8-sided die. Entropy?", ["1 bit", "2 bits", "3 bits", "8 bits"], 2, "log₂ 8 = 3."),
    M(
      "An event has probability 1/4. How surprising is it?",
      ["1 bit", "2 bits", "4 bits", "0.25 bits"],
      1,
      "−log₂(1/4) = 2.",
    ),
    M(
      "A source always sends the same symbol. Its entropy?",
      ["0 bits", "1 bit", "infinite", "depends on the symbol"],
      0,
      "No surprise, no information.",
    ),
    {
      type: "order",
      q: "Order these sources from lowest entropy to highest.",
      items: ["A coin that always lands heads", "A fair coin", "A fair 4-sided die", "A fair 8-sided die"],
      why: "0, 1, 2 and 3 bits.",
    },
    M(
      "What does entropy tell you about compression?",
      [
        "Nothing useful: it only measures randomness, not size",
        "No lossless code beats it on average",
        "Compression always halves the size",
        "It's the maximum possible file size",
      ],
      1,
      "It's the floor you can approach but not beat.",
    ),
  ]);
  B.add("a7-huffman", [
    M(
      "Which code is prefix-free?",
      ["{0, 01, 11}", "{0, 10, 110, 111}", "{1, 10, 11}", "{00, 0, 1}"],
      1,
      "No codeword starts another. In {0, 01, 11}, 0 is a prefix of 01.",
    ),
    M(
      "With A = 0, B = 10, C = 110, D = 111, what does <code>1100</code> decode to?",
      ["CA", "BB", "DA", "AC"],
      0,
      "110 | 0 = C, A.",
    ),
    M(
      "Huffman for probabilities 0.5, 0.25, 0.25. Average code length?",
      ["1 bit", "1.5 bits", "2 bits", "1.25 bits"],
      1,
      "Lengths 1, 2, 2: 0.5 + 0.5 + 0.5 = 1.5 (which equals the entropy here).",
    ),
    M(
      "Why must the Huffman code table be sent with the data?",
      [
        "So the data is encrypted and can't be read",
        "The receiver must know which codeword is which",
        "So errors can be detected",
        "It needn't be: the receiver can work it out",
      ],
      1,
      "It's built from the sender's frequencies.",
    ),
    M(
      "Huffman on four equally likely symbols gives…",
      ["1 bit each", "2 bits each", "3 bits each", "variable lengths"],
      1,
      "Uniform frequencies leave no skew to exploit.",
    ),
  ]);
  B.add("a7-lzw", [
    M(
      "LZW encodes <code>AAAA</code> with the dictionary A = 0. What's the output?",
      ["0, 0, 0, 0", "0, 1, 0", "0, 1", "1, 1"],
      1,
      "A → 0 (add AA = 1), AA → 1 (add AAA = 2), A → 0.",
    ),
    M(
      "Why doesn't LZW send its dictionary?",
      [
        "It's too big to send alongside the compressed data",
        "The decoder rebuilds it from the codes it receives",
        "It's encrypted and can't be sent",
        "The dictionary is fixed forever",
      ],
      1,
      "Both sides grow identical tables from the same data.",
    ),
    M(
      "The decoder receives a code it hasn't built yet. What rule rebuilds it?",
      [
        "Skip the code and carry on with the next one",
        "Previous output + its own first character",
        "Ask the encoder to resend it",
        "Treat it as code 0",
      ],
      1,
      "It must be the entry the encoder just created.",
    ),
    M(
      "Which data does LZW compress best?",
      ["Random bytes", "Text with lots of repeated phrases", "Files that are already zipped", "Encrypted data"],
      1,
      "It exploits repeated sequences.",
    ),
    TF("LZW needs the symbol frequencies before it starts.", false, "That's Huffman. LZW learns as it goes."),
  ]);

  /* ---------- Phase 8 ---------- */
  B.add("a8-hash", [
    {
      type: "multi",
      q: "Which properties should a cryptographic hash have? Select all.",
      o: [
        "Same input always gives the same digest",
        "A tiny change to the input changes the digest completely",
        "You can recover the input from the digest",
        "Fixed-length output",
      ],
      a: [0, 1, 3],
      why: "Deterministic, avalanche, fixed-length and one-way. Reversibility would defeat its purpose.",
    },
    M(
      "Proof of work needs 3 leading hex zeros. About how many tries on average?",
      ["48", "about 4,000", "about 1 million", "3"],
      1,
      "16³ = 4,096.",
    ),
    M(
      "Why does editing an old block break every later block?",
      [
        "Every block is encrypted with the same key",
        "Each block stores the previous block's hash",
        "All blocks share one timestamp",
        "Blocks are numbered consecutively",
      ],
      1,
      "The chain of hashes links them.",
    ),
    M(
      "Mining vs checking a proof of work:",
      [
        "both take many tries",
        "mining takes many tries",
        "both take a single hash",
        "checking takes longer than mining",
      ],
      1,
      "That asymmetry is the whole point.",
    ),
    TF("Hashing a password encrypts it.", false, "Encryption can be reversed with a key; a hash is one-way."),
  ]);
  B.add("a8-keys", [
    M(
      "Diffie–Hellman: p = 11, g = 2, Alice's secret a = 3, Bob's secret b = 4. What shared secret do they get?",
      ["3", "4", "5", "8"],
      1,
      "A = 2³ mod 11 = 8, B = 2⁴ mod 11 = 5. Alice: 5³ = 125 mod 11 = 4. Bob: 8⁴ mod 11 = 4.",
      { hint: "125 = 11 × 11 + 4." },
    ),
    M(
      "How do real protocols stop a man-in-the-middle during Diffie–Hellman?",
      [
        "Using bigger primes on their own, so logs are harder",
        "Authenticating it, e.g. with signed certificates",
        "Sending the shared secret twice",
        "Adding a CRC to each message",
      ],
      1,
      "DH agrees a key but doesn't prove who you're talking to.",
    ),
    M(
      "Toy RSA with p = 5, q = 7, so n = 35 and φ = 24. Take e = 5. What's d?",
      ["5", "7", "11", "29"],
      0,
      "5 × 5 = 25 = 24 + 1, so d = 5 (it happens to equal e here).",
    ),
    M(
      "In RSA, who uses which key to send you a secret?",
      [
        "They use your private key",
        "They encrypt with your public key",
        "Both use the public key to decrypt",
        "No keys are needed",
      ],
      1,
      "Public locks, private unlocks.",
    ),
    M(
      'Why is raw ("textbook") RSA risky?',
      ["It's slow", "It's deterministic", "It uses primes", "It can't encrypt numbers"],
      1,
      "Real RSA adds random padding (OAEP).",
    ),
  ]);

  /* ---------- Phase 9 ---------- */
  B.add("a9-dft", [
    M(
      "DFT of the constant signal [3, 3, 3, 3]: where is the energy?",
      ["Spread evenly", "All in bin k = 0", "All in bin k = 2", "Nowhere"],
      1,
      "A constant is pure DC.",
    ),
    M(
      "A 90 Hz tone is sampled at 100 Hz. Where does it appear?",
      ["90 Hz", "10 Hz", "50 Hz", "190 Hz"],
      1,
      "It folds down: 100 − 90 = 10 Hz.",
    ),
    M(
      "8,000 Hz sample rate, 800-sample window. Bin spacing?",
      ["1 Hz", "10 Hz", "100 Hz", "0.1 Hz"],
      1,
      "fs / N = 8000 / 800 = 10 Hz.",
    ),
    M(
      "Energy smears into neighbouring bins. What's the usual cause?",
      [
        "Sampling too slowly, so frequencies fold over (aliasing)",
        "A non-whole number of cycles in the window",
        "Taking too many samples",
        "A negative frequency in the signal",
      ],
      1,
      "Mismatched window edges spread the energy.",
    ),
    M(
      "You record twice as long at the same sample rate. The bin spacing…",
      ["doubles", "halves", "stays the same", "goes to zero"],
      1,
      "Spacing = fs / N, and N doubled.",
    ),
  ]);
  B.add("a9-fft", [
    M("How many levels of butterflies does an 8-point FFT have?", ["2", "3", "8", "4"], 1, "log₂ 8 = 3."),
    M(
      "In an 8-point FFT's bit-reversed order, which index lands in position 1?",
      ["1", "2", "4", "7"],
      2,
      "1 = 001 reversed is 100 = 4.",
    ),
    M("How many butterflies per level for N = 16?", ["4", "8", "16", "32"], 1, "N/2 pairs per level."),
    M(
      "Your signal has 1,000 samples. How does a radix-2 FFT handle it?",
      ["It can't", "Zero-pad to 1,024", "Drop to 512 samples", "Use N = 1,000 directly"],
      1,
      "Pad up to the next power of two.",
    ),
    TF("The FFT gives exactly the same result as the direct DFT, apart from rounding.", true, "Same sum, regrouped."),
  ]);

  /* ---------- Phase 10 ---------- */
  B.add("a10-attn", [
    M(
      "Softmax of scores [0, 0, 0]. The weights?",
      ["[1, 0, 0]", "[1/3, 1/3, 1/3]", "[0, 0, 0]", "undefined, since all scores are 0"],
      1,
      "Equal scores give equal shares.",
    ),
    M(
      "With a causal mask, the 3rd token in a sentence can attend to how many tokens?",
      ["1", "3", "all of them", "2"],
      1,
      "Itself and the two before it.",
    ),
    M(
      "Why use several attention heads?",
      [
        "To save memory compared with one big attention head",
        "Different heads track different relationships",
        "To avoid having to compute softmax",
        "To sort the words into order",
      ],
      1,
      "Each head has its own query, key and value projections.",
    ),
    M(
      "Why add position information to token embeddings?",
      [
        "To make every vector longer and more expressive",
        "Attention alone ignores word order",
        "To encrypt the tokens",
        "To speed up the softmax",
      ],
      1,
      "Without it, shuffled sentences look the same.",
    ),
    M("Context length triples. Attention's score matrix grows…", ["3×", "6×", "9×", "27×"], 2, "n² scaling: 3² = 9."),
  ]);
})();

/* ===== bank-algo-2.js ===== */
/* Algorithms revision bank, part 2 (revision mode only). New angles per session; no calculator needed. Numbers verified with node. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  /* ---------- Phase 1 ---------- */
  B.add("a1-anatomy", [
    M(
      "What's the difference between an algorithm and a program?",
      ["None", "An algorithm is the method", "Programs are always correct", "Algorithms need computers"],
      1,
      "The same algorithm can be written in many languages.",
    ),
    M(
      "How do you usually prove a loop terminates?",
      [
        "Run it once on a test input and see if it stops",
        "Show a quantity strictly falls towards a bound",
        "Add a timer that stops it after a while",
        "Rewrite it using recursion",
      ],
      1,
      "E.g. the number of unprocessed items shrinks.",
    ),
    M(
      "A good invariant for binary search is…",
      [
        "the list is unsorted at the start of every step",
        "if present, the target lies between lo and hi",
        "lo is always greater than hi",
        "mid is always an even number",
      ],
      1,
      "Each step halves the range while keeping that promise.",
    ),
    TF(
      "A correct algorithm must handle edge cases, not just typical input.",
      true,
      "Empty lists, ties and duplicates are where bugs hide.",
    ),
    M(
      'For "find the maximum", what makes the invariant true before the loop starts?',
      ["best = 0", "best = the first item", "best = −1", "best = the last item"],
      1,
      "Initialisation must satisfy the promise.",
    ),
    {
      type: "bug",
      q: "This should return the sum of a list. Click the faulty line.",
      code: ["def total(xs):", "    s = 1", "    for x in xs:", "        s = s + x", "    return s"],
      a: 1,
      why: "The running sum must start at 0, or every answer is 1 too big (and an empty list returns 1).",
    },
    M(
      "A deterministic algorithm…",
      [
        "gives a different answer on each run, by design",
        "always gives the same output for the same input",
        "never stops running",
        "needs special hardware to run",
      ],
      1,
      "Predictable behaviour.",
    ),
    M(
      '"Deal with the most urgent request" isn\'t an algorithm until you specify…',
      [
        "the colour of the display the requests appear on",
        "exactly how urgency is compared, ties included",
        "the programming language",
        "which server it runs on",
      ],
      1,
      "No room for interpretation.",
    ),
  ]);
  B.add("a1-bigo", [
    M(
      "A loop over n inside a loop over m does how much work?",
      ["O(n + m)", "O(n × m)", "O(n)", "O(log n)"],
      1,
      "Every pair.",
    ),
    M("log₂ 1024 = ?", ["10", "32", "100", "512"], 0, "2¹⁰ = 1024."),
    M(
      "Which operation is O(1)?",
      [
        "Sorting a list of numbers",
        "Reading an array element by index",
        "Searching an unsorted list for a value",
        "Printing every element",
      ],
      1,
      "Constant time regardless of size.",
    ),
    M("n = 1,000. Roughly how many steps is n²?", ["1,000", "10,000", "1,000,000", "1 billion"], 2, "1,000²."),
    TF("O(2n) is the same as O(n).", true, "Constants are dropped."),
    M(
      "<code>i = 1; while i &lt; n: i = i × 2</code> runs about how many times?",
      ["n (once per number)", "n/2 (every other number)", "log₂ n", "n² (every pair)"],
      2,
      "Doubling up to n takes log₂ n steps.",
    ),
    M(
      "Two loops over n, one after the other (not nested), cost…",
      ["O(n²)", "O(n)", "O(2ⁿ)", "O(log n)"],
      1,
      "n + n = 2n = O(n).",
    ),
    {
      type: "order",
      q: "Order from slowest-growing to fastest-growing.",
      items: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      why: "Constant < log < linear < quadratic.",
    },
  ]);
  B.add("a1-surfer", [
    M(
      "The random surfer follows a link with probability…",
      ["1 − d", "d", "1/N", "0.5 always"],
      1,
      "Otherwise (1 − d) they teleport.",
    ),
    M(
      "A page's PageRank equals…",
      [
        "how many links point to it from anywhere on the web",
        "the surfer's long-run share of time spent there",
        "how long the page has existed",
        "how many words it contains",
      ],
      1,
      "Rank as a probability.",
    ),
    M(
      "4 pages. A dangling page with rank 0.4 spreads it evenly. Each page receives…",
      ["0.1", "0.4", "0.2", "0"],
      0,
      "0.4 / 4 = 0.1 (including itself).",
    ),
    TF("With the dangling-page repair, total rank stays constant each step.", true, "Nothing leaks away any more."),
    M(
      'A "rank sink" is…',
      [
        "a page that loads very fast and keeps visitors on it",
        "pages that rank flows into but never leaves",
        "a link that points to a missing page",
        "the site's homepage",
      ],
      1,
      "Teleportation drains it.",
    ),
    M(
      "A page no one links to still gets some rank. Why?",
      [
        "It doesn't: unlinked pages always end up with zero",
        "Teleporting gives every page a small baseline share",
        "Search engines boost new pages",
        "It's a rounding error in the maths",
      ],
      1,
      "(1 − d)/N from teleporting.",
    ),
    M(
      "A page with 100 outgoing links gives each target…",
      ["its whole rank", "1/100 of its rank", "nothing", "100× its rank"],
      1,
      "Split evenly across links.",
    ),
    M(
      "Damping d very close to 1. Consequence?",
      [
        "Faster convergence, since fewer teleports happen",
        "Slower convergence, and traps matter more",
        "Ranks become uniform",
        "Nothing changes",
      ],
      1,
      "Less teleporting to escape traps.",
    ),
  ]);
  B.add("a1-pagerank", [
    M(
      "Power iteration repeatedly computes…",
      ["p = p + 1", "p ← G · p", "p ← p²", "p ← sorted(p)"],
      1,
      "Multiply by the Google matrix until it settles.",
    ),
    M(
      "When do you stop iterating?",
      [
        "After a single step, since G is already known",
        "When p barely changes between iterations",
        "When p becomes all zeros",
        "Never: it runs forever",
      ],
      1,
      "Convergence tolerance.",
    ),
    M("Each column of G sums to…", ["0", "1", "N", "d"], 1, "It's column-stochastic: rank is conserved."),
    TF(
      "PageRank scores depend on what the user searched for.",
      false,
      "They're computed offline from links; the query is combined later.",
    ),
    M(
      "d = 0.85, N = 10. What does teleporting add to every entry of G?",
      ["0.085", "0.015", "0.15", "0.1"],
      1,
      "(1 − 0.85)/10 = 0.015.",
      { hint: "Teleport share per entry = (1 − d) / N = 0.15 / 10." },
    ),
    M(
      "The usual starting vector is…",
      ["all zeros", "uniform: 1/N for every page", "1 for the homepage, 0 elsewhere", "random negative values"],
      1,
      "Any valid start converges to the same answer.",
    ),
    M(
      "A dangling page's column in A is replaced by…",
      ["zeros", "1/N in every row", "1 on the diagonal", "d"],
      1,
      "Complete uncertainty.",
    ),
    M(
      "Mathematically, the PageRank vector is…",
      [
        "the largest single entry of the matrix G",
        "the eigenvector of G with eigenvalue 1",
        "the inverse of G",
        "a random vector",
      ],
      1,
      "G·p = p at the fixed point.",
    ),
  ]);

  /* ---------- Phase 2 ---------- */
  B.add("a2-dijkstra", [
    M(
      "Which data structure makes Dijkstra efficient?",
      [
        "A stack of visited nodes, most recent on top",
        "A min-heap of tentative distances",
        "A hash set of settled nodes only",
        "A linked list of edges",
      ],
      1,
      "Quickly find the closest unsettled node.",
    ),
    M(
      "Initial distances in Dijkstra?",
      [
        "0 for every node",
        "0 for the source, ∞ for everyone else",
        "∞ for every node, including the source",
        "random starting values",
      ],
      1,
      "Nothing is known yet.",
    ),
    M(
      '"Relaxing" an edge (u, v) means…',
      [
        "deleting the edge from the graph once it's used",
        "checking if going via u shortens v's distance",
        "doubling the edge's weight",
        "marking v as settled",
      ],
      1,
      "dist[v] = min(dist[v], dist[u] + w).",
    ),
    TF("Dijkstra finds shortest paths from one source to every reachable node.", true, "Single-source shortest paths."),
    M(
      "Edges: S–A 1, S–B 4, A–B 2, B–T 1, A–T 5. Shortest distance S → T?",
      ["4", "5", "6", "7"],
      0,
      "S → A → B → T = 1 + 2 + 1 = 4.",
    ),
    M(
      "Same graph. Order in which nodes are settled?",
      ["S, B, A, T", "S, A, B, T", "S, A, T, B", "S, T, A, B"],
      1,
      "Distances 0, 1, 3, 4.",
    ),
    M(
      "How do you recover the actual path, not just its length?",
      [
        "Run Dijkstra again backwards from the target node",
        "Store predecessors and walk back from the target",
        "Guess from the final distances",
        "Sort the edges by weight",
      ],
      1,
      "Parent pointers.",
    ),
    M(
      "Only the distance to T is needed. When can Dijkstra stop early?",
      ["Never", "As soon as T is settled", "When T is first seen", "After n steps"],
      1,
      "Settled means final.",
    ),
  ]);
  B.add("a2-astar", [
    {
      type: "match",
      q: "Match each A* term to its meaning.",
      pairs: [
        ["g(n)", "Cost from the start to n so far"],
        ["h(n)", "Estimated cost from n to the goal"],
        ["f(n)", "g(n) + h(n): the priority"],
      ],
      why: "Known + estimated = priority.",
    },
    M(
      "When does A* know it has found the shortest path?",
      [
        "When the goal is first added to the frontier",
        "When the goal is removed from the frontier (expanded)",
        "After n steps have been taken",
        "When h reaches 0",
      ],
      1,
      "Checking at generation can accept a worse path.",
    ),
    TF("A* is always faster than Dijkstra.", false, "With a poor heuristic it can explore just as much."),
    M(
      "On a 4-direction grid with no walls, Manhattan distance from (0,0) to (3,4)?",
      ["5", "7", "12", "25"],
      1,
      "3 + 4 = 7.",
    ),
    M("Straight-line distance from (0,0) to (3,4)?", ["5", "7", "12", "25"], 0, "√(9 + 16) = 5."),
    M(
      "Weighted A* (h multiplied by 2) typically…",
      [
        "finds shorter paths, because the heuristic is stronger",
        "explores fewer nodes but may return a longer path",
        "becomes exactly Dijkstra",
        "fails to terminate",
      ],
      1,
      "Speed for optimality.",
    ),
    M(
      "A* on huge maps can run into trouble with…",
      [
        "running out of CPU instructions on long paths",
        "memory: the frontier can grow very large",
        "negative heuristic values",
        "sorting the edges",
      ],
      1,
      "It keeps many nodes around.",
    ),
    M(
      "An admissible heuristic never…",
      [
        "underestimates the true remaining cost",
        "overestimates the true remaining cost",
        "equals 0",
        "changes during the search",
      ],
      1,
      "Optimism is what guarantees optimality.",
    ),
  ]);
  B.add("a2-routing", [
    M(
      "In link-state routing, routers share…",
      [
        "full routing tables, but only with direct neighbours",
        "descriptions of their own links, flooded to all",
        "nothing at all: each works alone",
        "only their default routes",
      ],
      1,
      "Everyone builds the same map.",
    ),
    M(
      "Distance-vector routing is based on which update?",
      ["Prim's spanning-tree update", "Bellman–Ford", "Kruskal's edge-sorting update", "A* with a distance heuristic"],
      1,
      "Distributed Bellman–Ford.",
    ),
    M(
      "What causes count-to-infinity?",
      [
        "Having too many routers in one network",
        "Stale routes looping between neighbours",
        "Encrypted routing messages",
        "Link-state flooding",
      ],
      1,
      "Each router believes the other still has a path.",
    ),
    TF("Each link-state router computes its routes independently.", true, "Each runs Dijkstra on the shared map."),
    M(
      "Split horizon means…",
      [
        "splitting the network into two separate halves",
        "not advertising a route back to where you learnt it",
        "using two paths for every destination",
        "flooding every update to everyone",
      ],
      1,
      "A milder form of poisoned reverse.",
    ),
    M(
      "Which usually converges faster after a failure?",
      ["Distance-vector", "Link-state", "Same", "Neither ever converges"],
      1,
      "Everyone recomputes from the full map.",
    ),
    M(
      "A distance-vector message contains…",
      [
        "the whole network map, as the sender sees it",
        "the sender's current distance to each destination",
        "the encryption keys for each link",
        "the packets being forwarded",
      ],
      1,
      "A table of estimates.",
    ),
    M(
      "A reaches B at cost 2 (B says X is 5) and C at cost 4 (C says X is 1). A's best route to X?",
      ["7 via B", "5 via C", "1 via C", "6 via B"],
      1,
      "Via B: 2 + 5 = 7. Via C: 4 + 1 = 5.",
    ),
  ]);

  /* ---------- Phase 3 ---------- */
  B.add("a3-lp", [
    {
      type: "match",
      q: "Match each LP part to its role.",
      pairs: [
        ["Decision variables", "What you choose (e.g. how many of each product)"],
        ["Objective", "The linear quantity to maximise or minimise"],
        ["Constraints", "Linear limits the choice must satisfy"],
      ],
      why: "The three ingredients of every LP.",
    },
    M(
      "What shape is an LP's feasible region?",
      [
        "A circle, or an ellipse in general",
        "A convex polygon (a polytope in higher dimensions)",
        "Always a square",
        "Any shape, including ones with dents",
      ],
      1,
      "Intersection of half-planes.",
    ),
    M(
      "Maximise 2x + y with x + y ≤ 5, x, y ≥ 0. Optimum?",
      ["(0,5), z = 5", "(5,0), z = 10", "(2.5,2.5), z = 7.5", "(0,0), z = 0"],
      1,
      "Corners (0,0), (5,0), (0,5) give 0, 10, 5.",
    ),
    TF(
      "An LP's optimum can only ever be strictly inside the feasible region.",
      false,
      "Optima are always found at corners (sometimes a whole edge ties).",
    ),
    M(
      'A "binding" constraint at the optimum…',
      ["is ignored by the solver", "holds with equality", "is violated by the solution", "has no effect on the answer"],
      1,
      "Relaxing it would improve the objective.",
    ),
    M(
      "An LP is unbounded when…",
      [
        "no point satisfies all the constraints at once",
        "the objective can improve forever inside the region",
        "it has only one corner",
        "every constraint is binding",
      ],
      1,
      "Nothing stops it growing.",
    ),
    M(
      "Graphically, you find the optimum by…",
      [
        "guessing a likely corner and checking its neighbours",
        "sliding the objective line to its last contact point",
        "drawing a circle around the region",
        "picking the centre of the region",
      ],
      1,
      "The last point touched is a corner.",
    ),
    M(
      "Two adjacent corners give the same best z. What does that mean?",
      [
        "There's no solution, since the two corners conflict",
        "Every point on the edge between them is optimal",
        "Only one of them is really optimal",
        "The LP is infeasible",
      ],
      1,
      "The objective is parallel to that edge.",
    ),
  ]);
  B.add("a3-simplex", [
    M(
      "Why add slack variables?",
      [
        "To make each pivot faster",
        "To turn ≤ constraints into equations",
        "To remove variables from the problem",
        "To make the problem nonlinear",
      ],
      1,
      "Slack = unused capacity.",
    ),
    M(
      "Dantzig's rule picks the entering variable with…",
      [
        "the smallest coefficient, to take careful steps",
        "the largest positive gain in the objective",
        "a random choice",
        "the first alphabetically",
      ],
      1,
      "Biggest improvement per unit.",
    ),
    M(
      "The leaving variable is chosen by…",
      ["the largest ratio", "the minimum ratio test", "random choice", "the objective coefficient"],
      1,
      "The first constraint to become tight.",
    ),
    M(
      "A pivot…",
      [
        "changes the objective function",
        "swaps one basic variable for another",
        "adds a new constraint",
        "restarts from the origin",
      ],
      1,
      "One step along an edge.",
    ),
    TF(
      "The simplex method moves through the interior of the feasible region.",
      false,
      "It stays on corners and edges.",
    ),
    M(
      "Degeneracy can cause…",
      [
        "infeasibility of the whole problem",
        "a pivot that doesn't improve the objective",
        "an unbounded LP",
        "faster convergence",
      ],
      1,
      "Rare cases where you move without gaining.",
    ),
    M(
      "For maximisation, simplex has reached the optimum when…",
      [
        "all variables are positive and the tableau is full",
        "no variable has a positive gain (reduced cost)",
        "the tableau is empty",
        "z equals 0",
      ],
      1,
      "No edge improves.",
    ),
    M(
      "LPs can have astronomically many corners. Why is simplex still practical?",
      [
        "It checks them all very quickly using clever tricks",
        "It usually visits only a small fraction of them",
        "Corners don't affect the answer",
        "It follows the gradient instead",
      ],
      1,
      "Worst cases are rare in practice.",
    ),
  ]);
  B.add("a3-bracket", [
    M(
      "Three points a < b < c with f(b) lower than both f(a) and f(c) tell you…",
      [
        "nothing about the minimum",
        "a minimum lies between a and c",
        "the function is linear there",
        "b is the global minimum",
      ],
      1,
      "That's a bracket.",
    ),
    M(
      "Golden-section probes sit at roughly which fractions of the interval?",
      ["0.25 and 0.75", "0.382 and 0.618", "0.5 only", "0.1 and 0.9"],
      1,
      "Placed so one probe can be reused next step.",
    ),
    M(
      "About how many golden-section steps shrink a bracket to 1% of its width?",
      ["3", "10", "50", "100"],
      1,
      "0.618¹⁰ ≈ 0.008, just under 1%.",
      { hint: "0.618⁵ ≈ 0.09. Square it." },
    ),
    TF("Golden-section search needs the function's derivative.", false, "It only compares function values."),
    M(
      "Advantage of golden-section over naive two-probe bisection?",
      [
        "It halves the bracket every step",
        "It reuses one old evaluation per step",
        "It finds the global minimum",
        "It uses the gradient at each probe",
      ],
      1,
      "One new evaluation per step instead of two.",
    ),
    M(
      "When does golden-section search stop?",
      [
        "After exactly one step, since the ratio is fixed",
        "When the bracket is narrower than the tolerance",
        "When f reaches 0",
        "Never: it runs forever",
      ],
      1,
      "Width below tolerance.",
    ),
    M(
      "The function has several dips inside the bracket. Risk?",
      [
        "None: it always finds the lowest dip in the bracket",
        "It may home in on a local minimum and miss the best",
        "It crashes on multi-dip functions",
        "It becomes exact",
      ],
      1,
      "Unimodality is the key assumption.",
    ),
    M(
      "Maximising instead of minimising: which side do you keep?",
      [
        "The side with the lower probe value",
        "The side containing the higher probe value",
        "Always the left",
        "Always the right",
      ],
      1,
      "Flip the comparison.",
    ),
  ]);
  B.add("a3-nm", [
    TF(
      'Nelder–Mead\'s "simplex" is the same thing as the LP simplex method.',
      false,
      "Same word, different ideas: here it's a shape of n + 1 points.",
    ),
    M(
      "In 2D, Nelder–Mead starts with…",
      ["a single point", "a triangle of 3 points", "a square of 4 points", "a line of 2 points"],
      1,
      "n + 1 = 3.",
    ),
    M(
      "Reflection puts the new point at…",
      [
        "the best corner of the current simplex",
        "the centroid plus (centroid − worst)",
        "the origin",
        "a random spot nearby",
      ],
      1,
      "Flip the worst through the middle of the others.",
    ),
    TF("Nelder–Mead always finds the global minimum.", false, "It's a local heuristic."),
    M(
      "When does Nelder–Mead shrink the whole simplex?",
      [
        "As its very first move on every single iteration",
        "When reflection and contraction both fail",
        "On every step, after reflecting",
        "Never: shrinking isn't one of its moves",
      ],
      1,
      "Last resort.",
    ),
    M(
      "A typical stopping rule for Nelder–Mead?",
      [
        "After a single reflection step has been taken",
        "When the simplex is tiny or values nearly equal",
        "As soon as it performs an expansion",
        "When the function value becomes negative",
      ],
      1,
      "It has collapsed onto a point.",
    ),
    M(
      "Why does Nelder–Mead handle noisy simulations reasonably well?",
      ["It uses exact derivatives", "It only compares values", "It averages everything", "It doesn't"],
      1,
      "Comparisons are robust.",
    ),
    M(
      "How does Nelder–Mead cope with very many dimensions?",
      [
        "Better and better, since it has more room to move",
        "Poorly: slow and unreliable as dimensions grow",
        "Exactly the same as it does in 2D",
        "It can't start with more than 3 points",
      ],
      1,
      "A known weakness.",
    ),
  ]);

  /* ---------- Phase 4 ---------- */
  B.add("a4-cut", [
    M(
      "A cut in a graph is…",
      [
        "removing a single edge",
        "splitting the nodes into two groups",
        "a shortest path between two nodes",
        "a cycle in the graph",
      ],
      1,
      "Edges crossing the split connect the groups.",
    ),
    M(
      "A crossing edge of a cut…",
      ["has both ends in one group", "has one end in each group", "is always the heaviest", "is never in the MST"],
      1,
      "It bridges the two groups.",
    ),
    M(
      "The cycle property says…",
      [
        "the lightest edge on a cycle is never needed",
        "the heaviest edge on a cycle (if unique) is in no MST",
        "cycles are required",
        "cycles cost nothing",
      ],
      1,
      "Remove it and the rest of the cycle still connects its ends.",
    ),
    TF("If all edge weights are distinct, the MST is unique.", true, "No ties, no alternative trees."),
    M(
      "A cut is crossed by edges of weight 5, 5 and 8. Which is safe?",
      ["Only the 8", "Either 5", "Neither 5", "All three"],
      1,
      "Some MST uses each of the lightest crossing edges.",
    ),
    M(
      "How is the cut property proved?",
      ["By induction on colours", "Exchange argument", "By testing", "It isn't"],
      1,
      "Swap and compare totals.",
    ),
    M(
      "Is the lightest edge in the whole graph in some MST?",
      [
        "No: it might close a cycle",
        "Yes: it's the lightest edge across some cut",
        "Only when the graph is already a tree",
        "Only if its weight is unique",
      ],
      1,
      "Take the cut separating one of its ends.",
    ),
    M("An MST of 6 nodes has how many edges?", ["5", "6", "15", "30"], 0, "n − 1."),
  ]);
  B.add("a4-mst", [
    M(
      "Which data structure speeds up Prim?",
      [
        "A stack of visited nodes, most recent on top",
        "A priority queue of candidate edges or keys",
        "A union-find structure only",
        "A hash map of edges only",
      ],
      1,
      "Find the cheapest crossing edge fast.",
    ),
    M(
      "Kruskal's running time is dominated by…",
      ["the union-find operations", "sorting the m edges", "printing the final tree", "choosing the start node"],
      1,
      "The sort costs most.",
    ),
    M(
      "Edges A–B 2, A–C 2, B–C 1, C–D 3, B–D 4. MST weight?",
      ["5", "6", "7", "8"],
      1,
      "B–C 1 + one of the 2s + C–D 3 = 6.",
    ),
    TF("Kruskal can grow several separate trees before they merge into one.", true, "It works on a forest."),
    M(
      "Prim always maintains…",
      [
        "a forest of separate trees",
        "exactly one connected tree",
        "a sorted list of all edges",
        "a cycle through every node",
      ],
      1,
      "It grows from one start node.",
    ),
    M(
      "A classic MST use?",
      [
        "Encrypting data before sending",
        "Connecting points with the least total cable",
        "Sorting a list of items",
        "Routing packets along shortest paths",
      ],
      1,
      "Cheapest network.",
    ),
    M(
      "Is an MST the same as a shortest-path tree from one node?",
      [
        "Yes: both minimise the distance to every node",
        "No: an MST minimises total weight, not root distance",
        "Only in directed acyclic graphs",
        "Only when every weight is equal",
      ],
      1,
      "Different objectives, often different trees.",
    ),
    M(
      "A graph is disconnected. What do Prim and Kruskal produce?",
      [
        "Both stop with an error",
        "Prim covers only one component",
        "Both still build one full tree",
        "Neither returns anything",
      ],
      1,
      "No edges cross between components.",
    ),
  ]);

  /* ---------- Phase 5 ---------- */
  B.add("a5-orient", [
    M(
      "The orientation of p → a → b is the sign of…",
      [
        "(a − p) · (b − p), the dot product",
        "(a − p) × (b − p), the 2-D cross product",
        "|a − p|, the distance from p to a",
        "a + b, the vector sum",
      ],
      1,
      "The 2-D cross product.",
    ),
    M(
      "With y pointing up, a positive cross product means…",
      [
        "clockwise (a right turn), as on a clock face",
        "counter-clockwise (a left turn)",
        "the three points are collinear",
        "the turn is undefined",
      ],
      1,
      "Maths convention.",
    ),
    M(
      "(0,0) → (4,0) → (4,3): which way does it turn?",
      ["Left", "Right", "Straight"],
      0,
      "(4,0) × (4,3) = 4·3 − 0·4 = 12 > 0.",
    ),
    TF("The orientation test needs square roots.", false, "Only multiplication and subtraction."),
    M(
      "In screen coordinates (y pointing down), what happens to the sign?",
      ["Nothing", "It flips", "It doubles", "It becomes zero"],
      1,
      "Mirroring the y-axis reverses orientation.",
    ),
    M(
      "Hull code finds three collinear points. What must it decide?",
      [
        "Nothing: collinear points can simply be ignored",
        "Whether to keep the middle point, consistently",
        "To stop and report an error",
        "To re-sort all the points",
      ],
      1,
      "Collinear handling is a classic source of bugs.",
    ),
    M(
      "How can turn tests check whether a point is inside a convex polygon?",
      [
        "They can't: you need to measure the angles instead",
        "Inside if it's on the same side of every edge",
        "By counting how many vertices it's near",
        "By measuring its distance to the centre",
      ],
      1,
      "Same turn direction for all edges.",
    ),
    M(
      "|cross product| of (0,0), (4,0), (4,3) relates to the triangle's area how?",
      ["Area = |cross| = 12", "Area = |cross| / 2 = 6", "Area = |cross|² = 144", "There's no relation between them"],
      1,
      "The cross product is twice the triangle's signed area.",
    ),
  ]);
  B.add("a5-wrap", [
    M(
      "At each step, gift wrapping picks the next point that…",
      [
        "is nearest to the current point on the hull",
        "keeps all other points on one side of the edge",
        "is highest above the current point",
        "is chosen at random",
      ],
      1,
      "The most extreme turn.",
    ),
    M(
      "If the hull has h points, how many wrapping steps are there?",
      ["n", "h", "n²", "log n"],
      1,
      "One per hull point.",
    ),
    M("Each wrapping step costs…", ["O(1)", "O(n)", "O(h)", "O(n²)"], 1, "Scan all candidates."),
    TF("Gift wrapping is output-sensitive.", true, "Its cost depends on the hull size h."),
    M(
      "1,000 points, only 3 on the hull. About how many checks?",
      ["3", "about 3,000", "about 1,000,000", "about 10,000"],
      1,
      "n × h = 1,000 × 3.",
    ),
    M(
      "Where does gift wrapping usually start?",
      [
        "A randomly chosen point from the input",
        "An extreme point, like the leftmost",
        "The point nearest the centre of mass",
        "The last point in the list",
      ],
      1,
      "Guaranteed to be on the hull.",
    ),
    M(
      "Two candidate points are collinear with the current point. Which does the usual rule pick?",
      ["The nearer", "The farther", "Either", "Neither"],
      1,
      "Taking the farther point skips points in the middle of an edge.",
    ),
    M(
      "Compared with Graham scan, gift wrapping is better when…",
      ["the hull is large", "the hull is small", "points are sorted", "never"],
      1,
      "n·h beats n log n when h is tiny.",
    ),
  ]);
  B.add("a5-graham", [
    M(
      "After choosing the anchor, Graham scan sorts points by…",
      ["x-coordinate only", "angle around the anchor", "distance from the anchor only", "point name"],
      1,
      "Polar angle order.",
    ),
    M("Graham scan keeps candidate hull points on a…", ["queue", "stack", "heap", "tree"], 1, "Push and pop."),
    M(
      "A point is popped when the top two points plus the new point make…",
      [
        "a left turn (counter-clockwise)",
        "a right turn or a straight line",
        "any turn at all",
        "a closed loop back to the anchor",
      ],
      1,
      "A dent inward.",
    ),
    TF("Graham scan's worst case is O(n²).", false, "It's O(n log n) in every case."),
    M(
      "What does the stack hold when the scan finishes?",
      ["Every point, in sorted order", "Exactly the hull, in order", "Only the interior points", "Nothing: it's empty"],
      1,
      "The output.",
    ),
    M(
      "Why start from the lowest point?",
      [
        "It has the smallest label",
        "It's on the hull, and all the others lie above it",
        "Any point works, so it's just a convention",
        "It's the quickest point to find",
      ],
      1,
      "A safe pivot for the angle sort.",
    ),
    M(
      "Two points have the same angle from the anchor. Common tie-break?",
      ["Pick one at random", "By distance from the anchor", "Alphabetically by name", "Drop both points"],
      1,
      "Distance decides which comes first.",
    ),
    M(
      "Why is the scan itself linear?",
      [
        "It skips most of the points after sorting them",
        "Each point is pushed once, popped at most once",
        "It uses a heap to find points",
        "It stops as soon as the hull closes",
      ],
      1,
      "At most 2n stack operations.",
    ),
  ]);

  /* ---------- Phase 6 ---------- */
  B.add("a6-crc", [
    M(
      "A parity bit catches…",
      [
        "every error, however many bits",
        "any odd number of flipped bits",
        "any even number of flipped bits",
        "only burst errors",
      ],
      1,
      "Even numbers of flips cancel out.",
    ),
    M(
      "CRC works by…",
      [
        "counting the 1 bits in the message and storing the total",
        "polynomial division with XOR (mod 2)",
        "encrypting the message with a key",
        "sorting the bits of the message",
      ],
      1,
      "The remainder is the check value.",
    ),
    M("In mod-2 arithmetic, addition is the same as…", ["AND", "OR", "XOR", "NOT"], 2, "1 + 1 = 0, no carry."),
    TF("A CRC can correct errors on its own.", false, "It detects; correction needs a code like Hamming, or a resend."),
    M(
      "CRCs are especially good at detecting…",
      ["deliberate forgery", "burst errors", "correct data", "nothing"],
      1,
      "Common on real links.",
    ),
    M("Generator 1011 has degree…", ["2", "3", "4", "11"], 1, "4 bits means degree 3."),
    M("1011 XOR 1101 = ?", ["0110", "1001", "1111", "0000"], 0, "Bit by bit: 1⊕1=0, 0⊕1=1, 1⊕0=1, 1⊕1=0."),
    M(
      "Where are CRCs used?",
      [
        "Storing passwords securely so they can't be reversed",
        "Ethernet frames and ZIP files",
        "Generating encryption keys",
        "Sorting large files",
      ],
      1,
      "Everyday error detection.",
    ),
  ]);
  B.add("a6-hamming", [
    M("Hamming(7,4) has how many parity bits?", ["1", "3", "4", "7"], 1, "7 − 4 = 3, at positions 1, 2, 4."),
    M(
      "Syndrome 000 means…",
      ["error at position 0", "no error detected", "two errors", "all bits wrong"],
      1,
      "Every parity check passed.",
    ),
    M("Syndrome 111 points at position…", ["1", "4", "7", "3"], 2, "111 in binary is 7."),
    TF("Hamming(7,4) corrects any single-bit error.", true, "The syndrome names the position."),
    M(
      "p1 checks which positions?",
      ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "1, 2, 4"],
      0,
      "Positions whose binary ends in 1.",
    ),
    M(
      "p4 checks which positions?",
      ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "4 only"],
      2,
      "Positions with the 4s bit set.",
    ),
    M("Hamming(7,4)'s code rate?", ["4/7", "3/7", "7/4", "1/2"], 0, "4 data bits per 7 sent."),
    M(
      "Minimum Hamming distance 3 means the code can…",
      ["correct 3 errors", "correct 1 error (or detect 2)", "correct no errors at all", "detect 3 and correct 2"],
      1,
      "Distance d corrects ⌊(d − 1)/2⌋ errors.",
    ),
  ]);

  /* ---------- Phase 7 ---------- */
  B.add("a7-entropy", [
    M("Entropy of a fair coin?", ["0 bits", "0.5 bits", "1 bit", "2 bits"], 2, "Two equally likely outcomes."),
    M(
      "An event with probability 1/8 carries how much surprise?",
      ["1 bit", "3 bits", "8 bits", "1/8 bit"],
      1,
      "−log₂(1/8) = 3.",
    ),
    M(
      "Maximum entropy for 4 symbols?",
      ["1 bit", "2 bits", "4 bits", "unlimited"],
      1,
      "log₂ 4, when all are equally likely.",
    ),
    TF("Entropy depends on what the symbols are called.", false, "Only the probabilities matter."),
    M(
      "A distribution becomes more skewed. Its entropy…",
      ["rises", "falls", "stays the same", "becomes negative"],
      1,
      "More predictable, less surprise.",
    ),
    M(
      "Why does English text compress well?",
      [
        "Most English texts are short, so there's little to store",
        "Frequencies are uneven, with lots of redundancy",
        "English text is already encrypted",
        "English uses very few vowels",
      ],
      1,
      "Low entropy per character.",
    ),
    M(
      "Probabilities 0.5, 0.25, 0.25. Entropy?",
      ["1 bit", "1.5 bits", "2 bits", "0.75 bits"],
      1,
      "0.5·1 + 0.25·2 + 0.25·2 = 1.5.",
    ),
    M(
      "Entropy gives what about average code length?",
      [
        "An upper limit on the length of the best code",
        "A lower limit no lossless code can beat",
        "The exact length of the best code",
        "Nothing about code length",
      ],
      1,
      "The compression floor.",
    ),
  ]);
  B.add("a7-huffman", [
    M(
      "Huffman's algorithm repeatedly…",
      [
        "splits the largest group in two",
        "merges the two least probable nodes",
        "sorts symbols alphabetically",
        "picks two nodes at random",
      ],
      1,
      "Greedy from the bottom up.",
    ),
    M(
      "Among prefix-free codes that assign each symbol a whole-bit codeword, Huffman is…",
      [
        "random, depending on the tie-breaks",
        "optimal (minimum average length)",
        "the worst possible",
        "valid only sometimes",
      ],
      1,
      "Provably optimal for symbol-by-symbol coding.",
    ),
    M(
      "Prefix-free means…",
      [
        "every codeword starts with a 0 bit",
        "no codeword begins another codeword",
        "all codewords have equal length",
        "codewords are sorted by length",
      ],
      1,
      "So decoding needs no separators.",
    ),
    TF(
      "Huffman codes can use fractional numbers of bits per symbol.",
      false,
      "Every codeword is a whole number of bits.",
    ),
    M(
      "Two symbols, each probability 0.5. Huffman gives…",
      ["0 bits each", "1 bit each", "2 bits each", "a variable length"],
      1,
      "One bit, 0 or 1.",
    ),
    M(
      "Which symbol gets the shortest codeword?",
      ["The rarest", "The most frequent", "The first alphabetically", "A random one"],
      1,
      "Frequent symbols should be cheap.",
    ),
    M(
      "How do you decode a Huffman bit stream?",
      [
        "Look up fixed-size blocks of bits in a table",
        "Walk the tree bit by bit to a leaf, then restart",
        "Reverse the bits and read them backwards",
        "Use a secret key to unlock it",
      ],
      1,
      "Tree walk.",
    ),
    M(
      "Why can't Huffman beat entropy exactly when ideal lengths are fractional?",
      [
        "It can: Huffman always matches entropy",
        "Real codewords must round to whole bits",
        "Huffman uses random codes",
        "Entropy is calculated wrongly",
      ],
      1,
      "Rounding costs a little.",
    ),
  ]);
  B.add("a7-lzw", [
    M(
      "LZW's dictionary starts with…",
      [
        "an empty dictionary that fills as it goes",
        "every single character of the alphabet",
        "a list of common English words",
        "the whole message",
      ],
      1,
      "Longer entries are added as it goes.",
    ),
    M(
      "At each step the encoder outputs the code for…",
      [
        "one character at a time, whatever the dictionary holds",
        "the longest string already in the dictionary",
        "a randomly chosen string",
        "the whole message at once",
      ],
      1,
      "Greedy longest match.",
    ),
    M(
      "After outputting the code for w, the encoder adds what to the dictionary?",
      ["w", "w + the next character", "the next character only", "nothing"],
      1,
      "A slightly longer phrase for next time.",
    ),
    TF("LZW is lossless.", true, "The decoder reproduces the input exactly."),
    M(
      "Which input compresses best with LZW?",
      ["Random characters", "ABABABABABAB", "Encrypted data", "One character"],
      1,
      "Repeats become dictionary hits.",
    ),
    M(
      "What happens when the dictionary fills up?",
      [
        "The file is lost and has to be sent again",
        "Implementations freeze or reset it",
        "The encoder crashes",
        "The input is deleted",
      ],
      1,
      "A practical detail.",
    ),
    M(
      "Which well-known format uses LZW?",
      ["GIF images", "JPEG photos", "MP3 audio", "PNG images"],
      0,
      "GIF (and some older UNIX compress tools).",
    ),
    M(
      "LZW on <code>ABABAB</code> with A = 0, B = 1 outputs how many codes?",
      ["2", "4", "6", "3"],
      1,
      "0, 1, 2 (AB), 2 (AB): four codes for six characters.",
    ),
  ]);

  /* ---------- Phase 8 ---------- */
  B.add("a8-hash", [
    M(
      "A hash collision is…",
      [
        "a program crash inside the hash function",
        "two different inputs with the same digest",
        "a slow hash function",
        "an empty input",
      ],
      1,
      "Good hashes make these practically impossible to find.",
    ),
    M(
      "Preimage resistance means…",
      [
        "hashing is fast to compute on any input",
        "given a digest, you can't find an input for it",
        "outputs are always short",
        "inputs are kept secret",
      ],
      1,
      "One-way.",
    ),
    M(
      "In proof of work, what is the nonce for?",
      [
        "Encrypting the block's contents before it's shared",
        "A number miners vary until the hash hits the target",
        "The block's timestamp",
        "The miner's name",
      ],
      1,
      "Trial and error.",
    ),
    TF("A SHA-256 digest's length depends on the input's length.", false, "Always 256 bits."),
    M(
      "Difficulty goes up by one leading hex zero. Expected work…",
      ["doubles", "×16", "×10", "stays the same"],
      1,
      "Each hex digit has 16 values.",
    ),
    M(
      "What links each block to the one before it?",
      [
        "A timestamp shared with the previous block",
        "It includes the previous block's hash",
        "A digital signature",
        "The block's size",
      ],
      1,
      "Change one block and every later link breaks.",
    ),
    M(
      'A "51% attack" means…',
      [
        "half the blocks are lost when the network splits",
        "someone with most mining power can rewrite history",
        "a bug in the hash function",
        "the encryption fails",
      ],
      1,
      "PoW assumes an honest majority.",
    ),
    M(
      "A hash chain on its own is…",
      ["tamper-proof", "tamper-evident", "encrypted", "private"],
      1,
      "Evidence, not prevention.",
    ),
  ]);
  B.add("a8-keys", [
    M(
      "Diffie–Hellman's security rests on…",
      [
        "the difficulty of factoring large numbers",
        "the difficulty of the discrete logarithm",
        "the difficulty of sorting",
        "the difficulty of hashing",
      ],
      1,
      "Easy to compute gᵃ mod p, hard to undo.",
    ),
    M(
      "RSA's security rests on…",
      [
        "the difficulty of discrete logarithms",
        "the difficulty of factoring n = p × q",
        "the difficulty of hashing",
        "the difficulty of XOR",
      ],
      1,
      "Knowing p and q gives away the private key.",
    ),
    M("An RSA public key consists of…", ["(p, q)", "(n, e)", "(d, φ)", "just d"], 1, "n and the encryption exponent."),
    TF(
      "Diffie–Hellman encrypts messages directly.",
      false,
      "It only agrees a shared key; encryption happens afterwards.",
    ),
    M(
      "Why are p = 23 and g = 5 fine in lessons but useless in practice?",
      [
        "They're even numbers, which are easy to factor",
        "Tiny numbers let anyone try every exponent",
        "They're both prime",
        "They're too large to compute with",
      ],
      1,
      "Real primes are 2048+ bits.",
    ),
    M("For p = 3, q = 5, what's φ(n)?", ["8", "15", "7", "10"], 0, "(3 − 1) × (5 − 1) = 8."),
    M("RSA's e must satisfy…", ["e is even", "gcd(e, φ) = 1", "e > n", "e = d"], 1, "Otherwise no inverse d exists."),
    M(
      "Real systems usually encrypt bulk data with…",
      [
        "RSA on its own, for every byte of the message",
        "a fast symmetric cipher keyed via RSA or DH",
        "no encryption at all",
        "hashes only",
      ],
      1,
      "Hybrid encryption: public-key crypto is slow.",
    ),
  ]);

  /* ---------- Phase 9 ---------- */
  B.add("a9-dft", [
    M(
      "The DFT converts a signal from…",
      [
        "the frequency domain to the time domain",
        "the time domain to the frequency domain",
        "bits to bytes",
        "analogue to digital",
      ],
      1,
      "Which frequencies are present, and how strongly.",
    ),
    M("N samples give how many DFT bins?", ["N/2", "N", "2N", "log N"], 1, "One output per input sample."),
    M(
      "The highest frequency you can represent without aliasing is…",
      ["fs", "fs / 2", "2 fs", "fs / 4"],
      1,
      "The Nyquist frequency.",
    ),
    TF(
      "Aliasing can be removed after the signal has been sampled.",
      false,
      "The information is already lost; filter before sampling.",
    ),
    M("Bin k corresponds to frequency…", ["k Hz", "k · fs / N", "k · N", "fs / k"], 1, "Spacing fs / N."),
    M("fs = 1,000 Hz, N = 1,000 samples. Bin spacing?", ["0.1 Hz", "1 Hz", "10 Hz", "1,000 Hz"], 1, "1,000 / 1,000."),
    M(
      "For a real-valued signal, the magnitude spectrum is…",
      ["random", "symmetric", "all zeros", "only positive at k = 0"],
      1,
      "That's why only bins up to N/2 are usually shown.",
    ),
    M(
      "A window function (e.g. Hann) is used to…",
      [
        "increase aliasing so it can be removed",
        "reduce leakage by tapering the edges",
        "add noise",
        "speed up the FFT",
      ],
      1,
      "Smoother edges, less smearing.",
    ),
  ]);
  B.add("a9-fft", [
    M(
      "The FFT's core idea is to…",
      [
        "approximate the DFT using fewer terms",
        "split into even/odd halves recursively, sharing work",
        "skip every other sample",
        "sort the samples first",
      ],
      1,
      "Divide and conquer.",
    ),
    M("FFT running time?", ["O(N²)", "O(N log N)", "O(N)", "O(2ᴺ)"], 1, "log N levels, N work each."),
    M(
      "N = 1,024. Roughly N log₂ N vs N²?",
      ["10,000 vs 1,000,000", "1,000 vs 10,000", "equal", "1,000,000 vs 10,000"],
      0,
      "1,024 × 10 ≈ 10⁴; 1,024² ≈ 10⁶.",
    ),
    TF("The FFT is an approximation of the DFT.", false, "Same result, computed faster."),
    M(
      'A "butterfly" combines two values a and b into…',
      ["a × b, then W·a", "a + W·b and a − W·b", "a and b swapped", "a − b only"],
      1,
      "One multiply shared by two outputs.",
    ),
    M(
      "What's a twiddle factor?",
      [
        "A bug in the FFT caused by rounding",
        "The complex rotation Wᵏ used in a butterfly",
        "The sample rate",
        "A window function",
      ],
      1,
      "Roots of unity.",
    ),
    M("Radix-2 FFT needs N to be…", ["odd", "a power of 2", "prime", "less than 100"], 1, "So the halving reaches 1."),
    M(
      "Which of these depends on the FFT?",
      [
        "Sorting names into alphabetical order",
        "Audio processing, Wi-Fi and image compression",
        "Hashing passwords for storage",
        "Binary search in a sorted list",
      ],
      1,
      "It's everywhere in signal processing.",
    ),
  ]);

  /* ---------- Phase 10 ---------- */
  B.add("a10-attn", [
    M(
      "In attention, how is the relevance score between two tokens computed?",
      [
        "The distance between their positions in the sentence",
        "One token's query dotted with the other's key",
        "The product of their lengths",
        "A learned random number",
      ],
      1,
      "q · k (then scaled).",
    ),
    M(
      "After softmax, a token's attention weights…",
      ["are all exactly equal", "are positive and sum to 1", "can be negative", "sum to N"],
      1,
      "A share of attention.",
    ),
    M(
      "A token's attention output is…",
      [
        "the key with the highest score",
        "a weighted sum of the value vectors",
        "the query vector itself",
        "the largest raw score",
      ],
      1,
      "A blend, not a single pick.",
    ),
    TF("Attention's cost grows linearly with sequence length.", false, "Every token scores every token: quadratic."),
    M(
      "The causal mask stops each token from attending to…",
      ["itself", "earlier tokens", "later (future) tokens", "all other tokens"],
      2,
      "No peeking ahead when generating.",
    ),
    M(
      '"Self"-attention means…',
      [
        "a token only attends to itself, never to others",
        "Q, K and V all come from one sequence",
        "the model trains itself without data",
        "the model uses a single head only",
      ],
      1,
      "The sequence attends to itself.",
    ),
    M(
      "Scores [3, 1] after softmax give the first token roughly…",
      ["0.5", "0.75", "0.88", "1.0"],
      2,
      "e³ / (e³ + e¹) = 1 / (1 + e⁻²) ≈ 0.88.",
      { hint: "Only the difference (2) matters, and e² ≈ 7.4." },
    ),
    M(
      "An embedding is…",
      [
        "a compression format for storing text",
        "a learned vector representing a token",
        "a mask over future tokens",
        "the output of softmax",
      ],
      1,
      "Tokens become points in a vector space.",
    ),
  ]);
})();

/* ===== bank-v-algo-1.js ===== */
/* ALGO revision bank, visual and varied questions, part 1. Phase 1 (anatomy, big-O, PageRank), Dijkstra, A*, routing, linear programming.
   Every figure carries the data the question needs. Numbers were checked by running the real algorithms. */
(function () {
  const B = NIC.bank,
    Qf = NIC.qfig;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body, pick) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px${pick ? "" : ";display:block"}">${body}</svg>`;
  const codeBox = (lines) =>
    `<div style="font:700 13px var(--mono);background:var(--bg-2);border:2px solid var(--line);border-radius:12px;padding:8px 12px;margin-bottom:8px;white-space:pre;overflow-x:auto">${lines.join("\n")}</div>`;
  const dashed = "stroke-dasharray:5 4";

  /* grid of cells for A* pictures. cells: {"x,y": {fill, stroke, t, t2, pick}} */
  const grid = (W, H, cs, o = {}) => {
    let s = "";
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const k = x + "," + y,
          c = (o.cells && o.cells[k]) || {},
          wall = o.walls && o.walls.has(k);
        const fill = wall ? "var(--text-dim)" : c.fill || "var(--panel)";
        let g = `<rect x="${x * cs + 1}" y="${y * cs + 1}" width="${cs - 2}" height="${cs - 2}" rx="${cs > 30 ? 7 : 3}" fill="${fill}" stroke="${wall ? "var(--text-dim)" : c.stroke || "var(--line)"}" stroke-width="${c.sw || 2}"/>`;
        if (c.t) g += tx(x * cs + cs / 2, y * cs + cs / 2 + (c.t2 ? -2 : 5), c.t, { sz: c.sz || 14, c: c.c });
        if (c.t2) g += tx(x * cs + cs / 2, y * cs + cs / 2 + 14, c.t2, { sz: 11, w: 800, c: "var(--text-dim)" });
        s += c.pick ? `<g data-pick="${c.pick}">${g}</g>` : g;
      }
    return s;
  };
  const wallSet = (list) => new Set(list.map(([x, y]) => x + "," + y));

  /* tiny A* used only to draw the wall-pocket picture, so the expanded cells are the real ones */
  function astar(W, H, walls, S, G, h0) {
    const key = (x, y) => x + "," + y,
      g = { [key(...S)]: 0 },
      open = new Set([key(...S)]),
      closed = [];
    const hf = (x, y) => (h0 ? 0 : Math.abs(x - G[0]) + Math.abs(y - G[1]));
    while (open.size) {
      let best = null,
        bf = 1e9,
        bh = 1e9;
      for (const k of open) {
        const [x, y] = k.split(",").map(Number),
          f = g[k] + hf(x, y),
          h = hf(x, y);
        if (f < bf || (f === bf && h < bh)) {
          bf = f;
          bh = h;
          best = k;
        }
      }
      open.delete(best);
      closed.push(best);
      const [x, y] = best.split(",").map(Number);
      if (x === G[0] && y === G[1]) break;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx,
          ny = y + dy,
          k = key(nx, ny);
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || walls.has(k)) continue;
        if (g[k] === undefined || g[best] + 1 < g[k]) {
          g[k] = g[best] + 1;
          open.add(k);
        }
      }
    }
    return closed;
  }

  /* =====================================================================
     Phase 1: algorithm anatomy
     ===================================================================== */
  const traceRows = [
    ["1", "9", "9", "9"],
    ["2", "2", "9", "9"],
    ["3", "7", "7", "9"],
    ["4", "1", "7", "9"],
  ];
  const traceFig = () => {
    const cx = [56, 150, 280, 420];
    let s = ["i", "xs[i]", "best after the step", "biggest of xs[0..i]"]
      .map((h, k) => tx(cx[k], 18, h, { sz: 12, c: "var(--text-dim)" }))
      .join("");
    traceRows.forEach((r, k) => {
      const y = 30 + k * 38;
      s += `<g data-pick="r${k + 1}"><rect x="8" y="${y}" width="484" height="32" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${r.map((v, j) => tx(cx[j], y + 21, v, { sz: 15, f: "var(--mono)" })).join("")}</g>`;
    });
    return (
      codeBox(["best = xs[0]", "for i in range(1, len(xs)):", "    if xs[i] > xs[i - 1]:", "        best = xs[i]"]) +
      `<div class="faint" style="margin:0 0 6px;font-weight:800">Trace on xs = [4, 9, 2, 7, 1] (xs[0] = 4, so best starts at 4)</div>` +
      svg(500, 190, s, true)
    );
  };

  B.add("a1-anatomy", [
    {
      type: "bug",
      q: "This binary search sometimes never finishes. Click the line that stops the search range from shrinking.",
      code: [
        "def find(xs, t):",
        "    lo, hi = 0, len(xs) - 1",
        "    while lo <= hi:",
        "        mid = (lo + hi) // 2",
        "        if xs[mid] == t:",
        "            return mid",
        "        elif xs[mid] < t:",
        "            lo = mid",
        "        else:",
        "            hi = mid - 1",
        "    return -1",
      ],
      a: 7,
      why: "Termination needs something that strictly shrinks every round. With <code>lo = mid</code>, on xs = [1, 3] and t = 3 we get lo = 0, hi = 1, mid = 0 forever. Since xs[mid] is already ruled out, the line must be <code>lo = mid + 1</code>.",
    },
    {
      type: "cat",
      q: "Assume <code>n</code> is any integer, positive, zero or negative. Which loops are guaranteed to stop?",
      buckets: ["Always stops", "Can run forever"],
      items: [
        ["<code>while n &gt; 0: n = n - 2</code>", 0],
        ["<code>while n != 0: n = n - 2</code>", 1],
        ["<code>while n &gt; 1: n = n // 2</code>", 0],
        ["<code>while n != 1: n = n // 2</code>", 1],
        ["<code>while i &lt; len(xs): total += xs[i]</code> (i never changes)", 1],
        ["<code>for x in xs: total += x</code>", 0],
      ],
      why: "A loop stops when some quantity must run out. <code>n &gt; 0</code> fails once n drops to 0 or below, whatever the start. But <code>n != 0</code> is skipped over by odd n (5, 3, 1, −1 …) and <code>n != 1</code> never fires for n = 0 (0 // 2 is 0) or negative n. A forgotten <code>i += 1</code> means nothing ever changes. A <code>for</code> over a list has a built-in bound.",
    },
    {
      type: "pick",
      q: "The invariant is: <b>best = the biggest of the items checked so far</b>. Click the first row of this trace where the invariant stops being true.",
      fig: traceFig(),
      a: "r3",
      hint: 'In each row, compare the "best after the step" column with the biggest of xs[0..i].',
      why: "In row 3 the loop compares 7 with the <i>previous item</i> (2) instead of with <code>best</code>. 7 &gt; 2, so best drops from 9 to 7 while the biggest item so far is still 9. The comparison must be <code>xs[i] &gt; best</code>.",
    },
    {
      type: "match",
      q: "Match each loop to the promise (invariant) that makes it correct.",
      pairs: [
        [
          "<code>total = 0</code>, then <code>total += x</code> for each x",
          "total = the sum of the items handled so far",
        ],
        [
          "<code>count += 1</code> only when <code>x % 2 == 0</code>",
          "count = how many even items have been handled so far",
        ],
        [
          "Binary search with <code>lo</code> and <code>hi</code>",
          "if the target is present, it lies between lo and hi",
        ],
        ["<code>best = x</code> whenever <code>x &gt; best</code>", "best = the largest item handled so far"],
      ],
      why: "An invariant describes the state in terms of the progress made, and it must be true before the first round, kept true by every round, and strong enough to give the answer at the end.",
    },
    {
      type: "multi",
      q: "<code>second_largest(xs)</code> should return the second biggest value in a list. Select every input that probes an edge case the specification has to settle.",
      o: [
        "<code>[5, 1, 3]</code>",
        "<code>[]</code>",
        "<code>[4]</code>",
        "<code>[7, 7, 7]</code>",
        "<code>[9, 9, 2]</code>",
        "<code>[2, 9, 6, 1]</code>",
      ],
      a: [1, 2, 3, 4],
      why: "An empty list and a one-item list have no second item at all. In <code>[7, 7, 7]</code> and <code>[9, 9, 2]</code> a tie forces a decision: is the second largest 9 or 2? The spec must say. <code>[5, 1, 3]</code> and <code>[2, 9, 6, 1]</code> are ordinary inputs.",
    },
  ]);

  /* =====================================================================
     Phase 1: big-O
     ===================================================================== */
  const curvesFig = () => {
    const w = 520,
      h = 250,
      X = (n) => 46 + n * (456 / 40),
      Y = (v) => h - 36 - v * (190 / 40);
    const path = (f, from, to) => {
      let d = "",
        started = false;
      for (let n = from; n <= to + 1e-9; n += 0.1) {
        const v = f(n);
        if (v > 40) {
          d += `L${X(n).toFixed(1)} ${Y(40).toFixed(1)}`;
          break;
        }
        d += `${started ? "L" : "M"}${X(n).toFixed(1)} ${Y(v).toFixed(1)}`;
        started = true;
      }
      return d;
    };
    const endOf = (f, from) => {
      for (let n = from; n <= 40; n += 0.05) if (f(n) >= 40) return [n, 40];
      return [40, f(40)];
    };
    const defs = [
      ["P", (n) => n * n, "var(--amber)", 0],
      ["Q", (n) => n * Math.log2(n), "var(--violet)", 1],
      ["R", (n) => n, "var(--blue)", 0],
      ["S", (n) => Math.log2(n), "var(--teal)", 1],
    ];
    let s = "";
    for (let v = 0; v <= 40; v += 10)
      s += `<line x1="46" y1="${Y(v)}" x2="502" y2="${Y(v)}" stroke="var(--line)"/>${tx(38, Y(v) + 4, v, { a: "end", sz: 11, c: "var(--text-dim)" })}`;
    for (let n = 0; n <= 40; n += 10) s += tx(X(n), h - 18, n, { sz: 11, c: "var(--text-dim)" });
    s +=
      tx(274, h - 2, "input size n", { sz: 12, c: "var(--text-dim)" }) +
      tx(6, 8, "steps", { sz: 12, c: "var(--text-dim)", a: "start" });
    defs.forEach(([id, f, col, from]) => {
      const [ex, ey] = endOf(f, from || 1),
        px = X(ex),
        py = Y(ey);
      s += `<g data-pick="${id}"><path d="${path(f, from || 1, 40)}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"/><path d="${path(f, from || 1, 40)}" fill="none" stroke="transparent" stroke-width="18"/><circle cx="${Math.min(px, 494)}" cy="${py + (id === "S" ? -14 : 0)}" r="11" fill="var(--panel)" stroke="${col}" stroke-width="3"/>${tx(Math.min(px, 494), py + (id === "S" ? -9 : 5), id, { sz: 12, c: col })}</g>`;
    });
    return svg(w, h, s, true);
  };
  const crossFig = () => {
    const w = 520,
      h = 260,
      X = (n) => 50 + n * 4.5,
      Y = (v) => h - 44 - v * (190 / 6000);
    let s = "";
    for (let v = 0; v <= 6000; v += 2000)
      s += `<line x1="50" y1="${Y(v)}" x2="500" y2="${Y(v)}" stroke="var(--line)"/>${tx(42, Y(v) + 4, v.toLocaleString("en-GB"), { a: "end", sz: 11, c: "var(--text-dim)" })}`;
    let dB = "",
      dA = "";
    for (let n = 0; n <= 100; n += 1) {
      const a = 50 * n;
      dA += `${n ? "L" : "M"}${X(n)} ${Y(a)}`;
    }
    for (let n = 0; n <= 77; n += 1) dB += `${n ? "L" : "M"}${X(n)} ${Y(n * n)}`;
    s += `<path d="${dA}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linecap="round"/><path d="${dB}" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linecap="round"/>`;
    s +=
      tx(470, Y(5000) - 10, "A: 50n", { c: "var(--blue-ink)", sz: 14 }) +
      tx(X(75) - 36, Y(5800) + 2, "B: n²", { c: "var(--amber-ink)", sz: 14 });
    [20, 40, 60, 80].forEach((n) => {
      s += `<g data-pick="${n}"><line x1="${X(n)}" y1="${Y(0)}" x2="${X(n)}" y2="${Y(6000)}" stroke="var(--line-2)" stroke-width="2" style="${dashed}"/><rect x="${X(n) - 28}" y="${h - 34}" width="56" height="26" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(X(n), h - 16, "n = " + n, { sz: 12 })}</g>`;
    });
    return svg(w, h, s, true);
  };

  B.add("a1-bigo", [
    {
      type: "match",
      q: "A student timed three programs at n = 1,000, 2,000 and 4,000 (each doubling). Match each set of timings to its growth.",
      pairs: [
        ["10 ms, 20 ms, 40 ms", "O(n)"],
        ["10 ms, 40 ms, 160 ms", "O(n²)"],
        ["10 ms, 11 ms, 12 ms", "O(log n)"],
        ["10 ms, 22 ms, 48 ms", "O(n log n)"],
      ],
      why: "Look at what doubling n does. Twice the time: linear. Four times: quadratic. Only a little extra each time: logarithmic. Slightly more than double: n log n (the extra log n factor adds a little each doubling).",
    },
    {
      type: "pick",
      q: "Program A takes 50n steps and program B takes n² steps. A is the clever, linear one. Click the <b>first</b> marked input size where A is really faster than B.",
      fig: crossFig(),
      a: "60",
      hint: "A beats B when 50n &lt; n². Divide both sides by n.",
      why: "50n &lt; n² as soon as n &gt; 50, so the curves cross at n = 50. At n = 40 B is still cheaper (1,600 against 2,000). At n = 60 A wins (3,000 against 3,600). Big-O only promises that the slower-growing one wins <i>eventually</i>; the constant decides where.",
    },
    {
      type: "bug",
      q: "This should find a duplicate in O(n) time, but it is secretly O(n²). Click the line with the hidden cost.",
      code: [
        "def has_duplicate(xs):",
        "    seen = []",
        "    for x in xs:",
        "        if x in seen:",
        "            return True",
        "        seen.append(x)",
        "    return False",
      ],
      a: 3,
      why: "<code>x in seen</code> on a list scans the list item by item, so the loop does 0 + 1 + 2 + … comparisons. Make <code>seen</code> a set (<code>seen = set()</code>, <code>seen.add(x)</code>) and the membership test is O(1) on average.",
    },
    {
      type: "cat",
      q: "A Python list <code>xs</code> holds a million items. Which operations take the same time however long the list is?",
      buckets: ["Same cost at any length", "Slows down as the list grows"],
      items: [
        ["<code>xs[500000]</code>", 0],
        ["<code>xs.append(7)</code>", 0],
        ["<code>len(xs)</code>", 0],
        ["<code>7 in xs</code>", 1],
        ["<code>xs.insert(0, 7)</code>", 1],
        ["<code>sum(xs)</code>", 1],
      ],
      why: "Indexing, appending to the end and reading the length don't look at the other items. Searching with <code>in</code> and <code>sum</code> touch every item, and <code>insert(0, …)</code> has to shuffle every existing item along one place.",
    },
    {
      type: "pick",
      q: "These curves show steps against input size n. Click the one where doubling n only adds a fixed number of steps.",
      fig: curvesFig(),
      a: "S",
      hint: "Look for the curve that flattens out: it barely rises as n keeps growing.",
      why: "S is logarithmic: log₂(2n) = log₂ n + 1, so each doubling costs one more step. R (linear) doubles when n doubles, Q (n log n) a little more than doubles, and P (quadratic) quadruples.",
    },
    {
      type: "mcq",
      q: "Here n could be a billion. How does the running time grow with n?",
      fig: codeBox(["for i in range(n):", "    for j in range(1000):", "        work()"]),
      o: ["O(n)", "O(n²)", "O(1000²)", "O(n log n)"],
      a: 0,
      why: "The inner loop always runs exactly 1,000 times, however big n is, so the total is 1,000 × n. Constant factors vanish in Big-O: it's linear. (The nested shape only becomes quadratic when the inner bound itself depends on n.)",
    },
  ]);

  /* =====================================================================
     Phase 1: the random surfer
     ===================================================================== */
  const dArrow = { directed: true };
  const surfFig1 = Qf.graph(
    { p: [50, 50], q: [50, 130], r: [50, 210], U: [200, 130], s: [350, 225], H: [350, 130], T: [480, 130] },
    [
      ["p", "U"],
      ["q", "U"],
      ["r", "U"],
      ["U", "H"],
      ["s", "H"],
      ["H", "T"],
      ["T", "H"],
    ],
    { pick: "nodes", w: 530, h: 260, ...dArrow },
  );
  const trapFig = Qf.graph(
    { S: [50, 130], T: [190, 50], W: [190, 210], U: [340, 50], V: [470, 130] },
    [
      ["S", "T"],
      ["S", "W"],
      ["W", "T"],
      ["T", "U"],
      ["U", "V"],
      ["V", "U"],
    ],
    { pick: "nodes", w: 520, h: 260, ...dArrow },
  );
  const tokenFig = (() => {
    const N = { A: [90, 70], B: [90, 210], C: [330, 210], D: [330, 70] },
      tok = { A: 20, B: 20, C: 40, D: 20 };
    let f = Qf.graph(
      N,
      [
        ["A", "B"],
        ["A", "C"],
        ["B", "C"],
        ["C", "D"],
        ["D", "A"],
        ["D", "B"],
      ],
      { w: 430, h: 280, ...dArrow },
    );
    const lab = Object.entries(N)
      .map(([k, [x, y]]) => {
        const ly = y > 150 ? y + 26 : y - 48;
        return `<g><rect x="${x - 34}" y="${ly}" width="68" height="22" rx="8" fill="var(--amber-dim)" stroke="var(--amber)" stroke-width="2"/>${tx(x, ly + 15, tok[k] + " tokens", { sz: 11, c: "var(--amber-ink)" })}</g>`;
      })
      .join("");
    return f.replace("</svg>", lab + "</svg>");
  })();

  B.add("a1-surfer", [
    {
      type: "pick",
      q: "Every page starts equal and the usual damped PageRank is run to convergence. Click the page with the <b>highest</b> PageRank. (Arrows show who links to whom.)",
      fig: surfFig1,
      a: "H",
      hint: "Which page gets rank from a page that itself receives rank from lots of places?",
      why: "H wins. U and H both have three incoming links, but U's come from p, q and r, which nobody links to, so they carry almost no rank. H is fed by U, by s and by T, and T returns everything H passes it. A link is worth what its source is worth.",
    },
    {
      type: "pick",
      q: "This web is run with <b>no teleporting</b> (d = 1), forever. A double arrow means each page links to the other. Click every page whose rank ends up at zero.",
      fig: trapFig,
      a: ["S", "T", "W"],
      why: "U and V only link to each other, so rank that reaches them never comes back out. S has no incoming links at all, so it gets nothing, W only gets from S, and T's rank drains into the U–V trap. In the long run all of it sits in U and V. Teleporting is what stops this.",
    },
    {
      type: "mcq",
      q: "Each page pours all its tokens into its outgoing links, split equally. The tokens now are shown. After <b>one</b> step, how many tokens will C hold?",
      fig: tokenFig,
      o: ["10", "20", "30", "60"],
      a: 2,
      hint: "C hears from A and from B. A has two links, so only half of its 20 reaches C. B has one link.",
      why: "From A: 20 ÷ 2 = 10. From B (a single link): all 20. C holds 10 + 20 = <b>30</b>. (D passes on nothing to C: it links to A and B.) A page with fewer links gives each target a bigger share.",
    },
    {
      type: "slider",
      q: "A surfer follows a random link with probability d = 0.5 and teleports otherwise. What percentage of surfers are <b>still</b> clicking links, with no teleport yet, after 3 clicks in a row?",
      min: 0,
      max: 100,
      step: 0.5,
      ans: 12.5,
      tol: 5,
      unit: "%",
      hint: "Each click survives with probability ½. So ½ × ½ × ½.",
      why: "The chance of avoiding the teleport three times running is d³ = 0.5 × 0.5 × 0.5 = 0.125, so about 12.5%. With d = 0.85 it would be about 61%: a high d keeps surfers on the links, a low d scatters them.",
    },
    {
      type: "cat",
      q: "Run PageRank with <b>no teleporting and no dangling-page repair</b>. What happens to the rank in each situation?",
      buckets: ["Rank leaks away", "Rank gets trapped", "Flows normally"],
      items: [
        ["A page with no outgoing links", 0],
        ["A page whose only link points to a page with no links", 0],
        ["Two pages that only link to each other, with other pages linking in", 1],
        ["A page that links only to itself", 1],
        ["A page with 200 outgoing links among a well-connected web", 2],
        ["Every page has a link, and any page can be reached from any other", 2],
      ],
      why: "A page with no links out simply loses the rank it receives (the total shrinks). A cycle that nothing leaves keeps the rank forever and starves the pages that feed it. A long link list only dilutes each share; and a strongly connected web with no dead ends keeps all its rank moving.",
    },
    {
      type: "bug",
      q: "One damped PageRank step. The rank is not being shared out correctly. Click the faulty line.",
      code: [
        "def step(rank, links, d):",
        "    n = len(rank)",
        "    new = {p: (1 - d) / n for p in rank}",
        "    for p in rank:",
        "        share = rank[p] / len(links)",
        "        for q in links[p]:",
        "            new[q] += d * share",
        "    return new",
      ],
      a: 4,
      why: "A page splits its rank over <i>its own</i> outgoing links: <code>len(links[p])</code>. Dividing by <code>len(links)</code> (the number of pages in the web) gives every link the same tiny share, whether the page links to two pages or two hundred.",
    },
  ]);

  /* =====================================================================
     Phase 1: PageRank as a matrix
     ===================================================================== */
  const hFig = (() => {
    const g = Qf.graph(
      { A: [60, 50], B: [190, 50], D: [60, 180], C: [190, 180] },
      [
        ["A", "B"],
        ["A", "C"],
        ["B", "C"],
        ["C", "D"],
        ["D", "A"],
        ["D", "B"],
      ],
      { directed: true, w: 260, h: 240 },
    );
    const cols = { A: ["0", "½", "½", "0"], B: ["0", "0", "1", "0"], C: ["0", "0", "0", "1"], D: ["1", "1", "0", "0"] },
      names = ["A", "B", "C", "D"];
    let s = "";
    names.forEach((n, i) => {
      s += tx(40, 66 + i * 34, "to " + n, { sz: 12, c: "var(--text-dim)", a: "end" });
    });
    names.forEach((n, j) => {
      const x = 60 + j * 66;
      s += `<g data-pick="${n}"><rect x="${x}" y="8" width="58" height="176" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(x + 29, 30, "from " + n, { sz: 12, c: "var(--text-dim)" })}${cols[n].map((v, i) => tx(x + 29, 66 + i * 34, v, { sz: 17, f: "var(--mono)" })).join("")}</g>`;
    });
    return `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center"><div style="flex:1 1 200px;min-width:200px">${g}</div><div style="flex:1 1 280px;min-width:280px">${svg(330, 190, s, true)}</div></div>`;
  })();

  const convFig = (() => {
    const e5 = [0.07692, 0.03077, 0.01058, 0.00288, 0.0012, 0.00048, 0.00017, 0.00005, 0.00002, 0.00001, 0, 0];
    const e95 = [
      0.22175, 0.17496, 0.11618, 0.06284, 0.04515, 0.03563, 0.02366, 0.0128, 0.00919, 0.00725, 0.00482, 0.00261,
    ];
    const w = 520,
      h = 250,
      X = (i) => 56 + (i - 1) * 40,
      Y = (v) => h - 40 - v * (180 / 0.25);
    let s = "";
    [0, 0.05, 0.1, 0.15, 0.2, 0.25].forEach(
      (v) =>
        (s += `<line x1="50" y1="${Y(v)}" x2="500" y2="${Y(v)}" stroke="var(--line)"/>${tx(44, Y(v) + 4, v.toFixed(2), { a: "end", sz: 11, c: "var(--text-dim)" })}`),
    );
    for (let i = 1; i <= 12; i++) s += tx(X(i), h - 22, i, { sz: 11, c: "var(--text-dim)" });
    s += tx(280, h - 4, "iteration", { sz: 12, c: "var(--text-dim)" });
    s +=
      `<line x1="50" y1="${Y(0.01)}" x2="500" y2="${Y(0.01)}" stroke="var(--rose)" stroke-width="2" style="${dashed}"/>` +
      tx(498, Y(0.01) - 6, "stop when below 0.01", { a: "end", sz: 11, c: "var(--rose-ink)" });
    const line = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${X(i + 1)} ${Y(v)}`).join("");
    s += `<g data-pick="low"><path d="${line(e5)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linecap="round"/><path d="${line(e5)}" fill="none" stroke="transparent" stroke-width="18"/>${tx(X(2) + 34, Y(e5[1]) - 16, "blue run", { c: "var(--blue-ink)", sz: 12 })}</g>`;
    s += `<g data-pick="high"><path d="${line(e95)}" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linecap="round"/><path d="${line(e95)}" fill="none" stroke="transparent" stroke-width="18"/>${tx(X(5), Y(e95[4]) - 12, "orange run", { c: "var(--amber-ink)", sz: 12 })}</g>`;
    return svg(w, h, s, true);
  })();

  const sumFig = `<table class="t" style="max-width:380px"><thead><tr><th>Iteration</th><th class="num">Sum of all ranks</th></tr></thead><tbody>${[
    ["0 (start)", "1.000"],
    ["1", "0.787"],
    ["2", "0.697"],
    ["3", "0.582"],
    ["4", "0.533"],
    ["5", "0.498"],
    ["6", "0.472"],
  ]
    .map(([a, b]) => `<tr><td>${a}</td><td class="num">${b}</td></tr>`)
    .join("")}</tbody></table>`;
  const fixFig = Qf.graph(
    { A: [60, 125], B: [230, 45], C: [230, 205], D: [400, 125] },
    [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["D", "A"],
    ],
    { directed: true, w: 460, h: 250 },
  );

  B.add("a1-pagerank", [
    {
      type: "pick",
      q: "The link matrix <b>H</b> was built for the web on the left (column = the page that is linking). One column breaks the rule for H. Click it.",
      fig: hFig,
      a: "D",
      hint: "Each column should add up to 1: a page shares out exactly its whole rank.",
      why: "D links to A and B, so it should pass ½ to each: column D is (½, ½, 0, 0). As drawn it adds up to 2, so the matrix would create rank from nothing. Every column of H (and of G) must sum to 1.",
    },
    {
      type: "pick",
      q: "Two PageRank runs on the same web use d = 0.5 and d = 0.95. The graph shows how far the rank vector moved each iteration. Click the run that used d = 0.95.",
      fig: convFig,
      a: "high",
      why: "A high d means a surfer teleports rarely, so rank takes many more rounds to spread out and settle. The orange run falls by only about a quarter each iteration and needs 9 iterations to get below 0.01; the blue run (d = 0.5) is there in 4.",
    },
    {
      type: "mcq",
      q: "With no damping, the PageRank vector p must satisfy <b>p = G p</b>: one more step changes nothing. Which vector does that for this web?",
      fig: fixFig,
      o: [
        "A 1/3 · B 1/6 · C 1/6 · D 1/3",
        "A 1/4 · B 1/4 · C 1/4 · D 1/4",
        "A 1/6 · B 1/3 · C 1/3 · D 1/6",
        "A 1/3 · B 1/3 · C 1/6 · D 1/6",
      ],
      a: 0,
      hint: "A gets rank only from D. B and C each get half of A's rank. D gets all of B's and C's.",
      why: "Check the rules: A = D, B = A/2, C = A/2, D = B + C. With A = D = 1/3 and B = C = 1/6 all four hold, and they add to 1. The uniform vector fails: B would receive only half of A's 1/4, which is 1/8, not 1/4.",
    },
    {
      type: "order",
      q: "Put one damped PageRank iteration in order.",
      items: [
        "Split each page's rank equally across its outgoing links (a page with none shares with everyone)",
        "Multiply every share by the damping factor d",
        "Add the teleport share (1 − d)/N to every page",
        "Measure how far the vector moved, and stop if it is below the tolerance",
      ],
      why: "Move the rank along the links first, damp it, then top every page up with its teleport floor so the total returns to 1. Only the finished new vector is compared with the old one to decide whether to stop.",
    },
    {
      type: "bug",
      q: "This power iteration for PageRank always returns a vector of zeros. Click the faulty line.",
      code: [
        "def pagerank(G, tol=1e-8):",
        "    n = len(G)",
        "    p = np.zeros(n)",
        "    while True:",
        "        new = G @ p",
        "        if abs(new - p).sum() < tol:",
        "            return new",
        "        p = new",
      ],
      a: 2,
      why: "A matrix times a zero vector is a zero vector, so the loop 'converges' straight away on the wrong answer. The start must be a probability distribution that sums to 1, usually <code>np.full(n, 1 / n)</code>.",
    },
    {
      type: "mcq",
      q: "A team's PageRank code adds the damping and the teleport step correctly, but the total rank behaves like this on a web where one page has no outgoing links. What is most likely missing?",
      fig: sumFig,
      o: [
        "Rank held by pages with no links out is never redistributed",
        "The teleport share (1 − d)/N is being added to every page twice over",
        "The starting vector was not normalised, so it adds up to more than 1",
        "The loop keeps running for more iterations than the tolerance needs",
      ],
      a: 0,
      why: "The total starts at exactly 1 and then falls every round, so something is removing rank. A page with no links pours its rank nowhere unless its column is repaired (replaced by 1/N each). Adding teleport twice would make the total rise, not fall.",
    },
  ]);

  /* =====================================================================
     Lecture 2: Dijkstra
     ===================================================================== */
  const dG1 = { S: [50, 130], A: [170, 50], B: [170, 210], C: [320, 50], D: [320, 210], T: [450, 130] };
  const dE1 = [
    ["S", "A", 2],
    ["S", "B", 5],
    ["A", "B", 2],
    ["A", "C", 4],
    ["B", "D", 3],
    ["C", "T", 3],
    ["D", "T", 1],
    ["C", "D", 6],
  ];
  const dG2 = { S: [50, 130], B: [150, 55], A: [150, 210], D: [290, 55], C: [290, 210], E: [440, 130] };
  const dE2 = [
    ["S", "B", 1],
    ["S", "A", 3],
    ["B", "A", 1],
    ["A", "C", 4],
    ["B", "D", 6],
    ["C", "E", 2],
    ["D", "E", 3],
  ];
  const claimed = { S: 0, B: 1, A: 3, C: 6, D: 7, E: 8 };
  const wrongFig = Qf.graph(dG2, dE2, { pick: "nodes", w: 500, h: 270 }).replace(
    "</svg>",
    Object.entries(dG2)
      .map(([k, [x, y]]) => tx(x, y + (y > 150 ? 40 : -28), "dist " + claimed[k], { sz: 12, c: "var(--amber-ink)" }))
      .join("") + "</svg>",
  );
  const hopFig = Qf.graph(
    { S: [50, 130], A: [170, 50], B: [310, 50], C: [240, 215], T: [450, 130] },
    [
      ["S", "T", 9],
      ["S", "A", 2],
      ["A", "B", 3],
      ["B", "T", 1],
      ["S", "C", 5],
      ["C", "T", 5],
    ],
    { w: 500, h: 260 },
  );

  B.add("a2-dijkstra", [
    {
      type: "pick",
      q: "Dijkstra runs from S on this map. The final <b>shortest-path tree</b> is the set of roads actually used to reach each node. Click every road in it.",
      fig: Qf.graph(dG1, dE1, { pick: "edges", w: 500, h: 260 }),
      a: ["S-A", "A-B", "A-C", "B-D", "D-T"],
      hint: "Find each node's final distance, then ask which road delivered it.",
      why: "Distances: A 2, B 4 (via A, beating the direct road of 5), C 6, D 7, T 8 (via D: 7 + 1, beating C: 6 + 3 = 9). The roads S–B, C–T and C–D are never the best way into a node, so they stay out of the tree.",
    },
    {
      type: "pick",
      q: "A student claims these are the shortest distances from S. Exactly one label is wrong. Click that node.",
      fig: wrongFig,
      a: "A",
      hint: "Look for a cheaper way into each node than the direct road.",
      why: "S → B → A costs 1 + 1 = 2, cheaper than the direct road S–A (3). The rest check out: C = 2 + 4 = 6, D = 1 + 6 = 7, E = 6 + 2 = 8. The slip is typical of grabbing the first road you see rather than relaxing through every settled node.",
    },
    {
      type: "bug",
      q: "This heap-based Dijkstra is meant to always take the closest unsettled node next, but it doesn't. Click the line that breaks that.",
      code: [
        "def dijkstra(graph, s):",
        '    dist = {v: float("inf") for v in graph}',
        "    dist[s] = 0",
        "    heap = [(0, s)]",
        "    while heap:",
        "        d, u = heapq.heappop(heap)",
        "        for v, w in graph[u]:",
        "            if d + w < dist[v]:",
        "                dist[v] = d + w",
        "                heapq.heappush(heap, (w, v))",
        "    return dist",
      ],
      a: 9,
      why: "The heap must be ordered by distance from the source, <code>d + w</code>. Pushing just the edge weight <code>w</code> orders nodes by the length of their last road, so far-away nodes can jump the queue and the guarantee that 'popped means final' is lost.",
    },
    {
      type: "cat",
      q: "Which of these can Dijkstra's algorithm handle safely?",
      buckets: ["Dijkstra is safe", "Needs another algorithm"],
      items: [
        ["A road map with distances in kilometres", 0],
        ["Flights where some legs are free (cost 0)", 0],
        ["Several parallel roads between the same two towns", 0],
        ["A network where one link refunds 2 units (cost −2)", 1],
        ["Currency exchange scored as negative logs of rates, so some trades gain", 1],
      ],
      why: "Dijkstra's safety argument says a later detour can only add cost. Zero is fine, and parallel roads just give it more choices. Negative weights break the argument, so use Bellman–Ford instead.",
    },
    {
      type: "mcq",
      q: "A traveller wants the cheapest trip from S to T on this map (road costs shown). Which route does Dijkstra return?",
      fig: hopFig,
      o: [
        "S → T directly, total cost 9",
        "S → A → B → T, total cost 6",
        "S → C → T, total cost 10",
        "S → A → B → T, total cost 8",
      ],
      a: 1,
      why: "Dijkstra minimises the <i>total weight</i>, not the number of roads. The direct road is only one hop but costs 9, while 2 + 3 + 1 = 6 using three hops. Via C it costs 5 + 5 = 10.",
    },
    {
      type: "multi",
      q: "At the moment Dijkstra settles a node u, which of these are true? Select all that apply.",
      o: [
        "u's distance is final and cannot drop later",
        "Every node still waiting has a tentative distance at least as big as u's",
        "Every neighbour of u is already settled",
        "Every node settled earlier has a distance no bigger than u's",
        "u's shortest path goes only through nodes that are already settled",
        "Every road in the graph has been relaxed at least once",
      ],
      a: [0, 1, 3, 4],
      why: "Settling the smallest tentative distance means nothing waiting can undercut it (there is no negative road), and the settled nodes come out in non-decreasing order. u's neighbours may well still be waiting (relaxing them is the next job), and many roads haven't been looked at yet.",
    },
  ]);

  /* =====================================================================
     Lecture 2: A*
     ===================================================================== */
  const aWalls = wallSet([
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
  ]);
  const nextFig = (() => {
    const cs = 52,
      cells = {},
      gTxt = (g) => ({ fill: "var(--violet-dim)", stroke: "var(--violet)", t: "g " + g });
    [
      ["0,1", 1],
      ["0,3", 1],
      ["1,1", 2],
      ["1,3", 2],
      ["2,1", 3],
      ["2,3", 3],
      ["3,2", 3],
    ].forEach(([k, g]) => (cells[k] = { ...gTxt(g), pick: k }));
    cells["0,2"] = { fill: "var(--amber-dim)", stroke: "var(--amber)", t: "S" };
    cells["1,2"] = { fill: "var(--teal-dim)", stroke: "var(--teal)", t: "done" };
    cells["2,2"] = { fill: "var(--teal-dim)", stroke: "var(--teal)", t: "done" };
    cells["7,2"] = { fill: "var(--rose-dim)", stroke: "var(--rose)", t: "G" };
    return svg(
      8 * cs + 2,
      5 * cs + 30,
      grid(8, 5, cs, { cells, walls: aWalls }) +
        tx(4 * cs, 5 * cs + 22, "green: already expanded · purple: waiting, with its g · dark: wall", {
          sz: 12,
          c: "var(--text-dim)",
        }),
      true,
    );
  })();
  const diagFig = (() => {
    const cs = 52,
      cells = {},
      G = [7, 2],
      put = (id, x, y) =>
        (cells[x + "," + y] = {
          fill: "var(--violet-dim)",
          stroke: "var(--violet)",
          t: "h " + (Math.abs(x - G[0]) + Math.abs(y - G[1])),
          pick: id,
        });
    put("a", 4, 2);
    put("b", 5, 0);
    put("c", 2, 2);
    put("d", 3, 4);
    put("e", 6, 1);
    put("f", 6, 2);
    cells["7,2"] = { fill: "var(--rose-dim)", stroke: "var(--rose)", t: "G" };
    return svg(
      8 * cs + 2,
      5 * cs + 30,
      grid(8, 5, cs, { cells }) +
        tx(4 * cs, 5 * cs + 22, "each purple cell shows its Manhattan distance to G: |dx| + |dy|", {
          sz: 12,
          c: "var(--text-dim)",
        }),
      true,
    );
  })();
  const pocketFig = (() => {
    const W = 11,
      H = 7,
      S = [0, 3],
      G = [7, 3],
      list = [];
    for (let y = 1; y <= 5; y++) list.push([5, y], [9, y]);
    for (let x = 5; x <= 9; x++) list.push([x, 1], [x, 5]);
    const walls = wallSet(list);
    walls.delete("9,3");
    const one = (h0, name) => {
      const closed = astar(W, H, walls, S, G, h0),
        cells = {};
      closed.forEach((k) => (cells[k] = { fill: "var(--teal-dim)", stroke: "var(--teal)" }));
      cells["0,3"] = { ...cells["0,3"], fill: "var(--amber-dim)", stroke: "var(--amber)", t: "S", sz: 11 };
      cells["7,3"] = { fill: "var(--rose-dim)", stroke: "var(--rose)", t: "G", sz: 11 };
      return `<div style="flex:1 1 250px;min-width:230px">${svg(W * 26 + 2, H * 26 + 2, grid(W, H, 26, { cells, walls }), true)}<div style="text-align:center;font-weight:800;margin-top:4px">${name}: ${closed.length} cells expanded</div></div>`;
    };
    return `<div style="display:flex;flex-wrap:wrap;gap:14px">${one(false, "A* (Manhattan)")}${one(true, "Dijkstra (h = 0)")}</div><div class="faint" style="margin-top:6px;font-weight:800">Green cells were expanded. G sits inside a dark pocket whose opening faces away from S.</div>`;
  })();

  B.add("a2-astar", [
    {
      type: "pick",
      q: "A* (Manhattan distance, 4-way moves, every step costs 1) is part-way through. Click the waiting cell it will expand next.",
      fig: nextFig,
      a: "3,2",
      hint: "For each purple cell: f = g + h, where h counts the squares to G ignoring walls.",
      why: "Cell (3,2) has g = 3 and h = 4, so f = 7. Every other waiting cell has f = 9 (for instance g = 1 and h = 8). A* heads for the goal even though the wall will block that column: Manhattan distance never looks at walls, so it only finds out when the cell is expanded.",
    },
    {
      type: "bug",
      q: "This A* returns a path that isn't always the shortest. Click the line that turns it into greedy best-first search.",
      code: [
        "def astar(start, goal, h, nbrs):",
        "    g = {start: 0}",
        "    open_ = [(h(start), start)]",
        "    while open_:",
        "        _, u = heapq.heappop(open_)",
        "        if u == goal:",
        "            return g[u]",
        "        for v, w in nbrs(u):",
        "            if g[u] + w < g.get(v, INF):",
        "                g[v] = g[u] + w",
        "                heapq.heappush(open_, (h(v), v))",
        "    return None",
      ],
      a: 10,
      why: "The priority must be <code>g[v] + h(v)</code>. Ranking by <code>h</code> alone only chases whatever looks nearest to the goal and ignores what it cost to get there, so the first time the goal is popped the route can be long.",
    },
    {
      type: "mcq",
      q: "G is walled in, with the opening on the far side. A* uses Manhattan distance, yet expands almost as many cells as Dijkstra (see the counts). Why?",
      fig: pocketFig,
      o: [
        "Manhattan distance ignores walls, so cells in front of them look close",
        "A* must expand every cell on the map once before it can return a path",
        "The heuristic is inadmissible here, so A* quietly falls back to Dijkstra",
        "Dijkstra's search was stopped early so that the comparison looks fair",
      ],
      a: 0,
      why: "h only counts squares, so every cell next to the wall looks only a few steps from G while the real way round is long. A* keeps expanding them until f finally exceeds the length of the route round the back. The heuristic is still admissible; it is just not informative here.",
    },
    {
      type: "pick",
      q: "Moves can now be <b>diagonal</b>, costing 1 each, and the heuristic is still Manhattan distance to G (shown in each cell). Click every cell where the heuristic <b>overestimates</b> the true remaining cost.",
      fig: diagFig,
      a: ["b", "d", "e"],
      hint: "With diagonal steps, a cell 2 right and 2 up needs just 2 moves, not 4.",
      why: "A diagonal move covers one square across and one up for a single step, so the true cost is max(|dx|, |dy|). Cell b is 2 across and 2 up (true cost 2, h = 4), d is 4 and 2 (true 4, h = 6), e is 1 and 1 (true 1, h = 2). Cells on a straight line from G (a, c, f) are fine. Manhattan distance is only admissible with 4-way moves.",
    },
    {
      type: "match",
      q: "Match each heuristic with how A* behaves on an open grid with 4-way moves.",
      pairs: [
        ["h = 0 everywhere", "Same as Dijkstra: spreads out in a diamond"],
        ["Manhattan distance", "Still shortest, with far fewer cells expanded"],
        ["3 × Manhattan distance", "Very fast, but may return a longer path"],
        ["h = the exact remaining cost", "Heads almost straight down a shortest path"],
      ],
      why: "A* is a dial. 0 gives no guidance. A good admissible h gives guidance without losing optimality. Overestimating buys speed but breaks the guarantee. A perfect h removes all the wasted work.",
    },
  ]);

  /* =====================================================================
     Lecture 2: routing
     ===================================================================== */
  const dvFig = (() => {
    const nb = [
      ["B", 2, 4],
      ["C", 3, 5],
      ["D", 3, 4],
      ["E", 1, 6],
    ];
    let s = `<rect x="4" y="74" width="112" height="86" rx="12" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(60, 104, "Router A", { sz: 14, c: "var(--blue-ink)" })}${tx(60, 126, "route to X:", { sz: 12, c: "var(--text-dim)" })}${tx(60, 146, "cost 7, via D", { sz: 13 })}`;
    nb.forEach(([n, link, adv], i) => {
      const y = 8 + i * 60;
      s += `<line x1="116" y1="117" x2="204" y2="${y + 24}" stroke="var(--line-2)" stroke-width="3"/>${tx(160, 117 + (y + 24 - 117) * 0.5 - 6, "link " + link, { sz: 12, c: "var(--text-dim)" })}`;
      s += `<g data-pick="${n}"><rect x="204" y="${y}" width="192" height="48" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(300, y + 20, "Router " + n + " advertises", { sz: 12, c: "var(--text-dim)" })}${tx(300, y + 39, '"X is ' + adv + ' away"', { sz: 14 })}</g>`;
    });
    return svg(400, 250, s, true);
  })();
  const poisonFig = (() => {
    const rows = [
        ["X", 3, "A"],
        ["Y", 2, "C"],
        ["Z", 5, "A"],
        ["W", 1, "D"],
        ["V", 4, "C"],
      ],
      cx = [60, 170, 290];
    let s = ["Destination", "Cost", "Next hop"]
      .map((h, k) => tx(cx[k], 18, h, { sz: 12, c: "var(--text-dim)" }))
      .join("");
    rows.forEach(([d, c, n], i) => {
      const y = 28 + i * 38;
      s += `<g data-pick="${d}"><rect x="8" y="${y}" width="344" height="32" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(cx[0], y + 21, d, { sz: 15 })}${tx(cx[1], y + 21, c, { sz: 15, f: "var(--mono)" })}${tx(cx[2], y + 21, n, { sz: 15 })}</g>`;
    });
    return (
      `<div class="faint" style="font-weight:800;margin-bottom:6px">Router B's own routing table</div>` +
      svg(360, 222, s, true)
    );
  })();
  const failG = { A: [60, 130], B: [200, 45], C: [190, 130], E: [200, 220], D: [340, 130], F: [470, 130] };
  const failFig = Qf.graph(
    failG,
    [
      ["A", "B", 2],
      ["A", "C", 1],
      ["A", "E", 1],
      ["B", "F", 3],
      ["C", "D", 2],
      ["D", "F", 1],
      ["E", "F", 7],
    ],
    { pick: "nodes", w: 520, h: 260, hl: { "C-D": "var(--rose)", F: "var(--amber)" } },
  );

  B.add("a2-routing", [
    {
      type: "pick",
      q: "Router A currently reaches X at cost 7 (via D). The four neighbours below have just sent their latest distance-vector advertisements. Click the one whose message makes A <b>switch</b> to a new route.",
      fig: dvFig,
      a: "B",
      hint: "For each neighbour, add the link cost to the distance it advertises. Switch only if the total is strictly below 7.",
      why: "Via B: 2 + 4 = 6, which beats 7. C gives 3 + 5 = 8 (worse). D gives 3 + 4 = 7, the route A already uses. E gives 1 + 6 = 7, a tie: no improvement, so A keeps what it has.",
    },
    {
      type: "order",
      q: "A link in a link-state network fails. Put the recovery in order.",
      items: [
        "A router next to the failed link notices it has stopped answering",
        "It floods a new link-state message to every router",
        "Each router updates its own copy of the network map",
        "Each router re-runs Dijkstra on the updated map",
        "Forwarding tables switch to the new shortest paths",
      ],
      why: "The news travels first (flooding), then every router independently recomputes from the same shared map. No router has to trust a neighbour's maths, which is why link-state recovers without counting to infinity.",
    },
    {
      type: "pick",
      q: "Router B is about to send its table to its neighbour A. With <b>poisoned reverse</b>, click every destination that B advertises to A as unreachable (∞).",
      fig: poisonFig,
      a: ["X", "Z"],
      hint: "Which routes does B reach <i>through A</i>?",
      why: "B reaches X and Z through A. Telling A 'I can get to X in 3' would invite A to route back through B, creating a loop. So B says ∞ for those two. Routes via C or D, and W, are safe to advertise normally.",
    },
    {
      type: "pick",
      q: "All routers use link-state routing towards F (link costs shown). The red link C–D fails and everyone recomputes. Click every router, apart from F, whose <b>next hop</b> towards F changes.",
      fig: failFig,
      a: ["A", "C"],
      hint: "Work out the cheapest path to F for A, B, C and E before and after the failure.",
      why: "Before: A uses C (1 + 2 + 1 = 4) and C uses D. After: C must go back via A, and A uses B instead (2 + 3 = 5). B reaches F directly and D's road is unaffected. E's cost rises from 5 to 6, but its best next hop is still A, so only its cost changes.",
    },
    {
      type: "bug",
      q: "A distance-vector router handles an advertisement from a neighbour. The router keeps picking routes that look far too cheap. Click the faulty line.",
      code: [
        "def on_advert(table, neighbour, link_cost, advert):",
        "    for dest, cost in advert.items():",
        "        new_cost = cost",
        "        if new_cost < table.get(dest, INF):",
        "            table[dest] = new_cost",
      ],
      a: 2,
      why: "The neighbour reports its own distance to the destination. Reaching it costs the link to the neighbour <i>plus</i> that distance: <code>new_cost = link_cost + cost</code>. Without it, a far-away destination looks as close as it is to the neighbour.",
    },
  ]);

  /* =====================================================================
     Lecture 3: linear programming
     ===================================================================== */
  const lpBase = (xmax, ymax, w, h) => {
    const sx = (w - 60) / xmax,
      sy = (h - 56) / ymax,
      X = (x) => 40 + x * sx,
      Y = (y) => h - 30 - y * sy;
    let s = "";
    for (let i = 0; i <= xmax; i++)
      s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(ymax)}" stroke="var(--line)"/>${tx(X(i), Y(0) + 16, i, { sz: 11, c: "var(--text-dim)" })}`;
    for (let i = 0; i <= ymax; i++)
      s += `<line x1="${X(0)}" y1="${Y(i)}" x2="${X(xmax)}" y2="${Y(i)}" stroke="var(--line)"/>${tx(X(0) - 16, Y(i) + 4, i, { a: "end", sz: 11, c: "var(--text-dim)" })}`;
    s +=
      tx(X(xmax) - 6, Y(0) + 28, "x", { sz: 12, c: "var(--text-dim)" }) +
      tx(X(0) - 30, Y(ymax) + 4, "y", { sz: 12, c: "var(--text-dim)" });
    return { X, Y, s };
  };
  const minFig = (() => {
    const w = 440,
      h = 330,
      { X, Y, s } = lpBase(7, 7, w, h);
    const poly = [
      [4, 0],
      [5, 0],
      [5, 5],
      [0, 5],
      [0, 4],
    ];
    let o =
      s +
      `<polygon points="${poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3"/>`;
    o +=
      tx(X(2.5) + 24, Y(2.5) + 4, "feasible region", { sz: 12, c: "var(--teal-ink)" }) +
      tx(X(1), Y(2) + 4, "x + y ≥ 4", { sz: 12, c: "var(--text-dim)" });
    o +=
      tx(X(5) + 8, Y(6.3), "x ≤ 5", { a: "start", sz: 12, c: "var(--text-dim)" }) +
      tx(X(6.9), Y(5) - 6, "y ≤ 5", { a: "end", sz: 12, c: "var(--text-dim)" });
    const off = {
      "4,0": [4, -18, "start"],
      "5,0": [16, -10, "start"],
      "5,5": [16, -6, "start"],
      "0,5": [18, -12, "start"],
      "0,4": [20, -2, "start"],
    };
    poly.forEach(([x, y]) => {
      const [dx, dy, an] = off[x + "," + y];
      o += `<g data-pick="${x},${y}"><circle cx="${X(x)}" cy="${Y(y)}" r="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(X(x) + dx, Y(y) + dy, `(${x}, ${y})`, { sz: 12, c: "var(--text)", a: an })}</g>`;
    });
    return svg(w, h, o, true);
  })();
  const feasFig = (() => {
    const w = 450,
      h = 320,
      { X, Y, s } = lpBase(9, 8, w, h);
    let o = s;
    o += `<line x1="${X(0)}" y1="${Y(8)}" x2="${X(8)}" y2="${Y(0)}" stroke="var(--blue)" stroke-width="3"/>${tx(X(1.5) + 6, Y(6.5) - 8, "x + y = 8", { sz: 12, c: "var(--blue-ink)", a: "start" })}`;
    o += `<line x1="${X(6)}" y1="${Y(0)}" x2="${X(6)}" y2="${Y(8)}" stroke="var(--violet)" stroke-width="3"/>${tx(X(6) + 6, Y(7.5), "x = 6", { sz: 12, c: "var(--violet-ink)", a: "start" })}`;
    o += `<line x1="${X(0)}" y1="${Y(5)}" x2="${X(9)}" y2="${Y(5)}" stroke="var(--amber)" stroke-width="3"/>${tx(X(8.9), Y(5) - 7, "y = 5", { sz: 12, c: "var(--amber-ink)", a: "end" })}`;
    [
      ["A", 2, 2],
      ["B", 6, 3],
      ["C", 6, 2],
      ["D", 3, 6],
      ["E", 1, 5],
      ["F", 5, 4],
    ].forEach(([id, x, y]) => {
      o += `<g data-pick="${id}"><circle cx="${X(x)}" cy="${Y(y)}" r="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(X(x), Y(y) + 5, id, { sz: 13 })}</g>`;
    });
    return svg(w, h, o, true);
  })();
  const bindFig = (() => {
    const w = 450,
      h = 320,
      { X, Y, s } = lpBase(8, 7, w, h);
    const poly = [
      [0, 0],
      [5, 0],
      [5, 2],
      [3, 4],
      [0, 4],
    ];
    let o =
      s +
      `<polygon points="${poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--teal-dim)" stroke="none" opacity="0.8"/>`;
    const line = (id, x1, y1, x2, y2, col, label, lx, ly, anchor) =>
      `<g data-pick="${id}"><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${col}" stroke-width="3"/><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="transparent" stroke-width="18"/><rect x="${X(lx) - label.length * 3.4 - 6}" y="${Y(ly) - 11}" width="${label.length * 6.8 + 12}" height="22" rx="8" fill="var(--panel)" stroke="${col}" stroke-width="2"/>${tx(X(lx), Y(ly) + 4, label, { sz: 12, c: col })}</g>`;
    o += line("oven", 0, 7, 7, 0, "var(--blue)", "Oven hours: x + y ≤ 7", 6.1, 0.9, "start");
    o += line("demx", 5, 0, 5, 7, "var(--violet)", "Demand for X: x ≤ 5", 5, 6.5, "start");
    o += line("demy", 0, 4, 8, 4, "var(--amber)", "Demand for Y: y ≤ 4", 1.5, 4, "start");
    o += line("flour", 0, 6, 8, 2, "var(--rose)", "Flour: x + 2y ≤ 12", 6.7, 2.65, "start");
    o += tx(X(1.2), Y(1.6), "feasible", { sz: 12, c: "var(--teal-ink)" });
    return svg(w, h, o, true);
  })();
  const tableauFig = (() => {
    const cx = [40, 112, 164, 216, 268, 320, 372, 450],
      head = ["", "x", "y", "s₁", "s₂", "s₃", "s₄", "RHS"];
    const rows = [
      ["s₁", 2, 1, 1, 0, 0, 0, 10],
      ["s₂", 1, 1, 0, 1, 0, 0, 8],
      ["s₃", "−1", 1, 0, 0, 1, 0, 2],
      ["s₄", 1, 0, 0, 0, 0, 1, 6],
    ];
    let s = head
      .map((h, k) =>
        tx(cx[k], 20, h, { sz: 14, c: k === 1 ? "var(--amber-ink)" : "var(--text-dim)", f: "var(--mono)" }),
      )
      .join("");
    rows.forEach((r, i) => {
      const y = 32 + i * 36;
      s += `<g data-pick="r${i + 1}"><rect x="6" y="${y}" width="484" height="30" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${r.map((v, k) => tx(cx[k], y + 20, v, { sz: 15, f: "var(--mono)", c: k === 0 ? "var(--text-dim)" : "var(--text)" })).join("")}</g>`;
    });
    const zy = 32 + 4 * 36 + 4;
    s +=
      `<rect x="6" y="${zy}" width="484" height="30" rx="9" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/>` +
      ["z", "−4", "−3", 0, 0, 0, 0, 0]
        .map((v, k) =>
          tx(cx[k], zy + 20, v, { sz: 15, f: "var(--mono)", c: k === 0 ? "var(--text-dim)" : "var(--text)" }),
        )
        .join("");
    return svg(496, 214, s, true);
  })();

  B.add("a3-lp", [
    {
      type: "pick",
      q: "A diet plan <b>minimises</b> cost z = 3x + y, subject to x + y ≥ 4, x ≤ 5 and y ≤ 5, with x, y ≥ 0. Click the corner that gives the lowest cost.",
      fig: minFig,
      a: "0,4",
      hint: "Work out 3x + y at each corner. Cheap means small x, because x costs 3 per unit.",
      why: "Costs: (4, 0) = 12, (5, 0) = 15, (5, 5) = 20, (0, 5) = 5, (0, 4) = 4. The minimum is at <b>(0, 4)</b>. The origin would be cheapest of all, but it isn't feasible: it breaks x + y ≥ 4.",
    },
    {
      type: "pick",
      q: "A planner has three limits: x + y ≤ 8, x ≤ 6 and y ≤ 5 (all with x, y ≥ 0). Click every plan (point) that satisfies <b>all</b> of them.",
      fig: feasFig,
      a: ["A", "C", "E"],
      hint: "Read each point's coordinates from the axes, then test it against all three rules. A point exactly on a line still counts.",
      why: "A (2, 2) and E (1, 5) pass everything. C (6, 2) sits exactly on x = 6 and on x + y = 8, which is allowed with ≤. B (6, 3) and F (5, 4) both total 9, too much. D (3, 6) breaks y ≤ 5.",
    },
    {
      type: "cat",
      q: "Sort each linear program by the kind of outcome a solver reports.",
      buckets: ["One best corner", "A whole edge ties", "No answer"],
      items: [
        ["Maximise 2x + y subject to x + y ≤ 4, x, y ≥ 0", 0],
        ["Maximise x + y subject to x + y ≤ 4, x, y ≥ 0", 1],
        ["Minimise x + y subject to x + y ≥ 3, x, y ≥ 0", 1],
        ["Minimise x + y subject to x ≥ 1, y ≥ 1", 0],
        ["Maximise x + y subject to x ≥ 1, y ≥ 1", 2],
        ["Maximise x subject to x ≤ 2 and x ≥ 3", 2],
      ],
      why: "2x + y is best at (4, 0) alone (value 8). Whenever the objective line is parallel to a boundary edge, every point on that edge ties (x + y = 4, or x + y = 3). Minimising x + y with x, y ≥ 1 stops at (1, 1). Maximising it with only lower bounds can grow forever (unbounded), and x ≤ 2 with x ≥ 3 is impossible (infeasible).",
    },
    {
      type: "pick",
      q: "Simplex maximises z = 4x + 3y. The most negative entry in the z row is −4, so <b>x enters</b>. Click the row that must leave (the one that stops x rising first). Rows read as constraints, for example row s₁: 2x + y + s₁ = 10.",
      fig: tableauFig,
      a: "r1",
      hint: "For each row with a positive x entry, divide the right-hand side by it. The smallest ratio wins. A negative entry puts no limit on x.",
      why: "Ratios: s₁ gives 10 ÷ 2 = 5, s₂ gives 8 ÷ 1 = 8 and s₄ gives 6 ÷ 1 = 6. Row s₃ has −1 for x, so raising x only makes it looser: no limit. The smallest ratio, 5, belongs to s₁, so x can only rise to 5 before that constraint binds. Picking any other row would push s₁ negative (infeasible).",
    },
    {
      type: "pick",
      q: "Profit is z = 3x + 2y. Find the best corner of the shaded region, then click every constraint that is <b>binding</b> there (the ones that stop profit rising).",
      fig: bindFig,
      a: ["demx", "oven"],
      hint: "Corners: (5, 0), (5, 2), (3, 4), (0, 4). Work out z at each one.",
      why: "z at the corners: (5, 0) = 15, (5, 2) = 19, (3, 4) = 17, (0, 4) = 8. The best is (5, 2), where x = 5 and x + y = 7 meet: demand for X and the oven are binding. The flour line is never even touched by the region, and the y ≤ 4 line is not reached at (5, 2), so both have slack.",
    },
    {
      type: "bug",
      q: "This brute-force solver maximises c·(x, y) over every point where two constraint lines cross, yet it sometimes returns a plan that breaks a constraint. Click the faulty line.",
      code: [
        "def best_corner(lines, c):",
        '    best, best_z = None, float("-inf")',
        "    for (x, y) in intersections(lines):",
        "        z = c[0] * x + c[1] * y",
        "        if z > best_z:",
        "            best, best_z = (x, y), z",
        "    return best",
      ],
      a: 4,
      why: "Crossing points of constraint lines are only <i>candidates</i>. Many lie outside the feasible region. The test must be <code>if feasible(x, y, lines) and z &gt; best_z:</code>, so only genuine corners compete.",
    },
  ]);
})();

/* ===== bank-v-algo-2.js ===== */
/* ALGO revision bank, visual and varied questions, part 2.
   Modules: a3-simplex, a3-bracket, a3-nm, a4-cut, a4-mst, a5-orient, a5-wrap, a5-graham.
   Figures are inline SVG built here; every number was checked against a script that runs the real algorithm. */
(function () {
  const B = NIC.bank;
  const txt = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tail = (s, extra) => s.replace(/<\/svg>$/, extra + "</svg>");
  const uid = () => "m" + Math.random().toString(36).slice(2, 7);
  /* a maths plane (y up) with a light grid. Returns X, Y mappers and the grid markup */
  function plane(xmax, ymax, w, h) {
    const x0 = 44,
      y0 = h - 26,
      X = (x) => x0 + (x * (w - x0 - 12)) / xmax,
      Y = (y) => y0 - (y * (y0 - 12)) / ymax;
    let g = "";
    for (let i = 0; i <= xmax; i++)
      g +=
        `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(ymax)}" stroke="var(--line)"/>` +
        txt(X(i), Y(0) + 16, i, { w: 700, s: 11, c: "var(--text-faint)" });
    for (let j = 0; j <= ymax; j++)
      g +=
        `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(xmax)}" y2="${Y(j)}" stroke="var(--line)"/>` +
        txt(X(0) - 14, Y(j) + 4, j, { a: "end", w: 700, s: 11, c: "var(--text-faint)" });
    return { X, Y, g };
  }
  const dot = (cx, cy, label, o = {}) =>
    `<g ${o.id ? `data-pick="${o.id}"` : ""}><circle cx="${cx}" cy="${cy}" r="${o.r || 11}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="3" ${o.dash ? 'stroke-dasharray="4 3"' : ""}/>${txt(cx, cy + 4, label, { s: o.s || 12, c: o.tc || "var(--ink)", w: 900 })}</g>`;
  const chip = (s, c) =>
    `<span style="display:inline-block;border:2px solid var(--line);border-radius:10px;padding:2px 9px;margin:2px 3px 2px 0;font-weight:800;background:var(--panel)">${s}${c !== undefined ? ` <span style="color:var(--amber-ink)">${c}</span>` : ""}</span>`;
  const G = NIC.qfig.graph;

  /* ---------- shared figures ---------- */
  // LP: maximise with x + y <= 7, x <= 4, y <= 5. Corners O A B C D.
  function region(opts = {}) {
    const X = (x) => 44 + x * 50,
      Y = (y) => 244 - y * 36;
    const P = { O: [0, 0], A: [4, 0], B: [4, 3], C: [2, 5], D: [0, 5] };
    let s = "";
    for (let i = 0; i <= 6; i++)
      s +=
        `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(6)}" stroke="var(--line)"/>` +
        txt(X(i), Y(0) + 16, i, { w: 700, s: 11, c: "var(--text-faint)" });
    for (let j = 0; j <= 6; j++)
      s +=
        `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(6)}" y2="${Y(j)}" stroke="var(--line)"/>` +
        txt(X(0) - 9, Y(j) + 4, j, { a: "end", w: 700, s: 11, c: "var(--text-faint)" });
    s += `<polygon points="${Object.values(P)
      .map(([x, y]) => `${X(x)},${Y(y)}`)
      .join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>`;
    s +=
      txt(X(4) + 10, Y(5.75), "x ≤ 4", { a: "start", c: "var(--blue-ink)" }) +
      txt(X(4.2), Y(4.2), "x + y ≤ 7", { a: "start", c: "var(--blue-ink)" }) +
      txt(X(4.15), Y(5) + 4, "y ≤ 5", { a: "start", c: "var(--blue-ink)" });
    s +=
      txt(X(6) + 14, Y(0) + 4, "x", { a: "start", c: "var(--text-dim)" }) +
      txt(X(0) + 8, Y(6) - 2, "y", { a: "start", c: "var(--text-dim)" });
    s += Object.entries(P)
      .map(([k, [x, y]]) => dot(X(x), Y(y), k, { id: opts.pick ? k : "", r: 13, s: 13 }))
      .join("");
    return svg(400, 262, s);
  }

  // ladder graph used by the MST questions
  const LN = { A: [60, 50], B: [200, 50], C: [340, 50], D: [60, 200], E: [200, 200], F: [340, 200] };
  const LE = [
    ["A", "B", 3],
    ["B", "C", 2],
    ["A", "D", 1],
    ["B", "E", 6],
    ["C", "F", 4],
    ["D", "E", 5],
    ["E", "F", 7],
  ];
  // graph used by the cut / cycle questions
  const CN = { A: [60, 50], B: [60, 230], C: [160, 120], D: [310, 60], E: [310, 200], F: [410, 130] };
  const CE = [
    ["A", "B", 4],
    ["A", "C", 2],
    ["B", "C", 5],
    ["B", "D", 7],
    ["C", "D", 3],
    ["C", "E", 8],
    ["D", "E", 6],
    ["D", "F", 9],
    ["E", "F", 1],
  ];

  /* =====================================================================
     a3-simplex
     ===================================================================== */
  B.add("a3-simplex", [
    {
      type: "pick",
      q: "Maximise z = 4x + 3y subject to the three limits drawn, with x, y ≥ 0. Simplex starts at O, and Dantzig's rule picks x to enter (4 beats 3). Click the corner where this first pivot stops.",
      fig: region({ pick: true }),
      a: "A",
      why: "Raise x with y fixed at 0. The limit x ≤ 4 stops it at x = 4, while x + y ≤ 7 would only stop it at x = 7. The smallest limit wins, so simplex lands on A (4, 0) and z becomes 16.",
    },
    {
      type: "pick",
      q: "Same feasible region, but the objective changes to z = x + 5y, so one step up now earns five times what one step right earns. Click the corner that is now optimal.",
      fig: region({ pick: true }),
      a: "C",
      hint: "Work out x + 5y at the corners that are high up: B is 4 + 15, C is 2 + 25, D is 0 + 25.",
      why: "Corner values are O = 0, A = 4, B = 19, C = 27, D = 25. When y is worth more, the best corner tilts towards the top, and C (2, 5) wins. The region did not change, only the direction of gain.",
    },
    {
      type: "cat",
      q: "Each card is the state of a simplex tableau (maximising). Decide what simplex does next.",
      buckets: ["Pivot again", "Stop: optimal", "Stop: unbounded"],
      items: [
        ["Gain row: x is +3, y is 0, slack is −1. The x column has positive entries in the constraint rows.", 0],
        ["Gain row: x is 0, y is −2, slack is −1.", 1],
        ["Gain row: y is +2, but y's column holds only 0 and negative entries in every constraint row.", 2],
        ["Gain row: x is +1, y is +4. Both columns have positive entries.", 0],
        ["Gain row: every entry is −3, −1 or 0.", 1],
        ["Gain row: slack is +5, and its column is −1, 0 and −3 in the constraint rows.", 2],
      ],
      why: "A positive gain with a positive entry to divide by means there is a direction to improve and a wall to stop at: pivot. No positive gain means no edge improves: optimal. A positive gain with no wall (no positive entries, so the ratio test has nothing to stop it) means z can grow forever: unbounded.",
    },
    {
      type: "pick",
      q: "Four constraint rows are shown, and x has just been chosen to enter. Click the row that leaves the basis, using the ratio test.",
      fig: svg(
        420,
        250,
        txt(40, 24, "Row", { c: "var(--text-dim)" }) +
          txt(150, 24, "x", { c: "var(--amber-ink)", s: 15 }) +
          txt(230, 24, "y", { c: "var(--text-dim)" }) +
          txt(340, 24, "right-hand side", { c: "var(--text-dim)" }) +
          [
            ["s1", 2, 1, 12],
            ["s2", -1, 2, 2],
            ["s3", 3, 1, 9],
            ["s4", 0, 1, 8],
          ]
            .map(
              ([r, a, b, c], i) =>
                `<g data-pick="${r}"><rect x="10" y="${34 + i * 38}" width="400" height="32" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(40, 55 + i * 38, r, { c: "var(--ink)" })}${txt(150, 55 + i * 38, a, { c: "var(--ink)" })}${txt(230, 55 + i * 38, b, { c: "var(--ink)" })}${txt(340, 55 + i * 38, c, { c: "var(--ink)" })}</g>`,
            )
            .join("") +
          txt(40, 214, "Gain", { c: "var(--amber-ink)" }) +
          txt(150, 214, "5", { c: "var(--amber-ink)" }) +
          txt(230, 214, "4", { c: "var(--amber-ink)" }) +
          txt(210, 238, "(slack columns left out to save space)", { s: 11, w: 700, c: "var(--text-faint)" }),
      ),
      a: "s3",
      hint: "Only rows with a positive number in the x column count. Divide right-hand side by that number: 12 ÷ 2 and 9 ÷ 3.",
      why: "s1 allows 12 ÷ 2 = 6 and s3 allows 9 ÷ 3 = 3. Row s2 has −1 in x's column, so raising x never hits that wall (it only moves further away), and s4 has 0, so it does not limit x either. The smallest valid ratio is s3's 3, so s3 leaves. The smallest right-hand side (s2's 2) is the tempting wrong answer.",
    },
    {
      type: "order",
      q: "Put one simplex pivot into the right order.",
      items: [
        "Read the gain row and choose the entering variable (largest positive gain)",
        "Divide each right-hand side by that column's positive entries",
        "The row with the smallest ratio is the leaving variable",
        "Row-reduce so the entering column becomes a single 1 in the leaving row",
        "Read the new gain row and stop if no entry is positive",
      ],
      why: "The entering variable fixes the column, the ratio test fixes the row, the row reduction moves to the new corner, and the new gain row tells you whether to go round again.",
    },
    {
      type: "bug",
      q: "pick_entering() chooses the entering variable for a maximisation problem. simplex_done() should return True only at the optimum. Click the faulty line.",
      code: [
        "def pick_entering(gain):",
        "    best = None",
        "    for j in range(len(gain)):",
        "        if gain[j] > 0 and (best is None or gain[j] > gain[best]):",
        "            best = j",
        "    return best",
        "def simplex_done(gain):",
        "    return all(g >= 0 for g in gain)",
      ],
      a: 7,
      why: "At the optimum no entry in the gain row is positive, so the test must be g <= 0. As written it would say 'done' when every gain is positive, which is exactly when there is the most room to improve z.",
    },
  ]);

  /* =====================================================================
     a3-bracket
     ===================================================================== */
  const BX = (x) => 40 + x * 440;
  const bi = (x) => 1 - 0.55 * Math.exp(-(((x - 0.25) / 0.15) ** 2)) - 0.9 * Math.exp(-(((x - 0.88) / 0.1) ** 2));
  const biY = (v) => 190 - (v - 0.05) * 150;
  const biPath = Array.from(
    { length: 101 },
    (_, i) => `${i ? "L" : "M"}${BX(i / 100).toFixed(1)} ${biY(bi(i / 100)).toFixed(1)}`,
  ).join(" ");
  B.add("a3-bracket", [
    {
      type: "pick",
      q: "Golden-section search is minimising an unimodal function on [a, b]. All it knows are the two probe values shown. Click the piece of the bracket it throws away.",
      fig: svg(
        520,
        170,
        `<line x1="${BX(0)}" y1="112" x2="${BX(1)}" y2="112" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>` +
          [
            ["L", 0, 0.382, "[a, c]"],
            ["M", 0.382, 0.618, "[c, d]"],
            ["R", 0.618, 1, "[d, b]"],
          ]
            .map(
              ([id, x1, x2, l]) =>
                `<g data-pick="${id}"><rect x="${BX(x1) + 2}" y="76" width="${BX(x2) - BX(x1) - 4}" height="68" rx="8" fill="var(--bg-2)" fill-opacity=".5" stroke="var(--line-2)" stroke-width="2" stroke-dasharray="5 4"/>${txt((BX(x1) + BX(x2)) / 2, 136, l, { c: "var(--text-dim)" })}</g>`,
            )
            .join("") +
          [
            ["a", 0],
            ["c", 0.382],
            ["d", 0.618],
            ["b", 1],
          ]
            .map(
              ([l, x]) =>
                `<circle cx="${BX(x)}" cy="112" r="6" fill="var(--blue)"/>${txt(BX(x), 162, l, { s: 14, c: "var(--ink)" })}`,
            )
            .join("") +
          `<rect x="${BX(0.382) - 46}" y="14" width="92" height="30" rx="9" fill="var(--panel)" stroke="var(--blue)" stroke-width="2"/>${txt(BX(0.382), 34, "f(c) = 2.9", { c: "var(--blue-ink)" })}` +
          `<rect x="${BX(0.618) - 46}" y="14" width="92" height="30" rx="9" fill="var(--panel)" stroke="var(--blue)" stroke-width="2"/>${txt(BX(0.618), 34, "f(d) = 2.1", { c: "var(--blue-ink)" })}`,
      ),
      a: "L",
      why: "f(d) is lower than f(c). An unimodal function that is already lower at d than at c must still be heading downhill beyond c, so the minimum cannot lie left of c. The search discards [a, c] and keeps [c, b], with d inside it.",
    },
    {
      type: "pick",
      q: "This function has TWO dips, so it is not unimodal. Golden-section search on [0, 1] probes at c and d with the values marked. Click the dip it will end up trapped in.",
      fig: svg(
        520,
        230,
        `<path d="${biPath}" fill="none" stroke="var(--teal)" stroke-width="3"/>` +
          [
            ["c", 0.382],
            ["d", 0.618],
          ]
            .map(
              ([l, x]) =>
                `<line x1="${BX(x)}" y1="30" x2="${BX(x)}" y2="200" stroke="var(--line-2)" stroke-dasharray="4 4"/><circle cx="${BX(x)}" cy="${biY(bi(x))}" r="6" fill="var(--blue)"/>` +
                txt(BX(x), 22, l, { s: 14, c: "var(--ink)" }),
            )
            .join("") +
          txt(BX(0.382) - 8, biY(bi(0.382)) - 12, "f(c) = 0.75", { a: "end", c: "var(--blue-ink)" }) +
          txt(BX(0.618) + 8, biY(bi(0.618)) - 12, "f(d) = 1.00", { a: "start", c: "var(--blue-ink)" }) +
          `<g data-pick="left"><circle cx="${BX(0.25)}" cy="${biY(bi(0.25)) + 4}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(BX(0.25), biY(bi(0.25)) + 8, "left", { s: 11, c: "var(--ink)", w: 900 })}</g>` +
          `<g data-pick="right"><circle cx="${BX(0.88)}" cy="${biY(bi(0.88)) - 4}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(BX(0.88), biY(bi(0.88)), "right", { s: 11, c: "var(--ink)", w: 900 })}</g>` +
          txt(BX(0), 218, "a = 0", { c: "var(--text-dim)" }) +
          txt(BX(1), 218, "b = 1", { c: "var(--text-dim)" }),
      ),
      a: "left",
      why: "f(c) is lower than f(d), so the search keeps [a, d] = [0, 0.618] and throws away the right-hand end, which is where the deeper dip is. Every later step shrinks inside that bracket, so it settles in the shallow left dip. The method only compares two numbers, so it cannot see a dip it has discarded. That is why it needs one dip only.",
    },
    {
      type: "order",
      q: "Put one golden-section step in order.",
      items: [
        "Place two interior probes at 38.2% and 61.8% of the bracket",
        "Compare the two function values",
        "Discard the outer piece beyond the worse probe",
        "Keep the surviving probe, which is already in a golden position of the new bracket",
        "Evaluate f at just one new probe",
        "Repeat until the bracket is narrower than the tolerance",
      ],
      why: "Comparing the probes decides which end to cut. Because of the golden ratio the surviving probe is reused, so every step after the first needs just one new evaluation.",
    },
    {
      type: "bug",
      q: "This golden-section code minimises f on [a, b]. It sometimes returns a point that is clearly not the minimum. Click the faulty line.",
      code: [
        "def golden(f, a, b, tol):",
        "    while b - a > tol:",
        "        c = a + 0.382 * (b - a)",
        "        d = a + 0.618 * (b - a)",
        "        if f(c) < f(d):",
        "            b = d",
        "        else:",
        "            a = d",
        "    return (a + b) / 2",
      ],
      a: 7,
      why: "If f(c) is not lower than f(d), the minimum cannot be left of c, so the new bracket is [c, b]. Writing a = d also throws away the stretch between c and d, which can hold the minimum. The line should be a = c.",
    },
    {
      type: "cat",
      q: "Probe values come back for c < d. Which piece does the search keep?",
      buckets: ["Keep [a, d] (left part)", "Keep [c, b] (right part)"],
      items: [
        ["Minimising: f(c) = 4, f(d) = 9", 0],
        ["Minimising: f(c) = 12, f(d) = 5", 1],
        ["Maximising: f(c) = 4, f(d) = 9", 1],
        ["Maximising: f(c) = 3.5, f(d) = 2.5", 0],
        ["Minimising: f(c) = 30, f(d) = 29", 1],
        ["Maximising: f(c) = 8, f(d) = 20", 1],
      ],
      why: "Minimising: keep the side of the lower probe. Maximising flips it: keep the side of the higher probe. Here the closeness of 30 and 29 doesn't matter, only which is lower.",
    },
    {
      type: "mcq",
      q: "A student's 'golden-section' code logs the bracket width after each step. What does the log suggest?",
      fig: `<div style="margin:6px 0">${["10", "7", "4.9", "3.43", "2.4"].map((w, i) => chip(`step ${i}: ${w}`)).join("")}</div>`,
      o: [
        "The probes sit near 30% and 70% of the bracket, not at 38.2% and 61.8%",
        "The function has two dips, so the bracket cannot shrink any faster",
        "The tolerance is too tight, which slows each step by a fixed amount",
        "One probe is reused each step, which cuts the shrink rate in half",
      ],
      a: 0,
      hint: "7 ÷ 10 = 0.7 and 4.9 ÷ 7 = 0.7. A golden run would multiply by about 0.62 each step.",
      why: "Every step multiplies the width by 0.7. With probes at 30% and 70% you keep 70% of the bracket, which is slower than golden section's 0.618 (10, 6.18, 3.82, 2.36 ...). The rate is set by where the probes are, not by the function or the tolerance.",
    },
  ]);

  /* =====================================================================
     a3-nm
     ===================================================================== */
  function nmPlane() {
    const p = plane(9, 8, 400, 290),
      { X, Y } = p;
    const T = { A: [1, 1, 29], B: [5, 1, 5], C: [3, 5, 13] };
    let s =
      p.g +
      `<polygon points="${Object.values(T)
        .map(([x, y]) => `${X(x)},${Y(y)}`)
        .join(" ")}" fill="var(--violet)" fill-opacity=".12" stroke="var(--violet)" stroke-width="2.5"/>`;
    s += Object.entries(T)
      .map(
        ([k, [x, y, v]]) =>
          dot(X(x), Y(y), k, { fill: "var(--violet)", stroke: "var(--violet)", tc: "#fff" }) +
          txt(X(x) + (k === "C" ? 16 : 0), Y(x === 3 ? y : y) + (k === "C" ? 5 : 30), `f = ${v}`, {
            a: k === "C" ? "start" : "middle",
            s: 12,
            c: "var(--violet-ink)",
          }),
      )
      .join("");
    s += [
      ["P", 7, 5],
      ["Q", 4, 3],
      ["R", 1, 5],
      ["S", 7, 1],
    ]
      .map(([k, x, y]) => dot(X(x), Y(y), k, { id: k, dash: true }))
      .join("");
    return svg(400, 290, s);
  }
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
  B.add("a5-orient", [
    {
      type: "pick",
      q: "You walk from A to B (the arrow), then look towards a point X. Click every point X for which A → B → X is a LEFT turn. (Y points up.)",
      fig: o1,
      a: ["1", "3", "5", "6"],
      hint: "A left turn means X lies on the left-hand side of the directed line through A and B, even beyond B or behind A.",
      why: "The sign of the cross product (B − A) × (X − A) tells which side of the directed line X is on: positive is left. Points 1, 3, 5 and 6 are above the line (cross products 18, 17, 6 and 12). The line carries on past both ends, so point 5 beyond B and point 6 behind A still count.",
    },
    {
      type: "pick",
      q: "A → B is fixed. The cross product (B − A) × (P − A) is bigger the further P lies to the left of the line. Click the point with the LARGEST cross product.",
      fig: o2,
      a: "2",
      why: "The cross product equals the length of A→B times P's signed distance from the line, so the largest value is the point furthest to the left. That is point 2 (cross product 32; the others are 23, 11, −9 and 10). Point 3 is furthest from A in a straight line, but it sits closer to the line itself. Quickhull relies on this to find the next hull point.",
    },
    {
      type: "pick",
      q: "You walk round this polygon in the order A, B, C, D, E, F and back to A, and the walk is counter-clockwise. On a convex polygon every turn would be a left turn. Click the corner where you turn RIGHT.",
      fig: o3,
      a: "D",
      why: "At D the path swings the wrong way: the cross product of C → D → E is −11, a right turn. That is the dent in the shape, so D could never be a corner of the convex hull. All the other corners give positive values (18, 8, 15, 19, 30).",
    },
    {
      type: "bug",
      q: "inside(poly, q) should say whether q is inside a convex polygon whose corners are listed counter-clockwise (y up). cross(a, b, q) is positive when a → b → q turns left. Click the faulty line.",
      code: [
        "def inside(poly, q):",
        "    for i in range(len(poly)):",
        "        a = poly[i]",
        "        b = poly[(i + 1) % len(poly)]",
        "        if cross(a, b, q) > 0:",
        "            return False",
        "    return True",
      ],
      a: 4,
      why: "Going counter-clockwise, the inside is on the left of every edge. So a RIGHT turn (negative) proves q is outside, and the test should be cross(a, b, q) < 0. The buggy version rejects every point that is properly inside.",
    },
    {
      type: "cat",
      q: "You walk on a map where y points up (north). Is the turn at the corner a left turn, a right turn or straight?",
      buckets: ["Left turn", "Right turn", "Straight (collinear)"],
      items: [
        ["East for 3 steps, then north for 2", 0],
        ["North for 3 steps, then east for 2", 1],
        ["West for 2 steps, then south for 4", 0],
        ["South for 3 steps, then west for 2", 1],
        ["East for 4 steps, then east for 2 more", 2],
        ["East for 3 steps, then straight back west for 1", 2],
      ],
      why: "Heading east, north is on your left. Heading north, east is on your right. Heading west, south is on your left. Heading south, west is on your right. Continuing the same way, or turning all the way back along the same line, gives cross product 0: collinear, which hull code has to handle deliberately.",
    },
    {
      type: "multi",
      q: "Three points P, Q, R are in counter-clockwise order, so P → Q → R is a left turn. Which of these orders of the same three points are ALSO left turns?",
      fig: o6,
      o: ["P → Q → R", "Q → R → P", "R → P → Q", "R → Q → P", "Q → P → R", "P → R → Q"],
      a: [0, 1, 2],
      why: "Starting the walk at a different corner of the same cycle (Q → R → P, R → P → Q) goes round the triangle the same way, so the turn stays left. Swapping any two points reverses the direction, so R → Q → P, Q → P → R and P → R → Q are right turns. The sign of the cross product flips when two points swap.",
    },
  ]);

  /* =====================================================================
     a5-wrap
     ===================================================================== */
  const w1 = (() => {
    const p = plane(10, 10, 420, 330),
      W = {
        A: [1, 4],
        B: [4, 1],
        C: [8, 2],
        D: [9, 6],
        E: [5, 9],
        F: [2, 8],
        G: [4, 5],
        H: [6, 4],
        I: [5, 3],
        J: [3, 6],
        K: [7, 6],
      };
    const id = uid();
    return svg(
      420,
      330,
      p.g +
        `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--teal)"/></marker></defs>` +
        `<line x1="${p.X(1) + 8}" y1="${p.Y(4) + 6}" x2="${p.X(4) - 10}" y2="${p.Y(1) - 8}" stroke="var(--teal)" stroke-width="4" marker-end="url(#${id})"/>` +
        Object.entries(W)
          .map(([k, [x, y]]) =>
            dot(p.X(x), p.Y(y), k, {
              id: k === "B" ? "" : k,
              fill: k === "B" ? "var(--blue)" : "var(--panel)",
              stroke: k === "B" ? "var(--blue)" : "var(--line-2)",
              tc: k === "B" ? "#fff" : "var(--ink)",
            }),
          )
          .join("") +
        txt(p.X(4) + 20, p.Y(1) + 22, "current", { a: "start", s: 12, c: "var(--blue-ink)" }),
    );
  })();
  B.add("a5-wrap", [
    {
      type: "pick",
      q: "Gift wrapping has just walked from A to B (green arrow) and B is now the current point. Click the point it picks next.",
      fig: w1,
      a: "C",
      hint: "The next point is the one with every other point on its left as you look from B. It is not simply the closest one.",
      why: "From B, point C is the one where nothing else lies to the right of B → C: it is the most clockwise direction from B. The closest point, I, is inside the hull. Gift wrapping tests every other point against its current best and keeps whichever lies furthest round, so interior points never win.",
    },
    {
      type: "cat",
      q: "There are 1,000 points in each case. Which algorithm does less work?",
      buckets: ["Gift wrapping wins", "Graham scan wins"],
      items: [
        ["All 1,000 points lie on a circle", 1],
        ["A dense cloud in the middle with just 4 outliers marking the corners", 0],
        ["All 1,000 points lie along a parabola, curving one way", 1],
        ["Almost all points are packed in a small blob, and only 3 stray points form a big triangle around it", 0],
        ["The hull has about 500 of the points", 1],
        ["Only 5 points are on the hull", 0],
      ],
      why: "Gift wrapping costs about n · h and Graham scan about n · log n (log₂ 1,000 is about 10). So wrapping wins when the hull has fewer than about 10 points, and Graham wins when the hull is large. It is the hull size, not n, that decides.",
    },
    {
      type: "order",
      q: "Put gift wrapping into order.",
      items: [
        "Start at the leftmost point, which must be on the hull",
        "From the current point, test every other point against the best candidate so far",
        "Keep the candidate that has all other points on its left",
        "Move to that candidate and record it as a hull point",
        "Stop when the walk returns to the starting point",
      ],
      why: "The leftmost point is guaranteed to be on the hull, so it is a safe start. Each wrapping step sweeps all n points, which is why the cost is n for every hull point found.",
    },
    {
      type: "bug",
      q: "wrap(pts) should return the hull counter-clockwise. turn(p, a, b) is positive for a left turn. Click the faulty line.",
      code: [
        "def wrap(pts):",
        "    start = min(pts)",
        "    hull, p = [], start",
        "    while True:",
        "        hull.append(p)",
        "        nxt = pts[0]",
        "        for q in pts:",
        "            if nxt == p or turn(p, nxt, q) > 0:",
        "                nxt = q",
        "        p = nxt",
        "        if p == start:",
        "            break",
        "    return hull",
      ],
      a: 7,
      why: "q should replace the candidate when q lies to the RIGHT of p → nxt, meaning the turn is negative, because the true next hull point has every other point on its left. With > 0 the code keeps picking the most counter-clockwise point, which is an interior point, and the walk cuts through the middle.",
    },
    {
      type: "slider",
      q: "There are 1,024 points. Gift wrapping costs about n × h, and Graham scan costs about n × log₂ n (log₂ 1,024 = 10). Gift wrapping only beats Graham when the hull has fewer than about how many points?",
      min: 0,
      max: 40,
      step: 1,
      ans: 10,
      tol: 2,
      unit: "hull points",
      why: "The n cancels: n × h < n × 10 when h < 10. So the crossover is at about 10 hull points. Wrapping is better with a small hull, Graham with a large one, which is why the best choice depends on the answer's size, not the input's.",
    },
  ]);

  /* =====================================================================
     a5-graham
     ===================================================================== */
  const g1 = (() => {
    const p = plane(10, 9, 420, 330),
      P0 = [1, 1],
      S = { A: [9, 3], B: [5, 4], C: [2, 2] };
    return svg(
      420,
      330,
      p.g +
        `<polyline points="${[P0, S.A, S.B, S.C].map(([x, y]) => `${p.X(x)},${p.Y(y)}`).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>` +
        `<line x1="${p.X(2)}" y1="${p.Y(2)}" x2="${p.X(5)}" y2="${p.Y(8)}" stroke="var(--amber)" stroke-width="3" stroke-dasharray="6 5"/>` +
        dot(p.X(1), p.Y(1), "P0", { fill: "var(--teal)", stroke: "var(--teal)", tc: "#fff", s: 11 }) +
        dot(p.X(9), p.Y(3), "A", { id: "A" }) +
        dot(p.X(5), p.Y(4), "B", { id: "B" }) +
        dot(p.X(2), p.Y(2), "C", { id: "C" }) +
        dot(p.X(5), p.Y(8), "D", { fill: "var(--amber)", stroke: "var(--amber)", tc: "#fff" }) +
        txt(p.X(5) + 18, p.Y(8) + 4, "next", { a: "start", c: "var(--amber-ink)" }) +
        txt(p.X(7.5), p.Y(1.3), "stack: P0, A, B, C", { c: "var(--teal-ink)", s: 12 }),
    );
  })();
  const g2 = (() => {
    const p = plane(10, 9, 420, 330),
      pts = { a: [8, 2, 1], b: [9, 4, 2], c: [7, 6, 3], d: [4, 5, 5], e: [2, 5, 4], f: [0, 6, 6] };
    return svg(
      420,
      330,
      p.g +
        Object.values(pts)
          .map(
            ([x, y]) =>
              `<line x1="${p.X(1)}" y1="${p.Y(1)}" x2="${p.X(x)}" y2="${p.Y(y)}" stroke="var(--line-2)" stroke-dasharray="3 4"/>`,
          )
          .join("") +
        dot(p.X(1), p.Y(1), "P0", { fill: "var(--teal)", stroke: "var(--teal)", tc: "#fff", s: 11 }) +
        Object.entries(pts)
          .map(([k, [x, y, n]]) => dot(p.X(x), p.Y(y), n, { id: k, s: 13 }))
          .join(""),
    );
  })();
  const log = ["push 1", "push 2", "push 3", "pop", "push 4", "push 5", "pop", "pop", "push 6"];
  B.add("a5-graham", [
    {
      type: "pick",
      q: "Graham scan's stack is P0, A, B, C (the green chain). The next point in angle order is D. Click every point that gets popped before D is pushed.",
      fig: g1,
      a: ["B", "C"],
      hint: "Test the top two stack points with D. If that is a right turn or straight, pop the top, then test again with the new top two.",
      why: "B → C → D is a right turn (cross product −12), so C is popped. Now A → B → D is also a right turn (−16), so B is popped. Then P0 → A → D is a left turn (48), so A stays and D is pushed. Pops can cascade, yet each point is popped at most once, which keeps the whole scan linear.",
    },
    {
      type: "pick",
      q: "A student sorted the points by angle round the anchor P0 and numbered them 1 to 6. The numbers on two points were swapped by mistake. Click both of them.",
      fig: g2,
      a: ["d", "e"],
      why: "Sweeping counter-clockwise from the right, the dotted lines reach the point at (4, 5) (angle about 53°) before the point at (2, 5) (about 76°). So the labels 5 and 4 on those two points should read 4 and 5. If the sort is wrong, the stack's left-turn test no longer matches the boundary order and the scan gives a wrong hull.",
    },
    {
      type: "cat",
      q: "The stack's top two points are shown, then the next point arrives. Does the scan pop the top point, or push straight away?",
      buckets: ["Pop the top point", "Keep it and push"],
      items: [
        ["Top two: (1, 1), (5, 1). Next: (7, 4)", 1],
        ["Top two: (1, 1), (5, 2). Next: (8, 1)", 0],
        ["Top two: (2, 2), (4, 4). Next: (7, 7)", 0],
        ["Top two: (3, 1), (6, 3). Next: (6, 7)", 1],
        ["Top two: (2, 1), (5, 5). Next: (7, 5)", 0],
        ["Top two: (8, 2), (6, 6). Next: (3, 5)", 1],
      ],
      hint: "Left turn: keep. Right turn or straight: pop. For (a, b, c) compute (b − a) × (c − a).",
      why: "A left turn means the stack is still convex, so the point is pushed. A right turn means the top point is a dent and is popped. The (2, 2), (4, 4), (7, 7) case is straight, so the middle point is popped too: it lies on an edge, not at a corner.",
    },
    {
      type: "bug",
      q: "This Graham scan keeps points on the stack while the boundary turns the right way. Click the faulty line.",
      code: [
        "def graham(pts):",
        "    p0 = min(pts, key=lambda p: (p[1], p[0]))",
        "    rest = sorted((p for p in pts if p != p0), key=lambda p: angle(p0, p))",
        "    stack = [p0]",
        "    for p in rest:",
        "        while len(stack) >= 2 and turn(stack[-2], stack[-1], p) > 0:",
        "            stack.pop()",
        "        stack.append(p)",
        "    return stack",
      ],
      a: 5,
      why: "turn() is positive for a left turn, and a left turn is the GOOD case: the top point stays. The scan should pop when the turn is right or straight, which is turn(...) <= 0. As written it throws away every proper corner and keeps the dents.",
    },
    {
      type: "slider",
      q: "Graham scan has already sorted 300 points and starts the scan. At most how many stack operations (pushes plus pops) can the whole scan perform?",
      min: 0,
      max: 1200,
      step: 50,
      ans: 600,
      tol: 100,
      unit: "operations",
      why: "Every point is pushed exactly once and popped at most once, so there are at most 300 + 300 = 600 operations. The inner while loop looks as if it could make the scan quadratic, but the pops are paid for by earlier pushes. That is why the scan is O(n) and the sort's O(n log n) dominates.",
    },
    {
      type: "mcq",
      q: "The input has 7 points including the anchor, and the anchor is pushed first. The rest of the scan's log is shown. How many of the 7 points end on the hull?",
      fig: `<div style="margin:6px 0">${log.map((l, i) => chip(`${i + 1}. ${l}`)).join("")}</div>`,
      o: ["3", "4", "5", "6"],
      a: 1,
      hint: "Pushes in total (plus the anchor) minus pops. Count them from the log.",
      why: "Six pushes plus the anchor makes 7 pushes in total, and the log has 3 pops, so 7 − 3 = 4 points remain on the stack. The three popped points were dents. The anchor, 1 and 2 plus the final 6th pushed point are the hull corners.",
    },
  ]);
})();

/* ===== bank-v-algo-3.js ===== */
/* ALGO revision bank, visual and varied questions, part 3. Numbers computed by running the real algorithms in node. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG helpers (CSS variables so both themes work) ---------- */
  const SVG = (w, h, inner, label) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto" role="img" aria-label="${label}">${inner}</svg>`;
  const TX = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" fill="${o.f || "var(--text)"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "ui-monospace,Consolas,monospace" : "var(--sans)"}${o.ls ? `;letter-spacing:${o.ls}px` : ""}">${s}</text>`;
  const RC = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r == null ? 8 : o.r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const LN = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const bitCell = (x, y, v, o = {}) =>
    RC(x, y, o.w || 26, o.h || 30, { f: o.f, fo: o.fo, k: o.k, w: o.sw || 2, r: 6 }) +
    TX(x + (o.w || 26) / 2, y + (o.h || 30) / 2 + 5, v, { m: 1, s: 15, f: o.tf });
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });

  /* ==================== a6-crc ==================== */
  // 2D parity grid, one bit flipped; failing row/column checks marked
  const parityFig = (() => {
    const data = [
      [1, 0, 1, 1],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 0],
    ];
    const g = data.map((r) => [...r, r.reduce((s, x) => s + x) % 2]);
    g.push([0, 1, 2, 3, 4].map((c) => g.reduce((s, r) => s + r[c], 0) % 2));
    const got = g.map((r) => r.slice());
    got[2][1] ^= 1; // the flipped bit: row 2, column 1
    const rowBad = got.map((r) => r.reduce((s, x) => s + x) % 2 === 1);
    const colBad = [0, 1, 2, 3, 4].map((c) => got.reduce((s, r) => s + r[c], 0) % 2 === 1);
    let s = "";
    const X0 = 50,
      Y0 = 34,
      W = 44,
      H = 40;
    ["c1", "c2", "c3", "c4", "par"].forEach(
      (t, c) => (s += TX(X0 + c * W + W / 2, 22, t, { s: 12, f: "var(--text-2, var(--text))" })),
    );
    got.forEach((r, i) => {
      s += TX(X0 - 8, Y0 + i * H + H / 2 + 5, i < 4 ? "r" + (i + 1) : "par", { a: "end", s: 12 });
      r.forEach((v, c) => {
        const x = X0 + c * W,
          y = Y0 + i * H;
        const par = i === 4 || c === 4;
        s += PK(
          `r${i}c${c}`,
          RC(x + 2, y + 2, W - 4, H - 4, { f: par ? "var(--bg-2)" : "var(--panel)", r: 6 }) +
            TX(x + W / 2, y + H / 2 + 5, v, { m: 1, s: 16 }),
        );
      });
      s += rowBad[i] ? `<circle cx="${X0 + 5 * W + 18}" cy="${Y0 + i * H + H / 2}" r="8" fill="var(--rose)"/>` : "";
    });
    colBad.forEach((b, c) => {
      if (b) s += `<circle cx="${X0 + c * W + W / 2}" cy="${Y0 + 5 * H + 16}" r="8" fill="var(--rose)"/>`;
    });
    s +=
      `<circle cx="${X0 + 6}" cy="276" r="7" fill="var(--rose)"/>` +
      TX(X0 + 20, 281, "red dot = this check fails", { a: "start", s: 12 });
    return SVG(330, 292, s, "A 4 by 4 grid of bits with a parity row and column; red dots mark the failing checks");
  })();

  const crcRows = [
    ["11010000", "10110000", "01100000"],
    ["01100000", "01011000", "00111000"],
    ["00111000", "00101100", "00011100"],
    ["00011100", "00010110", "00001010"],
  ];
  const crcFig = (() => {
    let s = TX(200, 20, "Message 11010, generator 1011, three zeros appended", { s: 13 });
    s += TX(60, 46, "was", { s: 12 }) + TX(170, 46, "XOR generator", { s: 12 }) + TX(305, 46, "gives", { s: 12 });
    crcRows.forEach(([a, b, c], i) => {
      const y = 56 + i * 48;
      s += PK(
        `r${i + 1}`,
        RC(6, y, 388, 40, { r: 10 }) +
          TX(26, y + 26, i + 1, { s: 13 }) +
          TX(86, y + 26, a, { m: 1, s: 15, ls: 1 }) +
          TX(200, y + 26, b, { m: 1, s: 15, ls: 1 }) +
          TX(318, y + 26, c, { m: 1, s: 15, ls: 1 }),
      );
    });
    return SVG(400, 256, s, "Four lines of CRC long-division working");
  })();

  B.add("a6-crc", [
    {
      type: "multi",
      q: "A receiver accepts a frame when its remainder after dividing by the generator 1011 is 000. Noise XORs an error pattern E onto a frame that was valid. Which patterns would slip through unnoticed? Select all that apply.",
      fig: SVG(
        400,
        120,
        TX(200, 20, "Sent frame (valid, remainder 000)", { s: 13 }) +
          [..."1101001"].map((b, i) => bitCell(66 + i * 36, 30, b, { w: 32 })).join("") +
          TX(34, 52, "sent", { s: 12 }) +
          [..."0000100"]
            .map((b, i) =>
              bitCell(66 + i * 36, 70, b, {
                w: 32,
                f: b === "1" ? "var(--rose)" : "var(--panel)",
                fo: b === "1" ? ".3" : "1",
              }),
            )
            .join("") +
          TX(34, 92, "E", { s: 12 }) +
          TX(200, 112, "Example E = 0000100 leaves remainder 100, so it is caught", { s: 12 }),
        "A valid frame and an example error pattern",
      ),
      o: ["E = 0000100", "E = 0001011", "E = 0010110", "E = 0000110", "E = 1011000"],
      a: [1, 2, 4],
      hint: "Dividing the corrupted frame leaves the same remainder as dividing E alone. Which E are exact multiples of 1011 (1011 shifted left by 0, 1 or 3 places)?",
      why: "The valid frame leaves remainder 0, so the corrupted frame leaves the remainder of E alone. E = 0001011 is 1011 itself, 0010110 is 1011 shifted by one and 1011000 is shifted by three: all divide exactly, so the receiver sees 000 and accepts. 0000100 leaves 100 and 0000110 leaves 110, so both are caught.",
    },
    {
      type: "pick",
      q: "A student works out a CRC by hand: generator 1011, message 11010, three zeros appended. Each line should be the previous result XOR the generator lined up under its leading 1. Tap the first line where the XOR goes wrong.",
      fig: crcFig,
      a: "r3",
      why: "Line 3 should be 00111000 XOR 00101100 = 00010100. The student wrote 00011100, so one bit is wrong. Lines 1, 2 and 4 are correct XORs of what is above them, which is why the error is easy to miss if you only check the final remainder.",
    },
    {
      type: "bug",
      q: "This function should compute a CRC remainder with long division, where every step is an XOR (no carries). Click the faulty line.",
      code: [
        "def crc_rem(msg, gen):",
        "    n = len(gen) - 1",
        "    bits = [int(b) for b in msg + '0' * n]",
        "    for i in range(len(msg)):",
        "        if bits[i] == 1:",
        "            for j in range(len(gen)):",
        "                bits[i + j] = bits[i + j] + int(gen[j])",
        "    return bits[-n:]",
      ],
      a: 6,
      why: "In mod-2 arithmetic the subtraction step is XOR. Adding produces 2s and carries, so the bits are no longer 0 or 1 and the remainder is garbage. The line should read bits[i + j] ^= int(gen[j]).",
    },
    {
      type: "order",
      q: "Put the steps of a CRC round trip in order.",
      items: [
        "Sender appends as many zeros as the generator's degree",
        "Sender divides by the generator using XOR long division",
        "Sender swaps the appended zeros for the remainder",
        "Frame travels across the noisy link",
        "Receiver divides the whole frame by the same generator",
        "A remainder of zero means accept; anything else means corrupted",
      ],
      why: "The zeros make room for the remainder, and replacing them makes the whole frame an exact multiple of the generator. The receiver therefore expects a remainder of zero.",
    },
    {
      type: "pick",
      q: "Every row and every column of this grid should hold an even number of 1s, including the parity row and parity column. Exactly one bit flipped in transit, and the failing checks are marked with red dots. Tap the flipped bit.",
      fig: parityFig,
      a: "r2c1",
      hint: "The bad bit sits where the failing row and the failing column cross.",
      why: "Row 3 and column 2 are the only failing checks. A single flipped bit breaks exactly one row and one column, so their crossing (row 3, column 2) must be the culprit. Flipping it back makes every check pass.",
    },
  ]);

  /* ==================== a6-hamming ==================== */
  const hamFig = (() => {
    const v = [1, 1, 1, 1, 1, 1, 0],
      lab = ["p1", "p2", "d3", "p4", "d5", "d6", "d7"];
    let s = TX(190, 18, "Received word (positions 1 to 7)", { s: 13 });
    v.forEach((b, i) => {
      const x = 12 + i * 48;
      s +=
        TX(x + 22, 46, lab[i], { s: 12 }) +
        PK(String(i + 1), RC(x, 54, 44, 44, { r: 8 }) + TX(x + 22, 83, b, { m: 1, s: 18 })) +
        TX(x + 22, 116, i + 1, { s: 12 });
    });
    s +=
      TX(12, 148, "p1 checks positions 1, 3, 5, 7", { a: "start", s: 13 }) +
      TX(12, 170, "p2 checks positions 2, 3, 6, 7", { a: "start", s: 13 }) +
      TX(12, 192, "p4 checks positions 4, 5, 6, 7", { a: "start", s: 13 }) +
      TX(12, 214, "Even parity: each group should hold an even number of 1s", {
        a: "start",
        s: 12,
        f: "var(--text-2, var(--text))",
      });
    return SVG(360, 226, s, "A received 7-bit Hamming word with the three parity groups listed");
  })();

  B.add("a6-hamming", [
    {
      type: "cat",
      q: "Hamming(7,4) always applies the single-error fix: flip the bit its syndrome names. After that fix, is the 4-bit data right or wrong in each case?",
      buckets: ["Data comes out right", "Data comes out wrong"],
      items: [
        ["No bits flipped", 0],
        ["One data bit flipped", 0],
        ["One parity bit flipped", 0],
        ["Two bits flipped", 1],
        ["Three bits flipped", 1],
      ],
      why: "With zero or one flip the syndrome is 000 or names the broken bit, so the fix gives back the sent word. With two flips the syndrome points at a third, innocent bit, and with three it either shows 000 or names another innocent bit. Either way the result is a different valid codeword with the wrong data.",
    },
    {
      type: "bug",
      q: "This Hamming(7,4) encoder puts the data bits in positions 3, 5, 6 and 7. One parity bit is computed from the wrong group. Click the faulty line.",
      code: [
        "def encode(d):  # d = [d3, d5, d6, d7]",
        "    c = [0] * 8  # use c[1] to c[7]",
        "    c[3], c[5], c[6], c[7] = d",
        "    c[1] = c[3] ^ c[5] ^ c[7]",
        "    c[2] = c[3] ^ c[6] ^ c[7]",
        "    c[4] = c[3] ^ c[5] ^ c[6]",
        "    return c[1:]",
      ],
      a: 5,
      why: "p4 covers positions 4, 5, 6 and 7 (the ones with a 1 in the front binary digit), so it should be c[5] ^ c[6] ^ c[7]. The buggy line uses position 3 instead of 7, so single errors at 3 or 7 would give the wrong syndrome.",
    },
    {
      type: "pick",
      q: "Two bits flipped in transit, so Hamming(7,4) cannot know that. The receiver checks the three groups, reads the syndrome and flips the position it names. Which bit does it flip? Tap it.",
      fig: hamFig,
      a: "7",
      hint: "Count the 1s in each group. A group with an odd count fails. Read the failures as p4 p2 p1.",
      why: "All three groups hold three 1s, an odd count, so all three fail: syndrome 111 = position 7. But the real flips were at positions 2 and 5. The receiver changes bit 7, which was fine, so the word ends up with three wrong bits.",
    },
    {
      type: "order",
      q: "Put the receiver's steps in order for a Hamming(7,4) word.",
      items: [
        "Recompute the parity of the p1, p2 and p4 groups",
        "Write the failures as a binary number p4 p2 p1 (the syndrome)",
        "If the syndrome is not 000, flip the bit at that position",
        "Read the data bits from positions 3, 5, 6 and 7",
      ],
      why: "The syndrome has to be computed before it can be used, and the data is only read after the repair.",
    },
    M(
      'A syndrome with r bits can name 2^r different outcomes. It must say either "no error" or which one of the n positions is wrong. What is the smallest r that works for a 31-bit codeword?',
      ["4", "5", "6", "7"],
      1,
      "One outcome for no error plus 31 positions is 32 outcomes, and 2^5 = 32 exactly. That is why Hamming(31,26) uses 5 parity bits. With r = 4 there are only 16 outcomes.",
      {
        fig: SVG(
          300,
          136,
          TX(150, 20, "r parity bits can name 2^r outcomes", { s: 13 }) +
            [
              ["r = 3", "8"],
              ["r = 4", "16"],
              ["r = 5", "32"],
              ["r = 6", "64"],
            ]
              .map(
                ([a, b], i) =>
                  RC(30, 32 + i * 26, 240, 22, { r: 6 }) +
                  TX(60, 48 + i * 26, a, { a: "start" }) +
                  TX(250, 48 + i * 26, b, { a: "end" }),
              )
              .join(""),
          "Table of r against 2 to the power r",
        ),
      },
    ),
  ]);

  /* ==================== a7-entropy ==================== */
  const surpriseFig = (() => {
    const P = [
      ["A", 0.6, "0.7"],
      ["B", 0.3, "1.7"],
      ["C", 0.08, "3.6"],
      ["D", 0.02, "5.6"],
    ];
    let s = "";
    P.forEach(([k, p, sur], i) => {
      const x = 14 + i * 96,
        h = Math.max(4, p * 130);
      s += PK(
        k,
        RC(x, 8, 86, 210, { r: 10, f: "var(--bg-2)" }) +
          RC(x + 25, 150 - h + 20, 36, h, { r: 5, f: "var(--blue)", k: "var(--blue)" }) +
          TX(x + 43, 176, k, { s: 16 }) +
          TX(x + 43, 194, "p = " + p, { s: 12 }) +
          TX(x + 43, 211, "surprise " + sur + " bits", { s: 11 }),
      );
    });
    return SVG(400, 226, s, "Four symbols with their probabilities and surprise values");
  })();

  const claimFig = `<table style="border-collapse:collapse;margin:0 auto;font:800 14px var(--sans);color:var(--text)"><tr>${["Symbol", "Probability", "Claimed code length"].map((h) => `<th style="padding:6px 12px;border:2px solid var(--line);background:var(--bg-2)">${h}</th>`).join("")}</tr>${[
    ["A", "0.5", "1 bit"],
    ["B", "0.25", "1 bit"],
    ["C", "0.125", "2 bits"],
    ["D", "0.125", "2 bits"],
  ]
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td style="padding:6px 12px;border:2px solid var(--line);text-align:center">${c}</td>`).join("")}</tr>`,
    )
    .join(
      "",
    )}<tr><td colspan="3" style="padding:8px 12px;border:2px solid var(--line);text-align:center">Entropy of this source: 1.75 bits per symbol</td></tr></table>`;

  B.add("a7-entropy", [
    {
      type: "cat",
      q: "Entropy is measured in bits per symbol. Decide for each source whether its entropy is under 1 bit or at least 1 bit.",
      buckets: ["Under 1 bit", "1 bit or more"],
      items: [
        ["A coin that lands heads 95% of the time", 0],
        ["A fair coin", 1],
        ["A fair six-sided die", 1],
        ["Four symbols: one appears 97% of the time, the other three 1% each", 0],
        ["Three symbols with probabilities 0.5, 0.25 and 0.25", 1],
        ["A lamp that is off 99.9% of the time", 0],
      ],
      hint: "Entropy is low when one outcome nearly always wins, however many symbols exist.",
      why: "Strongly skewed sources are very predictable: the 95% coin has about 0.29 bits and the 97% source about 0.24. A fair coin is exactly 1 bit, the die about 2.6 and the 0.5/0.25/0.25 source 1.5. Two-symbol sources can never go above 1 bit, but they can go far below.",
    },
    {
      type: "slider",
      q: "An event has a 1 in 1,000 chance of happening. Roughly how many bits of surprise does it carry when it does?",
      min: 0,
      max: 20,
      step: 1,
      ans: 10,
      tol: 2,
      unit: " bits",
      hint: "Each extra bit halves the probability: 1/2, 1/4, 1/8, ... How many halvings reach about 1/1000? (2 multiplied by itself 10 times is 1,024.)",
      why: "Surprise is log2(1/p) and 2^10 = 1,024, so a 1 in 1,000 event carries about 10 bits. Because of the log, a thousand-fold rarer event costs only 10 bits, not 1,000.",
    },
    M(
      "A vendor claims their code reaches the lengths shown for this source and is uniquely decodable. What is wrong with the claim?",
      [
        "Average length is 1.25 bits, below the 1.75-bit entropy, so it cannot work",
        "Average length is 1.5 bits, which is above the entropy, so it wastes space",
        "Codes must always be 2 bits long when there are four symbols",
        "Entropy only limits codes for equally likely symbols, so no limit applies",
      ],
      0,
      "Average length = 0.5×1 + 0.25×1 + 0.125×2 + 0.125×2 = 1.25 bits. No uniquely decodable code can average below the entropy (1.75), so some messages would decode ambiguously. The code lengths 1, 2, 3, 3 reach exactly 1.75.",
      { fig: claimFig, hint: "Average = 0.5 + 0.25 + 0.25 + 0.25 = 1.25." },
    ),
    {
      type: "multi",
      q: "A source sends A, B, C, D with probabilities 0.7, 0.1, 0.1, 0.1 (entropy about 1.4 bits). Which changes would increase its entropy? Select all that apply.",
      o: [
        "Change the probabilities to 0.4, 0.2, 0.2, 0.2",
        "Add a fifth symbol E and take its 0.05 from A: 0.65, 0.1, 0.1, 0.1, 0.05",
        "Change the probabilities to 0.85, 0.05, 0.05, 0.05",
        "Swap the probabilities of A and B: 0.1, 0.7, 0.1, 0.1",
        "Rename the symbols to W, X, Y, Z",
      ],
      a: [0, 1],
      why: "Entropy rises when probability spreads out. 0.4/0.2/0.2/0.2 is about 1.9 bits, and splitting off a fifth symbol raises it to about 1.6. The 0.85 version is more skewed (about 0.85 bits). Swapping or renaming only relabels the same distribution, so the entropy is unchanged.",
    },
    {
      type: "pick",
      q: "Entropy is the average of p × surprise over all symbols. Using the numbers shown, which symbol contributes the most to the total? Tap it.",
      fig: surpriseFig,
      a: "B",
      hint: "Multiply each pair: 0.6 × 0.7, 0.3 × 1.7, 0.08 × 3.6, 0.02 × 5.6.",
      why: "The contributions are about 0.42 (A), 0.51 (B), 0.29 (C) and 0.11 (D). The most common symbol is not the biggest contributor: B balances being fairly common with being fairly surprising. Rare symbols are very surprising but too seldom to matter much.",
    },
  ]);

  /* ==================== a7-huffman ==================== */
  const treeFig = (() => {
    const A = { s: "A", p: ".5" },
      Bn = { s: "B", p: ".2" },
      C = { s: "C", p: ".2" },
      D = { s: "D", p: ".1" };
    const trees = [
      [
        [A, Bn],
        [C, D],
      ],
      [A, [Bn, [C, D]]],
      [D, [C, [Bn, A]]],
    ];
    let s = "";
    trees.forEach((t, ti) => {
      const ox = 6 + ti * 140;
      let leaf = 0;
      const lay = (n, d) => {
        if (n.s) {
          n.x = ox + 18 + leaf++ * 32;
          n.y = 30 + d * 38;
          return n;
        }
        n.k = n.map((c) => lay(c, d + 1));
        n.x = (n.k[0].x + n.k[n.k.length - 1].x) / 2;
        n.y = 30 + d * 38;
        return n;
      };
      const root = lay(t.slice(), 0);
      let lines = "",
        nodes = "";
      const draw = (n) => {
        if (n.s) {
          nodes +=
            `<circle cx="${n.x}" cy="${n.y}" r="13" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>` +
            TX(n.x, n.y + 5, n.s, { s: 13 }) +
            TX(n.x, n.y + 28, n.p, { s: 11 });
          return;
        }
        n.k.forEach((c) => {
          lines += LN(n.x, n.y, c.x, c.y);
          draw(c);
        });
        nodes += `<circle cx="${n.x}" cy="${n.y}" r="5" fill="var(--line-2)"/>`;
      };
      draw(root);
      s += PK(
        "t" + (ti + 1),
        RC(ox - 2, 4, 134, 188, { r: 12, f: "var(--bg-2)", k: "var(--line)" }) +
          lines +
          nodes +
          TX(ox + 65, 186, "Tree " + (ti + 1), { s: 13 }),
      );
    });
    return SVG(424, 198, s, "Three candidate code trees for symbols A, B, C and D with their probabilities");
  })();

  B.add("a7-huffman", [
    {
      type: "pick",
      q: "Symbols A, B, C and D occur with probabilities 0.5, 0.2, 0.2 and 0.1 (shown under each leaf). Each tree is a valid prefix code, but only one is the tree Huffman's algorithm builds. Tap it.",
      fig: treeFig,
      a: "t2",
      hint: "Average length = sum of probability × depth. Tree 1: 2 for every symbol. Work out the other two.",
      why: "Tree 2 averages 0.5×1 + 0.2×2 + 0.2×3 + 0.1×3 = 1.8 bits, the best of the three. Tree 1 is balanced (2.0 bits), and tree 3 puts the rarest symbol nearest the root, which averages 2.6 bits. Huffman merges the two rarest, so the rarest leaves end up deepest.",
    },
    {
      type: "bug",
      q: "This function should build a Huffman tree by repeatedly merging the two least frequent nodes. It produces a terrible code. Click the faulty line.",
      code: [
        "def huffman_merge(freq):",
        "    nodes = [(w, s) for s, w in freq.items()]",
        "    while len(nodes) > 1:",
        "        nodes.sort(reverse=True)",
        "        a = nodes.pop(0)",
        "        b = nodes.pop(0)",
        "        nodes.append((a[0] + b[0], (a, b)))",
        "    return nodes[0]",
      ],
      a: 3,
      why: "Sorting in descending order puts the biggest nodes at the front, so pop(0) removes the two MOST frequent. Huffman needs the two smallest: sort ascending (the default), then pop(0) twice.",
    },
    {
      type: "cat",
      q: "A prefix code gives each symbol a codeword of some length. Each codeword of length L uses up 1 / 2^L of the available code space, and the total cannot exceed 1. Which sets of lengths can belong to a prefix code?",
      buckets: ["Possible", "Impossible"],
      items: [
        ["Lengths 1, 2, 3, 3", 0],
        ["Lengths 1, 1, 2", 1],
        ["Lengths 2, 2, 2", 0],
        ["Lengths 1, 2, 2, 2", 1],
        ["Lengths 1, 2, 3, 4", 0],
        ["Lengths 2, 2, 2, 2, 2", 1],
      ],
      hint: "Add the fractions: length 1 is 1/2, length 2 is 1/4, length 3 is 1/8, length 4 is 1/16.",
      why: "1, 2, 3, 3 uses 1/2 + 1/4 + 1/8 + 1/8 = 1, which exactly fills the space. 2, 2, 2 and 1, 2, 3, 4 use less than 1, so they fit. 1, 1, 2 (1.25), 1, 2, 2, 2 (1.25) and five 2s (1.25) overshoot, so two codewords would have to share a prefix.",
    },
    {
      type: "slider",
      q: "A 1,000-symbol message uses A 500 times, B 250 times, C 125 times and D 125 times. Plain 8-bit characters cost 8,000 bits. Huffman gives A = 0, B = 10, C = 110, D = 111. Roughly what percentage of the original size is the Huffman version?",
      min: 0,
      max: 100,
      step: 2,
      ans: 22,
      tol: 8,
      unit: "%",
      hint: "Count bits: 500×1 + 250×2 + 125×3 + 125×3. Then compare with 8,000 (about 1,750 out of 8,000).",
      why: "500 + 500 + 375 + 375 = 1,750 bits, and 1,750 / 8,000 is about 22%. Skewed frequencies let the common symbol cost 1 bit instead of 8.",
    },
    {
      type: "multi",
      q: "Huffman built an optimal code for one file. Which changes would keep the average code length for that same file optimal? Select all that apply.",
      o: [
        "Swap the 0 and 1 labels on one branch of the tree",
        "Break a tie between two equal frequencies the other way round",
        "Give the rarest symbol the shortest codeword",
        "Write the frequencies as percentages instead of counts",
        "Reuse the tree built from a different file",
      ],
      a: [0, 1, 3],
      why: "Which branch is called 0 or 1 doesn't change any length, equal frequencies can be merged in either order with the same average, and scaling all counts leaves the merges unchanged. Giving the rarest symbol the shortest code is the opposite of the rule, and a tree built from different frequencies is only optimal for that other file.",
    },
  ]);

  /* ==================== a7-lzw ==================== */
  const lzwFig = (() => {
    const rows = [
      ["A", 0, "AB", 2],
      ["B", 1, "BB", 3],
      ["B", 1, "BA", 4],
      ["AB", 2, "ABA", 5],
      ["BA", 4, "BAB", 6],
      ["BB", 3, "BBA", 7],
      ["A", 0, "-", "-"],
    ];
    let s = TX(200, 20, "Input: A B B A B B A B B A   (dictionary starts A = 0, B = 1)", { s: 12 });
    ["match", "output", "new entry"].forEach((h, i) => (s += TX([86, 190, 306][i], 46, h, { s: 12 })));
    rows.forEach(([w, o, e, n], i) => {
      const y = 54 + i * 34;
      s += PK(
        "r" + (i + 1),
        RC(6, y, 388, 30, { r: 8 }) +
          TX(26, y + 20, i + 1, { s: 12 }) +
          TX(86, y + 20, w, { m: 1, s: 14 }) +
          TX(190, y + 20, o, { m: 1, s: 14 }) +
          TX(306, y + 20, e === "-" ? "-" : e + " = " + n, { m: 1, s: 14 }),
      );
    });
    return SVG(400, 296, s, "A table tracing LZW encoding of ABBABBABBA");
  })();

  const lzwDecFig = (() => {
    const T = [
      ["0", "A"],
      ["1", "B"],
      ["2", "C"],
      ["3", "BA"],
      ["4", "AB"],
    ];
    let s = TX(200, 20, "Decoder's table after handling codes 1, 0, 3", { s: 13 });
    T.forEach(([c, v], i) => {
      const x = 14 + i * 76;
      s +=
        RC(x, 32, 68, 52, {
          r: 8,
          f: i > 2 ? "var(--blue)" : "var(--panel)",
          fo: i > 2 ? ".2" : "1",
          k: i > 2 ? "var(--blue)" : "var(--line-2)",
        }) +
        TX(x + 34, 54, c, { s: 12 }) +
        TX(x + 34, 74, v, { m: 1, s: 16 });
    });
    s += TX(200, 112, "Next code to arrive: 4", { s: 14 });
    return SVG(400, 124, s, "The decoder's dictionary with entries 0 to 4");
  })();

  B.add("a7-lzw", [
    {
      type: "pick",
      q: "A learner traced LZW on the input shown, using the dictionary A = 0, B = 1. One line has the wrong new dictionary entry. Tap that line.",
      fig: lzwFig,
      a: "r4",
      hint: "Each new entry is the matched phrase plus the very next letter of the input. Re-trace the input from line 3.",
      why: "After B, B and BA are consumed the input continues A B B, so line 4 matches AB and the next letter is B: the new entry is ABB = 5, not ABA. Lines 1, 2, 3, 5 and 6 follow correctly from the input.",
    },
    {
      type: "bug",
      q: "This LZW encoder loses data. After adding a dictionary entry it should start the next phrase with the character that did not fit. Click the faulty line.",
      code: [
        "def lzw_encode(text, alphabet):",
        "    table = {ch: i for i, ch in enumerate(alphabet)}",
        "    w, out = '', []",
        "    for c in text:",
        "        if w + c in table:",
        "            w = w + c",
        "        else:",
        "            out.append(table[w])",
        "            table[w + c] = len(table)",
        "            w = ''",
        "    out.append(table[w])",
        "    return out",
      ],
      a: 9,
      why: "After emitting code(w) and storing w+c, the encoder must continue with w = c. Resetting to an empty string throws c away, so that letter never gets encoded.",
    },
    {
      type: "slider",
      q: "LZW encodes a message of 64 letters that are all A, starting with a dictionary that holds only A = 0. About how many codes does it output?",
      min: 0,
      max: 64,
      step: 1,
      ans: 11,
      tol: 3,
      unit: " codes",
      hint: "Phrases grow by one letter each time: A, AA, AAA, ... so the lengths add up 1 + 2 + 3 + ... until they reach 64.",
      why: "The encoder emits phrases of length 1, 2, 3, ... 10 (that covers 55 letters), then one final code for the last 9 letters: 11 codes in total. The phrase length keeps growing, so the number of codes grows only like the square root of the message length.",
    },
    {
      type: "cat",
      q: "Which method suits each data source better, Huffman or LZW?",
      buckets: ["Huffman suits it better", "LZW suits it better"],
      items: [
        ["Letters used very unevenly, but no phrase ever repeats", 0],
        ["The same long phrases keep recurring, with every letter about equally common", 1],
        ["A live stream where nothing can be read ahead to count letters", 1],
        ["Random-order symbols: A 70%, C, G and T 10% each", 0],
        ["A log file repeating the same long lines thousands of times", 1],
      ],
      why: "Huffman exploits uneven symbol frequencies, even when the order is random. LZW exploits repeated sequences and needs no counts in advance, because both ends build the same dictionary as the data goes by.",
    },
    M(
      "The decoder's table is shown. The next code that arrives is 4 (AB). Which entry does it add as code 5?",
      ["ABA", "ABB", "BAA", "BAB"],
      2,
      "The new entry is the previous output (BA) plus the first letter of the current one (AB gives A): BA + A = BAA. The decoder is always one entry behind the encoder, so it can add the entry only once it sees the next phrase's first letter.",
      { fig: lzwDecFig, hint: "New entry = previous string + first letter of the current string." },
    ),
  ]);

  /* ==================== a8-hash ==================== */
  const chainFig = (() => {
    const blocks = [
      ["Block 1", "Ann pays Bob 5", "0000", "7c21", ""],
      ["Block 2", "Bob pays Cy 20", "7c21", "e7b2", "edited (was 2), hash recomputed"],
      ["Block 3", "Cy pays Di 1", "41af", "9d03", ""],
      ["Block 4", "Di pays Ed 3", "9d03", "2b58", ""],
    ];
    let s = TX(200, 14, "Short made-up digests. prev = the parent block's hash.", { s: 12 });
    blocks.forEach(([n, d, p, h, note], i) => {
      const y = 28 + i * 64,
        edited = i === 1;
      s += PK(
        "b" + (i + 1),
        RC(6, y, 388, 56, { r: 10, k: edited ? "var(--amber)" : "var(--line-2)" }) +
          TX(18, y + 20, n, { a: "start", s: 13 }) +
          TX(120, y + 20, d, { a: "start", s: 13 }) +
          TX(18, y + 42, "prev " + p, { a: "start", m: 1, s: 13 }) +
          TX(120, y + 42, "hash " + h, { a: "start", m: 1, s: 13 }) +
          (note ? TX(382, y + 42, note, { a: "end", s: 10, f: "var(--amber-ink, var(--text))" }) : ""),
      );
    });
    return SVG(400, 288, s, "A chain of four blocks where block 2 was edited");
  })();

  const pairFig = (() => {
    const pairs = [
      { id: "p1", name: "Hash P", a: "1011001110100101", b: "1011001110110101" },
      { id: "p2", name: "Hash Q", a: "0110001101000010", b: "0100111010100011" },
    ];
    let s = TX(200, 16, "First 16 bits of each digest. Inputs differ by one character.", { s: 12 });
    pairs.forEach((p, k) => {
      const y = 28 + k * 100;
      s += PK(
        p.id,
        RC(4, y, 392, 90, { r: 12, f: "var(--bg-2)", k: "var(--line)" }) +
          TX(40, y + 24, p.name, { s: 13 }) +
          [...p.a].map((c, i) => bitCell(76 + i * 19, y + 10, c, { w: 18, h: 28, sw: 1, tf: "var(--text)" })).join("") +
          [...p.b]
            .map((c, i) =>
              bitCell(76 + i * 19, y + 46, c, {
                w: 18,
                h: 28,
                sw: 1,
                f: c !== p.a[i] ? "var(--rose)" : "var(--panel)",
                fo: c !== p.a[i] ? ".35" : "1",
              }),
            )
            .join("") +
          TX(40, y + 40, "before", { s: 10 }) +
          TX(40, y + 68, "after", { s: 10 }),
      );
    });
    return SVG(400, 232, s, "Two pairs of digests with the differing bits highlighted");
  })();

  B.add("a8-hash", [
    {
      type: "pick",
      q: "An attacker edited block 2 and recomputed only block 2's own hash. Nothing else was touched. The checker validates each block in turn: its stored hash must match its contents, and its prev must equal the previous block's stored hash. Tap the first block that fails.",
      fig: chainFig,
      a: "b3",
      hint: "Compare each block's prev with the hash stored in the block above it.",
      why: "Block 2 passes: its own hash was recomputed and its prev still matches block 1. Block 3 still stores prev 41af, the OLD hash of block 2, but block 2 now has hash e7b2, so the link breaks there. Block 4 still matches block 3's stored hash.",
    },
    {
      type: "cat",
      q: "Should each job use a hash (a one-way fingerprint) or encryption (reversible with a key)?",
      buckets: ["Hash", "Encryption"],
      items: [
        ["Checking a login password without storing it", 0],
        ["Sending a private message the receiver must read", 1],
        ["Confirming a big download wasn't corrupted", 0],
        ["Storing a card number so a shop can charge it next month", 1],
        ["Spotting duplicate files without comparing every byte", 0],
      ],
      why: "Hashes give a fixed fingerprint that cannot be turned back into the input, which is right when you only need to compare or verify. When the original must be recovered later (a message, a stored card number) you need encryption, which a key can reverse.",
    },
    {
      type: "pick",
      q: "Both hash functions below were given two inputs that differ by a single character. One is suitable for detecting tampering and for proof of work. Tap that hash.",
      fig: pairFig,
      a: "p2",
      hint: "A good hash changes about half its output bits when the input changes at all.",
      why: "Hash Q flips about half of its bits (the avalanche effect), so the digest of an edited input looks unrelated to the original. Hash P flips just one bit, so edited inputs give almost the same digest and an attacker can search for a matching one easily.",
    },
    {
      type: "order",
      q: "Put the steps of mining one block in order.",
      items: [
        "Collect transactions and the previous block's hash into a block",
        "Choose a nonce and hash the whole block",
        "Check whether the digest starts with enough zeros",
        "Not enough zeros: change the nonce and hash again",
        "Enough zeros: broadcast the block",
        "Everyone else re-hashes it once to confirm",
      ],
      why: "Finding a good nonce is trial and error that can repeat millions of times, while confirming it takes one hash. That imbalance (costly to make, cheap to check) is what makes proof of work useful.",
    },
    {
      type: "bug",
      q: "A thief edits the data in the very last block of a chain, but this validity checker still says the chain is fine. Click the faulty line.",
      code: [
        "def valid(chain):",
        "    for i in range(1, len(chain) - 1):",
        "        cur, prev = chain[i], chain[i - 1]",
        "        if cur['prev'] != prev['hash']:",
        "            return False",
        "        if sha(cur['data'] + cur['prev']) != cur['hash']:",
        "            return False",
        "    return True",
      ],
      a: 1,
      why: "range(1, len(chain) - 1) stops before the last block, so it is never checked. The loop should run to len(chain). This off-by-one means the newest block can be tampered with freely.",
    },
  ]);

  /* ==================== a8-keys ==================== */
  const dhFig = (() => {
    const chips = [
      ["p", "p (the prime)"],
      ["g", "g (the base)"],
      ["a", "a (Alice's number)"],
      ["b", "b (Bob's number)"],
      ["A", "A = g^a mod p"],
      ["B", "B = g^b mod p"],
      ["K", "K (final shared value)"],
    ];
    let s = "";
    chips.forEach(([id, t], i) => {
      const x = 8 + (i % 2) * 196,
        y = 8 + Math.floor(i / 2) * 54;
      s += PK(id, RC(x, y, 184, 44, { r: 12 }) + TX(x + 92, y + 28, t, { s: 14 }));
    });
    return SVG(392, 228, s, "Seven values used in a Diffie-Hellman exchange");
  })();

  const mitmFig = (() => {
    const box = (x, t, k) =>
      RC(x, 36, 100, 56, {
        r: 12,
        k: k || "var(--line-2)",
        f: k ? "var(--rose)" : "var(--panel)",
        fo: k ? ".15" : "1",
      }) + TX(x + 50, 70, t, { s: 14 });
    return SVG(
      400,
      150,
      box(8, "Alice") +
        box(150, "Mallory", "var(--rose)") +
        box(292, "Bob") +
        LN(108, 64, 150, 64, { w: 3 }) +
        LN(250, 64, 292, 64, { w: 3 }) +
        TX(80, 22, "exchange 1", { s: 12 }) +
        TX(320, 22, "exchange 2", { s: 12 }) +
        TX(58, 118, "key K1", { s: 13, f: "var(--blue)" }) +
        TX(342, 118, "key K2", { s: 13, f: "var(--blue)" }) +
        TX(200, 118, "knows K1 and K2", { s: 12, f: "var(--rose)" }) +
        TX(200, 142, "Alice and Bob each believe they talk to the other directly", { s: 11 }),
      "Mallory sitting between Alice and Bob running two separate exchanges",
    );
  })();

  B.add("a8-keys", [
    {
      type: "pick",
      q: "Alice and Bob run Diffie-Hellman across a wire that Eve can read. They announce p and g in the clear and then send each other A and B. Tap every value that Eve can read from the wire.",
      fig: dhFig,
      a: ["A", "B", "g", "p"],
      why: "p, g, A and B all cross the wire openly. Their private numbers a and b never leave their owners, and the shared value K is computed locally by each side. Eve would have to solve the discrete logarithm problem to get a or b from A or B.",
    },
    {
      type: "order",
      q: "Put the steps of generating a toy RSA key pair in order.",
      items: [
        "Pick two primes p and q",
        "Multiply them to get n = p × q",
        "Compute φ = (p − 1)(q − 1)",
        "Choose e that shares no factor with φ",
        "Find d so that e × d leaves remainder 1 when divided by φ",
        "Publish (n, e) and keep d secret",
      ],
      why: "Each step feeds the next: φ needs p and q, e must be coprime to φ, and d is the inverse of e modulo φ. Only n and e are published.",
    },
    {
      type: "cat",
      q: "In RSA, which of these can Eve safely see, and which must stay secret?",
      buckets: ["Safe for Eve to see", "Must stay secret"],
      items: [
        ["n (the modulus)", 0],
        ["e (the public exponent)", 0],
        ["d (the private exponent)", 1],
        ["The primes p and q", 1],
        ["The ciphertext sent to you", 0],
        ["φ = (p − 1)(q − 1)", 1],
      ],
      why: "n, e and the ciphertext are all public. p, q and φ give away d, since anyone who knows φ can compute d from e, so they must stay secret along with d itself. Security rests on the difficulty of factoring n into p and q.",
    },
    {
      type: "match",
      q: "Match each job to the key it uses.",
      pairs: [
        ["Send Bob a message only he can read", "Bob's public key"],
        ["Bob reads that message", "Bob's private key"],
        ["Alice signs a contract so anyone can check it came from her", "Alice's private key"],
        ["A stranger checks Alice's signature", "Alice's public key"],
      ],
      why: "Encryption uses the receiver's public key and decryption the receiver's private key. Signing flips it: only the owner can sign with her private key, and anyone can verify with her public key.",
    },
    M(
      "Mallory sits between Alice and Bob and runs a separate Diffie-Hellman exchange with each of them, as drawn. What is the situation afterwards?",
      [
        "Two different keys exist, and Mallory knows both of them",
        "One key is shared by all three, so Mallory can only listen",
        "Alice and Bob share one key that Mallory cannot work out",
        "The maths fails so both sides are told to start again",
      ],
      0,
      "Each exchange succeeds with its own key. Mallory decrypts with K1, reads, re-encrypts with K2 and passes it on, while both victims think they share one key. Diffie-Hellman gives a secret but no proof of who is at the other end, which is why certificates and signatures are needed.",
      { fig: mitmFig },
    ),
  ]);

  /* ==================== a9-dft ==================== */
  const dftBars = (() => {
    const N = 32,
      mag = (f) =>
        Array.from({ length: 17 }, (_, k) => {
          let re = 0,
            im = 0;
          for (let n = 0; n < N; n++) {
            const x = Math.sin((2 * Math.PI * f * n) / N),
              a = (-2 * Math.PI * k * n) / N;
            re += x * Math.cos(a);
            im += x * Math.sin(a);
          }
          return Math.hypot(re, im);
        });
    const panels = [
      { id: "A", t: "Spectrum A", m: mag(5.5) },
      { id: "B", t: "Spectrum B", m: mag(5) },
    ];
    let s = TX(200, 16, "32 samples over exactly 1 second, so bin k means k Hz", { s: 12 });
    panels.forEach((p, k) => {
      const y = 26 + k * 110;
      s += PK(
        p.id,
        RC(4, y, 392, 102, { r: 12, f: "var(--bg-2)", k: "var(--line)" }) +
          TX(36, y + 20, p.t, { s: 13, a: "start" }) +
          p.m
            .map((v, i) => {
              const h = Math.max(1, (v / 16) * 56),
                x = 24 + i * 21;
              return `<rect x="${x}" y="${y + 90 - h - 10}" width="15" height="${h}" rx="2" fill="var(--blue)"/>`;
            })
            .join("") +
          [0, 5, 10, 15].map((i) => TX(24 + i * 21 + 7, y + 98, i, { s: 10 })).join(""),
      );
    });
    return SVG(400, 250, s, "Two magnitude spectra from a 32-sample window");
  })();

  B.add("a9-dft", [
    {
      type: "pick",
      q: "One of these spectra comes from a 5 Hz sine and the other from a 5.5 Hz sine, both recorded for exactly 1 second. Tap the spectrum of the 5.5 Hz tone.",
      fig: dftBars,
      a: "A",
      hint: "Does the window hold a whole number of cycles for each tone?",
      why: "5 Hz fits exactly 5 cycles into the window, so all the energy lands in bin 5. 5.5 Hz leaves half a cycle dangling, the window edges look like a jump, and energy smears (leaks) into neighbouring bins. Spectrum A is the smeared one.",
    },
    {
      type: "match",
      q: "Match each signal to the spectrum shape you would expect.",
      pairs: [
        ["A pure musical note", "One tall spike at the note's frequency"],
        ["A steady offset that never changes", "A spike at bin 0 only"],
        ["A single sharp click", "Similar energy in every bin"],
        ["Random hiss", "A jagged spread with no clear spike"],
      ],
      why: "A steady sine matches one frequency. A constant has no wiggle, so only bin 0 responds. A very short click contains every frequency equally, so its spectrum is flat. Random noise spreads energy irregularly across all bins.",
    },
    {
      type: "slider",
      q: "A hum recording contains a 50 Hz tone and a 52 Hz tone. To see them as two separate peaks you need bins at most 2 Hz apart. Sampling at 1,000 Hz, roughly how many seconds of signal must you record?",
      min: 0,
      max: 4,
      step: 0.25,
      ans: 0.5,
      tol: 0.25,
      unit: " s",
      hint: "Bin spacing is 1 divided by the recording time, whatever the sample rate is.",
      why: "Bin spacing = fs / N = 1 / T. For 2 Hz spacing you need T = 0.5 s (500 samples at 1,000 Hz). Sampling faster adds samples but doesn't sharpen frequency resolution. Only a longer recording does.",
    },
    {
      type: "multi",
      q: "A 60 Hz hum is being recorded at 100 Hz and shows up as a fake 40 Hz peak. Which actions would genuinely stop the false peak? Select all that apply.",
      o: [
        "Sample at more than 120 Hz",
        "Pass the signal through an analogue low-pass filter before sampling",
        "Record for ten times longer",
        "Apply a Hann window to the samples",
        "Delete the bins above 50 Hz after sampling",
      ],
      a: [0, 1],
      why: "Aliasing happens at the moment of sampling: samples of 60 Hz and 40 Hz are identical, so nothing afterwards can tell them apart. You either sample fast enough or remove the high frequencies before sampling. A longer record or window changes resolution and leakage, not aliasing.",
    },
    {
      type: "bug",
      q: "Every bin of the output of this DFT comes out equal to sum(x). Click the faulty line.",
      code: [
        "import cmath",
        "def dft(x):",
        "    N = len(x)",
        "    X = []",
        "    for k in range(N):",
        "        total = 0",
        "        for n in range(N):",
        "            total += x[n] * cmath.exp(-2j * cmath.pi * k * n)",
        "        X.append(total)",
        "    return X",
      ],
      a: 7,
      why: "The rotation for bin k at sample n is e^(-2πj·k·n/N). Without dividing by N, the angle is always a whole number of turns, so the factor is 1 and every bin just adds up the samples. The missing / N is the bug.",
    },
  ]);

  /* ==================== a9-fft ==================== */
  const splitFig = (() => {
    let s = RC(110, 6, 180, 32, { r: 10 }) + TX(200, 27, "x0 x1 x2 ... x15", { s: 13 });
    s += LN(160, 38, 100, 66) + LN(240, 38, 300, 66);
    s +=
      RC(10, 66, 190, 32, { r: 10 }) +
      TX(105, 87, "0 2 4 6 8 10 12 14", { s: 12 }) +
      RC(204, 66, 190, 32, { r: 10 }) +
      TX(299, 87, "1 3 5 7 9 11 13 15", { s: 12 });
    s += LN(70, 98, 50, 128) + LN(140, 98, 150, 128) + LN(260, 98, 250, 128) + LN(340, 98, 350, 128);
    const G = [
      ["g1", "0 4 8 12", 6],
      ["g2", "2 6 10 14", 104],
      ["g3", "1 5 9 13", 202],
      ["g4", "3 7 11 15", 300],
    ];
    G.forEach(([id, t, x]) => (s += PK(id, RC(x, 128, 94, 40, { r: 10 }) + TX(x + 47, 153, t, { s: 12 }))));
    return SVG(400, 180, s, "Two levels of even/odd splitting for 16 samples");
  })();

  const bflyFig = (() => {
    const nodeAt = (x, y, t, o = {}) =>
      RC(x - 26, y - 17, 52, 34, { r: 10, f: o.f, fo: o.fo, k: o.k }) + TX(x, y + 5, t, { s: 14, m: 1 });
    const ys = [34, 94, 154, 214];
    let s = "";
    // wires: E0->X0,X2; O0->X0,X2; E1->X1,X3; O1->X1,X3
    s += LN(90, ys[0], 290, ys[0]) + LN(90, ys[0], 290, ys[2]) + LN(90, ys[2], 290, ys[0]) + LN(90, ys[2], 290, ys[2]);
    s += LN(90, ys[1], 290, ys[1]) + LN(90, ys[1], 290, ys[3]) + LN(90, ys[3], 290, ys[1]) + LN(90, ys[3], 290, ys[3]);
    [
      ["E0", "4"],
      ["E1", "-2"],
      ["O0", "6"],
      ["O1", "-2"],
    ].forEach(
      ([n, v], i) =>
        (s +=
          nodeAt(90, ys[i], v, {
            f: i < 2 ? "var(--blue)" : "var(--amber)",
            fo: ".2",
            k: i < 2 ? "var(--blue)" : "var(--amber)",
          }) + TX(40, ys[i] + 5, n, { s: 12 })),
    );
    ["X0", "X1", "X2", "X3"].forEach(
      (n, i) => (s += nodeAt(290, ys[i], "?", { f: "var(--panel)" }) + TX(340, ys[i] + 5, n, { s: 13 })),
    );
    s += TX(190, 14, "X[k] = E[k] + W·O[k] and X[k+2] = E[k] − W·O[k]", { s: 12 });
    s += TX(190, 244, "k = 0: W = 1.   k = 1: W = −j.", { s: 12 });
    return SVG(400, 256, s, "Final butterfly stage of a 4-point FFT with E0 = 4, E1 = −2, O0 = 6, O1 = −2");
  })();

  B.add("a9-fft", [
    {
      type: "pick",
      q: "A 16-point FFT splits its samples into even-numbered and odd-numbered positions, then splits each of those lists the same way. Positions are counted from 0 within each list. After two splits, which group does sample x6 land in? Tap it.",
      fig: splitFig,
      a: "g2",
      hint: "x6 is at position 3 (odd) in the even list 0 2 4 6 8 10 12 14. Which child gets the odd positions?",
      why: "The first split sends x6 to the even list. In that list x6 sits at position 3, an odd position, so the second split sends it to the odd child: 2 6 10 14. The leaves of the full recursion therefore follow the bit-reversed order.",
    },
    {
      type: "slider",
      q: "The direct DFT takes 20 ms on 1,000 samples, and its work grows with the square of the sample count. About how long will it take on 4,000 samples?",
      min: 0,
      max: 800,
      step: 20,
      ans: 320,
      tol: 100,
      unit: " ms",
      hint: "4 times as many samples means 4 × 4 times as much work.",
      why: "Work grows like N², so 4× the samples costs 16× the time: 20 ms × 16 = 320 ms. An FFT on the same 4,000 samples would take only a little over 4× as long as for 1,000, which is the whole point of using it.",
    },
    {
      type: "order",
      q: "Put the stages of a recursive radix-2 FFT in order.",
      items: [
        "Split the samples into even-indexed and odd-indexed halves",
        "Keep splitting until every piece has just one sample",
        "Treat each single sample as its own DFT",
        "Combine pairs of results with butterflies",
        "Keep merging upwards until one full-length spectrum is left",
      ],
      why: "The FFT first breaks the problem down, using the fact that a single sample is its own DFT, and then builds the answer back up level by level. Each level costs about N operations and there are log2 N levels.",
    },
    {
      type: "bug",
      q: "The output of this FFT repeats its first half in its second half, so the spectrum is wrong. Click the faulty line.",
      code: [
        "import cmath",
        "def fft(x):",
        "    N = len(x)",
        "    if N == 1:",
        "        return x",
        "    even = fft(x[0::2])",
        "    odd = fft(x[1::2])",
        "    out = [0] * N",
        "    for k in range(N // 2):",
        "        t = cmath.exp(-2j * cmath.pi * k / N) * odd[k]",
        "        out[k] = even[k] + t",
        "        out[k + N // 2] = even[k] + t",
        "    return out",
      ],
      a: 11,
      why: "A butterfly produces two outputs: even[k] + t and even[k] − t. The second half must use the minus sign, because the rotation by half a turn flips the sign of the odd part's contribution. With a plus, both halves are identical.",
    },
    M(
      "The last stage of a 4-point FFT is shown, built from inputs x = 1, 2, 3, 4. What is X[2]?",
      ["−2", "2", "6", "10"],
      0,
      "X[2] = E[0] − W⁰·O[0] = 4 − 1×6 = −2. Check with the DFT formula: 1 − 2 + 3 − 4 = −2. X[0] would be 4 + 6 = 10 (the sum of the inputs).",
      { fig: bflyFig, hint: "Bin 2 pairs E0 with O0 using a minus sign and twiddle 1." },
    ),
  ]);

  /* ==================== a10-attn ==================== */
  const heatFig = (() => {
    const W = [
        [1, 0, 0, 0],
        [0.3, 0.7, 0, 0],
        [0.2, 0.5, 0.5, 0],
        [0.1, 0.4, 0.2, 0.3],
      ],
      tok = ["the", "dog", "chased", "it"];
    let s = TX(200, 16, "Attention weights, one row per token (decoder with a causal mask)", { s: 12 });
    tok.forEach((t, c) => (s += TX(120 + c * 60 + 28, 42, t, { s: 12 })));
    W.forEach((row, r) => {
      const y = 52 + r * 48;
      s +=
        TX(106, y + 29, tok[r], { a: "end", s: 12 }) +
        PK(
          "r" + (r + 1),
          RC(116, y, 248, 42, { r: 8, f: "var(--bg-2)", k: "var(--line)" }) +
            row
              .map(
                (v, c) =>
                  `<rect x="${120 + c * 60}" y="${y + 4}" width="56" height="34" rx="6" fill="var(--blue)" fill-opacity="${v ? 0.12 + v * 0.55 : 0}" stroke="var(--line-2)" stroke-width="1"/>` +
                  TX(120 + c * 60 + 28, y + 27, v, { s: 14 }),
              )
              .join(""),
        );
    });
    return SVG(400, 252, s, "A four by four attention weight matrix for the sentence the dog chased it");
  })();

  const satFig = `<table style="border-collapse:collapse;margin:0 auto;font:800 14px var(--sans);color:var(--text)"><tr>${["", "Raw scores", "Softmax weights"].map((h) => `<th style="padding:6px 12px;border:2px solid var(--line);background:var(--bg-2)">${h}</th>`).join("")}</tr>${[
    ["Row X", "0.5, 0.2, 0.1", "0.41, 0.31, 0.28"],
    ["Row Y", "20, 8, 4", "1.00, 0.00, 0.00"],
  ]
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td style="padding:6px 12px;border:2px solid var(--line);text-align:center">${c}</td>`).join("")}</tr>`,
    )
    .join("")}</table>`;

  B.add("a10-attn", [
    {
      type: "pick",
      q: "A student prints the attention weights of a decoder as shown. Every row must be a valid softmax output after causal masking. Exactly one row cannot be. Tap it.",
      fig: heatFig,
      a: "r3",
      hint: "Softmax weights are never negative and each row must add up to 1.",
      why: "Row 3 adds up to 0.2 + 0.5 + 0.5 = 1.2, but softmax weights always sum to exactly 1. The other rows sum to 1, and each one has zeros where the causal mask hides later tokens.",
    },
    M(
      "Row Y's raw scores are what you'd see with a large key size d_k and no scaling. What goes wrong?",
      [
        "Softmax collapses to one-hot, so other tokens get almost no learning signal",
        "The weights add up to more than 1, so each output vector gets too large",
        "The causal mask stops working, so tokens begin to see later tokens",
        "Softmax outputs turn negative, so some weights fall below zero",
      ],
      0,
      "Large gaps between scores make softmax saturate: one token takes essentially all the weight and the others get almost none, so the gradients flowing to them vanish. Dividing by √d_k keeps the scores in a range where softmax stays soft. The weights still sum to 1 and stay positive.",
      { fig: satFig, hint: "Compare how spread out each row's weights are." },
    ),
    {
      type: "cat",
      q: "A context grows from n to 2n tokens. Which quantities grow about 4 times (quadratic), and which about 2 times (linear)?",
      buckets: ["Quadratic (about 4×)", "Linear (about 2×)"],
      items: [
        ["Query–key scores computed in one head", 0],
        ["Token embeddings looked up", 1],
        ["Entries in the attention weight matrix", 0],
        ["Position vectors added", 1],
        ["Cells the causal mask must cover", 0],
        ["Value vectors that get mixed", 1],
      ],
      why: "Every token is scored against every token, giving an n × n grid: scores, weights and mask all grow with n². Anything stored once per token (embeddings, positions, values) grows only with n.",
    },
    {
      type: "order",
      q: "Put the steps of one masked self-attention layer in order.",
      items: [
        "Turn tokens into vectors and add position information",
        "Make a query, key and value vector for each token",
        "Score every query against every key",
        "Divide the scores by the square root of the key size",
        "Hide future tokens with the causal mask",
        "Softmax each row into weights that sum to 1",
        "Add up the value vectors using those weights",
      ],
      why: "Scores come before softmax, the mask must act before softmax so hidden tokens get exactly zero weight, and the values are only mixed after the weights exist.",
    },
    {
      type: "bug",
      q: "A model built with this attention function still peeks at later tokens. Click the faulty line.",
      code: [
        "import numpy as np",
        "def attention(Q, K, V):",
        "    d = K.shape[-1]",
        "    scores = Q @ K.T / np.sqrt(d)",
        "    future = np.triu(np.ones_like(scores), k=1)",
        "    scores = scores * (1 - future)",
        "    w = np.exp(scores)",
        "    w = w / w.sum(axis=-1, keepdims=True)",
        "    return w @ V",
      ],
      a: 5,
      why: "Multiplying by zero sets the future scores to 0, not to minus infinity. exp(0) = 1, so those tokens still get a real share of the softmax. The mask must put -inf there, for example np.where(future == 1, -np.inf, scores), so their weight is exactly 0.",
    },
  ]);
})();

/* ===== bank-w-algo-1.js ===== */
/* ALGO revision bank, second round of understanding questions, part 1.
   Phase 1 (anatomy, big-O, surfer, PageRank), Dijkstra, A*, routing, linear programming.
   Every number was checked by running the real algorithm in node. */
(function () {
  const B = NIC.bank,
    Qf = NIC.qfig;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px">${body}</svg>`;
  const inj = (s, extra) => s.replace("</svg>", extra + "</svg>");
  const codeBox = (lines) =>
    `<div style="font:700 13px var(--mono);background:var(--bg-2);border:2px solid var(--line);border-radius:12px;padding:8px 12px;margin-bottom:8px;white-space:pre;overflow-x:auto">${lines.join("\n")}</div>`;
  const hLab = (nodes, h, dy = 34) =>
    Object.entries(h)
      .map(([k, v]) => tx(nodes[k][0], nodes[k][1] + dy, "h = " + v, { sz: 12, c: "var(--amber-ink)" }))
      .join("");
  const rowRect = (x, y, w, h, pick, inner) =>
    `<g data-pick="${pick}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${inner}</g>`;

  /* =====================================================================
     a1-anatomy
     ===================================================================== */
  const euclid = codeBox(["def gcd(a, b):", "    while b != 0:", "        a, b = b, a % b", "    return a"]);
  const isSortedChips = (() => {
    const items = [
      ["c1", "[1, 2, 3]"],
      ["c2", "[3, 1, 2]"],
      ["c3", "[1, 2, 0]"],
      ["c4", "[ ]"],
      ["c5", "[4]"],
      ["c6", "[2, 1, 0]"],
    ];
    const body = items
      .map(([id, t], i) =>
        rowRect(
          10 + (i % 3) * 160,
          8 + Math.floor(i / 3) * 50,
          148,
          40,
          id,
          tx(84 + (i % 3) * 160, 34 + Math.floor(i / 3) * 50, t, { sz: 15, f: "var(--mono)" }),
        ),
      )
      .join("");
    return codeBox(["def is_sorted(xs):", "    return xs[0] <= xs[1]"]) + svg(490, 112, body);
  })();

  B.add("a1-anatomy", [
    {
      type: "cat",
      q: "A binary search looks for <code>t</code> in a list <code>xs</code>. Sort each statement by the job it does.",
      buckets: ["Precondition", "Loop invariant", "Postcondition"],
      items: [
        ["<code>xs</code> is already sorted", 0],
        ["If <code>t</code> is in the list, it sits between positions <code>lo</code> and <code>hi</code>", 1],
        ["Any index returned holds the value <code>t</code>", 2],
        ["Every item left of <code>lo</code> is smaller than <code>t</code>", 1],
        ["The items can be compared with <code>&lt;</code>", 0],
        ["The answer is −1 only when <code>t</code> is not in the list", 2],
      ],
      why: "A precondition is what the caller must give you. An invariant is true at the top of every pass. A postcondition is what the function promises when it ends.",
    },
    {
      type: "multi",
      q: "Euclid's method for the greatest common divisor is shown. Select every statement that is true.",
      fig: euclid,
      o: [
        "gcd(a, b) is the same before and after each pass",
        "b gets strictly smaller on every pass, so the loop must stop",
        "When the loop ends, <code>a</code> holds the answer",
        "<code>a</code> gets strictly smaller on every pass",
        "It only works if <code>a</code> starts bigger than <code>b</code>",
      ],
      a: [0, 1, 2],
      hint: "Try a = 3, b = 5 by hand. What are a and b after one pass?",
      why: "The invariant (same gcd) plus a shrinking b (a % b is always below b) give a correct, terminating loop. With a = 3, b = 5 the first pass gives a = 5, b = 3, so a grew, and a smaller first number is handled without any special case.",
    },
    {
      type: "bug",
      q: "This should return the position of <code>t</code> in <code>xs</code>, or −1 if it is missing. It says −1 for almost everything. Click the faulty line.",
      code: [
        "def find(xs, t):",
        "    for i in range(len(xs)):",
        "        if xs[i] == t:",
        "            return i",
        "        return -1",
      ],
      a: 4,
      why: "The <code>return -1</code> sits inside the loop, so it runs after the very first item. It belongs after the loop, once every item has been checked.",
    },
    {
      type: "match",
      q: "Every loop must stop. Match each loop to the quantity that shrinks and forces it to stop.",
      pairs: [
        ["<code>while n &gt; 1: n = n // 2</code>", "n itself"],
        ["<code>while lo &lt;= hi:</code> in binary search", "The gap hi − lo"],
        ["<code>for x in xs:</code>", "Items still to visit"],
        ["<code>while x &lt; 100: x += 7</code>", "100 − x, the distance left"],
      ],
      why: "A loop is safe when some whole number that cannot go below a floor shrinks on every pass. Naming it is the termination argument.",
    },
    {
      type: "pick",
      q: "<code>is_sorted</code> is meant to say whether a whole list is in order, but it only looks at the first two items. Click <b>every</b> input where this function gives a wrong result or crashes.",
      fig: isSortedChips,
      a: ["c3", "c4", "c5"],
      why: "[1, 2, 0] is not sorted, yet the first two items are in order, so it says True. [ ] and [4] have no second item, so <code>xs[1]</code> crashes. The other three happen to agree with the right answer, which is why tests like those miss the bug.",
    },
  ]);

  /* =====================================================================
     a1-bigo
     ===================================================================== */
  const bigoBlocks = (() => {
    const blk = (y, h, id, lines) =>
      rowRect(
        8,
        y,
        484,
        h,
        id,
        lines.map((l, i) => tx(24, y + 24 + i * 20, l, { a: "start", sz: 13, f: "var(--mono)" })).join(""),
      );
    return svg(
      500,
      250,
      blk(6, 62, "b1", ["# block 1", "total = sum(xs)    # one pass over xs"]) +
        blk(76, 62, "b2", ["# block 2", "xs.sort()    # sorting costs about n log n"]) +
        blk(146, 100, "b3", ["# block 3", "for a in xs:", "    for b in xs:", "        if a + b == 100: count += 1"]),
    );
  })();

  B.add("a1-bigo", [
    {
      type: "slider",
      q: "A quadratic, O(n²), program takes 3 seconds on 1,000 items. About how many seconds would it need for 10,000 items?",
      min: 0,
      max: 600,
      step: 10,
      ans: 300,
      tol: 60,
      unit: " s",
      hint: "10 times the items means 10 × 10 = 100 times the work.",
      why: "Squaring is what hurts: n grows 10 times, n² grows 100 times, so 3 s becomes about 300 s (five minutes).",
    },
    {
      type: "order",
      q: "Each fragment runs with n = 1,000. Order them from the <b>fewest</b> steps to the most.",
      items: [
        "<code>while n &gt; 1: n = n // 2</code>",
        "<code>for i in range(n): work()</code>",
        "<code>for i in range(n):</code> then <code>for j in range(10): work()</code>",
        "<code>for i in range(n):</code> then <code>for j in range(n): work()</code>",
      ],
      why: "Halving takes about 10 steps (2¹⁰ ≈ 1,000). One loop is 1,000. A loop with a fixed inner 10 is 10,000. Two full loops is 1,000,000.",
    },
    {
      type: "pick",
      q: "This program does all three blocks one after another on a list of a million items. Click the block that sets its big-O.",
      fig: bigoBlocks,
      a: "b3",
      hint: "Add them up as n + n log n + n². Which term wins when n is huge?",
      why: "The total is O(n) + O(n log n) + O(n²), and the n² term towers over the others. Making blocks 1 and 2 faster would barely change the running time.",
    },
    {
      type: "cat",
      q: "A teammate speeds up some code. Does each change move it into a <b>different</b> big-O class?",
      buckets: ["Different class", "Same class"],
      items: [
        ["Replace a nested-loop duplicate check with a <code>set</code> lookup", 0],
        ["Move to a computer that is ten times faster", 1],
        ["Delete a debug <code>print</code> inside the inner loop", 1],
        ["Replace a scan of a sorted list with binary search", 0],
        ["Make the search loop stop as soon as it finds the item", 1],
        ["Sort first, then compare only neighbours instead of every pair", 0],
      ],
      why: "Big-O is about how the work grows with n. Faster hardware, deleting a constant-time line or an early exit (the worst case still scans everything) leave the growth alone. Changing the method itself changes the class.",
    },
    {
      type: "multi",
      q: "Which statements about big-O are true? Select all.",
      o: [
        "O(n) says the time is at most a constant times n once n is big",
        "An O(n²) program always runs exactly n² steps",
        "Two O(n) programs can differ in speed by a factor of 100",
        "Big-O counts the lines of code in a program",
        "Buying a faster computer changes the big-O class",
        "An O(n log n) algorithm is also O(n²)",
      ],
      a: [0, 2, 5],
      why: "Big-O is an upper bound on growth that hides constants, so two O(n) programs may differ a lot and O(n log n) fits under O(n²). It is not an exact count, not about code length, and hardware speed only changes the constant.",
    },
    {
      type: "slider",
      q: "Binary search needs about 10 comparisons to search 1,000 sorted items. About how many for 1,000,000 items?",
      min: 0,
      max: 100,
      step: 1,
      ans: 20,
      tol: 3,
      unit: " comparisons",
      hint: "1,000,000 is 1,000 × 1,000. Each factor of 1,000 adds about 10 halvings.",
      why: "log₂(1,000,000) ≈ 20. A thousand times more data costs only 10 extra comparisons, which is why logarithmic algorithms scale so well.",
    },
  ]);

  /* =====================================================================
     a1-surfer
     ===================================================================== */
  const trailFig = (() => {
    const nodes = { A: [60, 90], B: [170, 30], C: [180, 150], D: [320, 90], E: [430, 90] };
    const edges = [
      ["A", "B"],
      ["A", "C"],
      ["B", "C"],
      ["C", "A"],
      ["C", "D"],
      ["D", "E"],
      ["E", "D"],
    ];
    const g = Qf.graph(nodes, edges, { directed: true, w: 490, h: 180, r: 17 });
    const trail = [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "E"],
      ["E", "A"],
      ["A", "C"],
      ["C", "A"],
      ["A", "E"],
    ];
    const chips = trail
      .map(([a, b], i) =>
        rowRect(
          6 + (i % 4) * 121,
          6 + Math.floor(i / 4) * 46,
          112,
          38,
          "s" + (i + 1),
          tx(62 + (i % 4) * 121, 31 + Math.floor(i / 4) * 46, `${i + 1}:  ${a} → ${b}`, { sz: 14 }),
        ),
      )
      .join("");
    return (
      g +
      `<div class="faint" style="margin:4px 0;font-weight:800">The surfer's eight moves, in order</div>` +
      svg(490, 98, chips)
    );
  })();

  const hubFig = (() => {
    const nodes = { H: [220, 140], A: [370, 140], D: [370, 45], E: [470, 45], B: [70, 55], C: [70, 225] };
    const edges = [
      ["A", "H"],
      ["B", "H"],
      ["C", "H"],
      ["H", "A"],
      ["D", "A"],
      ["E", "D"],
    ];
    return Qf.graph(nodes, edges, { pick: "nodes", directed: true, w: 520, h: 270, r: 19 });
  })();

  const visitsFig = (() => {
    const bars = [
      ["P", 0],
      ["Q", 0],
      ["R", 5030],
      ["S", 4970],
    ];
    let s = "";
    bars.forEach(([k, v], i) => {
      const x = 40 + i * 115,
        hgt = Math.round((v / 5030) * 110);
      s +=
        `<rect x="${x}" y="${140 - hgt}" width="70" height="${Math.max(hgt, 2)}" rx="8" fill="${v ? "var(--blue)" : "var(--line-2)"}"/>` +
        tx(x + 35, 160, "page " + k, { sz: 13 }) +
        tx(x + 35, 132 - hgt, v.toLocaleString("en-GB"), { sz: 13 });
    });
    return (
      svg(500, 172, s) +
      `<div class="faint" style="margin-top:4px;font-weight:800">Visits to each page in 10,000 steps</div>`
    );
  })();

  B.add("a1-surfer", [
    {
      type: "pick",
      q: "A surfer's walk is below. A <b>click</b> only follows an arrow from the page the surfer is on. Click <b>every</b> move that cannot have been a link click, so it must have been a teleport.",
      fig: trailFig,
      a: ["s5", "s8"],
      why: "E has only one link, to D, so E → A has to be a teleport. A links to B and C only, so A → E is a teleport too. All other moves follow an arrow.",
    },
    {
      type: "pick",
      q: "Two runs of the same web: one with the surfer teleporting 5% of the time, one with 50%. Click <b>every</b> page whose rank goes <b>down</b> when the teleporting becomes more frequent.",
      fig: hubFig,
      a: ["H", "A"],
      hint: "More teleporting spreads rank evenly. Who has the most to lose?",
      why: "Teleporting hands every page an equal share, so rank drains from the pages that were hoarding it. H and A (which pass rank round between them) fall from about 0.48 each to about 0.31, while B, C, D and E all rise.",
    },
    {
      type: "match",
      q: "Match each moment in the surfer story to the maths that describes it.",
      pairs: [
        ["Clicks one of the page's links at random", "A column of the link matrix: equal shares to each link"],
        ["Gets bored and jumps to any page", "The teleport term, (1 − d) ÷ n for every page"],
        ["Circles inside a closed group of pages for ever", "A rank sink, which teleporting fixes"],
        ["Share of all visits to a page, over a long walk", "That page's PageRank"],
      ],
      why: "The surfer is the picture and the matrix is the calculation: clicks make H, boredom makes the teleport term, and long-run visit shares are the PageRank.",
    },
    {
      type: "multi",
      q: "Which statements about the random surfer are true? Select all.",
      o: [
        "Where the surfer goes next depends only on the page they are on now",
        "A page with more incoming links always outranks one with fewer",
        "Teleporting lets the surfer escape a closed loop of pages",
        "The surfer remembers visited pages and avoids them",
        "Over a long walk, each page's share of visits settles down",
      ],
      a: [0, 2, 4],
      why: "The surfer is memoryless: only the current page matters. Teleporting is the escape route from loops. Visit shares settle to the PageRank. Who links to you matters as well as how many, and the surfer never avoids old pages.",
    },
    {
      type: "mcq",
      q: "A simulation of 10,000 steps produced these counts, with exactly 0 visits to P and Q. Which explanation fits best?",
      fig: visitsFig,
      o: [
        "R and S link only to each other and the surfer never teleported",
        "P and Q have a PageRank of 0.01, which rounds to zero visits",
        "P and Q are dangling pages that soaked up all the early visits",
        "Teleporting was on, but P and Q have too few incoming links",
      ],
      a: 0,
      hint: "If P had rank 0.01, about how many visits would 10,000 steps give it?",
      why: "A rank of 0.01 would give about 100 visits, and with teleporting every page gets some. An exact zero means the surfer was trapped in R and S. A dangling page would have collected visits, not none.",
    },
    {
      type: "bug",
      q: "A surfer simulation should follow a link with probability <code>d</code> (say 0.85) and teleport otherwise. It teleports almost every time. Click the faulty line.",
      code: [
        "def step(page, links, pages, d):",
        "    if random() > d:",
        "        return choice(links[page])",
        "    return choice(pages)",
      ],
      a: 1,
      why: "<code>random()</code> is below <code>d</code> with probability d, so the test should be <code>&lt; d</code>. With <code>&gt;</code> the surfer clicks a link only 15% of the time.",
    },
  ]);

  /* =====================================================================
     a1-pagerank
     ===================================================================== */
  const oneStepFig = Qf.graph(
    { A: [70, 70], B: [250, 70], C: [250, 200], D: [70, 200] },
    [
      ["A", "B"],
      ["A", "C"],
      ["A", "D"],
      ["B", "C"],
      ["C", "A"],
      ["C", "D"],
      ["D", "C"],
    ],
    { pick: "nodes", directed: true, w: 330, h: 270, r: 20 },
  );

  const qualityFig = (() => {
    const nodes = {
      s1: [40, 30],
      s2: [40, 75],
      s3: [40, 120],
      s4: [40, 165],
      s5: [40, 210],
      W: [180, 120],
      Q: [310, 120],
      t1: [250, 235],
      t2: [420, 235],
      P: [420, 160],
    };
    const edges = [
      ["s1", "W"],
      ["s2", "W"],
      ["s3", "W"],
      ["s4", "W"],
      ["s5", "W"],
      ["W", "Q"],
      ["Q", "s1"],
      ["t1", "P"],
      ["t2", "P"],
      ["P", "t1"],
    ];
    return Qf.graph(nodes, edges, { directed: true, w: 480, h: 265, r: 15 });
  })();

  B.add("a1-pagerank", [
    {
      type: "slider",
      q: "A web has 5 pages and the damping is d = 0.85. Even a page that nobody links to still receives a small steady share of rank from teleporting. How much rank is that, as a percentage of all the rank?",
      min: 0,
      max: 20,
      step: 1,
      ans: 3,
      tol: 1,
      unit: "%",
      hint: "Teleporting gives (1 − d) ÷ n to every page. Work out 0.15 ÷ 5.",
      why: "(1 − 0.85) ÷ 5 = 0.03, so every page has at least 3%. That floor is why no page in the damped matrix ever ends up at zero.",
    },
    {
      type: "pick",
      q: "Every page starts with 0.25 and there is <b>no</b> damping. Each page splits its rank equally between the pages it links to. After <b>one</b> step, which page holds the <b>least</b> rank?",
      fig: oneStepFig,
      a: "B",
      hint: "Count who links to each page, and how many links each of those pages has.",
      why: "B gets only A's third (0.25 ÷ 3 ≈ 0.08). A gets half of C's 0.25 (0.125), D gets a third of A plus half of C (about 0.21), and C collects from A, B and D (about 0.58).",
    },
    {
      type: "cat",
      q: "Think about the full damped PageRank matrix <b>G</b> (links plus teleporting). Is each statement true of it?",
      buckets: ["True of G", "Not true of G"],
      items: [
        ["Every column adds up to 1", 0],
        ["Every entry is greater than 0", 0],
        ["Every row adds up to 1", 1],
        ["Most entries are zero, so it is sparse", 1],
        ["1 is an eigenvalue, and PageRank is its eigenvector", 0],
      ],
      why: "Each column is a probability split, so it sums to 1. Teleporting adds a positive amount everywhere, which makes G dense. Rows can add up to anything: a popular page has a big row sum.",
    },
    {
      type: "multi",
      q: "You have a PageRank program that has converged. Which changes would alter the final PageRank vector? Select all.",
      o: [
        "Changing the damping from 0.85 to 0.5",
        "Starting from a random positive vector instead of equal ranks",
        "Adding one new link between two pages",
        "Stopping when the change is below 1e-8 instead of 1e-6",
        "Numbering the pages in a different order",
      ],
      a: [0, 2],
      why: "The answer depends on the web and on d. The start vector only affects the journey, the tolerance only affects when you stop, and renumbering relabels pages without changing who links to whom.",
    },
    {
      type: "mcq",
      q: "Page P has two incoming links from pages nobody links to. Page Q has just one incoming link, from W, which has five incoming links of its own. Which page ends up with the higher PageRank?",
      fig: qualityFig,
      o: [
        "Q, because its single link comes from a well-linked page",
        "P, because two incoming links beat one",
        "They tie, because every page starts with equal rank",
        "P, because it links back to a page that links to it",
      ],
      a: 0,
      why: "Run the iteration and Q settles near 0.21, P near 0.15. A link passes on a share of the rank of the page it comes from, so one link from an important page is worth more than two from pages that nobody links to.",
    },
    {
      type: "bug",
      q: "This power iteration should stop once the ranks stop changing, but it always stops after one step with a wrong answer. Click the faulty line.",
      code: [
        "p = [1 / n] * n",
        "while True:",
        "    q = matvec(G, p)",
        "    if diff(q, q) < 1e-9:",
        "        break",
        "    p = q",
      ],
      a: 3,
      why: "<code>diff(q, q)</code> compares the new vector with itself, so it is always 0. It should compare with the old one, <code>diff(q, p)</code>.",
    },
  ]);

  /* =====================================================================
     a2-dijkstra
     ===================================================================== */
  const orderGraph = Qf.graph(
    { S: [45, 130], A: [160, 50], B: [160, 210], D: [290, 50], C: [290, 210], E: [385, 50], T: [455, 150] },
    [
      ["S", "A", 4],
      ["S", "B", 2],
      ["B", "A", 1],
      ["B", "C", 5],
      ["A", "D", 3],
      ["C", "T", 2],
      ["D", "T", 6],
      ["D", "E", 2],
      ["E", "T", 3],
    ],
    { w: 500, h: 262, r: 18 },
  );
  const whatIfGraph = Qf.graph(
    { S: [40, 135], X: [140, 135], P: [250, 55], Q: [250, 150], Y: [350, 100], T: [450, 135], Z: [250, 260] },
    [
      ["S", "X", 3],
      ["X", "P", 2],
      ["P", "Y", 2],
      ["X", "Q", 3],
      ["Q", "Y", 1],
      ["Y", "T", 4],
      ["S", "Z", 10],
      ["Z", "T", 2],
    ],
    { pick: "edges", w: 490, h: 290, r: 18 },
  );
  const stopGraph = Qf.graph(
    {
      S: [45, 130],
      A: [150, 45],
      B: [150, 130],
      C: [150, 215],
      D: [275, 85],
      E: [300, 170],
      F: [300, 235],
      T: [430, 130],
    },
    [
      ["S", "A", 3],
      ["S", "B", 5],
      ["S", "C", 9],
      ["A", "D", 4],
      ["B", "D", 1],
      ["B", "E", 6],
      ["C", "F", 2],
      ["D", "T", 2],
      ["E", "T", 3],
      ["F", "T", 4],
    ],
    { pick: "nodes", w: 490, h: 262, r: 18 },
  );
  const bfsGraph = Qf.graph(
    { S: [50, 140], A: [170, 55], B: [320, 55], C: [250, 220], T: [450, 140] },
    [
      ["S", "T", 9],
      ["S", "A", 2],
      ["A", "B", 3],
      ["B", "T", 2],
      ["S", "C", 4],
      ["C", "T", 6],
    ],
    { w: 500, h: 262, r: 19 },
  );

  B.add("a2-dijkstra", [
    {
      type: "order",
      q: "Dijkstra runs from S on this map (road costs shown). Put the nodes in the order Dijkstra <b>settles</b> them, S first.",
      fig: orderGraph,
      items: ["S", "B", "A", "D", "C", "E", "T"],
      hint: "Final distances: B 2, A 3, D 6, C 7, E 8, T 9.",
      why: "Each time, Dijkstra settles the unsettled node with the smallest tentative distance: S (0), B (2), A (3 via B), D (6), C (7), E (8) and T (9 via C).",
    },
    {
      type: "match",
      q: "Dijkstra always needs the closest unsettled node. Match each graph to the way of finding it that suits best.",
      pairs: [
        ["A tiny classroom graph with 6 nodes", "Scan every node: simple and fast enough"],
        [
          "A road network with millions of junctions and about 3 roads each",
          "A binary heap that hands over the minimum",
        ],
        ["Every road costs exactly 1", "Plain breadth-first search: no priority queue needed"],
        ["Almost every pair of towns joined by its own road", "A simple array scan: the heap saves little"],
      ],
      why: "Scanning costs about n² in total. A heap costs about (n + roads) × log n, which wins hugely on sparse maps but not on dense ones. With equal costs, a queue already gives the closest node.",
    },
    {
      type: "pick",
      q: "Each road below is made <b>1 more expensive</b>, one road at a time. Click every road where doing that makes the shortest distance from S to T <b>increase</b>.",
      fig: whatIfGraph,
      a: ["S-X", "Y-T"],
      hint: "Find every shortest route first. Is there more than one?",
      why: "The shortest distance is 11, along S–X–P–Y–T and also S–X–Q–Y–T (and S–Z–T ties at 12 only after a rise). S–X and Y–T lie on every shortest route, so raising either one lifts the distance to 12. Raising a road on just one of the tied routes changes nothing.",
    },
    {
      type: "bug",
      q: "Dijkstra saves for each node the node it came from (<code>prev</code>). This should return the route from <code>s</code> to <code>t</code>, but it comes out backwards. Click the faulty line.",
      code: [
        "def route(prev, s, t):",
        "    path = [t]",
        "    while path[-1] != s:",
        "        path.append(prev[path[-1]])",
        "    return path",
      ],
      a: 4,
      why: "The loop walks from t back to s, so the list is in reverse. It should end with <code>return path[::-1]</code>.",
    },
    {
      type: "mcq",
      q: "A friend uses breadth-first search (fewest roads) on this map and drives that route. Dijkstra finds the cheapest. How do the two routes from S to T compare?",
      fig: bfsGraph,
      o: [
        "The fewest-roads route costs 2 more than the cheapest",
        "The two routes are the same",
        "The fewest-roads route costs 5 more than the cheapest",
        "The fewest-roads route is also the cheapest, but not unique",
      ],
      a: 0,
      hint: "Cheapest: S–A–B–T. Fewest roads: the single road S–T.",
      why: "BFS picks S–T, one road costing 9. Dijkstra picks S–A–B–T for 2 + 3 + 2 = 7. BFS counts roads, not costs, so it only suits maps where every road costs the same.",
    },
    {
      type: "pick",
      q: "Dijkstra stops the instant it settles T, because that is all it was asked for. Click <b>every</b> node that never gets settled.",
      fig: stopGraph,
      a: ["C", "E", "F"],
      hint: "A node is settled before T only if its distance from S is less than T's.",
      why: "Distances from S: A 3, B 5, D 6, T 8, then C 9, E 11 and F 11. Anything farther than T is still waiting when Dijkstra stops, so asking for one target saves work.",
    },
  ]);

  /* =====================================================================
     a2-astar
     ===================================================================== */
  const astarNodes = { S: [50, 130], A: [170, 50], B: [170, 210], C: [310, 50], D: [310, 210], G: [450, 130] };
  const astarGraph = inj(
    Qf.graph(
      astarNodes,
      [
        ["S", "A", 2],
        ["S", "B", 3],
        ["A", "C", 4],
        ["B", "D", 2],
        ["C", "G", 3],
        ["D", "G", 5],
        ["A", "B", 2],
      ],
      { w: 500, h: 262, r: 18 },
    ),
    hLab(astarNodes, { S: 6, A: 5, B: 3, C: 2, D: 5, G: 0 }, 34),
  );
  const heurNodes = { S: [50, 130], A: [170, 50], B: [170, 210], C: [310, 50], D: [310, 210], G: [450, 130] };
  const heurGraph = inj(
    Qf.graph(
      heurNodes,
      [
        ["S", "A", 3],
        ["S", "B", 4],
        ["A", "C", 2],
        ["B", "C", 5],
        ["C", "G", 4],
        ["B", "D", 3],
        ["D", "G", 6],
      ],
      { pick: "nodes", w: 500, h: 262, r: 18 },
    ),
    hLab(heurNodes, { S: 8, A: 7, B: 9, C: 4, D: 8, G: 0 }, 34),
  );
  const runsTable = (() => {
    const rows = [
      ["k0", "0 × Manhattan (that is Dijkstra)", "58", "16"],
      ["k1", "1 × Manhattan", "39", "16"],
      ["k3", "3 × Manhattan", "29", "18"],
      ["k6", "6 × Manhattan", "26", "20"],
    ];
    let s =
      tx(150, 18, "Heuristic used", { sz: 12, c: "var(--text-dim)" }) +
      tx(340, 18, "Cells expanded", { sz: 12, c: "var(--text-dim)" }) +
      tx(440, 18, "Path length", { sz: 12, c: "var(--text-dim)" });
    rows.forEach(([id, a, b, c], i) => {
      const y = 28 + i * 44;
      s += rowRect(
        6,
        y,
        488,
        36,
        id,
        tx(150, y + 24, a, { sz: 14 }) + tx(340, y + 24, b, { sz: 15 }) + tx(440, y + 24, c, { sz: 15 }),
      );
    });
    return svg(500, 210, s);
  })();

  B.add("a2-astar", [
    {
      type: "order",
      q: "A* runs from S to G on this graph. Each node shows its heuristic h. Put the nodes A* <b>expands</b> in order, S first. (D is never expanded, so it isn't listed.)",
      fig: astarGraph,
      items: ["S", "B", "A", "C", "G"],
      hint: "Expand the open node with the smallest f = g + h. Start: f(S) = 0 + 6.",
      why: "S (f 6). Then B (g 3, f 6) and A (g 2, f 7). B's neighbour D gets f = 5 + 5 = 10. A leads to C (g 6, f 8), then G (g 9, f 9). D's f of 10 is above the goal's 9, so A* finishes before touching it.",
    },
    {
      type: "pick",
      q: "The same maze was searched four times with the heuristic multiplied by a different number. Dijkstra's run (0 ×) is always shortest. Click <b>every</b> run that returned a longer-than-shortest path.",
      fig: runsTable,
      a: ["k3", "k6"],
      why: "The shortest path is 16. Multiplying by 3 or 6 makes the heuristic overestimate, so A* chases the goal and expands fewer cells but accepts a longer path (18 and 20). Weight 1 is safe and still beats Dijkstra on work.",
    },
    {
      type: "bug",
      q: "This A* sets a node's cost the first time it sees it and never improves it. It sometimes returns a long route. Click the faulty line.",
      code: [
        "for nb, w in graph[u]:",
        "    new_g = g[u] + w",
        "    if nb not in g:",
        "        g[nb] = new_g",
        "        push(open, (new_g + h(nb), nb))",
      ],
      a: 2,
      why: "A cheaper way to reach a node already seen must be accepted. The test should be <code>if nb not in g or new_g &lt; g[nb]:</code>.",
    },
    {
      type: "match",
      q: "Pick the best search for each job.",
      pairs: [
        ["Shortest route through a maze where every step costs 1", "Breadth-first search"],
        ["Cheapest route on a road map, with no idea where the goal is", "Dijkstra"],
        ["Cheapest route on a road map, and you know the goal's coordinates", "A* with a straight-line heuristic"],
        ["Shortest paths when some edges can be negative", "Bellman–Ford"],
      ],
      why: "A* needs a location sense (a heuristic) to beat Dijkstra. Dijkstra needs non-negative costs, and BFS only counts steps.",
    },
    {
      type: "pick",
      q: "A* is being tested with the heuristic values h shown under each node, and the goal is G. Click <b>every</b> node where h overestimates the real remaining cost, so A* can no longer be trusted.",
      fig: heurGraph,
      a: ["A", "D"],
      hint: "True cost from A: A–C–G. From D: D–G.",
      why: "From A the true cost is 2 + 4 = 6 but h says 7. From D it is 6 but h says 8. At S (true 9, h 8), B (true 9, h 9) and C (true 4, h 4) the guesses are fine. One bad node is enough to lose the guarantee.",
    },
  ]);

  /* =====================================================================
     a2-routing
     ===================================================================== */
  const loopFig = (() => {
    const P = { A: [50, 150], B: [160, 150], C: [270, 150], F: [380, 150], D: [160, 50], E: [270, 50] };
    const links = [
      ["A", "B"],
      ["B", "C"],
      ["B", "D"],
      ["D", "E"],
      ["E", "F"],
    ];
    let s = links
      .map(
        ([a, b]) =>
          `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="var(--line-2)" stroke-width="3"/>`,
      )
      .join("");
    s +=
      `<line x1="270" y1="150" x2="380" y2="150" stroke="var(--rose)" stroke-width="3" stroke-dasharray="6 5"/>` +
      tx(325, 140, "✗", { sz: 18, c: "var(--rose-ink)" });
    const arrow = (x1, y1, x2, y2) =>
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--amber)" stroke-width="4" stroke-linecap="round" marker-end="url(#lpa)"/>`;
    s +=
      arrow(72, 150, 134, 150) +
      arrow(182, 134, 246, 134) +
      arrow(248, 166, 184, 166) +
      arrow(182, 50, 244, 50) +
      arrow(286, 66, 358, 130);
    Object.entries(P).forEach(([k, [x, y]]) => {
      const c =
        `<circle cx="${x}" cy="${y}" r="20" fill="var(--panel)" stroke="${k === "F" ? "var(--teal)" : "var(--line-2)"}" stroke-width="3"/>` +
        tx(x, y + 5, k, { sz: 15 });
      s += k === "F" ? `<g>${c}</g>` : `<g data-pick="${k}">${c}</g>`;
    });
    return (
      `<svg viewBox="0 0 440 200" style="width:100%;max-height:200px"><defs><marker id="lpa" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--amber)"/></marker></defs>${s}</svg>` +
      `<div class="faint" style="font-weight:800">Orange arrows: each router's next hop towards F. The link C–F has just failed.</div>`
    );
  })();

  B.add("a2-routing", [
    {
      type: "cat",
      q: "Router A has a table of costs and the neighbour B (the A–B link costs 2) has just advertised its own costs. What should A do with each entry?",
      buckets: ["A changes its entry", "A keeps its entry"],
      items: [
        ["P: A has 9 (not via B). B says P is 5 away.", 0],
        ["Q: A has 6 (not via B). B says Q is 4 away.", 1],
        ["R: A has 5 (not via B). B says R is 1 away.", 0],
        ["T: A has 8 (not via B). B says T is 7 away.", 1],
        ["U: A has no route. B says U is 12 away.", 0],
        ["V: A has 4, and the route goes <b>via B</b>. B now says V is 6 away.", 0],
      ],
      why: "A adds 2 to B's number: P 7 beats 9, Q 6 only ties 6 so it stays, R 3 beats 5, T 9 loses to 8, U 14 beats having nothing. V is the sneaky one: A's route goes through B, so when B's cost rises A must follow it to 8, even though that is worse.",
    },
    {
      type: "pick",
      q: "After the failure, the routers' tables are out of step. A packet for F follows the next hops shown. Click <b>every</b> router that is stuck in a routing loop.",
      fig: loopFig,
      a: ["B", "C"],
      why: "B sends the packet to C, and C sends it straight back to B, so it bounces between them until its time runs out. A is only passing it on to B, and D and E still have a working route.",
    },
    {
      type: "slider",
      q: "A, B and C sit in a line, each link costing 1. The link B–C breaks. A still believes C is 2 away, and B believes it from A, so each router raises its cost by 1 on every exchange. RIP treats a cost of 16 as unreachable. B's first new cost is 3. How many table updates, counting that first one, happen before the cost reaches 16?",
      min: 0,
      max: 30,
      step: 1,
      ans: 14,
      tol: 2,
      unit: " updates",
      hint: "The costs go 3, 4, 5, and so on, one per update, until 16.",
      why: "The two routers keep trading the news that C is reachable, adding 1 each time: 3, 4, 5, ..., 16. That is 14 updates of slow counting. Poisoned reverse stops it at once.",
    },
    {
      type: "bug",
      q: "A link-state router should pass each new advertisement on once. This one keeps re-flooding the same advertisements for ever. Click the faulty line.",
      code: [
        "def on_lsa(lsa):",
        "    old = seen.get(lsa.src, 0)",
        "    if lsa.seq >= old:",
        "        seen[lsa.src] = lsa.seq",
        "        flood(lsa)",
      ],
      a: 2,
      why: "With <code>&gt;=</code> an advertisement that was already seen still passes the test, so every router forwards it again and again. Only a strictly newer sequence number (<code>&gt;</code>) should be flooded.",
    },
    {
      type: "match",
      q: "Match each kind of router to what it knows.",
      pairs: [
        ["A link-state router", "The whole map: every router and every link cost"],
        ["A distance-vector router", "Its neighbours' claims about how far things are"],
        ["Both kinds", "The cost of their own directly connected links"],
        ["Neither kind", "A central server that holds the map for them"],
      ],
      why: "Link-state routers each build the full map and run Dijkstra. Distance-vector routers only trade tables with neighbours. Both start from their own links, and there is no central server.",
    },
  ]);

  /* =====================================================================
     a3-lp
     ===================================================================== */
  const regionFig = Qf.points(
    { O: [0, 0], X: [5, 0], Y: [5, 3], Z: [0, 8] },
    { max: 10, w: 400, h: 300, pick: false, poly: ["O", "X", "Y", "Z"] },
  );
  const cornerFig = Qf.points(
    { A: [0, 0], B: [5, 0], C: [4, 4], D: [1, 5] },
    { max: 6, w: 400, h: 300, pick: false, poly: ["A", "B", "C", "D"] },
  );
  const redundantFig = (() => {
    const W = 460,
      H = 280,
      X = (x) => 40 + x * 46,
      Y = (y) => H - 30 - y * 30;
    const poly = [
      [0, 0],
      [4, 0],
      [4, 2],
      [1, 5],
      [0, 5],
    ]
      .map(([x, y]) => `${X(x)},${Y(y)}`)
      .join(" ");
    let s = `<polygon points="${poly}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2"/>`;
    s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(8)}" y2="${Y(0)}" stroke="var(--line-2)" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(8)}" stroke="var(--line-2)" stroke-width="2"/>`;
    const L = (id, x1, y1, x2, y2, lx, ly, t, col) =>
      `<g data-pick="${id}"><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${col}" stroke-width="3"/><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="transparent" stroke-width="18"/>${tx(X(lx), Y(ly), t, { sz: 13, c: col })}</g>`;
    s += L("c1", 0, 6.4, 6.4, 0, 6.2, 0.4, "x + y ≤ 6", "var(--blue-ink)");
    s += L("c2", 4, 0, 4, 7.4, 4.5, 7.5, "x ≤ 4", "var(--violet-ink)");
    s += L("c3", 0, 7, 8, 3, 6.3, 3.6, "x + 2y ≤ 14", "var(--amber-ink)");
    s += L("c4", 0, 5, 7, 5, 6.5, 5.5, "y ≤ 5", "var(--rose-ink)");
    return (
      svg(W, H, s) +
      `<div class="faint" style="font-weight:800">The shaded area is what all four constraints allow, with x, y ≥ 0.</div>`
    );
  })();

  B.add("a3-lp", [
    {
      type: "match",
      q: "A bakery makes <b>x</b> trays of buns and <b>y</b> cakes. Match each sentence to its place in the linear program.",
      pairs: [
        ["A tray takes 2 hours and a cake takes 3, and only 40 hours are available", "2x + 3y ≤ 40"],
        ["At least 5 trays must be made", "x ≥ 5"],
        ["A tray earns 4 and a cake earns 5, as much as possible", "Maximise 4x + 5y"],
        ["You cannot bake a negative number of anything", "x ≥ 0 and y ≥ 0"],
      ],
      why: "Resources and requirements become constraints, the thing you want becomes the objective, and the obvious facts (no negative amounts) still have to be written down.",
    },
    {
      type: "slider",
      q: "Maximise profit z = 3x + 2y. The shaded plans obey x + y ≤ 8 and x ≤ 5 (best corner (5, 3), z = 21). The limit grows to x + y ≤ 10, with x ≤ 5 unchanged. What is the best profit now?",
      fig: regionFig,
      min: 15,
      max: 40,
      step: 1,
      ans: 25,
      tol: 2,
      unit: "",
      hint: "The best corner moves up to x = 5 and y = 10 − 5. Work out 3 × 5 + 2 × 5.",
      why: "The new corner is (5, 5), giving 15 + 10 = 25. The extra 2 units of the first limit were worth 4 profit, so it is a valuable constraint to relax.",
    },
    {
      type: "multi",
      q: "A plan must obey x + y ≤ 6 with x, y ≥ 0. Adding one more constraint to this list, which would leave <b>no</b> feasible plan at all? Select all.",
      o: ["x + y ≥ 8", "x ≥ 7", "y ≥ 2", "x − y ≤ 3", "x + y ≥ 6"],
      a: [0, 1],
      why: "x + y ≥ 8 and x + y ≤ 6 contradict each other, and x ≥ 7 pushes x past the largest value x + y ≤ 6 allows. y ≥ 2 and x − y ≤ 3 still leave plans such as (1, 3), and x + y ≥ 6 leaves the whole line x + y = 6 feasible.",
    },
    {
      type: "order",
      q: "Order the four corners of the feasible region from the <b>lowest</b> to the highest value of z = 2x + 3y.",
      fig: cornerFig,
      items: ["A", "B", "D", "C"],
      hint: "Read each corner's x and y off the grid: z = 2x + 3y.",
      why: "A (0, 0) gives 0, B (5, 0) gives 10, D (1, 5) gives 17 and C (4, 4) gives 20. The best corner is C, and checking corners is enough because the best value always sits on one.",
    },
    {
      type: "pick",
      q: "One of these four constraints is <b>redundant</b>: deleting it would not change the feasible region at all. Click it.",
      fig: redundantFig,
      a: "c3",
      hint: "Look at which lines actually form the edges of the shaded area.",
      why: "x + 2y ≤ 14 lies far outside the shaded area, so the other three constraints already keep every plan inside it (at the corner (1, 5), x + 2y is only 11). Removing x + y ≤ 6, x ≤ 4 or y ≤ 5 would each enlarge the region.",
    },
  ]);
})();

/* ===== bank-w-algo-2.js ===== */
/* ALGO revision bank, second set of visual and varied questions, part 2. */
(function () {})();

/* ===== bank-w-algo-3.js ===== */
/* ALGO revision bank, second set of visual and varied questions, part 3 (Phases 6 to 10).
   Every number was produced by running the real algorithms in node (CRC division, LZW, entropy, SHA-256, DFT). */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG helpers (CSS variables so both themes work) ---------- */
  const SVG = (w, h, inner, label) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto" role="img" aria-label="${label}">${inner}</svg>`;
  const TX = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" fill="${o.f || "var(--text)"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "ui-monospace,Consolas,monospace" : "var(--sans)"}">${s}</text>`;
  const RC = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r == null ? 8 : o.r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const LN = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });

  /* ==================== a6-crc ==================== */
  // four corrupted copies of the valid frame 1101011110; flipped bits shown in red
  const crcFramesFig = (() => {
    const sent = "1101011110";
    const rows = [
      ["B", "1101111110"],
      ["C", "1100000110"],
      ["D", "1110111110"],
      ["E", "0110011110"],
    ];
    let s = TX(8, 20, "Sent: " + sent + "  (generator 1011)", { a: "start", m: 1, s: 13 });
    rows.forEach(([id, bits], r) => {
      const y = 36 + r * 40;
      let cells = "";
      for (let i = 0; i < 10; i++) {
        const bad = bits[i] !== sent[i];
        cells +=
          RC(70 + i * 30, y, 26, 30, {
            r: 6,
            f: bad ? "var(--rose)" : "var(--panel)",
            fo: bad ? 0.28 : 1,
            k: bad ? "var(--rose)" : "var(--line-2)",
          }) + TX(83 + i * 30, y + 21, bits[i], { m: 1, s: 15 });
      }
      s += PK(
        id,
        RC(2, y - 4, 376, 38, { r: 8, f: "var(--panel)", k: "transparent", w: 1 }) +
          TX(36, y + 21, "Copy " + id, { s: 13 }) +
          cells,
      );
    });
    return SVG(380, 200, s, "Four received copies of a CRC frame with the flipped bits marked in red");
  })();
  // long division by 11
  const crc11Fig = SVG(
    300,
    124,
    TX(150, 18, "Message 1011 plus one zero, divided by 11", { s: 13 }) +
      ["10110 ⊕ 11000 = 01110", "01110 ⊕ 01100 = 00010", "00010 ⊕ 00011 = 00001"]
        .map((t, i) => TX(150, 46 + i * 24, t, { m: 1, s: 15 }))
        .join("") +
      TX(150, 116, "Remainder: 1", { f: "var(--teal)", s: 15 }),
    "XOR long division of 10110 by 11 leaving remainder 1",
  );

  B.add("a6-crc", [
    {
      type: "pick",
      q: "The receiver checks every frame by dividing by the generator 1011. All four copies below were corrupted in transit (the flipped bits are red). Which TWO would the receiver wrongly accept?",
      fig: crcFramesFig,
      a: ["C", "E"],
      hint: "A frame passes if the error pattern divides evenly by 1011. Look at what the red bits spell.",
      why: "Copies C and E have a red pattern of exactly 1011 (shifted along the frame). The error is then a multiple of the generator, so the remainder stays 000 and the damage is invisible. B (one flip) and D (a 3-bit burst, 111) are not multiples of 1011, so the check fails and the receiver notices.",
    },
    {
      type: "mcq",
      q: "A CRC uses the tiny 2-bit generator 11. The working shows its remainder for the message 1011. What is this CRC really doing?",
      o: [
        "Making an even-parity bit",
        "Building a 2D parity grid",
        "Computing a Hamming syndrome",
        "Always returning zero",
      ],
      a: 0,
      fig: crc11Fig,
      why: "Dividing by 11 (that is, x + 1) leaves 1 when the number of 1s is odd and 0 when it is even. That is exactly the even-parity bit. A longer generator checks more patterns, so parity is just the smallest CRC.",
      hint: "1011 has three 1s. Is that odd or even?",
    },
    {
      type: "slider",
      q: "A link uses a CRC with a 3-bit remainder. Total garbage arrives instead of a real frame, so every remainder is equally likely. Out of 100 such junk frames, about how many are wrongly accepted?",
      min: 0,
      max: 50,
      step: 1,
      ans: 12,
      tol: 3,
      unit: " frames",
      why: "Junk lands on remainder 000 with probability 1 in 2³ = 1 in 8, which is about 12 in 100. This is why real CRCs use 16 or 32 bits: the chance of slipping through is 1 in 65,536 or 1 in 4 billion.",
    },
    {
      type: "match",
      q: "Match each error-checking scheme to what it can do.",
      pairs: [
        ["One parity bit", "Spots any odd number of flips"],
        ["2D parity grid", "Finds a flip where a failing row meets a failing column"],
        ["CRC with a 4-bit generator", "Catches every burst of up to 3 flipped bits in a row"],
        ["Hamming(7,4)", "Reads the position of one flip straight from the syndrome"],
      ],
      why: "A single parity bit counts 1s, so even numbers of flips cancel. The grid crosses a bad row with a bad column. A CRC's remainder is sensitive to short bursts. Hamming's three overlapping checks spell out the position in binary.",
    },
    {
      type: "bug",
      q: "The sender should append a CRC so that the whole frame divides evenly by the generator. The receiver keeps rejecting good frames. Click the faulty line.",
      code: ["def send(msg, gen):", "    k = len(gen) - 1", "    rem = mod2(msg, gen)", "    return msg + rem"],
      a: 2,
      why: 'The remainder must be computed on the message with k zeros appended: mod2(msg + "0" * k, gen). Without the zeros, the remainder is about the wrong number, and the finished frame no longer divides evenly.',
    },
  ]);

  /* ==================== a6-hamming ==================== */
  // which of the three groups failed, no binary given
  const hamGroupFig = (() => {
    const groups = [
      ["p1", [1, 3, 5, 7], false],
      ["p2", [2, 3, 6, 7], true],
      ["p4", [4, 5, 6, 7], true],
    ];
    let s = TX(8, 16, "Bit position", { a: "start", s: 12, f: "var(--text-2, var(--text))" });
    for (let i = 1; i <= 7; i++)
      s += PK("c" + i, RC(46 + (i - 1) * 46, 24, 40, 34, { r: 8 }) + TX(66 + (i - 1) * 46, 47, i, { s: 16 }));
    groups.forEach(([n, mem, fail], r) => {
      const y = 92 + r * 38;
      s += TX(8, y + 5, n + " group", { a: "start", s: 13 });
      for (let i = 1; i <= 7; i++)
        s += mem.includes(i)
          ? `<circle cx="${66 + (i - 1) * 46}" cy="${y}" r="9" fill="var(--blue)"/>`
          : `<circle cx="${66 + (i - 1) * 46}" cy="${y}" r="3" fill="var(--line-2)"/>`;
      s += TX(396, y + 5, fail ? "✗ fails" : "✓ ok", { a: "start", s: 13, f: fail ? "var(--rose)" : "var(--teal)" });
    });
    return SVG(450, 188, s, "Seven bit positions with the groups p1, p2 and p4; p2 and p4 fail, p1 passes");
  })();
  // 3-bit repetition code drawn as a path of single flips
  const hamPathFig = (() => {
    const w = ["000", "100", "110", "111"];
    let s =
      TX(60, 26, "codeword A", { f: "var(--teal)", s: 13 }) + TX(360, 26, "codeword B", { f: "var(--teal)", s: 13 });
    w.forEach((t, i) => {
      const x = 20 + i * 100,
        cw = i === 0 || i === 3;
      s += PK(
        "w" + i,
        RC(x, 36, 80, 38, { r: 10, k: cw ? "var(--teal)" : "var(--line-2)" }) + TX(x + 40, 61, t, { m: 1, s: 18 }),
      );
      if (i < 3)
        s +=
          TX(x + 90, 60, "→", { s: 18, f: "var(--text-2, var(--text))" }) +
          TX(x + 90, 92, "1 flip", { s: 11, f: "var(--text-2, var(--text))" });
    });
    return SVG(
      420,
      104,
      s,
      "A line of four words: codeword A is 000, then 100, 110, and codeword B is 111, each one flip apart",
    );
  })();

  B.add("a6-hamming", [
    {
      type: "pick",
      q: "A Hamming(7,4) receiver checks its three groups (blue dots show who is in each). Groups p2 and p4 fail and p1 passes. Exactly one bit flipped. Tap it.",
      fig: hamGroupFig,
      a: "c6",
      hint: "The flipped bit sits in every failing group and in no passing group.",
      why: "Position 6 is the only one in both p2 and p4 and outside p1. Positions 2 and 4 would fail only one group each, and 7 would also fail p1. Reading failing groups as 1s (p4 p2 p1 = 110) gives 6 in binary, the same answer.",
    },
    {
      type: "pick",
      q: "In this 3-bit repetition code the codewords are A = 000 and B = 111, so they differ in 3 places. The receiver decodes to whichever codeword is nearest. Tap every received word that gets decoded as A.",
      fig: hamPathFig,
      a: ["w0", "w1"],
      why: "000 is A itself, and 100 is one flip from A but two from B, so it decodes to A. But 110 is one flip from B, so it decodes to B: two flips fool the decoder. A distance of 3 can therefore fix one error, and Hamming(7,4) has the same minimum distance of 3.",
    },
    {
      type: "cat",
      q: "Hamming(7,4) is extended with one extra overall-parity bit (SECDED). What happens to the decoded data in each case?",
      buckets: ["Fixed correctly", "Flagged, can't be fixed", "Silently decoded wrong"],
      items: [
        ["One data bit flips", 0],
        ["One check bit flips", 0],
        ["Only the extra parity bit flips", 0],
        ["Two bits flip", 1],
        ["Three bits flip", 2],
      ],
      why: "One flip is always located and fixed, even when it hits a check bit or the extra bit (the data is untouched). Two flips leave the overall parity looking fine but the syndrome non-zero, so the decoder shouts for a resend. Three flips look like one, so the decoder confidently flips the wrong bit.",
    },
    {
      type: "slider",
      q: "A Hamming code protects a block of 127 bits using 7 check bits, and the rest are data. About what percentage of the block is check bits?",
      min: 0,
      max: 50,
      step: 1,
      ans: 6,
      tol: 2,
      unit: "%",
      hint: "7 out of 127 is about 7 out of 130, which is 1 out of 19.",
      why: "7 / 127 ≈ 5.5%. Check bits grow only as log₂ of the block size, so big Hamming blocks are cheap. Compare Hamming(7,4), where 3 of 7 bits (43%) are checks.",
    },
    {
      type: "bug",
      q: "This Hamming(7,4) decoder should compute the syndrome as p4 p2 p1 in binary, but it names the wrong position for some errors. Click the faulty line.",
      code: [
        "def syndrome(w):",
        "    s = 0",
        "    if w[1]^w[3]^w[5]^w[7]: s += 1",
        "    if w[2]^w[3]^w[6]^w[7]: s += 2",
        "    if w[4]^w[5]^w[6]^w[7]: s += 2",
        "    return s",
      ],
      a: 4,
      why: "The p4 group should add 4, the value of the 4s place. With 2 added, errors in positions 4 to 7 point at the wrong place, and an error at position 4 would be read as position 2.",
    },
  ]);

  /* ==================== a7-entropy ==================== */
  const bars4 = (x, y, p, w, h, f) =>
    p
      .map((v, i) => {
        const bh = Math.max(2, v * h);
        return RC(x + i * (w / 4) + 3, y + h - bh, w / 4 - 8, bh, {
          r: 3,
          f: f || "var(--blue)",
          k: f || "var(--blue)",
          w: 1,
        });
      })
      .join("");
  const entBarsFig = (() => {
    const p = [0.5, 0.25, 0.125, 0.125];
    let s = bars4(60, 20, p, 220, 100);
    p.forEach((v, i) => {
      s += TX(60 + i * 55 + 27, 138, "ABCD"[i], { s: 14 }) + TX(60 + i * 55 + 27, 16 + 100 - v * 100 - 4, v, { s: 12 });
    });
    s += LN(54, 120, 286, 120);
    return SVG(340, 150, s, "Bar chart of four symbol probabilities: A 0.5, B 0.25, C 0.125, D 0.125");
  })();
  const entPickFig = (() => {
    const src = [
      ["P", [0.25, 0.25, 0.25, 0.25]],
      ["Q", [0.4, 0.3, 0.2, 0.1]],
      ["R", [0.7, 0.1, 0.1, 0.1]],
      ["S", [0.3, 0.3, 0.2, 0.2]],
    ];
    let s = "";
    src.forEach(([n, p], i) => {
      const x = 8 + (i % 2) * 190,
        y = 6 + Math.floor(i / 2) * 124;
      s += PK(
        n,
        RC(x, y, 178, 114, { r: 10 }) +
          TX(x + 89, y + 18, "Source " + n, { s: 13 }) +
          bars4(x + 14, y + 28, p, 150, 66) +
          LN(x + 14, y + 94, x + 164, y + 94, { w: 1 }) +
          [0, 1, 2, 3].map((k) => TX(x + 14 + k * 37.5 + 18, y + 108, "ABCD"[k], { s: 11 })).join(""),
      );
    });
    return SVG(380, 256, s, "Four bar charts of probabilities over four symbols for sources P, Q, R and S");
  })();

  B.add("a7-entropy", [
    {
      type: "slider",
      q: "I secretly pick one of four symbols with the chances shown. You ask the best possible yes/no questions to find it out. On average, how many questions do you need?",
      fig: entBarsFig,
      min: 0,
      max: 4,
      step: 0.25,
      ans: 1.75,
      tol: 0.1,
      unit: " questions",
      hint: 'Ask "Is it A?" first. Half the time you are done after one question.',
      why: "Ask about A first (1 question, half the time), then B (2 questions, a quarter of the time), then C or D (3 questions, an eighth each). 0.5×1 + 0.25×2 + 0.125×3 + 0.125×3 = 1.75, which is exactly the entropy. Four equal symbols would need 2.",
    },
    {
      type: "pick",
      q: "Each source sends one of four symbols (A, B, C, D) with the chances shown. Tap the one source whose messages can't be squeezed below 2 bits per symbol, however clever the code.",
      fig: entPickFig,
      a: "P",
      why: "Only the perfectly even source P is already at the 2-bit maximum. Even a gentle skew like S (0.3, 0.3, 0.2, 0.2) has less than 2 bits of entropy, so a good code can save a little. You don't need an extreme skew for compression to work.",
    },
    {
      type: "order",
      q: "Order these sources from LOWEST entropy to HIGHEST.",
      items: [
        "A coin that lands heads 9 times in 10",
        "A fair coin",
        "A fair three-sided spinner",
        "Two fair coins flipped together",
      ],
      why: "The 90/10 coin is mostly predictable (about 0.47 bits). The fair coin gives 1 bit, the three-way spinner log₂ 3 ≈ 1.58 bits, and two fair coins together give 1 + 1 = 2 bits.",
    },
    M(
      "Sensor B always sends an exact copy of whatever sensor A reports, and A is a fair coin flip each second. How much entropy does the PAIR (A, B) carry per second?",
      ["1 bit", "2 bits", "0.5 bits", "0 bits"],
      0,
      "Once you have seen A, B holds no surprise, so the pair carries only A's 1 bit. Entropy adds up only for independent sources, and copying is the opposite of independent. Duplicated data is redundancy, which compression removes.",
    ),
    {
      type: "bug",
      q: "This function should return the entropy of a probability list, the AVERAGE surprise. For a fair four-sided die it returns 8 instead of 2. Click the faulty line.",
      code: [
        "from math import log2",
        "def H(p):",
        "    h = 0",
        "    for x in p:",
        "        h += log2(1 / x)",
        "    return h",
      ],
      a: 4,
      why: "Each symbol's surprise log₂(1/x) must be weighted by how often it happens: h += x * log2(1 / x). Without the weight it just adds up the surprises of all four symbols: 4 × 2 = 8.",
    },
  ]);

  /* ==================== a7-huffman ==================== */
  const huffNodesFig = (() => {
    const nodes = [
      ["C", "C", 12, ""],
      ["D", "D", 13, ""],
      ["AB", "A + B", 14, "(already merged)"],
      ["E", "E", 16, ""],
      ["F", "F", 45, ""],
    ];
    let s = TX(8, 18, "Waiting to be merged, sorted by weight:", { a: "start", s: 13 });
    nodes.forEach(([id, lab, w, sub], i) => {
      const x = 8 + i * 82;
      s += PK(
        id,
        RC(x, 30, 74, 66, { r: 10, k: id === "AB" ? "var(--violet)" : "var(--line-2)" }) +
          TX(x + 37, 52, lab, { s: 13 }) +
          TX(x + 37, 79, w, { s: 20, f: "var(--blue)" }) +
          (sub ? TX(x + 37, 91, "sub-tree", { s: 9, w: 700 }) : ""),
      );
    });
    return SVG(420, 108, s, "Five nodes with weights C 12, D 13, A+B 14, E 16 and F 45");
  })();

  B.add("a7-huffman", [
    {
      type: "pick",
      q: "Huffman's algorithm is part-way through. A and B (weights 5 and 9) have already been merged into one sub-tree of weight 14. Tap the TWO nodes it merges next.",
      fig: huffNodesFig,
      a: ["C", "D"],
      why: "Huffman always merges the two lightest nodes available: 12 and 13. The new node weighs 25. The sub-tree A+B (14) is not special just because it was built earlier; it simply isn't one of the two smallest. F (45) will be merged last, so it ends up with a very short code.",
    },
    {
      type: "order",
      q: "A decoder gets the bit stream 11010011100 using A = 0, B = 10, C = 110, D = 111. List the decoded symbols in the order they come out.",
      items: ["C", "B", "A", "D", "A", "A"],
      hint: "Read bits until they match a codeword, write it down, then start again.",
      why: "110 | 10 | 0 | 111 | 0 | 0 = C B A D A A. Because no codeword starts another, the first match is always the right one, so decoding never needs separators or to look ahead.",
    },
    {
      type: "cat",
      q: "A source sends N with probability 0.97 and Y with probability 0.03. Is each statement true or false?",
      buckets: ["True", "False"],
      items: [
        ["The entropy is under 0.5 bits per symbol", 0],
        ["Huffman gives N a 1-bit codeword", 0],
        ["Huffman's average length can go below 1 bit per symbol", 1],
        ["Huffman reaches the entropy for this source", 1],
        ["Coding pairs of symbols together could get closer to the entropy", 0],
      ],
      why: "The entropy is only about 0.19 bits per symbol, but any codeword needs at least one whole bit, so Huffman spends exactly 1 bit per symbol here, five times the entropy. Grouping symbols into pairs or longer blocks (or using arithmetic coding) lets the cost per symbol drop below 1 bit.",
    },
    {
      type: "bug",
      q: "This decoder for a prefix code works for the first symbol, then outputs garbage. Click the faulty line.",
      code: [
        "def decode(bits, code):",
        '    out, cur = [], ""',
        "    for b in bits:",
        "        cur += b",
        "        if cur in code:",
        "            out.append(code[cur])",
        "            cur = cur[1:]",
        '    return "".join(out)',
      ],
      a: 6,
      why: 'After a codeword is found, the buffer must be emptied: cur = "". Dropping only the first bit leaves the rest of the old codeword in the buffer, so every later match is polluted by leftover bits.',
    },
  ]);

  /* ==================== a7-lzw ==================== */
  const lzwStrings = ["ABACADAE", "ABCDEFAB", "ABABABAB", "ABCDEFGH"];
  const lzwFig = (() => {
    let s = TX(8, 18, "Dictionary starts with A to H = codes 0 to 7", { a: "start", s: 12 });
    lzwStrings.forEach((t, i) => {
      const y = 28 + i * 40;
      s += PK(
        "s" + i,
        RC(2, y - 2, 296, 36, { r: 9 }) +
          TX(18, y + 22, "S" + (i + 1), { s: 13, a: "start" }) +
          t
            .split("")
            .map((c, k) => TX(76 + k * 26, y + 23, c, { m: 1, s: 17 }))
            .join(""),
      );
    });
    return SVG(300, 192, s, "Four 8-letter strings S1 to S4 for LZW");
  })();
  const lzwDictFig = SVG(
    380,
    66,
    TX(8, 18, "After encoding, the table's new entries were:", { a: "start", s: 13 }) +
      [
        ["2", "AB"],
        ["3", "BA"],
        ["4", "AA"],
        ["5", "ABA"],
      ]
        .map(
          ([c, t], i) => RC(8 + i * 90, 28, 82, 32, { r: 8 }) + TX(8 + i * 90 + 41, 49, c + " = " + t, { m: 1, s: 14 }),
        )
        .join(""),
    "LZW table entries 2 = AB, 3 = BA, 4 = AA, 5 = ABA",
  );

  B.add("a7-lzw", [
    {
      type: "pick",
      q: "LZW starts with a dictionary of single letters A to H. Tap every string for which it sends FEWER codes than the 8 letters.",
      fig: lzwFig,
      a: ["s1", "s2"],
      hint: "LZW only saves when a phrase of two or more letters appears again.",
      why: "S3 (ABABABAB) repeats AB and ABA, giving 5 codes. S2 (ABCDEFAB) has AB at the end, which is already in the table, so 7 codes. S1 repeats the single letter A, but A alone is already a code, and every pair (AB, BA, AC…) is new, so it needs 8 codes. S4 has no repeats at all (8 codes).",
    },
    {
      type: "mcq",
      q: "These are the new dictionary entries an LZW encoder created, in order. Which 7-letter input produced them? (A = 0, B = 1.)",
      o: ["ABAABAB", "ABABAAB", "ABBABAB", "ABABABA"],
      a: 0,
      fig: lzwDictFig,
      hint: "The first entry AB means the input starts ABA…; the third entry AA means two As in a row appear soon.",
      why: "ABAABAB: A, B, A, AB, AB gives entries AB, BA, AA, ABA in that order. ABABAAB builds AB, BA, ABA, AA, with the last two in swapped order. ABBABAB would add BB, and ABABABA builds only AB, BA and ABA.",
    },
    {
      type: "slider",
      q: "An LZW encoder sends fixed 12-bit codes for 8-bit characters. Suppose the text has no repeated phrases at all, so every code stands for a single character. The output is what percentage of the input size?",
      min: 50,
      max: 200,
      step: 10,
      ans: 150,
      tol: 15,
      unit: "%",
      hint: "12 bits for every 8 bits of input.",
      why: "12 / 8 = 1.5, so the output is about 150% of the input. LZW can expand data that has nothing repeated, which is why compressing an already-compressed file is a bad idea.",
    },
    {
      type: "bug",
      q: "This LZW decoder should rebuild the table the way the encoder did. Its output is right for a few codes, then goes wrong. Click the faulty line.",
      code: [
        "def decode(codes, table):",
        "    prev = table[codes[0]]",
        "    out = prev",
        "    for c in codes[1:]:",
        "        if c in table: cur = table[c]",
        "        else: cur = prev + prev[0]",
        "        out += cur",
        "        table[len(table)] = prev + cur",
        "        prev = cur",
        "    return out",
      ],
      a: 7,
      why: "The new entry is the previous output plus only the FIRST character of the current one: prev + cur[0]. Adding the whole of cur makes the entry far too long, and every later code that points at it expands to the wrong text.",
    },
  ]);

  /* ==================== a8-hash ==================== */
  const pwFig = (() => {
    const rows = [
      ["alice", "a941a4c4"],
      ["bob", "e5133159"],
      ["carol", "a941a4c4"],
      ["dan", "1c8bfe8f"],
    ];
    let s =
      TX(8, 18, "User", { a: "start", s: 12 }) +
      TX(140, 18, "Stored SHA-256 (first 8 hex digits)", { a: "start", s: 12 });
    rows.forEach(([u, h], i) => {
      const y = 28 + i * 38;
      s += PK(
        u,
        RC(2, y, 356, 32, { r: 8 }) +
          TX(16, y + 21, u, { a: "start", s: 14 }) +
          TX(140, y + 21, h, { a: "start", m: 1, s: 15 }),
      );
    });
    return SVG(360, 188, s, "A password table where alice and carol have the same stored digest");
  })();
  const chain5Fig = (() => {
    let s = "";
    for (let i = 1; i <= 5; i++) {
      const x = 6 + (i - 1) * 84,
        ed = i === 2;
      s +=
        RC(x, 24, 74, 62, {
          r: 8,
          k: ed ? "var(--amber)" : "var(--line-2)",
          f: ed ? "var(--amber)" : "var(--panel)",
          fo: ed ? 0.2 : 1,
        }) +
        TX(x + 37, 44, "Block " + i, { s: 13 }) +
        TX(x + 37, 64, i === 1 ? "prev: none" : "prev: #" + (i - 1), { s: 11 }) +
        TX(x + 37, 79, "own: #" + i, { s: 11 });
      if (i < 5) s += TX(x + 79, 60, "→", { s: 14 });
    }
    s += TX(6 + 84 + 37, 108, "edited", { s: 12, f: "var(--amber)" });
    return SVG(430, 118, s, "A chain of five blocks, each storing the hash of the one before it; block 2 is edited");
  })();

  B.add("a8-hash", [
    {
      type: "pick",
      q: "A leaked password table stores an unsalted SHA-256 of each password. Without cracking anything, tap the two users who must have chosen the SAME password.",
      fig: pwFig,
      a: ["alice", "carol"],
      why: "The hash is deterministic, so equal passwords give equal digests. Alice and Carol share one, and one cracked guess exposes both. A random salt mixed into each hash makes identical passwords produce different digests, which hides this and stops a single pre-built table of hashes being reused.",
    },
    {
      type: "match",
      q: "Match each situation to the hash property it relies on most.",
      pairs: [
        [
          "A site publishes the digest of its installer, and nobody should be able to forge a different file with it",
          "Collision resistance",
        ],
        ["A stolen password table should not reveal the passwords", "Preimage resistance (one-way)"],
        ["A miner can't predict which nonce will win", "Avalanche effect"],
        ["Two computers hash one file and compare answers", "Determinism"],
      ],
      why: "Forging a file with the same digest would need a collision. Recovering a password from its digest would need a preimage. Proof of work only works if nonces give unpredictable digests (avalanche). Comparing digests across machines needs the same input to always give the same output.",
    },
    {
      type: "mcq",
      q: "In this chain every block stores the hash of the one before it. The amber block 2 is edited, and the attacker wants the chain to validate again. How many blocks must be re-mined, including block 2?",
      o: ["1", "2", "4", "5"],
      a: 2,
      fig: chain5Fig,
      why: "Changing block 2 changes its hash, so block 3's stored link is wrong, so block 3 must be re-mined, and so on to the end: blocks 2, 3, 4 and 5. Block 1 is untouched. That cost is why deeper blocks are safer, and why a miner would need to out-run the honest network.",
    },
    {
      type: "bug",
      q: "A programmer wants to stop identical passwords having identical stored hashes. It doesn't work. Click the faulty line.",
      code: [
        "def store(pw):",
        "    salt = os.urandom(8)",
        "    h = sha256(pw.encode()).digest()",
        "    return salt, h",
      ],
      a: 2,
      why: "The salt is generated and stored but never fed into the hash. The line should hash salt + pw.encode(). Then two users with the same password get different digests because their salts differ.",
    },
    M(
      "A hash has a 16-bit digest (65,536 possible values). Roughly how many random inputs do you need to hash before two of them probably share a digest?",
      ["16", "256", "65,536", "4,294,967,296"],
      1,
      "This is the birthday effect: collisions appear after about the square root of the number of digests, √65,536 = 256. That is why collision resistance needs digests twice as long as the work you want to guard against, and why SHA-256 has 256 bits.",
      { hint: "Pairs grow like the square of the number of inputs, so you need far fewer than 65,536." },
    ),
  ]);

  /* ==================== a8-keys ==================== */
  const rsaFig = (() => {
    const rows = [
      ["A", 5, 11, 3],
      ["B", 5, 11, 5],
      ["C", 7, 13, 5],
      ["D", 3, 11, 7],
      ["E", 7, 13, 9],
    ];
    let s = ["Set", "p", "q", "e"].map((t, i) => TX(40 + i * 80, 18, t, { s: 12 })).join("");
    rows.forEach(([n, p, q, e], i) => {
      const y = 26 + i * 36;
      s += PK(
        n,
        RC(2, y, 356, 31, { r: 8 }) + [n, p, q, e].map((t, k) => TX(40 + k * 80, y + 21, t, { s: 15 })).join(""),
      );
    });
    return SVG(360, 212, s, "Five toy RSA parameter sets A to E, each with primes p and q and a public exponent e");
  })();

  B.add("a8-keys", [
    {
      type: "pick",
      q: "Each row is a toy RSA setup with primes p and q and a chosen public exponent e. Tap the TWO rows where e is not allowed, because no private key d can exist.",
      fig: rsaFig,
      a: ["B", "E"],
      hint: "Work out φ = (p − 1)(q − 1) for each row. e must share no factor with φ.",
      why: "Row B has φ = 4 × 10 = 40 and e = 5 shares the factor 5. Row E has φ = 6 × 12 = 72 and e = 9 shares the factor 3 (and 9). In both, no d satisfies e × d = 1 mod φ. Rows A, C and D have e coprime to φ (40, 72 and 20).",
    },
    {
      type: "cat",
      q: "Eve learns each thing below. How much of Alice's private traffic can she now read? (Each chat uses a fresh Diffie–Hellman secret, and Alice's long-term RSA key pair is reused.)",
      buckets: ["Nothing useful", "One chat only", "Everything sent to Alice"],
      items: [
        ["The public numbers p and g", 0],
        ["Alice's RSA public key", 0],
        ["Last night's session key", 1],
        ["Bob's one-off DH secret from last night's chat", 1],
        ["Alice's RSA private key d", 2],
      ],
      why: "Public values give nothing away by design. A session key or a one-off secret unlocks just the chat it belongs to. The long-term RSA private key unlocks everything encrypted to Alice with it, including old recorded traffic, and lets Eve sign as her. Throwaway keys limit the damage of a leak.",
    },
    {
      type: "bug",
      q: "A toy Diffie–Hellman program works for tiny numbers but never finishes when a has 600 digits. Click the faulty line.",
      code: ["def dh_public(g, a, p):", "    r = g ** a", "    return r % p"],
      a: 1,
      why: 'g ** a builds an astronomically huge integer before reducing it. Use pow(g, a, p), which reduces mod p after every squaring. That is the "easy" direction in Diffie–Hellman: gᵃ mod p is quick, while reversing it is the hard discrete-logarithm problem.',
    },
    {
      type: "order",
      q: "Put the steps of a secure chat in order. (It uses public keys to set up, then fast symmetric encryption for the chat itself.)",
      items: [
        "Alice's browser checks Bob's certificate",
        "They run a key exchange (such as Diffie–Hellman)",
        "Both sides derive the same session key",
        "Messages are encrypted with that symmetric key",
      ],
      why: "First prove who Bob is, or Mallory could sit in the middle. Then agree a secret over the open wire. Both sides compute the same session key, and the bulk data is encrypted with it, because symmetric ciphers are thousands of times faster than RSA.",
    },
    M(
      "Alice sends Bob a signed contract. Mallory flips one bit of the contract in transit. Bob checks the signature with Alice's public key. What happens?",
      [
        "The check fails, as the hash no longer matches",
        "The check passes, as the signature itself is intact",
        "Bob can no longer open the contract at all",
        "The check fails only if the signature changes too",
      ],
      0,
      "A signature is made from a hash of the exact contract. Change one bit and the hash changes completely (avalanche), so verification fails. The signature protects the contract's integrity, not just the sender's identity.",
    ),
  ]);

  /* ==================== a9-dft ==================== */
  const aliasFig = (() => {
    const f = [
      ["A", 2, "cos"],
      ["B", 1, "sin"],
      ["C", 1, "cos"],
    ];
    let s = "";
    f.forEach(([n, hz, fn], i) => {
      const y0 = 8 + i * 98,
        cy = y0 + 44,
        X = (t) => 50 + t * 320,
        Y = (v) => cy - v * 30;
      let d = "";
      for (let k = 0; k <= 200; k++) {
        const t = k / 200,
          v = fn === "cos" ? Math.cos(2 * Math.PI * hz * t) : Math.sin(2 * Math.PI * hz * t);
        d += (k ? "L" : "M") + X(t).toFixed(1) + " " + Y(v).toFixed(1);
      }
      let dots = "";
      for (let k = 0; k <= 10; k++)
        dots += `<circle cx="${X(k / 10).toFixed(1)}" cy="${Y(Math.cos((2 * Math.PI * k) / 10)).toFixed(1)}" r="4.5" fill="var(--blue)"/>`;
      s += PK(
        "curve" + n,
        RC(2, y0, 396, 90, { r: 10 }) +
          LN(50, cy, 370, cy, { w: 1 }) +
          `<path d="${d}" fill="none" stroke="var(--amber)" stroke-width="2.5"/>` +
          dots +
          TX(26, cy + 5, n, { s: 15 }),
      );
    });
    return SVG(
      400,
      300,
      s,
      "Three panels, each showing the same eleven sample dots over one second and a different candidate wave: A, B and C",
    );
  })();
  const specFig = (() => {
    const X = (k) => 20 + k * 3.6;
    let s = LN(20, 100, 380, 100, { w: 2 });
    [40, 60].forEach((k) => (s += RC(X(k) - 3, 28, 6, 72, { r: 2, f: "var(--blue)", k: "var(--blue)", w: 1 })));
    [0, 20, 40, 60, 80, 100].forEach((k) => (s += LN(X(k), 100, X(k), 105, { w: 1 }) + TX(X(k), 120, k, { s: 11 })));
    s += TX(200, 140, "bin k   (N = 100 samples, sampled at 1,000 Hz)", { s: 12 });
    return SVG(400, 150, s, "Magnitude spectrum of a real signal with peaks at bins 40 and 60 out of 100");
  })();

  B.add("a9-dft", [
    {
      type: "pick",
      q: "A 9 Hz cosine is sampled 10 times a second, giving the 11 blue dots in every panel. A slower wave fits the same dots exactly. Tap the panel whose wave passes through ALL the dots.",
      fig: aliasFig,
      a: "curveC",
      why: "Panel C, a 1 Hz cosine, passes through every dot. The 9 Hz cosine fits the same dots, because 10 samples a second can't tell 9 Hz from 1 Hz. That is aliasing. Panel A (2 Hz) misses most dots, and panel B is the wrong phase, since a sine starts at 0 while the dots start at the peak.",
    },
    {
      type: "mcq",
      q: "The spectrum of a real signal sampled at 1,000 Hz with N = 100 samples shows peaks at bins 40 and 60. What frequency is the tone?",
      o: ["40 Hz", "400 Hz", "600 Hz", "1,000 Hz"],
      a: 1,
      fig: specFig,
      hint: "Bin spacing is fs / N.",
      why: "Bins are 1,000 / 100 = 10 Hz apart, so bin 40 is 400 Hz. Bin 60 is its mirror image (N − 40 = 60, or −400 Hz), always present for a real signal, so it does not mean a second tone at 600 Hz.",
    },
    {
      type: "order",
      q: "A recorder samples at 100 Hz and takes 100 samples, so bins are 1 Hz apart. Four tones are played: 20 Hz, 45 Hz, 60 Hz and 110 Hz. Order the tones by the bin (up to bin 50) where each shows up, lowest bin first.",
      items: ["110 Hz", "20 Hz", "60 Hz", "45 Hz"],
      hint: "Anything above 50 Hz folds back down.",
      why: "20 Hz and 45 Hz are below Nyquist (50 Hz), so they show in bins 20 and 45. 60 Hz folds to 100 − 60 = 40, and 110 Hz folds to 110 − 100 = 10. So the order is 110 Hz (bin 10), 20 Hz (20), 60 Hz (40), 45 Hz (45).",
    },
    {
      type: "cat",
      q: "A whole-number-of-cycles tone is analysed with the DFT. For each change to the signal, what happens to its magnitude spectrum?",
      buckets: ["Magnitudes unchanged", "A peak moves", "A peak grows or appears"],
      items: [
        ["Delay the tone by a quarter of a cycle", 0],
        ["Play the signal backwards", 0],
        ["Play the tone twice as fast", 1],
        ["Add the same constant to every sample", 2],
        ["Double every sample value", 2],
      ],
      why: "Delaying or reversing a pure tone changes only the phase, not how much of each frequency there is. Doubling the speed moves the peak to twice the bin. A constant is a zero-frequency component, so a new peak appears at bin 0. Doubling all the values doubles the peak heights.",
    },
    {
      type: "slider",
      q: "A cosine with amplitude 1 fits exactly 5 whole cycles in a window of N = 64 samples. How tall is its peak in the DFT magnitude (the bin at k = 5)?",
      min: 0,
      max: 70,
      step: 2,
      ans: 32,
      tol: 4,
      hint: "The sum adds up about N copies of 1, but the energy is split between bin k and its mirror.",
      why: "The matching bin multiplies the signal by a wave of the same shape, so every sample adds about 1 × 0.5 on average and the total is N / 2 = 32. The other half sits in the mirror bin N − 5 = 59. So a DFT peak scales with the number of samples, not the amplitude alone.",
    },
  ]);

  /* ==================== a9-fft ==================== */
  const slotsFig = (() => {
    let s = TX(8, 16, "Input slots of an 8-point FFT", { a: "start", s: 12 });
    for (let i = 0; i < 8; i++)
      s += PK("s" + i, RC(8 + i * 48, 26, 42, 44, { r: 8 }) + TX(29 + i * 48, 53, "slot " + i, { s: 11 }));
    return SVG(400, 84, s, "Eight input slots numbered 0 to 7");
  })();
  const circleFig = (() => {
    const cx = 130,
      cy = 120,
      r = 88;
    let s =
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line-2)" stroke-width="2"/>` +
      LN(cx - r - 10, cy, cx + r + 10, cy, { w: 1 }) +
      LN(cx, cy - r - 10, cx, cy + r + 10, { w: 1 });
    for (let k = 0; k < 8; k++) {
      const a = (2 * Math.PI * k) / 8,
        x = cx + r * Math.cos(a),
        y = cy + r * Math.sin(a);
      s += PK(
        "p" + k,
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="var(--panel)" stroke="${k < 2 ? "var(--violet)" : "var(--line-2)"}" stroke-width="3"/>`,
      );
    }
    s += TX(cx + r + 18, cy - 14, "W⁰ = 1", { a: "start", s: 13, f: "var(--violet)" });
    s += TX(cx + 66 + 10, cy + 66 + 28, "W¹", { a: "start", s: 13, f: "var(--violet)" });
    return SVG(
      300,
      240,
      s,
      "Eight points around a circle: W to the power 0 is the point on the right, W to the power 1 is one eighth of a turn clockwise from it",
    );
  })();

  B.add("a9-fft", [
    {
      type: "pick",
      q: "An 8-point FFT first shuffles its inputs into bit-reversed order. Tap the slot that x[3] is moved into.",
      fig: slotsFig,
      a: "s6",
      hint: "3 is 011 in three bits. Read those bits backwards.",
      why: "3 = 011, and 011 reversed is 110 = 6. So x[3] goes to slot 6 (and x[6] goes to slot 3). This shuffle puts the even/odd splitting of every level into place, so the butterflies can then work in place level by level.",
    },
    {
      type: "pick",
      q: "In an 8-point FFT the twiddle factor Wᵏ is the point k steps clockwise round the circle from W⁰ = 1. A butterfly computes a + W·b and a − W·b using ONE multiplication. That works because the twiddle for the second output is exactly opposite. Tap the point opposite W¹.",
      fig: circleFig,
      a: "p5",
      why: "Opposite means half a turn, which is 4 steps out of 8, so the point is W⁵ = −W¹. The second output can therefore reuse the same product with a flipped sign, a − W·b, instead of doing another multiplication. This sharing is a big part of why the FFT is fast.",
    },
    M(
      "A signal has N = 1,048,576 (about a million) samples. Roughly how many times fewer operations does an FFT need than the direct DFT?",
      ["About 20×", "About 1,000×", "About 50,000×", "About 1,000,000×"],
      2,
      "The direct DFT needs about N² operations and the FFT about N log₂ N, so the ratio is N / log₂ N = 1,048,576 / 20 ≈ 50,000. The gain grows with N, so it matters most for large signals.",
      { hint: "log₂ of a million is about 20. Divide a million by 20." },
    ),
    {
      type: "slider",
      q: "How many butterflies in total does a 64-point radix-2 FFT perform?",
      min: 0,
      max: 400,
      step: 4,
      ans: 192,
      tol: 16,
      hint: "log₂ 64 levels, and 32 butterflies on each level.",
      why: "There are log₂ 64 = 6 levels with N / 2 = 32 butterflies each, so 6 × 32 = 192. The direct DFT would need about 64 × 64 = 4,096 multiplications.",
    },
    {
      type: "bug",
      q: "A programmer multiplies two polynomials by FFT: transform both, multiply point by point, transform back. The product comes out wrapped round and wrong. Click the faulty line.",
      code: [
        "def polymul(a, b):",
        "    n = max(len(a), len(b))",
        "    A = fft(a + [0] * (n - len(a)))",
        "    B = fft(b + [0] * (n - len(b)))",
        "    C = [p * q for p, q in zip(A, B)]",
        "    return ifft(C)",
      ],
      a: 1,
      why: "A product of lengths la and lb has la + lb − 1 coefficients, so n must be at least that (rounded up to a power of two). With a smaller n the high-order terms wrap round and add onto the low ones. Zero-padding up to that length stops it.",
    },
  ]);

  /* ==================== a10-attn ==================== */
  const attnTableFig = (() => {
    const rows = [
      ["the", "0.6", "10"],
      ["cat", "0.3", "20"],
      ["sat", "0.1", "30"],
    ];
    let s =
      TX(60, 18, "Token", { s: 12 }) + TX(180, 18, "Attention weight", { s: 12 }) + TX(300, 18, "Value", { s: 12 });
    rows.forEach(([t, w, v], i) => {
      const y = 26 + i * 36;
      s +=
        RC(2, y, 356, 30, { r: 8 }) +
        TX(60, y + 21, t, { s: 15 }) +
        TX(180, y + 21, w, { s: 15, f: "var(--blue)" }) +
        TX(300, y + 21, v, { s: 15 });
    });
    return SVG(360, 138, s, "Three tokens with attention weights 0.6, 0.3, 0.1 and values 10, 20, 30");
  })();
  const causalFig = (() => {
    const w = ["The", "cat", "sat", "on", "the", "mat"];
    let s = "";
    w.forEach((t, i) => {
      const ed = i === 3;
      s += PK(
        "t" + (i + 1),
        RC(6 + i * 66, 28, 60, 40, {
          r: 9,
          k: ed ? "var(--amber)" : "var(--line-2)",
          f: ed ? "var(--amber)" : "var(--panel)",
          fo: ed ? 0.22 : 1,
        }) + TX(36 + i * 66, 53, t, { s: 14 }),
      );
    });
    s += TX(36 + 3 * 66, 90, "edited", { s: 12, f: "var(--amber)" });
    return SVG(410, 100, s, "Six tokens The cat sat on the mat, with the fourth token on being edited");
  })();
  const headsFig = (() => {
    const n = 5,
      cs = 22;
    const mats = [
      ["Head 1", (i, j) => (j > i ? null : 1 / (i + 1))],
      ["Head 2", (i, j) => (j > i ? null : i === 0 ? 1 : j === i - 1 ? 0.8 : j === i ? 0.2 : 0)],
      ["Head 3", (i, j) => (j > i ? null : i === 0 ? 1 : j === 0 ? 0.9 : j === i ? 0.1 : 0)],
    ];
    let s = "";
    mats.forEach(([name, f], m) => {
      const x0 = 14 + m * 132,
        y0 = 30;
      let g = TX(x0 + 55, 18, name, { s: 13 });
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const v = f(i, j);
          g +=
            v === null
              ? RC(x0 + j * cs, y0 + i * cs, cs - 2, cs - 2, {
                  r: 3,
                  f: "var(--bg-2, var(--panel))",
                  k: "var(--line)",
                  w: 1,
                  d: "2 2",
                })
              : RC(x0 + j * cs, y0 + i * cs, cs - 2, cs - 2, {
                  r: 3,
                  f: "var(--blue)",
                  fo: Math.max(0.04, v),
                  k: "var(--line-2)",
                  w: 1,
                });
        }
      s += PK("h" + (m + 1), RC(x0 - 8, 4, 126, 146, { r: 10, f: "transparent", k: "var(--line)", w: 1 }) + g);
    });
    s += TX(200, 166, "row = word asking, column = word it looks at; darker = more weight", { s: 11, w: 700 });
    return SVG(
      400,
      176,
      s,
      "Three 5 by 5 attention heatmaps for Head 1, Head 2 and Head 3, with the upper triangle masked",
    );
  })();

  B.add("a10-attn", [
    {
      type: "mcq",
      q: "One token attends to three tokens with the weights and values shown (values are plain numbers here, to keep it simple). What is its attention output?",
      o: ["10", "15", "20", "30"],
      a: 1,
      fig: attnTableFig,
      hint: "Weight each value: 0.6 × 10 + 0.3 × 20 + 0.1 × 30.",
      why: "The output is a weighted sum of values: 6 + 6 + 3 = 15. It is not the value of the top-weighted token (10) and not the plain average (20). Attention blends everything it looks at, in proportion to the weights.",
    },
    {
      type: "pick",
      q: 'A causal model reads "The cat sat on the mat". You edit token 4 ("on") and re-run one attention layer. Tap every token whose attention output can change.',
      fig: causalFig,
      a: ["t4", "t5", "t6"],
      why: "With a causal mask, each token looks only at itself and earlier tokens. So tokens 1 to 3 never see token 4, and their outputs stay the same. Token 4 itself and the later tokens 5 and 6 can all see the edit. This is why generation can reuse earlier results as it adds new tokens.",
    },
    {
      type: "pick",
      q: "These three heads were printed for a 5-word sentence. Tap the head that mostly looks at the PREVIOUS word.",
      fig: headsFig,
      a: "h2",
      why: "Head 2 puts most of its weight just below the diagonal, on the word before. Head 1 spreads weight evenly over everything so far, and Head 3 sends almost everything to the first word. Different heads learn different jobs, which is the reason for having several.",
    },
    {
      type: "match",
      q: "A model has a bug. Match each symptom to the missing piece of attention.",
      pairs: [
        [
          "It predicts the next word perfectly in training, but fails when generating",
          "The causal mask (it peeks at the answer)",
        ],
        ["Shuffling the words gives exactly the same output", "Position information"],
        ["Weights are almost all 0 or 1 and learning stalls", "The 1/√d scaling of scores"],
        ["The weights in a row add up to far more than 1", "Softmax"],
      ],
      why: "Without a mask the model can copy the word it is meant to predict, which only looks like brilliance in training. Attention alone has no sense of order, so position must be added. Unscaled dot products get huge, pushing softmax to a hard 0/1 pick with tiny gradients. Weights that don't add to 1 mean softmax is missing.",
    },
    {
      type: "bug",
      q: "A programmer's single attention head runs without errors but the output ignores what the tokens actually say, so it looks like a copy of the keys. Click the faulty line.",
      code: ["q = X @ Wq", "k = X @ Wk", "v = X @ Wv", "s = q @ k.T / d ** 0.5", "w = softmax(s)", "out = w @ k"],
      a: 5,
      why: "The weights decide how much of each token's VALUE to blend in: out = w @ v. Using k there blends the keys, which are only labels for matching. The values are the content that attention is meant to carry forward.",
    },
  ]);
})();

/* ===== bank-x-algo-1.js ===== */
/* ALGO revision bank, third set of varied, visual questions (part 1).
   Workshops (a1-code, a2-watch, a2-code) plus Phase 1 (anatomy, big-O, surfer, PageRank), Dijkstra, A*, routing, linear programming.
   Every number was checked by running the real algorithm in node or Python; the figures are drawn from the same data. */
(function () {
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

  // 2. relaxing the roads out of a freshly settled node
  const hubFig = (() => {
    const hub = [170, 124],
      sat = { P: [170, 28], Q: [280, 76], R: [280, 176], S: [170, 224], T: [60, 124] };
    const road = { P: 3, Q: 4, R: 2, S: 1, T: 6 },
      now = { P: ["9", null], Q: ["9", null], R: ["2, settled", "teal"], S: ["∞", null], T: ["10", null] };
    let b = "";
    Object.entries(sat).forEach(([k, [x, y]]) => {
      b += L(hub[0], hub[1], x, y, { sw: 2.5 }) + wpill((hub[0] + x) / 2, (hub[1] + y) / 2, road[k]);
    });
    b +=
      C(hub[0], hub[1], 27, { fill: tint("teal"), stroke: col("teal") }) +
      T(hub[0], hub[1] - 2, "X", { sz: 16, c: "var(--ink)", w: 900 }) +
      T(hub[0], hub[1] + 15, "5", { sz: 13, c: ink("teal"), w: 900 });
    Object.entries(sat).forEach(([k, [x, y]]) => {
      const [t, c] = now[k];
      b += node(x, y, k, { fill: c, stroke: c });
      b +=
        k === "T"
          ? T(x, y + 36, "now " + t, { sz: 13, c: c ? ink(c) : "var(--text)" })
          : T(x + 28, y + 5, "now " + t, { a: "start", sz: 13, c: c ? ink(c) : "var(--text)" });
    });
    b += T(330, 124, "X is settled at 5.", { a: "start", sz: 13, c: ink("teal") });
    return SVG(430, 252, b, "Node X, settled at 5, with five neighbours and the road lengths to them");
  })();

  // 3. shortest-path tree (verified: roads S-A 2, S-B 4, A-C 3, A-D 7, B-D 4, B-E 3, C-D 6, D-F 2, E-F 6)
  const treeRun = dijkRun(
    [
      ["S", "A", 2],
      ["S", "B", 4],
      ["A", "C", 3],
      ["A", "D", 7],
      ["B", "D", 4],
      ["B", "E", 3],
      ["C", "D", 6],
      ["D", "F", 2],
      ["E", "F", 6],
    ],
    "S",
  );
  const treeFig = (() => {
    const pos = {
      S: [250, 28],
      A: [130, 100],
      B: [370, 100],
      C: [130, 176],
      D: [310, 176],
      E: [430, 176],
      F: [310, 252],
    };
    const tree = [
      ["S", "A", 2],
      ["S", "B", 4],
      ["A", "C", 3],
      ["B", "D", 4],
      ["B", "E", 3],
      ["D", "F", 2],
    ];
    let b = "";
    tree.forEach(([u, v]) => (b += L(pos[u][0], pos[u][1], pos[v][0], pos[v][1], { sw: 3, stroke: "var(--line-2)" })));
    tree.forEach(([u, v, w]) => (b += wpill((pos[u][0] + pos[v][0]) / 2, (pos[u][1] + pos[v][1]) / 2, w)));
    Object.entries(pos).forEach(([k, [x, y]]) => {
      const sh = k === "S";
      b +=
        (sh ? "" : "") +
        (k === "S"
          ? node(x, y, k, { fill: "teal", stroke: "teal" })
          : pk(
              k,
              C(x, y, 19, { fill: "var(--panel)", stroke: "var(--line-2)" }) +
                T(x, y + 5, k, { sz: 15, c: "var(--ink)", w: 900 }),
            ));
      b += T(x + 28, y + 5, String(treeRun.dist[k]), { a: "start", sz: 14, c: ink("amber"), w: 900 });
    });
    b += T(250, 284, "number beside a node = its shortest distance from S", { sz: 12, c: "var(--text-faint)" });
    return SVG(500, 292, b, "The shortest-path tree from S, with each node's distance");
  })();

  // 4. distance each node had when it was settled, in settling order
  const settleLog = [
    ["S", 0],
    ["A", 2],
    ["B", 3],
    ["C", 3],
    ["D", 6],
    ["E", 5],
    ["F", 8],
    ["G", 9],
  ];
  const settlePlot = (() => {
    const x0 = 56,
      w = 424,
      y0 = 16,
      h = 200,
      X = (i) => x0 + 26 + i * ((w - 52) / 7),
      Y = (v) => y0 + h - (v / 10) * h;
    let b = R(x0, y0, w, h, { rx: 4 });
    [0, 2, 4, 6, 8, 10].forEach(
      (v) =>
        (b +=
          L(x0, Y(v), x0 + w, Y(v), { sw: 1, stroke: "var(--line)" }) +
          T(x0 - 8, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })),
    );
    b += P(settleLog.map(([, v], i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" "), {
      stroke: "var(--line-2)",
      sw: 2.5,
    });
    settleLog.forEach(([k, v], i) => {
      b +=
        pk("p" + (i + 1), C(X(i), Y(v), 11, { fill: tint("blue"), stroke: col("blue"), sw: 3 })) +
        T(X(i), y0 + h + 20, k, { sz: 15, c: "var(--ink)", w: 900 });
    });
    b +=
      T(x0 + w / 2, y0 + h + 42, "nodes in the order they were settled", { sz: 12, c: "var(--text-faint)" }) +
      T(14, y0 + h / 2, "distance", { sz: 12, c: "var(--text-faint)" }).replace(
        "<text ",
        `<text transform="rotate(-90 14 ${y0 + h / 2})" `,
      );
    return SVG(500, y0 + h + 52, b, "The distance of each node when it was settled, in order");
  })();

  // 5. nested regions: settled, waiting room, not reached
  const regionFig = (() => {
    const nodes = {
      S: [88, 104, "0"],
      C: [88, 170, "2"],
      B: [88, 236, "3"],
      D: [220, 104, "8"],
      H: [220, 170, "9"],
      E: [220, 236, "10"],
      F: [390, 130, "∞"],
      G: [390, 220, "∞"],
    };
    let b =
      R(6, 6, 488, 288, { rx: 22, fill: "var(--bg-2)", dash: "8 6" }) +
      T(400, 36, "not reached yet", { sz: 13, c: "var(--text-dim)" });
    b +=
      R(16, 46, 286, 240, { rx: 20, fill: tint("amber"), stroke: col("amber") }) +
      T(224, 68, "waiting room", { sz: 13, c: ink("amber") });
    b +=
      R(26, 76, 124, 200, { rx: 16, fill: tint("teal"), stroke: col("teal") }) +
      T(88, 94, "settled", { sz: 13, c: ink("teal") });
    Object.entries(nodes).forEach(([k, [x, y, d]]) => {
      b +=
        pk(
          k,
          C(x, y, 19, { fill: "var(--panel)", stroke: "var(--line-2)" }) +
            T(x, y + 5, k, { sz: 15, c: "var(--ink)", w: 900 }),
        ) + T(x + 28, y + 5, d, { a: "start", sz: 14, c: "var(--text)", w: 900 });
    });
    return SVG(500, 300, b, "Eight nodes: three settled, three in the waiting room, two not reached");
  })();

  // 6. tentative distance of each node after each settle (roads S-A 1, S-B 4, S-C 9, A-B 2, A-C 5, B-C 2, B-D 7, C-D 1)
  const stepRun = (() => {
    const edges = [
      ["S", "A", 1],
      ["S", "B", 4],
      ["S", "C", 9],
      ["A", "B", 2],
      ["A", "C", 5],
      ["B", "C", 2],
      ["B", "D", 7],
      ["C", "D", 1],
    ];
    const adj = {};
    edges.forEach(([a, b, w]) => {
      (adj[a] = adj[a] || []).push([b, w]);
      (adj[b] = adj[b] || []).push([a, w]);
    });
    const dist = { S: 0, A: Infinity, B: Infinity, C: Infinity, D: Infinity },
      done = new Set(),
      snaps = [],
      order = [];
    for (;;) {
      let u = null;
      Object.keys(dist).forEach((k) => {
        if (!done.has(k) && dist[k] < Infinity && (u === null || dist[k] < dist[u])) u = k;
      });
      if (u === null) break;
      done.add(u);
      order.push(u);
      adj[u].forEach(([v, w]) => {
        if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
      });
      snaps.push({ ...dist });
    }
    return { snaps, order };
  })();
  const stepFig = (() => {
    const x0 = 60,
      w = 420,
      y0 = 14,
      h = 190,
      X = (i) => x0 + 34 + i * ((w - 68) / 4),
      Y = (v) => y0 + h - (v / 10) * h;
    const colr = { A: "teal", B: "blue", C: "amber", D: "violet" },
      ord = stepRun.order,
      snaps = stepRun.snaps;
    let b = R(x0, y0, w, h, { rx: 4 });
    [0, 2, 4, 6, 8, 10].forEach(
      (v) =>
        (b +=
          L(x0, Y(v), x0 + w, Y(v), { sw: 1, stroke: "var(--line)" }) +
          T(x0 - 8, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })),
    );
    ["A", "B", "C", "D"].forEach((k) => {
      const last = ord.indexOf(k),
        pts = [];
      snaps.forEach((s, i) => {
        if (i <= last && s[k] < Infinity) pts.push([i, s[k]]);
      });
      b += P(pts.map(([i, v], j) => `${j ? "L" : "M"}${X(i)},${Y(v)}`).join(" "), { stroke: col(colr[k]), sw: 3.5 });
      pts.forEach(([i, v]) => (b += C(X(i), Y(v), 4.5, { fill: col(colr[k]), stroke: col(colr[k]), sw: 1 })));
      const [li, lv] = pts[pts.length - 1];
      b += T(X(li) + 16, Y(lv) + 5, k, { sz: 15, c: ink(colr[k]), w: 900 });
    });
    ord.slice(0, 5).forEach((k, i) => (b += T(X(i), y0 + h + 20, "after " + k, { sz: 13, c: "var(--text-dim)" })));
    b += T(x0 + w / 2, y0 + h + 42, "A line starts when a node is first reached and ends when it is settled.", {
      sz: 12,
      c: "var(--text-faint)",
    });
    return SVG(500, y0 + h + 52, b, "Tentative distance of A, B, C and D after each node is settled");
  })();

  B.add("a2-watch", [
    {
      type: "order",
      q: "Dijkstra from S. S and A are settled. The amber nodes are in the waiting room with the distances shown, and the grey nodes have not been reached. Put the next three nodes in the order they get settled.",
      fig: mapState.fig,
      items: mapState.run.order.slice(2, 5).map((k) => `<b>${k}</b>`),
      why: "B (5) is the smallest in the waiting room, so it goes first, and its road to D reaches D at 8. Now D (8) beats C (10), so D is settled second, and its road to C of length 1 drops C from 10 to 9. C is third. Taking C before D would settle it at 10, when 9 is available.",
    },
    {
      type: "cat",
      q: "Node X has just been settled at distance 5. The diagram shows the road lengths from X and what each neighbour holds now. Sort the neighbours by what happens when you check the roads out of X.",
      fig: hubFig,
      buckets: ["Gets updated", "Left alone"],
      items: [
        ["Node <b>P</b>", 0],
        ["Node <b>Q</b>", 1],
        ["Node <b>R</b>", 1],
        ["Node <b>S</b>", 0],
        ["Node <b>T</b>", 1],
      ],
      hint: "New distance = 5 + the road length. Compare it with what the node holds now.",
      why: "P: 5 + 3 = 8 beats 9. S: 5 + 1 = 6 beats ∞, a first way in. Q: 5 + 4 = 9 only ties 9, and a tie is not better, so Q is left alone. R is already settled, so its distance is final. T: 5 + 6 = 11 is worse than 10.",
    },
    {
      type: "pick",
      q: "This is the shortest-path tree Dijkstra built from S, with each node's distance. The road between B and D closes. Click every node whose best route in this tree used that road.",
      fig: treeFig,
      a: ["D", "F"],
      why: "A node's route is the chain of tree roads back to S. D hangs off B by that road, and F hangs off D, so both routes pass over it. E is also below B, but it uses the B–E road, so it is unaffected. A and C do not touch B at all.",
    },
    {
      type: "pick",
      q: "A friend logged the distance each node had at the moment it was settled, in the order they were settled. One dot proves a mistake was made. Click it.",
      fig: settlePlot,
      a: "p6",
      why: "Dijkstra always settles the smallest waiting distance, and roads never subtract, so the settled distances can only stay level or rise. E at 5 comes after D at 6, which cannot happen. The two 3s are fine: a tie is allowed.",
    },
    {
      type: "pick",
      q: "In Dijkstra, which nodes could still end up with a smaller distance than the one shown? Roads are never negative. Click every one.",
      fig: regionFig,
      a: ["H", "E", "F", "G"],
      why: "Settled nodes are final. D (8) is the smallest in the waiting room, so any other route would have to leave through a node that is already 8 or more away, and it cannot win: D is final too. H and E could still be beaten via D, and the unreached nodes F and G have no distance at all yet.",
    },
    {
      type: "mcq",
      q: "Dijkstra ran on a small map. The chart shows the distance each node held after each node was settled. A drop means a shorter way in was found. Which node's distance dropped twice after it was first reached?",
      fig: stepFig,
      o: ["Node A", "Node B", "Node C", "Node D"],
      a: 2,
      why: "C was first reached at 9, dropped to 6 when A was settled, and dropped again to 5 when B was settled. B dropped once (4 to 3) and D once (10 to 6). A was reached at 1 and never improved, because nothing can beat the node next to the start.",
    },
  ]);

  /* =====================================================================
     a2-code  (Dijkstra code lab)
     ===================================================================== */
  // 1. printed result of a buggy relax step (Python run on the map S-X 7, S-Y 2, Y-X 3, X-Z 1)
  const outDiff = (() => {
    const rows = [
      ["S", "0", "0"],
      ["X", "5", "1"],
      ["Y", "2", "2"],
      ["Z", "6", "1"],
    ];
    let b =
      T(70, 18, "node", { sz: 12, c: "var(--text-faint)" }) +
      T(190, 18, "should print", { sz: 12, c: "var(--text-faint)" }) +
      T(330, 18, "your code printed", { sz: 12, c: "var(--text-faint)" });
    rows.forEach(([k, e, g], i) => {
      const y = 28 + i * 40,
        bad = e !== g;
      b +=
        R(20, y, 440, 32, { rx: 8 }) +
        T(70, y + 22, k, { sz: 16, c: "var(--ink)", w: 900 }) +
        T(190, y + 22, e, { sz: 16, f: "var(--mono)" });
      b +=
        R(270, y + 3, 120, 26, {
          rx: 8,
          fill: bad ? tint("rose") : tint("teal"),
          stroke: bad ? col("rose") : col("teal"),
        }) + T(330, y + 22, g, { sz: 16, f: "var(--mono)", c: bad ? ink("rose") : ink("teal") });
    });
    return SVG(480, 196, b, "Expected and printed distances for the map");
  })();

  // 2. look-by-look trace of a student's relax step that only writes a distance the first time (Python run)
  const lookTrace = (() => {
    const rows = [
      ["S – X", "7", "∞", "7"],
      ["S – Y", "2", "∞", "2"],
      ["Y – S", "4", "0", "0"],
      ["Y – X", "5", "7", "7"],
      ["X – S", "14", "0", "0"],
      ["X – Y", "10", "2", "2"],
      ["X – Z", "8", "∞", "8"],
    ];
    let b =
      T(40, 18, "road checked", { a: "start", sz: 12, c: "var(--text-faint)" }) +
      T(190, 18, "cand", { sz: 12, c: "var(--text-faint)" }) +
      T(290, 18, "dist[v] was", { sz: 12, c: "var(--text-faint)" }) +
      T(410, 18, "dist[v] now", { sz: 12, c: "var(--text-faint)" });
    rows.forEach(([r, c, w, n], i) => {
      const y = 26 + i * 38;
      b +=
        R(8, y, 484, 32, { rx: 10 }) +
        T(40, y + 22, r, { a: "start", sz: 15, c: "var(--ink)", w: 900 }) +
        T(190, y + 22, c, { sz: 15, f: "var(--mono)" }) +
        T(290, y + 22, w, { sz: 15, f: "var(--mono)" }) +
        T(410, y + 22, n, { sz: 15, f: "var(--mono)" }) +
        pk("l" + (i + 1), hit(8, y, 484, 32));
    });
    return SVG(
      500,
      26 + rows.length * 38 + 4,
      b,
      "A trace of the roads checked, with the candidate and the distance before and after",
    );
  })();

  // 3. a one-way adjacency table for four towns (row = from, column = to)
  const adjTable = (() => {
    const names = ["S", "X", "Y", "Z"],
      have = { SX: 7, SY: 2, YX: 3, XZ: 1 },
      cell = 62,
      x0 = 90,
      y0 = 46;
    let b =
      T(x0 + 2 * cell, 16, "to", { sz: 13, c: "var(--text-dim)" }) +
      T(36, y0 + 2 * cell + 4, "from", { sz: 13, c: "var(--text-dim)" });
    names.forEach((p, j) => (b += T(x0 + j * cell + cell / 2, y0 - 8, p, { sz: 16, c: "var(--ink)", w: 900 })));
    names.forEach((s, i) => {
      b += T(x0 - 14, y0 + i * cell + cell / 2 + 6, s, { a: "end", sz: 16, c: "var(--ink)", w: 900 });
      names.forEach((r, j) => {
        const x = x0 + j * cell,
          y = y0 + i * cell,
          v = have[s + r];
        if (s === r) {
          b += R(x, y, cell, cell, { rx: 0, sw: 1.5, fill: "var(--bg-2)" });
          return;
        }
        b +=
          R(x, y, cell, cell, {
            rx: 0,
            sw: 1.5,
            fill: v ? tint("blue") : "var(--panel)",
            stroke: v ? col("blue") : "var(--line-2)",
          }) +
          (v
            ? T(x + cell / 2, y + cell / 2 + 6, String(v), { sz: 18, c: "var(--ink)", w: 900 })
            : pk(s + r, hit(x + 3, y + 3, cell - 6, cell - 6, 6)));
      });
    });
    b += T(x0 + 2 * cell, y0 + 4 * cell + 22, "Row S says: from S, road to X is 7 and to Y is 2.", {
      sz: 12,
      c: "var(--text-dim)",
    });
    return SVG(400, y0 + 4 * cell + 32, b, "A table of roads, row = from, column = to, with four filled cells");
  })();

  // 4. a map with an island (verified by counting looks in the Python run: 8)
  const islandMap = (() => {
    const pos = { S: [44, 96], A: [140, 36], B: [140, 156], C: [250, 156], D: [350, 44], E: [440, 96], F: [380, 160] };
    const edges = [
      ["S", "A", 2],
      ["S", "B", 5],
      ["A", "B", 1],
      ["B", "C", 3],
      ["D", "E", 4],
      ["E", "F", 2],
    ];
    let b =
      R(300, 8, 192, 188, { rx: 18, fill: "var(--bg-2)", dash: "7 5" }) +
      T(396, 188, "no road to S", { sz: 12, c: "var(--text-dim)" });
    edges.forEach(([u, v]) => (b += L(pos[u][0], pos[u][1], pos[v][0], pos[v][1], { sw: 2.5 })));
    edges.forEach(([u, v, w]) => (b += wpill((pos[u][0] + pos[v][0]) / 2, (pos[u][1] + pos[v][1]) / 2, w)));
    Object.entries(pos).forEach(
      ([k, [x, y]]) => (b += node(x, y, k, { fill: k === "S" ? "teal" : null, stroke: k === "S" ? "teal" : null })),
    );
    b += T(44, 134, "start", { sz: 12, c: ink("teal") });
    return SVG(500, 204, b, "A map with a connected part containing S and a separate island");
  })();

  // 5. four frames of a table of distances (run on S-A 2, S-B 5, A-B 1, B-C 3, A-C 7); frame 3 is corrupted
  const frameFig = (() => {
    const frames = [
        [0, 2, 5, null],
        [0, 2, 3, 9],
        [0, 2, 4, 6],
        [0, 2, 3, 6],
      ],
      nm = ["S", "A", "B", "C"];
    const pw = 114,
      bw = 18,
      h = 110,
      y0 = 34,
      Y = (v) => y0 + h - (v / 10) * h;
    let b = "";
    frames.forEach((f, k) => {
      const ox = 6 + k * (pw + 10);
      b +=
        R(ox, 4, pw, 196, { rx: 12, fill: "var(--panel)" }) +
        T(ox + pw / 2, 24, "after settle " + (k + 1), { sz: 13, c: "var(--ink)", w: 900 });
      f.forEach((v, i) => {
        const x = ox + 12 + i * 25;
        if (v === null)
          b +=
            R(x, y0, bw, h, { rx: 3, fill: "var(--bg-2)", dash: "3 3", sw: 1.5 }) +
            T(x + bw / 2, y0 + h / 2 + 5, "∞", { sz: 14, c: "var(--text-dim)" });
        else
          b +=
            R(x, Y(v), bw, h - (Y(v) - y0), { rx: 3, fill: col("blue"), stroke: col("blue"), sw: 1, op: 0.8 }) +
            T(x + bw / 2, Y(v) - 5, String(v), { sz: 13, c: "var(--ink)", w: 900 });
        b += T(x + bw / 2, y0 + h + 18, nm[i], { sz: 13, c: "var(--text-dim)" });
      });
      b += pk("f" + (k + 1), hit(ox, 4, pw, 196, 12));
    });
    return SVG(500, 206, b, "Four small bar charts of the distances to S, A, B and C after each settle");
  })();

  B.add("a2-code", [
    {
      type: "bug",
      q: "On the map S–X 7, S–Y 2, Y–X 3, X–Z 1 (start S) this relax step prints X = 1 and Z = 1, as the table shows. Click the faulty line.",
      fig: outDiff,
      code: ["for v, w in graph[u]:", "    cand = dist[u] + w", "    if cand < dist[v]:", "        dist[v] = w"],
      a: 3,
      why: "The test compares the right thing (<code>cand</code>), but the update stores <code>w</code>, the length of one road, instead of the whole route length. Every distance then forgets how far it took to reach u. It should be <code>dist[v] = cand</code>.",
    },
    {
      type: "pick",
      q: "A student's relax step only writes a distance when the node has none yet. Their code printed this trace on the map S–X 7, S–Y 2, Y–X 3, X–Z 1. Click the row where an improvement was missed.",
      fig: lookTrace,
      a: "l4",
      why: "On Y – X the candidate is 5, which beats the 7 that X holds, yet X is still 7 afterwards. A shorter way was found and thrown away, so X and everything beyond it (Z comes out at 8 instead of 6) is too big. The other rows are fine: their candidates either fill an empty ∞ or are not better.",
    },
    {
      type: "pick",
      q: "The roads S–X, S–Y, Y–X and X–Z are two-way, but the code reads <code>graph[u]</code>, the roads out of u. This table only lists each road in one direction. Click every empty cell that must be filled so that every road works both ways.",
      fig: adjTable,
      a: ["XS", "YS", "XY", "ZX"],
      why: "A two-way road needs an entry in both rows: S–X gives S → X (7) and X → S (7), and so on. The missing mirrors are X → S, Y → S, X → Y and Z → X. The other empty cells, such as S to Z, are pairs with no road at all and stay empty.",
    },
    {
      type: "mcq",
      q: "The lab's code records one 'look' for every road it checks out of a node it settles. All roads are two-way and Dijkstra starts at S. How many looks are recorded?",
      fig: islandMap,
      o: ["4", "6", "8", "12"],
      a: 2,
      hint: "Each road is checked from both ends, but only from nodes that actually get settled.",
      why: "S, A, B and C are settled. The four roads among them are each looked at from both ends: 8 looks. The island is never reached, so D, E and F are never settled and their two roads are never looked at. Counting every road from both ends would give 12.",
    },
    {
      type: "pick",
      q: "A student's code prints the table of distances after each settle, drawn as four small charts (a dashed bar = ∞, not reached). One frame cannot come from a correct Dijkstra run. Click it.",
      fig: frameFig,
      a: "f3",
      why: "Distances only ever fall or stay level. In frame 3, B has risen from 3 to 4. A route was found for B at 3, so a correct run can never give that up. Frame 4 has B back at 3, so frame 3 is the glitch, not frame 4.",
    },
    {
      type: "match",
      q: "Four students each made one slip in their Dijkstra code. Match each slip to what they saw when they ran the tests.",
      pairs: [
        ["The node is never marked as done", "The run never finishes: it hits the 2-second limit"],
        [
          "The relax test is written <code>cand &gt; dist[v]</code>",
          "Only the start gets a distance; everything else stays at ∞",
        ],
        ["The update is <code>dist[v] = w</code>", "Distances are tiny: each is just one road's length"],
        [
          "The next node is the first reached one, not the smallest",
          "Right on some maps, too big where a side road is shorter",
        ],
      ],
      why: "Without a done mark, the same smallest node is picked for ever. A reversed test is never true when the old value is ∞, so nothing updates. Storing w forgets the distance so far. Taking any reached node, not the smallest, locks in a node before its shortcut is found, so it works only by luck.",
    },
  ]);

  /* =====================================================================
     a1-anatomy
     ===================================================================== */
  // 1. the contract of binary search drawn as a pipeline
  const contractFig = (() => {
    let b = arrowDef("xa-ct");
    b +=
      R(110, 4, 280, 34, { rx: 12, fill: "var(--bg-2)" }) +
      T(250, 26, "binary_search([9, 2, 7], 9)", { sz: 14, f: "var(--mono)", c: "var(--ink)" });
    b += P("M250,40 L250,66", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-ct" });
    const box = (x, id, title, l1, l2, c) =>
      pk(
        id,
        R(x, 70, 156, 92, { rx: 14, fill: tint(c), stroke: col(c) }) +
          T(x + 78, 92, title, { sz: 14, c: ink(c), w: 900 }) +
          T(x + 78, 114, l1, { sz: 13 }) +
          T(x + 78, 132, l2, { sz: 13 }) +
          hit(x, 70, 156, 92, 14),
      );
    b +=
      box(8, "pre", "Precondition", "the list", "is sorted", "blue") +
      box(172, "inv", "Loop invariant", "if t is in the list, it is", "between lo and hi", "violet") +
      box(336, "post", "Postcondition", "returns the position", "of t, or -1", "teal");
    b +=
      P("M166,116 L170,116", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-ct" }) +
      P("M330,116 L334,116", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-ct" });
    b +=
      R(110, 176, 280, 34, { rx: 12, fill: tint("rose"), stroke: col("rose") }) +
      T(250, 198, "returned -1, but 9 is at position 0", { sz: 14, c: ink("rose") });
    return SVG(500, 218, b, "The contract of binary search: precondition, loop invariant, postcondition");
  })();

  // 2. bubble sort snapshots (real passes; the snapshot after pass 2 is corrupted)
  const bubble = (a) => {
    a = a.slice();
    const snaps = [a.slice()];
    for (let k = 0; k < 3; k++) {
      for (let i = 0; i < a.length - 1 - k; i++) if (a[i] > a[i + 1]) [a[i], a[i + 1]] = [a[i + 1], a[i]];
      snaps.push(a.slice());
    }
    return snaps;
  };
  const bubSnaps = bubble([5, 2, 9, 1, 7, 3]);
  const bubFig = (() => {
    const snaps = bubSnaps.map((s, k) => (k === 2 ? [2, 1, 5, 3, 9, 7] : s)),
      labels = ["start", "after pass 1", "after pass 2", "after pass 3"];
    const cw = 44,
      x0 = 168;
    let b = "";
    snaps.forEach((s, k) => {
      const y = 8 + k * 62;
      b += T(14, y + 29, labels[k], { a: "start", sz: 14, c: "var(--ink)", w: 900 });
      s.forEach((v, i) => {
        const fixed = i >= s.length - k;
        b +=
          R(x0 + i * cw, y, cw - 4, 40, {
            rx: 8,
            fill: fixed ? tint("teal") : "var(--panel)",
            stroke: fixed ? col("teal") : "var(--line-2)",
          }) + T(x0 + i * cw + (cw - 4) / 2, y + 27, String(v), { sz: 17, c: "var(--ink)", w: 900 });
      });
      b += pk("r" + k, hit(4, y - 6, 492, 52, 12));
    });
    b += T(250, 8 + 4 * 62 + 4, "green cells = where pass k says the k biggest items sit, in order", {
      sz: 12,
      c: "var(--text-faint)",
    });
    return SVG(500, 8 + 4 * 62 + 12, b, "The list [5, 2, 9, 1, 7, 3] at the start and after each bubble-sort pass");
  })();

  // 3. a two-cell binary-search window
  const windowFig = (() => {
    const xs = [4, 9, 15, 22, 28, 35, 41, 50, 57, 66],
      cw = 46,
      x0 = 20,
      y = 52;
    let b = "";
    xs.forEach((v, i) => {
      const inw = i === 5 || i === 6;
      b +=
        R(x0 + i * cw, y, cw - 4, 44, {
          rx: 8,
          fill: inw ? tint("blue") : "var(--bg-2)",
          stroke: inw ? col("blue") : "var(--line)",
        }) +
        T(x0 + i * cw + (cw - 4) / 2, y + 28, String(v), {
          sz: 16,
          c: inw ? "var(--ink)" : "var(--text-faint)",
          w: 900,
        }) +
        T(x0 + i * cw + (cw - 4) / 2, y + 62, String(i), { sz: 12, c: "var(--text-faint)" });
    });
    b +=
      T(x0 + 5 * cw + 21, y - 28, "lo, mid", { sz: 14, c: ink("blue"), w: 900 }) +
      P(`M${x0 + 5 * cw + 21},${y - 22} L${x0 + 5 * cw + 21},${y - 6}`, { stroke: col("blue"), sw: 2.5 });
    b += T(x0 + 6 * cw + 21, y - 14, "hi", { sz: 14, c: ink("blue"), w: 900 });
    b +=
      T(250, y + 94, "t = 41    xs[mid] = 35", { sz: 15, f: "var(--mono)", c: "var(--ink)" }) +
      T(250, y + 118, "the numbers under the cells are positions", { sz: 12, c: "var(--text-faint)" });
    return SVG(500, y + 126, b, "A sorted list of ten numbers with a search window of two cells");
  })();

  // 4. scatter of the tests tried so far: list length (across) against biggest item (up)
  const testScatter = (() => {
    const pts = [
      [1, 3],
      [2, 7],
      [2, 1],
      [3, 5],
      [3, 9],
      [4, 2],
      [4, 6],
      [5, 8],
      [6, 4],
      [7, 3],
      [8, 7],
      [9, 5],
      [9, 1],
      [10, 9],
      [11, 6],
      [12, 2],
      [12, 8],
      [6, 10],
    ];
    const x0 = 56,
      w = 424,
      y0 = 12,
      h = 240,
      X = (v) => x0 + (v / 13) * w,
      Y = (v) => y0 + h / 2 - (v / 10) * (h / 2);
    let b =
      R(x0, y0, w, h, { rx: 4 }) +
      L(x0, Y(0), x0 + w, Y(0), { stroke: "var(--text-faint)", sw: 2 }) +
      L(X(6.5), y0, X(6.5), y0 + h, { stroke: "var(--text-faint)", sw: 1.5, dash: "5 4" });
    [-10, -5, 0, 5, 10].forEach(
      (v) => (b += T(x0 - 8, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })),
    );
    [1, 4, 7, 10].forEach((v) => (b += T(X(v), y0 + h + 18, String(v), { sz: 12, c: "var(--text-faint)" })));
    b +=
      T(x0 + w / 2, y0 + h + 38, "items in the list", { sz: 12, c: "var(--text-dim)" }) +
      T(14, y0 + h / 2, "biggest item", { sz: 12, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 14 ${y0 + h / 2})" `,
      );
    pts.forEach(([x, y]) => (b += C(X(x), Y(y), 6, { fill: tint("blue"), stroke: col("blue"), sw: 2.5 })));
    b +=
      pk("tl", hit(x0 + 2, y0 + 2, X(6.5) - x0 - 4, h / 2 - 4, 8)) +
      pk("tr", hit(X(6.5) + 2, y0 + 2, x0 + w - X(6.5) - 4, h / 2 - 4, 8)) +
      pk("bl", hit(x0 + 2, y0 + h / 2 + 2, X(6.5) - x0 - 4, h / 2 - 4, 8)) +
      pk("br", hit(X(6.5) + 2, y0 + h / 2 + 2, x0 + w - X(6.5) - 4, h / 2 - 4, 8));
    b +=
      T(x0 + 70, y0 + 20, "short list", { a: "middle", sz: 12, c: "var(--text-faint)" }) +
      T(x0 + w - 70, y0 + 20, "long list", { sz: 12, c: "var(--text-faint)" });
    return (
      codeBox(["best = 0", "for x in xs:", "    if x &gt; best:", "        best = x"]) +
      SVG(500, y0 + h + 46, b, "Each dot is a test: how many items the list had, and its biggest item")
    );
  })();

  B.add("a1-anatomy", [
    {
      type: "pick",
      q: "<code>binary_search(xs, t)</code> promises to return the position of <code>t</code> when <code>xs</code> is sorted. A caller runs it on [9, 2, 7] looking for 9 and gets −1, which is wrong. Click the part of the contract that was broken first.",
      fig: contractFig,
      a: "pre",
      why: "The caller broke the precondition: the list is not sorted. Everything after that follows from it. The invariant (t lies between lo and hi) only holds for a sorted list, and the postcondition is only promised when the precondition holds. The function is not at fault: it was handed an input outside its contract.",
    },
    {
      type: "pick",
      q: "Bubble sort has the invariant: after pass k, the last k items are the k biggest, in order. A student printed the list [5, 2, 9, 1, 7, 3] after each pass. Click the row where the invariant is broken.",
      fig: bubFig,
      a: "r2",
      why: "After pass 2 the last two cells should be 7 and 9, in that order. The row shows 9 then 7: the right items, in the wrong order, so the promise fails. After pass 1 the 9 is in place, and after pass 3 the last three are 5, 7, 9, so those rows keep the promise.",
    },
    {
      type: "mcq",
      q: "Binary search has found that <code>xs[mid]</code> is smaller than <code>t</code> while its window is just the two marked cells. Which update keeps <code>t</code> inside the window and also guarantees the loop will finish?",
      fig: windowFig,
      o: [
        "Move lo past mid, to mid + 1",
        "Move lo up to mid, keeping mid",
        "Move hi down to mid - 1",
        "Move hi down to mid, keeping mid",
      ],
      a: 0,
      why: "xs[mid] = 35 is below 41, so t cannot be at mid or to its left: lo = mid + 1 is safe, and the window shrinks to one cell. Setting lo = mid also keeps t inside, but lo stays at 5 and mid is 5 again, so the loop never ends. Both hi updates throw t away.",
    },
    {
      type: "pick",
      q: "This function should return the biggest item of a list. The dots are the inputs the tests already tried. Click every region where an input would make the function give a wrong answer.",
      fig: testScatter,
      a: ["bl", "br"],
      why: "<code>best = 0</code> is a wrong starting value whenever every item is below 0, because the loop never beats it and the function returns 0. That happens for short and long lists alike, and no test dot lives in either lower region. The upper regions are covered by tests and work fine.",
    },
  ]);

  /* =====================================================================
     a1-bigo
     ===================================================================== */
  // 1. 100% stacked bars of 5n^2 + 40n + 900
  const stackFig = (() => {
    const ns = [10, 15, 20, 30, 100],
      x0 = 50,
      w = 440,
      y0 = 18,
      h = 220,
      bw = 54,
      gap = (w - ns.length * bw) / (ns.length + 1);
    let b = "";
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
      const y = y0 + h - v * h;
      b +=
        L(x0, y, x0 + w, y, {
          sw: v === 0.5 ? 2.5 : 1,
          stroke: v === 0.5 ? "var(--text-faint)" : "var(--line)",
          dash: v === 0.5 ? "6 4" : null,
        }) + T(x0 - 8, y + 4, Math.round(v * 100) + "%", { a: "end", sz: 12, c: "var(--text-faint)" });
    });
    ns.forEach((n, i) => {
      const parts = [
          [5 * n * n, "blue"],
          [40 * n, "amber"],
          [900, "violet"],
        ],
        tot = parts.reduce((s, p) => s + p[0], 0),
        x = x0 + gap + i * (bw + gap);
      let acc = 0;
      parts.forEach(([v, c]) => {
        const ph = (v / tot) * h;
        b += R(x, y0 + h - acc - ph, bw, ph, { rx: 0, sw: 1.5, fill: col(c), op: 0.75, stroke: col(c) });
        acc += ph;
      });
      b +=
        T(x + bw / 2, y0 + h + 20, "n = " + n, { sz: 13, c: "var(--ink)", w: 900 }) +
        pk("n" + n, hit(x - 4, y0, bw + 8, h + 4, 6));
    });
    b +=
      R(50, y0 + h + 34, 12, 12, { rx: 3, fill: col("blue"), stroke: col("blue"), op: 0.75 }) +
      T(68, y0 + h + 45, "5n² piece", { a: "start", sz: 12 }) +
      R(160, y0 + h + 34, 12, 12, { rx: 3, fill: col("amber"), stroke: col("amber"), op: 0.75 }) +
      T(178, y0 + h + 45, "40n piece", { a: "start", sz: 12 }) +
      R(270, y0 + h + 34, 12, 12, { rx: 3, fill: col("violet"), stroke: col("violet"), op: 0.75 }) +
      T(288, y0 + h + 45, "900 piece", { a: "start", sz: 12 }) +
      T(440, y0 + h + 45, "dashed = half", { sz: 12, c: "var(--text-faint)" });
    return SVG(500, y0 + h + 56, b, "Five bars showing how a cost of 5n² + 40n + 900 splits into its three pieces");
  })();

  // 2. where does work() run? six 12 x 12 grids
  const gridFig = (() => {
    const n = 12,
      cs = 11,
      pw = 160,
      ph = 190;
    const rules = [
      ["a", "range(3)", (i, j) => j < 3],
      ["b", "range(i)", (i, j) => j < i],
      ["c", "range(i - 1, i + 2)", (i, j) => Math.abs(j - i) <= 1],
      ["d", "range(0, n, 4)", (i, j) => j % 4 === 0],
      ["e", "range(n)", () => true],
      ["f", "range(n // 2)", (i, j) => j < n / 2],
    ];
    let b = "";
    rules.forEach(([id, lab, f], k) => {
      const ox = 6 + (k % 3) * (pw + 6),
        oy = 4 + Math.floor(k / 3) * (ph + 8);
      b +=
        R(ox, oy, pw, ph, { rx: 12 }) +
        T(ox + pw / 2, oy + 20, "for j in " + lab, { sz: 11.5, f: "var(--mono)", c: "var(--ink)", w: 700 });
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const on = f(i, j);
          b += `<rect x="${ox + 14 + j * cs}" y="${oy + 32 + i * cs}" width="${cs - 1}" height="${cs - 1}" rx="1.5" fill="${on ? "var(--blue)" : "var(--bg-2)"}"/>`;
        }
      b +=
        T(ox + pw / 2, oy + ph - 8, "row i, column j", { sz: 11, c: "var(--text-faint)" }) +
        pk(id, hit(ox, oy, pw, ph, 12));
    });
    return SVG(500, 2 * ph + 20, b, "Six grids showing which (i, j) pairs run work() when n is 12");
  })();

  // 3. log-scale ruler of times
  const rulerFig = (() => {
    const t = [
      ["1 sec", 1, "s1"],
      ["1 min", 60, "min"],
      ["1 hour", 3600, "hr"],
      ["1 day", 86400, "day"],
      ["1 week", 604800, "wk"],
      ["1 month", 2592000, "mo"],
      ["1 year", 31536000, "yr"],
    ];
    const x0 = 46,
      w = 410,
      X = (s) => x0 + (Math.log10(s) / 7.6) * w,
      y = 96;
    let b = L(x0 - 10, y, x0 + w + 10, y, { sw: 4, stroke: "var(--line-2)" });
    t.forEach(([lab, s, id], i) => {
      const up = i % 2 === 0;
      b +=
        L(X(s), y - 8, X(s), y + 8, { sw: 2 }) +
        T(X(s), up ? y - 24 : y + 34, lab, { sz: 13, c: "var(--ink)", w: 900 }) +
        pk(id, C(X(s), y, 11, { fill: tint("blue"), stroke: col("blue"), sw: 3 }));
    });
    b += T(250, 160, "each tick is about 10× to 100× the one before: the scale is logarithmic", {
      sz: 12,
      c: "var(--text-faint)",
    });
    return SVG(500, 172, b, "A logarithmic ruler of times from one second to one year");
  })();

  // 4. inserting at the front of a list
  const shiftFig = (() => {
    let b = arrowDef("xa-sh");
    [3, 4, 5].forEach((k, r) => {
      const y = 10 + r * 78,
        x0 = 150,
        cw = 44;
      b += T(14, y + 28, `${k} items already`, { a: "start", sz: 13, c: "var(--ink)", w: 900 });
      b +=
        R(x0, y, cw - 4, 38, { rx: 8, fill: tint("blue"), stroke: col("blue") }) +
        T(x0 + (cw - 4) / 2, y + 25, "new", { sz: 13, c: ink("blue"), w: 900 });
      for (let i = 0; i < k; i++) {
        b +=
          R(x0 + (i + 1) * cw, y, cw - 4, 38, { rx: 8 }) +
          T(x0 + (i + 1) * cw + (cw - 4) / 2, y + 25, String.fromCharCode(97 + i), {
            sz: 15,
            c: "var(--ink)",
            w: 900,
          }) +
          P(`M${x0 + i * cw + 12},${y + 54} L${x0 + (i + 1) * cw + 14},${y + 54}`, {
            stroke: col("amber"),
            sw: 2.5,
            mk: "xa-sh",
          });
      }
      b += T(x0 + (k + 1) * cw + 14, y + 29, `${k} moves`, { a: "start", sz: 13, c: ink("amber"), w: 900 });
    });
    return SVG(
      500,
      248,
      b,
      "Inserting at the front of lists with 3, 4 and 5 items: every old item moves one place right",
    );
  })();

  B.add("a1-bigo", [
    {
      type: "pick",
      q: "A program takes 5n² + 40n + 900 steps. Each bar splits its cost into the three pieces. Click the smallest input size where the n² piece is already more than half of the total.",
      fig: stackFig,
      a: "n20",
      why: "At n = 15 the n² piece is 1,125 of 2,625 steps (43%), still under half. At n = 20 it is 2,000 of 3,700 (54%). By n = 100 it is 91%. Big-O drops the 40n and 900 because their share keeps shrinking, but at small n the extra pieces still matter.",
    },
    {
      type: "pick",
      q: "Each grid shows where <code>work()</code> runs for n = 12: a blue cell at row i, column j means the inner loop does <code>work()</code> there. Click every grid whose total work is O(n²) as n grows.",
      fig: gridFig,
      a: ["b", "d", "e", "f"],
      why: "The full square, the triangle, every fourth column and the left half all grow with the area of the grid, which is a fixed fraction of n². Constants like ½ or ¼ do not change the class. The first column strip (range(3)) and the narrow diagonal band do a fixed number of cells per row, so they are O(n).",
    },
    {
      type: "pick",
      q: "A program does n² steps, and the computer manages 1,000,000 steps per second. For n = 1,000,000, where does its running time land on this ruler? Click the nearest tick.",
      fig: rulerFig,
      a: "wk",
      hint: "n² = 10¹² steps. 10¹² ÷ 10⁶ = 10⁶ seconds. A day is about 10⁵ seconds.",
      why: "A million squared is a million million steps. At a million per second that is a million seconds, about 12 days: nearest to 1 week. An O(n log n) version needs only about 20 million steps, which is 20 seconds. Same computer, same n, and the algorithm decides whether it takes seconds or weeks.",
    },
    {
      type: "slider",
      q: "You build a list of 2,000 items by calling <code>insert(0, x)</code> for each one. Each call shifts every item already in the list one place along. About how many item moves happen in total?",
      fig: shiftFig,
      min: 0,
      max: 4000000,
      step: 100000,
      ans: 2000000,
      tol: 500000,
      unit: " moves",
      hint: "The k-th insert moves k items. 1 + 2 + … + 2,000 is about half of 2,000 × 2,000.",
      why: "The picture shows each insert moves as many items as are already there. Adding 0 + 1 + 2 + … + 1,999 gives n(n − 1) ÷ 2, about 2 million moves: quadratic, even though the loop looks like a plain O(n) pass. <code>append</code> would cost one step per item instead.",
    },
  ]);
})();

/* ===== bank-x-algo-2.js ===== */
/* Revision bank, third set of varied, visual questions (algo-2).
   Modules: workshops a3-lab, a4-build, a5-code and sessions a3-simplex, a3-bracket, a3-nm, a4-cut, a4-mst, a5-orient, a5-wrap, a5-graham.
   Every figure is inline SVG built here (a different diagram kind per question). Every number was checked by running the real
   algorithm (corner profits, Kruskal/Prim, golden-section, Graham scan, gift wrapping). Questions stand alone: the data is in the question or its figure. */
(function () {
  const B = NIC.bank;
  const txt = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, inner) =>
    `<svg viewBox="0 0 ${w} ${h}" style="display:block;width:100%;max-height:${h}px">${inner}</svg>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const f1 = (v) => String(Math.round(v * 100) / 100);
  const ln = (x1, y1, x2, y2, c, w, extra = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const circ = (x, y, r, fill, stroke, sw = 3) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const arrow = (x1, y1, x2, y2, c, w = 3) => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      h = 9;
    const p = [
      [x2, y2],
      [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)],
      [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)],
    ];
    return (
      ln(x1, y1, x2 - h * 0.6 * Math.cos(a), y2 - h * 0.6 * Math.sin(a), c, w) +
      `<polygon points="${p.map((q) => q.join(",")).join(" ")}" fill="${c}"/>`
    );
  };
  /* a table drawn in SVG: rows of cells, optional pickable cells. cols = widths, rowH = height */
  function table(x0, y0, cols, rowH, rows, o = {}) {
    let s = "",
      y = y0;
    rows.forEach((row, r) => {
      let x = x0;
      row.forEach((cell, c) => {
        const cc = typeof cell === "object" ? cell : { t: cell };
        const head = r === 0 && o.head !== false;
        const fill = cc.fill || (head ? "var(--panel-2)" : "var(--panel)");
        const w = cols[c];
        s += `<rect x="${x}" y="${y}" width="${w}" height="${rowH}" fill="${fill}" stroke="var(--line-2)" stroke-width="1.5"/>`;
        s += txt(cc.a === "start" ? x + 8 : x + w / 2, y + rowH / 2 + 5, cc.t, {
          a: cc.a,
          s: cc.s || o.s || 13,
          c: cc.c || (head ? "var(--text-dim)" : "var(--ink)"),
          w: head ? 800 : cc.w || 800,
        });
        x += w;
      });
      y += rowH;
    });
    return s;
  }

  /* =====================================================================
     a3-lab  (workshop: corner hunt)
     ===================================================================== */
  // small multiples: profit at the three corners for four prices of Y (profit = 3x + c*y)
  function labPanels() {
    const cs = [1, 2, 4, 6],
      corners = [
        [5, 0],
        [4, 3],
        [0, 5],
      ];
    let s = "";
    cs.forEach((c, i) => {
      const x0 = 6 + (i % 2) * 208,
        y0 = 4 + Math.floor(i / 2) * 150,
        base = y0 + 112;
      let g =
        `<rect x="${x0}" y="${y0}" width="200" height="142" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` +
        txt(x0 + 100, y0 + 20, `£${c} per unit of Y`, { s: 13, c: "var(--ink)" });
      corners.forEach(([x, y], k) => {
        const z = 3 * x + c * y,
          h = (z / 40) * 66,
          bx = x0 + 28 + k * 54;
        g +=
          `<rect x="${bx}" y="${base - h}" width="38" height="${h}" rx="5" fill="var(--blue)"/>` +
          txt(bx + 19, base - h - 5, `£${z}`, { s: 12, c: "var(--ink)" }) +
          txt(bx + 19, base + 14, `(${x},${y})`, { s: 11, w: 700, c: "var(--text-dim)" });
      });
      g += ln(x0 + 16, base, x0 + 184, base, "var(--line-2)", 2);
      s += pk("c" + c, g);
    });
    return svg(420, 308, s);
  }
  // profit against a cap on Y (3x + 2y, x + 2y <= 10, 3x + y <= 15): 15 + cap below 3, then flat at 18
  function labCap() {
    const X = (c) => 52 + c * 58,
      Y = (p) => 212 - (p - 14) * 34;
    let s = "";
    for (let p = 14; p <= 19; p++)
      s +=
        ln(X(0), Y(p), X(6), Y(p), "var(--line)", 1.5) +
        txt(X(0) - 8, Y(p) + 4, `£${p}`, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    for (let c = 0; c <= 6; c++) s += txt(X(c), Y(14) + 18, c, { s: 11, w: 700, c: "var(--text-faint)" });
    s += txt(X(3), Y(14) + 36, "cap on Y (at most this many sold)", { s: 12, w: 700, c: "var(--text-dim)" });
    s += `<polyline points="${X(0)},${Y(15)} ${X(3)},${Y(18)} ${X(6)},${Y(18)}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    [
      [1, 16],
      [2, 17],
      [3, 18],
      [4, 18],
      [5, 18],
    ].forEach(
      ([c, p]) =>
        (s += pk(
          String(c),
          circ(X(c), Y(p), 13, "var(--panel)", "var(--line-2)") + txt(X(c), Y(p) + 4, c, { s: 12, c: "var(--ink)" }),
        )),
    );
    s += txt(X(0) + 6, 16, "best profit", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(420, 262, s);
  }
  // contour (profit) lines on the factory's feasible region
  function labLines() {
    const X = (x) => 44 + x * 50,
      Y = (y) => 252 - y * 33;
    let s = "";
    for (let i = 0; i <= 7; i++)
      s +=
        ln(X(i), Y(0), X(i), Y(7), "var(--line)", 1) +
        txt(X(i), Y(0) + 15, i, { s: 11, w: 700, c: "var(--text-faint)" }) +
        ln(X(0), Y(i), X(7), Y(i), "var(--line)", 1) +
        (i ? txt(X(0) - 10, Y(i) + 4, i, { a: "end", s: 11, w: 700, c: "var(--text-faint)" }) : "");
    s += `<polygon points="${[
      [0, 0],
      [5, 0],
      [4, 3],
      [0, 5],
    ]
      .map(([x, y]) => `${X(x)},${Y(y)}`)
      .join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>`;
    s += txt(X(1.35), Y(1.7), "legal plans", { s: 13, c: "var(--teal-ink)" });
    // 3x + 2y = z drawn across the plot box
    const seg = (z) => {
      const pts = [];
      [
        [0, z / 2],
        [7, (z - 21) / 2],
        [z / 3, 0],
        [(z - 14) / 3, 7],
      ].forEach(([x, y]) => {
        if (x >= -1e-9 && x <= 7 + 1e-9 && y >= -1e-9 && y <= 7 + 1e-9) pts.push([x, y]);
      });
      return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
    };
    [
      [6, "£6"],
      [12, "£12"],
      [18, "£18"],
      [24, "£24"],
    ].forEach(([z, lab]) => {
      const [[x1, y1], [x2, y2]] = seg(z);
      const top = y1 > y2 ? [x1, y1] : [x2, y2];
      s += pk(
        "z" + z,
        ln(X(x1), Y(y1), X(x2), Y(y2), "var(--violet)", 3.5, 'stroke-dasharray="9 6"') +
          ln(X(x1), Y(y1), X(x2), Y(y2), "transparent", 20) +
          `<rect x="${X(top[0]) + 6}" y="${Y(top[1]) - 1}" width="46" height="22" rx="8" fill="var(--panel)" stroke="var(--violet)" stroke-width="2"/>` +
          txt(X(top[0]) + 29, Y(top[1]) + 15, lab, { s: 12, c: "var(--violet-ink)" }),
      );
    });
    s +=
      txt(X(7) + 8, Y(0) + 4, "x", { a: "start", c: "var(--text-dim)" }) +
      txt(X(0) + 8, 14, "y", { a: "start", c: "var(--text-dim)" });
    return svg(420, 278, s);
  }
  // live meters for the plan (x, 3)
  const labMeters = (x) => {
    const row = (name, used, lim) => {
      const over = used > lim + 1e-9,
        tight = Math.abs(used - lim) < 1e-9,
        pct = Math.min(100, (used / lim) * 100);
      const col = over ? "var(--rose)" : tight ? "var(--amber)" : "var(--teal)";
      return `<div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-weight:800;font-size:14px"><span>${name}</span><span style="color:${over ? "var(--rose-ink)" : tight ? "var(--amber-ink)" : "var(--text-dim)"}">${f1(used)} of ${lim}${over ? ": over!" : tight ? ": full" : ""}</span></div><div style="height:14px;border-radius:8px;background:var(--line);overflow:hidden"><div style="height:100%;width:${pct}%;background:${col}"></div></div></div>`;
    };
    return `<div style="border:2px solid var(--line);border-radius:14px;padding:8px 14px;background:var(--panel)"><div style="font-weight:900;margin-bottom:2px">Plan (${f1(x)}, 3)</div>${row("Machine hours (x + 2y)", x + 6, 10)}${row("Raw material (3x + y)", 3 * x + 3, 15)}</div>`;
  };

  B.add("a3-lab", [
    {
      type: "pick",
      q: "A factory earns £3 per unit of X and the price shown per unit of Y, so profit = 3x + c·y. Its feasible region never changes. Each panel's bars show the profit at the three corners (5, 0), (4, 3) and (0, 5). In which panels does the best plan lie along a whole edge of the region, not just at one corner? Click every one.",
      fig: labPanels(),
      a: ["c1", "c6"],
      why: "Two bars tie for the top in the £1 and £6 panels. A tie means the profit line is parallel to an edge of the region: at £1 the line 3x + y = z is parallel to the raw-material edge 3x + y = 15, and at £6 the line 3x + 6y = z is parallel to the machine-hours edge x + 2y = 10. Then every plan on that edge earns the same, and the best plan is not a single corner.",
    },
    {
      type: "pick",
      q: "A demand cap says at most this many units of Y can be sold (y ≤ cap). The chart shows the best profit the factory can make (£3 per X, £2 per Y, machine hours x + 2y ≤ 10, raw material 3x + y ≤ 15) for different caps. Click the point where the cap stops being slack and starts to bind.",
      fig: labCap(),
      a: "3",
      why: "The best plan without a cap is (4, 3), which uses 3 units of Y. A cap of 3 or more never blocks it, so profit stays flat at £18. At a cap of exactly 3 the cap just touches that plan, and any lower cap cuts it off, so the line bends down (£17 at cap 2, £16 at cap 1). A rule that is slack changes nothing; a binding rule changes the optimum.",
    },
    {
      type: "bug",
      q: "legal(x, y) should say whether a plan obeys both factory rules: machine hours x + 2y ≤ 10 and raw material 3x + y ≤ 15. It calls the plan (5, 2) legal, although it needs 17 units of raw material. Click the faulty line.",
      code: [
        "def legal(x, y):",
        "    ok_hours = x + 2*y <= 10",
        "    ok_raw = 3*x + y <= 15",
        "    return ok_hours or ok_raw",
      ],
      a: 3,
      why: "A plan is legal only if every rule holds, so the two checks must be joined with and. With or, the plan (5, 2) passes on machine hours (9 of 10) and is wrongly accepted although raw material is over (17 of 15).",
    },
    {
      type: "pick",
      q: "The green area holds every legal plan of the factory. Each dashed line holds all the plans that earn one profit, z = 3x + 2y. Click every profit that at least one legal plan can earn.",
      fig: labLines(),
      a: ["z6", "z12", "z18"],
      hint: "A profit can be earned if its line meets the green area anywhere, even at a single corner.",
      why: "The £6 and £12 lines cut straight through the green area, and the £18 line just touches it at the corner (4, 3), the best plan. The £24 line lies entirely outside, so no legal plan earns that much. Sliding the line up until it only just touches the region finds the optimum.",
    },
    {
      type: "slider",
      min: 0,
      max: 7,
      step: 0.5,
      start: 1,
      ans: 4,
      tol: 0,
      unit: "units of X",
      q: "The factory is making 3 units of Y. Slide the units of X up as far as the rules allow. Rules: machine hours x + 2y ≤ 10 and raw material 3x + y ≤ 15. What is the biggest X that keeps the plan legal?",
      live: labMeters,
      hint: "With y = 3: hours give x + 6 ≤ 10, raw material gives 3x + 3 ≤ 15.",
      why: "At x = 4 both rules are exactly full: hours 4 + 6 = 10 and raw material 12 + 3 = 15. Past that, both go over. A corner of the region is a plan where two rules bind at once, and (4, 3) is that corner.",
    },
  ]);

  /* =====================================================================
     a4-build  (workshop: build the cheapest network)
     ===================================================================== */
  const POS = { A: [50, 150], B: [150, 52], C: [150, 248], D: [285, 150], E: [405, 52], F: [405, 248], G: [480, 150] };
  function buildGroups() {
    const g1 = ["A", "C"];
    let s = "";
    "ABCDEFG".split("").forEach((t, i) => {
      const x = 12 + i * 57,
        a = g1.includes(t);
      s +=
        `<rect x="${x}" y="14" width="50" height="46" rx="12" fill="${a ? "var(--amber-dim)" : "var(--blue-dim)"}" stroke="${a ? "var(--amber)" : "var(--blue)"}" stroke-width="3"/>` +
        txt(x + 25, 44, t, { s: 20, c: "var(--ink)" });
    });
    s += txt(210, 84, "amber = one group, blue = the other group", { s: 12, w: 700, c: "var(--text-dim)" });
    s += txt(210, 106, "Laid so far: D–F 2, D–E 3, A–C 4, B–D 5, E–G 6", { s: 12.5, c: "var(--ink)" });
    return svg(420, 118, s);
  }
  function buildCut() {
    // purple team {D, F}; towns elsewhere; crossing cables are pickable
    const P = { A: [28, 150], B: [80, 48], C: [80, 252], D: [235, 98], E: [388, 52], F: [235, 204], G: [412, 236] };
    const cross = [
      ["B", "D", 5],
      ["C", "D", 8],
      ["C", "F", 10],
      ["D", "E", 3],
      ["E", "F", 11],
      ["F", "G", 12],
    ];
    const inside = [
      ["D", "F", 2],
      ["A", "B", 7],
      ["A", "C", 4],
      ["B", "C", 9],
      ["E", "G", 6],
    ];
    let s =
      `<ellipse cx="235" cy="151" rx="78" ry="98" fill="var(--violet-dim)" stroke="var(--violet)" stroke-width="3" stroke-dasharray="8 6"/>` +
      txt(235, 20, "purple team", { s: 12, c: "var(--violet-ink)" });
    const lab = (a, b, w, c, dx, dy) => {
      const [x1, y1] = P[a],
        [x2, y2] = P[b];
      return (
        `<rect x="${(x1 + x2) / 2 + dx - 13}" y="${(y1 + y2) / 2 + dy - 12}" width="26" height="20" rx="7" fill="var(--panel)"/>` +
        txt((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy + 4, w, { s: 13, c })
      );
    };
    inside.forEach(([a, b, w]) => {
      const [x1, y1] = P[a],
        [x2, y2] = P[b];
      s += ln(x1, y1, x2, y2, "var(--line-2)", 3);
    });
    inside.forEach(([a, b, w]) => (s += lab(a, b, w, "var(--text-faint)", a === "D" ? 18 : 0, 0)));
    const off = { "B-D": [0, -2], "C-D": [-6, 6], "C-F": [0, 4], "D-E": [0, -2], "E-F": [8, 8], "F-G": [0, 0] };
    cross.forEach(([a, b, w]) => {
      const [x1, y1] = P[a],
        [x2, y2] = P[b],
        o = off[a + "-" + b];
      s += pk(
        a + "-" + b,
        ln(x1, y1, x2, y2, "var(--amber)", 4) +
          ln(x1, y1, x2, y2, "transparent", 22) +
          lab(a, b, w, "var(--amber-ink)", o[0], o[1]),
      );
    });
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (s +=
          circ(x, y, 17, "var(--panel)", ["D", "F"].includes(k) ? "var(--violet)" : "var(--line-2)") +
          txt(x, y + 5, k, { s: 15, c: "var(--ink)" })),
    );
    return svg(440, 282, s);
  }
  // four candidate networks on five towns (pentagon layout)
  function buildPanels() {
    const pent = (cx, cy, r) =>
      [0, 1, 2, 3, 4].map((k) => [
        cx + r * Math.cos(((-90 + 72 * k) * Math.PI) / 180),
        cy + r * Math.sin(((-90 + 72 * k) * Math.PI) / 180),
      ]);
    const nets = {
      a: {
        e: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
        ],
        n: 4,
      },
      b: {
        e: [
          [0, 1],
          [1, 2],
          [2, 0],
          [3, 4],
        ],
        n: 4,
      },
      c: {
        e: [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 0],
        ],
        n: 5,
      },
      d: {
        e: [
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
        ],
        n: 4,
      },
    };
    let s = "";
    ["a", "b", "c", "d"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208,
        y0 = 4 + Math.floor(i / 2) * 176,
        P = pent(x0 + 100, y0 + 74, 52);
      let g = `<rect x="${x0}" y="${y0}" width="200" height="168" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      nets[k].e.forEach(([p, q]) => (g += ln(P[p][0], P[p][1], P[q][0], P[q][1], "var(--blue)", 4)));
      P.forEach(([x, y]) => (g += circ(x, y, 9, "var(--panel)", "var(--ink)", 3)));
      g += txt(x0 + 100, y0 + 156, `${nets[k].n} cables`, { s: 12, w: 700, c: "var(--text-dim)" });
      s += pk(k, g);
    });
    return svg(420, 356, s);
  }
  // hand-built network with a dashed extra cable
  function buildLoop() {
    const E = [
      ["A", "B", 7],
      ["A", "C", 4],
      ["C", "D", 8],
      ["D", "E", 3],
      ["D", "F", 2],
      ["F", "G", 12],
    ];
    let s = "";
    const lab = (a, b, w, c, dx = 0, dy = 0) => {
      const [x1, y1] = POS[a],
        [x2, y2] = POS[b],
        mx = (x1 + x2) / 2 + dx,
        my = (y1 + y2) / 2 + dy;
      return (
        `<rect x="${mx - 14}" y="${my - 12}" width="28" height="22" rx="7" fill="var(--panel)"/>` +
        txt(mx, my + 5, w, { s: 14, c })
      );
    };
    s += ln(POS.B[0], POS.B[1], POS.D[0], POS.D[1], "var(--rose)", 4, 'stroke-dasharray="9 7"');
    E.forEach(([a, b]) => (s += ln(POS[a][0], POS[a][1], POS[b][0], POS[b][1], "var(--blue)", 4.5)));
    E.forEach(([a, b, w]) => (s += lab(a, b, w, "var(--ink)")));
    s += lab("B", "D", 5, "var(--rose-ink)", 2, -10);
    Object.entries(POS).forEach(
      ([k, [x, y]]) =>
        (s += circ(x, y, 17, "var(--panel)", "var(--ink)") + txt(x, y + 5, k, { s: 15, c: "var(--ink)" })),
    );
    s += txt(260, 292, "solid = laid cables (total 36), dashed = the new cable B–D", {
      s: 12.5,
      w: 700,
      c: "var(--text-dim)",
    });
    return svg(520, 304, s);
  }
  // order a learner laid cables in
  function buildOrder() {
    const bars = [
      ["D–F", 2, "DF"],
      ["D–E", 3, "DE"],
      ["A–C", 4, "AC"],
      ["B–D", 5, "BD"],
      ["C–D", 8, "CD"],
      ["E–G", 6, "EG"],
    ];
    let s = "";
    for (let c = 0; c <= 8; c += 2)
      s +=
        ln(46, 150 - c * 13, 400, 150 - c * 13, "var(--line)", 1.5) +
        txt(38, 154 - c * 13, c, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    bars.forEach(([lab, c, id], i) => {
      const x = 58 + i * 57,
        h = c * 13;
      s += pk(
        id,
        `<rect x="${x}" y="${150 - h}" width="42" height="${h}" rx="6" fill="var(--blue)"/>` +
          txt(x + 21, 150 - h - 6, c, { s: 13, c: "var(--ink)" }) +
          txt(x + 21, 168, lab, { s: 12, c: "var(--text-dim)" }) +
          txt(x + 21, 183, `#${i + 1}`, { s: 11, w: 700, c: "var(--text-faint)" }),
      );
    });
    s += txt(210, 206, "All cables: A–B 7, A–C 4, B–C 9, B–D 5, C–D 8, C–F 10,", {
      s: 12,
      w: 700,
      c: "var(--text-dim)",
    });
    s += txt(210, 222, "D–E 3, D–F 2, E–F 11, E–G 6, F–G 12", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 234, s);
  }

  B.add("a4-build", [
    {
      type: "cat",
      q: "Kruskal has laid five cables, so the seven towns now sit in the two groups coloured below. Sort each remaining cable by what would happen if Kruskal reached it right now.",
      fig: buildGroups(),
      buckets: ["Joins two groups", "Closes a loop"],
      items: [
        ["A–B (cost 7)", 0],
        ["E–F (cost 11)", 1],
        ["C–F (cost 10)", 0],
        ["F–G (cost 12)", 1],
        ["B–C (cost 9)", 0],
      ],
      why: "Whether a cable makes a loop depends on the groups, not on its cost. E–F and F–G have both ends in the blue group, so they would close a loop. A–B, C–F and B–C each link amber to blue and would be laid. In a real run, laying the first of those merges the groups, and the other two then become loops.",
    },
    {
      type: "pick",
      q: "The purple team is the two towns D and F, and everyone else is outside. Cables that cross the dashed boundary are in amber. The cut property says one cable is guaranteed to be in a cheapest network. Click it.",
      fig: buildCut(),
      a: "D-E",
      why: "Only cables with exactly one end in the team cross the cut, and the lightest of those is safe: D–E (3) beats B–D 5, C–D 8, C–F 10, E–F 11 and F–G 12. D–F (2) is the cheapest cable overall, but both its ends are inside the team, so this cut says nothing about it. It is safe for a different cut, such as F on its own.",
    },
    {
      type: "pick",
      q: "Five towns need cabling. Four networks are drawn, each with the cables shown. Click every network that is a valid spanning tree: everything connected with no loops and nothing spare.",
      fig: buildPanels(),
      a: ["a", "d"],
      hint: "A tree on five towns has four cables, but four cables is not enough on its own. Check that nothing is cut off.",
      why: "The path (a) and the star (d) connect all five towns with exactly four cables. Network (b) also has four cables, but they form a loop on three towns and leave two towns cut off. Network (c) connects everyone but has a spare fifth cable that closes a loop. Cable count and connectedness both matter.",
    },
    {
      type: "slider",
      min: 0,
      max: 10,
      step: 1,
      start: 7,
      ans: 3,
      tol: 0,
      q: "Your hand-built network (solid cables, total 36) connects all seven towns. You add the dashed cable B–D, costing 5, which closes a loop. Then you remove the dearest cable on that loop. By how much does the total fall?",
      fig: buildLoop(),
      hint: "The loop runs B–A–C–D–B. Find its dearest cable and compare it with the new cable, 5.",
      why: "The loop is B–A (7), A–C (4), C–D (8) and the new D–B (5). The dearest cable is C–D (8). Swapping it for the 5 keeps everything connected and saves 8 − 5 = 3, so the total drops from 36 to 33.",
    },
    {
      type: "pick",
      q: "A learner lays these cables by hand in the order of the bars (height = cost). One cable was laid too early: a cheaper cable that makes no loop was still available. Click it.",
      fig: buildOrder(),
      a: "CD",
      hint: "Before the fifth cable, which towns are still unconnected, and which cheaper cables would join them?",
      why: "Before cable 5 the learner has D–F, D–E, A–C and B–D, so A and C form one group and G is alone. E–G (6) and A–B (7) would each join two groups and are cheaper than C–D (8), so C–D should wait. E–G (6) laid afterwards is not the slip: it is correct, just late. The result costs 28 instead of the minimum 27 (2 + 3 + 4 + 5 + 6 + 7).",
    },
  ]);

  /* =====================================================================
     a5-code  (workshop: code the hull)
     ===================================================================== */
  // trace of the scan on seven points: each test, its cross product and what the scan did
  function codeTrace() {
    const rows = [
      ["#", "stack top two, then new point", "cross", "scan does"],
      ["1", "(0,0) (3,0)  →  (6,0)", "0", "pop (3,0)"],
      ["2", "(0,0) (6,0)  →  (6,3)", "18", "push (6,3)"],
      ["3", "(6,0) (6,3)  →  (6,6)", "0", "push (6,6)"],
      ["4", "(0,0) (6,0)  →  (6,6)", "36", "push (6,6)"],
      ["5", "(6,0) (6,6)  →  (0,3)", "36", "push (0,3)"],
      ["6", "(6,6) (0,3)  →  (0,6)", "−18", "pop (0,3)"],
      ["7", "(6,0) (6,6)  →  (0,6)", "36", "push (0,6)"],
    ];
    const cols = [34, 238, 62, 126],
      rh = 31;
    let s = "",
      y = 6;
    rows.forEach((r, i) => {
      if (i === 0) {
        s += table(8, y, cols, rh, [r]);
        y += rh;
        return;
      }
      const cells = r.map((t, c) => ({ t, a: c === 1 || c === 3 ? "start" : undefined, s: c === 1 ? 13 : 13 }));
      let g = table(8, y, cols, rh, [cells], { head: false });
      s += pk("r" + i, g);
      y += rh;
    });
    s += txt(230, y + 20, "Points are written (x, y). Cross = orient(first, second, new).", {
      s: 12,
      w: 700,
      c: "var(--text-dim)",
    });
    return svg(470, y + 30, s);
  }
  // two sort orders round a pivot
  function codeOrders() {
    const P0 = [3, 0],
      pts = { A: [8, 2], B: [7, 6], C: [3, 7], D: [-1, 4], E: [0, 1] };
    const panel = (x0, title, order, note) => {
      const X = (x) => x0 + 24 + (x + 1) * 17,
        Y = (y) => 190 - y * 20;
      let s =
        `<rect x="${x0}" y="4" width="204" height="236" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` +
        txt(x0 + 102, 26, title, { s: 12.5, c: "var(--ink)" });
      s += circ(X(P0[0]), Y(P0[1]), 8, "var(--violet)", "var(--violet)");
      order.forEach((k, i) => {
        const [x, y] = pts[k];
        s +=
          ln(X(P0[0]), Y(P0[1]), X(x), Y(y), "var(--line-2)", 1.5, 'stroke-dasharray="4 4"') +
          circ(X(x), Y(y), 11, "var(--panel)", "var(--blue)") +
          txt(X(x), Y(y) + 5, i + 1, { s: 13, c: "var(--ink)" });
      });
      s +=
        txt(X(P0[0]), Y(P0[1]) + 22, "pivot", { s: 11, c: "var(--violet-ink)" }) +
        txt(x0 + 102, 226, note, { s: 12, w: 700, c: "var(--text-dim)" });
      return s;
    };
    return svg(
      420,
      246,
      panel(4, "returns −1 when t > 0", ["A", "B", "C", "D", "E"], "numbers = processing order") +
        panel(212, "returns +1 when t > 0", ["E", "D", "C", "B", "A"], "first test: orient(pivot, 1, 2) = −8"),
    );
  }
  // same-angle tie-break: the dashed polygon loses the corner R
  function codeTie() {
    const P = { P: [0, 0], Q: [2, 0], R: [4, 0], S: [4, 4], T: [0, 4] };
    const X = (x) => 34 + x * 46,
      Y = (y) => 218 - y * 46;
    let s = "";
    for (let i = 0; i <= 5; i++)
      s += ln(X(i), Y(0), X(i), Y(5), "var(--line)", 1) + ln(X(0), Y(i), X(5), Y(i), "var(--line)", 1);
    s += `<polygon points="${["P", "Q", "S", "T"].map((k) => `${X(P[k][0])},${Y(P[k][1])}`).join(" ")}" fill="var(--rose-dim)" fill-opacity=".55" stroke="var(--rose)" stroke-width="3" stroke-dasharray="8 6"/>`;
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (s += pk(
          k,
          circ(X(x), Y(y), 13, "var(--panel)", "var(--line-2)") + txt(X(x), Y(y) + 5, k, { s: 13, c: "var(--ink)" }),
        )),
    );
    s += txt(X(2.5), Y(5) + 2, "returned polygon", { s: 12, c: "var(--rose-ink)" });
    // the stack when Q arrives
    s += txt(330, 40, "stack when Q arrives", { s: 12, c: "var(--text-dim)" });
    s +=
      `<rect x="290" y="52" width="80" height="34" rx="8" fill="var(--blue-dim)" stroke="var(--blue)" stroke-width="2.5"/>` +
      txt(330, 74, "R (top)", { s: 13, c: "var(--ink)" });
    s +=
      `<rect x="290" y="88" width="80" height="34" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2.5"/>` +
      txt(330, 110, "P (bottom)", { s: 13, c: "var(--ink)" });
    s +=
      txt(330, 150, "orient(P, R, Q) = 0", { s: 12.5, c: "var(--amber-ink)" }) +
      txt(330, 168, "P, R, Q are in a line", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 244, s);
  }

  B.add("a5-code", [
    {
      type: "bug",
      q: "lowest(pts) should return the lowest point, and the leftmost one if two points are equally low. For [(5, 0), (0, 5)] it returns (0, 5), which is not the lowest. Click the faulty line.",
      code: [
        "def lowest(pts):",
        "    lx, ly = pts[0]",
        "    for x, y in pts:",
        "        if y < ly or x < lx:",
        "            lx, ly = x, y",
        "    return lx, ly",
      ],
      a: 3,
      why: "The x test must only break a tie in y. As written, any point further left replaces the pivot even when it is higher: (0, 5) beats (5, 0) on x. The fix is y < ly or (y == ly and x < lx). A wrong pivot is not on the hull, so everything after it goes wrong.",
    },
    {
      type: "pick",
      q: "The lab pops while the turn is not a left turn (cross ≤ 0). This worked trace of the scan on seven points has one wrong action. Each row is a test of the top two stack points and the new point. Click the row where the scan does the wrong thing.",
      fig: codeTrace(),
      a: "r3",
      hint: "Look at the rows where the cross product is exactly 0. What does the lab do with a straight line?",
      why: "In row 3, (6,0), (6,3) and (6,6) are in a straight line, so the cross product is 0 and the lab pops (6,3), the middle point of that edge. Row 1 shows the right behaviour for a 0: it pops. Row 4 confirms it, because it tests (0,0), (6,0), (6,6), which only happens after (6,3) has gone.",
    },
    {
      type: "cat",
      q: "With ax, ay = a − o and bx, by = b − o (y points up), orient(o, a, b) must be positive for a left turn, negative for a right turn and 0 for a straight line. Sort each candidate expression.",
      buckets: ["Left is positive", "Left is negative", "Not a turn test"],
      items: [
        ["<code>ax*by - ay*bx</code>", 0],
        ["<code>ay*bx - ax*by</code>", 1],
        ["<code>by*ax - bx*ay</code>", 0],
        ["<code>ax*bx + ay*by</code>", 2],
        ["<code>bx*ay - by*ax</code>", 1],
        ["<code>ax*by + ay*bx</code>", 2],
      ],
      hint: "Try o = (0, 0), a = (1, 0), b = (0, 1), a left turn. For the odd ones, also try a = (1, −1), b = (1, 1).",
      why: "ax*by − ay*bx is the cross product. Reordering its terms (by*ax − bx*ay) changes nothing, but swapping the two products (ay*bx − ax*by, bx*ay − by*ax) flips every sign, so left turns look negative. ax*bx + ay*by is the dot product, which measures alignment rather than turning, and ax*by + ay*bx adds where it should subtract, so it can read 0 for a real turn.",
    },
    {
      type: "mcq",
      q: "A student swaps the signs in the sort: compare returns +1 when t > 0 and −1 when t < 0 (the rest of the code is unchanged and still pops when orient ≤ 0). The panels show the order each version sorts the five points into. What does the scan return?",
      fig: codeOrders(),
      o: [
        "The full hull, listed clockwise instead",
        "Just two points: every test sees a right turn",
        "The same hull, as only the sort order moved",
        "Extra dented points, because nothing gets popped",
      ],
      a: 1,
      why: "The swapped sort visits the points clockwise, from the leftmost round to the right. Walking that way, every hull corner looks like a right turn, so orient ≤ 0 pops it every time. Only the pivot and the very last point survive. The turn test and the sort must agree about which direction is positive.",
    },
    {
      type: "pick",
      q: "The lab sorts points with the same angle from the pivot nearest first. A student sorts them farthest first instead. For these five points the scan returns the dashed polygon P, Q, S, T. Click the true hull corner that was lost.",
      fig: codeTie(),
      a: "R",
      why: "R (4, 0) comes first because it is farthest on the bottom edge, so it is pushed. Then Q (2, 0) arrives, the three points are in a line, the cross product is 0, and R is popped. The scan ends up treating Q as a corner and the real corner R is gone. Nearest first avoids this: Q goes on, then R arrives and pops Q, leaving the true corner.",
    },
  ]);

  /* =====================================================================
     a3-simplex
     ===================================================================== */
  // profit after each pivot: two pivots do not improve it
  function simplexSteps() {
    const z = [0, 12, 12, 12, 17, 21],
      X = (k) => 56 + k * 62,
      Y = (v) => 196 - v * 6.6;
    let s = "";
    for (let v = 0; v <= 24; v += 6)
      s +=
        ln(X(0), Y(v), X(5), Y(v), "var(--line)", 1.5) +
        txt(X(0) - 12, Y(v) + 4, v, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    s += `<polyline points="${z.map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    z.forEach((v, k) => {
      s +=
        k === 0
          ? circ(X(k), Y(v), 9, "var(--panel-2)", "var(--line-2)")
          : pk(
              String(k),
              circ(X(k), Y(v), 14, "var(--panel)", "var(--line-2)") +
                txt(X(k), Y(v) + 5, k, { s: 13, c: "var(--ink)" }),
            );
    });
    s +=
      txt(X(0), Y(0) + 22, "start", { s: 11, w: 700, c: "var(--text-faint)" }) +
      txt(X(3), Y(0) + 40, "pivot number", { s: 12, w: 700, c: "var(--text-dim)" }) +
      txt(X(0) - 10, 16, "profit z", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(400, 252, s);
  }
  // before and after tableaux (gain row = how much z rises per unit of each column)
  function simplexTableau() {
    const head = ["", "x", "y", "s1", "s2", "s3", "RHS"],
      cols = [46, 50, 50, 50, 50, 50, 58];
    const before = [
      head,
      ["s1", "1", "1", "1", "0", "0", "6"],
      ["s2", "1", "3", "0", "1", "0", "12"],
      ["s3", { t: "1", fill: "var(--amber-dim)", c: "var(--amber-ink)" }, "0", "0", "0", "1", "4"],
      ["gain", "3", "2", "0", "0", "0", "z = 0"],
    ];
    const after = [
      head,
      ["s1", "0", "1", "1", "0", "+1", "2"],
      ["s2", "0", "3", "0", "1", "−1", "8"],
      ["x", "1", "0", "0", "0", "1", "4"],
      ["gain", "0", "2", "0", "0", "−3", "z = 12"],
    ];
    const rn = ["s1", "s2", "x", "gain"];
    let s = txt(8, 18, "Before: pivot on the orange cell (x enters, s3 leaves)", {
      a: "start",
      s: 12.5,
      c: "var(--ink)",
    });
    s += table(8, 26, cols, 25, before);
    s += txt(8, 176, "After the pivot: one entry is wrong. Click it.", { a: "start", s: 12.5, c: "var(--ink)" });
    s += table(
      8,
      184,
      cols,
      25,
      after.map((r, i) =>
        i === 0 ? r : r.map((c, j) => (j === 0 ? { t: c, fill: "var(--panel-2)", c: "var(--text-dim)" } : c)),
      ),
    );
    // pickable overlays on the six value columns of the four body rows
    ["x", "y", "s1", "s2", "s3", "RHS"].forEach((col, j) =>
      rn.forEach((r, i) => {
        const x = 8 + cols[0] + cols.slice(1, j + 1).reduce((a, b) => a + b, 0),
          w = cols[j + 1];
        s += pk(
          `${r}-${col}`,
          `<rect x="${x}" y="${184 + 25 * (i + 1)}" width="${w}" height="25" fill="transparent" stroke="transparent" stroke-width="1"/>`,
        );
      }),
    );
    return svg(420, 320, s);
  }
  // raise-the-variable gains for the four variables at 0
  function simplexGains() {
    const v = [
        ["x1", 2],
        ["x2", -3],
        ["x3", 4],
        ["x4", 0],
      ],
      base = 116,
      k = 22;
    let s =
      ln(30, base, 400, base, "var(--ink)", 2.5) +
      txt(14, base + 4, "0", { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    [-4, -2, 2, 4].forEach(
      (g) =>
        (s +=
          ln(30, base - g * k, 400, base - g * k, "var(--line)", 1) +
          txt(24, base - g * k + 4, (g > 0 ? "+" : "") + g, { a: "end", s: 11, w: 700, c: "var(--text-faint)" })),
    );
    v.forEach(([name, g], i) => {
      const x = 62 + i * 88,
        h = Math.abs(g) * k,
        y = g >= 0 ? base - h : base;
      s += pk(
        name,
        `<rect x="${x - 40}" y="12" width="80" height="208" fill="transparent" stroke="transparent"/><rect x="${x - 22}" y="${g === 0 ? base - 2 : y}" width="44" height="${g === 0 ? 4 : h}" rx="5" fill="${g > 0 ? "var(--teal)" : g < 0 ? "var(--rose)" : "var(--text-faint)"}"/>` +
          txt(x, g > 0 ? y - 7 : g < 0 ? y + h + 16 : base - 12, (g > 0 ? "+" : "") + g, { s: 13, c: "var(--ink)" }) +
          txt(x, 238, name, { s: 14, c: "var(--ink)" }),
      );
    });
    s += txt(210, 258, "z gain per unit raised", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 266, s);
  }
  // open feasible region with four objectives
  function simplexOpen() {
    const dirs = {
      A: [1, 1, "max x + y"],
      B: [-1, 1, "max y − x"],
      C: [1, -1, "max x − y"],
      D: [-1, -1, "max −x − y"],
    };
    let s = "";
    ["A", "B", "C", "D"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208,
        y0 = 4 + Math.floor(i / 2) * 176,
        ox = x0 + 26,
        oy = y0 + 126,
        u = 28;
      const P = (x, y) => `${ox + x * u},${oy - y * u}`;
      s += `<rect x="${x0}" y="${y0}" width="200" height="168" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      s += `<polygon points="${P(0, 0)} ${P(0, 1)} ${P(2.9, 3.9)} ${P(6.1, 3.9)} ${P(6.1, 0)}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2.5" stroke-linejoin="round"/>`;
      s += txt(ox + 4.9 * u, oy - 0.45 * u, "open →", { s: 11, w: 700, c: "var(--teal-ink)" });
      const [dx, dy, lab] = dirs[k],
        cx = ox + 2.9 * u,
        cy = oy - 1.7 * u,
        L = 44 / Math.hypot(dx, dy);
      s += arrow(cx - dx * L * 0.35, cy + dy * L * 0.35, cx + dx * L, cy - dy * L, "var(--amber)", 4);
      s +=
        txt(x0 + 100, y0 + 158, lab, { s: 13, c: "var(--ink)" }) +
        txt(x0 + 12, y0 + 22, k, { a: "start", s: 15, c: "var(--text-dim)" });
    });
    return svg(420, 356, s);
  }

  B.add("a3-simplex", [
    {
      type: "pick",
      q: "Simplex ran on a maximising LP and the chart shows z after each pivot. A normal pivot moves to a corner with a bigger z. Click every pivot that changed the basis without improving z.",
      fig: simplexSteps(),
      a: ["2", "3"],
      why: "At pivots 2 and 3 the profit stays at 12, so the plan did not move. That is degeneracy: three or more constraints meet at the same corner, the ratio test ties (or gives 0), and a pivot swaps which variables are in the basis without leaving the corner. Simplex then continues and reaches 17 and 21. In theory a bad pivot rule could cycle on a degenerate corner, but in practice it escapes.",
    },
    {
      type: "pick",
      q: "A tableau is pivoted on the orange cell: x enters and s3 leaves. The gain row shows how much z rises per unit of each column, and RHS is the right-hand side. One entry in the new tableau is wrong. Click it.",
      fig: simplexTableau(),
      a: "s1-s3",
      hint: "Row operations: new s1 = old s1 − old s3 row, new s2 = old s2 − old s3 row, new gain = old gain − 3 × the x row.",
      why: "Subtract the pivot row (x s3 = 1, RHS 4) from the s1 row: the s3 entry goes from 0 to 0 − 1 = −1, not +1. The other entries check out: s1 row 0 1 1 0 −1 | 2, s2 row 0 3 0 1 −1 | 8, gain row 0 2 0 0 −3 | z = 12. A pivot must keep every row consistent, because each row is still the same equation.",
    },
    {
      type: "pick",
      q: "Simplex stands at a corner of a four-variable LP (maximising z) where x1, x2, x3 and x4 are all 0. Each bar shows how z changes per unit if that variable is raised. Click every variable that could enter the basis.",
      fig: simplexGains(),
      a: ["x1", "x3"],
      why: "Raising a variable only helps if its gain is positive, so x1 (+2) and x3 (+4) qualify. x2 (−3) would make z worse, and x4 (0) leaves z unchanged, so neither is a useful move. Dantzig's rule picks the largest, x3, but x1 would also be a valid choice. When no gain is positive, the corner is optimal.",
    },
    {
      type: "cat",
      q: "The green region is every legal plan: x ≥ 0, y ≥ 0 and y ≤ x + 1. It never ends towards the right. Each panel maximises a different objective, and the amber arrow points the way z grows. Does each LP have a best plan, or is it unbounded?",
      fig: simplexOpen(),
      buckets: ["Has a best plan", "Unbounded"],
      items: [
        ["Panel A: max x + y", 1],
        ["Panel B: max y − x", 0],
        ["Panel C: max x − y", 1],
        ["Panel D: max −x − y", 0],
      ],
      hint: "Ask whether z can keep rising along some direction the region allows, such as along the bottom edge (to the right) or up the slanting edge.",
      why: "A: moving right and up together raises x + y without limit. C: the arrow points down-right, but sliding right along the floor y = 0 still raises x − y forever. B: y − x never exceeds 1 inside the region, and the whole upper edge ties at 1. D: −x − y is largest at the origin (0). An LP is unbounded when some direction the region allows also improves z.",
    },
    {
      type: "bug",
      q: "leaving_row(rows, col) runs the ratio test for the entering column col. Each row ends with its right-hand side. It once chose a row whose entry in that column was negative and pushed the plan out of the feasible region. Click the faulty line.",
      code: [
        "def leaving_row(rows, col):",
        "    best, pick = None, None",
        "    for i, row in enumerate(rows):",
        "        if row[col] != 0:",
        "            r = row[-1] / row[col]",
        "            if best is None or r < best:",
        "                best, pick = r, i",
        "    return pick",
      ],
      a: 3,
      why: "A negative entry means raising the entering variable makes that row's slack grow, so that constraint never stops you and it must be ignored. Only rows with a positive entry limit the step, so the test should be row[col] > 0. Keeping a negative ratio would also pick a row that gives a negative step.",
    },
  ]);

  /* =====================================================================
     a3-bracket
     ===================================================================== */
  const PHI = (Math.sqrt(5) - 1) / 2;
  // bracket width against function evaluations: golden section against splitting into thirds
  function bracketRace() {
    const X = (e) => 50 + e * 25,
      Y = (w) => 206 - w * 160;
    const gold = (e) => (e < 2 ? 1 : Math.pow(PHI, e - 2)),
      third = (e) => Math.pow(2 / 3, Math.floor(e / 2));
    let s = "";
    for (let w = 0; w <= 1.001; w += 0.25)
      s +=
        ln(X(0), Y(w), X(14), Y(w), "var(--line)", 1.5) +
        txt(X(0) - 8, Y(w) + 4, f1(w), { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    for (let e = 0; e <= 14; e += 2) s += txt(X(e), Y(0) + 17, e, { s: 11, w: 700, c: "var(--text-faint)" });
    s +=
      txt(X(7), Y(0) + 36, "function evaluations so far", { s: 12, w: 700, c: "var(--text-dim)" }) +
      txt(X(0) - 4, 16, "bracket width", { a: "start", s: 12, c: "var(--text-dim)" });
    const path = (fn) => Array.from({ length: 15 }, (_, e) => `${X(e)},${Y(fn(e))}`).join(" ");
    s += pk(
      "A",
      `<polyline points="${path(third)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>` +
        `<polyline points="${path(third)}" fill="none" stroke="transparent" stroke-width="22"/>` +
        circ(X(10), Y(third(10)) - 16, 12, "var(--panel)", "var(--blue)") +
        txt(X(10), Y(third(10)) - 12, "A", { s: 13, c: "var(--ink)" }),
    );
    s += pk(
      "B",
      `<polyline points="${path(gold)}" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linejoin="round"/>` +
        `<polyline points="${path(gold)}" fill="none" stroke="transparent" stroke-width="22"/>` +
        circ(X(6), Y(gold(6)) - 18, 12, "var(--panel)", "var(--amber)") +
        txt(X(6), Y(gold(6)) - 14, "B", { s: 13, c: "var(--ink)" }),
    );
    return svg(420, 262, s);
  }
  // worked golden-section trace on f(x) = (x - 3)^2 with one wrong "keeps" cell
  function bracketTrace() {
    let a = 0,
      b = 8;
    const f = (x) => (x - 3) * (x - 3),
      r2 = (v) => v.toFixed(2),
      rows = [["", "bracket [a, b]", "c", "d", "f(c)", "f(d)", "keeps"]];
    for (let i = 1; i <= 4; i++) {
      const c = b - PHI * (b - a),
        d = a + PHI * (b - a),
        fc = f(c),
        fd = f(d);
      let keep = fc < fd ? [a, d] : [c, b];
      if (i === 3) keep = fc < fd ? [c, b] : [a, d]; // the planted slip
      rows.push([String(i), `[${r2(a)}, ${r2(b)}]`, r2(c), r2(d), r2(fc), r2(fd), `[${r2(keep[0])}, ${r2(keep[1])}]`]);
      [a, b] = keep;
    }
    const cols = [30, 112, 50, 50, 52, 52, 112],
      rh = 34;
    let s = table(6, 6, cols, rh, [rows[0]], { s: 12.5 });
    for (let i = 1; i < rows.length; i++)
      s += pk("r" + i, table(6, 6 + i * rh, cols, rh, [rows[i]], { head: false, s: 12.5 }));
    s += txt(230, 6 + 5 * rh + 18, "Each row starts from the bracket the row above kept.", {
      s: 12,
      w: 700,
      c: "var(--text-dim)",
    });
    return svg(470, 6 + 5 * rh + 28, s);
  }
  // live number line for the new probe
  const bracketLive = (v) => {
    const X = (t) => 24 + t * 372;
    let s =
      `<rect x="${X(0.382)}" y="38" width="${X(1) - X(0.382)}" height="26" rx="8" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2.5"/>` +
      ln(X(0), 51, X(1), 51, "var(--ink)", 2.5);
    [
      [0, "a = 0"],
      [1, "b = 1"],
    ].forEach(
      ([t, l]) => (s += ln(X(t), 41, X(t), 61, "var(--ink)", 3) + txt(X(t), 86, l, { s: 12, c: "var(--text-dim)" })),
    );
    s +=
      circ(X(0.382), 51, 8, "var(--panel)", "var(--blue)") +
      txt(X(0.382), 24, "old c = 0.382", { s: 12, c: "var(--blue-ink)" });
    s +=
      circ(X(0.618), 51, 8, "var(--panel)", "var(--blue)") +
      txt(X(0.618), 24, "old d = 0.618 (reused)", { s: 12, c: "var(--blue-ink)" });
    s +=
      `<circle cx="${X(v)}" cy="51" r="10" fill="var(--amber)" stroke="var(--ink)" stroke-width="2.5"/>` +
      txt(X(v), 108, `new probe at ${f1(v)}`, { s: 13, c: "var(--amber-ink)" });
    return svg(420, 118, s);
  };
  // function values at a, c, d, b and the three pieces
  function bracketTie() {
    const X = (t) => 30 + t * 360,
      base = 138,
      k = 16;
    let s = ln(X(0), base, X(1), base, "var(--ink)", 2.5);
    [
      [0, "a", 6],
      [0.382, "c", 2],
      [0.618, "d", 2],
      [1, "b", 5],
    ].forEach(([t, n, v]) => {
      s +=
        `<rect x="${X(t) - 11}" y="${base - v * k}" width="22" height="${v * k}" rx="4" fill="var(--blue)"/>` +
        txt(X(t), base - v * k - 7, v, { s: 13, c: "var(--ink)" }) +
        txt(X(t), base + 16, n, { s: 14, c: "var(--ink)" });
    });
    [
      [0, 0.382, "L", "left piece", "var(--violet)"],
      [0.382, 0.618, "M", "middle", "var(--amber)"],
      [0.618, 1, "R", "right piece", "var(--violet)"],
    ].forEach(([t0, t1, , lab, col]) => {
      s +=
        `<rect x="${X(t0) + 3}" y="${base + 26}" width="${X(t1) - X(t0) - 6}" height="12" rx="6" fill="${col}"/>` +
        txt((X(t0) + X(t1)) / 2, base + 58, lab, { s: 12, c: "var(--text-dim)" });
    });
    s += txt(14, 14, "f at each point", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(420, 210, s);
  }
  // four candidate functions on [0, 1]
  function bracketCurves() {
    const fs = {
      a: (x) => 3 * (x - 0.45) * (x - 0.45) + 0.1,
      b: (x) => 1.2 * Math.abs(x - 0.65) + 0.05,
      c: (x) => 0.55 + 0.3 * Math.sin(15 * x),
      d: (x) => 40 * Math.pow((x - 0.25) * (x - 0.75), 2),
    };
    let s = "";
    ["a", "b", "c", "d"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208,
        y0 = 4 + Math.floor(i / 2) * 136,
        fn = fs[k];
      let lo = 1e9,
        hi = -1e9;
      for (let j = 0; j <= 100; j++) {
        const v = fn(j / 100);
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      const P = (t) => `${x0 + 18 + t * 164},${y0 + 104 - ((fn(t) - lo) / (hi - lo)) * 70}`;
      let g = `<rect x="${x0}" y="${y0}" width="200" height="128" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      g += `<polyline points="${Array.from({ length: 101 }, (_, j) => P(j / 100)).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
      g += txt(x0 + 14, y0 + 20, k.toUpperCase(), { a: "start", s: 14, c: "var(--text-dim)" });
      s += pk(k, g);
    });
    return svg(420, 272, s);
  }

  B.add("a3-bracket", [
    {
      type: "pick",
      q: "Two methods shrink a bracket of width 1 around a minimum. Thirds search evaluates two new points every step and keeps 2/3 of the bracket. Golden-section search evaluates two points at the start, then one new point per step, and keeps 0.618 of the bracket. The chart plots bracket width against the evaluations of f so far. Click the golden-section line.",
      fig: bracketRace(),
      a: "B",
      why: "Line B is golden-section. It stays flat for the first two evaluations (it needs two probes before it can cut anything), but then each single new evaluation cuts the width to 0.618 of what it was. After 12 evaluations B is about 0.008, while thirds search (A) is only down to 0.088. Reusing one probe per step is what makes golden-section cheap.",
    },
    {
      type: "pick",
      q: "A student worked golden-section search by hand to minimise f(x) = (x − 3)² on [0, 8], listing the probes, their f values and the bracket each step keeps. One row keeps the wrong piece. Click it.",
      fig: bracketTrace(),
      a: "r3",
      hint: "In each row compare f(c) with f(d). Keep [a, d] when f(c) is smaller and [c, b] when f(d) is smaller.",
      why: "In row 3, f(c) = 0.00 is smaller than f(d) = 0.60, so the minimum cannot lie beyond d and the search must keep [a, d] = [1.89, 3.78]. The row keeps [3.06, 4.94] instead, which throws away the true minimum at x = 3. The next rows then search in the wrong place.",
    },
    {
      type: "slider",
      min: 0.4,
      max: 1,
      step: 0.01,
      start: 0.5,
      ans: 0.76,
      tol: 0.025,
      q: "A golden-section search on [0, 1] probed c = 0.382 and d = 0.618 and found f(c) > f(d), so it keeps [0.382, 1]. The old probe d is reused as one new probe. Slide the marker to where the other new probe goes.",
      live: bracketLive,
      hint: "The new probes sit 38.2% and 61.8% of the way along the kept piece, which is 0.618 wide. 0.618 × 0.618 is about 0.38.",
      why: "The kept piece is [0.382, 1], width 0.618. Its 38.2% point is 0.382 + 0.382 × 0.618 = 0.618, which is exactly the old d, so no new evaluation is needed. Its 61.8% point is 0.382 + 0.618 × 0.618 ≈ 0.764. That is the only new probe. This reuse is the whole trick of the golden ratio.",
    },
    {
      type: "cat",
      q: "f is unimodal on [a, b]. Golden-section search probes c and d and gets equal values, shown in the bars. Sort each piece of the bracket.",
      fig: bracketTie(),
      buckets: ["Can be discarded", "Must be kept"],
      items: [
        ["Left piece [a, c]", 0],
        ["Middle piece [c, d]", 1],
        ["Right piece [d, b]", 0],
      ],
      why: "Equal values at c and d mean c and d sit on opposite sides of the dip, so the minimum lies between them, in the middle piece. Both outer pieces are safe to throw away. A real implementation discards just one (either) and carries on, because the next step re-probes the smaller bracket.",
    },
    {
      type: "pick",
      q: "Golden-section search on [0, 1] is only guaranteed to find the minimum if f goes down once and up once. Click every function it is guaranteed to work on.",
      fig: bracketCurves(),
      a: ["a", "b"],
      why: "A is a smooth bowl and B is a V with a sharp kink. Both are unimodal, and golden-section only compares function values, so it does not need a derivative and the kink is no problem. C has three dips and D has two, so a comparison of two probes can send the bracket into the wrong dip.",
    },
  ]);

  /* =====================================================================
     a3-nm
     ===================================================================== */
  // contour map f = (x - 5)^2 + (y - 3)^2 with triangle ABC and three reflected candidates
  function nmContours() {
    const u = 34,
      X = (x) => 30 + u * x,
      Y = (y) => 262 - u * y;
    let s = "";
    [
      [1, "f = 1"],
      [2, "f = 4"],
      [3, "f = 9"],
      [4, "f = 16"],
    ].forEach(([r, l]) => {
      s += `<circle cx="${X(5)}" cy="${Y(3)}" r="${r * u}" fill="none" stroke="var(--line-2)" stroke-width="2"/>`;
      const a = (-28 * Math.PI) / 180,
        tx = X(5) + r * u * Math.cos(a),
        ty = Y(3) - r * u * Math.sin(a);
      s +=
        `<rect x="${tx - 24}" y="${ty - 10}" width="48" height="19" rx="7" fill="var(--panel)"/>` +
        txt(tx, ty + 4, l, { s: 11.5, w: 800, c: "var(--text-dim)" });
    });
    s +=
      `<path d="M${X(5)},${Y(3) - 9} l2.6,6 6.4,.5 -4.8,4.2 1.5,6.3 -5.7,-3.3 -5.7,3.3 1.5,-6.3 -4.8,-4.2 6.4,-.5z" fill="var(--amber)"/>` +
      txt(X(5), Y(3) + 26, "minimum", { s: 11.5, c: "var(--amber-ink)" });
    const T = { A: [2, 5], B: [3, 2.5], C: [4.5, 4.5] };
    s += `<polygon points="${Object.values(T)
      .map(([x, y]) => `${X(x)},${Y(y)}`)
      .join(
        " ",
      )}" fill="var(--violet-dim)" fill-opacity=".75" stroke="var(--violet)" stroke-width="3" stroke-linejoin="round"/>`;
    const cand = {
      P: [
        [3, 2.5],
        [3.5, 7],
      ],
      Q: [
        [2, 5],
        [5.5, 2],
      ],
      S: [
        [4.5, 4.5],
        [0.5, 3],
      ],
    };
    Object.entries(cand).forEach(([k, [from, to]]) => {
      s += arrow(
        X(from[0]),
        Y(from[1]),
        X(to[0]) - (X(to[0]) - X(from[0])) * 0.06,
        Y(to[1]) - (Y(to[1]) - Y(from[1])) * 0.06,
        "var(--text-faint)",
        2,
      );
    });
    Object.entries(T).forEach(
      ([k, [x, y]]) =>
        (s +=
          circ(X(x), Y(y), 11, "var(--panel)", "var(--violet)") + txt(X(x), Y(y) + 5, k, { s: 13, c: "var(--ink)" })),
    );
    Object.entries(cand).forEach(
      ([k, [, to]]) =>
        (s += pk(
          k,
          circ(X(to[0]), Y(to[1]), 14, "var(--panel)", "var(--blue)") +
            txt(X(to[0]), Y(to[1]) + 5, k, { s: 13, c: "var(--ink)" }),
        )),
    );
    return svg(400, 300, s);
  }
  // four moves drawn as before (grey dashed) and after (green)
  function nmMoves() {
    const Bs = [4, 1],
      Md = [5, 3.5],
      W = [1.5, 3],
      M = [(Bs[0] + Md[0]) / 2, (Bs[1] + Md[1]) / 2];
    const refl = [2 * M[0] - W[0], 2 * M[1] - W[1]],
      expd = [3 * M[0] - 2 * W[0], 3 * M[1] - 2 * W[1]],
      cont = [M[0] + 0.5 * (W[0] - M[0]), M[1] + 0.5 * (W[1] - M[1])];
    const shr = [
      Bs,
      [Bs[0] + 0.5 * (Md[0] - Bs[0]), Bs[1] + 0.5 * (Md[1] - Bs[1])],
      [Bs[0] + 0.5 * (W[0] - Bs[0]), Bs[1] + 0.5 * (W[1] - Bs[1])],
    ];
    const moves = { A: [Bs, Md, cont], B: [Bs, Md, refl], C: shr, D: [Bs, Md, expd] };
    let s = "";
    ["A", "B", "C", "D"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208,
        y0 = 4 + Math.floor(i / 2) * 138,
        ox = x0 + 14,
        oy = y0 + 112,
        u = 15;
      const pts = (T) => T.map(([x, y]) => `${ox + x * u},${oy - y * u}`).join(" ");
      s += `<rect x="${x0}" y="${y0}" width="200" height="130" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      s += `<polygon points="${pts([Bs, Md, W])}" fill="none" stroke="var(--text-faint)" stroke-width="2.5" stroke-dasharray="6 5" stroke-linejoin="round"/>`;
      s += `<polygon points="${pts(moves[k])}" fill="var(--teal-dim)" fill-opacity=".8" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>`;
      s +=
        circ(ox + W[0] * u, oy - W[1] * u, 6, "var(--rose)", "var(--rose)", 1) +
        txt(x0 + 14, y0 + 22, k, { a: "start", s: 15, c: "var(--text-dim)" });
    });
    return svg(420, 280, s);
  }
  // best / middle / worst corner values over iterations (no shrink moves); one point is impossible
  function nmLines() {
    const best = [4, 4, 3, 3, 3.6, 3.6],
      mid = [7, 7, 4, 4, 4, 4],
      worst = [11, 9, 7, 6, 5, 4.6];
    const X = (k) => 56 + k * 62,
      Y = (v) => 214 - v * 16;
    let s = "";
    for (let v = 2; v <= 12; v += 2)
      s +=
        ln(X(0), Y(v), X(5), Y(v), "var(--line)", 1.5) +
        txt(X(0) - 12, Y(v) + 4, v, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    for (let k = 0; k <= 5; k++) s += txt(X(k), Y(2) + 18, k, { s: 11, w: 700, c: "var(--text-faint)" });
    const line = (arr, col) =>
      `<polyline points="${arr.map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linejoin="round"/>`;
    s += line(worst, "var(--amber)") + line(mid, "var(--blue)") + line(best, "var(--teal)");
    best.forEach((v, k) => {
      s +=
        k === 0
          ? circ(X(k), Y(v), 7, "var(--teal)", "var(--teal)", 1)
          : pk(
              String(k),
              circ(X(k), Y(v), 12, "var(--panel)", "var(--teal)") + txt(X(k), Y(v) + 4, k, { s: 12, c: "var(--ink)" }),
            );
    });
    [
      ["best", "var(--teal)", 70],
      ["middle", "var(--blue)", 160],
      ["worst", "var(--amber)", 260],
    ].forEach(
      ([l, c, x]) => (s += ln(x - 26, 14, x - 8, 14, c, 4) + txt(x - 2, 18, l, { a: "start", s: 12, c: "var(--ink)" })),
    );
    s += txt(X(2.5), Y(2) + 36, "iteration", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 262, s);
  }

  B.add("a3-nm", [
    {
      type: "pick",
      q: "The rings are contour lines of f, and the number on a ring is f there (lower is better). Nelder–Mead holds the violet triangle ABC and replaces its worst corner by flipping it through the midpoint of the other two. Each grey arrow shows where flipping one corner would land. Click the landing point it actually tries first.",
      fig: nmContours(),
      a: "Q",
      why: "Corner A sits between the f = 9 and f = 16 rings, B between 4 and 9, and C between 1 and 4, so A is the worst. Flipping A through the midpoint of B and C lands at Q, which is close to the minimum. The other two arrows flip corners that are not the worst, so Nelder–Mead would not try them. Q is also better than every corner, which makes an expansion likely next.",
    },
    {
      type: "match",
      q: "Each picture shows a Nelder–Mead triangle before (grey dashed) and after one move (green). The red dot marks the old worst corner. Match each picture to its move.",
      fig: nmMoves(),
      pairs: [
        ["Picture A", "Contract: pull the worst corner back towards the middle"],
        ["Picture B", "Reflect: flip the worst corner through the midpoint"],
        ["Picture C", "Shrink: squash the whole triangle towards the best corner"],
        ["Picture D", "Expand: flip the worst corner and go even further"],
      ],
      why: "In B the worst corner jumps to the far side of the other two (a reflection). In D it jumps even further out on the same line (an expansion). In A it moves a little way inwards, which is a contraction. In C two corners move at once, towards the best one: that is the shrink, and the only move that changes more than one corner.",
    },
    {
      type: "bug",
      q: "shrink(pts) is called when nothing else works. pts is sorted with the best corner first. It should keep the best corner and move every other corner halfway towards it (mid(p, q) is the midpoint). The triangle it returns is lopsided. Click the faulty line.",
      code: [
        "def shrink(pts):",
        "    best = pts[-1]",
        "    out = [best]",
        "    for p in pts[1:]:",
        "        out.append(mid(best, p))",
        "    return out",
      ],
      a: 1,
      why: "Shrinking pulls everything towards the best corner, which is pts[0] when the list is sorted best first. pts[-1] is the worst corner, so every other corner is dragged towards the worst point, away from the minimum.",
    },
    {
      type: "multi",
      q: "Select every situation where Nelder–Mead is a sensible first thing to try.",
      o: [
        "Tuning 3 settings of a game simulator that only returns a score",
        "Minimising a smooth function of 4 inputs when no gradient is available",
        "Fitting a model with 2,000 parameters whose gradient is cheap to compute",
        "Finding the guaranteed global minimum of a function with many valleys",
        "Tuning 2 settings of a lab experiment whose readings are slightly noisy",
      ],
      a: [0, 1, 4],
      why: "Nelder–Mead only compares function values, so it works when you can only evaluate a score, even a noisy one, and the number of inputs is small. It is a poor fit for thousands of parameters (the triangle becomes huge and slow, and a cheap gradient is much better) and it offers no guarantee of finding the global minimum, since it can settle in any valley.",
    },
    {
      type: "pick",
      q: "A student logs the three corner values (best, middle, worst) after each iteration of a normal Nelder–Mead run on a minimisation problem, with no shrink moves. One dot on the green best line is impossible. Click it.",
      fig: nmLines(),
      a: "4",
      hint: "In a normal iteration only the worst corner is replaced. What can that do to the best value?",
      why: "At iteration 4 the best value rises from 3 to 3.6, so the best corner was thrown away. Reflect, expand and contract only replace the worst corner, and shrink keeps the best, so the best value can only stay or fall. In fact all three lines should only stay level or go down.",
    },
  ]);

  /* ---------- PART 4 is appended below by the rest of the file ---------- */
})();

/* ===== bank-x-algo-3.js ===== */
/* Revision bank, third set of varied, visual questions (algo-3): the Phase 6 and 7 workshops (a6-wire, a7-build)
   and the sessions a6-crc, a6-hamming, a7-entropy, a7-huffman, a7-lzw.
   Every number was produced by running the real algorithms in node (CRC division, Huffman merges, LZW traces, entropies). */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG helpers (CSS variables so both themes work) ---------- */
  const SVG = (w, h, inner, label) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto" role="img" aria-label="${label}">${inner}</svg>`;
  const TX = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" fill="${o.f || "var(--text)"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "ui-monospace,Consolas,monospace" : "var(--sans)"}">${s}</text>`;
  const RC = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r == null ? 8 : o.r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const LN = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const CI = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"/>`;
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const MUTE = "var(--text-2, var(--text))";
  const RED = "var(--rose)",
    GRN = "var(--teal)",
    BLU = "var(--blue)",
    AMB = "var(--amber)",
    VIO = "var(--violet)";
  const hit = (x, y, w, h) => RC(x, y, w, h, { r: 8, f: "transparent", k: "transparent", w: 1 });
  const ent = (ps) => -ps.filter((p) => p > 0).reduce((s, p) => s + p * Math.log2(p), 0);

  /* ======================================================================
     a6-wire  (workshop: noisy wire)
     ====================================================================== */
  // 1. four received copies of an even-parity frame (diff view against the sent frame)
  const parityRowsFig = (() => {
    const sent = [1, 0, 1, 1, 0, 0, 1, 0];
    const rows = [
      ["A", [5]],
      ["B", [1, 4]],
      ["C", [0, 2, 7]],
      ["D", [3, 4, 5, 6]],
    ];
    const cell = (x, y, v, bad, par) =>
      RC(x, y, 30, 28, {
        r: 6,
        f: bad ? RED : par ? BLU : "var(--panel)",
        fo: bad ? 0.3 : par ? 0.14 : 1,
        k: bad ? RED : par ? BLU : "var(--line-2)",
      }) + TX(x + 15, y + 20, v, { m: 1, s: 15 });
    let s = TX(8, 36, "Sent", { a: "start" }) + TX(309, 14, "parity", { s: 11, f: MUTE });
    sent.forEach((v, i) => (s += cell(78 + i * 33, 22, v, false, i === 7)));
    rows.forEach(([id, flips], r) => {
      const y = 70 + r * 44;
      let cells = "";
      sent.forEach((v, i) => {
        const bad = flips.includes(i);
        cells += cell(78 + i * 33, y, bad ? 1 - v : v, bad, false);
      });
      s += PK(id, hit(2, y - 6, 356, 40) + TX(10, y + 20, "Copy " + id, { a: "start", s: 12 }) + cells);
    });
    return SVG(360, 246, s, "Four received copies of an eight-bit parity frame, flipped bits in red");
  })();

  // 2. grouped bars: share of damaged frames that slip through, by number of flips
  const slipBarsFig = (() => {
    const par = [0, 100, 0, 100],
      crc = [0, 0, 20, 20];
    let s =
      RC(8, 6, 14, 14, { r: 3, f: AMB, fo: 0.55, k: AMB, w: 1.5 }) +
      TX(28, 18, "Parity, 8-bit frame", { a: "start", s: 12 }) +
      RC(8, 26, 14, 14, { r: 3, f: BLU, fo: 0.55, k: BLU, w: 1.5 }) +
      TX(28, 38, "CRC 1101, 7-bit frame", { a: "start", s: 12 });
    s += LN(20, 196, 350, 196) + TX(300, 22, "% that slip through", { s: 11, f: MUTE });
    const bar = (id, x, v, col) => {
      const h = Math.max(v * 1.2, 2.5);
      return PK(
        id,
        hit(x - 1, 50, 30, 148) +
          RC(x, 196 - h, 28, h, { r: 3, f: col, fo: 0.6, k: col, w: 2 }) +
          TX(x + 14, 196 - h - 6, v + "%", { s: 12 }),
      );
    };
    for (let g = 0; g < 4; g++) {
      const cx = 62 + g * 86;
      s +=
        bar("p" + (g + 1), cx - 32, par[g], AMB) +
        bar("c" + (g + 1), cx + 4, crc[g], BLU) +
        TX(cx, 216, g + 1 + (g ? " flips" : " flip"), { s: 12 });
    }
    return SVG(
      360,
      226,
      s,
      "Grouped bars: percentage of damaged frames that slip through, for parity and for a CRC, at one to four flipped bits",
    );
  })();

  // 3. sphere-packing: 16 clouds of 8 words
  const cloudsFig = (() => {
    let s = "";
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        const x = 10 + c * 85,
          y = 8 + r * 68,
          cx = x + 42,
          cy = y + 36,
          sent = r === 1 && c === 2;
        s += RC(x, y, 80, 62, {
          r: 12,
          f: sent ? GRN : "var(--panel)",
          fo: sent ? 0.14 : 1,
          k: sent ? GRN : "var(--line-2)",
          w: sent ? 3 : 2,
        });
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
          s += CI(cx + 22 * Math.cos(a), cy + 20 * Math.sin(a), 3.4, { f: MUTE, fo: 0.5, k: "transparent", w: 0 });
        }
        s += CI(cx, cy, 6.5, { f: BLU, k: BLU, w: 1.5 });
        if (sent) s += TX(x + 6, y + 13, "sent", { a: "start", s: 11, f: GRN });
      }
    s += TX(180, 294, "16 clouds × 8 words = 128 words: every possible 7-bit word", { s: 12, f: MUTE });
    return SVG(
      360,
      304,
      s,
      "Sixteen clouds, each a codeword with its seven one-flip neighbours, covering all 128 seven-bit words",
    );
  })();

  // 6. damaged frames by number of flips (counts out of 100,000)
  const damagedFig = (() => {
    const rows = [
      ["1 flip", 7457, "odd"],
      ["2 flips", 264, "even"],
      ["3 flips", 5, "odd"],
    ];
    let s = TX(180, 18, "Damaged frames out of 100,000 sent", { s: 13 });
    rows.forEach(([n, v, par], i) => {
      const y = 38 + i * 46,
        w = Math.max((v / 7457) * 215, 2.5);
      s +=
        TX(10, y + 22, n, { a: "start", s: 13 }) +
        RC(76, y, w, 32, { r: 4, f: BLU, fo: 0.45, k: BLU, w: 2 }) +
        TX(76 + w + 8, y + 22, v.toLocaleString("en-GB"), { a: "start", s: 14 });
    });
    s += TX(180, 188, "8-bit frames, every bit flips with chance 1%", { s: 12, f: MUTE });
    return SVG(
      360,
      200,
      s,
      "Bar chart of damaged frames by number of flipped bits: 7,457 with one flip, 264 with two, 5 with three",
    );
  })();

  B.add("a6-wire", [
    {
      type: "pick",
      q: "An 8-bit frame is sent with even parity (the last bit is the parity bit). Four received copies are shown, with the flipped bits in red. Tap every copy the receiver would accept as clean even though it is damaged.",
      fig: parityRowsFig,
      a: ["B", "D"],
      hint: "Parity only checks whether the count of 1s is odd or even. What does an even number of flips do to that count?",
      why: "Each flip changes the count of 1s by one. One flip (A) or three flips (C) leave the count odd, so the receiver notices. Two flips (B) and four flips (D) change the count by an even amount, so it looks fine and the damaged frame is accepted. Whether the flips sit side by side or far apart makes no difference.",
    },
    {
      type: "pick",
      q: "Noise on a link usually flips exactly two bits of a frame. The bars show how many damaged frames slip through undetected for each scheme. Tap the bar that shows how often the CRC lets a two-flip frame through.",
      fig: slipBarsFig,
      a: "c2",
      hint: "Blue is the CRC. Read its bar for 2 flips, even if it is hard to see.",
      why: "All 21 ways to flip two of the seven bits leave a non-zero remainder after dividing by 1101, so the CRC bar at two flips is 0%. Parity is the opposite: two flips always keep the count of 1s even, so every two-flip frame is accepted (100%). The CRC first leaks at three flips, where 7 of the 35 patterns happen to be multiples of 1101.",
    },
    {
      type: "mcq",
      q: "Hamming(7,4) has 16 valid codewords. In the picture, each cloud is one codeword (big dot) plus the seven words one flip away from it (small dots). The sent codeword is outlined in green. Two bits flip on the wire. Where does the damaged word land, and what does the receiver do?",
      fig: cloudsFig,
      o: [
        'In a different codeword\'s cloud, so it is quietly "fixed" to the wrong word',
        "Outside every cloud, so the receiver can tell it is beyond repair",
        "Still inside the sent word's cloud, so the usual fix recovers the data",
        "On a border between two clouds, so the receiver reports a tie it cannot break",
      ],
      a: 0,
      why: 'The 16 clouds use up all 128 words (16 × 8), so no word is left outside. Two flips move the word two steps from the codeword it started as, which puts it in a different codeword\'s cloud, because codewords are at least three flips apart. The receiver "repairs" it to that wrong codeword and never knows. Hamming(7,4) cannot say "too damaged": every word looks fixable.',
    },
    {
      type: "match",
      q: "Match each thing you do in the noisy-wire workshop to what the receiver reports.",
      pairs: [
        ["Flip one bit on the Parity tab", "Count goes odd: caught, but not located"],
        ["Flip two bits on the Parity tab", "Count stays even: accepted, damage unseen"],
        ["Flip three neighbouring bits on the CRC tab (generator 1101)", "Remainder is not 000: rejected"],
        ["Flip two bits on the Hamming tab, then press Auto-correct", "A third, innocent bit gets flipped"],
      ],
      why: "One flip makes the count of 1s odd, but parity cannot say which bit. Two flips cancel and parity says all clear. A degree-3 generator catches every burst up to 3 bits wide, so three in a row never leaves remainder 000. With two flips the Hamming syndrome is the XOR of the two positions, which names a third bit that was fine, so auto-correct damages it.",
    },
    {
      type: "bug",
      q: "This receiver should accept a frame only when its count of 1s is even (even parity). In the workshop it never notices a single flipped bit. Click the faulty line.",
      code: [
        "def looks_clean(frame):",
        "    ones = 0",
        "    for bit in frame:",
        "        ones += 1",
        "    return ones % 2 == 0",
      ],
      a: 3,
      why: "ones += 1 counts every bit, 0s as well as 1s, so it just measures the length of the frame (always 8) and the verdict never changes. It should add the bit itself: ones += bit. Then a flip changes the total by one and the answer flips with it.",
    },
    {
      type: "slider",
      q: "Each of the 8 bits of a frame flips with a 1% chance. Out of 100,000 frames sent, the chart counts the damaged ones by how many bits flipped. Even parity accepts a damaged frame whenever an even number of bits flipped. About what percentage of the damaged frames does it accept?",
      fig: damagedFig,
      min: 0,
      max: 20,
      step: 1,
      ans: 3,
      tol: 2,
      unit: "%",
      hint: "Only the 2-flip bar slips past. 7,457 is about 28 times 264, so the share is roughly 1 in 30.",
      why: "The 264 frames with two flips are accepted, out of 7,726 damaged ones in total: about 3.4%. On a quiet link a single flip is by far the commonest damage, and parity catches those every time. Parity's blind spot grows as the noise gets heavier, because multi-flip damage becomes more likely.",
    },
  ]);

  /* ======================================================================
     a7-build  (workshop: build the tree)
     ====================================================================== */
  // 1. queue chips, smallest first
  const queueFig = (() => {
    const chips = [
      ["Fog+Hail", 4, true],
      ["Wind", 5],
      ["Rain", 8],
      ["Cloud", 11],
      ["Sun", 18],
    ];
    let s = TX(8, 18, "The queue, smallest first", { a: "start", s: 12, f: MUTE });
    chips.forEach(([n, v, nw], i) => {
      const x = 8 + i * 70;
      s +=
        RC(x, 30, 62, 58, {
          r: 12,
          f: nw ? AMB : "var(--panel)",
          fo: nw ? 0.18 : 1,
          k: nw ? AMB : "var(--line-2)",
          d: nw ? "5 4" : "",
        }) +
        TX(x + 31, 52, n, { s: n.length > 6 ? 11 : 12 }) +
        TX(x + 31, 77, v, { s: 20 });
    });
    return SVG(360, 100, s, "Queue of nodes: Fog+Hail 4, Wind 5, Rain 8, Cloud 11, Sun 18");
  })();

  // 2. before/after diff table after the mistaken first merge
  const diffFig = (() => {
    const rows = [
      ["S", "Sun", 18, 1, 2],
      ["C", "Cloud", 11, 2, 2],
      ["R", "Rain", 8, 3, 3],
      ["W", "Wind", 5, 4, 4],
      ["F", "Fog", 3, 5, 4],
      ["H", "Hail", 1, 5, 2],
    ];
    let s =
      TX(60, 18, "Symbol", { s: 11, f: MUTE }) +
      TX(140, 18, "Reported", { s: 11, f: MUTE }) +
      TX(208, 18, "Code before", { s: 10, f: MUTE }) +
      TX(300, 18, "Code after", { s: 10, f: MUTE });
    rows.forEach(([id, n, f, b, a], i) => {
      const y = 28 + i * 34,
        col = a > b ? RED : a < b ? GRN : "var(--line-2)";
      s += PK(
        id,
        hit(2, y - 2, 356, 32) +
          TX(14, y + 20, id, { a: "start", s: 15 }) +
          TX(40, y + 20, n, { a: "start", s: 13, f: MUTE }) +
          TX(140, y + 20, "× " + f, { s: 14 }) +
          RC(188, y, 40, 28, { r: 8 }) +
          TX(208, y + 20, b, { s: 15 }) +
          TX(246, y + 20, "→", { s: 15, f: MUTE }) +
          RC(264, y, 72, 28, { r: 8, f: a === b ? "var(--panel)" : col, fo: a === b ? 1 : 0.22, k: col }) +
          TX(300, y + 20, a + (a > b ? "  longer" : a < b ? "  shorter" : "  same"), { s: 12 }),
      );
    });
    return SVG(
      360,
      236,
      s,
      "Table of code lengths before and after the mistaken first merge: Sun 1 to 2, Cloud 2 to 2, Rain 3 to 3, Wind 4 to 4, Fog 5 to 4, Hail 5 to 2",
    );
  })();

  // 3. the finished Huffman tree
  const treeFig = (() => {
    const L = (id, x, y, col) => ({ id, x, y, col, leaf: 1 });
    const nodes = {
      root: { x: 258, y: 30, w: 46 },
      n28: { x: 200, y: 84, w: 28 },
      n17: { x: 141, y: 138, w: 17 },
      n9: { x: 78, y: 192, w: 9 },
      n4: { x: 120, y: 246, w: 4 },
      S: L("S", 316, 84, GRN),
      C: L("C", 260, 138, BLU),
      R: L("R", 204, 192, VIO),
      W: L("W", 36, 246, AMB),
      F: L("F", 92, 300, RED),
      H: L("H", 148, 300, MUTE),
    };
    const edges = [
      ["root", "n28", 0],
      ["root", "S", 1],
      ["n28", "n17", 0],
      ["n28", "C", 1],
      ["n17", "n9", 0],
      ["n17", "R", 1],
      ["n9", "W", 0],
      ["n9", "n4", 1],
      ["n4", "F", 0],
      ["n4", "H", 1],
    ];
    let s = "";
    edges.forEach(([a, b, bit]) => {
      const A = nodes[a],
        Bn = nodes[b],
        mx = (A.x + Bn.x) / 2,
        my = (A.y + Bn.y) / 2;
      s +=
        LN(A.x, A.y, Bn.x, Bn.y, { w: 2.5 }) +
        CI(mx, my, 9, { f: "var(--panel)", k: "var(--line-2)", w: 1.5 }) +
        TX(mx, my + 4, bit, { s: 12, m: 1 });
    });
    ["root", "n28", "n17", "n9", "n4"].forEach((k) => {
      const n = nodes[k];
      s += CI(n.x, n.y, 15, { f: "var(--panel)", k: "var(--line-2)" }) + TX(n.x, n.y + 5, n.w, { s: 13 });
    });
    ["S", "C", "R", "W", "F", "H"].forEach((k) => {
      const n = nodes[k];
      s += PK(
        k,
        RC(n.x - 20, n.y - 16, 40, 32, { r: 10, f: n.col, fo: 0.25, k: n.col }) + TX(n.x, n.y + 6, k, { s: 16 }),
      );
    });
    return SVG(
      360,
      330,
      s,
      "Finished Huffman tree for Sun, Cloud, Rain, Wind, Fog and Hail with 0 and 1 on each branch",
    );
  })();

  // 4. area chart: width = count, height = code length
  const areaFig = (() => {
    const d = [
      ["S", 18, 1, GRN],
      ["C", 11, 2, BLU],
      ["R", 8, 3, VIO],
      ["W", 5, 4, AMB],
      ["F", 3, 5, RED],
      ["H", 1, 5, MUTE],
    ];
    let s = "",
      x = 40;
    for (let b = 1; b <= 5; b++)
      s +=
        LN(40, 190 - b * 30, 342, 190 - b * 30, { k: "var(--line-soft, var(--line))", w: 1 }) +
        TX(32, 194 - b * 30, b, { a: "end", s: 11, f: MUTE });
    s += TX(10, 14, "code length (bits)", { a: "start", s: 11, f: MUTE });
    d.forEach(([k, n, len, col]) => {
      const w = n * 6.5;
      s +=
        PK(k, RC(x, 190 - len * 30, w, len * 30, { r: 2, f: col, fo: 0.3, k: col, w: 2 })) +
        TX(x + w / 2, 207, n, { s: 12 }) +
        TX(x + w / 2, 223, k, { s: 13, f: col });
      x += w;
    });
    s += TX(6, 207, "count", { a: "start", s: 10, f: MUTE }) + TX(6, 223, "symbol", { a: "start", s: 10, f: MUTE });
    s += TX(180, 246, "S Sun · C Cloud · R Rain · W Wind · F Fog · H Hail", { s: 11, f: MUTE });
    return SVG(
      360,
      254,
      s,
      "Rectangles for each symbol: width is how often it was reported, height is its code length",
    );
  })();

  B.add("a7-build", [
    {
      type: "mcq",
      q: "The workshop shows the queue smallest first. The two smallest nodes merge next. After that merge, which two nodes are at the front of the queue?",
      fig: queueFig,
      o: [
        "Rain (8), then the new node (9)",
        "Rain (8), then Cloud (11)",
        "The new node (9), then Cloud (11)",
        "Wind (5), then Rain (8)",
      ],
      a: 0,
      why: "Fog+Hail (4) and Wind (5) merge into a node of weight 9. The queue stays sorted by weight, so the 9 slots in between Rain (8) and Cloud (11): the queue is now 8, 9, 11, 18. A merged node is not special, it just competes on its total.",
    },
    {
      type: "pick",
      q: "A learner merges Hail (1) with Sun (18) first, then carries on smallest-first. The table shows each code length before and after that mistake. A symbol's extra bits are its count times the change in its code length. Tap the symbol that adds the most bits to the day's total.",
      fig: diffFig,
      a: "S",
      hint: "Multiply each count by how much its code grew. Codes that got shorter are savings.",
      why: "Sun is reported 18 times and its code grows from 1 bit to 2, adding 18 bits. Fog and Hail get shorter (saving 3 and 3 bits), and Cloud, Rain and Wind do not change. Net: 18 − 3 − 3 = 12 extra bits, so 116 bits instead of 104. Hail's code changed the most, but it is so rare that it hardly matters.",
    },
    {
      type: "pick",
      q: "The reports arrive as one unbroken bit stream, 0 0 1 0 0 0 0 0 1, and the receiver walks the finished tree from the root, starting again at the root after each leaf. Tap the leaf where the SECOND report ends.",
      fig: treeFig,
      a: "W",
      hint: "Follow the first bits until you hit a leaf, restart, and do it again.",
      why: "0 0 1 goes root, 0, 0, 1 and lands on Rain: the first report. Restarting at the root, 0 0 0 0 reaches Wind: the second report. The last 0 1 is Cloud. Every codeword ends at a leaf, so the receiver never needs a separator between reports.",
    },
    {
      type: "pick",
      q: "Each rectangle is one symbol of the finished tree: its width is how many times it was reported and its height is the length of its code in bits. Its area is therefore the total bits that symbol costs over the day. Tap the symbol that spends the most bits in total.",
      fig: areaFig,
      a: "R",
      hint: "Compare 18×1, 11×2, 8×3, 5×4, 3×5 and 1×5.",
      why: "The areas are Sun 18, Cloud 22, Rain 24, Wind 20, Fog 15 and Hail 5, adding up to 104. Rain wins even though it is neither the commonest nor the rarest report. Huffman gives common symbols short codes and rare ones long codes, so the areas end up fairly level.",
    },
    {
      type: "bug",
      q: "This function should add up the bits Huffman's merging costs for a list of counts. Every merge should cost the combined count of the two nodes. It gives totals that are too small. Click the faulty line.",
      code: [
        "def total_bits(counts):",
        "    q = sorted(counts)",
        "    bits = 0",
        "    while len(q) > 1:",
        "        a = q.pop(0)",
        "        b = q.pop(0)",
        "        bits += a",
        "        q.append(a + b)",
        "        q.sort()",
        "    return bits",
      ],
      a: 6,
      why: "Merging a and b pushes every report beneath either node one bit deeper, which costs a + b bits, not just a. With bits += a + b the counts [1, 3, 5, 8, 11, 18] give the workshop's 104.",
    },
    {
      type: "match",
      q: "Match each part of the workshop's tree to what it tells you.",
      pairs: [
        ["A leaf's count", "How often that symbol was reported"],
        ["A leaf's depth", "The length of its codeword in bits"],
        ["A merged node's count", "The bits that merge adds to the total"],
        ["The root's count", "Every report of the day (46)"],
      ],
      why: "Counts of leaves are the data. How far down a leaf sits is how many 0 or 1 choices spell its code. A merged node's count is how many reports sit beneath it, and each of them pays one more bit for that merge. The root holds all of them, so its count is the whole day's 46 reports.",
    },
  ]);

  /* ======================================================================
     a6-crc
     ====================================================================== */
  // burst bands on a 12-bit frame
  const burstFig = (() => {
    const rows = [
      ["A", [4, 5]],
      ["B", [7, 9, 10]],
      ["C", [2, 3, 5, 6]],
      ["D", [5, 6, 8, 10]],
    ];
    let s = TX(8, 16, "Generator 10011 (degree 4), 12-bit frame, flipped bits in red", { a: "start", s: 12, f: MUTE });
    rows.forEach(([id, flips], r) => {
      const y = 30 + r * 56,
        first = Math.min(...flips),
        last = Math.max(...flips);
      let cells = "";
      for (let i = 1; i <= 12; i++)
        cells += RC(44 + (i - 1) * 26, y, 24, 26, {
          r: 5,
          f: flips.includes(i) ? RED : "var(--panel)",
          fo: flips.includes(i) ? 0.45 : 1,
          k: flips.includes(i) ? RED : "var(--line-2)",
        });
      const x1 = 44 + (first - 1) * 26,
        x2 = 44 + (last - 1) * 26 + 24;
      s += PK(
        id,
        hit(2, y - 6, 356, 52) +
          TX(10, y + 19, id, { a: "start", s: 14 }) +
          cells +
          LN(x1, y + 33, x2, y + 33, { k: BLU, w: 3 }) +
          LN(x1, y + 28, x1, y + 38, { k: BLU, w: 3 }) +
          LN(x2, y + 28, x2, y + 38, { k: BLU, w: 3 }),
      );
    });
    return SVG(360, 256, s, "Four damaged copies of a 12-bit frame with the damaged stretch bracketed");
  })();

  // log-scale: chance a junk frame passes vs check bits
  const junkFig = (() => {
    const X = (r) => 50 + (r - 1) * 38,
      Y = (p) => 30 + Math.log2(50 / p) * 24;
    let s = "";
    for (let k = 0; k < 8; k++) {
      const p = 50 / 2 ** k,
        y = Y(p);
      s +=
        LN(44, y, 330, y, { k: "var(--line-soft, var(--line))", w: 1 }) +
        TX(38, y + 4, +p.toFixed(1) + "%", { a: "end", s: 10, f: MUTE });
    }
    s +=
      LN(44, Y(2), 336, Y(2), { k: RED, w: 2.5, d: "7 5" }) +
      TX(336, Y(2) - 6, "limit: 2 in 100", { a: "end", s: 11, f: RED });
    let path = "";
    for (let r = 1; r <= 8; r++) path += (r === 1 ? "M" : "L") + X(r) + " " + Y(50 / 2 ** (r - 1)) + " ";
    s += `<path d="${path}" fill="none" stroke="${BLU}" stroke-width="3"/>`;
    for (let r = 1; r <= 8; r++)
      s +=
        PK(
          "r" + r,
          CI(X(r), Y(50 / 2 ** (r - 1)), 15, { f: "transparent", k: "transparent", w: 1 }) +
            CI(X(r), Y(50 / 2 ** (r - 1)), 6, { f: BLU, k: BLU, w: 1.5 }),
        ) + TX(X(r), 236, r, { s: 12 });
    s +=
      TX(190, 254, "check bits r (the remainder length)", { s: 11, f: MUTE }) +
      TX(10, 16, "chance junk is accepted (each line halves it)", { a: "start", s: 11, f: MUTE });
    return SVG(
      360,
      262,
      s,
      "Chart on a halving scale: chance that junk is accepted for a CRC with 1 to 8 check bits, with a limit line at 2 in 100",
    );
  })();

  // heatmap of pairs of flips on an 11-bit frame
  const pairsFig = (() => {
    let s = TX(180, 16, "Two flipped bits at positions i and j of an 11-bit frame", { s: 12, f: MUTE });
    for (let j = 2; j <= 11; j++) s += TX(60 + (j - 2) * 28 + 13, 38, j, { s: 11, f: MUTE });
    for (let i = 1; i <= 10; i++) {
      s += TX(40, 60 + (i - 1) * 28 + 18, i, { a: "end", s: 11, f: MUTE });
      for (let j = i + 1; j <= 11; j++) {
        const bad = j - i === 7;
        s += RC(60 + (j - 2) * 28, 60 + (i - 1) * 28, 26, 26, {
          r: 5,
          f: bad ? RED : "var(--panel-2, var(--panel))",
          fo: bad ? 0.55 : 1,
          k: bad ? RED : "var(--line-2)",
          w: bad ? 2 : 1.5,
        });
      }
    }
    s +=
      RC(60, 344, 14, 14, { r: 3, f: RED, fo: 0.55, k: RED, w: 1.5 }) +
      TX(80, 356, "slips past the CRC (generator 1101)", { a: "start", s: 12 });
    s += TX(10, 50, "i", { a: "start", s: 12, f: MUTE }) + TX(344, 38, "j", { s: 12, f: MUTE });
    return SVG(360, 368, s, "Grid of all pairs of flipped positions in an 11-bit frame; four cells are red");
  })();

  // overhead of a 32-bit CRC on small and large frames
  const overheadFig = (() => {
    const bar = (y, label, payload, pw) =>
      TX(8, y - 8, label, { a: "start", s: 13 }) +
      RC(8, y, 344, 30, { r: 5, f: BLU, fo: 0.25, k: BLU, w: 2 }) +
      RC(8 + 344 - pw, y, pw, 30, { r: 3, f: AMB, fo: 0.8, k: AMB, w: 2 });
    let s =
      bar(34, "Frame A: 64 bytes", 512, (344 * 32) / 544) +
      TX(8, 82, "payload 512 bits + CRC 32 bits", { a: "start", s: 12, f: MUTE });
    s +=
      bar(124, "Frame B: 1,500 bytes", 12000, Math.max((344 * 32) / 12032, 1.6)) +
      TX(8, 172, "payload 12,000 bits + CRC 32 bits", { a: "start", s: 12, f: MUTE });
    s +=
      RC(8, 190, 14, 14, { r: 3, f: BLU, fo: 0.25, k: BLU, w: 1.5 }) +
      TX(28, 202, "payload", { a: "start", s: 12 }) +
      RC(100, 190, 14, 14, { r: 3, f: AMB, fo: 0.8, k: AMB, w: 1.5 }) +
      TX(120, 202, "32-bit CRC", { a: "start", s: 12 });
    return SVG(
      360,
      214,
      s,
      "Two frames drawn to the same length: the CRC takes a visible slice of the 64-byte frame and a hair-thin slice of the 1,500-byte frame",
    );
  })();

  B.add("a6-crc", [
    {
      type: "pick",
      q: "A CRC with generator 10011 (degree 4) promises to catch any burst whose first and last flipped bits are at most 4 places apart, whatever sits in between. Four damaged copies of a 12-bit frame are shown, with a bracket under each damaged stretch. Tap every copy whose damage the CRC is guaranteed to catch from its span alone.",
      fig: burstFig,
      a: ["A", "B"],
      hint: "Count from the first red cell to the last red cell, gaps included.",
      why: "A spans 2 places and B spans 4 (a gap inside a burst is allowed), so both fit inside the degree-4 promise. C spans 5 and D spans 6: some patterns of that length are multiples of the generator and slip through (a 5-place burst that spells 10011 itself is one). The promise is about the span, not the number of flips: B has only three flips yet is covered, while D has four flips and is not.",
    },
    {
      type: "pick",
      q: "Junk arrives instead of a real frame, so every remainder is equally likely. The chart shows the chance that junk is wrongly accepted by a CRC with r check bits. Each gridline is half the one above. A link must let fewer than 2 junk frames in 100 through (the dashed line). Tap the smallest r that is good enough.",
      fig: junkFig,
      a: "r6",
      hint: "Each extra check bit halves the chance: 50, 25, 12.5, 6, 3, 1.6 ... in percent.",
      why: "Junk passes only if its remainder is all zeros: 1 chance in 2^r. Each extra check bit halves the chance, so the points fall on a straight line on this halving scale. With r = 5 the chance is about 3 in 100, still above the limit. r = 6 gives about 1.6 in 100, the first point below it. Real CRCs use 16 or 32 bits.",
    },
    {
      type: "mcq",
      q: "Generator 1101 caught every pair of flips on a 7-bit frame. On this longer 11-bit frame, four pairs of flips (red) slip past it. What do the red cells have in common, and why does it matter?",
      fig: pairsFig,
      o: [
        "Each pair is 7 places apart, so a longer frame lets two flips line up like a multiple of the generator",
        "Each pair includes a remainder bit, so damage to the check bits cannot be seen by the receiver",
        "Each pair touches an end of the frame, where the long division has no 1 to cancel against",
        "Each pair is a pair of neighbours, because a CRC is weakest against bits that sit side by side",
      ],
      a: 0,
      why: "The red cells all sit on one diagonal: j − i = 7. Two flips 7 places apart look like 10000001, and that divides evenly by 1101, so the remainder is 000 and nothing is noticed. In a 7-bit frame no two positions are 7 apart, so the guarantee held. A generator's guarantees depend on the frame length as well as on its degree.",
      hint: "Look at the distance between i and j for each red cell.",
    },
    {
      type: "slider",
      q: "A 32-bit CRC is added to a short 64-byte frame and to a long 1,500-byte frame (bars drawn to the same length). About how many times larger is the CRC's share of the short frame than of the long one?",
      fig: overheadFig,
      min: 1,
      max: 50,
      step: 1,
      ans: 22,
      tol: 6,
      unit: "×",
      hint: "The CRC is the same 32 bits in both. The payloads differ by 1,500 ÷ 64, which is a bit over 20.",
      why: "The CRC takes 32 of 544 bits (about 5.9%) in the short frame and 32 of 12,032 bits (about 0.27%) in the long one. 5.9 ÷ 0.27 is about 22, roughly how much longer the long payload is. A fixed-size check is almost free on big frames but costs noticeably on tiny ones.",
    },
  ]);

  /* ======================================================================
     a6-hamming
     ====================================================================== */
  // position table with binary labels and parity/data roles
  const posTableFig = (() => {
    let s = TX(8, 22, "position", { a: "start", s: 11, f: MUTE }) + TX(8, 52, "role", { a: "start", s: 11, f: MUTE });
    [
      ["p4", 4],
      ["p2", 2],
      ["p1", 1],
    ].forEach(([n, b], r) => (s += TX(8, 92 + r * 32, n, { a: "start", s: 13, f: MUTE })));
    for (let p = 1; p <= 7; p++) {
      const x = 56 + (p - 1) * 43,
        par = [1, 2, 4].includes(p);
      s +=
        RC(x, 6, 38, 196, { r: 8, f: par ? BLU : "var(--panel)", fo: par ? 0.15 : 1, k: par ? BLU : "var(--line-2)" }) +
        TX(x + 19, 28, p, { s: 17 }) +
        TX(x + 19, 54, par ? "parity" : "data", { s: 10, f: par ? BLU : MUTE });
      [4, 2, 1].forEach(
        (b, r) => (s += TX(x + 19, 98 + r * 32, p & b ? "1" : "0", { s: 17, m: 1, f: p & b ? "var(--text)" : MUTE })),
      );
    }
    return SVG(360, 212, s, "Hamming(7,4) positions 1 to 7 written in binary, with parity positions 1, 2 and 4 shaded");
  })();

  // block length vs code rate and fixable share
  const blockFig = (() => {
    const ns = [7, 15, 31, 63, 127],
      rate = [57, 73, 84, 90, 94],
      ok = [99.8, 99.0, 96.2, 86.9, 63.7];
    const X = (i) => 60 + i * 62,
      Y = (v) => 222 - v * 1.7;
    let s = "";
    [0, 25, 50, 75, 100].forEach(
      (v) =>
        (s +=
          LN(46, Y(v), 340, Y(v), { k: "var(--line-soft, var(--line))", w: 1 }) +
          TX(40, Y(v) + 4, v + "%", { a: "end", s: 10, f: MUTE })),
    );
    const path = (a, col) =>
      `<path d="${a.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ")}" fill="none" stroke="${col}" stroke-width="3"/>` +
      a.map((v, i) => CI(X(i), Y(v), 4.5, { f: col, k: col, w: 1 })).join("");
    s += path(rate, BLU) + path(ok, RED);
    ns.forEach((n, i) => (s += TX(X(i), 242, n, { s: 12 })));
    s += TX(200, 260, "block length (bits)", { s: 11, f: MUTE });
    s +=
      RC(48, 4, 12, 12, { r: 3, f: BLU, k: BLU, w: 1 }) +
      TX(66, 15, "code rate (share of bits that are data)", { a: "start", s: 11 }) +
      RC(48, 22, 12, 12, { r: 3, f: RED, k: RED, w: 1 }) +
      TX(66, 33, "blocks with one flip or none", { a: "start", s: 11 });
    return SVG(
      360,
      268,
      s,
      "Two lines against block length 7, 15, 31, 63, 127: code rate rises from 57 to 94 per cent, blocks with at most one flip fall from 99.8 to 63.7 per cent",
    );
  })();

  // pipeline with four flip spots
  const pipeFig = (() => {
    const box = (x, w, t) => RC(x, 24, w, 38, { r: 10 }) + TX(x + w / 2, 48, t, { s: 11 });
    let s = box(4, 50, "Data") + box(82, 56, "Encoder") + box(218, 56, "Decoder") + box(302, 54, "Output");
    s += LN(54, 43, 82, 43, { w: 2.5 }) + LN(138, 43, 218, 43, { w: 2.5, d: "6 4" }) + LN(274, 43, 302, 43, { w: 2.5 });
    s += TX(178, 82, "wire", { s: 11, f: MUTE });
    [
      ["A", 68],
      ["B", 160],
      ["C", 196],
      ["D", 288],
    ].forEach(([k, x]) => (s += PK(k, CI(x, 43, 11, { f: AMB, fo: 0.3, k: AMB, w: 2.5 }) + TX(x, 48, k, { s: 13 }))));
    [
      ["A", "Data bit flips in memory, before encoding"],
      ["B", "One data bit flips on the wire"],
      ["C", "One check bit flips on the wire"],
      ["D", "One bit flips in the output, after decoding"],
    ].forEach(
      ([k, t], i) => (s += TX(10, 112 + i * 24, `<tspan fill="${AMB}">${k}</tspan>  ${t}`, { a: "start", s: 12 })),
    );
    return SVG(
      360,
      206,
      s,
      "Pipeline from data through an encoder, a noisy wire and a decoder to the output, with four marked places where a bit can flip",
    );
  })();

  B.add("a6-hamming", [
    {
      type: "cat",
      q: "A Hamming(7,4) receiver shows its three checks as lamps, p4 p2 p1 (✗ = that check fails). Use the position table to decide what the single-error fix does in each case: leave the four data bits alone, or flip one of them back?",
      fig: posTableFig,
      buckets: ["Data bits already fine", "A data bit is flipped back"],
      items: [
        ["p4 ✗  p2 ✓  p1 ✓", 0],
        ["p4 ✓  p2 ✗  p1 ✗", 1],
        ["p4 ✓  p2 ✓  p1 ✗", 0],
        ["p4 ✗  p2 ✗  p1 ✗", 1],
        ["p4 ✓  p2 ✓  p1 ✓", 0],
        ["p4 ✗  p2 ✓  p1 ✗", 1],
      ],
      why: "Read the lamps as a binary number (p4 first) and find that column. 100 is position 4, 001 is position 1 and 000 is no flip at all: parity bits (or nothing), so the data was never touched. 011, 111 and 101 name positions 3, 7 and 5, which hold data bits, so the fix flips a data bit back.",
    },
    {
      type: "slider",
      q: "A Hamming code can only repair a block with at most one flipped bit. The chart compares block lengths when every bit flips with a 1% chance. About what percentage of 127-bit blocks arrive with two or more flipped bits?",
      fig: blockFig,
      min: 0,
      max: 100,
      step: 1,
      ans: 36,
      tol: 6,
      unit: "%",
      hint: "Find the red line at 127. That is the share with one flip or none. What is left?",
      why: 'At 127 bits the red line is at about 64%, so roughly 36% of blocks carry two or more flips and cannot be repaired (they may even be "repaired" wrongly). Longer blocks waste fewer bits on checks (the blue line rises) but collect more errors (the red line falls), so the best block size depends on how noisy the link is.',
    },
    {
      type: "pick",
      q: "Hamming(7,4) protects the bits between the encoder and the decoder. One bit flips at each marked spot (A to D, one spot at a time). Tap every spot where the receiver ends up with the correct data.",
      fig: pipeFig,
      a: ["B", "C"],
      hint: "Where does the code get a chance to look at the bits?",
      why: "Anything that damages the codeword on the wire, whether a data bit or a check bit, shows up in the syndrome and is repaired. A happens before the encoder: the checks are built around the wrong data, so everything passes. D happens after decoding, when no check is looking any more. The code only guards the stretch between encoder and decoder.",
    },
    {
      type: "multi",
      q: "Which of these statements about Hamming(7,4) are true? Select all that apply.",
      o: [
        "A flipped check bit still gives a non-zero syndrome",
        "Syndrome 000 proves that no bit was flipped",
        "The three checks give 8 outcomes: no error, or one of 7 positions",
        "Adding a fourth check bit lets it repair any two flips",
      ],
      a: [0, 2],
      why: 'A flipped check bit makes its own check fail (and no other), so the syndrome names that position. Three yes/no checks give 2³ = 8 outcomes: exactly "nothing wrong" plus the 7 positions. Syndrome 000 does not prove the word is clean, because three flips at positions like 1, 2 and 3 cancel out (001, 010 and 011 add up to 000). One extra check bit adds detection of two flips (SECDED), not repair.',
    },
  ]);

  /* ======================================================================
     a7-entropy
     ====================================================================== */
  // entropy curve of a coin with chips on the axis
  const coinFig = (() => {
    const X = (p) => 40 + p * 280,
      Y = (h) => 200 - h * 150,
      H = (p) => ent([p, 1 - p]);
    let d = "";
    for (let i = 1; i <= 99; i++) {
      const p = i / 100;
      d += (i === 1 ? "M" : "L") + X(p).toFixed(1) + " " + Y(H(p)).toFixed(1) + " ";
    }
    let s =
      LN(40, 200, 330, 200, { w: 2 }) +
      LN(40, 40, 40, 200, { w: 2 }) +
      TX(34, 54, "1", { a: "end", s: 11, f: MUTE }) +
      TX(34, 204, "0", { a: "end", s: 11, f: MUTE }) +
      TX(10, 22, "entropy (bits per flip)", { a: "start", s: 11, f: MUTE });
    s += `<path d="${d}" fill="none" stroke="${BLU}" stroke-width="3.5"/>`;
    [
      ["A", 0.05],
      ["B", 0.2],
      ["C", 0.4],
      ["D", 0.7],
      ["E", 0.95],
    ].forEach(
      ([k, p]) =>
        (s += PK(
          k,
          RC(X(p) - 19, 208, 38, 40, { r: 10, f: AMB, fo: 0.18, k: AMB }) +
            TX(X(p), 224, k, { s: 14 }) +
            TX(X(p), 240, Math.round(p * 100) + "%", { s: 11, f: MUTE }),
        )),
    );
    s += TX(180, 262, "chance of heads", { s: 11, f: MUTE });
    return SVG(
      360,
      270,
      s,
      "Entropy curve of a coin against its chance of heads, rising to 1 bit at 50 per cent, with five coins marked on the axis",
    );
  })();

  // dial of bits per symbol
  const dialFig = (() => {
    const cx = 180,
      cy = 160,
      r = 118,
      pt = (v, rr) => {
        const a = Math.PI - (v / 8) * Math.PI;
        return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)];
      };
    const arc = (v0, v1, col, w) => {
      const [x0, y0] = pt(v0, r),
        [x1, y1] = pt(v1, r);
      return `<path d="M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    };
    let s = arc(0, 8, "var(--line)", 20) + arc(0, 1.5, GRN, 20);
    for (let v = 0; v <= 8; v++) {
      const [x0, y0] = pt(v, r - 16),
        [x1, y1] = pt(v, r - 24);
      s += LN(x0, y0, x1, y1, { w: 2 });
    }
    [0, 2, 4, 6, 8].forEach((v) => {
      const [x, y] = pt(v, r + 18);
      s += TX(x, y + 4, v, { s: 13, f: MUTE });
    });
    const [nx, ny] = pt(1.5, r - 34);
    s += LN(cx, cy, nx, ny, { k: "var(--text)", w: 4 }) + CI(cx, cy, 8, { f: "var(--text)", k: "var(--text)", w: 1 });
    s +=
      TX(cx, cy + 30, "entropy: 1.5 bits per reading", { s: 14 }) +
      TX(cx, 14, "bits per reading", { s: 11, f: MUTE }) +
      TX(cx, cy + 50, "stored as plain bytes: 8 bits per reading", { s: 12, f: MUTE });
    return SVG(360, 224, s, "Dial from 0 to 8 bits per reading with the needle at 1.5");
  })();

  // four mini bar charts
  const miniDists = (() => {
    const P = [
      ["A", [0.25, 0.5, 0.125, 0.125]],
      ["B", [0.5, 0.25, 0.25, 0]],
      ["C", [0.125, 0.125, 0.25, 0.5]],
      ["D", [0.5, 0.125, 0.25, 0.125]],
    ];
    let s = "";
    P.forEach(([id, ps], k) => {
      const x = 6 + (k % 2) * 178,
        y = 6 + Math.floor(k / 2) * 138;
      let bars = "";
      ps.forEach((p, i) => {
        const h = Math.max(p * 140, 2),
          bx = x + 18 + i * 38;
        bars +=
          RC(bx, y + 112 - h, 28, h, { r: 3, f: BLU, fo: p ? 0.5 : 0.15, k: BLU, w: 2 }) +
          TX(bx + 14, y + 106 - h, +(p * 100).toFixed(1) + "%", { s: 10 });
      });
      s += PK(id, RC(x, y, 170, 126, { r: 12 }) + TX(x + 12, y + 18, id, { a: "start", s: 15 }) + bars);
    });
    return SVG(360, 276, s, "Four small bar charts of probabilities over four symbols");
  })();

  // heatmap: weather today given yesterday
  const weatherFig = (() => {
    const names = ["Sun", "Cloud", "Rain", "Fog"],
      M = [
        [0.7, 0.2, 0.1, 0],
        [0.3, 0.4, 0.2, 0.1],
        [0.25, 0.25, 0.25, 0.25],
        [0, 0.05, 0.05, 0.9],
      ];
    let s = TX(8, 22, "yesterday", { a: "start", s: 11, f: MUTE }) + TX(216, 22, "today", { s: 11, f: MUTE });
    names.forEach((n, j) => (s += TX(84 + j * 66 + 33, 50, n, { s: 12 })));
    M.forEach((row, i) => {
      const y = 60 + i * 46;
      let cells = "";
      row.forEach(
        (p, j) =>
          (cells +=
            RC(84 + j * 66, y, 64, 42, { r: 6, f: BLU, fo: 0.08 + p * 0.55, k: "var(--line-2)", w: 1.5 }) +
            TX(84 + j * 66 + 32, y + 26, Math.round(p * 100) + "%", { s: 14 })),
      );
      s += PK(names[i], hit(2, y - 2, 356, 46) + TX(10, y + 26, names[i], { a: "start", s: 14 }) + cells);
    });
    return SVG(
      360,
      250,
      s,
      "Table of weather today for each weather yesterday: Sun row 70, 20, 10, 0; Cloud row 30, 40, 20, 10; Rain row 25 each; Fog row 0, 5, 5, 90 per cent",
    );
  })();

  B.add("a7-entropy", [
    {
      type: "pick",
      q: "Five coins are marked on the axis by their chance of heads. The curve shows how many bits per flip a coin needs with the best possible code. Tap the two coins that need exactly the same number of bits per flip.",
      fig: coinFig,
      a: ["A", "E"],
      hint: "Look at the shape of the curve. What is special about it either side of 50%?",
      why: "The curve is a mirror image around 50%. A coin that lands heads 95% of the time is exactly as predictable as one that lands tails 95% of the time (heads 5%), so both need about 0.29 bits per flip. B (20%) and D (70%) are not mirror images: they need about 0.72 and 0.88 bits.",
    },
    {
      type: "slider",
      q: "A sensor sends 1,000 readings, each stored as 8 bits (8,000 bits in all). The readings come from a source whose entropy is 1.5 bits per reading, as on the dial. At best, about what percentage of the original 8,000 bits could a perfect compressor get it down to?",
      fig: dialFig,
      min: 0,
      max: 100,
      step: 1,
      ans: 19,
      tol: 4,
      unit: "%",
      hint: "1.5 bits against 8. Two bits would be a quarter of 8, so 1.5 is a little under that.",
      why: "Entropy is the floor for any lossless code: 1,000 × 1.5 = 1,500 bits at the very least, which is 1,500 out of 8,000, about 19%. A real code such as Huffman lands at or just above that, never below. The distance of the needle from 8 on the dial is how much room there is to squeeze.",
    },
    {
      type: "pick",
      q: "Each panel shows the probabilities of a source with four symbols. Three of these sources have exactly the same entropy. Tap the odd one out.",
      fig: miniDists,
      a: "B",
      hint: "Does entropy care which symbol has which probability?",
      why: "Entropy depends only on the set of probabilities, not on which symbol carries which. A, C and D are the same numbers (0.5, 0.25, 0.125, 0.125) in different orders, so each has an entropy of 1.75 bits. B uses a different set (0.5, 0.25, 0.25 and an impossible symbol), with entropy 1.5 bits.",
    },
    {
      type: "pick",
      q: "The table gives the chance of each kind of weather today (columns) for each kind of weather yesterday (rows); every row adds to 100%. A weather station writes one code per day, using the best code for the row it is in. Tap the row where a day costs the fewest bits on average.",
      fig: weatherFig,
      a: "Fog",
      hint: "The cheapest row is the one where tomorrow is easiest to guess, not simply the row with the biggest single number.",
      why: "After Fog comes Fog 90% of the time, so that row is almost certain and its entropy is only about 0.57 bits. Sun's row is next at about 1.16 bits. Cloud (about 1.85) and Rain (exactly 2: four equal chances) are the hardest to guess. What counts is how lopsided the whole row is.",
    },
  ]);

  /* ======================================================================
     a7-huffman
     ====================================================================== */
  // a binary trie where some codewords are not leaves
  const trieFig = (() => {
    const N = {
      r: [180, 34],
      a: [100, 98],
      b: [260, 98],
      "00": [60, 162],
      "01": [140, 162],
      10: [220, 162],
      11: [300, 162],
      110: [268, 226],
      111: [332, 226],
    };
    const E = [
      ["r", "a", 0],
      ["r", "b", 1],
      ["a", "00", 0],
      ["a", "01", 1],
      ["b", "10", 0],
      ["b", "11", 1],
      ["11", "110", 0],
      ["11", "111", 1],
    ];
    const L = { "00": "A", "01": "B", 10: "C", 11: "D", 110: "E", 111: "F" };
    let s = "";
    E.forEach(([p, c, bit]) => {
      const [x1, y1] = N[p],
        [x2, y2] = N[c],
        mx = (x1 + x2) / 2,
        my = (y1 + y2) / 2;
      s +=
        LN(x1, y1, x2, y2, { w: 2.5 }) +
        CI(mx, my, 9, { f: "var(--panel)", k: "var(--line-2)", w: 1.5 }) +
        TX(mx, my + 4, bit, { s: 12, m: 1 });
    });
    ["r", "a", "b"].forEach((k) => (s += CI(N[k][0], N[k][1], 8, { f: "var(--panel)", k: "var(--line-2)" })));
    Object.entries(L).forEach(
      ([k, l]) =>
        (s += PK(l, CI(N[k][0], N[k][1], 16, { f: BLU, fo: 0.25, k: BLU }) + TX(N[k][0], N[k][1] + 5, l, { s: 15 }))),
    );
    s += TX(100, 244, "filled dot = a codeword", { s: 11, f: MUTE });
    return SVG(
      360,
      256,
      s,
      "Binary tree whose filled dots A to F are codewords; D sits at 11 above E at 110 and F at 111",
    );
  })();

  // Huffman cost per flip for blocks of 1..4 flips of a 90/10 coin
  const blockCodeFig = (() => {
    const vals = [1.0, 0.645, 0.533, 0.493],
      Y = (v) => 200 - v * 140;
    let s = LN(24, 200, 352, 200) + LN(30, Y(0.469), 352, Y(0.469), { k: RED, w: 2.5, d: "7 5" });
    s +=
      LN(10, 14, 28, 14, { k: RED, w: 2.5, d: "6 4" }) +
      TX(34, 18, "entropy floor: 0.47", { a: "start", s: 12 }) +
      TX(354, 18, "bits per flip", { a: "end", s: 11, f: MUTE });
    vals.forEach((v, i) => {
      const cx = 70 + i * 86;
      s +=
        RC(cx - 24, Y(v), 48, v * 140, { r: 4, f: BLU, fo: 0.45, k: BLU, w: 2 }) +
        TX(cx, Y(v) - 7, v.toFixed(2), { s: 13 }) +
        TX(cx, 220, i + 1 + (i ? " flips" : " flip"), { s: 12 });
    });
    s += TX(190, 238, "flips coded together as one symbol", { s: 11, f: MUTE });
    return SVG(
      360,
      246,
      s,
      "Bars of Huffman bits per flip for a 90 per cent coin when 1, 2, 3 or 4 flips are grouped: 1.00, 0.65, 0.53, 0.49, above an entropy line at 0.47",
    );
  })();

  // three messages: fixed codes vs Huffman table + payload
  const tableCostFig = (() => {
    const msgs = [
      ["m40", 40],
      ["m120", 120],
      ["m400", 400],
    ];
    let s = "";
    msgs.forEach(([id, n], k) => {
      const x = 6 + k * 118,
        sc = 90 / (3 * n),
        base = 186,
        tbl = 100,
        pay = Math.round(2.3 * n);
      s += PK(
        id,
        RC(x, 4, 110, 226, { r: 12 }) +
          TX(x + 55, 24, n + " symbols", { s: 13 }) +
          RC(x + 12, base - 3 * n * sc, 36, 3 * n * sc, { r: 3, f: MUTE, fo: 0.25, k: MUTE, w: 2 }) +
          TX(x + 30, base - 3 * n * sc - 6, 3 * n, { s: 12 }) +
          RC(x + 62, base - pay * sc, 36, pay * sc, { r: 2, f: GRN, fo: 0.35, k: GRN, w: 2 }) +
          RC(x + 62, base - (pay + tbl) * sc, 36, tbl * sc, { r: 2, f: AMB, fo: 0.4, k: AMB, w: 2 }) +
          TX(x + 30, 202, "fixed", { s: 11, f: MUTE }) +
          TX(x + 80, 202, "Huffman", { s: 11, f: MUTE }) +
          TX(x + 55, 220, `<tspan fill="${AMB}">100</tspan> + <tspan fill="${GRN}">${pay}</tspan>`, { s: 12 }),
      );
    });
    return SVG(
      360,
      236,
      s,
      "Three panels for 40, 120 and 400 symbols comparing a fixed-code file with a Huffman table of 100 bits plus its payload",
    );
  })();

  B.add("a7-huffman", [
    {
      type: "pick",
      q: "This binary tree is meant to be a prefix code: every filled dot is a codeword, spelled by the 0 and 1 labels on the path from the root. Tap the codeword that breaks the prefix rule.",
      fig: trieFig,
      a: "D",
      hint: "In a prefix code, no codeword may lie on the path to another codeword.",
      why: "D is spelled 11, and the paths to E (110) and F (111) pass straight through it. When the receiver has read 1 1 it cannot tell whether D is finished or E or F is coming. A prefix code puts every codeword at a leaf, with nothing hanging below it, which is what Huffman's tree guarantees.",
    },
    {
      type: "mcq",
      q: "A coin lands heads 90% of the time (entropy about 0.47 bits per flip). Huffman needs at least 1 bit per symbol, so it is wasteful on single flips. The chart shows Huffman's average cost per flip when flips are grouped into blocks of 1, 2, 3 or 4 and each block counts as one symbol. What does grouping do?",
      fig: blockCodeFig,
      o: [
        "It pulls Huffman towards the entropy line, but never below it",
        "It lets Huffman beat the entropy line once the blocks get long enough",
        "It makes little real difference, since each flip is still just heads or tails",
        "It helps up to blocks of three, then the bigger table makes it worse again",
      ],
      a: 0,
      why: "Blocks of two have four symbols with chances 0.81, 0.09, 0.09 and 0.01, so the likely block gets a 1-bit code: 1.29 bits per block, 0.65 per flip. Blocks of three give 0.53, blocks of four 0.49. The cost keeps sliding towards 0.47 but never crosses it, because entropy is a floor for every lossless code. The price is a bigger table and more symbols to track.",
    },
    {
      type: "order",
      q: "Put this cause-and-effect chain in order to explain why a rare symbol gets a long Huffman codeword yet costs few bits.",
      items: [
        "The symbol turns up only a few times",
        "Its small count means it is merged early",
        "Early merges sit at the bottom of the tree",
        "The bottom of the tree means a long codeword",
        "It is so rare that the long code is rarely paid",
      ],
      why: "Few appearances give a small count. The queue always merges the smallest counts first, so the symbol ends up deep in the tree, which means a long codeword. But the cost is the code length times how often it appears, and it appears rarely, so the long code adds little to the total.",
    },
    {
      type: "pick",
      q: "A sender can use fixed 3-bit codes, or Huffman codes that average 2.3 bits per symbol but need a 100-bit code table sent first. Each panel shows one message: the grey bar is the fixed-code size in bits, and the stacked bar is the Huffman table plus its payload. Tap every message where Huffman ends up BIGGER than the fixed-code file.",
      fig: tableCostFig,
      a: ["m40", "m120"],
      hint: "Add the table and the payload, then compare with the grey bar. Careful with the middle panel.",
      why: "Huffman saves 0.7 bits per symbol, but it has to earn back the 100-bit table first: break-even is at about 143 symbols. At 40 symbols it is 192 against 120. At 120 symbols it is 376 against 360, still a small loss. At 400 symbols it is 1,020 against 1,200, a clear win. Short messages can be cheaper with plain fixed codes.",
    },
  ]);

  /* ======================================================================
     a7-lzw
     ====================================================================== */
  // codes emitted vs input length (repeating text vs random text over A,B,C)
  const growthFig = (() => {
    const ns = [30, 60, 90, 120, 150, 200, 250, 300],
      rep = [12, 18, 22, 26, 29, 34, 38, 41],
      ran = [19, 31, 41, 51, 60, 76, 90, 106];
    const X = (i) => 52 + i * 38,
      Y = (v) => 206 - v * 1.6;
    let s = "";
    [0, 25, 50, 75, 100].forEach(
      (v) =>
        (s +=
          LN(46, Y(v), 346, Y(v), { k: "var(--line-soft, var(--line))", w: 1 }) +
          TX(40, Y(v) + 4, v, { a: "end", s: 10, f: MUTE })),
    );
    const curve = (id, a, col) =>
      `<path data-pick="${id}" d="${a.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ")}" fill="none" stroke="transparent" stroke-width="22" stroke-linejoin="round" style="stroke-linecap:round"/>` +
      `<path d="${a.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ")}" fill="none" stroke="${col}" stroke-width="3.5" pointer-events="none"/>`;
    s += curve("t2", ran, AMB) + curve("t1", rep, BLU);
    s +=
      TX(X(7) - 4, Y(41) + 22, "Text 1", { a: "end", s: 12, f: BLU }) +
      TX(X(7) + 4, Y(106) - 10, "Text 2", { a: "end", s: 12, f: AMB });
    ns.forEach((n, i) => (s += TX(X(i), 226, n, { s: 11 })));
    s +=
      TX(200, 246, "letters of input read so far", { s: 11, f: MUTE }) +
      TX(10, 16, "codes sent so far", { a: "start", s: 11, f: MUTE });
    return SVG(
      360,
      254,
      s,
      "Two curves of LZW codes sent against letters read: Text 1 climbs to 41 codes, Text 2 climbs to 106 codes",
    );
  })();

  // phrase timelines for two rows with six As and six Bs
  const phraseFig = (() => {
    const rows = [
      ["Row 1", "ABABABABABAB", ["A", "B", "AB", "ABA", "BA", "BAB"]],
      ["Row 2", "AABBABBAABAB", ["A", "A", "B", "B", "AB", "BA", "AB", "AB"]],
    ];
    let s = "";
    rows.forEach(([name, str, segs], r) => {
      const y = 28 + r * 92;
      s += TX(8, y - 8, name, { a: "start", s: 12 });
      let i = 0;
      segs.forEach((g, k) => {
        const x = 12 + i * 27;
        s += RC(x - 1, y - 1, g.length * 27 - 1 + 2, 34, {
          r: 8,
          f: k % 2 ? BLU : AMB,
          fo: 0.18,
          k: k % 2 ? BLU : AMB,
          w: 2,
        });
        g.split("").forEach((ch, j) => (s += TX(x + j * 27 + 12, y + 22, ch, { m: 1, s: 16 })));
        i += g.length;
      });
      s += TX(8, y + 58, `${segs.length} boxes = ${segs.length} codes`, { a: "start", s: 12, f: MUTE });
    });
    return SVG(
      360,
      200,
      s,
      "Two rows of twelve letters cut into LZW phrase boxes: Row 1 has six boxes, Row 2 has eight",
    );
  })();

  B.add("a7-lzw", [
    {
      type: "pick",
      q: "Two 300-letter texts over A, B and C are encoded with LZW (starting dictionary A = 0, B = 1, C = 2). One text is ABCABCABC… repeated, the other is random letters. The chart shows how many codes each had produced after each stretch of input. Tap the curve for the repeating text.",
      fig: growthFig,
      a: "t1",
      hint: "Which text lets LZW reuse its dictionary entries more?",
      why: "In the repeating text the same phrases come round again and again, so each new entry is soon reused and later phrases get longer and longer: only 41 codes cover all 300 letters. The random text has fewer repeats, so its phrases stay short: 106 codes for the same 300 letters. Both climb more slowly than the input (LZW always gains a little), but the repeating text flattens far more.",
    },
    {
      type: "cat",
      q: "Sender and receiver use LZW and start with the dictionary A = 0, B = 1. Sort each item by how the receiver gets hold of it.",
      buckets: ["Agreed beforehand", "Sent as data", "Rebuilt by the decoder"],
      items: [
        ["The starting table: A = 0, B = 1", 0],
        ["The stream of code numbers, such as 0, 1, 2, 4", 1],
        ["Entry 2 = AB", 2],
        ["The fixed width of each code, say 12 bits", 0],
        ["Entry 4 = ABA", 2],
      ],
      why: "The starting table and the code width are fixed in advance, so nothing about them is sent. Only the code numbers travel. Every longer entry (AB, ABA and so on) is rebuilt by the decoder from the codes it has already read, by the same rule the encoder used, which is why LZW never has to ship a dictionary.",
    },
    {
      type: "order",
      q: "Each input has 12 letters over A, B, C and D (starting dictionary A = 0, B = 1, C = 2, D = 3). Put them in order from the FEWEST LZW codes to the MOST.",
      items: ["AAAAAAAAAAAA", "ABABABABABAB", "ABCDABCDABCD", "ABACABADABAC", "ADBCCABDBACD"],
      hint: "Repeats let LZW take bigger bites, so it needs fewer codes.",
      why: "AAAAAAAAAAAA: A | AA | AAA | AAAA | AA is 5 codes. ABABABABABAB: A | B | AB | ABA | BA | BAB is 6. ABCDABCDABCD: A | B | C | D | AB | CD | ABC | D is 8. ABACABADABAC: A | B | A | C | AB | A | D | ABA | C is 9. ADBCCABDBACD has almost no repeats, so it needs 11. The more the input repeats itself, the longer the phrases get.",
    },
    {
      type: "mcq",
      q: "Both rows hold six As and six Bs, so a Huffman code gives them the same size (12 bits). LZW (starting A = 0, B = 1) cut each row into the phrase boxes shown, one code per box. What does the comparison show?",
      fig: phraseFig,
      o: [
        "LZW uses the order of the letters as well as counts, so repeated patterns shrink and shuffled ones barely do",
        "LZW has a bigger dictionary than Huffman, so it wins whenever the letters are equally common",
        "Huffman reads patterns too, so it would also code Row 1 in fewer bits than Row 2",
        "LZW needs the letter counts first, and the counts are only clear in the patterned row",
      ],
      a: 0,
      why: "Huffman builds its code from letter counts alone, and both rows have six of each, so it cannot tell them apart. LZW grows phrases from what it has already seen: the patterned row becomes 6 codes because phrases keep getting longer, while the shuffled row needs 8 because few phrases repeat. Compression that uses order can find structure that counting misses.",
    },
  ]);
})();

/* ===== bank-x-algo-4.js ===== */
/* Revision bank, third set of varied, visual questions (algo-4).
   Workshops a8-chain, a9-mix, a10-code, a11-picker (6 each) and a8-hash, a8-keys, a9-dft, a9-fft, a10-attn (4 each).
   Every figure is drawn here from data computed by the real algorithms (toy hash, DFT, softmax); answers were checked in node. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG toolkit (theme variables only, so light and dark both work) ---------- */
  const KIND = {
    n: ["var(--panel-2)", "var(--line-2)", "var(--text-dim)"],
    g: ["var(--teal-dim)", "var(--teal)", "var(--teal-ink)"],
    b: ["var(--blue-dim)", "var(--blue)", "var(--blue-ink)"],
    r: ["var(--rose-dim)", "var(--rose)", "var(--rose-ink)"],
    a: ["var(--amber-dim)", "var(--amber)", "var(--amber-ink)"],
    v: ["var(--violet-dim)", "var(--violet)", "var(--violet-ink)"],
    p: ["var(--panel)", "var(--line-2)", "var(--ink)"],
  };
  const f1 = (v) => +(+v).toFixed(1);
  const tx = (x, y, s, o = {}) =>
    `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "var(--mono)" : "var(--sans)"};fill:${o.c || "var(--ink)"}">${s}</text>`;
  const lines = (x, y, arr, o = {}) => arr.map((s, i) => tx(x, y + i * (o.lh || 15), s, o)).join("");
  const rc = (x, y, w, h, k = "p", o = {}) =>
    `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${o.r ?? 8}" fill="${o.f || KIND[k][0]}" stroke="${o.st || KIND[k][1]}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.w || 2}" stroke-linecap="round"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const arrow = (x1, y1, x2, y2, c = "var(--text-faint)", w = 2) => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      h = 7,
      p = (t) => `${f1(x2 - h * Math.cos(a + t))},${f1(y2 - h * Math.sin(a + t))}`;
    return (
      ln(x1, y1, x2 - 3 * Math.cos(a), y2 - 3 * Math.sin(a), { c, w }) +
      `<polygon points="${f1(x2)},${f1(y2)} ${p(0.5)} ${p(-0.5)}" fill="${c}"/>`
    );
  };
  const circ = (x, y, r, k = "p", o = {}) =>
    `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="${o.f || KIND[k][0]}" stroke="${o.st || KIND[k][1]}" stroke-width="${o.sw || 2}"/>`;
  // drawn ticks and crosses (a ✓ or ✗ typed inside SVG text would be swapped for a badge and misplaced)
  const tick = (x, y, c = "var(--teal-ink)") =>
    `<path d="M ${f1(x - 6)} ${f1(y)} l 4.5 4.5 l 8 -9" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  const cross = (x, y, c = "var(--rose-ink)") =>
    `<path d="M ${f1(x - 5)} ${f1(y - 5)} l 10 10 M ${f1(x + 5)} ${f1(y - 5)} l -10 10" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const svg = (w, h, body, label) =>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}" style="width:100%;height:auto;display:block;max-width:${Math.min(Math.round(w * 1.45), 560)}px;margin:0 auto">${body}</svg>`;
  const tint = (c, p) => `color-mix(in srgb, ${c} ${p}%, var(--panel))`;
  const TAU = 2 * Math.PI;

  /* ---------- real algorithms used to draw the figures ---------- */
  const djb2 = (s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  const fmix = (h) => {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  };
  const scrambled = (s) =>
    fmix(parseInt(djb2(s), 16))
      .toString(16)
      .padStart(8, "0");
  const zeros = (h) => {
    let k = 0;
    while (k < h.length && h[k] === "0") k++;
    return k;
  };
  const blockHash = (b) => scrambled(`${b.nonce}|${b.i}|${b.data}|${b.prev}`);
  const mineBlock = (b, need) => {
    b.nonce = 0;
    while (zeros(blockHash(b)) < need) b.nonce++;
  };
  const dftAmps = (x) => {
    const n = x.length,
      a = [];
    for (let k = 0; k <= n / 2; k++) {
      let re = 0,
        im = 0;
      for (let t = 0; t < n; t++) {
        const q = (-TAU * k * t) / n;
        re += x[t] * Math.cos(q);
        im += x[t] * Math.sin(q);
      }
      a.push(((k === 0 || k === n / 2 ? 1 : 2) * Math.hypot(re, im)) / n);
    }
    return a;
  };
  const softmax = (s) => {
    const m = Math.max(...s),
      e = s.map((v) => Math.exp(v - m)),
      t = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / t);
  };

  /* ================================================================== a8-hash ================================================================== */

  // H1: which hex digits move when only the nonce changes (a toy hash whose leading digits are frozen)
  function figHexFrozen() {
    const rows = [0, 1, 2, 3, 4, 5].map((n) => [n, djb2(`alice pays bob 5|nonce=${n}`)]);
    const cw = 28,
      x0 = 98,
      y0 = 52,
      rh = 26;
    let s = tx(8, 16, "Toy hash of “alice pays bob 5|nonce=N”", { a: "start", s: 12, c: "var(--text-dim)" });
    for (let c = 0; c < 8; c++) s += tx(x0 + c * cw + cw / 2, y0 - 7, c + 1, { s: 11, c: "var(--text-faint)" });
    s += tx(8, y0 - 7, "hex digit", { a: "start", s: 11, c: "var(--text-faint)" });
    rows.forEach(([n, h], r) => {
      const y = y0 + r * rh;
      s += tx(8, y + 17, `nonce ${n}`, { a: "start", s: 12, c: "var(--text-dim)" });
      [...h].forEach((d, c) => {
        s +=
          rc(x0 + c * cw + 1, y + 1, cw - 2, rh - 3, c === 7 ? "a" : "n", { r: 5, sw: 1.5 }) +
          tx(x0 + c * cw + cw / 2, y + 17, d, { m: 1, s: 13, c: c === 7 ? "var(--amber-ink)" : "var(--text-dim)" });
      });
    });
    return svg(330, y0 + rows.length * rh + 6, s, "Six toy hashes for nonces 0 to 5: only the last hex digit changes");
  }

  // H3: a mining log with one wrong verdict
  function figMiningLog() {
    const need = "00",
      H = (n) => scrambled(`${n}|2|bob pays carol 2|6b17ac04`);
    const rows = [26, 27, 28, 29, 37].map((n) => [n, H(n), n === 28 || n === 37]);
    let s = tx(
      8,
      17,
      `A script accepts a hash only if it starts with <tspan style="fill:var(--teal-ink)">${need}</tspan>`,
      { a: "start", s: 13 },
    );
    s +=
      tx(14, 44, "nonce", { a: "start", s: 11, c: "var(--text-faint)" }) +
      tx(100, 44, "hash", { a: "start", s: 11, c: "var(--text-faint)" }) +
      tx(250, 44, "script says", { a: "start", s: 11, c: "var(--text-faint)" });
    rows.forEach(([n, h, ok], i) => {
      const y = 52 + i * 38;
      s += pk(
        `n${n}`,
        rc(6, y, 328, 32, "p", { r: 8 }) +
          tx(16, y + 21, n, { a: "start", s: 14, c: "var(--text-dim)" }) +
          tx(100, y + 21, h, { a: "start", s: 15, m: 1 }) +
          rc(240, y + 5, 88, 22, ok ? "g" : "r", { r: 11, sw: 1.5 }) +
          (ok ? tick(258, y + 14) : cross(258, y + 16)) +
          tx(296, y + 21, ok ? "sealed" : "not yet", { s: 12, c: ok ? "var(--teal-ink)" : "var(--rose-ink)" }),
      );
    });
    return svg(
      340,
      52 + rows.length * 38 + 2,
      s,
      "Mining log with five nonces, their hashes and the script's verdicts",
    );
  }

  // H4: checksum on the same server as the file
  function figChecksumPipes() {
    const lane = (y, title, file, dig, kind) =>
      tx(8, y, title, { a: "start", s: 12, c: "var(--text-dim)" }) +
      rc(8, y + 8, 100, 28, kind) +
      tx(58, y + 27, file, { s: 12, m: 1 }) +
      rc(8, y + 42, 100, 28, kind) +
      tx(58, y + 61, dig, { s: 12, m: 1 }) +
      arrow(112, y + 39, 134, y + 39) +
      rc(138, y + 8, 100, 62, "p") +
      lines(188, y + 33, ["your PC hashes", "the file, compares"], { s: 12 }) +
      arrow(242, y + 39, 264, y + 39) +
      rc(268, y + 20, 66, 38, "a") +
      tx(301, y + 37, "match", { s: 12, c: "var(--amber-ink)" }) +
      tick(301, y + 46, "var(--amber-ink)");
    const s =
      lane(18, "Honest server", "setup.zip", "digest 9f2c…", "n") +
      lane(112, "After the break-in", "evil.zip", "digest 41ab…", "r");
    return svg(
      340,
      196,
      s,
      "Two pipelines: an honest download and one where the attacker replaced both the file and its checksum, both ending in a match",
    );
  }

  B.add("a8-hash", [
    {
      type: "mcq",
      q: "A miner tries nonces for the toy hash below. The nonce is the last thing in the text. Why would this hash make a poor puzzle for “start with zeros”?",
      fig: figHexFrozen(),
      o: [
        "The leading digits stay the same for every nonce, so no amount of guessing can change them",
        "The last digit climbs by one each time, which lets a miner win far too easily at any difficulty",
        "Eight hex digits is too short to carry a nonce, so the same hashes would repeat after eight tries",
        "A hash written in hexadecimal can never start with a zero digit, so the puzzle has no winners",
      ],
      a: 0,
      why: "A good hash is unpredictable: change the nonce and every digit scrambles. Here only the last digit moves, because the nonce only reaches the low end of this toy hash. The first digits are frozen, so guessing can never create a leading zero (or, if they happened to be zero, would always have it). That is why the workshop scrambles the hash once more.",
    },
    {
      type: "cat",
      q: "A chain is mined at some difficulty (number of leading hex zeros). Raise that difficulty by one zero. Sort each cost by what happens to it.",
      buckets: ["Grows with difficulty", "Doesn't depend on it"],
      items: [
        ["Expected tries to mine one block", 0],
        ["Hashes a node computes to check one block's seal", 1],
        ["Length of the hash stored in each block", 1],
        ["Expected work to re-mine blocks 2 to 5 after an edit", 0],
        ["Hashes needed to verify a 100-block chain", 1],
        ["Time an attacker needs to catch up with honest miners", 0],
      ],
      why: "Difficulty only changes how many guesses a winning nonce needs (16× more per extra zero), so everything that involves searching grows. Checking is one hash per block however hard the puzzle was, and the digest length is fixed. Verifying 100 blocks costs 100 hashes at any difficulty, which grows with the chain's length, not its difficulty.",
    },
    {
      type: "pick",
      q: "A reviewer is checking a mining script's log. The target is a hash starting with two zeros, <b>00</b>. One verdict in the log is wrong. Tap that row.",
      fig: figMiningLog(),
      a: "n28",
      why: "Nonce 28 gives <code>0b0553aa</code>, which has only one leading zero, so it does not meet 00 and the script should say “not yet”. Nonce 27's hash ends in zero-ish digits and nonce 37's <code>00e9d55e</code> is a true win: only zeros at the very start count.",
    },
    {
      type: "mcq",
      q: "A download page shows a file and its checksum (a hash of the file) side by side on the same server. An attacker breaks into that server. Why does the checksum not protect you?",
      fig: figChecksumPipes(),
      o: [
        "The attacker can swap the file and its checksum together, so your PC still sees a match",
        "Hashes can be run backwards, so the attacker can rebuild the original file from its checksum",
        "A checksum only covers the first few bytes of a file, so later tampering would go unnoticed",
        "Your PC computes a different hash every time it runs, so a match would never be possible",
      ],
      a: 0,
      why: "A hash only shows that two things agree, and the attacker controls both. To trust it, the checksum has to come from somewhere the attacker cannot change (a different site, or a signed message). This is the same reason a hash chain needs its seals and a signature: a fingerprint on its own is not a promise.",
    },
  ]);

  /* ================================================================== a8-keys ================================================================== */

  // K1: rings of the values g^a mod 17
  function figRings() {
    const ring = (cx, cy, g, title, sub) => {
      const reach = new Set();
      let v = 1;
      for (let a = 1; a <= 16; a++) {
        v = (v * g) % 17;
        reach.add(v);
      }
      let s = tx(cx, 20, title, { s: 14 }) + tx(cx, 36, sub, { s: 12, c: "var(--text-dim)" });
      const R = 56;
      for (let k = 1; k <= 16; k++) {
        const ang = ((k - 1) / 16) * TAU - Math.PI / 2,
          x = cx + R * Math.cos(ang),
          y = cy + R * Math.sin(ang),
          on = reach.has(k);
        s += circ(x, y, on ? 6.5 : 4, on ? "g" : "n", { f: on ? "var(--teal)" : "var(--panel)", sw: 1.5 });
        if (on && g === 4)
          s += tx(cx + (R + 17) * Math.cos(ang), cy + (R + 17) * Math.sin(ang) + 4, k, { s: 12, c: "var(--teal-ink)" });
      }
      return s;
    };
    const s =
      ring(88, 118, 3, "g = 3", "reaches 16 values") +
      ring(252, 118, 4, "g = 4", "reaches only 4 values") +
      tx(88, 208, "3, 9, 10, 13, 5, 15, 11, 16 …", { s: 12, c: "var(--text-dim)" }) +
      tx(88, 224, "no repeat for 16 steps", { s: 12, c: "var(--text-dim)" }) +
      tx(252, 208, "4, 16, 13, 1, 4, 16, 13, 1 …", { s: 12, c: "var(--text-dim)" }) +
      tx(252, 224, "repeats every 4 steps", { s: 12, c: "var(--text-dim)" });
    return svg(
      340,
      234,
      s,
      "Two rings of 16 positions: the powers of 3 mod 17 land on all 16, the powers of 4 land on only four",
    );
  }

  // K2: signing and checking, who can do what
  function figSignPipe() {
    let s = tx(8, 14, "Alice signs", { a: "start", s: 12, c: "var(--text-dim)" });
    s += pk("s1", rc(8, 22, 150, 48, "p") + lines(83, 42, ["1  Hash the", "contract"], { s: 12 }));
    s += arrow(160, 46, 182, 46);
    s += pk(
      "s2",
      rc(184, 22, 150, 48, "p") + lines(259, 38, ["2  Lock the hash with", "Alice's PRIVATE key"], { s: 12 }),
    );
    s +=
      arrow(259, 72, 259, 100, "var(--text-faint)") +
      tx(250, 94, "contract + signature travel to Bob", { a: "end", s: 11, c: "var(--text-dim)" });
    s += tx(8, 120, "Bob checks (Eve can copy all of this)", { a: "start", s: 12, c: "var(--text-dim)" });
    s += pk("s3", rc(8, 128, 100, 56, "p") + lines(58, 148, ["3  Hash the", "contract he got"], { s: 12 }));
    s += arrow(110, 156, 124, 156);
    s += pk(
      "s4",
      rc(126, 128, 108, 56, "p") +
        lines(180, 148, ["4  Unlock the sig", "with Alice's", "PUBLIC key"], { s: 11, lh: 13 }),
    );
    s += arrow(236, 156, 250, 156);
    s += pk("s5", rc(252, 128, 82, 56, "p") + lines(293, 148, ["5  Compare", "the two"], { s: 12 }));
    return svg(
      342,
      194,
      s,
      "Five steps: Alice hashes then locks with her private key; Bob hashes, unlocks with her public key and compares",
    );
  }

  // K3: Venn of public-channel set-up and bulk speed
  function figVenn() {
    let s = `<circle cx="120" cy="150" r="100" fill="var(--blue)" fill-opacity=".14" stroke="var(--blue)" stroke-width="2.5"/><circle cx="230" cy="150" r="100" fill="var(--amber)" fill-opacity=".14" stroke="var(--amber)" stroke-width="2.5"/>`;
    s +=
      lines(8, 14, ["Can set up a secret", "over a public channel"], { a: "start", s: 12, c: "var(--blue-ink)" }) +
      lines(342, 14, ["Fast enough for", "bulk data"], { a: "end", s: 12, c: "var(--amber-ink)" });
    s +=
      tx(74, 144, "RSA", { s: 15 }) +
      tx(74, 168, "Diffie–Hellman", { s: 12 }) +
      tx(282, 146, "AES", { s: 15 }) +
      tx(282, 164, "(shared key)", { s: 11, c: "var(--text-dim)" });
    s +=
      `<ellipse cx="175" cy="150" rx="30" ry="46" fill="none" stroke="var(--text-faint)" stroke-width="2" stroke-dasharray="5 4"/>` +
      tx(175, 157, "?", { s: 20, c: "var(--text-faint)" });
    return svg(
      350,
      256,
      s,
      "Venn diagram: RSA and Diffie-Hellman sit in the public-channel circle, AES in the bulk-data circle, and the overlap is empty",
    );
  }

  // K4: a tree of certificates
  function figCertTree() {
    let s =
      rc(95, 8, 150, 42, "g") +
      lines(170, 26, ["Root CA", "built into the browser"], { s: 12, c: "var(--teal-ink)", lh: 14 });
    s +=
      ln(170, 50, 85, 80, { c: "var(--teal)", w: 3 }) +
      tx(106, 72, "signed", { s: 11, c: "var(--text-dim)", a: "end" });
    s += rc(15, 80, 140, 40, "p") + lines(85, 97, ["Intermediate CA", "(signed by Root)"], { s: 12, lh: 14 });
    s +=
      rc(185, 80, 140, 40, "n", { d: "5 4" }) +
      lines(255, 97, ["FreeCert Ltd", "(not in the browser's list)"], { s: 11, lh: 14, c: "var(--text-dim)" });
    s +=
      ln(85, 120, 85, 150, { c: "var(--teal)", w: 3 }) + ln(255, 120, 255, 150, { c: "var(--line-2)", w: 3, d: "5 4" });
    s += pk(
      "A",
      rc(15, 150, 140, 46, "p") + lines(85, 168, ["shop.example", "signed by Intermediate"], { s: 12, lh: 14 }),
    );
    s += pk(
      "B",
      rc(185, 150, 140, 46, "p") + lines(255, 168, ["shop.example", "signed by FreeCert"], { s: 12, lh: 14 }),
    );
    s += pk("C", rc(100, 226, 140, 46, "p") + lines(170, 244, ["shop.example", "signed by itself"], { s: 12, lh: 14 }));
    return svg(
      340,
      280,
      s,
      "Certificate tree: Root CA signs an Intermediate CA which signs one shop.example certificate; a second comes from an unknown FreeCert; a third signs itself",
    );
  }

  B.add("a8-keys", [
    {
      type: "mcq",
      q: "Diffie–Hellman with p = 17. Each ring shows which public values A = gᵃ mod 17 can ever appear (big green dots). Alice and Bob choose g = 4 instead of g = 3. What is the real problem?",
      fig: figRings(),
      o: [
        "Eve only has to try a = 1, 2, 3, 4, because the powers of 4 repeat after four steps",
        "Alice and Bob would calculate two different shared secrets, so the chat could not start",
        "Eve could read a straight off the ring, since every dot is labelled with its exponent",
        "The public value A would be too big to send, because g = 4 raises it to a higher power",
      ],
      a: 0,
      hint: "Count the steps until the sequence 4, 16, 13, 1 starts again.",
      why: "The secret exponent only matters up to where the powers start repeating. With g = 3 that is 16 steps, with g = 4 it is 4, so Eve can simply try every a up to 4 (or 8 for g = 2). A good base, called a generator, visits as many values as possible, which is what makes the search hard.",
    },
    {
      type: "pick",
      q: "Alice signs a contract and sends it with her signature. Eve has a copy of everything on the wire and Alice's <b>public</b> key. Tap <b>every</b> step Eve could carry out herself.",
      fig: figSignPipe(),
      a: ["s1", "s3", "s4", "s5"],
      why: "Hashing needs no secret, and unlocking a signature uses the <b>public</b> key, so Eve can do steps 1, 3, 4 and 5. The only step that needs a secret is step 2, locking with Alice's private key. That asymmetry is the whole point: anyone can check a signature, only Alice can make one.",
    },
    {
      type: "mcq",
      q: "Each method is placed by what it does well. Nothing lands in the overlap. How does a real secure chat cope with that?",
      fig: figVenn(),
      o: [
        "Public-key steps agree a fresh key, then fast symmetric encryption carries the chat",
        "It uses RSA for every single message and accepts the extra waiting time on each reply",
        "It sends the AES key in the clear first, because AES is quick enough to make up for that",
        "It picks a much bigger RSA key until RSA becomes as fast as AES for the bulk data",
      ],
      a: 0,
      why: "Public-key methods can start from nothing but are slow; symmetric ciphers are fast but need a shared key already. Combining them (a hybrid) gets both: use Diffie–Hellman or RSA once to agree a key, then AES for the bulk. A bigger RSA key makes it slower, not faster.",
    },
    {
      type: "pick",
      q: "Your browser trusts only the Root CA's key. Three servers each present a certificate claiming to be <b>shop.example</b>. Tap the certificate it should accept.",
      fig: figCertTree(),
      a: "A",
      why: "A certificate is only as good as the chain of signatures leading back to a key you already hold. A is signed by the Intermediate, whose own certificate is signed by the Root, so the chain closes. FreeCert is unknown to the browser and a self-signed certificate vouches only for itself, so a man in the middle could use either.",
    },
  ]);

  /* ================================================================== a9-dft ================================================================== */

  // D1: tone order is not in the magnitude spectrum
  function figTwoRecordings() {
    const N = 64,
      tone = (f, t) => Math.sin((TAU * f * t) / N);
    const A = Array.from({ length: N }, (_, t) => (t < 32 ? tone(4, t) : tone(8, t)));
    const Bs = Array.from({ length: N }, (_, t) => (t < 32 ? tone(8, t) : tone(4, t)));
    const sa = dftAmps(A),
      sb = dftAmps(Bs);
    const wave = (arr, cy, first, second) => {
      const X = (t) => 12 + (t * 316) / 63,
        pts = (a, b) =>
          arr
            .slice(a, b + 1)
            .map((v, i) => `${f1(X(a + i))},${f1(cy - v * 17)}`)
            .join(" ");
      return (
        ln(12, cy, 328, cy, { c: "var(--line)", w: 1.5 }) +
        `<polyline points="${pts(0, 32)}" fill="none" stroke="${first}" stroke-width="2.5" stroke-linejoin="round"/><polyline points="${pts(32, 63)}" fill="none" stroke="${second}" stroke-width="2.5" stroke-linejoin="round"/>`
      );
    };
    const bars = (x0, amps, title) => {
      let s = tx(x0 + 71, 134, title, { s: 12, c: "var(--text-dim)" });
      for (let k = 0; k <= 12; k++) {
        const h = amps[k] * 120,
          c = k === 4 ? "var(--blue)" : k === 8 ? "var(--amber)" : "var(--line-2)";
        s += `<rect x="${x0 + k * 11 + 1}" y="${f1(206 - h)}" width="8" height="${f1(Math.max(h, 1))}" rx="2" fill="${c}"/>`;
      }
      return (
        s +
        ln(x0, 207, x0 + 143, 207, { c: "var(--line-2)", w: 1.5 }) +
        tx(x0, 222, "0", { s: 11, c: "var(--text-faint)", a: "start" }) +
        tx(x0 + 143, 222, "12 Hz", { s: 11, c: "var(--text-faint)", a: "end" })
      );
    };
    const s =
      tx(8, 14, "Recording A: slow tone, then fast tone", { a: "start", s: 12, c: "var(--text-dim)" }) +
      wave(A, 42, "var(--blue)", "var(--amber)") +
      tx(8, 78, "Recording B: fast tone, then slow tone", { a: "start", s: 12, c: "var(--text-dim)" }) +
      wave(Bs, 106, "var(--amber)", "var(--blue)") +
      bars(10, sa, "Spectrum of A") +
      bars(180, sb, "Spectrum of B");
    return svg(
      340,
      230,
      s,
      "Two one-second recordings with the same two tones in opposite order, and their identical magnitude spectra",
    );
  }

  // D2: the fold plot at fs = 40 Hz
  function figFold() {
    const X = (f) => 44 + f * 3.4,
      Y = (a) => 168 - a * 6;
    const fold = (f) => Math.abs(f - 40 * Math.round(f / 40));
    let s =
      ln(44, 168, 318, 168, { c: "var(--text-faint)", w: 2 }) + ln(44, 168, 44, 40, { c: "var(--text-faint)", w: 2 });
    [0, 10, 20].forEach(
      (a) =>
        (s +=
          ln(41, Y(a), 47, Y(a), { c: "var(--text-faint)", w: 2 }) +
          tx(36, Y(a) + 4, a, { a: "end", s: 11, c: "var(--text-dim)" })),
    );
    s += tx(8, 24, "peak you see (Hz)", { a: "start", s: 12, c: "var(--text-dim)" });
    s += `<polyline points="${[0, 20, 40, 60, 80].map((f) => `${f1(X(f))},${f1(Y(fold(f)))}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    s += tx(181, 220, "true frequency of the tone (Hz). Tap marked tones.", { s: 12, c: "var(--text-dim)" });
    [10, 20, 30, 50, 60, 70].forEach((f) => {
      s += pk(
        String(f),
        `<rect x="${f1(X(f) - 14)}" y="176" width="28" height="26" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>` +
          tx(X(f), 194, f, { s: 13 }),
      );
    });
    [0, 40, 80].forEach((f) => (s += ln(X(f), 168, X(f), 172, { c: "var(--text-faint)", w: 2 })));
    return svg(330, 228, s, "Zig-zag plot: apparent frequency against true frequency when sampling at 40 Hz");
  }

  // D3: recording set-ups, sample rate across and length up
  function figSetups() {
    const X = (fs) => 48 + (fs / 1400) * 270,
      Y = (T) => 232 - T * 170;
    let s =
      ln(48, 232, 322, 232, { c: "var(--text-faint)", w: 2 }) + ln(48, 232, 48, 36, { c: "var(--text-faint)", w: 2 });
    [0, 400, 800, 1200].forEach(
      (v) =>
        (s +=
          ln(X(v), 232, X(v), 236, { c: "var(--text-faint)", w: 2 }) +
          tx(X(v), 250, v, { s: 11, c: "var(--text-dim)" })),
    );
    [0, 0.5, 1].forEach(
      (v) =>
        (s +=
          ln(44, Y(v), 48, Y(v), { c: "var(--text-faint)", w: 2 }) +
          tx(40, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-dim)" }) +
          (v ? ln(48, Y(v), 322, Y(v), { c: "var(--line)", w: 1, d: "3 4" }) : "")),
    );
    s +=
      tx(8, 22, "recording length (s)", { a: "start", s: 12, c: "var(--text-dim)" }) +
      tx(185, 270, "samples per second (Hz)", { s: 12, c: "var(--text-dim)" });
    [
      ["A", 500, 1],
      ["B", 800, 0.25],
      ["C", 800, 1],
      ["D", 650, 0.6],
      ["E", 1000, 0.4],
      ["F", 1200, 0.75],
      ["G", 400, 0.3],
    ].forEach(([id, fs, T]) => (s += pk(id, circ(X(fs), Y(T), 13, "p") + tx(X(fs), Y(T) + 5, id, { s: 13 }))));
    return svg(335, 278, s, "Scatter of seven recording set-ups: sample rate across, recording length up");
  }

  B.add("a9-dft", [
    {
      type: "mcq",
      q: "Recording A plays a 4 Hz tone for half a second then an 8 Hz tone for half a second. Recording B plays them the other way round. Both are analysed with one DFT over the whole second. Can the magnitude spectrum tell you which tone came first?",
      fig: figTwoRecordings(),
      o: [
        "No: each bar adds up the whole second, so the order of the tones is not in the bar heights",
        "Yes: the 4 Hz bar sits further left when that tone plays first, so you can simply read the order",
        "Yes: the tone that plays first always leaves the taller bar of the two bars in the spectrum",
        "No: the sample rate is too low to hold two different tones in the same recording",
      ],
      a: 0,
      why: "Every DFT bin multiplies all the samples by one rotating wave and adds the lot, so a bin answers “how much of this frequency is in the window?”, not “when?”. Swapping the halves gives exactly the same magnitudes (here the two charts are numerically identical). To see timing you cut the signal into short windows, a spectrogram.",
    },
    {
      type: "pick",
      q: "A recorder samples at <b>40 Hz</b>. The zig-zag shows where a tone of each true frequency appears. A peak shows at 10 Hz. Tap <b>every</b> marked true frequency that could have produced it.",
      fig: figFold(),
      a: ["10", "30", "50", "70"],
      why: "Everything folds back into 0 to 20 Hz (half of 40). Tones at 10, 30, 50 and 70 Hz all land on 10 Hz: they differ by multiples of the sampling rate (40 Hz) or are mirror images around it. 20 and 60 Hz both land on 20 Hz. After sampling, nothing can tell these impostors apart.",
    },
    {
      type: "pick",
      q: "The loudest tone to record is <b>300 Hz</b>, and two hums must show as separate peaks, which needs bins at most <b>2 Hz</b> apart. Each dot is a recording set-up. Tap <b>every</b> set-up that works.",
      fig: figSetups(),
      a: ["C", "D", "F"],
      hint: "Two conditions: samples per second above 2 × 300, and bin spacing 1 ÷ length at most 2.",
      why: "Condition 1: sample faster than twice the highest tone, so more than 600 Hz (rules out A and G). Condition 2: bin spacing is 1 ÷ length, so a length of at least 0.5 s gives 2 Hz bins (rules out B and E). C, D and F meet both.",
    },
    {
      type: "bug",
      q: "<code>mags</code> holds the DFT magnitudes for bins 0 to n/2, from n samples taken at <code>fs</code> Hz. The function should return the frequency of the loudest bin but gives silly answers. Click the faulty line.",
      code: [
        "def peak_hz(mags, fs):",
        "    n = 2 * (len(mags) - 1)",
        "    k = mags.index(max(mags))",
        "    return k * n / fs",
      ],
      a: 3,
      why: "Bin k sits at k × (bin spacing) and the spacing is fs ÷ n. The line multiplies by n and divides by fs, the wrong way up (the answer would shrink as you sample faster). It should be <code>k * fs / n</code>.",
    },
  ]);

  /* ================================================================== a9-fft ================================================================== */

  // F1: samples that are zero on the odd positions
  function figEvenOnly() {
    const xs = [3, 0, 1, 0, 4, 0, 2, 0],
      cw = 38,
      x0 = 16;
    let s = tx(8, 16, "8 samples", { a: "start", s: 12, c: "var(--text-dim)" });
    xs.forEach(
      (v, i) =>
        (s +=
          rc(x0 + i * cw, 24, cw - 4, 34, i % 2 ? "n" : "b", { r: 6 }) +
          tx(x0 + i * cw + (cw - 4) / 2, 47, v, { s: 15, c: i % 2 ? "var(--text-faint)" : "var(--blue-ink)" }) +
          tx(x0 + i * cw + (cw - 4) / 2, 74, `x${i}`, { s: 11, c: "var(--text-faint)" })),
    );
    s += tx(8, 108, "Spectrum bars (heights depend on the samples)", { a: "start", s: 12, c: "var(--text-dim)" });
    for (let k = 0; k < 8; k++) {
      const x = x0 + k * cw;
      if (k === 1)
        s +=
          rc(x, 120, cw - 4, 80, "g", { r: 6, sw: 1.5 }) +
          `<rect x="${x + 5}" y="152" width="${cw - 14}" height="48" rx="3" fill="var(--teal)"/>` +
          tx(x + (cw - 4) / 2, 140, "ref", { s: 11, c: "var(--teal-ink)" });
      else
        s += pk(
          String(k),
          rc(x, 120, cw - 4, 80, "p", { r: 6, d: "4 3" }) +
            tx(x + (cw - 4) / 2, 166, "?", { s: 15, c: "var(--text-faint)" }),
        );
      s += tx(x + (cw - 4) / 2, 218, `bin ${k}`, { s: 11, c: "var(--text-faint)" });
    }
    return svg(
      330,
      228,
      s,
      "Eight samples with zeros at odd positions, and eight spectrum slots with bin 1 drawn as the reference",
    );
  }

  // F2: an 8-point butterfly network
  function figButterfly8() {
    const order = [0, 4, 2, 6, 1, 5, 3, 7],
      Y = (i) => 44 + i * 25,
      bands = [
        [84, 150],
        [160, 226],
        [236, 302],
      ];
    let s = "";
    bands.forEach(([a, b], si) => {
      s += pk(
        `s${si + 1}`,
        rc(a - 4, 24, b - a + 8, 206, "p", { r: 10, d: "5 4" }) +
          tx((a + b) / 2, 18, `Stage ${si + 1}`, { s: 12, c: "var(--text-dim)" }),
      );
    });
    for (let i = 0; i < 8; i++) s += ln(46, Y(i), 306, Y(i), { c: "var(--line-2)", w: 1.5 });
    bands.forEach(([a, b], si) => {
      const d = 1 << si;
      for (let i = 0; i < 8; i++)
        if (!(i & d)) {
          const j = i + d;
          s += ln(a, Y(i), b, Y(j), { c: "var(--blue)", w: 2 }) + ln(a, Y(j), b, Y(i), { c: "var(--blue)", w: 2 });
          s +=
            circ(a, Y(i), 3.2, "p", { f: "var(--blue)", st: "var(--blue)", sw: 1 }) +
            circ(a, Y(j), 3.2, "p", { f: "var(--blue)", st: "var(--blue)", sw: 1 });
        }
    });
    order.forEach((v, i) => (s += tx(38, Y(i) + 4, `x${v}`, { a: "end", s: 12 })));
    return svg(340, 242, s, "An eight-point butterfly network with inputs in bit-reversed order and three stages");
  }

  // F3: a log ruler for operation counts
  function figRuler() {
    let s = ln(20, 44, 320, 44, { c: "var(--text-faint)", w: 2.5 });
    for (let e = 1; e <= 10; e++) {
      const x = 20 + ((e - 1) * 300) / 9;
      s += ln(x, 38, x, 50, { c: "var(--text-faint)", w: 2 });
    }
    [
      [1, "10"],
      [3, "1,000"],
      [6, "1 million"],
      [9, "1 billion"],
    ].forEach(
      ([e, t]) =>
        (s += tx(20 + ((e - 1) * 300) / 9, 72, t, { s: 12, c: "var(--text-dim)", a: e === 1 ? "start" : "middle" })),
    );
    s += tx(170, 18, "number of operations, each tick is 10× the last", { s: 12, c: "var(--text-dim)" });
    return svg(340, 84, s, "A logarithmic ruler from 10 operations to 10 billion");
  }

  B.add("a9-fft", [
    {
      type: "pick",
      q: "An 8-sample recording has <b>zeros at every odd position</b>: x = [3, 0, 1, 0, 4, 0, 2, 0]. Bin 1's bar is drawn. Which other bins must be <b>exactly as tall</b>? Tap them all.",
      fig: figEvenOnly(),
      a: ["3", "5", "7"],
      hint: "If the odd samples are all zero, what is left of X[k] = E[k] + W·O[k]?",
      why: "The odd half O is all zeros, so X[k] = E[k] and X[k + 4] = E[k]: the spectrum repeats every 4 bins, so bin 5 equals bin 1. A real signal also mirrors (bin 8 − k has the same height), so bin 7 matches bin 1 and bin 3 matches bin 5. Bins 0, 2, 4 and 6 are different (10, 4, 10, 4 against 1.41).",
    },
    {
      type: "pick",
      q: "In this 8-point FFT the inputs are shuffled into bit-reversed order and then merged in three stages. The original samples <b>x0 and x1</b> (the first two in the recording) are first combined in which stage? Tap it.",
      fig: figButterfly8(),
      a: "s3",
      hint: "Follow x0 and x1 along their wires: when do they first end up on the same butterfly?",
      why: "Stage 1 merges neighbours in the shuffled order, so x0 meets x4. Stage 2 merges those pairs with {x2, x6}. Only stage 3 joins the even-indexed group {x0, x4, x2, x6} with the odd group {x1, x5, x3, x7}, so x0 and x1 first meet there. Neighbours in time are the last to meet, because the split starts with even against odd.",
    },
    {
      type: "order",
      q: "Each job counts as N² operations (direct DFT) or about N log₂ N (FFT). Order them from the <b>fewest</b> operations to the most.",
      fig: figRuler(),
      hint: "log₂ of 4,096 is 12, of 65,536 is 16 and of 1,048,576 is 20.",
      items: [
        "Direct DFT of 64 samples",
        "FFT of 4,096 samples",
        "Direct DFT of 512 samples",
        "FFT of 65,536 samples",
        "FFT of 1,048,576 samples",
      ],
      why: "64² = 4,096; 4,096 × 12 ≈ 49,000; 512² ≈ 262,000; 65,536 × 16 ≈ 1,050,000; 1,048,576 × 20 ≈ 21 million. A direct DFT of just 512 samples already costs more than an FFT of 4,096, but an FFT of a million samples is still only about 21 million steps, far less than the 10¹² a direct DFT would need.",
    },
    {
      type: "bug",
      q: "This should reverse the bits of <code>i</code> (with 3 bits, 6 = 110 becomes 011 = 3), the order an FFT's inputs are shuffled into. It returns 1 for 6. Click the faulty line.",
      code: [
        "def bit_reverse(i, bits):",
        "    r = 0",
        "    for _ in range(bits):",
        "        r = r | (i & 1)",
        "        i >>= 1",
        "    return r",
      ],
      a: 3,
      why: "Each pass should push the bits already collected one place left and add the new one at the bottom: <code>r = (r &lt;&lt; 1) | (i &amp; 1)</code>. Without the shift every bit lands on the same place, so 6 (110) gives 0, 1, 1 → 1 instead of 3.",
    },
  ]);

  /* ================================================================== a10-attn ================================================================== */

  // A1: query and key arrows in 2-D
  function figArrows() {
    const X = (x) => 34 + (x + 2) * 40,
      Y = (y) => 222 - (y + 1) * 42,
      O = [X(0), Y(0)];
    let s =
      ln(X(-2), Y(0), X(5), Y(0), { c: "var(--line-2)", w: 1.5 }) +
      ln(X(0), Y(-1), X(0), Y(4), { c: "var(--line-2)", w: 1.5 });
    [
      [1, 1, "A"],
      [4, 1, "B"],
      [0, 3, "C"],
      [-1, 2, "D"],
    ].forEach(([x, y, id]) => {
      s += arrow(O[0], O[1], X(x), Y(y), "var(--text-faint)", 2.5);
    });
    s +=
      arrow(O[0], O[1], X(2), Y(2), "var(--blue)", 4) +
      tx(X(2) + 10, Y(2) - 14, "query (2, 2)", { a: "start", s: 12, c: "var(--blue-ink)" });
    [
      [1, 1, "A"],
      [4, 1, "B"],
      [0, 3, "C"],
      [-1, 2, "D"],
    ].forEach(([x, y, id]) => {
      s += pk(id, circ(X(x), Y(y), 13, "p") + tx(X(x), Y(y) + 5, id, { s: 13 }));
    });
    s += tx(8, 16, "key arrows A to D, all from the origin", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(330, 240, s, "A blue query arrow (2, 2) and four grey key arrows A (1,1), B (4,1), C (0,3), D (-1,2)");
  }

  // A2: three panels of softmax weights
  function figWeightPanels() {
    const sets = [
      ["A", [4, 2, 0]],
      ["B", [2, 1, 0]],
      ["C", [1, 0.5, 0]],
    ];
    let s = "";
    sets.forEach(([id, sc], p) => {
      const x0 = 6 + p * 112,
        w = softmax(sc);
      let g = rc(x0, 8, 104, 160, "p", { r: 10 }) + tx(x0 + 52, 28, `Panel ${id}`, { s: 13 });
      w.forEach((v, i) => {
        const h = v * 100,
          bx = x0 + 12 + i * 29;
        g +=
          `<rect x="${bx}" y="${f1(138 - h)}" width="24" height="${f1(h)}" rx="3" fill="var(--blue)"/>` +
          tx(bx + 12, 132 - h, v.toFixed(2), { s: 11 }) +
          tx(bx + 12, 156, `k${i + 1}`, { s: 11, c: "var(--text-faint)" });
      });
      s += pk(id, g);
    });
    return svg(340, 176, s, "Three bar panels of attention weights over three keys");
  }

  // A3: heatmap of attention received
  function figHeat() {
    const toks = ["the", "cat", "sat", "down"],
      M = [
        [0.1, 0.5, 0.3, 0.1],
        [0.05, 0.15, 0.7, 0.1],
        [0.1, 0.55, 0.25, 0.1],
        [0.05, 0.55, 0.3, 0.1],
      ];
    const x0 = 78,
      y0 = 62,
      cw = 56,
      ch = 38;
    let s =
      tx(8, 16, "Rows: the token that is looking.", { a: "start", s: 11, c: "var(--text-dim)" }) +
      tx(8, 32, "Columns: the token looked at. Each row adds to 1.", { a: "start", s: 11, c: "var(--text-dim)" });
    toks.forEach(
      (t, c) =>
        (s += pk(
          `c${c}`,
          rc(x0 + c * cw + 2, y0 - 26, cw - 4, 22, "p", { r: 7 }) + tx(x0 + c * cw + cw / 2, y0 - 10, t, { s: 12 }),
        )),
    );
    M.forEach((row, r) => {
      s += tx(x0 - 8, y0 + r * ch + ch / 2 + 4, toks[r], { a: "end", s: 12, c: "var(--text-dim)" });
      row.forEach(
        (v, c) =>
          (s +=
            `<rect x="${x0 + c * cw + 2}" y="${y0 + r * ch + 2}" width="${cw - 4}" height="${ch - 4}" rx="5" fill="${tint("var(--blue)", Math.round(v * 120))}" stroke="var(--line)" stroke-width="1"/>` +
            tx(x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 4, v.toFixed(2), { s: 12 })),
      );
    });
    return svg(
      310,
      y0 + 4 * ch + 4,
      s,
      "Four by four heatmap of attention weights between the tokens the, cat, sat, down",
    );
  }

  B.add("a10-attn", [
    {
      type: "pick",
      q: "One token has the query <b>q = (2, 2)</b> (blue). Its score for a key is the dot product q · k. Tap the key that gets the <b>highest score</b>.",
      fig: figArrows(),
      a: "B",
      hint: "Dot product = (q across × k across) + (q up × k up).",
      why: "q · B = 2×4 + 2×1 = 10, q · C = 6, q · A = 4 and q · D = 2. A points exactly the same way as q but is short, and B is longer and a little off-angle. The dot product rewards both alignment and size, so it is not the same as “whose tip is nearest” (A's is).",
    },
    {
      type: "pick",
      q: "A head with d_k = 4 gets raw dot-product scores [4, 2, 0] for three keys. It divides by √d_k before softmax. Tap the panel that shows the <b>final weights</b>.",
      fig: figWeightPanels(),
      a: "B",
      hint: "√4 = 2, so the scores become 2, 1, 0 (and e ≈ 2.7).",
      why: "Dividing by √4 = 2 turns [4, 2, 0] into [2, 1, 0], whose softmax is about 0.67, 0.24, 0.09 (panel B). Panel A skipped the scaling, so it is too sharp. Panel C divided by d_k = 4 instead of √d_k, a common slip, which over-flattens it.",
    },
    {
      type: "pick",
      q: "Four tokens attend to each other with no mask. The biggest single cell is cat → sat (0.70). Add up each column in your head. Which token receives the most attention <b>overall</b>? Tap its header.",
      fig: figHeat(),
      a: "c1",
      hint: "Column “cat”: 0.50 + 0.15 + 0.55 + 0.55. Column “sat”: 0.30 + 0.70 + 0.25 + 0.30.",
      why: "Reading down a column gives how much attention a token receives: cat gets 0.50 + 0.15 + 0.55 + 0.55 = 1.75, sat only 1.55 even though it holds the largest single cell. Reading along a row instead shows who one token listens to, and each row adds to 1. Column totals do not have to.",
    },
    {
      type: "bug",
      q: "Rows of <code>s</code> are queries, columns are keys. <code>softmax(s, axis=k)</code> makes the numbers along axis <i>k</i> add up to 1 (axis 0 runs down the rows, axis 1 runs along them). The code runs without error, but a token's weights no longer add up to 1. Click the faulty line.",
      code: [
        "def attend(Q, K, V, d_k):",
        "    s = Q @ K.T / math.sqrt(d_k)",
        "    w = softmax(s, axis=0)",
        "    return w @ V",
      ],
      a: 2,
      why: "Each query needs its shares across <b>all the keys</b>, which means normalising along each row, <code>axis=1</code> (or −1). With <code>axis=0</code> each column adds to 1 instead, so a token's weights over the keys can total anything.",
    },
  ]);

  /* ================================================================== a8-chain (workshop) ================================================================== */

  // C1: cards after a Verify
  function figVerifiedChain() {
    const cards = [
      ["Genesis", "sealed", "g"],
      ["Block 1", "sealed", "g"],
      ["Block 2", "seal broken", "r"],
      ["Block 3", "after a break", "n"],
    ];
    let s = "";
    cards.forEach(([t, st, k], i) => {
      const x = 6 + i * 84;
      s += pk(
        `b${i}`,
        rc(x, 12, 78, 62, k, { r: 10, d: i === 3 ? "5 4" : "", st: i === 3 ? "var(--rose)" : undefined }) +
          tx(x + 39, 34, t, { s: 13 }) +
          tx(x + 39, 58, st, { s: 11, c: k === "g" ? "var(--teal-ink)" : "var(--rose-ink)" }),
      );
    });
    const link = (x, ok, t) =>
      (ok ? tick(x, 102) : cross(x, 100)) +
      tx(x + 12, 106, t, { a: "start", s: 12, c: ok ? "var(--teal-ink)" : "var(--rose-ink)" });
    s +=
      tx(8, 106, "Links:", { a: "start", s: 12, c: "var(--text-dim)" }) +
      link(70, true, "0 to 1") +
      link(142, true, "1 to 2") +
      link(214, false, "2 to 3: prev ≠ hash");
    return svg(
      340,
      118,
      s,
      "Four block cards after Verify: block 2 has a broken seal and the link from block 2 to block 3 is broken",
    );
  }

  // C2: dot plot of tries
  function figTriesDots() {
    const need = 2,
      tries = [];
    for (let i = 0; i < 16; i++) {
      let n = 1;
      while (!scrambled(`${n}|blk ${i}`).startsWith("0".repeat(need))) n++;
      tries.push(n);
    }
    const X = (v) => 22 + (v / 800) * 296,
      cnt = {};
    let s = ln(22, 150, 318, 150, { c: "var(--text-faint)", w: 2 });
    [0, 200, 400, 600, 800].forEach(
      (v) =>
        (s +=
          ln(X(v), 150, X(v), 155, { c: "var(--text-faint)", w: 2 }) +
          tx(X(v), 170, v, { s: 11, c: "var(--text-dim)" })),
    );
    tries.forEach((t) => {
      const b = Math.floor(t / 100);
      cnt[b] = (cnt[b] || 0) + 1;
      s += circ(X(b * 100 + 50), 150 - 9 - (cnt[b] - 1) * 17, 7, "b", {
        f: "var(--blue)",
        st: "var(--blue-ink)",
        sw: 1.5,
      });
    });
    s +=
      ln(X(256), 24, X(256), 150, { c: "var(--amber)", w: 2.5, d: "5 4" }) +
      tx(X(256) + 5, 34, "16 × 16 = 256", { a: "start", s: 12, c: "var(--amber-ink)" });
    s += tx(170, 190, "nonces tried before the hash started with 00", { s: 12, c: "var(--text-dim)" });
    return svg(340, 200, s, "Dot plot of the number of nonces tried for 16 blocks at difficulty 2");
  }

  // C4: before and after Re-link, built by really mining a chain
  function figRelink() {
    const DATA = ["genesis", "alice pays bob 5", "bob pays carol 2", "carol pays dave 1"],
      bl = DATA.map((d, i) => ({ i, data: d, nonce: 0, prev: "00000000" }));
    mineBlock(bl[0], 2);
    for (let i = 1; i < 4; i++) {
      bl[i].prev = blockHash(bl[i - 1]);
      mineBlock(bl[i], 2);
    }
    const stale = bl.map((b) => ({ ...b }));
    stale[1].data = "alice pays mallory 50";
    const linked = stale.map((b) => ({ ...b }));
    for (let i = 1; i < 4; i++) linked[i].prev = blockHash(linked[i - 1]);
    const mark = (x, y, ok) => (ok ? tick(x, y) : cross(x, y - 1));
    const panel = (y0, title, ch) => {
      let s =
        tx(8, y0, title, { a: "start", s: 13 }) +
        tx(86, y0 + 20, "prev", { s: 11, c: "var(--text-faint)" }) +
        tx(182, y0 + 20, "own hash", { s: 11, c: "var(--text-faint)" }) +
        tx(262, y0 + 20, "link", { s: 11, c: "var(--text-faint)" }) +
        tx(306, y0 + 20, "seal", { s: 11, c: "var(--text-faint)" });
      for (let i = 1; i < 4; i++) {
        const b = ch[i],
          h = blockHash(b),
          y = y0 + 28 + (i - 1) * 26,
          linkOk = b.prev === blockHash(ch[i - 1]),
          sealOk = zeros(h) >= 2;
        s +=
          tx(8, y + 17, `block ${i}`, { a: "start", s: 12, c: "var(--text-dim)" }) +
          tx(86, y + 17, b.prev, { m: 1, s: 12, c: linkOk ? "var(--ink)" : "var(--rose-ink)" }) +
          tx(182, y + 17, h, { m: 1, s: 12, c: sealOk ? "var(--teal-ink)" : "var(--rose-ink)" }) +
          mark(262, y + 13, linkOk) +
          mark(306, y + 13, sealOk);
      }
      return s;
    };
    return svg(
      330,
      252,
      panel(16, "After editing block 1", stale) +
        ln(8, 128, 322, 128, { c: "var(--line)", w: 1.5 }) +
        panel(148, "After pressing Re-link, no mining", linked),
      "Two small tables of prev and hash values for blocks 1 to 3, before and after re-linking",
    );
  }

  // C5: a timeline of the repair bill
  function figRepairBar() {
    let s = tx(8, 16, "After editing block 1", { a: "start", s: 12, c: "var(--text-dim)" });
    ["Re-mine block 1", "Re-mine block 2", "Re-mine block 3"].forEach((t, i) => {
      s +=
        rc(8 + i * 98, 26, 94, 44, "a", { r: 8 }) +
        lines(55 + i * 98, 46, [t.split(" ").slice(0, 2).join(" "), t.split(" ").slice(2).join(" ")], {
          s: 12,
          c: "var(--amber-ink)",
          lh: 14,
        });
    });
    s += rc(306, 26, 26, 44, "g", { r: 8 }) + tx(319, 52, "✓", { s: 15, c: "var(--teal-ink)" });
    s +=
      arrow(8, 94, 330, 94, "var(--text-faint)") +
      tx(8, 112, "time", { a: "start", s: 11, c: "var(--text-faint)" }) +
      tx(319, 112, "check", { a: "end", s: 11, c: "var(--text-faint)" });
    s += tx(170, 134, "each block needs a hash starting with 00", { s: 12, c: "var(--text-dim)" });
    return svg(
      340,
      144,
      s,
      "Timeline: after the edit, three blocks are re-mined one after another, then a quick check at the end",
    );
  }

  // C6: the Verify walk as a flow chart
  function figVerifyFlow() {
    const S = [
      ["l1", "1 · Block 1", ["link: prev is", "genesis hash?"]],
      ["s1", "2 · Block 1", ["seal: hash", "starts 00?"]],
      ["l2", "3 · Block 2", ["link: prev is", "block 1's hash?"]],
      ["s2", "4 · Block 2", ["seal: hash", "starts 00?"]],
      ["l3", "5 · Block 3", ["link: prev is", "block 2's hash?"]],
      ["s3", "6 · Block 3", ["seal: hash", "starts 00?"]],
    ];
    let s = tx(172, 14, "Walk order 1 to 6. It stops at the first failure.", { s: 12, c: "var(--text-dim)" });
    S.forEach(([id, b, t], i) => {
      const col = i % 3,
        row = i < 3 ? 0 : 1,
        x = 6 + col * 114,
        y = 26 + row * 82;
      s += pk(
        id,
        rc(x, y, 100, 58, "p") +
          tx(x + 50, y + 16, b, { s: 11.5, c: "var(--text-dim)" }) +
          lines(x + 50, y + 33, t, { s: 11, lh: 13 }),
      );
      if (col < 2) s += arrow(x + 102, y + 29, x + 112, y + 29, "var(--text-faint)");
    });
    s += `<path d="M 290 86 L 290 98 L 56 98 L 56 104" fill="none" stroke="var(--text-faint)" stroke-width="2" stroke-linejoin="round"/><polygon points="56,108 51,100 61,100" fill="var(--text-faint)"/>`;
    return svg(
      332,
      172,
      s,
      "Flow chart of six checks, a link check then a seal check for each of blocks 1, 2 and 3, in order",
    );
  }

  B.add("a8-chain", [
    {
      type: "pick",
      q: "Someone edited the data of exactly <b>one</b> block, then you pressed Verify. The chain now looks like this. Which block's data was edited? Tap it.",
      fig: figVerifiedChain(),
      a: "b2",
      why: "Editing a block changes its own hash, so its seal breaks (block 2 shows ✗ seal broken) and the next block's stored prev no longer matches (the 2→3 link shows prev ≠ hash). Block 3 only looks bad because it points at a block whose hash changed. Block 3's own data is fine.",
    },
    {
      type: "mcq",
      q: "Sixteen blocks were each mined with the same puzzle: a hash starting with <b>00</b>. The dots show how many nonces each block needed. What does the spread tell you?",
      fig: figTriesDots(),
      o: [
        "Every guess is an independent 1-in-256 shot, so luck swings widely around about 256",
        "The quick blocks used a smarter nonce order that the slow blocks could have copied too",
        "The difficulty was lowered for the quick blocks and raised again for the slow ones",
        "Mining gets steadily easier as the chain grows, so later blocks should always be quicker",
      ],
      a: 0,
      why: "Each nonce is a fresh, unpredictable hash with a 1-in-256 chance of starting 00, so the count to the first win varies a lot (some blocks got lucky in 5 tries, one needed over 700), but averages near 256. There is no better strategy than guessing, and the difficulty here never changed.",
    },
    {
      type: "cat",
      q: "The target is two leading hex zeros, <b>00</b>. Sort each hash by whether it seals a block.",
      buckets: ["Seals at 2 zeros", "Doesn't seal"],
      items: [
        ["<code>00a32139</code>", 0],
        ["<code>0a22e6db</code>", 1],
        ["<code>80378a61</code>", 1],
        ["<code>000d98d4</code>", 0],
        ["<code>0c257d45</code>", 1],
        ["<code>00e9a037</code>", 0],
      ],
      why: "Only zeros at the very <b>start</b> count, and you need two of them in a row. <code>0a22e6db</code> and <code>0c257d45</code> have one, <code>80378a61</code> has a zero in the wrong place, and <code>000d98d4</code> has three, which is more than enough.",
    },
    {
      type: "mcq",
      q: "Block 1 was edited and the chain mined as in the workshop. After pressing <b>Re-link, no mining</b> every prev matches the block before it, yet blocks 2 and 3 now fail their seals. Why?",
      fig: figRelink(),
      o: [
        "prev is part of what a block hashes, so fixing it changed the hash and the zeros vanished",
        "Re-link wipes every nonce, so each block has to be mined again from nothing at all, in order",
        "Only block 1 was ever edited, so the seals on later blocks switch themselves off with it too",
        "Re-link copies the wrong hash into each prev, so the links are still broken in the picture",
      ],
      a: 0,
      why: "A block's hash is computed from its nonce, data <b>and prev</b>. Block 2's prev changed, so its hash changed to <code>3b1fd712</code>, which no longer starts with 00 (the nonce was found for the old prev). The same ripples to block 3. Fixing pointers is free; the proof of work is not.",
    },
    {
      type: "slider",
      q: "After the edit you must re-mine blocks 1, 2 <b>and</b> 3 in turn, each needing a hash that starts <b>00</b>. About how many hashes will that take in total, on average?",
      fig: figRepairBar(),
      min: 0,
      max: 1500,
      step: 50,
      ans: 750,
      tol: 150,
      unit: " hashes",
      hint: "Two hex zeros means 16 × 16 tries for one block. Then ×3.",
      why: "Each block needs about 16 × 16 = 256 guesses, so three blocks need about 3 × 256 = 768. Checking the finished chain costs only a hash or two per block. That gap, hundreds of guesses against one hash to verify, is what makes history expensive to rewrite and cheap to audit.",
    },
    {
      type: "pick",
      q: "Block 1's data was edited and nothing has been re-mined. You press Verify, which walks the checks in order and stops at the first failure. Which check is the first to fail? Tap it.",
      fig: figVerifyFlow(),
      a: "s1",
      why: "Block 1's link check still passes (its prev is the genesis hash, which did not change). Its own hash changed, so its seal fails and the walk stops there. Blocks 2 and 3 have broken links too, but Verify never gets that far, which is why it can report the break after just a couple of hashes.",
    },
  ]);

  /* ================================================================== a9-mix (workshop) ================================================================== */

  // M1: faders and three candidate spectra
  function figMixerBoard() {
    const fader = (y, name, f, a) => {
      const tr = (x0, v, vmax, lab) =>
        ln(x0, y + 16, x0 + 100, y + 16, { c: "var(--line-2)", w: 4 }) +
        circ(x0 + (v / vmax) * 100, y + 16, 8, "b", { f: "var(--blue)", st: "var(--blue-ink)", sw: 1.5 }) +
        tx(x0 + 50, y + 40, lab, { s: 12, c: "var(--text-dim)" });
      return (
        tx(8, y + 21, name, { a: "start", s: 13 }) + tr(80, f, 12, `frequency ${f} Hz`) + tr(214, a, 1, `strength ${a}`)
      );
    };
    let s = fader(4, "Wave 1", 3, 1) + fader(56, "Wave 2", 8, 0.5);
    const opts = [
      [
        "A",
        [
          [3, 0.5],
          [8, 1],
        ],
      ],
      [
        "B",
        [
          [3, 1],
          [11, 0.5],
        ],
      ],
      [
        "C",
        [
          [3, 1],
          [8, 0.5],
        ],
      ],
    ];
    opts.forEach(([id, bars], p) => {
      const x0 = 6 + p * 112;
      let g = rc(x0, 116, 104, 100, "p", { r: 10 }) + tx(x0 + 52, 134, `Spectrum ${id}`, { s: 12 });
      for (let k = 0; k <= 12; k++) {
        const b = bars.find((q) => q[0] === k),
          h = b ? b[1] * 56 : 0;
        g += `<rect x="${x0 + 8 + k * 7.4}" y="${f1(200 - h)}" width="5" height="${f1(Math.max(h, 1.5))}" rx="1.5" fill="${b ? "var(--blue)" : "var(--line-2)"}"/>`;
      }
      g +=
        tx(x0 + 8, 212, "0", { a: "start", s: 10, c: "var(--text-faint)" }) +
        tx(x0 + 98, 212, "12 Hz", { a: "end", s: 10, c: "var(--text-faint)" });
      s += pk(id, g);
    });
    return svg(
      340,
      222,
      s,
      "A mixer with two waves (3 Hz at strength 1, 8 Hz at strength 0.5) and three candidate spectra",
    );
  }

  // M2: grid of true frequency against sample rate
  function figAliasGrid() {
    const fs = [16, 32, 64],
      fr = [5, 11, 19, 27],
      x0 = 74,
      y0 = 56,
      cw = 80,
      ch = 38;
    let s =
      tx(x0 + 120, 16, "samples per second", { s: 12, c: "var(--text-dim)" }) +
      tx(8, 16, "tone", { a: "start", s: 12, c: "var(--text-dim)" });
    fs.forEach((v, c) => (s += tx(x0 + c * cw + cw / 2, y0 - 10, `${v} /s`, { s: 13 })));
    fr.forEach((f, r) => {
      s += tx(x0 - 10, y0 + r * ch + ch / 2 + 5, `${f} Hz`, { a: "end", s: 13 });
      fs.forEach(
        (v, c) =>
          (s += pk(
            `${f}-${v}`,
            rc(x0 + c * cw + 3, y0 + r * ch + 3, cw - 6, ch - 6, "p", { r: 8 }) +
              tx(x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 5, "?", { s: 14, c: "var(--text-faint)" }),
          )),
      );
    });
    return svg(
      320,
      y0 + 4 * ch + 6,
      s,
      "A grid with four tone frequencies down the side and three sampling rates across the top",
    );
  }

  // M3: a spectrum with a noise floor
  function figFloor() {
    const amps = [
      0.002, 0.051, 0.032, 0.986, 0.04, 0.012, 0.035, 0.288, 0.013, 0.029, 0.018, 0.054, 0.176, 0.05, 0.007, 0.02, 0.0,
    ];
    const X = (k) => 22 + k * 18,
      Yb = 166,
      sc = 130;
    let s =
      ln(14, Yb, 328, Yb, { c: "var(--text-faint)", w: 2 }) +
      ln(14, Yb - 0.1 * sc, 328, Yb - 0.1 * sc, { c: "var(--rose)", w: 2, d: "5 4" }) +
      tx(326, Yb - 0.1 * sc - 6, "noise floor", { a: "end", s: 11, c: "var(--rose-ink)" });
    amps.forEach((a, k) => {
      s += pk(
        String(k),
        `<rect x="${X(k) - 9}" y="20" width="18" height="${Yb - 20}" fill="transparent"/>` +
          ln(X(k), Yb, X(k), Yb - Math.max(a * sc, 1.5), { c: "var(--blue)", w: 3 }) +
          circ(X(k), Yb - Math.max(a * sc, 1.5), 4.5, "b", { f: "var(--blue)", st: "var(--blue-ink)", sw: 1 }),
      );
    });
    for (let k = 0; k <= 16; k += 2) s += tx(X(k), Yb + 16, k, { s: 11, c: "var(--text-dim)" });
    s += tx(170, Yb + 34, "frequency (Hz)", { s: 12, c: "var(--text-dim)" });
    return svg(340, 206, s, "Spectrum of a mystery signal with a dashed noise floor and several bars rising above it");
  }

  // M4: before and after one even/odd split
  function figSplitAreas() {
    let s =
      tx(58, 16, "One 16-point DFT", { s: 12, c: "var(--text-dim)" }) +
      rc(10, 26, 96, 96, "b", { r: 6 }) +
      tx(58, 79, "16 × 16", { s: 15, c: "var(--blue-ink)" });
    s += lines(58, 142, ["every output reads", "all 16 samples"], { s: 11, c: "var(--text-faint)", lh: 14 });
    s += tx(214, 16, "Split, then combine", { s: 12, c: "var(--text-dim)" });
    s +=
      rc(150, 26, 60, 60, "g", { r: 5 }) +
      tx(180, 61, "8 × 8", { s: 13, c: "var(--teal-ink)" }) +
      rc(218, 26, 60, 60, "g", { r: 5 }) +
      tx(248, 61, "8 × 8", { s: 13, c: "var(--teal-ink)" });
    s +=
      tx(180, 102, "evens", { s: 11, c: "var(--text-faint)" }) +
      tx(248, 102, "odds", { s: 11, c: "var(--text-faint)" });
    s +=
      rc(150, 112, 128, 14, "a", { r: 5 }) +
      lines(214, 142, ["combine: one product", "for each of 8 bin pairs"], { s: 11, c: "var(--amber-ink)", lh: 14 });
    return svg(300, 164, s, "A single 16 by 16 square against two 8 by 8 squares plus a thin combine strip");
  }

  B.add("a9-mix", [
    {
      type: "pick",
      q: "The mixer holds two waves: <b>Wave 1</b> at 3 Hz with strength 1 and <b>Wave 2</b> at 8 Hz with strength 0.5. Which spectrum will it show? Tap it.",
      fig: figMixerBoard(),
      a: "C",
      why: "Each wave gets its own bar: frequency decides where the bar stands and strength decides how tall it is. So there is a full bar at 3 Hz and a half-height one at 8 Hz (C). A has the strengths swapped, and B has moved Wave 2 to 11 Hz (3 + 8), as if frequencies added up. They don't: waves add, frequencies stay.",
    },
    {
      type: "pick",
      q: "You sample tones of 5, 11, 19 and 27 Hz at 16, 32 and 64 samples per second. Tap <b>every</b> cell where the bar will show up at the <b>wrong</b> frequency.",
      fig: figAliasGrid(),
      a: ["11-16", "19-16", "27-16", "19-32", "27-32"],
      hint: "A tone shows correctly only if it is below half the sampling rate: 8, 16 or 32 Hz.",
      why: "The limit is half the sampling rate: 8 Hz at 16/s, 16 Hz at 32/s and 32 Hz at 64/s. At 16/s only 5 Hz is safe (11, 19 and 27 fold back to 5, 3 and 5). At 32/s, 19 and 27 fold to 13 and 5. At 64/s everything is below 32 Hz, so all four are right. Note 27 Hz at 16/s lands on 5 Hz: it impersonates the real 5 Hz tone.",
    },
    {
      type: "pick",
      q: "A mystery signal is sampled for one second at 32 samples per second, and its spectrum is shown. Tap <b>every</b> frequency that is really in the signal, not just noise.",
      fig: figFloor(),
      a: ["3", "7", "12"],
      why: "The dashed line is the noise floor: the wobble a few small random bars make by chance. Three bars clearly rise above it, at 3, 7 and 12 Hz. The 12 Hz one is short but it is far above the floor, so it counts. A short bar means a quiet wave, not a missing one.",
    },
    {
      type: "slider",
      q: "A 16-point DFT costs about 16 × 16 multiplications. Split the samples into evens and odds, run <b>two</b> 8-point DFTs, then combine with one product for each of the 8 bin pairs. About how many multiplications is that in total?",
      fig: figSplitAreas(),
      min: 0,
      max: 300,
      step: 4,
      ans: 136,
      tol: 20,
      unit: " products",
      hint: "8 × 8 = 64, and there are two of them. Then add 8.",
      why: "Two 8-point DFTs cost 2 × 64 = 128, and combining adds 8 more products: 136, roughly half of 256. Split again and again and the saving compounds, which is how the FFT reaches N log N.",
    },
    {
      type: "bug",
      q: "A wave of <code>f</code> Hz sampled <code>fs</code> times per second has its samples at times <code>t / fs</code>. This code should give one second of samples, but the wave comes out wildly wrong. Click the faulty line.",
      code: [
        "def sample(f, fs):",
        "    out = []",
        "    for t in range(fs):",
        "        a = 2 * pi * f * t * fs",
        "        out.append(sin(a))",
        "    return out",
      ],
      a: 3,
      why: "Sample number t is taken at time t / fs seconds, so the angle is 2π × f × t / fs. Multiplying by fs makes the wave race along, faster the more samples you take. It should divide.",
    },
    {
      type: "match",
      q: "In the mixer something changes on screen. Match each thing you see to what you did.",
      pairs: [
        ["A bar jumps to a lower frequency than the wave you set", "Sampled at less than twice its frequency"],
        ["A bar gets taller but stays in place", "Raised that wave's strength"],
        ["A bar slides sideways at the same height", "Changed that wave's frequency"],
        ["A bar disappears from the spectrum", "Set that wave's strength to zero"],
      ],
      why: "Height tracks strength and position tracks frequency. A bar standing at the wrong place when you set nothing wrong is the alias warning: the wave is above half the sampling rate and has folded back.",
    },
  ]);

  /* ================================================================== a10-code (workshop) ================================================================== */

  // X1: printed scores and weights
  function figScoreTable() {
    const rows = [
        [0, 0, 0],
        [-2, 0, 0],
        [1, 1, 0],
        [2, 0, 0],
      ],
      shown = rows.map((r) => softmax(r).map((v) => v.toFixed(2)));
    shown[2] = ["0.50", "0.50", "0.00"];
    let s =
      tx(16, 16, "scores", { a: "start", s: 11, c: "var(--text-faint)" }) +
      tx(160, 16, "weights printed", { a: "start", s: 11, c: "var(--text-faint)" });
    rows.forEach((r, i) => {
      const y = 24 + i * 44;
      s += pk(
        `r${i}`,
        rc(6, y, 328, 38, "p") +
          tx(16, y + 24, `[${r.join(", ")}]`.replace(/-/g, "−"), { a: "start", s: 14, m: 1 }) +
          tx(160, y + 24, `[${shown[i].join(", ")}]`, { a: "start", s: 14, m: 1 }),
      );
    });
    return svg(
      340,
      204,
      s,
      "Four rows each showing three scores and the three softmax weights a student's code printed",
    );
  }

  // X2: two pipelines for softmax
  function figSoftmaxPipes() {
    const box = (x, y, k, a, b, c) =>
      rc(x, y, 96, 62, k) + lines(x + 48, y + 20, [a, b, c].filter(Boolean), { s: 11, lh: 14 });
    let s = tx(8, 14, "Naive", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      box(8, 22, "p", "scores", "1000, 1000,", "998") +
      arrow(106, 53, 122, 53) +
      box(124, 22, "r", "e^score", "overflow!", "") +
      arrow(222, 53, 238, 53) +
      box(240, 22, "n", "divide by", "the total", "(never reached)");
    s += tx(8, 108, "Subtract the largest score first", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      box(8, 116, "p", "minus the max", "0, 0, −2", "") +
      arrow(106, 147, 122, 147) +
      box(124, 116, "p", "e^score", "1, 1, 0.14", "") +
      arrow(222, 147, 238, 147) +
      box(240, 116, "g", "divide by", "the total", "0.47 0.47 0.06");
    return svg(
      344,
      186,
      s,
      "Naive softmax fails at the exponential on scores near 1000; subtracting the largest score first gives weights 0.47, 0.47, 0.06",
    );
  }

  // X3: where can a blended output land?
  function figHull() {
    const X = (x) => 40 + x * 62,
      Y = (y) => 262 - y * 62;
    let s =
      ln(X(0), Y(0), X(4), Y(0), { c: "var(--line-2)", w: 1.5 }) +
      ln(X(0), Y(0), X(0), Y(4), { c: "var(--line-2)", w: 1.5 });
    for (let v = 1; v <= 4; v++)
      s +=
        tx(X(v), Y(0) + 15, v, { s: 11, c: "var(--text-faint)" }) +
        tx(X(0) - 9, Y(v) + 4, v, { s: 11, c: "var(--text-faint)", a: "end" });
    [
      [3, 0, "v1 (3, 0)", 1],
      [0, 3, "v2 (0, 3)", 1],
      [3, 3, "v3 (3, 3)", 1],
    ].forEach(([x, y, t]) => {
      s += `<rect x="${X(x) - 6}" y="${Y(y) - 6}" width="12" height="12" rx="2" fill="var(--violet)" stroke="var(--violet-lip)" stroke-width="1.5"/>`;
    });
    s +=
      tx(X(3) + 12, Y(0) - 2, "v1", { a: "start", s: 12, c: "var(--violet-ink)" }) +
      tx(X(0) + 12, Y(3) - 4, "v2", { a: "start", s: 12, c: "var(--violet-ink)" }) +
      tx(X(3), Y(3) - 12, "v3", { s: 12, c: "var(--violet-ink)" });
    [
      ["A", 2, 2],
      ["B", 1, 1],
      ["C", 3.55, 2.4],
      ["D", 1, 2.2],
      ["E", 2.4, 0.2],
      ["F", 2.5, 2.5],
    ].forEach(([id, x, y]) => (s += pk(id, circ(X(x), Y(y), 12, "p") + tx(X(x), Y(y) + 5, id, { s: 13 }))));
    return svg(
      336,
      284,
      s,
      "Three value vectors v1 (3,0), v2 (0,3) and v3 (3,3) as purple squares and six candidate outputs A to F",
    );
  }

  // X4: a scale from shared evenly to winner takes all
  function figGauge() {
    let s = ln(20, 40, 320, 40, { c: "var(--text-faint)", w: 3 });
    [
      [0.333, "⅓"],
      [0.5, "½"],
      [0.75, "¾"],
      [1, "1"],
    ].forEach(([v, t]) => {
      const x = 20 + ((v - 0.333) / 0.667) * 300;
      s +=
        ln(x, 33, x, 47, { c: "var(--text-faint)", w: 2 }) +
        tx(x, 64, t, { s: 13, c: "var(--text-dim)", a: v === 1 ? "end" : v < 0.4 ? "start" : "middle" });
    });
    s +=
      tx(20, 18, "even shares", { a: "start", s: 12, c: "var(--blue-ink)" }) +
      tx(320, 18, "winner takes (almost) all", { a: "end", s: 12, c: "var(--amber-ink)" }) +
      tx(170, 84, "weight of the biggest share, 3 tokens", { s: 11, c: "var(--text-faint)" });
    return svg(340, 94, s, "A scale for the biggest softmax weight, from one third to one");
  }

  // X6: matrix shapes in one attention head
  function figShapes() {
    const u = 20,
      mat = (id, x, y, r, c, name, wrong) =>
        pk(
          id,
          rc(x, y, c * u, r * u, wrong ? "p" : "p", { r: 5 }) +
            tx(x + (c * u) / 2, y + (r * u) / 2 - 2, name, { s: 12 }) +
            tx(x + (c * u) / 2, y + (r * u) / 2 + 13, `${r}×${c}`, { s: 12, c: "var(--text-dim)" }),
        );
    let s = tx(8, 14, "3 tokens, d_k = 4, values of 2 numbers. Shape = rows × columns.", {
      a: "start",
      s: 11,
      c: "var(--text-dim)",
    });
    s +=
      mat("Q", 10, 34, 3, 4, "Q") +
      tx(104, 70, "×", { s: 18, c: "var(--text-faint)" }) +
      mat("Kt", 122, 24, 4, 3, "Kᵀ") +
      tx(196, 70, "→", { s: 18, c: "var(--text-faint)" }) +
      mat("scores", 214, 34, 3, 3, "scores");
    s += tx(244, 112, "↓ softmax", { s: 11, c: "var(--text-faint)" });
    s +=
      mat("weights", 10, 134, 3, 3, "weights") +
      tx(88, 170, "×", { s: 18, c: "var(--text-faint)" }) +
      mat("V", 104, 134, 3, 2, "V") +
      tx(160, 170, "=", { s: 18, c: "var(--text-faint)" }) +
      mat("out", 176, 134, 3, 3, "out");
    return svg(300, 210, s, "Six matrices Q, K transposed, scores, weights, V and out with their shapes");
  }

  B.add("a10-code", [
    {
      type: "pick",
      q: "A student prints three scores and the three softmax weights for four different tokens. One row <b>cannot</b> be the output of a correct softmax, whatever the code looks like. Tap it.",
      fig: figScoreTable(),
      a: "r2",
      why: "Softmax turns every score into e^score, which is always positive, so no weight can be exactly 0 (a masked score of −∞ is the only way to get there). Scores [1, 1, 0] should give about 0.42, 0.42, 0.16. The printed 0.50, 0.50, 0.00 looks like each score divided by the total of the scores. Row 2's negative score is fine: it just earns a small share.",
    },
    {
      type: "mcq",
      q: "Scores of 1000 overflow <code>math.exp</code>, so the lab subtracts the biggest score first. Why can that never change the final weights?",
      fig: figSoftmaxPipes(),
      o: [
        "Each term shrinks by the same factor, e to the max, so the final division cancels it",
        "It removes the largest score from the sum, which the other weights never really needed",
        "It rounds the scores so that they match exactly after the exponential step is taken",
        "It forces the weights to add to 1, which the divide step cannot manage on its own",
      ],
      a: 0,
      why: "e^(s − m) = e^s ÷ e^m. Every term gets divided by the same e^m, and so does the total, so the common factor cancels in the final division. The weights are identical, but the numbers stay small enough to compute. Without this step Python raises an OverflowError on <code>math.exp(1000)</code>.",
    },
    {
      type: "pick",
      q: "Three value vectors are fixed: v1 = (3, 0), v2 = (0, 3) and v3 = (3, 3). A token blends them with positive weights that add up to 1. Tap <b>every</b> candidate that no choice of weights could ever produce.",
      fig: figHull(),
      a: ["B", "C", "E"],
      hint: "A blend with weights adding to 1 stays inside the triangle with corners v1, v2 and v3. Which side is x + y = 3?",
      why: "A weighted average with positive weights summing to 1 always lands inside the triangle with corners v1, v2, v3 (x ≤ 3, y ≤ 3 and x + y ≥ 3). B (1, 1) and E (2.4, 0.2) have x + y below 3, and C sticks out past x = 3. A, D and F are inside. Attention can only mix its values, never invent something outside them.",
    },
    {
      type: "order",
      q: "A token's three keys give these score patterns (the other two scores are 0). Order them from the <b>most even</b> weights to the <b>sharpest</b>, judged by the biggest weight.",
      fig: figGauge(),
      hint: "e ≈ 2.7, e³ ≈ 20 and e⁶ ≈ 400. A score of −3 gives a tiny e⁻³ ≈ 0.05.",
      items: ["scores [0, 0, 0]", "scores [−3, 0, 0]", "scores [1, 0, 0]", "scores [3, 0, 0]", "scores [6, 0, 0]"],
      why: "Biggest weights: [0, 0, 0] gives ⅓ each; [−3, 0, 0] makes the first key almost invisible and the others share about 0.49 each; [1, 0, 0] gives 2.7 ÷ (2.7 + 2) ≈ 0.58; [3, 0, 0] gives about 0.91; [6, 0, 0] gives about 0.995. A lower score does not make the blend sharper, it just hands more to the rest.",
    },
    {
      type: "bug",
      q: "In the lab's blend step, <code>weights[j]</code> is token <code>j</code>'s share. This loop runs without any error but gives the wrong mix. Click the faulty line.",
      code: [
        "mix = [0] * len(V[0])",
        "for j in range(len(V)):",
        "    for d in range(len(V[0])):",
        "        mix[d] += weights[d] * V[j][d]",
      ],
      a: 3,
      why: "The share to use is token j's, <code>weights[j]</code>. The line indexes by <code>d</code>, the slot in the value vector, so it multiplies by the wrong weight (and fails with an IndexError whenever there are fewer tokens than slots). It should read <code>weights[j] * V[j][d]</code>.",
    },
    {
      type: "pick",
      q: "n = 3 tokens, d_k = 4 numbers per query and key, and each value vector has 2 numbers. Rows are tokens. One box in this attention head is drawn with the <b>wrong shape</b>. Tap it.",
      fig: figShapes(),
      a: "out",
      why: "The scores and weights are token against token, 3×3, and V is 3×2. Multiplying 3×3 by 3×2 gives 3 rows (one per token) and 2 columns (the length of a value vector), so <b>out</b> should be 3×2. A blend of value vectors can't be wider than the values themselves.",
    },
  ]);

  /* ================================================================== a11-picker (workshop) ================================================================== */

  // P1: decision flow
  function figToolFlow() {
    const Q = [
      ["Link every point as", "cheaply as possible?", "mst", ["MST", "Prim / Kruskal"]],
      ["An outline round", "scattered points?", "hull", ["Convex hull"]],
      ["Best mix under", "straight-line limits?", "lp", ["Linear", "programming"]],
      ["One goal, plus an honest", "estimate of distance left?", "astar", ["A*"]],
    ];
    let s = "";
    Q.forEach(([a, b, id, name], i) => {
      const y = 8 + i * 66;
      s +=
        rc(8, y, 190, 44, "b") +
        lines(103, y + 19, [a, b], { s: 12, lh: 15 }) +
        arrow(200, y + 22, 238, y + 22, "var(--teal)", 2.5) +
        tx(219, y + 14, "yes", { s: 11, c: "var(--teal-ink)" });
      s += pk(
        id,
        rc(242, y + 1, 108, 42, "g") +
          lines(296, y + (name.length > 1 ? 18 : 25), name, { s: 12, lh: 14, c: "var(--teal-ink)" }),
      );
      s += arrow(103, y + 46, 103, y + 64, "var(--rose)", 2.5) + tx(122, y + 59, "no", { s: 11, c: "var(--rose-ink)" });
    });
    s += pk("dijk", rc(8, 272, 190, 38, "g") + tx(103, 296, "Dijkstra", { s: 13, c: "var(--teal-ink)" }));
    return svg(
      356,
      318,
      s,
      "A decision flow chart: four yes/no questions lead to MST, convex hull, linear programming, A* or finally Dijkstra",
    );
  }

  // P2: the channel
  function figChannel() {
    const wire = (x1, x2) => ln(x1, 58, x2, 58, { c: "var(--text-faint)", w: 2 });
    let s =
      rc(6, 36, 62, 44, "n") +
      lines(37, 55, ["Text", "in"], { s: 12, lh: 14 }) +
      rc(272, 36, 62, 44, "n") +
      lines(303, 55, ["Text", "out"], { s: 12, lh: 14 });
    [84, 124, 220, 252].forEach((x) => (s += circ(x, 58, 15, "p") + tx(x, 63, "?", { s: 15, c: "var(--text-faint)" })));
    s += wire(68, 69) + wire(99, 109) + wire(139, 160) + wire(204, 205) + wire(235, 237) + wire(267, 272);
    s += `<polyline points="150,58 160,40 168,74 178,40 188,74 196,58" fill="none" stroke="var(--amber)" stroke-width="3" stroke-linejoin="round"/>`;
    s +=
      tx(173, 100, "noisy link: one bit may flip", { s: 12, c: "var(--amber-ink)" }) +
      tx(106, 28, "two steps before", { s: 11, c: "var(--text-dim)" }) +
      tx(236, 28, "two steps after", { s: 11, c: "var(--text-dim)" });
    return svg(
      340,
      112,
      s,
      "A channel: text goes through two steps, a noisy link where a bit may flip, then two more steps",
    );
  }

  // P3: three trees on the same six sites
  function figTrees() {
    const pos = { S: [24, 56], A: [84, 20], B: [84, 92], C: [188, 20], D: [188, 92], E: [264, 56] };
    const all = [
      ["S", "A", 4],
      ["S", "B", 6],
      ["A", "B", 1],
      ["A", "C", 6],
      ["B", "D", 3],
      ["C", "D", 3],
      ["C", "E", 5],
      ["D", "E", 4],
      ["B", "C", 7],
    ];
    const panels = [
      ["p1", "Panel 1", ["SA", "SB", "BD", "CD", "DE"]],
      ["p2", "Panel 2", ["SA", "AB", "BD", "AC", "DE"]],
      ["p3", "Panel 3", ["AB", "BD", "CD", "SA", "DE"]],
    ];
    let s = "";
    panels.forEach(([id, title, keep], p) => {
      const y0 = p * 118 + 6;
      let g = rc(4, y0, 292, 112, "p", { r: 10 }) + tx(14, y0 + 20, title, { a: "start", s: 12, c: "var(--text-dim)" });
      all.forEach(([a, b, w]) => {
        const on = keep.includes(a + b),
          [xa, ya] = pos[a],
          [xb, yb] = pos[b];
        g += ln(
          xa + 16,
          ya + y0 + 8,
          xb + 16,
          yb + y0 + 8,
          on ? { c: "var(--blue)", w: 4 } : { c: "var(--line)", w: 1.5, d: "3 4" },
        );
        if (on)
          g += tx((xa + xb) / 2 + 16 + (xa === xb ? 11 : 0), (ya + yb) / 2 + y0 + 8 + (xa === xb ? 4 : -6), w, {
            s: 12,
            c: "var(--blue-ink)",
          });
      });
      Object.entries(pos).forEach(
        ([k, [x, y]]) => (g += circ(x + 16, y + y0 + 8, 11, "p") + tx(x + 16, y + y0 + 13, k, { s: 12 })),
      );
      s += pk(id, g);
    });
    return svg(
      300,
      364,
      s,
      "Three spanning trees on the same six sites S, A, B, C, D, E with the link lengths on chosen links",
    );
  }

  B.add("a11-picker", [
    {
      type: "pick",
      q: "A library robot needs the quickest route from its dock to <b>every one</b> of 40 shelves. Travel times are never negative. Follow the flow chart and tap the tool you land on.",
      fig: figToolFlow(),
      a: "dijk",
      why: "Linking everything cheaply, wrapping points and mixing under limits are all different jobs, so the first three answers are no. A* needs one goal and an honest estimate of what is left, and here there are 40 goals, so the answer is also no. That leaves Dijkstra: quickest routes from one start to everywhere, when no cost is negative.",
    },
    {
      type: "order",
      q: "A newsletter is Huffman-compressed and Hamming-protected, then sent over a noisy link where one bit in a block may flip. Put the steps in the right order.",
      fig: figChannel(),
      items: [
        "Compress the text with Huffman",
        "Add Hamming parity bits",
        "Send it across the noisy link",
        "Use the parity checks to repair the flipped bit",
        "Decompress back to the newsletter",
      ],
      why: "Compression squeezes redundancy out, and error correction deliberately puts a little back, so compress first and protect second. Protecting first would let the compressor throw the parity bits away. At the far end it must go in reverse: repair the bit while the parity bits are still there, then decompress. A flipped bit inside compressed data would otherwise scramble everything after it.",
    },
    {
      type: "pick",
      q: "Six sites must be joined into one cable network with the <b>least cable overall</b>. Each panel keeps some of the same links (lengths shown). Tap the best panel.",
      fig: figTrees(),
      a: "p3",
      hint: "Add up the five lengths in each panel.",
      why: "Panel 3 totals 1 + 3 + 3 + 4 + 4 = 15, the cheapest tree: that is what Prim or Kruskal build. Panel 2 is Dijkstra's tree from S (4 + 1 + 3 + 6 + 4 = 18): every site gets its quickest route from S, but that is a different goal from the cheapest total. Panel 1 totals 4 + 6 + 3 + 3 + 4 = 20.",
    },
    {
      type: "order",
      q: "Put these jobs in order from the <b>fewest</b> basic steps to the most.",
      fig: figRuler(),
      hint: "Binary search ≈ 10 steps. FFT ≈ N log₂ N. Attention ≈ n². 2³² is about 4 billion.",
      items: [
        "Binary search through 1,024 sorted items",
        "Direct DFT of 32 samples (N²)",
        "FFT of 1,024 samples (N log₂ N)",
        "Attention scores for 1,024 tokens (n²)",
        "Trying every subset of 32 items (2³²)",
      ],
      why: "About 10 steps; 32² = 1,024; 1,024 × 10 ≈ 10,000; 1,024² ≈ 1 million; and 2³² ≈ 4.3 billion. Log, near-linear, quadratic and exponential growth are far apart: a million-fold jump between the FFT and attention at this size is nothing next to what the exponential brute force costs.",
    },
    {
      type: "cat",
      q: "Sort each tool by the kind of thing it hands back.",
      buckets: ["A score for each item", "A route or a network of links", "A string of bits"],
      items: [
        ["PageRank", 0],
        ["Attention weights", 0],
        ["Dijkstra", 1],
        ["Minimum spanning tree", 1],
        ["Huffman coding", 2],
        ["CRC check bits", 2],
        ["LZW", 2],
      ],
      why: "PageRank scores pages and attention weights score tokens. Dijkstra returns routes and an MST a set of links. Huffman and LZW return shorter bit strings and a CRC returns a few check bits. Knowing the output shape is the quickest way to rule tools out.",
    },
    {
      type: "pick",
      q: "A planner uses four tools. Three things then change in the data. Tap <b>every</b> cell where the tool will now give wrong answers.",
      fig: (function () {
        const rows = [
            "A road gets a negative cost",
            "The cost curve gets a second dip",
            "The distance estimate sometimes overshoots",
          ],
          cols = [
            ["Dijkstra", ""],
            ["A*", ""],
            ["MST", ""],
            ["Golden-", "section"],
          ],
          x0 = 148,
          y0 = 52,
          cw = 52,
          ch = 44;
        let s = "";
        cols.forEach(([a, b], c) => (s += lines(x0 + c * cw + cw / 2, y0 - 22, b ? [a, b] : [a], { s: 11, lh: 12 })));
        rows.forEach((t, r) => {
          const w = t.split(" "),
            mid = Math.ceil(w.length / 2);
          s += lines(x0 - 8, y0 + r * ch + ch / 2 - 2, [w.slice(0, mid).join(" "), w.slice(mid).join(" ")], {
            a: "end",
            s: 11,
            c: "var(--text-dim)",
            lh: 13,
          });
          cols.forEach(
            (_, c) =>
              (s += pk(
                `r${r}c${c}`,
                rc(x0 + c * cw + 3, y0 + r * ch + 3, cw - 6, ch - 6, "p", { r: 8 }) +
                  tx(x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 5, "?", { s: 14, c: "var(--text-faint)" }),
              )),
          );
        });
        return svg(358, y0 + 3 * ch + 6, s, "A grid of three changes against four tools");
      })(),
      a: ["r0c0", "r0c1", "r1c3", "r2c1"],
      why: "Dijkstra and A* both rely on costs never being negative (a settled place can only get worse later). A* additionally trusts its estimate never to overshoot, so an overshooting estimate breaks A* but not Dijkstra, which does not use one. Golden-section search needs a single dip, so a second dip breaks it. An MST is untouched by any of the three: Prim and Kruskal still work with negative lengths.",
    },
  ]);
})();

/* ===== bank-y-algo-1.js ===== */
/* Revision bank, fourth set (algo-1): the random surfer, PageRank, Dijkstra, A*, routing and linear programming.
   New diagram kinds for these modules: tape strips, number line, flowchart, trace tables, heatmap, dot plot, log bars,
   priority-queue boxes, cost grid, search tree, f-plot, sequence diagram, small multiples, stacked bars, feasible regions.
   Every number was produced by running the real algorithm (the PageRank and A* parts are computed below). */
(function () {
  const B = NIC.bank,
    Qf = NIC.qfig;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body, pick) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px${pick ? "" : ";display:block"}">${body}</svg>`;
  const rect = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 9}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="${o.sw || 2}" ${o.dash ? 'stroke-dasharray="5 4"' : ""}/>`;
  const line = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.w || 2}" ${o.dash ? 'stroke-dasharray="5 4"' : ""} ${o.arrow ? `marker-end="url(#${o.arrow})"` : ""} stroke-linecap="round"/>`;
  let uid = 0;
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
    const id = "fl" + ++uid,
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
    const id = "sq" + ++uid,
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

  B.add("a2-routing", [
    {
      type: "pick",
      q: "C's link to B breaks, and the routers keep swapping distance-vector messages about destination C (no poisoned reverse). Click the message that first makes a router believe in a route to C that does not exist.",
      fig: seqFig(),
      a: "m1",
      hint: "After the break, who still thinks they can reach C, and whose route goes through whom?",
      why: 'After the break B has no route to C. A, not yet knowing, advertises "C = 2", a route that goes through B itself. B accepts it and believes C is 3 away via A. Everything after that just feeds on this first false belief: B tells A 3, A moves to 4, and so on, counting to infinity. Poisoned reverse would stop it, since A would tell B "C = ∞".',
    },
    {
      type: "pick",
      q: 'Distance-vector routers "count to infinity" when a destination becomes unreachable and the news spreads slowly. In each network the dashed red link fails, and X is the destination. In which network do the costs to X settle at a real, finite value afterwards?',
      fig: netFig(),
      a: "n2",
      hint: "After the failure, can every router still get to X by some path?",
      why: "In network 2 the failed link has a spare route: X is still reachable through C, so costs rise for a while and then settle on a true path. In networks 1 and 3 the failed link is X's only connection to the rest, so nobody can reach X any more and the routers keep raising each other's cost until it hits the maximum.",
    },
    {
      type: "mcq",
      q: "A packet from A to Z can take one of three routes. Each segment shows one link's delay in milliseconds. Which pair of choices is right?",
      fig: stackFig(),
      o: [
        "Hop count: Route 1. Delay: Route 3",
        "Hop count: Route 3. Delay: Route 1",
        "Hop count: Route 2. Delay: Route 3",
        "Hop count: Route 1. Delay: Route 2 (the middle one)",
      ],
      a: 0,
      why: "A hop count just counts links: Route 1 has 2, Route 2 has 3 and Route 3 has 4, so a hop-count metric picks Route 1. A delay metric adds the milliseconds: 20 + 25 = 45, 9 + 8 + 10 = 27 and 5 + 6 + 5 + 7 = 23, so it picks Route 3. Fewer hops is not the same as a faster route.",
    },
    {
      type: "slider",
      q: "Router A's link cost changes, so A floods a link-state advertisement. Every router that gets the <b>first copy</b> forwards it out of all its links except the one it arrived on, and ignores later copies. About how many times is the advertisement sent over links in total (count each direction separately)?",
      fig: floodFig,
      min: 0,
      max: 40,
      step: 1,
      ans: 13,
      tol: 3,
      unit: "sends",
      hint: "A sends it on its 2 links. Each other router forwards it on all its links except one.",
      why: "A sends on its 2 links. Each other router forwards on its links minus one: B 3, C 2, D 2, E 3, F 1, which is 11. The total is 2 + 11 = 13, which is 2 × 9 links − 5. Duplicate copies still cross the links (and are discarded), so flooding costs about twice the number of links.",
    },
  ]);

  /* =====================================================================
     a3-lp
     ===================================================================== */
  // 1. unbounded region
  const openRegion = () => {
    const X = (x) => 40 + x * 45,
      Y = (y) => 270 - y * 30;
    let s = "";
    for (let i = 0; i <= 8; i += 2)
      s +=
        line(X(i), Y(0), X(i), Y(8), { c: "var(--line)", w: 1 }) +
        line(X(0), Y(i), X(8), Y(i), { c: "var(--line)", w: 1 }) +
        tx(X(i), Y(0) + 16, i, { sz: 11, c: dim }) +
        tx(X(0) - 8, Y(i) + 4, i, { a: "end", sz: 11, c: dim });
    s += `<polygon points="${[
      [0, 8],
      [0, 6],
      [1.6, 1.2],
      [4, 0],
      [8, 0],
      [8, 8],
    ]
      .map(([x, y]) => `${X(x)},${Y(y)}`)
      .join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3"/>`;
    [
      [0, 6],
      [1.6, 1.2],
      [4, 0],
    ].forEach(
      ([x, y]) =>
        (s += `<circle cx="${X(x)}" cy="${Y(y)}" r="6" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>`),
    );
    s +=
      tx(X(5.6), Y(5), "feasible region", { sz: 14, c: "var(--teal-ink)" }) +
      tx(X(5.6), Y(4.2), "(goes on for ever →)", { sz: 12, c: "var(--teal-ink)" });
    s +=
      tx(X(0.95), Y(4.4), "3x + y = 6", { a: "start", sz: 12, c: dim }) +
      tx(X(2.3), Y(1.9), "x + 2y = 4", { a: "start", sz: 12, c: dim });
    return svg(420, 300, s);
  };
  // 2. best profit against the shared limit
  const profitFig = () => {
    const X = (b) => 50 + b * 42,
      Y = (z) => 220 - z * 9;
    let s = "";
    [0, 6, 12, 18].forEach(
      (z) =>
        (s +=
          line(50, Y(z), 480, Y(z), { c: "var(--line)", w: 1 }) + tx(42, Y(z) + 4, z, { a: "end", sz: 11, c: dim })),
    );
    for (let b = 0; b <= 10; b += 2) s += tx(X(b), 242, b, { sz: 11, c: dim });
    s +=
      tx(270, 258, "shared limit b  (x + y ≤ b)", { sz: 12, c: dim }) +
      tx(6, 14, "best profit", { a: "start", sz: 12, c: dim });
    s += `<path d="M${X(0)} ${Y(0)} L${X(4)} ${Y(12)} L${X(7)} ${Y(18)} L${X(10)} ${Y(18)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>`;
    [
      [3, 9],
      [4, 12],
      [5, 14],
      [7, 18],
      [9, 18],
    ].forEach(
      ([b, z]) =>
        (s += `<g data-pick="${b}"><rect x="${X(b) - 20}" y="20" width="40" height="225" fill="transparent"/><circle cx="${X(b)}" cy="${Y(z)}" r="12" fill="var(--panel)" stroke="var(--violet)" stroke-width="3"/>${tx(X(b), Y(z) + 5, b, { sz: 13, c: "var(--violet-ink)" })}</g>`),
    );
    return svg(500, 264, s, true);
  };
  // 3. small multiples: objective directions
  const dirFig = () => {
    const id = "dr" + ++uid,
      X = (x) => 20 + x * 30,
      Y = (y) => 150 - y * 30,
      poly = [
        [0, 0],
        [4, 0],
        [4, 2],
        [2, 4],
        [0, 4],
      ];
    const panels = [
      ["a", "A: maximise 2x + y", [2, 1]],
      ["b", "B: maximise x + y", [1, 1]],
      ["c", "C: maximise x + 3y", [1, 3]],
    ];
    let s = defsArrow(id, "var(--amber)");
    panels.forEach(([k, t, [dx, dy]], i) => {
      const L = Math.hypot(dx, dy),
        ex = 1.6 + (dx / L) * 1.3,
        ey = 1.6 + (dy / L) * 1.3;
      s +=
        `<g data-pick="${k}" transform="translate(${i * 170},0)">${rect(2, 2, 162, 186, { r: 12 })}${tx(83, 22, t, { sz: 12 })}<polygon points="${poly.map(([x, y]) => `${X(x) + 6},${Y(y) + 18}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>` +
        line(X(1.6) + 6, Y(1.6) + 18, X(ex) + 6, Y(ey) + 18, { c: "var(--amber)", w: 4, arrow: id }) +
        tx(83, 182, "arrow = direction of better", { sz: 10, c: dim }) +
        "</g>";
    });
    return svg(510, 192, s, true);
  };
  // 4. resource usage bars
  const useFig = () => {
    const bars = [
        ["Wood", 100, "24 of 24 kg used"],
        ["Labour", 100, "6 of 6 hours used"],
        ["Paint", 75, "1.5 of 2 litres used"],
      ],
      Y = (p) => 190 - p * 1.6;
    let s = "";
    [0, 50, 100].forEach(
      (p) =>
        (s +=
          line(50, Y(p), 490, Y(p), { c: "var(--line)", w: 1 }) +
          tx(42, Y(p) + 4, p + "%", { a: "end", sz: 11, c: dim })),
    );
    bars.forEach(([n, u, lab], i) => {
      const x = 90 + i * 140;
      s += `<rect x="${x}" y="${Y(u)}" width="80" height="${190 - Y(u)}" rx="8" fill="var(--blue-dim)" stroke="var(--blue)" stroke-width="3"/>`;
      if (u < 100)
        s +=
          `<rect x="${x}" y="${Y(100)}" width="80" height="${Y(u) - Y(100)}" rx="8" fill="none" stroke="var(--line-2)" stroke-width="3" stroke-dasharray="5 4"/>` +
          tx(x + 40, Y(100) + (Y(u) - Y(100)) / 2 + 5, "left over", { sz: 12, c: dim });
      s += tx(x + 40, 210, n, { sz: 14 }) + tx(x + 40, 228, lab, { sz: 11, c: dim });
    });
    return svg(500, 238, s);
  };

  B.add("a3-lp", [
    {
      type: "mcq",
      q: "Constraints: x + 2y ≥ 4, 3x + y ≥ 6 and x, y ≥ 0. The feasible region has no upper edge. Which objective has a finite best value on it?",
      fig: openRegion(),
      o: ["Maximise x + y", "Maximise 3x − y", "Minimise x + y", "Maximise y − 2x"],
      a: 2,
      hint: "Can you walk off the right or the top of the region and make the objective keep growing?",
      why: 'The region runs on for ever to the right and upwards. x + y gets bigger as either grows, 3x − y keeps growing as x grows, and y − 2x keeps growing as y grows, so none of those has a maximum (the solver reports "unbounded"). Minimising x + y pushes towards the origin: the corners give 6 at (0, 6), 2.8 at (1.6, 1.2) and 4 at (4, 0), so the best is 2.8 at (1.6, 1.2).',
    },
    {
      type: "pick",
      q: "A factory maximises profit 3x + 2y with x ≤ 4, y ≤ 3 and one shared limit x + y ≤ b. The curve shows the best profit for each b. Click the <b>smallest</b> marked b at which raising the limit further stops helping.",
      fig: profitFig(),
      a: "7",
      hint: "Find where the curve goes flat.",
      why: "From b = 7 on, the best plan is x = 4, y = 3 (profit 18): the other two limits are the ones holding profit back, so extra shared room is worth nothing. Between b = 4 and 7 each extra unit buys 2 profit (one more y), and below 4 each unit buys 3 (one more x). The slope of the curve is what one more unit of the limit is worth.",
    },
    {
      type: "pick",
      q: "Same feasible region in each picture, with a different objective. The amber arrow points the way the objective improves. Click the picture where the best plan is <b>not one corner</b> but a whole edge of equally good plans.",
      fig: dirFig(),
      a: "b",
      hint: "Slide the objective line along its arrow until it leaves the region. Does it touch a corner or an edge last?",
      why: "In B the objective x + y gives lines parallel to the slanted edge x + y = 6, so the whole edge from (4, 2) to (2, 4) is optimal, with value 6 everywhere along it. In A (2x + y) the last point is the corner (4, 2), value 10. In C (x + 3y) it is the corner (2, 4), value 14. A tie happens when the objective is parallel to an edge.",
    },
    {
      type: "multi",
      q: "A bakery maximises profit 5x + 4y with wood 6x + 4y ≤ 24, labour x + 2y ≤ 6 and paint y ≤ 2. The best plan (x = 3, y = 1.5) uses the resources as shown. If you could get one more unit of just one resource, which would raise the best profit? Select all that apply.",
      fig: useFig(),
      o: ["Wood", "Labour", "Paint"],
      a: [0, 1],
      hint: "A resource with something left over is not what is holding profit back.",
      why: "Wood and labour are used up, so they are the binding limits: one more wood lifts the best profit from 21 to 21.75, and one more labour to about 21.33. Paint still has 0.5 left over, so more paint changes nothing and the best profit stays 21.",
    },
  ]);
})();

/* ===== bank-y-algo-2.js ===== */
/* Revision bank, fourth set: fills the gaps in the third set (algo-2).
   Modules: a4-cut, a4-mst, a5-orient, a5-wrap, a5-graham (5 each) and l2-mst (5).
   Every figure is inline SVG built here, and each module uses a different diagram kind per question (adjacency matrix, line plots,
   small-multiple bars, tree with a removed link, union-find forest, trace table, grouped bars, regions, dial, turn strips, grids,
   scatter panels, angle diagram, stack boxes, map, number line, ring). Every number was checked by running the real algorithms
   (Prim, Kruskal, monotone-chain hull, Graham scan with pop-on-straight, cross products). Questions stand alone. */
(function () {
  const B = NIC.bank;
  const txt = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, inner) =>
    `<svg viewBox="0 0 ${w} ${h}" style="display:block;width:100%;max-height:${h}px">${inner}</svg>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const ln = (x1, y1, x2, y2, c, w, extra = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const circ = (x, y, r, fill, stroke, sw = 3) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const rect = (x, y, w, h, fill, stroke, sw = 2, r = 6) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const arrow = (x1, y1, x2, y2, c, w = 3) => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      h = 9;
    const p = [
      [x2, y2],
      [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)],
      [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)],
    ];
    return (
      ln(x1, y1, x2 - h * 0.6 * Math.cos(a), y2 - h * 0.6 * Math.sin(a), c, w) +
      `<polygon points="${p.map((q) => q.join(",")).join(" ")}" fill="${c}"/>`
    );
  };
  const MINUS = "−";
  const sgn = (v) => (v > 0 ? "+" + v : v < 0 ? MINUS + Math.abs(v) : "0");
  /* label with a panel-coloured halo so it stays readable over lines */
  const wl = (x, y, s, c = "var(--text-dim)", z = 13) =>
    `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 ${z}px var(--sans);fill:${c};paint-order:stroke;stroke:var(--panel);stroke-width:4px;stroke-linejoin:round">${s}</text>`;
  /* maths plane, y up */
  const plane = (mx, my, x0, y0, x1, y1, grid = true) => {
    const X = (x) => x0 + (x / mx) * (x1 - x0),
      Y = (y) => y1 - (y / my) * (y1 - y0);
    let g = "";
    if (grid) for (let i = 0; i <= mx; i++) g += ln(X(i), Y(0), X(i), Y(my), "var(--line)", 1);
    if (grid) for (let j = 0; j <= my; j++) g += ln(X(0), Y(j), X(mx), Y(j), "var(--line)", 1);
    return { X, Y, g };
  };
  const dot = (x, y, label, o = {}) => {
    const g =
      circ(x, y, o.r || 11, o.fill || "var(--panel)", o.stroke || "var(--line-2)") +
      (label === "" ? "" : txt(x, y + 4, label, { s: o.s || 12, c: o.tc || "var(--ink)" }));
    return o.id ? pk(o.id, g) : g;
  };

  /* =====================================================================
     a4-cut
     ===================================================================== */
  // adjacency matrix, upper triangle; S = {A, C, E} amber
  const cutMatrix = (() => {
    const N = "ABCDEF".split(""),
      S = new Set(["A", "C", "E"]);
    const W = {
      AB: 7,
      AC: 1,
      AD: 9,
      AE: 3,
      AF: "–",
      BC: 6,
      BD: 2,
      BE: 4,
      BF: 3,
      CD: 5,
      CE: 2,
      CF: 8,
      DE: "–",
      DF: 6,
      EF: 10,
    };
    const x0 = 50,
      y0 = 44,
      cw = 58,
      ch = 36;
    let g = "";
    N.forEach((n, i) => {
      const inS = S.has(n);
      g +=
        rect(
          x0 + i * cw + 6,
          8,
          cw - 12,
          28,
          inS ? "var(--amber)" : "var(--panel-2)",
          inS ? "var(--amber)" : "var(--line-2)",
          2,
        ) + txt(x0 + i * cw + cw / 2, 28, n, { c: inS ? "#fff" : "var(--ink)", s: 14 });
      g +=
        rect(
          8,
          y0 + i * ch + 4,
          34,
          ch - 8,
          inS ? "var(--amber)" : "var(--panel-2)",
          inS ? "var(--amber)" : "var(--line-2)",
          2,
        ) + txt(25, y0 + i * ch + ch / 2 + 5, n, { c: inS ? "#fff" : "var(--ink)", s: 14 });
    });
    N.forEach((r, i) =>
      N.forEach((c, j) => {
        const x = x0 + j * cw,
          y = y0 + i * ch;
        if (i < j) {
          const k = r + c;
          g += pk(
            k,
            rect(x + 2, y + 2, cw - 4, ch - 4, "var(--panel)", "var(--line-2)", 2, 6) +
              txt(x + cw / 2, y + ch / 2 + 5, W[k], { s: 14, c: W[k] === "–" ? "var(--text-dim)" : "var(--ink)" }),
          );
        } else g += rect(x + 2, y + 2, cw - 4, ch - 4, "var(--panel-2)", "none", 0, 6);
      }),
    );
    g += txt(x0 + 3 * cw, y0 + 6 * ch + 22, "amber towns = group S, – = no cable", {
      s: 12,
      w: 700,
      c: "var(--text-dim)",
    });
    return svg(410, y0 + 6 * ch + 32, g);
  })();

  // graph + line plot: MST cost against the weight w of the dashed link B-D
  const cutPlot = (() => {
    const nd = { A: [70, 30], B: [210, 30], C: [210, 100], D: [70, 100] };
    let g = "";
    [
      ["A", "B", 2, 0, -9],
      ["B", "C", 3, 11, 4],
      ["C", "D", 4, 0, 18],
      ["A", "D", 7, -11, 4],
      ["A", "C", 5, -34, -18],
    ].forEach(([a, b, w, dx, dy]) => {
      g += ln(nd[a][0], nd[a][1], nd[b][0], nd[b][1], "var(--line-2)", 3);
      g += wl((nd[a][0] + nd[b][0]) / 2 + dx, (nd[a][1] + nd[b][1]) / 2 + dy + 4, w);
    });
    g +=
      ln(nd.B[0], nd.B[1], nd.D[0], nd.D[1], "var(--amber)", 3, 'stroke-dasharray="7 5"') +
      wl(172, 52, "w", "var(--amber-ink)", 15);
    Object.entries(nd).forEach(([k, [x, y]]) => (g += dot(x, y, k, { r: 15, s: 14 })));
    g +=
      txt(300, 55, "dashed B–D costs w", { a: "start", s: 13, c: "var(--amber-ink)" }) +
      txt(300, 76, "(w changes along the", { a: "start", s: 12, w: 700, c: "var(--text-dim)" }) +
      txt(300, 92, "bottom axis of the chart)", { a: "start", s: 12, w: 700, c: "var(--text-dim)" });
    // plot
    const px0 = 62,
      px1 = 440,
      py0 = 150,
      py1 = 290,
      X = (w) => px0 + ((w - 1) / 8) * (px1 - px0 - 20) + 10,
      Y = (t) => py1 - ((t - 5.5) / 4) * (py1 - py0);
    [6, 7, 8, 9].forEach(
      (t) =>
        (g +=
          ln(px0, Y(t), px1, Y(t), "var(--line)", 1) +
          txt(px0 - 8, Y(t) + 4, t, { a: "end", s: 12, w: 700, c: "var(--text-dim)" })),
    );
    for (let w = 1; w <= 9; w++) g += txt(X(w), py1 + 18, w, { s: 12, w: 700, c: "var(--text-dim)" });
    const tot = [6, 7, 8, 9, 9, 9, 9, 9, 9];
    g += `<polyline points="${tot.map((t, i) => `${X(i + 1)},${Y(t)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    [1, 2, 3, 4, 5, 6, 8].forEach(
      (w) => (g += dot(X(w), Y(tot[w - 1]), "", { r: 9, id: "w" + w, fill: "var(--panel)", stroke: "var(--blue)" })),
    );
    g +=
      txt((px0 + px1) / 2, py1 + 38, "w, the cost of B–D", { s: 12, c: "var(--text-dim)" }) +
      txt(6, py0 - 14, "cheapest total", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(460, 335, g);
  })();

  // small multiples: weights of the edges crossing three cuts
  const cutPanels = (() => {
    const P = [[4, 4, 7, 9], [8], [2, 6, 6]];
    let g = "";
    P.forEach((ws, p) => {
      const x0 = 8 + p * 150,
        base = 170;
      g +=
        rect(x0, 6, 140, 190, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 70, 26, `Cut ${p + 1}`, { s: 13, c: "var(--ink)" });
      const bw = 24,
        gap = 8,
        tw = ws.length * bw + (ws.length - 1) * gap,
        sx = x0 + 70 - tw / 2;
      ws.forEach((w, i) => {
        const h = w * 11,
          x = sx + i * (bw + gap);
        g += pk(
          `${p + 1}${"abcd"[i]}`,
          `<rect x="${x}" y="${base - h}" width="${bw}" height="${h}" rx="5" fill="var(--blue)"/>` +
            txt(x + bw / 2, base - h - 5, w, { s: 13, c: "var(--ink)" }),
        );
      });
      g +=
        ln(x0 + 12, base, x0 + 128, base, "var(--line-2)", 2) +
        txt(x0 + 70, base + 16, "crossing edges", { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(460, 204, g);
  })();

  // MST drawn as a tree, one tree link removed, grey spare links
  const cutSwap = (() => {
    const nd = { A: [50, 50], B: [200, 35], C: [350, 55], D: [50, 190], E: [200, 175], F: [350, 190] };
    let g = "";
    const L = (a, b, c, w, extra = "") => ln(nd[a][0], nd[a][1], nd[b][0], nd[b][1], c, w, extra);
    [
      ["D", "E", 7, 0, 14],
      ["E", "F", 8, 0, 15],
      ["A", "E", 9, -4, -8],
      ["B", "F", 10, 6, -10],
    ].forEach(([a, b, w, dx, dy]) => {
      const id = a + "-" + b;
      g += pk(
        id,
        L(a, b, "var(--line-2)", 3, 'stroke-dasharray="3 6"') +
          L(a, b, "transparent", 22) +
          wl((nd[a][0] + nd[b][0]) / 2 + dx, (nd[a][1] + nd[b][1]) / 2 + dy + 4, w),
      );
    });
    [
      ["B", "E", 2, 12, 4],
      ["A", "B", 3, 0, -8],
      ["A", "D", 4, -12, 4],
      ["C", "F", 6, 12, 4],
    ].forEach(
      ([a, b, w, dx, dy]) =>
        (g +=
          L(a, b, "var(--teal)", 5) +
          wl((nd[a][0] + nd[b][0]) / 2 + dx, (nd[a][1] + nd[b][1]) / 2 + dy + 4, w, "var(--teal-ink)")),
    );
    g +=
      L("B", "C", "var(--rose)", 5, 'stroke-dasharray="8 6"') +
      wl(277, 36, "5", "var(--rose-ink)") +
      txt(277, 66, "removed", { s: 12, c: "var(--rose-ink)" });
    Object.entries(nd).forEach(([k, [x, y]]) => (g += dot(x, y, k, { r: 16, s: 14 })));
    return svg(410, 222, g);
  })();

  // sorted weights, then the same weights squared: same order
  const cutOrder = (() => {
    const a = [1, 2, 4, 5, 7],
      b = a.map((v) => v * v);
    let g = "";
    [
      [a, "weights", "var(--blue)", 8, 0],
      [b, "squared", "var(--violet)", 1.2, 1],
    ].forEach(([vals, name, col, k, row]) => {
      const x0 = 120,
        base = 86 + row * 100;
      g += txt(60, base - 24, name, { s: 13, c: "var(--ink)" });
      vals.forEach((v, i) => {
        const h = Math.max(4, v * k),
          x = x0 + i * 58;
        g +=
          `<rect x="${x}" y="${base - h}" width="38" height="${h}" rx="5" fill="${col}"/>` +
          txt(x + 19, base - h - 5, v, { s: 12, c: "var(--ink)" });
      });
      g += ln(x0 - 8, base, x0 + 5 * 58 - 12, base, "var(--line-2)", 2);
    });
    g += txt(235, 206, "the order is identical", { s: 13, c: "var(--teal-ink)" });
    return svg(430, 212, g);
  })();

  B.add("a4-cut", [
    {
      type: "pick",
      q: "Six towns, with the cost of each possible cable in the table (– means no cable). Group S is the three amber towns A, C and E. A cable crosses the cut when one end is in S and the other is not. Click the cell of the cable that the cut property guarantees is in some cheapest network.",
      fig: cutMatrix,
      a: "BE",
      hint: "Ignore any cell where both towns are amber, or both are grey. Of what is left, take the smallest.",
      why: "The crossing cables are A–B 7, A–D 9, B–C 6, C–D 5, C–F 8, B–E 4 and E–F 10. The lightest is B–E at 4, so it is in some cheapest network. The tempting cell A–C (1) is the lightest overall, but both its towns are in S, so it does not cross this cut: it says nothing here.",
    },
    {
      type: "pick",
      q: "A network has the cables shown with their costs, and a dashed cable B–D that costs w. The line chart gives the cost of the cheapest network for each w. Click every marked w for which B–D is in EVERY cheapest network.",
      fig: cutPlot,
      a: ["w1", "w2", "w3"],
      hint: "B–D closes the loop B–C–D (3, 4 and w). A cable on a loop is only certain to be dropped when it is strictly the heaviest.",
      why: "On the loop B–C–D the costs are 3, 4 and w. While w is below 4, the cable C–D (4) is the strict heaviest, so it is always dropped and B–D is forced in: the total rises with w (6, 7, 8). At w = 4 there is a tie, so B–D or C–D can go: B–D is only in SOME cheapest tree, and the total stops rising. Above 4, B–D is the heaviest on the loop, so it is never used and the total stays at 9.",
    },
    {
      type: "pick",
      q: "Each panel shows the weights of the edges that cross one cut of some graph. Use only the cut property. Click every bar that is guaranteed to be in some minimum spanning tree.",
      fig: cutPanels,
      a: ["1a", "1b", "2a", "3a"],
      hint: "Look at each panel on its own. Ask what the lightest crossing edge is, and what happens if there is only one crossing edge.",
      why: "Cut 1 has two lightest edges (4 and 4): either one is safe on its own, so both are guaranteed to be in some tree. Cut 2 has a single crossing edge, so its weight does not matter: it is the lightest crossing edge by default, and the graph would be disconnected without it. Cut 3 guarantees only its 2. The two 6s are not lightest, so the cut property does not promise them.",
    },
    {
      type: "pick",
      q: "The green links are the cheapest network (total 20). You remove the dashed red link B–C, which splits the towns into {A, B, D, E} and {C, F}. Click the grey link that rebuilds a cheapest connected network at the lowest extra cost.",
      fig: cutSwap,
      a: "E-F",
      hint: "A link only helps if one end is in each group. Cross out grey links with both ends in the same group.",
      why: "The groups are {A, B, D, E} and {C, F}. D–E (7) and A–E (9) have both ends on the left, so they cannot reconnect anything. E–F (8) and B–F (10) cross, and the lightest crossing link is E–F at 8. This is the cut property again: the lightest edge across the cut. The new total is 20 − 5 + 8 = 23.",
    },
    {
      type: "cat",
      q: "Every edge weight in a graph is changed in the way described. Does the cheapest network keep the same edges? The chart shows what happens to five weights when they are squared.",
      fig: cutOrder,
      buckets: ["Same cheapest network", "It may change"],
      items: [
        ["Add 10 to every weight", 0],
        ["Multiply every weight by 3", 0],
        ["Square every weight (all are positive)", 0],
        ["Replace each weight by its rank: 1 for the lightest, 2 for the next, and so on", 0],
        ["Replace every weight by its negative", 1],
        ["Add 6 to the weights of the links at town A only", 1],
        ["Round every weight down to a whole number", 1],
      ],
      why: "A cheapest network depends only on the ORDER of the weights: Kruskal sorts them and Prim compares them. Adding the same amount, multiplying by a positive number, squaring positives or using ranks all keep the order, and every spanning tree has the same number of edges, so the best tree stays. Negating reverses the order (you would get the most expensive tree). Changing only A's links, or rounding (which creates ties), can change the order.",
    },
  ]);

  /* =====================================================================
     a4-mst
     ===================================================================== */
  // union-find forest (arrows go to the parent)
  const forest = (() => {
    const nd = {
      A: [70, 36],
      B: [70, 96],
      C: [70, 156],
      D: [235, 36],
      E: [185, 106],
      F: [285, 106],
      G: [395, 36],
      H: [395, 106],
    };
    const par = { B: "A", C: "B", E: "D", F: "D", H: "G" };
    const grp = {
      A: "var(--blue)",
      B: "var(--blue)",
      C: "var(--blue)",
      D: "var(--amber)",
      E: "var(--amber)",
      F: "var(--amber)",
      G: "var(--violet)",
      H: "var(--violet)",
    };
    let g = "";
    Object.entries(par).forEach(([c, p]) => {
      const [x1, y1] = nd[c],
        [x2, y2] = nd[p],
        d = Math.hypot(x2 - x1, y2 - y1),
        ux = (x2 - x1) / d,
        uy = (y2 - y1) / d;
      g += arrow(x1 + ux * 17, y1 + uy * 17, x2 - ux * 19, y2 - uy * 19, "var(--text-dim)", 2.5);
    });
    Object.entries(nd).forEach(([k, [x, y]]) => {
      const root = !par[k];
      g +=
        circ(x, y, 16, root ? grp[k] : "var(--panel)", grp[k], 4) +
        txt(x, y + 5, k, { s: 14, c: root ? "#fff" : "var(--ink)" });
    });
    g += txt(230, 194, "arrows point to the parent; a filled node is a root", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(460, 204, g);
  })();

  // three Kruskal-style runs: weights in the order the edges were accepted
  const orders = (() => {
    const R = [
      [1, 2, 2, 4, 5, 7],
      [3, 1, 2, 6, 4, 5],
      [2, 2, 3, 3, 8, 9],
    ];
    let g = "";
    R.forEach((ws, p) => {
      const x0 = 8 + p * 150,
        base = 156;
      let inner =
        rect(x0, 6, 140, 190, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 70, 26, `Run ${p + 1}`, { s: 13, c: "var(--ink)" });
      ws.forEach((w, i) => {
        const h = w * 11,
          x = x0 + 12 + i * 20;
        inner +=
          `<rect x="${x}" y="${base - h}" width="16" height="${h}" rx="3" fill="var(--blue)"/>` +
          txt(x + 8, base - h - 4, w, { s: 11, c: "var(--ink)" }) +
          txt(x + 8, base + 14, i + 1, { s: 10, w: 700, c: "var(--text-dim)" });
      });
      inner +=
        ln(x0 + 8, base, x0 + 132, base, "var(--line-2)", 2) +
        txt(x0 + 70, 184, "edge number added", { s: 10, w: 700, c: "var(--text-dim)" });
      g += pk("r" + (p + 1), inner);
    });
    return svg(460, 204, g);
  })();

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

  /* =====================================================================
     a5-wrap
     ===================================================================== */
  const wrapPanels = (() => {
    const P = {
      A: [
        [0, 2],
        [4, 0],
        [9, 1],
        [10, 6],
        [6, 10],
        [1, 9],
        [3, 4],
        [5, 3],
        [6, 5],
        [4, 6],
        [7, 3],
        [5, 5],
      ],
      B: [
        [5, 0],
        [8, 1],
        [10, 4],
        [9, 7],
        [6, 9],
        [3, 9],
        [1, 7],
        [0, 4],
        [2, 1],
        [7, 10],
        [4, 0],
        [10, 6],
      ],
      C: [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [3, 3],
        [5, 2],
        [7, 4],
        [4, 5],
        [6, 6],
        [2, 7],
        [8, 8],
        [5, 8],
      ],
    };
    let g = "";
    ["A", "B", "C"].forEach((k, p) => {
      const x0 = 8 + p * 150,
        X = (x) => x0 + 14 + x * 11.2,
        Y = (y) => 168 - y * 12.4;
      g +=
        rect(x0, 6, 140, 184, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 70, 22, `Panel ${k}`, { s: 13, c: "var(--ink)" });
      P[k].forEach(([x, y]) => (g += circ(X(x), Y(y), 5.5, "var(--blue)", "var(--panel)", 1.5)));
      g += txt(x0 + 70, 184, "12 points", { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(460, 196, g);
  })();

  // ten points, five arrows drawn by a learner (arrow 3 skips the corner (10, 6))
  const wrapArrows = (() => {
    const p = plane(10, 9, 40, 20, 400, 290, false);
    const H = { 1: [1, 2], 2: [5, 0], 3: [9, 2], 4: [10, 6], 5: [6, 9], 6: [2, 8] };
    const I = [
      [5, 4],
      [4, 6],
      [7, 5],
      [3, 3],
    ];
    let g = "";
    I.forEach(([x, y]) => (g += circ(p.X(x), p.Y(y), 7, "var(--panel)", "var(--line-2)", 3)));
    Object.values(H).forEach(([x, y]) => (g += circ(p.X(x), p.Y(y), 7, "var(--panel)", "var(--line-2)", 3)));
    const path = [
      [1, 2, "s1"],
      [2, 3, "s2"],
      [3, 5, "s3"],
      [5, 6, "s4"],
      [6, 1, "s5"],
    ];
    path.forEach(([a, b, id], i) => {
      const [x1, y1] = H[a],
        [x2, y2] = H[b],
        mx = (p.X(x1) + p.X(x2)) / 2,
        my = (p.Y(y1) + p.Y(y2)) / 2;
      const dx = p.X(x2) - p.X(x1),
        dy = p.Y(y2) - p.Y(y1),
        d = Math.hypot(dx, dy);
      const ox = (dy / d) * 16,
        oy = (-dx / d) * 16;
      g += pk(
        id,
        arrow(
          p.X(x1) + (dx / d) * 9,
          p.Y(y1) + (dy / d) * 9,
          p.X(x2) - (dx / d) * 9,
          p.Y(y2) - (dy / d) * 9,
          "var(--blue)",
          4,
        ) +
          ln(p.X(x1), p.Y(y1), p.X(x2), p.Y(y2), "transparent", 22) +
          circ(mx - ox, my - oy, 11, "var(--panel)", "var(--blue)", 2) +
          txt(mx - ox, my - oy + 4, i + 1, { s: 12, c: "var(--ink)" }),
      );
    });
    return svg(420, 308, g);
  })();

  // cost per input point against n (log scale ticks), hull stays at 8 points
  const wrapPlot = (() => {
    const ns = [16, 32, 64, 128, 256, 512, 1024],
      x0 = 58,
      x1 = 440,
      y0 = 24,
      y1 = 226;
    const X = (i) => x0 + 18 + i * ((x1 - x0 - 36) / 6),
      Y = (v) => y1 - (v / 12) * (y1 - y0);
    let g = "";
    [0, 4, 8, 12].forEach(
      (v) =>
        (g +=
          ln(x0, Y(v), x1, Y(v), "var(--line)", 1) +
          txt(x0 - 8, Y(v) + 4, v, { a: "end", s: 12, w: 700, c: "var(--text-dim)" })),
    );
    ns.forEach((n, i) => (g += txt(X(i), y1 + 18, n, { s: 11, w: 700, c: "var(--text-dim)" })));
    g +=
      ln(X(0), Y(8), X(6), Y(8), "var(--amber)", 3, 'stroke-dasharray="8 5"') +
      txt(X(0) + 4, Y(8) - 10, "gift wrapping: h = 8", { a: "start", s: 12, c: "var(--amber-ink)" });
    g += `<polyline points="${ns.map((n, i) => `${X(i)},${Y(Math.log2(n))}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
    ns.forEach((n, i) => (g += dot(X(i), Y(Math.log2(n)), "", { r: 9, id: "n" + n, stroke: "var(--blue)" })));
    g +=
      txt(X(4), Y(12) + 4, "Graham scan: log₂ n", { s: 12, c: "var(--blue-ink)" }) +
      txt((x0 + x1) / 2, y1 + 38, "number of points n", { s: 12, c: "var(--text-dim)" }) +
      txt(6, 12, "work per point", { a: "start", s: 11, c: "var(--text-dim)" });
    return svg(460, 268, g);
  })();

  // angle diagram: scan order of six candidate points seen from the current point
  const wrapAngles = (() => {
    const cx = 40,
      cy = 232,
      d2r = Math.PI / 180,
      k = 1.2;
    const C = [
      [72, 150],
      [55, 175],
      [80, 118],
      [31, 185],
      [44, 150],
      [18, 168],
    ];
    let g = ln(cx, cy, 410, cy, "var(--line)", 2) + txt(392, cy - 8, "east", { s: 11, w: 700, c: "var(--text-dim)" });
    C.forEach(([a, d], i) => {
      const x = cx + d * k * Math.cos(a * d2r),
        y = cy - d * k * Math.sin(a * d2r);
      g += ln(cx, cy, x, y, "var(--line-2)", 2, 'stroke-dasharray="3 5"') + dot(x, y, i + 1, { r: 12, s: 13 });
    });
    g +=
      circ(cx, cy, 11, "var(--teal)", "var(--teal)") +
      txt(cx + 8, cy + 22, "cur", { a: "start", s: 13, c: "var(--teal-ink)" });
    return svg(420, 256, g);
  })();

  B.add("a5-wrap", [
    {
      type: "order",
      q: "Gift wrapping costs about n × h, where h is the number of points on the hull. Each panel has 12 points, placed differently. Put the panels in order of work, least first.",
      fig: wrapPanels,
      items: ["Panel C", "Panel A", "Panel B"],
      hint: "Count the points on the outside boundary of each panel. Interior points add nothing to h.",
      why: "Panel C has four corner points with eight inside (h = 4: about 12 × 4 = 48 checks). Panel A has six on its boundary (h = 6, about 72). Panel B has almost every point on the boundary (h = 10, about 120). Same n, so the cost follows the hull size alone. That is what 'output-sensitive' means.",
    },
    {
      type: "pick",
      q: "A learner ran gift wrapping on ten points, counter-clockwise from the leftmost point, and drew five numbered arrows. One arrow is a mistake: gift wrapping would never draw it. Click that arrow.",
      fig: wrapArrows,
      a: "s3",
      hint: "At each hull point, the next point must have every other point on its left. Is any point outside an arrow?",
      why: "Arrow 3 goes from the bottom-right corner straight to the top, but the point at (10, 6) lies outside it, on its right. Gift wrapping would have picked that point: it is the one with all other points on its left. The other four arrows each have every point on their left, so they are real hull edges. Interior points are never reached.",
    },
    {
      type: "pick",
      q: "The hull has 8 points however many points there are. Gift wrapping does about 8 checks per input point, and Graham scan about log₂ n (its sort). Click the first n at which gift wrapping does LESS work per point than Graham scan.",
      fig: wrapPlot,
      a: "n512",
      hint: "log₂ 256 = 8. Is the blue line above or below the dashed line when gift wrapping wins?",
      why: "Gift wrapping is flat at 8 per point; Graham's sorting cost per point grows as log₂ n: 4, 5, 6, 7, 8, 9, 10. At n = 256 they tie (8 against 8). Only from 512 (log₂ 512 = 9) is gift wrapping strictly cheaper. With a small, fixed hull, MORE points favours gift wrapping, because it never pays for sorting.",
    },
    {
      type: "slider",
      min: 0,
      max: 6,
      step: 1,
      start: 1,
      ans: 3,
      tol: 0,
      unit: "changes",
      q: "Gift wrapping stands at the lowest point cur, and all six candidate points are above it. The inner loop sets nxt to point 1, then scans points 2 to 6 in order. nxt changes whenever the scanned point is to the RIGHT of the arrow cur → nxt. The angles (above east) are 72°, 55°, 80°, 31°, 44° and 18°. How many times does nxt change?",
      fig: wrapAngles,
      hint: "A point to the right of cur → nxt has a smaller angle than nxt. Track the smallest angle seen so far.",
      why: "The loop keeps the smallest angle so far. Start: 72°. Point 2 (55°) is smaller: change 1. Point 3 (80°): no. Point 4 (31°): change 2. Point 5 (44°): no. Point 6 (18°): change 3. So nxt ends on point 6 after changing 3 times, and point 6 is the true next hull point: every other point is on its left.",
    },
    {
      type: "match",
      q: "A set of 100 points has a hull of 10 corners, so gift wrapping does about 100 × 10 = 1,000 checks. Match each change with what happens to the work.",
      pairs: [
        ["Add 100 more points, all inside the hull", "About twice the work"],
        ["Pull the hull out to 40 corners (still 100 points)", "About four times the work"],
        ["Move the interior points about, all still inside", "No change"],
        ["Delete 50 interior points", "About half the work"],
      ],
      hint: "Work is n × h. Which of the two numbers does each change touch?",
      why: "Work is about n × h. Adding 100 interior points doubles n and leaves h at 10: 2,000 checks. Pulling the hull out to 40 multiplies h by 4: 4,000. Moving interior points around changes neither. Deleting 50 interior points halves n: 500. Interior points only ever cost you a check per step; they never create more steps.",
    },
  ]);

  /* =====================================================================
     a5-graham
     ===================================================================== */
  const stackPlot = (() => {
    const sizes = [1, 2, 3, 4, 4, 3, 4, 5, 5],
      x0 = 52,
      x1 = 440,
      y0 = 22,
      y1 = 214;
    const X = (i) => x0 + 12 + i * ((x1 - x0 - 24) / 8),
      Y = (v) => y1 - ((v - 0.5) / 5.5) * (y1 - y0);
    let g = "";
    [1, 2, 3, 4, 5, 6].forEach(
      (v) =>
        (g +=
          ln(x0, Y(v), x1, Y(v), "var(--line)", 1) +
          txt(x0 - 8, Y(v) + 4, v, { a: "end", s: 12, w: 700, c: "var(--text-dim)" })),
    );
    sizes.forEach((v, i) => (g += txt(X(i), y1 + 18, i === 0 ? "start" : i, { s: 11, w: 700, c: "var(--text-dim)" })));
    g += `<polyline points="${sizes.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    sizes.forEach(
      (v, i) =>
        (g +=
          i === 0
            ? circ(X(i), Y(v), 7, "var(--teal)", "var(--teal)", 2)
            : dot(X(i), Y(v), "", { r: 9, id: "p" + i, stroke: "var(--blue)" })),
    );
    g +=
      txt((x0 + x1) / 2, y1 + 38, "points processed so far", { s: 12, c: "var(--text-dim)" }) +
      txt(6, 12, "stack height", { a: "start", s: 11, c: "var(--text-dim)" });
    return svg(460, 258, g);
  })();

  // four stack snapshots
  const snaps = (() => {
    const S = [
      ["1", "after pushing D", ["P0", "A", "C", "D"]],
      ["2", "after pushing E", ["P0", "B", "D", "E"]],
      ["3", "after pushing F", ["P0", "A", "C", "D"]],
      ["4", "after pushing E", ["P0", "A", "E"]],
    ];
    let g = "";
    S.forEach(([n, cap, st], i) => {
      const x0 = 8 + i * 114,
        base = 214;
      g +=
        rect(x0, 6, 106, 226, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 53, 26, `Snapshot ${n}`, { s: 13, c: "var(--ink)" }) +
        txt(x0 + 53, 44, cap, { s: 11, w: 700, c: "var(--text-dim)" });
      st.forEach((p, k) => {
        const y = base - (k + 1) * 36,
          bottom = k === 0;
        g +=
          rect(
            x0 + 24,
            y,
            58,
            32,
            bottom ? "var(--teal)" : "var(--panel-2)",
            bottom ? "var(--teal)" : "var(--line-2)",
            2,
            6,
          ) + txt(x0 + 53, y + 21, p, { s: 14, c: bottom ? "#fff" : "var(--ink)" });
      });
    });
    return svg(470, 238, g);
  })();

  // 100% stacked bars: sort share against scan share
  const shareBars = (() => {
    const D = [
      ["1,000", 16.7],
      ["10,000", 13.1],
      ["100,000", 10.7],
      ["1,000,000", 9.1],
    ];
    let g = txt(230, 16, "share of the whole run: sort (blue) and scan (amber)", { s: 12, c: "var(--ink)" });
    D.forEach(([n, sc], i) => {
      const x = 40 + i * 104,
        top = 30,
        H = 170,
        hs = (sc / 100) * H;
      g += `<rect x="${x}" y="${top}" width="70" height="${H - hs}" rx="4" fill="var(--blue)"/><rect x="${x}" y="${top + H - hs}" width="70" height="${hs}" rx="4" fill="var(--amber)"/>`;
      g +=
        txt(x + 35, top + (H - hs) / 2 + 5, (100 - sc).toFixed(1) + "%", { s: 13, c: "#fff" }) +
        txt(x + 35, top + H - hs / 2 + 4, sc + "%", { s: 11, c: "#fff" }) +
        txt(x + 35, top + H + 18, "n = " + n, { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(460, 238, g);
  })();

  // scatter: which points end off the final stack
  const hullScatter = (() => {
    const p = plane(10, 9, 30, 20, 400, 290, true);
    const P = { a: [6, 0], b: [10, 0], c: [10, 4], d: [10, 8], e: [7, 6], f: [4, 9], g: [0, 5], h: [5, 4], i: [3, 3] };
    let g =
      p.g +
      circ(p.X(2), p.Y(0), 12, "var(--teal)", "var(--teal)") +
      txt(p.X(2), p.Y(0) + 4, "P0", { s: 11, c: "#fff" });
    Object.entries(P).forEach(([k, [x, y]]) => (g += dot(p.X(x), p.Y(y), k, { r: 11, id: k, s: 13 })));
    return svg(420, 316, g);
  })();

  // stack before and after, plus the plane
  const stackScene = (() => {
    const px0 = 204,
      px1 = 452,
      py0 = 14,
      py1 = 292,
      X = (x) => px0 + (x / 12) * (px1 - px0),
      Y = (y) => py1 - (y / 12) * (py1 - py0);
    let g = "";
    for (let i = 0; i <= 12; i += 2)
      g += ln(X(i), Y(0), X(i), Y(12), "var(--line)", 1) + ln(X(0), Y(i), X(12), Y(i), "var(--line)", 1);
    const P0 = [0, 0],
      A = [8, 9],
      Bp = [5, 10],
      C = [3, 7];
    g += `<polyline points="${[P0, A, Bp, C].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
    g += circ(X(0), Y(0), 11, "var(--teal)", "var(--teal)") + txt(X(0) + 2, Y(0) + 4, "P0", { s: 10, c: "#fff" });
    [
      ["A", A],
      ["B", Bp],
      ["C", C],
    ].forEach(([n, [x, y]]) => (g += dot(X(x), Y(y), n, { r: 11, stroke: "var(--teal)" })));
    [
      ["d1", [1, 3]],
      ["d2", [0, 7]],
      ["d3", [2, 11]],
      ["d4", [3, 11]],
      ["d5", [2, 5]],
    ].forEach(
      ([id, [x, y]], i) =>
        (g += pk(
          id,
          circ(X(x), Y(y), 10, "var(--panel)", "var(--amber)", 3) +
            txt(X(x), Y(y) + 4, i + 1, { s: 12, c: "var(--ink)" }),
        )),
    );
    const col = (x, title, st, last) => {
      let s = txt(x + 42, 22, title, { s: 12, c: "var(--ink)" });
      st.forEach((p, k) => {
        const y = 262 - k * 38,
          bottom = k === 0,
          top = last && k === st.length - 1;
        s +=
          rect(
            x,
            y,
            84,
            32,
            bottom ? "var(--teal)" : top ? "var(--amber)" : "var(--panel-2)",
            bottom ? "var(--teal)" : top ? "var(--amber)" : "var(--line-2)",
            2,
            6,
          ) + txt(x + 42, y + 21, p, { s: 14, c: bottom || top ? "#fff" : "var(--ink)" });
      });
      return s;
    };
    g += col(4, "Before", ["P0", "A", "B", "C"], false) + col(96, "After", ["P0", "A", "D"], true);
    return svg(460, 304, g);
  })();

  B.add("a5-graham", [
    {
      type: "pick",
      q: "A Graham scan starts with the anchor on the stack. The chart shows the stack height after each point of the sorted list has been processed. Every step pushes the new point, and may pop some points first. Click the step in which the MOST points were popped.",
      fig: stackPlot,
      a: "p5",
      hint: "Pops at a step = 1 + (old height) − (new height). A step that only rises by 1 popped nothing.",
      why: "Step 4 stays at 4: it pushed one point and popped one (1 + 4 − 4 = 1). Step 5 drops from 4 to 3: it pushed one and popped TWO (1 + 4 − 3 = 2), the most of any step. Step 8 stays at 5, with one pop. Steps 1, 2, 3, 6 and 7 rise by exactly 1, so nothing was popped there. The final height is 5, so five points are on the hull.",
    },
    {
      type: "cat",
      q: "Graham scan pushes the points one by one in angle order A, B, C, D, E, F (the anchor P0 is pushed first). Each snapshot shows the stack, with the bottom at the bottom, right after the named point has been pushed. Which snapshots are possible?",
      fig: snaps,
      buckets: ["Possible", "Impossible"],
      items: [
        ["Snapshot 1", 0],
        ["Snapshot 2", 1],
        ["Snapshot 3", 1],
        ["Snapshot 4", 0],
      ],
      hint: "A stack only removes from the top. And where is the point that was just pushed?",
      why: "Snapshot 1 is possible: B was popped when C arrived, and D was pushed on top. Snapshot 4 is possible: D and C were popped when E arrived. Snapshot 2 is impossible: A is gone but B, which sits above A, is still there, and a stack cannot remove from the middle. Snapshot 3 is impossible: the point just pushed (F) must be on top, but F is missing.",
    },
    {
      type: "slider",
      min: 0,
      max: 40,
      step: 0.5,
      start: 20,
      ans: 4.5,
      tol: 2,
      unit: "% shorter",
      q: "Graham scan on 1,000,000 points spends its time sorting (about n log₂ n steps) and scanning (at most 2n steps). The bars show the shares. A clever trick makes the scan twice as fast and leaves the sort alone. By about what percentage does the WHOLE run get shorter?",
      fig: shareBars,
      hint: "Out of 22 parts of time, 20 are the sort and 2 are the scan. Halving the scan saves 1 part.",
      why: "At n = 1,000,000 the scan is only about 9% of the total (sort 20 parts, scan 2 parts, out of 22). Halving it saves half of 9%, so the whole run is only about 4.5% shorter. That is why the algorithm is O(n log n): the sort dominates, and polishing the scan can never matter much.",
    },
    {
      type: "pick",
      q: "Graham scan pops a point whenever the turn is not a strict left turn, so points that are straight on the boundary are popped too. The anchor P0 is always on the hull. Click every point that is NOT on the final stack.",
      fig: hullScatter,
      a: ["a", "c", "e", "h", "i"],
      hint: "Find the corner points first. Then check for points lying exactly on a side between two corners.",
      why: "The hull corners are P0, b, d, f and g. Points e, h and i are inside. Points a and c are different: a lies exactly on the straight bottom side from P0 to b, and c lies exactly on the right side from b to d. They make a straight line (turn 0) with their neighbours, so the scan pops them. A scan that popped only on right turns would keep a and c as flat hull points.",
    },
    {
      type: "pick",
      q: "The stack before and after one step of Graham scan is shown (the new point D is amber). D comes later in angle order than C. Click every numbered position that D could be in.",
      fig: stackScene,
      a: ["d3", "d4"],
      hint: "Two points were popped, B and C. Each pop means that point is not a left turn. Where must D be to be right of B → C and right of A → B?",
      why: "C is popped when B → C → D is not a left turn, and then B is popped when A → B → D is not a left turn. D sits high and close in, beyond the outside edge of the chain: positions 3 and 4. Position 2 pops only C (B survives), so the stack would end P0, A, B, D. Positions 1 and 5 turn left at C, so nothing is popped and D is pushed on top of C.",
    },
  ]);

  /* =====================================================================
     l2-mst
     ===================================================================== */
  const mapLinks = (() => {
    const T = { A: [2, 1], B: [4, 2], C: [7, 6], D: [5, 2], E: [7, 8], F: [1, 2], G: [10, 3] };
    const p = plane(11, 9, 24, 16, 416, 276, true);
    let g = p.g;
    [
      ["A", "F", "1.4", -17, 12],
      ["B", "D", "1.0", 0, -17],
      ["C", "E", "2.0", 14, 0],
      ["C", "G", "4.2", 6, -10],
      ["A", "B", "2.2", 4, 17],
      ["C", "D", "4.5", -14, -6],
      ["F", "B", "3.0", -8, -14],
      ["D", "G", "5.1", 0, 16],
    ].forEach(([a, b, w, dx, dy]) => {
      const [x1, y1] = [p.X(T[a][0]), p.Y(T[a][1])],
        [x2, y2] = [p.X(T[b][0]), p.Y(T[b][1])];
      g += pk(
        a + b,
        ln(x1, y1, x2, y2, "var(--blue)", 4) +
          ln(x1, y1, x2, y2, "transparent", 22) +
          wl((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy + 4, w, "var(--ink)", 12),
      );
    });
    Object.entries(T).forEach(([k, [x, y]]) => (g += dot(p.X(x), p.Y(y), k, { r: 10, s: 12 })));
    return svg(440, 292, g);
  })();

  const planLine = (() => {
    const P = [
      ["P1", 14, "var(--rose)", "loop, and town E is cut off"],
      ["P2", 17, "var(--rose)", "tree, but town C has 3 links"],
      ["P3", 19, "var(--teal)", "tree, no town has more than 2 links"],
      ["P4", 20, "var(--teal)", "tree, no town has more than 2 links"],
      ["P5", 23, "var(--teal)", "tree, no town has more than 2 links"],
    ];
    const X = (c) => 30 + ((c - 12) / 13) * 400;
    let g = ln(X(12), 54, X(25), 54, "var(--line-2)", 3);
    for (let c = 12; c <= 24; c += 2)
      g += ln(X(c), 48, X(c), 60, "var(--line-2)", 2) + txt(X(c), 84, c, { s: 12, w: 700, c: "var(--text-dim)" });
    P.forEach(
      ([n, c, col]) => (g += circ(X(c), 54, 12, col, col, 2) + txt(X(c), 59, n.slice(1), { s: 13, c: "#fff" })),
    );
    g += txt(220, 22, "total cost of each plan", { s: 12, c: "var(--ink)" });
    P.forEach(([n, c, col, note], i) => {
      const y = 98 + i * 34;
      g += pk(
        n,
        rect(8, y, 424, 28, "var(--panel)", "var(--line-2)", 2, 8) +
          circ(28, y + 14, 11, col, col, 2) +
          txt(28, y + 19, n.slice(1), { s: 12, c: "#fff" }) +
          txt(46, y + 19, `cost ${c}: ${note}`, { a: "start", s: 12, c: "var(--ink)" }),
      );
    });
    return svg(440, 98 + 5 * 34 + 4, g);
  })();

  const ring = (() => {
    const cx = 160,
      cy = 96,
      R = 70,
      d2r = Math.PI / 180,
      ang = [-90, -30, 30, 90, 150, 210],
      cost = [4, 6, 3, 7, 5, 2];
    const P = ang.map((a) => [cx + R * Math.cos(a * d2r), cy + R * Math.sin(a * d2r)]);
    let g = "";
    P.forEach((p, i) => {
      const q = P[(i + 1) % 6],
        mx = (p[0] + q[0]) / 2,
        my = (p[1] + q[1]) / 2,
        dx = mx - cx,
        dy = my - cy,
        d = Math.hypot(dx, dy);
      g +=
        ln(p[0], p[1], q[0], q[1], "var(--blue)", 4) +
        wl(mx + (dx / d) * 16, my + (dy / d) * 16 + 4, cost[i], "var(--ink)");
    });
    P.forEach((p, i) => (g += dot(p[0], p[1], "ABCDEF"[i], { r: 14, s: 13 })));
    g +=
      txt(300, 82, "tour cost:", { a: "start", s: 13, c: "var(--ink)" }) +
      txt(300, 102, "4 + 6 + 3 + 7", { a: "start", s: 13, c: "var(--ink)" }) +
      txt(300, 122, "+ 5 + 2 = 27", { a: "start", s: 13, c: "var(--ink)" });
    return svg(460, 196, g);
  })();

  const tiedPlans = (() => {
    const names = ["A", "B", "C", "D", "E"],
      ang = [-90, -18, 54, 126, 198],
      d2r = Math.PI / 180;
    const E = [
      ["A", "B", 2],
      ["B", "C", 2],
      ["C", "D", 3],
      ["D", "E", 3],
      ["E", "A", 3],
      ["B", "D", 5],
    ];
    const plans = [
      [
        ["A", "B"],
        ["B", "C"],
        ["C", "D"],
        ["D", "E"],
      ],
      [
        ["A", "B"],
        ["B", "C"],
        ["D", "E"],
        ["E", "A"],
      ],
      [
        ["A", "B"],
        ["B", "C"],
        ["B", "D"],
        ["D", "E"],
      ],
    ];
    let g = "";
    plans.forEach((pl, p) => {
      const x0 = 8 + p * 150,
        cx = x0 + 70,
        cy = 108,
        R = 46;
      const P = Object.fromEntries(
        names.map((n, i) => [n, [cx + R * Math.cos(ang[i] * d2r), cy + R * Math.sin(ang[i] * d2r)]]),
      );
      let inner =
        rect(x0, 6, 140, 196, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 70, 26, `Plan ${p + 1}`, { s: 13, c: "var(--ink)" });
      E.forEach(([a, b]) => {
        const on = pl.some(([u, v]) => (u === a && v === b) || (u === b && v === a)),
          [x1, y1] = P[a],
          [x2, y2] = P[b];
        inner += ln(
          x1,
          y1,
          x2,
          y2,
          on ? "var(--teal)" : "var(--line-2)",
          on ? 5 : 2,
          on ? "" : 'stroke-dasharray="2 5"',
        );
      });
      E.forEach(([a, b, w]) => {
        const [x1, y1] = P[a],
          [x2, y2] = P[b],
          mx = (x1 + x2) / 2,
          my = (y1 + y2) / 2,
          dx = mx - cx,
          dy = my - cy,
          d = Math.hypot(dx, dy) || 1,
          diag = a === "B" && b === "D";
        inner += wl(diag ? mx + 12 : mx + (dx / d) * 11, diag ? my - 4 : my + (dy / d) * 11 + 4, w, "var(--ink)", 11);
      });
      names.forEach((n) => (inner += dot(P[n][0], P[n][1], n, { r: 11, s: 11 })));
      inner += txt(x0 + 70, 190, "green links used", { s: 10, w: 700, c: "var(--text-dim)" });
      g += pk("pl" + (p + 1), inner);
    });
    return svg(460, 210, g);
  })();

  B.add("l2-mst", [
    {
      type: "pick",
      q: "Seven towns lie on a map and a cable costs its straight-line length. Eight possible cables are drawn with their costs. A cable is a SURE PICK if it is the shortest cable leaving some single town (that town versus all the others is a cut). Click every drawn cable that is a sure pick.",
      fig: mapLinks,
      a: ["AF", "BD", "CE", "CG"],
      hint: "For each town, find its shortest cable among the drawn ones. A cable is a sure pick if it is the shortest at either of its ends.",
      why: "A's shortest is A–F (1.4), B's is B–D (1.0), C's is C–E (2.0), D's is B–D, E's is C–E, F's is A–F, and G's is C–G (4.2). So A–F, B–D, C–E and C–G are sure picks by the cut property. A–B (2.2), C–D (4.5), F–B (3.0) and D–G (5.1) are never the shortest at either end. C–D happens to be in the cheapest network, but it needs a bigger cut to prove it.",
    },
    {
      type: "pick",
      q: "A firm may build only a plan that connects every town, has no loops and gives no town more than 2 links. The five plans are placed by total cost. Click the plan the firm should build.",
      fig: planLine,
      a: "P3",
      hint: "Cross out any plan that breaks a rule. Then take the cheapest of what is left.",
      why: "Plan 1 (14) is the cheapest overall, but a town is cut off, so it does not connect everything. Plan 2 (17) is a proper spanning tree, probably the plain MST, but town C has 3 links, which the rule forbids. Plans 3, 4 and 5 are all legal and Plan 3 is the cheapest at 19. The unconstrained MST is only a lower bound: no tree can cost less, and the rule pushes the best legal tree above it.",
    },
    {
      type: "bug",
      q: "This greedy code takes the cables cheapest first and tries to build a tree where no town has more than 2 links. For a star (one hub with four cheap cables) it returns a hub with 4 links. Click the faulty line.",
      code: [
        "def greedy(edges, n):",
        "    deg = [0] * n",
        "    group = list(range(n))",
        "    tree = []",
        "    for w, u, v in sorted(edges):",
        "        if group[u] == group[v]:",
        "            continue",
        "        if deg[u] > 1 and deg[v] > 1:",
        "            continue",
        "        old, new = group[v], group[u]",
        "        for i in range(n):",
        "            if group[i] == old:",
        "                group[i] = new",
        "        deg[u] += 1",
        "        deg[v] += 1",
        "        tree.append((u, v))",
        "    return tree",
      ],
      a: 7,
      why: "The code skips a cable only when BOTH ends are already full ('and'). A cable should be skipped when EITHER end is full ('or'), because adding it would give that town a third link. With 'and', the hub keeps accepting spokes while the other end has room, so it ends with 4 links. Everything else is right: the group relabelling stops loops, and the degree counts are updated.",
    },
    {
      type: "mcq",
      q: "These six towns are joined by a round tour of cables that costs 27 in total, as drawn. You delete the dearest cable (7). What is certain about the cost of the CHEAPEST spanning tree of the six towns, using the cables available?",
      fig: ring,
      o: ["At most 20", "Exactly 20", "At least 27", "At least 20"],
      a: 0,
      hint: "What is left after deleting one cable from a ring: is it a spanning tree? What does it cost?",
      why: "Deleting one cable from a ring leaves a path through all six towns: connected, no loop, so it is a spanning tree. It costs 27 − 7 = 20. The cheapest spanning tree can cost no more than this one, so it is AT MOST 20. It could be less if other cables exist, so 'exactly 20' is not certain, and 'at least' is the wrong way round.",
    },
    {
      type: "pick",
      q: "Five towns can be linked by the cables shown (costs on each). Three plans are drawn, each in green; every plan is a spanning tree. Click every plan that is a minimum spanning tree.",
      fig: tiedPlans,
      a: ["pl1", "pl2"],
      hint: "Add up the green costs of each plan. Then ask: does every minimum tree have to look the same?",
      why: "Plan 1 costs 2 + 2 + 3 + 3 = 10 and plan 2 costs 2 + 2 + 3 + 3 = 10. Plan 3 uses the dear diagonal B–D (5): 2 + 2 + 5 + 3 = 12. The three cables of cost 3 (C–D, D–E, E–A) are such that any two of them finish the tree, so there are three different cheapest trees. Ties do not change the minimum cost, but they mean the cheapest network may not be unique.",
    },
  ]);
})();

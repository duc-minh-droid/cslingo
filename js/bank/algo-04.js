/* ===== bank-algo-2.js ===== */
/* Algorithms revision bank, part 2 (revision mode only). New angles per session; no calculator needed. Numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

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
      "Edges: S–A 1, S–B 4, A–B 2, B–T 1, A–T 5. Starting at S, in what order does Dijkstra settle the nodes?",
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
  Object.assign(partScope, { M, TF });
})();

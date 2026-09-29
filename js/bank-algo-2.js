/* Algorithms revision bank, part 2 (revision mode only). New angles per session; no calculator needed. Numbers verified with node. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  /* ---------- Phase 1 ---------- */
  B.add("a1-anatomy", [
    M("What's the difference between an algorithm and a program?", ["None", "An algorithm is the method", "Programs are always correct", "Algorithms need computers"], 1, "The same algorithm can be written in many languages."),
    M("How do you usually prove a loop terminates?", ["Run it once on a test input and see if it stops", "Show a quantity strictly falls towards a bound", "Add a timer that stops it after a while", "Rewrite it using recursion"], 1, "E.g. the number of unprocessed items shrinks."),
    M("A good invariant for binary search is…", ["the list is unsorted at the start of every step", "if present, the target lies between lo and hi", "lo is always greater than hi", "mid is always an even number"], 1, "Each step halves the range while keeping that promise."),
    TF("A correct algorithm must handle edge cases, not just typical input.", true, "Empty lists, ties and duplicates are where bugs hide."),
    M("For \"find the maximum\", what makes the invariant true before the loop starts?", ["best = 0", "best = the first item", "best = −1", "best = the last item"], 1, "Initialisation must satisfy the promise."),
    { type: "bug", q: "This should return the sum of a list. Click the faulty line.", code: ["def total(xs):", "    s = 1", "    for x in xs:", "        s = s + x", "    return s"], a: 1,
      why: "The running sum must start at 0, or every answer is 1 too big (and an empty list returns 1)." },
    M("A deterministic algorithm…", ["gives a different answer on each run, by design", "always gives the same output for the same input", "never stops running", "needs special hardware to run"], 1, "Predictable behaviour."),
    M("\"Deal with the most urgent request\" isn't an algorithm until you specify…", ["the colour of the display the requests appear on", "exactly how urgency is compared, ties included", "the programming language", "which server it runs on"], 1, "No room for interpretation."),
  ]);
  B.add("a1-bigo", [
    M("A loop over n inside a loop over m does how much work?", ["O(n + m)", "O(n × m)", "O(n)", "O(log n)"], 1, "Every pair."),
    M("log₂ 1024 = ?", ["10", "32", "100", "512"], 0, "2¹⁰ = 1024."),
    M("Which operation is O(1)?", ["Sorting a list of numbers", "Reading an array element by index", "Searching an unsorted list for a value", "Printing every element"], 1, "Constant time regardless of size."),
    M("n = 1,000. Roughly how many steps is n²?", ["1,000", "10,000", "1,000,000", "1 billion"], 2, "1,000²."),
    TF("O(2n) is the same as O(n).", true, "Constants are dropped."),
    M("<code>i = 1; while i &lt; n: i = i × 2</code> runs about how many times?", ["n (once per number)", "n/2 (every other number)", "log₂ n", "n² (every pair)"], 2, "Doubling up to n takes log₂ n steps."),
    M("Two loops over n, one after the other (not nested), cost…", ["O(n²)", "O(n)", "O(2ⁿ)", "O(log n)"], 1, "n + n = 2n = O(n)."),
    { type: "order", q: "Order from slowest-growing to fastest-growing.", items: ["O(1)", "O(log n)", "O(n)", "O(n²)"], why: "Constant < log < linear < quadratic." },
  ]);
  B.add("a1-surfer", [
    M("The random surfer follows a link with probability…", ["1 − d", "d", "1/N", "0.5 always"], 1, "Otherwise (1 − d) they teleport."),
    M("A page's PageRank equals…", ["how many links point to it from anywhere on the web", "the surfer's long-run share of time spent there", "how long the page has existed", "how many words it contains"], 1, "Rank as a probability."),
    M("4 pages. A dangling page with rank 0.4 spreads it evenly. Each page receives…", ["0.1", "0.4", "0.2", "0"], 0, "0.4 / 4 = 0.1 (including itself)."),
    TF("With the dangling-page repair, total rank stays constant each step.", true, "Nothing leaks away any more."),
    M("A \"rank sink\" is…", ["a page that loads very fast and keeps visitors on it", "pages that rank flows into but never leaves", "a link that points to a missing page", "the site's homepage"], 1, "Teleportation drains it."),
    M("A page no one links to still gets some rank. Why?", ["It doesn't: unlinked pages always end up with zero", "Teleporting gives every page a small baseline share", "Search engines boost new pages", "It's a rounding error in the maths"], 1, "(1 − d)/N from teleporting."),
    M("A page with 100 outgoing links gives each target…", ["its whole rank", "1/100 of its rank", "nothing", "100× its rank"], 1, "Split evenly across links."),
    M("Damping d very close to 1. Consequence?", ["Faster convergence, since fewer teleports happen", "Slower convergence, and traps matter more", "Ranks become uniform", "Nothing changes"], 1, "Less teleporting to escape traps."),
  ]);
  B.add("a1-pagerank", [
    M("Power iteration repeatedly computes…", ["p = p + 1", "p ← G · p", "p ← p²", "p ← sorted(p)"], 1, "Multiply by the Google matrix until it settles."),
    M("When do you stop iterating?", ["After a single step, since G is already known", "When p barely changes between iterations", "When p becomes all zeros", "Never: it runs forever"], 1, "Convergence tolerance."),
    M("Each column of G sums to…", ["0", "1", "N", "d"], 1, "It's column-stochastic: rank is conserved."),
    TF("PageRank scores depend on what the user searched for.", false, "They're computed offline from links; the query is combined later."),
    M("d = 0.85, N = 10. What does teleporting add to every entry of G?", ["0.085", "0.015", "0.15", "0.1"], 1, "(1 − 0.85)/10 = 0.015.", { hint: "Teleport share per entry = (1 − d) / N = 0.15 / 10." }),
    M("The usual starting vector is…", ["all zeros", "uniform: 1/N for every page", "1 for the homepage, 0 elsewhere", "random negative values"], 1, "Any valid start converges to the same answer."),
    M("A dangling page's column in A is replaced by…", ["zeros", "1/N in every row", "1 on the diagonal", "d"], 1, "Complete uncertainty."),
    M("Mathematically, the PageRank vector is…", ["the largest single entry of the matrix G", "the eigenvector of G with eigenvalue 1", "the inverse of G", "a random vector"], 1, "G·p = p at the fixed point."),
  ]);

  /* ---------- Phase 2 ---------- */
  B.add("a2-dijkstra", [
    M("Which data structure makes Dijkstra efficient?", ["A stack of visited nodes, most recent on top", "A min-heap of tentative distances", "A hash set of settled nodes only", "A linked list of edges"], 1, "Quickly find the closest unsettled node."),
    M("Initial distances in Dijkstra?", ["0 for every node", "0 for the source, ∞ for everyone else", "∞ for every node, including the source", "random starting values"], 1, "Nothing is known yet."),
    M("\"Relaxing\" an edge (u, v) means…", ["deleting the edge from the graph once it's used", "checking if going via u shortens v's distance", "doubling the edge's weight", "marking v as settled"], 1, "dist[v] = min(dist[v], dist[u] + w)."),
    TF("Dijkstra finds shortest paths from one source to every reachable node.", true, "Single-source shortest paths."),
    M("Edges: S–A 1, S–B 4, A–B 2, B–T 1, A–T 5. Shortest distance S → T?", ["4", "5", "6", "7"], 0, "S → A → B → T = 1 + 2 + 1 = 4."),
    M("Same graph. Order in which nodes are settled?", ["S, B, A, T", "S, A, B, T", "S, A, T, B", "S, T, A, B"], 1, "Distances 0, 1, 3, 4."),
    M("How do you recover the actual path, not just its length?", ["Run Dijkstra again backwards from the target node", "Store predecessors and walk back from the target", "Guess from the final distances", "Sort the edges by weight"], 1, "Parent pointers."),
    M("Only the distance to T is needed. When can Dijkstra stop early?", ["Never", "As soon as T is settled", "When T is first seen", "After n steps"], 1, "Settled means final."),
  ]);
  B.add("a2-astar", [
    { type: "match", q: "Match each A* term to its meaning.", pairs: [["g(n)", "Cost from the start to n so far"], ["h(n)", "Estimated cost from n to the goal"], ["f(n)", "g(n) + h(n): the priority"]], why: "Known + estimated = priority." },
    M("When does A* know it has found the shortest path?", ["When the goal is first added to the frontier", "When the goal is removed from the frontier (expanded)", "After n steps have been taken", "When h reaches 0"], 1, "Checking at generation can accept a worse path."),
    TF("A* is always faster than Dijkstra.", false, "With a poor heuristic it can explore just as much."),
    M("On a 4-direction grid with no walls, Manhattan distance from (0,0) to (3,4)?", ["5", "7", "12", "25"], 1, "3 + 4 = 7."),
    M("Straight-line distance from (0,0) to (3,4)?", ["5", "7", "12", "25"], 0, "√(9 + 16) = 5."),
    M("Weighted A* (h multiplied by 2) typically…", ["finds shorter paths, because the heuristic is stronger", "explores fewer nodes but may return a longer path", "becomes exactly Dijkstra", "fails to terminate"], 1, "Speed for optimality."),
    M("A* on huge maps can run into trouble with…", ["running out of CPU instructions on long paths", "memory: the frontier can grow very large", "negative heuristic values", "sorting the edges"], 1, "It keeps many nodes around."),
    M("An admissible heuristic never…", ["underestimates the true remaining cost", "overestimates the true remaining cost", "equals 0", "changes during the search"], 1, "Optimism is what guarantees optimality."),
  ]);
  B.add("a2-routing", [
    M("In link-state routing, routers share…", ["full routing tables, but only with direct neighbours", "descriptions of their own links, flooded to all", "nothing at all: each works alone", "only their default routes"], 1, "Everyone builds the same map."),
    M("Distance-vector routing is based on which update?", ["Prim's spanning-tree update", "Bellman–Ford", "Kruskal's edge-sorting update", "A* with a distance heuristic"], 1, "Distributed Bellman–Ford."),
    M("What causes count-to-infinity?", ["Having too many routers in one network", "Stale routes looping between neighbours", "Encrypted routing messages", "Link-state flooding"], 1, "Each router believes the other still has a path."),
    TF("Each link-state router computes its routes independently.", true, "Each runs Dijkstra on the shared map."),
    M("Split horizon means…", ["splitting the network into two separate halves", "not advertising a route back to where you learnt it", "using two paths for every destination", "flooding every update to everyone"], 1, "A milder form of poisoned reverse."),
    M("Which usually converges faster after a failure?", ["Distance-vector", "Link-state", "Same", "Neither ever converges"], 1, "Everyone recomputes from the full map."),
    M("A distance-vector message contains…", ["the whole network map, as the sender sees it", "the sender's current distance to each destination", "the encryption keys for each link", "the packets being forwarded"], 1, "A table of estimates."),
    M("A reaches B at cost 2 (B says X is 5) and C at cost 4 (C says X is 1). A's best route to X?", ["7 via B", "5 via C", "1 via C", "6 via B"], 1, "Via B: 2 + 5 = 7. Via C: 4 + 1 = 5."),
  ]);

  /* ---------- Phase 3 ---------- */
  B.add("a3-lp", [
    { type: "match", q: "Match each LP part to its role.", pairs: [["Decision variables", "What you choose (e.g. how many of each product)"], ["Objective", "The linear quantity to maximise or minimise"], ["Constraints", "Linear limits the choice must satisfy"]], why: "The three ingredients of every LP." },
    M("What shape is an LP's feasible region?", ["A circle, or an ellipse in general", "A convex polygon (a polytope in higher dimensions)", "Always a square", "Any shape, including ones with dents"], 1, "Intersection of half-planes."),
    M("Maximise 2x + y with x + y ≤ 5, x, y ≥ 0. Optimum?", ["(0,5), z = 5", "(5,0), z = 10", "(2.5,2.5), z = 7.5", "(0,0), z = 0"], 1, "Corners (0,0), (5,0), (0,5) give 0, 10, 5."),
    TF("An LP's optimum can only ever be strictly inside the feasible region.", false, "Optima are always found at corners (sometimes a whole edge ties)."),
    M("A \"binding\" constraint at the optimum…", ["is ignored by the solver", "holds with equality", "is violated by the solution", "has no effect on the answer"], 1, "Relaxing it would improve the objective."),
    M("An LP is unbounded when…", ["no point satisfies all the constraints at once", "the objective can improve forever inside the region", "it has only one corner", "every constraint is binding"], 1, "Nothing stops it growing."),
    M("Graphically, you find the optimum by…", ["guessing a likely corner and checking its neighbours", "sliding the objective line to its last contact point", "drawing a circle around the region", "picking the centre of the region"], 1, "The last point touched is a corner."),
    M("Two adjacent corners give the same best z. What does that mean?", ["There's no solution, since the two corners conflict", "Every point on the edge between them is optimal", "Only one of them is really optimal", "The LP is infeasible"], 1, "The objective is parallel to that edge."),
  ]);
  B.add("a3-simplex", [
    M("Why add slack variables?", ["To make each pivot faster", "To turn ≤ constraints into equations", "To remove variables from the problem", "To make the problem nonlinear"], 1, "Slack = unused capacity."),
    M("Dantzig's rule picks the entering variable with…", ["the smallest coefficient, to take careful steps", "the largest positive gain in the objective", "a random choice", "the first alphabetically"], 1, "Biggest improvement per unit."),
    M("The leaving variable is chosen by…", ["the largest ratio", "the minimum ratio test", "random choice", "the objective coefficient"], 1, "The first constraint to become tight."),
    M("A pivot…", ["changes the objective function", "swaps one basic variable for another", "adds a new constraint", "restarts from the origin"], 1, "One step along an edge."),
    TF("The simplex method moves through the interior of the feasible region.", false, "It stays on corners and edges."),
    M("Degeneracy can cause…", ["infeasibility of the whole problem", "a pivot that doesn't improve the objective", "an unbounded LP", "faster convergence"], 1, "Rare cases where you move without gaining."),
    M("For maximisation, simplex has reached the optimum when…", ["all variables are positive and the tableau is full", "no variable has a positive gain (reduced cost)", "the tableau is empty", "z equals 0"], 1, "No edge improves."),
    M("LPs can have astronomically many corners. Why is simplex still practical?", ["It checks them all very quickly using clever tricks", "It usually visits only a small fraction of them", "Corners don't affect the answer", "It follows the gradient instead"], 1, "Worst cases are rare in practice."),
  ]);
  B.add("a3-bracket", [
    M("Three points a < b < c with f(b) lower than both f(a) and f(c) tell you…", ["nothing about the minimum", "a minimum lies between a and c", "the function is linear there", "b is the global minimum"], 1, "That's a bracket."),
    M("Golden-section probes sit at roughly which fractions of the interval?", ["0.25 and 0.75", "0.382 and 0.618", "0.5 only", "0.1 and 0.9"], 1, "Placed so one probe can be reused next step."),
    M("About how many golden-section steps shrink a bracket to 1% of its width?", ["3", "10", "50", "100"], 1, "0.618¹⁰ ≈ 0.008, just under 1%.", { hint: "0.618⁵ ≈ 0.09. Square it." }),
    TF("Golden-section search needs the function's derivative.", false, "It only compares function values."),
    M("Advantage of golden-section over naive two-probe bisection?", ["It halves the bracket every step", "It reuses one old evaluation per step", "It finds the global minimum", "It uses the gradient at each probe"], 1, "One new evaluation per step instead of two."),
    M("When does golden-section search stop?", ["After exactly one step, since the ratio is fixed", "When the bracket is narrower than the tolerance", "When f reaches 0", "Never: it runs forever"], 1, "Width below tolerance."),
    M("The function has several dips inside the bracket. Risk?", ["None: it always finds the lowest dip in the bracket", "It may home in on a local minimum and miss the best", "It crashes on multi-dip functions", "It becomes exact"], 1, "Unimodality is the key assumption."),
    M("Maximising instead of minimising: which side do you keep?", ["The side with the lower probe value", "The side containing the higher probe value", "Always the left", "Always the right"], 1, "Flip the comparison."),
  ]);
  B.add("a3-nm", [
    TF("Nelder–Mead's \"simplex\" is the same thing as the LP simplex method.", false, "Same word, different ideas: here it's a shape of n + 1 points."),
    M("In 2D, Nelder–Mead starts with…", ["a single point", "a triangle of 3 points", "a square of 4 points", "a line of 2 points"], 1, "n + 1 = 3."),
    M("Reflection puts the new point at…", ["the best corner of the current simplex", "the centroid plus (centroid − worst)", "the origin", "a random spot nearby"], 1, "Flip the worst through the middle of the others."),
    TF("Nelder–Mead always finds the global minimum.", false, "It's a local heuristic."),
    M("When does Nelder–Mead shrink the whole simplex?", ["As its very first move on every single iteration", "When reflection and contraction both fail", "On every step, after reflecting", "Never: shrinking isn't one of its moves"], 1, "Last resort."),
    M("A typical stopping rule for Nelder–Mead?", ["After a single reflection step has been taken", "When the simplex is tiny or values nearly equal", "As soon as it performs an expansion", "When the function value becomes negative"], 1, "It has collapsed onto a point."),
    M("Why does Nelder–Mead handle noisy simulations reasonably well?", ["It uses exact derivatives", "It only compares values", "It averages everything", "It doesn't"], 1, "Comparisons are robust."),
    M("How does Nelder–Mead cope with very many dimensions?", ["Better and better, since it has more room to move", "Poorly: slow and unreliable as dimensions grow", "Exactly the same as it does in 2D", "It can't start with more than 3 points"], 1, "A known weakness."),
  ]);

  /* ---------- Phase 4 ---------- */
  B.add("a4-cut", [
    M("A cut in a graph is…", ["removing a single edge", "splitting the nodes into two groups", "a shortest path between two nodes", "a cycle in the graph"], 1, "Edges crossing the split connect the groups."),
    M("A crossing edge of a cut…", ["has both ends in one group", "has one end in each group", "is always the heaviest", "is never in the MST"], 1, "It bridges the two groups."),
    M("The cycle property says…", ["the lightest edge on a cycle is never needed", "the heaviest edge on a cycle (if unique) is in no MST", "cycles are required", "cycles cost nothing"], 1, "Remove it and the rest of the cycle still connects its ends."),
    TF("If all edge weights are distinct, the MST is unique.", true, "No ties, no alternative trees."),
    M("A cut is crossed by edges of weight 5, 5 and 8. Which is safe?", ["Only the 8", "Either 5", "Neither 5", "All three"], 1, "Some MST uses each of the lightest crossing edges."),
    M("How is the cut property proved?", ["By induction on colours", "Exchange argument", "By testing", "It isn't"], 1, "Swap and compare totals."),
    M("Is the lightest edge in the whole graph in some MST?", ["No: it might close a cycle", "Yes: it's the lightest edge across some cut", "Only when the graph is already a tree", "Only if its weight is unique"], 1, "Take the cut separating one of its ends."),
    M("An MST of 6 nodes has how many edges?", ["5", "6", "15", "30"], 0, "n − 1."),
  ]);
  B.add("a4-mst", [
    M("Which data structure speeds up Prim?", ["A stack of visited nodes, most recent on top", "A priority queue of candidate edges or keys", "A union-find structure only", "A hash map of edges only"], 1, "Find the cheapest crossing edge fast."),
    M("Kruskal's running time is dominated by…", ["the union-find operations", "sorting the m edges", "printing the final tree", "choosing the start node"], 1, "The sort costs most."),
    M("Edges A–B 2, A–C 2, B–C 1, C–D 3, B–D 4. MST weight?", ["5", "6", "7", "8"], 1, "B–C 1 + one of the 2s + C–D 3 = 6."),
    TF("Kruskal can grow several separate trees before they merge into one.", true, "It works on a forest."),
    M("Prim always maintains…", ["a forest of separate trees", "exactly one connected tree", "a sorted list of all edges", "a cycle through every node"], 1, "It grows from one start node."),
    M("A classic MST use?", ["Encrypting data before sending", "Connecting points with the least total cable", "Sorting a list of items", "Routing packets along shortest paths"], 1, "Cheapest network."),
    M("Is an MST the same as a shortest-path tree from one node?", ["Yes: both minimise the distance to every node", "No: an MST minimises total weight, not root distance", "Only in directed acyclic graphs", "Only when every weight is equal"], 1, "Different objectives, often different trees."),
    M("A graph is disconnected. What do Prim and Kruskal produce?", ["Both stop with an error", "Prim covers only one component", "Both still build one full tree", "Neither returns anything"], 1, "No edges cross between components."),
  ]);

  /* ---------- Phase 5 ---------- */
  B.add("a5-orient", [
    M("The orientation of p → a → b is the sign of…", ["(a − p) · (b − p), the dot product", "(a − p) × (b − p), the 2-D cross product", "|a − p|, the distance from p to a", "a + b, the vector sum"], 1, "The 2-D cross product."),
    M("With y pointing up, a positive cross product means…", ["clockwise (a right turn), as on a clock face", "counter-clockwise (a left turn)", "the three points are collinear", "the turn is undefined"], 1, "Maths convention."),
    M("(0,0) → (4,0) → (4,3): which way does it turn?", ["Left", "Right", "Straight"], 0, "(4,0) × (4,3) = 4·3 − 0·4 = 12 > 0."),
    TF("The orientation test needs square roots.", false, "Only multiplication and subtraction."),
    M("In screen coordinates (y pointing down), what happens to the sign?", ["Nothing", "It flips", "It doubles", "It becomes zero"], 1, "Mirroring the y-axis reverses orientation."),
    M("Hull code finds three collinear points. What must it decide?", ["Nothing: collinear points can simply be ignored", "Whether to keep the middle point, consistently", "To stop and report an error", "To re-sort all the points"], 1, "Collinear handling is a classic source of bugs."),
    M("How can turn tests check whether a point is inside a convex polygon?", ["They can't: you need to measure the angles instead", "Inside if it's on the same side of every edge", "By counting how many vertices it's near", "By measuring its distance to the centre"], 1, "Same turn direction for all edges."),
    M("|cross product| of (0,0), (4,0), (4,3) relates to the triangle's area how?", ["Area = |cross| = 12", "Area = |cross| / 2 = 6", "Area = |cross|² = 144", "There's no relation between them"], 1, "The cross product is twice the triangle's signed area."),
  ]);
  B.add("a5-wrap", [
    M("At each step, gift wrapping picks the next point that…", ["is nearest to the current point on the hull", "keeps all other points on one side of the edge", "is highest above the current point", "is chosen at random"], 1, "The most extreme turn."),
    M("If the hull has h points, how many wrapping steps are there?", ["n", "h", "n²", "log n"], 1, "One per hull point."),
    M("Each wrapping step costs…", ["O(1)", "O(n)", "O(h)", "O(n²)"], 1, "Scan all candidates."),
    TF("Gift wrapping is output-sensitive.", true, "Its cost depends on the hull size h."),
    M("1,000 points, only 3 on the hull. About how many checks?", ["3", "about 3,000", "about 1,000,000", "about 10,000"], 1, "n × h = 1,000 × 3."),
    M("Where does gift wrapping usually start?", ["A randomly chosen point from the input", "An extreme point, like the leftmost", "The point nearest the centre of mass", "The last point in the list"], 1, "Guaranteed to be on the hull."),
    M("Two candidate points are collinear with the current point. Which does the usual rule pick?", ["The nearer", "The farther", "Either", "Neither"], 1, "Taking the farther point skips points in the middle of an edge."),
    M("Compared with Graham scan, gift wrapping is better when…", ["the hull is large", "the hull is small", "points are sorted", "never"], 1, "n·h beats n log n when h is tiny."),
  ]);
  B.add("a5-graham", [
    M("After choosing the anchor, Graham scan sorts points by…", ["x-coordinate only", "angle around the anchor", "distance from the anchor only", "point name"], 1, "Polar angle order."),
    M("Graham scan keeps candidate hull points on a…", ["queue", "stack", "heap", "tree"], 1, "Push and pop."),
    M("A point is popped when the top two points plus the new point make…", ["a left turn (counter-clockwise)", "a right turn or a straight line", "any turn at all", "a closed loop back to the anchor"], 1, "A dent inward."),
    TF("Graham scan's worst case is O(n²).", false, "It's O(n log n) in every case."),
    M("What does the stack hold when the scan finishes?", ["Every point, in sorted order", "Exactly the hull, in order", "Only the interior points", "Nothing: it's empty"], 1, "The output."),
    M("Why start from the lowest point?", ["It has the smallest label", "It's on the hull, and all the others lie above it", "Any point works, so it's just a convention", "It's the quickest point to find"], 1, "A safe pivot for the angle sort."),
    M("Two points have the same angle from the anchor. Common tie-break?", ["Pick one at random", "By distance from the anchor", "Alphabetically by name", "Drop both points"], 1, "Distance decides which comes first."),
    M("Why is the scan itself linear?", ["It skips most of the points after sorting them", "Each point is pushed once, popped at most once", "It uses a heap to find points", "It stops as soon as the hull closes"], 1, "At most 2n stack operations."),
  ]);

  /* ---------- Phase 6 ---------- */
  B.add("a6-crc", [
    M("A parity bit catches…", ["every error, however many bits", "any odd number of flipped bits", "any even number of flipped bits", "only burst errors"], 1, "Even numbers of flips cancel out."),
    M("CRC works by…", ["counting the 1 bits in the message and storing the total", "polynomial division with XOR (mod 2)", "encrypting the message with a key", "sorting the bits of the message"], 1, "The remainder is the check value."),
    M("In mod-2 arithmetic, addition is the same as…", ["AND", "OR", "XOR", "NOT"], 2, "1 + 1 = 0, no carry."),
    TF("A CRC can correct errors on its own.", false, "It detects; correction needs a code like Hamming, or a resend."),
    M("CRCs are especially good at detecting…", ["deliberate forgery", "burst errors", "correct data", "nothing"], 1, "Common on real links."),
    M("Generator 1011 has degree…", ["2", "3", "4", "11"], 1, "4 bits means degree 3."),
    M("1011 XOR 1101 = ?", ["0110", "1001", "1111", "0000"], 0, "Bit by bit: 1⊕1=0, 0⊕1=1, 1⊕0=1, 1⊕1=0."),
    M("Where are CRCs used?", ["Storing passwords securely so they can't be reversed", "Ethernet frames and ZIP files", "Generating encryption keys", "Sorting large files"], 1, "Everyday error detection."),
  ]);
  B.add("a6-hamming", [
    M("Hamming(7,4) has how many parity bits?", ["1", "3", "4", "7"], 1, "7 − 4 = 3, at positions 1, 2, 4."),
    M("Syndrome 000 means…", ["error at position 0", "no error detected", "two errors", "all bits wrong"], 1, "Every parity check passed."),
    M("Syndrome 111 points at position…", ["1", "4", "7", "3"], 2, "111 in binary is 7."),
    TF("Hamming(7,4) corrects any single-bit error.", true, "The syndrome names the position."),
    M("p1 checks which positions?", ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "1, 2, 4"], 0, "Positions whose binary ends in 1."),
    M("p4 checks which positions?", ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "4 only"], 2, "Positions with the 4s bit set."),
    M("Hamming(7,4)'s code rate?", ["4/7", "3/7", "7/4", "1/2"], 0, "4 data bits per 7 sent."),
    M("Minimum Hamming distance 3 means the code can…", ["correct 3 errors", "correct 1 error (or detect 2)", "correct no errors at all", "detect 3 and correct 2"], 1, "Distance d corrects ⌊(d − 1)/2⌋ errors."),
  ]);

  /* ---------- Phase 7 ---------- */
  B.add("a7-entropy", [
    M("Entropy of a fair coin?", ["0 bits", "0.5 bits", "1 bit", "2 bits"], 2, "Two equally likely outcomes."),
    M("An event with probability 1/8 carries how much surprise?", ["1 bit", "3 bits", "8 bits", "1/8 bit"], 1, "−log₂(1/8) = 3."),
    M("Maximum entropy for 4 symbols?", ["1 bit", "2 bits", "4 bits", "unlimited"], 1, "log₂ 4, when all are equally likely."),
    TF("Entropy depends on what the symbols are called.", false, "Only the probabilities matter."),
    M("A distribution becomes more skewed. Its entropy…", ["rises", "falls", "stays the same", "becomes negative"], 1, "More predictable, less surprise."),
    M("Why does English text compress well?", ["Most English texts are short, so there's little to store", "Frequencies are uneven, with lots of redundancy", "English text is already encrypted", "English uses very few vowels"], 1, "Low entropy per character."),
    M("Probabilities 0.5, 0.25, 0.25. Entropy?", ["1 bit", "1.5 bits", "2 bits", "0.75 bits"], 1, "0.5·1 + 0.25·2 + 0.25·2 = 1.5."),
    M("Entropy gives what about average code length?", ["An upper limit on the length of the best code", "A lower limit no lossless code can beat", "The exact length of the best code", "Nothing about code length"], 1, "The compression floor."),
  ]);
  B.add("a7-huffman", [
    M("Huffman's algorithm repeatedly…", ["splits the largest group in two", "merges the two least probable nodes", "sorts symbols alphabetically", "picks two nodes at random"], 1, "Greedy from the bottom up."),
    M("Among prefix-free codes that assign each symbol a whole-bit codeword, Huffman is…", ["random, depending on the tie-breaks", "optimal (minimum average length)", "the worst possible", "valid only sometimes"], 1, "Provably optimal for symbol-by-symbol coding."),
    M("Prefix-free means…", ["every codeword starts with a 0 bit", "no codeword begins another codeword", "all codewords have equal length", "codewords are sorted by length"], 1, "So decoding needs no separators."),
    TF("Huffman codes can use fractional numbers of bits per symbol.", false, "Every codeword is a whole number of bits."),
    M("Two symbols, each probability 0.5. Huffman gives…", ["0 bits each", "1 bit each", "2 bits each", "a variable length"], 1, "One bit, 0 or 1."),
    M("Which symbol gets the shortest codeword?", ["The rarest", "The most frequent", "The first alphabetically", "A random one"], 1, "Frequent symbols should be cheap."),
    M("How do you decode a Huffman bit stream?", ["Look up fixed-size blocks of bits in a table", "Walk the tree bit by bit to a leaf, then restart", "Reverse the bits and read them backwards", "Use a secret key to unlock it"], 1, "Tree walk."),
    M("Why can't Huffman beat entropy exactly when ideal lengths are fractional?", ["It can: Huffman always matches entropy", "Real codewords must round to whole bits", "Huffman uses random codes", "Entropy is calculated wrongly"], 1, "Rounding costs a little."),
  ]);
  B.add("a7-lzw", [
    M("LZW's dictionary starts with…", ["an empty dictionary that fills as it goes", "every single character of the alphabet", "a list of common English words", "the whole message"], 1, "Longer entries are added as it goes."),
    M("At each step the encoder outputs the code for…", ["one character at a time, whatever the dictionary holds", "the longest string already in the dictionary", "a randomly chosen string", "the whole message at once"], 1, "Greedy longest match."),
    M("After outputting the code for w, the encoder adds what to the dictionary?", ["w", "w + the next character", "the next character only", "nothing"], 1, "A slightly longer phrase for next time."),
    TF("LZW is lossless.", true, "The decoder reproduces the input exactly."),
    M("Which input compresses best with LZW?", ["Random characters", "ABABABABABAB", "Encrypted data", "One character"], 1, "Repeats become dictionary hits."),
    M("What happens when the dictionary fills up?", ["The file is lost and has to be sent again", "Implementations freeze or reset it", "The encoder crashes", "The input is deleted"], 1, "A practical detail."),
    M("Which well-known format uses LZW?", ["GIF images", "JPEG photos", "MP3 audio", "PNG images"], 0, "GIF (and some older UNIX compress tools)."),
    M("LZW on <code>ABABAB</code> with A = 0, B = 1 outputs how many codes?", ["2", "4", "6", "3"], 1, "0, 1, 2 (AB), 2 (AB): four codes for six characters."),
  ]);

  /* ---------- Phase 8 ---------- */
  B.add("a8-hash", [
    M("A hash collision is…", ["a program crash inside the hash function", "two different inputs with the same digest", "a slow hash function", "an empty input"], 1, "Good hashes make these practically impossible to find."),
    M("Preimage resistance means…", ["hashing is fast to compute on any input", "given a digest, you can't find an input for it", "outputs are always short", "inputs are kept secret"], 1, "One-way."),
    M("In proof of work, what is the nonce for?", ["Encrypting the block's contents before it's shared", "A number miners vary until the hash hits the target", "The block's timestamp", "The miner's name"], 1, "Trial and error."),
    TF("A SHA-256 digest's length depends on the input's length.", false, "Always 256 bits."),
    M("Difficulty goes up by one leading hex zero. Expected work…", ["doubles", "×16", "×10", "stays the same"], 1, "Each hex digit has 16 values."),
    M("What links each block to the one before it?", ["A timestamp shared with the previous block", "It includes the previous block's hash", "A digital signature", "The block's size"], 1, "Change one block and every later link breaks."),
    M("A \"51% attack\" means…", ["half the blocks are lost when the network splits", "someone with most mining power can rewrite history", "a bug in the hash function", "the encryption fails"], 1, "PoW assumes an honest majority."),
    M("A hash chain on its own is…", ["tamper-proof", "tamper-evident", "encrypted", "private"], 1, "Evidence, not prevention."),
  ]);
  B.add("a8-keys", [
    M("Diffie–Hellman's security rests on…", ["the difficulty of factoring large numbers", "the difficulty of the discrete logarithm", "the difficulty of sorting", "the difficulty of hashing"], 1, "Easy to compute gᵃ mod p, hard to undo."),
    M("RSA's security rests on…", ["the difficulty of discrete logarithms", "the difficulty of factoring n = p × q", "the difficulty of hashing", "the difficulty of XOR"], 1, "Knowing p and q gives away the private key."),
    M("An RSA public key consists of…", ["(p, q)", "(n, e)", "(d, φ)", "just d"], 1, "n and the encryption exponent."),
    TF("Diffie–Hellman encrypts messages directly.", false, "It only agrees a shared key; encryption happens afterwards."),
    M("Why are p = 23 and g = 5 fine in lessons but useless in practice?", ["They're even numbers, which are easy to factor", "Tiny numbers let anyone try every exponent", "They're both prime", "They're too large to compute with"], 1, "Real primes are 2048+ bits."),
    M("For p = 3, q = 5, what's φ(n)?", ["8", "15", "7", "10"], 0, "(3 − 1) × (5 − 1) = 8."),
    M("RSA's e must satisfy…", ["e is even", "gcd(e, φ) = 1", "e > n", "e = d"], 1, "Otherwise no inverse d exists."),
    M("Real systems usually encrypt bulk data with…", ["RSA on its own, for every byte of the message", "a fast symmetric cipher keyed via RSA or DH", "no encryption at all", "hashes only"], 1, "Hybrid encryption: public-key crypto is slow."),
  ]);

  /* ---------- Phase 9 ---------- */
  B.add("a9-dft", [
    M("The DFT converts a signal from…", ["the frequency domain to the time domain", "the time domain to the frequency domain", "bits to bytes", "analogue to digital"], 1, "Which frequencies are present, and how strongly."),
    M("N samples give how many DFT bins?", ["N/2", "N", "2N", "log N"], 1, "One output per input sample."),
    M("The highest frequency you can represent without aliasing is…", ["fs", "fs / 2", "2 fs", "fs / 4"], 1, "The Nyquist frequency."),
    TF("Aliasing can be removed after the signal has been sampled.", false, "The information is already lost; filter before sampling."),
    M("Bin k corresponds to frequency…", ["k Hz", "k · fs / N", "k · N", "fs / k"], 1, "Spacing fs / N."),
    M("fs = 1,000 Hz, N = 1,000 samples. Bin spacing?", ["0.1 Hz", "1 Hz", "10 Hz", "1,000 Hz"], 1, "1,000 / 1,000."),
    M("For a real-valued signal, the magnitude spectrum is…", ["random", "symmetric", "all zeros", "only positive at k = 0"], 1, "That's why only bins up to N/2 are usually shown."),
    M("A window function (e.g. Hann) is used to…", ["increase aliasing so it can be removed", "reduce leakage by tapering the edges", "add noise", "speed up the FFT"], 1, "Smoother edges, less smearing."),
  ]);
  B.add("a9-fft", [
    M("The FFT's core idea is to…", ["approximate the DFT using fewer terms", "split into even/odd halves recursively, sharing work", "skip every other sample", "sort the samples first"], 1, "Divide and conquer."),
    M("FFT running time?", ["O(N²)", "O(N log N)", "O(N)", "O(2ᴺ)"], 1, "log N levels, N work each."),
    M("N = 1,024. Roughly N log₂ N vs N²?", ["10,000 vs 1,000,000", "1,000 vs 10,000", "equal", "1,000,000 vs 10,000"], 0, "1,024 × 10 ≈ 10⁴; 1,024² ≈ 10⁶."),
    TF("The FFT is an approximation of the DFT.", false, "Same result, computed faster."),
    M("A \"butterfly\" combines two values a and b into…", ["a × b, then W·a", "a + W·b and a − W·b", "a and b swapped", "a − b only"], 1, "One multiply shared by two outputs."),
    M("What's a twiddle factor?", ["A bug in the FFT caused by rounding", "The complex rotation Wᵏ used in a butterfly", "The sample rate", "A window function"], 1, "Roots of unity."),
    M("Radix-2 FFT needs N to be…", ["odd", "a power of 2", "prime", "less than 100"], 1, "So the halving reaches 1."),
    M("Which of these depends on the FFT?", ["Sorting names into alphabetical order", "Audio processing, Wi-Fi and image compression", "Hashing passwords for storage", "Binary search in a sorted list"], 1, "It's everywhere in signal processing."),
  ]);

  /* ---------- Phase 10 ---------- */
  B.add("a10-attn", [
    M("In attention, how is the relevance score between two tokens computed?", ["The distance between their positions in the sentence", "One token's query dotted with the other's key", "The product of their lengths", "A learned random number"], 1, "q · k (then scaled)."),
    M("After softmax, a token's attention weights…", ["are all exactly equal", "are positive and sum to 1", "can be negative", "sum to N"], 1, "A share of attention."),
    M("A token's attention output is…", ["the key with the highest score", "a weighted sum of the value vectors", "the query vector itself", "the largest raw score"], 1, "A blend, not a single pick."),
    TF("Attention's cost grows linearly with sequence length.", false, "Every token scores every token: quadratic."),
    M("The causal mask stops each token from attending to…", ["itself", "earlier tokens", "later (future) tokens", "all other tokens"], 2, "No peeking ahead when generating."),
    M("\"Self\"-attention means…", ["a token only attends to itself, never to others", "Q, K and V all come from one sequence", "the model trains itself without data", "the model uses a single head only"], 1, "The sequence attends to itself."),
    M("Scores [3, 1] after softmax give the first token roughly…", ["0.5", "0.75", "0.88", "1.0"], 2, "e³ / (e³ + e¹) = 1 / (1 + e⁻²) ≈ 0.88.", { hint: "Only the difference (2) matters, and e² ≈ 7.4." }),
    M("An embedding is…", ["a compression format for storing text", "a learned vector representing a token", "a mask over future tokens", "the output of softmax"], 1, "Tokens become points in a vector space."),
  ]);
})();

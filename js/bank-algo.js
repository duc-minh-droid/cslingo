/* Algorithms revision bank — new graphs, numbers and scenarios per session, no calculator needed. Numbers verified with node. */
(function () {
  const N = NIC, B = N.bank, Qf = N.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  const GD = { S: [60, 130], A: [190, 50], B: [190, 210], C: [330, 130], T: [450, 130] };
  const ED = [["S", "A", 2], ["S", "B", 5], ["A", "B", 1], ["A", "C", 6], ["B", "C", 2], ["C", "T", 1]]; // dist S0 A2 B3 C5 T6

  /* ---------- Phase 1 ---------- */
  B.add("a1-anatomy", [
    { type: "multi", q: "Which properties must a procedure have to count as an algorithm? Select all.", o: ["Every step is unambiguous", "It finishes after a finite number of steps", "It's written in a programming language", "It produces the right output for every valid input"], a: [0, 1, 3],
      why: "Language doesn't matter: a recipe on paper can be an algorithm. Clarity, termination and correctness do." },
    M("A loop sums a list. Which invariant proves it correct?", ["total is always positive", "after k items, total = the sum of the first k items", "total equals the last item", "k is always even"], 1, "True at the start (0 items, total 0), kept by each step, and at the end it says total = sum of everything."),
    { type: "bug", q: "This should return the <b>smallest</b> item of a non-empty list. Click the faulty line.", code: ["def smallest(xs):", "    best = xs[0]", "    for x in xs:", "        if x > best:", "            best = x", "    return best"], a: 3,
      why: "<code>x &gt; best</code> keeps the largest. It should be <code>x &lt; best</code>." },
    { type: "order", q: "Order the three checks that turn a loop invariant into a proof.", items: ["Initialisation: it's true before the loop starts", "Maintenance: one iteration keeps it true", "Termination: when the loop ends, it gives the result you want"],
      why: "Start true, stay true, finish useful." },
    M("An <code>average(xs)</code> function works in every test. Which input is most likely to break it?", ["[1, 2, 3]", "[] (the empty list)", "[5]", "[0, 0]"], 1, "Dividing by the length of an empty list is division by zero."),
  ]);
  B.add("a1-bigo", [
    M("A loop halves n each time until it reaches 1. About how many iterations for n = 1,000,000?", ["20", "1,000", "500,000", "1,000,000"], 0, "2²⁰ ≈ 10⁶, so about 20 halvings."),
    M("3n² + 100n + 5 simplifies to…", ["O(n)", "O(n²)", "O(100n)", "O(3n² + 100n)"], 1, "Keep the fastest-growing term, drop constants."),
    { type: "match", q: "Match each loop shape to its growth.", pairs: [["One loop over n items", "O(n)"], ["A full loop inside another full loop", "O(n²)"], ["Halve the problem each step", "O(log n)"], ["A full pass over n items at each of log n levels", "O(n log n)"]],
      why: "These four shapes cover most everyday code." },
    M("An O(n²) algorithm takes 1 second for n = 1,000. Roughly how long for n = 2,000?", ["2 s", "4 s", "8 s", "1 s"], 1, "Doubling n quadruples n²."),
    TF("An O(n) algorithm is faster than an O(n²) one for every input size.", false, "Big-O ignores constants. For small n, a well-tuned O(n²) can win."),
  ]);
  B.add("a1-surfer", [
    M("A page has rank 0.2 and 4 outgoing links. How much rank does each link pass on?", ["0.2", "0.05", "0.8", "0.5"], 1, "Rank is split equally: 0.2 / 4 = 0.05."),
    { type: "match", q: "Match each problem to its fix.", pairs: [["A page with no outgoing links", "Spread its rank evenly over all pages"], ["Two pages that only link to each other", "Teleport: occasionally jump to a random page"], ["1,000 junk pages linking to one shop", "Weight each link by the rank of the page it comes from"]],
      why: "Dangling pages leak, closed loops trap, and link spam is defeated by rank-weighted links." },
    M("Rank flows into the cycle A → B → A and never leaves. What does the ranking look like without teleportation?", ["Uniform", "A and B hoard the rank; other pages drain towards zero", "Every page gets equal rank", "The ranks go negative"], 1, "A closed loop is a rank trap."),
    M("You lower damping from 0.85 to 0.5. What happens to the ranks?", ["They become more extreme", "They become more uniform, since teleporting happens more often", "Nothing", "They all become zero"], 1, "More random jumps means links matter less."),
    TF("A link from a highly ranked page is worth more than a link from an obscure one.", true, "That's the core PageRank idea: rank comes from rank."),
  ]);
  B.add("a1-pagerank", [
    M("Page P links to 3 pages. What's in P's column of the link matrix H?", ["1 in each of the 3 rows", "1/3 in each of the 3 rows, 0 elsewhere", "3 in each row", "1/3 everywhere"], 1, "Columns are sources; P's rank splits three ways."),
    M("Why is every entry of the Google matrix G strictly positive?", ["Links are always positive", "The teleport term adds (1 − d)/N to every entry", "Because of rounding", "Dangling pages are removed"], 1, "That tiny floor is what guarantees convergence."),
    M("N = 4 pages, d = 0.8. What does teleportation add to every entry of G?", ["0.2", "0.05", "0.8", "0.25"], 1, "(1 − d)/N = 0.2/4 = 0.05."),
    M("What do the entries of the PageRank vector add up to?", ["0", "1", "N", "It varies"], 1, "It's a probability distribution over pages."),
    M("The web has billions of pages but each links to only a few. Per iteration, the work grows with…", ["N² (every pair of pages)", "the number of links", "N³", "a constant"], 1, "Sparse multiplication only touches existing links, plus a cheap teleport term."),
  ]);

  /* ---------- Phase 2 ---------- */
  B.add("a2-dijkstra", [
    { type: "pick", q: "Dijkstra from S. <b>Click every node whose tentative distance gets lowered after it was first set.</b>", fig: Qf.graph(GD, ED, { pick: "nodes", w: 510, h: 260 }), a: ["B", "C"],
      why: "B starts at 5 (from S), then drops to 3 via A. C starts at 8 (via A), then drops to 5 via B. A and T are set once." },
    M("Using the map shown, what is the shortest distance from S to T?", ["5", "6", "8", "9"], 1, "S→A→B→C→T = 2 + 1 + 2 + 1 = 6.", { fig: Qf.graph(GD, ED, { w: 510, h: 260 }) }),
    M("Every edge has weight 1. Dijkstra then behaves like…", ["Depth-first search", "Breadth-first search", "Random search", "Prim's algorithm"], 1, "It settles nodes in order of hop count, exactly like BFS."),
    M("Why can one negative edge break Dijkstra?", ["Negatives can't be stored", "A settled node could later be reached more cheaply, but Dijkstra never revisits settled nodes", "It makes the graph directed", "It creates an infinite loop always"], 1, "The \"settled means final\" rule assumes paths never get cheaper."),
    M("With a binary heap, Dijkstra's running time is about…", ["O(V)", "O((V + E) log V)", "O(V³)", "O(2^V)"], 1, "Each node is popped once and each edge can trigger a heap update."),
  ]);
  B.add("a2-astar", [
    M("A* frontier: node X has g = 4, h = 3; node Y has g = 2, h = 6. Which is expanded first?", ["X (f = 7)", "Y (f = 8)", "Y, because g is smaller", "Either"], 0, "A* expands the lowest f = g + h."),
    M("With h = 0 everywhere, A* becomes…", ["Breadth-first search", "Dijkstra", "Greedy best-first", "Random"], 1, "f = g, which is exactly Dijkstra's ordering."),
    M("Your heuristic sometimes overestimates. What can happen?", ["Nothing", "A* may return a path that isn't the shortest", "A* never terminates", "A* explores every node"], 1, "Admissibility is what guarantees optimality."),
    { type: "cat", q: "4-direction grid (no diagonal moves), each step costs 1. Admissible?", buckets: ["Admissible", "Not admissible"],
      items: [["Manhattan distance", 0], ["Straight-line distance", 0], ["2 × Manhattan distance", 1], ["h = 0", 0]],
      why: "Manhattan is the exact cost with no walls, so it never overestimates; straight-line is even smaller. Doubling it overestimates." },
    M("Why does A* usually explore fewer nodes than Dijkstra?", ["It uses less memory", "The heuristic steers it towards the goal instead of in every direction", "It skips edges", "It stops early without checking"], 1, "Dijkstra grows in circles; A* grows towards the target."),
  ]);
  B.add("a2-routing", [
    { type: "cat", q: "Link-state or distance-vector?", buckets: ["Link-state", "Distance-vector"],
      items: [["Every router holds the full network map", 0], ["Routers share distance tables only with neighbours", 1], ["Each router runs Dijkstra locally", 0], ["Vulnerable to count-to-infinity", 1]],
      why: "Link-state floods the map and computes locally. Distance-vector gossips estimates hop by hop." },
    M("Router A reaches C at cost 6 via D. Neighbour B (1 hop away) now advertises \"C is 3 from me\". What does A do?", ["Keep 6 via D", "Switch to 4 via B", "Switch to 3 via B", "Drop C"], 1, "Via B costs 1 + 3 = 4, which beats 6."),
    M("What does poisoned reverse do?", ["Encrypts routes", "Tells a neighbour \"my route to X through you is infinite\", so it won't route back through me", "Deletes the routing table", "Doubles every cost"], 1, "It kills the two-node loop behind count-to-infinity."),
    M("RIP treats 16 as infinity. What does that imply?", ["Networks can have at most 16 routers", "No usable path can be longer than 15 hops", "Costs are in seconds", "Loops are impossible"], 1, "A small infinity makes counting up quick, but limits network diameter."),
    M("Why is internet routing hierarchical?", ["For encryption", "So routers don't need a route to every single machine: they route to regions first", "Because Dijkstra only works on trees", "To slow traffic down"], 1, "Aggregation keeps routing tables and updates manageable."),
  ]);

  /* ---------- Phase 3 ---------- */
  B.add("a3-lp", [
    M("Maximise 3x + y with x ≤ 4, x + y ≤ 6, x, y ≥ 0. The corners are (0,0), (4,0), (4,2), (0,6). Which is optimal?", ["(4,0), z = 12", "(4,2), z = 14", "(0,6), z = 6", "(0,0), z = 0"], 1, "3·4 + 2 = 14 is the largest corner value."),
    M("Why is an LP optimum always at a corner of the feasible region?", ["Corners are easy to draw", "The objective is linear, so you can keep sliding along it until a corner stops you", "Corners are always integers", "It isn't"], 1, "A linear function has no interior peaks."),
    { type: "cat", q: "Can this constraint appear in a linear program?", buckets: ["Linear", "Not linear"],
      items: [["3x + 2y ≤ 12", 0], ["x · y ≤ 5", 1], ["x² + y ≤ 4", 1], ["x − y ≥ 1", 0]],
      why: "Linear means variables only multiplied by constants and added." },
    M("The constraints contradict each other, so no point satisfies all of them. What does the solver report?", ["Unbounded", "Infeasible", "Optimal at (0,0)", "Degenerate"], 1, "Empty feasible region = infeasible."),
    M("You add one more constraint to a maximisation LP. The optimum can…", ["only get better", "stay the same or get worse", "only get better or stay the same", "become negative infinity always"], 1, "Extra constraints shrink the region, so the best available can't improve."),
  ]);
  B.add("a3-simplex", [
    M("Each simplex pivot moves…", ["to a random interior point", "along an edge to a neighbouring corner that improves the objective", "to the centre of the region", "to every corner in turn"], 1, "Corner to adjacent corner, uphill each time."),
    M("Why does the ratio test pick the <b>smallest</b> ratio?", ["It's faster", "To stop at the first constraint you hit, so you stay feasible", "To maximise profit immediately", "It's arbitrary"], 1, "Going further would cross a constraint."),
    M("When does simplex stop?", ["After n pivots", "When no neighbouring corner improves the objective", "When it reaches the origin", "When all variables are equal"], 1, "Local optimality at a corner is global optimality for an LP."),
    M("How does simplex usually perform in practice?", ["Always exponential", "Usually fast, even though bad worst cases exist", "Always one pivot", "Slower than checking every corner"], 1, "Contrived examples can make it exponential, but real problems rarely do."),
    TF("Simplex evaluates every corner of the feasible region.", false, "It only visits a path of improving corners, usually a tiny fraction."),
  ]);
  B.add("a3-bracket", [
    M("By what factor does golden-section search shrink the bracket each step?", ["0.5", "about 0.618", "0.9", "0.1"], 1, "Each step keeps about 61.8% of the interval."),
    M("What must be true about the function inside the bracket?", ["It's linear", "It's unimodal: one dip (or one peak)", "It's differentiable", "It's positive"], 1, "With two dips, discarding a side can throw away the true minimum."),
    M("Starting width 1, about how wide is the bracket after 10 steps?", ["about 0.5", "about 0.1", "about 0.008", "about 0.0001"], 2, "0.618¹⁰ ≈ 0.008, roughly 1/120.", { hint: "0.618⁵ ≈ 0.09. Square it." }),
    M("Minimising on [0, 10] with probes at 3.82 and 6.18: f(3.82) = 5, f(6.18) = 2. The new bracket is…", ["[0, 6.18]", "[3.82, 10]", "[3.82, 6.18]", "[0, 3.82]"], 1, "The lower value is at 6.18, so the minimum can't be left of 3.82."),
    M("What's special about the golden ratio here?", ["It's prettier", "One of the two probes can be reused next step, so each step costs just one new evaluation", "It guarantees an exact answer", "It avoids unimodality"], 1, "Re-using a point halves the evaluations per step."),
  ]);
  B.add("a3-nm", [
    { type: "match", q: "Match each Nelder–Mead move to what it does.", pairs: [["Reflect", "Flip the worst corner through the others' midpoint"], ["Expand", "Go even further in a direction that paid off"], ["Contract", "Pull the worst corner partway back in"], ["Shrink", "Pull every corner towards the best one"]],
      why: "Reflect first, stretch if it worked, pull back if it overshot, shrink as the last resort." },
    M("How many corners does Nelder–Mead's simplex have in 5 dimensions?", ["5", "6", "10", "2"], 1, "n + 1 points: a triangle in 2D, a tetrahedron in 3D."),
    M("What does Nelder–Mead need from the function?", ["Its gradient", "Only function values to compare", "Its second derivative", "A linear form"], 1, "It works purely by comparing values, so it suits black-box simulations."),
    M("A limitation of Nelder–Mead?", ["It can't handle 2D", "It can get stuck or stall and gives no optimality guarantee", "It needs a sorted list", "It only works on lines"], 1, "It's a heuristic local method."),
    M("The reflected point is better than every current corner. What does Nelder–Mead try next?", ["Shrink", "Expand further in that direction", "Contract", "Stop"], 1, "A good direction is worth pushing."),
  ]);

  /* ---------- Phase 4 ---------- */
  B.add("a4-cut", [
    M("A cut is crossed by edges of weight 7, 3 and 9. Which must some MST use?", ["7", "3", "9", "All of them"], 1, "The lightest crossing edge is always safe."),
    M("A cycle has edges 4, 6 and 11 (all distinct). Which one can no MST contain?", ["4", "6", "11", "Any of them"], 2, "The heaviest edge on a cycle is never needed."),
    TF("The heaviest edge in the whole graph can never be in an MST.", false, "If it's the only link to some node (a bridge), every spanning tree must use it."),
    M("Node Z has exactly one edge. What's true?", ["That edge is never in the MST", "That edge is in every spanning tree, including every MST", "Z is left out", "It depends on weights"], 1, "It's the only way to reach Z."),
    M("Why is the cut property enough to prove Prim correct?", ["It isn't", "Each Prim step adds the lightest edge across the cut (tree | rest), which is always safe", "Prim checks all trees", "Prim sorts edges"], 1, "Every greedy choice is a safe edge."),
  ]);
  B.add("a4-mst", [
    M("Edges A–B 1, B–C 4, A–C 3, C–D 2, B–D 5. What's the MST weight?", ["6", "7", "8", "10"], 0, "Kruskal takes A–B 1, C–D 2, A–C 3; the rest close loops. Total 6."),
    M("What does union-find do inside Kruskal?", ["Sorts the edges", "Answers \"are these two nodes already connected?\" quickly", "Finds shortest paths", "Chooses the start node"], 1, "It's the cycle check."),
    M("Which usually suits a very dense graph better?", ["Kruskal", "Prim", "Neither can handle it", "Dijkstra"], 1, "Kruskal must sort all ~n² edges; Prim grows from nodes."),
    M("All edges have weight 1. How many different MSTs can there be?", ["Exactly one", "Possibly many: every spanning tree has the same total", "None", "Two"], 1, "Ties allow multiple minimum trees."),
    { type: "order", q: "Order Kruskal's steps.", items: ["Sort all edges by weight", "Take the next cheapest edge", "Keep it if its ends are in different components; otherwise skip", "Stop once n − 1 edges are kept"],
      why: "Sort, scan, skip loop-makers, stop at n − 1." },
  ]);

  /* ---------- Phase 5 ---------- */
  B.add("a5-orient", [
    { type: "cat", q: "Which way does each path turn?", buckets: ["Left", "Right", "Straight"],
      items: [["(0,0) → (1,0) → (1,1)", 0], ["(0,0) → (1,0) → (2,−1)", 1], ["(0,0) → (1,1) → (3,3)", 2]],
      why: "Cross products: 1 (left), −1 (right), 0 (collinear)." },
    M("Cross product (a − p) × (b − p) for p = (0,0), a = (2,1), b = (1,3)?", ["−5, right", "5, left", "0, straight", "7, left"], 1, "2·3 − 1·1 = 5, positive, so a left turn."),
    M("Why use the cross product instead of measuring angles?", ["It's the only option", "No trigonometry: with integer points it's exact multiply-and-subtract", "Angles are illegal", "It's slower but prettier"], 1, "Exact integer arithmetic avoids rounding problems."),
    M("Walking around a convex polygon counter-clockwise, every turn is…", ["right", "left", "straight", "alternating"], 1, "Convexity means turning the same way throughout."),
    M("Three points are collinear. What must hull code decide?", ["Nothing", "Whether to keep or drop the middle point, applied consistently", "To crash", "To sort again"], 1, "Collinear points are the classic edge case."),
  ]);
  B.add("a5-wrap", [
    M("Why start gift wrapping at the leftmost point?", ["It's the smallest", "Nothing lies further left, so it's guaranteed to be on the hull", "It's random", "It's the centre"], 1, "Any extreme point would do."),
    M("100 points, 6 on the hull. About how many point checks does gift wrapping make?", ["about 100", "about 600", "about 10,000", "about 6"], 1, "n · h = 100 × 6."),
    M("Gift wrapping is slowest when…", ["all points are inside a triangle", "every point is on the hull, making it O(n²)", "there are only 3 points", "points are sorted"], 1, "One sweep per hull point, and every point is a hull point."),
    M("When does gift wrapping stop?", ["After n steps", "When it returns to the starting point", "When it hits the rightmost point", "When the stack is empty"], 1, "The wrap closes the loop."),
    TF("Gift wrapping must sort the points first.", false, "It only uses turn tests; Graham scan is the one that sorts."),
  ]);
  B.add("a5-graham", [
    M("Graham scan's anchor is…", ["a random point", "the lowest point (leftmost if tied)", "the centre of mass", "the last point"], 1, "It's guaranteed to be on the hull."),
    M("Why is the scan part O(n)?", ["It skips points", "Each point is pushed once and popped at most once", "It uses a heap", "It doesn't loop"], 1, "Total stack operations are at most 2n."),
    M("Stack is [P₀, A, B]. Next point C. A → B → C is a right turn. What happens?", ["Push C", "Pop B, then re-check with the new top", "Pop A", "Stop"], 1, "A right turn means B dents the hull."),
    M("Graham scan's total cost is O(n log n) because of…", ["the stack", "the angle sort", "the turn tests", "the anchor search"], 1, "Sorting dominates."),
    M("1,000 points all lying on a circle. Which is faster?", ["Gift wrapping", "Graham scan", "Equal", "Neither works"], 1, "h = n makes wrapping O(n²); Graham stays O(n log n)."),
  ]);

  /* ---------- Phase 6 ---------- */
  B.add("a6-crc", [
    { type: "multi", q: "One even-parity bit. Which errors are detected? Select all.", o: ["1 flipped bit", "2 flipped bits", "3 flipped bits", "5 flipped bits", "6 flipped bits"], a: [0, 2, 3],
      why: "Odd numbers of flips change the parity; even numbers cancel." },
    M("Even parity on data 1100101. What's the parity bit?", ["0", "1"], 0, "Four 1s is already even, so the parity bit is 0."),
    M("A CRC generator has degree 3 (4 bits, e.g. 1011). How many zeros are appended, and how long is the remainder?", ["3 zeros, 3-bit remainder", "4 zeros, 4-bit remainder", "1 zero, 1-bit remainder", "none"], 0, "Degree k means k zeros and a k-bit remainder."),
    M("Message 1101, generator 101. Append two zeros and divide by XOR. The remainder is…", ["00", "01", "10", "11"], 2, "110100 ÷ 101 leaves 10, so the frame sent is 110110.", { hint: "110 ⊕ 101 = 011, then bring down the next bit and keep going." }),
    M("The receiver divides a frame and gets a non-zero remainder. What does that mean?", ["It's clean", "Something was corrupted in transit", "The generator is wrong", "Resend the generator"], 1, "A clean frame divides exactly."),
  ]);
  B.add("a6-hamming", [
    M("Hamming(7,4) syndrome p4 p2 p1 = 101. Which position is wrong?", ["2", "3", "5", "6"], 2, "101 in binary is 5."),
    M("Where do the parity bits sit in Hamming(15,11)?", ["1, 2, 3, 4", "1, 2, 4, 8", "12–15", "odd positions"], 1, "Powers of two."),
    M("Which positions does p2 check in Hamming(7,4)?", ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "2, 4, 6"], 1, "Every position whose binary has the middle bit set."),
    M("Data 0001 encodes to 1101001. Bit 2 flips, giving 1001001. What syndrome does the receiver compute?", ["000", "010", "110", "001"], 1, "Only p2's group is disturbed, so the syndrome is 010 = position 2."),
    M("What's SECDED's extra bit for?", ["Faster decoding", "An overall parity bit that detects (not corrects) double errors", "Encryption", "Compression"], 1, "Single-error correcting, double-error detecting."),
  ]);

  /* ---------- Phase 7 ---------- */
  B.add("a7-entropy", [
    M("A fair 8-sided die. Entropy?", ["1 bit", "2 bits", "3 bits", "8 bits"], 2, "log₂ 8 = 3."),
    M("An event has probability 1/4. How surprising is it?", ["1 bit", "2 bits", "4 bits", "0.25 bits"], 1, "−log₂(1/4) = 2."),
    M("A source always sends the same symbol. Its entropy?", ["0 bits", "1 bit", "infinite", "depends on the symbol"], 0, "No surprise, no information."),
    { type: "order", q: "Order these sources from lowest entropy to highest.", items: ["A coin that always lands heads", "A fair coin", "A fair 4-sided die", "A fair 8-sided die"],
      why: "0, 1, 2 and 3 bits." },
    M("What does entropy tell you about compression?", ["Nothing", "No lossless code can average fewer bits per symbol than the entropy", "Compression always halves size", "It's the maximum size"], 1, "It's the floor you can approach but not beat."),
  ]);
  B.add("a7-huffman", [
    M("Which code is prefix-free?", ["{0, 01, 11}", "{0, 10, 110, 111}", "{1, 10, 11}", "{00, 0, 1}"], 1, "No codeword starts another. In {0, 01, 11}, 0 is a prefix of 01."),
    M("With A = 0, B = 10, C = 110, D = 111, what does <code>1100</code> decode to?", ["CA", "BB", "DA", "AC"], 0, "110 | 0 = C, A."),
    M("Huffman for probabilities 0.5, 0.25, 0.25. Average code length?", ["1 bit", "1.5 bits", "2 bits", "1.25 bits"], 1, "Lengths 1, 2, 2: 0.5 + 0.5 + 0.5 = 1.5 (which equals the entropy here)."),
    M("Why must the Huffman code table be sent with the data?", ["For encryption", "The receiver can't decode without knowing which codeword means which symbol", "To check errors", "It needn't be"], 1, "It's built from the sender's frequencies."),
    M("Huffman on four equally likely symbols gives…", ["1 bit each", "2 bits each: no gain over fixed length", "3 bits each", "variable lengths"], 1, "Uniform frequencies leave no skew to exploit."),
  ]);
  B.add("a7-lzw", [
    M("LZW encodes <code>AAAA</code> with the dictionary A = 0. What's the output?", ["0, 0, 0, 0", "0, 1, 0", "0, 1", "1, 1"], 1, "A → 0 (add AA = 1), AA → 1 (add AAA = 2), A → 0."),
    M("Why doesn't LZW send its dictionary?", ["It's too big", "The decoder rebuilds the same dictionary from the codes it receives", "It's encrypted", "It's fixed forever"], 1, "Both sides grow identical tables from the same data."),
    M("The decoder receives a code it hasn't built yet. What rule rebuilds it?", ["Skip it", "Previous output + the first character of the previous output", "Ask the encoder", "Use code 0"], 1, "It must be the entry the encoder just created."),
    M("Which data does LZW compress best?", ["Random bytes", "Text with lots of repeated phrases", "Already-zipped files", "Encrypted data"], 1, "It exploits repeated sequences."),
    TF("LZW needs the symbol frequencies before it starts.", false, "That's Huffman. LZW learns as it goes."),
  ]);

  /* ---------- Phase 8 ---------- */
  B.add("a8-hash", [
    { type: "multi", q: "Which properties should a cryptographic hash have? Select all.", o: ["Same input always gives the same digest", "A tiny change to the input changes the digest completely", "You can recover the input from the digest", "Fixed-length output"], a: [0, 1, 3],
      why: "Deterministic, avalanche, fixed-length and one-way. Reversibility would defeat its purpose." },
    M("Proof of work needs 3 leading hex zeros. About how many tries on average?", ["48", "about 4,000", "about 1 million", "3"], 1, "16³ = 4,096."),
    M("Why does editing an old block break every later block?", ["Blocks are encrypted", "Each block stores the previous block's hash, so the change ripples forward", "Blocks share a key", "Time stamps change"], 1, "The chain of hashes links them."),
    M("Mining vs checking a proof of work:", ["both are slow", "mining takes many tries; checking takes one hash", "both take one hash", "checking is slower"], 1, "That asymmetry is the whole point."),
    TF("Hashing a password encrypts it.", false, "Encryption can be reversed with a key; a hash is one-way."),
  ]);
  B.add("a8-keys", [
    M("Diffie–Hellman: p = 11, g = 2, Alice's secret a = 3, Bob's secret b = 4. What shared secret do they get?", ["3", "4", "5", "8"], 1, "A = 2³ mod 11 = 8, B = 2⁴ mod 11 = 5. Alice: 5³ = 125 mod 11 = 4. Bob: 8⁴ mod 11 = 4.", { hint: "125 = 11 × 11 + 4." }),
    M("How do real protocols stop a man-in-the-middle during Diffie–Hellman?", ["Bigger primes alone", "Authenticate the exchange, e.g. with signed certificates", "Send the secret twice", "Use a CRC"], 1, "DH agrees a key but doesn't prove who you're talking to."),
    M("Toy RSA with p = 5, q = 7, so n = 35 and φ = 24. Take e = 5. What's d?", ["5", "7", "11", "29"], 0, "5 × 5 = 25 = 24 + 1, so d = 5 (it happens to equal e here)."),
    M("In RSA, who uses which key to send you a secret?", ["They use your private key", "They encrypt with your public key; only your private key decrypts", "Both use the public key to decrypt", "No keys are needed"], 1, "Public locks, private unlocks."),
    M("Why is raw (\"textbook\") RSA risky?", ["It's slow", "It's deterministic: the same message always gives the same ciphertext, leaking information", "It uses primes", "It can't encrypt numbers"], 1, "Real RSA adds random padding (OAEP)."),
  ]);

  /* ---------- Phase 9 ---------- */
  B.add("a9-dft", [
    M("DFT of the constant signal [3, 3, 3, 3]: where is the energy?", ["Spread evenly", "All in bin k = 0", "All in bin k = 2", "Nowhere"], 1, "A constant is pure DC."),
    M("A 90 Hz tone is sampled at 100 Hz. Where does it appear?", ["90 Hz", "10 Hz", "50 Hz", "190 Hz"], 1, "It folds down: 100 − 90 = 10 Hz."),
    M("8,000 Hz sample rate, 800-sample window. Bin spacing?", ["1 Hz", "10 Hz", "100 Hz", "0.1 Hz"], 1, "fs / N = 8000 / 800 = 10 Hz."),
    M("Energy smears into neighbouring bins. What's the usual cause?", ["Sampling too slowly", "The window doesn't hold a whole number of cycles (leakage)", "Too many samples", "A negative frequency"], 1, "Mismatched window edges spread the energy."),
    M("You record twice as long at the same sample rate. The bin spacing…", ["doubles", "halves: finer frequency resolution", "stays the same", "goes to zero"], 1, "Spacing = fs / N, and N doubled."),
  ]);
  B.add("a9-fft", [
    M("How many levels of butterflies does an 8-point FFT have?", ["2", "3", "8", "4"], 1, "log₂ 8 = 3."),
    M("In an 8-point FFT's bit-reversed order, which index lands in position 1?", ["1", "2", "4", "7"], 2, "1 = 001 reversed is 100 = 4."),
    M("How many butterflies per level for N = 16?", ["4", "8", "16", "32"], 1, "N/2 pairs per level."),
    M("Your signal has 1,000 samples. How does a radix-2 FFT handle it?", ["It can't", "Zero-pad to 1,024", "Drop to 512 samples", "Use N = 1,000 directly"], 1, "Pad up to the next power of two."),
    TF("The FFT gives exactly the same result as the direct DFT, apart from rounding.", true, "Same sum, regrouped."),
  ]);

  /* ---------- Phase 10 ---------- */
  B.add("a10-attn", [
    M("Softmax of scores [0, 0, 0]. The weights?", ["[1, 0, 0]", "[1/3, 1/3, 1/3]", "[0, 0, 0]", "undefined"], 1, "Equal scores give equal shares."),
    M("With a causal mask, the 3rd token in a sentence can attend to how many tokens?", ["1", "3", "all of them", "2"], 1, "Itself and the two before it."),
    M("Why use several attention heads?", ["To save memory", "Different heads can track different relationships at the same time", "To avoid softmax", "To sort the words"], 1, "Each head has its own query, key and value projections."),
    M("Why add position information to token embeddings?", ["To make vectors longer", "Attention alone ignores word order", "To encrypt tokens", "To speed up softmax"], 1, "Without it, shuffled sentences look the same."),
    M("Context length triples. Attention's score matrix grows…", ["3×", "6×", "9×", "27×"], 2, "n² scaling: 3² = 9."),
  ]);
})();

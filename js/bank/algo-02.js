(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const N = NIC,
    B = N.bank;
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
})();

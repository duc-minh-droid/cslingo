/* boss-algo-p5-x: extra Phase 5 boss questions (clockwise wrapping, Graham bug, interior elimination, ties, uses of hulls). New points; numbers checked with node. */
(function () {
  const Qf = NIC.qfig;
  // Hull = A B C D E. Clockwise wrapping from the leftmost point A with a reference straight above it:
  // clockwise angles from "up": E 26.6, H 45, D 59, G 63.4, F 90, C 99.5, B 135 -> E is swept first.
  const K = { A: [1, 3], B: [4, 0], C: [7, 2], D: [6, 6], E: [3, 7], F: [4, 3], G: [5, 5], H: [2, 4] };
  const def = NIC.bossDef("a5-boss");
  def.qs.push(
    {
      type: "pick",
      q: "Gift wrapping starts at the leftmost point <b>A</b>, sweeps <b>clockwise</b>, and measures angles from a reference straight above A. <b>Tap the point it picks next.</b>",
      fig: Qf.points(K, { max: 8 }),
      a: ["E"],
      hint: "Swing a line round from straight up, clockwise, and see which point it touches first.",
      why: 'The clockwise angles from "up" are E 27°, H 45°, D 59°, G 63°, F 90°, C 100°, B 135°. E is smallest, so every other point lies further round: A → E is a hull edge. H looks close, but it sits inside the hull.',
    },
    {
      type: "order",
      q: "Put one round of gift wrapping in order.",
      items: [
        "Stand at the current hull point h",
        "Measure the clockwise angle from the reference to every remaining candidate",
        "Take the candidate with the smallest angle",
        "Add it to the hull, then set r to h and h to that candidate",
      ],
      why: "Each round is a full sweep: stand, measure all, pick the smallest, then move on and shift the reference. The loop ends when the pick is the starting point.",
    },
    {
      type: "bug",
      q: "This Graham scan loop should reject any point that makes a right turn or goes straight. It lets dents through. Click the faulty line.",
      code: [
        "for p in order[2:]:",
        "    while len(S) >= 2 and cross(S[-2], S[-1], p) > 0:",
        "        S.pop()",
        "    S.append(p)",
      ],
      a: 1,
      why: "A positive cross product is a left turn, which is exactly what should be <b>kept</b>. The test pops left turns instead. It should pop while the cross product is zero or negative (<code>&lt;= 0</code>).",
    },
    {
      type: "mcq",
      q: "Interior elimination joins the four extremes SW (1,1), SE (9,2), NE (10,8), NW (2,7) into a quadrilateral. Which of these input points can be discarded for certain?",
      o: ["(5, 4)", "(1, 5)", "(10, 3)", "(6, 9)"],
      a: 0,
      hint: "Which point is strictly inside the quadrilateral, on the left of all four edges?",
      why: "(5,4) lies strictly inside, so it cannot be a hull corner. (1,5) is left of the SW to NW edge, (10,3) is right of the SE to NE edge and (6,9) is above the top edge, so each sticks out and might be a corner.",
    },
    {
      type: "cat",
      q: "For each job, which hull algorithm is the better bet?",
      buckets: ["Gift wrapping", "Graham scan"],
      items: [
        ["3 million readings on a blob, about 6 on the hull", 0],
        ["60,000 points that all lie on a circle", 1],
        ["A hull size you cannot predict, and you want a guaranteed bound", 1],
        ["Many thousands of points in a narrow triangle, 3 corners", 0],
      ],
      why: "Gift wrapping costs n·h, so it wins when h is tiny: 6 or 3 corners. When h is huge or unknown, Graham's n log n has no bad case. On the circle h = n, which would make wrapping quadratic.",
    },
    {
      type: "slider",
      q: "A set has 4,096 points. Gift wrapping beats Graham scan when the hull has fewer than roughly how many corners?",
      min: 0,
      max: 40,
      step: 1,
      start: 20,
      ans: 12,
      tol: 3,
      unit: " corners",
      hint: "Compare n·h with n·log₂ n. 4,096 is 2 to the power 12.",
      why: "n·h < n log₂ n exactly when h < log₂ n. For n = 4,096 that is h < 12.",
    },
    {
      type: "match",
      q: "Match each situation to the hull fact it relies on.",
      pairs: [
        ["Finding the farthest pair of points", "It is always two hull corners"],
        ["Can a straight line split two classes?", "Only if their hulls do not overlap"],
        ["A point lies exactly on a hull edge", "Its cross product with the edge's ends is 0"],
        ["A point's depth in onion peeling", "The number of the layer it was peeled in"],
      ],
      why: "These are the four extra uses and edge cases from the lectures: the farthest pair lives on the hull, overlap blocks a separating line, collinear means a zero cross product, and onion depth is the layer number.",
    },
    {
      type: "multi",
      q: "Which statements about ties and rounding in hull code are true? Select all that apply.",
      o: [
        "In Graham scan, of several points at the same angle from the anchor only the farthest is kept",
        "Rounding the cross product stops tiny floating-point noise from being read as a turn",
        'A "corners only" hull keeps a point that lies exactly on an edge',
        "In gift wrapping, taking the nearer of two tied points gives corners only",
      ],
      a: [0, 1],
      why: "The nearer same-angle points lie on the segment to the farthest, so they go. Rounding (or a tolerance) gives a consistent zero for collinear decimals. A corners-only hull pops straight-on points, and taking the nearer tied point would put the middle point onto the hull.",
    },
  );
})();

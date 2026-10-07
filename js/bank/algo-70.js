/* js/bank/algo-74.js: Phase 5 revision questions ported from the vault. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a5-uses", [
    M(
      "A hull has 12 corners. How many pairs of corners must you compare to find the farthest pair?",
      ["66", "12", "144", "132"],
      0,
      "12 × 11 ÷ 2 = 66.",
    ),
    TF(
      "The farthest pair among a set of points can include a point strictly inside the hull.",
      false,
      "Move an interior point outwards and its distance grows, so the longest distance is always between two corners.",
    ),
    M(
      "In minimum-diameter k-clustering you try to make small…",
      [
        "the largest cluster diameter",
        "the number of clusters",
        "the average cluster size",
        "the total of all diameters",
      ],
      0,
      "The widest cluster is the quantity to minimise.",
    ),
    M(
      "The convex hulls of class A and class B overlap. Can a straight line separate the classes?",
      [
        "No: overlapping hulls rule it out",
        "Yes: any two classes can be separated",
        "Only a vertical line can",
        "Yes, by tilting it",
      ],
      0,
      "A line that splits the points would split the hulls too.",
    ),
    M(
      "The hulls of the two classes do not overlap at all. What does that tell you?",
      [
        "A straight line can separate the classes",
        "The classes must have equal sizes",
        "The classes have exactly the same corners",
        "No straight line can separate them",
      ],
      0,
      "Disjoint hulls leave room for a separating line.",
    ),
    M(
      "Why is a complicated shape split into convex pieces in graphics?",
      [
        "Inside-tests become simple same-side checks",
        "Convex pieces take up much less disk space",
        "Only convex shapes can be drawn on screens",
        "It makes the whole shape bigger when drawn",
      ],
      0,
      "Inside a convex polygon means on the same side of every edge.",
    ),
    {
      type: "match",
      q: "Match each task to the hull fact that helps.",
      pairs: [
        ["Farthest pair of points", "Check only pairs of hull corners"],
        ["Are two classes line-separable?", "Check whether their hulls overlap"],
        ["Robot round a rectangular obstacle", "The path follows the obstacle's corners"],
        ["Drop outlying sightings", "Peel off the outer hull layers"],
      ],
      why: "Each task reduces to the corners of a hull or a few hulls.",
    },
    M(
      "A robot must get past a rectangular obstacle. The shortest path hugs…",
      [
        "the obstacle's corners, like a string",
        "the centre line of the obstacle",
        "a wide circle drawn round the obstacle",
        "the longest side of the obstacle itself",
      ],
      0,
      "A stretched string bends only at the obstacle's corners.",
    ),
    {
      type: "slider",
      q: "A cluster has 2,000 points, and its hull has 20 corners. About how many pairs of corners must be compared for the farthest pair?",
      min: 0,
      max: 500,
      step: 10,
      start: 250,
      ans: 190,
      tol: 40,
      unit: " pairs",
      hint: "20 × 19 ÷ 2, and 20 × 19 is 380.",
      why: "20 × 19 ÷ 2 = 190 pairs, instead of almost two million for all points.",
    },
    {
      type: "multi",
      q: "Which statements about uses of the hull are true? Select all that apply.",
      o: [
        "The farthest pair of points lies on the hull",
        "Overlapping hulls mean no line separates the classes",
        "A line through a hull corner always separates the classes",
        "Each convex piece of a decomposition is easy to test for containment",
      ],
      a: [0, 1, 3],
      why: "The first, second and fourth are the lecture's uses. A line through one corner of a hull tells you nothing about separation.",
    },
  ]);
})();

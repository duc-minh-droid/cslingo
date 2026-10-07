/* js/bank/algo-72.js: Phase 5 revision questions ported from the vault. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a5-convex", [
    M(
      "Which of these shapes is convex?",
      ["A solid triangle", "A ring with a hole in the middle", "A crescent moon", "A five-pointed star"],
      0,
      "Every segment between two points of a triangle stays inside it. The ring, crescent and star all have pairs of points whose joining segment leaves the shape.",
    ),
    TF(
      "Every corner of a convex hull is one of the original points.",
      true,
      "The hull's corners are input points. The algorithms only choose which points to keep.",
    ),
    M(
      "A set S is convex when…",
      [
        "the straight segment between any two members lies inside S",
        "no member is more than one unit from the centre",
        "its boundary is made of straight lines only",
        "it has no holes, whatever its shape",
      ],
      0,
      "That is the segment test. A set with a hole can fail it, and curved sets like a circle can pass it.",
    ),
    M(
      "The convex hull of a point set is the ___ of all convex sets that contain the points.",
      ["intersection", "union of them", "largest one", "average of them"],
      0,
      "Intersecting them leaves only what every such set contains: the smallest convex set.",
    ),
    M(
      "A file lists 12 points and the hull has 4 corners. How many lines are in the output file?",
      ["4", "8", "12", "16"],
      0,
      "One line per hull corner. The other 8 points are inside or on an edge and are not written.",
    ),
    {
      type: "cat",
      q: "Is each shape convex?",
      buckets: ["Convex", "Not convex"],
      items: [
        ["A filled circle", 0],
        ["The letter T as a solid shape", 1],
        ["A filled rectangle", 0],
        ["An arrowhead with a notch cut in the back", 1],
        ["A straight line segment", 0],
        ["A doughnut with a hole", 1],
      ],
      why: "A circle, rectangle and straight segment pass the segment test. The T, the notched arrowhead and the doughnut each have two points whose joining segment leaves the shape.",
    },
    M(
      "Three points lie on one straight line. What is their convex hull?",
      [
        "The segment between the two outer points",
        "A thin triangle with all three as corners",
        "Just the middle point",
        "There is no hull",
      ],
      0,
      "All three are collinear, so the smallest convex set containing them is the segment joining the two end points.",
    ),
    M(
      "Rangers add one new sighting that falls inside the current hull. How does the estimated range change?",
      [
        "It does not change",
        "It grows a little in every direction",
        "It shrinks towards the new point",
        "It gains a new corner at the sighting",
      ],
      0,
      "A point already inside the smallest convex set holding the others does not move the boundary.",
    ),
    {
      type: "order",
      q: "Put the stages of the workshop's hull program in order.",
      items: [
        "Read the points from the input file",
        "Run the hull algorithm on them",
        "Write the corner points to the output file",
        "Plot the points and the hull",
      ],
      why: "Input, compute, output, then draw.",
    },
    M(
      "Gift wrapping returns the hull clockwise and Graham scan returns it counter-clockwise on the same points. What is true of the corner sets?",
      [
        "They contain the same corners, in opposite orders",
        "They contain different corners",
        "One has the corners and the other has interior points",
        "They agree only when n is small",
      ],
      0,
      "The hull is unique. Only the direction of travel round it differs.",
    ),
    TF(
      "Walking round a convex hull in order, some turns go left and others go right.",
      false,
      "A convex boundary turns the same way at every corner. A mixed pattern would mean a dent.",
    ),
  ]);

  B.add("a5-edge", [
    M(
      'A square\'s four corners plus one point exactly midway along an edge. How many vertices does a "corners only" hull have?',
      ["4", "5", "3", "It cannot be decided"],
      0,
      "The midpoint is collinear with its edge, so it is not a strict corner.",
    ),
    M(
      'The same five points, but now the rule is "keep points on the boundary". How many hull vertices?',
      ["5", "4", "3", "6"],
      0,
      "All four corners and the midpoint lie on the boundary and are kept.",
    ),
    TF(
      "When several points share an angle from the anchor, Graham scan keeps the nearest one.",
      false,
      "It keeps the farthest. The nearer points lie on the segment to it and cannot be corners.",
    ),
    M(
      "Three points lie on one ray from the anchor, at distances 2, 5 and 9. Which does Graham scan keep?",
      ["The one at distance 9", "The one at distance 2", "The one at distance 5", "All three"],
      0,
      "The farthest. The other two lie on the segment from the anchor to it.",
    ),
    M(
      "In gift wrapping two candidates give the same smallest angle. For a strict-corners hull, which do you pick?",
      ["The farther one", "The nearer one", "The one with the smaller label", "Neither: stop the algorithm"],
      0,
      "Taking the farther point steps over the one in the middle.",
    ),
    M(
      "Seven points all lie on one straight line. How many corners does the strict hull have?",
      ["2", "7", "0", "3"],
      0,
      "A segment: only its two ends are corners.",
    ),
    M(
      "The workshop stub only runs the scan if there are more than two distinct points. Why?",
      [
        "With one or two points the hull is just those points",
        "The scan needs at least ten points to work",
        "Sorting fails on short lists",
        "It makes the plot look better",
      ],
      0,
      "With 1 or 2 points there is nothing to scan: the hull is a point or a segment.",
    ),
    M(
      "Why does the stub round the cross product to 4 decimal places before testing its sign?",
      [
        "Noise could make an exact zero look like a turn",
        "Smaller numbers make the sort a good deal faster",
        "The cross product of decimals is always badly wrong",
        "It converts all of the numbers into whole integers",
      ],
      0,
      "Collinear decimals can give values like 1e-17. Rounding restores a consistent zero.",
    ),
    TF(
      "Using whole-number coordinates avoids floating-point noise in the cross product, for moderate sizes.",
      true,
      "Integer multiplication and subtraction are exact, so collinear really gives 0.",
    ),
    {
      type: "cat",
      q: "Which fix does each problem call for?",
      buckets: ["Keep the farthest", "Round the cross product", "Return the points as they are"],
      items: [
        ["Three input points share one angle from the anchor", 0],
        ["A decimal data set gives 1.4e-17 for three exactly collinear points", 1],
        ["The input holds only two distinct points", 2],
        ["Two points on one ray, and only one can be a corner", 0],
      ],
      why: "Same-angle ties: keep the farthest. Tiny cross values from decimals: round or use a tolerance. Under three points: nothing to scan, so return them.",
    },
    M(
      "Two exactly collinear triples have raw cross products +1.4e-17 and −1.4e-17. Without rounding, what can happen?",
      [
        "One middle point is kept and the other popped",
        "Both middle points are always kept by the scan",
        "Both middle points are always popped by the scan",
        "The program stops at once with a runtime error",
      ],
      0,
      "The tiny signs are essentially random, so the same geometry is treated inconsistently.",
    ),
  ]);
})();

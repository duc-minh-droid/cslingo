/* js/bank/algo-73.js: Phase 5 revision questions ported from the vault. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a5-race", [
    M(
      "1,024 points, hull of 4 corners. Which is cheaper, n·h or n log₂ n (log₂ 1024 = 10)?",
      ["Gift wrapping, n·h = 4,096", "Graham scan, about 10,240", "They cost the same", "Neither can run"],
      0,
      "4 sweeps beat a sort of 10 levels.",
    ),
    M(
      "1,024 points, hull of 64 corners. Which is cheaper?",
      [
        "Graham scan: n log n is about 10,240",
        "Gift wrapping: n·h is about 65,536",
        "They cost the same",
        "Gift wrapping, because it never sorts",
      ],
      0,
      "n·64 is far more than n·10, so the sort-then-scan wins.",
    ),
    TF(
      "Graham scan gets slower the more points end up on the hull.",
      false,
      "Its cost is set by the sort, O(n log n), whatever the hull size.",
    ),
    M(
      "For n = 256 (log₂ 256 = 8), gift wrapping is the cheaper choice when the hull has fewer than about…",
      ["8 corners", "16 corners", "64 corners", "256 corners"],
      0,
      "n·h < n log₂ n exactly when h < log₂ n = 8.",
    ),
    M(
      "100 points all on a circle. About how many checks does gift wrapping make?",
      ["10,000", "100", "700", "1,000,000"],
      0,
      "h = n = 100, so 100 sweeps of 100 points: n² = 10,000.",
    ),
    M(
      "Interior elimination starts by finding which points?",
      [
        "The four extremes: SW, SE, NE and NW",
        "The two points that are closest to each other",
        "The centre of mass of all of the points",
        "The three lowest points anywhere in the set",
      ],
      0,
      "Their quadrilateral lies inside the hull; anything strictly inside it can go.",
    ),
    TF(
      "Interior elimination can throw away a point that really is a hull corner.",
      false,
      "The quadrilateral's corners are input points, so it lies inside the hull. A point strictly inside it is strictly inside the hull.",
    ),
    M(
      "On which input does interior elimination save the least work?",
      [
        "Points on a circle: nothing is inside",
        "A big blob with just a few extreme points",
        "A uniform scatter of points inside a square",
        "Many points packed together into the middle",
      ],
      0,
      "With every point on the hull there is nothing interior to discard.",
    ),
    {
      type: "slider",
      q: "A set has 2,048 points. Gift wrapping beats Graham scan when the hull has fewer than roughly how many corners?",
      min: 0,
      max: 40,
      step: 1,
      start: 20,
      ans: 11,
      tol: 3,
      unit: " corners",
      hint: "Compare n·h with n·log₂ n. 2,048 is 2 to the power 11.",
      why: "h < log₂ n = 11.",
    },
    {
      type: "cat",
      q: "Which algorithm suits each job?",
      buckets: ["Gift wrapping", "Graham scan"],
      items: [
        ["Millions of GPS pings in a small park, a handful of corners", 0],
        ["Points along the shoreline of a lake, nearly all on the hull", 1],
        ["A tight cluster with 3 corners", 0],
        ["No idea how big the hull will be, need a firm bound", 1],
      ],
      why: "Few corners make n·h small. Many or unknown corners favour the n log n guarantee.",
    },
    {
      type: "order",
      q: "Order these by cost for 1,000 points, cheapest first.",
      items: [
        "Gift wrapping, hull of 5: about 5,000",
        "Graham scan: about 10,000",
        "Gift wrapping, hull of 50: about 50,000",
        "Gift wrapping, all 1,000 on the hull: about 1,000,000",
      ],
      why: "5,000, then 10,000, then 50,000, then a million.",
    },
  ]);

  B.add("a5-onion", [
    M(
      "A cloud has 25 points. The first hull has 7 corners and the second has 6. How many points remain after two peels?",
      ["12", "13", "18", "19"],
      0,
      "25 − 7 − 6 = 12.",
    ),
    M(
      'In onion peeling, a point\'s "depth" is…',
      [
        "the number of the layer it is peeled in",
        "its distance from the centre of mass",
        "the number of points on its layer",
        "the angle it makes with the anchor",
      ],
      0,
      "Depth 1 is the outer hull, and the biggest depth is the centre.",
    ),
    TF(
      "Onion peeling removes the interior points first and leaves the hull for last.",
      false,
      "It is the other way round: the hull's corners are peeled first and the centre is reached last.",
    ),
    M(
      "A ranger peels the first two layers off 400 sightings. Why?",
      [
        "To drop outliers and keep the core range",
        "To make the data set bigger than it was",
        "To find the farthest pair of all sightings",
        "To sort all of the sightings into time order",
      ],
      0,
      "The outer layers are stretched by rare far-off sightings.",
    ),
    M(
      "Only 2 points remain. What does the next peel do?",
      [
        "It takes both: they form the last layer",
        "It leaves them there, since a hull needs three points",
        "It removes just one of them and keeps the other",
        "It restarts again from the very first layer",
      ],
      0,
      "The hull of 2 points is both of them, so they are peeled together.",
    ),
    M(
      "A cloud peels into 9 layers. How many hull computations did the full peel need?",
      ["9", "1", "81", "3"],
      0,
      "One hull per layer.",
    ),
    {
      type: "cat",
      q: "Which layer is each sighting most likely on?",
      buckets: ["Outer layer", "Inner layer"],
      items: [
        ["A rare sighting far from where the herd stays", 0],
        ["The waterhole visited every day", 1],
        ["The farthest point of a long migration trip", 0],
        ["Spots in the middle of the favourite grazing field", 1],
      ],
      why: "Rare, far-flung sightings are extremes and sit on the outer hulls; daily-use spots are surrounded by other points.",
    },
    M(
      "As layers are peeled, the area of the hull of the remaining points…",
      ["never grows", "always doubles", "stays exactly the same", "grows then shrinks"],
      0,
      "Each new hull sits inside the previous one.",
    ),
    {
      type: "order",
      q: "Put onion peeling in order.",
      items: [
        "Take the convex hull of the points that are left",
        "Give its corner points the current layer number",
        "Remove those corner points",
        "Repeat until no points are left",
      ],
      why: "Hull, number, remove, repeat.",
    },
    {
      type: "multi",
      q: "Which statements about onion peeling are true? Select all that apply.",
      o: [
        "Layer numbers show how central each point is",
        "Each layer needs its own hull computation",
        "It uses a sort only once for all layers",
        "The innermost layer can be a single point",
      ],
      a: [0, 1, 3],
      why: "Depth measures centrality, each layer is a fresh hull, and the middle can be a lone point. The hull is recomputed each time, so there is no single sort.",
    },
  ]);
})();

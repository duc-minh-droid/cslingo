(function () {
  const B = NIC.bank;
  const Qf = NIC.qfig;
  const teal = "var(--teal)";

  /* grid figure with a dashed arrow from one point to another (maths coordinates, y up) */
  const arrowFig = (P, from, to, max = 8, w = 360, h = 300) => {
    const X = (x) => 30 + (x / max) * (w - 50),
      Y = (y) => h - 30 - (y / max) * (h - 50);
    const line = `<line x1="${X(from[0])}" y1="${Y(from[1])}" x2="${X(to[0])}" y2="${Y(to[1])}" stroke="var(--amber)" stroke-width="3" stroke-dasharray="7 5" style="pointer-events:none"/>`;
    return Qf.points(P, { max, w, h }).replace(/<g data-pick="[BPK]"/, (m) => line + m);
  };

  const mstGraph = (hl, pick) =>
    Qf.graph(
      { A: [50, 120], B: [130, 45], C: [130, 195], D: [250, 45], E: [250, 195], F: [350, 120] },
      [
        ["A", "B", 4],
        ["A", "C", 2],
        ["B", "C", 1],
        ["B", "D", 5],
        ["C", "D", 8],
        ["C", "E", 10],
        ["D", "E", 3],
        ["D", "F", 7],
        ["E", "F", 6],
      ],
      { pick, w: 400, h: 240, hl },
    );

  B.add("a4-cut", [
    {
      type: "pick",
      q: "In this cable network every town must be connected. Click every cable that lies on no loop at all, so every spanning tree has to use it.",
      fig: Qf.graph(
        { A: [40, 50], B: [40, 190], C: [120, 120], D: [200, 120], E: [280, 120], F: [370, 50], G: [370, 190] },
        [
          ["A", "B"],
          ["B", "C"],
          ["A", "C"],
          ["C", "D"],
          ["D", "E"],
          ["E", "F"],
          ["F", "G"],
          ["E", "G"],
        ],
        { pick: "edges", w: 420, h: 240 },
      ),
      a: ["C-D", "D-E"],
      hint: "For each cable, imagine cutting it. Can you still get between its two ends another way round?",
      why: "Cutting C–D leaves {A, B, C} and {D, E, F, G} with no other cable between them, so it is the only crossing edge of that cut and every tree must use it. The same goes for D–E. Every other cable sits on a triangle, so a tree can drop it and go round the other two sides.",
    },
    {
      type: "match",
      q: "Match each situation in a weighted graph to what it guarantees.",
      pairs: [
        ["A cut with exactly one crossing edge", "That edge is in every spanning tree"],
        ["A cycle whose heaviest edge is strictly heavier than the rest", "That edge is in no minimum tree"],
        ["A cut whose two lightest crossing edges tie", "Either one can be chosen safely"],
        ["A cycle in which every edge has the same weight", "Any one of them can be the one dropped"],
      ],
      why: "A lone crossing edge has no rival, so nothing can replace it. A strictly heaviest cycle edge can always be swapped for the rest of the loop, so it is never needed. Ties across a cut or round a cycle mean there are several equally good choices, so more than one minimum tree can exist.",
    },
    {
      type: "bug",
      q: "is_spanning_tree(n, edges) should say whether a list of cables joins all n towns with no spare cable. connected(n, edges) works. The check gives the wrong answer for every tree. Click the faulty line.",
      code: [
        "def is_spanning_tree(n, edges):",
        "    if len(edges) != n:",
        "        return False",
        "    return connected(n, edges)",
      ],
      a: 1,
      hint: "A tree joining 3 towns uses 2 cables, not 3.",
      why: "A spanning tree of n towns has n − 1 cables. Comparing with n rejects every real tree, and it would accept a connected graph with exactly one loop. The test should be len(edges) != n - 1.",
    },
    {
      type: "slider",
      q: "A connected network has 10 towns and 16 possible cables. Every cable can be kept or removed, and a minimum spanning tree keeps only what is needed. How many cables does it remove?",
      min: 0,
      max: 16,
      step: 1,
      start: 3,
      ans: 7,
      tol: 1,
      unit: "cables",
      hint: "A tree on 10 towns keeps 9 cables. Take that away from 16.",
      why: "A spanning tree of 10 towns has 10 − 1 = 9 cables, so 16 − 9 = 7 are dropped. Each dropped cable is the heaviest on some loop, which is why the cheapest network never needs it.",
    },
    {
      type: "cat",
      q: "A tree is being built. For each rule for picking the next cable, say whether it is guaranteed to be safe (part of some minimum tree).",
      buckets: ["Guaranteed safe", "Not guaranteed"],
      items: [
        ["The lightest cable leaving one town on its own", 0],
        ["The lightest cable leaving the group of towns joined so far", 0],
        ["The second-lightest cable leaving the group", 1],
        ["The heaviest cable leaving the group", 1],
        ["The cheapest cable with both ends already in the group", 1],
      ],
      hint: "Guaranteed means it is the lightest edge across some cut. A cable inside the group crosses no cut that matters.",
      why: "One town alone is a cut: that town against the rest, and its lightest cable is the lightest crossing edge. The group against everything else is a cut too. The second-lightest and the heaviest crossing cables can be swapped for the lightest and get cheaper, and a cable with both ends inside the group only closes a loop.",
    },
    {
      type: "mcq",
      q: "A small network is a single loop of four cables costing 3, 8, 8 and 5. A minimum spanning tree must leave out the heaviest cable. What happens here, where the heaviest weight appears twice?",
      o: [
        "Exactly one 8 goes, and either choice gives a cost of 16",
        "Both 8s go, because they tie, leaving a tree that costs 8",
        "Neither 8 goes, because a tie means neither is strictly heaviest",
        "Only the 8 next to the cable costing 3 can go, so the cost is 16",
      ],
      a: 0,
      hint: "Four towns need only 3 cables, so drop just one.",
      why: "Four towns need 3 cables, so exactly one cable goes. Dropping both 8s would disconnect the towns. Either 8 can go, because the rest of the loop still connects its ends, and each choice leaves 3 + 8 + 5 = 16. Ties mean the minimum tree is not unique, but its cost is.",
    },
  ]);

  B.add("a4-mst", [
    {
      type: "order",
      q: "Prim starts at A on the network in the figure. Put the cables in the order Prim adds them.",
      fig: mstGraph({}, null),
      items: ["A–C (2)", "B–C (1)", "B–D (5)", "D–E (3)", "E–F (6)"],
      hint: "At each step list the cables leaving the tree and take the cheapest. A–B (4) is never taken, because B joins first through C.",
      why: "From {A} the only ways out are A–C (2) and A–B (4), so A–C goes in. From {A, C} the options are B–C (1), A–B, C–D and C–E: take B–C. From {A, B, C}: B–D (5) beats C–D (8) and C–E (10). Then D–E (3), then E–F (6) beats D–F (7). Kruskal would take the same five cables in a different order.",
    },
    {
      type: "pick",
      q: "Prim is part way through. Its tree so far is the green part: towns A, B, C and the cables A–C and B–C. Click every cable Prim compares when choosing the next one.",
      fig: mstGraph({ A: teal, B: teal, C: teal, "A-C": teal, "B-C": teal }, "edges"),
      a: ["B-D", "C-D", "C-E"],
      hint: "A candidate has one end in the tree and the other end outside it.",
      why: "Only cables that cross from the tree to the rest are candidates: B–D (5), C–D (8) and C–E (10). A–B (4) has both ends in the tree, so taking it would close a loop. The cables D–E, D–F and E–F do not touch the tree yet. Prim takes the lightest candidate, B–D.",
    },
    {
      type: "slider",
      q: "On this network the minimum tree uses B–D, priced at 5. If B–D's price rises, at what price does it stop being the cheapest way to join {A, B, C} to {D, E, F}? Slide to the price.",
      fig: mstGraph({ "B-D": teal }, null),
      min: 0,
      max: 12,
      step: 1,
      start: 4,
      ans: 8,
      tol: 1,
      unit: "",
      hint: "Remove B–D. List the other cables between {A, B, C} and {D, E, F} and find the cheapest.",
      why: "Between the two groups the cables are B–D (5), C–D (8) and C–E (10). While B–D costs less than 8 it is the lightest crossing edge. At 8 it ties with C–D, and above 8 the tree switches to C–D. The price where an MST edge gets replaced is the cheapest alternative crossing edge.",
    },
    {
      type: "match",
      q: "Kruskal is walking down the sorted list of cables. Match each situation to what Kruskal does.",
      pairs: [
        ["The two ends are already in the same group", "Reject it, because it would close a loop"],
        ["The two ends are in different groups", "Accept it and merge the two groups"],
        ["n − 1 cables have been accepted", "Stop early: the tree is complete"],
        ["The list ends with fewer than n − 1 accepted", "The graph was disconnected: a forest remains"],
      ],
      why: "Union-find answers whether two ends share a group. Same group means a loop, so skip. Different groups means the cable joins two pieces, so take it. A tree on n towns needs exactly n − 1 cables, so Kruskal can stop then. If the list runs out first, some towns can never be reached from the rest.",
    },
    {
      type: "bug",
      q: "This Prim code should keep, for each town v outside the tree, the price of its cheapest single cable into the tree. It runs without error but builds the wrong tree on some networks. Click the faulty line.",
      code: [
        "while len(done) < len(adj):",
        "    u = cheapest_outside(key, done)",
        "    done.add(u)",
        "    for v, w in adj[u]:",
        "        if v not in done and w < key[v]:",
        "            key[v] = key[u] + w",
      ],
      a: 5,
      hint: "Prim cares about one cable's price, not about how far the town is from the start.",
      why: "key[v] should simply be w, the price of the single cable from u to v. Adding key[u] measures the whole route from the start, which is what Dijkstra does. The test above compares w alone, so the stored value no longer matches what was compared, and the next pick can go wrong.",
    },
    {
      type: "multi",
      q: "Prim and Kruskal both run on the same connected network whose cable prices are all different. Select every statement that is true.",
      o: [
        "Both finish with the same total price",
        "Both accept exactly n − 1 cables",
        "Both accept the cables in the same order",
        "Both finish with exactly the same set of cables",
      ],
      a: [0, 1, 3],
      hint: "With all prices different, only one minimum tree exists.",
      why: "Both rely on the cut property, so both reach a minimum tree, and any tree on n towns has n − 1 cables. When all prices differ the minimum tree is unique, so the cable sets match too. The order differs: Prim grows from the start town, while Kruskal takes the cheapest cable anywhere, such as a cable costing 1 far from the start town being taken by Kruskal before a cable costing 2 beside it.",
    },
  ]);

  const orientPts = { P: [2, 2], Q: [6, 2], C: [4, 2], D: [7, 4], E: [5, 3], F: [3, 1], G: [0, 2], H: [8, 2] };
  const wrapPts = { B: [1, 1], K: [7, 4], P: [3, 1], Q: [2, 4], R: [5, 2], S: [4, 5], T: [6, 2], U: [3, 3] };
  const hullPts = { A: [0, 3], B: [2, 0], C: [6, 1], D: [7, 4], E: [4, 6], F: [3, 3], G: [5, 3] };

  B.add("a5-orient", [
    {
      type: "bug",
      q: "turn(p, a, b) should be positive for a left turn, negative for a right turn and 0 for a straight line (y up). It gets some turns the wrong way round. Click the faulty line.",
      code: [
        "def turn(p, a, b):",
        "    ax, ay = a[0] - p[0], a[1] - p[1]",
        "    bx, by = b[0] - p[0], b[1] - p[1]",
        "    return ax * by + ay * bx",
      ],
      a: 3,
      hint: "Try walking north, then looking east. That is a right turn, so the answer should be negative.",
      why: "The cross product is ax × by − ay × bx. With a plus, p = (0, 0), a = (0, 1) and b = (1, 0) gives 0 + 1 = +1 (left), but walking north then looking east is a right turn, which should give −1. The minus sign is what makes swapping a and b flip the answer.",
    },
    {
      type: "pick",
      q: "You walk from P to Q along the dashed arrow. Click every point X for which P → Q → X is a straight line (cross product 0), apart from P and Q themselves.",
      fig: arrowFig(orientPts, orientPts.P, orientPts.Q),
      a: ["C", "G", "H"],
      hint: "P and Q are both at height 2. A point has cross product 0 only if it is at the same height.",
      why: "The arrow runs along the line y = 2, so a point is collinear with it exactly when its y is 2: C (4, 2) between them, G (0, 2) behind P and H (8, 2) beyond Q. Collinear does not mean between. D, E and F are above or below the line, so they turn left or right.",
    },
    {
      type: "order",
      q: "You want to test whether a polygon is convex using only turn tests. Put the steps in order.",
      items: [
        "Take each corner with the corners before and after it",
        "Work out the cross product for each of these triples",
        "Compare the signs of all the results",
        "If one sign differs from the rest, the polygon is not convex",
      ],
      hint: "You need the triples before you can get the numbers, and the numbers before you can compare.",
      why: "Walking round a convex polygon turns the same way at every corner, so all the cross products share one sign. One corner with the opposite sign is a dent that points inwards. Only multiplications and subtractions are needed, with no angles.",
    },
    {
      type: "multi",
      q: "You work out the cross product (a − p) × (b − p) for three points. Select everything its sign can tell you.",
      o: [
        "Whether p → a → b turns left, turns right or goes straight",
        "Whether b lies on the line through p and a",
        "Which side of the arrow p → a the point b is on",
        "The size of the turn in degrees",
        "How far b is from p",
      ],
      a: [0, 1, 2],
      hint: "The sign gives only a direction: positive, negative or zero.",
      why: "Positive means b is left of the arrow, negative means right, and zero means b is on the line, which are three views of the same fact. The sign alone says nothing about angle size or distance. The number itself relates to an area, not an angle.",
    },
    {
      type: "mcq",
      q: "A map is redrawn at twice the scale, so every coordinate is doubled. The same three points are tested with the turn test. What changes?",
      o: [
        "Each turn stays the same, and each cross product becomes 4 times bigger",
        "Each turn stays the same, and each cross product becomes 2 times bigger",
        "Each turn stays the same, and each cross product is unchanged exactly",
        "Each turn flips direction, and each cross product becomes 4 times bigger",
      ],
      a: 0,
      hint: "The cross product is twice a triangle's area. What happens to an area when every length doubles?",
      why: "Doubling every length makes any triangle 2 × 2 = 4 times the area, so the cross product (which is twice that area) is 4 times bigger. Its sign is untouched, so left stays left, right stays right and straight stays straight.",
    },
    {
      type: "slider",
      q: "Take p = (0, 0), a = (4, 0) and b = (7, 3). Slide to the cross product (a − p) × (b − p).",
      min: -20,
      max: 20,
      step: 2,
      start: 0,
      ans: 12,
      tol: 2,
      unit: "",
      hint: "a lies on the x-axis, so only the height of b matters: 4 × 3.",
      why: "(4 × 3) − (0 × 7) = 12. Because a lies flat along the x-axis, only b's height counts, so b = (1, 3) or b = (50, 3) would give the same 12. It is positive, so the walk turns left, and 12 is twice the area of the triangle (4 × 3 ÷ 2 = 6).",
    },
  ]);

  B.add("a5-wrap", [
    {
      type: "pick",
      q: "Gift wrapping stands at B (y up) and its best candidate so far is K, shown by the dashed arrow. Click every other point that is to the RIGHT of the arrow B → K. Each one would replace K as the candidate.",
      fig: arrowFig(wrapPts, wrapPts.B, wrapPts.K),
      a: ["P", "R", "T"],
      hint: "The arrow climbs 3 for every 6 across. A point far below that slope is on the right.",
      why: "The true next hull point has every other point on its left, so any point on the right proves K is not the answer yet. Checking each point with the cross product (6 × (y − 1) − 3 × (x − 1)): P gives −6, R gives −6 and T gives −9, so all three lie to the right. Q, S and U give +15, +15 and +6, so they lie on the left and change nothing.",
    },
    {
      type: "slider",
      q: "A tool wraps a set of 30 points that all lie on a circle, so every one of them is a hull point. Each wrapping step checks every point. About how many checks does the whole wrap make?",
      min: 0,
      max: 1500,
      step: 50,
      start: 300,
      ans: 900,
      tol: 100,
      unit: "checks",
      hint: "30 steps, each looking at 30 points.",
      why: "The hull has h = 30 points, so there are 30 steps of about 30 checks each: n × h = 30 × 30 = 900. When every point is on the hull, h = n and the cost becomes n², which is the worst case for gift wrapping.",
    },
    {
      type: "match",
      q: "A gift wrapping program keeps a variable cur and a variable nxt, with two loops. Match each part to its job.",
      pairs: [
        ["cur", "The hull point we are standing at"],
        ["nxt", "The best candidate found so far in this sweep"],
        ["The inner loop over every point", "One sweep that finds a single hull edge"],
        ["The outer loop stopping when nxt is the start", "The hull has closed up"],
      ],
      why: "Each outer step stands on cur and sweeps through all the points, keeping nxt as whichever has everything else on its left. When the sweep ends, nxt is a hull point, so we walk to it. Reaching the starting point again means we have gone all the way round.",
    },
    {
      type: "bug",
      q: "wrap(pts) should return the whole hull, but on some inputs it never stops. turn(p, a, b) is negative when b is to the right of p → a. Click the faulty line.",
      code: [
        "def wrap(pts):",
        "    start = pts[0]",
        "    hull, p = [], start",
        "    while True:",
        "        hull.append(p)",
        "        nxt = pts[1] if p == pts[0] else pts[0]",
        "        for q in pts:",
        "            if q != p and turn(p, nxt, q) < 0:",
        "                nxt = q",
        "        p = nxt",
        "        if p == start:",
        "            break",
        "    return hull",
      ],
      a: 1,
      hint: "The loop stops only when it gets back to the starting point. Is the first point in the list always on the hull?",
      why: "pts[0] is just the first point typed in, and it may be inside the hull. The wrap then walks out onto the hull and goes round it for ever without landing on start, so it never stops. Start from the leftmost point, which is always on the hull: start = min(pts).",
    },
    {
      type: "order",
      q: "Gift wrapping starts at the leftmost point A and goes counter-clockwise (y up). The points are A (0, 3), B (2, 0), C (6, 1), D (7, 4), E (4, 6), F (3, 3) and G (5, 3), as drawn. Put the hull points in the order it finds them.",
      fig: Qf.points(hullPts, { max: 8, w: 360, h: 300, pick: false }),
      items: ["A", "B", "C", "D", "E"],
      hint: "Leave A and keep every other point on your left. F and G are inside, so they never appear.",
      why: "From A, the point B has everything on its left, so it comes first. Then C, then D, and E closes the loop back to A. F (3, 3) and G (5, 3) are inside the shape and never touch the band, so the answer has 5 hull points. The turns A→B→C, B→C→D, C→D→E, D→E→A and E→A→B are all left turns.",
    },
    {
      type: "multi",
      q: "Gift wrapping has just finished one sweep from the current point and found the edge it will walk along. Select every statement that is true of that edge.",
      o: [
        "No input point lies strictly to its right",
        "Both of its ends are hull points",
        "It is the shortest edge leaving the current point",
        "It always points towards the middle of the points",
        "It was found without sorting any of the points",
      ],
      a: [0, 1, 4],
      hint: "The sweep keeps the point with every other point on its left.",
      why: "A hull edge keeps all the points on one side, so none is strictly on its right, and both of its ends are hull points. The sweep only compares turns, so it never sorts. The edge need not be short, and it runs along the outside of the points, not towards the middle.",
    },
  ]);
})();

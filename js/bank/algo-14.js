(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { chip, dot, o1, o2, o3, o6, plane, svg, txt, uid } = partScope;
  const B = NIC.bank;
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

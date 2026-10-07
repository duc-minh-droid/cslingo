(function () {
  const B = NIC.bank;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 ${o.sz || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px">${body}</svg>`;
  const box = (x, y, w, h, pid, lines, c) =>
    `<g data-pick="${pid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="var(--panel)" stroke="${c || "var(--line-2)"}" stroke-width="2"/>${lines
      .map((l, i) => tx(x + w / 2, y + h / 2 + 5 - (lines.length - 1) * 9 + i * 18, l))
      .join("")}</g>`;

  /* a road map: nodes {id: [x, y]}, edges [a, b, weight] */
  const mapFig = () => {
    const P = { S: [40, 72], A: [120, 26], B: [200, 26], C: [280, 26], D: [360, 72] };
    const E = [
      ["S", "A", 2, 0, -8],
      ["A", "B", 1, 0, -8],
      ["B", "C", 1, 0, -8],
      ["C", "D", 1, 8, -8],
      ["S", "D", 9, 0, 16],
      ["S", "B", 5, -6, 6],
    ];
    let s = "";
    E.forEach(([a, b, w, dx, dy]) => {
      const [x1, y1] = P[a],
        [x2, y2] = P[b];
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--line-2)" stroke-width="3"/>${tx((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy + 4, w, { c: "var(--text-dim)" })}`;
    });
    Object.entries(P).forEach(([k, [x, y]]) => {
      s += `<g data-pick="${k}"><circle cx="${x}" cy="${y}" r="17" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(x, y + 5, k)}</g>`;
    });
    return svg(400, 100, s);
  };

  /* open list for A*: three waiting nodes with g and h */
  const openFig = () =>
    svg(
      380,
      70,
      box(10, 8, 110, 54, "A", ["A", "g = 1, h = 8"]) +
        box(135, 8, 110, 54, "B", ["B", "g = 6, h = 2"]) +
        box(260, 8, 110, 54, "C", ["C", "g = 3, h = 4"]),
    );

  /* naive count-to-infinity costs, one box per exchange */
  const roundsFig = () => {
    let s = "";
    for (let i = 1; i <= 10; i++) {
      const x = 8 + (i - 1) * 49;
      s += box(x, 6, 44, 44, "r" + i, [2 * i + 1]) + tx(x + 22, 66, "#" + i, { sz: 11, c: "var(--text-dim)" });
    }
    return svg(500, 74, s);
  };

  /* corner table for the LP question */
  const cornerFig = () => {
    const rows = [
      ["00", "(0, 0)", 0],
      ["60", "(6, 0)", 24],
      ["61", "(6, 1)", 22],
      ["25", "(2, 5)", 26],
      ["05", "(0, 5)", 20],
    ];
    return svg(
      360,
      rows.length * 36 + 4,
      rows.map(([id, p, z], i) => box(10, 2 + i * 36, 340, 32, id, [`${p}:  z = ${z}`])).join(""),
    );
  };

  /* =====================================================================
     a2-dijkstra
     ===================================================================== */
  B.add("a2-dijkstra", [
    {
      type: "pick",
      q: "Dijkstra runs from S on this map (road costs shown). Click the node whose <b>shortest</b> route from S uses the <b>most roads</b>.",
      fig: mapFig(),
      a: "D",
      hint: "Add up S–A–B–C–D: 2 + 1 + 1 + 1. Compare with the direct road S–D.",
      why: "The cheapest route to D is S–A–B–C–D at 2 + 1 + 1 + 1 = 5, which is four roads, and beats the direct road at 9. B is reached in 3 by S–A–B (two roads), not by the direct road at 5. Fewest roads and lowest cost are different questions, and Dijkstra answers the second.",
    },
    {
      type: "slider",
      q: "Roads: S–A costs 4, S–B costs 7, A–B costs 2, B–T costs 3. Dijkstra has just settled S and then A. What is B's tentative distance now?",
      min: 0,
      max: 12,
      step: 1,
      start: 3,
      ans: 6,
      tol: 0,
      unit: "",
      hint: "After S, B holds 7. Going through A costs 4 + 2. Keep the smaller.",
      why: "Relaxing A–B gives 4 + 2 = 6, which is less than the 7 set from S, so B drops to 6. The 3 of the road B–T is not added yet: that matters only once B is settled.",
    },
    {
      type: "order",
      q: "Put Dijkstra's steps in order, from the start of a run.",
      items: [
        "Set the start's distance to 0 and every other distance to infinity",
        "Take the unsettled node u with the smallest distance",
        "For each road u to v, compare dist[u] + cost with dist[v] and keep the smaller",
        "Repeat until every reachable node is settled",
      ],
      hint: "You cannot pick a smallest distance before distances exist.",
      why: "Set up the distances first, then pick the closest unsettled node, use it to look for shortcuts to its neighbours, and repeat the pick-and-relax round until nothing reachable is left.",
    },
    {
      type: "multi",
      q: "A map's roads all have positive costs. Every road's cost is now <b>doubled</b>, and Dijkstra runs again from the same start. Select every statement that is true.",
      o: [
        "Each node's shortest distance is doubled",
        "The shortest route to each node is unchanged",
        "The nodes are settled in the same order",
        "Each node's shortest distance stays the same",
        "Dijkstra now needs negative edges to cope",
      ],
      a: [0, 1, 2],
      hint: "Every route's total is doubled, so which route is smallest does not change.",
      why: "Doubling multiplies every route's total by 2, so the ranking of routes is the same: the same routes win, the same order of settling, with distances twice as big. Nothing negative appears, so Dijkstra is still safe. (Adding a constant to each road is different: it penalises routes with more roads.)",
    },
    {
      type: "match",
      q: "Match each situation on a map with what Dijkstra does about it.",
      pairs: [
        ["A node that no road leads to from S", "Its distance stays at infinity"],
        ["Two different routes tie for the shortest", "Either may be reported, with the same distance"],
        ["A road with cost 0", "Fine: it adds nothing, and the guarantee still holds"],
        ["A road that leads back into S", "It can never lower S, which is already 0"],
      ],
      hint: "Ask whether the situation could ever lower a distance that is already settled.",
      why: "Unreachable nodes are never relaxed, so they keep infinity. Ties give two valid answers with one distance. A zero road never makes a detour cheaper than its start, and nothing positive can beat S's 0, so none of these break the argument that the smallest tentative node is safe.",
    },
    {
      type: "bug",
      q: "This Dijkstra returns distances that are too small. Click the faulty line.",
      code: [
        "def dijkstra(graph, s):",
        "    dist = {v: INF for v in graph}",
        "    dist[s] = 0",
        "    heap = [(0, s)]",
        "    while heap:",
        "        d, u = heappop(heap)",
        "        for v, w in graph[u]:",
        "            if dist[u] + w < dist[v]:",
        "                dist[v] = w",
        "                heappush(heap, (dist[v], v))",
        "    return dist",
      ],
      a: 8,
      hint: "The test compares dist[u] + w. What does the update store?",
      why: "The check says the route through u costs dist[u] + w, but the update stores only w, forgetting the distance already travelled to u. It should be dist[v] = dist[u] + w.",
    },
  ]);

  /* =====================================================================
     a2-astar
     ===================================================================== */
  B.add("a2-astar", [
    {
      type: "pick",
      q: "Greedy best-first search would take the waiting node with the smallest h, which is B. A* picks by g + h instead. Click the node A* takes next.",
      fig: openFig(),
      a: "C",
      hint: "Work out g + h for each: 1 + 8, 6 + 2 and 3 + 4.",
      why: "The f values are 9 for A, 8 for B and 7 for C, so A* takes C. B only looks close to the goal because it has already cost 6 to reach. Counting what has been spent as well as what is left is what makes A* correct where greedy is not.",
    },
    {
      type: "slider",
      q: "A* on a grid with 4-way moves, each step costing 1. A waiting cell was reached after 5 steps (g = 5). The goal is 2 columns right and 3 rows down from it. What is f = g + h with the Manhattan heuristic?",
      min: 0,
      max: 20,
      step: 1,
      start: 5,
      ans: 10,
      tol: 1,
      unit: "",
      hint: "h is the columns plus the rows: 2 + 3. Then add the 5 already spent.",
      why: "h = 2 + 3 = 5 and g = 5, so f = 10. f is A*'s estimate of the whole trip through this cell: the cost so far plus the guess for the rest.",
    },
    {
      type: "order",
      q: "Put one round of A* in order.",
      items: [
        "Take the open cell with the smallest g + h",
        "If it is the goal, stop and read the path back",
        "Otherwise close it, so it is not expanded again",
        "Offer each neighbour a cost through it and keep any improvement",
      ],
      hint: "You can only test whether it is the goal after you have taken it from the open list.",
      why: "Choose by f, test for the goal at the moment it is taken (not earlier), close the cell, then update neighbours. Stopping only when the goal is taken is what lets an admissible heuristic guarantee the shortest path.",
    },
    {
      type: "cat",
      q: "Sort each heuristic by whether A* is then guaranteed to return a shortest path. All moves cost 1.",
      buckets: ["Always a shortest path", "May return a longer path"],
      items: [
        ["h = 0 for every cell", 0],
        ["h = exactly the true remaining cost", 0],
        ["Manhattan distance on a grid with 4-way moves", 0],
        ["h = 1.5 times the true remaining cost", 1],
        ["Manhattan distance on a grid that also allows diagonal steps", 1],
        ["h = half the true remaining cost", 0],
      ],
      hint: "Is each guess never above the real remaining cost?",
      why: "Guarantees need an h that never overestimates. Zero, the exact cost, half the cost and Manhattan with 4-way moves all stay at or below the truth. 1.5 times the truth is too big. Diagonal steps make Manhattan too big: (0, 0) to (3, 4) says 7, but the real cost is 4.",
    },
    {
      type: "multi",
      q: "A* has just taken the goal G from the open list, with an admissible heuristic. Select every statement that is true.",
      o: [
        "The path it found to G is a shortest path",
        "Every cell with f below G's cost has been expanded",
        "Every cell on the grid has been expanded",
        "A cheaper path to G may still turn up later",
        "G's h value was 0",
      ],
      a: [0, 1, 4],
      hint: "G was the smallest f on the open list. What does that say about everything else?",
      why: "G had the smallest f, and with an admissible h no waiting cell can lead to a cheaper path, so the path is shortest. Everything with a smaller f must already have been taken. At the goal there is nothing left to travel, so h = 0. A* usually skips many cells, so it has not expanded them all.",
    },
    {
      type: "bug",
      q: "This A* sometimes returns a path that is not the shortest. Click the faulty line.",
      code: [
        "def astar(start, goal):",
        "    open = [(h(start), start)]",
        "    g = {start: 0}",
        "    while open:",
        "        f, n = pop_min(open)",
        "        for m, w in neighbours(n):",
        "            if g[n] + w < g.get(m, INF):",
        "                g[m] = g[n] + w",
        "                push(open, (g[m] + h(m), m))",
        "                if m == goal:",
        "                    return g[m]",
        "    return None",
      ],
      a: 9,
      hint: "When does a cell count as finally chosen: when it is first seen, or when it is taken from the list?",
      why: "Seeing the goal for the first time only means a route has been found, not that it is the best one. A cheaper route could still be waiting in the list. The test must happen after the pop, as in <code>if n == goal: return g[n]</code>.",
    },
  ]);

  /* =====================================================================
     a2-routing
     ===================================================================== */
  B.add("a2-routing", [
    {
      type: "slider",
      q: "A network has 100 routers in 4 areas of 25. With hierarchical routing, a router keeps one entry for each other router in its own area and one entry for each other area. About how many entries does it hold?",
      min: 0,
      max: 100,
      step: 1,
      start: 50,
      ans: 27,
      tol: 3,
      unit: "",
      hint: "24 routers in its own area, plus 3 other areas.",
      why: "24 + 3 = 27 entries, instead of 99 if every router had to be listed. Far-away routers are summed up as one area, which is why the table stays small as the internet grows.",
    },
    {
      type: "order",
      q: "A distance-vector router receives a neighbour's table. Put its steps in order.",
      items: [
        "Read the cost the neighbour advertises for a destination",
        "Add the cost of the link to that neighbour",
        "Compare the total with the cost already in its own table",
        "If it is lower, switch to this neighbour and re-advertise the change",
      ],
      hint: "The advertised number is the neighbour's distance, not yours.",
      why: "The neighbour's figure measures from the neighbour, so the router must add its own link cost before comparing. Only a better total changes the table, and a change is then passed on to the router's own neighbours.",
    },
    {
      type: "cat",
      q: "Sort each statement by the routing approach it describes.",
      buckets: ["Link-state only", "Distance-vector only", "Both"],
      items: [
        ["Every router holds a map of the whole network", 0],
        ["Routers send tables to their neighbours only", 1],
        ["A router runs Dijkstra on what it knows", 0],
        ["Slow news of a failure can make costs creep up", 1],
        ["A router needs the cost of each of its own links", 2],
        ["When stable, routes are the cheapest paths", 2],
      ],
      hint: "Link-state shares the map to everyone. Distance-vector shares answers with neighbours.",
      why: "Link-state routers flood their links so everyone has the whole map and runs Dijkstra. Distance-vector routers only swap distances with neighbours, so stale gossip can bounce around and count upwards. Both begin from their own link costs, and both end on the cheapest paths once things settle.",
    },
    {
      type: "multi",
      q: "RIP is a distance-vector protocol that counts hops and treats 16 as unreachable. Select every statement that is true.",
      o: [
        "Its cost is the number of routers a packet crosses",
        "A route that reaches 16 is treated as unreachable",
        "It prefers a fast link over a slow link with the same hops",
        "Every RIP router learns the full map",
        "A destination 15 hops away can still be used",
      ],
      a: [0, 1, 4],
      hint: "The cap is what stops count-to-infinity running for ever.",
      why: "RIP's cost is just hop count, with 16 playing the part of infinity so that a count-to-infinity loop ends. 15 hops is still reachable. It does not weigh link speed, and it never builds a map, as it only hears neighbours' tables.",
    },
    {
      type: "pick",
      q: "After a link fails, A and B keep swapping stale news and B's cost to X rises by 2 each exchange, starting at 3 (the boxes show the cost). RIP treats 16 as unreachable. Click the first exchange where B's cost reaches 16 or more, so RIP gives up.",
      fig: roundsFig(),
      a: "r8",
      hint: "Look for the first box showing 16 or above.",
      why: "The costs go 3, 5, 7, 9, 11, 13, 15 and then 17 on exchange 8, the first at or past 16. Exchange 7 shows 15, which still counts as reachable. The cap stops the creeping at a known point instead of for ever.",
    },
    {
      type: "bug",
      q: "This router should use poisoned reverse: tell a neighbour that destinations it reaches <i>through that neighbour</i> are unreachable. Click the faulty line.",
      code: [
        "def message_for(n):",
        "    msg = {}",
        "    for d in cost:",
        "        if nexthop[d] != n:",
        "            msg[d] = INF",
        "        else:",
        "            msg[d] = cost[d]",
        "    return msg",
      ],
      a: 3,
      hint: "Which destinations does this router reach via n?",
      why: "The test is the wrong way round. As written, it poisons every destination not reached via n and tells the truth about the ones that are. It should say <code>nexthop[d] == n</code>, so routes that go through n are poisoned.",
    },
  ]);

  /* =====================================================================
     a3-lp
     ===================================================================== */
  B.add("a3-lp", [
    {
      type: "slider",
      q: "A café minimises cost z = 2x + 3y. The rules are x + y ≥ 4 with x, y ≥ 0. The corners are (4, 0) and (0, 4), and the region goes on upwards without end. What is the lowest cost?",
      min: 0,
      max: 20,
      step: 1,
      start: 10,
      ans: 8,
      tol: 1,
      unit: "",
      hint: "Work out z at the two corners: 2 × 4 and 3 × 4.",
      why: "At (4, 0) the cost is 8, and at (0, 4) it is 12. Costs only rise as you move away, so the lowest is 8. A region with no upper edge is fine for minimising a cost that grows with x and y: it would only be unbounded if the cost could keep falling.",
    },
    {
      type: "order",
      q: "Put the steps of turning a word problem into a linear program in order.",
      items: [
        "Name the quantities you choose, such as x and y",
        "Write the score to maximise or minimise as a formula",
        "Write each limit as a constraint, including x, y ≥ 0",
        "Find the corner of the feasible region with the best score",
      ],
      hint: "You cannot write a formula until you have named the things in it.",
      why: "First choose the variables, then the objective in terms of them, then the constraints that limit them, and only then solve. Solving earlier would have nothing to solve.",
    },
    {
      type: "cat",
      q: "The feasible region is x + y ≤ 4, x ≤ 3, x, y ≥ 0, and we maximise. Sort each objective by what the best plans look like.",
      buckets: ["One best corner", "A whole edge of equally good plans"],
      items: [
        ["z = 2x + y", 0],
        ["z = x + y", 1],
        ["z = x + 2y", 0],
        ["z = 3x + 3y", 1],
        ["z = x − y", 0],
        ["z = 5x + 5y", 1],
      ],
      hint: "Which objectives slide parallel to the edge x + y = 4?",
      why: "When the objective is a multiple of x + y, its lines are parallel to the edge x + y = 4, so the whole edge from (0, 4) to (3, 1) ties. For 2x + y the best corner is (3, 1) with 7. For x + 2y it is (0, 4) with 8, and for x − y it is (3, 0) with 3.",
    },
    {
      type: "multi",
      q: "Maximise 3x + 2y with x + y ≤ 8, x ≤ 5 and y ≤ 6. The best plan is (5, 3), earning 21. Select every statement that is true.",
      o: [
        "Loosening y ≤ 6 would not change the best plan",
        "Tightening y ≤ 6 to y ≤ 4 would not change the best plan",
        "Raising x ≤ 5 to x ≤ 6 would raise the best profit",
        "Only the constraint x + y ≤ 8 is binding",
        "Loosening y ≤ 6 is the best way to earn more",
      ],
      a: [0, 1, 2],
      hint: "Which limits are met exactly at (5, 3)? The others have slack.",
      why: "At (5, 3), x + y = 8 and x = 5 are met exactly, so both are binding, while y = 3 is well under 6, which leaves slack. A slack limit can be loosened or tightened (down to 3) without effect. Raising x ≤ 6 gives the plan (6, 2) worth 22, which is more than 21.",
    },
    {
      type: "pick",
      q: "Maximise z = 3x + 4y over the region x ≤ 6, x + y ≤ 7, y ≤ 5, x, y ≥ 0. A student tabulated z at all five corners, but <b>one value is wrong</b>. Click it.",
      fig: cornerFig(),
      a: "60",
      hint: "Redo 3x + 4y at each corner, one at a time.",
      why: "At (6, 0) the score is 3 × 6 = 18, not 24. The others are right: 22 at (6, 1), 26 at (2, 5) and 20 at (0, 5). The best corner is (2, 5), so the wrong 24 would not have changed the answer here, but a wrong value on the best corner would.",
    },
    {
      type: "bug",
      q: "This should say whether a plan obeys <b>every</b> rule: x + y ≤ 8 and x ≤ 5, with x, y ≥ 0. It lets illegal plans through. Click the faulty line.",
      code: [
        "def feasible(x, y):",
        "    if x < 0 or y < 0:",
        "        return False",
        "    return x + y <= 8 or x <= 5",
      ],
      a: 3,
      hint: "Try the plan (5, 9). Which rule does it break?",
      why: "A plan must satisfy all the rules at once, so they are joined with <code>and</code>. With <code>or</code>, the plan (5, 9) passes because x ≤ 5, even though x + y = 14 breaks the first rule.",
    },
  ]);
})();

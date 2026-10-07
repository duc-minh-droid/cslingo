/* Phase 2 boss extension: new questions for A*, weighted A*, link-state, distance-vector and the Internet's protocols.
   Numbers checked with node. Each question stands on its own. */
(function () {
  const N = NIC,
    Qf = N.qfig;
  const def = N.bossDef("a2-boss");
  if (!def) return;
  const GA = { S: [60, 120], A: [200, 40], B: [200, 200], C: [330, 200], G: [450, 120] };
  const EA = [
    ["S", "A", 2],
    ["S", "B", 3],
    ["A", "G", 7],
    ["B", "C", 1],
    ["C", "G", 3],
  ];
  const GF = { S: [50, 110], X: [170, 40], Y: [310, 40], T: [440, 110], W: [200, 190] };
  const EF = [
    ["S", "X", 2],
    ["X", "Y", 3],
    ["Y", "T", 2],
    ["S", "W", 4],
    ["W", "T", 6],
    ["S", "Y", 7],
  ];
  def.qs.push(
    {
      type: "pick",
      q: "A* runs from S to G on the map shown. The estimates are h(S) = 5, h(A) = 5, h(B) = 3, h(C) = 2, h(G) = 0. S is expanded first. <b>Click the node expanded third.</b>",
      fig: Qf.graph(GA, EA, { pick: "nodes", w: 520, h: 250 }),
      a: "C",
      hint: "f = g + h. After S: A has 2 + 5, B has 3 + 3.",
      why: "After S: A has f = 2 + 5 = 7 and B has f = 3 + 3 = 6, so B is second. Expanding B gives C g = 4, f = 6, which beats A's 7, so <b>C</b> is third. A is never expanded: G is reached with f = 7, tied with A, and its smaller h wins.",
    },
    {
      type: "slider",
      q: "A planner uses weighted A* with ε = 1.5. The cheapest possible route on this map costs 30. What is the <b>highest</b> cost the guarantee allows it to return?",
      min: 20,
      max: 80,
      step: 1,
      ans: 45,
      tol: 2,
      unit: "",
      hint: "The bound is ε times the optimal cost: 1.5 × 30 is 30 plus half of 30.",
      why: "Weighted A* is ε-suboptimal: cost ≤ ε × optimal = 1.5 × 30 = <b>45</b>. It will often return less, but never more.",
    },
    {
      type: "cat",
      q: "A robot may move in 8 directions; a diagonal step costs √2 (about 1.4) and a straight step costs 1. Is each heuristic <b>admissible</b>?",
      buckets: ["Admissible", "Not admissible"],
      items: [
        ["Euclidean distance to the goal", 0],
        ["Manhattan distance to the goal", 1],
        ["1.5 × Euclidean distance to the goal", 1],
        ["Chebyshev distance: the larger of |dx| and |dy|", 0],
      ],
      why: "Straight-line distance never exceeds the true cost, so it is safe. Manhattan overestimates when diagonals are allowed (4 across and 4 up costs about 5.7, not 8). Inflating Euclidean by 1.5 overestimates when the route is a straight line. Chebyshev counts each diagonal as one step, which is at most its true cost √2, so it never overestimates.",
    },
    {
      type: "order",
      q: "Put one cycle of a distance-vector router in order.",
      items: [
        "Wait for a link cost change or a vector from a neighbour",
        "Recompute each entry as the minimum over neighbours of link cost plus the neighbour's distance",
        "Check whether any entry changed",
        "Send the new vector to all neighbours (only if something changed)",
      ],
      why: "The router sleeps until something happens, recomputes with the Bellman–Ford equation, and stays silent unless its vector changed. That silence is how the network eventually goes quiet.",
    },
    {
      type: "mcq",
      q: "Router A has three neighbours. B is 4 away and reports a distance of 9 to destination Z. C is 7 away and reports 3. D is 1 away and reports 11. What is A's distance to Z, and which next hop does it use?",
      o: ["10, via C", "12, via D", "13, via B", "3, via C"],
      a: 0,
      hint: "Add each link cost to what that neighbour reports, then take the smallest total.",
      why: "Via B: 4 + 9 = 13. Via C: 7 + 3 = 10. Via D: 1 + 11 = 12. The minimum is <b>10 via C</b>. The nearest neighbour (D) and the neighbour with the smallest report (C's 3) are both poor guides on their own.",
    },
    {
      type: "match",
      q: "Match each BGP message to what it does.",
      pairs: [
        ["OPEN", "Sets up the connection between two peers"],
        ["UPDATE", "Advertises a new path"],
        ["KEEPALIVE", "Keeps the connection alive when nothing else is sent"],
        ["NOTIFICATION", "Reports an error and closes the connection"],
      ],
      why: "BGP runs over TCP. OPEN starts the session, UPDATE carries the routes, KEEPALIVE confirms the peer is still there, and NOTIFICATION reports errors and ends the session.",
    },
    {
      type: "mcq",
      q: "In the network shown, S has computed its shortest-path tree: the cheapest route to T is S → X → Y → T. Which link does S use in its forwarding table for destination T?",
      fig: Qf.graph(GF, EF, { w: 520, h: 240 }),
      o: ["(S, X)", "(S, Y)", "(S, W)", "(Y, T)"],
      a: 0,
      hint: "A forwarding table only records the first step out of S.",
      why: "The route costs 2 + 3 + 2 = 7, against 9 via S–Y and 10 via W. Y is T's parent in the tree, but the forwarding table needs the <b>first link out of S</b>, which is (S, X).",
    },
    {
      type: "bug",
      q: "This A* loop sometimes returns a route that is not the cheapest. Click the faulty line.",
      code: [
        "open = {start};  g = {start: 0}",
        "while open:",
        "    n = min(open, key=lambda c: g[c] + h(c))",
        "    if n == goal: return path_to(n)",
        "    open.remove(n);  closed.add(n)",
        "    for m, cost in neighbours(n):",
        "        if m in closed: continue",
        "        if g[n] + cost > g.get(m, INF):",
        "            g[m] = g[n] + cost;  parent[m] = n;  open.add(m)",
      ],
      a: 7,
      why: "g should only be replaced when the new route is <b>cheaper</b>. With &gt; the code keeps the more expensive route to m. The test must be <code>g[n] + cost &lt; g.get(m, INF)</code>.",
    },
  );
  const m = N.modules.find((x) => x.id === "a2-boss");
  if (m) m.qCount = def.qs.length;
  def.blurb = `${def.qs.length} questions: trace Dijkstra and A*, judge heuristics, and diagnose link-state and distance-vector routing.`;
})();

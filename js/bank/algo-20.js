(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { loopFig, svg, tx } = partScope;
  const B = NIC.bank,
    Qf = NIC.qfig;

  B.add("a2-routing", [
    {
      type: "cat",
      q: "Router A has a table of costs and the neighbour B (the A–B link costs 2) has just advertised its own costs. What should A do with each entry?",
      buckets: ["A changes its entry", "A keeps its entry"],
      items: [
        ["P: A has 9 (not via B). B says P is 5 away.", 0],
        ["Q: A has 6 (not via B). B says Q is 4 away.", 1],
        ["R: A has 5 (not via B). B says R is 1 away.", 0],
        ["T: A has 8 (not via B). B says T is 7 away.", 1],
        ["U: A has no route. B says U is 12 away.", 0],
        ["V: A has 4, and the route goes <b>via B</b>. B now says V is 6 away.", 0],
      ],
      why: "A adds 2 to B's number: P 7 beats 9, Q 6 only ties 6 so it stays, R 3 beats 5, T 9 loses to 8, U 14 beats having nothing. V is the sneaky one: A's route goes through B, so when B's cost rises A must follow it to 8, even though that is worse.",
    },
    {
      type: "pick",
      q: "After the failure, the routers' tables are out of step. A packet for F follows the next hops shown. Click <b>every</b> router that is stuck in a routing loop.",
      fig: loopFig,
      a: ["B", "C"],
      why: "B sends the packet to C, and C sends it straight back to B, so it bounces between them until its time runs out. A is only passing it on to B, and D and E still have a working route.",
    },
    {
      type: "slider",
      q: "A, B and C sit in a line, each link costing 1. The link B–C breaks. A still believes C is 2 away, and B believes it from A, so each router raises its cost by 1 on every exchange. RIP treats a cost of 16 as unreachable. B's first new cost is 3. How many table updates, counting that first one, happen before the cost reaches 16?",
      min: 0,
      max: 30,
      step: 1,
      ans: 14,
      tol: 2,
      unit: " updates",
      hint: "The costs go 3, 4, 5, and so on, one per update, until 16.",
      why: "The two routers keep trading the news that C is reachable, adding 1 each time: 3, 4, 5, ..., 16. That is 14 updates of slow counting. Poisoned reverse stops it at once.",
    },
    {
      type: "bug",
      q: "A link-state router should pass each new advertisement on once. This one keeps re-flooding the same advertisements for ever. Click the faulty line.",
      code: [
        "def on_lsa(lsa):",
        "    old = seen.get(lsa.src, 0)",
        "    if lsa.seq >= old:",
        "        seen[lsa.src] = lsa.seq",
        "        flood(lsa)",
      ],
      a: 2,
      why: "With <code>&gt;=</code> an advertisement that was already seen still passes the test, so every router forwards it again and again. Only a strictly newer sequence number (<code>&gt;</code>) should be flooded.",
    },
    {
      type: "match",
      q: "Match each kind of router to what it knows.",
      pairs: [
        ["A link-state router", "The whole map: every router and every link cost"],
        ["A distance-vector router", "Its neighbours' claims about how far things are"],
        ["Both kinds", "The cost of their own directly connected links"],
        ["Neither kind", "A central server that holds the map for them"],
      ],
      why: "Link-state routers each build the full map and run Dijkstra. Distance-vector routers only trade tables with neighbours. Both start from their own links, and there is no central server.",
    },
  ]);

  /* =====================================================================
     a3-lp
     ===================================================================== */
  const regionFig = Qf.points(
    { O: [0, 0], X: [5, 0], Y: [5, 3], Z: [0, 8] },
    { max: 10, w: 400, h: 300, pick: false, poly: ["O", "X", "Y", "Z"] },
  );
  const cornerFig = Qf.points(
    { A: [0, 0], B: [5, 0], C: [4, 4], D: [1, 5] },
    { max: 6, w: 400, h: 300, pick: false, poly: ["A", "B", "C", "D"] },
  );
  const redundantFig = (() => {
    const W = 460,
      H = 280,
      X = (x) => 40 + x * 46,
      Y = (y) => H - 30 - y * 30;
    const poly = [
      [0, 0],
      [4, 0],
      [4, 2],
      [1, 5],
      [0, 5],
    ]
      .map(([x, y]) => `${X(x)},${Y(y)}`)
      .join(" ");
    let s = `<polygon points="${poly}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2"/>`;
    s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(8)}" y2="${Y(0)}" stroke="var(--line-2)" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(8)}" stroke="var(--line-2)" stroke-width="2"/>`;
    const L = (id, x1, y1, x2, y2, lx, ly, t, col) =>
      `<g data-pick="${id}"><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${col}" stroke-width="3"/><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="transparent" stroke-width="18"/>${tx(X(lx), Y(ly), t, { sz: 13, c: col })}</g>`;
    s += L("c1", 0, 6.4, 6.4, 0, 6.2, 0.4, "x + y ≤ 6", "var(--blue-ink)");
    s += L("c2", 4, 0, 4, 7.4, 4.5, 7.5, "x ≤ 4", "var(--violet-ink)");
    s += L("c3", 0, 7, 8, 3, 6.3, 3.6, "x + 2y ≤ 14", "var(--amber-ink)");
    s += L("c4", 0, 5, 7, 5, 6.5, 5.5, "y ≤ 5", "var(--rose-ink)");
    return (
      svg(W, H, s) +
      `<div class="faint" style="font-weight:800">The shaded area is what all four constraints allow, with x, y ≥ 0.</div>`
    );
  })();

  B.add("a3-lp", [
    {
      type: "match",
      q: "A bakery makes <b>x</b> trays of buns and <b>y</b> cakes. Match each sentence to its place in the linear program.",
      pairs: [
        ["A tray takes 2 hours and a cake takes 3, and only 40 hours are available", "2x + 3y ≤ 40"],
        ["At least 5 trays must be made", "x ≥ 5"],
        ["A tray earns 4 and a cake earns 5, as much as possible", "Maximise 4x + 5y"],
        ["You cannot bake a negative number of anything", "x ≥ 0 and y ≥ 0"],
      ],
      why: "Resources and requirements become constraints, the thing you want becomes the objective, and the obvious facts (no negative amounts) still have to be written down.",
    },
    {
      type: "slider",
      q: "Maximise profit z = 3x + 2y. The shaded plans obey x + y ≤ 8 and x ≤ 5 (best corner (5, 3), z = 21). The limit grows to x + y ≤ 10, with x ≤ 5 unchanged. What is the best profit now?",
      fig: regionFig,
      min: 15,
      max: 40,
      step: 1,
      ans: 25,
      tol: 2,
      unit: "",
      hint: "The best corner moves up to x = 5 and y = 10 − 5. Work out 3 × 5 + 2 × 5.",
      why: "The new corner is (5, 5), giving 15 + 10 = 25. The extra 2 units of the first limit were worth 4 profit, so it is a valuable constraint to relax.",
    },
    {
      type: "multi",
      q: "A plan must obey x + y ≤ 6 with x, y ≥ 0. Adding one more constraint to this list, which would leave <b>no</b> feasible plan at all? Select all.",
      o: ["x + y ≥ 8", "x ≥ 7", "y ≥ 2", "x − y ≤ 3", "x + y ≥ 6"],
      a: [0, 1],
      why: "x + y ≥ 8 and x + y ≤ 6 contradict each other, and x ≥ 7 pushes x past the largest value x + y ≤ 6 allows. y ≥ 2 and x − y ≤ 3 still leave plans such as (1, 3), and x + y ≥ 6 leaves the whole line x + y = 6 feasible.",
    },
    {
      type: "order",
      q: "Order the four corners of the feasible region from the <b>lowest</b> to the highest value of z = 2x + 3y.",
      fig: cornerFig,
      items: ["A", "B", "D", "C"],
      hint: "Read each corner's x and y off the grid: z = 2x + 3y.",
      why: "A (0, 0) gives 0, B (5, 0) gives 10, D (1, 5) gives 17 and C (4, 4) gives 20. The best corner is C, and checking corners is enough because the best value always sits on one.",
    },
    {
      type: "pick",
      q: "One of these four constraints is <b>redundant</b>: deleting it would not change the feasible region at all. Click it.",
      fig: redundantFig,
      a: "c3",
      hint: "Look at which lines actually form the edges of the shaded area.",
      why: "x + 2y ≤ 14 lies far outside the shaded area, so the other three constraints already keep every plan inside it (at the corner (1, 5), x + 2y is only 11). Removing x + y ≤ 6, x ≤ 4 or y ≤ 5 would each enlarge the region.",
    },
  ]);
})();

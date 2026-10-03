(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { defsArrow, floodFig, line, netFig, rect, seqFig, stackFig, svg, tx } = partScope;
  const B = NIC.bank;
  const dim = "var(--text-dim)";

  B.add("a2-routing", [
    {
      type: "pick",
      q: "C's link to B breaks, and the routers keep swapping distance-vector messages about destination C (no poisoned reverse). Click the message that first makes a router believe in a route to C that does not exist.",
      fig: seqFig(),
      a: "m1",
      hint: "After the break, who still thinks they can reach C, and whose route goes through whom?",
      why: 'After the break B has no route to C. A, not yet knowing, advertises "C = 2", a route that goes through B itself. B accepts it and believes C is 3 away via A. Everything after that just feeds on this first false belief: B tells A 3, A moves to 4, and so on, counting to infinity. Poisoned reverse would stop it, since A would tell B "C = ∞".',
    },
    {
      type: "pick",
      q: 'Distance-vector routers "count to infinity" when a destination becomes unreachable and the news spreads slowly. In each network the dashed red link fails, and X is the destination. In which network do the costs to X settle at a real, finite value afterwards?',
      fig: netFig(),
      a: "n2",
      hint: "After the failure, can every router still get to X by some path?",
      why: "In network 2 the failed link has a spare route: X is still reachable through C, so costs rise for a while and then settle on a true path. In networks 1 and 3 the failed link is X's only connection to the rest, so nobody can reach X any more and the routers keep raising each other's cost until it hits the maximum.",
    },
    {
      type: "mcq",
      q: "A packet from A to Z can take one of three routes. Each segment shows one link's delay in milliseconds. Which pair of choices is right?",
      fig: stackFig(),
      o: [
        "Hop count: Route 1. Delay: Route 3",
        "Hop count: Route 3. Delay: Route 1",
        "Hop count: Route 2. Delay: Route 3",
        "Hop count: Route 1. Delay: Route 2 (the middle one)",
      ],
      a: 0,
      why: "A hop count just counts links: Route 1 has 2, Route 2 has 3 and Route 3 has 4, so a hop-count metric picks Route 1. A delay metric adds the milliseconds: 20 + 25 = 45, 9 + 8 + 10 = 27 and 5 + 6 + 5 + 7 = 23, so it picks Route 3. Fewer hops is not the same as a faster route.",
    },
    {
      type: "slider",
      q: "Router A's link cost changes, so A floods a link-state advertisement. Every router that gets the <b>first copy</b> forwards it out of all its links except the one it arrived on, and ignores later copies. About how many times is the advertisement sent over links in total (count each direction separately)?",
      fig: floodFig,
      min: 0,
      max: 40,
      step: 1,
      ans: 13,
      tol: 3,
      unit: "sends",
      hint: "A sends it on its 2 links. Each other router forwards it on all its links except one.",
      why: "A sends on its 2 links. Each other router forwards on its links minus one: B 3, C 2, D 2, E 3, F 1, which is 11. The total is 2 + 11 = 13, which is 2 × 9 links − 5. Duplicate copies still cross the links (and are discarded), so flooding costs about twice the number of links.",
    },
  ]);

  /* =====================================================================
     a3-lp
     ===================================================================== */
  // 1. unbounded region
  const openRegion = () => {
    const X = (x) => 40 + x * 45,
      Y = (y) => 270 - y * 30;
    let s = "";
    for (let i = 0; i <= 8; i += 2)
      s +=
        line(X(i), Y(0), X(i), Y(8), { c: "var(--line)", w: 1 }) +
        line(X(0), Y(i), X(8), Y(i), { c: "var(--line)", w: 1 }) +
        tx(X(i), Y(0) + 16, i, { sz: 11, c: dim }) +
        tx(X(0) - 8, Y(i) + 4, i, { a: "end", sz: 11, c: dim });
    s += `<polygon points="${[
      [0, 8],
      [0, 6],
      [1.6, 1.2],
      [4, 0],
      [8, 0],
      [8, 8],
    ]
      .map(([x, y]) => `${X(x)},${Y(y)}`)
      .join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3"/>`;
    [
      [0, 6],
      [1.6, 1.2],
      [4, 0],
    ].forEach(
      ([x, y]) =>
        (s += `<circle cx="${X(x)}" cy="${Y(y)}" r="6" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>`),
    );
    s +=
      tx(X(5.6), Y(5), "feasible region", { sz: 14, c: "var(--teal-ink)" }) +
      tx(X(5.6), Y(4.2), "(goes on for ever →)", { sz: 12, c: "var(--teal-ink)" });
    s +=
      tx(X(0.95), Y(4.4), "3x + y = 6", { a: "start", sz: 12, c: dim }) +
      tx(X(2.3), Y(1.9), "x + 2y = 4", { a: "start", sz: 12, c: dim });
    return svg(420, 300, s);
  };
  // 2. best profit against the shared limit
  const profitFig = () => {
    const X = (b) => 50 + b * 42,
      Y = (z) => 220 - z * 9;
    let s = "";
    [0, 6, 12, 18].forEach(
      (z) =>
        (s +=
          line(50, Y(z), 480, Y(z), { c: "var(--line)", w: 1 }) + tx(42, Y(z) + 4, z, { a: "end", sz: 11, c: dim })),
    );
    for (let b = 0; b <= 10; b += 2) s += tx(X(b), 242, b, { sz: 11, c: dim });
    s +=
      tx(270, 258, "shared limit b  (x + y ≤ b)", { sz: 12, c: dim }) +
      tx(6, 14, "best profit", { a: "start", sz: 12, c: dim });
    s += `<path d="M${X(0)} ${Y(0)} L${X(4)} ${Y(12)} L${X(7)} ${Y(18)} L${X(10)} ${Y(18)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>`;
    [
      [3, 9],
      [4, 12],
      [5, 14],
      [7, 18],
      [9, 18],
    ].forEach(
      ([b, z]) =>
        (s += `<g data-pick="${b}"><rect x="${X(b) - 20}" y="20" width="40" height="225" fill="transparent"/><circle cx="${X(b)}" cy="${Y(z)}" r="12" fill="var(--panel)" stroke="var(--violet)" stroke-width="3"/>${tx(X(b), Y(z) + 5, b, { sz: 13, c: "var(--violet-ink)" })}</g>`),
    );
    return svg(500, 264, s, true);
  };
  // 3. small multiples: objective directions
  const dirFig = () => {
    const id = "dr" + ++partScope.uid,
      X = (x) => 20 + x * 30,
      Y = (y) => 150 - y * 30,
      poly = [
        [0, 0],
        [4, 0],
        [4, 2],
        [2, 4],
        [0, 4],
      ];
    const panels = [
      ["a", "A: maximise 2x + y", [2, 1]],
      ["b", "B: maximise x + y", [1, 1]],
      ["c", "C: maximise x + 3y", [1, 3]],
    ];
    let s = defsArrow(id, "var(--amber)");
    panels.forEach(([k, t, [dx, dy]], i) => {
      const L = Math.hypot(dx, dy),
        ex = 1.6 + (dx / L) * 1.3,
        ey = 1.6 + (dy / L) * 1.3;
      s +=
        `<g data-pick="${k}" transform="translate(${i * 170},0)">${rect(2, 2, 162, 186, { r: 12 })}${tx(83, 22, t, { sz: 12 })}<polygon points="${poly.map(([x, y]) => `${X(x) + 6},${Y(y) + 18}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>` +
        line(X(1.6) + 6, Y(1.6) + 18, X(ex) + 6, Y(ey) + 18, { c: "var(--amber)", w: 4, arrow: id }) +
        tx(83, 182, "arrow = direction of better", { sz: 10, c: dim }) +
        "</g>";
    });
    return svg(510, 192, s, true);
  };
  // 4. resource usage bars
  const useFig = () => {
    const bars = [
        ["Wood", 100, "24 of 24 kg used"],
        ["Labour", 100, "6 of 6 hours used"],
        ["Paint", 75, "1.5 of 2 litres used"],
      ],
      Y = (p) => 190 - p * 1.6;
    let s = "";
    [0, 50, 100].forEach(
      (p) =>
        (s +=
          line(50, Y(p), 490, Y(p), { c: "var(--line)", w: 1 }) +
          tx(42, Y(p) + 4, p + "%", { a: "end", sz: 11, c: dim })),
    );
    bars.forEach(([n, u, lab], i) => {
      const x = 90 + i * 140;
      s += `<rect x="${x}" y="${Y(u)}" width="80" height="${190 - Y(u)}" rx="8" fill="var(--blue-dim)" stroke="var(--blue)" stroke-width="3"/>`;
      if (u < 100)
        s +=
          `<rect x="${x}" y="${Y(100)}" width="80" height="${Y(u) - Y(100)}" rx="8" fill="none" stroke="var(--line-2)" stroke-width="3" stroke-dasharray="5 4"/>` +
          tx(x + 40, Y(100) + (Y(u) - Y(100)) / 2 + 5, "left over", { sz: 12, c: dim });
      s += tx(x + 40, 210, n, { sz: 14 }) + tx(x + 40, 228, lab, { sz: 11, c: dim });
    });
    return svg(500, 238, s);
  };

  B.add("a3-lp", [
    {
      type: "mcq",
      q: "Constraints: x + 2y ≥ 4, 3x + y ≥ 6 and x, y ≥ 0. The feasible region has no upper edge. Which objective has a finite best value on it?",
      fig: openRegion(),
      o: ["Maximise x + y", "Maximise 3x − y", "Minimise x + y", "Maximise y − 2x"],
      a: 2,
      hint: "Can you walk off the right or the top of the region and make the objective keep growing?",
      why: 'The region runs on for ever to the right and upwards. x + y gets bigger as either grows, 3x − y keeps growing as x grows, and y − 2x keeps growing as y grows, so none of those has a maximum (the solver reports "unbounded"). Minimising x + y pushes towards the origin: the corners give 6 at (0, 6), 2.8 at (1.6, 1.2) and 4 at (4, 0), so the best is 2.8 at (1.6, 1.2).',
    },
    {
      type: "pick",
      q: "A factory maximises profit 3x + 2y with x ≤ 4, y ≤ 3 and one shared limit x + y ≤ b. The curve shows the best profit for each b. Click the <b>smallest</b> marked b at which raising the limit further stops helping.",
      fig: profitFig(),
      a: "7",
      hint: "Find where the curve goes flat.",
      why: "From b = 7 on, the best plan is x = 4, y = 3 (profit 18): the other two limits are the ones holding profit back, so extra shared room is worth nothing. Between b = 4 and 7 each extra unit buys 2 profit (one more y), and below 4 each unit buys 3 (one more x). The slope of the curve is what one more unit of the limit is worth.",
    },
    {
      type: "pick",
      q: "Same feasible region in each picture, with a different objective. The amber arrow points the way the objective improves. Click the picture where the best plan is <b>not one corner</b> but a whole edge of equally good plans.",
      fig: dirFig(),
      a: "b",
      hint: "Slide the objective line along its arrow until it leaves the region. Does it touch a corner or an edge last?",
      why: "In B the objective x + y gives lines parallel to the slanted edge x + y = 6, so the whole edge from (4, 2) to (2, 4) is optimal, with value 6 everywhere along it. In A (2x + y) the last point is the corner (4, 2), value 10. In C (x + 3y) it is the corner (2, 4), value 14. A tie happens when the objective is parallel to an edge.",
    },
    {
      type: "multi",
      q: "A bakery maximises profit 5x + 4y with wood 6x + 4y ≤ 24, labour x + 2y ≤ 6 and paint y ≤ 2. The best plan (x = 3, y = 1.5) uses the resources as shown. If you could get one more unit of just one resource, which would raise the best profit? Select all that apply.",
      fig: useFig(),
      o: ["Wood", "Labour", "Paint"],
      a: [0, 1],
      hint: "A resource with something left over is not what is holding profit back.",
      why: "Wood and labour are used up, so they are the binding limits: one more wood lifts the best profit from 21 to 21.75, and one more labour to about 21.33. Paint still has 0.5 left over, so more paint changes nothing and the best profit stays 21.",
    },
  ]);
})();

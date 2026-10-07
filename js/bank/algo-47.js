(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { circ, dot, hullScatter, ln, pk, plane, rect, shareBars, snaps, stackPlot, stackScene, svg, txt, wl } =
    partScope;
  const B = NIC.bank;

  B.add("a5-graham", [
    {
      type: "pick",
      q: "A Graham scan starts with the anchor on the stack. The chart shows the stack height after each point of the sorted list has been processed. Every step pushes the new point, and may pop some points first. Click the step in which the MOST points were popped.",
      fig: stackPlot,
      a: "p5",
      hint: "Pops at a step = 1 + (old height) − (new height). A step that only rises by 1 popped nothing.",
      why: "Step 4 stays at 4: it pushed one point and popped one (1 + 4 − 4 = 1). Step 5 drops from 4 to 3: it pushed one and popped TWO (1 + 4 − 3 = 2), the most of any step. Step 8 stays at 5, with one pop. Steps 1, 2, 3, 6 and 7 rise by exactly 1, so nothing was popped there. The final height is 5, so five points are on the hull.",
    },
    {
      type: "cat",
      q: "Graham scan pushes the points one by one in angle order A, B, C, D, E, F (the anchor P0 is pushed first). Each snapshot shows the stack, with the bottom at the bottom, right after the named point has been pushed. Which snapshots are possible?",
      fig: snaps,
      buckets: ["Possible", "Impossible"],
      items: [
        ["Snapshot 1", 0],
        ["Snapshot 2", 1],
        ["Snapshot 3", 1],
        ["Snapshot 4", 0],
      ],
      hint: "A stack only removes from the top. And where is the point that was just pushed?",
      why: "Snapshot 1 is possible: B was popped when C arrived, and D was pushed on top. Snapshot 4 is possible: D and C were popped when E arrived. Snapshot 2 is impossible: A is gone but B, which sits above A, is still there, and a stack cannot remove from the middle. Snapshot 3 is impossible: the point just pushed (F) must be on top, but F is missing.",
    },
    {
      type: "slider",
      min: 0,
      max: 40,
      step: 0.5,
      start: 20,
      ans: 4.5,
      tol: 2,
      unit: "% shorter",
      q: "Graham scan on 1,000,000 points spends its time sorting (about n log₂ n steps) and scanning (at most 2n steps). The bars show the shares. A clever trick makes the scan twice as fast and leaves the sort alone. By about what percentage does the WHOLE run get shorter?",
      fig: shareBars,
      hint: "Out of 22 parts of time, 20 are the sort and 2 are the scan. Halving the scan saves 1 part.",
      why: "At n = 1,000,000 the scan is only about 9% of the total (sort 20 parts, scan 2 parts, out of 22). Halving it saves half of 9%, so the whole run is only about 4.5% shorter. That is why the algorithm is O(n log n): the sort dominates, and polishing the scan can never matter much.",
    },
    {
      type: "pick",
      q: "Graham scan pops a point whenever the turn is not a strict left turn, so points that are straight on the boundary are popped too. The anchor P0 is always on the hull. Click every point that is NOT on the final stack.",
      fig: hullScatter,
      a: ["a", "c", "e", "h", "i"],
      hint: "Find the corner points first. Then check for points lying exactly on a side between two corners.",
      why: "The hull corners are P0, b, d, f and g. Points e, h and i are inside. Points a and c are different: a lies exactly on the straight bottom side from P0 to b, and c lies exactly on the right side from b to d. They make a straight line (turn 0) with their neighbours, so the scan pops them. A scan that popped only on right turns would keep a and c as flat hull points.",
    },
    {
      type: "pick",
      q: "The stack before and after one step of Graham scan is shown (the new point D is amber). D comes later in angle order than C. Click every numbered position that D could be in.",
      fig: stackScene,
      a: ["d3", "d4"],
      hint: "Two points were popped, B and C. Each pop means that point is not a left turn. Where must D be to be right of B → C and right of A → B?",
      why: "C is popped when B → C → D is not a left turn, and then B is popped when A → B → D is not a left turn. D sits high and close in, beyond the outside edge of the chain: positions 3 and 4. Position 2 pops only C (B survives), so the stack would end P0, A, B, D. Positions 1 and 5 turn left at C, so nothing is popped and D is pushed on top of C.",
    },
  ]);

  /* =====================================================================
     l2-mst
     ===================================================================== */
  const mapLinks = (() => {
    const T = { A: [2, 1], B: [4, 2], C: [7, 6], D: [5, 2], E: [7, 8], F: [1, 2], G: [10, 3] };
    const p = plane(11, 9, 24, 16, 416, 276, true);
    let g = p.g;
    [
      ["A", "F", "1.4", -17, 12],
      ["B", "D", "1.0", 0, -17],
      ["C", "E", "2.0", 14, 0],
      ["C", "G", "4.2", 6, -10],
      ["A", "B", "2.2", 4, 17],
      ["C", "D", "4.5", -14, -6],
      ["F", "B", "3.0", -8, -14],
      ["D", "G", "5.1", 0, 16],
    ].forEach(([a, b, w, dx, dy]) => {
      const [x1, y1] = [p.X(T[a][0]), p.Y(T[a][1])],
        [x2, y2] = [p.X(T[b][0]), p.Y(T[b][1])];
      g += pk(
        a + b,
        ln(x1, y1, x2, y2, "var(--blue)", 4) +
          ln(x1, y1, x2, y2, "transparent", 22) +
          wl((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy + 4, w, "var(--ink)", 12),
      );
    });
    Object.entries(T).forEach(([k, [x, y]]) => (g += dot(p.X(x), p.Y(y), k, { r: 10, s: 12 })));
    return svg(440, 292, g);
  })();

  const planLine = (() => {
    const P = [
      ["P1", 14, "var(--rose)", "loop, and town E is cut off"],
      ["P2", 17, "var(--rose)", "tree, but town C has 3 links"],
      ["P3", 19, "var(--teal)", "tree, no town has more than 2 links"],
      ["P4", 20, "var(--teal)", "tree, no town has more than 2 links"],
      ["P5", 23, "var(--teal)", "tree, no town has more than 2 links"],
    ];
    const X = (c) => 30 + ((c - 12) / 13) * 400;
    let g = ln(X(12), 54, X(25), 54, "var(--line-2)", 3);
    for (let c = 12; c <= 24; c += 2)
      g += ln(X(c), 48, X(c), 60, "var(--line-2)", 2) + txt(X(c), 84, c, { s: 12, w: 700, c: "var(--text-dim)" });
    P.forEach(
      ([n, c, col]) => (g += circ(X(c), 54, 12, col, col, 2) + txt(X(c), 59, n.slice(1), { s: 13, c: "#fff" })),
    );
    g += txt(220, 22, "total cost of each plan", { s: 12, c: "var(--ink)" });
    P.forEach(([n, c, col, note], i) => {
      const y = 98 + i * 34;
      g += pk(
        n,
        rect(8, y, 424, 28, "var(--panel)", "var(--line-2)", 2, 8) +
          circ(28, y + 14, 11, col, col, 2) +
          txt(28, y + 19, n.slice(1), { s: 12, c: "#fff" }) +
          txt(46, y + 19, `cost ${c}: ${note}`, { a: "start", s: 12, c: "var(--ink)" }),
      );
    });
    return svg(440, 98 + 5 * 34 + 4, g);
  })();

  const ring = (() => {
    const cx = 160,
      cy = 96,
      R = 70,
      d2r = Math.PI / 180,
      ang = [-90, -30, 30, 90, 150, 210],
      cost = [4, 6, 3, 7, 5, 2];
    const P = ang.map((a) => [cx + R * Math.cos(a * d2r), cy + R * Math.sin(a * d2r)]);
    let g = "";
    P.forEach((p, i) => {
      const q = P[(i + 1) % 6],
        mx = (p[0] + q[0]) / 2,
        my = (p[1] + q[1]) / 2,
        dx = mx - cx,
        dy = my - cy,
        d = Math.hypot(dx, dy);
      g +=
        ln(p[0], p[1], q[0], q[1], "var(--blue)", 4) +
        wl(mx + (dx / d) * 16, my + (dy / d) * 16 + 4, cost[i], "var(--ink)");
    });
    P.forEach((p, i) => (g += dot(p[0], p[1], "ABCDEF"[i], { r: 14, s: 13 })));
    g +=
      txt(300, 82, "tour cost:", { a: "start", s: 13, c: "var(--ink)" }) +
      txt(300, 102, "4 + 6 + 3 + 7", { a: "start", s: 13, c: "var(--ink)" }) +
      txt(300, 122, "+ 5 + 2 = 27", { a: "start", s: 13, c: "var(--ink)" });
    return svg(460, 196, g);
  })();

  const tiedPlans = (() => {
    const names = ["A", "B", "C", "D", "E"],
      ang = [-90, -18, 54, 126, 198],
      d2r = Math.PI / 180;
    const E = [
      ["A", "B", 2],
      ["B", "C", 2],
      ["C", "D", 3],
      ["D", "E", 3],
      ["E", "A", 3],
      ["B", "D", 5],
    ];
    const plans = [
      [
        ["A", "B"],
        ["B", "C"],
        ["C", "D"],
        ["D", "E"],
      ],
      [
        ["A", "B"],
        ["B", "C"],
        ["D", "E"],
        ["E", "A"],
      ],
      [
        ["A", "B"],
        ["B", "C"],
        ["B", "D"],
        ["D", "E"],
      ],
    ];
    let g = "";
    plans.forEach((pl, p) => {
      const x0 = 8 + p * 150,
        cx = x0 + 70,
        cy = 108,
        R = 46;
      const P = Object.fromEntries(
        names.map((n, i) => [n, [cx + R * Math.cos(ang[i] * d2r), cy + R * Math.sin(ang[i] * d2r)]]),
      );
      let inner =
        rect(x0, 6, 140, 196, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 70, 26, `Plan ${p + 1}`, { s: 13, c: "var(--ink)" });
      E.forEach(([a, b]) => {
        const on = pl.some(([u, v]) => (u === a && v === b) || (u === b && v === a)),
          [x1, y1] = P[a],
          [x2, y2] = P[b];
        inner += ln(
          x1,
          y1,
          x2,
          y2,
          on ? "var(--teal)" : "var(--line-2)",
          on ? 5 : 2,
          on ? "" : 'stroke-dasharray="2 5"',
        );
      });
      E.forEach(([a, b, w]) => {
        const [x1, y1] = P[a],
          [x2, y2] = P[b],
          mx = (x1 + x2) / 2,
          my = (y1 + y2) / 2,
          dx = mx - cx,
          dy = my - cy,
          d = Math.hypot(dx, dy) || 1,
          diag = a === "B" && b === "D";
        inner += wl(diag ? mx + 12 : mx + (dx / d) * 11, diag ? my - 4 : my + (dy / d) * 11 + 4, w, "var(--ink)", 11);
      });
      names.forEach((n) => (inner += dot(P[n][0], P[n][1], n, { r: 11, s: 11 })));
      inner += txt(x0 + 70, 190, "green links used", { s: 10, w: 700, c: "var(--text-dim)" });
      g += pk("pl" + (p + 1), inner);
    });
    return svg(460, 210, g);
  })();

  B.add("l2-mst", [
    {
      type: "pick",
      q: "Seven towns lie on a map and a cable costs its straight-line length. Eight possible cables are drawn with their costs. A cable is a SURE PICK if it is the shortest cable leaving some single town (that town versus all the others is a cut). Click every drawn cable that is a sure pick.",
      fig: mapLinks,
      a: ["AF", "BD", "CE", "CG"],
      hint: "For each town, find its shortest cable among the drawn ones. A cable is a sure pick if it is the shortest at either of its ends.",
      why: "A's shortest is A–F (1.4), B's is B–D (1.0), C's is C–E (2.0), D's is B–D, E's is C–E, F's is A–F, and G's is C–G (4.2). So A–F, B–D, C–E and C–G are sure picks by the cut property. A–B (2.2), C–D (4.5), F–B (3.0) and D–G (5.1) are never the shortest at either end. C–D happens to be in the cheapest network, but it needs a bigger cut to prove it.",
    },
    {
      type: "pick",
      q: "A firm may build only a plan that connects every town, has no loops and gives no town more than 2 links. The five plans are placed by total cost. Click the plan the firm should build.",
      fig: planLine,
      a: "P3",
      hint: "Cross out any plan that breaks a rule. Then take the cheapest of what is left.",
      why: "Plan 1 (14) is the cheapest overall, but a town is cut off, so it does not connect everything. Plan 2 (17) is a proper spanning tree, probably the plain MST, but town C has 3 links, which the rule forbids. Plans 3, 4 and 5 are all legal and Plan 3 is the cheapest at 19. The unconstrained MST is only a lower bound: no tree can cost less, and the rule pushes the best legal tree above it.",
    },
    {
      type: "bug",
      q: "This greedy code takes the cables cheapest first and tries to build a tree where no town has more than 2 links. For a star (one hub with four cheap cables) it returns a hub with 4 links. Click the faulty line.",
      code: [
        "def greedy(edges, n):",
        "    deg = [0] * n",
        "    group = list(range(n))",
        "    tree = []",
        "    for w, u, v in sorted(edges):",
        "        if group[u] == group[v]:",
        "            continue",
        "        if deg[u] > 1 and deg[v] > 1:",
        "            continue",
        "        old, new = group[v], group[u]",
        "        for i in range(n):",
        "            if group[i] == old:",
        "                group[i] = new",
        "        deg[u] += 1",
        "        deg[v] += 1",
        "        tree.append((u, v))",
        "    return tree",
      ],
      a: 7,
      why: "The code skips a cable only when BOTH ends are already full ('and'). A cable should be skipped when EITHER end is full ('or'), because adding it would give that town a third link. With 'and', the hub keeps accepting spokes while the other end has room, so it ends with 4 links. Everything else is right: the group relabelling stops loops, and the degree counts are updated.",
    },
    {
      type: "mcq",
      q: "These six towns are joined by a round tour of cables that costs 27 in total, as drawn. You delete the dearest cable (7). What is certain about the cost of the CHEAPEST spanning tree of the six towns, using the cables available?",
      fig: ring,
      o: ["At most 20", "Exactly 20", "At least 27", "At least 20"],
      a: 0,
      hint: "What is left after deleting one cable from a ring: is it a spanning tree? What does it cost?",
      why: "Deleting one cable from a ring leaves a path through all six towns: connected, no loop, so it is a spanning tree. It costs 27 − 7 = 20. The cheapest spanning tree can cost no more than this one, so it is AT MOST 20. It could be less if other cables exist, so 'exactly 20' is not certain, and 'at least' is the wrong way round.",
    },
    {
      type: "pick",
      q: "Five towns can be linked by the cables shown (costs on each). Three plans are drawn, each in green; every plan is a spanning tree. Click every plan that is a minimum spanning tree.",
      fig: tiedPlans,
      a: ["pl1", "pl2"],
      hint: "Add up the green costs of each plan. Then ask: does every minimum tree have to look the same?",
      why: "Plan 1 costs 2 + 2 + 3 + 3 = 10 and plan 2 costs 2 + 2 + 3 + 3 = 10. Plan 3 uses the dear diagonal B–D (5): 2 + 2 + 5 + 3 = 12. The three cables of cost 3 (C–D, D–E, E–A) are such that any two of them finish the tree, so there are three different cheapest trees. Ties do not change the minimum cost, but they mean the cheapest network may not be unique.",
    },
  ]);
})();

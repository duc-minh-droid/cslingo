(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { astar, grid, nextFig, svg, tx, wallSet } = partScope;
  const B = NIC.bank,
    Qf = NIC.qfig;
  const diagFig = (() => {
    const cs = 52,
      cells = {},
      G = [7, 2],
      put = (id, x, y) =>
        (cells[x + "," + y] = {
          fill: "var(--violet-dim)",
          stroke: "var(--violet)",
          t: "h " + (Math.abs(x - G[0]) + Math.abs(y - G[1])),
          pick: id,
        });
    put("a", 4, 2);
    put("b", 5, 0);
    put("c", 2, 2);
    put("d", 3, 4);
    put("e", 6, 1);
    put("f", 6, 2);
    cells["7,2"] = { fill: "var(--rose-dim)", stroke: "var(--rose)", t: "G" };
    return svg(
      8 * cs + 2,
      5 * cs + 30,
      grid(8, 5, cs, { cells }) +
        tx(4 * cs, 5 * cs + 22, "each purple cell shows its Manhattan distance to G: |dx| + |dy|", {
          sz: 12,
          c: "var(--text-dim)",
        }),
      true,
    );
  })();
  const pocketFig = (() => {
    const W = 11,
      H = 7,
      S = [0, 3],
      G = [7, 3],
      list = [];
    for (let y = 1; y <= 5; y++) list.push([5, y], [9, y]);
    for (let x = 5; x <= 9; x++) list.push([x, 1], [x, 5]);
    const walls = wallSet(list);
    walls.delete("9,3");
    const one = (h0, name) => {
      const closed = astar(W, H, walls, S, G, h0),
        cells = {};
      closed.forEach((k) => (cells[k] = { fill: "var(--teal-dim)", stroke: "var(--teal)" }));
      cells["0,3"] = { ...cells["0,3"], fill: "var(--amber-dim)", stroke: "var(--amber)", t: "S", sz: 11 };
      cells["7,3"] = { fill: "var(--rose-dim)", stroke: "var(--rose)", t: "G", sz: 11 };
      return `<div style="flex:1 1 250px;min-width:230px">${svg(W * 26 + 2, H * 26 + 2, grid(W, H, 26, { cells, walls }), true)}<div style="text-align:center;font-weight:800;margin-top:4px">${name}: ${closed.length} cells expanded</div></div>`;
    };
    return `<div style="display:flex;flex-wrap:wrap;gap:14px">${one(false, "A* (Manhattan)")}${one(true, "Dijkstra (h = 0)")}</div><div class="faint" style="margin-top:6px;font-weight:800">Green cells were expanded. G sits inside a dark pocket whose opening faces away from S.</div>`;
  })();

  B.add("a2-astar", [
    {
      type: "pick",
      q: "A* (Manhattan distance, 4-way moves, every step costs 1) is part-way through. Click the waiting cell it will expand next.",
      fig: nextFig,
      a: "3,2",
      hint: "For each purple cell: f = g + h, where h counts the squares to G ignoring walls.",
      why: "Cell (3,2) has g = 3 and h = 4, so f = 7. Every other waiting cell has f = 9 (for instance g = 1 and h = 8). A* heads for the goal even though the wall will block that column: Manhattan distance never looks at walls, so it only finds out when the cell is expanded.",
    },
    {
      type: "bug",
      q: "This A* returns a path that isn't always the shortest. Click the line that turns it into greedy best-first search.",
      code: [
        "def astar(start, goal, h, nbrs):",
        "    g = {start: 0}",
        "    open_ = [(h(start), start)]",
        "    while open_:",
        "        _, u = heapq.heappop(open_)",
        "        if u == goal:",
        "            return g[u]",
        "        for v, w in nbrs(u):",
        "            if g[u] + w < g.get(v, INF):",
        "                g[v] = g[u] + w",
        "                heapq.heappush(open_, (h(v), v))",
        "    return None",
      ],
      a: 10,
      why: "The priority must be <code>g[v] + h(v)</code>. Ranking by <code>h</code> alone only chases whatever looks nearest to the goal and ignores what it cost to get there, so the first time the goal is popped the route can be long.",
    },
    {
      type: "mcq",
      q: "G is walled in, with the opening on the far side. A* uses Manhattan distance, yet expands almost as many cells as Dijkstra (see the counts). Why?",
      fig: pocketFig,
      o: [
        "Manhattan distance ignores walls, so cells in front of them look close",
        "A* must expand every cell on the map once before it can return a path",
        "The heuristic is inadmissible here, so A* quietly falls back to Dijkstra",
        "Dijkstra's search was stopped early so that the comparison looks fair",
      ],
      a: 0,
      why: "h only counts squares, so every cell next to the wall looks only a few steps from G while the real way round is long. A* keeps expanding them until f finally exceeds the length of the route round the back. The heuristic is still admissible; it is just not informative here.",
    },
    {
      type: "pick",
      q: "Moves can now be <b>diagonal</b>, costing 1 each, and the heuristic is still Manhattan distance to G (shown in each cell). Click every cell where the heuristic <b>overestimates</b> the true remaining cost.",
      fig: diagFig,
      a: ["b", "d", "e"],
      hint: "With diagonal steps, a cell 2 right and 2 up needs just 2 moves, not 4.",
      why: "A diagonal move covers one square across and one up for a single step, so the true cost is max(|dx|, |dy|). Cell b is 2 across and 2 up (true cost 2, h = 4), d is 4 and 2 (true 4, h = 6), e is 1 and 1 (true 1, h = 2). Cells on a straight line from G (a, c, f) are fine. Manhattan distance is only admissible with 4-way moves.",
    },
    {
      type: "match",
      q: "Match each heuristic with how A* behaves on an open grid with 4-way moves.",
      pairs: [
        ["h = 0 everywhere", "Same as Dijkstra: spreads out in a diamond"],
        ["Manhattan distance", "Still shortest, with far fewer cells expanded"],
        ["3 × Manhattan distance", "Very fast, but may return a longer path"],
        ["h = the exact remaining cost", "Heads almost straight down a shortest path"],
      ],
      why: "A* is a dial. 0 gives no guidance. A good admissible h gives guidance without losing optimality. Overestimating buys speed but breaks the guarantee. A perfect h removes all the wasted work.",
    },
  ]);

  /* =====================================================================
     Lecture 2: routing
     ===================================================================== */
  const dvFig = (() => {
    const nb = [
      ["B", 2, 4],
      ["C", 3, 5],
      ["D", 3, 4],
      ["E", 1, 6],
    ];
    let s = `<rect x="4" y="74" width="112" height="86" rx="12" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(60, 104, "Router A", { sz: 14, c: "var(--blue-ink)" })}${tx(60, 126, "route to X:", { sz: 12, c: "var(--text-dim)" })}${tx(60, 146, "cost 7, via D", { sz: 13 })}`;
    nb.forEach(([n, link, adv], i) => {
      const y = 8 + i * 60;
      s += `<line x1="116" y1="117" x2="204" y2="${y + 24}" stroke="var(--line-2)" stroke-width="3"/>${tx(160, 117 + (y + 24 - 117) * 0.5 - 6, "link " + link, { sz: 12, c: "var(--text-dim)" })}`;
      s += `<g data-pick="${n}"><rect x="204" y="${y}" width="192" height="48" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(300, y + 20, "Router " + n + " advertises", { sz: 12, c: "var(--text-dim)" })}${tx(300, y + 39, '"X is ' + adv + ' away"', { sz: 14 })}</g>`;
    });
    return svg(400, 250, s, true);
  })();
  const poisonFig = (() => {
    const rows = [
        ["X", 3, "A"],
        ["Y", 2, "C"],
        ["Z", 5, "A"],
        ["W", 1, "D"],
        ["V", 4, "C"],
      ],
      cx = [60, 170, 290];
    let s = ["Destination", "Cost", "Next hop"]
      .map((h, k) => tx(cx[k], 18, h, { sz: 12, c: "var(--text-dim)" }))
      .join("");
    rows.forEach(([d, c, n], i) => {
      const y = 28 + i * 38;
      s += `<g data-pick="${d}"><rect x="8" y="${y}" width="344" height="32" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(cx[0], y + 21, d, { sz: 15 })}${tx(cx[1], y + 21, c, { sz: 15, f: "var(--mono)" })}${tx(cx[2], y + 21, n, { sz: 15 })}</g>`;
    });
    return (
      `<div class="faint" style="font-weight:800;margin-bottom:6px">Router B's own routing table</div>` +
      svg(360, 222, s, true)
    );
  })();
  const failG = { A: [60, 130], B: [200, 45], C: [190, 130], E: [200, 220], D: [340, 130], F: [470, 130] };
  const failFig = Qf.graph(
    failG,
    [
      ["A", "B", 2],
      ["A", "C", 1],
      ["A", "E", 1],
      ["B", "F", 3],
      ["C", "D", 2],
      ["D", "F", 1],
      ["E", "F", 7],
    ],
    { pick: "nodes", w: 520, h: 260, hl: { "C-D": "var(--rose)", F: "var(--amber)" } },
  );

  B.add("a2-routing", [
    {
      type: "pick",
      q: "Router A currently reaches X at cost 7 (via D). The four neighbours below have just sent their latest distance-vector advertisements. Click the one whose message makes A <b>switch</b> to a new route.",
      fig: dvFig,
      a: "B",
      hint: "For each neighbour, add the link cost to the distance it advertises. Switch only if the total is strictly below 7.",
      why: "Via B: 2 + 4 = 6, which beats 7. C gives 3 + 5 = 8 (worse). D gives 3 + 4 = 7, the route A already uses. E gives 1 + 6 = 7, a tie: no improvement, so A keeps what it has.",
    },
    {
      type: "order",
      q: "A link in a link-state network fails. Put the recovery in order.",
      items: [
        "A router next to the failed link notices it has stopped answering",
        "It floods a new link-state message to every router",
        "Each router updates its own copy of the network map",
        "Each router re-runs Dijkstra on the updated map",
        "Forwarding tables switch to the new shortest paths",
      ],
      why: "The news travels first (flooding), then every router independently recomputes from the same shared map. No router has to trust a neighbour's maths, which is why link-state recovers without counting to infinity.",
    },
    {
      type: "pick",
      q: "Router B is about to send its table to its neighbour A. With <b>poisoned reverse</b>, click every destination that B advertises to A as unreachable (∞).",
      fig: poisonFig,
      a: ["X", "Z"],
      hint: "Which routes does B reach <i>through A</i>?",
      why: "B reaches X and Z through A. Telling A 'I can get to X in 3' would invite A to route back through B, creating a loop. So B says ∞ for those two. Routes via C or D, and W, are safe to advertise normally.",
    },
    {
      type: "pick",
      q: "All routers use link-state routing towards F (link costs shown). The red link C–D fails and everyone recomputes. Click every router, apart from F, whose <b>next hop</b> towards F changes.",
      fig: failFig,
      a: ["A", "C"],
      hint: "Work out the cheapest path to F for A, B, C and E before and after the failure.",
      why: "Before: A uses C (1 + 2 + 1 = 4) and C uses D. After: C must go back via A, and A uses B instead (2 + 3 = 5). B reaches F directly and D's road is unaffected. E's cost rises from 5 to 6, but its best next hop is still A, so only its cost changes.",
    },
    {
      type: "bug",
      q: "A distance-vector router handles an advertisement from a neighbour. The router keeps picking routes that look far too cheap. Click the faulty line.",
      code: [
        "def on_advert(table, neighbour, link_cost, advert):",
        "    for dest, cost in advert.items():",
        "        new_cost = cost",
        "        if new_cost < table.get(dest, INF):",
        "            table[dest] = new_cost",
      ],
      a: 2,
      why: "The neighbour reports its own distance to the destination. Reaching it costs the link to the neighbour <i>plus</i> that distance: <code>new_cost = link_cost + cost</code>. Without it, a far-away destination looks as close as it is to the neighbour.",
    },
  ]);

  /* =====================================================================
     Lecture 3: linear programming
     ===================================================================== */
  const lpBase = (xmax, ymax, w, h) => {
    const sx = (w - 60) / xmax,
      sy = (h - 56) / ymax,
      X = (x) => 40 + x * sx,
      Y = (y) => h - 30 - y * sy;
    let s = "";
    for (let i = 0; i <= xmax; i++)
      s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(ymax)}" stroke="var(--line)"/>${tx(X(i), Y(0) + 16, i, { sz: 11, c: "var(--text-dim)" })}`;
    for (let i = 0; i <= ymax; i++)
      s += `<line x1="${X(0)}" y1="${Y(i)}" x2="${X(xmax)}" y2="${Y(i)}" stroke="var(--line)"/>${tx(X(0) - 16, Y(i) + 4, i, { a: "end", sz: 11, c: "var(--text-dim)" })}`;
    s +=
      tx(X(xmax) - 6, Y(0) + 28, "x", { sz: 12, c: "var(--text-dim)" }) +
      tx(X(0) - 30, Y(ymax) + 4, "y", { sz: 12, c: "var(--text-dim)" });
    return { X, Y, s };
  };
  const minFig = (() => {
    const w = 440,
      h = 330,
      { X, Y, s } = lpBase(7, 7, w, h);
    const poly = [
      [4, 0],
      [5, 0],
      [5, 5],
      [0, 5],
      [0, 4],
    ];
    let o =
      s +
      `<polygon points="${poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3"/>`;
    o +=
      tx(X(2.5) + 24, Y(2.5) + 4, "feasible region", { sz: 12, c: "var(--teal-ink)" }) +
      tx(X(1), Y(2) + 4, "x + y ≥ 4", { sz: 12, c: "var(--text-dim)" });
    o +=
      tx(X(5) + 8, Y(6.3), "x ≤ 5", { a: "start", sz: 12, c: "var(--text-dim)" }) +
      tx(X(6.9), Y(5) - 6, "y ≤ 5", { a: "end", sz: 12, c: "var(--text-dim)" });
    const off = {
      "4,0": [4, -18, "start"],
      "5,0": [16, -10, "start"],
      "5,5": [16, -6, "start"],
      "0,5": [18, -12, "start"],
      "0,4": [20, -2, "start"],
    };
    poly.forEach(([x, y]) => {
      const [dx, dy, an] = off[x + "," + y];
      o += `<g data-pick="${x},${y}"><circle cx="${X(x)}" cy="${Y(y)}" r="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(X(x) + dx, Y(y) + dy, `(${x}, ${y})`, { sz: 12, c: "var(--text)", a: an })}</g>`;
    });
    return svg(w, h, o, true);
  })();
  const feasFig = (() => {
    const w = 450,
      h = 320,
      { X, Y, s } = lpBase(9, 8, w, h);
    let o = s;
    o += `<line x1="${X(0)}" y1="${Y(8)}" x2="${X(8)}" y2="${Y(0)}" stroke="var(--blue)" stroke-width="3"/>${tx(X(1.5) + 6, Y(6.5) - 8, "x + y = 8", { sz: 12, c: "var(--blue-ink)", a: "start" })}`;
    o += `<line x1="${X(6)}" y1="${Y(0)}" x2="${X(6)}" y2="${Y(8)}" stroke="var(--violet)" stroke-width="3"/>${tx(X(6) + 6, Y(7.5), "x = 6", { sz: 12, c: "var(--violet-ink)", a: "start" })}`;
    o += `<line x1="${X(0)}" y1="${Y(5)}" x2="${X(9)}" y2="${Y(5)}" stroke="var(--amber)" stroke-width="3"/>${tx(X(8.9), Y(5) - 7, "y = 5", { sz: 12, c: "var(--amber-ink)", a: "end" })}`;
    [
      ["A", 2, 2],
      ["B", 6, 3],
      ["C", 6, 2],
      ["D", 3, 6],
      ["E", 1, 5],
      ["F", 5, 4],
    ].forEach(([id, x, y]) => {
      o += `<g data-pick="${id}"><circle cx="${X(x)}" cy="${Y(y)}" r="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(X(x), Y(y) + 5, id, { sz: 13 })}</g>`;
    });
    return svg(w, h, o, true);
  })();
  const bindFig = (() => {
    const w = 450,
      h = 320,
      { X, Y, s } = lpBase(8, 7, w, h);
    const poly = [
      [0, 0],
      [5, 0],
      [5, 2],
      [3, 4],
      [0, 4],
    ];
    let o =
      s +
      `<polygon points="${poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--teal-dim)" stroke="none" opacity="0.8"/>`;
    const line = (id, x1, y1, x2, y2, col, label, lx, ly, anchor) =>
      `<g data-pick="${id}"><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${col}" stroke-width="3"/><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="transparent" stroke-width="18"/><rect x="${X(lx) - label.length * 3.4 - 6}" y="${Y(ly) - 11}" width="${label.length * 6.8 + 12}" height="22" rx="8" fill="var(--panel)" stroke="${col}" stroke-width="2"/>${tx(X(lx), Y(ly) + 4, label, { sz: 12, c: col })}</g>`;
    o += line("oven", 0, 7, 7, 0, "var(--blue)", "Oven hours: x + y ≤ 7", 6.1, 0.9, "start");
    o += line("demx", 5, 0, 5, 7, "var(--violet)", "Demand for X: x ≤ 5", 5, 6.5, "start");
    o += line("demy", 0, 4, 8, 4, "var(--amber)", "Demand for Y: y ≤ 4", 1.5, 4, "start");
    o += line("flour", 0, 6, 8, 2, "var(--rose)", "Flour: x + 2y ≤ 12", 6.7, 2.65, "start");
    o += tx(X(1.2), Y(1.6), "feasible", { sz: 12, c: "var(--teal-ink)" });
    return svg(w, h, o, true);
  })();
  const tableauFig = (() => {
    const cx = [40, 112, 164, 216, 268, 320, 372, 450],
      head = ["", "x", "y", "s₁", "s₂", "s₃", "s₄", "RHS"];
    const rows = [
      ["s₁", 2, 1, 1, 0, 0, 0, 10],
      ["s₂", 1, 1, 0, 1, 0, 0, 8],
      ["s₃", "−1", 1, 0, 0, 1, 0, 2],
      ["s₄", 1, 0, 0, 0, 0, 1, 6],
    ];
    let s = head
      .map((h, k) =>
        tx(cx[k], 20, h, { sz: 14, c: k === 1 ? "var(--amber-ink)" : "var(--text-dim)", f: "var(--mono)" }),
      )
      .join("");
    rows.forEach((r, i) => {
      const y = 32 + i * 36;
      s += `<g data-pick="r${i + 1}"><rect x="6" y="${y}" width="484" height="30" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${r.map((v, k) => tx(cx[k], y + 20, v, { sz: 15, f: "var(--mono)", c: k === 0 ? "var(--text-dim)" : "var(--text)" })).join("")}</g>`;
    });
    const zy = 32 + 4 * 36 + 4;
    s +=
      `<rect x="6" y="${zy}" width="484" height="30" rx="9" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/>` +
      ["z", "−4", "−3", 0, 0, 0, 0, 0]
        .map((v, k) =>
          tx(cx[k], zy + 20, v, { sz: 15, f: "var(--mono)", c: k === 0 ? "var(--text-dim)" : "var(--text)" }),
        )
        .join("");
    return svg(496, 214, s, true);
  })();

  B.add("a3-lp", [
    {
      type: "pick",
      q: "A diet plan <b>minimises</b> cost z = 3x + y, subject to x + y ≥ 4, x ≤ 5 and y ≤ 5, with x, y ≥ 0. Click the corner that gives the lowest cost.",
      fig: minFig,
      a: "0,4",
      hint: "Work out 3x + y at each corner. Cheap means small x, because x costs 3 per unit.",
      why: "Costs: (4, 0) = 12, (5, 0) = 15, (5, 5) = 20, (0, 5) = 5, (0, 4) = 4. The minimum is at <b>(0, 4)</b>. The origin would be cheapest of all, but it isn't feasible: it breaks x + y ≥ 4.",
    },
    {
      type: "pick",
      q: "A planner has three limits: x + y ≤ 8, x ≤ 6 and y ≤ 5 (all with x, y ≥ 0). Click every plan (point) that satisfies <b>all</b> of them.",
      fig: feasFig,
      a: ["A", "C", "E"],
      hint: "Read each point's coordinates from the axes, then test it against all three rules. A point exactly on a line still counts.",
      why: "A (2, 2) and E (1, 5) pass everything. C (6, 2) sits exactly on x = 6 and on x + y = 8, which is allowed with ≤. B (6, 3) and F (5, 4) both total 9, too much. D (3, 6) breaks y ≤ 5.",
    },
    {
      type: "cat",
      q: "Sort each linear program by the kind of outcome a solver reports.",
      buckets: ["One best corner", "A whole edge ties", "No answer"],
      items: [
        ["Maximise 2x + y subject to x + y ≤ 4, x, y ≥ 0", 0],
        ["Maximise x + y subject to x + y ≤ 4, x, y ≥ 0", 1],
        ["Minimise x + y subject to x + y ≥ 3, x, y ≥ 0", 1],
        ["Minimise x + y subject to x ≥ 1, y ≥ 1", 0],
        ["Maximise x + y subject to x ≥ 1, y ≥ 1", 2],
        ["Maximise x subject to x ≤ 2 and x ≥ 3", 2],
      ],
      why: "2x + y is best at (4, 0) alone (value 8). Whenever the objective line is parallel to a boundary edge, every point on that edge ties (x + y = 4, or x + y = 3). Minimising x + y with x, y ≥ 1 stops at (1, 1). Maximising it with only lower bounds can grow forever (unbounded), and x ≤ 2 with x ≥ 3 is impossible (infeasible).",
    },
    {
      type: "pick",
      q: "Simplex maximises z = 4x + 3y. The most negative entry in the z row is −4, so <b>x enters</b>. Click the row that must leave (the one that stops x rising first). Rows read as constraints, for example row s₁: 2x + y + s₁ = 10.",
      fig: tableauFig,
      a: "r1",
      hint: "For each row with a positive x entry, divide the right-hand side by it. The smallest ratio wins. A negative entry puts no limit on x.",
      why: "Ratios: s₁ gives 10 ÷ 2 = 5, s₂ gives 8 ÷ 1 = 8 and s₄ gives 6 ÷ 1 = 6. Row s₃ has −1 for x, so raising x only makes it looser: no limit. The smallest ratio, 5, belongs to s₁, so x can only rise to 5 before that constraint binds. Picking any other row would push s₁ negative (infeasible).",
    },
    {
      type: "pick",
      q: "Profit is z = 3x + 2y. Find the best corner of the shaded region, then click every constraint that is <b>binding</b> there (the ones that stop profit rising).",
      fig: bindFig,
      a: ["demx", "oven"],
      hint: "Corners: (5, 0), (5, 2), (3, 4), (0, 4). Work out z at each one.",
      why: "z at the corners: (5, 0) = 15, (5, 2) = 19, (3, 4) = 17, (0, 4) = 8. The best is (5, 2), where x = 5 and x + y = 7 meet: demand for X and the oven are binding. The flour line is never even touched by the region, and the y ≤ 4 line is not reached at (5, 2), so both have slack.",
    },
    {
      type: "bug",
      q: "This brute-force solver maximises c·(x, y) over every point where two constraint lines cross, yet it sometimes returns a plan that breaks a constraint. Click the faulty line.",
      code: [
        "def best_corner(lines, c):",
        '    best, best_z = None, float("-inf")',
        "    for (x, y) in intersections(lines):",
        "        z = c[0] * x + c[1] * y",
        "        if z > best_z:",
        "            best, best_z = (x, y), z",
        "    return best",
      ],
      a: 4,
      why: "Crossing points of constraint lines are only <i>candidates</i>. Many lie outside the feasible region. The test must be <code>if feasible(x, y, lines) and z &gt; best_z:</code>, so only genuine corners compete.",
    },
  ]);
})();

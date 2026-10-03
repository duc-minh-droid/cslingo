(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { PENT, ln, path, rng, svg, tx } = partScope;
  const B = NIC.bank;

  /* ======================================================================
     l3-landscape
     ====================================================================== */
  const decFn = (x) => 0.55 * Math.exp(-(((x - 0.25) / 0.14) ** 2)) + 1.0 * Math.exp(-(((x - 0.8) / 0.06) ** 2)) + 0.05;
  const deceptiveFig = () => {
    const X = (x) => 16 + x * 528,
      Y = (v) => 168 - v * 130;
    const d = Array.from(
      { length: 201 },
      (_, i) => `${i ? "L" : "M"}${X(i / 200).toFixed(1)} ${Y(decFn(i / 200)).toFixed(1)}`,
    ).join(" ");
    const starts = [
      [0.12, "1"],
      [0.3, "2"],
      [0.42, "3"],
      [0.72, "4"],
      [0.9, "5"],
    ];
    return svg(
      560,
      212,
      `<path d="${d} L${X(1)} 168 L${X(0)} 168 Z" fill="var(--teal-dim)"/><path d="${d}" fill="none" stroke="var(--teal)" stroke-width="3"/>
      ${starts.map(([x, id]) => `<g data-pick="${id}"><circle cx="${X(x)}" cy="${Y(decFn(x))}" r="13" fill="var(--panel)" stroke="var(--rose)" stroke-width="3"/>${tx(X(x), Y(decFn(x)) + 5, id, { f: "900 12px", c: "var(--ink)" })}</g>`).join("")}
      ${tx(280, 200, "position in the search space", { f: "700 11px", c: "var(--text-faint)" })}`,
    );
  };
  const traceFig = () => {
    const X = (s) => 44 + s * 4,
      Y = (v) => 180 - v * 1.6,
      A = [],
      Bp = [],
      r = rng(5);
    let b = 15;
    for (let s = 0; s <= 100; s += 2) {
      A.push([X(s), Y(Math.min(72, 15 + 57 * (1 - Math.exp(-s / 7))))]);
      if (s % 6 === 0 && r() < 0.55) b += 1 + Math.floor(r() * 5);
      Bp.push([X(s), Y(Math.min(b, 46))]);
    }
    return svg(
      480,
      222,
      `${ln(44, 180, 450, 180, "var(--line-2)", 2)}${ln(44, 20, 44, 180, "var(--line-2)", 2)}${path(A, "var(--blue)")}${path(Bp, "var(--amber)")}
      ${tx(X(100) + 14, A[A.length - 1][1] + 4, "A", { c: "var(--blue-ink)", f: "900 15px" })}${tx(X(100) + 14, Bp[Bp.length - 1][1] + 4, "B", { c: "var(--amber-ink)", f: "900 15px" })}
      ${tx(247, 210, "evaluations used", { f: "700 12px", c: "var(--text-faint)" })}<text transform="translate(14,100) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">best fitness so far</text>`,
    );
  };
  const cubeFig = () => {
    const F = { "000": 1, "001": 4, "010": 2, "011": 3, 100: 5, 101: 2, 110: 6, 111: 3 };
    const P = (s) => {
      const [a, b, c] = s.split("").map(Number);
      return [70 + 170 * c + 120 * a, 245 - 120 * b - 80 * a];
    };
    const keys = Object.keys(F),
      edges = [];
    keys.forEach((u) =>
      keys.forEach((v) => {
        if (u < v && [...u].filter((ch, i) => ch !== v[i]).length === 1) edges.push([u, v]);
      }),
    );
    return svg(
      440,
      290,
      `${edges.map(([u, v]) => ln(...P(u), ...P(v), "var(--line-2)", 3)).join("")}
      ${keys
        .map((k) => {
          const [x, y] = P(k);
          return `<g data-pick="${k}"><circle cx="${x}" cy="${y}" r="26" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(x, y - 3, k, { f: "800 12px", c: "var(--text-dim)" })}${tx(x, y + 13, "f = " + F[k], { f: "900 13px", c: "var(--ink)" })}</g>`;
        })
        .join("")}`,
    );
  };

  B.add("l3-landscape", [
    {
      type: "pick",
      q: "A hillclimber that only takes small steps uphill is started at each numbered dot in turn. Click every start from which it ends on the tallest peak.",
      fig: deceptiveFig(),
      a: ["4", "5"],
      why: "Starts 1, 2 and 3 slope up to the broad, lower hill on the left. Only starts 4 and 5 lie on the narrow tall peak's slopes. The tallest peak has a tiny basin, so most random starts (and the obvious uphill direction) lead away from it. That is a deceptive landscape.",
    },
    {
      type: "mcq",
      q: "Run A and Run B tackle the same landscape with the same evaluation budget. One uses small local mutations, the other a mutation that jumps to anywhere. Which reading of the chart is best?",
      fig: traceFig(),
      o: [
        "A uses small steps and gets stuck on a peak; B uses random jumps and gains slowly",
        "A uses random jumps, because it improves faster; B uses small steps and is slower",
        "A uses small steps, and its flat finish shows it has reached the global optimum",
        "Both use small steps, and B simply started on a much worse hill than A did",
      ],
      a: 0,
      why: "Small steps exploit local smoothness, so progress is quick, but it ends on the first peak it reaches (the flat line). A random jump is like random sampling: most jumps land somewhere poor, so best-so-far creeps up slowly, though it never gets trapped.",
    },
    {
      type: "bug",
      q: "A student tunes a number x in [0, 100] with a hillclimber, but it climbs no better than random guessing. Click the faulty line.",
      code: [
        "x = random.uniform(0, 100)",
        "for step in range(500):",
        "    m = random.uniform(0, 100)",
        "    if f(m) >= f(x):",
        "        x = m",
        "return x",
      ],
      a: 2,
      why: "A mutant should be a small change to x, for example x plus a small random amount. Line 3 picks a fresh random position anywhere, which throws away the smoothness of the landscape: the climber is just sampling at random and keeping the best.",
    },
    {
      type: "pick",
      q: "Each corner is a 3-bit solution with its fitness (higher is better). A mutation flips one bit, so neighbours are joined by a line. Click every local optimum.",
      fig: cubeFig(),
      a: ["001", "110"],
      hint: "For each corner check its three neighbours (the corners it is joined to). A local optimum has no neighbour with a higher f.",
      why: "001 (f = 4) has neighbours 000 (1), 011 (3) and 101 (2). 110 (f = 6) has neighbours 111 (3), 100 (5) and 010 (2). Everything else has a higher neighbour. 110 is the global optimum and 001 is a local trap.",
    },
    {
      type: "slider",
      q: "A mutation jumps uniformly to anywhere in the search space. Only 2% of all solutions are good. About how many jumps do you expect before one lands on a good solution?",
      min: 0,
      max: 200,
      step: 5,
      ans: 50,
      tol: 20,
      unit: "jumps",
      hint: "Two in every hundred is one in fifty.",
      why: "A 2% chance per jump means about 1 in 50 on average: roughly 50 jumps. In real problems the good region is often far smaller than 2%, which is why uncontrolled random jumps are such a poor mutation.",
    },
  ]);

  /* ======================================================================
     l3-neighbourhood
     ====================================================================== */
  const nbGraphFig = () => {
    const N = { P: 3, Q: 5, R: 4, S: 7, T: 6, U: 2, V: 8 },
      ks = Object.keys(N),
      X = (i) => 40 + i * 63,
      Y = 120;
    const solid = ks
      .slice(0, -1)
      .map((k, i) => ln(X(i), Y, X(i + 1), Y, "var(--line-2)", 3))
      .join("");
    const dash = `<path d="M${X(1)} ${Y - 22} Q${(X(1) + X(3)) / 2} ${Y - 84} ${X(3)} ${Y - 22}" fill="none" stroke="var(--violet)" stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round"/>`;
    const nodes = ks
      .map(
        (k, i) =>
          `<g data-pick="${k}"><circle cx="${X(i)}" cy="${Y}" r="22" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(X(i), Y + 5, k, { f: "900 15px", c: "var(--ink)" })}${tx(X(i), Y + 44, "f = " + N[k], { f: "800 13px", c: "var(--text-dim)" })}</g>`,
      )
      .join("");
    return svg(
      460,
      190,
      `${solid}${dash}${nodes}${tx(X(2), 24, "new move", { c: "var(--violet-ink)", f: "800 12px" })}`,
    );
  };
  const gridFig = () => {
    const G = [
      [3, 4, 2, 1],
      [5, 6, 3, 4],
      [2, 3, 7, 5],
      [1, 4, 6, 8],
    ];
    return svg(
      340,
      300,
      G.map((row, r) =>
        row
          .map(
            (v, c) =>
              `<g data-pick="r${r}c${c}"><rect x="${20 + c * 76}" y="${10 + r * 70}" width="68" height="62" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(54 + c * 76, 48 + r * 70, v, { f: "900 20px", c: "var(--ink)" })}</g>`,
          )
          .join(""),
      ).join(""),
    );
  };

  B.add("l3-neighbourhood", [
    {
      type: "pick",
      q: "Seven solutions are linked by the moves of a mutation operator (solid lines); higher f is better. The purple dashed link is an extra move allowed by a new operator. Click every local optimum once both solid and dashed moves are allowed.",
      fig: nbGraphFig(),
      a: ["S", "V"],
      why: "With the solid moves alone Q (5), S (7) and V (8) are local optima. The new move lets Q step to S (7), so Q stops being a local optimum. S and V still have no better neighbour. Changing the operator changed which solutions are traps.",
    },
    {
      type: "cat",
      q: "How does the neighbourhood size grow as the solution gets longer (n bits or n cities)?",
      buckets: ["Constant", "About n", "About n²", "Exponential (about 2ⁿ)"],
      items: [
        ["Flip only the first bit of an n-bit string", 0],
        ["Flip any one bit of an n-bit string", 1],
        ["Swap two adjacent cities in an n-city tour (with wrap-around)", 1],
        ["Swap any two cities in an n-city tour", 2],
        ["Flip any two bits of an n-bit string", 2],
        ["Replace the string with any other n-bit string", 3],
      ],
      why: "One choice among n positions gives about n neighbours. Choosing a pair of positions gives about n²/2. 'Any other string' means all 2ⁿ − 1 other strings. A fixed rule such as 'only the first bit' always gives one neighbour.",
    },
    {
      type: "bug",
      q: "This function should say whether s is a local optimum when minimising cost. It sometimes says True for a tour that has a better neighbour. Click the faulty line.",
      code: [
        "def is_local_optimum(s):",
        "    for m in neighbours(s):",
        "        if cost(m) < cost(s):",
        "            return False",
        "        else:",
        "            return True",
        "    return True",
      ],
      a: 5,
      why: "Returning True inside the loop ends the check after the first neighbour. The answer must be True only after every neighbour has been looked at and none was better, so that return belongs after the loop.",
    },
    {
      type: "pick",
      q: "The current tour is ABCDE. A mutation swaps the neighbours B and C, and the new tour ACBDE is drawn. Click the hops in the new tour that were not in ABCDE.",
      fig: NIC.qfig.graph(
        PENT,
        [
          ["A", "C"],
          ["C", "B"],
          ["B", "D"],
          ["D", "E"],
          ["E", "A"],
        ],
        { pick: "edges", w: 460, h: 262 },
      ),
      a: ["A-C", "B-D"],
      hint: "ABCDE has the hops A–B, B–C, C–D, D–E and E–A. Compare with the five hops drawn.",
      why: "A–C and B–D are new. C–B is the old hop B–C driven backwards, and D–E and E–A are unchanged. Only two hops differ, so a neighbour's length can be found by adjusting two terms rather than adding up the whole tour.",
    },
    {
      type: "pick",
      q: "The grid shows the fitness (higher is better) for two settings dials. A move changes one dial by one notch: up, down, left or right. Click every cell that is a local optimum with those four moves but would stop being one if diagonal moves were also allowed.",
      fig: gridFig(),
      a: ["r1c1", "r2c2"],
      hint: "For each cell look at all eight surrounding cells. Which cells have a higher diagonal neighbour?",
      why: "The 6 at row 2, column 2 has all four straight neighbours lower, but the 7 sits diagonally. The 7 is likewise beaten diagonally by the 8. The 8 is still best, so it stays a local optimum. More allowed moves means fewer local optima.",
    },
  ]);

  /* ======================================================================
     l3-local
     ====================================================================== */
  const tabuFig = () => {
    const C = [8, 6, 4, 5, 7, 3, 5],
      X = (i) => 40 + i * 63,
      Y = 120;
    return svg(
      460,
      190,
      `${C.slice(0, -1)
        .map((_, i) => ln(X(i), Y, X(i + 1), Y, "var(--line-2)", 3))
        .join("")}
      ${C.map((c, i) => `<g data-pick="n${i + 1}"><circle cx="${X(i)}" cy="${Y}" r="22" fill="var(--panel)" stroke="${i === 2 ? "var(--rose)" : "var(--line-2)"}" stroke-width="3"/>${tx(X(i), Y + 5, i + 1, { f: "900 15px", c: "var(--ink)" })}${tx(X(i), Y + 44, "cost " + c, { f: "800 12px", c: "var(--text-dim)" })}</g>`).join("")}${tx(X(2), Y - 36, "start", { c: "var(--rose-ink)", f: "800 13px" })}`,
    );
  };
  const mcTraces = () => {
    const cost = (x) => Math.abs(x - 70) * 0.6 + 7 * Math.sin(x / 3.2) + 10;
    const sim = (p, seed) => {
      const r = rng(seed);
      let x = 30;
      const out = [cost(x)];
      for (let i = 0; i < 90; i++) {
        const m = Math.max(0, Math.min(100, x + (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * 5))));
        if (cost(m) <= cost(x) || r() < p) x = m;
        out.push(cost(x));
      }
      return out;
    };
    const runs = [
      ["A", sim(1, 42)],
      ["B", sim(0, 42)],
      ["C", sim(0.1, 42)],
    ];
    const lo = Math.min(...runs.flatMap((r) => r[1])),
      hi = Math.max(...runs.flatMap((r) => r[1]));
    return svg(
      480,
      200,
      runs
        .map(([nm, d], k) => {
          const x0 = 14 + k * 156,
            X = (i) => x0 + 22 + (i / 90) * 120,
            Y = (v) => 150 - ((v - lo) / (hi - lo)) * 110;
          return `${ln(x0 + 22, 150, x0 + 142, 150, "var(--line-2)", 2)}${ln(x0 + 22, 30, x0 + 22, 150, "var(--line-2)", 2)}${path(
            d.map((v, i) => [X(i), Y(v)]),
            "var(--blue)",
            2.5,
          )}${tx(x0 + 82, 22, "Run " + nm, { f: "900 14px" })}${tx(x0 + 82, 172, "steps", { f: "700 11px", c: "var(--text-faint)" })}`;
        })
        .join("") +
        `<text transform="translate(8,95) rotate(-90)" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">current cost</text>`,
    );
  };
  const logFig = () => {
    const R = [
      [1, 12, 10, "yes"],
      [2, 10, 13, "no"],
      [3, 10, 11, "yes"],
      [4, 11, 11, "yes"],
      [5, 11, 9, "yes"],
      [6, 9, 14, "yes"],
    ];
    const cols = [40, 140, 260, 380];
    return svg(
      460,
      270,
      ["step", "current cost", "candidate cost", "moved?"]
        .map((h, i) => tx(cols[i], 20, h, { f: "700 11px", c: "var(--text-faint)" }))
        .join("") +
        R.map(
          (r, i) =>
            `<g data-pick="s${r[0]}"><rect x="10" y="${30 + i * 39}" width="440" height="34" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${r.map((v, j) => tx(cols[j], 53 + i * 39, v, { f: "900 15px", c: "var(--ink)" })).join("")}</g>`,
        ).join(""),
    );
  };

  B.add("l3-local", [
    {
      type: "pick",
      q: "Cost is to be minimised. Tabu search starts at solution 3, always moves to the cheapest neighbour that is not tabu (even if that costs more), and the tabu list holds the last two solutions it left. Click the solution it is on after three moves.",
      fig: tabuFig(),
      a: "n6",
      hint: "Move 1: from 3, the neighbours cost 6 and 5, so go to 4 (cost 5); 3 is now tabu. Move 2: from 4 the neighbours are 3 (tabu) and 5. Move 3: from 5, which neighbours are tabu?",
      why: "3 → 4 (cost 5), then 4 → 5 (cost 7, since 3 is tabu), then 5 → 6 (cost 3, since 4 is tabu). The tabu list forces it up and over the bump, which a plain hillclimber stuck at 3 could never do.",
    },
    {
      type: "match",
      q: "Three runs of Monte Carlo search start from the same solution. They accept a worse neighbour with probability p = 0, p = 0.1 or p = 1. Match each run to its setting.",
      fig: mcTraces(),
      pairs: [
        ["Run A", "p = 1"],
        ["Run B", "p = 0"],
        ["Run C", "p = 0.1"],
      ],
      why: "With p = 0 the cost never rises and the run freezes in the first valley it finds (flat). With p = 1 every move is accepted, so the cost just jitters about with no trend. A small p mostly goes down, but now and then climbs out of a valley to keep exploring.",
    },
    {
      type: "bug",
      q: "This tabu search keeps bouncing back and forth between the same two solutions. Click the faulty line.",
      code: [
        "tabu = []",
        "cur = start",
        "for step in range(steps):",
        "    cands = [m for m in neighbours(cur) if m not in tabu]",
        "    nxt = min(cands, key=cost)",
        "    cur = nxt",
        "    tabu.append(nxt)",
        "    tabu = tabu[-5:]",
      ],
      a: 6,
      why: "The tabu list should hold the places it has just left, so that it can't step straight back. Appending nxt (where it now stands) never blocks the way back. It should append the old solution before cur is changed.",
    },
    {
      type: "pick",
      q: "This log comes from a local-search run that minimises cost. Click every row that proves the run was not plain hillclimbing (which never accepts a worse candidate).",
      fig: logFig(),
      a: ["s3", "s6"],
      why: "In row 3 and row 6 the candidate cost is higher than the current cost, yet it moved. A hillclimber refuses those. Row 4 only moves to an equal cost, which hillclimbing allows, and row 2 refuses a worse one.",
    },
    {
      type: "order",
      q: "Put one step of tabu search in order.",
      items: [
        "List all neighbours of the current solution",
        "Remove the ones on the tabu list",
        "Move to the best of the rest, even if it is worse",
        "Add the solution just left to the tabu list (dropping the oldest)",
        "Update best-so-far if the new solution beats it",
      ],
      why: "Neighbours come first, then tabu ones are filtered out and the best of the remainder is taken. The solution left behind becomes tabu, and the best-so-far record is separate from where the search stands.",
    },
  ]);

  /* ======================================================================
     l3-population
     ====================================================================== */
  const cutFig = () => {
    const P1 = "11110000",
      P2 = "00001111",
      cell = (s, row, y) =>
        s
          .split("")
          .map(
            (b, i) =>
              `<rect x="${110 + i * 40}" y="${y}" width="36" height="36" rx="8" fill="${b === "1" ? "var(--teal)" : "var(--panel)"}" stroke="var(--line-2)" stroke-width="2"/>${tx(128 + i * 40, y + 24, b, { f: "900 16px", c: b === "1" ? "#fff" : "var(--text)" })}`,
          )
          .join("") +
        tx(100, y + 24, row, { a: "end", f: "800 13px" }) +
        tx(444, y + 24, "4 ones", { a: "start", f: "800 12px", c: "var(--text-dim)" });
    const cuts = [1, 2, 3, 4, 5, 6, 7]
      .map(
        (k) =>
          `<g data-pick="c${k}"><rect x="${110 + k * 40 - 22}" y="22" width="24" height="118" fill="transparent"/>${ln(110 + k * 40 - 2, 28, 110 + k * 40 - 2, 134, "var(--violet)", 3, "5 5")}${tx(110 + k * 40 - 2, 158, "cut " + k, { f: "800 11px", c: "var(--violet-ink)" })}</g>`,
      )
      .join("");
    return svg(500, 170, `${cell(P1, "Parent 1", 30)}${cell(P2, "Parent 2", 84)}${cuts}`);
  };
  Object.assign(partScope, { cutFig });
})();

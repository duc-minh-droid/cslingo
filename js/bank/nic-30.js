(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { ci, hit, ln, outcomeFig, pl, rc, rng, svg, tabuFig, treeProbFig, tx } = partScope;
  const B = NIC.bank;

  // real tabu runs on an 8-bit problem (same start, tabu list holds the last 1 or 6 solutions visited)
  const TT = {
    P: [
      57, 39, 41, 48, 41, 45, 45, 47, 49, 58, 45, 44, 36, 40, 29, 38, 37, 31, 37, 27, 31, 36, 41, 43, 45, 37, 32, 45,
      47, 36, 37,
    ],
    Q: [
      57, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48,
      41, 39, 41,
    ],
  };
  const tenureFig = () => {
    const Y = (c) => 130 - (c - 20) * 2.4;
    let s = "";
    [
      ["P", 44],
      ["Q", 270],
    ].forEach(([k, px]) => {
      const X = (i) => px + i * 5.8;
      s +=
        rc(px - 6, 26, 194, 118, { r: 8, s: "var(--line)", f: "var(--bg-2)" }) +
        tx(px + 91, 18, "Run " + k, { f: "900 14px" });
      [30, 40, 50].forEach(
        (v) =>
          (s +=
            ln(px - 4, Y(v), px + 186, Y(v), "var(--line)", 1) +
            (k === "P" ? tx(px - 10, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) : "")),
      );
      s += pl(
        TT[k].map((v, i) => [X(i), Y(v)]),
        k === "P" ? "var(--violet)" : "var(--blue)",
        3,
      );
      s += tx(px + 91, 164, "steps 0 to 30", { f: "700 11px", c: "var(--text-faint)" });
    });
    s += `<text transform="translate(12,85) rotate(-90)" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">cost</text>`;
    s += ["P", "Q"]
      .map((k, i) => hit(k, rc(38 + i * 226, 22, 206, 126, { f: "transparent", s: "transparent", sw: 2, r: 12 })))
      .join("");
    return svg(470, 176, s);
  };

  B.add("l3-local", [
    {
      type: "multi",
      q: "Tabu search keeps the last 3 flipped bits on its list. Each step flips the cheapest bit that is NOT on the list, then adds it to the list (the oldest entry drops out). After this step, which bits will be tabu? Select all.",
      fig: tabuFig(),
      o: ["bit 1", "bit 2", "bit 3", "bit 4", "bit 5", "bit 6"],
      a: [1, 3, 5],
      hint: "Bits 5, 2 and 6 are on the list now, so their savings are not allowed. Pick the best of the rest, then update the list.",
      why: "The cheapest legal move is bit 4 (−1), because bits 2, 5 and 6 are tabu even though they would save more. Flipping bit 4 puts it on the list and pushes out the oldest entry, bit 5. The list is now bit 2, bit 6, bit 4.",
    },
    {
      type: "pick",
      q: "Two Monte Carlo runs each made 100 steps. In every step the run looked at one random neighbour, and the bars sort the outcomes. p is the chance of accepting a worse neighbour. Click the run that used the larger p.",
      fig: outcomeFig(),
      a: "B",
      hint: "p only concerns worse neighbours. For each run: accepted worse ÷ (accepted worse + rejected).",
      why: "Run A met 60 worse neighbours and accepted 24 of them (0.4). Run B met only 30 and accepted 15 (0.5). Run A accepted more worse moves in total, but that is just because it met more of them, so the raw count is misleading. p is the accepted share of the worse neighbours.",
    },
    {
      type: "slider",
      q: "A Monte Carlo search picks one random neighbour per step. A quarter of the neighbours are better; the other three quarters are worse and are accepted with p = 0.2. In about what percentage of steps does the cost go up?",
      fig: treeProbFig(),
      min: 0,
      max: 50,
      step: 1,
      ans: 15,
      tol: 5,
      unit: "%",
      hint: "Follow the lower branch: three quarters of the time, then one fifth of that.",
      why: "The cost goes up only along the path 'worse' (0.75) then 'accept' (0.2): 0.75 × 0.2 = 0.15, so about 15% of steps. The other worse neighbours (0.75 × 0.8 = 0.6) are rejected and the search stays put, and the better ones (0.25) are always taken.",
    },
    {
      type: "pick",
      q: "Two tabu searches start from the same 8-bit solution and always move to the cheapest solution that is not on their list (cost is minimised). One list holds only the last 1 solution visited, the other the last 6. Click the run with the list of 1.",
      fig: tenureFig(),
      a: "Q",
      hint: "A search that can only forbid one solution may soon wander back to where it was.",
      why: "Run Q repeats 41, 39, 41, 48 over and over: with a list of 1 it only avoids going straight back, so it falls into a four-step loop and never improves on 39. Run P's longer memory forbids the places it has just been, so it keeps exploring and finds a cost of 27.",
    },
  ]);

  /* ======================================================================
     l3-population : pixel grid, lineage tree, scatter snapshots, lifespan Gantt
     ====================================================================== */
  const PIX = [
    [1, 0, 1, 1, 0, 0, 1, 0, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
  ];
  const pixFig = () => {
    const C = 28,
      x0 = 54,
      y0 = 40;
    let s = "";
    for (let c = 0; c < 10; c++) s += tx(x0 + c * C + C / 2, 32, c + 1, { f: "700 12px", c: "var(--text-faint)" });
    PIX.forEach((row, r) => {
      s += tx(x0 - 8, y0 + r * C + C / 2 + 5, "M" + (r + 1), { a: "end", f: "800 12px", c: "var(--text-dim)" });
      row.forEach(
        (v, c) =>
          (s +=
            rc(x0 + c * C + 1, y0 + r * C + 1, C - 2, C - 2, {
              f: v ? "var(--blue)" : "var(--bg-2)",
              o: v ? 0.7 : 1,
              s: "var(--line)",
              sw: 1,
              r: 4,
            }) + tx(x0 + c * C + C / 2, y0 + r * C + C / 2 + 5, v, { f: "800 13px" })),
      );
    });
    for (let c = 0; c < 10; c++)
      s += hit(
        "c" + (c + 1),
        rc(x0 + c * C - 1, y0 - 3, C + 2, 6 * C + 6, { f: "transparent", s: "transparent", sw: 2, r: 6 }),
      );
    s += tx(x0 + 5 * C, y0 + 6 * C + 32, "column number", { f: "700 12px", c: "var(--text-faint)" });
    return svg(370, 262, s);
  };

  const LIN = { p1: [1, 1, 1, 3, 1], p2: [0, 1, 3, 0, 2], p3: [0, 0, 2, 3, 4] };
  const lineageFig = () => {
    const X = [60, 170, 280, 390],
      Y = [50, 90, 130, 170, 210],
      P = [LIN.p1, LIN.p2, LIN.p3];
    let s = "";
    P.forEach((par, g) => par.forEach((p, i) => (s += ln(X[g] + 8, Y[p], X[g + 1] - 8, Y[i], "var(--line-2)", 2.5))));
    X.forEach((x, g) => {
      s += tx(x, 22, g === 0 ? "start" : "gen " + g, { f: "700 12px", c: "var(--text-faint)" });
      Y.forEach((y, i) => {
        if (g) s += ci(x, y, 8, { s: "var(--line-2)", sw: 2 });
      });
    });
    "ABCDE"
      .split("")
      .forEach(
        (c, i) =>
          (s += hit(
            c,
            `${ci(X[0], Y[i], 16, { s: "var(--blue)", sw: 3 })}${tx(X[0], Y[i] + 5, c, { f: "900 14px" })}`,
          )),
      );
    s += tx(235, 246, "each dot has one parent: the line to its left", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 256, s);
  };

  const snapFig = () => {
    const R = rng(5),
      rnd = (a, b) => a + R() * (b - a),
      P = { big: [95, 45], small: [38, 98] };
    const dots = {
      A: Array.from({ length: 14 }, () => [rnd(8, 132), rnd(8, 132)]),
      B: [
        ...Array.from({ length: 6 }, () => [P.big[0] + rnd(-9, 9), P.big[1] + rnd(-9, 9)]),
        ...Array.from({ length: 6 }, () => [P.small[0] + rnd(-8, 8), P.small[1] + rnd(-8, 8)]),
      ],
      C: Array.from({ length: 12 }, () => [P.small[0] + rnd(-9, 9), P.small[1] + rnd(-9, 9)]),
    };
    let s = "";
    [
      ["A", 14],
      ["B", 164],
      ["C", 314],
    ].forEach(([k, px]) => {
      s +=
        rc(px, 26, 140, 140, { r: 10, s: "var(--line)", f: "var(--bg-2)" }) +
        tx(px + 70, 18, "Panel " + k, { f: "900 14px" });
      [10, 20, 30].forEach((r) => (s += ci(px + P.big[0], 26 + P.big[1], r, { f: "none", s: "var(--teal)", sw: 1.5 })));
      [8, 16, 24].forEach(
        (r) => (s += ci(px + P.small[0], 26 + P.small[1], r, { f: "none", s: "var(--violet)", sw: 1.5 })),
      );
      dots[k].forEach(
        ([x, y]) => (s += ci(px + x, 26 + y, 4.5, { f: "var(--amber)", s: "var(--amber-ink)", sw: 1.5 })),
      );
    });
    s += tx(235, 186, "rings: contour lines of two hills (tall green, lower purple). Dots: members", {
      f: "700 11px",
      c: "var(--text-faint)",
    });
    return svg(470, 196, s);
  };

  const ganttFig = () => {
    const X = (t) => 60 + t * 62,
      rows = [
        ["P1", 5, 0, 2],
        ["P2", 8, 0, 3],
        ["P3", 3, 0, 1],
        ["P4", 6, 0, 4],
        ["C1", 7, 1, 5],
        ["C2", 9, 2, 6],
        ["C3", 10, 3, 6],
        ["C4", 8, 4, 6],
        ["C5", 12, 5, 6],
      ];
    let s = "";
    for (let t = 0; t <= 6; t++)
      s += ln(X(t), 26, X(t), 238, "var(--line)", 1) + tx(X(t), 18, t, { f: "700 12px", c: "var(--text-faint)" });
    rows.forEach(([id, f, b, d], i) => {
      const y = 30 + i * 23,
        key = id.toLowerCase();
      s += tx(52, y + 15, id, { a: "end", f: "800 12px", c: "var(--text-dim)" });
      s += hit(
        key,
        `${rc(X(b), y, X(d) - X(b), 19, { f: d === 6 ? "var(--teal)" : "var(--blue)", o: 0.25, s: d === 6 ? "var(--teal)" : "var(--blue)", sw: 2.5, r: 6 })}${tx((X(b) + X(d)) / 2, y + 14, f, { f: "900 13px" })}`,
      );
    });
    s += tx(X(3), 256, "time step (one child is born at each step)", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 266, s);
  };

  B.add("l3-population", [
    {
      type: "pick",
      q: "Six members of an EA population are drawn as rows of bits. Click every column where crossover alone can never again produce a different value.",
      fig: pixFig(),
      a: ["c1", "c3", "c5", "c10"],
      hint: "Crossover only copies bits that parents already carry. Which columns have no variety left?",
      why: "Crossover only shuffles values the parents already have. In columns 1, 3, 5 and 10 every member holds the same bit, so every child gets that bit too: only mutation could change it. Column 8 still has one member with a 1, so a child can inherit it, and the rest of the columns are mixed.",
    },
    {
      type: "pick",
      q: "Each dot is one member and has one parent: the line to its left. Starting individuals are A to E. Click every starting individual that has no descendants left in generation 3.",
      fig: lineageFig(),
      a: ["A", "C", "E"],
      hint: "Follow lines rightwards from each start. Which ones never get a line out?",
      why: "A, C and E were never chosen as a parent, so they have no line out at all. B's line branches into most of generation 1, and D's single child survives to generation 3. Only B and D contribute to generation 3, so the population has lost the genes of the other three. Selection alone shrinks diversity over time.",
    },
    {
      type: "match",
      q: "Each panel is a snapshot of an EA population on a landscape with two hills. Match each panel to what it shows.",
      fig: snapFig(),
      pairs: [
        ["Panel A", "Just started: members spread out everywhere"],
        ["Panel B", "Searching both hills at once"],
        ["Panel C", "Converged on the lower hill"],
      ],
      why: "Panel A has members all over the space, as in a random start. Panel B has groups near both peaks, which is a population exploring two hills in parallel (a single hillclimber could only follow one). In panel C every member sits on the lower hill. Unless mutation throws some far away, the taller hill will never be found: premature convergence.",
    },
    {
      type: "pick",
      q: "A steady-state EA with a population of 4 should always replace the weakest member with the new child. Each bar is one individual's life (its fitness inside), and a child is born at each step. Exactly one replacement broke the rule. Click the bar that was replaced wrongly.",
      fig: ganttFig(),
      a: "p2",
      hint: "At step 3, which of the individuals alive had the lowest fitness?",
      why: "At step 3 the population was P2 (8), P4 (6), C1 (7) and C2 (9), so the weakest was P4 (6). But the child replaced P2 (8) and P4 stayed alive until step 4. The earlier replacements were right: the weakest died at steps 1, 2, 4 and 5 (3, 5, 6 and 7).",
    },
  ]);
})();

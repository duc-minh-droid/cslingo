(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { ci, eaFig, hit, ln, mark, pl, rc, recipeFlow, shareFig, stepFig, svg, tx } = partScope;
  const B = NIC.bank;

  B.add("l3-recipe", [
    {
      type: "pick",
      q: "Replacement compares fitness values, yet in this EA the children have never been scored when they reach the Replace step. Click the arrow where a box is missing.",
      fig: recipeFlow(),
      a: "vr",
      hint: "Which step produces new members, and which step needs to compare them with the old ones?",
      why: "Crossover and mutation make brand-new strings with no fitness yet. Replace-the-weakest has to compare a child's fitness with the population's, so a 'Score the children' box must sit on that arrow. The other arrows are fine: the starting population is scored before selection, and the loop-back repeats the cycle.",
    },
    {
      q: "Both lists rank the four members the same way. Under fitness-proportional selection (chance of being picked = fitness ÷ total), which statement is true?",
      fig: shareFig(),
      o: [
        "Population 1 picks almost evenly, so selection there is weak",
        "Both populations favour their best member by the same amount",
        "Population 2 picks its best member about three times as often",
        "Population 1 picks its best member far more often than its worst",
      ],
      a: 0,
      hint: "Population 1's total is 50 + 51 + 52 + 53 = 206. Is 53 out of 206 much more than 50 out of 206?",
      why: "In population 1 the shares are 24%, 25%, 25% and 26%, nearly equal, so selection is almost random even though the ranking is the same. Population 2's shares are 0%, 17%, 33% and 50%. The selection pressure depends on the gaps between fitness values, not just their order, which is why rank-based or tournament selection is often preferred.",
    },
    {
      type: "pick",
      q: "The line is the best fitness found so far in one EA run (higher is better). The rule is: stop as soon as 20 generations pass with no improvement. Click the generation where this run would stop.",
      fig: stepFig(),
      a: "g51",
      hint: "Find the jump that comes before a long flat stretch. Count 20 generations along from there.",
      why: "The last improvement before the long flat patch is at generation 31. Twenty generations later, at 51, nothing has improved, so the run stops. It never sees the improvement at generation 58 (58 up to 63). Waiting 20 generations is a gamble, not a guarantee, and the stalling patch here was 27 generations long.",
    },
    {
      type: "match",
      q: "Each chart tracks one EA on a 40-bit problem. Match each run to the settings that most likely produced it.",
      fig: eaFig(),
      pairs: [
        ["Run A", "Very strong selection, no mutation"],
        ["Run B", "Mutation so heavy that children are nearly random"],
        ["Run C", "Moderate selection and light mutation"],
      ],
      why: "Run A: best and average meet at 33 and stay flat. Copies of one good member fill the population and, with no mutation, nothing new can appear. Run B: the average sits near 20, which is what a random 40-bit string scores, so heavy mutation scrambles every child and progress is lost. Run C: the best keeps rising (28 to 38) and the average follows it up.",
    },
  ]);

  /* ======================================================================
     l3-tsp : triangle heat table, decision tree, worked-example trace, stacked hop bars
     ====================================================================== */
  const TRI = { AB: 4, AC: 7, AD: 5, AE: 6, BC: 3, BD: 8, BE: 2, CD: 4, CE: 9, DE: 3 };
  const triFig = () => {
    const rows = "ABCD".split(""),
      cols = "BCDE".split(""),
      x0 = 66,
      y0 = 44,
      W = 76,
      H = 46;
    let s = "";
    cols.forEach((c, j) => (s += tx(x0 + j * W + W / 2, 34, c, { f: "900 15px" })));
    rows.forEach((r, i) => (s += tx(x0 - 12, y0 + i * H + H / 2 + 5, r, { f: "900 15px" })));
    const ticked = ["AC", "BC", "BE", "DE"];
    rows.forEach((r, i) =>
      cols.forEach((c, j) => {
        if (j + 1 <= i) return;
        const k = r + c,
          d = TRI[k],
          x = x0 + j * W,
          y = y0 + i * H,
          t = ticked.includes(k);
        s += hit(
          k,
          `${rc(x + 2, y + 2, W - 4, H - 4, { f: "var(--blue)", o: 0.1 + d * 0.06, s: t ? "var(--teal)" : "var(--line-2)", sw: t ? 3.5 : 2, r: 8 })}${tx(x + W / 2, y + H / 2 + 6, d, { f: "900 18px" })}${t ? `<path d="M${x + W - 22} ${y + 14} l5 5 l9 -10" fill="none" stroke="var(--teal-ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ""}`,
        );
      }),
    );
    s += tx(x0 + 2 * W, y0 + 4 * H + 24, "Ticked cells add up to 15. Darker blue = farther apart.", {
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(400, 280, s);
  };

  const treeFig = () => {
    const lx = (i) => 48 + i * 72;
    const L1 = [
      [
        "B",
        [
          ["C", "ABCD"],
          ["D", "ABDC"],
        ],
      ],
      [
        "C",
        [
          ["B", "ACBD"],
          ["D", "ACDB"],
        ],
      ],
      [
        "D",
        [
          ["B", "ADBC"],
          ["C", "ADCB"],
        ],
      ],
    ];
    let s = "",
      leaf = 0;
    const rootX = (lx(0) + lx(5)) / 2;
    L1.forEach(([c1, kids], i) => {
      const x1 = (lx(i * 2) + lx(i * 2 + 1)) / 2;
      s += ln(rootX, 34, x1, 82, "var(--line-2)", 2.5);
      kids.forEach(([c2, str]) => {
        const x = lx(leaf++);
        s += ln(x1, 82, x, 138, "var(--line-2)", 2.5) + ln(x, 138, x, 178, "var(--line-2)", 2.5);
      });
    });
    leaf = 0;
    s += ci(rootX, 26, 16, { s: "var(--teal)", sw: 3 }) + tx(rootX, 31, "A", { f: "900 14px" });
    L1.forEach(([c1, kids], i) => {
      const x1 = (lx(i * 2) + lx(i * 2 + 1)) / 2;
      s += ci(x1, 82, 15) + tx(x1, 87, c1, { f: "900 14px" });
      kids.forEach(([c2, str]) => {
        const x = lx(leaf++);
        s +=
          ci(x, 138, 15) +
          tx(x, 143, c2, { f: "900 14px" }) +
          hit(
            str,
            `${rc(x - 31, 178, 62, 30, { r: 9, s: "var(--blue)", sw: 2.5 })}${tx(x, 199, str, { f: "900 14px" })}`,
          );
      });
    });
    s += tx(235, 232, "Each path from the top is one tour that starts at A. The last city is forced.", {
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(470, 242, s);
  };

  const workedFig = () => {
    const st = [
      "List the 7 cities in a row: 7! = 5,040 orders",
      "Any city could start the same loop, so ÷ 6: 840",
      "A loop and its reverse match, so ÷ 2: 420",
      "So there are 420 distinct tours",
    ];
    let s = "";
    st.forEach(
      (t, i) =>
        (s += hit(
          "s" + (i + 1),
          `${rc(10, 8 + i * 56, 440, 46, { r: 12, s: "var(--blue)", sw: 2.5 })}${ci(36, 31 + i * 56, 14, { f: "var(--blue-dim)", s: "var(--blue)", sw: 2 })}${tx(36, 36 + i * 56, i + 1, { f: "900 14px" })}${tx(60, 36 + i * 56, t, { a: "start", f: "800 14px" })}`,
        )),
    );
    return svg(460, 236, s);
  };

  const hopFig = () => {
    const G = [2, 2, 2, 4, 4, 11],
      O = [3, 4, 2, 3, 3, 2],
      U = 14;
    const bar = (t, a, y) => {
      let s = tx(30, y - 10, t, { a: "start", f: "800 13px" }),
        x = 30;
      a.forEach((v, i) => {
        s +=
          rc(x, y, v * U, 40, {
            f: i % 2 ? "var(--teal-dim)" : "var(--blue-dim)",
            s: i % 2 ? "var(--teal)" : "var(--blue)",
            sw: 2.5,
            r: 0,
          }) + tx(x + (v * U) / 2, y + 26, v, { f: "900 14px" });
        x += v * U;
      });
      return s;
    };
    return svg(
      460,
      150,
      bar("Nearest-neighbour tour: the six hops in order", G, 30) + bar("Best tour: the six hops in order", O, 98),
    );
  };

  B.add("l3-tsp", [
    {
      type: "pick",
      q: "The table gives the distance for each pair of five cities. A student adds up the tour A → C → B → E → D → A using the ticked cells, and gets 15. One cell the tour needs is not ticked. Click it.",
      fig: triFig(),
      a: "AD",
      hint: "List the five hops of the closed tour: A–C, C–B, B–E, E–D, and then the hop home.",
      why: "The closed tour uses AC (7), BC (3), BE (2), DE (3) and the way home, D back to A (5). The student ticked only the first four, 15 in all, and forgot the return hop. The true length is 20. A tour is a loop, so the last city always has one more hop back to the start.",
    },
    {
      type: "pick",
      q: "The tree lists every ordered tour of four cities that starts at A. A student writes the loop A → C → D → B → A as ACDB. Click the other leaf that is the same loop travelled the opposite way round.",
      fig: treeFig(),
      a: "ABDC",
      hint: "Read ACDB backwards starting from A: A, then B, then D, then C.",
      why: "Going round the loop the other way from A visits B, D, C: that is ABDC. The six leaves pair up into three loops (ABCD with ADCB, ABDC with ACDB, ACBD with ADBC), so there are 3!/2 = 3 distinct tours, not 6.",
    },
    {
      type: "pick",
      q: "A student works out how many distinct round trips there are for 7 cities. Exactly one step is wrong. Click it.",
      fig: workedFig(),
      a: "s2",
      hint: "Fixing the starting city means dividing by how many cities could have been the start.",
      why: "There are 7 possible starting cities for the same loop, so step 2 should divide by 7, not 6: 5,040 ÷ 7 = 720. Halving for direction gives 360, which is (7 − 1)! ÷ 2. The student's 420 is too big. Step 1 and step 3 are correct.",
    },
    {
      type: "slider",
      q: "Each bar shows the six hop lengths of one tour of the same six cities, in order. About how many per cent longer is the nearest-neighbour tour than the best tour?",
      fig: hopFig(),
      min: 0,
      max: 120,
      step: 5,
      ans: 45,
      tol: 10,
      unit: "%",
      hint: "Add each bar's numbers. A tour 50% longer than 17 would be 25.5.",
      why: "Nearest-neighbour: 2 + 2 + 2 + 4 + 4 + 11 = 25. Best: 3 + 4 + 2 + 3 + 3 + 2 = 17. 25 is about 47% more than 17. The greedy tour spent only 14 on its first five hops, but those cheap hops used up the nearby cities and left a 11-long hop home, longer than any hop of the best tour (its longest is 4).",
    },
  ]);

  /* ======================================================================
     l3-hc : small-multiple runs, restart flow chart, bit-string transitions, scatter
     ====================================================================== */
  const hcF = (x) => (x <= 8 ? x : x <= 24 ? 8 : x - 16); // slope to 8, plateau 8..24, then slope up (x = 30 gives 14)
  const hcRun = (eq, seed, n = 80) => {
    let s = seed;
    const R = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    let x = 0;
    const tr = [hcF(x)];
    for (let i = 0; i < n; i++) {
      const y = x + (R() < 0.5 ? -1 : 1);
      if (y >= 0 && y <= 30 && (hcF(y) > hcF(x) || (eq && hcF(y) === hcF(x)))) x = y;
      tr.push(hcF(x));
    }
    return tr;
  };
  const hcPanels = () => {
    const runs = { A: hcRun(false, 193), B: hcRun(true, 193) },
      Y = (v) => 170 - v * 9;
    let s = "";
    [
      ["A", 40],
      ["B", 270],
    ].forEach(([k, px]) => {
      const X = (e) => px + e * 2.2;
      s +=
        rc(px - 6, 26, 196, 150, { r: 8, s: "var(--line)", f: "var(--bg-2)" }) +
        tx(px + 92, 18, "Run " + k, { f: "900 14px" });
      [0, 7, 14].forEach(
        (v) =>
          (s +=
            ln(px - 4, Y(v), px + 188, Y(v), "var(--line)", 1) +
            (k === "A" ? tx(px - 10, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) : "")),
      );
      s += pl(
        runs[k].map((v, e) => [X(e), Y(v)]),
        k === "A" ? "var(--blue)" : "var(--amber)",
        3.5,
      );
      s += tx(px + 92, 196, "evaluations 0 to 80", { f: "700 11px", c: "var(--text-faint)" });
    });
    s += `<text transform="translate(12,100) rotate(-90)" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">fitness</text>`;
    s += ["A", "B"]
      .map((k, i) =>
        hit("run" + k, rc(34 + i * 230, 22, 208, 158, { f: "transparent", s: "transparent", sw: 2, r: 12 })),
      )
      .join("");
    return svg(470, 206, s);
  };

  const restartFlow = () => {
    const bx = (x, y, a, b) =>
      rc(x - 58, y - 24, 116, 48, { r: 12, s: "var(--violet)", sw: 2.5 }) +
      (b
        ? tx(x, y - 3, a, { f: "800 12px" }) + tx(x, y + 13, b, { f: "800 12px" })
        : tx(x, y + 5, a, { f: "800 13px" }));
    const a1 = (x1, y1, x2, y2) =>
      ln(x1, y1, x2, y2, "var(--text-faint)", 3).replace("/>", ` marker-end="url(#hfa)"/>`);
    let s = mark("hfa");
    const n = (id, x, y, a, b) => hit(id, bx(x, y, a, b));
    s += a1(131, 50, 168, 50) + a1(289, 50, 326, 50) + a1(388, 76, 388, 140) + a1(326, 170, 289, 170);
    s += `<path d="M388 196 V218 H72 V80" fill="none" stroke="var(--text-faint)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#hfa)"/>`;
    s +=
      tx(300, 212, "yes: restart", { f: "700 12px", c: "var(--text-faint)" }) +
      tx(308, 160, "no", { f: "700 12px", c: "var(--text-faint)" });
    s +=
      n("start", 72, 50, "Pick a", "random start") +
      n("climb", 230, 50, "Climb until no", "better neighbour") +
      n("save", 388, 50, "Save the final", "tour as the result") +
      n("time", 388, 170, "Time left?") +
      n("ret", 230, 170, "Return the", "result");
    return svg(470, 232, s);
  };

  const bitsTable = () => {
    const R = [
      ["0100 1010", "0110 1010"],
      ["1011 0001", "1011 0101"],
      ["1110 0000", "1110 0000"],
      ["0111 1100", "0101 1100"],
      ["0001 0110", "1111 0110"],
      ["1100 1111", "1101 1111"],
    ];
    return `<div style="max-width:360px"><table class="t"><tr><th>Row</th><th>Before</th><th>After one step</th></tr>${R.map((r, i) => `<tr><td>${i + 1}</td><td style="font-family:var(--mono);font-weight:800">${r[0]}</td><td style="font-family:var(--mono);font-weight:800">${r[1]}</td></tr>`).join("")}</table></div>`;
  };

  const SC = [
    [5, 40],
    [12, 65],
    [8, 90],
    [20, 40],
    [18, 65],
    [25, 90],
    [30, 40],
    [14, 65],
    [22, 40],
    [35, 65],
    [10, 40],
    [28, 90],
    [33, 40],
    [40, 65],
    [15, 90],
    [37, 40],
    [26, 65],
    [45, 90],
    [9, 40],
    [32, 90],
  ];
  const scatterFig = () => {
    const X = (v) => 56 + v * 7.6,
      Y = (v) => 190 - (v - 30) * 2.4;
    let s = ln(56, 190, 440, 190, "var(--text-faint)", 2.5) + ln(56, 30, 56, 190, "var(--text-faint)", 2.5);
    [0, 10, 20, 30, 40, 50].forEach(
      (v) =>
        (s +=
          ln(X(v), 190, X(v), 196, "var(--text-faint)", 2) +
          tx(X(v), 212, v, { f: "700 12px", c: "var(--text-faint)" })),
    );
    [40, 65, 90].forEach(
      (v) =>
        (s +=
          tx(50, Y(v) + 4, v, { a: "end", f: "700 12px", c: "var(--text-faint)" }) +
          ln(56, Y(v), 440, Y(v), "var(--line)", 1, "4 4")),
    );
    SC.forEach(([a, b]) => (s += ci(X(a), Y(b), 6.5, { f: "var(--blue)", s: "var(--blue-ink)", sw: 1.5 })));
    s += tx(250, 232, "fitness at the start of the run", { f: "700 12px", c: "var(--text-faint)" });
    s += `<text transform="translate(12,110) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">fitness where it stopped</text>`;
    return svg(470, 242, s);
  };

  B.add("l3-hc", [
    {
      type: "pick",
      q: "Two hillclimbers start from the same point on the same landscape. One accepts a mutant that is equal in fitness, the other accepts only strictly better ones. Click the run that accepts equal moves.",
      fig: hcPanels(),
      a: "runB",
      hint: "Both runs are the same until they reach a flat stretch. What can each do there?",
      why: "The runs are identical until evaluation 12, when both reach the flat plateau. Run A never moves again, because on a plateau every neighbour is merely equal and a strict climber rejects it. Run B keeps accepting equal moves, drifts across the plateau, and at about evaluation 50 steps off its far edge and climbs again to 14.",
    },
    {
      type: "pick",
      q: "This hillclimber with restarts returns poor answers even though some of its runs find excellent tours: it returns the tour the last run happened to end on. Click the box that should change.",
      fig: restartFlow(),
      a: "save",
      hint: "Which box decides what is remembered between runs?",
      why: "Saving every run's final tour as 'the result' overwrites an earlier, better one. The Save box should keep the new tour only if it is better than the best saved so far. Starting, climbing, the time check and returning are all fine.",
    },
    {
      type: "cat",
      q: "A hillclimber flips one random bit and keeps the mutant if its fitness is equal or better. Fitness is the number of 1s among the first four bits (the last four bits do not count). Sort each row: what is it?",
      fig: bitsTable(),
      buckets: ["An improvement", "Sideways or no move", "Impossible for this hillclimber"],
      items: [
        ["Row 1", 0],
        ["Row 2", 1],
        ["Row 3", 1],
        ["Row 4", 2],
        ["Row 5", 2],
        ["Row 6", 0],
      ],
      hint: "Count how many bits changed, then count the 1s in the first four bits before and after.",
      why: "Rows 1 and 6 flip a single bit among the first four from 0 to 1, a gain. Row 2 flips a bit in the right half (fitness unchanged), and row 3 is a mutant that was rejected, so nothing moves: both are fine because equal moves are accepted. Row 4 loses a 1 (3 to 2), which a hillclimber never keeps. Row 5 changes three bits at once, which one-bit mutation cannot do, even though fitness rose from 1 to 4.",
    },
    {
      type: "slider",
      q: "Each dot is one hillclimber run: across is the fitness it started at, up is the fitness where it stopped. The global optimum has fitness 90. About how many restarts would you expect to need before one reaches it?",
      fig: scatterFig(),
      min: 1,
      max: 10,
      step: 1,
      ans: 3,
      tol: 1,
      unit: "restarts",
      hint: "Count the dots on the top dashed line out of 20 dots. About one in three?",
      why: "6 of the 20 runs end at 90, so each restart succeeds about 30% of the time and you expect about 20 ÷ 6 ≈ 3 restarts. Notice where a run ends depends on which hill it started on, not how high it started: some of the best starting points (fitness 33 and 37) get stuck at 40, while a start at 8 reaches 90.",
    },
  ]);
})();

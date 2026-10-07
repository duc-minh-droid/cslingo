(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { C, L, R, T, arrowDef, pk, scatFig, svg, swatch, takeFig } = partScope;
  const B = NIC.bank;
  const DIM = "var(--text-dim)",
    FAINT = "var(--text-faint)";
  // stacked 100% bars: where tournament winners come from
  const stackFig = (() => {
    const rows = [
        ["P", 5],
        ["Q", 1],
        ["R", 10],
        ["S", 2],
      ],
      cols = ["var(--teal)", "var(--blue)", "var(--rose)"];
    let s =
      swatch(30, 14, cols[0], "top third", { fo: 0.85 }) +
      swatch(122, 14, cols[1], "middle third", { fo: 0.85 }) +
      swatch(236, 14, cols[2], "bottom third", { fo: 0.85 });
    rows.forEach(([id, t], k) => {
      const top = 1 - Math.pow(2 / 3, t),
        bot = Math.pow(1 / 3, t),
        mid = 1 - top - bot,
        y = 30 + k * 40,
        vals = [top, mid, bot];
      s += T(12, y + 22, id, { s: 14 });
      let x = 28;
      vals.forEach((v, i) => {
        const w = 316 * v;
        if (w > 0.5)
          s +=
            R(x, y, w, 32, cols[i], { fo: 0.85, r: 0, s: "var(--panel)", sw: 1 }) +
            (w > 26 ? T(x + w / 2, y + 21, Math.round(v * 100) + "%", { s: 12, c: "#fff" }) : "");
        x += w;
      });
    });
    return svg(350, 196, s + T(175, 192, "share of tournament winners by where they come from", { s: 10, c: FAINT }));
  })();
  // region map
  const regionFig = (() => {
    const PL = 54,
      PR = 344,
      PT = 12,
      PB = 250,
      id = "cl" + ++partScope.uid,
      U = (x) => 112 - (x - PL) * (90 / 290);
    const xs = (t) => PL + ((t - 1) / 9) * 290,
      ys = [36, 100, 164, 228];
    const poly = (a, col) => `<polygon points="${a.join(" ")}" fill="${col}"/>`;
    let s =
      `<defs><clipPath id="${id}"><rect x="${PL}" y="${PT}" width="${PR - PL}" height="${PB - PT}"/></clipPath></defs><g clip-path="url(#${id})">` +
      poly(
        [
          [PL, PT - 20],
          [PR, PT - 20],
          [PR, U(PR)],
          [PL, U(PL)],
        ],
        "var(--amber-dim)",
      ) +
      poly(
        [
          [PL, U(PL)],
          [PR, U(PR)],
          [PR, U(PR) + 120],
          [PL, U(PL) + 120],
        ],
        "var(--teal-dim)",
      ) +
      poly(
        [
          [PL, U(PL) + 120],
          [PR, U(PR) + 120],
          [PR, PB + 20],
          [PL, PB + 20],
        ],
        "var(--rose-dim)",
      ) +
      "</g>";
    s += R(PL, PT, PR - PL, PB - PT, "none", { r: 0 });
    ["0.2", "0.02", "0.002", "0.0002"].forEach((l, i) => {
      s += T(PL - 5, ys[i] + 4, l, { a: "end", s: 10, c: DIM });
    });
    [2, 4, 6, 8, 10].forEach((t) => {
      s += T(xs(t), PB + 15, t, { s: 11, c: DIM });
    });
    s +=
      T(200, PB + 31, "Tournament size t (more pressure →)", { s: 11, c: DIM }) +
      T(2, 8, "Mutation rate per bit", { a: "start", s: 10, c: DIM });
    s +=
      T(262, 40, "wanders", { s: 11, c: "var(--amber-ink)" }) +
      T(250, 124, "healthy", { s: 11, c: "var(--teal-ink)" }) +
      T(298, 196, "premature", { s: 11, c: "var(--rose-ink)" }) +
      T(298, 210, "convergence", { s: 11, c: "var(--rose-ink)" });
    [
      ["A", 2, 0],
      ["B", 4, 1],
      ["C", 6, 2],
      ["D", 9, 3],
    ].forEach(([n, t, k]) => {
      s += C(xs(t), ys[k], 13, "var(--panel)", { s: "var(--ink)" }) + T(xs(t), ys[k] + 5, n, { s: 14 });
    });
    return svg(350, 282, s);
  })();
  B.add("l4-pressure", [
    {
      type: "pick",
      q: "Three takeover runs (selection only, no mutation or crossover) used random parents, tournaments of size 2, and always-pick-the-best. Tap the map made by <b>random</b> selection.",
      fig: takeFig,
      a: "B",
      why: "Map C is one single colour from the second row: always picking the best takes over at once. Map A darkens steadily and ends up all one colour: tournaments of 2 push towards fitter individuals. Map B is random: nothing pulls it towards darker cells, the average colour just wanders, and the orange best individual was lost by row 2. Diversity still shrinks by chance (drift), but not towards fitness.",
    },
    {
      type: "cat",
      q: "Parents are drawn by roulette or by linear rank from six individuals (fitness 8 to 40). Each mark shows a chance of being picked. Compare each individual with the dashed line (equal chance for all).",
      fig: scatFig,
      buckets: [
        "Above the line under both methods",
        "Below the line under both methods",
        "Above the line under rank only",
      ],
      items: [
        ["#1 (fitness 8)", 1],
        ["#3 (fitness 10)", 1],
        ["#4 (fitness 11)", 2],
        ["#5 (fitness 12)", 2],
        ["#6 (fitness 40)", 0],
      ],
      why: "Roulette gives shares of 8, 9, 10, 11, 12 and 40 out of 90: the superfit #6 gets 44% and everyone else is squeezed below 1 in 6. Rank selection gives 1 to 6 out of 21, a steady staircase, so from #4 up (19%, 24%, 29%) the chances clear 1 in 6. The two methods disagree on #4 and #5 because roulette cares how far ahead #6 is.",
    },
    {
      type: "match",
      q: "Each bar shows where the <b>winners</b> of many tournaments come from (large population, entrants drawn with replacement). Match each bar to its tournament size.",
      fig: stackFig,
      pairs: [
        ["Bar P", "Tournament size 5"],
        ["Bar Q", "Tournament size 1"],
        ["Bar R", "Tournament size 10"],
        ["Bar S", "Tournament size 2"],
      ],
      hint: "The bottom third wins only if every entrant comes from it: 1/3 for size 1, 1/3 × 1/3 for size 2.",
      why: "Size 1 is just a random pick: a third from each part. Size 2 lets the bottom third win only when both entrants are from it (1/9 = 11%), so the top third rises to 56%. Size 5 gives the top third 87%, and size 10 about 98% with the middle third almost gone. Each extra entrant shifts the winners upwards.",
    },
    {
      type: "order",
      q: "The map shows four setups, A to D. Put them in order from MOST to LEAST likely to suffer premature convergence.",
      fig: regionFig,
      items: ["Setup D", "Setup C", "Setup B", "Setup A"],
      why: "Premature convergence comes from strong pressure plus too little variation: setup D (big tournaments, almost no mutation) is deepest in that corner. Moving left and up lowers the pressure and adds variation: C is near the edge, B is in the healthy band, and A, with weak tournaments and heavy mutation, has the opposite problem: it wanders.",
    },
  ]);

  /* ---------- l4-roulette ---------- */
  const tapeFig = (() => {
    const spins = ["C", "B", "C", "A", "A", "A", "A", "A"],
      col = { A: "var(--teal)", B: "var(--blue)", C: "var(--amber)" };
    let s = ["A: fitness 1", "B: fitness 1", "C: fitness 2"]
      .map(
        (t, i) =>
          R(4 + i * 112, 4, 14, 14, col["ABC"[i]], { fo: 0.85, r: 4 }) + T(24 + i * 112, 16, t, { a: "start", s: 12 }),
      )
      .join("");
    spins.concat(["?"]).forEach((v, i) => {
      const q = v === "?";
      s +=
        R(4 + i * 37, 34, 34, 40, q ? "var(--panel)" : col[v], { fo: q ? 1 : 0.85, r: 8, dash: q ? "5 4" : null }) +
        T(21 + i * 37, 60, v, { s: 17, c: q ? DIM : "#fff" }) +
        T(21 + i * 37, 90, i + 1, { s: 11, c: FAINT });
    });
    return svg(340, 102, s);
  })();
  const scat2 = (() => {
    const pts = [
        [1, 98],
        [2, 205],
        [3, 301],
        [4, 392],
        [5, 395],
        [6, 603],
      ],
      X = (f) => 46 + f * 44,
      Y = (v) => 212 - v * 0.31;
    let s = [0, 200, 400, 600]
      .map(
        (v) => L(40, Y(v), 330, Y(v), { c: "var(--line)", w: 1 }) + T(35, Y(v) + 4, v, { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    s +=
      T(190, 252, "fitness of the individual", { s: 11, c: DIM }) +
      T(4, 10, "times picked in a long run", { a: "start", s: 11, c: DIM });
    pts.forEach(([f, v]) => {
      s +=
        T(X(f), 234, f, { s: 11, c: DIM }) +
        pk("f" + f, C(X(f), Y(v), 14, "var(--panel)", { s: "var(--blue)" }) + T(X(f), Y(v) + 4, f, { s: 12 }));
    });
    return svg(340, 262, s);
  })();
  const shiftTab = `<table class="t"><tr><th>Tour</th><th class="num">Profit</th><th class="num">+ 4</th><th class="num">Wheel share</th></tr>
    <tr><td>A</td><td class="num">−4</td><td class="num">0</td><td class="num"><b style="color:var(--rose-ink)">0%</b></td></tr>
    <tr><td>B</td><td class="num">2</td><td class="num">6</td><td class="num">30%</td></tr>
    <tr><td>C</td><td class="num">6</td><td class="num">10</td><td class="num">50%</td></tr>
    <tr><td>D</td><td class="num">0</td><td class="num">4</td><td class="num">20%</td></tr></table>`;
  const miniBars = (() => {
    const mk = (x0, name, vals) => {
      let s = T(x0 + 52, 14, name, { s: 13 });
      vals.forEach((v, i) => {
        const h = v * 1.3;
        s +=
          R(x0 + 6 + i * 32, 148 - h, 26, Math.max(h, 1), "var(--blue)", { fo: 0.85, r: 4 }) +
          T(x0 + 19 + i * 32, 142 - h, v + "%", { s: 11 }) +
          T(x0 + 19 + i * 32, 164, "ABC"[i], { s: 12, c: DIM });
      });
      return s + L(x0, 148, x0 + 104, 148);
    };
    return svg(
      340,
      186,
      mk(4, "Chart X", [60, 40, 0]) +
        mk(118, "Chart Y", [14, 29, 57]) +
        mk(232, "Chart Z", [57, 29, 14]) +
        T(170, 182, "bars are tours A, B, C: their chance of being picked", { s: 10, c: FAINT }),
    );
  })();
  B.add("l4-roulette", [
    {
      type: "slider",
      q: "A roulette wheel has three individuals (A fitness 1, B fitness 1, C fitness 2). The wheel is built correctly. What is the chance that spin 9 picks A?",
      fig: tapeFig,
      min: 0,
      max: 100,
      step: 5,
      ans: 25,
      tol: 5,
      unit: "%",
      hint: "The wheel is the same for every spin. A owns 1 slice out of 1 + 1 + 2 = 4.",
      why: "Every spin starts afresh: A always owns 1 out of 4 slices, so 25%, whatever happened before. Five A's in a row is rare (1 in 1,024) but it does not make A 'due' or 'hot'. If streaks like this kept showing up, you would suspect a bug in the wheel, not luck.",
    },
    {
      type: "pick",
      q: "In a long run of roulette spins, each individual's pick count is plotted against its fitness. Roulette predicts a straight line through the origin. Tap the one individual that does not fit.",
      fig: scat2,
      a: "f5",
      why: "Picks should be proportional to fitness, about 100 per unit here: roughly 98, 205, 301, 392 and 603 for fitness 1, 2, 3, 4 and 6. Individual 5 got only 395, the count of a fitness-4 individual, where about 500 was expected. That points to a bug in how the wheel was built.",
    },
    {
      type: "mcq",
      q: "A student makes negative profits usable in roulette by adding 4 (the biggest loss) to every score. What goes wrong?",
      fig: shiftTab,
      o: [
        "The worst tour now has a slice of zero, so it can never be picked",
        "The shares no longer add up to 100%, so some spins land on nothing",
        "Adding a constant reverses the order, so the best becomes the worst",
        "A score of zero is not allowed, so tour D is thrown out of the wheel",
      ],
      a: 0,
      why: "Shifting by exactly the biggest loss turns the worst score into 0, so tour A has no slice and can never be selected, which throws away its (possibly useful) genes. The shares still add to 100% (0 + 30 + 50 + 20), the order is unchanged, and D with a shifted score of 4 keeps a 20% slice. Shift by a little more than the biggest loss, or switch to rank or tournament selection.",
    },
    {
      type: "match",
      q: "Three tours cost 10, 20 and 40 (shorter is better). Each chart shows the chance of being picked under a different score-to-fitness rule. Match each chart to its rule.",
      fig: miniBars,
      pairs: [
        ["Chart X", "Fitness = 40 − cost"],
        ["Chart Y", "Fitness = cost (wrong way round)"],
        ["Chart Z", "Fitness = 1 ÷ cost"],
      ],
      hint: "Try each rule on the costs 10, 20, 40, then turn the three numbers into shares of their total.",
      why: "With 1 ÷ cost the scores are 0.1, 0.05 and 0.025, so the shares are 57%, 29% and 14% (chart Z). With 40 − cost they are 30, 20 and 0, so shares 60%, 40% and 0%: the costliest tour gets no slice (chart X). Using cost itself reverses the preference, 14%, 29%, 57% (chart Y).",
    },
  ]);

  /* ---------- l4-rank ---------- */
  const rankLines = (() => {
    const X = (r) => 50 + (r - 1) * 40,
      Y = (p) => 214 - p * 560;
    let s = [0, 0.1, 0.2, 0.3]
      .map(
        (p) =>
          L(40, Y(p), 335, Y(p), { c: "var(--line)", w: 1 }) +
          T(35, Y(p) + 4, Math.round(p * 100) + "%", { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    const path = (f, c) =>
      `<path d="${[1, 2, 3, 4, 5, 6, 7, 8].map((r, i) => `${i ? "L" : "M"}${X(r)} ${Y(f(r))}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3"/>` +
      [1, 2, 3, 4, 5, 6, 7, 8].map((r) => C(X(r), Y(f(r)), 4.5, c, { s: "var(--panel)", sw: 2 })).join("");
    s += path((r) => r / 36, "var(--blue)") + path((r) => (r * r) / 204, "var(--violet)");
    for (let r = 1; r <= 8; r++) s += T(X(r), 232, r, { s: 11, c: DIM });
    s += T(190, 250, "rank (1 = worst, 8 = best)", { s: 11, c: DIM });
    s +=
      L(50, 12, 68, 12, { c: "var(--blue)", w: 4 }) +
      T(74, 16, "weight = rank", { a: "start", s: 11 }) +
      L(188, 12, 206, 12, { c: "var(--violet)", w: 4 }) +
      T(212, 16, "weight = rank²", { a: "start", s: 11 });
    return svg(350, 258, s);
  })();
  const pipeFig = (() => {
    const id = "ar" + ++partScope.uid,
      st = [
        ["1  Raw fitness", "A 0.9012    B 0.9031    C 0.9025"],
        ["2  Sort worst to best", "A 0.9012    C 0.9025    B 0.9031"],
        ["3  Swap each value for its rank", "A 1    C 2    B 3"],
        ["4  Weight = rank, scale to 100%", "A 17%    C 33%    B 50%"],
        ["5  Spin the wheel", "slices of 17%, 33% and 50%"],
      ];
    let s = arrowDef(id);
    st.forEach(([a, b], i) => {
      const y = 4 + i * 58;
      s += pk(
        "s" + (i + 1),
        R(4, y, 342, 46, "var(--panel)", { r: 10 }) +
          T(16, y + 19, a, { a: "start", s: 12.5 }) +
          T(16, y + 37, b, { a: "start", s: 11.5, c: DIM }),
      );
      if (i < 4) s += L(175, y + 48, 175, y + 56, { w: 3, mk: id });
    });
    return svg(350, 296, s);
  })();
  const stairs = (() => {
    let s = "";
    for (let i = 1; i <= 8; i++)
      s +=
        R(6 + (i - 1) * 42, 168 - i * 18, 38, i * 18, "var(--violet)", { fo: 0.3 + i * 0.08, r: 4 }) +
        T(25 + (i - 1) * 42, 162 - i * 18, i, { s: 13 });
    s += T(25, 186, "worst", { s: 11, c: DIM }) + T(319, 186, "best", { s: 11, c: DIM });
    return svg(344, 194, s);
  })();
  const matFig = (() => {
    const fit = [4, 5, 9, 10, 12, 40],
      cols = [
        ["X", [0.2, 1.8, 6.1, 14.5, 28.3, 49.0]],
        ["Y", fit.map((f) => (100 * f) / 80)],
        ["Z", [1, 2, 3, 4, 5, 6].map((r) => (100 * r) / 21)],
      ];
    const lab = (v) => (v < 1 ? "<1" : Math.round(v));
    let s = T(36, 16, "Fitness", { s: 11, c: DIM });
    cols.forEach(([n], j) => {
      s += T(130 + j * 88, 16, "Column " + n, { s: 12 });
    });
    fit.forEach((f, i) => {
      const y = 24 + i * 34;
      s += T(36, y + 21, f, { s: 14 });
      cols.forEach(([, vals], j) => {
        s +=
          R(90 + j * 88, y, 82, 30, "var(--teal)", {
            fo: (0.1 + (0.8 * vals[i]) / 50).toFixed(2),
            r: 4,
            s: "var(--panel)",
            sw: 2,
          }) + T(131 + j * 88, y + 20, lab(vals[i]) + "%", { s: 13 });
      });
    });
    return svg(350, 232, s);
  })();
  B.add("l4-rank", [
    {
      type: "cat",
      q: "Eight individuals ranked 1 (worst) to 8 (best). Blue gives each one a chance proportional to its rank, purple proportional to its rank squared. Does squaring give each rank MORE or LESS chance?",
      fig: rankLines,
      buckets: ["Squaring gives more chance", "Squaring gives less chance"],
      items: [
        ["Rank 2", 1],
        ["Rank 4", 1],
        ["Rank 5", 1],
        ["Rank 6", 0],
        ["Rank 8", 0],
      ],
      hint: "Both curves are shares of 100%. If the top ranks gain, the lower ranks must lose.",
      why: "Rank weights total 36 and squared weights total 204. For rank 5 that is 5/36 = 14% against 25/204 = 12%, so squaring loses; for rank 6 it is 17% against 18%, so it wins. The curves cross between ranks 5 and 6: squaring takes chance from the lower five ranks and hands it to the top three, which is higher selection pressure.",
    },
    {
      type: "pick",
      q: "Rank selection never looks at how <i>far apart</i> the fitness values are. Tap the stage after which the tiny gaps between these three nearly identical fitness values can no longer affect the selection.",
      fig: pipeFig,
      a: "s3",
      why: "Sorting (stage 2) still carries the real values, so they could in principle be used. Stage 3 replaces each value by its rank, 1, 2, 3: from then on only the order survives, and the size of the gaps (0.0019 or 0.19, it makes no difference) is gone. That is why rank selection keeps its pressure when a population has converged and why roulette loses it.",
    },
    {
      type: "slider",
      q: "Linear rank selection (weight = rank). With 8 individuals, the best is 8 times as likely to be picked as the worst. With a population of 40, how many times as likely is the best?",
      fig: stairs,
      min: 0,
      max: 80,
      step: 5,
      ans: 40,
      tol: 5,
      unit: "×",
      hint: "The worst has weight 1 and the best has weight N.",
      why: "Weights run 1, 2, 3 … N, so the best is N times as likely as the worst: 40 times for N = 40. The ratio grows with the population, and does not depend on the fitness values at all.",
    },
    {
      type: "match",
      q: "Same six individuals (fitness shown), three selection schemes: roulette, linear rank, and rank cubed. Each column lists the chance of being picked. Match each column to its scheme.",
      fig: matFig,
      pairs: [
        ["Column X", "Rank cubed"],
        ["Column Y", "Roulette"],
        ["Column Z", "Linear rank"],
      ],
      hint: "Roulette shares follow the fitness values: 40 is ten times 4. Linear rank rises in even steps.",
      why: "Column Y is roulette: its shares are the fitness values over their total (4, 5, 9, 10, 12 and 40 out of 80, so 50% for the best). Column Z is linear rank, an even staircase of 1 to 6 out of 21. Column X is the steepest: rank cubed gives the best 49% and the worst almost nothing.",
    },
  ]);
})();

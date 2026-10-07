(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { C, L, R, T, bitFig, dagFig, nodupTab, pk, splitFig, svg } = partScope;
  const B = NIC.bank;
  const DIM = "var(--text-dim)",
    FAINT = "var(--text-faint)";
  B.add("l4-crossover", [
    {
      type: "pick",
      q: "Parents are crossed over with 1-point, 2-point and uniform crossover. Each curve gives the chance that two genes d positions apart (in a 10-gene string) end up from different parents. Tap the curve for <b>2-point</b> crossover.",
      fig: splitFig,
      a: "Z",
      why: "Uniform crossover flips a fair coin per gene, so any two genes are separated half the time (curve X). With 1 cut, the further apart two genes are, the more likely the cut lands between them, a straight rise to 100% (curve Y). With 2 cuts, the middle segment swaps, so the two end genes both stay with the same parent: the chance falls back to 0 at d = 9. Curve Z is the hump: 2-point treats the string like a ring.",
    },
    {
      type: "slider",
      q: "Uniform crossover, no mutation: each gene of a child comes from either parent with equal chance. X and Y share the parent G1. About what percentage of Z's genes come from G1?",
      fig: dagFig,
      min: 0,
      max: 100,
      step: 5,
      ans: 50,
      tol: 10,
      unit: "%",
      hint: "A gene of Z comes from X or from Y with equal chance. Then from G1 with what chance on each route?",
      why: "A gene of Z comes from X half the time and then from G1 half of those times: 25%. It comes from Y half the time and then from G1 half of those: another 25%. The two routes cannot both happen to one gene, so 25% + 25% = 50%. Shared ancestors pile up in a family tree, which is one way diversity shrinks over generations.",
    },
    {
      type: "multi",
      q: "Plain 1-point crossover is applied to two city tours. Which statements about the child are true?",
      fig: nodupTab,
      o: [
        "City 1 and city 2 each appear twice",
        "Cities 5 and 6 are missing, so the tour is not valid",
        "The child is the wrong length",
        "Every gene came from a parent, so the tour is valid",
        "Replacing the repeated 1 and 2 at genes 4 and 6 with 5 and 6 would repair it",
      ],
      a: [0, 1, 4],
      why: "The child is 1 2 3 1 4 2: cities 1 and 2 are visited twice, and 5 and 6 never. It still has 6 genes, so the length is right; the problem is the content. Permutations are not just any string of parent genes, which is why order crossover and similar operators exist. Putting 5 and 6 where the repeats are (genes 4 and 6) would give a valid tour.",
    },
    {
      type: "pick",
      q: "Six members of the population are shown (blue = 1). Mutation is switched off. Tap every gene position that crossover can never change in any future child, however long the run.",
      fig: bitFig,
      a: ["c2", "c5", "c9"],
      why: "A child gene is always copied from some parent, so where every member agrees (genes 2, 5 and 9) nothing else can ever appear: crossover cannot create variation, only recombine it. Gene 7 looks nearly fixed but one member still has a 1, so crossover can pass it on. Only mutation could now change genes 2, 5 and 9.",
    },
  ]);

  /* ---------- l4-lab ---------- */
  const labHeat = (() => {
    const cnt = [
      [8, 8, 7, 8, 8, 8],
      [8, 5, 8, 8, 0, 8],
      [7, 8, 8, 3, 8, 8],
      [8, 8, 0, 8, 8, 6],
      [8, 1, 8, 8, 8, 8],
      [8, 8, 8, 8, 0, 8],
    ];
    let s = "";
    cnt.forEach((row, r) =>
      row.forEach((v, c) => {
        s += pk(
          "p" + r + c,
          R(4 + c * 50, 4 + r * 50, 46, 46, "var(--teal)", {
            fo: (0.06 + (0.8 * v) / 8).toFixed(2),
            r: 8,
            s: "var(--panel)",
            sw: 2,
          }) + T(27 + c * 50, 33 + r * 50, v, { s: 16 }),
        );
      }),
    );
    return svg(308, 308, s);
  })();
  const evalFig = (() => {
    const panel = (y0, title, xmax, ticks, x90, label) => {
      const X = (x) => 40 + (x / xmax) * 290,
        Y = (v) => y0 + 94 - ((v - 0.5) / 0.5) * 80,
        k = Math.log(5) / x90;
      const pts = Array.from({ length: 61 }, (_, i) => {
        const x = (i / 60) * xmax;
        return `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(1 - 0.5 * Math.exp(-k * x)).toFixed(1)}`;
      }).join(" ");
      let s =
        T(4, y0, title, { a: "start", s: 12 }) +
        L(40, Y(0.5), 330, Y(0.5)) +
        L(40, Y(0.9), 330, Y(0.9), { c: "var(--amber)", w: 2, dash: "6 5" }) +
        T(35, Y(0.9) + 4, "0.9", { a: "end", s: 10, c: "var(--amber-ink)" }) +
        T(35, Y(0.5) + 4, "0.5", { a: "end", s: 10, c: FAINT });
      s +=
        `<path d="${pts}" fill="none" stroke="var(--teal)" stroke-width="4"/>` +
        L(X(x90), Y(0.9), X(x90), Y(0.5), { c: "var(--amber)", w: 2, dash: "6 5" });
      ticks.forEach((t) => {
        s += T(X(t), Y(0.5) + 15, t, { s: 10, c: DIM });
      });
      return s + T(X(x90), Y(0.9) - 7, label, { s: 11, c: "var(--amber-ink)" });
    };
    return svg(
      340,
      276,
      panel(18, "Algorithm 1: x = steps (1 child per step)", 1000, [0, 250, 500, 750, 1000], 700, "0.9 at step 700") +
        panel(
          150,
          "Algorithm 2: x = generations (30 children each)",
          60,
          [0, 15, 30, 45, 60],
          40,
          "0.9 at generation 40",
        ),
    );
  })();
  const rateFig = (() => {
    const rates = ["0.0005", "0.002", "0.007", "0.02", "0.1", "0.5"],
      runs = [
        [0.72, 0.75, 0.7],
        [0.86, 0.89, 0.84],
        [0.96, 0.97, 0.94],
        [0.92, 0.9, 0.94],
        [0.77, 0.8, 0.74],
        [0.51, 0.49, 0.52],
      ];
    const X = (i) => 66 + i * 54,
      Y = (v) => 224 - ((v - 0.4) / 0.6) * 190;
    let s = [0.5, 0.7, 0.9]
      .map(
        (v) => L(36, Y(v), 340, Y(v), { c: "var(--line)", w: 1 }) + T(31, Y(v) + 4, v, { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    s +=
      L(X(2), 22, X(2), 232, { c: "var(--amber)", w: 2, dash: "6 5" }) +
      T(X(2) + 5, 18, "1/144", { a: "start", s: 11, c: "var(--amber-ink)" });
    rates.forEach((r, i) => {
      s += T(X(i), 248, r, { s: 10, c: DIM });
      runs[i].forEach((v, k) => {
        s += C(X(i) + (k - 1) * 11, Y(v), 6.5, "var(--blue)", { fo: 0.85, s: "var(--panel)", sw: 2 });
      });
    });
    s +=
      T(190, 266, "mutation rate per pixel (log scale)", { s: 11, c: DIM }) +
      T(2, 10, "final best fitness", { a: "start", s: 11, c: DIM });
    return svg(350, 274, s);
  })();
  const pixFig = (() => {
    const Tg = [".X..X.", "XXXXXX", "XXXXXX", ".XXXX.", "..XX..", "......"],
      par = ["XX..X.", "XXXX.X", "XXXXXX", "XXXXXX", "..XX..", "......"],
      flips = [
        [0, 1],
        [3, 0],
        [1, 4],
      ];
    const chd = par.map((r) => r.split(""));
    flips.forEach(([r, c]) => {
      chd[r][c] = chd[r][c] === "X" ? "." : "X";
    });
    const grid = (g, x0, name, mark) => {
      let s = T(x0 + 52, 14, name, { s: 13 });
      g.forEach((row, r) =>
        [...row].forEach((v, c) => {
          const isF = mark && flips.some(([a, b]) => a === r && b === c),
            cellSvg = R(x0 + c * 17.5, 22 + r * 17.5, 16, 16, v === "X" ? "var(--ink)" : "var(--bg-2)", {
              r: 3,
              s: isF ? "var(--amber)" : "var(--line)",
              sw: isF ? 3.5 : 1,
            });
          s += isF ? pk("p" + r + c, cellSvg) : cellSvg;
        }),
      );
      return s;
    };
    return svg(
      340,
      150,
      grid(Tg, 4, "Target", false) +
        grid(par, 118, "Parent", false) +
        grid(chd, 232, "Child", true) +
        T(170, 146, "dark = on, pale = off", { s: 10, c: FAINT }),
    );
  })();
  B.add("l4-lab", [
    {
      type: "pick",
      q: "Each number is how many of the 8 population members have that pixel of a 6 × 6 picture right. Mutation is off. Tap every pixel that selection and crossover can never fix.",
      fig: labHeat,
      a: ["p14", "p32", "p54"],
      hint: "Crossover can only reshuffle pixel values that someone in the population already has.",
      why: "A pixel that no member has right (the three zeros) offers crossover and selection nothing to combine; only mutation can flip it. A pixel that 1 or 3 members have right, such as the 1 and the 3, can still spread by selection and crossover. The 8s need no fixing at all. This is why a converged population stalls on its last wrong pixels.",
    },
    {
      type: "mcq",
      q: "Algorithm 1 (steady-state) and algorithm 2 (generational, population 30) both reach fitness 0.9. Which one needed fewer fitness evaluations?",
      fig: evalFig,
      o: [
        "Algorithm 1: about 700 evaluations, against 1,200",
        "Algorithm 2: its 40 generations are far fewer than 700 steps",
        "They are level: both curves reach 0.9 at the same height",
        "Algorithm 2: each whole generation is evaluated in parallel",
      ],
      a: 0,
      hint: "A step makes 1 child. A generation makes 30 children, so 30 evaluations.",
      why: "The two x axes count different things. A steady-state step evaluates one child, so 700 steps cost about 700 evaluations. A generation evaluates a whole new population, so 40 generations cost about 40 × 30 = 1,200. Compare costs in evaluations, not in generations or steps.",
    },
    {
      type: "mcq",
      q: "Each dot is one run on the same picture with the same number of evaluations, at a different per-pixel mutation rate. What explains the weaker results at BOTH ends of the curve?",
      fig: rateFig,
      o: [
        "Too few flips means slow exploring; too many scrambles progress",
        "Too few flips fills the population with copies; too many makes evaluation slower",
        "Low rates are blocked by elitism; high rates are blocked by tournament size",
        "Both ends are noise: three runs per setting cannot show any pattern at all",
      ],
      a: 0,
      why: "At 0.0005 per pixel most children are copies of their parents, so progress crawls. At 0.5 half the pixels flip, so a child is nearly a random picture and the good parts built so far are destroyed. The best results sit around 1/L = 1/144 per pixel, about one flip per child. Evaluation cost does not depend on the rate, and the three runs at each setting agree closely, so this is a real pattern.",
    },
    {
      type: "pick",
      q: "The child differs from its parent in three pixels (orange outlines). Compare them with the target and tap every changed pixel where the mutation HELPED.",
      fig: pixFig,
      a: ["p30", "p14"],
      why: "A flip helps when the parent was wrong at that pixel and the child is right. The first pixel of the fourth row was wrongly on and is now off, and the fifth pixel of the second row was wrongly off and is now on: two fixes. The second pixel of the top row was right in the parent and got broken. The net effect is 4 wrong pixels down to 3, a fitness of 33/36 instead of 32/36, and that is why a mutation can still be kept when part of it is harmful.",
    },
  ]);
})();

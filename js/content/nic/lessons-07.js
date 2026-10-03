(function () {
  const partScope = (NIC.shared.lessons = NIC.shared.lessons || {});
  const { addV, chips } = partScope;
  const FG = NIC.fig;
  addV(
    "l4-replacement",
    3,
    FG.cells([{ v: 0.3 }, { v: 0.5 }, { v: 0.2, c: "amber", sub: "= child?" }, { v: 0.9 }], { label: "child 0.2 →" }) +
      `<div class="fig-cap">The slides only work if a tie counts as weaker.</div>`,
  );
  addV(
    "l4-pressure",
    0,
    FG.plot(
      [
        { f: (g) => 0.3 + 0.15 * g, c: "violet", dash: "5 4", label: "too little" },
        { f: (g) => 0.3 + 0.62 * (1 - Math.exp(-0.6 * g)), c: "teal", label: "just right" },
        { f: (g) => 0.3 + 0.35 * (1 - Math.exp(-2.5 * g)), c: "rose", label: "too much" },
      ],
      { x: [0, 4], y: [0.2, 1], xl: "generations →", yl: "best fitness", h: 190 },
    ),
  );
  addV(
    "l4-pressure",
    1,
    FG.cells([{ v: "5" }, { v: "3" }, { v: "7" }, { v: "4" }, { v: "6" }], { label: "random picks:" }) +
      `<div class="fig-cap">Every individual equally likely: the fit ones get no advantage, so nothing improves.</div>`,
  );
  addV(
    "l4-pressure",
    2,
    FG.frames([
      {
        t: "generation 0: varied",
        v: chips([
          ["", 5],
          ["", 9, "winner"],
          ["", 3],
          ["", 7],
        ]),
      },
      {
        t: "generation 3: all copies of one",
        v: chips([
          ["", 9, "winner"],
          ["", 9, "winner"],
          ["", 9, "winner"],
          ["", 9, "winner"],
        ]),
      },
    ]),
  );
  addV(
    "l4-pressure",
    3,
    FG.cells([{ v: "tournament size t" }, { v: "rank bias" }, { v: "elitism count" }], {
      label: "pressure knobs:",
      size: 120,
    }),
  );
  addV(
    "l4-roulette",
    3,
    FG.compare(
      { title: "Fitness 100, 0.4, 0.3, 0.2, 0.1", c: "rose", body: FG.bars([["best", 99, "rose", "%"]], { max: 100 }) },
      { title: "Same +100 each", c: "violet", body: FG.bars([["best", 33, "violet", "%"]], { max: 100 }) },
    ),
  );
  addV(
    "l4-roulette",
    4,
    FG.compare(
      {
        title: "Minimising (tour length)",
        c: "rose",
        body: "longest tour gets the <b>biggest</b> slice: the worst are favoured",
      },
      { title: "Negative fitness", c: "rose", body: "a slice can't have negative size: roulette breaks" },
    ),
  );
  addV(
    "l4-rank",
    2,
    FG.bars(
      [
        ["rank 4 (best)", 40, "teal", "%"],
        ["rank 3", 30, "teal", "%"],
        ["rank 2", 20, "teal", "%"],
        ["rank 1", 10, "teal", "%"],
      ],
      { max: 40 },
    ) + `<div class="fig-cap">Probability = rank / (1+2+3+4). The actual fitness numbers never appear.</div>`,
  );
  addV(
    "l4-tournament",
    0,
    FG.frames([
      {
        t: "draw t = 2 at random (with replacement)",
        v: chips([
          ["", 5, "picked"],
          ["", 2],
          ["", 8, "picked"],
          ["", 3],
        ]),
      },
      { t: "the fitter of the two wins", v: chips([["winner", 8, "winner"]]) },
    ]),
  );
  addV(
    "l4-tournament",
    2,
    FG.bars(
      [
        ["t = 1", 25, "violet", "%"],
        ["t = 2", 43.75, "teal", "%"],
        ["t = 3", 57.8, "amber", "%"],
        ["t = 5", 76.3, "rose", "%"],
      ],
      { max: 100 },
    ) + `<div class="fig-cap">Chance the best of 4 wins its tournament. Bigger t = more pressure.</div>`,
  );
  addV(
    "l4-tournament",
    3,
    FG.cells([{ v: "1 − (3/4)²" }, "=", { v: "1 − 9/16" }, "=", { v: "7/16 ≈ 44%", c: "teal" }], { size: 80 }),
  );
  addV(
    "l4-tournament",
    4,
    FG.compare(
      { title: "Pros", c: "teal", body: "tunable · only compares (no superfit problems) · no sorting" },
      { title: "Cons", c: "rose", body: "one more parameter, t, to tune" },
    ),
  );
  addV(
    "l4-mutation",
    1,
    FG.compare(
      { title: "Exploitation", c: "teal", body: "small changes: the child is probably still good" },
      { title: "Exploration", c: "violet", body: "able, in principle, to reach <b>anywhere</b> in the space" },
    ),
  );
  addV(
    "l4-lab",
    0,
    `<div class="pixel-grid target" style="grid-template-columns:repeat(12,1fr);max-width:180px">${"000000000000011100011100111110111110111111111111111111111111111111111111011111111110001111111100000111111000000011110000000001100000000000000000"
      .split("")
      .map((b) => `<i class="${b === "1" ? "on" : ""}"></i>`)
      .join(
        "",
      )}</div><div class="fig-cap" style="text-align:left">Target: a 12 × 12 heart = 144 bits. Fitness = fraction of matching pixels.</div>`,
  );
})();

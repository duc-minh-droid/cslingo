(function () {
  const partScope = (NIC.shared.lessons = NIC.shared.lessons || {});
  const { TOWNS, addV, bumpsXY, chips, curve, g, multi, qualityVsTime, row } = partScope;
  const FG = NIC.fig;
  const TL = [
    ["A", "B", 4],
    ["B", "C", 3],
    ["A", "D", 2],
    ["D", "E", 5],
    ["C", "E", 2],
    ["B", "D", 6],
    ["B", "E", 7],
  ];
  addV(
    "l2-mst",
    0,
    FG.graph({ nodes: TOWNS, edges: TL, w: 400, h: 240 }) +
      `<div class="fig-cap">Every line is a possible cable with its cost.</div>`,
  );
  addV(
    "l2-mst",
    1,
    FG.compare(
      { title: "Spanning tree ✓", c: "teal", body: "5 towns, <b>4 links</b>, all connected, no loops" },
      {
        title: "Has a loop ✗",
        c: "rose",
        body: "one link in the loop is wasted: remove it and everything stays connected",
      },
    ),
  );
  addV(
    "l2-mst",
    2,
    FG.frames([
      {
        t: "Start at A. Cheapest edge out: A–B (1)",
        v: FG.cells([{ v: "A", c: "teal" }, "→", { v: "B", c: "amber", sub: "1" }]),
      },
      {
        t: "From {A,B}: B–C (2) beats A–C (3)",
        v: FG.cells([{ v: "AB", c: "teal" }, "→", { v: "C", c: "amber", sub: "2" }]),
      },
      {
        t: "From {A,B,C}: C–D (4). Total = 7",
        v: FG.cells([{ v: "ABC", c: "teal" }, "→", { v: "D", c: "amber", sub: "4" }]),
      },
    ]),
  );
  addV(
    "l2-mst",
    3,
    FG.cells(
      [
        { v: "polynomial time", c: "teal" },
        { v: "guaranteed optimal", c: "teal" },
        "→",
        { v: "easy problem", c: "teal" },
      ],
      { size: 130 },
    ),
  );
  addV(
    "l2-mst",
    4,
    FG.compare(
      { title: "Plain MST", c: "teal", body: "greedy Prim is <b>optimal</b>" },
      {
        title: "Degree ≤ 2 constraint",
        c: "rose",
        body: "a cheap early edge can block the only feasible trees: <b>hard</b>",
      },
    ),
  );
  addV(
    "l2-approx",
    0,
    FG.compare(
      { title: "Exact", c: "violet", body: "guaranteed optimum, but for hard problems basically exhaustive search" },
      { title: "Approximate", c: "teal", body: "good answers fast, but <b>no guarantee</b> they're optimal" },
    ),
  );
  addV(
    "l2-approx",
    1,
    FG.cells(
      [
        { v: "16", sub: "diameters" },
        "^",
        { v: "21", sub: "pipes" },
        "=",
        { v: "1.9 × 10²⁵", c: "rose" },
        "→",
        { v: "≈ 600 million years", sub: "at 10⁹ per second", c: "rose" },
      ],
      { size: 60 },
    ),
  );
  addV(
    "l2-approx",
    2,
    FG.cells(
      [
        { v: "✓ reasonable time", c: "teal" },
        { v: "✓ near-optimal (often optimal)", c: "teal" },
        { v: "✗ no guarantee", c: "rose" },
      ],
      { size: 150 },
    ),
  );
  addV("l2-approx", 4, qualityVsTime);

  // ---- Lecture 3
  addV(
    "l3-recipe",
    5,
    FG.frames([
      {
        t: "child 7 vs weakest 4 → replace",
        v: chips([
          ["p1", 9],
          ["p2", 6],
          ["p3", 4, "target"],
          ["c", 7, "new"],
        ]),
      },
      {
        t: "child 3 vs weakest 4 → discard",
        v: chips([
          ["p1", 9],
          ["p2", 6],
          ["p3", 4, "target"],
          ["c", 3, "new"],
        ]),
      },
    ]),
  );
  addV(
    "l3-recipe",
    6,
    `<table class="t" style="max-width:560px"><tr><th>box</th><th>common choices</th></tr><tr><td>algorithm type</td><td>generational · steady-state</td></tr><tr><td>selection</td><td>roulette · rank · tournament</td></tr><tr><td>crossover</td><td>1-point · uniform · none</td></tr><tr><td>replacement</td><td>replace weakest · first weaker</td></tr></table>`,
  );
  addV(
    "l3-tsp",
    0,
    NIC.tspSVG("ABCDE", { allEdges: true, maxH: 250 }).replace(
      "<svg ",
      '<svg role="img" aria-label="Map of the five cities A to E, with a road and its distance between every pair" ',
    ),
  );
  addV(
    "l3-tsp",
    3,
    FG.cells(
      [
        { v: "ABDEC", c: "teal" },
        "=",
        { v: "BDECA", c: "teal", sub: "start elsewhere" },
        "=",
        { v: "CEDBA", c: "teal", sub: "reversed" },
      ],
      { size: 70 },
    ),
  );
  addV(
    "l3-tsp",
    4,
    FG.bars(
      [
        ["5 cities", 12, "teal", "12 tours"],
        ["10 cities", 181440, "amber", "181,440"],
        ["20 cities", 6.08e16, "rose", "≈ 6 × 10¹⁶"],
      ],
      { max: 6.08e16, fmt: () => "" },
    ) +
      `<div class="fig-cap">(k − 1)! / 2 grows so fast the smaller bars vanish: 20 cities is already hopeless to enumerate.</div>`,
  );
  addV(
    "l3-hc",
    0,
    curve(multi, {
      marks: [
        [0.33, "var(--violet)", "🥾 feels the slope"],
        [0.75, "var(--amber)", "★"],
      ],
      label: "every possible solution →",
    }),
  );
  addV(
    "l3-hc",
    1,
    FG.cycle([
      { t: "current c", c: "teal" },
      { t: "mutate → m", c: "violet" },
      { t: "m no worse?", c: "amber" },
      { t: "keep m (c = m)", c: "teal" },
    ]),
  );
  addV(
    "l3-hc",
    5,
    curve(multi, {
      marks: [
        [0.45, "var(--rose)", "local optimum: stuck"],
        [0.75, "var(--amber)", "global optimum"],
      ],
      label: "every possible solution →",
    }),
  );
  addV(
    "l3-landscape",
    1,
    FG.plot([{ f: (x) => 0.5 + 0.3 * Math.sin(x * 2) + 0.05 * Math.sin(x * 9), c: "teal", fill: true }], {
      x: [0, 1.2],
      xl: "zoomed in: neighbours have similar fitness",
      h: 150,
    }),
  );
  addV("l3-landscape", 3, (box, life) => {
    FG.surface3d(box, life, {
      f: bumpsXY,
      height: 280,
      points: [
        { x: 0.25, y: 0.3, c: "#ff4b4b", label: "local peak" },
        { x: 0.7, y: 0.72, c: "#ff9600", label: "global peak" },
      ],
    });
    box.insertAdjacentHTML(
      "beforeend",
      `<div class="fig-cap">A 2-D landscape: mostly flat and poor, with a few peaks. A hill-climber starting near the red peak never sees the gold one.</div>`,
    );
  });
  addV(
    "l3-landscape",
    4,
    FG.compare(
      { title: "Small mutation", c: "teal", body: "lands <b>next door</b>, so probably similar and often better" },
      { title: "Huge jump", c: "rose", body: "lands <b>anywhere</b>, and anywhere is almost always poor" },
    ),
  );
  addV(
    "l3-neighbourhood",
    0,
    FG.cells([{ v: "1010", c: "amber", sub: "s" }]) +
      FG.cells([{ v: "0010" }, { v: "1110" }, { v: "1000" }, { v: "1011" }], { label: "flip one bit:" }) +
      `<div class="fig-cap">With bit-flip mutation, a 4-bit string has exactly 4 neighbours.</div>`,
  );
  addV(
    "l3-neighbourhood",
    3,
    curve(multi, {
      marks: [
        [0.18, "var(--rose)", "local"],
        [0.45, "var(--rose)", "local"],
        [0.75, "var(--amber)", "global"],
      ],
      label: "each peak = no better neighbour",
    }),
  );
  addV(
    "l3-neighbourhood",
    4,
    FG.compare(
      { title: "Small neighbourhood", c: "teal", body: "cheap steps, but <b>more</b> local optima to get stuck on" },
      { title: "Huge neighbourhood", c: "violet", body: "fewer local optima, but each step is costly and less local" },
    ),
  );
  addV(
    "l3-local",
    0,
    FG.compare(
      { title: "Fix ① allow downhill moves", c: "violet", body: "local search: Monte Carlo, tabu" },
      { title: "Fix ② use a population", c: "teal", body: "evolutionary algorithms (next module)" },
    ),
  );
  addV(
    "l3-local",
    1,
    FG.plot(
      [
        { pts: [0, 3, 2, 5, 4, 3, 6, 5, 4, 7, 6].map((v, i) => [i, v]), c: "violet", label: "current" },
        { pts: [0, 3, 3, 5, 5, 5, 6, 6, 6, 7, 7].map((v, i) => [i, v]), c: "teal", dash: "5 4", label: "best so far" },
      ],
      { x: [0, 10], y: [0, 8], xl: "iteration", h: 170 },
    ),
  );
  addV(
    "l3-local",
    2,
    FG.bars(
      [
        ["better neighbour", 100, "teal", "always accept"],
        ["worse neighbour", 10, "amber", "accept with p = 0.1"],
      ],
      { max: 100, fmt: () => "" },
    ),
  );
  addV(
    "l3-local",
    3,
    FG.frames([
      {
        t: "Look at all neighbours",
        v: FG.cells([{ v: "5" }, { v: "8", c: "rose", sub: "tabu" }, { v: "6", c: "teal" }]),
      },
      { t: "Best (8) is tabu → take 6, even if worse than now", v: FG.cells([{ v: "6", c: "teal", sub: "move" }]) },
    ]),
  );
  addV(
    "l3-local",
    4,
    FG.cells([
      { v: "peak", c: "amber" },
      "→",
      { v: "step down" },
      "→",
      { v: "peak", c: "amber" },
      "→",
      { v: "step down" },
      "→",
      { v: "…forever", c: "rose" },
    ]) + `<div class="fig-cap">Without a tabu list, the best move from just below the peak is straight back up.</div>`,
  );
  addV(
    "l3-population",
    1,
    chips([
      ["t1", 32],
      ["t2", 29, "picked"],
      ["t3", 34],
      ["t4", 28, "picked"],
      ["t5", 31],
    ]) + `<div class="fig-cap">Selection picks parents, biased toward the fitter ones (here, shorter tours).</div>`,
  );
  addV(
    "l3-population",
    2,
    row("Parent 1", g("11001", "p1")) +
      row("Parent 2", g("00111", "p2")) +
      row("Child", g("110", "p1") + g("11", "p2"), "head of 1 + tail of 2") +
      `<div class="fig-cap">Bit strings can be spliced freely. Tours (permutations) need special crossovers, or a city would appear twice.</div>`,
  );
  addV(
    "l3-population",
    3,
    curve(multi, {
      marks: [
        [0.62, "var(--violet)", "low now…"],
        [0.75, "var(--amber)", "…but next to the ★"],
      ],
      label: "keeping weak members keeps options open",
    }),
  );
  addV(
    "l3-population",
    5,
    FG.compare(
      { title: "Healthy convergence", c: "teal", body: "gradually fills with copies of good solutions" },
      { title: "Premature convergence", c: "rose", body: "everyone identical early, stuck on a mediocre hill" },
    ),
  );

  // ---- Lecture 4
  addV(
    "l4-types",
    1,
    chips([
      ["best", 9, "elite"],
      ["c1", 5, "new"],
      ["c2", 7, "new"],
      ["c3", 4, "new"],
    ]) + `<div class="fig-cap">The elite (green outline) survives unchanged; everyone else is replaced.</div>`,
  );
  addV(
    "l4-types",
    3,
    FG.compare(
      {
        title: "Steady-state",
        c: "teal",
        body: "one child at a time, used immediately; with replace-weakest it's automatically elitist",
      },
      {
        title: "Generational",
        c: "violet",
        body: "whole new generation at once: more exploration, add elitism so the best isn't lost",
      },
    ),
  );
  addV(
    "l4-replacement",
    2,
    FG.compare(
      { title: "Replace weakest", c: "rose", body: "greedy · high pressure · best always survives" },
      { title: "Replace first weaker", c: "teal", body: "gentler · keeps diversity · cheaper (stops scanning early)" },
    ),
  );
})();

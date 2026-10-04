(function () {
  const partScope = (NIC.shared.lessons = NIC.shared.lessons || {});
  const { chips, curve, flow, g, multi, row } = partScope;
  const L = NIC.LESSONS;

  L["l4-crossover"] = {
    sum: "Crossover makes a child by <b>mixing two parents' genes</b>, using cut points or a random mask.",
    steps: [
      {
        t: "1-point crossover",
        b: `<p>Pick one cut position. Child 1 = parent 1 <b>before</b> the cut + parent 2 <b>after</b> it. Child 2 is the opposite.</p>`,
        v:
          row("Parent 1", g("ABCDEFGH", "p1")) +
          row("Parent 2", g("KLMNOPQR", "p2")) +
          row(
            "Child 1",
            g("ABCDEPQR", (i) => (i < 5 ? "p1" : "p2")),
            "cut after 5",
          ) +
          row(
            "Child 2",
            g("KLMNOFGH", (i) => (i < 5 ? "p2" : "p1")),
          ),
      },
      {
        t: "2-point (and k-point) crossover",
        b: `<p>Two cuts: keep the outside from one parent and swap the middle. k-point extends this with k cuts, alternating segments.</p>`,
        v:
          row("Parent 1", g("ABCDEFGH", "p1")) +
          row("Parent 2", g("KLMNOPQR", "p2")) +
          row(
            "Child 1",
            g("ABMNOPGH", (i) => (i >= 2 && i < 6 ? "p2" : "p1")),
            "cuts after 2 and 6",
          ),
      },
      {
        t: "Watch it run",
        b: `<p>Watch the genes move. Blue came from parent 1 and orange from parent 2. First one cut, then two.</p><p>It will ask you to spot child 1. Drag the red cut marker to a new place and the run starts again.</p>`,
        v: (box, life) => NIC.runners.crossover(box, life),
      },
      {
        t: "Uniform crossover",
        b: `<p>Flip a coin for <b>every gene</b>: a random <b>mask</b>, where 1 = swap this gene and 0 = keep it.</p>`,
        v:
          row("Parent 1", g("ABCDEFGH", "p1")) +
          row("Parent 2", g("KLMNOPQR", "p2")) +
          row("Mask", g("01001101")) +
          row(
            "Child 1",
            g("ALCDOPGR", (i) => ("01001101"[i] === "1" ? "p2" : "p1")),
          ),
        c: {
          type: "match",
          q: "Uniform crossover on P1 = <code>ABCD</code> and P2 = <code>WXYZ</code>. A 1 in the mask swaps that gene in, a 0 keeps it. Match each mask to <b>child 1</b>.",
          pairs: [
            ["Mask 1010", "WBYD"],
            ["Mask 0110", "AXYD"],
            ["Mask 1100", "WXCD"],
            ["Mask 0101", "AXCZ"],
          ],
          hint: "Start from ABCD. Wherever the mask has a 1, take the gene at that position from WXYZ instead.",
          why: "1010 swaps positions 1 and 3: W B Y D. 0110 swaps 2 and 3: A X Y D. 1100 swaps 1 and 2: W X C D. 0101 swaps 2 and 4: A X C Z.",
        },
      },
      {
        t: "Limits of crossover",
        b: `<p>Crossover only <b>recombines</b> existing genes. It can't invent a value neither parent has (that's mutation's job).</p><p>And it must fit the encoding: 1-point crossover on <b>permutations</b> (like a travelling salesperson problem, or TSP, tour) creates duplicate cities.</p>`,
        v:
          row("Parent 1", g("ABCDE", "p1")) +
          row("Parent 2", g("EDCBA", "p2")) +
          row(
            "Child",
            g("ABCBA", (i) => (i >= 3 ? "bad" : "p1")),
            "B and A twice, D and E missing ✗",
          ),
        c: {
          q: "Why can't plain 1-point crossover be used on TSP tours?",
          o: [
            "It's far too slow on long tours to be practical",
            "It gives tours with repeated and missing cities",
            "It usually hands back the parents unchanged, so nothing is learnt",
          ],
          a: 1,
          why: "Permutations need special crossover operators (coming in the next lecture).",
        },
      },
    ],
    guide: [
      "Pick <b>1-point</b> and click different genes in a parent to move the cut. The children update live.",
      "Pick <b>Uniform</b> and click mask bits to flip them.",
      "Tick <b>use permutation parents</b> and try a few cuts. Red genes are duplicates, which means an invalid tour.",
    ],
  };

  L["l4-lab"] = {
    sum: "Put everything together: pick an algorithm, tune the knobs, and watch it evolve a picture.",
    steps: [
      {
        t: "The problem",
        b: `<p>A solution is a 12×12 black/white picture = <b>144 bits</b>. Fitness = the <b>fraction of pixels that match</b> the target. 1.0 means a perfect copy.</p>`,
      },
      {
        t: "Lecture algorithm 1 (in plain words)",
        b: `<p><b>Steady-state, mutation-only, replace-worst, tournament selection.</b> Each step: run a tournament to pick a parent, mutate a copy, and if it's not worse than the worst member, it replaces the worst.</p>`,
        v: flow([
          ["Tournament", "amber"],
          ["Mutate copy", "rose"],
          ["Beat the worst?", ""],
          ["Replace worst", "teal"],
        ]),
      },
      {
        t: "Lecture algorithm 2 (in plain words)",
        b: `<p><b>Generational, elitist, crossover + mutation, rank-based selection.</b> Each generation: rank-select 2·(P−1) parents, pair them up, cross over (with probability cross_rate) and mutate to get P−1 children. Keep the single best old member and add all the children.</p>`,
        v: flow([
          ["Rank-select parents", "amber"],
          ["Crossover", "violet"],
          ["Mutate", "rose"],
          ["Best old + children", "teal"],
        ]),
      },
      {
        t: "How to read the dashboard",
        b: `<p><b style="color:var(--teal-ink)">best</b>: fitness of the best member. <b style="color:var(--violet-ink)">mean</b>: population average. <b style="color:var(--amber-ink)">diversity</b>: how different members are from each other (1 = all different, 0 = all identical).</p><p>The small thumbnails are the population, best first. Red outlines on "Best so far" mark wrong pixels.</p>`,
        c: {
          type: "cat",
          q: "In the lab, diversity can fall to 0. Which operations can create a pixel value that <b>no one in the population has</b>, and which only reuse what is already there?",
          buckets: ["Can create new pixels", "Only reuses what exists"],
          items: [
            ["Flip a random pixel in a copy", 0],
            ["Take the left half from one parent and the right half from another", 1],
            ["Pick the fitter of two random members", 1],
            ["Re-roll a few random pixels in a child", 0],
            ["Replace the worst member with a child", 1],
          ],
          hint: "If every member is identical, mixing, picking and replacing them can only give back the same pixels.",
          why: "Mutation is the only source of new genetic material. Crossover, selection and replacement only shuffle, pick and copy what exists, so with diversity 0 and mutation off nothing can change.",
        },
      },
    ],
    guide: [
      "Pick <b>Lecture algo 1</b> and press <b>Run</b>. Note the evaluation count when it hits 144/144.",
      "Pick <b>Lecture algo 2</b>, reset, and run it. Which is faster here?",
      "Try the experiments listed below the lab one at a time. Change <i>one</i> knob per run.",
    ],
  };
  /* ---------- lesson figures (added to steps that had text only) ---------- */
  const FG = NIC.fig;
  const addV = (id, i, v) => {
    if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v;
  };
  const bumpsXY = (x, y) =>
    [
      [0.25, 0.3, 0.09, 0.55],
      [0.7, 0.72, 0.08, 1],
      [0.72, 0.25, 0.07, 0.45],
      [0.3, 0.78, 0.07, 0.5],
      [0.5, 0.5, 0.05, 0.35],
    ].reduce((s, [cx, cy, w, h]) => s + h * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * w * w)), 0.04);
  const qualityVsTime = FG.plot(
    [
      { f: (t) => (t < 0.85 ? 0.05 : 1), c: "violet", label: "exact: perfect, but only at the end" },
      { f: (t) => 0.9 * (1 - Math.exp(-7 * t)), c: "teal", label: "nature-inspired: good, early" },
    ],
    { x: [0, 1], y: [0, 1.1], xl: "time →", yl: "solution quality", h: 180 },
  );

  // ---- Lecture 1
  addV(
    "l1-what",
    1,
    FG.cells(
      [
        { v: "🧬 evolution", sub: "→ evolutionary algorithms", c: "teal" },
        { v: "🧠 brains", sub: "→ neural networks", c: "violet" },
        { v: "🐜 swarms", sub: "→ ant colony, particle swarm", c: "amber" },
      ],
      { size: 170 },
    ),
  );
  addV(
    "l1-what",
    2,
    FG.compare(
      { title: "Engineered systems", c: "violet", body: "a designer plans every part, top-down" },
      {
        title: "Natural systems",
        c: "teal",
        body: "<b>no one in charge</b>: simple parts plus feedback produce clever results",
      },
    ),
  );
  addV("l1-what", 4, qualityVsTime);
  addV(
    "l1-monkey",
    0,
    FG.flow([
      { t: "problem", s: "climb a smooth wall" },
      { t: "evolution", s: "millions of generations", c: "violet" },
      { t: "gecko feet 🦎", s: "solved", c: "teal" },
    ]),
  );
  addV(
    "l1-monkey",
    2,
    FG.bars(
      [
        ["monkey (random)", 40, "rose", "≈ 10⁴⁰ tries"],
        ["keep-if-better", 3.4, "teal", "a few thousand"],
      ],
      { max: 40, fmt: () => "" },
    ) + `<div class="fig-cap">Bar length ∝ number of digits in the try count. The gap is 36 orders of magnitude.</div>`,
  );
  addV(
    "l1-monkey",
    4,
    curve(multi, {
      marks: [
        [0.45, "var(--rose)", "stuck here"],
        [0.75, "var(--amber)", "★ best"],
      ],
      label: "every possible solution →",
    }),
  );
  addV(
    "l1-ingredients",
    0,
    FG.cells(
      [
        { v: "1 population", sub: "required", c: "teal" },
        { v: "2 biased selection + mutation", sub: "required", c: "teal" },
        { v: "3 recombination", sub: "optional", c: "violet" },
      ],
      { size: 170 },
    ),
  );
  addV(
    "l1-apps",
    0,
    FG.flow([
      { t: "candidate", s: "any design" },
      { t: "fitness function", s: '"how good is it?"', c: "amber" },
      { t: "a number", s: "that's all an EA needs", c: "teal" },
    ]),
  );
  addV(
    "l1-apps",
    2,
    FG.cells(
      [
        { v: "🚗 car shapes", sub: "airflow sim" },
        { v: "📡 NASA antenna", sub: "beat human designs", c: "teal" },
        { v: "📅 timetables", sub: "fewest clashes" },
        { v: "💧 water networks", sub: "meet the spec" },
      ],
      { size: 130 },
    ),
  );

  // ---- Lecture 2
  addV(
    "l2-generic",
    0,
    curve(multi, {
      marks: [
        [0.75, "var(--amber)", "s* (the best)"],
        [0.3, "var(--violet)", "some s"],
      ],
      label: "candidate solutions s →",
    }) +
      `<div class="fig-cap">Height = f(s). Optimisation = find the highest point (or the lowest, for minimising).</div>`,
  );
  addV(
    "l2-generic",
    4,
    FG.frames([
      {
        t: "① all children replace all parents",
        v: chips([
          ["c1", 5, "new"],
          ["c2", 3, "new"],
          ["c3", 7, "new"],
        ]),
      },
      {
        t: "② merge, keep the best |P|",
        v: chips([
          ["p1", 9, "elite"],
          ["c3", 7, "new"],
          ["p2", 6],
        ]),
      },
      {
        t: "③ replace some: e.g. only the weakest",
        v: chips([
          ["p1", 9],
          ["p2", 6],
          ["c3", 7, "new"],
        ]),
      },
    ]),
  );
  addV(
    "l2-generic",
    6,
    FG.plot(
      [
        { f: (t) => 0.55 * (1 - Math.exp(-25 * t)), c: "rose", label: "always pick the best" },
        { f: (t) => 0.95 * t * t, c: "violet", dash: "5 4", label: "almost random" },
        { f: (t) => 0.9 * (1 - Math.exp(-5 * t)), c: "teal", label: "balanced" },
      ],
      { x: [0, 1], y: [0, 1], xl: "time →", yl: "best found", h: 190 },
    ),
  );
  addV(
    "l2-optim",
    0,
    FG.cells(
      [
        { v: "20 kg", sub: "item 1" },
        { v: "75 kg", sub: "item 2" },
        { v: "60 kg", sub: "item 3" },
        "→",
        { v: "≈ 100 kg?", c: "amber" },
      ],
      { size: 70 },
    ),
  );
  addV(
    "l2-optim",
    2,
    `<table class="t" style="max-width:420px"><tr><th>subset</th><th class="num">weight</th><th class="num">f = |w − 100|</th></tr>${[
      ["000", 0],
      ["001", 60],
      ["010", 75],
      ["011", 135],
      ["100", 20],
      ["101", 80],
      ["110", 95],
      ["111", 155],
    ]
      .map(
        ([b, w]) =>
          `<tr class="${b === "110" ? "hl" : ""}"><td class="mono">${b}</td><td class="num">${w}</td><td class="num">${Math.abs(w - 100)}</td></tr>`,
      )
      .join("")}</table>`,
  );
  addV(
    "l2-optim",
    3,
    FG.bars(
      [
        ["000", 100, "dim"],
        ["001", 40, "dim"],
        ["010", 25, "dim"],
        ["011", 35, "dim"],
        ["100", 80, "dim"],
        ["101", 20, "dim"],
        ["110", 5, "teal", "best"],
        ["111", 55, "dim"],
      ],
      { max: 100 },
    ) + `<div class="fig-cap">Score all 8, keep the smallest f. Guaranteed optimal, but only because 8 is tiny.</div>`,
  );
  addV(
    "l2-optim",
    4,
    FG.bars(
      [
        ["3 items: 2³", 0.9, "teal", "8"],
        ["30 items: 2³⁰", 9, "amber", "≈ 10⁹"],
        ["timetable", 30, "rose", "≈ 10³⁰"],
      ],
      { max: 30, fmt: () => "" },
    ) + `<div class="fig-cap">Bar length = number of digits. Each extra item doubles the search space.</div>`,
  );
  addV(
    "l2-optim",
    5,
    `<table class="t" style="max-width:520px"><tr><th>problem</th><th>fitness</th><th>goal</th></tr><tr><td>timetabling</td><td>number of clashes</td><td>minimise</td></tr><tr><td>car design</td><td>distance on terrain</td><td>maximise</td></tr><tr><td>antenna / circuit / network</td><td>how close to the spec</td><td>maximise</td></tr></table>`,
  );
  addV(
    "l2-complexity",
    3,
    FG.plot(
      [
        { f: (n) => n ** 3, c: "teal", label: "n³ (easy)" },
        { f: (n) => 2 ** n, c: "rose", label: "2ⁿ (hard)" },
      ],
      { x: [1, 14], y: [0, 3000], xl: "problem size n", yl: "steps", h: 190 },
    ) + `<div class="fig-cap">Exponential looks harmless at first, then leaves any polynomial behind for good.</div>`,
  );
  addV(
    "l2-complexity",
    4,
    FG.compare(
      {
        title: "Technically hard",
        c: "rose",
        body: "timetabling, routing, scheduling, protein folding: <b>no fast exact method known</b>",
      },
      { title: "So in practice", c: "teal", body: "use methods that find <b>very good</b> answers in reasonable time" },
    ),
  );
  const TOWNS = { A: [60, 60], B: [200, 40], C: [330, 80], D: [120, 190], E: [290, 200] };
  Object.assign(partScope, { TOWNS, addV, bumpsXY, qualityVsTime });
})();

/* ===== bank-v-nic-2.js ===== */
/* NIC revision bank, visual and varied questions, part 2. Numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});

  const B = NIC.bank;

  /* ---------- small SVG helpers (CSS variables so both themes work) ---------- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, s, { a = "middle", c = "var(--text)", f = "800 13px" } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${f} var(--sans);fill:${c}">${s}</text>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2, d = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const path = (pts, c, w = 3, d = "") =>
    `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const mat = (C, D) =>
    `<div style="max-width:340px"><table class="t matrix"><tr><th></th>${C.map((x) => `<th>${x}</th>`).join("")}</tr>${C.map((a) => `<tr><th>${a}</th>${C.map((b) => (a === b ? `<td class="faint">–</td>` : `<td>${D[a][b]}</td>`)).join("")}</tr>`).join("")}</table></div>`;
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  };

  /* ======================================================================
     l2-approx
     ====================================================================== */
  const deadlineFig = () => {
    const X = (t) => 50 + t * 32.5,
      Y = (q) => 190 - q * 1.6;
    const simple = [],
      ea = [];
    for (let t = 0; t <= 12.01; t += 0.25) {
      simple.push([X(t), Y(85 * (1 - Math.exp(-t / 1.2)))]);
      ea.push([X(t), Y(100 * (1 - Math.exp(-t / 4)))]);
    }
    return svg(
      460,
      230,
      `${ln(50, 190, 440, 190, "var(--line-2)", 2)}${ln(50, 20, 50, 190, "var(--line-2)", 2)}
      ${path(simple, "var(--blue)")}${path(ea, "var(--amber)")}
      ${ln(X(4), 24, X(4), 190, "var(--rose)", 2, "6 5")}${tx(X(4), 16, "deadline", { c: "var(--rose-ink)", f: "800 12px" })}
      ${tx(X(10.2), Y(92) - 6, "EA", { c: "var(--amber-ink)" })}${tx(X(10.2), Y(85) + 22, "Simple method", { c: "var(--blue-ink)" })}
      ${tx(245, 220, "time spent searching", { f: "700 12px", c: "var(--text-faint)" })}
      <text transform="translate(16,105) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">quality of answer</text>`,
    );
  };
  const runsFig = () => {
    const vals = { A: 431, B: 412, C: 418, D: 409, E: 425 },
      Y = (v) => 200 - (v - 380) * 2.833;
    const bars = Object.entries(vals)
      .map(
        ([k, v], i) =>
          `<g data-pick="${k}"><rect x="${50 + i * 78}" y="${Y(v)}" width="52" height="${200 - Y(v)}" rx="6" fill="var(--blue)" opacity=".85" stroke="var(--blue-lip, var(--blue))" stroke-width="2"/>${tx(76 + i * 78, Y(v) - 6, v, { f: "800 13px" })}${tx(76 + i * 78, 218, "run " + k, { f: "700 12px", c: "var(--text-dim)" })}</g>`,
      )
      .join("");
    const ticks = [380, 400, 420, 440]
      .map(
        (v) =>
          `${ln(40, Y(v), 450, Y(v), "var(--line)", 1)}${tx(34, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" })}`,
      )
      .join("");
    return svg(
      460,
      258,
      `${ticks}${bars}${ln(40, Y(400), 450, Y(400), "var(--rose)", 3, "7 5")}${ln(20, 246, 60, 246, "var(--rose)", 3, "7 5")}${tx(68, 250, "proven lower bound: 400 km (axis starts at 380)", { a: "start", c: "var(--rose-ink)", f: "800 12px" })}`,
    );
  };

  B.add("l2-approx", [
    {
      type: "cat",
      q: "For each job, is an exact algorithm realistic, or is an approximate method the sensible choice?",
      buckets: ["Exact is realistic", "Approximate is sensible"],
      items: [
        ["Cheapest cabling that links 30 offices (a minimum spanning tree)", 0],
        ["Shortest road route between two towns on a map", 0],
        ["Choosing parcels for tonight's van from only 8 candidates (256 subsets)", 0],
        ["Timetabling 400 exams with clash rules, answer wanted in a minute", 1],
        ["Routing a drone past 300 sites, plan needed in two seconds", 1],
        ["Sizing 200 pipes with 16 diameters each to cut cost", 1],
      ],
      why: "Exact is realistic when a fast exact algorithm exists (spanning tree, shortest path) or the search space is tiny. When the space explodes and no fast exact method is known, an approximate method is the only practical option.",
    },
    {
      type: "mcq",
      q: "Two methods run on the same problem. The job must be finished by the dashed deadline. Which statement fits the graph?",
      fig: deadlineFig(),
      o: [
        "The simple method is ahead now, but the EA overtakes it if we can wait longer",
        "The EA is ahead now, and it keeps its lead however long we run",
        "The simple method is ahead now and keeps its lead however long we run",
        "They give the same quality at the deadline, so either choice is fine",
      ],
      a: 0,
      why: "At the deadline the simple method's curve is higher. The curves cross later, where the slower EA keeps improving while the simple method levels off. The right choice depends on the time budget.",
    },
    {
      type: "slider",
      q: "Checking every design of a pipe network takes 18 minutes when there are 10 pipes with 8 possible diameters each. Two more pipes are added. About how long does the exhaustive check take now?",
      min: 0,
      max: 60,
      step: 1,
      ans: 19,
      tol: 8,
      unit: "hours",
      hint: "Each extra pipe multiplies the designs by 8, so two more pipes multiply by 8 × 8 = 64. Then 18 minutes × 64 ≈ 1,150 minutes, and 1,150 ÷ 60 ≈ 19.",
      why: "Search space grows multiplicatively: ×64 for two pipes, so 18 min becomes about 19 hours. Three more pipes would be about 6 days. This is why exhaustive search runs out of road so quickly.",
    },
    {
      type: "bug",
      q: "This program is meant to report what an approximate (mutate-and-keep-if-better) search found. One line says something the method can never justify. Click it.",
      code: [
        "best = random_route()",
        "for step in range(100000):",
        "    m = mutate(copy(best))",
        "    if length(m) < length(best):",
        "        best = m",
        "print('Optimal route found:', best)",
      ],
      a: 5,
      why: "An approximate algorithm has no way to prove optimality. It can honestly say 'best route found' (and perhaps compare it with a lower bound), but not 'optimal'.",
    },
    {
      type: "pick",
      q: "Each bar is the route length (km) from one run of an EA. A proof shows that no route can be shorter than 400 km. Click every run that is guaranteed to be within 5% of the best possible route.",
      fig: runsFig(),
      a: ["B", "C", "D"],
      hint: "5% of 400 is 20. The best possible route is at least 400 km, so anything up to 420 km is guaranteed to be within 5% of it.",
      why: "The optimum is at least 400, so a run of 420 or less is at most 5% (20 km) above the optimum, whatever the true optimum is. Runs of 425 and 431 might still be fine, but the bound can't promise it.",
    },
    {
      type: "mcq",
      q: "Timing and quality of two unnamed methods on routing problems of growing size. Which reading of the table is sensible?",
      fig: `<table class="t"><tr><th></th><th>10 stops</th><th>20 stops</th><th>30 stops</th></tr><tr><th>Method X</th><td>0.01 s</td><td>11 s</td><td>3 hours</td></tr><tr><th>Method Y</th><td>0.1 s</td><td>0.2 s</td><td>0.3 s</td></tr><tr><th>X's route quality</th><td>best possible</td><td>best possible</td><td>best possible</td></tr><tr><th>Y's route quality</th><td>99% of best</td><td>96% of best</td><td>94% of best</td></tr></table>`,
      o: [
        "X looks exact (time explodes, always best); Y looks approximate (fast, quality slips)",
        "X looks approximate because it is slow; Y looks exact because it is quick",
        "Both look exact, because both always return a valid route",
        "Y looks exact because its time grows steadily; X is a weaker approximate method",
      ],
      a: 0,
      why: "Always-optimal answers whose time explodes with size are the signature of an exact method. Gentle time growth with slowly slipping quality is an approximate method trading quality for speed.",
    },
  ]);

  /* ======================================================================
     l3-recipe
     ====================================================================== */
  const popRowsFig = () => {
    const rows = [
      ["A", "10110", 3],
      ["B", "01001", 2],
      ["C", "11100", 3],
      ["D", "00001", 1],
      ["E", "00101", 2],
    ];
    return svg(
      460,
      250,
      `${tx(30, 24, "member", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(130, 24, "string", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(260, 24, "fitness (number of 1s)", { a: "start", c: "var(--text-faint)", f: "700 11px" })}
      ${rows.map(([k, s, f], i) => `<g data-pick="${k}"><rect x="14" y="${34 + i * 40}" width="432" height="34" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(36, 57 + i * 40, k, { a: "start", f: "900 15px" })}${tx(130, 57 + i * 40, s.split("").join(" "), { a: "start", f: "800 15px" })}${tx(260, 57 + i * 40, f + " ".repeat(0), { a: "start", f: "800 15px" })}<rect x="300" y="${44 + i * 40}" width="${f * 30}" height="14" rx="5" fill="var(--teal)"/></g>`).join("")}`,
    );
  };

  B.add("l3-recipe", [
    {
      type: "bug",
      q: "This steady-state EA maximises fitness, yet its population gets worse over time. Click the faulty line.",
      code: [
        "# fitness is to be maximised",
        "pop = [random_individual() for _ in range(20)]",
        "for step in range(2000):",
        "    parent = tournament(pop, size=2)",
        "    child = mutate(copy(parent))",
        "    weakest = max(pop, key=fitness)",
        "    if fitness(child) >= fitness(weakest):",
        "        pop.remove(weakest)",
        "        pop.append(child)",
      ],
      a: 5,
      why: "The 'weakest' member must be the one with the lowest fitness, so min(...). With max(...) the EA throws away its best member each time, and the population drifts downhill.",
    },
    {
      type: "order",
      q: "Put one generation of a generational EA in order.",
      items: [
        "Score every member of the population",
        "Select parents, with fitter ones more likely",
        "Recombine pairs of parents into children",
        "Mutate the children slightly",
        "The children replace the old population",
      ],
      why: "Selection needs scores first. Children are built from the selected parents and varied, and then the whole generation is swapped over at once. That all-at-once swap is what separates it from steady-state.",
    },
    {
      type: "cat",
      q: "You reuse an EA that solved OneMax (bit strings) for a travelling-salesperson problem (permutations of cities). Which parts must be redesigned, and which can stay?",
      buckets: ["Must be redesigned", "Can stay as it is"],
      items: [
        ["Bit-flip mutation", 0],
        ["1-point crossover on the raw string", 0],
        ["Fitness function (counting the 1s)", 0],
        ["Tournament selection (best of 2 by fitness)", 1],
        ["Replace-the-weakest rule", 1],
        ["Stop after 5,000 evaluations", 1],
      ],
      why: "Operators that touch the encoding (mutation, crossover) and the fitness function depend on the problem. Selection, replacement and termination only compare fitness numbers, so they are reusable.",
    },
    {
      type: "pick",
      q: "Fitness is to be maximised. A tournament of 2 picks A and B, and A wins. A mutated copy of A flips its last bit, giving the child 10111 (fitness 4). Replacement rule: the child replaces the weakest member if it is at least as good. Click the member that is removed.",
      fig: popRowsFig(),
      a: "D",
      why: "Replacement ignores who took part in the tournament. The weakest member is D (fitness 1), and the child (4) is at least as good, so D goes. B lost the tournament but is not the weakest overall.",
    },
    {
      type: "slider",
      q: "A generational EA has a population of 40 and scores every member once per generation. How many generations can it run on a budget of 2,000 fitness evaluations?",
      min: 0,
      max: 200,
      step: 5,
      ans: 50,
      tol: 10,
      unit: "generations",
      hint: "2,000 ÷ 40: think 200 ÷ 4 = 50.",
      why: "2,000 ÷ 40 = 50 generations. A steady-state EA spends one evaluation per child, so the same budget gives it 2,000 replacement steps. Same effort, a very different rhythm.",
    },
    {
      type: "multi",
      q: "Which changes push an EA to converge faster by favouring members that are already fit? Select all that apply.",
      o: [
        "Raise the tournament size from 2 to 6",
        "Always pick the single fittest member as parent",
        "Replace the weakest member rather than a random one",
        "Flip half the bits of every child at random",
        "Double the population and keep everything else the same",
      ],
      a: [0, 1, 2],
      why: "Bigger tournaments, always choosing the best, and replacing the weakest all increase selection pressure. Heavy mutation and a larger population do the opposite: they add exploration and slow convergence.",
    },
  ]);

  /* ======================================================================
     l3-tsp
     ====================================================================== */
  const PENT = { A: [230, 30], B: [400, 120], C: [340, 235], D: [120, 235], E: [60, 120] };
  const DG = {
    A: { B: 8, C: 3, D: 6, E: 1 },
    B: { A: 8, C: 8, D: 7, E: 5 },
    C: { A: 3, B: 8, D: 2, E: 8 },
    D: { A: 6, B: 7, C: 2, E: 3 },
    E: { A: 1, B: 5, C: 8, D: 3 },
  };

  B.add("l3-tsp", [
    {
      type: "multi",
      q: "The map shows a round trip over five cities. Select every string that describes this same loop.",
      fig: NIC.qfig.graph(
        PENT,
        [
          ["A", "C"],
          ["C", "E"],
          ["E", "B"],
          ["B", "D"],
          ["D", "A"],
        ],
        { w: 460, h: 262 },
      ),
      o: ["CEBDA", "ADBEC", "DACEB", "ACBED", "ADCEB"],
      a: [0, 1, 2],
      hint: "Read the loop as A, C, E, B, D, back to A. A string is the same loop if it uses exactly the same set of hops.",
      why: "CEBDA starts elsewhere on the same loop, ADBEC drives it backwards, and DACEB is another start. ACBED uses the hops C–B and E–D, which are not on the map, and ADCEB uses D–C and B–A, which are not either.",
    },
    {
      type: "mcq",
      q: "A solver can check one million tours per second. The table gives the number of distinct tours for each size. What is the largest number of cities it can check exhaustively in one minute?",
      fig: `<table class="t"><tr><th>cities</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th></tr><tr><th>distinct tours</th><td>181,440</td><td>1,814,400</td><td>19,958,400</td><td>239,500,800</td><td>3,113,510,400</td></tr></table>`,
      o: ["11 cities", "12 cities", "13 cities", "14 cities"],
      a: 1,
      hint: "One minute at a million per second is 60 million tours. Find the biggest row that is still below 60 million.",
      why: "In one minute it checks 60 million tours. 12 cities need about 20 million, which fits. 13 cities need about 240 million, which is four times too many. Each extra city multiplies the work by roughly the number of cities.",
    },
    {
      type: "mcq",
      q: "A courier starts at A and always drives to the nearest city not yet visited, finally returning to A. Using this distance table, what happens?",
      fig: mat(["A", "B", "C", "D", "E"], DG),
      o: [
        "It drives AEDCB for 22 km, but a tour of 18 km exists",
        "It drives AEDCB for 22 km, which is the shortest possible tour",
        "It drives ACDEB for 21 km, which is the shortest tour",
        "It drives AEDCB for 18 km, which is the shortest tour",
      ],
      a: 0,
      hint: "From A the nearest city is E (1). From E the nearest unvisited is D (3). Keep going, then add the way home. For the shorter tour, try A, C, D, B, E.",
      why: "Greedy goes A→E (1), E→D (3), D→C (2), C→B (8), B→A (8) = 22. The tour ACDBE is 3 + 2 + 7 + 5 + 1 = 18. Grabbing the cheapest hop early can force expensive hops later.",
    },
    {
      type: "bug",
      q: "This function should return the length of a round trip, but it undercounts every tour. Click the faulty line.",
      code: [
        "def tour_length(t, D):",
        "    total = 0",
        "    for i in range(len(t) - 1):",
        "        total += D[t[i]][t[i + 1]]",
        "    return total",
      ],
      a: 2,
      hint: "Count the hops of a 5-city tour. How many does this loop add up, and how many does the round trip have?",
      why: "range(len(t) - 1) adds only n − 1 hops, so the road home from the last city back to the first is missing. A round trip has n hops, so the loop needs to cover the wrap-around too, for example with t[(i + 1) % len(t)].",
    },
    {
      type: "multi",
      q: "A tour is stored as a permutation of the cities. Which mutations always give back a valid tour? Select all that apply.",
      o: [
        "Swap two chosen cities",
        "Reverse a chosen stretch of the tour",
        "Replace one city by a random other city",
        "Delete one random city",
        "Move one city to a different position",
      ],
      a: [0, 1, 4],
      why: "Swapping, reversing a stretch and moving a city only rearrange the cities, so each one still appears exactly once. Replacing a city creates a duplicate and deleting one leaves the tour with a city missing.",
    },
  ]);

  /* ======================================================================
     l3-hc
     ====================================================================== */
  const hcBarsFig = () => {
    const V = [2, 5, 3, 4, 6, 8, 7, 9, 10, 6];
    return svg(
      460,
      238,
      `${ln(10, 196, 450, 196, "var(--line-2)", 2)}
      ${V.map((v, i) => `<g data-pick="b${i}"><rect x="${16 + i * 44}" y="${196 - v * 16}" width="36" height="${v * 16}" rx="6" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(34 + i * 44, 196 - v * 16 - 6, v, { f: "800 13px" })}</g>`).join("")}
      ${tx(34 + 2 * 44, 222, "▲ start", { c: "var(--rose-ink)", f: "800 13px" })}`,
    );
  };
  const restartFig = () => {
    const V = [48, 41, 47, 41, 44, 41];
    return svg(
      460,
      232,
      `${ln(30, 196, 450, 196, "var(--line-2)", 2)}${V.map((v, i) => `<rect x="${44 + i * 66}" y="${196 - v * 3.4}" width="46" height="${v * 3.4}" rx="6" fill="${v === 41 ? "var(--teal)" : "var(--blue)"}" opacity=".9"/>${tx(67 + i * 66, 196 - v * 3.4 - 6, v)}${tx(67 + i * 66, 216, "run " + (i + 1), { f: "700 12px", c: "var(--text-dim)" })}`).join("")}${tx(8, 14, "final tour length (km) of each restart", { a: "start", f: "700 12px", c: "var(--text-faint)" })}`,
    );
  };

  B.add("l3-hc", [
    {
      type: "pick",
      q: "Each bar is a solution and its fitness (higher is better). A hillclimber starts at the marked bar. A mutation moves it one bar left or right, chosen at random, and it accepts the move if the new bar is not lower. Click every bar where it could finally get stuck.",
      fig: hcBarsFig(),
      a: ["b1", "b5"],
      why: "From the start (3) it can step left to 5, where both neighbours are lower, so it stops. Or it steps right to 4, then 6, then 8, where both neighbours (6 and 7) are lower, so it stops. It can never cross the dip of 7 to reach the 10, so the global optimum is out of reach.",
    },
    {
      type: "bug",
      q: "This hillclimber minimises tour length, but its tours keep getting longer. Click the faulty line.",
      code: [
        "c = random_tour()",
        "for step in range(5000):",
        "    m = c",
        "    swap_random_neighbours(m)",
        "    if length(m) <= length(c):",
        "        c = m",
      ],
      a: 2,
      hint: "After line 3, is c still the old tour?",
      why: "m = c gives a second name for the same tour, not a copy. The swap changes c itself, so length(m) <= length(c) is always true and every random swap is kept. It needs m = c.copy() (or list(c)).",
    },
    {
      type: "mcq",
      q: "A hillclimber minimises tour length and accepts a mutant that is no longer than the current tour. It starts at 34 km, and the seven mutants it generates are 36, 34, 31, 35, 31, 29 and 33 km in that order. How many mutants does it accept?",
      fig: `<table class="t"><tr><th>step</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr><tr><th>mutant (km)</th><td>36</td><td>34</td><td>31</td><td>35</td><td>31</td><td>29</td><td>33</td></tr></table>`,
      o: ["2", "3", "4", "7"],
      a: 2,
      hint: "Keep a running 'current': 34, then compare each mutant with it.",
      why: "Current 34: 36 no; 34 yes (equal); 31 yes; 35 no; 31 yes (equal); 29 yes; 33 no. That is four accepted, ending at 29. Counting only strict improvements would give two, but equal moves are accepted.",
    },
    {
      type: "mcq",
      q: "A hillclimber was restarted six times from random tours. The chart shows where each run ended. What is the sensible conclusion?",
      fig: restartFig(),
      o: [
        "41 is the best found and keeps recurring, but a shorter tour could still exist",
        "41 is certainly optimal, because three separate runs agreed on it",
        "Runs that agree show that the search is broken, so none can be trusted",
        "The best tour is the average of all six runs, about 44 km",
      ],
      a: 0,
      why: "Repeated restarts sample different hills. Reaching 41 three times suggests a wide, attractive hill, but nothing proves a narrow, better one was not missed. Keep the best result, not an average.",
    },
    {
      type: "slider",
      q: "The hill that leads to the global optimum covers one fifth of all starting points. A hillclimber is restarted five times from random starts. What is the chance that at least one run climbs the right hill?",
      min: 0,
      max: 100,
      step: 5,
      ans: 67,
      tol: 10,
      unit: "%",
      hint: "Chance that every run misses is 0.8 each time: 0.8 × 0.8 = 0.64; × 0.8 ≈ 0.51; × 0.8 ≈ 0.41; × 0.8 ≈ 0.33. So the chance of at least one hit is about 1 − 0.33.",
      why: "All five runs miss with probability 0.8⁵ ≈ 0.33, so at least one hit has probability about 0.67. Restarts help a lot, but they are not a guarantee.",
    },
  ]);
  Object.assign(partScope, { PENT, ln, path, rng, svg, tx });
})();

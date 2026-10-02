/* NIC revision bank, visual and varied questions, part 2. Numbers verified with node. */
(function () {
  const B = NIC.bank;

  /* ---------- small SVG helpers (CSS variables so both themes work) ---------- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, s, { a = "middle", c = "var(--text)", f = "800 13px" } = {}) => `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${f} var(--sans);fill:${c}">${s}</text>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2, d = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const path = (pts, c, w = 3, d = "") => `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const mat = (C, D) => `<div style="max-width:340px"><table class="t matrix"><tr><th></th>${C.map((x) => `<th>${x}</th>`).join("")}</tr>${C.map((a) => `<tr><th>${a}</th>${C.map((b) => (a === b ? `<td class="faint">–</td>` : `<td>${D[a][b]}</td>`)).join("")}</tr>`).join("")}</table></div>`;
  const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

  /* ======================================================================
     l2-approx
     ====================================================================== */
  const deadlineFig = () => {
    const X = (t) => 50 + t * 32.5, Y = (q) => 190 - q * 1.6;
    const simple = [], ea = [];
    for (let t = 0; t <= 12.01; t += 0.25) { simple.push([X(t), Y(85 * (1 - Math.exp(-t / 1.2)))]); ea.push([X(t), Y(100 * (1 - Math.exp(-t / 4)))]); }
    return svg(460, 230, `${ln(50, 190, 440, 190, "var(--line-2)", 2)}${ln(50, 20, 50, 190, "var(--line-2)", 2)}
      ${path(simple, "var(--blue)")}${path(ea, "var(--amber)")}
      ${ln(X(4), 24, X(4), 190, "var(--rose)", 2, "6 5")}${tx(X(4), 16, "deadline", { c: "var(--rose-ink)", f: "800 12px" })}
      ${tx(X(10.2), Y(92) - 6, "EA", { c: "var(--amber-ink)" })}${tx(X(10.2), Y(85) + 22, "Simple method", { c: "var(--blue-ink)" })}
      ${tx(245, 220, "time spent searching", { f: "700 12px", c: "var(--text-faint)" })}
      <text transform="translate(16,105) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">quality of answer</text>`);
  };
  const runsFig = () => {
    const vals = { A: 431, B: 412, C: 418, D: 409, E: 425 }, Y = (v) => 200 - (v - 380) * 2.833;
    const bars = Object.entries(vals).map(([k, v], i) => `<g data-pick="${k}"><rect x="${50 + i * 78}" y="${Y(v)}" width="52" height="${200 - Y(v)}" rx="6" fill="var(--blue)" opacity=".85" stroke="var(--blue-lip, var(--blue))" stroke-width="2"/>${tx(76 + i * 78, Y(v) - 6, v, { f: "800 13px" })}${tx(76 + i * 78, 218, "run " + k, { f: "700 12px", c: "var(--text-dim)" })}</g>`).join("");
    const ticks = [380, 400, 420, 440].map((v) => `${ln(40, Y(v), 450, Y(v), "var(--line)", 1)}${tx(34, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" })}`).join("");
    return svg(460, 232, `${ticks}${bars}${ln(40, Y(400), 450, Y(400), "var(--rose)", 3, "7 5")}${tx(448, Y(400) - 6, "proven lower bound: 400 km", { a: "end", c: "var(--rose-ink)", f: "800 12px" })}`);
  };

  B.add("l2-approx", [
    { type: "cat", q: "For each job, is an exact algorithm realistic, or is an approximate method the sensible choice?",
      buckets: ["Exact is realistic", "Approximate is sensible"],
      items: [["Cheapest cabling that links 30 offices (a minimum spanning tree)", 0], ["Shortest road route between two towns on a map", 0], ["Choosing parcels for tonight's van from only 8 candidates (256 subsets)", 0],
        ["Timetabling 400 exams with clash rules, answer wanted in a minute", 1], ["Routing a drone past 300 sites, plan needed in two seconds", 1], ["Sizing 200 pipes with 16 diameters each to cut cost", 1]],
      why: "Exact is realistic when a fast exact algorithm exists (spanning tree, shortest path) or the search space is tiny. When the space explodes and no fast exact method is known, an approximate method is the only practical option." },
    { type: "mcq", q: "Two methods run on the same problem. The job must be finished by the dashed deadline. Which statement fits the graph?",
      fig: deadlineFig(),
      o: ["The simple method is ahead now, but the EA overtakes it if we can wait longer", "The EA is ahead now, and it keeps its lead however long we run", "The simple method is ahead now and keeps its lead however long we run", "They give the same quality at the deadline, so either choice is fine"], a: 0,
      why: "At the deadline the simple method's curve is higher. The curves cross later, where the slower EA keeps improving while the simple method levels off. The right choice depends on the time budget." },
    { type: "slider", q: "Checking every design of a pipe network takes 18 minutes when there are 10 pipes with 8 possible diameters each. Two more pipes are added. About how long does the exhaustive check take now?",
      min: 0, max: 60, step: 1, ans: 19, tol: 8, unit: "hours",
      hint: "Each extra pipe multiplies the designs by 8, so two more pipes multiply by 8 × 8 = 64. Then 18 minutes × 64 ≈ 1,150 minutes, and 1,150 ÷ 60 ≈ 19.",
      why: "Search space grows multiplicatively: ×64 for two pipes, so 18 min becomes about 19 hours. Three more pipes would be about 6 days. This is why exhaustive search runs out of road so quickly." },
    { type: "bug", q: "This program is meant to report what an approximate (mutate-and-keep-if-better) search found. One line says something the method can never justify. Click it.",
      code: ["best = random_route()", "for step in range(100000):", "    m = mutate(copy(best))", "    if length(m) < length(best):", "        best = m", "print('Optimal route found:', best)"], a: 5,
      why: "An approximate algorithm has no way to prove optimality. It can honestly say 'best route found' (and perhaps compare it with a lower bound), but not 'optimal'." },
    { type: "pick", q: "Each bar is the route length (km) from one run of an EA. A proof shows that no route can be shorter than 400 km. Click every run that is guaranteed to be within 5% of the best possible route.",
      fig: runsFig(), a: ["B", "C", "D"],
      hint: "5% of 400 is 20. The best possible route is at least 400 km, so anything up to 420 km is guaranteed to be within 5% of it.",
      why: "The optimum is at least 400, so a run of 420 or less is at most 5% (20 km) above the optimum, whatever the true optimum is. Runs of 425 and 431 might still be fine, but the bound can't promise it." },
    { type: "mcq", q: "Timing and quality of two unnamed methods on routing problems of growing size. Which reading of the table is sensible?",
      fig: `<table class="t"><tr><th></th><th>10 stops</th><th>20 stops</th><th>30 stops</th></tr><tr><th>Method X</th><td>0.01 s</td><td>11 s</td><td>3 hours</td></tr><tr><th>Method Y</th><td>0.1 s</td><td>0.2 s</td><td>0.3 s</td></tr><tr><th>X's route quality</th><td>best possible</td><td>best possible</td><td>best possible</td></tr><tr><th>Y's route quality</th><td>99% of best</td><td>96% of best</td><td>94% of best</td></tr></table>`,
      o: ["X looks exact (time explodes, always best); Y looks approximate (fast, quality slips)", "X looks approximate because it is slow; Y looks exact because it is quick", "Both look exact, because both always return a valid route", "Y looks exact because its time grows steadily; X is a weaker approximate method"], a: 0,
      why: "Always-optimal answers whose time explodes with size are the signature of an exact method. Gentle time growth with slowly slipping quality is an approximate method trading quality for speed." },
  ]);

  /* ======================================================================
     l3-recipe
     ====================================================================== */
  const popRowsFig = () => {
    const rows = [["A", "10110", 3], ["B", "01001", 2], ["C", "11100", 3], ["D", "00001", 1], ["E", "00101", 2]];
    return svg(460, 250, `${tx(30, 24, "member", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(130, 24, "string", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(260, 24, "fitness (number of 1s)", { a: "start", c: "var(--text-faint)", f: "700 11px" })}
      ${rows.map(([k, s, f], i) => `<g data-pick="${k}"><rect x="14" y="${34 + i * 40}" width="432" height="34" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(36, 57 + i * 40, k, { a: "start", f: "900 15px" })}${tx(130, 57 + i * 40, s.split("").join(" "), { a: "start", f: "800 15px" })}${tx(260, 57 + i * 40, f + " ".repeat(0), { a: "start", f: "800 15px" })}<rect x="300" y="${44 + i * 40}" width="${f * 30}" height="14" rx="5" fill="var(--teal)"/></g>`).join("")}`);
  };

  B.add("l3-recipe", [
    { type: "bug", q: "This steady-state EA maximises fitness, yet its population gets worse over time. Click the faulty line.",
      code: ["# fitness is to be maximised", "pop = [random_individual() for _ in range(20)]", "for step in range(2000):", "    parent = tournament(pop, size=2)", "    child = mutate(copy(parent))", "    weakest = max(pop, key=fitness)", "    if fitness(child) >= fitness(weakest):", "        pop.remove(weakest)", "        pop.append(child)"], a: 5,
      why: "The 'weakest' member must be the one with the lowest fitness, so min(...). With max(...) the EA throws away its best member each time, and the population drifts downhill." },
    { type: "order", q: "Put one generation of a generational EA in order.",
      items: ["Score every member of the population", "Select parents, with fitter ones more likely", "Recombine pairs of parents into children", "Mutate the children slightly", "The children replace the old population"],
      why: "Selection needs scores first. Children are built from the selected parents and varied, and then the whole generation is swapped over at once. That all-at-once swap is what separates it from steady-state." },
    { type: "cat", q: "You reuse an EA that solved OneMax (bit strings) for a travelling-salesperson problem (permutations of cities). Which parts must be redesigned, and which can stay?",
      buckets: ["Must be redesigned", "Can stay as it is"],
      items: [["Bit-flip mutation", 0], ["1-point crossover on the raw string", 0], ["Fitness function (counting the 1s)", 0], ["Tournament selection (best of 2 by fitness)", 1], ["Replace-the-weakest rule", 1], ["Stop after 5,000 evaluations", 1]],
      why: "Operators that touch the encoding (mutation, crossover) and the fitness function depend on the problem. Selection, replacement and termination only compare fitness numbers, so they are reusable." },
    { type: "pick", q: "Fitness is to be maximised. A tournament of 2 picks A and B, and A wins. A mutated copy of A flips its last bit, giving the child 10111 (fitness 4). Replacement rule: the child replaces the weakest member if it is at least as good. Click the member that is removed.",
      fig: popRowsFig(), a: "D",
      why: "Replacement ignores who took part in the tournament. The weakest member is D (fitness 1), and the child (4) is at least as good, so D goes. B lost the tournament but is not the weakest overall." },
    { type: "slider", q: "A generational EA has a population of 40 and scores every member once per generation. How many generations can it run on a budget of 2,000 fitness evaluations?",
      min: 0, max: 200, step: 5, ans: 50, tol: 10, unit: "generations",
      hint: "2,000 ÷ 40: think 200 ÷ 4 = 50.",
      why: "2,000 ÷ 40 = 50 generations. A steady-state EA spends one evaluation per child, so the same budget gives it 2,000 replacement steps. Same effort, a very different rhythm." },
    { type: "multi", q: "Which changes push an EA to converge faster by favouring members that are already fit? Select all that apply.",
      o: ["Raise the tournament size from 2 to 6", "Always pick the single fittest member as parent", "Replace the weakest member rather than a random one", "Flip half the bits of every child at random", "Double the population and keep everything else the same"], a: [0, 1, 2],
      why: "Bigger tournaments, always choosing the best, and replacing the weakest all increase selection pressure. Heavy mutation and a larger population do the opposite: they add exploration and slow convergence." },
  ]);

  /* ======================================================================
     l3-tsp
     ====================================================================== */
  const PENT = { A: [230, 30], B: [400, 120], C: [340, 235], D: [120, 235], E: [60, 120] };
  const DG = { A: { B: 8, C: 3, D: 6, E: 1 }, B: { A: 8, C: 8, D: 7, E: 5 }, C: { A: 3, B: 8, D: 2, E: 8 }, D: { A: 6, B: 7, C: 2, E: 3 }, E: { A: 1, B: 5, C: 8, D: 3 } };

  B.add("l3-tsp", [
    { type: "multi", q: "The map shows a round trip over five cities. Select every string that describes this same loop.",
      fig: NIC.qfig.graph(PENT, [["A", "C"], ["C", "E"], ["E", "B"], ["B", "D"], ["D", "A"]], { w: 460, h: 262 }),
      o: ["CEBDA", "ADBEC", "DACEB", "ACBED", "ADCEB"], a: [0, 1, 2],
      hint: "Read the loop as A, C, E, B, D, back to A. A string is the same loop if it uses exactly the same set of hops.",
      why: "CEBDA starts elsewhere on the same loop, ADBEC drives it backwards, and DACEB is another start. ACBED uses the hops C–B and E–D, which are not on the map, and ADCEB uses D–C and B–A, which are not either." },
    { type: "mcq", q: "A solver can check one million tours per second. The table gives the number of distinct tours for each size. What is the largest number of cities it can check exhaustively in one minute?",
      fig: `<table class="t"><tr><th>cities</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th></tr><tr><th>distinct tours</th><td>181,440</td><td>1,814,400</td><td>19,958,400</td><td>239,500,800</td><td>3,113,510,400</td></tr></table>`,
      o: ["11 cities", "12 cities", "13 cities", "14 cities"], a: 1,
      hint: "One minute at a million per second is 60 million tours. Find the biggest row that is still below 60 million.",
      why: "In one minute it checks 60 million tours. 12 cities need about 20 million, which fits. 13 cities need about 240 million, which is four times too many. Each extra city multiplies the work by roughly the number of cities." },
    { type: "mcq", q: "A courier starts at A and always drives to the nearest city not yet visited, finally returning to A. Using this distance table, what happens?",
      fig: mat(["A", "B", "C", "D", "E"], DG),
      o: ["It drives AEDCB for 22 km, but a tour of 18 km exists", "It drives AEDCB for 22 km, which is the shortest possible tour", "It drives ACDEB for 21 km, which is the shortest tour", "It drives AEDCB for 18 km, which is the shortest tour"], a: 0,
      hint: "From A the nearest city is E (1). From E the nearest unvisited is D (3). Keep going, then add the way home. For the shorter tour, try A, C, D, B, E.",
      why: "Greedy goes A→E (1), E→D (3), D→C (2), C→B (8), B→A (8) = 22. The tour ACDBE is 3 + 2 + 7 + 5 + 1 = 18. Grabbing the cheapest hop early can force expensive hops later." },
    { type: "bug", q: "This function should return the length of a round trip, but it undercounts every tour. Click the faulty line.",
      code: ["def tour_length(t, D):", "    total = 0", "    for i in range(len(t) - 1):", "        total += D[t[i]][t[i + 1]]", "    return total"], a: 2,
      hint: "Count the hops of a 5-city tour. How many does this loop add up, and how many does the round trip have?",
      why: "range(len(t) - 1) adds only n − 1 hops, so the road home from the last city back to the first is missing. A round trip has n hops, so the loop needs to cover the wrap-around too, for example with t[(i + 1) % len(t)]." },
    { type: "multi", q: "A tour is stored as a permutation of the cities. Which mutations always give back a valid tour? Select all that apply.",
      o: ["Swap two chosen cities", "Reverse a chosen stretch of the tour", "Replace one city by a random other city", "Delete one random city", "Move one city to a different position"], a: [0, 1, 4],
      why: "Swapping, reversing a stretch and moving a city only rearrange the cities, so each one still appears exactly once. Replacing a city creates a duplicate and deleting one leaves the tour with a city missing." },
  ]);

  /* ======================================================================
     l3-hc
     ====================================================================== */
  const hcBarsFig = () => {
    const V = [2, 5, 3, 4, 6, 8, 7, 9, 10, 6];
    return svg(460, 238, `${ln(10, 196, 450, 196, "var(--line-2)", 2)}
      ${V.map((v, i) => `<g data-pick="b${i}"><rect x="${16 + i * 44}" y="${196 - v * 16}" width="36" height="${v * 16}" rx="6" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(34 + i * 44, 196 - v * 16 - 6, v, { f: "800 13px" })}</g>`).join("")}
      ${tx(34 + 2 * 44, 222, "▲ start", { c: "var(--rose-ink)", f: "800 13px" })}`);
  };
  const restartFig = () => {
    const V = [48, 41, 47, 41, 44, 41];
    return svg(460, 232, `${ln(30, 196, 450, 196, "var(--line-2)", 2)}${V.map((v, i) => `<rect x="${44 + i * 66}" y="${196 - v * 3.4}" width="46" height="${v * 3.4}" rx="6" fill="${v === 41 ? "var(--teal)" : "var(--blue)"}" opacity=".9"/>${tx(67 + i * 66, 196 - v * 3.4 - 6, v)}${tx(67 + i * 66, 216, "run " + (i + 1), { f: "700 12px", c: "var(--text-dim)" })}`).join("")}${tx(8, 14, "final tour length (km) of each restart", { a: "start", f: "700 12px", c: "var(--text-faint)" })}`);
  };

  B.add("l3-hc", [
    { type: "pick", q: "Each bar is a solution and its fitness (higher is better). A hillclimber starts at the marked bar. A mutation moves it one bar left or right, chosen at random, and it accepts the move if the new bar is not lower. Click every bar where it could finally get stuck.",
      fig: hcBarsFig(), a: ["b1", "b5"],
      why: "From the start (3) it can step left to 5, where both neighbours are lower, so it stops. Or it steps right to 4, then 6, then 8, where both neighbours (6 and 7) are lower, so it stops. It can never cross the dip of 7 to reach the 10, so the global optimum is out of reach." },
    { type: "bug", q: "This hillclimber minimises tour length, but its tours keep getting longer. Click the faulty line.",
      code: ["c = random_tour()", "for step in range(5000):", "    m = c", "    swap_random_neighbours(m)", "    if length(m) <= length(c):", "        c = m"], a: 2,
      hint: "After line 3, is c still the old tour?",
      why: "m = c gives a second name for the same tour, not a copy. The swap changes c itself, so length(m) <= length(c) is always true and every random swap is kept. It needs m = c.copy() (or list(c))." },
    { type: "mcq", q: "A hillclimber minimises tour length and accepts a mutant that is no longer than the current tour. It starts at 34 km, and the seven mutants it generates are 36, 34, 31, 35, 31, 29 and 33 km in that order. How many mutants does it accept?",
      fig: `<table class="t"><tr><th>step</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr><tr><th>mutant (km)</th><td>36</td><td>34</td><td>31</td><td>35</td><td>31</td><td>29</td><td>33</td></tr></table>`,
      o: ["2", "3", "4", "7"], a: 2,
      hint: "Keep a running 'current': 34, then compare each mutant with it.",
      why: "Current 34: 36 no; 34 yes (equal); 31 yes; 35 no; 31 yes (equal); 29 yes; 33 no. That is four accepted, ending at 29. Counting only strict improvements would give two, but equal moves are accepted." },
    { type: "mcq", q: "A hillclimber was restarted six times from random tours. The chart shows where each run ended. What is the sensible conclusion?",
      fig: restartFig(),
      o: ["41 is the best found and keeps recurring, but a shorter tour could still exist", "41 is certainly optimal, because three separate runs agreed on it", "Runs that agree show that the search is broken, so none can be trusted", "The best tour is the average of all six runs, about 44 km"], a: 0,
      why: "Repeated restarts sample different hills. Reaching 41 three times suggests a wide, attractive hill, but nothing proves a narrow, better one was not missed. Keep the best result, not an average." },
    { type: "slider", q: "The hill that leads to the global optimum covers one fifth of all starting points. A hillclimber is restarted five times from random starts. What is the chance that at least one run climbs the right hill?",
      min: 0, max: 100, step: 5, ans: 67, tol: 10, unit: "%",
      hint: "Chance that every run misses is 0.8 each time: 0.8 × 0.8 = 0.64; × 0.8 ≈ 0.51; × 0.8 ≈ 0.41; × 0.8 ≈ 0.33. So the chance of at least one hit is about 1 − 0.33.",
      why: "All five runs miss with probability 0.8⁵ ≈ 0.33, so at least one hit has probability about 0.67. Restarts help a lot, but they are not a guarantee." },
  ]);

  /* ======================================================================
     l3-landscape
     ====================================================================== */
  const decFn = (x) => 0.55 * Math.exp(-(((x - 0.25) / 0.14) ** 2)) + 1.0 * Math.exp(-(((x - 0.8) / 0.06) ** 2)) + 0.05;
  const deceptiveFig = () => {
    const X = (x) => 16 + x * 528, Y = (v) => 168 - v * 130;
    const d = Array.from({ length: 201 }, (_, i) => `${i ? "L" : "M"}${X(i / 200).toFixed(1)} ${Y(decFn(i / 200)).toFixed(1)}`).join(" ");
    const starts = [[0.12, "1"], [0.3, "2"], [0.42, "3"], [0.72, "4"], [0.9, "5"]];
    return svg(560, 212, `<path d="${d} L${X(1)} 168 L${X(0)} 168 Z" fill="var(--teal-dim)"/><path d="${d}" fill="none" stroke="var(--teal)" stroke-width="3"/>
      ${starts.map(([x, id]) => `<g data-pick="${id}"><circle cx="${X(x)}" cy="${Y(decFn(x))}" r="13" fill="var(--panel)" stroke="var(--rose)" stroke-width="3"/>${tx(X(x), Y(decFn(x)) + 5, id, { f: "900 12px", c: "var(--ink)" })}</g>`).join("")}
      ${tx(280, 200, "position in the search space", { f: "700 11px", c: "var(--text-faint)" })}`);
  };
  const traceFig = () => {
    const X = (s) => 44 + s * 4, Y = (v) => 180 - v * 1.6, A = [], Bp = [], r = rng(5);
    let b = 15;
    for (let s = 0; s <= 100; s += 2) { A.push([X(s), Y(Math.min(72, 15 + 57 * (1 - Math.exp(-s / 7))))]); if (s % 6 === 0 && r() < 0.55) b += 1 + Math.floor(r() * 5); Bp.push([X(s), Y(Math.min(b, 46))]); }
    return svg(480, 222, `${ln(44, 180, 450, 180, "var(--line-2)", 2)}${ln(44, 20, 44, 180, "var(--line-2)", 2)}${path(A, "var(--blue)")}${path(Bp, "var(--amber)")}
      ${tx(X(100) + 14, A[A.length - 1][1] + 4, "A", { c: "var(--blue-ink)", f: "900 15px" })}${tx(X(100) + 14, Bp[Bp.length - 1][1] + 4, "B", { c: "var(--amber-ink)", f: "900 15px" })}
      ${tx(247, 210, "evaluations used", { f: "700 12px", c: "var(--text-faint)" })}<text transform="translate(14,100) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">best fitness so far</text>`);
  };
  const cubeFig = () => {
    const F = { "000": 1, "001": 4, "010": 2, "011": 3, "100": 5, "101": 2, "110": 6, "111": 3 };
    const P = (s) => { const [a, b, c] = s.split("").map(Number); return [70 + 170 * c + 120 * a, 245 - 120 * b - 80 * a]; };
    const keys = Object.keys(F), edges = [];
    keys.forEach((u) => keys.forEach((v) => { if (u < v && [...u].filter((ch, i) => ch !== v[i]).length === 1) edges.push([u, v]); }));
    return svg(440, 290, `${edges.map(([u, v]) => ln(...P(u), ...P(v), "var(--line-2)", 3)).join("")}
      ${keys.map((k) => { const [x, y] = P(k); return `<g data-pick="${k}"><circle cx="${x}" cy="${y}" r="26" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(x, y - 3, k, { f: "800 12px", c: "var(--text-dim)" })}${tx(x, y + 13, "f = " + F[k], { f: "900 13px", c: "var(--ink)" })}</g>`; }).join("")}`);
  };

  B.add("l3-landscape", [
    { type: "pick", q: "A hillclimber that only takes small steps uphill is started at each numbered dot in turn. Click every start from which it ends on the tallest peak.",
      fig: deceptiveFig(), a: ["4", "5"],
      why: "Starts 1, 2 and 3 slope up to the broad, lower hill on the left. Only starts 4 and 5 lie on the narrow tall peak's slopes. The tallest peak has a tiny basin, so most random starts (and the obvious uphill direction) lead away from it. That is a deceptive landscape." },
    { type: "mcq", q: "Run A and Run B tackle the same landscape with the same evaluation budget. One uses small local mutations, the other a mutation that jumps to anywhere. Which reading of the chart is best?",
      fig: traceFig(),
      o: ["A uses small steps: fast climb then stuck on a peak. B uses random jumps: slow, steady gains", "A uses random jumps, because it improves faster. B uses small steps", "A uses small steps, and its flat finish shows it found the global optimum", "Both use small steps, and B simply started on a worse hill"], a: 0,
      why: "Small steps exploit local smoothness, so progress is quick, but it ends on the first peak it reaches (the flat line). A random jump is like random sampling: most jumps land somewhere poor, so best-so-far creeps up slowly, though it never gets trapped." },
    { type: "bug", q: "A student tunes a number x in [0, 100] with a hillclimber, but it climbs no better than random guessing. Click the faulty line.",
      code: ["x = random.uniform(0, 100)", "for step in range(500):", "    m = random.uniform(0, 100)", "    if f(m) >= f(x):", "        x = m", "return x"], a: 2,
      why: "A mutant should be a small change to x, for example x plus a small random amount. Line 3 picks a fresh random position anywhere, which throws away the smoothness of the landscape: the climber is just sampling at random and keeping the best." },
    { type: "pick", q: "Each corner is a 3-bit solution with its fitness (higher is better). A mutation flips one bit, so neighbours are joined by a line. Click every local optimum.",
      fig: cubeFig(), a: ["001", "110"],
      hint: "For each corner check its three neighbours (the corners it is joined to). A local optimum has no neighbour with a higher f.",
      why: "001 (f = 4) has neighbours 000 (1), 011 (3) and 101 (2). 110 (f = 6) has neighbours 111 (3), 100 (5) and 010 (2). Everything else has a higher neighbour. 110 is the global optimum and 001 is a local trap." },
    { type: "slider", q: "A mutation jumps uniformly to anywhere in the search space. Only 2% of all solutions are good. About how many jumps do you expect before one lands on a good solution?",
      min: 0, max: 200, step: 5, ans: 50, tol: 20, unit: "jumps",
      hint: "Two in every hundred is one in fifty.",
      why: "A 2% chance per jump means about 1 in 50 on average: roughly 50 jumps. In real problems the good region is often far smaller than 2%, which is why uncontrolled random jumps are such a poor mutation." },
  ]);

  /* ======================================================================
     l3-neighbourhood
     ====================================================================== */
  const nbGraphFig = () => {
    const N = { P: 3, Q: 5, R: 4, S: 7, T: 6, U: 2, V: 8 }, ks = Object.keys(N), X = (i) => 40 + i * 63, Y = 120;
    const solid = ks.slice(0, -1).map((k, i) => ln(X(i), Y, X(i + 1), Y, "var(--line-2)", 3)).join("");
    const dash = `<path d="M${X(1)} ${Y - 22} Q${(X(1) + X(3)) / 2} ${Y - 84} ${X(3)} ${Y - 22}" fill="none" stroke="var(--violet)" stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round"/>`;
    const nodes = ks.map((k, i) => `<g data-pick="${k}"><circle cx="${X(i)}" cy="${Y}" r="22" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(X(i), Y + 5, k, { f: "900 15px", c: "var(--ink)" })}${tx(X(i), Y + 44, "f = " + N[k], { f: "800 13px", c: "var(--text-dim)" })}</g>`).join("");
    return svg(460, 190, `${solid}${dash}${nodes}${tx(X(2), 24, "new move", { c: "var(--violet-ink)", f: "800 12px" })}`);
  };
  const gridFig = () => {
    const G = [[3, 4, 2, 1], [5, 6, 3, 4], [2, 3, 7, 5], [1, 4, 6, 8]];
    return svg(340, 300, G.map((row, r) => row.map((v, c) => `<g data-pick="r${r}c${c}"><rect x="${20 + c * 76}" y="${10 + r * 70}" width="68" height="62" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(54 + c * 76, 48 + r * 70, v, { f: "900 20px", c: "var(--ink)" })}</g>`).join("")).join(""));
  };

  B.add("l3-neighbourhood", [
    { type: "pick", q: "Seven solutions are linked by the moves of a mutation operator (solid lines); higher f is better. The purple dashed link is an extra move allowed by a new operator. Click every local optimum once both solid and dashed moves are allowed.",
      fig: nbGraphFig(), a: ["S", "V"],
      why: "With the solid moves alone Q (5), S (7) and V (8) are local optima. The new move lets Q step to S (7), so Q stops being a local optimum. S and V still have no better neighbour. Changing the operator changed which solutions are traps." },
    { type: "cat", q: "How does the neighbourhood size grow as the solution gets longer (n bits or n cities)?",
      buckets: ["Constant", "About n", "About n²", "Exponential (about 2ⁿ)"],
      items: [["Flip only the first bit of an n-bit string", 0], ["Flip any one bit of an n-bit string", 1], ["Swap two adjacent cities in an n-city tour (with wrap-around)", 1], ["Swap any two cities in an n-city tour", 2], ["Flip any two bits of an n-bit string", 2], ["Replace the string with any other n-bit string", 3]],
      why: "One choice among n positions gives about n neighbours. Choosing a pair of positions gives about n²/2. 'Any other string' means all 2ⁿ − 1 other strings. A fixed rule such as 'only the first bit' always gives one neighbour." },
    { type: "bug", q: "This function should say whether s is a local optimum when minimising cost. It sometimes says True for a tour that has a better neighbour. Click the faulty line.",
      code: ["def is_local_optimum(s):", "    for m in neighbours(s):", "        if cost(m) < cost(s):", "            return False", "        else:", "            return True", "    return True"], a: 5,
      why: "Returning True inside the loop ends the check after the first neighbour. The answer must be True only after every neighbour has been looked at and none was better, so that return belongs after the loop." },
    { type: "pick", q: "The current tour is ABCDE. A mutation swaps the neighbours B and C, and the new tour ACBDE is drawn. Click the hops in the new tour that were not in ABCDE.",
      fig: NIC.qfig.graph(PENT, [["A", "C"], ["C", "B"], ["B", "D"], ["D", "E"], ["E", "A"]], { pick: "edges", w: 460, h: 262 }), a: ["A-C", "B-D"],
      hint: "ABCDE has the hops A–B, B–C, C–D, D–E and E–A. Compare with the five hops drawn.",
      why: "A–C and B–D are new. C–B is the old hop B–C driven backwards, and D–E and E–A are unchanged. Only two hops differ, so a neighbour's length can be found by adjusting two terms rather than adding up the whole tour." },
    { type: "pick", q: "The grid shows the fitness (higher is better) for two settings dials. A move changes one dial by one notch: up, down, left or right. Click every cell that is a local optimum with those four moves but would stop being one if diagonal moves were also allowed.",
      fig: gridFig(), a: ["r1c1", "r2c2"],
      hint: "For each cell look at all eight surrounding cells. Which cells have a higher diagonal neighbour?",
      why: "The 6 at row 2, column 2 has all four straight neighbours lower, but the 7 sits diagonally. The 7 is likewise beaten diagonally by the 8. The 8 is still best, so it stays a local optimum. More allowed moves means fewer local optima." },
  ]);

  /* ======================================================================
     l3-local
     ====================================================================== */
  const tabuFig = () => {
    const C = [8, 6, 4, 5, 7, 3, 5], X = (i) => 40 + i * 63, Y = 120;
    return svg(460, 190, `${C.slice(0, -1).map((_, i) => ln(X(i), Y, X(i + 1), Y, "var(--line-2)", 3)).join("")}
      ${C.map((c, i) => `<g data-pick="n${i + 1}"><circle cx="${X(i)}" cy="${Y}" r="22" fill="var(--panel)" stroke="${i === 2 ? "var(--rose)" : "var(--line-2)"}" stroke-width="3"/>${tx(X(i), Y + 5, i + 1, { f: "900 15px", c: "var(--ink)" })}${tx(X(i), Y + 44, "cost " + c, { f: "800 12px", c: "var(--text-dim)" })}</g>`).join("")}${tx(X(2), Y - 36, "start", { c: "var(--rose-ink)", f: "800 13px" })}`);
  };
  const mcTraces = () => {
    const cost = (x) => Math.abs(x - 70) * 0.6 + 7 * Math.sin(x / 3.2) + 10;
    const sim = (p, seed) => { const r = rng(seed); let x = 8; const out = [cost(x)]; for (let i = 0; i < 90; i++) { const m = Math.max(0, Math.min(100, x + (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * 3)))); if (cost(m) <= cost(x) || r() < p) x = m; out.push(cost(x)); } return out; };
    const runs = [["A", sim(1, 11)], ["B", sim(0, 11)], ["C", sim(0.1, 11)]];
    const lo = Math.min(...runs.flatMap((r) => r[1])), hi = Math.max(...runs.flatMap((r) => r[1]));
    return svg(480, 200, runs.map(([nm, d], k) => {
      const x0 = 14 + k * 156, X = (i) => x0 + 22 + (i / 90) * 120, Y = (v) => 150 - ((v - lo) / (hi - lo)) * 110;
      return `${ln(x0 + 22, 150, x0 + 142, 150, "var(--line-2)", 2)}${ln(x0 + 22, 30, x0 + 22, 150, "var(--line-2)", 2)}${path(d.map((v, i) => [X(i), Y(v)]), "var(--blue)", 2.5)}${tx(x0 + 82, 22, "Run " + nm, { f: "900 14px" })}${tx(x0 + 82, 172, "steps", { f: "700 11px", c: "var(--text-faint)" })}`;
    }).join("") + `<text transform="translate(8,95) rotate(-90)" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">current cost</text>`);
  };
  const logFig = () => {
    const R = [[1, 12, 10, "yes"], [2, 10, 13, "no"], [3, 10, 11, "yes"], [4, 11, 11, "yes"], [5, 11, 9, "yes"], [6, 9, 14, "yes"]];
    const cols = [40, 140, 260, 380];
    return svg(460, 270, ["step", "current cost", "candidate cost", "moved?"].map((h, i) => tx(cols[i], 20, h, { f: "700 11px", c: "var(--text-faint)" })).join("") +
      R.map((r, i) => `<g data-pick="s${r[0]}"><rect x="10" y="${30 + i * 39}" width="440" height="34" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${r.map((v, j) => tx(cols[j], 53 + i * 39, v, { f: "900 15px", c: "var(--ink)" })).join("")}</g>`).join(""));
  };

  B.add("l3-local", [
    { type: "pick", q: "Cost is to be minimised. Tabu search starts at solution 3, always moves to the cheapest neighbour that is not tabu (even if that costs more), and the tabu list holds the last two solutions it left. Click the solution it is on after three moves.",
      fig: tabuFig(), a: "n6",
      hint: "Move 1: from 3, the neighbours cost 6 and 5, so go to 4 (cost 5); 3 is now tabu. Move 2: from 4 the neighbours are 3 (tabu) and 5. Move 3: from 5, which neighbours are tabu?",
      why: "3 → 4 (cost 5), then 4 → 5 (cost 7, since 3 is tabu), then 5 → 6 (cost 3, since 4 is tabu). The tabu list forces it up and over the bump, which a plain hillclimber stuck at 3 could never do." },
    { type: "match", q: "Three runs of Monte Carlo search start from the same solution. They accept a worse neighbour with probability p = 0, p = 0.1 or p = 1. Match each run to its setting.",
      fig: mcTraces(), pairs: [["Run A", "p = 1"], ["Run B", "p = 0"], ["Run C", "p = 0.1"]],
      why: "With p = 0 the cost never rises and the run freezes in the first valley it finds (flat). With p = 1 every move is accepted, so the cost just jitters about with no trend. A small p mostly goes down, but now and then climbs out of a valley to keep exploring." },
    { type: "bug", q: "This tabu search keeps bouncing back and forth between the same two solutions. Click the faulty line.",
      code: ["tabu = []", "cur = start", "for step in range(steps):", "    cands = [m for m in neighbours(cur) if m not in tabu]", "    nxt = min(cands, key=cost)", "    cur = nxt", "    tabu.append(nxt)", "    tabu = tabu[-5:]"], a: 6,
      why: "The tabu list should hold the places it has just left, so that it can't step straight back. Appending nxt (where it now stands) never blocks the way back. It should append the old solution before cur is changed." },
    { type: "pick", q: "This log comes from a local-search run that minimises cost. Click every row that proves the run was not plain hillclimbing (which never accepts a worse candidate).",
      fig: logFig(), a: ["s3", "s6"],
      why: "In row 3 and row 6 the candidate cost is higher than the current cost, yet it moved. A hillclimber refuses those. Row 4 only moves to an equal cost, which hillclimbing allows, and row 2 refuses a worse one." },
    { type: "order", q: "Put one step of tabu search in order.",
      items: ["List all neighbours of the current solution", "Remove the ones on the tabu list", "Move to the best of the rest, even if it is worse", "Add the solution just left to the tabu list (dropping the oldest)", "Update best-so-far if the new solution beats it"],
      why: "Neighbours come first, then tabu ones are filtered out and the best of the remainder is taken. The solution left behind becomes tabu, and the best-so-far record is separate from where the search stands." },
  ]);

  /* ======================================================================
     l3-population
     ====================================================================== */
  const cutFig = () => {
    const P1 = "11110000", P2 = "00001111", cell = (s, row, y) => s.split("").map((b, i) => `<rect x="${110 + i * 40}" y="${y}" width="36" height="36" rx="8" fill="${b === "1" ? "var(--teal)" : "var(--panel)"}" stroke="var(--line-2)" stroke-width="2"/>${tx(128 + i * 40, y + 24, b, { f: "900 16px", c: b === "1" ? "#fff" : "var(--text)" })}`).join("") + tx(100, y + 24, row, { a: "end", f: "800 13px" }) + tx(444, y + 24, "4 ones", { a: "start", f: "800 12px", c: "var(--text-dim)" });
    const cuts = [1, 2, 3, 4, 5, 6, 7].map((k) => `<g data-pick="c${k}"><rect x="${110 + k * 40 - 22}" y="22" width="24" height="118" fill="transparent"/>${ln(110 + k * 40 - 2, 28, 110 + k * 40 - 2, 134, "var(--violet)", 3, "5 5")}${tx(110 + k * 40 - 2, 158, "cut " + k, { f: "800 11px", c: "var(--violet-ink)" })}</g>`).join("");
    return svg(500, 170, `${cell(P1, "Parent 1", 30)}${cell(P2, "Parent 2", 84)}${cuts}`);
  };
  const runCharts = () => {
    const runs = [
      ["Run 1", (g) => 30 + 30 * (1 - Math.exp(-g / 2.5)), (g) => 100 * Math.exp(-g / 3)],
      ["Run 2", (g) => 30 + 4 * (1 - Math.exp(-g / 10)) + 1.5 * Math.sin(g * 1.3), (g) => 95 - 0.1 * g + 2 * Math.sin(g * 0.9)],
      ["Run 3", (g) => 30 + 62 * (1 - Math.exp(-g / 16)), (g) => 100 * Math.exp(-g / 45)],
    ];
    return svg(480, 214, runs.map(([nm, bf, df], k) => {
      const x0 = 14 + k * 156, X = (g) => x0 + 22 + (g / 50) * 120, Y = (v) => 150 - v * 1.1, b = [], d = [];
      for (let g = 0; g <= 50; g++) { b.push([X(g), Y(bf(g))]); d.push([X(g), Y(df(g))]); }
      return `${ln(x0 + 22, 150, x0 + 142, 150, "var(--line-2)", 2)}${ln(x0 + 22, 38, x0 + 22, 150, "var(--line-2)", 2)}${path(b, "var(--teal)", 3)}${path(d, "var(--amber)", 3, "6 4")}${tx(x0 + 82, 24, nm, { f: "900 14px" })}${tx(x0 + 82, 172, "generation", { f: "700 11px", c: "var(--text-faint)" })}`;
    }).join("") + `${tx(240, 204, "solid green = best fitness, dashed orange = diversity (how different the members are)", { f: "700 11px", c: "var(--text-dim)" })}`);
  };

  B.add("l3-population", [
    { type: "pick", q: "Fitness is the number of 1s (8 is the maximum). Each parent scores 4. A child takes the first k bits from Parent 1 and the rest from Parent 2. Click the cut that gives the best child.",
      fig: cutFig(), a: "c4",
      why: "Cutting after bit 4 joins Parent 1's four 1s (left half) to Parent 2's four 1s (right half), giving 11111111 with fitness 8. Each parent holds a different good half, which is exactly what recombination can combine and mutation alone could not do in one step." },
    { type: "cat", q: "OneMax fitness is the number of 1s. Look at each population of four strings. Is it converged in genes, converged only in fitness, or not converged?",
      buckets: ["Not converged", "Same fitness, different genes", "Identical genes"],
      items: [["10000, 11100, 01111, 11001", 0], ["11111, 01110, 10001, 00011", 0], ["10110, 01101, 11010, 01011", 1], ["01100, 10010, 00101, 11000", 1], ["11100, 11100, 11100, 11100", 2], ["00111, 00111, 00111, 00111", 2]],
      hint: "Count the 1s in each string first. Then ask whether the strings are the same.",
      why: "The first two sets have a mix of scores (1, 3, 4, 3 and 5, 3, 2, 2). In the next two every string has three or two 1s, but the strings differ, so only the fitness has converged. In the last two the genes are identical, which also means the same fitness." },
    { type: "match", q: "Each chart tracks one EA run: best fitness (solid green) and diversity (dashed orange). Match each run to its diagnosis.",
      fig: runCharts(), pairs: [["Run 1", "Premature convergence"], ["Run 2", "Almost no selection pressure"], ["Run 3", "Healthy progress"]],
      why: "Run 1: diversity collapses within a few generations and the best fitness freezes well below the top, so the population has converged too soon. Run 2: diversity stays high but nothing improves, so selection is not favouring the fit. Run 3: fitness climbs while diversity fades slowly." },
    { type: "order", q: "Put the usual story of a population converging in order.",
      items: ["A random, varied population is created", "Selection favours the fitter members", "Copies of good solutions spread through the population", "Members end up with the same genes", "Crossover of identical parents makes nothing new, so progress now relies on mutation"],
      why: "Selection spreads good solutions, which reduces diversity. Once members are alike, crossover just reproduces them. Some convergence is progress, but too much too early leaves only mutation to explore." },
    { type: "bug", q: "This EA is meant to combine two different parents, but its children never contain anything new from recombination. Click the faulty line.",
      code: ["p1 = tournament(pop, size=2)", "p2 = tournament(pop, size=2)", "child = crossover(p1, p1)", "child = mutate(child)", "replace_weakest(pop, child)"], a: 2,
      why: "crossover(p1, p1) mixes a parent with itself, so the child is just a copy of p1 before mutation. It should be crossover(p1, p2) so that material from two different solutions is combined." },
  ]);
})();

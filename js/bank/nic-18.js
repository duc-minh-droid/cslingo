/* ===== bank-w-nic-2.js ===== */
/* NIC revision bank, second set of visual and varied questions, part 2 (l2-approx, l3-*). Numbers verified with node. */
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
    `<div style="max-width:340px"><table class="t matrix"><tr><th></th>${C.map((x) => `<th>${x}</th>`).join("")}</tr>${C.map((a) => `<tr><th>${a}</th>${C.map((b) => (a === b ? `<td class="faint">–</td>` : `<td>${D[a + b] || D[b + a]}</td>`)).join("")}</tr>`).join("")}</table></div>`;
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  };

  /* ======================================================================
     l2-approx
     ====================================================================== */
  const paretoFig = () => {
    const X = (t) => 60 + Math.log10(t / 0.1) * 100,
      Y = (q) => 200 - (q - 60) * 4.2;
    const M = { A: [0.1, 70], B: [1, 85], C: [2, 80], D: [10, 92], E: [30, 90], F: [100, 97], G: [5, 75] };
    const ticks = [
      [0.1, "0.1 s"],
      [1, "1 s"],
      [10, "10 s"],
      [100, "100 s"],
    ]
      .map(
        ([t, l]) =>
          `${ln(X(t), 200, X(t), 205, "var(--line-2)", 2)}${tx(X(t), 222, l, { f: "700 12px", c: "var(--text-faint)" })}`,
      )
      .join("");
    const dots = Object.entries(M)
      .map(
        ([k, [t, q]]) =>
          `<g data-pick="${k}"><circle cx="${X(t)}" cy="${Y(q)}" r="14" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(t), Y(q) + 5, k, { f: "900 14px" })}</g>`,
      )
      .join("");
    return svg(
      460,
      246,
      `${ln(50, 200, 450, 200)}${ln(50, 24, 50, 200)}${ticks}${dots}
      ${tx(250, 242, "time taken (slower to the right)", { f: "700 12px", c: "var(--text-faint)" })}
      <text transform="translate(16,112) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">quality of answer</text>`,
    );
  };

  B.add("l2-approx", [
    {
      type: "pick",
      q: "Each dot is a method for the same routing problem. A method is worth keeping only if no other method is both faster and better. Click every method worth keeping.",
      fig: paretoFig(),
      a: ["A", "B", "D", "F"],
      hint: "Go left to right. A dot is beaten if something to its left is also higher.",
      why: "C is slower than B yet worse, G is slower than B yet worse, and E is slower than D yet worse. A, B, D and F each buy extra quality with extra time, so which one is right depends on the time budget.",
    },
    {
      type: "match",
      q: "Match each job to the kind of method that suits it best.",
      pairs: [
        ["Cable 40 offices cheaply, answer needed instantly", "An exact algorithm (a spanning-tree method)"],
        ["Choose which of 12 items to pack: each is in or out", "Check all 4,096 subsets"],
        ["Plan a 25-stop van route in two seconds", "A fast simple heuristic"],
        ["Redesign a 21-pipe network overnight", "An evolutionary algorithm"],
      ],
      why: "A fast exact method exists for the cable problem. Twelve in-or-out choices give only 4,096 subsets, small enough to check all. A tight deadline needs a quick heuristic, and a long budget on a huge space lets an EA keep improving.",
    },
    {
      type: "slider",
      q: "A computer checks one billion designs per second. A design problem has 1,000,000,000,000,000 designs (a 1 followed by 15 zeros). About how many days does a full exhaustive check take?",
      min: 0,
      max: 40,
      step: 1,
      ans: 12,
      tol: 4,
      unit: "days",
      hint: "10¹⁵ ÷ 10⁹ = 10⁶ seconds. A day is about 100,000 seconds, so a million seconds is about ten days (a bit more, as a day is 86,400 s).",
      why: "A million seconds is about 11.6 days. It looks affordable, but add three more zeros to the design count and the same check takes over 30 years.",
    },
    {
      type: "bug",
      q: "This script estimates how long an exhaustive search of the New York Tunnels network would take, but it reports a tiny time. Click the faulty line.",
      code: [
        "choices = 16",
        "pipes = 21",
        "designs = choices * pipes",
        "seconds = designs / 1e9",
        "print(seconds / 3.15e7, 'years to check everything')",
      ],
      a: 2,
      why: "Each pipe has 16 choices, so the designs multiply: 16 ** 21 (about 2 × 10²⁵). Writing 16 * 21 = 336 treats the choices as if they were added, which hides the explosion.",
    },
    {
      type: "order",
      q: "Put these search spaces in order from fewest designs to most.",
      items: [
        "10 pipes with 2 diameters each",
        "6 pipes with 10 diameters each",
        "12 pipes with 4 diameters each",
        "8 pipes with 16 diameters each",
      ],
      hint: "Count designs as choices multiplied together: 2¹⁰ is about a thousand, 10⁶ a million, 4¹² = 2²⁴ about 17 million, 16⁸ = 2³² about 4 billion.",
      why: "2¹⁰ = 1,024, then 10⁶ = 1,000,000, then 4¹² = 16,777,216, then 16⁸ = 4,294,967,296. The number of pipes alone does not decide the size; the choices per pipe matter as much.",
    },
  ]);

  /* ======================================================================
     l3-recipe
     ====================================================================== */
  const traceRowsFig = () => {
    const R = [
      ["r1", "4 3 3 2 1", "2", "replaced the 1"],
      ["r2", "5 4 4 3 2", "6", "replaced a 4"],
      ["r3", "4 4 3 3 2", "1", "thrown away"],
      ["r4", "6 5 5 2 2", "2", "replaced a 2"],
    ];
    return svg(
      460,
      226,
      `${tx(24, 22, "population", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(190, 22, "child", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(260, 22, "what the EA did", { a: "start", c: "var(--text-faint)", f: "700 11px" })}
      ${R.map(([k, p, c, w], i) => `<g data-pick="${k}"><rect x="12" y="${32 + i * 46}" width="436" height="38" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(24, 56 + i * 46, p, { a: "start", f: "800 15px" })}${tx(190, 56 + i * 46, c, { a: "start", f: "800 15px" })}${tx(260, 56 + i * 46, w, { a: "start", f: "800 14px" })}</g>`).join("")}`,
    );
  };
  const bitsFig = () => {
    const P1 = "11010010",
      P2 = "00111001",
      C = "11011101";
    const row = (y, label, s, ids, col) =>
      `${tx(12, y + 24, label, { a: "start", c: "var(--text-dim)", f: "800 12px" })}${[...s].map((b, i) => `<g ${ids ? `data-pick="c${i}"` : ""}><rect x="${90 + i * 42}" y="${y}" width="36" height="36" rx="8" fill="var(--panel)" stroke="${col}" stroke-width="2.5"/>${tx(108 + i * 42, y + 24, b, { f: "900 16px" })}</g>`).join("")}`;
    return svg(
      460,
      196,
      `${row(10, "Parent 1", P1, false, "var(--blue)")}${row(60, "Parent 2", P2, false, "var(--violet)")}${ln(90 + 3 * 42 - 3, 4, 90 + 3 * 42 - 3, 100, "var(--rose)", 3, "6 5")}${tx(90 + 3 * 42 - 3, 114, "cut after bit 3", { c: "var(--rose-ink)", f: "800 12px" })}${row(140, "Child", C, true, "var(--teal)")}`,
    );
  };

  B.add("l3-recipe", [
    {
      type: "pick",
      q: "Fitness is maximised. The EA's rule is: the child replaces the weakest member if it is at least as good, otherwise it is thrown away. Each row is a separate step. Click the row where the EA broke its own rule.",
      fig: traceRowsFig(),
      a: "r2",
      why: "In row 2 the weakest member is the 2, and the child (6) is better, so the 2 should be replaced. Replacing a 4 throws away a strong member for no reason. Row 4 is fine: a tie still counts as 'at least as good'.",
    },
    {
      type: "pick",
      q: "The child was made by 1-point crossover at the dashed cut (bits 1 to 3 from Parent 1, the rest from Parent 2), and then one bit was mutated. Click the bit that was mutated.",
      fig: bitsFig(),
      a: "c5",
      hint: "First write the child that crossover alone would give, then compare it with the child shown.",
      why: "Crossover alone gives 110 + 11001 = 11011001. The shown child differs in bit 6, where both parents have a 0 but the child has a 1. Only mutation can create a value that neither parent holds.",
    },
    {
      type: "slider",
      q: "A population of 10 has distinct fitness values. A tournament picks two different members at random and keeps the fitter one. What is the chance, in percent, that the single fittest member becomes the parent?",
      min: 0,
      max: 100,
      step: 5,
      ans: 20,
      tol: 6,
      unit: "%",
      hint: "The fittest always wins when it takes part. It takes part if it is one of the 2 members drawn from the 10: 2 out of 10.",
      why: "The best member wins every tournament it enters, and it enters with chance 2/10 = 20%. The worst member can never win (it would need to face someone even weaker), so tournaments favour strong members without being certain.",
    },
    {
      type: "bug",
      q: "This generational EA should keep its population at a fixed size, but it slows down and the memory use grows every generation. Click the faulty line.",
      code: [
        "for generation in range(100):",
        "    children = []",
        "    for _ in range(len(pop)):",
        "        a, b = select(pop), select(pop)",
        "        children.append(mutate(crossover(a, b)))",
        "    pop = pop + children",
      ],
      a: 5,
      why: "In a generational EA the children replace the old population: pop = children. Adding them on top doubles the population every generation, 100 generations means about 2¹⁰⁰ members, and old weak members never leave.",
    },
    {
      type: "match",
      q: "Match each change to an EA with its most likely effect.",
      pairs: [
        ["Tournament size 2 raised to 10", "Everyone becomes alike sooner"],
        ["Mutation flips half the bits of every child", "Search drifts like random guessing"],
        ["Replacing a random member instead of the weakest", "The best member can be lost"],
        [
          "Population 20 raised to 200 on the same budget",
          "Many more evaluations per generation, so fewer generations",
        ],
      ],
      why: "Bigger tournaments raise selection pressure, so the population converges faster. Huge mutation destroys what selection has built. A random victim may be the champion. And a fixed budget spread over a bigger population buys fewer generations.",
    },
  ]);

  /* ======================================================================
     l3-tsp
     ====================================================================== */
  const hexFig = () => {
    const P = { A: [230, 30], B: [380, 90], C: [380, 190], D: [230, 245], E: [80, 190], F: [80, 90] };
    const tour = ["A", "C", "B", "D", "E", "F"];
    const edges = tour.map((c, i) => [c, tour[(i + 1) % 6]]);
    const lines = edges
      .map(
        ([a, b]) =>
          `<g data-pick="${a}${b}"><line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="transparent" stroke-width="18" stroke-linecap="round"/><line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="var(--blue)" stroke-width="4" stroke-linecap="round"/></g>`,
      )
      .join("");
    const nodes = Object.entries(P)
      .map(
        ([k, [x, y]]) =>
          `<circle cx="${x}" cy="${y}" r="15" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2.5" pointer-events="none"/>${tx(x, y + 5, k, { f: "900 14px" })}`,
      )
      .join("");
    return svg(460, 270, `${lines}${nodes}`);
  };
  const D5 = { AB: 4, AC: 9, AD: 3, AE: 7, BC: 5, BD: 8, BE: 6, CD: 2, CE: 9, DE: 4 };

  B.add("l3-tsp", [
    {
      type: "pick",
      q: "This tour is stored as ACBDEF and drawn on the map. A tour that crosses itself can always be made shorter. Click the two hops that cross each other.",
      fig: hexFig(),
      a: ["AC", "BD"],
      hint: "Look for two straight hops that make an X in the middle.",
      why: "A–C and B–D are the two diagonals of the middle rectangle, so they cross. Reversing the stretch CB (giving ABCDEF) swaps two crossing hops for two sides of a quadrilateral, which are shorter than its diagonals.",
    },
    {
      type: "slider",
      q: "A 10-city problem has (10 − 1)! / 2 distinct tours. How many times more distinct tours does a 12-city problem have?",
      min: 0,
      max: 300,
      step: 10,
      ans: 110,
      tol: 25,
      unit: "times more",
      hint: "11! / 2 ÷ (9! / 2) = 11! ÷ 9! = 11 × 10.",
      why: "Most of the product cancels, leaving 11 × 10 = 110. Two extra cities cost 110 times the work, so each new city multiplies the exhaustive-search time by about the number of cities.",
    },
    {
      type: "order",
      q: "Using the distance table, put these tours in order from shortest to longest.",
      fig: mat(["A", "B", "C", "D", "E"], D5),
      items: ["ABCDE", "ACDEB", "ABDCE", "ACEBD"],
      hint: "Add the five hops of each tour, including the road home. ABCDE = 4 + 5 + 2 + 4 + 7.",
      why: "ABCDE = 4 + 5 + 2 + 4 + 7 = 22. ACDEB = 9 + 2 + 4 + 6 + 4 = 25. ABDCE = 4 + 8 + 2 + 9 + 7 = 30. ACEBD = 9 + 9 + 6 + 8 + 3 = 35.",
    },
    {
      type: "cat",
      q: "Five cities A–E. Sort each string: is it the same loop as ABCDE, a different valid tour, or not a tour at all?",
      buckets: ["Same loop as ABCDE", "Valid, but a different loop", "Not a tour"],
      items: [
        ["BCDEA", 0],
        ["EDCBA", 0],
        ["ACBDE", 1],
        ["ABCED", 1],
        ["ABCDD", 2],
        ["ABDE", 2],
      ],
      hint: "ABCDE has the hops AB, BC, CD, DE and EA. The same loop uses exactly these hops.",
      why: "BCDEA starts elsewhere and EDCBA runs backwards, so both use the same five hops. ACBDE and ABCED are permutations but contain other hops. ABCDD repeats D and leaves E out, and ABDE is missing C.",
    },
    {
      type: "bug",
      q: "This validity check should accept a string only if it visits every city exactly once, but it accepts ABCDD. Click the faulty line.",
      code: [
        "def is_valid(tour, cities):",
        "    if len(tour) != len(cities):",
        "        return False",
        "    return set(tour) <= set(cities)",
      ],
      a: 3,
      hint: "For five cities, ABCDD has the right length. Is its set of cities a subset of A–E? Does it contain all of A–E?",
      why: "A subset test only says the letters come from the city list, so repeats pass. Equal length plus set(tour) == set(cities) means no repeats and nothing missing.",
    },
  ]);

  /* ======================================================================
     l3-hc
     ====================================================================== */
  const hcGraphFig = () => {
    const f = { S: 5, a: 7, b: 6, z: 3, c: 9, d: 4, e: 8, g: 5, h: 10, y: 5, t: 7 };
    const P = {
      S: [40, 125],
      a: [130, 50],
      b: [130, 125],
      z: [130, 205],
      c: [230, 28],
      d: [230, 78],
      e: [230, 128],
      g: [230, 175],
      y: [230, 225],
      h: [330, 128],
      t: [330, 225],
    };
    const E = [
      ["S", "a"],
      ["S", "b"],
      ["S", "z"],
      ["a", "c"],
      ["a", "d"],
      ["b", "e"],
      ["b", "g"],
      ["e", "h"],
      ["z", "y"],
      ["y", "t"],
    ];
    const edges = E.map(([a, b]) => ln(P[a][0], P[a][1], P[b][0], P[b][1], "var(--line-2)", 3)).join("");
    const nodes = Object.entries(P)
      .map(
        ([k, [x, y]]) =>
          `<g data-pick="${k}"><circle cx="${x}" cy="${y}" r="19" fill="${k === "S" ? "var(--bg-2)" : "var(--panel)"}" stroke="${k === "S" ? "var(--rose)" : "var(--line-2)"}" stroke-width="3"/>${tx(x, y - 2, k, { f: "800 11px", c: "var(--text-dim)" })}${tx(x, y + 12, f[k], { f: "900 14px" })}</g>`,
      )
      .join("");
    return svg(460, 252, `${edges}${nodes}${tx(410, 60, "S = start", { c: "var(--rose-ink)", f: "800 12px" })}`);
  };

  B.add("l3-hc", [
    {
      type: "pick",
      q: "The number in each circle is its fitness (higher is better) and lines join neighbours. A hillclimber starts at S, picks a random neighbour and moves if it is not lower. Click every circle where it could end up stuck.",
      fig: hcGraphFig(),
      a: ["c", "h"],
      hint: "From S it can only go to a (7) or b (6). Follow every non-decreasing path from there.",
      why: "From S the moves to a and b are accepted, but z (3) is lower and rejected. a leads on to c, a dead end at 9, and b leads to e and then h (10). t is also a local optimum, but reaching it means going down to z and y first, which this climber never does.",
    },
    {
      type: "slider",
      q: "A hillclimber maximises the number of 1s in a 20-bit string by flipping one random bit and accepting if the string is no worse. It now holds 18 ones. About how many mutants must it try, on average, before it finds a strictly better one?",
      min: 0,
      max: 30,
      step: 1,
      ans: 10,
      tol: 3,
      unit: "mutants",
      hint: "A flip only helps if it hits one of the 2 zeros among 20 positions: 2 in 20 is 1 in 10.",
      why: "With 2 zeros out of 20 bits the chance a flip helps is 1/10, so about 10 tries are needed. At 15 ones it was 1 in 4. Hillclimbing gets slower as it nears the top, and it needs many 'no change' steps.",
    },
    {
      type: "bug",
      q: "This hillclimber for tours accepts every mutant, so it behaves like a random walk. Click the faulty line.",
      code: [
        "c = random_tour()",
        "for step in range(5000):",
        "    m = c",
        "    i = random.randrange(len(c))",
        "    m[i], m[(i + 1) % len(c)] = m[(i + 1) % len(c)], m[i]",
        "    if length(m) <= length(c):",
        "        c = m",
      ],
      a: 2,
      why: "m = c does not copy: m and c are the same list, so the swap changes c too and the test compares the tour with itself (always equal, always accepted). The mutant needs its own copy: m = c[:].",
    },
    {
      type: "multi",
      q: "A hillclimber has stopped: none of its neighbours is better. Select all statements that are true.",
      o: [
        "No single mutation of the operator it uses would improve it",
        "A different mutation operator might still find an improvement",
        "Running the same climber ten times longer will probably find a better tour",
        "A restart from another random tour might end somewhere better",
        "The tour it holds is the best tour in the whole search space",
      ],
      a: [0, 1, 3],
      why: "Stuck means a local optimum for that operator. A bigger neighbourhood or a restart can escape it, but more time with the same moves cannot, and a local optimum need not be the global best.",
    },
    {
      type: "match",
      q: "A hillclimber (accepting equal moves) starts in each situation. Match the situation to what happens.",
      pairs: [
        ["On the slope of the tallest hill", "It reaches the global best"],
        ["On the slope of a smaller hill", "It stops at a local optimum"],
        ["Exactly on a hill's highest point", "It stops at once: no neighbour is better"],
        ["In the middle of a wide flat plateau", "It drifts sideways until it finds an edge"],
      ],
      why: "Hillclimbing always follows the hill it starts on. Equal moves are accepted, so a plateau lets it wander, while the top of a hill gives it nowhere better to go.",
    },
  ]);
  Object.assign(partScope, { ln, path, rng, svg, tx });
})();

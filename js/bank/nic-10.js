(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { box, qf, r1a, r1b, r2a, r2b, r3a, r3b, rect, runPanel, svg, tx } = partScope;
  const B = NIC.bank;
  const bars = (vals, names) =>
    vals
      .map(
        (v, i) =>
          `<g data-pick="${names[i]}"><rect x="${20 + i * 52}" y="${120 - v * 11}" width="38" height="${v * 11}" rx="5" fill="var(--violet)"/>${tx(39 + i * 52, 114 - v * 11, v, { z: 12, c: "var(--violet-ink)" })}${tx(39 + i * 52, 142, names[i], { z: 14 })}<rect x="${20 + i * 52}" y="0" width="38" height="150" fill="transparent"/></g>`,
      )
      .join("");
  B.add("l2-generic", [
    {
      type: "pick",
      q: "The population holds 4 individuals. Children have just been made and scored. With update rule 2 (merge old and new, keep the best 4), tap everyone who is in the next population.",
      fig: svg(
        440,
        190,
        `${tx(12, 24, "Parents", { a: "start", z: 12, c: "var(--text-dim)" })}${box("P1", 12, 34, "P1", 7, "var(--blue)")}${box("P2", 98, 34, "P2", 5, "var(--blue)")}${box("P3", 184, 34, "P3", 4, "var(--blue)")}${box("P4", 270, 34, "P4", 2, "var(--blue)")}
        ${tx(12, 112, "Children", { a: "start", z: 12, c: "var(--text-dim)" })}${box("C1", 12, 118, "C1", 6, "var(--amber)")}${box("C2", 98, 118, "C2", 3, "var(--amber)")}${box("C3", 184, 118, "C3", 3, "var(--amber)")}${box("C4", 270, 118, "C4", 1, "var(--amber)")}`,
      ),
      a: ["C1", "P1", "P2", "P3"],
      why: "Merging gives eight individuals with scores 7, 6, 5, 4, 3, 3, 2, 1. The best four are P1 (7), C1 (6), P2 (5) and P3 (4). Under rule 1 (replace everyone) the next population would be only C1 to C4, and the 7 would be lost. With rule 2 the best so far can never disappear.",
    },
    {
      type: "bug",
      q: "A maximising EA runs but its children never improve the population. Click the faulty line.",
      code: [
        "P = random_population(100)",
        "evaluate(P)",
        "while time_left > 0:",
        "    parents = select(P)",
        "    children = vary(parents)",
        "    evaluate(parents)",
        "    P = merge_and_keep_best(P, children, 100)",
      ],
      a: 5,
      why: "The line scores the parents a second time, so the new children have no fitness when the merge needs it. The evaluation step must score the children: evaluate(children).",
    },
    {
      type: "pick",
      q: "Three runs plot best (green) and average (blue) fitness over 20 generations, and the dashed line is the optimum. In one run the population has collapsed to near-identical individuals while still well below the optimum. Tap it.",
      fig: svg(
        480,
        195,
        `${runPanel(4, "Run 1", r1b, r1a, "R1")}${runPanel(164, "Run 2", r2b, r2a, "R2")}${runPanel(324, "Run 3", r3b, r3a, "R3")}`,
      ),
      a: "R1",
      why: "When best and average meet, every individual is about as good as the best, meaning they are nearly copies. In Run 1 that happens at about 80, short of the optimum. Run 2 has a wide gap but little progress (selection too weak). Run 3 keeps a healthy gap while the best climbs.",
    },
    {
      type: "pick",
      q: "Tournament selection draws two individuals at random and the fitter one becomes a parent. Three draws were made: D vs F, B vs H and A vs C. Tap the three parents.",
      fig: svg(
        430,
        190,
        `${bars([4, 8, 6, 2, 9, 5, 3, 7], ["A", "B", "C", "D", "E", "F", "G", "H"])}${tx(80, 178, "Draw 1: D vs F", { z: 13, c: "var(--text-dim)" })}${tx(215, 178, "Draw 2: B vs H", { z: 13, c: "var(--text-dim)" })}${tx(350, 178, "Draw 3: A vs C", { z: 13, c: "var(--text-dim)" })}`,
      ),
      a: ["B", "C", "F"],
      why: "Each draw is won by the higher bar. F (5) beats D (2), B (8) beats H (7) and C (6) beats A (4). E has the best score of all but was not drawn, which is how tournaments keep a weak bias rather than always choosing the very best.",
    },
    {
      type: "cat",
      q: "You move an EA from exam timetabling to antenna design. Which parts must you rewrite, and which stay the same?",
      buckets: ["Changes with the problem", "Same for every problem"],
      items: [
        ["How a candidate is written down (the encoding)", 0],
        ["The fitness function", 0],
        ["The select, vary, update loop", 1],
        ["Mutation that swaps two exams between slots", 0],
        ["Stopping when the time budget runs out", 1],
        ["The rule 'merge old and new, keep the best', for population update", 1],
      ],
      why: "The loop and update rules are generic. Anything that depends on what a candidate looks like or what makes it good (encoding, fitness, and operators that suit the encoding) is problem-specific.",
    },
  ]);

  /* ---------- l2-optim ---------- */
  const sub = ["000", "001", "010", "011", "100", "101", "110", "111"];
  const subW = [0, 72, 50, 122, 40, 112, 90, 162];
  B.add("l2-optim", [
    {
      type: "pick",
      q: "Three items weigh 40, 50 and 72 kg (bits show which are taken, in that order). The bars show each subset's total weight. Fitness is |weight - 100|, minimised. Tap the best subset.",
      fig: svg(
        480,
        230,
        `
        <line x1="20" y1="190" x2="470" y2="190" stroke="var(--line-2)" stroke-width="2"/>
        <line x1="20" y1="${190 - 100 * 0.9}" x2="470" y2="${190 - 100 * 0.9}" stroke="var(--rose)" stroke-width="2" stroke-dasharray="6 5"/>${tx(24, 190 - 100 * 0.9 - 8, "target 100 kg", { a: "start", z: 12, c: "var(--rose-ink)" })}
        ${sub.map((s, i) => `<g data-pick="${s}"><rect x="${30 + i * 55}" y="${190 - subW[i] * 0.9}" width="42" height="${subW[i] * 0.9}" rx="5" fill="var(--blue)"/>${tx(51 + i * 55, 183 - subW[i] * 0.9, subW[i], { z: 12, c: "var(--blue-ink)" })}${tx(51 + i * 55, 212, s, { z: 13 })}<rect x="${30 + i * 55}" y="30" width="42" height="170" fill="transparent"/></g>`).join("")}`,
      ),
      a: "110",
      why: "Closest to 100 on either side wins. 110 weighs 90 (f = 10), 101 weighs 112 (f = 12) and 111 weighs 162 (f = 62). Overshooting is penalised just like undershooting, so a total slightly over 100 is not automatically better.",
    },
    {
      type: "slider",
      q: "Exhaustive search must try every on/off combination of 20 items, and scoring one combination takes 1 millisecond. Roughly how long does the whole search take?",
      min: 0,
      max: 60,
      step: 1,
      ans: 17,
      tol: 7,
      unit: "minutes",
      hint: "2^10 is about 1,000, so 2^20 is about 1,000 x 1,000 = a million. A million milliseconds is 1,000 seconds.",
      why: "20 items give 2^20, about a million combinations. A million milliseconds is 1,000 seconds, a bit under 17 minutes. Adding just 10 more items would multiply that by 1,000.",
    },
    {
      type: "order",
      q: "A rucksack holds at most 10 kg. A candidate's fitness is its total value if it fits, and 0 if it is too heavy. Order the candidates from best fitness to worst.",
      fig: `<table style="border-collapse:collapse;font:800 14px var(--sans);margin:4px auto"><thead><tr style="color:var(--text-dim)"><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Candidate</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Weight (kg)</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Value</th></tr></thead><tbody>
        ${[
          ["A", 8, 12],
          ["B", 11, 20],
          ["C", 10, 14],
          ["D", 6, 9],
          ["E", 9, 13],
        ]
          .map(
            ([n, w, v]) =>
              `<tr><td style="padding:6px 14px;text-align:center">${n}</td><td style="padding:6px 14px;text-align:center">${w}</td><td style="padding:6px 14px;text-align:center">${v}</td></tr>`,
          )
          .join("")}</tbody></table>`,
      items: ["Candidate C", "Candidate E", "Candidate A", "Candidate D", "Candidate B"],
      why: "B is worth the most but weighs 11 kg, so its fitness is 0. C weighs exactly 10 kg, which fits, so it scores 14. Then E 13, A 12, D 9. A fitness function can build a rule such as 'too heavy scores 0' straight into the score.",
    },
    {
      type: "bug",
      q: "The goal is a subset weighing as close to 100 kg as possible, and the EA minimises fitness. It keeps returning a subset that weighs only 5 kg. Click the faulty line.",
      code: ["def fitness(bits):", "    total = sum(w for w, b in zip(weights, bits) if b)", "    return total - 100"],
      a: 2,
      why: "Without a modulus, a light subset gets a very negative number, which looks great to a minimiser. The score needs to measure distance: abs(total - 100).",
    },
    {
      type: "cat",
      q: "Is exhaustive search (try every candidate) practical on a normal computer for these search spaces?",
      buckets: ["Practical", "Not practical"],
      items: [
        ["Six on/off switches", 0],
        ["A three-digit lock code", 0],
        ["Choosing a subset of 40 items", 1],
        ["Any real number x between 0 and 1", 1],
        ["Ordering 15 tasks in a queue", 1],
        ["Picking the best of 200 candidate routes", 0],
      ],
      why: "Six switches give 64 settings, a lock gives 1,000 and 200 routes is tiny. A subset of 40 items gives 2^40, about a trillion. Fifteen tasks give 15! orders, also about a trillion. The real numbers between 0 and 1 are infinitely many.",
    },
    {
      type: "mcq",
      q: "An exhaustive search checks 1,000 candidates in a random order. The chart shows the best fitness found so far (lower is better). It stopped improving at candidate 300. After checking 700, can you stop and be sure 8 is the optimum?",
      fig: svg(
        460,
        220,
        `
        <line x1="50" y1="180" x2="440" y2="180" stroke="var(--line-2)" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="180" stroke="var(--line-2)" stroke-width="2"/>
        ${tx(245, 208, "candidates checked (out of 1,000)", { z: 12, c: "var(--text-dim)" })}${tx(26, 100, "best", { z: 12, c: "var(--text-dim)" })}${tx(26, 115, "so far", { z: 12, c: "var(--text-dim)" })}
        ${tx(50, 196, "0", { z: 11, c: "var(--text-faint)" })}${tx(440, 196, "1,000", { z: 11, c: "var(--text-faint)" })}
        <polyline fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" points="50,30 54,30 54,60 59,60 59,90 62,90 62,110 80,110 80,130 100,130 100,150 170,150 170,168 170,168 440,168"/>
        ${tx(60, 24, "90", { z: 11, a: "start", c: "var(--text-faint)" })}${tx(444, 160, "8", { z: 12, a: "start", c: "var(--teal-ink)" })}
        <line x1="${50 + 390 * 0.7}" y1="20" x2="${50 + 390 * 0.7}" y2="180" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5"/>${tx(50 + 390 * 0.7, 14, "now: 700", { z: 12, c: "var(--amber-ink)" })}`,
      ),
      o: [
        "No: the 300 unchecked candidates could still hold a score below 8",
        "Yes: 400 checks without change show that nothing better exists",
        "Yes: the best-so-far line can only fall, so it must be final",
        "No: only candidates checked after 700 are allowed to count",
      ],
      a: 0,
      why: "Exhaustive search is only guaranteed once every candidate has been checked. A long flat stretch is just evidence, not proof, because the best remaining candidate might be one of the unchecked ones. Stopping early turns it into a heuristic.",
    },
  ]);

  /* ---------- l2-complexity ---------- */
  const growth = (() => {
    const X = (n) => 60 + n * 18,
      Y = (v) => 190 - (v / 160000) * 160;
    const line = (f, c) =>
      `<polyline fill="none" stroke="${c}" stroke-width="3.5" stroke-linejoin="round" points="${Array.from({ length: 21 }, (_, n) => `${X(n)},${Y(f(n)).toFixed(1)}`).join(" ")}"/>`;
    const hit = (f) =>
      `<polyline fill="none" stroke="transparent" stroke-width="22" data-hit="" points="${Array.from({ length: 21 }, (_, n) => `${X(n)},${Y(f(n)).toFixed(1)}`).join(" ")}"/>`;
    return svg(
      480,
      250,
      `
      <line x1="60" y1="190" x2="430" y2="190" stroke="var(--line-2)" stroke-width="2"/><line x1="60" y1="20" x2="60" y2="190" stroke="var(--line-2)" stroke-width="2"/>
      ${[0, 5, 10, 15, 20].map((n) => tx(X(n), 208, n, { z: 11, c: "var(--text-faint)" })).join("")}${tx(245, 230, "n (size of the problem)", { z: 12, c: "var(--text-dim)" })}
      ${tx(44, 34, "160k", { z: 11, a: "end", c: "var(--text-faint)" })}${tx(44, 194, "0", { z: 11, a: "end", c: "var(--text-faint)" })}${tx(18, 110, "steps", { z: 12, c: "var(--text-dim)" })}
      <g data-pick="lin">${line((n) => 5000 * n, "var(--violet)")}${hit((n) => 5000 * n)}</g>
      <g data-pick="poly">${line((n) => n ** 4, "var(--blue)")}${hit((n) => n ** 4)}</g>
      <g data-pick="exp">${line((n) => 1.3 ** n, "var(--rose)")}${hit((n) => 1.3 ** n)}</g>
      ${tx(436, 62, "n⁴", { a: "start", c: "var(--blue-ink)" })}${tx(436, 95, "5000n", { a: "start", c: "var(--violet-ink)" })}${tx(436, 186, "1.3ⁿ", { a: "start", c: "var(--rose-ink)" })}`,
    );
  })();
  const ccol = (i, n, p, e, id) =>
    `<g data-pick="${id}">${rect(14 + i * 90, 10, 82, 120, { f: "var(--panel)" })}${tx(55 + i * 90, 32, "n = " + n, { z: 13 })}${tx(55 + i * 90, 62, "n³", { z: 11, c: "var(--blue-ink)" })}${tx(55 + i * 90, 82, p, { z: 13, c: "var(--blue-ink)" })}${tx(55 + i * 90, 106, "1.5ⁿ", { z: 11, c: "var(--rose-ink)" })}${tx(55 + i * 90, 124, e, { z: 13, c: "var(--rose-ink)" })}</g>`;
  B.add("l2-complexity", [
    {
      type: "pick",
      q: "The chart plots the steps taken by three algorithms for n up to 20. If n kept growing without limit, which curve would end up highest of all? Tap it.",
      fig: growth,
      a: "exp",
      why: "On this chart 1.3^n looks flat, but exponentials always win in the end. 1.3^n overtakes n^4 at about n = 64, and n^4 left 5000n behind long before. Small n fools you, which is why we compare growth, not values at small sizes.",
    },
    {
      type: "match",
      q: "Each algorithm's input grows from n = 20 to n = 21. Match its running-time formula to what happens to its number of steps.",
      pairs: [
        ["n steps (linear)", "About 5% more steps"],
        ["n² steps", "About 10% more steps"],
        ["2ⁿ steps", "Twice as many steps"],
        ["n! steps", "21 times as many steps"],
      ],
      hint: "Linear: 21 against 20. Squared: 441 against 400. Exponential: one more factor of 2. Factorial: one more factor of 21.",
      why: "Polynomials grow by a small percentage when n goes up by one. For 2^n each extra unit doubles the work, and for n! it multiplies the work by the new n, which is how exponential growth runs away.",
    },
    {
      type: "mcq",
      q: "The table shows how long two algorithms took on the same computer. Which of them could still finish n = 100 within a minute?",
      fig: `<table style="border-collapse:collapse;font:800 14px var(--sans);margin:4px auto"><thead><tr style="color:var(--text-dim)"><th style="padding:6px 14px;border-bottom:2px solid var(--line)">n</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Algorithm A</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Algorithm B</th></tr></thead><tbody>
        ${[
          [10, "0.02 s", "0.001 s"],
          [20, "0.08 s", "1 s"],
          [30, "0.18 s", "1,000 s"],
          [40, "0.32 s", "about 12 days"],
        ]
          .map(
            ([n, a, b]) =>
              `<tr><td style="padding:6px 14px;text-align:center">${n}</td><td style="padding:6px 14px;text-align:center">${a}</td><td style="padding:6px 14px;text-align:center">${b}</td></tr>`,
          )
          .join("")}</tbody></table>`,
      o: ["Only A", "Only B", "Both", "Neither"],
      a: 0,
      why: "A's time grows like n squared (doubling n multiplies time by 4), so n = 100 takes about 2 seconds. B is quicker at n = 10 but multiplies by 1,000 for every 10 more, so it is exponential and hopeless by n = 100.",
    },
    {
      type: "pick",
      q: "The table compares a polynomial (n cubed) with an exponential (1.5 to the n). Tap the first column where the exponential becomes the larger one.",
      fig: svg(
        470,
        140,
        `${ccol(0, 5, "125", "7.6", "n5")}${ccol(1, 10, "1,000", "58", "n10")}${ccol(2, 20, "8,000", "3,325", "n20")}${ccol(3, 30, "27,000", "191,751", "n30")}${ccol(4, 40, "64,000", "11 million", "n40")}`,
      ),
      a: "n30",
      why: "At n = 20 the polynomial is still ahead (8,000 against 3,325), so a quick test at that size would favour the exponential method. By n = 30 it has overtaken (191,751 against 27,000), and it pulls further ahead at n = 40.",
    },
    {
      type: "bug",
      q: "This exhaustive search for the subset sum closest to a target takes exponential time. Click the line that causes it.",
      code: [
        "def closest_sum(items, target):",
        "    best = None",
        "    for mask in range(2 ** len(items)):",
        "        total = sum(items[i] for i in range(len(items)) if mask >> i & 1)",
        "        if best is None or abs(total - target) < abs(best - target):",
        "            best = total",
        "    return best",
      ],
      a: 2,
      why: "The loop runs once per subset, and there are 2^n subsets for n items. Each pass of the body is cheap (about n steps), so the number of passes is what makes the whole search exponential.",
    },
    {
      type: "cat",
      q: "The lecture calls a problem easy when a polynomial-time exact method is known, and hard when only exponential ones are known. Which is which? (The size of the search space is not the test.)",
      buckets: ["Easy", "Hard"],
      items: [
        ["Sorting a list of a million names (it has a million factorial possible orders)", 0],
        ["Cheapest cable network linking 50 towns, with no extra rules", 0],
        ["Cheapest cable network where no town may have more than 2 links", 1],
        ["Lowest-energy fold of a 500-amino-acid protein", 1],
        ["Finding the largest number in a list", 0],
        ["Shortest tour through 100 cities", 1],
      ],
      why: "Sorting has an astronomically large space of orders, but a fast method finds the answer without searching it. Plain MST and finding a maximum are also solved fast. Adding a degree limit, folding proteins and touring cities have no known fast exact method.",
    },
  ]);

  /* ---------- l2-mst ---------- */
  const NODES6 = { A: [60, 60], B: [200, 40], C: [340, 60], D: [60, 190], E: [200, 210], F: [340, 190] };
  const NODES5 = { A: [50, 130], B: [180, 50], C: [180, 210], D: [330, 130], E: [420, 60] };
  const HEX = { A: [230, 30], B: [312, 78], C: [312, 178], D: [230, 226], E: [148, 178], F: [148, 78] };
  B.add("l2-mst", [
    {
      type: "pick",
      q: "Prim's algorithm has built the green tree (A, B and C). It now compares candidate edges. Tap every edge that Prim considers at this step.",
      fig: qf((Q) =>
        Q.graph(
          NODES6,
          [
            ["A", "B", 2],
            ["B", "C", 4],
            ["A", "D", 3],
            ["B", "E", 6],
            ["C", "F", 5],
            ["D", "E", 1],
            ["E", "F", 7],
            ["B", "D", 8],
          ],
          {
            pick: "edges",
            w: 400,
            h: 250,
            hl: { "A-B": "var(--teal)", "B-C": "var(--teal)", A: "var(--teal)", B: "var(--teal)", C: "var(--teal)" },
          },
        ),
      ),
      a: ["A-D", "B-E", "C-F", "B-D"],
      why: "Prim only compares edges with exactly one end in the tree and one end outside: A-D, B-D, B-E and C-F. D-E (cost 1) is the cheapest edge in the graph but joins two towns that are both outside the tree, so it is not a candidate yet. Prim would add A-D (3).",
    },
    {
      type: "bug",
      q: "This Prim implementation sometimes picks an edge that closes a loop. Click the faulty line.",
      code: [
        "tree_nodes = {start}",
        "tree_edges = []",
        "while len(tree_nodes) < n:",
        "    candidates = [e for e in edges if e.a in tree_nodes or e.b in tree_nodes]",
        "    e = min(candidates, key=lambda e: e.cost)",
        "    tree_edges.append(e)",
        "    tree_nodes |= {e.a, e.b}",
      ],
      a: 3,
      why: "With 'or', an edge with both ends already in the tree counts as a candidate, and adding it creates a cycle. A candidate must have exactly one end in the tree: (e.a in tree_nodes) != (e.b in tree_nodes).",
    },
    {
      type: "cat",
      q: "Five towns A to E are connected by the links listed. Is each set of links a spanning tree?",
      buckets: ["Spanning tree", "Not a spanning tree"],
      items: [
        ["A-B, B-C, C-D, D-E", 0],
        ["A-B, B-C, C-A, D-E", 1],
        ["A-B, A-C, A-D, A-E", 0],
        ["A-B, B-C, C-D, D-E, E-A", 1],
        ["A-B, C-D, D-E", 1],
        ["A-C, C-E, E-B, B-D", 0],
      ],
      why: "A spanning tree connects every town (no town cut off) with no loops, which means exactly 4 links for 5 towns. The second set has a loop and leaves D and E cut off, the fourth is a ring, and the fifth leaves A and B cut off.",
    },
    {
      type: "mcq",
      q: "Four towns are joined by the links shown: H's three links cost 1 each and the three links between A, B and C cost 4 each. Prim would take all three links from H, but now no town may have more than 2 cables. What is the cheapest valid network that still connects all four towns?",
      fig: qf((Q) =>
        Q.graph(
          { H: [230, 120], A: [80, 50], B: [380, 50], C: [230, 215] },
          [
            ["H", "A", 1],
            ["H", "B", 1],
            ["H", "C", 1],
            ["A", "B", 4],
            ["B", "C", 4],
            ["A", "C", 4],
          ],
          { w: 460, h: 250 },
        ),
      ),
      o: ["3", "5", "6", "9"],
      a: 2,
      why: "H can have only two cables, so the network is a path. With H in the middle it uses two cost-1 links plus one cost-4 link: 1 + 1 + 4 = 6. With H at an end it costs 1 + 4 + 4 = 9. The plain MST costs 3 but gives H three cables, so the constraint raises the cost.",
    },
    {
      type: "order",
      q: "Run Prim's algorithm from A on the network shown. Put the edges in the order Prim adds them.",
      fig: qf((Q) =>
        Q.graph(
          NODES5,
          [
            ["A", "B", 4],
            ["A", "C", 1],
            ["B", "C", 2],
            ["B", "D", 3],
            ["C", "D", 7],
            ["B", "E", 6],
            ["D", "E", 5],
          ],
          { w: 460, h: 250 },
        ),
      ),
      items: ["A-C", "B-C", "B-D", "D-E"],
      why: "From A the cheapest edge is A-C (1). Then B-C (2) is cheapest to a new town. Then B-D (3), then D-E (5) beats B-E (6). The edge A-B (4) is never used because both of its ends are already in the tree, and the total cost is 1 + 2 + 3 + 5 = 11.",
    },
    {
      type: "mcq",
      q: "Six towns are joined in a ring, one cable between each neighbouring pair as shown. How many different spanning trees does this network have?",
      fig: qf((Q) =>
        Q.graph(
          HEX,
          [
            ["A", "B"],
            ["B", "C"],
            ["C", "D"],
            ["D", "E"],
            ["E", "F"],
            ["F", "A"],
          ],
          { w: 460, h: 250 },
        ),
      ),
      o: ["1", "5", "6", "15"],
      a: 2,
      why: "A spanning tree on six towns needs 5 links, so exactly one of the 6 cables must be left out. Removing any one of them breaks the loop and keeps everything connected, which gives 6 different trees. The tempting answer 5 confuses the number of links in a tree with the number of trees.",
    },
  ]);
})();

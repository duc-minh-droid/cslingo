(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { ln, path, rng, svg, tx } = partScope;
  const B = NIC.bank;

  /* ======================================================================
     l3-landscape
     ====================================================================== */
  const miniFig = () => {
    const fn = {
      A: (t) => 1 - Math.pow(2 * t - 1, 2),
      B: (t) => 0.5 + 0.35 * Math.sin(t * 6.5 * Math.PI) * (0.6 + 0.4 * t),
      C: (t) => 0.25 + 0.6 * Math.max(0, 1 - Math.abs(t - 0.7) / 0.12),
      D: (t) => 0.15 + 0.5 * t + 0.7 * Math.exp(-Math.pow((t - 0.1) / 0.03, 2)),
    };
    return svg(
      460,
      150,
      Object.keys(fn)
        .map((k, i) => {
          const x0 = 12 + i * 112,
            pts = [];
          for (let j = 0; j <= 60; j++) {
            const t = j / 60;
            pts.push([x0 + t * 92, 104 - fn[k](t) * 76]);
          }
          return `<rect x="${x0 - 6}" y="8" width="104" height="104" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/>${path(pts, "var(--blue)", 3)}${tx(x0 + 46, 134, "Curve " + k, { f: "900 13px" })}`;
        })
        .join(""),
    );
  };
  const scatterFig = () => {
    const r = rng(7),
      pts = (smooth) =>
        Array.from({ length: 34 }, () => {
          const x = r();
          return [x, smooth ? Math.min(1, Math.max(0, x + (r() - 0.5) * 0.18)) : r()];
        });
    const panel = (k, x0, P) =>
      `<g data-pick="${k}"><rect x="${x0}" y="14" width="196" height="196" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${P.map(([x, y]) => `<circle cx="${(x0 + 12 + x * 172).toFixed(1)}" cy="${(198 - y * 172).toFixed(1)}" r="4" fill="var(--blue)"/>`).join("")}${tx(x0 + 98, 236, "Landscape " + k, { f: "900 13px" })}</g>`;
    return svg(460, 246, `${panel("A", 10, pts(true))}${panel("B", 254, pts(false))}`);
  };
  const intFig = () => {
    const F = [3, 7, 2, 6, 4, 8, 1, 5];
    return `<table class="t"><tr><th>x</th><th>bits</th><th>fitness</th></tr>${F.map((v, i) => `<tr><td>${i}</td><td>${i.toString(2).padStart(3, "0")}</td><td>${v}</td></tr>`).join("")}</table>`;
  };

  B.add("l3-landscape", [
    {
      type: "match",
      q: "Each panel plots fitness (height) against position. Match each curve to its landscape type.",
      fig: miniFig(),
      pairs: [
        ["Curve A", "Unimodal: one smooth peak"],
        ["Curve B", "Multimodal: many peaks"],
        ["Curve C", "Plateau: mostly flat, no hints"],
        ["Curve D", "Deceptive: slopes lead away from the best"],
      ],
      why: "A has one peak. B has several, so a climber gets stuck on whichever it meets. C is flat almost everywhere with one small hill. D rises steadily to the right, but the tallest point is the narrow spike on the left.",
    },
    {
      type: "pick",
      q: "Each dot is one solution: across is its fitness, up is the fitness of one of its neighbours. Click the landscape where hillclimbing should clearly beat random search.",
      fig: scatterFig(),
      a: "A",
      hint: "Hillclimbing works when a neighbour of a good solution is usually good too.",
      why: "In A, neighbours have nearly the same fitness as each other (dots hug the diagonal), so small steps from a good solution give good solutions. In B, a neighbour's fitness says nothing about yours, so hillclimbing has no slope to follow.",
    },
    {
      type: "slider",
      q: "A needle-in-a-haystack problem has 20 bits and exactly one good string, with every other string equally bad. Random search tries 1,000 strings a second. About how long does it take on average to hit the needle?",
      min: 0,
      max: 30,
      step: 1,
      ans: 9,
      tol: 3,
      unit: "minutes",
      hint: "2²⁰ is about a million strings. On average you search half of them: 500,000 tries ÷ 1,000 per second = 500 seconds.",
      why: "About 524,000 tries at 1,000 per second is roughly 520 seconds, nearly 9 minutes. With no slope to follow, nothing beats random search here, and each extra bit doubles the wait.",
    },
    {
      type: "order",
      q: "A hillclimber starts from a random solution on each landscape. Order the landscapes from the one where it is most likely to find the best solution to the one where it is least likely.",
      items: [
        "One smooth peak",
        "Three peaks of similar height",
        "A hundred small ridges",
        "Fitness picked at random for every solution",
      ],
      why: "On one smooth peak it always succeeds. With a few peaks it may land on the wrong one, but restarts help. A hundred ridges trap it almost every time. In a random landscape every move is a coin toss, so it does no better than random search.",
    },
    {
      type: "multi",
      q: "Integers 0 to 7 are stored as 3 bits. Fitness is in the table. Operator A moves x up or down by one (staying in 0 to 7). Operator B flips one bit. Select all statements that are true.",
      fig: intFig(),
      o: [
        "Under A there are four local optima: x = 1, 3, 5 and 7",
        "Under B, x = 5 is the only local optimum",
        "Under B, x = 1 is a local optimum",
        "The landscape is the same under A and B, since the fitness values are the same",
        "A climber at x = 7 using A cannot move, but using B it can reach x = 5",
      ],
      a: [0, 1, 4],
      hint: "Neighbours of 1 (001) under B are 0 (000), 3 (011) and 5 (101).",
      why: "Under A, x = 1, 3, 5 and 7 all beat both neighbours. Under B, x = 1 has a better neighbour (x = 5, fitness 8), and likewise the rest, leaving only x = 5. The operator defines the neighbours, so the same fitness values form a different landscape.",
    },
  ]);

  /* ======================================================================
     l3-neighbourhood
     ====================================================================== */
  const nbRowsFig = () => {
    const R = [
      ["n1", "swap places 1, 2", "BADEFC", 25],
      ["n2", "swap places 2, 3", "ADBEFC", 35],
      ["n3", "swap places 3, 4", "ABEDFC", 36],
      ["n4", "swap places 4, 5", "ABDFEC", 40],
      ["n5", "swap places 5, 6", "ABDECF", 36],
      ["n6", "swap places 6, 1", "CBDEFA", 34],
    ];
    return svg(
      460,
      292,
      `${tx(12, 20, "current tour ABDEFC has length 34 km. Its six neighbours:", { a: "start", f: "800 13px" })}${R.map(([k, op, t, l], i) => `<g data-pick="${k}"><rect x="12" y="${32 + i * 42}" width="436" height="36" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(26, 55 + i * 42, op, { a: "start", f: "700 13px", c: "var(--text-dim)" })}${tx(210, 56 + i * 42, t, { a: "start", f: "900 15px" })}${tx(340, 56 + i * 42, l + " km", { a: "start", f: "800 15px" })}</g>`).join("")}`,
    );
  };

  B.add("l3-neighbourhood", [
    {
      type: "slider",
      q: "Solutions are 8-bit strings. A mutation flips either one bit or two different bits. How many neighbours does each string have?",
      min: 0,
      max: 60,
      step: 1,
      ans: 36,
      tol: 6,
      unit: "neighbours",
      hint: "One flip: 8 ways. Two flips: 8 × 7 ÷ 2 = 28 pairs. Add them.",
      why: "8 single flips plus 28 pairs of flips gives 36. Allowing bigger moves widens the neighbourhood: fewer local optima, but each step has more to check.",
    },
    {
      type: "match",
      q: "Match each mutation operator to the number of neighbours it gives a solution.",
      pairs: [
        ["Flip one bit of a 7-bit string", "7"],
        ["Swap any two of 6 cities", "15"],
        ["Swap adjacent cities in a 6-city path (no wrap-around)", "5"],
        ["Flip exactly two bits of a 5-bit string", "10"],
      ],
      hint: "Choosing 2 positions from n gives n × (n − 1) ÷ 2.",
      why: "7 bits give 7 flips. Pairs of 6 cities: 6 × 5 ÷ 2 = 15. A 6-city path has 5 adjacent pairs. Pairs of 5 bits: 5 × 4 ÷ 2 = 10.",
    },
    {
      type: "pick",
      q: "Cost is minimised and a hillclimber accepts a neighbour that is no longer than the current tour. Click every neighbour it would accept.",
      fig: nbRowsFig(),
      a: ["n1", "n6"],
      hint: "Accept means 34 km or less. Remember the last row is a wrap-around swap of the last and first places.",
      why: "BADEFC (25 km) is better, and CBDEFA (34 km) ties with the current tour, so a hillclimber that accepts equal moves takes it. The others are longer and are rejected.",
    },
    {
      type: "bug",
      q: "This function should list each neighbour (swap of two cities) once, but it returns n × n tours, including unchanged copies and duplicates. Click the faulty line.",
      code: [
        "def neighbours(t):",
        "    out = []",
        "    for i in range(len(t)):",
        "        for j in range(len(t)):",
        "            m = t[:]",
        "            m[i], m[j] = m[j], m[i]",
        "            out.append(m)",
        "    return out",
      ],
      a: 3,
      why: "When j equals i nothing changes, and the pair (i, j) is repeated as (j, i). Starting the inner loop at i + 1 gives each of the n(n − 1)/2 swaps exactly once.",
    },
    {
      type: "order",
      q: "A tour or string has 10 positions. Order these mutation operators from the smallest neighbourhood to the largest.",
      items: [
        "Swap adjacent cities, 10 cities, wrapping around",
        "Swap any two cities, 10 cities",
        "Flip one or two bits of a 10-bit string",
        "Take one city out and put it back at any other place, 10 cities",
      ],
      hint: "10, then 10 × 9 ÷ 2, then 10 plus that, then 9 × 9 (each city has 9 new places, but moving a city one place right equals moving the next one a place left).",
      why: "Adjacent swaps give 10. Any two cities give 45. One or two bit flips give 10 + 45 = 55. Moving one city gives (10 − 1)² = 81 distinct tours, the biggest here.",
    },
  ]);

  /* ======================================================================
     l3-local
     ====================================================================== */
  const runFig = () => {
    const C = [20, 17, 19, 14, 16, 12, 15, 13],
      X = (i) => 70 + i * 50,
      Y = (c) => 214 - (c - 8) * 12;
    const dots = C.map(
      (c, i) =>
        `<g data-pick="s${i + 1}"><circle cx="${X(i)}" cy="${Y(c)}" r="13" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(i), Y(c) + 5, c, { f: "900 12px" })}${tx(X(i), 236, "step " + (i + 1), { f: "700 11px", c: "var(--text-faint)" })}</g>`,
    ).join("");
    return svg(
      460,
      250,
      `${ln(40, 222, 450, 222)}${ln(40, 20, 40, 222)}${path(
        C.map((c, i) => [X(i), Y(c)]),
        "var(--blue)",
        3,
      )}${dots}
      <text transform="translate(14,125) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">cost of current solution</text>`,
    );
  };

  B.add("l3-local", [
    {
      type: "pick",
      q: "A Monte Carlo search minimises cost. Each dot is the cost of its current solution after that step, and the run stops after step 8. Click the step whose solution the search should return.",
      fig: runFig(),
      a: "s6",
      why: "The search should return its best-so-far, the lowest cost seen anywhere in the run: 12 at step 6. The final current solution (13) is not the best, because accepting worse moves lets the current solution drift back up.",
    },
    {
      type: "slider",
      q: "A Monte Carlo search accepts a worse neighbour with probability 0.1. To cross a dip it needs two worse neighbours in a row to be accepted. On average, how many times must it set out into the dip before it gets across?",
      min: 0,
      max: 300,
      step: 10,
      ans: 100,
      tol: 30,
      unit: "attempts",
      hint: "0.1 × 0.1 = 0.01, which is 1 chance in 100.",
      why: "Each attempt succeeds with chance 0.1 × 0.1 = 0.01, so about 100 attempts are needed. Deeper dips get much worse: three worse steps in a row would take about 1,000. Small p crosses only shallow valleys.",
    },
    {
      type: "slider",
      q: "A tabu search looks at all 12 neighbours of its current solution on every step, and a Monte Carlo search looks at one. Both have a budget of 600 evaluations. How many steps does the tabu search make?",
      min: 0,
      max: 100,
      step: 2,
      ans: 50,
      tol: 8,
      unit: "steps",
      hint: "600 ÷ 12: think 60 ÷ 12 = 5, so 600 ÷ 12 = 50.",
      why: "Tabu pays for 12 evaluations per step, so 600 ÷ 12 = 50 steps, while Monte Carlo makes 600. Tabu's steps are better chosen, but there are far fewer of them.",
    },
    {
      type: "match",
      q: "Match each symptom in a local-search run to its most likely cause.",
      pairs: [
        ["It keeps stepping between the same two solutions", "The tabu list is too short, or missing"],
        ["At one step every neighbour is banned", "The tabu list is longer than the neighbourhood can bear"],
        [
          "The answer returned is worse than one seen halfway",
          "The code returned the current solution, not the best-so-far",
        ],
        [
          "Only one neighbour is looked at per step, and some worse moves are taken",
          "It is a Monte Carlo search, not tabu",
        ],
      ],
      why: "A tabu list that is too short lets the search walk straight back. One that is too long can ban the whole neighbourhood. Returning the current solution loses good solutions once worse moves are allowed.",
    },
    {
      type: "multi",
      q: "Select all statements about tabu search that are true.",
      o: [
        "It may move to a worse solution when every allowed neighbour is worse",
        "Solutions leave the tabu list after a while and can be visited again",
        "A solution that has been visited once is banned for the rest of the run",
        "A very short tabu list can still let it circle round a loop of several solutions",
        "It needs a population of solutions to work",
      ],
      a: [0, 1, 3],
      why: "Tabu search always takes the best allowed neighbour, even if worse. Entries expire, so nothing is banned for ever, and a list of only the last 2 solutions cannot stop a cycle of 4. It works with a single current solution.",
    },
  ]);

  /* ======================================================================
     l3-population
     ====================================================================== */
  const mtnFig = () => {
    const f = (x) => 0.55 * Math.exp(-Math.pow((x - 0.22) / 0.1, 2)) + 1.0 * Math.exp(-Math.pow((x - 0.78) / 0.13, 2));
    const X = (x) => 20 + x * 420,
      Y = (v) => 200 - v * 150,
      pts = [];
    for (let i = 0; i <= 100; i++) pts.push([X(i / 100), Y(f(i / 100))]);
    const P = { P1: 0.22, P2: 0.3, P3: 0.6 };
    return svg(
      460,
      236,
      `${ln(14, 200, 446, 200)}${path(pts, "var(--teal)", 4)}${Object.entries(P)
        .map(
          ([k, x]) =>
            `<g data-pick="${k}"><circle cx="${X(x)}" cy="${Y(f(x))}" r="14" fill="var(--panel)" stroke="var(--violet)" stroke-width="3"/>${tx(X(x), Y(f(x)) + 5, k.slice(1), { f: "900 14px" })}</g>`,
        )
        .join("")}${tx(230, 226, "position in the search space", { f: "700 12px", c: "var(--text-faint)" })}`,
    );
  };
  const barsFig = () => {
    const pop = [28, 30, 32, 33, 35],
      mu = [36, 29, 34];
    const cell = (id, x, y, v, c) =>
      `<g data-pick="${id}"><rect x="${x}" y="${y}" width="72" height="40" rx="10" fill="var(--panel)" stroke="${c}" stroke-width="2.5"/>${tx(x + 36, y + 26, v, { f: "900 16px" })}</g>`;
    return svg(
      460,
      188,
      `${tx(12, 20, "population (km)", { a: "start", c: "var(--text-faint)", f: "700 12px" })}${pop.map((v, i) => cell("p" + (i + 1), 12 + i * 88, 30, v, "var(--blue)")).join("")}
      ${tx(12, 112, "mutants, arriving in this order (km)", { a: "start", c: "var(--text-faint)", f: "700 12px" })}${mu.map((v, i) => cell("m" + (i + 1), 12 + i * 88, 122, v, "var(--amber)")).join("")}${["1st", "2nd", "3rd"].map((s, i) => tx(48 + i * 88, 178, s, { f: "700 12px", c: "var(--text-faint)" })).join("")}`,
    );
  };

  B.add("l3-population", [
    {
      type: "pick",
      q: "Fitness is height, and the dots are three members of a population. A greedy rule would replace the lowest member next. Click the member that is most valuable to keep if the aim is to reach the tallest peak.",
      fig: mtnFig(),
      a: "P3",
      why: "Members 1 and 2 are both on the smaller hill. Member 3 is low, but it sits at the foot of the much taller mountain, so small mutations can carry it up to the global best. Keeping poor-looking solutions preserves other regions of the search space.",
    },
    {
      type: "cat",
      q: "Which of these steps need a population, and which work with a single current solution?",
      buckets: ["Needs a population", "Works on one solution"],
      items: [
        ["Selecting parents, favouring the fitter", 0],
        ["Crossover of two parents", 0],
        ["Replacing the weakest member", 0],
        ["Mutating a copy", 1],
        ["Accepting a neighbour that is no worse", 1],
        ["Keeping a tabu list", 1],
      ],
      why: "Selecting, mixing and replacing 'the weakest' all compare members, so they need several. Mutation, the accept test and a tabu list act on one current solution, which is why hillclimbing and tabu search manage with one.",
    },
    {
      type: "pick",
      q: "A steady-state EA minimises tour length. Each mutant replaces the longest tour in the population only if it is shorter. The mutants arrive in the order shown. Click every tour that is in the population at the end.",
      fig: barsFig(),
      a: ["p1", "p2", "p3", "p4", "m2"],
      hint: "36 is not shorter than the longest (35). Then 29 replaces 35. Then 34 meets the new longest, 33.",
      why: "The 36 is rejected, the 29 replaces the 35, and the 34 is not shorter than the new longest (33), so it is rejected too. The population ends as 28, 29, 30, 32 and 33.",
    },
    {
      type: "slider",
      q: "Two parents have 20 bits and differ in exactly 6 places. A child copies each bit from either parent, chosen at random. How many different children are possible?",
      min: 0,
      max: 200,
      step: 4,
      ans: 64,
      tol: 16,
      unit: "children",
      hint: "Where the parents agree, the bit is fixed. Each of the 6 places that differ has 2 choices: 2, 4, 8, 16, 32, 64.",
      why: "The 14 shared bits are fixed, and the 6 differing places give 2⁶ = 64 combinations. Crossover can only recombine what the parents carry. A bit value that neither has needs mutation. If the parents are identical, there is exactly one child.",
    },
    {
      type: "mcq",
      q: "Three EA runs on a problem scored out of 100. Which diagnosis fits the table?",
      fig: `<table class="t"><tr><th></th><th>Tournament size</th><th>Bits flipped per child</th><th>Generation when all members matched</th><th>Best fitness</th></tr><tr><th>Run 1</th><td>2</td><td>1</td><td>90</td><td>96</td></tr><tr><th>Run 2</th><td>10</td><td>1</td><td>8</td><td>70</td></tr><tr><th>Run 3</th><td>2</td><td>15 of 100</td><td>never</td><td>58</td></tr></table>`,
      o: [
        "Run 2: a tournament of 10 made the members alike before good regions were found",
        "Run 1: it took longest to become alike, so it converged too early",
        "Run 3: heavy mutation made every member alike, which stalled progress",
        "No run: becoming alike quickly means that the search is efficient",
      ],
      a: 0,
      why: "Run 2 lost its diversity by generation 8 and got stuck at 70, premature convergence driven by strong selection. Run 1 converged slowly and scored best. Run 3 never converged, so heavy mutation kept it exploring but nothing was kept.",
    },
  ]);
})();

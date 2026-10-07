(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { bars, strip, tbl, txt } = partScope;
  const B = NIC.bank;

  /* ---------- l4-rank ---------- */
  B.add("l4-rank", [
    {
      type: "slider",
      q: "Linear rank selection on 10 individuals (ranks 1 to 10). About what percentage chance does the best individual have of being picked each time?",
      min: 0,
      max: 40,
      step: 2,
      ans: 18,
      tol: 4,
      unit: "%",
      hint: "Ranks 1 to 10 add up to 55, which is about 50. So 10 out of about 55 is roughly 1 in 5.",
      why: "The best has rank 10 out of a total of 1 + 2 + … + 10 = 55, so 10/55 ≈ 18%. This holds whether the best fitness is 11 or 11 million: rank selection only looks at the order.",
    },
    {
      type: "pick",
      q: "Five individuals with fitness 50, 49, 48, 10 and 1. The selection method is switched from roulette to linear rank. Tap every individual whose chance of being picked goes DOWN.",
      fig: bars([50, 49, 48, 10, 1], { ids: ["A", "B", "C", "D", "E"], labels: ["A", "B", "C", "D", "E"], max: 58 }),
      a: ["B", "C"],
      hint: "Roulette shares are fitness ÷ 158, about 32, 31, 30, 6 and 1 per cent. Rank shares are 5, 4, 3, 2 and 1 out of 15: about 33, 27, 20, 13 and 7 per cent.",
      why: "Roulette gives A, B and C about 32%, 31% and 30%, and D and E 6% and 0.6%. Linear rank gives 33%, 27%, 20%, 13% and 7%. B and C lose share because the near-identical top fitnesses are spread out, D and E gain, and A nudges up from 31.6% to 33.3%.",
    },
    {
      type: "multi",
      q: "In which populations would swapping roulette for linear rank selection change the selection probabilities a lot?",
      o: [
        "One individual is 1,000 times fitter than all the others",
        "Fitnesses are 10, 20, 30 and 40",
        "Fitnesses are 90, 91, 92 and 93",
        "Every fitness is multiplied by 5",
        "Fitnesses are 2, 4, 6 and 8",
      ],
      a: [0, 2],
      why: "A huge outlier takes nearly the whole roulette wheel but only its rank slice under rank selection. Near-identical fitnesses give an almost flat wheel, while ranks still spread 10%, 20%, 30% and 40%. For 10, 20, 30, 40 (and 2, 4, 6, 8) the fitness shares happen to be 10%, 20%, 30%, 40%, the same as the rank shares, and multiplying by 5 changes neither.",
    },
    {
      type: "bug",
      q: "Rank-based selection with an exponent b should turn the weights into probabilities. Tap the faulty line.",
      code: [
        "ranks = list(range(1, P + 1))",
        "weights = [r ** b for r in ranks]",
        "total = sum(ranks)",
        "probs = [w / total for w in weights]",
      ],
      a: 2,
      why: "The probabilities must be divided by the sum of the weights, not the sum of the plain ranks. With b = 2 and 3 individuals the weights are 1, 4, 9 (total 14), but the code divides by 6, giving probabilities that add up to more than 1. It should be total = sum(weights).",
    },
  ]);

  /* ---------- l4-tournament ---------- */
  B.add("l4-tournament", [
    {
      type: "slider",
      q: "Tournaments of size 4 draw their entrants with replacement from a huge population. About what percentage of winners come from the worse half?",
      min: 0,
      max: 50,
      step: 1,
      ans: 6,
      tol: 2,
      unit: "%",
      hint: "All 4 entrants must be from the worse half: (1/2) × (1/2) × (1/2) × (1/2) = 1/16.",
      why: "The winner is from the worse half only if every entrant is, which is 1/16 ≈ 6%. With size 2 it would be 1/4 = 25%, and with size 1 it would be 50% (no selection at all).",
    },
    {
      type: "pick",
      q: "Tournaments of size 3, with replacement, pick the highest fitness. Here is a log of five of them. Tap the one tournament that cannot be right.",
      fig: tbl(
        ["#", "Entrants", "Winner"],
        [
          ["1", "4, 9, 6", "9"],
          ["2", "7, 7, 2", "7"],
          ["3", "5, 8, 3", "5"],
          ["4", "6, 2, 6", "6"],
          ["5", "1, 3, 9", "9"],
        ],
        ["t1", "t2", "t3", "t4", "t5"],
      ),
      a: "t3",
      why: "In tournament 3 the entrant with fitness 8 beats the 5, so 5 cannot be the winner. The repeated entrants in tournaments 2 and 4 are fine, because drawing with replacement lets the same individual enter twice.",
    },
    {
      type: "match",
      q: "Match each tournament setting to its effect.",
      pairs: [
        ["t = 1", "Same as picking at random"],
        ["t = 2", "Gentle pressure; weak individuals still win sometimes"],
        ["t = 20 in a population of 25", "The best wins almost every time"],
        ["t = 3, but the fitnesses are all doubled", "No change at all"],
      ],
      why: "One entrant means no contest. Two entrants favour the better one but leave plenty of chances for the weaker. A tournament that includes most of the population nearly always contains the best. Tournaments compare fitnesses, so doubling them (any order-preserving change) changes nothing.",
    },
    {
      type: "mcq",
      q: "500 tournaments were run on five ranked individuals, entrants drawn with replacement. The wins by rank are shown. Which tournament size was used?",
      fig: bars([244, 148, 76, 28, 4], { labels: ["Best", "2nd", "3rd", "4th", "Worst"], max: 290, h: 200 }),
      o: ["1", "2", "3", "6"],
      a: 2,
      hint: "With size t, the best wins unless all entrants avoid it: 1 − (4/5)^t. At t = 3, (4/5)^3 ≈ 0.51.",
      why: "The best wins 244 of 500, about 49%. For t = 3 the chance is 1 − 0.8³ ≈ 49%. Size 1 would give about 100 wins to everyone, size 2 would give the best about 36%, and size 6 would give the best about 74%.",
    },
    {
      type: "multi",
      q: "Which statements about tournament selection are true?",
      o: [
        "Selecting a parent needs the fitness of only the entrants, not the whole population",
        "With replacement, a size 2 tournament can contain the same individual twice",
        "Doubling every fitness can change who wins",
        "For minimisation, picking the lowest cost in the tournament works unchanged",
        "The worst individual can never win",
      ],
      a: [0, 1, 3],
      why: "Only the entrants are compared, which is why tournaments suit huge or distributed populations. Drawing with replacement allows duplicates. Only the order matters, so doubling does nothing. Minimising just flips which entrant is kept. And the worst can win if it is drawn alone (for example both entrants of a binary tournament), a chance of 1/N² for a population of N.",
    },
  ]);

  /* ---------- l4-mutation ---------- */
  const gaussFig = (() => {
    const x0 = 40,
      u = 44,
      base = 150,
      hh = 100;
    const curve = (s, c, id) => {
      const pts = [];
      for (let x = 0; x <= 10; x += 0.25)
        pts.push(`${(x0 + x * u).toFixed(1)} ${(base - hh * Math.exp(-((x - 5) ** 2) / (2 * s * s))).toFixed(1)}`);
      const d = "M" + pts.join(" L");
      return `<g data-pick="${id}"><path d="${d}" fill="none" stroke="transparent" stroke-width="20" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/></g>`;
    };
    const ticks = [0, 5, 9, 10].map((t) => txt(x0 + t * u, base + 18, t, { s: 12, c: "var(--text-dim)" })).join("");
    const cols = ["var(--teal)", "var(--blue)", "var(--amber)"],
      names = ["A", "B", "C"];
    const leg = [
      ["σ = 0.3", 0],
      ["σ = 1.5", 1],
      ["σ = 4", 2],
    ];
    return `<svg viewBox="0 0 520 200" style="max-height:200px"><line x1="30" x2="490" y1="${base}" y2="${base}" stroke="var(--line-2)" stroke-width="2"/>${curve(4, cols[2], "C")}${curve(1.5, cols[1], "B")}${curve(0.3, cols[0], "A")}${ticks}<line x1="${x0 + 9 * u}" x2="${x0 + 9 * u}" y1="40" y2="${base}" stroke="var(--rose)" stroke-width="3" stroke-dasharray="6 4"/>${txt(x0 + 9 * u, 34, "better peak", { s: 12, c: "var(--rose-ink)" })}${txt(x0 + 5 * u, 34, "parent", { s: 12, c: "var(--text-dim)" })}${leg.map(([l, i]) => `<circle cx="${40 + i * 110}" cy="188" r="6" fill="${cols[i]}"/>${txt(52 + i * 110, 193, names[i] + ": " + l, { a: "start", s: 12 })}`).join("")}</svg>`;
  })();
  const bitRow = (label, bits, y) =>
    txt(10, y + 21, label, { a: "start", s: 13 }) +
    strip(
      bits.split("").map((b) => [b]),
      80,
      y,
      { cw: 32, ch: 30 },
    );
  const bitFig = (() => {
    const rows = [
      ["Parent", "1011001010"],
      ["Child A", "1011001010"],
      ["Child B", "1011101010"],
      ["Child C", "1011001011"],
      ["Child D", "0010001110"],
    ];
    const body = rows
      .map(([l, b], i) =>
        i === 0
          ? bitRow(l, b, 8)
          : `<g data-pick="${l.slice(-1)}"><rect x="4" y="${46 + (i - 1) * 40}" width="402" height="36" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${bitRow(l, b, 49 + (i - 1) * 40)}</g>`,
      )
      .join("");
    return `<svg viewBox="0 0 410 210" style="max-height:210px;max-width:430px">${body}</svg>`;
  })();
  B.add("l4-mutation", [
    {
      type: "pick",
      q: "A search is stuck on a local peak at 5, and the better peak is at 9. Each curve shows how far a Gaussian mutation with that σ is likely to move the gene (curves are scaled to the same height). Tap the one that gives the best chance of landing at the better peak in one mutation.",
      fig: gaussFig,
      a: "C",
      why: "At 9 (four units away) the σ = 0.3 and σ = 1.5 curves are essentially zero, while σ = 4 still has a real chance (about 6% to land within 0.5 of 9). The price: a wide curve rarely makes small, precise improvements. That is the trade-off between exploring and fine tuning.",
    },
    {
      type: "multi",
      q: "Bit-flip mutation flips each bit independently with probability 1/L on an L-bit string. Which statements are true?",
      o: [
        "A child usually differs from its parent by about one bit on average",
        "Most children are exact copies of the parent, well over half",
        "Any bit string can in principle be reached from any parent in one step",
        "A child with 3 or more flips is rare, under 10% of children",
        "Raising the rate to 10/L keeps children very close to their parents",
      ],
      a: [0, 2, 3],
      why: "The average number of flips is L × 1/L = 1. About 37% of children are exact copies and 37% have one flip, 18% have two, and 3 or more is only about 8%. In principle every string is reachable, just with a vanishing probability. A rate of 10/L would mean about 10 flips, so children would be far from the parent.",
    },
    {
      type: "bug",
      q: "Gaussian mutation should nudge one gene a little. Tap the faulty line.",
      code: [
        "def mutate(parent, sigma):",
        "    child = parent[:]",
        "    i = random.randrange(len(child))",
        "    child[i] = random.gauss(0, sigma)",
        "    return child",
      ],
      a: 3,
      why: "The gene is replaced by a fresh number near 0, wiping out its old value, which is a big jump rather than a nudge. It should add noise to the existing value: child[i] += random.gauss(0, sigma).",
    },
    {
      type: "pick",
      q: "Each bit of the parent is flipped independently with probability 1 in 10. Tap the child string that this mutation is MOST likely to produce (this exact string).",
      fig: bitFig,
      a: "A",
      hint: "Each unflipped bit has a 0.9 chance and each flipped bit has a 0.1 chance. Count how many bits differ from the parent.",
      why: "A is identical to the parent, so no bit flips: 0.9 to the power 10, about 35%. B and C each need one exact flip (about 3.9% each), and D differs in three bits (about 0.05%). A single specific string with fewer changes is always more likely under a low mutation rate, so staying put is the most common single outcome.",
    },
    {
      type: "pick",
      q: "A hill climber tried four step sizes. Progress per mutation is the chance of an improvement multiplied by the average gain when it works. Tap the step size with the best progress.",
      fig: tbl(
        ["Step size (sigma)", "Chance a mutant is better", "Average gain when better"],
        [
          ["0.01", "50%", "0.01"],
          ["0.1", "30%", "0.1"],
          ["1", "10%", "0.2"],
          ["10", "1%", "0.5"],
        ],
        ["r1", "r2", "r3", "r4"],
      ),
      a: "r2",
      hint: "Multiply the two columns: 50% of 0.01 is 0.005. 30% of 0.1 is 0.03.",
      why: "The products are 0.005, 0.03, 0.02 and 0.005. Tiny steps succeed often but gain almost nothing. Huge steps gain a lot but almost never succeed. The best step size sits in the middle, which is the idea behind adapting σ during a run.",
    },
  ]);

  /* ---------- l4-crossover ---------- */
  const blockFig = (() => {
    const x0 = 50,
      cw = 50;
    const p1 = [0, 1, 1, 1, 0, 0, 0, 0],
      p2 = [0, 0, 0, 0, 0, 1, 1, 1];
    const row = (g, y, lab, good) =>
      txt(8, y + 26, lab, { a: "start", s: 13 }) +
      g
        .map(
          (v, i) =>
            `<rect x="${x0 + 50 + i * cw}" y="${y}" width="${cw - 4}" height="${cw - 8}" rx="8" fill="${good.includes(i) ? "var(--teal)" : "var(--bg-2)"}" fill-opacity="${good.includes(i) ? ".85" : "1"}" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + 50 + i * cw + (cw - 4) / 2, y + 26, v, { c: good.includes(i) ? "#fff" : "var(--text)", s: 14 })}`,
        )
        .join("");
    const gaps = Array.from(
      { length: 7 },
      (_, i) =>
        `<g data-pick="g${i + 1}"><rect x="${x0 + 50 + (i + 1) * cw - 18}" y="112" width="26" height="36" rx="7" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + 50 + (i + 1) * cw - 5, 135, "g" + (i + 1), { s: 12, c: "var(--text-dim)" })}</g>`,
    ).join("");
    return `<svg viewBox="0 0 520 160" style="max-height:160px">${row(p1, 8, "P1", [1, 2, 3])}${row(p2, 58, "P2", [5, 6, 7])}${gaps}</svg>`;
  })();
  const cutKids = (() => {
    const kids = [
      ["11000111", "k1"],
      ["00111100", "k2"],
      ["10100111", "k3"],
      ["11111100", "k4"],
    ];
    return `<svg viewBox="0 0 440 215" style="max-height:215px;max-width:480px">${txt(8, 26, "P1", { a: "start" })}${strip(
      "11111111".split("").map((c) => [c, "var(--blue)", "#fff"]),
      70,
      8,
      { cw: 34, ch: 28 },
    )}${txt(8, 62, "P2", { a: "start" })}${strip(
      "00000000".split("").map((c) => [c, "var(--amber)", "#fff"]),
      70,
      44,
      { cw: 34, ch: 28 },
    )}${kids
      .map(
        ([s, id], i) =>
          `<g data-pick="${id}"><rect x="4" y="${82 + i * 33}" width="352" height="30" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(30, 103 + i * 33, "Child " + (i + 1), { s: 12 })}${strip(
            s.split("").map((c) => [c]),
            70,
            84 + i * 33,
            { cw: 34, ch: 26 },
          )}</g>`,
      )
      .join("")}</svg>`;
  })();
  B.add("l4-crossover", [
    {
      type: "slider",
      q: "1-point crossover on 8 genes picks one of the 7 gaps uniformly at random. About what percentage of the time are genes 3 and 4 (neighbours) split between the two parents?",
      min: 0,
      max: 100,
      step: 2,
      ans: 14,
      tol: 5,
      unit: "%",
      hint: "Genes 3 and 4 are split only if the cut is in the one gap between them. That is 1 gap out of 7.",
      why: "Only the single gap between genes 3 and 4 separates them: 1/7 ≈ 14%. Genes 1 and 8, at opposite ends, are split every time. This is positional bias: 1-point crossover keeps neighbours together, which helps when related genes sit next to each other and hurts when they do not.",
    },
    {
      type: "pick",
      q: "Parent 1 has a good block (the three green genes). So does parent 2. Tap every cut gap where 1-point crossover (parent 1 before the cut, parent 2 after it) gives a child with BOTH good blocks.",
      fig: blockFig,
      a: ["g4", "g5"],
      why: "Genes 2 to 4 must come from parent 1, so the cut must be at gap g4 or later. Genes 6 to 8 must come from parent 2, so the cut must be at gap g5 or earlier. Only g4 and g5 satisfy both. Cuts inside a block, such as g2, g3, g6 and g7, break one.",
    },
    {
      type: "match",
      q: "Match each operator to its trait.",
      pairs: [
        ["1-point", "Keeps long runs of neighbouring genes together"],
        ["Uniform", "Any two genes are equally likely to be split"],
        ["2-point", "Swaps a block in the middle"],
        ["Mask of all 0s", "The child is a copy of parent 1"],
      ],
      why: "A single cut leaves two long blocks. Uniform crossover tosses a coin per gene, so position does not matter. Two cuts swap the segment between them. A mask that never takes parent 2's genes just clones parent 1.",
    },
    {
      type: "slider",
      q: "Two parents differ at exactly 3 of their 10 genes. How many different children can uniform crossover (a free choice of parent at every gene) produce?",
      min: 0,
      max: 16,
      step: 1,
      ans: 8,
      tol: 1,
      unit: " children",
      hint: "The 7 genes where the parents agree give no choice. Each of the 3 differing genes has 2 options: 2 × 2 × 2.",
      why: "Where parents agree, the child's gene is fixed. At each of the 3 differing genes it can come from either parent: 2³ = 8 children. Crossover can only recombine what the parents already have; it never creates a new gene value.",
    },
    {
      type: "pick",
      q: "Parents are 11111111 and 00000000. Tap the child that cannot be made by 2-point crossover.",
      fig: cutKids,
      a: "k3",
      why: "2-point crossover cuts twice, so the source changes at most twice along the child. Child 3 (10100111) switches parent four times: 1, 0, 1, 0, 1 across the string. Child 1 changes twice, child 2 changes twice (a swapped middle) and child 4 changes once, which is a 2-point cut at the very end.",
    },
  ]);

  /* ---------- l4-lab ---------- */
  const divFig = (() => {
    const cols = [
      ["t = 1", 10, 99, "var(--teal)"],
      ["t = 3", 5, 112, "var(--blue)"],
      ["t = 30", 1, 135, "var(--rose)"],
    ];
    const w = 520,
      h = 230;
    const body = cols
      .map(([l, d, b, c], i) => {
        const x = 60 + i * 150,
          bh = d * 11;
        return `<g data-pick="${l.replace(/\D/g, "")}"><rect x="${x - 10}" y="28" width="120" height="172" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/><rect x="${x + 10}" y="${170 - bh}" width="60" height="${bh}" rx="6" fill="${c}" fill-opacity=".85" stroke="var(--line-2)" stroke-width="2"/>${txt(x + 40, 164 - bh, "div " + d + "%", { s: 12 })}${txt(x + 40, 188, l, { s: 14 })}${txt(x + 40, 18, "best " + b + "/144", { s: 12, c: "var(--text-dim)" })}</g>`;
      })
      .join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${body}${txt(260, 222, "Population of 30, after 600 evaluations (average of 10 runs)", { s: 11, c: "var(--text-faint)" })}</svg>`;
  })();
  Object.assign(partScope, { divFig });
})();

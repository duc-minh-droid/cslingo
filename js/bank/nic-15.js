(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { bars, strip, txt } = partScope;
  const B = NIC.bank;

  /* ---------- l4-rank ---------- */
  B.add("l4-rank", [
    {
      type: "pick",
      q: "Linear rank selection with these five individuals. Tap the one that has a 20% chance of being picked.",
      fig: bars([9, 40, 7, 22, 15], { ids: ["A", "B", "C", "D", "E"], labels: ["A", "B", "C", "D", "E"], max: 48 }),
      a: "E",
      why: "Sort by fitness: B 40 is rank 5, D 22 is rank 4, E 15 is rank 3, A 9 is rank 2, C 7 is rank 1. The ranks add up to 15, so rank 3 gives 3/15 = 20%.",
    },
    {
      type: "order",
      q: "Population of 4 where lower cost is better, using linear rank selection. Put the individuals from MOST likely to be picked to LEAST likely.",
      items: ["Cost 7", "Cost 12", "Cost 25", "Cost 40"],
      why: "When minimising, rank the other way: the lowest cost gets the top rank. Cost 7 gets rank 4 (40%), then 12 (30%), 25 (20%) and 40 (10%).",
    },
    {
      type: "cat",
      q: "Which selection method does each statement describe?",
      buckets: ["Roulette only", "Rank only", "Both"],
      items: [
        ["Adding 50 to every fitness changes the probabilities", 0],
        ["Needs the population sorted first", 1],
        ["One superfit individual can take almost the whole wheel", 0],
        ["Multiplying every fitness by 10 changes nothing", 2],
        ["Probabilities depend only on the order of the individuals", 1],
        ["Two individuals whose fitness differs by 0.001 can get quite different chances", 1],
      ],
      why: "Roulette depends on the sizes of fitness values, so shifting breaks it and a giant value takes over, yet scaling everything by the same factor leaves shares alone. Rank uses only order, so shifts and giants do not matter, but it also exaggerates tiny gaps.",
    },
    {
      type: "mcq",
      q: "Linear rank selection on 6 individuals (ranks 1 to 6, total 21). How do the selection-probability gaps compare for the pair 10 vs 9.9 and the pair 9.8 vs 1?",
      fig: bars([10, 9.9, 9.8, 1, 0.9, 0.8], { labels: ["#1", "#2", "#3", "#4", "#5", "#6"], max: 12 }),
      o: [
        "Equal: each pair is one rank step apart",
        "Larger for 9.8 vs 1 because the fitness gap is bigger",
        "Larger for 10 vs 9.9 because leaders matter more",
        "Unknown without the total fitness of the population",
      ],
      a: 0,
      why: "Rank selection ignores the size of fitness gaps. 10 and 9.9 are ranks 6 and 5; 9.8 and 1 are ranks 4 and 3. Each pair differs by one rank, which is 1/21 of the wheel in both cases. That is a strength against giants and a weakness when gaps really matter.",
    },
    {
      type: "bug",
      q: "This should give the BEST individual the biggest slice under linear rank selection. Tap the faulty line.",
      code: [
        "order = sorted(pop, key=lambda x: x.fit, reverse=True)   # best first",
        "for i, ind in enumerate(order):",
        "    ind.rank = i + 1",
        "total = P * (P + 1) / 2",
        "probs = [ind.rank / total for ind in order]",
      ],
      a: 2,
      why: "The list is sorted best first, so i = 0 is the best, and rank = i + 1 gives the best rank 1, the smallest slice. The best must get rank P, for example rank = P - i.",
    },
  ]);

  /* ---------- l4-tournament ---------- */
  const chartFig = (vals, title) => {
    const ids = ["Best", "2nd", "3rd", "4th", "Worst"];
    return `<svg viewBox="0 0 520 190" style="max-height:190px">${txt(260, 16, title, { s: 14 })}${vals
      .map((v, i) => {
        const x = 30 + i * 96,
          hh = v * 1.9;
        return `<rect x="${x}" y="${165 - hh}" width="64" height="${hh}" rx="6" fill="var(--violet)" fill-opacity=".8" stroke="var(--line-2)" stroke-width="2"/>${txt(x + 32, 159 - hh, v + "%", { s: 12 })}${txt(x + 32, 183, ids[i], { s: 12 })}`;
      })
      .join("")}</svg>`;
  };
  B.add("l4-tournament", [
    {
      type: "pick",
      q: "Tournaments of size 3 are drawn WITHOUT replacement from these six individuals. Tap every individual that can never win one.",
      fig: bars([8, 3, 6, 9, 2, 5], {
        ids: ["F1", "F2", "F3", "F4", "F5", "F6"],
        labels: ["F1", "F2", "F3", "F4", "F5", "F6"],
        max: 11,
      }),
      a: ["F2", "F5"],
      why: "To win, an individual needs the other two entrants to be weaker. F5 (2) and F2 (3) are the two weakest, so there are never two weaker individuals to share the tournament with. F6 (5) can win if F2 and F5 are drawn with it. With replacement they could win by being drawn three times.",
    },
    {
      type: "cat",
      q: "What happens to tournament selection pressure?",
      buckets: ["Raises pressure", "Lowers pressure", "No change"],
      items: [
        ["Tournament size grows from 3 to 8", 0],
        ["Tournament size shrinks from 6 to 2", 1],
        ["Every fitness is multiplied by 1000", 2],
        ["The best individual's fitness is made 1000 times larger, others stay", 2],
        ["Tournament size shrinks from 2 to 1", 1],
        ["1000 is added to every fitness", 2],
      ],
      why: "A tournament only compares who is better, so any change that keeps the order the same does nothing. Pressure moves only with the tournament size: bigger means the winner is more likely to be near the top.",
    },
    {
      type: "mcq",
      q: "Chart A shows each rank's chance of winning a tournament of size 2 (with replacement) in a population of 5. Chart B is the same population with one setting changed. What changed?",
      fig: `<svg viewBox="0 0 520 380" style="max-height:380px"><g>${chartFig([36, 28, 20, 12, 4], "Chart A: size 2").replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g><g transform="translate(0 190)">${chartFig([49, 30, 15, 6, 1], "Chart B").replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></svg>`,
      o: [
        "A larger tournament size",
        "A smaller tournament size",
        "Drawing the entrants without replacement",
        "A population twice as big",
      ],
      a: 0,
      why: "Chart B puts more weight on the best (49% against 36%) and less on the rest, so the pressure is higher: a larger tournament. Without replacement the worst could never win (0%), and a bigger population would not stay at 5 slots.",
    },
    {
      type: "bug",
      q: "This tournament should return the fittest of t random entrants (maximising). Tap the faulty line.",
      code: [
        "def tournament(pop, t):",
        "    best = None",
        "    for _ in range(t):",
        "        cand = random.choice(pop)",
        "        if best is None or cand.fit < best.fit:",
        "            best = cand",
        "    return best",
      ],
      a: 4,
      why: "The comparison keeps the weaker candidate, so the function returns the worst of the entrants. It should keep cand when cand.fit > best.fit.",
    },
    {
      type: "multi",
      q: "When is tournament selection a better fit than roulette?",
      o: [
        "Some fitness values are negative",
        "The population is spread over many machines, so adding up all fitness values is awkward",
        "You want one simple dial (t) for how greedy selection is",
        "You need probabilities exactly proportional to fitness",
        "You must sort the whole population before every selection",
      ],
      a: [0, 1, 2],
      why: "Tournaments only compare entrants, so negative values are fine, no global total is needed, and t is the pressure dial. Exact proportionality is roulette's job, and needing a sort is a cost of rank selection, not of tournaments.",
    },
  ]);

  /* ---------- l4-mutation ---------- */
  const permFig = (() => {
    const rows = [
      ["M1", [3, 1, 6, 4, 2, 5]],
      ["M2", [3, 1, 4, 6, 2, 2]],
      ["M3", [3, 2, 6, 4, 1, 5]],
      ["M4", [3, 1, 4, 6, 2, 7]],
      ["M5", [4, 1, 4, 6, 2, 5]],
    ];
    const parent = `${txt(10, 36, "Parent", { a: "start", s: 14 })}${strip(
      [3, 1, 4, 6, 2, 5].map((n) => [n, "var(--bg-2)"]),
      100,
      16,
    )}`;
    const body = rows
      .map(
        ([id, g], i) =>
          `<g data-pick="${id}"><rect x="6" y="${58 + i * 44}" width="320" height="40" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(36, 84 + i * 44, id, { s: 14 })}${strip(
            g.map((n) => [n]),
            100,
            61 + i * 44,
            { cw: 34, ch: 34 },
          )}</g>`,
      )
      .join("");
    return `<svg viewBox="0 0 340 285" style="max-height:285px;max-width:380px">${parent}${body}</svg>`;
  })();
  B.add("l4-mutation", [
    {
      type: "pick",
      q: "The parent is a tour of cities 1 to 6, each visited once. Five mutations were tried. Tap every child that is still a valid tour.",
      fig: permFig,
      a: ["M1", "M3"],
      why: "M1 swapped two cities and M3 reversed a segment (1 4 6 2 became 2 6 4 1); both still contain each city exactly once. M2 repeats city 2 and loses 5, M4 contains city 7, which does not exist, and M5 visits 4 twice. Those came from gene-by-gene changes that ignore the permutation.",
    },
    {
      type: "match",
      q: "Match each before and after to the mutation that made it.",
      pairs: [
        ["10110 → 10010", "Bit flip"],
        ["(2.40, 7.10) → (2.46, 7.03)", "Gaussian nudge"],
        ["A B C D E → A E C D B", "Swap two genes"],
        ["A B C D E → A B E D C", "Reverse a segment"],
        ["A B C D E → A C D B E", "Move one gene"],
      ],
      why: "A bit flip changes one binary gene; Gaussian noise gives small random changes to real values; swap exchanges B and E; inversion reverses the stretch C D E; insertion moves B to just after D.",
    },
    {
      type: "cat",
      q: "Does each operator take small steps or big jumps?",
      buckets: ["Small steps (exploit)", "Big jumps (explore)"],
      items: [
        ["Gaussian noise with a standard deviation of 0.01", 0],
        ["Reset a gene to any value in its range", 1],
        ["Flip one bit (rate 1/L)", 0],
        ["Replace the whole chromosome with a random one", 1],
        ["Gaussian noise with a standard deviation as large as the whole range", 1],
        ["Swap two neighbouring cities in a tour", 0],
      ],
      why: "Small changes give children that are similar to a good parent, so they have a fair chance of being good (exploitation). Large changes can reach anywhere but usually land somewhere poor (exploration). A good mutation scheme needs both: mostly small steps, with the ability to jump.",
    },
    {
      type: "slider",
      q: "A 100-bit string is mutated with each bit flipping independently with probability 1/100. About what percentage of children are exact copies of their parent (no bit flips at all)?",
      min: 0,
      max: 100,
      step: 5,
      ans: 37,
      tol: 10,
      unit: "%",
      hint: "Each bit survives with probability 0.99. For 100 bits this is the classic (1 − 1/n)^n, which is about 1/e ≈ 0.37.",
      why: "With one flip expected per child, a surprising number of children get none: (1 − 1/100)^100 ≈ 0.37, so over a third are copies. That is worth knowing when you wonder why progress sometimes stalls: those children cost an evaluation and add nothing.",
    },
    {
      type: "bug",
      q: "A mutation should return a changed COPY and leave the parent alone. Tap the faulty line.",
      code: [
        "def mutate(parent, sigma):",
        "    child = parent",
        "    i = random.randrange(len(child))",
        "    child[i] += random.gauss(0, sigma)",
        "    return child",
      ],
      a: 1,
      why: "child = parent does not copy a Python list, it just gives it a second name. The parent in the population is changed as well, even when the child is later rejected. It needs child = parent[:] or list(parent).",
    },
  ]);

  /* ---------- l4-crossover ---------- */
  const cutFig = (() => {
    const src = ["B", "B", "O", "O", "O", "B", "B", "B"],
      x0 = 60,
      cw = 50;
    const cells = src
      .map(
        (s, i) =>
          `<rect x="${x0 + i * cw}" y="30" width="${cw - 4}" height="${cw - 4}" rx="8" fill="${s === "B" ? "var(--blue)" : "var(--amber)"}" fill-opacity=".8" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + i * cw + (cw - 4) / 2, 59, i + 1, { s: 14, c: "#fff" })}`,
      )
      .join("");
    const gaps = Array.from(
      { length: 7 },
      (_, i) =>
        `<g data-pick="g${i + 1}"><rect x="${x0 + (i + 1) * cw - 14}" y="82" width="22" height="40" rx="6" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + (i + 1) * cw - 3, 144, "g" + (i + 1), { s: 14, c: "var(--text-dim)" })}</g>`,
    ).join("");
    return `<svg viewBox="0 0 480 155" style="max-height:155px">${txt(240, 18, "Blue: from parent 1. Orange: from parent 2", { s: 15 })}${cells}${gaps}</svg>`;
  })();
  const maskFig = `<svg viewBox="0 0 440 150" style="max-height:150px">${txt(8, 30, "Parent 1", { a: "start" })}${strip(
    "ABCDEFGH".split("").map((c) => [c, "var(--blue)", "#fff"]),
    90,
    12,
    { cw: 40 },
  )}${txt(8, 78, "Parent 2", { a: "start" })}${strip(
    "abcdefgh".split("").map((c) => [c, "var(--amber)", "#fff"]),
    90,
    60,
    { cw: 40 },
  )}${txt(8, 128, "Child", { a: "start" })}${strip(
    "ABcdEfGH".split("").map((c) => [c]),
    90,
    110,
    { cw: 40 },
  )}</svg>`;
  B.add("l4-crossover", [
    {
      type: "pick",
      q: "A k-point crossover made this child. Tap every cut point (gap between genes) that was used.",
      fig: cutFig,
      a: ["g2", "g5"],
      why: "The source changes from blue to orange between genes 2 and 3 and back to blue between genes 5 and 6. Those are the two cuts, so this was 2-point crossover. Where neighbouring genes share a colour there is no cut.",
    },
    {
      type: "mcq",
      q: "The child below was made by uniform crossover from the two parents. Which mask (1 = take the gene from parent 2) produced it?",
      fig: maskFig,
      o: ["00110100", "11001011", "00110010", "00101100"],
      a: 0,
      why: "Compare gene by gene: A, B from parent 1 (0, 0), c, d from parent 2 (1, 1), E from parent 1 (0), f from parent 2 (1), G, H from parent 1 (0, 0). That is 00110100. The mask 11001011 is its opposite and would build the other child.",
    },
    {
      type: "cat",
      q: "Parents are AAAAAA and BBBBBB. Which crossover can produce each child?",
      buckets: ["1-point", "2-point but not 1-point", "Uniform only", "No crossover"],
      items: [
        ["AAABBB", 0],
        ["BBBBAA", 0],
        ["AABBAA", 1],
        ["BAAAAB", 1],
        ["ABABAB", 2],
        ["AACBBB", 3],
      ],
      why: "One cut gives a block of A next to a block of B. Two cuts give a swapped middle. ABABAB alternates too often for two cuts, so it needs a mask. AACBBB contains a C that neither parent has, and crossover only recombines existing genes. New values come from mutation.",
    },
    {
      type: "multi",
      q: "Which of these situations make crossover produce only exact copies of the parents?",
      o: [
        "Both parents are identical",
        "The uniform mask is all 1s (child 1 copies parent 2)",
        "A 1-point cut falls between genes 4 and 5 of 8",
        "The crossover probability test fails and no crossover is applied",
        "The parents differ at every gene",
      ],
      a: [0, 1, 3],
      why: "Identical parents leave nothing to recombine, an all-1 mask hands over everything from one parent, and skipping crossover just copies them. A cut in the middle and parents that differ everywhere both give genuinely new children.",
    },
    {
      type: "bug",
      q: "This should build two children by swapping each gene with probability 0.5 (c1 starts as a copy of p1, c2 as a copy of p2). Tap the faulty line.",
      code: [
        "c1, c2 = p1[:], p2[:]",
        "for i in range(L):",
        "    if random() < 0.5:",
        "        c1[i] = p1[i]",
        "        c2[i] = p1[i]",
      ],
      a: 3,
      why: "Swapping means child 1 takes parent 2's gene here, but c1[i] = p1[i] writes the value it already holds. Child 1 would always stay a copy of parent 1. It should be c1[i] = p2[i].",
    },
  ]);

  /* ---------- l4-lab ---------- */
  const labFig = (() => {
    const w = 520,
      h = 220,
      X = (g) => 40 + (g / 30) * 460,
      Y = (v) => 180 - v * 150;
    const line = (f, c) =>
      `<path d="${Array.from({ length: 31 }, (_, g) => `${g ? "L" : "M"}${X(g).toFixed(1)} ${Y(f(g)).toFixed(1)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3"/>`;
    const best = (g) => (g < 10 ? 0.5 + 0.04 * g : 0.9);
    const mean = (g) => (g < 12 ? 0.45 + 0.0375 * g : 0.9);
    const div = (g) => Math.max(0, 0.8 - (0.8 * g) / 12);
    const ticks = [4, 8, 12, 20, 28]
      .map(
        (g) =>
          `<g data-pick="g${g}"><circle cx="${X(g)}" cy="198" r="13" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(X(g), 202, g, { s: 11 })}</g>`,
      )
      .join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="40" x2="500" y1="180" y2="180" stroke="var(--line-2)" stroke-width="2"/>${line(div, "var(--rose)")}${line(mean, "var(--blue)")}${line(best, "var(--teal)")}${ticks}${txt(46, 14, "best", { a: "start", c: "var(--teal-ink)" })}${txt(92, 14, "mean", { a: "start", c: "var(--blue-ink)" })}${txt(144, 14, "diversity", { a: "start", c: "var(--rose-ink)" })}</svg>`;
  })();
  const gridFig = (() => {
    const bad = [
        [1, 2],
        [4, 9],
        [7, 4],
        [10, 7],
      ],
      c = 26,
      x0 = 20,
      y0 = 10;
    let s = "";
    for (let r = 0; r < 12; r++)
      for (let k = 0; k < 12; k++) {
        const on = (r * 7 + k * 3 + r * k) % 5 < 2,
          wrong = bad.some(([a, b]) => a === r && b === k);
        s += `<rect x="${x0 + k * c}" y="${y0 + r * c}" width="${c - 2}" height="${c - 2}" rx="3" fill="${on ? "var(--ink)" : "var(--bg-2)"}" stroke="${wrong ? "var(--rose)" : "var(--line)"}" stroke-width="${wrong ? 4 : 1}"/>`;
      }
    return `<svg viewBox="0 0 352 ${y0 + 12 * c + 6}" style="max-height:330px;max-width:380px">${s}</svg>`;
  })();
  Object.assign(partScope, { gridFig, labFig });
})();

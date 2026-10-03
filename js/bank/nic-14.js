/* ===== bank-v-nic-3.js ===== */
/* NIC revision bank, visual and varied questions, part 3.
   Lecture 4 (selection, replacement, mutation, crossover, the lab). Every figure is needed to answer. */
(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});

  const B = NIC.bank;
  const txt = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;

  /* Bar chart. vals: numbers; ids: data-pick ids (optional); labels under bars; line: {y, label} horizontal marker. */
  function bars(
    vals,
    {
      ids = null,
      labels = null,
      max = null,
      w = 520,
      h = 210,
      line = null,
      colors = null,
      show = true,
      inside = false,
      fmt = (v) => v,
    } = {},
  ) {
    const m = max || Math.max(...vals) * 1.1,
      n = vals.length,
      bw = Math.min(54, (w - 40) / n - 12),
      gap = (w - 40) / n;
    const Y = (v) => h - 34 - (v / m) * (h - 66);
    const body = vals
      .map((v, i) => {
        const x = 20 + gap * i + (gap - bw) / 2;
        const r = `<rect x="${x}" y="${Y(v)}" width="${bw}" height="${h - 34 - Y(v)}" rx="6" fill="${colors ? colors[i] : "var(--blue)"}" stroke="var(--line-2)" stroke-width="2" fill-opacity=".85"/>`;
        const val = show
          ? inside
            ? txt(x + bw / 2, h - 44, fmt(v), { s: 12, c: "#fff" })
            : txt(x + bw / 2, Y(v) - 6, fmt(v), { s: 12 })
          : "";
        const lab = labels ? txt(x + bw / 2, h - 14, labels[i]) : "";
        return ids ? `<g data-pick="${ids[i]}">${r}${val}${lab}</g>` : `<g>${r}${val}${lab}</g>`;
      })
      .join("");
    const ln = line
      ? `<line x1="14" x2="${w - 10}" y1="${Y(line.y)}" y2="${Y(line.y)}" stroke="var(--rose)" stroke-width="3" stroke-dasharray="7 5"/>${txt(w - 12, Y(line.y) - 6, line.label, { a: "end", c: "var(--rose-ink)" })}`
      : "";
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="14" x2="${w - 10}" y1="${h - 34}" y2="${h - 34}" stroke="var(--line-2)" stroke-width="2"/>${body}${ln}</svg>`;
  }

  /* A row of genes. cells: [text, colour]. */
  function strip(cells, x, y, { cw = 34, ch = 34 } = {}) {
    return cells
      .map(
        (c, i) =>
          `<rect x="${x + i * cw}" y="${y}" width="${cw - 3}" height="${ch}" rx="6" fill="${c[1] || "var(--panel)"}" stroke="var(--line-2)" stroke-width="2"/>${txt(x + i * cw + (cw - 3) / 2, y + ch / 2 + 5, c[0], { c: c[2] || "var(--text)" })}`,
      )
      .join("");
  }

  /* Pie wheel. vals, labels; ids optional (pick). */
  function pie(vals, labels, cx, cy, r, ids, cols) {
    const tot = vals.reduce((a, b) => a + b, 0);
    let a0 = -Math.PI / 2;
    return vals
      .map((v, i) => {
        const a1 = a0 + (v / tot) * Math.PI * 2,
          big = a1 - a0 > Math.PI ? 1 : 0;
        const p = `M${cx} ${cy} L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 ${big} 1 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} Z`;
        const mid = (a0 + a1) / 2,
          lx = cx + r * 0.66 * Math.cos(mid),
          ly = cy + r * 0.66 * Math.sin(mid);
        a0 = a1;
        const g = `<path d="${p}" fill="${cols[i]}" fill-opacity=".75" stroke="var(--panel)" stroke-width="3"/>${txt(lx, ly + 5, labels[i], { s: 13 })}`;
        return ids ? `<g data-pick="${ids[i]}">${g}</g>` : `<g>${g}</g>`;
      })
      .join("");
  }

  /* ---------- l4-types ---------- */
  const bestRun = [0.62, 0.7, 0.7, 0.66, 0.74, 0.78];
  const typesFig = () => {
    const w = 520,
      h = 210,
      X = (i) => 50 + i * 82,
      Y = (v) => h - 40 - ((v - 0.55) / 0.3) * (h - 80);
    const path = bestRun.map((v, i) => `${i ? "L" : "M"}${X(i)} ${Y(v)}`).join(" ");
    const dots = bestRun
      .map(
        (v, i) =>
          `<g data-pick="G${i + 1}"><circle cx="${X(i)}" cy="${Y(v)}" r="13" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(X(i), Y(v) + 4, v.toFixed(2), { s: 10 })}</g>`,
      )
      .join("");
    const lab = bestRun.map((_, i) => txt(X(i), h - 14, "Gen " + (i + 1), { s: 12, c: "var(--text-dim)" })).join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="20" x2="${w - 10}" y1="${h - 30}" y2="${h - 30}" stroke="var(--line-2)" stroke-width="2"/>${txt(18, 16, "Best fitness in the population (maximising)", { a: "start", c: "var(--text-dim)" })}<path d="${path}" fill="none" stroke="var(--teal)" stroke-width="3"/>${dots}${lab}</svg>`;
  };
  B.add("l4-types", [
    {
      type: "pick",
      q: "This GA logged its best fitness each generation. Tap the generation that proves the run cannot be elitist.",
      fig: typesFig(),
      a: "G4",
      why: "Elitism copies the best individuals unchanged, so the best fitness can never fall. It dips from 0.70 to 0.66 at generation 4, so the best was lost. Staying level (generation 3) is allowed.",
    },
    {
      type: "cat",
      q: "Which scheme suits each situation better?",
      buckets: ["Generational", "Steady-state"],
      items: [
        ["Fitness is scored on 200 machines at once, and the whole batch finishes together", 0],
        ["Memory is so tight that only one child can exist at a time", 1],
        ["A lucky good child should start breeding straight away", 1],
        ["You want a big change to the population in a single step (more exploration)", 0],
        ["The old population should be swapped for a new one in one go", 0],
        ["Each step should be cheap, so you can stop at any moment with a usable population", 1],
      ],
      why: "Generational schemes make a whole batch of children and swap them in together, which suits parallel scoring and larger jumps. Steady-state changes one or two members at a time, so it needs little memory, uses good children at once and can stop any time.",
    },
    {
      type: "order",
      q: "Put one generation of an elitist generational GA in the right order.",
      items: [
        "Copy the 2 best individuals into the new population",
        "Pick parents from the old population",
        "Apply crossover and mutation to make children",
        "Fill the new population with the children and drop the old one",
      ],
      why: "The elites are set aside first so nothing can damage them. Parents are chosen from the old population, children are made from them, and then the old population is replaced by elites plus children.",
    },
    {
      type: "slider",
      q: "Generational GA: population 20, elitism keeps 2, run for 25 generations. A steady-state GA makes one child per step. How many steady-state steps make the same number of children?",
      min: 100,
      max: 800,
      step: 50,
      ans: 450,
      tol: 50,
      unit: " steps",
      hint: "Each generation makes 20 − 2 = 18 children. And 18 × 25 = 18 × 100 ÷ 4 = 450.",
      why: "Elites are copied, not made, so each generation creates 18 children. 18 × 25 = 450, so 450 steady-state steps cost the same number of evaluations. Compare schemes on evaluations, not on generations.",
    },
    {
      type: "bug",
      q: "This steady-state step is meant to replace the weakest member (maximising). Tap the faulty line.",
      code: [
        "parent = tournament(pop, 3)",
        "child = mutate(copy(parent))",
        "slot = index_of_highest_fitness(pop)",
        "if fitness(child) >= fitness(pop[slot]):",
        "    pop[slot] = child",
      ],
      a: 2,
      why: "It looks for the member with the highest fitness, which is the best. The child would overwrite the best, so the scheme would throw away its champion. It should look for the lowest fitness.",
    },
  ]);

  /* ---------- l4-replacement ---------- */
  const popBars = (vals, o) =>
    bars(vals, Object.assign({ max: 1, labels: vals.map((_, i) => "Slot " + (i + 1)), fmt: (v) => v.toFixed(2) }, o));
  const snap = (vals, title, x0) => {
    const bw = 24,
      g = 30;
    return (
      txt(x0, 18, title, { a: "start", s: 15 }) +
      vals
        .map(
          (v, i) =>
            `<rect x="${x0 + i * g}" y="${150 - v * 120}" width="${bw}" height="${v * 120}" rx="4" fill="var(--blue)" fill-opacity=".85" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + i * g + bw / 2, 166, v.toFixed(2).slice(1), { s: 9, c: "var(--text-dim)" })}`,
        )
        .join("")
    );
  };
  B.add("l4-replacement", [
    {
      type: "pick",
      q: "A child with fitness 0.55 is about to be inserted. Replace-first-weaker could overwrite any member weaker than the child, depending on the scan. Tap every slot that is a candidate.",
      fig: popBars([0.7, 0.5, 0.9, 0.3, 0.6, 0.2], {
        inside: true,
        ids: ["s1", "s2", "s3", "s4", "s5", "s6"],
        line: { y: 0.55, label: "child 0.55" },
        max: 1.1,
      }),
      a: ["s2", "s4", "s6"],
      why: "A slot is a candidate only if its fitness is below 0.55: slots 2 (0.50), 4 (0.30) and 6 (0.20). Scanning from slot 1 picks slot 2, whereas replace-weakest always takes slot 6.",
    },
    {
      type: "cat",
      q: "Which strategy does each statement describe?",
      buckets: ["Replace weakest only", "Replace first weaker only", "Both"],
      items: [
        ["Looks at every member before deciding", 0],
        ["Can stop as soon as it meets a weaker member", 1],
        ["Which member goes depends on the order of the slots", 1],
        ["Rejects a child that is worse than every member", 2],
        ["The best fitness in the population can never go down", 2],
        ["Always overwrites the member with the lowest fitness", 0],
      ],
      why: "Replace weakest is a full scan with a fixed target. Replace first weaker stops early and depends on slot order. Both refuse a child that beats nobody, and both keep the best fitness from falling, because a child only replaces a weaker member (or an equal one).",
    },
    {
      type: "mcq",
      q: "The same stream of children was fed into two populations of 8, one using replace-weakest and one using replace-first-weaker. Both have the same best member now. Which snapshot is replace-weakest, and why?",
      fig: `<svg viewBox="0 0 520 190" style="max-height:190px">${snap([0.82, 0.85, 0.88, 0.84, 0.9, 0.86, 0.83, 0.87], "Snapshot X", 12)}${snap([0.9, 0.35, 0.8, 0.5, 0.88, 0.2, 0.75, 0.6], "Snapshot Y", 272)}</svg>`,
      o: [
        "X: always removing the worst lifts the floor quickly",
        "Y: always removing the worst leaves a wide spread",
        "X: weak members get time to survive, so scores bunch up",
        "Y: weak members get time to survive, so low scores linger",
      ],
      a: 0,
      why: "Replace-weakest is greedy: every accepted child deletes the current floor, so the low scores disappear and the spread shrinks (X). Replace-first-weaker lets some weak members sit in slots the scan rarely reaches, so low scores linger (Y). That is also why it keeps more diversity.",
    },
    {
      type: "slider",
      q: "A population of 1000 sits in no particular order, and about half of the members are weaker than the new child. Replace-first-weaker scans from a start slot. About how many members does it look at before it stops?",
      min: 0,
      max: 10,
      step: 1,
      ans: 2,
      tol: 1,
      unit: " looks",
      hint: "Each look is a coin flip: weaker (stop) or not (carry on). How many coin flips until the first heads?",
      why: "With a 50% chance of a weaker member at every slot, you expect to stop after about 2 looks. Replace-weakest must always look at all 1000, which is why first-weaker is cheaper.",
    },
    {
      type: "bug",
      q: "This should find the weakest member (maximising) so the child can replace it. Tap the faulty line.",
      code: [
        "w = 0",
        "for i in range(1, P):",
        "    if fit[i] > fit[w]: w = i",
        "if child_fit >= fit[w]:",
        "    pop[w] = child",
      ],
      a: 2,
      why: "The comparison is the wrong way round, so w ends up as the index of the best member and the child would replace the champion. It must use fit[i] < fit[w] to track the lowest fitness.",
    },
  ]);

  /* ---------- l4-pressure ---------- */
  const panel = (id, x0, best, mean, title) => {
    const X = (i) => x0 + 10 + i * (150 / (best.length - 1)),
      Y = (v) => 150 - v * 110;
    const L = (a, c) =>
      `<path d="${a.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    return `<g data-pick="${id}"><rect x="${x0}" y="24" width="170" height="140" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${L(mean, "var(--blue)")}${L(best, "var(--teal)")}</g>${txt(x0 + 85, 16, title, { s: 14 })}`;
  };
  const pressFig = `<svg viewBox="0 0 560 215" style="max-height:215px">${
    panel(
      "A",
      4,
      [0.3, 0.33, 0.31, 0.35, 0.34, 0.37, 0.36, 0.38],
      [0.28, 0.3, 0.29, 0.3, 0.31, 0.3, 0.32, 0.31],
      "Run A",
    ) +
    panel(
      "B",
      194,
      [0.3, 0.55, 0.7, 0.72, 0.72, 0.72, 0.72, 0.72],
      [0.28, 0.4, 0.55, 0.65, 0.7, 0.72, 0.72, 0.72],
      "Run B",
    ) +
    panel(
      "C",
      384,
      [0.3, 0.4, 0.52, 0.62, 0.72, 0.8, 0.86, 0.9],
      [0.27, 0.34, 0.42, 0.5, 0.58, 0.66, 0.72, 0.78],
      "Run C",
    )
  }<rect x="190" y="190" width="14" height="5" fill="var(--teal)"/>${txt(210, 196, "best", { a: "start", s: 12 })}<rect x="270" y="190" width="14" height="5" fill="var(--blue)"/>${txt(290, 196, "mean", { a: "start", s: 12 })}${txt(280, 212, "x axis: generations, y axis: fitness", { s: 11, c: "var(--text-faint)" })}</svg>`;
  B.add("l4-pressure", [
    {
      type: "pick",
      q: "Three runs of the same EA, differing only in selection pressure. Tap the run that shows premature convergence.",
      fig: pressFig,
      a: "B",
      why: "In run B the mean climbs until it meets the best and both go flat at 0.72: everyone is nearly identical, so selection has nothing left to choose between. Run A barely moves (too little pressure) and run C improves steadily with a healthy gap between best and mean.",
    },
    {
      type: "cat",
      q: "How does each change affect selection pressure?",
      buckets: ["Raises pressure", "Lowers pressure", "No change"],
      items: [
        ["Tournament size 3 becomes 8", 0],
        ["Tournament size 6 becomes 2", 1],
        ["Replace every fitness by its square (all values positive) in tournament selection", 2],
        ["Add 1000 to every fitness in roulette selection", 1],
        ["Subtract the smallest fitness from every fitness in roulette selection", 0],
        ["Add 1000 to every fitness in tournament selection", 2],
      ],
      why: "Tournaments only compare, so squaring or shifting fitness keeps the same order and the same pressure. Roulette uses sizes: adding a constant flattens the slices (lower pressure), subtracting the minimum widens the gaps (higher pressure). A bigger tournament means the winner is better on average.",
    },
    {
      type: "slider",
      q: "A population of 64 uses tournaments of size 2 and nothing else (no mutation, no crossover). Early on, the best individual's copies roughly double each generation. Starting from 1 copy, about how many generations until the whole population is copies of it?",
      min: 0,
      max: 12,
      step: 1,
      ans: 6,
      tol: 1,
      unit: " generations",
      hint: "1, 2, 4, 8, 16, 32, 64: count the doublings.",
      why: "A tournament of size 2 picks the best about twice as often as a random pick, so its copies roughly double each generation: 1 to 64 takes 6 doublings. A bigger tournament would take over faster, which is the high-pressure end of the dial.",
    },
    {
      type: "multi",
      q: "Which observations suggest selection pressure is too HIGH?",
      o: [
        "The mean fitness is within 1% of the best by generation 10",
        "The number of distinct genomes falls to 1 by generation 12",
        "The best creeps up slowly while the mean barely moves",
        "Almost every child descends from the same two parents",
        "Best and mean wander up and down with no trend",
      ],
      a: [0, 1, 3],
      why: "Mean meeting the best, a single genome and a family tree with only two parents all show that diversity has collapsed. A slow creep and aimless wandering are the signs of too little pressure.",
    },
    {
      type: "mcq",
      q: "The three runs below differ only in tournament size. What do they support?",
      fig: `<table class="t"><tr><th>Run</th><th>Tournament size</th><th>Population identical at…</th><th class="num">Final best</th></tr><tr><td>1</td><td>2</td><td>never (100 gens)</td><td class="num">0.93</td></tr><tr><td>2</td><td>7</td><td>generation 6</td><td class="num">0.71</td></tr><tr><td>3</td><td>1</td><td>never (100 gens)</td><td class="num">0.52</td></tr></table>`,
      o: [
        "A moderate size beat both extremes here",
        "A larger size always gives a better final result",
        "Size 1 is best because diversity never collapses",
        "Tournament size has no real effect on the result",
      ],
      a: 0,
      why: "Size 7 collapsed diversity early and stalled at 0.71. Size 1 is random choice, so diversity stays but nothing improves. Size 2 kept diversity and still made progress. That is the sweet spot idea: some pressure, not too much.",
    },
  ]);

  /* ---------- l4-roulette ---------- */
  const cols4 = ["var(--teal)", "var(--blue)", "var(--amber)", "var(--violet)"];
  const wheelFig = `<svg viewBox="0 0 520 250" style="max-height:250px">${txt(130, 18, "Fitnesses", { s: 15 })}${pie([4, 3, 2, 1], ["A 4", "B 3", "C 2", "D 1"], 130, 135, 100, null, cols4)}${txt(390, 18, "After adding 20 to every fitness", { s: 15 })}${pie([24, 23, 22, 21], ["A 24", "B 23", "C 22", "D 21"], 390, 135, 100, ["A", "B", "C", "D"], cols4)}</svg>`;
  B.add("l4-roulette", [
    {
      type: "pick",
      q: "The left wheel uses raw fitness. The right wheel adds 20 to every fitness. Tap the individual whose slice grew the most.",
      fig: wheelFig,
      a: "D",
      why: "Raw shares are 40%, 30%, 20% and 10%. After adding 20 they are 24/90, 23/90, 22/90 and 21/90, about 27%, 26%, 24% and 23%. D more than doubles its share (10% to 23%) while A shrinks. Adding a constant flattens roulette, so the exact numbers matter.",
    },
    {
      type: "slider",
      q: "Five individuals have fitness 1, 1, 1, 1 and 6. In 30 roulette spins, about how many picks go to the four weak individuals combined?",
      min: 0,
      max: 30,
      step: 2,
      ans: 12,
      tol: 4,
      unit: " picks",
      hint: "The total is 10, so the four weak ones own 4 out of 10 of the wheel. Then 4/10 of 30 = 12.",
      why: "The weak four own 4 of the 10 units of wheel, a 40% share, so about 12 of 30 spins. Even weak individuals keep a real chance, which is what stops roulette from being pure greed.",
    },
    {
      type: "order",
      q: "Put the steps of one roulette selection in order, for a problem where shorter tours are better.",
      items: [
        "Turn each tour length into a fitness (for example 1 divided by length)",
        "Add the fitnesses to get the total size of the wheel",
        "Draw a random point between 0 and the total",
        "Walk along the individuals, adding their slices, until the running sum passes the point",
        "Return the individual whose slice you stopped in",
      ],
      why: "Roulette needs larger-is-better fitness, so the tour lengths are converted first. After that the wheel is a running sum: a random point is located by adding slices until you pass it.",
    },
    {
      type: "bug",
      q: "This roulette spin should favour individuals with bigger fitness. Tap the faulty line.",
      code: [
        "total = sum(ind.fit for ind in pop)",
        "r = random() * total",
        "running = 0",
        "for ind in pop:",
        "    running += ind.fit",
        "    if running < r:",
        "        return ind",
        "return pop[-1]",
      ],
      a: 5,
      why: "The test should be running >= r (or >), meaning the point lies inside this slice. With < the loop returns the first individual whenever its slice is smaller than the point, so selection ignores the sizes and favours slot order.",
    },
    {
      type: "cat",
      q: "Can this score be fed into roulette as it is?",
      buckets: ["Use directly", "Transform first"],
      items: [
        ["Fraction of pixels that match the target (0 to 1)", 0],
        ["Profit per run, which is sometimes a loss", 1],
        ["Tour length in km, shorter is better", 1],
        ["Distance travelled by a robot in metres, longer is better, never negative", 0],
        ["Number of rule violations, fewer is better", 1],
        ["Quiz score out of 100, higher is better", 0],
      ],
      why: "Roulette needs non-negative scores where bigger means better. Losses give negative slices, and anything where smaller is better would favour the worst solutions, so those need converting (shift, or use 1/x or max minus x).",
    },
  ]);
  Object.assign(partScope, { bars, strip, txt });
})();

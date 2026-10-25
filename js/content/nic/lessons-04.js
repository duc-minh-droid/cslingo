(function () {
  const partScope = (NIC.shared.lessons = NIC.shared.lessons || {});
  const { bars, chips, g, row, table } = partScope;
  const L = NIC.LESSONS;

  // a row of population slots, each one tappable (data-pick = "Slot n")
  const slotRow = (vals) =>
    `<svg viewBox="0 0 ${vals.length * 84 + 6} 92" role="group" aria-label="Population slots 1 to ${vals.length}">${vals
      .map(
        (v, i) =>
          `<g data-pick="Slot ${i + 1}" aria-label="Slot ${i + 1}, fitness ${v}"><rect x="${6 + i * 84}" y="4" width="72" height="84" rx="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${42 + i * 84}" y="32" text-anchor="middle" style="font:800 13px var(--sans);fill:var(--text-faint)">Slot ${i + 1}</text><text x="${42 + i * 84}" y="66" text-anchor="middle" style="font:900 22px var(--sans);fill:var(--ink)">${v}</text></g>`,
      )
      .join("")}</svg>`;

  L["l4-replacement"] = {
    sum: "In a steady-state GA a new child needs a slot. <b>Replace weakest</b> or <b>replace first weaker</b>: who gets kicked out?",
    steps: [
      {
        t: "Replace weakest",
        b: `<p>Look through the <b>whole</b> population, find the <b>worst</b> member, and replace it with the child (if the child is at least as good).</p>`,
        v:
          chips([
            ["S1", "0.3"],
            ["S2", "0.5"],
            ["S3", "0.3"],
            ["S4", "0.2"],
            ["S5", "0.9"],
            ["S6", "0.1", "target"],
          ]) + `<p class="dim" style="margin-top:6px">New child 0.4 → replaces S6 (0.1), the weakest.</p>`,
      },
      {
        t: "Replace first weaker",
        b: `<p>Scan from the <b>top</b>. Replace the <b>first</b> member you meet that's weaker than the child, then <b>stop</b>.</p>`,
        v:
          chips([
            ["S1", "0.3", "target"],
            ["S2", "0.5"],
            ["S3", "0.3"],
            ["S4", "0.2"],
            ["S5", "0.9"],
            ["S6", "0.1"],
          ]) +
          `<p class="dim" style="margin-top:6px">New child 0.4 → S1 (0.3) is already weaker, so it's replaced. Scanning stops, even though S6 is much weaker.</p>`,
        c: {
          type: "pick",
          q: "A child with fitness 0.5 arrives (higher is fitter). With <b>replace first weaker</b>, tap the slot it takes.",
          fig: slotRow([0.7, 0.8, 0.3, 0.9, 0.1]),
          a: "Slot 3",
          hint: "Scan from slot 1. Stop at the first member that is weaker than the child.",
          why: "Scan from the top: 0.7 and 0.8 aren't weaker than 0.5, but 0.3 is. Stop at slot 3, even though slot 5 (0.1) is weaker still. That would be replace weakest.",
        },
      },
      {
        t: "What's the difference in practice?",
        b: `<p><b>Replace weakest</b>: greedy, high selection pressure, and the best always survives.<br><b>Replace first weaker</b>: less greedy (weak members can survive longer), keeps more diversity, and it's cheaper because it can stop early.</p>`,
      },
      {
        t: "A detail in the slides",
        b: `<p>The slides' "first weaker" example only works if <b>equal fitness counts as weaker</b> (S11 = 0.2 replaces a 0.2). The playground has a checkbox for this.</p>`,
      },
    ],
    guide: [
      "Choose a strategy at the top, then press <b>Insert next child</b>. The orange highlight shows the scan.",
      "Press <b>Reset to lecture example</b>, switch strategy, and press <b>Insert next child</b> for the same children. Compare which slots change.",
      'Untick <b>Treat equal fitness</b> as "weaker" and redo "first weaker": S11 lands in a different slot.',
      "Press <b>+ Random child</b> and predict the slot before you insert.",
    ],
  };

  L["l4-pressure"] = {
    sum: "Selection pressure = how strongly selection favours the fittest. <b>Too little</b>: no progress. <b>Too much</b>: stuck early.",
    steps: [
      {
        t: "What it means",
        b: `<p>Selection pressure is how much more likely a fit individual is to be picked than an unfit one.</p><span class="analogy">Talent-show judges. Too lenient and everyone goes through, so the show never gets better. Too harsh and only one act goes through, so next year every act copies it.</span>`,
      },
      {
        t: "Too little pressure",
        b: `<p>Selection is (nearly) random, so good solutions aren't favoured. The population drifts around: <b>no evolutionary progress</b>.</p>`,
      },
      {
        t: "Too much pressure",
        b: `<p>Always picking the best means one individual's copies <b>take over</b> within a few generations. Diversity vanishes, and the population sits on whichever hill that individual was on: <b>premature convergence</b>, often at a local optimum.</p>`,
        c: {
          type: "cat",
          q: "Is each symptom a sign of <b>too little</b> or <b>too much</b> selection pressure?",
          buckets: ["Too little pressure", "Too much pressure"],
          items: [
            ["The whole population is identical after 3 generations", 1],
            ["Fit and unfit individuals are picked about equally often", 0],
            ["One individual's copies take over, then progress stops", 1],
            ["Best fitness drifts up and down and never really improves", 0],
          ],
          hint: "Too much pressure makes everyone alike, fast. Too little means selection hardly favours the fit at all.",
          why: "Fast takeover plus stagnation is premature convergence: too much pressure. Picking fit and unfit alike, so the population just drifts, is too little pressure.",
        },
      },
      {
        t: "The sweet spot",
        b: `<p>A <b>modest, tunable</b> pressure: fitter individuals are favoured, but weaker ones still get chances. That's why selection methods have knobs (tournament size, rank bias).</p>`,
      },
      {
        t: "How to read the heatmap below",
        b: `<p>Each <b>row</b> is a generation (the top row is the start). Each <b>cell</b> is one individual, coloured by fitness: pale = poor, deeper green = fitter, <b style="color:var(--amber-ink)">orange</b> = the best. There's <b>no mutation</b>, so you're watching selection alone copy individuals. The faster orange floods the rows, the higher the pressure.</p>`,
      },
    ],
    guide: [
      "Click each selection method. The heatmap reruns straight away.",
      "Compare <b>Random</b> with <b>Always best</b>: in which one does the orange cell take over?",
      'Read the "share of the original best" chart for each method.',
      "Scroll down and press <b>Run experiment</b> to find which tournament size works best.",
    ],
  };

  L["l4-roulette"] = {
    sum: "Roulette: your chance of being picked = <b>your fitness ÷ total fitness</b>.",
    steps: [
      {
        t: "The wheel",
        b: `<p>Give each individual a slice of a roulette wheel <b>sized by its fitness</b>, then spin. The bigger your slice, the more likely the ball lands on you, but even a tiny slice still has a chance.</p><p>Example: three individuals with fitnesses 2, 3 and 5. Together that is 10, so the slices are 2, 3 and 5 tenths of the wheel: 20%, 30% and 50%.</p><details class="math-more"><summary>Show the maths</summary><p>Individual $i$ is picked with probability $p_i = \\dfrac{f_i}{\\sum_k f_k}$, its fitness divided by the total. For 2, 3, 5 the total is 10, so $p = 0.2,\\ 0.3,\\ 0.5$.</p></details>`,
        v: (box) => (box.innerHTML = NIC.shared.lessons.wheelFig([2, 3, 5])),
      },
      {
        t: "Watch it run",
        b: `<p>Five individuals, five slices. Each spin lands on a random point, and the bigger your slice, the more often you get picked.</p><p>It will ask you to predict the favourite first. Tap a fitness value to change it and the wheel is redrawn.</p>`,
        v: (box, life) => NIC.runners.roulette(box, life),
      },
      {
        t: "Problem 1: superfit individuals",
        b: `<p>Fitnesses <b>100</b>, 0.4, 0.3, 0.2, 0.1. The best gets 100/101 ≈ <b>99%</b> of the wheel and will take over immediately.</p>`,
        v: bars([
          ["f = 100", 99, "var(--rose)"],
          ["f = 0.4", 0.4],
          ["f = 0.3", 0.3],
          ["f = 0.2", 0.2],
          ["f = 0.1", 0.1],
        ]),
      },
      {
        t: "Problem 2: it depends on the exact numbers",
        b: `<p>Add the same number to every fitness. Nobody overtakes anybody, so you would expect nothing to change. But the slices are measured against the <b>total</b>, and the total just got much bigger. Drag the slider (try +100): the superfit individual's slice shrinks from nearly the whole wheel towards an equal share.</p><span class="key">Roulette depends on <b>absolute</b> fitness values, so you have to design the fitness numbers very carefully.</span><details class="math-more"><summary>Show the maths</summary><p>Before: $100/101\\approx 99\\%$. After adding 100 to everyone (200, 100.4, 100.3, 100.2, 100.1) the total is 601, so the best gets $200/601\\approx 33\\%$. Adding $c$ to every fitness changes $p_i$ to $(f_i+c)/(\\sum_k f_k + Pc)$, which tends to $1/P$ as $c$ grows.</p></details>`,
        v: (box) => NIC.shared.lessons.shiftWheel(box),
        c: {
          q: "Every fitness gets 100 added to it. What happens to the best individual's slice of a roulette wheel?",
          o: ["It stays the same, the order is unchanged", "It shrinks towards an equal share", "It grows even bigger"],
          a: 1,
          why: "The total grows a lot while the best only gains the same 100 as everyone else, so its share of the wheel shrinks and every slice gets closer to equal.",
        },
      },
      {
        t: "Problem 3: minimising and negatives",
        b: `<p>If <b>smaller is better</b> (like tour length), roulette favours the <i>worst</i> solutions. If any fitness is <b>negative</b>, you can't have a negative slice. Either way you'd have to transform the fitness first.</p>`,
      },
    ],
    guide: [
      "Press <b>Spin</b> a few times. The table shows each p<sub>i</sub>.",
      "Press <b>Spin 1,000×</b>: the observed bars (green) should match the expected ones (grey).",
      "Click the <b>Superfit</b> preset, then <b>Superfit + 100</b>. Watch the wheel change.",
      "Try <b>Negatives</b> and <b>TSP lengths</b> to see roulette break.",
    ],
  };

  L["l4-rank"] = {
    sum: "Rank selection ignores <b>how much</b> better you are. Only your <b>position</b> in the ranking counts.",
    steps: [
      {
        t: "Step 1: sort and rank",
        b: `<p>Sort the population. The best gets rank <b>P</b> (the population size), the next gets P − 1, …, and the worst gets rank <b>1</b>.</p>`,
        v: table(
          ["fitness", "rank"],
          [
            ["100", "4"],
            ["0.4", "3"],
            ["0.3", "2"],
            ["0.2", "1"],
          ],
        ),
      },
      {
        t: "Step 2: probability ∝ rank",
        b: `<p>Now hand out slices by rank. Rank 4 gets 4 blocks, rank 3 gets 3, and so on down to 1 block for the worst. Pile all the blocks together: 4 + 3 + 2 + 1 = 10. Your chance is your blocks out of the total, so the best gets 4 in 10, however far ahead of the others it really is. Change the population size to see the staircase grow.</p><details class="math-more"><summary>Show the maths</summary><p>$p_i = \\dfrac{\\text{rank}_i}{\\sum \\text{ranks}}$, and the ranks add up to $1+2+\\dots+P = \\dfrac{P(P+1)}{2}$. For $P=4$ the sum is 10, so the superfit 100 gets $4/10 = 40\\%$ instead of $99\\%$. For $P=5$ the sum is 15, so the best gets $5/15\\approx 33\\%$ and the worst $1/15\\approx 7\\%$.</p></details>`,
        v: (box) => NIC.shared.lessons.rankBlocks(box),
        c: {
          q: "In a population of 4 the best fitness is 100 and the others are about 0.3. How big a slice does rank selection give the best?",
          o: ["About 99%, the same as roulette", "40%, only its rank counts", "25%, everyone gets the same"],
          a: 1,
          why: "Rank selection ignores how far ahead 100 is. The best just has the top rank, which is 4 blocks out of 10, so 40%.",
        },
      },
      {
        t: "Why it's robust",
        b: `<p>Only the order matters, so superfit individuals, negative values and scaling tricks don't matter. For minimising, just rank the other way.</p>`,
      },
      {
        t: "The bias knob: rank<sup>b</sup>",
        b: `<p>Plain rank selection has a fixed pressure. To tune it, make a high rank count for <b>more than its share</b>, or for less. The knob <b>b</b> does that: turn it up and the top ranks pull ahead, turn it down and everyone drifts towards equal. At b = 0 everyone has the same chance. Drag the slider and watch the bars.</p><details class="math-more"><summary>Show the maths</summary><p>Use $\\text{rank}^{\\,b}$ in place of the rank. For $b=2$ the weights are $16, 9, 4, 1$ out of $30$, so the best gets $53\\%$. For $b=0.5$ the bias is low and the shares are close together. For $b=0$ every weight is $1$.</p></details>`,
        v: (box) => NIC.shared.lessons.biasFig(box),
        c: {
          q: "Increasing b does what to selection pressure?",
          o: ["Lowers it", "Raises it", "Nothing"],
          a: 1,
          why: "Top ranks get a disproportionately bigger share.",
        },
      },
    ],
    guide: [
      "Load the <b>Superfit</b> preset and compare the grey (roulette) and green (rank) bars.",
      "Drag the <b>bias exponent</b> from 0 to 3. Watch the best's share grow.",
      "Try the <b>TSP lengths</b> preset: the minimise box ticks itself and rank handles it.",
    ],
  };

  L["l4-tournament"] = {
    sum: "Tournament: grab <b>t</b> random individuals, and the best of them wins. Bigger t = tougher competition.",
    steps: [
      {
        t: "The procedure",
        b: `<p>To pick <b>one</b> parent: choose <b>t</b> individuals at random (<b>with replacement</b>, so the same one can be drawn twice) and return the <b>fittest</b> of them.</p>`,
      },
      {
        t: "Example",
        b: `<p>Population fitnesses: #1 = 3, #2 = 8, #3 = 5, #4 = 1. Tournament size t = 2.</p>`,
        v:
          chips([
            ["#1", "3", "picked"],
            ["#2", "8"],
            ["#3", "5", "winner"],
            ["#4", "1"],
          ]) +
          `<p class="dim" style="margin-top:6px">Drew #1 (3) and #3 (5) → #3 wins. #2 (the best) wasn't even drawn this time.</p>`,
      },
      {
        t: "t controls the pressure",
        b: `<p><b>t = 1</b>: one random pick, so it's pure random selection (no pressure).<br><b>t = 2</b>: mild pressure.<br><b>Large t</b>: the winner is almost always near the top (high pressure).</p>`,
        c: {
          type: "match",
          q: "Match each tournament size to the selection pressure it gives.",
          pairs: [
            ["t = 1", "Pure random selection, no pressure"],
            ["t = 2", "Mild pressure: the fitter of two is kept"],
            ["Large t, close to the population size", "The winner is almost always near the top"],
          ],
          hint: "The more contestants in each tournament, the harder it is for a weak one to win.",
          why: "With t = 1 one contestant always wins its own tournament, so it is random selection. Larger tournaments favour the fit more and more.",
        },
      },
      {
        t: "Quick maths: how often does the best win?",
        b: `<p>With 4 individuals, a single random draw misses the best 3 times in 4. To lose, the best has to be missed by <b>every</b> draw in the tournament. With 2 draws that happens 9 times in 16, so the best wins the other 7 in 16 (about 44%). With more draws it is missed less and less often. Drag t, and press the button to run real tournaments and compare.</p><details class="math-more"><summary>Show the maths</summary><p>The best wins if it is drawn at least once, so $P(\\text{best}) = 1-\\left(1-\\tfrac{1}{P}\\right)^{t}$. For $P=4$, $t=2$: $1-(3/4)^2 = 1-9/16 = 7/16\\approx 44\\%$.</p></details>`,
        v: (box) => NIC.shared.lessons.tournFig(box),
        c: {
          q: "In a tournament of 3 draws, why can the best individual still lose?",
          o: [
            "It was never drawn into the tournament",
            "Its fitness is compared with the average",
            "Ties are always decided against it",
          ],
          a: 0,
          why: "The tournament only compares whoever was drawn. If all three draws miss the best, a weaker one wins, though that gets rarer as t grows.",
        },
      },
      {
        t: "Pros and cons (from the slides)",
        b: `<p>✓ Tunable. ✓ Avoids superfit and superpoor problems (it only compares). ✓ Simple and fast, with no sorting needed.<br>✗ One more parameter (t) to tune.</p>`,
        c: {
          q: "Does tournament selection work with negative fitness values?",
          o: [
            "No: negative values break the comparison",
            "Yes: it only compares which is bigger",
            "Only when the tournament size is 1",
          ],
          a: 1,
          why: "Comparisons don't care about sign or scale.",
        },
      },
    ],
    guide: [
      "Press <b>Run one tournament</b> and watch the t picks (amber), then the winner (green).",
      "Press <b>Run 5,000</b>: the green bars match the grey theory bars.",
      "Drag <b>Tournament size</b> from 1 to 10 and watch the probabilities shift towards the top ranks.",
      "Read the stats on the right: P(best wins), P(worst wins).",
    ],
  };

  L["l4-mutation"] = {
    sum: "How you write a solution down (its <b>encoding</b>) decides which mutations make sense.",
    steps: [
      {
        t: "Encodings",
        b: `<p>A solution's "chromosome" can be:</p>`,
        v: table(
          ["Encoding", "Example"],
          [
            ["Binary string", "<code>0110 1001</code>"],
            ["Integer / k-ary vector", "<code>[3, 5, 2, 8, 7, 2]</code>"],
            ["Real-valued vector", "<code>(0.3, 0.2, 0.4)</code>"],
            ["Permutation", "<code>DEGJACBFIH</code>"],
            ["Tree", "programs (genetic programming, later)"],
          ],
        ),
      },
      {
        t: "What a good operator does",
        b: `<p><b>Exploitation</b>: small changes, so new solutions have a fair chance of being good.<br><b>Exploration</b>: we must be able, in principle, to reach <i>anywhere</i> in the space.</p>`,
      },
      {
        t: "Integer (k-ary) mutation",
        b: `<p><b>Single-gene</b>: pick one gene and set it to a random new value. <b>M-gene</b>: do that M times.</p>`,
        v:
          row("before", g("352872")) +
          row(
            "single-gene",
            g("312872", (i) => (i === 1 ? "changed" : "")),
            "5 → 1",
          ) +
          row(
            "swap",
            g("372852", (i) => (i === 1 || i === 4 ? "changed" : "")),
            "only reorders",
          ),
        c: {
          q: "Why is <b>swap</b> a poor mutation for k-ary encodings?",
          o: [
            "It's slow on long strings",
            "It never creates a value that isn't already there",
            "It creates chromosomes with duplicate values",
          ],
          a: 1,
          why: "If no gene is 9, swapping can never make a 9. That's a failure of exploration.",
        },
      },
      {
        t: "Real-valued mutation",
        b: `<p>Add a small random number (usually from a <b>Gaussian</b> / bell curve) to one gene, or add a small random vector to all genes. The size of the noise (σ) is the step size.</p>`,
        v:
          row("before", g(["0.30", "0.20", "0.40"])) +
          row(
            "after",
            g(["0.30", "0.27", "0.40"], (i) => (i === 1 ? "changed" : "")),
            "+0.07",
          ),
      },
      {
        t: "Permutation mutation",
        b: `<p>In a travelling salesperson problem (TSP) tour, every city must appear <b>exactly once</b>. Single-gene mutation breaks that. Swap keeps it valid.</p>`,
        v:
          row("before", g("DEGJA")) +
          row(
            "single-gene",
            g("DEGDA", (i) => (i === 0 || i === 3 ? "bad" : "")),
            "D twice, J missing ✗",
          ) +
          row(
            "swap",
            g("DAGJE", (i) => (i === 1 || i === 4 ? "good" : "")),
            "still valid ✓",
          ),
        c: {
          type: "match",
          q: "Match each kind of chromosome to a mutation that suits it.",
          pairs: [
            ["Integer (k-ary) vector like [3, 5, 2, 8]", "Single-gene: set one gene to a new random value"],
            ["Real-valued vector like [0.30, 0.20, 0.40]", "Add a small Gaussian number to a gene"],
            ["A TSP tour, where every city appears once", "Swap two cities, so none is lost or repeated"],
          ],
          hint: "A good mutation keeps the chromosome valid and can still reach new values.",
          why: "Single-gene can create a value nobody has, Gaussian noise nudges a real number to a nearby one, and swap rearranges a tour without duplicating or losing cities.",
        },
      },
    ],
    guide: [
      'In the <b>k-ary</b> tab, press Single-gene, M-gene and Swap. Watch the "values present" line: swap never adds new ones.',
      "In <b>Real-valued</b>, drag σ and watch the cloud of mutants grow.",
      "In <b>Permutation</b>, press Single-gene (it turns red: invalid), then Swap (valid).",
      "In <b>Binary</b>, press Mutate 1,000× to see how many bits flip on average.",
    ],
  };
})();

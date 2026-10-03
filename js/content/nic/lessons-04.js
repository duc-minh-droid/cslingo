(function () {
  const partScope = (NIC.shared.lessons = NIC.shared.lessons || {});
  const { bars, chips, g, row, table } = partScope;
  const L = NIC.LESSONS;

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
          q: "Population 0.6, 0.2, 0.8, 0.1. Child 0.5, replace <b>first weaker</b>. Which slot?",
          o: ["Slot 2 (0.2)", "Slot 4 (0.1)", "Slot 1 (0.6)"],
          a: 0,
          why: "Scan: 0.6 isn't weaker, 0.2 is. Stop at slot 2.",
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
      "Reset, switch strategy, and insert the same children. Compare which slots change.",
      'Untick <b>treat equal as weaker</b> and redo "first weaker": S11 lands in a different slot.',
      "Add random children and predict the slot before you insert.",
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
          q: "Your population becomes identical in 3 generations and stops improving. Diagnosis?",
          o: ["Too little pressure", "Too much pressure", "Mutation rate too high"],
          a: 1,
          why: "Fast takeover plus stagnation is premature convergence.",
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
      "Compare <b>Random</b> (colours shuffle but no orange takeover) with <b>Always best</b> (instant orange).",
      'Read the "share of the original best" chart for each method.',
      "Scroll down and press <b>Run experiment</b> to find which tournament size works best.",
    ],
  };

  L["l4-roulette"] = {
    sum: "Roulette: your chance of being picked = <b>your fitness ÷ total fitness</b>.",
    steps: [
      {
        t: "The wheel",
        b: `<p>Give each individual a slice of a roulette wheel <b>sized by its fitness</b>, then spin.</p><p><b>p<sub>i</sub> = f<sub>i</sub> / (sum of all f)</b></p><p>Example: fitnesses 2, 3, 5 (total 10):</p>`,
        v: bars([
          ["f = 2", 20],
          ["f = 3", 30],
          ["f = 5", 50],
        ]),
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
        b: `<p>Add 100 to every fitness: 200, 100.4, 100.3, 100.2, 100.1. The ranking is the same, but now the best only gets 200/601 ≈ <b>33%</b>.</p><span class="key">Roulette depends on <b>absolute</b> fitness values, so you have to design the fitness numbers very carefully.</span>`,
        c: {
          q: "Fitnesses 1, 1, 2. What's the chance of picking the individual with fitness 2?",
          o: ["33%", "50%", "66%"],
          a: 1,
          why: "2 / (1 + 1 + 2) = 2/4 = 50%.",
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
        b: `<p><b>p<sub>i</sub> = rank<sub>i</sub> / (sum of ranks)</b>, and the sum of ranks = <b>P(P+1)/2</b>. For P = 4: sum = 10.</p>`,
        v:
          bars([
            ["rank 4", 40],
            ["rank 3", 30],
            ["rank 2", 20],
            ["rank 1", 10],
          ]) + `<p class="dim" style="margin-top:6px">The superfit 100 now gets 40%, not 99%.</p>`,
        c: {
          q: "Population of 5, linear rank. Chance of picking the best?",
          o: ["5/15 = 33%", "1/5 = 20%", "5/10 = 50%"],
          a: 0,
          why: "Sum = 5·6/2 = 15, and the best has rank 5, so 5/15.",
        },
      },
      {
        t: "Why it's robust",
        b: `<p>Only the order matters, so superfit individuals, negative values and scaling tricks don't matter. For minimising, just rank the other way.</p>`,
      },
      {
        t: "The bias knob: rank<sup>b</sup>",
        b: `<p>Use <b>rank<sup>b</sup></b> instead of rank. <b>b = 2</b> (high bias): 16, 9, 4, 1 out of 30, so the best gets 53%. <b>b = 0.5</b> (low bias) evens things out. <b>b = 0</b>: everyone equal.</p>`,
        v: bars([
          ["rank 4 (b=2)", 53.3, "var(--violet)"],
          ["rank 3", 30, "var(--violet)"],
          ["rank 2", 13.3, "var(--violet)"],
          ["rank 1", 3.3, "var(--violet)"],
        ]),
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
          q: "Tournament size t = 1 is the same as…",
          o: ["Always picking the best", "Random selection", "Roulette"],
          a: 1,
          why: "One contestant always wins its own tournament.",
        },
      },
      {
        t: "Quick maths: how often does the best win?",
        b: `<p>The best wins if it's drawn at least once: <b>P(best) = 1 − (1 − 1/P)<sup>t</sup></b>.</p><p>P = 4, t = 2: 1 − (3/4)² = 1 − 9/16 = <b>7/16 ≈ 44%</b>.</p>`,
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
      "Drag <b>t</b> from 1 to 10 and watch the probabilities shift towards the top ranks.",
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
        b: `<p>Every city must appear <b>exactly once</b>. Single-gene mutation breaks that. Swap keeps it valid.</p>`,
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
          q: "Which mutation suits a TSP tour?",
          o: ["Single-gene random value", "Swap two cities", "Add Gaussian noise"],
          a: 1,
          why: "Swap rearranges without duplicating or losing cities.",
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

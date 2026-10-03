(function () {
  const N = NIC;

  /* ================= Lecture 4 ================= */
  N.registerBoss({
    id: "l4-boss",
    lecture: 4,
    title: "Lecture 4 boss quiz",
    blurb: "Nine questions: selection maths with new numbers, crossover by hand, diagnosing broken GAs.",
    lede: "Selection probabilities, operators and diagnosis, all with numbers you haven't seen yet. Pen and paper for the first four.",
    qs: [
      {
        type: "mcq",
        q: "Roulette-wheel selection, fitnesses 3, 5 and 12. What's the probability of selecting the fitness-12 individual?",
        o: ["0.4", "0.5", "0.6", "0.75"],
        a: 2,
        why: "12 / (3 + 5 + 12) = 12/20 = <b>0.6</b>.",
      },
      {
        type: "mcq",
        q: "Linear rank selection, population of <b>5</b> with distinct fitnesses. What's the probability the best is picked?",
        o: ["1/5 = 0.2", "1/3 ≈ 0.33", "1/2 = 0.5", "5/10 = 0.5"],
        a: 1,
        why: "Ranks 1…5 sum to 15, so the best gets 5/15 = <b>1/3 ≈ 0.333</b>, whatever the actual fitness values are.",
      },
      {
        type: "mcq",
        q: "Tournament selection with t = 3 (with replacement) from a population of 5. What's the probability the best individual wins a tournament?",
        o: ["about 0.2", "about 0.5", "about 0.8", "1 (it always wins)"],
        a: 1,
        hint: "Work out the chance it's missed all three times: (4/5)³. 0.8 × 0.8 = 0.64, and 0.64 × 0.8 is about 0.5.",
        why: "It wins if it's drawn at least once: 1 − (4/5)³ = 1 − 0.512 ≈ <b>0.49, about a half</b>.",
      },
      {
        type: "mcq",
        q: "Population of 10. What's the <b>smallest</b> tournament size t that gives the best individual at least a 50% chance of winning?",
        o: ["3", "7", "15", "30"],
        a: 1,
        hint: "The best is missed every draw with chance 0.9ᵗ; you need that below 0.5. Anchors: 0.9² ≈ 0.8, 0.9⁴ ≈ 0.66, 0.9⁸ ≈ 0.43. So t is between 5 and 8.",
        why: "0.9⁶ ≈ 0.53 is still above a half, 0.9⁷ ≈ 0.48 is below it, so <b>t = 7</b>. Tournament size is a dial for selection pressure.",
      },
      {
        type: "mcq",
        q: "Two-point crossover with cuts after gene 2 and gene 5. P1 = <code>10110010</code>, P2 = <code>01001101</code>. The child takes P1's outer parts and P2's middle. What is it?",
        o: ["<code>10001010</code>", "<code>10110101</code>", "<code>01110010</code>", "<code>10001101</code>"],
        a: 0,
        why: "P1 head <code>10</code> + P2 middle (genes 3–5) <code>001</code> + P1 tail (genes 6–8) <code>010</code> = <b>10001010</b>.",
      },
      {
        type: "cat",
        q: "Does each operator keep the solution valid for its encoding?",
        buckets: ["Keeps it valid", "Can break it"],
        items: [
          ["Swap two genes in a city-order permutation", 0],
          ["Flip one bit in a city-order permutation", 1],
          ["Add small Gaussian noise to a vector of real weights", 0],
          ["1-point crossover of two city-order permutations", 1],
          ["Flip one bit in a binary feature mask", 0],
          ["Set one gene of a permutation to a random city", 1],
        ],
        why: "Permutations need every city exactly once. Swap preserves that; bit flips, random resets and naive 1-point crossover can duplicate or drop cities.",
      },
      {
        type: "mcq",
        q: "Roulette selection, fitnesses 1, 2 and 3, so the best has probability 0.5. You add 10 to every fitness. What happens to the best's probability?",
        o: [
          "Stays at 0.5, because the order is unchanged",
          "Rises, because every fitness got bigger",
          "Drops to about 0.36",
          "Drops to 0, because the gaps vanish",
        ],
        a: 2,
        why: "13 / (11 + 12 + 13) = 13/36 ≈ <b>0.36</b>. Roulette depends on the absolute values, so shifting fitness changes the selection pressure. Rank and tournament would be unaffected.",
      },
      {
        type: "match",
        q: "Match each symptom to the most likely diagnosis.",
        pairs: [
          ["Population becomes identical within a few generations", "Too much selection pressure"],
          ["Fitness drifts randomly and never really improves", "Too little selection pressure"],
          ["The best fitness sometimes drops between generations", "Generational GA without elitism"],
          ["When minimising tour length, the longest tours breed the most", "Roulette used on raw cost values"],
        ],
        why: "Pressure too high collapses diversity; too low gives no direction. A drop in best fitness means the best wasn't protected. Raw costs on a roulette wheel reward the worst when minimising.",
      },
      {
        type: "order",
        q: "Order one iteration of a steady-state GA with tournament selection and replace-worst.",
        items: [
          "Run a tournament to pick a parent",
          "Copy the parent and mutate the copy",
          "Evaluate the child's fitness",
          "Find the current worst member",
          "Replace the worst with the child if the child is no worse",
        ],
        why: "Select → vary → evaluate → locate the worst → conditionally replace. Then loop until the evaluation budget runs out.",
      },
    ],
  });
})();

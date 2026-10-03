(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { M, TF } = partScope;
  const N = NIC,
    B = N.bank;

  /* ---------- Lecture 4 ---------- */
  B.add("l4-types", [
    M(
      "Generational GA, population 50, elitism keeps the best 2. How many new children are needed each generation?",
      ["50", "48", "2", "52"],
      1,
      "Two slots are filled by the unchanged elites, so 48 are children.",
    ),
    {
      type: "cat",
      q: "Generational or steady-state?",
      buckets: ["Generational", "Steady-state"],
      items: [
        ["The whole population is replaced at once", 0],
        ["A good child can be picked as a parent in the very next step", 1],
        ["Needs elitism to be sure the best survives", 0],
        ["One or two children per iteration", 1],
      ],
      why: "Generational swaps everything at once. Steady-state trickles children in, so good ones are used immediately.",
    },
    M(
      "When is a generational GA especially convenient?",
      [
        "When each evaluation is almost instant",
        "When you can evaluate many children in parallel",
        "When the population has only one member",
        "Never: steady-state is always better",
      ],
      1,
      "A whole generation is a batch of independent evaluations: ideal for parallel hardware.",
    ),
    M(
      "Elitism keeps the best half of the population every generation. Likely effect?",
      ["More exploration", "Very greedy", "No effect", "Fitness drops"],
      1,
      "Heavy elitism is strong selection pressure.",
    ),
    TF(
      "Elitism copies the best individuals into the next generation unchanged.",
      true,
      "That's exactly what guarantees the best is never lost.",
    ),
  ]);
  B.add("l4-replacement", [
    M(
      "Population 0.4, 0.7, 0.2, 0.5 (maximising). A child scores 0.45. Which slot does <b>replace first weaker</b> (scanning from slot 1) overwrite?",
      ["Slot 1 (0.4)", "Slot 3 (0.2)", "Slot 4 (0.5)", "None"],
      0,
      "Slot 1 (0.4) is already weaker than 0.45, so the scan stops there.",
    ),
    M(
      "Population 0.4, 0.7, 0.2, 0.5 (maximising). A child scores 0.45. Which slot does <b>replace weakest</b> overwrite?",
      ["Slot 1 (0.4)", "Slot 3 (0.2)", "Slot 2 (0.7)", "None"],
      1,
      "The weakest member is 0.2 in slot 3.",
    ),
    M(
      "Which replacement strategy is cheaper to run?",
      ["Replace weakest", "Replace first weaker", "They cost the same", "Neither needs any comparisons"],
      1,
      "First weaker can stop scanning early; weakest must check everyone.",
    ),
    M(
      "A child scores lower than every member. What happens under both strategies?",
      ["It replaces the weakest anyway", "It's discarded", "It replaces the best", "It replaces a random member"],
      1,
      "Both only replace a member the child beats.",
    ),
    {
      type: "cat",
      q: "Which strategy is described?",
      buckets: ["Replace weakest", "Replace first weaker"],
      items: [
        ["Greedier, with higher selection pressure", 0],
        ["Keeps more diversity", 1],
        ["The best member always survives", 0],
        ["Weak members can survive longer", 1],
      ],
      why: "Weakest always removes the bottom; first weaker might remove a middling member and spare the worst.",
    },
  ]);
  B.add("l4-pressure", [
    {
      type: "cat",
      q: "Too little or too much selection pressure?",
      buckets: ["Too little", "Too much"],
      items: [
        ["Diversity vanishes within a few generations", 1],
        ["Fitness wanders with no clear upward trend", 0],
        ["The population fills with copies of one early individual", 1],
        ["Good solutions appear, then get lost again", 0],
      ],
      why: "Too much: premature convergence. Too little: drift, with good solutions not reliably kept.",
    },
    M(
      "In tournament selection, which change raises the selection pressure?",
      ["Smaller tournaments", "Larger tournaments", "Larger population", "Higher mutation"],
      1,
      "Bigger tournaments almost always contain a top individual.",
    ),
    M(
      "Selection only (no mutation, no crossover), run for a long time. What happens?",
      [
        "Endless variety, as selection keeps shuffling the population",
        "One individual's copies take over",
        "Fitness keeps rising forever",
        "The population slowly dies out",
      ],
      1,
      "Selection only copies existing individuals, so it narrows until one takes over.",
    ),
    M(
      "In rank selection with probability ∝ rank<sup>b</sup>, raising b…",
      ["lowers pressure", "raises pressure", "has no effect", "reverses the ranking"],
      1,
      "A bigger exponent gives the top ranks an even larger share.",
    ),
    TF(
      "Some selection pressure is necessary; the goal is a moderate, tunable amount.",
      true,
      "No pressure = no progress; too much = premature convergence.",
    ),
  ]);
  B.add("l4-roulette", [
    M(
      "Roulette wheel, fitnesses 2, 3, 5 and 10. Probability of picking the fitness-10 individual?",
      ["0.10", "0.25", "0.5", "0.75"],
      2,
      "10 / (2 + 3 + 5 + 10) = 10/20 = 0.5.",
    ),
    M(
      "Roulette wheel, fitnesses 2, 3, 5 and 10. In 20 spins, about how many times do you expect the fitness-3 individual to be picked?",
      ["1", "3", "5", "10"],
      1,
      "Its share is 3/20, so 20 × 3/20 = 3.",
    ),
    M(
      "One individual owns 95% of the wheel. What happens next?",
      [
        "Nothing special: it breeds like the rest",
        "Its copies take over the population almost immediately",
        "It's rarely picked, since big slices are penalised",
        "The wheel automatically resizes its slice",
      ],
      1,
      "The superfit problem: roulette hands it nearly every parent slot.",
    ),
    M(
      "You're minimising tour length but feed raw lengths into roulette. What goes wrong, and one fix?",
      [
        "Nothing",
        "Long tours get the biggest slices",
        "Short tours are favoured too strongly; add 100",
        "It only works with integers",
      ],
      1,
      "Roulette rewards big numbers, so it favours the worst tours unless transformed.",
    ),
    TF(
      "Roulette selection can use negative fitness values directly.",
      false,
      "A slice can't have negative size, so fitness must be shifted or transformed first.",
    ),
  ]);
  B.add("l4-rank", [
    M(
      "Linear rank selection, population of 4. Probability that the <b>worst</b> is picked?",
      ["0", "0.1", "0.25", "0.4"],
      1,
      "Ranks 1+2+3+4 = 10, so the worst gets 1/10.",
    ),
    M(
      "Fitnesses 1000, 2, 1, 0.5, 0.1 with linear rank selection. Probability of the best?",
      ["about 0.99", "1/3", "1/5", "1/2"],
      1,
      "Ranks 5,4,3,2,1 sum to 15, so 5/15. The 1000 no longer matters.",
    ),
    M(
      "Minimising cost with rank selection: who gets the top rank?",
      ["The highest cost", "The lowest cost", "A random member", "The newest child"],
      1,
      "Rank from best to worst, so the cheapest gets the biggest share.",
    ),
    M(
      "A downside of rank selection?",
      [
        "It can't handle negative fitness values at all",
        "It ignores how much better one is, and must sort",
        "It's identical to roulette selection in every case",
        "It applies no selection pressure",
      ],
      1,
      "Only order matters, so a huge lead counts the same as a tiny one.",
    ),
    TF(
      "Adding 100 to every fitness leaves rank selection's probabilities unchanged.",
      true,
      "The order doesn't change, so neither do the ranks.",
    ),
  ]);
  B.add("l4-tournament", [
    M(
      "Tournament size 2, with replacement, population of 2. Probability the better one wins?",
      ["1/2", "3/4", "1", "1/4"],
      1,
      "It loses only if the worse one is drawn twice: 1 − (1/2)² = 3/4.",
    ),
    M(
      "Tournament size 2 with replacement, population 4. Can the worst ever win?",
      [
        "Never: the worst always loses",
        "Yes, if it's drawn twice",
        "Yes, half of the time",
        "Only if mutation is switched on",
      ],
      1,
      "(1/4)² = 1/16.",
    ),
    M(
      "Tournament size equal to the population, without replacement. What happens?",
      ["Random selection", "The best always wins", "The worst always wins", "No one wins"],
      1,
      "Everyone is in every tournament.",
    ),
    M(
      "Tournament size 4 with replacement, population 10. Probability the best wins?",
      ["about 0.1", "about 0.34", "about 0.66", "about 0.9"],
      1,
      "1 − 0.9⁴ ≈ 1 − 0.66 = 0.34.",
      { hint: "0.9² = 0.81, and 0.81² ≈ 0.66." },
    ),
    M(
      "Why is tournament selection cheap?",
      [
        "It sorts the population only once",
        "It only compares a few individuals",
        "It skips evaluating the losers",
        "It uses a precomputed lookup table",
      ],
      1,
      "Pick t, keep the best. That's it.",
    ),
  ]);
  B.add("l4-mutation", [
    {
      type: "match",
      q: "Match each encoding with a mutation that suits it.",
      pairs: [
        ["Binary string", "Flip a bit"],
        ["Permutation of cities", "Swap two positions"],
        ["Vector of real numbers", "Add small Gaussian noise"],
        ["k-ary string (digits 0–9)", "Reset one gene to a random digit"],
      ],
      why: "Each operator keeps the solution valid for its encoding.",
    },
    M(
      "Mutation rate 1/L on a 100-bit string. About how many bits flip per child?",
      ["0", "1", "10", "50"],
      1,
      "100 × 1/100 = 1 on average.",
    ),
    M(
      "Gaussian mutation with an enormous standard deviation behaves like…",
      ["Hillclimbing", "Random search", "No mutation", "Crossover"],
      1,
      "Huge steps throw away locality, so exploitation is lost.",
    ),
    M(
      '"Every solution must be reachable in principle" is the requirement for…',
      ["Exploitation", "Exploration", "Elitism", "Evaluation"],
      1,
      "Without it, parts of the space can never be searched.",
    ),
    TF(
      "Reversing a segment (inversion) is a valid mutation for permutations.",
      true,
      "It reorders cities without duplicating or dropping any.",
    ),
  ]);
  B.add("l4-crossover", [
    M(
      "1-point crossover with the cut after gene 5. P1 = ABCDEFGH, P2 = abcdefgh. First child?",
      ["ABCDEfgh", "abcdeFGH", "ABCDEFGH", "AbCdEfGh"],
      0,
      "Head of P1 (ABCDE) + tail of P2 (fgh).",
    ),
    M(
      "Uniform crossover, P1 = 1111, P2 = 0000, mask 0110 (1 = take from P2). Child?",
      ["1001", "0110", "1111", "0101"],
      0,
      "Genes 2 and 3 come from P2 (0), the rest from P1 (1): 1001.",
    ),
    M(
      "Crossing two identical parents gives…",
      ["A random child", "A child identical to them", "A child with mutations", "Two different children"],
      1,
      "Crossover only rearranges what the parents have; it can't create new values.",
    ),
    M(
      "Why do permutations need special crossovers (like order crossover)?",
      [
        "To make crossover faster on long tours",
        "Cut-and-splice can duplicate some cities and drop others",
        "Permutations can't be crossed over at all, so it's a workaround",
        "To add mutation at the same time",
      ],
      1,
      "Every city must appear exactly once.",
    ),
    {
      type: "cat",
      q: "Crossover or mutation?",
      buckets: ["Crossover", "Mutation"],
      items: [
        ["Combines genes from two parents", 0],
        ["Changes one parent slightly", 1],
        ["Can introduce a value no parent had", 1],
        ["Needs at least two parents", 0],
      ],
      why: "Crossover mixes existing material; mutation invents new material.",
    },
  ]);
  B.add("l4-lab", [
    M(
      "Target is a 144-pixel picture. A candidate gets 36 pixels wrong. Its fitness?",
      ["0.25", "0.5", "0.75", "0.36"],
      2,
      "108 of 144 match: 108/144 = 0.75.",
    ),
    M(
      "What fitness do you expect from a completely random picture?",
      ["0", "about 0.5", "about 0.9", "1"],
      1,
      "Each pixel matches with probability 1/2.",
    ),
    M(
      "You set mutation so high that half the pixels flip in every child. What happens?",
      ["Fast convergence", "Children are close to random", "Diversity falls to zero", "Nothing changes"],
      1,
      "Too much mutation destroys what selection built.",
    ),
    M(
      "Best is rising, mean is well below it, diversity stays high. What does this suggest?",
      ["Premature convergence", "Healthy search", "A bug", "Too much pressure"],
      1,
      "A gap between best and mean plus diversity means the search hasn't collapsed.",
    ),
    M(
      "You grow the population from 10 to 100. Per generation, the evaluation cost…",
      ["stays the same", "goes up about 10×", "halves", "goes up 100×"],
      1,
      "Ten times as many individuals to score.",
    ),
  ]);
})();

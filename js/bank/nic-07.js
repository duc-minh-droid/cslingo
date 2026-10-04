(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
  B.add("l4-replacement", [
    M(
      "Population 0.6, 0.3, 0.8, 0.2 (maximising). A child scores 0.5. Which slot does replace <b>first weaker</b> take (scanning from slot 1)?",
      ["Slot 1", "Slot 2", "Slot 3", "Slot 4"],
      1,
      "Slot 1 (0.6) isn't weaker than 0.5; slot 2 (0.3) is, so the scan stops there.",
    ),
    M(
      "Population 0.6, 0.3, 0.8, 0.2 (maximising). A child scores 0.5. Which slot does replace <b>weakest</b> take?",
      ["Slot 1", "Slot 2", "Slot 3", "Slot 4"],
      3,
      "The weakest is 0.2 in slot 4.",
    ),
    M(
      "The slides' first-weaker example only works if…",
      ["ties count as weaker", "the child is best", "the population is sorted", "there's elitism"],
      0,
      "A child of equal fitness replaces the member it ties with.",
    ),
    TF(
      "Replace-first-weaker always removes the worst member.",
      false,
      "It removes the first member weaker than the child, which may not be the worst.",
    ),
    M(
      "Which strategy applies higher selection pressure?",
      ["Replace first weaker", "Replace weakest", "Same", "Neither"],
      1,
      "Always evicting the bottom is greedier.",
    ),
    M(
      "What's the cost of replace-weakest per child?",
      [
        "A single comparison between the child and one member",
        "A scan of the population to find the worst",
        "Nothing: the worst member is always known in advance",
        "A full sort of every child",
      ],
      1,
      "Unless you maintain a sorted structure.",
    ),
    M(
      "A child is worse than every member. What happens?",
      ["It replaces the worst", "It's thrown away", "It replaces the best", "It's added anyway"],
      1,
      "Neither strategy lets it in.",
    ),
    M(
      "Replace a random member. Big risk?",
      ["None", "The current best can be lost", "The population grows", "Fitness can't be computed"],
      1,
      "No protection for good members.",
    ),
  ]);
  B.add("l4-pressure", [
    M(
      "Selection pressure is…",
      [
        "the mutation rate applied to children",
        "how much more likely a fit individual is to be picked",
        "the number of individuals in the population",
        "the number of generations the run lasts",
      ],
      1,
      "A measure of greediness.",
    ),
    M(
      "Talent-show judges who are far too harsh. What's the EA equivalent?",
      ["Low pressure", "High pressure", "No pressure", "High mutation"],
      1,
      "Late bloomers never get a chance.",
    ),
    M(
      "In the lecture's pressure heatmap, each row is…",
      ["one individual", "one generation", "one gene", "one run"],
      1,
      "Time runs down the picture.",
    ),
    M(
      "Tournament size 1 gives…",
      ["maximum pressure", "no pressure", "elitism", "roulette"],
      1,
      "One random pick, no comparison.",
    ),
    TF(
      "Higher selection pressure always gives better final results.",
      false,
      "Too much pressure causes premature convergence.",
    ),
    {
      type: "match",
      q: "Match each method to its pressure knob.",
      pairs: [
        ["Tournament selection", "Tournament size t"],
        ["Rank selection", "The rank exponent (bias)"],
        ["Generational GA", "Number of elites kept"],
      ],
      why: "Most methods expose a dial.",
    },
    M(
      "Roulette's selection pressure depends on…",
      [
        "only the size of the population",
        "how spread out the fitness values are",
        "the mutation rate",
        "nothing: it's fixed",
      ],
      1,
      "Big differences in fitness mean strong pressure.",
    ),
    M(
      "Fitness wanders slowly, with no clear improvement. Likely fix?",
      [
        "Lower the selection pressure further",
        "Raise selection pressure a little",
        "Remove mutation entirely",
        "Scale all fitness values down",
      ],
      1,
      "It needs more pull towards good solutions.",
    ),
  ]);
  B.add("l4-roulette", [
    M("Fitnesses 1, 1 and 2. Probability of picking the 2?", ["1/4", "1/3", "1/2", "2/3"], 2, "2 / (1 + 1 + 2) = 1/2."),
    M("Four individuals, all fitness 4. Probability of each?", ["1/4", "1/2", "4", "1"], 0, "Equal slices."),
    M(
      "One individual has fitness 100 and four others have 1. Roughly what's its share of the wheel?",
      ["about 20%", "about 50%", "about 96%", "100%"],
      2,
      "100 / 104 ≈ 0.96: the superfit problem.",
    ),
    M(
      "You add a large constant to every fitness. What happens to selection?",
      ["It gets stronger", "It moves towards uniform", "Nothing changes", "It reverses the ranking"],
      1,
      "Roulette depends on absolute values.",
    ),
    TF(
      "With roulette, selection probability is proportional to fitness.",
      true,
      "Slice size = fitness / total fitness.",
    ),
    M(
      "Over N spins, how many times do you expect individual i to be picked?",
      ["N", "N × fᵢ / (total fitness)", "fᵢ", "1"],
      1,
      "Its share times the number of spins.",
    ),
    M(
      "Some fitness values are negative. Common fix?",
      [
        "Ignore the negative individuals and carry on as normal",
        "Shift every value up, or use rank/tournament",
        "Square every fitness value",
        "Delete those individuals",
      ],
      1,
      "Slices can't be negative.",
    ),
    M(
      "Minimising cost with roulette. A standard transformation?",
      ["Use the cost directly as fitness", "Use 1 / cost (or max − cost)", "Use cost²", "Use −cost directly"],
      1,
      "Lower cost must mean a bigger slice.",
    ),
  ]);
  B.add("l4-rank", [
    M(
      "Linear rank selection, population 3. Probability of the best?",
      ["1/3", "1/2", "2/3", "1"],
      1,
      "Ranks 1 + 2 + 3 = 6, so 3/6.",
    ),
    M(
      "Linear rank selection, population 3. Probability of the worst?",
      ["0", "1/6", "1/3", "1/2"],
      1,
      "Ranks 1 + 2 + 3 = 6, so the worst gets 1/6.",
    ),
    M(
      "Linear rank selection, population 10. Probability of the best?",
      ["1/10", "about 0.18", "1/2", "about 0.9"],
      1,
      "10 / (1 + … + 10) = 10/55 ≈ 0.18.",
    ),
    TF("Rank selection needs the population sorted by fitness.", true, "Ranks come from the order."),
    M(
      "Probability ∝ rank<sup>b</sup> with b = 0. What is selection now?",
      ["Maximum pressure", "Uniform", "Only the best", "Roulette"],
      1,
      "rank⁰ = 1 for everyone.",
    ),
    M(
      "Why is rank selection robust to one superfit individual?",
      [
        "It removes that individual from the breeding pool entirely",
        "Only its position counts, not its fitness size",
        "It caps fitness at a fixed maximum",
        "It squares every fitness first",
      ],
      1,
      "Being far ahead doesn't earn extra share.",
    ),
    M(
      "Minimising with rank selection: which gets rank 1 (the smallest share)?",
      ["The cheapest", "The most expensive", "A random one", "The newest one"],
      1,
      "Worst gets the lowest rank.",
    ),
    M(
      "How does rank selection's pressure react when all fitness values become very close?",
      ["Drops to zero", "Stays the same", "Explodes", "Reverses"],
      1,
      "Unlike roulette, it's scale-independent.",
    ),
  ]);
  B.add("l4-tournament", [
    M(
      "Tournament size 2 with replacement, population 5. Probability the best wins?",
      ["0.2", "0.36", "0.64", "0.8"],
      1,
      "1 − (4/5)² = 1 − 0.64 = 0.36.",
      { hint: "It loses only if it's missed in both draws: 0.8 × 0.8." },
    ),
    M(
      "Tournament size 3 with replacement, population 3. Probability the best wins?",
      ["about 0.33", "about 0.5", "about 0.7", "1"],
      2,
      "1 − (2/3)³ = 1 − 8/27 = 19/27 ≈ 0.70.",
      { hint: "It's missed all three times with chance (2/3)³ = 8/27, a bit under a third." },
    ),
    M(
      "Tournament size 2 <b>without</b> replacement, population 5. Probability the best is in the pair (and wins)?",
      ["0.2", "0.36", "0.4", "0.5"],
      2,
      "2 of the 5 are chosen: 2/5.",
      { hint: "Without replacement the pair is 2 different members. What fraction of the 5 is that?" },
    ),
    TF("Tournament selection works fine with negative fitness values.", true, "It only compares values."),
    M(
      "Why doesn't tournament selection need the population's total fitness?",
      [
        "It does need it, like roulette",
        "It only compares the few individuals drawn",
        "It uses the ranks instead",
        "It picks winners completely at random",
      ],
      1,
      "No global information required.",
    ),
    M(
      "Increasing t does what to selection pressure?",
      ["Lowers it", "Raises it", "Nothing", "Randomises it"],
      1,
      "The top individuals appear in more tournaments.",
    ),
    M(
      "Why is tournament selection easy to run in parallel?",
      [
        "It isn't: tournaments must run one after another",
        "Each tournament is independent and small",
        "It needs a sorted population, which parallelises well",
        "It needs a global total, which is easy to share",
      ],
      1,
      "Many tournaments can run at once.",
    ),
    M(
      "Tournament selection's main extra cost?",
      [
        "Sorting the whole population",
        "One more parameter (t) to tune",
        "It can't handle negative fitness",
        "It needs a lot of memory",
      ],
      1,
      "The slides' one listed drawback.",
    ),
  ]);
  B.add("l4-mutation", [
    M(
      "Mutation rate far too low. Effect?",
      ["Too much exploration", "Very slow exploration", "Random search", "Crash"],
      1,
      "The search barely moves.",
    ),
    M(
      "Bit-flip rate 0.5 per bit. Effect?",
      [
        "Only tiny steps, since each bit rarely changes",
        "Children are basically random strings",
        "No change to the children",
        "The same as elitism",
      ],
      1,
      "Half the bits flip: all inheritance is lost.",
    ),
    TF(
      "Both swap and insertion mutation keep a permutation valid.",
      true,
      "They rearrange cities without duplicating any.",
    ),
    {
      type: "cat",
      q: "Valid mutation for a permutation (city order)?",
      buckets: ["Valid", "Invalid"],
      items: [
        ["Swap two cities", 0],
        ["Move one city to a new position", 0],
        ["Replace one city with a random city", 1],
        ["Reverse a segment", 0],
        ["Flip a bit of the city index", 1],
      ],
      why: "Valid operators only reorder; invalid ones can duplicate or drop cities.",
    },
    M(
      "In Gaussian mutation, the standard deviation controls…",
      ["the population size", "the typical step size", "selection pressure", "crossover rate"],
      1,
      "Small σ = small steps.",
    ),
    TF("An EA can work with mutation only (no crossover).", true, "Evolution strategies often do."),
    M(
      "Why does random-reset mutation help k-ary strings?",
      [
        "It doesn't: swapping genes is always better for k-ary strings",
        "It can add values nobody currently has",
        "It sorts genes into order",
        "It removes duplicate genes",
      ],
      1,
      "Swaps only rearrange what's there.",
    ),
    M(
      "Small mutations help ___; being able to reach anywhere helps ___.",
      ["exploration; exploitation", "exploitation; exploration", "selection; replacement", "speed; memory"],
      1,
      "Exploit nearby, explore everywhere.",
    ),
  ]);
  B.add("l4-crossover", [
    M(
      "1-point crossover, cut after gene 3: P1 = 110011, P2 = 001100. First child?",
      ["110100", "001011", "110011", "111100"],
      0,
      "Head 110 from P1, tail 100 from P2.",
    ),
    M(
      "2-point crossover, cuts after genes 2 and 4: P1 = AAAAAA, P2 = BBBBBB. Child taking P1's outer parts?",
      ["AABBAA", "BBAABB", "AAABBB", "ABABAB"],
      0,
      "Genes 3–4 come from P2.",
    ),
    M(
      "Uniform crossover, P1 = ABCD, P2 = wxyz, mask 1010 (1 = take from P2). Child?",
      ["wByD", "AxCz", "wxCD", "ABCD"],
      0,
      "Positions 1 and 3 from P2.",
    ),
    TF(
      "Crossover can create a gene value that neither parent has.",
      false,
      "It only recombines existing values; that's mutation's job.",
    ),
    M(
      "With 1-point crossover, which genes get separated most often?",
      [
        "Neighbouring genes",
        "Genes far apart on the string",
        "The first gene",
        "None: every pair is split equally often",
      ],
      1,
      "Almost any cut separates the two ends.",
    ),
    M(
      "What does order crossover (for permutations) preserve?",
      [
        "Nothing: it builds completely random tours from both parents",
        "A segment of one parent plus the other's order",
        "Only the starting city of each parent",
        "A random selection of cities",
      ],
      1,
      "Valid tours that inherit from both.",
    ),
    M(
      "Crossover rate set to 0. What's left?",
      ["Nothing works", "A mutation-only EA", "Random search", "Exhaustive search"],
      1,
      "Children are mutated copies.",
    ),
    M(
      'The idea behind crossover is that good partial solutions ("building blocks")…',
      [
        "are usually destroyed by crossover",
        "found in different parents can be combined",
        "can't exist in real problems",
        "only ever come from mutation",
      ],
      1,
      "Mix good parts from different individuals.",
    ),
  ]);
})();

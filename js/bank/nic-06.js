(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { M, TF, mx } = partScope;
  const B = NIC.bank;
  B.add("l3-hc", [
    M(
      "What mutation does the lecture's HC use on tours?",
      ["Rebuild the whole tour", "Swap two adjacent cities", "Add a city", "Delete a city"],
      1,
      "A small move to a neighbouring tour.",
    ),
    M(
      "HC is at <code>ACDEB</code> (33). Swapping the first two cities gives <code>CADEB</code>. What happens?",
      [
        "Rejected: it's 35, longer than now",
        "Accepted: it's 33, no worse",
        "Accepted: it's 28, shorter",
        "Rejected: it's 38, much longer",
      ],
      1,
      "C–A 7 + A–D 4 + D–E 9 + E–B 10 + B–C 3 = 33, equal, so it's kept.",
      { fig: mx() },
    ),
    M(
      "When does a basic HC stop?",
      [
        "After a single step, whether or not it improved",
        "When the budget ends or no neighbour is better",
        "When the fitness becomes negative for the first time",
        "Never: it keeps going forever",
      ],
      1,
      "Budget or local optimum.",
    ),
    TF(
      "Hillclimbing can escape a local optimum by itself.",
      false,
      "It never accepts a worse move, so it stays stuck.",
    ),
    M(
      "What does HC remember?",
      ["Every solution it has seen", "Only its current solution", "A tabu list", "A population"],
      1,
      "That's why it's cheap, and why it gets stuck.",
    ),
    M(
      "HC only accepts strictly better moves. What happens on a plateau?",
      ["It crosses it", "It freezes", "It jumps randomly", "It restarts"],
      1,
      "Accepting equal moves lets it drift across.",
    ),
    M(
      "Where is HC most useful?",
      [
        "Proving that a solution is the global optimum",
        "As a fast local improver, often with restarts",
        "Encrypting data by scrambling it step by step",
        "Sorting large lists",
      ],
      1,
      "Cheap, quick polishing.",
    ),
    M(
      "Same total budget: 10 short HC runs from random starts, or 1 long run?",
      [
        "The single long run always does better, since it never restarts",
        "Restarts give more chances near the global best",
        "They're exactly equivalent in every case",
        "Neither can find good solutions",
      ],
      1,
      "One run can only climb one hill.",
    ),
  ]);
  B.add("l3-landscape", [
    M(
      "In a fitness landscape picture, height represents…",
      ["time", "fitness", "mutation rate", "population size"],
      1,
      "Each position is a solution; height is how good it is.",
    ),
    M(
      'What decides which solutions are "next to" each other on a landscape?',
      ["Alphabetical order", "The mutation operator", "The fitness", "Random chance"],
      1,
      "Neighbours are one mutation apart.",
    ),
    M(
      "A trap problem whose slopes lead away from the best solution is…",
      ["unimodal", "deceptive", "flat", "linear"],
      1,
      "Following the gradient misleads you.",
    ),
    TF(
      "The same problem can have a different landscape shape under a different mutation operator.",
      true,
      "Change the operator and you change the neighbours.",
    ),
    M(
      "Why are plateaus hard?",
      [
        "The slopes around them are too steep",
        "All neighbours look the same",
        "They're too small to find",
        "They hide many small peaks",
      ],
      1,
      "No gradient to follow.",
    ),
    M(
      'A "needle in a haystack" landscape has one good point and everything else equal. Best strategy?',
      [
        "Hillclimbing, following the slope",
        "Nothing does better than random search",
        "Tabu search, which avoids revisits",
        "Crossover, which mixes good parts",
      ],
      1,
      "No information anywhere except at the needle.",
    ),
    M(
      "A rugged landscape has…",
      ["a single smooth peak", "many local optima", "no peaks at all", "only flat plateaus"],
      1,
      "Lots of small hills to get stuck on.",
    ),
    M(
      "In big real problems, where do good solutions tend to be?",
      [
        "Spread evenly across the whole space",
        "In tiny regions of a mostly poor space",
        "Only at the edges of the space",
        "At purely random positions",
      ],
      1,
      "That's why small steps near good solutions pay off.",
    ),
  ]);
  B.add("l3-neighbourhood", [
    M(
      "Bit-flip mutation on a 20-bit string: how many neighbours?",
      ["2", "20", "40", "about a million"],
      1,
      "One per bit.",
    ),
    M(
      '"Swap any two cities" on an 8-city tour: how many neighbours?',
      ["8", "16", "28", "56"],
      2,
      "C(8,2) = 8 × 7 / 2 = 28.",
    ),
    M(
      "Adjacent swaps on 6 positions, <b>not</b> wrapping around: how many neighbours?",
      ["5", "6", "12", "15"],
      0,
      "Pairs (1,2) … (5,6): five.",
    ),
    TF(
      "A bigger neighbourhood usually means fewer local optima.",
      true,
      "More moves means more chances that one of them is an improvement.",
    ),
    M(
      "The neighbourhood of a solution s is…",
      [
        "the best solution found anywhere so far in the run",
        "every solution one mutation away from s",
        "the whole search space around s",
        "s itself and nothing else",
      ],
      1,
      "Defined entirely by the mutation operator.",
    ),
    M(
      "Flipping any <b>two</b> bits of a 10-bit string: how many neighbours?",
      ["10", "20", "45", "100"],
      2,
      "C(10,2) = 45.",
    ),
    M(
      "A solution is a local optimum under single-bit flips. Under two-bit flips it…",
      ["must still be one", "might not be", "becomes the global optimum", "disappears"],
      1,
      "Local optimality depends on the neighbourhood.",
    ),
    M(
      "What's the cost of a huge neighbourhood?",
      [
        "None: bigger is always better",
        "Each step takes longer, and moves are less local",
        "There are fewer solutions to choose from",
        "It stops the fitness function working",
      ],
      1,
      "The trade-off: fewer traps, more work per step.",
    ),
  ]);
  B.add("l3-local", [
    M(
      "Monte Carlo search with acceptance probability p = 1 becomes…",
      ["Hillclimbing", "A random walk", "Tabu search", "Exhaustive search"],
      1,
      "Always moving means no selection at all.",
    ),
    M(
      "What does a tabu list store?",
      [
        "The best solution found so far, kept for the final answer",
        "Recently visited solutions or moves, banned for now",
        "All the neighbours of the current solution",
        "The fitness values of every solution",
      ],
      1,
      "It stops the search walking straight back.",
    ),
    M(
      "How many neighbours does tabu search evaluate per step?",
      ["One random one", "All of them", "None", "Two"],
      1,
      "It picks the best non-tabu neighbour, so it must look at all.",
    ),
    M(
      "Why does local search keep a best-so-far solution?",
      [
        "So the run can be logged and replayed later for debugging",
        "Worse moves mean the current one may not be best",
        "Because tabu search requires it to work",
        "To save memory during the run",
      ],
      1,
      "Never lose the best you've found.",
    ),
    TF("Monte Carlo search returns its current solution at the end.", false, "It should return the best-so-far."),
    {
      type: "cat",
      q: "Cost of one step?",
      buckets: ["Evaluates one neighbour", "Evaluates all neighbours"],
      items: [
        ["Monte Carlo search", 0],
        ["Tabu search", 1],
        ["Hillclimbing (random neighbour)", 0],
      ],
      why: "Tabu pays more per step to always make the best allowed move.",
    },
    M(
      "What happens if the tabu tenure (list length) is very long?",
      [
        "Nothing: longer lists are always safer against cycling",
        "Too many moves get banned, blocking good paths",
        "It cycles between solutions more often than before",
        "It turns into plain hillclimbing",
      ],
      1,
      "Too long is as bad as too short, in the other direction.",
    ),
    M(
      "Which of these escapes local optima by design?",
      [
        "Plain hillclimbing, which only ever moves uphill",
        "Monte Carlo and tabu search",
        "Exhaustive search",
        "None of these",
      ],
      1,
      "Both deliberately allow downhill moves.",
    ),
  ]);
  B.add("l3-population", [
    M(
      "Why does a population method need a selection step?",
      [
        "To remove the weakest members each step",
        "It must choose which of many candidates to vary",
        "To keep the population sorted by fitness",
        "It doesn't: every member is varied equally",
      ],
      1,
      "More than one current solution means a choice.",
    ),
    M(
      "Why does a population make recombination possible?",
      [
        "It doesn't; only mutation works there",
        "There are several parents whose parts can be mixed",
        "It adds extra mutation to each child",
        "It removes the need for a fitness function",
      ],
      1,
      "You need two solutions to cross.",
    ),
    M(
      "In the lecture's steady-state example, a mutant replaces the worst member when…",
      [
        "always, whatever its fitness",
        "it's better than that worst member",
        "it's worse than the best member",
        "at random, half the time",
      ],
      1,
      "Only improvements over the worst get in.",
    ),
    TF(
      "A population method is just several independent hillclimbers running side by side.",
      false,
      "Selection and crossover make the members interact.",
    ),
    M(
      "What's diversity good for?",
      [
        "It makes each fitness evaluation run faster",
        "It keeps different regions of the space in play",
        "It saves memory, since similar members are compressed",
        "It guarantees the optimum",
      ],
      1,
      "Variety = options.",
    ),
    M(
      "The population converges on a mediocre solution very early. Name?",
      ["Elitism", "Premature convergence", "Genetic drift", "Exploration"],
      1,
      "Everyone ends up in the same place before the good regions are found.",
    ),
    M(
      '"Phenotype convergence" means members have…',
      [
        "the same encoding (genes)",
        "the same fitness or behaviour",
        "very different fitness values",
        "no fitness at all",
      ],
      1,
      "Genotype = same genes; phenotype = same result.",
    ),
    M(
      "You double the population size. Trade-off?",
      [
        "Nothing changes at all, since selection adapts",
        "More diversity, but double the evaluations",
        "Less diversity, but only half the evaluations per generation",
        "Each generation runs faster",
      ],
      1,
      "Diversity costs evaluations.",
    ),
  ]);

  B.add("l4-types", [
    M(
      "Generational GA without elitism. Can the best fitness drop from one generation to the next?",
      [
        "Never: selection always protects the best individual",
        "Yes: the best may not be copied across",
        "Only when crossover is switched on",
        "Only when mutation is switched on",
      ],
      1,
      "Nothing protects it.",
    ),
    M(
      "Elitism with n = 1 guarantees what?",
      [
        "That the optimum will be found",
        "The best fitness never goes down",
        "The population stays more diverse",
        "Each generation evaluates faster",
      ],
      1,
      "The top individual is always carried over.",
    ),
    TF("A steady-state GA that replaces a random member is elitist.", false, "The random victim could be the best."),
    M(
      "A generational GA with population 30 and no elitism makes how many children per generation?",
      ["1", "15", "30", "60"],
      2,
      "It refills the whole population.",
    ),
    M(
      "In a steady-state GA, when can a good new child become a parent?",
      [
        "Only in the next generation",
        "Immediately, in the very next step",
        "Never: children can't become parents",
        "Only after 10 more steps",
      ],
      1,
      "No waiting for a generation boundary.",
    ),
    {
      type: "cat",
      q: "Which scheme?",
      buckets: ["Generational", "Steady-state"],
      items: [
        ["Parents and children never mix in one population", 0],
        ["Changes the population a little at a time", 1],
        ["Batch-evaluates a whole new population", 0],
      ],
      why: "All at once vs a trickle.",
    },
    M(
      "Which scheme tends to explore more at once?",
      ["Steady-state", "Generational", "Neither", "Both equally"],
      1,
      "It changes the whole population each round.",
    ),
    M(
      "What's the downside of a very large elite?",
      ["More exploration", "Strong pressure", "Nothing", "Slower evaluation"],
      1,
      "Elites crowd out newcomers.",
    ),
  ]);
})();

(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { M, TF, land } = partScope;
  const N = NIC,
    B = N.bank,
    Qf = N.qfig;
  B.add("l2-approx", [
    M(
      "Exhaustive search over 2⁶⁰ options at a billion per second takes roughly…",
      ["a few seconds", "a few days", "about 36 years", "longer than the age of the universe"],
      2,
      "2⁶⁰ ≈ 1.15 × 10¹⁸, so about 1.15 × 10⁹ seconds, which is roughly 36 years.",
      { hint: "2¹⁰ ≈ 10³, so 2⁶⁰ ≈ 10¹⁸. A year is about 3 × 10⁷ seconds." },
    ),
    {
      type: "cat",
      q: "Exact or approximate?",
      buckets: ["Exact", "Approximate"],
      items: [
        ["Dijkstra's shortest path", 0],
        ["An EA for a timetable", 1],
        ["Checking every subset", 0],
        ["Nearest-neighbour tour building", 1],
        ["Prim's algorithm", 0],
      ],
      why: "Exact methods guarantee the optimum. EAs and greedy tour heuristics give good answers without that guarantee.",
    },
    M(
      "How does an EA's best solution usually improve over a long run?",
      [
        "Steadily, at the same rate forever",
        "Quickly at first, then more and more slowly",
        "Hardly at all until the very end",
        "Not at all after the first generation",
      ],
      1,
      "Diminishing returns: running twice as long rarely gives twice the improvement.",
    ),
    TF(
      "An approximate algorithm never returns the optimal solution.",
      false,
      "It often does. It just can't guarantee or prove it.",
    ),
    M(
      "Which situation calls for an approximate method?",
      [
        "Sorting 1,000 numbers",
        "Routing 200 vans by 6 a.m. tomorrow",
        "Finding the shortest path in a road map",
        "Adding two numbers",
      ],
      1,
      "Vehicle routing is hard and time-boxed. The others have fast exact algorithms.",
    ),
  ]);

  /* ---------- Lecture 3 ---------- */
  B.add("l3-recipe", [
    {
      type: "order",
      q: "Order one step of a steady-state EA.",
      items: [
        "Select parents",
        "Recombine them",
        "Mutate the child",
        "Evaluate the child",
        "Decide whether it replaces someone",
      ],
      why: "Select → recombine → mutate → evaluate → replace.",
    },
    {
      type: "match",
      q: "Match each word to its meaning.",
      pairs: [
        ["Chromosome", "One encoded candidate solution"],
        ["Gene", "One position in that encoding"],
        ["Fitness", "The score of a candidate"],
        ["Population", "The set of candidates kept at once"],
      ],
      why: "Standard EA vocabulary borrowed from biology.",
    },
    {
      type: "cat",
      q: "Which box of the recipe does each choice belong to?",
      buckets: ["Selection", "Crossover", "Mutation", "Replacement"],
      items: [
        ["Tournament", 0],
        ["Uniform", 1],
        ["Swap two genes", 2],
        ["Replace weakest", 3],
        ["Roulette wheel", 0],
      ],
      why: "Every EA variant is a set of choices, one per box.",
    },
    M(
      'You change "replace weakest" to "replace a random member". What\'s the risk?',
      [
        "None",
        "The best solution can be thrown away",
        "The EA stops producing children",
        "Fitness can no longer be computed",
      ],
      1,
      "A random victim could be the current best, so the method is no longer elitist.",
    ),
    M(
      "Which stages never look at fitness values?",
      ["Selection and replacement", "Crossover and mutation", "All of them", "Evaluation"],
      1,
      "Variation operators are blind: they just make new candidates. Fitness drives the decisions around them.",
    ),
  ]);
  B.add("l3-tsp", [
    M(
      "How many distinct round trips are there for 6 cities?",
      ["60", "120", "720", "30"],
      0,
      "(k − 1)! / 2 = 5! / 2 = 60.",
    ),
    M(
      "Which string describes the same round trip as <code>ACBED</code>?",
      ["<code>DEBCA</code>", "<code>ACEBD</code>", "<code>CABED</code>", "<code>ABCDE</code>"],
      0,
      "DEBCA is ACBED written backwards. Direction and starting city don't change the loop.",
    ),
    M(
      "Using the distance matrix, how long is the tour <code>ADCBE</code>?",
      ["28", "31", "34", "38"],
      2,
      "A–D 4 + D–C 2 + C–B 3 + B–E 10 + E–A 15 = 34.",
      { fig: N.matrixHTML ? `<div style="max-width:340px">${N.matrixHTML()}</div>` : "" },
    ),
    M(
      "Why not just check every tour for 20 cities?",
      [
        "There are only 20 tours to check",
        "There are about 6 × 10¹⁶ of them",
        "Two tours can't be compared fairly",
        "Checking tours isn't allowed",
      ],
      1,
      "19!/2 ≈ 6 × 10¹⁶: far too many to enumerate.",
    ),
    TF("A TSP tour must end back at the city it started from.", true, "It's a round trip: the last leg returns home."),
  ]);
  B.add("l3-hc", [
    {
      type: "order",
      q: "Put hillclimbing in order.",
      items: [
        "Make a random solution and score it",
        "Copy and mutate it",
        "Score the mutant",
        "Keep the mutant if it's no worse",
        "Stop, or repeat from the copy step",
      ],
      why: "Random start, then mutate → compare → keep-if-no-worse, until you stop.",
    },
    M(
      "Why accept a mutant that's <i>equally</i> good, not only strictly better?",
      [
        "It's faster to compute than a strict check",
        "It lets the climber drift across flat plateaus",
        "It avoids the need for mutation",
        "It turns HC into a population method",
      ],
      1,
      "On a plateau every neighbour is equal, so strict improvement would stop dead.",
    ),
    M(
      "Current tour <code>ADCBE</code> (34). Swapping the last two cities gives <code>ADCEB</code>. What does HC do?",
      ["Rejects it: 36", "Accepts it: 28", "Accepts it: 34", "Rejects it: 38"],
      1,
      "A–D 4 + D–C 2 + C–E 7 + E–B 10 + B–A 5 = 28, shorter than 34, so it's kept.",
      { fig: N.matrixHTML ? `<div style="max-width:340px">${N.matrixHTML()}</div>` : "" },
    ),
    M(
      "Why run hillclimbing several times from different random starts?",
      [
        "To make each individual run faster",
        "Different starts reach different local optima",
        "Restarting changes the fitness landscape",
        "To use up the evaluation budget evenly",
      ],
      1,
      "Random restarts are the cheapest escape from local optima.",
    ),
    TF(
      "On a landscape with a single smooth peak, hillclimbing reaches the global optimum.",
      true,
      "With one peak, every uphill path leads to it.",
    ),
  ]);
  B.add("l3-landscape", [
    {
      type: "match",
      q: "Match each landscape to its description.",
      pairs: [
        ["Unimodal", "One peak"],
        ["Multimodal", "Many peaks"],
        ["Plateau", "Large flat regions"],
        ["Deceptive", "Local slopes lead away from the best"],
      ],
      why: "These shapes decide how well local search will work.",
    },
    {
      type: "pick",
      q: "<b>Click every local optimum that is NOT the global optimum.</b>",
      fig: Qf.curve(
        land,
        [
          [0.2, "A"],
          [0.45, "B"],
          [0.62, "C"],
          [0.8, "D"],
        ],
        { label: "solutions →  (higher = fitter)" },
      ),
      a: ["A", "B"],
      why: "A and B are peaks (every small step goes down) but D is higher. C is a valley, not an optimum.",
    },
    M(
      "On a landscape where each solution's fitness is a random number, how does hillclimbing compare to random sampling?",
      ["Much better", "About the same", "Much worse", "It can't run"],
      1,
      "Hillclimbing relies on neighbours being similar. Without that, it's guessing.",
    ),
    M(
      '"Locally smooth, globally rugged" means…',
      [
        "Neighbours are similar, but there are many peaks",
        "Every point in the space has exactly the same fitness",
        "There is exactly one peak in the whole search space",
        "Fitness is random everywhere",
      ],
      0,
      "Small steps work locally, but the big picture has many traps.",
    ),
    M(
      "Why are huge random jumps usually a poor mutation on realistic problems?",
      ["They're slow", "Most of the space is poor", "They break the encoding", "They always improve fitness"],
      1,
      "Good regions are tiny. Small steps stay near what already works.",
    ),
  ]);
  B.add("l3-neighbourhood", [
    M(
      "Bit-flip mutation on a 12-bit string. How many neighbours does each solution have?",
      ["2", "12", "24", "4,096"],
      1,
      "One per bit you could flip.",
    ),
    M(
      "Adjacent-swap mutation (ends count as adjacent) on a 7-city tour. How many neighbours?",
      ["6", "7", "21", "14"],
      1,
      "There are 7 adjacent pairs around a loop of 7.",
    ),
    {
      type: "multi",
      q: "Which strings are single-bit-flip neighbours of <code>0110</code>? Select all.",
      o: [
        "<code>1110</code>",
        "<code>0010</code>",
        "<code>1001</code>",
        "<code>0100</code>",
        "<code>0111</code>",
        "<code>0110</code>",
      ],
      a: [0, 1, 3, 4],
      why: "Flip each bit once: 1110, 0010, 0100, 0111. 1001 differs in every bit; 0110 is the string itself.",
    },
    M(
      "You switch to a different mutation operator. What happens to the set of local optima?",
      ["Nothing", "It can change", "It always disappears", "It doubles"],
      1,
      'A local optimum is only "no better neighbour", and neighbours depend on the operator.',
    ),
    M(
      'Taken to the extreme, "every solution is my neighbour" turns local search into…',
      ["Hillclimbing", "Random search", "Exhaustive search", "Tabu search"],
      1,
      "Each step picks from the whole space, so there's nothing local left.",
    ),
  ]);
  B.add("l3-local", [
    M(
      "Monte Carlo search (p = 0.1) finishes. What should it return?",
      [
        "The current solution",
        "The best solution seen during the run",
        "The last mutant it rejected",
        "A random solution from the run",
      ],
      1,
      "Because it accepts worse moves, the current solution may have got worse. Keep a best-so-far.",
    ),
    M(
      "Tabu search, minimising. You're at cost 10. Neighbours cost 12, 9 (tabu) and 11. Where does it move?",
      ["9", "11", "12", "Stays at 10"],
      1,
      "It always moves to the best non-tabu neighbour, even if that's worse: 11.",
    ),
    M(
      "What goes wrong if the tabu list is far too short?",
      [
        "Nothing: shorter lists are always better because more moves are allowed",
        "It can cycle between the same few solutions",
        "The search stops moving altogether",
        "The search becomes exhaustive",
      ],
      1,
      "The list exists to block the way back; too short and the loop returns.",
    ),
    {
      type: "cat",
      q: "Which method behaves like this?",
      buckets: ["Hillclimbing", "Monte Carlo", "Tabu search"],
      items: [
        ["Takes a worse move with a small probability", 1],
        ["Refuses to revisit recent solutions", 2],
        ["Only ever accepts no-worse moves", 0],
        ["Always moves, even downhill", 2],
      ],
      why: "HC never goes down. Monte Carlo sometimes goes down at random. Tabu always moves, and bans recent spots.",
    },
    TF(
      "Tabu search can move to a worse neighbour even when a better non-tabu neighbour exists.",
      false,
      "It takes the best non-tabu neighbour. It only goes downhill when that best one is worse than where it is.",
    ),
  ]);
  B.add("l3-population", [
    M(
      "Why keep some low-fitness solutions in the population?",
      [
        "They make the population's average fitness look better",
        "They may sit near higher peaks and keep diversity",
        "They're cheaper to evaluate than good ones",
        "Crossover can't work without them",
      ],
      1,
      "A poor solution today could be at the foot of the tallest mountain.",
    ),
    M(
      'The population has "converged". What does that mean?',
      [
        "It has found the global optimum",
        "Most members have become very similar",
        "It has run out of memory",
        "Mutation has been switched off",
      ],
      1,
      "Convergence is loss of diversity. It can mean progress, or premature stagnation.",
    ),
    {
      type: "multi",
      q: "What does a population-based method need or allow that single-solution local search doesn't? Select all.",
      o: [
        "A way to choose which members to vary (selection)",
        "Recombining two or more parents",
        "A fitness function",
        "Mutation",
      ],
      a: [0, 1],
      why: "Both need fitness and mutation. Only a population needs selection and can recombine.",
    },
    M(
      "The diversity measure drops to zero after a few generations. What's the danger?",
      [
        "None: the search has converged, so it's done",
        "Only mutation can create anything new",
        "Fitness values start to become negative",
        "The population starts to grow",
      ],
      1,
      "Everyone is a copy, so crossover produces copies too.",
    ),
    TF(
      "A population of size 1 with no crossover is essentially hillclimbing.",
      true,
      "One solution, mutate, keep if no worse: that's the hillclimber.",
    ),
  ]);
})();

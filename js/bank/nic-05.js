(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { M, TF, mx } = partScope;
  const B = NIC.bank;
  B.add("l2-optim", [
    M(
      "20 on/off choices. Roughly how many combinations?",
      ["20", "400", "about a million", "about a billion"],
      2,
      "2²⁰ = 1,048,576.",
    ),
    M(
      "Fitness f = |weight − 100|, minimised. What does f = 0 mean?",
      ["The worst possible subset", "An exact hit of 100 kg", "An empty subset", "An error"],
      1,
      "Zero distance from the target is perfect.",
    ),
    M(
      "What's exhaustive search's big guarantee?",
      ["It's fast", "It always finds the optimum", "It uses little memory", "It needs no fitness function"],
      1,
      "It checks everything, so nothing better can be missed.",
    ),
    M("5 switches, each on or off. How many settings?", ["5", "10", "25", "32"], 3, "2⁵ = 32."),
    TF("A fitness function must be differentiable.", false, "EAs only compare scores, so any computable score works."),
    M(
      "A timetable problem has about 10³⁰ candidates. Why not enumerate them?",
      [
        "Enumerating timetables is against the rules",
        "Even at 10⁹ per second it would outlast the universe",
        "Timetables can't be given a score",
        "There are only about 10 real candidates",
      ],
      1,
      "10³⁰ / 10⁹ = 10²¹ seconds: about 3 × 10¹³ years.",
    ),
    M(
      "The search space S is…",
      [
        "the best solution found so far",
        "the set of all candidate solutions",
        "the fitness function being optimised",
        "the current population",
      ],
      1,
      "Search = moving around S looking for good points.",
    ),
    {
      type: "cat",
      q: "Finite or infinite search space?",
      buckets: ["Finite", "Infinite"],
      items: [
        ["Orderings of 10 cities", 0],
        ["The exact angle of a wing, as a real number", 1],
        ["Subsets of 30 items", 0],
        ["Real-valued weights of a neural network", 1],
      ],
      why: "Discrete choices give finite spaces; real numbers give infinite ones.",
    },
  ]);
  B.add("l2-complexity", [
    M(
      '"Polynomial time" means the running time is bounded by…',
      ["2ⁿ for the input size n", "nᵏ for some fixed k", "n! for the input size n", "a fixed constant"],
      1,
      "n, n², n³… any fixed power.",
    ),
    M(
      "2ⁿ at n = 10, 20 and 30 is roughly…",
      [
        "10, 20 and 30",
        "1 thousand, 1 million and 1 billion",
        "100, 400 and 900",
        "about 1 million at every one of the three sizes",
      ],
      1,
      "Each extra 10 multiplies by about 1,000.",
    ),
    M(
      "Which grows faster in the long run: n¹⁰ or 1.01ⁿ?",
      ["n¹⁰", "1.01ⁿ", "They're equal", "Neither grows"],
      1,
      "Any exponential with base above 1 eventually beats any polynomial.",
    ),
    TF("Sorting has a polynomial-time algorithm.", true, "Merge sort runs in O(n log n)."),
    M(
      "Which grows faster: n! or 2ⁿ?",
      ["2ⁿ", "n!", "Same", "Depends on the computer"],
      1,
      "n! multiplies by n each step; 2ⁿ only by 2.",
    ),
    {
      type: "match",
      q: "Match each method to its growth.",
      pairs: [
        ["Binary search", "O(log n)"],
        ["Scanning a list once", "O(n)"],
        ["Merge sort", "O(n log n)"],
        ["Trying every tour of n cities", "O(n!)"],
      ],
      why: "The standard reference points.",
    },
    M(
      "What's the point of the protein-folding example?",
      [
        "Proteins are simpler than they look once you model them",
        "Exhaustive search is hopeless even for real problems",
        "Biology can always be solved in polynomial time with enough computers",
        "Computers can't store protein structures",
      ],
      1,
      "Hard problems aren't just puzzles; they're everywhere.",
    ),
    M(
      "An n³ algorithm takes 1,000 steps at n = 10. How many at n = 20?",
      ["2,000", "4,000", "8,000", "1,000,000"],
      2,
      "Doubling n multiplies n³ by 8.",
    ),
  ]);
  B.add("l2-mst", [
    M(
      "Three towns joined in a triangle with links of cost 2, 3 and 4. MST cost?",
      ["5", "6", "7", "9"],
      0,
      "Take the two cheapest links: 2 + 3. The 4 would close a loop.",
    ),
    M(
      "Does Prim's starting node change the total cost of the tree it finds?",
      [
        "Yes: different starts give different costs",
        "No: any start gives a minimum spanning tree",
        "Only when the number of nodes is even",
        "Only when some weights are tied",
      ],
      1,
      "The route differs, the minimum total doesn't.",
    ),
    M(
      "Remove one edge from a spanning tree. What happens?",
      [
        "Nothing: the tree stays connected",
        "It splits into two disconnected parts",
        "It turns into a cycle",
        "It gains an extra edge",
      ],
      1,
      "Every tree edge is a bridge.",
    ),
    M(
      "Add one extra edge to a spanning tree. What happens?",
      [
        "Nothing changes about the tree",
        "Exactly one cycle is created",
        "The tree splits into two parts",
        "It becomes a minimum spanning tree",
      ],
      1,
      "The new edge plus the tree path between its ends forms a loop.",
    ),
    TF("The plain MST problem can be solved exactly in polynomial time.", true, "Prim and Kruskal both do it."),
    M(
      "Which is a natural MST application?",
      [
        "Sorting a list of names into alphabetical order quickly",
        "Laying cable to connect sites as cheaply as possible",
        "Encrypting data before sending it over a network",
        "Scheduling exams without clashes",
      ],
      1,
      "Connect everything, minimise total length.",
    ),
    M(
      "A spanning tree where every town has at most 2 links is…",
      [
        "a star centred on one town",
        "a path through every town",
        "impossible to build",
        "always the minimum spanning tree",
      ],
      1,
      "It's a Hamiltonian path, closely related to the TSP.",
    ),
    M(
      "Why does greedy work for the plain MST?",
      [
        "It works by luck on typical graphs",
        "Each cheapest safe edge never has to be undone",
        "It secretly checks every possible tree",
        "Graphs in practice are small",
      ],
      1,
      "The problem's structure makes local choices globally safe.",
    ),
  ]);
  B.add("l2-approx", [
    M(
      "Why use an EA for the New York Tunnels problem?",
      [
        "The network is small enough to enumerate in an afternoon",
        "About 10²⁵ designs: far too many to check",
        "It has no fitness function, so exact methods can't score it",
        "Exact methods are not allowed for it",
      ],
      1,
      "16²¹ designs rules out enumeration.",
    ),
    M(
      "Approximate algorithms give up ___ in exchange for speed.",
      [
        "correctness of the input data",
        "a guarantee of optimality",
        "the need for a fitness function",
        "all of their randomness",
      ],
      1,
      "Good answers fast, no proof they're the best.",
    ),
    {
      type: "cat",
      q: "Does the method guarantee the optimum?",
      buckets: ["Guaranteed", "No guarantee"],
      items: [
        ["Exhaustive search", 0],
        ["Evolutionary algorithm", 1],
        ["Prim's algorithm for plain MST", 0],
        ["Tabu search", 1],
      ],
      why: "Exact methods guarantee; heuristics don't.",
    },
    TF("Evolutionary algorithms are exact algorithms.", false, "They're approximate (heuristic)."),
    M(
      "A sat-nav finds a very good route in a second. What kind of algorithm does that resemble?",
      ["An approximate one", "Exhaustive search", "Sorting", "Encryption"],
      0,
      "Speed over proven optimality.",
    ),
    M(
      "An EA can be stopped at any time and still return something useful. Why?",
      [
        "It keeps the best solution found so far",
        "It restarts and returns its first solution",
        "It can't: it must finish every generation",
        "It stores every solution ever evaluated",
      ],
      0,
      "That's called an anytime algorithm.",
    ),
    M(
      "Does more running time usually help an EA?",
      [
        "Never: the result is fixed early on",
        "Usually, but with diminishing returns",
        "Always: twice the time, twice the quality",
        "No: longer runs make results worse",
      ],
      1,
      "Big gains early, small gains later.",
    ),
    M(
      "When would you pick an exact method over an approximate one?",
      [
        "Never: approximate methods are always the better choice",
        "When it's small, or optimality must be proven",
        "Always: exact methods beat approximate ones on every problem",
        "Only for maximisation problems",
      ],
      1,
      "If you can afford certainty, take it.",
    ),
  ]);

  B.add("l3-recipe", [
    M(
      "What does a steady-state EA do each step?",
      [
        "Replaces the whole population at once with new children",
        "Makes one or two children, replaces one member",
        "Stops, sorts everyone, and restarts from scratch",
        "Sorts the population by fitness",
      ],
      1,
      "Small, continuous updates.",
    ),
    M(
      "What does a generational EA do each step?",
      [
        "Replaces a single member",
        "Builds a whole new population of children",
        "Only mutates the existing members",
        "Only re-evaluates the existing members",
      ],
      1,
      "Everyone is replaced at once.",
    ),
    M(
      "Genotype vs phenotype?",
      ["Same thing", "Genotype is the encoding", "Genotype is fitness", "Phenotype is the mutation"],
      1,
      "E.g. a bit string (genotype) decodes to a timetable (phenotype).",
    ),
    {
      type: "match",
      q: "Match each choice to its box in the recipe.",
      pairs: [
        ["Binary tournament", "Parent selection"],
        ["Swap mutation", "Variation"],
        ["Replace worst", "Replacement"],
        ["Random bit strings", "Initialisation"],
      ],
      why: "One choice per box.",
    },
    M(
      "How are EA populations usually initialised?",
      ["All copies of one guess", "Random solutions", "The worst solutions", "Empty"],
      1,
      "Spread the search out.",
    ),
    TF(
      "Mutation operates on the encoding (genotype).",
      true,
      "Operators change the representation; fitness is measured on what it decodes to.",
    ),
    M(
      "Which is a sensible termination criterion?",
      ["When mutation happens", "A maximum number of evaluations", "When the first child is made", "Never"],
      1,
      "Budgets or stagnation are the usual stops.",
    ),
    M(
      "Why does the recipe separate selection from replacement?",
      [
        "No real reason: they do the same job",
        "One decides who breeds, the other who survives",
        "Replacement needs its own fitness function",
        "It halves the memory needed",
      ],
      1,
      "Two independent knobs on pressure.",
    ),
  ]);
  B.add("l3-tsp", [
    M(
      "Using the matrix, how long is <code>ACDEB</code>?",
      ["28", "31", "33", "36"],
      2,
      "A–C 7 + C–D 2 + D–E 9 + E–B 10 + B–A 5 = 33.",
      { fig: mx() },
    ),
    M(
      "What's the shortest possible tour on the lecture's 5-city matrix?",
      ["24", "28", "31", "33"],
      1,
      "28 (for example ADCEB). No tour is shorter.",
      { fig: mx() },
    ),
    M(
      "Are <code>ABCDE</code> and <code>EDCBA</code> different tours?",
      [
        "Yes: the cities come in a different order",
        "No: one is the other driven backwards",
        "Only if A is the home city",
        "Only on some distance matrices",
      ],
      1,
      "Same loop, opposite direction.",
    ),
    M("How many distinct tours are there for 4 cities?", ["3", "6", "12", "24"], 0, "(4 − 1)! / 2 = 3."),
    M(
      "How many distinct tours are there for 10 cities?",
      ["about 3,600", "about 180,000", "about 3.6 million", "about 10 billion"],
      1,
      "9! / 2 = 181,440.",
      { hint: "10! ≈ 3.6 million, so 9! is a tenth of that. Then halve it." },
    ),
    TF("The TSP has a known polynomial-time exact algorithm.", false, "It's a classic hard problem."),
    M(
      "In a permutation encoding of a tour, each city appears…",
      ["at least once", "exactly once", "at most once", "twice"],
      1,
      "Visit each city once.",
    ),
    M(
      "Why is the TSP such a popular test problem?",
      [
        "It's easy to solve exactly",
        "It's simple to state but hard to solve",
        "It only ever has one good answer",
        "Its search space is continuous",
      ],
      1,
      "Easy to explain, hard to crack.",
    ),
  ]);
})();

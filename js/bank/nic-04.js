/* ===== bank-nic-2.js ===== */
/* Nature-Inspired revision bank, part 2 (revision mode only). New angles per session; no calculator needed. Numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});

  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  const mx = () => (NIC.matrixHTML ? `<div style="max-width:340px">${NIC.matrixHTML()}</div>` : "");

  B.add("l1-what", [
    M(
      "Which is the best one-line description of nature-inspired computation?",
      [
        "Computers built out of living biological parts such as neurons",
        "Algorithms borrowing problem-solving ideas from nature",
        "Simulations of animals for films and games",
        "Any algorithm that involves randomness",
      ],
      1,
      "It's about borrowing the <i>strategy</i> (evolution, learning, swarming), not biology itself.",
    ),
    TF(
      "Neural networks are an example of nature-inspired computation.",
      true,
      "They're loosely modelled on how brains learn by adjusting connections.",
    ),
    M(
      "Ants find short paths without a leader. How do they coordinate?",
      [
        "A queen sends out orders to every worker in the colony",
        "Indirectly, via pheromone trails that others reinforce",
        "Each ant memorises a map of the area",
        "They don't really coordinate: it's luck",
      ],
      1,
      "Communication through the environment (stigmergy): short trails get reinforced faster.",
    ),
    M(
      "One ant is simple, yet the colony solves hard problems. What's this called?",
      ["Emergence", "Evolution", "Exhaustive search", "Recursion"],
      0,
      "No individual understands the whole problem; the solution emerges from interactions.",
    ),
    {
      type: "cat",
      q: "Which natural system is being described?",
      buckets: ["Evolution", "Brains", "Collective behaviour"],
      items: [
        ["Fitter variants leave more offspring over generations", 0],
        ["Connections strengthen when they're useful", 1],
        ["Birds keep formation by watching their neighbours", 2],
        ["Random variation plus selection", 0],
      ],
      why: "Selection over generations, learning connections, local rules in a group.",
    },
    M(
      "Why not always use classical exact algorithms?",
      [
        "Exact algorithms are too old to trust on modern computers",
        "Many real problems are too big for known exact methods",
        "Exact algorithms need special hardware",
        "Exact algorithms can't handle numbers",
      ],
      1,
      "Nature-inspired methods fill the gap where exact methods are too slow.",
    ),
    TF(
      "A nature-inspired method needs gradients or a formula for the problem's structure.",
      false,
      "It only needs to evaluate candidate solutions, which is why it copes with messy black-box problems.",
    ),
    M(
      "Remove one ant and the colony keeps working. Which property is that?",
      ["Robustness", "Optimality", "Determinism", "Speed"],
      0,
      "Decentralised systems degrade gracefully, which is another reason to copy them.",
    ),
  ]);
  B.add("l1-monkey", [
    M(
      "Random typing of a 28-character sentence on 27 keys has roughly how many possible strings?",
      ["about 750", "about 10¹⁰", "about 10⁴⁰", "about 10¹⁰⁰"],
      2,
      "27²⁸ ≈ 10⁴⁰, far beyond any computer.",
      { hint: "27 is a bit under 30, and 30²⁸ ≈ 10⁴¹." },
    ),
    M(
      "Keep-if-better gets slower near the end of the monkey problem. Why?",
      ["The computer overheats", "Few letters are still wrong", "The target changes", "Fitness stops working"],
      1,
      "The chance of a useful change falls as fewer positions remain to fix.",
    ),
    TF(
      "On the monkey problem, keep-if-better will reach the target eventually.",
      true,
      "Letters are independent and each fix is kept, so there are no traps to get stuck in.",
    ),
    M(
      "In the monkey problem, what is the fitness of a string?",
      [
        "The total length of the string",
        "How many positions match the target",
        "How long it took to type the string",
        "How many vowels the string contains",
      ],
      1,
      "More matching letters means fitter.",
    ),
    {
      type: "cat",
      q: "Random typing or keep-if-better?",
      buckets: ["Random typing", "Keep-if-better"],
      items: [
        ["Throws away every attempt and starts again", 0],
        ["Builds on the best string found so far", 1],
        ["Expected effort grows by ×27 per extra letter", 0],
        ["Finishes a sentence in thousands of steps", 1],
      ],
      why: "Keeping improvements is the difference between hopeless and practical.",
    },
    M(
      "The target sentence changed randomly at every step. What would happen to keep-if-better?",
      ["It would still finish quickly", "Progress couldn't accumulate", "It would get faster", "Nothing"],
      1,
      "Selection needs a stable fitness to build on.",
    ),
    M(
      "What real-world feature makes problems harder than the monkey problem?",
      ["More letters", "Parts interact", "Computers are slower", "Fitness is easier to compute"],
      1,
      "Interaction between parts creates local traps that a single improver gets stuck in.",
    ),
    M(
      "What does the gecko example illustrate?",
      [
        "Geckos can climb faster than any animal humans have studied",
        "Evolution finds solutions humans haven't engineered",
        "Random search always finds good designs",
        "Biology is simpler than engineering",
      ],
      1,
      "Evolution acts as a problem solver, so it's worth copying.",
    ),
  ]);
  B.add("l1-ingredients", [
    M(
      "Which ingredient keeps many different candidates alive at the same time?",
      [
        "Mutation, which keeps changing candidates",
        "A population",
        "Crossover, which mixes candidates",
        "The fitness function, which scores them",
      ],
      1,
      "A population holds several candidates, which keeps options open.",
    ),
    M(
      "What is mutation's job?",
      [
        "Pick which parents get to breed",
        "Make small random changes so new variants appear",
        "Delete the worst solutions each generation",
        "Score candidates so they can be compared",
      ],
      1,
      "Mutation is the source of new material.",
    ),
    M(
      '"A weak bias towards the fittest" means…',
      [
        "Only the single best candidate in the population breeds",
        "Fitter ones breed more often, but weaker ones still can",
        "Every candidate is equally likely to breed, whatever its fitness",
        "The weakest candidates are favoured",
      ],
      1,
      "Some pull towards quality, without wiping out diversity.",
    ),
    TF(
      "An EA with no randomness at all would still explore well.",
      false,
      "Without randomness it can't try new variants, so it can't explore.",
    ),
    M(
      "Parents ABCD and WXYZ, cut after position 2. The first child of 1-point crossover is…",
      ["ABYZ", "WXCD", "AXCZ", "ABCD"],
      0,
      "Head of the first parent (AB) plus tail of the second (YZ).",
    ),
    {
      type: "cat",
      q: "Which ingredient does each operation belong to?",
      buckets: ["Population", "Selection", "Mutation", "Recombination"],
      items: [
        ["Keep 50 candidates at once", 0],
        ["Pick fitter parents more often", 1],
        ["Flip one bit of a child", 2],
        ["Splice two parents together", 3],
      ],
      why: "Four roles: hold candidates, favour quality, invent, and mix.",
    },
    M(
      'The lecture\'s word "stochastic" means…',
      ["Very fast", "Involving randomness", "Exact and repeatable", "Running in parallel"],
      1,
      "Stochastic = random elements are part of the method.",
    ),
    M(
      "A population of just 2. What's the main risk?",
      [
        "Each generation takes too long to run",
        "Very little diversity",
        "It needs too much memory to store",
        "There's no real risk with two",
      ],
      1,
      "Tiny populations lose variety almost immediately.",
    ),
  ]);
  B.add("l1-apps", [
    {
      type: "cat",
      q: "Which application category fits each task?",
      buckets: ["Planning", "Design", "Simulation", "Identification", "Control", "Classification"],
      items: [
        ["Timetable a school's classes", 0],
        ["Choose the members of a bridge truss", 1],
        ["Model how a rumour spreads through a town", 2],
        ["Find a formula that fits past sales figures", 3],
        ["Evolve a walking robot's controller", 4],
        ["Sort emails into spam and not spam", 5],
      ],
      why: "Arranging, building, modelling agents, fitting data, acting on a live system, labelling.",
    },
    M(
      "A good fitness function for a school timetable?",
      [
        "The number of teachers employed by the school each term",
        "The number of clashes (lower is better)",
        "The number of rooms available",
        "The length of the school day",
      ],
      1,
      "It measures how bad a candidate timetable is.",
    ),
    M(
      "A good fitness function for evolving a robot's walking controller?",
      [
        "The number of motors and sensors it uses to move around",
        "The distance walked before falling over",
        "The colour of the robot's shell",
        "The size of its battery",
      ],
      1,
      "It rewards the behaviour you actually want.",
    ),
    M(
      "Why are EAs popular in engineering design?",
      [
        "They're exact, so designs are guaranteed optimal",
        "They need few assumptions and can use any simulator",
        "They avoid the need for computers",
        "They're always the fastest method",
      ],
      1,
      "Anything you can score, you can evolve.",
    ),
    TF(
      "EA-produced designs are guaranteed to be optimal.",
      false,
      "They're good, sometimes better than human designs, but not provably optimal.",
    ),
    M(
      "Each fitness evaluation runs a simulation that takes an hour. What's the practical consequence?",
      [
        "Nothing changes about how you run it",
        "You can afford few evaluations",
        "You should use a bigger population",
        "You can skip evaluating the children",
      ],
      1,
      "The evaluation budget drives every other choice.",
    ),
    M(
      "How were the ST5 antenna's mission requirements given to the EA?",
      [
        "As hard-coded antenna shapes the EA had to copy exactly",
        "As a fitness function scoring each design",
        "By an engineer picking favourites each round",
        "They weren't given; the EA invented them",
      ],
      1,
      "Requirements become the score.",
    ),
    M(
      "Which task is a poor fit for an EA?",
      ["Adding two numbers", "Designing a turbine blade", "Scheduling nurses", "Tuning a controller"],
      0,
      "When a direct exact method is trivial, a heuristic search is pointless.",
    ),
  ]);

  B.add("l2-generic", [
    M(
      "How is the initial population usually created?",
      ["Copied from the best known answer", "Randomly", "Sorted by fitness", "Left empty"],
      1,
      "Random starting points spread the search out.",
    ),
    M(
      "What does the evaluation step do?",
      [
        "Mutates every individual",
        "Computes each individual's fitness",
        "Chooses which parents breed",
        "Decides when to stop the run",
      ],
      1,
      "Scores are needed before any selection.",
    ),
    {
      type: "cat",
      q: "Which stage of the generic EA is this?",
      buckets: ["Selection", "Variation", "Population update"],
      items: [
        ["Tournament of three", 0],
        ["Swap two genes", 1],
        ["Replace the worst member", 2],
        ["One-point crossover", 1],
      ],
      why: "Choose parents, make children, decide who stays.",
    },
    M(
      "In optimisation, s* is…",
      ["the first solution tried", "a best solution", "any feasible solution", "the average solution"],
      1,
      "Optimisation searches for s* = the argmax (or argmin) of f.",
    ),
    TF(
      "Most of the EA loop stays the same across problems; mainly the encoding, operators and fitness change.",
      true,
      "That's what makes EAs general-purpose.",
    ),
    M(
      "Children are always almost identical to their parents. What's the risk?",
      ["Too much exploration", "Very little exploration", "It crashes", "Nothing"],
      1,
      "Tiny variation means tiny steps.",
    ),
    M(
      "Children are completely unrelated to their parents. What's the EA now?",
      ["Hillclimbing", "Essentially random search", "Exhaustive search", "Still a well-tuned EA"],
      1,
      "If children don't inherit anything, selection has nothing to build on.",
    ),
    {
      type: "order",
      q: "Order one iteration of the generic loop.",
      items: ["Select parents", "Vary them into children", "Update the population"],
      why: "Select → vary → update, then repeat.",
    },
  ]);
  Object.assign(partScope, { M, TF, mx });
})();

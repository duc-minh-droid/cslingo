/* Revision bank content for one course, merged from the earlier part files (loaded on demand by js/bank.js, never on startup). Append new questions at the end with NIC.bank.add(...). */
/* ===== bank-nic.js ===== */
/* Nature-Inspired revision bank — new scenarios per session, no calculator needed. Numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});

  const N = NIC,
    B = N.bank,
    Qf = N.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  const bump = (x, c, s, a) => a * Math.exp(-((x - c) ** 2) / (2 * s * s));
  const land = (x) => 0.1 + bump(x, 0.2, 0.05, 0.5) + bump(x, 0.45, 0.06, 0.7) + bump(x, 0.8, 0.07, 1);

  /* ---------- Lecture 1 ---------- */
  B.add("l1-what", [
    {
      type: "cat",
      q: "Nature-inspired, or a classical algorithm?",
      buckets: ["Nature-inspired", "Classical"],
      items: [
        ["A genetic algorithm tuning a bus timetable", 0],
        ["Binary search on a sorted list", 1],
        ["Ant-colony routing of delivery vans", 0],
        ["A neural network reading handwritten postcodes", 0],
        ["Merge sort", 1],
      ],
      why: "Nature-inspired methods copy evolution, brains or collective behaviour. Binary search and merge sort are hand-designed step-by-step procedures.",
    },
    M(
      "What do evolution, brains and ant colonies share that makes them worth copying?",
      [
        "They're extremely fast at every task they're given",
        "They solve hard problems with no central designer",
        "They always find the perfect answer eventually, given enough time",
        "They only work on biological problems",
      ],
      1,
      "No one designs a gecko's foot or directs an ant colony, yet both produce clever solutions. That's the property we want to borrow.",
    ),
    M(
      "A courier firm needs a <i>good</i> plan for 300 stops within 10 minutes every morning. Why is a nature-inspired method appealing?",
      [
        "It guarantees the shortest possible route every single morning",
        "Good plans fast on problems too big to solve exactly",
        "It needs no information about the stops",
        "It's the only kind of method a computer can run",
      ],
      1,
      "Good-enough-quickly is the selling point. There's no optimality guarantee, and it still needs a way to score a plan.",
    ),
    TF(
      "Nature-inspired methods guarantee the optimal answer, because nature has had millions of years to perfect them.",
      false,
      "They're heuristics: often excellent, never guaranteed. Evolution itself doesn't produce perfect designs, just ones that work well enough.",
    ),
    {
      type: "match",
      q: "Which natural system would you borrow from for each job?",
      pairs: [
        ["Learn to spot fraud from thousands of past examples", "Brains (neural networks)"],
        ["Evolve the frame shape of a racing drone", "Evolution (EAs)"],
        ["Many cheap robots sweeping a field using only local rules", "Collective behaviour (swarms)"],
      ],
      why: "Learning from examples: neural networks. Breeding better designs: evolution. Simple agents with local rules: swarms.",
    },
  ]);
  B.add("l1-monkey", [
    M(
      "Roughly how many equally likely strings of 11 characters can a 27-key monkey type?",
      ["about 300", "about a million", "about 10¹⁵", "about 10⁴⁰"],
      2,
      "27¹¹ ≈ 5.6 × 10¹⁵. Each extra character multiplies the count by 27.",
      { hint: "27² ≈ 700, 27⁴ ≈ half a million…" },
    ),
    M(
      "Why does keep-if-better reach the target in thousands of steps when random typing would need about 10¹⁵ tries?",
      [
        "It types faster",
        "Each correct letter is kept",
        "It knows the target sentence",
        "It changes every letter at once",
      ],
      1,
      "Keeping improvements turns one impossible search into many tiny ones solved one after another.",
    ),
    M(
      "When does keep-if-better stop working well?",
      [
        "When the target sentence is short",
        "When improving one part makes other parts worse",
        "When the alphabet has only a few letters",
        "Never: it always reaches the target",
      ],
      1,
      "Letters in the monkey problem are independent. Real problems interact, so a single improver gets stuck where all small changes look worse.",
    ),
    {
      type: "order",
      q: "Put keep-if-better in order.",
      items: [
        "Start with a random guess",
        "Copy it and change one character",
        "Score the copy",
        "Keep the copy if it's no worse",
        "Repeat",
      ],
      why: "Guess, tweak, score, keep-if-no-worse, repeat. That's selection plus variation with a population of one.",
    },
    TF(
      "Because a monkey typing forever would eventually produce Hamlet, random search is a practical strategy.",
      false,
      '"Eventually" can mean far longer than the age of the universe. Possible and feasible are different things.',
    ),
  ]);
  B.add("l1-ingredients", [
    {
      type: "cat",
      q: "Each broken design is missing one ingredient. Which one?",
      buckets: ["A population", "Biased selection", "Variation"],
      items: [
        ["One candidate, mutate it, keep it if better", 0],
        ["Many candidates, but parents are chosen completely at random", 1],
        ["Many candidates, fitter parents chosen, but children are exact copies", 2],
      ],
      why: "A single candidate is a hillclimber, not an EA. Unbiased selection gives drift. Without variation nothing new is ever tried.",
    },
    M(
      "Why does an EA need randomness at all?",
      [
        "To make runs unrepeatable",
        "To create new variants to try",
        "Because computers are random",
        "To pick the answer at the end",
      ],
      1,
      "Mutation and randomised selection are how new candidates appear and how weaker ones still get a chance.",
    ),
    M(
      "What does recombination (crossover) add that mutation alone doesn't?",
      [
        "Nothing that mutation couldn't eventually do on its own",
        "It can join good parts from different individuals",
        "It guarantees that every child is an improvement on its parents",
        "It removes the need for any selection",
      ],
      1,
      "Two parents that each solved half the problem can produce a child that has both halves.",
    ),
    M(
      "Parents are chosen with <i>zero</i> bias towards fitness. What does the population do over time?",
      [
        "Converges fast to the best",
        "Drifts randomly without steady improvement",
        "Stops changing",
        "Always finds the optimum eventually",
      ],
      1,
      "With no pull towards fitter solutions, good and bad genes are equally likely to spread.",
    ),
    TF(
      "Recombination is optional in the lecture's recipe, but often helpful.",
      true,
      "Population, biased selection and variation are required; recombination is the optional third ingredient.",
    ),
  ]);
  B.add("l1-apps", [
    {
      type: "cat",
      q: "Which application category fits each job?",
      buckets: ["Planning", "Design", "Simulation", "Identification", "Control", "Classification"],
      items: [
        ["Schedule trains on a single-track line", 0],
        ["Choose the profile of an aircraft wing", 1],
        ["Model how shoppers move through a new mall", 2],
        ["Fit a model predicting energy demand from the weather", 3],
        ["Open and close greenhouse vents to hold 22 °C", 4],
        ["Flag suspicious card payments", 5],
      ],
      why: "Arranging resources: planning. Choosing a structure: design. Agents interacting: simulation. Model matching data: identification. Acting on a live system: control. Assigning labels: classification.",
    },
    M(
      "What's the one thing you must be able to do before an EA can attack your problem?",
      ["Know the optimal answer", "Score any candidate solution", "Write the solution by hand", "Have a supercomputer"],
      1,
      "The fitness function is the only problem-specific ingredient. Everything else is generic.",
    ),
    M(
      "Evolved antennas often look strange to engineers. Why?",
      [
        "The EA had a bug",
        "The EA isn't limited by human intuition",
        "Antennas have to look strange",
        "They were drawn by hand afterwards",
      ],
      1,
      "Selection rewards whatever works, so designs can land where no human would have looked.",
    ),
    M(
      'In an EA designing car bodies, what plays the role of "nature" doing the judging?',
      [
        "The crossover operator that mixes designs",
        "The airflow simulation that scores each design",
        "The random number generator",
        "The size of the population",
      ],
      1,
      "The simulator is the environment: it decides which designs are fit enough to breed.",
    ),
    TF(
      "To use an EA you need to know how to build the best solution step by step.",
      false,
      "You only need to recognise better from worse. Knowing how to construct the answer is what EAs let you skip.",
    ),
  ]);

  /* ---------- Lecture 2 ---------- */
  B.add("l2-generic", [
    {
      type: "order",
      q: "Put the generic EA in order.",
      items: [
        "Create an initial population",
        "Evaluate everyone's fitness",
        "Select parents",
        "Vary them into children",
        "Update the population",
        "Stop if the budget is spent, otherwise loop",
      ],
      why: "Initialise and evaluate once, then loop select → vary → update until you run out of time or evaluations.",
    },
    {
      type: "match",
      q: "Each design question belongs to one stage. Match them.",
      pairs: [
        ["Who gets to reproduce?", "Selection"],
        ["How different are children from their parents?", "Variation"],
        ["Who survives into the next round?", "Population update"],
      ],
      why: "The generic EA is three plug-in decisions, one per stage.",
    },
    M(
      "Which is a sensible stopping rule?",
      [
        "Stop as soon as the first improvement appears",
        "Stop after a fixed evaluation budget or long stagnation",
        "Stop when the population becomes empty",
        "Never stop: EAs run forever",
      ],
      1,
      'EAs have no "done" signal, so you stop on a budget or on stagnation.',
    ),
    M(
      "You switch from maximising a score to minimising a cost. What changes in the EA?",
      ["Everything must be redesigned", "Only the comparisons", "You need a new encoding", "EAs can only maximise"],
      1,
      "Select and keep the lower-cost solutions instead. The loop itself is unchanged.",
    ),
    M(
      "Selection is almost random. What's the likely outcome?",
      [
        "Poor results, found quickly before the run gives up",
        "Good results eventually, but very slowly",
        "Instant convergence to the best solution in a few generations",
        "The run crashes immediately",
      ],
      1,
      "Weak pressure keeps diversity but gives little direction, so progress is slow.",
    ),
  ]);
  B.add("l2-optim", [
    M(
      "Items weigh 15, 40 and 50 kg. Which subset gets closest to <b>58 kg</b>?",
      ["50 alone (8 away)", "15 + 40 = 55 (3 away)", "15 + 50 = 65 (7 away)", "40 alone (18 away)"],
      1,
      "All 8 subsets: 0, 15, 40, 50, 55, 65, 90, 105. The closest to 58 is 55, so f = 3.",
    ),
    M(
      "How many subsets does a set of 10 items have?",
      ["20", "100", "1,024", "3,628,800"],
      2,
      "Each item is in or out: 2¹⁰ = 1,024. (3,628,800 is 10!, the number of orderings.)",
    ),
    M(
      "When is exhaustive search the right tool?",
      [
        "Always, since it's guaranteed exact on any problem size",
        "When the space is small enough for your time budget",
        "Never: heuristics always beat it",
        "Only for maximisation problems",
      ],
      1,
      "It's guaranteed optimal, so use it whenever you can afford it.",
    ),
    {
      type: "cat",
      q: "Maximise or minimise?",
      buckets: ["Maximise", "Minimise"],
      items: [
        ["Clashes in an exam timetable", 1],
        ["Distance a walking robot covers before falling", 0],
        ["Cost of a pipe network", 1],
        ["Profit of a product mix", 0],
        ["Length of a delivery route", 1],
      ],
      why: "Bad things (clashes, cost, length) are minimised; good things (distance covered, profit) are maximised.",
    },
    M(
      "Which search space is infinite?",
      [
        "All orderings of 20 cities (about 2.4 × 10¹⁸ of them)",
        "All subsets of 50 items",
        "All real values for a machine's temperature",
        "All 8-bit strings",
      ],
      2,
      "Real numbers are uncountably many, so enumeration is impossible even in principle.",
    ),
  ]);
  B.add("l2-complexity", [
    {
      type: "order",
      q: "At n = 100, order from fewest steps to most.",
      items: ["n log₂ n", "n²", "n³", "2ⁿ", "n!"],
      why: "About 700, 10⁴, 10⁶, 10³⁰ and 10¹⁵⁸. Exponentials and factorials dwarf any polynomial.",
    },
    M(
      "Input grows from 20 to 40. An n² algorithm takes 4× longer. How much longer does a 2ⁿ algorithm take?",
      ["4×", "20×", "about a million times", "2×"],
      2,
      "2⁴⁰ / 2²⁰ = 2²⁰ ≈ 1,000,000.",
    ),
    {
      type: "cat",
      q: "Is a fast exact algorithm known?",
      buckets: ["Easy", "Hard"],
      items: [
        ["Find the largest value in a list", 0],
        ["Pack items into the fewest bins", 1],
        ["Shortest route on a road map", 0],
        ["Colour a map with 3 colours so neighbours differ", 1],
        ["Sort files by date", 0],
      ],
      why: "Max, shortest path and sorting are polynomial. Bin packing and 3-colouring have no known fast exact method.",
    },
    M(
      'What does calling a problem "hard" mean here?',
      [
        "It has been proven impossible to solve quickly",
        "No polynomial-time exact algorithm is known",
        "It has large inputs",
        "It needs a lot of memory",
      ],
      1,
      "Hard = none known, not proven impossible. That's the honest version of the claim.",
    ),
    M(
      "You buy a computer 1,000× faster. For a 2ⁿ brute force, how much bigger an n can you now handle in the same time?",
      ["1,000× bigger", "about 10 more", "twice as big", "about 100 more"],
      1,
      "2¹⁰ ≈ 1,000, so a thousand-fold speed-up buys only about 10 extra items.",
    ),
  ]);
  B.add("l2-mst", [
    M(
      "A spanning tree joins 8 towns. How many links does it use?",
      ["7", "8", "28", "16"],
      0,
      "Every spanning tree on n nodes has n − 1 edges.",
    ),
    M(
      "Prim from P on edges P–Q 3, Q–R 1, P–R 2, R–S 5, Q–S 4. What's the tree's total cost?",
      ["6", "7", "8", "10"],
      1,
      "Take P–R (2), then R–Q (1), then Q–S (4): total 7. P–Q (3) would close a loop.",
      {
        fig: Qf.graph(
          { P: [60, 110], Q: [220, 40], R: [220, 190], S: [390, 110] },
          [
            ["P", "Q", 3],
            ["Q", "R", 1],
            ["P", "R", 2],
            ["R", "S", 5],
            ["Q", "S", 4],
          ],
          { w: 450, h: 230 },
        ),
      },
    ),
    M(
      "Why does a spanning tree never contain a cycle?",
      [
        "Graph theory doesn't allow cycles in any kind of graph",
        "A cycle means one of its links is redundant",
        "Prim's algorithm can't draw cycles",
        "Cycles make the network slower",
      ],
      1,
      "Any edge on a cycle can go without disconnecting anything.",
    ),
    M(
      'Add "no town may have more than 2 cables". What happens to the problem?',
      ["Still easy: run Prim", "It becomes hard", "It becomes trivial", "It has no solutions"],
      1,
      "With degree ≤ 2 the tree becomes a path through every town, which is closely related to the travelling salesperson problem.",
    ),
    TF(
      "Prim's algorithm is a heuristic that usually finds a good tree.",
      false,
      "Prim is exact: it always returns a minimum spanning tree, in polynomial time.",
    ),
  ]);
  Object.assign(partScope, { M, TF, land });
})();

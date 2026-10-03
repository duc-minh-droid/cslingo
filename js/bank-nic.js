/* Revision bank content for one course, merged from the earlier part files (loaded on demand by js/bank.js, never on startup). Append new questions at the end with NIC.bank.add(...). */
/* ===== bank-nic.js ===== */
/* Nature-Inspired revision bank — new scenarios per session, no calculator needed. Numbers verified with node. */
(function () {
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

/* ===== bank-nic-2.js ===== */
/* Nature-Inspired revision bank, part 2 (revision mode only). New angles per session; no calculator needed. Numbers verified with node. */
(function () {
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
  B.add("l4-replacement", [
    M(
      "Population 0.6, 0.3, 0.8, 0.2 (maximising). A child scores 0.5. Which slot does replace <b>first weaker</b> take (scanning from slot 1)?",
      ["Slot 1", "Slot 2", "Slot 3", "Slot 4"],
      1,
      "Slot 1 (0.6) isn't weaker than 0.5; slot 2 (0.3) is, so the scan stops there.",
    ),
    M(
      "Same population and child. Which slot does replace <b>weakest</b> take?",
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
    M("Same population of 3. Probability of the worst?", ["0", "1/6", "1/3", "1/2"], 1, "1/6."),
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
  B.add("l4-lab", [
    M(
      "Target is 144 pixels. A candidate has 18 wrong. Fitness?",
      ["0.5", "0.75", "0.875", "0.99"],
      2,
      "18 wrong is 1/8 of 144, so 7/8 = 0.875 match.",
      { hint: "18 is one-eighth of 144." },
    ),
    M(
      "Diversity reads 1. What does that mean?",
      [
        "Every member of the population is identical",
        "Members are all different from each other",
        "The best member has perfect fitness",
        "Mutation has been switched off",
      ],
      1,
      "Diversity 0 = identical, 1 = all different.",
    ),
    M(
      "All the population thumbnails look identical. What has happened?",
      [
        "The population is very diverse",
        "The population has converged",
        "The display has a bug",
        "Mutation is set very high",
      ],
      1,
      "Everyone is a copy.",
    ),
    M(
      "How big is the search space of 12×12 black/white pictures?",
      ["144", "144²", "2¹⁴⁴", "12!"],
      2,
      "Each pixel is on or off: 2¹⁴⁴.",
    ),
    TF(
      "With no selection at all (random parents), best fitness improves only a little.",
      true,
      "Nothing favours better pictures, so progress is mostly luck.",
    ),
    M(
      "You raise the tournament size. Expected effect?",
      [
        "Slower convergence and more diversity, since tournaments are fairer",
        "Faster convergence, faster loss of diversity",
        "No effect on the run",
        "Fitness drops over time",
      ],
      1,
      "More pressure.",
    ),
    M(
      'Elitism is on. What does the "best" line look like?',
      ["It jumps around", "It never goes down", "It always goes down", "It's flat at 0"],
      1,
      "The best is always kept.",
    ),
    M(
      "Best fitness is stuck at 0.95 and diversity is 0. What might help?",
      [
        "Lower mutation further, so the good solution isn't disturbed",
        "Raise mutation a little to restore variation",
        "Raise selection pressure",
        "Stop the run now",
      ],
      1,
      "Only mutation can reintroduce variety once everyone is the same.",
    ),
  ]);
})();

/* ===== bank-v-nic-1.js ===== */
/* NIC revision bank, visual and varied questions, part 1.
   Modules: l1-what, l1-monkey, l1-ingredients, l1-apps, l2-generic, l2-optim, l2-complexity, l2-mst.
   Every figure carries the information the question needs. */
(function () {
  const B = NIC.bank;
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;max-height:${h}px">${body}</svg>`;
  const tx = (x, y, s, { c = "var(--text)", a = "middle", z = 13, w = 800 } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${w} ${z}px var(--sans);fill:${c}">${s}</text>`;
  const rect = (x, y, w, h, { f = "var(--panel)", s = "var(--line-2)", r = 8, sw = 2 } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
  const qf = (fn) => (box) => {
    box.innerHTML = fn(NIC.qfig);
  };

  /* ---------- l1-what ---------- */
  B.add("l1-what", [
    {
      type: "pick",
      q: "Ants leave the nest for food, then carry it home laying a scent trail. The colony ends up using one of the three routes below. Tap it.",
      fig: svg(
        460,
        240,
        `
        <path d="M50 120 Q230 -20 410 120" fill="none" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>
        <path d="M50 120 Q230 230 410 120" fill="none" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="120" x2="410" y2="120" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>
        ${rect(216, 98, 28, 44, { f: "var(--bg-2)", s: "var(--text-dim)", r: 6 })}
        ${tx(230, 125, "rock", { z: 11, c: "var(--text-dim)" })}
        ${rect(20, 100, 60, 40, { s: "var(--amber)" })}${tx(50, 125, "Nest")}
        ${rect(380, 100, 60, 40, { s: "var(--teal)" })}${tx(410, 125, "Food")}
        ${tx(230, 36, "one-way trip: 14 s", { c: "var(--text-dim)" })}
        ${tx(140, 108, "one-way trip: 6 s", { c: "var(--text-dim)", z: 12 })}
        ${tx(310, 108, "(blocked)", { c: "var(--rose-ink)", z: 12 })}
        ${tx(230, 214, "one-way trip: 9 s", { c: "var(--text-dim)" })}
        <g data-pick="top"><path d="M50 120 Q230 -20 410 120" fill="none" stroke="transparent" stroke-width="30"/></g>
        <g data-pick="mid"><line x1="50" y1="120" x2="410" y2="120" stroke="transparent" stroke-width="30"/></g>
        <g data-pick="bot"><path d="M50 120 Q230 230 410 120" fill="none" stroke="transparent" stroke-width="30"/></g>`,
      ),
      a: "bot",
      why: "Nobody tells the ants which route to use. The rock blocks the 6 s route, so only two routes are open. Ants on the 9 s route get home and lay trail more often than ants on the 14 s route, so its scent grows faster, more ants follow it, and the feedback locks it in.",
    },
    {
      type: "order",
      q: "How does a colony of simple ants end up on a short route with no leader? Put the feedback loop in order.",
      items: [
        "Ants set out along both routes at random",
        "Ants on the short route get home sooner, so lay trail there more often",
        "A stronger scent makes the next ants more likely to pick that route",
        "More ants use it, which strengthens the scent further",
        "The colony settles on the short route, though no single ant planned it",
      ],
      why: "Random exploration first, then a small advantage (shorter trips mean more trail per minute), then feedback that amplifies the advantage. The group-level answer emerges from simple local rules.",
    },
    {
      type: "cat",
      q: "Each system below inspired a different family of methods. Which natural idea is being copied in each description?",
      buckets: ["Evolution", "Brains", "Swarms"],
      items: [
        ["A population of timetables where the better ones are recombined and tweaked", 0],
        ["Layers of simple units whose connection strengths adjust from examples", 1],
        ["Dozens of drones keeping their spacing from neighbours, with no central controller", 2],
        ["Random changes to a design, keeping versions that score better than their parents", 0],
        ["A program that learns to recognise handwritten digits by adjusting weights", 1],
        ["Many simple agents leaving trails that other agents then follow", 2],
      ],
      why: "Evolution means variation plus selection over generations. Brains mean learning by adjusting connections. Swarms mean many simple agents whose local interactions produce a group result.",
    },
    {
      type: "multi",
      q: "A team is deciding where a nature-inspired method is a sensible choice. Select every job where it fits.",
      o: [
        "Tuning 20 settings of a simulator that can be run and scored, but not differentiated",
        "Sorting a million names alphabetically, where fast exact methods are well known",
        "Finding a good exam timetable, where any timetable can be scored by counting clashes",
        "Finding the largest value in a list, which a single pass over the data solves exactly",
        "Evolving a walking style for a simulated robot when nobody knows the best style",
      ],
      a: [0, 2, 4],
      why: "Nature-inspired methods earn their keep when a good answer is hard to build directly but easy to score. Sorting and finding a maximum already have fast exact methods, so there is nothing to gain by searching.",
    },
    {
      type: "mcq",
      q: "A courier firm must send its drivers out 20 minutes after the orders close, using the best plan available by then. The chart shows how each method's plan improves while it runs. Which is the sound choice?",
      fig: svg(
        460,
        230,
        `
        <line x1="50" y1="190" x2="440" y2="190" stroke="var(--line-2)" stroke-width="2"/>
        <line x1="50" y1="20" x2="50" y2="190" stroke="var(--line-2)" stroke-width="2"/>
        ${tx(245, 220, "minutes of running time", { c: "var(--text-dim)", z: 12 })}
        ${tx(24, 105, "plan", { c: "var(--text-dim)", z: 12 })}${tx(24, 120, "quality", { c: "var(--text-dim)", z: 12 })}
        ${tx(50, 207, "0", { z: 11, c: "var(--text-faint)" })}${tx(245, 207, "30", { z: 11, c: "var(--text-faint)" })}${tx(440, 207, "60", { z: 11, c: "var(--text-faint)" })}
        <line x1="${50 + 390 / 3}" y1="20" x2="${50 + 390 / 3}" y2="190" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5"/>
        ${tx(50 + 390 / 3, 14, "deadline: 20 min", { c: "var(--amber-ink)", z: 12 })}
        <polyline fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" points="50,190 63,92 83,54 128,40 180,35 440,32"/>
        <polyline fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round" points="50,190 310,190 310,24 440,24"/>
        ${tx(72, 118, "nature-inspired", { c: "var(--teal-ink)", a: "start", z: 12 })}
        ${tx(318, 150, "exact method", { c: "var(--blue-ink)", a: "start", z: 12 })}`,
      ),
      o: [
        "Nature-inspired: a good plan exists by 20 minutes, though it is not proven best",
        "Exact: it is the only method that finishes with a provably best plan",
        "Either: both end up near the top of the chart if you let them run",
        "Neither: a plan is only worth using once its search has reached the top",
      ],
      a: 0,
      why: "At the 20 minute deadline the exact method has produced nothing yet (its answer arrives at about 40 minutes). The nature-inspired method already has a plan close to the best. The right choice depends on the deadline, not just on which method ends higher.",
    },
    {
      type: "match",
      q: "Each feature of nature-inspired methods helps in a particular way. Match the feature to its benefit.",
      pairs: [
        ["Many cheap agents with no leader", "Losing one agent barely matters"],
        ["Random variation of candidates", "Can reach answers no designer imagined"],
        ["Selection by success", "Needs only a score, not a recipe for the answer"],
        ["Learning by adjusting connections", "Can improve from examples without being reprogrammed"],
      ],
      why: "These are the reasons the lecture gives for copying nature: robustness, creativity, generality and learning from experience.",
    },
  ]);

  /* ---------- l1-monkey ---------- */
  const strip = (x, y, vals, id) => {
    const cells = vals
      .map((v, i) => {
        const h = v * 9;
        return `<rect x="${x + i * 34}" y="${y + 66 - h}" width="26" height="${h}" rx="4" fill="var(--blue)"/>${tx(x + i * 34 + 13, y + 80, v, { z: 11, c: "var(--text-dim)" })}`;
      })
      .join("");
    return `<g data-pick="${id}">${rect(x - 12, y - 24, 8 * 34 + 8, 120, { f: "var(--panel)" })}${tx(x + 125, y - 6, `Run ${id}: letters matching, step by step`, { z: 12, c: "var(--text-dim)" })}${cells}</g>`;
  };
  B.add("l1-monkey", [
    {
      type: "pick",
      q: "Three runs of a letter-matching search each record how many letters match the target at every step. Exactly one run could NOT have come from keep-if-better (keep a change only if it isn't worse). Tap it.",
      fig: svg(
        320,
        440,
        `${strip(24, 36, [1, 2, 2, 3, 3, 3, 4, 5], "A")}${strip(24, 176, [1, 2, 3, 3, 2, 4, 4, 5], "B")}${strip(24, 316, [0, 1, 1, 2, 3, 4, 4, 4], "C")}`,
      ),
      a: "B",
      why: "Under keep-if-better a change is rejected whenever the score would fall, so the match count can stay level or rise but never drop. Run B falls from 3 to 2 at step 5. Flat stretches in A and C are fine: those steps were rejected or tied.",
    },
    {
      type: "bug",
      q: "This keep-if-better loop is meant to evolve a sentence, but its match count gets worse over time. Click the faulty line.",
      code: [
        'target = "METHINKS IT IS LIKE A WEASEL"',
        "best = random_string(len(target))",
        "while matches(best, target) < len(target):",
        "    child = change_one_random_letter(best)",
        "    if matches(child, target) < matches(best, target):",
        "        best = child",
      ],
      a: 4,
      why: "The test is backwards. It keeps the child when it matches fewer letters. It should keep the child when it is not worse: matches(child) >= matches(best).",
    },
    {
      type: "cat",
      q: "Keep-if-better changes one thing and keeps the result if it isn't worse. For each situation, does it cope or get stuck?",
      buckets: ["It copes", "It gets stuck"],
      items: [
        ["Each letter adds to the score independently of the others", 0],
        ["The score only rises if two particular letters change together", 1],
        ["The landscape has one smooth hill", 0],
        ["The landscape has several hills and the start is on a small one", 1],
        ["A small change to the string gives a small change in score", 0],
        ["Every single change makes the score drop, even though a far better answer exists", 1],
      ],
      why: "Keep-if-better climbs. It works when small improvements add up, as with independent letters or one hill. It stalls on a local peak, or when progress needs several changes at once, because every single step looks worse.",
    },
    {
      type: "mcq",
      q: "Target: CAT. Each row shows the current string and one child made by changing a single letter. Under keep-if-better (keep unless worse), how many of these four children are kept?",
      fig: `<table style="border-collapse:collapse;font:800 14px var(--sans);margin:4px auto"><thead><tr style="color:var(--text-dim)"><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Row</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Current</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Child</th></tr></thead><tbody>
        <tr><td style="padding:6px 14px;text-align:center">1</td><td style="padding:6px 14px;text-align:center">DOG</td><td style="padding:6px 14px;text-align:center">DAG</td></tr>
        <tr><td style="padding:6px 14px;text-align:center">2</td><td style="padding:6px 14px;text-align:center">DAG</td><td style="padding:6px 14px;text-align:center">DAB</td></tr>
        <tr><td style="padding:6px 14px;text-align:center">3</td><td style="padding:6px 14px;text-align:center">DAB</td><td style="padding:6px 14px;text-align:center">DOB</td></tr>
        <tr><td style="padding:6px 14px;text-align:center">4</td><td style="padding:6px 14px;text-align:center">DAB</td><td style="padding:6px 14px;text-align:center">CAB</td></tr></tbody></table>`,
      o: ["1", "2", "3", "4"],
      a: 2,
      hint: "Count the letters in the right place for the current string and for the child, then compare. Equal counts are kept.",
      why: "Against CAT: row 1 goes 0 to 1 (kept). Row 2 goes 1 to 1, a tie, which is not worse (kept). Row 3 goes 1 to 0 (rejected). Row 4 goes 1 to 2 (kept). So three are kept.",
    },
    {
      type: "slider",
      q: "Typical runs of keep-if-better (27 keys, one random letter changed per step) took about 760 steps for a 10-letter target, 1,900 for 20 letters and 4,700 for 40 letters. Estimate the typical steps for an 80-letter target.",
      fig: svg(
        420,
        190,
        `
        <line x1="60" y1="150" x2="400" y2="150" stroke="var(--line-2)" stroke-width="2"/>
        ${[
          [10, 760],
          [20, 1900],
          [40, 4700],
        ]
          .map(
            ([n, s], i) =>
              `<rect x="${60 + i * 80}" y="${150 - (s / 4700) * 120}" width="60" height="${(s / 4700) * 120}" rx="6" fill="var(--blue)"/>${tx(90 + i * 80, 168, `${n} letters`, { z: 12 })}${tx(90 + i * 80, 144 - (s / 4700) * 120, s.toLocaleString("en-GB"), { z: 12, c: "var(--blue-ink)" })}`,
          )
          .join("")}
        <rect x="290" y="30" width="60" height="120" rx="6" fill="none" stroke="var(--line-2)" stroke-width="2" stroke-dasharray="6 5"/>${tx(320, 96, "?", { c: "var(--text-dim)", z: 22 })}${tx(320, 168, "80 letters", { z: 12 })}`,
      ),
      min: 0,
      max: 30000,
      step: 500,
      ans: 10500,
      tol: 3500,
      unit: "steps",
      hint: "Look at what happens each time the target doubles: a bit more than double the steps.",
      why: "Each extra letter adds a little work, so the cost grows a bit faster than the length, about 10,000 steps for 80 letters. Random typing would multiply its tries by 27 for every extra letter, which is why keep-if-better wins.",
    },
  ]);

  /* ---------- l1-ingredients ---------- */
  const bitRow = (x, y, s, fill) =>
    [...s]
      .map((ch, i) => `${rect(x + i * 30, y, 28, 28, { f: fill, r: 6 })}${tx(x + i * 30 + 14, y + 19, ch, { z: 14 })}`)
      .join("");
  B.add("l1-ingredients", [
    {
      type: "pick",
      q: "A single hiker (one candidate) makes small random steps and keeps a step only if it goes uphill. Starting at the red dot, which spot will the hiker end up on?",
      fig: qf((Q) =>
        Q.curve(
          (x) => 0.05 + 0.55 * Math.exp(-(((x - 0.25) / 0.09) ** 2)) + 1.0 * Math.exp(-(((x - 0.75) / 0.1) ** 2)),
          [
            [0.05, "D"],
            [0.25, "A"],
            [0.5, "B"],
            [0.75, "C"],
          ],
          { sx: 0.17, label: "possible solutions" },
        ),
      ),
      a: "A",
      why: "Small uphill steps carry the hiker to the top of the nearest hill (A), not the highest one (C). This is why EAs keep a whole population spread across the landscape: some members start near C.",
    },
    {
      type: "cat",
      q: "Each symptom below comes from an EA whose selection is badly tuned. Is the selection too strong or too weak?",
      buckets: ["Too strong", "Too weak"],
      items: [
        ["Within five generations every candidate is a copy of one parent", 0],
        ["After 200 generations the average score is no better than at the start", 1],
        ["The best score jumps early, then never moves again", 0],
        ["Parents are picked almost uniformly, whatever their score", 1],
        ["The least fit candidates are never given any chance to breed", 0],
        ["Good solutions appear but are lost again about as often as they are found", 1],
      ],
      why: "Too-strong selection kills variety quickly, so the search converges early and gets stuck. Too-weak selection is nearly random, so fit solutions are not kept and nothing accumulates. The lecture asks for a weak bias in between.",
    },
    {
      type: "pick",
      q: "Two parents are combined by 1-point crossover (cut once, take the left part from one parent and the right part from the other). One child below could NOT have been produced this way. Tap it.",
      fig: svg(
        460,
        330,
        `
        ${tx(24, 28, "Parent 1", { a: "start", c: "var(--blue-ink)" })}${bitRow(110, 8, "11110000", "var(--blue-dim, var(--bg-2))")}
        ${tx(24, 68, "Parent 2", { a: "start", c: "var(--amber-ink)" })}${bitRow(110, 48, "00001111", "var(--amber-dim, var(--bg-2))")}
        ${["11001111", "00110000", "11111111", "00111100"].map((s, i) => `<g data-pick="${"c" + (i + 1)}">${rect(14, 100 + i * 56, 360, 48, { f: "var(--panel)" })}${tx(34, 130 + i * 56, "Child " + (i + 1), { a: "start" })}${bitRow(124, 110 + i * 56, s, "var(--bg-2)")}</g>`).join("")}`,
      ),
      a: "c4",
      why: "A 1-point child is a left part of one parent joined to the right part of the other, with every gene keeping its position. Child 4 (00111100) would need a left part of 0s from parent 2, then 1111 and then 00, which takes two cuts. Children 1, 2 and 3 come from cuts after 2, 2 and 4 genes.",
    },
    {
      type: "mcq",
      q: "Parents are drawn with a chance proportional to their fitness. The bars show five candidates' fitness. Compared with the weakest, how much more often is the best one picked?",
      fig: svg(
        420,
        190,
        `
        <line x1="40" y1="150" x2="400" y2="150" stroke="var(--line-2)" stroke-width="2"/>
        ${[1000, 1010, 1020, 1030, 1040].map((v, i) => `<rect x="${60 + i * 66}" y="${150 - (v / 1040) * 110}" width="46" height="${(v / 1040) * 110}" rx="5" fill="var(--violet)"/>${tx(83 + i * 66, 143 - (v / 1040) * 110, v.toLocaleString("en-GB"), { z: 11, c: "var(--violet-ink)" })}${tx(83 + i * 66, 168, "P" + (i + 1), { z: 12 })}`).join("")}`,
      ),
      o: ["About 1.04 times as often", "About 2 times as often", "About 5 times as often", "About 40 times as often"],
      a: 0,
      hint: "Chance is proportional to fitness, so compare 1,040 with 1,000.",
      why: "The ratio of the chances equals the ratio of the fitness values: 1,040 to 1,000, about 1.04. When scores are all close, fitness-proportional selection is almost random, which is a very weak bias. The lecture wants weak, not absent.",
    },
    {
      type: "multi",
      q: "An EA's population has become too uniform. Which changes would help keep variety? Select all that apply.",
      o: [
        "Use a larger population",
        "Give the weakest candidates a better chance of being picked as parents",
        "Mutate each child slightly more",
        "Always breed only from the current top two",
        "Overwrite the whole population with copies of the best candidate",
      ],
      a: [0, 1, 2],
      why: "Variety comes from many different candidates (population size), from a weak selection bias, and from mutation. Breeding only from the top two, or cloning the best, throws variety away.",
    },
    {
      type: "bug",
      q: "An EA is meant to keep a population of 50 but always stalls on the first hill it finds. Click the line that removes the 'population' ingredient.",
      code: [
        "population = random_candidates(50)",
        "for generation in range(100):",
        "    scores = [fitness(c) for c in population]",
        "    parents = pick_weighted(population, scores)",
        "    children = [mutate(p) for p in parents]",
        "    population = [max(children, key=fitness)]",
      ],
      a: 5,
      why: "The last line shrinks the population to one candidate each generation, so the search becomes a single hiker making small steps. Replace it with population = children so that many candidates stay alive.",
    },
  ]);

  /* ---------- l1-apps ---------- */
  const chip = (x, y, s, c) =>
    `${rect(x, y, 44, 26, { f: "var(--bg-2)", s: c, r: 7 })}${tx(x + 22, y + 18, s, { z: 12 })}`;
  const tt = (
    id,
    x,
    y,
    s1,
    s2,
  ) => `<g data-pick="${id}">${rect(x, y, 216, 92, { f: "var(--panel)" })}${tx(x + 12, y + 20, "Timetable " + id, { a: "start", z: 12, c: "var(--text-dim)" })}
      ${tx(x + 12, y + 46, "Slot 1", { a: "start", z: 11, c: "var(--text-faint)" })}${s1.map((e, i) => chip(x + 62 + i * 50, y + 30, e, "var(--blue)")).join("")}
      ${tx(x + 12, y + 78, "Slot 2", { a: "start", z: 11, c: "var(--text-faint)" })}${s2.map((e, i) => chip(x + 62 + i * 50, y + 62, e, "var(--amber)")).join("")}</g>`;
  B.add("l1-apps", [
    {
      type: "cat",
      q: "An EA only improves what the fitness function rewards. Which of these fitness definitions steer the search towards what we really want, and which can be gamed?",
      buckets: ["Steers the search well", "Can be gamed or misses the goal"],
      items: [
        ["Robot walking: distance covered in 30 s of simulation", 0],
        ["Robot walking: how fast its legs move", 1],
        ["Antenna: how closely the simulated signal meets the required spec", 0],
        ["Antenna: number of wire segments used", 1],
        ["Timetable: total number of student clashes (to minimise)", 0],
        ["Timetable: number of exams that have been given a slot", 1],
      ],
      why: "A good fitness function measures the real goal. Fast legs can spin uselessly in the air, wire count says nothing about signal quality, and placing every exam in one slot scores perfectly on 'exams placed' while creating huge clashes.",
    },
    {
      type: "match",
      q: "To use an EA you first decide how a candidate is written down (its chromosome). Match each problem to a sensible encoding.",
      pairs: [
        ["Exam timetable", "One slot number for each exam"],
        ["Car body, as in the lecture", "A series of slice shapes along the car"],
        ["Robot walking controller", "A list of numbers that set how the legs move"],
        ["Delivery round", "The order in which the stops are visited"],
      ],
      why: "Whatever the problem, the chromosome must be something an EA can copy, mutate and recombine, and from which the fitness function can build and score a whole candidate.",
    },
    {
      type: "pick",
      q: "Four exams share some students: Maths and Physics 20, Maths and History 3, Physics and Art 5, Art and History 12 (all other pairs share none). Fitness is the number of students with a clash (two of their exams in one slot), and lower is better. Tap the fittest timetable.",
      fig: svg(
        460,
        220,
        `${tt("W", 6, 10, ["M"], ["P", "A", "H"])}${tt("X", 238, 10, ["M", "P"], ["A", "H"])}${tt("Y", 6, 116, ["M", "A"], ["P", "H"])}${tt("Z", 238, 116, ["M", "H"], ["P", "A"])}`,
      ),
      a: "Y",
      why: "Add up the shared students for each pair that sits in the same slot. W: 5 + 0 + 12 = 17. X: 20 + 12 = 32. Z: 3 + 5 = 8. Y: Maths and Art share none, Physics and History share none, so 0 clashes.",
    },
    {
      type: "bug",
      q: "The EA keeps candidates with the HIGHEST fitness, yet its timetables keep getting worse. Click the faulty line.",
      code: [
        "def fitness(timetable):",
        "    clashes = 0",
        "    for a, b in exam_pairs:",
        "        if slot[a] == slot[b]:",
        "            clashes += shared_students[a][b]",
        "    return clashes",
      ],
      a: 5,
      why: "The function returns the number of clashes, so more clashes means higher fitness. For a maximising EA it should return the negative, -clashes, or the EA must be told to minimise.",
    },
    {
      type: "order",
      q: "An engineer wants to evolve a new design with an EA. Put the set-up work in a sensible order.",
      items: [
        "Decide how a design is written down as a chromosome",
        "Write a fitness function that scores any design, for example by simulation",
        "Generate a random starting population and score it",
        "Run the select, vary and update loop for many generations",
        "Check the best design in a more detailed test before building it",
      ],
      why: "The encoding comes first because the fitness function has to read it. The EA loop needs both, and an evolved design should be checked outside the simulator before anyone relies on it.",
    },
  ]);

  /* ---------- l2-generic ---------- */
  const box = (id, x, y, name, v, c) =>
    `<g data-pick="${id}">${rect(x, y, 70, 56, { f: "var(--panel)", s: c })}${tx(x + 35, y + 22, name, { z: 13 })}${tx(x + 35, y + 44, "score " + v, { z: 12, c: "var(--text-dim)" })}</g>`;
  const runPanel = (x, title, best, avg, id) => {
    const X = (g) => x + 10 + g * 6.6,
      Y = (v) => 150 - v * 1.1;
    const pts = (f) => Array.from({ length: 20 }, (_, g) => `${X(g).toFixed(1)},${Y(f(g)).toFixed(1)}`).join(" ");
    return `<g data-pick="${id}">${rect(x, 10, 150, 175, { f: "var(--panel)" })}${tx(x + 75, 28, title, { z: 12, c: "var(--text-dim)" })}
      <line x1="${x + 10}" y1="${Y(100)}" x2="${x + 140}" y2="${Y(100)}" stroke="var(--text-faint)" stroke-dasharray="4 4"/>${tx(x + 140, Y(100) + 12, "optimum", { a: "end", z: 10, c: "var(--text-faint)" })}
      <polyline fill="none" stroke="var(--teal)" stroke-width="3" points="${pts(best)}"/><polyline fill="none" stroke="var(--blue)" stroke-width="3" stroke-dasharray="1 0" points="${pts(avg)}"/></g>`;
  };
  const r1b = (g) => 20 + 60 * (1 - Math.exp(-g / 2.5)),
    r1a = (g) => 20 + (r1b(g) - 20) * (1 - Math.exp(-g / 6));
  const r2b = (g) => 30 + 40 * (g / 19) + 3 * Math.sin(g * 2),
    r2a = (g) => 30 + 3 * Math.sin(g);
  const r3b = (g) => 20 + 79 * (1 - Math.exp(-g / 8)),
    r3a = (g) => 20 + 55 * (1 - Math.exp(-g / 8));
  const bars = (vals, names) =>
    vals
      .map(
        (v, i) =>
          `<g data-pick="${names[i]}"><rect x="${20 + i * 52}" y="${120 - v * 11}" width="38" height="${v * 11}" rx="5" fill="var(--violet)"/>${tx(39 + i * 52, 114 - v * 11, v, { z: 12, c: "var(--violet-ink)" })}${tx(39 + i * 52, 142, names[i], { z: 14 })}<rect x="${20 + i * 52}" y="0" width="38" height="150" fill="transparent"/></g>`,
      )
      .join("");
  B.add("l2-generic", [
    {
      type: "pick",
      q: "The population holds 4 individuals. Children have just been made and scored. With update rule 2 (merge old and new, keep the best 4), tap everyone who is in the next population.",
      fig: svg(
        440,
        190,
        `${tx(12, 24, "Parents", { a: "start", z: 12, c: "var(--text-dim)" })}${box("P1", 12, 34, "P1", 7, "var(--blue)")}${box("P2", 98, 34, "P2", 5, "var(--blue)")}${box("P3", 184, 34, "P3", 4, "var(--blue)")}${box("P4", 270, 34, "P4", 2, "var(--blue)")}
        ${tx(12, 112, "Children", { a: "start", z: 12, c: "var(--text-dim)" })}${box("C1", 12, 118, "C1", 6, "var(--amber)")}${box("C2", 98, 118, "C2", 3, "var(--amber)")}${box("C3", 184, 118, "C3", 3, "var(--amber)")}${box("C4", 270, 118, "C4", 1, "var(--amber)")}`,
      ),
      a: ["C1", "P1", "P2", "P3"],
      why: "Merging gives eight individuals with scores 7, 6, 5, 4, 3, 3, 2, 1. The best four are P1 (7), C1 (6), P2 (5) and P3 (4). Under rule 1 (replace everyone) the next population would be only C1 to C4, and the 7 would be lost. With rule 2 the best so far can never disappear.",
    },
    {
      type: "bug",
      q: "A maximising EA runs but its children never improve the population. Click the faulty line.",
      code: [
        "P = random_population(100)",
        "evaluate(P)",
        "while time_left > 0:",
        "    parents = select(P)",
        "    children = vary(parents)",
        "    evaluate(parents)",
        "    P = merge_and_keep_best(P, children, 100)",
      ],
      a: 5,
      why: "The line scores the parents a second time, so the new children have no fitness when the merge needs it. The evaluation step must score the children: evaluate(children).",
    },
    {
      type: "pick",
      q: "Three runs plot best (green) and average (blue) fitness over 20 generations, and the dashed line is the optimum. In one run the population has collapsed to near-identical individuals while still well below the optimum. Tap it.",
      fig: svg(
        480,
        195,
        `${runPanel(4, "Run 1", r1b, r1a, "R1")}${runPanel(164, "Run 2", r2b, r2a, "R2")}${runPanel(324, "Run 3", r3b, r3a, "R3")}`,
      ),
      a: "R1",
      why: "When best and average meet, every individual is about as good as the best, meaning they are nearly copies. In Run 1 that happens at about 80, short of the optimum. Run 2 has a wide gap but little progress (selection too weak). Run 3 keeps a healthy gap while the best climbs.",
    },
    {
      type: "pick",
      q: "Tournament selection draws two individuals at random and the fitter one becomes a parent. Three draws were made: D vs F, B vs H and A vs C. Tap the three parents.",
      fig: svg(
        430,
        190,
        `${bars([4, 8, 6, 2, 9, 5, 3, 7], ["A", "B", "C", "D", "E", "F", "G", "H"])}${tx(80, 178, "Draw 1: D vs F", { z: 13, c: "var(--text-dim)" })}${tx(215, 178, "Draw 2: B vs H", { z: 13, c: "var(--text-dim)" })}${tx(350, 178, "Draw 3: A vs C", { z: 13, c: "var(--text-dim)" })}`,
      ),
      a: ["B", "C", "F"],
      why: "Each draw is won by the higher bar. F (5) beats D (2), B (8) beats H (7) and C (6) beats A (4). E has the best score of all but was not drawn, which is how tournaments keep a weak bias rather than always choosing the very best.",
    },
    {
      type: "cat",
      q: "You move an EA from exam timetabling to antenna design. Which parts must you rewrite, and which stay the same?",
      buckets: ["Changes with the problem", "Same for every problem"],
      items: [
        ["How a candidate is written down (the encoding)", 0],
        ["The fitness function", 0],
        ["The select, vary, update loop", 1],
        ["Mutation that swaps two exams between slots", 0],
        ["Stopping when the time budget runs out", 1],
        ["The rule 'merge old and new, keep the best', for population update", 1],
      ],
      why: "The loop and update rules are generic. Anything that depends on what a candidate looks like or what makes it good (encoding, fitness, and operators that suit the encoding) is problem-specific.",
    },
  ]);

  /* ---------- l2-optim ---------- */
  const sub = ["000", "001", "010", "011", "100", "101", "110", "111"];
  const subW = [0, 72, 50, 122, 40, 112, 90, 162];
  B.add("l2-optim", [
    {
      type: "pick",
      q: "Three items weigh 40, 50 and 72 kg (bits show which are taken, in that order). The bars show each subset's total weight. Fitness is |weight - 100|, minimised. Tap the best subset.",
      fig: svg(
        480,
        230,
        `
        <line x1="20" y1="190" x2="470" y2="190" stroke="var(--line-2)" stroke-width="2"/>
        <line x1="20" y1="${190 - 100 * 0.9}" x2="470" y2="${190 - 100 * 0.9}" stroke="var(--rose)" stroke-width="2" stroke-dasharray="6 5"/>${tx(24, 190 - 100 * 0.9 - 8, "target 100 kg", { a: "start", z: 12, c: "var(--rose-ink)" })}
        ${sub.map((s, i) => `<g data-pick="${s}"><rect x="${30 + i * 55}" y="${190 - subW[i] * 0.9}" width="42" height="${subW[i] * 0.9}" rx="5" fill="var(--blue)"/>${tx(51 + i * 55, 183 - subW[i] * 0.9, subW[i], { z: 12, c: "var(--blue-ink)" })}${tx(51 + i * 55, 212, s, { z: 13 })}<rect x="${30 + i * 55}" y="30" width="42" height="170" fill="transparent"/></g>`).join("")}`,
      ),
      a: "110",
      why: "Closest to 100 on either side wins. 110 weighs 90 (f = 10), 101 weighs 112 (f = 12) and 111 weighs 162 (f = 62). Overshooting is penalised just like undershooting, so a total slightly over 100 is not automatically better.",
    },
    {
      type: "slider",
      q: "Exhaustive search must try every on/off combination of 20 items, and scoring one combination takes 1 millisecond. Roughly how long does the whole search take?",
      min: 0,
      max: 60,
      step: 1,
      ans: 17,
      tol: 7,
      unit: "minutes",
      hint: "2^10 is about 1,000, so 2^20 is about 1,000 x 1,000 = a million. A million milliseconds is 1,000 seconds.",
      why: "20 items give 2^20, about a million combinations. A million milliseconds is 1,000 seconds, a bit under 17 minutes. Adding just 10 more items would multiply that by 1,000.",
    },
    {
      type: "order",
      q: "A rucksack holds at most 10 kg. A candidate's fitness is its total value if it fits, and 0 if it is too heavy. Order the candidates from best fitness to worst.",
      fig: `<table style="border-collapse:collapse;font:800 14px var(--sans);margin:4px auto"><thead><tr style="color:var(--text-dim)"><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Candidate</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Weight (kg)</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Value</th></tr></thead><tbody>
        ${[
          ["A", 8, 12],
          ["B", 11, 20],
          ["C", 10, 14],
          ["D", 6, 9],
          ["E", 9, 13],
        ]
          .map(
            ([n, w, v]) =>
              `<tr><td style="padding:6px 14px;text-align:center">${n}</td><td style="padding:6px 14px;text-align:center">${w}</td><td style="padding:6px 14px;text-align:center">${v}</td></tr>`,
          )
          .join("")}</tbody></table>`,
      items: ["Candidate C", "Candidate E", "Candidate A", "Candidate D", "Candidate B"],
      why: "B is worth the most but weighs 11 kg, so its fitness is 0. C weighs exactly 10 kg, which fits, so it scores 14. Then E 13, A 12, D 9. A fitness function can build a rule such as 'too heavy scores 0' straight into the score.",
    },
    {
      type: "bug",
      q: "The goal is a subset weighing as close to 100 kg as possible, and the EA minimises fitness. It keeps returning a subset that weighs only 5 kg. Click the faulty line.",
      code: ["def fitness(bits):", "    total = sum(w for w, b in zip(weights, bits) if b)", "    return total - 100"],
      a: 2,
      why: "Without a modulus, a light subset gets a very negative number, which looks great to a minimiser. The score needs to measure distance: abs(total - 100).",
    },
    {
      type: "cat",
      q: "Is exhaustive search (try every candidate) practical on a normal computer for these search spaces?",
      buckets: ["Practical", "Not practical"],
      items: [
        ["Six on/off switches", 0],
        ["A three-digit lock code", 0],
        ["Choosing a subset of 40 items", 1],
        ["Any real number x between 0 and 1", 1],
        ["Ordering 15 tasks in a queue", 1],
        ["Picking the best of 200 candidate routes", 0],
      ],
      why: "Six switches give 64 settings, a lock gives 1,000 and 200 routes is tiny. A subset of 40 items gives 2^40, about a trillion. Fifteen tasks give 15! orders, also about a trillion. The real numbers between 0 and 1 are infinitely many.",
    },
    {
      type: "mcq",
      q: "An exhaustive search checks 1,000 candidates in a random order. The chart shows the best fitness found so far (lower is better). It stopped improving at candidate 300. After checking 700, can you stop and be sure 8 is the optimum?",
      fig: svg(
        460,
        220,
        `
        <line x1="50" y1="180" x2="440" y2="180" stroke="var(--line-2)" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="180" stroke="var(--line-2)" stroke-width="2"/>
        ${tx(245, 208, "candidates checked (out of 1,000)", { z: 12, c: "var(--text-dim)" })}${tx(26, 100, "best", { z: 12, c: "var(--text-dim)" })}${tx(26, 115, "so far", { z: 12, c: "var(--text-dim)" })}
        ${tx(50, 196, "0", { z: 11, c: "var(--text-faint)" })}${tx(440, 196, "1,000", { z: 11, c: "var(--text-faint)" })}
        <polyline fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" points="50,30 54,30 54,60 59,60 59,90 62,90 62,110 80,110 80,130 100,130 100,150 170,150 170,168 170,168 440,168"/>
        ${tx(60, 24, "90", { z: 11, a: "start", c: "var(--text-faint)" })}${tx(444, 160, "8", { z: 12, a: "start", c: "var(--teal-ink)" })}
        <line x1="${50 + 390 * 0.7}" y1="20" x2="${50 + 390 * 0.7}" y2="180" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5"/>${tx(50 + 390 * 0.7, 14, "now: 700", { z: 12, c: "var(--amber-ink)" })}`,
      ),
      o: [
        "No: the 300 unchecked candidates could still hold a score below 8",
        "Yes: 400 checks without change show that nothing better exists",
        "Yes: the best-so-far line can only fall, so it must be final",
        "No: only candidates checked after 700 are allowed to count",
      ],
      a: 0,
      why: "Exhaustive search is only guaranteed once every candidate has been checked. A long flat stretch is just evidence, not proof, because the best remaining candidate might be one of the unchecked ones. Stopping early turns it into a heuristic.",
    },
  ]);

  /* ---------- l2-complexity ---------- */
  const growth = (() => {
    const X = (n) => 60 + n * 18,
      Y = (v) => 190 - (v / 160000) * 160;
    const line = (f, c) =>
      `<polyline fill="none" stroke="${c}" stroke-width="3.5" stroke-linejoin="round" points="${Array.from({ length: 21 }, (_, n) => `${X(n)},${Y(f(n)).toFixed(1)}`).join(" ")}"/>`;
    const hit = (f) =>
      `<polyline fill="none" stroke="transparent" stroke-width="22" data-hit="" points="${Array.from({ length: 21 }, (_, n) => `${X(n)},${Y(f(n)).toFixed(1)}`).join(" ")}"/>`;
    return svg(
      480,
      250,
      `
      <line x1="60" y1="190" x2="430" y2="190" stroke="var(--line-2)" stroke-width="2"/><line x1="60" y1="20" x2="60" y2="190" stroke="var(--line-2)" stroke-width="2"/>
      ${[0, 5, 10, 15, 20].map((n) => tx(X(n), 208, n, { z: 11, c: "var(--text-faint)" })).join("")}${tx(245, 230, "n (size of the problem)", { z: 12, c: "var(--text-dim)" })}
      ${tx(44, 34, "160k", { z: 11, a: "end", c: "var(--text-faint)" })}${tx(44, 194, "0", { z: 11, a: "end", c: "var(--text-faint)" })}${tx(18, 110, "steps", { z: 12, c: "var(--text-dim)" })}
      <g data-pick="lin">${line((n) => 5000 * n, "var(--violet)")}${hit((n) => 5000 * n)}</g>
      <g data-pick="poly">${line((n) => n ** 4, "var(--blue)")}${hit((n) => n ** 4)}</g>
      <g data-pick="exp">${line((n) => 1.3 ** n, "var(--rose)")}${hit((n) => 1.3 ** n)}</g>
      ${tx(436, 62, "n⁴", { a: "start", c: "var(--blue-ink)" })}${tx(436, 95, "5000n", { a: "start", c: "var(--violet-ink)" })}${tx(436, 186, "1.3ⁿ", { a: "start", c: "var(--rose-ink)" })}`,
    );
  })();
  const ccol = (i, n, p, e, id) =>
    `<g data-pick="${id}">${rect(14 + i * 90, 10, 82, 120, { f: "var(--panel)" })}${tx(55 + i * 90, 32, "n = " + n, { z: 13 })}${tx(55 + i * 90, 62, "n³", { z: 11, c: "var(--blue-ink)" })}${tx(55 + i * 90, 82, p, { z: 13, c: "var(--blue-ink)" })}${tx(55 + i * 90, 106, "1.5ⁿ", { z: 11, c: "var(--rose-ink)" })}${tx(55 + i * 90, 124, e, { z: 13, c: "var(--rose-ink)" })}</g>`;
  B.add("l2-complexity", [
    {
      type: "pick",
      q: "The chart plots the steps taken by three algorithms for n up to 20. If n kept growing without limit, which curve would end up highest of all? Tap it.",
      fig: growth,
      a: "exp",
      why: "On this chart 1.3^n looks flat, but exponentials always win in the end. 1.3^n overtakes n^4 at about n = 64, and n^4 left 5000n behind long before. Small n fools you, which is why we compare growth, not values at small sizes.",
    },
    {
      type: "match",
      q: "Each algorithm's input grows from n = 20 to n = 21. Match its running-time formula to what happens to its number of steps.",
      pairs: [
        ["n steps (linear)", "About 5% more steps"],
        ["n² steps", "About 10% more steps"],
        ["2ⁿ steps", "Twice as many steps"],
        ["n! steps", "21 times as many steps"],
      ],
      hint: "Linear: 21 against 20. Squared: 441 against 400. Exponential: one more factor of 2. Factorial: one more factor of 21.",
      why: "Polynomials grow by a small percentage when n goes up by one. For 2^n each extra unit doubles the work, and for n! it multiplies the work by the new n, which is how exponential growth runs away.",
    },
    {
      type: "mcq",
      q: "The table shows how long two algorithms took on the same computer. Which of them could still finish n = 100 within a minute?",
      fig: `<table style="border-collapse:collapse;font:800 14px var(--sans);margin:4px auto"><thead><tr style="color:var(--text-dim)"><th style="padding:6px 14px;border-bottom:2px solid var(--line)">n</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Algorithm A</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Algorithm B</th></tr></thead><tbody>
        ${[
          [10, "0.02 s", "0.001 s"],
          [20, "0.08 s", "1 s"],
          [30, "0.18 s", "1,000 s"],
          [40, "0.32 s", "about 12 days"],
        ]
          .map(
            ([n, a, b]) =>
              `<tr><td style="padding:6px 14px;text-align:center">${n}</td><td style="padding:6px 14px;text-align:center">${a}</td><td style="padding:6px 14px;text-align:center">${b}</td></tr>`,
          )
          .join("")}</tbody></table>`,
      o: ["Only A", "Only B", "Both", "Neither"],
      a: 0,
      why: "A's time grows like n squared (doubling n multiplies time by 4), so n = 100 takes about 2 seconds. B is quicker at n = 10 but multiplies by 1,000 for every 10 more, so it is exponential and hopeless by n = 100.",
    },
    {
      type: "pick",
      q: "The table compares a polynomial (n cubed) with an exponential (1.5 to the n). Tap the first column where the exponential becomes the larger one.",
      fig: svg(
        470,
        140,
        `${ccol(0, 5, "125", "7.6", "n5")}${ccol(1, 10, "1,000", "58", "n10")}${ccol(2, 20, "8,000", "3,325", "n20")}${ccol(3, 30, "27,000", "191,751", "n30")}${ccol(4, 40, "64,000", "11 million", "n40")}`,
      ),
      a: "n30",
      why: "At n = 20 the polynomial is still ahead (8,000 against 3,325), so a quick test at that size would favour the exponential method. By n = 30 it has overtaken (191,751 against 27,000), and it pulls further ahead at n = 40.",
    },
    {
      type: "bug",
      q: "This exhaustive search for the subset sum closest to a target takes exponential time. Click the line that causes it.",
      code: [
        "def closest_sum(items, target):",
        "    best = None",
        "    for mask in range(2 ** len(items)):",
        "        total = sum(items[i] for i in range(len(items)) if mask >> i & 1)",
        "        if best is None or abs(total - target) < abs(best - target):",
        "            best = total",
        "    return best",
      ],
      a: 2,
      why: "The loop runs once per subset, and there are 2^n subsets for n items. Each pass of the body is cheap (about n steps), so the number of passes is what makes the whole search exponential.",
    },
    {
      type: "cat",
      q: "The lecture calls a problem easy when a polynomial-time exact method is known, and hard when only exponential ones are known. Which is which? (The size of the search space is not the test.)",
      buckets: ["Easy", "Hard"],
      items: [
        ["Sorting a list of a million names (it has a million factorial possible orders)", 0],
        ["Cheapest cable network linking 50 towns, with no extra rules", 0],
        ["Cheapest cable network where no town may have more than 2 links", 1],
        ["Lowest-energy fold of a 500-amino-acid protein", 1],
        ["Finding the largest number in a list", 0],
        ["Shortest tour through 100 cities", 1],
      ],
      why: "Sorting has an astronomically large space of orders, but a fast method finds the answer without searching it. Plain MST and finding a maximum are also solved fast. Adding a degree limit, folding proteins and touring cities have no known fast exact method.",
    },
  ]);

  /* ---------- l2-mst ---------- */
  const NODES6 = { A: [60, 60], B: [200, 40], C: [340, 60], D: [60, 190], E: [200, 210], F: [340, 190] };
  const NODES5 = { A: [50, 130], B: [180, 50], C: [180, 210], D: [330, 130], E: [420, 60] };
  const HEX = { A: [230, 30], B: [312, 78], C: [312, 178], D: [230, 226], E: [148, 178], F: [148, 78] };
  B.add("l2-mst", [
    {
      type: "pick",
      q: "Prim's algorithm has built the green tree (A, B and C). It now compares candidate edges. Tap every edge that Prim considers at this step.",
      fig: qf((Q) =>
        Q.graph(
          NODES6,
          [
            ["A", "B", 2],
            ["B", "C", 4],
            ["A", "D", 3],
            ["B", "E", 6],
            ["C", "F", 5],
            ["D", "E", 1],
            ["E", "F", 7],
            ["B", "D", 8],
          ],
          {
            pick: "edges",
            w: 400,
            h: 250,
            hl: { "A-B": "var(--teal)", "B-C": "var(--teal)", A: "var(--teal)", B: "var(--teal)", C: "var(--teal)" },
          },
        ),
      ),
      a: ["A-D", "B-E", "C-F", "B-D"],
      why: "Prim only compares edges with exactly one end in the tree and one end outside: A-D, B-D, B-E and C-F. D-E (cost 1) is the cheapest edge in the graph but joins two towns that are both outside the tree, so it is not a candidate yet. Prim would add A-D (3).",
    },
    {
      type: "bug",
      q: "This Prim implementation sometimes picks an edge that closes a loop. Click the faulty line.",
      code: [
        "tree_nodes = {start}",
        "tree_edges = []",
        "while len(tree_nodes) < n:",
        "    candidates = [e for e in edges if e.a in tree_nodes or e.b in tree_nodes]",
        "    e = min(candidates, key=lambda e: e.cost)",
        "    tree_edges.append(e)",
        "    tree_nodes |= {e.a, e.b}",
      ],
      a: 3,
      why: "With 'or', an edge with both ends already in the tree counts as a candidate, and adding it creates a cycle. A candidate must have exactly one end in the tree: (e.a in tree_nodes) != (e.b in tree_nodes).",
    },
    {
      type: "cat",
      q: "Five towns A to E are connected by the links listed. Is each set of links a spanning tree?",
      buckets: ["Spanning tree", "Not a spanning tree"],
      items: [
        ["A-B, B-C, C-D, D-E", 0],
        ["A-B, B-C, C-A, D-E", 1],
        ["A-B, A-C, A-D, A-E", 0],
        ["A-B, B-C, C-D, D-E, E-A", 1],
        ["A-B, C-D, D-E", 1],
        ["A-C, C-E, E-B, B-D", 0],
      ],
      why: "A spanning tree connects every town (no town cut off) with no loops, which means exactly 4 links for 5 towns. The second set has a loop and leaves D and E cut off, the fourth is a ring, and the fifth leaves A and B cut off.",
    },
    {
      type: "mcq",
      q: "Four towns are joined by the links shown: H's three links cost 1 each and the three links between A, B and C cost 4 each. Prim would take all three links from H, but now no town may have more than 2 cables. What is the cheapest valid network that still connects all four towns?",
      fig: qf((Q) =>
        Q.graph(
          { H: [230, 120], A: [80, 50], B: [380, 50], C: [230, 215] },
          [
            ["H", "A", 1],
            ["H", "B", 1],
            ["H", "C", 1],
            ["A", "B", 4],
            ["B", "C", 4],
            ["A", "C", 4],
          ],
          { w: 460, h: 250 },
        ),
      ),
      o: ["3", "5", "6", "9"],
      a: 2,
      why: "H can have only two cables, so the network is a path. With H in the middle it uses two cost-1 links plus one cost-4 link: 1 + 1 + 4 = 6. With H at an end it costs 1 + 4 + 4 = 9. The plain MST costs 3 but gives H three cables, so the constraint raises the cost.",
    },
    {
      type: "order",
      q: "Run Prim's algorithm from A on the network shown. Put the edges in the order Prim adds them.",
      fig: qf((Q) =>
        Q.graph(
          NODES5,
          [
            ["A", "B", 4],
            ["A", "C", 1],
            ["B", "C", 2],
            ["B", "D", 3],
            ["C", "D", 7],
            ["B", "E", 6],
            ["D", "E", 5],
          ],
          { w: 460, h: 250 },
        ),
      ),
      items: ["A-C", "B-C", "B-D", "D-E"],
      why: "From A the cheapest edge is A-C (1). Then B-C (2) is cheapest to a new town. Then B-D (3), then D-E (5) beats B-E (6). The edge A-B (4) is never used because both of its ends are already in the tree, and the total cost is 1 + 2 + 3 + 5 = 11.",
    },
    {
      type: "mcq",
      q: "Six towns are joined in a ring, one cable between each neighbouring pair as shown. How many different spanning trees does this network have?",
      fig: qf((Q) =>
        Q.graph(
          HEX,
          [
            ["A", "B"],
            ["B", "C"],
            ["C", "D"],
            ["D", "E"],
            ["E", "F"],
            ["F", "A"],
          ],
          { w: 460, h: 250 },
        ),
      ),
      o: ["1", "5", "6", "15"],
      a: 2,
      why: "A spanning tree on six towns needs 5 links, so exactly one of the 6 cables must be left out. Removing any one of them breaks the loop and keeps everything connected, which gives 6 different trees. The tempting answer 5 confuses the number of links in a tree with the number of trees.",
    },
  ]);
})();

/* ===== bank-v-nic-2.js ===== */
/* NIC revision bank, visual and varied questions, part 2. Numbers verified with node. */
(function () {
  const B = NIC.bank;

  /* ---------- small SVG helpers (CSS variables so both themes work) ---------- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, s, { a = "middle", c = "var(--text)", f = "800 13px" } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${f} var(--sans);fill:${c}">${s}</text>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2, d = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const path = (pts, c, w = 3, d = "") =>
    `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const mat = (C, D) =>
    `<div style="max-width:340px"><table class="t matrix"><tr><th></th>${C.map((x) => `<th>${x}</th>`).join("")}</tr>${C.map((a) => `<tr><th>${a}</th>${C.map((b) => (a === b ? `<td class="faint">–</td>` : `<td>${D[a][b]}</td>`)).join("")}</tr>`).join("")}</table></div>`;
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  };

  /* ======================================================================
     l2-approx
     ====================================================================== */
  const deadlineFig = () => {
    const X = (t) => 50 + t * 32.5,
      Y = (q) => 190 - q * 1.6;
    const simple = [],
      ea = [];
    for (let t = 0; t <= 12.01; t += 0.25) {
      simple.push([X(t), Y(85 * (1 - Math.exp(-t / 1.2)))]);
      ea.push([X(t), Y(100 * (1 - Math.exp(-t / 4)))]);
    }
    return svg(
      460,
      230,
      `${ln(50, 190, 440, 190, "var(--line-2)", 2)}${ln(50, 20, 50, 190, "var(--line-2)", 2)}
      ${path(simple, "var(--blue)")}${path(ea, "var(--amber)")}
      ${ln(X(4), 24, X(4), 190, "var(--rose)", 2, "6 5")}${tx(X(4), 16, "deadline", { c: "var(--rose-ink)", f: "800 12px" })}
      ${tx(X(10.2), Y(92) - 6, "EA", { c: "var(--amber-ink)" })}${tx(X(10.2), Y(85) + 22, "Simple method", { c: "var(--blue-ink)" })}
      ${tx(245, 220, "time spent searching", { f: "700 12px", c: "var(--text-faint)" })}
      <text transform="translate(16,105) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">quality of answer</text>`,
    );
  };
  const runsFig = () => {
    const vals = { A: 431, B: 412, C: 418, D: 409, E: 425 },
      Y = (v) => 200 - (v - 380) * 2.833;
    const bars = Object.entries(vals)
      .map(
        ([k, v], i) =>
          `<g data-pick="${k}"><rect x="${50 + i * 78}" y="${Y(v)}" width="52" height="${200 - Y(v)}" rx="6" fill="var(--blue)" opacity=".85" stroke="var(--blue-lip, var(--blue))" stroke-width="2"/>${tx(76 + i * 78, Y(v) - 6, v, { f: "800 13px" })}${tx(76 + i * 78, 218, "run " + k, { f: "700 12px", c: "var(--text-dim)" })}</g>`,
      )
      .join("");
    const ticks = [380, 400, 420, 440]
      .map(
        (v) =>
          `${ln(40, Y(v), 450, Y(v), "var(--line)", 1)}${tx(34, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" })}`,
      )
      .join("");
    return svg(
      460,
      258,
      `${ticks}${bars}${ln(40, Y(400), 450, Y(400), "var(--rose)", 3, "7 5")}${ln(20, 246, 60, 246, "var(--rose)", 3, "7 5")}${tx(68, 250, "proven lower bound: 400 km (axis starts at 380)", { a: "start", c: "var(--rose-ink)", f: "800 12px" })}`,
    );
  };

  B.add("l2-approx", [
    {
      type: "cat",
      q: "For each job, is an exact algorithm realistic, or is an approximate method the sensible choice?",
      buckets: ["Exact is realistic", "Approximate is sensible"],
      items: [
        ["Cheapest cabling that links 30 offices (a minimum spanning tree)", 0],
        ["Shortest road route between two towns on a map", 0],
        ["Choosing parcels for tonight's van from only 8 candidates (256 subsets)", 0],
        ["Timetabling 400 exams with clash rules, answer wanted in a minute", 1],
        ["Routing a drone past 300 sites, plan needed in two seconds", 1],
        ["Sizing 200 pipes with 16 diameters each to cut cost", 1],
      ],
      why: "Exact is realistic when a fast exact algorithm exists (spanning tree, shortest path) or the search space is tiny. When the space explodes and no fast exact method is known, an approximate method is the only practical option.",
    },
    {
      type: "mcq",
      q: "Two methods run on the same problem. The job must be finished by the dashed deadline. Which statement fits the graph?",
      fig: deadlineFig(),
      o: [
        "The simple method is ahead now, but the EA overtakes it if we can wait longer",
        "The EA is ahead now, and it keeps its lead however long we run",
        "The simple method is ahead now and keeps its lead however long we run",
        "They give the same quality at the deadline, so either choice is fine",
      ],
      a: 0,
      why: "At the deadline the simple method's curve is higher. The curves cross later, where the slower EA keeps improving while the simple method levels off. The right choice depends on the time budget.",
    },
    {
      type: "slider",
      q: "Checking every design of a pipe network takes 18 minutes when there are 10 pipes with 8 possible diameters each. Two more pipes are added. About how long does the exhaustive check take now?",
      min: 0,
      max: 60,
      step: 1,
      ans: 19,
      tol: 8,
      unit: "hours",
      hint: "Each extra pipe multiplies the designs by 8, so two more pipes multiply by 8 × 8 = 64. Then 18 minutes × 64 ≈ 1,150 minutes, and 1,150 ÷ 60 ≈ 19.",
      why: "Search space grows multiplicatively: ×64 for two pipes, so 18 min becomes about 19 hours. Three more pipes would be about 6 days. This is why exhaustive search runs out of road so quickly.",
    },
    {
      type: "bug",
      q: "This program is meant to report what an approximate (mutate-and-keep-if-better) search found. One line says something the method can never justify. Click it.",
      code: [
        "best = random_route()",
        "for step in range(100000):",
        "    m = mutate(copy(best))",
        "    if length(m) < length(best):",
        "        best = m",
        "print('Optimal route found:', best)",
      ],
      a: 5,
      why: "An approximate algorithm has no way to prove optimality. It can honestly say 'best route found' (and perhaps compare it with a lower bound), but not 'optimal'.",
    },
    {
      type: "pick",
      q: "Each bar is the route length (km) from one run of an EA. A proof shows that no route can be shorter than 400 km. Click every run that is guaranteed to be within 5% of the best possible route.",
      fig: runsFig(),
      a: ["B", "C", "D"],
      hint: "5% of 400 is 20. The best possible route is at least 400 km, so anything up to 420 km is guaranteed to be within 5% of it.",
      why: "The optimum is at least 400, so a run of 420 or less is at most 5% (20 km) above the optimum, whatever the true optimum is. Runs of 425 and 431 might still be fine, but the bound can't promise it.",
    },
    {
      type: "mcq",
      q: "Timing and quality of two unnamed methods on routing problems of growing size. Which reading of the table is sensible?",
      fig: `<table class="t"><tr><th></th><th>10 stops</th><th>20 stops</th><th>30 stops</th></tr><tr><th>Method X</th><td>0.01 s</td><td>11 s</td><td>3 hours</td></tr><tr><th>Method Y</th><td>0.1 s</td><td>0.2 s</td><td>0.3 s</td></tr><tr><th>X's route quality</th><td>best possible</td><td>best possible</td><td>best possible</td></tr><tr><th>Y's route quality</th><td>99% of best</td><td>96% of best</td><td>94% of best</td></tr></table>`,
      o: [
        "X looks exact (time explodes, always best); Y looks approximate (fast, quality slips)",
        "X looks approximate because it is slow; Y looks exact because it is quick",
        "Both look exact, because both always return a valid route",
        "Y looks exact because its time grows steadily; X is a weaker approximate method",
      ],
      a: 0,
      why: "Always-optimal answers whose time explodes with size are the signature of an exact method. Gentle time growth with slowly slipping quality is an approximate method trading quality for speed.",
    },
  ]);

  /* ======================================================================
     l3-recipe
     ====================================================================== */
  const popRowsFig = () => {
    const rows = [
      ["A", "10110", 3],
      ["B", "01001", 2],
      ["C", "11100", 3],
      ["D", "00001", 1],
      ["E", "00101", 2],
    ];
    return svg(
      460,
      250,
      `${tx(30, 24, "member", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(130, 24, "string", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(260, 24, "fitness (number of 1s)", { a: "start", c: "var(--text-faint)", f: "700 11px" })}
      ${rows.map(([k, s, f], i) => `<g data-pick="${k}"><rect x="14" y="${34 + i * 40}" width="432" height="34" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(36, 57 + i * 40, k, { a: "start", f: "900 15px" })}${tx(130, 57 + i * 40, s.split("").join(" "), { a: "start", f: "800 15px" })}${tx(260, 57 + i * 40, f + " ".repeat(0), { a: "start", f: "800 15px" })}<rect x="300" y="${44 + i * 40}" width="${f * 30}" height="14" rx="5" fill="var(--teal)"/></g>`).join("")}`,
    );
  };

  B.add("l3-recipe", [
    {
      type: "bug",
      q: "This steady-state EA maximises fitness, yet its population gets worse over time. Click the faulty line.",
      code: [
        "# fitness is to be maximised",
        "pop = [random_individual() for _ in range(20)]",
        "for step in range(2000):",
        "    parent = tournament(pop, size=2)",
        "    child = mutate(copy(parent))",
        "    weakest = max(pop, key=fitness)",
        "    if fitness(child) >= fitness(weakest):",
        "        pop.remove(weakest)",
        "        pop.append(child)",
      ],
      a: 5,
      why: "The 'weakest' member must be the one with the lowest fitness, so min(...). With max(...) the EA throws away its best member each time, and the population drifts downhill.",
    },
    {
      type: "order",
      q: "Put one generation of a generational EA in order.",
      items: [
        "Score every member of the population",
        "Select parents, with fitter ones more likely",
        "Recombine pairs of parents into children",
        "Mutate the children slightly",
        "The children replace the old population",
      ],
      why: "Selection needs scores first. Children are built from the selected parents and varied, and then the whole generation is swapped over at once. That all-at-once swap is what separates it from steady-state.",
    },
    {
      type: "cat",
      q: "You reuse an EA that solved OneMax (bit strings) for a travelling-salesperson problem (permutations of cities). Which parts must be redesigned, and which can stay?",
      buckets: ["Must be redesigned", "Can stay as it is"],
      items: [
        ["Bit-flip mutation", 0],
        ["1-point crossover on the raw string", 0],
        ["Fitness function (counting the 1s)", 0],
        ["Tournament selection (best of 2 by fitness)", 1],
        ["Replace-the-weakest rule", 1],
        ["Stop after 5,000 evaluations", 1],
      ],
      why: "Operators that touch the encoding (mutation, crossover) and the fitness function depend on the problem. Selection, replacement and termination only compare fitness numbers, so they are reusable.",
    },
    {
      type: "pick",
      q: "Fitness is to be maximised. A tournament of 2 picks A and B, and A wins. A mutated copy of A flips its last bit, giving the child 10111 (fitness 4). Replacement rule: the child replaces the weakest member if it is at least as good. Click the member that is removed.",
      fig: popRowsFig(),
      a: "D",
      why: "Replacement ignores who took part in the tournament. The weakest member is D (fitness 1), and the child (4) is at least as good, so D goes. B lost the tournament but is not the weakest overall.",
    },
    {
      type: "slider",
      q: "A generational EA has a population of 40 and scores every member once per generation. How many generations can it run on a budget of 2,000 fitness evaluations?",
      min: 0,
      max: 200,
      step: 5,
      ans: 50,
      tol: 10,
      unit: "generations",
      hint: "2,000 ÷ 40: think 200 ÷ 4 = 50.",
      why: "2,000 ÷ 40 = 50 generations. A steady-state EA spends one evaluation per child, so the same budget gives it 2,000 replacement steps. Same effort, a very different rhythm.",
    },
    {
      type: "multi",
      q: "Which changes push an EA to converge faster by favouring members that are already fit? Select all that apply.",
      o: [
        "Raise the tournament size from 2 to 6",
        "Always pick the single fittest member as parent",
        "Replace the weakest member rather than a random one",
        "Flip half the bits of every child at random",
        "Double the population and keep everything else the same",
      ],
      a: [0, 1, 2],
      why: "Bigger tournaments, always choosing the best, and replacing the weakest all increase selection pressure. Heavy mutation and a larger population do the opposite: they add exploration and slow convergence.",
    },
  ]);

  /* ======================================================================
     l3-tsp
     ====================================================================== */
  const PENT = { A: [230, 30], B: [400, 120], C: [340, 235], D: [120, 235], E: [60, 120] };
  const DG = {
    A: { B: 8, C: 3, D: 6, E: 1 },
    B: { A: 8, C: 8, D: 7, E: 5 },
    C: { A: 3, B: 8, D: 2, E: 8 },
    D: { A: 6, B: 7, C: 2, E: 3 },
    E: { A: 1, B: 5, C: 8, D: 3 },
  };

  B.add("l3-tsp", [
    {
      type: "multi",
      q: "The map shows a round trip over five cities. Select every string that describes this same loop.",
      fig: NIC.qfig.graph(
        PENT,
        [
          ["A", "C"],
          ["C", "E"],
          ["E", "B"],
          ["B", "D"],
          ["D", "A"],
        ],
        { w: 460, h: 262 },
      ),
      o: ["CEBDA", "ADBEC", "DACEB", "ACBED", "ADCEB"],
      a: [0, 1, 2],
      hint: "Read the loop as A, C, E, B, D, back to A. A string is the same loop if it uses exactly the same set of hops.",
      why: "CEBDA starts elsewhere on the same loop, ADBEC drives it backwards, and DACEB is another start. ACBED uses the hops C–B and E–D, which are not on the map, and ADCEB uses D–C and B–A, which are not either.",
    },
    {
      type: "mcq",
      q: "A solver can check one million tours per second. The table gives the number of distinct tours for each size. What is the largest number of cities it can check exhaustively in one minute?",
      fig: `<table class="t"><tr><th>cities</th><th>10</th><th>11</th><th>12</th><th>13</th><th>14</th></tr><tr><th>distinct tours</th><td>181,440</td><td>1,814,400</td><td>19,958,400</td><td>239,500,800</td><td>3,113,510,400</td></tr></table>`,
      o: ["11 cities", "12 cities", "13 cities", "14 cities"],
      a: 1,
      hint: "One minute at a million per second is 60 million tours. Find the biggest row that is still below 60 million.",
      why: "In one minute it checks 60 million tours. 12 cities need about 20 million, which fits. 13 cities need about 240 million, which is four times too many. Each extra city multiplies the work by roughly the number of cities.",
    },
    {
      type: "mcq",
      q: "A courier starts at A and always drives to the nearest city not yet visited, finally returning to A. Using this distance table, what happens?",
      fig: mat(["A", "B", "C", "D", "E"], DG),
      o: [
        "It drives AEDCB for 22 km, but a tour of 18 km exists",
        "It drives AEDCB for 22 km, which is the shortest possible tour",
        "It drives ACDEB for 21 km, which is the shortest tour",
        "It drives AEDCB for 18 km, which is the shortest tour",
      ],
      a: 0,
      hint: "From A the nearest city is E (1). From E the nearest unvisited is D (3). Keep going, then add the way home. For the shorter tour, try A, C, D, B, E.",
      why: "Greedy goes A→E (1), E→D (3), D→C (2), C→B (8), B→A (8) = 22. The tour ACDBE is 3 + 2 + 7 + 5 + 1 = 18. Grabbing the cheapest hop early can force expensive hops later.",
    },
    {
      type: "bug",
      q: "This function should return the length of a round trip, but it undercounts every tour. Click the faulty line.",
      code: [
        "def tour_length(t, D):",
        "    total = 0",
        "    for i in range(len(t) - 1):",
        "        total += D[t[i]][t[i + 1]]",
        "    return total",
      ],
      a: 2,
      hint: "Count the hops of a 5-city tour. How many does this loop add up, and how many does the round trip have?",
      why: "range(len(t) - 1) adds only n − 1 hops, so the road home from the last city back to the first is missing. A round trip has n hops, so the loop needs to cover the wrap-around too, for example with t[(i + 1) % len(t)].",
    },
    {
      type: "multi",
      q: "A tour is stored as a permutation of the cities. Which mutations always give back a valid tour? Select all that apply.",
      o: [
        "Swap two chosen cities",
        "Reverse a chosen stretch of the tour",
        "Replace one city by a random other city",
        "Delete one random city",
        "Move one city to a different position",
      ],
      a: [0, 1, 4],
      why: "Swapping, reversing a stretch and moving a city only rearrange the cities, so each one still appears exactly once. Replacing a city creates a duplicate and deleting one leaves the tour with a city missing.",
    },
  ]);

  /* ======================================================================
     l3-hc
     ====================================================================== */
  const hcBarsFig = () => {
    const V = [2, 5, 3, 4, 6, 8, 7, 9, 10, 6];
    return svg(
      460,
      238,
      `${ln(10, 196, 450, 196, "var(--line-2)", 2)}
      ${V.map((v, i) => `<g data-pick="b${i}"><rect x="${16 + i * 44}" y="${196 - v * 16}" width="36" height="${v * 16}" rx="6" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(34 + i * 44, 196 - v * 16 - 6, v, { f: "800 13px" })}</g>`).join("")}
      ${tx(34 + 2 * 44, 222, "▲ start", { c: "var(--rose-ink)", f: "800 13px" })}`,
    );
  };
  const restartFig = () => {
    const V = [48, 41, 47, 41, 44, 41];
    return svg(
      460,
      232,
      `${ln(30, 196, 450, 196, "var(--line-2)", 2)}${V.map((v, i) => `<rect x="${44 + i * 66}" y="${196 - v * 3.4}" width="46" height="${v * 3.4}" rx="6" fill="${v === 41 ? "var(--teal)" : "var(--blue)"}" opacity=".9"/>${tx(67 + i * 66, 196 - v * 3.4 - 6, v)}${tx(67 + i * 66, 216, "run " + (i + 1), { f: "700 12px", c: "var(--text-dim)" })}`).join("")}${tx(8, 14, "final tour length (km) of each restart", { a: "start", f: "700 12px", c: "var(--text-faint)" })}`,
    );
  };

  B.add("l3-hc", [
    {
      type: "pick",
      q: "Each bar is a solution and its fitness (higher is better). A hillclimber starts at the marked bar. A mutation moves it one bar left or right, chosen at random, and it accepts the move if the new bar is not lower. Click every bar where it could finally get stuck.",
      fig: hcBarsFig(),
      a: ["b1", "b5"],
      why: "From the start (3) it can step left to 5, where both neighbours are lower, so it stops. Or it steps right to 4, then 6, then 8, where both neighbours (6 and 7) are lower, so it stops. It can never cross the dip of 7 to reach the 10, so the global optimum is out of reach.",
    },
    {
      type: "bug",
      q: "This hillclimber minimises tour length, but its tours keep getting longer. Click the faulty line.",
      code: [
        "c = random_tour()",
        "for step in range(5000):",
        "    m = c",
        "    swap_random_neighbours(m)",
        "    if length(m) <= length(c):",
        "        c = m",
      ],
      a: 2,
      hint: "After line 3, is c still the old tour?",
      why: "m = c gives a second name for the same tour, not a copy. The swap changes c itself, so length(m) <= length(c) is always true and every random swap is kept. It needs m = c.copy() (or list(c)).",
    },
    {
      type: "mcq",
      q: "A hillclimber minimises tour length and accepts a mutant that is no longer than the current tour. It starts at 34 km, and the seven mutants it generates are 36, 34, 31, 35, 31, 29 and 33 km in that order. How many mutants does it accept?",
      fig: `<table class="t"><tr><th>step</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr><tr><th>mutant (km)</th><td>36</td><td>34</td><td>31</td><td>35</td><td>31</td><td>29</td><td>33</td></tr></table>`,
      o: ["2", "3", "4", "7"],
      a: 2,
      hint: "Keep a running 'current': 34, then compare each mutant with it.",
      why: "Current 34: 36 no; 34 yes (equal); 31 yes; 35 no; 31 yes (equal); 29 yes; 33 no. That is four accepted, ending at 29. Counting only strict improvements would give two, but equal moves are accepted.",
    },
    {
      type: "mcq",
      q: "A hillclimber was restarted six times from random tours. The chart shows where each run ended. What is the sensible conclusion?",
      fig: restartFig(),
      o: [
        "41 is the best found and keeps recurring, but a shorter tour could still exist",
        "41 is certainly optimal, because three separate runs agreed on it",
        "Runs that agree show that the search is broken, so none can be trusted",
        "The best tour is the average of all six runs, about 44 km",
      ],
      a: 0,
      why: "Repeated restarts sample different hills. Reaching 41 three times suggests a wide, attractive hill, but nothing proves a narrow, better one was not missed. Keep the best result, not an average.",
    },
    {
      type: "slider",
      q: "The hill that leads to the global optimum covers one fifth of all starting points. A hillclimber is restarted five times from random starts. What is the chance that at least one run climbs the right hill?",
      min: 0,
      max: 100,
      step: 5,
      ans: 67,
      tol: 10,
      unit: "%",
      hint: "Chance that every run misses is 0.8 each time: 0.8 × 0.8 = 0.64; × 0.8 ≈ 0.51; × 0.8 ≈ 0.41; × 0.8 ≈ 0.33. So the chance of at least one hit is about 1 − 0.33.",
      why: "All five runs miss with probability 0.8⁵ ≈ 0.33, so at least one hit has probability about 0.67. Restarts help a lot, but they are not a guarantee.",
    },
  ]);

  /* ======================================================================
     l3-landscape
     ====================================================================== */
  const decFn = (x) => 0.55 * Math.exp(-(((x - 0.25) / 0.14) ** 2)) + 1.0 * Math.exp(-(((x - 0.8) / 0.06) ** 2)) + 0.05;
  const deceptiveFig = () => {
    const X = (x) => 16 + x * 528,
      Y = (v) => 168 - v * 130;
    const d = Array.from(
      { length: 201 },
      (_, i) => `${i ? "L" : "M"}${X(i / 200).toFixed(1)} ${Y(decFn(i / 200)).toFixed(1)}`,
    ).join(" ");
    const starts = [
      [0.12, "1"],
      [0.3, "2"],
      [0.42, "3"],
      [0.72, "4"],
      [0.9, "5"],
    ];
    return svg(
      560,
      212,
      `<path d="${d} L${X(1)} 168 L${X(0)} 168 Z" fill="var(--teal-dim)"/><path d="${d}" fill="none" stroke="var(--teal)" stroke-width="3"/>
      ${starts.map(([x, id]) => `<g data-pick="${id}"><circle cx="${X(x)}" cy="${Y(decFn(x))}" r="13" fill="var(--panel)" stroke="var(--rose)" stroke-width="3"/>${tx(X(x), Y(decFn(x)) + 5, id, { f: "900 12px", c: "var(--ink)" })}</g>`).join("")}
      ${tx(280, 200, "position in the search space", { f: "700 11px", c: "var(--text-faint)" })}`,
    );
  };
  const traceFig = () => {
    const X = (s) => 44 + s * 4,
      Y = (v) => 180 - v * 1.6,
      A = [],
      Bp = [],
      r = rng(5);
    let b = 15;
    for (let s = 0; s <= 100; s += 2) {
      A.push([X(s), Y(Math.min(72, 15 + 57 * (1 - Math.exp(-s / 7))))]);
      if (s % 6 === 0 && r() < 0.55) b += 1 + Math.floor(r() * 5);
      Bp.push([X(s), Y(Math.min(b, 46))]);
    }
    return svg(
      480,
      222,
      `${ln(44, 180, 450, 180, "var(--line-2)", 2)}${ln(44, 20, 44, 180, "var(--line-2)", 2)}${path(A, "var(--blue)")}${path(Bp, "var(--amber)")}
      ${tx(X(100) + 14, A[A.length - 1][1] + 4, "A", { c: "var(--blue-ink)", f: "900 15px" })}${tx(X(100) + 14, Bp[Bp.length - 1][1] + 4, "B", { c: "var(--amber-ink)", f: "900 15px" })}
      ${tx(247, 210, "evaluations used", { f: "700 12px", c: "var(--text-faint)" })}<text transform="translate(14,100) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">best fitness so far</text>`,
    );
  };
  const cubeFig = () => {
    const F = { "000": 1, "001": 4, "010": 2, "011": 3, 100: 5, 101: 2, 110: 6, 111: 3 };
    const P = (s) => {
      const [a, b, c] = s.split("").map(Number);
      return [70 + 170 * c + 120 * a, 245 - 120 * b - 80 * a];
    };
    const keys = Object.keys(F),
      edges = [];
    keys.forEach((u) =>
      keys.forEach((v) => {
        if (u < v && [...u].filter((ch, i) => ch !== v[i]).length === 1) edges.push([u, v]);
      }),
    );
    return svg(
      440,
      290,
      `${edges.map(([u, v]) => ln(...P(u), ...P(v), "var(--line-2)", 3)).join("")}
      ${keys
        .map((k) => {
          const [x, y] = P(k);
          return `<g data-pick="${k}"><circle cx="${x}" cy="${y}" r="26" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(x, y - 3, k, { f: "800 12px", c: "var(--text-dim)" })}${tx(x, y + 13, "f = " + F[k], { f: "900 13px", c: "var(--ink)" })}</g>`;
        })
        .join("")}`,
    );
  };

  B.add("l3-landscape", [
    {
      type: "pick",
      q: "A hillclimber that only takes small steps uphill is started at each numbered dot in turn. Click every start from which it ends on the tallest peak.",
      fig: deceptiveFig(),
      a: ["4", "5"],
      why: "Starts 1, 2 and 3 slope up to the broad, lower hill on the left. Only starts 4 and 5 lie on the narrow tall peak's slopes. The tallest peak has a tiny basin, so most random starts (and the obvious uphill direction) lead away from it. That is a deceptive landscape.",
    },
    {
      type: "mcq",
      q: "Run A and Run B tackle the same landscape with the same evaluation budget. One uses small local mutations, the other a mutation that jumps to anywhere. Which reading of the chart is best?",
      fig: traceFig(),
      o: [
        "A uses small steps and gets stuck on a peak; B uses random jumps and gains slowly",
        "A uses random jumps, because it improves faster; B uses small steps and is slower",
        "A uses small steps, and its flat finish shows it has reached the global optimum",
        "Both use small steps, and B simply started on a much worse hill than A did",
      ],
      a: 0,
      why: "Small steps exploit local smoothness, so progress is quick, but it ends on the first peak it reaches (the flat line). A random jump is like random sampling: most jumps land somewhere poor, so best-so-far creeps up slowly, though it never gets trapped.",
    },
    {
      type: "bug",
      q: "A student tunes a number x in [0, 100] with a hillclimber, but it climbs no better than random guessing. Click the faulty line.",
      code: [
        "x = random.uniform(0, 100)",
        "for step in range(500):",
        "    m = random.uniform(0, 100)",
        "    if f(m) >= f(x):",
        "        x = m",
        "return x",
      ],
      a: 2,
      why: "A mutant should be a small change to x, for example x plus a small random amount. Line 3 picks a fresh random position anywhere, which throws away the smoothness of the landscape: the climber is just sampling at random and keeping the best.",
    },
    {
      type: "pick",
      q: "Each corner is a 3-bit solution with its fitness (higher is better). A mutation flips one bit, so neighbours are joined by a line. Click every local optimum.",
      fig: cubeFig(),
      a: ["001", "110"],
      hint: "For each corner check its three neighbours (the corners it is joined to). A local optimum has no neighbour with a higher f.",
      why: "001 (f = 4) has neighbours 000 (1), 011 (3) and 101 (2). 110 (f = 6) has neighbours 111 (3), 100 (5) and 010 (2). Everything else has a higher neighbour. 110 is the global optimum and 001 is a local trap.",
    },
    {
      type: "slider",
      q: "A mutation jumps uniformly to anywhere in the search space. Only 2% of all solutions are good. About how many jumps do you expect before one lands on a good solution?",
      min: 0,
      max: 200,
      step: 5,
      ans: 50,
      tol: 20,
      unit: "jumps",
      hint: "Two in every hundred is one in fifty.",
      why: "A 2% chance per jump means about 1 in 50 on average: roughly 50 jumps. In real problems the good region is often far smaller than 2%, which is why uncontrolled random jumps are such a poor mutation.",
    },
  ]);

  /* ======================================================================
     l3-neighbourhood
     ====================================================================== */
  const nbGraphFig = () => {
    const N = { P: 3, Q: 5, R: 4, S: 7, T: 6, U: 2, V: 8 },
      ks = Object.keys(N),
      X = (i) => 40 + i * 63,
      Y = 120;
    const solid = ks
      .slice(0, -1)
      .map((k, i) => ln(X(i), Y, X(i + 1), Y, "var(--line-2)", 3))
      .join("");
    const dash = `<path d="M${X(1)} ${Y - 22} Q${(X(1) + X(3)) / 2} ${Y - 84} ${X(3)} ${Y - 22}" fill="none" stroke="var(--violet)" stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round"/>`;
    const nodes = ks
      .map(
        (k, i) =>
          `<g data-pick="${k}"><circle cx="${X(i)}" cy="${Y}" r="22" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(X(i), Y + 5, k, { f: "900 15px", c: "var(--ink)" })}${tx(X(i), Y + 44, "f = " + N[k], { f: "800 13px", c: "var(--text-dim)" })}</g>`,
      )
      .join("");
    return svg(
      460,
      190,
      `${solid}${dash}${nodes}${tx(X(2), 24, "new move", { c: "var(--violet-ink)", f: "800 12px" })}`,
    );
  };
  const gridFig = () => {
    const G = [
      [3, 4, 2, 1],
      [5, 6, 3, 4],
      [2, 3, 7, 5],
      [1, 4, 6, 8],
    ];
    return svg(
      340,
      300,
      G.map((row, r) =>
        row
          .map(
            (v, c) =>
              `<g data-pick="r${r}c${c}"><rect x="${20 + c * 76}" y="${10 + r * 70}" width="68" height="62" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(54 + c * 76, 48 + r * 70, v, { f: "900 20px", c: "var(--ink)" })}</g>`,
          )
          .join(""),
      ).join(""),
    );
  };

  B.add("l3-neighbourhood", [
    {
      type: "pick",
      q: "Seven solutions are linked by the moves of a mutation operator (solid lines); higher f is better. The purple dashed link is an extra move allowed by a new operator. Click every local optimum once both solid and dashed moves are allowed.",
      fig: nbGraphFig(),
      a: ["S", "V"],
      why: "With the solid moves alone Q (5), S (7) and V (8) are local optima. The new move lets Q step to S (7), so Q stops being a local optimum. S and V still have no better neighbour. Changing the operator changed which solutions are traps.",
    },
    {
      type: "cat",
      q: "How does the neighbourhood size grow as the solution gets longer (n bits or n cities)?",
      buckets: ["Constant", "About n", "About n²", "Exponential (about 2ⁿ)"],
      items: [
        ["Flip only the first bit of an n-bit string", 0],
        ["Flip any one bit of an n-bit string", 1],
        ["Swap two adjacent cities in an n-city tour (with wrap-around)", 1],
        ["Swap any two cities in an n-city tour", 2],
        ["Flip any two bits of an n-bit string", 2],
        ["Replace the string with any other n-bit string", 3],
      ],
      why: "One choice among n positions gives about n neighbours. Choosing a pair of positions gives about n²/2. 'Any other string' means all 2ⁿ − 1 other strings. A fixed rule such as 'only the first bit' always gives one neighbour.",
    },
    {
      type: "bug",
      q: "This function should say whether s is a local optimum when minimising cost. It sometimes says True for a tour that has a better neighbour. Click the faulty line.",
      code: [
        "def is_local_optimum(s):",
        "    for m in neighbours(s):",
        "        if cost(m) < cost(s):",
        "            return False",
        "        else:",
        "            return True",
        "    return True",
      ],
      a: 5,
      why: "Returning True inside the loop ends the check after the first neighbour. The answer must be True only after every neighbour has been looked at and none was better, so that return belongs after the loop.",
    },
    {
      type: "pick",
      q: "The current tour is ABCDE. A mutation swaps the neighbours B and C, and the new tour ACBDE is drawn. Click the hops in the new tour that were not in ABCDE.",
      fig: NIC.qfig.graph(
        PENT,
        [
          ["A", "C"],
          ["C", "B"],
          ["B", "D"],
          ["D", "E"],
          ["E", "A"],
        ],
        { pick: "edges", w: 460, h: 262 },
      ),
      a: ["A-C", "B-D"],
      hint: "ABCDE has the hops A–B, B–C, C–D, D–E and E–A. Compare with the five hops drawn.",
      why: "A–C and B–D are new. C–B is the old hop B–C driven backwards, and D–E and E–A are unchanged. Only two hops differ, so a neighbour's length can be found by adjusting two terms rather than adding up the whole tour.",
    },
    {
      type: "pick",
      q: "The grid shows the fitness (higher is better) for two settings dials. A move changes one dial by one notch: up, down, left or right. Click every cell that is a local optimum with those four moves but would stop being one if diagonal moves were also allowed.",
      fig: gridFig(),
      a: ["r1c1", "r2c2"],
      hint: "For each cell look at all eight surrounding cells. Which cells have a higher diagonal neighbour?",
      why: "The 6 at row 2, column 2 has all four straight neighbours lower, but the 7 sits diagonally. The 7 is likewise beaten diagonally by the 8. The 8 is still best, so it stays a local optimum. More allowed moves means fewer local optima.",
    },
  ]);

  /* ======================================================================
     l3-local
     ====================================================================== */
  const tabuFig = () => {
    const C = [8, 6, 4, 5, 7, 3, 5],
      X = (i) => 40 + i * 63,
      Y = 120;
    return svg(
      460,
      190,
      `${C.slice(0, -1)
        .map((_, i) => ln(X(i), Y, X(i + 1), Y, "var(--line-2)", 3))
        .join("")}
      ${C.map((c, i) => `<g data-pick="n${i + 1}"><circle cx="${X(i)}" cy="${Y}" r="22" fill="var(--panel)" stroke="${i === 2 ? "var(--rose)" : "var(--line-2)"}" stroke-width="3"/>${tx(X(i), Y + 5, i + 1, { f: "900 15px", c: "var(--ink)" })}${tx(X(i), Y + 44, "cost " + c, { f: "800 12px", c: "var(--text-dim)" })}</g>`).join("")}${tx(X(2), Y - 36, "start", { c: "var(--rose-ink)", f: "800 13px" })}`,
    );
  };
  const mcTraces = () => {
    const cost = (x) => Math.abs(x - 70) * 0.6 + 7 * Math.sin(x / 3.2) + 10;
    const sim = (p, seed) => {
      const r = rng(seed);
      let x = 30;
      const out = [cost(x)];
      for (let i = 0; i < 90; i++) {
        const m = Math.max(0, Math.min(100, x + (r() < 0.5 ? -1 : 1) * (1 + Math.floor(r() * 5))));
        if (cost(m) <= cost(x) || r() < p) x = m;
        out.push(cost(x));
      }
      return out;
    };
    const runs = [
      ["A", sim(1, 42)],
      ["B", sim(0, 42)],
      ["C", sim(0.1, 42)],
    ];
    const lo = Math.min(...runs.flatMap((r) => r[1])),
      hi = Math.max(...runs.flatMap((r) => r[1]));
    return svg(
      480,
      200,
      runs
        .map(([nm, d], k) => {
          const x0 = 14 + k * 156,
            X = (i) => x0 + 22 + (i / 90) * 120,
            Y = (v) => 150 - ((v - lo) / (hi - lo)) * 110;
          return `${ln(x0 + 22, 150, x0 + 142, 150, "var(--line-2)", 2)}${ln(x0 + 22, 30, x0 + 22, 150, "var(--line-2)", 2)}${path(
            d.map((v, i) => [X(i), Y(v)]),
            "var(--blue)",
            2.5,
          )}${tx(x0 + 82, 22, "Run " + nm, { f: "900 14px" })}${tx(x0 + 82, 172, "steps", { f: "700 11px", c: "var(--text-faint)" })}`;
        })
        .join("") +
        `<text transform="translate(8,95) rotate(-90)" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">current cost</text>`,
    );
  };
  const logFig = () => {
    const R = [
      [1, 12, 10, "yes"],
      [2, 10, 13, "no"],
      [3, 10, 11, "yes"],
      [4, 11, 11, "yes"],
      [5, 11, 9, "yes"],
      [6, 9, 14, "yes"],
    ];
    const cols = [40, 140, 260, 380];
    return svg(
      460,
      270,
      ["step", "current cost", "candidate cost", "moved?"]
        .map((h, i) => tx(cols[i], 20, h, { f: "700 11px", c: "var(--text-faint)" }))
        .join("") +
        R.map(
          (r, i) =>
            `<g data-pick="s${r[0]}"><rect x="10" y="${30 + i * 39}" width="440" height="34" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${r.map((v, j) => tx(cols[j], 53 + i * 39, v, { f: "900 15px", c: "var(--ink)" })).join("")}</g>`,
        ).join(""),
    );
  };

  B.add("l3-local", [
    {
      type: "pick",
      q: "Cost is to be minimised. Tabu search starts at solution 3, always moves to the cheapest neighbour that is not tabu (even if that costs more), and the tabu list holds the last two solutions it left. Click the solution it is on after three moves.",
      fig: tabuFig(),
      a: "n6",
      hint: "Move 1: from 3, the neighbours cost 6 and 5, so go to 4 (cost 5); 3 is now tabu. Move 2: from 4 the neighbours are 3 (tabu) and 5. Move 3: from 5, which neighbours are tabu?",
      why: "3 → 4 (cost 5), then 4 → 5 (cost 7, since 3 is tabu), then 5 → 6 (cost 3, since 4 is tabu). The tabu list forces it up and over the bump, which a plain hillclimber stuck at 3 could never do.",
    },
    {
      type: "match",
      q: "Three runs of Monte Carlo search start from the same solution. They accept a worse neighbour with probability p = 0, p = 0.1 or p = 1. Match each run to its setting.",
      fig: mcTraces(),
      pairs: [
        ["Run A", "p = 1"],
        ["Run B", "p = 0"],
        ["Run C", "p = 0.1"],
      ],
      why: "With p = 0 the cost never rises and the run freezes in the first valley it finds (flat). With p = 1 every move is accepted, so the cost just jitters about with no trend. A small p mostly goes down, but now and then climbs out of a valley to keep exploring.",
    },
    {
      type: "bug",
      q: "This tabu search keeps bouncing back and forth between the same two solutions. Click the faulty line.",
      code: [
        "tabu = []",
        "cur = start",
        "for step in range(steps):",
        "    cands = [m for m in neighbours(cur) if m not in tabu]",
        "    nxt = min(cands, key=cost)",
        "    cur = nxt",
        "    tabu.append(nxt)",
        "    tabu = tabu[-5:]",
      ],
      a: 6,
      why: "The tabu list should hold the places it has just left, so that it can't step straight back. Appending nxt (where it now stands) never blocks the way back. It should append the old solution before cur is changed.",
    },
    {
      type: "pick",
      q: "This log comes from a local-search run that minimises cost. Click every row that proves the run was not plain hillclimbing (which never accepts a worse candidate).",
      fig: logFig(),
      a: ["s3", "s6"],
      why: "In row 3 and row 6 the candidate cost is higher than the current cost, yet it moved. A hillclimber refuses those. Row 4 only moves to an equal cost, which hillclimbing allows, and row 2 refuses a worse one.",
    },
    {
      type: "order",
      q: "Put one step of tabu search in order.",
      items: [
        "List all neighbours of the current solution",
        "Remove the ones on the tabu list",
        "Move to the best of the rest, even if it is worse",
        "Add the solution just left to the tabu list (dropping the oldest)",
        "Update best-so-far if the new solution beats it",
      ],
      why: "Neighbours come first, then tabu ones are filtered out and the best of the remainder is taken. The solution left behind becomes tabu, and the best-so-far record is separate from where the search stands.",
    },
  ]);

  /* ======================================================================
     l3-population
     ====================================================================== */
  const cutFig = () => {
    const P1 = "11110000",
      P2 = "00001111",
      cell = (s, row, y) =>
        s
          .split("")
          .map(
            (b, i) =>
              `<rect x="${110 + i * 40}" y="${y}" width="36" height="36" rx="8" fill="${b === "1" ? "var(--teal)" : "var(--panel)"}" stroke="var(--line-2)" stroke-width="2"/>${tx(128 + i * 40, y + 24, b, { f: "900 16px", c: b === "1" ? "#fff" : "var(--text)" })}`,
          )
          .join("") +
        tx(100, y + 24, row, { a: "end", f: "800 13px" }) +
        tx(444, y + 24, "4 ones", { a: "start", f: "800 12px", c: "var(--text-dim)" });
    const cuts = [1, 2, 3, 4, 5, 6, 7]
      .map(
        (k) =>
          `<g data-pick="c${k}"><rect x="${110 + k * 40 - 22}" y="22" width="24" height="118" fill="transparent"/>${ln(110 + k * 40 - 2, 28, 110 + k * 40 - 2, 134, "var(--violet)", 3, "5 5")}${tx(110 + k * 40 - 2, 158, "cut " + k, { f: "800 11px", c: "var(--violet-ink)" })}</g>`,
      )
      .join("");
    return svg(500, 170, `${cell(P1, "Parent 1", 30)}${cell(P2, "Parent 2", 84)}${cuts}`);
  };
  const runCharts = () => {
    const runs = [
      ["Run 1", (g) => 30 + 30 * (1 - Math.exp(-g / 2.5)), (g) => 100 * Math.exp(-g / 3)],
      [
        "Run 2",
        (g) => 30 + 4 * (1 - Math.exp(-g / 10)) + 1.5 * Math.sin(g * 1.3),
        (g) => 95 - 0.1 * g + 2 * Math.sin(g * 0.9),
      ],
      ["Run 3", (g) => 30 + 62 * (1 - Math.exp(-g / 16)), (g) => 100 * Math.exp(-g / 45)],
    ];
    return svg(
      480,
      214,
      runs
        .map(([nm, bf, df], k) => {
          const x0 = 14 + k * 156,
            X = (g) => x0 + 22 + (g / 50) * 120,
            Y = (v) => 150 - v * 1.1,
            b = [],
            d = [];
          for (let g = 0; g <= 50; g++) {
            b.push([X(g), Y(bf(g))]);
            d.push([X(g), Y(df(g))]);
          }
          return `${ln(x0 + 22, 150, x0 + 142, 150, "var(--line-2)", 2)}${ln(x0 + 22, 38, x0 + 22, 150, "var(--line-2)", 2)}${path(b, "var(--teal)", 3)}${path(d, "var(--amber)", 3, "6 4")}${tx(x0 + 82, 24, nm, { f: "900 14px" })}${tx(x0 + 82, 172, "generation", { f: "700 11px", c: "var(--text-faint)" })}`;
        })
        .join("") +
        `${tx(240, 204, "solid green = best fitness, dashed orange = diversity (how different the members are)", { f: "700 11px", c: "var(--text-dim)" })}`,
    );
  };

  B.add("l3-population", [
    {
      type: "pick",
      q: "Fitness is the number of 1s (8 is the maximum). Each parent scores 4. A child takes the first k bits from Parent 1 and the rest from Parent 2. Click the cut that gives the best child.",
      fig: cutFig(),
      a: "c4",
      why: "Cutting after bit 4 joins Parent 1's four 1s (left half) to Parent 2's four 1s (right half), giving 11111111 with fitness 8. Each parent holds a different good half, which is exactly what recombination can combine and mutation alone could not do in one step.",
    },
    {
      type: "cat",
      q: "OneMax fitness is the number of 1s. Look at each population of four strings. Is it converged in genes, converged only in fitness, or not converged?",
      buckets: ["Not converged", "Same fitness, different genes", "Identical genes"],
      items: [
        ["10000, 11100, 01111, 11001", 0],
        ["11111, 01110, 10001, 00011", 0],
        ["10110, 01101, 11010, 01011", 1],
        ["01100, 10010, 00101, 11000", 1],
        ["11100, 11100, 11100, 11100", 2],
        ["00111, 00111, 00111, 00111", 2],
      ],
      hint: "Count the 1s in each string first. Then ask whether the strings are the same.",
      why: "The first two sets have a mix of scores (1, 3, 4, 3 and 5, 3, 2, 2). In the next two every string has three or two 1s, but the strings differ, so only the fitness has converged. In the last two the genes are identical, which also means the same fitness.",
    },
    {
      type: "match",
      q: "Each chart tracks one EA run: best fitness (solid green) and diversity (dashed orange). Match each run to its diagnosis.",
      fig: runCharts(),
      pairs: [
        ["Run 1", "Premature convergence"],
        ["Run 2", "Almost no selection pressure"],
        ["Run 3", "Healthy progress"],
      ],
      why: "Run 1: diversity collapses within a few generations and the best fitness freezes well below the top, so the population has converged too soon. Run 2: diversity stays high but nothing improves, so selection is not favouring the fit. Run 3: fitness climbs while diversity fades slowly.",
    },
    {
      type: "order",
      q: "Put the usual story of a population converging in order.",
      items: [
        "A random, varied population is created",
        "Selection favours the fitter members",
        "Copies of good solutions spread through the population",
        "Members end up with the same genes",
        "Crossover of identical parents makes nothing new, so progress now relies on mutation",
      ],
      why: "Selection spreads good solutions, which reduces diversity. Once members are alike, crossover just reproduces them. Some convergence is progress, but too much too early leaves only mutation to explore.",
    },
    {
      type: "bug",
      q: "This EA is meant to combine two different parents, but its children never contain anything new from recombination. Click the faulty line.",
      code: [
        "p1 = tournament(pop, size=2)",
        "p2 = tournament(pop, size=2)",
        "child = crossover(p1, p1)",
        "child = mutate(child)",
        "replace_weakest(pop, child)",
      ],
      a: 2,
      why: "crossover(p1, p1) mixes a parent with itself, so the child is just a copy of p1 before mutation. It should be crossover(p1, p2) so that material from two different solutions is combined.",
    },
  ]);
})();

/* ===== bank-v-nic-3.js ===== */
/* NIC revision bank, visual and varied questions, part 3.
   Lecture 4 (selection, replacement, mutation, crossover, the lab). Every figure is needed to answer. */
(function () {
  const B = NIC.bank;
  const txt = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;

  /* Bar chart. vals: numbers; ids: data-pick ids (optional); labels under bars; line: {y, label} horizontal marker. */
  function bars(
    vals,
    {
      ids = null,
      labels = null,
      max = null,
      w = 520,
      h = 210,
      line = null,
      colors = null,
      show = true,
      inside = false,
      fmt = (v) => v,
    } = {},
  ) {
    const m = max || Math.max(...vals) * 1.1,
      n = vals.length,
      bw = Math.min(54, (w - 40) / n - 12),
      gap = (w - 40) / n;
    const Y = (v) => h - 34 - (v / m) * (h - 66);
    const body = vals
      .map((v, i) => {
        const x = 20 + gap * i + (gap - bw) / 2;
        const r = `<rect x="${x}" y="${Y(v)}" width="${bw}" height="${h - 34 - Y(v)}" rx="6" fill="${colors ? colors[i] : "var(--blue)"}" stroke="var(--line-2)" stroke-width="2" fill-opacity=".85"/>`;
        const val = show
          ? inside
            ? txt(x + bw / 2, h - 44, fmt(v), { s: 12, c: "#fff" })
            : txt(x + bw / 2, Y(v) - 6, fmt(v), { s: 12 })
          : "";
        const lab = labels ? txt(x + bw / 2, h - 14, labels[i]) : "";
        return ids ? `<g data-pick="${ids[i]}">${r}${val}${lab}</g>` : `<g>${r}${val}${lab}</g>`;
      })
      .join("");
    const ln = line
      ? `<line x1="14" x2="${w - 10}" y1="${Y(line.y)}" y2="${Y(line.y)}" stroke="var(--rose)" stroke-width="3" stroke-dasharray="7 5"/>${txt(w - 12, Y(line.y) - 6, line.label, { a: "end", c: "var(--rose-ink)" })}`
      : "";
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="14" x2="${w - 10}" y1="${h - 34}" y2="${h - 34}" stroke="var(--line-2)" stroke-width="2"/>${body}${ln}</svg>`;
  }

  /* A row of genes. cells: [text, colour]. */
  function strip(cells, x, y, { cw = 34, ch = 34 } = {}) {
    return cells
      .map(
        (c, i) =>
          `<rect x="${x + i * cw}" y="${y}" width="${cw - 3}" height="${ch}" rx="6" fill="${c[1] || "var(--panel)"}" stroke="var(--line-2)" stroke-width="2"/>${txt(x + i * cw + (cw - 3) / 2, y + ch / 2 + 5, c[0], { c: c[2] || "var(--text)" })}`,
      )
      .join("");
  }

  /* Pie wheel. vals, labels; ids optional (pick). */
  function pie(vals, labels, cx, cy, r, ids, cols) {
    const tot = vals.reduce((a, b) => a + b, 0);
    let a0 = -Math.PI / 2;
    return vals
      .map((v, i) => {
        const a1 = a0 + (v / tot) * Math.PI * 2,
          big = a1 - a0 > Math.PI ? 1 : 0;
        const p = `M${cx} ${cy} L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 ${big} 1 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} Z`;
        const mid = (a0 + a1) / 2,
          lx = cx + r * 0.66 * Math.cos(mid),
          ly = cy + r * 0.66 * Math.sin(mid);
        a0 = a1;
        const g = `<path d="${p}" fill="${cols[i]}" fill-opacity=".75" stroke="var(--panel)" stroke-width="3"/>${txt(lx, ly + 5, labels[i], { s: 13 })}`;
        return ids ? `<g data-pick="${ids[i]}">${g}</g>` : `<g>${g}</g>`;
      })
      .join("");
  }

  /* ---------- l4-types ---------- */
  const bestRun = [0.62, 0.7, 0.7, 0.66, 0.74, 0.78];
  const typesFig = () => {
    const w = 520,
      h = 210,
      X = (i) => 50 + i * 82,
      Y = (v) => h - 40 - ((v - 0.55) / 0.3) * (h - 80);
    const path = bestRun.map((v, i) => `${i ? "L" : "M"}${X(i)} ${Y(v)}`).join(" ");
    const dots = bestRun
      .map(
        (v, i) =>
          `<g data-pick="G${i + 1}"><circle cx="${X(i)}" cy="${Y(v)}" r="13" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(X(i), Y(v) + 4, v.toFixed(2), { s: 10 })}</g>`,
      )
      .join("");
    const lab = bestRun.map((_, i) => txt(X(i), h - 14, "Gen " + (i + 1), { s: 12, c: "var(--text-dim)" })).join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="20" x2="${w - 10}" y1="${h - 30}" y2="${h - 30}" stroke="var(--line-2)" stroke-width="2"/>${txt(18, 16, "Best fitness in the population (maximising)", { a: "start", c: "var(--text-dim)" })}<path d="${path}" fill="none" stroke="var(--teal)" stroke-width="3"/>${dots}${lab}</svg>`;
  };
  B.add("l4-types", [
    {
      type: "pick",
      q: "This GA logged its best fitness each generation. Tap the generation that proves the run cannot be elitist.",
      fig: typesFig(),
      a: "G4",
      why: "Elitism copies the best individuals unchanged, so the best fitness can never fall. It dips from 0.70 to 0.66 at generation 4, so the best was lost. Staying level (generation 3) is allowed.",
    },
    {
      type: "cat",
      q: "Which scheme suits each situation better?",
      buckets: ["Generational", "Steady-state"],
      items: [
        ["Fitness is scored on 200 machines at once, and the whole batch finishes together", 0],
        ["Memory is so tight that only one child can exist at a time", 1],
        ["A lucky good child should start breeding straight away", 1],
        ["You want a big change to the population in a single step (more exploration)", 0],
        ["The old population should be swapped for a new one in one go", 0],
        ["Each step should be cheap, so you can stop at any moment with a usable population", 1],
      ],
      why: "Generational schemes make a whole batch of children and swap them in together, which suits parallel scoring and larger jumps. Steady-state changes one or two members at a time, so it needs little memory, uses good children at once and can stop any time.",
    },
    {
      type: "order",
      q: "Put one generation of an elitist generational GA in the right order.",
      items: [
        "Copy the 2 best individuals into the new population",
        "Pick parents from the old population",
        "Apply crossover and mutation to make children",
        "Fill the new population with the children and drop the old one",
      ],
      why: "The elites are set aside first so nothing can damage them. Parents are chosen from the old population, children are made from them, and then the old population is replaced by elites plus children.",
    },
    {
      type: "slider",
      q: "Generational GA: population 20, elitism keeps 2, run for 25 generations. A steady-state GA makes one child per step. How many steady-state steps make the same number of children?",
      min: 100,
      max: 800,
      step: 50,
      ans: 450,
      tol: 50,
      unit: " steps",
      hint: "Each generation makes 20 − 2 = 18 children. And 18 × 25 = 18 × 100 ÷ 4 = 450.",
      why: "Elites are copied, not made, so each generation creates 18 children. 18 × 25 = 450, so 450 steady-state steps cost the same number of evaluations. Compare schemes on evaluations, not on generations.",
    },
    {
      type: "bug",
      q: "This steady-state step is meant to replace the weakest member (maximising). Tap the faulty line.",
      code: [
        "parent = tournament(pop, 3)",
        "child = mutate(copy(parent))",
        "slot = index_of_highest_fitness(pop)",
        "if fitness(child) >= fitness(pop[slot]):",
        "    pop[slot] = child",
      ],
      a: 2,
      why: "It looks for the member with the highest fitness, which is the best. The child would overwrite the best, so the scheme would throw away its champion. It should look for the lowest fitness.",
    },
  ]);

  /* ---------- l4-replacement ---------- */
  const popBars = (vals, o) =>
    bars(vals, Object.assign({ max: 1, labels: vals.map((_, i) => "Slot " + (i + 1)), fmt: (v) => v.toFixed(2) }, o));
  const snap = (vals, title, x0) => {
    const bw = 24,
      g = 30;
    return (
      txt(x0, 18, title, { a: "start", s: 15 }) +
      vals
        .map(
          (v, i) =>
            `<rect x="${x0 + i * g}" y="${150 - v * 120}" width="${bw}" height="${v * 120}" rx="4" fill="var(--blue)" fill-opacity=".85" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + i * g + bw / 2, 166, v.toFixed(2).slice(1), { s: 9, c: "var(--text-dim)" })}`,
        )
        .join("")
    );
  };
  B.add("l4-replacement", [
    {
      type: "pick",
      q: "A child with fitness 0.55 is about to be inserted. Replace-first-weaker could overwrite any member weaker than the child, depending on the scan. Tap every slot that is a candidate.",
      fig: popBars([0.7, 0.5, 0.9, 0.3, 0.6, 0.2], {
        inside: true,
        ids: ["s1", "s2", "s3", "s4", "s5", "s6"],
        line: { y: 0.55, label: "child 0.55" },
        max: 1.1,
      }),
      a: ["s2", "s4", "s6"],
      why: "A slot is a candidate only if its fitness is below 0.55: slots 2 (0.50), 4 (0.30) and 6 (0.20). Scanning from slot 1 picks slot 2, whereas replace-weakest always takes slot 6.",
    },
    {
      type: "cat",
      q: "Which strategy does each statement describe?",
      buckets: ["Replace weakest only", "Replace first weaker only", "Both"],
      items: [
        ["Looks at every member before deciding", 0],
        ["Can stop as soon as it meets a weaker member", 1],
        ["Which member goes depends on the order of the slots", 1],
        ["Rejects a child that is worse than every member", 2],
        ["The best fitness in the population can never go down", 2],
        ["Always overwrites the member with the lowest fitness", 0],
      ],
      why: "Replace weakest is a full scan with a fixed target. Replace first weaker stops early and depends on slot order. Both refuse a child that beats nobody, and both keep the best fitness from falling, because a child only replaces a weaker member (or an equal one).",
    },
    {
      type: "mcq",
      q: "The same stream of children was fed into two populations of 8, one using replace-weakest and one using replace-first-weaker. Both have the same best member now. Which snapshot is replace-weakest, and why?",
      fig: `<svg viewBox="0 0 520 190" style="max-height:190px">${snap([0.82, 0.85, 0.88, 0.84, 0.9, 0.86, 0.83, 0.87], "Snapshot X", 12)}${snap([0.9, 0.35, 0.8, 0.5, 0.88, 0.2, 0.75, 0.6], "Snapshot Y", 272)}</svg>`,
      o: [
        "X: always removing the worst lifts the floor quickly",
        "Y: always removing the worst leaves a wide spread",
        "X: weak members get time to survive, so scores bunch up",
        "Y: weak members get time to survive, so low scores linger",
      ],
      a: 0,
      why: "Replace-weakest is greedy: every accepted child deletes the current floor, so the low scores disappear and the spread shrinks (X). Replace-first-weaker lets some weak members sit in slots the scan rarely reaches, so low scores linger (Y). That is also why it keeps more diversity.",
    },
    {
      type: "slider",
      q: "A population of 1000 sits in no particular order, and about half of the members are weaker than the new child. Replace-first-weaker scans from a start slot. About how many members does it look at before it stops?",
      min: 0,
      max: 10,
      step: 1,
      ans: 2,
      tol: 1,
      unit: " looks",
      hint: "Each look is a coin flip: weaker (stop) or not (carry on). How many coin flips until the first heads?",
      why: "With a 50% chance of a weaker member at every slot, you expect to stop after about 2 looks. Replace-weakest must always look at all 1000, which is why first-weaker is cheaper.",
    },
    {
      type: "bug",
      q: "This should find the weakest member (maximising) so the child can replace it. Tap the faulty line.",
      code: [
        "w = 0",
        "for i in range(1, P):",
        "    if fit[i] > fit[w]: w = i",
        "if child_fit >= fit[w]:",
        "    pop[w] = child",
      ],
      a: 2,
      why: "The comparison is the wrong way round, so w ends up as the index of the best member and the child would replace the champion. It must use fit[i] < fit[w] to track the lowest fitness.",
    },
  ]);

  /* ---------- l4-pressure ---------- */
  const panel = (id, x0, best, mean, title) => {
    const X = (i) => x0 + 10 + i * (150 / (best.length - 1)),
      Y = (v) => 150 - v * 110;
    const L = (a, c) =>
      `<path d="${a.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    return `<g data-pick="${id}"><rect x="${x0}" y="24" width="170" height="140" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${L(mean, "var(--blue)")}${L(best, "var(--teal)")}</g>${txt(x0 + 85, 16, title, { s: 14 })}`;
  };
  const pressFig = `<svg viewBox="0 0 560 215" style="max-height:215px">${
    panel(
      "A",
      4,
      [0.3, 0.33, 0.31, 0.35, 0.34, 0.37, 0.36, 0.38],
      [0.28, 0.3, 0.29, 0.3, 0.31, 0.3, 0.32, 0.31],
      "Run A",
    ) +
    panel(
      "B",
      194,
      [0.3, 0.55, 0.7, 0.72, 0.72, 0.72, 0.72, 0.72],
      [0.28, 0.4, 0.55, 0.65, 0.7, 0.72, 0.72, 0.72],
      "Run B",
    ) +
    panel(
      "C",
      384,
      [0.3, 0.4, 0.52, 0.62, 0.72, 0.8, 0.86, 0.9],
      [0.27, 0.34, 0.42, 0.5, 0.58, 0.66, 0.72, 0.78],
      "Run C",
    )
  }<rect x="190" y="190" width="14" height="5" fill="var(--teal)"/>${txt(210, 196, "best", { a: "start", s: 12 })}<rect x="270" y="190" width="14" height="5" fill="var(--blue)"/>${txt(290, 196, "mean", { a: "start", s: 12 })}${txt(280, 212, "x axis: generations, y axis: fitness", { s: 11, c: "var(--text-faint)" })}</svg>`;
  B.add("l4-pressure", [
    {
      type: "pick",
      q: "Three runs of the same EA, differing only in selection pressure. Tap the run that shows premature convergence.",
      fig: pressFig,
      a: "B",
      why: "In run B the mean climbs until it meets the best and both go flat at 0.72: everyone is nearly identical, so selection has nothing left to choose between. Run A barely moves (too little pressure) and run C improves steadily with a healthy gap between best and mean.",
    },
    {
      type: "cat",
      q: "How does each change affect selection pressure?",
      buckets: ["Raises pressure", "Lowers pressure", "No change"],
      items: [
        ["Tournament size 3 becomes 8", 0],
        ["Tournament size 6 becomes 2", 1],
        ["Replace every fitness by its square (all values positive) in tournament selection", 2],
        ["Add 1000 to every fitness in roulette selection", 1],
        ["Subtract the smallest fitness from every fitness in roulette selection", 0],
        ["Add 1000 to every fitness in tournament selection", 2],
      ],
      why: "Tournaments only compare, so squaring or shifting fitness keeps the same order and the same pressure. Roulette uses sizes: adding a constant flattens the slices (lower pressure), subtracting the minimum widens the gaps (higher pressure). A bigger tournament means the winner is better on average.",
    },
    {
      type: "slider",
      q: "A population of 64 uses tournaments of size 2 and nothing else (no mutation, no crossover). Early on, the best individual's copies roughly double each generation. Starting from 1 copy, about how many generations until the whole population is copies of it?",
      min: 0,
      max: 12,
      step: 1,
      ans: 6,
      tol: 1,
      unit: " generations",
      hint: "1, 2, 4, 8, 16, 32, 64: count the doublings.",
      why: "A tournament of size 2 picks the best about twice as often as a random pick, so its copies roughly double each generation: 1 to 64 takes 6 doublings. A bigger tournament would take over faster, which is the high-pressure end of the dial.",
    },
    {
      type: "multi",
      q: "Which observations suggest selection pressure is too HIGH?",
      o: [
        "The mean fitness is within 1% of the best by generation 10",
        "The number of distinct genomes falls to 1 by generation 12",
        "The best creeps up slowly while the mean barely moves",
        "Almost every child descends from the same two parents",
        "Best and mean wander up and down with no trend",
      ],
      a: [0, 1, 3],
      why: "Mean meeting the best, a single genome and a family tree with only two parents all show that diversity has collapsed. A slow creep and aimless wandering are the signs of too little pressure.",
    },
    {
      type: "mcq",
      q: "The three runs below differ only in tournament size. What do they support?",
      fig: `<table class="t"><tr><th>Run</th><th>Tournament size</th><th>Population identical at…</th><th class="num">Final best</th></tr><tr><td>1</td><td>2</td><td>never (100 gens)</td><td class="num">0.93</td></tr><tr><td>2</td><td>7</td><td>generation 6</td><td class="num">0.71</td></tr><tr><td>3</td><td>1</td><td>never (100 gens)</td><td class="num">0.52</td></tr></table>`,
      o: [
        "A moderate size beat both extremes here",
        "A larger size always gives a better final result",
        "Size 1 is best because diversity never collapses",
        "Tournament size has no real effect on the result",
      ],
      a: 0,
      why: "Size 7 collapsed diversity early and stalled at 0.71. Size 1 is random choice, so diversity stays but nothing improves. Size 2 kept diversity and still made progress. That is the sweet spot idea: some pressure, not too much.",
    },
  ]);

  /* ---------- l4-roulette ---------- */
  const cols4 = ["var(--teal)", "var(--blue)", "var(--amber)", "var(--violet)"];
  const wheelFig = `<svg viewBox="0 0 520 250" style="max-height:250px">${txt(130, 18, "Fitnesses", { s: 15 })}${pie([4, 3, 2, 1], ["A 4", "B 3", "C 2", "D 1"], 130, 135, 100, null, cols4)}${txt(390, 18, "After adding 20 to every fitness", { s: 15 })}${pie([24, 23, 22, 21], ["A 24", "B 23", "C 22", "D 21"], 390, 135, 100, ["A", "B", "C", "D"], cols4)}</svg>`;
  B.add("l4-roulette", [
    {
      type: "pick",
      q: "The left wheel uses raw fitness. The right wheel adds 20 to every fitness. Tap the individual whose slice grew the most.",
      fig: wheelFig,
      a: "D",
      why: "Raw shares are 40%, 30%, 20% and 10%. After adding 20 they are 24/90, 23/90, 22/90 and 21/90, about 27%, 26%, 24% and 23%. D more than doubles its share (10% to 23%) while A shrinks. Adding a constant flattens roulette, so the exact numbers matter.",
    },
    {
      type: "slider",
      q: "Five individuals have fitness 1, 1, 1, 1 and 6. In 30 roulette spins, about how many picks go to the four weak individuals combined?",
      min: 0,
      max: 30,
      step: 2,
      ans: 12,
      tol: 4,
      unit: " picks",
      hint: "The total is 10, so the four weak ones own 4 out of 10 of the wheel. Then 4/10 of 30 = 12.",
      why: "The weak four own 4 of the 10 units of wheel, a 40% share, so about 12 of 30 spins. Even weak individuals keep a real chance, which is what stops roulette from being pure greed.",
    },
    {
      type: "order",
      q: "Put the steps of one roulette selection in order, for a problem where shorter tours are better.",
      items: [
        "Turn each tour length into a fitness (for example 1 divided by length)",
        "Add the fitnesses to get the total size of the wheel",
        "Draw a random point between 0 and the total",
        "Walk along the individuals, adding their slices, until the running sum passes the point",
        "Return the individual whose slice you stopped in",
      ],
      why: "Roulette needs larger-is-better fitness, so the tour lengths are converted first. After that the wheel is a running sum: a random point is located by adding slices until you pass it.",
    },
    {
      type: "bug",
      q: "This roulette spin should favour individuals with bigger fitness. Tap the faulty line.",
      code: [
        "total = sum(ind.fit for ind in pop)",
        "r = random() * total",
        "running = 0",
        "for ind in pop:",
        "    running += ind.fit",
        "    if running < r:",
        "        return ind",
        "return pop[-1]",
      ],
      a: 5,
      why: "The test should be running >= r (or >), meaning the point lies inside this slice. With < the loop returns the first individual whenever its slice is smaller than the point, so selection ignores the sizes and favours slot order.",
    },
    {
      type: "cat",
      q: "Can this score be fed into roulette as it is?",
      buckets: ["Use directly", "Transform first"],
      items: [
        ["Fraction of pixels that match the target (0 to 1)", 0],
        ["Profit per run, which is sometimes a loss", 1],
        ["Tour length in km, shorter is better", 1],
        ["Distance travelled by a robot in metres, longer is better, never negative", 0],
        ["Number of rule violations, fewer is better", 1],
        ["Quiz score out of 100, higher is better", 0],
      ],
      why: "Roulette needs non-negative scores where bigger means better. Losses give negative slices, and anything where smaller is better would favour the worst solutions, so those need converting (shift, or use 1/x or max minus x).",
    },
  ]);

  /* ---------- l4-rank ---------- */
  B.add("l4-rank", [
    {
      type: "pick",
      q: "Linear rank selection with these five individuals. Tap the one that has a 20% chance of being picked.",
      fig: bars([9, 40, 7, 22, 15], { ids: ["A", "B", "C", "D", "E"], labels: ["A", "B", "C", "D", "E"], max: 48 }),
      a: "E",
      why: "Sort by fitness: B 40 is rank 5, D 22 is rank 4, E 15 is rank 3, A 9 is rank 2, C 7 is rank 1. The ranks add up to 15, so rank 3 gives 3/15 = 20%.",
    },
    {
      type: "order",
      q: "Population of 4 where lower cost is better, using linear rank selection. Put the individuals from MOST likely to be picked to LEAST likely.",
      items: ["Cost 7", "Cost 12", "Cost 25", "Cost 40"],
      why: "When minimising, rank the other way: the lowest cost gets the top rank. Cost 7 gets rank 4 (40%), then 12 (30%), 25 (20%) and 40 (10%).",
    },
    {
      type: "cat",
      q: "Which selection method does each statement describe?",
      buckets: ["Roulette only", "Rank only", "Both"],
      items: [
        ["Adding 50 to every fitness changes the probabilities", 0],
        ["Needs the population sorted first", 1],
        ["One superfit individual can take almost the whole wheel", 0],
        ["Multiplying every fitness by 10 changes nothing", 2],
        ["Probabilities depend only on the order of the individuals", 1],
        ["Two individuals whose fitness differs by 0.001 can get quite different chances", 1],
      ],
      why: "Roulette depends on the sizes of fitness values, so shifting breaks it and a giant value takes over, yet scaling everything by the same factor leaves shares alone. Rank uses only order, so shifts and giants do not matter, but it also exaggerates tiny gaps.",
    },
    {
      type: "mcq",
      q: "Linear rank selection on 6 individuals (ranks 1 to 6, total 21). How do the selection-probability gaps compare for the pair 10 vs 9.9 and the pair 9.8 vs 1?",
      fig: bars([10, 9.9, 9.8, 1, 0.9, 0.8], { labels: ["#1", "#2", "#3", "#4", "#5", "#6"], max: 12 }),
      o: [
        "Equal: each pair is one rank step apart",
        "Larger for 9.8 vs 1 because the fitness gap is bigger",
        "Larger for 10 vs 9.9 because leaders matter more",
        "Unknown without the total fitness of the population",
      ],
      a: 0,
      why: "Rank selection ignores the size of fitness gaps. 10 and 9.9 are ranks 6 and 5; 9.8 and 1 are ranks 4 and 3. Each pair differs by one rank, which is 1/21 of the wheel in both cases. That is a strength against giants and a weakness when gaps really matter.",
    },
    {
      type: "bug",
      q: "This should give the BEST individual the biggest slice under linear rank selection. Tap the faulty line.",
      code: [
        "order = sorted(pop, key=lambda x: x.fit, reverse=True)   # best first",
        "for i, ind in enumerate(order):",
        "    ind.rank = i + 1",
        "total = P * (P + 1) / 2",
        "probs = [ind.rank / total for ind in order]",
      ],
      a: 2,
      why: "The list is sorted best first, so i = 0 is the best, and rank = i + 1 gives the best rank 1, the smallest slice. The best must get rank P, for example rank = P - i.",
    },
  ]);

  /* ---------- l4-tournament ---------- */
  const chartFig = (vals, title) => {
    const ids = ["Best", "2nd", "3rd", "4th", "Worst"];
    return `<svg viewBox="0 0 520 190" style="max-height:190px">${txt(260, 16, title, { s: 14 })}${vals
      .map((v, i) => {
        const x = 30 + i * 96,
          hh = v * 1.9;
        return `<rect x="${x}" y="${165 - hh}" width="64" height="${hh}" rx="6" fill="var(--violet)" fill-opacity=".8" stroke="var(--line-2)" stroke-width="2"/>${txt(x + 32, 159 - hh, v + "%", { s: 12 })}${txt(x + 32, 183, ids[i], { s: 12 })}`;
      })
      .join("")}</svg>`;
  };
  B.add("l4-tournament", [
    {
      type: "pick",
      q: "Tournaments of size 3 are drawn WITHOUT replacement from these six individuals. Tap every individual that can never win one.",
      fig: bars([8, 3, 6, 9, 2, 5], {
        ids: ["F1", "F2", "F3", "F4", "F5", "F6"],
        labels: ["F1", "F2", "F3", "F4", "F5", "F6"],
        max: 11,
      }),
      a: ["F2", "F5"],
      why: "To win, an individual needs the other two entrants to be weaker. F5 (2) and F2 (3) are the two weakest, so there are never two weaker individuals to share the tournament with. F6 (5) can win if F2 and F5 are drawn with it. With replacement they could win by being drawn three times.",
    },
    {
      type: "cat",
      q: "What happens to tournament selection pressure?",
      buckets: ["Raises pressure", "Lowers pressure", "No change"],
      items: [
        ["Tournament size grows from 3 to 8", 0],
        ["Tournament size shrinks from 6 to 2", 1],
        ["Every fitness is multiplied by 1000", 2],
        ["The best individual's fitness is made 1000 times larger, others stay", 2],
        ["Tournament size shrinks from 2 to 1", 1],
        ["1000 is added to every fitness", 2],
      ],
      why: "A tournament only compares who is better, so any change that keeps the order the same does nothing. Pressure moves only with the tournament size: bigger means the winner is more likely to be near the top.",
    },
    {
      type: "mcq",
      q: "Chart A shows each rank's chance of winning a tournament of size 2 (with replacement) in a population of 5. Chart B is the same population with one setting changed. What changed?",
      fig: `<svg viewBox="0 0 520 380" style="max-height:380px"><g>${chartFig([36, 28, 20, 12, 4], "Chart A: size 2").replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g><g transform="translate(0 190)">${chartFig([49, 30, 15, 6, 1], "Chart B").replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g></svg>`,
      o: [
        "A larger tournament size",
        "A smaller tournament size",
        "Drawing the entrants without replacement",
        "A population twice as big",
      ],
      a: 0,
      why: "Chart B puts more weight on the best (49% against 36%) and less on the rest, so the pressure is higher: a larger tournament. Without replacement the worst could never win (0%), and a bigger population would not stay at 5 slots.",
    },
    {
      type: "bug",
      q: "This tournament should return the fittest of t random entrants (maximising). Tap the faulty line.",
      code: [
        "def tournament(pop, t):",
        "    best = None",
        "    for _ in range(t):",
        "        cand = random.choice(pop)",
        "        if best is None or cand.fit < best.fit:",
        "            best = cand",
        "    return best",
      ],
      a: 4,
      why: "The comparison keeps the weaker candidate, so the function returns the worst of the entrants. It should keep cand when cand.fit > best.fit.",
    },
    {
      type: "multi",
      q: "When is tournament selection a better fit than roulette?",
      o: [
        "Some fitness values are negative",
        "The population is spread over many machines, so adding up all fitness values is awkward",
        "You want one simple dial (t) for how greedy selection is",
        "You need probabilities exactly proportional to fitness",
        "You must sort the whole population before every selection",
      ],
      a: [0, 1, 2],
      why: "Tournaments only compare entrants, so negative values are fine, no global total is needed, and t is the pressure dial. Exact proportionality is roulette's job, and needing a sort is a cost of rank selection, not of tournaments.",
    },
  ]);

  /* ---------- l4-mutation ---------- */
  const permFig = (() => {
    const rows = [
      ["M1", [3, 1, 6, 4, 2, 5]],
      ["M2", [3, 1, 4, 6, 2, 2]],
      ["M3", [3, 2, 6, 4, 1, 5]],
      ["M4", [3, 1, 4, 6, 2, 7]],
      ["M5", [4, 1, 4, 6, 2, 5]],
    ];
    const parent = `${txt(10, 36, "Parent", { a: "start", s: 14 })}${strip(
      [3, 1, 4, 6, 2, 5].map((n) => [n, "var(--bg-2)"]),
      100,
      16,
    )}`;
    const body = rows
      .map(
        ([id, g], i) =>
          `<g data-pick="${id}"><rect x="6" y="${58 + i * 44}" width="320" height="40" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(36, 84 + i * 44, id, { s: 14 })}${strip(
            g.map((n) => [n]),
            100,
            61 + i * 44,
            { cw: 34, ch: 34 },
          )}</g>`,
      )
      .join("");
    return `<svg viewBox="0 0 340 285" style="max-height:285px;max-width:380px">${parent}${body}</svg>`;
  })();
  B.add("l4-mutation", [
    {
      type: "pick",
      q: "The parent is a tour of cities 1 to 6, each visited once. Five mutations were tried. Tap every child that is still a valid tour.",
      fig: permFig,
      a: ["M1", "M3"],
      why: "M1 swapped two cities and M3 reversed a segment (1 4 6 2 became 2 6 4 1); both still contain each city exactly once. M2 repeats city 2 and loses 5, M4 contains city 7, which does not exist, and M5 visits 4 twice. Those came from gene-by-gene changes that ignore the permutation.",
    },
    {
      type: "match",
      q: "Match each before and after to the mutation that made it.",
      pairs: [
        ["10110 → 10010", "Bit flip"],
        ["(2.40, 7.10) → (2.46, 7.03)", "Gaussian nudge"],
        ["A B C D E → A E C D B", "Swap two genes"],
        ["A B C D E → A B E D C", "Reverse a segment"],
        ["A B C D E → A C D B E", "Move one gene"],
      ],
      why: "A bit flip changes one binary gene; Gaussian noise gives small random changes to real values; swap exchanges B and E; inversion reverses the stretch C D E; insertion moves B to just after D.",
    },
    {
      type: "cat",
      q: "Does each operator take small steps or big jumps?",
      buckets: ["Small steps (exploit)", "Big jumps (explore)"],
      items: [
        ["Gaussian noise with a standard deviation of 0.01", 0],
        ["Reset a gene to any value in its range", 1],
        ["Flip one bit (rate 1/L)", 0],
        ["Replace the whole chromosome with a random one", 1],
        ["Gaussian noise with a standard deviation as large as the whole range", 1],
        ["Swap two neighbouring cities in a tour", 0],
      ],
      why: "Small changes give children that are similar to a good parent, so they have a fair chance of being good (exploitation). Large changes can reach anywhere but usually land somewhere poor (exploration). A good mutation scheme needs both: mostly small steps, with the ability to jump.",
    },
    {
      type: "slider",
      q: "A 100-bit string is mutated with each bit flipping independently with probability 1/100. About what percentage of children are exact copies of their parent (no bit flips at all)?",
      min: 0,
      max: 100,
      step: 5,
      ans: 37,
      tol: 10,
      unit: "%",
      hint: "Each bit survives with probability 0.99. For 100 bits this is the classic (1 − 1/n)^n, which is about 1/e ≈ 0.37.",
      why: "With one flip expected per child, a surprising number of children get none: (1 − 1/100)^100 ≈ 0.37, so over a third are copies. That is worth knowing when you wonder why progress sometimes stalls: those children cost an evaluation and add nothing.",
    },
    {
      type: "bug",
      q: "A mutation should return a changed COPY and leave the parent alone. Tap the faulty line.",
      code: [
        "def mutate(parent, sigma):",
        "    child = parent",
        "    i = random.randrange(len(child))",
        "    child[i] += random.gauss(0, sigma)",
        "    return child",
      ],
      a: 1,
      why: "child = parent does not copy a Python list, it just gives it a second name. The parent in the population is changed as well, even when the child is later rejected. It needs child = parent[:] or list(parent).",
    },
  ]);

  /* ---------- l4-crossover ---------- */
  const cutFig = (() => {
    const src = ["B", "B", "O", "O", "O", "B", "B", "B"],
      x0 = 60,
      cw = 50;
    const cells = src
      .map(
        (s, i) =>
          `<rect x="${x0 + i * cw}" y="30" width="${cw - 4}" height="${cw - 4}" rx="8" fill="${s === "B" ? "var(--blue)" : "var(--amber)"}" fill-opacity=".8" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + i * cw + (cw - 4) / 2, 59, i + 1, { s: 14, c: "#fff" })}`,
      )
      .join("");
    const gaps = Array.from(
      { length: 7 },
      (_, i) =>
        `<g data-pick="g${i + 1}"><rect x="${x0 + (i + 1) * cw - 14}" y="82" width="22" height="40" rx="6" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + (i + 1) * cw - 3, 144, "g" + (i + 1), { s: 14, c: "var(--text-dim)" })}</g>`,
    ).join("");
    return `<svg viewBox="0 0 480 155" style="max-height:155px">${txt(240, 18, "Blue: from parent 1. Orange: from parent 2", { s: 15 })}${cells}${gaps}</svg>`;
  })();
  const maskFig = `<svg viewBox="0 0 440 150" style="max-height:150px">${txt(8, 30, "Parent 1", { a: "start" })}${strip(
    "ABCDEFGH".split("").map((c) => [c, "var(--blue)", "#fff"]),
    90,
    12,
    { cw: 40 },
  )}${txt(8, 78, "Parent 2", { a: "start" })}${strip(
    "abcdefgh".split("").map((c) => [c, "var(--amber)", "#fff"]),
    90,
    60,
    { cw: 40 },
  )}${txt(8, 128, "Child", { a: "start" })}${strip(
    "ABcdEfGH".split("").map((c) => [c]),
    90,
    110,
    { cw: 40 },
  )}</svg>`;
  B.add("l4-crossover", [
    {
      type: "pick",
      q: "A k-point crossover made this child. Tap every cut point (gap between genes) that was used.",
      fig: cutFig,
      a: ["g2", "g5"],
      why: "The source changes from blue to orange between genes 2 and 3 and back to blue between genes 5 and 6. Those are the two cuts, so this was 2-point crossover. Where neighbouring genes share a colour there is no cut.",
    },
    {
      type: "mcq",
      q: "The child below was made by uniform crossover from the two parents. Which mask (1 = take the gene from parent 2) produced it?",
      fig: maskFig,
      o: ["00110100", "11001011", "00110010", "00101100"],
      a: 0,
      why: "Compare gene by gene: A, B from parent 1 (0, 0), c, d from parent 2 (1, 1), E from parent 1 (0), f from parent 2 (1), G, H from parent 1 (0, 0). That is 00110100. The mask 11001011 is its opposite and would build the other child.",
    },
    {
      type: "cat",
      q: "Parents are AAAAAA and BBBBBB. Which crossover can produce each child?",
      buckets: ["1-point", "2-point but not 1-point", "Uniform only", "No crossover"],
      items: [
        ["AAABBB", 0],
        ["BBBBAA", 0],
        ["AABBAA", 1],
        ["BAAAAB", 1],
        ["ABABAB", 2],
        ["AACBBB", 3],
      ],
      why: "One cut gives a block of A next to a block of B. Two cuts give a swapped middle. ABABAB alternates too often for two cuts, so it needs a mask. AACBBB contains a C that neither parent has, and crossover only recombines existing genes. New values come from mutation.",
    },
    {
      type: "multi",
      q: "Which of these situations make crossover produce only exact copies of the parents?",
      o: [
        "Both parents are identical",
        "The uniform mask is all 1s (child 1 copies parent 2)",
        "A 1-point cut falls between genes 4 and 5 of 8",
        "The crossover probability test fails and no crossover is applied",
        "The parents differ at every gene",
      ],
      a: [0, 1, 3],
      why: "Identical parents leave nothing to recombine, an all-1 mask hands over everything from one parent, and skipping crossover just copies them. A cut in the middle and parents that differ everywhere both give genuinely new children.",
    },
    {
      type: "bug",
      q: "This should build two children by swapping each gene with probability 0.5 (c1 starts as a copy of p1, c2 as a copy of p2). Tap the faulty line.",
      code: [
        "c1, c2 = p1[:], p2[:]",
        "for i in range(L):",
        "    if random() < 0.5:",
        "        c1[i] = p1[i]",
        "        c2[i] = p1[i]",
      ],
      a: 3,
      why: "Swapping means child 1 takes parent 2's gene here, but c1[i] = p1[i] writes the value it already holds. Child 1 would always stay a copy of parent 1. It should be c1[i] = p2[i].",
    },
  ]);

  /* ---------- l4-lab ---------- */
  const labFig = (() => {
    const w = 520,
      h = 220,
      X = (g) => 40 + (g / 30) * 460,
      Y = (v) => 180 - v * 150;
    const line = (f, c) =>
      `<path d="${Array.from({ length: 31 }, (_, g) => `${g ? "L" : "M"}${X(g).toFixed(1)} ${Y(f(g)).toFixed(1)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3"/>`;
    const best = (g) => (g < 10 ? 0.5 + 0.04 * g : 0.9);
    const mean = (g) => (g < 12 ? 0.45 + 0.0375 * g : 0.9);
    const div = (g) => Math.max(0, 0.8 - (0.8 * g) / 12);
    const ticks = [4, 8, 12, 20, 28]
      .map(
        (g) =>
          `<g data-pick="g${g}"><circle cx="${X(g)}" cy="198" r="13" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(X(g), 202, g, { s: 11 })}</g>`,
      )
      .join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="40" x2="500" y1="180" y2="180" stroke="var(--line-2)" stroke-width="2"/>${line(div, "var(--rose)")}${line(mean, "var(--blue)")}${line(best, "var(--teal)")}${ticks}${txt(46, 14, "best", { a: "start", c: "var(--teal-ink)" })}${txt(92, 14, "mean", { a: "start", c: "var(--blue-ink)" })}${txt(144, 14, "diversity", { a: "start", c: "var(--rose-ink)" })}</svg>`;
  })();
  const gridFig = (() => {
    const bad = [
        [1, 2],
        [4, 9],
        [7, 4],
        [10, 7],
      ],
      c = 26,
      x0 = 20,
      y0 = 10;
    let s = "";
    for (let r = 0; r < 12; r++)
      for (let k = 0; k < 12; k++) {
        const on = (r * 7 + k * 3 + r * k) % 5 < 2,
          wrong = bad.some(([a, b]) => a === r && b === k);
        s += `<rect x="${x0 + k * c}" y="${y0 + r * c}" width="${c - 2}" height="${c - 2}" rx="3" fill="${on ? "var(--ink)" : "var(--bg-2)"}" stroke="${wrong ? "var(--rose)" : "var(--line)"}" stroke-width="${wrong ? 4 : 1}"/>`;
      }
    return `<svg viewBox="0 0 352 ${y0 + 12 * c + 6}" style="max-height:330px;max-width:380px">${s}</svg>`;
  })();
  B.add("l4-lab", [
    {
      type: "pick",
      q: "The dashboard of one lab run is below (generations on the x axis). Tap the first mark at which the run is already stuck for good.",
      fig: labFig,
      a: "g12",
      why: "Diversity hits 0 at generation 12 and the mean has caught up with the best, so every member is the same. With no mutation left to create anything new, nothing can improve after that. At generation 8 diversity is still above 0 and the mean is still climbing.",
    },
    {
      type: "mcq",
      q: "All three runs spent exactly 2,000 fitness evaluations on the same picture. Why does run C trail?",
      fig: `<table class="t"><tr><th>Run</th><th>Population</th><th>Scheme</th><th class="num">Final best</th></tr><tr><td>A</td><td>10</td><td>steady-state, 1 child per step</td><td class="num">0.88</td></tr><tr><td>B</td><td>100</td><td>steady-state, 1 child per step</td><td class="num">0.80</td></tr><tr><td>C</td><td>100</td><td>generational, 100 children per generation</td><td class="num">0.71</td></tr></table>`,
      o: [
        "It got only 20 generations, as each one costs 100 evaluations",
        "Big populations can never beat small ones in a fixed budget",
        "Generational schemes are not able to use any mutation at all",
        "2,000 evaluations is too few for a population of any size",
      ],
      a: 0,
      why: "The budget is shared out differently: run C gets 2000 ÷ 100 = 20 generations of improvement, run B gets 2000 steps and run A gets 2000 steps on a small population. When the budget is fixed, a bigger population means fewer rounds of selection. That is the cost of more diversity.",
    },
    {
      type: "order",
      q: "Put the typical story of a lab run in order.",
      items: [
        "The population starts as random noise, with about half the pixels right",
        "The best rises fast as good pixels spread through the population",
        "Progress slows because most pixels are already right",
        "Only rare lucky mutations fix the last few wrong pixels",
      ],
      why: "Random pictures match about half the pixels, so early improvements are cheap and spread quickly. As the picture fills in, fewer changes help, and the last fixes need a lucky mutation to hit exactly the right pixel.",
    },
    {
      type: "slider",
      q: "This best candidate has 4 wrong pixels (red outlines) out of 144. A mutation flips exactly one random pixel. About what percentage of such mutants are better than the parent?",
      fig: gridFig,
      min: 0,
      max: 20,
      step: 1,
      ans: 3,
      tol: 2,
      unit: "%",
      hint: "A flip helps only if it hits one of the 4 wrong pixels: 4 out of 144, about 1 in 36.",
      why: "Only the 4 wrong pixels can be improved, so 4/144 ≈ 3% of single flips help. The other 97% make it worse. That is why late progress is slow: the closer you get, the harder improvements are to find.",
    },
    {
      type: "bug",
      q: "This fitness function should give 1.0 for a perfect copy of the target. Tap the faulty line.",
      code: [
        "def fitness(pic, target):",
        "    wrong = sum(1 for a, b in zip(pic, target) if a != b)",
        "    return wrong / len(target)",
      ],
      a: 2,
      why: "wrong / len(target) is the error rate: 0 for a perfect copy and larger for worse pictures, so the GA would be steered towards the worst pictures. Fitness should be 1 - wrong / len(target).",
    },
  ]);
})();

/* ===== bank-w-nic-1.js ===== */
/* NIC revision bank, second set of visual and varied questions, part 1. */
(function () {})();

/* ===== bank-w-nic-2.js ===== */
/* NIC revision bank, second set of visual and varied questions, part 2 (l2-approx, l3-*). Numbers verified with node. */
(function () {
  const B = NIC.bank;

  /* ---------- small SVG helpers (CSS variables so both themes work) ---------- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, s, { a = "middle", c = "var(--text)", f = "800 13px" } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${f} var(--sans);fill:${c}">${s}</text>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2, d = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const path = (pts, c, w = 3, d = "") =>
    `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const mat = (C, D) =>
    `<div style="max-width:340px"><table class="t matrix"><tr><th></th>${C.map((x) => `<th>${x}</th>`).join("")}</tr>${C.map((a) => `<tr><th>${a}</th>${C.map((b) => (a === b ? `<td class="faint">–</td>` : `<td>${D[a + b] || D[b + a]}</td>`)).join("")}</tr>`).join("")}</table></div>`;
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  };

  /* ======================================================================
     l2-approx
     ====================================================================== */
  const paretoFig = () => {
    const X = (t) => 60 + Math.log10(t / 0.1) * 100,
      Y = (q) => 200 - (q - 60) * 4.2;
    const M = { A: [0.1, 70], B: [1, 85], C: [2, 80], D: [10, 92], E: [30, 90], F: [100, 97], G: [5, 75] };
    const ticks = [
      [0.1, "0.1 s"],
      [1, "1 s"],
      [10, "10 s"],
      [100, "100 s"],
    ]
      .map(
        ([t, l]) =>
          `${ln(X(t), 200, X(t), 205, "var(--line-2)", 2)}${tx(X(t), 222, l, { f: "700 12px", c: "var(--text-faint)" })}`,
      )
      .join("");
    const dots = Object.entries(M)
      .map(
        ([k, [t, q]]) =>
          `<g data-pick="${k}"><circle cx="${X(t)}" cy="${Y(q)}" r="14" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(t), Y(q) + 5, k, { f: "900 14px" })}</g>`,
      )
      .join("");
    return svg(
      460,
      246,
      `${ln(50, 200, 450, 200)}${ln(50, 24, 50, 200)}${ticks}${dots}
      ${tx(250, 242, "time taken (slower to the right)", { f: "700 12px", c: "var(--text-faint)" })}
      <text transform="translate(16,112) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">quality of answer</text>`,
    );
  };

  B.add("l2-approx", [
    {
      type: "pick",
      q: "Each dot is a method for the same routing problem. A method is worth keeping only if no other method is both faster and better. Click every method worth keeping.",
      fig: paretoFig(),
      a: ["A", "B", "D", "F"],
      hint: "Go left to right. A dot is beaten if something to its left is also higher.",
      why: "C is slower than B yet worse, G is slower than B yet worse, and E is slower than D yet worse. A, B, D and F each buy extra quality with extra time, so which one is right depends on the time budget.",
    },
    {
      type: "match",
      q: "Match each job to the kind of method that suits it best.",
      pairs: [
        ["Cable 40 offices cheaply, answer needed instantly", "An exact algorithm (a spanning-tree method)"],
        ["Choose which of 12 items to pack: each is in or out", "Check all 4,096 subsets"],
        ["Plan a 25-stop van route in two seconds", "A fast simple heuristic"],
        ["Redesign a 21-pipe network overnight", "An evolutionary algorithm"],
      ],
      why: "A fast exact method exists for the cable problem. Twelve in-or-out choices give only 4,096 subsets, small enough to check all. A tight deadline needs a quick heuristic, and a long budget on a huge space lets an EA keep improving.",
    },
    {
      type: "slider",
      q: "A computer checks one billion designs per second. A design problem has 1,000,000,000,000,000 designs (a 1 followed by 15 zeros). About how many days does a full exhaustive check take?",
      min: 0,
      max: 40,
      step: 1,
      ans: 12,
      tol: 4,
      unit: "days",
      hint: "10¹⁵ ÷ 10⁹ = 10⁶ seconds. A day is about 100,000 seconds, so a million seconds is about ten days (a bit more, as a day is 86,400 s).",
      why: "A million seconds is about 11.6 days. It looks affordable, but add three more zeros to the design count and the same check takes over 30 years.",
    },
    {
      type: "bug",
      q: "This script estimates how long an exhaustive search of the New York Tunnels network would take, but it reports a tiny time. Click the faulty line.",
      code: [
        "choices = 16",
        "pipes = 21",
        "designs = choices * pipes",
        "seconds = designs / 1e9",
        "print(seconds / 3.15e7, 'years to check everything')",
      ],
      a: 2,
      why: "Each pipe has 16 choices, so the designs multiply: 16 ** 21 (about 2 × 10²⁵). Writing 16 * 21 = 336 treats the choices as if they were added, which hides the explosion.",
    },
    {
      type: "order",
      q: "Put these search spaces in order from fewest designs to most.",
      items: [
        "10 pipes with 2 diameters each",
        "6 pipes with 10 diameters each",
        "12 pipes with 4 diameters each",
        "8 pipes with 16 diameters each",
      ],
      hint: "Count designs as choices multiplied together: 2¹⁰ is about a thousand, 10⁶ a million, 4¹² = 2²⁴ about 17 million, 16⁸ = 2³² about 4 billion.",
      why: "2¹⁰ = 1,024, then 10⁶ = 1,000,000, then 4¹² = 16,777,216, then 16⁸ = 4,294,967,296. The number of pipes alone does not decide the size; the choices per pipe matter as much.",
    },
  ]);

  /* ======================================================================
     l3-recipe
     ====================================================================== */
  const traceRowsFig = () => {
    const R = [
      ["r1", "4 3 3 2 1", "2", "replaced the 1"],
      ["r2", "5 4 4 3 2", "6", "replaced a 4"],
      ["r3", "4 4 3 3 2", "1", "thrown away"],
      ["r4", "6 5 5 2 2", "2", "replaced a 2"],
    ];
    return svg(
      460,
      226,
      `${tx(24, 22, "population", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(190, 22, "child", { a: "start", c: "var(--text-faint)", f: "700 11px" })}${tx(260, 22, "what the EA did", { a: "start", c: "var(--text-faint)", f: "700 11px" })}
      ${R.map(([k, p, c, w], i) => `<g data-pick="${k}"><rect x="12" y="${32 + i * 46}" width="436" height="38" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(24, 56 + i * 46, p, { a: "start", f: "800 15px" })}${tx(190, 56 + i * 46, c, { a: "start", f: "800 15px" })}${tx(260, 56 + i * 46, w, { a: "start", f: "800 14px" })}</g>`).join("")}`,
    );
  };
  const bitsFig = () => {
    const P1 = "11010010",
      P2 = "00111001",
      C = "11011101";
    const row = (y, label, s, ids, col) =>
      `${tx(12, y + 24, label, { a: "start", c: "var(--text-dim)", f: "800 12px" })}${[...s].map((b, i) => `<g ${ids ? `data-pick="c${i}"` : ""}><rect x="${90 + i * 42}" y="${y}" width="36" height="36" rx="8" fill="var(--panel)" stroke="${col}" stroke-width="2.5"/>${tx(108 + i * 42, y + 24, b, { f: "900 16px" })}</g>`).join("")}`;
    return svg(
      460,
      196,
      `${row(10, "Parent 1", P1, false, "var(--blue)")}${row(60, "Parent 2", P2, false, "var(--violet)")}${ln(90 + 3 * 42 - 3, 4, 90 + 3 * 42 - 3, 100, "var(--rose)", 3, "6 5")}${tx(90 + 3 * 42 - 3, 114, "cut after bit 3", { c: "var(--rose-ink)", f: "800 12px" })}${row(140, "Child", C, true, "var(--teal)")}`,
    );
  };

  B.add("l3-recipe", [
    {
      type: "pick",
      q: "Fitness is maximised. The EA's rule is: the child replaces the weakest member if it is at least as good, otherwise it is thrown away. Each row is a separate step. Click the row where the EA broke its own rule.",
      fig: traceRowsFig(),
      a: "r2",
      why: "In row 2 the weakest member is the 2, and the child (6) is better, so the 2 should be replaced. Replacing a 4 throws away a strong member for no reason. Row 4 is fine: a tie still counts as 'at least as good'.",
    },
    {
      type: "pick",
      q: "The child was made by 1-point crossover at the dashed cut (bits 1 to 3 from Parent 1, the rest from Parent 2), and then one bit was mutated. Click the bit that was mutated.",
      fig: bitsFig(),
      a: "c5",
      hint: "First write the child that crossover alone would give, then compare it with the child shown.",
      why: "Crossover alone gives 110 + 11001 = 11011001. The shown child differs in bit 6, where both parents have a 0 but the child has a 1. Only mutation can create a value that neither parent holds.",
    },
    {
      type: "slider",
      q: "A population of 10 has distinct fitness values. A tournament picks two different members at random and keeps the fitter one. What is the chance, in percent, that the single fittest member becomes the parent?",
      min: 0,
      max: 100,
      step: 5,
      ans: 20,
      tol: 6,
      unit: "%",
      hint: "The fittest always wins when it takes part. It takes part if it is one of the 2 members drawn from the 10: 2 out of 10.",
      why: "The best member wins every tournament it enters, and it enters with chance 2/10 = 20%. The worst member can never win (it would need to face someone even weaker), so tournaments favour strong members without being certain.",
    },
    {
      type: "bug",
      q: "This generational EA should keep its population at a fixed size, but it slows down and the memory use grows every generation. Click the faulty line.",
      code: [
        "for generation in range(100):",
        "    children = []",
        "    for _ in range(len(pop)):",
        "        a, b = select(pop), select(pop)",
        "        children.append(mutate(crossover(a, b)))",
        "    pop = pop + children",
      ],
      a: 5,
      why: "In a generational EA the children replace the old population: pop = children. Adding them on top doubles the population every generation, 100 generations means about 2¹⁰⁰ members, and old weak members never leave.",
    },
    {
      type: "match",
      q: "Match each change to an EA with its most likely effect.",
      pairs: [
        ["Tournament size 2 raised to 10", "Everyone becomes alike sooner"],
        ["Mutation flips half the bits of every child", "Search drifts like random guessing"],
        ["Replacing a random member instead of the weakest", "The best member can be lost"],
        [
          "Population 20 raised to 200 on the same budget",
          "Many more evaluations per generation, so fewer generations",
        ],
      ],
      why: "Bigger tournaments raise selection pressure, so the population converges faster. Huge mutation destroys what selection has built. A random victim may be the champion. And a fixed budget spread over a bigger population buys fewer generations.",
    },
  ]);

  /* ======================================================================
     l3-tsp
     ====================================================================== */
  const hexFig = () => {
    const P = { A: [230, 30], B: [380, 90], C: [380, 190], D: [230, 245], E: [80, 190], F: [80, 90] };
    const tour = ["A", "C", "B", "D", "E", "F"];
    const edges = tour.map((c, i) => [c, tour[(i + 1) % 6]]);
    const lines = edges
      .map(
        ([a, b]) =>
          `<g data-pick="${a}${b}"><line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="transparent" stroke-width="18" stroke-linecap="round"/><line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="var(--blue)" stroke-width="4" stroke-linecap="round"/></g>`,
      )
      .join("");
    const nodes = Object.entries(P)
      .map(
        ([k, [x, y]]) =>
          `<circle cx="${x}" cy="${y}" r="15" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2.5" pointer-events="none"/>${tx(x, y + 5, k, { f: "900 14px" })}`,
      )
      .join("");
    return svg(460, 270, `${lines}${nodes}`);
  };
  const D5 = { AB: 4, AC: 9, AD: 3, AE: 7, BC: 5, BD: 8, BE: 6, CD: 2, CE: 9, DE: 4 };

  B.add("l3-tsp", [
    {
      type: "pick",
      q: "This tour is stored as ACBDEF and drawn on the map. A tour that crosses itself can always be made shorter. Click the two hops that cross each other.",
      fig: hexFig(),
      a: ["AC", "BD"],
      hint: "Look for two straight hops that make an X in the middle.",
      why: "A–C and B–D are the two diagonals of the middle rectangle, so they cross. Reversing the stretch CB (giving ABCDEF) swaps two crossing hops for two sides of a quadrilateral, which are shorter than its diagonals.",
    },
    {
      type: "slider",
      q: "A 10-city problem has (10 − 1)! / 2 distinct tours. How many times more distinct tours does a 12-city problem have?",
      min: 0,
      max: 300,
      step: 10,
      ans: 110,
      tol: 25,
      unit: "times more",
      hint: "11! / 2 ÷ (9! / 2) = 11! ÷ 9! = 11 × 10.",
      why: "Most of the product cancels, leaving 11 × 10 = 110. Two extra cities cost 110 times the work, so each new city multiplies the exhaustive-search time by about the number of cities.",
    },
    {
      type: "order",
      q: "Using the distance table, put these tours in order from shortest to longest.",
      fig: mat(["A", "B", "C", "D", "E"], D5),
      items: ["ABCDE", "ACDEB", "ABDCE", "ACEBD"],
      hint: "Add the five hops of each tour, including the road home. ABCDE = 4 + 5 + 2 + 4 + 7.",
      why: "ABCDE = 4 + 5 + 2 + 4 + 7 = 22. ACDEB = 9 + 2 + 4 + 6 + 4 = 25. ABDCE = 4 + 8 + 2 + 9 + 7 = 30. ACEBD = 9 + 9 + 6 + 8 + 3 = 35.",
    },
    {
      type: "cat",
      q: "Five cities A–E. Sort each string: is it the same loop as ABCDE, a different valid tour, or not a tour at all?",
      buckets: ["Same loop as ABCDE", "Valid, but a different loop", "Not a tour"],
      items: [
        ["BCDEA", 0],
        ["EDCBA", 0],
        ["ACBDE", 1],
        ["ABCED", 1],
        ["ABCDD", 2],
        ["ABDE", 2],
      ],
      hint: "ABCDE has the hops AB, BC, CD, DE and EA. The same loop uses exactly these hops.",
      why: "BCDEA starts elsewhere and EDCBA runs backwards, so both use the same five hops. ACBDE and ABCED are permutations but contain other hops. ABCDD repeats D and leaves E out, and ABDE is missing C.",
    },
    {
      type: "bug",
      q: "This validity check should accept a string only if it visits every city exactly once, but it accepts ABCDD. Click the faulty line.",
      code: [
        "def is_valid(tour, cities):",
        "    if len(tour) != len(cities):",
        "        return False",
        "    return set(tour) <= set(cities)",
      ],
      a: 3,
      hint: "For five cities, ABCDD has the right length. Is its set of cities a subset of A–E? Does it contain all of A–E?",
      why: "A subset test only says the letters come from the city list, so repeats pass. Equal length plus set(tour) == set(cities) means no repeats and nothing missing.",
    },
  ]);

  /* ======================================================================
     l3-hc
     ====================================================================== */
  const hcGraphFig = () => {
    const f = { S: 5, a: 7, b: 6, z: 3, c: 9, d: 4, e: 8, g: 5, h: 10, y: 5, t: 7 };
    const P = {
      S: [40, 125],
      a: [130, 50],
      b: [130, 125],
      z: [130, 205],
      c: [230, 28],
      d: [230, 78],
      e: [230, 128],
      g: [230, 175],
      y: [230, 225],
      h: [330, 128],
      t: [330, 225],
    };
    const E = [
      ["S", "a"],
      ["S", "b"],
      ["S", "z"],
      ["a", "c"],
      ["a", "d"],
      ["b", "e"],
      ["b", "g"],
      ["e", "h"],
      ["z", "y"],
      ["y", "t"],
    ];
    const edges = E.map(([a, b]) => ln(P[a][0], P[a][1], P[b][0], P[b][1], "var(--line-2)", 3)).join("");
    const nodes = Object.entries(P)
      .map(
        ([k, [x, y]]) =>
          `<g data-pick="${k}"><circle cx="${x}" cy="${y}" r="19" fill="${k === "S" ? "var(--bg-2)" : "var(--panel)"}" stroke="${k === "S" ? "var(--rose)" : "var(--line-2)"}" stroke-width="3"/>${tx(x, y - 2, k, { f: "800 11px", c: "var(--text-dim)" })}${tx(x, y + 12, f[k], { f: "900 14px" })}</g>`,
      )
      .join("");
    return svg(460, 252, `${edges}${nodes}${tx(410, 60, "S = start", { c: "var(--rose-ink)", f: "800 12px" })}`);
  };

  B.add("l3-hc", [
    {
      type: "pick",
      q: "The number in each circle is its fitness (higher is better) and lines join neighbours. A hillclimber starts at S, picks a random neighbour and moves if it is not lower. Click every circle where it could end up stuck.",
      fig: hcGraphFig(),
      a: ["c", "h"],
      hint: "From S it can only go to a (7) or b (6). Follow every non-decreasing path from there.",
      why: "From S the moves to a and b are accepted, but z (3) is lower and rejected. a leads on to c, a dead end at 9, and b leads to e and then h (10). t is also a local optimum, but reaching it means going down to z and y first, which this climber never does.",
    },
    {
      type: "slider",
      q: "A hillclimber maximises the number of 1s in a 20-bit string by flipping one random bit and accepting if the string is no worse. It now holds 18 ones. About how many mutants must it try, on average, before it finds a strictly better one?",
      min: 0,
      max: 30,
      step: 1,
      ans: 10,
      tol: 3,
      unit: "mutants",
      hint: "A flip only helps if it hits one of the 2 zeros among 20 positions: 2 in 20 is 1 in 10.",
      why: "With 2 zeros out of 20 bits the chance a flip helps is 1/10, so about 10 tries are needed. At 15 ones it was 1 in 4. Hillclimbing gets slower as it nears the top, and it needs many 'no change' steps.",
    },
    {
      type: "bug",
      q: "This hillclimber for tours accepts every mutant, so it behaves like a random walk. Click the faulty line.",
      code: [
        "c = random_tour()",
        "for step in range(5000):",
        "    m = c",
        "    i = random.randrange(len(c))",
        "    m[i], m[(i + 1) % len(c)] = m[(i + 1) % len(c)], m[i]",
        "    if length(m) <= length(c):",
        "        c = m",
      ],
      a: 2,
      why: "m = c does not copy: m and c are the same list, so the swap changes c too and the test compares the tour with itself (always equal, always accepted). The mutant needs its own copy: m = c[:].",
    },
    {
      type: "multi",
      q: "A hillclimber has stopped: none of its neighbours is better. Select all statements that are true.",
      o: [
        "No single mutation of the operator it uses would improve it",
        "A different mutation operator might still find an improvement",
        "Running the same climber ten times longer will probably find a better tour",
        "A restart from another random tour might end somewhere better",
        "The tour it holds is the best tour in the whole search space",
      ],
      a: [0, 1, 3],
      why: "Stuck means a local optimum for that operator. A bigger neighbourhood or a restart can escape it, but more time with the same moves cannot, and a local optimum need not be the global best.",
    },
    {
      type: "match",
      q: "A hillclimber (accepting equal moves) starts in each situation. Match the situation to what happens.",
      pairs: [
        ["On the slope of the tallest hill", "It reaches the global best"],
        ["On the slope of a smaller hill", "It stops at a local optimum"],
        ["Exactly on a hill's highest point", "It stops at once: no neighbour is better"],
        ["In the middle of a wide flat plateau", "It drifts sideways until it finds an edge"],
      ],
      why: "Hillclimbing always follows the hill it starts on. Equal moves are accepted, so a plateau lets it wander, while the top of a hill gives it nowhere better to go.",
    },
  ]);

  /* ======================================================================
     l3-landscape
     ====================================================================== */
  const miniFig = () => {
    const fn = {
      A: (t) => 1 - Math.pow(2 * t - 1, 2),
      B: (t) => 0.5 + 0.35 * Math.sin(t * 6.5 * Math.PI) * (0.6 + 0.4 * t),
      C: (t) => 0.25 + 0.6 * Math.max(0, 1 - Math.abs(t - 0.7) / 0.12),
      D: (t) => 0.15 + 0.5 * t + 0.7 * Math.exp(-Math.pow((t - 0.1) / 0.03, 2)),
    };
    return svg(
      460,
      150,
      Object.keys(fn)
        .map((k, i) => {
          const x0 = 12 + i * 112,
            pts = [];
          for (let j = 0; j <= 60; j++) {
            const t = j / 60;
            pts.push([x0 + t * 92, 104 - fn[k](t) * 76]);
          }
          return `<rect x="${x0 - 6}" y="8" width="104" height="104" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/>${path(pts, "var(--blue)", 3)}${tx(x0 + 46, 134, "Curve " + k, { f: "900 13px" })}`;
        })
        .join(""),
    );
  };
  const scatterFig = () => {
    const r = rng(7),
      pts = (smooth) =>
        Array.from({ length: 34 }, () => {
          const x = r();
          return [x, smooth ? Math.min(1, Math.max(0, x + (r() - 0.5) * 0.18)) : r()];
        });
    const panel = (k, x0, P) =>
      `<g data-pick="${k}"><rect x="${x0}" y="14" width="196" height="196" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${P.map(([x, y]) => `<circle cx="${(x0 + 12 + x * 172).toFixed(1)}" cy="${(198 - y * 172).toFixed(1)}" r="4" fill="var(--blue)"/>`).join("")}${tx(x0 + 98, 236, "Landscape " + k, { f: "900 13px" })}</g>`;
    return svg(460, 246, `${panel("A", 10, pts(true))}${panel("B", 254, pts(false))}`);
  };
  const intFig = () => {
    const F = [3, 7, 2, 6, 4, 8, 1, 5];
    return `<table class="t"><tr><th>x</th><th>bits</th><th>fitness</th></tr>${F.map((v, i) => `<tr><td>${i}</td><td>${i.toString(2).padStart(3, "0")}</td><td>${v}</td></tr>`).join("")}</table>`;
  };

  B.add("l3-landscape", [
    {
      type: "match",
      q: "Each panel plots fitness (height) against position. Match each curve to its landscape type.",
      fig: miniFig(),
      pairs: [
        ["Curve A", "Unimodal: one smooth peak"],
        ["Curve B", "Multimodal: many peaks"],
        ["Curve C", "Plateau: mostly flat, no hints"],
        ["Curve D", "Deceptive: slopes lead away from the best"],
      ],
      why: "A has one peak. B has several, so a climber gets stuck on whichever it meets. C is flat almost everywhere with one small hill. D rises steadily to the right, but the tallest point is the narrow spike on the left.",
    },
    {
      type: "pick",
      q: "Each dot is one solution: across is its fitness, up is the fitness of one of its neighbours. Click the landscape where hillclimbing should clearly beat random search.",
      fig: scatterFig(),
      a: "A",
      hint: "Hillclimbing works when a neighbour of a good solution is usually good too.",
      why: "In A, neighbours have nearly the same fitness as each other (dots hug the diagonal), so small steps from a good solution give good solutions. In B, a neighbour's fitness says nothing about yours, so hillclimbing has no slope to follow.",
    },
    {
      type: "slider",
      q: "A needle-in-a-haystack problem has 20 bits and exactly one good string, with every other string equally bad. Random search tries 1,000 strings a second. About how long does it take on average to hit the needle?",
      min: 0,
      max: 30,
      step: 1,
      ans: 9,
      tol: 3,
      unit: "minutes",
      hint: "2²⁰ is about a million strings. On average you search half of them: 500,000 tries ÷ 1,000 per second = 500 seconds.",
      why: "About 524,000 tries at 1,000 per second is roughly 520 seconds, nearly 9 minutes. With no slope to follow, nothing beats random search here, and each extra bit doubles the wait.",
    },
    {
      type: "order",
      q: "A hillclimber starts from a random solution on each landscape. Order the landscapes from the one where it is most likely to find the best solution to the one where it is least likely.",
      items: [
        "One smooth peak",
        "Three peaks of similar height",
        "A hundred small ridges",
        "Fitness picked at random for every solution",
      ],
      why: "On one smooth peak it always succeeds. With a few peaks it may land on the wrong one, but restarts help. A hundred ridges trap it almost every time. In a random landscape every move is a coin toss, so it does no better than random search.",
    },
    {
      type: "multi",
      q: "Integers 0 to 7 are stored as 3 bits. Fitness is in the table. Operator A moves x up or down by one (staying in 0 to 7). Operator B flips one bit. Select all statements that are true.",
      fig: intFig(),
      o: [
        "Under A there are four local optima: x = 1, 3, 5 and 7",
        "Under B, x = 5 is the only local optimum",
        "Under B, x = 1 is a local optimum",
        "The landscape is the same under A and B, since the fitness values are the same",
        "A climber at x = 7 using A cannot move, but using B it can reach x = 5",
      ],
      a: [0, 1, 4],
      hint: "Neighbours of 1 (001) under B are 0 (000), 3 (011) and 5 (101).",
      why: "Under A, x = 1, 3, 5 and 7 all beat both neighbours. Under B, x = 1 has a better neighbour (x = 5, fitness 8), and likewise the rest, leaving only x = 5. The operator defines the neighbours, so the same fitness values form a different landscape.",
    },
  ]);

  /* ======================================================================
     l3-neighbourhood
     ====================================================================== */
  const nbRowsFig = () => {
    const R = [
      ["n1", "swap places 1, 2", "BADEFC", 25],
      ["n2", "swap places 2, 3", "ADBEFC", 35],
      ["n3", "swap places 3, 4", "ABEDFC", 36],
      ["n4", "swap places 4, 5", "ABDFEC", 40],
      ["n5", "swap places 5, 6", "ABDECF", 36],
      ["n6", "swap places 6, 1", "CBDEFA", 34],
    ];
    return svg(
      460,
      292,
      `${tx(12, 20, "current tour ABDEFC has length 34 km. Its six neighbours:", { a: "start", f: "800 13px" })}${R.map(([k, op, t, l], i) => `<g data-pick="${k}"><rect x="12" y="${32 + i * 42}" width="436" height="36" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(26, 55 + i * 42, op, { a: "start", f: "700 13px", c: "var(--text-dim)" })}${tx(210, 56 + i * 42, t, { a: "start", f: "900 15px" })}${tx(340, 56 + i * 42, l + " km", { a: "start", f: "800 15px" })}</g>`).join("")}`,
    );
  };

  B.add("l3-neighbourhood", [
    {
      type: "slider",
      q: "Solutions are 8-bit strings. A mutation flips either one bit or two different bits. How many neighbours does each string have?",
      min: 0,
      max: 60,
      step: 1,
      ans: 36,
      tol: 6,
      unit: "neighbours",
      hint: "One flip: 8 ways. Two flips: 8 × 7 ÷ 2 = 28 pairs. Add them.",
      why: "8 single flips plus 28 pairs of flips gives 36. Allowing bigger moves widens the neighbourhood: fewer local optima, but each step has more to check.",
    },
    {
      type: "match",
      q: "Match each mutation operator to the number of neighbours it gives a solution.",
      pairs: [
        ["Flip one bit of a 7-bit string", "7"],
        ["Swap any two of 6 cities", "15"],
        ["Swap adjacent cities in a 6-city path (no wrap-around)", "5"],
        ["Flip exactly two bits of a 5-bit string", "10"],
      ],
      hint: "Choosing 2 positions from n gives n × (n − 1) ÷ 2.",
      why: "7 bits give 7 flips. Pairs of 6 cities: 6 × 5 ÷ 2 = 15. A 6-city path has 5 adjacent pairs. Pairs of 5 bits: 5 × 4 ÷ 2 = 10.",
    },
    {
      type: "pick",
      q: "Cost is minimised and a hillclimber accepts a neighbour that is no longer than the current tour. Click every neighbour it would accept.",
      fig: nbRowsFig(),
      a: ["n1", "n6"],
      hint: "Accept means 34 km or less. Remember the last row is a wrap-around swap of the last and first places.",
      why: "BADEFC (25 km) is better, and CBDEFA (34 km) ties with the current tour, so a hillclimber that accepts equal moves takes it. The others are longer and are rejected.",
    },
    {
      type: "bug",
      q: "This function should list each neighbour (swap of two cities) once, but it returns n × n tours, including unchanged copies and duplicates. Click the faulty line.",
      code: [
        "def neighbours(t):",
        "    out = []",
        "    for i in range(len(t)):",
        "        for j in range(len(t)):",
        "            m = t[:]",
        "            m[i], m[j] = m[j], m[i]",
        "            out.append(m)",
        "    return out",
      ],
      a: 3,
      why: "When j equals i nothing changes, and the pair (i, j) is repeated as (j, i). Starting the inner loop at i + 1 gives each of the n(n − 1)/2 swaps exactly once.",
    },
    {
      type: "order",
      q: "A tour or string has 10 positions. Order these mutation operators from the smallest neighbourhood to the largest.",
      items: [
        "Swap adjacent cities, 10 cities, wrapping around",
        "Swap any two cities, 10 cities",
        "Flip one or two bits of a 10-bit string",
        "Take one city out and put it back at any other place, 10 cities",
      ],
      hint: "10, then 10 × 9 ÷ 2, then 10 plus that, then 9 × 9 (each city has 9 new places, but moving a city one place right equals moving the next one a place left).",
      why: "Adjacent swaps give 10. Any two cities give 45. One or two bit flips give 10 + 45 = 55. Moving one city gives (10 − 1)² = 81 distinct tours, the biggest here.",
    },
  ]);

  /* ======================================================================
     l3-local
     ====================================================================== */
  const runFig = () => {
    const C = [20, 17, 19, 14, 16, 12, 15, 13],
      X = (i) => 70 + i * 50,
      Y = (c) => 214 - (c - 8) * 12;
    const dots = C.map(
      (c, i) =>
        `<g data-pick="s${i + 1}"><circle cx="${X(i)}" cy="${Y(c)}" r="13" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(X(i), Y(c) + 5, c, { f: "900 12px" })}${tx(X(i), 236, "step " + (i + 1), { f: "700 11px", c: "var(--text-faint)" })}</g>`,
    ).join("");
    return svg(
      460,
      250,
      `${ln(40, 222, 450, 222)}${ln(40, 20, 40, 222)}${path(
        C.map((c, i) => [X(i), Y(c)]),
        "var(--blue)",
        3,
      )}${dots}
      <text transform="translate(14,125) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">cost of current solution</text>`,
    );
  };

  B.add("l3-local", [
    {
      type: "pick",
      q: "A Monte Carlo search minimises cost. Each dot is the cost of its current solution after that step, and the run stops after step 8. Click the step whose solution the search should return.",
      fig: runFig(),
      a: "s6",
      why: "The search should return its best-so-far, the lowest cost seen anywhere in the run: 12 at step 6. The final current solution (13) is not the best, because accepting worse moves lets the current solution drift back up.",
    },
    {
      type: "slider",
      q: "A Monte Carlo search accepts a worse neighbour with probability 0.1. To cross a dip it needs two worse neighbours in a row to be accepted. On average, how many times must it set out into the dip before it gets across?",
      min: 0,
      max: 300,
      step: 10,
      ans: 100,
      tol: 30,
      unit: "attempts",
      hint: "0.1 × 0.1 = 0.01, which is 1 chance in 100.",
      why: "Each attempt succeeds with chance 0.1 × 0.1 = 0.01, so about 100 attempts are needed. Deeper dips get much worse: three worse steps in a row would take about 1,000. Small p crosses only shallow valleys.",
    },
    {
      type: "slider",
      q: "A tabu search looks at all 12 neighbours of its current solution on every step, and a Monte Carlo search looks at one. Both have a budget of 600 evaluations. How many steps does the tabu search make?",
      min: 0,
      max: 100,
      step: 2,
      ans: 50,
      tol: 8,
      unit: "steps",
      hint: "600 ÷ 12: think 60 ÷ 12 = 5, so 600 ÷ 12 = 50.",
      why: "Tabu pays for 12 evaluations per step, so 600 ÷ 12 = 50 steps, while Monte Carlo makes 600. Tabu's steps are better chosen, but there are far fewer of them.",
    },
    {
      type: "match",
      q: "Match each symptom in a local-search run to its most likely cause.",
      pairs: [
        ["It keeps stepping between the same two solutions", "The tabu list is too short, or missing"],
        ["At one step every neighbour is banned", "The tabu list is longer than the neighbourhood can bear"],
        [
          "The answer returned is worse than one seen halfway",
          "The code returned the current solution, not the best-so-far",
        ],
        [
          "Only one neighbour is looked at per step, and some worse moves are taken",
          "It is a Monte Carlo search, not tabu",
        ],
      ],
      why: "A tabu list that is too short lets the search walk straight back. One that is too long can ban the whole neighbourhood. Returning the current solution loses good solutions once worse moves are allowed.",
    },
    {
      type: "multi",
      q: "Select all statements about tabu search that are true.",
      o: [
        "It may move to a worse solution when every allowed neighbour is worse",
        "Solutions leave the tabu list after a while and can be visited again",
        "A solution that has been visited once is banned for the rest of the run",
        "A very short tabu list can still let it circle round a loop of several solutions",
        "It needs a population of solutions to work",
      ],
      a: [0, 1, 3],
      why: "Tabu search always takes the best allowed neighbour, even if worse. Entries expire, so nothing is banned for ever, and a list of only the last 2 solutions cannot stop a cycle of 4. It works with a single current solution.",
    },
  ]);

  /* ======================================================================
     l3-population
     ====================================================================== */
  const mtnFig = () => {
    const f = (x) => 0.55 * Math.exp(-Math.pow((x - 0.22) / 0.1, 2)) + 1.0 * Math.exp(-Math.pow((x - 0.78) / 0.13, 2));
    const X = (x) => 20 + x * 420,
      Y = (v) => 200 - v * 150,
      pts = [];
    for (let i = 0; i <= 100; i++) pts.push([X(i / 100), Y(f(i / 100))]);
    const P = { P1: 0.22, P2: 0.3, P3: 0.6 };
    return svg(
      460,
      236,
      `${ln(14, 200, 446, 200)}${path(pts, "var(--teal)", 4)}${Object.entries(P)
        .map(
          ([k, x]) =>
            `<g data-pick="${k}"><circle cx="${X(x)}" cy="${Y(f(x))}" r="14" fill="var(--panel)" stroke="var(--violet)" stroke-width="3"/>${tx(X(x), Y(f(x)) + 5, k.slice(1), { f: "900 14px" })}</g>`,
        )
        .join("")}${tx(230, 226, "position in the search space", { f: "700 12px", c: "var(--text-faint)" })}`,
    );
  };
  const barsFig = () => {
    const pop = [28, 30, 32, 33, 35],
      mu = [36, 29, 34];
    const cell = (id, x, y, v, c) =>
      `<g data-pick="${id}"><rect x="${x}" y="${y}" width="72" height="40" rx="10" fill="var(--panel)" stroke="${c}" stroke-width="2.5"/>${tx(x + 36, y + 26, v, { f: "900 16px" })}</g>`;
    return svg(
      460,
      188,
      `${tx(12, 20, "population (km)", { a: "start", c: "var(--text-faint)", f: "700 12px" })}${pop.map((v, i) => cell("p" + (i + 1), 12 + i * 88, 30, v, "var(--blue)")).join("")}
      ${tx(12, 112, "mutants, arriving in this order (km)", { a: "start", c: "var(--text-faint)", f: "700 12px" })}${mu.map((v, i) => cell("m" + (i + 1), 12 + i * 88, 122, v, "var(--amber)")).join("")}${["1st", "2nd", "3rd"].map((s, i) => tx(48 + i * 88, 178, s, { f: "700 12px", c: "var(--text-faint)" })).join("")}`,
    );
  };

  B.add("l3-population", [
    {
      type: "pick",
      q: "Fitness is height, and the dots are three members of a population. A greedy rule would replace the lowest member next. Click the member that is most valuable to keep if the aim is to reach the tallest peak.",
      fig: mtnFig(),
      a: "P3",
      why: "Members 1 and 2 are both on the smaller hill. Member 3 is low, but it sits at the foot of the much taller mountain, so small mutations can carry it up to the global best. Keeping poor-looking solutions preserves other regions of the search space.",
    },
    {
      type: "cat",
      q: "Which of these steps need a population, and which work with a single current solution?",
      buckets: ["Needs a population", "Works on one solution"],
      items: [
        ["Selecting parents, favouring the fitter", 0],
        ["Crossover of two parents", 0],
        ["Replacing the weakest member", 0],
        ["Mutating a copy", 1],
        ["Accepting a neighbour that is no worse", 1],
        ["Keeping a tabu list", 1],
      ],
      why: "Selecting, mixing and replacing 'the weakest' all compare members, so they need several. Mutation, the accept test and a tabu list act on one current solution, which is why hillclimbing and tabu search manage with one.",
    },
    {
      type: "pick",
      q: "A steady-state EA minimises tour length. Each mutant replaces the longest tour in the population only if it is shorter. The mutants arrive in the order shown. Click every tour that is in the population at the end.",
      fig: barsFig(),
      a: ["p1", "p2", "p3", "p4", "m2"],
      hint: "36 is not shorter than the longest (35). Then 29 replaces 35. Then 34 meets the new longest, 33.",
      why: "The 36 is rejected, the 29 replaces the 35, and the 34 is not shorter than the new longest (33), so it is rejected too. The population ends as 28, 29, 30, 32 and 33.",
    },
    {
      type: "slider",
      q: "Two parents have 20 bits and differ in exactly 6 places. A child copies each bit from either parent, chosen at random. How many different children are possible?",
      min: 0,
      max: 200,
      step: 4,
      ans: 64,
      tol: 16,
      unit: "children",
      hint: "Where the parents agree, the bit is fixed. Each of the 6 places that differ has 2 choices: 2, 4, 8, 16, 32, 64.",
      why: "The 14 shared bits are fixed, and the 6 differing places give 2⁶ = 64 combinations. Crossover can only recombine what the parents carry. A bit value that neither has needs mutation. If the parents are identical, there is exactly one child.",
    },
    {
      type: "mcq",
      q: "Three EA runs on a problem scored out of 100. Which diagnosis fits the table?",
      fig: `<table class="t"><tr><th></th><th>Tournament size</th><th>Bits flipped per child</th><th>Generation when all members matched</th><th>Best fitness</th></tr><tr><th>Run 1</th><td>2</td><td>1</td><td>90</td><td>96</td></tr><tr><th>Run 2</th><td>10</td><td>1</td><td>8</td><td>70</td></tr><tr><th>Run 3</th><td>2</td><td>15 of 100</td><td>never</td><td>58</td></tr></table>`,
      o: [
        "Run 2: a tournament of 10 made the members alike before good regions were found",
        "Run 1: it took longest to become alike, so it converged too early",
        "Run 3: heavy mutation made every member alike, which stalled progress",
        "No run: becoming alike quickly means that the search is efficient",
      ],
      a: 0,
      why: "Run 2 lost its diversity by generation 8 and got stuck at 70, premature convergence driven by strong selection. Run 1 converged slowly and scored best. Run 3 never converged, so heavy mutation kept it exploring but nothing was kept.",
    },
  ]);
})();

/* ===== bank-w-nic-3.js ===== */
/* NIC revision bank, second set of visual and varied questions, part 3.
   Lecture 4 (selection, replacement, pressure, mutation, crossover, the lab). Every figure is needed to answer. */
(function () {
  const B = NIC.bank;
  const txt = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;

  /* Bar chart. vals: numbers; ids: data-pick ids (optional); labels under bars; line: {y, label} horizontal marker. */
  function bars(
    vals,
    {
      ids = null,
      labels = null,
      max = null,
      w = 520,
      h = 210,
      line = null,
      colors = null,
      show = true,
      inside = false,
      fmt = (v) => v,
    } = {},
  ) {
    const m = max || Math.max(...vals) * 1.1,
      n = vals.length,
      bw = Math.min(54, (w - 40) / n - 12),
      gap = (w - 40) / n;
    const Y = (v) => h - 34 - (v / m) * (h - 66);
    const body = vals
      .map((v, i) => {
        const x = 20 + gap * i + (gap - bw) / 2;
        const r = `<rect x="${x}" y="${Y(v)}" width="${bw}" height="${h - 34 - Y(v)}" rx="6" fill="${colors ? colors[i] : "var(--blue)"}" stroke="var(--line-2)" stroke-width="2" fill-opacity=".85"/>`;
        const val = show
          ? inside
            ? txt(x + bw / 2, h - 44, fmt(v), { s: 12, c: "#fff" })
            : txt(x + bw / 2, Y(v) - 6, fmt(v), { s: 12 })
          : "";
        const lab = labels ? txt(x + bw / 2, h - 14, labels[i]) : "";
        return ids ? `<g data-pick="${ids[i]}">${r}${val}${lab}</g>` : `<g>${r}${val}${lab}</g>`;
      })
      .join("");
    const ln = line
      ? `<line x1="14" x2="${w - 10}" y1="${Y(line.y)}" y2="${Y(line.y)}" stroke="var(--rose)" stroke-width="3" stroke-dasharray="7 5"/>${txt(w - 12, Y(line.y) - 6, line.label, { a: "end", c: "var(--rose-ink)" })}`
      : "";
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="14" x2="${w - 10}" y1="${h - 34}" y2="${h - 34}" stroke="var(--line-2)" stroke-width="2"/>${body}${ln}</svg>`;
  }

  /* A row of genes. cells: [text, colour]. */
  function strip(cells, x, y, { cw = 34, ch = 34 } = {}) {
    return cells
      .map(
        (c, i) =>
          `<rect x="${x + i * cw}" y="${y}" width="${cw - 3}" height="${ch}" rx="6" fill="${c[1] || "var(--panel)"}" stroke="var(--line-2)" stroke-width="2"/>${txt(x + i * cw + (cw - 3) / 2, y + ch / 2 + 5, c[0], { c: c[2] || "var(--text)" })}`,
      )
      .join("");
  }

  /* Pie wheel. vals, labels; ids optional (pick). */
  function pie(vals, labels, cx, cy, r, ids, cols) {
    const tot = vals.reduce((a, b) => a + b, 0);
    let a0 = -Math.PI / 2;
    return vals
      .map((v, i) => {
        const a1 = a0 + (v / tot) * Math.PI * 2,
          big = a1 - a0 > Math.PI ? 1 : 0;
        const p = `M${cx} ${cy} L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 ${big} 1 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} Z`;
        const mid = (a0 + a1) / 2,
          lx = cx + r * 0.66 * Math.cos(mid),
          ly = cy + r * 0.66 * Math.sin(mid);
        a0 = a1;
        const g = `<path d="${p}" fill="${cols[i]}" fill-opacity=".75" stroke="var(--panel)" stroke-width="3"/>${txt(lx, ly + 5, labels[i], { s: 13 })}`;
        return ids ? `<g data-pick="${ids[i]}">${g}</g>` : `<g>${g}</g>`;
      })
      .join("");
  }

  const addSvg = (svg, extra) => svg.replace(/<\/svg>$/, extra + "</svg>");
  const tbl = (head, rows, pick) =>
    `<table class="t"><tr>${head.map((h, i) => `<th${i ? ' class="num"' : ""}>${h}</th>`).join("")}</tr>${rows.map((r, k) => `<tr${pick ? ` data-pick="${pick[k]}"` : ""}>${r.map((c, i) => `<${i ? 'td class="num"' : "td"}>${c}</${i ? "td" : "td"}>`).join("")}</tr>`).join("")}</table>`;

  /* ---------- l4-types ---------- */
  B.add("l4-types", [
    {
      type: "pick",
      q: "A generational GA keeps 2 elites. Here is the current population (fitness, higher is better). Tap every member that is certain to be in the next generation.",
      fig: bars([0.42, 0.9, 0.55, 0.8, 0.3, 0.65, 0.7, 0.5], {
        ids: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"],
        labels: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"],
        max: 1.05,
        fmt: (v) => v.toFixed(2),
      }),
      a: ["m2", "m4"],
      why: "Elitism copies the best 2 members unchanged: 0.90 (M2) and 0.80 (M4). Everyone else, even a decent 0.70, has to be picked as a parent and survive crossover and mutation to leave any trace, and the new population has no room for the old members.",
    },
    {
      type: "bug",
      q: "A generational GA with 2 elites should end each generation with a population of the same size. Tap the faulty line.",
      code: [
        "pop.sort(key=fitness, reverse=True)",
        "new = pop[:2]",
        "while len(new) < len(pop):",
        "    new.append(make_child(pop))",
        "pop = pop + new",
      ],
      a: 4,
      why: "pop + new glues the old population and the new one together, so the population doubles every generation and nothing is ever replaced. It should be pop = new. The elites are already inside new.",
    },
    {
      type: "match",
      q: "Match each design choice to its main consequence.",
      pairs: [
        ["Generational", "Children wait a whole generation before they can breed"],
        ["Steady-state", "A new child can be picked as a parent straight away"],
        ["No elitism", "The best fitness can fall from one generation to the next"],
        ["Elitism of 2", "The two best survive untouched into the next generation"],
      ],
      why: "Generational schemes build a full new population from the old one, so children cannot be parents until the next round. Steady-state inserts one child at a time into the live population. Elitism is what protects the best; without it, a bad round of crossover and mutation can lose it.",
    },
    {
      type: "slider",
      q: "A steady-state GA has a population of 100 and makes one child per step, replacing one member each time. After 50 steps, at most what percentage of the population can be new children?",
      min: 0,
      max: 100,
      step: 5,
      ans: 50,
      tol: 5,
      unit: "%",
      hint: "Each step replaces at most 1 member out of 100. 50 steps replace at most 50 members, which is half.",
      why: "One replacement per step means 50 steps touch at most 50 of the 100 slots. It is 'at most' because a slot can be overwritten twice, and a child may be rejected. This slow, gentle turnover is why steady-state GAs change the population smoothly rather than in big jumps.",
    },
    {
      type: "multi",
      q: "A generational GA has a population of 20 and 2 elites. Which statements are true?",
      o: [
        "18 new children are made and evaluated each generation",
        "The elites can still be picked as parents for the children",
        "The best fitness in the population can never fall",
        "The elites skip the breeding stage entirely, so they are never parents",
        "With 20 elites the GA would stand still, because no children are made",
      ],
      a: [0, 1, 2, 4],
      why: "Elites are copied into the new population (2 slots), leaving 18 slots for children. They still sit in the old population, so selection can pick them as parents. Because the best is copied, best fitness cannot fall. Setting elites equal to the population size leaves no room for children, so nothing ever changes.",
    },
  ]);

  /* ---------- l4-replacement ---------- */
  B.add("l4-replacement", [
    {
      type: "pick",
      q: "Replace-first-weaker, scanning right from slot 3 and wrapping round. The child has fitness 0.65 (dashed line). Tap the slot that gets overwritten.",
      fig: addSvg(
        bars([0.8, 0.4, 0.9, 0.7, 0.6, 0.5], {
          ids: ["s1", "s2", "s3", "s4", "s5", "s6"],
          labels: ["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5", "Slot 6"],
          max: 1.15,
          line: { y: 0.65, label: "child 0.65" },
          fmt: (v) => v.toFixed(2),
        }),
        txt(220, 20, "scan starts here ▼", { s: 12, c: "var(--amber-ink)" }),
      ),
      a: "s5",
      why: "Slot 3 (0.90) and slot 4 (0.70) are both stronger than the child, so the scan carries on. Slot 5 (0.60) is the first one weaker than 0.65, so it is overwritten and the scan stops. Slot 6 (0.50) is weaker still and would be the victim under replace-weakest, but this strategy never gets that far.",
    },
    {
      type: "mcq",
      q: "Two runs each used one replacement rule on the same problem. Which statement fits the evidence best?",
      fig: tbl(
        ["Run", "After 3,000 steps", "Mean fitness", "Distinct genomes of 50"],
        [
          ["P", "best 0.94", "0.93", "3"],
          ["Q", "best 0.86", "0.71", "28"],
        ],
      ),
      o: [
        "P is replace-weakest: it keeps culling the lowest, so the mean climbs and variety drains",
        "Q is replace-weakest: it shields weak members, so many different genomes stay alive",
        "P is replace-first-weaker: random victims keep the mean high but variety low",
        "Neither can be told apart, because replacement rules never change variety",
      ],
      a: 0,
      why: "Replace-weakest always removes the lowest member, which is strong selection pressure: the mean rises right up to the best and the population fills with near-copies (3 genomes). Replace-first-weaker picks a victim by scan position, so weaker members linger: lower mean, more variety (28), and a slower best.",
    },
    {
      type: "multi",
      q: "Which statements about the two replacement rules are true?",
      o: [
        "Replace-first-weaker can overwrite the current best, if the child is better still",
        "Replace-weakest can never overwrite the current best (population of 2 or more)",
        "Under replace-first-weaker the best fitness in the population still never falls",
        "Replace-weakest picks its victim at random, so it needs no comparisons",
        "Replace-first-weaker can insert a child that is weaker than every member",
      ],
      a: [0, 1, 2],
      why: "If the child beats the best, the best is 'weaker than the child' and may be the first the scan meets, but the child is better still, so best fitness only goes up. Replace-weakest removes the lowest, never the best. It needs a full pass to find the weakest, not a random pick. And a child weaker than everyone has no weaker member to replace, so it is rejected.",
    },
    {
      type: "slider",
      q: "A population of 1,000 uses replace-weakest, which looks at every member to find the weakest. About how many members are looked at in total over 5,000 steps?",
      min: 0,
      max: 10,
      step: 1,
      ans: 5,
      tol: 1,
      unit: " million",
      hint: "1,000 looks per step × 5,000 steps = 5,000,000.",
      why: "1,000 × 5,000 = 5 million. That is the price of strong pressure: replace-first-weaker usually stops after a couple of looks, so on big populations it is far cheaper per step (a heap or a tracked 'weakest' pointer can reduce the cost, but the plain scan is linear).",
    },
    {
      type: "bug",
      q: "Replace-first-weaker should scan the slots and overwrite the first member weaker than the child, then stop. Tap the faulty line.",
      code: [
        "for i in range(P):",
        "    if fit[i] < child_fit:",
        "        pop[i] = child",
        "        fit[i] = child_fit",
        "    break",
      ],
      a: 4,
      why: "The break is indented under the for loop, not under the if, so the loop always stops after slot 1 whether or not it was replaced. Most children would never be inserted. The break belongs inside the if, after the two assignments.",
    },
  ]);

  /* ---------- l4-pressure ---------- */
  const takeFig = (() => {
    const w = 520,
      h = 230,
      X = (g) => 50 + g * 60,
      Y = (p) => 190 - p * 150;
    const curves = [
      ["A", [0.02, 0.078, 0.276, 0.726, 0.994, 1, 1, 1], "var(--teal)"],
      ["B", [0.02, 0.149, 0.726, 1, 1, 1, 1, 1], "var(--blue)"],
      ["C", [0.02, 0.04, 0.078, 0.149, 0.276, 0.476, 0.726, 0.925], "var(--amber)"],
    ];
    const paths = curves
      .map(([id, v, c]) => {
        const d = v.map((p, g) => `${g ? "L" : "M"}${X(g)} ${Y(p)}`).join(" ");
        return `<g data-pick="${id}"><path d="${d}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/></g>`;
      })
      .join("");
    const leg = curves
      .map(
        ([id, , c], i) =>
          `<circle cx="${300 + i * 70}" cy="14" r="7" fill="${c}"/>${txt(312 + i * 70, 19, id, { a: "start" })}`,
      )
      .join("");
    const ticks = [0, 1, 2, 3, 4, 5, 6, 7].map((g) => txt(X(g), 212, g, { s: 11, c: "var(--text-dim)" })).join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="40" x2="${w - 20}" y1="190" y2="190" stroke="var(--line-2)" stroke-width="2"/>${txt(10, 14, "Share of population that copies the best", { a: "start", c: "var(--text-dim)", s: 12 })}${leg}${paths}${ticks}${txt(490, 226, "generation", { a: "end", s: 11, c: "var(--text-faint)" })}${txt(36, 44, "100%", { a: "end", s: 11, c: "var(--text-dim)" })}</svg>`;
  })();
  B.add("l4-pressure", [
    {
      type: "pick",
      q: "Three runs start with 2% of the population as copies of the best individual (no mutation, no crossover). They use tournament sizes 2, 4 and 8. Tap the curve of the size 8 run.",
      fig: takeFig,
      a: "B",
      why: "A bigger tournament means each pick is more likely to include a good entrant, so copies of the best spread faster. Size 8 takes over in about 3 generations (B), size 4 needs about 5 (A) and size 2 is still not complete after 7 (C). Fast takeover is exactly what high selection pressure means.",
    },
    {
      type: "order",
      q: "Put these selection rules from the LOWEST to the HIGHEST selection pressure.",
      items: [
        "Random selection (tournament of 1)",
        "Binary tournament (size 2)",
        "Tournament of size 5",
        "Always pick the single best member",
      ],
      why: "Size 1 ignores fitness altogether. Each extra entrant raises the chance that a strong individual is in the draw. Always taking the best is the extreme end: the rest of the population never breeds at all.",
    },
    {
      type: "match",
      q: "Match each symptom to the most sensible fix.",
      pairs: [
        ["Everyone is a copy of one genome by generation 15", "Lower the tournament size or raise the mutation rate"],
        ["Best and mean both crawl, with plenty of variety left", "Raise the tournament size"],
        ["The roulette wheel is almost flat late in the run", "Switch to rank selection"],
        ["Best fitness dips between generations", "Add elitism"],
      ],
      why: "Too much pressure kills variety, so soften it. Too little pressure wastes variety, so tighten it. Roulette flattens as fitnesses converge, and rank selection keeps its spread. A dipping best is a loss of the champion, and elitism copies it forward.",
    },
    {
      type: "bug",
      q: "A self-adjusting EA should loosen selection when the population has almost converged. Tap the faulty line.",
      code: [
        "div = len(set(pop)) / len(pop)",
        "if div < 0.1:          # almost everyone identical",
        "    t = t + 1",
        "return tournament(pop, t)",
      ],
      a: 2,
      why: "When diversity is below 10%, selection is already too strong, and a bigger t makes it stronger. It should reduce t (for example t = max(2, t - 1)). The comparison is right; the direction of the change is wrong.",
    },
    {
      type: "slider",
      q: "Entrants for a size 3 tournament are drawn with replacement from a large population. About what percentage of the time does the winner come from the better half?",
      min: 50,
      max: 100,
      step: 5,
      ans: 87.5,
      tol: 5,
      unit: "%",
      hint: "The winner is from the worse half only if all 3 entrants are. (1/2) × (1/2) × (1/2) = 1/8.",
      why: "All three entrants must be from the worse half for the winner to be from it: 1/8 = 12.5%. So the better half supplies 87.5% of winners. Even a modest tournament size is a strong filter.",
    },
  ]);

  /* ---------- l4-roulette ---------- */
  const stripFig = (() => {
    const x0 = 40,
      u = 44,
      segs = [
        ["A", 3, "var(--teal)"],
        ["B", 1, "var(--blue)"],
        ["C", 4, "var(--amber)"],
        ["D", 2, "var(--violet)"],
      ];
    let c = 0;
    const body = segs
      .map(([id, v, col]) => {
        const x = x0 + c * u,
          s = `<g data-pick="${id}"><rect x="${x}" y="50" width="${v * u}" height="56" fill="${col}" fill-opacity=".8" stroke="var(--line-2)" stroke-width="2"/>${txt(x + (v * u) / 2, 84, id + " " + v, { s: 14, c: "#fff" })}</g>`;
        c += v;
        return s;
      })
      .join("");
    const ticks = [0, 3, 4, 8, 10].map((t) => txt(x0 + t * u, 128, t, { s: 12, c: "var(--text-dim)" })).join("");
    const mx = x0 + 3.4 * u;
    return `<svg viewBox="0 0 520 150" style="max-height:150px">${txt(x0, 16, "The wheel laid flat: slice size = fitness", { a: "start", c: "var(--text-dim)", s: 12 })}${body}${ticks}<path d="M${mx} 46 l-7 -12 h14 z" fill="var(--rose)"/>${txt(mx, 30, "random point 3.4", { a: "start", c: "var(--rose-ink)", s: 12 }).replace(`x="${mx}"`, `x="${mx + 12}"`)}</svg>`;
  })();
  const wheelsFig = (() => {
    const cols = ["var(--teal)", "var(--blue)", "var(--amber)", "var(--violet)"];
    const lab = (a) => a.map((v, i) => "F" + (i + 1) + " " + v);
    return `<svg viewBox="0 0 520 250" style="max-height:250px">${txt(130, 18, "Generation 2", { s: 15 })}<g data-pick="early">${pie([1, 2, 5, 8], lab([1, 2, 5, 8]), 130, 135, 95, null, cols)}</g>${txt(390, 18, "Generation 80", { s: 15 })}<g data-pick="late">${pie([91, 92, 95, 98], lab([91, 92, 95, 98]), 390, 135, 95, null, cols)}</g></svg>`;
  })();
  B.add("l4-roulette", [
    {
      type: "pick",
      q: "Individuals A to D sit on the wheel in that order, laid out flat below (slice size = fitness). The random point lands at 3.4. Tap the individual that is selected.",
      fig: stripFig,
      a: "B",
      why: "The running totals are A 0 to 3, B 3 to 4, C 4 to 8 and D 8 to 10. The point 3.4 sits in the narrow B slice, even though B has the smallest fitness. A small slice is picked rarely (1 in 10 spins), not never.",
    },
    {
      type: "pick",
      q: "The same roulette selection is used throughout one run. Tap the wheel where selection pressure has all but vanished.",
      fig: wheelsFig,
      a: "late",
      why: "In generation 80 every slice is about a quarter, so each individual is picked about equally often: selection is nearly random. In generation 2 the best owns about half the wheel. As a population converges, fitness ratios shrink towards 1, which is why roulette stalls late in a run and rank selection helps.",
    },
    {
      type: "match",
      q: "Match each change to what it does to roulette selection probabilities.",
      pairs: [
        ["Multiply every fitness by 10", "Nothing changes"],
        ["Add 100 to every fitness", "The wheel gets flatter"],
        ["Square every fitness (all positive)", "The best gets a bigger share"],
        ["Use 1 divided by tour length for a TSP", "Shorter tours get bigger slices"],
      ],
      why: "Probabilities are shares of the total, so scaling cancels out. Adding a constant pushes every share towards equal. Squaring exaggerates differences (3 versus 2 becomes 9 versus 4). For minimisation you need a transform that rewards small values, such as 1 divided by the length.",
    },
    {
      type: "bug",
      q: "This builds the running totals (the wheel edges) for roulette selection. Tap the faulty line.",
      code: ["cum = []", "running = 0", "for ind in pop:", "    running = ind.fit", "    cum.append(running)"],
      a: 3,
      why: "running = ind.fit overwrites the total each time, so cum just repeats the fitnesses and is not increasing. It must add: running += ind.fit. Only then do the entries mark the right edges of the slices.",
    },
    {
      type: "mcq",
      q: "In 1,000 roulette spins on four individuals A, B, C, D the picks were as shown. Which fitness values for A, B, C, D could have produced them?",
      fig: bars([405, 297, 208, 90], { labels: ["A", "B", "C", "D"], max: 480, h: 200 }),
      o: ["4, 3, 2, 1", "10, 5, 3, 2", "4, 4, 1, 1", "1, 2, 3, 4"],
      a: 0,
      hint: "Shares of about 40, 30, 20 and 10 per cent are in the ratio 4 : 3 : 2 : 1.",
      why: "The picks are about 41%, 30%, 21% and 9%, the ratio 4 : 3 : 2 : 1. Fitnesses 10, 5, 3, 2 would give A half the picks, 4, 4, 1, 1 would make A and B equal, and 1, 2, 3, 4 would put D on top.",
    },
  ]);

  /* ---------- l4-rank ---------- */
  B.add("l4-rank", [
    {
      type: "slider",
      q: "Linear rank selection on 10 individuals (ranks 1 to 10). About what percentage chance does the best individual have of being picked each time?",
      min: 0,
      max: 40,
      step: 2,
      ans: 18,
      tol: 4,
      unit: "%",
      hint: "Ranks 1 to 10 add up to 55, which is about 50. So 10 out of about 55 is roughly 1 in 5.",
      why: "The best has rank 10 out of a total of 1 + 2 + … + 10 = 55, so 10/55 ≈ 18%. This holds whether the best fitness is 11 or 11 million: rank selection only looks at the order.",
    },
    {
      type: "pick",
      q: "Five individuals with fitness 50, 49, 48, 10 and 1. The selection method is switched from roulette to linear rank. Tap every individual whose chance of being picked goes DOWN.",
      fig: bars([50, 49, 48, 10, 1], { ids: ["A", "B", "C", "D", "E"], labels: ["A", "B", "C", "D", "E"], max: 58 }),
      a: ["B", "C"],
      hint: "Roulette shares are fitness ÷ 158, about 32, 31, 30, 6 and 1 per cent. Rank shares are 5, 4, 3, 2 and 1 out of 15: about 33, 27, 20, 13 and 7 per cent.",
      why: "Roulette gives A, B and C about 32%, 31% and 30%, and D and E 6% and 0.6%. Linear rank gives 33%, 27%, 20%, 13% and 7%. B and C lose share because the near-identical top fitnesses are spread out, D and E gain, and A nudges up from 31.6% to 33.3%.",
    },
    {
      type: "multi",
      q: "In which populations would swapping roulette for linear rank selection change the selection probabilities a lot?",
      o: [
        "One individual is 1,000 times fitter than all the others",
        "Fitnesses are 10, 20, 30 and 40",
        "Fitnesses are 90, 91, 92 and 93",
        "Every fitness is multiplied by 5",
        "Fitnesses are 2, 4, 6 and 8",
      ],
      a: [0, 2],
      why: "A huge outlier takes nearly the whole roulette wheel but only its rank slice under rank selection. Near-identical fitnesses give an almost flat wheel, while ranks still spread 10%, 20%, 30% and 40%. For 10, 20, 30, 40 (and 2, 4, 6, 8) the fitness shares happen to be 10%, 20%, 30%, 40%, the same as the rank shares, and multiplying by 5 changes neither.",
    },
    {
      type: "bug",
      q: "Rank-based selection with an exponent b should turn the weights into probabilities. Tap the faulty line.",
      code: [
        "ranks = list(range(1, P + 1))",
        "weights = [r ** b for r in ranks]",
        "total = sum(ranks)",
        "probs = [w / total for w in weights]",
      ],
      a: 2,
      why: "The probabilities must be divided by the sum of the weights, not the sum of the plain ranks. With b = 2 and 3 individuals the weights are 1, 4, 9 (total 14), but the code divides by 6, giving probabilities that add up to more than 1. It should be total = sum(weights).",
    },
  ]);

  /* ---------- l4-tournament ---------- */
  B.add("l4-tournament", [
    {
      type: "slider",
      q: "Tournaments of size 4 draw their entrants with replacement from a huge population. About what percentage of winners come from the worse half?",
      min: 0,
      max: 50,
      step: 1,
      ans: 6,
      tol: 2,
      unit: "%",
      hint: "All 4 entrants must be from the worse half: (1/2) × (1/2) × (1/2) × (1/2) = 1/16.",
      why: "The winner is from the worse half only if every entrant is, which is 1/16 ≈ 6%. With size 2 it would be 1/4 = 25%, and with size 1 it would be 50% (no selection at all).",
    },
    {
      type: "pick",
      q: "Tournaments of size 3, with replacement, pick the highest fitness. Here is a log of five of them. Tap the one tournament that cannot be right.",
      fig: tbl(
        ["#", "Entrants", "Winner"],
        [
          ["1", "4, 9, 6", "9"],
          ["2", "7, 7, 2", "7"],
          ["3", "5, 8, 3", "5"],
          ["4", "6, 2, 6", "6"],
          ["5", "1, 3, 9", "9"],
        ],
        ["t1", "t2", "t3", "t4", "t5"],
      ),
      a: "t3",
      why: "In tournament 3 the entrant with fitness 8 beats the 5, so 5 cannot be the winner. The repeated entrants in tournaments 2 and 4 are fine, because drawing with replacement lets the same individual enter twice.",
    },
    {
      type: "match",
      q: "Match each tournament setting to its effect.",
      pairs: [
        ["t = 1", "Same as picking at random"],
        ["t = 2", "Gentle pressure; weak individuals still win sometimes"],
        ["t = 20 in a population of 25", "The best wins almost every time"],
        ["t = 3, but the fitnesses are all doubled", "No change at all"],
      ],
      why: "One entrant means no contest. Two entrants favour the better one but leave plenty of chances for the weaker. A tournament that includes most of the population nearly always contains the best. Tournaments compare fitnesses, so doubling them (any order-preserving change) changes nothing.",
    },
    {
      type: "mcq",
      q: "500 tournaments were run on five ranked individuals, entrants drawn with replacement. The wins by rank are shown. Which tournament size was used?",
      fig: bars([244, 148, 76, 28, 4], { labels: ["Best", "2nd", "3rd", "4th", "Worst"], max: 290, h: 200 }),
      o: ["1", "2", "3", "6"],
      a: 2,
      hint: "With size t, the best wins unless all entrants avoid it: 1 − (4/5)^t. At t = 3, (4/5)^3 ≈ 0.51.",
      why: "The best wins 244 of 500, about 49%. For t = 3 the chance is 1 − 0.8³ ≈ 49%. Size 1 would give about 100 wins to everyone, size 2 would give the best about 36%, and size 6 would give the best about 74%.",
    },
    {
      type: "multi",
      q: "Which statements about tournament selection are true?",
      o: [
        "Selecting a parent needs the fitness of only the entrants, not the whole population",
        "With replacement, a size 2 tournament can contain the same individual twice",
        "Doubling every fitness can change who wins",
        "For minimisation, picking the lowest cost in the tournament works unchanged",
        "The worst individual can never win",
      ],
      a: [0, 1, 3],
      why: "Only the entrants are compared, which is why tournaments suit huge or distributed populations. Drawing with replacement allows duplicates. Only the order matters, so doubling does nothing. Minimising just flips which entrant is kept. And the worst can win if it is drawn alone (for example both entrants of a binary tournament), a chance of 1/N² for a population of N.",
    },
  ]);

  /* ---------- l4-mutation ---------- */
  const gaussFig = (() => {
    const x0 = 40,
      u = 44,
      base = 150,
      hh = 100;
    const curve = (s, c, id) => {
      const pts = [];
      for (let x = 0; x <= 10; x += 0.25)
        pts.push(`${(x0 + x * u).toFixed(1)} ${(base - hh * Math.exp(-((x - 5) ** 2) / (2 * s * s))).toFixed(1)}`);
      const d = "M" + pts.join(" L");
      return `<g data-pick="${id}"><path d="${d}" fill="none" stroke="transparent" stroke-width="20" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/></g>`;
    };
    const ticks = [0, 5, 9, 10].map((t) => txt(x0 + t * u, base + 18, t, { s: 12, c: "var(--text-dim)" })).join("");
    const cols = ["var(--teal)", "var(--blue)", "var(--amber)"],
      names = ["A", "B", "C"];
    const leg = [
      ["σ = 0.3", 0],
      ["σ = 1.5", 1],
      ["σ = 4", 2],
    ];
    return `<svg viewBox="0 0 520 200" style="max-height:200px"><line x1="30" x2="490" y1="${base}" y2="${base}" stroke="var(--line-2)" stroke-width="2"/>${curve(4, cols[2], "C")}${curve(1.5, cols[1], "B")}${curve(0.3, cols[0], "A")}${ticks}<line x1="${x0 + 9 * u}" x2="${x0 + 9 * u}" y1="40" y2="${base}" stroke="var(--rose)" stroke-width="3" stroke-dasharray="6 4"/>${txt(x0 + 9 * u, 34, "better peak", { s: 12, c: "var(--rose-ink)" })}${txt(x0 + 5 * u, 34, "parent", { s: 12, c: "var(--text-dim)" })}${leg.map(([l, i]) => `<circle cx="${40 + i * 110}" cy="188" r="6" fill="${cols[i]}"/>${txt(52 + i * 110, 193, names[i] + ": " + l, { a: "start", s: 12 })}`).join("")}</svg>`;
  })();
  const bitRow = (label, bits, y) =>
    txt(10, y + 21, label, { a: "start", s: 13 }) +
    strip(
      bits.split("").map((b) => [b]),
      80,
      y,
      { cw: 32, ch: 30 },
    );
  const bitFig = (() => {
    const rows = [
      ["Parent", "1011001010"],
      ["Child A", "1011001010"],
      ["Child B", "1011101010"],
      ["Child C", "1011001011"],
      ["Child D", "0010001110"],
    ];
    const body = rows
      .map(([l, b], i) =>
        i === 0
          ? bitRow(l, b, 8)
          : `<g data-pick="${l.slice(-1)}"><rect x="4" y="${46 + (i - 1) * 40}" width="402" height="36" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${bitRow(l, b, 49 + (i - 1) * 40)}</g>`,
      )
      .join("");
    return `<svg viewBox="0 0 410 210" style="max-height:210px;max-width:430px">${body}</svg>`;
  })();
  B.add("l4-mutation", [
    {
      type: "pick",
      q: "A search is stuck on a local peak at 5, and the better peak is at 9. Each curve shows how far a Gaussian mutation with that σ is likely to move the gene (curves are scaled to the same height). Tap the one that gives the best chance of landing at the better peak in one mutation.",
      fig: gaussFig,
      a: "C",
      why: "At 9 (four units away) the σ = 0.3 and σ = 1.5 curves are essentially zero, while σ = 4 still has a real chance (about 6% to land within 0.5 of 9). The price: a wide curve rarely makes small, precise improvements. That is the trade-off between exploring and fine tuning.",
    },
    {
      type: "multi",
      q: "Bit-flip mutation flips each bit independently with probability 1/L on an L-bit string. Which statements are true?",
      o: [
        "A child usually differs from its parent by about one bit on average",
        "Most children are exact copies of the parent, well over half",
        "Any bit string can in principle be reached from any parent in one step",
        "A child with 3 or more flips is rare, under 10% of children",
        "Raising the rate to 10/L keeps children very close to their parents",
      ],
      a: [0, 2, 3],
      why: "The average number of flips is L × 1/L = 1. About 37% of children are exact copies and 37% have one flip, 18% have two, and 3 or more is only about 8%. In principle every string is reachable, just with a vanishing probability. A rate of 10/L would mean about 10 flips, so children would be far from the parent.",
    },
    {
      type: "bug",
      q: "Gaussian mutation should nudge one gene a little. Tap the faulty line.",
      code: [
        "def mutate(parent, sigma):",
        "    child = parent[:]",
        "    i = random.randrange(len(child))",
        "    child[i] = random.gauss(0, sigma)",
        "    return child",
      ],
      a: 3,
      why: "The gene is replaced by a fresh number near 0, wiping out its old value, which is a big jump rather than a nudge. It should add noise to the existing value: child[i] += random.gauss(0, sigma).",
    },
    {
      type: "pick",
      q: "Each bit of the parent is flipped independently with probability 1 in 10. Tap the child string that this mutation is MOST likely to produce (this exact string).",
      fig: bitFig,
      a: "A",
      hint: "Each unflipped bit has a 0.9 chance and each flipped bit has a 0.1 chance. Count how many bits differ from the parent.",
      why: "A is identical to the parent, so no bit flips: 0.9 to the power 10, about 35%. B and C each need one exact flip (about 3.9% each), and D differs in three bits (about 0.05%). A single specific string with fewer changes is always more likely under a low mutation rate, so staying put is the most common single outcome.",
    },
    {
      type: "pick",
      q: "A hill climber tried four step sizes. Progress per mutation is the chance of an improvement multiplied by the average gain when it works. Tap the step size with the best progress.",
      fig: tbl(
        ["Step size (sigma)", "Chance a mutant is better", "Average gain when better"],
        [
          ["0.01", "50%", "0.01"],
          ["0.1", "30%", "0.1"],
          ["1", "10%", "0.2"],
          ["10", "1%", "0.5"],
        ],
        ["r1", "r2", "r3", "r4"],
      ),
      a: "r2",
      hint: "Multiply the two columns: 50% of 0.01 is 0.005. 30% of 0.1 is 0.03.",
      why: "The products are 0.005, 0.03, 0.02 and 0.005. Tiny steps succeed often but gain almost nothing. Huge steps gain a lot but almost never succeed. The best step size sits in the middle, which is the idea behind adapting σ during a run.",
    },
  ]);

  /* ---------- l4-crossover ---------- */
  const blockFig = (() => {
    const x0 = 50,
      cw = 50;
    const p1 = [0, 1, 1, 1, 0, 0, 0, 0],
      p2 = [0, 0, 0, 0, 0, 1, 1, 1];
    const row = (g, y, lab, good) =>
      txt(8, y + 26, lab, { a: "start", s: 13 }) +
      g
        .map(
          (v, i) =>
            `<rect x="${x0 + 50 + i * cw}" y="${y}" width="${cw - 4}" height="${cw - 8}" rx="8" fill="${good.includes(i) ? "var(--teal)" : "var(--bg-2)"}" fill-opacity="${good.includes(i) ? ".85" : "1"}" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + 50 + i * cw + (cw - 4) / 2, y + 26, v, { c: good.includes(i) ? "#fff" : "var(--text)", s: 14 })}`,
        )
        .join("");
    const gaps = Array.from(
      { length: 7 },
      (_, i) =>
        `<g data-pick="g${i + 1}"><rect x="${x0 + 50 + (i + 1) * cw - 18}" y="112" width="26" height="36" rx="7" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(x0 + 50 + (i + 1) * cw - 5, 135, "g" + (i + 1), { s: 12, c: "var(--text-dim)" })}</g>`,
    ).join("");
    return `<svg viewBox="0 0 520 160" style="max-height:160px">${row(p1, 8, "P1", [1, 2, 3])}${row(p2, 58, "P2", [5, 6, 7])}${gaps}</svg>`;
  })();
  const cutKids = (() => {
    const kids = [
      ["11000111", "k1"],
      ["00111100", "k2"],
      ["10100111", "k3"],
      ["11111100", "k4"],
    ];
    return `<svg viewBox="0 0 440 215" style="max-height:215px;max-width:480px">${txt(8, 26, "P1", { a: "start" })}${strip(
      "11111111".split("").map((c) => [c, "var(--blue)", "#fff"]),
      70,
      8,
      { cw: 34, ch: 28 },
    )}${txt(8, 62, "P2", { a: "start" })}${strip(
      "00000000".split("").map((c) => [c, "var(--amber)", "#fff"]),
      70,
      44,
      { cw: 34, ch: 28 },
    )}${kids
      .map(
        ([s, id], i) =>
          `<g data-pick="${id}"><rect x="4" y="${82 + i * 33}" width="352" height="30" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(30, 103 + i * 33, "Child " + (i + 1), { s: 12 })}${strip(
            s.split("").map((c) => [c]),
            70,
            84 + i * 33,
            { cw: 34, ch: 26 },
          )}</g>`,
      )
      .join("")}</svg>`;
  })();
  B.add("l4-crossover", [
    {
      type: "slider",
      q: "1-point crossover on 8 genes picks one of the 7 gaps uniformly at random. About what percentage of the time are genes 3 and 4 (neighbours) split between the two parents?",
      min: 0,
      max: 100,
      step: 2,
      ans: 14,
      tol: 5,
      unit: "%",
      hint: "Genes 3 and 4 are split only if the cut is in the one gap between them. That is 1 gap out of 7.",
      why: "Only the single gap between genes 3 and 4 separates them: 1/7 ≈ 14%. Genes 1 and 8, at opposite ends, are split every time. This is positional bias: 1-point crossover keeps neighbours together, which helps when related genes sit next to each other and hurts when they do not.",
    },
    {
      type: "pick",
      q: "Parent 1 has a good block (the three green genes). So does parent 2. Tap every cut gap where 1-point crossover (parent 1 before the cut, parent 2 after it) gives a child with BOTH good blocks.",
      fig: blockFig,
      a: ["g4", "g5"],
      why: "Genes 2 to 4 must come from parent 1, so the cut must be at gap g4 or later. Genes 6 to 8 must come from parent 2, so the cut must be at gap g5 or earlier. Only g4 and g5 satisfy both. Cuts inside a block, such as g2, g3, g6 and g7, break one.",
    },
    {
      type: "match",
      q: "Match each operator to its trait.",
      pairs: [
        ["1-point", "Keeps long runs of neighbouring genes together"],
        ["Uniform", "Any two genes are equally likely to be split"],
        ["2-point", "Swaps a block in the middle"],
        ["Mask of all 0s", "The child is a copy of parent 1"],
      ],
      why: "A single cut leaves two long blocks. Uniform crossover tosses a coin per gene, so position does not matter. Two cuts swap the segment between them. A mask that never takes parent 2's genes just clones parent 1.",
    },
    {
      type: "slider",
      q: "Two parents differ at exactly 3 of their 10 genes. How many different children can uniform crossover (a free choice of parent at every gene) produce?",
      min: 0,
      max: 16,
      step: 1,
      ans: 8,
      tol: 1,
      unit: " children",
      hint: "The 7 genes where the parents agree give no choice. Each of the 3 differing genes has 2 options: 2 × 2 × 2.",
      why: "Where parents agree, the child's gene is fixed. At each of the 3 differing genes it can come from either parent: 2³ = 8 children. Crossover can only recombine what the parents already have; it never creates a new gene value.",
    },
    {
      type: "pick",
      q: "Parents are 11111111 and 00000000. Tap the child that cannot be made by 2-point crossover.",
      fig: cutKids,
      a: "k3",
      why: "2-point crossover cuts twice, so the source changes at most twice along the child. Child 3 (10100111) switches parent four times: 1, 0, 1, 0, 1 across the string. Child 1 changes twice, child 2 changes twice (a swapped middle) and child 4 changes once, which is a 2-point cut at the very end.",
    },
  ]);

  /* ---------- l4-lab ---------- */
  const divFig = (() => {
    const cols = [
      ["t = 1", 10, 99, "var(--teal)"],
      ["t = 3", 5, 112, "var(--blue)"],
      ["t = 30", 1, 135, "var(--rose)"],
    ];
    const w = 520,
      h = 230;
    const body = cols
      .map(([l, d, b, c], i) => {
        const x = 60 + i * 150,
          bh = d * 11;
        return `<g data-pick="${l.replace(/\D/g, "")}"><rect x="${x - 10}" y="28" width="120" height="172" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/><rect x="${x + 10}" y="${170 - bh}" width="60" height="${bh}" rx="6" fill="${c}" fill-opacity=".85" stroke="var(--line-2)" stroke-width="2"/>${txt(x + 40, 164 - bh, "div " + d + "%", { s: 12 })}${txt(x + 40, 188, l, { s: 14 })}${txt(x + 40, 18, "best " + b + "/144", { s: 12, c: "var(--text-dim)" })}</g>`;
      })
      .join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${body}${txt(260, 222, "Population of 30, after 600 evaluations (average of 10 runs)", { s: 11, c: "var(--text-faint)" })}</svg>`;
  })();
  B.add("l4-lab", [
    {
      type: "pick",
      q: "In the lab, algorithm 1 (steady-state, mutation only, population 30) was run with three tournament sizes. Diversity and best fitness after 600 evaluations are shown. Tap the setting that is most at risk of premature convergence.",
      fig: divFig,
      a: "30",
      why: "With t = 30 almost every pick is the current best, so diversity has fallen to 1%: the population is nearly all copies. Its best score is highest so far, but with no variety left only rare mutations can improve it, so on a harder target it would stall. t = 1 keeps variety but climbs slowly.",
    },
    {
      type: "mcq",
      q: "These lab runs used algorithm 1 on the heart picture (144 pixels), typical runs, up to 20,000 evaluations. Why did the 0.05 run not reach 144?",
      fig: tbl(
        ["Mutation per bit", "Flips per child", "Result"],
        [
          ["0.0001", "0.01", "stuck at 135"],
          ["1/144", "1", "144 after about 3,000 evaluations"],
          ["0.05", "7.2", "stuck at 138"],
          ["0.2", "29", "stuck at 109"],
        ],
      ),
      o: [
        "A child flips about 7 bits, so it usually breaks more correct pixels than it fixes",
        "Seven flips per child means too few new pictures are tried, so exploration is poor",
        "A population of 30 is too small to hold the extra variety that this rate creates",
        "Tournament selection stops working as soon as the mutation rate passes 1 flip",
      ],
      a: 0,
      why: "Near the end, only a few pixels are wrong, and each child flips about 7 random ones. Nearly every flip hits a correct pixel, so children are almost always worse and replace-worst rejects them. Rate 1/144 changes about one pixel, which is the right size of step. The tiny rate 0.0001 has almost no flips at all, and 0.2 is close to random.",
    },
    {
      type: "match",
      q: "Match each lab setting to what you would see.",
      pairs: [
        ["Population of 4", "Quick early gains, then variety runs out"],
        ["Tournament size 10 on 30 members", "Diversity line collapses almost at once"],
        ["Mutation 0.05 per bit", "Best creeps up but stays noisy and short of perfect"],
        ["Elites = 0 (generational)", "The best score can drop between generations"],
      ],
      why: "A tiny population has too little variety to keep improving. A large tournament makes selection greedy, so copies of the best flood the population. A high mutation rate scrambles good pictures about as fast as it finds them. Without elites, the champion can be lost in a bad round.",
    },
    {
      type: "bug",
      q: "This lab mutation should flip each pixel with probability pm (a small number). Tap the faulty line.",
      code: [
        "child = []",
        "for b in x:",
        "    if random() > pm:    # flip this pixel",
        "        b = 1 - b",
        "    child.append(b)",
      ],
      a: 2,
      why: "random() > pm is true most of the time (about 99% for a small pm), so nearly every pixel flips and the child is the photo-negative of the parent. It should be random() < pm.",
    },
    {
      type: "cat",
      q: "Which knob change would you try for each dashboard symptom in the lab?",
      buckets: ["Lower selection pressure or raise mutation", "Raise selection pressure"],
      items: [
        ["Diversity hit 0 at generation 40 while the best sits at 0.92", 0],
        ["The mean is far below the best and has not moved in 200 generations", 1],
        ["Best, mean and diversity all stay flat, with a wide spread of members", 1],
        ["All 30 thumbnails look identical, 6 pixels wrong", 0],
        ["Every run converges to a different wrong picture", 0],
      ],
      why: "Identical members (diversity near 0) mean selection is too strong: soften it or add mutation to get variety back. Lots of variety but no progress means selection is too weak to exploit what it has found. Different wrong pictures every run are a sign of early convergence in each run, so look at loosening pressure as well.",
    },
  ]);
})();

/* ===== bank-x-nic-1.js ===== */
/* Revision bank, third set of varied, visual questions (nic-1).
   Modules: l1-what, l1-monkey, l1-ingredients, l1-apps, l2-generic, l2-optim, l2-complexity, l2-mst (5 each).
   Each figure carries the information its question needs. Data for the charts is computed by small
   seeded simulations of the real algorithms below, so every number on screen is genuine. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;max-height:${h}px">${body}</svg>`;
  const T = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${(o.z || 13) <= 12 ? (o.z || 13) + 1 : o.z || 13}px var(--sans);fill:${o.c || "var(--text)"};pointer-events:none">${s}</text>`;
  const R = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r === undefined ? 6 : o.r}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw === undefined ? 2 : o.sw}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}${o.o ? ` fill-opacity="${o.o}"` : ""}/>`;
  const L = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.sw || 2}" stroke-linecap="round"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const C = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw === undefined ? 2 : o.sw}"${o.o ? ` fill-opacity="${o.o}"` : ""}/>`;
  /* a pick target drawn on top of the picture: only the transparent frame takes the highlight */
  const hit = (id, x, y, w, h, r = 10) =>
    `<g data-pick="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="transparent" stroke="var(--line)" stroke-width="2"/></g>`;
  const poly = (pts, c, sw = 3) =>
    `<polyline points="${pts.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  let mkn = 0;
  const arrowDef = (c = "var(--text-dim)") => {
    const id = "xm" + ++mkn;
    return [
      id,
      `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker></defs>`,
    ];
  };
  const rng = (s) => () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  /* =====================================================================
     l1-what
     ===================================================================== */
  const whatMini = (() => {
    const dead = (x, y) =>
      `${C(x, y, 11, { f: "var(--rose-dim)", s: "var(--rose)", sw: 3 })}${T(x, y + 5, "×", { c: "var(--rose-ink)", z: 16 })}`;
    const node = (x, y) => C(x, y, 9, { s: "var(--text-dim)", sw: 3 });
    const panel = (ox, nodes, edges, deadIdx, cap) => {
      const lines = edges
        .map(([a, b]) =>
          L(
            ox + nodes[a][0],
            nodes[a][1],
            ox + nodes[b][0],
            nodes[b][1],
            deadIdx.includes(a) || deadIdx.includes(b)
              ? { c: "var(--rose-edge)", d: "4 4", sw: 2 }
              : { c: "var(--blue)", sw: 3 },
          ),
        )
        .join("");
      const dots = nodes.map(([x, y], i) => (deadIdx.includes(i) ? dead(ox + x, y) : node(ox + x, y))).join("");
      return `${R(ox, 4, 138, 168, { r: 14 })}${lines}${dots}${T(ox + 69, 142, cap[0], { z: 12, c: "var(--text-dim)" })}${T(ox + 69, 158, cap[1], { z: 12, c: "var(--text-dim)" })}`;
    };
    const star = [
      [69, 66],
      ...[-90, -18, 54, 126, 198].map((a) => [
        69 + 48 * Math.cos((a * Math.PI) / 180),
        66 + 48 * Math.sin((a * Math.PI) / 180),
      ]),
    ];
    const ring = [0, 60, 120, 180, 240, 300].map((a) => [
      69 + 46 * Math.cos((a * Math.PI) / 180),
      66 + 46 * Math.sin((a * Math.PI) / 180),
    ]);
    const chain = [0, 1, 2, 3, 4].map((i) => [20 + i * 25, 66]);
    return svg(
      440,
      178,
      `
      ${panel(
        0,
        star,
        [
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
        ],
        [0],
        ["One hub gives", "all the orders"],
      )}
      ${panel(
        151,
        ring,
        [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 0],
          [1, 4],
          [2, 5],
        ],
        [0],
        ["Peers talk to", "their neighbours"],
      )}
      ${panel(
        302,
        chain,
        [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],
        ],
        [2],
        ["A chain of", "hand-offs"],
      )}
      ${hit("a", 0, 4, 138, 168, 14)}${hit("b", 151, 4, 138, 168, 14)}${hit("c", 302, 4, 138, 168, 14)}`,
    );
  })();

  const whatColonies = (() => {
    const vals = [92, 8, 95, 87, 11],
      x0 = 62,
      bw = 40,
      gap = 20,
      base = 190,
      top = 30,
      H = base - top;
    const bars = vals
      .map((v, i) => {
        const x = x0 + i * (bw + gap),
          h = (v / 100) * H;
        return `${R(x, base - h, bw, h, { f: "var(--blue)", s: "var(--blue-ink)", r: 5 })}${T(x + bw / 2, base - h - 6, v + "%", { z: 14 })}${T(x + bw / 2, base + 18, "Colony " + (i + 1), { z: 12, c: "var(--text-dim)" })}`;
      })
      .join("");
    const y50 = base - H / 2;
    return svg(
      420,
      220,
      `
      ${L(x0 - 8, base, 410, base)}${L(x0 - 8, top, x0 - 8, base)}
      ${L(x0 - 8, y50, 410, y50, { c: "var(--amber)", d: "6 5" })}${T(24, y50 + 5, "50%", { z: 12, c: "var(--amber-ink)" })}
      ${T(24, top + 5, "100%", { z: 12, c: "var(--text-dim)" })}${T(24, base + 4, "0%", { z: 12, c: "var(--text-dim)" })}
      ${bars}${T(236, 16, "Share of ants on route A after one hour", { z: 13, c: "var(--text-dim)" })}`,
    );
  })();

  const whatTable = (() => {
    const rows = [
      [["Sort a million", "names"], "Yes", "Yes", "No"],
      [["Plan a 300-stop", "courier round"], "Yes", "No", "Yes"],
      [["Pick the", "funniest joke"], "No", "No", "Yes"],
      [["Solve", "3x + 2 = 11"], "Yes", "Yes", "No"],
    ];
    const ids = ["a", "b", "c", "d"],
      cols = [128, 208, 288],
      y0 = 56,
      rh = 54;
    let g =
      ["Can we", "Fast exact", "Good enough"]
        .map((s, i) => T(cols[i] + 40, 16, s, { z: 12, c: "var(--text-dim)" }))
        .join("") +
      ["score it?", "method?", "is fine?"]
        .map((s, i) => T(cols[i] + 40, 33, s, { z: 12, c: "var(--text-dim)" }))
        .join("");
    rows.forEach((r, i) => {
      const y = y0 + i * rh;
      g += T(10, y + 22, r[0][0], { a: "start", z: 13 }) + T(10, y + 40, r[0][1], { a: "start", z: 13 });
      for (let k = 1; k <= 3; k++) {
        const yes = r[k] === "Yes";
        g +=
          R(cols[k - 1] + 6, y + 10, 68, 32, {
            f: yes ? "var(--blue-dim)" : "var(--bg-2)",
            s: yes ? "var(--blue-edge)" : "var(--line-2)",
            r: 16,
          }) + T(cols[k - 1] + 40, y + 31, r[k], { z: 14, c: yes ? "var(--blue-ink)" : "var(--text-dim)" });
      }
    });
    rows.forEach((_, i) => (g += hit(ids[i], 3, y0 + i * rh + 2, 374, rh - 4, 12)));
    return svg(380, y0 + rows.length * rh + 4, g);
  })();

  const whatGroups = (() => {
    const data = [
        ["10", 100, 98, 40],
        ["20", 100, 97, 28],
        ["50", 0, 95, 15],
        ["200", 0, 93, 6],
      ],
      x0 = 54,
      gw = 90,
      base = 200,
      top = 34,
      H = base - top;
    const col = ["var(--blue)", "var(--teal)", "var(--amber)"],
      ink = ["var(--blue-ink)", "var(--teal-ink)", "var(--amber-ink)"];
    let g = L(x0 - 6, base, 432, base) + L(x0 - 6, top, x0 - 6, base);
    [0, 50, 100].forEach((v) => {
      const y = base - (v / 100) * H;
      g +=
        T(x0 - 12, y + 4, v, { a: "end", z: 12, c: "var(--text-dim)" }) +
        (v ? L(x0 - 6, y, 432, y, { c: "var(--line)", sw: 1 }) : "");
    });
    data.forEach((d, gi) => {
      const gx = x0 + gi * gw;
      for (let k = 0; k < 3; k++) {
        const v = d[k + 1],
          x = gx + 6 + k * 26,
          h = (v / 100) * H;
        if (v === 0) g += T(x + 12, base - 8, "✗", { z: 15, c: "var(--rose-ink)" });
        else g += R(x, base - h, 24, h, { f: col[k], s: ink[k], r: 4, sw: 1.5 });
      }
      g += T(gx + 45, base + 18, d[0] + " stops", { z: 13 });
    });
    g += [
      ["Exact search", 0],
      ["Evolutionary algorithm", 1],
      ["Random guessing", 2],
    ]
      .map(
        ([s, k], i) =>
          R(10 + [0, 98, 292][i], 6, 12, 12, { f: col[k], s: ink[k], r: 3, sw: 1.5 }) +
          T(26 + [0, 98, 292][i], 16, s, { a: "start", z: 12 }),
      )
      .join("");
    g +=
      T(22, base + 38, "Score = % of the best plan known.", { a: "start", z: 12, c: "var(--text-dim)" }) +
      T(22, base + 56, "✗ = no answer within the time limit.", { a: "start", z: 12, c: "var(--text-dim)" });
    return svg(440, 262, g);
  })();

  B.add("l1-what", [
    {
      type: "pick",
      q: "Each design below loses the member marked with a red cross. Which design carries on working as a whole, the way an ant colony does when ants disappear?",
      fig: whatMini,
      a: "b",
      why: "In the hub design the hub gives every order, so losing it leaves five workers with nobody to listen to. In the chain, losing a middle link cuts the group in two. In the peer design each member only needs its neighbours, and the remaining members are still joined up. A colony is built like that: no member is essential, so the group keeps going.",
    },
    {
      type: "mcq",
      q: "Five colonies each had two routes to food, and the two routes were exactly the same length. The bars show the share of each colony's ants using route A after an hour. What best explains the pattern?",
      fig: whatColonies,
      o: [
        "A few early ants happen to favour one route, and trail feedback then locks the whole colony onto it",
        "The ants cannot tell equal routes apart, so every colony spreads its ants evenly between the two routes",
        "Route A is a little shorter in some trials, and the colonies that chose B missed that difference",
        "The scent fades far too quickly for a route to build up, so each colony picks a fresh route every minute",
      ],
      a: 0,
      why: "With equal routes there is nothing to prefer at first. Chance gives one route a few extra ants, they lay extra scent, and the scent draws more ants. Each colony ends up committed to a single route, but which one is down to luck, so some pick A and some pick B. An even split is the unstable middle, not the usual result.",
    },
    {
      type: "bug",
      q: "This colony simulation should use local rules only: every ant reacts to the scent next to it, and nobody gives orders. Click the line that breaks that.",
      code: [
        "for ant in colony:",
        "    scent = trail.near(ant.pos)",
        "    ant.move(boss.route_for(ant))",
        "    trail.add(ant.pos)",
      ],
      a: 2,
      why: "boss.route_for(ant) is a central controller handing out routes. The point of the ant model is that simple local actions (sniff the nearby trail, move, leave scent) add up to a good colony route with no leader. The move should depend only on the scent the ant has just sniffed.",
    },
    {
      type: "pick",
      q: "A team wants to try a nature-inspired method on one of these jobs. Tap the job where it is the sensible choice.",
      fig: whatTable,
      a: "b",
      why: "The courier round can be scored (total distance) but has no fast exact method, and a good plan in minutes is all that is needed: exactly the niche for nature-inspired methods. Sorting and the equation already have fast exact methods. The joke cannot be scored automatically, and without a score there is nothing for selection to act on.",
    },
    {
      type: "multi",
      q: "A firm compared three ways of planning delivery rounds of different sizes. Select every statement the chart supports.",
      fig: whatGroups,
      o: [
        "On the 10-stop round the exact search did slightly better than the evolutionary algorithm",
        "The evolutionary algorithm reached at least 90% of the best known plan at every size tested",
        "The evolutionary algorithm found the very best plan for the 50-stop round",
        "Random guessing stayed within 10 points of the evolutionary algorithm at every size",
        "At 200 stops only the evolutionary and random methods gave plans, and the evolutionary one was far better",
      ],
      a: [0, 1, 4],
      why: "Exact search wins while the problem is small (100 against 98) but gives no answer in time at 50 and 200 stops. The evolutionary plans stay between 93 and 98, which is at least 90 everywhere. Its 50-stop plan scores 95, so it is close to the best known, but nothing shows it is the best possible. Random guessing falls from 40 to 6, far below the evolutionary plans.",
    },
  ]);

  /* =====================================================================
     l1-monkey
     ===================================================================== */
  const monkeyGrid = (() => {
    const rows = ["01001000", "01001010", "01001010", "11001010", "11101010", "11101001", "11101011"];
    const x0 = 78,
      cw = 30,
      y0 = 34,
      rh = 28;
    let g =
      T(8, 18, "Green = letter matches the target", { a: "start", z: 12, c: "var(--text-dim)" }) +
      T(x0 + 8 * cw + 36, 18, "matches", { z: 12, c: "var(--text-dim)" });
    rows.forEach((r, i) => {
      const y = y0 + i * rh;
      g += T(10, y + 19, "step " + i, { a: "start", z: 13 });
      [...r].forEach(
        (b, k) =>
          (g += R(
            x0 + k * cw + 1,
            y + 2,
            cw - 4,
            rh - 6,
            b === "1"
              ? { f: "var(--teal)", s: "var(--teal-ink)", r: 5 }
              : { f: "var(--bg-2)", s: "var(--line-2)", r: 5 },
          )),
      );
      g += T(x0 + 8 * cw + 36, y + 19, r.split("1").length - 1 + " / 8", { z: 13 });
    });
    rows.forEach((_, i) => (g += hit("r" + i, 4, y0 + i * rh, 8 * cw + x0 + 62, rh, 8)));
    return svg(400, y0 + rows.length * rh + 6, g);
  })();

  const monkeyTrace = (() => {
    const cell = (x, y, ch, ok) =>
      R(x, y, 30, 30, ok ? { f: "var(--teal-dim)", s: "var(--teal)", r: 6 } : { f: "var(--bg-2)", r: 6 }) +
      T(x + 15, y + 21, ch, { z: 16 });
    const target = "PLANT",
      start = "PIANO";
    let g = T(8, 40, "Target", { a: "start" }) + T(8, 82, "Start", { a: "start" });
    [...target].forEach((ch, i) => (g += cell(78 + i * 34, 20, ch, true)));
    [...start].forEach((ch, i) => (g += cell(78 + i * 34, 62, ch, ch === target[i])));
    g += T(268, 82, "3 letters match", { a: "start", z: 12, c: "var(--text-dim)" });
    const props = ["change letter 2 to L", "change letter 5 to S", "change letter 4 to E", "change letter 1 to B"];
    props.forEach(
      (p, i) =>
        (g +=
          R(8, 112 + i * 34, 384, 28, { r: 8 }) +
          T(24, 131 + i * 34, "Proposal " + (i + 1), { a: "start", c: "var(--blue-ink)" }) +
          T(138, 131 + i * 34, p, { a: "start" })),
    );
    return svg(400, 252, g);
  })();

  const monkeyRuns = (() => {
    const target = "METHINKS IT IS LIKE A WEASEL",
      AL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
    const run = (k, seed, steps) => {
      const r = rng(seed);
      const cur = [...target].map(() => AL[Math.floor(r() * 27)]);
      const sc = (a) => a.reduce((s, c, i) => s + (c === target[i]), 0);
      let cs = sc(cur);
      const out = [cs];
      for (let t = 0; t < steps; t++) {
        const kid = cur.slice();
        for (let j = 0; j < k; j++) kid[Math.floor(r() * 28)] = AL[Math.floor(r() * 27)];
        const ks = sc(kid);
        if (ks >= cs) {
          for (let i = 0; i < 28; i++) cur[i] = kid[i];
          cs = ks;
        }
        out.push(cs);
      }
      return out;
    };
    const N = 2000,
      panels = [
        [1, "1 letter per step"],
        [4, "4 letters per step"],
        [28, "all 28 per step"],
      ];
    let g = "";
    panels.forEach(([k, name], i) => {
      const ox = i * 148 + 4,
        w = 136,
        h = 118,
        x0 = ox + 26,
        y0 = 20,
        y1 = y0 + h;
      const data = run(k, 11, N),
        X = (t) => x0 + (t / N) * (w - 32),
        Y = (v) => y1 - (v / 28) * h;
      const pts = [];
      for (let t = 0; t <= N; t += 20) pts.push([X(t), Y(data[t])]);
      g += R(ox, 2, w, 176, { r: 12 }) + L(x0, y1, ox + w - 6, y1) + L(x0, y0, x0, y1);
      g += L(x0, Y(28), ox + w - 6, Y(28), { c: "var(--teal)", d: "4 4", sw: 1.5 }) + poly(pts, "var(--blue)", 3);
      g +=
        T(ox + 20, Y(28) + 4, "28", { a: "end", z: 11, c: "var(--text-dim)" }) +
        T(ox + 20, y1 + 4, "0", { a: "end", z: 11, c: "var(--text-dim)" });
      g +=
        T(ox + w / 2, y1 + 18, name, { z: 12 }) +
        T(ox + w / 2, y1 + 33, "steps 0 to 2000 →", { z: 11, c: "var(--text-dim)" });
    });
    return svg(450, 184, g);
  })();

  const monkeyCycle = (() => {
    const [id, defs] = arrowDef();
    const bx = [
        [10, 40],
        [250, 40],
        [250, 170],
        [10, 170],
      ],
      names = [
        ["Make a child:", "change one letter"],
        ["Count how many", "letters match"],
        ["Keep the child unless", "it matches fewer"],
        ["The kept string", "becomes the parent"],
      ];
    const w = 180,
      h = 64;
    let g = defs;
    g += `<path d="M${bx[0][0] + w} ${bx[0][1] + h / 2} L${bx[1][0] - 4} ${bx[1][1] + h / 2}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    g += `<path d="M${bx[1][0] + w / 2} ${bx[1][1] + h + 2} L${bx[2][0] + w / 2} ${bx[2][1] - 6}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    g += `<path d="M${bx[2][0] - 2} ${bx[2][1] + h / 2} L${bx[3][0] + w + 6} ${bx[3][1] + h / 2}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    g += `<path d="M${bx[3][0] + w / 2} ${bx[3][1] - 2} L${bx[0][0] + w / 2} ${bx[0][1] + h + 6}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    bx.forEach(([x, y], i) => {
      g += `<g data-pick="b${i + 1}">${R(x, y, w, h, { r: 14, s: "var(--blue-edge)", f: "var(--blue-dim)", sw: 3 })}</g>${T(x + w / 2, y + 27, names[i][0], { z: 15, c: "var(--ink)" })}${T(x + w / 2, y + 48, names[i][1], { z: 15, c: "var(--ink)" })}`;
    });
    return svg(440, 250, g);
  })();

  B.add("l1-monkey", [
    {
      type: "pick",
      q: "A keep-if-better run changes exactly ONE letter per step and keeps the child if its match count does not drop. Each row shows which of 8 letters match the target after that step. (A wrong letter swapped for another wrong letter does not show.) One row cannot have come from the row above it under these rules. Tap it.",
      fig: monkeyGrid,
      a: "r5",
      why: "From step 4 to step 5 the count stays at 5, which is allowed on its own, but look at which letters moved: letter 7 went from right to wrong while letter 8 went from wrong to right. That is two letters changed in one step. Steps 1 to 2 look identical because a wrong letter became another wrong letter, which is a legal, unseen change.",
    },
    {
      type: "mcq",
      q: "Keep-if-better changes one letter and keeps the child if its match count is not lower than its parent's. Starting from PIANO (target PLANT), the four proposals below are tried in order. What is the current string after proposal 4?",
      fig: monkeyTrace,
      o: ["PLANS", "PLANO", "BLANS", "PLAES"],
      a: 0,
      hint: "Count matches after each proposal. Only the proposals that do not lower the count are kept.",
      why: "Proposal 1 gives PLANO (4 matches, up from 3): kept. Proposal 2 gives PLANS (still 4 matches): not worse, so it is kept. Proposal 3 would give PLAES (3 matches) and proposal 4 would give BLANS (3 matches): both worse, so both are thrown away. The string stays PLANS. Accepting equal scores is what lets the search drift across flat patches.",
    },
    {
      type: "bug",
      q: "This keep-if-better search is meant to build on its improvements, but it never gets further than one lucky letter beyond where it started. Click the faulty line.",
      code: [
        "start = random_text()",
        "best = start",
        "for step in range(5000):",
        "    kid = mutate(start)",
        "    if score(kid) >= score(best):",
        "        best = kid",
      ],
      a: 3,
      why: "Every child is made from the original start string, not from the current best. Improvements are recorded in best but never built on, so the search can only ever beat start by a single change. The child must be made from the current best: mutate(best).",
    },
    {
      type: "mcq",
      q: "Three runs of one search try to match a 28-letter sentence. Each step they re-roll some random letters and keep the child if its match count is not lower. The runs differ only in how many letters they re-roll per step. The middle run shot ahead early but then crawled at about 19. Why?",
      fig: monkeyRuns,
      o: [
        "Near the end, re-rolling four at once nearly always spoils a right letter, so few children are kept",
        "Once about 19 of the 28 letters are right, there are no different letters left for it to try out",
        "Keep-if-better only lets a child be kept while the match count is below about 20, then it switches off",
        "Re-rolling four letters costs four times as much, so its curve is simply the same one stretched sideways",
      ],
      a: 0,
      why: "Early on almost any change helps, so big steps are fast. Near the end most letters are right, and four random changes almost surely break a right letter without fixing a wrong one, so the child scores lower and is rejected. The one-letter run is slower at first but keeps finding the odd improvement. Re-rolling all 28 letters is little better than random typing.",
    },
    {
      type: "pick",
      q: "In nature the environment “scores” each offspring by how well it survives. Which box of this keep-if-better loop does that job?",
      fig: monkeyCycle,
      a: "b2",
      why: "Counting the matching letters is the fitness function: it is the judge of how well a child does, like the environment. Box 1 is variation (mutation), box 3 is selection (acting on the score) and box 4 is the next generation.",
    },
  ]);

  /* =====================================================================
     l1-ingredients
     ===================================================================== */
  const ingGrids = (() => {
    const r = rng(20),
      Ln = 10,
      P = 6;
    let pop = Array.from({ length: P }, () => Array.from({ length: Ln }, () => (r() < 0.5 ? 1 : 0)));
    const fit = (a) => a.reduce((s, b) => s + b, 0);
    const snaps = { 0: pop.map((a) => a.slice()) };
    for (let gI = 1; gI <= 30; gI++) {
      const np = [];
      for (let i = 0; i < P; i++) {
        const a = pop[Math.floor(r() * P)],
          b = pop[Math.floor(r() * P)];
        np.push((fit(a) >= fit(b) ? a : b).slice());
      }
      pop = np;
      if (gI === 4 || gI === 30) snaps[gI] = pop.map((a) => a.slice());
    }
    const names = [
      ["a", 0, "generation 0"],
      ["b", 4, "generation 4"],
      ["c", 30, "generation 30"],
    ];
    let g = "";
    names.forEach(([id, gen, label], pi) => {
      const ox = 6 + pi * 148,
        cell = 11;
      g += R(ox, 2, 136, 128, { r: 12 });
      snaps[gen].forEach((row, i) =>
        row.forEach(
          (b, k) =>
            (g += R(
              ox + 13 + k * cell,
              12 + i * cell + i * 3,
              cell - 1,
              cell + 1,
              b
                ? { f: "var(--blue)", s: "var(--blue-ink)", r: 2, sw: 1 }
                : { f: "var(--bg-2)", s: "var(--line-2)", r: 2, sw: 1 },
            )),
        ),
      );
      g += T(ox + 68, 120, label, { z: 13 });
      g += hit(id, ox, 2, 136, 128, 12);
    });
    return svg(450, 136, g);
  })();

  const ingBars = (() => {
    const schemes = [
      ["s1", "A: always take the single fittest", [100, 0, 0, 0]],
      ["s2", "B: anyone, with equal chance", [25, 25, 25, 25]],
      ["s3", "C: chance proportional to fitness", [50, 31.25, 12.5, 6.25]],
      ["s4", "D: pick from the fittest two only", [50, 50, 0, 0]],
      ["s5", "E: chance by rank (4, 3, 2, 1 shares)", [40, 30, 20, 10]],
    ];
    const col = ["var(--teal)", "var(--blue)", "var(--amber)", "var(--violet)"],
      ink = ["var(--teal-ink)", "var(--blue-ink)", "var(--amber-ink)", "var(--violet-ink)"];
    const x0 = 16,
      W = 400,
      y0 = 36,
      rh = 46;
    let g = ["Fittest", "2nd", "3rd", "4th"]
      .map(
        (s, i) =>
          R(x0 + i * 100, 8, 12, 12, { f: col[i], s: ink[i], r: 3, sw: 1.5 }) +
          T(x0 + 18 + i * 100, 18, s, { a: "start", z: 12 }),
      )
      .join("");
    schemes.forEach(([id, name, ps], i) => {
      const y = y0 + i * rh;
      g += T(x0, y + 12, name, { a: "start", z: 13 });
      let x = x0;
      ps.forEach((p, k) => {
        const w = (p / 100) * W;
        if (!w) return;
        g +=
          R(x, y + 18, w, 20, { f: col[k], s: ink[k], r: 0, sw: 1.5 }) +
          (w > 30 ? T(x + w / 2, y + 33, (p % 1 ? p.toFixed(1) : p) + "%", { z: 12, c: "#fff" }) : "");
        x += w;
      });
      g += hit(id, x0 - 8, y - 2, W + 16, 44, 8);
    });
    return svg(440, y0 + schemes.length * rh, g);
  })();

  const ingDots = (() => {
    const f = (x) => 0.6 * Math.exp(-(((x - 0.2) / 0.08) ** 2)) + 1.0 * Math.exp(-(((x - 0.72) / 0.1) ** 2));
    const r = rng(2 * 131);
    const climb = (x) => {
      for (let t = 0; t < 200; t++) {
        const y = Math.min(1, Math.max(0, x + (r() < 0.5 ? -0.02 : 0.02)));
        if (f(y) >= f(x)) x = y;
      }
      return x;
    };
    const sizes = [1, 2, 4, 8],
      res = {};
    sizes.forEach((N) => {
      res[N] = [];
      for (let k = 0; k < 12; k++) {
        let best = 0;
        for (let j = 0; j < N; j++) best = Math.max(best, f(climb(r())));
        res[N].push(best);
      }
    });
    const x0 = 56,
      cw = 88,
      y1 = 196,
      y0 = 24,
      Y = (v) => y1 - ((v - 0.5) / 0.55) * (y1 - y0);
    let g = L(x0 - 10, y1, 430, y1) + L(x0 - 10, y0 - 6, x0 - 10, y1);
    g +=
      L(x0 - 10, Y(1), 430, Y(1), { c: "var(--teal)", d: "5 5", sw: 1.5 }) +
      T(x0 - 14, Y(1) + 4, "big", { a: "end", z: 12, c: "var(--teal-ink)" });
    g +=
      L(x0 - 10, Y(0.6), 430, Y(0.6), { c: "var(--amber)", d: "5 5", sw: 1.5 }) +
      T(x0 - 14, Y(0.6) + 4, "small", { a: "end", z: 12, c: "var(--amber-ink)" });
    sizes.forEach((N, i) => {
      const cx = x0 + 10 + i * cw + cw / 2 - 4;
      res[N].forEach(
        (v, k) =>
          (g += C(cx + ((k % 6) - 2.5) * 11.5, Y(Math.min(v, 1.02)) + (k < 6 ? -6 : 6), 5, {
            f: v > 0.9 ? "var(--teal)" : "var(--amber)",
            s: "var(--panel)",
            sw: 1,
          })),
      );
      g += T(cx, y1 + 20, N === 1 ? "1 climber" : N + " climbers", { z: 13 });
      g += hit("n" + N, cx - cw / 2 + 2, y0 - 8, cw - 4, y1 - y0 + 34, 10);
    });
    return svg(440, 232, g);
  })();

  const ingCut = (() => {
    const P1 = "1110100011",
      P2 = "0101111100",
      x0 = 58,
      cw = 34;
    let g = T(26, 62, "P1", { z: 14 }) + T(26, 104, "P2", { z: 14 });
    [
      [P1, 44],
      [P2, 86],
    ].forEach(([s, y]) =>
      [...s].forEach(
        (b, k) =>
          (g +=
            R(
              x0 + k * cw + 1,
              y,
              cw - 2,
              30,
              b === "1" ? { f: "var(--teal-dim)", s: "var(--teal)", r: 6 } : { f: "var(--bg-2)", r: 6 },
            ) + T(x0 + k * cw + cw / 2, y + 21, b, { z: 15 })),
      ),
    );
    for (let k = 1; k <= 9; k++) {
      const x = x0 + k * cw;
      g += `<g data-pick="c${k}">${L(x, 36, x, 126, { c: "var(--blue)", d: "4 4", sw: 3 })}<rect x="${x - 8}" y="36" width="16" height="90" rx="6" fill="transparent" stroke="none"/></g>${T(x, 148, "cut " + k, { z: 11, c: "var(--blue-ink)" })}`;
    }
    g += T(220, 18, "Cut after position…", { z: 13, c: "var(--text-dim)" });
    return svg(410, 160, g);
  })();

  const ingStrip = (() => {
    const bits = "0110100111010010100110101100100101101010".split("");
    let g = T(8, 16, "Parent: 40 bits", { a: "start", z: 13 });
    bits.forEach((b, i) => {
      const x = 8 + (i % 20) * 20,
        y = 26 + Math.floor(i / 20) * 24;
      g +=
        R(
          x,
          y,
          18,
          20,
          b === "1"
            ? { f: "var(--blue-dim)", s: "var(--blue-edge)", r: 4, sw: 1.5 }
            : { f: "var(--bg-2)", s: "var(--line-2)", r: 4, sw: 1.5 },
        ) + T(x + 9, y + 15, b, { z: 12, c: "var(--text-dim)" });
    });
    g += T(8, 92, "Each bit flips on its own, with chance 1 in 20.", { a: "start", z: 13, c: "var(--amber-ink)" });
    return svg(416, 104, g);
  })();

  B.add("l1-ingredients", [
    {
      type: "pick",
      q: "A population of six 10-bit candidates is bred by selection and copying only: no mutation and no crossover. Each panel shows the six rows (one per candidate) at a different generation. Tap the panel after which recombination (crossover) on its own can no longer make anything new.",
      fig: ingGrids,
      a: "c",
      why: "By generation 30 all six rows are identical. Crossing two identical parents gives a child identical to both, so recombination has nothing to mix. At generation 4 there are still three different rows, so crossover could still build new combinations. Selection alone shrinks variety; mutation is what puts new variety back in.",
    },
    {
      type: "pick",
      q: "Selection should have a weak bias towards the fittest: fitter parents are likelier, but nobody is ruled out. Each bar shows how a scheme shares parent slots among four candidates with fitness 8, 5, 2 and 1. Select every scheme that matches that description.",
      fig: ingBars,
      a: ["s3", "s5"],
      hint: "C splits 16 total fitness: 8, 5, 2 and 1 sixteenths.",
      why: "C gives shares of 8/16, 5/16, 2/16 and 1/16: the fittest is favoured, yet the weakest still has a 6% chance. E does the same by rank. A gives everyone else no chance at all, B has no bias, and D rules out the bottom two. Zero chances throw away variety; no bias throws away progress.",
    },
    {
      type: "pick",
      q: "Each dot is one run of a hill-climbing search on a landscape with a small hill (height 0.6) and a big mountain (height 1.0). In a run, a population of climbers starts at random places and each only walks uphill. The dot is the best height any climber reached. Tap the smallest population size for which all 12 runs reached the big mountain.",
      fig: ingDots,
      a: "n4",
      why: "With one climber, a start near the small hill ends up on it, so about half the runs are stuck at 0.6. With two climbers, both must be unlucky, which still happens now and then. With four climbers, at least one almost always starts in the mountain's catchment area, and every run reaches 1.0. A population is insurance against a bad start.",
    },
    {
      type: "pick",
      q: "One-point crossover: a child takes everything before the cut from Parent 1 and everything after it from Parent 2. Fitness is the number of 1s in the child. Tap the cut that gives the fittest child.",
      fig: ingCut,
      a: "c3",
      hint: "Count the 1s in the left part of P1 and the right part of P2 for each cut.",
      why: "Cutting after position 3 gives 111 from P1 and 1111100 from P2: 1111111100, which has eight 1s. Every other cut gives 7 or fewer (cut 1 or 2 gives 7, cut 4 or 5 gives 7, cut 6 gives 6, cut 7 or 9 gives 5, cut 8 gives 4). Crossover works when each parent has a good piece the other lacks.",
    },
    {
      type: "slider",
      q: "A parent has 40 bits. Mutation flips each bit independently with chance 1 in 20. On average, how many bits differ between a child and its parent?",
      fig: ingStrip,
      min: 0,
      max: 10,
      step: 1,
      ans: 2,
      tol: 1,
      unit: " bits",
      hint: "40 bits, each with a 1 in 20 chance: 40 ÷ 20.",
      why: "Expected flips = number of bits × chance per bit = 40 × 1/20 = 2. A rate of about one flip per child makes mutation a small tweak, which is what an EA wants: small changes mostly stay near a good parent, and the odd child still lands somewhere new.",
    },
  ]);

  /* =====================================================================
     l1-apps
     ===================================================================== */
  const appsScatter = (() => {
    const P = { A: [1, 4], B: [2, 8], C: [3, 9], D: [4, 12], E: [5, 13], F: [2, 5], G: [6, 14], H: [3, 12] };
    const x0 = 50,
      y1 = 250,
      W = 350,
      H = 220,
      X = (s) => x0 + (s / 6.5) * W,
      Y = (g) => y1 - (g / 15) * H;
    let g = "";
    for (let i = 0; i <= 6; i++)
      g += L(X(i), y1, X(i), Y(15), { c: "var(--line)", sw: 1 }) + T(X(i), y1 + 18, i, { z: 12, c: "var(--text-dim)" });
    for (let v = 0; v <= 15; v += 5)
      g +=
        L(x0, Y(v), X(6.5), Y(v), { c: "var(--line)", sw: 1 }) +
        T(x0 - 10, Y(v) + 4, v, { a: "end", z: 12, c: "var(--text-dim)" });
    g += L(x0, y1, X(6.5), y1) + L(x0, y1, x0, Y(15));
    g +=
      T(235, y1 + 38, "Size (cm)", { z: 13, c: "var(--text-dim)" }) +
      T(12, 130, "Gain (dB)", { z: 13, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 130)" `,
      );
    Object.entries(P).forEach(
      ([k, [s, ga]]) =>
        (g += `<g data-pick="${k}">${C(X(s), Y(ga), 13, { s: "var(--blue)", sw: 3 })}${T(X(s), Y(ga) + 5, k, { z: 13, c: "var(--ink)" })}</g>`),
    );
    return svg(420, 288, g);
  })();

  const appsGantt = (() => {
    const x0 = 44,
      W = 380,
      top = 24,
      rh = 19;
    let g = "";
    for (let k = 0; k <= 5; k++) {
      const x = x0 + (k / 5) * W;
      g +=
        L(x, top - 4, x, top + 10 * rh, { c: "var(--line)", sw: 1 }) +
        T(x, top + 10 * rh + 16, k * 30, { z: 12, c: "var(--text-dim)" });
    }
    for (let m = 0; m < 10; m++) {
      g += T(x0 - 8, top + m * rh + 13, "M" + (m + 1), { a: "end", z: 11, c: "var(--text-dim)" });
      for (let b = 0; b < 5; b++)
        g += R(x0 + (b / 5) * W + 1.5, top + m * rh + 1, W / 5 - 3, rh - 3, {
          f: b % 2 ? "var(--blue)" : "var(--teal)",
          s: b % 2 ? "var(--blue-ink)" : "var(--teal-ink)",
          r: 4,
          sw: 1.5,
        });
    }
    g += T(x0 + W / 2, top + 10 * rh + 36, "seconds into one generation (each block = one 30-second simulation)", {
      z: 12,
      c: "var(--text-dim)",
    });
    return svg(440, top + 10 * rh + 46, g);
  })();

  const appsHeat = (() => {
    const px = 5,
      py = 2,
      v = (c, r) => Math.max(0, 8 - (Math.abs(c - px) + Math.abs(r - py)));
    const rules = [
      ["P", (c, r) => v(c, r) / 8],
      ["Q", (c, r) => (c === px && r === py ? 1 : 0)],
      ["R", (c, r) => Math.floor(v(c, r) / 3) / 2],
    ];
    const cs = 19;
    let g = "";
    rules.forEach(([name, fn], pi) => {
      const ox = 4 + pi * 150;
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 7; c++) {
          const val = fn(c, r);
          g += `<rect x="${ox + 8 + c * cs}" y="${8 + r * cs}" width="${cs}" height="${cs}" fill="var(--panel)" stroke="var(--line)" stroke-width="1"/><rect x="${ox + 8 + c * cs}" y="${8 + r * cs}" width="${cs}" height="${cs}" fill="var(--teal)" fill-opacity="${val}" stroke="var(--line)" stroke-width="1"/>`;
        }
      g +=
        T(ox + 8 + px * cs + cs / 2, 8 + py * cs + 13, "★", { z: 13, c: "var(--ink)" }) +
        T(ox + 8 + 3.5 * cs, 8 + 7 * cs + 20, "Score " + name, { z: 14 });
    });
    return svg(450, 176, g);
  })();

  const appsLamps = (() => {
    const desks = ["0,1", "1,1", "1,2", "2,0", "3,2", "3,3", "2,3"];
    const cands = {
      A: [[1, 1]],
      B: [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 2],
        [2, 3],
      ],
      C: [
        [1, 1],
        [2, 3],
        [3, 2],
      ],
      D: [
        [1, 1],
        [3, 3],
        [2, 0],
      ],
    };
    const pos = { A: [14, 28], B: [164, 28], C: [14, 178], D: [164, 178] },
      cs = 30;
    let g = "";
    Object.entries(cands).forEach(([k, lamps]) => {
      const [ox, oy] = pos[k];
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++) {
          const desk = desks.includes(r + "," + c);
          g += R(ox + c * cs, oy + r * cs, cs, cs, {
            f: desk ? "var(--amber-dim)" : "var(--bg-2)",
            s: "var(--line-2)",
            r: 0,
            sw: 1,
          });
          if (desk)
            g += R(ox + c * cs + 8, oy + r * cs + 9, 14, 12, {
              f: "var(--amber-edge)",
              s: "var(--amber-ink)",
              r: 2,
              sw: 1.5,
            });
        }
      lamps.forEach(
        ([r, c]) =>
          (g += C(ox + c * cs + cs / 2, oy + r * cs + cs / 2, 9, { f: "var(--gold)", s: "var(--gold-lip)", sw: 2.5 })),
      );
      g += T(ox + 2 * cs, oy - 8, "Layout " + k, { z: 13 });
      g += hit(k, ox - 6, oy - 24, 4 * cs + 12, 4 * cs + 32, 10);
    });
    return svg(320, 322, g);
  })();

  B.add("l1-apps", [
    {
      type: "pick",
      q: "A designer scores each antenna design as fitness = gain (dB) − 2 × size (cm), and higher is better. The plot shows eight candidate designs. Tap the fittest one.",
      fig: appsScatter,
      a: "H",
      hint: "Read gain up the side and size along the bottom, then do gain minus twice the size.",
      why: "H has gain 12 and size 3, so 12 − 6 = 6. The top-gain design G scores 14 − 12 = 2, and the smallest design A scores 4 − 2 = 2. B and D score 4. A fitness function turns a trade-off (more gain against more size) into one number, so the EA can rank any two designs without anyone saying how to build a good one.",
    },
    {
      type: "slider",
      q: "Scoring one candidate takes a 30-second simulation. The population has 50 candidates, and 10 machines share the work as drawn (one generation). Picking parents and making children takes almost no time. How long will 40 generations take?",
      fig: appsGantt,
      min: 0,
      max: 200,
      step: 10,
      ans: 100,
      tol: 20,
      unit: " minutes",
      hint: "One generation is 5 rounds of 30 seconds. Then multiply by 40.",
      why: "50 candidates over 10 machines is 5 rounds of 30 s = 150 s per generation. 40 generations is 40 × 150 = 6,000 s, which is 100 minutes. Almost all the time goes on evaluating fitness, so a cheaper simulation or more machines is what speeds an EA up, not faster selection.",
    },
    {
      type: "order",
      q: "A designer tunes two settings, each with 7 values (the 49 squares). The squares are shaded by the score each of three scoring rules gives them (darker green = higher; the star is the best design under all three). An EA starts at a random square and keeps changes to a neighbouring square that do not lower the score. Order the rules from most to least helpful for guiding it.",
      fig: appsHeat,
      items: ["Score P", "Score R", "Score Q"],
      why: "P rises smoothly to the star, so every step uphill is rewarded and the EA is always pulled towards it. R is shaded in bands: it only gives feedback when the EA crosses a band edge, but it still points the right way. Q scores 0 everywhere except the star itself, so there is nothing to climb and the EA is reduced to guessing. A good fitness function ranks near-misses as better than bad misses.",
    },
    {
      type: "pick",
      q: "An office has desks (the small boxes). A lamp lights its own square and the squares directly above, below, left and right. Fitness = number of desks lit − number of lamps used, higher is better. Tap the fittest layout.",
      fig: appsLamps,
      a: "D",
      hint: "Count the lit desks for each layout, then take away the number of lamps.",
      why: "Layout D lights all 7 desks with 3 lamps: 7 − 3 = 4. Layout C lights 6 desks with 3 lamps: 3. Layout B lights all 7 desks but needs 5 lamps: 2. Layout A uses one lamp for 3 desks: 2. The score has to weigh both aims at once, which is why neither the most lamps nor the fewest wins.",
    },
    {
      type: "cat",
      q: "An engineer uses an EA to evolve a new antenna design. Who does each piece of work: you (the engineer), the EA, or neither because it isn't needed?",
      buckets: ["You", "The EA", "Neither"],
      items: [
        ["Decide what makes a design good, as a score", 0],
        ["Choose how a design is written down as a chromosome", 0],
        ["Create the first batch of random designs", 1],
        ["Tweak and combine promising designs into new ones", 1],
        ["Decide which designs get to be parents", 1],
        ["Know a step-by-step recipe for the best design", 2],
        ["Know in advance what the best design looks like", 2],
      ],
      why: "The engineer supplies the two problem-specific parts: a fitness function and an encoding. Everything else (random starts, variation, selection) is generic and the EA does it. Neither needs a recipe or a picture of the answer: that is why EAs can produce designs that surprise the experts.",
    },
  ]);

  /* =====================================================================
     l2-generic
     ===================================================================== */
  const genRuns = (() => {
    const Lb = 30,
      P = 8,
      G = 20,
      PM = 2 / 30,
      fit = (a) => a.reduce((s, b) => s + b, 0);
    const sim = (rule, seed) => {
      const r = rng(seed);
      let pop = Array.from({ length: P }, () => Array.from({ length: Lb }, () => (r() < 0.5 ? 1 : 0)));
      const hist = [Math.max(...pop.map(fit))];
      const tour = () => {
        const a = pop[Math.floor(r() * P)],
          b = pop[Math.floor(r() * P)];
        return fit(a) >= fit(b) ? a : b;
      };
      for (let g = 0; g < G; g++) {
        const kids = [];
        for (let i = 0; i < P; i++) {
          const p = tour().slice();
          for (let j = 0; j < Lb; j++) if (r() < PM) p[j] = 1 - p[j];
          kids.push(p);
        }
        if (rule === "all") pop = kids;
        else if (rule === "merge") pop = [...pop, ...kids].sort((a, b) => fit(b) - fit(a)).slice(0, P);
        else {
          pop = pop.slice().sort((a, b) => fit(b) - fit(a));
          const ks = kids.slice().sort((a, b) => fit(b) - fit(a));
          for (let i = 0; i < 4; i++) pop[P - 1 - i] = ks[i];
        }
        hist.push(Math.max(...pop.map(fit)));
      }
      return hist;
    };
    const order = [
      ["P", "merge"],
      ["Q", "all"],
      ["R", "some"],
    ];
    let g = "";
    order.forEach(([name, rule], i) => {
      const ox = 4 + i * 148,
        w = 136,
        x0 = ox + 26,
        y0 = 14,
        y1 = 134,
        data = sim(rule, 8),
        X = (t) => x0 + (t / G) * (w - 34),
        Y = (v) => y1 - ((v - 15) / 15) * (y1 - y0);
      g += R(ox, 2, w, 184, { r: 12 }) + L(x0, y1, ox + w - 6, y1) + L(x0, y0, x0, y1);
      [20, 25, 30].forEach(
        (v) =>
          (g +=
            L(x0, Y(v), ox + w - 6, Y(v), { c: "var(--line)", sw: 1 }) +
            T(ox + 20, Y(v) + 4, v, { a: "end", z: 11, c: "var(--text-dim)" })),
      );
      g +=
        poly(
          data.map((v, t) => [X(t), Y(v)]),
          "var(--teal)",
          3,
        ) +
        T(ox + w / 2, y1 + 18, "Run " + name, { z: 14 }) +
        T(ox + w / 2, y1 + 34, "generations 0 to 20 →", { z: 11, c: "var(--text-dim)" });
      g += hit("run" + name, ox, 2, w, 184, 12);
    });
    return svg(450, 192, g);
  })();

  const genStop = (() => {
    const imp = { 0: 11, 2: 14, 6: 18, 11: 21, 22: 24 },
      best = [];
    let cur = 0;
    for (let t = 0; t <= 60; t++) {
      if (imp[t] !== undefined) cur = imp[t];
      best.push(cur);
    }
    const x0 = 44,
      W = 380,
      y1 = 190,
      y0 = 24,
      X = (t) => x0 + (t / 60) * W,
      Y = (v) => y1 - ((v - 8) / 20) * (y1 - y0);
    let pts = [];
    best.forEach((v, t) => {
      if (t) pts.push([X(t), Y(best[t - 1])]);
      pts.push([X(t), Y(v)]);
    });
    let g = L(x0, y1, x0 + W + 4, y1) + L(x0, y0 - 6, x0, y1);
    [10, 20, 28].forEach(
      (v) =>
        (g +=
          L(x0, Y(v), x0 + W, Y(v), { c: "var(--line)", sw: 1 }) +
          T(x0 - 8, Y(v) + 4, v, { a: "end", z: 12, c: "var(--text-dim)" })),
    );
    g += poly(pts, "var(--teal)", 3.5);
    g +=
      T(235, 16, "Best fitness in the population", { z: 13, c: "var(--text-dim)" }) +
      T(x0 + W / 2, y1 + 48, "generation", { z: 12, c: "var(--text-dim)" });
    [22, 30, 37, 45, 60].forEach(
      (t) =>
        (g += `<g data-pick="g${t}">${L(X(t), Y(best[t]), X(t), y1, { c: "var(--blue-edge)", d: "3 4", sw: 2 })}${C(X(t), y1 + 18, 14, { s: "var(--blue)", sw: 3 })}${T(X(t), y1 + 23, t, { z: 13, c: "var(--ink)" })}</g>`),
    );
    return svg(440, 244, g);
  })();

  const genScatter = (() => {
    const x0 = 40,
      y1 = 300,
      S = 36,
      X = (v) => x0 + v * S,
      Y = (v) => y1 - v * 28;
    const kids = { A: [2, 3], B: [4.5, 4.5], C: [7, 6], D: [3, 7], E: [9, 1] };
    let g = "";
    for (let i = 0; i <= 10; i++)
      g +=
        L(X(i), y1, X(i), Y(10), { c: "var(--line)", sw: 1 }) +
        L(x0, Y(i), X(10), Y(i), { c: "var(--line)", sw: 1 }) +
        (i % 2 === 0
          ? T(X(i), y1 + 17, i, { z: 12, c: "var(--text-dim)" }) +
            T(x0 - 8, Y(i) + 4, i, { a: "end", z: 12, c: "var(--text-dim)" })
          : "");
    g +=
      L(x0, y1, X(10), y1) +
      L(x0, y1, x0, Y(10)) +
      T(X(5), y1 + 36, "gene x", { z: 13, c: "var(--text-dim)" }) +
      T(10, 160, "gene y", { z: 13, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 10 160)" `);
    [
      ["Parent 1", [2, 6]],
      ["Parent 2", [7, 3]],
    ].forEach(
      ([n, [x, y]]) =>
        (g +=
          R(X(x) - 11, Y(y) - 11, 22, 22, { f: "var(--violet-dim)", s: "var(--violet)", r: 5, sw: 3 }) +
          T(X(x), Y(y) + 28, n, { z: 12, c: "var(--violet-ink)" })),
    );
    Object.entries(kids).forEach(
      ([k, [x, y]]) =>
        (g += `<g data-pick="${k}">${C(X(x), Y(y), 13, { s: "var(--blue)", sw: 3 })}${T(X(x), Y(y) + 5, k, { z: 13, c: "var(--ink)" })}</g>`),
    );
    return svg(420, 346, g);
  })();

  const genBars = (() => {
    const v = [100, 3, 2, 2, 1],
      x0 = 50,
      base = 150,
      H = 110;
    let g = L(x0 - 10, base, 410, base) + L(x0 - 10, base - H - 6, x0 - 10, base);
    v.forEach((val, i) => {
      const x = x0 + i * 70,
        h = Math.max(3, (val / 100) * H);
      g +=
        R(x, base - h, 44, h, {
          f: i === 0 ? "var(--amber)" : "var(--blue)",
          s: i === 0 ? "var(--amber-ink)" : "var(--blue-ink)",
          r: 5,
        }) +
        T(x + 22, base - h - 7, val, { z: 14 }) +
        T(x + 22, base + 18, i === 0 ? "leader" : "#" + (i + 1), { z: 12, c: "var(--text-dim)" });
    });
    g += T(235, 16, "Fitness of the five individuals", { z: 13, c: "var(--text-dim)" });
    return svg(420, 178, g);
  })();

  const genFlow = (() => {
    const [id, defs] = arrowDef();
    const bx = 40,
      bw = 240,
      bh = 36,
      ys = [26, 84, 142, 200],
      decY = 262;
    const names = [
      "Random population, scored",
      "Select parents",
      "Vary: mutate / recombine",
      "Score children, update population",
    ];
    let g = defs;
    const arrow = (pid, d, label) =>
      `<g data-pick="${pid}"><path d="${d}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/><path d="${d}" stroke="transparent" stroke-width="22" fill="none"/></g>`;
    ys.forEach(
      (y, i) =>
        (g +=
          R(bx, y, bw, bh, {
            r: 10,
            f: i === 0 ? "var(--teal-dim)" : "var(--blue-dim)",
            s: i === 0 ? "var(--teal)" : "var(--blue-edge)",
            sw: 2.5,
          }) + T(bx + bw / 2, y + 23, names[i], { z: 14, c: "var(--ink)" })),
    );
    g +=
      `<polygon points="${bx + bw / 2},${decY - 4} ${bx + bw / 2 + 80},${decY + 22} ${bx + bw / 2},${decY + 48} ${bx + bw / 2 - 80},${decY + 22}" fill="var(--amber-dim)" stroke="var(--amber)" stroke-width="2.5"/>` +
      T(bx + bw / 2, decY + 27, "Time left?", { z: 13, c: "var(--ink)" });
    g +=
      R(312, decY + 2, 100, 42, { r: 10, f: "var(--rose-dim)", s: "var(--rose)", sw: 2.5 }) +
      T(362, decY + 20, "Stop and", { z: 13, c: "var(--ink)" }) +
      T(362, decY + 36, "report best", { z: 13, c: "var(--ink)" });
    g +=
      arrow("a1", `M${bx + bw / 2} ${ys[0] + bh} L${bx + bw / 2} ${ys[1] - 6}`) +
      arrow("a2", `M${bx + bw / 2} ${ys[1] + bh} L${bx + bw / 2} ${ys[2] - 6}`) +
      arrow("a3", `M${bx + bw / 2} ${ys[2] + bh} L${bx + bw / 2} ${ys[3] - 6}`) +
      arrow("a4", `M${bx + bw / 2} ${ys[3] + bh} L${bx + bw / 2} ${decY - 8}`);
    g +=
      arrow("a5", `M${bx + bw / 2 + 80} ${decY + 22} L${306} ${decY + 22}`) +
      T(272, decY + 14, "no", { z: 12, c: "var(--text-dim)" });
    g +=
      arrow(
        "a6",
        `M${bx + bw / 2 - 80} ${decY + 22} L${14} ${decY + 22} L${14} ${ys[0] + bh / 2} L${bx - 4} ${ys[0] + bh / 2}`,
      ) + T(64, decY + 14, "yes", { z: 12, c: "var(--text-dim)" });
    return svg(420, 318, g);
  })();

  B.add("l2-generic", [
    {
      type: "pick",
      q: "Three runs of one EA share the same starting population of 8 candidates (fitness = number of 1s in a 30-bit string). They differ only in how the next population is chosen. Rule ① all 8 children replace the old population. Rule ② old and new are merged and the best 8 are kept. Rule ③ the 4 weakest are replaced by the 4 best children. Each panel plots the best fitness per generation. Tap the run that used rule ①.",
      fig: genRuns,
      a: "runQ",
      why: "Under rule ① the best parent is thrown away every generation, and its children are not guaranteed to match it, so the best fitness can fall (it dips several times in run Q and ends lower than it started climbing). Rules ② and ③ both keep the best individual, so their best-so-far never goes down.",
    },
    {
      type: "pick",
      q: "An EA stops as soon as its best fitness has not improved for 15 generations in a row. The chart shows its best fitness per generation (drawn out to generation 60 so you can see what would follow). At which generation does it stop? Tap it.",
      fig: genStop,
      a: "g37",
      hint: "Find the last generation where the line steps up, then add 15.",
      why: "The last improvement is at generation 22. Fifteen generations without any gain brings us to generation 37, so the run stops there, even though the line is flat from 22 to 60. A patience rule like this saves time once progress has dried up, at the risk of stopping just before a late jump.",
    },
    {
      type: "pick",
      q: "Each individual has two genes, x and y, drawn as a point. Uniform crossover builds a child by copying each gene unchanged from one parent or the other (the x gene from either, the y gene from either). Tap every child that crossover of Parent 1 and Parent 2 could produce.",
      fig: genScatter,
      a: ["A", "C"],
      why: "Parent 1 is (2, 6) and Parent 2 is (7, 3). Child A (2, 3) takes x from Parent 1 and y from Parent 2, and child C (7, 6) takes x from Parent 2 and y from Parent 1. B (4.5, 4.5) is the average of the parents: that is blending, not copying a gene. D has both genes nudged, which is a mutation, and E is far from both parents.",
    },
    {
      type: "slider",
      q: "Fitness-proportional selection gives each individual a share of the parent slots equal to its share of the total fitness. The five individuals have the fitness values shown. About what percentage of the parent slots goes to the leader?",
      fig: genBars,
      min: 0,
      max: 100,
      step: 5,
      ans: 93,
      tol: 7,
      unit: "%",
      hint: "The total is 100 + 3 + 2 + 2 + 1 = 108.",
      why: "The leader's share is 100 ÷ 108, about 93%. The other four individuals fight over the remaining 7%, so the next generation is nearly all copies of the leader. One outlier can make proportional selection almost greedy, which is why many EAs pick by rank instead, where the leader's share would only be 5 out of 15.",
    },
    {
      type: "pick",
      q: "This flowchart of the generic EA has one wrong arrow. Tap it.",
      fig: genFlow,
      a: "a6",
      why: "When there is time left, the loop must go back to selecting parents from the updated population. This arrow goes back to the random starting population, which would throw away everything the EA has learned and restart each generation as a random search.",
    },
  ]);

  /* =====================================================================
     l2-optim
     ===================================================================== */
  const optCube = (() => {
    const w = [30, 70, 75],
      Tg = 100,
      f = (b) => Math.abs(b[0] * w[0] + b[1] * w[1] + b[2] * w[2] - Tg);
    const posOf = (b) => [60 + 160 * b[0] + 70 * b[2], 224 - 110 * b[1] - 46 * b[2]];
    const all = [...Array(8).keys()].map((i) => [(i >> 2) & 1, (i >> 1) & 1, i & 1]);
    let g = "";
    all.forEach((a) =>
      all.forEach((b) => {
        const d = (a[0] !== b[0]) + (a[1] !== b[1]) + (a[2] !== b[2]);
        if (d === 1 && a.join("") < b.join("")) {
          const [x1, y1] = posOf(a),
            [x2, y2] = posOf(b);
          g += L(x1, y1, x2, y2, { c: "var(--line-2)", sw: 3 });
        }
      }),
    );
    all.forEach((b) => {
      const [x, y] = posOf(b),
        k = b.join("");
      g += `<g data-pick="v${k}">${C(x, y, 28, { s: "var(--blue)", sw: 3 })}</g>${T(x, y - 2, k, { z: 14 })}${T(x, y + 14, "f = " + f(b), { z: 12, c: "var(--text-dim)" })}`;
    });
    g += T(215, 16, "Weights 30, 70, 75 kg · f = |total − 100| · lower is better", { z: 12, c: "var(--text-dim)" });
    return svg(400, 262, g);
  })();

  const optRuler = (() => {
    const x0 = 22,
      U = 14.6,
      X = (e) => x0 + e * U,
      y = 108;
    let g = L(x0, y, X(25), y, { sw: 3 });
    [0, 5, 10, 15, 20, 25].forEach(
      (e) =>
        (g +=
          L(X(e), y - 5, X(e), y + 5, { sw: 2 }) +
          T(X(e), y + 25, e === 0 ? "1 s" : "10<tspan dy='-5' style='font-size:10px'>" + e + "</tspan>", {
            z: 12,
            c: "var(--text-dim)",
          })),
    );
    [
      [4.94, "a day", 62],
      [9.5, "a century", 40],
      [17.6, "age of the universe", 62],
    ].forEach(
      ([e, s, ty]) =>
        (g +=
          L(X(e), ty + 6, X(e), y, { c: "var(--amber)", d: "3 3", sw: 2 }) +
          T(X(e), ty, s, { z: 12, c: "var(--amber-ink)" })),
    );
    [3, 9, 15, 21, 24].forEach(
      (e, i) =>
        (g += `<g data-pick="m${e}">${C(X(e), y, 13, { f: "var(--blue-dim)", s: "var(--blue)", sw: 3 })}</g>${T(X(e), y + 5, "ABCDE"[i], { z: 13, c: "var(--ink)" })}`),
    );
    g +=
      T(205, 150, "seconds (log scale: each tick is ×100,000)", { z: 12, c: "var(--text-dim)" }) +
      T(220, 16, "How long would the full search take?", { z: 13, c: "var(--text-dim)" });
    return svg(410, 162, g);
  })();

  const optHeat = (() => {
    const cs = 29,
      cols = 14,
      rows = 9,
      ox = 8,
      oy = 8;
    const S = [3, 6],
      D = [10, 2.5],
      f = (c, r) => Math.min(4 + Math.hypot(c - S[0], r - S[1]), Math.hypot(c - D[0], r - D[1]));
    let g = "";
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const v = Math.max(0, Math.min(1, 1 - f(c + 0.5, r + 0.5) / 9));
        g += `<rect x="${ox + c * cs}" y="${oy + r * cs}" width="${cs}" height="${cs}" fill="var(--panel)"/><rect x="${ox + c * cs}" y="${oy + r * cs}" width="${cs}" height="${cs}" fill="var(--teal)" fill-opacity="${v.toFixed(2)}"/>`;
      }
    g += R(ox, oy, cols * cs, rows * cs, { f: "none", r: 0, sw: 2 });
    const pts = { A: [3, 6], B: [9, 4], C: [6, 5], D: [12, 7], E: [5, 1] };
    Object.entries(pts).forEach(
      ([k, [c, r]]) =>
        (g += `<g data-pick="${k}">${C(ox + c * cs, oy + r * cs, 13, { f: "var(--panel)", s: "var(--ink)", sw: 3 })}${T(ox + c * cs, oy + r * cs + 5, k, { z: 13, c: "var(--ink)" })}</g>`),
    );
    g +=
      T(ox + 20, oy + rows * cs + 22, "worse", { a: "start", z: 12, c: "var(--text-dim)" }) +
      R(ox + 80, oy + rows * cs + 10, 24, 14, { f: "var(--panel)", r: 3, sw: 1 }) +
      R(ox + 108, oy + rows * cs + 10, 24, 14, { f: "var(--teal)", o: 0.35, r: 3, sw: 1 }) +
      R(ox + 136, oy + rows * cs + 10, 24, 14, { f: "var(--teal)", o: 0.7, r: 3, sw: 1 }) +
      R(ox + 164, oy + rows * cs + 10, 24, 14, { f: "var(--teal)", r: 3, sw: 1 }) +
      T(ox + 198, oy + rows * cs + 22, "better", { a: "start", z: 12, c: "var(--text-dim)" });
    return svg(424, 300, g);
  })();

  const optTable = (() => {
    const cols = [
      ["110", 0],
      ["101", 5],
      ["001", 25],
      ["010", 30],
    ];
    let g =
      T(8, 28, "Subset", { a: "start", c: "var(--text-dim)", z: 13 }) +
      T(8, 68, "f", { a: "start", z: 14 }) +
      T(8, 108, "f squared", { a: "start", z: 14 });
    cols.forEach(([s, v], i) => {
      const x = 110 + i * 78;
      g +=
        R(x, 8, 70, 30, { f: "var(--blue-dim)", s: "var(--blue-edge)", r: 8 }) +
        T(x + 35, 29, s, { z: 14, c: "var(--ink)" }) +
        R(x, 48, 70, 30, { r: 8 }) +
        T(x + 35, 69, v, { z: 14 }) +
        R(x, 88, 70, 30, { r: 8 }) +
        T(x + 35, 109, (v * v).toLocaleString("en-GB"), { z: 14 });
    });
    return svg(430, 128, g);
  })();

  const optStep = (() => {
    const imp = { 0: 100, 40: 55, 110: 30, 200: 12, 412: 0 },
      x0 = 44,
      W = 340,
      y1 = 170,
      y0 = 22,
      X = (t) => x0 + (t / 1000) * W,
      Y = (v) => y1 - (v / 100) * (y1 - y0);
    let cur = 100,
      pts = [[X(0), Y(100)]];
    for (let t = 1; t <= 1000; t++) {
      if (imp[t] !== undefined) {
        pts.push([X(t), Y(cur)]);
        cur = imp[t];
        pts.push([X(t), Y(cur)]);
      }
    }
    pts.push([X(1000), Y(cur)]);
    let g = L(x0, y1, x0 + W + 4, y1) + L(x0, y0 - 6, x0, y1);
    [0, 50, 100].forEach(
      (v) =>
        (g +=
          L(x0, Y(v), x0 + W, Y(v), { c: "var(--line)", sw: 1 }) +
          T(x0 - 8, Y(v) + 4, v, { a: "end", z: 12, c: "var(--text-dim)" })),
    );
    g +=
      poly(pts, "var(--teal)", 3.5) +
      T(235, 14, "Best fitness found so far (lower is better, never below 0)", { z: 12, c: "var(--text-dim)" }) +
      T(x0 + W / 2, y1 + 56, "candidates checked", { z: 12, c: "var(--text-dim)" });
    [150, 300, 412, 700, 1000].forEach(
      (t) =>
        (g += `<g data-pick="k${t}">${L(X(t), Y(0), X(t), y1, { c: "var(--blue-edge)", d: "3 4", sw: 2 })}${C(X(t), y1 + 22, 17, { s: "var(--blue)", sw: 3 })}${T(X(t), y1 + 27, t, { z: 12, c: "var(--ink)" })}</g>`),
    );
    return svg(420, 238, g);
  })();

  B.add("l2-optim", [
    {
      type: "pick",
      q: "The cube shows all 8 on/off choices for three items weighing 30, 70 and 75 kg, with f = |total − 100| beside each (lower is better). A search starts at 000 and repeatedly moves to the neighbour (one bit flipped) with the lowest f, stopping when no neighbour is better. Where does it stop?",
      fig: optCube,
      a: "v101",
      why: "From 000 the neighbours score 70, 30 and 25, so it moves to 001. From 001 the neighbours score 5 (101), 45 and 100, so it moves to 101. Now no neighbour beats 5 (they are 25, 70 and 75), so it stops. But the true optimum is 110 with f = 0, two flips away. Neighbour-by-neighbour search can end on a good-looking answer that isn't the best, which is why exhaustive search is the only guarantee when the space is small.",
    },
    {
      type: "pick",
      q: "A timetable problem has about 10<sup>30</sup> candidate timetables. A fast computer scores 10<sup>9</sup> (a billion) of them every second. Tap where an exhaustive search would finish on this time ruler.",
      fig: optRuler,
      a: "m21",
      hint: "10 to the 30, divided by 10 to the 9, is 10 to the (30 − 9) seconds.",
      why: "10³⁰ ÷ 10⁹ = 10²¹ seconds. The age of the universe is only about 4 × 10¹⁷ seconds, so the search would take roughly 2,000 times longer than the universe has existed. Enumeration is only for small search spaces.",
    },
    {
      type: "pick",
      q: "Two numbers (x and y) are tuned, so there are infinitely many settings and enumeration is impossible. The map shades every setting by its score (darker green = better). An EA has tried the five settings marked A to E. Tap the best one.",
      fig: optHeat,
      a: "B",
      why: "B sits near the centre of the deeper valley. A sits at the bottom of the shallower valley, and it looks fine on its own, but its colour is paler than B's. C, D and E are on slopes. The EA only ever sees the scores of the settings it has tried, so it must compare them like this and breed from the better ones.",
    },
    {
      type: "mcq",
      q: "A colleague changes the fitness function from f to f² (still minimised) and re-runs the exhaustive search over all 8 subsets of weights 30, 70 and 75 kg, with target 100 kg. The table shows a few of the scores. What changes?",
      fig: optTable,
      o: [
        "Nothing about the winner: squaring keeps the order of scores that are 0 or more, so the same subset wins",
        "A different subset wins, because squaring punishes the big misses far more than it punishes the small ones",
        "Two subsets now tie for best, because 0 and 25 are close enough together once squared to count as equal",
        "The search space gets larger, because the squared scores are bigger numbers than the original scores are",
      ],
      a: 0,
      why: "Squaring a score that is never negative never swaps the order of two candidates (a smaller f always gives a smaller f²), so exhaustive search picks 110 either way. The search space is the set of candidates, not the set of scores, so it stays at 8. (Selection that depends on score ratios could still behave differently, but ranking-based best-finding does not.)",
    },
    {
      type: "pick",
      q: "Exhaustive search checks candidates one at a time and records the best fitness so far (lower is better, and no candidate can score below 0). At which marker could you first stop and be certain you have found an optimum?",
      fig: optStep,
      a: "k412",
      why: "At 412 candidates the best fitness drops to 0, and no score can be lower than 0, so nothing left unchecked can beat it. The earlier flat stretches (for example around 300) prove nothing, because an unchecked candidate might still be better. Knowing the best possible score is what lets you stop early.",
    },
  ]);

  /* =====================================================================
     l2-complexity
     ===================================================================== */
  const cxBars = (() => {
    const ns = [24, 25, 26, 27, 28],
      x0 = 56,
      base = 190,
      H = 140;
    let g =
      L(x0 - 12, base, 410, base) +
      T(220, 16, "Time for exhaustive search, 1 million candidates per second", { z: 13, c: "var(--text-dim)" });
    ns.forEach((n, i) => {
      const t = Math.pow(2, n) / 1e6,
        h = (t / 270) * H,
        x = x0 + i * 68;
      g +=
        R(x, base - h, 44, h, { f: "var(--amber)", s: "var(--amber-ink)", r: 5 }) +
        T(x + 22, base - h - 7, t.toFixed(t < 100 ? 1 : 0) + " s", { z: 13 }) +
        T(x + 22, base + 20, "n = " + n, { z: 13 });
    });
    return svg(420, 220, g);
  })();

  const cxTable = (() => {
    const ns = [10, 20, 30, 40],
      A = [1, 4, 9, 16],
      Bv = [0.032, 1.024, 32.8, 1048.6];
    const fm = (v) =>
      v < 0.1 ? v.toFixed(2) : v < 10 ? v.toFixed(1) : v < 100 ? v.toFixed(0) : Math.round(v).toLocaleString("en-GB");
    let g =
      T(60, 24, "n", { c: "var(--text-dim)" }) +
      T(190, 24, "Program A (s)", { c: "var(--blue-ink)" }) +
      T(330, 24, "Program B (s)", { c: "var(--amber-ink)" });
    ns.forEach((n, i) => {
      const y = 36 + i * 40;
      g +=
        R(24, y, 72, 32, { r: 8, f: "var(--bg-2)" }) +
        T(60, y + 22, n, { z: 15 }) +
        R(120, y, 140, 32, { r: 8, f: "var(--blue-dim)", s: "var(--blue-edge)" }) +
        T(190, y + 22, fm(A[i]), { z: 15 }) +
        R(274, y, 140, 32, { r: 8, f: "var(--amber-dim)", s: "var(--amber-edge)" }) +
        T(344, y + 22, fm(Bv[i]), { z: 15 });
    });
    return svg(440, 206, g);
  })();

  const cxTree = (() => {
    const lvX = (lv, i) => {
        const n = Math.pow(2, lv),
          w = 360;
        return 20 + (w / n) * (i + 0.5);
      },
      ys = [30, 90, 150, 210];
    let g = "";
    for (let lv = 0; lv < 3; lv++)
      for (let i = 0; i < Math.pow(2, lv); i++)
        for (const j of [2 * i, 2 * i + 1])
          g += L(lvX(lv, i), ys[lv], lvX(lv + 1, j), ys[lv + 1], { c: "var(--line-2)", sw: 2.5 });
    for (let lv = 0; lv < 4; lv++)
      for (let i = 0; i < Math.pow(2, lv); i++)
        g +=
          lv === 3
            ? R(lvX(lv, i) - 20, ys[lv] - 14, 40, 28, { f: "var(--teal-dim)", s: "var(--teal)", r: 8 }) +
              T(lvX(lv, i), ys[lv] + 5, (7 - i).toString(2).padStart(3, "0"), { z: 12 })
            : C(lvX(lv, i), ys[lv], 11, { s: "var(--blue)", sw: 3 });
    ["item 1", "item 2", "item 3"].forEach(
      (s, k) => (g += T(436, ys[k] + 34, s, { a: "end", z: 12, c: "var(--text-dim)" })),
    );
    g += T(210, 252, "left branch = take (1), right = skip (0)", { z: 12, c: "var(--text-dim)" });
    return svg(440, 262, g);
  })();

  const cxLines = (() => {
    const x0 = 66,
      W = 330,
      y1 = 190,
      y0 = 24,
      ymax = 6.2,
      X = (n) => x0 + ((n - 10) / 20) * W,
      Y = (v) => y1 - (Math.log10(v) / ymax) * (y1 - y0);
    let g = L(x0, y1, x0 + W + 6, y1) + L(x0, y0 - 6, x0, y1);
    [
      [1, "1"],
      [100, "100"],
      [1e4, "10,000"],
      [1e6, "1,000,000"],
    ].forEach(
      ([v, s]) =>
        (g +=
          L(x0, Y(v), x0 + W, Y(v), { c: "var(--line)", sw: 1 }) +
          T(x0 - 6, Y(v) + 4, s, { a: "end", z: 11, c: "var(--text-dim)" })),
    );
    const P = [],
      Q = [];
    for (let n = 10; n <= 30; n += 0.5) {
      P.push([X(n), Y(Math.pow(2, n) / 1000)]);
      Q.push([X(n), Y(n * n * n)]);
    }
    g += poly(P, "var(--amber)", 3.5) + poly(Q, "var(--blue)", 3.5);
    g +=
      L(x0 + 8, 14, x0 + 34, 14, { c: "var(--amber)", sw: 4 }) +
      T(x0 + 40, 18, "P: 2ⁿ ÷ 1000", { a: "start", z: 13, c: "var(--amber-ink)" }) +
      L(x0 + 170, 14, x0 + 196, 14, { c: "var(--blue)", sw: 4 }) +
      T(x0 + 202, 18, "Q: n³", { a: "start", z: 13, c: "var(--blue-ink)" });
    g += T(235, y1 + 50, "steps needed (log scale: each line is ×100 the one below)", { z: 12, c: "var(--text-dim)" });
    [10, 15, 20, 25, 30].forEach(
      (n) =>
        (g += `<g data-pick="n${n}">${L(X(n), y1, X(n), y0, { c: "var(--line-2)", d: "2 5", sw: 1.5 })}${C(X(n), y1 + 20, 14, { s: "var(--violet)", sw: 3 })}${T(X(n), y1 + 25, n, { z: 13, c: "var(--ink)" })}</g>`),
    );
    return svg(440, 262, g);
  })();

  B.add("l2-complexity", [
    {
      type: "mcq",
      q: "A brute-force search checks 2<sup>n</sup> candidates at a million per second. The bars show its running time for n = 24 to 28. For a one-hour budget (3,600 seconds), roughly what is the largest n it can handle?",
      fig: cxBars,
      o: ["28", "31", "34", "40"],
      a: 1,
      hint: "Each extra item doubles the time. Start from 268 s at n = 28 and keep doubling.",
      why: "Doubling from 268 s: n = 29 takes about 540 s, n = 30 about 1,070 s and n = 31 about 2,150 s (36 minutes). n = 32 would take about 4,300 s (72 minutes), which is over the hour. So n = 31 is the limit, and a computer 1,000 times faster would only buy about 10 more items.",
    },
    {
      type: "mcq",
      q: "A team times two exact programs for the same job on inputs of size n. The job will soon be run with n = 100. Which program should they keep, and why?",
      fig: cxTable,
      o: [
        "A: its time rises gently as n grows, while B's time multiplies by about 30 for every 10 extra items",
        "B: it was faster than A on the smaller inputs, so its lead should only widen as n grows towards 100",
        "B: its first two timings are the smallest, which shows that it must do less work per item than A does",
        "Neither: four timings are far too few to say anything reliable about what will happen at n = 100",
      ],
      a: 0,
      why: "A grows steadily (1, 4, 9, 16 s: like n²). B's times jump by a factor of about 32 every time n goes up by 10 (1 → 33 → 1,049), which is exponential. B only looked quicker while n was small. At n = 100, A needs about 100 s, whereas B would need over a million million seconds, which is tens of thousands of years. Early wins can fool you: a small exponential eventually loses to any polynomial.",
    },
    {
      type: "mcq",
      q: "An exhaustive search visits every leaf of a decision tree: one level per item, branching into take or skip. With 3 items there are 8 leaves. How many leaves are there after two more items are added (5 items in total)?",
      fig: cxTree,
      o: ["10", "16", "32", "64"],
      a: 2,
      why: "Each new item doubles every existing branch, so each extra level multiplies the leaves by 2. Two more levels give 8 × 2 × 2 = 32, which is 2⁵. Adding items adds levels, but the work counts leaves, so it grows exponentially, not by a fixed amount per item.",
    },
    {
      type: "match",
      q: "A programmer times a program at n = 100, then at n = 200 (or 101). Match each timing log to the growth it points to.",
      pairs: [
        ["Time doubles when n goes from 100 to 200", "Linear, n"],
        ["Time quadruples when n goes from 100 to 200", "Quadratic, n²"],
        ["Time goes up 8 times when n goes from 100 to 200", "Cubic, n³"],
        ["Time doubles when n goes from 100 to just 101", "Exponential, 2ⁿ"],
      ],
      why: "Doubling the input and getting 2, 4 or 8 times the time points to n, n² and n³ (2¹, 2², 2³ times). If a single extra item doubles the time, the exponent contains n, which is exponential. At n = 200 the exponential program would be unimaginably slow.",
    },
    {
      type: "pick",
      q: "Program P takes 2<sup>n</sup> steps but runs on a computer 1,000 times faster, so it needs 2<sup>n</sup> ÷ 1,000 time units. Program Q takes n³ steps on an ordinary computer. The chart plots both on a log scale. Tap the first marked n at which Q beats P.",
      fig: cxLines,
      a: "n25",
      why: "At n = 20, P needs about 1,000 and Q needs 8,000, so P is ahead. At n = 25, P needs about 33,500 but Q needs only 15,600. Beyond that the gap keeps widening (at n = 30 it is about a million against 27,000). A thousand-fold faster machine only delays the exponential's defeat by a few items, while a better algorithm wins for good.",
    },
  ]);

  /* =====================================================================
     l2-mst
     ===================================================================== */
  const mstPlans = (() => {
    const pos = { A: [18, 70], B: [58, 24], C: [58, 116], D: [104, 70], E: [148, 24], F: [148, 116] };
    const plans = [
      [
        "1",
        [
          ["C", "D", 1],
          ["A", "B", 2],
          ["E", "F", 2],
          ["B", "C", 3],
          ["D", "E", 3],
        ],
      ],
      [
        "2",
        [
          ["A", "B", 2],
          ["B", "C", 3],
          ["C", "D", 1],
          ["D", "F", 6],
          ["E", "F", 2],
        ],
      ],
      [
        "3",
        [
          ["A", "B", 2],
          ["C", "D", 1],
          ["E", "F", 2],
          ["B", "C", 3],
        ],
      ],
      [
        "4",
        [
          ["A", "C", 4],
          ["B", "C", 3],
          ["C", "D", 1],
          ["D", "E", 3],
          ["E", "F", 2],
        ],
      ],
    ];
    const ox = [4, 176],
      oy = [4, 160];
    let g = "";
    plans.forEach(([name, edges], i) => {
      const x0 = ox[i % 2],
        y0 = oy[Math.floor(i / 2)];
      g += R(x0, y0, 170, 150, { r: 12 });
      edges.forEach(([a, b, c]) => {
        const [x1, y1] = pos[a],
          [x2, y2] = pos[b];
        g += L(x0 + x1, y0 + y1, x0 + x2, y0 + y2, { c: "var(--blue)", sw: 3.5 });
      });
      edges.forEach(([a, b, c]) => {
        const [x1, y1] = pos[a],
          [x2, y2] = pos[b],
          dx = x2 - x1,
          dy = y2 - y1,
          Ln = Math.hypot(dx, dy),
          lx = x0 + (x1 + x2) / 2 - (dy / Ln) * 10,
          ly = y0 + (y1 + y2) / 2 + (dx / Ln) * 10;
        g +=
          R(lx - 8, ly - 9, 16, 18, { f: "var(--panel)", s: "none", r: 4, sw: 0 }) +
          T(lx, ly + 5, c, { z: 14, c: "var(--rose-ink)" });
      });
      Object.entries(pos).forEach(([k, [x, y]]) => (g += C(x0 + x, y0 + y, 9, { s: "var(--text-dim)", sw: 3 })));
      g += T(x0 + 85, y0 + 144, "Plan " + name, { z: 14 }) + hit("p" + name, x0, y0, 170, 150, 12);
    });
    return svg(350, 314, g);
  })();

  const mstTrace = (() => {
    const nodes = { A: [30, 80], B: [105, 25], C: [105, 135], D: [220, 80], E: [330, 25], F: [330, 135] };
    const edges = [
      ["A", "B", 4],
      ["A", "C", 2],
      ["C", "B", 1],
      ["B", "D", 5],
      ["C", "D", 8],
      ["D", "E", 3],
      ["D", "F", 7],
      ["E", "F", 6],
    ];
    const graph = NIC.qfig.graph(nodes, edges, { w: 360, h: 160, r: 16 });
    const rows = [
      ["1", "A – C", 2],
      ["2", "C – B", 1],
      ["3", "B – D", 5],
      ["4", "D – F", 7],
      ["5", "D – E", 3],
    ];
    const tbl = `<table style="border-collapse:separate;border-spacing:4px;margin:6px auto 0;font:800 14px var(--sans);color:var(--text)"><tr style="color:var(--text-dim);font-size:12px"><td>Step</td><td>Edge added</td><td>Cost</td></tr>${rows.map((r) => `<tr><td style="padding:5px 12px;background:var(--bg-2);border-radius:8px;text-align:center">${r[0]}</td><td style="padding:5px 14px;background:var(--blue-dim);border-radius:8px;text-align:center">${r[1]}</td><td style="padding:5px 12px;background:var(--bg-2);border-radius:8px;text-align:center">${r[2]}</td></tr>`).join("")}</table>`;
    return `<div style="max-width:380px;margin:0 auto">${graph}${tbl}</div>`;
  })();

  const mstMatrix = (() => {
    const names = "ABCDE",
      M = { AB: 7, AC: 3, AE: 9, BC: 2, BD: 5, CD: 6, CE: 8, DE: 4 };
    const x0 = 56,
      y0 = 62,
      cs = 52;
    let g = T(180, 16, "Cost of each possible cable (– means none)", { z: 13, c: "var(--text-dim)" });
    [...names].forEach(
      (n, i) =>
        (g +=
          T(x0 + i * cs + cs / 2, y0 - 6, n, { z: 15, c: "var(--blue-ink)" }) +
          T(x0 - 18, y0 + i * cs + cs / 2 + 5, n, { z: 15, c: "var(--blue-ink)" })),
    );
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++) {
        const x = x0 + c * cs,
          y = y0 + r * cs;
        if (c <= r) {
          g += R(x + 2, y + 2, cs - 4, cs - 4, { f: "var(--bg-2)", s: "none", r: 8, sw: 0, o: 0.6 });
          continue;
        }
        const key = names[r] + names[c],
          v = M[key];
        if (v === undefined) {
          g +=
            R(x + 2, y + 2, cs - 4, cs - 4, { r: 8, sw: 1.5 }) +
            T(x + cs / 2, y + cs / 2 + 5, "–", { z: 16, c: "var(--text-faint)" });
          continue;
        }
        g +=
          R(x + 2, y + 2, cs - 4, cs - 4, { r: 8, f: "var(--panel)", s: "var(--line-2)" }) +
          T(x + cs / 2, y + cs / 2 + 6, v, { z: 17 }) +
          hit(key, x + 2, y + 2, cs - 4, cs - 4, 8);
      }
    return svg(330, y0 + 5 * cs + 8, g);
  })();

  const mstLoop = (() => {
    const N = { A: [34, 150], B: [114, 150], C: [114, 50], D: [254, 50], E: [254, 150], F: [346, 150] };
    const tree = [
      ["A", "B", 9],
      ["B", "C", 4],
      ["C", "D", 6],
      ["D", "E", 2],
      ["E", "F", 5],
    ];
    let g =
      L(N.B[0] + 18, N.B[1], N.E[0] - 18, N.E[1], { c: "var(--amber)", d: "7 6", sw: 4 }) +
      T(184, 140, "new link: 3", { z: 13, c: "var(--amber-ink)" });
    tree.forEach(([a, b, w]) => {
      const [x1, y1] = N[a],
        [x2, y2] = N[b],
        dx = x2 - x1,
        dy = y2 - y1,
        Ln = Math.hypot(dx, dy),
        sx = x1 + (dx / Ln) * 18,
        sy = y1 + (dy / Ln) * 18,
        ex = x2 - (dx / Ln) * 18,
        ey = y2 - (dy / Ln) * 18;
      const mx = (x1 + x2) / 2,
        my = (y1 + y2) / 2,
        vert = Math.abs(dx) < 1;
      g +=
        `<g data-pick="${a}${b}">${L(sx, sy, ex, ey, { c: "var(--blue)", sw: 4 })}<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="transparent" stroke-width="22"/></g>` +
        T(vert ? mx + (x1 < 200 ? -15 : 15) : mx, vert ? my + 5 : my - 12, w, { z: 14, c: "var(--rose-ink)" });
    });
    Object.entries(N).forEach(
      ([k, [x, y]]) => (g += C(x, y, 18, { s: "var(--text-dim)", sw: 3 }) + T(x, y + 5, k, { z: 15 })),
    );
    return svg(380, 190, g);
  })();

  B.add("l2-mst", [
    {
      type: "pick",
      q: "Six towns A to F must be joined by cable. Each plan shows the links it would lay, with the cost of each link in red. Tap the plan with the lowest total cost among those that really connect all six towns with no loops.",
      fig: mstPlans,
      a: "p1",
      hint: "First check each plan reaches all six towns. Then add up the costs of the ones that do.",
      why: "Plan 1 costs 1 + 2 + 2 + 3 + 3 = 11 and reaches every town. Plan 4 costs 13 and plan 2 costs 14, both valid trees, but dearer. Plan 3 is the cheapest at 8 but leaves two towns cut off from the rest, so it does not count. A spanning tree on 6 towns needs exactly 5 links.",
    },
    {
      type: "mcq",
      q: "A student runs Prim's algorithm from town A on the network below and records the steps in the table. Prim always adds the cheapest link that joins the tree to a new town. Which step first breaks that rule?",
      fig: mstTrace,
      o: ["Step 2", "Step 3", "Step 4", "Step 5"],
      a: 2,
      hint: "At each step, list the links that join the tree so far to a town outside it, and compare.",
      why: "At step 4 the tree is A, B, C and D. The links leaving it are D–E (3) and D–F (7), so Prim must add D–E. The student added D–F (7). Steps 2 and 5 look suspicious because their costs go down, but Prim's costs need not rise: they just have to be the cheapest on offer at the time (at step 2, C–B at 1 was available once C was in the tree).",
    },
    {
      type: "pick",
      q: "The table gives the cost of each possible cable between five towns (– means no cable can be laid). Run Prim's algorithm from town A and select the cell of every cable it adds.",
      fig: mstMatrix,
      a: ["AC", "BC", "BD", "DE"],
      why: "From A the cheapest cable is A–C (3). The tree {A, C} can reach B for 2 (B–C, cheaper than A–B at 7). Then {A, B, C} reaches D by B–D (5, cheaper than C–D at 6). Finally {A, B, C, D} reaches E by D–E (4, cheaper than C–E at 8 or A–E at 9). Four cables for five towns, total 3 + 2 + 5 + 4 = 14.",
    },
    {
      type: "pick",
      q: "These cables (with their costs) form a cheapest spanning tree. A new link between B and E, costing 3, becomes available (dashed). Adding it makes a loop. To end with a spanning tree that is as cheap as possible, which existing cable should be removed? Tap it.",
      fig: mstLoop,
      a: "CD",
      why: "The new link creates the loop B–C–D–E–B, with costs 4, 6, 2 and 3. Any one cable on the loop can go without disconnecting anyone, so the best swap removes the dearest one on it: C–D at 6. That cuts the total by 3. A–B costs more (9) but is not on the loop, and removing it would cut off town A.",
    },
    {
      type: "cat",
      q: "A network firm asks for the cheapest set of cables joining some sites. Which versions are plain minimum spanning tree problems, where greedy Prim is optimal, and which add a rule that makes the problem hard?",
      buckets: ["Plain MST", "Constrained, hard"],
      items: [
        ["Join 9 offices with the least total cable; any office can host any number of cables", 0],
        ["Join 9 offices, but no office may have more than 3 cables on its patch panel", 1],
        ["Join 12 villages by the cheapest total length of pipe, any layout allowed", 0],
        ["Join 12 villages by pipe, but the route between two named hospitals may use at most 4 pipes", 1],
        ["Join 30 towns by the cheapest road network, with no other rules", 0],
        ["Join 30 towns, but some pairs of towns need a minimum bandwidth between them", 1],
      ],
      why: "Without extra rules, Prim is greedy and provably optimal, however many sites there are. Adding a degree limit, a limit on route length or bandwidth needs between pairs makes many trees infeasible and greedy choices can trap you, and no fast exact method is known. Real networks are usually the constrained kind.",
    },
  ]);
})();

/* ===== bank-x-nic-2.js ===== */
/* Revision bank, third set of varied, visual questions (nic-2: l2-approx, l3-recipe, l3-tsp, l3-hc, l3-landscape,
   l3-neighbourhood, l3-local, l3-population). Every number is checked with node (see the notes beside each figure). */
(function () {
  const B = NIC.bank;

  /* ---------- small SVG helpers (CSS variables so both themes work) ---------- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, s, { a = "middle", c = "var(--text)", f = "800 13px" } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${f} var(--sans);fill:${c}">${s}</text>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2, d = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const rc = (x, y, w, h, { f = "var(--panel)", s = "var(--line-2)", sw = 2, r = 8, o = 1 } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" fill-opacity="${o}" stroke="${s}" stroke-width="${sw}"/>`;
  const ci = (x, y, r, { f = "var(--panel)", s = "var(--line-2)", sw = 2.5 } = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
  const pl = (pts, c, w = 3, d = "") =>
    `<polyline points="${pts.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const hit = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const mark = (id) =>
    `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--text-faint)"/></marker></defs>`;
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  };
  const pow10 = (x, y, e, c = "var(--text-faint)") =>
    `<text x="${x}" y="${y}" text-anchor="middle" style="font:700 12px var(--sans);fill:${c}">10<tspan dy="-6" style="font-size:10px">${e}</tspan></text>`;

  /* ======================================================================
     l2-approx : number line, dot strips, pixel grid, column chart
     ====================================================================== */
  // log10 positions: day of checking at 1e9/s = 8.64e13 (13.94). Dots at 11.5, 12.7, 13.5 are under it; 14.3 (2e14 = 2.3 days), 15.6, 17.8 are over.
  const numLineFig = () => {
    const X = (e) => 40 + (e - 10) * 50;
    let s = ln(30, 120, 450, 120, "var(--text-faint)", 3);
    for (let e = 10; e <= 18; e++) s += ln(X(e), 114, X(e), 126, "var(--text-faint)", 2) + pow10(X(e), 146, e);
    [
      ["A", 11.5],
      ["B", 12.7],
      ["C", 13.5],
      ["D", 14.3],
      ["E", 15.6],
      ["F", 17.8],
    ].forEach(([k, e]) => {
      s +=
        ln(X(e), 92, X(e), 120, "var(--line-2)", 2, "3 4") +
        hit(k, `${ci(X(e), 76, 16, { s: "var(--blue)", sw: 3 })}${tx(X(e), 81, k, { f: "900 14px" })}`);
    });
    s += tx(245, 178, "designs in the problem (each tick is 10 times more)", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 190, s);
  };

  const STRIPS = {
    A: Array(10).fill(400),
    B: [412, 407, 455, 431, 468, 420, 409, 444, 426, 438],
    C: Array(10).fill(438),
  };
  const stripFig = () => {
    const Y = (v) => 175 - (v - 390) * 1.55;
    let s = "";
    [400, 440, 480].forEach(
      (v) =>
        (s +=
          tx(30, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) +
          ln(34, Y(v), 36, Y(v), "var(--text-faint)", 1.5)),
    );
    [
      ["A", 36],
      ["B", 176],
      ["C", 316],
    ].forEach(([k, px]) => {
      s +=
        rc(px, 26, 124, 164, { r: 10, s: "var(--line)", f: "var(--bg-2)" }) +
        tx(px + 62, 18, "Method " + k, { f: "900 14px" });
      s += ln(px + 4, Y(400), px + 120, Y(400), "var(--teal)", 2.5, "6 4");
      STRIPS[k].forEach(
        (v, i) => (s += ci(px + 12 + i * 11.2, Y(v), 4.5, { f: "var(--amber)", s: "var(--amber-ink)", sw: 1.5 })),
      );
    });
    ["A", "B", "C"].forEach(
      (k, i) => (s += hit(k, rc(34 + i * 140, 22, 128, 172, { f: "transparent", s: "transparent", sw: 2, r: 12 }))),
    );
    s += tx(235, 210, "each dot: route length (km) from one of 10 runs. Dashed green: the best possible, 400 km", {
      f: "700 11px",
      c: "var(--text-faint)",
    });
    return svg(470, 220, s);
  };

  const gridFig = () => {
    const R = rng(11),
      C = 26,
      x0 = 8,
      y0 = 8;
    const cost = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 35 + Math.floor(R() * 58)));
    cost[2][6] = 31;
    let s = "";
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 10; c++) {
        const x = x0 + c * C,
          y = y0 + r * C;
        if (r < 4)
          s +=
            rc(x, y, C - 2, C - 2, {
              f: "var(--blue)",
              o: 0.12 + ((93 - cost[r][c]) / 58) * 0.55,
              s: r === 2 && c === 6 ? "var(--teal)" : "var(--line)",
              sw: r === 2 && c === 6 ? 3.5 : 1,
              r: 4,
            }) + tx(x + C / 2 - 1, y + C / 2 + 4, cost[r][c], { f: "800 11px" });
        else s += rc(x, y, C - 2, C - 2, { f: "var(--bg-2)", s: "var(--line)", sw: 1, r: 4 });
      }
    s +=
      rc(290, 22, 22, 22, { f: "var(--blue)", o: 0.45, s: "var(--line)", sw: 1, r: 4 }) +
      tx(322, 38, "checked: 40 designs", { a: "start" });
    s +=
      rc(290, 58, 22, 22, { f: "var(--bg-2)", s: "var(--line)", sw: 1, r: 4 }) +
      tx(322, 74, "not checked: 60", { a: "start" });
    s +=
      rc(290, 94, 22, 22, { f: "none", s: "var(--teal)", sw: 3.5, r: 4 }) +
      tx(322, 110, "best so far: 31", { a: "start" });
    s +=
      tx(290, 150, "Number = cost of the design.", { a: "start", f: "700 12px", c: "var(--text-faint)" }) +
      tx(290, 168, "Darker blue = cheaper.", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 276, s);
  };

  const colFig = () => {
    let s = ln(40, 190, 440, 190, "var(--text-faint)", 2.5);
    for (let i = 0; i < 7; i++) {
      const h = 2 ** i,
        x = 56 + i * 54,
        bh = h * 2.2;
      s +=
        rc(x, 190 - bh, 38, bh, { f: "var(--amber)", o: 0.35, s: "var(--amber)", sw: 2.5, r: 5 }) +
        tx(x + 19, 190 - bh - 7, h + " h", { f: "900 13px" }) +
        tx(x + 19, 210, 40 + i, { f: "800 13px", c: "var(--text-dim)" });
    }
    s += tx(245, 232, "number of in-or-out items, n", { f: "700 12px", c: "var(--text-faint)" });
    s += `<text transform="translate(16,110) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">time to check every subset</text>`;
    return svg(470, 242, s);
  };

  B.add("l2-approx", [
    {
      type: "pick",
      q: "Each dot is the number of designs in a different problem. A computer checks one billion designs a second and you can wait one day. Click every problem you could solve by checking every design.",
      fig: numLineFig(),
      a: ["A", "B", "C"],
      hint: "A day is about 100,000 seconds, so one billion a second gives about 10 to the power 14 checks in total.",
      why: "A day has about 86,400 seconds, so a billion checks a second covers roughly 10¹⁴ designs. A, B and C sit to the left of that mark (C is about 3 × 10¹³, around nine hours of checking). D is about 2 × 10¹⁴, over two days. E needs about 46 days and F about 20 years, so those need an approximate method.",
    },
    {
      type: "pick",
      q: "Three methods each ran 10 times on the same routing problem. The dashed line is the proven best route, 400 km. Click the method for which running it again with a fresh random seed could give you a better answer.",
      fig: stripFig(),
      a: "B",
      hint: "Ask: does a second run give anything different from the first?",
      why: "Method A already lands on 400 km every time, so there is nothing to gain. Method C returns the same 438 km on every run, so a rerun just repeats it. Only B varies from run to run (407 to 468 km), so each extra run is a new chance to beat the last, and keeping the best of many runs pulls its answer towards the optimum.",
    },
    {
      q: "A search checks every design in order, row by row, and is stopped after 40 of the 100. The cheapest design so far costs 31 (outlined). What can you say about the cheapest of all 100 designs?",
      fig: gridFig(),
      o: [
        "It could be cheaper than 31, since 60 designs are unchecked",
        "It is exactly 31, because the search keeps the cheapest it has seen",
        "It is above 31, because the cheap rows are always checked first",
        "It is within a few per cent of 31, since 40 designs is a fair sample",
      ],
      a: 0,
      why: "Checking 40% of the designs proves nothing about the other 60%: any of them might cost less than 31. 31 is the best so far, not the best overall. An exhaustive search that is stopped early has become an approximate method with no guarantee. Only a finished search proves the optimum.",
    },
    {
      type: "slider",
      q: "The chart shows how long a computer needs to check every in-or-out choice for n items. A new computer is 1,000 times faster. About how many items could it handle in the same 1 hour?",
      fig: colFig(),
      min: 40,
      max: 70,
      step: 1,
      ans: 50,
      tol: 2,
      unit: "items",
      hint: "Each extra item doubles the time. 1,000 is close to 1,024, which is ten doublings (2 × 2 × 2 … ten times).",
      why: "Ten doublings multiply the time by 2¹⁰ = 1,024, about 1,000. A computer 1,000 times faster therefore buys only ten more items (40 to 50) in the same hour. For exponential problems, faster hardware helps very little, which is why we turn to approximate methods.",
    },
  ]);

  /* ======================================================================
     l3-recipe : flow diagram, 100% stacked bars, step line, small-multiple charts
     ====================================================================== */
  const recipeFlow = () => {
    const bx = (x, y, a, b) =>
      rc(x - 55, y - 23, 110, 46, { r: 12, s: "var(--blue)", sw: 2.5 }) +
      (b
        ? tx(x, y - 3, a, { f: "800 12px" }) + tx(x, y + 13, b, { f: "800 12px" })
        : tx(x, y + 5, a, { f: "800 13px" }));
    const arr = (id, x1, y1, x2, y2) =>
      hit(
        id,
        `${ln(x1, y1, x2, y2, "var(--text-faint)", 3).replace("/>", ` marker-end="url(#rfa)"/>`)}${ln(x1, y1, x2, y2, "transparent", 26)}`,
      );
    let s = mark("rfa");
    s +=
      bx(72, 50, "Make random", "population") + bx(230, 50, "Score every", "member") + bx(388, 50, "Select", "parents");
    s += bx(388, 170, "Crossover +", "mutation") + bx(230, 170, "Replace the", "weakest") + bx(72, 170, "Stop?");
    s +=
      arr("is", 127, 50, 170, 50) +
      arr("ss", 285, 50, 328, 50) +
      arr("sv", 388, 73, 388, 142) +
      arr("vr", 333, 170, 290, 170) +
      arr("rs", 175, 170, 132, 170);
    s += hit(
      "loop",
      `<path d="M72 147 V112 H350 V76" fill="none" stroke="var(--text-faint)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#rfa)"/><path d="M72 147 V112 H350 V76" fill="none" stroke="transparent" stroke-width="22"/>`,
    );
    s +=
      tx(210, 104, "no: go round again", { f: "700 12px", c: "var(--text-faint)" }) +
      tx(72, 208, "yes: return the best", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 220, s);
  };

  const shareFig = () => {
    const rows = [
      ["Population 1: fitness 50, 51, 52, 53", [50, 51, 52, 53]],
      ["Population 2: fitness 0, 1, 2, 3", [0, 1, 2, 3]],
    ];
    const cols = [
      ["blue-dim", "blue"],
      ["teal-dim", "teal"],
      ["amber-dim", "amber"],
      ["violet-dim", "violet"],
    ];
    let s = "";
    rows.forEach(([t, f], r) => {
      const y = 36 + r * 88,
        tot = f.reduce((a, b) => a + b, 0);
      s += tx(30, y - 12, t, { a: "start", f: "800 13px" });
      let x = 30;
      f.forEach((v, i) => {
        const w = (380 * v) / tot;
        if (w > 0)
          s +=
            rc(x, y, w, 40, { f: `var(--${cols[i][0]})`, s: `var(--${cols[i][1]})`, sw: 2.5, r: 0 }) +
            tx(x + w / 2, y + 26, v, { f: "900 14px" });
        else s += tx(x - 6, y + 26, "0", { a: "end", f: "900 14px", c: "var(--text-faint)" });
        x += w;
      });
    });
    s += tx(30, 188, "bar length = each member's share of the parent picks", {
      a: "start",
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(450, 198, s);
  };

  // best fitness so far: jumps at generations 5, 12, 25, 31, 58 (levels 20, 35, 50, 58, 63)
  const stepFig = () => {
    const X = (g) => 50 + g * 1.95,
      Y = (f) => 200 - f * 2.3;
    const jumps = [
      [0, 12],
      [5, 20],
      [12, 35],
      [25, 50],
      [31, 58],
      [58, 63],
      [200, 63],
    ];
    const pts = [[X(0), Y(12)]];
    for (let i = 1; i < jumps.length; i++)
      pts.push([X(jumps[i][0]), Y(jumps[i - 1][1])], [X(jumps[i][0]), Y(jumps[i][1])]);
    let s = ln(50, 200, 445, 200, "var(--text-faint)", 2.5) + ln(50, 30, 50, 200, "var(--text-faint)", 2.5);
    [0, 50, 100, 150, 200].forEach(
      (g) =>
        (s +=
          ln(X(g), 200, X(g), 206, "var(--text-faint)", 2) +
          tx(X(g), 222, g, { f: "700 12px", c: "var(--text-faint)" })),
    );
    [0, 20, 40, 60].forEach((f) => (s += tx(44, Y(f) + 4, f, { a: "end", f: "700 11px", c: "var(--text-faint)" })));
    s += pl(pts, "var(--teal)", 3.5);
    [
      [31, 58],
      [51, 58],
      [78, 63],
      [100, 63],
      [200, 63],
    ].forEach(
      ([g, f]) =>
        (s +=
          ln(X(g), Y(f) - 10, X(g), Y(f), "var(--blue)", 2, "3 3") +
          hit(
            "g" + g,
            `${ci(X(g), Y(f) - 25, 14, { s: "var(--blue)", sw: 3 })}${tx(X(g), Y(f) - 21, g, { f: "900 11px" })}`,
          )),
    );
    s += tx(250, 244, "generation", { f: "700 12px", c: "var(--text-faint)" });
    s += `<text transform="translate(12,115) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">best fitness so far</text>`;
    return svg(470, 254, s);
  };

  // real simulated runs (40-bit OneMax, population 20, seed 4): [best, average] by generation
  const EA = {
    A: {
      b: [
        28, 28, 28, 30, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
      ],
      a: [
        20.4, 24.7, 27.9, 28.1, 28.9, 31.6, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
      ],
    },
    B: {
      b: [
        28, 26, 25, 26, 24, 26, 25, 27, 28, 25, 25, 23, 29, 28, 26, 28, 27, 26, 26, 29, 23, 29, 25, 26, 28, 26, 28, 28,
        23, 24, 29, 26, 26, 24, 28, 23, 25, 25, 25, 27, 24,
      ],
      a: [
        20.4, 19.3, 19.6, 19.6, 19.3, 20.6, 20.1, 20.1, 20, 20.1, 20.1, 20.3, 20.6, 20.8, 19.9, 20.9, 20.9, 20.9, 20.6,
        21.7, 20.4, 18.1, 20.6, 21.4, 20.3, 20.4, 20, 19.3, 19.6, 19.2, 20.1, 20, 21.3, 20.1, 20.4, 18.6, 20.7, 20.3,
        19.6, 20.9, 19.7,
      ],
    },
    C: {
      b: [
        28, 28, 29, 29, 31, 31, 30, 32, 33, 33, 33, 34, 35, 36, 35, 36, 36, 37, 37, 38, 37, 37, 36, 36, 37, 36, 36, 37,
        36, 35, 35, 35, 36, 36, 37, 37, 37, 37, 38, 38, 38,
      ],
      a: [
        20.4, 21.6, 24.4, 25.8, 26.9, 27.9, 28.1, 28.6, 28.6, 29.8, 30.3, 31.1, 31.6, 31.8, 32.1, 32.4, 32.5, 33.5, 34,
        34, 34.1, 33.6, 33.7, 33.6, 34, 34.1, 34, 34.2, 34, 33.5, 33.1, 33, 33.2, 33.8, 34.3, 34.2, 34.6, 35, 35.6,
        35.5, 35.8,
      ],
    },
  };
  const eaFig = () => {
    const Y = (v) => 118 - (v - 18) * 3.6;
    let s = "";
    [
      ["A", 24],
      ["B", 178],
      ["C", 332],
    ].forEach(([k, px]) => {
      const X = (g) => px + 6 + g * 3.2;
      s += rc(px, 26, 134, 100, { r: 8, s: "var(--line)", f: "var(--bg-2)" });
      [20, 30, 40].forEach(
        (v) =>
          (s +=
            ln(px + 2, Y(v), px + 132, Y(v), "var(--line)", 1) +
            (k === "A" ? tx(px - 4, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) : "")),
      );
      s +=
        pl(
          EA[k].a.map((v, g) => [X(g), Y(v)]),
          "var(--amber)",
          2.5,
          "5 4",
        ) +
        pl(
          EA[k].b.map((v, g) => [X(g), Y(v)]),
          "var(--teal)",
          3,
        );
      s +=
        tx(px + 67, 146, "Run " + k, { f: "900 14px" }) +
        tx(px + 67, 164, "generations 0 to 40", { f: "700 11px", c: "var(--text-faint)" });
    });
    s += tx(235, 14, "solid green: best member    dashed orange: average member", {
      f: "700 12px",
      c: "var(--text-dim)",
    });
    return svg(472, 174, s);
  };

  B.add("l3-recipe", [
    {
      type: "pick",
      q: "Replacement compares fitness values, yet in this EA the children have never been scored when they reach the Replace step. Click the arrow where a box is missing.",
      fig: recipeFlow(),
      a: "vr",
      hint: "Which step produces new members, and which step needs to compare them with the old ones?",
      why: "Crossover and mutation make brand-new strings with no fitness yet. Replace-the-weakest has to compare a child's fitness with the population's, so a 'Score the children' box must sit on that arrow. The other arrows are fine: the starting population is scored before selection, and the loop-back repeats the cycle.",
    },
    {
      q: "Both lists rank the four members the same way. Under fitness-proportional selection (chance of being picked = fitness ÷ total), which statement is true?",
      fig: shareFig(),
      o: [
        "Population 1 picks almost evenly, so selection there is weak",
        "Both populations favour their best member by the same amount",
        "Population 2 picks its best member about three times as often",
        "Population 1 picks its best member far more often than its worst",
      ],
      a: 0,
      hint: "Population 1's total is 50 + 51 + 52 + 53 = 206. Is 53 out of 206 much more than 50 out of 206?",
      why: "In population 1 the shares are 24%, 25%, 25% and 26%, nearly equal, so selection is almost random even though the ranking is the same. Population 2's shares are 0%, 17%, 33% and 50%. The selection pressure depends on the gaps between fitness values, not just their order, which is why rank-based or tournament selection is often preferred.",
    },
    {
      type: "pick",
      q: "The line is the best fitness found so far in one EA run (higher is better). The rule is: stop as soon as 20 generations pass with no improvement. Click the generation where this run would stop.",
      fig: stepFig(),
      a: "g51",
      hint: "Find the jump that comes before a long flat stretch. Count 20 generations along from there.",
      why: "The last improvement before the long flat patch is at generation 31. Twenty generations later, at 51, nothing has improved, so the run stops. It never sees the improvement at generation 58 (58 up to 63). Waiting 20 generations is a gamble, not a guarantee, and the stalling patch here was 27 generations long.",
    },
    {
      type: "match",
      q: "Each chart tracks one EA on a 40-bit problem. Match each run to the settings that most likely produced it.",
      fig: eaFig(),
      pairs: [
        ["Run A", "Very strong selection, no mutation"],
        ["Run B", "Mutation so heavy that children are nearly random"],
        ["Run C", "Moderate selection and light mutation"],
      ],
      why: "Run A: best and average meet at 33 and stay flat. Copies of one good member fill the population and, with no mutation, nothing new can appear. Run B: the average sits near 20, which is what a random 40-bit string scores, so heavy mutation scrambles every child and progress is lost. Run C: the best keeps rising (28 to 38) and the average follows it up.",
    },
  ]);

  /* ======================================================================
     l3-tsp : triangle heat table, decision tree, worked-example trace, stacked hop bars
     ====================================================================== */
  const TRI = { AB: 4, AC: 7, AD: 5, AE: 6, BC: 3, BD: 8, BE: 2, CD: 4, CE: 9, DE: 3 };
  const triFig = () => {
    const rows = "ABCD".split(""),
      cols = "BCDE".split(""),
      x0 = 66,
      y0 = 44,
      W = 76,
      H = 46;
    let s = "";
    cols.forEach((c, j) => (s += tx(x0 + j * W + W / 2, 34, c, { f: "900 15px" })));
    rows.forEach((r, i) => (s += tx(x0 - 12, y0 + i * H + H / 2 + 5, r, { f: "900 15px" })));
    const ticked = ["AC", "BC", "BE", "DE"];
    rows.forEach((r, i) =>
      cols.forEach((c, j) => {
        if (j + 1 <= i) return;
        const k = r + c,
          d = TRI[k],
          x = x0 + j * W,
          y = y0 + i * H,
          t = ticked.includes(k);
        s += hit(
          k,
          `${rc(x + 2, y + 2, W - 4, H - 4, { f: "var(--blue)", o: 0.1 + d * 0.06, s: t ? "var(--teal)" : "var(--line-2)", sw: t ? 3.5 : 2, r: 8 })}${tx(x + W / 2, y + H / 2 + 6, d, { f: "900 18px" })}${t ? `<path d="M${x + W - 22} ${y + 14} l5 5 l9 -10" fill="none" stroke="var(--teal-ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ""}`,
        );
      }),
    );
    s += tx(x0 + 2 * W, y0 + 4 * H + 24, "Ticked cells add up to 15. Darker blue = farther apart.", {
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(400, 280, s);
  };

  const treeFig = () => {
    const lx = (i) => 48 + i * 72;
    const L1 = [
      [
        "B",
        [
          ["C", "ABCD"],
          ["D", "ABDC"],
        ],
      ],
      [
        "C",
        [
          ["B", "ACBD"],
          ["D", "ACDB"],
        ],
      ],
      [
        "D",
        [
          ["B", "ADBC"],
          ["C", "ADCB"],
        ],
      ],
    ];
    let s = "",
      leaf = 0;
    const rootX = (lx(0) + lx(5)) / 2;
    L1.forEach(([c1, kids], i) => {
      const x1 = (lx(i * 2) + lx(i * 2 + 1)) / 2;
      s += ln(rootX, 34, x1, 82, "var(--line-2)", 2.5);
      kids.forEach(([c2, str]) => {
        const x = lx(leaf++);
        s += ln(x1, 82, x, 138, "var(--line-2)", 2.5) + ln(x, 138, x, 178, "var(--line-2)", 2.5);
      });
    });
    leaf = 0;
    s += ci(rootX, 26, 16, { s: "var(--teal)", sw: 3 }) + tx(rootX, 31, "A", { f: "900 14px" });
    L1.forEach(([c1, kids], i) => {
      const x1 = (lx(i * 2) + lx(i * 2 + 1)) / 2;
      s += ci(x1, 82, 15) + tx(x1, 87, c1, { f: "900 14px" });
      kids.forEach(([c2, str]) => {
        const x = lx(leaf++);
        s +=
          ci(x, 138, 15) +
          tx(x, 143, c2, { f: "900 14px" }) +
          hit(
            str,
            `${rc(x - 31, 178, 62, 30, { r: 9, s: "var(--blue)", sw: 2.5 })}${tx(x, 199, str, { f: "900 14px" })}`,
          );
      });
    });
    s += tx(235, 232, "Each path from the top is one tour that starts at A. The last city is forced.", {
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(470, 242, s);
  };

  const workedFig = () => {
    const st = [
      "List the 7 cities in a row: 7! = 5,040 orders",
      "Any city could start the same loop, so ÷ 6: 840",
      "A loop and its reverse match, so ÷ 2: 420",
      "So there are 420 distinct tours",
    ];
    let s = "";
    st.forEach(
      (t, i) =>
        (s += hit(
          "s" + (i + 1),
          `${rc(10, 8 + i * 56, 440, 46, { r: 12, s: "var(--blue)", sw: 2.5 })}${ci(36, 31 + i * 56, 14, { f: "var(--blue-dim)", s: "var(--blue)", sw: 2 })}${tx(36, 36 + i * 56, i + 1, { f: "900 14px" })}${tx(60, 36 + i * 56, t, { a: "start", f: "800 14px" })}`,
        )),
    );
    return svg(460, 236, s);
  };

  const hopFig = () => {
    const G = [2, 2, 2, 4, 4, 11],
      O = [3, 4, 2, 3, 3, 2],
      U = 14;
    const bar = (t, a, y) => {
      let s = tx(30, y - 10, t, { a: "start", f: "800 13px" }),
        x = 30;
      a.forEach((v, i) => {
        s +=
          rc(x, y, v * U, 40, {
            f: i % 2 ? "var(--teal-dim)" : "var(--blue-dim)",
            s: i % 2 ? "var(--teal)" : "var(--blue)",
            sw: 2.5,
            r: 0,
          }) + tx(x + (v * U) / 2, y + 26, v, { f: "900 14px" });
        x += v * U;
      });
      return s;
    };
    return svg(
      460,
      150,
      bar("Nearest-neighbour tour: the six hops in order", G, 30) + bar("Best tour: the six hops in order", O, 98),
    );
  };

  B.add("l3-tsp", [
    {
      type: "pick",
      q: "The table gives the distance for each pair of five cities. A student adds up the tour A → C → B → E → D → A using the ticked cells, and gets 15. One cell the tour needs is not ticked. Click it.",
      fig: triFig(),
      a: "AD",
      hint: "List the five hops of the closed tour: A–C, C–B, B–E, E–D, and then the hop home.",
      why: "The closed tour uses AC (7), BC (3), BE (2), DE (3) and the way home, D back to A (5). The student ticked only the first four, 15 in all, and forgot the return hop. The true length is 20. A tour is a loop, so the last city always has one more hop back to the start.",
    },
    {
      type: "pick",
      q: "The tree lists every ordered tour of four cities that starts at A. A student writes the loop A → C → D → B → A as ACDB. Click the other leaf that is the same loop travelled the opposite way round.",
      fig: treeFig(),
      a: "ABDC",
      hint: "Read ACDB backwards starting from A: A, then B, then D, then C.",
      why: "Going round the loop the other way from A visits B, D, C: that is ABDC. The six leaves pair up into three loops (ABCD with ADCB, ABDC with ACDB, ACBD with ADBC), so there are 3!/2 = 3 distinct tours, not 6.",
    },
    {
      type: "pick",
      q: "A student works out how many distinct round trips there are for 7 cities. Exactly one step is wrong. Click it.",
      fig: workedFig(),
      a: "s2",
      hint: "Fixing the starting city means dividing by how many cities could have been the start.",
      why: "There are 7 possible starting cities for the same loop, so step 2 should divide by 7, not 6: 5,040 ÷ 7 = 720. Halving for direction gives 360, which is (7 − 1)! ÷ 2. The student's 420 is too big. Step 1 and step 3 are correct.",
    },
    {
      type: "slider",
      q: "Each bar shows the six hop lengths of one tour of the same six cities, in order. About how many per cent longer is the nearest-neighbour tour than the best tour?",
      fig: hopFig(),
      min: 0,
      max: 120,
      step: 5,
      ans: 45,
      tol: 10,
      unit: "%",
      hint: "Add each bar's numbers. A tour 50% longer than 17 would be 25.5.",
      why: "Nearest-neighbour: 2 + 2 + 2 + 4 + 4 + 11 = 25. Best: 3 + 4 + 2 + 3 + 3 + 2 = 17. 25 is about 47% more than 17. The greedy tour spent only 14 on its first five hops, but those cheap hops used up the nearby cities and left a 11-long hop home, longer than any hop of the best tour (its longest is 4).",
    },
  ]);

  /* ======================================================================
     l3-hc : small-multiple runs, restart flow chart, bit-string transitions, scatter
     ====================================================================== */
  const hcF = (x) => (x <= 8 ? x : x <= 24 ? 8 : x - 16); // slope to 8, plateau 8..24, then slope up (x = 30 gives 14)
  const hcRun = (eq, seed, n = 80) => {
    let s = seed;
    const R = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    let x = 0;
    const tr = [hcF(x)];
    for (let i = 0; i < n; i++) {
      const y = x + (R() < 0.5 ? -1 : 1);
      if (y >= 0 && y <= 30 && (hcF(y) > hcF(x) || (eq && hcF(y) === hcF(x)))) x = y;
      tr.push(hcF(x));
    }
    return tr;
  };
  const hcPanels = () => {
    const runs = { A: hcRun(false, 193), B: hcRun(true, 193) },
      Y = (v) => 170 - v * 9;
    let s = "";
    [
      ["A", 40],
      ["B", 270],
    ].forEach(([k, px]) => {
      const X = (e) => px + e * 2.2;
      s +=
        rc(px - 6, 26, 196, 150, { r: 8, s: "var(--line)", f: "var(--bg-2)" }) +
        tx(px + 92, 18, "Run " + k, { f: "900 14px" });
      [0, 7, 14].forEach(
        (v) =>
          (s +=
            ln(px - 4, Y(v), px + 188, Y(v), "var(--line)", 1) +
            (k === "A" ? tx(px - 10, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) : "")),
      );
      s += pl(
        runs[k].map((v, e) => [X(e), Y(v)]),
        k === "A" ? "var(--blue)" : "var(--amber)",
        3.5,
      );
      s += tx(px + 92, 196, "evaluations 0 to 80", { f: "700 11px", c: "var(--text-faint)" });
    });
    s += `<text transform="translate(12,100) rotate(-90)" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">fitness</text>`;
    s += ["A", "B"]
      .map((k, i) =>
        hit("run" + k, rc(34 + i * 230, 22, 208, 158, { f: "transparent", s: "transparent", sw: 2, r: 12 })),
      )
      .join("");
    return svg(470, 206, s);
  };

  const restartFlow = () => {
    const bx = (x, y, a, b) =>
      rc(x - 58, y - 24, 116, 48, { r: 12, s: "var(--violet)", sw: 2.5 }) +
      (b
        ? tx(x, y - 3, a, { f: "800 12px" }) + tx(x, y + 13, b, { f: "800 12px" })
        : tx(x, y + 5, a, { f: "800 13px" }));
    const a1 = (x1, y1, x2, y2) =>
      ln(x1, y1, x2, y2, "var(--text-faint)", 3).replace("/>", ` marker-end="url(#hfa)"/>`);
    let s = mark("hfa");
    const n = (id, x, y, a, b) => hit(id, bx(x, y, a, b));
    s += a1(131, 50, 168, 50) + a1(289, 50, 326, 50) + a1(388, 76, 388, 140) + a1(326, 170, 289, 170);
    s += `<path d="M388 196 V218 H72 V80" fill="none" stroke="var(--text-faint)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#hfa)"/>`;
    s +=
      tx(300, 212, "yes: restart", { f: "700 12px", c: "var(--text-faint)" }) +
      tx(308, 160, "no", { f: "700 12px", c: "var(--text-faint)" });
    s +=
      n("start", 72, 50, "Pick a", "random start") +
      n("climb", 230, 50, "Climb until no", "better neighbour") +
      n("save", 388, 50, "Save the final", "tour as the result") +
      n("time", 388, 170, "Time left?") +
      n("ret", 230, 170, "Return the", "result");
    return svg(470, 232, s);
  };

  const bitsTable = () => {
    const R = [
      ["0100 1010", "0110 1010"],
      ["1011 0001", "1011 0101"],
      ["1110 0000", "1110 0000"],
      ["0111 1100", "0101 1100"],
      ["0001 0110", "1111 0110"],
      ["1100 1111", "1101 1111"],
    ];
    return `<div style="max-width:360px"><table class="t"><tr><th>Row</th><th>Before</th><th>After one step</th></tr>${R.map((r, i) => `<tr><td>${i + 1}</td><td style="font-family:var(--mono);font-weight:800">${r[0]}</td><td style="font-family:var(--mono);font-weight:800">${r[1]}</td></tr>`).join("")}</table></div>`;
  };

  const SC = [
    [5, 40],
    [12, 65],
    [8, 90],
    [20, 40],
    [18, 65],
    [25, 90],
    [30, 40],
    [14, 65],
    [22, 40],
    [35, 65],
    [10, 40],
    [28, 90],
    [33, 40],
    [40, 65],
    [15, 90],
    [37, 40],
    [26, 65],
    [45, 90],
    [9, 40],
    [32, 90],
  ];
  const scatterFig = () => {
    const X = (v) => 56 + v * 7.6,
      Y = (v) => 190 - (v - 30) * 2.4;
    let s = ln(56, 190, 440, 190, "var(--text-faint)", 2.5) + ln(56, 30, 56, 190, "var(--text-faint)", 2.5);
    [0, 10, 20, 30, 40, 50].forEach(
      (v) =>
        (s +=
          ln(X(v), 190, X(v), 196, "var(--text-faint)", 2) +
          tx(X(v), 212, v, { f: "700 12px", c: "var(--text-faint)" })),
    );
    [40, 65, 90].forEach(
      (v) =>
        (s +=
          tx(50, Y(v) + 4, v, { a: "end", f: "700 12px", c: "var(--text-faint)" }) +
          ln(56, Y(v), 440, Y(v), "var(--line)", 1, "4 4")),
    );
    SC.forEach(([a, b]) => (s += ci(X(a), Y(b), 6.5, { f: "var(--blue)", s: "var(--blue-ink)", sw: 1.5 })));
    s += tx(250, 232, "fitness at the start of the run", { f: "700 12px", c: "var(--text-faint)" });
    s += `<text transform="translate(12,110) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">fitness where it stopped</text>`;
    return svg(470, 242, s);
  };

  B.add("l3-hc", [
    {
      type: "pick",
      q: "Two hillclimbers start from the same point on the same landscape. One accepts a mutant that is equal in fitness, the other accepts only strictly better ones. Click the run that accepts equal moves.",
      fig: hcPanels(),
      a: "runB",
      hint: "Both runs are the same until they reach a flat stretch. What can each do there?",
      why: "The runs are identical until evaluation 12, when both reach the flat plateau. Run A never moves again, because on a plateau every neighbour is merely equal and a strict climber rejects it. Run B keeps accepting equal moves, drifts across the plateau, and at about evaluation 50 steps off its far edge and climbs again to 14.",
    },
    {
      type: "pick",
      q: "This hillclimber with restarts returns poor answers even though some of its runs find excellent tours: it returns the tour the last run happened to end on. Click the box that should change.",
      fig: restartFlow(),
      a: "save",
      hint: "Which box decides what is remembered between runs?",
      why: "Saving every run's final tour as 'the result' overwrites an earlier, better one. The Save box should keep the new tour only if it is better than the best saved so far. Starting, climbing, the time check and returning are all fine.",
    },
    {
      type: "cat",
      q: "A hillclimber flips one random bit and keeps the mutant if its fitness is equal or better. Fitness is the number of 1s among the first four bits (the last four bits do not count). Sort each row: what is it?",
      fig: bitsTable(),
      buckets: ["An improvement", "Sideways or no move", "Impossible for this hillclimber"],
      items: [
        ["Row 1", 0],
        ["Row 2", 1],
        ["Row 3", 1],
        ["Row 4", 2],
        ["Row 5", 2],
        ["Row 6", 0],
      ],
      hint: "Count how many bits changed, then count the 1s in the first four bits before and after.",
      why: "Rows 1 and 6 flip a single bit among the first four from 0 to 1, a gain. Row 2 flips a bit in the right half (fitness unchanged), and row 3 is a mutant that was rejected, so nothing moves: both are fine because equal moves are accepted. Row 4 loses a 1 (3 to 2), which a hillclimber never keeps. Row 5 changes three bits at once, which one-bit mutation cannot do, even though fitness rose from 1 to 4.",
    },
    {
      type: "slider",
      q: "Each dot is one hillclimber run: across is the fitness it started at, up is the fitness where it stopped. The global optimum has fitness 90. About how many restarts would you expect to need before one reaches it?",
      fig: scatterFig(),
      min: 1,
      max: 10,
      step: 1,
      ans: 3,
      tol: 1,
      unit: "restarts",
      hint: "Count the dots on the top dashed line out of 20 dots. About one in three?",
      why: "6 of the 20 runs end at 90, so each restart succeeds about 30% of the time and you expect about 20 ÷ 6 ≈ 3 restarts. Notice where a run ends depends on which hill it started on, not how high it started: some of the best starting points (fitness 33 and 37) get stuck at 40, while a start at 8 reaches 90.",
    },
  ]);

  /* ======================================================================
     l3-landscape : heat-map grid, curve with step size, grid small multiples, basin strip
     ====================================================================== */
  const LGRID = [
    [10, 14, 18, 16, 12, 9],
    [15, 31, 20, 22, 19, 24],
    [11, 22, 27, 33, 21, 17],
    [13, 26, 40, 44, 35, 20],
    [8, 29, 25, 38, 30, 16],
    [6, 12, 14, 23, 18, 11],
  ];
  const heatFig = () => {
    const W = 52,
      H = 44,
      x0 = 14,
      y0 = 10;
    let s = "";
    LGRID.forEach((row, r) =>
      row.forEach(
        (v, c) =>
          (s += hit(
            `r${r}c${c}`,
            `${rc(x0 + c * W + 2, y0 + r * H + 2, W - 4, H - 4, { f: "var(--blue)", o: 0.06 + (v / 44) * 0.55, s: "var(--line-2)", sw: 2, r: 8 })}${tx(x0 + c * W + W / 2, y0 + r * H + H / 2 + 6, v, { f: "900 16px" })}`,
          )),
      ),
    );
    return svg(340, 280, s);
  };

  const gOf = (x, c, w, h) => h * Math.exp(-(((x - c) / w) ** 2));
  const hillF = (x) => 10 + gOf(x, 24, 9, 60) + gOf(x, 66, 10, 90);
  const hillFig = () => {
    const X = (x) => 40 + x * 4,
      Y = (f) => 200 - f * 1.6,
      pts = [];
    for (let x = 0; x <= 100; x += 1) pts.push([X(x), Y(hillF(x))]);
    let s =
      `<path d="M${X(0)} 200 ${pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")} L${X(100)} 200 Z" fill="var(--teal-dim)"/>` +
      pl(pts, "var(--teal)", 3.5);
    s += ln(40, 200, 440, 200, "var(--text-faint)", 2.5);
    [0, 20, 40, 60, 80, 100].forEach(
      (x) =>
        (s +=
          ln(X(x), 200, X(x), 206, "var(--text-faint)", 2) +
          tx(X(x), 222, x, { f: "700 12px", c: "var(--text-faint)" })),
    );
    s +=
      ln(40, Y(70), 440, Y(70), "var(--rose)", 2, "6 5") +
      tx(444, Y(70) - 6, "70", { a: "end", f: "800 12px", c: "var(--rose-ink)" });
    s +=
      ci(X(24), Y(70), 9, { f: "var(--rose)", s: "var(--panel)", sw: 2 }) +
      tx(X(24), Y(70) - 16, "you are here", { f: "800 12px", c: "var(--rose-ink)" });
    s += tx(240, 242, "x (the value being tuned), fitness is the height", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 252, s);
  };

  const spaceFig = () => {
    const G = 12,
      C = 10,
      R = rng(23);
    const val = {
      A: (r, c) => 1 - Math.min(1, Math.hypot(r - 5.5, c - 5.5) / 7.5),
      B: () => R(),
      C: (r, c) => (r === 3 && c === 8 ? 1 : 0.04),
    };
    let s = "";
    [
      ["A", 14],
      ["B", 164],
      ["C", 314],
    ].forEach(([k, px]) => {
      s += tx(px + 60, 16, "Space " + k, { f: "900 14px" });
      for (let r = 0; r < G; r++)
        for (let c = 0; c < G; c++)
          s += rc(px + c * C, 26 + r * C, C - 1, C - 1, {
            f: "var(--blue)",
            o: 0.05 + 0.85 * val[k](r, c),
            s: "none",
            sw: 0,
            r: 2,
          });
    });
    s += ["A", "B", "C"]
      .map((k, i) => hit(k, rc(10 + i * 150, 22, 128, 128, { f: "transparent", s: "transparent", sw: 2, r: 10 })))
      .join("");
    s += tx(235, 172, "each small square is one solution; darker blue = fitter", {
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(470, 182, s);
  };

  const basinFig = () => {
    const parts = [
      ["90", 10, "teal"],
      ["70", 45, "blue"],
      ["60", 30, "amber"],
      ["40", 15, "violet"],
    ];
    let x = 20,
      s = tx(20, 22, "share of random starts that climb to the peak of height…", { a: "start", f: "800 13px" });
    parts.forEach(([t, p, c]) => {
      const w = p * 4.2;
      s +=
        rc(x, 34, w, 44, { f: `var(--${c}-dim)`, s: `var(--${c})`, sw: 2.5, r: 0 }) +
        tx(x + w / 2, 54, p + "%", { f: "900 14px" }) +
        tx(x + w / 2, 70, t, { f: "700 11px", c: "var(--text-dim)" });
      x += w;
    });
    return svg(470, 96, s);
  };

  B.add("l3-landscape", [
    {
      type: "pick",
      q: "The grid shows fitness (higher is better, darker is fitter). A move goes to the cell directly above, below, left or right, never diagonally. Click every local optimum.",
      fig: heatFig(),
      a: ["r1c1", "r1c5", "r3c3", "r4c1"],
      hint: "A local optimum is higher than every neighbour it can move to. Check each cell's four neighbours only.",
      why: "The cells 31, 24, 44 and 29 each beat all of their up, down, left and right neighbours. 29 is the trap: the diagonal cell 40 is higher, but diagonals are not moves, so a hillclimber is stuck there. Every other cell has a higher neighbour to climb to. The global optimum is 44.",
    },
    {
      type: "slider",
      q: "A hillclimber tunes x. Each mutation moves x by exactly the step size, to the left or right, and the move is kept only if fitness is higher than now (70, the dashed line). About how large must the step be to escape the peak at x = 24?",
      fig: hillFig(),
      min: 0,
      max: 100,
      step: 2,
      ans: 36,
      tol: 8,
      unit: "units",
      hint: "Slide along from 24 to the right: where does the curve first rise above the dashed line again?",
      why: "To escape, a step has to land on a point fitter than 70. The second hill first rises above 70 at about x = 60, which is 36 away from 24. Smaller steps land in the valley (lower fitness) and are rejected, and a step to the left would leave the range. The step size sets which valleys can be crossed.",
    },
    {
      type: "pick",
      q: "Each square is a search space. Every small square is one solution, and darker blue means fitter. Click the space where a hillclimber with small moves has the biggest advantage over random guessing.",
      fig: spaceFig(),
      a: "A",
      hint: "A hillclimber needs the fitness of nearby solutions to tell it which way to go.",
      why: "In A, nearby solutions have similar fitness, so each small move shows which way is uphill and the climber walks to the peak. In B every solution is unrelated to its neighbours, so a move tells you nothing and guessing is as good. In C everything is flat except one needle, so there is no slope to follow.",
    },
    {
      q: "A hillclimber's random start climbs to one of four peaks. The bar shows how many starts end at each peak. You run it 3 times and report the best of the three results. Which peak value are you most likely to report?",
      fig: basinFig(),
      o: ["40", "60", "70", "90"],
      a: 2,
      hint: "A single run misses the 90 peak 9 times in 10. Missing it three runs in a row is about 0.9 × 0.9 × 0.9, about 0.7.",
      why: "The chance that at least one run reaches 90 is only 1 − 0.9³ ≈ 27%. The chance the best is 70 is 0.9³ − 0.55³ ≈ 56%, the chance it is 60 is about 15%, and 40 is under 1%. The biggest basin is not the best peak, and a few restarts usually return a good but not the best solution.",
    },
  ]);

  /* ======================================================================
     l3-neighbourhood : adjacency matrix, two bar charts, directed graph, tape strip
     ====================================================================== */
  const matrixFig = () => {
    const S = ["000", "001", "010", "011", "100", "101", "110", "111"];
    const C = 38,
      x0 = 62,
      y0 = 46,
      diff = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
    let s = tx(x0 + 4 * C, 16, "is the column a neighbour of the row?", { f: "700 12px", c: "var(--text-faint)" });
    S.forEach((a, i) => {
      s +=
        tx(x0 + i * C + C / 2, 38, a, { f: "800 12px", c: "var(--text-dim)" }) +
        tx(x0 - 8, y0 + i * C + C / 2 + 4, a, { a: "end", f: "800 12px", c: "var(--text-dim)" });
    });
    S.forEach((a, i) =>
      S.forEach(
        (b, j) =>
          (s += rc(x0 + j * C + 1, y0 + i * C + 1, C - 2, C - 2, {
            f: diff(a, b) === 2 ? "var(--blue)" : "var(--bg-2)",
            o: diff(a, b) === 2 ? 0.75 : 1,
            s: "var(--line)",
            sw: 1,
            r: 4,
          })),
      ),
    );
    return svg(380, 360, s);
  };

  const flipFig = () => {
    const A = [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1],
      Bn = [34.9, 38.7, 19.4, 5.7, 1.1, 0.15, 0, 0, 0, 0, 0];
    const X = (k) => 40 + k * 38;
    let s =
      tx(235, 14, "Chart A: how many strings are k flips away", { f: "800 13px" }) +
      tx(235, 158, "Chart B: how often one mutation flips k bits (each bit flips with chance 0.1)", { f: "800 12px" });
    A.forEach((v, k) => {
      const h = (v * 80) / 252;
      s +=
        rc(X(k), 110 - h, 28, h, { f: "var(--violet)", o: 0.35, s: "var(--violet)", sw: 2, r: 4 }) +
        tx(X(k) + 14, 106 - h, v, { f: "800 11px" }) +
        tx(X(k) + 14, 128, k, { f: "700 12px", c: "var(--text-faint)" });
    });
    Bn.forEach((v, k) => {
      const h = Math.max(v * 2, 1.5);
      s +=
        rc(X(k), 262 - h, 28, h, { f: "var(--amber)", o: 0.35, s: "var(--amber)", sw: 2, r: 4 }) +
        (v >= 1 ? tx(X(k) + 14, 258 - h, Math.round(v) + "%", { f: "800 11px" }) : "") +
        tx(X(k) + 14, 280, k, { f: "700 12px", c: "var(--text-faint)" });
    });
    s += ln(34, 110, 462, 110, "var(--text-faint)", 2) + ln(34, 262, 462, 262, "var(--text-faint)", 2);
    s += tx(248, 298, "k = number of bits flipped", { f: "700 12px", c: "var(--text-faint)" });
    A.forEach(
      (_, k) =>
        (s +=
          hit("a" + k, rc(X(k) - 3, 22, 34, 108, { f: "transparent", s: "transparent", sw: 2, r: 6 })) +
          hit("m" + k, rc(X(k) - 3, 176, 34, 106, { f: "transparent", s: "transparent", sw: 2, r: 6 }))),
    );
    return svg(470, 306, s);
  };

  const DG = {
    N: { A: [50, 50, 6], B: [190, 50, 9], C: [330, 50, 4], D: [120, 175, 7], E: [260, 175, 8], F: [400, 175, 3] },
    E: [
      ["A", "B"],
      ["B", "C"],
      ["B", "D"],
      ["C", "E"],
      ["D", "A"],
      ["E", "D"],
      ["E", "F"],
    ],
  };
  const digraphFig = () => {
    const R = 25;
    let s = mark("dga");
    DG.E.forEach(([a, b]) => {
      const [x1, y1] = DG.N[a],
        [x2, y2] = DG.N[b],
        L = Math.hypot(x2 - x1, y2 - y1),
        dx = (x2 - x1) / L,
        dy = (y2 - y1) / L;
      s += ln(x1 + dx * R, y1 + dy * R, x2 - dx * (R + 4), y2 - dy * (R + 4), "var(--text-faint)", 3).replace(
        "/>",
        ` marker-end="url(#dga)"/>`,
      );
    });
    Object.entries(DG.N).forEach(
      ([k, [x, y, f]]) =>
        (s += hit(
          k,
          `${ci(x, y, R, { s: "var(--blue)", sw: 3 })}${tx(x, y - 4, k, { f: "800 12px", c: "var(--text-dim)" })}${tx(x, y + 15, f, { f: "900 16px" })}`,
        )),
    );
    s += tx(235, 232, "arrow: a move the mutation can make. Number: fitness", {
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(470, 242, s);
  };

  const tapeFig = () => {
    let s = tx(20, 18, "starting tour (position numbers above)", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    [..."ABCDEF"].forEach(
      (c, i) =>
        (s +=
          tx(80 + i * 60 + 22, 44, i + 1, { f: "700 12px", c: "var(--text-faint)" }) +
          rc(80 + i * 60, 52, 44, 44, { f: "var(--blue)", o: 0.2, s: "var(--blue)", sw: 2.5, r: 8 }) +
          tx(80 + i * 60 + 22, 81, c, { f: "900 18px" })),
    );
    return svg(470, 108, s);
  };

  B.add("l3-neighbourhood", [
    {
      q: "The grid shows a mutation operator on 3-bit strings: a row is a string and a filled square marks a string that the operator can turn it into. Which operator is it?",
      fig: matrixFig(),
      o: ["Flip exactly one bit", "Flip exactly two bits", "Flip all three bits", "Swap two neighbouring bits"],
      a: 1,
      hint: "Look at the row 000. Which strings is it joined to, and how many bits differ from 000?",
      why: "Every row has three filled squares, and they are the strings that differ from the row in exactly two bits (000 is joined to 011, 101 and 110). One-bit flips would fill 001, 010 and 100 instead. Flipping all bits would fill one square per row, and swapping neighbouring bits would leave the rows 000 and 111 empty.",
    },
    {
      type: "pick",
      q: "A 10-bit string is mutated by flipping each bit independently with chance 0.1. Chart A counts the strings that lie k flips away, and chart B shows how often this mutation flips exactly k bits. Click the number of flips that the mutation makes most often.",
      fig: flipFig(),
      a: "m1",
      hint: "On average a mutation flips 10 × 0.1 = 1 bit.",
      why: "The big pile in chart A (252 strings at k = 5) is only a head-count of what could be reached. Flipping five bits has a chance of 0.15%, while one flip happens 39% of the time (and no change 35%, two flips 19%). The operator samples its neighbours unevenly, mostly close ones, so a huge neighbourhood on paper may rarely be explored.",
    },
    {
      type: "pick",
      q: "In this search each arrow is a move that the mutation can make from one solution to another. A solution is a local optimum when none of its moves goes to a fitter solution (higher is better). Click every local optimum.",
      fig: digraphFig(),
      a: ["B", "D", "E", "F"],
      hint: "Only follow the arrows leaving a solution. Arrows pointing into it do not matter.",
      why: "B (9) moves only to C (4) and D (7), D (7) moves only to A (6), and E (8) moves only to D (7) and F (3), so all three are stuck. F has no moves out at all, so a hillclimber stops there even though F is the worst solution. A (6) can reach B (9) and C (4) can reach E (8), so they are not local optima.",
    },
    {
      type: "cat",
      q: "The tour in the strip is changed by one mutation. Positions count along the string, with no wrap-around. Sort each result.",
      fig: tapeFig(),
      buckets: ["One swap of neighbouring positions", "One swap of far-apart positions", "More than one swap needed"],
      items: [
        ["ACBDEF", 0],
        ["ABCDFE", 0],
        ["AECDBF", 1],
        ["FBCDEA", 1],
        ["ABFEDC", 2],
        ["BADCFE", 2],
      ],
      hint: "Count how many positions hold a different letter from ABCDEF. If exactly two, are they next to each other?",
      why: "ACBDEF and ABCDFE differ in two neighbouring positions (2 and 3, 5 and 6). AECDBF differs in positions 2 and 5, and FBCDEA in positions 1 and 6: two positions that are not neighbours in the string. ABFEDC differs in four positions (the last four are reversed), and BADCFE differs in six (three separate swaps), so neither is a single swap.",
    },
  ]);

  /* ======================================================================
     l3-local : tabu queue and cost strip, stacked outcome bars, probability tree, tenure traces
     ====================================================================== */
  const tabuFig = () => {
    let s = tx(20, 18, "Tabu list (oldest first, newest last)", { a: "start", f: "800 13px" });
    ["bit 5", "bit 2", "bit 6"].forEach(
      (t, i) =>
        (s +=
          rc(20 + i * 84, 28, 74, 38, { f: "var(--violet)", o: 0.18, s: "var(--violet)", sw: 2.5, r: 10 }) +
          tx(57 + i * 84, 53, t, { f: "900 14px" })),
    );
    s += tx(290, 52, "newest joins on the right", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    s += tx(20, 106, "Cost change if this bit is flipped (a minus is cheaper)", { a: "start", f: "800 13px" });
    [
      ["bit 1", "+2"],
      ["bit 2", "−4"],
      ["bit 3", "+1"],
      ["bit 4", "−1"],
      ["bit 5", "−3"],
      ["bit 6", "−5"],
    ].forEach(([b, d], i) => {
      s +=
        rc(20 + i * 70, 116, 64, 58, { f: "var(--panel)", s: "var(--line-2)", sw: 2.5, r: 10 }) +
        tx(52 + i * 70, 136, b, { f: "800 12px", c: "var(--text-dim)" }) +
        tx(52 + i * 70, 161, d, { f: "900 18px", c: d[0] === "+" ? "var(--rose-ink)" : "var(--teal-ink)" });
    });
    return svg(450, 188, s);
  };

  const outcomeFig = () => {
    const U = 3.6,
      parts = [
        ["var(--teal-dim)", "var(--teal)"],
        ["var(--amber-dim)", "var(--amber)"],
        ["var(--bg-2)", "var(--line-2)"],
      ];
    const bar = (id, t, a, y) => {
      let s = tx(30, y - 10, t, { a: "start", f: "800 13px" }),
        x = 30;
      a.forEach((v, i) => {
        s +=
          rc(x, y, v * U, 44, { f: parts[i][0], s: parts[i][1], sw: 2.5, r: 0 }) +
          tx(x + (v * U) / 2, y + 28, v, { f: "900 15px" });
        x += v * U;
      });
      return s + hit(id, rc(26, y - 4, 100 * U + 8, 52, { f: "transparent", s: "transparent", sw: 2, r: 8 }));
    };
    let s = bar("A", "Run A: 100 steps", [40, 24, 36], 34) + bar("B", "Run B: 100 steps", [70, 15, 15], 112);
    [
      ["var(--teal-dim)", "var(--teal)", "better: moved"],
      ["var(--amber-dim)", "var(--amber)", "worse: accepted"],
      ["var(--bg-2)", "var(--line-2)", "worse: rejected"],
    ].forEach(
      ([f, st, t], i) =>
        (s +=
          rc(30 + i * 140, 176, 16, 16, { f, s: st, sw: 2, r: 3 }) +
          tx(52 + i * 140, 189, t, { a: "start", f: "700 12px", c: "var(--text-dim)" })),
    );
    return svg(470, 204, s);
  };

  const treeProbFig = () => {
    const bx = (x, y, a, b, c) =>
      rc(x - 60, y - 22, 120, 44, { r: 11, s: `var(--${c})`, sw: 2.5 }) +
      tx(x, y - 3, a, { f: "800 12px" }) +
      tx(x, y + 13, b, { f: "800 12px" });
    let s =
      ln(130, 100, 175, 52, "var(--line-2)", 2.5) +
      ln(130, 100, 175, 148, "var(--line-2)", 2.5) +
      ln(295, 48, 340, 48, "var(--line-2)", 2.5) +
      ln(295, 152, 340, 122, "var(--line-2)", 2.5) +
      ln(295, 152, 340, 188, "var(--line-2)", 2.5);
    s +=
      bx(70, 100, "pick one random", "neighbour", "blue") +
      bx(235, 48, "neighbour is", "better", "teal") +
      bx(235, 152, "neighbour is", "worse", "rose") +
      bx(400, 48, "move: cost", "falls", "teal") +
      bx(400, 122, "accept: cost", "goes up", "amber") +
      bx(400, 188, "reject: stay", "put", "line-2");
    s +=
      tx(138, 64, "0.25", { f: "900 13px", c: "var(--teal-ink)" }) +
      tx(138, 146, "0.75", { f: "900 13px", c: "var(--rose-ink)" });
    s +=
      tx(300, 118, "p = 0.2", { f: "900 13px", c: "var(--amber-ink)" }) +
      tx(312, 196, "0.8", { f: "900 13px", c: "var(--text-dim)" });
    return svg(470, 220, s);
  };

  // real tabu runs on an 8-bit problem (same start, tabu list holds the last 1 or 6 solutions visited)
  const TT = {
    P: [
      57, 39, 41, 48, 41, 45, 45, 47, 49, 58, 45, 44, 36, 40, 29, 38, 37, 31, 37, 27, 31, 36, 41, 43, 45, 37, 32, 45,
      47, 36, 37,
    ],
    Q: [
      57, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48,
      41, 39, 41,
    ],
  };
  const tenureFig = () => {
    const Y = (c) => 130 - (c - 20) * 2.4;
    let s = "";
    [
      ["P", 44],
      ["Q", 270],
    ].forEach(([k, px]) => {
      const X = (i) => px + i * 5.8;
      s +=
        rc(px - 6, 26, 194, 118, { r: 8, s: "var(--line)", f: "var(--bg-2)" }) +
        tx(px + 91, 18, "Run " + k, { f: "900 14px" });
      [30, 40, 50].forEach(
        (v) =>
          (s +=
            ln(px - 4, Y(v), px + 186, Y(v), "var(--line)", 1) +
            (k === "P" ? tx(px - 10, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) : "")),
      );
      s += pl(
        TT[k].map((v, i) => [X(i), Y(v)]),
        k === "P" ? "var(--violet)" : "var(--blue)",
        3,
      );
      s += tx(px + 91, 164, "steps 0 to 30", { f: "700 11px", c: "var(--text-faint)" });
    });
    s += `<text transform="translate(12,85) rotate(-90)" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">cost</text>`;
    s += ["P", "Q"]
      .map((k, i) => hit(k, rc(38 + i * 226, 22, 206, 126, { f: "transparent", s: "transparent", sw: 2, r: 12 })))
      .join("");
    return svg(470, 176, s);
  };

  B.add("l3-local", [
    {
      type: "multi",
      q: "Tabu search keeps the last 3 flipped bits on its list. Each step flips the cheapest bit that is NOT on the list, then adds it to the list (the oldest entry drops out). After this step, which bits will be tabu? Select all.",
      fig: tabuFig(),
      o: ["bit 1", "bit 2", "bit 3", "bit 4", "bit 5", "bit 6"],
      a: [1, 3, 5],
      hint: "Bits 5, 2 and 6 are on the list now, so their savings are not allowed. Pick the best of the rest, then update the list.",
      why: "The cheapest legal move is bit 4 (−1), because bits 2, 5 and 6 are tabu even though they would save more. Flipping bit 4 puts it on the list and pushes out the oldest entry, bit 5. The list is now bit 2, bit 6, bit 4.",
    },
    {
      type: "pick",
      q: "Two Monte Carlo runs each made 100 steps. In every step the run looked at one random neighbour, and the bars sort the outcomes. p is the chance of accepting a worse neighbour. Click the run that used the larger p.",
      fig: outcomeFig(),
      a: "B",
      hint: "p only concerns worse neighbours. For each run: accepted worse ÷ (accepted worse + rejected).",
      why: "Run A met 60 worse neighbours and accepted 24 of them (0.4). Run B met only 30 and accepted 15 (0.5). Run A accepted more worse moves in total, but that is just because it met more of them, so the raw count is misleading. p is the accepted share of the worse neighbours.",
    },
    {
      type: "slider",
      q: "A Monte Carlo search picks one random neighbour per step. A quarter of the neighbours are better; the other three quarters are worse and are accepted with p = 0.2. In about what percentage of steps does the cost go up?",
      fig: treeProbFig(),
      min: 0,
      max: 50,
      step: 1,
      ans: 15,
      tol: 5,
      unit: "%",
      hint: "Follow the lower branch: three quarters of the time, then one fifth of that.",
      why: "The cost goes up only along the path 'worse' (0.75) then 'accept' (0.2): 0.75 × 0.2 = 0.15, so about 15% of steps. The other worse neighbours (0.75 × 0.8 = 0.6) are rejected and the search stays put, and the better ones (0.25) are always taken.",
    },
    {
      type: "pick",
      q: "Two tabu searches start from the same 8-bit solution and always move to the cheapest solution that is not on their list (cost is minimised). One list holds only the last 1 solution visited, the other the last 6. Click the run with the list of 1.",
      fig: tenureFig(),
      a: "Q",
      hint: "A search that can only forbid one solution may soon wander back to where it was.",
      why: "Run Q repeats 41, 39, 41, 48 over and over: with a list of 1 it only avoids going straight back, so it falls into a four-step loop and never improves on 39. Run P's longer memory forbids the places it has just been, so it keeps exploring and finds a cost of 27.",
    },
  ]);

  /* ======================================================================
     l3-population : pixel grid, lineage tree, scatter snapshots, lifespan Gantt
     ====================================================================== */
  const PIX = [
    [1, 0, 1, 1, 0, 0, 1, 0, 1, 1],
    [1, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 0, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 1, 1],
  ];
  const pixFig = () => {
    const C = 28,
      x0 = 54,
      y0 = 40;
    let s = "";
    for (let c = 0; c < 10; c++) s += tx(x0 + c * C + C / 2, 32, c + 1, { f: "700 12px", c: "var(--text-faint)" });
    PIX.forEach((row, r) => {
      s += tx(x0 - 8, y0 + r * C + C / 2 + 5, "M" + (r + 1), { a: "end", f: "800 12px", c: "var(--text-dim)" });
      row.forEach(
        (v, c) =>
          (s +=
            rc(x0 + c * C + 1, y0 + r * C + 1, C - 2, C - 2, {
              f: v ? "var(--blue)" : "var(--bg-2)",
              o: v ? 0.7 : 1,
              s: "var(--line)",
              sw: 1,
              r: 4,
            }) + tx(x0 + c * C + C / 2, y0 + r * C + C / 2 + 5, v, { f: "800 13px" })),
      );
    });
    for (let c = 0; c < 10; c++)
      s += hit(
        "c" + (c + 1),
        rc(x0 + c * C - 1, y0 - 3, C + 2, 6 * C + 6, { f: "transparent", s: "transparent", sw: 2, r: 6 }),
      );
    s += tx(x0 + 5 * C, y0 + 6 * C + 32, "column number", { f: "700 12px", c: "var(--text-faint)" });
    return svg(370, 262, s);
  };

  const LIN = { p1: [1, 1, 1, 3, 1], p2: [0, 1, 3, 0, 2], p3: [0, 0, 2, 3, 4] };
  const lineageFig = () => {
    const X = [60, 170, 280, 390],
      Y = [50, 90, 130, 170, 210],
      P = [LIN.p1, LIN.p2, LIN.p3];
    let s = "";
    P.forEach((par, g) => par.forEach((p, i) => (s += ln(X[g] + 8, Y[p], X[g + 1] - 8, Y[i], "var(--line-2)", 2.5))));
    X.forEach((x, g) => {
      s += tx(x, 22, g === 0 ? "start" : "gen " + g, { f: "700 12px", c: "var(--text-faint)" });
      Y.forEach((y, i) => {
        if (g) s += ci(x, y, 8, { s: "var(--line-2)", sw: 2 });
      });
    });
    "ABCDE"
      .split("")
      .forEach(
        (c, i) =>
          (s += hit(
            c,
            `${ci(X[0], Y[i], 16, { s: "var(--blue)", sw: 3 })}${tx(X[0], Y[i] + 5, c, { f: "900 14px" })}`,
          )),
      );
    s += tx(235, 246, "each dot has one parent: the line to its left", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 256, s);
  };

  const snapFig = () => {
    const R = rng(5),
      rnd = (a, b) => a + R() * (b - a),
      P = { big: [95, 45], small: [38, 98] };
    const dots = {
      A: Array.from({ length: 14 }, () => [rnd(8, 132), rnd(8, 132)]),
      B: [
        ...Array.from({ length: 6 }, () => [P.big[0] + rnd(-9, 9), P.big[1] + rnd(-9, 9)]),
        ...Array.from({ length: 6 }, () => [P.small[0] + rnd(-8, 8), P.small[1] + rnd(-8, 8)]),
      ],
      C: Array.from({ length: 12 }, () => [P.small[0] + rnd(-9, 9), P.small[1] + rnd(-9, 9)]),
    };
    let s = "";
    [
      ["A", 14],
      ["B", 164],
      ["C", 314],
    ].forEach(([k, px]) => {
      s +=
        rc(px, 26, 140, 140, { r: 10, s: "var(--line)", f: "var(--bg-2)" }) +
        tx(px + 70, 18, "Panel " + k, { f: "900 14px" });
      [10, 20, 30].forEach((r) => (s += ci(px + P.big[0], 26 + P.big[1], r, { f: "none", s: "var(--teal)", sw: 1.5 })));
      [8, 16, 24].forEach(
        (r) => (s += ci(px + P.small[0], 26 + P.small[1], r, { f: "none", s: "var(--violet)", sw: 1.5 })),
      );
      dots[k].forEach(
        ([x, y]) => (s += ci(px + x, 26 + y, 4.5, { f: "var(--amber)", s: "var(--amber-ink)", sw: 1.5 })),
      );
    });
    s += tx(235, 186, "rings: contour lines of two hills (tall green, lower purple). Dots: members", {
      f: "700 11px",
      c: "var(--text-faint)",
    });
    return svg(470, 196, s);
  };

  const ganttFig = () => {
    const X = (t) => 60 + t * 62,
      rows = [
        ["P1", 5, 0, 2],
        ["P2", 8, 0, 3],
        ["P3", 3, 0, 1],
        ["P4", 6, 0, 4],
        ["C1", 7, 1, 5],
        ["C2", 9, 2, 6],
        ["C3", 10, 3, 6],
        ["C4", 8, 4, 6],
        ["C5", 12, 5, 6],
      ];
    let s = "";
    for (let t = 0; t <= 6; t++)
      s += ln(X(t), 26, X(t), 238, "var(--line)", 1) + tx(X(t), 18, t, { f: "700 12px", c: "var(--text-faint)" });
    rows.forEach(([id, f, b, d], i) => {
      const y = 30 + i * 23,
        key = id.toLowerCase();
      s += tx(52, y + 15, id, { a: "end", f: "800 12px", c: "var(--text-dim)" });
      s += hit(
        key,
        `${rc(X(b), y, X(d) - X(b), 19, { f: d === 6 ? "var(--teal)" : "var(--blue)", o: 0.25, s: d === 6 ? "var(--teal)" : "var(--blue)", sw: 2.5, r: 6 })}${tx((X(b) + X(d)) / 2, y + 14, f, { f: "900 13px" })}`,
      );
    });
    s += tx(X(3), 256, "time step (one child is born at each step)", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 266, s);
  };

  B.add("l3-population", [
    {
      type: "pick",
      q: "Six members of an EA population are drawn as rows of bits. Click every column where crossover alone can never again produce a different value.",
      fig: pixFig(),
      a: ["c1", "c3", "c5", "c10"],
      hint: "Crossover only copies bits that parents already carry. Which columns have no variety left?",
      why: "Crossover only shuffles values the parents already have. In columns 1, 3, 5 and 10 every member holds the same bit, so every child gets that bit too: only mutation could change it. Column 8 still has one member with a 1, so a child can inherit it, and the rest of the columns are mixed.",
    },
    {
      type: "pick",
      q: "Each dot is one member and has one parent: the line to its left. Starting individuals are A to E. Click every starting individual that has no descendants left in generation 3.",
      fig: lineageFig(),
      a: ["A", "C", "E"],
      hint: "Follow lines rightwards from each start. Which ones never get a line out?",
      why: "A, C and E were never chosen as a parent, so they have no line out at all. B's line branches into most of generation 1, and D's single child survives to generation 3. Only B and D contribute to generation 3, so the population has lost the genes of the other three. Selection alone shrinks diversity over time.",
    },
    {
      type: "match",
      q: "Each panel is a snapshot of an EA population on a landscape with two hills. Match each panel to what it shows.",
      fig: snapFig(),
      pairs: [
        ["Panel A", "Just started: members spread out everywhere"],
        ["Panel B", "Searching both hills at once"],
        ["Panel C", "Converged on the lower hill"],
      ],
      why: "Panel A has members all over the space, as in a random start. Panel B has groups near both peaks, which is a population exploring two hills in parallel (a single hillclimber could only follow one). In panel C every member sits on the lower hill. Unless mutation throws some far away, the taller hill will never be found: premature convergence.",
    },
    {
      type: "pick",
      q: "A steady-state EA with a population of 4 should always replace the weakest member with the new child. Each bar is one individual's life (its fitness inside), and a child is born at each step. Exactly one replacement broke the rule. Click the bar that was replaced wrongly.",
      fig: ganttFig(),
      a: "p2",
      hint: "At step 3, which of the individuals alive had the lowest fitness?",
      why: "At step 3 the population was P2 (8), P4 (6), C1 (7) and C2 (9), so the weakest was P4 (6). But the child replaced P2 (8) and P4 stayed alive until step 4. The earlier replacements were right: the weakest died at steps 1, 2, 4 and 5 (3, 5, 6 and 7).",
    },
  ]);
})();

/* ===== bank-x-nic-3.js ===== */
/* NIC revision bank, third round of varied, visual questions (x-nic-3).
   Lecture 4 (types, replacement, pressure, roulette, rank, tournament, mutation, crossover, lab): four new questions each.
   Every figure is needed to answer, and each uses a diagram kind not yet used for that module.
   Figures are drawn about 340 to 380 units wide so their text stays readable at phone width. */
(function () {
  const B = NIC.bank;
  const FS = 1.1;
  const T = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${((o.s || 13) * FS).toFixed(1)}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${body}</svg>`;
  const pk = (id, body) => `<g data-pick="${id}">${body}</g>`;
  const R = (x, y, w, h, fill, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r === undefined ? 6 : o.r}" fill="${fill}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const L = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.cap ? ' stroke-linecap="round"' : ""}${o.mk ? ` marker-end="url(#${o.mk})"` : ""}/>`;
  const C = (x, y, r, fill, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}"/>`;
  const f2 = (v) => v.toFixed(2);
  const DIM = "var(--text-dim)",
    FAINT = "var(--text-faint)";
  let uid = 0;
  const arrowDef = (id, c = "var(--line-2)") =>
    `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker></defs>`;
  const swatch = (x, y, fill, label, o = {}) =>
    R(x, y - 11, 13, 13, fill, { fo: o.fo, r: 3, s: o.s }) + T(x + 18, y, label, { a: "start", s: 11, c: DIM });

  /* ---------- l4-types ---------- */
  // Swimlane of lifespans in a generational GA (population 3, one elite)
  const lifeFig = (() => {
    const lanes = [
      ["I1", 0, 1],
      ["I2", 0, 2],
      ["I3", 0, 1],
      ["C4", 1, 2],
      ["C5", 1, 3],
      ["C6", 2, 3],
      ["C7", 2, 3],
    ];
    const x0 = 44,
      cw = 100,
      y0 = 34,
      lh = 29,
      X = (t) => x0 + t * cw,
      bottom = y0 + lanes.length * lh;
    let s = [0, 1, 2].map((g) => T(X(g) + cw / 2, 16, "Generation " + (g + 1), { c: DIM, s: 11 })).join("");
    s += [0, 1, 2, 3].map((t) => L(X(t), 24, X(t), bottom, { dash: t && t < 3 ? "6 5" : null })).join("");
    s += lanes
      .map(([id, a, b], i) => {
        const y = y0 + i * lh;
        return pk(
          id,
          R(X(a) + 4, y + 3, (b - a) * cw - 8, lh - 8, id[0] === "I" ? "var(--blue)" : "var(--teal)", { fo: 0.85 }) +
            T(22, y + lh / 2 + 4, id, { s: 13 }),
        );
      })
      .join("");
    s +=
      swatch(44, bottom + 22, "var(--blue)", "starting population", { fo: 0.85 }) +
      swatch(200, bottom + 22, "var(--teal)", "a child", { fo: 0.85 });
    return svg(350, bottom + 34, s);
  })();
  // Composition strips (kept vs new)
  const compFig = (() => {
    const rows = [
      ["P", 2],
      ["Q", 19],
      ["R", 0],
      ["S", 5],
    ];
    let s =
      swatch(46, 14, "var(--bg-2)", "copied from old population") +
      swatch(220, 14, "var(--teal)", "new child", { fo: 0.85 });
    rows.forEach(([id, kept], k) => {
      const y = 28 + k * 36;
      s += T(2, y + 17, "Row " + id, { a: "start", s: 11 });
      for (let i = 0; i < 20; i++)
        s += R(46 + i * 15 + Math.floor(i / 5) * 6, y, 12, 24, i < kept ? "var(--bg-2)" : "var(--teal)", {
          fo: i < kept ? 1 : 0.85,
          r: 3,
        });
    });
    return svg(370, 172, s);
  })();
  // Two state machines, side by side
  const stateFig = (() => {
    const id = "ar" + ++uid;
    const bx = (x, y, a, b, fill) =>
      R(x, y, 156, 44, fill || "var(--panel)", { r: 10 }) +
      T(x + 78, y + 19, a, { s: 12 }) +
      T(x + 78, y + 35, b, { s: 12, c: DIM });
    let s =
      arrowDef(id) +
      T(8, 16, "Scheme 1", { a: "start", s: 13, c: "var(--blue-ink)" }) +
      T(190, 16, "Scheme 2", { a: "start", s: 13, c: "var(--blue-ink)" });
    [
      ["Child", "is born"],
      ["Waits in a", "holding area"],
      ["Whole batch", "swapped in"],
      ["Can now be", "a parent"],
    ].forEach(([a, b], i) => {
      s += bx(4, 26 + i * 62, a, b, i === 1 ? "var(--bg-2)" : null);
      if (i < 3) s += L(82, 72 + i * 62, 82, 86 + i * 62, { w: 3, mk: id, dash: i === 1 ? "4 3" : null });
    });
    [
      ["Child", "is born"],
      ["Replaces one", "population member"],
      ["Can now be", "a parent"],
    ].forEach(([a, b], i) => {
      s += bx(190, 26 + i * 62, a, b);
      if (i < 2) s += L(268, 72 + i * 62, 268, 86 + i * 62, { w: 3, mk: id });
    });
    return svg(350, 262, s);
  })();
  const genTab = `<table class="t"><tr><th>Gen</th><th>Fitness of the 5 members</th><th class="num">Best</th></tr>
    <tr><td>1</td><td>0.61 &nbsp;0.55 &nbsp;<b>0.83</b> &nbsp;0.40 &nbsp;0.72</td><td class="num">0.83</td></tr>
    <tr class="bad"><td>2</td><td>0.66 &nbsp;0.70 &nbsp;0.52 &nbsp;0.79 &nbsp;0.58</td><td class="num">0.79</td></tr>
    <tr><td>3</td><td>0.81 &nbsp;0.75 &nbsp;0.60 &nbsp;0.77 &nbsp;0.69</td><td class="num">0.81</td></tr></table>`;
  B.add("l4-types", [
    {
      type: "pick",
      q: "Each bar is one individual of a generational GA (population 3), from the generation it was born to the one it left. Tap every individual that was carried over untouched by elitism.",
      fig: lifeFig,
      a: ["I2", "C5"],
      why: "In a generational GA every individual lasts exactly one generation, apart from the elites, which are copied across the boundary. Only I2 and C5 have bars that cross a dashed line, one elite per boundary, so the elitism setting was 1. C4 and C6 were born at a boundary but left at the next one, so they were ordinary children.",
    },
    {
      type: "match",
      q: "Each row is the population right after one round of a scheme (20 members). Match each row to its scheme.",
      fig: compFig,
      pairs: [
        ["Row P", "Generational, 2 elites"],
        ["Row Q", "Steady-state, after one step"],
        ["Row R", "Generational, no elitism"],
        ["Row S", "Generational, 5 elites"],
      ],
      hint: "Count the pale squares: that is how many members were copied across unchanged.",
      why: "A generational round rebuilds the population: no elitism leaves 0 old members (row R), 2 elites leaves 2 (row P), 5 elites leaves 5 (row S). A steady-state step changes just one member, so 19 of the 20 stay (row Q).",
    },
    {
      type: "mcq",
      q: "Two GAs are drawn as state machines. Which one is steady-state, and what does that mean for a brand-new child?",
      fig: stateFig,
      o: [
        "Scheme 1: the child can be picked as a parent straight away",
        "Scheme 2: the child can be picked as a parent straight away",
        "Scheme 1: the child must wait in a holding area until the generation ends",
        "Scheme 2: the child must wait in a holding area until the generation ends",
      ],
      a: 1,
      why: "In scheme 2 the child goes straight into the population, replacing one member, so it can breed on the very next step: that is steady-state. In scheme 1 children collect in a holding area and the whole batch is swapped in together, which is the generational scheme.",
    },
    {
      type: "multi",
      q: "A generational GA (maximising) lost its best individual between generations 1 and 2, shown in red. Which changes would have <b>guaranteed</b> the best fitness could not fall?",
      fig: genTab,
      o: [
        "Copy the single best individual into every new population",
        "Switch to steady-state and always replace the weakest member",
        "Double the mutation rate so children are more varied",
        "Use bigger tournaments so the best is chosen more often",
      ],
      a: [0, 1],
      why: "Elitism of 1 and steady-state replace-weakest both protect the top individual by construction: it can never be overwritten. A higher mutation rate or bigger tournaments change the odds, but the best can still be missed by chance, so neither is a guarantee.",
    },
  ]);

  /* ---------- l4-replacement ---------- */
  const ringFig = (() => {
    const v = [0.7, 0.3, 0.9, 0.6, 0.2, 0.8, 0.65, 0.55],
      cx = 150,
      cy = 130,
      r = 100;
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)" stroke-width="3" stroke-dasharray="6 6"/>`;
    s += v
      .map((x, i) => {
        const a = ((-90 + 45 * i) * Math.PI) / 180,
          px = cx + r * Math.cos(a),
          py = cy + r * Math.sin(a);
        return pk(
          "s" + (i + 1),
          C(px, py, 26, "var(--panel)") +
            T(px, py - 2, "S" + (i + 1), { s: 11, c: DIM }) +
            T(px, py + 14, f2(x), { s: 12 }),
        );
      })
      .join("");
    s += T(cx, cy - 4, "Child: 0.50", { s: 14 }) + T(cx, cy + 16, "scan clockwise", { s: 11, c: DIM });
    return svg(300, 262, s);
  })();
  const diffFig = (() => {
    const before = [0.7, 0.3, 0.9, 0.6, 0.2, 0.8];
    const rows = [
      ["Before", before, -1, "var(--bg-2)"],
      ["Row A", before.map((v, i) => (i === 1 ? 0.5 : v)), 1],
      ["Row B", before.map((v, i) => (i === 4 ? 0.5 : v)), 4],
      ["Row C", before.map((v, i) => (i === 2 ? 0.5 : v)), 2],
      ["Row D", before, -1, null, "(unchanged)"],
      ["Row E", before.map((v, i) => (i === 0 ? 0.5 : v)), 0],
    ];
    let s = T(4, 14, "Child fitness 0.50. Orange outline = slot that changed.", { a: "start", s: 11, c: DIM });
    rows.forEach(([name, vals, ch, fill, note], k) => {
      const y = 24 + k * 40;
      s +=
        T(4, y + (note ? 15 : 21), name, { a: "start", s: 12 }) +
        (note ? T(4, y + 29, note, { a: "start", s: 10, c: DIM }) : "");
      vals.forEach((v, i) => {
        s +=
          R(66 + i * 46, y, 43, 34, i === ch ? "var(--amber-dim)" : fill || "var(--panel)", {
            r: 6,
            s: i === ch ? "var(--amber)" : "var(--line-2)",
            sw: i === ch ? 4 : 2,
          }) + T(66 + i * 46 + 21.5, y + 22, f2(v), { s: 12, c: i === ch ? "var(--amber-ink)" : "var(--text)" });
      });
    });
    return svg(350, 268, s);
  })();
  // Heat maps: same 12 children, replace-weakest vs replace-random
  const initPop = [0.55, 0.7, 0.4, 0.95, 0.3, 0.6, 0.8, 0.5],
    kids = [0.62, 0.35, 0.88, 0.45, 0.7, 0.9, 0.52, 0.66, 0.85, 0.4, 0.75, 0.58],
    victims = [5, 1, 7, 3, 0, 2, 6, 4, 1, 5, 2, 7];
  const evolve = (rule) => {
    const p = initPop.slice(),
      h = [p.slice()];
    kids.forEach((c, k) => {
      if (rule === "weakest") {
        let w = 0;
        p.forEach((v, i) => {
          if (v < p[w]) w = i;
        });
        if (c > p[w]) p[w] = c;
      } else p[victims[k]] = c;
      h.push(p.slice());
    });
    return h;
  };
  const heat = (hist, x0, name, id) => {
    let s = T(x0 + 71, 14, name, { s: 13 });
    hist.forEach((col, t) =>
      col.forEach((v, i) => {
        s += R(x0 + t * 11, 22 + i * 14, 11, 14, "var(--teal)", {
          fo: (0.08 + (0.92 * (v - 0.25)) / 0.7).toFixed(2),
          r: 0,
          s: "var(--panel)",
          sw: 1,
        });
      }),
    );
    return pk(id, s);
  };
  const heatFig = svg(
    340,
    170,
    heat(evolve("random"), 8, "Run A", "A") +
      heat(evolve("weakest"), 190, "Run B", "B") +
      swatch(8, 152, "var(--teal)", "weak", { fo: 0.1 }) +
      swatch(64, 152, "var(--teal)", "strong") +
      T(190, 152, "rows: 8 slots. columns: time →", { a: "start", s: 11, c: DIM }),
  );
  const queueFig = (() => {
    const id = "ar" + ++uid;
    let s = arrowDef(id) + T(4, 14, "Population", { a: "start", s: 12, c: DIM });
    [0.7, 0.3, 0.9, 0.6, 0.2, 0.8].forEach((v, i) => {
      s += R(4 + i * 56, 22, 52, 34, "var(--panel)", { r: 8 }) + T(30 + i * 56, 45, f2(v), { s: 13 });
    });
    s += T(4, 84, "Children waiting (first in line on the left)", { a: "start", s: 12, c: DIM });
    [0.5, 0.45, 0.25, 0.65].forEach((v, i) => {
      s +=
        R(4 + i * 84, 92, 60, 34, "var(--teal)", { fo: 0.8, r: 8 }) + T(34 + i * 84, 115, f2(v), { s: 13, c: "#fff" });
      if (i < 3) s += L(66 + i * 84, 109, 84 + i * 84, 109, { w: 3, mk: id });
    });
    return svg(340, 140, s);
  })();
  B.add("l4-replacement", [
    {
      type: "pick",
      q: "Replace-first-weaker starts at a random slot, then scans clockwise and overwrites the first member weaker than the child. Tap every slot where the scan could START and end up overwriting S2.",
      fig: ringFig,
      a: ["s1", "s2", "s6", "s7", "s8"],
      hint: "First find which members are weaker than 0.50. Then walk backwards from S2 until you hit another weaker member.",
      why: "Only S2 (0.30) and S5 (0.20) are weaker than the child. A scan overwrites S2 if it reaches S2 before S5: starting at S6, S7, S8, S1 or S2 itself. Starting at S3, S4 or S5 meets S5 first, so S2 survives. The start slot decides which weaker member goes, which is why first-weaker is not the same as weakest.",
    },
    {
      type: "cat",
      q: "A child with fitness 0.50 meets the population in the top row of the figure. Rows A to E show what the population looked like afterwards. Sort each outcome.",
      fig: diffFig,
      buckets: ["Only replace-first-weaker can do this", "Either rule can do this", "Neither rule can do this"],
      items: [
        ["Row A", 0],
        ["Row B", 1],
        ["Row C", 2],
        ["Row D", 2],
        ["Row E", 2],
      ],
      why: "Row B overwrote 0.20, the weakest, which replace-weakest always does and replace-first-weaker does if the scan reaches it first. Row A overwrote 0.30: a weaker member, but not the weakest, so only first-weaker can produce it. Rows C and E overwrote members stronger than the child, and row D threw the child away even though weaker members existed, which neither rule allows.",
    },
    {
      type: "pick",
      q: "The same 12 children were fed to two copies of the same population (8 slots, one per row). One run used replace-weakest, the other replace-random. Tap the run that used replace-weakest.",
      fig: heatFig,
      a: "B",
      why: "In run B the darkest cell never disappears and the palest cells are the ones that get overwritten, so the population only gets stronger (children worse than everyone are simply dropped, hence the repeated columns). In run A the darkest cell (the best, 0.95) is wiped out by a weak 0.45 child in column 5, which only a random victim can do.",
    },
    {
      type: "order",
      q: "Replace-weakest. The four children arrive one at a time, in the order shown. Put the members that get evicted in the order they leave.",
      fig: queueFig,
      items: ["The 0.20 member from the start", "The 0.30 member from the start", "The 0.45 child that arrived second"],
      hint: "Each child only gets in if it beats the weakest member at that moment. Track the weakest after each arrival.",
      why: "Child 0.50 beats the weakest (0.20), so 0.20 leaves. Child 0.45 beats the new weakest (0.30), so 0.30 leaves. Child 0.25 is worse than the weakest (now 0.45), so it is thrown away. Child 0.65 then beats the weakest, which is the 0.45 child that arrived second. Newcomers can be evicted too.",
    },
  ]);

  /* ---------- l4-pressure ---------- */
  const heatMini = (rows, x0, title, id) => {
    let s = T(x0 + 55, 14, title, { s: 13 });
    rows.split(" ").forEach((row, g) =>
      [...row].forEach((d, i) => {
        s += R(x0 + i * 11, 22 + g * 12, 11, 12, +d === 9 ? "var(--amber)" : "var(--teal)", {
          fo: +d === 9 ? 1 : (0.08 + (0.85 * d) / 9).toFixed(2),
          r: 0,
          s: "var(--panel)",
          sw: 1,
        });
      }),
    );
    return pk(id, s);
  };
  const takeFig = svg(
    370,
    170,
    heatMini(
      "5378204196 7459775737 7979775597 7999799777 7797999999 9999999799 9999999999 9999999999 9999999999",
      6,
      "Map A",
      "A",
    ) +
      heatMini(
        "3546870129 0161271881 1121868712 1867118161 8618161788 1878818168 7188117116 7176781186 1166667177",
        130,
        "Map B",
        "B",
      ) +
      heatMini(
        "7832159406 9999999999 9999999999 9999999999 9999999999 9999999999 9999999999 9999999999 9999999999",
        254,
        "Map C",
        "C",
      ) +
      swatch(6, 150, "var(--teal)", "weak", { fo: 0.1 }) +
      swatch(62, 150, "var(--teal)", "strong") +
      swatch(128, 150, "var(--amber)", "the original best") +
      T(185, 166, "10 individuals per row, one row per generation", { s: 10, c: FAINT }),
  );
  // scatter: roulette vs linear rank
  const scatFig = (() => {
    const fit = [8, 9, 10, 11, 12, 40],
      tot = fit.reduce((a, b) => a + b),
      x0 = 40,
      Y = (p) => 224 - p * 400,
      X = (i) => x0 + 28 + i * 50;
    let s = [0, 10, 20, 30, 40]
      .map(
        (t) =>
          L(x0, Y(t / 100), 340, Y(t / 100), { c: "var(--line)", w: 1 }) +
          T(x0 - 5, Y(t / 100) + 4, t + "%", { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    s +=
      L(x0, Y(1 / 6), 340, Y(1 / 6), { c: "var(--amber)", w: 3, dash: "7 5" }) +
      T(340, Y(1 / 6) - 6, "equal chance (1 in 6)", { a: "end", s: 11, c: "var(--amber-ink)" });
    fit.forEach((f, i) => {
      s += T(X(i), 246, "#" + (i + 1), { s: 12 }) + T(X(i), 262, "fit. " + f, { s: 10, c: FAINT });
      s +=
        C(X(i) - 7, Y(f / tot), 7, "var(--blue)", { s: "var(--panel)", sw: 2 }) +
        R(X(i) + 1, Y((i + 1) / 21) - 7, 13, 13, "var(--violet)", { r: 3, s: "var(--panel)", sw: 2 });
    });
    s +=
      C(60, 12, 6, "var(--blue)", { s: "var(--panel)", sw: 2 }) +
      T(72, 16, "roulette", { a: "start", s: 11 }) +
      R(150, 6, 12, 12, "var(--violet)", { r: 3, s: "var(--panel)", sw: 2 }) +
      T(168, 16, "linear rank", { a: "start", s: 11 });
    return svg(350, 272, s);
  })();
  // stacked 100% bars: where tournament winners come from
  const stackFig = (() => {
    const rows = [
        ["P", 5],
        ["Q", 1],
        ["R", 10],
        ["S", 2],
      ],
      cols = ["var(--teal)", "var(--blue)", "var(--rose)"];
    let s =
      swatch(30, 14, cols[0], "top third", { fo: 0.85 }) +
      swatch(122, 14, cols[1], "middle third", { fo: 0.85 }) +
      swatch(236, 14, cols[2], "bottom third", { fo: 0.85 });
    rows.forEach(([id, t], k) => {
      const top = 1 - Math.pow(2 / 3, t),
        bot = Math.pow(1 / 3, t),
        mid = 1 - top - bot,
        y = 30 + k * 40,
        vals = [top, mid, bot];
      s += T(12, y + 22, id, { s: 14 });
      let x = 28;
      vals.forEach((v, i) => {
        const w = 316 * v;
        if (w > 0.5)
          s +=
            R(x, y, w, 32, cols[i], { fo: 0.85, r: 0, s: "var(--panel)", sw: 1 }) +
            (w > 26 ? T(x + w / 2, y + 21, Math.round(v * 100) + "%", { s: 12, c: "#fff" }) : "");
        x += w;
      });
    });
    return svg(350, 196, s + T(175, 192, "share of tournament winners by where they come from", { s: 10, c: FAINT }));
  })();
  // region map
  const regionFig = (() => {
    const PL = 54,
      PR = 344,
      PT = 12,
      PB = 250,
      id = "cl" + ++uid,
      U = (x) => 112 - (x - PL) * (90 / 290);
    const xs = (t) => PL + ((t - 1) / 9) * 290,
      ys = [36, 100, 164, 228];
    const poly = (a, col) => `<polygon points="${a.join(" ")}" fill="${col}"/>`;
    let s =
      `<defs><clipPath id="${id}"><rect x="${PL}" y="${PT}" width="${PR - PL}" height="${PB - PT}"/></clipPath></defs><g clip-path="url(#${id})">` +
      poly(
        [
          [PL, PT - 20],
          [PR, PT - 20],
          [PR, U(PR)],
          [PL, U(PL)],
        ],
        "var(--amber-dim)",
      ) +
      poly(
        [
          [PL, U(PL)],
          [PR, U(PR)],
          [PR, U(PR) + 120],
          [PL, U(PL) + 120],
        ],
        "var(--teal-dim)",
      ) +
      poly(
        [
          [PL, U(PL) + 120],
          [PR, U(PR) + 120],
          [PR, PB + 20],
          [PL, PB + 20],
        ],
        "var(--rose-dim)",
      ) +
      "</g>";
    s += R(PL, PT, PR - PL, PB - PT, "none", { r: 0 });
    ["0.2", "0.02", "0.002", "0.0002"].forEach((l, i) => {
      s += T(PL - 5, ys[i] + 4, l, { a: "end", s: 10, c: DIM });
    });
    [2, 4, 6, 8, 10].forEach((t) => {
      s += T(xs(t), PB + 15, t, { s: 11, c: DIM });
    });
    s +=
      T(200, PB + 31, "Tournament size t (more pressure →)", { s: 11, c: DIM }) +
      T(2, 8, "Mutation rate per bit", { a: "start", s: 10, c: DIM });
    s +=
      T(262, 40, "wanders", { s: 11, c: "var(--amber-ink)" }) +
      T(250, 124, "healthy", { s: 11, c: "var(--teal-ink)" }) +
      T(298, 196, "premature", { s: 11, c: "var(--rose-ink)" }) +
      T(298, 210, "convergence", { s: 11, c: "var(--rose-ink)" });
    [
      ["A", 2, 0],
      ["B", 4, 1],
      ["C", 6, 2],
      ["D", 9, 3],
    ].forEach(([n, t, k]) => {
      s += C(xs(t), ys[k], 13, "var(--panel)", { s: "var(--ink)" }) + T(xs(t), ys[k] + 5, n, { s: 14 });
    });
    return svg(350, 282, s);
  })();
  B.add("l4-pressure", [
    {
      type: "pick",
      q: "Three takeover runs (selection only, no mutation or crossover) used random parents, tournaments of size 2, and always-pick-the-best. Tap the map made by <b>random</b> selection.",
      fig: takeFig,
      a: "B",
      why: "Map C is one single colour from the second row: always picking the best takes over at once. Map A darkens steadily and ends up all one colour: tournaments of 2 push towards fitter individuals. Map B is random: nothing pulls it towards darker cells, the average colour just wanders, and the orange best individual was lost by row 2. Diversity still shrinks by chance (drift), but not towards fitness.",
    },
    {
      type: "cat",
      q: "Parents are drawn by roulette or by linear rank from six individuals (fitness 8 to 40). Each mark shows a chance of being picked. Compare each individual with the dashed line (equal chance for all).",
      fig: scatFig,
      buckets: [
        "Above the line under both methods",
        "Below the line under both methods",
        "Above the line under rank only",
      ],
      items: [
        ["#1 (fitness 8)", 1],
        ["#3 (fitness 10)", 1],
        ["#4 (fitness 11)", 2],
        ["#5 (fitness 12)", 2],
        ["#6 (fitness 40)", 0],
      ],
      why: "Roulette gives shares of 8, 9, 10, 11, 12 and 40 out of 90: the superfit #6 gets 44% and everyone else is squeezed below 1 in 6. Rank selection gives 1 to 6 out of 21, a steady staircase, so from #4 up (19%, 24%, 29%) the chances clear 1 in 6. The two methods disagree on #4 and #5 because roulette cares how far ahead #6 is.",
    },
    {
      type: "match",
      q: "Each bar shows where the <b>winners</b> of many tournaments come from (large population, entrants drawn with replacement). Match each bar to its tournament size.",
      fig: stackFig,
      pairs: [
        ["Bar P", "Tournament size 5"],
        ["Bar Q", "Tournament size 1"],
        ["Bar R", "Tournament size 10"],
        ["Bar S", "Tournament size 2"],
      ],
      hint: "The bottom third wins only if every entrant comes from it: 1/3 for size 1, 1/3 × 1/3 for size 2.",
      why: "Size 1 is just a random pick: a third from each part. Size 2 lets the bottom third win only when both entrants are from it (1/9 = 11%), so the top third rises to 56%. Size 5 gives the top third 87%, and size 10 about 98% with the middle third almost gone. Each extra entrant shifts the winners upwards.",
    },
    {
      type: "order",
      q: "The map shows four setups, A to D. Put them in order from MOST to LEAST likely to suffer premature convergence.",
      fig: regionFig,
      items: ["Setup D", "Setup C", "Setup B", "Setup A"],
      why: "Premature convergence comes from strong pressure plus too little variation: setup D (big tournaments, almost no mutation) is deepest in that corner. Moving left and up lowers the pressure and adds variation: C is near the edge, B is in the healthy band, and A, with weak tournaments and heavy mutation, has the opposite problem: it wanders.",
    },
  ]);

  /* ---------- l4-roulette ---------- */
  const tapeFig = (() => {
    const spins = ["C", "B", "C", "A", "A", "A", "A", "A"],
      col = { A: "var(--teal)", B: "var(--blue)", C: "var(--amber)" };
    let s = ["A: fitness 1", "B: fitness 1", "C: fitness 2"]
      .map(
        (t, i) =>
          R(4 + i * 112, 4, 14, 14, col["ABC"[i]], { fo: 0.85, r: 4 }) + T(24 + i * 112, 16, t, { a: "start", s: 12 }),
      )
      .join("");
    spins.concat(["?"]).forEach((v, i) => {
      const q = v === "?";
      s +=
        R(4 + i * 37, 34, 34, 40, q ? "var(--panel)" : col[v], { fo: q ? 1 : 0.85, r: 8, dash: q ? "5 4" : null }) +
        T(21 + i * 37, 60, v, { s: 17, c: q ? DIM : "#fff" }) +
        T(21 + i * 37, 90, i + 1, { s: 11, c: FAINT });
    });
    return svg(340, 102, s);
  })();
  const scat2 = (() => {
    const pts = [
        [1, 98],
        [2, 205],
        [3, 301],
        [4, 392],
        [5, 395],
        [6, 603],
      ],
      X = (f) => 46 + f * 44,
      Y = (v) => 212 - v * 0.31;
    let s = [0, 200, 400, 600]
      .map(
        (v) => L(40, Y(v), 330, Y(v), { c: "var(--line)", w: 1 }) + T(35, Y(v) + 4, v, { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    s +=
      T(190, 252, "fitness of the individual", { s: 11, c: DIM }) +
      T(4, 10, "times picked in a long run", { a: "start", s: 11, c: DIM });
    pts.forEach(([f, v]) => {
      s +=
        T(X(f), 234, f, { s: 11, c: DIM }) +
        pk("f" + f, C(X(f), Y(v), 14, "var(--panel)", { s: "var(--blue)" }) + T(X(f), Y(v) + 4, f, { s: 12 }));
    });
    return svg(340, 262, s);
  })();
  const shiftTab = `<table class="t"><tr><th>Tour</th><th class="num">Profit</th><th class="num">+ 4</th><th class="num">Wheel share</th></tr>
    <tr><td>A</td><td class="num">−4</td><td class="num">0</td><td class="num"><b style="color:var(--rose-ink)">0%</b></td></tr>
    <tr><td>B</td><td class="num">2</td><td class="num">6</td><td class="num">30%</td></tr>
    <tr><td>C</td><td class="num">6</td><td class="num">10</td><td class="num">50%</td></tr>
    <tr><td>D</td><td class="num">0</td><td class="num">4</td><td class="num">20%</td></tr></table>`;
  const miniBars = (() => {
    const mk = (x0, name, vals) => {
      let s = T(x0 + 52, 14, name, { s: 13 });
      vals.forEach((v, i) => {
        const h = v * 1.3;
        s +=
          R(x0 + 6 + i * 32, 148 - h, 26, Math.max(h, 1), "var(--blue)", { fo: 0.85, r: 4 }) +
          T(x0 + 19 + i * 32, 142 - h, v + "%", { s: 11 }) +
          T(x0 + 19 + i * 32, 164, "ABC"[i], { s: 12, c: DIM });
      });
      return s + L(x0, 148, x0 + 104, 148);
    };
    return svg(
      340,
      186,
      mk(4, "Chart X", [60, 40, 0]) +
        mk(118, "Chart Y", [14, 29, 57]) +
        mk(232, "Chart Z", [57, 29, 14]) +
        T(170, 182, "bars are tours A, B, C: their chance of being picked", { s: 10, c: FAINT }),
    );
  })();
  B.add("l4-roulette", [
    {
      type: "slider",
      q: "A roulette wheel has three individuals (A fitness 1, B fitness 1, C fitness 2). The wheel is built correctly. What is the chance that spin 9 picks A?",
      fig: tapeFig,
      min: 0,
      max: 100,
      step: 5,
      ans: 25,
      tol: 5,
      unit: "%",
      hint: "The wheel is the same for every spin. A owns 1 slice out of 1 + 1 + 2 = 4.",
      why: "Every spin starts afresh: A always owns 1 out of 4 slices, so 25%, whatever happened before. Five A's in a row is rare (1 in 1,024) but it does not make A 'due' or 'hot'. If streaks like this kept showing up, you would suspect a bug in the wheel, not luck.",
    },
    {
      type: "pick",
      q: "In a long run of roulette spins, each individual's pick count is plotted against its fitness. Roulette predicts a straight line through the origin. Tap the one individual that does not fit.",
      fig: scat2,
      a: "f5",
      why: "Picks should be proportional to fitness, about 100 per unit here: roughly 98, 205, 301, 392 and 603 for fitness 1, 2, 3, 4 and 6. Individual 5 got only 395, the count of a fitness-4 individual, where about 500 was expected. That points to a bug in how the wheel was built.",
    },
    {
      type: "mcq",
      q: "A student makes negative profits usable in roulette by adding 4 (the biggest loss) to every score. What goes wrong?",
      fig: shiftTab,
      o: [
        "The worst tour now has a slice of zero, so it can never be picked",
        "The shares no longer add up to 100%, so some spins land on nothing",
        "Adding a constant reverses the order, so the best becomes the worst",
        "A score of zero is not allowed, so tour D is thrown out of the wheel",
      ],
      a: 0,
      why: "Shifting by exactly the biggest loss turns the worst score into 0, so tour A has no slice and can never be selected, which throws away its (possibly useful) genes. The shares still add to 100% (0 + 30 + 50 + 20), the order is unchanged, and D with a shifted score of 4 keeps a 20% slice. Shift by a little more than the biggest loss, or switch to rank or tournament selection.",
    },
    {
      type: "match",
      q: "Three tours cost 10, 20 and 40 (shorter is better). Each chart shows the chance of being picked under a different score-to-fitness rule. Match each chart to its rule.",
      fig: miniBars,
      pairs: [
        ["Chart X", "Fitness = 40 − cost"],
        ["Chart Y", "Fitness = cost (wrong way round)"],
        ["Chart Z", "Fitness = 1 ÷ cost"],
      ],
      hint: "Try each rule on the costs 10, 20, 40, then turn the three numbers into shares of their total.",
      why: "With 1 ÷ cost the scores are 0.1, 0.05 and 0.025, so the shares are 57%, 29% and 14% (chart Z). With 40 − cost they are 30, 20 and 0, so shares 60%, 40% and 0%: the costliest tour gets no slice (chart X). Using cost itself reverses the preference, 14%, 29%, 57% (chart Y).",
    },
  ]);

  /* ---------- l4-rank ---------- */
  const rankLines = (() => {
    const X = (r) => 50 + (r - 1) * 40,
      Y = (p) => 214 - p * 560;
    let s = [0, 0.1, 0.2, 0.3]
      .map(
        (p) =>
          L(40, Y(p), 335, Y(p), { c: "var(--line)", w: 1 }) +
          T(35, Y(p) + 4, Math.round(p * 100) + "%", { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    const path = (f, c) =>
      `<path d="${[1, 2, 3, 4, 5, 6, 7, 8].map((r, i) => `${i ? "L" : "M"}${X(r)} ${Y(f(r))}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3"/>` +
      [1, 2, 3, 4, 5, 6, 7, 8].map((r) => C(X(r), Y(f(r)), 4.5, c, { s: "var(--panel)", sw: 2 })).join("");
    s += path((r) => r / 36, "var(--blue)") + path((r) => (r * r) / 204, "var(--violet)");
    for (let r = 1; r <= 8; r++) s += T(X(r), 232, r, { s: 11, c: DIM });
    s += T(190, 250, "rank (1 = worst, 8 = best)", { s: 11, c: DIM });
    s +=
      L(50, 12, 68, 12, { c: "var(--blue)", w: 4 }) +
      T(74, 16, "weight = rank", { a: "start", s: 11 }) +
      L(188, 12, 206, 12, { c: "var(--violet)", w: 4 }) +
      T(212, 16, "weight = rank²", { a: "start", s: 11 });
    return svg(350, 258, s);
  })();
  const pipeFig = (() => {
    const id = "ar" + ++uid,
      st = [
        ["1  Raw fitness", "A 0.9012    B 0.9031    C 0.9025"],
        ["2  Sort worst to best", "A 0.9012    C 0.9025    B 0.9031"],
        ["3  Swap each value for its rank", "A 1    C 2    B 3"],
        ["4  Weight = rank, scale to 100%", "A 17%    C 33%    B 50%"],
        ["5  Spin the wheel", "slices of 17%, 33% and 50%"],
      ];
    let s = arrowDef(id);
    st.forEach(([a, b], i) => {
      const y = 4 + i * 58;
      s += pk(
        "s" + (i + 1),
        R(4, y, 342, 46, "var(--panel)", { r: 10 }) +
          T(16, y + 19, a, { a: "start", s: 12.5 }) +
          T(16, y + 37, b, { a: "start", s: 11.5, c: DIM }),
      );
      if (i < 4) s += L(175, y + 48, 175, y + 56, { w: 3, mk: id });
    });
    return svg(350, 296, s);
  })();
  const stairs = (() => {
    let s = "";
    for (let i = 1; i <= 8; i++)
      s +=
        R(6 + (i - 1) * 42, 168 - i * 18, 38, i * 18, "var(--violet)", { fo: 0.3 + i * 0.08, r: 4 }) +
        T(25 + (i - 1) * 42, 162 - i * 18, i, { s: 13 });
    s += T(25, 186, "worst", { s: 11, c: DIM }) + T(319, 186, "best", { s: 11, c: DIM });
    return svg(344, 194, s);
  })();
  const matFig = (() => {
    const fit = [4, 5, 9, 10, 12, 40],
      cols = [
        ["X", [0.2, 1.8, 6.1, 14.5, 28.3, 49.0]],
        ["Y", fit.map((f) => (100 * f) / 80)],
        ["Z", [1, 2, 3, 4, 5, 6].map((r) => (100 * r) / 21)],
      ];
    const lab = (v) => (v < 1 ? "<1" : Math.round(v));
    let s = T(36, 16, "Fitness", { s: 11, c: DIM });
    cols.forEach(([n], j) => {
      s += T(130 + j * 88, 16, "Column " + n, { s: 12 });
    });
    fit.forEach((f, i) => {
      const y = 24 + i * 34;
      s += T(36, y + 21, f, { s: 14 });
      cols.forEach(([, vals], j) => {
        s +=
          R(90 + j * 88, y, 82, 30, "var(--teal)", {
            fo: (0.1 + (0.8 * vals[i]) / 50).toFixed(2),
            r: 4,
            s: "var(--panel)",
            sw: 2,
          }) + T(131 + j * 88, y + 20, lab(vals[i]) + "%", { s: 13 });
      });
    });
    return svg(350, 232, s);
  })();
  B.add("l4-rank", [
    {
      type: "cat",
      q: "Eight individuals ranked 1 (worst) to 8 (best). Blue gives each one a chance proportional to its rank, purple proportional to its rank squared. Does squaring give each rank MORE or LESS chance?",
      fig: rankLines,
      buckets: ["Squaring gives more chance", "Squaring gives less chance"],
      items: [
        ["Rank 2", 1],
        ["Rank 4", 1],
        ["Rank 5", 1],
        ["Rank 6", 0],
        ["Rank 8", 0],
      ],
      hint: "Both curves are shares of 100%. If the top ranks gain, the lower ranks must lose.",
      why: "Rank weights total 36 and squared weights total 204. For rank 5 that is 5/36 = 14% against 25/204 = 12%, so squaring loses; for rank 6 it is 17% against 18%, so it wins. The curves cross between ranks 5 and 6: squaring takes chance from the lower five ranks and hands it to the top three, which is higher selection pressure.",
    },
    {
      type: "pick",
      q: "Rank selection never looks at how <i>far apart</i> the fitness values are. Tap the stage after which the tiny gaps between these three nearly identical fitness values can no longer affect the selection.",
      fig: pipeFig,
      a: "s3",
      why: "Sorting (stage 2) still carries the real values, so they could in principle be used. Stage 3 replaces each value by its rank, 1, 2, 3: from then on only the order survives, and the size of the gaps (0.0019 or 0.19, it makes no difference) is gone. That is why rank selection keeps its pressure when a population has converged and why roulette loses it.",
    },
    {
      type: "slider",
      q: "Linear rank selection (weight = rank). With 8 individuals, the best is 8 times as likely to be picked as the worst. With a population of 40, how many times as likely is the best?",
      fig: stairs,
      min: 0,
      max: 80,
      step: 5,
      ans: 40,
      tol: 5,
      unit: "×",
      hint: "The worst has weight 1 and the best has weight N.",
      why: "Weights run 1, 2, 3 … N, so the best is N times as likely as the worst: 40 times for N = 40. The ratio grows with the population, and does not depend on the fitness values at all.",
    },
    {
      type: "match",
      q: "Same six individuals (fitness shown), three selection schemes: roulette, linear rank, and rank cubed. Each column lists the chance of being picked. Match each column to its scheme.",
      fig: matFig,
      pairs: [
        ["Column X", "Rank cubed"],
        ["Column Y", "Roulette"],
        ["Column Z", "Linear rank"],
      ],
      hint: "Roulette shares follow the fitness values: 40 is ten times 4. Linear rank rises in even steps.",
      why: "Column Y is roulette: its shares are the fitness values over their total (4, 5, 9, 10, 12 and 40 out of 80, so 50% for the best). Column Z is linear rank, an even staircase of 1 to 6 out of 21. Column X is the steepest: rank cubed gives the best 49% and the worst almost nothing.",
    },
  ]);

  /* ---------- l4-tournament ---------- */
  const gridFig = (() => {
    let s =
      T(4, 14, "A 0.9 (fittest)    B 0.6    C 0.3 (weakest)", { a: "start", s: 12, c: DIM }) +
      T(210, 40, "second entrant", { s: 11, c: DIM }) +
      T(26, 114, "first", { s: 11, c: DIM }) +
      T(26, 128, "entrant", { s: 11, c: DIM });
    "ABC".split("").forEach((c, i) => {
      s += T(130 + i * 78, 62, c, { s: 15 }) + T(70, 104 + i * 64 + 4, c, { s: 15 });
    });
    "ABC".split("").forEach((r, i) =>
      "ABC".split("").forEach((c, j) => {
        s += pk(
          r + c,
          R(92 + j * 78, 70 + i * 64, 74, 56, "var(--panel)", { r: 10 }) +
            T(129 + j * 78, 70 + i * 64 + 33, r + ", " + c, { s: 12, c: DIM }),
        );
      }),
    );
    return svg(340, 268, s);
  })();
  const seqFig = (() => {
    const X = { m1: 56, co: 178, m2: 300 },
      id = "ar" + ++uid;
    let s = arrowDef(id);
    [
      ["Machine 1", "m1"],
      ["Coordinator", "co"],
      ["Machine 2", "m2"],
    ].forEach(([n, k]) => {
      s +=
        R(X[k] - 50, 4, 100, 26, "var(--bg-2)", { r: 8 }) +
        T(X[k], 22, n, { s: 11.5 }) +
        L(X[k], 32, X[k], 262, { dash: "5 5" });
    });
    const arrow = (x1, x2, y) => L(x1, y, x2, y, { w: 3, c: "var(--blue)", mk: id });
    const hit = (x, y, w, h) => R(x, y, w, h, "transparent", { r: 8, s: "transparent" });
    s += pk("m1", hit(46, 42, 142, 34) + arrow(56, 170, 66) + T(113, 58, "subtotal", { s: 11 }));
    s += pk("m2", hit(168, 82, 142, 34) + arrow(300, 186, 106) + T(243, 98, "subtotal", { s: 11 }));
    s += pk(
      "m3",
      hit(46, 124, 264, 34) +
        arrow(170, 60, 150) +
        arrow(186, 296, 150) +
        T(113, 142, "grand total", { s: 11 }) +
        T(243, 142, "grand total", { s: 11 }),
    );
    s += pk(
      "m4",
      R(10, 172, 92, 28, "var(--amber-dim)", { r: 8, s: "var(--amber)" }) +
        T(56, 191, "pick parent", { s: 11 }) +
        R(254, 172, 92, 28, "var(--amber-dim)", { r: 8, s: "var(--amber)" }) +
        T(300, 191, "pick parent", { s: 11 }),
    );
    s += pk(
      "m5",
      hit(46, 212, 264, 40) +
        arrow(56, 170, 238) +
        arrow(300, 186, 238) +
        T(113, 230, "parent", { s: 11 }) +
        T(243, 230, "parent", { s: 11 }),
    );
    return svg(350, 268, s);
  })();
  const histFig = (() => {
    const mk = (x0, t, mean) => {
      let s = T(x0 + 50, 14, "t = " + t, { s: 13 }),
        mx = 0.28;
      for (let k = 0; k < 10; k++) {
        const p = Math.pow((k + 1) / 10, t) - Math.pow(k / 10, t),
          h = (p / mx) * 110;
        s += R(x0 + k * 10, 142 - h, 9, h, "var(--violet)", { fo: 0.8, r: 2, sw: 1 });
      }
      const mxp = x0 + mean;
      s +=
        L(mxp, 28, mxp, 142, { c: "var(--amber)", w: 3, dash: "5 4" }) +
        T(mxp, 160, "mean " + Math.round(mean), { s: 11, c: "var(--amber-ink)" }) +
        L(x0 - 2, 142, x0 + 102, 142) +
        T(x0, 176, "0", { s: 10, c: FAINT }) +
        T(x0 + 100, 176, "100", { s: 10, c: FAINT });
      return s;
    };
    return svg(340, 184, mk(6, 1, 50) + mk(122, 2, 200 / 3) + mk(238, 3, 75));
  })();
  const traceTab = `<table class="t"><tr><th>Call</th><th>Entrants: slot (fitness)</th><th>Returned</th></tr>
    <tr class="bad"><td>1</td><td>8 (0.20) &nbsp;3 (0.90) &nbsp;5 (0.40)</td><td>slot 8: 0.20</td></tr>
    <tr class="bad"><td>2</td><td>2 (0.70) &nbsp;6 (0.10) &nbsp;1 (0.50)</td><td>slot 6: 0.10</td></tr>
    <tr><td>3</td><td>4 (0.60) &nbsp;0 (0.30) &nbsp;7 (0.80)</td><td>slot 7: 0.80</td></tr></table>`;
  B.add("l4-tournament", [
    {
      type: "pick",
      q: "Size-2 tournaments with replacement among three individuals. Each cell is one equally likely pair of entrants (first draw, second draw); the fitter entrant wins. Tap every cell where <b>B</b> wins.",
      fig: gridFig,
      a: ["BB", "BC", "CB"],
      why: "A beats everyone, so B can only win when no A is drawn, and when B is drawn at least once: (B, B), (B, C) and (C, B). That is 3 of the 9 equally likely pairs, so B wins 1/3 of the time. A wins 5/9 (every cell with an A) and C only 1/9 (C, C).",
    },
    {
      type: "pick",
      q: "A population lives on two machines; a coordinator can add up their fitness. Roulette selection needs the messages below. Now the GA switches to tournament selection (each machine runs tournaments on its own individuals). Tap every message that is no longer needed.",
      fig: seqFig,
      a: ["m1", "m2", "m3"],
      why: "Roulette needs the grand total of all fitness, so every machine reports a subtotal and the total is sent back (messages 1 to 3). Tournament selection only compares the few entrants it draws, so it needs no global information at all. Picking a parent still happens locally and the parent still has to be sent on, so those messages stay.",
    },
    {
      type: "slider",
      q: "Fitness values are spread evenly from 0 to 100, and a tournament returns the fittest of t random entrants. The dashed lines show the average winner for t = 1, 2 and 3. About what is the average winner's fitness for t = 9?",
      fig: histFig,
      min: 50,
      max: 100,
      step: 5,
      ans: 90,
      tol: 5,
      hint: "The averages are 1/2, 2/3 and 3/4 of the way up the range. What is the pattern?",
      why: "The means follow t ÷ (t + 1) of the range: 50, 67, 75, and so 9/10 = 90 for t = 9. Each extra entrant makes it less likely that all of them are weak, so the winner's fitness creeps towards the top with diminishing returns.",
    },
    {
      type: "bug",
      q: "This tournament is meant to return the fittest of t random slots, but it keeps returning weak individuals. The trace of three calls is above. Tap the faulty line.",
      fig: traceTab,
      code: [
        "def tournament(pop, t):",
        "    n = len(pop)",
        "    idx = random.sample(range(n), t)",
        "    best = max(idx)",
        "    return pop[best]",
      ],
      a: 3,
      why: "max(idx) picks the largest slot NUMBER, not the fittest slot: call 1 returned slot 8 (0.20) although slot 3 (0.90) was in the tournament. It only looks right when the highest slot happens to be the fittest, as in call 3. The fix is max(idx, key=lambda i: pop[i].fit).",
    },
  ]);

  /* ---------- l4-mutation ---------- */
  const tspFig = (() => {
    const P = { A: [40, 50], B: [150, 22], C: [270, 48], D: [292, 168], E: [160, 206], F: [38, 160] };
    const par = ["AB", "BC", "CD", "DE", "EF", "FA"],
      child = ["AD", "DC", "CB", "BE", "EF", "FA"];
    let s = par
      .map((e) => L(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { c: FAINT, w: 3, dash: "3 6", cap: true }))
      .join("");
    s += child
      .map((e) =>
        pk(
          e,
          L(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { c: "var(--blue)", w: 5, cap: true }) +
            L(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { c: "transparent", w: 22 }),
        ),
      )
      .join("");
    s += Object.entries(P)
      .map(([k, [x, y]]) => C(x, y, 15, "var(--panel)", { s: "var(--ink)" }) + T(x, y + 5, k, { s: 14 }))
      .join("");
    s +=
      L(10, 240, 38, 240, { c: FAINT, w: 3, dash: "3 6" }) +
      T(44, 244, "parent tour", { a: "start", s: 11 }) +
      L(150, 240, 178, 240, { c: "var(--blue)", w: 5 }) +
      T(184, 244, "child tour", { a: "start", s: 11 });
    return svg(330, 256, s);
  })();
  const binomHist = (() => {
    const Cn = (n, k) => {
        let r = 1;
        for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
        return r;
      },
      b = (p, k) => Cn(20, k) * Math.pow(p, k) * Math.pow(1 - p, 20 - k);
    const mk = (x0, name, p) => {
      let s = T(x0 + 50, 14, name, { s: 13 });
      for (let k = 0; k <= 9; k++) {
        const h = b(p, k) * 140;
        s +=
          R(x0 + k * 10, 150 - h, 8.5, Math.max(h, 0.5), "var(--blue)", { fo: 0.85, r: 2, sw: 1 }) +
          (k % 3 === 0 ? T(x0 + k * 10 + 4, 165, k, { s: 10, c: DIM }) : "");
      }
      return s + L(x0 - 2, 150, x0 + 100, 150);
    };
    return svg(
      340,
      188,
      mk(6, "Panel X", 0.25) +
        mk(122, "Panel Y", 0.01) +
        mk(238, "Panel Z", 0.05) +
        T(170, 184, "bits flipped in a child of a 20-bit string (0 to 9)", { s: 10, c: FAINT }),
    );
  })();
  const pairGrid = (() => {
    let s = "",
      n = 0;
    for (let i = 0; i < 6; i++) {
      s += T(46 + i * 44, 16, i + 1, { s: 12, c: DIM }) + T(12, 56 + i * 44, i + 1, { s: 12, c: DIM });
      for (let j = 0; j < 6; j++) {
        const on = i < j;
        if (on) n++;
        s +=
          R(26 + j * 44, 28 + i * 44, 40, 40, on ? "var(--teal)" : "var(--bg-2)", {
            fo: on ? 0.8 : 1,
            r: 6,
            s: "var(--panel)",
            sw: 2,
          }) + (on ? T(46 + j * 44, 53 + i * 44, n, { s: 13, c: "#fff" }) : "");
      }
    }
    return svg(292, 296, s);
  })();
  const dialFig = (() => {
    const cx = 150,
      cy = 150,
      r = 112,
      set = [
        ["r0", "0", 180],
        ["r1", ".002", 135],
        ["r2", ".02", 90],
        ["r3", ".1", 45],
        ["r4", ".5", 0],
      ];
    let s = `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="var(--line-2)" stroke-width="6" stroke-linecap="round"/>`;
    set.forEach(([id, l, a]) => {
      const x = cx + r * Math.cos((a * Math.PI) / 180),
        y = cy - r * Math.sin((a * Math.PI) / 180);
      s += pk(id, C(x, y, 26, "var(--panel)") + T(x, y + 5, l, { s: 13 }));
    });
    s +=
      T(cx, cy - 36, "flip rate per bit", { s: 13 }) +
      T(cx, cy - 18, "(each bit independently)", { s: 10, c: DIM }) +
      T(cx, cy + 12, "strings are 50 bits long", { s: 11, c: DIM });
    return svg(300, 186, s);
  })();
  B.add("l4-mutation", [
    {
      type: "pick",
      q: "A tour of the six cities A to F (grey dotted lines) is mutated by reversing the segment B C D. The child's tour is drawn in blue. Tap every edge of the child that was not in the parent.",
      fig: tspFig,
      a: ["AD", "BE"],
      why: "The parent visits A B C D E F; the child visits A D C B E F. Edges D–C, C–B, E–F and F–A already existed (an edge has no direction). Only A–D and B–E are new. A reversal changes just two edges however long the segment is, which makes it a small, gentle step for tour problems.",
    },
    {
      type: "match",
      q: "Bit-flip mutation on 20-bit strings: each panel shows how many bits flip in a child (0 to 9). Match each panel to the mutation rate per bit.",
      fig: binomHist,
      pairs: [
        ["Panel X", "0.25 per bit"],
        ["Panel Y", "0.01 per bit"],
        ["Panel Z", "0.05 per bit"],
      ],
      hint: "On average a child flips 20 × rate bits: 20 × 0.05 = 1.",
      why: "The average number of flips is 20 times the rate: 0.2, 1 and 5. At 0.01 most children (82%) are untouched copies (panel Y). At 0.05, which is 1/L, the typical child flips 0 or 1 bits (panel Z). At 0.25 the peak sits at about 5 flips and the child is already far from its parent (panel X).",
    },
    {
      type: "slider",
      q: "Swap mutation exchanges two positions of a tour. With 6 cities there are 15 different swaps (the 15 coloured cells: one per pair of positions). About how many different swaps exist for 10 cities?",
      fig: pairGrid,
      min: 0,
      max: 100,
      step: 5,
      ans: 45,
      tol: 5,
      hint: "Each coloured cell is a pair (row < column). For 10 cities: 10 × 9 pairs, counted once per swap.",
      why: "The number of swaps is the number of pairs of positions: n × (n − 1) / 2. For 6 cities 6 × 5 / 2 = 15, and for 10 cities 10 × 9 / 2 = 45. The set of neighbours grows with the square of the tour length, so for long tours a single swap is a tiny sample of what is reachable.",
    },
    {
      type: "pick",
      q: "Each dial setting is a possible mutation rate per bit for strings of 50 bits. Tap every setting that flips MORE than 2 bits per child on average.",
      fig: dialFig,
      a: ["r3", "r4"],
      hint: "Average flips = 50 × rate. For example 50 × 0.02 = 1.",
      why: "50 × 0.1 = 5 flips and 50 × 0.5 = 25 flips, both above 2. At 0.02 a child flips 1 bit on average (that is 1/L, the usual choice), at 0.002 only 0.1, and at 0 nothing ever changes. A rate of 0.5 flips half the string: the child keeps almost nothing of its parent.",
    },
  ]);

  /* ---------- l4-crossover ---------- */
  const splitFig = (() => {
    const X = (d) => 50 + (d - 1) * 32,
      Y = (p) => 212 - p * 190,
      curves = [
        ["X", () => 0.5, "var(--violet)"],
        ["Y", (d) => d / 9, "var(--blue)"],
        ["Z", (d) => (d * (9 - d)) / 36, "var(--amber)"],
      ];
    let s = [0, 0.5, 1]
      .map(
        (p) =>
          L(40, Y(p), 324, Y(p), { c: "var(--line)", w: 1 }) +
          T(35, Y(p) + 4, Math.round(p * 100) + "%", { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    for (let d = 1; d <= 9; d++) s += T(X(d), 232, d, { s: 11, c: DIM });
    s +=
      T(190, 250, "distance d between the two genes", { s: 11, c: DIM }) +
      T(2, 10, "chance the two genes come from different parents", { a: "start", s: 10, c: DIM });
    curves.forEach(([n, f, c]) => {
      const pts = Array.from({ length: 9 }, (_, i) => [X(i + 1), Y(f(i + 1))]);
      s += pk(
        n,
        `<path d="${pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ")}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>` +
          pts.map((p) => C(p[0], p[1], 4.5, c, { s: "var(--panel)", sw: 2 })).join("") +
          C(X(9) + 22, Y(f(9)), 11, c, { fo: 0.9, s: "var(--panel)", sw: 2 }) +
          T(X(9) + 22, Y(f(9)) + 5, n, { s: 12, c: "#fff" }),
      );
    });
    return svg(350, 258, s);
  })();
  const dagFig = (() => {
    const id = "ar" + ++uid,
      N = { G2: [56, 34], G1: [170, 34], G3: [284, 34], X: [113, 122], Y: [227, 122], Z: [170, 210] },
      E = [
        ["G2", "X"],
        ["G1", "X"],
        ["G1", "Y"],
        ["G3", "Y"],
        ["X", "Z"],
        ["Y", "Z"],
      ];
    let s = arrowDef(id);
    s += E.map(([a, b]) => {
      const [x1, y1] = N[a],
        [x2, y2] = N[b],
        d = Math.hypot(x2 - x1, y2 - y1),
        ux = (x2 - x1) / d,
        uy = (y2 - y1) / d;
      return L(x1 + ux * 25, y1 + uy * 25, x2 - ux * 29, y2 - uy * 29, { w: 3, mk: id });
    }).join("");
    s += Object.entries(N)
      .map(
        ([k, [x, y]]) =>
          C(x, y, 23, k === "G1" ? "var(--amber-dim)" : "var(--panel)", {
            s: k === "G1" ? "var(--amber)" : "var(--ink)",
          }) + T(x, y + 5, k, { s: 14 }),
      )
      .join("");
    s +=
      T(336, 206, "arrows point from", { a: "end", s: 10, c: FAINT }) +
      T(336, 220, "parent to child", { a: "end", s: 10, c: FAINT });
    return svg(340, 242, s);
  })();
  const nodupTab = (() => {
    const cell = (v, bad) =>
      `<td class="num" style="text-align:center${bad ? ";background:var(--rose-dim)" : ""}">${v}</td>`;
    const row = (n, a, bad = []) => `<tr><td>${n}</td>${a.map((v, i) => cell(v, bad.includes(i))).join("")}</tr>`;
    return `<table class="t"><tr><th>Gene</th>${[1, 2, 3, 4, 5, 6].map((i) => `<th class="num" style="text-align:center">${i}</th>`).join("")}</tr>${row("Parent 1", [1, 2, 3, 4, 5, 6])}${row("Parent 2", [3, 6, 5, 1, 4, 2])}${row("Child", [1, 2, 3, 1, 4, 2], [3, 5])}</table><p class="dim" style="margin:6px 0 0;font-size:13px">1-point crossover after gene 3: genes 1 to 3 from parent 1, genes 4 to 6 from parent 2. Red cells repeat a city.</p>`;
  })();
  const bitFig = (() => {
    const cols = [
      "101101",
      "111111",
      "011010",
      "110011",
      "000000",
      "101110",
      "000010",
      "110100",
      "111111",
      "010110",
      "100111",
      "011001",
    ];
    let s = "";
    for (let r = 0; r < 6; r++) s += T(16, 54 + r * 30, "P" + (r + 1), { s: 11, c: DIM });
    cols.forEach((c, j) => {
      let g = T(46 + j * 25, 20, j + 1, { s: 11, c: DIM });
      [...c].forEach((b, r) => {
        g +=
          R(34 + j * 25, 30 + r * 30, 23, 27, b === "1" ? "var(--blue)" : "var(--bg-2)", { r: 5, sw: 1.5 }) +
          T(45.5 + j * 25, 49 + r * 30, b, { s: 12, c: b === "1" ? "#fff" : DIM });
      });
      s += pk("c" + (j + 1), g);
    });
    return svg(340, 216, s);
  })();
  B.add("l4-crossover", [
    {
      type: "pick",
      q: "Parents are crossed over with 1-point, 2-point and uniform crossover. Each curve gives the chance that two genes d positions apart (in a 10-gene string) end up from different parents. Tap the curve for <b>2-point</b> crossover.",
      fig: splitFig,
      a: "Z",
      why: "Uniform crossover flips a fair coin per gene, so any two genes are separated half the time (curve X). With 1 cut, the further apart two genes are, the more likely the cut lands between them, a straight rise to 100% (curve Y). With 2 cuts, the middle segment swaps, so the two end genes both stay with the same parent: the chance falls back to 0 at d = 9. Curve Z is the hump: 2-point treats the string like a ring.",
    },
    {
      type: "slider",
      q: "Uniform crossover, no mutation: each gene of a child comes from either parent with equal chance. X and Y share the parent G1. About what percentage of Z's genes come from G1?",
      fig: dagFig,
      min: 0,
      max: 100,
      step: 5,
      ans: 50,
      tol: 10,
      unit: "%",
      hint: "A gene of Z comes from X or from Y with equal chance. Then from G1 with what chance on each route?",
      why: "A gene of Z comes from X half the time and then from G1 half of those times: 25%. It comes from Y half the time and then from G1 half of those: another 25%. The two routes cannot both happen to one gene, so 25% + 25% = 50%. Shared ancestors pile up in a family tree, which is one way diversity shrinks over generations.",
    },
    {
      type: "multi",
      q: "Plain 1-point crossover is applied to two city tours. Which statements about the child are true?",
      fig: nodupTab,
      o: [
        "City 1 and city 2 each appear twice",
        "Cities 5 and 6 are missing, so the tour is not valid",
        "The child is the wrong length",
        "Every gene came from a parent, so the tour is valid",
        "Replacing the repeated 1 and 2 at genes 4 and 6 with 5 and 6 would repair it",
      ],
      a: [0, 1, 4],
      why: "The child is 1 2 3 1 4 2: cities 1 and 2 are visited twice, and 5 and 6 never. It still has 6 genes, so the length is right; the problem is the content. Permutations are not just any string of parent genes, which is why order crossover and similar operators exist. Putting 5 and 6 where the repeats are (genes 4 and 6) would give a valid tour.",
    },
    {
      type: "pick",
      q: "Six members of the population are shown (blue = 1). Mutation is switched off. Tap every gene position that crossover can never change in any future child, however long the run.",
      fig: bitFig,
      a: ["c2", "c5", "c9"],
      why: "A child gene is always copied from some parent, so where every member agrees (genes 2, 5 and 9) nothing else can ever appear: crossover cannot create variation, only recombine it. Gene 7 looks nearly fixed but one member still has a 1, so crossover can pass it on. Only mutation could now change genes 2, 5 and 9.",
    },
  ]);

  /* ---------- l4-lab ---------- */
  const labHeat = (() => {
    const cnt = [
      [8, 8, 7, 8, 8, 8],
      [8, 5, 8, 8, 0, 8],
      [7, 8, 8, 3, 8, 8],
      [8, 8, 0, 8, 8, 6],
      [8, 1, 8, 8, 8, 8],
      [8, 8, 8, 8, 0, 8],
    ];
    let s = "";
    cnt.forEach((row, r) =>
      row.forEach((v, c) => {
        s += pk(
          "p" + r + c,
          R(4 + c * 50, 4 + r * 50, 46, 46, "var(--teal)", {
            fo: (0.06 + (0.8 * v) / 8).toFixed(2),
            r: 8,
            s: "var(--panel)",
            sw: 2,
          }) + T(27 + c * 50, 33 + r * 50, v, { s: 16 }),
        );
      }),
    );
    return svg(308, 308, s);
  })();
  const evalFig = (() => {
    const panel = (y0, title, xmax, ticks, x90, label) => {
      const X = (x) => 40 + (x / xmax) * 290,
        Y = (v) => y0 + 94 - ((v - 0.5) / 0.5) * 80,
        k = Math.log(5) / x90;
      const pts = Array.from({ length: 61 }, (_, i) => {
        const x = (i / 60) * xmax;
        return `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(1 - 0.5 * Math.exp(-k * x)).toFixed(1)}`;
      }).join(" ");
      let s =
        T(4, y0, title, { a: "start", s: 12 }) +
        L(40, Y(0.5), 330, Y(0.5)) +
        L(40, Y(0.9), 330, Y(0.9), { c: "var(--amber)", w: 2, dash: "6 5" }) +
        T(35, Y(0.9) + 4, "0.9", { a: "end", s: 10, c: "var(--amber-ink)" }) +
        T(35, Y(0.5) + 4, "0.5", { a: "end", s: 10, c: FAINT });
      s +=
        `<path d="${pts}" fill="none" stroke="var(--teal)" stroke-width="4"/>` +
        L(X(x90), Y(0.9), X(x90), Y(0.5), { c: "var(--amber)", w: 2, dash: "6 5" });
      ticks.forEach((t) => {
        s += T(X(t), Y(0.5) + 15, t, { s: 10, c: DIM });
      });
      return s + T(X(x90), Y(0.9) - 7, label, { s: 11, c: "var(--amber-ink)" });
    };
    return svg(
      340,
      276,
      panel(18, "Algorithm 1: x = steps (1 child per step)", 1000, [0, 250, 500, 750, 1000], 700, "0.9 at step 700") +
        panel(
          150,
          "Algorithm 2: x = generations (30 children each)",
          60,
          [0, 15, 30, 45, 60],
          40,
          "0.9 at generation 40",
        ),
    );
  })();
  const rateFig = (() => {
    const rates = ["0.0005", "0.002", "0.007", "0.02", "0.1", "0.5"],
      runs = [
        [0.72, 0.75, 0.7],
        [0.86, 0.89, 0.84],
        [0.96, 0.97, 0.94],
        [0.92, 0.9, 0.94],
        [0.77, 0.8, 0.74],
        [0.51, 0.49, 0.52],
      ];
    const X = (i) => 66 + i * 54,
      Y = (v) => 224 - ((v - 0.4) / 0.6) * 190;
    let s = [0.5, 0.7, 0.9]
      .map(
        (v) => L(36, Y(v), 340, Y(v), { c: "var(--line)", w: 1 }) + T(31, Y(v) + 4, v, { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    s +=
      L(X(2), 22, X(2), 232, { c: "var(--amber)", w: 2, dash: "6 5" }) +
      T(X(2) + 5, 18, "1/144", { a: "start", s: 11, c: "var(--amber-ink)" });
    rates.forEach((r, i) => {
      s += T(X(i), 248, r, { s: 10, c: DIM });
      runs[i].forEach((v, k) => {
        s += C(X(i) + (k - 1) * 11, Y(v), 6.5, "var(--blue)", { fo: 0.85, s: "var(--panel)", sw: 2 });
      });
    });
    s +=
      T(190, 266, "mutation rate per pixel (log scale)", { s: 11, c: DIM }) +
      T(2, 10, "final best fitness", { a: "start", s: 11, c: DIM });
    return svg(350, 274, s);
  })();
  const pixFig = (() => {
    const Tg = [".X..X.", "XXXXXX", "XXXXXX", ".XXXX.", "..XX..", "......"],
      par = ["XX..X.", "XXXX.X", "XXXXXX", "XXXXXX", "..XX..", "......"],
      flips = [
        [0, 1],
        [3, 0],
        [1, 4],
      ];
    const chd = par.map((r) => r.split(""));
    flips.forEach(([r, c]) => {
      chd[r][c] = chd[r][c] === "X" ? "." : "X";
    });
    const grid = (g, x0, name, mark) => {
      let s = T(x0 + 52, 14, name, { s: 13 });
      g.forEach((row, r) =>
        [...row].forEach((v, c) => {
          const isF = mark && flips.some(([a, b]) => a === r && b === c),
            cellSvg = R(x0 + c * 17.5, 22 + r * 17.5, 16, 16, v === "X" ? "var(--ink)" : "var(--bg-2)", {
              r: 3,
              s: isF ? "var(--amber)" : "var(--line)",
              sw: isF ? 3.5 : 1,
            });
          s += isF ? pk("p" + r + c, cellSvg) : cellSvg;
        }),
      );
      return s;
    };
    return svg(
      340,
      150,
      grid(Tg, 4, "Target", false) +
        grid(par, 118, "Parent", false) +
        grid(chd, 232, "Child", true) +
        T(170, 146, "dark = on, pale = off", { s: 10, c: FAINT }),
    );
  })();
  B.add("l4-lab", [
    {
      type: "pick",
      q: "Each number is how many of the 8 population members have that pixel of a 6 × 6 picture right. Mutation is off. Tap every pixel that selection and crossover can never fix.",
      fig: labHeat,
      a: ["p14", "p32", "p54"],
      hint: "Crossover can only reshuffle pixel values that someone in the population already has.",
      why: "A pixel that no member has right (the three zeros) offers crossover and selection nothing to combine; only mutation can flip it. A pixel that 1 or 3 members have right, such as the 1 and the 3, can still spread by selection and crossover. The 8s need no fixing at all. This is why a converged population stalls on its last wrong pixels.",
    },
    {
      type: "mcq",
      q: "Algorithm 1 (steady-state) and algorithm 2 (generational, population 30) both reach fitness 0.9. Which one needed fewer fitness evaluations?",
      fig: evalFig,
      o: [
        "Algorithm 1: about 700 evaluations, against 1,200",
        "Algorithm 2: its 40 generations are far fewer than 700 steps",
        "They are level: both curves reach 0.9 at the same height",
        "Algorithm 2: each whole generation is evaluated in parallel",
      ],
      a: 0,
      hint: "A step makes 1 child. A generation makes 30 children, so 30 evaluations.",
      why: "The two x axes count different things. A steady-state step evaluates one child, so 700 steps cost about 700 evaluations. A generation evaluates a whole new population, so 40 generations cost about 40 × 30 = 1,200. Compare costs in evaluations, not in generations or steps.",
    },
    {
      type: "mcq",
      q: "Each dot is one run on the same picture with the same number of evaluations, at a different per-pixel mutation rate. What explains the weaker results at BOTH ends of the curve?",
      fig: rateFig,
      o: [
        "Too few flips means slow exploring; too many scrambles progress",
        "Too few flips fills the population with copies; too many makes evaluation slower",
        "Low rates are blocked by elitism; high rates are blocked by tournament size",
        "Both ends are noise: three runs per setting cannot show any pattern at all",
      ],
      a: 0,
      why: "At 0.0005 per pixel most children are copies of their parents, so progress crawls. At 0.5 half the pixels flip, so a child is nearly a random picture and the good parts built so far are destroyed. The best results sit around 1/L = 1/144 per pixel, about one flip per child. Evaluation cost does not depend on the rate, and the three runs at each setting agree closely, so this is a real pattern.",
    },
    {
      type: "pick",
      q: "The child differs from its parent in three pixels (orange outlines). Compare them with the target and tap every changed pixel where the mutation HELPED.",
      fig: pixFig,
      a: ["p30", "p14"],
      why: "A flip helps when the parent was wrong at that pixel and the child is right. The first pixel of the fourth row was wrongly on and is now off, and the fifth pixel of the second row was wrongly off and is now on: two fixes. The second pixel of the top row was right in the parent and got broken. The net effect is 4 wrong pixels down to 3, a fitness of 33/36 instead of 32/36, and that is why a mutation can still be kept when part of it is harmful.",
    },
  ]);
})();

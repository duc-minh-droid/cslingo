/* Nature-Inspired revision bank — new scenarios per session, no calculator needed. Numbers verified with node. */
(function () {
  const N = NIC, B = N.bank, Qf = N.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  const bump = (x, c, s, a) => a * Math.exp(-((x - c) ** 2) / (2 * s * s));
  const land = (x) => 0.1 + bump(x, 0.2, 0.05, 0.5) + bump(x, 0.45, 0.06, 0.7) + bump(x, 0.8, 0.07, 1);

  /* ---------- Lecture 1 ---------- */
  B.add("l1-what", [
    { type: "cat", q: "Nature-inspired, or a classical algorithm?", buckets: ["Nature-inspired", "Classical"],
      items: [["A genetic algorithm tuning a bus timetable", 0], ["Binary search on a sorted list", 1], ["Ant-colony routing of delivery vans", 0], ["A neural network reading handwritten postcodes", 0], ["Merge sort", 1]],
      why: "Nature-inspired methods copy evolution, brains or collective behaviour. Binary search and merge sort are hand-designed step-by-step procedures." },
    M("What do evolution, brains and ant colonies share that makes them worth copying?", ["They're all very fast", "They solve hard problems well with no central designer in charge", "They always find the perfect answer", "They only work on biological problems"], 1,
      "No one designs a gecko's foot or directs an ant colony, yet both produce clever solutions. That's the property we want to borrow."),
    M("A courier firm needs a <i>good</i> plan for 300 stops within 10 minutes every morning. Why is a nature-inspired method appealing?", ["It guarantees the shortest route", "It gives good solutions in reasonable time on problems too big to solve exactly", "It needs no information about the stops", "It's the only method that uses a computer"], 1,
      "Good-enough-quickly is the selling point. There's no optimality guarantee, and it still needs a way to score a plan."),
    TF("Nature-inspired methods guarantee the optimal answer, because nature has had millions of years to perfect them.", false,
      "They're heuristics: often excellent, never guaranteed. Evolution itself doesn't produce perfect designs, just ones that work well enough."),
    { type: "match", q: "Which natural system would you borrow from for each job?", pairs: [["Learn to spot fraud from thousands of past examples", "Brains (neural networks)"], ["Evolve the frame shape of a racing drone", "Evolution (EAs)"], ["Many cheap robots sweeping a field using only local rules", "Collective behaviour (swarms)"]],
      why: "Learning from examples: neural networks. Breeding better designs: evolution. Simple agents with local rules: swarms." },
  ]);
  B.add("l1-monkey", [
    M("Roughly how many equally likely strings of 11 characters can a 27-key monkey type?", ["about 300", "about a million", "about 10¹⁵", "about 10⁴⁰"], 2,
      "27¹¹ ≈ 5.6 × 10¹⁵. Each extra character multiplies the count by 27.", { hint: "27² ≈ 700, 27⁴ ≈ half a million…" }),
    M("Why does keep-if-better reach the target in thousands of steps when random typing would need about 10¹⁵ tries?", ["It types faster", "Each correct letter is kept, so progress adds up instead of starting from scratch every time", "It knows the target sentence", "It changes every letter at once"], 1,
      "Keeping improvements turns one impossible search into many tiny ones solved one after another."),
    M("When does keep-if-better stop working well?", ["When the target is short", "When improving one part makes other parts worse, so every small step looks bad", "When the alphabet is small", "Never"], 1,
      "Letters in the monkey problem are independent. Real problems interact, so a single improver gets stuck where all small changes look worse."),
    { type: "order", q: "Put keep-if-better in order.", items: ["Start with a random guess", "Copy it and change one character", "Score the copy", "Keep the copy if it's no worse", "Repeat"],
      why: "Guess, tweak, score, keep-if-no-worse, repeat. That's selection plus variation with a population of one." },
    TF("Because a monkey typing forever would eventually produce Hamlet, random search is a practical strategy.", false,
      "\"Eventually\" can mean far longer than the age of the universe. Possible and feasible are different things."),
  ]);
  B.add("l1-ingredients", [
    { type: "cat", q: "Each broken design is missing one ingredient. Which one?", buckets: ["A population", "Biased selection", "Variation"],
      items: [["One candidate, mutate it, keep it if better", 0], ["Many candidates, but parents are chosen completely at random", 1], ["Many candidates, fitter parents chosen, but children are exact copies", 2]],
      why: "A single candidate is a hillclimber, not an EA. Unbiased selection gives drift. Without variation nothing new is ever tried." },
    M("Why does an EA need randomness at all?", ["To make runs unrepeatable", "To create new variants to try; without it the search can't explore", "Because computers are random", "To pick the answer at the end"], 1,
      "Mutation and randomised selection are how new candidates appear and how weaker ones still get a chance."),
    M("What does recombination (crossover) add that mutation alone doesn't?", ["Nothing", "It can join good parts found separately by different individuals", "It guarantees improvement", "It removes the need for selection"], 1,
      "Two parents that each solved half the problem can produce a child that has both halves."),
    M("Parents are chosen with <i>zero</i> bias towards fitness. What does the population do over time?", ["Converges fast to the best", "Drifts randomly without steady improvement", "Stops changing", "Always finds the optimum eventually"], 1,
      "With no pull towards fitter solutions, good and bad genes are equally likely to spread."),
    TF("Recombination is optional in the lecture's recipe, but often helpful.", true, "Population, biased selection and variation are required; recombination is the optional third ingredient."),
  ]);
  B.add("l1-apps", [
    { type: "cat", q: "Which application category fits each job?", buckets: ["Planning", "Design", "Simulation", "Identification", "Control", "Classification"],
      items: [["Schedule trains on a single-track line", 0], ["Choose the profile of an aircraft wing", 1], ["Model how shoppers move through a new mall", 2], ["Fit a model predicting energy demand from the weather", 3], ["Open and close greenhouse vents to hold 22 °C", 4], ["Flag suspicious card payments", 5]],
      why: "Arranging resources: planning. Choosing a structure: design. Agents interacting: simulation. Model matching data: identification. Acting on a live system: control. Assigning labels: classification." },
    M("What's the one thing you must be able to do before an EA can attack your problem?", ["Know the optimal answer", "Score any candidate solution", "Write the solution by hand", "Have a supercomputer"], 1,
      "The fitness function is the only problem-specific ingredient. Everything else is generic."),
    M("Evolved antennas often look strange to engineers. Why?", ["The EA had a bug", "The EA isn't limited by human intuition; only the fitness score matters", "Antennas have to look strange", "They were drawn by hand afterwards"], 1,
      "Selection rewards whatever works, so designs can land where no human would have looked."),
    M("In an EA designing car bodies, what plays the role of \"nature\" doing the judging?", ["The crossover operator", "The airflow simulation that scores each design", "The random number generator", "The population size"], 1,
      "The simulator is the environment: it decides which designs are fit enough to breed."),
    TF("To use an EA you need to know how to build the best solution step by step.", false, "You only need to recognise better from worse. Knowing how to construct the answer is what EAs let you skip."),
  ]);

  /* ---------- Lecture 2 ---------- */
  B.add("l2-generic", [
    { type: "order", q: "Put the generic EA in order.", items: ["Create an initial population", "Evaluate everyone's fitness", "Select parents", "Vary them into children", "Update the population", "Stop if the budget is spent, otherwise loop"],
      why: "Initialise and evaluate once, then loop select → vary → update until you run out of time or evaluations." },
    { type: "match", q: "Each design question belongs to one stage. Match them.", pairs: [["Who gets to reproduce?", "Selection"], ["How different are children from their parents?", "Variation"], ["Who survives into the next round?", "Population update"]],
      why: "The generic EA is three plug-in decisions, one per stage." },
    M("Which is a sensible stopping rule?", ["Stop after the first improvement", "Stop after a fixed budget of evaluations, or when the best hasn't improved for many generations", "Stop when the population is empty", "Never stop"], 1,
      "EAs have no \"done\" signal, so you stop on a budget or on stagnation."),
    M("You switch from maximising a score to minimising a cost. What changes in the EA?", ["Everything must be redesigned", "Only the comparisons: \"better\" now means lower", "You need a new encoding", "EAs can only maximise"], 1,
      "Select and keep the lower-cost solutions instead. The loop itself is unchanged."),
    M("Selection is almost random. What's the likely outcome?", ["Bad results quickly", "Good results eventually, but very slowly", "Instant convergence", "It crashes"], 1,
      "Weak pressure keeps diversity but gives little direction, so progress is slow."),
  ]);
  B.add("l2-optim", [
    M("Items weigh 15, 40 and 50 kg. Which subset gets closest to <b>58 kg</b>?", ["50 alone (8 away)", "15 + 40 = 55 (3 away)", "15 + 50 = 65 (7 away)", "40 alone (18 away)"], 1,
      "All 8 subsets: 0, 15, 40, 50, 55, 65, 90, 105. The closest to 58 is 55, so f = 3."),
    M("How many subsets does a set of 10 items have?", ["20", "100", "1,024", "3,628,800"], 2, "Each item is in or out: 2¹⁰ = 1,024. (3,628,800 is 10!, the number of orderings.)"),
    M("When is exhaustive search the right tool?", ["Always, since it's exact", "When the search space is small enough to check within your time budget", "Never", "Only for maximisation"], 1,
      "It's guaranteed optimal, so use it whenever you can afford it."),
    { type: "cat", q: "Maximise or minimise?", buckets: ["Maximise", "Minimise"],
      items: [["Clashes in an exam timetable", 1], ["Distance a walking robot covers before falling", 0], ["Cost of a pipe network", 1], ["Profit of a product mix", 0], ["Length of a delivery route", 1]],
      why: "Bad things (clashes, cost, length) are minimised; good things (distance covered, profit) are maximised." },
    M("Which search space is infinite?", ["All orderings of 20 cities", "All subsets of 50 items", "All real values for a machine's temperature setting", "All 8-bit strings"], 2,
      "Real numbers are uncountably many, so enumeration is impossible even in principle."),
  ]);
  B.add("l2-complexity", [
    { type: "order", q: "At n = 100, order from fewest steps to most.", items: ["n log₂ n", "n²", "n³", "2ⁿ", "n!"],
      why: "About 700, 10⁴, 10⁶, 10³⁰ and 10¹⁵⁸. Exponentials and factorials dwarf any polynomial." },
    M("Input grows from 20 to 40. An n² algorithm takes 4× longer. How much longer does a 2ⁿ algorithm take?", ["4×", "20×", "about a million times", "2×"], 2,
      "2⁴⁰ / 2²⁰ = 2²⁰ ≈ 1,000,000."),
    { type: "cat", q: "Is a fast exact algorithm known?", buckets: ["Easy", "Hard"],
      items: [["Find the largest value in a list", 0], ["Pack items into the fewest bins", 1], ["Shortest route on a road map", 0], ["Colour a map with 3 colours so neighbours differ", 1], ["Sort files by date", 0]],
      why: "Max, shortest path and sorting are polynomial. Bin packing and 3-colouring have no known fast exact method." },
    M("What does calling a problem \"hard\" mean here?", ["It has been proven impossible to solve quickly", "No polynomial-time exact algorithm is known", "It has large inputs", "It needs a lot of memory"], 1,
      "Hard = none known, not proven impossible. That's the honest version of the claim."),
    M("You buy a computer 1,000× faster. For a 2ⁿ brute force, how much bigger an n can you now handle in the same time?", ["1,000× bigger", "about 10 more", "twice as big", "about 100 more"], 1,
      "2¹⁰ ≈ 1,000, so a thousand-fold speed-up buys only about 10 extra items."),
  ]);
  B.add("l2-mst", [
    M("A spanning tree joins 8 towns. How many links does it use?", ["7", "8", "28", "16"], 0, "Every spanning tree on n nodes has n − 1 edges."),
    M("Prim from P on edges P–Q 3, Q–R 1, P–R 2, R–S 5, Q–S 4. What's the tree's total cost?", ["6", "7", "8", "10"], 1,
      "Take P–R (2), then R–Q (1), then Q–S (4): total 7. P–Q (3) would close a loop.", { fig: Qf.graph({ P: [60, 110], Q: [220, 40], R: [220, 190], S: [390, 110] }, [["P", "Q", 3], ["Q", "R", 1], ["P", "R", 2], ["R", "S", 5], ["Q", "S", 4]], { w: 450, h: 230 }) }),
    M("Why does a spanning tree never contain a cycle?", ["Cycles are illegal in graphs", "A cycle means one of its links is redundant: removing it keeps everything connected and saves money", "Prim can't draw cycles", "Cycles make it slower"], 1,
      "Any edge on a cycle can go without disconnecting anything."),
    M("Add \"no town may have more than 2 cables\". What happens to the problem?", ["Still easy: run Prim", "It becomes hard: greedy choices can make the constraint impossible to meet later", "It becomes trivial", "It has no solutions"], 1,
      "With degree ≤ 2 the tree becomes a path through every town, which is closely related to the travelling salesperson problem."),
    TF("Prim's algorithm is a heuristic that usually finds a good tree.", false, "Prim is exact: it always returns a minimum spanning tree, in polynomial time."),
  ]);
  B.add("l2-approx", [
    M("Exhaustive search over 2⁶⁰ options at a billion per second takes roughly…", ["a few seconds", "a few days", "about 36 years", "longer than the age of the universe"], 2,
      "2⁶⁰ ≈ 1.15 × 10¹⁸, so about 1.15 × 10⁹ seconds, which is roughly 36 years.", { hint: "2¹⁰ ≈ 10³, so 2⁶⁰ ≈ 10¹⁸. A year is about 3 × 10⁷ seconds." }),
    { type: "cat", q: "Exact or approximate?", buckets: ["Exact", "Approximate"],
      items: [["Dijkstra's shortest path", 0], ["An EA for a timetable", 1], ["Checking every subset", 0], ["Nearest-neighbour tour building", 1], ["Prim's algorithm", 0]],
      why: "Exact methods guarantee the optimum. EAs and greedy tour heuristics give good answers without that guarantee." },
    M("How does an EA's best solution usually improve over a long run?", ["Linearly forever", "Quickly at first, then more and more slowly", "Only at the very end", "Not at all"], 1,
      "Diminishing returns: running twice as long rarely gives twice the improvement."),
    TF("An approximate algorithm never returns the optimal solution.", false, "It often does. It just can't guarantee or prove it."),
    M("Which situation calls for an approximate method?", ["Sorting 1,000 numbers", "Routing 200 vans by 6 a.m. tomorrow", "Finding the shortest path in a road map", "Adding two numbers"], 1,
      "Vehicle routing is hard and time-boxed. The others have fast exact algorithms."),
  ]);

  /* ---------- Lecture 3 ---------- */
  B.add("l3-recipe", [
    { type: "order", q: "Order one step of a steady-state EA.", items: ["Select parents", "Recombine them", "Mutate the child", "Evaluate the child", "Decide whether it replaces someone"],
      why: "Select → recombine → mutate → evaluate → replace." },
    { type: "match", q: "Match each word to its meaning.", pairs: [["Chromosome", "One encoded candidate solution"], ["Gene", "One position in that encoding"], ["Fitness", "The score of a candidate"], ["Population", "The set of candidates kept at once"]],
      why: "Standard EA vocabulary borrowed from biology." },
    { type: "cat", q: "Which box of the recipe does each choice belong to?", buckets: ["Selection", "Crossover", "Mutation", "Replacement"],
      items: [["Tournament", 0], ["Uniform", 1], ["Swap two genes", 2], ["Replace weakest", 3], ["Roulette wheel", 0]],
      why: "Every EA variant is a set of choices, one per box." },
    M("You change \"replace weakest\" to \"replace a random member\". What's the risk?", ["None", "The best solution can be thrown away", "The EA stops producing children", "Fitness can no longer be computed"], 1,
      "A random victim could be the current best, so the method is no longer elitist."),
    M("Which stages never look at fitness values?", ["Selection and replacement", "Crossover and mutation", "All of them", "Evaluation"], 1,
      "Variation operators are blind: they just make new candidates. Fitness drives the decisions around them."),
  ]);
  B.add("l3-tsp", [
    M("How many distinct round trips are there for 6 cities?", ["60", "120", "720", "30"], 0, "(k − 1)! / 2 = 5! / 2 = 60."),
    M("Which string describes the same round trip as <code>ACBED</code>?", ["<code>DEBCA</code>", "<code>ACEBD</code>", "<code>CABED</code>", "<code>ABCDE</code>"], 0,
      "DEBCA is ACBED written backwards. Direction and starting city don't change the loop."),
    M("Using the distance matrix, how long is the tour <code>ADCBE</code>?", ["28", "31", "34", "38"], 2,
      "A–D 4 + D–C 2 + C–B 3 + B–E 10 + E–A 15 = 34.", { fig: N.matrixHTML ? `<div style="max-width:340px">${N.matrixHTML()}</div>` : "" }),
    M("Why not just check every tour for 20 cities?", ["There are only 20", "There are about 6 × 10¹⁶ of them", "Tours can't be compared", "It's forbidden"], 1, "19!/2 ≈ 6 × 10¹⁶: far too many to enumerate."),
    TF("A TSP tour must end back at the city it started from.", true, "It's a round trip: the last leg returns home."),
  ]);
  B.add("l3-hc", [
    { type: "order", q: "Put hillclimbing in order.", items: ["Make a random solution and score it", "Copy and mutate it", "Score the mutant", "Keep the mutant if it's no worse", "Stop, or repeat from the copy step"],
      why: "Random start, then mutate → compare → keep-if-no-worse, until you stop." },
    M("Why accept a mutant that's <i>equally</i> good, not only strictly better?", ["It's faster to compute", "It lets the climber drift across flat plateaus instead of freezing on them", "It avoids mutation", "It makes it a population method"], 1,
      "On a plateau every neighbour is equal, so strict improvement would stop dead."),
    M("Current tour <code>ADCBE</code> (34). Swapping the last two cities gives <code>ADCEB</code>. What does HC do?", ["Rejects it: 36", "Accepts it: 28", "Accepts it: 34", "Rejects it: 38"], 1,
      "A–D 4 + D–C 2 + C–E 7 + E–B 10 + B–A 5 = 28, shorter than 34, so it's kept.", { fig: N.matrixHTML ? `<div style="max-width:340px">${N.matrixHTML()}</div>` : "" }),
    M("Why run hillclimbing several times from different random starts?", ["To use more memory", "Different starts reach different local optima; keep the best", "It changes the landscape", "It makes each run faster"], 1, "Random restarts are the cheapest escape from local optima."),
    TF("On a landscape with a single smooth peak, hillclimbing reaches the global optimum.", true, "With one peak, every uphill path leads to it."),
  ]);
  B.add("l3-landscape", [
    { type: "match", q: "Match each landscape to its description.", pairs: [["Unimodal", "One peak"], ["Multimodal", "Many peaks"], ["Plateau", "Large flat regions"], ["Deceptive", "Local slopes lead away from the best"]],
      why: "These shapes decide how well local search will work." },
    { type: "pick", q: "<b>Click every local optimum that is NOT the global optimum.</b>", fig: Qf.curve(land, [[0.2, "A"], [0.45, "B"], [0.62, "C"], [0.8, "D"]], { label: "solutions →  (higher = fitter)" }), a: ["A", "B"],
      why: "A and B are peaks (every small step goes down) but D is higher. C is a valley, not an optimum." },
    M("On a landscape where each solution's fitness is a random number, how does hillclimbing compare to random sampling?", ["Much better", "About the same: neighbours tell you nothing", "Much worse", "It can't run"], 1,
      "Hillclimbing relies on neighbours being similar. Without that, it's guessing."),
    M("\"Locally smooth, globally rugged\" means…", ["Neighbours have similar fitness, but there are many peaks overall", "Every point has the same fitness", "There is exactly one peak", "Fitness is random everywhere"], 0,
      "Small steps work locally, but the big picture has many traps."),
    M("Why are huge random jumps usually a poor mutation on realistic problems?", ["They're slow", "Most of the space is poor, so a big jump almost always lands somewhere bad", "They break the encoding", "They always improve fitness"], 1,
      "Good regions are tiny. Small steps stay near what already works."),
  ]);
  B.add("l3-neighbourhood", [
    M("Bit-flip mutation on a 12-bit string. How many neighbours does each solution have?", ["2", "12", "24", "4,096"], 1, "One per bit you could flip."),
    M("Adjacent-swap mutation (ends count as adjacent) on a 7-city tour. How many neighbours?", ["6", "7", "21", "14"], 1, "There are 7 adjacent pairs around a loop of 7."),
    { type: "multi", q: "Which strings are single-bit-flip neighbours of <code>0110</code>? Select all.", o: ["<code>1110</code>", "<code>0010</code>", "<code>1001</code>", "<code>0100</code>", "<code>0111</code>", "<code>0110</code>"], a: [0, 1, 3, 4],
      why: "Flip each bit once: 1110, 0010, 0100, 0111. 1001 differs in every bit; 0110 is the string itself." },
    M("You switch to a different mutation operator. What happens to the set of local optima?", ["Nothing", "It can change, because the operator defines who counts as a neighbour", "It always disappears", "It doubles"], 1,
      "A local optimum is only \"no better neighbour\", and neighbours depend on the operator."),
    M("Taken to the extreme, \"every solution is my neighbour\" turns local search into…", ["Hillclimbing", "Random search", "Exhaustive search", "Tabu search"], 1, "Each step picks from the whole space, so there's nothing local left."),
  ]);
  B.add("l3-local", [
    M("Monte Carlo search (p = 0.1) finishes. What should it return?", ["The current solution", "The best solution seen during the run", "The last rejected mutant", "A random solution"], 1,
      "Because it accepts worse moves, the current solution may have got worse. Keep a best-so-far."),
    M("Tabu search, minimising. You're at cost 10. Neighbours cost 12, 9 (tabu) and 11. Where does it move?", ["9", "11", "12", "Stays at 10"], 1,
      "It always moves to the best non-tabu neighbour, even if that's worse: 11."),
    M("What goes wrong if the tabu list is far too short?", ["Nothing", "The search can cycle back and forth between the same few solutions", "It stops moving", "It becomes exhaustive"], 1, "The list exists to block the way back; too short and the loop returns."),
    { type: "cat", q: "Which method behaves like this?", buckets: ["Hillclimbing", "Monte Carlo", "Tabu search"],
      items: [["Takes a worse move with a small probability", 1], ["Refuses to revisit recent solutions", 2], ["Only ever accepts no-worse moves", 0], ["Always moves, even downhill", 2]],
      why: "HC never goes down. Monte Carlo sometimes goes down at random. Tabu always moves, and bans recent spots." },
    TF("Tabu search can move to a worse neighbour even when a better non-tabu neighbour exists.", false, "It takes the best non-tabu neighbour. It only goes downhill when that best one is worse than where it is."),
  ]);
  B.add("l3-population", [
    M("Why keep some low-fitness solutions in the population?", ["They make the average look better", "They may sit near other, higher peaks and keep diversity alive", "They're cheaper to evaluate", "They're required by crossover"], 1,
      "A poor solution today could be at the foot of the tallest mountain."),
    M("The population has \"converged\". What does that mean?", ["It found the global optimum", "Most members have become very similar", "It ran out of memory", "Mutation is off"], 1, "Convergence is loss of diversity. It can mean progress, or premature stagnation."),
    { type: "multi", q: "What does a population-based method need or allow that single-solution local search doesn't? Select all.", o: ["A way to choose which members to vary (selection)", "Recombining two or more parents", "A fitness function", "Mutation"], a: [0, 1],
      why: "Both need fitness and mutation. Only a population needs selection and can recombine." },
    M("The diversity measure drops to zero after a few generations. What's the danger?", ["None", "Only mutation can create anything new, so the search may stall early", "Fitness becomes negative", "The population grows"], 1, "Everyone is a copy, so crossover produces copies too."),
    TF("A population of size 1 with no crossover is essentially hillclimbing.", true, "One solution, mutate, keep if no worse: that's the hillclimber."),
  ]);

  /* ---------- Lecture 4 ---------- */
  B.add("l4-types", [
    M("Generational GA, population 50, elitism keeps the best 2. How many new children are needed each generation?", ["50", "48", "2", "52"], 1, "Two slots are filled by the unchanged elites, so 48 are children."),
    { type: "cat", q: "Generational or steady-state?", buckets: ["Generational", "Steady-state"],
      items: [["The whole population is replaced at once", 0], ["A good child can be picked as a parent in the very next step", 1], ["Needs elitism to be sure the best survives", 0], ["One or two children per iteration", 1]],
      why: "Generational swaps everything at once. Steady-state trickles children in, so good ones are used immediately." },
    M("When is a generational GA especially convenient?", ["When evaluation is instant", "When you can evaluate many children in parallel at once", "When the population is size 1", "Never"], 1, "A whole generation is a batch of independent evaluations: ideal for parallel hardware."),
    M("Elitism keeps the best half of the population every generation. Likely effect?", ["More exploration", "Very greedy: diversity drains and search may stall", "No effect", "Fitness drops"], 1, "Heavy elitism is strong selection pressure."),
    TF("Elitism copies the best individuals into the next generation unchanged.", true, "That's exactly what guarantees the best is never lost."),
  ]);
  B.add("l4-replacement", [
    M("Population 0.4, 0.7, 0.2, 0.5 (maximising). A child scores 0.45. Which slot does <b>replace first weaker</b> (scanning from slot 1) overwrite?", ["Slot 1 (0.4)", "Slot 3 (0.2)", "Slot 4 (0.5)", "None"], 0,
      "Slot 1 (0.4) is already weaker than 0.45, so the scan stops there."),
    M("Same population and child. Which slot does <b>replace weakest</b> overwrite?", ["Slot 1 (0.4)", "Slot 3 (0.2)", "Slot 2 (0.7)", "None"], 1, "The weakest member is 0.2 in slot 3."),
    M("Which replacement strategy is cheaper to run?", ["Replace weakest", "Replace first weaker", "They cost the same", "Neither needs any comparisons"], 1, "First weaker can stop scanning early; weakest must check everyone."),
    M("A child scores lower than every member. What happens under both strategies?", ["It replaces the weakest anyway", "It's discarded", "It replaces the best", "It replaces a random member"], 1, "Both only replace a member the child beats."),
    { type: "cat", q: "Which strategy is described?", buckets: ["Replace weakest", "Replace first weaker"],
      items: [["Greedier, with higher selection pressure", 0], ["Keeps more diversity", 1], ["The best member always survives", 0], ["Weak members can survive longer", 1]],
      why: "Weakest always removes the bottom; first weaker might remove a middling member and spare the worst." },
  ]);
  B.add("l4-pressure", [
    { type: "cat", q: "Too little or too much selection pressure?", buckets: ["Too little", "Too much"],
      items: [["Diversity vanishes within a few generations", 1], ["Fitness wanders with no clear upward trend", 0], ["The population fills with copies of one early individual", 1], ["Good solutions appear, then get lost again", 0]],
      why: "Too much: premature convergence. Too little: drift, with good solutions not reliably kept." },
    M("In tournament selection, which change raises the selection pressure?", ["Smaller tournaments", "Larger tournaments", "Larger population", "Higher mutation"], 1, "Bigger tournaments almost always contain a top individual."),
    M("Selection only (no mutation, no crossover), run for a long time. What happens?", ["Endless variety", "One individual's copies eventually take over the whole population", "Fitness keeps rising forever", "The population dies out"], 1,
      "Selection only copies existing individuals, so it narrows until one takes over."),
    M("In rank selection with probability ∝ rank<sup>b</sup>, raising b…", ["lowers pressure", "raises pressure", "has no effect", "reverses the ranking"], 1, "A bigger exponent gives the top ranks an even larger share."),
    TF("Some selection pressure is necessary; the goal is a moderate, tunable amount.", true, "No pressure = no progress; too much = premature convergence."),
  ]);
  B.add("l4-roulette", [
    M("Roulette wheel, fitnesses 2, 3, 5 and 10. Probability of picking the fitness-10 individual?", ["0.10", "0.25", "0.5", "0.75"], 2, "10 / (2 + 3 + 5 + 10) = 10/20 = 0.5."),
    M("Same wheel, 20 spins. About how many times do you expect the fitness-3 individual to be picked?", ["1", "3", "5", "10"], 1, "Its share is 3/20, so 20 × 3/20 = 3."),
    M("One individual owns 95% of the wheel. What happens next?", ["Nothing special", "Its copies take over the population almost immediately", "It's never picked", "The wheel resizes"], 1, "The superfit problem: roulette hands it nearly every parent slot."),
    M("You're minimising tour length but feed raw lengths into roulette. What goes wrong, and one fix?", ["Nothing", "Long tours get the biggest slices; use 1/length or rank selection", "Short tours are favoured too strongly; add 100", "It only works with integers"], 1, "Roulette rewards big numbers, so it favours the worst tours unless transformed."),
    TF("Roulette selection can use negative fitness values directly.", false, "A slice can't have negative size, so fitness must be shifted or transformed first."),
  ]);
  B.add("l4-rank", [
    M("Linear rank selection, population of 4. Probability that the <b>worst</b> is picked?", ["0", "0.1", "0.25", "0.4"], 1, "Ranks 1+2+3+4 = 10, so the worst gets 1/10."),
    M("Fitnesses 1000, 2, 1, 0.5, 0.1 with linear rank selection. Probability of the best?", ["about 0.99", "1/3", "1/5", "1/2"], 1, "Ranks 5,4,3,2,1 sum to 15, so 5/15. The 1000 no longer matters."),
    M("Minimising cost with rank selection: who gets the top rank?", ["The highest cost", "The lowest cost", "A random member", "The newest child"], 1, "Rank from best to worst, so the cheapest gets the biggest share."),
    M("A downside of rank selection?", ["It can't handle negative fitness", "It ignores how much better one individual is, and needs sorting", "It's identical to roulette", "It has no pressure"], 1, "Only order matters, so a huge lead counts the same as a tiny one."),
    TF("Adding 100 to every fitness leaves rank selection's probabilities unchanged.", true, "The order doesn't change, so neither do the ranks."),
  ]);
  B.add("l4-tournament", [
    M("Tournament size 2, with replacement, population of 2. Probability the better one wins?", ["1/2", "3/4", "1", "1/4"], 1, "It loses only if the worse one is drawn twice: 1 − (1/2)² = 3/4."),
    M("Tournament size 2 with replacement, population 4. Can the worst ever win?", ["Never", "Yes, if it's drawn twice: 1/16 of the time", "Yes, half the time", "Only with mutation"], 1, "(1/4)² = 1/16."),
    M("Tournament size equal to the population, without replacement. What happens?", ["Random selection", "The best always wins: maximum pressure", "The worst always wins", "No one wins"], 1, "Everyone is in every tournament."),
    M("Tournament size 4 with replacement, population 10. Probability the best wins?", ["about 0.1", "about 0.34", "about 0.66", "0.4"], 1, "1 − 0.9⁴ ≈ 1 − 0.66 = 0.34.", { hint: "0.9² = 0.81, and 0.81² ≈ 0.66." }),
    M("Why is tournament selection cheap?", ["It needs sorting", "It only compares a few individuals: no sorting or totals needed", "It skips evaluation", "It uses a lookup table"], 1, "Pick t, keep the best. That's it."),
  ]);
  B.add("l4-mutation", [
    { type: "match", q: "Match each encoding with a mutation that suits it.", pairs: [["Binary string", "Flip a bit"], ["Permutation of cities", "Swap two positions"], ["Vector of real numbers", "Add small Gaussian noise"], ["k-ary string (digits 0–9)", "Reset one gene to a random digit"]],
      why: "Each operator keeps the solution valid for its encoding." },
    M("Mutation rate 1/L on a 100-bit string. About how many bits flip per child?", ["0", "1", "10", "50"], 1, "100 × 1/100 = 1 on average."),
    M("Gaussian mutation with an enormous standard deviation behaves like…", ["Hillclimbing", "Random search: it loses the benefit of small, local changes", "No mutation", "Crossover"], 1, "Huge steps throw away locality, so exploitation is lost."),
    M("\"Every solution must be reachable in principle\" is the requirement for…", ["Exploitation", "Exploration", "Elitism", "Evaluation"], 1, "Without it, parts of the space can never be searched."),
    TF("Reversing a segment (inversion) is a valid mutation for permutations.", true, "It reorders cities without duplicating or dropping any."),
  ]);
  B.add("l4-crossover", [
    M("1-point crossover with the cut after gene 5. P1 = ABCDEFGH, P2 = abcdefgh. First child?", ["ABCDEfgh", "abcdeFGH", "ABCDEFGH", "AbCdEfGh"], 0, "Head of P1 (ABCDE) + tail of P2 (fgh)."),
    M("Uniform crossover, P1 = 1111, P2 = 0000, mask 0110 (1 = take from P2). Child?", ["1001", "0110", "1111", "0101"], 0, "Genes 2 and 3 come from P2 (0), the rest from P1 (1): 1001."),
    M("Crossing two identical parents gives…", ["A random child", "A child identical to them", "A child with mutations", "Two different children"], 1, "Crossover only rearranges what the parents have; it can't create new values."),
    M("Why do permutations need special crossovers (like order crossover)?", ["For speed", "Plain cut-and-splice can duplicate some cities and drop others", "Permutations can't be crossed at all", "To add mutation"], 1, "Every city must appear exactly once."),
    { type: "cat", q: "Crossover or mutation?", buckets: ["Crossover", "Mutation"],
      items: [["Combines genes from two parents", 0], ["Changes one parent slightly", 1], ["Can introduce a value no parent had", 1], ["Needs at least two parents", 0]],
      why: "Crossover mixes existing material; mutation invents new material." },
  ]);
  B.add("l4-lab", [
    M("Target is a 144-pixel picture. A candidate gets 36 pixels wrong. Its fitness?", ["0.25", "0.5", "0.75", "0.36"], 2, "108 of 144 match: 108/144 = 0.75."),
    M("What fitness do you expect from a completely random picture?", ["0", "about 0.5", "about 0.9", "1"], 1, "Each pixel matches with probability 1/2."),
    M("You set mutation so high that half the pixels flip in every child. What happens?", ["Fast convergence", "Children are close to random, so fitness hovers around 0.5", "Diversity falls to zero", "Nothing changes"], 1, "Too much mutation destroys what selection built."),
    M("Best is rising, mean is well below it, diversity stays high. What does this suggest?", ["Premature convergence", "Healthy search: still exploring while improving", "A bug", "Too much pressure"], 1, "A gap between best and mean plus diversity means the search hasn't collapsed."),
    M("You grow the population from 10 to 100. Per generation, the evaluation cost…", ["stays the same", "goes up about 10×", "halves", "goes up 100×"], 1, "Ten times as many individuals to score."),
  ]);
})();

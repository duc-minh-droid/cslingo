/* Nature-Inspired revision bank, part 2 (revision mode only). New angles per session; no calculator needed. Numbers verified with node. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  const mx = () => (NIC.matrixHTML ? `<div style="max-width:340px">${NIC.matrixHTML()}</div>` : "");

  B.add("l1-what", [
    M("Which is the best one-line description of nature-inspired computation?", ["Computers built out of living biological parts such as neurons", "Algorithms borrowing problem-solving ideas from nature", "Simulations of animals for films and games", "Any algorithm that involves randomness"], 1, "It's about borrowing the <i>strategy</i> (evolution, learning, swarming), not biology itself."),
    TF("Neural networks are an example of nature-inspired computation.", true, "They're loosely modelled on how brains learn by adjusting connections."),
    M("Ants find short paths without a leader. How do they coordinate?", ["A queen sends out orders to every worker in the colony", "Indirectly, via pheromone trails that others reinforce", "Each ant memorises a map of the area", "They don't really coordinate: it's luck"], 1, "Communication through the environment (stigmergy): short trails get reinforced faster."),
    M("One ant is simple, yet the colony solves hard problems. What's this called?", ["Emergence", "Evolution", "Exhaustive search", "Recursion"], 0, "No individual understands the whole problem; the solution emerges from interactions."),
    { type: "cat", q: "Which natural system is being described?", buckets: ["Evolution", "Brains", "Collective behaviour"],
      items: [["Fitter variants leave more offspring over generations", 0], ["Connections strengthen when they're useful", 1], ["Birds keep formation by watching their neighbours", 2], ["Random variation plus selection", 0]],
      why: "Selection over generations, learning connections, local rules in a group." },
    M("Why not always use classical exact algorithms?", ["Exact algorithms are too old to trust on modern computers", "Many real problems are too big for known exact methods", "Exact algorithms need special hardware", "Exact algorithms can't handle numbers"], 1, "Nature-inspired methods fill the gap where exact methods are too slow."),
    TF("A nature-inspired method needs gradients or a formula for the problem's structure.", false, "It only needs to evaluate candidate solutions, which is why it copes with messy black-box problems."),
    M("Remove one ant and the colony keeps working. Which property is that?", ["Robustness", "Optimality", "Determinism", "Speed"], 0, "Decentralised systems degrade gracefully, which is another reason to copy them."),
  ]);
  B.add("l1-monkey", [
    M("Random typing of a 28-character sentence on 27 keys has roughly how many possible strings?", ["about 750", "about 10¹⁰", "about 10⁴⁰", "about 10¹⁰⁰"], 2, "27²⁸ ≈ 10⁴⁰, far beyond any computer.", { hint: "27 is a bit under 30, and 30²⁸ ≈ 10⁴¹." }),
    M("Keep-if-better gets slower near the end of the monkey problem. Why?", ["The computer overheats", "Few letters are still wrong", "The target changes", "Fitness stops working"], 1, "The chance of a useful change falls as fewer positions remain to fix."),
    TF("On the monkey problem, keep-if-better will reach the target eventually.", true, "Letters are independent and each fix is kept, so there are no traps to get stuck in."),
    M("In the monkey problem, what is the fitness of a string?", ["The total length of the string", "How many positions match the target", "How long it took to type the string", "How many vowels the string contains"], 1, "More matching letters means fitter."),
    { type: "cat", q: "Random typing or keep-if-better?", buckets: ["Random typing", "Keep-if-better"],
      items: [["Throws away every attempt and starts again", 0], ["Builds on the best string found so far", 1], ["Expected effort grows by ×27 per extra letter", 0], ["Finishes a sentence in thousands of steps", 1]],
      why: "Keeping improvements is the difference between hopeless and practical." },
    M("The target sentence changed randomly at every step. What would happen to keep-if-better?", ["It would still finish quickly", "Progress couldn't accumulate", "It would get faster", "Nothing"], 1, "Selection needs a stable fitness to build on."),
    M("What real-world feature makes problems harder than the monkey problem?", ["More letters", "Parts interact", "Computers are slower", "Fitness is easier to compute"], 1, "Interaction between parts creates local traps that a single improver gets stuck in."),
    M("What does the gecko example illustrate?", ["Geckos can climb faster than any animal humans have studied", "Evolution finds solutions humans haven't engineered", "Random search always finds good designs", "Biology is simpler than engineering"], 1, "Evolution acts as a problem solver, so it's worth copying."),
  ]);
  B.add("l1-ingredients", [
    M("Which ingredient keeps many different candidates alive at the same time?", ["Mutation, which keeps changing candidates", "A population", "Crossover, which mixes candidates", "The fitness function, which scores them"], 1, "A population holds several candidates, which keeps options open."),
    M("What is mutation's job?", ["Pick which parents get to breed", "Make small random changes so new variants appear", "Delete the worst solutions each generation", "Score candidates so they can be compared"], 1, "Mutation is the source of new material."),
    M("\"A weak bias towards the fittest\" means…", ["Only the single best candidate in the population breeds", "Fitter ones breed more often, but weaker ones still can", "Every candidate is equally likely to breed, whatever its fitness", "The weakest candidates are favoured"], 1, "Some pull towards quality, without wiping out diversity."),
    TF("An EA with no randomness at all would still explore well.", false, "Without randomness it can't try new variants, so it can't explore."),
    M("Parents ABCD and WXYZ, cut after position 2. The first child of 1-point crossover is…", ["ABYZ", "WXCD", "AXCZ", "ABCD"], 0, "Head of the first parent (AB) plus tail of the second (YZ)."),
    { type: "cat", q: "Which ingredient does each operation belong to?", buckets: ["Population", "Selection", "Mutation", "Recombination"],
      items: [["Keep 50 candidates at once", 0], ["Pick fitter parents more often", 1], ["Flip one bit of a child", 2], ["Splice two parents together", 3]],
      why: "Four roles: hold candidates, favour quality, invent, and mix." },
    M("The lecture's word \"stochastic\" means…", ["Very fast", "Involving randomness", "Exact and repeatable", "Running in parallel"], 1, "Stochastic = random elements are part of the method."),
    M("A population of just 2. What's the main risk?", ["Each generation takes too long to run", "Very little diversity", "It needs too much memory to store", "There's no real risk with two"], 1, "Tiny populations lose variety almost immediately."),
  ]);
  B.add("l1-apps", [
    { type: "cat", q: "Which application category fits each task?", buckets: ["Planning", "Design", "Simulation", "Identification", "Control", "Classification"],
      items: [["Timetable a school's classes", 0], ["Choose the members of a bridge truss", 1], ["Model how a rumour spreads through a town", 2], ["Find a formula that fits past sales figures", 3], ["Evolve a walking robot's controller", 4], ["Sort emails into spam and not spam", 5]],
      why: "Arranging, building, modelling agents, fitting data, acting on a live system, labelling." },
    M("A good fitness function for a school timetable?", ["The number of teachers employed by the school each term", "The number of clashes (lower is better)", "The number of rooms available", "The length of the school day"], 1, "It measures how bad a candidate timetable is."),
    M("A good fitness function for evolving a robot's walking controller?", ["The number of motors and sensors it uses to move around", "The distance walked before falling over", "The colour of the robot's shell", "The size of its battery"], 1, "It rewards the behaviour you actually want."),
    M("Why are EAs popular in engineering design?", ["They're exact, so designs are guaranteed optimal", "They need few assumptions and can use any simulator", "They avoid the need for computers", "They're always the fastest method"], 1, "Anything you can score, you can evolve."),
    TF("EA-produced designs are guaranteed to be optimal.", false, "They're good, sometimes better than human designs, but not provably optimal."),
    M("Each fitness evaluation runs a simulation that takes an hour. What's the practical consequence?", ["Nothing changes about how you run it", "You can afford few evaluations", "You should use a bigger population", "You can skip evaluating the children"], 1, "The evaluation budget drives every other choice."),
    M("How were the ST5 antenna's mission requirements given to the EA?", ["As hard-coded antenna shapes the EA had to copy exactly", "As a fitness function scoring each design", "By an engineer picking favourites each round", "They weren't given; the EA invented them"], 1, "Requirements become the score."),
    M("Which task is a poor fit for an EA?", ["Adding two numbers", "Designing a turbine blade", "Scheduling nurses", "Tuning a controller"], 0, "When a direct exact method is trivial, a heuristic search is pointless."),
  ]);

  B.add("l2-generic", [
    M("How is the initial population usually created?", ["Copied from the best known answer", "Randomly", "Sorted by fitness", "Left empty"], 1, "Random starting points spread the search out."),
    M("What does the evaluation step do?", ["Mutates every individual", "Computes each individual's fitness", "Chooses which parents breed", "Decides when to stop the run"], 1, "Scores are needed before any selection."),
    { type: "cat", q: "Which stage of the generic EA is this?", buckets: ["Selection", "Variation", "Population update"],
      items: [["Tournament of three", 0], ["Swap two genes", 1], ["Replace the worst member", 2], ["One-point crossover", 1]],
      why: "Choose parents, make children, decide who stays." },
    M("In optimisation, s* is…", ["the first solution tried", "a best solution", "any feasible solution", "the average solution"], 1, "Optimisation searches for s* = the argmax (or argmin) of f."),
    TF("Most of the EA loop stays the same across problems; mainly the encoding, operators and fitness change.", true, "That's what makes EAs general-purpose."),
    M("Children are always almost identical to their parents. What's the risk?", ["Too much exploration", "Very little exploration", "It crashes", "Nothing"], 1, "Tiny variation means tiny steps."),
    M("Children are completely unrelated to their parents. What's the EA now?", ["Hillclimbing", "Essentially random search", "Exhaustive search", "Still a well-tuned EA"], 1, "If children don't inherit anything, selection has nothing to build on."),
    { type: "order", q: "Order one iteration of the generic loop.", items: ["Select parents", "Vary them into children", "Update the population"], why: "Select → vary → update, then repeat." },
  ]);
  B.add("l2-optim", [
    M("20 on/off choices. Roughly how many combinations?", ["20", "400", "about a million", "about a billion"], 2, "2²⁰ = 1,048,576."),
    M("Fitness f = |weight − 100|, minimised. What does f = 0 mean?", ["The worst possible subset", "An exact hit of 100 kg", "An empty subset", "An error"], 1, "Zero distance from the target is perfect."),
    M("What's exhaustive search's big guarantee?", ["It's fast", "It always finds the optimum", "It uses little memory", "It needs no fitness function"], 1, "It checks everything, so nothing better can be missed."),
    M("5 switches, each on or off. How many settings?", ["5", "10", "25", "32"], 3, "2⁵ = 32."),
    TF("A fitness function must be differentiable.", false, "EAs only compare scores, so any computable score works."),
    M("A timetable problem has about 10³⁰ candidates. Why not enumerate them?", ["Enumerating timetables is against the rules", "Even at 10⁹ per second it would outlast the universe", "Timetables can't be given a score", "There are only about 10 real candidates"], 1, "10³⁰ / 10⁹ = 10²¹ seconds: about 3 × 10¹³ years."),
    M("The search space S is…", ["the best solution found so far", "the set of all candidate solutions", "the fitness function being optimised", "the current population"], 1, "Search = moving around S looking for good points."),
    { type: "cat", q: "Finite or infinite search space?", buckets: ["Finite", "Infinite"],
      items: [["Orderings of 10 cities", 0], ["The exact angle of a wing, as a real number", 1], ["Subsets of 30 items", 0], ["Real-valued weights of a neural network", 1]],
      why: "Discrete choices give finite spaces; real numbers give infinite ones." },
  ]);
  B.add("l2-complexity", [
    M("\"Polynomial time\" means the running time is bounded by…", ["2ⁿ for the input size n", "nᵏ for some fixed k", "n! for the input size n", "a fixed constant"], 1, "n, n², n³… any fixed power."),
    M("2ⁿ at n = 10, 20 and 30 is roughly…", ["10, 20 and 30", "1 thousand, 1 million and 1 billion", "100, 400 and 900", "about 1 million at every one of the three sizes"], 1, "Each extra 10 multiplies by about 1,000."),
    M("Which grows faster in the long run: n¹⁰ or 1.01ⁿ?", ["n¹⁰", "1.01ⁿ", "They're equal", "Neither grows"], 1, "Any exponential with base above 1 eventually beats any polynomial."),
    TF("Sorting has a polynomial-time algorithm.", true, "Merge sort runs in O(n log n)."),
    M("Which grows faster: n! or 2ⁿ?", ["2ⁿ", "n!", "Same", "Depends on the computer"], 1, "n! multiplies by n each step; 2ⁿ only by 2."),
    { type: "match", q: "Match each method to its growth.", pairs: [["Binary search", "O(log n)"], ["Scanning a list once", "O(n)"], ["Merge sort", "O(n log n)"], ["Trying every tour of n cities", "O(n!)"]], why: "The standard reference points." },
    M("What's the point of the protein-folding example?", ["Proteins are simpler than they look once you model them", "Exhaustive search is hopeless even for real problems", "Biology can always be solved in polynomial time with enough computers", "Computers can't store protein structures"], 1, "Hard problems aren't just puzzles; they're everywhere."),
    M("An n³ algorithm takes 1,000 steps at n = 10. How many at n = 20?", ["2,000", "4,000", "8,000", "1,000,000"], 2, "Doubling n multiplies n³ by 8."),
  ]);
  B.add("l2-mst", [
    M("Three towns joined in a triangle with links of cost 2, 3 and 4. MST cost?", ["5", "6", "7", "9"], 0, "Take the two cheapest links: 2 + 3. The 4 would close a loop."),
    M("Does Prim's starting node change the total cost of the tree it finds?", ["Yes: different starts give different costs", "No: any start gives a minimum spanning tree", "Only when the number of nodes is even", "Only when some weights are tied"], 1, "The route differs, the minimum total doesn't."),
    M("Remove one edge from a spanning tree. What happens?", ["Nothing: the tree stays connected", "It splits into two disconnected parts", "It turns into a cycle", "It gains an extra edge"], 1, "Every tree edge is a bridge."),
    M("Add one extra edge to a spanning tree. What happens?", ["Nothing changes about the tree", "Exactly one cycle is created", "The tree splits into two parts", "It becomes a minimum spanning tree"], 1, "The new edge plus the tree path between its ends forms a loop."),
    TF("The plain MST problem can be solved exactly in polynomial time.", true, "Prim and Kruskal both do it."),
    M("Which is a natural MST application?", ["Sorting a list of names into alphabetical order quickly", "Laying cable to connect sites as cheaply as possible", "Encrypting data before sending it over a network", "Scheduling exams without clashes"], 1, "Connect everything, minimise total length."),
    M("A spanning tree where every town has at most 2 links is…", ["a star centred on one town", "a path through every town", "impossible to build", "always the minimum spanning tree"], 1, "It's a Hamiltonian path, closely related to the TSP."),
    M("Why does greedy work for the plain MST?", ["It works by luck on typical graphs", "Each cheapest safe edge never has to be undone", "It secretly checks every possible tree", "Graphs in practice are small"], 1, "The problem's structure makes local choices globally safe."),
  ]);
  B.add("l2-approx", [
    M("Why use an EA for the New York Tunnels problem?", ["The network is small enough to enumerate in an afternoon", "About 10²⁵ designs: far too many to check", "It has no fitness function, so exact methods can't score it", "Exact methods are not allowed for it"], 1, "16²¹ designs rules out enumeration."),
    M("Approximate algorithms give up ___ in exchange for speed.", ["correctness of the input data", "a guarantee of optimality", "the need for a fitness function", "all of their randomness"], 1, "Good answers fast, no proof they're the best."),
    { type: "cat", q: "Does the method guarantee the optimum?", buckets: ["Guaranteed", "No guarantee"],
      items: [["Exhaustive search", 0], ["Evolutionary algorithm", 1], ["Prim's algorithm for plain MST", 0], ["Tabu search", 1]],
      why: "Exact methods guarantee; heuristics don't." },
    TF("Evolutionary algorithms are exact algorithms.", false, "They're approximate (heuristic)."),
    M("A sat-nav finds a very good route in a second. What kind of algorithm does that resemble?", ["An approximate one", "Exhaustive search", "Sorting", "Encryption"], 0, "Speed over proven optimality."),
    M("An EA can be stopped at any time and still return something useful. Why?", ["It keeps the best solution found so far", "It restarts and returns its first solution", "It can't: it must finish every generation", "It stores every solution ever evaluated"], 0, "That's called an anytime algorithm."),
    M("Does more running time usually help an EA?", ["Never: the result is fixed early on", "Usually, but with diminishing returns", "Always: twice the time, twice the quality", "No: longer runs make results worse"], 1, "Big gains early, small gains later."),
    M("When would you pick an exact method over an approximate one?", ["Never: approximate methods are always the better choice", "When it's small, or optimality must be proven", "Always: exact methods beat approximate ones on every problem", "Only for maximisation problems"], 1, "If you can afford certainty, take it."),
  ]);

  B.add("l3-recipe", [
    M("What does a steady-state EA do each step?", ["Replaces the whole population at once with new children", "Makes one or two children, replaces one member", "Stops, sorts everyone, and restarts from scratch", "Sorts the population by fitness"], 1, "Small, continuous updates."),
    M("What does a generational EA do each step?", ["Replaces a single member", "Builds a whole new population of children", "Only mutates the existing members", "Only re-evaluates the existing members"], 1, "Everyone is replaced at once."),
    M("Genotype vs phenotype?", ["Same thing", "Genotype is the encoding", "Genotype is fitness", "Phenotype is the mutation"], 1, "E.g. a bit string (genotype) decodes to a timetable (phenotype)."),
    { type: "match", q: "Match each choice to its box in the recipe.", pairs: [["Binary tournament", "Parent selection"], ["Swap mutation", "Variation"], ["Replace worst", "Replacement"], ["Random bit strings", "Initialisation"]], why: "One choice per box." },
    M("How are EA populations usually initialised?", ["All copies of one guess", "Random solutions", "The worst solutions", "Empty"], 1, "Spread the search out."),
    TF("Mutation operates on the encoding (genotype).", true, "Operators change the representation; fitness is measured on what it decodes to."),
    M("Which is a sensible termination criterion?", ["When mutation happens", "A maximum number of evaluations", "When the first child is made", "Never"], 1, "Budgets or stagnation are the usual stops."),
    M("Why does the recipe separate selection from replacement?", ["No real reason: they do the same job", "One decides who breeds, the other who survives", "Replacement needs its own fitness function", "It halves the memory needed"], 1, "Two independent knobs on pressure."),
  ]);
  B.add("l3-tsp", [
    M("Using the matrix, how long is <code>ACDEB</code>?", ["28", "31", "33", "36"], 2, "A–C 7 + C–D 2 + D–E 9 + E–B 10 + B–A 5 = 33.", { fig: mx() }),
    M("What's the shortest possible tour on the lecture's 5-city matrix?", ["24", "28", "31", "33"], 1, "28 (for example ADCEB). No tour is shorter.", { fig: mx() }),
    M("Are <code>ABCDE</code> and <code>EDCBA</code> different tours?", ["Yes: the cities come in a different order", "No: one is the other driven backwards", "Only if A is the home city", "Only on some distance matrices"], 1, "Same loop, opposite direction."),
    M("How many distinct tours are there for 4 cities?", ["3", "6", "12", "24"], 0, "(4 − 1)! / 2 = 3."),
    M("How many distinct tours are there for 10 cities?", ["about 3,600", "about 180,000", "about 3.6 million", "about 10 billion"], 1, "9! / 2 = 181,440.", { hint: "10! ≈ 3.6 million, so 9! is a tenth of that. Then halve it." }),
    TF("The TSP has a known polynomial-time exact algorithm.", false, "It's a classic hard problem."),
    M("In a permutation encoding of a tour, each city appears…", ["at least once", "exactly once", "at most once", "twice"], 1, "Visit each city once."),
    M("Why is the TSP such a popular test problem?", ["It's easy to solve exactly", "It's simple to state but hard to solve", "It only ever has one good answer", "Its search space is continuous"], 1, "Easy to explain, hard to crack."),
  ]);
  B.add("l3-hc", [
    M("What mutation does the lecture's HC use on tours?", ["Rebuild the whole tour", "Swap two adjacent cities", "Add a city", "Delete a city"], 1, "A small move to a neighbouring tour."),
    M("HC is at <code>ACDEB</code> (33). Swapping the first two cities gives <code>CADEB</code>. What happens?", ["Rejected: it's 35, longer than now", "Accepted: it's 33, no worse", "Accepted: it's 28, shorter", "Rejected: it's 38, much longer"], 1, "C–A 7 + A–D 4 + D–E 9 + E–B 10 + B–C 3 = 33, equal, so it's kept.", { fig: mx() }),
    M("When does a basic HC stop?", ["After a single step, whether or not it improved", "When the budget ends or no neighbour is better", "When the fitness becomes negative for the first time", "Never: it keeps going forever"], 1, "Budget or local optimum."),
    TF("Hillclimbing can escape a local optimum by itself.", false, "It never accepts a worse move, so it stays stuck."),
    M("What does HC remember?", ["Every solution it has seen", "Only its current solution", "A tabu list", "A population"], 1, "That's why it's cheap, and why it gets stuck."),
    M("HC only accepts strictly better moves. What happens on a plateau?", ["It crosses it", "It freezes", "It jumps randomly", "It restarts"], 1, "Accepting equal moves lets it drift across."),
    M("Where is HC most useful?", ["Proving that a solution is the global optimum", "As a fast local improver, often with restarts", "Encrypting data by scrambling it step by step", "Sorting large lists"], 1, "Cheap, quick polishing."),
    M("Same total budget: 10 short HC runs from random starts, or 1 long run?", ["The single long run always does better, since it never restarts", "Restarts give more chances near the global best", "They're exactly equivalent in every case", "Neither can find good solutions"], 1, "One run can only climb one hill."),
  ]);
  B.add("l3-landscape", [
    M("In a fitness landscape picture, height represents…", ["time", "fitness", "mutation rate", "population size"], 1, "Each position is a solution; height is how good it is."),
    M("What decides which solutions are \"next to\" each other on a landscape?", ["Alphabetical order", "The mutation operator", "The fitness", "Random chance"], 1, "Neighbours are one mutation apart."),
    M("A trap problem whose slopes lead away from the best solution is…", ["unimodal", "deceptive", "flat", "linear"], 1, "Following the gradient misleads you."),
    TF("The same problem can have a different landscape shape under a different mutation operator.", true, "Change the operator and you change the neighbours."),
    M("Why are plateaus hard?", ["The slopes around them are too steep", "All neighbours look the same", "They're too small to find", "They hide many small peaks"], 1, "No gradient to follow."),
    M("A \"needle in a haystack\" landscape has one good point and everything else equal. Best strategy?", ["Hillclimbing, following the slope", "Nothing does better than random search", "Tabu search, which avoids revisits", "Crossover, which mixes good parts"], 1, "No information anywhere except at the needle."),
    M("A rugged landscape has…", ["a single smooth peak", "many local optima", "no peaks at all", "only flat plateaus"], 1, "Lots of small hills to get stuck on."),
    M("In big real problems, where do good solutions tend to be?", ["Spread evenly across the whole space", "In tiny regions of a mostly poor space", "Only at the edges of the space", "At purely random positions"], 1, "That's why small steps near good solutions pay off."),
  ]);
  B.add("l3-neighbourhood", [
    M("Bit-flip mutation on a 20-bit string: how many neighbours?", ["2", "20", "40", "about a million"], 1, "One per bit."),
    M("\"Swap any two cities\" on an 8-city tour: how many neighbours?", ["8", "16", "28", "56"], 2, "C(8,2) = 8 × 7 / 2 = 28."),
    M("Adjacent swaps on 6 positions, <b>not</b> wrapping around: how many neighbours?", ["5", "6", "12", "15"], 0, "Pairs (1,2) … (5,6): five."),
    TF("A bigger neighbourhood usually means fewer local optima.", true, "More moves means more chances that one of them is an improvement."),
    M("The neighbourhood of a solution s is…", ["the best solution found anywhere so far in the run", "every solution one mutation away from s", "the whole search space around s", "s itself and nothing else"], 1, "Defined entirely by the mutation operator."),
    M("Flipping any <b>two</b> bits of a 10-bit string: how many neighbours?", ["10", "20", "45", "100"], 2, "C(10,2) = 45."),
    M("A solution is a local optimum under single-bit flips. Under two-bit flips it…", ["must still be one", "might not be", "becomes the global optimum", "disappears"], 1, "Local optimality depends on the neighbourhood."),
    M("What's the cost of a huge neighbourhood?", ["None: bigger is always better", "Each step takes longer, and moves are less local", "There are fewer solutions to choose from", "It stops the fitness function working"], 1, "The trade-off: fewer traps, more work per step."),
  ]);
  B.add("l3-local", [
    M("Monte Carlo search with acceptance probability p = 1 becomes…", ["Hillclimbing", "A random walk", "Tabu search", "Exhaustive search"], 1, "Always moving means no selection at all."),
    M("What does a tabu list store?", ["The best solution found so far, kept for the final answer", "Recently visited solutions or moves, banned for now", "All the neighbours of the current solution", "The fitness values of every solution"], 1, "It stops the search walking straight back."),
    M("How many neighbours does tabu search evaluate per step?", ["One random one", "All of them", "None", "Two"], 1, "It picks the best non-tabu neighbour, so it must look at all."),
    M("Why does local search keep a best-so-far solution?", ["So the run can be logged and replayed later for debugging", "Worse moves mean the current one may not be best", "Because tabu search requires it to work", "To save memory during the run"], 1, "Never lose the best you've found."),
    TF("Monte Carlo search returns its current solution at the end.", false, "It should return the best-so-far."),
    { type: "cat", q: "Cost of one step?", buckets: ["Evaluates one neighbour", "Evaluates all neighbours"],
      items: [["Monte Carlo search", 0], ["Tabu search", 1], ["Hillclimbing (random neighbour)", 0]],
      why: "Tabu pays more per step to always make the best allowed move." },
    M("What happens if the tabu tenure (list length) is very long?", ["Nothing: longer lists are always safer against cycling", "Too many moves get banned, blocking good paths", "It cycles between solutions more often than before", "It turns into plain hillclimbing"], 1, "Too long is as bad as too short, in the other direction."),
    M("Which of these escapes local optima by design?", ["Plain hillclimbing, which only ever moves uphill", "Monte Carlo and tabu search", "Exhaustive search", "None of these"], 1, "Both deliberately allow downhill moves."),
  ]);
  B.add("l3-population", [
    M("Why does a population method need a selection step?", ["To remove the weakest members each step", "It must choose which of many candidates to vary", "To keep the population sorted by fitness", "It doesn't: every member is varied equally"], 1, "More than one current solution means a choice."),
    M("Why does a population make recombination possible?", ["It doesn't; only mutation works there", "There are several parents whose parts can be mixed", "It adds extra mutation to each child", "It removes the need for a fitness function"], 1, "You need two solutions to cross."),
    M("In the lecture's steady-state example, a mutant replaces the worst member when…", ["always, whatever its fitness", "it's better than that worst member", "it's worse than the best member", "at random, half the time"], 1, "Only improvements over the worst get in."),
    TF("A population method is just several independent hillclimbers running side by side.", false, "Selection and crossover make the members interact."),
    M("What's diversity good for?", ["It makes each fitness evaluation run faster", "It keeps different regions of the space in play", "It saves memory, since similar members are compressed", "It guarantees the optimum"], 1, "Variety = options."),
    M("The population converges on a mediocre solution very early. Name?", ["Elitism", "Premature convergence", "Genetic drift", "Exploration"], 1, "Everyone ends up in the same place before the good regions are found."),
    M("\"Phenotype convergence\" means members have…", ["the same encoding (genes)", "the same fitness or behaviour", "very different fitness values", "no fitness at all"], 1, "Genotype = same genes; phenotype = same result."),
    M("You double the population size. Trade-off?", ["Nothing changes at all, since selection adapts", "More diversity, but double the evaluations", "Less diversity, but only half the evaluations per generation", "Each generation runs faster"], 1, "Diversity costs evaluations."),
  ]);

  B.add("l4-types", [
    M("Generational GA without elitism. Can the best fitness drop from one generation to the next?", ["Never: selection always protects the best individual", "Yes: the best may not be copied across", "Only when crossover is switched on", "Only when mutation is switched on"], 1, "Nothing protects it."),
    M("Elitism with n = 1 guarantees what?", ["That the optimum will be found", "The best fitness never goes down", "The population stays more diverse", "Each generation evaluates faster"], 1, "The top individual is always carried over."),
    TF("A steady-state GA that replaces a random member is elitist.", false, "The random victim could be the best."),
    M("A generational GA with population 30 and no elitism makes how many children per generation?", ["1", "15", "30", "60"], 2, "It refills the whole population."),
    M("In a steady-state GA, when can a good new child become a parent?", ["Only in the next generation", "Immediately, in the very next step", "Never: children can't become parents", "Only after 10 more steps"], 1, "No waiting for a generation boundary."),
    { type: "cat", q: "Which scheme?", buckets: ["Generational", "Steady-state"],
      items: [["Parents and children never mix in one population", 0], ["Changes the population a little at a time", 1], ["Batch-evaluates a whole new population", 0]],
      why: "All at once vs a trickle." },
    M("Which scheme tends to explore more at once?", ["Steady-state", "Generational", "Neither", "Both equally"], 1, "It changes the whole population each round."),
    M("What's the downside of a very large elite?", ["More exploration", "Strong pressure", "Nothing", "Slower evaluation"], 1, "Elites crowd out newcomers."),
  ]);
  B.add("l4-replacement", [
    M("Population 0.6, 0.3, 0.8, 0.2 (maximising). A child scores 0.5. Which slot does replace <b>first weaker</b> take (scanning from slot 1)?", ["Slot 1", "Slot 2", "Slot 3", "Slot 4"], 1, "Slot 1 (0.6) isn't weaker than 0.5; slot 2 (0.3) is, so the scan stops there."),
    M("Same population and child. Which slot does replace <b>weakest</b> take?", ["Slot 1", "Slot 2", "Slot 3", "Slot 4"], 3, "The weakest is 0.2 in slot 4."),
    M("The slides' first-weaker example only works if…", ["ties count as weaker", "the child is best", "the population is sorted", "there's elitism"], 0, "A child of equal fitness replaces the member it ties with."),
    TF("Replace-first-weaker always removes the worst member.", false, "It removes the first member weaker than the child, which may not be the worst."),
    M("Which strategy applies higher selection pressure?", ["Replace first weaker", "Replace weakest", "Same", "Neither"], 1, "Always evicting the bottom is greedier."),
    M("What's the cost of replace-weakest per child?", ["A single comparison between the child and one member", "A scan of the population to find the worst", "Nothing: the worst member is always known in advance", "A full sort of every child"], 1, "Unless you maintain a sorted structure."),
    M("A child is worse than every member. What happens?", ["It replaces the worst", "It's thrown away", "It replaces the best", "It's added anyway"], 1, "Neither strategy lets it in."),
    M("Replace a random member. Big risk?", ["None", "The current best can be lost", "The population grows", "Fitness can't be computed"], 1, "No protection for good members."),
  ]);
  B.add("l4-pressure", [
    M("Selection pressure is…", ["the mutation rate applied to children", "how much more likely a fit individual is to be picked", "the number of individuals in the population", "the number of generations the run lasts"], 1, "A measure of greediness."),
    M("Talent-show judges who are far too harsh. What's the EA equivalent?", ["Low pressure", "High pressure", "No pressure", "High mutation"], 1, "Late bloomers never get a chance."),
    M("In the lecture's pressure heatmap, each row is…", ["one individual", "one generation", "one gene", "one run"], 1, "Time runs down the picture."),
    M("Tournament size 1 gives…", ["maximum pressure", "no pressure", "elitism", "roulette"], 1, "One random pick, no comparison."),
    TF("Higher selection pressure always gives better final results.", false, "Too much pressure causes premature convergence."),
    { type: "match", q: "Match each method to its pressure knob.", pairs: [["Tournament selection", "Tournament size t"], ["Rank selection", "The rank exponent (bias)"], ["Generational GA", "Number of elites kept"]], why: "Most methods expose a dial." },
    M("Roulette's selection pressure depends on…", ["only the size of the population", "how spread out the fitness values are", "the mutation rate", "nothing: it's fixed"], 1, "Big differences in fitness mean strong pressure."),
    M("Fitness wanders slowly, with no clear improvement. Likely fix?", ["Lower the selection pressure further", "Raise selection pressure a little", "Remove mutation entirely", "Scale all fitness values down"], 1, "It needs more pull towards good solutions."),
  ]);
  B.add("l4-roulette", [
    M("Fitnesses 1, 1 and 2. Probability of picking the 2?", ["1/4", "1/3", "1/2", "2/3"], 2, "2 / (1 + 1 + 2) = 1/2."),
    M("Four individuals, all fitness 4. Probability of each?", ["1/4", "1/2", "4", "1"], 0, "Equal slices."),
    M("One individual has fitness 100 and four others have 1. Roughly what's its share of the wheel?", ["about 20%", "about 50%", "about 96%", "100%"], 2, "100 / 104 ≈ 0.96: the superfit problem."),
    M("You add a large constant to every fitness. What happens to selection?", ["It gets stronger", "It moves towards uniform", "Nothing changes", "It reverses the ranking"], 1, "Roulette depends on absolute values."),
    TF("With roulette, selection probability is proportional to fitness.", true, "Slice size = fitness / total fitness."),
    M("Over N spins, how many times do you expect individual i to be picked?", ["N", "N × fᵢ / (total fitness)", "fᵢ", "1"], 1, "Its share times the number of spins."),
    M("Some fitness values are negative. Common fix?", ["Ignore the negative individuals and carry on as normal", "Shift every value up, or use rank/tournament", "Square every fitness value", "Delete those individuals"], 1, "Slices can't be negative."),
    M("Minimising cost with roulette. A standard transformation?", ["Use the cost directly as fitness", "Use 1 / cost (or max − cost)", "Use cost²", "Use −cost directly"], 1, "Lower cost must mean a bigger slice."),
  ]);
  B.add("l4-rank", [
    M("Linear rank selection, population 3. Probability of the best?", ["1/3", "1/2", "2/3", "1"], 1, "Ranks 1 + 2 + 3 = 6, so 3/6."),
    M("Same population of 3. Probability of the worst?", ["0", "1/6", "1/3", "1/2"], 1, "1/6."),
    M("Linear rank selection, population 10. Probability of the best?", ["1/10", "about 0.18", "1/2", "about 0.9"], 1, "10 / (1 + … + 10) = 10/55 ≈ 0.18."),
    TF("Rank selection needs the population sorted by fitness.", true, "Ranks come from the order."),
    M("Probability ∝ rank<sup>b</sup> with b = 0. What is selection now?", ["Maximum pressure", "Uniform", "Only the best", "Roulette"], 1, "rank⁰ = 1 for everyone."),
    M("Why is rank selection robust to one superfit individual?", ["It removes that individual from the breeding pool entirely", "Only its position counts, not its fitness size", "It caps fitness at a fixed maximum", "It squares every fitness first"], 1, "Being far ahead doesn't earn extra share."),
    M("Minimising with rank selection: which gets rank 1 (the smallest share)?", ["The cheapest", "The most expensive", "A random one", "The newest one"], 1, "Worst gets the lowest rank."),
    M("How does rank selection's pressure react when all fitness values become very close?", ["Drops to zero", "Stays the same", "Explodes", "Reverses"], 1, "Unlike roulette, it's scale-independent."),
  ]);
  B.add("l4-tournament", [
    M("Tournament size 2 with replacement, population 5. Probability the best wins?", ["0.2", "0.36", "0.64", "0.8"], 1, "1 − (4/5)² = 1 − 0.64 = 0.36.", { hint: "It loses only if it's missed in both draws: 0.8 × 0.8." }),
    M("Tournament size 3 with replacement, population 3. Probability the best wins?", ["about 0.33", "about 0.5", "about 0.7", "1"], 2, "1 − (2/3)³ = 1 − 8/27 = 19/27 ≈ 0.70.", { hint: "It's missed all three times with chance (2/3)³ = 8/27, a bit under a third." }),
    M("Tournament size 2 <b>without</b> replacement, population 5. Probability the best is in the pair (and wins)?", ["0.2", "0.36", "0.4", "0.5"], 2, "2 of the 5 are chosen: 2/5.", { hint: "Without replacement the pair is 2 different members. What fraction of the 5 is that?" }),
    TF("Tournament selection works fine with negative fitness values.", true, "It only compares values."),
    M("Why doesn't tournament selection need the population's total fitness?", ["It does need it, like roulette", "It only compares the few individuals drawn", "It uses the ranks instead", "It picks winners completely at random"], 1, "No global information required."),
    M("Increasing t does what to selection pressure?", ["Lowers it", "Raises it", "Nothing", "Randomises it"], 1, "The top individuals appear in more tournaments."),
    M("Why is tournament selection easy to run in parallel?", ["It isn't: tournaments must run one after another", "Each tournament is independent and small", "It needs a sorted population, which parallelises well", "It needs a global total, which is easy to share"], 1, "Many tournaments can run at once."),
    M("Tournament selection's main extra cost?", ["Sorting the whole population", "One more parameter (t) to tune", "It can't handle negative fitness", "It needs a lot of memory"], 1, "The slides' one listed drawback."),
  ]);
  B.add("l4-mutation", [
    M("Mutation rate far too low. Effect?", ["Too much exploration", "Very slow exploration", "Random search", "Crash"], 1, "The search barely moves."),
    M("Bit-flip rate 0.5 per bit. Effect?", ["Only tiny steps, since each bit rarely changes", "Children are basically random strings", "No change to the children", "The same as elitism"], 1, "Half the bits flip: all inheritance is lost."),
    TF("Both swap and insertion mutation keep a permutation valid.", true, "They rearrange cities without duplicating any."),
    { type: "cat", q: "Valid mutation for a permutation (city order)?", buckets: ["Valid", "Invalid"],
      items: [["Swap two cities", 0], ["Move one city to a new position", 0], ["Replace one city with a random city", 1], ["Reverse a segment", 0], ["Flip a bit of the city index", 1]],
      why: "Valid operators only reorder; invalid ones can duplicate or drop cities." },
    M("In Gaussian mutation, the standard deviation controls…", ["the population size", "the typical step size", "selection pressure", "crossover rate"], 1, "Small σ = small steps."),
    TF("An EA can work with mutation only (no crossover).", true, "Evolution strategies often do."),
    M("Why does random-reset mutation help k-ary strings?", ["It doesn't: swapping genes is always better for k-ary strings", "It can add values nobody currently has", "It sorts genes into order", "It removes duplicate genes"], 1, "Swaps only rearrange what's there."),
    M("Small mutations help ___; being able to reach anywhere helps ___.", ["exploration; exploitation", "exploitation; exploration", "selection; replacement", "speed; memory"], 1, "Exploit nearby, explore everywhere."),
  ]);
  B.add("l4-crossover", [
    M("1-point crossover, cut after gene 3: P1 = 110011, P2 = 001100. First child?", ["110100", "001011", "110011", "111100"], 0, "Head 110 from P1, tail 100 from P2."),
    M("2-point crossover, cuts after genes 2 and 4: P1 = AAAAAA, P2 = BBBBBB. Child taking P1's outer parts?", ["AABBAA", "BBAABB", "AAABBB", "ABABAB"], 0, "Genes 3–4 come from P2."),
    M("Uniform crossover, P1 = ABCD, P2 = wxyz, mask 1010 (1 = take from P2). Child?", ["wByD", "AxCz", "wxCD", "ABCD"], 0, "Positions 1 and 3 from P2."),
    TF("Crossover can create a gene value that neither parent has.", false, "It only recombines existing values; that's mutation's job."),
    M("With 1-point crossover, which genes get separated most often?", ["Neighbouring genes", "Genes far apart on the string", "The first gene", "None: every pair is split equally often"], 1, "Almost any cut separates the two ends."),
    M("What does order crossover (for permutations) preserve?", ["Nothing: it builds completely random tours from both parents", "A segment of one parent plus the other's order", "Only the starting city of each parent", "A random selection of cities"], 1, "Valid tours that inherit from both."),
    M("Crossover rate set to 0. What's left?", ["Nothing works", "A mutation-only EA", "Random search", "Exhaustive search"], 1, "Children are mutated copies."),
    M("The idea behind crossover is that good partial solutions (\"building blocks\")…", ["are usually destroyed by crossover", "found in different parents can be combined", "can't exist in real problems", "only ever come from mutation"], 1, "Mix good parts from different individuals."),
  ]);
  B.add("l4-lab", [
    M("Target is 144 pixels. A candidate has 18 wrong. Fitness?", ["0.5", "0.75", "0.875", "0.99"], 2, "18 wrong is 1/8 of 144, so 7/8 = 0.875 match.", { hint: "18 is one-eighth of 144." }),
    M("Diversity reads 1. What does that mean?", ["Every member of the population is identical", "Members are all different from each other", "The best member has perfect fitness", "Mutation has been switched off"], 1, "Diversity 0 = identical, 1 = all different."),
    M("All the population thumbnails look identical. What has happened?", ["The population is very diverse", "The population has converged", "The display has a bug", "Mutation is set very high"], 1, "Everyone is a copy."),
    M("How big is the search space of 12×12 black/white pictures?", ["144", "144²", "2¹⁴⁴", "12!"], 2, "Each pixel is on or off: 2¹⁴⁴."),
    TF("With no selection at all (random parents), best fitness improves only a little.", true, "Nothing favours better pictures, so progress is mostly luck."),
    M("You raise the tournament size. Expected effect?", ["Slower convergence and more diversity, since tournaments are fairer", "Faster convergence, faster loss of diversity", "No effect on the run", "Fitness drops over time"], 1, "More pressure."),
    M("Elitism is on. What does the \"best\" line look like?", ["It jumps around", "It never goes down", "It always goes down", "It's flat at 0"], 1, "The best is always kept."),
    M("Best fitness is stuck at 0.95 and diversity is 0. What might help?", ["Lower mutation further, so the good solution isn't disturbed", "Raise mutation a little to restore variation", "Raise selection pressure", "Stop the run now"], 1, "Only mutation can reintroduce variety once everyone is the same."),
  ]);
})();

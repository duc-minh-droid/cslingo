(function () {
  const B = NIC.bank;

  /* ---------- l1-what ---------- */
  B.add("l1-what", [
    {
      type: "cat",
      q: "Each natural example below inspired one family of methods. Which natural system is it from?",
      buckets: ["Evolution", "Brains", "Collective behaviour"],
      items: [
        ["Moths slowly turning darker over many generations", 0],
        ["Links between neurons strengthening with practice", 1],
        ["Bees choosing a nest site by many small dance votes", 2],
        ["Fish turning together in a school with no leader", 2],
        ["Beak shapes shifting as seed types change", 0],
        ["Face recognition in a single glance", 1],
      ],
      hint: "Ask: does it change across generations, learn in one body, or emerge from many simple agents?",
      why: "Moths and beaks change over generations, so they are evolution. Neuron links and fast face recognition are brains learning. Bee votes and fish schools come from many simple individuals following local rules, which is collective behaviour.",
    },
    {
      type: "order",
      q: "Put the thinking behind a nature-inspired method in order.",
      items: [
        "Notice that a natural system solves a hard problem",
        "Spot the computing task it matches, such as search",
        "Copy its strategy as an algorithm",
        "Score its answers on your own problem",
      ],
      hint: "You can only copy a strategy once you know which task it solves.",
      why: "The route runs Nature, then Inspired, then Computation: observe the natural success, link it to a computing task, turn the strategy into steps, and finally test it on the problem you care about.",
    },
    {
      type: "match",
      q: "Nature had to solve these tasks long before computers. Match each to its computing version.",
      pairs: [
        ["Spotting ripe fruit among the leaves", "Pattern recognition"],
        ["A bird taking the quickest way back to its roost", "Shortest-path routing"],
        ["Foraging a meadow for the richest patch", "Search and optimisation"],
      ],
      hint: "Recognising, travelling and hunting each have a computing twin.",
      why: "Telling fruit from leaves is classifying patterns. The quickest way home is a shortest-path problem. Hunting for the richest patch is searching a large space for the best answer.",
    },
    {
      type: "multi",
      q: "Select every statement that is true of ant colonies as a model for computing.",
      o: [
        "Each ant follows simple local rules",
        "Good behaviour can appear with no leader",
        "A queen plans every ant's route in advance",
        "The colony is only as clever as its cleverest ant",
      ],
      a: [0, 1],
      hint: "Think emergence: simple parts, clever whole.",
      why: "Single ants are simple, yet short paths to food emerge from many of them interacting. The queen does not plan routes, and the colony does far better than any one ant could alone.",
    },
    {
      type: "slider",
      q: "A small puzzle has about 1,000,000 possible answers. Checking every one at 1,000 answers a second would take roughly how many seconds?",
      min: 0,
      max: 3000,
      step: 100,
      ans: 1000,
      tol: 250,
      unit: "s",
      hint: "1,000,000 ÷ 1,000.",
      why: "A million checks at a thousand a second is a thousand seconds, about 17 minutes. That is fine for a toy puzzle, but real problems have astronomically more answers, which is why we want methods that find good answers without checking everything.",
    },
    {
      type: "mcq",
      q: "A student says nature-inspired computing means simulating real biology as faithfully as possible. What is the best correction?",
      o: [
        "We borrow a useful strategy and drop the biology",
        "We copy every detail so the results stay realistic",
        "We only use it to predict how real animals behave",
      ],
      a: 0,
      why: "The goal is a working problem solver, not an accurate biological model. We keep the strategy that works, such as selection or trail-following, and leave out the rest.",
    },
  ]);

  /* ---------- l1-monkey ---------- */
  B.add("l1-monkey", [
    {
      type: "slider",
      q: "A monkey types 3 random letters from a 27-key keyboard (A to Z and space), aiming for CAT, with every try starting from scratch. About how many attempts does it need on average?",
      min: 0,
      max: 40000,
      step: 1000,
      ans: 20000,
      tol: 5000,
      unit: "tries",
      hint: "Count the strings: 27 × 27 = 729, then 729 × 27 is about 20,000. One of them is CAT.",
      why: "There are 27 × 27 × 27 = 19,683 equally likely strings and one of them is CAT, so on average it takes about 20,000 fresh tries. Nothing carries over between tries, which is the monkey's problem.",
    },
    {
      type: "order",
      q: "Put the story of how geckos got sticky feet in order, as evolution would tell it.",
      items: [
        "Toe pads vary slightly between geckos",
        "Geckos with better grip survive more often",
        "They leave more offspring with similar pads",
        "The next generation starts from better pads",
      ],
      hint: "Variation first, then selection, then inheritance.",
      why: "Random variation proposes differences, selection keeps the better ones, and offspring inherit them, so the next round starts from improved pads. That keep-what-works loop is the opposite of the monkey starting over every time.",
    },
    {
      type: "match",
      q: "The keep-if-better search for a target sentence mirrors evolution. Match each part of the search to its evolutionary role.",
      pairs: [
        ["A string of letters", "A candidate solution"],
        ["How many letters match the target", "Fitness"],
        ["Changing one random letter", "Mutation"],
        ["Keeping the child unless it scores worse", "Selection"],
      ],
      hint: "What gets changed, what gets scored, what gets kept?",
      why: "Each string is a candidate, the match count is its fitness, a one-letter change is a small random mutation, and the keep-or-discard step is selection.",
    },
    {
      type: "multi",
      q: "Select every statement that is true about the Infinite Monkey Theorem.",
      o: [
        "Given endless time, the monkey would eventually type Shakespeare",
        "Eventually can mean far longer than the age of the universe",
        "Each attempt tells the monkey how close it was",
        "Every attempt is independent of the ones before it",
      ],
      a: [0, 1, 3],
      hint: "The theorem is true, but is it useful?",
      why: "With unlimited time the monkey does succeed, yet the wait for even one short sentence is astronomical. Every try starts from scratch and nothing tells the monkey it was close, so there is no progress to build on.",
    },
    {
      type: "mcq",
      q: "Someone argues that random typing is fine because computers can make a billion tries a second. What is the best reply?",
      o: [
        "The number of possible strings grows too fast for speed to help",
        "Computers cannot generate random letters quickly enough to try this",
        "A billion tries a second is still slower than any real monkey",
      ],
      a: 0,
      why: "A 28-letter sentence has about 10^40 possibilities, so even a billion tries a second would take about 10^23 years. Faster hardware cannot fix a search that throws away its progress.",
    },
    {
      type: "cat",
      q: "A search is hunting for a target sentence. Sort each habit by whether it builds on progress or wastes it.",
      buckets: ["Builds on progress", "Wastes progress"],
      items: [
        ["Starting a brand new random string after every failed try", 1],
        ["Changing one letter and keeping the result if it is not worse", 0],
        ["Throwing away a child that matches fewer letters than its parent", 0],
        ["Keeping a child that matches fewer letters than its parent", 1],
        ["Carrying the best string so far into the next try", 0],
      ],
      hint: "Ask: after the step, is the best string so far still there?",
      why: "Keep-if-better builds on progress because good letters stay locked in: it changes one letter, discards worse children and carries the best forward. Restarting from scratch, or accepting worse children, throws that progress away, which is what the monkey does.",
    },
  ]);

  /* ---------- l1-ingredients ---------- */
  B.add("l1-ingredients", [
    {
      type: "slider",
      q: "Parents are chosen with chance in proportion to fitness. Three candidates have fitness 6, 3 and 1. What is the chance, in percent, that the fittest one is chosen?",
      min: 0,
      max: 100,
      step: 5,
      ans: 60,
      tol: 10,
      unit: "%",
      hint: "The total fitness is 6 + 3 + 1 = 10. The best has 6 of those 10 shares.",
      why: "Chances are fitness divided by the total: 6 out of 10 is 60%. The others get 30% and 10%, so the weakest still has some chance, which is the weak bias the lecture wants.",
    },
    {
      type: "order",
      q: "A population has 100 candidates. Put these parent-choosing rules in order from the weakest bias towards the fittest to the strongest.",
      items: [
        "Every candidate has an equal chance",
        "Chance in proportion to fitness",
        "Only the 10 fittest of the 100 may breed",
        "Only the single fittest may breed",
      ],
      hint: "How much do the less fit lose out under each rule?",
      why: "Equal chances ignore fitness entirely, so there is no bias. Proportional chances favour the fit but give everyone a share. A top-10% rule shuts most candidates out, and a single winner shuts out everyone else.",
    },
    {
      type: "match",
      q: "The landscape picture in the lecture has a few parts. Match each part to what it stands for.",
      pairs: [
        ["Height of the curve", "How good a solution is"],
        ["A purple dot", "One member of the population"],
        ["The ★", "The best solution of all"],
        ["Position along the bottom", "Which possible solution it is"],
      ],
      hint: "Position says which solution, height says how good.",
      why: "Each point along the bottom is one possible solution, and the curve's height there is its fitness. Dots are the current population, and the ★ marks the top of the tallest peak.",
    },
    {
      type: "multi",
      q: "Select every statement that is true of mutation in an EA.",
      o: [
        "It makes a small random change to a chosen parent",
        "It can introduce variety that no parent had",
        "It changes every part of the parent it is applied to",
        "It guarantees that the child is fitter than its parent",
      ],
      a: [0, 1],
      hint: "Mutation proposes, selection judges.",
      why: "Mutation makes small random changes, which can add variety that nobody in the population had. It does not promise improvement: many mutants are worse, and selection decides which survive. It makes small changes, not a rewrite of the whole parent.",
    },
    {
      type: "bug",
      q: "This EA is supposed to use weakly biased selection, but its population soon becomes copies of one candidate. Click the faulty line.",
      code: [
        "population = random_candidates(20)",
        "for generation in range(100):",
        "    parents = [max(population, key=fitness) for _ in range(20)]",
        "    population = [mutate(p) for p in parents]",
      ],
      a: 2,
      hint: "Which line lets only one candidate ever be a parent?",
      why: "Taking the maximum every time is the strongest possible bias: only the single fittest ever breeds, so variety collapses. A weak bias would pick parents at random with chances that rise with fitness, giving the weaker ones some chance too.",
    },
    {
      type: "multi",
      q: "Select every statement that is true of keeping a population of candidates instead of just one.",
      o: [
        "Different candidates can settle on different hills",
        "Several candidates are searching at the same time",
        "A population is one candidate copied many times",
        "With a single candidate, finding the tallest peak is impossible",
      ],
      a: [0, 1],
      hint: "Think of one hiker in fog versus twenty spread out.",
      why: "A population explores from many starting points at once, so some candidates may land near the big mountain. It is many different candidates, not copies. One candidate can still get lucky, but it is likely to get stuck on the first hill it climbs.",
    },
  ]);

  /* ---------- l1-apps ---------- */
  B.add("l1-apps", [
    {
      type: "cat",
      q: "An EA needs a way to score any candidate. Sort each goal by whether a fitness function could score it.",
      buckets: ["Can be scored", "Cannot be scored as stated"],
      items: [
        ["The total distance of a delivery route", 0],
        ["The share of test emails labelled correctly", 0],
        ["How beautiful a painting is, with no agreed measure", 1],
        ["Whether a design simply feels right", 1],
        ["How many tests a program passes", 0],
      ],
      hint: "Could a program turn a candidate into a number?",
      why: "Distance, share correct and tests passed are all numbers a program can compute. Beauty and feel have no agreed measure, so they would first have to be turned into something measurable before an EA could use them.",
    },
    {
      type: "match",
      q: "In each application, fitness comes from a different measurement. Match the job to a sensible fitness.",
      pairs: [
        ["Delivery routing", "Total distance, lower is better"],
        ["Spam detection", "Share of emails classified correctly"],
        ["Gas turbine control", "Simulated stability and fuel use"],
        ["Antenna design", "Simulated signal against the specification"],
      ],
      hint: "Ask what the real-world goal would be measured by.",
      why: "The EA is generic. What changes between jobs is the score: shorter routes, more emails right, a controller that keeps a simulated turbine steady, or an antenna that meets its spec in simulation.",
    },
    {
      type: "order",
      q: "Put one round of Bentley's car-design EA in order.",
      items: [
        "Read each chromosome as a series of slices of a car",
        "Run an airflow simulation on every car shape",
        "Score each car with the result as its fitness",
        "Breed new shapes from the better-scoring cars",
      ],
      hint: "A design must exist before it can be tested.",
      why: "The chromosome is decoded into a car shape, the simulation tests it, the result becomes the fitness, and only then can fitter shapes be chosen as parents for the next round.",
    },
    {
      type: "multi",
      q: "Select every statement that is true of the lecture's famous EA examples.",
      o: [
        "Evolved NASA ST5 antennas beat human expert designs",
        "Bentley's car chromosome was a series of slices through the car",
        "Top Gun evolved strategies for fighter pilots",
        "The EA had to be told how to build a good antenna",
      ],
      a: [0, 1, 2],
      hint: "An EA only needs a score, not a recipe.",
      why: "The antennas, the car slices and the pilot strategies are the lecture's three examples. The EA is never told how to build a good design: it only needs a way to score candidates.",
    },
    {
      type: "slider",
      q: "A controller's fitness is tests passed minus 2 for every crash. It passed 18 tests and crashed 3 times. What is its fitness?",
      min: 0,
      max: 30,
      step: 1,
      ans: 12,
      tol: 2,
      unit: "",
      hint: "3 crashes cost 3 × 2 = 6 points. Then 18 − 6.",
      why: "Three crashes cost 6, so the fitness is 18 − 6 = 12. Weighting crashes more heavily than passes tells the EA what we care about.",
    },
    {
      type: "multi",
      q: "Select every job whose fitness is most naturally found by running a simulation.",
      o: [
        "Scoring an antenna design against its signal specification",
        "Scoring a car shape by how air flows over it",
        "Scoring a delivery route by adding up its leg lengths",
        "Scoring a timetable by counting students with clashes",
      ],
      a: [0, 1],
      hint: "Which scores can be added up from the candidate, and which need a virtual test?",
      why: "Antenna and car shapes must be tested virtually, as in the ST5 and Bentley examples. Route length and clash counts come straight from the candidate with simple adding or counting, no simulation needed.",
    },
  ]);
})();

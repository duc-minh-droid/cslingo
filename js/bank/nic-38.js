(function () {
  const B = NIC.bank;
  const T = (x, y, s, c) =>
    `<text x="${x}" y="${y}" text-anchor="middle" style="font:900 14px var(--sans);fill:${c || "var(--ink)"}">${s}</text>`;
  const svg = (h, s) => `<svg viewBox="0 0 500 ${h}" style="width:100%;max-width:500px">${s}</svg>`;
  const steps = (vals) =>
    svg(
      80,
      vals
        .map(
          (v, i) =>
            `<g data-pick="s${i + 1}"><rect x="${10 + i * 68}" y="22" width="60" height="42" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${T(40 + i * 68, 49, v)}${T(40 + i * 68, 14, "step " + (i + 1), "var(--text-dim)")}</g>`,
        )
        .join(""),
    );
  const hills = [
    ["A", "5,80 75,15 145,80"],
    ["B", "5,80 25,30 45,70 65,20 85,70 105,35 125,70 145,80"],
    ["C", "5,70 70,70 75,15 80,70 145,70"],
  ];
  const thumbs = svg(
    110,
    hills
      .map(
        ([k, p], i) =>
          `<g data-pick="${k}" transform="translate(${i * 170 + 5} 0)"><rect width="150" height="90" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/><polyline points="${p}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>${T(75, 106, k)}</g>`,
      )
      .join(""),
  );

  B.add("l3-recipe", [
    {
      type: "slider",
      q: "A steady-state EA starts with 20 random members, each scored once. After that it makes and scores one child per step. Its budget is 520 fitness evaluations in total. How many steps can it run?",
      min: 0,
      max: 600,
      step: 20,
      start: 300,
      ans: 500,
      tol: 40,
      hint: "Take the 20 starting evaluations off the budget first. What is left is one evaluation per step.",
      why: "The starting population uses 20 evaluations, leaving 520 − 20 = 500. Each step scores exactly one child, so it runs 500 steps. A generational EA would score a whole new population each round instead.",
    },
    {
      type: "cat",
      q: "Sort each description by the kind of EA it fits.",
      buckets: ["Generational", "Steady-state"],
      items: [
        ["A whole new population is built, then it replaces the old one", 0],
        ["Parents and children are never both in the population at the end of a round", 0],
        ["Each step adds one child and removes one member", 1],
        ["The population can change after every single child", 1],
      ],
      hint: "Ask how much of the population changes in one round.",
      why: "A generational EA swaps the whole population at once, so old and new members never mix at the end of a round. A steady-state EA replaces one member per child, so it keeps changing a little at a time.",
    },
    {
      type: "multi",
      q: "You want an EA to find a good exam timetable. Which of these must you decide before the loop can run? Select all that apply.",
      o: [
        "How a timetable is written down as a chromosome",
        "A fitness score that says how good a timetable is",
        "A mutation that turns one timetable into a similar one",
        "The best possible timetable, to compare against",
        "A proof that the search will end on the optimum",
      ],
      a: [0, 1, 2],
      hint: "The loop needs something to score, something to vary, and a way to write candidates down.",
      why: "The encoding, the fitness and the variation operators are the problem-specific parts. An EA does not need to know the best answer in advance, and it gives no proof that it will find it.",
    },
    {
      type: "bug",
      q: "This tournament of 2 should keep the <b>fitter</b> of two random members (fitness is maximised). Click the faulty line.",
      code: [
        "def tournament(pop, fit):",
        "    a = random.choice(pop)",
        "    b = random.choice(pop)",
        "    if fit(a) < fit(b):",
        "        return a",
        "    return b",
      ],
      a: 3,
      hint: "Suppose a has fitness 3 and b has fitness 8. Which one does it return?",
      why: "With <code>fit(a) &lt; fit(b)</code> it returns a, the weaker one, whenever a is worse. It should test <code>fit(a) &gt; fit(b)</code> (or return b in that case).",
    },
    {
      type: "mcq",
      q: "Two parents are identical copies, 10110 and 10110. Crossover alone is used to make a child. What can the child be?",
      o: [
        "Only 10110, the same string again",
        "Any 5-bit string, picked at random",
        "A string with more 1s than either parent",
        "A string with a 1 where both parents have 0",
      ],
      a: 0,
      hint: "Crossover only copies genes that a parent already has.",
      why: "Crossover copies genes from the parents and never invents a new value. When both parents agree at every position, the child must agree too. Only mutation can add something new.",
    },
    {
      type: "order",
      q: "Put the design decisions for a new EA in a sensible order.",
      items: [
        "Decide how a candidate is written down (the encoding)",
        "Write a fitness function that scores a candidate",
        "Pick selection, crossover, mutation and replacement that suit that encoding",
        "Choose a population size and a stopping rule",
      ],
      hint: "Operators work on the encoding, and selection needs scores.",
      why: "The encoding comes first because every other piece handles it. Fitness scores those candidates. The operators must fit the encoding, and the population size and stopping rule are tuned last.",
    },
  ]);

  B.add("l3-tsp", [
    {
      type: "slider",
      q: "Four towns sit along one straight road at 0 km, 2 km, 5 km and 6 km from the start. A courier visits them all once and returns to the first town. Roads run only along the line. What is the shortest round trip?",
      min: 0,
      max: 30,
      step: 1,
      start: 10,
      ans: 12,
      tol: 2,
      unit: "km",
      hint: "Going out to the far end and coming back covers the road twice. The farthest town is 6 km away.",
      why: "Any trip that visits both ends and returns must cover the whole 6 km span at least twice, so 12 km is the minimum. Going out in order, such as 0, 2, 5, 6 and straight home, achieves it: 2 + 3 + 1 + 6 = 12.",
    },
    {
      type: "cat",
      q: "Sort each item by which part of a TSP set-up it belongs to.",
      buckets: ["Encoding", "Fitness", "Mutation"],
      items: [
        ["A permutation of the city letters", 0],
        ["The total of all hop distances, including the return", 1],
        ["Swap two neighbouring cities in the string", 2],
        ["Shorter is better", 1],
        ["Every city appears exactly once in the string", 0],
        ["Reverse a short section of the string", 2],
      ],
      hint: "Encoding is how a tour is written, fitness is how it is scored, mutation is how it is changed.",
      why: "The permutation and the rule that each city appears once describe the encoding. The sum of hops and 'shorter is better' describe the fitness. Swapping or reversing part of the string are small changes to a tour, so they are mutations.",
    },
    {
      type: "order",
      q: "Put the steps for scoring a tour string into the right order.",
      items: [
        "Start at the first city in the string",
        "Add the distance of each hop to the next city in turn",
        "Add the hop from the last city back to the first",
        "Report the total as the fitness",
      ],
      hint: "The loop is only closed once the return hop is added.",
      why: "You walk along the string adding each hop, then close the loop with the return hop, and only then is the total ready. Forgetting the return hop would undercount every tour.",
    },
    {
      type: "bug",
      q: "This mutation should <b>swap</b> two cities and keep the tour valid, but it sometimes produces a string with a city twice. Click the faulty line.",
      code: [
        "def mutate(tour):",
        "    i = random.randrange(len(tour))",
        "    j = random.randrange(len(tour))",
        "    child = tour[:]",
        "    child[i] = tour[j]",
        "    return child",
      ],
      a: 4,
      hint: "After this line, where does the city that used to be at position i go?",
      why: "<code>child[i] = tour[j]</code> overwrites position i and nothing puts the old city there anywhere else, so city j now appears twice and city i vanishes. A swap needs two assignments: <code>child[i], child[j] = tour[j], tour[i]</code>.",
    },
    {
      type: "mcq",
      q: "A tour of 6 cities is stored as the string ACBEDF. How many hop distances are added up to score it?",
      o: ["5 hops", "6 hops", "7 hops", "12 hops"],
      a: 1,
      hint: "Count the hops between neighbours in the string, then the hop that closes the loop.",
      why: "Five hops join neighbouring letters in the string, and one more brings the courier back from F to A, so 6 in all. Counting only 5 would leave the loop open and undercount every tour.",
    },
    {
      type: "multi",
      q: "Which statements about scoring TSP tours are true? Select all that apply.",
      o: [
        "A shorter total distance is a better tour",
        "The hop from the last city back to the first counts",
        "Two strings for the same loop have the same fitness",
        "Fitness is the number of cities in the string",
        "A bigger total is better when the tour is longer",
      ],
      a: [0, 1, 2],
      hint: "Rotating or reversing a string does not move any road.",
      why: "TSP is a minimisation problem and the return hop is part of the loop. Strings that describe the same loop use the same hops, so they score the same. The number of cities is the same for every tour, so it cannot be the fitness.",
    },
  ]);

  B.add("l3-hc", [
    {
      type: "slider",
      q: "A hillclimber is run 3 times from random starts. Each run scores its start once, then tries 100 mutants, scoring each once. About how many fitness evaluations is that in total?",
      min: 0,
      max: 600,
      step: 10,
      start: 200,
      ans: 303,
      tol: 20,
      hint: "Each run is 1 + 100 = 101 evaluations. Three runs is about 3 × 100.",
      why: "Each run costs 1 + 100 = 101 evaluations, so three runs cost 3 × 101 = 303. Restarts spend the same evaluations as one long run, so they are only worth it if different starts reach different hills.",
    },
    {
      type: "pick",
      q: "Fitness is maximised. Each box shows the fitness of the hillclimber's <b>current</b> solution after that step. The rule is to accept a mutant if it is no worse. Click the step where the run could <b>not</b> have happened.",
      fig: steps([4, 6, 6, 7, 5, 7, 8]),
      a: ["s5"],
      hint: "Look for a step where the current fitness went down.",
      why: "Current fitness stays the same or rises when mutants are accepted only if no worse. A fall from 7 to 5 at step 5 is impossible. Staying at 6 on step 3 is fine, because an equal mutant is accepted.",
    },
    {
      type: "cat",
      q: "A basic hillclimber (it accepts equal mutants) is running on a rugged landscape. Sort each action by whether it ever does it.",
      buckets: ["It does this", "It never does this"],
      items: [
        ["Moves to a mutant that is better", 0],
        ["Moves to a mutant that is exactly as good", 0],
        ["Moves to a mutant that is worse", 1],
        ["Jumps to a different hill without being restarted", 1],
        ["Keeps only one solution at a time", 0],
      ],
      hint: "Remember the rule: no worse is accepted, worse is thrown away.",
      why: "The rule accepts better and equal mutants and rejects worse ones. With only small steps it cannot leave the hill it is on, and it holds just one current solution, like an EA with a population of one.",
    },
    {
      type: "bug",
      q: "This hillclimber should accept a mutant that is no worse than the <b>current</b> solution (fitness is maximised), but it behaves oddly after the first accepted move. Click the faulty line.",
      code: [
        "def hillclimb(c, steps):",
        "    fc = fitness(c)",
        "    for _ in range(steps):",
        "        m = mutate(c)",
        "        if fitness(m) >= fc:",
        "            c = m",
        "    return c",
      ],
      a: 5,
      hint: "After c changes, is fc still the score of c?",
      why: "When a mutant is accepted, <code>c</code> changes but <code>fc</code> still holds the starting score. Later mutants are then compared against the start, not the current solution, so worse ones can be accepted. Set <code>fc = fitness(m)</code> as well.",
    },
    {
      type: "multi",
      q: "A hillclimber is stuck on a local optimum. Which of these could lead it to a taller hill? Select all that apply.",
      o: [
        "Restarting from a new random solution",
        "Using a bigger mutation that can jump to another hill",
        "Running several climbers from different starts",
        "Running the same climber ten times longer",
        "Keeping a note of the best score seen so far",
      ],
      a: [0, 1, 2],
      hint: "Once nothing nearby is better, more of the same steps change nothing.",
      why: "Restarts, bigger jumps and several climbers all give the search a chance to land on a different hill. Running longer with the same small steps just repeats rejected moves, and merely noting the best score does not change where the climber goes.",
    },
    {
      type: "mcq",
      q: "Hillclimbing is described as an EA with a population of one. Which two boxes of the EA recipe no longer have any work to do?",
      o: [
        "Parent selection and crossover",
        "Fitness scoring and the mutation step",
        "Mutation and the replacement decision",
        "Population storage and fitness scoring",
      ],
      a: 0,
      hint: "With one solution there is no choice of parents and nobody to mix with.",
      why: "With one member there is nothing to choose between, so selection is empty, and crossover needs two parents. The climber still scores fitness, mutates a copy, and replaces the current solution if the mutant is no worse.",
    },
  ]);

  B.add("l3-landscape", [
    {
      type: "slider",
      q: "A landscape has 5 hills of equal width, and exactly one of them is the tallest. A hillclimber with small steps starts at a random point and climbs the hill it starts on. What is the chance, in per cent, that it reaches the tallest hill?",
      min: 0,
      max: 100,
      step: 5,
      start: 50,
      ans: 20,
      tol: 5,
      unit: "%",
      hint: "Each hill is equally likely to hold the start: 1 out of 5.",
      why: "With equal widths each hill catches one fifth of the starts, so the chance is 1 ÷ 5 = 20%. Wider hills catch more starts, which is why a narrow tall peak is hard to find.",
    },
    {
      type: "order",
      q: "Put the steps for drawing a fitness landscape in order.",
      items: [
        "Decide which solutions count as neighbours (one mutation apart)",
        "Line the solutions up so neighbours sit side by side",
        "Score every solution with the fitness function",
        "Plot each score as a height above its solution",
      ],
      hint: "You cannot line things up until you know who is next to whom.",
      why: "The neighbourhood comes from the mutation operator, so it is decided first. The layout and the scores then give the heights to plot. Change the mutation and the same problem gets a different landscape.",
    },
    {
      type: "cat",
      q: "Sort each landscape feature by how it affects a hillclimber that takes small steps.",
      buckets: ["Helps it", "Hurts it"],
      items: [
        ["Neighbours have similar fitness", 0],
        ["One broad peak", 0],
        ["Many narrow peaks of different heights", 1],
        ["A large flat plateau", 1],
        ["Slopes that lead away from the best solution", 1],
      ],
      hint: "Ask whether following the slope uphill leads to the best point.",
      why: "A smooth landscape with one broad peak means 'uphill' always points to the best. Many peaks trap it, a plateau gives no direction, and a deceptive slope sends it the wrong way.",
    },
    {
      type: "pick",
      q: "You can afford many hillclimber runs from random starts, each taking only small steps. Click the landscape where <b>restarting</b> helps the most.",
      fig: thumbs,
      a: ["B"],
      hint: "Restarts help when different starting points end up on different hills.",
      why: "B has many hills, so different starts reach different peaks and the best of them is likely to be good. On A one run is enough. On C the plateau gives no direction, so a restart just wanders until it stumbles onto the single spike.",
    },
    {
      type: "multi",
      q: "A landscape has a large flat plateau. Which statements are true for a hillclimber? Select all that apply.",
      o: [
        "The fitness gives no hint about which way to go",
        "A climber that accepts equal moves can drift across the plateau",
        "A climber that accepts only strictly better moves can get stuck on it",
        "A climber always leaves a plateau at once",
        "Each point on a plateau has a slightly different fitness",
      ],
      a: [0, 1, 2],
      hint: "On a plateau every neighbour scores the same.",
      why: "Equal fitness everywhere gives no direction. Accepting equal moves lets the climber wander until it finds an edge, but a strict climber rejects every neighbour and stops. If fitness varied slightly it would not be a plateau.",
    },
    {
      type: "mcq",
      q: "A landscape drawn for a problem looks jagged: fitness jumps up and down between solutions drawn next to each other. What is the most likely cause?",
      o: [
        "Its mutation reaches unrelated solutions",
        "There is only one peak in the landscape",
        "The population is too small for the search",
        "The fitness is always maximised, never minimised",
      ],
      a: 0,
      hint: "Neighbours are the solutions one mutation apart.",
      why: "Smoothness comes from small changes giving similar fitness. If a mutation changes things a lot, 'neighbours' are unrelated and the picture looks jagged. A single peak would look smooth, and population size does not alter the landscape.",
    },
  ]);
})();

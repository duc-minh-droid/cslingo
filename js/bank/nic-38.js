(function () {
  const B = NIC.bank;

  const line = (vals, extra) => vals.map((v, i) => `${30 + i * 44},${150 - v * 16}`).join(" ");
  const trace = `<svg viewBox="0 0 380 170" width="380" height="170" role="img" aria-label="Two lines over eight steps">
    <line x1="20" y1="150" x2="360" y2="150" stroke="var(--line-2)" stroke-width="2"/>
    <polyline points="${line([3, 5, 4, 6, 5, 7, 6, 6])}" fill="none" stroke="var(--violet)" stroke-width="4" stroke-linejoin="round"/>
    <polyline points="${line([3, 5, 5, 6, 6, 7, 7, 7])}" fill="none" stroke="var(--teal)" stroke-width="4" stroke-dasharray="8 5" stroke-linejoin="round"/>
    <text x="34" y="30" font-size="13" font-weight="800" fill="var(--text)">Line A is solid purple, line B is dashed green</text>
    <g data-pick="a"><polyline points="${line([3, 5, 4, 6, 5, 7, 6, 6])}" fill="none" stroke="transparent" stroke-width="18"/></g>
    <g data-pick="b"><polyline points="${line([3, 5, 5, 6, 6, 7, 7, 7])}" fill="none" stroke="transparent" stroke-width="6"/></g>
  </svg>`;

  const tour = (len, x, id) =>
    `<g data-pick="${id}"><rect x="${x}" y="40" width="58" height="52" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${x + 29}" y="72" text-anchor="middle" font-size="18" font-weight="900" fill="var(--text)">${len}</text></g>`;
  const members = `<svg viewBox="0 0 400 130" width="400" height="130" role="img" aria-label="Five tour lengths in a population">
    <text x="10" y="22" font-size="13" font-weight="800" fill="var(--text)">Population of tour lengths. New mutant: length 30</text>
    ${tour(28, 10, "t1")}${tour(33, 90, "t2")}${tour(31, 170, "t3")}${tour(36, 250, "t4")}${tour(29, 330, "t5")}
  </svg>`;

  B.add("l3-neighbourhood", [
    {
      type: "slider",
      q: "Solutions are 5-bit strings and one mutation flips exactly one bit. What is the fewest mutations needed to turn 10110 into 01101?",
      min: 0,
      max: 8,
      step: 1,
      start: 2,
      ans: 4,
      tol: 0,
      unit: "moves",
      hint: "Line the strings up and count the positions where they differ. Each move can fix one of them.",
      why: "Compare position by position: 1/0, 0/1, 1/1, 1/0, 0/1. Four positions differ and one move repairs one position, so you need 4 moves. The neighbourhood is a map of one-step moves, and distance is how many steps you walk across it.",
    },
    {
      type: "bug",
      q: "This function should list every bit-flip neighbour of a bit list, but its answers come out wrong: every neighbour is the same list and it ends up fully flipped. Click the faulty line.",
      code: [
        "def neighbours(bits):",
        "    result = []",
        "    for i in range(len(bits)):",
        "        child = bits",
        "        child[i] = 1 - child[i]",
        "        result.append(child)",
        "    return result",
      ],
      a: 3,
      hint: "Does child get its own copy of the list, or just a second name for the same list?",
      why: "child = bits gives a second name to the same list, so every flip changes the original and every entry in the result is the same object. It should be child = list(bits) (or bits.copy()), so each neighbour is a fresh copy with exactly one bit changed.",
    },
    {
      type: "order",
      q: "Put the check for whether a solution s is a local optimum in order.",
      items: [
        "List every mutant of s, which is its neighbourhood",
        "Work out the fitness of each neighbour",
        "Compare each neighbour's fitness with the fitness of s",
        "If none of them is better, s is a local optimum",
      ],
      hint: "You cannot score the neighbours until you have listed them, and you cannot decide until you have compared.",
      why: "The neighbourhood comes from the operator, so list it first, score it, then compare. Only when no neighbour beats s is it a local optimum. A better neighbour means s is not one, even if s is quite good overall.",
    },
    {
      type: "match",
      q: "Match each term to what it means in local search.",
      pairs: [
        ["Mutation operator", "The rule for making a small change to a solution"],
        ["Neighbourhood", "Every solution one mutation away from the current one"],
        ["Local optimum", "A solution with no better neighbour"],
        ["Global optimum", "The best solution in the whole search space"],
      ],
      hint: "One term is a rule, two are about neighbours, and one is about everything.",
      why: "The operator is the rule for a small change. The neighbourhood is everything that rule can reach in one go. A local optimum beats only its neighbours, while the global optimum beats every solution.",
    },
    {
      type: "mcq",
      q: "A steepest-ascent hillclimber checks every neighbour before each move, and each check costs 1 unit. You have 1000 units. Operator X gives each solution 10 neighbours and operator Y gives 200. About how many moves can each make?",
      o: [
        "X about 100 moves, Y about 5 moves",
        "X about 10 moves, Y about 200 moves",
        "X about 100 moves, Y about 50 moves",
        "X about 5 moves, Y about 100 moves",
      ],
      a: 0,
      hint: "Moves = budget ÷ neighbours checked per move: 1000 ÷ 10 and 1000 ÷ 200.",
      why: "1000 ÷ 10 = 100 moves for X and 1000 ÷ 200 = 5 moves for Y. A huge neighbourhood has fewer local optima, but every step costs far more to search, so the same budget buys far fewer steps.",
    },
    {
      type: "cat",
      q: "Solutions are the bit strings 00, 01, 10 and 11, and a neighbour is one bit flip away. Fitness (higher is better): 00 scores 3, 01 scores 5, 10 scores 4, 11 scores 1. Sort each string.",
      buckets: ["Global optimum", "Local optimum only", "Not an optimum"],
      items: [
        ["01", 0],
        ["10", 1],
        ["00", 2],
        ["11", 2],
      ],
      hint: "00 has neighbours 01 and 10. 01 has neighbours 00 and 11. 10 has neighbours 00 and 11. 11 has neighbours 01 and 10.",
      why: "01 (5) beats its neighbours 00 (3) and 11 (1), and nothing in the whole space scores higher, so it is global. 10 (4) beats its neighbours 00 (3) and 11 (1) but not the far-away 01, so it is only a local optimum. 00 has the better neighbours 01 and 10, and 11 has the better neighbours 01 and 10, so neither is an optimum.",
    },
  ]);

  B.add("l3-local", [
    {
      type: "order",
      q: "Put one step of Monte Carlo search in order.",
      items: [
        "Pick one random neighbour",
        "Compare its fitness with the current solution",
        "If it is better, move there. If it is worse, roll a die and move only with probability p",
        "Update the best-so-far if the new current solution beats it",
      ],
      hint: "You cannot compare a neighbour until you have picked one, and the best-so-far check comes after the move.",
      why: "The neighbour comes first, then the comparison. Better moves are always accepted, worse ones only with probability p. Last, the best-so-far is checked, because the current solution is allowed to get worse but the remembered best never is.",
    },
    {
      type: "cat",
      q: "A Monte Carlo search maximises fitness. Its current solution scores 10 and it picks one random neighbour. Sort each neighbour by how the search treats it.",
      buckets: ["Always accepted", "Accepted only with probability p"],
      items: [
        ["Neighbour scores 15", 0],
        ["Neighbour scores 11", 0],
        ["Neighbour scores 20", 0],
        ["Neighbour scores 9", 1],
        ["Neighbour scores 6", 1],
        ["Neighbour scores 2", 1],
      ],
      hint: "Higher is better here. Better neighbours need no die roll.",
      why: "Anything above 10 is an improvement, so it is accepted at once. Anything below 10 is worse, so the search only moves there when its die roll succeeds (probability p). That occasional step down is how it escapes a peak.",
    },
    {
      type: "bug",
      q: "This Monte Carlo search maximises fitness. It should always accept a better neighbour and accept a worse one only with probability p, but in practice it drifts downhill almost every step. Click the faulty line.",
      code: [
        "current = start",
        "best = start",
        "for step in range(300):",
        "    m = random_neighbour(current)",
        "    if fitness(m) < fitness(current) or random() < p:",
        "        current = m",
        "    if fitness(current) > fitness(best):",
        "        best = current",
        "return best",
      ],
      a: 4,
      hint: "Which way does the comparison point? A better neighbour should be accepted without a die roll.",
      why: "The test accepts a neighbour whenever it is worse (fitness(m) < fitness(current)), and a better one only by luck. It should read fitness(m) > fitness(current) or random() < p. The best-so-far tracking and the return are fine.",
    },
    {
      type: "bug",
      q: "This tabu search sometimes returns a worse tour than it found earlier in the run. Click the faulty line.",
      code: [
        "current = start",
        "best = start",
        "for step in range(200):",
        "    options = [n for n in neighbours(current) if n not in tabu]",
        "    current = min(options, key=length)",
        "    tabu.append(current)",
        "    if length(current) < length(best):",
        "        best = current",
        "return current",
      ],
      a: 8,
      hint: "Tabu search is allowed to end up on a worse solution. What has the code been keeping track of the whole time?",
      why: "The loop does track best, but the last line returns current, which may be a worse tour because tabu search is forced to keep moving. It should return best.",
    },
    {
      type: "mcq",
      q: "A tabu search forbids only the last 1 solution it visited. It sits on a peak P whose neighbours are a lower solution R and a lower solution S, and moves to R. R's neighbours are P and a still lower solution T. Where does it go next?",
      o: [
        "T, because P is banned",
        "P, because it is the best neighbour",
        "Nowhere, because no neighbour is better",
        "It picks R or T at random",
      ],
      a: 0,
      hint: "Tabu search takes the best neighbour that is not banned. Is P allowed?",
      why: "P was just visited, so it is tabu. The best allowed neighbour of R is T, and tabu search moves there even though it is worse. This is how it is forced down and away from the peak instead of bouncing back up.",
    },
    {
      type: "pick",
      q: "A search maximises fitness and plots two lines over 8 steps: the fitness of its current solution, and the best fitness it has found so far. Click the best-so-far line.",
      fig: trace,
      a: "b",
      hint: "Which line can only stay level or go up?",
      why: "The best-so-far never falls, so it moves up and stays flat like a staircase, which is the dashed green line. The purple line dips because local search is allowed to accept worse moves, so its current solution goes up and down.",
    },
  ]);

  B.add("l3-population", [
    {
      type: "pick",
      q: "A steady-state EA minimises tour length. The population holds the five tours shown. A mutant of length 30 arrives and replaces the worst member if it is shorter. Click the member it replaces.",
      fig: members,
      a: "t4",
      hint: "Worst means longest. Is 30 shorter than it?",
      why: "The longest tour, 36, is the worst member, and the mutant (30) beats it, so it is replaced. The better tours stay as parents for later steps.",
    },
    {
      type: "order",
      q: "Put one step of a steady-state EA in order.",
      items: [
        "Select a parent, biased towards the fitter members",
        "Mutate the parent to make a mutant",
        "Work out the mutant's fitness",
        "If the mutant beats the worst member, it takes the worst member's place",
      ],
      hint: "You need a parent before you can mutate, and a score before you can compare.",
      why: "Selection chooses the parent, mutation makes the child, and only then can its fitness be compared with the weakest member. Replacing the worst keeps the population improving without throwing away the good ones.",
    },
    {
      type: "cat",
      q: "A population method adds selection and recombination to what local search has. Sort each description.",
      buckets: ["Selection", "Recombination", "Mutation"],
      items: [
        ["Fitter tours get a bigger chance of being copied", 0],
        ["Decides which members become parents", 0],
        ["Needs two parents", 1],
        ["The child takes its head from one parent and its tail from the other", 1],
        ["Flips a bit in a single parent", 2],
        ["Works on one solution at a time", 2],
      ],
      hint: "Ask: is this about choosing, mixing, or changing one solution?",
      why: "Selection chooses parents, biased towards fitness. Recombination needs at least two parents and mixes their genes. Mutation changes one solution and is all that local search ever had.",
    },
    {
      type: "slider",
      q: "An EA has a population of 20 and a budget of 500 fitness evaluations. Scoring the starting population uses 20 evaluations, then each steady-state step creates one mutant and scores it. About how many steps can it run?",
      min: 0,
      max: 600,
      step: 20,
      start: 300,
      ans: 480,
      tol: 20,
      unit: "steps",
      hint: "Subtract the evaluations spent on the start: 500 − 20.",
      why: "The first 20 evaluations are spent scoring the initial population, leaving 500 − 20 = 480 steps of one evaluation each. A population has a set-up cost that a single hillclimber (one evaluation to start) does not.",
    },
    {
      type: "mcq",
      q: "In a population, one member has fitness 90 and the other three have fitness 10. The EA always picks the fittest member as the parent every time. What is the likely result?",
      o: [
        "Everyone soon descends from one member and diversity collapses",
        "The population keeps exploring many hills at once for longer than usual",
        "The three weaker members slowly overtake the strongest one",
        "Recombination becomes impossible because only one parent exists",
      ],
      a: 0,
      hint: "Think about who gets to leave offspring if the same member is always chosen.",
      why: "If only the best is ever chosen, its descendants soon replace everyone else, and the population converges on one hill, possibly too soon. Selection should be biased towards the fit, not exclusive, so weaker members still get a chance to develop.",
    },
    {
      type: "multi",
      q: "Parent A is 11000 and parent B is 00111. A child takes the head of A and the tail of B, joined at one cut point (the cut can be after position 1, 2, 3 or 4). Select every child that can be made.",
      o: ["11111", "10111", "11011", "01111", "11100", "10101"],
      a: [0, 1, 2],
      hint: "Write each child as head of A + tail of B. For example, a cut after position 1 gives 1 + 0111.",
      why: "The cuts give 1 + 0111 = 10111, 11 + 111 = 11111, 110 + 11 = 11011 and 1100 + 1 = 11001. The child 01111 would start with B's head, 11100 does not match B's tail after any cut, and 10101 matches neither parent's pattern. Recombination only mixes what the parents already carry.",
    },
  ]);
})();

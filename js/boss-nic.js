/* Nature-Inspired boss quizzes — fresh scenarios, new numbers, mixed formats. Every number verified by hand/node. */
(function () {
  const N = NIC,
    Qf = N.qfig;
  const bump = (x, c, s, a) => a * Math.exp(-((x - c) ** 2) / (2 * s * s));
  const land = (x) => 0.1 + bump(x, 0.2, 0.05, 0.5) + bump(x, 0.45, 0.06, 0.7) + bump(x, 0.8, 0.07, 1);

  /* ================= Lecture 1 ================= */
  N.registerBoss({
    id: "l1-boss",
    lecture: 1,
    title: "Lecture 1 boss quiz",
    blurb: "Eight questions: apply the big ideas to problems you haven't seen yet.",
    lede: "No definitions to recite. Each question gives you a new situation and asks what the Lecture 1 ideas predict.",
    qs: [
      {
        type: "cat",
        q: "A consultancy wants to try evolutionary algorithms on these jobs. Which application category does each belong to?",
        buckets: ["Planning", "Design", "Identification", "Control", "Classification"],
        items: [
          ["Allocate 40 nurses to hospital shifts for next month", 0],
          ["Choose the shape of a wind-turbine blade", 1],
          ["Find an equation that reproduces 10 years of river-level readings", 2],
          ["Adjust a drone's motors many times a second to stay level in gusts", 3],
          ["Decide whether an X-ray shows a fracture", 4],
        ],
        why: "Planning = arranging resources over time; Design = choosing a structure; Identification = finding a model that matches data; Control = producing actions for a live system; Classification = assigning a label.",
      },
      {
        type: "mcq",
        q: "A monkey types random strings over a 27-key keyboard. Its target sentence gets <b>one character longer</b>. By what factor does its expected number of attempts grow?",
        o: ["2 (one more guess)", "27", "28", "27 × 27 = 729"],
        a: 1,
        why: "Each position is an independent 1-in-27 chance, so every extra character multiplies the search space (and the expected wait) by <b>27</b>. That exponential blow-up is why random guessing is hopeless.",
      },
      {
        type: "mcq",
        q: "Two strategies race to evolve a 30-character target. Strategy X changes one random letter and <i>always</i> keeps the change. Strategy Y changes one letter and keeps it only if the match count doesn't drop. Which one converges, and why?",
        o: [
          "X, because it tries more changes and so explores more ground",
          "Y: it keeps progress, while X forgets good letters",
          "Both, at about the same speed, since each changes one letter",
          "Neither can ever reach the target",
        ],
        a: 1,
        why: "Without a selection step, X's changes are unbiased, so correct letters get overwritten as often as wrong ones get fixed. <b>Keeping only non-worse changes</b> is what turns randomness into cumulative progress.",
      },
      {
        type: "order",
        q: "Put one generation of a typical EA in order.",
        items: [
          "Score every individual with the fitness function",
          "Pick parents, biased towards higher fitness",
          "Recombine pairs of parents into children",
          "Apply small random mutations to the children",
          "Form the next population from the survivors",
        ],
        why: "Evaluate → select → recombine → mutate → update the population. Then repeat with the new generation.",
      },
      {
        type: "mcq",
        q: "An engineer's \"EA\" keeps 50 candidates, but every generation it copies the <b>single best</b> 50 times and mutates the copies. Which of the lecture's ingredients has it broken?",
        o: [
          "It has no population",
          "Selection is far too strongly biased",
          "It has no mutation",
          "Recombination is required and missing",
        ],
        a: 1,
        why: "It technically has a population and mutation, but selection is <b>maximally</b> greedy. The lecture wants a <i>weak</i> bias, so diversity survives long enough to explore.",
      },
      {
        type: "multi",
        q: "Which of these could an EA tackle <b>directly</b>, given only what's described? Select all that apply.",
        o: [
          "Designing a bridge truss, where a physics simulator returns a stress score for any design",
          "Scheduling exams, where you can count the clashes in any timetable",
          'Guessing a stranger\'s PIN, where the lock only says "right" or "wrong"',
          "Tuning a racing car set-up, where a simulator reports the lap time",
        ],
        a: [0, 1, 3],
        why: 'An EA needs a <b>graded</b> fitness, so it can tell "better" from "worse". A lock that only says right or wrong gives no gradient, so selection has nothing to work with. That\'s a needle in a haystack.',
      },
      {
        type: "match",
        q: "Match each natural system to the computing idea it inspired.",
        pairs: [
          ["Ants reinforcing short trails with pheromone", "Shortest-path and routing heuristics"],
          ["Neurons strengthening useful connections", "Learning to recognise patterns from examples"],
          ["Variation plus survival over generations", "Improving designs by breed-and-select"],
          ["Birds keeping formation from local rules", "Swarm search where agents follow neighbours"],
        ],
        why: "Collective behaviour gives ant-colony and swarm methods, brains give neural networks, and evolution gives evolutionary algorithms.",
      },
      {
        type: "mcq",
        q: "A car-design EA spends 99% of its runtime in one step. Which step is the most likely culprit?",
        o: ["Selecting parents", "Mutating genes", "Evaluating fitness", "Replacing the population"],
        a: 2,
        why: "Selection and mutation are cheap bookkeeping. <b>Fitness evaluation</b> is where the real-world cost sits (a simulation, an experiment, a build), so the number of evaluations is the budget that matters.",
      },
    ],
  });

  /* ================= Lecture 2 ================= */
  N.registerBoss({
    id: "l2-boss",
    lecture: 2,
    title: "Lecture 2 boss quiz",
    blurb: "Eight questions: search spaces, hardness, greedy vs exact, with fresh numbers.",
    lede: "New numbers and new problems. Have pen and paper ready for two of them.",
    qs: [
      {
        type: "mcq",
        q: "Parcels weigh 30, 45, 55 and 70 kg. You want a subset as close as possible to <b>118 kg</b> (minimise |weight − 118|). Which subset wins, and with what score?",
        o: [
          "55 + 70 = 125, score 7",
          "45 + 70 = 115, score 3",
          "30 + 45 + 55 = 130, score 12",
          "30 + 70 = 100, score 18",
        ],
        a: 1,
        hint: "Pairs are the interesting cases. Which pair sums closest to 118?",
        why: "45 + 70 = 115 gives |115 − 118| = <b>3</b>. The next best is 55 + 70 = 125 (score 7). With only 4 items, all 16 subsets can be checked.",
      },
      {
        type: "order",
        q: "Order these search-space sizes from <b>smallest</b> to <b>largest</b>.",
        items: [
          "40² (pairs of 40 items)",
          "10¹² (a trillion)",
          "2⁴⁰ (subsets of 40 items)",
          "40! (orderings of 40 items)",
        ],
        why: "40² = 1,600. 2⁴⁰ ≈ 1.1 × 10¹², which is just above a trillion. 40! ≈ 8 × 10⁴⁷. Orderings explode far faster than subsets.",
      },
      {
        type: "slider",
        q: "A brute-force search checks all 2ⁿ subsets at a billion per second. What's the <b>largest n</b> it can finish within one day?",
        min: 10,
        max: 100,
        step: 1,
        start: 60,
        ans: 46,
        tol: 2,
        hint: "A billion ≈ 2³⁰, and a day ≈ 86,400 s ≈ 2¹⁶ (65,536) with a bit to spare. Drag and watch the time readout.",
        live: (n) => {
          const secs = 2 ** n / 1e9;
          const t =
            secs < 60
              ? `${secs.toFixed(1)} seconds`
              : secs < 3600
                ? `${(secs / 60).toFixed(1)} minutes`
                : secs < 86400
                  ? `${(secs / 3600).toFixed(1)} hours`
                  : secs < 3.15e7
                    ? `${(secs / 86400).toFixed(1)} days`
                    : secs < 3.15e13
                      ? `${Math.round(secs / 3.15e7).toLocaleString()} years`
                      : `${(secs / 3.15e7).toExponential(1).replace("e+", " × 10^")} years`;
          return `<div class="callout ${secs <= 86400 ? "teal" : "rose"}" style="margin:0">n = ${n} → 2<sup>${n}</sup> checks ≈ <b>${t}</b></div>`;
        },
        why: "One day = 86,400 s × 10⁹ = 8.6 × 10¹³ checks, and log₂ of that is about 46.3. So n ≈ 46. Each extra item doubles the time, so n = 56 would take about 3 years.",
      },
      {
        type: "cat",
        q: "Is a fast, <b>exact</b> (polynomial-time) algorithm known for each problem?",
        buckets: ["Easy (polynomial)", "Hard (none known)"],
        items: [
          ["Sort 1 million song titles", 0],
          ["Cheapest cable network joining 200 towns", 0],
          ["Same network, but no town may have more than 2 cables", 1],
          ["Shortest round trip visiting 200 towns once each", 1],
          ["Fastest route between two towns on a road map", 0],
          ["Exam timetable with zero clashes for 500 exams", 1],
        ],
        why: "Sorting, MST and single shortest paths all have polynomial algorithms. Degree-constrained MST, travelling salesperson and clash-free timetabling have no known fast exact algorithm.",
      },
      {
        type: "pick",
        q: "Prim's algorithm has built the tree {A, B} so far. <b>Click the edge it adds next.</b>",
        fig: Qf.graph(
          { A: [60, 130], B: [180, 50], C: [200, 200], D: [330, 110], E: [420, 210] },
          [
            ["A", "B", 2],
            ["A", "C", 6],
            ["B", "C", 5],
            ["B", "D", 4],
            ["C", "D", 3],
            ["C", "E", 8],
            ["D", "E", 7],
          ],
          { pick: "edges", hl: { A: "var(--teal)", B: "var(--teal)", "A-B": "var(--teal)" } },
        ),
        a: "B-D",
        why: "Only edges that leave the tree count: A–C (6), B–C (5), B–D (4). The cheapest is <b>B–D (4)</b>. C–D (3) is cheaper, but neither end is in the tree yet.",
      },
      {
        type: "mcq",
        q: "Your EA's best fitness shoots up for 5 generations, then flatlines at a mediocre value. Every individual now looks the same. What's the most likely cause?",
        o: [
          "The population is too large",
          "Selection is too greedy",
          "Mutation is too disruptive",
          "The fitness function is too slow",
        ],
        a: 1,
        why: '"Fast then stuck, all identical" is the fingerprint of <b>too much selection pressure</b>. Nearly random selection shows the opposite: slow, wandering progress.',
      },
      {
        type: "match",
        q: "Match each population-update rule to its consequence.",
        pairs: [
          ["Children replace the entire population", "The best solution can be lost between generations"],
          ["Merge parents and children, keep the best", "The best is never lost, but diversity can drain quickly"],
          [
            "One child at a time replaces a weak member",
            "The population changes gradually and good children are used at once",
          ],
        ],
        why: "Replacing everything throws away the best unless you add elitism. Keep-the-best is elitist but greedy. Steady-state replacement changes the population one member at a time.",
      },
      {
        type: "mcq",
        q: "An EA finds a delivery route of 412 km. A proven lower bound says no route can be shorter than 400 km. What can you honestly claim?",
        o: [
          "The route is optimal",
          "The route is at most 3% longer than optimal",
          "Nothing at all, since EAs have no guarantees",
          "The optimum is exactly 406 km",
        ],
        a: 1,
        why: "The EA alone guarantees nothing. But combined with a valid bound, the optimum lies between 400 and 412, so your route is within <b>12/400 = 3%</b> of it. This is how approximate results get judged in practice.",
      },
    ],
  });

  /* ================= Lecture 3 ================= */
  N.registerBoss({
    id: "l3-boss",
    lecture: 3,
    title: "Lecture 3 boss quiz",
    blurb: "Nine questions: new tours, a landscape to read, a buggy hillclimber.",
    lede: "Use the distance matrix below. Every tour here is new, so work each one out rather than recalling the lecture's.",
    matrix: true,
    qs: [
      {
        type: "mcq",
        q: "What is the length of the round trip <code>ABDCE</code>?",
        o: ["28", "31", "33", "38"],
        a: 2,
        why: "A–B 5 + B–D 4 + D–C 2 + C–E 7 + E–A 15 = <b>33</b>.",
      },
      {
        type: "mcq",
        q: "Hillclimbing uses adjacent swaps (the ends of the string also count as adjacent). The current tour is <code>ABDCE</code> (33). Is it a local optimum?",
        o: [
          "Yes: no single swap improves it",
          "No: swapping the first two cities gives <code>BADCE</code> = 28",
          "No: but only a non-adjacent swap improves it",
          "It can't be judged without the global optimum",
        ],
        a: 1,
        hint: "Try swapping A and B.",
        why: "BADCE = B–A 5 + A–D 4 + D–C 2 + C–E 7 + E–B 10 = <b>28</b>, which is shorter, so HC moves on. (28 turns out to be the global best on this map.)",
      },
      {
        type: "mcq",
        q: "How many <b>distinct</b> round trips exist for 7 cities (same loop from another start, or reversed, counts as the same)?",
        o: ["720 (6!)", "360", "2,520 (7! / 2)", "5,040 (7!)"],
        a: 1,
        why: "(k − 1)! / 2 = 6! / 2 = 720 / 2 = <b>360</b>.",
      },
      {
        type: "pick",
        q: "A hillclimber starts at the red dot and only accepts uphill (no-worse) steps of a small size. <b>Click the point where it ends up.</b>",
        fig: Qf.curve(
          land,
          [
            [0.2, "A"],
            [0.45, "B"],
            [0.62, "C"],
            [0.8, "D"],
          ],
          { sx: 0.36, label: "every possible solution →  (higher = fitter)" },
        ),
        a: "B",
        why: "From the red dot the only uphill direction is right, towards <b>B</b>. At B every small step goes down, so it stops there, even though D is higher. That's a local optimum.",
      },
      {
        type: "mcq",
        q: "Mutation now swaps <b>any</b> two cities (not just neighbours). How many neighbours does a 6-city tour have?",
        o: ["6", "12", "15", "30"],
        a: 2,
        why: "Choose any 2 of the 6 positions: C(6,2) = 6 × 5 / 2 = <b>15</b>. A bigger neighbourhood than adjacent swaps (6), so fewer local optima, but each step costs more to search.",
      },
      {
        type: "cat",
        q: "Which search method matches each behaviour?",
        buckets: ["Hillclimbing", "Monte Carlo", "Tabu search", "Population EA"],
        items: [
          ["Tries one random neighbour; moves only if it's no worse", 0],
          ["Tries one random neighbour; sometimes moves even if it's worse", 1],
          ["Examines all neighbours and always moves to the best one not recently visited", 2],
          ["Keeps many candidates and breeds new ones from the fitter ones", 3],
        ],
        why: "HC never goes downhill. Monte Carlo goes downhill with probability p. Tabu always moves (even downhill) but bans recent spots. A population EA adds selection and recombination.",
      },
      {
        type: "bug",
        q: "This hillclimber is supposed to <b>minimise</b> tour length, but it wanders aimlessly. Click the faulty line.",
        code: [
          "c = random_tour()",
          "for step in range(10000):",
          "    m = swap_two_adjacent(copy(c))",
          "    if length(m) >= length(c):",
          "        c = m",
          "return c",
        ],
        a: 3,
        why: "For minimisation, the move should be accepted when <code>length(m) &lt;= length(c)</code>. With <code>&gt;=</code> it accepts only equal-or-<b>longer</b> tours, so it climbs the wrong way.",
      },
      {
        type: "mcq",
        q: "Steady-state EA, replace-worst, <b>minimising</b>. Population lengths: 31, 29, 35, 30, 33. A new child has length 34. What happens?",
        o: [
          "It replaces the 29",
          "It replaces the 35",
          "It's discarded because 34 is worse than the average",
          "It replaces the 33",
        ],
        a: 1,
        why: "When minimising, the worst member is the <b>longest</b>: 35. The child (34) is better than that, so it takes its place.",
      },
      {
        type: "mcq",
        q: "Two landscapes. On landscape R, neighbouring solutions have unrelated fitness. On landscape S, neighbours have similar fitness. Where will hillclimbing do better than random sampling?",
        o: [
          "R: random neighbours give it more to explore",
          "S: local smoothness is exactly what hillclimbing exploits",
          "Both the same, since hillclimbing only compares",
          "Neither: hillclimbing never beats random search",
        ],
        a: 1,
        why: 'Hillclimbing assumes "near a good solution is probably another good one". On R that\'s false, so HC is no better than random guessing.',
      },
    ],
  });

  /* ================= Lecture 4 ================= */
  N.registerBoss({
    id: "l4-boss",
    lecture: 4,
    title: "Lecture 4 boss quiz",
    blurb: "Nine questions: selection maths with new numbers, crossover by hand, diagnosing broken GAs.",
    lede: "Selection probabilities, operators and diagnosis, all with numbers you haven't seen yet. Pen and paper for the first four.",
    qs: [
      {
        type: "mcq",
        q: "Roulette-wheel selection, fitnesses 3, 5 and 12. What's the probability of selecting the fitness-12 individual?",
        o: ["0.4", "0.5", "0.6", "0.75"],
        a: 2,
        why: "12 / (3 + 5 + 12) = 12/20 = <b>0.6</b>.",
      },
      {
        type: "mcq",
        q: "Linear rank selection, population of <b>5</b> with distinct fitnesses. What's the probability the best is picked?",
        o: ["1/5 = 0.2", "1/3 ≈ 0.33", "1/2 = 0.5", "5/10 = 0.5"],
        a: 1,
        why: "Ranks 1…5 sum to 15, so the best gets 5/15 = <b>1/3 ≈ 0.333</b>, whatever the actual fitness values are.",
      },
      {
        type: "mcq",
        q: "Tournament selection with t = 3 (with replacement) from a population of 5. What's the probability the best individual wins a tournament?",
        o: ["about 0.2", "about 0.5", "about 0.8", "1 (it always wins)"],
        a: 1,
        hint: "Work out the chance it's missed all three times: (4/5)³. 0.8 × 0.8 = 0.64, and 0.64 × 0.8 is about 0.5.",
        why: "It wins if it's drawn at least once: 1 − (4/5)³ = 1 − 0.512 ≈ <b>0.49, about a half</b>.",
      },
      {
        type: "mcq",
        q: "Population of 10. What's the <b>smallest</b> tournament size t that gives the best individual at least a 50% chance of winning?",
        o: ["3", "7", "15", "30"],
        a: 1,
        hint: "The best is missed every draw with chance 0.9ᵗ; you need that below 0.5. Anchors: 0.9² ≈ 0.8, 0.9⁴ ≈ 0.66, 0.9⁸ ≈ 0.43. So t is between 5 and 8.",
        why: "0.9⁶ ≈ 0.53 is still above a half, 0.9⁷ ≈ 0.48 is below it, so <b>t = 7</b>. Tournament size is a dial for selection pressure.",
      },
      {
        type: "mcq",
        q: "Two-point crossover with cuts after gene 2 and gene 5. P1 = <code>10110010</code>, P2 = <code>01001101</code>. The child takes P1's outer parts and P2's middle. What is it?",
        o: ["<code>10001010</code>", "<code>10110101</code>", "<code>01110010</code>", "<code>10001101</code>"],
        a: 0,
        why: "P1 head <code>10</code> + P2 middle (genes 3–5) <code>001</code> + P1 tail (genes 6–8) <code>010</code> = <b>10001010</b>.",
      },
      {
        type: "cat",
        q: "Does each operator keep the solution valid for its encoding?",
        buckets: ["Keeps it valid", "Can break it"],
        items: [
          ["Swap two genes in a city-order permutation", 0],
          ["Flip one bit in a city-order permutation", 1],
          ["Add small Gaussian noise to a vector of real weights", 0],
          ["1-point crossover of two city-order permutations", 1],
          ["Flip one bit in a binary feature mask", 0],
          ["Set one gene of a permutation to a random city", 1],
        ],
        why: "Permutations need every city exactly once. Swap preserves that; bit flips, random resets and naive 1-point crossover can duplicate or drop cities.",
      },
      {
        type: "mcq",
        q: "Roulette selection, fitnesses 1, 2 and 3, so the best has probability 0.5. You add 10 to every fitness. What happens to the best's probability?",
        o: [
          "Stays at 0.5, because the order is unchanged",
          "Rises, because every fitness got bigger",
          "Drops to about 0.36",
          "Drops to 0, because the gaps vanish",
        ],
        a: 2,
        why: "13 / (11 + 12 + 13) = 13/36 ≈ <b>0.36</b>. Roulette depends on the absolute values, so shifting fitness changes the selection pressure. Rank and tournament would be unaffected.",
      },
      {
        type: "match",
        q: "Match each symptom to the most likely diagnosis.",
        pairs: [
          ["Population becomes identical within a few generations", "Too much selection pressure"],
          ["Fitness drifts randomly and never really improves", "Too little selection pressure"],
          ["The best fitness sometimes drops between generations", "Generational GA without elitism"],
          ["When minimising tour length, the longest tours breed the most", "Roulette used on raw cost values"],
        ],
        why: "Pressure too high collapses diversity; too low gives no direction. A drop in best fitness means the best wasn't protected. Raw costs on a roulette wheel reward the worst when minimising.",
      },
      {
        type: "order",
        q: "Order one iteration of a steady-state GA with tournament selection and replace-worst.",
        items: [
          "Run a tournament to pick a parent",
          "Copy the parent and mutate the copy",
          "Evaluate the child's fitness",
          "Find the current worst member",
          "Replace the worst with the child if the child is no worse",
        ],
        why: "Select → vary → evaluate → locate the worst → conditionally replace. Then loop until the evaluation budget runs out.",
      },
    ],
  });
})();

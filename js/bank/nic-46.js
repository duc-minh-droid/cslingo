/* Revision bank, Lecture 8 (ant colony detail): l8-loop, l8-transition, l8-update. */
(function () {
  const B = NIC.bank;
  const M = (q, right, wrong, why, x = {}) => ({ type: "mcq", q, o: [right, ...wrong], a: 0, why, ...x });
  /** Pick cards: items [[id, line 1, line 2]] drawn as boxes with data-pick. */
  const cards = (head, items) => {
    const w = 118;
    const g = items
      .map(
        ([id, a, b], i) =>
          `<g data-pick="${id}" style="cursor:pointer"><rect x="${8 + i * (w + 8)}" y="34" width="${w}" height="64" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/><text x="${8 + i * (w + 8) + w / 2}" y="58" text-anchor="middle" font-size="13" font-weight="800" fill="var(--text)">${a}</text><text x="${8 + i * (w + 8) + w / 2}" y="80" text-anchor="middle" font-size="12" fill="var(--text)">${b}</text></g>`,
      )
      .join("");
    return `<svg viewBox="0 0 ${8 + items.length * (w + 8)} 112" style="width:100%;max-width:${items.length * 126}px"><text x="8" y="20" font-size="12" font-weight="800" fill="var(--text)">${head}</text>${g}</svg>`;
  };

  B.add("l8-loop", [
    M(
      "An ant colony is mid-iteration: the ants are still walking their tours. What is happening to the pheromone on the edges?",
      "Nothing yet; it is updated once every ant has finished",
      [
        "It is updated after every single step of every ant",
        "It is reset to zero at the start of the iteration",
        "It evaporates a little after each step",
      ],
      "In the Ant System the update is a separate stage after all the ants have completed their tours.",
    ),
    {
      type: "order",
      q: "Put one iteration of the Ant System into order.",
      items: [
        "Place the ants on random cities",
        "Each ant picks its next city with the transition rule",
        "Repeat the step until every ant has visited all cities",
        "Update the pheromone on the edges",
        "Test the end condition",
      ],
      why: "Ants are placed, take num_city steps each, and only then does the pheromone update. The loop ends when the end condition is met.",
    },
    {
      type: "cat",
      q: "Which of these is forgotten when a new iteration starts, and which is carried forward?",
      buckets: ["Forgotten", "Carried forward"],
      items: [
        ["The towns ant 4 visited on this tour", 0],
        ["Pheromone on the road between two towns", 1],
        ["Which town each ant started on", 0],
        ["The shortest round found so far", 1],
        ["How many steps ant 7 has taken", 0],
      ],
      why: "Everything about an ant's own tour (its tabu list, start and step count) resets. The pheromone and the best round so far persist.",
    },
    {
      type: "slider",
      q: "A colony has 12 ants and the map has 15 towns. Each ant makes one next-town decision per town. About how many decisions are made in one iteration?",
      min: 0,
      max: 400,
      step: 20,
      ans: 180,
      tol: 20,
      unit: " decisions",
      hint: "12 × 15 is 120 + 60.",
      why: "12 ants × 15 steps = 180 decisions per iteration.",
    },
    M(
      "An ant has visited 7 of the 12 towns (the one it stands on counts). How many towns are in J, the towns it may still choose?",
      "5",
      ["7", "12", "4"],
      "12 − 7 = 5 towns have not been visited, so J has 5 members.",
    ),
    {
      type: "pick",
      q: "A rider-ant started at A, went to B and has just moved to C (green path). Click the road it <b>most recently</b> added to its tour.",
      fig: NIC.qfig.graph(
        { A: [40, 140], B: [140, 50], C: [260, 90], D: [250, 190], E: [360, 150] },
        [
          ["A", "B"],
          ["B", "C"],
          ["C", "D"],
          ["C", "E"],
          ["A", "D"],
        ],
        { pick: "edges", w: 400, h: 230, hl: { "A-B": "var(--teal)", "B-C": "var(--teal)" } },
      ),
      a: "B-C",
      why: "The tour so far is A, B, C. The last leg is B to C.",
    },
    {
      type: "bug",
      q: "This loop should update the pheromone once all ants have finished their tours. Click the faulty line.",
      code: [
        "for it in range(iterations):",
        "    for ant in ants:",
        "        ant.start(random_town())",
        "    for step in range(num_city - 1):",
        "        for ant in ants:",
        "            ant.move(choose_next(ant))",
        "            update_pheromone(ants)",
      ],
      a: 6,
      why: "update_pheromone sits inside the ant loop, so the trails change after every single move. It belongs after the step loop, once every tour is complete.",
    },
    {
      type: "multi",
      q: "Which of these are sensible end conditions for the Ant System?",
      o: [
        "A fixed number of iterations",
        "No new best round for many iterations",
        "A tour at least as short as a target length",
        "Every ant starting on the same town",
        "The first iteration finishing",
      ],
      a: [0, 1, 2],
      why: "Iteration counts, stagnation and a good-enough target are all common stops. Where ants start, or that one iteration finished, says nothing about the quality of the search.",
    },
    M(
      "Why is the choice of the next town a weighted random draw rather than 'always take the best-looking town'?",
      "It keeps the colony exploring other routes",
      [
        "It makes pheromone unnecessary after a few steps",
        "It guarantees every ant ends with the same tour",
        "It stops the tabu list from filling up too soon",
      ],
      "A random draw gives unlikely towns a chance. Without that the colony would repeat one greedy tour.",
    ),
    {
      type: "match",
      q: "Match each term of the loop to its meaning.",
      pairs: [
        ["num_ant", "How many ants walk a tour each iteration"],
        ["num_city", "The number of steps each ant takes"],
        ["Tabu list", "The towns this ant has already visited"],
        ["J", "The towns this ant is still allowed to choose"],
      ],
      why: "num_ant and num_city set the work per iteration. The tabu list and J describe a single ant's memory during a tour.",
    },
    M(
      "After iteration 8 the best round so far is 142 km. Iteration 9's best ant finds a 150 km round. What is the best round so far after iteration 9?",
      "142 km",
      ["150 km", "146 km", "292 km"],
      "Best so far keeps the shortest round ever seen. 150 is worse than 142, so the record stands.",
    ),
    M(
      "You double num_ant but keep the same map. What happens to the number of next-town decisions in one iteration?",
      "It doubles",
      ["It is squared", "It stays the same", "It halves"],
      "Decisions = num_ant × num_city. Double the first factor and the product doubles.",
    ),
  ]);

  B.add("l8-transition", [
    M(
      "A town has pheromone τ = 3 and the exponent is α = 2. What does the pheromone term τ<sup>α</sup> equal?",
      "9",
      ["6", "5", "1.5"],
      "3² = 9. The exponent is applied to τ, it does not multiply it.",
    ),
    {
      type: "slider",
      q: "From where an ant stands, three towns are still allowed and their scores τ<sup>α</sup>η<sup>β</sup> are 1, 3 and 6. About what percentage chance does the town with score 3 have?",
      min: 0,
      max: 100,
      step: 5,
      ans: 30,
      tol: 5,
      unit: "%",
      hint: "The total is 10.",
      why: "3 out of a total of 1 + 3 + 6 = 10 is 30%.",
    },
    {
      type: "cat",
      q: "Which settings make ants rely mostly on distance, and which mostly on pheromone?",
      buckets: ["Mostly distance", "Mostly pheromone"],
      items: [
        ["α = 0, β = 3", 0],
        ["α = 3, β = 0", 1],
        ["α small, β large", 0],
        ["α large, β small", 1],
        ["Pheromone term switched off", 0],
      ],
      why: "α weights the learned pheromone and β the distance heuristic. Dropping α hands the decision to distance; dropping β hands it to pheromone.",
    },
    M(
      "In a travelling-salesperson ant colony the heuristic is η = 1/d. What is η for a road that is 4 km long?",
      "0.25",
      ["4", "0.4", "2.5"],
      "1/4 = 0.25. Shorter roads have bigger η.",
    ),
    {
      type: "pick",
      q: "Using α = 1 and β = 1, the score is τ / d. Click the village the ant is <b>most likely</b> to pick.",
      fig: cards("τ and distance for four villages", [
        ["W", "Village W", "τ = 2, d = 2"],
        ["X", "Village X", "τ = 10, d = 5"],
        ["Y", "Village Y", "τ = 8, d = 8"],
        ["Z", "Village Z", "τ = 5, d = 10"],
      ]),
      a: "X",
      why: "The scores are 1, 2, 1 and a half. X has the biggest score, so the biggest share of the probability.",
    },
    {
      type: "order",
      q: "Put one decision of the transition rule in order.",
      items: [
        "List the towns not on the tabu list",
        "Work out τ<sup>α</sup>η<sup>β</sup> for each of them",
        "Divide each score by the total",
        "Draw a random number and pick a town",
        "Add the chosen town to the tabu list",
      ],
      why: "First J, then scores, then normalise into probabilities, roll, and finally record the visit.",
    },
    M(
      "What is the transition probability of a town that is already on the ant's tabu list?",
      "Zero",
      ["A small positive number", "The same as every other town", "One, so the ant finishes the tour"],
      "Visited towns are excluded: p = 0.",
    ),
    {
      type: "multi",
      q: "Which statements about the heuristic η are true?",
      o: [
        "It is fixed before the run starts",
        "For the TSP it is 1 divided by the distance",
        "Nearer towns have a larger η",
        "The ants rewrite it after every iteration",
        "It is stored as pheromone on the edges",
      ],
      a: [0, 1, 2],
      why: "η is static local knowledge. The pheromone is the part that changes.",
    },
    {
      type: "bug",
      q: "This function should score each town with τ<sup>α</sup>η<sup>β</sup> where η = 1/d. Click the faulty line.",
      code: [
        "def choose_next(i, J, tau, d, alpha, beta):",
        "    w = [(tau[i][j] ** alpha) * (d[i][j] ** beta) for j in J]",
        "    total = sum(w)",
        "    p = [x / total for x in w]",
        "    return random.choices(J, weights=p)[0]",
      ],
      a: 1,
      why: "The heuristic must be 1/d, not d. As written, farther towns get larger scores, the opposite of what the rule intends.",
    },
    M(
      "Two allowed towns are the same distance away. Town A has twice the pheromone of town B and α = 1. How do their probabilities compare?",
      "A is twice as likely as B",
      ["They are equally likely", "A is four times as likely as B", "B is twice as likely as A"],
      "Distances cancel, so the ratio of scores is the ratio of pheromone: 2 to 1.",
    ),
    M(
      "The probabilities for three towns are 0.1, 0.6 and 0.3, in that order along the roulette line. The random draw is 0.05. Which town is picked?",
      "The first",
      ["The second", "The third", "None, since 0.05 is too small"],
      "The first town owns the slice from 0 to 0.1, and 0.05 lands in it.",
    ),
    M(
      "What is the job of the sum in the denominator of the transition rule?",
      "It makes the probabilities add up to 1",
      [
        "It keeps a record of the tabu list for the next step",
        "It multiplies the pheromone by the distance of each town",
        "It lowers α whenever many towns are still allowed",
      ],
      "Dividing by the total of the allowed towns' scores turns scores into probabilities.",
    ),
    {
      type: "slider",
      q: "Two villages have equal pheromone. One is 1 km away, the other 3 km. With β = 2, about how many times likelier is the nearer one?",
      min: 0,
      max: 20,
      step: 1,
      ans: 9,
      tol: 1,
      unit: " times",
      hint: "Its η is 3 times bigger, and then it is squared.",
      why: "η ratio is 3, and β = 2 squares it: 3² = 9.",
    },
  ]);

  B.add("l8-update", [
    M(
      "An edge has τ = 10, nobody uses it and ρ = 0.1. What is τ after one iteration?",
      "9",
      ["1", "10", "0.9"],
      "(1 − 0.1) × 10 = 9.",
    ),
    M(
      "ρ is set to 1. What does the old pheromone contribute to τ(t + 1)?",
      "Nothing: only the new deposits remain",
      ["All of it, since ρ = 1 means no evaporation", "Half of it", "It doubles"],
      "(1 − ρ) = 0, so the old trail is wiped out each iteration.",
    ),
    {
      type: "cat",
      q: "Sort these into evaporation and deposit.",
      buckets: ["Evaporation", "Deposit"],
      items: [
        ["Multiplies τ by (1 − ρ)", 0],
        ["Adds Q/L<sub>k</sub> on every edge of ant k's tour", 1],
        ["Happens even to edges no ant used", 0],
        ["Depends on how long the ant's tour was", 1],
        ["Lets the colony forget early mistakes", 0],
      ],
      why: "Evaporation shrinks every trail by the same fraction. Deposit adds quality-weighted pheromone only where ants walked.",
    },
    {
      type: "order",
      q: "Put the update of one edge into order.",
      items: [
        "Multiply the old τ by (1 − ρ)",
        "Find the ants whose tours used the edge",
        "Add Q/L for each of those ants",
        "The result is τ(t + 1)",
      ],
      why: "Evaporate, collect each ant's quality, add them, and the sum is the new pheromone.",
    },
    {
      type: "slider",
      q: "An edge has τ = 20 and ρ = 0.25. One ant uses it, with a tour of 50 km, and Q = 100. What is τ after the update?",
      min: 0,
      max: 30,
      step: 1,
      ans: 17,
      tol: 1,
      unit: "",
      hint: "0.75 × 20 = 15. Then add 100/50.",
      why: "Evaporation leaves 15. The deposit is 100/50 = 2. 15 + 2 = 17.",
    },
    M(
      "ρ = 0. What happens to pheromone from old iterations?",
      "It never fades, so trails only grow",
      ["It vanishes at once", "It fades by half each iteration", "It is replaced by η"],
      "(1 − 0) = 1: nothing evaporates. Old mistakes stay attractive for ever.",
    ),
    {
      type: "multi",
      q: "Which statements about <i>Quality<sup>k</sup> = Q / L<sub>k</sub></i> are true?",
      o: [
        "It is bigger for shorter tours",
        "Q is a constant that scales the deposit",
        "It is laid on every edge of ant k's tour",
        "Every ant lays the same amount",
        "It is also laid on roads the ant did not use",
      ],
      a: [0, 1, 2],
      why: "Shorter tours get a bigger inverse-length score, and the ant spreads it on the edges it used. Different tour lengths give different amounts.",
    },
    {
      type: "bug",
      q: "This update should evaporate and then deposit Q/L. Click the faulty line.",
      code: [
        "def update(tau, tours, lens, rho, Q):",
        "    for e in tau:",
        "        tau[e] = (1 - rho) * tau[e]",
        "    for tour, L in zip(tours, lens):",
        "        for e in edges_of(tour):",
        "            tau[e] += L / Q",
      ],
      a: 5,
      why: "The deposit is Q divided by L, not L divided by Q. As written, longer tours would leave more pheromone, favouring the worst tours.",
    },
    M(
      "A 100 km tour leaves a smaller deposit than a 50 km tour on the same edge. Why?",
      "Quality is Q/L, so longer tours score less",
      [
        "Q is made smaller for ants with long tours",
        "Long tours are not allowed to deposit at all",
        "Evaporation removes long tours' deposits first",
      ],
      "Q is shared by all ants. Dividing by L makes the quality drop as the tour gets longer.",
    ),
    M(
      "What is the main job of evaporation in the update rule?",
      "To let the colony forget old, poor choices",
      ["To make long tours impossible", "To lower the number of ants needed", "To copy pheromone onto unused edges"],
      "Without it trails only accumulate, and early lucky tours would dominate the search for ever.",
    ),
    {
      type: "match",
      q: "Match each part of the update rule to what it does.",
      pairs: [
        ["ρ", "Evaporation rate between 0 and 1"],
        ["Q", "Constant that scales every deposit"],
        ["L<sub>k</sub>", "Length of ant k's tour"],
        ["Δτ<sub>ij</sub>", "Sum of the ants' qualities on edge ij"],
      ],
      why: "ρ forgets, Q scales, L sets how much an ant deposits and Δτ gathers it per edge.",
    },
    {
      type: "pick",
      q: "Q = 100. Each box lists the ants that used an edge and their tour lengths. Click the edge that receives the <b>largest total deposit</b>.",
      fig: cards("Deposits this iteration", [
        ["e1", "Edge 1", "ants: 20 km, 50 km"],
        ["e2", "Edge 2", "ant: 25 km"],
        ["e3", "Edge 3", "ant: 10 km"],
        ["e4", "Edge 4", "ants: 100 km ×3"],
      ]),
      a: "e3",
      why: "Edge 1 gets 5 + 2 = 7, edge 2 gets 4, edge 3 gets 10 and edge 4 gets 3 × 1 = 3. The 10 km tour lays the most.",
    },
    M(
      "Two ants use the same edge with 25 km and 50 km tours and Q = 100. What is Δτ for that edge?",
      "6",
      ["3", "75", "2"],
      "100/25 = 4 and 100/50 = 2. Δτ = 4 + 2 = 6.",
    ),
  ]);
})();

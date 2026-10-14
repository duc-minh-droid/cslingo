/* Nature-Inspired boss quizzes for Lectures 7 and 8: fresh scenarios, mixed formats. Every number verified by hand/node. */
(function () {
  const N = NIC;

  /* ===== LECTURE 7 BOSS (l7-boss): start ===== */
  N.registerBoss({
    id: "l7-boss",
    lecture: 7,
    title: "Lecture 7 boss quiz",
    blurb: "Ten questions: emergence, stigmergy, bridges and trails, and one ant's tour round a delivery map.",
    lede: "A hill-farm co-op, a termite wall, a courier van and a snippet of code. Use what you know about swarms, pheromone and how ants build and reinforce tours.",
    qs: [
      {
        type: "mcq",
        q: 'A visitor says: "A colony of ants must have a leader who knows where the shortest route is." Which reply fits the lecture best?',
        o: [
          "Each ant follows simple local rules, and pheromone carries the information",
          "The queen measures every route and tells the workers which to take",
          "Scout ants memorise the whole map and report back to the colony",
          "Ants cannot find short routes, they only get lucky now and then",
        ],
        a: 0,
        why: "A swarm has no central controller. Simple, identical members react to what is near them, and marks in the environment (pheromone) pass information between them.",
      },
      {
        type: "cat",
        q: "Which of these does one ant do on its own, and which does only the colony achieve?",
        buckets: ["One ant on its own", "The colony as a whole"],
        items: [
          ["Lays a mark of pheromone as it walks", 0],
          ["Settles on the shorter of two branches", 1],
          ["Follows the stronger of two scents", 0],
          ["Keeps the nest temperature steady", 1],
          ["Picks one branch at a fork", 0],
          ["Finds a short route from nest to food", 1],
        ],
        why: "Laying a mark, following a scent and choosing at a fork are individual acts. Holding a steady temperature and finding short routes are emergent: they appear only from many ants interacting.",
      },
      {
        type: "mcq",
        q: "A termite drops a mud pellet into a gap in a wall, and the growing pile draws other termites to add pellets there. Another ant leaves scent along a path to food. Which pairing is right?",
        o: [
          "Pellet: sematonic, scent: sign-based",
          "Pellet: sign-based, scent: sematonic",
          "Both are sign-based",
          "Neither is stigmergy",
        ],
        a: 0,
        why: "Dropping a pellet is itself the building work and it prompts others, so it is sematonic. A scent is a mark that is not the food-finding work itself, so it is sign-based.",
      },
      {
        type: "mcq",
        q: "Trail A holds 60 units of pheromone and trail B holds 20. A new ant chooses in proportion to pheromone. About how likely is it to pick A?",
        o: ["About 75%", "About 50%", "About 90%", "About 25%"],
        a: 0,
        hint: "A holds 60 of the 80 units in total.",
        why: "60 ÷ 80 = 0.75. B still gets one chance in four, so weaker trails keep being explored.",
      },
      {
        type: "slider",
        q: "A trail holds 80 units and no ant uses it. Half of its pheromone evaporates each step. About how many units are left after 3 steps?",
        min: 0,
        max: 80,
        step: 5,
        ans: 10,
        tol: 5,
        unit: " units",
        hint: "Halve it three times: 80, 40, 20, then?",
        why: "80 → 40 → 20 → 10. An unused trail fades quickly, which is how a colony forgets old routes.",
      },
      {
        type: "order",
        q: "Order what one ant does on a delivery round, from the moment it is placed on the map.",
        items: [
          "Sit on a random town with an empty tour memory",
          "Pick each next town using pheromone and distance",
          "Add every town it picks to its tour memory",
          "Return to the starting town to close the tour",
          "Evaporate all roads, then deposit on the tour's roads",
        ],
        why: "Start, choose and remember until every town is visited, close the tour, and only then update the pheromone: evaporate everywhere first, then deposit on the roads of the tour.",
      },
      {
        type: "pick",
        q: "The numbers are pheromone on each road. An ant has just completed the green tour A-B-C-D-A. Evaporation halves every road, then each road on the tour gains 4. <b>Click the road with the most pheromone afterwards.</b>",
        fig: N.qfig.graph(
          { A: [70, 50], B: [380, 50], C: [380, 190], D: [70, 190] },
          [
            ["A", "B", 10],
            ["B", "C", 6],
            ["C", "D", 12],
            ["D", "A", 8],
            ["A", "C", 30],
          ],
          {
            pick: "edges",
            w: 460,
            h: 240,
            hl: { "A-B": "var(--teal)", "B-C": "var(--teal)", "C-D": "var(--teal)", "D-A": "var(--teal)" },
          },
        ),
        a: ["A-C"],
        why: "Tour roads end at 5 + 4 = 9, 3 + 4 = 7, 6 + 4 = 10 and 4 + 4 = 8. Road AC was not on the tour, so it only halves, from 30 to 15, which is still the highest.",
      },
      {
        type: "multi",
        q: "Which statements about the double-bridge experiment are true?",
        o: [
          "With equal branches, most ants still end up on one branch",
          "With one branch shorter, colonies usually settle on the shorter one",
          "Ants on the shorter branch return sooner, so its trail builds earlier",
          "Each ant measures both branches and compares their lengths",
          "The colony picks the shorter branch every single time",
        ],
        a: [0, 1, 2],
        why: "Positive feedback commits the colony to one branch even when the branches are equal. Timing favours the shorter one, but early luck means a few colonies still choose the long branch. No ant measures anything.",
      },
      {
        type: "bug",
        q: "This routine should update pheromone after an ant finishes a tour: evaporate every road, then deposit more on shorter tours. Click the faulty line.",
        code: [
          "def finish_tour(tau, tour_edges, length, rho, Q):",
          "    for e in tau:",
          "        tau[e] = tau[e] * (1 - rho)",
          "    for e in tour_edges:",
          "        tau[e] = tau[e] + Q * length",
          "    return tau",
        ],
        a: 4,
        why: "The deposit should be <code>Q / length</code>. Multiplying by the length gives longer tours a bigger deposit, so the trails would favour the worst tours.",
      },
      {
        type: "match",
        q: "Match each idea to its meaning.",
        pairs: [
          ["Stigmergy", "Communication through marks left in the environment"],
          ["Pheromone", "A mark that builds up where ants walk and fades with time"],
          ["Tour memory", "The towns an ant has already visited and may not pick again"],
          ["Positive feedback", "A strong trail attracts ants that make it stronger"],
        ],
        why: "These four ideas make the colony work: marks carry the information, evaporation forgets, memory keeps tours valid and feedback commits the colony to good paths.",
      },
    ],
  });
  /* ===== LECTURE 7 BOSS: end ===== */

  /* ===== LECTURE 8 BOSS (l8-boss): start ===== */
  const bossGraph = () =>
    N.qfig.graph(
      { A: [40, 60], B: [130, 30], C: [220, 60], D: [220, 160], E: [330, 110], F: [130, 170] },
      [
        ["A", "B"],
        ["B", "C"],
        ["C", "D"],
        ["D", "A"],
        ["D", "E"],
        ["D", "F"],
      ],
      { pick: "edges", w: 400, h: 210, hl: { "A-B": "var(--teal)", "B-C": "var(--teal)", "C-D": "var(--teal)" } },
    );
  N.registerBoss({
    id: "l8-boss",
    lecture: 8,
    title: "Lecture 8 boss quiz",
    blurb:
      "Ten questions: transition and update rules, ACO variants, and ants that build bakery and courier schedules.",
    lede: "A bike-courier firm routes its riders with an ant colony, and a village bakery uses ants to order its oven jobs. Use the transition rule, the update rule and the construction-graph idea.",
    qs: [
      {
        type: "mcq",
        q: "A rider-ant is choosing its next village with α = 1 and β = 1. The score is τ / d. Aldo has d = 2 km and τ = 2; Brey has d = 4 and τ = 8; Cray has d = 5 and τ = 5. All other villages are on its tabu list. What is the probability that it picks Brey?",
        o: ["0.5", "0.25", "0.75", "0.1"],
        a: 0,
        hint: "Scores first: 2/2, 8/4 and 5/5.",
        why: "The scores are 1, 2 and 1, which add up to 4. Brey's share is 2/4 = 0.5. Tabu villages score nothing and do not enter the total.",
      },
      {
        type: "mcq",
        q: "A colony always converges on the same mediocre round within five iterations and never improves after that. Which change is the most sensible first step?",
        o: [
          "Lower α, so the pheromone steers the ants less",
          "Raise α, so the trails steer the ants more",
          "Set ρ to 0, so no trail ever fades",
          "Let only the single best ant deposit",
        ],
        a: 0,
        why: "Early lock-in means the positive feedback is too strong. A lower α (or a higher β or ρ) lets the ants explore more. The other three changes all concentrate the trail further.",
      },
      {
        type: "slider",
        q: "On one road the pheromone is τ = 6 and ρ = 0.5. Two ants use that road: one with a tour of 20 km and one with 40 km. Q = 80. What is τ on the road after the update?",
        min: 0,
        max: 20,
        step: 1,
        ans: 9,
        tol: 1,
        unit: "",
        hint: "Evaporation gives 3. Then add 80/20 and 80/40.",
        why: "(1 − 0.5) × 6 = 3. The deposits are 80/20 = 4 and 80/40 = 2, so Δτ = 6 and the new τ is 3 + 6 = 9.",
      },
      {
        type: "order",
        q: "Put one iteration of the Ant System in order.",
        items: [
          "Place the ants on random towns",
          "Every ant builds a full tour, step by step, with the transition rule",
          "Update the pheromone on every edge",
          "Check the end condition",
        ],
        why: "Ants are placed, they all build tours using the current trails, only then is the pheromone updated, and finally the end condition is tested.",
      },
      {
        type: "cat",
        q: "Which statements describe the original Ant System, and which the variants that update with only the best ants?",
        buckets: ["Original Ant System", "Best-ants variants"],
        items: [
          ["Every ant deposits on the edges of its tour", 0],
          ["Only the best n ants deposit", 1],
          ["Elitist Rank Ant System (Bullnheimer, 1999)", 1],
          ["Introduced by Dorigo in 1996", 0],
          ["Max-Min Ant System (Stützle and Hoos, 2000)", 1],
          ["A very long tour still leaves a small amount of pheromone", 0],
        ],
        why: "The original lets all ants deposit, even those with poor tours. Elitist rank and Max-Min restrict the update to the best n ants or the best one.",
      },
      {
        type: "pick",
        q: "A rider-ant has taken the green path A, B, C, D and now stands on D. Click the road it <b>cannot</b> take next.",
        fig: bossGraph(),
        a: "D-A",
        why: "A is on the tabu list because the ant has already visited it, so road D to A has probability 0. E and F are still unvisited.",
      },
      {
        type: "multi",
        q: "Which statements about ACO on a <b>construction graph</b> are true?",
        o: [
          "In job scheduling, each job is a node and a full path is one schedule",
          "In a layered graph an ant moves forward one layer at a time",
          "A schedule path is complete once every job has been visited",
          "The ant must return to the Start node to finish its schedule",
          "ACO can only be used when there are distances between nodes",
        ],
        a: [0, 1, 2],
        why: "Solutions only need to be representable as paths. Scheduling ants start at Start and stop when every job is visited, with no return. Distances belong to the TSP, not to ACO in general.",
      },
      {
        type: "slider",
        q: "A bakery oven runs these jobs in this order, starting at minute 0. Rolls take 20 min and are due at 25. Loaves take 40 and are due at 50. Pies take 20 and are due at 70. Cakes take 30 and are due at 90. What is the <b>average lateness</b> of the order Rolls, Loaves, Pies, Cakes? (Lateness is 0 for a job that finishes early.)",
        min: 0,
        max: 40,
        step: 5,
        ans: 10,
        tol: 3,
        unit: " min",
        hint: "Finish times are 20, 60, 80 and 110. Subtract the due times, floor at 0.",
        why: "Lateness is 0, 10, 10 and 20. The sum is 40 and 40 / 4 = 10 minutes. The maximum lateness of this order is 20.",
      },
      {
        type: "match",
        q: "Match each symbol of the ant colony algorithm to its job.",
        pairs: [
          ["α", "Exponent that weights the pheromone τ"],
          ["β", "Exponent that weights the heuristic η"],
          ["ρ", "Fraction of the pheromone that evaporates each iteration"],
          ["Q", "Constant that scales each ant's deposit Q/L"],
        ],
        why: "α and β trade global learning against local knowledge. ρ is the evaporation rate in (1 − ρ)τ, and Q only scales every deposit.",
      },
      {
        type: "bug",
        q: "This update should evaporate every trail by a fraction ρ and then let each ant deposit Q/L. Click the faulty line.",
        code: [
          "def update(tau, tours, lens, rho, Q):",
          "    for e in tau:",
          "        tau[e] = tau[e] * rho",
          "    for tour, L in zip(tours, lens):",
          "        for e in edges_of(tour):",
          "            tau[e] += Q / L",
        ],
        a: 2,
        why: "Evaporation keeps a factor (1 − ρ) of the old pheromone. Multiplying by ρ keeps only ρ of it, so a ρ of 0.1 would erase 90% of every trail, the wrong way round.",
      },
    ],
  });
  /* ===== LECTURE 8 BOSS: end ===== */
})();

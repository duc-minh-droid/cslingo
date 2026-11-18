/* Revision bank, Nature-Inspired Lecture 15: 15.1 personal bests, 15.2 the archive, 15.3 capping and clustering, 15.4 pruning by crowding distance. */
(function () {
  const B = NIC.bank;
  const Qf = NIC.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l15-archive", [
    {
      type: "cat",
      q: "A particle's pbest is (5, 5), both objectives minimised. Sort each new position by what happens to pbest.",
      buckets: ["Replaced under both rules", "Replaced only under keep the newest", "Replaced under neither rule"],
      items: [
        ["(4, 4)", 0],
        ["(5, 4)", 0],
        ["(6, 4)", 1],
        ["(3, 7)", 1],
        ["(6, 6)", 2],
        ["(5, 6)", 2],
      ],
      why: "Keep the oldest needs the new position to dominate (5, 5). Keep the newest replaces unless (5, 5) dominates the new position. Trade-offs such as (6, 4) satisfy only the second; (5, 6) ties on one and is worse on the other, so (5, 5) dominates it.",
    },
    {
      type: "order",
      q: "Put one MOPSO iteration for a single particle in order.",
      items: [
        "Choose a leader from the archive",
        "Update the velocity with the pbest and leader pulls",
        "Move the particle by its new velocity",
        "Update its pbest with a dominance rule",
        "Offer the new position to the archive",
      ],
      why: "The leader replaces PSO's global best in the velocity update. After moving, the particle updates its own best and its new solution meets the archive.",
    },
    TF(
      "Under 'keep the newest', pbest moves to a new position that is mutually non-dominating with the old pbest.",
      true,
      "Keep the newest replaces pbest unless the old pbest dominates the new position. A trade-off is not dominated, so it replaces.",
    ),
    {
      type: "bug",
      q: "This pseudocode should apply the 'keep the oldest' pbest rule. Click the faulty line.",
      code: [
        "for each particle i:",
        "    y = objectives(x_i)",
        "    if p_i dominates y:",
        "        p_i = y",
        "    offer y to the archive",
      ],
      a: 2,
      why: "Keep the oldest replaces pbest only when the new solution dominates it: 'if y dominates p_i'. As written, pbest would only ever get worse.",
    },
    M(
      "In plain PSO every particle is pulled towards the swarm best g. Why can MOPSO not just do the same?",
      [
        "Several solutions are mutually non-dominating, so no single best exists",
        "Particles in MOPSO have no velocity, so g has nothing to pull on",
        "The swarm best is always dominated by the particles' own bests",
        "A global best would need the objectives to be maximised instead",
      ],
      0,
      "With several objectives the best is a set of trade-offs. MOPSO keeps that set in an archive and picks leaders from it.",
    ),
    {
      type: "cat",
      q: "Which pbest rule does each line describe?",
      buckets: ["Keep the oldest", "Keep the newest"],
      items: [
        ["Replaces pbest only when the new position dominates it", 0],
        ["Stays put when the new position is a trade-off", 0],
        ["Changes pbest the least often of the two", 0],
        ["Replaces pbest unless the old pbest dominates the new position", 1],
        ["Moves pbest to a trade-off position", 1],
        ["Follows the particle's latest unbeaten move", 1],
      ],
      why: "Keep the oldest needs a strict improvement (domination) to move. Keep the newest moves to any position the old pbest does not dominate, trade-offs included, so it changes more often.",
    },
  ]);

  B.add("l15-store", [
    M(
      "The archive is (1, 6), (3, 3) and (6, 1), both minimised. A new solution (2, 2) arrives. How many members does the archive hold afterwards?",
      ["2", "3", "4"],
      1,
      "(2, 2) dominates (3, 3), which is removed, and nobody dominates (2, 2), so it joins: (1, 6), (6, 1) and (2, 2).",
    ),
    {
      type: "pick",
      q: "The archive is A (1, 6), B (3, 3) and C (6, 1), both minimised. Click every newcomer, X, Y or Z, that would be turned away.",
      fig: Qf.points({ A: [1, 6], B: [3, 3], C: [6, 1], X: [2, 4], Y: [4, 4], Z: [7, 2] }),
      a: ["Y", "Z"],
      why: "Y (4, 4) is dominated by B (3, 3) and Z (7, 2) by C (6, 1). X (2, 4) trades off with both A and B, so it would join.",
    },
    TF(
      "Every archive member must dominate at least one particle in the current swarm.",
      false,
      "Archive members only have to be mutually non-dominated. A member far from the swarm may dominate none of the particles.",
    ),
    {
      type: "multi",
      q: "Which statements about a MOPSO archive are true?",
      o: [
        "Its members are mutually non-dominated",
        "It is the run's Pareto front approximation",
        "Without a cap it can keep growing",
        "It always holds the swarm's current positions",
        "Members are ordered by the sum of their objectives",
      ],
      a: [0, 1, 2],
      why: "The archive keeps the non-dominated solutions found so far, which approximates the front, and nothing limits it unless it is capped. Current positions are often dominated, and objectives are never summed.",
    },
    M(
      "A swarm of 25 particles feeds an archive of 40 members. About how many dominance comparisons can one iteration's archive updates need?",
      ["65", "1,000", "40"],
      1,
      "Each of the 25 new solutions is compared with up to 40 members: 25 × 40 = 1,000. That cost is one reason to cap the archive.",
      { hint: "25 × 40 = 25 × 4 × 10." },
    ),
    {
      type: "slider",
      q: "An uncapped archive starts with 10 members. On average 3 join and 1 is removed each iteration. Estimate its size after 50 iterations.",
      min: 0,
      max: 200,
      step: 10,
      ans: 110,
      tol: 10,
      hint: "Net growth is 2 per iteration: 2 × 50 = 100, plus the 10 at the start.",
      why: "10 + (3 − 1) × 50 = 110. Without a cap, a smooth front keeps feeding new non-dominated solutions into the archive.",
    },
  ]);

  B.add("l15-bounded", [
    {
      type: "order",
      q: "Put pruning an archive by hierarchical clustering in order.",
      items: [
        "Make every archive member its own cluster",
        "Join the two closest clusters",
        "Repeat until the number of clusters equals the cap",
        "Keep the member nearest each cluster's centre",
      ],
      why: "Clustering builds a representative subset: the closest clusters merge until the cap is reached, then one central member stands for each cluster.",
    },
    TF(
      "Pruning by clustering always keeps both extremes of the archive.",
      false,
      "Clustering keeps the member nearest each cluster's centre. An extreme that merges into a cluster can be represented by a more central member and lost.",
    ),
    M(
      "A cluster holds (1, 9), (2, 8) and (6, 7). Which member does clustering keep?",
      ["(2, 8)", "(1, 9)", "(6, 7)"],
      0,
      "The centre is the mean: ((1 + 2 + 6) ÷ 3, (9 + 8 + 7) ÷ 3) = (3, 8). (2, 8) is 1 away, (1, 9) about 2.2 and (6, 7) about 3.2, so (2, 8) is kept.",
      { hint: "Centre: 9 ÷ 3 = 3 across and 24 ÷ 3 = 8 up." },
    ),
    {
      type: "multi",
      q: "An archive is over its cap. Which of these are diversity-preserving ways to decide who leaves?",
      o: [
        "Remove the member with the smallest crowding distance",
        "Cluster the members and keep one per cluster",
        "Remove the oldest member",
        "Remove a member at random",
      ],
      a: [0, 1],
      why: "Crowding distance and clustering both look at where members sit, so the survivors stay spread. Age or chance can empty a whole stretch of the front.",
    },
    M(
      "What does a 'diversity-preserving mechanism' protect in a capped archive?",
      [
        "An even spread of members along the whole front",
        "The members that were found earliest in the run",
        "The members with the smallest sum of objectives",
        "The members closest to the swarm's current centre",
      ],
      0,
      "When members must go, the mechanism removes those in crowded regions so the archive still covers the front evenly.",
    ),
    TF(
      "Capping the archive makes each archive update and each leader search cheaper.",
      true,
      "With fewer members there are fewer dominance comparisons for each newcomer and fewer candidates to search when choosing a leader.",
    ),
  ]);

  B.add("l15-prune", [
    {
      type: "cat",
      q: "Clustering or crowding distance?",
      buckets: ["Clustering", "Crowding distance"],
      items: [
        ["Joins the closest clusters", 0],
        ["Keeps the member nearest each centre", 0],
        ["Used for archives by Zitzler (1999)", 0],
        ["Always keeps the two extremes", 1],
        ["Removes one member and recomputes", 1],
        ["The diversity measure of NSGA-II", 1],
      ],
      why: "Clustering picks one representative per cluster. Crowding distance scores members by their neighbours' gaps, gives the ends ∞ and drops the most crowded.",
    },
    {
      type: "slider",
      q: "An archive is A (0, 10), B (2, 6), C (5, 4) and D (10, 0), both minimised. Estimate B's crowding distance.",
      min: 0,
      max: 2,
      step: 0.05,
      ans: 1.1,
      tol: 0.1,
      hint: "First objective: neighbours A (0) and C (5), gap 5, range 10. Second: neighbours C (4) and A (10), gap 6, range 10.",
      why: "5 ÷ 10 + 6 ÷ 10 = 0.5 + 0.6 = 1.1. A and D are the ends and score ∞.",
    },
    M(
      "An archive is A (0, 10), B (2, 7), C (3, 6), D (7, 2) and E (10, 0), both minimised, ranges 10 and 10. It must lose one member by crowding distance. Which goes?",
      ["B", "C", "D", "A"],
      0,
      "B scores 0.3 + 0.4 = 0.7, C scores 0.5 + 0.5 = 1.0 and D scores 0.7 + 0.6 = 1.3. A and E are ends (∞). The smallest, B, goes.",
      { hint: "B's neighbours are A and C: gaps 3 and 4. C's are B and D: gaps 5 and 5." },
    ),
    TF(
      "Pruning by crowding distance can remove an extreme of a two-objective archive.",
      false,
      "The two ends of the front get a crowding distance of ∞, so they are always the last to go.",
    ),
    M(
      "Two neighbouring archive members both have the lowest crowding distance. Why remove only one before recomputing?",
      [
        "Removing one widens the other's gaps, so it may no longer be crowded",
        "Crowding distances never change once they have been computed",
        "Removing both would break the dominance relation in the archive",
        "Only one member may be removed in each iteration of the swarm",
      ],
      0,
      "Each one is the other's neighbour. Once one goes, the survivor's gaps grow and its distance rises, so dropping both would leave a hole.",
    ),
    {
      type: "pick",
      q: "Five archive members, both objectives minimised. With crowding distance, which member would be pruned first? Click it.",
      fig: Qf.points({ A: [0, 8], B: [2, 5], C: [3, 4], D: [5, 2], E: [8, 0] }),
      a: ["C"],
      hint: "Ranges are 8 and 8. B: gaps 3 and 4. C: gaps 3 and 3. D: gaps 5 and 4.",
      why: "B scores 7 ÷ 8, C scores 6 ÷ 8 and D scores 9 ÷ 8; A and E are ends (∞). C is the most crowded, so it goes first.",
    },
  ]);
})();

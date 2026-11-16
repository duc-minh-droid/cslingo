/* Revision bank, Nature-Inspired Lecture 15: 15.3 choosing leaders and many-objective PSO. */
(function () {
  const B = NIC.bank;
  const Qf = NIC.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l15-leaders", [
    {
      type: "cat",
      q: "Which leader-selection method does each line describe?",
      buckets: ["Random", "Dominated solution count", "Hypervolume"],
      items: [
        ["Every archive member has the same chance", 0],
        ["The simplest rule, blind to crowding", 0],
        ["Members that dominate many particles are picked less", 1],
        ["Counts swarm particles beneath each member", 1],
        ["Uses the particle as the reference point", 2],
        ["Picks the largest own share of the area", 2],
      ],
      why: "Random ignores structure. Dominated count looks at how many particles each member dominates. Hypervolume measures each member's contribution against the particle.",
    },
    {
      type: "slider",
      q: "A particle at (10, 10) is dominated by archive members (2, 7), (6, 4) and (8, 2), both minimised. Estimate the hypervolume contribution of (6, 4).",
      min: 0,
      max: 15,
      step: 1,
      ans: 6,
      tol: 0.5,
      hint: "Its own box runs from fuel 6 to the next member's 8, and from 4 up to the previous member's 7.",
      why: "(8 − 6) × (7 − 4) = 2 × 3 = 6. (2, 7) adds 4 × 3 = 12 and (8, 2) adds 2 × 2 = 4.",
    },
    M(
      "A particle at (10, 10) is dominated by archive members (2, 7), (6, 4) and (8, 2), both minimised. Which leads it under hypervolume selection?",
      ["(2, 7)", "(6, 4)", "(8, 2)"],
      0,
      "Own shares: (2, 7) adds (6 − 2) × (10 − 7) = 12, (6, 4) adds 6 and (8, 2) adds 4. The largest contribution leads.",
      { hint: "(2, 7): 4 × 3. (6, 4): 2 × 3. (8, 2): 2 × 2." },
    ),
    M(
      "Under hypervolume leader selection, a particle is not dominated by any archive member. What happens?",
      [
        "A leader is chosen from the archive at random",
        "The particle becomes its own leader for good",
        "The archive member closest to it is chosen",
        "The particle is removed from the swarm",
      ],
      0,
      "With no dominating member there is no box between the archive and the particle, so the lecture's rule picks a leader at random.",
    ),
    {
      type: "pick",
      q: "Archive members A, B and C; swarm particles u, v, w and x; both objectives minimised. Under dominated solution count, which member is least likely to lead? Click it.",
      fig: Qf.points({ A: [1, 6], B: [3, 3], C: [6, 1], u: [4, 4], v: [5, 5], w: [4, 7], x: [7, 2] }),
      a: ["B"],
      why: "B (3, 3) dominates u, v and w; A dominates only w and C only x. The member that dominates the most particles is the least likely to be chosen.",
    },
    M(
      "Why can picking every leader uniformly at random be a weakness?",
      [
        "It ignores crowding, so sparse parts of the front get no extra pull",
        "It needs the hypervolume of the archive to be computed first",
        "It can only choose among members that dominate the particle",
        "It always picks the same archive member for every particle",
      ],
      0,
      "Random choice treats crowded and isolated members alike. Preferring sparse members steers particles into the gaps.",
    ),
    {
      type: "order",
      q: "Put leader selection by average rank in order.",
      items: [
        "Rank the archive members on the first objective",
        "Repeat the ranking for each of the M objectives",
        "Average each member's M ranks",
        "Prefer members with a lower average",
      ],
      why: "Average rank replaces dominance for many objectives: one ranking per objective, then the mean, with lower being better.",
    },
    M(
      "Four objectives. An archive member ranks 1, 4, 2 and 1. What is its average rank?",
      ["1", "2", "4"],
      1,
      "(1 + 4 + 2 + 1) ÷ 4 = 8 ÷ 4 = 2.",
    ),
    M(
      "Archive members A (1, 5), B (2, 4) and C (6, 1). Distance ranking adds the absolute objective differences to every other member. Which is preferred?",
      ["A", "B", "C"],
      2,
      "r(A) = 2 + 9 = 11, r(B) = 2 + 7 = 9, r(C) = 9 + 7 = 16. The largest total means the least crowded, so C is preferred.",
      { hint: "A to B: 1 + 1. A to C: 5 + 4. B to C: 4 + 3." },
    ),
    TF(
      "With many objectives, most solutions in a population become mutually non-dominating.",
      true,
      "Each extra objective is another chance for a solution to win somewhere, so dominance relations become rare and stop separating solutions.",
    ),
    {
      type: "multi",
      q: "Which are the three many-objective issues named in the lecture?",
      o: [
        "The front is hard to visualise",
        "Search capability of the optimiser drops",
        "The solutions needed grow exponentially",
        "Particles can no longer update velocity",
        "The archive can no longer be capped",
      ],
      a: [0, 1, 2],
      why: "Visualisation, weaker search and an exponential number of solutions are the three issues. The PSO update and archive caps still work.",
    },
    M(
      "With M = 4 objectives, what share of the space around a solution can dominance compare it with?",
      ["1/2", "1/8", "1/32"],
      1,
      "The comparable share is 2 ÷ 2ᴹ = 2 ÷ 16 = 1/8. The rest is mutually non-dominating with it.",
      { hint: "2ᴹ = 16 for M = 4." },
    ),
  ]);
})();

/* Revision bank, Nature-Inspired Lectures 13-14: 13.5 NSGA-II and 13.6 weighted sums, hypervolume and many objectives. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l13-nsga", [
    {
      type: "order",
      q: "Put a Pareto dominance tournament in order.",
      items: [
        "Draw two random solutions x and y",
        "Draw a separate comparison set Z of C solutions",
        "Check whether each of x and y is non-dominated by all of Z",
        "If exactly one passes select it, otherwise pick at random",
      ],
      why: "The comparison set judges the contestants. When both pass or both fail, the tie is broken at random (or by a spread measure).",
    },
    M(
      "A basic dominance tournament (no comparison set) draws two mutually non-dominating solutions. What happens?",
      [
        "One of them is chosen at random",
        "The one with the lower first objective wins",
        "Both are rejected and two more are drawn",
        "The one found earlier in the run wins",
      ],
      0,
      "Neither dominates, so dominance cannot decide and the choice is random. That is why the basic version has weak selection pressure.",
    ),
    M(
      "NSGA-II with N = 20. The merged 40 solutions form ranks of 8, 9, 10 and 13. How many rank 2 solutions survive?",
      ["0", "3", "10", "13"],
      1,
      "Ranks 0 and 1 take 8 + 9 = 17 places, leaving 3. The 3 rank 2 solutions with the largest crowding distance take them.",
      { hint: "20 − 8 − 9." },
    ),
    TF(
      "Each NSGA-II generation ranks a merged population of 2N solutions.",
      true,
      "N parents and N children are merged into 2N, sorted into fronts, and cut back to N. That merge is what makes it elitist.",
    ),
    {
      type: "multi",
      q: "Which of these describe NSGA-II?",
      o: [
        "Elitist: parents and children compete",
        "Ranks with a fast non-dominated sort",
        "Breaks ties with crowding distance",
        "Needs a niche radius to be tuned",
        "Children always replace every parent",
      ],
      a: [0, 1, 2],
      why: "NSGA-II merges parents and children, sorts them into fronts and uses crowding distance, which has no niche radius.",
    },
    M(
      "In a non-elitist multi-objective GA, what can happen to a rank 0 parent?",
      [
        "It can be lost when the children replace the parents",
        "It is copied unchanged into every later generation",
        "It is forced to mutate until it becomes rank 1",
        "It becomes the comparison set for every tournament",
      ],
      0,
      "Without elitism only children make the next generation, so even the best parent can disappear. Elitist MOGAs let parents compete for places.",
    ),
  ]);

  B.add("l13-beyond", [
    M(
      "You want 7 points on a front using a single-objective GA on weighted sums. How many GA runs do you need, at least?",
      ["1", "2", "7", "49"],
      2,
      "Each weighting gives one point, so one run per point: at least 7, and points in dents of the front are never found at all.",
    ),
    {
      type: "cat",
      q: "Weighted-sum GA or dominance-based MOEA?",
      buckets: ["Weighted-sum GA", "Dominance-based MOEA"],
      items: [
        ["Turns the problem into one objective", 0],
        ["One run gives one point", 0],
        ["Needs weights chosen in advance", 0],
        ["One run gives a whole front approximation", 1],
        ["Can find points in a dent of the front", 1],
        ["Uses non-dominated sorting", 1],
      ],
      why: "A population-based MOEA approximates the whole front in one run and keeps every non-dominated point. A weighted sum finds one convex point per run.",
    },
    M(
      "With 5 objectives, what share of the space around a point is comparable to it (better on all or worse on all)?",
      ["1/32", "1/16", "1/4", "1/2"],
      1,
      "Better on all five is (1/2)⁵ = 1/32, and worse on all five is another 1/32, so 1/16 in all. The rest, 15/16, is incomparable.",
      { hint: "Halve five times for 'better on all', then double for 'worse on all'." },
    ),
    {
      type: "multi",
      q: "Which are the three issues with many-objective optimisation named in the lecture?",
      o: [
        "Visualising the front approximation is hard",
        "The search capability of the optimisers drops",
        "The points needed to cover the front grow exponentially",
        "Crossover can no longer be applied",
        "The objectives can no longer be evaluated",
      ],
      a: [0, 1, 2],
      why: "With 4 or more objectives, dominance stops discriminating, the front needs vastly more points, and it cannot be drawn on a scatter plot.",
    },
    M(
      "In a parallel coordinate plot, the lines of two solutions cross between the cost axis and the power axis. What does that show?",
      [
        "They trade off: one is better on cost, the other on power",
        "They have identical values on both of those objectives",
        "One of the two solutions dominates the other overall",
        "Both solutions must be infeasible in that region",
      ],
      0,
      "Crossing lines swap order between the axes, so each solution leads on one of the two objectives: a trade-off.",
    ),
    TF(
      "Hypervolume rewards a front that is both close to the ideal and well spread.",
      true,
      "The dominated area grows if points move towards the ideal corner and if they cover more of the front, so both closeness and spread raise it.",
    ),
    {
      type: "slider",
      q: "Both objectives minimised, reference point (10, 10). A front has two points, (2, 6) and (5, 3). Estimate its hypervolume.",
      min: 0,
      max: 100,
      step: 1,
      ans: 47,
      tol: 3,
      hint: "Box of (2, 6): 8 × 4 = 32. The extra part from (5, 3): 5 × (6 − 3) = 15.",
      why: "The union of the two boxes up to the reference point: 32 + 15 = 47.",
    },
  ]);
})();

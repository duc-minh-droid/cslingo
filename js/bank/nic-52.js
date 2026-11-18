/* Revision bank, Nature-Inspired Lectures 13-14: 13.1 trade-offs and dominance, 13.2 the Pareto front, 13.3 non-dominated sorting, 13.4 niching and crowding. */
(function () {
  const B = NIC.bank,
    Qf = NIC.qfig;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  // ---------- 13.1 trade-offs and Pareto dominance ----------
  B.add("l13-pareto", [
    {
      type: "cat",
      q: "Both objectives are maximised. For each pair, which way does dominance go?",
      buckets: ["First dominates", "Second dominates", "Neither dominates"],
      items: [
        ["(5, 7) against (4, 7)", 0],
        ["(6, 6) against (5, 5)", 0],
        ["(3, 3) against (3, 8)", 1],
        ["(2, 9) against (6, 3)", 2],
        ["(8, 1) against (1, 8)", 2],
      ],
      why: "Maximising, bigger is better. A tie on one objective is allowed if the other is strictly larger. Pairs where each wins once are mutually non-dominating.",
    },
    M(
      "A timetable is scored on (clashes, empty periods), both minimised. Timetable T scores (0, 4). Which timetable dominates T?",
      ["(0, 3)", "(1, 2)", "(0, 5)", "(2, 0)"],
      0,
      "(0, 3) ties on clashes and has fewer empty periods. (1, 2) and (2, 0) have more clashes, and (0, 5) is worse on empty periods.",
    ),
    TF(
      "If a dominates b, and b dominates c, then a dominates c.",
      true,
      "a is at least as good as b everywhere, and b as good as c, so a is at least as good as c everywhere. The strict win of b over c carries through, so a is strictly better somewhere.",
    ),
    M(
      "Why can you not simply sort objective vectors from best to worst, as you sort fitness numbers?",
      [
        "One vector can win on one objective and lose on another",
        "Vectors take too long to compare on a computer",
        "Every vector is dominated by at least one other vector",
        "Vectors only work when all objectives are maximised",
      ],
      0,
      "Numbers have a total order, but vectors do not: two trade-offs can each be better somewhere. That is why the answer is a front, not a single winner.",
    ),
    {
      type: "multi",
      q: "Which statements about the offshore wind farm problem are true?",
      o: [
        "A turbine in another's wake produces less power",
        "The cheapest layout tends to produce the least power",
        "Spreading turbines out to escape wakes raises the cost",
        "One layout is best on both cost and power",
      ],
      a: [0, 1, 2],
      why: "Wakes cut power, so more power needs more spread, cable and area, which costs more. Because of that trade-off no layout wins on both: the result is a set of layouts.",
    },
    M(
      "Phones are judged on price (minimise) and battery life (maximise). X costs £300 with 20 hours; Y costs £250 with 20 hours. Which is right?",
      [
        "Y dominates X: cheaper with the same battery",
        "X dominates Y: dearer but with the same battery",
        "Neither dominates, as the batteries are equal",
        "They are the same point in objective space",
      ],
      0,
      "Y is at least as good on battery (a tie) and strictly better on price, so Y dominates X.",
    ),
  ]);

  B.add("l13-front", [
    {
      type: "pick",
      q: "Both objectives are maximised. Click every point on the Pareto front.",
      fig: Qf.points({ A: [1, 7], B: [3, 6], C: [2, 3], D: [5, 5], E: [6, 2], F: [4, 4], G: [7, 1] }),
      a: ["A", "B", "D", "E", "G"],
      why: "C (2, 3) is beaten by B (3, 6) and F (4, 4) by D (5, 5). A, B, D, E and G each lead on one objective against every rival, so none is dominated.",
    },
    TF(
      "Every point on the Pareto front dominates every point that is not on it.",
      false,
      "A dominated point is beaten by at least one front point, not by all of them. In the wind farm, layout G is beaten by D but not by the cheap layout A.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Objective vector", "One number per objective for a single solution"],
        ["a dominates b", "a is no worse anywhere and better somewhere"],
        ["Mutually non-dominating", "Each of the two wins on some objective"],
        ["Pareto front", "The set of solutions nobody dominates"],
      ],
      why: "These four ideas are the language of multi-objective optimisation: scores become vectors, compared by dominance, and the best trade-offs form the front.",
    },
    M(
      "Both minimised: (1, 6), (2, 5), (3, 5), (4, 2), (5, 4) and (6, 1). How many are on the Pareto front?",
      ["3", "4", "5", "6"],
      1,
      "(3, 5) is beaten by (2, 5) and (5, 4) by (4, 2). The other four are on the front.",
      { hint: "For each point, look for another that is lower or equal on both and lower on one." },
    ),
    {
      type: "cat",
      q: "Single-objective GA or multi-objective GA?",
      buckets: ["Single-objective GA", "Multi-objective GA"],
      items: [
        ["Each individual's quality is one number", 0],
        ["The fitness values sort into a single list", 0],
        ["The answer is the fittest individual", 0],
        ["Selection compares vectors with dominance", 1],
        ["Returns a set of trade-off solutions", 1],
        ["Results are drawn as a curve or surface", 1],
      ],
      why: "A multi-objective GA keeps the generational loop but uses several objectives, selects by dominance and returns a Pareto front approximation.",
    },
    {
      type: "cat",
      q: "A search hands back a set of points approximating a Pareto front. Does each feature make the set better or worse?",
      buckets: ["Better approximation", "Worse approximation"],
      items: [
        ["The points are evenly spaced", 0],
        ["The points reach both ends of the front", 0],
        ["The points cover as much of the front as possible", 0],
        ["All the points sit in one small patch", 1],
        ["A big gap is left in the middle", 1],
        ["Both ends of the front are missing", 1],
      ],
      why: "A good approximation is evenly spaced and covers the largest possible area of the front, so a decision maker sees the full range of trade-offs.",
    },
  ]);

  // ---------- 13.3 non-dominated sorting and 13.4 crowding ----------
  B.add("l13-sorting", [
    {
      type: "pick",
      q: "Both objectives are minimised. Click every point in rank 1 (the second front).",
      fig: Qf.points({ A: [1, 6], B: [3, 3], C: [6, 1], D: [2, 7], E: [4, 5], F: [7, 4], G: [6, 7] }),
      a: ["D", "E", "F"],
      why: "Rank 0 is A, B and C. Remove them: D, E and F are not beaten by anyone left, but G (6, 7) is beaten by E (4, 5), so G is rank 2.",
    },
    {
      type: "order",
      q: "Put non-dominated sorting in order.",
      items: [
        "Find the solutions that nobody dominates",
        "Label them rank 0 and set them aside",
        "Find the solutions nobody among the rest dominates",
        "Label them rank 1 and set them aside",
        "Repeat until every solution has a rank",
      ],
      why: "Sorting peels the population front by front. Each front is the non-dominated set of whatever is left.",
    },
    M(
      "A population of 20 solutions is all mutually non-dominating. How many ranks does non-dominated sorting give?",
      ["1", "2", "10", "20"],
      0,
      "Nobody dominates anybody, so everyone is in rank 0. Only the tie-breaker can then tell them apart.",
    ),
    {
      type: "cat",
      q: "Does each rule mainly push the population towards the front (convergence) or along it (spread)?",
      buckets: ["Convergence", "Spread"],
      items: [
        ["Lower rank wins a tournament", 0],
        ["Keep every rank 0 solution", 0],
        ["Judge contestants against a comparison set", 0],
        ["Larger crowding distance wins a tie", 1],
        ["Prefer the smaller niche count", 1],
        ["The ends of a front get ∞", 1],
      ],
      why: "Rank and dominance reward being close to the front. Crowding, niching and protecting the extremes reward covering the front evenly.",
    },
    {
      type: "match",
      q: "Match each label to its meaning.",
      pairs: [
        ["Rank 0", "The non-dominated set of the whole population"],
        ["Rank 1", "Non-dominated once rank 0 is removed"],
        ["Crowding distance ∞", "An end point of a front"],
        ["Niche count", "Solutions within the niche radius"],
      ],
      why: "Ranks come from peeling fronts. Crowding distance gives the ends ∞ so the extremes are kept, and the niche count measures local density.",
    },
    M(
      "Both objectives are minimised and solution P ends up in rank 0. Which statement must be true?",
      [
        "No solution in the population dominates P",
        "P dominates every other solution in the population",
        "P has the lowest value of the first objective",
        "P has the smallest sum of the two objectives",
      ],
      0,
      "Rank 0 is exactly the non-dominated set. P need not beat anyone, lead on any single objective or have the smallest sum: it only has to be unbeaten.",
    ),
  ]);

  B.add("l13-crowding", [
    M(
      "A two-objective front has 6 points. How many get an infinite crowding distance?",
      ["0", "2", "4", "6"],
      1,
      "Sorting a two-objective front by f₁ also sorts it by f₂ in reverse, so the same two end points are the extremes for both objectives.",
    ),
    {
      type: "slider",
      q: "On f₁ a point's neighbours are 3 apart and f₁ spans 6. On f₂ they are 2 apart and f₂ spans 8. Estimate its crowding distance.",
      min: 0,
      max: 2,
      step: 0.05,
      ans: 0.75,
      tol: 0.1,
      hint: "3 ÷ 6 = 0.5, and 2 ÷ 8 = 0.25.",
      why: "Each objective adds gap ÷ range: 0.5 + 0.25 = 0.75.",
    },
    TF(
      "Niching needs an extra parameter, the niche radius, to be chosen.",
      true,
      "The niche radius decides who counts as a neighbour. Too small or too large and the niche counts stop telling solutions apart.",
    ),
    TF(
      "In NSGA-II, a solution with a larger crowding distance always beats one with a smaller distance.",
      false,
      "Rank comes first. Crowding distance only decides between solutions of the same rank.",
    ),
    M(
      "Why does crowding distance divide each gap by the range of that objective?",
      [
        "So objectives in different units count on the same scale",
        "So the end points of the front get an infinite distance",
        "So that the distance is always a whole number",
        "So the dominated solutions get a distance of zero",
      ],
      0,
      "Cost in pounds and power in megawatts have very different sizes. Dividing by the range turns each gap into a share of that objective's spread.",
    ),
    M(
      "With niche radius 1, solution X has 4 others within distance 1 and Y has 1. Both are rank 0. Which does niching prefer?",
      ["Y", "X", "Neither"],
      0,
      "Niching prefers the solution in the niche with fewer members, so Y, which sits in a sparser region.",
    ),
  ]);
})();

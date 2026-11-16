/* Nature-Inspired boss quiz for Lectures 13-14 (multi-objective evolutionary algorithms): a bike-share planner, fresh scenarios, mixed formats. Numbers checked with node. */
(function () {
  const N = NIC;
  const Qf = N.qfig;

  N.registerBoss({
    id: "l13-boss",
    lecture: 13,
    title: "Lectures 13–14 boss quiz",
    blurb:
      "Ten questions: dominance, Pareto fronts, sorting and crowding, NSGA-II and many objectives, for a bike-share planner.",
    lede: "Wheelie, a city bike-share scheme, plans where to put its docking stations. Every plan has a running cost and an average walk for riders, and both should be as small as possible. Use dominance, ranking, crowding and NSGA-II to help, without a calculator.",
    qs: [
      {
        type: "mcq",
        q: "Wheelie scores each docking plan on running cost, average walk and the CO₂ of the vans that move bikes around. How is the quality of one plan described?",
        o: [
          "A vector of three numbers, one for each objective",
          "The sum of the three numbers, so plans can be sorted",
          "The worst of the three numbers, so weak plans are caught",
          "The cost alone, with walk and CO₂ ignored as side issues",
        ],
        a: 0,
        why: "A multi-objective solution is scored by its objective vector (f₁(x), f₂(x), f₃(x)). Adding the numbers up or keeping one of them would turn it back into a single-objective problem.",
      },
      {
        type: "pick",
        q: "Seven plans, plotted as (cost, walk), both minimised. Click every plan on the Pareto front.",
        fig: Qf.points({ A: [1, 7], B: [2, 4], C: [3, 5], D: [4, 2], E: [5, 6], F: [6, 1], G: [7, 3] }),
        a: ["A", "B", "D", "F"],
        why: "C (3, 5) is beaten by B (2, 4), E (5, 6) by B and D, and G (7, 3) by D (4, 2) and F (6, 1). Nobody beats A, B, D or F on both objectives.",
      },
      {
        type: "cat",
        q: "Each line compares two plans as (cost, walk), both minimised. Sort them.",
        buckets: ["First dominates", "Second dominates", "Neither dominates"],
        items: [
          ["(3, 5) against (4, 6)", 0],
          ["(6, 2) against (6, 5)", 0],
          ["(2, 7) against (2, 6)", 1],
          ["(1, 8) against (5, 3)", 2],
          ["(4, 4) against (4, 4)", 2],
          ["(3, 3) against (2, 5)", 2],
        ],
        why: "Dominating needs at least as good everywhere and strictly better somewhere. A tie on one objective is fine if the other is better. Identical plans dominate neither way, and plans that each win on one objective are mutually non-dominating.",
      },
      {
        type: "order",
        q: "Put one NSGA-II generation in order.",
        items: [
          "Make N children by selection, crossover and mutation",
          "Merge parents and children into 2N solutions",
          "Rank all 2N with the fast non-dominated sort",
          "Copy whole ranks into the next generation while they fit",
          "Fill the last places from the overflowing rank by crowding distance",
        ],
        why: "NSGA-II is elitist: parents and children compete together, ranks fill the next generation in order, and crowding distance splits the rank that does not fit.",
      },
      {
        type: "slider",
        q: "One front of plans as (cost, walk): P (1, 9), Q (3, 6), R (4, 4), S (7, 2), T (9, 1). Estimate the crowding distance of R.",
        min: 0,
        max: 2,
        step: 0.05,
        ans: 1,
        tol: 0.1,
        hint: "Cost: R's neighbours are Q (3) and S (7), gap 4, range 9 − 1 = 8. Walk: neighbours S (2) and Q (6), gap 4, range 8.",
        why: "Cost adds 4 ÷ 8 = 0.5 and walk adds 4 ÷ 8 = 0.5, so R's crowding distance is 1.0. P and T are the ends and get ∞.",
      },
      {
        type: "match",
        q: "Match each term to what it does.",
        pairs: [
          ["Niche radius", "How close solutions must be to share a niche"],
          ["Comparison set size C", "Sets the selection pressure in Pareto tournaments"],
          ["Crowding distance", "Breaks ties between solutions of the same rank"],
          ["Rank 0", "The solutions nobody in the population dominates"],
        ],
        why: "The niche radius is niching's extra parameter. C is the size of the set Z that judges two contestants. Crowding distance is NSGA-II's tie-breaker, and rank 0 is the non-dominated set.",
      },
      {
        type: "multi",
        q: "Wheelie swaps an old non-elitist multi-objective GA for NSGA-II. Which reasons from the lecture support the swap?",
        o: [
          "There is no niche size to tune",
          "It runs and converges faster",
          "The best plans found so far survive each generation",
          "It can never converge prematurely",
          "It needs no crossover or mutation",
        ],
        a: [0, 1, 2],
        why: "NSGA-II is elitist, needs no extra parameters such as niche sizes, and converges faster. It still uses crossover and mutation, and there is some evidence it can converge prematurely on certain problems.",
      },
      {
        type: "mcq",
        q: "Wheelie tries a single-objective GA on 2 × cost + walk, then on cost + 2 × walk, and so on. Plan M is on the Pareto front, inside a dent of it. What happens to M?",
        o: [
          "No weighting ever returns M",
          "One weighting returns M, but only with equal weights",
          "Every weighting returns M, since it is non-dominated",
          "M is returned once the weights add up to more than 1",
        ],
        a: 0,
        why: "A weighted sum is a straight line pushed against the front, so it can only touch points on the convex parts. Points in a dent are never selected, and each weighting needs its own run.",
      },
      {
        type: "bug",
        q: "This pseudocode should compute NSGA-II crowding distances for one front Y of N plans. Click the faulty line.",
        code: [
          "set d[i] = 0 for every plan i",
          "for each objective m:",
          "    sort Y by objective m",
          "    d[1] = d[N] = infinity",
          "    for i = 2 to N - 1:",
          "        d[i] += (Y[i+1][m] - Y[i][m]) / (fmax[m] - fmin[m])",
        ],
        a: 5,
        why: "The gap must span both neighbours: Y[i+1][m] − Y[i−1][m]. Using Y[i] measures only one side of the cuboid.",
      },
      {
        type: "mcq",
        q: "Wheelie adds three more objectives, six in all. Which problem gets much worse?",
        o: [
          "Most pairs of plans become mutually non-dominating",
          "Crossover can no longer combine two plans",
          "Each plan's objectives become impossible to compute",
          "Every plan ends up dominated by some other plan",
        ],
        a: 0,
        why: "With M objectives only 2 ÷ 2ᴹ of the space around a plan is comparable (1/32 for six), so dominance hardly separates plans. The front also needs far more points and cannot be drawn directly.",
      },
    ],
  });
})();

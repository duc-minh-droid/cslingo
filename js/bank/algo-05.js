(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
  B.add("a2-routing", [
    M(
      "In link-state routing, routers share…",
      [
        "full routing tables, but only with direct neighbours",
        "descriptions of their own links, flooded to all",
        "nothing at all: each works alone",
        "only their default routes",
      ],
      1,
      "Everyone builds the same map.",
    ),
    M(
      "Distance-vector routing is based on which update?",
      ["Prim's spanning-tree update", "Bellman–Ford", "Kruskal's edge-sorting update", "A* with a distance heuristic"],
      1,
      "Distributed Bellman–Ford.",
    ),
    M(
      "What causes count-to-infinity?",
      [
        "Having too many routers in one network",
        "Stale routes looping between neighbours",
        "Encrypted routing messages",
        "Link-state flooding",
      ],
      1,
      "Each router believes the other still has a path.",
    ),
    TF("Each link-state router computes its routes independently.", true, "Each runs Dijkstra on the shared map."),
    M(
      "Split horizon means…",
      [
        "splitting the network into two separate halves",
        "not advertising a route back to where you learnt it",
        "using two paths for every destination",
        "flooding every update to everyone",
      ],
      1,
      "A milder form of poisoned reverse.",
    ),
    M(
      "Which usually converges faster after a failure?",
      ["Distance-vector", "Link-state", "Same", "Neither ever converges"],
      1,
      "Everyone recomputes from the full map.",
    ),
    M(
      "A distance-vector message contains…",
      [
        "the whole network map, as the sender sees it",
        "the sender's current distance to each destination",
        "the encryption keys for each link",
        "the packets being forwarded",
      ],
      1,
      "A table of estimates.",
    ),
    M(
      "A reaches B at cost 2 (B says X is 5) and C at cost 4 (C says X is 1). A's best route to X?",
      ["7 via B", "5 via C", "1 via C", "6 via B"],
      1,
      "Via B: 2 + 5 = 7. Via C: 4 + 1 = 5.",
    ),
  ]);

  /* ---------- Phase 3 ---------- */
  B.add("a3-lp", [
    {
      type: "match",
      q: "Match each LP part to its role.",
      pairs: [
        ["Decision variables", "What you choose (e.g. how many of each product)"],
        ["Objective", "The linear quantity to maximise or minimise"],
        ["Constraints", "Linear limits the choice must satisfy"],
      ],
      why: "The three ingredients of every LP.",
    },
    M(
      "What shape is an LP's feasible region?",
      [
        "A circle, or an ellipse in general",
        "A convex polygon (a polytope in higher dimensions)",
        "Always a square",
        "Any shape, including ones with dents",
      ],
      1,
      "Intersection of half-planes.",
    ),
    M(
      "Maximise 2x + y with x + y ≤ 5, x, y ≥ 0. Optimum?",
      ["(0,5), z = 5", "(5,0), z = 10", "(2.5,2.5), z = 7.5", "(0,0), z = 0"],
      1,
      "Corners (0,0), (5,0), (0,5) give 0, 10, 5.",
    ),
    TF(
      "An LP's optimum can only ever be strictly inside the feasible region.",
      false,
      "Optima are always found at corners (sometimes a whole edge ties).",
    ),
    M(
      'A "binding" constraint at the optimum…',
      ["is ignored by the solver", "holds with equality", "is violated by the solution", "has no effect on the answer"],
      1,
      "Relaxing it would improve the objective.",
    ),
    M(
      "An LP is unbounded when…",
      [
        "no point satisfies all the constraints at once",
        "the objective can improve forever inside the region",
        "it has only one corner",
        "every constraint is binding",
      ],
      1,
      "Nothing stops it growing.",
    ),
    M(
      "Graphically, you find the optimum by…",
      [
        "guessing a likely corner and checking its neighbours",
        "sliding the objective line to its last contact point",
        "drawing a circle around the region",
        "picking the centre of the region",
      ],
      1,
      "The last point touched is a corner.",
    ),
    M(
      "Two adjacent corners give the same best z. What does that mean?",
      [
        "There's no solution, since the two corners conflict",
        "Every point on the edge between them is optimal",
        "Only one of them is really optimal",
        "The LP is infeasible",
      ],
      1,
      "The objective is parallel to that edge.",
    ),
  ]);
  B.add("a3-simplex", [
    M(
      "Why add slack variables?",
      [
        "To make each pivot faster",
        "To turn ≤ constraints into equations",
        "To remove variables from the problem",
        "To make the problem nonlinear",
      ],
      1,
      "Slack = unused capacity.",
    ),
    M(
      "Dantzig's rule picks the entering variable with…",
      [
        "the smallest coefficient, to take careful steps",
        "the largest positive gain in the objective",
        "a random choice",
        "the first alphabetically",
      ],
      1,
      "Biggest improvement per unit.",
    ),
    M(
      "The leaving variable is chosen by…",
      ["the largest ratio", "the minimum ratio test", "random choice", "the objective coefficient"],
      1,
      "The first constraint to become tight.",
    ),
    M(
      "A pivot…",
      [
        "changes the objective function",
        "swaps one basic variable for another",
        "adds a new constraint",
        "restarts from the origin",
      ],
      1,
      "One step along an edge.",
    ),
    TF(
      "The simplex method moves through the interior of the feasible region.",
      false,
      "It stays on corners and edges.",
    ),
    M(
      "Degeneracy can cause…",
      [
        "infeasibility of the whole problem",
        "a pivot that doesn't improve the objective",
        "an unbounded LP",
        "faster convergence",
      ],
      1,
      "Rare cases where you move without gaining.",
    ),
    M(
      "For maximisation, simplex has reached the optimum when…",
      [
        "all variables are positive and the tableau is full",
        "no variable has a positive gain (reduced cost)",
        "the tableau is empty",
        "z equals 0",
      ],
      1,
      "No edge improves.",
    ),
    M(
      "LPs can have astronomically many corners. Why is simplex still practical?",
      [
        "It checks them all very quickly using clever tricks",
        "It usually visits only a small fraction of them",
        "Corners don't affect the answer",
        "It follows the gradient instead",
      ],
      1,
      "Worst cases are rare in practice.",
    ),
  ]);
  B.add("a3-bracket", [
    M(
      "Three points a < b < c with f(b) lower than both f(a) and f(c) tell you…",
      [
        "nothing about the minimum",
        "a minimum lies between a and c",
        "the function is linear there",
        "b is the global minimum",
      ],
      1,
      "That's a bracket.",
    ),
    M(
      "Golden-section probes sit at roughly which fractions of the interval?",
      ["0.25 and 0.75", "0.382 and 0.618", "0.5 only", "0.1 and 0.9"],
      1,
      "Placed so one probe can be reused next step.",
    ),
    M(
      "About how many golden-section steps shrink a bracket to 1% of its width?",
      ["3", "10", "50", "100"],
      1,
      "0.618¹⁰ ≈ 0.008, just under 1%.",
      { hint: "0.618⁵ ≈ 0.09. Square it." },
    ),
    TF("Golden-section search needs the function's derivative.", false, "It only compares function values."),
    M(
      "Advantage of golden-section over naive two-probe bisection?",
      [
        "It halves the bracket every step",
        "It reuses one old evaluation per step",
        "It finds the global minimum",
        "It uses the gradient at each probe",
      ],
      1,
      "One new evaluation per step instead of two.",
    ),
    M(
      "When does golden-section search stop?",
      [
        "After exactly one step, since the ratio is fixed",
        "When the bracket is narrower than the tolerance",
        "When f reaches 0",
        "Never: it runs forever",
      ],
      1,
      "Width below tolerance.",
    ),
    M(
      "The function has several dips inside the bracket. Risk?",
      [
        "None: it always finds the lowest dip in the bracket",
        "It may home in on a local minimum and miss the best",
        "It crashes on multi-dip functions",
        "It becomes exact",
      ],
      1,
      "Unimodality is the key assumption.",
    ),
    M(
      "Maximising instead of minimising: which side do you keep?",
      [
        "The side with the lower probe value",
        "The side containing the higher probe value",
        "Always the left",
        "Always the right",
      ],
      1,
      "Flip the comparison.",
    ),
  ]);
  B.add("a3-nm", [
    TF(
      'Nelder–Mead\'s "simplex" is the same thing as the LP simplex method.',
      false,
      "Same word, different ideas: here it's a shape of n + 1 points.",
    ),
    M(
      "In 2D, Nelder–Mead starts with…",
      ["a single point", "a triangle of 3 points", "a square of 4 points", "a line of 2 points"],
      1,
      "n + 1 = 3.",
    ),
    M(
      "Reflection puts the new point at…",
      [
        "the best corner of the current simplex",
        "the centroid plus (centroid − worst)",
        "the origin",
        "a random spot nearby",
      ],
      1,
      "Flip the worst through the middle of the others.",
    ),
    TF("Nelder–Mead always finds the global minimum.", false, "It's a local heuristic."),
    M(
      "When does Nelder–Mead shrink the whole simplex?",
      [
        "As its very first move on every single iteration",
        "When reflection and contraction both fail",
        "On every step, after reflecting",
        "Never: shrinking isn't one of its moves",
      ],
      1,
      "Last resort.",
    ),
    M(
      "A typical stopping rule for Nelder–Mead?",
      [
        "After a single reflection step has been taken",
        "When the simplex is tiny or values nearly equal",
        "As soon as it performs an expansion",
        "When the function value becomes negative",
      ],
      1,
      "It has collapsed onto a point.",
    ),
    M(
      "Why does Nelder–Mead handle noisy simulations reasonably well?",
      ["It uses exact derivatives", "It only compares values", "It averages everything", "It doesn't"],
      1,
      "Comparisons are robust.",
    ),
    M(
      "How does Nelder–Mead cope with very many dimensions?",
      [
        "Better and better, since it has more room to move",
        "Poorly: slow and unreliable as dimensions grow",
        "Exactly the same as it does in 2D",
        "It can't start with more than 3 points",
      ],
      1,
      "A known weakness.",
    ),
  ]);

  /* ---------- Phase 4 ---------- */
  B.add("a4-cut", [
    M(
      "A cut in a graph is…",
      [
        "removing a single edge",
        "splitting the nodes into two groups",
        "a shortest path between two nodes",
        "a cycle in the graph",
      ],
      1,
      "Edges crossing the split connect the groups.",
    ),
    M(
      "A crossing edge of a cut…",
      ["has both ends in one group", "has one end in each group", "is always the heaviest", "is never in the MST"],
      1,
      "It bridges the two groups.",
    ),
    M(
      "The cycle property says…",
      [
        "the lightest edge on a cycle is never needed",
        "the heaviest edge on a cycle (if unique) is in no MST",
        "cycles are required",
        "cycles cost nothing",
      ],
      1,
      "Remove it and the rest of the cycle still connects its ends.",
    ),
    TF("If all edge weights are distinct, the MST is unique.", true, "No ties, no alternative trees."),
    M(
      "A cut is crossed by edges of weight 5, 5 and 8. Which is safe?",
      ["Only the 8", "Either 5", "Neither 5", "All three"],
      1,
      "Some MST uses each of the lightest crossing edges.",
    ),
    M(
      "How is the cut property proved?",
      ["By induction on colours", "Exchange argument", "By testing", "It isn't"],
      1,
      "Swap and compare totals.",
    ),
    M(
      "Is the lightest edge in the whole graph in some MST?",
      [
        "No: it might close a cycle",
        "Yes: it's the lightest edge across some cut",
        "Only when the graph is already a tree",
        "Only if its weight is unique",
      ],
      1,
      "Take the cut separating one of its ends.",
    ),
    M("An MST of 6 nodes has how many edges?", ["5", "6", "15", "30"], 0, "n − 1."),
  ]);
})();

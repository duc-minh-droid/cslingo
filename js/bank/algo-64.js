(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  B.add("a3-brent", [
    M(
      "Brent's method fits a parabola through…",
      [
        "three bracket points and their f values",
        "two bracket points and a slope estimate",
        "just the two ends of the bracket and f at each",
        "every point evaluated so far, whatever their order",
      ],
      0,
      "Three points define a unique parabola.",
    ),
    M(
      "The parabola's lowest point lands outside [a, c]. What does Brent do?",
      [
        "Take a golden-section step",
        "Jump there anyway, as it is the best guess",
        "Stop and report that the bracket has failed",
        "Halve the bracket and retry the fit",
      ],
      0,
      "An outside point could lose the minimum, so the safe golden step is used.",
    ),
    M(
      "On f(x) = x² − 4x + 5 the formula with a = 0, b = 1, c = 5 gives…",
      ["2", "1", "3", "2.5"],
      0,
      "f is a parabola with minimum at 2, and fitting a parabola to three of its points recovers it exactly.",
    ),
    M(
      "Why must step sizes be diminishing?",
      [
        "To make sure the loop is actually converging",
        "To keep the numbers in the loop small enough",
        "So that f is evaluated fewer times overall",
        "To avoid ever producing a negative bracket width",
      ],
      0,
      "Otherwise parabolic steps could bounce around without settling.",
    ),
    M(
      "Three bracket points lie on a straight line. The parabola formula…",
      [
        "divides by zero: there is no parabola",
        "returns the middle point b as its answer",
        "returns the larger of the two ends as the vertex",
        "works as usual and gives a sharp vertex",
      ],
      0,
      "The denominator vanishes for collinear points.",
    ),
    TF(
      "Brent's method gives up the bracket to go faster.",
      false,
      "It always maintains a bracket; that is what the golden fallback protects.",
    ),
    M(
      "On a smooth function, parabolic steps converge…",
      [
        "faster than golden section's steady ×0.618",
        "exactly as fast as golden section on every function",
        "slower, because each step costs a parabola fit",
        "only on functions that are straight lines",
      ],
      0,
      "They are superlinear near a smooth minimum.",
    ),
    M(
      "Which pair of ideas does Brent's method combine?",
      [
        "Parabolic interpolation and golden section",
        "Bisection and ternary search together",
        "Reflection and expansion from simplex methods",
        "Simplex pivoting and bisection together",
      ],
      0,
      "A fast guess plus a safe fallback.",
    ),
    M(
      "After a parabolic step, f(x) < f(b) and x > b. New triple?",
      ["(b, x, c)", "(a, b, x)", "(a, x, b)", "(x, b, c)"],
      0,
      "x is right of b and lower, so it is the new middle; b becomes the left end.",
    ),
    M(
      "Where would you expect a pure parabola jump to behave worst?",
      [
        "At a sharp kink in the function",
        "On the perfect parabola x²",
        "On a smooth bowl-shaped function",
        "Near a minimum that is exactly quadratic",
      ],
      0,
      "A kink is nothing like a parabola, so the fit misleads and the golden fallback matters.",
    ),
    {
      type: "order",
      q: "Order the safeguards Brent applies to a proposed parabolic step.",
      items: [
        "Compute the parabola's lowest point",
        "Check it lies inside (a, c)",
        "Check the step is smaller than before",
        "If either check fails, use golden section",
      ],
      why: "Propose, check inside, check shrinking, fall back if needed.",
    },
    M(
      "After a golden fallback step, the bracket is…",
      [
        "still a valid triple around the minimum",
        "possibly invalid until it is checked again",
        "reset to the original starting triple",
        "discarded and rebuilt from scratch",
      ],
      0,
      "Both kinds of step use the same update rule that keeps f(b) the lowest.",
    ),
  ]);

  B.add("a3-nm-ops", [
    M(
      "W = (0, 0), B = (4, 2), G = (2, 4). Where is the centroid C?",
      ["(3, 3)", "(2, 2)", "(6, 6)", "(1, 1.5)"],
      0,
      "C is the average of the two best points: ((4+2)/2, (2+4)/2).",
      { hint: "Add the two best, halve." },
    ),
    M(
      "C = (3, 3) and W = (1, 1). With α = 1, where is the reflection R?",
      ["(5, 5)", "(4, 4)", "(2, 2)", "(6, 6)"],
      0,
      "R = C + (C − W) = (3, 3) + (2, 2).",
    ),
    M(
      "Same C and W with γ = 2. Where is the expansion E?",
      ["(7, 7)", "(5, 5)", "(6, 6)", "(4, 4)"],
      0,
      "E = C + 2(C − W) = (3, 3) + (4, 4).",
      { hint: "C − W = (2, 2); double it." },
    ),
    M(
      "With β = ½, C = (3, 3), W = (1, 1): the inside contraction M₁ is…",
      ["(2, 2)", "(4, 4)", "(1, 1)", "(3, 3)"],
      0,
      "M₁ = C − ½(C − W) = (3, 3) − (1, 1).",
    ),
    M(
      "f(R) < f(B). What is tried next?",
      ["Expansion", "Inside contraction", "Shrink", "Stop"],
      0,
      "A reflection beating the best suggests going further.",
    ),
    M(
      "f(B) ≤ f(R) < f(G). The move is…",
      ["accept R, nothing more", "try an expansion to E", "contract to M₁ and M₂", "shrink every point to B"],
      0,
      "R is good enough to replace W but not exceptional.",
    ),
    M(
      "f(R) ≥ f(G). The move is…",
      [
        "a contraction (try M₁ and M₂)",
        "an expansion beyond R",
        "accept R as it stands",
        "a restart with a new simplex",
      ],
      0,
      "R overshot or went nowhere, so pull back.",
    ),
    M(
      "Which point never moves during a shrink?",
      ["B, the best vertex", "W, the worst vertex", "G, the good vertex", "C, the centroid"],
      0,
      "Everything contracts towards B.",
    ),
    TF(
      "In 2-D, the centroid includes the worst point.",
      false,
      "It averages all vertices except the worst (the 'best side').",
    ),
    M(
      "f(R) = 9, f(G) = 8, f(W) = 12, f(M₁) = 13, f(M₂) = 14. The move is…",
      ["Shrink", "Accept M₁", "Accept M₂", "Accept R"],
      0,
      "R is not below G, and neither middle point beats W (12), so shrink.",
      { hint: "Compare M₁ and M₂ with f(W) = 12." },
    ),
    M(
      "Shrinking a 2-D simplex costs how many new evaluations (not counting R, M₁, M₂)?",
      ["2", "1", "3", "0"],
      0,
      "W and G move, so two new points need values.",
    ),
    {
      type: "match",
      q: "Match each constant to its usual value.",
      pairs: [
        ["α (reflection)", "1"],
        ["γ (expansion)", "2"],
        ["β (contraction)", "½"],
        ["δ (shrink)", "½"],
      ],
      why: "The usual quartet is 1, 2, ½, ½ with α > 0, γ > 1 and 0 < β, δ < 1.",
    },
    M(
      "On a strictly convex function, a shrink step…",
      ["can never be needed", "happens every round", "happens only in 3-D", "is the first move"],
      0,
      "Convexity forces at least one contraction point to beat W, so the shrink is only for awkward non-convex shapes.",
    ),
  ]);

  B.add("a3-nm-stop", [
    M(
      "Domain convergence means…",
      [
        "all simplex vertices are close together",
        "the f values at the vertices agree",
        "the iteration cap was hit",
        "the gradient is zero",
      ],
      0,
      "It tests where the points are, not how high they are.",
    ),
    M(
      "Function convergence means…",
      [
        "the values at the vertices are close to each other",
        "the vertices all coincide at a single point",
        "the run used up its time budget",
        "the best value f reached zero exactly",
      ],
      0,
      "A small spread max f − min f.",
    ),
    M(
      "Why is domain convergence needed for discontinuous f?",
      [
        "Values can agree while the simplex is still large",
        "Gradients are needed to detect convergence",
        "Discontinuous functions have no minimum at all",
        "Values are always large for such functions",
      ],
      0,
      "Equal values across a plateau or jump do not prove the simplex has settled.",
    ),
    M(
      "Which test breaks if the minimum value of f is 5?",
      [
        "Stopping when the sum of vertex values is below 10⁻³",
        "Stopping when the spread max f − min f is small enough",
        "Stopping on the iteration cap being reached",
        "Stopping when the vertices are close together",
      ],
      0,
      "The sum tends to 15, never below 10⁻³. The other tests do not care about the level.",
    ),
    M(
      "The 2-D Rosenbrock function f(x, y) = 100(y − x²)² + (1 − x)²: f(0, 0) is…",
      ["1", "0", "100", "−1"],
      0,
      "100(0 − 0)² + (1 − 0)² = 1.",
    ),
    M(
      "Rosenbrock's minimum is at…",
      [
        "x = 1, y = 1 with f = 0",
        "(0, 0), the origin, with f = 1",
        "(−1, 1), the start, with f = 4",
        "(2, 4) on the parabola, with f = 1",
      ],
      0,
      "Both squared terms vanish at (1, 1).",
    ),
    M(
      "Updating the centroid C′ = C − x_old/D + x_new/D costs…",
      [
        "O(D) instead of O(D²)",
        "O(D²), the same as re-summing everything",
        "O(1), independent of D",
        "O(2ᴰ), exponential in D",
      ],
      0,
      "You adjust each coordinate once instead of re-summing all D points.",
    ),
    M(
      "What usually dominates the run time of Nelder–Mead?",
      ["Evaluating f", "Sorting three numbers", "Computing the centroid", "Drawing the plot"],
      0,
      "When f is a simulation, each evaluation costs far more than the bookkeeping.",
    ),
    M(
      "McKinnon's counter-examples show that Nelder–Mead…",
      [
        "can stall at a non-stationary point",
        "always converges to the true minimum",
        "cannot work at all in two dimensions",
        "needs the Hessian matrix at each vertex",
      ],
      0,
      "It has no general convergence guarantee.",
    ),
    M(
      "A convergence result needs the simplex angles to stay…",
      [
        "bounded away from 0 and π",
        "exactly 60° at every iteration",
        "all zero, so the simplex is flat",
        "all equal to each other",
      ],
      0,
      "A degenerate (flattened) simplex loses descent directions.",
    ),
    M(
      "In SciPy, Nelder–Mead is selected with…",
      [
        "scipy.optimize.minimize(method='Nelder-Mead')",
        "scipy.linalg.solve with a Nelder-Mead flag",
        "numpy.fft.fft applied to the vertices",
        "scipy.sparse.csgraph on the simplex",
      ],
      0,
      "MATLAB's equivalent is fminsearch.",
    ),
    {
      type: "cat",
      q: "Which optimiser fits each job?",
      buckets: ["Bisection", "Golden / Brent", "Nelder–Mead"],
      items: [
        ["Find the zero of f′ for a smooth convex f", 0],
        ["Minimise a bracketed one-variable function with no derivative", 1],
        ["Tune four settings of a noisy simulator", 2],
        ["Minimise a black-box function of three variables", 2],
      ],
      why: "Roots → bisection; one-variable minima → golden/Brent; several variables with only values → Nelder–Mead.",
    },
    M(
      "Rosenbrock with tolerance 10⁻² can stop short of (1, 1) because…",
      [
        "the valley is so flat that vertex values agree early",
        "10⁻² is the minimum value of f",
        "the simplex always jumps right over the minimum",
        "the function is discontinuous along the valley",
      ],
      0,
      "Function convergence only sees close values, and values along the valley change slowly.",
    ),
  ]);

  /* top-up for the deepened Nelder–Mead lesson */
  B.add("a3-nm", [
    M(
      "A function of 10 variables is minimised by Nelder–Mead. How many vertices does the simplex have?",
      ["11", "10", "20", "9"],
      0,
      "D + 1 = 11.",
    ),
    M(
      "Why does the simplex need D + 1 points (not D)?",
      [
        "D + 1 is the fewest points that enclose a volume in D-space",
        "D points would make the algorithm too fast to be reliable",
        "One point is reserved to hold the final answer",
        "It is an arbitrary choice made by convention",
      ],
      0,
      "D points span only a flat slice; one more gives the shape volume.",
    ),
    M(
      "The initial simplex is x₀ and D points each with one coordinate scaled by 1.1. When does this fail?",
      [
        "When a coordinate of x₀ is 0",
        "When x₀ has very large coordinates",
        "When D is exactly 2",
        "When f happens to be convex",
      ],
      0,
      "0 × 1.1 = 0, so points coincide and the simplex collapses.",
    ),
    M(
      "Nelder–Mead on a non-smooth function has what advantage over gradient descent?",
      [
        "It needs only function values",
        "It is always faster",
        "It converges to the global minimum",
        "It needs the Hessian",
      ],
      0,
      "No derivatives, so kinks and noise do not stop it.",
    ),
    M(
      "The centroid in 2-D is the midpoint of…",
      [
        "the best and good vertices",
        "the best and worst vertices",
        "the good and worst vertices",
        "all three vertices of the triangle",
      ],
      0,
      "It averages everything except the worst.",
    ),
    TF(
      "The LP simplex method and the Nelder–Mead simplex are the same algorithm.",
      false,
      "They share a name only: one walks corners of a polytope, the other moves a simplex through a continuous space.",
    ),
    M(
      "Which vertex is replaced each Nelder–Mead round (before any shrink)?",
      ["The worst", "The best", "A random one", "The newest"],
      0,
      "Reflection, expansion and contraction all replace W.",
    ),
    M(
      "Compared with a point, the simplex's advantage is that…",
      [
        "its shape gives several directions",
        "it is bigger than a single point is",
        "it needs fewer evaluations per round",
        "it carries a gradient inside it",
      ],
      0,
      "Comparing vertex values gives a sense of downhill without derivatives.",
    ),
  ]);
})();

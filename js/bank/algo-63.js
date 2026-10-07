(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  B.add("a3-convex", [
    M(
      "f(x) = x⁴ is convex on all of ℝ. Which fact shows it quickly?",
      ["f″(x) = 12x² is never negative", "f′(x) = 4x³ is positive", "f(x) is never negative itself"],
      0,
      "A non-negative second derivative everywhere means the curve never bends downwards.",
    ),
    M(
      "x₁ = 0, x₂ = 4, t = ½ for f(x) = x². What is the chord height at x = 2?",
      ["8", "4", "16", "2"],
      0,
      "½·f(0) + ½·f(4) = ½·0 + ½·16 = 8, while f(2) = 4: the chord is above the curve.",
      { hint: "Half of 0 plus half of 16." },
    ),
    TF(
      "If one chord of a function dips below the graph, the function is not convex.",
      true,
      "Convexity requires every chord to stay on or above the graph. One counter-example is enough to refute it.",
    ),
    M(
      "Which set is convex?",
      ["A solid triangle", "A crescent moon", "A ring with a hole", "Two separate discs"],
      0,
      "Any segment joining two points of a solid triangle stays inside it. The others fail for some pair of points.",
    ),
    M(
      "The epigraph of f is the region…",
      ["on and above the graph of f", "on and below the graph of f", "inside the chord only", "where f″ is zero"],
      0,
      "epi f = {(x, u) : u ≥ f(x)}. f is convex exactly when this set is convex.",
    ),
    {
      type: "cat",
      q: "Convex on the whole real line, or not?",
      buckets: ["Convex", "Not convex"],
      items: [
        ["eˣ", 0],
        ["x²", 0],
        ["sin x", 1],
        ["x³", 1],
        ["|x|", 0],
      ],
      why: "eˣ (f″ = eˣ > 0), x² and |x| pass. sin x bends both ways, and x³ has f″ = 6x which is negative for x < 0.",
    },
    M(
      "A Hessian has eigenvalues 3 and 0. The function is…",
      [
        "still allowed to be convex (all eigenvalues ≥ 0)",
        "not convex, since one eigenvalue is zero",
        "strictly convex everywhere",
        "a saddle",
      ],
      0,
      "The test is eigenvalues ≥ 0. A zero eigenvalue means flat curvature in that direction, as for x² + 0·y².",
    ),
    M(
      "For the saddle f = x² − y², the Hessian eigenvalues are…",
      ["2 and −2", "2 and 2", "−2 and −2", "1 and 1"],
      0,
      "f_xx = 2 and f_yy = −2, with no cross term. One positive and one negative: a saddle.",
    ),
    M(
      "Why is a convex function easy to minimise?",
      [
        "Any local minimum is the global minimum",
        "It has no minimum",
        "Its minimum is always at x = 0",
        "Its derivative is always positive",
      ],
      0,
      "There is only one bowl, so a method cannot be trapped in a worse dip.",
    ),
    M(
      "For smooth convex f, minimising f is the same as finding a root of…",
      ["f′", "f″", "f itself", "f⁻¹"],
      0,
      "At the minimum the slope is zero, so we look for f′(x) = 0.",
    ),
    {
      type: "order",
      q: "Order these from the quickest single check to the full definition of convexity.",
      items: [
        "Check f″ at one point",
        "Check f″ ≥ 0 everywhere on the set",
        "Check the chord inequality for every pair of points and every t",
      ],
      why: "One point tells you little; f″ ≥ 0 everywhere on the set is the derivative form; the chord inequality for all pairs is Jensen's definition itself.",
    },
    M(
      "Is x³ convex on X = [2, 3]?",
      ["Yes: f″ = 6x > 0 on X", "No: it is a cubic", "No: f″ changes sign", "Only on [0, 1]"],
      0,
      "Convexity depends on the set X. On [2, 3], 6x is between 12 and 18, always positive.",
    ),
  ]);

  B.add("a3-bisect", [
    M(
      "g(3) = −4 and g(5) = 2, g continuous. What can you conclude?",
      ["There is a root between 3 and 5", "The root is exactly 4", "There is no root", "There are exactly two roots"],
      0,
      "A sign change of a continuous function guarantees at least one zero-crossing in between.",
    ),
    M(
      "Bracket [2, 6]; g(2) < 0 and g(4) > 0. Which interval is kept?",
      ["[2, 4]", "[4, 6]", "[3, 5]", "[2, 6]"],
      0,
      "g(2) < 0 and g(4) > 0 still straddle zero, so the root is in [2, 4]; [4, 6] might not contain a sign change.",
    ),
    M("A bracket is 8 wide. After 3 halvings, how wide is it?", ["1", "2", "4", "0.5"], 0, "8 → 4 → 2 → 1.", {
      hint: "Halve three times.",
    }),
    M("What is the bisection midpoint of [2, 10]?", ["6", "4", "8", "12"], 0, "(2 + 10) / 2 = 6."),
    TF(
      "Bisection needs g to have the same sign at both ends.",
      false,
      "The opposite: it needs a sign change between the ends.",
    ),
    M(
      "g(x) = 1/x on [−1, 1] has a sign change. Why does bisection mislead?",
      [
        "g is not continuous: the sign flips at a pole, not a root",
        "g has two roots, so the sign change cancels out",
        "The bracket is too wide, so the midpoint misses the root",
        "1/x is always positive, so there is no sign change",
      ],
      0,
      "The 'must cross zero' argument needs continuity.",
    ),
    M(
      "g(x) = (x − 1)² has a root at 1. Why can you not bracket it by signs?",
      [
        "g never goes below zero, so no sign change occurs",
        "g has no root",
        "Bisection can bracket it from any two points",
        "The root is complex",
      ],
      0,
      "A double root touches zero without crossing it.",
    ),
    M(
      "Bracket width 1; about how many halvings reach 0.001?",
      ["10", "100", "1000", "3"],
      0,
      "2¹⁰ = 1024 > 1000, so 10 halvings.",
      { hint: "1000 ≈ 2¹⁰." },
    ),
    {
      type: "order",
      q: "Order one bisection step.",
      items: [
        "Compute the midpoint m = (a + b) / 2",
        "Evaluate g(m)",
        "Compare the sign of g(m) with g(a)",
        "Move the end with the matching sign to m",
      ],
      why: "Midpoint, value, sign comparison, then shrink the bracket.",
    },
    M(
      "To minimise a smooth convex f by bisection, which function do you bisect?",
      ["f′", "f", "f²", "1/f"],
      0,
      "The minimum is where f′ = 0; bracket it with f′(a) < 0 < f′(b).",
    ),
    M(
      "Each bisection step gains…",
      [
        "one binary digit of accuracy",
        "one decimal digit of accuracy",
        "a shrink factor of 0.618",
        "a fixed gain that depends on g",
      ],
      0,
      "The width halves exactly, however the function behaves.",
    ),
    {
      type: "slider",
      q: "Bracket [0, 10] and tolerance 0.1: roughly how many halvings are needed?",
      min: 2,
      max: 14,
      step: 1,
      start: 5,
      ans: 7,
      tol: 1,
      unit: "steps",
      hint: "10 / 0.1 = 100, and 2⁷ = 128.",
      why: "10 / 2ⁿ ≤ 0.1 needs 2ⁿ ≥ 100, so n = 7.",
    },
  ]);

  B.add("a3-bracket", [
    M(
      "Values at a < b < c are 6, 2, 4. Is there a bracketed minimum?",
      [
        "Yes: the middle value is lowest",
        "No: the values must increase",
        "Only if c − a is small",
        "No: you need four points",
      ],
      0,
      "A bracket needs f(a) > f(b) < f(c), here 6 > 2 < 4.",
    ),
    M(
      "a < b < c bracket a minimum; x ∈ (a, b) with f(x) < f(b). New triple?",
      ["(a, x, b)", "(x, b, c)", "(a, b, x)", "(b, x, c)"],
      0,
      "x is lower than b, so it becomes the new middle: the minimum is between a and b.",
    ),
    M(
      "x ∈ (a, b) with f(x) ≥ f(b). New triple?",
      ["(x, b, c)", "(a, x, b)", "(a, b, x)", "(a, x, c)"],
      0,
      "b is still lowest; x is left of it and replaces the left end a.",
    ),
    M(
      "The golden-section fraction is…",
      [
        "(3 − √5)/2 ≈ 0.382",
        "1/3, the fraction ternary search uses",
        "1/2, the midpoint used by bisection",
        "√2 − 1, about 0.414",
      ],
      0,
      "A pattern that repeats exactly needs w² − 3w + 1 = 0, giving 0.382.",
    ),
    M(
      "Golden section shrinks a width-1 bracket. After about 5 steps?",
      ["≈ 0.09", "≈ 0.5", "≈ 0.2", "≈ 0.01"],
      0,
      "0.618⁵ ≈ 0.09.",
      { hint: "0.618² ≈ 0.38, 0.38² ≈ 0.15, × 0.618." },
    ),
    M(
      "Why does golden section need only one new evaluation per step?",
      [
        "One earlier probe is reused in the smaller bracket",
        "It evaluates the derivative f′ instead of f",
        "It never needs to evaluate the bracket ends",
        "It halves the bracket exactly each time",
      ],
      0,
      "The golden spacing puts the surviving probe exactly where the new bracket needs one.",
    ),
    M(
      "Ternary search (thirds) makes a ×⅔ cut using two evaluations. Compared with golden section per evaluation it is…",
      ["slower", "faster", "identical", "only valid in 2-D"],
      0,
      "⅔ per two evaluations is about 0.82 per evaluation, against 0.618 for golden.",
    ),
    M(
      "When can you stop a bracketing search?",
      [
        "When the bracket is narrow or f barely changes",
        "After exactly 10 steps, whatever f does",
        "When f(b) reaches exactly zero",
        "When f(a) and f(c) become equal to each other",
      ],
      0,
      "The lecture's criteria: sufficiently narrow bracket, or negligible change in the function.",
    ),
    TF(
      "Golden-section search needs the function to be unimodal within the bracket.",
      true,
      "With two dips inside, discarding a side can throw away the true minimum.",
    ),
    M(
      "To find a first bracket from a start point, a common trick is to…",
      [
        "step downhill with growing steps until f rises",
        "run the LP simplex method on the graph of f",
        "guess a point at random and hope",
        "differentiate f twice and solve",
      ],
      0,
      "Growing steps find an up-turn quickly; the last three points then form the bracket.",
    ),
    M(
      "Golden section vs bisection of f′. Which needs a derivative?",
      ["Bisection of f′", "Golden section", "Both", "Neither"],
      0,
      "Golden uses only values of f; bisection needs f′ to look for its sign change.",
    ),
    {
      type: "cat",
      q: "Valid bracket for a minimum? (values f(a), f(b), f(c))",
      buckets: ["Yes", "No"],
      items: [
        ["9, 4, 7", 0],
        ["2, 5, 8", 1],
        ["6, 8, 3", 1],
        ["3.2, 1.1, 1.5", 0],
      ],
      why: "The middle value must be the lowest of the three.",
    },
    M(
      "Why can precision beyond about √ε be pointless in floating point?",
      [
        "Near a smooth minimum f is flat, so values tie",
        "Computers cannot divide numbers that small",
        "The bracket stops shrinking at that width",
        "f becomes exactly linear at the minimum",
      ],
      0,
      "f differs from its minimum by about ½f″δ², which vanishes below machine precision before δ does.",
    ),
  ]);
})();

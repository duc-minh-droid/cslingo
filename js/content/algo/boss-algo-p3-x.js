/* boss-algo-p3-x: extra boss questions ported from the vault (LP and simplex, then convexity, bracketing and Nelder-Mead). */
(function () {
  const Qf = NIC.qfig;
  const def = NIC.bossDef("a3-boss");
  if (!def) return;
  const NMP = { B: [2, 5], G: [4, 5], W: [3, 3], X: [3, 7], Y: [3, 1], Z: [5, 5] };
  def.qs.push(
    {
      type: "mcq",
      q: "Convert this LP to standard form: <b>minimise</b> 4x + y subject to 2x + y ≥ 8, x + y = 5, x, y ≥ 0.",
      o: [
        "max −4x − y; −2x − y ≤ −8; x + y ≤ 5; −x − y ≤ −5",
        "max −4x − y; 2x + y ≤ 8; x + y ≤ 5; −x − y ≤ −5",
        "max 4x + y; −2x − y ≤ −8; x + y ≤ 5; −x − y ≤ −5",
        "max −4x − y; −2x − y ≤ −8; x + y ≤ 5; x + y ≥ 5",
      ],
      a: 0,
      why: "Negate the objective (minimise → maximise), multiply the ≥ rule by −1, and split the equality into x + y ≤ 5 and −x − y ≤ −5. The others skip one of these steps or leave a ≥.",
    },
    {
      type: "mcq",
      q: "A dictionary reads: z = 20 + 3x₂ − x₃; x₁ = 8 − 2x₂ − x₃; x₄ = 6 − x₂ + x₃. Variable x₂ enters. What is z after the pivot?",
      o: ["26", "32", "38", "20"],
      a: 1,
      hint: "Ratios: 8 ÷ 2 and 6 ÷ 1. Then x₂ is worth 3 per unit.",
      why: "Ratios are 4 (x₁ row) and 6 (x₄ row), so x₂ rises to 4 and x₁ leaves. z gains 3 × 4 = 12, giving 32.",
    },
    {
      type: "cat",
      q: "What does each observation tell you about an LP?",
      buckets: ["Optimal", "Unbounded", "Infeasible"],
      items: [
        ["Every coefficient in z is ≤ 0", 0],
        ["The entering variable has no positive coefficient in any row", 1],
        ["The rules say x ≤ 3 and x ≥ 8", 2],
        ["Maximise x + y with only x − y ≤ 5 and x, y ≥ 0", 1],
        ["A rule says x + y ≤ −2 with x, y ≥ 0", 2],
        ["The sliding profit line last touches the region at a single corner", 0],
      ],
      why: "Optimal: nothing improves. Unbounded: nothing stops an improving direction (here x = y = t works for any t). Infeasible: the rules cannot all hold.",
    },
    {
      type: "slider",
      q: "A bakery has an oven rule 2x₁ + x₂ + x₃ ≤ 21 (hours). The plan is x₁ = 3, x₂ = 4, x₃ = 5. How many oven hours are left over (the slack)?",
      min: 0,
      max: 21,
      step: 1,
      ans: 6,
      tol: 1,
      unit: " h",
      hint: "2·3 + 4 + 5.",
      why: "The plan uses 6 + 4 + 5 = 15 hours, so the slack is 21 − 15 = 6.",
    },
    {
      type: "mcq",
      q: "Maximise 2x + 2y subject to x + y ≤ 6, x ≤ 4 and x, y ≥ 0. How many plans give the maximum?",
      o: [
        "Infinitely many, along an edge",
        "Exactly one plan, which is at (4, 2)",
        "Exactly one plan, which is at (0, 6)",
      ],
      a: 0,
      why: "The objective 2x + 2y is parallel to the rule x + y = 6. Corners (4, 2) and (0, 6) both score 12, and so does every point between them.",
    },
    {
      type: "multi",
      q: "Which statements about a <b>degenerate</b> corner are true?",
      o: [
        "A basic variable equals 0 there",
        "It can come from a tie in the ratio test",
        "The next pivot may leave z unchanged",
        "It proves the LP is infeasible",
      ],
      a: [0, 1, 2],
      why: "A degenerate corner has a basic variable at 0, often created by a ratio tie, and a pivot there may not raise z. It says nothing about feasibility: the corner itself is feasible.",
    },
  );
  def.qs.push(
    {
      type: "mcq",
      q: "At one point, a function of two variables has Hessian [3, 2; 2, 1] (rows separated by semicolons). What follows?",
      o: [
        "It is not convex there: the determinant 3·1 − 2·2 = −1 is negative, so one eigenvalue is negative",
        "It is convex there: every entry of the matrix is positive, so all eigenvalues are too",
        "It is convex there: the trace 3 + 1 = 4 is positive, which is all that is required",
      ],
      a: 0,
      why: "Eigenvalues multiply to the determinant. A negative determinant means one eigenvalue is negative and one positive, so the surface curves down in some direction. Positive entries or a positive trace are not enough.",
    },
    {
      type: "slider",
      q: "Bisection starts with a bracket of width 4 and must finish narrower than 0.01. About how many halvings does it need?",
      min: 3,
      max: 16,
      step: 1,
      start: 6,
      ans: 9,
      tol: 1,
      unit: "halvings",
      hint: "4 / 0.01 = 400. Powers of two: 2⁸ = 256 is too small, 2⁹ = 512 is enough.",
      why: "Width after n halvings is 4 / 2ⁿ. For 4 / 2ⁿ < 0.01 we need 2ⁿ > 400, so n = 9 (4/512 ≈ 0.008).",
    },
    {
      type: "mcq",
      q: "A minimum is bracketed by a = 0, b = 3.82, c = 10. Golden-section search puts the next probe in the larger part, mirroring b. Where does x go?",
      o: ["x ≈ 6.18", "x ≈ 5", "x ≈ 7.5", "x ≈ 8.09"],
      a: 0,
      hint: "The mirror image of b in [0, 10] is 10 − 3.82.",
      why: "The larger part is [3.82, 10], width 6.18. The probe sits 0.382 × 6.18 ≈ 2.36 beyond b, at 6.18 = 10 − 3.82. The midpoint 5 would break the golden pattern, so no probe could be reused next step.",
    },
    {
      type: "order",
      q: "Order one iteration of Brent's method.",
      items: [
        "Fit a parabola through the three bracket points",
        "Compute the parabola's lowest point x",
        "Check that x is inside the bracket and the steps are shrinking (else take a golden step)",
        "Evaluate f(x) and reassign the triple so the minimum stays bracketed",
      ],
      why: "Parabola, vertex, safety check, then the update. The golden fallback sits at the check, which is what makes the method safe.",
    },
    {
      type: "pick",
      q: "A Nelder–Mead triangle has B = (2, 5), G = (4, 5) and W = (3, 3), with α = 1. <b>Click the reflection point R.</b>",
      fig: Qf.points(NMP, { max: 8 }),
      a: "X",
      why: "C is the midpoint of B and G: (3, 5). R = C + (C − W) = (3, 5) + (0, 2) = <b>(3, 7)</b>. (3, 1) is W reflected the wrong way, and (5, 5) lies on the line through B and G.",
    },
    {
      type: "cat",
      q: "Which stopping rule is each of these?",
      buckets: ["Domain convergence", "Function convergence", "Out of time"],
      items: [
        ["All three vertices lie within 10⁻⁶ of each other", 0],
        ["The largest and smallest vertex values differ by less than 10⁻⁶", 1],
        ["The run reached 500 iterations", 2],
        ["The simplex has shrunk to a tiny triangle", 0],
        ["The budget of 2,000 function evaluations is used up", 2],
      ],
      why: "Domain tests the geometry, function tests the values, and out of time is a hard cap on rounds or evaluations.",
    },
    {
      type: "mcq",
      q: "Nelder–Mead has W = (0, 0), C = (2, 2) and a poor reflection R = (4, 4). With β = ½, where is the outside contraction point M₂?",
      o: ["(3, 3)", "(1, 1)", "(4, 4)", "(6, 6)"],
      a: 0,
      hint: "M₂ = C + β(C − W), and C − W = (2, 2).",
      why: "C − W = (2, 2), so M₂ = (2, 2) + ½·(2, 2) = <b>(3, 3)</b>, between C and R. The inside point M₁ = C − ½(C − W) = (1, 1).",
    },
    {
      type: "match",
      q: "Match each method to what it needs.",
      pairs: [
        ["Bisection", "A sign change of g between two ends"],
        ["Golden-section search", "A bracket triple with a lower middle value"],
        ["Brent's method", "A triple bracket plus a parabola fit with a safe fallback"],
        ["Nelder–Mead", "D + 1 starting points and only function values"],
      ],
      why: "Roots need a sign change; minima in one variable need a triple; Brent adds a parabola to the triple; Nelder–Mead works in many variables with just a simplex of values.",
    },
  );
  const m = NIC.modules.find((x) => x.id === "a3-boss");
  if (m) m.qCount = def.qs.length;
})();

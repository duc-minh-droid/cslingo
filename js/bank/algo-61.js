(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  B.add("a3-formulate", [
    {
      type: "match",
      q: "A juice stall buys litres of several juices. Match each LP part to its role.",
      pairs: [
        ["Variables", "Litres of each juice to buy"],
        ["Objective", "Total cost, to be made as small as possible"],
        ["Constraints", "Minimum vitamin C and a sugar limit"],
      ],
      why: "Variables are what you choose, the objective is what you score, and constraints are the rules every plan must meet.",
    },
    M(
      "A café makes x coffees and y teas. A coffee takes 2 minutes of barista time, a tea 1 minute, and 60 minutes are available. Which rule captures this?",
      ["2x + y ≤ 60", "x + 2y ≤ 60", "2x + y ≥ 60", "2x + 2y ≤ 60"],
      0,
      "Time used is 2 per coffee plus 1 per tea, and it cannot exceed what is available.",
    ),
    M(
      "The rules are x + y ≤ 10 and 2x + y ≤ 14, with x, y ≥ 0. Which plan is infeasible?",
      ["(3, 5)", "(6, 2)", "(5, 4)", "(4, 7)"],
      3,
      "(4, 7) gives x + y = 11 > 10. The others satisfy both rules: for (5, 4), 9 ≤ 10 and 14 ≤ 14.",
      { hint: "Add x + y first, then 2x + y." },
    ),
    {
      type: "slider",
      q: "A rule says 4x + 5y ≤ 30. The plan is x = 2, y = 3. How much slack does the rule have?",
      min: 0,
      max: 30,
      step: 1,
      ans: 7,
      tol: 1,
      unit: "",
      hint: "4·2 = 8 and 5·3 = 15.",
      why: "The rule uses 8 + 15 = 23 of its 30, leaving a slack of 7.",
    },
    TF(
      "If a plan satisfies every rule, it must be the optimal plan.",
      false,
      "Feasible only means legal. Another feasible plan may score better.",
    ),
    {
      type: "order",
      q: "Order the steps of building an LP from a story.",
      items: [
        "Decide what the variables are",
        "Write the objective as a weighted sum",
        "Write each limit as an inequality",
        "Add the sign rules x ≥ 0",
      ],
      why: "Choose variables first, then score them, then add the rules and the sign conditions.",
    },
    M(
      "A table says channel B has entry −2 for district D (per £1k). You spend £3k on B. How does D's total change?",
      ["It rises by 6", "It falls by 6", "It falls by 2", "It rises by 2"],
      1,
      "Total change is entry × spend = −2 × 3 = −6.",
    ),
    {
      type: "cat",
      q: "Sort each phrase from a baking LP.",
      buckets: ["Variable", "Objective", "Constraint"],
      items: [
        ["How many trays of each cake to bake", 0],
        ["Total profit, to be maximised", 1],
        ["Oven hours used must not exceed 40", 2],
        ["Flour used must stay below 90 kg", 2],
        ["Number of tarts baked", 0],
      ],
      why: "Quantities you choose are variables, the score is the objective, and limits are constraints.",
    },
    M(
      "A promotion uses 5 channels to reach 2 regions, one rule per region. How many constraints m and variables n are there (not counting x ≥ 0)?",
      ["m = 2, n = 5", "m = 5, n = 2", "m = 7, n = 5", "m = 2, n = 10"],
      0,
      "One rule per region gives m = 2 and one variable per channel gives n = 5.",
    ),
    {
      type: "multi",
      q: "Which of these are the data of a standard-form LP?",
      o: ["The objective weights cⱼ", "The constraint coefficients aᵢⱼ", "The limits bᵢ", "The best plan x*"],
      a: [0, 1, 2],
      why: "The LP is described by c, A and b. The best plan is the answer, not part of the input.",
    },
    M(
      "In a minimising LP, two feasible plans cost 14 and 11. Which do you prefer, and why?",
      [
        "The plan costing 11, as both pass every rule",
        "The plan costing 14, as it reaches more",
        "Neither until a third plan is tested",
        "Whichever has the larger x values",
      ],
      0,
      "Among feasible plans, the objective decides, so the cheaper plan wins.",
    ),
    M(
      "Why can adding spend on a channel reduce a district's total in a gain-matrix model?",
      [
        "A negative entry makes that channel lose people there",
        "More spending always breaks the budget rule",
        "Totals are averaged across all channels",
        "Negative spending is allowed",
      ],
      0,
      "Each channel's effect is entry × spend. When the entry is negative, extra spend subtracts.",
    ),
  ]);

  B.add("a3-standard", [
    M(
      "Minimise 3x − 4y. Which objective do you give to a maximiser?",
      ["Maximise −3x + 4y", "Maximise 3x − 4y", "Maximise −3x − 4y", "Maximise 4y − 3"],
      0,
      "Negate every coefficient: the minimum of f is where −f is largest.",
    ),
    M(
      "Convert x − 2y ≥ −3 to a ≤ rule.",
      ["−x + 2y ≤ 3", "−x + 2y ≤ −3", "x − 2y ≤ 3", "x + 2y ≤ 3"],
      0,
      "Multiply both sides by −1: every sign changes and ≥ becomes ≤.",
    ),
    {
      type: "cat",
      q: "Which conversion does each LP feature need?",
      buckets: ["Negate the objective", "Split into two inequalities", "Replace by x′ − x″", "Already standard"],
      items: [
        ["minimise 4x + y", 0],
        ["x + y = 7", 1],
        ["x may be negative", 2],
        ["2x + y ≤ 9", 3],
      ],
      why: "Minimise → negate, equality → two ≤ rules, free variable → difference of two non-negative ones.",
    },
    M(
      "The equality x + y = 7 is replaced by x + y ≤ 7 together with which other rule?",
      ["−x − y ≤ −7", "x + y ≤ −7", "−x − y ≤ 7", "x + y ≥ 8"],
      0,
      "Together they say x + y is at most 7 and at least 7.",
    ),
    M(
      "An LP has 2 free variables and 3 ordinary non-negative ones. How many variables after the conversion?",
      ["5", "7", "8", "10"],
      1,
      "Each free variable becomes two, so 2 × 2 + 3 = 7.",
    ),
    M(
      "An LP has 3 rules of ≤ type and 2 equalities. How many ≤ rules in standard form?",
      ["5", "7", "6", "10"],
      1,
      "Each equality gives two rules: 3 + 2 × 2 = 7.",
    ),
    TF(
      "Multiplying a ≥ rule by −1 and turning it into ≤ keeps exactly the same feasible plans.",
      true,
      "It is the same statement written the other way round.",
    ),
    M(
      "After flipping a ≥ rule, its right-hand side is negative. Why does that matter for simplex?",
      [
        "The origin may no longer be a feasible starting corner",
        "Simplex cannot handle negative numbers anywhere",
        "It makes the objective unbounded",
        "It removes the slack variable",
      ],
      0,
      "At the origin the slack would equal the negative right-hand side, which is not allowed.",
    ),
    TF(
      "Maximising −f and minimising f choose the same plan.",
      true,
      "Negating the score swaps highest and lowest but not their location.",
    ),
    M(
      "After converting a minimising LP, the solver reports z = −37. What was the minimum of the original objective?",
      ["37", "−37", "0", "Cannot tell"],
      0,
      "z is the maximum of −f, so the minimum of f is its negative: 37.",
    ),
    {
      type: "match",
      q: "Match each non-standard feature to its conversion.",
      pairs: [
        ["minimise f", "maximise −f"],
        ["ax ≥ b", "−ax ≤ −b"],
        ["ax = b", "ax ≤ b and −ax ≤ −b"],
        ["x free", "x = x′ − x″ with both ≥ 0"],
      ],
      why: "These four rules reach standard form.",
    },
    M(
      "A free variable is written x = x′ − x″ with x′ = 9 and x″ = 4. What is x?",
      ["5", "13", "−5", "36"],
      0,
      "9 − 4 = 5.",
    ),
  ]);

  B.add("a3-slack", [
    M(
      "The rule 3x + 2y ≤ 12 has a slack variable s. At the plan x = 2, y = 1, what is s?",
      ["4", "8", "12", "20"],
      0,
      "3·2 + 2·1 = 8 is used, so s = 12 − 8 = 4.",
      { hint: "Work out 3·2 + 2·1 first." },
    ),
    M(
      "An LP has 3 original variables and 2 rules. In a basic solution, how many variables are basic?",
      ["2", "3", "5", "1"],
      0,
      "There is one basic variable per equation (rule), so 2. The other 3 are nonbasic and set to 0.",
    ),
    M(
      "A dictionary has z = 5 + 2x₁ − x₂ + 4x₃. Which variable enters?",
      ["x₃", "x₁", "x₂", "None: it is optimal"],
      0,
      "The largest positive coefficient is 4, on x₃.",
    ),
    M(
      "x₁ enters. The rows are x₄ = 12 − 3x₁, x₅ = 10 − 5x₁ and x₆ = 9 − x₁. Which row leaves and how big does x₁ become?",
      ["x₅, with x₁ = 2", "x₄, with x₁ = 4", "x₆, with x₁ = 9", "x₅, with x₁ = 10"],
      0,
      "Ratios are 4, 2 and 9. The smallest is 2, in the x₅ row.",
      { hint: "12 ÷ 3, 10 ÷ 5, 9 ÷ 1." },
    ),
    M(
      "x₁ enters, and one row reads x₅ = 8 + 2x₁ − x₂. Does this row limit x₁?",
      ["No: x₅ grows as x₁ grows", "Yes, at x₁ = 4", "Yes, at x₁ = 8", "Yes, because x₅ is a slack"],
      0,
      "The coefficient of x₁ is positive on the right, so x₅ increases and never reaches 0.",
    ),
    M(
      "x₆ = 20 − 4x₁ − 2x₂. Solving for x₁ gives…",
      ["x₁ = 5 − x₂/2 − x₆/4", "x₁ = 20 − 2x₂ − x₆", "x₁ = 5 − 2x₂ − 4x₆", "x₁ = 5 + x₂/2 + x₆/4"],
      0,
      "Move 4x₁ across and divide by 4: x₁ = 5 − x₂/2 − x₆/4.",
    ),
    M(
      "z = 3x₁ + x₂ and x₁ = 5 − x₂/2 − x₆/4. After substituting, what is the coefficient of x₂ in z?",
      ["−1/2", "1/2", "3/2", "1"],
      0,
      "3 × (−1/2) + 1 = −1/2. The constant term is 3 × 5 = 15.",
      { hint: "3 times −1/2 is −1.5, then add 1." },
    ),
    M(
      "The new z is 15 − x₂/2 − 3x₆/4. What now?",
      [
        "Stop: no coefficient is positive, so 15 is optimal",
        "Pivot on x₂ because it is nonbasic",
        "Pivot on x₆ because −3/4 is the largest magnitude",
        "Restart from the origin",
      ],
      0,
      "Raising any nonbasic variable would lower z, and they cannot go below 0.",
    ),
    TF(
      "When reading off a basic solution, the nonbasic variables are set to 0.",
      true,
      "That is the definition: nonbasic variables sit at zero and the basic ones follow from the equations.",
    ),
    {
      type: "cat",
      q: "Which part of the pivot does each action belong to?",
      buckets: ["Choosing the entering variable", "Choosing the leaving variable"],
      items: [
        ["Look for the largest positive coefficient in z", 0],
        ["Divide each constant by the entering column's coefficient", 1],
        ["Scan the z line", 0],
        ["Take the smallest ratio", 1],
      ],
      why: "Entering uses z's coefficients. Leaving uses the ratio test on the rows.",
    },
    {
      type: "order",
      q: "Order one pivot.",
      items: [
        "Pick the entering variable",
        "Compute the ratios",
        "Pick the leaving variable (smallest ratio)",
        "Rewrite the leaving equation for the entering variable",
        "Substitute into z and the other rows",
      ],
      why: "Choose in, choose out, rewrite, substitute.",
    },
    {
      type: "bug",
      q: "This code should choose the entering variable using Dantzig's rule. Click the faulty line.",
      code: [
        "# c[j] is the coefficient of x_j in z",
        "cands = [j for j in range(n) if c[j] > 0]",
        "e = min(cands, key=lambda j: c[j])",
        "# ...then run the ratio test on column e",
      ],
      a: 2,
      why: "min picks the smallest positive coefficient. Dantzig's rule wants the largest, so use max.",
    },
  ]);
})();

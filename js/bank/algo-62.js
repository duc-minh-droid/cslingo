(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });
  B.add("a3-bakery", [
    M(
      "A bakery's best plan is 0 loaves, 5 trays of buns (11 per tray) and 16 trays of tarts (9 per tray), with profits in tens of pounds. What is the weekly profit?",
      ["£1,990", "£199", "£19,900", "£55"],
      0,
      "11·5 + 9·16 = 55 + 144 = 199 tens of pounds, which is £1,990.",
      { hint: "11·5 = 55 and 9·16 = 144." },
    ),
    M(
      "Profits per tray are 12, 11 and 9. In the first pivot, which variable enters?",
      ["The 12 one", "The 11 one", "The 9 one", "A slack"],
      0,
      "The largest coefficient in z enters first.",
    ),
    M(
      "Oven hours are 21 with 2 hours per tray of loaves; prep hours are 57 with 1 hour per tray. If loaves enter, what limits them?",
      [
        "The oven, which allows 10.5 trays",
        "The prep time, which allows 57 trays",
        "Neither rule limits loaves at all",
        "Both rules allow exactly 10.5 trays",
      ],
      0,
      "Ratios are 10.5 and 57. The smaller one, the oven, stops loaves first.",
    ),
    M(
      "z is 36 in a model whose profits were quoted in units of £50. What is the real profit?",
      ["£1,800", "£180", "£3,600", "£360"],
      0,
      "36 × 50 = 1,800.",
      { hint: "36 × 50 = 36 × 100 ÷ 2." },
    ),
    M(
      "Oven rule 2x₁ + x₂ + x₃ ≤ 21 and prep rule x₁ + 5x₂ + 2x₃ ≤ 57, with profits 12, 11, 9 per tray. Which plan (x₁, x₂, x₃) is feasible and earns 93?",
      ["(2, 3, 4)", "(6, 6, 6)", "(0, 12, 0)", "(10, 0, 3)"],
      0,
      "(2, 3, 4) uses 11 oven and 25 prep hours and earns 24 + 33 + 36 = 93. The others break a rule: (6, 6, 6) needs 24 oven hours, (0, 12, 0) needs 60 prep hours, (10, 0, 3) needs 23 oven hours.",
      { hint: "Check the oven first, then the prep." },
    ),
    TF(
      "The product with the highest profit per tray always appears in the optimal plan.",
      false,
      "Shared resources matter: a high-profit product may use too many scarce hours.",
    ),
    M(
      "At the optimum both slacks (spare oven hours and spare prep hours) are 0. What does that mean?",
      [
        "Both rules are binding: no hour is spare",
        "Both rules are unnecessary at the optimum",
        "The plan is infeasible at the optimum",
        "The LP must be unbounded at the optimum",
      ],
      0,
      "Zero slack means the rule holds with equality at the optimum.",
    ),
    M(
      "After the first pivot in the bakery, x₁ = 10.5 and each tray is worth 12. What is z?",
      ["126", "12", "21", "252"],
      0,
      "12 × 10.5 = 126.",
      { hint: "12 × 10 = 120, plus 12 × 0.5." },
    ),
    {
      type: "order",
      q: "Order the tutorial-style solution of an LP.",
      items: [
        "Write the standard form",
        "Add slack variables",
        "Pivot: choose who enters and leaves",
        "Repeat until no coefficient in z is positive",
        "Read the plan and convert units",
      ],
      why: "Standard form, slack form, pivot, iterate to the stopping rule, then interpret.",
    },
    M(
      "A tray of loaves needs 2 oven hours and earns 12. A tray of buns needs 1 oven hour and earns 11. Per oven hour, which earns more?",
      ["Buns, at 11 against 6", "Loaves, at 12 against 11", "They are equal", "Loaves, at 24 against 11"],
      0,
      "Loaves earn 12 ÷ 2 = 6 per oven hour, buns 11 per hour.",
    ),
    M(
      "In a bakery LP the loaf profit is raised from 12 to 15 and the best plan does not change. What is the best explanation?",
      [
        "The same corner stays best until the line tilts",
        "Profits are ignored when pivots are chosen",
        "The LP is degenerate, so changes vanish",
        "Slack variables absorb every change in profit",
      ],
      0,
      "The optimum only jumps when the objective line becomes steeper or flatter than a neighbouring edge.",
    ),
    {
      type: "multi",
      q: "Which statements are true of the final dictionary of a solved LP?",
      o: [
        "Every coefficient in z is ≤ 0",
        "Nonbasic variables are set to 0 to read the plan",
        "The constant in z is the maximum score",
        "Some coefficient in z is still positive",
      ],
      a: [0, 1, 2],
      why: "The stopping rule is that no coefficient is positive. Setting nonbasics to 0 leaves the constant as z.",
    },
  ]);

  B.add("a3-implement", [
    M(
      "In standard form, when does the origin give a valid starting basic solution?",
      ["When every bᵢ ≥ 0", "When every cⱼ ≥ 0", "Always", "When the LP is unbounded"],
      0,
      "At the origin each slack equals bᵢ, and slacks must be non-negative.",
    ),
    M(
      "The entering variable has a coefficient ≤ 0 in every row. What does the program report?",
      ["Unbounded", "Infeasible", "Optimal", "Degenerate"],
      0,
      "No row limits the entering variable, so z can rise forever.",
    ),
    TF(
      "A negative bᵢ in standard form proves the LP is infeasible.",
      false,
      "It only means the origin is not a feasible start. Another corner may be feasible.",
    ),
    M(
      "Two rows tie for the smallest ratio. What is the usual result of the pivot?",
      [
        "A basic variable equals 0 (degenerate corner)",
        "The LP becomes unbounded at that corner",
        "z falls below its value before the pivot",
        "The entering variable is forced to equal 0",
      ],
      0,
      "The row that does not leave also reaches 0 and stays basic at that value.",
    ),
    {
      type: "cat",
      q: "Which outcome does each situation lead to?",
      buckets: ["Optimal", "Unbounded", "Infeasible"],
      items: [
        ["Every coefficient in z is ≤ 0", 0],
        ["x₃ enters but no row has a positive coefficient for it", 1],
        ["The rules say x ≤ 3 and x ≥ 8", 2],
        ["Maximise x + y with only x − y ≤ 5", 1],
        ["A rule says x + y ≤ −2 with x, y ≥ 0", 2],
      ],
      why: "Optimal: nothing improves. Unbounded: nothing stops an improving direction. Infeasible: the rules contradict.",
    },
    {
      type: "order",
      q: "Order one round of the simplex loop.",
      items: [
        "Test whether any coefficient in z is positive",
        "Choose the entering variable",
        "Choose the leaving variable",
        "Update the equations",
      ],
      why: "The stopping test comes first.",
    },
    M(
      "What does Bland's rule (lowest index among candidates) guarantee?",
      ["The method cannot cycle", "The fewest possible pivots", "A larger z at every pivot", "That no ties occur"],
      0,
      "A fixed tie-breaking order stops degenerate pivots from repeating forever.",
    ),
    M(
      "The tutorial asks for a simplex program's output. What should it return when the LP is unbounded?",
      [
        "An error saying the solutions are unbounded",
        "The largest corner found so far, as an answer",
        "A plan of z = 0 at the origin of the region",
        "The origin, since every LP can start there",
      ],
      0,
      "There is no maximum, so the program must say so.",
    ),
    TF(
      "In a non-degenerate pivot, z strictly increases.",
      true,
      "That is why corners are never revisited and the algorithm stops.",
    ),
    M(
      "How does simplex usually behave on real problems?",
      [
        "Few pivots in practice; bad cases can be exponential",
        "Always exponentially many pivots, in every case",
        "Always exactly one pivot, whatever the input",
        "It visits every corner before it finally stops",
      ],
      0,
      "Typical LPs finish fast; contrived worst cases exist.",
    ),
    {
      type: "bug",
      q: "This loop should end only at an optimum. Click the faulty line.",
      code: [
        "while True:",
        "    e = index of the largest coefficient in z",
        "    if z[e] <= 0: return solution",
        "    l = row with the largest ratio",
        "    pivot(l, e)",
      ],
      a: 3,
      why: "The leaving row has the smallest ratio. The largest ratio would let a basic variable go negative.",
    },
    M(
      "Maximise x + y subject to x + y ≤ 4 and x + y ≥ 6. What happens?",
      ["No plan is feasible", "z is unbounded", "The optimum is 4", "The optimum is 6"],
      0,
      "No pair can be at most 4 and at least 6.",
    ),
  ]);

  B.add("a3-apps", [
    {
      type: "cat",
      q: "Can this formula appear in a linear program?",
      buckets: ["Linear", "Not linear"],
      items: [
        ["5x + y ≤ 20", 0],
        ["x · y ≤ 6", 1],
        ["x² ≤ 4", 1],
        ["x/2 + z/3 = 1", 0],
        ["√y ≥ 3", 1],
      ],
      why: "Only constants times variables, added together, are linear.",
    },
    M(
      "A max-min goal 'make the shortest battery life as long as possible' becomes an LP how?",
      [
        "Maximise a new variable t with t ≤ every lifetime",
        "Maximise the sum of all the battery lifetimes",
        "Minimise the longest of the battery lifetimes",
        "It cannot be turned into a linear program",
      ],
      0,
      "t is forced below the weakest lifetime, so raising t improves the weakest one.",
    ),
    M(
      "An operator gives capacity xⱼ to each service. Which are the variables?",
      ["The capacities xⱼ", "The profits per service", "The minimum qualities", "The total spectrum"],
      0,
      "Variables are what the operator chooses.",
    ),
    M(
      "Doubling x doubles its effect on the score. Which LP property is this?",
      ["Proportionality", "Complementarity", "Unboundedness", "Infeasibility"],
      0,
      "Proportional effects, plus additivity, define linearity.",
    ),
    M(
      "A crew-scheduling LP returns 3.6 crews on a route. What is the practical issue?",
      [
        "Crews are whole numbers, so extra methods are needed",
        "The LP is infeasible, since it gave a fraction",
        "The ratio test must have failed on this route",
        "z is unbounded, so the answer is meaningless",
      ],
      0,
      "LP variables are continuous, so whole-number answers need further techniques.",
    ),
    {
      type: "match",
      q: "Match each application to its typical LP goal.",
      pairs: [
        ["Mobile operator", "Maximise profit, keep each service's quality up"],
        ["Portfolio manager", "Minimise risk, reach a minimum yield"],
        ["Airline", "Minimise crew cost, meet duty-time rules"],
        ["Network design", "Maximise time before the first battery dies"],
      ],
      why: "These are the lecture's application examples.",
    },
    M(
      "A fund measures risk by variance, which squares each holding. Why is that not an LP objective?",
      [
        "Squared terms are not linear",
        "Variance is always negative",
        "Funds cannot minimise anything",
        "Yield rules need equalities",
      ],
      0,
      "An LP objective is a weighted sum of the variables.",
    ),
    {
      type: "multi",
      q: "Which constraints can appear in an LP?",
      o: ["2x + 3y ≤ 12", "x − y = 4", "x · y ≥ 2", "x/5 + y/2 ≥ 1"],
      a: [0, 1, 3],
      why: "The product x · y breaks linearity.",
    },
    TF(
      "An LP can model a game AI choosing resource allocations under linear limits.",
      true,
      "Any problem with a linear score and linear limits fits, whatever the setting.",
    ),
    M(
      "A shop charges 5 per unit for the first 10 units and 4 per unit after that. Is total cost linear in units?",
      [
        "No: the slope changes at 10",
        "Yes: it is a sum",
        "Yes: every price is a constant",
        "Only for more than 10 units",
      ],
      0,
      "A linear cost has one fixed rate. The changing slope breaks proportionality.",
    ),
    M(
      "Which problem is the best fit for an LP?",
      [
        "Share a budget to maximise a weighted sum",
        "Find the shortest closed tour through 30 cities",
        "Sort a list of numbers into ascending order",
        "Check whether a very large number is prime",
      ],
      0,
      "LP suits allocating limited resources with linear scores and limits.",
    ),
  ]);

  /* ---------- top-ups for the deepened modules ---------- */
  B.add("a3-lp", [
    M(
      "Two plans are both feasible for an LP. What can you say about the plan exactly halfway between them?",
      [
        "It is feasible, since the region is convex",
        "It is infeasible, as segments leave the region",
        "It is optimal, because it averages both plans",
        "Whether it passes depends on the objective",
      ],
      0,
      "A feasible region cut out by half-spaces is convex.",
    ),
    M(
      "An equation in three variables, such as 2x + y + 4z = 8, describes…",
      ["a plane", "a line", "a point", "a hyperplane in 5-D"],
      0,
      "Two variables give a line, three give a plane, n give a hyperplane.",
    ),
    M(
      "The profit line is parallel to a constraint edge that forms part of the boundary at the optimum. How many optimal plans are there?",
      [
        "Infinitely many, all along that edge",
        "Exactly one, found at a single corner",
        "None, because the line never touches it",
        "Exactly two, one at each end of the edge",
      ],
      0,
      "Every point of the edge scores the same.",
    ),
    M(
      "Maximise x + y with x ≤ 4, y ≤ 3, x + y ≥ 2, x, y ≥ 0. Which corner is best?",
      ["(4, 3), z = 7", "(0, 2), z = 2", "(4, 0), z = 4", "(0, 3), z = 3"],
      0,
      "The corners are (0,2), (2,0), (4,0), (4,3) and (0,3). The largest sum is at (4,3).",
    ),
  ]);
  B.add("a3-simplex", [
    M(
      "Maximise 3x + 2y with x + 2y ≤ 10 and 3x + y ≤ 15. At the corner (5, 0), which variables are zero?",
      ["y and the material slack", "x and the machine slack", "Both slacks", "x and y"],
      0,
      "y = 0 on the x-axis and 15 − 15 = 0 leaves the material rule tight; the machine slack is 5.",
    ),
    M(
      "An LP has 4 variables (including slacks) and 2 equations. How many are nonbasic at a corner?",
      ["2", "4", "1", "3"],
      0,
      "With 4 variables and 2 basic ones, 2 are nonbasic and equal to 0.",
    ),
    M(
      "Why is checking all corners hopeless on large LPs?",
      [
        "Their number can grow exponentially",
        "They lie outside of the feasible region",
        "Corners are never optimal for an LP",
        "Finding them needs a derivative at each",
      ],
      0,
      "With m rules and n variables there can be C(m + n, n) corners.",
    ),
  ]);
})();

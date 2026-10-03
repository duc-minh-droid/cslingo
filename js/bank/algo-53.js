(function () {
  const B = NIC.bank;

  const svgText = (x, y, t, s = "") =>
    `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 13px var(--sans);fill:var(--text-dim)${s}">${t}</text>`;

  // Simplex: polygon with corners O(0,0) A(3,0) B(3,1) C(0,4); x <= 3 and x + y <= 4.
  const figSlackCorners = () => {
    const pts = { O: [40, 200], A: [220, 200], B: [220, 160], C: [40, 40] };
    const dots = Object.entries(pts)
      .map(
        ([k, [x, y]]) =>
          `<g data-pick="${k}"><circle cx="${x}" cy="${y}" r="13" fill="var(--panel)" stroke="var(--violet)" stroke-width="3"/>${svgText(x, y + 5, k)}</g>`,
      )
      .join("");
    return `<svg viewBox="0 0 300 230" style="max-height:230px"><polygon points="40,200 220,200 220,160 40,40" fill="rgba(206,130,255,.14)" stroke="var(--violet)" stroke-width="2"/>${svgText(262, 150, "x ≤ 3")}${svgText(150, 90, "x + y ≤ 4")}${dots}</svg>`;
  };

  // Bracket: a, c, d, b on a number line, with f(c) = 2 and f(d) = 5.
  const figProbeLine = () => {
    const pts = [
      ["a", 30, ""],
      ["c", 142, "f = 2"],
      ["d", 238, "f = 5"],
      ["b", 350, ""],
    ];
    const dots = pts
      .map(
        ([k, x, v]) =>
          `<g data-pick="${k}"><circle cx="${x}" cy="70" r="14" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${svgText(x, 75, k)}${svgText(x, 108, v)}</g>`,
      )
      .join("");
    return `<svg viewBox="0 0 380 125" style="max-height:125px"><line x1="30" y1="70" x2="350" y2="70" stroke="var(--line-2)" stroke-width="3"/>${dots}</svg>`;
  };

  B.add("a3-simplex", [
    {
      type: "mcq",
      q: "A factory LP has the limits x + 2y ≤ 14 and 3x + y ≤ 18, with the profit z = 4x + 5y. The right-hand sides are both positive. Why can simplex safely start at the origin, where x = y = 0?",
      o: [
        "Making nothing breaks no limit, so it is a legal corner",
        "The origin is always the best plan, so simplex just confirms it",
        "Slack variables move every best plan to the origin for you",
      ],
      a: 0,
      hint: "Put x = 0 and y = 0 into both limits. Are they still true?",
      why: "0 ≤ 14 and 0 ≤ 18, so the origin is legal, and it is a corner because x ≥ 0 and y ≥ 0 are both tight there. Simplex needs any legal corner to begin the walk. It usually earns nothing (z = 0), so the walk then climbs from there.",
    },
    {
      type: "slider",
      q: "Simplex stands at a corner where z = 12. The variable x is about to enter, and its gain row says each unit of x adds £3 to z. The ratio test lets x rise by 5 units. What is z at the next corner?",
      min: 0,
      max: 40,
      step: 1,
      start: 12,
      ans: 27,
      tol: 3,
      unit: "£",
      hint: "5 units × £3 per unit = £15 more. Add it to 12.",
      why: "z rises by (gain per unit) × (units moved) = 3 × 5 = 15, so the new z is 12 + 15 = 27. This is also why a bigger step and a bigger gain both mean a bigger jump.",
    },
    {
      type: "match",
      q: "Match each thing seen in a simplex tableau to what it tells you.",
      pairs: [
        ["No gain-row entry is above 0 (maximising)", "This corner is optimal, so stop"],
        ["The entering column has no positive entry in any row", "Nothing blocks x, so the LP is unbounded"],
        ["The slack of a limit is exactly 0", "That limit is tight at this corner"],
        ["Two rows tie for the smallest ratio", "A basic variable becomes 0: degeneracy"],
      ],
      hint: "Think about what each situation does to the walk: stop, run away, or stall.",
      why: "A gain row with nothing positive means every edge goes downhill, so the corner is best. With no positive entry in the entering column, no limit ever stops x, so z can grow forever. A slack of 0 means that limit is used up exactly. Tied ratios leave a variable at 0 after the pivot, which can make simplex stall for a pivot or two.",
    },
    {
      type: "bug",
      q: "This loop should keep pivoting while some variable can still improve a maximising z, and stop at the optimum. It returns the starting corner every time. Click the faulty line.",
      code: [
        "def simplex_loop(tab):",
        "    while max(tab.gain) <= 0:",
        "        col = argmax(tab.gain)",
        "        row = ratio_test(tab, col)",
        "        pivot(tab, row, col)",
        "    return tab.corner()",
      ],
      a: 1,
      hint: "When is there still an improving variable? Look at the sign.",
      why: "An improving variable has a gain above 0, so the loop should run while max(gain) > 0. With ≤ 0 the loop only runs at an optimum (and then never moves it anywhere useful). At the start the gains are positive, so it skips the loop and returns the starting corner.",
    },
    {
      type: "pick",
      q: "A two-variable LP has the limits x ≤ 3 and x + y ≤ 4, plus x, y ≥ 0. Each limit has a slack variable that measures how much of it is unused. Click the corner where <b>both</b> slacks are 0.",
      fig: figSlackCorners(),
      a: "B",
      hint: "Both slacks are 0 where both limits are met exactly.",
      why: "At B = (3, 1) we have x = 3 and x + y = 4, so both limits are used up. At A = (3, 0) only x ≤ 3 is tight, because x + y = 3 leaves a slack of 1. At C = (0, 4) only x + y ≤ 4 is tight, because x = 0 leaves a slack of 3. O has both slacks above 0.",
    },
    {
      type: "slider",
      q: "Simplex lets x enter. Three limits each cap x if nothing else changes: 2x ≤ 12, 3x ≤ 15 and x ≤ 8. How far can x rise before it must stop?",
      min: 0,
      max: 12,
      step: 1,
      start: 8,
      ans: 5,
      tol: 0,
      unit: "",
      hint: "Divide each right-hand side by its coefficient: 12 ÷ 2, 15 ÷ 3 and 8 ÷ 1.",
      why: "The limits allow x up to 6, 5 and 8. The smallest, 5, is hit first, so x stops there. Going to 6 or 8 would break 3x ≤ 15.",
    },
  ]);

  B.add("a3-bracket", [
    {
      type: "slider",
      q: "Golden-section search needs 2 evaluations of f to set up its first two probes, then 1 new evaluation per step. How many evaluations of f have been made in total after 6 steps?",
      min: 0,
      max: 20,
      step: 1,
      start: 10,
      ans: 8,
      tol: 0,
      unit: "",
      hint: "2 to start, plus 1 for each of the 6 steps.",
      why: "The surviving probe is reused every step, so each step adds only one evaluation: 2 + 6 = 8. A method that threw both probes away would need 2 + 12 = 14. That reuse is the whole point of the golden ratio.",
    },
    {
      type: "cat",
      q: "Golden-section search can work on one number at a time. Sort each task by whether it can be tackled directly.",
      buckets: ["Golden-section search fits", "Needs a different method"],
      items: [
        ["Best oven time (one setting) when the cake quality has a single peak", 0],
        ["Best price for a café when profit falls either side of one ideal price", 0],
        ["Best mix of three paint colours to match a swatch", 1],
        ["Best ticket price and advert budget together", 1],
      ],
      hint: "Count how many settings are being chosen at once.",
      why: "A bracket is an interval on a line, so it only describes one unknown. The oven time and the café price are each a single number with one best value. Three paint amounts, or a price plus an advert budget, are several unknowns together, and for those you need something like Nelder–Mead.",
    },
    {
      type: "bug",
      q: "This golden-section code should loop until the bracket is narrower than <code>tol</code>. For a wide bracket it returns straight away with the midpoint, having evaluated nothing. Click the faulty line.",
      code: [
        "def golden(f, a, b, tol):",
        "    r = 0.618",
        "    while b - a < tol:",
        "        c = b - r * (b - a)",
        "        d = a + r * (b - a)",
        "        if f(c) < f(d): b = d",
        "        else: a = c",
        "    return (a + b) / 2",
      ],
      a: 2,
      hint: "Should the loop keep going while the bracket is narrow or while it is wide?",
      why: "The search must carry on while the bracket is still wider than the tolerance, so the test is b - a > tol. With < the loop only runs once the bracket is already tiny, so a wide starting bracket skips it and returns the midpoint untouched.",
    },
    {
      type: "pick",
      q: "A bracket [a, b] has probes c and d with f(c) = 2 and f(d) = 5. The search keeps [a, d]. Which of the four points already holds a value that the next step reuses as one of its probes? Click it.",
      fig: figProbeLine(),
      a: "c",
      hint: "The new bracket is [a, d]. Which interior point is still inside it?",
      why: "The new bracket is [a, d], and c sits inside it about 61.8% of the way along, which is exactly where the right-hand probe of the smaller bracket belongs. So c is reused and only one new probe is needed. The point d becomes the new right edge, and b is discarded.",
    },
    {
      type: "match",
      q: "Match each method to what it needs from the function.",
      pairs: [
        ["Golden-section search", "Values of f along one line, with a single dip"],
        ["Gradient descent", "The slope of f at each point"],
        ["Nelder–Mead", "Values of f for several variables, no slopes"],
        ["Simplex method for LPs", "A linear score and linear limits"],
      ],
      hint: "Ask what each method can still do when only f(x) can be looked up.",
      why: "Golden-section search compares two values on a line and relies on one dip. Gradient descent steps along the slope, so it needs a derivative. Nelder–Mead also compares values only but works on several variables. Simplex relies on straight-line formulas, which is why it can hop between corners.",
    },
    {
      type: "mcq",
      q: "Why does golden-section search need two interior probes, c and d, rather than testing just one point inside the bracket?",
      o: [
        "One value cannot tell you which side the dip is on",
        "One probe is enough but two make the search run twice as fast",
        "Two probes are needed so the bracket can grow if the dip is outside",
      ],
      a: 0,
      hint: "Imagine you only know f(c) = 4. Could the minimum be left of c? Right of c?",
      why: "One number cannot give a direction: the minimum could be on either side of it. Two values let you compare, and on a unimodal function the piece beyond the higher probe cannot hold the dip, so it can be thrown away. The bracket never grows.",
    },
  ]);

  B.add("a3-nm", [
    {
      type: "mcq",
      q: "A Nelder–Mead triangle in 2-D has corners (1, 3) and (5, 1) that are better, and (4, 6) that is the worst. Flipping the worst through the midpoint of the other two gives a new point. Where?",
      o: ["(2, −2)", "(4, −2)", "(2, 6)", "(3, 2)"],
      a: 0,
      hint: "The midpoint of the good two is (3, 2). Work out the step from the midpoint to (4, 6), then take the opposite step from the midpoint.",
      why: "The midpoint is ((1 + 5) ÷ 2, (3 + 1) ÷ 2) = (3, 2). The worst corner (4, 6) is 1 right and 4 up from it. A reflection goes the same distance the opposite way: 1 left and 4 down from (3, 2), which is (2, −2). The point (3, 2) is only the midpoint, (4, −2) flips the y step but not the x step, and (2, 6) flips x but not y.",
    },
    {
      type: "slider",
      q: "A triangle has its best corner B, and its other two corners are 8 and 6 units from B. Nothing else worked, so the whole triangle shrinks halfway towards B. How far is the farther corner from B afterwards?",
      min: 0,
      max: 12,
      step: 1,
      start: 8,
      ans: 4,
      tol: 0,
      unit: "units",
      hint: "Shrink means halving each distance to the best corner.",
      why: "Each non-best corner moves halfway to B, so its distance halves: 8 becomes 4 and 6 becomes 3. The best corner does not move at all, which is why a shrink never makes the best value worse.",
    },
    {
      type: "order",
      q: "Put one plain Nelder–Mead iteration in order.",
      items: [
        "Sort the corners from best to worst",
        "Find the midpoint of every corner except the worst",
        "Flip the worst corner through that midpoint",
        "Compare the new point's value and choose reflect, expand, contract or shrink",
      ],
      hint: "You must know which corner is worst before you can flip it.",
      why: "Ranking comes first, because the worst corner is the one that moves. The midpoint of the others is the pivot to flip through, the flip makes a trial point, and only then can its value be compared to decide how bold or cautious the move should be.",
    },
    {
      type: "bug",
      q: "An expand step should push the reflected point <code>r</code> twice as far from the midpoint <code>c</code> as it was, so the new point is <code>c + 2 × (r − c)</code>. The x-coordinate is right but the new point lands in the wrong place. Click the faulty line.",
      code: [
        "def expand(c, r):",
        "    dx = r[0] - c[0]",
        "    dy = r[1] - c[1]",
        "    x = c[0] + 2 * dx",
        "    y = r[1] + 2 * dy",
        "    return (x, y)",
      ],
      a: 4,
      hint: "Compare the two lines that build x and y. Do they start from the same point?",
      why: "The y-line starts from r[1] instead of c[1]. The expansion has to be measured from the midpoint c in both coordinates. Starting from r in y overshoots by an extra (r − c).",
    },
    {
      type: "multi",
      q: "A Nelder–Mead run minimises f. You swap f for log(1 + f), which keeps the order of any two values but squashes them. Select every statement that is true (f is always above 0).",
      o: [
        "Every comparison between two corners comes out the same",
        "The corners visited are the same, step for step",
        "The best corner's value is unchanged",
        "It would now need the gradient of the new function",
      ],
      a: [0, 1],
      hint: "If one value is lower than another, is its log lower too?",
      why: "log(1 + f) rises whenever f rises, so the order of any two values never flips. Nelder–Mead only uses order, so it makes the same moves. The values themselves change (so the third statement is false), and it still never needs a gradient.",
    },
    {
      type: "cat",
      q: "The LP simplex method and Nelder–Mead both use the word simplex. Sort each description.",
      buckets: ["Nelder–Mead", "LP simplex method"],
      items: [
        ["Needs only values of f, even from a noisy simulation", 0],
        ["Keeps n + 1 trial points that flip and stretch", 0],
        ["Hops between corners of the feasible region", 1],
        ["Stops when no neighbouring corner has a better score", 1],
      ],
      hint: "One of them is about trial points in space. The other is about a polygon of legal plans.",
      why: "In Nelder–Mead the simplex is a small shape of trial points that crawls downhill using only function values. In the LP method the simplex is an algorithm that walks along the edges of the feasible region and stops when every neighbour is worse. They share a name and little else.",
    },
  ]);
})();

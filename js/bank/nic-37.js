(function () {
  const B = NIC.bank;
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;max-height:${h}px">${body}</svg>`;
  const tx = (x, y, s, c = "var(--text)", z = 13, a = "middle") =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:800 ${z}px var(--sans);fill:${c}">${s}</text>`;
  const box = (x, y, w, h, f = "var(--panel)", s = "var(--line-2)") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${f}" stroke="${s}" stroke-width="2"/>`;
  const line = (x1, y1, x2, y2, c = "var(--line-2)", w = 4) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

  const node = (x, y, s, c = "var(--panel)") =>
    `<circle cx="${x}" cy="${y}" r="17" fill="${c}" stroke="var(--line-2)" stroke-width="2"/>${tx(x, y + 5, s)}`;

  B.add("l2-generic", [
    {
      type: "order",
      q: "A population of 10 has just made 10 scored children. Each update rule below is then applied. Put the rules in order from the MOST likely to the LEAST likely to remove the best OLD individual.",
      items: [
        "Replace the whole population with the 10 children",
        "Replace 7 randomly chosen old ones with 7 children",
        "Replace 3 randomly chosen old ones with 3 children",
        "Merge old and new, then keep the best 10",
      ],
      hint: "A random group of k out of 10 contains the best one with chance k/10. Replacing everyone removes it for certain.",
      why: "Replacing everyone removes the best old one for certain (100%). A random group of 7 removes it 70% of the time, a random group of 3 about 30%. Merging and keeping the best 10 never removes it (0%), because it still ranks in the top 10 of the merged pool.",
    },
    {
      type: "multi",
      q: "Select every true statement about the Select step of the generic EA.",
      o: [
        "Fitter individuals are more likely to be picked",
        "A below-average individual can still be picked as a parent",
        "It only chooses parents and does not create new solutions",
        "The weakest individual is never picked",
        "It builds children by mixing the genes of two parents",
      ],
      a: [0, 1, 2],
      hint: "Select chooses. Vary creates. Is the bias towards fitter ones total?",
      why: "Selection is biased towards fitter individuals but not exclusively, so weaker ones can still be chosen, which keeps variety. It only picks parents. Making children by mixing genes is the Vary step.",
    },
    {
      type: "slider",
      q: "An EA scores 100 random individuals at the start. Every generation it makes 40 children and scores each one once. How many scores has it computed after 25 generations?",
      min: 0,
      max: 2000,
      step: 100,
      start: 500,
      ans: 1100,
      tol: 100,
      unit: "scores",
      hint: "25 × 40 = 1000 children, then add the first 100.",
      why: "The start costs 100 scores and then 25 generations × 40 children = 1,000 more, giving 1,100. This count is how EA running time is usually measured, since scoring is the expensive part.",
    },
    {
      type: "bug",
      q: "This EA makes 40 children each generation and is meant to keep its population at 100, but the run gets slower every generation. Click the faulty line.",
      code: [
        "pop = random_population(100)",
        "for gen in range(50):",
        "    parents = select(pop)",
        "    children = vary(parents)",
        "    pop = pop + children",
        "return best(pop)",
      ],
      a: 4,
      hint: "How many individuals are in pop after one generation of 40 children?",
      why: "Adding the children to the old population without choosing who stays makes it grow every generation (100, 140, 180, ...). The update step must decide who survives, for example by keeping the best 100 of the merged pool.",
    },
    {
      type: "multi",
      q: "Select every true statement about the Vary step of the generic EA.",
      o: [
        "Children can turn out better or worse than their parents",
        "It makes new solutions from the parents that were chosen",
        "Small mutation steps are usually preferred to large random ones",
        "It decides which old individuals are removed from the population",
        "Every child is guaranteed to be at least as fit as its parents",
      ],
      a: [0, 1, 2],
      hint: "Vary only makes children. Who stays is decided elsewhere, and nothing promises the children are good.",
      why: "Vary applies mutation and recombination to the chosen parents, and the results can be better or worse. Small steps tend to keep the good parts of a parent. Removing individuals is the Update step, and nothing guarantees a child is fitter.",
    },
    {
      type: "cat",
      q: "Each change below is made to the Select step of an EA. Does it make selection more greedy (closer to always taking the best) or less greedy (closer to random)?",
      buckets: ["More greedy", "Less greedy"],
      items: [
        ["Parents come only from the top 5% instead of the top 50%", 0],
        ["Every individual gets the same chance to be a parent", 1],
        ["Parents come from the top 40% instead of the top 10%", 1],
        ["Only the single fittest individual is ever used as a parent", 0],
      ],
      hint: "Greedy means leaning hard on the best few. A bigger pool of eligible parents means leaning less.",
      why: "Narrowing the pool of parents, down to a single one at the limit, is greedier. Widening it, down to equal chances for all at the limit, is less greedy. Always taking the best gives bad results quickly, while near-random selection gives good results too slowly.",
    },
  ]);

  B.add("l2-optim", [
    {
      type: "match",
      q: "A panel has 20 on/off switches, and a setting is scored by how many switches match a wanted pattern. Match each description to its name.",
      pairs: [
        ["All 2²⁰ possible settings of the 20 switches", "Search space"],
        ["The number of switches matching the pattern for one setting", "Fitness"],
        ["A setting that matches as many switches as possible", "Optimum"],
        ["Scoring every one of the 2²⁰ settings and keeping the best", "Exhaustive search"],
      ],
      hint: "Which is the set of candidates, which is a score, which is the winner, and which is the method?",
      why: "The search space is every candidate, the fitness scores one candidate, the optimum is a candidate with the best score and exhaustive search is the try-everything method.",
    },
    {
      type: "order",
      q: "Items weigh 25 kg, 60 kg and 80 kg, and the target is 100 kg. Fitness is the gap to 100 kg, so smaller is better. Order these subsets (bits show which items are taken) from best to worst.",
      items: ["101 (items 1 and 3)", "110 (items 1 and 2)", "001 (item 3 only)", "011 (items 2 and 3)"],
      hint: "Totals are 105, 85, 80 and 140 kg. Now find each gap to 100.",
      why: "The gaps are 5 kg for 101 (105 kg), 15 kg for 110 (85 kg), 20 kg for 001 (80 kg) and 40 kg for 011 (140 kg). Going over the target counts just as badly as falling short.",
    },
    {
      type: "multi",
      q: "Select every true statement about fitness functions.",
      o: [
        "It gives every candidate in the search space a score",
        "Two different fitness functions can crown different best solutions for the same search space",
        "Whether a better score means higher or lower depends on the problem",
        "The best possible score is always 0",
        "Defining one makes the search space smaller",
      ],
      a: [0, 1, 2],
      hint: "Does the fitness function decide which candidates exist, or only how they are judged?",
      why: "A fitness function judges candidates but does not change which ones exist. Changing how you score changes which one wins. A best score of 0 is only typical of gap or clash counts, and a maximised score might be 100 or 3.7.",
    },
    {
      type: "bug",
      q: "This exhaustive search should find the subset whose weight is closest to the 100 kg target, but it always returns None. Click the faulty line.",
      code: [
        "best, best_f = None, 0",
        "for s in all_subsets(items):",
        "    f = abs(weight(s) - 100)",
        "    if f < best_f:",
        "        best, best_f = s, f",
        "return best",
      ],
      a: 0,
      hint: "Could any f be smaller than 0?",
      why: "The search is minimising, so the starting best score must be bigger than anything it will see (for example infinity). Starting at 0 means no gap can beat it, and the answer never updates.",
    },
    {
      type: "slider",
      q: "Checking every subset of 20 items takes 3 minutes. Four more items are added, so there are 24. About how long does the exhaustive check take now, in minutes?",
      min: 0,
      max: 120,
      step: 6,
      start: 12,
      ans: 48,
      tol: 6,
      unit: "min",
      hint: "Each extra item doubles the work. Four items: 2 × 2 × 2 × 2 = 16. Then 3 × 16.",
      why: "Four extra items multiply the number of subsets by 2⁴ = 16, so the time goes from 3 to 48 minutes. That doubling per item is why enumeration stops being usable so quickly.",
    },
    {
      type: "pick",
      q: "A rucksack problem has 5 items, so a candidate is written as a string of 5 bits (1 = take the item, 0 = leave it). Exactly one string below is NOT a candidate of this problem. Tap it.",
      fig: svg(
        420,
        80,
        ["10110", "01001", "1110", "00000"]
          .map(
            (b, i) =>
              `<g data-pick="${b}">${box(8 + i * 102, 10, 96, 56)}${tx(56 + i * 102, 45, b, "var(--text)", 18)}</g>`,
          )
          .join(""),
      ),
      a: "1110",
      hint: "Count the bits in each string. Is taking nothing allowed?",
      why: "Every candidate has exactly 5 bits, one per item, and 1110 has only 4. The all-zero string 00000 looks empty but is a valid candidate: take nothing. The search space holds all 2⁵ = 32 such strings.",
    },
  ]);

  B.add("l2-complexity", [
    {
      type: "cat",
      q: "Is the number of steps of each algorithm polynomial or exponential in n?",
      buckets: ["Polynomial", "Exponential"],
      items: [
        ["n³", 0],
        ["2ⁿ", 1],
        ["n log n", 0],
        ["1.1ⁿ", 1],
        ["100 n²", 0],
      ],
      hint: "Look at where n sits: in the base, or in the exponent?",
      why: "Polynomial means n is in the base (n³, n log n, 100 n²), and a big constant does not change that. Exponential means n is in the exponent (2ⁿ, 1.1ⁿ), even for a base barely above 1.",
    },
    {
      type: "multi",
      q: "Select every true statement about easy and hard problems.",
      o: [
        "Sorting is easy even though 10 items can be ordered in over 3 million ways",
        "An exponential algorithm eventually takes more steps than any polynomial one",
        "At small n an exponential can look cheaper than a polynomial",
        "Hard means that no algorithm can ever solve the problem",
        "A problem is hard whenever its search space is large",
      ],
      a: [0, 1, 2],
      hint: "Hard is about the fastest known exact algorithm, not about size or possibility.",
      why: "Hard means no fast exact method is known, so a huge search space (like all orderings in sorting) does not make a problem hard. Small n can fool you, but the exponential always wins in the end. Hard problems can still be solved, just slowly.",
    },
    {
      type: "slider",
      q: "A program takes about n² steps and needs 2 seconds when n = 100. About how long does it need when n = 300?",
      min: 0,
      max: 40,
      step: 2,
      start: 10,
      ans: 18,
      tol: 2,
      unit: "s",
      hint: "n triples, so n² grows by 3 × 3 = 9 times.",
      why: "Tripling n multiplies n² by 9, so 2 s becomes 18 s. A polynomial grows steadily like this, whereas an exponential would explode.",
    },
    {
      type: "bug",
      q: "This function should return how many subsets a set of n items has (2ⁿ), but its answer grows only slowly. Click the faulty line.",
      code: [
        "def count_subsets(n):",
        "    total = 1",
        "    for _ in range(n):",
        "        total = total + 2",
        "    return total",
      ],
      a: 3,
      hint: "Each new item should double the count, not add a fixed amount.",
      why: "Adding 2 each time gives 1 + 2n, a straight line. The count must double with every item (total = total * 2), which is exactly what makes exhaustive search exponential.",
    },
    {
      type: "mcq",
      q: "An exhaustive 2ⁿ program takes 1 second at n = 30. About how long would it take at n = 40?",
      o: [
        "About 1.3 seconds, because 40 is only a third bigger than 30",
        "About 17 minutes, because the work grows about 1,000-fold",
        "About 3 hours, because the work grows about 10,000-fold overall",
      ],
      a: 1,
      hint: "Ten more items multiply the work by 2¹⁰ = 1,024, which is about 1,000.",
      why: "Ten extra items multiply the time by about 1,000, so 1 second becomes about 1,000 seconds, roughly 17 minutes. Ten more items again and it would take about two weeks.",
    },
    {
      type: "pick",
      q: "Four programs were timed at n = 10, 20 and 30 (seconds, shown on each card). Exactly one of them is exponential. Tap the program that will be the slowest at n = 100.",
      fig: svg(
        420,
        120,
        [
          ["A", 2, 4, 6],
          ["B", 2, 8, 18],
          ["C", 2, 16, 54],
          ["D", 2, 8, 32],
        ]
          .map(
            (c, i) =>
              `<g data-pick="${c[0]}">${box(8 + i * 102, 8, 96, 104)}${tx(56 + i * 102, 28, "Program " + c[0], "var(--text-dim)", 12)}${tx(56 + i * 102, 54, "n = 10: " + c[1] + " s", "var(--text)", 12)}${tx(56 + i * 102, 76, "n = 20: " + c[2] + " s", "var(--text)", 12)}${tx(56 + i * 102, 98, "n = 30: " + c[3] + " s", "var(--text)", 12)}</g>`,
          )
          .join(""),
      ),
      a: "D",
      hint: "Look at what the time is multiplied by each time n grows by 10. A steady multiple points to an exponential.",
      why: "Program D's time is multiplied by 4 at every step of 10, a steady multiple, which is the signature of exponential growth. By n = 100 it needs 2 × 4⁹ ≈ 500,000 s (about 6 days). Program C looks worse at n = 20 and 30, but its multiples shrink (8, then 3.4) as in a polynomial, and it needs only about 2,000 s at n = 100.",
    },
  ]);

  const MST_E = {
    AB: [50, 110, 150, 40, 1],
    AC: [50, 110, 150, 180, 3],
    BC: [150, 40, 150, 180, 2],
    BD: [150, 40, 280, 110, 6],
    CD: [150, 180, 280, 110, 4],
  };
  const mstFig = svg(
    330,
    220,
    Object.entries(MST_E)
      .map(([k, e]) => {
        const g = k === "AB" || k === "BC";
        const mx = (e[0] + e[2]) / 2,
          my = (e[1] + e[3]) / 2;
        return `<g data-pick="${k}">${line(e[0], e[1], e[2], e[3], g ? "var(--teal)" : "var(--line-2)")}<line x1="${e[0]}" y1="${e[1]}" x2="${e[2]}" y2="${e[3]}" stroke="transparent" stroke-width="26"/>${box(mx - 12, my - 11, 24, 22, "var(--bg)")}${tx(mx, my + 5, e[4], "var(--rose-ink)", 13)}</g>`;
      })
      .join("") +
      node(50, 110, "A", "var(--teal)") +
      node(150, 40, "B", "var(--teal)") +
      node(150, 180, "C", "var(--teal)") +
      node(280, 110, "D"),
  );

  B.add("l2-mst", [
    {
      type: "mcq",
      q: "Prim's algorithm has two cables, each costing 5, that are equally the cheapest ones joining its tree to a new town. What happens?",
      o: [
        "Either choice works, and the final tree costs the same minimum",
        "It must take the cable listed first, or the tree stops being cheapest",
        "It skips both and takes the next dearest cable instead, to be safe",
      ],
      a: 0,
      hint: "Does the total depend on which of two equal-cost cables comes first?",
      why: "Ties can give different trees, but each has the same minimum total. Prim never needs to prefer one equal-cost cable to the other.",
    },
    {
      type: "multi",
      q: "A network of towns must form a single chain, so no town may have more than 2 cables. Select every true statement.",
      o: [
        "It still uses exactly one fewer cable than there are towns",
        "Its cost can never be lower than the plain minimum spanning tree's cost",
        "Greedy choices, as in Prim, can leave a dearer chain than the best one",
        "A greedy method like Prim is still guaranteed to find the cheapest chain",
        "The constraint can only make the cheapest network cheaper",
      ],
      a: [0, 1, 2],
      hint: "A constraint removes allowed networks. Can removing options help the minimum?",
      why: "The chain is still a tree, so it has n − 1 cables. The constraint only removes options, so the best valid cost is at least the plain minimum. Greedy can paint itself into a corner under the constraint, so it no longer carries a guarantee.",
    },
    {
      type: "order",
      q: "Put Prim's algorithm in order.",
      items: [
        "Start the tree at any one town",
        "List every cable joining the tree to a town not yet in it",
        "Add the cheapest of those cables",
        "Repeat until the tree has one fewer cable than there are towns",
      ],
      hint: "You need a tree before you can list the cables that join it to new towns.",
      why: "Prim grows a single tree outwards. Each round it adds the cheapest cable leading to a new town, and it stops at n − 1 cables, when every town is in.",
    },
    {
      type: "bug",
      q: "This version of Prim for n towns crashes because it runs out of cables to add. Click the faulty line.",
      code: [
        "tree = {start}",
        "chosen = []",
        "while len(chosen) < n:",
        "    c = cheapest_cable_to_new_town(tree)",
        "    chosen.append(c)",
        "    tree.add(c.new_town)",
      ],
      a: 2,
      hint: "A spanning tree needs one fewer cable than towns.",
      why: "Once n − 1 cables are chosen every town is already in the tree, so there is no new town to reach. The loop must stop at n − 1 (len(chosen) < n - 1).",
    },
    {
      type: "slider",
      q: "Every pair of 8 towns could be linked by a direct cable. How many different cables are possible in total?",
      min: 0,
      max: 60,
      step: 2,
      start: 10,
      ans: 28,
      tol: 2,
      unit: "cables",
      hint: "Each town pairs with 7 others. That counts every cable twice, so halve 8 × 7.",
      why: "8 × 7 = 56 pairings, each counted twice, so there are 28 possible cables. A spanning tree picks just 7 of them, which is why there is so much choice to search.",
    },
    {
      type: "pick",
      q: "Prim has built the green tree (A–B and B–C). The costs are shown on each cable. Which cable will Prim never add, even though it is cheaper than the cable it chooses next? Tap it.",
      fig: mstFig,
      a: "AC",
      hint: "Prim's next choice is the cheapest cable that reaches D. Which cheaper cable only joins towns already in the tree?",
      why: "The next cable is C–D (4), the cheapest one reaching the new town D. A–C costs 3 but both ends are already in the tree, so adding it would close a loop A–B–C.",
    },
  ]);

  const qbars = [
    [40, 10],
    [60, 30],
    [70, 55],
    [74, 78],
    [76, 90],
  ];
  const qFig = svg(
    420,
    220,
    qbars
      .map(
        (b, i) =>
          `<g data-pick="t${i + 1}">${box(8 + i * 82, 8, 76, 172)}<rect x="${16 + i * 82}" y="${170 - b[0] * 1.5}" width="26" height="${b[0] * 1.5}" rx="3" fill="var(--amber)"/><rect x="${46 + i * 82}" y="${170 - b[1] * 1.5}" width="26" height="${b[1] * 1.5}" rx="3" fill="var(--teal)"/>${tx(29 + i * 82, 164 - b[0] * 1.5, b[0], "var(--text)", 11)}${tx(59 + i * 82, 164 - b[1] * 1.5, b[1], "var(--text)", 11)}${tx(46 + i * 82, 198, "after " + (i + 1) + " min", "var(--text-dim)", 12)}</g>`,
      )
      .join("") + tx(10, 214, "orange = simple method, green = EA", "var(--text-dim)", 11, "start"),
  );

  B.add("l2-approx", [
    {
      type: "multi",
      q: "A simple method and an EA are compared on the same problem at different time budgets. Select every true statement about the quality-versus-time picture.",
      o: [
        "With a very short time budget, the simple method can be the better choice",
        "With a long enough budget, the EA can overtake the simple method",
        "The simple method levels off, so extra time stops helping it much",
        "The EA gives the better answer whatever the time budget",
        "Running the simple method longer keeps lifting it at the same steady rate",
      ],
      a: [0, 1, 2],
      hint: "One method is quick but levels off. The other is slow but keeps climbing. Is either best at every time?",
      why: "The simple method is ahead early, then flattens. The EA starts slowly and keeps improving, so it wins given enough time. Neither is best at every budget, which is why the time you can wait matters.",
    },
    {
      type: "slider",
      q: "New York Tunnels has 21 pipes with 16 diameters each, about 1.9 × 10²⁵ designs. A machine checks a trillion designs per second (1,000 times faster than a billion). About how many thousand years does a full exhaustive check take?",
      min: 0,
      max: 1200,
      step: 50,
      start: 300,
      ans: 600,
      tol: 100,
      unit: "thousand years",
      hint: "1.9 × 10²⁵ ÷ 10¹² is about 2 × 10¹³ seconds. A year is about 3 × 10⁷ seconds, so divide again: about 6 × 10⁵ years.",
      why: "About 600,000 years. A computer 1,000 times faster only turns 600 million years into 600 thousand, which is still hopeless. That is why a hard problem like this is attacked with an approximate method.",
    },
    {
      type: "bug",
      q: "This approximate search should keep improving its route until the time budget runs out, but it returns its random starting route unchanged. Click the faulty line.",
      code: [
        "start = time.time()",
        "best = random_route()",
        "while time.time() - start > budget:",
        "    cand = mutate(best)",
        "    if length(cand) < length(best):",
        "        best = cand",
        "return best",
      ],
      a: 2,
      hint: "At the very start, how much time has passed compared with the budget?",
      why: "At the start the elapsed time is near 0, so it is not greater than the budget and the loop body never runs. It should keep going while the elapsed time is less than the budget. Stopping on a time limit is what lets approximate methods return something useful at any moment.",
    },
    {
      type: "pick",
      q: "A simple method (orange) and an EA (green) were both stopped after 1 to 5 minutes. The scores are route quality out of 100. Tap the first stopping time at which the EA is better than the simple method.",
      fig: qFig,
      a: "t4",
      hint: "Compare the two bars in each box, from the left.",
      why: "After 3 minutes the simple method still leads, 70 to 55. After 4 minutes the EA is ahead, 78 to 74. The simple method levels off while the EA keeps climbing, which is the quality-versus-time curve from the lecture.",
    },
    {
      type: "slider",
      q: "One run of an EA takes 90 seconds. You have 15 minutes. How many complete runs fit in the time?",
      min: 0,
      max: 30,
      step: 1,
      start: 5,
      ans: 10,
      tol: 1,
      unit: "runs",
      hint: "15 minutes is 900 seconds. How many 90s fit in 900?",
      why: "900 ÷ 90 = 10 runs. Several runs give several answers, and keeping the best of them is a cheap way to improve an approximate method, though none of them is proven optimal.",
    },
    {
      type: "mcq",
      q: "Three runs of the same EA on one delivery problem return routes of 412 km, 405 km and 409 km. What is the sensible conclusion?",
      o: [
        "Use the 405 km route, but do not claim it is the best possible",
        "Use the 409 km route, as the middle result is the most reliable",
        "Run it again until all three agree, since that proves it is best",
      ],
      a: 0,
      hint: "You want a short route. Does agreement between runs prove anything about optimality?",
      why: "The shortest route found, 405 km, is the one to use, but no run is guaranteed optimal. The middle result has no special reliability (the best one is simply better), and three runs agreeing would still not prove that nothing shorter exists.",
    },
  ]);
})();

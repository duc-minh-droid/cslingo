(function () {
  const B = NIC.bank;
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;max-height:${h}px">${body}</svg>`;
  const tx = (x, y, s, { c = "var(--text)", z = 13 } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 ${z}px var(--sans);fill:${c}">${s}</text>`;
  const card = (id, x, y, w, h, lines) =>
    `<g data-pick="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${lines.map((s, i) => tx(x + w / 2, y + 22 + i * 20, s, { z: i ? 12 : 14, c: i ? "var(--text-dim)" : "var(--text)" })).join("")}</g>`;

  B.add("l4-tournament", [
    {
      type: "order",
      q: "Put the steps of ONE tournament selection (size t) in order.",
      items: [
        "Draw t individuals from the population at random",
        "Read the fitness of each entrant",
        "Keep the entrant with the highest fitness",
        "Hand that winner on as a parent",
      ],
      hint: "You cannot compare entrants until you have drawn them.",
      why: "Tournament selection only compares a handful of entrants, so there is no sorting and no total fitness to compute. Draw, compare, keep the best, and use it as a parent. Repeat the whole thing for each parent you need.",
    },
    {
      type: "cat",
      q: "Each change is made to a tournament selector (entrants drawn with replacement). Sort it by its effect on selection pressure.",
      buckets: ["Pressure goes up", "Pressure goes down"],
      items: [
        ["Raise t from 2 to 6", 0],
        ["Lower t from 5 to 2", 1],
        ["Switch from t = 3 to t = 1", 1],
        ["Enter 8 contestants per tournament instead of 3", 0],
      ],
      hint: "More entrants means the champion of the group is more likely to be a really good one.",
      why: "The more entrants, the more likely at least one of them is near the top, and the winner is always the best of the group, so pressure rises. With t = 1 there is no comparison at all, so the pick is purely random.",
    },
    {
      type: "slider",
      q: "A GA has 10 individuals, all with different fitnesses. It picks 20 parents, each by its own size-2 tournament (entrants drawn with replacement). About how many of those 20 parents are the single fittest individual?",
      min: 0,
      max: 20,
      step: 1,
      start: 10,
      ans: 4,
      tol: 2,
      unit: "parents",
      hint: "The best loses a tournament only if neither entrant is the best: 0.9 × 0.9 = 0.81, so it wins about 0.2 of the time. Then 0.2 × 20.",
      why: "In one tournament the best wins with chance 1 − 0.9² = 0.19, about 0.2. Over 20 parents that is about 20 × 0.19 ≈ 4. A purely random pick would give only 2, so size 2 has a gentle push towards the best.",
    },
    {
      type: "multi",
      q: "A GA picks parents by tournament selection. Which statements are true?",
      o: [
        "A larger t makes a weak winner less likely",
        "With t = 1 the fittest individual is picked no more often than anyone else",
        "A tournament always returns the fittest individual in the whole population",
        "The same individual can be the winner of several different tournaments",
        "With replacement and t equal to the population size, the best is always among the entrants",
      ],
      a: [0, 1, 3],
      hint: "Each tournament is a fresh random draw, so luck is always involved.",
      why: "More entrants means a weak individual needs to be lucky enough to avoid every strong rival. With t = 1 there is no contest, so every individual is equally likely. Each tournament is separate, so a strong individual can win many of them. A tournament only sees its own entrants, so the global best can be missed, even with t equal to the population size: drawing with replacement misses it about 37% of the time.",
    },
    {
      type: "bug",
      q: "This should return the fittest of t random entrants, but every tournament returns the same individual for the whole call (it keeps picking one random slot). Tap the faulty line.",
      code: [
        "def tournament(pop, t):",
        "    i = random.randrange(len(pop))",
        "    best = pop[i]",
        "    for _ in range(t):",
        "        c = pop[i]",
        "        if fitness(c) > fitness(best):",
        "            best = c",
        "    return best",
      ],
      a: 4,
      why: "The index i is drawn once, outside the loop, so every entrant is the same individual and nothing is compared. The loop body should draw a new index each time: c = pop[random.randrange(len(pop))].",
    },
    {
      type: "mcq",
      q: "Late in a run the top ten fitnesses in a population all lie between 0.9990 and 1.0000. A size-2 tournament now picks parents. What happens?",
      o: [
        "It still returns the fitter entrant each time",
        "It picks either entrant with equal chance",
        "It returns the entrant closest to the average",
        "It fails because the gaps are too small to compare",
      ],
      a: 0,
      hint: "Does the tournament care how big the gap is, or only who is ahead?",
      why: "Tournaments use ranks, not gaps, so a 0.001 edge wins as surely as a huge one. That is why pressure stays steady, while roulette selection would become almost uniform once the fitnesses bunch together.",
    },
  ]);

  B.add("l4-mutation", [
    {
      type: "order",
      q: "Put the steps of swap mutation on a tour in order.",
      items: [
        "Copy the parent tour",
        "Choose two different positions at random",
        "Exchange the two cities at those positions",
        "Return the child, leaving the parent as it was",
      ],
      hint: "Mutation should return a changed copy, so the copy comes before the change.",
      why: "Copy first so the parent survives, choose two positions, then exchange their cities. Because the same cities are only moved around, each city still appears exactly once.",
    },
    {
      type: "cat",
      q: "An EA's mutation rate has been set badly. Sort each symptom by what the rate probably is.",
      buckets: ["Rate too high", "Rate too low"],
      items: [
        ["Children look nothing like their parents and the best fitness keeps bouncing about", 0],
        ["The population fills with near-identical copies and the best stops improving", 1],
        ["A good solution is wrecked in most of its children", 0],
        ["A gene value missing from every member never comes back", 1],
      ],
      hint: "Too much mutation turns the search random. Too little leaves nothing new to try.",
      why: "A very high rate scrambles good solutions, so the search becomes close to random and progress bounces about. A very low rate creates almost no new variation, so the population stagnates and lost values stay lost.",
    },
    {
      type: "slider",
      q: "A string has 10 genes, each a digit 0 to 9. Single-gene mutation picks one gene at random and gives it a new random value. About what percentage of mutations pick gene number 4 to change?",
      min: 0,
      max: 100,
      step: 5,
      start: 50,
      ans: 10,
      tol: 5,
      unit: "%",
      hint: "One gene is chosen out of ten, evenly.",
      why: "Each of the 10 genes is equally likely to be chosen, so gene 4 is the one changed in 1 out of 10 mutations, 10%. Single-gene mutation always changes exactly one gene, so the child stays very close to its parent.",
    },
    {
      type: "multi",
      q: "Which statements about mutation are true?",
      o: [
        "A larger Gaussian σ gives bigger jumps and more exploration",
        "It can bring back a gene value that has vanished from the population",
        "Insertion mutation on a tour can leave a city visited twice",
        "Raising the rate is always better because it explores more",
      ],
      a: [0, 1],
      hint: "Think about what noise size and rate do to exploitation and exploration.",
      why: "σ is the step size, so bigger σ means bolder jumps. Mutation is the only operator that can recreate a lost value. Moving a city to a new place keeps every city present exactly once, and a very high rate wrecks good solutions, turning the search into a random one.",
    },
    {
      type: "bug",
      q: "This swap mutation should exchange two cities of a tour, but its children contain a repeated city. Tap the faulty line.",
      code: [
        "def swap_mutate(tour):",
        "    child = tour[:]",
        "    i, j = random.sample(range(len(child)), 2)",
        "    child[i], child[j] = child[j], child[j]",
        "    return child",
      ],
      a: 3,
      why: "The right-hand side reads child[j] twice, so city j is copied into position i and the city that was at i is lost. It should be child[i], child[j] = child[j], child[i].",
    },
    {
      type: "match",
      q: "Match each mutation setting to its effect.",
      pairs: [
        ["Larger Gaussian σ", "Longer jumps and more exploration"],
        ["Smaller Gaussian σ", "Fine adjustments close to the parent"],
        ["Higher per-gene rate", "More genes change in each child"],
        ["Rate of zero, with no crossover either", "No new gene values ever appear"],
      ],
      why: "σ sets the step size, so a bigger one jumps further and a smaller one fine-tunes. The rate sets how many genes change. With no mutation and no crossover, nothing can create a new value.",
    },
  ]);

  const bits = (id, y, s, pick) => {
    const body = `<rect x="52" y="${y - 20}" width="${s.length * 28 + 8}" height="30" rx="6" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${[...s].map((ch, i) => tx(70 + i * 28, y, ch, { z: 15, c: ch === "1" ? "var(--blue-ink)" : "var(--amber-ink)" })).join("")}`;
    return `${pick ? `<g data-pick="${id}">${body}</g>` : `<g>${body}</g>`}${tx(26, y + 3, id, { z: 12, c: "var(--text-dim)" })}`;
  };
  B.add("l4-crossover", [
    {
      type: "pick",
      q: "Parent 1 is 11001011 and parent 2 is 10011101. Uniform crossover (no mutation) builds a child by taking each gene from one parent or the other. Exactly one child below is impossible. Tap it.",
      fig: svg(
        320,
        200,
        [
          bits("P1", 24, "11001011", false),
          bits("P2", 54, "10011101", false),
          bits("K", 100, "10001101", true),
          bits("L", 130, "11011011", true),
          bits("M", 160, "10101011", true),
          bits("N", 190, "11001111", true),
        ].join(""),
      ),
      a: "M",
      why: "Gene 3 is 0 in both parents, so every child must have 0 there. Child M has 1 at gene 3, which neither parent has. In K, L and N every gene matches one of the parents at its position, so some mask makes each of them.",
    },
    {
      type: "order",
      q: "Put the steps of uniform crossover (two children) in order.",
      items: [
        "Copy both parents into two children",
        "Flip a coin for every gene to build a mask",
        "Swap the two children's genes wherever the mask says so",
        "Return both children",
      ],
      hint: "The mask must exist before it can be applied.",
      why: "Start with copies, build one random mask, swap the marked genes between the children, then return both. Each gene is decided independently, which is what makes it uniform.",
    },
    {
      type: "slider",
      q: "1-point crossover is applied to strings of 11 genes. The cut is placed uniformly in one of the 10 gaps between neighbours. About what percentage of the time are genes 4 and 7 split between the two parents?",
      min: 0,
      max: 100,
      step: 5,
      start: 50,
      ans: 30,
      tol: 8,
      unit: "%",
      hint: "Count the gaps between gene 4 and gene 7: after 4, after 5 and after 6.",
      why: "The two genes end up on different parents only if the cut falls in one of the 3 gaps between them, out of 10 gaps: 3/10 = 30%. Genes further apart are split more often, which is the positional bias of 1-point crossover.",
    },
    {
      type: "slider",
      q: "Two parents of 20 genes differ at exactly 8 positions. Uniform crossover makes child 1 with a fair coin per gene. On average, at about how many positions does child 1 differ from parent 1?",
      min: 0,
      max: 20,
      step: 1,
      start: 10,
      ans: 4,
      tol: 1,
      unit: "genes",
      hint: "Where the parents agree, nothing can change. Each of the other 8 genes switches half the time.",
      why: "At the 12 positions where the parents agree, child 1 matches parent 1 whatever the coin says. Each of the 8 differing positions comes from parent 2 half the time, so about 8 × 0.5 = 4 genes differ.",
    },
    {
      type: "multi",
      q: "Which statements about crossover are true?",
      o: [
        "Uniform crossover separates two neighbouring genes about half the time",
        "If both parents have 1 at gene 7, every child made by crossover alone has 1 there",
        "1-point crossover can create a gene value neither parent has",
        "With an even number of cuts, a child's first and last genes come from the same parent",
        "A crossover rate of 1 means children are exact copies",
      ],
      a: [0, 1, 3],
      hint: "Crossover only shuffles existing genes.",
      why: "A fair coin per gene splits neighbours half the time. Crossover only moves existing values around, so a value both parents share cannot change. An even number of cuts returns to the first parent for the final segment. A crossover rate of 1 means every pair is crossed, not copied.",
    },
    {
      type: "bug",
      q: "This 1-point crossover should return two children with as many genes as the parents, but the first child comes out the wrong length. Tap the faulty line.",
      code: [
        "def one_point(p1, p2):",
        "    cut = random.randint(1, len(p1) - 1)",
        "    c1 = p1[:cut] + p2[:cut]",
        "    c2 = p2[:cut] + p1[cut:]",
        "    return c1, c2",
      ],
      a: 2,
      why: "The first child should be p1 before the cut plus p2 after it: p1[:cut] + p2[cut:]. Using p2[:cut] gives 2 × cut genes instead of the full length.",
    },
  ]);

  B.add("l4-lab", [
    {
      type: "slider",
      q: "In the lab's algorithm 2 (generational, elitist) the population is 30. Each generation builds 29 children and keeps the single best old member, which is already scored. About how many new pictures are scored over 20 generations?",
      min: 0,
      max: 1000,
      step: 50,
      start: 500,
      ans: 600,
      tol: 60,
      unit: "pictures",
      hint: "29 is about 30, and 30 × 20 = 600.",
      why: "Each generation scores 29 new children, so 20 generations score 29 × 20 = 580, about 600. Algorithm 1 scores one child per step, so it would need about 580 steps to do the same amount of scoring.",
    },
    {
      type: "order",
      q: "Put one generation of lab algorithm 2 (generational, elitist, crossover and mutation) in order.",
      items: [
        "Rank-select 2 × (P − 1) parents",
        "Pair the parents up",
        "Cross over each pair, with probability cross_rate",
        "Mutate the children",
        "Keep the best old member and add all the children",
      ],
      hint: "Parents must be chosen and paired before they can be crossed, and children must exist before they are mutated.",
      why: "Selection comes first, then pairing, crossover and mutation produce P − 1 children. Finally the single best old member joins them, which is the elitism that stops the best fitness from falling.",
    },
    {
      type: "cat",
      q: "Sort each dashboard reading by whether it points to a healthy search or to trouble.",
      buckets: ["Healthy", "Trouble"],
      items: [
        ["Best and mean both climb while diversity drifts down slowly", 0],
        ["Diversity is 0 while best fitness is only 0.82", 1],
        ["Mean ends close to the best as best nears 1.0", 0],
        ["Best falls from 0.9 to 0.7 in a run that keeps its best member each generation", 1],
      ],
      hint: "Falling diversity is fine near the end but not early. Which reading breaks a rule of the algorithm?",
      why: "Diversity drops naturally once the population closes in on the target. Zero diversity at 0.82 means everyone is the same and stuck, and a best that falls despite keeping the best member each generation points to a bug, because that member should never be lost.",
    },
    {
      type: "multi",
      q: "Which statements about the lab are true?",
      o: [
        "Keeping the best member each generation means best fitness never falls",
        "Mutation-only algorithm 1 can still reach a perfect 1.0",
        "Crossing identical members creates new pixel patterns",
        "Dropping tournament size from 5 to 2 slows the loss of diversity",
      ],
      a: [0, 1, 3],
      hint: "Crossover can only mix what the parents already contain.",
      why: "Elitism protects the best, and mutation alone can still fix pixels one at a time. A smaller tournament means lower pressure, so diversity is lost more slowly. Crossing identical members just returns copies.",
    },
    {
      type: "bug",
      q: "This is one step of lab algorithm 1. The child should replace the WORST member when it is not worse, but the rest of the population never changes and only the top slot keeps moving. Tap the faulty line.",
      code: [
        "def step(pop, fit):",
        "    parent = tournament(pop, fit, 3)",
        "    child = mutate(parent, 0.01)",
        "    f = score(child)",
        "    w = fit.index(max(fit))",
        "    if f >= fit[w]:",
        "        pop[w], fit[w] = child, f",
      ],
      a: 4,
      why: "max(fit) finds the best member, not the worst, so the child can only ever overwrite the best slot. Every other member is untouched. It should use min(fit) to find the worst.",
    },
    {
      type: "pick",
      q: "Four lab runs ended with these dashboard readings. Tap the run that would benefit most from raising the mutation rate.",
      fig: svg(
        340,
        150,
        [
          card("A", 6, 6, 160, 64, ["Run A", "best 0.99, div 0.1"]),
          card("B", 174, 6, 160, 64, ["Run B", "best 0.80, div 0"]),
          card("C", 6, 80, 160, 64, ["Run C", "best 0.97, div 0.05"]),
          card("D", 174, 80, 160, 64, ["Run D", "best 0.74, div 0.8"]),
        ].join(""),
      ),
      a: "B",
      why: "Run B has zero diversity, so every member is the same and crossover cannot help. Only mutation can add new variation. A and C are close to done, and D still has plenty of diversity to work with.",
    },
  ]);
})();

(function () {
  const B = NIC.bank;

  /* ---------- figures ---------- */
  const hbar = (v, y, id, name) =>
    `<g data-pick="${id}"><rect x="40" y="${y}" width="${Math.max(6, v * 1.3)}" height="30" rx="8" fill="var(--blue)" stroke="var(--blue-lip)" stroke-width="3"/><text x="10" y="${y + 20}" font-size="14" font-weight="900" fill="var(--text)">${name}</text><text x="${50 + v * 1.3}" y="${y + 20}" font-size="14" font-weight="800" fill="var(--text)">${v}</text></g>`;
  const children = `<svg viewBox="0 0 330 190" width="330" height="190" role="img" aria-label="Four bars of children made over ten rounds">
    <text x="10" y="18" font-size="13" font-weight="800" fill="var(--text)">Children made over 10 rounds (population 20)</text>
    ${hbar(200, 30, "a", "A")}${hbar(10, 70, "b", "B")}${hbar(180, 110, "c", "C")}${hbar(20, 150, "d", "D")}
  </svg>`;

  const best = [5, 7, 8, 8.5, 8.8, 8.8, 8.8, 8.8, 8.8];
  const mean = [2, 4, 6, 7.8, 8.5, 8.8, 8.8, 8.8, 8.8];
  const xy = (vals) => vals.map((v, i) => `${40 + i * 40},${150 - v * 13}`).join(" ");
  const cols = best
    .map(
      (_, i) =>
        `<g data-pick="g${i}"><rect x="${22 + i * 40}" y="20" width="36" height="150" fill="transparent"/><text x="${40 + i * 40}" y="168" text-anchor="middle" font-size="12" font-weight="800" fill="var(--text)">${i}</text></g>`,
    )
    .join("");
  const converge = `<svg viewBox="0 0 380 180" width="380" height="180" role="img" aria-label="Best and mean fitness over nine generations">
    <line x1="22" y1="150" x2="360" y2="150" stroke="var(--line-2)" stroke-width="2"/>
    <polyline points="${xy(best)}" fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round"/>
    <polyline points="${xy(mean)}" fill="none" stroke="var(--violet)" stroke-width="4" stroke-dasharray="8 5" stroke-linejoin="round"/>
    <text x="30" y="16" font-size="12" font-weight="800" fill="var(--text)">Best (solid green), mean (dashed purple), by generation</text>
    ${cols}
  </svg>`;

  const wbar = (v, i, id, name) =>
    `<g data-pick="${id}"><rect x="${30 + i * 65}" y="${150 - v * 8}" width="46" height="${v * 8}" rx="6" fill="var(--amber)" stroke="var(--amber-lip)" stroke-width="3"/><text x="${53 + i * 65}" y="${142 - v * 8}" text-anchor="middle" font-size="13" font-weight="900" fill="var(--text)">${v}</text><text x="${53 + i * 65}" y="168" text-anchor="middle" font-size="14" font-weight="900" fill="var(--text)">${name}</text></g>`;
  const wheelBars = `<svg viewBox="0 0 300 175" width="300" height="175" role="img" aria-label="Fitness of four individuals, A to D">
    <line x1="20" y1="150" x2="290" y2="150" stroke="var(--line-2)" stroke-width="2"/>
    ${wbar(8, 0, "a", "A")}${wbar(4, 1, "b", "B")}${wbar(16, 2, "c", "C")}${wbar(2, 3, "d", "D")}
  </svg>`;

  const rankP = (b) => {
    const w = [1, 2, 3, 4, 5].map((r) => r ** b);
    const s = w.reduce((a, c) => a + c, 0);
    return w.map((x) => x / s);
  };
  const curve = (b) =>
    rankP(b)
      .map((p, i) => `${50 + i * 60},${160 - p * 300}`)
      .join(" ");
  const rankCurves = `<svg viewBox="0 0 330 185" width="330" height="185" role="img" aria-label="Chance of being picked for ranks 1 to 5, three lines">
    <line x1="30" y1="160" x2="310" y2="160" stroke="var(--line-2)" stroke-width="2"/>
    <polyline points="${curve(0.5)}" fill="none" stroke="var(--violet)" stroke-width="4"/>
    <polyline points="${curve(1)}" fill="none" stroke="var(--blue)" stroke-width="4"/>
    <polyline points="${curve(2)}" fill="none" stroke="var(--amber)" stroke-width="4"/>
    <text x="30" y="14" font-size="12" font-weight="800" fill="var(--text)">Chance by rank: A purple, B blue, C orange</text>
    <g data-pick="a"><polyline points="${curve(0.5)}" fill="none" stroke="transparent" stroke-width="10"/></g>
    <g data-pick="b"><polyline points="${curve(1)}" fill="none" stroke="transparent" stroke-width="10"/></g>
    <g data-pick="c"><polyline points="${curve(2)}" fill="none" stroke="transparent" stroke-width="10"/></g>
  </svg>`;

  /* ---------- 4.1 generational vs steady-state ---------- */
  B.add("l4-types", [
    {
      type: "pick",
      q: "Four GAs share a population of 20. Each bar counts the children one GA made over 10 rounds. They are: steady-state with 1 child per step, steady-state with 2 per step, generational with no elites, and generational with 2 elites. Click the bar for the generational GA with 2 elites.",
      fig: children,
      a: "c",
      hint: "With 2 elites, only 18 members are rebuilt each round. Then multiply by 10 rounds.",
      why: "A generational GA with 2 elites makes 20 - 2 = 18 children per round, so 180 over 10 rounds. Without elites it makes all 20 each round, giving 200. A steady-state GA makes only 1 or 2 children per step, so 10 or 20 in total.",
    },
    {
      type: "match",
      q: "Match each GA (population 40) to the number of new children it makes in one round.",
      pairs: [
        ["Generational, no elites", "40 children"],
        ["Generational, 5 elites", "35 children"],
        ["Steady-state, N = 2", "2 children"],
        ["Steady-state, N = 1", "1 child"],
      ],
      hint: "A generational round rebuilds everyone except the elites. A steady-state step makes N children.",
      why: "A generational round must rebuild all 40 members, minus any elites copied across unchanged (40 - 5 = 35). A steady-state step only applies the operators N times, so it makes 2 or 1 children and everyone else stays.",
    },
    {
      type: "multi",
      q: "A steady-state GA keeps a population of 20 and maximises fitness. Each child replaces the weakest member, but only if the child is at least as good. Select every statement that is true.",
      o: [
        "The best member can never be the one that is replaced",
        "The population still holds exactly 20 members after every step",
        "Each step makes about 20 children, one for every member",
        "Every child enters the population, however poor it is",
        "The fitness of the weakest member can never fall",
      ],
      a: [0, 1, 4],
      hint: "Ask what happens to the weakest member when a child replaces it.",
      why: "A child takes the place of the weakest member, so the size stays at 20 and the best is safe (it is never the weakest). The child must be at least as good as the member it replaces, so the new weakest member is never worse than the old one. A step makes only 1 or 2 children, and poor children are discarded.",
    },
    {
      type: "bug",
      q: "This generational GA maximises fitness and should keep its k best members, yet its best fitness keeps falling. Click the faulty line.",
      code: [
        "def next_generation(pop, fit, k):",
        "    ranked = sorted(pop, key=fit, reverse=True)",
        "    elites = ranked[-k:]",
        "    kids = make_children(pop, len(pop) - k)",
        "    return elites + kids",
      ],
      a: 2,
      hint: "The list is sorted best first. Which end of it does the slice take?",
      why: "With reverse=True the best members come first, so the elites are ranked[:k]. The slice ranked[-k:] copies the k worst members across unchanged, so the real best can be lost.",
    },
    {
      type: "cat",
      q: "Sort each feature by the scheme it belongs to. Use an elitist generational GA and a steady-state GA that replaces the weakest member.",
      buckets: ["Elitist generational", "Steady-state, replace weakest", "Both"],
      items: [
        ["Copies the n best across unchanged on purpose", 0],
        ["Keeps the best only as a side effect of who gets replaced", 1],
        ["Protects the best individual from being lost", 2],
        ["A new child can become a parent in the very next step", 1],
        ["Everyone except the elites is discarded each round", 0],
        ["Can choose parents by tournament selection", 2],
      ],
      hint: "Ask whether the best is protected deliberately, by accident, or both.",
      why: "Elitism is a deliberate copy of the n best. In steady-state, the best survives only because it is never the weakest. Both protect the best and both can use any selection method. Steady-state children join the population at once, whereas generational children wait for the next round.",
    },
    {
      type: "mcq",
      q: "Two GAs have the same population size and make the same total number of children. One is generational with no elitism. The other is steady-state with replace-weakest. Which statement about their search is most accurate?",
      o: [
        "The steady-state run is greedier and may settle early",
        "The generational run is greedier, since everyone is replaced",
        "Neither differs, because the number of children is the same",
      ],
      a: 0,
      hint: "Which one uses each good child straight away and never drops the best?",
      why: "Steady-state with replace-weakest is greedy: good children are used at once and the weak are removed, which raises selection pressure and can converge early. Generational replacement changes more at once, which explores more but, without elitism, can lose good solutions.",
    },
  ]);

  /* ---------- 4.2 replacement ---------- */
  B.add("l4-replacement", [
    {
      type: "cat",
      q: "A child arrives and the population is scanned from slot 1. For each case, sort by whether replace-weakest and replace-first-weaker pick the same slot.",
      buckets: ["Same slot under both", "Different slots"],
      items: [
        ["Population 0.2, 0.5, 0.9 and child 0.4", 0],
        ["Population 0.5, 0.2, 0.1 and child 0.4", 1],
        ["Population 0.9, 0.6, 0.1 and child 0.8", 1],
        ["Population 0.3, 0.7, 0.8 and child 0.6", 0],
        ["Population 0.7, 0.1, 0.4 and child 0.5", 0],
      ],
      hint: "Find the lowest member, then find the first member lower than the child.",
      why: "They agree only when the first member weaker than the child is also the weakest one. In 0.5, 0.2, 0.1 the scan stops at 0.2 but the weakest is 0.1. In 0.9, 0.6, 0.1 it stops at 0.6 but the weakest is 0.1. In the other three cases the first weaker member is the weakest.",
    },
    {
      type: "slider",
      q: "A population of ten sits in slot order with fitness 0.9, 0.8, 0.7, 0.6, 0.9, 0.8, 0.3, 0.7, 0.9, 0.2. A child scoring 0.5 arrives. Replace-first-weaker scans from slot 1 and stops at the first weaker member. How many members does it look at, counting the one it overwrites?",
      min: 1,
      max: 10,
      step: 1,
      start: 4,
      ans: 7,
      tol: 0,
      unit: "members",
      hint: "Move along the list until you meet a value below 0.5.",
      why: "Slots 1 to 6 all score above 0.5, so they are skipped. Slot 7 (0.3) is the first weaker member, so the scan stops there after 7 looks. Replace-weakest would have looked at all ten and overwritten slot 10 (0.2) instead.",
    },
    {
      type: "multi",
      q: "A steady-state GA switches from replace-weakest to replace-first-weaker. Select every statement that is true.",
      o: [
        "A middling member can be evicted while a much weaker one survives",
        "Weak members tend to survive for longer, which keeps more variety",
        "Each child always removes the weakest member in the population",
        "Where a member sits in the list can change whether it is evicted",
        "Every member must be examined for every child",
      ],
      a: [0, 1, 3],
      hint: "The scan stops at the first weaker member it meets.",
      why: "Because the scan stops early, the evicted member depends on list order, and a very weak member further down may be missed. That lowers selection pressure and keeps more variety. The victim is only the first member weaker than the child, not always the weakest, and the scan can stop early without looking at everyone.",
    },
    {
      type: "bug",
      q: "Replace-weakest should overwrite the weakest member whenever the child is at least as good. But when a child ties exactly with the weakest member, it is thrown away. Click the faulty line.",
      code: [
        "def insert(pop, fits, child, f):",
        "    w = fits.index(min(fits))",
        "    if f > fits[w]:",
        "        pop[w] = child",
        "        fits[w] = f",
      ],
      a: 2,
      hint: "The rule says at least as good, which includes a tie.",
      why: "f > fits[w] is false when the two are equal. At least as good needs f >= fits[w]. Using >= lets a tie replace the weakest member, so equal children are no longer thrown away.",
    },
    {
      type: "order",
      q: "Replace-first-weaker scans from slot 1 for a child scoring 0.5. The population in slot order is 0.8, 0.6, 0.3, 0.9. Put the events in the order they happen.",
      items: [
        "Compare slot 1 (0.8) with 0.5: not weaker, move on",
        "Compare slot 2 (0.6) with 0.5: not weaker, move on",
        "Compare slot 3 (0.3) with 0.5: weaker, so overwrite it",
        "Stop: slot 4 (0.9) is never looked at",
      ],
      hint: "The scan goes slot by slot and stops at the first member below 0.5.",
      why: "Slots 1 and 2 both beat the child, so the scan moves on. Slot 3 (0.3) is the first weaker member, so it is overwritten and the scan ends. Slot 4 is never examined.",
    },
    {
      type: "mcq",
      q: "Replace-first-weaker scans from slot 1 and equal fitness counts as weaker. The population in slot order is 0.7, 0.3, 0.7, 0.2 and the child scores 0.7. Which slot is overwritten?",
      o: ["Slot 1 (0.7)", "Slot 2 (0.3)", "Slot 4 (0.2)", "None, the child is discarded"],
      a: 0,
      hint: "Check slot 1 first. Is 0.7 weaker than a child of 0.7 when ties count?",
      why: "Slot 1 ties with the child and ties count as weaker, so the scan stops there and overwrites it. The 0.3 and 0.2 members survive, even though they are far weaker.",
    },
  ]);

  /* ---------- 4.3 selection pressure ---------- */
  B.add("l4-pressure", [
    {
      type: "order",
      q: "Put the stages of premature convergence in order.",
      items: [
        "The population starts out varied, with good and poor members",
        "Selection picks the fittest far more often than the rest",
        "Copies of one or two individuals fill more and more slots",
        "The population becomes nearly identical, with no variety left",
        "Progress stops, usually on a local optimum",
      ],
      hint: "Takeover has to happen before diversity can run out.",
      why: "Strong pressure copies the fittest again and again. Their copies take over, diversity vanishes, and a population with nothing left to choose between can only sit on whichever hill it reached.",
    },
    {
      type: "slider",
      q: "A population of 40 different individuals always picks the single best individual as every parent. There is no mutation or crossover, so children are plain copies. After one generation, how many different individuals are in the population?",
      min: 0,
      max: 40,
      step: 1,
      start: 20,
      ans: 1,
      tol: 0,
      unit: "individuals",
      hint: "If every parent is the same individual, what do the children look like?",
      why: "Every child is a copy of the one best parent, so one generation is enough to wipe out all variety. This is the extreme end of selection pressure.",
    },
    {
      type: "multi",
      q: "An EA is converging prematurely. Select every change that would lower its selection pressure.",
      o: [
        "Reduce the tournament size from 7 to 3",
        "Lower the rank exponent b from 3 to 1",
        "Raise the tournament size from 3 to 7",
        "Pick parents by rank instead of always picking the best",
        "Raise the rank exponent b from 1 to 3",
      ],
      a: [0, 1, 3],
      hint: "Pressure falls when weaker individuals get a fairer chance of being picked.",
      why: "Smaller tournaments, a smaller rank exponent and a rank-based chance all give weaker individuals more chances to breed. Larger tournaments and a larger exponent do the opposite and favour the leaders even more.",
    },
    {
      type: "bug",
      q: "This tournament should enter exactly t random individuals, so t = 1 should behave like random selection. Instead, t = 1 already favours fitter individuals. Click the faulty line.",
      code: [
        "def tournament(pop, fit, t):",
        "    best = random.choice(pop)",
        "    for _ in range(t):",
        "        rival = random.choice(pop)",
        "        if fit(rival) > fit(best):",
        "            best = rival",
        "    return best",
      ],
      a: 2,
      hint: "The first entrant is picked before the loop. Count the entrants when t = 1.",
      why: "The first entrant is chosen before the loop, so the loop should add only t - 1 rivals. With range(t) the tournament has t + 1 entrants, so t = 1 is really a two-entrant tournament and the pressure is higher than intended.",
    },
    {
      type: "pick",
      q: "An EA with no mutation ran for nine generations. Click the first generation at which every member has the same fitness (mean equals best).",
      fig: converge,
      a: "g5",
      hint: "When does the dashed line meet the solid line and stay with it?",
      why: "The mean and the best first meet at generation 5, so everyone now has the same fitness and selection has nothing left to choose between. The best never improves afterwards, which is the sign of premature convergence.",
    },
    {
      type: "mcq",
      q: "Two teams run the same EA on a population of 30. Team A selects with tournaments of size 2 and team B with tournaments of size 20. Which team is more likely to stall early and need extra mutation to keep exploring?",
      o: [
        "Team B, because large tournaments favour the leaders",
        "Team A, because small tournaments let weak parents breed too often",
        "Neither, because both teams compare the same population members",
      ],
      a: 0,
      hint: "A size 20 tournament from 30 members almost always contains a top individual.",
      why: "Large tournaments pick the fittest almost every time, so a few individuals take over fast and variety disappears. Extra mutation puts exploration back. Size 2 tournaments leave plenty of chances for weaker members.",
    },
  ]);

  /* ---------- 4.4 roulette ---------- */
  B.add("l4-roulette", [
    {
      type: "slider",
      q: "A roulette wheel has fitnesses 1, 1, 1 and 7. You add 3 to every fitness. Roughly what percentage chance does the best individual have now?",
      min: 0,
      max: 100,
      step: 5,
      start: 70,
      ans: 45,
      tol: 5,
      unit: "%",
      hint: "The new fitnesses are 4, 4, 4 and 10, so the total is 22. Is 10 out of 22 more or less than half?",
      why: "The best had 7/10 = 70% before. After adding 3 the fitnesses are 4, 4, 4 and 10, a total of 22, so it has 10/22, about 45%. Roulette depends on the actual fitness values, so shifting them all changes the odds even though the ranking is the same.",
    },
    {
      type: "order",
      q: "Three tours cost 5, 2 and 10, and shorter is better. Each tour's fitness is set to 1 ÷ cost before it goes on the roulette wheel. Order the tours from MOST likely to be picked to LEAST likely.",
      items: ["The tour costing 2", "The tour costing 5", "The tour costing 10"],
      hint: "1 ÷ cost gives 0.5, 0.2 and 0.1. Bigger fitness means a bigger slice.",
      why: "The fitnesses 0.5, 0.2 and 0.1 total 0.8, so the chances are about 62%, 25% and 12%. Turning a cost into 1 ÷ cost makes the cheapest tour the fittest, which fixes roulette's problem with minimisation.",
    },
    {
      type: "cat",
      q: "Sort each fitness list by whether it can go straight onto a roulette wheel, where a bigger fitness means a better individual.",
      buckets: ["Works as it is", "Needs a fix first"],
      items: [
        ["Profits of 4, 9, 2 and 7", 0],
        ["Costs of 4, 9, 2 and 7, where lower is better", 1],
        ["Scores of -3, 5 and 8", 1],
        ["Scores of 0.2, 0.9 and 0.5", 0],
        ["Distances in km, where shorter is better", 1],
        ["Win counts of 0, 3 and 6", 0],
      ],
      hint: "Roulette needs no negative values and a bigger number must mean a better individual.",
      why: "Slices cannot be negative, and a bigger slice must mean better. Costs and distances would favour the worst individuals, and the negative score would need shifting. A fitness of 0 is allowed: it just gets no slice.",
    },
    {
      type: "multi",
      q: "A roulette wheel holds four individuals with fitness 3, 3, 3 and 1. Select every statement that is true.",
      o: [
        "Each fitness-3 individual has a 30% chance per spin",
        "The fitness-1 individual has a 10% chance per spin",
        "The fitness-1 individual can never be picked",
        "In any 10 spins, exactly one pick must be the fitness-1 individual",
        "Over a very large number of spins, about 90% of picks go to the fitness-3 individuals",
      ],
      a: [0, 1, 4],
      hint: "The total is 10, so each fitness is also its percentage chance.",
      why: "The total fitness is 10, so each 3 gets 30% and the 1 gets 10%. Weak individuals still get picked sometimes, which is what keeps selection from being greedy. Spins are random, so 10 spins give about one pick, not exactly one.",
    },
    {
      type: "bug",
      q: "A roulette wheel has fitnesses 4, 9 and 12. This spin returns individual 0 every time. Click the faulty line.",
      code: [
        "def spin(fits):",
        "    r = random.random()",
        "    running = 0",
        "    for i, f in enumerate(fits):",
        "        running += f",
        "        if r <= running:",
        "            return i",
        "    return len(fits) - 1",
      ],
      a: 1,
      hint: "random.random() gives a value between 0 and 1. How big is the whole wheel?",
      why: "The pointer must land anywhere on the whole wheel, so r should be random.random() * sum(fits). A value below 1 always falls inside the first slice (size 4), so individual 0 wins every time.",
    },
    {
      type: "pick",
      q: "The bars show the fitness of four individuals. Click the individual whose chance of being picked by roulette is one quarter of C's chance.",
      fig: wheelBars,
      a: "b",
      hint: "C has 16. What is a quarter of 16?",
      why: "Roulette chances are proportional to fitness. A quarter of C's 16 is 4, which is individual B. D (2) has only an eighth of C's chance and A (8) has half.",
    },
  ]);

  /* ---------- 4.5 rank selection ---------- */
  B.add("l4-rank", [
    {
      type: "slider",
      q: "A population of 3 uses rank selection with the weight rank squared (b = 2). Roughly what percentage chance does the best individual have?",
      min: 0,
      max: 100,
      step: 5,
      start: 50,
      ans: 64,
      tol: 6,
      unit: "%",
      hint: "The weights are 1, 4 and 9, which total 14. 9 out of 14 is a little under two thirds.",
      why: "The ranks 1, 2 and 3 become the weights 1, 4 and 9, which total 14. The best gets 9/14, about 64%. With plain linear rank (b = 1) it would only get 3/6 = 50%, so the larger exponent raises the pressure.",
    },
    {
      type: "order",
      q: "Put the steps of linear rank selection in order.",
      items: [
        "Sort the individuals by fitness",
        "Give the worst rank 1 and the best rank P",
        "Add up all the ranks to get the total",
        "Divide each rank by the total to get its chance",
        "Pick a parent using those chances",
      ],
      hint: "You need the ranks before you can add them up.",
      why: "Ranking comes from the sorted order. The total of the ranks is P(P+1)/2, and each chance is its rank over that total. Only then can a parent be sampled.",
    },
    {
      type: "cat",
      q: "Rank selection gives each individual a weight of rank to the power b, with b = 1 to start. Sort each event by whether it changes the selection probabilities.",
      buckets: ["Changes the probabilities", "No effect"],
      items: [
        ["Multiply every fitness by 1000", 1],
        ["Two neighbours in the ranking swap places", 0],
        ["Raise the exponent b from 1 to 2", 0],
        ["Raise the best individual's fitness from 50 to 5000", 1],
        ["Add 7 to every fitness", 1],
        ["The population grows from 5 to 6 members", 0],
      ],
      hint: "Rank selection only looks at the order and the population size.",
      why: "Scaling, shifting, or making the best even better leaves the order alone, so nothing changes. Swapping places changes who holds which rank. A new exponent changes the weights, and a bigger population changes the total they are divided by.",
    },
    {
      type: "multi",
      q: "Rank selection gives each individual a weight of rank to the power b. Select every statement that is true.",
      o: [
        "With b = 0 every individual is equally likely to be picked",
        "With b = 1 the worst of 5 individuals has a 1 in 15 chance",
        "Using b = 2 gives the best individual a bigger share than b = 1",
        "The size of the gaps between fitness values changes the chances",
        "With b = 1 the worst individual can never be picked",
      ],
      a: [0, 1, 2],
      hint: "For 5 individuals and b = 1 the weights are 1, 2, 3, 4 and 5.",
      why: "With b = 0 every weight is 1. With b = 1 the weights total 15 and the worst has weight 1. A larger b stretches the weights, so the best gains. Only the order matters, not the gaps, and even the worst keeps a small chance.",
    },
    {
      type: "bug",
      q: "This should turn fitnesses into linear rank probabilities, but the probabilities end up attached to the wrong individuals. Click the faulty line.",
      code: [
        "def rank_probs(fits):",
        "    order = sorted(range(len(fits)), key=lambda i: fits[i])",
        "    ranks = [0] * len(fits)",
        "    for r, i in enumerate(order, start=1):",
        "        ranks[r] = i",
        "    total = sum(ranks)",
        "    return [r / total for r in ranks]",
      ],
      a: 4,
      hint: "Which should be the position in the list: the individual or its rank?",
      why: "The list ranks is indexed by individual, so it should be ranks[i] = r. Writing ranks[r] = i stores the individual where the rank belongs, which scrambles the probabilities and can even run past the end of the list.",
    },
    {
      type: "pick",
      q: "Each line shows the chance of being picked at ranks 1 (worst) to 5 (best) for one setting of rank selection: weights of rank to the power 0.5, 1 or 2. Click the line for b = 2.",
      fig: rankCurves,
      a: "c",
      hint: "A larger b gives the lowest ranks even less and the top rank even more.",
      why: "With b = 2 the weights are 1, 4, 9, 16 and 25 out of 55, so rank 1 gets about 2% and rank 5 about 45%. That is the steepest line. Linear (b = 1) is the middle line, and b = 0.5 is the flattest.",
    },
  ]);
})();

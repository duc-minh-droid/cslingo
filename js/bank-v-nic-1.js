/* NIC revision bank, visual and varied questions, part 1.
   Modules: l1-what, l1-monkey, l1-ingredients, l1-apps, l2-generic, l2-optim, l2-complexity, l2-mst.
   Every figure carries the information the question needs. */
(function () {
  const B = NIC.bank;
  const FONT = "font:800 13px var(--sans)";
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;max-height:${h}px">${body}</svg>`;
  const tx = (x, y, s, { c = "var(--text)", a = "middle", z = 13, w = 800 } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${w} ${z}px var(--sans);fill:${c}">${s}</text>`;
  const rect = (x, y, w, h, { f = "var(--panel)", s = "var(--line-2)", r = 8, sw = 2 } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
  const qf = (fn) => (box) => { box.innerHTML = fn(NIC.qfig); };

  /* ---------- l1-what ---------- */
  B.add("l1-what", [
    {
      type: "pick",
      q: "Ants leave the nest for food, then carry it home laying a scent trail. The colony ends up using one of the three routes below. Tap it.",
      fig: svg(460, 240, `
        <path d="M50 120 Q230 -20 410 120" fill="none" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>
        <path d="M50 120 Q230 230 410 120" fill="none" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="120" x2="410" y2="120" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>
        ${rect(216, 98, 28, 44, { f: "var(--bg-2)", s: "var(--text-dim)", r: 6 })}
        ${tx(230, 125, "rock", { z: 11, c: "var(--text-dim)" })}
        ${rect(20, 100, 60, 40, { s: "var(--amber)" })}${tx(50, 125, "Nest")}
        ${rect(380, 100, 60, 40, { s: "var(--teal)" })}${tx(410, 125, "Food")}
        ${tx(230, 36, "one-way trip: 14 s", { c: "var(--text-dim)" })}
        ${tx(140, 108, "one-way trip: 6 s", { c: "var(--text-dim)", z: 12 })}
        ${tx(310, 108, "(blocked)", { c: "var(--rose-ink)", z: 12 })}
        ${tx(230, 214, "one-way trip: 9 s", { c: "var(--text-dim)" })}
        <g data-pick="top"><path d="M50 120 Q230 -20 410 120" fill="none" stroke="transparent" stroke-width="30"/></g>
        <g data-pick="mid"><line x1="50" y1="120" x2="410" y2="120" stroke="transparent" stroke-width="30"/></g>
        <g data-pick="bot"><path d="M50 120 Q230 230 410 120" fill="none" stroke="transparent" stroke-width="30"/></g>`),
      a: "bot",
      why: "Nobody tells the ants which route to use. The rock blocks the 6 s route, so only two routes are open. Ants on the 9 s route get home and lay trail more often than ants on the 14 s route, so its scent grows faster, more ants follow it, and the feedback locks it in.",
    },
    {
      type: "order",
      q: "How does a colony of simple ants end up on a short route with no leader? Put the feedback loop in order.",
      items: [
        "Ants set out along both routes at random",
        "Ants on the short route get home sooner, so lay trail there more often",
        "A stronger scent makes the next ants more likely to pick that route",
        "More ants use it, which strengthens the scent further",
        "The colony settles on the short route, though no single ant planned it",
      ],
      why: "Random exploration first, then a small advantage (shorter trips mean more trail per minute), then feedback that amplifies the advantage. The group-level answer emerges from simple local rules.",
    },
    {
      type: "cat",
      q: "Each system below inspired a different family of methods. Which natural idea is being copied in each description?",
      buckets: ["Evolution", "Brains", "Swarms"],
      items: [
        ["A population of timetables where the better ones are recombined and tweaked", 0],
        ["Layers of simple units whose connection strengths adjust from examples", 1],
        ["Dozens of drones keeping their spacing from neighbours, with no central controller", 2],
        ["Random changes to a design, keeping versions that score better than their parents", 0],
        ["A program that learns to recognise handwritten digits by adjusting weights", 1],
        ["Many simple agents leaving trails that other agents then follow", 2],
      ],
      why: "Evolution means variation plus selection over generations. Brains mean learning by adjusting connections. Swarms mean many simple agents whose local interactions produce a group result.",
    },
    {
      type: "multi",
      q: "A team is deciding where a nature-inspired method is a sensible choice. Select every job where it fits.",
      o: [
        "Tuning 20 settings of a simulator that can be run and scored, but not differentiated",
        "Sorting a million names alphabetically, where fast exact methods are well known",
        "Finding a good exam timetable, where any timetable can be scored by counting clashes",
        "Finding the largest value in a list, which a single pass over the data solves exactly",
        "Evolving a walking style for a simulated robot when nobody knows the best style",
      ],
      a: [0, 2, 4],
      why: "Nature-inspired methods earn their keep when a good answer is hard to build directly but easy to score. Sorting and finding a maximum already have fast exact methods, so there is nothing to gain by searching.",
    },
    {
      type: "mcq",
      q: "A courier firm must send its drivers out 20 minutes after the orders close, using the best plan available by then. The chart shows how each method's plan improves while it runs. Which is the sound choice?",
      fig: svg(460, 230, `
        <line x1="50" y1="190" x2="440" y2="190" stroke="var(--line-2)" stroke-width="2"/>
        <line x1="50" y1="20" x2="50" y2="190" stroke="var(--line-2)" stroke-width="2"/>
        ${tx(245, 220, "minutes of running time", { c: "var(--text-dim)", z: 12 })}
        ${tx(24, 105, "plan", { c: "var(--text-dim)", z: 12 })}${tx(24, 120, "quality", { c: "var(--text-dim)", z: 12 })}
        ${tx(50, 207, "0", { z: 11, c: "var(--text-faint)" })}${tx(245, 207, "30", { z: 11, c: "var(--text-faint)" })}${tx(440, 207, "60", { z: 11, c: "var(--text-faint)" })}
        <line x1="${50 + 390 / 3}" y1="20" x2="${50 + 390 / 3}" y2="190" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5"/>
        ${tx(50 + 390 / 3, 14, "deadline: 20 min", { c: "var(--amber-ink)", z: 12 })}
        <polyline fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" points="50,190 63,92 83,54 128,40 180,35 440,32"/>
        <polyline fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round" points="50,190 310,190 310,24 440,24"/>
        ${tx(100, 80, "nature-inspired", { c: "var(--teal-ink)", a: "start", z: 12 })}
        ${tx(318, 150, "exact method", { c: "var(--blue-ink)", a: "start", z: 12 })}`),
      o: [
        "Nature-inspired: a good plan exists by 20 minutes, though it is not proven best",
        "Exact: it is the only method that finishes with a provably best plan",
        "Either: both end up near the top of the chart if you let them run",
        "Neither: a plan is only worth using once its search has reached the top",
      ],
      a: 0,
      why: "At the 20 minute deadline the exact method has produced nothing yet (its answer arrives at about 40 minutes). The nature-inspired method already has a plan close to the best. The right choice depends on the deadline, not just on which method ends higher.",
    },
    {
      type: "match",
      q: "Each feature of nature-inspired methods helps in a particular way. Match the feature to its benefit.",
      pairs: [
        ["Many cheap agents with no leader", "Losing one agent barely matters"],
        ["Random variation of candidates", "Can reach answers no designer imagined"],
        ["Selection by success", "Needs only a score, not a recipe for the answer"],
        ["Learning by adjusting connections", "Can improve from examples without being reprogrammed"],
      ],
      why: "These are the reasons the lecture gives for copying nature: robustness, creativity, generality and learning from experience.",
    },
  ]);

  /* ---------- l1-monkey ---------- */
  const strip = (x, y, vals, id) => {
    const cells = vals.map((v, i) => {
      const h = v * 9;
      return `<rect x="${x + i * 34}" y="${y + 66 - h}" width="26" height="${h}" rx="4" fill="var(--blue)"/>${tx(x + i * 34 + 13, y + 80, v, { z: 11, c: "var(--text-dim)" })}`;
    }).join("");
    return `<g data-pick="${id}">${rect(x - 12, y - 24, 8 * 34 + 8, 120, { f: "var(--panel)" })}${tx(x + 125, y - 6, `Run ${id}: letters matching, step by step`, { z: 12, c: "var(--text-dim)" })}${cells}</g>`;
  };
  B.add("l1-monkey", [
    {
      type: "pick",
      q: "Three runs of a letter-matching search each record how many letters match the target at every step. Exactly one run could NOT have come from keep-if-better (keep a change only if it isn't worse). Tap it.",
      fig: svg(320, 440, `${strip(24, 36, [1, 2, 2, 3, 3, 3, 4, 5], "A")}${strip(24, 176, [1, 2, 3, 3, 2, 4, 4, 5], "B")}${strip(24, 316, [0, 1, 1, 2, 3, 4, 4, 4], "C")}`),
      a: "B",
      why: "Under keep-if-better a change is rejected whenever the score would fall, so the match count can stay level or rise but never drop. Run B falls from 3 to 2 at step 5. Flat stretches in A and C are fine: those steps were rejected or tied.",
    },
    {
      type: "bug",
      q: "This keep-if-better loop is meant to evolve a sentence, but its match count gets worse over time. Click the faulty line.",
      code: [
        'target = "METHINKS IT IS LIKE A WEASEL"',
        "best = random_string(len(target))",
        "while matches(best, target) < len(target):",
        "    child = change_one_random_letter(best)",
        "    if matches(child, target) < matches(best, target):",
        "        best = child",
      ],
      a: 4,
      why: "The test is backwards. It keeps the child when it matches fewer letters. It should keep the child when it is not worse: matches(child) >= matches(best).",
    },
    {
      type: "cat",
      q: "Keep-if-better changes one thing and keeps the result if it isn't worse. For each situation, does it cope or get stuck?",
      buckets: ["It copes", "It gets stuck"],
      items: [
        ["Each letter adds to the score independently of the others", 0],
        ["The score only rises if two particular letters change together", 1],
        ["The landscape has one smooth hill", 0],
        ["The landscape has several hills and the start is on a small one", 1],
        ["A small change to the string gives a small change in score", 0],
        ["Every single change makes the score drop, even though a far better answer exists", 1],
      ],
      why: "Keep-if-better climbs. It works when small improvements add up, as with independent letters or one hill. It stalls on a local peak, or when progress needs several changes at once, because every single step looks worse.",
    },
    {
      type: "mcq",
      q: "Target: CAT. Each row shows the current string and one child made by changing a single letter. Under keep-if-better (keep unless worse), how many of these four children are kept?",
      fig: `<table style="border-collapse:collapse;font:800 14px var(--sans);margin:4px auto"><thead><tr style="color:var(--text-dim)"><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Row</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Current</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Child</th></tr></thead><tbody>
        <tr><td style="padding:6px 14px;text-align:center">1</td><td style="padding:6px 14px;text-align:center">DOG</td><td style="padding:6px 14px;text-align:center">DAG</td></tr>
        <tr><td style="padding:6px 14px;text-align:center">2</td><td style="padding:6px 14px;text-align:center">DAG</td><td style="padding:6px 14px;text-align:center">DAB</td></tr>
        <tr><td style="padding:6px 14px;text-align:center">3</td><td style="padding:6px 14px;text-align:center">DAB</td><td style="padding:6px 14px;text-align:center">DOB</td></tr>
        <tr><td style="padding:6px 14px;text-align:center">4</td><td style="padding:6px 14px;text-align:center">DAB</td><td style="padding:6px 14px;text-align:center">CAB</td></tr></tbody></table>`,
      o: ["1", "2", "3", "4"],
      a: 2,
      hint: "Count the letters in the right place for the current string and for the child, then compare. Equal counts are kept.",
      why: "Against CAT: row 1 goes 0 to 1 (kept). Row 2 goes 1 to 1, a tie, which is not worse (kept). Row 3 goes 1 to 0 (rejected). Row 4 goes 1 to 2 (kept). So three are kept.",
    },
    {
      type: "slider",
      q: "Typical runs of keep-if-better (27 keys, one random letter changed per step) took about 760 steps for a 10-letter target, 1,900 for 20 letters and 4,700 for 40 letters. Estimate the typical steps for an 80-letter target.",
      fig: svg(420, 190, `
        <line x1="60" y1="150" x2="400" y2="150" stroke="var(--line-2)" stroke-width="2"/>
        ${[[10, 760], [20, 1900], [40, 4700]].map(([n, s], i) => `<rect x="${90 + i * 100}" y="${150 - s / 4700 * 120}" width="60" height="${s / 4700 * 120}" rx="6" fill="var(--blue)"/>${tx(120 + i * 100, 168, `${n} letters`, { z: 12 })}${tx(120 + i * 100, 144 - s / 4700 * 120, s.toLocaleString("en-GB"), { z: 12, c: "var(--blue-ink)" })}`).join("")}
        ${tx(360, 90, "80 letters?", { c: "var(--text-dim)", z: 13 })}`),
      min: 0, max: 30000, step: 500, ans: 10500, tol: 3500, unit: "steps",
      hint: "Look at what happens each time the target doubles: a bit more than double the steps.",
      why: "Each extra letter adds a little work, so the cost grows a bit faster than the length, about 10,000 steps for 80 letters. Random typing would multiply its tries by 27 for every extra letter, which is why keep-if-better wins.",
    },
  ]);

  /* ---------- l1-ingredients ---------- */
  const bitRow = (x, y, s, fill) => [...s].map((ch, i) => `${rect(x + i * 30, y, 28, 28, { f: fill, r: 6 })}${tx(x + i * 30 + 14, y + 19, ch, { z: 14 })}`).join("");
  B.add("l1-ingredients", [
    {
      type: "pick",
      q: "A single hiker (one candidate) makes small random steps and keeps a step only if it goes uphill. Starting at the red dot, which spot will the hiker end up on?",
      fig: qf((Q) => Q.curve((x) => 0.05 + 0.55 * Math.exp(-(((x - 0.25) / 0.09) ** 2)) + 1.0 * Math.exp(-(((x - 0.75) / 0.1) ** 2)), [[0.05, "D"], [0.25, "A"], [0.5, "B"], [0.75, "C"]], { sx: 0.17, label: "possible solutions" })),
      a: "A",
      why: "Small uphill steps carry the hiker to the top of the nearest hill (A), not the highest one (C). This is why EAs keep a whole population spread across the landscape: some members start near C.",
    },
    {
      type: "cat",
      q: "Each symptom below comes from an EA whose selection is badly tuned. Is the selection too strong or too weak?",
      buckets: ["Too strong", "Too weak"],
      items: [
        ["Within five generations every candidate is a copy of one parent", 0],
        ["After 200 generations the average score is no better than at the start", 1],
        ["The best score jumps early, then never moves again", 0],
        ["Parents are picked almost uniformly, whatever their score", 1],
        ["The least fit candidates are never given any chance to breed", 0],
        ["Good solutions appear but are lost again about as often as they are found", 1],
      ],
      why: "Too-strong selection kills variety quickly, so the search converges early and gets stuck. Too-weak selection is nearly random, so fit solutions are not kept and nothing accumulates. The lecture asks for a weak bias in between.",
    },
    {
      type: "pick",
      q: "Two parents are combined by 1-point crossover (cut once, take the left part from one parent and the right part from the other). One child below could NOT have been produced this way. Tap it.",
      fig: svg(460, 330, `
        ${tx(24, 28, "Parent 1", { a: "start", c: "var(--blue-ink)" })}${bitRow(110, 8, "11110000", "var(--blue-dim, var(--bg-2))")}
        ${tx(24, 68, "Parent 2", { a: "start", c: "var(--amber-ink)" })}${bitRow(110, 48, "00001111", "var(--amber-dim, var(--bg-2))")}
        ${["11001111", "00110000", "11111111", "00111100"].map((s, i) => `<g data-pick="${"c" + (i + 1)}">${rect(14, 100 + i * 56, 360, 48, { f: "var(--panel)" })}${tx(34, 130 + i * 56, "Child " + (i + 1), { a: "start" })}${bitRow(124, 110 + i * 56, s, "var(--bg-2)")}</g>`).join("")}`),
      a: "c4",
      why: "A 1-point child is a left part of one parent joined to the right part of the other, with every gene keeping its position. Child 4 (00111100) would need a left part of 0s from parent 2, then 1111 and then 00, which takes two cuts. Children 1, 2 and 3 come from cuts after 2, 2 and 4 genes.",
    },
    {
      type: "mcq",
      q: "Parents are drawn with a chance proportional to their fitness. The bars show five candidates' fitness. Compared with the weakest, how much more often is the best one picked?",
      fig: svg(420, 190, `
        <line x1="40" y1="150" x2="400" y2="150" stroke="var(--line-2)" stroke-width="2"/>
        ${[1000, 1010, 1020, 1030, 1040].map((v, i) => `<rect x="${60 + i * 66}" y="${150 - v / 1040 * 110}" width="46" height="${v / 1040 * 110}" rx="5" fill="var(--violet)"/>${tx(83 + i * 66, 143 - v / 1040 * 110, v.toLocaleString("en-GB"), { z: 11, c: "var(--violet-ink)" })}${tx(83 + i * 66, 168, "P" + (i + 1), { z: 12 })}`).join("")}`),
      o: ["About 1.04 times as often", "About 2 times as often", "About 5 times as often", "About 40 times as often"],
      a: 0,
      hint: "Chance is proportional to fitness, so compare 1,040 with 1,000.",
      why: "The ratio of the chances equals the ratio of the fitness values: 1,040 to 1,000, about 1.04. When scores are all close, fitness-proportional selection is almost random, which is a very weak bias. The lecture wants weak, not absent.",
    },
    {
      type: "multi",
      q: "An EA's population has become too uniform. Which changes would help keep variety? Select all that apply.",
      o: [
        "Use a larger population",
        "Give the weakest candidates a better chance of being picked as parents",
        "Mutate each child slightly more",
        "Always breed only from the current top two",
        "Overwrite the whole population with copies of the best candidate",
      ],
      a: [0, 1, 2],
      why: "Variety comes from many different candidates (population size), from a weak selection bias, and from mutation. Breeding only from the top two, or cloning the best, throws variety away.",
    },
    {
      type: "bug",
      q: "An EA is meant to keep a population of 50 but always stalls on the first hill it finds. Click the line that removes the 'population' ingredient.",
      code: [
        "population = random_candidates(50)",
        "for generation in range(100):",
        "    scores = [fitness(c) for c in population]",
        "    parents = pick_weighted(population, scores)",
        "    children = [mutate(p) for p in parents]",
        "    population = [max(children, key=fitness)]",
      ],
      a: 5,
      why: "The last line shrinks the population to one candidate each generation, so the search becomes a single hiker making small steps. Replace it with population = children so that many candidates stay alive.",
    },
  ]);

  /* ---------- l1-apps ---------- */
  const chip = (x, y, s, c) => `${rect(x, y, 44, 26, { f: "var(--bg-2)", s: c, r: 7 })}${tx(x + 22, y + 18, s, { z: 12 })}`;
  const tt = (id, x, y, s1, s2) => `<g data-pick="${id}">${rect(x, y, 200, 92, { f: "var(--panel)" })}${tx(x + 12, y + 20, "Timetable " + id, { a: "start", z: 12, c: "var(--text-dim)" })}
      ${tx(x + 12, y + 46, "Slot 1", { a: "start", z: 11, c: "var(--text-faint)" })}${s1.map((e, i) => chip(x + 62 + i * 50, y + 30, e, "var(--blue)")).join("")}
      ${tx(x + 12, y + 78, "Slot 2", { a: "start", z: 11, c: "var(--text-faint)" })}${s2.map((e, i) => chip(x + 62 + i * 50, y + 62, e, "var(--amber)")).join("")}</g>`;
  B.add("l1-apps", [
    {
      type: "cat",
      q: "An EA only improves what the fitness function rewards. Which of these fitness definitions steer the search towards what we really want, and which can be gamed?",
      buckets: ["Steers the search well", "Can be gamed or misses the goal"],
      items: [
        ["Robot walking: distance covered in 30 s of simulation", 0],
        ["Robot walking: how fast its legs move", 1],
        ["Antenna: how closely the simulated signal meets the required spec", 0],
        ["Antenna: number of wire segments used", 1],
        ["Timetable: total number of student clashes (to minimise)", 0],
        ["Timetable: number of exams that have been given a slot", 1],
      ],
      why: "A good fitness function measures the real goal. Fast legs can spin uselessly in the air, wire count says nothing about signal quality, and placing every exam in one slot scores perfectly on 'exams placed' while creating huge clashes.",
    },
    {
      type: "match",
      q: "To use an EA you first decide how a candidate is written down (its chromosome). Match each problem to a sensible encoding.",
      pairs: [
        ["Exam timetable", "One slot number for each exam"],
        ["Car body, as in the lecture", "A series of slice shapes along the car"],
        ["Robot walking controller", "A list of numbers that set how the legs move"],
        ["Delivery round", "The order in which the stops are visited"],
      ],
      why: "Whatever the problem, the chromosome must be something an EA can copy, mutate and recombine, and from which the fitness function can build and score a whole candidate.",
    },
    {
      type: "pick",
      q: "Four exams share some students: Maths and Physics 20, Maths and History 3, Physics and Art 5, Art and History 12 (all other pairs share none). Fitness is the number of students with a clash (two of their exams in one slot), and lower is better. Tap the fittest timetable.",
      fig: svg(440, 220, `${tt("W", 10, 10, ["M"], ["P", "A", "H"])}${tt("X", 230, 10, ["M", "P"], ["A", "H"])}${tt("Y", 10, 116, ["M", "A"], ["P", "H"])}${tt("Z", 230, 116, ["M", "H"], ["P", "A"])}`),
      a: "Y",
      why: "Add up the shared students for each pair that sits in the same slot. W: 5 + 0 + 12 = 17. X: 20 + 12 = 32. Z: 3 + 5 = 8. Y: Maths and Art share none, Physics and History share none, so 0 clashes.",
    },
    {
      type: "bug",
      q: "The EA keeps candidates with the HIGHEST fitness, yet its timetables keep getting worse. Click the faulty line.",
      code: [
        "def fitness(timetable):",
        "    clashes = 0",
        "    for a, b in exam_pairs:",
        "        if slot[a] == slot[b]:",
        "            clashes += shared_students[a][b]",
        "    return clashes",
      ],
      a: 5,
      why: "The function returns the number of clashes, so more clashes means higher fitness. For a maximising EA it should return the negative, -clashes, or the EA must be told to minimise.",
    },
    {
      type: "order",
      q: "An engineer wants to evolve a new design with an EA. Put the set-up work in a sensible order.",
      items: [
        "Decide how a design is written down as a chromosome",
        "Write a fitness function that scores any design, for example by simulation",
        "Generate a random starting population and score it",
        "Run the select, vary and update loop for many generations",
        "Check the best design in a more detailed test before building it",
      ],
      why: "The encoding comes first because the fitness function has to read it. The EA loop needs both, and an evolved design should be checked outside the simulator before anyone relies on it.",
    },
  ]);

  /* ---------- l2-generic ---------- */
  const box = (id, x, y, name, v, c) => `<g data-pick="${id}">${rect(x, y, 70, 56, { f: "var(--panel)", s: c })}${tx(x + 35, y + 22, name, { z: 13 })}${tx(x + 35, y + 44, "score " + v, { z: 12, c: "var(--text-dim)" })}</g>`;
  const runPanel = (x, title, best, avg, id) => {
    const X = (g) => x + 10 + g * 6.6, Y = (v) => 150 - v * 1.1;
    const pts = (f) => Array.from({ length: 20 }, (_, g) => `${X(g).toFixed(1)},${Y(f(g)).toFixed(1)}`).join(" ");
    return `<g data-pick="${id}">${rect(x, 10, 150, 175, { f: "var(--panel)" })}${tx(x + 75, 28, title, { z: 12, c: "var(--text-dim)" })}
      <line x1="${x + 10}" y1="${Y(100)}" x2="${x + 140}" y2="${Y(100)}" stroke="var(--text-faint)" stroke-dasharray="4 4"/>${tx(x + 140, Y(100) - 4, "optimum", { a: "end", z: 10, c: "var(--text-faint)" })}
      <polyline fill="none" stroke="var(--teal)" stroke-width="3" points="${pts(best)}"/><polyline fill="none" stroke="var(--blue)" stroke-width="3" stroke-dasharray="1 0" points="${pts(avg)}"/></g>`;
  };
  const r1b = (g) => 20 + 60 * (1 - Math.exp(-g / 2.5)), r1a = (g) => 20 + (r1b(g) - 20) * (1 - Math.exp(-g / 6));
  const r2b = (g) => 30 + 40 * (g / 19) + 3 * Math.sin(g * 2), r2a = (g) => 30 + 3 * Math.sin(g);
  const r3b = (g) => 20 + 79 * (1 - Math.exp(-g / 8)), r3a = (g) => 20 + 55 * (1 - Math.exp(-g / 8));
  const bars = (vals, names) => vals.map((v, i) => `<g data-pick="${names[i]}"><rect x="${20 + i * 52}" y="${120 - v * 11}" width="38" height="${v * 11}" rx="5" fill="var(--violet)"/>${tx(39 + i * 52, 114 - v * 11, v, { z: 12, c: "var(--violet-ink)" })}${tx(39 + i * 52, 142, names[i], { z: 14 })}<rect x="${20 + i * 52}" y="0" width="38" height="150" fill="transparent"/></g>`).join("");
  B.add("l2-generic", [
    {
      type: "pick",
      q: "The population holds 4 individuals. Children have just been made and scored. With update rule 2 (merge old and new, keep the best 4), tap everyone who is in the next population.",
      fig: svg(440, 170, `${tx(12, 24, "Parents", { a: "start", z: 12, c: "var(--text-dim)" })}${box("P1", 12, 34, "P1", 7, "var(--blue)")}${box("P2", 98, 34, "P2", 5, "var(--blue)")}${box("P3", 184, 34, "P3", 4, "var(--blue)")}${box("P4", 270, 34, "P4", 2, "var(--blue)")}
        ${tx(12, 112, "Children", { a: "start", z: 12, c: "var(--text-dim)" })}${box("C1", 12, 118, "C1", 6, "var(--amber)")}${box("C2", 98, 118, "C2", 3, "var(--amber)")}${box("C3", 184, 118, "C3", 3, "var(--amber)")}${box("C4", 270, 118, "C4", 1, "var(--amber)")}`),
      a: ["C1", "P1", "P2", "P3"],
      why: "Merging gives eight individuals with scores 7, 6, 5, 4, 3, 3, 2, 1. The best four are P1 (7), C1 (6), P2 (5) and P3 (4). Under rule 1 (replace everyone) the next population would be only C1 to C4, and the 7 would be lost. With rule 2 the best so far can never disappear.",
    },
    {
      type: "bug",
      q: "A maximising EA runs but its children never improve the population. Click the faulty line.",
      code: [
        "P = random_population(100)",
        "evaluate(P)",
        "while time_left > 0:",
        "    parents = select(P)",
        "    children = vary(parents)",
        "    evaluate(parents)",
        "    P = merge_and_keep_best(P, children, 100)",
      ],
      a: 5,
      why: "The line scores the parents a second time, so the new children have no fitness when the merge needs it. The evaluation step must score the children: evaluate(children).",
    },
    {
      type: "pick",
      q: "Three runs plot best (green) and average (blue) fitness over 20 generations, and the dashed line is the optimum. In one run the population has collapsed to near-identical individuals while still well below the optimum. Tap it.",
      fig: svg(480, 195, `${runPanel(4, "Run 1", r1b, r1a, "R1")}${runPanel(164, "Run 2", r2b, r2a, "R2")}${runPanel(324, "Run 3", r3b, r3a, "R3")}`),
      a: "R1",
      why: "When best and average meet, every individual is about as good as the best, meaning they are nearly copies. In Run 1 that happens at about 80, short of the optimum. Run 2 has a wide gap but little progress (selection too weak). Run 3 keeps a healthy gap while the best climbs.",
    },
    {
      type: "pick",
      q: "Tournament selection draws two individuals at random and the fitter one becomes a parent. Three draws were made: D vs F, B vs H and A vs C. Tap the three parents.",
      fig: svg(430, 190, `${bars([4, 8, 6, 2, 9, 5, 3, 7], ["A", "B", "C", "D", "E", "F", "G", "H"])}${tx(215, 175, "Draw 1: D vs F     Draw 2: B vs H     Draw 3: A vs C", { z: 13, c: "var(--text-dim)" })}`),
      a: ["B", "C", "F"],
      why: "Each draw is won by the higher bar. F (5) beats D (2), B (8) beats H (7) and C (6) beats A (4). E has the best score of all but was not drawn, which is how tournaments keep a weak bias rather than always choosing the very best.",
    },
    {
      type: "cat",
      q: "You move an EA from exam timetabling to antenna design. Which parts must you rewrite, and which stay the same?",
      buckets: ["Changes with the problem", "Same for every problem"],
      items: [
        ["How a candidate is written down (the encoding)", 0],
        ["The fitness function", 0],
        ["The select, vary, update loop", 1],
        ["Mutation that swaps two exams between slots", 0],
        ["Stopping when the time budget runs out", 1],
        ["The rule 'merge old and new, keep the best', for population update", 1],
      ],
      why: "The loop and update rules are generic. Anything that depends on what a candidate looks like or what makes it good (encoding, fitness, and operators that suit the encoding) is problem-specific.",
    },
  ]);

  /* ---------- l2-optim ---------- */
  const sub = ["000", "001", "010", "011", "100", "101", "110", "111"];
  const subW = [0, 72, 50, 122, 40, 112, 90, 162];
  B.add("l2-optim", [
    {
      type: "pick",
      q: "Three items weigh 40, 50 and 72 kg (bits show which are taken, in that order). The bars show each subset's total weight. Fitness is |weight - 100|, minimised. Tap the best subset.",
      fig: svg(480, 230, `
        <line x1="20" y1="190" x2="470" y2="190" stroke="var(--line-2)" stroke-width="2"/>
        <line x1="20" y1="${190 - 100 * 0.9}" x2="470" y2="${190 - 100 * 0.9}" stroke="var(--rose)" stroke-width="2" stroke-dasharray="6 5"/>${tx(470, 190 - 92, "target 100 kg", { a: "end", z: 12, c: "var(--rose-ink)" })}
        ${sub.map((s, i) => `<g data-pick="${s}"><rect x="${30 + i * 55}" y="${190 - subW[i] * 0.9}" width="42" height="${subW[i] * 0.9}" rx="5" fill="var(--blue)"/>${tx(51 + i * 55, 183 - subW[i] * 0.9, subW[i], { z: 12, c: "var(--blue-ink)" })}${tx(51 + i * 55, 212, s, { z: 13 })}<rect x="${30 + i * 55}" y="30" width="42" height="170" fill="transparent"/></g>`).join("")}`),
      a: "110",
      why: "Closest to 100 on either side wins. 110 weighs 90 (f = 10), 101 weighs 112 (f = 12) and 111 weighs 162 (f = 62). Overshooting is penalised just like undershooting, so a total slightly over 100 is not automatically better.",
    },
    {
      type: "slider",
      q: "Exhaustive search must try every on/off combination of 20 items, and scoring one combination takes 1 millisecond. Roughly how long does the whole search take?",
      min: 0, max: 60, step: 1, ans: 17, tol: 7, unit: "minutes",
      hint: "2^10 is about 1,000, so 2^20 is about 1,000 x 1,000 = a million. A million milliseconds is 1,000 seconds.",
      why: "20 items give 2^20, about a million combinations. A million milliseconds is 1,000 seconds, a bit under 17 minutes. Adding just 10 more items would multiply that by 1,000.",
    },
    {
      type: "order",
      q: "A rucksack holds at most 10 kg. A candidate's fitness is its total value if it fits, and 0 if it is too heavy. Order the candidates from best fitness to worst.",
      fig: `<table style="border-collapse:collapse;font:800 14px var(--sans);margin:4px auto"><thead><tr style="color:var(--text-dim)"><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Candidate</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Weight (kg)</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Value</th></tr></thead><tbody>
        ${[["A", 8, 12], ["B", 11, 20], ["C", 10, 14], ["D", 6, 9], ["E", 9, 13]].map(([n, w, v]) => `<tr><td style="padding:6px 14px;text-align:center">${n}</td><td style="padding:6px 14px;text-align:center">${w}</td><td style="padding:6px 14px;text-align:center">${v}</td></tr>`).join("")}</tbody></table>`,
      items: ["Candidate C", "Candidate E", "Candidate A", "Candidate D", "Candidate B"],
      why: "B is worth the most but weighs 11 kg, so its fitness is 0. C weighs exactly 10 kg, which fits, so it scores 14. Then E 13, A 12, D 9. A fitness function can build a rule such as 'too heavy scores 0' straight into the score.",
    },
    {
      type: "bug",
      q: "The goal is a subset weighing as close to 100 kg as possible, and the EA minimises fitness. It keeps returning a subset that weighs only 5 kg. Click the faulty line.",
      code: [
        "def fitness(bits):",
        "    total = sum(w for w, b in zip(weights, bits) if b)",
        "    return total - 100",
      ],
      a: 2,
      why: "Without a modulus, a light subset gets a very negative number, which looks great to a minimiser. The score needs to measure distance: abs(total - 100).",
    },
    {
      type: "cat",
      q: "Is exhaustive search (try every candidate) practical on a normal computer for these search spaces?",
      buckets: ["Practical", "Not practical"],
      items: [
        ["Six on/off switches", 0],
        ["A three-digit lock code", 0],
        ["Choosing a subset of 40 items", 1],
        ["Any real number x between 0 and 1", 1],
        ["Ordering 15 tasks in a queue", 1],
        ["Picking the best of 200 candidate routes", 0],
      ],
      why: "Six switches give 64 settings, a lock gives 1,000 and 200 routes is tiny. A subset of 40 items gives 2^40, about a trillion. Fifteen tasks give 15! orders, also about a trillion. The real numbers between 0 and 1 are infinitely many.",
    },
    {
      type: "mcq",
      q: "An exhaustive search checks 1,000 candidates in a random order. The chart shows the best fitness found so far (lower is better). It stopped improving at candidate 300. After checking 700, can you stop and be sure 8 is the optimum?",
      fig: svg(460, 220, `
        <line x1="50" y1="180" x2="440" y2="180" stroke="var(--line-2)" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="180" stroke="var(--line-2)" stroke-width="2"/>
        ${tx(245, 208, "candidates checked (out of 1,000)", { z: 12, c: "var(--text-dim)" })}${tx(26, 100, "best", { z: 12, c: "var(--text-dim)" })}${tx(26, 115, "so far", { z: 12, c: "var(--text-dim)" })}
        ${tx(50, 196, "0", { z: 11, c: "var(--text-faint)" })}${tx(440, 196, "1,000", { z: 11, c: "var(--text-faint)" })}
        <polyline fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" points="50,30 54,30 54,60 59,60 59,90 62,90 62,110 80,110 80,130 100,130 100,150 170,150 170,168 170,168 440,168"/>
        ${tx(60, 24, "90", { z: 11, a: "start", c: "var(--text-faint)" })}${tx(444, 160, "8", { z: 12, a: "start", c: "var(--teal-ink)" })}
        <line x1="${50 + 390 * 0.7}" y1="20" x2="${50 + 390 * 0.7}" y2="180" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5"/>${tx(50 + 390 * 0.7, 14, "now: 700", { z: 12, c: "var(--amber-ink)" })}`),
      o: [
        "No: the 300 unchecked candidates could still hold a score below 8",
        "Yes: 400 checks without change show that nothing better exists",
        "Yes: the best-so-far line can only fall, so it must be final",
        "No: only candidates checked after 700 are allowed to count",
      ],
      a: 0,
      why: "Exhaustive search is only guaranteed once every candidate has been checked. A long flat stretch is just evidence, not proof, because the best remaining candidate might be one of the unchecked ones. Stopping early turns it into a heuristic.",
    },
  ]);

  /* ---------- l2-complexity ---------- */
  const growth = (() => {
    const X = (n) => 60 + n * 18, Y = (v) => 190 - v / 160000 * 160;
    const line = (f, c) => `<polyline fill="none" stroke="${c}" stroke-width="3.5" stroke-linejoin="round" points="${Array.from({ length: 21 }, (_, n) => `${X(n)},${Y(f(n)).toFixed(1)}`).join(" ")}"/>`;
    const hit = () => `<polyline fill="none" stroke="transparent" stroke-width="22" data-hit="" points="${Array.from({ length: 21 }, (_, n) => `${X(n)},${Y(f(n)).toFixed(1)}`).join(" ")}"/>`;
    return svg(480, 250, `
      <line x1="60" y1="190" x2="430" y2="190" stroke="var(--line-2)" stroke-width="2"/><line x1="60" y1="20" x2="60" y2="190" stroke="var(--line-2)" stroke-width="2"/>
      ${[0, 5, 10, 15, 20].map((n) => tx(X(n), 208, n, { z: 11, c: "var(--text-faint)" })).join("")}${tx(245, 230, "n (size of the problem)", { z: 12, c: "var(--text-dim)" })}
      ${tx(44, 34, "160k", { z: 11, a: "end", c: "var(--text-faint)" })}${tx(44, 194, "0", { z: 11, a: "end", c: "var(--text-faint)" })}${tx(18, 110, "steps", { z: 12, c: "var(--text-dim)" })}
      <g data-pick="lin">${line((n) => 5000 * n, "var(--violet)")}${hit()}</g>
      <g data-pick="poly">${line((n) => n ** 4, "var(--blue)")}${hit()}</g>
      <g data-pick="exp">${line((n) => 1.3 ** n, "var(--rose)")}${hit()}</g>
      ${tx(436, 62, "n⁴", { a: "start", c: "var(--blue-ink)" })}${tx(436, 95, "5000n", { a: "start", c: "var(--violet-ink)" })}${tx(436, 186, "1.3ⁿ", { a: "start", c: "var(--rose-ink)" })}`);
  })();
  const ccol = (i, n, p, e, id) => `<g data-pick="${id}">${rect(14 + i * 90, 10, 82, 120, { f: "var(--panel)" })}${tx(55 + i * 90, 32, "n = " + n, { z: 13 })}${tx(55 + i * 90, 62, "n³", { z: 11, c: "var(--blue-ink)" })}${tx(55 + i * 90, 82, p, { z: 13, c: "var(--blue-ink)" })}${tx(55 + i * 90, 106, "1.5ⁿ", { z: 11, c: "var(--rose-ink)" })}${tx(55 + i * 90, 124, e, { z: 13, c: "var(--rose-ink)" })}</g>`;
  B.add("l2-complexity", [
    {
      type: "pick",
      q: "The chart plots the steps taken by three algorithms for n up to 20. If n kept growing without limit, which curve would end up highest of all? Tap it.",
      fig: growth,
      a: "exp",
      why: "On this chart 1.3^n looks flat, but exponentials always win in the end. 1.3^n overtakes n^4 at about n = 64, and n^4 left 5000n behind long before. Small n fools you, which is why we compare growth, not values at small sizes.",
    },
    {
      type: "match",
      q: "Each algorithm's input grows from n = 20 to n = 21. Match its running-time formula to what happens to its number of steps.",
      pairs: [
        ["n steps (linear)", "About 5% more steps"],
        ["n² steps", "About 10% more steps"],
        ["2ⁿ steps", "Twice as many steps"],
        ["n! steps", "21 times as many steps"],
      ],
      hint: "Linear: 21 against 20. Squared: 441 against 400. Exponential: one more factor of 2. Factorial: one more factor of 21.",
      why: "Polynomials grow by a small percentage when n goes up by one. For 2^n each extra unit doubles the work, and for n! it multiplies the work by the new n, which is how exponential growth runs away.",
    },
    {
      type: "mcq",
      q: "The table shows how long two algorithms took on the same computer. Which of them could still finish n = 100 within a minute?",
      fig: `<table style="border-collapse:collapse;font:800 14px var(--sans);margin:4px auto"><thead><tr style="color:var(--text-dim)"><th style="padding:6px 14px;border-bottom:2px solid var(--line)">n</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Algorithm A</th><th style="padding:6px 14px;border-bottom:2px solid var(--line)">Algorithm B</th></tr></thead><tbody>
        ${[[10, "0.02 s", "0.001 s"], [20, "0.08 s", "1 s"], [30, "0.18 s", "1,000 s"], [40, "0.32 s", "about 12 days"]].map(([n, a, b]) => `<tr><td style="padding:6px 14px;text-align:center">${n}</td><td style="padding:6px 14px;text-align:center">${a}</td><td style="padding:6px 14px;text-align:center">${b}</td></tr>`).join("")}</tbody></table>`,
      o: ["Only A", "Only B", "Both", "Neither"],
      a: 0,
      why: "A's time grows like n squared (doubling n multiplies time by 4), so n = 100 takes about 2 seconds. B is quicker at n = 10 but multiplies by 1,000 for every 10 more, so it is exponential and hopeless by n = 100.",
    },
    {
      type: "pick",
      q: "The table compares a polynomial (n cubed) with an exponential (1.5 to the n). Tap the first column where the exponential becomes the larger one.",
      fig: svg(470, 140, `${ccol(0, 5, "125", "7.6", "n5")}${ccol(1, 10, "1,000", "58", "n10")}${ccol(2, 20, "8,000", "3,325", "n20")}${ccol(3, 30, "27,000", "191,751", "n30")}${ccol(4, 40, "64,000", "11 million", "n40")}`),
      a: "n30",
      why: "At n = 20 the polynomial is still ahead (8,000 against 3,325), so a quick test at that size would favour the exponential method. By n = 30 it has overtaken (191,751 against 27,000), and it pulls further ahead at n = 40.",
    },
    {
      type: "bug",
      q: "This exhaustive search for the subset sum closest to a target takes exponential time. Click the line that causes it.",
      code: [
        "def closest_sum(items, target):",
        "    best = None",
        "    for mask in range(2 ** len(items)):",
        "        total = sum(items[i] for i in range(len(items)) if mask >> i & 1)",
        "        if best is None or abs(total - target) < abs(best - target):",
        "            best = total",
        "    return best",
      ],
      a: 2,
      why: "The loop runs once per subset, and there are 2^n subsets for n items. Each pass of the body is cheap (about n steps), so the number of passes is what makes the whole search exponential.",
    },
    {
      type: "cat",
      q: "The lecture calls a problem easy when a polynomial-time exact method is known, and hard when only exponential ones are known. Which is which? (The size of the search space is not the test.)",
      buckets: ["Easy", "Hard"],
      items: [
        ["Sorting a list of a million names (it has a million factorial possible orders)", 0],
        ["Cheapest cable network linking 50 towns, with no extra rules", 0],
        ["Cheapest cable network where no town may have more than 2 links", 1],
        ["Lowest-energy fold of a 500-amino-acid protein", 1],
        ["Finding the largest number in a list", 0],
        ["Shortest tour through 100 cities", 1],
      ],
      why: "Sorting has an astronomically large space of orders, but a fast method finds the answer without searching it. Plain MST and finding a maximum are also solved fast. Adding a degree limit, folding proteins and touring cities have no known fast exact method.",
    },
  ]);

  /* ---------- l2-mst ---------- */
  const NODES6 = { A: [60, 60], B: [200, 40], C: [340, 60], D: [60, 190], E: [200, 210], F: [340, 190] };
  const NODES5 = { A: [50, 130], B: [180, 50], C: [180, 210], D: [330, 130], E: [420, 60] };
  const HEX = { A: [230, 30], B: [312, 78], C: [312, 178], D: [230, 226], E: [148, 178], F: [148, 78] };
  B.add("l2-mst", [
    {
      type: "pick",
      q: "Prim's algorithm has built the green tree (A, B and C). It now compares candidate edges. Tap every edge that Prim considers at this step.",
      fig: qf((Q) => Q.graph(NODES6, [["A", "B", 2], ["B", "C", 4], ["A", "D", 3], ["B", "E", 6], ["C", "F", 5], ["D", "E", 1], ["E", "F", 7], ["B", "D", 8]],
        { pick: "edges", w: 400, h: 250, hl: { "A-B": "var(--teal)", "B-C": "var(--teal)", A: "var(--teal)", B: "var(--teal)", C: "var(--teal)" } })),
      a: ["A-D", "B-E", "C-F", "B-D"],
      why: "Prim only compares edges with exactly one end in the tree and one end outside: A-D, B-D, B-E and C-F. D-E (cost 1) is the cheapest edge in the graph but joins two towns that are both outside the tree, so it is not a candidate yet. Prim would add A-D (3).",
    },
    {
      type: "bug",
      q: "This Prim implementation sometimes picks an edge that closes a loop. Click the faulty line.",
      code: [
        "tree_nodes = {start}",
        "tree_edges = []",
        "while len(tree_nodes) < n:",
        "    candidates = [e for e in edges if e.a in tree_nodes or e.b in tree_nodes]",
        "    e = min(candidates, key=lambda e: e.cost)",
        "    tree_edges.append(e)",
        "    tree_nodes |= {e.a, e.b}",
      ],
      a: 3,
      why: "With 'or', an edge with both ends already in the tree counts as a candidate, and adding it creates a cycle. A candidate must have exactly one end in the tree: (e.a in tree_nodes) != (e.b in tree_nodes).",
    },
    {
      type: "cat",
      q: "Five towns A to E are connected by the links listed. Is each set of links a spanning tree?",
      buckets: ["Spanning tree", "Not a spanning tree"],
      items: [
        ["A-B, B-C, C-D, D-E", 0],
        ["A-B, B-C, C-A, D-E", 1],
        ["A-B, A-C, A-D, A-E", 0],
        ["A-B, B-C, C-D, D-E, E-A", 1],
        ["A-B, C-D, D-E", 1],
        ["A-C, C-E, E-B, B-D", 0],
      ],
      why: "A spanning tree connects every town (no town cut off) with no loops, which means exactly 4 links for 5 towns. The second set has a loop and leaves D and E cut off, the fourth is a ring, and the fifth leaves A and B cut off.",
    },
    {
      type: "mcq",
      q: "Four towns are joined by the links shown. Prim would take the three cost-1 links from H, but now no town may have more than 2 cables. What is the cheapest valid network that still connects all four towns?",
      fig: qf((Q) => Q.graph({ H: [230, 120], A: [80, 50], B: [380, 50], C: [230, 215] }, [["H", "A", 1], ["H", "B", 1], ["H", "C", 1], ["A", "B", 4], ["B", "C", 4], ["A", "C", 4]], { w: 460, h: 250 })),
      o: ["3", "5", "6", "9"],
      a: 2,
      why: "H can have only two cables, so the network is a path. With H in the middle it uses two cost-1 links plus one cost-4 link: 1 + 1 + 4 = 6. With H at an end it costs 1 + 4 + 4 = 9. The plain MST costs 3 but gives H three cables, so the constraint raises the cost.",
    },
    {
      type: "order",
      q: "Run Prim's algorithm from A on the network shown. Put the edges in the order Prim adds them.",
      fig: qf((Q) => Q.graph(NODES5, [["A", "B", 4], ["A", "C", 1], ["B", "C", 2], ["B", "D", 3], ["C", "D", 7], ["B", "E", 6], ["D", "E", 5]], { w: 460, h: 250 })),
      items: ["A-C", "B-C", "B-D", "D-E"],
      why: "From A the cheapest edge is A-C (1). Then B-C (2) is cheapest to a new town. Then B-D (3), then D-E (5) beats B-E (6). The edge A-B (4) is never used because both of its ends are already in the tree, and the total cost is 1 + 2 + 3 + 5 = 11.",
    },
    {
      type: "mcq",
      q: "Six towns are joined in a ring, one cable between each neighbouring pair as shown. How many different spanning trees does this network have?",
      fig: qf((Q) => Q.graph(HEX, [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "F"], ["F", "A"]], { w: 460, h: 250 })),
      o: ["1", "5", "6", "15"],
      a: 2,
      why: "A spanning tree on six towns needs 5 links, so exactly one of the 6 cables must be left out. Removing any one of them breaks the loop and keeps everything connected, which gives 6 different trees. The tempting answer 5 confuses the number of links in a tree with the number of trees.",
    },
  ]);
})();

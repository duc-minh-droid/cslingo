/* ===== bank-v-nic-1.js ===== */
/* NIC revision bank, visual and varied questions, part 1.
   Modules: l1-what, l1-monkey, l1-ingredients, l1-apps, l2-generic, l2-optim, l2-complexity, l2-mst.
   Every figure carries the information the question needs. */
(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});

  const B = NIC.bank;
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;max-height:${h}px">${body}</svg>`;
  const tx = (x, y, s, { c = "var(--text)", a = "middle", z = 13, w = 800 } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${w} ${z}px var(--sans);fill:${c}">${s}</text>`;
  const rect = (x, y, w, h, { f = "var(--panel)", s = "var(--line-2)", r = 8, sw = 2 } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
  const qf = (fn) => (box) => {
    box.innerHTML = fn(NIC.qfig);
  };

  /* ---------- l1-what ---------- */
  B.add("l1-what", [
    {
      type: "pick",
      q: "Ants leave the nest for food, then carry it home laying a scent trail. The colony ends up using one of the three routes below. Tap it.",
      fig: svg(
        460,
        240,
        `
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
        <g data-pick="bot"><path d="M50 120 Q230 230 410 120" fill="none" stroke="transparent" stroke-width="30"/></g>`,
      ),
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
      fig: svg(
        460,
        230,
        `
        <line x1="50" y1="190" x2="440" y2="190" stroke="var(--line-2)" stroke-width="2"/>
        <line x1="50" y1="20" x2="50" y2="190" stroke="var(--line-2)" stroke-width="2"/>
        ${tx(245, 220, "minutes of running time", { c: "var(--text-dim)", z: 12 })}
        ${tx(24, 105, "plan", { c: "var(--text-dim)", z: 12 })}${tx(24, 120, "quality", { c: "var(--text-dim)", z: 12 })}
        ${tx(50, 207, "0", { z: 11, c: "var(--text-faint)" })}${tx(245, 207, "30", { z: 11, c: "var(--text-faint)" })}${tx(440, 207, "60", { z: 11, c: "var(--text-faint)" })}
        <line x1="${50 + 390 / 3}" y1="20" x2="${50 + 390 / 3}" y2="190" stroke="var(--amber)" stroke-width="2" stroke-dasharray="6 5"/>
        ${tx(50 + 390 / 3, 14, "deadline: 20 min", { c: "var(--amber-ink)", z: 12 })}
        <polyline fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" points="50,190 63,92 83,54 128,40 180,35 440,32"/>
        <polyline fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round" points="50,190 310,190 310,24 440,24"/>
        ${tx(72, 118, "nature-inspired", { c: "var(--teal-ink)", a: "start", z: 12 })}
        ${tx(318, 150, "exact method", { c: "var(--blue-ink)", a: "start", z: 12 })}`,
      ),
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
    const cells = vals
      .map((v, i) => {
        const h = v * 9;
        return `<rect x="${x + i * 34}" y="${y + 66 - h}" width="26" height="${h}" rx="4" fill="var(--blue)"/>${tx(x + i * 34 + 13, y + 80, v, { z: 11, c: "var(--text-dim)" })}`;
      })
      .join("");
    return `<g data-pick="${id}">${rect(x - 12, y - 24, 8 * 34 + 8, 120, { f: "var(--panel)" })}${tx(x + 125, y - 6, `Run ${id}: letters matching, step by step`, { z: 12, c: "var(--text-dim)" })}${cells}</g>`;
  };
  B.add("l1-monkey", [
    {
      type: "pick",
      q: "Three runs of a letter-matching search each record how many letters match the target at every step. Exactly one run could NOT have come from keep-if-better (keep a change only if it isn't worse). Tap it.",
      fig: svg(
        320,
        440,
        `${strip(24, 36, [1, 2, 2, 3, 3, 3, 4, 5], "A")}${strip(24, 176, [1, 2, 3, 3, 2, 4, 4, 5], "B")}${strip(24, 316, [0, 1, 1, 2, 3, 4, 4, 4], "C")}`,
      ),
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
      fig: svg(
        420,
        190,
        `
        <line x1="60" y1="150" x2="400" y2="150" stroke="var(--line-2)" stroke-width="2"/>
        ${[
          [10, 760],
          [20, 1900],
          [40, 4700],
        ]
          .map(
            ([n, s], i) =>
              `<rect x="${60 + i * 80}" y="${150 - (s / 4700) * 120}" width="60" height="${(s / 4700) * 120}" rx="6" fill="var(--blue)"/>${tx(90 + i * 80, 168, `${n} letters`, { z: 12 })}${tx(90 + i * 80, 144 - (s / 4700) * 120, s.toLocaleString("en-GB"), { z: 12, c: "var(--blue-ink)" })}`,
          )
          .join("")}
        <rect x="290" y="30" width="60" height="120" rx="6" fill="none" stroke="var(--line-2)" stroke-width="2" stroke-dasharray="6 5"/>${tx(320, 96, "?", { c: "var(--text-dim)", z: 22 })}${tx(320, 168, "80 letters", { z: 12 })}`,
      ),
      min: 0,
      max: 30000,
      step: 500,
      ans: 10500,
      tol: 3500,
      unit: "steps",
      hint: "Look at what happens each time the target doubles: a bit more than double the steps.",
      why: "Each extra letter adds a little work, so the cost grows a bit faster than the length, about 10,000 steps for 80 letters. Random typing would multiply its tries by 27 for every extra letter, which is why keep-if-better wins.",
    },
  ]);

  /* ---------- l1-ingredients ---------- */
  const bitRow = (x, y, s, fill) =>
    [...s]
      .map((ch, i) => `${rect(x + i * 30, y, 28, 28, { f: fill, r: 6 })}${tx(x + i * 30 + 14, y + 19, ch, { z: 14 })}`)
      .join("");
  B.add("l1-ingredients", [
    {
      type: "pick",
      q: "A single hiker (one candidate) makes small random steps and keeps a step only if it goes uphill. Starting at the red dot, which spot will the hiker end up on?",
      fig: qf((Q) =>
        Q.curve(
          (x) => 0.05 + 0.55 * Math.exp(-(((x - 0.25) / 0.09) ** 2)) + 1.0 * Math.exp(-(((x - 0.75) / 0.1) ** 2)),
          [
            [0.05, "D"],
            [0.25, "A"],
            [0.5, "B"],
            [0.75, "C"],
          ],
          { sx: 0.17, label: "possible solutions" },
        ),
      ),
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
      fig: svg(
        460,
        330,
        `
        ${tx(24, 28, "Parent 1", { a: "start", c: "var(--blue-ink)" })}${bitRow(110, 8, "11110000", "var(--blue-dim, var(--bg-2))")}
        ${tx(24, 68, "Parent 2", { a: "start", c: "var(--amber-ink)" })}${bitRow(110, 48, "00001111", "var(--amber-dim, var(--bg-2))")}
        ${["11001111", "00110000", "11111111", "00111100"].map((s, i) => `<g data-pick="${"c" + (i + 1)}">${rect(14, 100 + i * 56, 360, 48, { f: "var(--panel)" })}${tx(34, 130 + i * 56, "Child " + (i + 1), { a: "start" })}${bitRow(124, 110 + i * 56, s, "var(--bg-2)")}</g>`).join("")}`,
      ),
      a: "c4",
      why: "A 1-point child is a left part of one parent joined to the right part of the other, with every gene keeping its position. Child 4 (00111100) would need a left part of 0s from parent 2, then 1111 and then 00, which takes two cuts. Children 1, 2 and 3 come from cuts after 2, 2 and 4 genes.",
    },
    {
      type: "mcq",
      q: "Parents are drawn with a chance proportional to their fitness. The bars show five candidates' fitness. Compared with the weakest, how much more often is the best one picked?",
      fig: svg(
        420,
        190,
        `
        <line x1="40" y1="150" x2="400" y2="150" stroke="var(--line-2)" stroke-width="2"/>
        ${[1000, 1010, 1020, 1030, 1040].map((v, i) => `<rect x="${60 + i * 66}" y="${150 - (v / 1040) * 110}" width="46" height="${(v / 1040) * 110}" rx="5" fill="var(--violet)"/>${tx(83 + i * 66, 143 - (v / 1040) * 110, v.toLocaleString("en-GB"), { z: 11, c: "var(--violet-ink)" })}${tx(83 + i * 66, 168, "P" + (i + 1), { z: 12 })}`).join("")}`,
      ),
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
  const chip = (x, y, s, c) =>
    `${rect(x, y, 44, 26, { f: "var(--bg-2)", s: c, r: 7 })}${tx(x + 22, y + 18, s, { z: 12 })}`;
  const tt = (
    id,
    x,
    y,
    s1,
    s2,
  ) => `<g data-pick="${id}">${rect(x, y, 216, 92, { f: "var(--panel)" })}${tx(x + 12, y + 20, "Timetable " + id, { a: "start", z: 12, c: "var(--text-dim)" })}
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
      fig: svg(
        460,
        220,
        `${tt("W", 6, 10, ["M"], ["P", "A", "H"])}${tt("X", 238, 10, ["M", "P"], ["A", "H"])}${tt("Y", 6, 116, ["M", "A"], ["P", "H"])}${tt("Z", 238, 116, ["M", "H"], ["P", "A"])}`,
      ),
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
  const box = (id, x, y, name, v, c) =>
    `<g data-pick="${id}">${rect(x, y, 70, 56, { f: "var(--panel)", s: c })}${tx(x + 35, y + 22, name, { z: 13 })}${tx(x + 35, y + 44, "score " + v, { z: 12, c: "var(--text-dim)" })}</g>`;
  const runPanel = (x, title, best, avg, id) => {
    const X = (g) => x + 10 + g * 6.6,
      Y = (v) => 150 - v * 1.1;
    const pts = (f) => Array.from({ length: 20 }, (_, g) => `${X(g).toFixed(1)},${Y(f(g)).toFixed(1)}`).join(" ");
    return `<g data-pick="${id}">${rect(x, 10, 150, 175, { f: "var(--panel)" })}${tx(x + 75, 28, title, { z: 12, c: "var(--text-dim)" })}
      <line x1="${x + 10}" y1="${Y(100)}" x2="${x + 140}" y2="${Y(100)}" stroke="var(--text-faint)" stroke-dasharray="4 4"/>${tx(x + 140, Y(100) + 12, "optimum", { a: "end", z: 10, c: "var(--text-faint)" })}
      <polyline fill="none" stroke="var(--teal)" stroke-width="3" points="${pts(best)}"/><polyline fill="none" stroke="var(--blue)" stroke-width="3" stroke-dasharray="1 0" points="${pts(avg)}"/></g>`;
  };
  const r1b = (g) => 20 + 60 * (1 - Math.exp(-g / 2.5)),
    r1a = (g) => 20 + (r1b(g) - 20) * (1 - Math.exp(-g / 6));
  const r2b = (g) => 30 + 40 * (g / 19) + 3 * Math.sin(g * 2),
    r2a = (g) => 30 + 3 * Math.sin(g);
  const r3b = (g) => 20 + 79 * (1 - Math.exp(-g / 8)),
    r3a = (g) => 20 + 55 * (1 - Math.exp(-g / 8));
  Object.assign(partScope, { box, qf, r1a, r1b, r2a, r2b, r3a, r3b, rect, runPanel, svg, tx });
})();

/* Step-by-step lessons shown at the top of every module (one idea per step, plain English, a picture, a quick check). */
(function () {
  const partScope = (NIC.shared.lessons = NIC.shared.lessons || {});

  const L = NIC.LESSONS;

  // ---------- tiny visual builders ----------
  const g = (s, cls = "") =>
    `<span class="genome">${[...s].map((c, i) => `<span class="gene ${typeof cls === "function" ? cls(i) : cls}">${c}</span>`).join("")}</span>`;
  const row = (lbl, html, extra = "") =>
    `<div class="genome-row"><span class="lbl">${lbl}</span>${html}${extra ? `<span class="mono dim">${extra}</span>` : ""}</div>`;
  const flow = (items) =>
    `<div class="mini-row">${items.map((it) => (Array.isArray(it) ? `<span class="pill ${it[1] || ""}">${it[0]}</span>` : `<span class="pill">${it}</span>`)).join('<span class="arrow">→</span>')}</div>`;
  const chips = (arr) =>
    `<div class="pop">${arr.map(([n, f, c]) => `<div class="chip ${c || ""}"><small>${n}</small><b>${f}</b></div>`).join("")}</div>`;
  const table = (head, rows) =>
    `<table class="t" style="max-width:640px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
      .map(
        (r) =>
          `<tr class="${r.hl || (r[0] && r[0].hl) ? "hl" : r.bad || (r[0] && r[0].bad) ? "bad" : ""}">${[]
            .concat(r.c || (r[0] && r[0].c) || r)
            .flat(2)
            .map((c) => `<td>${c}</td>`)
            .join("")}</tr>`,
      )
      .join("")}</table>`;
  function curve(fn, opts = {}) {
    const w = opts.w || 520,
      h = opts.h || 130,
      n = 120,
      pts = [];
    const vals = Array.from({ length: n + 1 }, (_, i) => fn(i / n)),
      mx = Math.max(...vals),
      mn = Math.min(0, ...vals);
    const X = (x) => 10 + x * (w - 20),
      Y = (v) => h - 16 - ((v - mn) / (mx - mn || 1)) * (h - 48);
    vals.forEach((v, i) => pts.push(`${X(i / n).toFixed(1)},${Y(v).toFixed(1)}`));
    const marks = (opts.marks || [])
      .map(([x, c, lbl]) => {
        const v = fn(x);
        return `<circle cx="${X(x)}" cy="${Y(v) - 2}" r="7" fill="${c}"/>${lbl ? `<text x="${X(x)}" y="${Y(v) - 14}" fill="${c}" font-size="12" text-anchor="middle" font-family="var(--sans)">${lbl}</text>` : ""}`;
      })
      .join("");
    const named = (opts.marks || []).map((m) => m[2]).filter(Boolean);
    const says =
      opts.alt ||
      `Fitness landscape, a curve with hills and dips${opts.label ? ` (${opts.label.replace(/\s*→$/, "")})` : ""}${named.length ? `. Marked: ${named.join(", ")}` : ""}.`;
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${NIC.esc(says)}" style="width:100%;max-width:${w}px;display:block;background:var(--bg-2);border:1px solid var(--line);border-radius:12px">
      <polyline points="${X(0)},${h - 16} ${pts.join(" ")} ${X(1)},${h - 16}" fill="rgba(88,204,2,0.12)" stroke="none"/>
      <polyline points="${pts.join(" ")}" fill="none" stroke="var(--teal)" stroke-width="2.5"/>${marks}
      ${opts.label ? `<text x="${w / 2}" y="${h - 3}" fill="var(--text-faint)" font-size="11" text-anchor="middle">${opts.label}</text>` : ""}</svg>`;
  }
  const bump = (x, c, s, a) => a * Math.exp(-((x - c) ** 2) / (2 * s * s));
  const multi = (x) => 0.1 + bump(x, 0.18, 0.06, 0.55) + bump(x, 0.45, 0.07, 0.7) + bump(x, 0.75, 0.06, 1);
  const bars = (items) =>
    `<div style="display:grid;gap:6px;max-width:520px">${items.map(([lbl, v, c]) => `<div style="display:grid;grid-template-columns:110px 1fr 56px;gap:10px;align-items:center"><span class="mono dim">${lbl}</span><span style="height:14px;border-radius:7px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden"><span style="display:block;height:100%;width:${Math.max(1, v)}%;background:${c || "var(--teal)"}"></span></span><span class="mono">${v.toFixed(v < 1 ? 1 : 0)}%</span></div>`).join("")}</div>`;

  /* =================== LECTURE 1 =================== */
  L["l1-what"] = {
    sum: "Nature-Inspired Computation borrows problem-solving tricks from nature. There are three sources: <b>evolution</b>, <b>brains</b> and <b>swarms</b>.",
    steps: [
      {
        t: "Split the name into three words",
        b: `<p>The easiest way to understand "Nature-Inspired Computation" is to take each word as a question:</p>`,
        v: table(
          ["Word", "Question it answers"],
          [
            ["<b>Nature</b>", "Which parts of nature do we copy?"],
            ["<b>Inspired</b>", "Why copy nature at all?"],
            ["<b>Computation</b>", "What computer problems can this solve?"],
          ],
        ),
      },
      {
        t: "Nature: the three systems we copy",
        b: `<p>The module uses three natural systems:</p><p>🧬 <b>Evolution</b>: species slowly improving over generations.<br>🧠 <b>Brains</b>: networks of neurons that learn.<br>🐜 <b>Collective behaviour</b>: ant colonies, bird flocks, swarms.</p>`,
      },
      {
        t: "Inspired: why copy them?",
        b: `<p>Each one solves <b>very hard problems without anyone in charge</b>.</p><p>Evolution built things as complex as <i>us</i> with no designer. Your brain recognises a face instantly. A single ant is simple, yet the <i>colony</i> finds the shortest path to food.</p><span class="analogy">Nature has spent billions of years testing problem-solving strategies. We just copy the ones that work.</span>`,
        c: {
          type: "cat",
          q: "One ant is simple. Which of these can <b>one ant</b> do alone, and which only happens with the <b>whole colony</b>?",
          buckets: ["One ant alone", "Whole colony"],
          items: [
            ["Sniff out a scent trail left by another ant", 0],
            ["Find the shortest path to a food source", 1],
            ["Drop a little scent behind it as it walks", 0],
            ["Re-route round a new obstacle with no leader", 1],
          ],
          hint: "Ask: is it a simple rule one ant can follow, or a result that only shows up when thousands of ants interact?",
          why: "Each ant follows simple rules, like sniffing and dropping scent. Short paths and re-routing emerge from many simple agents interacting. That idea becomes Ant Colony Optimisation (your CA1).",
        },
      },
      {
        t: "Computation: which problems?",
        b: `<p>Animals had to evolve to be good at tasks that computer scientists also care about:</p>`,
        v: table(
          ["Nature had to…", "Computing version"],
          [
            ["Recognise predators and food", "<b>Pattern recognition</b> (spam filters, diagnosis)"],
            ["Find the quickest way home", "<b>Shortest paths</b> (routing)"],
            ["Search for food", "<b>Search / optimisation</b> (timetables, designs)"],
          ],
        ),
      },
      {
        t: "Why is it worth it?",
        b: `<p>Nature-inspired methods tend to give <b>good results in reasonable time</b> on a huge variety of real problems.</p><span class="key">EAs optimise complex systems on modest hardware. Neural networks beat classical pattern recognition. Swarm methods model behaviour that emerges from simple agents.</span>`,
        c: {
          q: "What is the main selling point of nature-inspired methods?",
          o: [
            "They always find the perfect answer, however big the problem",
            "Good answers in reasonable time on messy problems",
            "They work without needing any fitness function at all",
          ],
          a: 1,
          why: 'Not perfect, just good and fast enough. Lecture 2 explains why "perfect" is usually impossible anyway.',
        },
      },
    ],
    guide: [
      "Click each of the three cards (Evolution, Brains, Collective behaviour).",
      "For each one, read the Nature → Inspired → Computation boxes. Try to say them out loud without looking.",
      "Answer the Predict question.",
    ],
  };

  L["l1-monkey"] = {
    sum: "Pure random guessing is hopeless. Random changes <b>plus keeping the good ones</b> is how evolution actually works.",
    steps: [
      {
        t: "Evolution is a problem solver",
        b: `<p>Here's a problem: <i>design a boot sole that lets you walk up a smooth vertical brick wall.</i> Humans haven't solved it. <b>Nature has: geckos.</b></p><p>You can view evolution as solving one big problem: <b>"How can I survive in this environment?"</b></p>`,
      },
      {
        t: "Its method: trial and error",
        b: `<p>At its core evolution does something very simple:</p>`,
        v:
          flow([["Old solution"], ["Randomly change it", "violet"], ["New solution"], ["Better than old?", "amber"]]) +
          `<div class="mini-row" style="margin-left:4px"><span class="pill teal">Yes → keep the new one</span><span class="pill rose">No → throw it away</span></div>`,
      },
      {
        t: "That sounds hopeless… (the infinite monkey)",
        b: `<p>The <b>Infinite Monkey Theorem</b>: a monkey hitting random keys forever would <i>eventually</i> type all of Shakespeare.</p><p>But "eventually" is the problem. Take one short sentence, <code>METHINKS IT IS LIKE A WEASEL</code>: 28 characters with 27 choices each (A–Z and space).</p><span class="key">27 × 27 × … (28 times) = 27<sup>28</sup> ≈ <b>1.2 × 10<sup>40</sup></b> possibilities. At a billion tries a second, that's ~10<sup>23</sup> years.</span>`,
        c: {
          q: "Why does the monkey never get anywhere?",
          o: ["It types too slowly", "Every try starts from scratch", "It uses the wrong keyboard"],
          a: 1,
          why: "Nothing carries over between tries. That's the difference that matters.",
        },
      },
      {
        t: "The fix: keep what works",
        b: `<p>Instead of starting over, change <b>one</b> letter and <b>keep the change if it isn't worse</b>. Tiny example with target <code>CAT</code>:</p>`,
        v:
          row(
            "start",
            g("QZT", (i) => (i === 2 ? "good" : "")),
            "1 correct",
          ) +
          row(
            "try",
            g("CZT", (i) => (i !== 1 ? "good" : "")),
            "2 correct → keep ✓",
          ) +
          row(
            "try",
            g("CZQ", (i) => (i === 0 ? "good" : "")),
            "1 correct → discard ✗",
          ) +
          row("try", g("CAT", "good"), "3 correct → keep ✓") +
          `<p class="dim" style="margin-top:8px">Progress <b>accumulates</b>. This is called <b>cumulative selection</b>.</p>`,
      },
      {
        t: "But real problems fight back",
        b: `<p>On the monkey problem each letter can be fixed independently, so keep-if-better wins easily.</p><p>On <b>hard</b> problems, one solution doing keep-if-better gets <b>stuck</b>: every small change looks worse, even though a much better answer exists further away. Nature solves this with extra ingredients (next module).</p>`,
        c: {
          type: "match",
          q: "Randomness in evolution is useful, but only with selection. Match each recipe to what it does.",
          pairs: [
            ["Random changes, no selection", "Wanders forever, like the monkey"],
            ["Selection, no random changes", "Has nothing new to choose from"],
            ["Random changes plus selection", "Keeps the improvements: evolution"],
          ],
          hint: "Randomness proposes changes. Selection decides which ones are kept.",
          why: "Randomness alone is the monkey. Selection alone has nothing new to pick from. Randomness proposes and selection keeps the good ones: that is evolution.",
        },
      },
    ],
    guide: [
      "Press <b>Run both</b>.",
      "Watch the green letters: the monkey's best barely moves, while keep-if-better locks in letters one by one.",
      "When it finishes, read how many tries each needed. Compare with 10<sup>40</sup>.",
    ],
  };

  L["l1-ingredients"] = {
    sum: "The magic ingredients: <b>a population</b>, <b>weakly-biased selection + mutation</b>, and optionally <b>recombination</b>.",
    steps: [
      {
        t: "Randomness needs help",
        b: `<p>Randomness (the lecture calls it <i>stochasticity</i>) is part of every evolutionary algorithm (EA). But to get a working algorithm we need extra ingredients copied from nature. There are three.</p>`,
      },
      {
        t: "Ingredient 1: a population",
        b: `<p>Keep <b>many</b> candidate solutions at once, competing with each other, not just one.</p><span class="analogy">Searching for the highest mountain in fog: one hiker gets stuck on the first hill they climb. Twenty hikers spread out, and some of them land on the big mountain.</span>`,
        v: curve(multi, {
          marks: [
            [0.16, "var(--rose)", "1 hiker: stuck"],
            [0.4, "var(--violet)"],
            [0.5, "var(--violet)"],
            [0.72, "var(--violet)"],
            [0.8, "var(--violet)"],
            [0.22, "var(--violet)"],
          ],
          label: "every possible solution →",
        }),
      },
      {
        t: "Ingredient 2: weakly-biased selection + mutation",
        b: `<p>Pick parents so that <b>fitter ones are more likely</b>, but <b>even the weakest still has some chance</b>. Then <b>mutate</b> the chosen parents: make a small random change.</p><p>Example with fitnesses 9, 6, 3, 1 (chance ∝ fitness):</p>`,
        v: bars([
          ["fitness 9", 47.4],
          ["fitness 6", 31.6],
          ["fitness 3", 15.8],
          ["fitness 1", 5.3],
        ]),
        c: {
          type: "cat",
          q: "A <b>weak</b> bias favours the fit without shutting anyone out. Which ways of choosing a parent are a weak bias?",
          buckets: ["Weak bias", "Not a weak bias"],
          items: [
            ["Chances in proportion to fitness: 9, 6, 3, 1 get 47%, 32%, 16%, 5%", 0],
            ["The fittest individual breeds every time and the others never do", 1],
            ["Every individual has exactly the same chance, fit or not", 1],
            ["Fitter parents are likelier, but the weakest can still be chosen", 0],
          ],
          hint: "A weak bias leans towards the fit. Always picking the best leans too hard, and a coin flip does not lean at all.",
          why: "Fitter parents are likelier, yet even the least fit have some chance: a weak bias. Always picking the best is a strong bias, and equal chances are no bias at all.",
        },
      },
      {
        t: "Ingredient 3 (optional): recombination",
        b: `<p>Make a child by <b>combining pieces of two (or more) parents</b>. It isn't required, but it often helps.</p>`,
        v:
          row("Parent 1", g("AAAAAA", "p1")) +
          row("Parent 2", g("BBBBBB", "p2")) +
          row(
            "Child",
            g("AAABBB", (i) => (i < 3 ? "p1" : "p2")),
          ),
      },
      {
        t: "One generation, start to finish",
        b: `<p>The slides show one full cycle like this:</p>`,
        v:
          flow([
            ["Initial population", "violet"],
            "Select",
            "Crossover",
            "Mutation",
            "Old pop + children",
            ["New population", "teal"],
          ]) + `<p class="dim" style="margin-top:8px">Then repeat: generation 2, 3, 4…</p>`,
      },
      {
        t: "How to read the playground below",
        b: `<p>The picture below is a <b>landscape</b>. Every possible solution sits somewhere along the bottom, and the <b>height</b> of the curve is how good that solution is. The ★ marks the best one.</p><p>Each purple dot is one member of the population. Evolution succeeds when the dots climb to the ★.</p>`,
        v: curve(multi, {
          marks: [
            [0.75, "var(--amber)", "★ best"],
            [0.45, "var(--violet)", "a good-ish solution"],
            [0.05, "var(--violet)", "a poor one"],
          ],
        }),
        c: {
          q: "A dot that sits very high on the curve is…",
          o: ["a poor solution (low fitness)", "a good solution (high fitness)", "a mutation waiting to happen"],
          a: 1,
          why: "Height = fitness. Higher is better.",
        },
      },
    ],
    guide: [
      "Press <b>Evolve</b> with the defaults and watch the dots gather on the peaks.",
      "Set <b>Population size</b> to 1 (that's plain trial and error) and press <b>Evolve</b>. Does it reach the ★?",
      "Press <b>Run test</b> for population 1, then for population 20. Compare the percentages.",
      "Choose <b>Strong</b> bias and run the test: fast, but often stuck. Then try <b>None</b>: no progress.",
      "Tick <b>Recombination</b> and test again.",
    ],
  };

  L["l1-apps"] = {
    sum: "If you can <b>score</b> a candidate solution, you can attack the problem with an EA.",
    steps: [
      {
        t: "The one requirement",
        b: `<p>An evolutionary algorithm (EA) doesn't need to know <i>how</i> to solve your problem. It only needs a way to <b>score</b> any candidate (a <i>fitness function</i>). Everything else is generic.</p><span class="key">Can you say how good a solution is? Then you can evolve better ones.</span>`,
      },
      {
        t: "Six application areas",
        b: `<p>The lecture groups applications into six categories:</p>`,
        v: table(
          ["Category", "Example"],
          [
            ["Planning", "Routing, scheduling, packing"],
            ["Design", "Circuits, antennas, structures"],
            ["Simulation", "Model competing firms in a market"],
            ["Identification", "Fit a function to medical data"],
            ["Control", "Controller for a gas turbine or a robot"],
            ["Classification", "Spam detection, heart-disease diagnosis"],
          ],
        ),
      },
      {
        t: "Famous examples from the slides",
        b: `<p><b>Bentley's cars</b>: the chromosome is a series of slices through the car, and fitness comes from an airflow simulation. <i>"More like selective breeding than natural evolution."</i></p><p><b>NASA ST5 antenna</b>: evolved antennas beat the human expert designs.</p><p><b>Top Gun</b>: evolved fighter-pilot strategies.</p>`,
        c: {
          type: "match",
          q: "An EA can attack tasks in six areas. Match each task to its <b>category</b>.",
          pairs: [
            ["Evolving an antenna shape to meet a spec", "Design"],
            ["Scheduling exams so no student has a clash", "Planning"],
            ["Keeping a walking robot upright", "Control"],
            ["Fitting a curve to noisy sensor readings", "Identification"],
          ],
          hint: "Ask what the EA is searching for: a shape, a schedule, a controller, or a function that fits data.",
          why: "An antenna is a design: the EA searches the space of shapes. A timetable is planning, a balancing robot needs a controller, and fitting a curve to readings is identification.",
        },
      },
    ],
    guide: [
      "Read the item in big text.",
      "Click the category you think it belongs to. Mistakes are logged below with the right answer.",
      "Aim for 12/12.",
    ],
  };

  /* =================== LECTURE 2 =================== */
  L["l2-generic"] = {
    sum: "Every EA: make a random population, then repeat <b>Select → Vary → Update</b>.",
    steps: [
      {
        t: "What are we trying to do?",
        b: `<p>You have a problem. For any candidate solution <b>s</b> there is a function <b>f(s)</b> that says how good it is. You want the best one, <b>s*</b>, with the highest (or lowest) f.</p>`,
      },
      {
        t: "Step 0: a random population",
        b: `<p>Generate a population <b>P</b> of random solutions (typically 100–500) and score each one.</p>`,
        v: chips([
          ["S1", "0.1"],
          ["S2", "0.5"],
          ["S3", "0.3"],
          ["S4", "0.2"],
          ["S5", "0.9"],
          ["S6", "0.7"],
          ["S7", "0.3"],
          ["S8", "0.4"],
          ["S9", "0.4"],
          ["S10", "0.1"],
        ]),
      },
      {
        t: "Step 1: Select",
        b: `<p>Choose some parents, with a bias towards fitter ones. Ways to do it: take the top 10%, pick with probability proportional to fitness, or pick with probability that shrinks with rank.</p>`,
        v:
          chips([
            ["S5", "0.9", "picked"],
            ["S9", "0.4", "picked"],
          ]) +
          `<p class="dim" style="margin-top:8px">The slides pick S5 (best) <i>and</i> S9 (average). Biased, not "best only".</p>`,
      },
      {
        t: "Step 2: Vary",
        b: `<p>Apply genetic operators (mutation, recombination) to the parents to make <b>new</b> solutions. Children can be better <i>or worse</i>:</p>`,
        v: chips([
          ["S11", "1.0", "new"],
          ["S12", "0.2", "new"],
        ]),
      },
      {
        t: "Step 3: Update the population",
        b: `<p>Decide who stays. Three common rules:</p><p>① <b>Replace the entire population</b> with children.<br>② <b>Merge</b> old + new, then keep the best |P|.<br>③ <b>Replace some old</b> with some new (e.g. the weakest).</p>`,
        c: {
          type: "cat",
          q: "Suppose every child is worse than the best parent. Under each update rule, can the <b>best solution be lost</b>?",
          buckets: ["Best can be lost", "Best always survives"],
          items: [
            ["① Replace the whole population with the children", 0],
            ["② Merge old and new, then keep the best |P|", 1],
            ["③ Replace randomly chosen parents with children", 0],
            ["③ Replace the weakest parent with a child", 1],
          ],
          hint: "Ask whether the rule could ever remove the single best parent.",
          why: "Replacing everyone (①) or random parents (③) can throw the best away. If you keep the best |P| of the merged pool (②), or only ever replace the weakest, the current best always survives.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>Here is one full generation on 6 short bit-strings. Fitness is the number of 1s. Press <b>play</b> or step with the arrows, and the code lights up as it goes.</p><p>Children are coloured by the parent each gene came from. It will pause and ask you to pick a tournament winner.</p>`,
        v: (box, life) => NIC.runners.eaGen(box, life),
      },
      {
        t: "Then repeat, and the big design questions",
        b: `<p>Loop Select → Vary → Update until you run out of time. The hard part is the design choices:</p><p><b>How greedy should selection be?</b> Always the best means <i>bad results, quickly</i>. Almost random means <i>great results, too slowly</i>.<br><b>How to encode and how to vary?</b> Small mutation steps are preferred. Recombination is a principled way to take bigger steps. Large random steps are usually terrible.</p>`,
      },
    ],
    guide: [
      "Press <b>Next stage</b> to walk through the 4 stages using the slide's numbers.",
      "At stage 4, click <b>Replace the entire population</b>, <b>Merge</b> and <b>Replace some old</b> in turn and compare the next population. Which rule loses S5 (0.9)?",
      "Drag the <b>greediness</b> slider below and read what happens at each extreme.",
    ],
  };
  Object.assign(partScope, { bars, bump, chips, curve, flow, g, multi, row, table });
})();

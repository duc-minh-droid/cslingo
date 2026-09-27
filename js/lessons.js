/* Step-by-step lessons shown at the top of every module (one idea per step, plain English, a picture, a quick check). */
(function () {
  const L = NIC.LESSONS;

  // ---------- tiny visual builders ----------
  const g = (s, cls = "") => `<span class="genome">${[...s].map((c, i) => `<span class="gene ${typeof cls === "function" ? cls(i) : cls}">${c}</span>`).join("")}</span>`;
  const row = (lbl, html, extra = "") => `<div class="genome-row"><span class="lbl">${lbl}</span>${html}${extra ? `<span class="mono dim">${extra}</span>` : ""}</div>`;
  const flow = (items) => `<div class="mini-row">${items.map((it) => (Array.isArray(it) ? `<span class="pill ${it[1] || ""}">${it[0]}</span>` : `<span class="pill">${it}</span>`)).join('<span class="arrow">→</span>')}</div>`;
  const chips = (arr) => `<div class="pop">${arr.map(([n, f, c]) => `<div class="chip ${c || ""}"><small>${n}</small><b>${f}</b></div>`).join("")}</div>`;
  const table = (head, rows) => `<table class="t" style="max-width:640px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr class="${r.hl ? "hl" : r.bad ? "bad" : ""}">${(r.c || r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  function curve(fn, opts = {}) {
    const w = opts.w || 520, h = opts.h || 130, n = 120, pts = [];
    const vals = Array.from({ length: n + 1 }, (_, i) => fn(i / n)), mx = Math.max(...vals), mn = Math.min(0, ...vals);
    const X = (x) => 10 + x * (w - 20), Y = (v) => h - 16 - ((v - mn) / (mx - mn || 1)) * (h - 48);
    vals.forEach((v, i) => pts.push(`${X(i / n).toFixed(1)},${Y(v).toFixed(1)}`));
    const marks = (opts.marks || []).map(([x, c, lbl]) => { const v = fn(x); return `<circle cx="${X(x)}" cy="${Y(v) - 2}" r="7" fill="${c}"/>${lbl ? `<text x="${X(x)}" y="${Y(v) - 14}" fill="${c}" font-size="12" text-anchor="middle" font-family="var(--sans)">${lbl}</text>` : ""}`; }).join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;background:var(--bg-2);border:1px solid var(--line);border-radius:12px">
      <polyline points="${X(0)},${h - 16} ${pts.join(" ")} ${X(1)},${h - 16}" fill="rgba(88,204,2,0.12)" stroke="none"/>
      <polyline points="${pts.join(" ")}" fill="none" stroke="var(--teal)" stroke-width="2.5"/>${marks}
      ${opts.label ? `<text x="${w / 2}" y="${h - 3}" fill="var(--text-faint)" font-size="11" text-anchor="middle">${opts.label}</text>` : ""}</svg>`;
  }
  const bump = (x, c, s, a) => a * Math.exp(-((x - c) ** 2) / (2 * s * s));
  const multi = (x) => 0.1 + bump(x, 0.18, 0.06, 0.55) + bump(x, 0.45, 0.07, 0.7) + bump(x, 0.75, 0.06, 1);
  const bars = (items) => `<div style="display:grid;gap:6px;max-width:520px">${items.map(([lbl, v, c]) => `<div style="display:grid;grid-template-columns:110px 1fr 56px;gap:10px;align-items:center"><span class="mono dim">${lbl}</span><span style="height:14px;border-radius:7px;background:var(--bg-2);border:1px solid var(--line);overflow:hidden"><span style="display:block;height:100%;width:${Math.max(1, v)}%;background:${c || "var(--teal)"}"></span></span><span class="mono">${v.toFixed(v < 1 ? 1 : 0)}%</span></div>`).join("")}</div>`;

  /* =================== LECTURE 1 =================== */
  L["l1-what"] = {
    sum: "Nature-Inspired Computation borrows problem-solving tricks from nature. There are three sources: <b>evolution</b>, <b>brains</b> and <b>swarms</b>.",
    steps: [
      { t: "Split the name into three words", b: `<p>The easiest way to understand "Nature-Inspired Computation" is to take each word as a question:</p>`,
        v: table(["Word", "Question it answers"], [["<b>Nature</b>", "Which parts of nature do we copy?"], ["<b>Inspired</b>", "Why copy nature at all?"], ["<b>Computation</b>", "What computer problems can this solve?"]]) },
      { t: "Nature: the three systems we copy", b: `<p>The module uses three natural systems:</p><p>🧬 <b>Evolution</b>: species slowly improving over generations.<br>🧠 <b>Brains</b>: networks of neurons that learn.<br>🐜 <b>Collective behaviour</b>: ant colonies, bird flocks, swarms.</p>` },
      { t: "Inspired: why copy them?", b: `<p>Each one solves <b>very hard problems without anyone in charge</b>.</p><p>Evolution built things as complex as <i>us</i> with no designer. Your brain recognises a face instantly. A single ant is simple, yet the <i>colony</i> finds the shortest path to food.</p><span class="analogy">Nature has spent billions of years testing problem-solving strategies. We just copy the ones that work.</span>`,
        c: { q: "One ant is simple. What can a whole ant colony do?", o: ["Nothing useful", "Find short paths to food, with no leader", "Only follow a queen's orders"], a: 1, why: "Intelligence emerges from many simple agents interacting. That idea becomes Ant Colony Optimisation (your CA1)." } },
      { t: "Computation: which problems?", b: `<p>Animals had to evolve to be good at tasks that computer scientists also care about:</p>`,
        v: table(["Nature had to…", "Computing version"], [["Recognise predators and food", "<b>Pattern recognition</b> (spam filters, diagnosis)"], ["Find the quickest way home", "<b>Shortest paths</b> (routing)"], ["Search for food", "<b>Search / optimisation</b> (timetables, designs)"]]) },
      { t: "Why is it worth it?", b: `<p>Nature-inspired methods tend to give <b>good results in reasonable time</b> on a huge variety of real problems.</p><span class="key">EAs optimise complex systems on modest hardware. Neural networks beat classical pattern recognition. Swarm methods model behaviour that emerges from simple agents.</span>`,
        c: { q: "What is the main selling point of nature-inspired methods?", o: ["They always find the perfect answer", "Good answers in reasonable time on real, messy problems", "They need no computer"], a: 1, why: "Not perfect, just good and fast enough. Lecture 2 explains why \"perfect\" is usually impossible anyway." } },
    ],
    guide: ["Click each of the three cards (Evolution, Brains, Collective behaviour).", "For each one, read the Nature → Inspired → Computation boxes. Try to say them out loud without looking.", "Answer the Predict question."],
  };

  L["l1-monkey"] = {
    sum: "Pure random guessing is hopeless. Random changes <b>plus keeping the good ones</b> is how evolution actually works.",
    steps: [
      { t: "Evolution is a problem solver", b: `<p>Here's a problem: <i>design a boot sole that lets you walk up a smooth vertical brick wall.</i> Humans haven't solved it. <b>Nature has: geckos.</b></p><p>You can view evolution as solving one big problem: <b>"How can I survive in this environment?"</b></p>` },
      { t: "Its method: trial and error", b: `<p>At its core evolution does something very simple:</p>`,
        v: flow([["Old solution"], ["Randomly change it", "violet"], ["New solution"], ["Better than old?", "amber"]]) + `<div class="mini-row" style="margin-left:4px"><span class="pill teal">Yes → keep the new one</span><span class="pill rose">No → throw it away</span></div>` },
      { t: "That sounds hopeless… (the infinite monkey)", b: `<p>The <b>Infinite Monkey Theorem</b>: a monkey hitting random keys forever would <i>eventually</i> type all of Shakespeare.</p><p>But "eventually" is the problem. Take one short sentence, <code>METHINKS IT IS LIKE A WEASEL</code>: 28 characters with 27 choices each (A–Z and space).</p><span class="key">27 × 27 × … (28 times) = 27<sup>28</sup> ≈ <b>1.2 × 10<sup>40</sup></b> possibilities. At a billion tries a second, that's ~10<sup>23</sup> years.</span>`,
        c: { q: "Why does the monkey never get anywhere?", o: ["It types too slowly", "Every try starts from scratch, so no progress is ever kept", "It uses the wrong keyboard"], a: 1, why: "Nothing carries over between tries. That's the difference that matters." } },
      { t: "The fix: keep what works", b: `<p>Instead of starting over, change <b>one</b> letter and <b>keep the change if it isn't worse</b>. Tiny example with target <code>CAT</code>:</p>`,
        v: row("start", g("QZT", (i) => (i === 2 ? "good" : "")), "1 correct") + row("try", g("CZT", (i) => (i !== 1 ? "good" : "")), "2 correct → keep ✓") + row("try", g("CZQ", (i) => (i === 0 ? "good" : "")), "1 correct → discard ✗") + row("try", g("CAT", "good"), "3 correct → keep ✓") + `<p class="dim" style="margin-top:8px">Progress <b>accumulates</b>. This is called <b>cumulative selection</b>.</p>` },
      { t: "But real problems fight back", b: `<p>On the monkey problem each letter can be fixed independently, so keep-if-better wins easily.</p><p>On <b>hard</b> problems, one solution doing keep-if-better gets <b>stuck</b>: every small change looks worse, even though a much better answer exists further away. Nature solves this with extra ingredients (next module).</p>`,
        c: { q: "Randomness in evolution is useful because…", o: ["It is used on its own", "It proposes changes, and selection keeps the good ones", "It guarantees the best answer"], a: 1, why: "Randomness alone is the monkey. Randomness plus selection is evolution." } },
    ],
    guide: ["Press <b>Run both</b>.", "Watch the green letters: the monkey's best barely moves, while keep-if-better locks in letters one by one.", "When it finishes, read how many tries each needed. Compare with 10<sup>40</sup>."],
  };

  L["l1-ingredients"] = {
    sum: "The magic ingredients: <b>a population</b>, <b>weakly-biased selection + mutation</b>, and optionally <b>recombination</b>.",
    steps: [
      { t: "Randomness needs help", b: `<p>Randomness (the lecture calls it <i>stochasticity</i>) is part of every EA. But to get a working algorithm we need extra ingredients copied from nature. There are three.</p>` },
      { t: "Ingredient 1: a population", b: `<p>Keep <b>many</b> candidate solutions at once, competing with each other, not just one.</p><span class="analogy">Searching for the highest mountain in fog: one hiker gets stuck on the first hill they climb. Twenty hikers spread out, and some of them land on the big mountain.</span>`,
        v: curve(multi, { marks: [[0.16, "var(--rose)", "1 hiker: stuck"], [0.4, "var(--violet)"], [0.5, "var(--violet)"], [0.72, "var(--violet)"], [0.8, "var(--violet)"], [0.22, "var(--violet)"]], label: "every possible solution →" }) },
      { t: "Ingredient 2: weakly-biased selection + mutation", b: `<p>Pick parents so that <b>fitter ones are more likely</b>, but <b>even the weakest still has some chance</b>. Then <b>mutate</b> the chosen parents: make a small random change.</p><p>Example with fitnesses 9, 6, 3, 1 (chance ∝ fitness):</p>`,
        v: bars([["fitness 9", 47.4], ["fitness 6", 31.6], ["fitness 3", 15.8], ["fitness 1", 5.3]]),
        c: { q: "Which of these is a <b>weak</b> bias?", o: ["Only the fittest breeds", "Fitter parents are more likely, but anyone can be chosen", "Everyone gets an equal chance"], a: 1, why: "\"It's not really plain survival of the fittest\": the fitter you are, the more chance you have, and even the least fit still have some chance." } },
      { t: "Ingredient 3 (optional): recombination", b: `<p>Make a child by <b>combining pieces of two (or more) parents</b>. It isn't required, but it often helps.</p>`,
        v: row("Parent 1", g("AAAAAA", "p1")) + row("Parent 2", g("BBBBBB", "p2")) + row("Child", g("AAABBB", (i) => (i < 3 ? "p1" : "p2"))) },
      { t: "One generation, start to finish", b: `<p>The slides show one full cycle like this:</p>`,
        v: flow([["Initial population", "violet"], "Select", "Crossover", "Mutation", "Old pop + children", ["New population", "teal"]]) + `<p class="dim" style="margin-top:8px">Then repeat: generation 2, 3, 4…</p>` },
      { t: "How to read the playground below", b: `<p>The picture below is a <b>landscape</b>. Every possible solution sits somewhere along the bottom, and the <b>height</b> of the curve is how good that solution is. The ★ marks the best one.</p><p>Each purple dot is one member of the population. Evolution succeeds when the dots climb to the ★.</p>`,
        v: curve(multi, { marks: [[0.75, "var(--amber)", "★ best"], [0.45, "var(--violet)", "a good-ish solution"], [0.05, "var(--violet)", "a poor one"]] }),
        c: { q: "A dot that sits very high on the curve is…", o: ["a bad solution", "a good solution (high fitness)", "a mutation"], a: 1, why: "Height = fitness. Higher is better." } },
    ],
    guide: ["Press <b>Evolve</b> with the defaults and watch the dots gather on the peaks.", "Set <b>Population size to 1</b> (that's plain trial and error) and press Evolve. Does it reach the ★?", "Press <b>Run test</b> for population 1, then for population 20. Compare the percentages.", "Choose <b>Strong</b> bias and run the test: fast, but often stuck. Then try <b>None</b>: no progress.", "Tick <b>Recombination</b> and test again."],
  };

  L["l1-apps"] = {
    sum: "If you can <b>score</b> a candidate solution, you can attack the problem with an EA.",
    steps: [
      { t: "The one requirement", b: `<p>An EA doesn't need to know <i>how</i> to solve your problem. It only needs a way to <b>score</b> any candidate (a <i>fitness function</i>). Everything else is generic.</p><span class="key">Can you say how good a solution is? Then you can evolve better ones.</span>` },
      { t: "Six application areas", b: `<p>The lecture groups applications into six categories:</p>`,
        v: table(["Category", "Example"], [["Planning", "Routing, scheduling, packing"], ["Design", "Circuits, antennas, structures"], ["Simulation", "Model competing firms in a market"], ["Identification", "Fit a function to medical data"], ["Control", "Controller for a gas turbine or a robot"], ["Classification", "Spam detection, heart-disease diagnosis"]]) },
      { t: "Famous examples from the slides", b: `<p><b>Bentley's cars</b>: the chromosome is a series of slices through the car, and fitness comes from an airflow simulation. <i>"More like selective breeding than natural evolution."</i></p><p><b>NASA ST5 antenna</b>: evolved antennas beat the human expert designs.</p><p><b>Top Gun</b>: evolved fighter-pilot strategies.</p>`,
        c: { q: "Designing an antenna shape to meet a spec is which category?", o: ["Planning", "Design", "Classification"], a: 1, why: "Design: the EA searches the space of shapes, scored by how well each meets the requirements." } },
    ],
    guide: ["Read the item in big text.", "Click the category you think it belongs to. Mistakes are logged below with the right answer.", "Aim for 12/12."],
  };

  /* =================== LECTURE 2 =================== */
  L["l2-generic"] = {
    sum: "Every EA: make a random population, then repeat <b>Select → Vary → Update</b>.",
    steps: [
      { t: "What are we trying to do?", b: `<p>You have a problem. For any candidate solution <b>s</b> there is a function <b>f(s)</b> that says how good it is. You want the best one, <b>s*</b>, with the highest (or lowest) f.</p>` },
      { t: "Step 0: a random population", b: `<p>Generate a population <b>P</b> of random solutions (typically 100–500) and score each one.</p>`,
        v: chips([["S1", "0.1"], ["S2", "0.5"], ["S3", "0.3"], ["S4", "0.2"], ["S5", "0.9"], ["S6", "0.7"], ["S7", "0.3"], ["S8", "0.4"], ["S9", "0.4"], ["S10", "0.1"]]) },
      { t: "Step 1: Select", b: `<p>Choose some parents, with a bias towards fitter ones. Ways to do it: take the top 10%, pick with probability proportional to fitness, or pick with probability that shrinks with rank.</p>`,
        v: chips([["S5", "0.9", "picked"], ["S9", "0.4", "picked"]]) + `<p class="dim" style="margin-top:8px">The slides pick S5 (best) <i>and</i> S9 (average). Biased, not "best only".</p>` },
      { t: "Step 2: Vary", b: `<p>Apply genetic operators (mutation, recombination) to the parents to make <b>new</b> solutions. Children can be better <i>or worse</i>:</p>`,
        v: chips([["S11", "1.0", "new"], ["S12", "0.2", "new"]]) },
      { t: "Step 3: Update the population", b: `<p>Decide who stays. Three common rules:</p><p>① <b>Replace the entire population</b> with children.<br>② <b>Merge</b> old + new, then keep the best |P|.<br>③ <b>Replace some old</b> with some new (e.g. the weakest).</p>`,
        c: { q: "With rule ② (merge, keep best |P|), can the best solution ever be lost?", o: ["Yes, if the children are bad", "No: the best is always among the top |P|", "Only with mutation"], a: 1, why: "If you keep the best |P| of the merged pool, the current best always survives." } },
      { t: "Then repeat, and the big design questions", b: `<p>Loop Select → Vary → Update until you run out of time. The hard part is the design choices:</p><p><b>How greedy should selection be?</b> Always the best means <i>bad results, quickly</i>. Almost random means <i>great results, too slowly</i>.<br><b>How to encode and how to vary?</b> Small mutation steps are preferred. Recombination is a principled way to take bigger steps. Large random steps are usually terrible.</p>` },
    ],
    guide: ["Press <b>Next stage</b> to walk through the 4 stages using the slide's numbers.", "At stage 4, click each <b>update rule</b> and compare the next population. Which rule loses S5 (0.9)?", "Drag the <b>greediness</b> slider below and read what happens at each extreme."],
  };

  L["l2-optim"] = {
    sum: "Optimisation = find the best solution in a set <b>S</b>, where \"best\" is measured by a <b>fitness function f(s)</b>.",
    steps: [
      { t: "A tiny problem", b: `<p>Three items: <b>20 kg</b>, <b>75 kg</b>, <b>60 kg</b>. Choose a subset whose total weight is <b>as close to 100 kg as possible</b>.</p>` },
      { t: "Write each solution as bits", b: `<p>Use one bit per item: 1 = take it, 0 = leave it. So <code>110</code> means "items 1 and 2". There are 2 × 2 × 2 = <b>8</b> possible solutions. That set is the <b>search space S</b>.</p>`,
        v: row("110", g("110", (i) => (i < 2 ? "good" : "")), "items 1 + 2 = 95 kg") + row("101", g("101", (i) => (i !== 1 ? "good" : "")), "items 1 + 3 = 80 kg") },
      { t: "Score each one with a fitness function", b: `<p>Our score is <b>f(s) = |weight − 100|</b>, how far we are from 100 kg. <b>Smaller is better</b> (a minimisation problem).</p><p><code>110</code>: 95 kg → f = 5.</p>`,
        c: { q: "What is f(<code>101</code>)? (items 1 and 3)", o: ["20", "80", "5", "35"], a: 0, why: "20 + 60 = 80 kg, and |80 − 100| = 20." } },
      { t: "You just did exhaustive search", b: `<p>Try all 8, score each, keep the best: that's <b>exhaustive search</b> (also called <b>enumeration</b>). It's <b>guaranteed</b> to find the optimum: here <code>110</code> with f = 5.</p>` },
      { t: "The catch: S is usually enormous", b: `<p>n items give 2<sup>n</sup> subsets. A real timetable problem (500 exams, 3 weeks) has around <b>10<sup>30</sup></b> candidate timetables. Some spaces are <b>infinite</b> (e.g. all real numbers).</p><span class="key">Enumeration is only possible when S is small. Almost every interesting problem is far too big.</span>`,
        c: { q: "How many subsets do 30 items have?", o: ["60", "900", "2³⁰ ≈ 1 billion"], a: 2, why: "Each item doubles the count: 2<sup>30</sup> ≈ 1.07 × 10<sup>9</sup>." } },
      { t: "Real fitness functions", b: `<p><b>Timetabling</b>: f = number of clashes (minimise).<br><b>Car design</b>: f = distance covered on terrain (maximise).<br><b>Circuits, water networks, antennas</b>: f = how closely the design meets the spec.</p>` },
    ],
    guide: ["Click the item buttons to build subsets. Watch weight and f(s) update.", "Try to find the best subset <i>before</i> revealing. Your tries fill in the table.", "Once you've tried all 8 you've done exhaustive search. Then press Reveal to check."],
  };

  L["l2-complexity"] = {
    sum: "<b>Easy</b> problems: time grows like a polynomial (n²). <b>Hard</b> problems: time grows like an exponential (2ⁿ), which always explodes.",
    steps: [
      { t: "Complexity = how time grows with size", b: `<p>Let <b>n</b> be the size of a problem (number of items, cities…). Complexity asks how the <b>fastest known exact algorithm's</b> time grows as n grows.</p>`,
        v: table(["Problem", "Steps needed"], [["Sort n numbers", "about n log n"], ["Closest pair of n vectors", "about n²"], ["Best alignment of n sequences", "about 2ⁿ"]]) },
      { t: "Polynomial vs exponential", b: `<p><b>Polynomial</b>: n is in the <i>base</i>: n², n³, n log n.<br><b>Exponential</b>: n is in the <i>exponent</i>: 2ⁿ, 1.1ⁿ.</p><span class="analogy">Polynomial is like adding more lanes of traffic. Exponential is like doubling the traffic every time n goes up by one.</span>`,
        v: table(["n", "n²", "2ⁿ"], [["10", "100", "1,024"], ["20", "400", "1,048,576"], ["30", "900", "1,073,741,824"]]) },
      { t: "An exponential always wins eventually", b: `<p>Even a tiny exponential like 1.1ⁿ beats a polynomial like n<sup>1.1</sup>. Small n fools you:</p>`,
        v: table(["n", "1.1ⁿ", "n¹·¹"], [["10", "2.59", "12.6"], ["20", "6.73", "27.0"], { c: ["50", "117", "73.9"], bad: 1 }, { c: ["100", "13,780", "159"], bad: 1 }]),
        c: { q: "At n = 10, 1.1ⁿ is smaller. What happens as n grows?", o: ["It stays smaller forever", "It overtakes n¹·¹ (at about n = 44) and then races away", "They stay equal"], a: 1, why: "Any exponential eventually dominates any polynomial." } },
      { t: "Easy vs hard", b: `<p><b>Easy (tractable)</b>: a polynomial-time exact algorithm is known. Sorting and MST are examples.<br><b>Hard (intractable)</b>: the fastest <i>known</i> exact algorithm is exponential, often not much better than exhaustive search.</p><span class="key">"Hard" means no fast exact method is <b>known</b>. It doesn't mean the search space is big: sorting has n! orderings but is easy.</span>` },
      { t: "Why you should care", b: `<p><b>Almost all important real-world problems are technically hard.</b> Searching all protein structures with 500 amino acids would take trillions of times longer than the age of the universe.</p><p>So for real problems we can't insist on the perfect answer. That's where EAs come in.</p>`,
        c: { q: "Which of these is hard?", o: ["Sorting a list", "Finding an MST", "The travelling salesperson problem"], a: 2, why: "No polynomial exact algorithm is known for TSP. Sorting and MST are easy." } },
    ],
    guide: ["Drag <b>n</b> slowly from 2 to 100 and watch the red (exponential) curve.", "Stop at n = 43 and 44: that's where it overtakes.", "Look at the time table at n = 20, 40 and 60. The easy rows barely change, while the hard rows explode."],
  };

  L["l2-mst"] = {
    sum: "The <b>minimum spanning tree</b> is easy: Prim's algorithm solves it fast and perfectly. Add one real-world constraint and it becomes <b>hard</b>.",
    steps: [
      { t: "The problem", b: `<p>You want to connect 5 towns with cable. Each possible link has a cost. Connect <b>all</b> towns for the <b>lowest total cost</b>.</p><p>Applications: comms network backbones, electricity and water distribution.</p>` },
      { t: "What is a spanning tree?", b: `<p>A <b>spanning tree</b> uses some of the links so that:</p><p>① every town is connected (it <b>spans</b>), and<br>② there are <b>no cycles</b> (no loops, since a loop means a wasted link).</p><span class="key">A spanning tree on n nodes always has exactly <b>n − 1</b> edges.</span>`,
        c: { q: "How many edges does a spanning tree on 5 nodes have?", o: ["5", "4", "10"], a: 1, why: "n − 1 = 4. One fewer and a node is left out. One more and you create a cycle." } },
      { t: "Prim's algorithm (greedy)", b: `<p>① Start from any node.<br>② Look at every edge that connects the tree to a <b>new</b> node.<br>③ Add the <b>cheapest</b> one.<br>④ Repeat until you have n − 1 edges.</p><p>Mini example: A–B 1, B–C 2, A–C 3, C–D 4. Starting at A: take A–B (1), then B–C (2), then C–D (4). Total <b>7</b>.</p>` },
      { t: "Why MST counts as easy", b: `<p>Prim runs in <b>polynomial time</b> and is <b>guaranteed optimal</b>. Being greedy happens to be perfect for this particular problem.</p>` },
      { t: "Add a constraint and everything changes", b: `<p>Real networks have extra rules, e.g. <b>no node may have more than 2 connections</b> (a degree limit), or bandwidth requirements between certain pairs.</p><p>Now many trees are <b>infeasible</b>, greedy choices can paint you into a corner, and no fast exact algorithm is known: the problem is <b>hard</b>.</p><span class="key">Real-world MST-style problems are almost always the constrained, hard kind.</span>`,
        c: { q: "Why does a constraint break Prim's guarantee?", o: ["Prim can't add edges any more", "An early cheap choice can force expensive choices later, and greedy can't undo it", "Constraints make edges cost more"], a: 1, why: "Greedy never looks ahead. You'll see it happen below: greedy gets 20, but 19 is possible." } },
    ],
    guide: ["Click edges to build your own spanning tree (4 edges). The panel tells you if it's valid and optimal.", "Load <b>Slide tree #1</b> (36) and <b>#2</b> (20).", "Press <b>Run Prim step by step</b> repeatedly. Orange dashed edges are the candidates. It ends at 18, the optimum.", "Tick the <b>degree ≤ 2 constraint</b> and run Prim again. It gets 20. Can you find the 19 by hand?"],
  };

  L["l2-approx"] = {
    sum: "For hard problems we use <b>approximate algorithms</b>: good answers in reasonable time, with <b>no guarantee</b> of the best.",
    steps: [
      { t: "Exact algorithms", b: `<p>An <b>exact</b> algorithm is guaranteed to return an optimal solution. For hard problems the fastest known exact methods are basically exhaustive search, which is far too slow.</p>` },
      { t: "How big is \"too slow\"?", b: `<p><b>New York Tunnels</b> (a simplified water network): 21 pipes, 16 possible diameters each.</p><span class="key">16 × 16 × … (21 times) = 16<sup>21</sup> ≈ <b>1.9 × 10<sup>25</sup></b> designs. At a billion per second: ~600 million years.</span>` },
      { t: "Approximate algorithms", b: `<p>They:</p><p>✓ deliver solutions in <b>reasonable time</b><br>✓ find <b>pretty good</b> (near-optimal) solutions, and often optimal ones<br>✗ <b>cannot guarantee</b> that the answer is optimal</p><span class="analogy">A sat-nav finds you a very good route in a second. It doesn't prove there's no better route, and you don't care.</span>`,
        c: { q: "An approximate algorithm returned a solution. What do you know for sure?", o: ["It's optimal", "It's valid and probably good, but it might not be optimal", "It's bad"], a: 1, why: "No guarantee of optimality. That's the price of speed." } },
      { t: "Quality vs time", b: `<p>The lecture's key curve: a <b>simple method gets good solutions fast</b> but levels off. A <b>sophisticated method (like an EA) is slow</b> but gets <b>better solutions eventually</b>.</p>`,
        v: `<svg viewBox="0 0 520 150" style="width:100%;max-width:520px;background:var(--bg-2);border:1px solid var(--line);border-radius:12px"><path d="M30 120 C 50 50, 90 45, 490 42" fill="none" stroke="var(--amber)" stroke-width="3"/><path d="M30 130 C 150 125, 220 60, 490 18" fill="none" stroke="var(--teal)" stroke-width="3"/><text x="300" y="60" fill="var(--amber)" font-size="12">simple: good fast</text><text x="330" y="16" fill="var(--teal)" font-size="12">EA: slow, better later</text><text x="20" y="145" fill="var(--text-faint)" font-size="11">time →</text><text x="4" y="14" fill="var(--text-faint)" font-size="11">quality</text></svg>`,
        c: { q: "You have hours of compute and need the best route possible. Which method?", o: ["The simple fast one", "The EA", "Exhaustive search"], a: 1, why: "With a big time budget the sophisticated method overtakes. With a tiny budget, the simple one wins." } },
      { t: "Where EAs fit", b: `<p><b>EAs are approximate algorithms</b>, and among the most successful and general ones. They often take a while, so get used to that quality-vs-time curve.</p>` },
    ],
    guide: ["Press <b>Run EA</b>.", "At first the EA's tour (teal) is worse than nearest-neighbour (orange dashed line). Watch for the moment it crosses.", "Compare the two tour drawings at the end.", "Press <b>New cities</b> and repeat. Does the crossover always happen?"],
  };

  /* =================== LECTURE 3 =================== */
  L["l3-recipe"] = {
    sum: "Every EA is the same loop: <b>score</b> candidates, <b>pick parents</b>, <b>make children</b>, decide <b>who survives</b>.",
    steps: [
      { t: "The loop at a glance", b: `<p>Lecture 3 opens with this cycle. Everything in Lectures 3 and 4 is a detail of one of these boxes.</p>`,
        v: flow([["Population", "violet"], ["Fitness", "teal"], ["Selection", "amber"], ["Recombination", "violet"], ["Mutation", "rose"], ["Replacement", "teal"]]) + `<p class="dim">…then back to the start.</p>` },
      { t: "Fitness: give each candidate a score", b: `<p>Toy problem <b>OneMax</b>: a solution is a string of bits, and fitness = <b>how many 1s</b> it has. Best possible: all 1s.</p>`,
        v: row("s", g("10110", (i) => ("10110"[i] === "1" ? "good" : "")), "f(s) = 3") },
      { t: "Selection: pick parents (fitter = more likely)", b: `<p>One simple way is a <b>tournament of 2</b>: grab two at random and keep the better one.</p>`,
        v: row("random pick", g("10110"), "f = 3") + row("random pick", g("11101", "good"), "f = 4 → wins, becomes a parent") },
      { t: "Recombination: mix two parents", b: `<p><b>Crossover</b> copies part of parent 1 and the rest from parent 2.</p>`,
        v: row("Parent 1", g("11101", (i) => (i < 2 ? "p1" : ""))) + row("Parent 2", g("00111", (i) => (i >= 2 ? "p2" : ""))) + row("Child", g("11111", (i) => (i < 2 ? "p1" : "p2")), "cut after gene 2") },
      { t: "Mutation: a small random change", b: `<p>Flip one random bit. This is the only step that creates genetic material that neither parent had.</p>`,
        v: row("before", g("11011")) + row("after", g("11111", (i) => (i === 2 ? "changed" : "")), "bit 3 flipped") },
      { t: "Replacement: who survives?", b: `<p>Here: the child replaces the <b>weakest</b> member if it's at least as good. Otherwise it's thrown away.</p>`,
        c: { q: "Which step is <b>blind</b> to fitness (it never looks at scores)?", o: ["Selection", "Mutation", "Replacement"], a: 1, why: "Mutation and crossover just change genes. Selection and replacement use fitness to decide." } },
      { t: "The rest is vocabulary", b: `<p>Different EAs are just different choices for each box: <b>generational vs steady-state</b>, <b>roulette vs rank vs tournament</b> selection, <b>1-point vs uniform</b> crossover, <b>replace weakest vs first weaker</b>. Lecture 4 covers each one.</p>` },
    ],
    guide: ["Press <b>Next stage</b> six times, reading the right-hand panel each time. The diagram highlights where you are.", "Press <b>Auto-play</b> and watch \"best f\" climb towards 8.", "Click a few terms in the vocabulary map at the bottom."],
  };

  L["l3-tsp"] = {
    sum: "TSP: visit every city once and come back, as short as possible. A solution is simply an <b>order of cities</b>.",
    steps: [
      { t: "The problem", b: `<p>A salesperson must visit 5 cities (A–E), each <b>exactly once</b>, and <b>return home</b>. Find the <b>shortest</b> round trip.</p>` },
      { t: "Encoding: a solution is an ordering", b: `<p>Write a tour as a <b>permutation</b> (every city exactly once):</p>`,
        v: row("tour", g("ABDEC")) + `<p class="dim">means A → B → D → E → C → back to A</p>` },
      { t: "Fitness: total distance", b: `<p>Look up each hop in the lecture's distance table and add them up. Shorter is better, so we <b>minimise</b>.</p>`,
        v: NIC.matrixHTML([["A", "B"], ["B", "D"], ["D", "E"], ["E", "C"], ["C", "A"]]) + `<p class="mono" style="margin-top:8px">ABDEC = 5 + 4 + 9 + 7 + 7 = <b>32</b></p>`,
        c: { q: "Using the table, what is the length of <code>ABCDE</code>?", o: ["32", "34", "28"], a: 1, why: "A–B 5 + B–C 3 + C–D 2 + D–E 9 + E–A 15 = 34." } },
      { t: "Same tour, different strings", b: `<p><code>ABDEC</code> and <code>BDECA</code> are the same loop, just started elsewhere. <code>CEDBA</code> is the same loop driven backwards. So several strings describe one tour.</p>` },
      { t: "Too many tours to check", b: `<p>Number of distinct tours = <b>(k − 1)! / 2</b>. 5 cities: 12 tours. 20 cities: about 6 × 10<sup>16</sup>. We can't check them all, so we need search methods like hillclimbing (next).</p>`,
        c: { q: "How many distinct tours do 5 cities have?", o: ["120", "12", "24"], a: 1, why: "(5 − 1)!/2 = 24/2 = 12." } },
    ],
    guide: ["Click cities in order to build a tour. The used distances light up in the table.", "Try to beat 30 by hand, then press <b>Show an optimal tour</b> (28).", "Drag the <b>Cities k</b> slider to see how fast the number of tours explodes."],
  };

  L["l3-hc"] = {
    sum: "Hillclimbing: keep <b>one</b> solution, try a small random change, and <b>keep it if it's not worse</b>. Repeat.",
    steps: [
      { t: "The idea in one sentence", b: `<p>Start somewhere random. Make a small change. If it's no worse, move there. Repeat.</p><span class="analogy">A hiker in thick fog who can only feel the ground under their feet. They take a step. If it's not downhill they stay there, otherwise they step back.</span>` },
      { t: "The 4 steps (from the slides)", b: `<p><b>0.</b> Make a random solution <b>c</b> (the "current" solution) and score it.<br><b>1.</b> Copy c and mutate the copy to get <b>m</b>. Score m.<br><b>2.</b> If f(m) is <b>no worse</b> than f(c), c becomes m. Otherwise throw m away.<br><b>3.</b> Stop if you're out of time, else go to 1.</p><p>It's an EA with a population of <b>one</b>.</p>` },
      { t: "The mutation: swap two neighbours", b: `<p>For TSP, the lecture swaps two <b>adjacent</b> cities. The last and first positions count as adjacent (the tour is a loop).</p>`,
        v: row("current", g("ABDEC")) + row("swap D↔E", g("ABEDC", (i) => (i === 2 || i === 3 ? "changed" : ""))) + row("swap C↔A (wrap)", g("CBDEA", (i) => (i === 0 || i === 4 ? "changed" : ""))) },
      { t: "Worked example from the slides", b: `<p>Current = <code>ABDEC</code> (length 32). Remember: shorter is better.</p>`,
        v: table(["Mutant", "Length", "Decision"], [{ c: ["ABEDC", "33", "worse → reject"], bad: 1 }, { c: ["CBDEA", "38", "worse → reject"], bad: 1 }, { c: ["BADEC", "28", "better → accept"], hl: 1 }, { c: ["BADCE", "28", "equal → accept (no worse)"], hl: 1 }]),
        c: { q: "Why is <code>BADCE</code> (28, same as current) accepted?", o: ["Because it's better", "Because HC keeps anything <b>no worse</b>, and equal counts", "By mistake"], a: 1, why: "Accepting equal moves lets HC wander across flat areas instead of freezing." } },
      { t: "Why \"hill\" climbing?", b: `<p>Line up all solutions so neighbours sit next to each other, and draw fitness as height. HC only ever steps <b>up</b> (or sideways), so it climbs the hill it starts on…</p>`,
        v: curve(multi, { marks: [[0.12, "var(--violet)", "start"], [0.18, "var(--rose)", "stuck on top"], [0.75, "var(--amber)", "★ best"]] }) },
      { t: "The weakness: local optima", b: `<p>…and <b>stops at the top of that hill</b>, even if a much higher mountain exists elsewhere. That top is a <b>local optimum</b>: no neighbour is better, but it isn't the best overall.</p>`,
        c: { q: "HC finds a tour where no single swap helps. Is it the best tour?", o: ["Yes, always", "Not necessarily: it may just be a local optimum", "Only for 5 cities"], a: 1, why: "\"Nothing better nearby\" isn't the same as \"nothing better anywhere\"." } },
    ],
    guide: ["Keep <b>Lecture trace</b> mode and press <b>Mutate & decide</b> 4 times. Check that each decision matches the table in the lesson.", "Switch to <b>Random run</b> and press <b>Run 30 steps</b>.", "Watch the <b>Neighbourhood of c</b> table: green rows are improving moves. When none are left, HC is stuck.", "Press Reset a few times. Does it always end at 28?"],
  };

  L["l3-landscape"] = {
    sum: "A fitness landscape is a picture: solutions along the bottom, fitness as height. Searching means climbing it.",
    steps: [
      { t: "Draw every solution on a line", b: `<p>Place all candidate solutions along the x-axis so that <b>neighbours (one mutation apart) sit next to each other</b>. Plot fitness as height. The result is a <b>landscape</b>.</p>`,
        v: curve(multi, { label: "all candidate solutions, neighbours side by side →" }) },
      { t: "Why it's smooth up close", b: `<p>A small mutation gives a nearby solution, and nearby solutions usually have <b>similar</b> fitness. So up close, landscapes look <b>smooth</b>. That's why small steps work.</p>` },
      { t: "Four shapes to know", b: `<p><b>Unimodal</b>: one peak (easy).<br><b>Multimodal</b>: many peaks (you get stuck).<br><b>Plateau</b>: big flat areas (no hint where to go).<br><b>Deceptive</b>: slopes lead <i>away</i> from the best.</p>`,
        v: `<div class="grid two" style="gap:10px">${curve((x) => bump(x, 0.55, 0.2, 1), { h: 90, label: "unimodal" })}${curve(multi, { h: 90, label: "multimodal" })}${curve((x) => (x < 0.6 ? 0.3 : 0.3 + bump(x, 0.8, 0.06, 0.7)), { h: 90, label: "plateau" })}${curve((x) => (x < 0.85 ? 0.8 * (1 - x / 0.85) + 0.05 : 0.05 + (x - 0.85) / 0.15), { h: 90, label: "deceptive" })}</div>`,
        c: { q: "On which landscape does hillclimbing always find the best?", o: ["Multimodal", "Unimodal", "Deceptive"], a: 1, why: "With one peak, every uphill path leads to it." } },
      { t: "What real landscapes look like", b: `<p>In big real problems, <b>almost everywhere is poor</b>, and the good solutions sit in tiny areas. Real landscapes are <b>locally smooth but globally rugged</b> (multimodal).</p>` },
      { t: "So big mutations are bad", b: `<p>A huge random jump lands you somewhere random, and "somewhere random" is almost always poor. Big mutations throw away the local smoothness that makes search work.</p>`,
        c: { q: "If fitness were completely random (neighbours unrelated), hillclimbing would be…", o: ["great", "no better than random guessing", "impossible to run"], a: 1, why: "HC relies on neighbours being similar. Without that, each mutant is just a random guess." } },
    ],
    guide: ["Pick a landscape type at the top. Click anywhere on the curve to drop the climber there.", "Press <b>Climb</b>. Green = current position, red = rejected mutant, purple = accepted.", "Press <b>Run experiment</b> to see how often it finds the ★ from random starts.", "Change <b>Max mutation step</b> (3 → 40 → 240) and rerun. What happens to locality?"],
  };

  L["l3-neighbourhood"] = {
    sum: "Your <b>neighbourhood</b> = every solution you can reach with <b>one</b> mutation.",
    steps: [
      { t: "Definition", b: `<p>Given a mutation operator M, the <b>neighbourhood</b> of s is the set of <b>all possible mutants</b> of s: every solution one mutation away.</p><span class="analogy">In chess, a knight's neighbourhood is every square it can reach in one move. Change the piece (the operator) and you change which squares are "nearby".</span>` },
      { t: "Example: permutations + adjacent swap", b: `<p><code>EABDC</code> has 5 adjacent pairs (including the wrap-around), so it has <b>5 neighbours</b>:</p>`,
        v: row("s", g("EABDC")) + ["AEBDC", "EBADC", "EADBC", "EABCD", "CABDE"].map((n, k) => row("", g(n, (i) => (i === k || i === (k + 1) % 5 ? "changed" : "")))).join("") },
      { t: "Example: bitstrings + bit flip", b: `<p><code>00110</code> has 5 bits, so it has <b>5 neighbours</b>, one per bit you could flip:</p>`,
        v: row("s", g("00110")) + ["10110", "01110", "00010", "00100", "00111"].map((n, k) => row("", g(n, (i) => (i === k ? "changed" : "")))).join("") },
      { t: "Local optimum = no better neighbour", b: `<p>A solution is a <b>local optimum</b> if <b>none</b> of its neighbours is better. Since the operator defines the neighbours, <b>changing the operator changes which solutions are local optima</b>.</p>`,
        c: { q: "10 cities, adjacent-swap with wrap-around. How many neighbours?", o: ["9", "10", "45"], a: 1, why: "One per adjacent pair around the loop: 10." } },
      { t: "The trade-off", b: `<p>Bigger neighbourhoods (more possible moves) mean <b>fewer local optima</b>, but each step costs more to search and moves are less local. In the extreme case "any solution is my neighbour", you're just doing random search.</p>` },
    ],
    guide: ["In the Permutation tab, type your own string (e.g. <code>ACBED</code>). Each neighbour shows its tour length.", "In the Binary tab, type a bitstring and check that it has L neighbours.", "In the 3-bit cube, pick <b>Trap</b> and switch between flip-1, flip-1-or-2 and flip-any. Watch the gold rings (local optima) change."],
  };

  L["l3-local"] = {
    sum: "Local search = hillclimbing that is <b>sometimes allowed to go downhill</b>, so it can escape small hills.",
    steps: [
      { t: "Two ways to fix hillclimbing", b: `<p>HC gets stuck on the first peak. The lecture gives two fixes:</p><p>① <b>Allow downhill moves</b>. That's <b>local search</b> (this module).<br>② <b>Use a population</b> (next module).</p>` },
      { t: "Keep a \"best so far\"", b: `<p>If we allow worse moves, the current solution can get worse. So local search <b>remembers the best solution seen so far</b>, and that's what it returns at the end.</p>` },
      { t: "Monte Carlo search", b: `<p>① Pick a random neighbour m.<br>② If it's better, move there.<br>③ If it's worse, move there anyway <b>with probability p</b> (e.g. 0.1, so 1 time in 10).</p><span class="analogy">A hiker who usually goes uphill but occasionally takes a step down, just to see what's over there.</span>`,
        c: { q: "Monte Carlo with p = 0 is the same as…", o: ["Tabu search", "Hillclimbing", "Random walk"], a: 1, why: "Never accepting worse moves is exactly HC. p = 1 accepts everything: a random walk." } },
      { t: "Tabu search", b: `<p>① Look at <b>all</b> neighbours.<br>② Move to the <b>best</b> one, <b>even if it's worse</b> than where you are,<br>③ unless it's <b>tabu</b> (visited recently). Then take the next best.</p><span class="analogy">Leaving breadcrumbs you're not allowed to step on again. You're forced to keep walking away from the peak you were stuck on.</span>` },
      { t: "Why the tabu list matters", b: `<p>Without it: at a peak, the best move is one step down. From there, the best move is… straight back up. It would <b>cycle forever</b>. The tabu list blocks the way back.</p>`,
        c: { q: "Do local search methods solve the local optimum problem completely?", o: ["Yes", "No: they get stuck less than HC, but still get stuck", "They make it worse"], a: 1, why: "That's why the lecture then introduces populations." } },
    ],
    guide: ["Press <b>Run</b>. Three racers start from the same place: green = HC, amber = Monte Carlo, purple = Tabu. Diamonds mark each one's best-so-far.", "Watch HC freeze on a peak while the other two keep moving.", "Press <b>Run race</b> to compare success rates over 300 runs.", "Set p to 0, then 1, and rerun the race. Then try Tabu tenure 2 vs 60."],
  };

  L["l3-population"] = {
    sum: "Instead of one explorer, send a <b>team</b>. They cover many hills at once, which makes selection and recombination possible.",
    steps: [
      { t: "Many current solutions", b: `<p>Population-based search keeps a <b>set</b> of current solutions instead of one.</p>`,
        v: curve(multi, { marks: [[0.1, "var(--violet)"], [0.2, "var(--violet)"], [0.42, "var(--violet)"], [0.5, "var(--violet)"], [0.7, "var(--violet)"], [0.78, "var(--violet)"]] }) },
      { t: "New question 1: which one do we mutate?", b: `<p>With several solutions, we have to choose. That's what <b>selection</b> is for: pick parents, biased towards the fitter ones.</p>` },
      { t: "New question 2: can we mix solutions?", b: `<p>With two or more parents available, we're not limited to mutation. We can <b>recombine</b> them (crossover).</p><span class="key">These two differences (selection + recombination) are exactly what makes an EA more than local search.</span>` },
      { t: "Why keep the poor ones?", b: `<p>A low-scoring solution might be at the <b>bottom of the tallest mountain</b>. Keeping it gives it a chance to "develop" and climb.</p>`,
        c: { q: "Why is keeping some weak solutions useful?", o: ["It isn't", "They may be exploring a region that leads to the global best", "They make evaluation faster"], a: 1, why: "Low fitness now doesn't mean low potential." } },
      { t: "The slides' example: a steady-state EA on TSP", b: `<p>Population of 5 tours. Each step: pick a parent → mutate it → if the mutant beats the <b>worst</b> member, it replaces it.</p><p>⚠ The slides have two arithmetic slips (CDAEB is really 34, and ADCEB is really 28). The replay below shows both values.</p>` },
      { t: "Convergence", b: `<p>Over time the population fills up with copies of good solutions. It <b>converges</b>: same genes (genotype), same fitness (phenotype). Some convergence means progress. Too much, too soon means everyone is stuck on one hill.</p>` },
    ],
    guide: ["Press <b>Evolve</b>. Purple dots = the population. The single green dot below is a lone hillclimber for comparison.", "Watch <b>Distinct hills occupied</b>: it starts high and shrinks as the population converges.", "Press <b>Run race</b>, then try Population 2 vs 30.", "Scroll down and step through the <b>slides' TSP replay</b>. Check each number against the table."],
  };

  /* =================== LECTURE 4 =================== */
  L["l4-types"] = {
    sum: "<b>Generational</b>: replace the whole population every round. <b>Steady-state</b>: swap in 1–2 children at a time.",
    steps: [
      { t: "Generational GA", b: `<p>Each generation, use selection and genetic operators to build a <b>completely new population</b>. The old one is discarded.</p><span class="analogy">A school year: the whole class leaves and a new class arrives.</span>`,
        v: chips([["S1", "0.1"], ["S2", "0.5"], ["S3", "0.3"], ["S4", "0.2"], ["S5", "0.9"]]) + `<div class="arrow" style="margin:4px 0">↓ next generation</div>` + chips([["S11", "0.5", "new"], ["S12", "0.3", "new"], ["S13", "0.3", "new"], ["S14", "0.7", "new"], ["S15", "0.7", "new"]]) },
      { t: "Elitism", b: `<p>An <b>elitist</b> generational GA copies the <b>n best</b> into the next generation <b>unchanged</b>, so the best is never lost.</p><span class="analogy">Keeping your star players when the rest of the squad changes.</span>`,
        c: { q: "Generational, no elitism. Can the best fitness go <i>down</i>?", o: ["No", "Yes: all the children might be worse than the old best", "Only with crossover"], a: 1, why: "Everyone is replaced, so the old best disappears unless a child matches it." } },
      { t: "Steady-state GA", b: `<p>Apply the operators just <b>N times</b> (N = 1 or 2) to make a couple of children. They <b>replace weak members</b>, and everyone else stays.</p><span class="analogy">A sports team subbing in one player at a time: the weakest comes off.</span>`,
        v: chips([["S1", "0.1", "target"], ["S2", "0.5"], ["S3", "0.3"], ["S4", "0.2"], ["S5", "0.9"]]) + `<div class="arrow" style="margin:4px 0">↓ one child (0.5) replaces the weakest (0.1)</div>` + chips([["S11", "0.5", "new"], ["S2", "0.5"], ["S3", "0.3"], ["S4", "0.2"], ["S5", "0.9"]]) },
      { t: "Which one when?", b: `<p>Steady-state uses each good child <b>immediately</b>. With replace-weakest it's automatically elitist (the best is never the weakest). Generational changes more at once, which is more exploration, but without elitism it can lose good solutions.</p>`,
        c: { q: "Is steady-state with replace-weakest elitist?", o: ["Yes, the best is never removed", "No", "Only if N = 2"], a: 0, why: "Only the worst ever gets replaced." } },
    ],
    guide: ["In <b>Generational</b> mode press <b>Step</b> a few times. Purple chips are new, and green borders are elites.", "Set <b>Elites kept = 0</b> and press Run. Look for dips in the teal (best) line.", "Switch to <b>Steady-state</b> and step: only 1–2 chips change per step.", "Press <b>Run comparison</b> for the fair head-to-head."],
  };

  L["l4-replacement"] = {
    sum: "In a steady-state GA a new child needs a slot. <b>Replace weakest</b> or <b>replace first weaker</b>: who gets kicked out?",
    steps: [
      { t: "Replace weakest", b: `<p>Look through the <b>whole</b> population, find the <b>worst</b> member, and replace it with the child (if the child is at least as good).</p>`,
        v: chips([["S1", "0.3"], ["S2", "0.5"], ["S3", "0.3"], ["S4", "0.2"], ["S5", "0.9"], ["S6", "0.1", "target"]]) + `<p class="dim" style="margin-top:6px">New child 0.4 → replaces S6 (0.1), the weakest.</p>` },
      { t: "Replace first weaker", b: `<p>Scan from the <b>top</b>. Replace the <b>first</b> member you meet that's weaker than the child, then <b>stop</b>.</p>`,
        v: chips([["S1", "0.3", "target"], ["S2", "0.5"], ["S3", "0.3"], ["S4", "0.2"], ["S5", "0.9"], ["S6", "0.1"]]) + `<p class="dim" style="margin-top:6px">New child 0.4 → S1 (0.3) is already weaker, so it's replaced. Scanning stops, even though S6 is much weaker.</p>`,
        c: { q: "Population 0.6, 0.2, 0.8, 0.1. Child 0.5, replace <b>first weaker</b>. Which slot?", o: ["Slot 2 (0.2)", "Slot 4 (0.1)", "Slot 1 (0.6)"], a: 0, why: "Scan: 0.6 isn't weaker, 0.2 is. Stop at slot 2." } },
      { t: "What's the difference in practice?", b: `<p><b>Replace weakest</b>: greedy, high selection pressure, and the best always survives.<br><b>Replace first weaker</b>: less greedy (weak members can survive longer), keeps more diversity, and it's cheaper because it can stop early.</p>` },
      { t: "A detail in the slides", b: `<p>The slides' "first weaker" example only works if <b>equal fitness counts as weaker</b> (S11 = 0.2 replaces a 0.2). The playground has a checkbox for this.</p>` },
    ],
    guide: ["Choose a strategy at the top, then press <b>Insert next child</b>. The orange highlight shows the scan.", "Reset, switch strategy, and insert the same children. Compare which slots change.", "Untick <b>treat equal as weaker</b> and redo \"first weaker\": S11 lands in a different slot.", "Add random children and predict the slot before you insert."],
  };

  L["l4-pressure"] = {
    sum: "Selection pressure = how strongly selection favours the fittest. <b>Too little</b>: no progress. <b>Too much</b>: stuck early.",
    steps: [
      { t: "What it means", b: `<p>Selection pressure is how much more likely a fit individual is to be picked than an unfit one.</p><span class="analogy">Talent-show judges. Too lenient and everyone goes through, so the show never gets better. Too harsh and only one act goes through, so next year every act copies it.</span>` },
      { t: "Too little pressure", b: `<p>Selection is (nearly) random, so good solutions aren't favoured. The population drifts around: <b>no evolutionary progress</b>.</p>` },
      { t: "Too much pressure", b: `<p>Always picking the best means one individual's copies <b>take over</b> within a few generations. Diversity vanishes, and the population sits on whichever hill that individual was on: <b>premature convergence</b>, often at a local optimum.</p>`,
        c: { q: "Your population becomes identical in 3 generations and stops improving. Diagnosis?", o: ["Too little pressure", "Too much pressure", "Mutation rate too high"], a: 1, why: "Fast takeover plus stagnation is premature convergence." } },
      { t: "The sweet spot", b: `<p>A <b>modest, tunable</b> pressure: fitter individuals are favoured, but weaker ones still get chances. That's why selection methods have knobs (tournament size, rank bias).</p>` },
      { t: "How to read the heatmap below", b: `<p>Each <b>row</b> is a generation (the top row is the start). Each <b>cell</b> is one individual, coloured by fitness: pale = poor, deeper green = fitter, <b style="color:var(--amber)">orange</b> = the best. There's <b>no mutation</b>, so you're watching selection alone copy individuals. The faster orange floods the rows, the higher the pressure.</p>` },
    ],
    guide: ["Click each selection method. The heatmap reruns straight away.", "Compare <b>Random</b> (colours shuffle but no orange takeover) with <b>Always best</b> (instant orange).", "Read the \"share of the original best\" chart for each method.", "Scroll down and press <b>Run experiment</b> to find which tournament size works best."],
  };

  L["l4-roulette"] = {
    sum: "Roulette: your chance of being picked = <b>your fitness ÷ total fitness</b>.",
    steps: [
      { t: "The wheel", b: `<p>Give each individual a slice of a roulette wheel <b>sized by its fitness</b>, then spin.</p><p><b>p<sub>i</sub> = f<sub>i</sub> / (sum of all f)</b></p><p>Example: fitnesses 2, 3, 5 (total 10):</p>`,
        v: bars([["f = 2", 20], ["f = 3", 30], ["f = 5", 50]]) },
      { t: "Problem 1: superfit individuals", b: `<p>Fitnesses <b>100</b>, 0.4, 0.3, 0.2, 0.1. The best gets 100/101 ≈ <b>99%</b> of the wheel and will take over immediately.</p>`,
        v: bars([["f = 100", 99, "var(--rose)"], ["f = 0.4", 0.4], ["f = 0.3", 0.3], ["f = 0.2", 0.2], ["f = 0.1", 0.1]]) },
      { t: "Problem 2: it depends on the exact numbers", b: `<p>Add 100 to every fitness: 200, 100.4, 100.3, 100.2, 100.1. The ranking is the same, but now the best only gets 200/601 ≈ <b>33%</b>.</p><span class="key">Roulette depends on <b>absolute</b> fitness values, so you have to design the fitness numbers very carefully.</span>`,
        c: { q: "Fitnesses 1, 1, 2. What's the chance of picking the individual with fitness 2?", o: ["33%", "50%", "66%"], a: 1, why: "2 / (1 + 1 + 2) = 2/4 = 50%." } },
      { t: "Problem 3: minimising and negatives", b: `<p>If <b>smaller is better</b> (like tour length), roulette favours the <i>worst</i> solutions. If any fitness is <b>negative</b>, you can't have a negative slice. Either way you'd have to transform the fitness first.</p>` },
    ],
    guide: ["Press <b>Spin</b> a few times. The table shows each p<sub>i</sub>.", "Press <b>Spin 1,000×</b>: the observed bars (green) should match the expected ones (grey).", "Click the <b>Superfit</b> preset, then <b>Superfit + 100</b>. Watch the wheel change.", "Try <b>Negatives</b> and <b>TSP lengths</b> to see roulette break."],
  };

  L["l4-rank"] = {
    sum: "Rank selection ignores <b>how much</b> better you are. Only your <b>position</b> in the ranking counts.",
    steps: [
      { t: "Step 1: sort and rank", b: `<p>Sort the population. The best gets rank <b>P</b> (the population size), the next gets P − 1, …, and the worst gets rank <b>1</b>.</p>`,
        v: table(["fitness", "rank"], [["100", "4"], ["0.4", "3"], ["0.3", "2"], ["0.2", "1"]]) },
      { t: "Step 2: probability ∝ rank", b: `<p><b>p<sub>i</sub> = rank<sub>i</sub> / (sum of ranks)</b>, and the sum of ranks = <b>P(P+1)/2</b>. For P = 4: sum = 10.</p>`,
        v: bars([["rank 4", 40], ["rank 3", 30], ["rank 2", 20], ["rank 1", 10]]) + `<p class="dim" style="margin-top:6px">The superfit 100 now gets 40%, not 99%.</p>`,
        c: { q: "Population of 5, linear rank. Chance of picking the best?", o: ["5/15 = 33%", "1/5 = 20%", "5/10 = 50%"], a: 0, why: "Sum = 5·6/2 = 15, and the best has rank 5, so 5/15." } },
      { t: "Why it's robust", b: `<p>Only the order matters, so superfit individuals, negative values and scaling tricks don't matter. For minimising, just rank the other way.</p>` },
      { t: "The bias knob: rank<sup>b</sup>", b: `<p>Use <b>rank<sup>b</sup></b> instead of rank. <b>b = 2</b> (high bias): 16, 9, 4, 1 out of 30, so the best gets 53%. <b>b = 0.5</b> (low bias) evens things out. <b>b = 0</b>: everyone equal.</p>`,
        v: bars([["rank 4 (b=2)", 53.3, "var(--violet)"], ["rank 3", 30, "var(--violet)"], ["rank 2", 13.3, "var(--violet)"], ["rank 1", 3.3, "var(--violet)"]]),
        c: { q: "Increasing b does what to selection pressure?", o: ["Lowers it", "Raises it", "Nothing"], a: 1, why: "Top ranks get a disproportionately bigger share." } },
    ],
    guide: ["Load the <b>Superfit</b> preset and compare the grey (roulette) and green (rank) bars.", "Drag the <b>bias exponent</b> from 0 to 3. Watch the best's share grow.", "Try the <b>TSP lengths</b> preset: the minimise box ticks itself and rank handles it."],
  };

  L["l4-tournament"] = {
    sum: "Tournament: grab <b>t</b> random individuals, and the best of them wins. Bigger t = tougher competition.",
    steps: [
      { t: "The procedure", b: `<p>To pick <b>one</b> parent: choose <b>t</b> individuals at random (<b>with replacement</b>, so the same one can be drawn twice) and return the <b>fittest</b> of them.</p>` },
      { t: "Example", b: `<p>Population fitnesses: #1 = 3, #2 = 8, #3 = 5, #4 = 1. Tournament size t = 2.</p>`,
        v: chips([["#1", "3", "picked"], ["#2", "8"], ["#3", "5", "winner"], ["#4", "1"]]) + `<p class="dim" style="margin-top:6px">Drew #1 (3) and #3 (5) → #3 wins. #2 (the best) wasn't even drawn this time.</p>` },
      { t: "t controls the pressure", b: `<p><b>t = 1</b>: one random pick, so it's pure random selection (no pressure).<br><b>t = 2</b>: mild pressure.<br><b>Large t</b>: the winner is almost always near the top (high pressure).</p>`,
        c: { q: "Tournament size t = 1 is the same as…", o: ["Always picking the best", "Random selection", "Roulette"], a: 1, why: "One contestant always wins its own tournament." } },
      { t: "Quick maths: how often does the best win?", b: `<p>The best wins if it's drawn at least once: <b>P(best) = 1 − (1 − 1/P)<sup>t</sup></b>.</p><p>P = 4, t = 2: 1 − (3/4)² = 1 − 9/16 = <b>7/16 ≈ 44%</b>.</p>` },
      { t: "Pros and cons (from the slides)", b: `<p>✓ Tunable. ✓ Avoids superfit and superpoor problems (it only compares). ✓ Simple and fast, with no sorting needed.<br>✗ One more parameter (t) to tune.</p>`,
        c: { q: "Does tournament selection work with negative fitness values?", o: ["No", "Yes, it only compares which is bigger", "Only with t = 1"], a: 1, why: "Comparisons don't care about sign or scale." } },
    ],
    guide: ["Press <b>Run one tournament</b> and watch the t picks (amber), then the winner (green).", "Press <b>Run 5,000</b>: the green bars match the grey theory bars.", "Drag <b>t</b> from 1 to 10 and watch the probabilities shift towards the top ranks.", "Read the stats on the right: P(best wins), P(worst wins)."],
  };

  L["l4-mutation"] = {
    sum: "How you write a solution down (its <b>encoding</b>) decides which mutations make sense.",
    steps: [
      { t: "Encodings", b: `<p>A solution's "chromosome" can be:</p>`,
        v: table(["Encoding", "Example"], [["Binary string", "<code>0110 1001</code>"], ["Integer / k-ary vector", "<code>[3, 5, 2, 8, 7, 2]</code>"], ["Real-valued vector", "<code>(0.3, 0.2, 0.4)</code>"], ["Permutation", "<code>DEGJACBFIH</code>"], ["Tree", "programs (genetic programming, later)"]]) },
      { t: "What a good operator does", b: `<p><b>Exploitation</b>: small changes, so new solutions have a fair chance of being good.<br><b>Exploration</b>: we must be able, in principle, to reach <i>anywhere</i> in the space.</p>` },
      { t: "Integer (k-ary) mutation", b: `<p><b>Single-gene</b>: pick one gene and set it to a random new value. <b>M-gene</b>: do that M times.</p>`,
        v: row("before", g("352872")) + row("single-gene", g("312872", (i) => (i === 1 ? "changed" : "")), "5 → 1") + row("swap", g("372852", (i) => (i === 1 || i === 4 ? "changed" : "")), "only reorders"),
        c: { q: "Why is <b>swap</b> a poor mutation for k-ary encodings?", o: ["It's slow", "It never creates a value that isn't already there", "It creates duplicates"], a: 1, why: "If no gene is 9, swapping can never make a 9. That's a failure of exploration." } },
      { t: "Real-valued mutation", b: `<p>Add a small random number (usually from a <b>Gaussian</b> / bell curve) to one gene, or add a small random vector to all genes. The size of the noise (σ) is the step size.</p>`,
        v: row("before", g(["0.30", "0.20", "0.40"])) + row("after", g(["0.30", "0.27", "0.40"], (i) => (i === 1 ? "changed" : "")), "+0.07") },
      { t: "Permutation mutation", b: `<p>Every city must appear <b>exactly once</b>. Single-gene mutation breaks that. Swap keeps it valid.</p>`,
        v: row("before", g("DEGJA")) + row("single-gene", g("DEGDA", (i) => (i === 0 || i === 3 ? "bad" : "")), "D twice, J missing ✗") + row("swap", g("DAGJE", (i) => (i === 1 || i === 4 ? "good" : "")), "still valid ✓"),
        c: { q: "Which mutation suits a TSP tour?", o: ["Single-gene random value", "Swap two cities", "Add Gaussian noise"], a: 1, why: "Swap rearranges without duplicating or losing cities." } },
    ],
    guide: ["In the <b>k-ary</b> tab, press Single-gene, M-gene and Swap. Watch the \"values present\" line: swap never adds new ones.", "In <b>Real-valued</b>, drag σ and watch the cloud of mutants grow.", "In <b>Permutation</b>, press Single-gene (it turns red: invalid), then Swap (valid).", "In <b>Binary</b>, press Mutate 1,000× to see how many bits flip on average."],
  };

  L["l4-crossover"] = {
    sum: "Crossover makes a child by <b>mixing two parents' genes</b>, using cut points or a random mask.",
    steps: [
      { t: "1-point crossover", b: `<p>Pick one cut position. Child 1 = parent 1 <b>before</b> the cut + parent 2 <b>after</b> it. Child 2 is the opposite.</p>`,
        v: row("Parent 1", g("ABCDEFGH", "p1")) + row("Parent 2", g("KLMNOPQR", "p2")) + row("Child 1", g("ABCDEPQR", (i) => (i < 5 ? "p1" : "p2")), "cut after 5") + row("Child 2", g("KLMNOFGH", (i) => (i < 5 ? "p2" : "p1"))) },
      { t: "2-point (and k-point) crossover", b: `<p>Two cuts: keep the outside from one parent and swap the middle. k-point extends this with k cuts, alternating segments.</p>`,
        v: row("Parent 1", g("ABCDEFGH", "p1")) + row("Parent 2", g("KLMNOPQR", "p2")) + row("Child 1", g("ABMNOPGH", (i) => (i >= 2 && i < 6 ? "p2" : "p1")), "cuts after 2 and 6") },
      { t: "Uniform crossover", b: `<p>Flip a coin for <b>every gene</b>: a random <b>mask</b>, where 1 = swap this gene and 0 = keep it.</p>`,
        v: row("Parent 1", g("ABCDEFGH", "p1")) + row("Parent 2", g("KLMNOPQR", "p2")) + row("Mask", g("01001101")) + row("Child 1", g("ALCDOPGR", (i) => ("01001101"[i] === "1" ? "p2" : "p1"))),
        c: { q: "P1 = ABCD, P2 = WXYZ, mask 1010. Child 1?", o: ["WBYD", "AXCZ", "WXCD"], a: 0, why: "Swap positions 1 and 3: W B Y D." } },
      { t: "Limits of crossover", b: `<p>Crossover only <b>recombines</b> existing genes. It can't invent a value neither parent has (that's mutation's job).</p><p>And it must fit the encoding: 1-point crossover on <b>permutations</b> creates duplicate cities.</p>`,
        v: row("Parent 1", g("ABCDE", "p1")) + row("Parent 2", g("EDCBA", "p2")) + row("Child", g("ABCBA", (i) => (i >= 3 ? "bad" : "p1")), "B and A twice, D and E missing ✗"),
        c: { q: "Why can't plain 1-point crossover be used on TSP tours?", o: ["It's too slow", "It produces invalid tours with repeated and missing cities", "It never changes anything"], a: 1, why: "Permutations need special crossover operators (coming in the next lecture)." } },
    ],
    guide: ["Pick <b>1-point</b> and click different genes in a parent to move the cut. The children update live.", "Pick <b>Uniform</b> and click mask bits to flip them.", "Tick <b>use permutation parents</b> and try a few cuts. Red genes are duplicates, which means an invalid tour."],
  };

  L["l4-lab"] = {
    sum: "Put everything together: pick an algorithm, tune the knobs, and watch it evolve a picture.",
    steps: [
      { t: "The problem", b: `<p>A solution is a 12×12 black/white picture = <b>144 bits</b>. Fitness = the <b>fraction of pixels that match</b> the target. 1.0 means a perfect copy.</p>` },
      { t: "Lecture algorithm 1 (in plain words)", b: `<p><b>Steady-state, mutation-only, replace-worst, tournament selection.</b> Each step: run a tournament to pick a parent, mutate a copy, and if it's not worse than the worst member, it replaces the worst.</p>`,
        v: flow([["Tournament", "amber"], ["Mutate copy", "rose"], ["Beat the worst?", ""], ["Replace worst", "teal"]]) },
      { t: "Lecture algorithm 2 (in plain words)", b: `<p><b>Generational, elitist, crossover + mutation, rank-based selection.</b> Each generation: rank-select 2·(P−1) parents, pair them up, cross over (with probability cross_rate) and mutate to get P−1 children. Keep the single best old member and add all the children.</p>`,
        v: flow([["Rank-select parents", "amber"], ["Crossover", "violet"], ["Mutate", "rose"], ["Best old + children", "teal"]]) },
      { t: "How to read the dashboard", b: `<p><b style="color:var(--teal)">best</b>: fitness of the best member. <b style="color:var(--violet)">mean</b>: population average. <b style="color:var(--amber)">diversity</b>: how different members are from each other (1 = all different, 0 = all identical).</p><p>The small thumbnails are the population, best first. Red outlines on "Best so far" mark wrong pixels.</p>`,
        c: { q: "Diversity has dropped to 0 and mutation is off. What can still change?", o: ["Crossover can still find new pixels", "Nothing: every member is identical, and crossover of identical parents gives the same child", "Selection adds new pixels"], a: 1, why: "Mutation is the only source of new genetic material." } },
    ],
    guide: ["Pick <b>Lecture algo 1</b> and press <b>Run</b>. Note the evaluation count when it hits 144/144.", "Pick <b>Lecture algo 2</b>, reset, and run it. Which is faster here?", "Try the experiments listed below the lab one at a time. Change <b>one</b> knob per run."],
  };
  /* ---------- lesson figures (added to steps that had text only) ---------- */
  const FG = NIC.fig;
  const addV = (id, i, v) => { if (L[id] && L[id].steps[i] && !L[id].steps[i].v) L[id].steps[i].v = v; };
  const bumpsXY = (x, y) => [[0.25, 0.3, 0.09, 0.55], [0.7, 0.72, 0.08, 1], [0.72, 0.25, 0.07, 0.45], [0.3, 0.78, 0.07, 0.5], [0.5, 0.5, 0.05, 0.35]].reduce((s, [cx, cy, w, h]) => s + h * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * w * w)), 0.04);
  const qualityVsTime = FG.plot([{ f: (t) => (t < 0.85 ? 0.05 : 1), c: "violet", label: "exact: perfect, but only at the end" }, { f: (t) => 0.9 * (1 - Math.exp(-7 * t)), c: "teal", label: "nature-inspired: good, early" }], { x: [0, 1], y: [0, 1.1], xl: "time →", yl: "solution quality", h: 180 });

  // ---- Lecture 1
  addV("l1-what", 1, FG.cells([{ v: "🧬 evolution", sub: "→ evolutionary algorithms", c: "teal" }, { v: "🧠 brains", sub: "→ neural networks", c: "violet" }, { v: "🐜 swarms", sub: "→ ant colony, particle swarm", c: "amber" }], { size: 170 }));
  addV("l1-what", 2, FG.compare({ title: "Engineered systems", c: "violet", body: "a designer plans every part, top-down" }, { title: "Natural systems", c: "teal", body: "<b>no one in charge</b>: simple parts plus feedback produce clever results" }));
  addV("l1-what", 4, qualityVsTime);
  addV("l1-monkey", 0, FG.flow([{ t: "problem", s: "climb a smooth wall" }, { t: "evolution", s: "millions of generations", c: "violet" }, { t: "gecko feet 🦎", s: "solved", c: "teal" }]));
  addV("l1-monkey", 2, FG.bars([["monkey (random)", 40, "rose", "≈ 10⁴⁰ tries"], ["keep-if-better", 3.4, "teal", "a few thousand"]], { max: 40, fmt: () => "" }) + `<div class="fig-cap">Bar length ∝ number of digits in the try count. The gap is 36 orders of magnitude.</div>`);
  addV("l1-monkey", 4, curve(multi, { marks: [[0.45, "var(--rose)", "stuck here"], [0.75, "var(--amber)", "★ best"]], label: "every possible solution →" }));
  addV("l1-ingredients", 0, FG.cells([{ v: "1 population", sub: "required", c: "teal" }, { v: "2 biased selection + mutation", sub: "required", c: "teal" }, { v: "3 recombination", sub: "optional", c: "violet" }], { size: 170 }));
  addV("l1-apps", 0, FG.flow([{ t: "candidate", s: "any design" }, { t: "fitness function", s: "\"how good is it?\"", c: "amber" }, { t: "a number", s: "that's all an EA needs", c: "teal" }]));
  addV("l1-apps", 2, FG.cells([{ v: "🚗 car shapes", sub: "airflow sim" }, { v: "📡 NASA antenna", sub: "beat human designs", c: "teal" }, { v: "📅 timetables", sub: "fewest clashes" }, { v: "💧 water networks", sub: "meet the spec" }], { size: 130 }));

  // ---- Lecture 2
  addV("l2-generic", 0, curve(multi, { marks: [[0.75, "var(--amber)", "s* (the best)"], [0.3, "var(--violet)", "some s"]], label: "candidate solutions s →" }) + `<div class="fig-cap">Height = f(s). Optimisation = find the highest point (or the lowest, for minimising).</div>`);
  addV("l2-generic", 4, FG.frames([
    { t: "① all children replace all parents", v: chips([["c1", 5, "new"], ["c2", 3, "new"], ["c3", 7, "new"]]) },
    { t: "② merge, keep the best |P|", v: chips([["p1", 9, "elite"], ["c3", 7, "new"], ["p2", 6]]) },
    { t: "③ replace some: e.g. only the weakest", v: chips([["p1", 9], ["p2", 6], ["c3", 7, "new"]]) },
  ]));
  addV("l2-generic", 5, FG.plot([{ f: (t) => 0.55 * (1 - Math.exp(-25 * t)), c: "rose", label: "always pick the best" }, { f: (t) => 0.95 * t * t, c: "violet", dash: "5 4", label: "almost random" }, { f: (t) => 0.9 * (1 - Math.exp(-5 * t)), c: "teal", label: "balanced" }], { x: [0, 1], y: [0, 1], xl: "time →", yl: "best found", h: 190 }));
  addV("l2-optim", 0, FG.cells([{ v: "20 kg", sub: "item 1" }, { v: "75 kg", sub: "item 2" }, { v: "60 kg", sub: "item 3" }, "→", { v: "≈ 100 kg?", c: "amber" }], { size: 70 }));
  addV("l2-optim", 2, `<table class="t" style="max-width:420px"><tr><th>subset</th><th class="num">weight</th><th class="num">f = |w − 100|</th></tr>${[["000", 0], ["001", 60], ["010", 75], ["011", 135], ["100", 20], ["101", 80], ["110", 95], ["111", 155]].map(([b, w]) => `<tr class="${b === "110" ? "hl" : ""}"><td class="mono">${b}</td><td class="num">${w}</td><td class="num">${Math.abs(w - 100)}</td></tr>`).join("")}</table>`);
  addV("l2-optim", 3, FG.bars([["000", 100, "dim"], ["001", 40, "dim"], ["010", 25, "dim"], ["011", 35, "dim"], ["100", 80, "dim"], ["101", 20, "dim"], ["110", 5, "teal", "best"], ["111", 55, "dim"]], { max: 100 }) + `<div class="fig-cap">Score all 8, keep the smallest f. Guaranteed optimal, but only because 8 is tiny.</div>`);
  addV("l2-optim", 4, FG.bars([["3 items: 2³", 0.9, "teal", "8"], ["30 items: 2³⁰", 9, "amber", "≈ 10⁹"], ["timetable", 30, "rose", "≈ 10³⁰"]], { max: 30, fmt: () => "" }) + `<div class="fig-cap">Bar length = number of digits. Each extra item doubles the search space.</div>`);
  addV("l2-optim", 5, `<table class="t" style="max-width:520px"><tr><th>problem</th><th>fitness</th><th>goal</th></tr><tr><td>timetabling</td><td>number of clashes</td><td>minimise</td></tr><tr><td>car design</td><td>distance on terrain</td><td>maximise</td></tr><tr><td>antenna / circuit / network</td><td>how close to the spec</td><td>maximise</td></tr></table>`);
  addV("l2-complexity", 3, FG.plot([{ f: (n) => n ** 3, c: "teal", label: "n³ (easy)" }, { f: (n) => 2 ** n, c: "rose", label: "2ⁿ (hard)" }], { x: [1, 14], y: [0, 3000], xl: "problem size n", yl: "steps", h: 190 }) + `<div class="fig-cap">Exponential looks harmless at first, then leaves any polynomial behind for good.</div>`);
  addV("l2-complexity", 4, FG.compare({ title: "Technically hard", c: "rose", body: "timetabling, routing, scheduling, protein folding: <b>no fast exact method known</b>" }, { title: "So in practice", c: "teal", body: "use methods that find <b>very good</b> answers in reasonable time" }));
  const TOWNS = { A: [60, 60], B: [200, 40], C: [330, 80], D: [120, 190], E: [290, 200] };
  const TL = [["A", "B", 4], ["B", "C", 3], ["A", "D", 2], ["D", "E", 5], ["C", "E", 2], ["B", "D", 6], ["B", "E", 7]];
  addV("l2-mst", 0, FG.graph({ nodes: TOWNS, edges: TL, w: 400, h: 240 }) + `<div class="fig-cap">Every line is a possible cable with its cost.</div>`);
  addV("l2-mst", 1, FG.compare({ title: "Spanning tree ✓", c: "teal", body: "5 towns, <b>4 links</b>, all connected, no loops" }, { title: "Has a loop ✗", c: "rose", body: "one link in the loop is wasted: remove it and everything stays connected" }));
  addV("l2-mst", 2, FG.frames([
    { t: "Start at A. Cheapest edge out: A–B (1)", v: FG.cells([{ v: "A", c: "teal" }, "→", { v: "B", c: "amber", sub: "1" }]) },
    { t: "From {A,B}: B–C (2) beats A–C (3)", v: FG.cells([{ v: "AB", c: "teal" }, "→", { v: "C", c: "amber", sub: "2" }]) },
    { t: "From {A,B,C}: C–D (4). Total = 7", v: FG.cells([{ v: "ABC", c: "teal" }, "→", { v: "D", c: "amber", sub: "4" }]) },
  ]));
  addV("l2-mst", 3, FG.cells([{ v: "polynomial time", c: "teal" }, { v: "guaranteed optimal", c: "teal" }, "→", { v: "easy problem", c: "teal" }], { size: 130 }));
  addV("l2-mst", 4, FG.compare({ title: "Plain MST", c: "teal", body: "greedy Prim is <b>optimal</b>" }, { title: "Degree ≤ 2 constraint", c: "rose", body: "a cheap early edge can block the only feasible trees: <b>hard</b>" }));
  addV("l2-approx", 0, FG.compare({ title: "Exact", c: "violet", body: "guaranteed optimum, but for hard problems basically exhaustive search" }, { title: "Approximate", c: "teal", body: "good answers fast, but <b>no guarantee</b> they're optimal" }));
  addV("l2-approx", 1, FG.cells([{ v: "16", sub: "diameters" }, "^", { v: "21", sub: "pipes" }, "=", { v: "1.9 × 10²⁵", c: "rose" }, "→", { v: "≈ 600 million years", sub: "at 10⁹ per second", c: "rose" }], { size: 60 }));
  addV("l2-approx", 2, FG.cells([{ v: "✓ reasonable time", c: "teal" }, { v: "✓ near-optimal (often optimal)", c: "teal" }, { v: "✗ no guarantee", c: "rose" }], { size: 150 }));
  addV("l2-approx", 4, qualityVsTime);

  // ---- Lecture 3
  addV("l3-recipe", 5, FG.frames([
    { t: "child 7 vs weakest 4 → replace", v: chips([["p1", 9], ["p2", 6], ["c", 7, "new"]]) },
    { t: "child 3 vs weakest 4 → discard", v: chips([["p1", 9], ["p2", 6], ["p3", 4, "target"]]) },
  ]));
  addV("l3-recipe", 6, `<table class="t" style="max-width:560px"><tr><th>box</th><th>common choices</th></tr><tr><td>algorithm type</td><td>generational · steady-state</td></tr><tr><td>selection</td><td>roulette · rank · tournament</td></tr><tr><td>crossover</td><td>1-point · uniform · none</td></tr><tr><td>replacement</td><td>replace weakest · first weaker</td></tr></table>`);
  addV("l3-tsp", 0, NIC.tspSVG("ABCDE", { allEdges: true, maxH: 250 }));
  addV("l3-tsp", 3, FG.cells([{ v: "ABDEC", c: "teal" }, "=", { v: "BDECA", c: "teal", sub: "start elsewhere" }, "=", { v: "CEDBA", c: "teal", sub: "reversed" }], { size: 70 }));
  addV("l3-tsp", 4, FG.bars([["5 cities", 12, "teal", "12 tours"], ["10 cities", 181440, "amber", "181,440"], ["20 cities", 6.08e16, "rose", "≈ 6 × 10¹⁶"]], { max: 6.08e16, fmt: () => "" }) + `<div class="fig-cap">(k − 1)! / 2 grows so fast the smaller bars vanish: 20 cities is already hopeless to enumerate.</div>`);
  addV("l3-hc", 0, curve(multi, { marks: [[0.33, "var(--violet)", "🥾 feels the slope"], [0.75, "var(--amber)", "★"]], label: "every possible solution →" }));
  addV("l3-hc", 1, FG.cycle([{ t: "current c", c: "teal" }, { t: "mutate → m", c: "violet" }, { t: "f(m) ≥ f(c)?", c: "amber" }, { t: "keep better", c: "teal" }]));
  addV("l3-hc", 5, curve(multi, { marks: [[0.45, "var(--rose)", "local optimum: stuck"], [0.75, "var(--amber)", "global optimum"]], label: "every possible solution →" }));
  addV("l3-landscape", 1, FG.plot([{ f: (x) => 0.5 + 0.3 * Math.sin(x * 2) + 0.05 * Math.sin(x * 9), c: "teal", fill: true }], { x: [0, 1.2], xl: "zoomed in: neighbours have similar fitness", h: 150 }));
  addV("l3-landscape", 3, (box, life) => { FG.surface3d(box, life, { f: bumpsXY, height: 280, points: [{ x: 0.25, y: 0.3, c: "#ff4b4b", label: "local peak" }, { x: 0.7, y: 0.72, c: "#ff9600", label: "global peak" }] }); box.insertAdjacentHTML("beforeend", `<div class="fig-cap">A 2-D landscape: mostly flat and poor, with a few peaks. A hill-climber starting near the red peak never sees the gold one.</div>`); });
  addV("l3-landscape", 4, FG.compare({ title: "Small mutation", c: "teal", body: "lands <b>next door</b>, so probably similar and often better" }, { title: "Huge jump", c: "rose", body: "lands <b>anywhere</b>, and anywhere is almost always poor" }));
  addV("l3-neighbourhood", 0, FG.cells([{ v: "1010", c: "amber", sub: "s" }]) + FG.cells([{ v: "0010" }, { v: "1110" }, { v: "1000" }, { v: "1011" }], { label: "flip one bit:" }) + `<div class="fig-cap">With bit-flip mutation, a 4-bit string has exactly 4 neighbours.</div>`);
  addV("l3-neighbourhood", 3, curve(multi, { marks: [[0.18, "var(--rose)", "local"], [0.45, "var(--rose)", "local"], [0.75, "var(--amber)", "global"]], label: "each peak = no better neighbour" }));
  addV("l3-neighbourhood", 4, FG.compare({ title: "Small neighbourhood", c: "teal", body: "cheap steps, but <b>more</b> local optima to get stuck on" }, { title: "Huge neighbourhood", c: "violet", body: "fewer local optima, but each step is costly and less local" }));
  addV("l3-local", 0, FG.compare({ title: "Fix ① allow downhill moves", c: "violet", body: "local search: Monte Carlo, tabu" }, { title: "Fix ② use a population", c: "teal", body: "evolutionary algorithms (next module)" }));
  addV("l3-local", 1, FG.plot([{ pts: [0, 3, 2, 5, 4, 3, 6, 5, 4, 7, 6].map((v, i) => [i, v]), c: "violet", label: "current" }, { pts: [0, 3, 3, 5, 5, 5, 6, 6, 6, 7, 7].map((v, i) => [i, v]), c: "teal", dash: "5 4", label: "best so far" }], { x: [0, 10], y: [0, 8], xl: "iteration", h: 170 }));
  addV("l3-local", 2, FG.bars([["better neighbour", 100, "teal", "always accept"], ["worse neighbour", 10, "amber", "accept with p = 0.1"]], { max: 100, fmt: () => "" }));
  addV("l3-local", 3, FG.frames([
    { t: "Look at all neighbours", v: FG.cells([{ v: "5" }, { v: "8", c: "rose", sub: "tabu" }, { v: "6", c: "teal" }]) },
    { t: "Best (8) is tabu → take 6, even if worse than now", v: FG.cells([{ v: "6", c: "teal", sub: "move" }]) },
  ]));
  addV("l3-local", 4, FG.cells([{ v: "peak", c: "amber" }, "→", { v: "step down" }, "→", { v: "peak", c: "amber" }, "→", { v: "step down" }, "→", { v: "…forever", c: "rose" }]) + `<div class="fig-cap">Without a tabu list, the best move from just below the peak is straight back up.</div>`);
  addV("l3-population", 1, chips([["t1", 32], ["t2", 29, "picked"], ["t3", 34], ["t4", 28, "picked"], ["t5", 31]]) + `<div class="fig-cap">Selection picks parents, biased toward the fitter ones (here, shorter tours).</div>`);
  addV("l3-population", 2, row("Parent 1", g("11001", "p1")) + row("Parent 2", g("00111", "p2")) + row("Child", g("110", "p1") + g("11", "p2"), "head of 1 + tail of 2") + `<div class="fig-cap">Bit strings can be spliced freely. Tours (permutations) need special crossovers, or a city would appear twice.</div>`);
  addV("l3-population", 3, curve(multi, { marks: [[0.62, "var(--violet)", "low now…"], [0.75, "var(--amber)", "…but next to the ★"]], label: "keeping weak members keeps options open" }));
  addV("l3-population", 5, FG.compare({ title: "Healthy convergence", c: "teal", body: "gradually fills with copies of good solutions" }, { title: "Premature convergence", c: "rose", body: "everyone identical early, stuck on a mediocre hill" }));

  // ---- Lecture 4
  addV("l4-types", 1, chips([["best", 9, "elite"], ["c1", 5, "new"], ["c2", 7, "new"], ["c3", 4, "new"]]) + `<div class="fig-cap">The elite (green outline) survives unchanged; everyone else is replaced.</div>`);
  addV("l4-types", 3, FG.compare({ title: "Steady-state", c: "teal", body: "one child at a time, used immediately; with replace-weakest it's automatically elitist" }, { title: "Generational", c: "violet", body: "whole new generation at once: more exploration, add elitism so the best isn't lost" }));
  addV("l4-replacement", 2, FG.compare({ title: "Replace weakest", c: "rose", body: "greedy · high pressure · best always survives" }, { title: "Replace first weaker", c: "teal", body: "gentler · keeps diversity · cheaper (stops scanning early)" }));
  addV("l4-replacement", 3, FG.cells([{ v: 0.3 }, { v: 0.5 }, { v: 0.2, c: "amber", sub: "= child?" }, { v: 0.9 }], { label: "child 0.2 →" }) + `<div class="fig-cap">The slides only work if a tie counts as weaker.</div>`);
  addV("l4-pressure", 0, FG.plot([{ f: (g) => 0.3 + 0.15 * g, c: "violet", dash: "5 4", label: "too little" }, { f: (g) => 0.3 + 0.62 * (1 - Math.exp(-0.6 * g)), c: "teal", label: "just right" }, { f: (g) => 0.3 + 0.35 * (1 - Math.exp(-2.5 * g)), c: "rose", label: "too much" }], { x: [0, 4], y: [0.2, 1], xl: "generations →", yl: "best fitness", h: 190 }));
  addV("l4-pressure", 1, FG.cells([{ v: "5" }, { v: "3" }, { v: "7" }, { v: "4" }, { v: "6" }], { label: "random picks:" }) + `<div class="fig-cap">Every individual equally likely: the fit ones get no advantage, so nothing improves.</div>`);
  addV("l4-pressure", 2, FG.frames([
    { t: "generation 0: varied", v: chips([["", 5], ["", 9, "winner"], ["", 3], ["", 7]]) },
    { t: "generation 3: all copies of one", v: chips([["", 9, "winner"], ["", 9, "winner"], ["", 9, "winner"], ["", 9, "winner"]]) },
  ]));
  addV("l4-pressure", 3, FG.cells([{ v: "tournament size t" }, { v: "rank bias" }, { v: "elitism count" }], { label: "pressure knobs:", size: 120 }));
  addV("l4-roulette", 2, FG.compare({ title: "Fitness 100, 0.4, 0.3, 0.2, 0.1", c: "rose", body: FG.bars([["best", 99, "rose", "%"]], { max: 100 }) }, { title: "Same +100 each", c: "violet", body: FG.bars([["best", 33, "violet", "%"]], { max: 100 }) }));
  addV("l4-roulette", 3, FG.compare({ title: "Minimising (tour length)", c: "rose", body: "longest tour gets the <b>biggest</b> slice: the worst are favoured" }, { title: "Negative fitness", c: "rose", body: "a slice can't have negative size: roulette breaks" }));
  addV("l4-rank", 2, FG.bars([["rank 4 (best)", 40, "teal", "%"], ["rank 3", 30, "teal", "%"], ["rank 2", 20, "teal", "%"], ["rank 1", 10, "teal", "%"]], { max: 40 }) + `<div class="fig-cap">Probability = rank / (1+2+3+4). The actual fitness numbers never appear.</div>`);
  addV("l4-tournament", 0, FG.frames([
    { t: "draw t = 2 at random (with replacement)", v: chips([["", 5, "picked"], ["", 2], ["", 8, "picked"], ["", 3]]) },
    { t: "the fitter of the two wins", v: chips([["winner", 8, "winner"]]) },
  ]));
  addV("l4-tournament", 2, FG.bars([["t = 1", 25, "violet", "%"], ["t = 2", 43.75, "teal", "%"], ["t = 3", 57.8, "amber", "%"], ["t = 5", 76.3, "rose", "%"]], { max: 100 }) + `<div class="fig-cap">Chance the best of 4 wins its tournament. Bigger t = more pressure.</div>`);
  addV("l4-tournament", 3, FG.cells([{ v: "1 − (3/4)²" }, "=", { v: "1 − 9/16" }, "=", { v: "7/16 ≈ 44%", c: "teal" }], { size: 80 }));
  addV("l4-tournament", 4, FG.compare({ title: "Pros", c: "teal", body: "tunable · only compares (no superfit problems) · no sorting" }, { title: "Cons", c: "rose", body: "one more parameter, t, to tune" }));
  addV("l4-mutation", 1, FG.compare({ title: "Exploitation", c: "teal", body: "small changes: the child is probably still good" }, { title: "Exploration", c: "violet", body: "able, in principle, to reach <b>anywhere</b> in the space" }));
  addV("l4-lab", 0, `<div class="pixel-grid target" style="grid-template-columns:repeat(12,1fr);max-width:180px">${"000000000000011100011100111110111110111111111111111111111111111111111111011111111110001111111100000111111000000011110000000001100000000000000000".split("").map((b) => `<i class="${b === "1" ? "on" : ""}"></i>`).join("")}</div><div class="fig-cap" style="text-align:left">Target: a 12 × 12 heart = 144 bits. Fitness = fraction of matching pixels.</div>`);
})();

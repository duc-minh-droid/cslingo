(function () {
  const partScope = (NIC.shared.lessons = NIC.shared.lessons || {});
  const { bump, chips, curve, g, multi, row, table } = partScope;
  const L = NIC.LESSONS;

  L["l3-hc"] = {
    sum: "Hillclimbing: keep <b>one</b> solution, try a small random change, and <b>keep it if it's not worse</b>. Repeat.",
    steps: [
      {
        t: "The idea in one sentence",
        b: `<p>Start somewhere random. Make a small change. If it's no worse, move there. Repeat.</p><span class="analogy">A hiker in thick fog who can only feel the ground under their feet. They take a step. If it's not downhill they stay there, otherwise they step back.</span>`,
      },
      {
        t: "The 4 steps (from the slides)",
        b: `<p><b>0.</b> Make a random solution <b>c</b> (the "current" solution) and score it.<br><b>1.</b> Copy c and mutate the copy to get <b>m</b>. Score m.<br><b>2.</b> If f(m) is <b>no worse</b> than f(c), c becomes m. Otherwise throw m away.<br><b>3.</b> Stop if you're out of time, else go to 1.</p><p>It's an EA with a population of <b>one</b>.</p>`,
      },
      {
        t: "The mutation: swap two neighbours",
        b: `<p>For TSP, the lecture swaps two <b>adjacent</b> cities. The last and first positions count as adjacent (the tour is a loop).</p>`,
        v:
          row("current", g("ABDEC")) +
          row(
            "swap D↔E",
            g("ABEDC", (i) => (i === 2 || i === 3 ? "changed" : "")),
          ) +
          row(
            "swap C↔A (wrap)",
            g("CBDEA", (i) => (i === 0 || i === 4 ? "changed" : "")),
          ),
      },
      {
        t: "Worked example from the slides",
        b: `<p>Current = <code>ABDEC</code> (length 32). Remember: shorter is better.</p>`,
        v: table(
          ["Mutant", "Length", "Decision"],
          [
            { c: ["ABEDC", "33", "worse → reject"], bad: 1 },
            { c: ["CBDEA", "38", "worse → reject"], bad: 1 },
            { c: ["BADEC", "28", "better → accept"], hl: 1 },
            { c: ["BADCE", "28", "equal → accept (no worse)"], hl: 1 },
          ],
        ),
        c: {
          q: "Why is <code>BADCE</code> (28, same as current) accepted?",
          o: [
            "Because it's shorter than the current tour",
            "Because HC keeps anything no worse, and equal counts",
            "Because HC accepts every mutant it tries",
          ],
          a: 1,
          why: "Accepting equal moves lets HC wander across flat areas instead of freezing.",
        },
      },
      {
        t: 'Why "hill" climbing?',
        b: `<p>Line up all solutions so neighbours sit next to each other, and draw fitness as height. HC only ever steps <b>up</b> (or sideways), so it climbs the hill it starts on…</p>`,
        v: curve(multi, {
          marks: [
            [0.12, "var(--violet)", "start"],
            [0.18, "var(--rose)", "stuck on top"],
            [0.75, "var(--amber)", "★ best"],
          ],
        }),
      },
      {
        t: "The weakness: local optima",
        b: `<p>…and <b>stops at the top of that hill</b>, even if a much higher mountain exists elsewhere. That top is a <b>local optimum</b>: no neighbour is better, but it isn't the best overall.</p>`,
        c: {
          q: "HC finds a tour where no single swap helps. Is it the best tour?",
          o: ["Yes, always", "Not necessarily", "Only for 5 cities"],
          a: 1,
          why: '"Nothing better nearby" isn\'t the same as "nothing better anywhere".',
        },
      },
    ],
    guide: [
      "Keep <b>Lecture trace</b> mode and press <b>Mutate & decide</b> 4 times. Check that each decision matches the table in the lesson.",
      "Switch to <b>Random run</b> and press <b>Run 30 steps</b>.",
      "Watch the <b>Neighbourhood of c</b> table: green rows are improving moves. When none are left, HC is stuck.",
      "Press Reset a few times. Does it always end at 28?",
    ],
  };

  L["l3-landscape"] = {
    sum: "A fitness landscape is a picture: solutions along the bottom, fitness as height. Searching means climbing it.",
    steps: [
      {
        t: "Draw every solution on a line",
        b: `<p>Place all candidate solutions along the x-axis so that <b>neighbours (one mutation apart) sit next to each other</b>. Plot fitness as height. The result is a <b>landscape</b>.</p>`,
        v: curve(multi, { label: "all candidate solutions, neighbours side by side →" }),
      },
      {
        t: "Why it's smooth up close",
        b: `<p>A small mutation gives a nearby solution, and nearby solutions usually have <b>similar</b> fitness. So up close, landscapes look <b>smooth</b>. That's why small steps work.</p>`,
      },
      {
        t: "Four shapes to know",
        b: `<p><b>Unimodal</b>: one peak (easy).<br><b>Multimodal</b>: many peaks (you get stuck).<br><b>Plateau</b>: big flat areas (no hint where to go).<br><b>Deceptive</b>: slopes lead <i>away</i> from the best.</p>`,
        v: `<div class="grid two" style="gap:10px">${curve((x) => bump(x, 0.55, 0.2, 1), { h: 90, label: "unimodal" })}${curve(multi, { h: 90, label: "multimodal" })}${curve((x) => (x < 0.6 ? 0.3 : 0.3 + bump(x, 0.8, 0.06, 0.7)), { h: 90, label: "plateau" })}${curve((x) => (x < 0.85 ? 0.8 * (1 - x / 0.85) + 0.05 : 0.05 + (x - 0.85) / 0.15), { h: 90, label: "deceptive" })}</div>`,
        c: {
          q: "On which landscape does hillclimbing always find the best?",
          o: ["Multimodal", "Unimodal", "Deceptive"],
          a: 1,
          why: "With one peak, every uphill path leads to it.",
        },
      },
      {
        t: "What real landscapes look like",
        b: `<p>In big real problems, <b>almost everywhere is poor</b>, and the good solutions sit in tiny areas. Real landscapes are <b>locally smooth but globally rugged</b> (multimodal).</p>`,
      },
      {
        t: "So big mutations are bad",
        b: `<p>A huge random jump lands you somewhere random, and "somewhere random" is almost always poor. Big mutations throw away the local smoothness that makes search work.</p>`,
        c: {
          q: "If fitness were completely random (neighbours unrelated), hillclimbing would be…",
          o: ["much better than random guessing", "no better than random guessing", "impossible to run at all"],
          a: 1,
          why: "HC relies on neighbours being similar. Without that, each mutant is just a random guess.",
        },
      },
    ],
    guide: [
      "Pick a landscape type at the top. Click anywhere on the curve to drop the climber there.",
      "Press <b>Climb</b>. Green = current position, red = rejected mutant, purple = accepted.",
      "Press <b>Run experiment</b> to see how often it finds the ★ from random starts.",
      "Change <b>Max mutation step</b> (3 → 40 → 240) and rerun. What happens to locality?",
    ],
  };

  L["l3-neighbourhood"] = {
    sum: "Your <b>neighbourhood</b> = every solution you can reach with <b>one</b> mutation.",
    steps: [
      {
        t: "Definition",
        b: `<p>Given a mutation operator M, the <b>neighbourhood</b> of s is the set of <b>all possible mutants</b> of s: every solution one mutation away.</p><span class="analogy">In chess, a knight's neighbourhood is every square it can reach in one move. Change the piece (the operator) and you change which squares are "nearby".</span>`,
      },
      {
        t: "Example: permutations + adjacent swap",
        b: `<p><code>EABDC</code> has 5 adjacent pairs (including the wrap-around), so it has <b>5 neighbours</b>:</p>`,
        v:
          row("s", g("EABDC")) +
          ["AEBDC", "EBADC", "EADBC", "EABCD", "CABDE"]
            .map((n, k) =>
              row(
                "",
                g(n, (i) => (i === k || i === (k + 1) % 5 ? "changed" : "")),
              ),
            )
            .join(""),
      },
      {
        t: "Example: bitstrings + bit flip",
        b: `<p><code>00110</code> has 5 bits, so it has <b>5 neighbours</b>, one per bit you could flip:</p>`,
        v:
          row("s", g("00110")) +
          ["10110", "01110", "00010", "00100", "00111"]
            .map((n, k) =>
              row(
                "",
                g(n, (i) => (i === k ? "changed" : "")),
              ),
            )
            .join(""),
      },
      {
        t: "Local optimum = no better neighbour",
        b: `<p>A solution is a <b>local optimum</b> if <b>none</b> of its neighbours is better. Since the operator defines the neighbours, <b>changing the operator changes which solutions are local optima</b>.</p>`,
        c: {
          q: "10 cities, adjacent-swap with wrap-around. How many neighbours?",
          o: ["9", "10", "45"],
          a: 1,
          why: "One per adjacent pair around the loop: 10.",
        },
      },
      {
        t: "The trade-off",
        b: `<p>Bigger neighbourhoods (more possible moves) mean <b>fewer local optima</b>, but each step costs more to search and moves are less local. In the extreme case "any solution is my neighbour", you're just doing random search.</p>`,
      },
    ],
    guide: [
      "In the Permutation tab, type your own string (e.g. <code>ACBED</code>). Each neighbour shows its tour length.",
      "In the Binary tab, type a bitstring and check that it has L neighbours.",
      "In the 3-bit cube, pick <b>Trap</b> and switch between flip-1, flip-1-or-2 and flip-any. Watch the gold rings (local optima) change.",
    ],
  };

  L["l3-local"] = {
    sum: "Local search = hillclimbing that is <b>sometimes allowed to go downhill</b>, so it can escape small hills.",
    steps: [
      {
        t: "Two ways to fix hillclimbing",
        b: `<p>HC gets stuck on the first peak. The lecture gives two fixes:</p><p>① <b>Allow downhill moves</b>. That's <b>local search</b> (this module).<br>② <b>Use a population</b> (next module).</p>`,
      },
      {
        t: 'Keep a "best so far"',
        b: `<p>If we allow worse moves, the current solution can get worse. So local search <b>remembers the best solution seen so far</b>, and that's what it returns at the end.</p>`,
      },
      {
        t: "Monte Carlo search",
        b: `<p>① Pick a random neighbour m.<br>② If it's better, move there.<br>③ If it's worse, move there anyway <b>with probability p</b> (e.g. 0.1, so 1 time in 10).</p><span class="analogy">A hiker who usually goes uphill but occasionally takes a step down, just to see what's over there.</span>`,
        c: {
          q: "Monte Carlo with p = 0 is the same as…",
          o: ["Tabu search", "Hillclimbing", "Random walk"],
          a: 1,
          why: "Never accepting worse moves is exactly HC. p = 1 accepts everything: a random walk.",
        },
      },
      {
        t: "Tabu search",
        b: `<p>① Look at <b>all</b> neighbours.<br>② Move to the <b>best</b> one, <b>even if it's worse</b> than where you are,<br>③ unless it's <b>tabu</b> (visited recently). Then take the next best.</p><span class="analogy">Leaving breadcrumbs you're not allowed to step on again. You're forced to keep walking away from the peak you were stuck on.</span>`,
      },
      {
        t: "Why the tabu list matters",
        b: `<p>Without it: at a peak, the best move is one step down. From there, the best move is… straight back up. It would <b>cycle forever</b>. The tabu list blocks the way back.</p>`,
        c: {
          q: "Do local search methods solve the local optimum problem completely?",
          o: [
            "Yes: allowing downhill moves fixes it for good",
            "No: they get stuck less than HC, but still get stuck",
            "No: they get stuck more often than HC does",
          ],
          a: 1,
          why: "That's why the lecture then introduces populations.",
        },
      },
    ],
    guide: [
      "Press <b>Run</b>. Three racers start from the same place: green = HC, amber = Monte Carlo, purple = Tabu. Diamonds mark each one's best-so-far.",
      "Watch HC freeze on a peak while the other two keep moving.",
      "Press <b>Run race</b> to compare success rates over 300 runs.",
      "Set p to 0, then 1, and rerun the race. Then try Tabu tenure 2 vs 60.",
    ],
  };

  L["l3-population"] = {
    sum: "Instead of one explorer, send a <b>team</b>. They cover many hills at once, which makes selection and recombination possible.",
    steps: [
      {
        t: "Many current solutions",
        b: `<p>Population-based search keeps a <b>set</b> of current solutions instead of one.</p>`,
        v: curve(multi, {
          marks: [
            [0.1, "var(--violet)"],
            [0.2, "var(--violet)"],
            [0.42, "var(--violet)"],
            [0.5, "var(--violet)"],
            [0.7, "var(--violet)"],
            [0.78, "var(--violet)"],
          ],
        }),
      },
      {
        t: "New question 1: which one do we mutate?",
        b: `<p>With several solutions, we have to choose. That's what <b>selection</b> is for: pick parents, biased towards the fitter ones.</p>`,
      },
      {
        t: "New question 2: can we mix solutions?",
        b: `<p>With two or more parents available, we're not limited to mutation. We can <b>recombine</b> them (crossover).</p><span class="key">These two differences (selection + recombination) are exactly what makes an EA more than local search.</span>`,
      },
      {
        t: "Why keep the poor ones?",
        b: `<p>A low-scoring solution might be at the <b>bottom of the tallest mountain</b>. Keeping it gives it a chance to "develop" and climb.</p>`,
        c: {
          q: "Why is keeping some weak solutions useful?",
          o: [
            "It isn't: they only waste evaluations",
            "They may be exploring a region that leads to the best",
            "They make each generation faster to evaluate",
          ],
          a: 1,
          why: "Low fitness now doesn't mean low potential.",
        },
      },
      {
        t: "The slides' example: a steady-state EA on TSP",
        b: `<p>Population of 5 tours. Each step: pick a parent → mutate it → if the mutant beats the <b>worst</b> member, it replaces it.</p><p>⚠ The slides have two arithmetic slips (CDAEB is really 34, and ADCEB is really 28). The replay below shows both values.</p>`,
      },
      {
        t: "Convergence",
        b: `<p>Over time the population fills up with copies of good solutions. It <b>converges</b>: same genes (genotype), same fitness (phenotype). Some convergence means progress. Too much, too soon means everyone is stuck on one hill.</p>`,
      },
    ],
    guide: [
      "Press <b>Evolve</b>. Purple dots = the population. The single green dot below is a lone hillclimber for comparison.",
      "Watch <b>Distinct hills occupied</b>: it starts high and shrinks as the population converges.",
      "Press <b>Run race</b>, then try Population 2 vs 30.",
      "Scroll down and step through the <b>slides' TSP replay</b>. Check each number against the table.",
    ],
  };

  /* =================== LECTURE 4 =================== */
  L["l4-types"] = {
    sum: "<b>Generational</b>: replace the whole population every round. <b>Steady-state</b>: swap in 1–2 children at a time.",
    steps: [
      {
        t: "Generational GA",
        b: `<p>Each generation, use selection and genetic operators to build a <b>completely new population</b>. The old one is discarded.</p><span class="analogy">A school year: the whole class leaves and a new class arrives.</span>`,
        v:
          chips([
            ["S1", "0.1"],
            ["S2", "0.5"],
            ["S3", "0.3"],
            ["S4", "0.2"],
            ["S5", "0.9"],
          ]) +
          `<div class="arrow" style="margin:4px 0">↓ next generation</div>` +
          chips([
            ["S11", "0.5", "new"],
            ["S12", "0.3", "new"],
            ["S13", "0.3", "new"],
            ["S14", "0.7", "new"],
            ["S15", "0.7", "new"],
          ]),
      },
      {
        t: "Elitism",
        b: `<p>An <b>elitist</b> generational GA copies the <b>n best</b> into the next generation <b>unchanged</b>, so the best is never lost.</p><span class="analogy">Keeping your star players when the rest of the squad changes.</span>`,
        c: {
          q: "Generational, no elitism. Can the best fitness go <i>down</i>?",
          o: [
            "No: selection always keeps the best individual around",
            "Yes: every child might be worse than the old best",
            "Only when crossover is switched on and mixes the best away",
          ],
          a: 1,
          why: "Everyone is replaced, so the old best disappears unless a child matches it.",
        },
      },
      {
        t: "Steady-state GA",
        b: `<p>Apply the operators just <b>N times</b> (N = 1 or 2) to make a couple of children. They <b>replace weak members</b>, and everyone else stays.</p><span class="analogy">A sports team subbing in one player at a time: the weakest comes off.</span>`,
        v:
          chips([
            ["S1", "0.1", "target"],
            ["S2", "0.5"],
            ["S3", "0.3"],
            ["S4", "0.2"],
            ["S5", "0.9"],
          ]) +
          `<div class="arrow" style="margin:4px 0">↓ one child (0.5) replaces the weakest (0.1)</div>` +
          chips([
            ["S11", "0.5", "new"],
            ["S2", "0.5"],
            ["S3", "0.3"],
            ["S4", "0.2"],
            ["S5", "0.9"],
          ]),
      },
      {
        t: "Which one when?",
        b: `<p>Steady-state uses each good child <b>immediately</b>. With replace-weakest it's automatically elitist (the best is never the weakest). Generational changes more at once, which is more exploration, but without elitism it can lose good solutions.</p>`,
        c: {
          q: "Is steady-state with replace-weakest elitist?",
          o: [
            "Yes: the best is never the one removed",
            "No: the best can be replaced by a child",
            "Only when the population size is 2",
          ],
          a: 0,
          why: "Only the worst ever gets replaced.",
        },
      },
    ],
    guide: [
      "In <b>Generational</b> mode press <b>Step</b> a few times. Purple chips are new, and green borders are elites.",
      "Set <b>Elites kept = 0</b> and press Run. Look for dips in the teal (best) line.",
      "Switch to <b>Steady-state</b> and step: only 1–2 chips change per step.",
      "Press <b>Run comparison</b> for the fair head-to-head.",
    ],
  };
})();

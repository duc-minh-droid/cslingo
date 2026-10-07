/* l6-04: Lecture 6: 6.4 symbolic regression, 6.5 preparatory steps. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const sh = (NIC.shared.l6 = NIC.shared.l6 || {});
  const { table, mulberry, fn, tm, clone, evalT, randomProgram, mutate, crossover, sx } = sh;

  /* ============ 6.4 Symbolic regression ============ */
  const TARGET = (x) => x * x + x + 1;
  const XS41 = Array.from({ length: 41 }, (_, i) => -1 + i * 0.05);
  const areaErr = (t) => {
    let s = 0;
    for (let i = 0; i < 40; i++) {
      const a = XS41[i],
        b = XS41[i + 1];
      s += (Math.abs(evalT(t, { X: a }) - TARGET(a)) + Math.abs(evalT(t, { X: b }) - TARGET(b))) * 0.025;
    }
    return s;
  };
  const GEN0 = [fn("+", tm("X"), tm(1)), fn("+", fn("*", tm("X"), tm("X")), tm(1)), tm(2), tm("X")];
  const FS_REG = ["+", "-", "*", "%"];

  function runGP({ pop, gens, seed, maxD = 7 }) {
    const r = mulberry(seed);
    let P = Array.from({ length: pop }, () =>
      randomProgram(r, 1 + Math.floor(r() * 3) + 1, FS_REG, [() => "X", () => "X", () => Math.floor(r() * 5) - 2]),
    );
    const TSr = [() => "X", () => "X", () => Math.floor(r() * 5) - 2];
    const hist = [];
    let best = null,
      bestE = Infinity,
      found = -1;
    for (let g = 0; g <= gens; g++) {
      const fit = P.map(areaErr);
      let bi = 0;
      fit.forEach((e, i) => {
        if (e < fit[bi]) bi = i;
      });
      if (fit[bi] < bestE) {
        bestE = fit[bi];
        best = clone(P[bi]);
      }
      hist.push(bestE);
      if (bestE < 0.1) {
        found = g;
        break;
      }
      if (g === gens) break;
      const tour = () => {
        let b = Math.floor(r() * P.length);
        for (let k = 1; k < 3; k++) {
          const c = Math.floor(r() * P.length);
          if (fit[c] < fit[b]) b = c;
        }
        return P[b];
      };
      const next = [clone(best)];
      while (next.length < pop) {
        const u = r();
        if (u < 0.8) {
          const x = crossover(r, tour(), tour(), maxD);
          next.push(x.kids[0]);
          if (next.length < pop) next.push(x.kids[1]);
        } else if (u < 0.9) next.push(mutate(r, tour(), maxD, FS_REG, TSr).tree);
        else next.push(clone(tour()));
      }
      P = next;
    }
    return { best, bestE, hist, found };
  }

  N.register({
    id: "l6-regress",
    lecture: 6,
    order: 4,
    num: "6.4",
    title: "Symbolic regression",
    blurb: "Evolve a formula that fits data. Change the population size and see how fast it finds x² + x + 1.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "<b>Symbolic regression:</b> find a program of one input X whose output matches the data. Terminals are X and random constants; functions are +, −, × and a protected division (written %). <b>Fitness</b> is the total absolute difference from the data over many X values between −1 and +1. A run stops when the error is below 0.1.",
        ),
      );
      const data = XS41.filter((_, i) => i % 4 === 0);
      const card = el(
        `<div class="card"><div class="card-head"><h2>Generation 0 of the lecture (4 individuals)</h2></div><div id="g0"></div></div>`,
      );
      root.appendChild(card);
      const errs = GEN0.map(areaErr);
      qs("#g0", card).innerHTML =
        `<div class="fig-bars">${GEN0.map((t, i) => `<div class="fb-row"><span class="fb-l mono">${["x + 1", "x² + 1", "2", "x"][i]}</span><span class="fb-track"><span class="fb-fill" style="--w:${errs[i] / 3};background:${i === 0 ? "var(--teal)" : "var(--blue)"}"></span></span><span class="fb-v">${errs[i].toFixed(2)}</span></div>`).join("")}</div><p class="dim">Error against the hidden target (lower is better). The data come from x² + x + 1, so <b>x + 1</b> is closest.</p>` +
        table(["x", ...data.map((x) => x.toFixed(1))], [["y", ...data.map((x) => TARGET(x).toFixed(2))]]);
      const run = el(
        `<div class="card"><div class="card-head"><h2>Run GP</h2></div><div class="controls" id="c"></div><canvas class="viz" id="cv"></canvas><div id="out"></div></div>`,
      );
      root.appendChild(run);
      let pop = 100,
        gens = 40,
        seed = 1;
      const sP = N.slider("Population size", 4, 400, 4, pop),
        sG = N.slider("Generations", 5, 60, 5, gens);
      sP.onInput((v) => (pop = v));
      sG.onInput((v) => (gens = v));
      const bGo = el(`<button class="btn primary">Run</button>`);
      qs("#c", run).append(sP, sG, bGo);
      bGo.onclick = () => {
        const res = runGP({ pop, gens, seed: seed++ });
        const C = N.colors();
        N.lineChart(qs("#cv", run), {
          series: [{ data: res.hist, color: C.teal }],
          height: 170,
          names: ["best error"],
          xLabel: "generation",
          yMin: 0,
        });
        const pts = (f) =>
          XS41.map(
            (x, i) => `${(10 + i * 8).toFixed(1)},${(110 - Math.max(-0.4, Math.min(3.4, f(x))) * 30).toFixed(1)}`,
          ).join(" ");
        qs("#out", run).innerHTML =
          `<p>${res.found >= 0 ? `<b>Solved in generation ${res.found}</b> (error ${res.bestE.toFixed(3)}).` : `No program under 0.1 after ${gens} generations. Best error <b>${res.bestE.toFixed(2)}</b>.`} Seed ${seed - 1}.</p><p class="mono" style="word-break:break-all">${sx(res.best)}</p>
          <svg viewBox="0 0 340 120" style="width:100%;max-width:340px;background:var(--bg-2);border:1px solid var(--line);border-radius:12px"><polyline points="${pts(TARGET)}" fill="none" stroke="var(--text-faint)" stroke-width="3" stroke-dasharray="5 4"/><polyline points="${pts((x) => evalT(res.best, { X: x }))}" fill="none" stroke="var(--teal)" stroke-width="2.5"/></svg><p class="dim">Grey dashed: the target. Green: the best program found.</p>`;
      };
      bGo.click();
      root.appendChild(
        predict({
          id: "l6-reg-1",
          q: "In generation 0 the four candidates are x + 1, x² + 1, 2 and x. Which has the <b>lowest</b> error against the target x² + x + 1?",
          opts: ["x + 1", "x² + 1", "2", "x"],
          a: 0,
          why: "x + 1 differs from the target by exactly x², a small bump (error 0.67). x² + 1 is off by |x| (1.00); the constant 2 and plain x are further away (1.70 and 2.67).",
        }),
      );
      root.appendChild(
        predict({
          id: "l6-reg-2",
          q: "Run GP with population 4, then with population 200. Which finds a good program more reliably?",
          opts: [
            "Population 200, since there is more variety to recombine",
            "Population 4, since it runs faster per generation",
            "Both are equally reliable, as size does not matter",
          ],
          a: 0,
          why: "A tiny population has little material to cross and mutate, and can get stuck. A larger one covers more of the space of programs in each generation, at the price of more evaluations.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Fitness = total absolute difference between the program's output and the data, over many X values. Lower is better.",
            "Run a loop: random trees → evaluate → select → crossover/mutate → repeat, until the error is under the threshold.",
            "The same EA loop works on formulas: x² + x + 1 can emerge from random trees.",
          ],
          "Evolve a formula by scoring its error against data and recombining the best trees.",
        ),
      );
    },
  });

  L["l6-regress"] = {
    sum: "A worked GP run: evolve a formula that matches data by minimising its error.",
    steps: [
      {
        t: "The task",
        b: `<p>Find a program with one input X whose output equals the given data. Here the hidden function is <b>x² + x + 1</b> and the data are 11 points from X = −1 to +1.</p>`,
        v: table(
          ["x", "−1.0", "−0.6", "−0.2", "0.2", "0.6", "1.0"],
          [["y", "1.00", "0.76", "0.84", "1.24", "1.96", "3.00"]],
        ),
        c: {
          q: "What is symbolic regression?",
          o: ["Finding a formula that fits data", "Finding the shortest path in a graph", "Compressing a program"],
          a: 0,
          why: "The output is a program (formula), not just a set of numbers.",
        },
      },
      {
        t: "The five choices",
        b: `<p><b>Terminals:</b> X and random constants. <b>Functions:</b> +, −, ×, % (protected division). <b>Fitness:</b> the sum of absolute differences between the program's output and the data, over many X values in [−1, 1]. <b>Parameters:</b> population size M = 4 in the lecture example. <b>Termination:</b> error below 0.1.</p>`,
        v: table(
          ["Choice", "Value"],
          [
            ["Terminals", "X, random constants"],
            ["Functions", "+, −, ×, %"],
            ["Fitness", "sum of absolute errors"],
            ["Parameters", "population M = 4"],
            ["Termination", "error &lt; 0.1"],
          ],
        ),
        c: {
          q: "Why is division “protected”?",
          o: [
            "So dividing by zero returns a harmless value, not a crash",
            "So that it can only be applied to integer constants",
            "So that it is chosen less often than the other operators",
          ],
          a: 0,
          why: "Random trees can divide by zero; a protected version returns, say, 1.",
        },
      },
      {
        t: "Generation 0",
        b: `<p>Four random programs and their errors (area between curve and target): <b>x + 1 → 0.67</b>, <b>x² + 1 → 1.00</b>, <b>2 → 1.70</b>, <b>x → 2.67</b>.</p>`,
        v: F.bars(
          [
            ["x + 1", 0.67, "teal"],
            ["x² + 1", 1.0, "blue"],
            ["2", 1.7, "blue"],
            ["x", 2.67, "blue"],
          ],
          { max: 3 },
        ),
        c: {
          q: "Which candidate is fittest in generation 0?",
          o: ["x + 1 (error 0.67)", "x alone (error 2.67)", "2 alone (error 1.70)"],
          a: 0,
          why: "Fitness here is an error, so the lowest number wins.",
        },
      },
      {
        t: "Generation 1",
        b: `<p>The next generation is made with the usual operators: a <b>copy</b> of the best, a <b>mutant</b> of another individual, and two <b>crossover</b> offspring from picking nodes in two parents. A few generations later a program with error under 0.1 appears: <b>x² + x + 1</b>.</p>`,
        v: F.flow([
          "Generation 0",
          "Copy the best",
          "Mutate one",
          "Cross two parents",
          { t: "Generation 1", c: "teal" },
        ]),
        c: {
          q: "How does GP make generation 1?",
          o: [
            "Copying, mutation and crossover applied to generation 0",
            "It starts again with four new random programs",
            "It picks the best program and stops",
          ],
          a: 0,
          why: "Same EA loop as before, on trees.",
        },
      },
    ],
    guide: [
      "Look at the four generation-0 errors.",
      "Press <b>Run</b> with the default population.",
      "Set the population to 4 and press <b>Run</b> a few times.",
      "Answer the questions after the demo.",
    ],
  };

  /* ============ 6.5 Preparatory steps and sufficiency ============ */
  function reachable(Fs, Ts, maxDepth) {
    const key = (v) => v.map((x) => Math.round(x * 1e4) / 1e4).join(",");
    const XS = XS41,
      tv = {
        X: { v: XS.slice(), e: "X" },
        1: { v: XS.map(() => 1), e: "1" },
        2: { v: XS.map(() => 2), e: "2" },
      };
    const ops = {
      "+": (a, b) => a + b,
      "-": (a, b) => a - b,
      "*": (a, b) => a * b,
      "%": (a, b) => (Math.abs(b) < 1e-6 ? 1 : a / b),
    };
    let level = new Map();
    Ts.forEach((t) => {
      const o = tv[t];
      level.set(key(o.v), o);
    });
    const all = new Map(level);
    for (let d = 2; d <= maxDepth; d++) {
      const prev = [...all.values()],
        nxt = new Map(all);
      for (const op of Fs)
        for (const a of prev)
          for (const b of prev) {
            const v = a.v.map((x, i) => ops[op](x, b.v[i])),
              k = key(v);
            if (!nxt.has(k)) nxt.set(k, { v, e: `(${op} ${a.e} ${b.e})` });
          }
      all.clear();
      nxt.forEach((o, k) => all.set(k, o));
      if (all.size > 40000) break;
    }
    let best = null,
      be = Infinity;
    all.forEach((o) => {
      let s = 0;
      for (let i = 0; i < 40; i++)
        s += (Math.abs(o.v[i] - TARGET(XS[i])) + Math.abs(o.v[i + 1] - TARGET(XS[i + 1]))) * 0.025;
      if (s < be) {
        be = s;
        best = o;
      }
    });
    return { best, err: be, n: all.size };
  }

  N.register({
    id: "l6-prep",
    lecture: 6,
    order: 5,
    num: "6.5",
    title: "Five choices before you run",
    blurb:
      "Choose the function and terminal sets, then search every small program and see if the target is even reachable.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Before a GP run you decide <b>five things</b>: the <b>terminal set</b>, the <b>function set</b>, the <b>fitness measure</b>, the <b>run parameters</b> and the <b>termination criterion</b>. The first two decide what programs can <i>exist</i>. If the target can't be built from them, no amount of evolution will find it.",
        ),
      );
      const card = el(
        `<div class="card"><div class="card-head"><h2>Can these sets build x² + x + 1?</h2></div><div class="controls" id="f"></div><div class="controls" id="t"></div><div class="controls" id="d"></div><div id="out"></div></div>`,
      );
      root.appendChild(card);
      const Fsel = { "+": true, "-": false, "*": true, "%": false },
        Tsel = { X: true, 1: true, 2: false };
      let md = 3;
      const mk = (obj, id, lbl) =>
        Object.keys(obj).map((k) => {
          const l = el(
            `<label class="field"><input type="checkbox" ${obj[k] ? "checked" : ""}> ${lbl} <b class="mono">${k}</b></label>`,
          );
          qs("input", l).onchange = (e) => {
            obj[k] = e.target.checked;
            draw();
          };
          qs(id, card).appendChild(l);
        });
      mk(Fsel, "#f", "function");
      mk(Tsel, "#t", "terminal");
      const sD = N.slider("Maximum depth", 1, 3, 1, md);
      sD.onInput((v) => {
        md = v;
        draw();
      });
      qs("#d", card).appendChild(sD);
      function draw() {
        const Fs = Object.keys(Fsel).filter((k) => Fsel[k]),
          Ts = Object.keys(Tsel).filter((k) => Tsel[k]),
          out = qs("#out", card);
        if (!Ts.length) return (out.innerHTML = `<div class="callout rose">Pick at least one terminal.</div>`);
        const r = reachable(Fs, Ts, md),
          ok = r.err < 1e-6;
        out.innerHTML = `<p>Searched all <b>${r.n.toLocaleString()}</b> distinct behaviours of programs up to depth ${md} (functions ${Fs.join(" ") || "none"}; terminals ${Ts.join(" ")}).</p><div class="callout ${ok ? "teal" : "rose"}">${ok ? `<b>Reachable.</b> Exact match: <span class="mono">${r.best.e}</span>` : `<b>Not reachable.</b> The closest program is <span class="mono">${r.best.e}</span> with error <b>${r.err.toFixed(2)}</b>.`}</div>`;
      }
      draw();
      root.appendChild(
        predict({
          id: "l6-prep-1",
          q: "Function set {+, −} only, terminals {X, 1}. Can any program build x² + x + 1?",
          opts: [
            "No: with only + and − you can never multiply X by X",
            "Yes, with a deep enough tree",
            "Yes, but only with a population of at least 500",
          ],
          a: 0,
          why: "Adding and subtracting X and 1 gives only straight lines a·X + b. The x² term needs a × (or a division trick). The terminal and function sets must be <b>rich enough</b> to build the answer.",
        }),
      );
      root.appendChild(
        predict({
          id: "l6-prep-2",
          q: "Which of these is NOT one of the lecture's five preparatory steps?",
          opts: [
            "Choosing the language the GP system is coded in",
            "Determining the fitness measure that scores programs",
            "Determining the criterion for terminating a run",
          ],
          a: 0,
          why: "The five are: terminal set, function set, fitness measure, run parameters, termination criterion.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Five choices: terminals, functions, fitness, parameters, termination.",
            "The function and terminal sets must be able to express the answer, or the run can never succeed.",
            "Other sets suit other tasks: logical functions (AND, OR, NOT, comparisons) for data mining; drawing commands for antennas.",
          ],
          "Choose the building blocks well, then let evolution assemble them.",
        ),
      );
    },
  });

  L["l6-prep"] = {
    sum: "A GP run needs <b>five decisions</b> up front. The first two, the function set and terminal set, limit which programs can ever appear.",
    steps: [
      {
        t: "The five preparatory steps",
        b: `<p>1. The set of <b>terminals</b>. 2. The set of <b>functions</b>. 3. The <b>fitness</b> measure. 4. The <b>parameters</b> for the run. 5. The <b>termination</b> criterion.</p>`,
        v: table(
          ["#", "Decision", "Regression example"],
          [
            ["1", "Terminals", "X, random constants"],
            ["2", "Functions", "+, −, ×, %"],
            ["3", "Fitness", "sum of absolute errors"],
            ["4", "Parameters", "population size 4"],
            ["5", "Termination", "error &lt; 0.1"],
          ],
        ),
        c: {
          q: "Which choice decides what the run can score?",
          o: ["The fitness measure", "The termination criterion", "The population size"],
          a: 0,
          why: "Fitness is how programs are judged; the others control search and stopping.",
        },
      },
      {
        t: "Sets must be sufficient",
        b: `<p>If the building blocks cannot express the target, no program in the search space is right. To fit x² + x + 1 you need something like × and + with X and 1. With only + and −, every program is a straight line.</p>`,
        v: F.flow([
          { t: "F = {+, −}", c: "blue" },
          { t: "T = {X, 1}", c: "blue" },
          { t: "only a·X + b", c: "rose" },
          { t: "x² unreachable", c: "rose" },
        ]),
        c: {
          q: "F = {+, −}, T = {X, 1}. What shape are all programs?",
          o: [
            "Straight lines of the form a·X + b",
            "Parabolas of the form a·X² + b",
            "Constants only: no X can remain",
          ],
          a: 0,
          why: "Adding and subtracting X and 1 gives a·X + b.",
        },
      },
      {
        t: "Other function and terminal sets",
        b: `<p>GP programs can compute <b>logical functions</b> of the data (AND, OR, NOT, &lt;, ≥, =) with variables and constants as leaves. That is useful in data mining, such as medical data on protein levels in blood tests.</p>`,
        v: `<div class="mono" style="text-align:center">(AND (&gt;= A 5) (NOT (= B 11)))</div><p class="dim" style="text-align:center">A rule over protein levels A and B.</p>`,
        c: {
          q: "Which function set suits classifying records from blood-test data?",
          o: ["AND, OR, NOT and comparisons", "PLUS and TIMES with constants", "Forward and Branch drawing commands"],
          a: 0,
          why: "A rule that says “if A &gt; 5 and B &lt; 2 then…” is a logical expression.",
        },
      },
      {
        t: "Antennae again",
        b: `<p>For the antenna, GP uses commands such as <b>Forward</b> and <b>Branch</b>. The tree is a recipe that <b>builds</b> the antenna rather than a list of coordinates, so the size and shape of the design can change from program to program.</p>`,
        v: F.flow(["Forward 1", "Branch", "Forward 2", { t: "Antenna", c: "teal" }]),
        c: {
          q: "Compared with the 105-bit antenna string, a GP antenna program…",
          o: [
            "Describes how to build the antenna, so its size varies",
            "Always has exactly 105 nodes, matching the bit string's length",
            "Cannot be evaluated by simulation, unlike a bit string",
          ],
          a: 0,
          why: "A tree of drawing commands can be small or large.",
        },
      },
    ],
    guide: [
      "Tick and untick functions and terminals.",
      "Change the <b>Maximum depth</b>.",
      "Find the smallest sets that reach x² + x + 1 exactly.",
      "Answer the questions after the demo.",
    ],
  };
})();

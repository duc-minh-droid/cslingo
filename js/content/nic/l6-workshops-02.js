/* l6-workshops-02: Lecture 6 workshop 6.W2, evolve a formula (no code): population size and function/terminal sets. */
(function () {
  const N = NIC,
    { qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const sh = (NIC.shared.l6 = NIC.shared.l6 || {});
  const { mulberry, clone, randomProgram, mutate, crossover, sx } = sh;

  // ---------- a small GP on x^2 + x + 1 (fitness = sum of absolute error, protected division) ----------
  const GENS = 10,
    MAXD = 6,
    FS = ["+", "-", "*", "%"];
  const XS = Array.from({ length: 21 }, (_, i) => -1 + i * 0.1);
  const goal = (x) => x * x + x + 1;
  const ap = (op, a, b) =>
    op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : Math.abs(b) < 1e-6 ? 1 : a / b;
  const ev = (n, x) => {
    if (!n.kids) return n.v === "X" ? x : n.v;
    return Math.max(-1e6, Math.min(1e6, ap(n.op, ev(n.kids[0], x), ev(n.kids[1], x))));
  };
  const err = (t) => XS.reduce((s, x) => s + Math.abs(ev(t, x) - goal(x)), 0);

  function runGP(pop, seed) {
    const r = mulberry(seed),
      TS = [() => "X", () => "X", () => Math.floor(r() * 5) - 2];
    let P = Array.from({ length: pop }, () => randomProgram(r, 2 + Math.floor(r() * 3), FS, TS));
    const hist = [];
    let evals = 0,
      best = null,
      bestE = Infinity,
      solved = -1;
    for (let g = 0; g <= GENS; g++) {
      const fit = P.map(err);
      evals += pop;
      const bi = fit.indexOf(Math.min(...fit));
      if (fit[bi] < bestE) {
        bestE = fit[bi];
        best = clone(P[bi]);
      }
      hist.push(bestE);
      if (bestE < 1e-6) {
        solved = g;
        break;
      }
      if (g === GENS) break;
      const tour = () => {
        let b = Math.floor(r() * pop);
        for (let k = 1; k < 3; k++) {
          const x = Math.floor(r() * pop);
          if (fit[x] < fit[b]) b = x;
        }
        return P[b];
      };
      const next = [clone(P[bi])];
      while (next.length < pop) {
        const u = r();
        if (u < 0.8) {
          const x = crossover(r, tour(), tour(), MAXD);
          next.push(x.kids[0]);
          if (next.length < pop) next.push(x.kids[1]);
        } else if (u < 0.9) next.push(mutate(r, tour(), MAXD, FS, TS).tree);
        else next.push(clone(tour()));
      }
      P = next;
    }
    return { hist, evals, best, bestE, solved };
  }

  // ---------- can this function set and terminal set reach the target at all? ----------
  const SX = [-2, -1, 0, 1, 2, 3],
    TARGET = SX.map(goal);
  const key = (v) => v.map((x) => Math.round(x * 1e6) / 1e6).join(",");
  const TK = key(TARGET);
  function reach(fs, ts) {
    const seen = new Map();
    const add = (v, e) => {
      const k = key(v);
      if (!seen.has(k)) seen.set(k, { v, e });
    };
    ts.forEach((t) =>
      add(
        SX.map((x) => (t === "X" ? x : t)),
        String(t),
      ),
    );
    const combos = (A, B, f) => {
      for (const a of A)
        for (const b of B)
          for (const op of fs) {
            const v = a.v.map((x, i) => ap(op, x, b.v[i]));
            if (v.every((x) => Math.abs(x) < 1e6)) f(v, `(${op} ${a.e} ${b.e})`);
          }
    };
    for (let lv = 1; lv <= 2; lv++) {
      const all = [...seen.values()];
      combos(all, all, add);
      if (seen.has(TK)) return { lv, e: seen.get(TK).e, n: seen.size };
    }
    const all = [...seen.values()];
    let hit = null;
    combos(all, all, (v, e) => {
      if (!hit && key(v) === TK) hit = e;
    });
    return hit ? { lv: 3, e: hit, n: all.length } : { lv: 0, e: "", n: all.length };
  }

  function view(c, stage) {
    stage.innerHTML = `
      <div class="wk-card"><h3>Evolve x² + x + 1</h3>
        <p class="nw6-note">Fitness is the sum of absolute errors over 21 values of X from −1 to 1. A run is <b>solved</b> when the error is exactly 0. Every run lasts ${GENS} generations.</p>
        <div class="wk-row" data-ctl></div><div data-one></div></div>
      <div class="wk-card"><h3>Success rate by population size</h3><div data-tab></div></div>
      <div class="wk-card"><h3>Which sets can reach the target?</h3>
        <div class="wk-row nw6-set" data-fs></div><div class="wk-row nw6-set" data-ts></div><div data-verdict aria-live="polite"></div></div>`;
    const seg = N.seg(
      [
        ["4", "Population 4"],
        ["30", "Population 30"],
        ["300", "Population 300"],
      ],
      String(c.pop),
      (v) => (c.pop = +v),
    );
    const b1 = N.el(`<button class="btn primary">Run 1 evolution</button>`),
      b20 = N.el(`<button class="btn">Run 20 seeded runs</button>`);
    b1.onclick = () => runOne(c);
    b20.onclick = () => runBatch(c);
    qs("[data-ctl]", stage).append(seg, b1, b20);
    c.q = (s) => qs(s, stage);
    const tog = (host, items, set, label) => {
      const h = c.q(host);
      h.innerHTML = `<small>${label}</small>`;
      items.forEach((it) => {
        const b = N.el(`<button class="btn small" aria-pressed="false">${it}</button>`);
        b.onclick = () => {
          set.has(it) ? set.delete(it) : set.add(it);
          b.classList.toggle("primary", set.has(it));
          b.setAttribute("aria-pressed", String(set.has(it)));
          sets(c);
        };
        b.classList.toggle("primary", set.has(it));
        b.setAttribute("aria-pressed", String(set.has(it)));
        h.append(b);
      });
    };
    tog("[data-fs]", FS, c.fs, "Functions:");
    tog("[data-ts]", ["X", 0, 1, 2], c.ts, "Terminals:");
  }

  function table(c) {
    const rows = [4, 30, 300].map((p) => {
      const d = c.rows[p];
      if (!d) return `<tr><td><b>${p}</b></td><td colspan="3" class="dim">not run yet</td></tr>`;
      return `<tr><td><b>${p}</b></td><td><b>${d.ok}</b> of ${d.n}</td><td><span class="nw6-rate"><i style="width:${(100 * d.ok) / d.n}%"></i></span></td><td>${Math.round(d.evals / d.n)} </td></tr>`;
    });
    c.q("[data-tab]").innerHTML =
      `<table class="t nw6-tab"><tr><th>Pop.</th><th>Solved</th><th>Rate</th><th>Scored per run</th></tr>${rows.join("")}</table>`;
  }

  function runOne(c) {
    const res = runGP(c.pop, c.seed++),
      h = res.hist.length < 2 ? [...res.hist, res.hist[0]] : res.hist;
    c.q("[data-one]").innerHTML =
      `<canvas class="viz" aria-label="Best error by generation"></canvas><p>${res.solved >= 0 ? `<b>Solved in generation ${res.solved}</b> after scoring ${res.evals} programs.` : `Not solved. Best error <b>${res.bestE.toFixed(2)}</b> after scoring ${res.evals} programs.`} Seed ${c.seed - 1}.</p><p class="mono nw6-formula">${sx(res.best)}</p>`;
    N.lineChart(qs("canvas", c.q("[data-one]")), {
      series: [{ data: h, color: N.colors().teal }],
      height: 150,
      names: ["best error"],
      xLabel: "generation",
      yMin: 0,
    });
    c.api.say(
      res.solved >= 0
        ? "Found it. Try the same population again: a new seed can behave very differently."
        : "No luck this time. Evolution is random, so one run proves little: try the 20 seeded runs.",
      res.solved >= 0 ? "happy" : "think",
    );
    c.one = true;
    check(c);
  }

  function runBatch(c) {
    let ok = 0,
      evals = 0;
    for (let s = 1; s <= 20; s++) {
      const r = runGP(c.pop, s);
      ok += r.solved >= 0 ? 1 : 0;
      evals += r.evals;
    }
    c.rows[c.pop] = { ok, n: 20, evals };
    table(c);
    c.api.say(`Population ${c.pop}: <b>${ok} of 20</b> seeded runs solved it.`, ok >= 10 ? "happy" : "think");
    check(c);
  }

  function sets(c) {
    const fs = FS.filter((f) => c.fs.has(f)),
      ts = ["X", 0, 1, 2].filter((t) => c.ts.has(t));
    const res = !fs.length || !ts.length ? { lv: 0, e: "", n: ts.length } : reach(fs, ts);
    c.res = { ...res, fs: fs.length, x: ts.includes("X"), onlyX: ts.length === 1 && ts[0] === "X" };
    c.q("[data-verdict]").innerHTML = res.lv
      ? `<div class="callout teal"><b>Reachable.</b> A tree like <span class="mono">${res.e}</span> equals x² + x + 1 (${res.lv} level${res.lv > 1 ? "s" : ""} of functions).</div>`
      : `<div class="callout"><b>Out of reach.</b> ${!fs.length || !ts.length ? "Switch on at least one function and one terminal." : `No tree with up to 3 levels of functions matches, among the ${res.n} different functions of X these sets can build.`}</div>`;
    check(c);
  }

  function check(c) {
    const { api } = c;
    if (c.one) api.done("one");
    if ([4, 30, 300].every((p) => c.rows[p])) api.done("batch");
    const r = c.res;
    if (r && !r.lv && r.x && r.fs >= 2) api.done("cannot");
    if (r && r.lv && r.fs === 2 && r.x) api.done("two");
    if (r && r.lv && r.onlyX) api.done("onlyx");
  }

  function build(stage, api) {
    const c = { api, pop: 30, seed: 100, rows: {}, fs: new Set(FS), ts: new Set(["X", 1]) };
    view(c, stage);
    table(c);
    sets(c);
  }

  N.register({
    id: "l6-wevolve",
    lecture: 6,
    order: 91,
    num: "6.W2",
    workshop: true,
    title: "Workshop: evolve a formula",
    blurb:
      "No code. Run small GP searches for x² + x + 1 at three population sizes, then test which function and terminal sets can build it at all.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro:
          "The data come from a hidden formula, <b>x² + x + 1</b>. A real GP run is below: press <b>Run 1 evolution</b>, then see how population size changes the odds.",
        missions: [
          {
            id: "one",
            t: "Run one evolution",
            d: "Pick a population and press <b>Run 1 evolution</b>. Watch the best error fall as generations pass.",
            hint: "The line is the best error so far, so it can only go down or stay level.",
          },
          {
            id: "batch",
            t: "Compare all three population sizes",
            d: "Press <b>Run 20 seeded runs</b> for population 4, then 30, then 300, and read the success table.",
            hint: "Change the population with the buttons beside Run, then press Run 20 seeded runs each time.",
          },
          {
            id: "cannot",
            t: "Find a set that cannot reach it",
            d: "Under <b>Which sets can reach the target?</b> keep X on, keep at least two functions, and make the verdict say <b>Out of reach</b>.",
            hint: "Switch off * and %. With only + and − every program is a straight line in X, so x² is impossible.",
          },
          {
            id: "two",
            t: "Reach it with just two functions",
            d: "Use exactly two functions (and X) so that the target is <b>Reachable</b>.",
            hint: "x² needs multiplication, and the rest is addition. Keep + and *, with terminals X and 1.",
          },
          {
            id: "onlyx",
            t: "Reach it with X as the only terminal",
            d: "Switch off 0, 1 and 2 so only <b>X</b> remains, and still get <b>Reachable</b>.",
            hint: "Protected division makes X % X equal to 1, so a constant can be built from X itself. Keep +, * and %.",
          },
        ],
        build,
      });
      root.appendChild(
        predict({
          id: "l6-wevolve-1",
          q: "Population 300 usually finds x² + x + 1 far more often than population 4. What is the main reason?",
          opts: [
            "More random programs, so more useful pieces such as x * x or x + 1 are around to be recombined",
            "Each program in a large population is individually better",
            "A larger population scores each program more accurately",
          ],
          a: 0,
          why: "Programs are not better in a big population, there are just more of them. More pieces are on offer for crossover to combine, so a good formula appears sooner. The price is more scoring: every generation costs 300 evaluations, not 4.",
        }),
      );
      root.appendChild(
        predict({
          id: "l6-wevolve-2",
          q: "A function set has only + and −, and the terminals are X and some constants. Why can no program ever equal x² + x + 1?",
          opts: [
            "Every tree built from + and − is a straight line in X, and x² is not",
            "The trees would always be too deep",
            "Constants cannot be combined with X",
          ],
          a: 0,
          why: "Adding and subtracting copies of X and constants only gives a·X + b. There is no way to multiply X by X, so the set is not sufficient. No amount of evolution fixes a missing ingredient.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "One GP run is a random draw. Compare <b>success rates over many seeded runs</b>, not single runs.",
            "A bigger population gives crossover more material, so it usually solves the problem more often, but it costs more evaluations per generation.",
            "The <b>function set and terminal set must be sufficient</b>: with only + and − the answer x² + x + 1 cannot be built.",
            "Sometimes a smaller set is enough: with protected division, X % X is 1, so no constants are needed.",
          ],
          "Enough variety to find the formula, and a set of building blocks that can build it.",
        ),
      );
    },
  });

  L["l6-wevolve"] = {
    sum: "Run small GP searches for a formula at three population sizes and test which building-block sets can reach it.",
    steps: [
      {
        t: "Population size and luck",
        b: `<p>GP is random, so one run can be lucky or unlucky. To compare settings you run it <b>many times with different seeds</b> and count how often it finds the target.</p><p>A <b>bigger population</b> gives crossover more pieces to combine, but every generation scores more programs: the cost grows with the population.</p>`,
        v: F.compare(
          { title: "Small population", c: "amber", body: "cheap generations, few pieces to recombine" },
          { title: "Large population", c: "teal", body: "costly generations, many pieces to recombine" },
        ),
        c: {
          q: "Neither run finds the answer early. Population 4 and population 300 both run 10 generations. Which scores more programs in total?",
          o: [
            "Population 300: it scores 300 programs per generation",
            "They score the same number",
            "Population 4: small ones need more tries",
          ],
          a: 0,
          why: "Scoring cost is population × generations: about 3,000 programs against 40.",
        },
      },
      {
        t: "Sufficient building blocks",
        b: `<p>Evolution can only rearrange the <b>function set</b> and <b>terminal set</b> you hand it. If the target cannot be built from them, no run will ever find it.</p><p>The set explorer checks every tree up to three levels of functions. Fewer blocks can still be enough: with <b>protected division</b>, X % X is always 1.</p>`,
        v: F.flow(["Function set", "Terminal set", "Trees you can build", "Contains the target?"]),
        c: {
          q: "The functions are +, * and %, and X is the only terminal. Can a program make the constant 1?",
          o: ["Yes: X % X is 1", "No: there are no constants", "Only when X equals 1"],
          a: 0,
          why: "Protected division returns 1 when the divisor is 0, and X ÷ X is 1 otherwise, so X % X is 1 for every X.",
        },
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();

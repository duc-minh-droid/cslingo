(function () {
  const partScope = (NIC.shared.l4 = NIC.shared.l4 || {});
  const { SEL } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header, randint, rnd } = N;

  const parseList = (s) =>
    s
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(Number)
      .filter((x) => Number.isFinite(x));
  const PRESETS = {
    lecture: { n: "Lecture pop", v: "0.1, 0.5, 0.3, 0.2, 0.9, 0.7, 0.3, 0.4, 0.4, 0.1" },
    superfit: { n: "Superfit", v: "100, 0.4, 0.3, 0.2, 0.1" },
    shifted: { n: "Superfit + 100", v: "200, 100.4, 100.3, 100.2, 100.1" },
    negative: { n: "Negatives", v: "5, 3, -2, 1, 0.5" },
    tsp: { n: "TSP lengths (minimise!)", v: "32, 33, 32, 34, 28" },
  };

  // ---------- OneMax GA helpers (4.1) ----------
  const GA_L = 20;
  const bits = () => Array.from({ length: GA_L }, () => (rnd() < 0.3 ? 1 : 0));
  const fit = (g) => g.reduce((a, b) => a + b, 0) / GA_L;
  const mutate = (g) => g.map((b) => (rnd() < 1 / GA_L ? 1 - b : b));
  const cross = (a, b) => {
    const c = randint(1, GA_L - 1);
    return a.slice(0, c).concat(b.slice(c));
  };

  /* ============ 4.1 Generational vs steady state ============ */
  N.register({
    id: "l4-types",
    lecture: 4,
    order: 1,
    num: "4.1",
    title: "Generational vs steady-state",
    blurb:
      "Two ways to run a GA: replace everyone each generation (optionally keeping elites), or trickle in 1–2 children at a time.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          '<b>Generational</b>: apply selection and genetic operators repeatedly to build a <i>whole new</i> population. <b>Elitist</b> generational GAs copy the n best across unchanged. <b>Steady-state</b>: apply the operators only N times (N = 1 or 2), and the new children replace weak members. New solutions are <span style="color:var(--violet-ink)">purple</span>, like on the slides. The problem here is OneMax on 20 bits, so fitness is the fraction of 1s.',
        ),
      );
      const P = 10;
      let mode = "gen",
        elite = 0,
        nSS = 2,
        pop,
        isNew,
        isElite,
        hist,
        evals,
        gen,
        running = null;
      function init() {
        pop = Array.from({ length: P }, bits);
        isNew = new Array(P).fill(false);
        isElite = new Array(P).fill(false);
        evals = P;
        gen = 0;
        hist = { best: [Math.max(...pop.map(fit))], mean: [pop.reduce((a, g) => a + fit(g), 0) / P], x: [evals] };
        draw();
      }
      const sel = () => pop[SEL.tournament(pop.map(fit), 2)];
      function step() {
        if (mode === "gen") {
          const order = pop.map((g, i) => i).sort((a, b) => fit(pop[b]) - fit(pop[a]));
          const next = [],
            ne = [],
            el2 = [];
          for (let k = 0; k < elite; k++) {
            next.push(pop[order[k]]);
            ne.push(false);
            el2.push(true);
          }
          while (next.length < P) {
            next.push(mutate(cross(sel(), sel())));
            ne.push(true);
            el2.push(false);
            evals++;
          }
          pop = next;
          isNew = ne;
          isElite = el2;
        } else {
          isNew = new Array(P).fill(false);
          isElite = new Array(P).fill(false);
          for (let k = 0; k < nSS; k++) {
            const child = mutate(cross(sel(), sel()));
            evals++;
            let wi = 0;
            pop.forEach((g, i) => {
              if (fit(g) < fit(pop[wi])) wi = i;
            });
            if (fit(child) >= fit(pop[wi])) {
              pop[wi] = child;
              isNew[wi] = true;
            }
          }
        }
        gen++;
        hist.best.push(Math.max(...pop.map(fit)));
        hist.mean.push(pop.reduce((a, g) => a + fit(g), 0) / P);
        hist.x.push(evals);
        draw();
      }
      const card = el(`<div class="card"><div class="controls" id="b1"></div>
        <div class="grid side"><div><div class="card-head"><h3 id="gh"></h3></div><div class="pop" id="pop"></div>
          <p class="dim" id="expl" style="margin-top:12px"></p>
          <div class="controls"><button class="btn primary" id="st">Step</button><button class="btn" id="go">Run</button><button class="btn ghost" id="rs">New population</button></div></div>
        <div><h3>Fitness vs evaluations</h3><canvas class="viz" id="ch"></canvas><div class="legend"><span style="--c:var(--teal)">best</span><span style="--c:var(--violet)">mean</span></div></div></div></div>`);
      root.appendChild(card);
      const sE = N.slider("Elites kept", 0, 4, 1, elite),
        sN = N.slider("Children per step N", 1, 4, 1, nSS);
      sE.onInput((v) => (elite = v));
      sN.onInput((v) => (nSS = v));
      qs("#b1", card).append(
        N.seg(
          [
            ["gen", "Generational"],
            ["ss", "Steady-state"],
          ],
          mode,
          (v) => {
            mode = v;
            toggle();
            init();
          },
        ),
        sE,
        sN,
      );
      const toggle = () => {
        sE.style.display = mode === "gen" ? "" : "none";
        sN.style.display = mode === "ss" ? "" : "none";
      };
      toggle();
      function draw() {
        qs("#gh", card).textContent = mode === "gen" ? `Generation ${gen}` : `Iteration ${gen}`;
        qs("#pop", card).innerHTML = pop
          .map(
            (g, i) =>
              `<div class="chip ${isNew[i] ? "new" : ""} ${isElite[i] ? "elite" : ""}"><small>S${i + 1}</small><b>${fit(g).toFixed(2)}</b></div>`,
          )
          .join("");
        qs("#expl", card).innerHTML =
          mode === "gen"
            ? `Each step makes <b>${P - elite}</b> new children${elite ? ` and copies the best <b>${elite}</b> unchanged (green border)` : ""}. ${elite ? "" : '<span style="color:var(--rose-ink)">No elitism: the best can be lost.</span>'}`
            : `Each step makes <b>${nSS}</b> child${nSS > 1 ? "ren" : ""}. Each replaces the weakest member if it's no worse. Everyone else survives.`;
        N.lineChart(qs("#ch", card), {
          series: [
            { data: hist.best, color: N.colors().teal },
            { data: hist.mean, color: N.colors().violet },
          ],
          yMin: 0,
          yMax: 1,
          height: 220,
          xLabel: mode === "gen" ? "generation" : "iteration",
        });
      }
      function stop() {
        if (running) {
          running();
          running = null;
          qs("#go", card).textContent = "Run";
          qs("#go", card).classList.remove("on");
        }
      }
      qs("#st", card).onclick = step;
      qs("#rs", card).onclick = () => {
        stop();
        init();
      };
      qs("#go", card).onclick = () => {
        if (running) return stop();
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        running = life.interval(
          () => {
            step();
            if (Math.max(...pop.map(fit)) === 1 || gen > 300) stop();
          },
          mode === "gen" ? 220 : 60,
        );
      };
      life.onResize(draw);
      init();

      // Head-to-head
      const cmp =
        el(`<div class="card"><div class="card-head"><h2>Head-to-head (same evaluation budget)</h2><span class="faint">60 runs × 400 evaluations, P=10, OneMax-20</span></div>
        <div class="controls"><button class="btn" id="cmpB">Run comparison</button></div><canvas class="viz" id="cc"></canvas>
        <div class="legend"><span style="--c:var(--rose)">generational, no elitism</span><span style="--c:var(--amber)">generational, 1 elite</span><span style="--c:var(--teal)">steady-state, N=2</span></div><p class="dim" id="cmpT"></p></div>`);
      root.appendChild(cmp);
      qs("#cmpB", cmp).onclick = () => {
        const B = 400,
          bins = 40;
        const run = (m, e) => {
          let p = Array.from({ length: P }, bits),
            ev = P;
          const curve = new Array(bins).fill(0);
          let lastBin = 0;
          const selp = () => p[SEL.tournament(p.map(fit), 2)];
          const rec = () => {
            const b = Math.min(bins - 1, Math.floor((ev / B) * bins));
            for (let k = lastBin; k <= b; k++) curve[k] = Math.max(...p.map(fit));
            lastBin = b;
          };
          while (ev < B) {
            if (m === "gen") {
              const o = p.map((g, i) => i).sort((a, b) => fit(p[b]) - fit(p[a]));
              const nx = o.slice(0, e).map((i) => p[i]);
              while (nx.length < P) {
                nx.push(mutate(cross(selp(), selp())));
                ev++;
              }
              p = nx;
            } else {
              for (let k = 0; k < 2; k++) {
                const c = mutate(cross(selp(), selp()));
                ev++;
                let wi = 0;
                p.forEach((g, i) => {
                  if (fit(g) < fit(p[wi])) wi = i;
                });
                if (fit(c) >= fit(p[wi])) p[wi] = c;
              }
            }
            rec();
          }
          return curve;
        };
        const avg = (m, e) => {
          const acc = new Array(bins).fill(0);
          for (let r = 0; r < 60; r++) run(m, e).forEach((v, i) => (acc[i] += v / 60));
          return acc;
        };
        const C = N.colors();
        const a = avg("gen", 0),
          b = avg("gen", 1),
          c = avg("ss", 0);
        N.lineChart(qs("#cc", cmp), {
          series: [
            { data: a, color: C.rose },
            { data: b, color: C.amber },
            { data: c, color: C.teal },
          ],
          height: 220,
          xLabel: "evaluations (÷10)",
        });
        qs("#cmpT", cmp).innerHTML =
          `Mean <b>current-population best</b> after 400 evaluations: no elitism ${a[bins - 1].toFixed(3)}, 1 elite ${b[bins - 1].toFixed(3)}, steady-state ${c[bins - 1].toFixed(3)}. Steady-state uses each new child straight away, and replace-worst is itself elitist (the best is never replaced).`;
      };

      root.appendChild(
        predict({
          id: "l4-types-1",
          q: "A generational GA has a population of 20 and keeps <b>2 elites</b>. How many new children does it build each generation?",
          opts: ["20", "18", "2"],
          a: 1,
          why: "The 2 elites are copied across unchanged, so only the other 18 places are filled with children made by selection, crossover and mutation: 2 + 18 = 20. With elites kept = 0 the whole 20 would be new. Raise <b>Elites kept</b> in the demo and watch the dips in the green line disappear.",
        }),
      );
      root.appendChild(
        predict({
          id: "l4-types-2",
          q: "A child with excellent fitness has just been created. Which kind of GA can pick it as a parent soonest?",
          opts: [
            "Steady-state: it joins the population at once",
            "Generational: it is used within the same generation",
            "Both equally soon, since each makes children the same way",
          ],
          a: 0,
          why: "A steady-state GA puts a good child into the population straight away, so the very next selection can pick it. A generational GA builds its new population from the old one, so the child is only available as a parent after the whole generation is finished. That speed is also why steady-state converges sooner (more selection pressure).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Generational</b>: build a whole new population each generation. <b>Elitist</b>: carry the n best over unchanged.",
            "<b>Steady-state</b>: create N (1–2) children per iteration and replace weak members. The population changes gradually.",
            "Without elitism a generational GA can lose its best solution. Steady-state with replace-worst never does.",
          ],
          "Generational GAs replace the whole population each generation, steady-state GAs replace a couple of weak members at a time, and elitism keeps the best.",
        ),
      );
    },
  });
  Object.assign(partScope, { PRESETS, parseList });
})();

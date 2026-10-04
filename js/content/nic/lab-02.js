(function () {
  const partScope = (NIC.shared.lab = NIC.shared.lab || {});
  const { L, PSEUDO, TARGETS, W } = partScope;
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd } = N;

  N.register({
    id: "l4-lab",
    lecture: 4,
    order: 9,
    num: "4.9",
    title: "EA Lab: build your own GA",
    blurb: "Run the lecture's two full algorithms (or your own mix) on a pixel-matching problem. Tweak every knob.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Lecture 4 ends with two complete algorithms: a <b>steady-state, mutation-only, replace-worst EA with tournament selection</b> and a <b>generational, elitist, crossover+mutation EA with rank-based selection</b>. Both are implemented here on a binary problem: evolve a 12×12 image (144 bits) to match the target. Fitness is the fraction of pixels that match.",
        ),
      );
      let target = TARGETS.heart.split("").map(Number);
      const cfg = {
        algo: "ss",
        type: "ss",
        sel: "tournament",
        tsize: 3,
        cross: "none",
        xrate: 0.8,
        pm: 1 / L,
        mute: 1,
        pop: 30,
        elites: 1,
        speed: 40,
      };
      let pop,
        fits,
        evals,
        gens,
        hist,
        running = null;
      const PRE = {
        ss: { type: "ss", sel: "tournament", cross: "none", tsize: 3, elites: 1 },
        gen: { type: "gen", sel: "rank", cross: "one", xrate: 0.8, elites: 1 },
      };
      const card = el(`<div class="card"><div class="controls" id="algo"></div>
        <div class="grid side"><div>
          <div class="grid two" style="gap:14px"><div><div class="card-head"><span class="tag amber">Target</span><span class="faint" style="font-size:12px">click to draw</span></div><div class="pixel-grid target edit" id="tg" style="grid-template-columns:repeat(${W},1fr)"></div><div class="controls" id="tp"></div></div>
          <div><div class="card-head"><span class="tag teal">Best so far</span><b class="mono" id="bf"></b></div><div class="pixel-grid" id="bg" style="grid-template-columns:repeat(${W},1fr)"></div></div></div>
          <div class="stat-row"><div class="stat"><small>Evaluations</small><b id="se">0</b></div><div class="stat"><small id="gl">Generations</small><b id="sg">0</b></div><div class="stat teal"><small>Best</small><b id="sb">0</b></div><div class="stat violet"><small>Mean</small><b id="sm">0</b></div><div class="stat amber"><small>Diversity</small><b id="sd">0</b></div></div>
          <div class="controls"><button class="btn primary" id="go">Run</button><button class="btn" id="st">Step</button><button class="btn ghost" id="rs">Reset population</button></div>
          <canvas class="viz" id="ch"></canvas><div class="legend"><span style="--c:var(--teal)">best</span><span style="--c:var(--violet)">mean</span><span style="--c:var(--amber)">diversity (per-bit)</span></div>
        </div><div><h3>Algorithm</h3><div class="pseudo" id="ps"></div>
          <h3 style="margin-top:16px">Knobs</h3><div id="knobs" style="display:grid;gap:10px"></div>
          <h3 style="margin-top:16px">Population</h3><div class="thumbs" id="th"></div></div></div></div>`);
      root.appendChild(card);

      const knobs = qs("#knobs", card);
      const typeSeg = N.seg(
        [
          ["ss", "Steady-state"],
          ["gen", "Generational"],
        ],
        cfg.type,
        (v) => {
          cfg.type = v;
          setAlgo("custom");
        },
      );
      const selSeg = N.seg(
        [
          ["tournament", "Tournament"],
          ["rank", "Rank"],
          ["roulette", "Roulette"],
          ["random", "Random"],
        ],
        cfg.sel,
        (v) => {
          cfg.sel = v;
          setAlgo("custom");
        },
      );
      const xSeg = N.seg(
        [
          ["none", "No crossover"],
          ["one", "1-point"],
          ["two", "2-point"],
          ["uni", "Uniform"],
        ],
        cfg.cross,
        (v) => {
          cfg.cross = v;
          setAlgo("custom");
        },
      );
      const sPop = N.slider("popsize", 4, 100, 1, cfg.pop),
        sT = N.slider("tournament size", 1, 10, 1, cfg.tsize),
        sX = N.slider("cross_rate", 0, 1, 0.05, cfg.xrate, (v) => v.toFixed(2)),
        sM = N.slider(
          "mutation per bit",
          0,
          0.05,
          0.001,
          cfg.pm,
          (v) => v.toFixed(3) + ` (≈${(v * L).toFixed(1)} flips)`,
        ),
        sE = N.slider("elites (generational)", 0, 5, 1, cfg.elites),
        sS = N.slider("speed (evals/frame)", 1, 400, 1, cfg.speed);
      sPop.onInput((v) => {
        cfg.pop = v;
        reset();
      });
      sT.onInput((v) => (cfg.tsize = v));
      sX.onInput((v) => (cfg.xrate = v));
      sM.onInput((v) => (cfg.pm = v));
      sE.onInput((v) => (cfg.elites = v));
      sS.onInput((v) => (cfg.speed = v));
      const wrap = (label, node) => {
        const d = el(`<div><div class="faint" style="font-size:12px;margin-bottom:4px">${label}</div></div>`);
        d.appendChild(node);
        return d;
      };
      knobs.append(
        wrap("Algorithm type", typeSeg),
        wrap("Selection", selSeg),
        wrap("Crossover", xSeg),
        sPop,
        sT,
        sX,
        sM,
        sE,
        sS,
      );
      const syncSeg = (segNode, v) =>
        qsa("button", segNode).forEach((b) => b.classList.toggle("on", b.dataset.v === v));

      const algoSeg = N.seg(
        [
          ["ss", "Lecture algo 1: steady-state, mutation-only, tournament"],
          ["gen", "Lecture algo 2: generational, elitist, crossover, rank"],
          ["custom", "Custom"],
        ],
        cfg.algo,
        (v) => setAlgo(v, true),
      );
      qs("#algo", card).appendChild(algoSeg);
      function setAlgo(v, apply) {
        cfg.algo = v;
        syncSeg(algoSeg, v);
        if (apply && PRE[v]) {
          Object.assign(cfg, PRE[v]);
          syncSeg(typeSeg, cfg.type);
          syncSeg(selSeg, cfg.sel);
          syncSeg(xSeg, cfg.cross);
          sT.value = cfg.tsize;
          sX.value = cfg.xrate;
          sE.value = cfg.elites;
          reset();
        }
        qs("#ps", card).innerHTML = PSEUDO[v].map((l) => `<div>${l}</div>`).join("");
        qs("#gl", card).textContent = cfg.type === "gen" ? "Generations" : "Iterations";
      }

      const fitness = (g) => {
        let s = 0;
        for (let i = 0; i < L; i++) if (g[i] === target[i]) s++;
        return s / L;
      };
      const mutate = (g) => g.map((b) => (rnd() < cfg.pm ? 1 - b : b));
      function crossover(a, b) {
        if (cfg.cross === "none" || rnd() >= cfg.xrate) return (rnd() < 0.5 ? a : b).slice();
        if (cfg.cross === "uni") return a.map((x, i) => (rnd() < 0.5 ? x : b[i]));
        const c1 = randint(1, L - 1);
        if (cfg.cross === "one") return a.slice(0, c1).concat(b.slice(c1));
        let c2 = randint(1, L - 1);
        const [lo, hi] = [Math.min(c1, c2), Math.max(c1, c2)];
        return a.slice(0, lo).concat(b.slice(lo, hi), a.slice(hi));
      }
      let rankCache = null;
      function select() {
        if (cfg.sel === "random") return randint(0, pop.length - 1);
        if (cfg.sel === "tournament") return N.SEL.tournament(fits, cfg.tsize);
        if (cfg.sel === "roulette") return N.SEL.sample(N.SEL.rouletteProbs(fits));
        if (!rankCache) rankCache = N.SEL.rankProbs(fits, 1);
        return N.SEL.sample(rankCache);
      }
      function reset() {
        stop();
        pop = Array.from({ length: cfg.pop }, () => Array.from({ length: L }, () => randint(0, 1)));
        fits = pop.map(fitness);
        evals = cfg.pop;
        gens = 0;
        rankCache = null;
        hist = { best: [], mean: [], div: [] };
        record();
        draw();
      }
      function diversity() {
        let s = 0;
        for (let i = 0; i < L; i++) {
          let ones = 0;
          for (const g of pop) ones += g[i];
          const p = ones / pop.length;
          s += 1 - Math.abs(2 * p - 1);
        }
        return s / L;
      }
      function record() {
        hist.best.push(Math.max(...fits));
        hist.mean.push(fits.reduce((a, b) => a + b, 0) / fits.length);
        hist.div.push(diversity());
        if (hist.best.length > 400)
          ["best", "mean", "div"].forEach((k) => (hist[k] = hist[k].filter((_, i) => i % 2 === 0)));
      }
      function iterate() {
        if (cfg.type === "ss") {
          const X = pop[select()];
          let M;
          if (cfg.cross !== "none") M = mutate(crossover(X, pop[select()]));
          else M = rnd() < cfg.mute ? mutate(X) : X.slice();
          const fM = fitness(M);
          evals++;
          let wi = 0;
          for (let i = 1; i < fits.length; i++) if (fits[i] < fits[wi]) wi = i;
          if (fM >= fits[wi]) {
            pop[wi] = M;
            fits[wi] = fM;
            rankCache = null;
          }
          gens++;
          if (gens % Math.max(1, Math.round(cfg.pop / 2)) === 0) record();
        } else {
          rankCache = null;
          const order = fits.map((_, i) => i).sort((a, b) => fits[b] - fits[a]);
          const nx = order.slice(0, cfg.elites).map((i) => pop[i]),
            nf = order.slice(0, cfg.elites).map((i) => fits[i]);
          while (nx.length < cfg.pop) {
            const c = mutate(crossover(pop[select()], pop[select()]));
            nx.push(c);
            nf.push(fitness(c));
            evals++;
          }
          pop = nx;
          fits = nf;
          gens++;
          record();
        }
      }
      function draw() {
        const bi = fits.indexOf(Math.max(...fits));
        qs("#tg", card).innerHTML = target.map((b, i) => `<i class="${b ? "on" : ""}" data-i="${i}"></i>`).join("");
        qs("#bg", card).innerHTML = pop[bi]
          .map(
            (b, i) =>
              `<i class="${b ? "on" : ""}" style="${b !== target[i] ? "outline:1px solid rgba(255,75,75,.7);outline-offset:-1px" : ""}"></i>`,
          )
          .join("");
        qs("#bf", card).textContent = `${Math.round(fits[bi] * L)}/${L}`;
        qs("#se", card).textContent = evals.toLocaleString();
        qs("#sg", card).textContent = gens.toLocaleString();
        qs("#sb", card).textContent = fits[bi].toFixed(3);
        qs("#sm", card).textContent = (fits.reduce((a, b) => a + b, 0) / fits.length).toFixed(3);
        qs("#sd", card).textContent = hist.div[hist.div.length - 1].toFixed(2);
        const C = N.colors();
        N.lineChart(qs("#ch", card), {
          series: [
            { data: hist.best, color: C.teal },
            { data: hist.mean, color: C.violet },
            { data: hist.div, color: C.amber, dash: [4, 3] },
          ],
          yMin: 0,
          yMax: 1,
          height: 200,
          xLabel: "time",
        });
        const th = qs("#th", card);
        const show = Math.min(pop.length, 40);
        if (th.children.length !== show) {
          th.innerHTML = "";
          for (let k = 0; k < show; k++) {
            const c = document.createElement("canvas");
            c.width = W;
            c.height = W;
            th.appendChild(c);
          }
        }
        const order = fits
          .map((_, i) => i)
          .sort((a, b) => fits[b] - fits[a])
          .slice(0, show);
        order.forEach((pi, k) => {
          const ctx = th.children[k].getContext("2d");
          const img = ctx.createImageData(W, W);
          pop[pi].forEach((b, i) => {
            const o = i * 4;
            if (b) {
              img.data[o] = 79;
              img.data[o + 1] = 209;
              img.data[o + 2] = 181;
            } else {
              img.data[o] = 16;
              img.data[o + 1] = 19;
              img.data[o + 2] = 26;
            }
            img.data[o + 3] = 255;
          });
          ctx.putImageData(img, 0, 0);
          th.children[k].title = `f = ${fits[pi].toFixed(3)}`;
          th.children[k].style.imageRendering = "pixelated";
        });
        qsa("#tg i", card).forEach((c) =>
          c.addEventListener("click", () => {
            const i = +c.dataset.i;
            target[i] = 1 - target[i];
            fits = pop.map(fitness);
            rankCache = null;
            draw();
          }),
        );
      }
      function frame() {
        if (!running) return;
        const perFrame = cfg.type === "gen" ? Math.max(1, Math.round(cfg.speed / cfg.pop)) : cfg.speed;
        for (let k = 0; k < perFrame; k++) {
          iterate();
          if (Math.max(...fits) >= 1 || evals > 200000) {
            draw();
            stop();
            return;
          }
        }
        draw();
        life.frame(frame);
      }
      function stop() {
        running = false;
        const b = qs("#go", card);
        if (b) {
          b.textContent = "Run";
          b.classList.remove("on");
        }
      }
      qs("#go", card).onclick = () => {
        if (running) return stop();
        running = true;
        qs("#go", card).textContent = "Pause";
        qs("#go", card).classList.add("on");
        life.frame(frame);
      };
      qs("#st", card).onclick = () => {
        iterate();
        draw();
      };
      qs("#rs", card).onclick = reset;
      life.onCleanup(stop);
      Object.keys(TARGETS).forEach((k) => {
        const b = el(`<button class="btn small">${k}</button>`);
        b.onclick = () => {
          target = (TARGETS[k] || Array.from({ length: L }, () => (rnd() < 0.5 ? "1" : "0")).join(""))
            .split("")
            .map(Number);
          fits = pop.map(fitness);
          rankCache = null;
          draw();
        };
        qs("#tp", card).appendChild(b);
      });
      life.onResize(draw);
      setAlgo("ss", true);

      root.appendChild(
        el(`<div class="card"><div class="card-head"><h2>Experiments to run</h2><span class="tag violet">hands-on</span></div><ol style="margin:0;padding-left:20px">
        <li style="margin:6px 0"><b>Algo 1 vs Algo 2.</b> Run each to 144/144 and note the evaluation count. Which is faster on this problem?</li>
        <li style="margin:6px 0"><b>Pressure.</b> Algo 1 with tournament size 1, then 3, then 10. Watch the orange diversity line. At t = 1, does it progress at all? (Replace-worst still adds some pressure.)</li>
        <li style="margin:6px 0"><b>Roulette's weakness.</b> Custom → Generational + Roulette. Fitnesses all sit around 0.5–0.9, so the wheel is nearly uniform and pressure is weak. Compare with Rank.</li>
        <li style="margin:6px 0"><b>Mutation rate.</b> Set it to 0 (crossover only): the population stalls once diversity hits 0. Set it to 0.05 (~7 flips per child): exploitation collapses. Where's the sweet spot?</li>
        <li style="margin:6px 0"><b>Elitism.</b> Generational with 0 elites vs 1. Look for the best line dipping.</li></ol></div>`),
      );
      root.appendChild(
        predict({
          id: "l4-lab-1",
          q: "You choose Generational + <b>Roulette</b>, and every fitness sits between 0.5 and 0.9. How does selection behave?",
          opts: [
            "Weak: the best is only about twice the worst's chance",
            "Strong: the 0.9 individual wins almost every single spin",
            "None: every individual has exactly the same sized slice",
          ],
          a: 0,
          why: "Roulette slices are sized by raw fitness, and 0.9 is only 1.8 times 0.5, so the wheel is <b>nearly uniform</b> and the pressure is weak. Rank selection would ignore the small gaps and keep the pressure up. That's roulette's weakness when fitnesses are bunched together.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A full EA = representation + initialisation + selection + variation (crossover and/or mutation) + replacement + termination.",
            "Selection should be biased towards the fittest, but by a <b>tunable</b> amount.",
            "Choose the representation and the operators together, as one design decision.",
          ],
          "Selection sets the pressure, crossover exploits, mutation explores, and the representation decides which operators make sense.",
        ),
      );
    },
  });
})();

/* Lecture 4 — algorithm types, replacement, selection, representations, mutation, crossover */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, rnd, shuffle, gauss } = N;

  // ---------- Selection helpers (shared with lab + quiz) ----------
  const SEL = {
    rouletteProbs(f) { if (f.some((x) => x < 0)) return null; const s = f.reduce((a, b) => a + b, 0); return s > 0 ? f.map((x) => x / s) : null; },
    ranks(f, minimise) { const idx = f.map((_, i) => i).sort((a, b) => (minimise ? f[b] - f[a] : f[a] - f[b])); const r = new Array(f.length); idx.forEach((i, k) => (r[i] = k + 1)); return r; },
    rankProbs(f, b = 1, minimise = false) { const r = SEL.ranks(f, minimise).map((x) => x ** b); const s = r.reduce((a, c) => a + c, 0); return r.map((x) => x / s); },
    tournProbByRank(Npop, t) { return Array.from({ length: Npop }, (_, k) => ((k + 1) / Npop) ** t - (k / Npop) ** t); },
    sample(probs) { let u = rnd(), acc = 0; for (let i = 0; i < probs.length; i++) { acc += probs[i]; if (u < acc) return i; } return probs.length - 1; },
    tournament(f, t) { let b = randint(0, f.length - 1); for (let k = 1; k < t; k++) { const c = randint(0, f.length - 1); if (f[c] > f[b]) b = c; } return b; },
  };
  N.SEL = SEL;

  // ---------- Step-through runners used by lesson steps in lessons.js (NIC.runners, seeded RNG from l12.js) ----------
  N.runners = N.runners || {};
  const SVGNS = "http://www.w3.org/2000/svg";
  const seeded = (s) => (N.runners.mulberry32 ? N.runners.mulberry32(s) : Math.random);
  const setX = (node, x) => { if (window.gsap) window.gsap.set(node, { x }); else node.setAttribute("transform", `translate(${x} 0)`); };

  /** Roulette-wheel selection: slices ∝ fitness, seeded spins, a tally. Fitness values are editable. */
  N.runners.roulette = function rouletteRun(box, life) {
    const F = N.fig, names = ["A", "B", "C", "D", "E"], f = [3, 1, 5, 2, 4], SPINS = 5, SEED = 7;
    const CX = 125, CY = 128, R = 108, COLS = ["blue", "amber", "teal", "violet", "rose"];
    const pt = (a, rr) => [CX + rr * Math.sin(a), CY - rr * Math.cos(a)];
    function* frames() {
      const r = seeded(SEED), tot = f.reduce((a, b) => a + b, 0), fs = f.slice();
      const pct = (i) => Math.round((100 * fs[i]) / tot);
      const tally = fs.map(() => 0);
      const snap = (x) => ({ f: fs, tot, tally: tally.slice(), rot: 0, hit: -1, big: [], ...x });
      yield snap({ cap: `Each slice is sized by fitness. Total = ${fs.join(" + ")} = <b>${tot}</b>.`, line: 0 });
      const top = Math.max(...fs), big = fs.map((v, i) => (v === top ? i : -1)).filter((i) => i >= 0), b = big[0];
      yield snap({ big, cap: `<b>${names[b]}</b> has the biggest slice: p = ${fs[b]}/${tot} = <b>${pct(b)}%</b>. Now spin.`, line: 1,
        ask: { q: "Which individual is most likely to be picked? Tap it.", pick: ".rn-wheel-pk", a: big.map(String), why: `p = fitness ÷ total, so the fittest (${big.map((i) => names[i]).join(", ")}, f = ${top}) has the biggest slice.` } });
      let rot = 0;
      for (let s = 1; s <= SPINS; s++) {
        const u = r() * tot;
        let acc = 0, hit = fs.length - 1;
        for (let i = 0; i < fs.length; i++) { acc += fs[i]; if (u < acc) { hit = i; break; } }
        tally[hit]++;
        rot = 720 * s + (u / tot) * 360;
        yield snap({ rot, hit, cap: `Spin ${s}: r = <b>${u.toFixed(1)}</b> of ${tot}. The running total passes it in <b>${names[hit]}</b>'s slice.`, line: 3 });
      }
      const most = tally.indexOf(Math.max(...tally));
      yield snap({ rot, hit: -1, cap: `After ${SPINS} spins <b>${names[most]}</b> was picked most (${tally[most]}×). Over many spins each share tends to its p. Tap a fitness to change it.`, line: 4, mood: "love" });
    }
    F.run(box, life, {
      code: ["total = f₁ + f₂ + … + f_P", "slice i has p_i = f_i / total", "r = random number in [0, total)", "add up f_i until the sum passes r", "return that individual (repeat per parent)"],
      build(stage, api) {
        const svg = document.createElementNS(SVGNS, "svg");
        svg.setAttribute("viewBox", "0 0 470 256"); svg.setAttribute("class", "fig rn-svg rn-wheel");
        svg.innerHTML = `<g class="rn-wheel-sls">${names.map((n, i) => `<path class="rn-wheel-sl rn-wheel-pk" data-k="${i}" style="fill:var(--${COLS[i]})"/>`).join("")}</g>
          <g class="rn-wheel-lbls">${names.map((n) => `<text class="rn-wheel-sn">${n}</text>`).join("")}</g>
          <circle class="rn-wheel-rim" cx="${CX}" cy="${CY}" r="${R}"/>
          <g class="rn-wheel-ptr"><line x1="${CX}" y1="${CY}" x2="${CX}" y2="${CY - R + 16}"/><path d="M${CX - 9} ${CY - R + 20}L${CX} ${CY - R + 2}L${CX + 9} ${CY - R + 20}z"/><circle cx="${CX}" cy="${CY}" r="10"/></g>
          <text class="rn-wheel-h" x="262" y="22">who</text><text class="rn-wheel-h" x="318" y="22">f</text><text class="rn-wheel-h" x="372" y="22">p</text><text class="rn-wheel-h" x="430" y="22">picked</text>
          ${names.map((n, i) => `<g transform="translate(248 ${34 + i * 42})"><g class="rn-wheel-row rn-wheel-pk" data-k="${i}"><rect class="rn-wheel-bg" width="216" height="34" rx="10"/>
            <rect x="8" y="9" width="16" height="16" rx="5" style="fill:var(--${COLS[i]})"/><text class="rn-wheel-nm" x="38" y="23">${n}</text>
            <g class="rn-wheel-f" transform="translate(70 17)"><rect x="-15" y="-12" width="30" height="24" rx="7"/><text y="5" data-v="${f[i]}">${f[i]}</text></g>
            <text class="rn-wheel-p" x="124" y="23" data-v="">·</text><text class="rn-wheel-t" x="182" y="23" data-v="0">0</text></g></g>`).join("")}`;
        stage.appendChild(svg);
        const rows = [...svg.querySelectorAll(".rn-wheel-row")];
        rows.forEach((row, i) => { const chip = row.querySelector(".rn-wheel-f"), t = chip.querySelector("text"); api.edit(chip, { get: () => f[i], set: (v) => { f[i] = v; t.textContent = v; t.dataset.v = v; }, min: 1, max: 9 }); });
        return { svg, sl: [...svg.querySelectorAll(".rn-wheel-sl")], sn: [...svg.querySelectorAll(".rn-wheel-sn")], ptr: svg.querySelector(".rn-wheel-ptr"), rows,
          p: rows.map((r) => r.querySelector(".rn-wheel-p")), t: rows.map((r) => r.querySelector(".rn-wheel-t")) };
      },
      draw(s, fr, c) {
        let acc = 0;
        fr.f.forEach((v, i) => {
          const a0 = (acc / fr.tot) * 2 * Math.PI, a1 = ((acc + v) / fr.tot) * 2 * Math.PI, [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R), [lx, ly] = pt((a0 + a1) / 2, R * 0.66);
          acc += v;
          s.sl[i].setAttribute("d", `M${CX} ${CY}L${x0.toFixed(1)} ${y0.toFixed(1)}A${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}z`);
          s.sn[i].setAttribute("x", lx.toFixed(1)); s.sn[i].setAttribute("y", (ly + 5).toFixed(1));
          F.rn.text(c, s.p[i], Math.round((100 * v) / fr.tot) + "%");
          s.sl[i].classList.toggle("rn-wheel-big", fr.big.includes(i));
          s.rows[i].classList.toggle("rn-wheel-big", fr.big.includes(i));
        });
        const spin = !c.instant && window.gsap && fr.hit >= 0, land = spin ? 1.35 : 0;
        if (window.gsap) F.rn.to(c, s.ptr, { rotation: fr.rot, svgOrigin: `${CX} ${CY}`, ease: "power3.out" }, 0, 1.4);
        else s.ptr.setAttribute("transform", `rotate(${fr.rot} ${CX} ${CY})`);
        const mark = () => fr.f.forEach((_, i) => { s.sl[i].classList.toggle("rn-wheel-hit", fr.hit === i); s.rows[i].classList.toggle("rn-wheel-hit", fr.hit === i); });
        if (spin) { fr.f.forEach((_, i) => { s.sl[i].classList.toggle("rn-wheel-hit", false); s.rows[i].classList.toggle("rn-wheel-hit", false); }); c.tl.call(mark, null, land); }
        else mark();
        fr.tally.forEach((v, i) => F.rn.num(c, s.t[i], v, land));
        if (fr.hit >= 0) F.rn.pulse(c, s.rows[fr.hit], land);
      },
      frames,
    });
  };

  /** One-point then two-point crossover on bit strings. Drag the cut marker; the run recomputes. */
  N.runners.crossover = function crossoverRun(box, life) {
    const F = N.fig, LEN = 8, P1 = [1, 0, 1, 1, 0, 1, 1, 0], P2 = P1.map((b) => 1 - b), TWO = [2, 6];
    const X0 = 96, CW = 38, Y = { p1: 34, p2: 80, c1: 150, c2: 196 };
    let cut = 5;
    const str = (a) => a.join("");
    const cross = (cuts) => { const m = []; let side = 0; for (let i = 0; i < LEN; i++) { if (cuts.includes(i)) side = 1 - side; m.push(side); } return m; };
    const kid = (m, first) => m.map((s, i) => { const src = first ? s : 1 - s; return { v: src ? P2[i] : P1[i], src }; });
    function* frames() {
      const m1 = cross([cut]), c1 = kid(m1, true), c2 = kid(m1, false);
      const near = cut < LEN - 1 ? cut + 1 : cut - 1, alt = kid(cross([near]), true);
      const opts = [str(c1.map((g) => g.v)), str(c2.map((g) => g.v)), str(alt.map((g) => g.v))];
      const order = [[0, 1, 2], [1, 0, 2], [2, 1, 0], [1, 2, 0], [2, 0, 1]][cut % 5].map((k) => opts[k]), ok = order.indexOf(opts[0]);
      const snap = (x) => ({ cuts: [cut], k1: null, k2: null, opts: null, ok: -1, ...x });
      yield snap({ cap: "Two parents with 8 genes each. Drag the red <b>cut</b> marker to move it.", line: 0 });
      yield snap({ opts: order, cap: `One-point crossover: cut after gene <b>${cut}</b>. Which option is child 1?`, line: 0 });
      yield snap({ opts: order, ok, k1: c1, cap: `Child 1 = parent 1 before the cut + parent 2 after it: <b>${opts[0]}</b>.`, line: 1, mood: "happy",
        ask: { q: "What is child 1? Tap an option.", pick: ".rn-x-opt", a: String(ok), why: `Child 1 keeps parent 1's first ${cut} genes and takes parent 2's last ${LEN - cut}: <b>${opts[0]}</b>.` } });
      yield snap({ k1: c1, k2: c2, cap: `Child 2 is the opposite: parent 2 before the cut + parent 1 after it: <b>${opts[1]}</b>.`, line: 2 });
      const m2 = cross(TWO), t1 = kid(m2, true), t2 = kid(m2, false);
      yield snap({ cuts: TWO, cap: `Two-point crossover: cuts after genes <b>${TWO[0]}</b> and <b>${TWO[1]}</b>.`, line: 3 });
      yield snap({ cuts: TWO, k1: t1, k2: t2, cap: `The outsides stay and the middle ${TWO[1] - TWO[0]} genes swap: child 1 = <b>${str(t1.map((g) => g.v))}</b>, child 2 = <b>${str(t2.map((g) => g.v))}</b>.`, line: 4 });
      yield snap({ cuts: TWO, k1: t1, k2: t2, cap: "Crossover only <b>mixes</b> genes the parents already have. New values come from mutation.", mood: "love" });
    }
    F.run(box, life, {
      code: ["pick a cut c between two genes", "child 1 = parent 1[before c] + parent 2[after c]", "child 2 = parent 2[before c] + parent 1[after c]", "two-point: pick two cuts a < b", "swap the middle segment between a and b"],
      build(stage, api) {
        const svg = document.createElementNS(SVGNS, "svg");
        svg.setAttribute("viewBox", "0 0 420 290"); svg.setAttribute("class", "fig rn-svg rn-x");
        const genes = (key, arr) => arr.map((v, i) => `<g transform="translate(${X0 + i * CW + 3} ${Y[key]})"><g class="rn-x-g ${key}" data-i="${i}"><rect width="${CW - 6}" height="32" rx="8"/><text x="${(CW - 6) / 2}" y="22">${v}</text></g></g>`).join("");
        const marker = (k) => `<g class="rn-x-mk" data-m="${k}"><g class="rn-x-mv"><rect class="rn-x-hit" x="-14" y="2" width="28" height="238"/><line x1="0" x2="0" y1="22" y2="238"/><circle cx="0" cy="12" r="10"/><text y="16">↔</text></g></g>`;
        svg.innerHTML = `${[["p1", "Parent 1"], ["p2", "Parent 2"], ["c1", "Child 1"], ["c2", "Child 2"]].map(([k, t]) => `<text class="rn-x-lbl" x="6" y="${Y[k] + 21}">${t}</text>`).join("")}
          ${genes("p1", P1)}${genes("p2", P2)}${genes("c1", P1)}${genes("c2", P1)}
          ${marker(1)}${marker(0)}
          <g class="rn-x-opts">${[0, 1, 2].map((j) => `<g transform="translate(${34 + j * 128} 250)"><g class="rn-x-opt" data-k="${j}"><rect width="118" height="32" rx="10"/><text x="59" y="21"></text></g></g>`).join("")}</g>`;
        stage.appendChild(svg);
        const q = (s) => [...svg.querySelectorAll(s)];
        const sc = { svg, c1: q(".rn-x-g.c1"), c2: q(".rn-x-g.c2"), mk: q(".rn-x-mk").sort((a, b) => a.dataset.m - b.dataset.m), opts: q(".rn-x-opt"), optBox: svg.querySelector(".rn-x-opts") };
        const m0 = sc.mk[0], mv0 = m0.querySelector(".rn-x-mv");
        api.drag(m0, {
          move(x) { const k = Math.max(1, Math.min(LEN - 1, Math.round((x - X0) / CW))); if (k !== cut) { cut = k; setX(mv0, X0 + k * CW); N.sfx && N.sfx.play("tick"); } },
          end() { api.recompute(`Cut after gene ${cut}. Replaying from the start.`); },
        });
        return sc;
      },
      draw(s, f, c) {
        const g = window.gsap;
        s.mk.forEach((m, k) => {
          const on = k < f.cuts.length;
          m.style.visibility = on ? "visible" : "hidden";
          if (on) { const x = X0 + f.cuts[k] * CW, mv = m.querySelector(".rn-x-mv"); if (g) F.rn.to(c, mv, { x }, 0, 0.35); else setX(mv, x); }
        });
        [["c1", "k1"], ["c2", "k2"]].forEach(([row, key]) => {
          const arr = f[key], was = c.prev && c.prev[key];
          s[row].forEach((el, i) => {
            const gn = arr && arr[i];
            el.style.visibility = gn ? "visible" : "hidden";
            if (!gn) return;
            el.classList.toggle("rn-x-a", gn.src === 0);
            el.classList.toggle("rn-x-b", gn.src === 1);
            el.querySelector("text").textContent = gn.v;
            const same = was && was[i] && was[i].src === gn.src && was[i].v === gn.v;
            if (!same && !c.instant && g) {   // each gene drops down from the parent it came from
              g.set(el, { y: Y[gn.src ? "p2" : "p1"] - Y[row], opacity: 0.35 });
              F.rn.to(c, el, { y: 0, opacity: 1 }, 0.05 + i * 0.05, 0.5);
            } else F.rn.to(c, el, { y: 0, opacity: 1 }, 0, 0.01);
          });
        });
        s.optBox.style.visibility = f.opts ? "visible" : "hidden";
        s.opts.forEach((o, j) => {
          if (f.opts) o.querySelector("text").textContent = f.opts[j];
          o.classList.toggle("rn-x-ok", f.ok === j);
          o.classList.toggle("rn-x-off", f.ok >= 0 && f.ok !== j);
        });
        if (f.ok >= 0 && !(c.prev && c.prev.ok === f.ok)) F.rn.pulse(c, s.opts[f.ok], 0.5);
      },
      frames,
    });
  };

  const parseList = (s) => s.split(/[,\s]+/).filter(Boolean).map(Number).filter((x) => Number.isFinite(x));
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
  const cross = (a, b) => { const c = randint(1, GA_L - 1); return a.slice(0, c).concat(b.slice(c)); };

  /* ============ 4.1 Generational vs steady state ============ */
  N.register({
    id: "l4-types", lecture: 4, order: 1, num: "4.1", title: "Generational vs steady-state",
    blurb: "Two ways to run a GA: replace everyone each generation (optionally keeping elites), or trickle in 1–2 children at a time.",
    render(root, life) {
      root.appendChild(header(this, "<b>Generational</b>: apply selection and genetic operators repeatedly to build a <i>whole new</i> population. <b>Elitist</b> generational GAs copy the n best across unchanged. <b>Steady-state</b>: apply the operators only N times (N = 1 or 2), and the new children replace weak members. New solutions are <span style=\"color:var(--violet)\">purple</span>, like on the slides. The problem here is OneMax on 20 bits, so fitness is the fraction of 1s."));
      const P = 10;
      let mode = "gen", elite = 0, nSS = 2, pop, isNew, isElite, hist, evals, gen, running = null;
      function init() { pop = Array.from({ length: P }, bits); isNew = new Array(P).fill(false); isElite = new Array(P).fill(false); evals = P; gen = 0; hist = { best: [Math.max(...pop.map(fit))], mean: [pop.reduce((a, g) => a + fit(g), 0) / P], x: [evals] }; draw(); }
      const sel = () => pop[SEL.tournament(pop.map(fit), 2)];
      function step() {
        if (mode === "gen") {
          const order = pop.map((g, i) => i).sort((a, b) => fit(pop[b]) - fit(pop[a]));
          const next = [], ne = [], el2 = [];
          for (let k = 0; k < elite; k++) { next.push(pop[order[k]]); ne.push(false); el2.push(true); }
          while (next.length < P) { next.push(mutate(cross(sel(), sel()))); ne.push(true); el2.push(false); evals++; }
          pop = next; isNew = ne; isElite = el2;
        } else {
          isNew = new Array(P).fill(false); isElite = new Array(P).fill(false);
          for (let k = 0; k < nSS; k++) {
            const child = mutate(cross(sel(), sel())); evals++;
            let wi = 0; pop.forEach((g, i) => { if (fit(g) < fit(pop[wi])) wi = i; });
            if (fit(child) >= fit(pop[wi])) { pop[wi] = child; isNew[wi] = true; }
          }
        }
        gen++;
        hist.best.push(Math.max(...pop.map(fit))); hist.mean.push(pop.reduce((a, g) => a + fit(g), 0) / P); hist.x.push(evals);
        draw();
      }
      const card = el(`<div class="card"><div class="controls" id="b1"></div>
        <div class="grid side"><div><div class="card-head"><h3 id="gh"></h3></div><div class="pop" id="pop"></div>
          <p class="dim" id="expl" style="margin-top:12px"></p>
          <div class="controls"><button class="btn primary" id="st">Step</button><button class="btn" id="go">Run</button><button class="btn ghost" id="rs">New population</button></div></div>
        <div><h3>Fitness vs evaluations</h3><canvas class="viz" id="ch"></canvas><div class="legend"><span style="--c:var(--teal)">best</span><span style="--c:var(--violet)">mean</span></div></div></div></div>`);
      root.appendChild(card);
      const sE = N.slider("Elites kept", 0, 4, 1, elite), sN = N.slider("Children per step N", 1, 4, 1, nSS);
      sE.onInput((v) => (elite = v)); sN.onInput((v) => (nSS = v));
      qs("#b1", card).append(N.seg([["gen", "Generational"], ["ss", "Steady-state"]], mode, (v) => { mode = v; toggle(); init(); }), sE, sN);
      const toggle = () => { sE.style.display = mode === "gen" ? "" : "none"; sN.style.display = mode === "ss" ? "" : "none"; };
      toggle();
      function draw() {
        qs("#gh", card).textContent = mode === "gen" ? `Generation ${gen}` : `Iteration ${gen}`;
        qs("#pop", card).innerHTML = pop.map((g, i) => `<div class="chip ${isNew[i] ? "new" : ""} ${isElite[i] ? "elite" : ""}"><small>S${i + 1}</small><b>${fit(g).toFixed(2)}</b></div>`).join("");
        qs("#expl", card).innerHTML = mode === "gen" ? `Each step makes <b>${P - elite}</b> new children${elite ? ` and copies the best <b>${elite}</b> unchanged (green border)` : ""}. ${elite ? "" : "<span style=\"color:var(--rose)\">No elitism: the best can be lost.</span>"}` : `Each step makes <b>${nSS}</b> child${nSS > 1 ? "ren" : ""}. Each replaces the weakest member if it's no worse. Everyone else survives.`;
        N.lineChart(qs("#ch", card), { series: [{ data: hist.best, color: N.colors().teal }, { data: hist.mean, color: N.colors().violet }], yMin: 0, yMax: 1, height: 220, xLabel: mode === "gen" ? "generation" : "iteration" });
      }
      function stop() { if (running) { running(); running = null; qs("#go", card).textContent = "Run"; qs("#go", card).classList.remove("on"); } }
      qs("#st", card).onclick = step; qs("#rs", card).onclick = () => { stop(); init(); };
      qs("#go", card).onclick = () => { if (running) return stop(); qs("#go", card).textContent = "Pause"; qs("#go", card).classList.add("on"); running = life.interval(() => { step(); if (Math.max(...pop.map(fit)) === 1 || gen > 300) stop(); }, mode === "gen" ? 220 : 60); };
      life.onResize(draw);
      init();

      // Head-to-head
      const cmp = el(`<div class="card"><div class="card-head"><h2>Head-to-head (same evaluation budget)</h2><span class="faint">60 runs × 400 evaluations, P=10, OneMax-20</span></div>
        <div class="controls"><button class="btn" id="cmpB">Run comparison</button></div><canvas class="viz" id="cc"></canvas>
        <div class="legend"><span style="--c:var(--rose)">generational, no elitism</span><span style="--c:var(--amber)">generational, 1 elite</span><span style="--c:var(--teal)">steady-state, N=2</span></div><p class="dim" id="cmpT"></p></div>`);
      root.appendChild(cmp);
      qs("#cmpB", cmp).onclick = () => {
        const B = 400, bins = 40;
        const run = (m, e) => {
          let p = Array.from({ length: P }, bits), ev = P; const curve = new Array(bins).fill(0); let bestSoFar = Math.max(...p.map(fit)); let lastBin = 0;
          const selp = () => p[SEL.tournament(p.map(fit), 2)];
          const rec = () => { const b = Math.min(bins - 1, Math.floor((ev / B) * bins)); for (let k = lastBin; k <= b; k++) curve[k] = Math.max(...p.map(fit)); lastBin = b; };
          while (ev < B) {
            if (m === "gen") { const o = p.map((g, i) => i).sort((a, b) => fit(p[b]) - fit(p[a])); const nx = o.slice(0, e).map((i) => p[i]); while (nx.length < P) { nx.push(mutate(cross(selp(), selp()))); ev++; } p = nx; }
            else { for (let k = 0; k < 2; k++) { const c = mutate(cross(selp(), selp())); ev++; let wi = 0; p.forEach((g, i) => { if (fit(g) < fit(p[wi])) wi = i; }); if (fit(c) >= fit(p[wi])) p[wi] = c; } }
            rec();
          }
          return curve;
        };
        const avg = (m, e) => { const acc = new Array(bins).fill(0); for (let r = 0; r < 60; r++) run(m, e).forEach((v, i) => (acc[i] += v / 60)); return acc; };
        const C = N.colors();
        const a = avg("gen", 0), b = avg("gen", 1), c = avg("ss", 0);
        N.lineChart(qs("#cc", cmp), { series: [{ data: a, color: C.rose }, { data: b, color: C.amber }, { data: c, color: C.teal }], height: 220, xLabel: "evaluations (÷10)" });
        qs("#cmpT", cmp).innerHTML = `Mean <b>current-population best</b> after 400 evaluations: no elitism ${a[bins - 1].toFixed(3)}, 1 elite ${b[bins - 1].toFixed(3)}, steady-state ${c[bins - 1].toFixed(3)}. Steady-state uses each new child straight away, and replace-worst is itself elitist (the best is never replaced).`;
      };

      root.appendChild(predict({ id: "l4-types-1", q: "In a generational GA <b>without</b> elitism, can the best fitness in the population go <i>down</i> from one generation to the next?", opts: ["No, because selection favours the best", "Yes: every member is replaced by a new child, and the children might all be worse", "Only if the mutation rate is 100%"], a: 1,
        why: "Selection makes good parents <i>likely</i>, but their children are recombined and mutated, so nothing guarantees one of them matches the old best. That's the reason for <b>elitism</b>: copying the n best unchanged means the best fitness can never decrease. Set elites = 0 and run: look for dips in the green line." }));
      root.appendChild(predict({ id: "l4-types-2", q: "Steady-state GA with replace-weakest: is it elitist?", opts: ["Yes: the current best can never be the weakest (unless everyone ties), so it's never removed", "No, elitism only exists in generational GAs", "Only when N = 1"], a: 0,
        why: "Replacing only the weakest member means the best always survives, so steady-state + replace-worst is <b>implicitly elitist</b>. It's also greedy, which raises selection pressure and can cause early convergence." }));
      root.appendChild(takeaways([
        "<b>Generational</b>: build a whole new population each generation. <b>Elitist</b>: carry the n best over unchanged.",
        "<b>Steady-state</b>: create N (1–2) children per iteration and replace weak members. The population changes gradually.",
        "Without elitism a generational GA can lose its best solution. Steady-state with replace-worst never does.",
      ], "Generational GAs replace the whole population each generation, steady-state GAs replace a couple of weak members at a time, and elitism keeps the best."));
    },
  });

  /* ============ 4.2 Replacement ============ */
  N.register({
    id: "l4-replacement", lecture: 4, order: 2, num: "4.2", title: "Replacement: weakest vs first weaker",
    blurb: "Insert new children into a steady-state population and watch which member gets evicted, using the slides' numbers.",
    render(root, life) {
      root.appendChild(header(this, "In a steady-state GA every new child needs a slot. <b>Replace weakest</b> scans the whole population and evicts the worst member. <b>Replace first weaker</b> scans from the top and evicts the <i>first</i> member it finds that is weaker than the child. The numbers below are the lecture's examples."));
      const EX = {
        weakest: { pop: [0.1, 0.5, 0.3, 0.2, 0.9, 0.7, 0.3, 0.4, 0.4, 0.1], queue: [["S12", 0.5], ["S11", 0.1]] },
        first: { pop: [0.3, 0.5, 0.3, 0.2, 0.9, 0.7, 0.3, 0.4, 0.4, 0.1], queue: [["S12", 0.5], ["S11", 0.2]] },
      };
      let strat = "weakest", ties = true, pop, names, queue, busy = false;
      function reset() { const e = EX[strat]; pop = [...e.pop]; names = pop.map((_, i) => "S" + (i + 1)); queue = e.queue.map((q) => [...q]); busy = false; draw(); }
      const card = el(`<div class="card"><div class="controls" id="b1"></div>
        <div class="card-head"><h3>Population</h3></div><div class="pop" id="pop"></div>
        <div class="card-head" style="margin-top:16px"><h3>Waiting to be inserted</h3></div><div class="pop" id="q"></div>
        <div class="controls"><button class="btn primary" id="ins">Insert next child</button><button class="btn" id="add">+ Random child</button><button class="btn ghost" id="rs">Reset to lecture example</button></div>
        <div id="msg" class="callout" style="display:none"></div></div>`);
      root.appendChild(card);
      const tieBox = el(`<label class="field"><input type="checkbox" checked> treat equal fitness as "weaker"</label>`);
      qs("input", tieBox).onchange = (e) => (ties = e.target.checked);
      qs("#b1", card).append(N.seg([["weakest", "Replace weakest"], ["first", "Replace first weaker"]], strat, (v) => { strat = v; reset(); }), tieBox);
      function draw(mark = {}) {
        qs("#pop", card).innerHTML = pop.map((f, i) => `<div class="chip ${mark[i] || ""}"><small>${names[i]}</small><b>${f.toFixed(1)}</b></div>`).join("");
        qs("#q", card).innerHTML = queue.length ? queue.map(([n, f], i) => `<div class="chip new ${i === 0 ? "picked" : ""}"><small>${n}</small><b>${f.toFixed(1)}</b></div>`).join("") : `<span class="faint">empty: add a random child</span>`;
      }
      const weaker = (a, b) => (ties ? a <= b : a < b);
      const msg = (h, cls = "") => { const m = qs("#msg", card); m.style.display = "block"; m.className = "callout " + cls; m.innerHTML = h; };
      qs("#ins", card).onclick = () => {
        if (busy || !queue.length) return;
        busy = true;
        const [nm, f] = queue[0];
        if (strat === "weakest") {
          const min = Math.min(...pop); const wi = pop.indexOf(min);
          draw({ [wi]: "target" });
          life.timeout(() => {
            if (weaker(min, f)) { pop[wi] = f; names[wi] = nm; msg(`Scanned all ${pop.length} members. Weakest is at slot ${wi + 1} (f=${min}), so <b>${nm}</b> (f=${f}) replaces it.${pop.filter((x) => x === min).length > 0 && min === Math.min(...EX[strat].pop) ? " Ties go to the first minimum found." : ""}`, "teal"); draw({ [wi]: "new" }); }
            else { msg(`${nm} (f=${f}) is worse than even the weakest member (${min}), so it's discarded.`, "rose"); draw(); }
            queue.shift(); draw({ [wi]: weaker(min, f) ? "new" : "" }); busy = false;
          }, 700);
        } else {
          let i = 0;
          const scan = () => {
            if (i >= pop.length) { msg(`No member is weaker than ${nm} (f=${f}), so it's discarded.`, "rose"); queue.shift(); draw(); busy = false; return; }
            draw({ [i]: "scan" });
            if (weaker(pop[i], f)) {
              life.timeout(() => { const old = pop[i]; pop[i] = f; names[i] = nm; queue.shift(); draw({ [i]: "new" }); msg(`Scanned slots 1–${i + 1}. Slot ${i + 1} (f=${old}) is the first ${ties ? "no better than" : "weaker than"} ${nm} (f=${f}), so it's replaced. Scanning stops.`, "teal"); busy = false; }, 380);
            } else { i++; life.timeout(scan, 260); }
          };
          scan();
        }
      };
      qs("#add", card).onclick = () => { queue.push(["S" + (names.length + queue.length + 11), Math.round(rnd() * 10) / 10]); draw(); };
      qs("#rs", card).onclick = reset;
      reset();
      root.appendChild(el(`<div class="callout">The slides' result for "first weaker" (S11 at f=0.2 lands in slot 4, where there was another 0.2) only works if S12 is inserted first and <b>ties count as weaker</b>. That's this page's default. Untick the box to see strict "weaker than" instead: S11 then goes to slot 10.</div>`));
      root.appendChild(predict({ id: "l4-rep-1", q: "Which replacement strategy applies <b>less selection pressure</b> (keeps more diversity)?", opts: ["Replace weakest", "Replace first weaker", "They're identical"], a: 1,
        why: "Replace-weakest always removes the worst, which is the most greedy option. First-weaker can remove a mediocre member that happens to come early in the scan, so weak but possibly useful solutions survive longer. It's also cheaper: it can stop early instead of scanning everyone." }));
      root.appendChild(takeaways([
        "Replacement is where steady-state GAs apply survivor selection.",
        "<b>Replace weakest</b>: evict the minimum. High pressure, and the best is never lost.",
        "<b>Replace first weaker</b>: evict the first member (in scan order) that is weaker than the child. Lower pressure, and it can stop early.",
      ]));
    },
  });

  /* ============ 4.3 Selection pressure ============ */
  N.register({
    id: "l4-pressure", lecture: 4, order: 3, num: "4.3", title: "Selection pressure",
    blurb: "Too little pressure means no progress. Too much means premature convergence. See takeover happen, then find the sweet spot.",
    render(root, life) {
      root.appendChild(header(this, "<b>Selection pressure</b> is how strongly selection favours the fittest. The lecture's picture: <b>very low</b> pressure (random) → no evolutionary progress at all. <b>Modest</b> pressure → you may end up at the global optimum or at a good local one. <b>Very high</b> pressure (always pick the best) → you rush up the nearest hill and get stuck."));
      const METHODS = [["random", "Random"], ["roulette", "Roulette"], ["rank", "Rank"], ["t2", "Tournament t=2"], ["t5", "Tournament t=5"], ["best", "Always best"]];
      const P = 40, G = 18;
      let method = "t2";
      const card = el(`<div class="card"><div class="card-head"><h2>Takeover: selection only, no variation</h2></div>
        <p class="dim">40 individuals. Colour = fitness (pale = poor, deeper green = fitter, orange = best). Each row is a generation: pick 40 parents from the row above using the chosen method, with no mutation and no crossover. The only thing happening is selection, so you can see how fast it wipes out diversity.</p>
        <div class="controls" id="b1"></div><div class="controls"><button class="btn primary" id="go">Run 18 generations</button></div>
        <div class="grid side"><canvas class="viz" id="hm"></canvas><div><h3>Share of population that are copies of the original best</h3><canvas class="viz" id="tk"></canvas><p class="dim" id="tkT"></p></div></div></div>`);
      root.appendChild(card);
      qs("#b1", card).appendChild(N.seg(METHODS, method, (v) => { method = v; run(); }));
      function pick(f) {
        if (method === "random") return randint(0, f.length - 1);
        if (method === "roulette") return SEL.sample(SEL.rouletteProbs(f));
        if (method === "rank") return SEL.sample(SEL.rankProbs(f, 1));
        if (method === "t2") return SEL.tournament(f, 2);
        if (method === "t5") return SEL.tournament(f, 5);
        return f.indexOf(Math.max(...f));
      }
      function run() {
        const base = Array.from({ length: P }, (_, i) => 0.05 + (0.95 * i) / (P - 1));
        shuffle(base);
        const bestV = Math.max(...base);
        let rows = [base], share = [1 / P];
        for (let g = 1; g < G; g++) { const prev = rows[g - 1]; const nx = Array.from({ length: P }, () => prev[pick(prev)]); rows.push(nx); share.push(nx.filter((x) => x === bestV).length / P); }
        const { ctx, w, h } = N.setupCanvas(qs("#hm", card), 300);
        const cw = w / P, ch = h / G;
        rows.forEach((row, g) => row.forEach((v, i) => {
          const t = (v - 0.05) / 0.95;
          ctx.fillStyle = v === bestV ? "#ff9600" : `hsl(${200 - t * 110}, ${60 + t * 30}%, ${88 - t * 42}%)`;
          ctx.fillRect(i * cw + 0.5, g * ch + 0.5, cw - 1, ch - 1);
        }));
        N.lineChart(qs("#tk", card), { series: [{ data: share, color: N.colors().amber, dots: true }], yMin: 0, yMax: 1, height: 200, xLabel: "generation" });
        const distinct = new Set(rows[G - 1]).size;
        qs("#tkT", card).innerHTML = `After ${G - 1} generations: <b>${distinct}</b> distinct individuals remain out of 40, and the best holds <b>${Math.round(share[G - 1] * 100)}%</b> of slots. ${method === "random" ? "Random selection is pure genetic drift. Diversity still shrinks (by chance), but not towards the best." : method === "best" ? "Instant takeover: one generation and diversity is gone." : ""}`;
      }
      qs("#go", card).onclick = run;
      life.onResize(run);
      run();

      // Sweet spot experiment
      const sw = el(`<div class="card"><div class="card-head"><h2>Finding the sweet spot</h2><span class="faint">generational EA on the multimodal landscape · 100 runs per bar · 40 generations · P=20</span></div>
        <p class="dim">Tournament size t sets the pressure. t = 1 is random selection. Watch two numbers: how often the population finds the global peak, and how close the average member ends up to it.</p>
        <div class="controls"><button class="btn primary" id="sB">Run experiment</button></div><canvas class="viz" id="sC"></canvas>
        <div class="legend"><span style="--c:var(--teal)">% runs finding global optimum</span><span style="--c:var(--violet)">final mean fitness (% of max)</span></div><p class="dim" id="sT"></p></div>`);
      root.appendChild(sw);
      qs("#sB", sw).onclick = () => {
        const L = N.makeLandscape("multimodal"), ts = [1, 2, 3, 4, 6, 8, 12, 20];
        const hits = [], means = [];
        ts.forEach((t) => {
          let hsum = 0, msum = 0;
          for (let r = 0; r < 100; r++) {
            let p = Array.from({ length: 20 }, () => randint(0, L.N - 1)); let found = false;
            for (let g = 0; g < 40; g++) { const f = p.map(L.f); p = p.map(() => N.clamp(p[SEL.tournament(f, t)] + Math.round(gauss() * 3), 0, L.N - 1)); if (p.some((x) => L.f(x) >= L.max - 1e-9)) found = true; }
            if (found) hsum++; msum += p.reduce((a, x) => a + L.f(x), 0) / 20 / L.max;
          }
          hits.push(hsum); means.push(msum);
        });
        const C = N.colors();
        N.barChart(qs("#sC", sw), { groups: [{ values: hits, color: C.teal }, { values: means, color: C.violet }], labels: ts.map((t) => "t=" + t), yMax: 100, height: 220, decimals: 0 });
        qs("#sT", sw).innerHTML = "Expect t=1 to show poor mean fitness (no pressure means no progress), very large t to show lower success (premature convergence on whichever hill wins early), and a sweet spot at modest t.";
      };

      root.appendChild(predict({ id: "l4-pr-1", q: "Your EA's population becomes nearly identical within a few generations and stalls on a mediocre solution. What's the most likely fix?", opts: ["Increase tournament size", "Reduce selection pressure (smaller tournament, rank with low bias) and/or increase mutation", "Remove mutation entirely"], a: 1,
        why: "Fast loss of diversity followed by stagnation is <b>premature convergence</b>, the classic sign of too much pressure. Lower the pressure or add exploration (more mutation) so the population keeps sampling other regions." }));
      root.appendChild(takeaways([
        "Selection pressure = how strongly selection favours the fittest.",
        "Too low (random): drift, no progress. Too high (always best): takeover in a few generations, then premature convergence on a local optimum.",
        "Good EAs use <b>modest, tunable</b> pressure: tournament size, rank bias.",
      ], "Selection pressure trades off progress against diversity: too little and nothing improves, too much and the population converges prematurely."));
    },
  });

  /* ============ shared: fitness input + presets ============ */
  function fitnessInput(card, onChange, initial = PRESETS.lecture.v) {
    const box = el(`<div><div class="controls"><label class="field">Fitnesses <input type="text" id="fi" value="${initial}" style="width:360px;font-family:var(--mono)"></label></div><div class="controls" id="pre"></div></div>`);
    const input = qs("#fi", box);
    Object.entries(PRESETS).forEach(([k, p]) => { const b = el(`<button class="btn small">${p.n}</button>`); b.onclick = () => { input.value = p.v; onChange(parseList(p.v), k); }; qs("#pre", box).appendChild(b); });
    input.addEventListener("input", () => onChange(parseList(input.value), null));
    card.appendChild(box);
    return () => parseList(input.value);
  }
  const PALETTE = ["#58cc02", "#ce82ff", "#ff9600", "#1cb0f6", "#ff4b4b", "#0a8fd1", "#a560e8", "#ffc800", "#2b9a00", "#ea2b2b", "#5b7cfa", "#cc7a00"];

  /* ============ 4.4 Roulette ============ */
  N.register({
    id: "l4-roulette", lecture: 4, order: 4, num: "4.4", title: "Roulette wheel selection",
    blurb: "Spin a fitness-proportionate wheel. Then break it with superfit individuals, negative fitness, and minimisation.",
    render(root, life) {
      root.appendChild(header(this, "The \"grand old method\": <b>fitness-proportionate selection</b>. With fitnesses f<sub>1</sub>…f<sub>P</sub>, individual i is chosen with probability <b>p<sub>i</sub> = f<sub>i</sub> / Σ<sub>k</sub> f<sub>k</sub></b>. That's the same as spinning a roulette wheel whose sectors are proportional to fitness."));
      const card = el(`<div class="card"></div>`);
      root.appendChild(card);
      let f = [], rot = 0, counts = [], spinning = false;
      const getF = fitnessInput(card, (v) => { f = v; counts = new Array(f.length).fill(0); draw(); });
      const body = el(`<div class="grid two"><div><canvas class="viz" id="wh" style="max-width:380px;margin:auto;background:transparent;border:0"></canvas>
          <div class="controls" style="justify-content:center"><button class="btn primary" id="spin">Spin</button><button class="btn" id="k">Spin 1,000× instantly</button><button class="btn ghost" id="clr">Clear counts</button></div><div id="res" style="text-align:center" class="dim"></div></div>
        <div><div id="warn"></div><table class="t" id="tb"></table><h3 style="margin-top:14px">Observed vs expected</h3><canvas class="viz" id="hist"></canvas><div class="legend"><span style="--c:var(--line-2)">expected p</span><span style="--c:var(--teal)">observed share</span></div></div></div>`);
      card.appendChild(body);
      f = getF(); counts = new Array(f.length).fill(0);
      function probs() { return SEL.rouletteProbs(f); }
      function draw(hl = -1) {
        const p = probs();
        const cv = qs("#wh", card);
        const { ctx, w, h } = N.setupCanvas(cv, 330);
        const cx = w / 2, cy = h / 2 + 6, R = Math.max(1, Math.min(w, h) / 2 - 16);
        if (w < 40) return; // not laid out yet (e.g. detached while the lesson player moves it)
        ctx.clearRect(0, 0, w, h);
        if (!p) {
          ctx.fillStyle = N.colors().rose; ctx.font = "600 15px " + getComputedStyle(document.body).fontFamily; ctx.textAlign = "center";
          ctx.fillText("Can't build a wheel:", cx, cy - 10); ctx.fillText("a sector can't have negative size", cx, cy + 14);
        } else {
          let a = rot - Math.PI / 2;
          p.forEach((pi, i) => {
            const a2 = a + pi * Math.PI * 2;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a, a2); ctx.closePath();
            ctx.fillStyle = PALETTE[i % PALETTE.length] + (hl === -1 || hl === i ? "ee" : "44"); ctx.fill();
            ctx.strokeStyle = NIC.colors().panel; ctx.lineWidth = 2; ctx.stroke();
            if (pi > 0.035) { const m = (a + a2) / 2; ctx.fillStyle = "#fff"; ctx.font = "800 12px " + getComputedStyle(document.body).fontFamily; ctx.textAlign = "center"; ctx.fillText("f" + (i + 1), cx + Math.cos(m) * R * 0.68, cy + Math.sin(m) * R * 0.68 + 4); }
            a = a2;
          });
          ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.fillStyle = NIC.colors().panel; ctx.fill();
        }
        ctx.fillStyle = N.colors().text; ctx.beginPath(); ctx.moveTo(cx - 10, 4); ctx.lineTo(cx + 10, 4); ctx.lineTo(cx, 22); ctx.closePath(); ctx.fill();
        const tot = counts.reduce((a, b) => a + b, 0);
        qs("#warn", card).innerHTML = !p ? `<div class="callout rose"><b>Negative fitness breaks roulette.</b> A probability can't be negative. You'd have to shift or rescale fitness first, and the choice of shift changes the selection behaviour completely.</div>` :
          Math.max(...p) > 0.9 ? `<div class="callout rose"><b>Superfit problem:</b> one individual takes ${Math.round(Math.max(...p) * 100)}% of the wheel, more than all the rest put together. It will take over the population almost immediately. Try the "Superfit + 100" preset.</div>` : "";
        qs("#tb", card).innerHTML = `<tr><th>i</th><th class="num">f<sub>i</sub></th><th class="num">p<sub>i</sub> = f<sub>i</sub>/Σf</th><th class="num">Picked</th></tr>` + f.map((x, i) => `<tr class="${hl === i ? "hl" : ""}"><td><span style="color:${PALETTE[i % PALETTE.length]}">■</span> ${i + 1}</td><td class="num">${x}</td><td class="num">${p ? (p[i] * 100).toFixed(1) + "%" : "—"}</td><td class="num">${counts[i] || 0}</td></tr>`).join("") + (p ? `<tr><td class="faint">Σ</td><td class="num">${+f.reduce((a, b) => a + b, 0).toFixed(3)}</td><td class="num">100%</td><td class="num">${tot}</td></tr>` : "");
        if (p) N.barChart(qs("#hist", card), { groups: [{ values: p, color: N.colors().line_2 }, { values: tot ? counts.map((c) => c / tot) : p.map(() => 0), color: N.colors().teal }], labels: f.map((_, i) => "f" + (i + 1)), height: 160, yMax: Math.max(...p, ...(tot ? counts.map((c) => c / tot) : [0])) * 1.1 });
      }
      qs("#spin", card).onclick = () => {
        const p = probs(); if (!p || spinning) return;
        spinning = true;
        const target = SEL.sample(p);
        const start = p.slice(0, target).reduce((a, b) => a + b, 0), mid = start + p[target] * (0.2 + 0.6 * rnd());
        const from = rot, to = rot - (rot % (Math.PI * 2)) + Math.PI * 2 * 5 + (Math.PI * 2 - mid * Math.PI * 2);
        const t0 = performance.now(), D = 2200;
        const ease = (x) => 1 - Math.pow(1 - x, 4);
        const tick = (now) => {
          const x = Math.min(1, (now - t0) / D); rot = from + (to - from) * ease(x); draw();
          if (x < 1) life.frame(tick); else { counts[target]++; draw(target); qs("#res", card).innerHTML = `Selected <b style="color:${PALETTE[target % PALETTE.length]}">individual ${target + 1}</b> (f=${f[target]}, p=${(p[target] * 100).toFixed(1)}%)`; spinning = false; }
        };
        life.frame(tick);
      };
      qs("#k", card).onclick = () => { const p = probs(); if (!p) return; for (let i = 0; i < 1000; i++) counts[SEL.sample(p)]++; draw(); };
      qs("#clr", card).onclick = () => { counts = new Array(f.length).fill(0); draw(); };
      life.onResize(() => draw());
      draw();

      root.appendChild(predict({ id: "l4-rw-1", q: "Load the <b>TSP lengths</b> preset (32, 33, 32, 34, 28), where shorter is better. What does roulette selection do?", opts: ["Favours the 28 tour, which is best", "Slightly favours the <i>longest</i> tours, the opposite of what we want, and barely distinguishes them anyway", "Refuses to run"], a: 1,
        why: "Roulette assumes <b>bigger = better</b>. With raw lengths, 34 gets the biggest slice. You'd need to transform the values (e.g. 1/length or max − length), and each transform gives different pressure. The spread is also tiny (28 vs 34 is only 18.9% vs 22.9%), so pressure is weak however you flip it." }));
      root.appendChild(predict({ id: "l4-rw-2", q: "Population fitnesses 100, 0.4, 0.3, 0.2, 0.1. Add 100 to every fitness. What happens to selection?", opts: ["Nothing: same ranking, same probabilities", "The superfit individual drops from ≈99% to ≈33% of the wheel, so pressure falls sharply", "It becomes even more dominant"], a: 1,
        why: "Roulette depends on <b>absolute</b> fitness values, not just the order. 200/(200+100.4+100.3+100.2+100.1) = 200/601 ≈ 33%. The lecture's take-home message: <i>fitness-proportionate selection requires us to be very careful how we design the fine detail of fitness assignment.</i>" }));
      root.appendChild(takeaways([
        "p<sub>i</sub> = f<sub>i</sub> / Σf. Simple and \"fair\", and still widely used.",
        "Breaks for <b>minimisation</b> and <b>negative</b> fitness, and is hijacked by <b>superfit</b> individuals.",
        "Depends on absolute values: shifting all fitnesses by a constant changes the selection pressure.",
      ], "Roulette selection picks in proportion to raw fitness, so it's sensitive to scale, shifts, negatives and superfit outliers."));
    },
  });

  /* ============ 4.5 Rank ============ */
  N.register({
    id: "l4-rank", lecture: 4, order: 5, num: "4.5", title: "Rank-based selection",
    blurb: "Throw away raw fitness values and keep only the order. Tune the bias with rank^b.",
    render(root, life) {
      root.appendChild(header(this, "Sort the population and give the fittest rank <b>P</b> (popsize) down to rank <b>1</b> for the least fit. Selection probability is proportional to rank: <b>p<sub>i</sub> = rank<sub>i</sub> / F</b>, where <b>F = P(P+1)/2</b>. Variants use a function of rank. The lecture shows <b>rank<sup>0.5</sup></b> (low bias) and <b>rank<sup>2</sup></b> (high bias)."));
      const card = el(`<div class="card"></div>`);
      root.appendChild(card);
      let f = [], b = 1, minimise = false;
      const getF = fitnessInput(card, (v, k) => { f = v; if (k === "tsp") { minimise = true; qs("#mm input", card).checked = true; } draw(); });
      f = getF();
      const body = el(`<div><div class="controls" id="b1"></div><div class="grid two"><div><table class="t" id="tb"></table></div>
        <div><canvas class="viz" id="bc"></canvas><div class="legend"><span style="--c:var(--line-2)">roulette p</span><span style="--c:var(--teal)">rank p (current bias)</span></div><div id="note" class="dim" style="margin-top:8px"></div></div></div></div>`);
      card.appendChild(body);
      const sB = N.slider("Bias exponent b (rank<sup>b</sup>)", 0, 3, 0.05, b, (v) => v.toFixed(2));
      sB.onInput((v) => { b = v; draw(); });
      const mm = el(`<label class="field" id="mm"><input type="checkbox"> minimise (lower value = better)</label>`);
      qs("input", mm).onchange = (e) => { minimise = e.target.checked; draw(); };
      const presetsB = N.seg([["0.5", "low bias 0.5"], ["1", "linear 1"], ["2", "high bias 2"]], "1", (v) => { b = +v; sB.value = b; draw(); });
      qs("#b1", card).append(sB, presetsB, mm);
      function draw() {
        if (!f.length) return;
        const r = SEL.ranks(f, minimise), p = SEL.rankProbs(f, b, minimise), rp = SEL.rouletteProbs(f);
        const Pn = f.length;
        qs("#tb", card).innerHTML = `<tr><th>i</th><th class="num">f<sub>i</sub></th><th class="num">rank</th><th class="num">rank<sup>${b.toFixed(2)}</sup></th><th class="num">p (rank)</th><th class="num">p (roulette)</th></tr>` +
          f.map((x, i) => `<tr><td>${i + 1}</td><td class="num">${x}</td><td class="num">${r[i]}</td><td class="num">${(r[i] ** b).toFixed(2)}</td><td class="num" style="color:var(--teal)">${(p[i] * 100).toFixed(1)}%</td><td class="num faint">${rp && !minimise ? (rp[i] * 100).toFixed(1) + "%" : "—"}</td></tr>`).join("");
        const C = N.colors();
        N.barChart(qs("#bc", card), { groups: [{ values: rp && !minimise ? rp : p.map(() => 0), color: C.line_2 }, { values: p, color: C.teal }], labels: f.map((_, i) => "f" + (i + 1)), height: 220 });
        qs("#note", card).innerHTML = `P = ${Pn}, so for b = 1: F = P(P+1)/2 = <b>${(Pn * (Pn + 1)) / 2}</b>. Best gets ${Pn}/${(Pn * (Pn + 1)) / 2} = ${((2 / (Pn + 1)) * 100).toFixed(1)}%. ${b === 0 ? "<b>b = 0 → every rank weight is 1 → uniform random selection (zero pressure).</b>" : ""}`;
      }
      draw();
      root.appendChild(predict({ id: "l4-rank-1", q: "Superfit population 100, 0.4, 0.3, 0.2, 0.1 with <b>linear</b> rank selection. What's the best individual's selection probability?", opts: ["≈ 99%", "5/15 ≈ 33%", "1/5 = 20%", "It depends on how much bigger 100 is"], a: 1,
        why: "Ranks are 5,4,3,2,1 and F = 5·6/2 = 15, so p = 5/15 = <b>33.3%</b>. Rank selection ignores how much fitter the superfit individual is, only that it's first. The same holds for negative values and for minimisation (just rank the other way)." }));
      root.appendChild(predict({ id: "l4-rank-2", q: "What does increasing the exponent b in rank<sup>b</sup> do?", opts: ["Lowers selection pressure", "Raises selection pressure: top ranks get a disproportionately bigger share", "Nothing, since ranks are fixed"], a: 1,
        why: "Larger b stretches the gap between high and low ranks: b=2 is the lecture's \"high bias\", b=0.5 \"low bias\", and b=0 is uniform random. So b is a <b>pressure dial</b> that doesn't depend on the raw fitness scale." }));
      root.appendChild(takeaways([
        "Rank from P (best) down to 1 (worst). p<sub>i</sub> = rank<sub>i</sub> / (P(P+1)/2).",
        "Immune to superfit individuals, negative values and scale. Minimisation just means ranking the other way.",
        "rank<sup>b</sup> tunes the bias: 0.5 low, 1 linear, 2 high. It needs a sort, so O(P log P) per generation.",
      ]));
    },
  });

  /* ============ 4.6 Tournament ============ */
  N.register({
    id: "l4-tournament", lecture: 4, order: 6, num: "4.6", title: "Tournament selection",
    blurb: "Pick t at random and keep the best. Watch tournaments happen and see how t controls pressure.",
    render(root, life) {
      root.appendChild(header(this, "To select a parent: choose <b>t</b> individuals at random <b>with replacement</b> and return the fittest. The lecture lists the pros and cons. <span style=\"color:var(--teal)\">+ tunable, + avoids superfit/superpoor problems, + simple and efficient (no sorting).</span> <span style=\"color:var(--rose)\">− one more parameter to tune.</span>"));
      let Pn = 12, t = 3, fits, counts;
      const newPop = () => { fits = shuffle(Array.from({ length: Pn }, (_, i) => i + 1)); counts = new Array(Pn).fill(0); };
      newPop();
      const card = el(`<div class="card"><div class="controls" id="b1"></div><div class="pop" id="pop"></div>
        <div class="controls"><button class="btn primary" id="one">Run one tournament</button><button class="btn" id="many">Run 5,000</button><button class="btn ghost" id="np">New population</button></div>
        <div id="msg" class="dim"></div>
        <div class="grid two" style="margin-top:12px"><div><h3>P(selected) by fitness rank</h3><canvas class="viz" id="pc"></canvas><div class="legend"><span style="--c:var(--line-2)">theory: (r/P)<sup>t</sup> − ((r−1)/P)<sup>t</sup></span><span style="--c:var(--teal)">observed</span></div></div>
        <div><h3>What t does</h3><div id="stats"></div></div></div></div>`);
      root.appendChild(card);
      const sP = N.slider("Population P", 4, 30, 1, Pn), sT = N.slider("Tournament size t", 1, 10, 1, t);
      sP.onInput((v) => { Pn = v; newPop(); draw(); }); sT.onInput((v) => { t = v; counts = new Array(Pn).fill(0); draw(); });
      qs("#b1", card).append(sP, sT);
      function draw(mark = {}) {
        qs("#pop", card).innerHTML = fits.map((x, i) => `<div class="chip ${mark[i] || ""}"><small>#${i + 1}</small><b>${x}</b></div>`).join("");
        const theory = SEL.tournProbByRank(Pn, t); const tot = counts.reduce((a, b) => a + b, 0);
        const obs = new Array(Pn).fill(0); fits.forEach((x, i) => (obs[x - 1] = tot ? counts[i] / tot : 0));
        const C = N.colors();
        N.barChart(qs("#pc", card), { groups: [{ values: theory, color: C.line_2 }, { values: obs, color: C.teal }], labels: theory.map((_, k) => String(k + 1)), height: 200 });
        const pBest = 1 - ((Pn - 1) / Pn) ** t, pWorst = (1 / Pn) ** t;
        qs("#stats", card).innerHTML = `<div class="stat-row"><div class="stat teal"><small>P(best wins a tournament)</small><b>${(pBest * 100).toFixed(1)}%</b></div><div class="stat rose"><small>P(worst wins)</small><b>${(pWorst * 100).toFixed(pWorst < 0.001 ? 4 : 2)}%</b></div></div>
          <div class="stat-row"><div class="stat amber"><small>Expected winner percentile</small><b>${Math.round((t / (t + 1)) * 100)}th</b></div><div class="stat"><small>Individuals never picked (per 1 select)</small><b>${(((Pn - 1) / Pn) ** t * 100).toFixed(0)}% chance each</b></div></div>
          <p class="dim">t = 1 is <b>random selection</b>. Larger t → the winner is drawn from further up the rankings → higher pressure. The worst can only win a tournament where every pick is the worst, with probability (1/P)<sup>t</sup>.</p>`;
      }
      qs("#one", card).onclick = () => {
        const picks = Array.from({ length: t }, () => randint(0, Pn - 1));
        let k = 0; const mark = {};
        const show = () => {
          if (k < picks.length) { mark[picks[k]] = "picked"; draw(mark); k++; life.timeout(show, 320); return; }
          const w = picks.reduce((b, i) => (fits[i] > fits[b] ? i : b), picks[0]);
          mark[w] = "winner"; counts[w]++; draw(mark);
          qs("#msg", card).innerHTML = `Picked ${picks.map((i) => `#${i + 1} (f=${fits[i]})`).join(", ")}${new Set(picks).size < picks.length ? ' <span style="color:var(--amber)">(repeats allowed: with replacement)</span>' : ""} → winner <b style="color:var(--teal)">#${w + 1}</b> with f=${fits[w]}.`;
        };
        show();
      };
      qs("#many", card).onclick = () => { for (let i = 0; i < 5000; i++) counts[SEL.tournament(fits, t)]++; draw(); };
      qs("#np", card).onclick = () => { newPop(); draw(); };
      life.onResize(() => draw());
      draw();
      root.appendChild(predict({ id: "l4-t-1", q: "The lecture asks: what selection pressure is there with <b>t = 10</b> and <b>popsize = 10,000</b>?", opts: ["Enormous: t=10 always picks the best", "Modest: pressure depends on t, not popsize. The winner is typically around the 91st percentile, and the single best individual wins only ≈0.1% of tournaments", "None, because t is tiny compared with the population"], a: 1,
        why: "Tournament pressure depends on <b>t</b> alone (relative rank), not on population size. Expected winner percentile = t/(t+1) ≈ 91%. P(best is in the tournament) = 1 − (9999/10000)<sup>10</sup> ≈ 0.1%. So t=10 in a huge population behaves like t=10 in a small one: it biases towards the top ~10%, but it's not \"always pick the best\"." }));
      root.appendChild(takeaways([
        "Tournament: sample t with replacement and return the best. Pressure rises with t, and t = 1 is random.",
        "Only compares fitnesses, so it handles superfit, negative and minimised values with no scaling tricks. It needs no sort, so it's O(t) per selection.",
        "Pressure depends on t, not on population size.",
      ], "Tournament selection samples t individuals and returns the best: tunable, cheap, and indifferent to fitness scale."));
    },
  });

  /* ============ 4.7 Representations & mutation ============ */
  N.register({
    id: "l4-mutation", lecture: 4, order: 7, num: "4.7", title: "Encodings & mutation",
    blurb: "Binary, k-ary, real-valued and permutation chromosomes, each with its own mutation operators. Some combinations break.",
    render(root, life) {
      root.appendChild(header(this, "A chromosome can be an <b>integer vector, binary string, real-valued vector, permutation, or tree</b>. <b>Different representations need representation-specific operators</b> to work well, or to work at all. Operators should balance <b>exploitation</b> (a fair chance of producing good new solutions through small changes) with <b>exploration</b> (the ability to reach anywhere in the space)."));
      const card = el(`<div class="card"><div class="tabs" id="tabs"><button data-t="kary" class="on">k-ary / integer</button><button data-t="real">Real-valued</button><button data-t="perm">Permutation</button><button data-t="bin">Binary</button></div><div id="tb"></div></div>`);
      root.appendChild(card);
      const gRow = (lbl, arr, cls = () => "", extra = "") => `<div class="genome-row"><span class="lbl">${lbl}</span><span class="genome">${arr.map((c, i) => `<span class="gene ${cls(i)}">${c}</span>`).join("")}</span>${extra}</div>`;
      const TABS = {
        kary(tb) {
          let g = [3, 5, 2, 8, 7, 2], prev = null, changed = [], k = 10, M = 2;
          tb.innerHTML = `<p class="dim">A list of L numbers, each from 0 to k−1. Example: the <b>Water Distribution Problem</b> with 100 pipes and 5 possible diameters is a 5-ary encoding with L = 100. The lecture's example: <span class="mono">352872</span> (k = 10).</p>
            <div class="controls"><button class="btn" data-op="single">Single-gene</button><button class="btn" data-op="multi">M-gene</button><button class="btn" data-op="swap">Swap</button><button class="btn ghost" data-op="reset">Reset</button></div><div id="mc"></div><div id="out"></div>`;
          const sM = N.slider("M", 1, 6, 1, M); sM.onInput((v) => (M = v)); qs("#mc", tb).appendChild(sM);
          const draw = (note = "") => {
            qs("#out", tb).innerHTML = (prev ? gRow("before", prev) : "") + gRow(prev ? "after" : "chromosome", g, (i) => (changed.includes(i) ? "changed" : "")) +
              `<p class="dim">Values present: {${[...new Set(g)].sort((a, b) => a - b).join(", ")}} ${note}</p>`;
          };
          qsa("[data-op]", tb).forEach((b) => b.onclick = () => {
            const op = b.dataset.op; prev = [...g];
            if (op === "reset") { g = [3, 5, 2, 8, 7, 2]; prev = null; changed = []; return draw(); }
            if (op === "single" || op === "multi") { changed = []; for (let m = 0; m < (op === "single" ? 1 : M); m++) { const i = randint(0, g.length - 1); let v; do v = randint(0, k - 1); while (v === g[i]); g[i] = v; changed.push(i); } draw(op === "single" ? "· one gene changed to a random new value" : `· ${M} single-gene mutations (may hit the same gene twice)`); }
            if (op === "swap") { const i = randint(0, g.length - 1); let j; do j = randint(0, g.length - 1); while (j === i); [g[i], g[j]] = [g[j], g[i]]; changed = [i, j]; draw('· <span style="color:var(--rose)">swap only rearranges values that are already there: no new value can appear</span>'); }
          });
          draw();
        },
        real(tb) {
          let v = [0.3, 0.2, 0.4, 0.2, 0.1], prev = null, ch = [], sigma = 0.05;
          tb.innerHTML = `<p class="dim">A vector of L real numbers. <b>Single-gene</b>: pick one gene and add a small random deviation, often Gaussian. <b>Vector</b>: add a small random vector to the whole thing.</p>
            <div class="controls" id="c"><button class="btn" data-op="single">Single-gene (Gaussian)</button><button class="btn" data-op="vector">Vector mutation</button><button class="btn ghost" data-op="reset">Reset</button></div>
            <div class="grid two"><div><canvas class="viz" id="bars"></canvas><div id="vals" class="mono dim" style="margin-top:6px"></div></div><div><canvas class="viz" id="cloud"></canvas><p class="faint" style="font-size:12.5px;margin-top:6px">300 vector mutants of a 2-D parent (center). σ sets the step size, the exploitation ↔ exploration dial.</p></div></div>`;
          const sS = N.slider("σ", 0.01, 0.3, 0.01, sigma, (x) => x.toFixed(2)); sS.onInput((x) => { sigma = x; draw(); }); qs("#c", tb).prepend(sS);
          function draw() {
            const C = N.colors();
            N.barChart(qs("#bars", tb), { groups: [{ values: prev || v, color: C.line_2 }, { values: v, color: (i) => (ch.includes(i) ? C.violet : C.teal) }], labels: v.map((_, i) => "x" + (i + 1)), height: 200, yMax: Math.max(0.6, ...v, ...(prev || [])) });
            qs("#vals", tb).textContent = "(" + v.map((x) => x.toFixed(3)).join(", ") + ")";
            const { ctx, w, h } = N.setupCanvas(qs("#cloud", tb), 220);
            ctx.clearRect(0, 0, w, h); const s = Math.min(w, h) / 2 / 0.6;
            ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
            ctx.fillStyle = "rgba(206,130,255,0.5)";
            for (let i = 0; i < 300; i++) { ctx.beginPath(); ctx.arc(w / 2 + gauss() * sigma * s, h / 2 + gauss() * sigma * s, 2, 0, 7); ctx.fill(); }
            ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(w / 2, h / 2, 5, 0, 7); ctx.fill();
          }
          qsa("[data-op]", tb).forEach((b) => b.onclick = () => {
            const op = b.dataset.op;
            if (op === "reset") { v = [0.3, 0.2, 0.4, 0.2, 0.1]; prev = null; ch = []; return draw(); }
            prev = [...v];
            if (op === "single") { const i = randint(0, v.length - 1); v[i] += gauss() * sigma; ch = [i]; }
            else { v = v.map((x) => x + gauss() * sigma); ch = v.map((_, i) => i); }
            draw();
          });
          draw(); life.onResize(draw);
        },
        perm(tb) {
          let g = "DEGJACBFIH".split(""), prev = null, cls = [], note = "";
          tb.innerHTML = `<p class="dim">The lecture asks: <i>Here is a permutation of length 10: DEGJACBFIH. Can we do single-gene mutation? Can we do swap mutation?</i> Try both.</p>
            <div class="controls"><button class="btn" data-op="single">Single-gene</button><button class="btn" data-op="swap">Swap</button><button class="btn ghost" data-op="reset">Reset</button></div><div id="out"></div>`;
          const draw = () => { qs("#out", tb).innerHTML = (prev ? gRow("before", prev) : "") + gRow(prev ? "after" : "chromosome", g, (i) => cls[i] || "") + `<div>${note}</div>`; };
          qsa("[data-op]", tb).forEach((b) => b.onclick = () => {
            const op = b.dataset.op;
            if (op === "reset") { g = "DEGJACBFIH".split(""); prev = null; cls = []; note = ""; return draw(); }
            prev = [...g];
            if (op === "single") {
              const i = randint(0, 9); const letters = "ABCDEFGHIJ".split("").filter((c) => c !== g[i]); g[i] = letters[randint(0, letters.length - 1)];
              const counts = {}; g.forEach((c) => (counts[c] = (counts[c] || 0) + 1));
              const missing = "ABCDEFGHIJ".split("").filter((c) => !counts[c]);
              cls = g.map((c, x) => (counts[c] > 1 ? "bad" : x === i ? "changed" : ""));
              note = `<div class="callout rose"><b>Invalid!</b> "${g[i]}" now appears twice and <b>${missing.join(", ")}</b> is missing. For a TSP, that means visiting one city twice and skipping another. Single-gene mutation doesn't preserve the permutation.</div>`;
            } else {
              const i = randint(0, 9); let j; do j = randint(0, 9); while (j === i); [g[i], g[j]] = [g[j], g[i]];
              cls = g.map((_, x) => (x === i || x === j ? "good" : ""));
              note = `<div class="callout teal"><b>Valid.</b> Swap only rearranges, so every letter still appears exactly once. That's why it suits permutations (and why it was the TSP operator in Lecture 3).</div>`;
            }
            draw();
          });
          draw();
        },
        bin(tb) {
          let L = 24, pm = 1 / 24, g = Array.from({ length: L }, () => randint(0, 1)), prev = null, ch = [];
          tb.innerHTML = `<p class="dim">Binary strings are k-ary with k = 2, so single-gene mutation is a <b>bit flip</b>. A common setup applies it to <i>each gene independently</i> with rate p<sub>m</sub>, often 1/L, which gives one flip per child on average.</p>
            <div class="controls" id="c"><button class="btn primary" data-op="m">Mutate</button><button class="btn" data-op="k">Mutate 1,000× and count flips</button></div><div id="out"></div><canvas class="viz" id="hist"></canvas>`;
          const sPm = N.slider("p<sub>m</sub> per gene", 0, 0.3, 0.005, pm, (x) => x.toFixed(3)); sPm.onInput((x) => (pm = x)); qs("#c", tb).prepend(sPm);
          const draw = () => { qs("#out", tb).innerHTML = (prev ? gRow("before", prev) : "") + gRow(prev ? "after" : "chromosome", g, (i) => (ch.includes(i) ? "changed" : "")) + `<p class="dim">Expected flips = L × p<sub>m</sub> = ${(L * pm).toFixed(2)}. ${prev ? `This time: <b>${ch.length}</b>.` : ""}</p>`; };
          qsa("[data-op]", tb).forEach((b) => b.onclick = () => {
            if (b.dataset.op === "m") { prev = [...g]; ch = []; g = g.map((x, i) => { if (rnd() < pm) { ch.push(i); return 1 - x; } return x; }); draw(); }
            else { const c = new Array(11).fill(0); for (let r = 0; r < 1000; r++) { let n = 0; for (let i = 0; i < L; i++) if (rnd() < pm) n++; c[Math.min(10, n)]++; } N.barChart(qs("#hist", tb), { groups: [{ values: c, color: N.colors().violet }], labels: c.map((_, i) => (i === 10 ? "10+" : String(i))), height: 160, decimals: 0 }); }
          });
          draw();
        },
      };
      qsa("#tabs button", card).forEach((b) => b.addEventListener("click", () => { qsa("#tabs button", card).forEach((x) => x.classList.toggle("on", x === b)); TABS[b.dataset.t](qs("#tb", card)); }));
      TABS.kary(qs("#tb", card));
      root.appendChild(predict({ id: "l4-mut-1", q: "The lecture asks about swap mutation on a k-ary encoding like 352872: <i>why is this probably not very good in this context?</i>", opts: ["It's too slow to compute", "It can never introduce a value that isn't already present, so it can't explore the space; it only reshuffles existing values", "It produces invalid chromosomes"], a: 1,
        why: "In the water-distribution example, if no pipe currently has diameter 4, swapping can <b>never</b> create one. Swap preserves the multiset of values, which is exactly right for permutations (every value must appear once) and exactly wrong for k-ary, where any value can go anywhere." }));
      root.appendChild(takeaways([
        "Representations: integer/k-ary, binary, real-valued, permutations, trees. <b>Operators must match the representation.</b>",
        "k-ary: single-gene (random new value), M-gene. Swap is a poor fit because it never introduces new values.",
        "Real-valued: add Gaussian noise to one gene or add a small random vector. σ controls exploit vs explore.",
        "Permutation: single-gene mutation creates duplicates, so it's invalid. Swap keeps validity.",
      ], "Mutation has to match the encoding: random values for k-ary, Gaussian noise for reals, swaps for permutations."));
    },
  });

  /* ============ 4.8 Crossover ============ */
  N.register({
    id: "l4-crossover", lecture: 4, order: 8, num: "4.8", title: "Crossover operators",
    blurb: "Place the cut points yourself for 1-point, 2-point and uniform crossover, then try it on permutations and watch it break.",
    render(root, life) {
      root.appendChild(header(this, "Recombination for k-ary encodings. <b>1-point</b>: cut both parents at the same place and swap the tails. <b>2-point / k-point</b>: k cuts, alternate segments. <b>Uniform</b>: a random binary <b>mask</b> decides, gene by gene, which parent each child takes from. Click between genes to move the cuts, or click mask bits to flip them."));
      let type = "one", cuts = [5], mask = [0, 1, 0, 0, 1, 1, 0, 1], permMode = false;
      const P1s = () => (permMode ? "ABCDEFGH" : "ABCDEFGH").split(""), P2s = () => (permMode ? "HGFEDCBA" : "KLMNOPQR").split("");
      const card = el(`<div class="card"><div class="controls" id="b1"></div><div id="viz"></div><div class="controls"><button class="btn" id="rnd">Randomise cuts / mask</button><button class="btn ghost" id="lec">Lecture example</button></div><div id="note"></div></div>`);
      root.appendChild(card);
      const pm = el(`<label class="field"><input type="checkbox"> use permutation parents</label>`);
      qs("input", pm).onchange = (e) => { permMode = e.target.checked; draw(); };
      qs("#b1", card).append(N.seg([["one", "1-point"], ["two", "2-point"], ["k", "k-point"], ["uni", "Uniform"]], type, (v) => { type = v; lecture(); }), pm);
      function lecture() { cuts = type === "one" ? [5] : type === "two" ? [2, 6] : type === "k" ? [1, 3, 5, 7] : []; mask = [0, 1, 0, 0, 1, 1, 0, 1]; draw(); }
      function srcMask() {
        if (type === "uni") return mask;
        const m = []; let side = 0, c = [...cuts].sort((a, b) => a - b);
        for (let i = 0; i < 8; i++) { if (c.includes(i)) side = 1 - side; m.push(side); }
        return m;
      }
      function draw() {
        const p1 = P1s(), p2 = P2s(), m = srcMask();
        const c1 = p1.map((g, i) => (m[i] ? p2[i] : g)), c2 = p2.map((g, i) => (m[i] ? p1[i] : g));
        const dup = (arr) => arr.map((c) => arr.filter((x) => x === c).length > 1);
        const d1 = dup(c1), d2 = dup(c2);
        const geneRow = (lbl, arr, clsFn, clickable) => `<div class="genome-row"><span class="lbl">${lbl}</span><span class="genome">${arr.map((g, i) => `<span class="gene ${clsFn(i)} ${clickable && type !== "uni" && i < 7 ? "click" : ""} ${type !== "uni" && cuts.includes(i + 1) ? "cut" : ""}" data-i="${i}">${g}</span>`).join("")}</span></div>`;
        qs("#viz", card).innerHTML = geneRow("Parent 1", p1, () => "p1", true) + geneRow("Parent 2", p2, () => "p2", true) +
          (type === "uni" ? `<div class="genome-row"><span class="lbl">Mask</span><span class="genome">${mask.map((b, i) => `<span class="gene click" data-m="${i}" style="${b ? "border-color:var(--violet);color:var(--violet)" : ""}">${b}</span>`).join("")}</span><span class="faint">1 = swap this gene</span></div>` : `<p class="faint" style="margin:4px 0 10px 102px;font-size:12.5px">Click a gene in either parent to toggle a cut after it.</p>`) +
          geneRow("Child 1", c1, (i) => (permMode && d1[i] ? "bad" : m[i] ? "p2" : "p1")) + geneRow("Child 2", c2, (i) => (permMode && d2[i] ? "bad" : m[i] ? "p1" : "p2"));
        qs("#note", card).innerHTML = permMode && (d1.some(Boolean) || d2.some(Boolean)) ? `<div class="callout rose"><b>Invalid permutations.</b> Child 1 repeats ${[...new Set(c1.filter((_, i) => d1[i]))].join(", ")}. As a tour, some cities are visited twice and others never. Standard k-ary crossover doesn't respect the permutation constraint, so permutations need special operators (next lecture).</div>` : permMode ? `<div class="callout teal">This particular cut happened to produce valid children. Try other cuts.</div>` : "";
        qsa("[data-i]", card).forEach((g) => g.addEventListener("click", () => {
          if (type === "uni") return; const i = +g.dataset.i + 1; if (i >= 8) return;
          if (type === "one") cuts = [i]; else if (cuts.includes(i)) cuts = cuts.filter((c) => c !== i); else { cuts.push(i); if (type === "two" && cuts.length > 2) cuts.shift(); }
          draw();
        }));
        qsa("[data-m]", card).forEach((g) => g.addEventListener("click", () => { const i = +g.dataset.m; mask[i] = 1 - mask[i]; draw(); }));
      }
      qs("#rnd", card).onclick = () => {
        if (type === "uni") mask = mask.map(() => randint(0, 1));
        else { const n = type === "one" ? 1 : type === "two" ? 2 : randint(3, 5); cuts = shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, n); }
        draw();
      };
      qs("#lec", card).onclick = lecture;
      lecture();
      root.appendChild(predict({ id: "l4-x-1", q: "With 1-point crossover on 8 genes, which pair of genes is <b>always</b> separated (always comes from different parents)?", opts: ["Genes 4 and 5", "Gene 1 and gene 8, the two ends", "No pair is always separated"], a: 1,
        why: "Every cut position (1–7) falls somewhere between gene 1 and gene 8, so the two ends <i>always</i> go to different parents, while neighbouring genes usually stay together. This is <b>positional bias</b>: 1-point crossover preserves blocks of adjacent genes. Uniform crossover has no positional bias because each gene is decided independently. (See the Eiben & Smith reading, ch. 3.)" }));
      root.appendChild(takeaways([
        "1-point: one cut, swap tails. 2-point / k-point: alternate segments between cuts. Uniform: a random mask per gene.",
        "Crossover <b>combines</b> building blocks from good parents (exploitation); it can't create values that neither parent has.",
        "Representation and operators must be designed together: k-ary crossover on permutations produces invalid children.",
      ], "Crossover recombines existing genes via cut points or a mask; it has to respect the encoding, which plain k-ary crossover doesn't for permutations."));
    },
  });
})();

/* pso-01: Lecture 12 (particle swarm optimisation): shared kernel (landscape, swarm, sandbox, helpers) and 12.1 particles, swarm, optimisation. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = (NIC.shared.nicL12 = NIC.shared.nicL12 || {});

  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  /** Quick check and predict builders. Spec: "question | right answer | wrong | wrong | why" (the engine shuffles the order). */
  const parts = (spec) => {
    const x = spec.split(" | ");
    return { q: x[0], opts: x.slice(1, -1), why: x[x.length - 1] };
  };
  const C = (spec, hint) => {
    const { q, opts, why } = parts(spec);
    return { q, o: opts, a: 0, why, ...(hint ? { hint } : {}) };
  };
  const pr = (id, spec) => predict((({ q, opts, why }) => ({ id, q, opts, a: 0, why }))(parts(spec)));

  // ---------- the odour field: three hills (a narrow food peak, a broad decoy, a weak bump) on a 10 x 10 map ----------
  const PK = [
    [7.4, 7.2, 1, 0.8],
    [2.4, 2.8, 0.7, 1.9],
    [7.6, 1.8, 0.35, 0.9],
  ];
  const BOX = 10,
    VMAX = 3,
    S_PX = 40;
  const fit = (x, y) =>
    PK.reduce((s, [a, b, h, g]) => s + h * Math.exp(-((x - a) ** 2 + (y - b) ** 2) / (2 * g * g)), 0);
  const odour = (f) => Math.round(f * 100);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function newSwarm(seed, n, vs = 1) {
    const r = mulberry(seed);
    const P = Array.from({ length: n }, () => {
      const x = [r() * BOX, r() * BOX];
      return {
        x,
        v: [(r() - 0.5) * vs, (r() - 0.5) * vs],
        p: x.slice(),
        pf: fit(x[0], x[1]),
        f: fit(x[0], x[1]),
        last: null,
      };
    });
    const b = P.reduce((a, q) => (q.pf > a.pf ? q : a));
    const S = { r, P, g: { x: b.p.slice(), f: b.pf }, it: 0, hist: [], stale: 0, r0: 1, born: [] };
    S.r0 = spread(S) || 1;
    return S;
  }
  function spread(S) {
    const n = S.P.length,
      m = [0, 1].map((j) => S.P.reduce((a, q) => a + q.x[j], 0) / n);
    return Math.sqrt(S.P.reduce((a, q) => a + (q.x[0] - m[0]) ** 2 + (q.x[1] - m[1]) ** 2, 0) / n);
  }
  /** Who a particle follows: the swarm best (k = 0), or the best personal best among k neighbours each side on a ring. */
  function leader(S, i, k) {
    if (!k) return S.g;
    const n = S.P.length;
    let b = null;
    for (let d = -k; d <= k; d++) {
      const q = S.P[(((i + d) % n) + n) % n];
      if (!b || q.pf > b.f) b = { x: q.p, f: q.pf };
    }
    return b;
  }
  /** One timestep of the slide formula, per dimension j: v = w v + c1 z1 (p - x) + c2 z2 (g - x), then x = x + v. */
  function step(S, P) {
    const lead = S.P.map((_, i) => leader(S, i, P.k || 0));
    S.P.forEach((q, i) => {
      const g = lead[i],
        x0 = q.x.slice(),
        v0 = q.v.map((a) => a * P.w),
        cog = [0, 0],
        soc = [0, 0];
      for (let j = 0; j < 2; j++) {
        cog[j] = P.c1 * S.r() * (q.p[j] - q.x[j]);
        soc[j] = P.c2 * S.r() * (g.x[j] - q.x[j]);
        q.v[j] = clamp(v0[j] + cog[j] + soc[j], -VMAX, VMAX);
        q.x[j] += q.v[j];
        if (q.x[j] < 0 || q.x[j] > BOX) {
          q.x[j] = clamp(q.x[j], 0, BOX);
          q.v[j] = 0;
        }
      }
      q.last = { x0, v0, cog, soc, g: g.x.slice() };
    });
    S.P.forEach((q) => {
      q.f = fit(q.x[0], q.x[1]);
      if (q.f > q.pf) {
        q.pf = q.f;
        q.p = q.x.slice();
      }
    });
    const was = S.g.f;
    S.P.forEach((q) => {
      if (q.pf > S.g.f) S.g = { x: q.p.slice(), f: q.pf };
    });
    S.stale = S.g.f > was + 1e-9 ? 0 : S.stale + 1;
    S.it++;
    S.hist.push({
      best: odour(S.g.f),
      mean: odour(S.P.reduce((a, q) => a + q.f, 0) / S.P.length),
      rad: spread(S) / S.r0,
    });
    return S;
  }
  const run = (seed, n, P, its) => {
    const S = newSwarm(seed, n, P.vs || 1);
    for (let i = 0; i < its; i++) step(S, P);
    return S;
  };

  // ---------- drawing the map ----------
  const heats = {};
  const heat = (cells) => {
    if (heats[cells]) return heats[cells];
    const w = (BOX * S_PX) / cells;
    let s = "";
    for (let i = 0; i < cells; i++)
      for (let j = 0; j < cells; j++) {
        const f = fit(((i + 0.5) * BOX) / cells, ((j + 0.5) * BOX) / cells);
        s += `<rect x="${(i * w).toFixed(1)}" y="${((cells - 1 - j) * w).toFixed(1)}" width="${w + 0.4}" height="${w + 0.4}" fill="var(--teal)" fill-opacity="${(0.04 + 0.8 * Math.pow(f, 0.8)).toFixed(2)}"/>`;
      }
    return (heats[cells] = s);
  };
  const px = (p) => [p[0] * S_PX, (BOX - p[1]) * S_PX];
  function arrow(a, b, col, o = {}) {
    const [x1, y1] = px(a),
      [x2, y2] = px(b),
      len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 3) return "";
    const t = Math.atan2(y2 - y1, x2 - x1),
      h = o.head || 9;
    const hd = [0.45, -0.45].map(
      (d) => `${(x2 - h * Math.cos(t + d)).toFixed(1)},${(y2 - h * Math.sin(t + d)).toFixed(1)}`,
    );
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${o.w || 3}" stroke-linecap="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ""}/><polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${hd.join(" ")}" fill="${col}"/>`;
  }
  const COL = { v: "var(--text-dim)", cog: "var(--blue)", soc: "var(--amber)" };
  /** The particles, the swarm best, and (for the followed particle) the three pieces of its last move added head to tail. */
  function dyn(S, o = {}) {
    let s = "";
    const q = S.P[o.sel];
    if (q && o.pulls && q.last) {
      const { x0, v0, cog, soc } = q.last;
      const a = [x0[0] + v0[0], x0[1] + v0[1]],
        b = [a[0] + cog[0], a[1] + cog[1]],
        c = [b[0] + soc[0], b[1] + soc[1]];
      s += `<g class="nw12-chain">${arrow(x0, a, COL.v)}${arrow(a, b, COL.cog)}${arrow(b, c, COL.soc)}</g>`;
      s += `<circle cx="${px(x0)[0]}" cy="${px(x0)[1]}" r="5" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-dasharray="3 3"/>`;
    }
    if (q && o.pulls) {
      const [bx, by] = px(q.p);
      s += `<circle cx="${bx}" cy="${by}" r="8" fill="none" stroke="var(--violet)" stroke-width="3"/>`;
    }
    S.P.forEach((p, i) => {
      const [x, y] = px(p.x);
      s += `<circle class="nw12-pt" data-i="${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === o.sel ? 8 : 6}" fill="var(--blue)" stroke="${i === o.sel ? "var(--text)" : "var(--panel)"}" stroke-width="2.5"/>`;
      if (o.labels) s += `<text x="${x + 9}" y="${y - 8}" class="nw12-lab">${odour(p.f)}</text>`;
    });
    const [gx, gy] = px(S.g.x);
    return `${s}<text x="${gx}" y="${gy + 8}" text-anchor="middle" class="nw12-star">★</text>`;
  }
  const mapSVG = (S, o = {}) =>
    `<svg class="fig nw12-map" viewBox="0 0 400 400" style="width:min(100%,${o.h || 400}px);max-height:${o.h || 400}px" role="img" aria-label="${o.says || "Map of the odour field. Brighter green is a stronger scent. Blue dots are particles and the orange star is the best position found by the swarm."}"><g>${heat(o.cells || 32)}</g><g data-dyn>${dyn(S, o)}</g></svg>`;

  const STATS = (S) => {
    const t = S.hist[S.hist.length - 1];
    return `<div class="wk-stat"><small>Iteration</small><b>${S.it}</b></div><div class="wk-stat teal"><small>Best odour</small><b>${odour(S.g.f)}</b></div><div class="wk-stat blue"><small>Swarm spread</small><b>${Math.round((t ? t.rad : 1) * 100)}%</b></div><div class="wk-stat amber"><small>No new best for</small><b>${S.stale}</b></div>`;
  };
  const RULES = [
    ["max", "Maximum iterations", (S) => S.it >= 50, "50 iterations"],
    ["good", "Acceptable solution", (S) => odour(S.g.f) >= 95, "odour 95 or more"],
    ["stale", "No improvement", (S) => S.stale >= 8, "8 iterations without a new best"],
    [
      "rad",
      "Swarm radius near zero",
      (S) => S.hist.length > 0 && S.hist[S.hist.length - 1].rad < 0.05,
      "spread under 5%",
    ],
  ];
  const DEFS = {
    n: ["Swarm size", 3, 40, 1, "n"],
    c1: ["c₁", 0, 4, 0.1, "c1"],
    c2: ["c₂", 0, 4, 0.1, "c2"],
    w: ["Momentum kept", 0, 1, 0.05, "w"],
    k: ["Neighbours each side (0 = whole swarm)", 0, 5, 1, "k"],
  };
  /** The 2-D swarm sandbox. o: {title, controls, params, pulls, rules, seed, onStep(S, P), chart} */
  function swarmDemo(root, life, o = {}) {
    let seed = o.seed || 5,
      running = false,
      sel = 0;
    const P = { n: 14, c1: 2, c2: 2, w: 1, k: 0, vs: 1, ...(o.params || {}) };
    let S = newSwarm(seed, P.n, P.vs);
    const card = el(
      `<div class="card nw12-demo"><div class="card-head"><h2>${o.title || "Particle swarm on the odour field"}</h2></div>
      <div class="controls" data-ctl></div>
      <div class="controls"><button class="btn primary" data-a="step">Step</button><button class="btn" data-a="run">Run</button>${o.pulls ? '<button class="btn" data-a="next">Follow next particle</button>' : ""}<button class="btn ghost" data-a="reset">Reset</button></div>
      <div class="grid two"><div><div data-map></div><p class="nw12-legend"><span class="nw12-k blue"></span>particle ${o.pulls ? '<span class="nw12-k violet"></span>its own best (pbest) ' : ""}<span class="nw12-k star">★</span>swarm best (gbest)</p></div>
      <div>${o.chart === false ? "" : '<canvas class="viz" data-ch></canvas><p class="nw12-legend"><span class="nw12-k teal"></span>best odour so far <span class="nw12-k amber"></span>average odour of the swarm</p>'}${o.pulls ? '<p class="nw12-legend" data-key><span class="nw12-k grey"></span>current velocity <span class="nw12-k cb"></span>personal pull <span class="nw12-k ca"></span>global pull</p>' : ""}</div></div>
      <div class="nw12-stats" data-st></div>${o.rules ? '<div class="nw12-rules" data-rules></div>' : ""}</div>`,
    );
    root.appendChild(card);
    const ctl = qs("[data-ctl]", card);
    (o.controls || []).forEach((key) => {
      const [lab, lo, hi, st, k] = DEFS[key];
      const s = N.slider(lab, lo, hi, st, P[k], (v) => (Number.isInteger(v) ? v : +v.toFixed(2)));
      s.onInput((v) => {
        P[k] = v;
        if (k === "n") reset(false);
      });
      ctl.append(s);
    });
    const fired = {};
    function draw() {
      const m = qs("[data-map]", card);
      if (!m.firstChild) m.innerHTML = mapSVG(S, { sel, pulls: o.pulls });
      else qs("[data-dyn]", m).innerHTML = dyn(S, { sel, pulls: o.pulls });
      const h = S.hist;
      if (o.chart !== false)
        N.lineChart(qs("[data-ch]", card), {
          series: [
            { data: h.map((x) => x.best), color: N.colors().teal },
            { data: h.map((x) => x.mean), color: N.colors().amber },
          ],
          yMin: 0,
          yMax: 100,
          height: 190,
          xLabel: "iteration",
          names: ["best odour so far", "average odour of the swarm"],
        });
      qs("[data-st]", card).innerHTML = STATS(S);
      if (o.rules)
        qs("[data-rules]", card).innerHTML =
          `<h3>Would it stop now?</h3>` +
          RULES.map(([id, name, test, say]) => {
            const on = test(S);
            if (on && !fired[id]) fired[id] = S.it;
            return `<div class="nw12-rule${on ? " on" : ""}"><b>${name}</b><small>${say}</small><span>${on ? "stop" : fired[id] ? `fired at ${fired[id]}` : "keep going"}</span></div>`;
          }).join("");
    }
    function go(k = 1) {
      for (let i = 0; i < k; i++) step(S, P);
      draw();
      if (o.onStep) o.onStep(S, P);
    }
    function reset(next = true) {
      if (next) seed++;
      S = newSwarm(seed, P.n, P.vs);
      Object.keys(fired).forEach((k) => delete fired[k]);
      sel = 0;
      draw();
      if (o.onStep) o.onStep(S, P);
    }
    const bt = (a) => qs(`[data-a="${a}"]`, card);
    bt("step").onclick = () => go();
    bt("reset").onclick = () => reset();
    if (o.pulls)
      bt("next").onclick = () => {
        sel = (sel + 1) % S.P.length;
        draw();
      };
    bt("run").onclick = () => {
      running = !running;
      bt("run").textContent = running ? "Pause" : "Run";
    };
    life.interval(() => running && go(), 330);
    qs("[data-map]", card).addEventListener("click", (e) => {
      const t = e.target.closest("[data-i]");
      if (t && o.pulls) {
        sel = +t.dataset.i;
        draw();
      }
    });
    life.onResize(draw);
    draw();
    if (o.onStep) o.onStep(S, P);
    return { card, state: () => S, params: P, go, reset, draw };
  }
  Object.assign(sh, {
    C,
    pr,
    mulberry,
    fit,
    odour,
    clamp,
    newSwarm,
    step,
    run,
    swarmDemo,
    mapSVG,
    arrow,
    px,
    COL,
    BOX,
    S_PX,
    RULES,
    spread,
    PK,
  });

  // ---------- 12.1 particles, swarm, optimisation ----------
  const snaps = () => {
    const S = newSwarm(4, 16),
      out = [];
    for (let i = 0; i <= 14; i++) {
      if ([0, 2, 5, 14].includes(i))
        out.push({ t: i ? `After ${i} steps` : "Start", v: mapSVG(S, { cells: 16, h: 190 }) });
      step(S, { c1: 2, c2: 2, w: 1 });
    }
    return out;
  };
  const slice = () => {
    const xs = [1.5, 5.5, 7.0],
      y = 7.2;
    return F.plot([{ f: (x) => fit(x, y) * 100, c: "teal" }], {
      x: [0, 10],
      y: [0, 110],
      marks: xs.map((x, i) => [x, `odour ${odour(fit(x, y))}`, ["blue", "violet", "amber"][i], fit(x, y) * 100]),
      xl: "position along one line of the map",
      yl: "odour",
      h: 200,
    });
  };

  N.register({
    id: "l12-swarm",
    lecture: 12,
    order: 1,
    num: "12.1",
    title: "Particles, swarm, optimisation",
    blurb:
      "Meet the particle: a guess with a velocity. See why a flock finds the food, then release a swarm on a scent map.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Particle swarm optimisation (PSO, 1995) borrows how a flock finds food. Each dot is a <b>particle</b>: a guess at the answer. Press <b>Step</b> and watch the dots gather round the brightest spot, even though none of them can see it.",
        ),
      );
      swarmDemo(root, life, { controls: ["n"], title: "Release the swarm", seed: 5 });
      root.appendChild(
        pr(
          "l12-swarm-1",
          "Press <b>Step</b> twenty times. What can the <b>Best odour</b> number do? | Only stay level or rise, since it keeps the best spot ever found | Rise and fall each step as the dots move about the map | Fall steadily as the swarm settles down and the dots bunch up | Best odour is the best spot anyone has found so far, a running record. It stays level until some particle beats it and it never falls.",
        ),
      );
      root.appendChild(
        pr(
          "l12-swarm-2",
          "As the swarm moves, what does each particle sense of the map? | Only the odour at its own position, plus what the swarm remembers | The whole scent map in advance, so it can walk straight to the highest peak | The velocity and heading of every other particle in the swarm | A particle is scored only where it stands. The swarm adds two memories (own best and swarm best), but nobody ever sees the map.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>particle</b> is one candidate solution: a position (the guess) plus a velocity. It has no mass or volume.",
            "<b>Swarm</b>: the group moves together, but <b>velocity matching</b> from flocking is left out.",
            "<b>Optimisation</b>: a population hunts for near-optimal solutions, scored by a <b>fitness</b> (the odour of the food).",
            "The <b>cornfield vector</b> (rooster effect): a crowd finds food quickly because each member follows local rules and shares what it knows.",
          ],
          "Nobody sees the food, yet the swarm finds it.",
        ),
      );
    },
  });

  L["l12-swarm"] = {
    sum: "A particle is a candidate solution with a velocity but no mass; the swarm finds near-optimal solutions the way birds find food, guided by fitness (odour) and shared knowledge.",
    steps: [
      {
        t: "A particle is a guess",
        b: `<p>In PSO every <b>particle</b> is one <b>candidate solution</b>. Picture a field with a hidden scent: each particle is a dot standing on one spot, and that spot is its guess. On a flat map a guess is just two numbers, like $(7.2, 6.8)$.</p><p>The number beside each dot is how strong the scent is where it stands: its <b>fitness</b>. Each particle also has a <b>velocity</b>, the way and the distance it will move next.</p>`,
        v: mapSVG(newSwarm(11, 7), {
          labels: true,
          h: 280,
          says: "Seven blue dots on a scent map, each labelled with the odour at its position.",
        }),
        c: C(
          "A particle stands at (4, 9) on the scent map. In PSO terms, what is it? | A candidate solution: one point that might be the answer | The best answer found so far by any member of the whole swarm | The rule that decides how quickly each swarm member moves on | A particle is one guess. The best guess anyone has found is the swarm best, and the speed rule is the velocity update.",
        ),
      },
      {
        t: "No mass, no volume",
        b: `<p>A real bird has weight and size, and two birds cannot stand in one place. A <b>particle</b> has <b>no mass or volume</b>: only a position, a velocity and the acceleration that changes it. Two particles can sit on the very same spot and nothing happens.</p><p>For example, a particle at 4 moving $+1$ each step is at 5 next, then 6. Its speed changes only when something pulls on it.</p>`,
        v: F.compare(
          { title: "A real bird", c: "rose", body: "has weight and size<br>cannot share a spot<br>bumps into others" },
          {
            title: "A PSO particle",
            c: "teal",
            body: "no mass or volume<br>position, velocity, acceleration<br>may overlap freely",
          },
        ),
        c: C(
          "Two particles land on exactly the same spot. What happens? | Nothing special: particles have no volume, so they may overlap | They bounce apart and swap velocities, like two real birds after a collision | One of them is removed so that the swarm keeps only distinct guesses | A particle is only numbers. Overlapping just means two guesses are equal.",
        ),
      },
      {
        t: "Why call it a swarm",
        b: `<p>In Lecture 11 each flocking boid followed three rules: separation, alignment (<b>velocity matching</b>) and cohesion. PSO keeps the idea of a group moving together but leaves out velocity matching: a particle never copies the heading of its neighbours.</p><p>What steers it instead is the pull of good places it has heard about. We build that pull in Step 12.3.</p>`,
        v: F.compare(
          {
            title: "Flocking boids (Lecture 11)",
            c: "blue",
            body: "separation<br>alignment: match velocity<br>cohesion",
          },
          {
            title: "PSO swarm",
            c: "violet",
            body: "no velocity matching<br>pulled to its own best spot<br>pulled to the swarm's best spot",
          },
        ),
        c: C(
          "Which of these is NOT part of basic PSO? | Copying the average heading of nearby particles | Remembering the best spot a particle has visited | Moving by adding a velocity each step | Scoring every particle with a fitness | Velocity matching is the flocking rule PSO leaves out. Memory of good spots replaces it.",
        ),
      },
      {
        t: "Optimisation by a population",
        b: `<p>The third word is the goal: <b>near-optimal</b> solutions found by a <b>population</b> of individuals. Not guaranteed optimal. With 15 particles on a field, you will usually end close to the best spot, perhaps not exactly on it.</p><p>Many guesses are scored, good spots attract the rest, and the cloud tightens around a good answer.</p>`,
        v: F.flow([
          "A population of particles",
          "Each one is scored by fitness",
          "Good spots attract the others",
          { t: "A near-optimal solution", c: "teal" },
        ]),
        c: C(
          "Why does the lecture say 'near optimal' rather than 'optimal'? | A swarm search gives good answers but no proof that none is better | The swarm only ever visits one single point of the whole search space | Fitness cannot be measured exactly on a continuous map of real numbers | Swarm search is a heuristic. It usually lands close to the best answer, with no guarantee of the best.",
        ),
      },
      {
        t: "The cornfield vector",
        b: `<p>Leave food out for birds and within minutes or hours a crowd is feeding there. Nobody told them where it was. This is the <b>cornfield vector</b>, also called the <b>rooster effect</b>.</p><p>PSO copies it: start the particles scattered (left), then step. The cloud drifts to bright ground and tightens round it.</p>`,
        v: F.frames(
          snaps(),
          "Four snapshots of the same swarm: scattered at the start, then gathering on the brightest ground after 2, 5 and 14 steps.",
        ),
        c: C(
          "What does the swarm in this picture have to start with? | Many scattered guesses and nothing about where the food is | The position of the food but not how strong its scent is | One leader that already stands on the best spot of the whole map | At the start the particles are random and know only their own odour. The gathering is what the search produces.",
        ),
      },
      {
        t: "Fitness is the odour",
        b: `<p>The strength of the scent is the <b>fitness function</b>: bigger means a better solution. A particle never sees the food. It only smells what is under its own feet, like the three particles on this line across the map.</p><p>Comparing smells is all it takes to say which of two spots is better.</p>`,
        v: slice(),
        c: C(
          "A particle can measure only one thing about the map directly. Which is it? | The fitness at its own position | The position of the highest point | The fitness at every other particle | The fitness function scores a position. Everything else the swarm knows is built from many of those scores.",
        ),
      },
      {
        t: "What the swarm shares",
        b: `<p>The swarm's knowledge lives in each particle's <b>local behaviour</b>. Each particle remembers the best spot <b>it</b> has visited, and everyone hears the best spot <b>anyone</b> has found. There is no leader and no map.</p><p>In Lecture 7 ants shared through pheromone left in the world. Particles share through two remembered positions, which we meet properly in Step 12.3.</p>`,
        v: F.compare(
          {
            title: "What a particle knows",
            c: "blue",
            body: "its position and velocity<br>its fitness here<br>its own best spot so far",
          },
          {
            title: "What the swarm shares",
            c: "amber",
            body: "the best spot anyone has found<br>nothing else: no map,<br>no leader, no food location",
          },
        ),
        c: C(
          "How is PSO's way of sharing different from the ants of Lecture 7? | Particles share remembered best positions, not marks left in the environment | Particles leave pheromone on the ground that slowly evaporates over time | Particles share nothing at all, so each one searches completely alone | Ants communicate through the environment (stigmergy). In PSO the shared information is the best position found so far.",
        ),
      },
    ],
    guide: [
      "Press <b>Step</b> a few times, then <b>Run</b> and watch the blue dots drift towards the bright green ground.",
      "Drag the <b>Swarm size</b> slider, then press <b>Reset</b>: a different start gives a different story.",
      "Watch the best odour and the swarm spread in the stat boxes as the swarm gathers.",
      "Answer the questions after the demo.",
    ],
  };
})();

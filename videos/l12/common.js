/* Lecture 12 · Particle swarm optimisation: pure data and algorithms (VID.l12, short name L12). NO DOM in this file. The
   app's own PSO (js/content/nic/pso-01.js newSwarm / step, pso-02.js, pso-workshop.js bitStep) is ported here line for
   line (same seeded rng, same order of random draws, same speed cap and walls), the runs are made ONCE when the page loads
   and every number the storyboard (videos/_plan/lecture-12.json) quotes is ASSERTED: a wrong figure throws a clear Error.
   Scenes only look values up and draw frame t from the logs. Deterministic: seeded rng, never Math.random.

   TOOLS
     L12.rng(seed) -> () => 0..1 (the lessons' mulberry32)
     L12.same(got, want, what)  throws unless equal (numbers within 1e-9, arrays element by element, strings ===)
     L12.close(got, want, eps, what)  numbers (or arrays of numbers) within eps
     L12.r2(n) rounds to 2 decimals (a number);  L12.fmt(n, d = 2) -> string with trailing zeros cut ("0.8", "-2", "4.47")

   1. THE SCENT MAP (lesson 12.1: a 10 x 10 map, three hills: a narrow food peak, a broad dim decoy, a weak bump)
        L12.BOX = 10 (positions run 0..10 in both dimensions, y up);  L12.VMAX = 3 (the app's speed cap per dimension)
        L12.PK = [[7.4, 7.2, 1, 0.8] food, [2.4, 2.8, 0.7, 1.9] decoy, [7.6, 1.8, 0.35, 0.9] bump]  ([x, y, height, width])
        L12.fit(x, y) -> 0..~1 the fitness;  L12.odour(f) = Math.round(100 f) (the number the app shows: food peak 100)
        L12.FOOD = [7.4, 7.2] (the top of the narrow peak), L12.DECOY = [2.4, 2.8]

   2. THE SWARM (the app's rule, per particle i and dimension j, in this order of random draws: z1 then z2 for j = 0, then j = 1)
        v = w v + c1 z1 (p - x) + c2 z2 (g - x), clamped to -VMAX..VMAX;  x = x + v;  at a wall x is clamped to 0..10 and that
        component of v is set to 0.  Then every particle is scored, its personal best p updated, and only then the swarm best g.
        The lecture's formula is w = 1 (the app's default); w < 1 ("momentum kept") is the lessons' marked extra (lesson 12.4).
        L12.record(seed, n, {c1, c2, w, vs}, its) -> LOG (the run, step by step):
          LOG.n, LOG.its, LOG.P (params)
          LOG.frames[k] (k = 0 .. its; frame 0 = the start, frame k = after k steps):
            {x: [[x, y] per particle], v: [[vx, vy]], p: [[x, y] personal bests], pf: [odour of each p], f: [odour at x],
             g: [x, y] swarm best, gf: its odour, best (= gf), mean (average odour), rad (normalised swarm radius), stale}
          LOG.moves[k] (k = 1 .. its; moves[0] is null): per particle the step that led from frame k - 1 to frame k:
            {x0, v0 (= w v), z: [[z1, z2] dim 0, [z1, z2] dim 1], cog: c1 z1 (p - x), soc: c2 z2 (g - x), raw (= v0 + cog + soc,
             before the cap), v (after cap and walls), x (new position), p, g (the bests it was pulled to), capped: [bool, bool],
             wall: [bool, bool]}
        L12.at(LOG, t) -> {x: [[x, y]], k, u, frame}  positions at fractional step t (0 .. its): straight-line moves, so the
          linear blend of frames floor(t) and floor(t) + 1 is exact. frame = LOG.frames[floor(t)] for the discrete fields
          (p, g, best ... change only when a step lands).
        L12.trail(LOG, i, t, back = 3) -> [[x, y], ...] the path of particle i from step max(0, t - back) to t (for fading tails)
        L12.alt(m, P, c1, c2, z) -> the landing spot of move m with other dice z = [[z1, z2], [z1, z2]] (cap and walls applied)

   3. THE RUNS (all asserted below)
        L12.RUN   the app's first demo "Release the swarm" (lesson 12.1: seed 5, 14 particles, c1 = c2 = 2, w = 1), 24 steps.
                  Swarm best odour after steps 0..3: 66, 78, 85, 99 (then 99 to step 24); g after step 3 = (7.44, 7.10).
                  Dots within 2.5 of the food: 3 at the start, 13 at step 12 (9 within 1.5).
        L12.FOCUS the followed particle of the arrow scene: RUN particle 1 on step 9 (frame 8 -> frame 9). Chosen because its
                  three arrows point three different ways, p and g lie apart, and the step is not speed-capped (asserted).
                  {i: 1, step: 9, x0 (5.67, 7.13), v0 (-3.00, 2.19), p (3.85, 3.09), pfOld 52, g (7.44, 7.10), gf 99,
                   z [[0.45, 0.94], [0.57, 0.12]] ([z1, z2] for dimension 1, then dimension 2), cog (-1.62, -4.61),
                   soc (3.33, -0.01), raw = v (-1.29, -2.44), x (4.38, 4.69), f 25 < 52 so p stays (pNew = p, pfNew 52);
                   heads a = x0 + v0 (2.67, 9.31), b = a + cog (1.05, 4.70), c = b + soc = x}
        L12.CLOUD other dice rolls for FOCUS (rng 3, z1 then z2 per dimension): the first 20 rolls (of 61 drawn) that the
                  speed cap and the walls leave alone, so each landing is exactly x0 + the three arrows with those dice.
                  CLOUD.pts[k] = {z, x (landing), f (odour)}; CLOUD.real = FOCUS.x; asserted: 20 different landings.
        L12.DRIFT lesson 12.2's "no pulls" swarm: seed 7, 8 particles, vs 4, c1 = c2 = 0, w = 1, 5 steps (straight lines;
                  4 particles end on a wall, sliding along it or stopped).
        L12.POS   lesson 12.2's position update: x (3, 5) + v (2, -1) = (5, 4).
        L12.ONED  lesson 12.3's worked example: x 4, v 1, p 7, g 2, c1 = c2 = 2, z1 = z2 = 0.5: pull to p +3, pull to g -2,
                  new v 2, new x 6.
        L12.STOP  lesson 12.4's stopping-rule run (stopFig: seed 24, 10 particles, c1 = c2 = 1, w = 0.6 = the extra), 50 steps;
                  L12.STOP.fired = {good: 7, rad: 19, stale: 46, max: 50} (the four rules of the app: odour >= 95; radius
                  under 5 %; 8 steps without a new best; 50 steps). L12.RULES = [{id, name, test text}] in the app's order.
                  Best odour 49 at the start, 94 at step 6, 97 at step 7; radius first under 5% at step 19; last new best at
                  step 38; all ten end on the food (7.40, 7.20). With w = 1 'rad' never fires in 50 steps (the plain formula
                  keeps circling).
        L12.BIT   lesson 12.5's one-bit update: x 0, v 0.5, p 1, g 1, c1 = c2 = 1, z1 0.2, z2 0.1: pulls +0.2 and +0.1, new v
                  0.8 (kept inside 0..1), draw u 0.55 < 0.8 so the bit becomes 1.  L12.bitV(v) clamps to 0..1 (the app's rule).
        L12.DRAWS 20 draws of that bit with v = 0.8 (rng 21, the lesson sampler's seed): u values .u[], bits .bits[],
                  .ones = 16 (of 20). */
(function () {
  const V = window.VID;
  const L12 = (V.l12 = V.l12 || {});

  // ---------- tools ----------
  const rng = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const show = (x) => JSON.stringify(x);
  function same(got, want, what) {
    const eq = (a, b) =>
      Array.isArray(a) && Array.isArray(b)
        ? a.length === b.length && a.every((x, i) => eq(x, b[i]))
        : typeof a === "number" && typeof b === "number"
          ? Math.abs(a - b) < 1e-9
          : a === b;
    if (!eq(got, want)) throw new Error(`VID.l12 check failed: ${what}: got ${show(got)}, want ${show(want)}`);
    return got;
  }
  function close(got, want, eps, what) {
    const ok = Array.isArray(want)
      ? Array.isArray(got) && got.length === want.length && want.every((w, i) => Math.abs(got[i] - w) <= eps)
      : Math.abs(got - want) <= eps;
    if (!ok) throw new Error(`VID.l12 check failed: ${what}: got ${show(got)}, want ${show(want)} (within ${eps})`);
    return got;
  }
  const r2 = (n) => Math.round(n * 100) / 100;
  const fmt = (n, d = 2) => {
    const s = (Math.abs(n) < 0.5 * 10 ** -d ? 0 : n).toFixed(d).replace(/\.?0+$/, "");
    return s === "-0" ? "0" : s;
  };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // ---------- 1. the scent map (pso-01.js) ----------
  const PK = [
    [7.4, 7.2, 1, 0.8],
    [2.4, 2.8, 0.7, 1.9],
    [7.6, 1.8, 0.35, 0.9],
  ];
  const BOX = 10;
  const VMAX = 3;
  const L12FOOD = [7.4, 7.2];
  const fit = (x, y) =>
    PK.reduce((s, [a, b, h, g]) => s + h * Math.exp(-((x - a) ** 2 + (y - b) ** 2) / (2 * g * g)), 0);
  const odour = (f) => Math.round(f * 100);

  // ---------- 2. the swarm (pso-01.js newSwarm / spread / step with k = 0, i.e. gbest) ----------
  function spread(P) {
    const n = P.length;
    const m = [0, 1].map((j) => P.reduce((a, q) => a + q.x[j], 0) / n);
    return Math.sqrt(P.reduce((a, q) => a + (q.x[0] - m[0]) ** 2 + (q.x[1] - m[1]) ** 2, 0) / n);
  }
  function newSwarm(seed, n, vs = 1) {
    const r = rng(seed);
    const P = Array.from({ length: n }, () => {
      const x = [r() * BOX, r() * BOX];
      return { x, v: [(r() - 0.5) * vs, (r() - 0.5) * vs], p: x.slice(), pf: fit(x[0], x[1]), f: fit(x[0], x[1]) };
    });
    const b = P.reduce((a, q) => (q.pf > a.pf ? q : a));
    const S = { r, P, g: { x: b.p.slice(), f: b.pf }, it: 0, stale: 0, r0: 1, rad: 1 };
    S.r0 = spread(P) || 1;
    return S;
  }
  function step(S, prm) {
    const moves = S.P.map((q) => {
      const g = S.g;
      const m = { x0: q.x.slice(), v0: q.v.map((a) => a * prm.w), z: [], cog: [0, 0], soc: [0, 0], raw: [0, 0] };
      m.p = q.p.slice();
      m.g = g.x.slice();
      m.capped = [false, false];
      m.wall = [false, false];
      for (let j = 0; j < 2; j++) {
        const z1 = S.r();
        m.cog[j] = prm.c1 * z1 * (q.p[j] - q.x[j]);
        const z2 = S.r();
        m.soc[j] = prm.c2 * z2 * (g.x[j] - q.x[j]);
        m.z.push([z1, z2]);
        m.raw[j] = m.v0[j] + m.cog[j] + m.soc[j];
        q.v[j] = clamp(m.raw[j], -VMAX, VMAX);
        m.capped[j] = q.v[j] !== m.raw[j];
        q.x[j] += q.v[j];
        if (q.x[j] < 0 || q.x[j] > BOX) {
          q.x[j] = clamp(q.x[j], 0, BOX);
          q.v[j] = 0;
          m.wall[j] = true;
        }
      }
      m.v = q.v.slice();
      m.x = q.x.slice();
      return m;
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
    S.rad = spread(S.P) / S.r0;
    return moves;
  }
  const snap = (S) => ({
    x: S.P.map((q) => q.x.slice()),
    v: S.P.map((q) => q.v.slice()),
    p: S.P.map((q) => q.p.slice()),
    pf: S.P.map((q) => odour(q.pf)),
    f: S.P.map((q) => odour(q.f)),
    g: S.g.x.slice(),
    gf: odour(S.g.f),
    best: odour(S.g.f),
    mean: odour(S.P.reduce((a, q) => a + q.f, 0) / S.P.length),
    rad: S.rad,
    stale: S.stale,
  });
  function record(seed, n, prm, its) {
    const P = { c1: 2, c2: 2, w: 1, vs: 1, ...prm };
    const S = newSwarm(seed, n, P.vs);
    const frames = [snap(S)];
    const moves = [null];
    for (let k = 1; k <= its; k++) {
      moves.push(step(S, P));
      frames.push(snap(S));
    }
    return { n, its, P, seed, frames, moves };
  }
  function at(LOG, t) {
    const tt = clamp(t, 0, LOG.its);
    const k = Math.min(Math.floor(tt), LOG.its);
    const u = tt - k;
    const A = LOG.frames[k].x;
    const B = LOG.frames[Math.min(k + 1, LOG.its)].x;
    return {
      x: A.map((a, i) => [a[0] + (B[i][0] - a[0]) * u, a[1] + (B[i][1] - a[1]) * u]),
      k,
      u,
      frame: LOG.frames[k],
    };
  }
  function trail(LOG, i, t, back = 3) {
    const tt = clamp(t, 0, LOG.its);
    const t0 = Math.max(0, tt - back);
    const pts = [at(LOG, t0).x[i]];
    for (let k = Math.floor(t0) + 1; k < tt; k++) pts.push(LOG.frames[k].x[i]);
    pts.push(at(LOG, tt).x[i]);
    return pts;
  }
  function alt(m, P, c1, c2, z) {
    return [0, 1].map((j) => {
      const raw = m.v0[j] + c1 * z[j][0] * (m.p[j] - m.x0[j]) + c2 * z[j][1] * (m.g[j] - m.x0[j]);
      return clamp(m.x0[j] + clamp(raw, -VMAX, VMAX), 0, BOX);
    });
  }

  // ---------- 3. the runs, asserted ----------
  const RUN = record(5, 14, { c1: 2, c2: 2, w: 1 }, 24);
  same(
    RUN.frames.slice(0, 5).map((f) => f.best),
    [66, 78, 85, 99, 99],
    "RUN (lesson 12.1 demo, seed 5, 14 particles): swarm best odour after steps 0..4",
  );
  same(
    RUN.frames.slice(3).every((f) => f.best === 99),
    true,
    "RUN: best stays 99 from step 3 to 24",
  );
  close(RUN.frames[3].g, [7.44, 7.1], 0.005, "RUN: swarm best position after step 3");
  same(RUN.frames[0].f.length, 14, "RUN: 14 particles");
  const near = (fr, r) => fr.x.filter((q) => Math.hypot(q[0] - 7.4, q[1] - 7.2) < r).length;
  same(
    [near(RUN.frames[0], 2.5), near(RUN.frames[12], 2.5)],
    [3, 13],
    "RUN: dots within 2.5 of the food at steps 0 and 12",
  );
  same(near(RUN.frames[12], 1.5), 9, "RUN: 9 of 14 dots within 1.5 of the food at step 12");

  const fm = RUN.moves[9][1];
  const FOCUS = {
    i: 1,
    step: 9,
    x0: fm.x0,
    v0: fm.v0,
    p: fm.p,
    g: fm.g,
    z: fm.z,
    cog: fm.cog,
    soc: fm.soc,
    raw: fm.raw,
    v: fm.v,
    x: fm.x,
    pfOld: RUN.frames[8].pf[1],
    gf: RUN.frames[8].gf,
    f: RUN.frames[9].f[1],
    pNew: RUN.frames[9].p[1],
    pfNew: RUN.frames[9].pf[1],
  };
  FOCUS.a = [FOCUS.x0[0] + FOCUS.v0[0], FOCUS.x0[1] + FOCUS.v0[1]];
  FOCUS.b = [FOCUS.a[0] + FOCUS.cog[0], FOCUS.a[1] + FOCUS.cog[1]];
  FOCUS.c = [FOCUS.b[0] + FOCUS.soc[0], FOCUS.b[1] + FOCUS.soc[1]];
  close(FOCUS.x0, [5.67, 7.13], 0.005, "FOCUS: position before step 9");
  close(FOCUS.v0, [-3, 2.19], 0.005, "FOCUS: current velocity");
  close(FOCUS.p, [3.85, 3.09], 0.005, "FOCUS: personal best before the step");
  close(FOCUS.g, [7.44, 7.1], 0.005, "FOCUS: swarm best");
  close(FOCUS.z.flat(), [0.45, 0.94, 0.57, 0.12], 0.005, "FOCUS: dice z1, z2 (dim 1), z1, z2 (dim 2)");
  close(FOCUS.cog, [-1.62, -4.61], 0.005, "FOCUS: pull to own best");
  close(FOCUS.soc, [3.33, -0.01], 0.005, "FOCUS: pull to swarm best");
  same(fm.capped.concat(fm.wall), [false, false, false, false], "FOCUS: no speed cap, no wall on this step");
  close(FOCUS.v, [-1.29, -2.44], 0.005, "FOCUS: new velocity");
  close(FOCUS.x, [4.38, 4.69], 0.005, "FOCUS: new position");
  close(FOCUS.a, [2.67, 9.31], 0.005, "FOCUS: head of the grey arrow");
  close(FOCUS.b, [1.05, 4.7], 0.005, "FOCUS: head of the purple arrow");
  close(FOCUS.c, FOCUS.x, 1e-9, "FOCUS: the three arrows head to tail end on the new position");
  same(
    [FOCUS.pfOld, FOCUS.f, FOCUS.pfNew, FOCUS.gf],
    [52, 25, 52, 99],
    "FOCUS: odours (own best, new spot, own best after, swarm best)",
  );
  close(FOCUS.pNew, FOCUS.p, 1e-9, "FOCUS: 25 does not beat 52, so its own best stays");

  const cr = rng(3);
  const CLOUD = { pts: [], rolled: 0 };
  while (CLOUD.pts.length < 20) {
    const z = [
      [cr(), cr()],
      [cr(), cr()],
    ];
    CLOUD.rolled++;
    const raw = [0, 1].map((j) => fm.v0[j] + 2 * z[j][0] * (fm.p[j] - fm.x0[j]) + 2 * z[j][1] * (fm.g[j] - fm.x0[j]));
    const x = alt(fm, RUN.P, 2, 2, z);
    // only rolls the speed cap and the walls leave alone, so every ghost is exactly x + the three arrows
    if (raw.some((r) => Math.abs(r) > VMAX) || raw.some((r, j) => fm.x0[j] + r < 0 || fm.x0[j] + r > BOX)) continue;
    CLOUD.pts.push({ z, x, f: odour(fit(x[0], x[1])) });
  }
  CLOUD.real = FOCUS.x;
  close(alt(fm, RUN.P, 2, 2, FOCUS.z), FOCUS.x, 1e-9, "CLOUD: alt() with the real dice gives the real landing");
  same(new Set(CLOUD.pts.map((q) => q.x.map((v) => v.toFixed(3)).join())).size, 20, "CLOUD: twenty different landings");
  same(CLOUD.rolled, 61, "CLOUD: rolls needed for twenty uncapped landings");

  const DRIFT = record(7, 8, { c1: 0, c2: 0, w: 1, vs: 4 }, 5);
  same(
    DRIFT.moves.slice(1).every((ms) => ms.every((m) => m.cog.every((c) => c === 0) && m.soc.every((c) => c === 0))),
    true,
    "DRIFT: no pulls at all",
  );
  same(
    DRIFT.frames[5].x.filter((x) => x.some((c) => c === 0 || c === BOX)).length,
    4,
    "DRIFT: four of eight dots end on a wall after 5 steps",
  );

  const POS = { x: [3, 5], v: [2, -1], nx: [5, 4] };
  same([POS.x[0] + POS.v[0], POS.x[1] + POS.v[1]], POS.nx, "POS: (3, 5) + (2, -1) = (5, 4)");

  const ONED = { x: 4, v: 1, p: 7, g: 2, c1: 2, c2: 2, z1: 0.5, z2: 0.5 };
  ONED.cog = ONED.c1 * ONED.z1 * (ONED.p - ONED.x);
  ONED.soc = ONED.c2 * ONED.z2 * (ONED.g - ONED.x);
  ONED.nv = ONED.v + ONED.cog + ONED.soc;
  ONED.nx = ONED.x + ONED.nv;
  same([ONED.cog, ONED.soc, ONED.nv, ONED.nx], [3, -2, 2, 6], "ONED: lesson 12.3 worked example (+3, -2, v 2, x 6)");

  const RULES = [
    { id: "max", name: "Maximum iterations", test: "50 iterations" },
    { id: "good", name: "Acceptable solution", test: "odour 95 or more" },
    { id: "stale", name: "No improvement", test: "8 iterations without a new best" },
    { id: "rad", name: "Swarm radius near zero", test: "spread under 5%" },
  ];
  const fires = {
    max: (k) => k >= 50,
    good: (k, f) => f.best >= 95,
    stale: (k, f) => f.stale >= 8,
    rad: (k, f) => f.rad < 0.05,
  };
  const firedOf = (LOG) => {
    const out = {};
    for (let k = 1; k <= LOG.its; k++)
      RULES.forEach(({ id }) => {
        if (!out[id] && fires[id](k, LOG.frames[k])) out[id] = k;
      });
    return out;
  };
  const STOP = record(24, 10, { c1: 1, c2: 1, w: 0.6 }, 50);
  STOP.fired = firedOf(STOP);
  same(
    RULES.map(({ id }) => STOP.fired[id]),
    [50, 7, 46, 19],
    "STOP (lesson 12.4 stopFig, seed 24, w 0.6): first step each rule fires (max, good, stale, rad)",
  );
  same(STOP.frames[0].best, 49, "STOP: best odour at the start");
  same(
    [6, 7].map((k) => STOP.frames[k].best),
    [94, 97],
    "STOP: best odour at steps 6 and 7 (the 'good' rule needs 95)",
  );
  same(STOP.frames[19].rad < 0.05 && STOP.frames[18].rad >= 0.05, true, "STOP: radius first under 5% at step 19");
  close(STOP.frames[50].g, L12FOOD, 0.01, "STOP: the swarm ends on the food peak (7.40, 7.20)");
  same(
    [38, 46].map((k) => STOP.frames[k].stale),
    [0, 8],
    "STOP: last new best at step 38, 8 steps flat at 46",
  );
  same(STOP.frames[50].best, 100, "STOP: best odour at the end");
  const STOP1 = record(24, 10, { c1: 1, c2: 1, w: 1 }, 50);
  same(firedOf(STOP1).rad, undefined, "STOP with w = 1: the radius rule never fires in 50 steps");

  const bitV = (v) => clamp(v, 0, 1);
  const BIT = { x: 0, v: 0.5, p: 1, g: 1, c1: 1, c2: 1, z1: 0.2, z2: 0.1, u: 0.55 };
  BIT.cog = BIT.c1 * BIT.z1 * (BIT.p - BIT.x);
  BIT.soc = BIT.c2 * BIT.z2 * (BIT.g - BIT.x);
  BIT.nv = bitV(BIT.v + BIT.cog + BIT.soc);
  BIT.nx = BIT.u < BIT.nv ? 1 : 0;
  close([BIT.cog, BIT.soc, BIT.nv], [0.2, 0.1, 0.8], 1e-9, "BIT: lesson 12.5 pulls and new velocity");
  same(BIT.nx, 1, "BIT: draw 0.55 is below 0.8, so the bit becomes 1");

  const dr = rng(21);
  const DRAWS = { v: 0.8, u: [], bits: [] };
  for (let k = 0; k < 20; k++) {
    const u = dr();
    DRAWS.u.push(u);
    DRAWS.bits.push(u < DRAWS.v ? 1 : 0);
  }
  DRAWS.ones = DRAWS.bits.reduce((a, b) => a + b, 0);
  same(DRAWS.ones, 16, "DRAWS: 16 of 20 bits are 1 with v = 0.8");
  same(DRAWS.bits.slice(0, 10).join(""), "1111100111", "DRAWS: the first ten bits");

  Object.assign(L12, {
    rng,
    same,
    close,
    r2,
    fmt,
    clamp,
    PK,
    BOX,
    VMAX,
    fit,
    odour,
    FOOD: L12FOOD,
    DECOY: [2.4, 2.8],
    newSwarm,
    step,
    spread,
    record,
    at,
    trail,
    alt,
    RUN,
    FOCUS,
    CLOUD,
    DRIFT,
    POS,
    ONED,
    RULES,
    STOP,
    bitV,
    BIT,
    DRAWS,
  });
})();

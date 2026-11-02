/* Lecture 11 · Flocking and agents: the DATA (pure, no DOM). Everything hangs off VID.l11 (short name L11).
   The boids kernel is a line-for-line port of the app's own (js/content/nic/l11-01.js, Reynolds 1987 in 2D on a 600 x 360
   wrap-around world, constant speed 2.4 per tick). Every flock in the video is SIMULATED ONCE WHEN THE PAGE LOADS with a seeded
   rng (mulberry32, the lesson's own) and logged tick by tick; scenes only READ the logs, so any frame can be drawn in any order.
   The numbers the storyboard quotes are asserted here: a different result throws an Error naming the number.

   TOOLS
     L11.rng(seed) -> () => number in [0, 1)            the lesson's mulberry32
     L11.same(got, want, what) / L11.close(got, want, eps, what)   throw a clear Error when a number differs
     L11.f1(n) -> "12.3";  L11.pct(p) -> 45 (rounded %);  L11.seq(t, t0, step, dur, i) -> 0..1 staggered ramp of item i
     L11.K = {W: 600, H: 360, SPEED: 2.4, SEP_R: 20, LINK: 40, TOUCH: 8, FEAR_R: 150}   kernel constants (world units)
     L11.wrap(d, len) shortest signed difference on the wrap-around world

   THE KERNEL (a flock b is an array of {x, y, vx, vy}; P = {R: perception radius, ws, wa, wc: rule weights})
     L11.make(n, start, seed)   start "scatter" | "together" | "apart" | "meet" (exactly the lesson's starts)
     L11.sense(b, i, P) -> {nb: [{j, dx, dy, d}], sep: [x, y], ali: [x, y], coh: [x, y]}   the three weighted pushes on boid i
     L11.step(b, P, fear) -> next flock (all boids at once; fear = {x, y} pushes boids within 150 away)
     L11.polar(b) 0..1 how far they head the same way;  L11.groups(b) number of groups (joined when closer than 40)
     L11.spread(b) RMS distance from the centre;  L11.centre(b) -> {x, y} (circular mean, works across the wrap)
     L11.heading(b) average heading in degrees clockwise from north;  L11.tooClose(b) pairs closer than 8

   RUNS (precomputed logs). A run R has R.n boids, R.ticks + 1 frames, R.P, and per tick: R.polar[k], R.groups[k],
   R.spread[k]. Read it with:
     L11.at(R, tick) -> flock at a FRACTIONAL tick (positions interpolated along the wrap, headings blended): use this to draw
     L11.frame(R, k) -> flock at integer tick k (clamped to 0..R.ticks)
     L11.pushes(R, tick, i) -> sense() of boid i at round(tick): {nb, sep, ali, coh, sum} (sum = the three added)
     L11.percept(R, tick, i) -> {n, near: {j, d, side: "ahead" | "behind" | "on its left" | "on its right"} | null, turn}
            what boid i senses at round(tick) and the turn (degrees, + = right) it makes on the next tick (the app's own words)
     L11.trail(R, tick, i, len, every) -> [{x, y}] the last positions of boid i, newest first (unwrapped next to the boid)
     L11.firstTick(R, key, test) -> first integer tick whose R[key][k] passes test (or -1)
     L11.hood(R, tick, i) -> {n, heading (degrees, 0 = right, 90 = down), centre: {x, y} world} of boid i's neighbours, or null
     L11.hdg(boid) -> heading in whole degrees clockwise from north (0 = up, 90 = right)
   L11.RUN.FORM   40 boids, scattered, all three rules, seed 29, 420 ticks (scenes 8 and 10): polarisation 0.06 and 21 groups
                  at tick 0, first >= 0.9 at tick R.p90 = 191, 0.99 and 1 group at tick 420. R.focus = 37 (the highlighted
                  boid), R.show = 119 (its three pushes all clear: 0.22 / 0.13 / 0.11, sum 0.18, 6 neighbours);
                  R.agent = {tick: 60, i: 36, n: 4, d: 40, side: "on its right", turn: 6} (scene 10's percept and action)
   L11.RUN.SCARE  50 boids already flocking (600 unlogged warm-up ticks), a predator strike at tick 120 at the flock centre
                  (R.fear = {at, x, y, t: 20}) (scene 2): polarisation 1.00 -> R.dip 0.22 at R.dipAt 140 -> 0.9 at R.back 253
   L11.RUN.BURST  60 boids packed in a 36-unit square (scene 9): spread 15 at tick 0, 155 at tick 100; groups 1, 10, 1 (160)
   L11.RUN.MEET   40 boids in two flocks heading for each other (scene 9): 2 groups at tick 0, 1 from tick R.merge = 32 on;
                  polarisation 0.00 -> 0.98 at tick 100
   L11.RUN.SEP / ALI / COH  close-ups for the three rule scenes, boid 0 is the focus at the world centre (see L11.CLOSE):
                  SEP separation only, 40 ticks; ALI alignment only, 50 ticks; COH cohesion only, 36 ticks

   SMALL DATA
     L11.CLOSE.SEP {mates: [{d, push}]}   separation strengths 1 - d / 20: d 5 -> 0.75, d 15 -> 0.25, d 25 -> 0
     L11.MATES (13 flockmates around one boid, lesson 11.2) and L11.SENSE = {R: [30, 50, 70, 80], count: [0, 1, 2, 4],
               near: {d: 45, bearing: 27, side: "left"}}
     L11.BAL   two animals, distances in body lengths (lesson 11.1): push below 2.5, pull above 3.5, steady at 3;
               BAL.settle(d0) -> [d0, d1, ...] the lesson's "Let go" (d += (3 - d) * 0.25 until within 0.05 of 3)
     L11.links(n) = n (n - 1) / 2;  L11.LINKS = {n: 10, all: 45, ring: 10, n100: 4950}
     L11.fault(mode "hub" | "ring", broken, t) -> {inf: [ids], iso: [ids]} the lesson's toy fault spread on a ring of 10
     L11.FAULT = {hub: [[infected, isolated]] per step 0..6 with a working monitor, broken: [infected] with the monitor down,
               ring: [[infected, isolated]] when neighbours watch each other} */
(function () {
  const V = window.VID;
  const L11 = (V.l11 = V.l11 || {});

  // ---------- tools ----------
  const rng = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const show = (v) => (Array.isArray(v) ? `[${v.join(", ")}]` : String(v));
  const same = (got, want, what = "value") => {
    const ok = (a, b) =>
      Array.isArray(a) && Array.isArray(b)
        ? a.length === b.length && a.every((x, i) => ok(x, b[i]))
        : typeof a === "number" && typeof b === "number"
          ? Math.abs(a - b) < 1e-9
          : a === b;
    if (!ok(got, want)) throw new Error(`VID.l11: ${what}: got ${show(got)}, the storyboard says ${show(want)}`);
    return got;
  };
  const close = (got, want, eps, what = "value") => {
    if (!(Math.abs(got - want) <= eps)) throw new Error(`VID.l11: ${what}: got ${got}, expected ${want} (+-${eps})`);
    return got;
  };
  const check = (ok, what) => {
    if (!ok) throw new Error(`VID.l11: ${what}`);
  };
  Object.assign(L11, { rng, same, close, check });
  L11.f1 = (n) => n.toFixed(1);
  L11.pct = (p) => Math.round(p * 100);
  L11.seq = (t, t0, step, dur, i) => V.clamp((t - t0 - i * step) / dur);

  // ---------- the kernel (port of js/content/nic/l11-01.js) ----------
  const K = (L11.K = { W: 600, H: 360, SPEED: 2.4, SEP_R: 20, LINK: 40, TOUCH: 8, FEAR_R: 150 });
  const { W, H, SPEED, SEP_R, LINK, TOUCH, FEAR_R } = K;
  const wrap = (d, len) => (d > len / 2 ? d - len : d < -len / 2 ? d + len : d);
  L11.wrap = wrap;
  function make(n, start, seed) {
    const r = rng(seed),
      b = [];
    for (let i = 0; i < n; i++) {
      let x = r() * W,
        y = r() * H;
      if (start === "together") [x, y] = [W / 2 + (r() - 0.5) * 36, H / 2 + (r() - 0.5) * 36];
      if (start === "apart") [x, y] = [(i % 2 ? 450 : 150) + (r() - 0.5) * 70, (i % 2 ? 270 : 90) + (r() - 0.5) * 70];
      let a = r() * Math.PI * 2;
      if (start === "meet")
        [x, y, a] = [
          (i % 2 ? 420 : 180) + (r() - 0.5) * 60,
          180 + (r() - 0.5) * 60,
          (i % 2 ? Math.PI : 0) + (r() - 0.5) * 0.35,
        ];
      b.push({ x, y, vx: Math.cos(a) * SPEED, vy: Math.sin(a) * SPEED });
    }
    return b;
  }
  function sense(b, i, P) {
    const p = b[i],
      nb = [];
    let sx = 0,
      sy = 0,
      ax = 0,
      ay = 0,
      cx = 0,
      cy = 0;
    b.forEach((q, j) => {
      const dx = wrap(q.x - p.x, W),
        dy = wrap(q.y - p.y, H),
        d = Math.hypot(dx, dy);
      if (j === i || d >= P.R || d === 0) return;
      nb.push({ j, dx, dy, d });
      ax += q.vx;
      ay += q.vy;
      cx += dx;
      cy += dy;
      if (d < SEP_R) {
        sx -= (dx * (SEP_R - d)) / SEP_R / d;
        sy -= (dy * (SEP_R - d)) / SEP_R / d;
      }
    });
    const k = nb.length;
    return {
      nb,
      sep: [P.ws * 0.9 * sx, P.ws * 0.9 * sy],
      ali: k ? [P.wa * 0.08 * (ax / k - p.vx), P.wa * 0.08 * (ay / k - p.vy)] : [0, 0],
      coh: k ? [P.wc * 0.004 * (cx / k), P.wc * 0.004 * (cy / k)] : [0, 0],
    };
  }
  function step(b, P, fear) {
    return b.map((p, i) => {
      const s = sense(b, i, P);
      let vx = p.vx + s.sep[0] + s.ali[0] + s.coh[0],
        vy = p.vy + s.sep[1] + s.ali[1] + s.coh[1];
      if (fear) {
        const dx = wrap(p.x - fear.x, W),
          dy = wrap(p.y - fear.y, H),
          d = Math.hypot(dx, dy) || 1;
        if (d < FEAR_R) [vx, vy] = [vx + (dx / d) * 3.2 * (1 - d / FEAR_R), vy + (dy / d) * 3.2 * (1 - d / FEAR_R)];
      }
      const m = Math.hypot(vx, vy) || 1;
      vx = (vx / m) * SPEED;
      vy = (vy / m) * SPEED;
      return { x: (p.x + vx + W) % W, y: (p.y + vy + H) % H, vx, vy };
    });
  }
  const dist = (p, q) => Math.hypot(wrap(p.x - q.x, W), wrap(p.y - q.y, H));
  const polar = (b) =>
    Math.hypot(
      b.reduce((s, p) => s + p.vx, 0),
      b.reduce((s, p) => s + p.vy, 0),
    ) /
    (b.length * SPEED);
  function groups(b) {
    const par = b.map((_, i) => i),
      f = (i) => (par[i] === i ? i : (par[i] = f(par[i])));
    b.forEach((p, i) => b.forEach((q, j) => j > i && dist(p, q) < LINK && (par[f(i)] = f(j))));
    return new Set(b.map((_, i) => f(i))).size;
  }
  const heading = (b) =>
    ((Math.atan2(
      b.reduce((s, p) => s + p.vx, 0),
      -b.reduce((s, p) => s + p.vy, 0),
    ) *
      180) /
      Math.PI +
      360) %
    360;
  const tooClose = (b) => b.reduce((s, p, i) => s + b.filter((q, j) => j > i && dist(p, q) < TOUCH).length, 0);
  function centre(b) {
    const mid = (key, len) => {
      const a = (v) => (v / len) * Math.PI * 2;
      const m = Math.atan2(
        b.reduce((s, p) => s + Math.sin(a(p[key])), 0),
        b.reduce((s, p) => s + Math.cos(a(p[key])), 0),
      );
      return ((m / (Math.PI * 2)) * len + len) % len;
    };
    return { x: mid("x", W), y: mid("y", H) };
  }
  function spread(b) {
    const c = centre(b);
    return Math.sqrt(b.reduce((s, p) => s + wrap(p.x - c.x, W) ** 2 + wrap(p.y - c.y, H) ** 2, 0) / b.length);
  }
  Object.assign(L11, { make, sense, step, dist, polar, groups, heading, tooClose, centre, spread });

  // ---------- runs: simulate once, log every tick ----------
  /** o: {b0 | n, start, seed, P, ticks, warm: unlogged ticks first, fear: {at, x, y, t} (x, y may be "centre")}. */
  function run(o) {
    const P = { R: 70, ws: 1, wa: 1, wc: 1, ...(o.P || {}) };
    let b = o.b0 ? o.b0.map((p) => ({ ...p })) : make(o.n, o.start, o.seed);
    for (let k = 0; k < (o.warm || 0); k++) b = step(b, P, null);
    const R = { n: b.length, P, ticks: o.ticks, frames: [], polar: [], groups: [], spread: [], fear: null };
    for (let k = 0; ; k++) {
      R.frames.push(Float32Array.from(b.flatMap((p) => [p.x, p.y, p.vx, p.vy])));
      R.polar.push(polar(b));
      R.groups.push(groups(b));
      R.spread.push(spread(b));
      if (k === o.ticks) break;
      if (o.fear && k === o.fear.at && !R.fear) {
        const c = o.fear.x === "centre" ? centre(b) : { x: o.fear.x, y: o.fear.y };
        R.fear = { at: o.fear.at, x: c.x, y: c.y, t: o.fear.t };
      }
      const live = R.fear && k >= R.fear.at && k < R.fear.at + R.fear.t ? R.fear : null;
      b = step(b, P, live);
    }
    return R;
  }
  const clampK = (R, k) => Math.max(0, Math.min(R.ticks, k));
  const frame = (R, k) => {
    const f = R.frames[clampK(R, Math.round(k))];
    return Array.from({ length: R.n }, (_, i) => ({
      x: f[4 * i],
      y: f[4 * i + 1],
      vx: f[4 * i + 2],
      vy: f[4 * i + 3],
    }));
  };
  function at(R, tick) {
    const t = Math.max(0, Math.min(R.ticks, tick));
    const k0 = Math.floor(t),
      k1 = Math.min(R.ticks, k0 + 1),
      u = t - k0;
    const a = R.frames[k0],
      c = R.frames[k1];
    return Array.from({ length: R.n }, (_, i) => {
      const j = 4 * i;
      const vx = a[j + 2] + (c[j + 2] - a[j + 2]) * u,
        vy = a[j + 3] + (c[j + 3] - a[j + 3]) * u;
      return {
        x: (a[j] + wrap(c[j] - a[j], W) * u + W) % W,
        y: (a[j + 1] + wrap(c[j + 1] - a[j + 1], H) * u + H) % H,
        vx,
        vy,
      };
    });
  }
  function pushes(R, tick, i) {
    const s = sense(frame(R, tick), i, R.P);
    s.sum = [0, 1].map((k) => s.sep[k] + s.ali[k] + s.coh[k]);
    return s;
  }
  const deg = (r) => (r * 180) / Math.PI;
  function percept(R, tick, i) {
    const k = clampK(R, Math.round(tick));
    const b = frame(R, k),
      s = sense(b, i, R.P),
      p = b[i];
    const near = s.nb.reduce((m, q) => (!m || q.d < m.d ? q : m), null);
    let side = null;
    if (near) {
      const rel = (((deg(Math.atan2(near.dy, near.dx) - Math.atan2(p.vy, p.vx)) % 360) + 540) % 360) - 180;
      side = Math.abs(rel) < 45 ? "ahead" : Math.abs(rel) > 135 ? "behind" : rel > 0 ? "on its right" : "on its left";
    }
    const q = frame(R, Math.min(R.ticks, k + 1))[i];
    const turn = (((deg(Math.atan2(q.vy, q.vx) - Math.atan2(p.vy, p.vx)) % 360) + 540) % 360) - 180;
    return { n: s.nb.length, near: near ? { j: near.j, d: near.d, side } : null, turn };
  }
  function trail(R, tick, i, len = 30, every = 3) {
    const out = [];
    const now = at(R, tick)[i];
    let x = now.x,
      y = now.y;
    for (let k = 0; k <= len; k += every) {
      const p = at(R, tick - k)[i];
      x += wrap(p.x - x, W);
      y += wrap(p.y - y, H);
      if (tick - k < 0) break;
      out.push({ x, y });
    }
    return out;
  }
  const firstTick = (R, key, test) => R[key].findIndex(test);
  /** The neighbours of boid i at a fractional tick: their average heading (degrees, 0 = right, 90 = down) and their centre
      (world point, unwrapped next to boid i); null when it senses nobody. */
  function hood(R, tick, i) {
    const b = at(R, tick),
      p = b[i];
    const nb = b
      .map((q, j) => ({ q, j, dx: wrap(q.x - p.x, W), dy: wrap(q.y - p.y, H) }))
      .filter((o) => o.j !== i && Math.hypot(o.dx, o.dy) < R.P.R && Math.hypot(o.dx, o.dy) > 0);
    if (!nb.length) return null;
    const avg = (f) => nb.reduce((s, o) => s + f(o), 0) / nb.length;
    return {
      n: nb.length,
      heading: deg(
        Math.atan2(
          avg((o) => o.q.vy),
          avg((o) => o.q.vx),
        ),
      ),
      centre: { x: p.x + avg((o) => o.dx), y: p.y + avg((o) => o.dy) },
    };
  }
  Object.assign(L11, { run, at, frame, pushes, percept, trail, firstTick, hood });

  // ---------- the runs the video uses ----------
  const RUN = (L11.RUN = {});
  const r2 = (x) => Math.round(x * 100) / 100;
  // scene 8: a scattered flock forms (all three rules, R 70, the lesson's default weights 1 / 1 / 1)
  const F = (RUN.FORM = run({ n: 40, start: "scatter", seed: 29, ticks: 420 }));
  same(r2(F.polar[0]), 0.06, "FORM: polarisation at tick 0");
  same(F.groups[0], 21, "FORM: groups at tick 0");
  F.p90 = firstTick(F, "polar", (p) => p >= 0.9);
  same(F.p90, 191, "FORM: first tick with polarisation >= 0.9");
  same(r2(F.polar[420]), 0.99, "FORM: polarisation at tick 420");
  same(F.groups[420], 1, "FORM: one flock at tick 420");
  // the highlighted boid and a tick where its three pushes are all clearly visible (found by a search): each at least 0.1,
  // the largest at most 2.2x the smallest, any two at least 45 degrees apart, and their sum at least 22 degrees off each
  F.focus = 37;
  F.show = 119;
  const mag = (v) => Math.hypot(v[0], v[1]);
  const gap = (a, b) => {
    const d = Math.abs(Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0])) % (2 * Math.PI);
    return deg(Math.min(d, 2 * Math.PI - d));
  };
  const sh = pushes(F, F.show, F.focus);
  const ms = [sh.sep, sh.ali, sh.coh].map(mag);
  check(
    Math.min(...ms) >= 0.1 && Math.max(...ms) <= 2.2 * Math.min(...ms),
    "FORM: the focus boid's three pushes are not all clearly visible at the show tick",
  );
  check(
    Math.min(gap(sh.sep, sh.ali), gap(sh.ali, sh.coh), gap(sh.sep, sh.coh)) >= 45,
    "FORM: two of the focus boid's pushes point almost the same way at the show tick",
  );
  check(
    Math.min(gap(sh.sum, sh.sep), gap(sh.sum, sh.ali), gap(sh.sum, sh.coh)) >= 22,
    "FORM: the sum of the pushes hides one of them at the show tick",
  );
  same(
    [sh.nb.length, ...ms.map(r2), r2(mag(sh.sum))],
    [6, 0.22, 0.13, 0.11, 0.18],
    "FORM: neighbours, |sep|, |ali|, |coh|, |sum| of boid 37 at tick 119",
  );
  // scene 10: one boid as an agent, its percept and action in the app's own words (lesson 11.4 demo)
  const ag = percept(F, 60, 36);
  F.agent = { tick: 60, i: 36, n: ag.n, d: Math.round(ag.near.d), side: ag.near.side, turn: Math.round(ag.turn) };
  same(
    [F.agent.n, F.agent.d, F.agent.side, F.agent.turn],
    [4, 40, "on its right", 6],
    "FORM: boid 36's percept and action at tick 60",
  );
  // scene 2: a settled flock, a predator strike at the flock's centre, the flock regroups
  const S = (RUN.SCARE = run({
    n: 50,
    start: "scatter",
    seed: 2,
    warm: 600,
    ticks: 360,
    fear: { at: 120, x: "centre", t: 20 },
  }));
  same([r2(S.polar[0]), S.groups[0]], [1, 1], "SCARE: one flock heading one way before the strike");
  S.dip = Math.min(...S.polar.slice(120, 250));
  S.dipAt = S.polar.indexOf(S.dip);
  same([r2(S.dip), S.dipAt], [0.22, 140], "SCARE: lowest polarisation after the strike and its tick");
  same(Math.max(...S.groups.slice(120, 250)), 4, "SCARE: most groups after the strike");
  S.back = S.polar.findIndex((p, k) => k > S.dipAt && p >= 0.9);
  same(S.back, 253, "SCARE: polarisation back to 0.9");
  same([S.groups[360], r2(S.polar[360])], [1, 0.99], "SCARE: one flock again at the end");
  // scene 9: flash expansion from a packed start (lesson 11.3: spread about 14 -> 140 to 190 within 100 ticks)
  const B = (RUN.BURST = run({ n: 60, start: "together", seed: 5, ticks: 160 }));
  same([Math.round(B.spread[0]), Math.round(B.spread[100])], [15, 155], "BURST: spread at ticks 0 and 100");
  same([B.groups[0], B.groups[100], B.groups[160]], [1, 10, 1], "BURST: groups at ticks 0, 100, 160");
  // scene 9: two flocks meet head-on and become one (lesson 11.3)
  const M = (RUN.MEET = run({ n: 40, start: "meet", seed: 21, ticks: 200 }));
  M.merge = M.groups.findIndex((g) => g === 1);
  same([M.groups[0], M.merge], [2, 32], "MEET: two groups, merged from tick 32");
  check(
    M.groups.slice(M.merge).every((g) => g === 1),
    "MEET: stays one flock after merging",
  );
  same([r2(M.polar[0]), r2(M.polar[100])], [0, 0.98], "MEET: polarisation at ticks 0 and 100");

  // ---------- close-ups for the three rule scenes (boid 0 is the focus, at the world centre 300, 180) ----------
  const EAST = { vx: SPEED, vy: 0 },
    NORTH = { vx: 0, vy: -SPEED };
  const at0 = (pts) => pts.map(([x, y, v]) => ({ x: 300 + x, y: 180 + y, ...v }));
  const hdg = (p) => Math.round(deg(Math.atan2(p.vx, -p.vy))); // degrees clockwise from north
  L11.hdg = hdg;
  // separation only: flockmates 5 above, 15 below and 25 behind; all head east
  RUN.SEP = run({
    b0: at0([
      [0, 0, EAST],
      [0, -5, EAST],
      [0, 15, EAST],
      [-24, 7, EAST],
    ]),
    P: { ws: 1, wa: 0, wc: 0 },
    ticks: 40,
  });
  // alignment only: the focus heads north, four flockmates head east
  RUN.ALI = run({
    b0: at0([
      [0, 0, NORTH],
      [-40, -25, EAST],
      [35, -30, EAST],
      [-30, 35, EAST],
      [40, 30, EAST],
    ]),
    P: { ws: 0, wa: 1, wc: 0 },
    ticks: 50,
  });
  // cohesion only: everyone heads north, three of the four flockmates are on the focus boid's right
  RUN.COH = run({
    b0: at0([
      [0, 0, NORTH],
      [45, -20, NORTH],
      [55, 15, NORTH],
      [40, 35, NORTH],
      [-30, 5, NORTH],
    ]),
    P: { ws: 0, wa: 0, wc: 1 },
    ticks: 36,
  });
  const minPair = (b) => Math.min(...b.flatMap((p, i) => b.slice(i + 1).map((q) => dist(p, q))));
  const s0 = pushes(RUN.SEP, 0, 0);
  const mates = s0.nb.map((q) => ({ j: q.j, d: q.d, push: r2(q.d < SEP_R ? 1 - q.d / SEP_R : 0) }));
  same(
    mates.map((m) => [m.d, m.push]),
    [
      [5, 0.75],
      [15, 0.25],
      [25, 0],
    ],
    "SEP: distance and push of each flockmate",
  );
  same(s0.sep.map(r2), [0, 0.45], "SEP: the focus boid's separation push (down, away from the close one)");
  same(minPair(frame(RUN.SEP, 0)), 5, "SEP: closest pair at tick 0");
  check(minPair(frame(RUN.SEP, 15)) > SEP_R, "SEP: by tick 15 no pair is closer than 20");
  same(hdg(frame(RUN.SEP, 20)[0]), 96, "SEP: focus heading at tick 20 (it turned away, 90 -> 96)");
  const a0 = pushes(RUN.ALI, 0, 0);
  same([a0.nb.length, ...a0.ali.map(r2)], [4, 0.19, 0.19], "ALI: neighbours and alignment push at tick 0");
  const a40 = frame(RUN.ALI, 40).map(hdg);
  same(a40[0], 60, "ALI: focus heading at tick 40 (north 0 -> 60)");
  check(Math.max(...a40) - Math.min(...a40) <= 4, "ALI: at tick 40 all five headings agree within 4 degrees");
  const c0 = pushes(RUN.COH, 0, 0);
  same([c0.nb.length, ...c0.coh.map(r2)], [4, 0.11, 0.04], "COH: neighbours and cohesion push at tick 0");
  same([Math.round(RUN.COH.spread[0]), Math.round(RUN.COH.spread[30])], [37, 17], "COH: spread at ticks 0 and 30");
  same(hdg(frame(RUN.COH, 30)[0]), 42, "COH: focus heading at tick 30 (it leaned right, 0 -> 42)");
  L11.CLOSE = { SEP: { mates, push: s0.sep }, ALI: { push: a0.ali, agree: a40[0] }, COH: { push: c0.coh } };

  // ---------- small data ----------
  // lesson 11.2: one boid (heading right, +x) and 13 flockmates, offsets in units of the lesson figure (y down)
  L11.MATES = [
    [40, -20],
    [70, 35],
    [-60, 20],
    [-30, -70],
    [95, -10],
    [20, 85],
    [-110, -35],
    [125, 50],
    [150, -80],
    [-150, 70],
    [190, 15],
    [0, -100],
    [170, -10],
  ];
  const inR = (R) => L11.MATES.map(([x, y]) => Math.hypot(x, y) < R);
  const nearest = L11.MATES.reduce((m, p) => (Math.hypot(...p) < Math.hypot(...m) ? p : m));
  L11.SENSE = {
    R: [30, 50, 70, 80],
    count: [30, 50, 70, 80].map((R) => inR(R).filter(Boolean).length),
    near: {
      xy: nearest,
      d: Math.round(Math.hypot(...nearest)),
      bearing: Math.abs(Math.round(deg(Math.atan2(nearest[1], nearest[0])))),
      side: nearest[1] < 0 ? "left" : "right",
    },
    inR,
  };
  same(L11.SENSE.count, [0, 1, 2, 4], "SENSE: flockmates inside radius 30, 50, 70, 80");
  same(
    [L11.SENSE.near.d, L11.SENSE.near.bearing, L11.SENSE.near.side],
    [45, 27, "left"],
    "SENSE: the nearest flockmate",
  );
  // lesson 11.1: two fish, distance in body lengths
  const settle = (d0) => {
    const out = [d0];
    let d = d0;
    for (let n = 0; n < 40 && Math.abs(d - 3) >= 0.05; n++) out.push((d += (3 - d) * 0.25));
    return out;
  };
  L11.BAL = { push: 2.5, pull: 3.5, steady: 3, mode: (d) => (d < 2.5 ? "push" : d > 3.5 ? "pull" : "steady"), settle };
  same([1, 3, 6].map(L11.BAL.mode), ["push", "steady", "pull"], "BAL: 1, 3 and 6 body lengths");
  same([settle(6).length, settle(1).length], [16, 14], "BAL: steps of 'Let go' from 6 and from 1 lengths");
  // lesson 11.5: links between n agents
  L11.links = (n) => (n * (n - 1)) / 2;
  L11.LINKS = { n: 10, all: L11.links(10), ring: 10, n100: L11.links(100) };
  same([L11.LINKS.all, L11.LINKS.n100, L11.links(20)], [45, 4950, 190], "LINKS: 10, 100 and 20 agents");
  // lesson 11.5: the toy fault spread on a ring of 10 agents (agent 0 is faulty), ported from l11-workshop.js
  function fault(mode, broken, t) {
    let inf = new Set([0]),
      iso = new Set();
    for (let k = 1; k <= t; k++) {
      if (mode === "ring") {
        inf = new Set();
        iso = new Set([0]);
      } else if (!broken && k >= 3 && inf.size) {
        iso = new Set(inf);
        inf = new Set();
      } else if (inf.size) [...inf].forEach((i) => [(i + 1) % 10, (i + 9) % 10].forEach((j) => inf.add(j)));
    }
    return { inf: [...inf].sort((a, b) => a - b), iso: [...iso].sort((a, b) => a - b) };
  }
  L11.fault = fault;
  const steps = (mode, broken) => [0, 1, 2, 3, 4, 5, 6].map((t) => fault(mode, broken, t));
  L11.FAULT = {
    hub: steps("hub", false).map((s) => [s.inf.length, s.iso.length]),
    broken: steps("hub", true).map((s) => s.inf.length),
    ring: steps("ring", false).map((s) => [s.inf.length, s.iso.length]),
  };
  same(L11.FAULT.broken, [1, 3, 5, 7, 9, 10, 10], "FAULT: infected per step with the monitor down");
  same(L11.FAULT.hub.slice(0, 4).flat(), [1, 0, 3, 0, 5, 0, 0, 5], "FAULT: a working monitor isolates 5 at step 3");
  same(L11.FAULT.ring[1], [0, 1], "FAULT: neighbours isolate the faulty agent at step 1");
})();

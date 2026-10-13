/* Algorithms Phase 3 · Optimisation: Nelder-Mead and contour maps (window.VID.a3, part 2 of 5; needs common.js). No DOM at all.
   Every number is asserted at load time against the app's lessons (a3-nm, a3-nm-ops, a3-nm-stop); a difference throws a clear Error.

   ───────────────────────────── 6. NELDER-MEAD (lessons a3-nm, a3-nm-ops, a3-nm-stop) ─────────────────────────────
     A3.BOWL2(p) = (x - 3.5)^2 + (y - 2.2)^2 (minimum 0 at (3.5, 2.2));   A3.ROSEN(p) = 100 (y - x^2)^2 + (1 - x)^2 (minimum 0 at (1, 1)).
     A3.nmIter(S, f, P?) -> r  one round of the lecture's algorithm (S = [{p, f}]; P = {a: 1, g: 2, b: 0.5, d: 0.5}):
       r = { B, G, W (sorted best, good, worst), C (centroid of B and G), R (reflection), fR, E, fE (only if tried), M1, M2, f1, f2
             (both contraction points, only if f(R) >= f(G)), op: "reflect" | "expand" | "in" | "out" | "shrink", tried (an expansion was
             tried and failed: op is "reflect"), acc: the accepted point, ev: evaluations used, next: new sorted S }
     A3.nmRun(f, S0, {n, stop}) -> run   S0 = [[x, y], ...]; runs n rounds, or until the spread of f or the size of the triangle is < 1e-6 if stop.
       run = { rounds: [r + { k, from: [3 slot points], to: [3 slot points], moved: [slot indexes], fresh }], start: [3 slot points],
               slots: [[p, p, p] after round 0, 1, ...] (the SAME vertex keeps its slot, so a vertex moves smoothly), best: [[x,y] per round], centre: [[x,y] per round (the triangle's middle: a smoother trail than best)], evAt: [cumulative evaluations after round 0 (3), 1, ...],
               counts: [{reflect, expand, in, out, shrink} after round 0, 1, ...], ev, it }
     A3.NM_BOWL = A3.nmRun(BOWL2, [[0,0],[1,0],[0,1]], {n: 4})     the scene 8 example (minimum star at (3.5, 2.2))
       round 1: B (1,0) f 11.09, G (0,1) 13.69, W (0,0) 17.09; C (0.5,0.5); R (1,1) f 7.69 beats B; E (1.5,1.5) f 4.49 beats R -> expand (slot 0 moves)
       round 2: B (1.5,1.5) 4.49, G (1,0) 11.09, W (0,1) 13.69; C (1.25,0.75); R (2.5,0.5) 3.89; E (3.75,0.25) 3.865 -> expand (slot 2)
       round 3: B (3.75,0.25) 3.865, G (1.5,1.5) 4.49, W (1,0) 11.09; C (2.625,0.875); R (4.25,1.75) 0.765 beats B; E (5.875,2.625) 5.82
                is worse than R -> reflect, the expansion failed (slot 1)
       round 4: B (4.25,1.75) 0.765, G (3.75,0.25) 3.865, W (1.5,1.5) 4.49; C (4,1); R (6.5,0.5) 11.89 overshoots (no better than G);
                M1 (2.75,1.25) 1.465 inside, M2 (5.25,0.75) 5.165 outside -> M1 wins: inside contraction (slot 0)
     A3.nmShrink(S) -> {B, G, W} (points) where a shrink would put a sorted triangle S = [best, good, worst] (each {p}): G and W move halfway to B. For the
       "last resort" demo: A3.nmShrink(A3.NM_BOWL.rounds[3].next) (the triangle after round 4)
     A3.NM_ROS = A3.nmRun(ROSEN, [[-1,1],[-1.1,1],[-1,1.1]], {stop: true})   the scene 9 run: 84 rounds, 198 evaluations,
       moves: 29 reflect, 19 expand, 26 inside + 10 outside contractions (36 contract), 0 shrink; ends at (1.0000, 1.0000), f 2.0e-7.
     A3.nmAt(run, u, ease?) -> { slots: [[x,y] x3 (the three corners, smooth between rounds)], best: [x,y], centre: [x,y], centreTrail: [[x,y]...] (centre
       of the triangle at every finished round, plus the tip: draw it with P.path), trail: [[x,y]...] (best corner
       at every finished round up to floor(u)), counts: {reflect, expand, contract, shrink}, it: floor(u), frac: u - it }   u = 0..run.rounds.length
     A3.contours(f, [x0, x1, y0, y1], levels, {n = 140, log = false}) -> [{level, segs: [[x1,y1,x2,y2], ...]}] marching squares in DATA
       coordinates; with log true the levels are values of ln(1 + f). plot.contours() draws them.
       A3.BOWL_LEVELS (circles of radius 0.5 .. 4, f = r^2)   A3.ROS_LEVELS (ln(1 + f) from 0.4 to 6.4)
   A3.need(ok, message) and A3.near(a, b, tol) / A3.near2 (two-decimal tolerance) come from common.js */
(function () {
  const V = window.VID;
  const A3 = (V.a3 = V.a3 || {});
  const { clamp, ease: E } = V;
  const { need, near, near2 } = A3;
  // ================= 6. Nelder-Mead (a triangle: 2 variables) =================
  const BOWL2 = (p) => (p[0] - 3.5) ** 2 + (p[1] - 2.2) ** 2;
  const ROSEN = (p) => 100 * (p[1] - p[0] ** 2) ** 2 + (1 - p[0]) ** 2;
  const vadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const vsub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const vmul = (a, k) => [a[0] * k, a[1] * k];
  function nmIter(S0, f, P = { a: 1, g: 2, b: 0.5, d: 0.5 }) {
    const [B, G, W] = S0.slice().sort((x, y) => x.f - y.f);
    const C = vmul(vadd(B.p, G.p), 0.5);
    const dir = vsub(C, W.p);
    const R = vadd(C, vmul(dir, P.a));
    const r = { B, G, W, C, R, fR: f(R), ev: 1, tried: false };
    let acc = null;
    if (r.fR < G.f) {
      if (r.fR < B.f) {
        r.E = vadd(C, vmul(dir, P.g));
        r.fE = f(r.E);
        r.ev++;
        if (r.fE < r.fR) [r.op, acc] = ["expand", { p: r.E, f: r.fE }];
        else [r.op, r.tried, acc] = ["reflect", true, { p: R, f: r.fR }];
      } else [r.op, acc] = ["reflect", { p: R, f: r.fR }];
    } else {
      r.M1 = vsub(C, vmul(dir, P.b));
      r.M2 = vadd(C, vmul(dir, P.b));
      [r.f1, r.f2] = [f(r.M1), f(r.M2)];
      r.ev += 2;
      if (r.f1 < W.f && r.f1 < r.f2) [r.op, acc] = ["in", { p: r.M1, f: r.f1 }];
      else if (r.f2 < W.f && r.f2 < r.f1) [r.op, acc] = ["out", { p: r.M2, f: r.f2 }];
      else r.op = "shrink";
    }
    r.acc = acc;
    r.fresh = acc
      ? [{ ...acc }]
      : [G, W].map((v) => {
          const p = vadd(B.p, vmul(vsub(v.p, B.p), P.d));
          r.ev++;
          return { p, f: f(p) };
        });
    r.next = (acc ? [B, G, r.fresh[0]] : [B, ...r.fresh]).sort((x, y) => x.f - y.f);
    return r;
  }
  /** where a shrink would put a sorted triangle [best, good, worst] (each of {p}): the good and worst corners move halfway to the best */
  const nmShrink = (S) => ({
    B: S[0].p,
    G: vadd(S[1].p, vmul(vsub(S[0].p, S[1].p), 0.5)),
    W: vadd(S[2].p, vmul(vsub(S[0].p, S[2].p), 0.5)),
  });
  const ZERO = () => ({ reflect: 0, expand: 0, in: 0, out: 0, shrink: 0, contract: 0 });
  function nmRun(f, pts, { n = 1000, stop = false } = {}) {
    let S = pts.map((p) => ({ p, f: f(p) }));
    let slots = S.slice();
    const bestOf = (L) => L.slice().sort((x, y) => x.f - y.f)[0].p;
    const cen = (L) => [(L[0][0] + L[1][0] + L[2][0]) / 3, (L[0][1] + L[1][1] + L[2][1]) / 3];
    const run = {
      rounds: [],
      start: pts.map((p) => p.slice()),
      slots: [pts.map((p) => p.slice())],
      best: [bestOf(S)],
      centre: [cen(pts)],
      evAt: [3],
      counts: [ZERO()],
      ev: 3,
      it: 0,
    };
    const finished = () => {
      const fs = S.map((v) => v.f);
      let diam = 0;
      S.forEach((a) => S.forEach((c) => (diam = Math.max(diam, Math.hypot(a.p[0] - c.p[0], a.p[1] - c.p[1])))));
      return stop && (Math.max(...fs) - Math.min(...fs) < 1e-6 || diam < 1e-6);
    };
    for (let k = 1; k <= n && !finished(); k++) {
      const r = nmIter(S, f);
      const gone = r.op === "shrink" ? [r.G, r.W] : [r.W];
      const from = slots.map((v) => v.p);
      slots = slots.map((v) => (gone.includes(v) ? r.fresh[gone.indexOf(v)] : v));
      const to = slots.map((v) => v.p);
      S = r.next;
      const cnt = { ...run.counts[k - 1] };
      cnt[r.op]++;
      cnt.contract = cnt.in + cnt.out;
      run.rounds.push({ ...r, k, from, to, moved: from.map((p, i) => (p !== to[i] ? i : -1)).filter((i) => i >= 0) });
      run.slots.push(to.map((p) => p.slice()));
      run.best.push(bestOf(S));
      run.centre.push(cen(to));
      run.counts.push(cnt);
      run.ev += r.ev;
      run.evAt.push(run.ev);
    }
    run.it = run.rounds.length;
    run.final = { p: bestOf(S), f: Math.min(...S.map((v) => v.f)) };
    return run;
  }
  const cen = (L) => [(L[0][0] + L[1][0] + L[2][0]) / 3, (L[0][1] + L[1][1] + L[2][1]) / 3];
  function nmAt(run, u, ease = E.inOut) {
    const it = Math.min(Math.floor(u), run.it);
    const frac = it >= run.it ? 0 : u - it;
    const k = ease(clamp(frac));
    const [a, b] = [run.slots[it], run.slots[Math.min(it + 1, run.it)]];
    const slots = a.map((p, i) => [p[0] + (b[i][0] - p[0]) * k, p[1] + (b[i][1] - p[1]) * k]);
    const [p0, p1] = [run.best[it], run.best[Math.min(it + 1, run.it)]];
    const tip = [p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k];
    const trail = run.best.slice(0, it + 1);
    if (frac > 0) trail.push(tip);
    const centre = cen(slots);
    const centreTrail = run.centre.slice(0, it + 1);
    if (frac > 0) centreTrail.push(centre);
    return { slots, best: tip, centre, trail, centreTrail, counts: run.counts[it], it, frac };
  }
  /** marching squares: segments of the level curves of f over a view (data coordinates) */
  function contours(f, [x0, x1, y0, y1], levels, { n = 140, log = false } = {}) {
    const ny = Math.round((n * (y1 - y0)) / (x1 - x0));
    const val = [];
    for (let j = 0; j <= ny; j++) {
      const row = [];
      for (let i = 0; i <= n; i++) {
        const v = f([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * j) / ny]);
        row.push(log ? Math.log(1 + v) : v);
      }
      val.push(row);
    }
    const SEG = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 6: [[0, 2]], 7: [[2, 3]] };
    return levels.map((level) => {
      const segs = [];
      for (let j = 0; j < ny; j++)
        for (let i = 0; i < n; i++) {
          const c = [val[j][i], val[j][i + 1], val[j + 1][i + 1], val[j + 1][i]];
          const idx = c.reduce((s, v, k) => s + ((v > level ? 1 : 0) << k), 0);
          if (idx === 0 || idx === 15) continue;
          const mid = (c[0] + c[1] + c[2] + c[3]) / 4 > level;
          const at = (e) => {
            const corners = [
              [[i, j], [i + 1, j], c[0], c[1]],
              [[i + 1, j], [i + 1, j + 1], c[1], c[2]],
              [[i, j + 1], [i + 1, j + 1], c[3], c[2]],
              [[i, j], [i, j + 1], c[0], c[3]],
            ][e];
            const t = (level - corners[2]) / (corners[3] - corners[2]);
            const [p, q] = corners;
            return [
              x0 + ((x1 - x0) * (p[0] + (q[0] - p[0]) * t)) / n,
              y0 + ((y1 - y0) * (p[1] + (q[1] - p[1]) * t)) / ny,
            ];
          };
          let pairs = SEG[idx > 7 ? 15 - idx : idx];
          if (idx === 5)
            pairs = mid
              ? [
                  [0, 1],
                  [2, 3],
                ]
              : [
                  [3, 0],
                  [1, 2],
                ];
          if (idx === 10)
            pairs = mid
              ? [
                  [3, 0],
                  [1, 2],
                ]
              : [
                  [0, 1],
                  [2, 3],
                ];
          (pairs || []).forEach(([e1, e2]) => segs.push([...at(e1), ...at(e2)]));
        }
      return { level, segs };
    });
  }

  need(BOWL2([3.5, 2.2]) === 0 && ROSEN([1, 1]) === 0, "test functions");
  const NM_BOWL = nmRun(
    BOWL2,
    [
      [0, 0],
      [1, 0],
      [0, 1],
    ],
    { n: 4 },
  );
  {
    const R = NM_BOWL.rounds;
    const p2 = (p) => p.map((v) => +v.toFixed(3)).join(",");
    need(
      R.map((r) => r.op + (r.tried ? "*" : "")).join() === "expand,expand,reflect*,in",
      `bowl moves ${R.map((r) => r.op)}`,
    );
    need(
      p2(R[0].B.p) + p2(R[0].G.p) + p2(R[0].W.p) === "1,00,10,0" &&
        p2(R[0].C) === "0.5,0.5" &&
        p2(R[0].R) === "1,1" &&
        p2(R[0].E) === "1.5,1.5",
      "bowl round 1",
    );
    need(
      near2(R[0].B.f, 11.09) &&
        near2(R[0].G.f, 13.69) &&
        near2(R[0].W.f, 17.09) &&
        near2(R[0].fR, 7.69) &&
        near2(R[0].fE, 4.49),
      "bowl round 1 values",
    );
    need(
      p2(R[1].C) === "1.25,0.75" &&
        p2(R[1].R) === "2.5,0.5" &&
        p2(R[1].E) === "3.75,0.25" &&
        near2(R[1].fR, 3.89) &&
        near2(R[1].fE, 3.87),
      "bowl round 2",
    );
    need(
      p2(R[2].C) === "2.625,0.875" &&
        p2(R[2].R) === "4.25,1.75" &&
        p2(R[2].E) === "5.875,2.625" &&
        near2(R[2].fR, 0.77) &&
        near2(R[2].fE, 5.82),
      "bowl round 3",
    );
    need(
      p2(R[3].C) === "4,1" &&
        p2(R[3].R) === "6.5,0.5" &&
        p2(R[3].M1) === "2.75,1.25" &&
        p2(R[3].M2) === "5.25,0.75" &&
        near2(R[3].fR, 11.89) &&
        near2(R[3].f1, 1.47) &&
        near2(R[3].f2, 5.17),
      "bowl round 4",
    );
  }
  const NM_ROS = nmRun(
    ROSEN,
    [
      [-1, 1],
      [-1.1, 1],
      [-1, 1.1],
    ],
    { stop: true },
  );
  {
    const c = NM_ROS.counts[NM_ROS.it];
    need(NM_ROS.it === 84 && NM_ROS.ev === 198, `rosenbrock run ${NM_ROS.it} rounds, ${NM_ROS.ev} evaluations`);
    need(`${c.reflect},${c.expand},${c.in},${c.out},${c.shrink}` === "29,19,26,10,0", "rosenbrock move counts");
    need(
      near(NM_ROS.final.p[0], 1, 1e-4) && near(NM_ROS.final.p[1], 1, 1e-3) && NM_ROS.final.f < 3e-7,
      "rosenbrock end",
    );
  }
  const BOWL_LEVELS = [0.25, 1, 2.25, 4, 6.25, 9, 12.25, 16];
  const ROS_LEVELS = [0.4, 0.9, 1.4, 1.9, 2.5, 3.1, 3.8, 4.6, 5.5, 6.4];

  Object.assign(A3, {
    BOWL2,
    ROSEN,
    nmIter,
    nmRun,
    nmAt,
    nmShrink,
    NM_BOWL,
    NM_ROS,
    contours,
    BOWL_LEVELS,
    ROS_LEVELS,
  });
})();

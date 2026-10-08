/* Algorithms Phase 3 · Optimisation: the data and the real algorithms every scene of this video shares (window.VID.a3, short name A3).
   Part 1 of 5 (no DOM at all; common-2.js = Nelder-Mead + contours, common-3.js = the plot panel, common-4.js = stickers and bars, common-5.js = extra plot handles). Every function is deterministic and every
   number below is ASSERTED at load time against the app's own lessons (js/content/algo/algo-p3-*.js): if one differs, loading
   the page throws a clear Error. There is no randomness in this video.

   Colour roles of THIS video (use VID.l5.tone(name) for the CSS vars):
     green  = allowed / better / kept / the answer;  red = not allowed / worse / thrown away;  blue = the point we look at
     (current corner, probe, triangle's middle corner);  purple = the rules and the operators (constraint lines, parabola,
     reflect/expand arrows);  orange = the goal and the chosen (profit line, optimum star, entering variable, minimum);  grey = neutral.
   Numbers print with a real minus sign: A3.fmt(-0.351, 3) -> "−0.351".

   ───────────────────────────── 1. THE LINEAR PROGRAM (lessons a3-lp, a3-formulate) ─────────────────────────────
     max z = 3x + 2y   subject to   1: x + 2y <= 10 (machine hours)   2: 3x + y <= 15 (raw material)   x, y >= 0
     A3.LP = { c: [3, 2], rules: [{id: "m", n: 1, name: "machine", short: "x + 2y ≤ 10", a: 1, b: 2, r: 10},
                                  {id: "r", n: 2, name: "material", short: "3x + y ≤ 15", a: 3, b: 1, r: 15}] }
     A3.CORNERS      [[0,0],[5,0],[4,3],[0,5]] the feasible polygon, counter-clockwise from the origin (computed by clipping)
     A3.z(p)         3x + 2y        A3.CORNER_Z  [0, 15, 18, 10]       A3.BEST  [4, 3]  (z = 18)
     A3.PLANS        the lesson's five candidate plans [[2,2],[4,3],[5,3],[1,5],[6,1]]
     A3.check(p)     -> { m, r, okM, okR, ok }  m = x + 2y, r = 3x + y (the two sums to compare with 10 and 15), ok = both pass.
                        (2,2): 6 and 8 pass; (4,3): 10 and 15 pass (exactly on both lines); (5,3): 11 and 18 fail both;
                        (1,5): 11 fails, 8 passes; (6,1): 8 passes, 19 fails
     A3.iso(z)       the profit line 3x + 2y = z: { p0: [z/3, 0], p1: [0, z/2] }   (parallel for every z; slope -3/2)
     A3.clip(poly, a, b, r)   Sutherland-Hodgman: the part of a polygon with a*x + b*y <= r (any polygon, data coordinates)

   ───────────────────────────── 2. SIMPLEX (lesson a3-simplex), exact fractions ─────────────────────────────
     A3.SIMPLEX = { steps: [...], final }   Dantzig's rule + ratio test on the dictionary form of the same LP.
       steps[k] = { from: [x, y] corner now, z, nb: ["x","y"] non-basic names (the variables that could enter),
                    gains: [Q, Q] z gained per unit of each (a fraction {n, d}),
                    enter: "x", ratios: [{row: "s1", val: Q}, ...] how far the entering variable may grow before each row hits 0,
                    leave: "s2" (smallest ratio), to: [x, y] corner after the pivot, zTo }
       step 0: from (0,0) z 0, gains x +3, y +2, enter x, ratios s1 10, s2 5, leave s2, to (5,0) z 15
       step 1: from (5,0) z 15, nb [s2, y] gains s2 -1, y +1, enter y, ratios x 15, s1 3, leave s1, to (4,3) z 18
       final = { at: [4, 3], z: 18, nb: ["s2","s1"], gains: [-4/5, -3/5] }   (no positive gain: optimal)
     A3.ROW_NAME  { s1: "machine", s2: "material", x: "y-axis", y: "x-axis" } what a ratio row means geometrically (the boundary line you hit)
     A3.qv(Q) -> number     A3.qt(Q) -> "−3/5" | "3" text of a fraction (real minus)

   ───────────────────────────── 3. BISECTION ON THE SLOPE (lessons a3-bisect, a3-convex) ─────────────────────────────
     A3.EXP = { f: x => e^x - 2x, df: x => e^x - 2, min: ln 2 = 0.6931 }   a bowl: falling left of the minimum, rising right of it.
     A3.bisect(steps = 4) -> { rows, a, b }  start bracket [0, 1] with f'(0) = -1 (falling) and f'(1) = 0.718 (rising).
       rows[k] = { k: 1.., a, b, m, slope: f'(m), falling: slope < 0, keep: "a" | "b" (which end moves up to m),
                   cut: [lo, hi] the half that is thrown away, width: new width, wa, wb: the new ends }
       1: m 0.5 slope -0.351 falling, a -> 0.5, cut [0, 0.5], width 0.5      2: m 0.75 slope +0.117 rising, b -> 0.75, cut [0.75, 1], 0.25
       3: m 0.625 slope -0.132, a -> 0.625, cut [0.5, 0.625], 0.125          4: m 0.6875 slope -0.011, a -> 0.6875, cut [0.625, 0.6875], 0.0625
       end: bracket [0.6875, 0.75], it contains ln 2 = 0.6931

   ───────────────────────────── 4. GOLDEN SECTION (lesson a3-bracket) ─────────────────────────────
     A3.BF (the curve: 2.2 |x - 0.62|^1.4 + 0.25, a kinked dip, minimum 0.25 at 0.62)     A3.GR = 0.381966 (the golden cut)
     A3.golden(steps = 8) -> { start: T, steps }   T = { a, b, c, fa, fb, fc } a bracket triple (f(b) lowest)
       steps[k] = { k: 1.., t: T before, x: the new probe, fx, lower: f(x) < f(b), nt: T after, cut: [lo, hi] thrown away,
                    width: nt.c - nt.a, evals: 3 + k }
       start (0, 0.382, 1) with f 1.377, 0.545, 0.818.   Every step multiplies the width by 0.618 and costs ONE evaluation.
       1: x 0.618 (f 0.250, lower) -> (0.382, 0.618, 1) cut [0, 0.382]       2: x 0.764 (0.396, higher) -> (0.382, 0.618, 0.764) cut [0.764, 1]
       3: x 0.528 (0.328, higher) -> (0.528, 0.618, 0.764) cut [0.382, 0.528]   4: x 0.674 (0.287, higher) -> (0.528, 0.618, 0.674) cut [0.674, 0.764]
       (the middle point b is 0.618 from step 1 on: it IS the minimiser's neighbour, so it stays the lowest while the ends close in)
       widths 0.618, 0.382, 0.236, 0.146 (= 0.618^k)
     A3.goldenX(t)    where the golden probe goes for a triple     A3.retriple(t, x, fx)   the new triple after evaluating x

   ───────────────────────────── 5. BRENT (lesson a3-brent) ─────────────────────────────
     A3.parab(t) -> x of the lowest point of the parabola through (a,fa), (b,fb), (c,fc) (null if the three are in a line)
     A3.lagrange(t) -> function x -> y of that parabola (draw it with plot.curve)
     A3.brent(steps = 8) -> { start: T, steps }  Same curve and start triple as golden. Parabola jump when it is safe, else a golden step.
       steps[k] = { k, t, kind: "P" | "G", why ("" for P: "the step is not shrinking fast enough"), vertex: the parabola's lowest point
                    (also on a G step, where it is the one that was NOT trusted), x: the probe actually used, fx, nt, cut, width, evals,
                    step: |x - b| }
       kinds P P P G P G P P.  x: 0.6067, 0.6408, 0.6116, 0.6228 (golden), 0.6212, 0.6176 (golden), 0.6200, 0.6198
       vertex on the G steps: 0.6207 (step 4, rejected: |vertex - b| = 0.0091 is more than half the last step 0.0049), 0.6193 (step 6)
       cuts: 1 [0, 0.382]  2 [0.641, 1]  3 [0.382, 0.607]  4 [0.607, 0.612]  (c stays 1 after step 1, then 0.641)
       widths after steps 1..8: 0.618, 0.259, 0.034, 0.029, 0.011, 0.005, 0.004, 0.0014
       triples: start (0, 0.382, 1); 1 (0.382, 0.607, 1); 2 (0.382, 0.607, 0.641); 3 (0.607, 0.612, 0.641); 4 (0.612, 0.623, 0.641)
       After step 4 (7 evaluations) Brent's bracket is 0.029 wide; golden after the same 4 steps is 0.146 wide; after 8 steps 0.0014 vs 0.021.
     A3.viewFor(t, {padX = 0.25, y0, y1, top = 0.1}) -> [x0, x1, y0, y1] a plot view that frames a triple: x from a - padX*width to c + padX*width,
       y from the lowest value (minus 15 %) up to the highest + top*range (raise top to leave room for cards above the curve)
     A3.mixView(v0, v1, k) -> the view blended by k (0..1, eased) so a zoom is one ramp

   ───────────────────────────── 7. SMALL HELPERS ─────────────────────────────
     A3.fmt(v, digits = 3) -> text with a real minus and trailing zeros trimmed     A3.rng(seed) -> seeded generator (mulberry32)
     A3.need(ok, message)  throws "VID.a3: <message>" (the build-time assert used below; scenes use it too) */
(function () {
  const V = window.VID;
  const A3 = (V.a3 = V.a3 || {});
  const { clamp, ease: E } = V;
  const need = (ok, msg) => {
    if (!ok) throw new Error(`VID.a3: ${msg}`);
  };
  const near = (a, b, tol = 5e-4) => Math.abs(a - b) <= tol;
  const near2 = (a, b) => Math.abs(a - b) <= 6e-3; // a value quoted to two decimals
  const fmt = (v, d = 3) => String(+(+v).toFixed(d)).replace("-", "−");
  const rng = (seed) => {
    let a = seed | 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // ================= 1. the linear program =================
  const LP = {
    c: [3, 2],
    rules: [
      { id: "m", n: 1, name: "machine", short: "x + 2y ≤ 10", a: 1, b: 2, r: 10 },
      { id: "r", n: 2, name: "material", short: "3x + y ≤ 15", a: 3, b: 1, r: 15 },
    ],
  };
  /** keep the part of a polygon with a*x + b*y <= r */
  function clip(poly, a, b, r) {
    const out = [];
    const inside = (p) => a * p[0] + b * p[1] <= r + 1e-9;
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length];
      const [pi, qi] = [inside(p), inside(q)];
      if (pi) out.push(p);
      if (pi !== qi) {
        const t = (r - a * p[0] - b * p[1]) / (a * (q[0] - p[0]) + b * (q[1] - p[1]));
        out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
      }
    });
    return out;
  }
  function region() {
    let poly = [
      [0, 0],
      [40, 0],
      [40, 40],
      [0, 40],
    ];
    LP.rules.forEach((u) => (poly = clip(poly, u.a, u.b, u.r)));
    poly = poly.map(([x, y]) => [Math.round(x * 1e6) / 1e6, Math.round(y * 1e6) / 1e6]);
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
    const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    poly.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
    const i0 = poly.findIndex((p) => p[0] === 0 && p[1] === 0);
    return poly.slice(i0).concat(poly.slice(0, i0));
  }
  const z = (p) => LP.c[0] * p[0] + LP.c[1] * p[1];
  const check = (p) => {
    const [m, r] = [p[0] + 2 * p[1], 3 * p[0] + p[1]];
    return { m, r, okM: m <= 10, okR: r <= 15, ok: m <= 10 && r <= 15 };
  };
  const iso = (zz) => ({ p0: [zz / 3, 0], p1: [0, zz / 2] });
  const CORNERS = region();
  const CORNER_Z = CORNERS.map(z);
  const PLANS = [
    [2, 2],
    [4, 3],
    [5, 3],
    [1, 5],
    [6, 1],
  ];
  need(CORNERS.map((p) => p.join()).join(";") === "0,0;5,0;4,3;0,5", `corners ${JSON.stringify(CORNERS)}`);
  need(CORNER_Z.join() === "0,15,18,10", `corner scores ${CORNER_Z}`);
  need(
    PLANS.map((p) => Object.values(check(p)).join()).join(";") ===
      "6,8,true,true,true;10,15,true,true,true;11,18,false,false,false;11,8,false,true,false;8,19,true,false,false",
    "plan checks",
  );
  need(Math.max(...CORNER_Z) === 18 && CORNER_Z.indexOf(18) === 2, "best corner is (4, 3) with z = 18");

  // ================= 2. simplex on the dictionary, exact fractions =================
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a) || 1);
  const Q = (n, d = 1) => {
    const g = gcd(n, d);
    const s = d < 0 ? -1 : 1;
    return { n: (s * n) / g, d: (s * d) / g };
  };
  const qa = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
  const qs = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
  const qm = (a, b) => Q(a.n * b.n, a.d * b.d);
  const qd = (a, b) => Q(a.n * b.d, a.d * b.n);
  const qv = (a) => a.n / a.d;
  const qt = (a) => (a.n < 0 ? "−" : "") + (a.d === 1 ? Math.abs(a.n) : `${Math.abs(a.n)}/${a.d}`);
  const ROW_NAME = { s1: "machine", s2: "material", x: "y-axis", y: "x-axis" };
  /* dictionary form: z = z0 + sum c[j] nb[j];  basic[i] = b[i] - sum M[i][j] nb[j] */
  function simplex() {
    const nb = ["x", "y"];
    const basic = ["s1", "s2"];
    let c = [Q(3), Q(2)];
    let z0 = Q(0);
    let M = [
      [Q(1), Q(2)],
      [Q(3), Q(1)],
    ];
    let b = [Q(10), Q(15)];
    const corner = () => ["x", "y"].map((v) => (basic.includes(v) ? qv(b[basic.indexOf(v)]) : 0));
    const steps = [];
    for (let guard = 0; guard < 8; guard++) {
      const j = c.reduce((m, g, k) => (qv(g) > 0 && (m < 0 || qv(g) > qv(c[m])) ? k : m), -1);
      if (j < 0) return { steps, final: { at: corner(), z: qv(z0), nb: nb.slice(), gains: c.slice() } };
      const ratios = M.map((row, i) => (qv(row[j]) > 0 ? { row: basic[i], val: qd(b[i], row[j]), i } : null)).filter(
        Boolean,
      );
      const i = ratios.reduce((m, r) => (m < 0 || qv(r.val) < qv(ratios[m].val) ? ratios.indexOf(r) : m), -1);
      const row = ratios[i].i;
      const step = {
        from: corner(),
        z: qv(z0),
        nb: nb.slice(),
        gains: c.slice(),
        enter: nb[j],
        ratios: ratios.map((r) => ({ row: r.row, val: r.val })),
        leave: basic[row],
      };
      const [oM, ob, oc] = [M, b, c];
      const aij = oM[row][j];
      const rowI = oM[row].map((v, k) => (k === j ? qd(Q(1), aij) : qd(v, aij)));
      const bi = qd(ob[row], aij);
      const minus = (v, rj, k) => (k === j ? qm(Q(-1), qm(rj, rowI[j])) : qs(v, qm(rj, rowI[k])));
      M = oM.map((r, ri) => (ri === row ? rowI : r.map((v, k) => minus(v, r[j], k))));
      b = ob.map((v, ri) => (ri === row ? bi : qs(v, qm(oM[ri][j], bi))));
      c = oc.map((v, k) => minus(v, oc[j], k));
      z0 = qa(z0, qm(oc[j], bi));
      [nb[j], basic[row]] = [basic[row], nb[j]];
      step.to = corner();
      step.zTo = qv(z0);
      steps.push(step);
    }
    return need(false, "simplex did not stop");
  }
  const SIMPLEX = simplex();
  {
    const [s0, s1] = SIMPLEX.steps;
    const rt = (s) => s.ratios.map((r) => `${r.row}:${qt(r.val)}`).join();
    need(SIMPLEX.steps.length === 2, "simplex takes two pivots");
    need(
      s0.from.join() === "0,0" && s0.z === 0 && s0.gains.map(qt).join() === "3,2" && s0.enter === "x",
      "pivot 1 start",
    );
    need(rt(s0) === "s1:10,s2:5" && s0.leave === "s2" && s0.to.join() === "5,0" && s0.zTo === 15, "pivot 1 ratio test");
    need(s1.nb.join() === "s2,y" && s1.gains.map(qt).join() === "−1,1" && s1.enter === "y", "pivot 2 gains");
    need(rt(s1) === "s1:3,x:15" && s1.leave === "s1" && s1.to.join() === "4,3" && s1.zTo === 18, "pivot 2 ratio test");
    const f = SIMPLEX.final;
    need(
      f.at.join() === "4,3" && f.z === 18 && f.nb.join() === "s2,s1" && f.gains.map(qt).join() === "−4/5,−3/5",
      "simplex end",
    );
  }

  // ================= 3. bisection on the slope =================
  const EXP = { f: (x) => Math.exp(x) - 2 * x, df: (x) => Math.exp(x) - 2, min: Math.LN2 };
  function bisect(steps = 4) {
    let [a, b] = [0, 1];
    const rows = [];
    for (let k = 1; k <= steps; k++) {
      const m = (a + b) / 2;
      const slope = EXP.df(m);
      const falling = slope < 0;
      const cut = falling ? [a, m] : [m, b];
      const row = { k, a, b, m, slope, falling, keep: falling ? "a" : "b", cut };
      if (falling) a = m;
      else b = m;
      rows.push({ ...row, width: b - a, wa: a, wb: b });
    }
    return { rows, a, b };
  }
  {
    const r = bisect(4);
    need(r.rows.map((x) => `${x.m}${x.falling ? "a" : "b"}`).join() === "0.5a,0.75b,0.625a,0.6875a", "bisection moves");
    need(r.rows.map((x) => x.width).join() === "0.5,0.25,0.125,0.0625", "bisection widths");
    need(
      near(EXP.df(0), -1) &&
        near(EXP.df(1), 0.7183) &&
        r.a === 0.6875 &&
        r.b === 0.75 &&
        r.a < EXP.min &&
        EXP.min < r.b,
      "bisection end",
    );
    need(
      near(r.rows[0].slope, -0.3513) && near(r.rows[1].slope, 0.117) && near(r.rows[3].slope, -0.0113),
      "bisection slopes",
    );
  }

  // ================= 4. golden section =================
  const BF = (x) => 2.2 * Math.abs(x - 0.62) ** 1.4 + 0.25;
  const GR = (3 - Math.sqrt(5)) / 2;
  const triple = (a, b, c, f = BF) => ({ a, b, c, fa: f(a), fb: f(b), fc: f(c) });
  const goldenX = (t) => (t.c - t.b > t.b - t.a ? t.b + GR * (t.c - t.b) : t.b - GR * (t.b - t.a));
  function retriple(t, x, fx) {
    let { a, b, c, fa, fb, fc } = t;
    if (x > b) {
      if (fx < fb) [a, fa, b, fb] = [b, fb, x, fx];
      else [c, fc] = [x, fx];
    } else if (fx < fb) [c, fc, b, fb] = [b, fb, x, fx];
    else [a, fa] = [x, fx];
    return { a, b, c, fa, fb, fc };
  }
  /** the part of the bracket that the new probe throws away */
  const cutOf = (t, x, fx) => {
    const lo = x > t.b ? (fx < t.fb ? t.a : x) : fx < t.fb ? t.b : t.a;
    const hi = x > t.b ? (fx < t.fb ? t.b : t.c) : fx < t.fb ? t.c : x;
    return [lo, hi];
  };
  function golden(steps = 8) {
    const start = triple(0, GR, 1);
    let t = start;
    const out = [];
    for (let k = 1; k <= steps; k++) {
      const x = goldenX(t);
      const fx = BF(x);
      const nt = retriple(t, x, fx);
      out.push({ k, t, x, fx, lower: fx < t.fb, nt, cut: cutOf(t, x, fx), width: nt.c - nt.a, evals: 3 + k });
      t = nt;
    }
    return { start, steps: out };
  }
  {
    const g = golden(8);
    need(
      g.steps
        .map((s) => s.x.toFixed(3))
        .slice(0, 4)
        .join() === "0.618,0.764,0.528,0.674",
      "golden probes",
    );
    need(
      g.steps
        .map((s) => s.lower)
        .slice(0, 4)
        .join() === "true,false,false,false",
      "golden lower flags",
    );
    need(
      g.steps.every((s) => near(s.width, 0.618034 ** s.k, 2e-4)),
      "golden shrinks by 0.618 each step",
    );
    need(
      near(g.start.fa, 1.3766) && near(g.start.fb, 0.5449) && near(g.start.fc, 0.8177) && near(g.steps[0].fx, 0.2504),
      "golden start values",
    );
    need(
      g.steps[0].cut.map((v) => v.toFixed(3)).join() === "0.000,0.382" &&
        g.steps[1].cut.map((v) => v.toFixed(3)).join() === "0.764,1.000",
      "golden cuts",
    );
  }

  // ================= 5. Brent =================
  const parab = (t) => {
    const num = (t.b - t.a) ** 2 * (t.fb - t.fc) - (t.b - t.c) ** 2 * (t.fb - t.fa);
    const den = (t.b - t.a) * (t.fb - t.fc) - (t.b - t.c) * (t.fb - t.fa);
    return den === 0 ? null : t.b - (0.5 * num) / den;
  };
  const lagrange = (t) => (x) =>
    (t.fa * ((x - t.b) * (x - t.c))) / ((t.a - t.b) * (t.a - t.c)) +
    (t.fb * ((x - t.a) * (x - t.c))) / ((t.b - t.a) * (t.b - t.c)) +
    (t.fc * ((x - t.a) * (x - t.b))) / ((t.c - t.a) * (t.c - t.b));
  function brent(steps = 8) {
    const start = triple(0, GR, 1);
    let [t, last] = [start, 1];
    const out = [];
    for (let k = 1; k <= steps; k++) {
      const vertex = parab(t);
      let [x, kind, why] = [vertex, "P", ""];
      if (x === null) [kind, why] = ["G", "the three points are in a straight line"];
      else if (!(x > t.a && x < t.c)) [kind, why] = ["G", "the parabola's lowest point is outside the bracket"];
      else if (Math.abs(x - t.b) < 1e-9) [kind, why] = ["G", "the parabola's lowest point is already b"];
      else if (Math.abs(x - t.b) > 0.5 * last) [kind, why] = ["G", "the step is not shrinking fast enough"];
      if (kind === "G") x = goldenX(t);
      const [fx, step] = [BF(x), Math.abs(x - t.b)];
      const nt = retriple(t, x, fx);
      out.push({ k, t, kind, why, vertex, x, fx, nt, cut: cutOf(t, x, fx), width: nt.c - nt.a, evals: 3 + k, step });
      [t, last] = [nt, step];
    }
    return { start, steps: out };
  }
  {
    const r = brent(8);
    need(r.steps.map((s) => s.kind).join("") === "PPPGPGPP", `brent kinds ${r.steps.map((s) => s.kind).join("")}`);
    need(
      r.steps.map((s) => s.x.toFixed(4)).join() === "0.6067,0.6408,0.6116,0.6228,0.6212,0.6176,0.6200,0.6198",
      `brent probes ${r.steps.map((s) => s.x.toFixed(4))}`,
    );
    need(r.steps[3].why === "the step is not shrinking fast enough" && r.steps[3].vertex !== null, "brent unsafe step");
    need(
      near(r.steps[0].width, 0.618, 1e-3) &&
        near(r.steps[3].width, 0.0292, 5e-4) &&
        near(r.steps[7].width, 0.0014, 5e-4),
      "brent widths",
    );
    need(
      near(golden(4).steps[3].width, 0.1459, 5e-4) && near(golden(8).steps[7].width, 0.0213, 5e-4),
      "golden widths after 4 and 8 steps",
    );
    need(
      r.steps.map((x) => +x.width.toFixed(3)).join() === "0.618,0.259,0.034,0.029,0.011,0.005,0.004,0.001",
      "brent width series",
    );
    need(
      near(r.steps[3].vertex, 0.6207) &&
        near(r.steps[5].vertex, 0.6193) &&
        r.steps[3].cut.map((v) => v.toFixed(3)).join() === "0.607,0.612",
      "brent unsafe vertices",
    );
  }
  const viewFor = (t, { padX = 0.25, y0, y1, top = 0.1 } = {}) => {
    const w = t.c - t.a;
    const [x0, x1] = [t.a - w * padX, t.c + w * padX];
    const ys = Array.from({ length: 41 }, (_, i) => BF(x0 + ((x1 - x0) * i) / 40));
    const lo = y0 == null ? Math.min(...ys) : y0;
    const hi = y1 == null ? Math.max(...ys) : y1;
    return [x0, x1, lo - (hi - lo) * 0.15, hi + (hi - lo) * top];
  };
  const mixView = (v0, v1, k) => v0.map((v, i) => v + (v1[i] - v) * E.inOut(clamp(k)));

  A3.need = need;
  Object.assign(A3, {
    LP,
    CORNERS,
    CORNER_Z,
    PLANS,
    BEST: [4, 3],
    z,
    check,
    iso,
    clip,
    ROW_NAME,
    SIMPLEX,
    qv,
    qt,
    EXP,
    bisect,
    BF,
    GR,
    golden,
    goldenX,
    retriple,
    parab,
    lagrange,
    brent,
    viewFor,
    mixView,
    fmt,
    rng,
    near,
    near2,
  });
})();

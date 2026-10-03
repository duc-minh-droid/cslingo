/* Algorithms, Phase 3 workshop: 3.W "Corner hunt" (no code). Part 1 of 5: the maths and the plot geometry.
   A live factory LP (max z = 3x + c·y, machine hours, raw material, optional demand cap). Drag a plan, slide the profit
   line, walk corner to corner like simplex, tilt the objective, squeeze with the cap. Every vertex and profit is computed
   from the constraints on the fly (Sutherland–Hodgman clipping + Cyrus–Beck for the profit line), never typed. */
(function () {
  const partScope = (NIC.shared.algoWorkshops3 = NIC.shared.algoWorkshops3 || {});

  const N = NIC;

  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);
  const BIG = 40,
    EPS = 1e-9;
  const nice = (v) => String(Math.round(v * 100) / 100);
  const pt = (p) => `(${nice(p[0])}, ${nice(p[1])})`;

  /* ---------- the maths ---------- */
  const rules = (m) => {
    const r = [
      { id: "c1", t: "Machine hours", f: "x + 2y", lim: 10, a: 1, b: 2, col: "violet" },
      { id: "c2", t: "Raw material", f: "3x + y", lim: 15, a: 3, b: 1, col: "amber" },
    ];
    if (m.capOn) r.push({ id: "cap", t: "Demand cap", f: "y", lim: m.cap, a: 0, b: 1, col: "blue" });
    return r;
  };
  /** Clip the box by each half-plane a·x + b·y ≤ lim; gives the corners in anticlockwise order from the origin. */
  function polygon(rs) {
    let poly = [
      [0, 0],
      [BIG, 0],
      [BIG, BIG],
      [0, BIG],
    ];
    rs.forEach(({ a, b, lim }) => {
      const out = [],
        inside = (p) => a * p[0] + b * p[1] <= lim + EPS;
      poly.forEach((p, i) => {
        const q = poly[(i + 1) % poly.length],
          pi = inside(p),
          qi = inside(q);
        if (pi) out.push(p);
        if (pi !== qi) {
          const t = (lim - a * p[0] - b * p[1]) / (a * (q[0] - p[0]) + b * (q[1] - p[1]));
          out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
        }
      });
      poly = out;
    });
    return poly.filter((p, i) => {
      const q = poly[(i + 1) % poly.length];
      return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-7;
    });
  }
  const zOf = (p, m) => 3 * p[0] + m.c2 * p[1];
  function bestOf(poly, m) {
    const zs = poly.map((p) => zOf(p, m)),
      z = Math.max(...zs);
    return { z, idx: zs.map((v, i) => (v >= z - 1e-7 ? i : -1)).filter((i) => i >= 0) };
  }
  /** The part of the profit line 3x + c·y = z that lies inside the polygon (Cyrus–Beck), or null. */
  function legal(poly, m, z) {
    const P0 = [z / 3, 0],
      D = [m.c2, -3];
    let t0 = -1e9,
      t1 = 1e9;
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i],
        B = poly[(i + 1) % poly.length],
        e = [B[0] - A[0], B[1] - A[1]];
      const f0 = e[0] * (P0[1] - A[1]) - e[1] * (P0[0] - A[0]),
        fd = e[0] * D[1] - e[1] * D[0];
      if (Math.abs(fd) < 1e-12) {
        if (f0 < -EPS) return null;
      } else {
        const t = (-EPS - f0) / fd;
        if (fd > 0) t0 = Math.max(t0, t);
        else t1 = Math.min(t1, t);
      }
    }
    if (t0 > t1 + 1e-7) return null;
    const a = [P0[0] + t0 * D[0], P0[1] + t0 * D[1]],
      b = [P0[0] + t1 * D[0], P0[1] + t1 * D[1]];
    return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) };
  }
  const lhs = (r, p) => r.a * p[0] + r.b * p[1];
  const same = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6;

  /* ---------- plot geometry: data (0..7)² -> svg px ---------- */
  const SPAN = 7,
    X0 = 40,
    Y0 = 355,
    U = 50;
  const X = (x) => X0 + U * x,
    Y = (y) => Y0 - U * y;
  Object.assign(partScope, {
    SPAN,
    U,
    X,
    X0,
    Y,
    Y0,
    bestOf,
    fxOn,
    legal,
    lhs,
    nice,
    polygon,
    pt,
    rules,
    same,
    snd,
    zOf,
  });
})();

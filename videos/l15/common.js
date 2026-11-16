/* Lecture 15 · Multi-objective particle swarm optimisation: pure data and algorithms (VID.l15, short name L15). NO DOM here.
   The app's own kernel (js/content/nic/l15-01.js archAdd / pruneCrowd / hv / contrib, l15-02.js the drone MOPSO, l13-01.js
   dom / crowd / mulberry) is ported line for line, run ONCE when the page loads, and every number the storyboard
   (videos/_plan/lecture-15.json) quotes is ASSERTED: a wrong figure throws a clear Error. Scenes only look values up.
   Both objectives are minimised everywhere (time across, energy up; lower is better).

   KERNEL  L15.dom(a, b) a dominates b;  L15.archAdd(A, y) -> {A, log ("rm" | "beats" | "tie" per member), added}
           L15.crowd(P, idx) -> {i: distance};  L15.pruneCrowd(P, cap) -> {keep, out: [[index, distance], ...]}
           L15.hv(P, r), L15.contrib(P, r) (each member's own share of the hypervolume with reference r)
           L15.boxes(P, r) -> [{i, a: [x, y], b: [x, y]}] each member's own (exclusive) hypervolume box, sorted by x
   DATA    L15.SWARM9 {ids, P, at}: lesson 15.1's nine routes A..I; L15.FRONT9 = A B C E G (non-dominated), F is the particle.
           L15.MOVES: one particle's four moves from p best (5, 5); L15.PB = [{y, old, neu, mvOld, mvNew}] after each move
             (keep oldest: (5,5) (5,5) (5,5) (4.5,4);  keep newest: (4,6) (4,6) (3.5,5.5) (4.5,4)).
           L15.ARCH a1..a5 and L15.NEWS = [{y, R, A}] the three newcomers (2, 4) (5, 4.5) (7, 2) added in turn
             ((2, 4) removes a2 a3; (5, 4.5) is turned away by (2, 4); (7, 2) joins; final size 5).
           L15.P12 lesson 15.2's twelve members a..l; L15.PRUNE = pruneCrowd to cap 6: out j f c k g b, keep a d e h i l.
           L15.H archive a..e and L15.SW particles P..V (lesson 15.3); L15.COUNT[i] = particles member i dominates
             (a 1, b 1, c 4, d 2, e 1); L15.HVP = contributions with particle P (7, 7.5) as reference: b 1.5, c 4, d 1.5.
           L15.RUN: 21 snapshots {P, A} (swarm and archive objective vectors) of the lesson's drone MOPSO, seed 4, cap 10,
             crowding prune, random leader, keep-newest p best; L15.TRUE = the true front (41 points).
           L15.SHARE(M) = 2 / 2^M, the share of space around a point that dominance can compare. */
(function () {
  const V = window.VID;
  const L15 = (V.l15 = V.l15 || {});

  function same(got, want, what) {
    const eq = (a, b) => (typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < 1e-9 || a === b : a === b);
    const ok = Array.isArray(want)
      ? Array.isArray(got) && got.length === want.length && want.every((w, i) => eq(got[i], w))
      : eq(got, want);
    if (!ok) throw new Error(`VID.l15: ${what}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  }

  // ---------- kernel (l13-01.js, l15-01.js, l15-02.js), both objectives minimised ----------
  function dom(a, b) {
    let better = false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] > b[i]) return false;
      if (a[i] < b[i]) better = true;
    }
    return better;
  }
  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  function crowd(P, idx) {
    const d = {};
    idx.forEach((i) => (d[i] = 0));
    for (let m = 0; m < P[idx[0]].length; m++) {
      const o = [...idx].sort((a, b) => P[a][m] - P[b][m]);
      const span = P[o[o.length - 1]][m] - P[o[0]][m] || 1;
      d[o[0]] = d[o[o.length - 1]] = Infinity;
      for (let k = 1; k < o.length - 1; k++) d[o[k]] += (P[o[k + 1]][m] - P[o[k - 1]][m]) / span;
    }
    return d;
  }
  function archAdd(A, y) {
    const log = [],
      keep = [];
    let marked = false;
    A.forEach((a) => {
      if (dom(y, a)) return log.push("rm");
      keep.push(a);
      if (dom(a, y)) marked = true;
      log.push(dom(a, y) ? "beats" : "tie");
    });
    if (!marked) keep.push(y);
    return { A: keep, log, added: !marked };
  }
  function pruneCrowd(P, cap) {
    let idx = P.map((_, i) => i);
    const out = [];
    while (idx.length > Math.max(cap, 2)) {
      const d = crowd(P, idx);
      const w = idx.reduce((a, b) => (d[b] < d[a] ? b : a));
      out.push([w, d[w]]);
      idx = idx.filter((i) => i !== w);
    }
    return { keep: idx, out };
  }
  function hv(P, r) {
    const Q = P.filter((p) => dom(p, r)).sort((a, b) => a[0] - b[0]);
    let area = 0,
      top = r[1];
    Q.forEach((p) => {
      if (p[1] < top) ((area += (r[0] - p[0]) * (top - p[1])), (top = p[1]));
    });
    return area;
  }
  const contrib = (P, r) =>
    P.map((p, i) =>
      dom(p, r)
        ? hv(P, r) -
          hv(
            P.filter((_, j) => j !== i),
            r,
          )
        : 0,
    );
  function boxes(P, r) {
    const Q = P.map((p, i) => [p, i])
      .filter(([p]) => dom(p, r))
      .sort((x, y) => x[0][0] - y[0][0]);
    return Q.map(([p, i], k) => ({
      i,
      a: p,
      b: [k + 1 < Q.length ? Q[k + 1][0][0] : r[0], k > 0 ? Q[k - 1][0][1] : r[1]],
    }));
  }
  const pts = (t) => {
    const rows = t.split(", ").map((q) => q.split(" "));
    const ids = rows.map((q) => q[0]);
    const P = rows.map((q) => [+q[1], +q[2]]);
    return { ids, P, at: Object.fromEntries(ids.map((k, i) => [k, P[i]])) };
  };
  const front = (S) => S.ids.filter((_, i) => !S.P.some((q) => dom(q, S.P[i])));

  // ---------- the drone MOPSO (l15-02.js), defaults: cap 10, crowding prune, random leader, keep newest ----------
  const evalX = (x) => {
    const g = 1 + x[1] + x[2];
    return [10 * x[0], 5 * g * (1 - Math.sqrt(x[0] / g))];
  };
  const TRUE = Array.from({ length: 41 }, (_, i) => [i / 4, 5 * (1 - Math.sqrt(i / 40))]);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const eqv = (a, b) => a[0] === b[0] && a[1] === b[1];
  function archive(S, x, f) {
    if (S.A.some((a) => dom(a.f, f) || eqv(a.f, f))) return;
    S.A = S.A.filter((a) => !dom(f, a.f));
    S.A.push({ x: x.slice(), f: f.slice() });
    if (S.A.length > S.cap)
      S.A = pruneCrowd(
        S.A.map((a) => a.f),
        S.cap,
      ).keep.map((i) => S.A[i]);
  }
  function mopsoInit(seed) {
    const r = mulberry(seed);
    const S = { r, A: [], cap: 10, n: 10 };
    S.P = Array.from({ length: S.n }, () => {
      const x = [r(), r(), r()],
        f = evalX(x);
      return { x, v: x.map(() => (r() - 0.5) * 0.2), p: x.slice(), pf: f, f };
    });
    S.P.forEach((q) => archive(S, q.x, q.f));
    return S;
  }
  function mopsoStep(S) {
    const r = S.r;
    S.P.forEach((q) => {
      const ld = S.A[Math.floor(r() * S.A.length)];
      q.v = q.v.map((v, j) =>
        clamp(0.5 * v + 1.5 * r() * (q.p[j] - q.x[j]) + 1.5 * r() * (ld.x[j] - q.x[j]), -0.25, 0.25),
      );
      q.x = q.x.map((x, j) => clamp(x + q.v[j], 0, 1));
      q.f = evalX(q.x);
      if (!dom(q.pf, q.f)) ((q.p = q.x.slice()), (q.pf = q.f));
    });
    S.P.forEach((q) => archive(S, q.x, q.f));
  }

  // ---------- the lessons' data ----------
  const SWARM9 = pts("A 1.5 8, B 2.5 5.5, C 4 4.5, D 3 7, E 5.5 3, F 6 6, G 8 1.5, H 7 4, I 9 5");
  const FRONT9 = front(SWARM9);
  const MOVES = [
    [4, 6],
    [6, 7],
    [3.5, 5.5],
    [4.5, 4],
  ];
  const PB = [];
  {
    let o = [5, 5],
      n = [5, 5];
    MOVES.forEach((y) => {
      const mvOld = dom(y, o),
        mvNew = !dom(n, y);
      if (mvOld) o = y;
      if (mvNew) n = y;
      PB.push({ y, old: o, neu: n, mvOld, mvNew });
    });
  }
  const ARCH = pts("a1 1 8, a2 2.5 5, a3 4 4, a4 6 2.5, a5 8.5 1");
  const NEWS = [];
  {
    let A = ARCH.P.map((p, i) => ({ id: ARCH.ids[i], p }));
    [
      [2, 4],
      [5, 4.5],
      [7, 2],
    ].forEach((y, k) => {
      const R = archAdd(
        A.map((a) => a.p),
        y,
      );
      const before = A;
      A = A.filter((_, i) => R.log[i] !== "rm");
      if (R.added) A = A.concat([{ id: `y${k + 1}`, p: y }]);
      NEWS.push({ y, R, before, A });
    });
  }
  const P12 = pts(
    "a 0.5 9.5, b 1.4 7.6, c 1.7 7, d 2 6.5, e 3.6 4.3, f 4 3.9, g 4.4 3.6, h 6 2.6, i 7.6 1.7, j 8 1.5, k 8.4 1.3, l 9.5 0.5",
  );
  const PRUNE = pruneCrowd(P12.P, 6);
  const H = pts("a 1 8, b 2.5 6.5, c 4 4.5, d 6 3, e 7.5 1.5");
  const SW = pts("P 7 7.5, Q 9 4, R 3 3, S 2 9, T 5 5.5, U 4.5 6, V 5.5 5");
  const COUNT = H.P.map((a) => SW.ids.filter((_, j) => dom(a, SW.P[j])));
  const REF = SW.at.P;
  const HVP = contrib(H.P, REF);
  const HVBOX = boxes(H.P, REF);
  const RUN = [];
  {
    const S = mopsoInit(4);
    for (let i = 0; i <= 20; i++) {
      RUN.push({ P: S.P.map((q) => q.f.slice()), A: S.A.map((a) => a.f.slice()) });
      if (i < 20) mopsoStep(S);
    }
  }
  const SHARE = (M) => 2 / 2 ** M;

  // ---------- asserts: every figure the storyboard quotes ----------
  same(FRONT9, ["A", "B", "C", "E", "G"], "the five non-dominated routes");
  same(
    PB.map((s) => s.old.join(",")),
    ["5,5", "5,5", "5,5", "4.5,4"],
    "keep-oldest p best after each move",
  );
  same(
    PB.map((s) => s.neu.join(",")),
    ["4,6", "4,6", "3.5,5.5", "4.5,4"],
    "keep-newest p best after each move",
  );
  same(NEWS[0].R.log, ["tie", "rm", "rm", "tie", "tie"], "(2, 4) removes a2 and a3");
  same([NEWS[0].R.added, NEWS[1].R.added, NEWS[2].R.added], [true, false, true], "who joins");
  same(NEWS[1].R.log, ["tie", "tie", "tie", "beats"], "(5, 4.5) is dominated by (2, 4) only");
  same(
    NEWS[2].A.map((a) => a.id),
    ["a1", "a4", "a5", "y1", "y3"],
    "final archive",
  );
  same(
    PRUNE.out.map(([i]) => P12.ids[i]),
    ["j", "f", "c", "k", "g", "b"],
    "pruning order",
  );
  same(PRUNE.out[0][1].toFixed(2), "0.13", "j's crowding distance");
  same(
    PRUNE.keep.map((i) => P12.ids[i]),
    ["a", "d", "e", "h", "i", "l"],
    "the six kept",
  );
  same(
    COUNT.map((c) => c.length),
    [1, 1, 4, 2, 1],
    "particles each member dominates",
  );
  same(HVP, [0, 1.5, 4, 1.5, 0], "hypervolume contributions for P");
  same(hv(H.P, REF), 12, "P's hypervolume");
  same(
    HVBOX.map((b) => H.ids[b.i]),
    ["b", "c", "d"],
    "members that dominate P",
  );
  same([RUN.length, RUN[0].A.length, RUN[20].A.length], [21, 5, 10], "21 snapshots, archive 5 then 10");
  same(
    RUN.every((s) => s.A.length <= 10),
    true,
    "archive never above the cap",
  );
  same([SHARE(2), SHARE(3), SHARE(4), SHARE(6)], [1 / 2, 1 / 4, 1 / 8, 1 / 32], "comparable share");

  Object.assign(L15, {
    same,
    dom,
    crowd,
    archAdd,
    pruneCrowd,
    hv,
    contrib,
    boxes,
    SWARM9,
    FRONT9,
    MOVES,
    PB,
    ARCH,
    NEWS,
    P12,
    PRUNE,
    H,
    SW,
    COUNT,
    REF,
    HVP,
    HVBOX,
    RUN,
    TRUE,
    SHARE,
  });
})();

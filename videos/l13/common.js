/* Lecture 13 · Multi-objective evolutionary algorithms: pure data and algorithms (VID.l13, short name L13). NO DOM here.
   The app's own kernel (js/content/nic/l13-01.js dom / ranks, l13-02.js crowd / crowdAll) is ported line for line, run ONCE
   when the page loads, and every number the storyboard (videos/_plan/lecture-13.json) quotes is ASSERTED: a wrong figure
   throws a clear Error. Scenes only look values up.

   TOOLS   L13.same(got, want, what) throws unless equal (numbers within 1e-9, arrays element by element, strings ===)
           L13.fmtD(d) -> "∞" or d with 2 decimals ("0.75")
   KERNEL  L13.dom(a, b, s) a dominates b (s[i] = 1 minimise, -1 maximise);  L13.ranks(P, s) -> rank per point (0 = front)
           L13.crowd(P, idx) -> {i: distance} for one front;  L13.crowdAll(P, r) -> distance per point within its rank
   DATA (each a set: {ids, P (points by index), at: {id: [x, y]}, s, r (ranks), d (crowding)})
     L13.WAKE(g) -> {pct, cable}: lesson 13.1's wake toy model, back turbine power % and cable cost £m for a gap of g rotor widths
     L13.FARM   lesson 13.1's 11 wind farm layouts A..K, (cost £m, power MW), cost minimised, power maximised.
                Front A B C D K E (6 of 11). F by B, G by D, H by C, I by A, J by E (L13.FARM.by).
     L13.PEEL   lesson 13.2's 12 points a..l, both minimised: ranks a-e 0, f g h 1, i j k 2, l 3.
     L13.W      lesson 13.2's crowding front P..T: P ∞, Q 0.75, R 1.00, S 1.25, T ∞.
     L13.SURV   the workshop's 12 candidates A..L (both minimised): ranks A B C 0; D E F G 1; H J 2; I K 3; L 4;
                rank 1 crowding D ∞, G ∞, F 1.33, E 1.00.  L13.PARENTS / L13.KIDS = the 6 + 6 split used in scene 8;
                L13.KEEP = the 6 survivors A B C D F G (N = 6, rank first then crowding). */
(function () {
  const V = window.VID;
  const L13 = (V.l13 = V.l13 || {});

  function same(got, want, what) {
    const eq = (a, b) => (typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < 1e-9 || a === b : a === b);
    const ok = Array.isArray(want)
      ? Array.isArray(got) && got.length === want.length && want.every((w, i) => eq(got[i], w))
      : eq(got, want);
    if (!ok) throw new Error(`VID.l13: ${what}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  }
  const fmtD = (v) => (v === Infinity ? "∞" : v.toFixed(2));

  // ---------- the app's kernel (l13-01.js, l13-02.js) ----------
  function dom(a, b, s) {
    let better = false;
    for (let i = 0; i < a.length; i++) {
      const d = (a[i] - b[i]) * s[i];
      if (d > 0) return false;
      if (d < 0) better = true;
    }
    return better;
  }
  function ranks(P, s) {
    const r = P.map(() => -1);
    let left = P.map((_, i) => i),
      k = 0;
    while (left.length) {
      const f = left.filter((i) => !left.some((j) => j !== i && dom(P[j], P[i], s)));
      f.forEach((i) => (r[i] = k));
      left = left.filter((i) => r[i] < 0);
      k++;
    }
    return r;
  }
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
  const crowdAll = (P, r) => {
    const out = P.map(() => 0);
    for (let k = 0; k <= Math.max(...r); k++) {
      const idx = P.map((_, i) => i).filter((i) => r[i] === k);
      const d = crowd(P, idx);
      idx.forEach((i) => (out[i] = d[i]));
    }
    return out;
  };
  const pts = (t) =>
    t
      .split(", ")
      .map((q) => q.split(" "))
      .map(([k, x, y]) => [k, [+x, +y]]);
  function set(text, s) {
    const rows = pts(text);
    const ids = rows.map((q) => q[0]);
    const P = rows.map((q) => q[1]);
    const r = ranks(P, s);
    const d = crowdAll(P, r);
    const at = Object.fromEntries(rows);
    const by = Object.fromEntries(ids.map((k, i) => [k, ids.filter((_, j) => dom(P[j], P[i], s))]));
    const rank = (k) => r[ids.indexOf(k)];
    const dist = (k) => d[ids.indexOf(k)];
    const inRank = (k) => ids.filter((_, i) => r[i] === k);
    return { ids, P, at, s, r, d, by, rank, dist, inRank };
  }
  const WAKE = (g) => ({ pct: Math.round((1 - 0.6 / (1 + 0.3 * g) ** 2) * 100), cable: 1.5 * g });

  // ---------- the lessons' data ----------
  const FARM = set(
    "A 20 30, B 25 42, C 32 55, D 40 62, E 52 70, F 30 38, G 45 58, H 36 48, I 22 26, J 58 69, K 46 64",
    [1, -1],
  );
  const PEEL = set("a 1 9, b 2 6, c 4 4, d 7 2, e 9 1, f 3 8, g 5 6, h 8 4, i 6 8, j 9 6, k 4 9.5, l 8 8", [1, 1]);
  const W = set("P 1 9, Q 2 6, R 3 5, S 6 2, T 9 1", [1, 1]);
  const SURV = set("A 1 8, B 3 4, C 7 1, D 2 9, E 3.5 6.5, F 4 5, G 8 3, H 5 7, I 6 8, J 9 6, K 7 7.5, L 9 9", [1, 1]);
  const PARENTS = ["A", "D", "E", "H", "I", "L"];
  const KIDS = ["B", "C", "F", "G", "J", "K"];
  const N = 6;
  const order = SURV.ids
    .map((_, i) => i)
    .sort((a, b) => SURV.r[a] - SURV.r[b] || SURV.d[b] - SURV.d[a])
    .map((i) => SURV.ids[i]);
  const KEEP = order.slice(0, N);

  // ---------- asserts: every figure the storyboard quotes ----------
  same([WAKE(2).pct, WAKE(2).cable, WAKE(8).pct, WAKE(8).cable], [77, 3, 95, 12], "wake model at gaps 2 and 8");
  const front = (S) => S.ids.filter((_, i) => S.r[i] === 0);
  same(front(FARM), ["A", "B", "C", "D", "E", "K"], "wind farm front");
  same(
    ["F", "G", "H", "I", "J"].map((k) => FARM.by[k].join("")),
    ["B", "D", "C", "A", "E"],
    "wind farm: who dominates F G H I J",
  );
  same(
    [FARM.at.A, FARM.at.E, FARM.at.D, FARM.at.G, FARM.at.K].flat(),
    [20, 30, 52, 70, 40, 62, 45, 58, 46, 64],
    "farm points",
  );
  same(
    [dom(FARM.at.D, FARM.at.G, FARM.s), dom(FARM.at.D, FARM.at.K, FARM.s), dom(FARM.at.K, FARM.at.D, FARM.s)],
    [true, false, false],
    "D vs G, D vs K",
  );
  same(PEEL.r, [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3], "peel ranks a..l");
  same(W.d, [Infinity, 0.75, 1, 1.25, Infinity], "crowding P..T");
  same(SURV.r, [0, 0, 0, 1, 1, 1, 1, 2, 3, 2, 3, 4], "survivor ranks A..L");
  same(
    ["D", "E", "F", "G"].map((k) => SURV.dist(k)),
    [Infinity, 1, 4 / 3, Infinity],
    "rank 1 crowding D E F G",
  );
  same(KEEP.slice().sort(), ["A", "B", "C", "D", "F", "G"], "the 6 survivors");
  same([...PARENTS, ...KIDS].sort(), SURV.ids.slice().sort(), "parents + children = the 12");

  Object.assign(L13, { same, fmtD, dom, ranks, crowd, crowdAll, WAKE, FARM, PEEL, W, SURV, PARENTS, KIDS, N, KEEP });
})();

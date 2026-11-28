/* Lecture 16 · Neural networks: pure data and algorithms (VID.l16, short name L16). NO DOM here.
   The app's own kernel (js/content/nic/l16-01.js fire / GATES / xorNet / flow / net / mae / nse / gaInit / gaStep, with
   mulberry from l13-01.js) is ported line for line, run ONCE when the page loads, and every number the storyboard
   (videos/_plan/lecture-16.json) quotes is ASSERTED: a wrong figure throws a clear Error. Scenes only look values up.

   KERNEL  L16.fire(x, w, th) -> 0 | 1 (fires when the weighted sum reaches th);  L16.GATES {AND, OR, NAND, NOR}: [w, th]
           L16.IN4 the four input pairs 00 01 10 11;  L16.TRUTH[gate] -> four outputs;  L16.xorNet(x) -> {h: [OR, NAND], y}
           L16.sum(x, w) the weighted sum
   STORM   L16.XS (41 times 0..1), L16.T the real flow (peak 1 at time 0.3);  L16.BIG (20 hidden neurons, width 0.06),
           L16.SMALL (10 hidden, width 0.09): {H, cen, pred(w, alive), w0};  L16.mae(P), L16.nse(P)
           L16.BIGP the 20-neuron guess (NSE 0.99);  L16.KOP the guess with neuron 7 switched off (NSE 0.83)
   GA      L16.GA[g] for g = 0..50: {gen, mae, nse, w (best genome, 10 weights), P (its guess)}, seed 1 (the lesson demo):
           MAE 0.407 / NSE -1.95 at 0, 0.157 / 0.59 at 10, 0.072 / 0.92 at 20, 0.023 / 0.99 at 50.
           L16.MUT = {i, from, to}: the weight of the best genome that changed most from generation 0 to 1 (scene 10's close-up)
   OTHER   L16.MUL = {a: 6783, b: 4592, p: 31147536};  L16.STORMS = fifteen storm-bar heights (picture only, no figures) */
(function () {
  const V = window.VID;
  const L16 = (V.l16 = V.l16 || {});

  function same(got, want, what) {
    const eq = (a, b) => (typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < 1e-9 || a === b : a === b);
    const ok = Array.isArray(want)
      ? Array.isArray(got) && got.length === want.length && want.every((w, i) => eq(got[i], w))
      : eq(got, want);
    if (!ok) throw new Error(`VID.l16: ${what}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  }

  // ---------- kernel (l16-01.js) ----------
  const sum = (x, w) => x.reduce((s, xi, i) => s + xi * w[i], 0);
  const fire = (x, w, th) => (sum(x, w) >= th - 1e-9 ? 1 : 0);
  const GATES = { AND: [[1, 1], 1.5], OR: [[1, 1], 0.5], NAND: [[-1, -1], -1.5], NOR: [[-1, -1], -0.5] };
  const IN4 = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ];
  const TRUTH = {
    AND: [0, 0, 0, 1],
    OR: [0, 1, 1, 1],
    NAND: [1, 1, 1, 0],
    NOR: [1, 0, 0, 0],
    XOR: [0, 1, 1, 0],
  };
  const xorNet = (x, h1 = "OR", h2 = "NAND", o = "AND") => {
    const h = [fire(x, ...GATES[h1]), fire(x, ...GATES[h2])];
    return { h, y: fire(h, ...GATES[o]) };
  };
  const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const XS = Array.from({ length: 41 }, (_, i) => i / 40);
  const flow = (x) => {
    const u = x / 0.3;
    return u * u * Math.exp(2 * (1 - u));
  };
  const T = XS.map(flow);
  const TMEAN = T.reduce((a, b) => a + b) / T.length;
  const net = (H, sw) => {
    const cen = Array.from({ length: H }, (_, k) => k / (H - 1));
    const bump = (k, x) => Math.exp(-((x - cen[k]) ** 2) / (2 * sw * sw));
    const k0 = 1 / (H - 1) / (sw * Math.sqrt(2 * Math.PI));
    const pred = (w, alive) => XS.map((x) => w.reduce((s, wk, k) => s + (alive && !alive[k] ? 0 : wk * bump(k, x)), 0));
    return { H, cen, pred, w0: cen.map((c) => flow(c) * k0) };
  };
  const BIG = net(20, 0.06),
    SMALL = net(10, 0.09);
  const mae = (P) => P.reduce((s, p, i) => s + Math.abs(p - T[i]), 0) / P.length;
  const nse = (P) => 1 - P.reduce((s, p, i) => s + (p - T[i]) ** 2, 0) / T.reduce((s, t) => s + (t - TMEAN) ** 2, 0);

  const fitOf = (w) => mae(SMALL.pred(w));
  function gaSort(S) {
    S.P.sort((a, b) => fitOf(a) - fitOf(b));
    S.best = S.P[0];
    S.mae = fitOf(S.best);
    S.nse = nse(SMALL.pred(S.best));
    S.hist.push(S.mae);
  }
  function gaInit(seed) {
    const r = mulberry(seed);
    const P = Array.from({ length: 12 }, () => SMALL.cen.map(() => (r() - 0.5) * 0.4));
    const S = { r, P, gen: 0, hist: [] };
    gaSort(S);
    return S;
  }
  function gaStep(S) {
    const r = S.r,
      P = S.P;
    const gauss = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
    const tour = () => {
      const a = P[(r() * P.length) | 0],
        b = P[(r() * P.length) | 0];
      return fitOf(a) < fitOf(b) ? a : b;
    };
    const nx = [P[0]];
    while (nx.length < P.length) {
      const p1 = tour(),
        p2 = tour();
      const c = p1.map((v, i) => (r() < 0.5 ? v : p2[i]));
      c[(r() * c.length) | 0] += gauss() * 0.15;
      nx.push(c);
    }
    S.P = nx;
    S.gen++;
    gaSort(S);
  }

  // ---------- the video's data ----------
  const BIGP = BIG.pred(BIG.w0);
  const KOP = BIG.pred(
    BIG.w0,
    BIG.cen.map((_, k) => k !== 6),
  );
  const GA = [];
  {
    const S = gaInit(1);
    for (let g = 0; g <= 50; g++) {
      if (g) gaStep(S);
      GA.push({ gen: g, mae: S.mae, nse: S.nse, w: S.best.slice(), P: SMALL.pred(S.best) });
    }
  }
  const MUT = (() => {
    const a = GA[0].w,
      b = GA[1].w;
    let i = 0;
    a.forEach((v, k) => {
      if (Math.abs(b[k] - v) > Math.abs(b[i] - a[i])) i = k;
    });
    return { i, from: a[i], to: b[i] };
  })();
  const MUL = { a: 6783, b: 4592, p: 6783 * 4592 };
  const STORMS = [5, 8, 3, 9, 6, 4, 7, 10, 5, 3, 8, 6, 9, 4, 7];

  // ---------- asserts: every figure the storyboard quotes ----------
  const f2 = (v) => v.toFixed(2),
    f3 = (v) => v.toFixed(3);
  same(MUL.p, 31147536, "6,783 times 4,592");
  ["AND", "OR", "NAND"].forEach((g) =>
    same(
      IN4.map((x) => fire(x, ...GATES[g])),
      TRUTH[g],
      `${g} truth table`,
    ),
  );
  same([sum([1, 1], [1, 1]), sum([1, 1], [-1, -1])], [2, -2], "weighted sums of inputs 1 and 1");
  same(
    IN4.map((x) => xorNet(x).y),
    TRUTH.XOR,
    "OR and NAND into AND make XOR",
  );
  same(
    IN4.map((x) => xorNet(x).h.join("")),
    ["01", "11", "11", "10"],
    "hidden OR / NAND outputs",
  );
  same(
    [BIG.H, SMALL.H, BIG.cen[6] > 0.3 && BIG.cen[6] < 0.33],
    [20, 10, true],
    "network sizes, neuron 7 near the peak",
  );
  same([f2(nse(BIGP)), f2(nse(KOP))], ["0.99", "0.83"], "fit score with 20 and with 19 neurons");
  same([f3(GA[0].mae), f2(GA[0].nse)], ["0.407", "-1.95"], "generation 0");
  same([f3(GA[10].mae), f2(GA[10].nse)], ["0.157", "0.59"], "generation 10");
  same([f3(GA[20].mae), f2(GA[20].nse)], ["0.072", "0.92"], "generation 20");
  same([f3(GA[50].mae), f2(GA[50].nse)], ["0.023", "0.99"], "generation 50");
  same(
    GA.every((s, g) => g === 0 || s.mae <= GA[g - 1].mae + 1e-12),
    true,
    "the best error never rises (elitism)",
  );
  same([STORMS.length, MUT.i >= 0 && MUT.from !== MUT.to], [15, true], "fifteen storms, one weight mutated");

  Object.assign(L16, {
    same,
    sum,
    fire,
    GATES,
    IN4,
    TRUTH,
    xorNet,
    XS,
    T,
    BIG,
    SMALL,
    mae,
    nse,
    BIGP,
    KOP,
    GA,
    MUT,
    MUL,
    STORMS,
  });
})();

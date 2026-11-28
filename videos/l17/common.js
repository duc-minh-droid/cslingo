/* Lecture 17 · Spiking neural networks: pure data and algorithms (VID.l17, short name L17). NO DOM here.
   The app's own kernel (js/content/nic/l17-01.js encode / popCode / lif / propagate / stdp / slope, 20 time steps, threshold
   1) is ported line for line, run ONCE when the page loads, and every number the storyboard (videos/_plan/lecture-17.json)
   quotes is ASSERTED: a wrong figure throws a clear Error. Scenes only look values up. Steps are counted from 1 on screen.

   KERNEL  L17.encode(s, "rate" | "time") -> [bool] x 20;  L17.popCode(s) -> five trains (neurons liking 0, 2.5, 5, 7.5, 10)
           L17.lif(I, leak, th = 1, n = 20) -> {V, S, n};  L17.propagate(A, B, steps = 6) -> [{A, B, A1, A2, B1, B2, O, got}]
           L17.stdp(pre, post) -> {w, log};  L17.slope(a, k) = k s (1 - s) with s the sigmoid of k a (peak k / 4 at a = 0)
           L17.on(train) -> the 1-based steps where a train spikes
   DATA    L17.ARCH: lesson 17.1's sensor raster (whisker 3, light 5, sound 2 spikes) and the neuron's answer (steps 8, 14, 20)
           L17.RATE: dim 2, medium 5, bright 9 (rate code);  L17.TIME: bright at step 4, medium 11, dim 16 (temporal code)
           L17.POP7 = popCode(7): spikes 0, 0, 3, 5, 1
           L17.LIF: fill (0.12, no leak, 8 steps: 0.96, no spike), fire (0.25, no leak: steps 4 8 12 16 20), leak (0.2,
             leak 0.3: levels off near 0.67, no spike)
           L17.PROP: A fires at steps 1 and 3, B at 2 and 3; O receives 0 0 2 2 4 0 and fires at step 5 only
           L17.STDP: pre 2 5 / post 3 6 (w = +2, potentiation) and pre 3 6 / post 2 5 (w = -2, depression), 8 steps
           L17.SURR: k 1, 5, 20 -> peaks 0.25, 1.25, 5; slope at a = 2: 0.10, almost 0, almost 0
           L17.EVO: 30 networks a generation x 100 generations = 3000 tests */
(function () {
  const V = window.VID;
  const L17 = (V.l17 = V.l17 || {});

  function same(got, want, what) {
    const eq = (a, b) => (typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < 1e-9 || a === b : a === b);
    const ok = Array.isArray(want)
      ? Array.isArray(got) && got.length === want.length && want.every((w, i) => eq(got[i], w))
      : eq(got, want);
    if (!ok) throw new Error(`VID.l17: ${what}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  }

  // ---------- kernel (l17-01.js) ----------
  const T = 20;
  function encode(s, code) {
    if (code === "rate")
      return Array.from({ length: T }, (_, t) => Math.floor(((t + 1) * s) / T) > Math.floor((t * s) / T));
    const first = s > 0 ? T - 1 - Math.round((s / 10) * (T - 2)) : -1;
    return Array.from({ length: T }, (_, t) => t === first);
  }
  const POP = [0, 2.5, 5, 7.5, 10];
  const popCode = (s) => POP.map((c) => encode(Math.max(0, Math.round(6 - 1.6 * Math.abs(s - c))), "rate"));
  function lif(I, leak, th = 1, n = T) {
    let v = 0;
    const Vs = [],
      S = [];
    for (let t = 0; t < n; t++) {
      v = +(v * (1 - leak) + I).toFixed(6);
      const f = v >= th;
      Vs.push(Math.min(v, th));
      S.push(f);
      if (f) v = 0;
    }
    return { V: Vs, S, n: S.filter(Boolean).length };
  }
  function propagate(A, B, steps = 6) {
    const on = (arr, t) => !!arr[t];
    const out = [];
    for (let t = 0; t < steps; t++) {
      const hA = t > 0 && on(A, t - 1),
        hB = t > 0 && on(B, t - 1);
      const prevA = t > 1 && on(A, t - 2),
        prevB = t > 1 && on(B, t - 2);
      const o = 2 * prevA + 2 * prevB >= 3;
      out.push({ A: on(A, t), B: on(B, t), A1: hA, A2: hA, B1: hB, B2: hB, O: o, got: 2 * prevA + 2 * prevB });
    }
    return out;
  }
  function stdp(pre, post) {
    let w = 0;
    const log = pre.map(() => 0);
    for (let t = 1; t < pre.length; t++) {
      if (post[t] && pre[t - 1]) ((w += 1), (log[t] += 1));
      if (pre[t] && post[t - 1]) ((w -= 1), (log[t] -= 1));
    }
    return { w, log };
  }
  const sig = (a, k) => 1 / (1 + Math.exp(-k * a));
  const slope = (a, k) => k * sig(a, k) * (1 - sig(a, k));
  const on = (train) => train.map((f, i) => (f ? i + 1 : 0)).filter(Boolean);
  const train = (n, steps) => Array.from({ length: n }, (_, i) => steps.includes(i + 1));

  // ---------- the lessons' data ----------
  const ARCH_IN = [3, 5, 2].map((s) => encode(s, "rate"));
  let v = 0;
  const ARCH_OUT = ARCH_IN[0].map((_, t) => {
    v = v * 0.9 + 0.5 * ARCH_IN.reduce((a, r) => a + r[t], 0);
    const f = v >= 1;
    if (f) v = 0;
    return f;
  });
  const ARCH = { ins: ARCH_IN, out: ARCH_OUT, labs: ["whisker", "light", "sound"] };
  const RATE = [2, 5, 9].map((s) => encode(s, "rate"));
  const TIME = [9, 5, 2].map((s) => encode(s, "time"));
  const POP7 = popCode(7);
  const LIF = { fill: lif(0.12, 0, 1, 8), fire: lif(0.25, 0), leak: lif(0.2, 0.3) };
  const PROP = propagate([1, 0, 1, 0, 0, 0], [0, 1, 1, 0, 0, 0]);
  const STDP = {
    plus: { pre: train(8, [2, 5]), post: train(8, [3, 6]) },
    minus: { pre: train(8, [3, 6]), post: train(8, [2, 5]) },
  };
  STDP.plus.R = stdp(STDP.plus.pre, STDP.plus.post);
  STDP.minus.R = stdp(STDP.minus.pre, STDP.minus.post);
  const KS = [1, 5, 20];
  const SURR = KS.map((k) => ({ k, peak: slope(0, k), at2: slope(2, k) }));
  const EVO = { pop: 30, gens: 100, tests: 30 * 100 };

  // ---------- asserts: every figure the storyboard quotes ----------
  same(
    ARCH.ins.map((r) => on(r).length),
    [3, 5, 2],
    "sensor spikes",
  );
  same(on(ARCH.out), [8, 14, 20], "the neuron's own spikes");
  same(
    RATE.map((r) => on(r).length),
    [2, 5, 9],
    "rate code: dim, medium, bright",
  );
  for (let s = 0; s <= 10; s++) same(on(encode(s, "rate")).length, s, `rate code: strength ${s}`);
  same(
    TIME.map((r) => on(r).join()),
    ["4", "11", "16"],
    "temporal code: first spike steps",
  );
  same(
    POP7.map((r) => on(r).length),
    [0, 0, 3, 5, 1],
    "population code of 7",
  );
  same([LIF.fill.n, LIF.fill.V[7]], [0, 0.96], "0.12 a step for 8 steps reaches 0.96");
  same(on(LIF.fire.S), [4, 8, 12, 16, 20], "0.25 a step fires every fourth step");
  same(
    [LIF.leak.n, LIF.leak.V[19].toFixed(2), (0.2 / 0.3).toFixed(2)],
    [0, "0.67", "0.67"],
    "leak levels off near 0.67",
  );
  same(
    PROP.map((s) => s.got),
    [0, 0, 2, 2, 4, 0],
    "spikes O receives",
  );
  same(
    PROP.map((s) => s.O),
    [false, false, false, false, true, false],
    "O fires at step 5 only",
  );
  same(
    PROP.slice(0, 5).map((s) => ["A", "B", "A1", "B1"].filter((k) => s[k]).join("")),
    ["A", "BA1", "ABB1", "A1B1", ""],
    "who fires at steps 1 to 5",
  );
  same([STDP.plus.R.w, STDP.minus.R.w], [2, -2], "STDP weights");
  same(
    SURR.map((s) => s.peak),
    [0.25, 1.25, 5],
    "surrogate peaks",
  );
  same([SURR[0].at2.toFixed(2), SURR[1].at2 < 0.01, SURR[2].at2 < 0.01], ["0.10", true, true], "slope at a = 2");
  same(EVO.tests, 3000, "evolution cost");

  Object.assign(L17, {
    same,
    T,
    encode,
    popCode,
    lif,
    propagate,
    stdp,
    sig,
    slope,
    on,
    ARCH,
    RATE,
    TIME,
    POP,
    POP7,
    LIF,
    PROP,
    STDP,
    SURR,
    EVO,
  });
})();

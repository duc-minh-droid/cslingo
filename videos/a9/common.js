/* Phase 9 · Fourier Transform & FFT: the data and algorithms every scene of this video shares (pure, no DOM, no randomness).
   Everything hangs off VID.a9; scenes start with  const A9 = VID.a9;  Drawing helpers are in common-2.js (the plot panel),
   common-3.js (tags, tiles, numbers, icons) and common-4.js (the spin wheel, the DFT table, the FFT network). Every number below
   comes from running the real algorithm when the page loads and is asserted against the storyboard (videos/_plan/algo-9.json):
   a wrong number throws an Error with a clear message.

   BASICS.  A9.TAU = 2 PI.   A9.same(what, got, want) / A9.close(what, got, want, tol) / A9.closeAll(what, gotArray, wantArray, tol)
   throw when a number differs from the storyboard.   A9.dft(re, im?) -> {re, im} (the direct O(N^2) transform, forward),
   A9.idft(re, im) -> {re, im} (inverse, with the 1/N),  A9.mags(d) -> |X[k]| for every k,  A9.fold(f, fs) -> where a tone of
   frequency f lands when sampled fs times a second (A9.fold(7, 8) = 1).   A9.hann(n, N) = 0.5 - 0.5 cos(2 PI n / (N - 1)) (the lesson's Hann window).
   A9.commas(1048576) -> "1,048,576".

   1. TWO DESCRIPTIONS (scene 2).  The lesson 9.3 mixer's defaults: a 5 Hz sine of strength 1 plus a 12 Hz sine of strength 0.5,
      looked at for one second (100 samples at 100 Hz, so the bars are exactly 1 Hz apart).
        A9.MIX = {fs: 100, n: 100, waves: [{f: 5, a: 1}, {f: 12, a: 0.5}],
                  wave(i, t) -> a_i sin(2 PI f_i t),  at(t) -> the sum (the signal, range about +-1.4),
                  bars: [{f: 5, a: 1}, {f: 12, a: 0.5}]  (the recipe: asserted from the real DFT of the 100 samples)}
   2. FOURIER'S IDEA (scene 3).  The square wave from odd sines: (4 / PI) (sin x + sin 3x / 3 + sin 5x / 5 + ...).
        A9.SQ.freq(j) = 2 j - 1 (the j-th wave, j = 1, 2, ...: 1, 3, 5, ...)   A9.SQ.amp(j) = 4 / (PI (2 j - 1))   A9.SQ.rel(j) = 1 / (2 j - 1)
        A9.SQ.target(x) -> +1 / -1 (the square wave, period 2 PI)
        A9.SQ.sum(x, w) -> sum over j of w(j) amp(j) sin(freq(j) x); w(j) is a function j -> 0..1 (how much of wave j is in: fade a new
            wave in with w(j) going 0 -> 1) or an array of weights.   A9.SQ.top = 4 / PI (the height of the first wave alone)
   3. THE SPINNING ARROW (scene 4) and THE TABLE (scene 5).  Eight samples of one cosine cycle, N = 8.
        A9.W8 = {n: 8, x: [1, .7071, 0, -.7071, -1, -.7071, 0, .7071] (cos(2 PI n / 8)), bars: [0, 4, 0, 0, 0, 0, 0, 4] (|X[k]|)}
        A9.chain(k) -> test the samples with an arrow that turns k times per window. For each sample n the arrow turns by
            theta = 2 PI k n / 8 (clockwise, so its angle is -theta) and is scaled by the sample: v_n = x_n (cos theta, -sin theta).
            {k, arrows: [{n, x, theta, vx, vy, from: [x, y], to: [x, y]}] x8 (tip to tail: arrow n starts where arrow n-1 ended),
             pts: [[0, 0], to_0, ..., to_7] (the 9 corners of the chain), sum: [sx, sy] (where the chain ends), len: its length}
          k = 1 (a match): the chain zig-zags along the x axis and ends at (4, 0), length 4:
             pts (0,0) (1,0) (1.5,-.5) (1.5,-.5) (2,0) (3,0) (3.5,-.5) (3.5,-.5) (4,0)   (samples 2 and 6 are 0: arrows of length 0)
          k = 2 (a mismatch): a rectangle 1 wide and 1.414 tall that closes up: ends at (0, 0), length 0:
             pts (0,0) (1,0) (1,-.707) (1,-.707) (1,-1.414) (0,-1.414) (0,-.707) (0,-.707) (0,0)
        A9.W8.all = [A9.chain(0) ... A9.chain(7)] (every spin count); their lengths are A9.W8.bars.
        A9.W8.ang(k, n) = (k n) mod 8: the arrow of row k, column n of the DFT table points at -2 PI ang / 8 (the 64 entries of scene 5).
        A9.W8.products = 64 (8 bars times 8 samples)
   4. ALIASING (scene 6).  A 7 Hz cosine sampled 8 times a second (window: one second).
        A9.ALIAS = {f: 7, fs: 8, fold: 1, n: 8, twin: 1, wave(t) = cos(2 PI 7 t), twinWave(t) = cos(2 PI 1 t), nyquist: 4,
                    dots(fs) -> [{n, t: n / fs, y: wave(t)}] (fs samples in the second),
                    fix: {fs: 16, nyquist: 8, fold: 7}  (sampled 16 times a second the dots follow the true wave and the bar stays at 7 Hz)}
        The 8 dots lie exactly on BOTH curves: asserted (cos(2 PI 7 n / 8) = cos(2 PI n / 8)). Use cosines: with sines the twin is upside down.
   5. LEAKAGE (scene 7).  A window of N = 64 samples; a cosine of 8 whole cycles lands in one bar; 8.5 cycles leaks.
        A9.LEAK = {n: 64, whole: 8, half: 8.5, hann(n) (n = 0..63), bins: 33 (bars 0..32),
                   sig(f, u, g) -> the signal at u in 0..1 across the window: cos(2 PI f u) times (1 - g + g hann(u)) (g = how much window)
                   spec(f, g) -> [33 numbers]: the bar heights (2 |X[k]| / N, so a whole cycle has height 1) of the 64 samples of sig(f, n / 64, g),
                   seam(f) -> [end value, start value]: the jump where one window ends and a copy begins}
        asserted: whole -> bar 8 = 1 and all others 0;  half (g 0) -> bars 8, 9 = 0.622, 0.651 and bar 2 = 0.037, bar 5 = 0.077, bar 12 = 0.105;
        half with the Hann window (g 1) -> bars 8, 9 = 0.42, 0.42, bars 7, 10 = 0.09 and every bar 4 or more away from 8.5 is below 0.013;
        seam(8) = [1, 1] (no jump), seam(8.5) = [-1, 1] (a jump of 2)
   6. EDITING (scene 8).  128 samples: a slow wave on bar 3 (strength 1) plus a hum on bar 15 (strength 0.4); the mirror bars are N - k.
        A9.HUM = {n: 128, slow: 3, hum: 15, mirror: 113 (= 128 - 15), a: [1, 0.4],
                  at(t, g) -> sin(2 PI 3 t) + g 0.4 sin(2 PI 15 t) (g = how much hum is left, t in 0..1),
                  bars: [{k, h}] the four spikes in order of k: bar 3, 15, 113, 125 with h = 1, 0.4, 0.4, 1 (relative to the tallest; every other bar is 0)}
        asserted from the real DFT: |X[3]| = |X[125]| = 64, |X[15]| = |X[113]| = 25.6 (= 64 x 0.4), all other bars zero; deleting bars 15 and 113 and
        going back (inverse DFT) gives the pure slow wave (largest error < 1e-9); deleting only bar 15 leaves an imaginary part (the signal is no longer real).
   7. THE FFT (scenes 9 and 10).  The same 8 samples as in 3 (A9.W8.x), split in halves.
        A9.FFT = {n: 8, natural: [0..7], evenOdd: [0, 2, 4, 6, 1, 3, 5, 7] (evens on top, odds below: after ONE split),
                  order: [0, 4, 2, 6, 1, 5, 3, 7] (after splitting right down to single samples: the row of each leaf),
                  levels: [[{a, b, k, w: [re, im]} x4] x3]  the 12 butterflies: level L (0, 1, 2) works on rows (a, b) (rows are positions
                      top to bottom 0..7) with the turn W_{2^(L+1)}^k, w = [cos, sin] of -2 PI k / 2^(L+1); out_a = in_a + w in_b, out_b = in_a - w in_b,
                  cols: [[{re, im} x8] x4]  the numbers in each column of the network (col 0 = the 8 leaves in `order`, col 3 = the answer),
                  out: [{re, im}] x8 (= the direct DFT of A9.W8.x),  bars: |X[k]| = A9.W8.bars,
                  butterflies: 12, products: 64 (the direct DFT), half: 16 (one 4-point DFT: 4 x 4), split: 2 x 16 = 32 products plus 4 butterflies}
        asserted: col 2 holds E (rows 0-3 = the 4-point DFT of the even samples x0 x2 x4 x6) and O (rows 4-7 = that of x1 x3 x5 x7); the last level
        gives X[k] = E[k] + W^k O[k] and X[k + 4] = E[k] - W^k O[k]; the whole network equals the direct DFT; 3 levels x 4 butterflies = 12.
        A9.FFT.rows(order) -> the row (0..7) of every sample for an arrangement: A9.FFT.rows(A9.FFT.evenOdd) = [0, 4, 1, 5, 2, 6, 3, 7].
   8. THE PAYOFF (scene 10).  1,048,576 samples (2^20) at a billion multiplications a second (lesson 9.2's table).
        A9.COST = {n: 1048576, direct: n^2 = 1,099,511,627,776, fft: n log2 n = 20,971,520, directMin: 18.3, fftSec: 0.021,
                   ratio: about 52,429}   (the bars: "18 minutes" against "0.02 seconds").

   SMALL TOOLS.  A9.rng(seed) -> () => 0..1 (mulberry32, seeded: the only randomness allowed). */
(function () {
  const V = window.VID;
  const A9 = (V.a9 = V.a9 || {});
  const TAU = Math.PI * 2;

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.a9: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.001) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.a9: ${what} is ${got}, the storyboard says ${want}`);
  };
  const closeAll = (what, got, want, tol = 0.001) => {
    if (got.length !== want.length)
      throw new Error(`VID.a9: ${what} has ${got.length} values, the storyboard says ${want.length}`);
    got.forEach((g, i) => close(`${what}[${i}]`, g, want[i], tol));
  };
  const rng = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const commas = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // ---------- the transforms (the real thing, used to check every number) ----------
  const dft = (xr, xi = xr.map(() => 0), inv = false) => {
    const n = xr.length;
    const re = new Array(n).fill(0);
    const im = new Array(n).fill(0);
    for (let k = 0; k < n; k++)
      for (let t = 0; t < n; t++) {
        const a = ((inv ? TAU : -TAU) * ((k * t) % n)) / n;
        const [c, s] = [Math.cos(a), Math.sin(a)];
        re[k] += xr[t] * c - xi[t] * s;
        im[k] += xr[t] * s + xi[t] * c;
      }
    return inv ? { re: re.map((v) => v / n), im: im.map((v) => v / n) } : { re, im };
  };
  const idft = (re, im) => dft(re, im, true);
  const mags = (d) => d.re.map((r, k) => Math.hypot(r, d.im[k]));
  const fold = (f, fs) => {
    const m = f % fs;
    return m > fs / 2 ? fs - m : m;
  };
  const hann = (n, N) => 0.5 - 0.5 * Math.cos((TAU * n) / (N - 1));
  const sampled = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));
  Object.assign(A9, { TAU, same, close, closeAll, rng, commas, dft, idft, mags, fold, hann });

  // ---------- 1. two descriptions ----------
  const MIX = {
    fs: 100,
    n: 100,
    waves: [
      { f: 5, a: 1 },
      { f: 12, a: 0.5 },
    ],
  };
  MIX.wave = (i, t) => MIX.waves[i].a * Math.sin(TAU * MIX.waves[i].f * t);
  MIX.at = (t) => MIX.wave(0, t) + MIX.wave(1, t);
  {
    const m = mags(dft(sampled(MIX.n, (i) => MIX.at(i / MIX.fs))));
    const amp = m.slice(0, 50).map((v) => (2 * v) / MIX.n);
    amp.forEach((a, k) => {
      const want = MIX.waves.find((w) => w.f === k);
      close(`mix: the recipe at ${k} Hz`, a, want ? want.a : 0, 1e-9);
    });
  }
  MIX.bars = MIX.waves.map((w) => ({ f: w.f, a: w.a }));
  A9.MIX = MIX;

  // ---------- 2. Fourier's idea: the square wave ----------
  const SQ = {
    freq: (j) => 2 * j - 1,
    amp: (j) => 4 / (Math.PI * (2 * j - 1)),
    rel: (j) => 1 / (2 * j - 1),
    target: (x) => (Math.sin(x) >= 0 ? 1 : -1),
    top: 4 / Math.PI,
  };
  SQ.sum = (x, w, terms = 12) => {
    let s = 0;
    for (let j = 1; j <= terms; j++) {
      const wj = typeof w === "function" ? w(j) : w ? (w[j - 1] ?? 0) : 1;
      if (wj) s += wj * SQ.amp(j) * Math.sin(SQ.freq(j) * x);
    }
    return s;
  };
  close(
    "square: the first wave alone peaks at 4/pi",
    SQ.sum(Math.PI / 2, (j) => (j === 1 ? 1 : 0)),
    1.2732,
    1e-4,
  );
  close(
    "square: 400 waves reach the target",
    SQ.sum(Math.PI / 2, () => 1, 400),
    1,
    0.003,
  );
  close("square: wave 3 is a third of wave 1", SQ.amp(2) / SQ.amp(1), 1 / 3, 1e-12);
  close("square: wave 5 is a fifth of wave 1", SQ.amp(3) / SQ.amp(1), 1 / 5, 1e-12);
  same("square: the first five frequencies", [1, 2, 3, 4, 5].map(SQ.freq), [1, 3, 5, 7, 9]);
  A9.SQ = SQ;

  // ---------- 3. the spinning arrow (eight samples, one cosine cycle) ----------
  const W8 = { n: 8, x: sampled(8, (i) => Math.cos((TAU * i) / 8)), products: 64 };
  const chain = (k) => {
    let p = [0, 0];
    const arrows = W8.x.map((x, n) => {
      const theta = (TAU * k * n) / 8;
      const [vx, vy] = [x * Math.cos(theta), -x * Math.sin(theta)];
      const from = p;
      p = [from[0] + vx, from[1] + vy];
      return { n, x, theta, vx, vy, from, to: p };
    });
    return { k, arrows, pts: [[0, 0], ...arrows.map((a) => a.to)], sum: p, len: Math.hypot(p[0], p[1]) };
  };
  W8.all = sampled(8, chain);
  W8.bars = W8.all.map((c) => Math.round(c.len * 1e9) / 1e9);
  W8.ang = (k, n) => (k * n) % 8;
  closeAll("W8: the eight samples", W8.x, [1, 0.7071, 0, -0.7071, -1, -0.7071, 0, 0.7071], 1e-4);
  closeAll("W8: one cycle of cosine gives bars 0 4 0 0 0 0 0 4", W8.bars, [0, 4, 0, 0, 0, 0, 0, 4], 1e-9);
  {
    const d = dft(W8.x);
    closeAll("W8: the chain lengths are the real DFT", mags(d), W8.bars, 1e-9);
    d.re.forEach((r, k) => close(`W8: chain ${k} ends at the real part of X[${k}]`, W8.all[k].sum[0], r, 1e-9));
    d.im.forEach((r, k) => close(`W8: chain ${k} ends at the imaginary part of X[${k}]`, W8.all[k].sum[1], r, 1e-9));
  }
  const s2 = Math.SQRT1_2;
  closeAll(
    "chain 1 (the match): corner x",
    chain(1).pts.map((q) => q[0]),
    [0, 1, 1 + s2 * s2, 1 + s2 * s2, 2, 3, 3 + s2 * s2, 3 + s2 * s2, 4],
    1e-9,
  );
  closeAll(
    "chain 1 (the match): corner y",
    chain(1).pts.map((q) => q[1]),
    [0, 0, -0.5, -0.5, 0, 0, -0.5, -0.5, 0],
    1e-9,
  );
  closeAll(
    "chain 2 (a mismatch): corner x",
    chain(2).pts.map((q) => q[0]),
    [0, 1, 1, 1, 1, 0, 0, 0, 0],
    1e-9,
  );
  closeAll(
    "chain 2 (a mismatch): corner y",
    chain(2).pts.map((q) => q[1]),
    [0, 0, -s2, -s2, -2 * s2, -2 * s2, -s2, -s2, 0],
    1e-9,
  );
  same("W8: the table has 8 x 8 entries", W8.n * W8.n, W8.products);
  same("W8: ang(3, 5)", W8.ang(3, 5), 7);
  A9.W8 = W8;
  A9.chain = chain;

  // ---------- 4. aliasing ----------
  const ALIAS = {
    f: 7,
    fs: 8,
    fold: fold(7, 8),
    n: 8,
    twin: 1,
    nyquist: 4,
    fix: { fs: 16, nyquist: 8, fold: fold(7, 16) },
  };
  ALIAS.wave = (t) => Math.cos(TAU * ALIAS.f * t);
  ALIAS.twinWave = (t) => Math.cos(TAU * ALIAS.twin * t);
  ALIAS.dots = (fs) => sampled(fs, (n) => ({ n, t: n / fs, y: ALIAS.wave(n / fs) }));
  same("alias: 7 Hz sampled 8 times a second lands on", [ALIAS.fold, ALIAS.fix.fold], [1, 7]);
  ALIAS.dots(8).forEach((d) => close(`alias: dot ${d.n} lies on the 1 Hz twin too`, d.y, ALIAS.twinWave(d.t), 1e-9));
  close(
    "alias: the dots really are not on a 7 Hz curve of the other sign",
    Math.abs(ALIAS.dots(8)[1].y),
    Math.SQRT1_2,
    1e-9,
  );
  A9.ALIAS = ALIAS;

  // ---------- 5. leakage ----------
  const LEAK = { n: 64, whole: 8, half: 8.5, bins: 33 };
  LEAK.hann = (n) => hann(n, LEAK.n);
  LEAK.sig = (f, u, g = 0) => Math.cos(TAU * f * u) * (1 - g + g * (0.5 - 0.5 * Math.cos(TAU * u)));
  LEAK.spec = (f, g = 0) => {
    const x = sampled(LEAK.n, (i) => Math.cos((TAU * f * i) / LEAK.n) * (1 - g + g * LEAK.hann(i)));
    return mags(dft(x))
      .slice(0, LEAK.bins)
      .map((v) => (2 * v) / LEAK.n);
  };
  LEAK.seam = (f) => [Math.cos(TAU * f), Math.cos(0)].map((v) => Math.round(v * 1e9) / 1e9);
  {
    const whole = LEAK.spec(8);
    whole.forEach((v, k) => close(`leak: a whole cycle puts bar ${k} at`, v, k === 8 ? 1 : 0, 1e-9));
    const half = LEAK.spec(8.5);
    closeAll("leak: 8.5 cycles, bars 8 and 9", [half[8], half[9]], [0.622, 0.651], 0.002);
    closeAll(
      "leak: 8.5 cycles, bars 2, 5 and 12 (the skirt)",
      [half[2], half[5], half[12]],
      [0.037, 0.077, 0.105],
      0.002,
    );
    const hn = LEAK.spec(8.5, 1);
    closeAll("leak: Hann, bars 7 to 10", hn.slice(7, 11), [0.09, 0.42, 0.42, 0.09], 0.005);
    hn.forEach((v, k) => {
      if (Math.abs(k - 8.5) >= 4 && v > 0.013)
        throw new Error(`VID.a9: leak with the Hann window: bar ${k} is ${v}, the storyboard says below 0.013`);
    });
    same(
      "leak: the seam jump",
      [LEAK.seam(8), LEAK.seam(8.5)],
      [
        [1, 1],
        [-1, 1],
      ],
    );
  }
  A9.LEAK = LEAK;

  // ---------- 6. editing in frequency ----------
  const HUM = { n: 128, slow: 3, hum: 15, mirror: 113, a: [1, 0.4] };
  HUM.at = (t, g = 1) => HUM.a[0] * Math.sin(TAU * HUM.slow * t) + g * HUM.a[1] * Math.sin(TAU * HUM.hum * t);
  HUM.bars = [HUM.slow, HUM.hum, HUM.n - HUM.hum, HUM.n - HUM.slow].map((k) => ({
    k,
    h: { 3: 1, 15: 0.4, 113: 0.4, 125: 1 }[k],
  }));
  {
    const x = sampled(HUM.n, (i) => HUM.at(i / HUM.n));
    const d = dft(x);
    const m = mags(d);
    m.forEach((v, k) => {
      const want = { 3: 64, 125: 64, 15: 25.6, 113: 25.6 }[k] ?? 0;
      close(`hum: the real DFT has |X[${k}]|`, v, want, 1e-9);
    });
    const edit = (drop) => {
      const re = d.re.map((v, k) => (drop.includes(k) ? 0 : v));
      const im = d.im.map((v, k) => (drop.includes(k) ? 0 : v));
      return idft(re, im);
    };
    const clean = edit([15, 113]);
    close(
      "hum: deleting bars 15 and 113 leaves the slow wave (largest error)",
      Math.max(...clean.re.map((v, i) => Math.abs(v - HUM.at(i / HUM.n, 0)))),
      0,
      1e-9,
    );
    close("hum: and nothing imaginary", Math.max(...clean.im.map(Math.abs)), 0, 1e-9);
    const half = edit([15]);
    if (!(Math.max(...half.im.map(Math.abs)) > 0.05))
      throw new Error("VID.a9: hum: deleting only bar 15 should leave an imaginary part");
  }
  same("hum: the mirror of 15", HUM.n - HUM.hum, HUM.mirror);
  same("hum: the four spikes", HUM.bars, [
    { k: 3, h: 1 },
    { k: 15, h: 0.4 },
    { k: 113, h: 0.4 },
    { k: 125, h: 1 },
  ]);
  A9.HUM = HUM;

  // ---------- 7. the FFT ----------
  const cadd = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
  const csub = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
  const cmul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
  const natural = [0, 1, 2, 3, 4, 5, 6, 7];
  const evenOdd = [0, 2, 4, 6, 1, 3, 5, 7];
  const order = [0, 4, 2, 6, 1, 5, 3, 7];
  const FFT = { n: 8, natural, evenOdd, order, butterflies: 12, products: 64, half: 16 };
  FFT.rows = (arr) => natural.map((i) => arr.indexOf(i));
  FFT.levels = [];
  FFT.cols = [order.map((i) => ({ re: W8.x[i], im: 0 }))];
  for (let L = 0; L < 3; L++) {
    const size = 2 ** (L + 1);
    const prev = FFT.cols[L];
    const next = prev.slice();
    const fl = [];
    for (let i = 0; i < 8; i += size)
      for (let k = 0; k < size / 2; k++) {
        const [a, b] = [i + k, i + k + size / 2];
        const w = { re: Math.cos((-TAU * k) / size), im: Math.sin((-TAU * k) / size) };
        const t = cmul(w, prev[b]);
        next[a] = cadd(prev[a], t);
        next[b] = csub(prev[a], t);
        fl.push({ a, b, k, w: [w.re, w.im] });
      }
    FFT.levels.push(fl);
    FFT.cols.push(next);
  }
  FFT.out = FFT.cols[3];
  FFT.bars = FFT.out.map((c) => Math.round(Math.hypot(c.re, c.im) * 1e9) / 1e9);
  {
    const d = dft(W8.x);
    FFT.out.forEach((c, k) => {
      close(`fft: X[${k}] real part equals the direct DFT`, c.re, d.re[k], 1e-9);
      close(`fft: X[${k}] imaginary part equals the direct DFT`, c.im, d.im[k], 1e-9);
    });
    closeAll("fft: the answer is the same 8 bars as the direct DFT", FFT.bars, W8.bars, 1e-9);
    const e = dft([0, 2, 4, 6].map((i) => W8.x[i]));
    const o = dft([1, 3, 5, 7].map((i) => W8.x[i]));
    [0, 1, 2, 3].forEach((r) => {
      close(`fft: row ${r} holds E[${r}] (re)`, FFT.cols[2][r].re, e.re[r], 1e-9);
      close(`fft: row ${r} holds E[${r}] (im)`, FFT.cols[2][r].im, e.im[r], 1e-9);
      close(`fft: row ${r + 4} holds O[${r}] (re)`, FFT.cols[2][r + 4].re, o.re[r], 1e-9);
      close(`fft: row ${r + 4} holds O[${r}] (im)`, FFT.cols[2][r + 4].im, o.im[r], 1e-9);
    });
  }
  same(
    "fft: butterflies per level",
    FFT.levels.map((l) => l.length),
    [4, 4, 4],
  );
  same("fft: butterflies in all", FFT.levels.flat().length, FFT.butterflies);
  same(
    "fft: level 3 pairs rows",
    FFT.levels[2].map((b) => [b.a, b.b]),
    [
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ],
  );
  same(
    "fft: level 2 pairs rows",
    FFT.levels[1].map((b) => [b.a, b.b]),
    [
      [0, 2],
      [1, 3],
      [4, 6],
      [5, 7],
    ],
  );
  same(
    "fft: level 1 pairs rows",
    FFT.levels[0].map((b) => [b.a, b.b]),
    [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
    ],
  );
  same(
    "fft: twiddle numbers k at level 3",
    FFT.levels[2].map((b) => b.k),
    [0, 1, 2, 3],
  );
  same("fft: rows of the even-odd split", FFT.rows(evenOdd), [0, 4, 1, 5, 2, 6, 3, 7]);
  same("fft: rows of the full split", FFT.rows(order), [0, 4, 2, 6, 1, 5, 3, 7]);
  same("fft: one 4-point DFT costs 4 x 4", 4 * 4, FFT.half);
  FFT.split = { products: 2 * FFT.half, butterflies: 4 };
  same("fft: one split = 32 products + 4 butterflies", [FFT.split.products, FFT.split.butterflies], [32, 4]);
  A9.FFT = FFT;

  // ---------- 8. the payoff ----------
  const n = 1048576;
  const COST = { n, direct: n * n, fft: n * Math.log2(n) };
  COST.directMin = COST.direct / 1e9 / 60;
  COST.fftSec = COST.fft / 1e9;
  COST.ratio = COST.direct / COST.fft;
  same("cost: 2^20 samples", [COST.n, Math.log2(COST.n)], [1048576, 20]);
  same("cost: the direct DFT needs", commas(COST.direct), "1,099,511,627,776");
  same("cost: the FFT needs", commas(COST.fft), "20,971,520");
  close("cost: the direct DFT takes about 18 minutes", COST.directMin, 18.3, 0.05);
  close("cost: the FFT takes about 0.02 seconds", COST.fftSec, 0.021, 0.0005);
  close("cost: about 50,000 times less work", COST.ratio, 52429, 1);
  A9.COST = COST;
})();

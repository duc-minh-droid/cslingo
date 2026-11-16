/* Lecture 10 · Concept drift detection (Data Science, COM3021): the data and the runs every scene of this video shares
   (VID.d10, short name D10). PURE: no DOM, no Math.random, no Date. The lessons' own code (js/content/ds/ds-l10-01.js:
   level, world, ddm, epsCut, splits, adwin, eddm; ds-l10-workshop.js: monitor; the rng of ds-l9-01.js) is ported here line
   for line (same seeds, same order of random draws), every run is made ONCE when the page loads, and every number the
   storyboard (videos/_plan/ds-10.json) quotes is ASSERTED below: a wrong figure throws a clear Error. Scenes only look values
   up and draw frame t from these logs; captions are built from them (`${D10.DDM.warn.n}`), never typed by hand.

   THE WORLD (the lessons' error stream): one record = one prediction, x = 1 if it was wrong. The concept level c is 0 (the old
   rule the model learned) or 1 (the new rule); the true error rate is 10% + 40% × |c − model| (so 10% before, 50% after).
   Record i is 0-based in the arrays; "record n" in captions is 1-based (n = i + 1), as in the lessons.

   TOOLS
     D10.rng(seed) -> () => 0..1 (the lessons' generator)
     D10.same(what, got, want)  throws unless equal (numbers within 1e-9, arrays element by element, strings ===)
     D10.close(what, got, want, eps)  numbers (or arrays of numbers) within eps
     D10.fm(v, d = 2) -> string, at most d decimals, a real minus sign (the lessons' fm);  D10.pc(v, d = 0) -> "52%" from 0.52
     D10.world(seed), D10.ddm(), D10.adwin(), D10.eddm(), D10.splits(W), D10.epsCut(n0, n1), D10.level(kind, t, at),
     D10.monitor(seed)  the lessons' detectors (see the source), D10.avg(a), D10.roll(xs, k) -> per record: mean of the last k
                        (null until k records exist)

   THE EXAMPLES (scene numbers of the storyboard)
     D10.PREFS (s2)  Basketly plant-milk clicks by age band: ages ["18–29", "30–44", "45–59", "60+"], w1 [30, 20, 12, 8] (the
                     model's week-1 rates), w52 [54, 46, 36, 28]; now(week) -> the four real rates that week (lesson rounding)
     D10.KINDS (s3)  world(5), 100 calm records, then a drift injected at record index 100, 550 records in all; rows (abrupt,
                     gradual, recurring) = [{kind, xs, cs, truth (per record, %), roll (last 50, %), rate: [pre, after]}]
                     abrupt: 10% -> 50% at once; gradual: ramp over 300 records (100..400); recurring: flips every 150
                     (new 100..249, old 250..399, new 400..549). Errors: abrupt 247, gradual 179, recurring 185 (of 550)
     D10.STALE (s4)  16 weeks, drift in week 6; frozen [10 × 5, 50 × 11] (%); retrain every 4 weeks on the last 4:
                     monthly [10, 10, 10, 10, 10, 50, 50, 50, 20, 20, 20, 20, 10, 10, 10, 10]; shares [0, 0.75, 1, 1] after
                     weeks 4, 8, 12, 16 (the share of the retraining weeks that follow the new rule)
     D10.ROLL  (s5)  world(5), drift at record 100, 260 records: xs; roll[k] for k 10, 40, 150 (%); pre[k] = {lo, hi} before
                     the drift (k 10: 0 .. 30); first[k] = first record at or after the drift reading 30% or more
                     (k 10: 106, k 40: 119, k 150: 174); falseAt = the first record (before the drift) where last-10 hits 30%
     D10.GROW  (s6)  world(5), abrupt drift at record 250, 450 records: xs, win (window size after each record, index i),
                     cuts [{n (record, 1-based), drop, win}]; first cut at record 296 (drops 40: 295 -> 256), low = the
                     smallest window after it {n: 334, win: 125}; win at record 250 = 250
     D10.SPLIT (s7)  the lesson's ADWIN stepper: 80 old records (every 10th wrong, 10%), then new ones 1,0,1,0,1 (60%);
                     frames[end] for end 80..111 = best split {i (older part size), m0, m1, gap, eps, fire}; the first
                     firing end is 111 (older 79 at 8.9%, newer 32 at 62.5%: gap 0.536 ≥ eps 0.520); the cut drops 8 oldest
                     -> window 103; at end 90: gap 0.548 < eps 0.792 (too few new records); eps100 0.36, eps40 0.55
     D10.SPREAD (s8) p = 0.1: rows [{n: 100, e: 10, s: 0.03, ps: 0.13}, {n: 400, e: 40, s: 0.015, ps: 0.115}]
     D10.DDM   (s9)  the lesson's DDM stepper: 120 records with every 10th wrong (record 5, 15, ...), then every other one
                     wrong; hist[n − 1] = {n, e, p, s, ps, w2, w3} (w2 = p_min + 2 s_min, w3 = p_min + 3 s_min, null before
                     record 30); pmin 0.0965 / smin 0.0277 (set at record 114); warn {n: 128, ps 0.154, line 0.152};
                     change {n: 138, ps 0.183, line 0.179}; the new model trains on records 128..138
     D10.GAPS  (s10) EDDM: before [9, 12, 8, 11, 10] -> mean 10, spread 1.41, mean + 2 spread 12.83; after
                     [3, 2, 4, 2, 3, 2, 3] -> mean 2.71, spread 0.70, 4.11; ratio 0.32 (< 0.90 drift; warning below 0.95)
     D10.RACE  (s10) the lesson's race (monitor(5), 200 more records, drift at record 300), records each detector needs:
                     abrupt {A: 33, D: 29, E: 29}, gradual {A: 275, D: 138, E: 108} */
(function () {
  const V = window.VID;
  const D10 = (V.d10 = V.d10 || {});

  // ---------- tools ----------
  const eqv = (a, b) =>
    Array.isArray(a)
      ? Array.isArray(b) && a.length === b.length && a.every((x, i) => eqv(x, b[i]))
      : typeof a === "number" && typeof b === "number"
        ? Math.abs(a - b) < 1e-9
        : a === b;
  D10.same = (what, got, want) => {
    if (!eqv(got, want))
      throw new Error(`VID.d10: ${what}: got ${JSON.stringify(got)}, storyboard says ${JSON.stringify(want)}`);
  };
  const near = (a, b, eps) =>
    Array.isArray(a) ? a.length === b.length && a.every((x, i) => near(x, b[i], eps)) : Math.abs(a - b) <= eps;
  D10.close = (what, got, want, eps) => {
    if (!near(got, want, eps))
      throw new Error(
        `VID.d10: ${what}: got ${JSON.stringify(got)}, storyboard says ${JSON.stringify(want)} (± ${eps})`,
      );
  };
  D10.fm = (v, d = 2) => String(+(+v).toFixed(d)).replace("-", "−");
  D10.pc = (v, d = 0) => `${D10.fm(100 * v, d)}%`;
  const r3 = (v) => +v.toFixed(3);

  // ---------- the lessons' code, ported line for line ----------
  D10.rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const BASE = 0.1,
    GAP = 0.4,
    RAMP = 300,
    HALF = 150;
  Object.assign(D10, { BASE, GAP, RAMP, HALF });
  D10.level = (kind, t, at) => {
    if (t < at) return 0;
    const k = t - at;
    return kind === "gradual" ? Math.min(1, k / RAMP) : kind === "recurring" ? 1 - (Math.floor(k / HALF) % 2) : 1;
  };
  const avg = (D10.avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0));
  D10.world = (seed) => {
    const r = D10.rng(seed);
    const w = { t: 0, at: Infinity, kind: "abrupt", cm: 0, cs: [], xs: [] };
    w.next = () => {
      const c = D10.level(w.kind, w.t, w.at);
      const x = r() < BASE + GAP * Math.abs(c - w.cm) ? 1 : 0;
      (w.t++, w.cs.push(c), w.xs.push(x));
      return { x, c };
    };
    w.inject = (kind) => Object.assign(w, { kind, at: w.t });
    w.retrain = (from) => (w.cm = w.cs.length > from ? avg(w.cs.slice(from)) : w.cm);
    w.rate = (n) => avg(w.xs.slice(-n));
    return w;
  };
  D10.ddm = () => {
    const d = { n: 0, e: 0, p: 0, s: 0, pmin: Infinity, smin: Infinity, state: "stable" };
    d.add = (x) => {
      (d.n++, (d.e += x), (d.p = d.e / d.n));
      d.s = Math.sqrt((d.p * (1 - d.p)) / d.n);
      if (d.n >= 30 && d.p + d.s < d.pmin + d.smin) [d.pmin, d.smin] = [d.p, d.s];
      const v = d.p + d.s;
      d.state = !d.ready()
        ? "stable"
        : v >= d.pmin + 3 * d.smin
          ? "drift"
          : v >= d.pmin + 2 * d.smin
            ? "warning"
            : "stable";
      return d.state;
    };
    d.ready = () => d.n >= 30 && d.smin > 0;
    d.reset = () => Object.assign(d, { n: 0, e: 0, pmin: Infinity, smin: Infinity, state: "stable" });
    return d;
  };
  D10.epsCut = (n0, n1, delta = 0.002) => Math.sqrt(Math.log((4 * (n0 + n1)) / delta) / (2 / (1 / n0 + 1 / n1)));
  D10.splits = (W) => {
    const n = W.length,
      s = [0];
    W.forEach((v) => s.push(s[s.length - 1] + v));
    return Array.from({ length: Math.max(0, n - 9) }, (_, j) => {
      const i = j + 5,
        m0 = s[i] / i,
        m1 = (s[n] - s[i]) / (n - i);
      return { i, m0, m1, gap: Math.abs(m0 - m1), eps: D10.epsCut(i, n - i) };
    });
  };
  D10.adwin = () => {
    const a = { W: [] };
    a.add = (x) => {
      a.W.push(x);
      let dropped = 0;
      while (a.W.length >= 10 && D10.splits(a.W).some((q) => q.gap >= q.eps)) (a.W.shift(), dropped++);
      return dropped;
    };
    return a;
  };
  D10.eddm = () => {
    const e = { t: 0, last: 0, k: 0, mean: 0, m2: 0, max: 0, ratio: 1, state: "stable" };
    e.add = (x) => {
      e.t++;
      if (!x) return e.state;
      const d = e.t - e.last,
        dm = d - e.mean;
      (e.k++, (e.last = e.t), (e.mean += dm / e.k), (e.m2 += dm * (d - e.mean)));
      const v = e.mean + 2 * Math.sqrt(e.m2 / e.k);
      if (e.k < 30) return e.state;
      ((e.max = Math.max(e.max, v)), (e.ratio = v / e.max));
      e.state = e.ratio < 0.9 ? "drift" : e.ratio < 0.95 ? "warning" : "stable";
      return e.state;
    };
    e.reset = () => Object.assign(e, { t: 0, last: 0, k: 0, mean: 0, m2: 0, max: 0, ratio: 1, state: "stable" });
    return e;
  };
  /** The workshop's monitor (ds-l10-workshop.js), without its drawing history: one stream, three detectors. */
  D10.monitor = (seed) => {
    const m = { w: D10.world(seed), A: D10.adwin(), D: D10.ddm(), E: D10.eddm(), ev: [], warnAt: null, prev: "stable" };
    m.one = () => {
      const { x } = m.w.next(),
        t = m.w.t,
        D = m.D;
      const cut = m.A.add(x),
        ds = D.add(x),
        es = m.E.add(x);
      if (cut) m.ev.push({ k: "A", t, n: cut });
      if (ds === "warning" && m.prev !== "warning") (m.ev.push({ k: "W", t }), (m.warnAt = t));
      if (ds === "stable") m.warnAt = null;
      if (ds === "drift") {
        m.ev.push({ k: "D", t, from: m.warnAt || t });
        D.reset();
        m.warnAt = null;
      }
      if (es === "drift") (m.ev.push({ k: "E", t }), m.E.reset());
      m.prev = ds;
    };
    m.run = (n) => {
      for (let i = 0; i < n; i++) m.one();
    };
    m.first = (k) => m.ev.find((e) => e.k === k && e.t > m.w.at);
    m.run(100);
    m.ev = [];
    return m;
  };
  D10.roll = (xs, k) => xs.map((_, i) => (i + 1 >= k ? avg(xs.slice(i + 1 - k, i + 1)) : null));
  const count = (xs) => xs.reduce((a, b) => a + b, 0);

  // ---------- s2: the rule moves (Basketly, lesson 10.1 step 2) ----------
  D10.PREFS = (() => {
    const w1 = [30, 20, 12, 8],
      w52 = [54, 46, 36, 28];
    const now = (wk) => w1.map((v, i) => Math.round(v + (w52[i] - v) * ((wk - 1) / 51)));
    return { ages: ["18–29", "30–44", "45–59", "60+"], w1, w52, now };
  })();
  D10.same(
    "prefs: the model keeps week 1 (30, 20, 12, 8); week 52 is 54, 46, 36, 28; 30–44 goes 20 -> 46",
    [D10.PREFS.now(1), D10.PREFS.now(52), D10.PREFS.now(52)[1] - D10.PREFS.w1[1]],
    [[30, 20, 12, 8], [54, 46, 36, 28], 26],
  );

  // ---------- s3: three kinds of drift on one error stream (lesson 10.1 live demo, world(5), inject at 100) ----------
  D10.KINDS = (() => {
    const at = 100,
      n = 550;
    const rows = ["abrupt", "gradual", "recurring"].map((kind) => {
      const w = D10.world(5);
      for (let i = 0; i < n; i++) {
        if (i === at) w.inject(kind);
        w.next();
      }
      const truth = w.cs.map((c) => +(100 * (BASE + GAP * c)).toFixed(6));
      const roll = D10.roll(w.xs, 50).map((v) => (v == null ? null : 100 * v));
      return { kind, xs: w.xs, cs: w.cs, truth, roll, errs: count(w.xs) };
    });
    return { at, n, rows, label: { abrupt: "abrupt", gradual: "gradual", recurring: "recurring" } };
  })();
  D10.same(
    "kinds: same first 100 records in all three rows; errors 247 / 179 / 185; truth 10% before, 50% after",
    [
      D10.KINDS.rows.map((r) => r.errs),
      D10.KINDS.rows[1].xs.slice(0, 100).join("") === D10.KINDS.rows[0].xs.slice(0, 100).join(""),
      D10.KINDS.rows.map((r) => [r.truth[99], r.truth[100]]),
      [D10.KINDS.rows[1].truth[250], D10.KINDS.rows[2].truth[250], D10.KINDS.rows[2].truth[400]],
    ],
    [
      [247, 179, 185],
      true,
      [
        [10, 50],
        [10, 10],
        [10, 50],
      ],
      [30, 10, 50],
    ],
  );

  // ---------- s4: a batch model goes stale (lesson 10.1 staleRun) ----------
  D10.STALE = (() => {
    const drift = 6,
      every = 4,
      c = (w) => (w >= drift ? 1 : 0);
    const weeks = [],
      frozen = [],
      monthly = [],
      shares = [];
    let cm = 0;
    for (let w = 1; w <= 16; w++) {
      weeks.push(w);
      frozen.push(10 + 40 * c(w));
      monthly.push(10 + 40 * Math.abs(c(w) - cm));
      if (w % every === 0) {
        cm = avg([w - 3, w - 2, w - 1, w].map(c));
        shares.push(cm);
      }
    }
    return { drift, every, weeks, frozen, monthly, shares };
  })();
  D10.same(
    "stale: frozen stays at 50% from week 6; the monthly retrain is 50% in weeks 6–8, 20% in 9–12, 10% from 13",
    [D10.STALE.frozen, D10.STALE.monthly, D10.STALE.shares],
    [
      [10, 10, 10, 10, 10, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 10, 10, 10, 50, 50, 50, 20, 20, 20, 20, 10, 10, 10, 10],
      [0, 0.75, 1, 1],
    ],
  );

  // ---------- s5: watch the errors; the window-size trade-off (lesson 10.1 rollFig) ----------
  D10.ROLL = (() => {
    const at = 100,
      n = 260,
      w = D10.world(5);
    for (let i = 0; i < n; i++) {
      if (i === at) w.inject("abrupt");
      w.next();
    }
    const roll = {},
      pre = {},
      first = {};
    [10, 40, 150].forEach((k) => {
      roll[k] = D10.roll(w.xs, k).map((v) => (v == null ? null : 100 * v));
      const before = roll[k].slice(0, at).filter((v) => v != null);
      pre[k] = before.length ? { lo: Math.min(...before), hi: Math.max(...before) } : null;
      first[k] = roll[k].findIndex((v, i) => i >= at && v != null && v >= 30) + 1;
    });
    const falseAt = roll[10].findIndex((v, i) => i < at && v != null && v >= 30) + 1;
    return { at, n, xs: w.xs, roll, pre, first, falseAt };
  })();
  D10.same(
    "roll: last-10 swings 0%..30% before the drift; first reading of 30% or more after it: k 10 at 106, 40 at 119, 150 at 174",
    [D10.ROLL.pre[10].lo, D10.ROLL.pre[10].hi, D10.ROLL.first[10], D10.ROLL.first[40], D10.ROLL.first[150]],
    [0, 30, 106, 119, 174],
  );
  if (!(D10.ROLL.falseAt > 10 && D10.ROLL.falseAt <= 100)) throw new Error("VID.d10: roll: no false alarm before 100");

  // ---------- s6: ADWIN's window grows, then is cut (lesson 10.2 growFig, world(5), drift at 250) ----------
  D10.GROW = (() => {
    const at = 250,
      n = 450,
      w = D10.world(5),
      A = D10.adwin(),
      win = [],
      cuts = [];
    for (let i = 0; i < n; i++) {
      if (i === at) w.inject("abrupt");
      const { x } = w.next(),
        drop = A.add(x);
      win.push(A.W.length);
      if (drop) cuts.push({ n: i + 1, drop, win: A.W.length });
    }
    const after = win.map((v, i) => ({ n: i + 1, win: v })).filter((q) => q.n >= cuts[0].n && q.n <= 360);
    const low = after.reduce((b, q) => (q.win < b.win ? q : b));
    return { at, n, xs: w.xs, win, cuts, first: cuts[0], low };
  })();
  D10.same(
    "grow: window 250 at record 250 and 295 at 295; first cut at record 296 drops 40 (window 256); lowest 125 at record 334",
    [D10.GROW.win[249], D10.GROW.win[294], Object.values(D10.GROW.first), Object.values(D10.GROW.low)],
    [250, 295, [296, 40, 256], [334, 125]],
  );

  // ---------- s7: ADWIN's split test (lesson 10.2 adwinRun) ----------
  D10.SPLIT = (() => {
    const old = Array.from({ length: 80 }, (_, i) => (i % 10 === 9 ? 1 : 0)),
      neu = Array.from({ length: 40 }, (_, i) => [1, 0, 1, 0, 1][i % 5]);
    const all = [...old, ...neu];
    const best = (W) =>
      D10.splits(W).reduce((b, q) => (q.gap - q.eps > b.gap - b.eps ? q : b), { gap: -1, eps: 1, i: 0 });
    const frames = {};
    let fire = 0;
    for (let end = 80; end <= 120 && !fire; end++) {
      const W = all.slice(0, end),
        b = best(W),
        f = D10.splits(W).some((q) => q.gap >= q.eps);
      frames[end] = { end, i: b.i, m0: b.m0, m1: b.m1, gap: b.gap, eps: b.eps, fire: f };
      if (f) fire = end;
    }
    let start = 0;
    while (D10.splits(all.slice(start, fire)).some((q) => q.gap >= q.eps)) start++;
    const b = best(all.slice(start, fire));
    const after = { start, win: fire - start, i: start + b.i, m0: b.m0, m1: b.m1, gap: b.gap, eps: b.eps };
    return { old: 80, all, frames, fire, drop: start, after, eps100: D10.epsCut(100, 100), eps40: D10.epsCut(40, 40) };
  })();
  (() => {
    const S = D10.SPLIT,
      F = S.frames[S.fire],
      G = S.frames[90];
    D10.same(
      "split: fires at 111 records (older 79, newer 32: 8.9% vs 62.5%, gap 0.536 ≥ eps 0.520), drops 8, window 103",
      [S.fire, F.i, r3(F.m0), r3(F.m1), r3(F.gap), r3(F.eps), S.drop, S.after.win],
      [111, 79, 0.089, 0.625, 0.536, 0.52, 8, 103],
    );
    D10.same(
      "split: at 90 records gap 0.548 < eps 0.792; eps for 100 | 100 is 0.36, for 40 | 40 is 0.55",
      [G.i, r3(G.gap), r3(G.eps), G.fire, +S.eps100.toFixed(2), +S.eps40.toFixed(2)],
      [79, 0.548, 0.792, false, 0.36, 0.55],
    );
  })();

  // ---------- s8: DDM's p and s (lesson 10.2 spreadFig) ----------
  D10.SPREAD = (() => {
    const p = 0.1;
    const rows = [100, 400].map((n) => {
      const s = Math.sqrt((p * (1 - p)) / n);
      return { n, e: p * n, p, s, ps: p + s };
    });
    return { p, rows, xs: Array.from({ length: 400 }, (_, i) => (i % 10 === 4 ? 1 : 0)) };
  })();
  D10.same(
    "spread: 100 records, 10 errors: s 0.03, p + s 0.13; 400 records: s 0.015, p + s 0.115",
    D10.SPREAD.rows.map((r) => [r.e, r3(r.s), r3(r.ps)]).concat([count(D10.SPREAD.xs.slice(0, 100))]),
    [[10, 0.03, 0.13], [40, 0.015, 0.115], 10],
  );

  // ---------- s9: DDM's warning and change lines (lesson 10.2 ddmRun) ----------
  D10.DDM = (() => {
    const xs = Array.from({ length: 200 }, (_, i) => (i < 120 ? (i % 10 === 4 ? 1 : 0) : i % 2));
    const D = D10.ddm(),
      hist = [];
    let warn = null,
      change = null,
      pminAt = 0,
      bestSum = Infinity;
    for (let n = 1; n <= 200 && !change; n++) {
      const st = D.add(xs[n - 1]);
      if (D.ready() && D.pmin + D.smin < bestSum) ((bestSum = D.pmin + D.smin), (pminAt = n));
      const ok = D.ready();
      hist.push({
        n,
        e: D.e,
        p: D.p,
        s: D.s,
        ps: D.p + D.s,
        w2: ok ? D.pmin + 2 * D.smin : null,
        w3: ok ? D.pmin + 3 * D.smin : null,
        state: st,
      });
      if (st === "warning" && !warn) warn = { n, ps: D.p + D.s, line: D.pmin + 2 * D.smin };
      if (st === "drift") change = { n, ps: D.p + D.s, line: D.pmin + 3 * D.smin };
    }
    return { xs: xs.slice(0, change.n), rise: 121, hist, pmin: D.pmin, smin: D.smin, pminAt, warn, change };
  })();
  D10.same(
    "ddm: p_min 0.096, s_min 0.028 (record 114); warning at record 128 (p + s 0.154 ≥ 0.152); change at 138 (0.183 ≥ 0.179)",
    [
      +D10.DDM.pmin.toFixed(3),
      +D10.DDM.smin.toFixed(3),
      D10.DDM.pminAt,
      [D10.DDM.warn.n, r3(D10.DDM.warn.ps), r3(D10.DDM.warn.line)],
      [D10.DDM.change.n, r3(D10.DDM.change.ps), r3(D10.DDM.change.line)],
      D10.DDM.hist[29].w2 != null && D10.DDM.hist[28].w2 == null,
    ],
    [0.096, 0.028, 114, [128, 0.154, 0.152], [138, 0.183, 0.179], true],
  );

  // ---------- s10: EDDM's gaps between errors (lesson 10.2 gapsFig) and the race (raceFig) ----------
  D10.GAPS = (() => {
    const stat = (g) => {
      const m = avg(g),
        s = Math.sqrt(avg(g.map((d) => (d - m) ** 2)));
      return { m, s, v: m + 2 * s };
    };
    const before = [9, 12, 8, 11, 10],
      after = [3, 2, 4, 2, 3, 2, 3];
    const b = stat(before),
      a = stat(after);
    return { before, after, b, a, ratio: a.v / b.v, warn: 0.95, drift: 0.9 };
  })();
  D10.same(
    "gaps: before mean 10, spread 1.41, 12.83; after mean 2.71, spread 0.70, 4.11; ratio 0.32",
    [D10.GAPS.b, D10.GAPS.a]
      .map((q) => [+q.m.toFixed(2), +q.s.toFixed(2), +q.v.toFixed(2)])
      .concat([+D10.GAPS.ratio.toFixed(2)]),
    [[10, 1.41, 12.83], [2.71, 0.7, 4.11], 0.32],
  );
  D10.RACE = (() => {
    const run = (kind) => {
      const m = D10.monitor(5);
      m.run(200);
      m.w.inject(kind);
      for (let i = 0; i < 700 && !(m.first("A") && m.first("D") && m.first("E")); i++) m.one();
      const o = {};
      ["A", "D", "E"].forEach((k) => (o[k] = m.first(k) ? m.first(k).t - m.w.at : null));
      return o;
    };
    return { at: 300, abrupt: run("abrupt"), gradual: run("gradual") };
  })();
  D10.same(
    "race: abrupt ADWIN 33, DDM 29, EDDM 29; gradual ADWIN 275, DDM 138, EDDM 108",
    [D10.RACE.abrupt, D10.RACE.gradual].map((o) => [o.A, o.D, o.E]),
    [
      [33, 29, 29],
      [275, 138, 108],
    ],
  );
})();

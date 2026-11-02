/* Lecture 9 · Batch and online machine learning (Data Science, COM3021): the data and the runs every scene of this video
   shares (VID.d9, short name D9). PURE: no DOM, no Math.random, no Date. The lessons' own code (js/content/ds/ds-l9-01.js,
   ds-l9-02.js, ds-l9-03.js: rng, gauss, trips, loss, grad, epoch, stream, sgd, run) is ported here line for line (same seeds,
   same order of random draws), every run is made ONCE when the page loads, and every number the storyboard
   (videos/_plan/ds-9.json) quotes is ASSERTED below: a wrong figure throws a clear Error. Scenes only look values up and draw
   frame t from these logs; captions may be built from them (`${D9.DESC.ws[1]}`), never typed by hand.

   THE MODEL (the lessons' courier app): minutes = w × km, one weight w. Cost = mean squared error, a bowl in w.

   TOOLS
     D9.rng(seed) -> () => 0..1 (the lessons' generator);  D9.gauss(r) a normal draw from it
     D9.same(what, got, want)  throws unless equal (numbers within 1e-9, arrays element by element, strings ===)
     D9.close(what, got, want, eps)  numbers (or arrays of numbers) within eps
     D9.fm(v, d = 2) -> string, at most d decimals, a real minus sign ("4.36", "−18", "5.1")  (the lessons' fm)
     D9.cost1(w) = (w − 4)²  the one-trip bowl (1 km trip that took 4 min);  D9.slope1(w) = 2 (w − 4)
     D9.loss(d, w), D9.grad(d, w)  mean squared error and its slope over records d = [{x: km, y: minutes}]
     D9.sgd(w, p, eta)  one online update on one record;  D9.run(d, eta, w = 4) -> weights after each record
     D9.epoch(d, w, B, eta, seed) -> {w, out: [{seen, w, l}]}  one (mini-)batch epoch, shuffled exactly as the app does

   THE EXAMPLES (scene numbers of the storyboard)
     D9.BOWL  (s2)  {km: 1, min: 4, guess: 7, pred: 7, err: 3, cost: 9, best: 4, view: {x: [0, 10], y: [0, 40]}}
     D9.DESC  (s3)  learning rate 0.25 from w = 10:  ws [10, 7, 5.5, 4.75, 4.375], slopes [12, 6, 3, 1.5],
                    steps (0.25 × slope) [3, 1.5, 0.75, 0.375], dist (to 4) [6, 3, 1.5, 0.75, 0.375]
     D9.RATES (s4)  view {x: [−6, 14], y: [0, 100]}; runs [{eta, ws (7 values: start + 6 steps), shown (how many stay on the
                    chart: a weight outside −6..14 leaves it), tag}] for eta 0.1 (creeps), 0.75 (zigzags in), 1.1 (diverges):
                    0.1: 10, 8.8, 7.84, 7.072 …  0.75: 10, 1, 5.5, 3.25, 4.375 …  1.1: 10, −3.2, 12.64, then −6.368 (off the chart)
     D9.EPOCH (s5)  trips [[1, 4], [2, 8], [3, 12], [2, 8]], w0 6, eta 0.05; epochs[e] = {w, preds, errs, grad, nw}:
                    epoch 1: preds 6, 12, 18, 12, errors 2, 4, 6, 4, gradient 18, w 6 → 5.1;  epoch 2: gradient 9.9, 5.1 → 4.605
     D9.DRIFT (s6)  the roadworks stream (lesson 9.3 adaptFig: stream(80, 21, 40), 4 → 6 min per km at record 40):
                    old = records 1..8 (4 per km), now = records 41..48 (6 per km), each {x: km, y: minutes};
                    model 4 (frozen), real 6, gapAt4 = 8 (at 4 km the model says 16, the road now takes 24), errOld / errNow =
                    the frozen model's mean error in minutes on old / now (asserted 0.7 / 4.3 after rounding to 1 decimal)
     D9.GROW  (s7)  2 GB a week, memory 64 GB: read(k) = 2k GB; week 10 reads 20, all retrains to week 10 read 110;
                    first week over memory = 33 (66 GB); a 4-week window always reads 8 GB
     D9.RACE  (s8)  lesson 9.2's race: trips(24, 4, 7), start w = 10, eta 0.02, ONE epoch (seed 100) for B = 24, 8, 1:
                    RACE.start = {w: 10, l: 270.45}; RACE.best ≈ 4.01 (the bottom), RACE.min (its loss, 1.68);
                    RACE.runs = [{B, n: updates, steps: [{seen, w, l}]}]: B 24 -> 1 update, loss 133.38;
                    B 8 -> 3 updates, losses 129.02, 82.59, 33.02;  B 1 -> 24 updates, ends at 1.90;
                    RACE.ups = updates of B 1 that RAISE the loss (noise); RACE.jump = the biggest one {i, from, to}
                    RACE.view = {x: [3, 10.5], y: [0, 280]} (the bowl loss(w) drawn in these panels)
     D9.ONLINE (s9) lesson 9.3's five records [[3, 15], [1, 5], [2, 9], [4, 19], [2, 10]] at eta 0.02 from w 4:
                    rows [{x, y, w (before), pred, grad, nw}]: record 1: predict 12, gradient −18, w 4 → 4.36;
                    ws [4, 4.36, 4.39, 4.4, 4.63, 4.69] (2 decimals, see .ws2)
     D9.ADAPT (s10) the roadworks stream again; runs [{eta, ws (80 weights), catch (records after the change until within 0.5
                    of 6), wob (wobble over records 21..40 before it)}] for eta 0.004 (catch 23, wob 0.10) and 0.02 (catch 2,
                    wob 0.44); target(i) = 4 before record 40, 6 from it (i = 0-based record index)
     D9.GLITCH (s10) stream(40, 33) with record 20 replaced by a bad one (2 km logged as 90 min); eta 0.02: ws (40 weights),
                    before 4.03, jump 10.59, back 5 (records until within 0.5 of 4 again); eta 0.004 jumps only to 5.29
     D9.SHIFT (s11) prior: 20 patients, 12 have flu before, 4 during the pandemic; concept: 4 -> 6 min per km (D9.DRIFT) */
(function () {
  const V = window.VID;
  const D9 = (V.d9 = V.d9 || {});

  // ---------- tools ----------
  const eqv = (a, b) =>
    Array.isArray(a)
      ? Array.isArray(b) && a.length === b.length && a.every((x, i) => eqv(x, b[i]))
      : typeof a === "number" && typeof b === "number"
        ? Math.abs(a - b) < 1e-9
        : a === b;
  D9.same = (what, got, want) => {
    if (!eqv(got, want))
      throw new Error(`VID.d9: ${what}: got ${JSON.stringify(got)}, storyboard says ${JSON.stringify(want)}`);
  };
  const near = (a, b, eps) =>
    Array.isArray(a) ? a.length === b.length && a.every((x, i) => near(x, b[i], eps)) : Math.abs(a - b) <= eps;
  D9.close = (what, got, want, eps) => {
    if (!near(got, want, eps))
      throw new Error(
        `VID.d9: ${what}: got ${JSON.stringify(got)}, storyboard says ${JSON.stringify(want)} (± ${eps})`,
      );
  };
  D9.fm = (v, d = 2) => String(+(+v).toFixed(d)).replace("-", "−");
  const r2 = (v) => +v.toFixed(2);

  // ---------- the lessons' code, ported line for line ----------
  D9.rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  D9.gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  D9.trips = (n, w, seed, sd = 1.5) => {
    const r = D9.rng(seed);
    return Array.from({ length: n }, (_, i) => {
      const x = 1 + (i % 4);
      return { x, y: Math.max(1, w * x + sd * D9.gauss(r)) };
    });
  };
  D9.loss = (d, w) => d.reduce((s, p) => s + (w * p.x - p.y) ** 2, 0) / d.length;
  D9.grad = (d, w) => d.reduce((s, p) => s + 2 * p.x * (w * p.x - p.y), 0) / d.length;
  D9.best = (d) => d.reduce((s, p) => s + p.x * p.y, 0) / d.reduce((s, p) => s + p.x * p.x, 0);
  D9.epoch = (d, w, B, eta, seed) => {
    const r = D9.rng(seed);
    const idx = d.map((_, i) => i).sort(() => r() - 0.5);
    const out = [];
    for (let i = 0; i < d.length; i += B) {
      const b = idx.slice(i, i + B).map((k) => d[k]);
      w -= eta * D9.grad(b, w);
      out.push({ seen: i + b.length, w, l: D9.loss(d, w) });
    }
    return { w, out };
  };
  D9.stream = (n, seed, at = Infinity, to = 6) => {
    const r = D9.rng(seed);
    return Array.from({ length: n }, (_, i) => {
      const x = 1 + Math.floor(r() * 4);
      const W = i < at ? 4 : to;
      return { x, y: W * x + D9.gauss(r), W };
    });
  };
  D9.sgd = (w, p, eta) => w - eta * 2 * p.x * (w * p.x - p.y);
  D9.run = (d, eta, w = 4) => d.map((p) => (w = D9.sgd(w, p, eta)));
  D9.cost1 = (w) => (w - 4) ** 2;
  D9.slope1 = (w) => 2 * (w - 4);

  // ---------- s2: one trip, one weight, a bowl ----------
  D9.BOWL = (() => {
    const km = 1;
    const min = 4;
    const guess = 7;
    const pred = guess * km;
    return { km, min, guess, pred, err: pred - min, cost: D9.cost1(guess), best: 4, view: { x: [0, 10], y: [0, 40] } };
  })();
  D9.same(
    "bowl: a 1 km trip took 4 min; guess w = 7 predicts 7, 3 off, cost 9; the bottom is w = 4 with cost 0",
    [D9.BOWL.pred, D9.BOWL.err, D9.BOWL.cost, D9.cost1(D9.BOWL.best)],
    [7, 3, 9, 0],
  );

  // ---------- s3: gradient descent, learning rate 0.25 from w = 10 ----------
  D9.DESC = (() => {
    const eta = 0.25;
    const ws = [10];
    const slopes = [];
    const steps = [];
    for (let k = 0; k < 4; k++) {
      const w = ws[ws.length - 1];
      slopes.push(D9.slope1(w));
      steps.push(eta * D9.slope1(w));
      ws.push(w - eta * D9.slope1(w));
    }
    return { eta, ws, slopes, steps, dist: ws.map((w) => w - 4), costs: ws.map(D9.cost1) };
  })();
  D9.same(
    "descent: from 10 at learning rate 0.25 the weight goes 10, 7, 5.5, 4.75, 4.375 (slopes 12, 6, 3, 1.5; the distance halves)",
    [D9.DESC.ws, D9.DESC.slopes, D9.DESC.steps, D9.DESC.dist, D9.DESC.costs[0]],
    [[10, 7, 5.5, 4.75, 4.375], [12, 6, 3, 1.5], [3, 1.5, 0.75, 0.375], [6, 3, 1.5, 0.75, 0.375], 36],
  );

  // ---------- s4: three learning rates on the wide bowl (lesson ratesFig) ----------
  D9.RATES = (() => {
    const view = { x: [-6, 14], y: [0, 100] };
    const one = (eta, tag) => {
      const ws = [10];
      for (let k = 0; k < 6; k++) ws.push(ws[k] - eta * D9.slope1(ws[k]));
      let shown = 0;
      while (shown < ws.length && ws[shown] >= view.x[0] && ws[shown] <= view.x[1]) shown++;
      return { eta, ws, shown, tag };
    };
    return { view, runs: [one(0.1, "slow"), one(0.75, "zigzags in"), one(1.1, "diverges")] };
  })();
  D9.close(
    "learning rates: 0.1 creeps 10, 8.8, 7.84, 7.072; 0.75 zigzags 10, 1, 5.5, 3.25, 4.375; 1.1 goes 10, -3.2, 12.64, -6.368",
    [...D9.RATES.runs[0].ws.slice(0, 4), ...D9.RATES.runs[1].ws.slice(0, 5), ...D9.RATES.runs[2].ws.slice(0, 4)],
    [10, 8.8, 7.84, 7.072, 10, 1, 5.5, 3.25, 4.375, 10, -3.2, 12.64, -6.368],
    1e-9,
  );
  D9.same(
    "learning rates: 0.1 and 0.75 stay on the chart for all 6 steps, 1.1 leaves it on step 3",
    D9.RATES.runs.map((r) => r.shown),
    [7, 7, 3],
  );

  // ---------- s5: an epoch of full batch learning (lesson epochRun) ----------
  D9.EPOCH = (() => {
    const trips = [
      [1, 4],
      [2, 8],
      [3, 12],
      [2, 8],
    ];
    const eta = 0.05;
    let w = 6;
    const epochs = [];
    for (let e = 0; e < 3; e++) {
      const preds = trips.map(([x]) => w * x);
      const errs = trips.map(([x, y]) => w * x - y);
      const grad = (2 * trips.reduce((s, [x, y]) => s + x * (w * x - y), 0)) / trips.length;
      const nw = w - eta * grad;
      epochs.push({ w, preds, errs, grad, nw });
      w = nw;
    }
    return { trips, w0: 6, eta, epochs };
  })();
  D9.close(
    "epoch: at w = 6 the predictions are 6, 12, 18, 12, the errors 2, 4, 6, 4, the gradient 18, the new w 5.1; epoch 2: 9.9, 4.605",
    [...D9.EPOCH.epochs[0].preds, ...D9.EPOCH.epochs[0].errs, D9.EPOCH.epochs[0].grad, D9.EPOCH.epochs[0].nw],
    [6, 12, 18, 12, 2, 4, 6, 4, 18, 5.1],
    1e-9,
  );
  D9.close(
    "epoch 2 and 3",
    [D9.EPOCH.epochs[1].grad, D9.EPOCH.epochs[1].nw, D9.EPOCH.epochs[2].nw],
    [9.9, 4.605, 4.33275],
    1e-9,
  );

  // ---------- s6 and s10: the roadworks stream (lesson 9.3 adaptFig: 4 -> 6 min per km at record 40) ----------
  const ROAD = D9.stream(80, 21, 40);
  D9.ROAD = ROAD;
  D9.DRIFT = (() => {
    const old = ROAD.slice(0, 8).map((p) => ({ x: p.x, y: p.y }));
    const now = ROAD.slice(40, 48).map((p) => ({ x: p.x, y: p.y }));
    const err = (d) => d.reduce((s, p) => s + Math.abs(4 * p.x - p.y), 0) / d.length;
    return { old, now, model: 4, real: 6, gapAt4: 6 * 4 - 4 * 4, errOld: err(old), errNow: err(now), at: 40 };
  })();
  D9.same(
    "drift: 8 old records at 4 per km, 8 new ones at 6 per km; the frozen model is about 0.7 min off before and 4.3 min off after",
    [
      D9.DRIFT.old.length,
      D9.DRIFT.now.length,
      D9.DRIFT.gapAt4,
      +D9.DRIFT.errOld.toFixed(1),
      +D9.DRIFT.errNow.toFixed(1),
    ],
    [8, 8, 8, 0.7, 4.3],
  );
  D9.same(
    "drift: the first old record is 2 km in 7.8 min and the first new one 3 km in 16.1 min",
    [D9.DRIFT.old[0].x, +D9.DRIFT.old[0].y.toFixed(1), D9.DRIFT.now[0].x, +D9.DRIFT.now[0].y.toFixed(1)],
    [2, 7.8, 3, 16.1],
  );

  // ---------- s7: retraining on everything gets heavy (lesson growFig and windowFig) ----------
  D9.GROW = (() => {
    const perWeek = 2;
    const mem = 64;
    const read = (k) => perWeek * k;
    let over = 1;
    while (read(over) <= mem) over++;
    let total10 = 0;
    for (let k = 1; k <= 10; k++) total10 += read(k);
    return { perWeek, mem, read, week10: read(10), total10, over, overGB: read(over), win: 4, winGB: perWeek * 4 };
  })();
  D9.same(
    "grow: week 10 reads 20 GB, all retrains to week 10 read 110 GB, week 33 (66 GB) is the first over 64 GB, a 4-week window reads 8 GB",
    [D9.GROW.week10, D9.GROW.total10, D9.GROW.over, D9.GROW.overGB, D9.GROW.winGB],
    [20, 110, 33, 66, 8],
  );

  // ---------- s8: the batch-size race (lesson 9.2 race: 24 trips, learning rate 0.02, the first epoch, seed 100) ----------
  D9.RACE = (() => {
    const d = D9.trips(24, 4, 7);
    const best = D9.best(d);
    const runs = [24, 8, 1].map((B) => {
      const e = D9.epoch(d, 10, B, 0.02, 100);
      return { B, n: e.out.length, steps: e.out };
    });
    const on = runs[2].steps;
    const ups = [];
    let jump = null;
    on.forEach((s, i) => {
      const from = i ? on[i - 1].l : D9.loss(d, 10);
      if (s.l > from) {
        ups.push(i);
        if (!jump || s.l - from > jump.to - jump.from) jump = { i, from, to: s.l };
      }
    });
    return {
      d,
      best,
      min: D9.loss(d, best),
      start: { w: 10, l: D9.loss(d, 10) },
      runs,
      ups,
      jump,
      view: { x: [3, 10.5], y: [0, 280] },
    };
  })();
  D9.same(
    "race: one epoch is 1, 3 and 24 updates; losses 270.45 at the start, 133.38 (full batch), 129.02 82.59 33.02 (8), 1.9 (one at a time)",
    [
      D9.RACE.runs.map((r) => r.n),
      r2(D9.RACE.start.l),
      r2(D9.RACE.runs[0].steps[0].l),
      D9.RACE.runs[1].steps.map((s) => r2(s.l)),
      r2(D9.RACE.runs[2].steps[23].l),
    ],
    [[1, 3, 24], 270.45, 133.38, [129.02, 82.59, 33.02], 1.9],
  );
  D9.same(
    "race: the bottom is at w 4.01 with loss 1.68; one at a time pushes the loss UP on several updates, most on update 19 (1.9 -> 2.39)",
    [
      r2(D9.RACE.best),
      r2(D9.RACE.min),
      D9.RACE.ups.length > 3,
      D9.RACE.jump.i + 1,
      r2(D9.RACE.jump.from),
      r2(D9.RACE.jump.to),
    ],
    [4.01, 1.68, true, 19, 1.9, 2.39],
  );

  // ---------- s9: online learning, one record at a time (lesson sgdRun) ----------
  D9.ONLINE = (() => {
    const recs = [
      [3, 15],
      [1, 5],
      [2, 9],
      [4, 19],
      [2, 10],
    ];
    const eta = 0.02;
    let w = 4;
    const rows = recs.map(([x, y]) => {
      const pred = w * x;
      const g = 2 * x * (pred - y);
      const row = { x, y, w, pred, grad: g, nw: w - eta * g };
      w = row.nw;
      return row;
    });
    const ws = [4, ...rows.map((r) => r.nw)];
    return { eta, recs, rows, ws, ws2: ws.map(r2) };
  })();
  D9.close(
    "online: w 4, a 3 km trip took 15 min: predict 12, gradient -18, w 4.36",
    [D9.ONLINE.rows[0].pred, D9.ONLINE.rows[0].grad, D9.ONLINE.rows[0].nw],
    [12, -18, 4.36],
    1e-9,
  );
  D9.same("online: the weight after each of the five records", D9.ONLINE.ws2, [4, 4.36, 4.39, 4.4, 4.63, 4.69]);

  // ---------- s10: how fast to adapt, and one bad record (lesson adaptFig, glitchFig) ----------
  D9.ADAPT = (() => {
    const target = (i) => (i < 40 ? 4 : 6);
    const runs = [0.004, 0.02].map((eta) => {
      const ws = D9.run(ROAD, eta);
      const k = ws.findIndex((v, i) => i >= 40 && Math.abs(v - 6) < 0.5);
      const pre = ws.slice(20, 40);
      return { eta, ws, catch: k - 39, wob: Math.max(...pre) - Math.min(...pre) };
    });
    return { n: ROAD.length, at: 40, target, runs };
  })();
  D9.same(
    "adapt: after the change at record 40, rate 0.004 needs 23 records to get within 0.5 of 6, rate 0.02 needs 2; wobble 0.1 and 0.44",
    [D9.ADAPT.runs.map((r) => r.catch), D9.ADAPT.runs.map((r) => r2(r.wob))],
    [
      [23, 2],
      [0.1, 0.44],
    ],
  );
  D9.GLITCH = (() => {
    const d = D9.stream(40, 33);
    d[19] = { x: 2, y: 90, W: 4 };
    const ws = D9.run(d, 0.02);
    const back = ws.findIndex((v, i) => i > 19 && Math.abs(v - 4) < 0.5);
    return {
      d,
      at: 19,
      bad: { km: 2, min: 90 },
      ws,
      before: ws[18],
      jump: ws[19],
      back: back - 19,
      slow: D9.run(d, 0.004)[19],
    };
  })();
  D9.same(
    "glitch: a 2 km trip logged as 90 min at record 20; rate 0.02 jumps 4.03 -> 10.59 and is back within 0.5 of 4 after 5 records; 0.004 only reaches 5.29",
    [r2(D9.GLITCH.before), r2(D9.GLITCH.jump), D9.GLITCH.back, r2(D9.GLITCH.slow)],
    [4.03, 10.59, 5, 5.29],
  );

  // ---------- s11: three shifts ----------
  D9.SHIFT = { prior: { n: 20, before: 12, during: 4 }, concept: { from: 4, to: 6 } };
  D9.same("shift: 12 of 20 had flu before, 4 of 20 during", [D9.SHIFT.prior.before, D9.SHIFT.prior.during], [12, 4]);
})();

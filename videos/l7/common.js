/* Lecture 7 · Swarm intelligence and ant colonies: PURE DATA AND ALGORITHMS for this video (no DOM). Everything hangs off
   window.VID.l7 (scenes start with  const L7 = window.VID.l7).  Every number a scene shows comes from here: the functions run
   the lesson's real rules (js/content/nic/l7-01.js to l7-03.js) and ASSERT the figures when the page loads (a wrong number
   throws an Error that names it).  Nothing here is random: every colony and ant run uses the seeded generator L7.rng.

   ASSERT TOOLS   L7.same(what, got, want)  deep equality, throws;   L7.close(what, got, want, tol)   throws;   L7.rng(seed) -> () => 0..1

   1. VOTES  (lesson 7.1, "Emergence by numbers": each scout is right 60% of the time, the colony follows the majority)
        L7.majority(n, p) -> percent chance that the majority of n scouts, each right with probability p, is right (n odd)
        L7.VOTE = { p: 0.6, rows: [ {n, pct (exact), shown (rounded integer), right, wrong, votes} ] }
          rows: 1 scout (pct 60, shown 60, right/wrong/votes are null: one scout is just "right 60% of the time"),
                11 scouts (pct 75.35, shown 75, one typical vote: right 7, wrong 4),
                31 scouts (pct 87.16, shown 87, one typical vote: right 19, wrong 12).
          votes = [true|false x n] one typical vote in a fixed (seeded) order (true = picked the better route);
          right and wrong are the counts of true and false.   L7.VOTE.coin = 50 (31 coin-flip scouts stay at 50%).

   2. THE DOUBLE BRIDGE  (lesson 7.2; one ant leaves the nest per tick, picks a branch with weight (2 + trail)^2 and lays one
      unit of pheromone on that branch when it ARRIVES, so a short branch is paid sooner; every trail loses 1% per tick)
        L7.BR = { TICKS: 150, SHORT: 5 (the short branch is 5 ticks long) , LONG: 10, K: 2, EVAP: 0.01 }
        L7.bridgeSim(seed, longLen) -> sim {picks: [0 upper | 1 lower per tick], tu, tl (trail on the upper / lower branch after each
          tick), len: [5, longLen], seed}.   The UPPER branch is always the short one (5 long); longLen 5 gives two equal branches.
        L7.upShare(picks) -> 0..1;   L7.outcome(sim) -> "up" | "down" | "split" (80% of the last 40 ants on one branch)
        L7.rolling(picks, k = 10) -> percent of the ants (the last k, among those that have left) on the upper branch, per tick
        L7.tally(longLen, n, from = 1) -> {up, down, split} outcome counts over n seeded colonies (seeds from .. from + n - 1)
        L7.bridgeAt(sim, T) -> the state of the colony at CONTINUOUS tick time T (0 .. 149):
              { tauU, tauL        trail strengths (smoothed over 0.3 tick after each arrival, so widths grow instead of jumping),
                ants: [{b, s, i}] every ant in flight: branch b (0 upper, 1 lower), progress s 0..1 along it, leaving tick i,
                landed: [{b, age}] ants that arrived within the last tick (age 0..1: use it for a deposit flash),
                n: [upper, lower]  how many ants have left so far on each branch,
                share              percent of the last 10 ants (that have left) on the UPPER branch, or null before the first ant }
        L7.EQ = { up: sim (seed 77, equal branches, settles on the UPPER branch), down: sim (seed 58, settles on the LOWER branch) }
              both start about 50:50 (first 20 ants: 50% and 45% upper). bridgeAt(sim, T).share at T = 10, 30, 60, 76 is 50, 90, 100, 100
              for colony 1 and 30, 20, 10, 0 for colony 2.
        L7.SH = sim (seed 71, branches 5 and 10): ant 0 goes long, ant 1 short; the short branch is paid first (tick 6) and the long one
              later (tick 10). bridgeAt(L7.SH, T).share (the short branch) is 70% at T = 10, 80 at 20, 90 at 30, 100 from 40 on;
              the trails at T = 60 are 37.9 (short) and 4.8 (long).
        L7.SHT = {up: 170, down: 20, split: 10} for 200 colonies with branches 5 and 10 (85% short, 10% long, 5% split).
        L7.firstLand(sim, b) -> the first tick at which an ant lands on branch b (SH: short 6, long 10)

   3. A TRAIL BUILDS UP AND FADES  (lesson 7.3: each step a trail loses a fraction rho and gains the ants that use it)
        L7.trailSeries(ants, rho, steps, stop = Infinity) -> [strength after step 0 .. steps]  (step 0 is 0; after each step it is
          previous x (1 - rho) + ants, but only while step <= stop)
        L7.TRAIL = { rho: 0.2, ants: {a: 4, b: 2}, stop: 30, steps: 50, a: [...], b: [...],
                     eq: {a: 20, b: 10} (ants / rho, where gain equals loss), chance: {a: 67, b: 33} (percent, at step 30) }
        L7.trailAt(T) -> at continuous step T (0 .. 50):
              { step (floor), a, b          strengths (linear between steps),
                gainA, lossA, gainB, lossB  what the CURRENT step adds / removes (loss = rho x strength after the previous step),
                running                     true while the ants still walk (step <= stop) }
          At step 30: a 19.9, b 9.9, gain 4 / loss 4.0 and 2 / 2.0 (they balance); at step 50 the trails are down to 0.2 and 0.1.

   4. THE FOUR-TOWN ROUND  (lesson 7.4: towns A B (top), C D (bottom); roads carry a distance d and pheromone tau)
        L7.MAP = { names: "ABCD", roads: ["A-B","A-C","A-D","B-C","B-D","C-D"] (key = the two letters in order, joined by "-"),
                   dist: {"A-B": 3, "A-C": 4, "A-D": 5, "B-C": 6, "B-D": 3, "C-D": 4},
                   tau0: {"A-B": 24, "A-C": 40, "A-D": 10, "B-C": 30, "B-D": 20, "C-D": 10}, rho: 0.5, Q: 72,
                   tours: [{name: "A-B-C-D", path: [...], len: 18, edges: [...4 road keys]}, {A-B-D-C, 14}, {A-C-B-D, 18}] }
        L7.ek(a, b) -> road key ("C", "A" gives "A-C");  L7.dd(a, b) -> distance;  L7.edgesOf(path) -> the 4 road keys of a closed tour;
        L7.tourLen(path);  L7.tourName(path) -> canonical name starting at A ("B-C-A-D" is "A-C-B-D")
        L7.trailOn(tau, path) -> sum of tau over the tour's 4 roads;  L7.options(tau, cur, visited) -> [{town, w, p}] weight tau / d, chance
        L7.sendAnt(tau, rnd, rho, Q, start) -> {path, len}: the lesson's ant: builds a tour, evaporates every road, deposits Q / length
          on each road of the tour (CHANGES tau). start is optional (a town letter); without it the ant starts on a seeded town.
        L7.WALK  the one-ant walkthrough of lesson 7.4 (the story ant takes A-C-B-D):
              { tour: ["A","C","B","D"], len: 18, hops: [4, 6, 3, 5] (A>C, C>B, B>D, D>A),
                steps: [ {cur, visited, opts: [{town, road, tau, d, w, p, pct}], pick, pickRoad, pickPct} x3 ],
                home: {from: "D", to: "A", road: "A-D", d: 5} }
              step 1 at A: B 24 / 3 = 8 (40%), C 40 / 4 = 10 (50%), D 10 / 5 = 2 (10%): picks C.   step 2 at C: B 30 / 6 = 5 (67%),
              D 10 / 4 = 2.5 (33%): picks B.   step 3 at B: only D (20 / 3 = 6.7, 100%).
        L7.UPDATE  evaporate then deposit after that tour:
              { rho: 0.5, Q: 72, len: 18, dep: 4, tourRoads: ["A-C","B-C","B-D","A-D"],
                roads: {key: {start, evap, add, after}} }
              start 24 40 10 30 20 10 (A-B A-C A-D B-C B-D C-D) -> evap 12 20 5 15 10 5 -> after 12 24 9 19 14 5 (+4 on the tour's roads).
        L7.RUN  24 ants sent one after another with the same rule (rho 0.5, Q 72, seed 59):
              { tours: ["A-B-C-D", "A-B-D-C", "A-C-B-D"] (order of the trail values), lens: [18, 14, 18], short: "A-B-D-C",
                start: {tau, trail: [74, 94, 100], leader: "A-C-B-D"},
                ants: [{k (1..24), start, path: "BCAD" (as walked), tour: "A-C-B-D", len, edges, tau (after this ant), trail: [3 sums],
                        leader (name of the tour with the strongest trail after this ant)}],
                firstShort: 6 (the first ant after which the 14-tour leads),
                dep: {short: 5.1 (72 / 14), long: 4 (72 / 18)} }
              Ants 1 to 5 all walk length-18 tours (A-C-B-D, A-C-B-D, A-B-C-D, A-C-B-D, A-C-B-D), ant 6 walks the 14-tour and from
              then on the 14-tour has the strongest trail;
              after ant 24 the trails on the three tours are 21, 41, 21. */
(function () {
  const V = window.VID;
  const L7 = (V.l7 = V.l7 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.l7: ${what} is ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
    return got;
  };
  const close = (what, got, want, tol = 0.01) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.l7: ${what} is ${got}, expected ${want} (+-${tol})`);
    return got;
  };
  const rng = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const clamp = V.clamp;

  // ---------- 1. votes ----------
  const majority = (n, p) => {
    let s = 0;
    for (let k = Math.floor(n / 2) + 1; k <= n; k++) {
      let c = 1;
      for (let i = 0; i < k; i++) c = (c * (n - i)) / (i + 1);
      s += c * p ** k * (1 - p) ** (n - k);
    }
    return s * 100;
  };
  const VOTE = (() => {
    const p = 0.6;
    const rows = [1, 11, 31].map((n) => {
      const pct = majority(n, p);
      const row = { n, pct, shown: Math.round(pct), right: null, wrong: null, votes: null };
      if (n > 1) {
        const right = Math.round(n * p);
        const r = rng(n);
        const votes = Array.from({ length: n }, (_, i) => i < right);
        for (let i = n - 1; i > 0; i--) {
          const j = Math.floor(r() * (i + 1));
          [votes[i], votes[j]] = [votes[j], votes[i]];
        }
        Object.assign(row, { right, wrong: n - right, votes });
      }
      return row;
    });
    return { p, rows, coin: Math.round(majority(31, 0.5)) };
  })();
  same(
    "vote percentages",
    VOTE.rows.map((r) => r.shown),
    [60, 75, 87],
  );
  same(
    "typical votes",
    VOTE.rows.map((r) => [r.right, r.wrong]),
    [
      [null, null],
      [7, 4],
      [19, 12],
    ],
  );
  VOTE.rows.slice(1).forEach((r) => {
    same(`votes of ${r.n} scouts add up`, r.votes.filter(Boolean).length, r.right);
    if (r.right * 2 <= r.n) throw new Error("VID.l7: a typical vote must have a right majority");
  });
  same("coin-flip colony", VOTE.coin, 50);

  // ---------- 2. the double bridge ----------
  const BR = { TICKS: 150, SHORT: 5, LONG: 10, K: 2, EVAP: 0.01 };
  function bridgeSim(seed, longLen) {
    const r = rng(seed);
    const len = [BR.SHORT, longLen];
    const tau = [0, 0];
    const due = [];
    const [picks, tu, tl] = [[], [], []];
    for (let t = 0; t < BR.TICKS; t++) {
      tau[0] *= 1 - BR.EVAP;
      tau[1] *= 1 - BR.EVAP;
      for (let i = due.length - 1; i >= 0; i--)
        if (due[i][0] <= t) {
          tau[due[i][1]] += 1;
          due.splice(i, 1);
        }
      const w0 = (BR.K + tau[0]) ** 2;
      const w1 = (BR.K + tau[1]) ** 2;
      const b = r() < w0 / (w0 + w1) ? 0 : 1;
      picks.push(b);
      due.push([t + len[b], b]);
      tu.push(tau[0]);
      tl.push(tau[1]);
    }
    return { picks, tu, tl, len, seed };
  }
  const upShare = (picks) => picks.filter((b) => b === 0).length / picks.length;
  const outcome = (sim) => {
    const f = upShare(sim.picks.slice(-40));
    return f >= 0.8 ? "up" : f <= 0.2 ? "down" : "split";
  };
  const rolling = (picks, k = 10) => picks.map((_, i) => 100 * upShare(picks.slice(Math.max(0, i - k + 1), i + 1)));
  const tally = (longLen, n, from = 1) => {
    const t = { up: 0, down: 0, split: 0 };
    for (let s = from; s < from + n; s++) t[outcome(bridgeSim(s, longLen))]++;
    return t;
  };
  const firstLand = (sim, b) => {
    const land = sim.picks.flatMap((x, k) => (x === b ? [k + sim.len[b]] : []));
    return land.length ? Math.min(...land) : null;
  };
  /** the state of a colony at continuous tick time T */
  function bridgeAt(sim, T) {
    const t = clamp(T, 0, BR.TICKS - 1);
    const k = Math.floor(t);
    const f = t - k;
    const tauOf = (arr) => (k === 0 ? arr[0] : arr[k - 1] + (arr[k] - arr[k - 1]) * clamp(f / 0.3));
    const ants = [];
    const landed = [];
    const n = [0, 0];
    for (let i = 0; i <= k; i++) {
      const b = sim.picks[i];
      n[b]++;
      const age = t - (i + sim.len[b]);
      if (age < 0) ants.push({ b, s: (t - i) / sim.len[b], i });
      else if (age < 1) landed.push({ b, age });
    }
    const last = sim.picks.slice(Math.max(0, k - 9), k + 1);
    return { tauU: tauOf(sim.tu), tauL: tauOf(sim.tl), ants, landed, n, share: 100 * upShare(last), t };
  }
  const EQ = { up: bridgeSim(77, BR.SHORT), down: bridgeSim(58, BR.SHORT) };
  const SH = bridgeSim(71, BR.LONG);
  const SHT = tally(BR.LONG, 200);
  same("equal colony 1 outcome", outcome(EQ.up), "up");
  same("equal colony 2 outcome", outcome(EQ.down), "down");
  same(
    "first 20 ants upper (colonies 1, 2)",
    [upShare(EQ.up.picks.slice(0, 20)), upShare(EQ.down.picks.slice(0, 20))],
    [0.5, 0.45],
  );
  const shareAt = (sim, ts) => ts.map((T) => Math.round(bridgeAt(sim, T).share));
  same(
    "share on the upper branch at T 10, 30, 60, 76 (colony 1)",
    shareAt(EQ.up, [10, 30, 60, 76]),
    [50, 90, 100, 100],
  );
  same("share on the upper branch at T 10, 30, 60, 76 (colony 2)", shareAt(EQ.down, [10, 30, 60, 76]), [30, 20, 10, 0]);
  same("short-branch colony outcome", outcome(SH), "up");
  same("first ants of the short-branch colony (0 goes long, 1 short)", SH.picks.slice(0, 2), [1, 0]);
  same("first deposit lands (short, long)", [firstLand(SH, 0), firstLand(SH, 1)], [6, 10]);
  same("share on the short branch at T 10, 20, 30, 40, 60", shareAt(SH, [10, 20, 30, 40, 60]), [70, 80, 90, 100, 100]);
  close("trails of the short-branch colony at T 60", bridgeAt(SH, 60).tauU, 37.9, 0.1);
  close("trails of the short-branch colony at T 60 (long)", bridgeAt(SH, 60).tauL, 4.8, 0.1);
  same("200 colonies, 5 against 10", SHT, { up: 170, down: 20, split: 10 });
  if (!(bridgeAt(SH, 8).tauU > 0.5 && bridgeAt(SH, 8).tauL === 0))
    throw new Error("VID.l7: at tick 8 only the short branch holds pheromone");

  // ---------- 3. a trail builds up and fades ----------
  const trailSeries = (ants, rho, steps, stop = Infinity) => {
    const out = [0];
    for (let t = 1; t <= steps; t++) out.push(out[t - 1] * (1 - rho) + (t <= stop ? ants : 0));
    return out;
  };
  const TRAIL = { rho: 0.2, ants: { a: 4, b: 2 }, stop: 30, steps: 50 };
  Object.assign(TRAIL, {
    a: trailSeries(4, TRAIL.rho, TRAIL.steps, TRAIL.stop),
    b: trailSeries(2, TRAIL.rho, TRAIL.steps, TRAIL.stop),
    eq: { a: 4 / TRAIL.rho, b: 2 / TRAIL.rho },
  });
  TRAIL.chance = {
    a: Math.round((100 * TRAIL.a[TRAIL.stop]) / (TRAIL.a[TRAIL.stop] + TRAIL.b[TRAIL.stop])),
    b: Math.round((100 * TRAIL.b[TRAIL.stop]) / (TRAIL.a[TRAIL.stop] + TRAIL.b[TRAIL.stop])),
  };
  function trailAt(T) {
    const t = clamp(T, 0, TRAIL.steps);
    const k = Math.floor(t);
    const f = t - k;
    const lerp = (s) => s[k] + ((s[Math.min(k + 1, TRAIL.steps)] - s[k]) * f || 0);
    const running = k >= 1 && k <= TRAIL.stop;
    const loss = (s) => (k >= 1 ? TRAIL.rho * s[k - 1] : 0);
    return {
      step: k,
      a: lerp(TRAIL.a),
      b: lerp(TRAIL.b),
      gainA: running ? TRAIL.ants.a : 0,
      gainB: running ? TRAIL.ants.b : 0,
      lossA: loss(TRAIL.a),
      lossB: loss(TRAIL.b),
      running,
    };
  }
  close("trail A settles at ants / evaporation", TRAIL.a[TRAIL.stop], 20, 0.1);
  close("trail B settles at ants / evaporation", TRAIL.b[TRAIL.stop], 10, 0.1);
  same("equilibrium levels", [TRAIL.eq.a, TRAIL.eq.b], [20, 10]);
  same("chance of picking A / B", [TRAIL.chance.a, TRAIL.chance.b], [67, 33]);
  close("gain balances loss at step 30 (A)", trailAt(30).lossA, trailAt(30).gainA, 0.05);
  close("gain balances loss at step 30 (B)", trailAt(30).lossB, trailAt(30).gainB, 0.05);
  close("trail A has faded by step 50", TRAIL.a[50], 0.23, 0.01);

  // ---------- 4. the four-town round ----------
  const ek = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const MAP = {
    names: "ABCD",
    roads: ["A-B", "A-C", "A-D", "B-C", "B-D", "C-D"],
    dist: { "A-B": 3, "A-C": 4, "A-D": 5, "B-C": 6, "B-D": 3, "C-D": 4 },
    tau0: { "A-B": 24, "A-C": 40, "A-D": 10, "B-C": 30, "B-D": 20, "C-D": 10 },
    rho: 0.5,
    Q: 72,
  };
  const dd = (a, b) => MAP.dist[ek(a, b)];
  const edgesOf = (path) => path.map((c, i) => ek(c, path[(i + 1) % path.length]));
  const tourLen = (path) => sum(edgesOf(path).map((e) => MAP.dist[e]));
  const tourName = (path) => {
    const i = path.indexOf("A");
    const r = path.slice(i).concat(path.slice(0, i));
    return (r[1] > r[r.length - 1] ? [r[0], ...r.slice(1).reverse()] : r).join("-");
  };
  const trailOn = (tau, path) => sum(edgesOf(path).map((e) => tau[e]));
  const options = (tau, cur, visited) => {
    const free = [...MAP.names].filter((x) => !visited.includes(x));
    const w = free.map((x) => tau[ek(cur, x)] / dd(cur, x));
    const s = sum(w);
    return free.map((x, i) => ({ town: x, w: w[i], p: w[i] / s }));
  };
  function buildTour(tau, rnd, start) {
    const path = [start];
    while (path.length < MAP.names.length) {
      const opts = options(tau, path[path.length - 1], path);
      let u = rnd();
      let k = 0;
      while (k < opts.length - 1 && u >= opts[k].p) u -= opts[k++].p;
      path.push(opts[k].town);
    }
    return path;
  }
  /** one ant of the lesson: build a tour, evaporate every road, deposit Q / length on each road of the tour (changes tau) */
  function sendAnt(tau, rnd, rho, Q, start) {
    const path = buildTour(tau, rnd, start || MAP.names[Math.floor(rnd() * MAP.names.length)]);
    const len = tourLen(path);
    Object.keys(tau).forEach((e) => (tau[e] *= 1 - rho));
    edgesOf(path).forEach((e) => (tau[e] += Q / len));
    return { path, len };
  }
  const tourPaths = [
    ["A", "B", "C", "D"],
    ["A", "B", "D", "C"],
    ["A", "C", "B", "D"],
  ];
  MAP.tours = tourPaths.map((path) => ({ name: tourName(path), path, len: tourLen(path), edges: edgesOf(path) }));
  same(
    "the three tours",
    MAP.tours.map((t) => [t.name, t.len]),
    [
      ["A-B-C-D", 18],
      ["A-B-D-C", 14],
      ["A-C-B-D", 18],
    ],
  );

  // the one-ant walkthrough
  const WALK = (() => {
    const tour = ["A", "C", "B", "D"];
    const steps = [];
    for (let i = 0; i < 3; i++) {
      const cur = tour[i];
      const visited = tour.slice(0, i + 1);
      const opts = options(MAP.tau0, cur, visited).map((o) => ({
        ...o,
        road: ek(cur, o.town),
        tau: MAP.tau0[ek(cur, o.town)],
        d: dd(cur, o.town),
        pct: Math.round(o.p * 100),
      }));
      const pick = tour[i + 1];
      const chosen = opts.find((o) => o.town === pick);
      steps.push({ cur, visited, opts, pick, pickRoad: chosen.road, pickPct: chosen.pct });
    }
    return {
      tour,
      len: tourLen(tour),
      hops: tour.map((c, i) => dd(c, tour[(i + 1) % 4])),
      steps,
      home: { from: "D", to: "A", road: "A-D", d: 5 },
    };
  })();
  same("story tour length and hops", [WALK.len, WALK.hops], [18, [4, 6, 3, 5]]);
  same(
    "step 1 weights",
    WALK.steps[0].opts.map((o) => [o.town, o.tau, o.d, o.w, o.pct]),
    [
      ["B", 24, 3, 8, 40],
      ["C", 40, 4, 10, 50],
      ["D", 10, 5, 2, 10],
    ],
  );
  same(
    "step 2 weights",
    WALK.steps[1].opts.map((o) => [o.town, o.tau, o.d, o.w, o.pct]),
    [
      ["B", 30, 6, 5, 67],
      ["D", 10, 4, 2.5, 33],
    ],
  );
  same(
    "step 3 is forced",
    WALK.steps[2].opts.map((o) => [o.town, o.pct]),
    [["D", 100]],
  );
  same(
    "picks",
    WALK.steps.map((s) => s.pick),
    ["C", "B", "D"],
  );

  // evaporate, then deposit
  const UPDATE = (() => {
    const len = WALK.len;
    const dep = MAP.Q / len;
    const tourRoads = edgesOf(WALK.tour);
    const roads = {};
    MAP.roads.forEach((k) => {
      const start = MAP.tau0[k];
      const evap = start * (1 - MAP.rho);
      const add = tourRoads.includes(k) ? dep : 0;
      roads[k] = { start, evap, add, after: evap + add };
    });
    return { rho: MAP.rho, Q: MAP.Q, len, dep, tourRoads, roads };
  })();
  same("deposit per road", UPDATE.dep, 4);
  same(
    "after evaporation",
    MAP.roads.map((k) => UPDATE.roads[k].evap),
    [12, 20, 5, 15, 10, 5],
  );
  same(
    "after the deposit",
    MAP.roads.map((k) => UPDATE.roads[k].after),
    [12, 24, 9, 19, 14, 5],
  );

  // 24 ants, one after another
  const RUN = (() => {
    const tau = { ...MAP.tau0 };
    const r = rng(59);
    const trailOf = (t) => MAP.tours.map((x) => trailOn(t, x.path));
    const leaderOf = (trail) => MAP.tours[trail.indexOf(Math.max(...trail))].name;
    const start = { tau: { ...tau }, trail: trailOf(tau), leader: leaderOf(trailOf(tau)) };
    const ants = [];
    for (let k = 1; k <= 24; k++) {
      const { path, len } = sendAnt(tau, r, MAP.rho, MAP.Q);
      const trail = trailOf(tau);
      ants.push({
        k,
        start: path[0],
        path: path.join(""),
        tour: tourName(path),
        len,
        edges: edgesOf(path),
        tau: { ...tau },
        trail: trail.map((v) => Math.round(v)),
        leader: leaderOf(trail),
      });
    }
    const firstShort = ants.findIndex((a) => a.leader === "A-B-D-C") + 1;
    return {
      tours: MAP.tours.map((t) => t.name),
      lens: MAP.tours.map((t) => t.len),
      short: "A-B-D-C",
      start,
      ants,
      firstShort,
      dep: { short: Math.round((10 * MAP.Q) / 14) / 10, long: MAP.Q / 18 },
    };
  })();
  same("the random start favours a long tour", [RUN.start.trail, RUN.start.leader], [[74, 94, 100], "A-C-B-D"]);
  same(
    "ants 1 to 6 walk (length)",
    RUN.ants.slice(0, 6).map((a) => a.len),
    [18, 18, 18, 18, 18, 14],
  );
  same(
    "ants 1 to 6 walk (tour)",
    RUN.ants.slice(0, 6).map((a) => a.tour),
    ["A-C-B-D", "A-C-B-D", "A-B-C-D", "A-C-B-D", "A-C-B-D", "A-B-D-C"],
  );
  same("the 14-tour takes the lead at ant", RUN.firstShort, 6);
  same(
    "it never loses the lead again",
    RUN.ants.slice(5).every((a) => a.leader === "A-B-D-C"),
    true,
  );
  same("trails after 24 ants", RUN.ants[23].trail, [21, 41, 21]);
  same("deposit per road: short and long tour", [RUN.dep.short, RUN.dep.long], [5.1, 4]);

  Object.assign(L7, {
    same,
    close,
    rng,
    sum,
    majority,
    VOTE,
    BR,
    bridgeSim,
    upShare,
    outcome,
    rolling,
    tally,
    firstLand,
    bridgeAt,
    EQ,
    SH,
    SHT,
    trailSeries,
    TRAIL,
    trailAt,
    MAP,
    ek,
    dd,
    edgesOf,
    tourLen,
    tourName,
    trailOn,
    options,
    sendAnt,
    WALK,
    UPDATE,
    RUN,
  });
})();

/* Lecture 8 · The Ant System: pure data, part 2 (VID.l8): the ten-village colony, the three update rules and the print-shop
   schedule. Needs l8/common.js first. No DOM. Every storyboard number is asserted at load (L8.same throws on a mismatch).
   The code is a faithful port of js/content/nic/l8-01.js (colony) and l8-03.js (scheduling), so the video shows what the
   lessons' demos show for the same seeds.

   5. THE TEN VILLAGES  L8.TEN = {names: "ABCDEFGHIJ", xy: [[48,62], ...] (a 460 x 270 map), n: 10, d(i, j) km, len(tour) km,
        opt: the shortest possible round = 114.478 km (Held-Karp)}
        L8.colony(seed, P, rounds) -> S {tau (10 x 10), best {len, tour}, hist: [one record per round]}
          P = {ants: 10, alpha: 1, beta: 3, rho: 0.5, Q: 100, mode: "all" | "rank" | "best"} (mode = who deposits)
          hist[i] = {best: km so far, bestTour: [town indices], mean: the ants' average tour (km), tours: [[indices]], lens: [km],
                     onBest: how many of this round's ants walked the best round (same loop, either way round),
                     share: share of all trail that sits on the best round (0..1), tau: copy of the 10 x 10 trails AFTER the round}
        L8.SNOW = L8.colony(1, {ants: 10, alpha: 2, beta: 2, rho: 0.5, Q: 100, mode: "all"}, 14)  (the snowball scene)
          round 1: best 132.98 km (CJHBAIGFED), ants' average 161.2 km, 1 of 10 ants on the best round, share 40% (40.4);
          round 2: the colony finds JIGFEDCBAH (115.13 km, 0.65 km above the shortest) and keeps it;
          round 4: average 121.3, 4 of 10 on it, share 75%;  round 7: 6 of 10, 86%;  round 10: average 115.1, 10 of 10, 96%;
          round 14: share 100% (99.6). Names of towns: L8.TEN.names[i]. L8.tenTau(round, a, b) = trail between town indices
          a and b after round `round` (0 = uniform 1, before the first round).
   6. WHO DEPOSITS  L8.WHO = {lens: [48, 52, 55, 60, 71, 80] (six ants' tour lengths, km, shortest first),
          rules: [{id: "all", name: "all ants", n: 6}, {id: "rank", name: "best 3", n: 3}, {id: "best", name: "best ant", n: 1}]}
        L8.VAR = [{id, share, stuck}] over 40 runs (seeds 1..40) of 20 rounds with 10 ants, alpha 1, beta 1 (a harder set-up), for
          each rule: share = mean trail share on the best round (0..1) and stuck = runs whose best round is still over 116 km:
          all 53% and 3 of 40, rank (best 3) 90% and 5 of 40, best (best 1) 97% and 17 of 40.
   7. THE PRINT SHOP  L8.JOBS = {B: {name: "Banner", dur: 30, due: 100}, L: {Leaflets, 30, 20}, P: {Posters, 30, 50},
          T: {Tickets, 30, 80}, W: {Wraps, 50, 30}};  L8.JOB_IDS = "BLPTW" letters; L8.evalOrder("WLPTB") -> {rows: [{j, start, end,
          due, late}], avg, max};  L8.SCHED_TAU (trails on the construction graph: S = Start, then job letters)
        L8.SCHED = the lesson 8.5 ant (rng 2, alpha = beta = 1, eta = 100 / due): {order: "WLPTB", steps: [{at: "S" | job, J: [..],
          w, p, u, to}], eval}; picks W first (47%, although L is due sooner), then L, P, T, B; ends 50, 80, 110, 140, 170;
          late 20, 60, 60, 60, 70; average lateness 54, maximum 70.
        L8.EDD = evalOrder("LWPTB") (earliest due first): average 50, maximum 70. */
(function () {
  const V = window.VID;
  const L8 = V.l8;
  const { same, score, shares, pick } = L8;

  // ---------- 5. the ten villages ----------
  const TEN = (L8.TEN = {
    names: "ABCDEFGHIJ",
    xy: "48,62 150,34 262,56 388,44 414,160 318,244 190,218 62,190 238,140 130,120"
      .split(" ")
      .map((t) => t.split(",").map(Number)),
    n: 10,
  });
  const n = TEN.n;
  const D = TEN.xy.map((a) => TEN.xy.map((b) => Math.hypot(a[0] - b[0], a[1] - b[1]) / 10));
  TEN.d = (i, j) => D[i][j];
  TEN.len = (t) => t.reduce((s, c, i) => s + D[c][t[(i + 1) % t.length]], 0);
  TEN.opt = (() => {
    // Held-Karp: the exact shortest round
    const dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
    dp[1][0] = 0;
    for (let m = 1; m < 1 << n; m++)
      for (let i = 0; i < n; i++) {
        if (!(m & (1 << i)) || dp[m][i] === Infinity) continue;
        for (let j = 0; j < n; j++)
          if (!(m & (1 << j))) dp[m | (1 << j)][j] = Math.min(dp[m | (1 << j)][j], dp[m][i] + D[i][j]);
      }
    return Math.min(...dp[(1 << n) - 1].map((v, i) => v + D[i][0]));
  })();
  same(TEN.opt.toFixed(1), "114.5", "TEN.opt");

  const probs = (tau, i, vis, al, be) => {
    const w = D[i].map((d, j) => (vis.has(j) || j === i ? 0 : Math.pow(tau[i][j], al) * Math.pow(1 / d, be)));
    return shares(w);
  };
  function buildTour(S, start, P) {
    const t = [start];
    const vis = new Set(t);
    while (t.length < n) {
      const p = probs(S.tau, t[t.length - 1], vis, P.alpha, P.beta);
      const u = S.r();
      let c = 0;
      let j = 0;
      for (; j < n; j++) {
        c += p[j];
        if (u < c && p[j] > 0) break;
      }
      if (j >= n) j = p.findIndex((x) => x > 0);
      t.push(j);
      vis.add(j);
    }
    return t;
  }
  /** The loop as a canonical string (starts at town 0, smaller neighbour first): two walks of the same round compare equal. */
  const canon = (t) => {
    const k = t.indexOf(0);
    const a = [...t.slice(k), ...t.slice(0, k)];
    const b = [a[0], ...a.slice(1).reverse()];
    return (a[1] < b[1] ? a : b).join(",");
  };
  const share = (S) => {
    let on = 0;
    let all = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all += S.tau[i][j];
    S.best.tour.forEach((c, i) => (on += S.tau[c][S.best.tour[(i + 1) % n]]));
    return on / all;
  };
  function iterate(S, P) {
    const tours = Array.from({ length: P.ants }, () => buildTour(S, Math.floor(S.r() * n), P));
    const lens = tours.map(TEN.len);
    const rank = [...tours.keys()].sort((a, b) => lens[a] - lens[b]);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) S.tau[i][j] = Math.max(0.01, S.tau[i][j] * (1 - P.rho));
    const who = P.mode === "all" ? rank : rank.slice(0, P.mode === "rank" ? 3 : 1);
    who.forEach((k) =>
      tours[k].forEach((c, i) => {
        const d = tours[k][(i + 1) % n];
        S.tau[c][d] += P.Q / lens[k];
        S.tau[d][c] += P.Q / lens[k];
      }),
    );
    if (!S.best || lens[rank[0]] < S.best.len - 1e-9) S.best = { len: lens[rank[0]], tour: tours[rank[0]] };
    const bc = canon(S.best.tour);
    S.hist.push({
      best: S.best.len,
      bestTour: S.best.tour,
      mean: lens.reduce((a, b) => a + b, 0) / lens.length,
      tours,
      lens,
      onBest: tours.filter((t) => canon(t) === bc).length,
      share: share(S),
      tau: S.tau.map((row) => [...row]),
    });
  }
  L8.colony = (seed, P, rounds) => {
    const S = { r: L8.rng(seed), tau: Array.from({ length: n }, () => Array(n).fill(1)), best: null, hist: [] };
    for (let i = 0; i < rounds; i++) iterate(S, P);
    return S;
  };
  const DEF = { ants: 10, alpha: 1, beta: 3, rho: 0.5, Q: 100, mode: "all" };

  L8.SNOW = L8.colony(1, { ...DEF, alpha: 2, beta: 2 }, 14);
  L8.tenTau = (round, a, b) => (round < 1 ? 1 : L8.SNOW.hist[round - 1].tau[a][b]);
  {
    const h = L8.SNOW.hist;
    same(h[0].best.toFixed(2), "132.98", "SNOW round 1 best");
    same(h[0].mean.toFixed(1), "161.2", "SNOW round 1 average");
    same(h[0].onBest, 1, "SNOW round 1 ants on best");
    same(L8.pct(h[0].share), 40, "SNOW round 1 share %");
    same(h[1].best.toFixed(2), "115.13", "SNOW round 2 best");
    same(h[1].bestTour.map((c) => TEN.names[c]).join(""), "JIGFEDCBAH", "SNOW best round");
    same(h[3].mean.toFixed(1), "121.3", "SNOW round 4 average");
    same(h[3].onBest, 4, "SNOW round 4 ants on best");
    same(L8.pct(h[3].share), 75, "SNOW round 4 share %");
    same(h[6].onBest, 6, "SNOW round 7 ants on best");
    same(L8.pct(h[6].share), 86, "SNOW round 7 share %");
    same(h[9].mean.toFixed(1), "115.1", "SNOW round 10 average");
    same(h[9].onBest, 10, "SNOW round 10 ants on best");
    same(L8.pct(h[9].share), 96, "SNOW round 10 share %");
    same(L8.pct(h[13].share), 100, "SNOW round 14 share %");
  }

  // ---------- 6. who deposits ----------
  L8.WHO = {
    lens: [48, 52, 55, 60, 71, 80],
    rules: [
      { id: "all", name: "all ants", n: 6 },
      { id: "rank", name: "best 3", n: 3 },
      { id: "best", name: "best ant", n: 1 },
    ],
  };
  L8.VAR = L8.WHO.rules.map(({ id }) => {
    const runs = Array.from({ length: 40 }, (_, s) => L8.colony(s + 1, { ...DEF, beta: 1, mode: id }, 20));
    return {
      id,
      share: runs.reduce((a, S) => a + share(S), 0) / runs.length,
      stuck: runs.filter((S) => S.best.len > 116).length,
    };
  });
  same(
    L8.VAR.map((v) => L8.pct(v.share)),
    [53, 90, 97],
    "VAR trail share %",
  );
  same(
    L8.VAR.map((v) => v.stuck),
    [3, 5, 17],
    "VAR stuck runs of 40",
  );

  // ---------- 7. the print shop ----------
  const JOBS = (L8.JOBS = {
    B: { name: "Banner", dur: 30, due: 100 },
    L: { name: "Leaflets", dur: 30, due: 20 },
    P: { name: "Posters", dur: 30, due: 50 },
    T: { name: "Tickets", dur: 30, due: 80 },
    W: { name: "Wraps", dur: 50, due: 30 },
  });
  L8.JOB_IDS = "BLPTW";
  L8.evalOrder = (order) => {
    let t = 0;
    const rows = [...order].map((j) => {
      const start = t;
      t += JOBS[j].dur;
      return { j, start, end: t, due: JOBS[j].due, late: Math.max(0, t - JOBS[j].due) };
    });
    return { rows, avg: rows.reduce((a, r) => a + r.late, 0) / rows.length, max: Math.max(...rows.map((r) => r.late)) };
  };
  L8.SCHED_TAU = {
    S: { B: 1, L: 1, P: 2, T: 1, W: 3 },
    B: { L: 1, P: 1, T: 2, W: 1 },
    L: { B: 1, P: 3, T: 1, W: 2 },
    P: { B: 1, L: 1, T: 3, W: 1 },
    T: { B: 3, L: 1, P: 1, W: 1 },
    W: { B: 1, L: 2, P: 2, T: 1 },
  };
  L8.SCHED = (() => {
    const r = L8.rng(2);
    let cur = "S";
    const order = [];
    const steps = [];
    while (order.length < 5) {
      const J = [...L8.JOB_IDS].filter((j) => !order.includes(j));
      const w = J.map((j) => score(L8.SCHED_TAU[cur][j], JOBS[j].due / 100, 1, 1));
      const p = shares(w);
      const u = r();
      const to = J[pick(p, u)];
      steps.push({ at: cur, J, w, p, u, to });
      order.push(to);
      cur = to;
    }
    return { order: order.join(""), steps, eval: L8.evalOrder(order) };
  })();
  same(L8.SCHED.order, "WLPTB", "SCHED order");
  same(L8.pct(L8.SCHED.steps[0].p[L8.SCHED.steps[0].J.indexOf("W")]), 47, "SCHED first pick W %");
  same(L8.SCHED.steps[0].J.join(""), "BLPTW", "SCHED step 0 J");
  same(L8.SCHED.steps[4].J.join(""), "B", "SCHED last step J");
  same(
    L8.SCHED.eval.rows.map((r) => r.end),
    [50, 80, 110, 140, 170],
    "SCHED finish times",
  );
  same(
    L8.SCHED.eval.rows.map((r) => r.late),
    [20, 60, 60, 60, 70],
    "SCHED lateness",
  );
  same(L8.SCHED.eval.avg, 54, "SCHED average lateness");
  same(L8.SCHED.eval.max, 70, "SCHED maximum lateness");
  L8.EDD = L8.evalOrder("LWPTB");
  same(L8.EDD.avg, 50, "EDD average lateness");
  same(L8.EDD.max, 70, "EDD maximum lateness");
})();

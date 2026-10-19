/* Lecture 8 · The Ant System: pure data and algorithms (VID.l8, short name L8). NO DOM in this file or in common-2.js. The
   real rules of js/content/nic/l8-01.js to l8-03.js are run here on the lecture's own example data, and every number the
   storyboard (videos/_plan/lecture-8.json) quotes is ASSERTED when the page loads: a wrong figure throws a clear Error.
   Scenes only look values up. All of it is deterministic (seeded rng, never Math.random).

   TOOLS
     L8.rng(seed) -> () => 0..1 (the lessons' mulberry32);  L8.pct(p) = Math.round(100 p)
     L8.same(got, want, what)   throws unless equal (numbers within 1e-9, arrays element by element, strings ===)
     L8.close(got, want, eps, what)   numbers within eps
     L8.score(tau, d, alpha, beta) = tau^alpha * (1/d)^beta     L8.shares(scores) -> probabilities (sum 1)
     L8.pick(p, u) -> index of the roulette slice u in 0..1 lands in (slice i covers the cumulative share up to p[i])

   1. THE FIVE VILLAGES  L8.FIVE (lesson 8.1's map: P Q R S T)
        ids ["P","Q","R","S","T"]; xy {P:[60,70], Q:[190,36], R:[330,70], S:[296,206], T:[104,200]} (a 400 x 250 map);
        d(a, b) distance in km (P-Q 13, P-R 27, P-S 27, P-T 14, Q-R 14, Q-S 20, Q-T 19, R-S 14, R-T 26, S-T 19);
        key(a, b) = "P-Q" (ids sorted);  edges = the 10 pairs [a, b];  tau = the lesson's trails {"P-Q": 3, "S-T": 4, "R-S": 2,
        "P-T": 2, the other six 1}.
        L8.antTour(ids, d, tauOf, start, alpha, beta, r) -> {tour: "TPQRS", steps: [{at, tabu: [..visited], J: [..allowed],
          w: [scores], p: [shares], u: the random draw, to}], legs: [km of each hop incl. the way home], len}
        L8.ONE = one ant from T with the lesson's trails, alpha 1, beta 2, rng(8) (the lesson 8.1 run):
          tour "TPQRS" (the loop T P Q R S T), legs [14, 13, 14, 14, 19], len 74 km, quality Q/L = 100/74 = 1.35;
          steps[0] = at T, tabu [T], J [P, Q, R, S], p = 40%, 11%, 6%, 43%, draw 0.156 -> P; steps[3] has J [S] (p 100%).
        L8.LOOP = three ants, two rounds, uniform trails 1, alpha 1, beta 2, rho 0.5, Q 100, seed 90 (the video's loop scene):
          LOOP.iters[i] = {starts: "PSQ", ants: [{tour, steps, legs, len}], before: {key: tau}, after: {key: tau}, used: {key: ants}}
          round 1: starts P, S, Q; tours PQRST (74 km), SRPTQ (94 km), QTPSR (88 km); round 2 starts T, P, S.
          after = (1 - rho) * before + sum of Q/len over the ants that used the edge (key via FIVE.key). After round 1: P-T and
          R-S (used by all three ants) 4.05, Q-R 2.99, Q-T 2.70, P-Q and S-T 1.85, P-R and Q-S 1.56, P-S 1.64, R-T (nobody) 0.50.
          used[key] = how many ants walked that road (either way). Round 2 starts from round 1's `after`.
   2. ONE CHOICE  L8.HUB (lesson 8.2's worked example, alpha = beta = 1) and the roulette
        HUB.rows = [{name, d, tau, eta (1/d), score (tau * eta; 0 when tabu), tabu, p}] for Ash (2 km, trail 1), Birch (4, 4),
        Cedar (5, 5) and Dale (3, 6, TABU: visited already; it would have scored 2). HUB.total = 2.5; p = 0.2, 0.4, 0.4, 0.
        HUB.draws = [{u: 0.31, to: "Birch"}, {u: 0.08, to: "Ash"}] (u printed with two decimals; slices Ash 0-0.2, Birch 0.2-0.6, Cedar 0.6-1)
   3. THE DIALS  L8.COURIER (lesson 8.2's explorer: villages Kell 2 km trail 1, Marl 4/2, Pell 5/3, Rudd 8/6, Sowe 10/9)
        L8.dials(alpha, beta) -> {w, p}; L8.SETS = {balanced: [1, 1], greedy: [0, 3], trail: [3, 0]}; L8.DIAL = {balanced, greedy,
        trail}: each {alpha, beta, w, p}. balanced p = 15%, 15%, 18%, 23%, 28% (they do not sum to exactly 100 when rounded:
        label only one row); greedy (alpha 0, beta 3): Kell 82%; trail (alpha 3, beta 0): Sowe 74%.
   4. THE UPDATE  L8.LEDGER = {tau: 4, rho: 0.5, Q: 100, lens: [25, 50, 100], evap: 2, lost: 2, deps: [4, 2, 1], delta: 7, next: 9}
        L8.nextTau(tau, rho, deposits[]) = (1 - rho) tau + sum.
   (The ten-village colony, the three update rules and the print-shop schedule are in common-2.js.) */
(function () {
  const V = window.VID;
  const L8 = (V.l8 = V.l8 || {});

  // ---------- tools ----------
  L8.rng = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  L8.pct = (p) => Math.round(p * 100);
  const show = (v) => (Array.isArray(v) ? `[${v.join(", ")}]` : String(v));
  const same = (got, want, what = "value") => {
    const ok = (a, b) =>
      Array.isArray(a) && Array.isArray(b)
        ? a.length === b.length && a.every((x, i) => ok(x, b[i]))
        : typeof a === "number" && typeof b === "number"
          ? Math.abs(a - b) < 1e-9
          : a === b;
    if (!ok(got, want)) throw new Error(`VID.l8: ${what}: got ${show(got)}, the storyboard says ${show(want)}`);
    return got;
  };
  L8.same = same;
  L8.close = (got, want, eps, what = "value") => {
    if (!(Math.abs(got - want) <= eps)) throw new Error(`VID.l8: ${what}: got ${got}, expected ${want} (+-${eps})`);
    return got;
  };
  const score = (tau, d, alpha, beta) => Math.pow(tau, alpha) * Math.pow(1 / d, beta);
  const shares = (w) => {
    const s = w.reduce((a, b) => a + b, 0);
    return w.map((x) => (s ? x / s : 0));
  };
  const pick = (p, u) => {
    let c = 0;
    for (let i = 0; i < p.length - 1; i++) {
      c += p[i];
      if (u < c) return i;
    }
    return p.length - 1;
  };
  Object.assign(L8, { score, shares, pick });

  // ---------- 1. the five villages ----------
  const FIVE = (L8.FIVE = {
    ids: ["P", "Q", "R", "S", "T"],
    xy: { P: [60, 70], Q: [190, 36], R: [330, 70], S: [296, 206], T: [104, 200] },
    tau: { "P-Q": 3, "Q-R": 1, "R-S": 2, "S-T": 4, "P-T": 2, "P-R": 1, "P-S": 1, "Q-S": 1, "Q-T": 1, "R-T": 1 },
  });
  FIVE.key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  FIVE.d = (a, b) => Math.round(Math.hypot(FIVE.xy[a][0] - FIVE.xy[b][0], FIVE.xy[a][1] - FIVE.xy[b][1]) / 10);
  FIVE.edges = FIVE.ids.flatMap((a, i) => FIVE.ids.slice(i + 1).map((b) => [a, b]));

  /** One ant builds a tour with the transition rule: one random draw per step (the lessons' draw order). */
  function antTour(ids, d, tauOf, start, alpha, beta, r) {
    const tour = [start];
    const steps = [];
    while (tour.length < ids.length) {
      const at = tour[tour.length - 1];
      const J = ids.filter((x) => !tour.includes(x));
      const w = J.map((j) => score(tauOf(at, j), d(at, j), alpha, beta));
      const p = shares(w);
      const u = r();
      const to = J[pick(p, u)];
      steps.push({ at, tabu: [...tour], J, w, p, u, to });
      tour.push(to);
    }
    const legs = tour.map((c, i) => d(c, tour[(i + 1) % tour.length]));
    return { tour: tour.join(""), steps, legs, len: legs.reduce((a, b) => a + b, 0) };
  }
  L8.antTour = antTour;
  const fiveTau = (tau) => (a, b) => tau[FIVE.key(a, b)];
  const edgesOf = (tour) => [...tour].map((c, i) => FIVE.key(c, tour[(i + 1) % tour.length]));

  L8.ONE = antTour(FIVE.ids, FIVE.d, fiveTau(FIVE.tau), "T", 1, 2, L8.rng(8));
  L8.ONE.quality = 100 / L8.ONE.len;
  same(L8.ONE.tour, "TPQRS", "ONE.tour");
  same(L8.ONE.legs, [14, 13, 14, 14, 19], "ONE.legs");
  same(L8.ONE.len, 74, "ONE.len");
  same(L8.ONE.steps[0].J.join(""), "PQRS", "ONE step 0 J");
  same(L8.ONE.steps[0].p.map(L8.pct), [40, 11, 6, 43], "ONE step 0 probabilities in %");
  same(L8.ONE.steps[3].J.join(""), "S", "ONE step 3 J");

  function loopFive(seed, nAnts, rounds, P) {
    const r = L8.rng(seed);
    let tau = Object.fromEntries(FIVE.edges.map(([a, b]) => [FIVE.key(a, b), 1]));
    const iters = [];
    for (let it = 0; it < rounds; it++) {
      const before = { ...tau };
      const ants = Array.from({ length: nAnts }, () => {
        const start = FIVE.ids[Math.floor(r() * FIVE.ids.length)];
        return antTour(FIVE.ids, FIVE.d, fiveTau(before), start, P.alpha, P.beta, r);
      });
      const used = {};
      const after = Object.fromEntries(Object.entries(before).map(([k, v]) => [k, v * (1 - P.rho)]));
      ants.forEach((ant) =>
        edgesOf(ant.tour).forEach((k) => {
          used[k] = (used[k] || 0) + 1;
          after[k] += P.Q / ant.len;
        }),
      );
      iters.push({ starts: ants.map((a) => a.tour[0]).join(""), ants, before, after, used });
      tau = after;
    }
    return { P, iters };
  }
  L8.LOOP = loopFive(90, 3, 2, { alpha: 1, beta: 2, rho: 0.5, Q: 100 });
  {
    const it = L8.LOOP.iters;
    same(it[0].starts, "PSQ", "LOOP round 1 starts");
    same(
      it[0].ants.map((a) => a.tour),
      ["PQRST", "SRPTQ", "QTPSR"],
      "LOOP round 1 tours",
    );
    same(
      it[0].ants.map((a) => a.len),
      [74, 94, 88],
      "LOOP round 1 lengths",
    );
    same(it[1].starts, "TPS", "LOOP round 2 starts");
    same(
      Object.keys(it[0].used)
        .filter((k) => it[0].used[k] === 3)
        .sort(),
      ["P-T", "R-S"],
      "LOOP roads used by all three ants",
    );
    same(+it[0].after["R-S"].toFixed(2), 4.05, "LOOP round 1: trail on R-S");
    same(+it[0].after["Q-R"].toFixed(2), 2.99, "LOOP round 1: trail on Q-R");
    same(+it[0].after["Q-T"].toFixed(2), 2.7, "LOOP round 1: trail on Q-T");
    same(+it[0].after["R-T"].toFixed(2), 0.5, "LOOP round 1: trail on R-T (nobody used it)");
    same(it[1].before["R-S"], it[0].after["R-S"], "LOOP: round 2 starts from round 1's trails");
  }

  // ---------- 2. one choice and the roulette ----------
  const HUB = (L8.HUB = {
    alpha: 1,
    beta: 1,
    rows: [
      { name: "Ash", d: 2, tau: 1 },
      { name: "Birch", d: 4, tau: 4 },
      { name: "Cedar", d: 5, tau: 5 },
      { name: "Dale", d: 3, tau: 6, tabu: true },
    ],
  });
  HUB.rows.forEach((row) => {
    row.eta = 1 / row.d;
    row.would = score(row.tau, row.d, HUB.alpha, HUB.beta);
    row.score = row.tabu ? 0 : row.would;
  });
  HUB.total = HUB.rows.reduce((a, b) => a + b.score, 0);
  HUB.rows.forEach((row) => (row.p = row.score / HUB.total));
  same(
    HUB.rows.map((r) => r.score),
    [0.5, 1, 1, 0],
    "HUB scores",
  );
  same(HUB.total, 2.5, "HUB total");
  same(
    HUB.rows.map((r) => r.p),
    [0.2, 0.4, 0.4, 0],
    "HUB probabilities",
  );
  same(HUB.rows[3].would, 2, "HUB: Dale would have scored");
  {
    const pHub = HUB.rows.slice(0, 3).map((r) => r.p);
    const r = L8.rng(169);
    HUB.draws = [r(), r()].map((u) => ({ u, to: HUB.rows[pick(pHub, u)].name }));
    same(
      HUB.draws.map((x) => x.to),
      ["Birch", "Ash"],
      "HUB draws land in",
    );
    same(
      HUB.draws.map((x) => x.u.toFixed(2)),
      ["0.31", "0.08"],
      "HUB draws u",
    );
  }

  // ---------- 3. the dials alpha and beta ----------
  L8.COURIER = [
    { name: "Kell", d: 2, tau: 1 },
    { name: "Marl", d: 4, tau: 2 },
    { name: "Pell", d: 5, tau: 3 },
    { name: "Rudd", d: 8, tau: 6 },
    { name: "Sowe", d: 10, tau: 9 },
  ];
  L8.dials = (alpha, beta) => {
    const w = L8.COURIER.map((c) => score(c.tau, c.d, alpha, beta));
    return { alpha, beta, w, p: shares(w) };
  };
  L8.SETS = { balanced: [1, 1], greedy: [0, 3], trail: [3, 0] };
  L8.DIAL = Object.fromEntries(Object.entries(L8.SETS).map(([k, [a, b]]) => [k, L8.dials(a, b)]));
  same(L8.DIAL.balanced.p.map(L8.pct), [15, 15, 18, 23, 28], "DIAL balanced %");
  same(L8.pct(L8.DIAL.greedy.p[0]), 82, "DIAL greedy: Kell %");
  same(L8.pct(L8.DIAL.trail.p[4]), 74, "DIAL trail: Sowe %");
  same(L8.DIAL.greedy.p.indexOf(Math.max(...L8.DIAL.greedy.p)), 0, "greedy favourite");
  same(L8.DIAL.trail.p.indexOf(Math.max(...L8.DIAL.trail.p)), 4, "trail favourite");

  // ---------- 4. the update rule ----------
  L8.nextTau = (tau, rho, deposits) => (1 - rho) * tau + deposits.reduce((a, b) => a + b, 0);
  L8.LEDGER = (({ tau, rho, Q, lens }) => {
    const evap = (1 - rho) * tau;
    const deps = lens.map((len) => Q / len);
    const delta = deps.reduce((a, b) => a + b, 0);
    return { tau, rho, Q, lens, evap, lost: tau - evap, deps, delta, next: L8.nextTau(tau, rho, deps) };
  })({ tau: 4, rho: 0.5, Q: 100, lens: [25, 50, 100] });
  same(L8.LEDGER.evap, 2, "LEDGER evaporated trail");
  same(L8.LEDGER.deps, [4, 2, 1], "LEDGER deposits");
  same(L8.LEDGER.delta, 7, "LEDGER total deposit");
  same(L8.LEDGER.next, 9, "LEDGER new trail");
})();

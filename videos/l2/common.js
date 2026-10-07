/* Lecture 2 · Why EAs: data and algorithms for this video (window.VID.l2, short name L2). No drawing here; the drawing
   helpers are in common-2.js (bars, loop strip, clock, star, tag) and common-3.js (graph, tour panel, cost card).
   Everything on screen is computed here, never typed. This file also runs under node (module.exports = L2) and checks the
   lecture's numbers at load (throws "lecture 2 data changed"); load it in node with
   `const m = {}; new Function("module", require("fs").readFileSync("videos/l2/common.js", "utf8"))(m); m.exports.selfCheck()`
   (the package is "type": "module", so plain require() does not see module.exports).

   1. OPTIMISATION (bits and fitness)
        L2.W [20, 75, 60]   L2.TARGET 100   L2.BEST "110"   L2.PX_KG 5.2 (scene 2 ruler: px per kg)
        L2.subsets() -> 8 x {bits: "110", take: [1, 1, 0], w: 95, f: 5} in binary order 000..111 (f = |w - 100|)
        L2.fitnessOf(bits) -> {bits, take, w, f}
        L2.shelf() -> [{i, kg, x, width}]   the three blocks on the shelf (x from 60, gap 20, width = kg x 5.2)
        L2.stack(bits, x0 = 60) -> {blocks: [{i, kg, x, width}], end, w, f, gap: {x, width, over}}   blocks of the taken items end
          to end from x0; gap = the red bar from the stack end to the target line (x0 + 100 x 5.2 = 580), over = true when w > 100
   2. GROWTH
        L2.pow2(n) -> 2^n (exact)   L2.DOUBLING [8, 16, 32, 64]   L2.BILLION = 2^30
        L2.designs() -> {big: 16n ** 21n, str, mant: 1.9342813113834067, exp: 25, seconds, years}  (New York Tunnels, 1e9 designs/s)
        L2.expo(n) = 1.1^n   L2.poly(n) = n^1.1   L2.crossing() -> {n: 43.5.., y: 63.4..} (where the two curves meet)
        L2.crossAt -> 43 | 44 (the integers either side:  expo < poly at 43, expo > poly at 44)
        L2.times() -> {n2: {steps: 3600, seconds, micro: 3.6}, pow2: {steps: 2^60, seconds, years: 36.5}}   (n = 60, 1e9 steps/s)
        L2.YEAR 31557600   L2.fmt(n) "1,073,741,824" (number, bigint or numeric string; decimals kept)
        L2.sup(base, exp) -> <span> base + raised <sup>   L2.sci(mant, exp) -> "1.9 x 10" + sup(25)  (mant may be a number or text)
   3. MINIMUM SPANNING TREE
        L2.G = {pos: {A: [60, 258], ...} (graph-local px), edges: [["A","B",12], ...], labelAt: {BD: 0.4, CE: 0.7}}
        L2.edge("AC") -> ["A", "C", 4]   L2.edgeKey("C", "A") -> "AC"   L2.TOWNS "ABCDE"
        L2.prim(maxDeg = 0, start = "A") -> {steps: [{cands: ["AB12", ...], candKeys: ["AB", ...], blocked: ["BC", ...] (keys),
          pick: "AC", w: 4, from: "A" (the tree end), to: "C" (the new town), total: 4, deg: {A: 1, ...}, tree: [...so far]}],
          tree: ["AC", "CD", "CE", "BE"], cost: 18, deg: {...}}      maxDeg > 0 blocks any candidate whose end has maxDeg cables
        L2.bruteTrees(maxDeg = 0) -> {count: 125, feasibleCount, best: {cost, edges}, bestCount}   L2.bestDegree2, L2.PATH "DACEB"
        L2.degrees(edgeKeys) -> {A: 1, ...}   L2.cost(edgeKeys)
   4. TSP RACE (scene 7, seeded, cached)
        L2.tspRace(seed = 16, N = 25, EV = 4000, P = 30, T = 3) -> {cities: [[cx, cy]..] (0..1 boxes), nn (order), nnLen, best[],
          snaps: [{e, len, tour}], crossAt, bestAt(e), tourAt(e), finalLen, finalTour, len(tour), crossings(tour), shorter}
          shorter = 1 - finalLen / nnLen (0.174).  L2.raceEval(t, t0 = 2.6, t1 = 10) -> evaluations at local time t (30 .. 4000)
   5. EA POPULATION (scenes 8, 9, recap)
        L2.POP (10 x {id, f})  L2.KIDS (S11 1.0, S12 0.2)  L2.PARENTS ["S5", "S9"]  L2.byId(id)  L2.mean(list) (rounded to 2 dp)
        L2.updateRules() -> {replaceAll: {kept, lost, bestLost: true}, merge: {order (12 ids), kept (10), dropped, meanAfter,
          bestKept}, weakest: {replaced: ["S1","S10"], slots (10 ids, S11 in slot 0, S12 in slot 9), meanBefore, meanAfter, bestKept}}
   6. RANDOM   L2.mulberry32(seed) -> () => [0, 1)     L2.hash(i, j) -> [0, 1)  (deterministic "randomness" for the spinning pipes) */
(function () {
  const inBrowser = typeof window !== "undefined";
  const V = inBrowser ? window.VID : null;
  const L2 = inBrowser ? ((V.l2 = V.l2 || {}), V.l2) : {};
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  // ---------- 6. random ----------
  function mulberry32(seed) {
    let a = seed;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (i, j) => mulberry32((i + 1) * 7919 + (j + 1) * 104729)();

  // ---------- 1. optimisation ----------
  const W = [20, 75, 60];
  const TARGET = 100;
  const PX_KG = 5.2;
  function fitnessOf(bits) {
    const take = [...bits].map(Number);
    const w = take.reduce((a, b, i) => a + b * W[i], 0);
    return { bits, take, w, f: Math.abs(w - TARGET) };
  }
  const subsets = () => Array.from({ length: 8 }, (_, n) => fitnessOf(n.toString(2).padStart(3, "0")));
  const shelf = () => {
    let x = 60;
    return W.map((kg, i) => {
      const b = { i, kg, x, width: kg * PX_KG };
      x += b.width + 20;
      return b;
    });
  };
  function stack(bits, x0 = 60) {
    const fit = fitnessOf(bits);
    let x = x0;
    const blocks = [];
    fit.take.forEach((t, i) => {
      if (!t) return;
      blocks.push({ i, kg: W[i], x, width: W[i] * PX_KG });
      x += W[i] * PX_KG;
    });
    const line = x0 + TARGET * PX_KG;
    const over = fit.w > TARGET;
    return { blocks, end: x, w: fit.w, f: fit.f, gap: { x: Math.min(x, line), width: Math.abs(line - x), over } };
  }

  // ---------- 2. growth ----------
  const pow2 = (n) => 2 ** n;
  const YEAR = 31557600;
  const fmt = (n) => {
    const [i, d] = String(n).split(".");
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d ? "." + d : "");
  };
  function designs() {
    const big = 16n ** 21n;
    const str = big.toString();
    const seconds = Number(big) / 1e9;
    return {
      big,
      str,
      mant: Number(str[0] + "." + str.slice(1, 17)),
      exp: str.length - 1,
      seconds,
      years: seconds / YEAR,
    };
  }
  const expo = (n) => 1.1 ** n;
  const poly = (n) => n ** 1.1;
  function crossing() {
    let [a, b] = [43, 44];
    for (let i = 0; i < 60; i++) {
      const m = (a + b) / 2;
      if (expo(m) < poly(m)) a = m;
      else b = m;
    }
    return { n: a, y: poly(a) };
  }
  const times = () => {
    const [s2, s60] = [60 ** 2, 2 ** 60];
    return {
      n2: { steps: s2, seconds: s2 / 1e9, micro: s2 / 1e3 },
      pow2: { steps: s60, seconds: s60 / 1e9, years: s60 / 1e9 / YEAR },
    };
  };
  const supStyle = { fontSize: "0.62em", lineHeight: "0", position: "relative", top: "-0.62em", marginLeft: "0.06em" };
  const sup = (base, exp) => V.h("span", {}, String(base), V.h("sup", { text: String(exp), style: supStyle }));
  const sci = (mant, exp) => V.h("span", {}, `${mant} × 10`, V.h("sup", { text: String(exp), style: supStyle }));

  // ---------- 3. minimum spanning tree ----------
  const TOWNS = "ABCDE";
  const G = {
    pos: { A: [60, 258], B: [330, 40], C: [285, 467], D: [615, 439], E: [630, 97] },
    edges: [
      ["A", "B", 12],
      ["A", "C", 4],
      ["A", "D", 6],
      ["A", "E", 9],
      ["B", "C", 7],
      ["B", "D", 8],
      ["B", "E", 3],
      ["C", "D", 5],
      ["C", "E", 6],
      ["D", "E", 14],
    ],
    labelAt: { BD: 0.4, CE: 0.7 },
  };
  const edgeKey = (a, b) => (a < b ? a + b : b + a);
  const edge = (key) => {
    const e = G.edges.find((q) => q[0] + q[1] === key);
    if (!e) throw new Error(`VID.l2.edge: no cable "${key}"`);
    return e;
  };
  const cost = (keys) => keys.reduce((a, k) => a + edge(k)[2], 0);
  const degrees = (keys) => {
    const d = Object.fromEntries([...TOWNS].map((t) => [t, 0]));
    keys.forEach((k) => [...k].forEach((t) => d[t]++));
    return d;
  };
  function prim(maxDeg = 0, start = "A") {
    const inTree = new Set([start]);
    const tree = [];
    const steps = [];
    for (let n = 1; n < TOWNS.length; n++) {
      const deg = degrees(tree);
      const cands = G.edges.filter((e) => inTree.has(e[0]) !== inTree.has(e[1]));
      const blocked = cands.filter((e) => maxDeg > 0 && (deg[e[0]] >= maxDeg || deg[e[1]] >= maxDeg));
      const ok = cands.filter((e) => !blocked.includes(e));
      if (!ok.length) break;
      const pick = ok.reduce((a, b) => (b[2] < a[2] ? b : a));
      const [from, to] = inTree.has(pick[0]) ? [pick[0], pick[1]] : [pick[1], pick[0]];
      inTree.add(to);
      tree.push(pick[0] + pick[1]);
      steps.push({
        cands: cands.map((e) => e[0] + e[1] + e[2]),
        candKeys: cands.map((e) => e[0] + e[1]),
        blocked: blocked.map((e) => e[0] + e[1]),
        pick: pick[0] + pick[1],
        w: pick[2],
        from,
        to,
        total: cost(tree),
        deg: degrees(tree),
        tree: tree.slice(),
      });
    }
    return { steps, tree, cost: cost(tree), deg: degrees(tree) };
  }
  function isTree(keys) {
    const root = Object.fromEntries([...TOWNS].map((t) => [t, t]));
    const find = (t) => (root[t] === t ? t : (root[t] = find(root[t])));
    for (const k of keys) {
      const [a, b] = [find(k[0]), find(k[1])];
      if (a === b) return false;
      root[a] = b;
    }
    return true;
  }
  function bruteTrees(maxDeg = 0) {
    const all = G.edges.map((e) => e[0] + e[1]);
    let count = 0;
    let feasibleCount = 0;
    let best = null;
    let bestCount = 0;
    for (let m = 0; m < 1 << all.length; m++) {
      const keys = all.filter((_, i) => m & (1 << i));
      if (keys.length !== TOWNS.length - 1 || !isTree(keys)) continue;
      count++;
      if (maxDeg > 0 && Math.max(...Object.values(degrees(keys))) > maxDeg) continue;
      feasibleCount++;
      const c = cost(keys);
      if (!best || c < best.cost) [best, bestCount] = [{ cost: c, edges: keys }, 1];
      else if (c === best.cost) bestCount++;
    }
    return { count, feasibleCount, best, bestCount };
  }

  // ---------- 4. TSP race ----------
  const raceCache = {};
  function tspRace(seed = 16, N = 25, EV = 4000, P = 30, T = 3) {
    const key = [seed, N, EV, P, T].join();
    if (raceCache[key]) return raceCache[key];
    const r = mulberry32(seed);
    const ri = (n) => Math.floor(r() * n);
    const cities = Array.from({ length: N }, () => [0.05 + r() * 0.9, 0.08 + r() * 0.84]);
    const d = (a, b) => Math.hypot(cities[a][0] - cities[b][0], cities[a][1] - cities[b][1]);
    const len = (t) => t.reduce((s, c, i) => s + d(c, t[(i + 1) % N]), 0);
    const nn = [0];
    const left = new Set(Array.from({ length: N - 1 }, (_, i) => i + 1));
    while (left.size) {
      const c = nn[nn.length - 1];
      let b = null;
      for (const x of left) if (b === null || d(c, x) < d(c, b)) b = x;
      nn.push(b);
      left.delete(b);
    }
    const pop = Array.from({ length: P }, () => {
      const a = Array.from({ length: N }, (_, i) => i);
      for (let i = N - 1; i > 0; i--) {
        const j = ri(i + 1);
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
    const fits = pop.map(len);
    const best = [];
    const snaps = [];
    const note = (e) => {
      const bi = fits.indexOf(Math.min(...fits));
      best.push(fits[bi]);
      if (!snaps.length || fits[bi] < snaps[snaps.length - 1].len)
        snaps.push({ e, len: fits[bi], tour: pop[bi].slice() });
    };
    note(P);
    for (let e = P + 1; e <= EV; e++) {
      let b = ri(P);
      for (let k = 1; k < T; k++) {
        const c = ri(P);
        if (fits[c] < fits[b]) b = c;
      }
      const m = pop[b].slice();
      let i = ri(N);
      let j = ri(N);
      if (i > j) [i, j] = [j, i];
      m.splice(i, j - i + 1, ...m.slice(i, j + 1).reverse());
      const fm = len(m);
      let w = 0;
      for (let k = 1; k < P; k++) if (fits[k] > fits[w]) w = k;
      if (fm <= fits[w]) {
        pop[w] = m;
        fits[w] = fm;
      }
      note(e);
    }
    const nnLen = len(nn);
    const bestAt = (e) => best[clamp(Math.floor(e), P, EV) - P];
    const tourAt = (e) => {
      let s = snaps[0];
      for (const q of snaps) if (q.e <= e) s = q;
      return s.tour;
    };
    const ccw = (a, b, c) => (c[1] - a[1]) * (b[0] - a[0]) - (b[1] - a[1]) * (c[0] - a[0]);
    const crossings = (t) => {
      let n = 0;
      for (let i = 0; i < N; i++)
        for (let j = i + 2; j < N; j++) {
          if (i === 0 && j === N - 1) continue;
          const [a, b, c, e] = [cities[t[i]], cities[t[i + 1]], cities[t[j]], cities[t[(j + 1) % N]]];
          if (ccw(a, b, c) * ccw(a, b, e) < 0 && ccw(c, e, a) * ccw(c, e, b) < 0) n++;
        }
      return n;
    };
    const finalLen = best[best.length - 1];
    const crossAt = P + best.findIndex((l) => l < nnLen);
    return (raceCache[key] = {
      cities,
      nn,
      nnLen,
      best,
      snaps,
      crossAt,
      bestAt,
      tourAt,
      finalLen,
      finalTour: snaps[snaps.length - 1].tour,
      len,
      crossings,
      shorter: 1 - finalLen / nnLen,
    });
  }
  const raceEval = (t, t0 = 2.6, t1 = 10) => 30 + 3970 * clamp((t - t0) / (t1 - t0));

  // ---------- 5. EA population ----------
  const POP = [0.1, 0.5, 0.3, 0.2, 0.9, 0.7, 0.3, 0.4, 0.4, 0.1].map((f, i) => ({ id: `S${i + 1}`, f }));
  const KIDS = [
    { id: "S11", f: 1.0 },
    { id: "S12", f: 0.2 },
  ];
  const PARENTS = ["S5", "S9"];
  const byId = (id) => POP.concat(KIDS).find((q) => q.id === id);
  const mean = (list) => Math.round((list.reduce((a, q) => a + q.f, 0) / list.length) * 100) / 100;
  function updateRules() {
    const all = POP.concat(KIDS);
    const order = all
      .slice()
      .sort((a, b) => b.f - a.f)
      .map((q) => q.id);
    const kept = order.slice(0, 10);
    const bestOld = POP.reduce((a, b) => (b.f > a.f ? b : a)).id;
    const lowest = POP.map((q, i) => ({ id: q.id, f: q.f, i }))
      .sort((a, b) => a.f - b.f || a.i - b.i)
      .slice(0, 2)
      .map((q) => q.id);
    const slots = POP.map((q) => q.id);
    lowest.forEach((id, n) => (slots[slots.indexOf(id)] = KIDS[n].id));
    return {
      replaceAll: { kept: KIDS.map((q) => q.id), lost: POP.map((q) => q.id), bestLost: true, bestOld },
      merge: {
        order,
        kept,
        dropped: order.slice(10),
        meanAfter: mean(kept.map(byId)),
        bestKept: kept.includes(bestOld),
      },
      weakest: {
        replaced: lowest,
        slots,
        meanBefore: mean(POP),
        meanAfter: mean(slots.map(byId)),
        bestKept: slots.includes(bestOld),
      },
    };
  }

  Object.assign(L2, {
    mulberry32,
    hash,
    W,
    TARGET,
    PX_KG,
    BEST: "110",
    subsets,
    fitnessOf,
    shelf,
    stack,
    pow2,
    DOUBLING: [8, 16, 32, 64],
    BILLION: 2 ** 30,
    YEAR,
    fmt,
    designs,
    expo,
    poly,
    crossing,
    crossAt: 43,
    times,
    sup,
    sci,
    TOWNS,
    G,
    edge,
    edgeKey,
    cost,
    degrees,
    prim,
    bruteTrees,
    bestDegree2: bruteTrees(2).best,
    PATH: "DACEB",
    tspRace,
    raceEval,
    POP,
    KIDS,
    PARENTS,
    byId,
    mean,
    updateRules,
  });

  function selfCheck() {
    const bad = (m) => {
      throw new Error("lecture 2 data changed: " + m);
    };
    const eq = (a, b, m) =>
      JSON.stringify(a) === JSON.stringify(b) || bad(`${m}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
    const s = subsets();
    eq(s.reduce((a, b) => (b.f < a.f ? b : a)).bits, "110", "best subset");
    eq(
      s.map((q) => q.f),
      [100, 40, 25, 35, 80, 20, 5, 55],
      "fitness list",
    );
    eq(
      s.map((q) => q.w),
      [0, 60, 75, 135, 20, 80, 95, 155],
      "weights",
    );
    (expo(43) < poly(43) && expo(44) > poly(44)) || bad("exp vs poly crossing");
    eq(
      [expo(10), poly(10), expo(60), poly(60)].map((v) => v.toFixed(2)),
      ["2.59", "12.59", "304.48", "90.36"],
      "growth",
    );
    eq(designs().str, "19342813113834066795298816", "16^21");
    Math.abs(designs().years / 1e8 - 6.13) < 0.01 || bad("years 6.13e8");
    eq(+times().pow2.years.toFixed(1), 36.5, "36.5 years");
    eq(times().n2.micro, 3.6, "3.6 microseconds");
    const p0 = prim(0);
    eq([p0.tree, p0.cost], [["AC", "CD", "CE", "BE"], 18], "prim");
    eq(
      p0.steps.map((q) => q.total),
      [4, 9, 15, 18],
      "prim totals",
    );
    const p2 = prim(2);
    eq([p2.tree, p2.cost], [["AC", "CD", "BD", "BE"], 20], "prim limited");
    eq(p2.steps[2].blocked, ["BC", "CE"], "blocked step 3");
    eq(p2.steps[3].blocked, ["CE", "DE"], "blocked step 4");
    eq(degrees(p0.tree), { A: 1, B: 1, C: 3, D: 1, E: 2 }, "degrees of the optimum");
    const b0 = bruteTrees(0);
    eq([b0.count, b0.best.cost], [125, 18], "all trees");
    const b2 = bruteTrees(2);
    eq(
      [b2.feasibleCount, b2.best.cost, b2.bestCount, b2.best.edges],
      [60, 19, 1, ["AC", "AD", "BE", "CE"]],
      "feasible trees",
    );
    const u = updateRules();
    eq(u.merge.dropped, ["S1", "S10"], "merge dropped");
    u.merge.kept.includes("S12") || bad("S12 kept");
    eq(u.merge.order.slice(0, 4), ["S11", "S5", "S6", "S2"], "merge order");
    eq([u.merge.meanAfter, u.weakest.meanBefore, u.weakest.meanAfter], [0.49, 0.39, 0.49], "means");
    eq(u.weakest.replaced, ["S1", "S10"], "weakest");
    const r = tspRace(16);
    eq(
      [
        r.nnLen.toFixed(3),
        r.crossAt,
        r.finalLen.toFixed(3),
        r.snaps.length,
        r.bestAt(30).toFixed(3),
        r.bestAt(1000).toFixed(3),
      ],
      ["4.314", 1949, "3.563", 44, "9.065", "4.987"],
      "tsp race",
    );
    eq(
      [r.bestAt(100).toFixed(3), r.bestAt(300).toFixed(3), r.bestAt(3000).toFixed(3)],
      ["8.403", "5.836", "3.756"],
      "race curve",
    );
    eq(+(r.shorter * 100).toFixed(1), 17.4, "17.4 % shorter");
    return { ok: true, nnCrossings: r.crossings(r.nn), finalCrossings: r.crossings(r.finalTour) };
  }
  L2.selfCheck = selfCheck;
  selfCheck();
  // eslint-disable-next-line no-undef
  if (typeof module !== "undefined") module.exports = L2;
})();

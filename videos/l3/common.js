/* Lecture 3 · Local vs population search: pure data and algorithms (no DOM). window.VID.l3, short name L3.
   Three files: this one (data, seeded algorithms, self-check), common-2.js (landscape panel + markers) and common-3.js
   (map, distance matrix, chips, tags, stickers). All three are loaded by videos/lecture-3.html before the scenes.
   Everything here is deterministic: same arguments, same answer, on every render. Run `node videos/l3/common.js` to check (in Node: `await import("./videos/l3/common.js")`, then globalThis.VID.l3).
   Scene rule: call the algorithms ONCE at build time (outside update), keep the log, look things up by time in update(t).

   ───────────────────────────── 1. TSP (cities A-E) ─────────────────────────────
     L3.CITIES "ABCDE"     L3.D[a][b] distance (AB 5, AC 7, AD 4, AE 15, BC 3, BD 4, BE 10, CD 2, CE 7, DE 9)
     L3.POS {A:[90,190], B:[215,70], C:[345,150], D:[220,250], E:[470,270]}   the lecture's map layout (560 x 320 reference)
     L3.len(tour) -> number          length including the way home;  L3.len("ABDEC") = 32,  L3.len("ABCED") = 28
     L3.hops(tour) -> [5,4,9,7,7]    the n hop lengths (last = the way home);  L3.cum(tour) -> [5,9,18,25,32] running totals
     L3.swapAdj(tour, i)             swap positions i and (i+1) mod n (0-based; i = n-1 is the wrap-around swap)
     L3.neighbours(tour)             the n results of swapAdj, i = 0..n-1;  neighbours("EABDC") = AEBDC,EBADC,EADBC,EABCD,CABDE
     L3.TOURS12 [{tour, len}]        the 12 distinct tours (start A, a loop and its reverse count once), by length then name
     L3.nTours(k) -> "12" | "60,822,550,204,416,000"     (k-1)!/2 with thousands commas (BigInt, exact)
     L3.digits(str) -> number of digits in a count string ("2,520" -> 4)

   ───────────────────────────── 2. STRINGS ───────────────────────────────────────
     L3.ones("10110") = 3   L3.flip("00110", 0) = "10110"   L3.cut(a, b, k) = a.slice(0,k) + b.slice(k)
     L3.rng(seed) -> () => [0,1)   mulberry32. Never use Math.random.
     L3.pick(list, rnd) one element;   L3.clamp(x, a, b)

   ───────────────────────────── 3. LANDSCAPES (40-point grid, index i = 0..39, x = i / 39) ─────────
     L3.N = 40;  L3.FN = { multi, uni, plateau, deceptive }   functions of x in [0, 1]
     L3.fvals(kind) -> 40 numbers (cached; do not modify)     kind: "multi" | "uni" | "plateau" | "deceptive"
     L3.bestOf(f) -> index of the global best      L3.hillOf(f, i) -> index of the hilltop reached by walking uphill from i
     L3.peaks(f) -> indices of all local tops      "multi": peaks 7 (0.65), 18 (0.79), 29 (1.094 = best), valleys near 12 and 23-24

   ───────────────────────────── 4. SEARCH LOGS (look them up by time) ─────────────────────────
     L3.hc(f, {start, seed, tries = 26, r = 2})
        -> {path: [start, ...accepted positions], tries: [{k, c, m, ok}]}      k = 1.., c = position before, m = proposal
        per try: dir = rng() < 0.5 ? -1 : 1; mag = 1 + floor(rng() * r); m = clamp(c + dir * mag); accept when f[m] >= f[c] and m != c
     L3.hcSteps(f, start, offsets) -> {path, tries}   same, with explicit offsets.  hcSteps(f, 4, [1,1,1,1,-1]): path 4,5,6,7,
        tries 5 ok, 6 ok, 7 ok, 8 rejected, 6 rejected
     L3.mc(f, {start, seed, tries, r = 3, p = 0.1})
        -> [{k, from, m, worse, u (null unless worse), acc, down (accepted a worse step), c (after), best (best-so-far index)}]
        draw order per try: dir, mag, then u only when worse; a worse proposal is accepted when u < p
     L3.dieFace(entry, p = 0.1) -> 1..6   die face for a worse proposal: 1 when accepted, else 2 + floor((u - p) / (1 - p) * 5)
     L3.tabu(f, {start, r = 3, tenure = 5, steps = 15})
        -> [{k, from, cands: [{i, tabu}] (best first), pick, down, list (visited list after the move), dropped (index that
           fell out of the list, or null), best}]
        candidates = i-r..i+r except i, inside the grid, sorted by f descending (ties: lower index first); pick = first one not
        in the list of the last `tenure` visited positions (the list starts as [start] and includes the current position)
     L3.ea(f, {pop: [indices], seed, steps, r = 3})
        -> [{k, a, b (random member slots), parentSlot, parentAt, child, worstSlot, old (index of the member at that slot),
           replaced, pop (indices after the step, slot order kept), before (before the step), hills (distinct hilltops occupied)}]
        steady state: tournament of two (strictly fitter wins, else the first), child = parent +- 1..r, it replaces the first
        member with the lowest f when f(child) >= f(that member)
     L3.hills(f, pop) -> number of distinct hilltops the members stand on

   ───────────────────────────── 5. TIMING HELPERS ────────────────────────────────────────
     L3.stepAt(t, t0, dt, n) -> {n: steps started so far (0..n), i: index of the step in progress or last, k: 0..1 progress of
        step i, done: steps completed}      for "one step every dt seconds from t0"
     L3.count(a, b, k) -> integer between a and b (rounded)   for counting numbers up
     L3.selfCheck() -> true or throws; it already ran once when this file loaded. */
(function () {
  /* global process */
  const root = typeof window !== "undefined" ? window : globalThis; // in Node: await import("./videos/l3/common.js"), then globalThis.VID.l3
  const L3 = ((root.VID = root.VID || {}).l3 = root.VID.l3 || {});

  const CITIES = "ABCDE";
  const D = {
    A: { B: 5, C: 7, D: 4, E: 15 },
    B: { A: 5, C: 3, D: 4, E: 10 },
    C: { A: 7, B: 3, D: 2, E: 7 },
    D: { A: 4, B: 4, C: 2, E: 9 },
    E: { A: 15, B: 10, C: 7, D: 9 },
  };
  const POS = { A: [90, 190], B: [215, 70], C: [345, 150], D: [220, 250], E: [470, 270] };
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const N = 40;

  // ---------- TSP ----------
  const hops = (t) => [...t].map((c, i) => D[c][t[(i + 1) % t.length]]);
  const len = (t) => hops(t).reduce((s, v) => s + v, 0);
  const cum = (t) => hops(t).reduce((a, v) => (a.push((a.length ? a[a.length - 1] : 0) + v), a), []);
  const swapAdj = (t, i) => {
    const n = t.length;
    const [a, b] = [i % n, (i + 1) % n];
    const s = [...t];
    [s[a], s[b]] = [s[b], s[a]];
    return s.join("");
  };
  const neighbours = (t) => [...t].map((_, i) => swapAdj(t, i));
  const permutations = (s) =>
    s.length <= 1 ? [s] : [...s].flatMap((c, i) => permutations(s.slice(0, i) + s.slice(i + 1)).map((p) => c + p));
  const TOURS12 = permutations("BCDE")
    .map((p) => "A" + p)
    .filter((t) => t <= "A" + [...t.slice(1)].reverse().join(""))
    .map((tour) => ({ tour, len: len(tour) }))
    .sort((a, b) => a.len - b.len || (a.tour < b.tour ? -1 : 1));
  const commas = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const nTours = (k) => {
    let f = 1n;
    for (let i = 2n; i <= BigInt(k - 1); i++) f *= i;
    return commas(String(f / 2n));
  };
  const digits = (s) => String(s).replace(/\D/g, "").length;

  // ---------- strings, randomness ----------
  const ones = (s) => [...s].filter((c) => c === "1").length;
  const flip = (s, i) => s.slice(0, i) + (s[i] === "1" ? "0" : "1") + s.slice(i + 1);
  const cut = (a, b, k) => a.slice(0, k) + b.slice(k);
  const rng = (a) => () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (list, rnd) => list[Math.floor(rnd() * list.length)];

  // ---------- landscapes ----------
  const bump = (x, c, s, a) => a * Math.exp(-((x - c) * (x - c)) / (2 * s * s));
  const FN = {
    multi: (x) => 0.1 + bump(x, 0.18, 0.06, 0.55) + bump(x, 0.45, 0.07, 0.7) + bump(x, 0.75, 0.06, 1.0),
    uni: (x) => bump(x, 0.55, 0.2, 1),
    plateau: (x) => (x < 0.6 ? 0.3 : 0.3 + bump(x, 0.8, 0.06, 0.7)),
    deceptive: (x) => (x < 0.85 ? 0.8 * (1 - x / 0.85) + 0.05 : 0.05 + (x - 0.85) / 0.15),
  };
  const cache = {};
  const fvals = (kind) => {
    if (!FN[kind]) throw new Error(`VID.l3.fvals: unknown landscape "${kind}"`);
    return (cache[kind] = cache[kind] || Array.from({ length: N }, (_, i) => FN[kind](i / (N - 1))));
  };
  const bestOf = (f) => f.reduce((b, v, i) => (v > f[b] ? i : b), 0);
  const hillOf = (f, i) => {
    for (;;) {
      const nb = [i - 1, i + 1].filter((j) => j >= 0 && j < f.length && f[j] > f[i]);
      if (!nb.length) return i;
      i = nb.reduce((b, j) => (f[j] > f[b] ? j : b));
    }
  };
  const peaks = (f) => f.map((_, i) => i).filter((i) => (i === 0 || f[i] > f[i - 1]) && (i === N - 1 || f[i] > f[i + 1]));
  const hills = (f, pop) => new Set(pop.map((i) => hillOf(f, i))).size;

  // ---------- search logs ----------
  const hcSteps = (f, start, offsets) => {
    const path = [start];
    const tries = [];
    let c = start;
    offsets.forEach((o, k) => {
      const m = clamp(c + o, 0, N - 1);
      const ok = m !== c && f[m] >= f[c];
      tries.push({ k: k + 1, c, m, ok });
      if (ok) path.push((c = m));
    });
    return { path, tries };
  };
  const hc = (f, { start, seed = 1, tries = 26, r = 2 }) => {
    const rnd = rng(seed);
    const offs = Array.from({ length: tries }, () => {
      const dir = rnd() < 0.5 ? -1 : 1;
      return dir * (1 + Math.floor(rnd() * r));
    });
    return hcSteps(f, start, offs);
  };
  const mc = (f, { start, seed = 1, tries = 26, r = 3, p = 0.1 }) => {
    const rnd = rng(seed);
    let [c, best] = [start, start];
    return Array.from({ length: tries }, (_, k) => {
      const from = c;
      const dir = rnd() < 0.5 ? -1 : 1;
      const m = clamp(c + dir * (1 + Math.floor(rnd() * r)), 0, N - 1);
      const worse = f[m] < f[c];
      const u = worse ? rnd() : null;
      const acc = worse ? u < p : true;
      if (acc) c = m;
      if (f[c] > f[best]) best = c;
      return { k: k + 1, from, m, worse, u, acc, down: worse && acc, c, best };
    });
  };
  const dieFace = (e, p = 0.1) => (e.acc ? 1 : 2 + Math.floor(((e.u - p) / (1 - p)) * 5));
  const tabu = (f, { start, r = 3, tenure = 5, steps = 15 }) => {
    let [cur, best, list] = [start, start, [start]];
    return Array.from({ length: steps }, (_, k) => {
      const cands = [];
      for (let i = Math.max(0, cur - r); i <= Math.min(N - 1, cur + r); i++) if (i !== cur) cands.push(i);
      cands.sort((a, b) => f[b] - f[a] || a - b);
      const rows = cands.map((i) => ({ i, tabu: list.includes(i) }));
      const chosen = rows.find((q) => !q.tabu);
      const pickI = chosen ? chosen.i : cands[0];
      const from = cur;
      list = [...list, pickI];
      const dropped = list.length > tenure ? list[0] : null;
      list = list.slice(-tenure);
      cur = pickI;
      if (f[cur] > f[best]) best = cur;
      return { k: k + 1, from, cands: rows, pick: pickI, down: f[pickI] < f[from], list: [...list], dropped, best };
    });
  };
  const ea = (f, { pop, seed = 1, steps = 10, r = 3 }) => {
    const rnd = rng(seed);
    let cur = [...pop];
    return Array.from({ length: steps }, (_, k) => {
      const before = [...cur];
      const a = Math.floor(rnd() * cur.length);
      const b = Math.floor(rnd() * cur.length);
      const parentSlot = f[cur[b]] > f[cur[a]] ? b : a;
      const dir = rnd() < 0.5 ? -1 : 1;
      const child = clamp(cur[parentSlot] + dir * (1 + Math.floor(rnd() * r)), 0, N - 1);
      const worstSlot = cur.reduce((w, v, i) => (f[v] < f[cur[w]] ? i : w), 0);
      const old = cur[worstSlot];
      const replaced = f[child] >= f[old];
      if (replaced) cur[worstSlot] = child;
      return {
        k: k + 1,
        a,
        b,
        parentSlot,
        parentAt: before[parentSlot],
        child,
        worstSlot,
        old,
        replaced,
        pop: [...cur],
        before,
        hills: hills(f, cur),
      };
    });
  };

  // ---------- timing ----------
  const stepAt = (t, t0, dt, n) => {
    const q = (t - t0) / dt;
    const started = clamp(Math.floor(q) + 1, 0, n);
    const i = Math.max(0, started - 1);
    return { n: started, i, k: started === 0 ? 0 : clamp(q - i), done: clamp(Math.floor(q), 0, n) };
  };
  const count = (a, b, k) => Math.round(a + (b - a) * clamp(k));

  Object.assign(L3, {
    CITIES, D, POS, N, FN, TOURS12,
    len, hops, cum, swapAdj, neighbours, nTours, digits,
    ones, flip, cut, rng, pick, clamp,
    fvals, bestOf, hillOf, peaks, hills,
    hc, hcSteps, mc, dieFace, tabu, ea,
    stepAt, count,
  });

  // ---------- self-check: every number the scene specs quote ----------
  const same = (a, b, what) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`VID.l3 selfCheck: ${what}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
  };
  L3.selfCheck = () => {
    same([len("ABDEC"), len("ABCED"), len("ABCDE"), len("ACBDE")], [32, 28, 34, 38], "tour lengths");
    same(hops("ABDEC"), [5, 4, 9, 7, 7], "hops ABDEC");
    same(cum("ABCED"), [5, 8, 15, 24, 28], "running total ABCED");
    same(neighbours("EABDC"), ["AEBDC", "EBADC", "EADBC", "EABCD", "CABDE"], "neighbours EABDC");
    same(neighbours("00110".replace(/./g, "A")).length, 5, "neighbour count");
    same([...Array(5)].map((_, i) => flip("00110", i)), ["10110", "01110", "00010", "00100", "00111"], "bit flips");
    same(TOURS12.map((q) => `${q.tour} ${q.len}`).join(),
      "ABCED 28,ABECD 28,ABDEC 32,ACEBD 32,ABDCE 33,ABEDC 33,ACBED 33,ADBCE 33,ABCDE 34,ADCBE 34,ACBDE 38,ACDBE 38", "12 tours");
    same([5, 6, 7, 8, 10, 20].map(nTours), ["12", "60", "360", "2,520", "181,440", "60,822,550,204,416,000"], "tour counts");
    same([swapAdj("ABDEC", 2), swapAdj("ABDEC", 4), swapAdj("ABDEC", 0), swapAdj("BADEC", 3)], ["ABEDC", "CBDEA", "BADEC", "BADCE"], "HC trace swaps");
    same([ones("10110"), ones("00100"), ones("01011"), ones("10001"), ones("11011")], [3, 1, 3, 2, 4], "OneMax");
    same([cut("10110", "01011", 2), flip(cut("10110", "01011", 2), 1)], ["10011", "11011"], "crossover and mutation");
    const m = fvals("multi");
    same(peaks(m), [7, 18, 29], "multi peaks");
    same([m[7], m[18], m[29]].map((v) => +v.toFixed(2)), [0.65, 0.79, 1.09], "multi heights");
    same(bestOf(m), 29, "multi best");
    same([bestOf(fvals("uni")), bestOf(fvals("plateau")), bestOf(fvals("deceptive"))], [21, 31, 39], "best of each shape");
    const h6 = hcSteps(m, 4, [1, 1, 1, 1, -1]);
    same([h6.path, h6.tries.map((q) => q.ok)], [[4, 5, 6, 7], [true, true, true, false, false]], "scene 6 hill climb");
    same(hc(fvals("uni"), { start: 3, seed: 2, tries: 26, r: 2 }).path, [3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 19, 20, 21], "uni path");
    same(hc(m, { start: 13, seed: 6, tries: 26, r: 2 }).path, [13, 14, 15, 16, 17, 18], "multi path");
    same(hc(fvals("plateau"), { start: 9, seed: 3, tries: 26, r: 2 }).path.slice(0, 15), [9, 10, 9, 10, 9, 7, 6, 7, 9, 7, 5, 7, 8, 9, 11], "plateau path");
    same(hc(fvals("deceptive"), { start: 20, seed: 1, tries: 26, r: 2 }).path, [20, 18, 17, 16, 15, 14, 12, 11, 10, 9, 7, 6, 5, 3, 2, 0], "deceptive path");
    const mcl = mc(m, { start: 7, seed: 435858, tries: 26, r: 3, p: 0.1 });
    same(mcl.slice(0, 10).map((e) => e.m), [10, 8, 5, 9, 4, 6, 9, 5, 10, 4], "MC first ten proposals");
    same(mcl.slice(0, 10).every((e) => !e.acc), true, "MC first ten rejected");
    same(mcl.filter((e) => e.down).map((e) => [e.k, e.m]), [[11, 10], [13, 13], [19, 19], [21, 22]], "MC downhill moves");
    same(mcl[25].c, 29, "MC ends on the star");
    same([...new Set(mcl.map((e) => e.best))], [7, 16, 19, 17, 29], "MC best so far");
    same(mcl.filter((e) => e.worse && e.acc).map((e) => +e.u.toFixed(3)), [0.003, 0.039, 0.08, 0.081], "MC lucky draws");
    const tl = tabu(m, { start: 7, r: 3, tenure: 5, steps: 15 });
    same([7, ...tl.map((e) => e.pick)], [7, 8, 6, 9, 10, 13, 16, 18, 17, 19, 20, 21, 22, 25, 28, 29], "tabu path");
    same(tl[0].cands.map((c) => c.i), [8, 6, 9, 5, 10, 4], "tabu step 1 candidates");
    same(tl[1].cands.map((c) => c.i), [7, 6, 9, 5, 10, 11], "tabu step 2 candidates");
    same(tl[1].cands[0].tabu, true, "tabu step 2 first is tabu");
    same([...new Set(tl.map((e) => e.best))], [7, 16, 18, 28, 29], "tabu best so far");
    const start = [4, 10, 15, 21, 25, 33];
    same(start.map((i) => +m[i].toFixed(2)), [0.34, 0.36, 0.55, 0.42, 0.31, 0.38], "EA start fitness");
    same(start.map((i) => hillOf(m, i)), [7, 7, 18, 18, 29, 29], "EA start hills");
    const el = ea(m, { pop: start, seed: 44, steps: 10, r: 3 });
    same(el.map((e) => [e.parentAt, e.child, e.replaced]),
      [[33, 30, true], [15, 17, true], [30, 29, true], [33, 34, false], [15, 17, true], [29, 30, true], [17, 14, false], [30, 29, true], [29, 28, true], [29, 31, true]], "EA steps");
    same(el[9].pop.slice().sort((a, b) => a - b), [28, 29, 29, 30, 30, 31], "EA final population");
    same(el.map((e) => e.hills), [3, 3, 2, 2, 2, 2, 2, 2, 2, 1], "EA hills");
    return true;
  };
  L3.selfCheck();

  if (typeof process !== "undefined" && /l3[\\/]common\.js$/.test(process.argv[1] || "")) console.log("VID.l3 selfCheck ok");
})();

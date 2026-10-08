/* Algorithms Phase 1 · Foundations & PageRank (video algo-1): pure data and algorithms, no DOM. Short name A1 = VID.a1.
   Every function is deterministic. Everything below is ASSERTED against the numbers in videos/_plan/algo-1.json when this
   file loads (A1.verify), so a wrong number throws an Error naming it. Scenes only look results up; they never recompute.
   Drawing helpers: common-2.js (web, bars), common-3.js (row, grid, matrix, tag, stat, spark, icons).

   1. THE LOOP (scenes 2 and 3)
        A1.LIST = [3, 8, 1, 9, 4, 9, 2]                         the list used in both scenes
        A1.maxRun(list = A1.LIST) -> { list, answer, steps: [{ i, k, x, beat, best, maxChecked, holds }] }
            one step per item, "find the biggest": k = i + 1 items checked, x the item, beat = x > best (the first item always
            beats "none"), best = the answer so far AFTER the step, maxChecked = biggest of the first k, holds = best equals it
            (always true: that is the invariant). LIST gives best 3, 8, 8, 9, 9, 9, 9 and beat T, T, F, T, F, F, F (the second 9
            does not beat the first). A1.maxRun([]) -> { steps: [], answer: null } (the empty-list edge case: "none").
   2. LOOP GROWTH (scenes 4 and 5)
        A1.calls(kind, n) -> [{ i, j }]  the work() calls IN EXECUTION ORDER, found by really running the loops.
            kind "one" (for i: work()) gives {i, j: 0}; "tri" (for i, for j < i) j < i; "sq" (for i, for j < n).
        A1.halving(n) -> { chain: [n, n/2, ..., 1], steps }   (i <- floor(i / 2) while i > 1; steps = work() calls)
        A1.work(kind, n) -> number of calls; kind may also be "half".
        A1.COUNTS8 = { one: 8, tri: 28, sq: 64, half: 3 }        at n = 8 (scene 4 shows the first three)
        A1.DOUBLE = [{ kind, label, w0, w1, sig, cls }]           n = 8 -> 16: one 8 -> 16 "x2" O(n); sq 64 -> 256 "x4" O(n^2);
            half 3 -> 4 "+1" O(log n) (sig is "x2" / "x4" / "+1" with a real multiplication sign; cls is "O(n)", "O(n²)", "O(log n)").
        A1.TRI16 = 120   the growing inner loop at n = 16 (28 -> 120 is about x4.3), for a caption or a footnote.
   3. WEBS AND RANK (scenes 6 to 10).  A web is { names, out: {page: [pages it links to]}, dead: [pages with no links],
        pos: {page: [x, y]} (centres in a ref box), ref: [w, h], edges: [[a, b], ...] } (pos / ref are used by A1.web).
        A1.WEBS.leaky = A->B,C  B->C  C->A,D  D->nothing     (scene 6)
        A1.WEBS.trap  = X->A  A->B  B->A                      (scenes 7 and 8)
        A1.WEBS.web5  = P->Q,R  Q->R  R->P,S  S->R  T->nothing (scenes 9 and 10; T is also linked to by nobody)
        A1.shares(web, p, {repair = true}) -> [{ from, to, amt, kind: "link" | "pour" }]   what every page sends, in page order;
            a page with k links sends p/k down each; a dead end (repair) "pours" p/n to EVERY page including itself.
        A1.step(web, p, {d = 1, repair = true}) -> next vector   one round: next[q] = d * (arrived at q) + (1 - d) / n
        A1.tokens(web, {start = 25, repair = false}) -> { start, sends, got, total, lost }   one round of the token trace
            leaky, no repair: got A 12.5 B 12.5 C 37.5 D 12.5, total 75, lost 25 (D's)
            leaky, repair:    got A 18.75 B 18.75 C 43.75 D 18.75, total 100 (D pours 6.25 to each of the 4 pages)
        A1.trapRounds(n = 3) -> [{X, A, B}] rounds 0..n of tokens on the trap web (d = 1): 25/25/25, 0/50/25, 0/25/50, 0/50/25
        A1.D = 0.85                                            damping used everywhere in the video (teleport 0.15)
        A1.pagerank(web, {d = A1.D, iters = 40}) -> { p: [vector per round, p[0] uniform], delta: [max change per round, delta[0] = 0] }
        A1.stationary(web, d = A1.D) -> the settled vector
            web5: P 0.212 Q 0.126 R 0.414 S 0.212 T 0.036 (2 decimals: .21 .13 .41 .21 .04, sum 1.00);
            leaky: A 0.234 B 0.187 C 0.345 D 0.234;  trap: X 0.05 A 0.4865 B 0.4635
        A1.PR5 = pagerank(web5): rounds 1..4 (2 decimals) P/Q/R/S/T = .15 .15 .49 .15 .06 | .25 .10 .36 .25 .04 | .19 .14 .44 .19 .04 | .22 .12 .40 .22 .04
        A1.matrices(web, d = A1.D) -> { names, H, A, G, floor }  rows = TARGET page, columns = SOURCE page (H[to][from]), names order.
            H the links (a dead end's column is all 0), A = H with dead columns replaced by 1/n, G = d*A + (1 - d)/n, floor = (1 - d)/n.
            web5 at d = 0.85: floor 0.03; column P of G = [0.03, 0.455, 0.455, 0.03, 0.03]; column T = 0.2 everywhere;
            R's entries 0.88 (from Q and S); every column of H sums to 1 except T's (0); every column of A and G sums to 1.
        A1.mulVec(M, p) -> M p (rows x vector)
   4. THE SURFER (scene 8)
        A1.rng(seed)  mulberry32 (0..1).   A1.SURF = A1.surfer(trap, { seed: 5, start: "A", hops: 600 })
        A1.surfer(web, {d = A1.D, seed, start, hops}) -> { path: [{ at, kind: "start" | "link" | "teleport" }], counts: [{page: visits}] }
            path[h].at is the page after hop h; counts[h] = visits so far INCLUDING the start (share = counts[h][p] / (h + 1)).
            Per hop: u = rng(); a link when u < d and the page has links, else teleport; then one more rng() chooses the link / page.
            SURF path (first 15): A B A B A X A B A X A B A B A  (teleports at hops 5 and 9, both to X);
            after 600 hops the shares are within 0.01 of A 0.4865 B 0.4635 X 0.05.
   5. SMALL UTILITIES
        A1.fmt(v, dp = 3) -> "12.5" | "6.25" | "0.455" (trailing zeros dropped, real minus sign)   A1.pct(v) -> "49%"
        A1.near(a, b, eps = 1e-9)   A1.must(cond, message) throws Error("VID.a1: ...") */
(function () {
  const V = window.VID;
  const A1 = (V.a1 = V.a1 || {});

  const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
  const must = (cond, msg) => {
    if (!cond) throw new Error(`VID.a1: ${msg}`);
  };
  const fmt = (v, dp = 3) => String(Math.round(v * 10 ** dp) / 10 ** dp).replace("-", "−");
  const pct = (v) => `${Math.round(v * 100)}%`;
  function rng(seed) {
    let a = seed;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ================= 1. the loop =================
  const LIST = [3, 8, 1, 9, 4, 9, 2];
  function maxRun(list = LIST) {
    let best = null;
    const steps = list.map((x, i) => {
      const beat = best === null || x > best;
      if (beat) best = x;
      const maxChecked = Math.max(...list.slice(0, i + 1));
      return { i, k: i + 1, x, beat, best, maxChecked, holds: best === maxChecked };
    });
    return { list, answer: best, steps };
  }

  // ================= 2. loop growth =================
  function calls(kind, n) {
    const out = [];
    if (kind === "one") for (let i = 0; i < n; i++) out.push({ i, j: 0 });
    else if (kind === "tri") for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) out.push({ i, j });
    else if (kind === "sq") for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out.push({ i, j });
    else must(false, `calls: unknown loop kind "${kind}" (use one, tri, sq)`);
    return out;
  }
  function halving(n) {
    const chain = [n];
    let i = n;
    while (i > 1) {
      i = Math.floor(i / 2);
      chain.push(i);
    }
    return { chain, steps: chain.length - 1 };
  }
  const work = (kind, n) => (kind === "half" ? halving(n).steps : calls(kind, n).length);
  const COUNTS8 = { one: work("one", 8), tri: work("tri", 8), sq: work("sq", 8), half: work("half", 8) };
  const SIGS = {
    one: ["×2", "O(n)", "one loop"],
    sq: ["×4", "O(n²)", "nested loops"],
    half: ["+1", "O(log n)", "halving loop"],
  };
  const DOUBLE = ["one", "sq", "half"].map((kind) => {
    const [w0, w1] = [work(kind, 8), work(kind, 16)];
    return { kind, label: SIGS[kind][2], w0, w1, sig: SIGS[kind][0], cls: SIGS[kind][1] };
  }); // prettier-ignore

  // ================= 3. webs and rank =================
  const web = (names, out, pos, ref) => ({
    names,
    out,
    dead: names.filter((k) => !out[k].length),
    pos,
    ref,
    edges: names.flatMap((a) => out[a].map((b) => [a, b])),
  });
  const WEBS = {
    leaky: web(
      ["A", "B", "C", "D"],
      { A: ["B", "C"], B: ["C"], C: ["A", "D"], D: [] },
      { A: [70, 210], B: [280, 50], C: [290, 390], D: [505, 250] },
      [560, 440],
    ),
    trap: web(
      ["X", "A", "B"],
      { X: ["A"], A: ["B"], B: ["A"] },
      { X: [60, 190], A: [260, 70], B: [260, 310] },
      [440, 380],
    ),
    web5: web(
      ["P", "Q", "R", "S", "T"],
      { P: ["Q", "R"], Q: ["R"], R: ["P", "S"], S: ["R"], T: [] },
      { P: [70, 70], Q: [250, 40], R: [330, 190], S: [230, 320], T: [70, 280] },
      [440, 360],
    ),
  }; // prettier-ignore
  const uniform = (w, v = 1 / w.names.length) => Object.fromEntries(w.names.map((k) => [k, v]));
  function shares(w, p, { repair = true } = {}) {
    const n = w.names.length;
    return w.names.flatMap((a) => {
      const links = w.out[a];
      if (links.length) return links.map((b) => ({ from: a, to: b, amt: p[a] / links.length, kind: "link" }));
      return repair ? w.names.map((b) => ({ from: a, to: b, amt: p[a] / n, kind: "pour" })) : [];
    });
  }
  function step(w, p, { d = 1, repair = true } = {}) {
    const got = uniform(w, 0);
    shares(w, p, { repair }).forEach((s) => (got[s.to] += s.amt));
    return Object.fromEntries(w.names.map((k) => [k, d * got[k] + (1 - d) / w.names.length]));
  }
  function tokens(w, { start = 25, repair = false } = {}) {
    const p = uniform(w, start);
    const got = step(w, p, { repair });
    const total = Object.values(got).reduce((a, b) => a + b, 0);
    return { start, sends: shares(w, p, { repair }), got, total, lost: start * w.names.length - total };
  }
  function trapRounds(n = 3) {
    const out = [uniform(WEBS.trap, 25)];
    for (let k = 0; k < n; k++) out.push(step(WEBS.trap, out[k], { d: 1, repair: true }));
    return out;
  }
  const D = 0.85;
  function pagerank(w, { d = D, iters = 40 } = {}) {
    const p = [uniform(w)];
    const delta = [0];
    for (let k = 1; k <= iters; k++) {
      p.push(step(w, p[k - 1], { d }));
      delta.push(Math.max(...w.names.map((q) => Math.abs(p[k][q] - p[k - 1][q]))));
    }
    return { p, delta };
  }
  const stationary = (w, d = D) => pagerank(w, { d, iters: 400 }).p[400];
  function matrices(w, d = D) {
    const n = w.names.length;
    const H = w.names.map((to) => w.names.map((from) => (w.out[from].includes(to) ? 1 / w.out[from].length : 0)));
    const A = H.map((row, i) => row.map((v, j) => (w.out[w.names[j]].length ? v : 1 / n)));
    const G = A.map((row) => row.map((v) => d * v + (1 - d) / n));
    return { names: w.names, H, A, G, floor: (1 - d) / n };
  }
  const mulVec = (M, p) => M.map((row) => row.reduce((a, v, j) => a + v * p[j], 0));

  // ================= 4. the surfer =================
  function surfer(w, { d = D, seed, start, hops }) {
    const r = rng(seed);
    const path = [{ at: start, kind: "start" }];
    const cnt = uniform(w, 0);
    cnt[start]++;
    const counts = [{ ...cnt }];
    let at = start;
    for (let h = 1; h <= hops; h++) {
      const links = w.out[at];
      const u = r();
      const kind = u < d && links.length ? "link" : "teleport";
      at = kind === "link" ? links[Math.floor(r() * links.length)] : w.names[Math.floor(r() * w.names.length)];
      path.push({ at, kind });
      cnt[at]++;
      counts.push({ ...cnt });
    }
    return { path, counts };
  }

  const PR5 = pagerank(WEBS.web5);
  const SURF = surfer(WEBS.trap, { seed: 5, start: "A", hops: 600 });
  Object.assign(A1, {
    near, must, fmt, pct, rng, LIST, maxRun, calls, halving, work, COUNTS8, DOUBLE, TRI16: work("tri", 16), WEBS,
    uniform, shares, step, tokens, trapRounds, D, pagerank, stationary, matrices, mulVec, surfer, PR5, SURF,
  }); // prettier-ignore

  // ================= build-time checks: every number the specs print =================
  function verify() {
    const eq = (got, want, what, eps = 1e-9) => must(near(got, want, eps), `${what}: got ${got}, expected ${want}`);
    const list = (got, want, what, eps = 1e-9) => {
      must(got.length === want.length, `${what}: length ${got.length}, expected ${want.length}`);
      want.forEach((w, i) => eq(got[i], w, `${what}[${i}]`, eps));
    };
    // the loop
    const run = maxRun();
    list(run.steps.map((s) => s.best), [3, 8, 8, 9, 9, 9, 9], "maxRun best");
    must(run.steps.map((s) => (s.beat ? "T" : "F")).join("") === "TTFTFFF", "maxRun beat flags");
    must(run.steps.every((s) => s.holds) && run.answer === 9, "maxRun invariant / answer");
    must(maxRun([]).answer === null && maxRun([]).steps.length === 0, "maxRun([]) must be none");
    // growth
    list([COUNTS8.one, COUNTS8.tri, COUNTS8.sq, COUNTS8.half], [8, 28, 64, 3], "counts at n = 8");
    list(DOUBLE.flatMap((q) => [q.w0, q.w1]), [8, 16, 64, 256, 3, 4], "doubling counts");
    must(DOUBLE.map((q) => q.sig).join() === "×2,×4,+1", "doubling signatures");
    eq(work("tri", 16), 120, "triangle at n = 16");
    must(halving(8).chain.join() === "8,4,2,1" && halving(16).chain.join() === "16,8,4,2,1", "halving chains");
    eq(calls("tri", 8).filter((c) => c.i === 5).length, 5, "row 5 of the triangle has 5 cells");
    // token trace
    const t0 = tokens(WEBS.leaky);
    list(WEBS.leaky.names.map((k) => t0.got[k]), [12.5, 12.5, 37.5, 12.5], "tokens got");
    eq(t0.total, 75, "tokens total");
    eq(t0.lost, 25, "tokens lost");
    const t1 = tokens(WEBS.leaky, { repair: true });
    list(WEBS.leaky.names.map((k) => t1.got[k]), [18.75, 18.75, 43.75, 18.75], "repaired tokens got");
    eq(t1.total, 100, "repaired tokens total");
    eq(t1.sends.filter((s) => s.kind === "pour")[0].amt, 6.25, "a dead end pours 6.25 to each page");
    const tr = trapRounds(3);
    list(tr.flatMap((r) => [r.X, r.A, r.B]), [25, 25, 25, 0, 50, 25, 0, 25, 50, 0, 50, 25], "trap rounds");
    // PageRank
    const fin = stationary(WEBS.web5);
    list(WEBS.web5.names.map((k) => fin[k]), [0.212, 0.1262, 0.4137, 0.212, 0.0361], "web5 settled", 6e-4);
    const two = (v) => Math.round(v * 100) / 100;
    const want = [[0.15, 0.15, 0.49, 0.15, 0.06], [0.25, 0.1, 0.36, 0.25, 0.04], [0.19, 0.14, 0.44, 0.19, 0.04], [0.22, 0.12, 0.4, 0.22, 0.04]]; // prettier-ignore
    want.forEach((row, r) => list(WEBS.web5.names.map((k) => two(PR5.p[r + 1][k])), row, `PR5 round ${r + 1}`));
    eq(two(WEBS.web5.names.reduce((a, k) => a + two(fin[k]), 0)), 1, "settled values sum to 1.00 at 2 decimals");
    // the lecture's own worked step (d = 0.75, p0 = .4 .1 .2 .2 .1) proves the algorithm is the lesson's
    const lesson = step(WEBS.web5, { P: 0.4, Q: 0.1, R: 0.2, S: 0.2, T: 0.1 }, { d: 0.75 });
    list(WEBS.web5.names.map((k) => lesson[k]), [0.14, 0.215, 0.44, 0.14, 0.065], "lesson worked step");
    const lf = stationary(WEBS.leaky);
    list(WEBS.leaky.names.map((k) => lf[k]), [0.234, 0.1867, 0.3453, 0.234], "leaky settled", 6e-4);
    const tf = stationary(WEBS.trap);
    list(WEBS.trap.names.map((k) => tf[k]), [0.05, 0.4865, 0.4635], "trap settled", 1e-4);
    must(PR5.delta[10] < 1e-3 && PR5.delta[20] < 1e-6, "web5 converges quickly");
    // matrices
    const M = matrices(WEBS.web5);
    eq(M.floor, 0.03, "teleport floor");
    list(M.G.map((row) => row[0]), [0.03, 0.455, 0.455, 0.03, 0.03], "column P of G");
    list(M.G.map((row) => row[4]), [0.2, 0.2, 0.2, 0.2, 0.2], "column T of G");
    eq(M.G[2][1], 0.88, "G[R][Q]");
    list(M.names.map((_, j) => M.H.reduce((a, row) => a + row[j], 0)), [1, 1, 1, 1, 0], "column sums of H");
    list(M.names.map((_, j) => M.G.reduce((a, row) => a + row[j], 0)), [1, 1, 1, 1, 1], "column sums of G");
    list(mulVec(M.G, WEBS.web5.names.map((k) => PR5.p[0][k])), WEBS.web5.names.map((k) => PR5.p[1][k]), "G p0 = p1");
    // the surfer
    must(SURF.path.slice(0, 15).map((s) => s.at).join("") === "ABABAXABAXABABA", "surfer first 15 pages");
    must(SURF.path.map((s, h) => (s.kind === "teleport" ? h : -1)).filter((h) => h >= 0 && h < 15).join() === "5,9", "surfer teleports");
    WEBS.trap.names.forEach((k) => eq(SURF.counts[600][k] / 601, tf[k], `surfer share ${k}`, 0.01));
  } // prettier-ignore
  A1.verify = verify;
  verify();
})();

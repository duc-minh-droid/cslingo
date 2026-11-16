/* Lecture 11 · Distributed machine learning (Data Science, COM3021): the data and the algorithms every scene of this video
   shares (VID.d11, short name D11). PURE: no DOM, no Math.random, no Date. Drawing pieces are in common-2.js (timeline lanes,
   the 2-D scatter plane, the 1-D number line, packet flights); the small stickers (tags, packets, discs, chips, wires, server
   node cards) come from the lecture 4 kit VID.d4, so the page loads videos/l5/common.js and videos/d4/common*.js first.
   Everything below is computed when the page loads, by porting the lessons' own code (js/content/ds/ds-l11-*.js,
   boss-ds-11.js), and asserted against the storyboard (videos/_plan/ds-11.json): a wrong number throws an Error. Build captions
   from these values (`${D11.fm(D11.SGD.w1)}`), never type a result by hand.

   COLOUR ROLES OF THIS VIDEO (the same in every scene; D11.tone = D4.tone -> {c, ink, dim, edge, lip, on}):
     "grey"    the MACHINES themselves (server cards, mappers, the reducer), wires, axes, plain labels
     "blue"    a machine's OWN data and its own computing: the numbers it holds (3, 5, 2, 6), compute bars on a timeline, a
               worker's local gradient g_m; in the k-means scenes (8 to 11) also CLUSTER 0
     "purple"  COMMUNICATION: packets on the wires, the network / all-reduce bars on a timeline, the + (sum) hub, a pull
               request, the centres being broadcast; in scene 8 (nothing travels there) also CLUSTER 2
     "green"   the RESULT everyone wants: the sum 16 once it has landed, G on every worker, the updated w, new centres,
               "converged", the true mean, ticks
     "red"     WASTE and WRONG: dashed idle bars (a machine waiting), the wrong local-means answer 12, crosses
     "orange"  the SYNC POINT (the barrier line, A's signal in a wait) and, in the k-means scenes, CLUSTER 1

   1. PATTERNS (scenes 2 and 3, lesson 11.1).  D11.PAT = {A: 7 (what A holds for push / pull), vals: [3, 5, 2, 6] (C1..C4),
        running: [3, 8, 10, 16], sum: 16, msgs: {push: 1, pull: 2, bcast: 4, reduce: 4, all: 8},
        model: 50 (MB), copies: 4, sent: 200 (MB leaving A in the broadcast)}
   2. WAIT and BARRIER (scene 4).  D11.WAIT = {a: 9 (A computes 0..9 then signals), b: 3 (B computes 0..3), idle: 6
        (B waits 3..9), after: 1 (B goes on 9..10), T: 10, rows: [{name: "A", bars}, {name: "B", bars}]}
        D11.BAR = {arrive: [4, 6, 5, 9], open: 9, idle: [5, 3, 4, 0], total: 12, T: 10, rows: [{name: "C1", bars} ...]}
        bars are timeline bars [{a, b, kind: "work" | "comm" | "idle", text}] for D11.lanes (common-2.js).
   3. OVERLAP (scene 5).  D11.OVER = {k: 4, c: 3, m: 2, wait: {rows, end: 20, gaps}, over: {rows, end: 14}, saved: 6, T: 22 (the lanes run to 22 s so the "20 s" mark tag fits)}
        rows = [{name: "Compute", bars}, {name: "Network", bars}] (D11.overlapPlan(k, c, m, over), the lesson's code; compute
        bars are texted "1".."4" = the round, network bars "send"). wait.gaps = the compute lane's three stalls [3, 5], [8, 10],
        [13, 15] as idle bars (already appended to wait.rows[0].bars, after the four work bars).
   4. SGD (scene 6, lesson 11.2 "Watch one iteration").  Each example's gradient is w minus its target.
        D11.SGD = {M: 3, alpha: 0.5, w0: 10, Bp: 2, B: 6, batch: [[4, 6], [5, 3], [8, 4]], means: [5, 4, 6], g: [5, 6, 4],
                   G: 15, w1: 7.5, all: [4, 6, 5, 3, 8, 4], allMean: 5, gAll: 5 (= G / M: the one-machine minibatch gradient),
                   step: 2.5, iter2: {batch: [[5, 5], [6, 4], [3, 7]], g: [2.5, 2.5, 2.5], G: 7.5, w2: 6.25}}
   5. IDLE (scene 7).  D11.IDLE = {c: 3, m: 1, k: 3, workers: 4, iter: 4, busy: 0.75, pct: 75, end: 12, T: 12,
        rows: [{name: "W1", bars} .. {name: "W4", bars}, {name: "Network", bars}]} (compute 3 s, then the 1 s all-reduce:
        the workers' bars there are "idle", the Network lane is "comm")
   6. KMEANS (scene 8, lesson 11.3 "Watch it converge": 45 points, k = 3, the lesson's seeded cloud and starting centres).
        D11.KM = {pts: [[x, y] x 45] (0..1 each), start: [[x, y] x 3],
                  iters: [{t: 1..6, asg: [45 cluster indices], before: centres used to assign, after: the new centres (the
                           update step's means; equal to before on the last), moved: 45 | 3 | 7 | 12 | 2 | 0, sizes: [n0, n1, n2],
                           records: combiner records on 3 mappers of 15 points (7, 8, 9, 9, 9, 9)}],
                  moved: [45, 3, 7, 12, 2, 0], converged: 6, final: centres, pairs: 45}
        D11.KM.trail(k, i) -> the path of centre k up to (and including) iteration i's update: [[x, y] ...]
   7. MAPREDUCE (scenes 9 to 11, lesson 11.3 Map / Combine / Reduce, the 1-D example).  D11.MR =
        {mappers: [[1, 4, 8, 12], [2, 3, 14]], centres: [2, 9],
         dist: [[[1, 8], [2, 5], [6, 1], [10, 3]], [[0, 7], [1, 6], [12, 5]]] (distance of each sample to c0, c1),
         emits: [[[0, 1], [0, 4], [1, 8], [1, 12]], [[0, 2], [0, 3], [1, 14]]] (<cluster, sample> pairs), pairs: 7,
         comb: [[{k: 0, sum: 5, n: 2}, {k: 1, sum: 20, n: 2}], [{k: 0, sum: 5, n: 2}, {k: 1, sum: 14, n: 1}]], records: 4,
         red: [{k: 0, sum: 10, n: 4, c: 2.5}, {k: 1, sum: 34, n: 3, c: 11.333}], next: [2.5, 11.333],
         means: [[2.5, 10], [2.5, 14]] (the local means), wrong: 12 (averaging the means for cluster 1), truth: 11.333,
         iter2: {emits (the same pairs), next: [2.5, 11.333], same: true}}
   SMALL TOOLS.  D11.fm(v, d = 2) -> "11.33" / "7.5" / "16" (at most d decimals, real minus sign);  D11.rng(seed) -> () => 0..1
        (the lessons' mulberry32);  D11.same(what, got, want) / D11.close(what, got, want, tol) throw on a mismatch;
        D11.seq = D4.seq (stagger ramps);  D11.mean(list). */
(function () {
  const V = window.VID;
  const D11 = (V.d11 = V.d11 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d11: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.001) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.d11: ${what} is ${got}, the storyboard says ${want}`);
  };
  const fm = (v, d = 2) => String(+(+v).toFixed(d)).replace("-", "−");
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  Object.assign(D11, { same, close, fm, rng, mean, tone: (n) => V.d4.tone(n), seq: (...a) => V.d4.seq(...a) });

  // ---------- 1. patterns (11.1: the playground's numbers) ----------
  {
    const vals = [3, 5, 2, 6];
    const running = vals.map((_, i) => sum(vals.slice(0, i + 1)));
    const n = vals.length;
    D11.PAT = {
      A: 7,
      vals,
      running,
      sum: running[n - 1],
      msgs: { push: 1, pull: 2, bcast: n, reduce: n, all: 2 * n },
      model: 50,
      copies: n,
      sent: 50 * n,
    };
    same("PAT.running", running, [3, 8, 10, 16]);
    same("PAT.msgs", D11.PAT.msgs, { push: 1, pull: 2, bcast: 4, reduce: 4, all: 8 });
    same("PAT.sent (MB)", D11.PAT.sent, 200);
  }

  // ---------- 2. wait and barrier ----------
  {
    const a = 9;
    const b = 3;
    D11.WAIT = {
      a,
      b,
      idle: a - b,
      after: 1,
      T: 10,
      rows: [
        { name: "A", bars: [{ a: 0, b: a, kind: "work", text: "A works" }] },
        {
          name: "B",
          bars: [
            { a: 0, b, kind: "work", text: "B works" },
            { a: b, b: a, kind: "idle", text: "waiting" },
            { a, b: a + 1, kind: "work", text: "" },
          ],
        },
      ],
    };
    same("WAIT.idle", D11.WAIT.idle, 6);
    const arrive = [4, 6, 5, 9];
    const open = Math.max(...arrive);
    const idle = arrive.map((w) => open - w);
    D11.BAR = {
      arrive,
      open,
      idle,
      total: sum(idle),
      T: 10,
      rows: arrive.map((w, i) => ({
        name: `C${i + 1}`,
        bars: [{ a: 0, b: w, kind: "work", text: `${w} s` }, ...(w < open ? [{ a: w, b: open, kind: "idle" }] : [])],
      })),
    };
    same("BAR.idle", idle, [5, 3, 4, 0]);
    same("BAR.total", D11.BAR.total, 12);
  }

  // ---------- 3. overlap (the lesson's overlapPlan, line for line) ----------
  function overlapPlan(k, c, m, over) {
    const cw = [];
    const nw = [];
    let tC = 0;
    let tN = 0;
    for (let i = 0; i < k; i++) {
      const s = over ? tC : Math.max(tC, tN);
      cw.push({ a: s, b: s + c, kind: "work", text: `${i + 1}` });
      tC = s + c;
      const ns = Math.max(tC, tN);
      nw.push({ a: ns, b: ns + m, kind: "comm", text: "send" });
      tN = ns + m;
      if (!over) tC = tN;
    }
    return {
      rows: [
        { name: "Compute", bars: cw },
        { name: "Network", bars: nw },
      ],
      end: tN,
    };
  }
  D11.overlapPlan = overlapPlan;
  {
    const wait = overlapPlan(4, 3, 2, false);
    const over = overlapPlan(4, 3, 2, true);
    // stop and wait: the compute lane stalls (an idle bar) while each result is on the wire
    const cw = wait.rows[0].bars;
    wait.gaps = cw.slice(1).map((b, i) => ({ a: cw[i].b, b: b.a, kind: "idle" }));
    wait.rows[0].bars = [...cw, ...wait.gaps];
    D11.OVER = { k: 4, c: 3, m: 2, wait, over, saved: wait.end - over.end, T: 22 };
    same("OVER ends (stop and wait, overlap)", [wait.end, over.end], [20, 14]);
    same(
      "OVER: stop-and-wait stalls",
      wait.gaps.map((x) => [x.a, x.b]),
      [
        [3, 5],
        [8, 10],
        [13, 15],
      ],
    );
    same(
      "OVER: overlapped sends",
      over.rows[1].bars.map((x) => [x.a, x.b]),
      [
        [3, 5],
        [6, 8],
        [9, 11],
        [12, 14],
      ],
    );
  }

  // ---------- 4. distributed SGD, one iteration of Algorithm 1 (M = 3, w = 10, alpha = 0.5) ----------
  {
    const M = 3;
    const alpha = 0.5;
    const w0 = 10;
    const iter = (w, batch) => {
      const means = batch.map(mean);
      const g = means.map((x) => w - x);
      const G = sum(g);
      return { batch, means, g, G, w: w - (alpha / M) * G };
    };
    const one = iter(w0, [
      [4, 6],
      [5, 3],
      [8, 4],
    ]);
    const two = iter(one.w, [
      [5, 5],
      [6, 4],
      [3, 7],
    ]);
    const all = one.batch.flat();
    const allMean = mean(all);
    D11.SGD = {
      M,
      alpha,
      w0,
      Bp: 2,
      B: all.length,
      batch: one.batch,
      means: one.means,
      g: one.g,
      G: one.G,
      w1: one.w,
      all,
      allMean,
      gAll: w0 - allMean,
      step: alpha * (w0 - allMean),
      iter2: { batch: two.batch, g: two.g, G: two.G, w2: two.w },
    };
    same("SGD.g", one.g, [5, 6, 4]);
    same("SGD.G and w1", [one.G, one.w], [15, 7.5]);
    same("SGD one machine (mean, gradient, new w)", [allMean, w0 - allMean, w0 - alpha * (w0 - allMean)], [5, 5, 7.5]);
    same("SGD iteration 2", [two.g, two.G, two.w], [[2.5, 2.5, 2.5], 7.5, 6.25]);
  }

  // ---------- 5. idle during the all-reduce (lesson's syncPlan, equal workers) ----------
  {
    const c = 3;
    const m = 1;
    const k = 3;
    const workers = 4;
    const iter = c + m;
    const rows = Array.from({ length: workers }, (_, i) => ({ name: `W${i + 1}`, bars: [] }));
    const net = { name: "Network", bars: [] };
    for (let it = 0; it < k; it++) {
      const t = it * iter;
      rows.forEach((r) =>
        r.bars.push({ a: t, b: t + c, kind: "work", text: `${c} s` }, { a: t + c, b: t + iter, kind: "idle" }),
      );
      net.bars.push({ a: t + c, b: t + iter, kind: "comm", text: "" });
    }
    const busy = (workers * c) / (workers * iter);
    D11.IDLE = {
      c,
      m,
      k,
      workers,
      iter,
      busy,
      pct: Math.round(busy * 100),
      end: k * iter,
      T: k * iter,
      rows: [...rows, net],
    };
    same("IDLE (iteration, busy %)", [iter, D11.IDLE.pct], [4, 75]);
  }

  // ---------- 6. k-means on the lesson's 45-point cloud (k = 3) ----------
  {
    const r = rng(2024);
    const C = [
      [0.25, 0.72],
      [0.74, 0.74],
      [0.55, 0.38],
    ];
    const pts = Array.from({ length: 45 }, (_, i) => {
      const [cx, cy] = C[i % 3];
      return [+(cx + 0.07 * gauss(r)).toFixed(3), +(cy + 0.07 * gauss(r)).toFixed(3)];
    });
    const start = [
      [0.45, 0.66],
      [0.64, 0.82],
      [0.72, 0.7],
    ];
    const d2 = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2;
    const nearest = (p, cs) => cs.reduce((bi, c, i) => (d2(p, c) < d2(p, cs[bi]) ? i : bi), 0);
    const tally = (ps, asg) => {
      const acc = [0, 1, 2].map(() => ({ x: 0, y: 0, n: 0 }));
      ps.forEach((p, i) => {
        acc[asg[i]].x += p[0];
        acc[asg[i]].y += p[1];
        acc[asg[i]].n++;
      });
      return acc;
    };
    const iters = [];
    let c = start;
    let prev = null;
    for (let t = 1; t <= 15; t++) {
      const asg = pts.map((p) => nearest(p, c));
      const moved = prev ? asg.filter((x, i) => x !== prev[i]).length : asg.length;
      const records = [0, 1, 2]
        .map((m) => tally(pts.slice(m * 15, m * 15 + 15), asg.slice(m * 15, m * 15 + 15)).filter((x) => x.n).length)
        .reduce((s, x) => s + x, 0);
      const sizes = [0, 1, 2].map((k) => asg.filter((x) => x === k).length);
      const stop = prev && !moved;
      const after = stop ? c : tally(pts, asg).map((a, k) => (a.n ? [a.x / a.n, a.y / a.n] : c[k]));
      iters.push({ t, asg, before: c, after, moved, sizes, records });
      if (stop) break;
      c = after;
      prev = asg;
    }
    D11.KM = {
      pts,
      start,
      iters,
      moved: iters.map((x) => x.moved),
      converged: iters.length,
      final: c,
      pairs: pts.length,
      trail: (k, i) => [start[k], ...iters.slice(0, i + 1).map((x) => x.after[k])],
    };
    same("KM.moved", D11.KM.moved, [45, 3, 7, 12, 2, 0]);
    same("KM.converged", D11.KM.converged, 6);
    same(
      "KM.records (combiner, 3 mappers)",
      iters.map((x) => x.records),
      [7, 8, 9, 9, 9, 9],
    );
    same("KM final sizes", iters[5].sizes, [15, 15, 15]);
  }

  // ---------- 7. MapReduce k-means on the line (two mappers) ----------
  {
    const mappers = [
      [1, 4, 8, 12],
      [2, 3, 14],
    ];
    const step = (cs) => {
      const dist = mappers.map((ps) => ps.map((p) => cs.map((c) => Math.abs(p - c))));
      const emits = mappers.map((ps, m) => ps.map((p, i) => [dist[m][i][0] < dist[m][i][1] ? 0 : 1, p]));
      const comb = emits.map((em) =>
        [0, 1]
          .map((k) => {
            const xs = em.filter((e) => e[0] === k).map((e) => e[1]);
            return { k, sum: sum(xs), n: xs.length };
          })
          .filter((x) => x.n),
      );
      const red = [0, 1].map((k) => {
        const rs = comb.flat().filter((x) => x.k === k);
        const s = sum(rs.map((x) => x.sum));
        const n = sum(rs.map((x) => x.n));
        return { k, sum: s, n, c: +(s / n).toFixed(3) };
      });
      return { dist, emits, comb, red, next: red.map((x) => x.c) };
    };
    const one = step([2, 9]);
    const two = step(one.next);
    const means = one.comb.map((m) => m.map((x) => x.sum / x.n));
    const wrong = mean(means.map((m) => m[1]));
    D11.MR = {
      mappers,
      centres: [2, 9],
      dist: one.dist,
      emits: one.emits,
      pairs: one.emits.flat().length,
      comb: one.comb,
      records: one.comb.flat().length,
      red: one.red,
      next: one.next,
      means,
      wrong,
      truth: one.red[1].c,
      iter2: { emits: two.emits, next: two.next, same: JSON.stringify(two.emits) === JSON.stringify(one.emits) },
    };
    same("MR.emits", one.emits, [
      [
        [0, 1],
        [0, 4],
        [1, 8],
        [1, 12],
      ],
      [
        [0, 2],
        [0, 3],
        [1, 14],
      ],
    ]);
    same("MR pairs and records", [D11.MR.pairs, D11.MR.records], [7, 4]);
    same(
      "MR.comb",
      one.comb.map((m) => m.map((x) => [x.sum, x.n])),
      [
        [
          [5, 2],
          [20, 2],
        ],
        [
          [5, 2],
          [14, 1],
        ],
      ],
    );
    same(
      "MR.red",
      one.red.map((x) => [x.sum, x.n, x.c]),
      [
        [10, 4, 2.5],
        [34, 3, 11.333],
      ],
    );
    same("MR wrong mean, iteration 2", [wrong, D11.MR.iter2.same, two.next], [12, true, [2.5, 11.333]]);
    same("MR sample 8 distances", one.dist[0][2], [6, 1]);
  }
})();

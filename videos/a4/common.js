/* Phase 4 · Minimum Spanning Trees: the data and algorithms every scene of this video shares (pure, no DOM, no randomness).
   Everything hangs off VID.a4; scenes start with  const A4 = VID.a4;  Drawing helpers are in common-2.js (A4.graph) and
   common-3.js (tags, tiles, bars, tokens). Every number below comes from running the real algorithm when the page loads and
   is asserted against the storyboard (videos/_plan/algo-4.json): a wrong number throws an Error with a clear message.

   TOWNS AND KEYS.  The example network is the one in lessons 4.2 and 4.5 (five towns, seven cables). An edge key is its two
   town letters in alphabetical order ("AC", never "CA"): A4.key("C", "A") = "AC".
     A4.TOWNS = ["A","B","C","D","E"]
     A4.EDGES = [["A","B",4], ["A","C",3], ["B","C",2], ["B","D",5], ["C","D",6], ["C","E",7], ["D","E",1]]   (a, b, cost)
     A4.EDGE_KEYS = ["AB","AC","BC","BD","CD","CE","DE"]      A4.key(a, b)      A4.wOf("BD") -> 5      A4.sumOf(["AC","BC"]) -> 5
     The minimum spanning tree is AC 3 + BC 2 + BD 5 + DE 1 = 11:  A4.MST = {keys: ["AC","BC","BD","DE"], total: 11}.

   CUTS (the cut property).  X is the list of towns on one side of a cut.
     A4.crossing(X) -> [{key, w, a, b}] every cable with exactly one end in X, cheapest first (ties: by key);
                       a = the end inside X, b = the end outside.      A4.safe(X) -> the first of them (the lightest).
     A4.cutOf(X) -> {X, crossing, safe}.     The video's four cuts, in this order (A4.CUTS):
        {A} -> AC 3 (AB 4 crosses too)   {B} -> BC 2 (AB 4, BD 5)   {A,B,C} -> BD 5 (CD 6, CE 7)   {A,B,C,D} -> DE 1 (CE 7)
   EXCHANGE (the proof by swapping).  A4.EXCHANGE = {X: ["A"], e: "AC", T: ["AB","BC","BD","DE"], total: 12,
        cycle: ["AB","BC","AC"], f: "AB", T2: ["BC","BD","DE","AC"], total2: 11}
        i.e. a tree T that uses the dearer crossing cable AB (cost 12); adding e = AC closes the loop A-B-C; the loop's other
        crossing cable f = AB can go; the new tree T2 costs 11.   A4.exchange(X, T) computes it for any cut and tree.

   PRIM from A (A4.PRIM = A4.prim("A")).   .steps[k] (k = 0..3): {n, X (towns in the tree before this step), cands (the
        crossing cables, cheapest first), pick (the cheapest one), town (the town that joins), inside (cables with both ends in
        the tree that are NOT in it: dropped from the candidates), total (tree cost after this step), tree (keys after it)}
        step 0: X {A}        cands AC 3, AB 4                  -> AC, town C, total 3
        step 1: X {A,C}      cands BC 2, AB 4, CD 6, CE 7      -> BC, town B, total 5
        step 2: X {A,C,B}    cands BD 5, CD 6, CE 7 (AB inside) -> BD, town D, total 10
        step 3: X {A,C,B,D}  cands DE 1, CE 7 (AB, CD inside)  -> DE, town E, total 11
        .order = ["AC","BC","BD","DE"]   .total = 11
   KRUSKAL (A4.KRUSKAL = A4.kruskal()).   .sorted = [{key, w, a, b}] cheapest first: DE 1, BC 2, AC 3, AB 4, BD 5, CD 6, CE 7
        .events[i] (i = 0..4, one per cable READ): {i, key, w, a, b, accept, path (towns of the existing tree path between its
        ends, e.g. ["A","C","B"], or null when accepted), cycle (the keys of the loop it would close, e.g. ["AC","BC","AB"]),
        before / after (the groups of towns, e.g. [["A"],["B","C"],["D","E"]]), tree (keys so far), total}
        DE accept (groups DE) total 1; BC accept total 3; AC accept (groups ABC, DE) total 6; AB REJECT (path A-C-B) total 6;
        BD accept (one group ABCDE) total 11.   .unread = ["CD","CE"] (never read: 4 cables = 5 - 1, so it stops)
        .tree = ["DE","BC","AC","BD"]   .total = 11
        .cuts = [{key, X}] the cut that makes each ACCEPTED cable safe (X = a group before it joined, whose lightest crossing
        cable it is): DE X {D}, BC X {B}, AC X {A}, BD X {A,B,C}  (scene 7)
   Helpers: A4.groupsOf(keys, towns?) -> [["A"],["B","C"],...] (sorted);  A4.pathIn(keys, a, b) -> ["A","C","B"] | null.

   ALL SPANNING TREES (scene 3).  A4.TREES = [{keys, total, name}] the 21 spanning trees of the network, sorted by total then
        name; name = keys joined by a space ("AC BC BD DE"). Totals run 11 (1 tree), 12 (2), 13 (3), 14 (2), 15 (2), 16 (2),
        17 (2), 18 (2), 19 (2), 20 (1), 21 (1), 22 (1).  A4.HIST = {11: 1, 12: 2, ...}.
        A4.FLIP = the 21 trees in the order the flip-book shows them: "AB BC BD DE" (12, the tree of scene 2) first, then
        "AB BD CD CE" (22, the dearest), "AC BD CE DE" (16), then 17 more in a fixed shuffled order, and the cheapest
        "AC BC BD DE" (11) last.   A4.treeIndex(name) -> index in A4.TREES.
        A4.COUNTS = [{towns: 5, cables: 7, n: 21, text: "21"}, {towns: 8, cables: 13, n: 452, text: "452"},
                     {towns: 20, cables: 190, text: "262,144,000,000,000,000,000,000"}]   (20 towns, every pair linked:
        Cayley's formula n^(n-2) = 20^18; the 8-town network is the one in lessons 4.3 and 4.4.)
        A4.countTrees(edges, towns) counts spanning trees by brute force.   A4.commas(n | bigint) -> "1,234".

   COST (scene 8).  A4.primSteps(V) counts the two inner loops of the array version (select + update) = (V - 1)^2;
        A4.kruskalSteps(E, V) = E * log2(V);  A4.big(x) formats like the app: 1046529 -> "1.0 M", 20480 -> "20 k".
        A4.COST = {sparse: {V: 1024, E: 2048, prim: 1046529, kruskal: 20480, ratio: 51.1, primText: "1.0 M",
                            kruskalText: "20 k"},
                   dense:  {V: 1000, E: 499500, prim: 998001, kruskal: 4977909 (rounded), ratio: 4.99 (Prim is 5 times less),
                            primText: "998 k", kruskalText: "5.0 M"}}

   TOUR FROM A TREE (scenes 9 and 10): the seven towns of lesson 4.9. Distances are the straight-line pixel distances / 10.
        A4.TSP = {towns: [..."ABCDEFG"], ref (lesson pixel coordinates), dist(a, b), edges (all 21 pairs [a, b, d]),
          mst: [{key, w}] in the order Prim from A adds them: AB 11.2, AC 12.1, CD 13.8, DE 11.9, DF 13.9, FG 12.7, W = 75.7,
          walk: "ABACDEDFGFDCA" (12 legs, each tree cable twice, children in alphabetical order), walkLen 151.4 (= 2W),
          legs: [{from, to, len, tree: bool, skipped: [towns]}] the 7 legs of the shortcut tour A B C D E F G -> A:
                AB 11.2 tree, BC 19.1 shortcut over A, CD 13.8 tree, DE 11.9 tree, EF 19.0 shortcut over D, FG 12.7 tree,
                GA 37.0 shortcut over F, D, C (the way home);  tourLen 124.8,
          best: {order: "ABEGFDC", len: 97.6, legs}  the true shortest round trip (brute force over all 720),
          cut: {key: "BE", len: 18.0, pathLen: 79.6}  the longest leg of the best tour and what is left without it,
          twiceBest 195.2,
          runW (6 running totals while the tree is laid in Prim order), runWalk (12 running totals along the walk),
          runTour (7 running totals along the shortcut tour): 11.2 23.3 37.1 49.1 63.0 75.7 | ... 151.4 | ... 124.8}.
        Numbers on screen use A4.num(x) = one decimal. SHOW RUNNING TOTALS (runW[i], runWalk[i], runTour[i]), never single
        cable lengths: rounded cable lengths do not add up to the rounded total (11.2 + 12.1 + 13.8 + 11.9 + 13.9 + 12.7 = 75.6).
        The sandwich the video ends on:  W 75.7  <=  best 97.6  <=  our tour 124.8  <=  2W 151.4  (<= 2 x best 195.2).

   SMALL TOOLS.  A4.rng(seed) -> () => 0..1 (mulberry32, seeded: the only randomness allowed)   A4.num(x, d = 1) -> "75.7"
        A4.same(what, got, want) throws when JSON differs.  A4.close(what, got, want, tol) throws when numbers differ. */
(function () {
  const V = window.VID;
  const A4 = (V.a4 = V.a4 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.a4: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.05) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.a4: ${what} is ${got}, the storyboard says ${want}`);
  };
  const rng = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const num = (x, d = 1) => x.toFixed(d);
  const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // ---------- the network ----------
  const TOWNS = ["A", "B", "C", "D", "E"];
  const EDGES = [
    ["A", "B", 4],
    ["A", "C", 3],
    ["B", "C", 2],
    ["B", "D", 5],
    ["C", "D", 6],
    ["C", "E", 7],
    ["D", "E", 1],
  ];
  const key = (a, b) => (a < b ? a + b : b + a);
  const EDGE_KEYS = EDGES.map(([a, b]) => key(a, b));
  const wOf = (k, edges = EDGES) => {
    const e = edges.find(([a, b]) => key(a, b) === k);
    if (!e) throw new Error(`VID.a4.wOf: no cable "${k}"`);
    return e[2];
  };
  const sumOf = (keys, edges = EDGES) => keys.reduce((s, k) => s + wOf(k, edges), 0);
  const byWeight = (p, q) => p.w - q.w || (p.key < q.key ? -1 : 1);

  /* the groups (connected pieces) the cables in `keys` make of the towns, each sorted, ordered by first town */
  function groupsOf(keys, towns = TOWNS) {
    const p = Object.fromEntries(towns.map((t) => [t, t]));
    const f = (x) => (p[x] === x ? x : (p[x] = f(p[x])));
    keys.forEach((k) => (p[f(k[0])] = f(k[1])));
    const m = {};
    towns.forEach((t) => (m[f(t)] = (m[f(t)] || []).concat(t)));
    return Object.values(m).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  }
  /* the towns on the path from a to b using only the cables in `keys` (breadth first), or null when they are not connected */
  function pathIn(keys, a, b) {
    const prev = { [a]: null };
    const queue = [a];
    while (queue.length) {
      const x = queue.shift();
      keys.forEach((k) => {
        if (!k.includes(x)) return;
        const y = k[0] === x ? k[1] : k[0];
        if (!(y in prev)) {
          prev[y] = x;
          queue.push(y);
        }
      });
    }
    if (!(b in prev)) return null;
    const out = [];
    for (let c = b; c !== null; c = prev[c]) out.unshift(c);
    return out;
  }
  const pathKeys = (path) => path.slice(0, -1).map((t, j) => key(t, path[j + 1]));

  // ---------- cuts and the exchange argument ----------
  const crossing = (X, edges = EDGES) =>
    edges
      .filter(([a, b]) => X.includes(a) !== X.includes(b))
      .map(([a, b, w]) => ({ key: key(a, b), w, a: X.includes(a) ? a : b, b: X.includes(a) ? b : a }))
      .sort(byWeight);
  const safe = (X, edges = EDGES) => crossing(X, edges)[0];
  const cutOf = (X, edges = EDGES) => ({ X, crossing: crossing(X, edges), safe: safe(X, edges) });
  const CUTS = [["A"], ["B"], ["A", "B", "C"], ["A", "B", "C", "D"]].map((X) => cutOf(X));

  function exchange(X, T, edges = EDGES) {
    const e = safe(X, edges);
    if (T.includes(e.key)) throw new Error(`VID.a4.exchange: the tree already uses ${e.key}`);
    const onCycle = pathKeys(pathIn(T, e.a, e.b));
    const f = onCycle.find((k) => X.includes(k[0]) !== X.includes(k[1]));
    const T2 = T.filter((k) => k !== f).concat(e.key);
    return { X, e: e.key, T, total: sumOf(T, edges), cycle: onCycle.concat(e.key), f, T2, total2: sumOf(T2, edges) };
  }
  const EXCHANGE = exchange(["A"], ["AB", "BC", "BD", "DE"]);

  // ---------- Prim ----------
  function prim(start = "A", edges = EDGES, towns = TOWNS) {
    const X = [start];
    const tree = [];
    const steps = [];
    let total = 0;
    while (X.length < towns.length) {
      const cands = crossing(X, edges);
      if (!cands.length) throw new Error("VID.a4.prim: the graph is not connected");
      const pick = cands[0];
      const inside = edges
        .filter(([a, b]) => X.includes(a) && X.includes(b) && !tree.includes(key(a, b)))
        .map(([a, b]) => key(a, b));
      total += pick.w;
      steps.push({
        n: steps.length + 1,
        X: X.slice(),
        cands,
        pick,
        town: pick.b,
        inside,
        total,
        tree: tree.concat(pick.key),
      });
      tree.push(pick.key);
      X.push(pick.b);
    }
    return { steps, order: tree.slice(), tree: tree.slice(), total };
  }
  const PRIM = prim("A");

  // ---------- Kruskal ----------
  function kruskal(edges = EDGES, towns = TOWNS) {
    const sorted = edges.map(([a, b, w]) => ({ key: key(a, b), w, a, b })).sort(byWeight);
    const tree = [];
    const events = [];
    const unread = [];
    sorted.forEach((e, i) => {
      if (tree.length === towns.length - 1) return unread.push(e.key);
      const before = groupsOf(tree, towns);
      const path = pathIn(tree, e.a, e.b);
      if (!path) tree.push(e.key);
      events.push({
        i,
        key: e.key,
        w: e.w,
        a: e.a,
        b: e.b,
        accept: !path,
        path,
        cycle: path ? pathKeys(path).concat(e.key) : null,
        before,
        after: groupsOf(tree, towns),
        tree: tree.slice(),
        total: sumOf(tree, edges),
      });
    });
    // the cut that makes each accepted cable safe: X = a group (before it joined) whose lightest crossing cable it is
    const cuts = events
      .filter((e) => e.accept)
      .map((e) => ({ key: e.key, X: e.before.find((g) => safe(g, edges).key === e.key) }));
    return { sorted, events, tree: tree.slice(), total: sumOf(tree, edges), unread, cuts };
  }
  const KRUSKAL = kruskal();

  // ---------- every spanning tree of a network ----------
  function spanningTrees(edges = EDGES, towns = TOWNS) {
    const n = towns.length - 1;
    const out = [];
    const walk = (i, cur) => {
      if (cur.length === n) {
        const keys = cur.map(([a, b]) => key(a, b));
        if (groupsOf(keys, towns).length === 1) out.push({ keys, total: sumOf(keys, edges), name: keys.join(" ") });
        return;
      }
      if (i >= edges.length || cur.length + (edges.length - i) < n) return;
      walk(i + 1, cur.concat([edges[i]]));
      walk(i + 1, cur);
    };
    walk(0, []);
    return out.sort((p, q) => p.total - q.total || (p.name < q.name ? -1 : 1));
  }
  const countTrees = (edges, towns) => spanningTrees(edges, towns).length;
  const TREES = spanningTrees();
  const treeIndex = (name) => {
    const i = TREES.findIndex((t) => t.name === name);
    if (i < 0) throw new Error(`VID.a4.treeIndex: no tree "${name}"`);
    return i;
  };
  const HIST = {};
  TREES.forEach((t) => (HIST[t.total] = (HIST[t.total] || 0) + 1));
  const FLIP = (() => {
    const head = ["AB BC BD DE", "AB BD CD CE", "AC BD CE DE"].map(treeIndex);
    const last = treeIndex("AC BC BD DE");
    const rest = TREES.map((_, i) => i).filter((i) => !head.includes(i) && i !== last);
    const r = rng(7);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return head.concat(rest, [last]);
  })();
  // the 8-town network of lessons 4.3 and 4.4 (only used to count its spanning trees)
  const NET8 = {
    towns: [..."ABCDEFGH"],
    edges: [
      ["A", "B", 8],
      ["A", "C", 5],
      ["B", "C", 11],
      ["B", "D", 6],
      ["C", "D", 9],
      ["C", "F", 14],
      ["D", "E", 3],
      ["D", "G", 12],
      ["E", "G", 7],
      ["F", "G", 10],
      ["F", "H", 4],
      ["G", "H", 13],
      ["B", "E", 15],
    ],
  };
  const cayley = (n) => commas(BigInt(n) ** BigInt(n - 2));
  const COUNTS = [
    { towns: 5, cables: 7, n: TREES.length, text: commas(TREES.length) },
    { towns: 8, cables: 13, n: countTrees(NET8.edges, NET8.towns), text: commas(countTrees(NET8.edges, NET8.towns)) },
    { towns: 20, cables: 190, text: cayley(20) },
  ];

  // ---------- cost ----------
  const primSteps = (n) => {
    let steps = 0;
    for (let i = 1; i < n; i++) steps += n - i + (n - i - 1); // select loop + update loop of pass i
    return steps;
  };
  const kruskalSteps = (e, n) => e * Math.log2(n);
  const big = (x) =>
    x >= 1e6
      ? `${(x / 1e6).toFixed(x >= 1e7 ? 0 : 1)} M`
      : x >= 1e3
        ? `${(x / 1e3).toFixed(x >= 1e4 ? 0 : 1)} k`
        : String(Math.round(x));
  const costOf = (n, e) => {
    const [p, k] = [primSteps(n), Math.round(kruskalSteps(e, n))];
    return {
      V: n,
      E: e,
      prim: p,
      kruskal: k,
      ratio: Math.max(p, k) / Math.min(p, k),
      primText: big(p),
      kruskalText: big(k),
    };
  };
  const COST = { sparse: costOf(1024, 2048), dense: costOf(1000, (1000 * 999) / 2) };

  // ---------- from a tree to a tour (the seven towns of lesson 4.9) ----------
  const REF = { A: [60, 150], B: [120, 55], C: [135, 245], D: [235, 150], E: [300, 50], F: [345, 235], G: [430, 140] };
  const TT = Object.keys(REF);
  const dist = (a, b) => Math.hypot(REF[a][0] - REF[b][0], REF[a][1] - REF[b][1]) / 10;
  const tourLen = (order, closed = true) =>
    [...order].reduce((s, c, i, o) => (i ? s + dist(o[i - 1], c) : s), 0) + (closed ? dist(order.at(-1), order[0]) : 0);
  function tspData() {
    const inT = ["A"];
    const mst = [];
    while (inT.length < TT.length) {
      let best = null;
      inT.forEach((a) =>
        TT.forEach((c) => {
          if (!inT.includes(c) && (!best || dist(a, c) < best[2])) best = [a, c, dist(a, c)];
        }),
      );
      mst.push({ key: key(best[0], best[1]), w: best[2], from: best[0], to: best[1] });
      inT.push(best[1]);
    }
    const adj = Object.fromEntries(TT.map((t) => [t, []]));
    mst.forEach(({ from, to }) => (adj[from].push(to), adj[to].push(from)));
    const seen = new Set(["A"]);
    const walk = ["A"];
    const pre = ["A"];
    (function go(v) {
      adj[v]
        .slice()
        .sort()
        .forEach((u) => {
          if (seen.has(u)) return;
          seen.add(u);
          pre.push(u);
          walk.push(u);
          go(u);
          walk.push(v);
        });
    })("A");
    const legs = pre.map((from, i) => {
      const to = pre[(i + 1) % pre.length];
      const [i0, i1] = [walk.indexOf(from), i + 1 < pre.length ? walk.indexOf(to) : walk.length - 1];
      return {
        from,
        to,
        len: dist(from, to),
        tree: mst.some((m) => m.key === key(from, to)),
        skipped: walk.slice(i0 + 1, i1).filter((t, j, a) => a.indexOf(t) === j && t !== to),
      };
    });
    let bestLen = Infinity;
    let bestRest = null;
    (function perm(a, k) {
      if (k === a.length) {
        const l = tourLen("A" + a.join(""));
        if (l < bestLen) [bestLen, bestRest] = [l, a.join("")];
        return;
      }
      for (let i = k; i < a.length; i++) {
        [a[k], a[i]] = [a[i], a[k]];
        perm(a, k + 1);
        [a[k], a[i]] = [a[i], a[k]];
      }
    })(TT.slice(1), 0);
    const bestOrder = "A" + bestRest;
    const bestLegs = [...bestOrder].map((c, i, o) => ({
      from: c,
      to: o[(i + 1) % o.length],
      len: dist(c, o[(i + 1) % o.length]),
    }));
    const longest = bestLegs.reduce((m, l) => (l.len > m.len ? l : m));
    const W = mst.reduce((s, m) => s + m.w, 0);
    const running = (list) => list.map((_, i) => list.slice(0, i + 1).reduce((s, x) => s + x, 0));
    const walkLegs = [...walk.join("")].slice(1).map((c, i) => dist(walk[i], c));
    return {
      towns: TT,
      ref: REF,
      dist,
      edges: TT.flatMap((a, i) => TT.slice(i + 1).map((b) => [a, b, dist(a, b)])),
      mst,
      W,
      walk: walk.join(""),
      walkLen: tourLen(walk.join(""), false),
      runW: running(mst.map((m) => m.w)),
      runWalk: running(walkLegs),
      runTour: running(legs.map((l) => l.len)),
      pre: pre.join(""),
      legs,
      tourLen: tourLen(pre.join("")),
      best: { order: bestOrder, len: bestLen, legs: bestLegs },
      cut: { key: key(longest.from, longest.to), len: longest.len, pathLen: bestLen - longest.len },
      twiceBest: 2 * bestLen,
    };
  }
  const TSP = tspData();

  // ---------- build-time checks: every number in the storyboard ----------
  same("MST", PRIM.tree.slice().sort(), ["AC", "BC", "BD", "DE"]);
  same("MST total", PRIM.total, 11);
  same(
    "cuts",
    CUTS.map((c) => c.safe.key),
    ["AC", "BC", "BD", "DE"],
  );
  same(
    "cut {A} crossing",
    CUTS[0].crossing.map((c) => `${c.key}${c.w}`),
    ["AC3", "AB4"],
  );
  same(
    "cut {A,B,C} crossing",
    CUTS[2].crossing.map((c) => `${c.key}${c.w}`),
    ["BD5", "CD6", "CE7"],
  );
  same("exchange", [EXCHANGE.total, EXCHANGE.cycle, EXCHANGE.f, EXCHANGE.total2], [12, ["AB", "BC", "AC"], "AB", 11]);
  same("Prim order", PRIM.order, ["AC", "BC", "BD", "DE"]);
  same(
    "Prim totals",
    PRIM.steps.map((s) => s.total),
    [3, 5, 10, 11],
  );
  same(
    "Prim candidates",
    PRIM.steps.map((s) => s.cands.map((c) => `${c.key}${c.w}`)),
    [
      ["AC3", "AB4"],
      ["BC2", "AB4", "CD6", "CE7"],
      ["BD5", "CD6", "CE7"],
      ["DE1", "CE7"],
    ],
  );
  same(
    "Prim dropped",
    PRIM.steps.map((s) => s.inside),
    [[], [], ["AB"], ["AB", "CD"]],
  );
  same(
    "Kruskal list",
    KRUSKAL.sorted.map((e) => `${e.key}${e.w}`),
    ["DE1", "BC2", "AC3", "AB4", "BD5", "CD6", "CE7"],
  );
  same(
    "Kruskal verdicts",
    KRUSKAL.events.map((e) => e.accept),
    [true, true, true, false, true],
  );
  same(
    "Kruskal totals",
    KRUSKAL.events.map((e) => e.total),
    [1, 3, 6, 6, 11],
  );
  same(
    "Kruskal loop",
    [KRUSKAL.events[3].path, KRUSKAL.events[3].cycle],
    [
      ["A", "C", "B"],
      ["AC", "BC", "AB"],
    ],
  );
  same("Kruskal cuts", KRUSKAL.cuts, [
    { key: "DE", X: ["D"] },
    { key: "BC", X: ["B"] },
    { key: "AC", X: ["A"] },
    { key: "BD", X: ["A", "B", "C"] },
  ]);
  same("Kruskal groups", KRUSKAL.events[2].after, [
    ["A", "B", "C"],
    ["D", "E"],
  ]);
  same("Kruskal unread", KRUSKAL.unread, ["CD", "CE"]);
  same("trees", [TREES.length, TREES[0].total, TREES[0].name, TREES.at(-1).total], [21, 11, "AC BC BD DE", 22]);
  same("tree totals", HIST, { 11: 1, 12: 2, 13: 3, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 1, 21: 1, 22: 1 });
  same(
    "flip order",
    [FLIP.length, new Set(FLIP).size, TREES[FLIP[0]].total, TREES[FLIP[1]].total, TREES[FLIP[20]].total],
    [21, 21, 12, 22, 11],
  );
  same(
    "tree counts",
    COUNTS.map((c) => c.text),
    ["21", "452", "262,144,000,000,000,000,000,000"],
  );
  same(
    "cost sparse",
    [COST.sparse.prim, COST.sparse.kruskal, COST.sparse.primText, COST.sparse.kruskalText],
    [1046529, 20480, "1.0 M", "20 k"],
  );
  same(
    "cost dense",
    [COST.dense.prim, COST.dense.kruskal, COST.dense.primText, COST.dense.kruskalText],
    [998001, 4977909, "998 k", "5.0 M"],
  );
  close("sparse ratio", COST.sparse.ratio, 51.1, 0.1);
  close("dense ratio", COST.dense.ratio, 4.99, 0.02);
  same(
    "TSP mst order",
    TSP.mst.map((m) => m.key),
    ["AB", "AC", "CD", "DE", "DF", "FG"],
  );
  close("TSP W", TSP.W, 75.7, 0.05);
  same("TSP walk", TSP.walk, "ABACDEDFGFDCA");
  close("TSP walk length", TSP.walkLen, 151.4, 0.05);
  close("TSP walk = 2W", TSP.walkLen, 2 * TSP.W, 1e-9);
  same("TSP shortcut order", TSP.pre, "ABCDEFG");
  close("TSP tour", TSP.tourLen, 124.8, 0.05);
  same(
    "TSP legs",
    TSP.legs.map((l) => `${l.from}${l.to}${l.tree ? "" : ":" + (l.skipped.join("") || "-")}`),
    ["AB", "BC:A", "CD", "DE", "EF:D", "FG", "GA:FDC"],
  );
  same(
    "TSP running totals",
    [TSP.runW, TSP.runWalk.slice(-1), TSP.runTour.slice(-1)].map((r) => r.map((x) => num(x))),
    [["11.2", "23.3", "37.1", "49.1", "63.0", "75.7"], ["151.4"], ["124.8"]],
  );
  same(
    "TSP best",
    [TSP.best.order, num(TSP.best.len), TSP.cut.key, num(TSP.cut.len), num(TSP.cut.pathLen), num(TSP.twiceBest)],
    ["ABEGFDC", "97.6", "BE", "18.0", "79.6", "195.2"],
  );
  if (!(
    TSP.W <= TSP.cut.pathLen &&
    TSP.cut.pathLen <= TSP.best.len &&
    TSP.best.len <= TSP.tourLen &&
    TSP.tourLen <= TSP.walkLen
  ))
    throw new Error("VID.a4: the sandwich W <= path <= best <= tour <= 2W does not hold");

  Object.assign(A4, {
    same, close, rng, num, commas, TOWNS, EDGES, EDGE_KEYS, key, wOf, sumOf, groupsOf, pathIn, pathKeys, crossing, safe,
    cutOf, CUTS, exchange, EXCHANGE, prim, PRIM, kruskal, KRUSKAL, spanningTrees, countTrees, TREES, treeIndex, HIST,
    FLIP, NET8, cayley, COUNTS, primSteps, kruskalSteps, big, COST, TSP,
    MST: { keys: PRIM.tree.slice().sort(), total: PRIM.total },
  }); // prettier-ignore
})();

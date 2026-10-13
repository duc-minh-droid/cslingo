/* Algorithms phase 2 · Graph search & internet routing: pure data and algorithms (no DOM). window.VID.a2, short name A2.
   Three files: this one (data, the real algorithms, self-check), common-2.js (tags, tokens, the graph drawer) and common-3.js
   (grid, rooms list, table, bars, small pictograms). videos/algo-2.html loads all three after engine.js, cards.js and
   l5/common.js, then the scenes. Everything here is deterministic: no randomness, no clock. Run
   `node -e "global.window={VID:{}};require('./videos/a2/common.js');console.log(Object.keys(window.VID.a2))"` to check it.
   Scene rule: read the logs ONCE at build time, look things up by time inside update(t). Every number in the specs comes from here.

   VIDEO-WIDE COLOUR ROLES: grey = not reached / unused road / wall; purple = waiting (tentative distance, open frontier cell,
   an estimate); blue = what we look at right now (road being checked, start cell, packet, a neighbour's report); orange = the
   pick (smallest waiting node, cell A* expands, the goal G, the minimum); green = settled / final / the route (solid green =
   the final route); red = rejected / wrong (negative road, cut link, count to infinity). Symbols are SVG, never glyphs
   (the video font has no infinity sign: write "∞" in a tag and common-2.js draws it as a shape).

   ───────────────────────────── 1. THE DIJKSTRA GRAPH (lessons 2.1 and 2.2) ─────────────────────────────
     A2.DIJ.names ["A","B","C","D","E"]     A2.DIJ.edges [[a, b, w]] A-B 4, A-C 2, C-B 1, C-D 5, B-D 3, C-E 7, D-E 2 (undirected)
     A2.DIJ.pos {A:[60,300], B:[250,100], C:[250,500], D:[470,300], E:[560,560]}   reference layout, box 24..596 x 64..596 incl. nodes
     A2.dijkstra(names, edges, {directed = false, start = names[0]}) -> run
        run.rounds[i] = {node, d, relax: [{to, w, cand, old (Infinity if unseen), better, edge: [a, b]}],
                         late: [{to, w, cand, old, edge}] (a settled node a road would have improved: only with negative roads),
                         before, after}     before / after = a snapshot taken before settling and after relaxing
        snapshot = {dist: {A: 0, B: Infinity, ...}, parent: {B: "C", ...}, settled: ["A", ...] (in order), waiting: ["C", "B"]
                    (reached but not settled, smallest distance first, ties by name order)}
        run.dist, run.parent, run.settled (settle order), run.snap(n) = the state after n rounds (n = 0 .. rounds.length;
        n = 0 is "only A is waiting at 0")
     A2.DIJ_RUN = A2.dijkstra(DIJ.names, DIJ.edges):
        settle order A C B D E, final dist A 0, B 3, C 2, D 6, E 8, parents B<-C, C<-A, D<-B, E<-D
        rounds: A relaxes B 0+4=4 (new) and C 0+2=2 (new); C relaxes B 2+1=3 (beats 4), D 2+5=7 (new), E 2+7=9 (new);
        B relaxes D 3+3=6 (beats 7); D relaxes E 6+2=8 (beats 9); E relaxes nothing. 7 relaxations, all improvements, 3 shortcuts.
     A2.treeEdges(run, upto = all) -> [[parent, node]] of the nodes settled in the first `upto` rounds (A2.DIJ_RUN: A-C, C-B, B-D, D-E)
     A2.routeOf(run, node) -> ["A","C","B","D","E"]   follow parents back and reverse

   ───────────────────────────── 2. ALL ROUTES (scene 2) ─────────────────────────────
     A2.routes(names, edges, from, to) -> [{path: "ACBDE", cost, hops, legs: [2,1,3,2]}]   every simple route, cheapest first
     A2.ROUTES = routes(DIJ ..., "A", "E"): 7 routes. ACBDE 8 (4 roads, the cheapest), ACE 9 (2 roads, the fewest roads),
        ABDE 9, ACDE 9, ABCE 12, ABCDE 12, ABDCE 19

   ───────────────────────────── 3. WHY SETTLED IS FINAL, AND NEGATIVE ROADS (scene 4) ─────────────────────────────
     A2.TRI = {names: ["A","B","C"], pos: {A:[110,320], B:[420,120], C:[420,520]}}   suggested layout (scene 4)
     A2.SAFE = {edges: [["A","B",4],["A","C",2],["C","B",1]], settle: "C", d: 2, rival: {via: "B", first: 4, then: 1, total: 5}}
        after A is settled B waits at 4 and C at 2; C is the smallest; any other way into C leaves A through B (4) and then
        takes road B-C (1): 4 + 1 = 5, longer than 2 (and already past 2 after its first road)
     A2.NEG = {edges: [["A","B",4],["A","C",5],["C","B",-3]] (DIRECTED), run, trueB: 2}
        Dijkstra settles A 0, B 4 (smaller than C 5), then C 5: relaxing C->B gives 5 + (-3) = 2, which beats 4 but B is settled:
        run.rounds[2].late = [{to: "B", cand: 2, old: 4}]. The true distance to B is 2 (A.NEG.trueB, from Bellman-Ford).

   ───────────────────────────── 4. THE GRID (scenes 5 and 6) ─────────────────────────────
     A2.GRID = {cols: 10, rows: 7, S: [1,3], G: [8,3], walls: ["5,1","5,2","5,3","5,4"]}   cells are (x, y), 4-connected, cost 1
     A2.gridKey(x, y) = "x,y"       A2.isWall(x, y)
     A2.gridRun(kind) -> run   kind "astar" (h = Manhattan distance to G) or "dijkstra" (h = 0). Ties: lower f, then lower h, then older.
        run.steps[i] = {x, y, key, g, h, f, added: [[x, y]] (cells newly opened by this expansion), open: [{x, y, key, g, h, f}]
                        (the open set AFTER this expansion), parentOf}     i = 0 .. count - 1; the goal is the last step
        run.count, run.cost, run.path = [[x, y], ...] from S to G, run.fAt[key] = f when expanded
        run.at(n) -> {closed: [key...] (first n expansions), open: {key: {g, h, f}} (open set after n expansions), cur: key | null
                      (the n-th expanded cell), done: n === count}      n = 0 is "only S is open (g 0, h 7, f 7)"
     A2.RUNS = {astar, dijkstra}:  A* expands 20 cells, Dijkstra 59, both find cost 11 along the same 12-cell path
        (1,3) (2,3) (3,3) (4,3) (4,4) (4,5) (5,5) (6,5) (7,5) (8,5) (8,4) (8,3)
        A* order: f 7 for (1,3) (2,3) (3,3) (4,3), then nine cells with f 9 ((4,4) (4,2) (3,4) (3,2) (2,4) (2,2) (1,4) (0,3) (1,2)),
        then f 11 for (4,5) (5,5) (6,5) (7,5) (8,5) (8,4) (8,3).  Free cells: 66 (70 minus 4 walls).
     A2.HONEST = {trueLeft: 11, honest: 7, doubled: 14}   from S: the real cost left, Manhattan h (never too high), 2 x h (too high)

   ───────────────────────────── 5. THE SIX-ROUTER NETWORK (scene 7; lessons 2.8, 2.9) ─────────────────────────────
     A2.NET.names ["A".."F"]   A2.NET.edges A-B 3, A-C 6, A-D 2, B-C 2, B-D 4, C-D 5, C-E 1, C-F 4, D-E 3, E-F 2
     A2.NET.pos {A:[50,300], B:[210,100], C:[430,150], D:[210,500], E:[430,470], F:[590,300]}   suggested layout (box 640 x 600)
     A2.netDijkstra(src) -> {d: {B: 3, ...}, parent, first: {dest: first hop}, order: [settle order without src], tree: [[parent, v]]
                              in settle order}
     A2.netTable(src) -> [{dest, next, cost}]  sorted by name.   A2.TABLE_A = A2.netTable("A"):
        B via B 3, C via B 5, D via D 2, E via D 5, F via D 7
     A2.hops(src, dst) -> [{at, next, dest, cost (from at to dest)}]:  A2.hops("A","F") = A->D (cost 7), D->E (5), E->F (2);
        the route is A D E F, total 7. Tree of A: D 2 (A-D), B 3 (A-B), C 5 (B-C), E 5 (D-E), F 7 (E-F).
     (If D-E fails, A reaches F by A B C E F at cost 8; the lesson text now says the same.)

   ───────────────────────────── 6. DISTANCE VECTORS (scenes 8 and 9; lessons 2.10, 2.11) ─────────────────────────────
     A2.BF = {router: "A", dest: "F", links: {B: 3, C: 6, D: 2}, says: {B: 5, C: 3, D: 5}, totals: {B: 8, C: 9, D: 7},
              best: "D", cost: 7, order: ["B","C","D"]}      total = link cost + what the neighbour says; the minimum wins
     A2.CTI.cap = 16 (RIP: 16 means unreachable). Line A - B - C (every link cost 1), destination C. Before the cut A says
        "C: 2" via B and B says "C: 1". The B-C link breaks.
     A2.CTI.msgs[k-1] = {k, from, to, says, dist, via, stale}: message 1 is A's OLD "C: 2" that B still remembers (stale: B
        recalculates 2 + 1 = 3 via A); then they alternate: B -> A says 3 (A becomes 4), A -> B says 4 (B becomes 5), ... message k
        says k + 1 and makes the receiver k + 2, odd k: A -> B, even k: B -> A. Message 14 (B -> A, says 15) makes A 16 = infinity
        (dist Infinity), message 15 (A -> B, says infinity) makes B infinity too.
     A2.ctiAt(k) -> {A: {d, via}, B: {d, via}}  state after k messages (k = 0: A {2, "B"}, B {Infinity, null}: link just cut)
     A2.CTI_POISON.msgs: before the cut A already says "C: infinity (via you)" to B. After the cut B has no way in (dist Infinity),
        it tells A "C: infinity" and A gives up at once: msgs = [{from: "B", to: "A", says: Infinity, dist: Infinity}].
     A2.poisonAt(k) -> {A: {d, via}, B: {d, via}}  k = 0: B Infinity, A {2, "B"}; k = 1: both Infinity.

   ───────────────────────────── 7. SMALL HELPERS ─────────────────────────────
     A2.INF = Infinity        A2.fmt(v) -> "∞" | "4"        A2.need(cond, message)   throws Error("VID.a2: " + message)
     A2.clamp(x, a, b)        A2.stepAt(t, t0, dt, n) -> {n: steps started (0..n), i: current index, k: 0..1 progress of step i,
                              done: steps completed}   for "one step every dt seconds from t0"
     A2.count(a, b, k) -> integer between a and b (rounded) for counting numbers up. */
(function () {
  const root = typeof window !== "undefined" ? window : globalThis; // in Node: global.window = {VID: {}} first
  const A2 = ((root.VID = root.VID || {}).a2 = root.VID.a2 || {});
  const INF = Infinity;
  const need = (cond, message) => {
    if (!cond) throw new Error(`VID.a2: ${message}`);
  };
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const fmt = (v) => (v === INF ? "∞" : String(v).replace("-", "−"));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  // ================= 1. Dijkstra on the lesson's five-node graph =================
  const NAMES = ["A", "B", "C", "D", "E"];
  const EDGES = [["A", "B", 4], ["A", "C", 2], ["C", "B", 1], ["C", "D", 5], ["B", "D", 3], ["C", "E", 7], ["D", "E", 2]]; // prettier-ignore
  const DIJ = {
    names: NAMES,
    edges: EDGES,
    pos: { A: [60, 300], B: [250, 100], C: [250, 500], D: [470, 300], E: [560, 560] },
  };

  function dijkstra(names, edges, { directed = false, start = names[0] } = {}) {
    const adj = Object.fromEntries(names.map((n) => [n, []]));
    edges.forEach(([a, b, w]) => {
      adj[a].push([b, w, [a, b]]);
      if (!directed) adj[b].push([a, w, [a, b]]);
    });
    const dist = Object.fromEntries(names.map((n) => [n, n === start ? 0 : INF]));
    const parent = {};
    const settled = [];
    const waiting = () =>
      names
        .filter((n) => !settled.includes(n) && dist[n] < INF)
        .sort((p, q) => dist[p] - dist[q] || names.indexOf(p) - names.indexOf(q));
    const snap = () => ({ dist: { ...dist }, parent: { ...parent }, settled: settled.slice(), waiting: waiting() });
    const rounds = [];
    const snaps = [snap()];
    for (;;) {
      const [cur] = waiting();
      if (cur === undefined) break;
      const before = snap();
      settled.push(cur);
      const relax = [];
      const late = [];
      adj[cur].forEach(([to, w, edge]) => {
        const cand = dist[cur] + w;
        const old = dist[to];
        if (settled.includes(to)) {
          if (cand < old) late.push({ to, w, cand, old, edge });
          return;
        }
        const better = cand < old;
        if (better) {
          dist[to] = cand;
          parent[to] = cur;
        }
        relax.push({ to, w, cand, old, better, edge });
      });
      const after = snap();
      rounds.push({ node: cur, d: dist[cur], relax, late, before, after });
      snaps.push(after);
    }
    return { rounds, dist, parent, settled: settled.slice(), snap: (n) => snaps[clamp(n, 0, rounds.length)] };
  }
  const treeEdges = (run, upto = run.rounds.length) =>
    run.settled
      .slice(0, upto)
      .filter((n) => run.parent[n])
      .map((n) => [run.parent[n], n]);
  const routeOf = (run, node) => {
    const out = [node];
    while (run.parent[out[0]]) out.unshift(run.parent[out[0]]);
    return out;
  };
  const DIJ_RUN = dijkstra(NAMES, EDGES);

  // ================= 2. all simple routes A -> E =================
  function routes(names, edges, from, to) {
    const adj = Object.fromEntries(names.map((n) => [n, []]));
    edges.forEach(([a, b, w]) => (adj[a].push([b, w]), adj[b].push([a, w])));
    const out = [];
    (function walk(path, legs) {
      const at = path[path.length - 1];
      if (at === to)
        return void out.push({ path: path.join(""), cost: legs.reduce((s, v) => s + v, 0), hops: legs.length, legs });
      adj[at].forEach(([nb, w]) => path.includes(nb) || walk([...path, nb], [...legs, w]));
    })([from], []);
    return out.sort((p, q) => p.cost - q.cost || p.hops - q.hops || (p.path < q.path ? -1 : 1));
  }
  const ROUTES = routes(NAMES, EDGES, "A", "E");

  // ================= 3. safe settling and a negative road =================
  const TRI = { names: ["A", "B", "C"], pos: { A: [110, 320], B: [420, 120], C: [420, 520] } };
  const SAFE_EDGES = [["A", "B", 4], ["A", "C", 2], ["C", "B", 1]]; // prettier-ignore
  const safeRun = dijkstra(TRI.names, SAFE_EDGES);
  const safeRound = safeRun.rounds[1]; // A is round 0; C is next
  const SAFE = {
    edges: SAFE_EDGES,
    settle: safeRound.node,
    d: safeRound.d,
    rival: { via: "B", first: safeRun.rounds[0].after.dist.B, then: 1, total: safeRun.rounds[0].after.dist.B + 1 },
  };
  const NEG_EDGES = [["A", "B", 4], ["A", "C", 5], ["C", "B", -3]]; // prettier-ignore
  const bellman = (names, edges, start) => {
    const d = Object.fromEntries(names.map((n) => [n, n === start ? 0 : INF]));
    for (let i = 0; i < names.length; i++) edges.forEach(([a, b, w]) => d[a] + w < d[b] && (d[b] = d[a] + w));
    return d;
  };
  const NEG = {
    edges: NEG_EDGES,
    run: dijkstra(TRI.names, NEG_EDGES, { directed: true }),
    trueB: bellman(TRI.names, NEG_EDGES, "A").B,
  };

  // ================= 4. the grid =================
  const GRID = { cols: 10, rows: 7, S: [1, 3], G: [8, 3], walls: ["5,1", "5,2", "5,3", "5,4"] };
  const gridKey = (x, y) => `${x},${y}`;
  const isWall = (x, y) => GRID.walls.includes(gridKey(x, y));
  const unkey = (k) => k.split(",").map(Number);

  function gridRun(kind) {
    need(kind === "astar" || kind === "dijkstra", `gridRun: unknown kind "${kind}"`);
    const [gx, gy] = GRID.G;
    const hOf = (x, y) => (kind === "astar" ? Math.abs(x - gx) + Math.abs(y - gy) : 0);
    const SK = gridKey(...GRID.S);
    const GK = gridKey(gx, gy);
    const g = { [SK]: 0 };
    const parentOf = {};
    const seq = { [SK]: 0 };
    const open = new Set([SK]);
    const closed = [];
    const steps = [];
    const rec = (k) => {
      const [x, y] = unkey(k);
      const h = hOf(x, y);
      return { x, y, key: k, g: g[k], h, f: g[k] + h };
    };
    let order = 1;
    while (open.size) {
      const cur = [...open].map(rec).sort((p, q) => p.f - q.f || p.h - q.h || seq[p.key] - seq[q.key])[0];
      open.delete(cur.key);
      closed.push(cur.key);
      const added = [];
      if (cur.key !== GK) {
        [
          [1, 0],
          [0, 1],
          [-1, 0],
          [0, -1],
        ].forEach(([dx, dy]) => {
          // prettier-ignore
          const nx = cur.x + dx;
          const ny = cur.y + dy;
          const nk = gridKey(nx, ny);
          if (nx < 0 || ny < 0 || nx >= GRID.cols || ny >= GRID.rows || isWall(nx, ny) || closed.includes(nk)) return;
          if (g[nk] === undefined || cur.g + 1 < g[nk]) {
            g[nk] = cur.g + 1;
            parentOf[nk] = cur.key;
            if (!open.has(nk)) {
              seq[nk] = order++;
              added.push([nx, ny]);
            }
            open.add(nk);
          }
        });
      }
      steps.push({ ...cur, added, open: [...open].map(rec), parentOf: { ...parentOf } });
      if (cur.key === GK) break;
    }
    const path = [];
    for (let k = GK; k; k = parentOf[k]) path.unshift(unkey(k));
    const fAt = Object.fromEntries(steps.map((s) => [s.key, s.f]));
    const at = (n) => {
      const m = clamp(n, 0, steps.length);
      if (m === 0)
        return { closed: [], open: { [SK]: { g: 0, h: hOf(...GRID.S), f: hOf(...GRID.S) } }, cur: null, done: false };
      const s = steps[m - 1];
      return {
        closed: steps.slice(0, m).map((q) => q.key),
        open: Object.fromEntries(s.open.map((o) => [o.key, { g: o.g, h: o.h, f: o.f }])),
        cur: s.key,
        done: m === steps.length,
      };
    };
    return { steps, count: steps.length, cost: g[GK], path, fAt, at };
  }
  const RUNS = { astar: gridRun("astar"), dijkstra: gridRun("dijkstra") };
  const HONEST = {
    trueLeft: RUNS.astar.cost,
    honest: Math.abs(GRID.G[0] - GRID.S[0]) + Math.abs(GRID.G[1] - GRID.S[1]),
  };
  HONEST.doubled = 2 * HONEST.honest;

  // ================= 5. the six-router network =================
  const NET = {
    names: ["A", "B", "C", "D", "E", "F"],
    edges: [["A", "B", 3], ["A", "C", 6], ["A", "D", 2], ["B", "C", 2], ["B", "D", 4], ["C", "D", 5], ["C", "E", 1], ["C", "F", 4], ["D", "E", 3], ["E", "F", 2]], // prettier-ignore
    pos: { A: [50, 300], B: [210, 100], C: [430, 150], D: [210, 500], E: [430, 470], F: [590, 300] },
  };
  const netCache = {};
  function netDijkstra(src) {
    if (netCache[src]) return netCache[src];
    const run = dijkstra(NET.names, NET.edges, { start: src });
    const first = {};
    NET.names.forEach((v) => {
      if (v === src || run.dist[v] === INF) return;
      let k = v;
      while (run.parent[k] !== src) k = run.parent[k];
      first[v] = k;
    });
    const order = run.settled.slice(1);
    return (netCache[src] = {
      d: run.dist,
      parent: run.parent,
      first,
      order,
      tree: order.map((v) => [run.parent[v], v]),
    });
  }
  const netTable = (src) =>
    NET.names
      .filter((v) => v !== src)
      .map((dest) => ({ dest, next: netDijkstra(src).first[dest], cost: netDijkstra(src).d[dest] }));
  const hops = (src, dst) => {
    const out = [];
    for (let at = src; at !== dst; at = out[out.length - 1].next)
      out.push({ at, next: netDijkstra(at).first[dst], dest: dst, cost: netDijkstra(at).d[dst] });
    return out;
  };

  // ================= 6. distance vectors =================
  const BF = { router: "A", dest: "F", links: { B: 3, C: 6, D: 2 }, says: { B: 5, C: 3, D: 5 } };
  BF.order = Object.keys(BF.links);
  BF.totals = Object.fromEntries(BF.order.map((v) => [v, BF.links[v] + BF.says[v]]));
  BF.best = BF.order.reduce((a, v) => (BF.totals[v] < BF.totals[a] ? v : a));
  BF.cost = BF.totals[BF.best];

  const CAP = 16;
  const ctiMsgs = [];
  for (let k = 1; k <= 15; k++) {
    const says = k < 15 ? k + 1 : INF;
    const dist = k + 2 >= CAP ? INF : k + 2;
    ctiMsgs.push({
      k,
      from: k % 2 ? "A" : "B",
      to: k % 2 ? "B" : "A",
      says,
      dist,
      via: k % 2 ? "A" : "B",
      stale: k === 1,
    });
  }
  const ctiAt = (k) => {
    const st = { A: { d: 2, via: "B" }, B: { d: INF, via: null } };
    ctiMsgs
      .slice(0, clamp(k, 0, ctiMsgs.length))
      .forEach((m) => (st[m.to] = { d: m.dist, via: m.dist === INF ? null : m.via }));
    return st;
  };
  const CTI = { cap: CAP, msgs: ctiMsgs };
  const CTI_POISON = { msgs: [{ k: 1, from: "B", to: "A", says: INF, dist: INF, via: null, stale: false }] };
  const poisonAt = (k) =>
    k < 1
      ? { A: { d: 2, via: "B" }, B: { d: INF, via: null } }
      : { A: { d: INF, via: null }, B: { d: INF, via: null } };

  // ================= 7. small helpers =================
  const stepAt = (t, t0, dt, n) => {
    const u = (t - t0) / dt;
    const started = clamp(Math.floor(u) + 1, 0, n);
    const i = clamp(Math.floor(u), 0, n - 1);
    return { n: started, i, k: clamp(u - i), done: clamp(Math.floor(u), 0, n) };
  };
  const count = (a, b, k) => Math.round(a + (b - a) * clamp(k));

  Object.assign(A2, {
    INF, fmt, need, clamp, stepAt, count, DIJ, dijkstra, DIJ_RUN, treeEdges, routeOf, routes, ROUTES, TRI, SAFE, NEG, bellman,
    GRID, gridKey, isWall, gridRun, RUNS, HONEST, NET, netDijkstra, netTable, hops, TABLE_A: netTable("A"), BF, CTI, ctiAt,
    CTI_POISON, poisonAt,
  }); // prettier-ignore

  // ================= self-check against the numbers written in the storyboard =================
  const R = DIJ_RUN;
  need(R.settled.join("") === "ACBDE", "Dijkstra settle order changed");
  need(same(R.dist, { A: 0, B: 3, C: 2, D: 6, E: 8 }), "Dijkstra distances changed");
  need(same(R.parent, { B: "C", C: "A", D: "B", E: "D" }), "Dijkstra parents changed");
  need(
    same(
      R.rounds.map((r) => r.relax.map((x) => `${x.to}${x.cand}${x.better ? "+" : "-"}`).join(" ")),
      ["B4+ C2+", "B3+ D7+ E9+", "D6+", "E8+", ""],
    ),
    "Dijkstra relaxations changed",
  );
  need(
    same(treeEdges(R), [
      ["A", "C"],
      ["C", "B"],
      ["B", "D"],
      ["D", "E"],
    ]),
    "tree edges changed",
  );
  need(routeOf(R, "E").join("") === "ACBDE", "route back changed");
  need(
    ROUTES.length === 7 && ROUTES[0].path === "ACBDE" && ROUTES[0].cost === 8 && ROUTES[0].hops === 4,
    "routes changed",
  );
  need(
    ROUTES.find((r) => r.path === "ACE").cost === 9 && ROUTES.find((r) => r.path === "ABDE").cost === 9,
    "route costs changed",
  );
  need(SAFE.settle === "C" && SAFE.d === 2 && SAFE.rival.total === 5, "safe settling changed");
  const nr = NEG.run.rounds;
  need(nr.map((r) => r.node).join("") === "ABC" && nr[1].d === 4 && nr[2].d === 5, "negative run order changed");
  need(
    nr[2].late.length === 1 &&
      nr[2].late[0].to === "B" &&
      nr[2].late[0].cand === 2 &&
      nr[2].late[0].old === 4 &&
      NEG.trueB === 2,
    "negative run changed",
  );
  need(RUNS.astar.count === 20 && RUNS.dijkstra.count === 59, "grid expansion counts changed");
  need(
    RUNS.astar.cost === 11 && RUNS.dijkstra.cost === 11 && same(RUNS.astar.path, RUNS.dijkstra.path),
    "grid costs changed",
  );
  need(RUNS.astar.path.length === 12 && RUNS.astar.steps.slice(0, 4).every((s) => s.f === 7), "A* order changed");
  need(
    RUNS.astar.steps.slice(4, 13).every((s) => s.f === 9) && RUNS.astar.steps.slice(13).every((s) => s.f === 11),
    "A* f values changed",
  );
  need(HONEST.trueLeft === 11 && HONEST.honest === 7 && HONEST.doubled === 14, "honest estimate numbers changed");
  need(
    netDijkstra("A").d.F === 7 &&
      same(netDijkstra("A").tree, [
        ["A", "D"],
        ["A", "B"],
        ["B", "C"],
        ["D", "E"],
        ["E", "F"],
      ]),
    "network tree changed",
  );
  need(
    same(A2.TABLE_A.map((r) => r.next + r.cost).join(" "), "B3 B5 D2 D5 D7".split(" ").join(" ")),
    "forwarding table of A changed",
  );
  need(
    hops("A", "F")
      .map((h) => h.at + h.next)
      .join(" ") === "AD DE EF" && hops("A", "F")[0].cost === 7,
    "hops changed",
  );
  need(BF.best === "D" && BF.cost === 7 && same(BF.totals, { B: 8, C: 9, D: 7 }), "Bellman-Ford example changed");
  need(
    ctiAt(1).B.d === 3 && ctiAt(2).A.d === 4 && ctiAt(6).A.d === 8 && ctiAt(13).B.d === 15,
    "count to infinity changed",
  );
  need(ctiAt(14).A.d === INF && ctiAt(15).B.d === INF && poisonAt(1).A.d === INF, "count to infinity end changed");
})();

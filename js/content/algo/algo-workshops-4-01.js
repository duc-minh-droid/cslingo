/* Algorithms, Phase 4 workshop: build a minimum spanning tree by hand (no code).
   4.W "Build the cheapest network". Three modes share one map: Kruskal with a coach, a cut finder, and a free build
   that lets you overspend. Every total, loop and swap below comes from running the real algorithms on the map. */
(function () {
  const partScope = (NIC.shared.algoWorkshops4 = NIC.shared.algoWorkshops4 || {});

  const N = NIC;

  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);

  // Seven towns and eleven possible cables (cost = weight). All weights differ, so the cheapest network is unique.
  const POS = { A: [50, 150], B: [150, 52], C: [150, 248], D: [285, 150], E: [405, 52], F: [405, 248], G: [480, 150] };
  const EDGES = [
    ["A", "B", 7],
    ["A", "C", 4],
    ["B", "C", 9],
    ["B", "D", 5],
    ["C", "D", 8],
    ["C", "F", 10],
    ["D", "E", 3],
    ["D", "F", 2],
    ["E", "F", 11],
    ["E", "G", 6],
    ["F", "G", 12],
  ];
  const NODES = Object.keys(POS),
    NEED = NODES.length - 1;
  const nm = (i) => EDGES[i][0] + "–" + EDGES[i][1];
  const W = (i) => EDGES[i][2];
  const cost = (t) => t.reduce((s, i) => s + W(i), 0);
  const sortedIdx = EDGES.map((_, i) => i).sort((a, b) => W(a) - W(b));

  /** Edge indices of the route from a to b inside a forest, or null if they are not connected. */
  function pathIn(tree, a, b) {
    const adj = {};
    NODES.forEach((n) => (adj[n] = []));
    tree.forEach((i) => {
      const [x, y] = EDGES[i];
      adj[x].push([y, i]);
      adj[y].push([x, i]);
    });
    const prev = { [a]: null },
      q = [a];
    while (q.length) {
      const u = q.shift();
      if (u === b) break;
      for (const [v, i] of adj[u])
        if (!(v in prev)) {
          prev[v] = [u, i];
          q.push(v);
        }
    }
    if (!(b in prev)) return null;
    const out = [];
    let c = b;
    while (prev[c]) {
      out.unshift(prev[c][1]);
      c = prev[c][0];
    }
    return out;
  }
  /** The towns along a path of edges starting at `from`. */
  function pathNodes(path, from) {
    const out = [from];
    let c = from;
    path.forEach((i) => {
      c = EDGES[i][0] === c ? EDGES[i][1] : EDGES[i][0];
      out.push(c);
    });
    return out;
  }
  function groupsOf(tree) {
    const p = Object.fromEntries(NODES.map((n) => [n, n]));
    const f = (x) => (p[x] === x ? x : (p[x] = f(p[x])));
    tree.forEach((i) => (p[f(EDGES[i][0])] = f(EDGES[i][1])));
    const by = {};
    NODES.forEach((n) => (by[f(n)] = (by[f(n)] || []).concat(n)));
    return Object.values(by).sort((a, b) => NODES.indexOf(a[0]) - NODES.indexOf(b[0]));
  }

  // The real algorithms: Kruskal for the answer, plus Prim as a cross-check of the total.
  function kruskal() {
    const p = Object.fromEntries(NODES.map((n) => [n, n]));
    const f = (x) => (p[x] === x ? x : (p[x] = f(p[x])));
    const t = [];
    sortedIdx.forEach((i) => {
      const [a, b] = EDGES[i];
      if (f(a) !== f(b)) {
        p[f(a)] = f(b);
        t.push(i);
      }
    });
    return t;
  }
  function primCost() {
    const inT = new Set(["A"]);
    let c = 0;
    while (inT.size < NODES.length) {
      const i = sortedIdx.find((j) => inT.has(EDGES[j][0]) !== inT.has(EDGES[j][1]));
      c += W(i);
      inT.add(inT.has(EDGES[i][0]) ? EDGES[i][1] : EDGES[i][0]);
    }
    return c;
  }
  const MST = kruskal(),
    MSTCOST = cost(MST);
  if (primCost() !== MSTCOST) console.error("aw4: Prim and Kruskal disagree");

  const wait = (ms) => new Promise((r) => setTimeout(r, fxOn() ? ms : Math.min(ms, 650)));
  const COLS = ["blue", "violet", "amber", "teal"];
  Object.assign(partScope, {
    COLS,
    EDGES,
    MSTCOST,
    NEED,
    NODES,
    POS,
    W,
    cost,
    fxOn,
    groupsOf,
    nm,
    pathIn,
    pathNodes,
    snd,
    sortedIdx,
    wait,
  });
})();

/* algo-p2-x-01: Phase 2 (lecture 2) — graph search, A* by hand and admissible heuristics. Ported from the vault; all numbers come from the code below. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const X = (NIC.shared.algoP2x = NIC.shared.algoP2x || {});

  const reg = (m) => N.register({ subject: "algo", lecture: 2, ...m });

  // ---------- shared small builders ----------
  const table = (head, rows, mw = 660) =>
    `<table class="t" style="max-width:${mw}px"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows
      .map(
        (r) =>
          `<tr class="${r.hl ? "hl" : r.bad ? "bad" : ""}">${(r.c || r).map((c) => `<td>${c}</td>`).join("")}</tr>`,
      )
      .join("")}</table>`;
  // prettier-ignore
  const pseudo = (lines, on = []) => `<div class="pseudo">${lines.map((t, k) => `<div class="${on.includes(k) ? "on" : ""}">${t}</div>`).join("")}</div>`;
  const INF = Infinity,
    show = (v) => (v === INF ? "∞" : Number.isInteger(v) ? String(v) : (+v).toFixed(2));
  // prettier-ignore
  const f1 = (v) => (v === INF ? "∞" : Number.isInteger(v) ? String(v) : (+v).toFixed(1));

  /* ---------- a grid search used by several modules (4- or 8-connected, optional mud, weight on h) ---------- */
  // prettier-ignore
  function gridSearch({ W, H, walls = new Set(), mud = new Set(), mc = 3, S, T, conn = 4, h, eps = 1 }) {
    const k = (x, y) => x + "," + y, SK = k(...S), TK = k(...T);
    const D = conn === 8 ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const g = { [SK]: 0 }, parent = {}, closed = [], open = new Map([[SK, [S[0], S[1]]]]);
    const hh = (x, y) => (h ? eps * h(x - T[0], y - T[1]) : 0);
    while (open.size) {
      let bk = null, bf = INF, bh = INF;
      for (const [kk, [x, y]] of open) {
        const hv = hh(x, y), f = g[kk] + hv;
        if (f < bf - 1e-9 || (Math.abs(f - bf) < 1e-9 && hv < bh)) { bf = f; bh = hv; bk = kk; }
      }
      const [x, y] = open.get(bk);
      open.delete(bk); closed.push(bk);
      if (bk === TK) {
        const path = []; for (let q = TK; q; q = parent[q]) path.push(q);
        return { expanded: closed, path: path.reverse(), cost: g[TK], g };
      }
      for (const [dx, dy] of D) {
        const nx = x + dx, ny = y + dy, nk = k(nx, ny);
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || walls.has(nk) || closed.includes(nk)) continue;
        const ng = g[bk] + (dx && dy ? Math.SQRT2 : 1) * (mud.has(nk) ? mc : 1);
        if (g[nk] === undefined || ng < g[nk] - 1e-12) { g[nk] = ng; parent[nk] = bk; open.set(nk, [nx, ny]); }
      }
    }
    return { expanded: closed, path: [], cost: null, g };
  }
  // prettier-ignore
  const HEUR = {
    zero: null,
    manhattan: (dx, dy) => Math.abs(dx) + Math.abs(dy),
    euclid: (dx, dy) => Math.hypot(dx, dy),
    chebyshev: (dx, dy) => Math.max(Math.abs(dx), Math.abs(dy)),
  };

  /** Draw a grid search result on a canvas (cells, walls, mud, expanded, path). */
  // prettier-ignore
  function drawGrid(cv, { W, H, walls, mud = new Set(), S, T }, res, maxCs = 26) {
    const wrapW = cv.parentElement.clientWidth || 520;
    const CS = Math.max(10, Math.min(maxCs, Math.floor(wrapW / W)));
    const { ctx } = N.setupCanvas(cv, H * CS);
    const C = N.colors();
    const cell = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x * CS + 1, y * CS + 1, CS - 2, CS - 2); };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) cell(x, y, walls.has(x + "," + y) ? C.text : mud.has(x + "," + y) ? "rgba(255,150,0,0.30)" : C.line);
    if (res) {
      const path = new Set(res.path);
      res.expanded.forEach((q) => { if (!path.has(q)) { const [x, y] = q.split(",").map(Number); cell(x, y, "rgba(206,130,255,0.40)"); } });
      path.forEach((q) => { const [x, y] = q.split(",").map(Number); cell(x, y, C.teal); });
    }
    cell(S[0], S[1], C.amber); cell(T[0], T[1], C.rose);
  }

  /* =====================================================================
     2.1  Graphs and search problems
     ===================================================================== */
  // prettier-ignore
  const RP = { S: [2, 3], W: [0, 1], X: [0, 5], A: [3, 1], B: [3, 5], C: [5, 0], D: [5, 3], E: [5, 6], F: [7, 2], G: [9, 3] };
  // prettier-ignore
  const RE = [["S", "W", 3], ["S", "X", 3], ["W", "X", 5], ["S", "A", 3], ["S", "B", 3], ["S", "D", 6], ["A", "C", 3], ["B", "E", 3], ["C", "F", 3], ["D", "F", 3], ["D", "G", 8], ["E", "G", 5], ["F", "G", 4], ["A", "D", 4]];
  // prettier-ignore
  const RXY = (n) => ({ x: RP[n][0] * 46 + 32, y: RP[n][1] * 40 + 36 });
  // prettier-ignore
  const rh = (n) => Math.hypot(RP[n][0] - RP.G[0], RP[n][1] - RP.G[1]);
  // prettier-ignore
  const radj = (() => { const a = {}; Object.keys(RP).forEach((n) => (a[n] = [])); RE.forEach(([p, q, w]) => { a[p].push([q, w]); a[q].push([p, w]); }); return a; })();
  /** One generic search loop; only the rule that picks the next node changes. */
  // prettier-ignore
  function roadSearch(kind) {
    const key = { dijkstra: (n, g) => g, greedy: (n) => rh(n), astar: (n, g) => g + rh(n) }[kind], fifo = kind === "bfs";
    const g = { S: 0 }, par = {}, closed = [], open = ["S"];
    while (open.length) {
      let ci = 0;
      if (!fifo) { let bk = INF; open.forEach((n, i) => { const kv = key(n, g[n]); if (kv < bk || (kv === bk && n < open[ci])) { bk = kv; ci = i; } }); }
      const cur = open.splice(ci, 1)[0];
      closed.push(cur);
      if (cur === "G") break;
      for (const [m, w] of radj[cur]) {
        if (closed.includes(m)) continue;
        const ng = g[cur] + w;
        if (fifo) { if (g[m] === undefined) { g[m] = ng; par[m] = cur; open.push(m); } }
        else if (g[m] === undefined || ng < g[m]) { g[m] = ng; par[m] = cur; if (!open.includes(m)) open.push(m); }
      }
    }
    const path = []; for (let q = "G"; q; q = par[q]) path.push(q);
    return { order: closed, cost: g.G, path: path.reverse() };
  }
  // prettier-ignore
  const RS = { bfs: roadSearch("bfs"), dijkstra: roadSearch("dijkstra"), greedy: roadSearch("greedy"), astar: roadSearch("astar") };
  // prettier-ignore
  const RNAME = { bfs: "Fewest hops (BFS)", dijkstra: "Lowest g (Dijkstra)", greedy: "Lowest h (greedy)", astar: "Lowest g + h (A*)" };
  const roadFig = (res) => {
    const nodes = {},
      hl = {};
    Object.keys(RP).forEach((n) => {
      const i = res ? res.order.indexOf(n) : -1;
      nodes[n] = { ...RXY(n), sub: i >= 0 ? "#" + (i + 1) : "" };
      if (i >= 0) hl[n] = "violet";
    });
    if (res) {
      res.path.forEach((n) => (hl[n] = "teal"));
      res.path.slice(1).forEach((n, i) => (hl[`${res.path[i]}-${n}`] = "teal"));
    }
    hl.S = hl.S === "teal" ? "teal" : "amber";
    hl.G = "rose";
    return F.graph({ nodes, edges: RE, hl, w: 460, h: 300, r: 16 });
  };

  reg({
    id: "a2-graphs",
    order: 1,
    num: "2.1",
    title: "Graphs and search problems",
    blurb: "Every search problem is a graph. Switch the pick rule and watch the same map give four different searches.",
    render(root) {
      root.appendChild(header(this, ""));
      let kind = "astar";
      const card =
        el(`<div class="card"><div class="card-head"><h2>One map, four pick rules</h2><span class="faint">from S to G; edge numbers are costs</span></div>
        <div class="controls" id="sg"></div>
        <div id="fig"></div>
        <div class="stat-row"><div class="stat violet"><small>Nodes expanded</small><b id="ex"></b></div><div class="stat teal"><small>Route cost</small><b id="co"></b></div><div class="stat amber"><small>Route</small><b id="rt"></b></div></div>
        <div class="callout" id="note"></div>
        <div class="legend"><span style="--c:var(--amber)">start</span><span style="--c:var(--rose)">goal</span><span style="--c:var(--violet)">expanded (#n = order)</span><span style="--c:var(--teal)">route found</span></div></div>`);
      root.appendChild(card);
      const best = Math.min(...Object.values(RS).map((r) => r.cost));
      function draw() {
        const r = RS[kind];
        qs("#fig", card).innerHTML = `<div class="fig-wrap">${roadFig(r)}</div>`;
        qsa("#fig line.draw", card).forEach((l) => l.classList.remove("draw"));
        qs("#ex", card).textContent = `${r.order.length} of ${Object.keys(RP).length}`;
        qs("#co", card).textContent = r.cost;
        qs("#rt", card).textContent = r.path.join("→");
        const n = qs("#note", card);
        n.className = "callout " + (r.cost === best ? "teal" : "rose");
        n.innerHTML =
          r.cost === best
            ? `Cheapest route (${best}).${r.order.length < 10 ? ` It only looked at ${r.order.length} nodes.` : ""}`
            : `<b>Not the cheapest.</b> A cost-${best} route exists, but this rule never compared the full costs.`;
      }
      qs("#sg", card).appendChild(
        N.seg(
          Object.keys(RNAME).map((k) => [k, RNAME[k]]),
          kind,
          (v) => {
            kind = v;
            draw();
          },
        ),
      );
      draw();
      root.appendChild(
        predict({
          id: "a2-gr-1",
          q: "Which rule found the cost-11 route while expanding the fewest nodes?",
          opts: [
            "Lowest g, as Dijkstra does",
            "Lowest g + h, as A* does",
            "Lowest h, the greedy rule",
            "Fewest hops (BFS)",
          ],
          a: 1,
          why: "A* found cost 11 after expanding 7 nodes. Dijkstra also finds 11 but expands all 10. Greedy expands only 3 but returns 14, and fewest-hops also returns 14.",
        }),
      );
      root.appendChild(
        predict({
          id: "a2-gr-2",
          q: "The greedy rule expands just 3 nodes but returns a cost-14 route. What does it ignore?",
          opts: [
            "How far each node is from G",
            "The cost already paid to get there",
            "Which of the edges have weights on them",
            "Whether a node was seen before",
          ],
          a: 1,
          why: "Greedy ranks by h alone, so it chases whatever looks closest to G and never adds up what the route has cost so far. That is the g that A* adds back.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>graph</b> has nodes and edges; edges can be directed and can carry weights (costs).",
            "Every search problem has a <b>state-space graph</b>: states are nodes, moves are edges.",
            "All these searches run the same loop. Only the rule for <b>picking the next node</b> changes.",
            "BFS, Dijkstra, greedy and A* differ in what they guarantee and how much they explore.",
          ],
          "Same loop, different pick rule: the rule decides how fast and how right the search is.",
        ),
      );
    },
  });

  const sgGrid = (() => {
    let s = `<svg class="fig" viewBox="0 0 460 190" style="max-height:190px">`;
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 5; x++) {
        const wall = x === 2 && y < 3,
          c = wall
            ? "var(--text-dim)"
            : x === 0 && y === 3
              ? "var(--amber)"
              : x === 4 && y === 0
                ? "var(--rose)"
                : "var(--line)";
        s += `<rect class="fi" x="${14 + x * 36}" y="${14 + y * 36}" width="32" height="32" rx="6" fill="${wall ? c : `color-mix(in srgb, ${c} 25%, var(--panel-2))`}" stroke="${c}" stroke-width="2"/>`;
      }
    s += `<text x="100" y="178" class="fig-sub">grid-based: one cell = one state</text>`;
    const R = { a: [290, 40], b: [370, 28], c: [330, 90], d: [410, 100], e: [265, 120], f: [350, 150] };
    [
      ["a", "b"],
      ["a", "c"],
      ["b", "d"],
      ["c", "d"],
      ["c", "e"],
      ["c", "f"],
      ["e", "f"],
    ].forEach(
      ([p, q]) =>
        (s += `<line class="draw" x1="${R[p][0]}" y1="${R[p][1]}" x2="${R[q][0]}" y2="${R[q][1]}" stroke="var(--line-2)" stroke-width="2.5"/>`),
    );
    Object.values(R).forEach(
      ([x, y]) =>
        (s += `<circle class="fi" cx="${x}" cy="${y}" r="9" fill="var(--panel-2)" stroke="var(--blue)" stroke-width="2.5"/>`),
    );
    s += `<text x="338" y="178" class="fig-sub">roadmap: waypoints joined by roads</text></svg>`;
    return s;
  })();

  L["a2-graphs"] = {
    sum: "A graph is nodes joined by edges, and almost any search problem can be drawn as one. Searching means growing a frontier outward from the start. Breadth-first, Dijkstra, greedy and A* are the same loop with different rules for choosing which node to grow next.",
    // prettier-ignore
    steps: [
      { t: "Graph search is everywhere", b: `<p>Finding a route through a graph is one of the most reused ideas in computing. The same code shape turns up in very different places.</p><p>What changes is only what a <b>node</b> and an <b>edge</b> stand for.</p>`,
        v: table(["Application", "Node", "Edge", "Cost"], [["Robot path planning", "a position in the room", "a move to a free neighbour", "distance travelled"], ["Game AI", "a tile on the level map", "a legal step for a character", "movement effort"], ["Social network analysis", "a person", "a friendship or follow", "usually 1 per link"], ["Network routing", "a router", "a physical link", "delay or price"]]),
        c: { q: "A game character must walk across a tile map. In the graph, what is an edge?", o: ["A tile the character cannot enter", "A legal step from one tile to a neighbour", "The goal tile at the end of the route"], a: 1, why: "Nodes are the tiles. An edge joins two tiles when the character can step directly between them. Blocked tiles are simply left out." } },
      { t: "Nodes, edges and weights", b: `<p>A graph has <b>nodes</b> (the things) and <b>edges</b> (the links). Three flavours matter:</p><p><b>Undirected</b>: a link works both ways, like a two-way street.<br><b>Directed</b>: an edge has a direction, like a one-way street.<br><b>Weighted</b>: each edge carries a number, its cost.</p><span class="key">Dijkstra and A* work on weighted graphs, directed or not, as long as costs are not negative.</span>`,
        v: F.graph({ nodes: { A: { x: 60, y: 100 }, B: { x: 200, y: 40 }, C: { x: 200, y: 160 }, D: { x: 340, y: 100 } }, edges: [["A", "B", 4], ["A", "C", 2], ["B", "D", 3], ["C", "D", 6], ["B", "C", 1]], directed: true, hl: { "B-C": "blue" }, w: 400, h: 200 }) + `<div class="fig-cap">A directed, weighted graph. Each arrow can only be followed one way.</div>`,
        c: { q: "A toll road that you can only drive north, costing 3 per trip. Which graph type models it?", o: ["Undirected and unweighted", "Directed and weighted", "Undirected and weighted"], a: 1, why: "One-way means each road has a direction, and the toll gives it a cost." } },
      { t: "The state-space graph", b: `<p>Every search problem has a <b>state-space graph</b>: each possible situation (a <b>state</b>) is a node, and each legal move between situations is an edge.</p><p><b>Grid-based</b>: the world is cut into cells, and each cell links to its free neighbours.<br><b>Roadmap</b>: a handful of waypoints joined by roads, which is far smaller than a grid of the same area.</p>`,
        v: sgGrid,
        c: { q: "In a grid-based state-space graph, what is a single state?", o: ["One cell of the grid", "The whole grid at once", "One wall"], a: 0, why: "A state is one situation, here the robot standing in one cell. Moving to a neighbouring cell is an edge between two states." } },
      { t: "The graph can stay hidden", b: `<p>You rarely build the whole graph in memory. A 1,000 × 1,000 grid has a million cells, but a search only needs a <b>neighbours</b> function: <i>given this state, which states can I reach next?</i></p><p>It calls that function for each node it expands, so only the part of the graph it actually visits is ever created.</p>`,
        v: F.frames([
          { t: "Call neighbours((3, 2)) on an open grid", v: F.cells([{ v: "(3, 2)", c: "amber" }, "→", { v: "neighbours()", c: "violet" }]) },
          { t: "It returns the free cells next to it", v: F.cells([{ v: "(4,2)", c: "teal" }, { v: "(2,2)", c: "teal" }, { v: "(3,3)", c: "teal" }, { v: "(3,1)", c: "teal" }]) },
          { t: "A wall at (4, 2) is simply left out of the list", v: F.cells([{ v: "(2,2)", c: "teal" }, { v: "(3,3)", c: "teal" }, { v: "(3,1)", c: "teal" }]) },
        ]),
        c: { q: "Why do searches usually avoid storing the whole graph?", o: ["Graphs cannot be stored in a program", "Most of a large graph is never visited", "Edges do not have costs until a search starts"], a: 1, why: "A huge grid or puzzle graph is generated one neighbour list at a time, and a good search never touches most of it." } },
      { t: "Every search is the same loop", b: `<p>Keep a <b>frontier</b>: nodes seen but not yet expanded. Repeat: pick one, expand it (add its neighbours), stop when the goal is picked.</p><p>The only real design choice is the <b>pick rule</b>:</p>`,
        v: table(["Search", "Picks the frontier node with…", "Aims for"], [["Breadth-first", "the fewest hops from the start", "fewest edges"], ["Dijkstra", "the lowest cost so far, g", "cheapest route"], ["Greedy best-first", "the lowest estimate to goal, h", "speed"], { c: ["A*", "the lowest g + h", "cheapest route, less work"], hl: true }]),
        c: { q: "What is the only difference between Dijkstra and A* in the loop?", o: ["A* adds an estimate h to the ranking number", "A* never needs to store any frontier at all", "A* is restricted to maps drawn as grids"], a: 0, why: "Dijkstra ranks by g. A* ranks by g + h. The rest of the loop is identical." } },
      { t: "Same map, four searches", b: `<p>On one 10-node map from S to G, each rule gives a different story. Use the demo after this lesson to see where each one goes.</p>`,
        v: F.bars(Object.keys(RS).map((k) => [RNAME[k], RS[k].order.length, k === "astar" ? "teal" : k === "greedy" ? "amber" : "violet", `cost ${RS[k].cost}`]), { max: 10 }) + `<div class="fig-cap">Nodes expanded (bars) and the cost of the route each rule returned.</div>` },
      { t: "What each rule guarantees", b: `<p>Speed is not the whole story. Each rule also makes a promise about the route it returns:</p>`,
        v: table(["Rule", "Cheapest route?", "Catch"], [["BFS", "only if every edge costs the same", "ignores weights"], ["Dijkstra", "yes, if no edge is negative", "explores in every direction"], ["Greedy", "no", "ignores the cost already paid"], { c: ["A*", "yes, if h never overestimates", "needs a good h"], hl: true }]),
        c: { q: "Which rule can return an expensive route even though cheaper ones exist, with every cost positive?", o: ["Dijkstra", "Greedy best-first", "A* with an honest h"], a: 1, why: "Greedy only looks at the estimate to the goal, so it can walk straight into a costly detour." } },
    ],
    guide: [
      "Press each of the four pick rules in turn and watch the numbers #1, #2, … appear on the nodes.",
      "Compare the nodes expanded and the route cost across the rules.",
      "Find the rule that is both cheapest and expands the fewest nodes, then answer the questions after the demo.",
    ],
  };

  /* =====================================================================
     2.5  Admissible heuristics
     ===================================================================== */
  // prettier-ignore
  const ADP = { S: [50, 125], A: [215, 45], B: [215, 205], G: [400, 125] };
  // prettier-ignore
  const ADE = [["S", "A", 1], ["A", "G", 2], ["S", "B", 2], ["B", "G", 4]];
  // prettier-ignore
  function adSearch(hA) {
    const H = { S: 3, A: hA, B: 4, G: 0 }, adj = { S: [], A: [], B: [], G: [] };
    ADE.forEach(([a, b, w]) => { adj[a].push([b, w]); adj[b].push([a, w]); });
    const g = { S: 0 }, par = {}, closed = [], open = ["S"], fs = [];
    while (open.length) {
      let ci = 0;
      open.forEach((n, i) => { const c = open[ci], a = g[n] + H[n], b = g[c] + H[c]; if (a < b || (a === b && (H[n] < H[c] || (H[n] === H[c] && n < c)))) ci = i; });
      const cur = open.splice(ci, 1)[0];
      closed.push(cur); fs.push([cur, g[cur] + H[cur]]);
      if (cur === "G") break;
      for (const [m, w] of adj[cur]) {
        if (closed.includes(m)) continue;
        const ng = g[cur] + w;
        if (g[m] === undefined || ng < g[m]) { g[m] = ng; par[m] = cur; if (!open.includes(m)) open.push(m); }
      }
    }
    const path = []; for (let q = "G"; q; q = par[q]) path.push(q);
    return { order: closed, path: path.reverse(), cost: g.G, fs, H };
  }
  const AD_OPT = adSearch(2).cost;
  let AD_THR = 0;
  while (adSearch(AD_THR).cost === AD_OPT && AD_THR < 12) AD_THR++;
  const adFig = (r) => {
    const nodes = {},
      hl = {};
    Object.keys(ADP).forEach((n) => {
      nodes[n] = { x: ADP[n][0], y: ADP[n][1], sub: `h = ${r.H[n]}${n === "A" ? "" : ""}` };
      if (r.order.includes(n)) hl[n] = "violet";
    });
    r.path.forEach((n) => (hl[n] = "teal"));
    r.path.slice(1).forEach((n, i) => (hl[`${r.path[i]}-${n}`] = "teal"));
    hl.S = "amber";
    if (!r.path.includes("G")) hl.G = "rose";
    return F.graph({ nodes, edges: ADE, hl, w: 460, h: 250, r: 20 });
  };
  // prettier-ignore
  const ADG = { W: 14, H: 9, walls: new Set([0, 1, 2, 3, 4, 5].map((y) => "6," + y)), S: [1, 4], T: [12, 4], conn: 4 };
  // prettier-ignore
  const adGridRes = { "h = 0 (Dijkstra)": gridSearch({ ...ADG, h: null }), "Euclidean (straight line)": gridSearch({ ...ADG, h: HEUR.euclid }), "Manhattan (|dx| + |dy|)": gridSearch({ ...ADG, h: HEUR.manhattan }) };

  reg({
    id: "a2-admissible",
    order: 5,
    num: "2.5",
    title: "Admissible heuristics",
    blurb:
      "Slide the estimate for one node up and watch A* lose the cheapest route the moment it overestimates by enough.",
    render(root) {
      root.appendChild(header(this, ""));
      let hA = 2;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Change one estimate</h2><span class="faint">true cost left from A is 2</span></div>
        <div class="controls" id="sl"></div>
        <div id="fig"></div>
        <div class="stat-row"><div class="stat violet"><small>Expansion order</small><b id="ord"></b></div><div class="stat teal"><small>Cost returned</small><b id="co"></b></div><div class="stat amber"><small>Cheapest cost</small><b id="op"></b></div></div>
        <table class="t" id="fs" style="max-width:420px"></table>
        <div class="callout" id="note"></div></div>`);
      root.appendChild(card);
      const sl = N.slider("Estimate h(A)", 0, 9, 1, hA);
      qs("#sl", card).appendChild(sl);
      function draw() {
        const r = adSearch(hA),
          ok = r.cost === AD_OPT;
        qs("#fig", card).innerHTML = `<div class="fig-wrap">${adFig(r)}</div>`;
        qsa("#fig line.draw", card).forEach((l) => l.classList.remove("draw"));
        qs("#ord", card).textContent = r.order.join("→");
        qs("#co", card).textContent = r.cost;
        qs("#op", card).textContent = AD_OPT;
        qs("#fs", card).innerHTML =
          `<tr><th>expanded</th>${r.fs.map(([n]) => `<td><b>${n}</b></td>`).join("")}</tr><tr><th>its f</th>${r.fs.map(([, f]) => `<td>${f}</td>`).join("")}</tr>`;
        const n = qs("#note", card);
        n.className = "callout " + (ok ? "teal" : "rose");
        n.innerHTML = ok
          ? hA <= 2
            ? `h(A) = ${hA} never exceeds the true cost 2: <b>admissible</b>, and the route is cheapest.`
            : `h(A) = ${hA} <b>overestimates</b> (the truth is 2), but A is still tried first, so the cheapest route survives.`
          : `<b>Missed the cheapest route.</b> A looked so expensive (f = ${1 + hA}) that the goal was taken from the other branch first.`;
      }
      sl.onInput((v) => {
        hA = v;
        draw();
      });
      draw();
      root.appendChild(
        predict({
          id: "a2-adm-1",
          q: "Set h(A) = 4. The true cost left from A is 2. What does A* return?",
          opts: [
            "A route that costs 6, because the estimate is wrong",
            "The cheapest route, cost 3: this overestimate is small",
            "No route at all, since h(A) exceeds the truth",
          ],
          a: 1,
          why: "With h(A) = 4, f(A) = 1 + 4 = 5, still below f(B) = 2 + 4 = 6. A is expanded first, so the cheapest route is found. Overestimating does not always cause damage, but it removes the guarantee.",
        }),
      );
      root.appendChild(
        predict({
          id: "a2-adm-2",
          q: `What is the smallest whole value of h(A) that makes A* return the more expensive route?`,
          opts: ["3", "4", String(AD_THR), String(AD_THR + 2)],
          a: 2,
          why: `Once f(A) = 1 + h(A) reaches B's f of 6 (h(A) = 5), the tie goes to the node with the smaller h, so B and then the goal are taken first. h(A) = ${AD_THR - 1} still works.`,
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Admissible</b>: h(n) ≤ h*(n), the true cheapest cost left, for every node.",
            "With an admissible h, A* returns a cheapest route. An overestimate can hide one.",
            "Euclidean (straight-line) distance is always admissible. Manhattan distance <b>depends</b> on the moves allowed.",
            "Between 0 and the truth, a bigger admissible h means fewer expansions.",
          ],
          "Be optimistic, never pessimistic: guess low and A* stays honest.",
        ),
      );
    },
  });

  L["a2-admissible"] = {
    sum: "A heuristic is admissible when it never overestimates the true cost left. Then A* always returns a cheapest route. If h overestimates, a good route can look too expensive and be skipped. Euclidean distance is always safe; Manhattan distance is safe only when you cannot move diagonally.",
    // prettier-ignore
    steps: [
      { t: "Admissible means optimistic", b: `<p>Let $h^*(n)$ be the <b>true</b> cheapest cost from n to the goal. A heuristic is <b>admissible</b> if</p><p>$$h(n) \\le h^*(n)\\quad\\text{for every node } n$$</p><p>It may guess too low (even 0) but never too high. Getting an admissible heuristic is the crucial ingredient for using A* in practice.</p>`,
        v: table(["Node", "true cost left h*", "estimate h", "admissible?"], [["S", 3, 3, "yes (equal)"], ["A", 2, 1, "yes (lower)"], ["B", 4, 4, "yes (equal)"], { c: ["A", 2, 5, "no: 5 &gt; 2"], bad: true }]),
        c: { q: "The true cost left from a node is 7. Which estimate is not admissible?", o: ["0", "6", "9"], a: 2, why: "9 is more than the true cost 7, so it overestimates. 0 and 6 are both at or below 7." } },
      { t: "What goes wrong when h overestimates", b: `<p>The lecture's warning: if a node's estimate is <b>higher than its true cost</b>, A* thinks that node is poor value and avoids it, even when it sits on the cheapest route.</p><p>Here the cheapest route is S→A→G (cost 3). Give A the inflated estimate 6 (the truth is 2) and A* is put off.</p>`,
        v: adFig(adSearch(6)) + `<div class="fig-cap">With h(A) = 6 the search takes S→B→G, cost ${adSearch(6).cost}, instead of the cost-${AD_OPT} route.</div>`,
        c: { q: "In this story, why does A* skip the cheapest route?", o: ["A's f is inflated by the overestimate", "The edges leaving A have negative weights", "A* never visits any neighbour of the start"], a: 0, why: "f(A) = 1 + 6 = 7 looks worse than f(B) = 6, so B is expanded first." } },
      { t: "Replaying it, line by line", b: `<p>Nothing is broken in the code. The estimate simply lied, so the ranking was wrong.</p>`,
        v: F.frames([
          { t: "Expand S: A gets f = 1 + 6 = 7, B gets f = 2 + 4 = 6", v: F.cells([{ v: "A", sub: "f 7", c: "violet" }, { v: "B", sub: "f 6", c: "violet" }]) },
          { t: "B has the lower f, so B is expanded: G appears with g = 6, f = 6", v: F.cells([{ v: "A", sub: "f 7", c: "violet" }, { v: "G", sub: "f 6", c: "amber" }]) },
          { t: "G (f = 6) beats A (f = 7), so G is expanded and the search stops with cost 6", v: F.cells([{ v: "G", sub: "cost 6", c: "rose" }, "vs", { v: "S→A→G", sub: "cost 3", c: "teal" }]) },
        ]) },
      { t: "Not every overestimate hurts", b: `<p>An overestimate removes the <i>guarantee</i>, not always the result. The damage depends on whether the inflated node still outranks its rivals.</p><p>Here A's rival B has f = 6. A is only skipped once $1 + h(A)$ reaches 6.</p>`,
        v: table(["h(A)", "f(A) = 1 + h(A)", "returned cost", "cheapest route?"], [2, 4, 5, 6].map((x) => { const r = adSearch(x); return { c: [x, 1 + x, r.cost, r.cost === AD_OPT ? "yes" : "no, missed"], hl: r.cost === AD_OPT && x > 2, bad: r.cost !== AD_OPT }; })),
        c: { q: "An overestimating heuristic always makes A* return a worse route. True or false?", o: ["True", "False"], a: 1, why: "It only does so when the overestimated node loses its place in the ranking. A small overestimate can still be harmless, but you cannot count on it." } },
      { t: "Heuristics on a grid", b: `<p>On a grid the common choices are straight-line and block distances. Which are admissible depends on how you may move:</p>`,
        v: table(["Heuristic", "formula", "4 directions", "8 directions (diagonals)"], [["Manhattan", "|x − xg| + |y − yg|", "admissible", "<b>can overestimate</b>"], ["Euclidean", "√((x − xg)² + (y − yg)²)", "admissible", "admissible"], ["Chebyshev", "max(|x − xg|, |y − yg|)", "admissible (weak)", "admissible if diagonals cost 1"]]),
        c: { q: "Which heuristic is admissible whatever moves are allowed, on an open map?", o: ["Manhattan distance", "Euclidean distance", "Twice the Euclidean distance"], a: 1, why: "No route can be shorter than the straight line, so Euclidean never overestimates." } },
      { t: "Why Manhattan can overestimate", b: `<p>Move from (0,0) to (3,3). If diagonal steps are allowed (cost √2 ≈ 1.41), the best route is three diagonals: $3\\sqrt{2} \\approx 4.24$.</p><p>Manhattan distance says 3 + 3 = <b>6</b>. That is bigger than the truth, so on a map with diagonal moves Manhattan is not admissible.</p>`,
        v: F.bars([["Manhattan estimate", 6, "rose", "too high"], ["true cost, diagonals allowed", Math.SQRT2 * 3, "teal", "3 × √2"], ["Euclidean estimate", Math.hypot(3, 3), "violet", "equal: still safe"]], { max: 6, fmt: f1 }),
        c: { q: "A robot may move diagonally. To go 4 across and 4 up on an empty map, what is true of Manhattan distance (8)?", o: ["It is exactly the cheapest route cost", "It overestimates the cheapest cost, about 5.7", "It underestimates the cheapest cost"], a: 1, why: "Four diagonal moves cost 4 × 1.41 ≈ 5.7, well below 8." } },
      { t: "Tighter is better, up to the truth", b: `<p>Among admissible heuristics, <b>the larger one does less work</b>, because it is closer to the true cost. h = 0 is admissible but gives no help. The perfect h* would walk straight to the goal.</p><p>On a 4-direction map with a wall, the same search, three heuristics:</p>`,
        v: F.bars(Object.entries(adGridRes).map(([k, r], i) => [k, r.expanded.length, ["rose", "violet", "teal"][i], `cost ${r.cost}`]), { max: adGridRes["h = 0 (Dijkstra)"].expanded.length }) + `<div class="fig-cap">Cells expanded. Every row finds the same cost, because all three are admissible.</div>`,
        c: { q: "Two admissible heuristics, h1 ≤ h2 everywhere. Which usually expands fewer nodes?", o: ["h1, the smaller one", "h2, the larger one", "Neither: admissible heuristics always expand the same number"], a: 1, why: "The larger admissible estimate is closer to the truth, so more nodes are ruled out early." } },
      { t: "Inventing a heuristic: relax the problem", b: `<p>A reliable recipe: <b>remove a rule</b>, then use the exact cost of the easier problem as h.</p><p>Ignore the walls and the cheapest route is a straight line. Allow teleporting along rows and it is even cheaper. A relaxed problem can never cost <i>more</i> than the real one, so its cost is automatically admissible.</p>`,
        v: F.flow(["Real problem: walls, turns", { t: "Relax: ignore walls", c: "violet" }, { t: "h = cost of the easy problem", c: "teal" }]),
        c: { q: "Why is the cost of a relaxed problem a safe heuristic?", o: ["Fewer rules can only make routes cheaper", "Relaxed problems are always solved first by A*", "It always exactly equals the true cost here"], a: 0, why: "Any real route is also a legal route in the relaxed problem, so the relaxed optimum is at most the real optimum." } },
    ],
    guide: [
      "Drag <b>Estimate h(A)</b> from 0 up to 9, watching the route and the order change.",
      "Find the value where the cost jumps from 3 to 6.",
      "Notice the values just above 2 that overestimate yet still succeed.",
    ],
  };
  Object.assign(X, { reg, table, pseudo, INF, show, f1, gridSearch, HEUR, drawGrid });
})();

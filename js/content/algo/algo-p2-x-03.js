/* algo-p2-x-03: Phase 2 (lecture 2) — A* in code and the Internet. Ported from the vault; all numbers come from the code below. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const X = (NIC.shared.algoP2x = NIC.shared.algoP2x || {});
  const { reg, table, pseudo, INF, f1, gridSearch, HEUR, drawGrid } = X;

  /* =====================================================================
     2.7  A* in code
     ===================================================================== */
  // prettier-ignore
  const AC = { W: 14, H: 10, S: [0, 0], T: [13, 9], conn: 8, mud: new Set(), walls: new Set(["3,8", "6,8", "8,8", "3,5", "0,2", "1,6", "10,4", "11,3", "6,9", "2,1", "3,3", "3,2", "7,0", "6,0", "4,4", "7,8", "11,9", "7,1", "2,5", "4,5", "7,4"]) };
  // prettier-ignore
  const ACR = { euclid: gridSearch({ ...AC, h: HEUR.euclid }), manhattan: gridSearch({ ...AC, h: HEUR.manhattan }), zero: gridSearch({ ...AC, h: null }) };

  /** A step trace on a small 8-connected grid for the heap runner. */
  // prettier-ignore
  const HG = { W: 8, H: 5, S: [0, 2], T: [7, 2], walls: new Set(["3,1", "3,2", "3,3"]) };
  // prettier-ignore
  function heapTrace() {
    const k = (x, y) => x + "," + y, D = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    const hOf = (x, y) => Math.hypot(x - HG.T[0], y - HG.T[1]);
    const g = { [k(...HG.S)]: 0 }, par = {}, closed = [], open = new Set([k(...HG.S)]), steps = [];
    const rec = (kk) => { const [x, y] = kk.split(",").map(Number); return { k: kk, g: g[kk], h: hOf(x, y), f: g[kk] + hOf(x, y) }; };
    const sorted = () => [...open].map(rec).sort((a, b) => a.f - b.f || a.h - b.h || (a.k < b.k ? -1 : 1));
    steps.push({ cur: null, open: sorted(), closed: [], par: {}, g: { ...g } });
    while (open.size) {
      const top = sorted()[0], cur = top.k;
      open.delete(cur); closed.push(cur);
      const [x, y] = cur.split(",").map(Number);
      const before = sorted().length + 1;
      if (x === HG.T[0] && y === HG.T[1]) { const path = []; for (let q = cur; q; q = par[q]) path.push(q); steps.push({ cur, open: sorted(), closed: closed.slice(), par: { ...par }, g: { ...g }, path: path.reverse(), pop: top }); break; }
      const added = [];
      for (const [dx, dy] of D) {
        const nx = x + dx, ny = y + dy, nk = k(nx, ny);
        if (nx < 0 || ny < 0 || nx >= HG.W || ny >= HG.H || HG.walls.has(nk) || closed.includes(nk)) continue;
        const ng = g[cur] + (dx && dy ? Math.SQRT2 : 1);
        if (g[nk] === undefined || ng < g[nk] - 1e-12) { if (g[nk] === undefined) added.push(nk); g[nk] = ng; par[nk] = cur; open.add(nk); }
      }
      steps.push({ cur, open: sorted(), closed: closed.slice(), par: { ...par }, g: { ...g }, pop: top, added, before });
    }
    return steps;
  }
  const HT = heapTrace();
  function heapRun(box, life) {
    const CS = 40;
    function* frames() {
      yield {
        ...HT[0],
        cap: `Start: the heap holds only the start cell, <b>f ${f1(HT[0].open[0].f)}</b> (g 0 + h ${f1(HT[0].open[0].h)}).`,
        line: 0,
      };
      for (let i = 1; i < HT.length; i++) {
        const s = HT[i],
          prev = HT[i - 1];
        const fm = prev.open[0].f,
          tied = prev.open.filter((r) => Math.abs(r.f - fm) < 1e-9).map((r) => r.k);
        const ask =
          i >= 2 && i <= 3 && tied.length >= 1
            ? {
                q: "Which cell does heappop return next? Tap it.",
                pick: ".rn-gc.open",
                a: [prev.open[0].k],
                why: `The heap's smallest f is <b>${f1(prev.open[0].f)}</b>: g ${f1(prev.open[0].g)} + h ${f1(prev.open[0].h)}.`,
              }
            : null;
        if (s.path) {
          yield {
            ...s,
            cap: `Popped the goal (<b>f ${f1(s.pop.f)}</b>). Follow the parents back to the start: <b>${s.path.length - 1}</b> moves, cost <b>${f1(s.g[s.cur])}</b>.`,
            line: 2,
            mood: "love",
            ask,
          };
          return;
        }
        yield {
          ...s,
          cap: `Pop <b>f ${f1(s.pop.f)}</b> (the smallest in the heap). ${s.added.length ? `It pushes <b>${s.added.length}</b> new neighbour${s.added.length > 1 ? "s" : ""}; diagonal steps cost √2 ≈ 1.41.` : "Nothing new to push."} Heap size now <b>${s.open.length}</b>.`,
          line: s.added.length ? 4 : 3,
          ask,
        };
      }
    }
    F.run(box, life, {
      code: [
        "heappush(open, start)",
        "cur = heappop(open)   # smallest f",
        "if cur is the goal: rebuild the path",
        "closed.add(cur)",
        "for each free neighbour: set g, parent, heappush",
      ],
      build(stage) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${HG.W * CS} ${HG.H * CS}`);
        svg.setAttribute("class", "fig rn-svg rn-astar");
        svg.style.maxHeight = HG.H * CS + "px";
        let html = "";
        for (let y = 0; y < HG.H; y++)
          for (let x = 0; x < HG.W; x++) {
            const kk = x + "," + y,
              fixed = kk === HG.S.join() || kk === HG.T.join();
            html += `<g class="rn-gc${fixed ? (kk === HG.S.join() ? " rn-gc-start" : " rn-gc-goal") : ""}" data-k="${kk}" transform="translate(${x * CS} ${y * CS})"><rect x="2" y="2" width="${CS - 4}" height="${CS - 4}" rx="7"/><text x="${CS / 2}" y="${CS / 2 + 5}">${kk === HG.S.join() ? "S" : kk === HG.T.join() ? "G" : ""}</text></g>`;
          }
        svg.innerHTML = `<g>${html}</g>`;
        stage.appendChild(svg);
        const cells = {};
        svg.querySelectorAll(".rn-gc").forEach((c) => (cells[c.dataset.k] = { g: c, t: c.querySelector("text") }));
        const tb = document.createElement("div");
        tb.className = "rn-tbl";
        stage.appendChild(tb);
        return { cells, tb };
      },
      draw(sc, f, c) {
        const open = new Set(f.open.map((r) => r.k)),
          closed = new Set(f.closed),
          path = new Set(f.path || []);
        Object.entries(sc.cells).forEach(([kk, h]) => {
          h.g.classList.toggle("wall", HG.walls.has(kk));
          h.g.classList.toggle("open", open.has(kk));
          h.g.classList.toggle("closed", closed.has(kk));
          h.g.classList.toggle("cur", kk === f.cur);
          h.g.classList.toggle("path", path.has(kk));
          if (kk !== HG.S.join() && kk !== HG.T.join()) {
            const r = f.open.find((q) => q.k === kk);
            h.t.textContent = !path.has(kk) && r ? f1(+r.f.toFixed(1)) : "";
          }
          if (kk === f.cur && (!c.prev || c.prev.cur !== kk)) F.rn.pulse(c, h.g.querySelector("rect"));
        });
        sc.tb.innerHTML =
          table(
            ["heap order", "cell", "g", "h", "f"],
            f.open.slice(0, 4).map((r, i) => ({
              c: [i + 1, r.k, f1(+r.g.toFixed(2)), f1(+r.h.toFixed(2)), `<b>${f1(+r.f.toFixed(2))}</b>`],
              hl: i === 0,
            })),
            420,
          ) + `<div class="faint" style="margin-top:4px">${f.open.length} in the heap; the top 4 are shown</div>`;
      },
      frames,
    });
  }

  const nbFig = (() => {
    let s = `<svg class="fig" viewBox="0 0 300 190" style="max-height:190px">`;
    const off = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];
    off.forEach(([dx, dy]) => {
      const x = 60 + (dx + 1) * 62,
        y = 8 + (dy + 1) * 58,
        centre = !dx && !dy,
        diag = dx && dy;
      s += `<rect class="fi" x="${x}" y="${y}" width="54" height="50" rx="9" fill="${centre ? "color-mix(in srgb, var(--amber) 22%, var(--panel-2))" : "var(--panel-2)"}" stroke="${centre ? "var(--amber)" : diag ? "var(--violet)" : "var(--blue)"}" stroke-width="2"/><text x="${x + 27}" y="${y + 24}" class="fig-box">${centre ? "node" : `(${dx > 0 ? "+" : ""}${dx}, ${dy > 0 ? "+" : ""}${dy})`}</text>${centre ? "" : `<text x="${x + 27}" y="${y + 40}" class="fig-box-s">${diag ? "cost √2" : "cost 1"}</text>`}`;
    });
    return s + `</svg>`;
  })();

  reg({
    id: "a2-astar-code",
    order: 7,
    num: "2.7",
    title: "A* in code",
    blurb:
      "Node class, heuristic, eight neighbours and a heap. Then compare Euclidean and Manhattan on a map with diagonals.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let hk = "euclid";
      const NAMEH = { euclid: "Euclidean", manhattan: "Manhattan", zero: "h = 0 (Dijkstra)" };
      const card =
        el(`<div class="card"><div class="card-head"><h2>Which heuristic? (8 directions)</h2><span class="faint">diagonal steps cost √2 ≈ 1.41</span></div>
        <div class="controls" id="sg"></div><canvas class="viz" id="cv"></canvas>
        <div class="stat-row"><div class="stat violet"><small>Cells expanded</small><b id="ex"></b></div><div class="stat teal"><small>Path cost</small><b id="co"></b></div><div class="stat amber"><small>Best known</small><b id="bs"></b></div></div>
        <div class="callout" id="note"></div></div>`);
      root.appendChild(card);
      const best = ACR.euclid.cost;
      function draw() {
        const r = ACR[hk];
        drawGrid(qs("#cv", card), AC, r, 34);
        qs("#ex", card).textContent = r.expanded.length;
        qs("#co", card).textContent = r.cost.toFixed(2);
        qs("#bs", card).textContent = best.toFixed(2);
        const n = qs("#note", card),
          bad = r.cost > best + 1e-6;
        n.className = "callout " + (bad ? "rose" : "teal");
        n.innerHTML = bad
          ? `<b>Longer than needed.</b> With diagonal moves, Manhattan overestimates, so A* lost the best route.`
          : hk === "zero"
            ? "Always optimal, but it expands the most cells."
            : "Optimal: this heuristic never overestimates here.";
      }
      qs("#sg", card).appendChild(
        N.seg(
          Object.keys(NAMEH).map((k) => [k, NAMEH[k]]),
          hk,
          (v) => {
            hk = v;
            draw();
          },
        ),
      );
      draw();
      life.onResize(draw);
      root.appendChild(
        predict({
          id: "a2-ac-1",
          q: "Switch to Manhattan on this 8-direction map. What do you expect?",
          opts: [
            "Fewer cells expanded, but a longer path",
            "More cells expanded and a shorter path",
            "Exactly the same cells and the same path",
          ],
          a: 0,
          why: `Manhattan overestimates when diagonals are allowed, so A* becomes greedier: ${ACR.manhattan.expanded.length} cells expanded against ${ACR.euclid.expanded.length}, but the path costs ${ACR.manhattan.cost.toFixed(2)} instead of ${ACR.euclid.cost.toFixed(2)}.`,
        }),
      );
      root.appendChild(
        predict({
          id: "a2-ac-2",
          q: "A path uses 3 straight moves and 2 diagonal moves (each diagonal costs √2 ≈ 1.4). Roughly what does it cost?",
          opts: ["about 4", "about 6", "about 8", "about 10"],
          a: 1,
          why: "3 × 1 + 2 × 1.41 = 3 + 2.8 ≈ 5.8, so about 6.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A node stores <b>position, parent, g, h, f</b>; comparing by f lets a heap order the open list.",
            "<code>heappop</code> gives the smallest f; a <b>closed set</b> remembers expanded cells.",
            "8-direction movement means 8 neighbours: check the bounds and the obstacles.",
            "At the goal, follow <b>parent</b> pointers back and reverse the list.",
          ],
          "Open list in a heap, closed set in a set, parent pointers for the path.",
        ),
      );
    },
  });

  /* A 4 x 5 patch of grid: the straight line to the goal against the walk along the blocks. */
  // prettier-ignore
  function hFig(host) {
    const box = el(`<div class="fig-wrap"></div>`), cap = el(`<div class="fig-cap"></div>`), P = (x, y) => [50 + x * 56, 232 - y * 52];
    host.append(N.seg([["both", "Show both"], ["euclid", "Straight line (Euclidean)"], ["manh", "Along the grid (Manhattan)"]], "both", (v) => draw(v)), box, cap);
    const draw = (m) => {
      const [sx, sy] = P(0, 0), [gx, gy] = P(3, 4), on = (k) => (m === "both" || m === k ? 1 : 0.18);
      let s = `<svg class="fig" viewBox="0 0 400 260" style="max-height:260px" role="img" aria-label="Goal 3 across and 4 up: straight line 5, along the grid 3 + 4 = 7">`;
      for (let x = 0; x < 4; x++) for (let y = 0; y < 5; y++) s += `<circle cx="${P(x, y)[0]}" cy="${P(x, y)[1]}" r="4" fill="var(--line-2)"/>`;
      s += `<path d="M${sx} ${sy} H${gx} V${gy}" fill="none" stroke="var(--blue)" stroke-width="6" stroke-linejoin="round" opacity="${on("manh")}"/><line x1="${sx}" y1="${sy}" x2="${gx}" y2="${gy}" stroke="var(--violet)" stroke-width="6" stroke-linecap="round" opacity="${on("euclid")}"/>`;
      s += `<text x="${(sx + gx) / 2}" y="${sy + 22}" class="fig-box" opacity="${on("manh")}">3 across</text><text x="${gx + 12}" y="${(sy + gy) / 2 + 4}" class="fig-box" style="text-anchor:start" opacity="${on("manh")}">4 up</text><text x="${(sx + gx) / 2 - 12}" y="${(sy + gy) / 2 - 8}" class="fig-box" style="text-anchor:end" opacity="${on("euclid")}">straight: 5</text>`;
      s += `<circle cx="${sx}" cy="${sy}" r="13" fill="color-mix(in srgb, var(--amber) 35%, var(--panel-2))" stroke="var(--amber)" stroke-width="3"/><text x="${sx}" y="${sy + 5}" class="fig-n">S</text><circle cx="${gx}" cy="${gy}" r="13" fill="color-mix(in srgb, var(--rose) 30%, var(--panel-2))" stroke="var(--rose)" stroke-width="3"/><text x="${gx}" y="${gy + 5}" class="fig-n">G</text>`;
      box.innerHTML = s + "</svg>";
      cap.textContent = m === "euclid" ? "As the crow flies: a 3-4-5 triangle, so 5." : m === "manh" ? "Walking the blocks: 3 across plus 4 up is 7." : "The straight line (5) is never longer than the walk along the grid (7).";
    };
    draw("both");
  }
  L["a2-astar-code"] = {
    sum: "Turning A* into code needs four ingredients: a Node record (position, parent, g, h, f), a heuristic function, a neighbour generator and a priority queue. A closed set stops repeated work, and parent pointers give you the path at the end.",
    // prettier-ignore
    steps: [
      { t: "The Node record", b: `<p>Each cell the search touches becomes a <b>Node</b> that remembers its bookkeeping:</p><p><code>position</code>: the (x, y) cell.<br><code>parent</code>: the node we came from (for the path).<br><code>g</code>: cost from the start. <code>h</code>: heuristic to the goal. <code>f = g + h</code>.</p><p>Nodes are compared by <b>f</b>, so the priority queue can sort them.</p>`,
        v: pseudo(["class Node:", "    def __init__(self, position, parent=None):", "        self.position = position;  self.parent = parent", "        self.g = 0;  self.h = 0;  self.f = 0", "    def __lt__(self, other):   return self.f < other.f", "    def __eq__(self, other):   return self.position == other.position", "    def __hash__(self):        return hash(self.position)"], [4]),
        c: { q: "Why does the Node class define a comparison on f?", o: ["So the heap can order nodes by their score", "So two nodes at different cells are treated as equal", "So g is recomputed each time"], a: 0, why: "heapq compares items with &lt;. Defining it on f makes heappop return the node with the lowest f." } },
      { t: "The heuristic function", b: `<p>The search needs a quick guess of how far each cell is from the goal. There are two everyday ways to measure it: <b>as the crow flies</b> (the straight line, called Euclidean distance) or <b>by walking the blocks</b> (steps across plus steps up, called Manhattan distance).</p><p>For example, if the goal is 3 cells across and 4 up, the crow flies 5 but a walker on the grid takes 3 + 4 = 7 steps. A straight line is never longer than any real path, so with 8-direction movement it is a safe, optimistic guess. Switch between the two below.</p><p>The exercise then asks you to add the Manhattan version and compare how the two behave.</p><details class="math-more"><summary>Show the maths and the code</summary><p>$$h = \\sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$$</p><p>Manhattan distance is $|x_1 - x_2| + |y_1 - y_2|$.</p>${pseudo(["def heuristic(a, b):", "    return math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2)", "", "def manhattan_distance(a, b):", "    return abs(a[0] - b[0]) + abs(a[1] - b[1])"])}</details>`,
        v: (box) => hFig(box),
        c: { q: "The goal is 3 cells across and 4 up from the start. What do the two guesses say?", o: ["Crow flies 7, grid steps 5", "Crow flies 5, grid steps 7", "Both guesses say 5"], a: 1, why: "The straight line is the 3-4-5 triangle's long side, 5. Walking along the grid costs 3 across plus 4 up, 7. The straight line can only be shorter, which is why it never overestimates." } },
      { t: "Neighbours: eight directions", b: `<p><code>get_neighbors</code> tries the 8 offsets around a node, and keeps those that are <b>inside the grid</b> and <b>not an obstacle</b> (value 1).</p><p>Straight moves cost 1, diagonal moves cost $\\sqrt{2}$, which is why Euclidean distance is the natural heuristic here.</p>`,
        v: nbFig,
        c: { q: "A cell in a corner of the grid, with no obstacles, has how many valid neighbours (8 directions)?", o: ["3", "5", "8"], a: 0, why: "Only the 3 offsets that stay inside the grid survive the boundary check: two straight, one diagonal." } },
      { t: "Open list as a heap", b: `<p>The <b>open list</b> is a heap (<code>heapq</code>): <code>heappush</code> adds, <code>heappop</code> returns the lowest f in about log n time. A <b>closed set</b> holds cells already expanded.</p><p>Python's heap cannot lower a stored entry, so the exercise also keeps a dictionary (<code>open_dict</code>) of the best node per cell to compare new costs against.</p>`,
        v: (box, life) => heapRun(box, life),
        c: { q: "Why keep a closed set?", o: ["To avoid expanding the same cell again", "To store the open cells in order", "To hold the obstacles"], a: 0, why: "Once a cell is expanded its best cost is known, so it must not be processed again." } },
      { t: "Rebuilding the path", b: `<p>Every node remembers its <b>parent</b>. When the goal is popped, walk backwards from the goal to the start, then reverse the list.</p>`,
        v: F.frames([
          { t: "Start at the goal node", v: F.cells([{ v: "G", c: "rose" }]) },
          { t: "Follow parent pointers back", v: F.cells([{ v: "G", c: "rose" }, "←", { v: "d" }, "←", { v: "c" }, "←", { v: "b" }, "←", { v: "S", c: "amber" }]) },
          { t: "Reverse: start to goal", v: F.cells([{ v: "S", c: "amber" }, "→", { v: "b" }, "→", { v: "c" }, "→", { v: "d" }, "→", { v: "G", c: "rose" }]) },
        ]),
        c: { q: "The loop that follows parents gives the cells in which order?", o: ["Goal to start, so it must be reversed", "Start to goal, ready to use as is", "In order of f"], a: 0, why: "You begin at the goal and step to each parent, so the list comes out backwards." } },
      { t: "Counting the cost of a path", b: `<p>The notebook sums the real step lengths: each straight step 1, each diagonal step $\\sqrt{2}$.</p><p>Three straight moves and two diagonals cost $3 + 2\\sqrt{2} \\approx 5.83$.</p><p>The number of <b>cells in the path</b> is one more than the number of moves.</p>`,
        v: F.cells([{ v: "1", c: "teal" }, "+", { v: "1", c: "teal" }, "+", { v: "1", c: "teal" }, "+", { v: "√2", c: "violet" }, "+", { v: "√2", c: "violet" }, "=", { v: "5.83", c: "amber" }]),
        c: { q: "A path has 6 cells. How many moves does it contain?", o: ["5", "6", "7"], a: 0, why: "Moves join consecutive cells, so n cells make n − 1 moves." } },
      { t: "Experiment: Manhattan versus Euclidean", b: `<p>The notebook's extension: implement Manhattan distance and compare. On the demo map the answer is surprising:</p>`,
        v: table(["Heuristic", "cells expanded", "path cost"], [["Euclidean", ACR.euclid.expanded.length, ACR.euclid.cost.toFixed(2)], { c: ["Manhattan", ACR.manhattan.expanded.length, ACR.manhattan.cost.toFixed(2)], bad: true }, ["h = 0", ACR.zero.expanded.length, ACR.zero.cost.toFixed(2)]]) + `<div class="fig-cap">Manhattan expands fewer cells but returns a longer path, since it overestimates with diagonal moves.</div>`,
        c: { q: "Which statement describes the experiment?", o: ["Manhattan is faster but gives up optimality here", "Manhattan is slower and always optimal", "All three heuristics return exactly the same path"], a: 0, why: "The overestimate makes A* greedier: fewer cells, but a longer route." } },
    ],
    guide: [
      "Press each heuristic and compare the cells expanded with the path cost.",
      "Which heuristic gives the cheapest path? Which expands the fewest cells?",
      "Then answer the questions after the demo.",
    ],
  };

  /* =====================================================================
     Network model shared by 2.8 and 2.9
     ===================================================================== */
  // prettier-ignore
  const NP = { A: [45, 130], B: [150, 45], C: [285, 65], D: [150, 215], E: [285, 205], F: [430, 135] };
  // prettier-ignore
  const NNODES = Object.keys(NP);
  // prettier-ignore
  const NE0 = [["A", "B", 3], ["A", "C", 6], ["A", "D", 2], ["B", "C", 2], ["B", "D", 4], ["C", "D", 5], ["C", "E", 1], ["C", "F", 4], ["D", "E", 3], ["E", "F", 2]];
  /** Dijkstra with the lecture's table: init row (neighbours of src), then one row per node added to N'. */
  // prettier-ignore
  function netDijkstra(src, edges) {
    const adj = {}; NNODES.forEach((n) => (adj[n] = []));
    edges.forEach(([a, b, w]) => { if (w < INF) { adj[a].push([b, w]); adj[b].push([a, w]); } });
    const d = {}, p = {}, done = [src], rows = [];
    NNODES.forEach((n) => (d[n] = INF)); d[src] = 0;
    adj[src].forEach(([v, w]) => { d[v] = w; p[v] = src; });
    rows.push({ w: null, Np: done.slice(), d: { ...d }, p: { ...p } });
    while (done.length < NNODES.length) {
      let w = null;
      NNODES.forEach((n) => { if (!done.includes(n) && d[n] < INF && (w === null || d[n] < d[w])) w = n; });
      if (w === null) break;
      done.push(w);
      adj[w].forEach(([v, c]) => { if (!done.includes(v) && d[w] + c < d[v]) { d[v] = d[w] + c; p[v] = w; } });
      rows.push({ w, Np: done.slice(), d: { ...d }, p: { ...p } });
    }
    const first = {};
    NNODES.forEach((v) => { if (v === src || d[v] === INF) return; let k = v; while (p[k] !== src) k = p[k]; first[v] = k; });
    return { d, p, rows, first };
  }
  // prettier-ignore
  const netTables = (edges) => Object.fromEntries(NNODES.map((n) => [n, netDijkstra(n, edges)]));
  // prettier-ignore
  const netFig = (edges, { hl = {}, sub = {}, w = 470, h = 270 } = {}) => F.graph({ nodes: Object.fromEntries(NNODES.map((n) => [n, { x: NP[n][0], y: NP[n][1], sub: sub[n] }])), edges: edges.filter((e) => e[2] < INF), hl, w, h, r: 18 });
  const NT0 = netTables(NE0);
  // prettier-ignore
  const treeHl = (T, src) => { const hl = { [src]: "amber" }; NNODES.forEach((v) => { if (T.p[v] && T.d[v] < INF) { hl[`${T.p[v]}-${v}`] = "teal"; hl[v] = "teal"; } }); return hl; };
  const stackSvg = (() => {
    const L5 = ["Application", "Transport", "Network", "Data link", "Physical"];
    let s = `<svg class="fig" viewBox="0 0 470 210" style="max-height:210px">`;
    const col = (x, layers, title) => {
      s += `<text x="${x + 55}" y="14" class="fig-sub">${title}</text>`;
      L5.forEach((n, i) => {
        const on = layers.includes(i);
        s += `<rect class="fi" x="${x}" y="${22 + i * 36}" width="110" height="30" rx="8" fill="${on ? (i === 2 ? "color-mix(in srgb, var(--teal) 20%, var(--panel-2))" : "var(--panel-2)") : "none"}" stroke="${on ? (i === 2 ? "var(--teal)" : "var(--line-2)") : "var(--line)"}" stroke-width="2" ${on ? "" : 'stroke-dasharray="4 4"'}/><text x="${x + 55}" y="${42 + i * 36}" class="fig-box" style="${on ? "" : "opacity:.35"}">${n}</text>`;
      });
    };
    col(10, [0, 1, 2, 3, 4], "your laptop");
    col(180, [2, 3, 4], "a router");
    col(350, [0, 1, 2, 3, 4], "the server");
    s += `<path d="M123 132 L177 132" stroke="var(--text-faint)" stroke-width="2"/><path d="M293 132 L347 132" stroke="var(--text-faint)" stroke-width="2"/></svg>`;
    return s;
  })();

  reg({
    id: "a2-internet",
    order: 8,
    num: "2.8",
    title: "The Internet as a graph",
    blurb: "Send a packet hop by hop through forwarding tables, then break a link and watch the tables change.",
    // prettier-ignore
    render(root, life) {
      root.appendChild(header(this, ""));
      let src = "A", dst = "F", cut = false;
      const card = el(`<div class="card"><div class="card-head"><h2>Send a packet</h2><span class="faint">every router only looks at its own table</span></div>
        <div class="controls"><span class="faint">From</span><span id="sa"></span><span class="faint">To</span><span id="sb"></span></div>
        <div class="controls"><label class="field"><input type="checkbox" id="cut"> Link D–E fails</label><button class="btn primary" id="go">Send packet</button></div>
        <div class="grid side"><div id="fig"></div><div><div id="path"></div><div id="tbl"></div></div></div></div>`);
      root.appendChild(card);
      const pick = (id, cur, f) => qs(id, card).appendChild(N.seg(NNODES.map((n) => [n, n]), cur, f));
      const edges = () => NE0.map(([a, b, w]) => (cut && a === "D" && b === "E" ? [a, b, INF] : [a, b, w]));
      function route() {
        const T = netTables(edges()), path = [src]; let cur = src;
        while (cur !== dst && path.length < 10) { const nx = T[cur].first[dst]; if (!nx) break; path.push(nx); cur = nx; }
        return { T, path, ok: cur === dst };
      }
      function draw(upto) {
        const { T, path, ok } = route(), shown = upto === undefined ? path.length : upto;
        const hl = { [src]: "amber", [dst]: "rose" };
        path.slice(0, shown).forEach((n) => (hl[n] = hl[n] || "teal"));
        path.slice(1, shown).forEach((n, i) => (hl[`${path[i]}-${n}`] = "teal"));
        qs("#fig", card).innerHTML = `<div class="fig-wrap">${netFig(edges(), { hl })}</div>`;
        qsa("#fig line.draw", card).forEach((l) => l.classList.remove("draw"));
        qs("#path", card).innerHTML = src === dst ? `<p class="faint">Pick two different routers.</p>` : `<p><b>Route:</b> <span class="mono">${path.slice(0, shown).join(" → ")}</span>${shown === path.length && ok ? ` · cost <b>${T[src].d[dst]}</b>` : ""}</p>`;
        const rows = NNODES.filter((n) => n !== src).map((n) => ({ c: [`<b>${n}</b>`, T[src].d[n] === INF ? "∞" : T[src].d[n], T[src].first[n] || "–"], hl: n === dst }));
        qs("#tbl", card).innerHTML = `<div class="faint">Forwarding table of router ${src}</div>` + table(["destination", "cost", "next hop"], rows, 360);
      }
      pick("#sa", src, (v) => { src = v; draw(); });
      pick("#sb", dst, (v) => { dst = v; draw(); });
      qs("#cut", card).onchange = (e) => { cut = e.target.checked; draw(); };
      let timer = 0;
      qs("#go", card).onclick = () => {
        const { path } = route(); let ti = 1; draw(1);
        clearInterval(timer);
        timer = life.interval(() => { ti++; draw(ti); if (ti >= path.length) clearInterval(timer); }, 450);
      };
      draw();
      root.appendChild(predict({ id: "a2-in-1", q: "Router A sends a packet to F. What does A decide by itself?", opts: ["The entire route to F, which is written onto the packet", "Only the next hop, read from its own forwarding table", "Nothing: a central server chooses every hop"], a: 1,
        why: "Forwarding is local. Each router looks up the destination in its table and passes the packet to one neighbour. The route emerges from many such lookups." }));
      root.appendChild(predict({ id: "a2-in-2", q: "Tick <b>Link D–E fails</b> and send A → F again. What changes?", opts: ["The route and its cost: the tables are recomputed", "Nothing: routers never change their tables", "The packet is lost for good"], a: 0,
        why: "With D–E gone, the cheapest A→F route becomes A→B→C→E→F at cost 8 instead of A→D→E→F at 7. The tables are rebuilt from the changed graph and the packet still arrives." }));
      root.appendChild(takeaways([
        "<b>Routing</b> finds end-to-end paths; <b>forwarding</b> is the local table lookup for each packet.",
        "Messages are cut into <b>packets</b> that are forwarded hop by hop.",
        "Model the network as a graph <code>G = (N, E)</code> with a cost on every link.",
        "Routing algorithms are classified: global or decentralised, static or dynamic, load-sensitive or not.",
      ], "Routing computes the tables; forwarding uses them, one hop at a time."));
    },
  });

  /* Pick a router: its neighbours light up with the link cost, everything else is infinity. */
  // prettier-ignore
  function netPick(host) {
    const fig = el(`<div class="fig-wrap"></div>`), say = el(`<div class="callout"></div>`);
    host.append(N.seg(NNODES.map((n) => [n, n]), "A", (v) => draw(v)), fig, say);
    const draw = (r) => {
      const nb = NE0.filter((e) => e[0] === r || e[1] === r).map(([a, b, w]) => [a === r ? b : a, w]), hl = { [r]: "amber" }, sub = {};
      nb.forEach(([n, w]) => { hl[n] = "teal"; hl[`${r}-${n}`] = "teal"; hl[`${n}-${r}`] = "teal"; sub[n] = "cost " + w; });
      NNODES.filter((n) => n !== r && !sub[n]).forEach((n) => (sub[n] = "cost ∞"));
      fig.innerHTML = netFig(NE0, { hl, sub });
      fig.querySelectorAll("line.draw").forEach((l) => l.classList.remove("draw"));
      say.className = "callout teal";
      say.innerHTML = `Router <b>${r}</b> has ${nb.length} neighbours: ${nb.map(([n, w]) => `<b>${n}</b> (cost ${w})`).join(", ")}. To the others the direct cost is <b>infinity</b>: there is no link.`;
    };
    draw("A");
  }

  /* Pick a route from A to F: the cost adds up link by link, and fewer hops is not always cheaper. */
  // prettier-ignore
  function pathPick(host) {
    const ROUTES = ["ADEF", "ABCF", "ACF", "ADCF"].map((s) => s.split("")), cost = (a, b) => NE0.find((e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))[2];
    const fig = el(`<div class="fig-wrap"></div>`), say = el(`<div class="callout"></div>`), best = Math.min(...ROUTES.map((r) => r.slice(1).reduce((t, n, i) => t + cost(r[i], n), 0)));
    host.append(N.seg(ROUTES.map((r, i) => [i, r.join(" → ")]), 0, (v) => draw(+v)), fig, say);
    const draw = (i) => {
      const p = ROUTES[i], ws = p.slice(1).map((n, k) => cost(p[k], n)), tot = ws.reduce((a, b) => a + b, 0), hl = { [p[0]]: "amber", F: "rose" };
      p.forEach((n) => (hl[n] = hl[n] || "teal"));
      p.slice(1).forEach((n, k) => (hl[`${p[k]}-${n}`] = "teal"));
      fig.innerHTML = netFig(NE0, { hl });
      fig.querySelectorAll("line.draw").forEach((l) => l.classList.remove("draw"));
      say.className = "callout " + (tot === best ? "teal" : "amber");
      say.innerHTML = `<b>${p.join(" → ")}</b>: ${ws.join(" + ")} = <b>${tot}</b> in ${ws.length} hops. ${tot === best ? "The cheapest of the four." : `${tot - best} more than the cheapest.`}`;
    };
    draw(0);
  }
  L["a2-internet"] = {
    sum: "The Internet is a network of networks, run by layered protocols. A router works at the network layer: routing algorithms fill its forwarding table with a next hop for each destination, and forwarding then moves every packet one hop at a time. To design routing we model the network as a weighted graph.",
    // prettier-ignore
    steps: [
      { t: "What is the Internet?", b: `<p>No single machine is "the Internet". It is a huge <b>network of networks</b>, made of five kinds of ingredient:</p>`,
        v: table(["Ingredient", "Examples"], [["Applications", "web browser, video calls, games"], ["Computing devices", "laptops, phones, servers"], ["Networking devices", "routers, switches"], ["Physical medium", "optical fibre, coaxial cable, copper, radio, satellite"], ["Protocols", "rules for sending and receiving, e.g. TCP and IP"]]),
        c: { q: "Which of these is a protocol rather than a device?", o: ["A router", "IP", "An optical fibre"], a: 1, why: "A protocol is a set of rules (like IP or TCP). Routers and fibres are hardware." } },
      { t: "The layers (TCP/IP stack)", b: `<p>Functions are split into <b>layers</b>: application, transport, network, data link, physical. A message passes down the stack on your device, across the network, and up the stack at the destination.</p><p>A <b>router</b> only needs the bottom three layers. It reads the destination address at the <b>network layer</b> and decides where to send the packet next.</p>`,
        v: stackSvg,
        c: { q: "At which layer does a router read the destination address to pick the next hop?", o: ["Application layer", "Network layer", "Physical layer"], a: 1, why: "The network layer is about addressing and routing between networks." } },
      { t: "Routing versus forwarding", b: `<p>Two jobs that are often confused:</p><p><b>Routing</b>: work out good end-to-end paths. This is the slow, algorithmic job (Dijkstra, Bellman–Ford) and it fills the tables.</p><p><b>Forwarding</b>: for each arriving packet, look up its destination in the table and push it out of the right port. This is fast and local.</p>`,
        v: F.compare({ title: "Routing", c: "violet", body: "decides the whole path<br>runs the algorithm<br>updates the table" }, { title: "Forwarding", c: "teal", body: "one lookup per packet<br>uses the table<br>happens at wire speed" }),
        c: { q: "A router consults its table to send one arriving packet out of port 3. That is…", o: ["Forwarding", "Route computing", "Broadcast flooding"], a: 0, why: "Using an existing table entry for one packet is forwarding. Building the table is routing." } },
      { t: "Packet switching", b: `<p>A message is chopped into <b>packets</b>. Each packet is sent into the network on its own and forwarded hop by hop; routers receive a whole packet, then pass it on (store and forward).</p><p>Packets of the same message normally take the same path, but need not: if tables change they can be rerouted.</p>`,
        v: F.frames([
          { t: "A file is split into packets", v: F.cells([{ v: "1", c: "violet" }, { v: "2", c: "violet" }, { v: "3", c: "violet" }, { v: "4", c: "violet" }], { label: "message" }) },
          { t: "Each packet is forwarded hop by hop", v: F.cells([{ v: "A" }, "→", { v: "D", c: "teal" }, "→", { v: "E", c: "teal" }, "→", { v: "F" }]) },
          { t: "At the end the packets are put back in order", v: F.cells([{ v: "1", c: "teal" }, { v: "2", c: "teal" }, { v: "3", c: "teal" }, { v: "4", c: "teal" }], { label: "rebuilt" }) },
        ]),
        c: { q: "What is a packet?", o: ["A small chunk of a message, forwarded alone", "A whole file that must arrive in one piece", "A router's table of next hops and costs"], a: 0, why: "Messages are split up so that the network can share its links among many senders." } },
      { t: "Inside a router", b: `<p>A router has <b>input ports</b>, a <b>switching fabric</b>, <b>output ports</b>, and a <b>routing processor</b> that runs the routing algorithm and writes the forwarding table.</p><p>Packets stream through the fast path; the processor works in the background.</p>`,
        v: F.flow(["Input port", { t: "Switching fabric", c: "violet" }, "Output port"]) + `<div class="fig-cap">The routing processor sits above this path and updates the forwarding table it consults.</div>`,
        c: { q: "Which part of a router runs the routing algorithm?", o: ["The routing processor", "The output port", "The switching fabric"], a: 0, why: "The routing processor builds the tables. Ports and the fabric simply move packets." } },
      { t: "Graph abstraction", b: `<p>To plan routes, draw the network as a picture: every router is a dot and every link is a line with a number on it, the link's <b>cost</b> (delay, price or congestion). Two routers joined by a line are <b>neighbours</b>.</p><p>If there is no line between two routers there is no direct link, and we say the cost is <b>infinity</b>: "not possible in one hop". Links work both ways, so the cost is the same in each direction.</p><p>For example, router A has three links, to B (cost 3), C (cost 6) and D (cost 2). It has no direct link to E or F. Pick a router below to see its neighbours.</p><details class="math-more"><summary>Show the maths</summary><p>The network is a graph $G = (N, E)$: <b>N</b> is the set of routers and <b>E</b> the set of links. For the six routers here, $N = \\{A, B, C, D, E, F\\}$ and E has ten links.</p><p>Each link has a <b>cost</b> $c(x, y)$. If there is no link, $c(x, y) = \\infty$. Links are undirected, so $c(x, y) = c(y, x)$. If $(x, y) \\in E$, y is a <b>neighbour</b> of x.</p></details>`,
        v: (box) => netPick(box),
        c: { q: "Look at the six-router network. Which pair of routers are NOT neighbours?", o: ["B and C", "A and E", "A and D"], a: 1, why: "Neighbours need a link between them. There is no A–E link, so its cost is infinity and a packet needs more than one hop. B–C and A–D are both links in the picture." } },
      { t: "Path cost and least-cost paths", b: `<p>A <b>path</b> is a chain of links that takes you from one router to another. Its <b>cost</b> is what you get when you add up the numbers on the links you walk along. Routing is the job of finding the <b>cheapest</b> path.</p><p>The cheapest path is not always the one with the fewest hops. From A to F, A → C → F is only 2 hops but costs 6 + 4 = 10, while A → D → E → F is 3 hops and costs 2 + 3 + 2 = 7. Pick a route below to watch it add up.</p><details class="math-more"><summary>Show the maths</summary><p>$$c(x_1, \\dots, x_p) = c(x_1, x_2) + c(x_2, x_3) + \\dots + c(x_{p-1}, x_p)$$</p><p>The routing problem: find the <b>least-cost path</b> between routers.</p></details>`,
        v: (box) => pathPick(box),
        c: { q: "Two routes join the same pair of routers. One has 2 hops, the other has 3 hops. What does that tell you about their costs?", o: ["The 2-hop route always costs less", "The 3-hop route always costs less", "Nothing until you add the costs"], a: 2, why: "Cost is the sum of the link numbers, not the hop count. In this network A → C → F has 2 hops and costs 10, while A → D → E → F has 3 hops and costs 7." } },
      { t: "Ways to classify routing algorithms", b: `<p>Algorithms differ along three axes:</p>`,
        v: table(["Axis", "One end", "Other end"], [["Information", "<b>Global</b>: every router knows the whole topology and costs (link state)", "<b>Decentralised</b>: a router knows only its neighbours and exchanges information (distance vector)"], ["Change", "<b>Static</b>: routes change slowly", "<b>Dynamic</b>: routes change fast (periodic updates, link or node changes)"], ["Traffic", "<b>Load-sensitive</b>: costs follow congestion", "<b>Load-insensitive</b>: costs are fixed"]], 700),
        c: { q: "A router that only knows its neighbours and shares estimates with them is…", o: ["Global", "Decentralised", "Load-sensitive"], a: 1, why: "Decentralised algorithms such as distance vector never see the whole map." } },
    ],
    guide: [
      "Choose a <b>From</b> and a <b>To</b> router and press <b>Send packet</b>. The hops light up one by one.",
      "Read the forwarding table of the source router beside the map.",
      "Tick <b>Link D–E fails</b> and send again to see the tables adapt.",
    ],
  };
  Object.assign(X, { netDijkstra, NNODES, NP, NE0, netFig, treeHl, NT0 });
})();

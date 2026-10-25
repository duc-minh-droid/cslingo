/* algo-p2-x-02: Phase 2 (lecture 2) — A* by hand and weighted A*. Ported from the vault; all numbers come from the code below. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const X = (NIC.shared.algoP2x = NIC.shared.algoP2x || {});
  const { reg, table, pseudo, INF, gridSearch, HEUR, drawGrid } = X;

  /* =====================================================================
     2.4  A* by hand
     ===================================================================== */
  // prettier-ignore
  const AHP = { S: [50, 140], A: [165, 55], B: [190, 160], C: [320, 105], D: [335, 225], G: [440, 150], E: [70, 238], F: [175, 258] };
  // prettier-ignore
  const AHH = { S: 6, A: 5, B: 4, C: 3, D: 2, G: 0, E: 7, F: 8 };
  // prettier-ignore
  const AHE = [["S", "A", 2], ["S", "B", 4], ["A", "B", 1], ["A", "C", 5], ["B", "C", 2], ["B", "D", 6], ["C", "G", 3], ["D", "G", 2], ["S", "E", 2], ["E", "F", 1]];
  const AHN = Object.keys(AHP);
  // prettier-ignore
  const ahAdj = (() => { const a = {}; AHN.forEach((n) => (a[n] = [])); AHE.forEach(([p, q, w]) => { a[p].push([q, w]); a[q].push([p, w]); }); return a; })();
  /** A* on the roadmap, one record per expansion. useH = false gives Dijkstra. Ties: smaller h first, then name. */
  // prettier-ignore
  function ahSearch(useH) {
    const hv = (n) => (useH ? AHH[n] : 0);
    const g = { S: 0 }, par = {}, closed = [], open = ["S"], steps = [];
    while (open.length) {
      let ci = 0;
      open.forEach((n, i) => { const c = open[ci], a = g[n] + hv(n), b = g[c] + hv(c); if (a < b || (a === b && (hv(n) < hv(c) || (hv(n) === hv(c) && n < c)))) ci = i; });
      const cur = open.splice(ci, 1)[0], upd = [];
      closed.push(cur);
      if (cur === "G") { steps.push({ cur, upd, g: { ...g }, open: open.slice(), closed: closed.slice(), par: { ...par }, goal: true }); break; }
      for (const [m, w] of ahAdj[cur]) {
        if (closed.includes(m)) continue;
        const ng = g[cur] + w;
        if (g[m] === undefined || ng < g[m]) { upd.push({ n: m, from: g[m], to: ng }); g[m] = ng; par[m] = cur; if (!open.includes(m)) open.push(m); }
      }
      steps.push({ cur, upd, g: { ...g }, open: open.slice(), closed: closed.slice(), par: { ...par } });
    }
    const path = []; for (let q = "G"; q; q = par[q]) path.push(q);
    return { steps, path: path.reverse(), cost: g.G, order: closed };
  }
  // prettier-ignore
  const AHA = ahSearch(true), AHD = ahSearch(false);
  // prettier-ignore
  const ahRows = (g, open, closed, cur, useH = true) => AHN.map((n) => {
    const seen = g[n] !== undefined, st = n === cur ? "expanding" : closed.includes(n) ? "closed" : open.includes(n) ? "open" : "unseen";
    return { c: [`<b>${n}</b>`, seen ? g[n] : "∞", useH ? AHH[n] : 0, seen ? g[n] + (useH ? AHH[n] : 0) : "∞", st === "unseen" ? `<span class="faint">unseen</span>` : st === "closed" ? `<span style="color:var(--teal)">closed</span>` : st === "expanding" ? `<span style="color:var(--amber)">expanding</span>` : `<span style="color:var(--violet)">open</span>`], hl: n === cur };
  });

  function ahRun(box, life) {
    function* frames() {
      const snap = (x) => ({ g: { S: 0 }, open: ["S"], closed: [], par: {}, ...x });
      yield snap({
        cap: `Start: the open list holds only <b>S</b>. g = 0, h = ${AHH.S}, so f = <b>${AHH.S}</b>.`,
        line: 0,
        cur: null,
      });
      for (let i = 0; i < AHA.steps.length; i++) {
        const s = AHA.steps[i];
        const fcur = s.g[s.cur] + AHH[s.cur];
        const open0 = i ? AHA.steps[i - 1].open : ["S"],
          g0 = i ? AHA.steps[i - 1].g : { S: 0 };
        const fm = Math.min(...open0.map((n) => g0[n] + AHH[n]));
        const ties = open0.filter((n) => g0[n] + AHH[n] === fm);
        const ask =
          i >= 1 && i <= 2
            ? {
                q: "Which node does A* expand next? Tap it.",
                pick: ".rn-node.s-tent",
                a: ties,
                why: `The lowest f in the open list wins: <b>${s.cur}</b> has g ${s.g[s.cur]} + h ${AHH[s.cur]} = ${fcur}.`,
              }
            : null;
        const ups = s.upd.map((u) =>
          u.from === undefined
            ? `<b>${u.n}</b> joins the open list with g = ${u.to}`
            : `<b>${u.n}</b> improves from g = ${u.from} to <b>${u.to}</b>`,
        );
        if (s.goal) {
          yield snap({
            ...s,
            cap: `<b>G</b> has the lowest f (${fcur}), so it is expanded: the goal is reached. Cost <b>${AHA.cost}</b>, found after ${s.closed.length} expansions.`,
            line: 2,
            mood: "love",
            path: AHA.path,
            ask,
          });
          return;
        }
        yield snap({
          ...s,
          cap: `Expand <b>${s.cur}</b> (g ${s.g[s.cur]} + h ${AHH[s.cur]} = <b>f ${fcur}</b>, the lowest). ${ups.length ? ups.join("; ") + "." : "No new neighbours."}`,
          line: s.upd.length ? 4 : 3,
          ask,
        });
      }
    }
    F.run(box, life, {
      code: [
        "open = {S}; g[S] = 0",
        "n = node in open with the lowest f = g + h",
        "if n is the goal: stop, trace the path back",
        "move n from open to closed",
        "for each neighbour m not closed: if g[n] + cost < g[m], update g[m] and add m to open",
      ],
      build(stage) {
        const g = F.graphScene(stage, { nodes: AHP, edges: AHE, w: 480, h: 290 });
        const tb = document.createElement("div");
        tb.className = "rn-tbl";
        stage.appendChild(tb);
        return { ...g, tb };
      },
      draw(sc, f, c) {
        const open = f.open,
          closed = f.closed;
        AHN.forEach((n) => {
          const h = sc.node(n),
            seen = f.g[n] !== undefined;
          h.g.setAttribute(
            "class",
            `rn-node ${n === f.cur ? "s-cur" : closed.includes(n) ? "s-done" : open.includes(n) ? "s-tent" : ""}`,
          );
          F.rn.num(c, h.tag, seen ? f.g[n] + AHH[n] : INF);
          if (c.prev && (!c.prev.g || c.prev.g[n] !== f.g[n])) F.rn.pulse(c, h.tagBox);
          if (n === f.cur && (!c.prev || c.prev.cur !== n)) F.rn.pulse(c, h.body);
        });
        const onPath = (a, b) =>
          f.path && f.path.some((n, i) => i && ((f.path[i - 1] === a && n === b) || (f.path[i - 1] === b && n === a)));
        AHE.forEach(([a, b]) => {
          const h = sc.edge(a, b),
            tree = f.par[b] === a || f.par[a] === b;
          h.hot.classList.toggle("amber", !!onPath(a, b));
          F.rn.stroke(c, h.hot, tree);
        });
        sc.tb.innerHTML = table(["node", "g", "h", "f = g + h", "state"], ahRows(f.g, open, closed, f.cur), 480);
      },
      frames,
    });
  }

  reg({
    id: "a2-astar-hand",
    order: 4,
    num: "2.4",
    title: "A* by hand",
    blurb: "Fill in the g, h and f table one expansion at a time, then switch h off and see how Dijkstra compares.",
    render(root) {
      root.appendChild(header(this, ""));
      let useH = true,
        ti = 0,
        trace = AHA;
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="step"></button><button class="btn ghost" id="rs">Reset</button>
        <label class="field"><input type="checkbox" id="noh"> Switch h off (ranks by g only: Dijkstra)</label></div>
        <div class="grid side"><div id="svg"></div><div><div id="tbl"></div><div class="mono dim" id="log" style="margin-top:10px;min-height:44px"></div></div></div>
        <div class="callout" id="note" style="display:none"></div></div>`);
      root.appendChild(card);
      function draw() {
        const s = ti ? trace.steps[ti - 1] : null;
        const g = s ? s.g : { S: 0 },
          open = s ? s.open : ["S"],
          closed = s ? s.closed : [];
        const hl = {},
          nodes = {};
        AHN.forEach((n) => {
          const seen = g[n] !== undefined;
          nodes[n] = {
            x: AHP[n][0] * 0.8 + 8,
            y: AHP[n][1] * 0.95 + 4,
            sub: seen ? `f ${g[n] + (useH ? AHH[n] : 0)}` : "",
          };
          if (closed.includes(n)) hl[n] = n === (s && s.cur) ? "amber" : "teal";
          else if (open.includes(n)) hl[n] = "violet";
        });
        if (s)
          AHN.filter((n) => s.par[n] && closed.includes(n)).forEach(
            (n) => (hl[`${s.par[n]}-${n}`] = n === s.cur ? "amber" : "teal"),
          );
        qs("#svg", card).innerHTML =
          `<div class="fig-wrap">${F.graph({ nodes, edges: AHE, hl, w: 400, h: 270, r: 17 })}</div>`;
        qsa("#svg line.draw", card).forEach((l) => l.classList.remove("draw"));
        qsa("#svg .fi", card).forEach((q) => q.classList.remove("fi"));
        qs("#tbl", card).innerHTML = table(
          ["node", "g", "h", "f", "state"],
          ahRows(g, open, closed, s && s.cur, useH),
          420,
        );
        qs("#log", card).innerHTML = s
          ? s.goal
            ? `expanded <b style="color:var(--amber)">G</b>: the goal. Stop.`
            : `expanded <b style="color:var(--amber)">${s.cur}</b>${s.upd.length ? " · " + s.upd.map((u) => (u.from === undefined ? `${u.n} g=${u.to}` : `${u.n} g ${u.from}→${u.to}`)).join(", ") : " · nothing new"}`
          : "Start: only S is open, g = 0.";
        const end = ti === trace.steps.length,
          note = qs("#note", card);
        if (end) {
          note.style.display = "block";
          note.className = "callout teal";
          note.innerHTML = `Done after <b>${trace.steps.length}</b> expansions. Route <b>${trace.path.join("→")}</b>, cost <b>${trace.cost}</b>. ${useH ? `Dijkstra needs ${AHD.steps.length} expansions on this map.` : `With h on, A* needs only ${AHA.steps.length}.`}`;
        } else note.style.display = "none";
        const btn = qs("#step", card);
        btn.disabled = end;
        btn.textContent = end ? "Finished" : `Expand next (${ti + 1}/${trace.steps.length})`;
      }
      qs("#step", card).onclick = () => {
        if (ti < trace.steps.length) {
          ti++;
          draw();
        }
      };
      qs("#rs", card).onclick = () => {
        ti = 0;
        draw();
      };
      qs("#noh", card).onchange = (e) => {
        useH = !e.target.checked;
        trace = useH ? AHA : AHD;
        ti = 0;
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a2-ah-1",
          q: "After S is expanded, A has f = 7, B has f = 8 and E has f = 9. Which is expanded next?",
          opts: [
            "B: it is the closest to the goal",
            "A: the lowest f wins",
            "E: it is the first one added to the list",
          ],
          a: 1,
          why: "A* always expands the lowest f = g + h. Here that is A (g 2 + h 5 = 7). Later A makes B cheaper, because 2 + 1 = 3 beats the 4 B had.",
        }),
      );
      root.appendChild(
        predict({
          id: "a2-ah-2",
          q: "Tick <b>Switch h off</b> and finish the run. How does the number of expansions compare with A*?",
          opts: [
            "Fewer: with no estimate it is less distracted",
            "More: it also expands nodes that lead away from G",
            "The same, since both find the same cost",
          ],
          a: 1,
          why: "Without h the search ranks by g only, so it also expands the dead-end branch through E and F. A* leaves them alone because their f is high.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Rank the open list by <code>f = g + h</code> and expand the lowest.",
            "If a cheaper route to an open node turns up, <b>update its g</b> (and its parent).",
            "Stop when the goal is <b>expanded</b>, not when it is first added to the list.",
            "An empty open list means <b>no route exists</b>.",
          ],
          "Fill the table row by row: pick the lowest f, update neighbours, repeat.",
        ),
      );
    },
  });

  L["a2-astar-hand"] = {
    sum: "A* by hand is a table. For every node you track g (cost so far), h (estimated cost left) and f = g + h. Always expand the lowest f, update the neighbours' g if you found a cheaper way, and stop only when the goal itself is expanded.",
    // prettier-ignore
    steps: [
      { t: "Two numbers per node: g and h", b: `<p>Every node gets two numbers:</p><p><b>g(n)</b>: the cheapest cost <i>found so far</i> from the start to n. It can still drop.<br><b>h(n)</b>: a <i>guess</i> at the cheapest cost from n to the goal.</p><p>Their sum is the node's score: $f(n) = g(n) + h(n)$, the estimated cost of a whole route that passes through n.</p>`,
        v: F.compare({ title: "Node X", c: "violet", body: "g = 5, h = 4<br><b>f = 9</b>" }, { title: "Node Y", c: "teal", body: "g = 6, h = 2<br><b>f = 8</b> ← expanded first" }) + `<div class="fig-cap">Y is further from the start, but its whole route looks cheaper.</div>`,
        c: { q: "What does f(n) = g(n) + h(n) estimate?", o: ["The cost of a whole start-to-goal route through n", "The number of edges that remain until the goal", "The cost of only the final edge going into n"], a: 0, why: "g is the known part (start to n) and h is the guessed part (n to goal), so f is the estimated total." } },
      { t: "The strategy in one sentence", b: `<p><b>Expand the open node with the cheapest f.</b> Then, for each neighbour not already finished, ask: <i>is the route through this node cheaper than what I had?</i> If so, store the new g and remember this node as its parent.</p><p>A node you have expanded is <b>closed</b>. With the usual well-behaved heuristics (such as straight-line distance), a closed node's g is already the cheapest possible and never changes.</p>`,
        v: F.flow(["Pick lowest f", "Close it", "Update neighbours' g", { t: "Repeat", c: "teal" }]) },
      { t: "The algorithm, line by line", b: `<p>The lecture's loop, tidied up. The <b>open list</b> is a priority queue ordered by f.</p><p>The highlighted lines are where the big ideas live: stopping at the goal, and updating g.</p>`,
        v: pseudo(["open ← {start};  g[start] ← 0;  every other g ← ∞", "while open is not empty:", "    n ← node in open with the lowest f = g[n] + h[n]", "    if n is the goal: return the route (follow the parents back)", "    close n", "    for each neighbour m of n that is not closed:", "        if g[n] + cost(n, m) < g[m]:", "            g[m] ← g[n] + cost(n, m);  parent[m] ← n;  add m to open", "return FALSE   (open was empty: no route)"], [3, 6, 7]),
        c: { q: "When does the loop in the pseudocode return FALSE?", o: ["When open empties before the goal is reached", "When two nodes in the list have the same f", "When h is larger than g at some node"], a: 0, why: "Every reachable node eventually gets expanded. If the open list runs out first, the goal was never reachable." } },
      { t: "Watch it run", b: `<p>The same table as the demo, now drawn on the map. The number on each node is its <b>f</b>. <b style="color:var(--violet)">Purple</b> nodes are open, <b style="color:var(--teal)">green</b> are closed and <b style="color:var(--amber)">orange</b> is being expanded.</p><p>The run will ask you to predict the next node. Tap it on the map.</p>`,
        v: (box, life) => ahRun(box, life) },
      { t: "Spot the cheaper route: update g", b: `<p>The most important moment in the run: B was first reached from S with g = 4. Then A was expanded, and A→B costs 1, so the route S→A→B costs 3.</p><p>3 &lt; 4, so B's g is <b>overwritten</b> and its parent becomes A. Without this update A* would keep a worse route.</p>`,
        v: F.frames([
          { t: "B first found from S: g = 4", v: F.cells([{ v: "S", sub: "0", c: "teal" }, "→", { v: "B", sub: "g 4", c: "violet" }]) },
          { t: "A expanded: g[A] + cost(A,B) = 2 + 1 = 3", v: F.cells([{ v: "2", c: "teal" }, "+", { v: "1" }, "=", { v: "3", c: "amber" }]) },
          { t: "3 < 4, so B is updated: g 3, parent A", v: F.cells([{ v: "A", sub: "2", c: "teal" }, "→", { v: "B", sub: "g 3 ✓", c: "amber" }]) },
        ]),
        c: { q: "A neighbour m already has g = 9. The node n you are expanding has g = 5, and the edge n→m costs 3. What happens to m?", o: ["Nothing: m was found first, so it keeps g = 9", "m gets g = 8 and n as its parent", "m is closed straight away"], a: 1, why: "5 + 3 = 8 is less than 9, so the new route is cheaper and replaces the old one." } },
      { t: "Stop at the goal's turn, not its first sighting", b: `<p>The goal can be added to the open list long before it is expanded. That first route may be expensive: a cheaper one could still be hiding behind a node with a lower f.</p><p>So A* waits until the goal is the node with the <b>lowest f</b>, meaning every other open node already looks at least as costly.</p>`,
        v: F.cells([{ v: "X", sub: "f 7", c: "violet" }, { v: "G", sub: "f 9 (seen)", c: "rose" }]) + `<div class="fig-cap">G is already open with f = 9, but X (f = 7) goes first. X might lead to G for less.</div>`,
        c: { q: "G is in the open list with f = 9. Node X has f = 7. What does A* do?", o: ["Stops: the goal has been found", "Expands X first, because 7 is the lower f", "Expands G first, because the goal always wins"], a: 1, why: "The lowest f is expanded. X may still give a route to G below 9, so G cannot be accepted yet." } },
      { t: "Edge cases", b: `<p><b>Empty open list</b>: no route. Return FALSE (a wall may have cut the map in two).<br><b>Ties</b>: two nodes with equal f. A common rule is to expand the one with the smaller h (closer to the goal) first.<br><b>Start = goal</b>: the first node taken from the open list is the goal, so the route has cost 0.<br><b>h = 0 everywhere</b>: f = g, which is Dijkstra.</p>`,
        v: table(["Situation", "What A* does"], [["Goal unreachable", "open empties, returns FALSE"], ["Equal f", "tie-break, e.g. smaller h first"], ["Start is the goal", "returns at once, cost 0"], ["h = 0 for all nodes", "behaves like Dijkstra"]]),
        c: { q: "A wall splits the map so the goal cannot be reached. How does A* find out?", o: ["Its open list runs dry before the goal", "The goal's f turns negative at some point", "It reaches the goal while g is still ∞"], a: 0, why: "It expands everything reachable, then the open list is empty. That is the signal that no route exists." } },
    ],
    guide: [
      "Press <b>Expand next</b> and, before each press, guess which node has the lowest f in the table.",
      "Watch B's g drop from 4 to 3 when A is expanded (the update step).",
      "Tick <b>Switch h off</b>, run to the end and compare the number of expansions with A*.",
    ],
  };

  /* =====================================================================
     2.6  Weighted A* and the A* family
     ===================================================================== */
  // prettier-ignore
  const WM = { W: 21, H: 11, walls: new Set(), mud: new Set(), mc: 3, S: [2, 5], T: [18, 5], conn: 4, h: HEUR.manhattan };
  for (let x = 8; x <= 12; x++) for (let y = 3; y <= 7; y++) WM.mud.add(x + "," + y);
  const WEPS = [1, 1.5, 2, 3, 5];
  // prettier-ignore
  const WR = {};
  WEPS.forEach((e) => (WR[e] = gridSearch({ ...WM, eps: e })));
  const WDIJ = gridSearch({ ...WM, h: null });
  const WOPT = WR[1].cost;
  const OPEN_GRID = { W: 21, H: 13, walls: new Set(), S: [2, 6], T: [18, 6], conn: 4 };
  // prettier-ignore
  const OG_A = gridSearch({ ...OPEN_GRID, h: HEUR.manhattan }), OG_D = gridSearch({ ...OPEN_GRID, h: null });

  reg({
    id: "a2-weighted",
    order: 6,
    num: "2.6",
    title: "Weighted A* and the A* family",
    blurb: "Inflate the heuristic on purpose, trade a little route quality for a lot of speed, and check the ε bound.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let eps = 1,
        lastRes = null;
      const card =
        el(`<div class="card"><div class="card-head"><h2>Mud in the middle</h2><span class="faint">orange cells cost ${WM.mc} to enter; the others cost 1</span></div>
        <div class="controls" id="sl"></div><canvas class="viz" id="cv"></canvas>
        <div class="stat-row"><div class="stat violet"><small>Cells expanded</small><b id="ex"></b></div><div class="stat teal"><small>Route cost</small><b id="co"></b></div><div class="stat amber"><small>Allowed: ε × cheapest</small><b id="bd"></b></div></div>
        <div class="callout" id="note"></div></div>`);
      root.appendChild(card);
      const sl = N.slider("Weight ε", 1, 5, 0.5, 1, (v) => v.toFixed(1));
      qs("#sl", card).appendChild(sl);
      function draw() {
        const res = eps === 1 ? WR[1] : gridSearch({ ...WM, eps });
        lastRes = res;
        drawGrid(qs("#cv", card), WM, res);
        qs("#ex", card).textContent = res.expanded.length;
        qs("#co", card).textContent = res.cost;
        qs("#bd", card).textContent = "≤ " + +(eps * WOPT).toFixed(1);
        const n = qs("#note", card),
          sub = res.cost > WOPT;
        n.className = "callout " + (sub ? "rose" : "teal");
        n.innerHTML = sub
          ? `<b>Suboptimal:</b> cost ${res.cost} against the cheapest ${WOPT}, still inside the ε bound ${+(eps * WOPT).toFixed(1)}. The search marched through the mud because it looked closer to G.`
          : `Cheapest route (${WOPT}): it goes round the mud.`;
      }
      sl.onInput((v) => {
        eps = v;
        draw();
      });
      draw();
      life.onResize(() => lastRes && drawGrid(qs("#cv", card), WM, lastRes));
      root.appendChild(
        predict({
          id: "a2-wa-1",
          q: "Raise ε from 1 to 3. What happens to the number of cells expanded?",
          opts: [
            "It falls sharply: the search heads straight for the goal",
            "It rises, because inflated estimates add extra work",
            "It stays the same, since the map has not changed",
          ],
          a: 0,
          why: `A bigger ε makes the h term dominate, so the search behaves more like greedy best-first. Here the expansions drop from ${WR[1].expanded.length} at ε = 1 to ${WR[3].expanded.length} at ε = 3.`,
        }),
      );
      root.appendChild(
        predict({
          id: "a2-wa-2",
          q: `The cheapest route costs ${WOPT}. With ε = 2, what is the most weighted A* is allowed to return?`,
          opts: [String(WOPT), String(WOPT * 2), String(WOPT * 4)],
          a: 1,
          why: `The guarantee is cost ≤ ε × (optimal cost) = 2 × ${WOPT} = ${WOPT * 2}. It often does better than the bound. Here it actually returned ${WR[2].cost}.`,
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Weighted A*</b>: f = g + ε·h with ε &gt; 1. The search is greedier and faster.",
            "It is <b>ε-suboptimal</b>: the route costs at most ε times the cheapest.",
            "ε = 1 is ordinary A*; a huge ε is greedy best-first.",
            "Anytime A*, ARA* and D* reuse the idea for deadlines and changing maps.",
          ],
          "Turn the dial: more ε means faster answers, with a guaranteed ceiling on how bad they can be.",
        ),
      );
    },
  });

  /* Two candidate nodes and one slider: the weight decides which one the search expands next. */
  // prettier-ignore
  function epsFig(host) {
    const C = [["P", 4, 6], ["Q", 8, 3]], sl = N.slider("Weight ε (how much the guess counts)", 1, 5, 0.5, 1, (v) => v.toFixed(1)), box = el(`<div class="fig-wrap"></div>`), say = el(`<div class="callout"></div>`);
    host.append(sl, box, say);
    const draw = (e) => {
      const sc = C.map(([, g, h]) => g + e * h), win = sc[0] <= sc[1] ? 0 : 1, u = 8.4, gx = 20;
      let s = `<svg class="fig" viewBox="0 0 470 170" role="img" aria-label="Node P scores ${sc[0]}, node Q scores ${sc[1]}; the lower score is expanded first">`;
      s += `<rect x="${gx}" y="8" width="14" height="14" rx="4" fill="color-mix(in srgb, var(--blue) 45%, var(--panel-2))"/><text x="${gx + 20}" y="20" class="fig-sub" style="text-anchor:start">travelled so far</text><rect x="190" y="8" width="14" height="14" rx="4" fill="color-mix(in srgb, var(--amber) 55%, var(--panel-2))"/><text x="210" y="20" class="fig-sub" style="text-anchor:start">guess still to go, times ε</text>`;
      C.forEach(([n, g, h], i) => {
        const y = 52 + i * 62, w = h * e * u;
        s += `<text x="${gx}" y="${y - 6}" class="fig-box" style="text-anchor:start">${n}: travelled ${g}, guesses ${h} left</text>`;
        s += `<rect x="${gx}" y="${y}" width="${g * u}" height="30" rx="6" fill="color-mix(in srgb, var(--blue) 45%, var(--panel-2))"/><rect x="${gx + g * u}" y="${y}" width="${w}" height="30" rx="6" fill="color-mix(in srgb, var(--amber) 55%, var(--panel-2))"/>`;
        s += `<rect x="${gx - 2}" y="${y - 2}" width="${g * u + w + 4}" height="34" rx="8" fill="none" stroke="${i === win ? "var(--teal)" : "none"}" stroke-width="3"/><text x="${gx + g * u + w + 10}" y="${y + 20}" class="fig-box" style="text-anchor:start">${g} + ${e} × ${h} = ${+sc[i].toFixed(1)}</text>`;
      });
      box.innerHTML = s + "</svg>";
      say.className = "callout " + (win ? "violet" : "teal");
      say.innerHTML = `With ε = ${e.toFixed(1)} the lower score wins: <b>${C[win][0]}</b> is expanded first. ${win ? "Q has walked further, but it looks closer to the goal, so the search is drawn to it." : "P has walked less and the guess is not weighted enough to change that."}`;
    };
    sl.onInput(draw);
    draw(1);
  }

  /* A ruler from 0 to 5 x the cheapest cost: the green mark is the best route, the red mark the ceiling, the dot what the search returned. */
  // prettier-ignore
  function ceilFig(host) {
    const box = el(`<div class="fig-wrap"></div>`), cap = el(`<div class="fig-cap"></div>`);
    host.append(N.seg(WEPS.map((e) => [e, "ε = " + e]), 1, (v) => draw(+v)), box, cap);
    const draw = (e) => {
      const ceil = e * WOPT, got = WR[e].cost, u = 430 / (5 * WOPT), gx = 20, y = 70, px = (c) => gx + c * u;
      let s = `<svg class="fig" viewBox="0 0 470 130" role="img" aria-label="Cheapest route ${WOPT}, ceiling ${+ceil.toFixed(1)}, returned ${got}">`;
      s += `<rect x="${gx}" y="${y - 7}" width="430" height="14" rx="7" fill="var(--panel-2)" stroke="var(--line)" stroke-width="1.5"/><rect x="${px(WOPT)}" y="${y - 7}" width="${Math.max(2, (ceil - WOPT) * u)}" height="14" fill="color-mix(in srgb, var(--teal) 35%, var(--panel-2))"/>`;
      s += `<line x1="${px(WOPT)}" y1="${y - 22}" x2="${px(WOPT)}" y2="${y + 22}" stroke="var(--teal)" stroke-width="4"/><line x1="${px(ceil)}" y1="${y - 22}" x2="${px(ceil)}" y2="${y + 22}" stroke="var(--rose)" stroke-width="4"/>`;
      s += e === 1 ? `<text x="${px(WOPT)}" y="${y - 30}" class="fig-box">cheapest = ceiling: ${WOPT}</text>` : `<text x="${px(WOPT)}" y="${y - 30}" class="fig-box" style="text-anchor:end">cheapest ${WOPT}</text><text x="${px(ceil)}" y="${y - 30}" class="fig-box" style="text-anchor:start">ceiling ${+ceil.toFixed(1)}</text>`;
      s += `<circle cx="${px(got)}" cy="${y}" r="9" fill="var(--violet)" stroke="var(--violet-lip)" stroke-width="2"/><text x="${px(got)}" y="${y + 40}" class="fig-box">returned ${got}</text></svg>`;
      box.innerHTML = s;
      cap.textContent = got === WOPT ? "The search still found a cheapest route." : `A route ${got - WOPT} dearer than the cheapest, comfortably under the ceiling.`;
    };
    draw(1);
  }

  /* Stacked bars: the link cost plus what the neighbour reports is the total, and the smallest total wins. Shared with the distance-vector lesson. */
  // prettier-ignore
  function totalsFig(host) {
    const NB = [["B", 3, 5], ["C", 6, 3], ["D", 2, 5]], sl = N.slider("What D reports as its own distance to F", 0, 12, 1, 5), box = el(`<div class="fig-wrap"></div>`), say = el(`<div class="callout teal"></div>`);
    host.append(sl, box, say);
    const draw = (d) => {
      const rows = NB.map(([n, c, r]) => [n, c, n === "D" ? d : r]), tot = rows.map((r) => r[1] + r[2]), min = Math.min(...tot), u = 24;
      let s = `<svg class="fig" viewBox="0 0 470 156" role="img" aria-label="Totals via B ${tot[0]}, via C ${tot[1]}, via D ${tot[2]}">`;
      rows.forEach(([n, c, r], i) => {
        const y = 8 + i * 48, w = tot[i] === min;
        s += `<text x="16" y="${y + 21}" class="fig-n">${n}</text><rect x="36" y="${y}" width="${c * u}" height="30" rx="6" fill="color-mix(in srgb, var(--blue) 45%, var(--panel-2))"/><text x="${36 + (c * u) / 2}" y="${y + 20}" class="fig-box">${c}</text>`;
        if (r) s += `<rect x="${36 + c * u}" y="${y}" width="${r * u}" height="30" rx="6" fill="color-mix(in srgb, var(--amber) 55%, var(--panel-2))"/><text x="${36 + c * u + (r * u) / 2}" y="${y + 20}" class="fig-box">${r}</text>`;
        s += `<rect x="34" y="${y - 2}" width="${(c + r) * u + 4}" height="34" rx="8" fill="none" stroke="${w ? "var(--teal)" : "none"}" stroke-width="3"/><text x="${36 + (c + r) * u + 12}" y="${y + 20}" class="fig-box" style="text-anchor:start">${c} + ${r} = ${c + r}</text>`;
      });
      box.innerHTML = s + "</svg>";
      const best = rows.filter((r, i) => tot[i] === min).map((r) => r[0]);
      say.innerHTML = `Blue: the link from A. Orange: what that neighbour says it still has to go. The smallest total is <b>${min}</b>, so A's next hop is <b>${best.join(" or ")}</b>.`;
    };
    sl.onInput(draw);
    draw(5);
  }
  Object.assign(X, { totalsFig });
  L["a2-weighted"] = {
    sum: "What if you overestimate on purpose? Weighted A* ranks nodes by g + ε·h with ε above 1. It expands fewer nodes and finishes sooner, and the route it returns is guaranteed to cost no more than ε times the best. The A* family builds on this for deadlines and for maps that change.",
    // prettier-ignore
    steps: [
      { t: "Overestimate on purpose", b: `<p>Ordinary A* ranks every node by <b>how far it has already come plus its guess of how far is left</b>. Weighted A* does the same sum but makes the guess count for more, as if you were impatient: "I care more about getting close to the goal than about how far I have walked."</p><p>For example, node P has travelled 4 and guesses 6 left. Node Q has travelled 8 and guesses 3 left. With the normal weight P scores 10 and Q scores 11, so P goes first. Triple the weight on the guess and P scores 22 against Q's 17, so now Q goes first. Slide ε below to see where it flips.</p><p>The search heads straight for the goal and looks at fewer nodes. ε = 1 is ordinary A*, and the bigger ε is, the greedier it gets.</p><details class="math-more"><summary>Show the maths</summary><p>An honest h keeps A* optimal but can still leave it exploring a lot. Turning up the weight on h gives</p><p>$$f(n) = g(n) + \\varepsilon\\, h(n),\\qquad \\varepsilon > 1$$</p><p>The search favours nodes that are close to the goal and cares less about how far they are from the start.</p></details>`,
        v: (box) => epsFig(box),
        c: { q: "Node X has travelled 2 and guesses 8 left. Node Y has travelled 7 and guesses 4 left. With ε = 1 the search picks X (10 against 11). With ε = 3, which does it pick?", o: ["X, the one that walked least", "Neither, they tie", "Y, which looks closer"], a: 2, why: "With ε = 3, X scores 2 + 3 × 8 = 26 and Y scores 7 + 3 × 4 = 19. The lower score goes first, so the bigger weight on the guess pulls the search towards the node that looks closer to the goal." } },
      { t: "Greedier, faster, maybe worse", b: `<p>On the mud map below, the middle of the map is costly (orange). The straight route is short but muddy. Ordinary A* weighs the mud cost and walks round; a larger ε is lured straight through.</p>`,
        v: F.bars(WEPS.map((e, i) => [`ε = ${e}`, WR[e].expanded.length, ["teal", "violet", "violet", "amber", "amber"][i], `cost ${WR[e].cost}`]), { max: WR[1].expanded.length }) + `<div class="fig-cap">Cells expanded for each ε, with the cost of the route found. Dijkstra expands ${WDIJ.expanded.length}.</div>`,
        c: { q: "Going from ε = 1 to ε = 3 on the mud map, what changes?", o: ["Far fewer cells are expanded, and the route costs more", "More cells are expanded, and the route costs less", "Nothing: both settings give the same search"], a: 0, why: `Expansions fall from ${WR[1].expanded.length} to ${WR[3].expanded.length}, and the route cost rises from ${WR[1].cost} to ${WR[3].cost}.` } },
      { t: "The guarantee: ε-suboptimal", b: `<p>Speed has a price, but the price is capped. Weighted A* promises that the route it returns <b>never costs more than ε times the cheapest route</b>.</p><p>For example, if the cheapest route costs 40 minutes and ε = 1.5, you will never be handed a route over 60 minutes, and usually it is much closer to 40. With ε = 2 the ceiling is 80. Press the ε buttons below: the violet dot is the cost the search really returned on the mud map, the red mark is the ceiling.</p><details class="math-more"><summary>Show the maths</summary><p>$$\\text{cost(solution)} \\le \\varepsilon \\cdot \\text{cost(optimal solution)}$$</p><p>A weighted A* answer is called <b>ε-suboptimal</b>. With ε = 1.5 you never pay more than 50% extra, usually much less. The mud map, for each ε:</p>${table(["ε", "bound ε × " + WOPT, "cost returned", "within bound?"], WEPS.map((e) => [e, +(e * WOPT).toFixed(1), WR[e].cost, WR[e].cost <= e * WOPT ? "yes" : "no"]))}</details>`,
        v: (box) => ceilFig(box),
        c: { q: "The cheapest route costs 40. Weighted A* runs with ε = 1.5. Which cost could never be returned?", o: ["44", "58", "63"], a: 2, why: "The bound is 1.5 × 40 = 60. A cost of 63 breaks it. Both 44 and 58 sit inside it." } },
      { t: "The A* family", b: `<p>Weighted A* is the seed of several variants the lecture lists:</p><p><b>Anytime A*</b>: return a quick answer with a big ε, then keep improving until time runs out.<br><b>ARA*</b> (anytime repairing A*): lower ε step by step and reuse earlier work instead of restarting.<br><b>D*</b>: a robot discovers a new obstacle and <i>repairs</i> its plan instead of planning from scratch.</p>`,
        v: F.flow(["ε = 3: answer in a blink", { t: "ε = 2: better", c: "violet" }, { t: "ε = 1.2: nearly best", c: "violet" }, { t: "ε = 1: optimal", c: "teal" }]),
        c: { q: "A delivery robot sees a new blocked corridor mid-journey. Which idea fits best?", o: ["D*: repair the plan for the new map", "Dijkstra restarted again from the goal", "Weighted A* run with ε set to 0"], a: 0, why: "D* is designed for changing maps. It reuses most of the previous search rather than starting over." } },
      { t: "Practical issues", b: `<p>Real planners (the lecture shows autonomous cars in the DARPA competition) meet problems the textbook map hides:</p>`,
        v: table(["Issue", "Why it bites", "Typical remedy"], [["Memory", "the open list can hold millions of cells", "coarser grid, or weighted A*"], ["Slow expansion", "every node costs a heuristic call", "cheap h such as straight-line"], ["Ties", "many cells with the same f", "tie-break on smaller h"], ["Changing world", "plans go stale", "D*, replanning"]]),
        c: { q: "A vehicle must answer within 50 ms, even if the plan is a little long. Which setting helps?", o: ["A larger ε", "A smaller ε", "h = 0"], a: 0, why: "A larger ε expands fewer nodes and answers sooner, at the cost of a bounded loss in route quality." } },
      { t: "Seeing the difference: Dijkstra versus A*", b: `<p>Tools like the PathFinding.js demo in the lecture show it: Dijkstra's expansion is a growing <b>disc</b> around the start, while A* is a narrow <b>beam</b> aimed at the goal.</p><p>On an empty 21 × 13 grid with the goal 16 cells away:</p>`,
        v: F.bars([["Dijkstra (disc)", OG_D.expanded.length, "rose", `cost ${OG_D.cost}`], ["A*, Manhattan h (beam)", OG_A.expanded.length, "teal", `cost ${OG_A.cost}`]], { max: OG_D.expanded.length }) + `<div class="fig-cap">Same route cost, very different amounts of work.</div>`,
        c: { q: "On an empty grid, how do the route costs of A* (Manhattan) and Dijkstra compare?", o: ["Equal: both are optimal", "A* is cheaper, because it has a heuristic", "Dijkstra is cheaper, because it searches everywhere"], a: 0, why: "Both return a cheapest route. A* just gets there by expanding far fewer cells." } },
      { t: "What to choose", b: `<p>A quick rule of thumb:</p>`,
        v: table(["Your situation", "Use"], [["Need the very cheapest route, h available", "A* with an admissible h"], ["No usable heuristic", "Dijkstra"], ["Deadline, route may be a bit longer", "Weighted A* or anytime A*"], ["Map changes while moving", "D*"]]),
        c: { q: "ε → very large. What does weighted A* become?", o: ["Greedy best-first search", "Dijkstra's algorithm", "Breadth-first search"], a: 0, why: "When ε·h swamps g, the ranking is essentially by h alone, which is greedy best-first." } },
    ],
    guide: [
      "Drag <b>Weight ε</b> from 1 up to 5 and watch the purple expanded area shrink.",
      "Find the first ε where the route cuts through the orange mud and its cost rises.",
      "Compare the cost with the allowed ceiling each time.",
    ],
  };
})();

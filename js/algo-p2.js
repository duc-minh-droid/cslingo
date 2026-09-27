/* Phase 2 — Graph Search & Internet Routing: Dijkstra, A*, distance-vector */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header, randint, clamp } = N;
  const L = N.LESSONS;
  const F = N.fig;

  /* ============ 2.1 Dijkstra step by step ============ */
  const GPOS = { A: [70, 150], B: [220, 60], C: [200, 235], D: [370, 120], E: [390, 250] };
  const BASE = [["A", "B", 4], ["A", "C", 2], ["C", "B", 1], ["C", "D", 5], ["B", "D", 3], ["C", "E", 7], ["D", "E", 2]];
  // Negative mode: directed version (a DAG, so no negative cycles) with A→C = 5 and C→B = −3.
  // Dijkstra settles B at 4 before seeing C→B; the true distance is 5 − 3 = 2 (so D is really 5, E really 7).
  const NEG = BASE.map(([a, b, w]) => (a === "A" && b === "C" ? [a, b, 5] : a === "C" && b === "B" ? [a, b, -3] : [a, b, w]));

  function dijkstraTrace(edges, directed) {
    const adj = {};
    Object.keys(GPOS).forEach((n) => (adj[n] = []));
    edges.forEach(([a, b, w]) => { adj[a].push([b, w]); if (!directed) adj[b].push([a, w]); });
    const tent = {}, parent = {}, settled = [], steps = [];
    Object.keys(GPOS).forEach((n) => (tent[n] = n === "A" ? 0 : Infinity));
    for (;;) {
      let cur = null, best = Infinity;
      Object.keys(tent).forEach((n) => { if (!settled.includes(n) && tent[n] < best) { best = tent[n]; cur = n; } });
      if (cur === null) break;
      settled.push(cur);
      const upd = [], missed = [];
      adj[cur].forEach(([nb, w]) => {
        const nd = tent[cur] + w;
        if (settled.includes(nb)) { if (nd < tent[nb]) missed.push(`${nb}: ${nd} < ${tent[nb]}`); return; }
        if (nd < tent[nb]) { tent[nb] = nd; parent[nb] = cur; upd.push(`${nb} → ${nd}`); }
      });
      steps.push({ node: cur, upd, missed, tent: { ...tent }, parent: { ...parent } });
    }
    return { steps, settled };
  }

  /** Step-through Dijkstra: one frame per settle and per edge relaxation. Weights are editable. */
  function dijkstraRun(box, life) {
    const W = BASE.map((e) => e.slice());
    const names = Object.keys(GPOS);
    function* frames() {
      const adj = {}; names.forEach((n) => (adj[n] = []));
      W.forEach(([a, b, w]) => { adj[a].push([b, w]); adj[b].push([a, w]); });
      const dist = Object.fromEntries(names.map((n) => [n, n === "A" ? 0 : Infinity])), parent = {}, done = [];
      const snap = (x) => ({ dist: { ...dist }, parent: { ...parent }, done: done.slice(), ...x });
      yield snap({ cap: "Start: A is 0 away from itself. Everything else is <b>∞</b> (not reached yet).", line: 0 });
      for (let round = 0; ; round++) {
        const open = names.filter((n) => !done.includes(n) && dist[n] < Infinity);
        if (!open.length) break;
        const cur = open.reduce((a, b) => (dist[b] < dist[a] ? b : a));
        const tie = open.filter((n) => dist[n] === dist[cur]);
        done.push(cur);
        const ask = round >= 1 && round <= 3 && round !== 2 ? { q: "Which node gets <b>settled</b> next? Tap it.", pick: ".rn-node.s-tent", a: tie, why: `The smallest tentative distance always settles next: <b>${cur} = ${dist[cur]}</b>.` } : null;
        yield snap({ cur, cap: `Settle <b>${cur}</b>: its ${dist[cur]} is the smallest tentative distance, so it's final.`, line: 1, ask, mood: "happy" });
        for (const [nb, w] of adj[cur]) {
          if (done.includes(nb)) continue;
          const nd = dist[cur] + w, old = dist[nb], better = nd < old;
          if (better) { dist[nb] = nd; parent[nb] = cur; }
          yield snap({ cur, edge: [cur, nb], better, cap: `Relax ${cur}→${nb}: ${dist[cur]} + ${w} = <b>${nd}</b> ${better ? `&lt; ${old === Infinity ? "∞" : old}, so update ${nb} to ${nd}.` : `≥ ${old}, keep ${old}.`}`, line: better ? 3 : 2 });
        }
      }
      yield snap({ cap: `Done. The green edges are the <b>shortest-path tree</b>: A→E costs ${dist.E}.`, line: 4, mood: "love" });
    }
    F.run(box, life, {
      code: ["dist[A] = 0; all others = ∞", "u = unsettled node with smallest dist; settle u", "for each edge u→v: try dist[u] + w", "  if smaller: dist[v] = it, parent[v] = u", "repeat until every reached node is settled"],
      build(stage, api) {
        const g = F.graphScene(stage, { nodes: GPOS, edges: W, w: 460, h: 300, editable: true });
        W.forEach((e) => { const h = g.edge(e[0], e[1]); api.edit(h.wbox, { get: () => e[2], set: (v) => { e[2] = v; h.wt.textContent = v; h.wt.dataset.v = v; }, min: 1, max: 9 }); });
        return g;
      },
      draw(g, f, c) {
        names.forEach((n) => {
          const h = g.node(n), st = n === f.cur ? "s-cur" : f.done.includes(n) ? "s-done" : f.dist[n] < Infinity ? "s-tent" : "";
          h.g.setAttribute("class", `rn-node ${st}`);
          const moved = !c.prev || c.prev.dist[n] !== f.dist[n];
          F.rn.num(c, h.tag, f.dist[n]);
          if (moved && c.prev) F.rn.pulse(c, h.tagBox);
          if (n === f.cur && (!c.prev || c.prev.cur !== n)) F.rn.pulse(c, h.body);
        });
        W.forEach(([a, b]) => {
          const h = g.edge(a, b), tree = f.parent[b] === a || f.parent[a] === b;
          const hot = !!f.edge && g.key(f.edge[0], f.edge[1]) === g.key(a, b);
          h.g.classList.toggle("try", hot);
          h.hot.classList.toggle("amber", tree && hot);
          F.rn.stroke(c, h.hot, tree);
        });
      },
      frames,
    });
  }

  L["a2-dijkstra"] = {
    sum: "Dijkstra finds the shortest route from one start node to every other node. It grows outward like a ripple, and each node it <b>settles</b> is final. That only works because no road has a negative length.",
    steps: [
      { t: "Every node is in one of two states", b: `<p>Dijkstra keeps two groups:</p><p><b style="color:var(--teal)">Settled</b>: we know its shortest distance for certain.<br><b style="color:var(--violet)">Tentative</b>: the best distance found <i>so far</i>. It might still drop.</p><span class="key">Each step: pick the tentative node with the <b>smallest</b> distance and settle it.</span>`,
        v: F.graph({ nodes: { A: { x: 60, y: 110, sub: "0 · settled" }, C: { x: 190, y: 50, sub: "2" }, B: { x: 200, y: 175, sub: "4" }, D: { x: 340, y: 110, sub: "∞" } }, edges: [["A", "C", 2], ["A", "B", 4], ["C", "B", 1], ["C", "D", 5], ["B", "D", 3]], hl: { A: "teal", C: "violet", B: "violet" }, w: 400, h: 215 }) + `<div class="fig-cap">A is settled. C (2) and B (4) are tentative. D hasn't been reached yet (∞).</div>` },
      { t: "Why the smallest one is safe to settle", b: `<p>C has distance 2, and every other tentative node is at least 2. Could a sneaky detour reach C for less?</p><p>Any detour would have to go <b>through B first</b> (already 4) and then add a road (≥ 0). So it costs at least 4, which is more than 2. There's no cheaper way in.</p>`,
        v: F.compare({ title: "Direct: A → C", c: "teal", body: "cost <b>2</b>" }, { title: "Any detour: A → B → … → C", c: "rose", body: "at least <b>4 + (something ≥ 0)</b> ≥ 4" }),
        c: { q: "Why can Dijkstra lock in the node with the smallest tentative distance?", o: ["It's the closest on the screen", "Any other route must pass through a node that's already at least as far away", "Nodes are processed alphabetically"], a: 1, why: "Detours start from nodes that are already further away, and roads can't have negative length, so a detour can never undercut it." } },
      { t: "Relaxing an edge = checking for a shortcut", b: `<p>After settling a node, look at each neighbour and ask: <i>is going through the node I just settled cheaper than what I had?</i></p><p><code>if dist[C] + w(C,B) &lt; dist[B]: dist[B] = dist[C] + w(C,B)</code></p>`,
        v: F.frames([
          { t: "Before: B was 4 (direct from A)", v: F.cells([{ v: "A", sub: "0", c: "teal" }, { v: "C", sub: "2", c: "teal" }, { v: "B", sub: "4", c: "violet" }]) },
          { t: "Check the shortcut: C→B costs 1, so 2 + 1 = 3", v: F.cells([{ v: "2", c: "teal" }, "+", { v: "1" }, "=", { v: "3", c: "amber" }]) },
          { t: "3 < 4, so update B to 3 (via C)", v: F.cells([{ v: "A", sub: "0", c: "teal" }, { v: "C", sub: "2", c: "teal" }, { v: "B", sub: "3 ✓", c: "amber" }]) },
        ]) },
      { t: "Watch it run", b: `<p>Here is the whole algorithm on a five-node graph. Press <b>play</b> or step with the arrows. The code on the right lights up the line being run.</p><p>It will pause and ask you to predict the next node. Tap a weight to change it and the run recomputes.</p>`,
        v: (box, life) => dijkstraRun(box, life) },
      { t: "Why negative edges break it", b: `<p>The safety argument assumed a detour can only <b>add</b> cost. A negative edge <i>subtracts</i>.</p><p>Here Dijkstra settles B at 2, since it's the smallest. But A → C → B costs 3 + (−2) = <b>1</b>. B was locked in too early.</p><span class="key">Negative edges: use Bellman–Ford instead.</span>`,
        v: F.graph({ nodes: { A: { x: 60, y: 100, sub: "0" }, B: { x: 230, y: 40, sub: "settled at 2 ✗" }, C: { x: 230, y: 165, sub: "3" } }, edges: [["A", "B", 2], ["A", "C", 3], ["C", "B", "−2", "rose"]], hl: { B: "rose" }, directed: true, w: 330, h: 205 }),
        c: { q: "A graph has a negative edge. What can go wrong with Dijkstra?", o: ["Nothing, it still works", "It can lock in a node before finding a cheaper route through the negative edge", "It just runs slower"], a: 1, why: "The \"settled means final\" guarantee depends on non-negative weights." } },
    ],
    guide: ["Press <b>Step</b> repeatedly. The settled set grows A → C → B → D → E.", "Before each press, guess which node settles next (smallest tentative number in the table).", "Tick <b>Make B→D weight −10</b>, then step again. Find the moment the \"final\" answer turns out to be wrong."],
  };

  N.register({
    id: "a2-dijkstra", subject: "algo", lecture: 2, order: 1, num: "2.1",
    title: "Dijkstra step by step",
    blurb: "Settle nodes one by one and watch the shortest-path tree grow — then break it with a negative edge.",
    render(root) {
      root.appendChild(header(this, ""));
      let neg = false, ti = 0, trace = dijkstraTrace(BASE, false);
      const card = el(`<div class="card"><div class="controls"><button class="btn primary" id="step"></button><button class="btn ghost" id="rs">Reset</button>
        <label class="field"><input type="checkbox" id="neg"> Negative-edge mode (directed, C→B = −3)</label></div>
        <div class="grid side"><div id="svg"></div><div><table class="t" id="tbl"></table><div class="mono dim" id="log" style="margin-top:10px;min-height:22px"></div></div></div>
        <div class="legend"><span style="--c:var(--teal)">settled (final)</span><span style="--c:var(--violet)">tentative</span><span style="--c:var(--amber)">just settled</span><span style="--c:var(--text-faint)">tree edge = how we got there</span></div>
        <div class="callout" id="note" style="display:none"></div></div>`);
      root.appendChild(card);
      const edges = () => (neg ? NEG : BASE);
      function draw() {
        const done = trace.settled.slice(0, ti), s = ti ? trace.steps[ti - 1] : null, justNow = s && s.node;
        const tent = s ? s.tent : Object.fromEntries(Object.keys(GPOS).map((n) => [n, n === "A" ? 0 : Infinity]));
        const parent = s ? s.parent : {};
        const tree = done.filter((n) => parent[n]).map((n) => [parent[n], n]);
        const hl = {};
        done.forEach((n) => (hl[n] = n === justNow ? "amber" : "teal"));
        Object.keys(GPOS).forEach((n) => { if (!done.includes(n) && tent[n] !== Infinity) hl[n] = "violet"; });
        tree.forEach(([p, n]) => (hl[`${p}-${n}`] = n === justNow ? "amber" : "teal"));
        if (neg && !hl["C-B"]) hl["C-B"] = "rose";
        const nodes = Object.fromEntries(Object.entries(GPOS).map(([n, [x, y]]) => [n, { x, y, sub: tent[n] === Infinity ? "∞" : tent[n] }]));
        qs("#svg", card).innerHTML = `<div class="fig-wrap">${F.graph({ nodes, edges: edges(), hl, directed: neg, w: 460, h: 300, r: 20 })}</div>`;
        // only the edge that was just added draws itself in; older tree edges stay put
        qsa("#svg line.draw", card).forEach((l) => { if (!justNow || !l.getAttribute("stroke").includes("amber")) l.classList.remove("draw"); });
        qsa("#svg .fi", card).forEach((g) => g.classList.remove("fi"));
        N.fx.play(qs("#svg", card));
        qs("#tbl", card).innerHTML = `<tr><th>node</th><th>distance</th><th>via</th><th>state</th></tr>` + Object.keys(GPOS).map((n) => `<tr class="${n === justNow ? "hl" : ""}"><td><b>${n}</b></td><td class="mono">${tent[n] === Infinity ? "∞" : tent[n]}</td><td class="mono dim">${parent[n] || (n === "A" ? "start" : "—")}</td><td>${done.includes(n) ? `<span style="color:var(--teal)">settled</span>` : tent[n] === Infinity ? `<span class="faint">unseen</span>` : `<span style="color:var(--violet)">tentative</span>`}</td></tr>`).join("");
        qs("#log", card).innerHTML = s ? `settled <b style="color:var(--amber)">${s.node}</b>${s.upd.length ? ` · updated ${s.upd.join(", ")}` : " · no improvements"}${s.missed.length ? ` · <span style="color:var(--rose)">too late for ${s.missed.join(", ")}</span>` : ""}` : "Start: A = 0, everything else ∞.";
        const note = qs("#note", card), end = ti === trace.steps.length;
        if (end && neg) { note.style.display = "block"; note.className = "callout rose"; note.innerHTML = `<b>Wrong answer.</b> Dijkstra locked in <b>B = 4</b> before it settled C. But A→C→B = 5 + (−3) = <b>2</b>. The error spreads: it reports D = 7 and E = 9, when the true distances are 5 and 7. A negative edge breaks the rule that settled means final.`; }
        else if (end) { note.style.display = "block"; note.className = "callout teal"; note.innerHTML = `Done. Every node's distance is final, and the green edges form the <b>shortest-path tree</b>. Shortest A→E = <b>8</b> via A→C→B→D→E (2+1+3+2).`; }
        else note.style.display = "none";
        const btn = qs("#step", card);
        btn.disabled = end;
        btn.textContent = end ? "Finished" : `Settle next: ${trace.settled[ti]}  (${ti + 1}/${trace.steps.length})`;
      }
      qs("#step", card).onclick = () => { if (ti < trace.steps.length) { ti++; draw(); } };
      qs("#rs", card).onclick = () => { ti = 0; draw(); };
      qs("#neg", card).onchange = (e) => { neg = e.target.checked; trace = dijkstraTrace(edges(), neg); ti = 0; draw(); };
      draw();
      root.appendChild(predict({ id: "a2-dij-1", q: "After settling A (dist 0) and C (dist 2), which node settles next?", opts: ["D, because it's reached through two nodes", "B: its tentative distance 3 is the smallest", "E, because it's the destination"], a: 1,
        why: "B has tentative distance 3 (via C: 2+1). The smallest tentative always settles next: 3 &lt; 7 (D) &lt; 9 (E)." }));
      root.appendChild(takeaways([
        "Dijkstra settles the <b>smallest tentative</b> node, and that distance is final.",
        "Settling relaxes the node's edges: <code>dist[v] = min(dist[v], dist[u] + w(u,v))</code>.",
        "The correctness argument needs <b>non-negative edges</b>. A negative one can undercut a node that's already settled.",
      ], "The closest node on the frontier is already optimal: settle it, then relax its edges."));
    },
  });

  /* ============ 2.2 A* vs Dijkstra ============ */
  /** Step-through A* on a small grid: one frame per expansion. Tap a cell to toggle a wall. */
  function astarRun(box, life) {
    const GW = 10, GH = 7, CS = 40, S = [1, 3], T = [8, 3];
    const kOf = (x, y) => x + "," + y, SK = kOf(...S), TK = kOf(...T);
    const walls = new Set([1, 2, 3, 4].map((y) => kOf(5, y)));
    const hOf = (x, y) => Math.abs(x - T[0]) + Math.abs(y - T[1]);
    function* frames() {
      const g = { [SK]: 0 }, parent = {}, closed = [], open = new Map([[SK, 0]]);
      let order = 0; const seq = { [SK]: order++ };
      const fOf = (k) => { const [x, y] = k.split(",").map(Number); return g[k] + hOf(x, y); };
      const snap = (x) => ({ g: { ...g }, open: [...open.keys()], closed: closed.slice(), path: [], ...x });
      yield snap({ cap: `Start: the open set holds only the start. g = <b>0</b>, h = <b>${hOf(...S)}</b>, so f = <b>${hOf(...S)}</b>.`, line: 0 });
      let asked = 0, lastAsk = -9;
      for (let round = 0; open.size; round++) {
        const keys = [...open.keys()], fmin = Math.min(...keys.map(fOf));
        // lowest f; ties go to the smaller h, then the older cell
        const cur = keys.filter((k) => fOf(k) === fmin).sort((a, b) => fOf(a) - g[a] - (fOf(b) - g[b]) || seq[a] - seq[b])[0];
        const ties = keys.filter((k) => fOf(k) === fmin);
        const [cx, cy] = cur.split(",").map(Number), cg = g[cur], ch = hOf(cx, cy);
        let ask = null;
        if (asked < 2 && round >= 2 && round - lastAsk >= 3 && ties.length < keys.length && cur !== TK) {
          asked++; lastAsk = round;
          ask = { q: "Which cell does A* expand next? Tap it.", pick: ".rn-gc.open", a: ties, why: `The lowest f in the open set wins: g ${cg} + h ${ch} = <b>f ${cg + ch}</b>.` };
        }
        open.delete(cur);
        if (cur === TK) {
          const path = []; for (let k = TK; k; k = parent[k]) path.push(k);
          yield snap({ path, cap: `The goal has the lowest f, so stop. Path cost <b>${cg}</b>, found after expanding <b>${closed.length + 1}</b> cells. The solid green cells are the path.`, line: 2, mood: "love", ask });
          return;
        }
        closed.push(cur);
        let added = 0;
        [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(([dx, dy]) => {
          const nx = cx + dx, ny = cy + dy, nk = kOf(nx, ny);
          if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || walls.has(nk) || closed.includes(nk)) return;
          if (g[nk] === undefined || cg + 1 < g[nk]) { g[nk] = cg + 1; parent[nk] = cur; if (!open.has(nk)) { seq[nk] = order++; added++; } open.set(nk, 1); }
        });
        yield snap({ cur, cap: `Expand the <b>orange</b> cell: g = <b>${cg}</b>, h = <b>${ch}</b>, f = <b>${cg + ch}</b>, the lowest in the open set. ${added ? `It adds <b>${added}</b> new cell${added > 1 ? "s" : ""} to the open set.` : "No new neighbours."}`, line: added ? 4 : 3, ask });
      }
      yield snap({ cap: "The open set is empty: <b>no path exists</b>. Tap a wall to remove it.", line: 1, mood: "sad" });
    }
    F.run(box, life, {
      code: ["open = {start}; g[start] = 0", "cur = open cell with the lowest f = g + h", "if cur is the goal: stop, trace the path back", "move cur from open to closed", "for each free neighbour n: g[n] = g[cur] + 1, add n to open"],
      build(stage, api) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${GW * CS} ${GH * CS}`); svg.setAttribute("class", "fig rn-svg rn-astar"); svg.style.maxHeight = GH * CS + "px";
        let html = "";
        for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
          const k = kOf(x, y), fixed = k === SK || k === TK;
          html += `<g class="rn-gc${fixed ? (k === SK ? " rn-gc-start" : " rn-gc-goal") : " rn-gc-free"}" data-k="${k}" transform="translate(${x * CS} ${y * CS})"><rect x="2" y="2" width="${CS - 4}" height="${CS - 4}" rx="7"/><text x="${CS / 2}" y="${CS / 2 + 5}">${k === SK ? "S" : k === TK ? "G" : ""}</text></g>`;
        }
        svg.innerHTML = `<g>${html}</g>`;
        stage.appendChild(svg);
        const cells = {};
        svg.querySelectorAll(".rn-gc").forEach((c) => (cells[c.dataset.k] = { g: c, t: c.querySelector("text") }));
        svg.querySelectorAll(".rn-gc-free").forEach((c) => c.addEventListener("click", () => {
          if (stage.querySelector(".rn-pickable")) return;   // a predict is waiting: that click is an answer
          const k = c.dataset.k;
          walls.has(k) ? walls.delete(k) : walls.add(k);
          N.sfx && N.sfx.play("select");
          api.recompute(walls.has(k) ? "Wall added. Replaying from the start." : "Wall removed. Replaying from the start.");
        }));
        return { svg, cells };
      },
      draw(sc, f, c) {
        const open = new Set(f.open), closed = new Set(f.closed), path = new Set(f.path);
        Object.entries(sc.cells).forEach(([k, h]) => {
          const [x, y] = k.split(",").map(Number);
          h.g.classList.toggle("wall", walls.has(k));
          h.g.classList.toggle("open", open.has(k));
          h.g.classList.toggle("closed", closed.has(k));
          h.g.classList.toggle("cur", k === f.cur);
          h.g.classList.toggle("path", path.has(k));
          if (k !== SK && k !== TK) h.t.textContent = !path.has(k) && (open.has(k) || closed.has(k) || k === f.cur) && f.g[k] !== undefined ? f.g[k] + hOf(x, y) : "";
          if ((k === f.cur && (!c.prev || c.prev.cur !== k)) || (path.has(k) && !c.prev?.path.length)) F.rn.pulse(c, h.g.querySelector("rect"), path.has(k) ? 0.03 * f.path.length - 0.03 * f.path.indexOf(k) : 0);
        });
      },
      frames,
    });
  }

  L["a2-astar"] = {
    sum: "A* is Dijkstra plus a sense of direction. It ranks nodes by <b>f = g + h</b>: the real distance travelled so far plus an estimate of what's left. As long as the estimate never overestimates, A* still finds the shortest path, and it explores far less.",
    steps: [
      { t: "Dijkstra searches in every direction", b: `<p>Dijkstra only knows how far each cell is from the <b>start</b>. On a grid it expands in a growing diamond, including all the cells that head <i>away</i> from the goal.</p>`,
        v: `<svg class="fig" viewBox="0 0 420 170" style="max-height:170px">${[5, 4, 3, 2, 1].map((r) => `<circle cx="110" cy="85" r="${r * 16}" fill="rgba(206,130,255,${0.05 + (5 - r) * 0.02})" stroke="rgba(206,130,255,.35)" class="fi"/>`).join("")}<circle cx="110" cy="85" r="7" fill="var(--amber)"/><text x="110" y="160" class="fig-sub">start: explores a full circle</text><circle cx="360" cy="85" r="7" fill="var(--rose)"/><text x="360" y="110" class="fig-sub">goal</text></svg>` },
      { t: "A* adds an estimate of the distance left", b: `<p>Each frontier cell gets a score <code>f = g + h</code>:</p><p><b>g</b> = real cost from the start (known).<br><b>h</b> = a <i>guess</i> of the cost to the goal, such as the grid (Manhattan) distance.</p><p>The cell with the smallest f is expanded next, so cells heading toward the goal win.</p>`,
        v: F.compare({ title: "Cell P", c: "violet", body: "g = 3, h = 5<br><b>f = 8</b>" }, { title: "Cell Q  ← expanded first", c: "teal", body: "g = 4, h = 2<br><b>f = 6</b>" }) + `<div class="fig-cap">Q is further from the start but much closer to the goal, and that makes it more promising.</div>`,
        c: { q: "What happens if h = 0 for every cell?", o: ["A* gets faster", "A* becomes exactly Dijkstra: f = g", "A* breaks"], a: 1, why: "With no estimate there's no sense of direction left. It's plain distance-from-start ordering." } },
      { t: "Watch it run", b: `<p>A* goes from <b>S</b> to <b>G</b> around a wall. Each number is a cell's <b>f</b>. <b style="color:var(--violet)">Purple</b> cells are the open set (waiting), <b style="color:var(--teal)">green</b> ones are closed (done) and <b style="color:var(--amber)">orange</b> is the cell being expanded.</p><p>It will ask you to predict the next cell. Tap any empty cell to add or remove a wall.</p>`,
        v: (box, life) => astarRun(box, life) },
      { t: "The one rule: never overestimate", b: `<p>A* is guaranteed to find the shortest path if h is <b>admissible</b>, meaning it never guesses higher than the true remaining cost.</p><p>On an open grid, Manhattan distance is admissible because no real path can be shorter. Doubling it makes A* greedier and faster, but it may skip the true shortest path.</p>`,
        v: F.bars([["true cost left", 10, "teal"], ["h = Manhattan", 8, "violet", "OK: ≤ 10"], ["h = 2 × Manhattan", 16, "rose", "overestimates"]], { max: 16 }),
        c: { q: "h = 2 × Manhattan distance. What's the result?", o: ["Always optimal and faster", "Fewer cells explored, but the path may not be the shortest", "No change"], a: 1, why: "Overestimating breaks admissibility, so a good path can be passed over." } },
      { t: "How to read the grid below", b: `<p>Dark cells are walls. <b style="color:var(--amber)">Orange</b> is the start and <b style="color:var(--rose)">red</b> is the goal. Faint purple cells were <i>expanded</i> (looked at), and the <b style="color:var(--teal)">green</b> line is the final path.</p><p>Compare the <b>Cells expanded</b> counter between the two algorithms. That number is the work done.</p>` },
    ],
    guide: ["Press <b>Run A*</b> and note the number of cells expanded.", "Press <b>Run Dijkstra</b>. Same path cost, but how many more cells?", "Set the <b>h weight</b> slider to 0 and run A* again: it matches Dijkstra.", "Push the slider to 2.5. Is the path still the same length?"],
  };

  N.register({
    id: "a2-astar", subject: "algo", lecture: 2, order: 2, num: "2.2",
    title: "A* vs Dijkstra on a grid",
    blurb: "Same grid, same goal — count how many cells each algorithm expands. Tune the heuristic and watch the guarantee bend.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const W = 21, H = 13, CS = 24;
      const walls = new Set();
      for (let y = 2; y < 11; y++) walls.add(7 + "," + y);
      for (let x = 7; x < 16; x++) walls.add(x + "," + 10);
      for (let y = 1; y < 9; y++) walls.add(14 + "," + y);
      const S = [2, 6], T = [18, 6];
      const open = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !walls.has(x + "," + y);
      let wgt = 1;
      function search(useH) {
        const g = { [S.join()]: 0 }, parent = {}, expanded = [];
        const pq = [[0, S]];
        const seen = new Set([S.join()]);
        while (pq.length) {
          pq.sort((a, b) => a[0] - b[0]);
          const [, cur] = pq.shift();
          const key = cur.join();
          if (expanded.includes(key)) continue;
          expanded.push(key);
          if (cur[0] === T[0] && cur[1] === T[1]) break;
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
            const nx = cur[0] + dx, ny = cur[1] + dy, nk = nx + "," + ny;
            if (!open(nx, ny)) return;
            const ng = g[key] + 1;
            if (g[nk] === undefined || ng < g[nk]) {
              g[nk] = ng; parent[nk] = key;
              const h = useH ? wgt * (Math.abs(nx - T[0]) + Math.abs(ny - T[1])) : 0;
              pq.push([ng + h, [nx, ny]]);
            }
          });
        }
        const path = [];
        let k = T.join();
        while (k && parent[k] !== undefined || k === S.join()) { path.push(k); if (k === S.join()) break; k = parent[k]; }
        return { expanded, path: new Set(path), cost: g[T.join()] };
      }
      const card = el(`<div class="card"><div class="controls"><button class="btn primary" id="a">Run A*</button><button class="btn" id="d">Run Dijkstra</button><span id="hw"></span></div>
        <canvas class="viz" id="cv"></canvas>
        <div class="stat-row"><div class="stat teal"><small>Cells expanded</small><b id="ex"></b></div><div class="stat"><small>Path cost</small><b id="co"></b></div><div class="stat amber"><small>Heuristic weight</small><b id="wv">1.0</b></div></div></div>`);
      root.appendChild(card);
      const sl = N.slider("h weight", 0, 2.5, 0.25, 1, (v) => v.toFixed(2));
      sl.onInput((v) => { wgt = v; qs("#wv", card).textContent = v.toFixed(2); });
      qs("#hw", card).appendChild(sl);
      function draw(res) {
        const { ctx } = N.setupCanvas(qs("#cv", card), H * CS);
        const C = N.colors(), cv = (c) => (c.startsWith("var(--") ? C[c.slice(6, -1).replace("-", "_")] || c : c);
        const cell = (x, y, c) => { ctx.fillStyle = cv(c); ctx.fillRect(x * CS + 1, y * CS + 1, CS - 2, CS - 2); };
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) cell(x, y, walls.has(x + "," + y) ? "#4b4b4b" : "#ececec");
        if (res) {
          res.expanded.forEach((k) => { const [x, y] = k.split(",").map(Number); if (!res.path.has(k)) cell(x, y, "rgba(206,130,255,0.35)"); });
          res.path.forEach((k) => { const [x, y] = k.split(",").map(Number); cell(x, y, "var(--teal)"); });
        }
        cell(S[0], S[1], "var(--amber)"); cell(T[0], T[1], "var(--rose)");
        if (res) { qs("#ex", card).textContent = res.expanded.length; qs("#co", card).textContent = res.cost ?? "unreachable"; }
      }
      qs("#a", card).onclick = () => draw(search(true));
      qs("#d", card).onclick = () => draw(search(false));
      draw(null);
      root.appendChild(predict({ id: "a2-ast-1", q: "On an open grid (no walls), heuristic weight 1 (Manhattan) vs weight 0 (Dijkstra): which expands fewer cells?", opts: ["Weight 0 — simpler is better", "Weight 1 — the heuristic steers expansion toward the goal", "Identical counts"], a: 1,
        why: "An admissible heuristic prunes the directions that lead away. Dijkstra expands a disk; A* expands a cone toward the goal." }));
      root.appendChild(takeaways([
        "<code>f = g + h</code>: real cost so far + estimate to goal.",
        "<b>h = 0 → Dijkstra.</b> The heuristic is pure added direction.",
        "Admissible (never overestimates) → optimal. Inflated → faster, possibly wrong.",
      ], "A* is Dijkstra with a compass — keep the compass honest and the answer stays optimal."));
    },
  });

  /* ============ 2.3 Distance-vector routing ============ */
  L["a2-routing"] = {
    sum: "Internet routers don't have a map. Each one only hears its neighbours say \"I can reach X in d hops\". Cut a link and that gossip can loop, with costs creeping upwards forever: <b>count to infinity</b>.",
    steps: [
      { t: "Routing by gossip (distance-vector)", b: `<p>Each router tells its neighbours how far it is from every destination. When B hears A say \"C is 2 away\", B works out: going via A costs <b>1 + 2 = 3</b>. It keeps whichever option is cheapest.</p><span class="key">A router knows only its links and what its neighbours told it. There is no global map.</span>`,
        v: F.frames([
          { t: "C announces: \"I am C, distance 0\"", v: F.cells([{ v: "C", sub: "0", c: "teal" }]) },
          { t: "B hears it: C = 0 + 1 = 1", v: F.cells([{ v: "B", sub: "C:1", c: "teal" }, "←", { v: "C", sub: "0" }]) },
          { t: "A hears B: C = 1 + 1 = 2 (via B)", v: F.cells([{ v: "A", sub: "C:2", c: "teal" }, "←", { v: "B", sub: "C:1" }]) },
        ]) },
      { t: "Cut a link and the gossip loops", b: `<p>The B–C link fails. B still remembers A's last message, \"C is 2 away\". But A's route <i>went through B</i>. B doesn't know that, so it installs \"C via A, cost 3\".</p><p>A then hears \"3\" from B and updates to 4. B updates to 5, and so on. Each round the cost creeps up by one.</p>`,
        v: F.cells([{ v: "2", sub: "A" }, "→", { v: "3", sub: "B", c: "amber" }, "→", { v: "4", sub: "A", c: "amber" }, "→", { v: "5", sub: "B", c: "amber" }, "→", { v: "…", c: "rose" }, "→", { v: "16=∞", sub: "RIP gives up", c: "rose" }]),
        c: { q: "Why doesn't the loop stop after one round?", o: ["Routers are slow", "Each only has the other's stale message and can't see that the route goes through itself", "The link heals itself"], a: 1, why: "A distance vector carries a cost, not the path, so B can't tell that A's route uses B." } },
      { t: "The patch: poisoned reverse", b: `<p>If B's route to C goes <b>through A</b>, B tells A \"C is unreachable via me (∞)\". A can't bounce the route back, so the phantom route dies immediately.</p><p>It only fixes loops between <b>two</b> routers. Loops through three or more still count up, which is why RIP caps \"infinity\" at 16.</p>`,
        v: F.compare({ title: "Without the patch", c: "rose", body: "B → A: \"C in 3\"<br>A → B: \"C in 4\"<br>… counts to 16" }, { title: "Poisoned reverse", c: "teal", body: "B → A: \"C is <b>∞</b> via me\"<br>Both routers agree: unreachable, straight away" }),
        c: { q: "What does poisoned reverse prevent?", o: ["All routing loops", "Loops between two directly connected routers", "Link failures"], a: 1, why: "It stops a neighbour routing straight back through you. A→B→C→A loops survive it." } },
      { t: "Three ways to route a network", b: `<p>Real networks mix approaches depending on size and who is in charge.</p>`,
        v: `<table class="t"><tr><th>Approach</th><th>Each router knows</th><th>Strength</th><th>Example</th></tr><tr><td><b>Link-state</b></td><td>the whole map (floods it), then runs Dijkstra</td><td>fast, correct convergence</td><td>OSPF</td></tr><tr><td><b>Distance-vector</b></td><td>only neighbours' distances</td><td>simple, cheap</td><td>RIP</td></tr><tr><td><b>Hierarchy</b></td><td>its own network in detail, other networks only as \"reachable\"</td><td>scales to the whole internet</td><td>BGP between organisations</td></tr></table>` },
    ],
    guide: ["Press <b>Exchange advertisements</b> a couple of times. Both tables stay stable.", "Press <b>Cut B–C link</b>, then keep exchanging. Watch the cost climb 3, 4, 5…", "Press <b>Reset</b>, tick <b>Poisoned reverse</b>, cut the link again and exchange once. It settles straight away."],
  };

  N.register({
    id: "a2-routing", subject: "algo", lecture: 2, order: 3, num: "2.3",
    title: "Routing without a map",
    blurb: "Two routers gossip reachability. Cut the link and watch count-to-infinity — then stop it with poisoned reverse.",
    render(root) {
      root.appendChild(header(this, ""));
      let cut = false, poison = false, round = 0;
      // state: dist each router believes to reach C, and via whom
      let A = { d: 2, via: "B" }, B = { d: 1, via: "C" };
      const card = el(`<div class="card"><div class="controls"><button class="btn primary" id="ex">Exchange advertisements</button><button class="btn rose" id="cut">Cut B–C link</button><button class="btn ghost" id="rs">Reset</button></div>
        <div id="prw"></div>
        <div class="grid two"><div class="card" style="background:var(--bg-2);margin:0"><h3>Router A</h3><table class="t" id="ta"></table><div class="faint" id="la"></div></div>
        <div class="card" style="background:var(--bg-2);margin:0"><h3>Router B</h3><table class="t" id="tb"></table><div class="faint" id="lb"></div></div></div>
        <div class="callout" id="msg" style="display:none"></div></div>`);
      root.appendChild(card);
      qs("#prw", card).appendChild(el(`<label class="field" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="pr"> Poisoned reverse (B tells A \"C unreachable via me\")</label>`));
      qs("#pr", card).onchange = (e) => (poison = e.target.checked);
      function draw() {
        const row = (t, dest) => `<tr><td>${dest}</td><td>${t.d === Infinity ? "∞" : t.d}</td><td>${t.via}</td></tr>`;
        qs("#ta", card).innerHTML = `<tr><th>dest</th><th>cost</th><th>via</th></tr>${row(A, "C")}<tr><td>B</td><td>1</td><td>B</td></tr>`;
        qs("#tb", card).innerHTML = `<tr><th>dest</th><th>cost</th><th>via</th></tr>${row(B, "C")}<tr><td>A</td><td>1</td><td>A</td></tr>`;
        qs("#la", card).textContent = `round ${round}`;
        const msg = qs("#msg", card);
        if (cut && B.d === Infinity) { msg.style.display = "block"; msg.className = "callout teal"; msg.innerHTML = `<b>Converged:</b> both routers agree C is unreachable. Poisoned reverse killed the phantom route in one round.`; }
        else if (cut && round > 3) { msg.style.display = "block"; msg.className = "callout rose"; msg.innerHTML = `<b>Counting to infinity:</b> cost is already ${A.d}. In RIP this would climb to 16 before giving up — seconds of packets looping.`; }
        else msg.style.display = "none";
      }
      qs("#ex", card).onclick = () => {
        round++;
        if (!cut) return draw();
        // B's direct link gone; B updates from A's advertisement
        if (poison) { A.d = Infinity; A.via = "—"; B.d = Infinity; B.via = "—"; }
        else {
          if (B.d !== Infinity) { B.d = A.d + 1; B.via = "A"; }
          if (A.d !== Infinity) { A.d = B.d + 1; A.via = "B"; }
          if (A.d >= 16) { A.d = Infinity; B.d = Infinity; }
        }
        draw();
      };
      qs("#cut", card).onclick = () => { cut = true; draw(); };
      qs("#rs", card).onclick = () => { cut = false; round = 0; A = { d: 2, via: "B" }; B = { d: 1, via: "C" }; draw(); };
      draw();
      root.appendChild(predict({ id: "a2-rout-1", q: "B–C link is cut. B still holds A's old advertisement \"C in 2\". What does B install?", opts: ["\"C unreachable\" immediately", "\"C via A, cost 3\" — a route that silently loops through itself", "It floods a link-state packet"], a: 1,
        why: "Distance vectors don't record <i>how</i> A reaches C — A's route went through B, so B just created a loop. That loop is count-to-infinity." }));
      root.appendChild(takeaways([
        "DV = local gossip: cost + next hop, <b>no path information</b>.",
        "Stale advertisements create phantom routes → <b>count to infinity</b>.",
        "<b>Poisoned reverse</b> kills two-node loops; longer loops survive it.",
        "Link-state floods the whole map instead — fast convergence, more state.",
      ], "Distance vectors can't see their own loops — poisoned reverse is the patch."));
    },
  });

})();

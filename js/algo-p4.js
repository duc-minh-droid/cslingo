/* Phase 4 — Minimum Spanning Trees: cut property, Prim vs Kruskal */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  const POS = { A: [70, 150], B: [185, 55], C: [215, 215], D: [345, 80], E: [415, 200] };
  const EDGES = [["A", "B", 4], ["A", "C", 3], ["B", "C", 2], ["B", "D", 5], ["C", "D", 6], ["C", "E", 7], ["D", "E", 1]];
  // MST = {D-E 1, B-C 2, A-C 3, B-D 5} = 11
  const nodes = (sub = {}, colorOf = () => null) => Object.fromEntries(Object.entries(POS).map(([k, [x, y]]) => [k, { x, y, c: colorOf(k), sub: sub[k] }]));
  const ek = (a, b) => `${a}-${b}`;

  // Kruskal: sorted edges, union-find — record every decision (accept or reject) for the stepper
  function kruskalEvents() {
    const comp = Object.fromEntries(Object.keys(POS).map((n) => [n, n]));
    const find = (x) => (comp[x] === x ? x : (comp[x] = find(comp[x])));
    return EDGES.slice().sort((a, b) => a[2] - b[2]).map(([a, b, w]) => {
      const ra = find(a), rb = find(b), ok = ra !== rb;
      if (ok) comp[ra] = rb;
      return { e: [a, b, w], ok, groups: Object.values(Object.keys(POS).reduce((g, n) => ((g[find(n)] = (g[find(n)] || []).concat(n)), g), {})).map((x) => x.join("")) };
    });
  }
  // Prim from A: the cheapest edge leaving the tree each step
  function primEvents() {
    const inT = new Set(["A"]), ev = [];
    while (inT.size < Object.keys(POS).length) {
      const cross = EDGES.filter(([a, b]) => inT.has(a) !== inT.has(b)).sort((x, y) => x[2] - y[2]);
      const [a, b, w] = cross[0];
      ev.push({ e: [a, b, w], cands: cross.map((c) => ek(c[0], c[1])), tree: [...inT] });
      inT.add(inT.has(a) ? b : a);
    }
    return ev;
  }

  /* ============ 4.1 Cut property ============ */
  L["a4-cut"] = {
    sum: "A <b>minimum spanning tree</b> connects every node using the cheapest possible set of edges. One rule, the <b>cut property</b>, tells you which edges are guaranteed to belong: split the nodes into two groups, and the cheapest edge crossing the split is always safe.",
    steps: [
      { t: "The problem: connect everything, cheaply", b: `<p>Think of towns (nodes) and possible cable routes (edges, with costs). You want every town connected, <b>directly or indirectly</b>, for the least total cost.</p><p>The answer is always a <b>tree</b>: n − 1 edges and no loops. A loop would mean one of its cables is unnecessary.</p>`,
        v: F.compare({ title: "Spanning tree", c: "teal", body: "5 nodes, <b>4 edges</b>, no cycles, everything reachable" }, { title: "Not a tree", c: "rose", body: "a cycle means one edge is redundant: remove it and the rest stays connected" }) },
      { t: "Cut the graph in two", b: `<p>A <b>cut</b> splits the nodes into two groups. The edges that cross the split are the only bridges between them, so the tree <b>must</b> use at least one.</p>`,
        v: F.graph({ nodes: nodes({}, (k) => (k === "A" ? "violet" : null)), edges: EDGES, hl: { "A-B": "amber", "A-C": "amber" }, w: 480, h: 260 }) + `<div class="fig-cap">Cut {A} | {B, C, D, E}: only A–B (4) and A–C (3) cross it.</div>` },
      { t: "The cheapest crossing edge is safe", b: `<p>Suppose some tree used A–B (4) instead of A–C (3). Swap them. Everything stays connected, and the total drops by 1. So the cheapest crossing edge is always part of some minimum tree.</p><span class="key">This one fact is why Prim and Kruskal are provably correct, not just good guesses.</span>`,
        v: F.compare({ title: "Tree using A–B (4)", c: "rose", body: "total = T + 4" }, { title: "Swap to A–C (3)", c: "teal", body: "total = T + 3: <b>strictly cheaper</b>, still connected" }),
        c: { q: "A cut has crossing edges of weight 2, 5 and 7. Which one is guaranteed safe?", o: ["The 5", "The 2, because the lightest edge across a cut is always safe", "None, you need to see the whole graph"], a: 1, why: "Any spanning tree using the 5 or the 7 can swap to the 2 and only get cheaper." } },
      { t: "The flip side: the heaviest edge in a cycle", b: `<p>In any cycle, the <b>heaviest</b> edge is never needed. The rest of the cycle already connects its two ends.</p><p>A–B–C is a cycle (4, 2, 3), so A–B (4) can go.</p>`,
        v: F.graph({ nodes: { A: [60, 130], B: [190, 40], C: [210, 170] }, edges: [["A", "B", "4 ✗", "rose"], ["B", "C", 2, "teal"], ["A", "C", 3, "teal"]], w: 300, h: 200 }),
        c: { q: "Why is it correct for Kruskal to skip an edge that would close a cycle?", o: ["It prunes randomly", "Its two ends are already connected, so adding it only adds cost", "It isn't. Kruskal is approximate"], a: 1, why: "A tree needs exactly n − 1 edges and no cycles, so a cycle edge is pure extra cost." } },
    ],
    guide: ["Look at the dashed red line and click the <b>cheapest</b> edge crossing it.", "Solve all three cuts. Each answer is a forced MST edge.", "Say the rule out loud: lightest across a cut is safe, heaviest on a cycle is never needed."],
  };

  N.register({
    id: "a4-cut", subject: "algo", lecture: 4, order: 1, num: "4.1",
    title: "The cut property",
    blurb: "A dashed line splits the graph. Find the edge the MST is forced to use.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const CUTS = [
        { x: 128, left: ["A"], safe: "A-C", txt: "{A} | {B, C, D, E}" },
        { x: 290, left: ["A", "B", "C"], safe: "B-D", txt: "{A, B, C} | {D, E}" },
        { x: 385, left: ["A", "B", "C", "D"], safe: "D-E", txt: "{A, B, C, D} | {E}" },
      ];
      let ci = 0; const found = [];
      const card = el(`<div class="card"><div class="card-head"><h3>Cut <span id="ct" class="mono"></span></h3><span class="faint">click the cheapest crossing edge</span><span style="flex:1"></span><div class="boss-dots" id="dots" style="margin:0">${CUTS.map((_, i) => `<button disabled>${i + 1}</button>`).join("")}</div></div>
        <div class="fig-wrap" id="svg"></div><div class="callout" id="fb" style="display:none"></div></div>`);
      root.appendChild(card);
      const crossing = (cut) => EDGES.filter(([a, b]) => cut.left.includes(a) !== cut.left.includes(b));
      function draw() {
        const cut = CUTS[ci], hl = {};
        crossing(cut).forEach(([a, b]) => (hl[ek(a, b)] = "amber"));
        found.forEach((k) => (hl[k] = "teal"));
        qs("#ct", card).textContent = cut.txt;
        qs("#svg", card).innerHTML = F.graph({ nodes: nodes({}, (k) => (cut.left.includes(k) ? "violet" : null)), edges: EDGES, hl, w: 480, h: 270 });
        const svgEl = qs("#svg svg", card);
        svgEl.insertAdjacentHTML("afterbegin", `<line x1="${cut.x}" y1="0" x2="${cut.x}" y2="270" stroke="var(--rose)" stroke-width="2" stroke-dasharray="8 6"/>`);
        qsa("#svg .draw", card).forEach((d) => d.classList.remove("draw"));
        crossing(cut).forEach(([a, b, w]) => {
          const [x1, y1] = POS[a], [x2, y2] = POS[b];
          svgEl.insertAdjacentHTML("beforeend", `<circle cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" r="22" fill="transparent" style="cursor:pointer" data-e="${ek(a, b)}" data-w="${w}"><title>${a}–${b} (${w})</title></circle>`);
        });
        qsa("[data-e]", svgEl).forEach((h) => h.addEventListener("click", () => answer(h.dataset.e, +h.dataset.w)));
        qsa("#dots button", card).forEach((b, i) => { b.className = i < ci || found.length === CUTS.length && i === ci ? "ok" : i === ci ? "cur" : ""; });
      }
      function answer(k, w) {
        const cut = CUTS[ci], fb = qs("#fb", card), [a, b] = k.split("-");
        fb.style.display = "block";
        if (k === cut.safe) {
          if (!found.includes(k)) found.push(k);
          fb.className = "callout teal";
          fb.innerHTML = `<b>Safe edge: ${a}–${b} (${w}).</b> It's the cheapest bridge across this cut, so every minimum spanning tree can use it.`;
          N.fx.pop(fb);
          if (ci < CUTS.length - 1) { ci++; life.timeout(draw, 1100); }
          else { draw(); fb.innerHTML += `<br>All three cuts solved. Together with B–C (2), they give the MST {D–E 1, B–C 2, A–C 3, B–D 5} = <b>11</b>.`; N.fx.celebrate(fb); }
        } else {
          fb.className = "callout rose";
          fb.innerHTML = `${a}–${b} costs ${w}, but there's a cheaper edge crossing this cut. Look again.`;
          N.fx.shake(fb);
        }
      }
      draw();
      root.appendChild(predict({ id: "a4-cut-1", q: "Remove any edge from a minimum spanning tree and the tree splits into two groups: that's a cut. What must be true of the removed edge?", opts: ["It was the longest edge in the tree", "It was the lightest edge crossing that cut, otherwise a cheaper swap would exist", "Nothing in particular"], a: 1,
        why: "If a cheaper edge crossed the same cut, swapping it in would give a cheaper spanning tree, which contradicts 'minimum'." }));
      root.appendChild(takeaways([
        "<b>Cut property:</b> the lightest edge across a cut is always safe.",
        "<b>Cycle property:</b> the heaviest edge on a cycle is never needed.",
        "Prim and Kruskal are both greedy uses of the cut property, and that's their correctness proof.",
      ], "Lightest across a cut is forced in; heaviest on a cycle is dead weight."));
    },
  });

  /* ============ 4.2 Prim vs Kruskal ============ */
  const NAMES = Object.keys(POS);
  const nice = (k) => k.replace("-", "–");
  /** Shared scene for the MST runners: graph with editable weights and pickable edges (data-k "A-B"). */
  function mstScene(stage, api, W, kind) {
    const g = F.graphScene(stage, { nodes: POS, edges: W, w: 480, h: 270, editable: true });
    g.svg.classList.add("rn-mst", "rn-mst-" + kind);
    W.forEach((e) => {
      const h = g.edge(e[0], e[1]);
      h.g.dataset.k = g.key(e[0], e[1]);
      const hit = h.g.querySelector(".rn-base").cloneNode(); hit.setAttribute("class", "rn-hit"); hit.removeAttribute("marker-end");
      h.g.insertBefore(hit, h.g.firstChild);
      api.edit(h.wbox, { get: () => e[2], set: (v) => { e[2] = v; h.wt.textContent = v; h.wt.dataset.v = v; }, min: 1, max: 9 });
    });
    return g;
  }
  function mstDraw(g, W, f, c) {
    NAMES.forEach((n) => {
      const h = g.node(n), st = f.newNode === n ? "s-cur" : f.inTree.includes(n) ? "s-done" : "";
      h.g.setAttribute("class", `rn-node ${st}`);
      if (f.tags) F.rn.text(c, h.tag, f.tags[n]);
      if (f.newNode === n && (!c.prev || c.prev.newNode !== n)) F.rn.pulse(c, h.body);
    });
    W.forEach(([a, b]) => {
      const k = g.key(a, b), h = g.edge(a, b), tree = f.tree.includes(k);
      h.g.classList.toggle("try", f.cands.includes(k) || f.edge === k && !tree);
      h.g.classList.toggle("reject", f.rejected.includes(k));
      h.g.classList.toggle("rn-todo", !tree && !f.rejected.includes(k) && !f.done);
      h.hot.classList.toggle("amber", f.edge === k && tree);
      F.rn.stroke(c, h.hot, tree);
      if (f.edge === k && (!c.prev || c.prev.edge !== k)) F.rn.pulse(c, h.wbox);
    });
  }
  const sumW = (W, keys) => W.filter(([a, b]) => keys.includes(ek(...[a, b].sort()))).reduce((s, e) => s + e[2], 0);

  /** Prim from A, one frame per edge added. Weights are editable. */
  function primRun(box, life) {
    const W = EDGES.map((e) => e.slice());
    function* frames() {
      const inT = ["A"], tree = [];
      const crossing = () => W.filter(([a, b]) => inT.includes(a) !== inT.includes(b)).sort((x, y) => x[2] - y[2]);
      const snap = (x) => ({ inTree: inT.slice(), tree: tree.slice(), rejected: [], cands: crossing().map(([a, b]) => ek(...[a, b].sort())), ...x });
      yield snap({ cap: "Start with the tree <b>{A}</b>. The orange dashed edges cross from the tree to the rest of the graph.", line: 0 });
      for (let pick = 1; inT.length < NAMES.length; pick++) {
        const cr = crossing(), [a, b, w] = cr[0], nu = inT.includes(a) ? b : a, k = ek(...[a, b].sort());
        const ties = cr.filter((e) => e[2] === w).map(([x, y]) => ek(...[x, y].sort()));
        const ask = pick === 2 || pick === 3 ? { q: "Which edge does Prim add next? Tap it.", pick: ".rn-edge.rn-todo", a: ties, why: `The cheapest edge crossing out of the tree: <b>${nice(k)} (${w})</b>.` } : null;
        inT.push(nu); tree.push(k);
        const done = inT.length === NAMES.length;
        yield snap({ edge: k, newNode: nu, done, ask, line: 2, mood: done ? "love" : "happy",
          cap: `Cheapest crossing edge: <b>${nice(k)} (${w})</b>. Add it, and <b>${nu}</b> joins the tree. Total so far <b>${sumW(W, tree)}</b>.` });
      }
      yield snap({ done: true, cands: [], line: 3, mood: "love", cap: `Every node is in. The minimum spanning tree has <b>${tree.length}</b> edges and total weight <b>${sumW(W, tree)}</b>.` });
    }
    F.run(box, life, {
      code: ["tree = {A}", "look at edges with exactly one end in the tree", "add the cheapest one and its new node", "repeat until every node is in"],
      build: (stage, api) => mstScene(stage, api, W, "prim"),
      draw: (g, f, c) => mstDraw(g, W, f, c),
      frames,
    });
  }

  /** Kruskal: sorted edges, one frame per accept or reject. Weights are editable. */
  function kruskalRun(box, life) {
    const W = EDGES.map((e) => e.slice());
    function* frames() {
      const comp = Object.fromEntries(NAMES.map((n) => [n, n]));
      const find = (x) => (comp[x] === x ? x : (comp[x] = find(comp[x])));
      const label = () => { const m = {}; NAMES.forEach((n) => { const r = find(n); m[r] = m[r] || n; }); return Object.fromEntries(NAMES.map((n) => [n, m[find(n)]])); };
      const sorted = W.slice().sort((x, y) => x[2] - y[2]), tree = [], rejected = [];
      const touched = () => NAMES.filter((n) => tree.some((k) => k.split("-").includes(n)));
      const snap = (x) => ({ inTree: touched(), tree: tree.slice(), rejected: rejected.slice(), cands: [], tags: label(), ...x });
      // plan the decisions first so a reject can ask about the next edge that is actually added
      const plan = [];
      { const c2 = { ...comp }, f2 = (x) => (c2[x] === x ? x : (c2[x] = f2(c2[x])));
        sorted.forEach(([a, b]) => { const ok = f2(a) !== f2(b); if (ok) c2[f2(a)] = f2(b); plan.push(ok); }); }
      const accIdx = plan.map((ok, i) => (ok ? i : -1)).filter((i) => i >= 0);
      const rejAsk = plan.findIndex((ok, i) => !ok && accIdx.some((j) => j > i));
      const askAt = new Set([accIdx[1], rejAsk >= 0 ? rejAsk : accIdx[3]].filter((i) => i !== undefined));
      yield snap({ line: 0, cap: `Sort every edge by weight: ${sorted.map(([a, b, w]) => `${a}${b} ${w}`).join(" · ")}. Each node starts in its own group (the letter above it).` });
      for (let i = 0; i < sorted.length; i++) {
        const [a, b, w] = sorted[i], k = ek(...[a, b].sort()), ok = find(a) !== find(b);
        let ask = null;
        if (askAt.has(i)) {
          const j = accIdx.find((x) => x >= i), [na, nb, nw] = sorted[j], nk = ek(...[na, nb].sort());
          // ties: any unused edge of the same weight whose ends are in different groups right now
          const ties = sorted.slice(i).filter(([x, y, ww]) => ww === nw && find(x) !== find(y)).map(([x, y]) => ek(...[x, y].sort()));
          ask = { q: "Which edge is added next? Tap it.", pick: ".rn-edge.rn-todo", a: ties.length ? ties : [nk],
            why: ok ? `It's the cheapest edge left, and its ends are in different groups: <b>${nice(nk)} (${nw})</b>.` : `${nice(k)} (${w}) is next in the list, but its ends are already connected, so it's skipped. The next edge added is <b>${nice(nk)} (${nw})</b>.` };
        }
        if (ok) { comp[find(a)] = find(b); tree.push(k); } else rejected.push(k);
        const full = tree.length === NAMES.length - 1;
        yield snap({ edge: k, ask, line: ok ? 2 : 3, mood: ok ? "happy" : "surprised",
          cap: ok ? `Next: <b>${nice(k)} (${w})</b>. ${a} and ${b} are in different groups, so take it and merge them. Total <b>${sumW(W, tree)}</b>${full ? `. That's ${tree.length} edges: a spanning tree` : ""}.`
            : `Next: <b>${nice(k)} (${w})</b>. ${a} and ${b} are already in the same group, so <b>reject</b> it: it would close a loop.` });
      }
      yield snap({ done: true, line: 1, mood: "love", cap: `List finished. The tree has <b>${tree.length}</b> edges, total weight <b>${sumW(W, tree)}</b>, and <b>${rejected.length}</b> edge${rejected.length === 1 ? " was" : "s were"} rejected.` });
    }
    F.run(box, life, {
      code: ["sort all edges by weight", "for each edge (u, v) in that order:", "  if u, v in different groups: take it, merge groups", "  else: reject it (it would close a loop)"],
      build: (stage, api) => mstScene(stage, api, W, "kruskal"),
      draw: (g, f, c) => mstDraw(g, W, f, c),
      frames,
    });
  }

  L["a4-mst"] = {
    sum: "Two greedy algorithms, same answer. <b>Prim</b> grows one tree outward from a starting node. <b>Kruskal</b> takes edges cheapest-first from anywhere, merging little trees and skipping any edge that would make a loop.",
    steps: [
      { t: "Prim: grow one blob", b: `<p>Start anywhere, say A. Repeatedly add the <b>cheapest edge that connects the tree to a new node</b>. That's the cut property, with the cut being tree | everything else.</p>`,
        v: F.frames([
          { t: "Tree {A}: cheapest way out is A–C (3)", v: F.cells([{ v: "A", c: "teal" }, "→", { v: "C", c: "amber" }]) },
          { t: "Tree {A, C}: cheapest way out is C–B (2)", v: F.cells([{ v: "AC", c: "teal" }, "→", { v: "B", c: "amber" }]) },
          { t: "…until all 5 nodes are in: 4 edges total", v: F.cells([{ v: "ACBDE", c: "teal" }]) },
        ]) },
      { t: "Watch Prim run", b: `<p>Prim grows a tree from A. <b style="color:var(--amber)">Orange</b> dashed edges cross from the tree to the rest; the cheapest one is added in <b style="color:var(--teal)">green</b>.</p><p>It will ask you to pick the next edge. Tap a weight to change it and the run recomputes.</p>`,
        v: (box, life) => primRun(box, life) },
      { t: "Kruskal: cheapest edges first, skip loops", b: `<p>Sort <i>all</i> edges by weight. Walk down the list and take each edge <b>unless its two ends are already connected</b>. Early on you have a forest of small trees that gradually merge.</p><p>A <b>union-find</b> structure answers \"already connected?\" almost instantly.</p>`,
        v: F.cells([{ v: "DE 1", c: "teal" }, { v: "BC 2", c: "teal" }, { v: "AC 3", c: "teal" }, { v: "AB 4", sub: "loop ✗", c: "rose" }, { v: "BD 5", c: "teal" }, { v: "CD 6", sub: "loop ✗", c: "rose" }, { v: "CE 7", sub: "loop ✗", c: "rose" }]),
        c: { q: "What's the main difference between Prim and Kruskal?", o: ["They give different answers", "Prim grows one connected tree; Kruskal merges separate trees in weight order", "Only speed"], a: 1, why: "Same optimum (both use the cut property), different intermediate structure." } },
      { t: "Watch Kruskal run", b: `<p>Kruskal walks the sorted list. The letter above each node is its group. An edge joining two groups is taken in <b style="color:var(--teal)">green</b>; one inside a group is <b style="color:var(--rose)">rejected</b>.</p><p>It will ask you to pick the next edge added. Tap a weight to change it.</p>`,
        v: (box, life) => kruskalRun(box, life) },
      { t: "Edge cases worth knowing", b: `<p><b>Ties:</b> either choice is fine. Several different MSTs can have the same total.<br><b>Disconnected graph:</b> no spanning tree exists. Kruskal ends with a <i>spanning forest</i> of fewer than n − 1 edges.<br><b>Which is faster?</b> Prim with a heap suits dense graphs. Kruskal's sort dominates, O(m log m), which suits sparse graphs.</p>`,
        c: { q: "The graph is disconnected. What does Kruskal do?", o: ["Crash", "Produce a spanning forest: components stay separate, with fewer than n − 1 edges", "Add fake edges"], a: 1, why: "It can't merge components that have no edges between them. Honest output: a forest." } },
    ],
    guide: ["Press <b>Prim ▸</b> a few times. The orange edges are the candidates leaving the tree; the cheapest one is taken.", "Press <b>Kruskal ▸</b>. Red flashes are rejected edges (they'd close a loop).", "Both finish at total weight 11. Same tree, different route there."],
  };

  N.register({
    id: "a4-mst", subject: "algo", lecture: 4, order: 2, num: "4.2",
    title: "Prim vs Kruskal, side by side",
    blurb: "Same graph, two greedy strategies. One grows a tree, the other merges a forest, and both land on the same MST.",
    render(root) {
      root.appendChild(header(this, ""));
      const PE = primEvents(), KE = kruskalEvents();
      let pi = 0, ki = 0;
      const card = el(`<div class="card"><div class="grid two">
        <div><div class="card-head"><span class="tag teal">Prim</span><span class="faint">one tree, grown from A</span><span style="flex:1"></span><button class="btn small primary" id="ps">Prim ▸</button></div><div class="fig-wrap" id="psvg"></div><div class="mono dim" id="plog" style="margin-top:8px;min-height:40px"></div></div>
        <div><div class="card-head"><span class="tag violet">Kruskal</span><span class="faint">cheapest edges first</span><span style="flex:1"></span><button class="btn small" id="ks">Kruskal ▸</button></div><div class="fig-wrap" id="ksvg"></div><div class="mono dim" id="klog" style="margin-top:8px;min-height:40px"></div></div>
        </div><div class="controls"><button class="btn ghost small" id="rs">Reset both</button></div></div>`);
      root.appendChild(card);
      const total = (es) => es.reduce((s, e) => s + e[2], 0);
      function draw() {
        const pTaken = PE.slice(0, pi).map((x) => x.e), phl = {};
        pTaken.forEach(([a, b]) => (phl[ek(a, b)] = "teal"));
        const inTree = new Set(["A", ...pTaken.flat().filter((x) => typeof x === "string")]);
        if (pi < PE.length) PE[pi].cands.forEach((k) => { if (!phl[k]) phl[k] = "amber"; });
        qs("#psvg", card).innerHTML = F.graph({ nodes: nodes({}, (k) => (inTree.has(k) ? "teal" : null)), edges: EDGES, hl: phl, w: 480, h: 270 });
        qs("#plog", card).innerHTML = pi === 0 ? "Tree = {A}. Amber = edges leaving the tree." : `took ${PE[pi - 1].e[0]}–${PE[pi - 1].e[1]} (${PE[pi - 1].e[2]}) · total ${total(pTaken)}${pi === PE.length ? ` <b style="color:var(--teal)">✓ MST = 11</b>` : ""}`;
        const kSeen = KE.slice(0, ki), khl = {};
        kSeen.forEach(({ e: [a, b], ok }, i) => { if (ok) khl[ek(a, b)] = "teal"; else if (i === ki - 1) khl[ek(a, b)] = "rose"; });
        const kTaken = kSeen.filter((x) => x.ok).map((x) => x.e);
        const last = kSeen[ki - 1];
        qs("#ksvg", card).innerHTML = F.graph({ nodes: nodes(), edges: EDGES, hl: khl, w: 480, h: 270 });
        qs("#klog", card).innerHTML = ki === 0 ? "Sorted: DE1 · BC2 · AC3 · AB4 · BD5 · CD6 · CE7" : `${last.ok ? "took" : `<span style="color:var(--rose)">rejected</span>`} ${last.e[0]}–${last.e[1]} (${last.e[2]})${last.ok ? "" : ": ends already connected"} · groups ${last.groups.join(" | ")} · total ${total(kTaken)}${kTaken.length === 4 ? ` <b style="color:var(--teal)">✓ MST = 11</b>` : ""}`;
        qs("#ps", card).disabled = pi >= PE.length;
        qs("#ks", card).disabled = ki >= KE.length;
        [["#psvg", pi], ["#ksvg", ki]].forEach(([sel]) => { qsa(`${sel} .fi`, card).forEach((g) => g.classList.remove("fi")); qsa(`${sel} .draw`, card).forEach((d) => { if (!d.getAttribute("stroke").includes("rose")) d.classList.remove("draw"); }); });
      }
      qs("#ps", card).onclick = () => { if (pi < PE.length) { pi++; draw(); } };
      qs("#ks", card).onclick = () => { if (ki < KE.length) { ki++; draw(); } };
      qs("#rs", card).onclick = () => { pi = 0; ki = 0; draw(); };
      draw();
      root.appendChild(predict({ id: "a4-mst-1", q: "Kruskal has taken D–E (1), B–C (2) and A–C (3). Next in the list is A–B (4). What happens?", opts: ["Taken, because it's the cheapest left", "Rejected: A and B are already connected through C, so it would close a loop", "Depends on tie order"], a: 1,
        why: "A–C–B already links A and B. Adding A–B would create the cycle A–B–C, so union-find says 'same component': skip." }));
      root.appendChild(takeaways([
        "<b>Prim</b>: cheapest edge out of the current tree. O(m log n) with a heap.",
        "<b>Kruskal</b>: cheapest remaining edge that joins two different components. Union-find makes that check nearly free.",
        "Both are the cut property in action, so both are optimal. Choose by graph density and data structures.",
      ], "Same destination: one grows a tree, the other merges a forest."));
    },
  });

})();

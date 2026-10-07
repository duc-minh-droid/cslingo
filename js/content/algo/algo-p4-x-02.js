/* algo-p4-x-02: Phase 4 coverage pass: 4.3 Prim and 4.4 Kruskal in detail. */
(function () {
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const px = (NIC.shared.algoP4x = NIC.shared.algoP4x || {});
  const { POS, EDG, NAMES, K, nice, wOf, sumK, plural, mstScene, mstDraw } = px;

  /* ---------- Prim, as the lecture writes it: nearest(v) and its cost for every vertex still outside the tree ---------- */
  // prettier-ignore
  function primFrames(W, v0) {
    const fr = [], inT = [v0], tree = [], near = {}, cost = {};
    const R = () => NAMES.filter((v) => !inT.includes(v));
    R().forEach((v) => { near[v] = v0; cost[v] = wOf(W, v, v0); });
    const show = (v) => (cost[v] === Infinity ? "∞" : cost[v]);
    const tagsOf = () => Object.fromEntries(R().map((v) => [v, cost[v] === Infinity ? "∞" : `${near[v]}·${cost[v]}`]));
    const snap = (x) => ({ inTree: inT.slice(), tree: tree.slice(), rejected: [], cands: R().filter((v) => cost[v] < Infinity).map((v) => K(v, near[v])), tags: tagsOf(), tent: R().filter((v) => cost[v] < Infinity), ...x });
    fr.push(snap({ line: 1, cap: `Start with the tree <b>{${v0}}</b>. Every other vertex records <b>nearest(v) = ${v0}</b> and its cost: the weight of the edge to ${v0}, or <b>∞</b> if there is none. The tag on each node reads <i>nearest·cost</i>.` }));
    let pick = 0;
    while (R().length) {
      const cand = R().filter((v) => cost[v] < Infinity);
      if (!cand.length) {
        fr.push(snap({ bad: R(), cands: [], tent: [], done: true, line: 3, mood: "sad", cap: `Every remaining vertex still has cost <b>∞</b>: none of them has an edge to the tree. <b>next_vertex</b> stays null, so the output is <b>“No spanning tree”</b>.` }));
        return fr;
      }
      const best = Math.min(...cand.map((v) => cost[v])), tied = cand.filter((v) => cost[v] === best), nx = tied[0], via = near[nx], k = K(nx, via);
      pick++;
      const ask = pick === 2 || pick === 4 ? { q: "Which vertex joins the tree next? Tap it.", pick: ".rn-node.s-tent", a: tied, why: `It has the smallest cost among the vertices outside the tree: <b>${tied[0]}</b> at ${best}, via ${near[tied[0]]}.` } : null;
      inT.push(nx); tree.push(k);
      const ups = [];
      R().forEach((v) => { const w = wOf(W, v, nx); if (w < cost[v]) { ups.push(`${v}: ${show(v)} → ${w} (via ${nx})`); near[v] = nx; cost[v] = w; } });
      const done = !R().length;
      fr.push(snap({ edge: k, newNode: nx, ask, line: 4, done, mood: done ? "love" : "happy", ...(done ? { cands: [] } : {}),
        cap: `Smallest cost outside the tree: <b>${nx}</b> (${best}, via ${via}). Move ${nx} in and add the edge <b>${nice(k)}</b>. Total <b>${sumK(W, tree)}</b>. ${done ? "" : ups.length ? `Update: ${ups.join(", ")}.` : "Nobody gets closer, so no update."}` }));
    }
    fr.push(snap({ done: true, line: 0, cands: [], mood: "love", cap: `Every vertex is in. The tree has <b>${tree.length}</b> edges and total weight <b>${sumK(W, tree)}</b>. The outer loop ran ${tree.length} times.` }));
    return fr;
  }
  // prettier-ignore
  function primRun(box, life, W, v0) {
    F.run(box, life, {
      code: ["VT = {v0}; ET = {}; R = V minus VT", "for v in R: nearest(v) = v0", "while R is not empty:", "  next = the v in R with the smallest cost (none: no tree)", "  move next into VT; add {next, nearest(next)} to ET", "  for v in R: if w(v, next) < cost(v): nearest(v) = next"],
      build: (stage, api) => mstScene(stage, api, W, "nearest"),
      draw: (g, f, c) => mstDraw(g, W, f, c),
      frames: () => primFrames(W, v0),
    });
  }
  /* ============ 4.3 Prim in detail ============ */
  // prettier-ignore
  const NEAR0 = (() => { const f = primFrames(EDG.map((e) => e.slice()), "A"); return f[0].tags; })();
  // prettier-ignore
  L["a4-prim"] = {
    sum: "<b>Prim's algorithm</b> grows one tree from any start vertex. To make the cheapest edge fast to find, every outside vertex remembers its <b>nearest</b> tree vertex and the cost to reach it, and updates that note whenever the tree grows.",
    steps: [
      { t: "The rule", b: `<p>Prim's algorithm is three lines:</p><ol><li>Start with a tree that holds <b>one vertex</b>, chosen arbitrarily.</li><li>Repeatedly add the <b>least-cost edge</b> that joins the tree to a new vertex, so the result is still a tree.</li><li>Stop when every vertex is in.</li></ol><p>On the eight-town network, starting at A, the edges arrive in this order:</p>`,
        v: F.cells([{ v: "AC", sub: "5", c: "teal" }, { v: "AB", sub: "8", c: "teal" }, { v: "BD", sub: "6", c: "teal" }, { v: "DE", sub: "3", c: "teal" }, { v: "EG", sub: "7", c: "teal" }, { v: "FG", sub: "10", c: "teal" }, { v: "FH", sub: "4", c: "teal" }], { label: "order added" }),
        c: { q: "On this network the edges are added as 5, 8, 6, 3, 7, 10, 4. Why is the 8 chosen before the 3?", o: ["Prim picks the largest edge that still keeps the result a tree", "Only edges touching the tree are allowed, and the 3 does not yet", "The 3 was skipped because adding it would break the tree rules"], a: 1, why: "D–E (3) is the lightest edge overall, but it is only a candidate once D or E is in the tree. Prim always chooses from the edges leaving the tree." } },
      { t: "Remember the nearest tree vertex", b: `<p>Scanning every edge at every step would be slow. Instead each vertex still <b>outside</b> the tree keeps two notes:</p><p><b>nearest(v)</b>: the tree vertex it is cheapest to reach it from, and the <b>cost</b> $w(v, \\text{nearest}(v))$.</p><p>At the start, the tree is just A, so every outside vertex has nearest = A. A vertex with no edge to A has cost <b>∞</b>.</p>`,
        v: F.cells(Object.keys(NEAR0).map((v) => ({ v, sub: NEAR0[v], c: NEAR0[v] === "∞" ? "dim" : "amber" })), { label: "tags (nearest·cost) at the start" }),
        c: { q: "At the start, which vertex records the cheapest cost to reach the tree {A}?", o: ["C, via A", "B, via A", "D, via A"], a: 0, why: "A–C costs 5 and A–B costs 8. D has no edge to A at all, so its cost is ∞." } },
      { t: "The pseudocode, line by line", b: `<p>Inside <code>while R is not empty</code> there are three parts:</p><ol><li><b>Select.</b> Look at every vertex v in R and keep the one with the smallest cost. If every cost is ∞ there is nothing to add: output <b>“No spanning tree”</b>.</li><li><b>Add.</b> Move that vertex into the tree and add the edge {next, nearest(next)}.</li><li><b>Update.</b> For every vertex still in R, if the edge to the <i>new</i> vertex is cheaper than its current cost, point nearest(v) at the new vertex.</li></ol>`,
        v: F.flow([{ t: "Select", s: "smallest cost in R", c: "violet" }, { t: "Add", s: "vertex and its edge", c: "teal" }, { t: "Update", s: "nearest and cost", c: "amber" }], { loop: true }),
        c: { q: "A new vertex X has just joined the tree. Which remaining vertices might change their nearest()?", o: ["Only those with an edge to X that is cheaper than their current cost", "All of them, because the tree has changed shape in general", "Only the one vertex that happens to be cheapest overall"], a: 0, why: "Only a cheaper link through X can beat a vertex's current best. Vertices not adjacent to X cannot improve." } },
      { t: "Watch Prim run", b: `<p>The tag on each node reads <i>nearest·cost</i>. Violet nodes are outside the tree with a finite cost; the dashed orange edge shows each one's nearest link. Each step moves the cheapest violet node in, turning it green.</p><p>It will ask you to pick the next vertex. Tap a weight to change it and the run recomputes.</p>`,
        v: (box, life) => primRun(box, life, EDG.map((e) => e.slice()), "A") },
      { t: "When Prim gets stuck", b: `<p>Suppose the roads to H are blocked. The tree grows through the other seven vertices, but H still has cost <b>∞</b>. When every remaining vertex has cost ∞, no vertex can be selected and the algorithm stops with <b>“No spanning tree”</b>.</p><p>The network is not connected, so no spanning tree exists. The tree Prim built covers only A's connected piece.</p>`,
        v: F.graph({ nodes: Object.fromEntries(Object.entries(POS).map(([k, v]) => [k, { x: v[0], y: v[1], c: k === "H" ? "rose" : "teal", sub: k === "H" ? "∞" : undefined }])), edges: EDG.filter(([a, b]) => a !== "H" && b !== "H"), hl: { "D-E": "teal", "A-C": "teal", "B-D": "teal", "E-G": "teal", "A-B": "teal", "F-G": "teal" }, w: 480, h: 290 }),
        c: { q: "Prim has added 6 vertices and all remaining costs are ∞. What should it output?", o: ["The 6-vertex tree as the answer", "No spanning tree", "A tree with the missing edges guessed"], a: 1, why: "A spanning tree must reach every vertex. If some vertex has no edge into the tree, none exists." } },
      { t: "Counting the work", b: `<p>The outer loop runs $|V| - 1$ times. On the $i$th pass the select loop looks at $|V| - i$ vertices and the update loop at $|V| - i - 1$. The total is</p>$$\\sum_{i=1}^{|V|-1} \\big[2(|V| - i) - 1\\big] = (|V| - 1)^2 = O(|V|^2)$$<p>This is a <b>quadratic</b> algorithm: it depends on the number of vertices, not the number of edges.</p>`,
        v: F.bars([["pass 1", 13, "violet"], ["pass 2", 11, "violet"], ["pass 3", 9, "violet"], ["pass 4", 7, "violet"], ["pass 5", 5, "violet"], ["pass 6", 3, "violet"], ["pass 7", 1, "violet"]], { max: 13, unit: " steps" }) + `<div class="fig-cap">8 vertices: 13 + 11 + 9 + 7 + 5 + 3 + 1 = 49 = 7².</div>`,
        c: { q: "A network has 101 vertices. Roughly how many steps does this version of Prim take?", o: ["About 100", "About 10 000", "About 1 000 000"], a: 1, why: "$(|V| - 1)^2 = 100^2 = 10\\,000$. Doubling the vertices would multiply the work by four." } },
    ],
    guide: ["Pick a start vertex (<b>Start A</b>, <b>Start D</b>...), then press <b>play</b> or <b>step forward</b>.", "Read the tag on each node: nearest·cost. Watch it update after every move.", "Try a different start vertex. Compare the final tree and total.", "Answer the questions after the demo."],
  };
  // prettier-ignore
  N.register({
    id: "a4-prim", subject: "algo", lecture: 4, order: 3, num: "4.3",
    title: "Prim's algorithm in detail",
    blurb: "The nearest-vertex table, step by step, with the loop counts that make it O(V²).",
    render(root, life) {
      root.appendChild(header(this, ""));
      const card = el(`<div class="card"><div class="card-head"><h3>Prim's algorithm</h3><span class="faint">choose the start vertex</span><span style="flex:1"></span><div id="seg"></div></div><div id="box"></div></div>`);
      root.appendChild(card);
      let start = "A";
      const mount = () => { const box = qs("#box", card); box.innerHTML = ""; primRun(box, life, EDG.map((e) => e.slice()), start); };
      qs("#seg", card).appendChild(N.seg(["A", "D", "F", "H"].map((v) => [v, "Start " + v]), start, (v) => { start = v; mount(); }));
      mount();
      root.appendChild(predict({ id: "a4-prim-1", q: "You restart Prim from H instead of A on this network (all weights are different). What do you expect at the end?", opts: ["The same set of edges, added in a different order", "A different tree, since the start vertex decides the tree", "The same edges, but with a different total weight"], a: 0,
        why: "Every edge Prim adds is the lightest one crossing a cut, so every edge is forced into the MST. With distinct weights there is only one MST, whatever the start. Only the order changes." }));
      root.appendChild(predict({ id: "a4-prim-2", q: "Prim has 5 vertices left outside the tree. A new vertex joins. How many comparisons does the update loop make?", opts: ["5 comparisons: one per vertex still outside", "1 comparison: only the cheapest vertex", "All the edges in the graph"], a: 0,
        why: "The update loop visits each remaining vertex once, comparing its stored cost with the edge to the newcomer. That is where the $|V| - i - 1$ in the count comes from." }));
      root.appendChild(takeaways([
        "Prim keeps <b>one tree</b>, and for each outside vertex its <b>nearest</b> tree vertex and cost.",
        "Each pass: select the smallest cost, move it in, then update the notes of the vertices left.",
        "No cost below ∞ left means <b>no spanning tree</b>. Total work is $(|V|-1)^2 = O(|V|^2)$.",
      ], "Grow one tree: nearest, add, update."));
    },
  });
  /* ---------- Kruskal, as the lecture writes it: sorted list R, groups of vertices, stop at |V| - 1 edges ---------- */
  // prettier-ignore
  function kruskalFrames(W) {
    const comp = {}; NAMES.forEach((n) => (comp[n] = n));
    const find = (x) => (comp[x] === x ? x : (comp[x] = find(comp[x])));
    const groups = () => { const m = {}; NAMES.forEach((n) => (m[find(n)] = (m[find(n)] || []).concat(n))); return Object.values(m).map((g) => g.sort()).sort((a, b) => (a[0] < b[0] ? -1 : 1)); };
    const gtext = () => groups().map((g) => `{${g.join(" ")}}`).join(" ");
    const label = () => { const o = {}; groups().forEach((g) => g.forEach((n) => (o[n] = g[0]))); return o; };
    const sorted = W.slice().sort((x, y) => x[2] - y[2] || (K(x[0], x[1]) < K(y[0], y[1]) ? -1 : 1));
    const tree = [], rejected = [], fr = [];
    const touched = () => NAMES.filter((n) => tree.some((k) => k.split("-").includes(n)));
    const snap = (x) => ({ inTree: touched(), tree: tree.slice(), rejected: rejected.slice(), cands: [], tags: label(), ...x });
    // plan the decisions first, so a question can ask which edge is really added next
    const plan = [];
    { const c2 = {}; NAMES.forEach((n) => (c2[n] = n)); const f2 = (x) => (c2[x] === x ? x : (c2[x] = f2(c2[x]))); let cnt = 0;
      for (const [a, b] of sorted) { if (cnt === NAMES.length - 1) break; const ok = f2(a) !== f2(b); if (ok) { c2[f2(a)] = f2(b); cnt++; } plan.push(ok); } }
    const accIdx = plan.map((ok, i) => (ok ? i : -1)).filter((i) => i >= 0);
    const rejAsk = plan.findIndex((ok, i) => !ok && accIdx.some((j) => j > i));
    const askAt = new Set([accIdx[1], rejAsk >= 0 ? rejAsk : accIdx[3]].filter((i) => i !== undefined));
    fr.push(snap({ line: 0, cap: `Sort every edge by weight: <b>${sorted.map(([a, b, w]) => `${a}${b} ${w}`).join(" · ")}</b>. Each vertex starts as its own group: ${gtext()}.` }));
    for (let i = 0; i < plan.length; i++) {
      const [a, b, w] = sorted[i], k = K(a, b), ok = find(a) !== find(b);
      let ask = null;
      if (askAt.has(i)) {
        const j = accIdx.find((x) => x >= i), [, , nw] = sorted[j], nk = K(sorted[j][0], sorted[j][1]);
        const ties = sorted.slice(i).filter(([x, y, ww]) => ww === nw && find(x) !== find(y)).map(([x, y]) => K(x, y));
        ask = { q: "Which edge is added to the tree next? Tap it.", pick: ".rn-edge.rn-todo", a: ties.length ? ties : [nk],
          why: ok ? `It is the cheapest edge left, and its ends are in different groups: <b>${nice(nk)} (${nw})</b>.` : `${nice(k)} (${w}) is next in the list, but its ends share a group, so it is skipped. The next edge added is <b>${nice(nk)} (${nw})</b>.` };
      }
      if (ok) { comp[find(a)] = find(b); tree.push(k); } else rejected.push(k);
      fr.push(snap({ edge: k, ask, line: ok ? 4 : 3, mood: ok ? "happy" : "surprised",
        cap: ok ? `Head of the list: <b>${nice(k)} (${w})</b>. ${a} and ${b} are in different groups, so add it and merge them. Total <b>${sumK(W, tree)}</b>. Groups: ${gtext()}.`
          : `Head of the list: <b>${nice(k)} (${w})</b>. ${a} and ${b} are already in the same group, so <b>skip</b> it: it would close a loop. Groups unchanged: ${gtext()}.` }));
    }
    const unread = sorted.slice(plan.length), n1 = NAMES.length - 1;
    if (tree.length === n1) fr.push(snap({ done: true, line: 5, mood: "love", cap: `<b>|ET| = ${tree.length} = |V| − 1</b>, so the loop stops. Total weight <b>${sumK(W, tree)}</b>.${unread.length ? ` The last ${plural(unread.length, "edge")} (${unread.map(([a, b]) => `${a}${b}`).join(", ")}) ${unread.length === 1 ? "was" : "were"} never even looked at.` : ""}` }));
    else fr.push(snap({ done: true, line: 5, mood: "sad", cap: `The list <b>R is empty</b> but ET has only <b>${tree.length}</b> of the <b>${n1}</b> edges a tree needs. The groups left are ${gtext()}. Output: <b>“No spanning tree”</b>.` }));
    return fr;
  }
  // prettier-ignore
  function kruskalRun(box, life, W) {
    F.run(box, life, {
      code: ["R = sorted(E); groups = {{v} for each v}", "while R is not empty and |ET| < |V| - 1:", "  e = {vi, vj} = head(R); drop it from R", "  if group(vi) = group(vj): skip e (it would close a loop)", "  else: add e to ET; merge the two groups", "if |ET| = |V| - 1: output the tree, else “No spanning tree”"],
      build: (stage, api) => mstScene(stage, api, W, "kruskal"),
      draw: (g, f, c) => mstDraw(g, W, f, c),
      frames: () => kruskalFrames(W),
    });
  }
  /* ============ 4.4 Kruskal in detail ============ */
  // prettier-ignore
  L["a4-kruskal"] = {
    sum: "<b>Kruskal's algorithm</b> sorts every edge and walks down the list, keeping an edge unless its two ends are already in the same group. Groups merge as edges join them, and the loop stops as soon as there are |V| − 1 edges.",
    steps: [
      { t: "The rule", b: `<p>Kruskal's algorithm is three lines:</p><ol><li>Start with an <b>empty</b> set of edges.</li><li>Add edges one at a time: always the <b>least-cost</b> edge that can join the current set <b>without making a cycle</b>.</li><li>Keep going until no more edges can be added.</li></ol><p>Here is the sorted list for the eight-town network. Edges after FG are never examined:</p>`,
        v: F.cells([{ v: "DE", sub: "3 ✓", c: "teal" }, { v: "FH", sub: "4 ✓", c: "teal" }, { v: "AC", sub: "5 ✓", c: "teal" }, { v: "BD", sub: "6 ✓", c: "teal" }, { v: "EG", sub: "7 ✓", c: "teal" }, { v: "AB", sub: "8 ✓", c: "teal" }, { v: "CD", sub: "9 ✗", c: "rose" }, { v: "FG", sub: "10 ✓", c: "teal" }, { v: "BC", sub: "11", c: "dim" }, { v: "DG", sub: "12", c: "dim" }, { v: "GH", sub: "13", c: "dim" }, { v: "CF", sub: "14", c: "dim" }, { v: "BE", sub: "15", c: "dim" }]),
        c: { q: "In that list, why is CD (9) skipped even though it is cheaper than FG (10)?", o: ["It is rejected for being lighter than expected", "C and D were already connected through other chosen edges", "Edges are never taken in consecutive order"], a: 1, why: "By then A, B, C and D are all joined via AC, AB and BD. CD would close a loop, so it is skipped." } },
      { t: "Groups: spotting a cycle quickly", b: `<p>Early on Kruskal holds a <b>forest</b>: several small trees, not yet one. To test an edge fast, every vertex belongs to a <b>group</b>: the set of vertices already connected to it.</p><p>If the edge's two ends are in <b>different</b> groups, taking it is safe: it joins two trees, so the two groups <b>merge</b>. If they are in the <b>same</b> group, the edge would close a loop, so skip it.</p>`,
        v: F.frames([
          { t: "Start: {A} {B} {C} {D} …", v: F.cells(["A", "B", "C", "D", "E"].map((v) => ({ v, c: "dim" }))) },
          { t: "Take DE: {D E} merges", v: F.cells([{ v: "A", c: "dim" }, { v: "B", c: "dim" }, { v: "C", c: "dim" }, { v: "DE", c: "teal" }]) },
          { t: "Take AC and BD: {A C} {B D E}", v: F.cells([{ v: "AC", c: "teal" }, { v: "BDE", c: "teal" }]) },
        ]),
        c: { q: "The next edge joins a vertex in {A, C} to a vertex in {B, D, E}. What does Kruskal do?", o: ["Skips it, since both ends are already connected", "Adds it and merges the two groups", "Adds it and keeps both groups separate"], a: 1, why: "The ends are in different groups, so there is no loop. The edge is added and the groups become {A, B, C, D, E}." } },
      { t: "The pseudocode, line by line", b: `<p>The lecture's version keeps a <b>sorted remaining list R</b>, a growing edge set $E_T$ and the list of groups. The loop runs <code>while |R| &gt; 0 and |E_T| &lt; |V| − 1</code>: stop when the list runs out <b>or</b> when the tree is complete.</p><p>Each pass takes the head of R, finds the groups of its two ends, and if they differ adds the edge to $E_T$ and merges the groups. After the loop, $|E_T| = |V| - 1$ means success; anything less means <b>“No spanning tree”</b>.</p>`,
        v: F.flow([{ t: "Sort", s: "R = sorted(E)", c: "violet" }, { t: "Test head", s: "group(vi) ≠ group(vj)?", c: "amber" }, { t: "Add + merge", s: "or skip", c: "teal" }], { loop: true }),
        c: { q: "Why does the loop also stop when |ET| reaches |V| − 1, rather than reading the whole list?", o: ["The tree is complete at |V| − 1 edges; more would only make loops", "The list has always become empty by that point anyway", "Sorting is only partly finished when that many are found"], a: 0, why: "A spanning tree has exactly |V| − 1 edges. Any later edge joins two vertices that are already connected." } },
      { t: "Watch Kruskal run", b: `<p>The tag on each node is its <b>group</b>, named by its first letter. A joining edge turns <b style="color:var(--teal)">green</b> and merges two groups; a loop edge flashes <b style="color:var(--rose)">red</b>. The caption lists every group.</p><p>It will ask you to pick the next edge added. Tap a weight to change it.</p>`,
        v: (box, life) => kruskalRun(box, life, EDG.map((e) => e.slice())) },
      { t: "Two ways to finish", b: `<p><b>Success:</b> $|E_T| = |V| - 1$. The loop stops at once, and every edge still in the list is <b>never looked at</b>.</p><p><b>Failure:</b> the list R runs out with fewer than $|V| - 1$ edges chosen. The groups never became one, so the graph is disconnected and the output is <b>“No spanning tree”</b>.</p>`,
        v: F.compare({ title: "|ET| = |V| − 1", c: "teal", body: "spanning tree found, loop ends early, later edges unread" }, { title: "R empty, |ET| < |V| − 1", c: "rose", body: "some vertices unreachable: <b>no spanning tree</b>" }),
        c: { q: "Kruskal ends with the list empty and 5 edges chosen on a 9-vertex graph. What does that mean?", o: ["The graph is disconnected, so no spanning tree exists", "The tree is complete because 5 edges are always enough", "There was a bug in the sorting step of the algorithm"], a: 0, why: "A spanning tree on 9 vertices needs 8 edges. Running out of edges at 5 means some groups could never be joined." } },
      { t: "The cost of Kruskal", b: `<p>Sorting the edges costs $O(|E| \\log |E|)$. The loop runs at most $|E|$ times, and with a good group structure each lookup costs $O(\\log |V|)$. So the total is $O(|E| \\log |E| + |E| \\log |V|)$.</p><p>A simple graph has $|E| \\le \\tfrac12 |V|(|V|-1) < |V|^2$, so $\\log |E| < 2 \\log |V|$ and the two logs are the same order. The result is <b>$O(|E| \\log |V|)$</b>.</p>`,
        v: F.flow([{ t: "Sort edges", s: "O(E log E)", c: "violet" }, { t: "≤ E passes", s: "× O(log V) lookup", c: "amber" }, { t: "Total", s: "O(E log V)", c: "teal" }]),
        c: { q: "Why can O(log |E|) be written as O(log |V|)?", o: ["Because |E| is at most about |V|², so log |E| ≤ 2 log |V|", "Because the number of edges always equals the number of vertices", "Because logarithms of large numbers all come out the same"], a: 0, why: "A simple graph has at most |V|(|V| − 1)/2 edges, so log |E| is at most twice log |V|, and constants do not change the order." } },
    ],
    guide: ["Choose <b>Whole network</b> and step through Kruskal. Read the groups in the caption each time.", "Notice how many edges are never examined once 7 are chosen.", "Choose <b>Town H cut off</b> and run again to see the “No spanning tree” ending.", "Answer the questions after the demo."],
  };
  // prettier-ignore
  N.register({
    id: "a4-kruskal", subject: "algo", lecture: 4, order: 4, num: "4.4",
    title: "Kruskal's algorithm in detail",
    blurb: "Sorted list, groups that merge, early stopping, and the failure ending when no tree exists.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const card = el(`<div class="card"><div class="card-head"><h3>Kruskal's algorithm</h3><span class="faint">choose the network</span><span style="flex:1"></span><div id="seg"></div></div><div id="box"></div></div>`);
      root.appendChild(card);
      let mode = "whole";
      const mount = () => { const box = qs("#box", card); box.innerHTML = ""; const W = (mode === "whole" ? EDG : EDG.filter(([a, b]) => a !== "H" && b !== "H")).map((e) => e.slice()); kruskalRun(box, life, W); };
      qs("#seg", card).appendChild(N.seg([["whole", "Whole network"], ["cut", "Town H cut off"]], mode, (v) => { mode = v; mount(); }));
      mount();
      root.appendChild(predict({ id: "a4-kruskal-1", q: "On the whole network (8 vertices) Kruskal has just added its 7th edge. What happens to the edges still unread in the list?", opts: ["They are all ignored: the loop stops", "Each is still checked for a loop, then skipped", "The cheapest is added as a spare edge"], a: 0,
        why: "The loop condition is |ET| < |V| − 1. With 7 edges chosen on 8 vertices it fails, so the rest of the list is never read." }));
      root.appendChild(predict({ id: "a4-kruskal-2", q: "With town H cut off, Kruskal reads every edge in the list and ends with 6 edges on 8 vertices. What does it output?", opts: ["No spanning tree", "The 6 edges, as a minimum spanning tree", "The 6 edges plus the cheapest rejected edge"], a: 0,
        why: "A tree on 8 vertices needs 7 edges. The list ran out at 6, so H could never be joined: the output is “No spanning tree”." }));
      root.appendChild(takeaways([
        "<b>Sort</b> the edges, then take each one unless its two ends are in the <b>same group</b>.",
        "A taken edge <b>merges</b> two groups. The loop stops at <b>|V| − 1</b> edges or when the list runs out.",
        "List exhausted early means <b>no spanning tree</b>. Total cost is $O(|E| \\log |V|)$.",
      ], "Sort, test the groups, merge, stop at n − 1."));
    },
  });
})();

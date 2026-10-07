/* algo-p4-x-04: Phase 4 coverage pass: 4.8 ties and uses, 4.9 MST to TSP tour. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  /* ============ 4.8 Ties, disconnected graphs and real uses ============ */
  // prettier-ignore
  const CP = [[60, 60], [100, 50], [120, 90], [75, 110], [300, 45], [345, 40], [370, 85], [320, 95], [180, 205], [225, 195], [245, 240], [200, 250]];
  // prettier-ignore
  const CCOL = ["var(--teal)", "var(--violet)", "var(--amber)", "var(--blue)", "var(--rose)", "var(--text-dim)"];
  /** Prim on straight-line distances; returns [i, j, length] (length in tens of pixels, unrounded). */
  // prettier-ignore
  function pointMst(P) {
    const n = P.length, d = (i, j) => Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) / 10, inT = [0], ed = [];
    while (inT.length < n) { let b = null; inT.forEach((i) => { for (let j = 0; j < n; j++) if (!inT.includes(j)) { const w = d(i, j); if (!b || w < b[2]) b = [i, j, w]; } }); ed.push(b); inT.push(b[1]); }
    return ed;
  }
  // prettier-ignore
  function clusterSvg(P, k) {
    const ed = pointMst(P), cut = ed.slice().sort((a, b) => b[2] - a[2]).slice(0, k - 1), isCut = (e) => cut.includes(e);
    const lab = P.map((_, i) => i); const find = (x) => (lab[x] === x ? x : (lab[x] = find(lab[x])));
    ed.filter((e) => !isCut(e)).forEach(([i, j]) => { lab[find(i)] = find(j); });
    const roots = [...new Set(P.map((_, i) => find(i)))], colOf = (i) => CCOL[roots.indexOf(find(i)) % CCOL.length];
    const lines = ed.map((e) => { const [i, j, w] = e, [x1, y1] = P[i], [x2, y2] = P[j], mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      return isCut(e) ? `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--rose)" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round"/><g><rect x="${mx - 14}" y="${my - 11}" width="28" height="20" rx="7" fill="var(--rose-dim)" stroke="var(--rose)" stroke-width="2"/><text x="${mx}" y="${my + 4}" text-anchor="middle" style="font:900 12px var(--sans);fill:var(--rose-ink)">${Math.round(w)}</text></g>`
        : `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colOf(i)}" stroke-width="3.5" stroke-linecap="round"/>`; }).join("");
    const dots = P.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="9" fill="${colOf(i)}" stroke="var(--panel)" stroke-width="2.5"/>`).join("");
    return { svg: `<svg class="fig" viewBox="0 0 420 290" style="max-height:290px">${lines}${dots}</svg>`, cut, groups: roots.length };
  }
  // prettier-ignore
  L["a4-edge"] = {
    sum: "Real data has ties, missing links and uses beyond cables. Equal weights give several MSTs, a disconnected graph has none, and cutting the heaviest MST edges is a classic way to find clusters.",
    steps: [
      { t: "Equal weights: more than one MST", b: `<p>If two edges have the same weight, the choice between them can lead to different trees with the <b>same total</b>. A square whose four sides all cost 3 has four different minimum spanning trees: drop any one side.</p><p>So “the” minimum spanning tree is only unique when no two weights tie.</p>`,
        v: F.frames([
          { t: "Drop the top: total 9", v: F.graph({ nodes: { A: [30, 30], B: [130, 30], C: [130, 110], D: [30, 110] }, edges: [["A", "B", 3, "dim"], ["B", "C", 3, "teal"], ["C", "D", 3, "teal"], ["D", "A", 3, "teal"]], w: 160, h: 140, maxH: 120, r: 14 }) },
          { t: "Drop the right: total 9", v: F.graph({ nodes: { A: [30, 30], B: [130, 30], C: [130, 110], D: [30, 110] }, edges: [["A", "B", 3, "teal"], ["B", "C", 3, "dim"], ["C", "D", 3, "teal"], ["D", "A", 3, "teal"]], w: 160, h: 140, maxH: 120, r: 14 }) },
        ]),
        c: { q: "A square has four sides of weight 3 and no other edges. How many different minimum spanning trees does it have?", o: ["1", "4", "3"], a: 1, why: "A spanning tree of 4 corners needs 3 of the 4 sides. There are 4 ways to leave one out, and each costs 9." } },
      { t: "Handling ties in code", b: `<p>The lecture's pseudocode does not say what to do with equal weights. Either choice is fine for correctness: the output is still <b>a</b> minimum spanning tree, but possibly a different one.</p><p>For repeatable results, <b>break ties with a fixed rule</b>, for example sort by weight and then by the vertex names. Then two runs, or two implementations using the same rule, print the same tree. Always compare <b>total weights</b>, not edge lists, when checking two algorithms.</p>`,
        v: F.cells([{ v: "AB 3", c: "teal" }, { v: "AD 3", c: "teal" }, { v: "BC 3", c: "violet" }, { v: "CD 3", c: "violet" }], { label: "sorted by (weight, name)" }),
        c: { q: "Prim and Kruskal return different edge lists on a graph with ties. What should you check to see if both are right?", o: ["That the two lists of edges are identical in every detail", "That both are spanning trees with the same total weight", "That each one used the lightest edge of the graph first"], a: 1, why: "With ties, several different trees can be minimum. What every correct output shares is the total weight." } },
      { t: "No edges, no tree", b: `<p>Some graphs are <b>disconnected</b>: there are two or more pieces with no edge between them. No spanning tree exists.</p><p>Both algorithms notice. <b>Kruskal</b> runs out of edges with fewer than $|V| - 1$ chosen. <b>Prim</b> reaches a point where every outside vertex has cost ∞. Both output <b>“No spanning tree”</b>. A graph that is only slightly disconnected still has a minimum spanning <i>forest</i>: one tree per piece.</p>`,
        v: F.graph({ nodes: { A: [40, 60], B: [130, 120], C: [60, 180], D: [310, 60], E: [380, 130], F: [300, 190] }, edges: [["A", "B", 4, "teal"], ["B", "C", 6, "teal"], ["A", "C", 9], ["D", "E", 3, "teal"], ["E", "F", 5, "teal"], ["D", "F", 8]], w: 440, h: 240, maxH: 200 }) + `<div class="fig-cap">Two pieces, no link between them: each has a tree, but the whole graph has none.</div>`,
        c: { q: "A graph has two separate pieces of 4 vertices each. What is the largest forest of edges you could pick without a cycle?", o: ["7 edges, one fewer than 8 vertices", "6 edges: 3 for each piece", "8 edges, one per vertex"], a: 1, why: "Each piece of 4 vertices can hold a tree of 3 edges, giving 6 in total. A single tree on all 8 would need 7, and no edge joins the pieces." } },
      { t: "Use: networks and rail", b: `<p>The classic use is the original problem: the cheapest way to lay <b>cable, pipe, road or rail</b> so that every site is connected. Borůvka's electricity network and the lecture's High Speed 2 example are of this kind.</p><p>An MST is cheapest for the network as a whole. It does <b>not</b> make each pair of sites close: two neighbouring towns might be linked only by a long path through the tree.</p>`,
        v: F.flow([{ t: "Sites", s: "towns, depots", c: "dim" }, { t: "Costs", s: "per link", c: "amber" }, { t: "MST", s: "cheapest connected network", c: "teal" }]),
        c: { q: "An MST links 6 depots at the least total cable length. What can you not promise?", o: ["That every depot is connected to every other depot directly", "That the route between two chosen depots is the shortest", "That the network contains no loops of cable anywhere"], a: 1, why: "The MST minimises the sum of cable lengths. The path between two depots through it may be much longer than the direct link they could have had." } },
      { t: "Use: clustering and segmentation", b: `<p>Treat data points as vertices and the distance between points as edge weights. Build the MST, then <b>delete the $k - 1$ heaviest MST edges</b>. The tree falls into $k$ pieces: $k$ clusters.</p><p>Each heavy MST edge is the cheapest way to join its two sides, so deleting it separates parts that really are far apart. Image segmentation works the same way, with pixels as vertices and colour differences as weights.</p>`,
        v: F.flow([{ t: "Points", s: "distances as weights", c: "dim" }, { t: "MST", s: "connect cheaply", c: "violet" }, { t: "Cut heaviest k−1", s: "k clusters", c: "teal" }]),
        c: { q: "You build the MST of 30 points and delete its 4 heaviest edges. How many groups of points result?", o: ["4", "5", "26"], a: 1, why: "A tree falls into one more piece with each edge removed: 1 + 4 = 5 groups." } },
    ],
    guide: ["Move the slider to choose the number of clusters, <b>k</b>.", "The dashed red edges are the heaviest MST edges that get cut. Read their weights.", "Try k = 3, then 5. Notice which links disappear first.", "Answer the questions after the demo."],
  };
  // prettier-ignore
  N.register({
    id: "a4-edge", subject: "algo", lecture: 4, order: 8, num: "4.8",
    title: "Ties, gaps and real uses",
    blurb: "Equal weights, disconnected graphs, then clustering by cutting the heaviest tree edges.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(`<div class="card"><div class="card-head"><h3>Clusters from an MST</h3><span class="faint">12 points, straight-line distances</span></div><div class="controls" id="ctl"></div><div class="fig-wrap" id="svg"></div><div class="mono dim" id="log" style="margin-top:8px;min-height:44px"></div></div>`);
      root.appendChild(card);
      const sk = N.slider("Clusters k", 1, 6, 1, 3);
      qs("#ctl", card).appendChild(sk);
      function draw() {
        const k = sk.value, r = clusterSvg(CP, k);
        qs("#svg", card).innerHTML = r.svg; qsa("#svg .fi, #svg .draw", card).forEach((x) => x.classList.remove("fi", "draw"));
        qs("#log", card).innerHTML = k === 1 ? "No edges cut: the whole MST is one cluster." : `Cut the <b>${k - 1}</b> heaviest MST edge${k === 2 ? "" : "s"} (lengths ${r.cut.map((e) => Math.round(e[2])).join(", ")}) → <b>${r.groups}</b> clusters.`;
      }
      sk.onInput(draw); draw();
      root.appendChild(predict({ id: "a4-edge-1", q: "You raise k from 3 to 4 in the demo. What changes in the picture?", opts: ["One more MST edge is cut, splitting one cluster into two", "The MST is rebuilt from scratch with different edges", "The cluster colours change but the cut edges stay the same"], a: 0,
        why: "The MST is built once. Raising k just cuts the next-heaviest tree edge, so one existing cluster divides." }));
      root.appendChild(predict({ id: "a4-edge-2", q: "Why does cutting the heaviest MST edges give sensible clusters?", opts: ["It is the cheapest link across its split, so the sides are far apart", "Heavy edges are always the ones that Kruskal skipped over", "The heaviest edges of a graph are always found on cycles"], a: 0,
        why: "Each MST edge is the lightest crossing edge for the split it creates (the cut property). If even that is long, the two sides really are separated. Kruskal skips edges lying on cycles, which the MST never contains." }));
      root.appendChild(takeaways([
        "<b>Equal weights</b> allow several MSTs with the same total. Use a fixed tie-break and compare totals.",
        "A <b>disconnected</b> graph has no spanning tree: Kruskal and Prim both report it.",
        "MSTs give cheap networks and, by cutting the $k-1$ heaviest edges, $k$ clusters.",
      ], "Cheap to connect, easy to cut at the weak links."));
    },
  });

  /* ============ 4.9 From MST to a travelling-salesman tour ============ */
  // prettier-ignore
  const TP = { A: [60, 150], B: [120, 55], C: [135, 245], D: [235, 150], E: [300, 50], F: [345, 235], G: [430, 140] };
  // prettier-ignore
  const TN = Object.keys(TP);
  // prettier-ignore
  const td = (a, b) => Math.hypot(TP[a][0] - TP[b][0], TP[a][1] - TP[b][1]) / 10;
  /** All the numbers for the doubled-tree tour: MST, Euler walk, shortcut tour and the true optimum by brute force. */
  // prettier-ignore
  function tspData() {
    const T = ["A"], ed = [];
    while (T.length < TN.length) { let b = null; T.forEach((a) => TN.forEach((c) => { if (!T.includes(c)) { const w = td(a, c); if (!b || w < b[2]) b = [a, c, w]; } })); ed.push(b); T.push(b[1]); }
    const adj = {}; TN.forEach((n) => (adj[n] = [])); ed.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
    const walk = ["A"], seen = new Set(["A"]), pre = ["A"];
    (function go(v) { adj[v].slice().sort().forEach((u) => { if (!seen.has(u)) { seen.add(u); pre.push(u); walk.push(u); go(u); walk.push(v); } }); })("A");
    const len = (seq) => seq.reduce((s, v, i) => (i ? s + td(seq[i - 1], v) : s), 0);
    const W = ed.reduce((s, e) => s + e[2], 0), tour = len(pre.concat("A"));
    let best = Infinity, bp = null;
    (function perm(a, k) { if (k === a.length) { const l = len(["A", ...a, "A"]); if (l < best) { best = l; bp = a.slice(); } return; } for (let i = k; i < a.length; i++) { [a[k], a[i]] = [a[i], a[k]]; perm(a, k + 1); [a[k], a[i]] = [a[i], a[k]]; } })(TN.slice(1), 0);
    return { ed, W, walk, pre, tour, opt: best, optTour: ["A", ...bp], len };
  }
  // prettier-ignore
  function tspFrames() {
    const D = tspData(), fr = [], f1 = (x) => x.toFixed(1), n = TN.length;
    fr.push({ stage: "pts", tour: [], cap: `Seven towns. We want a round trip that visits each one once and is as short as we can manage. The exactly shortest trip is the NP-complete travelling-salesman problem, so we use a <b>heuristic</b>.`, line: 0 });
    fr.push({ stage: "mst", tour: [], cap: `Step 1: build a minimum spanning tree (here with Prim). It has <b>${D.ed.length}</b> edges and total weight <b>W = ${f1(D.W)}</b>.`, line: 0 });
    fr.push({ stage: "walk", tour: [], cap: `Step 2: walk right round the tree, down every edge and back. Each edge is used twice, so the walk is exactly <b>2W = ${f1(2 * D.W)}</b> long. Walk (children in alphabetical order): <b>${D.walk.join(" ")}</b>.`, line: 1 });
    let asks = 0;
    for (let k = 1; k < n; k++) {
      const a = D.pre[k - 1], b = D.pre[k], ia = D.walk.indexOf(a), ib = D.walk.indexOf(b), seg = D.walk.slice(ia, ib + 1), skipped = seg.slice(1, -1), l = td(a, b), detour = D.len(seg);
      let ask = null;
      if (skipped.length && asks < 2) { asks++; ask = { q: `The walk goes ${seg.join(" → ")}. Which town does the tour visit next? Tap it.`, pick: ".tsp-city", a: [b], why: `${skipped.join(", ")} ${skipped.length === 1 ? "has" : "have"} already been visited, so the tour skips straight to the next <b>new</b> town, <b>${b}</b>.` }; }
      fr.push({ stage: "tour", tour: D.pre.slice(0, k + 1), ask, line: 2, mood: "happy",
        cap: skipped.length ? `The walk goes ${seg.join(" → ")}. ${skipped.join(", ")} ${skipped.length === 1 ? "is" : "are"} already visited, so <b>shortcut</b> straight from ${a} to ${b}: ${f1(l)} instead of the walk's ${f1(detour)}. Tour so far ${f1(D.len(D.pre.slice(0, k + 1)))}.`
          : `Next new town in the walk: <b>${b}</b>. Leg ${a} → ${b} is ${f1(l)}. Tour so far ${f1(D.len(D.pre.slice(0, k + 1)))}.` });
    }
    fr.push({ stage: "close", tour: D.pre.concat("A"), line: 3, mood: "love", cap: `Close the loop back to A. The round trip is <b>${f1(D.tour)}</b> long, no more than the doubled walk's ${f1(2 * D.W)}: shortcuts never lengthen the trip when straight lines obey the triangle inequality.` });
    fr.push({ stage: "opt", tour: D.pre.concat("A"), line: 3, mood: "love", cap: `Checking all ${[1, 2, 3, 4, 5, 6].reduce((p, x) => p * x, 1)} possible round trips finds the true best (dashed): <b>${f1(D.opt)}</b>. So MST ${f1(D.W)} ≤ best ${f1(D.opt)} ≤ ours ${f1(D.tour)} ≤ 2 × MST ${f1(2 * D.W)}. Ours is ${(D.tour / D.opt).toFixed(2)}× the best, well inside the guaranteed 2×.`, final: true });
    fr.forEach((f) => (f.D = D));
    return fr;
  }
  // prettier-ignore
  function tspRun(box, life) {
    F.run(box, life, {
      code: ["build a minimum spanning tree (weight W)", "walk round it, down and back up every edge: length 2W", "visit each town the first time the walk reaches it (shortcut repeats)", "return to the start: the tour is at most 2W"],
      build(stage) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 480 290"); svg.setAttribute("class", "fig rn-svg"); svg.style.maxHeight = "290px";
        svg.innerHTML = `<g class="tsp-lines"></g>${TN.map((k) => `<g class="tsp-city" data-k="${k}" transform="translate(${TP[k][0]} ${TP[k][1]})"><circle class="rn-halo" r="26"/><circle class="tsp-c" r="17" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="3"/><text y="6" text-anchor="middle" style="font:900 16px var(--sans);fill:var(--text-dim)">${k}</text></g>`).join("")}`;
        stage.appendChild(svg);
        return { svg, lines: svg.querySelector(".tsp-lines") };
      },
      frames: tspFrames,
      draw(g, f) {
        const D = f.D, seg = (a, b, col, wd = 3.5, dash = "", off = 0) => { const [x1, y1] = TP[a], [x2, y2] = TP[b], L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (-(y2 - y1) / L) * off, ny = ((x2 - x1) / L) * off;
          return `<line x1="${x1 + nx}" y1="${y1 + ny}" x2="${x2 + nx}" y2="${y2 + ny}" stroke="${col}" stroke-width="${wd}" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`; };
        let s = "";
        if (f.stage === "opt") for (let i = 0; i < D.optTour.length; i++) s += seg(D.optTour[i], D.optTour[(i + 1) % D.optTour.length], "var(--violet)", 3, "7 6");
        if (f.stage === "mst" || f.stage === "walk") D.ed.forEach(([a, b, w]) => { if (f.stage === "mst") s += seg(a, b, "var(--teal)", 4); else s += seg(a, b, "var(--teal)", 3, "", 3.2) + seg(a, b, "var(--teal)", 3, "", -3.2); });
        else if (f.stage !== "pts") D.ed.forEach(([a, b]) => (s += seg(a, b, "var(--line)", 2.5)));
        if (f.stage === "mst") D.ed.forEach(([a, b, w]) => { const mx = (TP[a][0] + TP[b][0]) / 2, my = (TP[a][1] + TP[b][1]) / 2; s += `<g><rect x="${mx - 16}" y="${my - 11}" width="32" height="21" rx="7" fill="var(--panel)" stroke="var(--teal)" stroke-width="2"/><text x="${mx}" y="${my + 5}" text-anchor="middle" style="font:900 12px var(--sans);fill:var(--text)">${w.toFixed(1)}</text></g>`; });
        const t = f.tour;
        for (let i = 1; i < t.length; i++) s += seg(t[i - 1], t[i], i === t.length - 1 && f.stage === "tour" ? "var(--amber)" : "var(--blue)", i === t.length - 1 && f.stage === "tour" ? 5 : 4);
        g.lines.innerHTML = s;
        g.svg.querySelectorAll(".tsp-city").forEach((c) => {
          const k = c.dataset.k, vis = t.includes(k), cur = f.stage === "tour" && t[t.length - 1] === k;
          const ci = c.querySelector(".tsp-c");
          ci.setAttribute("fill", cur ? "var(--amber)" : vis ? "var(--blue)" : "var(--panel-2)");
          ci.setAttribute("stroke", cur ? "var(--amber-lip)" : vis ? "var(--blue-edge)" : "var(--line-2)");
          c.querySelector("text").style.fill = vis ? (cur ? "var(--amber-on)" : "var(--blue-on)") : "var(--text-dim)";
        });
      },
    });
  }
  // prettier-ignore
  L["a4-tsp"] = {
    sum: "The travelling-salesman problem is NP-complete, so we settle for a good-enough tour. Build an MST, walk round it twice, shortcut the repeats, and the tour is guaranteed to be less than twice as long as the best possible.",
    steps: [
      { t: "The travelling-salesman problem", b: `<p><b>Input:</b> a weighted graph $(V, E, w)$.<br><b>Output:</b> a <b>circuit</b> $C$: a subgraph that is a cycle through <b>all</b> vertices.<br><b>Relation:</b> $C$ is the <b>shortest</b> such circuit.</p><p>TSP is <b>NP-complete</b>: no feasible exact algorithm is known. So we look for heuristics that deliver “good enough” tours, and ideally a guarantee about how far off they can be.</p>`,
        v: F.flow(["Weighted graph (V, E, w)", { t: "TSP solver", c: "violet" }, { t: "Shortest circuit", s: "visits every vertex once", c: "teal" }]),
        c: { q: "What is the difference between a circuit (TSP) and a spanning tree?", o: ["A circuit is a cycle through all vertices; a tree has none", "A circuit always has fewer edges than a spanning tree has", "A spanning tree must return to the vertex where it started"], a: 0, why: "A circuit uses n edges and returns to the start. A spanning tree uses n − 1 edges and has no cycle at all." } },
      { t: "Idea: walk round the tree twice", b: `<p>An MST already connects every town cheaply. Walk <b>round the whole tree</b>: go down every edge and back up again. The walk visits every vertex and uses each tree edge exactly twice, so its length is <b>exactly $2 \\times$ the MST weight</b>.</p><p>It is not yet a tour: it revisits towns on the way back.</p>`,
        v: F.cells(["A", "B", "A", "C", "D", "E", "D", "F", "G", "F", "D", "C", "A"].map((v, i, a) => ({ v, c: a.indexOf(v) === i ? "teal" : "dim" })), { label: "the walk" }),
        c: { q: "An MST has total weight 25. How long is the walk that goes down and back along every tree edge?", o: ["25", "50", "75"], a: 1, why: "Every edge is walked twice, so the length is 2 × 25 = 50." } },
      { t: "Shortcut the repeats", b: `<p>Go through the walk and <b>skip any town you have already visited</b>, heading straight to the next new one. The result visits each town exactly once: a proper tour, ending with a return to the start.</p><p>With straight-line distances, a direct leg is never longer than the detour it replaces (the <b>triangle inequality</b>), so shortcuts only help: the tour is at most the walk's length.</p>`,
        v: F.cells("ABCDEFGA".split("").map((v) => ({ v, c: "blue" })), { label: "the tour" }),
        c: { q: "Why can skipping a repeated town never make the tour longer (straight-line distances)?", o: ["A direct line is never longer than the long way round", "Skipped towns are always the least important ones to visit", "The tour is rebuilt from the longest edges of the walk"], a: 0, why: "Going from A straight to C is no longer than A → B → C. That is the triangle inequality, so each shortcut keeps or reduces the length." } },
      { t: "The guarantee: less than twice the best", b: `<p><b>Why 2×?</b> Take the best possible circuit and <b>remove any one edge</b>: what is left is a spanning tree. So the MST weight is no more than the best circuit's weight: $W_{MST} \\le OPT$.</p><p>Our walk has length exactly $2 W_{MST}$, and shortcuts cannot lengthen it. So $\\text{tour} \\le 2 W_{MST} \\le 2 \\cdot OPT$: <b>never more than twice the best.</b></p>`,
        v: F.bars([["MST weight W", 30, "teal"], ["best circuit OPT ≥ W", 41, "violet"], ["our tour ≤ 2W", 52, "blue"], ["bound 2W", 60, "dim"]], { max: 60 }) + `<div class="fig-cap">An example with W = 30: OPT ≥ 30 and tour ≤ 60.</div>`,
        c: { q: "The MST of a network weighs 40. What can you say for certain about the best possible circuit?", o: ["It weighs at least 40", "It weighs at most 40", "It weighs exactly 80"], a: 0, why: "Remove one edge from the best circuit and you get a spanning tree, which weighs at least as much as the MST (40). So the best circuit is at least 40." } },
      { t: "Watch it run", b: `<p>Seven towns. The runner builds the MST, walks round it, takes shortcuts and finally compares with the true best tour found by trying every order.</p><p>It will ask you which town comes next after a shortcut. Tap a town to answer.</p>`,
        v: (box, life) => tspRun(box, life) },
      { t: "What the bound does and does not say", b: `<p>The guarantee is a <b>worst case</b>. In practice the tour is usually much better than twice the best. It is not the best tour, though: the demo's tour is about a quarter longer than the optimum.</p><p>It needs the triangle inequality for the shortcut step (true for ordinary distances). And it is only a <b>heuristic</b>: for the exact answer we would still face the NP-complete problem.</p>`,
        v: F.compare({ title: "Guaranteed", c: "teal", body: "tour ≤ 2 × MST, so tour &lt; 2 × best circuit, found in $O(|E| \\log |V|)$ time" }, { title: "Not guaranteed", c: "rose", body: "that the tour is the <b>shortest</b> circuit, or even close to it" }),
        c: { q: "Your heuristic tour is 90 and the MST is 50. What is the best you can conclude about the shortest circuit?", o: ["At least 50 and at most 90", "Exactly 90, as that is our tour", "At most 50, like the tree"], a: 0, why: "The best circuit is at least the MST (50) and at most any tour you have found (90)." } },
    ],
    guide: ["Step through the run: MST, then the doubled walk, then the tour.", "Answer the shortcut questions by tapping the town the tour visits next.", "Read the last two captions: the tour sits between the best circuit and 2 × MST.", "Answer the questions after the demo."],
  };
  // prettier-ignore
  N.register({
    id: "a4-tsp", subject: "algo", lecture: 4, order: 9, num: "4.9",
    title: "From an MST to a tour (TSP)",
    blurb: "Double the tree, shortcut the repeats, and get a round trip under twice the best.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const card = el(`<div class="card"><div class="card-head"><h3>MST to tour</h3><span class="faint">seven towns, straight-line distances</span></div><div id="box"></div></div>`);
      root.appendChild(card);
      tspRun(qs("#box", card), life);
      root.appendChild(predict({ id: "a4-tsp-1", q: "In the demo the doubled walk is 151.4 and the shortcut tour is 124.8. Why is the tour shorter?", opts: ["Skipping repeated towns swaps detours for direct legs", "The tour leaves out some of the towns in the walk", "The MST was recomputed using lighter edges this time"], a: 0,
        why: "The walk revisits towns on its way back up the tree. Each skip replaces a detour with a straight line, which is never longer." }));
      root.appendChild(predict({ id: "a4-tsp-2", q: "An MST has weight 36 and the best circuit has weight 50. The doubled-tree tour is guaranteed to be at most…", opts: ["72, which is 2 × the MST", "100, which is 2 × the best", "86, which is the two weights added"], a: 0,
        why: "The tour is at most the walk, which is 2 × 36 = 72. That is also below 2 × 50 = 100. The tightest guarantee is 72." }));
      root.appendChild(takeaways([
        "TSP is <b>NP-complete</b>; we use a heuristic with a guarantee.",
        "MST → walk round it twice (length <b>2W</b>) → shortcut repeats → a tour of length at most <b>2W</b>.",
        "Because the best circuit is at least W, the tour is <b>less than twice</b> the best possible.",
      ], "Double the tree, skip repeats, pay at most twice."));
    },
  });
})();

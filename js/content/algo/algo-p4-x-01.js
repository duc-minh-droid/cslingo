/* algo-p4-x-01: Phase 4 coverage pass: shared MST scene helpers, 4.1 spanning trees. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const px = (NIC.shared.algoP4x = NIC.shared.algoP4x || {});

  /* ---------- the eight-town network used by the Prim and Kruskal modules (distinct weights) ---------- */
  // prettier-ignore
  const POS = { A: [40, 140], B: [130, 50], C: [120, 235], D: [230, 140], E: [255, 40], F: [330, 255], G: [405, 120], H: [445, 235] };
  // prettier-ignore
  const EDG = [["A", "B", 8], ["A", "C", 5], ["B", "C", 11], ["B", "D", 6], ["C", "D", 9], ["C", "F", 14], ["D", "E", 3], ["D", "G", 12], ["E", "G", 7], ["F", "G", 10], ["F", "H", 4], ["G", "H", 13], ["B", "E", 15]];
  // MST = D-E 3, F-H 4, A-C 5, B-D 6, E-G 7, A-B 8, F-G 10 = 43
  // prettier-ignore
  const NAMES = Object.keys(POS);
  // prettier-ignore
  const K = (a, b) => [a, b].sort().join("-");
  // prettier-ignore
  const nice = (k) => k.replace("-", "–");
  // prettier-ignore
  const wOf = (W, a, b) => { const e = W.find((x) => (x[0] === a && x[1] === b) || (x[0] === b && x[1] === a)); return e ? e[2] : Infinity; };
  // prettier-ignore
  const sumK = (W, keys) => W.filter(([a, b]) => keys.includes(K(a, b))).reduce((s, e) => s + e[2], 0);
  // prettier-ignore
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

  /* ---------- shared runner scene: graph with editable weights and pickable edges (data-k "A-B") ---------- */
  // prettier-ignore
  function mstScene(stage, api, W, kind) {
    const g = F.graphScene(stage, { nodes: POS, edges: W, w: 480, h: 290, editable: true });
    g.svg.classList.add("rn-mst", "rn-mst-" + kind);
    W.forEach((e) => {
      const h = g.edge(e[0], e[1]);
      h.g.dataset.k = g.key(e[0], e[1]);
      const hit = h.g.querySelector(".rn-base").cloneNode(); hit.setAttribute("class", "rn-hit"); hit.removeAttribute("marker-end");
      h.g.insertBefore(hit, h.g.firstChild);
      api.edit(h.wbox, { get: () => e[2], set: (v) => { e[2] = v; h.wt.textContent = v; h.wt.dataset.v = v; }, min: 1, max: 20 });
    });
    return g;
  }
  // prettier-ignore
  function mstDraw(g, W, f, c) {
    NAMES.forEach((n) => {
      const h = g.node(n);
      const st = f.bad && f.bad.includes(n) ? "s-bad" : f.newNode === n ? "s-cur" : f.inTree.includes(n) ? "s-done" : f.tent && f.tent.includes(n) ? "s-tent" : "";
      h.g.setAttribute("class", `rn-node ${st}`);
      if (f.tags) F.rn.text(c, h.tag, f.tags[n] || "");
      h.tagBox.style.opacity = f.tags && f.tags[n] ? 1 : 0;
      if (f.newNode === n && (!c.prev || c.prev.newNode !== n)) F.rn.pulse(c, h.body);
    });
    W.forEach(([a, b]) => {
      const k = g.key(a, b), h = g.edge(a, b), tree = f.tree.includes(k);
      h.g.classList.toggle("try", f.cands.includes(k) || (f.edge === k && !tree));
      h.g.classList.toggle("reject", f.rejected.includes(k));
      h.g.classList.toggle("rn-todo", !tree && !f.rejected.includes(k) && !f.done);
      h.hot.classList.toggle("amber", f.edge === k && tree);
      F.rn.stroke(c, h.hot, tree);
      if (f.edge === k && (!c.prev || c.prev.edge !== k)) F.rn.pulse(c, h.wbox);
    });
  }
  /* small five-town graph for the vocabulary lesson */
  // prettier-ignore
  const P5 = { P: [40, 120], Q: [140, 40], R: [150, 200], S: [290, 60], T: [330, 190] };
  // prettier-ignore
  const E5 = [["P", "Q", 4], ["P", "R", 7], ["Q", "R", 3], ["Q", "S", 8], ["R", "S", 5], ["R", "T", 9], ["S", "T", 2]];
  // spanning trees: {ST 2, QR 3, PQ 4, RS 5} = 14 (the MST); {PR 7, QR 3, QS 8, ST 2} = 20; {PQ 4, PR 7, RS 5, RT 9} = 25
  // prettier-ignore
  const mini = (hl) => F.graph({ nodes: P5, edges: E5, hl, w: 380, h: 240, maxH: 150, r: 17 });

  /* ============ 4.1 Spanning trees: the problem ============ */
  // prettier-ignore
  L["a4-intro"] = {
    sum: "Connect every town with the least cable. The answer is always a <b>tree</b>: a connected, loop-free set of n − 1 edges. A <b>minimum spanning tree</b> is the cheapest one, and there are far too many trees to try them all.",
    steps: [
      { t: "The problem: link every town cheaply", b: `<p>A power company must wire up five towns. Each possible cable route has a cost. Every town has to be reachable, <b>directly or through other towns</b>, and the company wants the total cost as small as possible.</p><p>The same shape turns up for rail links, water pipes and road networks: the lecture opens with High Speed 2 as a real-world minimum network.</p>`,
        v: F.graph({ nodes: P5, edges: E5, w: 380, h: 240, maxH: 200, r: 17 }) + `<div class="fig-cap">Five towns, seven possible cable routes, each with a cost.</div>` },
      { t: "Vocabulary: graph, path, cycle, tree", b: `<p>A <b>graph</b> is a set of <b>vertices</b> V and a set of <b>edges</b> E, each edge joining two vertices. A <b>weighted graph</b> adds a weight function $w: E \\to \\mathbb{R}^+$ that gives every edge a positive cost.</p><p>A <b>path</b> is a sequence of vertices with an edge between each consecutive pair. A <b>cycle</b> is a path that comes back to its start. A <b>tree</b> is a graph with <b>no cycles</b>.</p>`,
        v: F.frames([
          { t: "Path P–Q–S", v: F.graph({ nodes: P5, edges: E5, hl: { "P-Q": "blue", "Q-S": "blue" }, w: 380, h: 240, maxH: 120, r: 17 }) },
          { t: "Cycle Q–R–S–Q", v: F.graph({ nodes: P5, edges: E5, hl: { "Q-R": "rose", "R-S": "rose", "Q-S": "rose" }, w: 380, h: 240, maxH: 120, r: 17 }) },
          { t: "A tree: no cycle", v: F.graph({ nodes: P5, edges: E5, hl: { "P-Q": "teal", "Q-R": "teal", "R-S": "teal", "S-T": "teal" }, w: 380, h: 240, maxH: 120, r: 17 }) },
        ]),
        c: { q: "Which of these is a cycle?", o: ["A route that visits a series of towns and ends somewhere new", "A route that ends back at the town it began from", "Any set of edges that touches every vertex"], a: 1, why: "A cycle is a path that returns to its starting point, so one of its edges is always redundant for connecting its own towns." } },
      { t: "What makes a spanning tree", b: `<p>A <b>spanning tree</b> of $G = (V, E)$ is a tree $(V', E')$ with $V' = V$ and $E' \\subseteq E$. It uses <b>every vertex</b> and keeps just enough edges to connect them: it is a <b>maximal cycle-free subgraph</b>.</p><p>With n vertices it always has exactly <b>n − 1 edges</b>. Fewer and something is cut off; one more and a loop appears.</p>`,
        v: F.compare({ title: "Spanning tree", c: "teal", body: "all 5 towns, <b>4 edges</b>, no cycle, everything reachable" }, { title: "Not one", c: "rose", body: "5 edges is a cycle in disguise; 3 edges leaves a town stranded" }),
        c: { q: "A connected network has 9 towns. How many cables does a spanning tree of it contain?", o: ["9", "8", "It depends on the costs"], a: 1, why: "n − 1 = 8, whatever the weights. The costs decide <i>which</i> 8, not how many." } },
      { t: "Many trees, one cheapest", b: `<p>The same five towns have many spanning trees, and their total costs differ. Three of them are shown. The one we want, the <b>minimum spanning tree</b>, has the smallest total weight $\\sum_{e \\in E'} w(e)$.</p><p>There are far too many trees to list for a big network, so we need a rule that builds the cheapest one directly.</p>`,
        v: F.frames([
          { t: "Total 20", v: mini({ "P-R": "amber", "Q-R": "amber", "Q-S": "amber", "S-T": "amber" }) },
          { t: "Total 25", v: mini({ "P-Q": "amber", "P-R": "amber", "R-S": "amber", "R-T": "amber" }) },
          { t: "Total 14: the minimum", v: mini({ "S-T": "teal", "Q-R": "teal", "P-Q": "teal", "R-S": "teal" }) },
        ]),
        c: { q: "Two spanning trees of the same network cost 20 and 14. What do they have in common?", o: ["The same edges, listed in a different order", "The same number of edges", "The same total weight"], a: 1, why: "Every spanning tree of n towns has n − 1 edges. Only the choice of edges, and so the cost, changes." } },
      { t: "The task, as a specification", b: `<p><b>Input:</b> a weighted graph $(V, E, w)$.<br><b>Output:</b> a tree $(V, E')$ made of edges of the graph.<br><b>Input-output relation:</b> $\\sum_{e \\in E'} w(e)$ is as small as possible.</p><p>Note what is <i>not</i> promised: nothing says the route between two particular towns is short. An MST minimises the cost of the <b>whole network</b>.</p>`,
        v: F.flow(["Weighted graph (V, E, w)", { t: "MST algorithm", c: "violet" }, { t: "Tree (V, E′)", s: "total weight as small as possible", c: "teal" }]),
        c: { q: "What does a minimum spanning tree minimise?", o: ["The total weight of all the edges it uses", "The distance between each pair of towns", "The number of edges it uses"], a: 0, why: "Every spanning tree has the same number of edges, and pairwise distances are the shortest-path problem, which is a different task." } },
      { t: "Where it came from", b: `<p>The problem goes back to the Czech mathematician <b>Otakar Borůvka</b> (1899–1995). He was designing an efficient electricity network for towns in Moravia, wrote the problem down mathematically and found the first known algorithm, published in 1926.</p><p>Many algorithms have been proposed since. This phase studies two: <b>Prim</b>, which grows one tree, and <b>Kruskal</b>, which merges a forest.</p>`,
        v: F.flow([{ t: "1926", s: "Borůvka: power grid", c: "amber" }, { t: "Since then", s: "many algorithms", c: "dim" }, { t: "Here", s: "Prim and Kruskal", c: "teal" }]) },
    ],
    guide: ["Tap edges to build a spanning tree of the eight-town network.", "Try to add an edge that closes a loop, and see why it is refused.", "Once you have 7 edges, see if your tree is the cheapest. Swap a heavy edge for a lighter one.", "Answer the questions after the demo."],
  };
  // prettier-ignore
  N.register({
    id: "a4-intro", subject: "algo", lecture: 4, order: 1, num: "4.1",
    title: "Spanning trees: the problem",
    blurb: "Vocabulary, what a spanning tree is, and why we want the cheapest one. Build one yourself.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const chosen = new Set(), OPT = 43, need = NAMES.length - 1;
      const card = el(`<div class="card"><div class="card-head"><h3>Build a spanning tree</h3><span class="faint">tap an edge to add it or take it away</span><span style="flex:1"></span><button class="btn small ghost" id="clr">Clear</button></div>
        <div class="fig-wrap" id="svg"></div><div class="mono dim" id="st" style="margin-top:8px;min-height:24px"></div><div class="callout" id="fb" style="min-height:64px"></div></div>`);
      root.appendChild(card);
      const linked = (a, b) => { const seen = new Set([a]), q = [a]; while (q.length) { const x = q.pop(); [...chosen].forEach((k) => { const [u, v] = k.split("-"); const o = u === x ? v : v === x ? u : null; if (o && !seen.has(o)) { seen.add(o); q.push(o); } }); } return seen.has(b); };
      const pieces = () => { const seen = new Set(); let n = 0; NAMES.forEach((v) => { if (!seen.has(v)) { n++; NAMES.forEach((u) => { if (linked(v, u)) seen.add(u); }); } }); return n; };
      const total = () => sumK(EDG, [...chosen]);
      function say(cls, html) { const fb = qs("#fb", card); fb.className = "callout " + cls; fb.innerHTML = html; }
      function draw(msg) {
        const hl = {}; chosen.forEach((k) => (hl[k] = "teal"));
        qs("#svg", card).innerHTML = F.graph({ nodes: POS, edges: EDG, hl, w: 480, h: 290 });
        const s = qs("#svg svg", card);
        qsa(".draw, .fi", s).forEach((d) => d.classList.remove("draw", "fi"));
        EDG.forEach(([a, b]) => { const [x1, y1] = POS[a], [x2, y2] = POS[b]; s.insertAdjacentHTML("beforeend", `<circle cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" r="19" fill="transparent" style="cursor:pointer" data-e="${K(a, b)}"><title>${a}–${b}</title></circle>`); });
        qsa("[data-e]", s).forEach((h) => h.addEventListener("click", () => toggle(h.dataset.e)));
        qs("#st", card).innerHTML = `<b>${chosen.size}</b> of ${need} edges · <b>${pieces()}</b> separate ${pieces() === 1 ? "piece" : "pieces"} · total weight <b>${total()}</b>`;
        if (msg) { say(msg[0], msg[1]); return; }
        if (chosen.size === need) {
          if (total() === OPT) { say("teal", `<b>A minimum spanning tree.</b> Total ${total()}: no other spanning tree of this network is cheaper.`); N.fx.celebrate(qs("#fb", card)); }
          else say("amber", `<b>A spanning tree, but not the cheapest.</b> All 8 towns are linked with 7 edges and no loop. Remove one heavy edge and add a lighter one that reconnects the two pieces.`);
        } else say("blue", chosen.size === 0 ? `Pick edges until all 8 towns are connected. A spanning tree needs exactly <b>${need}</b> of them.` : `Keep going: ${pieces() === 1 ? "everything is connected" : `${pieces()} pieces still to join`}.`);
      }
      function toggle(k) {
        const [a, b] = k.split("-");
        if (chosen.has(k)) { chosen.delete(k); draw(); return; }
        if (linked(a, b)) { draw(["rose", `<b>${a}–${b} would close a loop.</b> ${a} and ${b} are already connected through the edges you chose, so this cable would be redundant.`]); N.fx.shake(qs("#fb", card)); return; }
        chosen.add(k); draw();
      }
      qs("#clr", card).onclick = () => { chosen.clear(); draw(); };
      draw();
      root.appendChild(predict({ id: "a4-intro-1", q: "A connected network has 12 towns. You pick a spanning tree and then add one extra cable from the network. What happens?", opts: ["Nothing changes: the tree is still a tree", "Exactly one cycle appears", "The network splits into two pieces"], a: 1,
        why: "The two ends of the new cable were already joined through the tree, so the new edge closes exactly one loop. Removing any edge of that loop gives a spanning tree again." }));
      root.appendChild(predict({ id: "a4-intro-2", q: "Your friend says: \"My spanning tree uses 6 edges to link 8 towns, and it costs less than yours.\" What is wrong?", opts: ["6 edges cannot connect 8 towns, so it is not a spanning tree", "Nothing: fewer edges is always cheaper and allowed", "It must be wrong because trees need an even number of edges"], a: 0,
        why: "A tree on 8 vertices needs 7 edges. With 6, at least one town is cut off, so the tree does not span." }));
      root.appendChild(takeaways([
        "A <b>spanning tree</b> touches every vertex, has no cycle and has exactly <b>n − 1</b> edges.",
        "A <b>minimum spanning tree</b> is the spanning tree whose total weight is smallest.",
        "It minimises the cost of the whole network, not any one journey across it.",
      ], "Connect everything, loop nothing, pay least."));
    },
  });
  Object.assign(px, { POS, EDG, NAMES, K, nice, wOf, sumK, plural, mstScene, mstDraw });
})();

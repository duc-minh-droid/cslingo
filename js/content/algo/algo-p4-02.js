(function () {
  const partScope = (NIC.shared.algoP4 = NIC.shared.algoP4 || {});
  const { EDGES, NAMES, ek, kruskalEvents, mstDraw, mstScene, nice, nodes, primEvents, primRun, sumW } = partScope;
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  /** Kruskal: sorted edges, one frame per accept or reject. Weights are editable. */
  function kruskalRun(box, life) {
    const W = EDGES.map((e) => e.slice());
    function* frames() {
      const comp = Object.fromEntries(NAMES.map((n) => [n, n]));
      const find = (x) => (comp[x] === x ? x : (comp[x] = find(comp[x])));
      const label = () => {
        const m = {};
        NAMES.forEach((n) => {
          const r = find(n);
          m[r] = m[r] || n;
        });
        return Object.fromEntries(NAMES.map((n) => [n, m[find(n)]]));
      };
      const sorted = W.slice().sort((x, y) => x[2] - y[2]),
        tree = [],
        rejected = [];
      const touched = () => NAMES.filter((n) => tree.some((k) => k.split("-").includes(n)));
      const snap = (x) => ({
        inTree: touched(),
        tree: tree.slice(),
        rejected: rejected.slice(),
        cands: [],
        tags: label(),
        ...x,
      });
      // plan the decisions first so a reject can ask about the next edge that is actually added
      const plan = [];
      {
        const c2 = { ...comp },
          f2 = (x) => (c2[x] === x ? x : (c2[x] = f2(c2[x])));
        sorted.forEach(([a, b]) => {
          const ok = f2(a) !== f2(b);
          if (ok) c2[f2(a)] = f2(b);
          plan.push(ok);
        });
      }
      const accIdx = plan.map((ok, i) => (ok ? i : -1)).filter((i) => i >= 0);
      const rejAsk = plan.findIndex((ok, i) => !ok && accIdx.some((j) => j > i));
      const askAt = new Set([accIdx[1], rejAsk >= 0 ? rejAsk : accIdx[3]].filter((i) => i !== undefined));
      yield snap({
        line: 0,
        cap: `Sort every edge by weight: ${sorted.map(([a, b, w]) => `${a}${b} ${w}`).join(" · ")}. Each node starts in its own group (the letter above it).`,
      });
      for (let i = 0; i < sorted.length; i++) {
        const [a, b, w] = sorted[i],
          k = ek(...[a, b].sort()),
          ok = find(a) !== find(b);
        let ask = null;
        if (askAt.has(i)) {
          const j = accIdx.find((x) => x >= i),
            [na, nb, nw] = sorted[j],
            nk = ek(...[na, nb].sort());
          // ties: any unused edge of the same weight whose ends are in different groups right now
          const ties = sorted
            .slice(i)
            .filter(([x, y, ww]) => ww === nw && find(x) !== find(y))
            .map(([x, y]) => ek(...[x, y].sort()));
          ask = {
            q: "Which edge is added next? Tap it.",
            pick: ".rn-edge.rn-todo",
            a: ties.length ? ties : [nk],
            why: ok
              ? `It's the cheapest edge left, and its ends are in different groups: <b>${nice(nk)} (${nw})</b>.`
              : `${nice(k)} (${w}) is next in the list, but its ends are already connected, so it's skipped. The next edge added is <b>${nice(nk)} (${nw})</b>.`,
          };
        }
        if (ok) {
          comp[find(a)] = find(b);
          tree.push(k);
        } else rejected.push(k);
        const full = tree.length === NAMES.length - 1;
        yield snap({
          edge: k,
          ask,
          line: ok ? 2 : 3,
          mood: ok ? "happy" : "surprised",
          cap: ok
            ? `Next: <b>${nice(k)} (${w})</b>. ${a} and ${b} are in different groups, so take it and merge them. Total <b>${sumW(W, tree)}</b>${full ? `. That's ${tree.length} edges: a spanning tree` : ""}.`
            : `Next: <b>${nice(k)} (${w})</b>. ${a} and ${b} are already in the same group, so <b>reject</b> it: it would close a loop.`,
        });
      }
      yield snap({
        done: true,
        line: 1,
        mood: "love",
        cap: `List finished. The tree has <b>${tree.length}</b> edges, total weight <b>${sumW(W, tree)}</b>, and <b>${rejected.length}</b> edge${rejected.length === 1 ? " was" : "s were"} rejected.`,
      });
    }
    F.run(box, life, {
      code: [
        "sort all edges by weight",
        "for each edge (u, v) in that order:",
        "  if u, v in different groups: take it, merge groups",
        "  else: reject it (it would close a loop)",
      ],
      build: (stage, api) => mstScene(stage, api, W, "kruskal"),
      draw: (g, f, c) => mstDraw(g, W, f, c),
      frames,
    });
  }

  L["a4-mst"] = {
    sum: "Two greedy algorithms, same answer. <b>Prim</b> grows one tree outward from a starting node. <b>Kruskal</b> takes edges cheapest-first from anywhere, merging little trees and skipping any edge that would make a loop.",
    steps: [
      {
        t: "Prim: grow one blob",
        b: `<p>Start anywhere, say A. Repeatedly add the <b>cheapest edge that connects the tree to a new node</b>. That's the cut property, with the cut being tree | everything else.</p>`,
        v: F.frames([
          {
            t: "Tree {A}: cheapest way out is A–C (3)",
            v: F.cells([{ v: "A", c: "teal" }, "→", { v: "C", c: "amber" }]),
          },
          {
            t: "Tree {A, C}: cheapest way out is C–B (2)",
            v: F.cells([{ v: "AC", c: "teal" }, "→", { v: "B", c: "amber" }]),
          },
          { t: "…until all 5 nodes are in: 4 edges total", v: F.cells([{ v: "ACBDE", c: "teal" }]) },
        ]),
      },
      {
        t: "Watch Prim run",
        b: `<p>Prim grows a tree from A. <b style="color:var(--amber-ink)">Orange</b> dashed edges cross from the tree to the rest; the cheapest one is added in <b style="color:var(--teal-ink)">green</b>.</p><p>It will ask you to pick the next edge. Tap a weight to change it and the run recomputes.</p>`,
        v: (box, life) => primRun(box, life),
      },
      {
        t: "Kruskal: cheapest edges first, skip loops",
        b: `<p>Sort <i>all</i> edges by weight. Walk down the list and take each edge <b>unless its two ends are already connected</b>. Early on you have a forest of small trees that gradually merge.</p><p>A <b>union-find</b> structure answers "already connected?" almost instantly.</p>`,
        v: F.cells([
          { v: "DE 1", c: "teal" },
          { v: "BC 2", c: "teal" },
          { v: "AC 3", c: "teal" },
          { v: "AB 4", sub: "loop ✗", c: "rose" },
          { v: "BD 5", c: "teal" },
          { v: "CD 6", sub: "loop ✗", c: "rose" },
          { v: "CE 7", sub: "loop ✗", c: "rose" },
        ]),
        c: {
          type: "cat",
          q: "Does each description fit <b>Prim</b> or <b>Kruskal</b>?",
          buckets: ["Prim", "Kruskal"],
          items: [
            ["Grows one connected tree from a start node", 0],
            ["Sorts all the edges by weight first", 1],
            ["Always adds the cheapest edge leaving the current tree", 0],
            ["Starts as a forest of small trees that gradually merge", 1],
          ],
          hint: "One of them keeps a single tree the whole time. The other sorts the edges and joins separate pieces.",
          why: "Both reach the same optimum, because both use the cut property. The difference is the intermediate structure: Prim grows one connected tree, while Kruskal sorts the edges and merges a forest.",
        },
      },
      {
        t: "Watch Kruskal run",
        b: `<p>Kruskal walks the sorted list. The letter above each node is its group. An edge joining two groups is taken in <b style="color:var(--teal-ink)">green</b>; one inside a group is <b style="color:var(--rose-ink)">rejected</b>.</p><p>It will ask you to pick the next edge added. Tap a weight to change it.</p>`,
        v: (box, life) => kruskalRun(box, life),
      },
      {
        t: "Edge cases worth knowing",
        b: `<p><b>Ties:</b> either choice is fine. Several different MSTs can have the same total.<br><b>Disconnected graph:</b> no spanning tree exists. Kruskal ends with a <i>spanning forest</i> of fewer than n − 1 edges.<br><b>Which is faster?</b> Prim with a heap suits dense graphs. Kruskal's sort dominates, O(m log m), which suits sparse graphs.</p>`,
        c: {
          q: "The graph is disconnected. What does Kruskal do?",
          o: [
            "It stops with an error about connectivity",
            "It produces a spanning forest",
            "It adds zero-weight edges to join the parts",
          ],
          a: 1,
          why: "It can't merge components that have no edges between them. Honest output: a forest.",
        },
      },
    ],
    guide: [
      "Press <b>Prim ▸</b> a few times. The orange edges are the candidates leaving the tree; the cheapest one is taken.",
      "Press <b>Kruskal ▸</b>. Red flashes are rejected edges (they'd close a loop).",
      "Both finish at total weight 11. Same tree, different route there.",
    ],
  };

  N.register({
    id: "a4-mst",
    subject: "algo",
    lecture: 4,
    order: 2,
    num: "4.2",
    title: "Prim vs Kruskal, side by side",
    blurb:
      "Same graph, two greedy strategies. One grows a tree, the other merges a forest, and both land on the same MST.",
    render(root) {
      root.appendChild(header(this, ""));
      const PE = primEvents(),
        KE = kruskalEvents();
      let pi = 0,
        ki = 0;
      const card = el(`<div class="card"><div class="grid two">
        <div><div class="card-head"><span class="tag teal">Prim</span><span class="faint">one tree, grown from A</span><span style="flex:1"></span><button class="btn small primary" id="ps">Prim ▸</button></div><div class="fig-wrap" id="psvg"></div><div class="mono dim" id="plog" style="margin-top:8px;min-height:40px"></div></div>
        <div><div class="card-head"><span class="tag violet">Kruskal</span><span class="faint">cheapest edges first</span><span style="flex:1"></span><button class="btn small" id="ks">Kruskal ▸</button></div><div class="fig-wrap" id="ksvg"></div><div class="mono dim" id="klog" style="margin-top:8px;min-height:40px"></div></div>
        </div><div class="controls"><button class="btn ghost small" id="rs">Reset both</button></div></div>`);
      root.appendChild(card);
      const total = (es) => es.reduce((s, e) => s + e[2], 0);
      function draw() {
        const pTaken = PE.slice(0, pi).map((x) => x.e),
          phl = {};
        pTaken.forEach(([a, b]) => (phl[ek(a, b)] = "teal"));
        const inTree = new Set(["A", ...pTaken.flat().filter((x) => typeof x === "string")]);
        if (pi < PE.length)
          PE[pi].cands.forEach((k) => {
            if (!phl[k]) phl[k] = "amber";
          });
        qs("#psvg", card).innerHTML = F.graph({
          nodes: nodes({}, (k) => (inTree.has(k) ? "teal" : null)),
          edges: EDGES,
          hl: phl,
          w: 480,
          h: 270,
        });
        qs("#plog", card).innerHTML =
          pi === 0
            ? "Tree = {A}. Amber = edges leaving the tree."
            : `took ${PE[pi - 1].e[0]}–${PE[pi - 1].e[1]} (${PE[pi - 1].e[2]}) · total ${total(pTaken)}${pi === PE.length ? ` <b style="color:var(--teal-ink)">✓ MST = 11</b>` : ""}`;
        const kSeen = KE.slice(0, ki),
          khl = {};
        kSeen.forEach(({ e: [a, b], ok }, i) => {
          if (ok) khl[ek(a, b)] = "teal";
          else if (i === ki - 1) khl[ek(a, b)] = "rose";
        });
        const kTaken = kSeen.filter((x) => x.ok).map((x) => x.e);
        const last = kSeen[ki - 1];
        qs("#ksvg", card).innerHTML = F.graph({ nodes: nodes(), edges: EDGES, hl: khl, w: 480, h: 270 });
        qs("#klog", card).innerHTML =
          ki === 0
            ? "Sorted: DE1 · BC2 · AC3 · AB4 · BD5 · CD6 · CE7"
            : `${last.ok ? "took" : `<span style="color:var(--rose-ink)">rejected</span>`} ${last.e[0]}–${last.e[1]} (${last.e[2]})${last.ok ? "" : ": ends already connected"} · groups ${last.groups.join(" | ")} · total ${total(kTaken)}${kTaken.length === 4 ? ` <b style="color:var(--teal-ink)">✓ MST = 11</b>` : ""}`;
        qs("#ps", card).disabled = pi >= PE.length;
        qs("#ks", card).disabled = ki >= KE.length;
        [
          ["#psvg", pi],
          ["#ksvg", ki],
        ].forEach(([sel]) => {
          qsa(`${sel} .fi`, card).forEach((g) => g.classList.remove("fi"));
          qsa(`${sel} .draw`, card).forEach((d) => {
            if (!d.getAttribute("stroke").includes("rose")) d.classList.remove("draw");
          });
        });
      }
      qs("#ps", card).onclick = () => {
        if (pi < PE.length) {
          pi++;
          draw();
        }
      };
      qs("#ks", card).onclick = () => {
        if (ki < KE.length) {
          ki++;
          draw();
        }
      };
      qs("#rs", card).onclick = () => {
        pi = 0;
        ki = 0;
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a4-mst-1",
          q: "Kruskal has taken D–E (1), B–C (2) and A–C (3). Next in the list is A–B (4). What happens?",
          opts: [
            "Taken, because it's the cheapest edge left",
            "Rejected: A and B are already connected through C",
            "It depends on how ties were broken earlier",
          ],
          a: 1,
          why: "A–C–B already links A and B. Adding A–B would create the cycle A–B–C, so union-find says 'same component': skip.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Prim</b>: cheapest edge out of the current tree. O(m log n) with a heap.",
            "<b>Kruskal</b>: cheapest remaining edge that joins two different components. Union-find makes that check nearly free.",
            "Both are the cut property in action, so both are optimal. Choose by graph density and data structures.",
          ],
          "Same destination: one grows a tree, the other merges a forest.",
        ),
      );
    },
  });
})();

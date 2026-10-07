/* algo-p2-x-04: Phase 2 (lecture 2) — link-state, distance-vector and hierarchical routing. Ported from the vault; all numbers come from the code below. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const X = (NIC.shared.algoP2x = NIC.shared.algoP2x || {});
  const { reg, table, pseudo, INF, show, netDijkstra, NNODES, NP, NE0, netFig, treeHl, NT0 } = X;

  /* =====================================================================
     2.9  Link-state routing
     ===================================================================== */
  function lsRun(box, life) {
    const T = NT0.A,
      rows = T.rows;
    const ND = NNODES.filter((n) => n !== "A");
    function* frames() {
      yield {
        i: 0,
        rows,
        cap: `Start: N' = {A}. A's neighbours get their link cost as d, with parent A; every other router is <b>∞</b>.`,
        line: 0,
      };
      for (let i = 1; i < rows.length; i++) {
        const prev = rows[i - 1],
          cand = NNODES.filter((n) => !prev.Np.includes(n) && prev.d[n] < INF),
          m = Math.min(...cand.map((n) => prev.d[n])),
          ties = cand.filter((n) => prev.d[n] === m);
        const w = rows[i].w,
          changed = ND.filter((n) => rows[i].d[n] !== prev.d[n]);
        yield {
          i,
          rows,
          w,
          cap: `Add <b>${w}</b> to N' (smallest d = ${prev.d[w]}). ${changed.length ? `Update ${changed.map((n) => `d(${n}) = ${rows[i].d[n]} via ${rows[i].p[n]}`).join(", ")}.` : "No distance improves."}`,
          line: changed.length ? 4 : 2,
          ask:
            i <= 3
              ? {
                  q: "Which router does A add to N' next? Tap it.",
                  pick: ".rn-node.s-tent",
                  a: ties,
                  why: `The router outside N' with the smallest d is added: <b>${w}</b> at ${prev.d[w]}.`,
                }
              : null,
          mood: i === rows.length - 1 ? "love" : undefined,
        };
      }
    }
    F.run(box, life, {
      code: [
        "N' = {A}; d(v) = c(A,v) for neighbours, ∞ otherwise",
        "loop until every router is in N':",
        "  find w not in N' with the smallest d(w)",
        "  add w to N'",
        "  for each v not in N' next to w: d(v) = min(d(v), d(w) + c(w,v))",
      ],
      build(stage) {
        const g = F.graphScene(stage, { nodes: NP, edges: NE0, w: 470, h: 270 });
        const tb = document.createElement("div");
        tb.className = "rn-tbl";
        stage.appendChild(tb);
        return { ...g, tb };
      },
      draw(sc, f, c) {
        const r = f.rows[f.i];
        NNODES.forEach((n) => {
          const h = sc.node(n);
          h.g.setAttribute(
            "class",
            `rn-node ${n === f.w ? "s-cur" : r.Np.includes(n) ? "s-done" : r.d[n] < INF ? "s-tent" : ""}`,
          );
          F.rn.num(c, h.tag, r.d[n]);
          if (c.prev && c.prev.i !== undefined && f.rows[c.prev.i].d[n] !== r.d[n]) F.rn.pulse(c, h.tagBox);
        });
        NE0.forEach(([a, b]) => {
          const h = sc.edge(a, b);
          F.rn.stroke(c, h.hot, (r.p[b] === a && r.Np.includes(b)) || (r.p[a] === b && r.Np.includes(a)));
        });
        const head = ["step", "N'", ...ND.map((n) => `d(${n}), p(${n})`)];
        const body = f.rows.slice(0, f.i + 1).map((q, k) => ({
          c: [
            k,
            q.Np.join(""),
            ...ND.map((n) => (q.Np.includes(n) ? "·" : q.d[n] === INF ? "∞" : `${q.d[n]}, ${q.p[n]}`)),
          ],
          hl: k === f.i,
        }));
        sc.tb.innerHTML = table(head, body, 560);
      },
      frames,
    });
  }

  reg({
    id: "a2-linkstate",
    order: 9,
    num: "2.9",
    title: "Link-state routing",
    blurb:
      "Every router holds the whole map and runs Dijkstra. Change link costs and read off any router's forwarding table.",
    // prettier-ignore
    render(root) {
      root.appendChild(header(this, ""));
      let src = "A";
      const cost = { AD: 2, CE: 1, EF: 2, BC: 2 };
      const edges = () => NE0.map(([a, b, w]) => [a, b, cost[a + b] !== undefined ? cost[a + b] : w]);
      const card = el(`<div class="card"><div class="card-head"><h2>Routing table of one router</h2><span class="faint">every router runs the same Dijkstra on the same map</span></div>
        <div class="controls"><span class="faint">Router</span><span id="sa"></span></div>
        <div class="controls" id="sl"></div>
        <div class="grid side"><div id="fig"></div><div id="tbl"></div></div></div>`);
      root.appendChild(card);
      qs("#sa", card).appendChild(N.seg(NNODES.map((n) => [n, n]), src, (v) => { src = v; draw(); }));
      Object.keys(cost).forEach((k) => { const s = N.slider(`Link ${k[0]}–${k[1]}`, 1, 9, 1, cost[k]); s.onInput((v) => { cost[k] = v; draw(); }); qs("#sl", card).appendChild(s); });
      function draw() {
        const E = edges(), T = netDijkstra(src, E);
        qs("#fig", card).innerHTML = `<div class="fig-wrap">${netFig(E, { hl: treeHl(T, src), sub: Object.fromEntries(NNODES.map((n) => [n, T.d[n] === INF ? "∞" : T.d[n]])) })}</div>`;
        qsa("#fig line.draw", card).forEach((l) => l.classList.remove("draw"));
        qs("#tbl", card).innerHTML = `<div class="faint">Forwarding table of ${src} (green edges = shortest-path tree)</div>` + table(["destination", "cost", "forward to"], NNODES.filter((n) => n !== src).map((n) => [`<b>${n}</b>`, T.d[n] === INF ? "∞" : T.d[n], T.first[n] ? `link (${src},${T.first[n]})` : "–"]), 380);
      }
      draw();
      root.appendChild(predict({ id: "a2-ls-1", q: "Raise link A–D to 9 (router A selected). Which next hop does A now use to reach E?", opts: ["D, still: it is the neighbour closest to E", "B, going B → C → E instead", "C directly, the link A–C is cheapest"], a: 1,
        why: "With A–D = 9, the route A→B→C→E costs 3 + 2 + 1 = 6, beating A→D→E at 9 + 3 = 12 and A→C→E at 6 + 1 = 7. So the next hop is B." }));
      root.appendChild(predict({ id: "a2-ls-2", q: "Routers B and F, running Dijkstra on the same map, work out the cost between B and F. Do they agree?", opts: ["Yes: both use the same graph, so both get the same number", "No: each router has a private view of the costs", "Only if they are direct neighbours"], a: 0,
        why: "Link-state flooding gives every router an identical, complete map, so the shortest-path cost between B and F is the same from either end (undirected links)." }));
      root.appendChild(takeaways([
        "Routers flood <b>link-state packets</b> so everyone ends with the same complete map.",
        "Each router runs <b>Dijkstra</b> locally and gets its own shortest-path tree.",
        "The forwarding table keeps the <b>first hop</b> on each tree path, not the parent.",
        "Plain Dijkstra costs <b>O(|N|²)</b>; a heap does better.",
      ], "Share the map, then compute alone: the same answer everywhere."));
    },
  });

  L["a2-linkstate"] = {
    sum: "In link-state routing every router learns the whole network from flooded link-state packets, then runs Dijkstra itself. Because they all hold the same map, they agree on the shortest paths. The result is a shortest-path tree, from which the router keeps only the first hop for each destination.",
    // prettier-ignore
    steps: [
      { t: "Share the map by flooding", b: `<p>Each router measures its own links, packs the costs into a <b>link-state packet (LSP)</b> and <b>broadcasts</b> it to all other routers.</p><p>Once everyone has everyone's LSPs, every router holds an <b>identical, complete picture</b> of the network.</p>`,
        v: F.flow(["Measure own links", { t: "Flood the LSP", c: "violet" }, "Collect all LSPs", { t: "Run Dijkstra", c: "teal" }]),
        c: { q: "What does a router put in its link-state packet?", o: ["The costs of its own directly attached links", "Its complete routing table", "Its distance estimates to all other routers"], a: 0, why: "An LSP describes the sender's own links. The full picture is assembled from everyone's LSPs." } },
      { t: "Same map, same answer", b: `<p>Because every router runs the same algorithm on the same data, each one gets the same set of least-cost paths as every other router. No router has to trust a neighbour's arithmetic: they all do their own.</p><span class="key">This is a <b>global</b> algorithm: it needs the whole topology.</span>`,
        v: table(["", "Link state"], [["Information used", "whole map and all costs"], ["Computation", "each router, alone, with Dijkstra"], ["Messages", "LSPs flooded to everyone"]]),
        c: { q: "Two routers hold the same link-state map and run Dijkstra. What do they get?", o: ["Consistent least-cost paths", "Different paths, since they start from different sources", "Estimates that only match after many rounds"], a: 0, why: "Same input, deterministic algorithm. Different sources give different trees, but all consistent with one shared map." } },
      { t: "Dijkstra in the router's table form", b: `<p>The lecture writes Dijkstra with these symbols:</p><p><b>N'</b>: routers whose least-cost path is known.<br><b>d(v)</b>: cost of the best path found from the source to v.<br><b>p(v)</b>: the router just before v on that path.</p><p>Initialise: N' = {source}; d(v) = c(source, v) for neighbours, ∞ otherwise. Then repeat: add the router w ∉ N' with the smallest d(w), and set $d(v) \\leftarrow \\min(d(v),\\, d(w) + c(w, v))$ for its neighbours v ∉ N'.</p>`,
        v: pseudo(["N' ← {A}", "for all v: if v is adjacent to A: d(v) ← c(A, v), p(v) ← A  else d(v) ← ∞", "repeat until every router is in N':", "    find w ∉ N' with d(w) a minimum;  add w to N'", "    for each v ∉ N' next to w:  d(v) ← min(d(v), d(w) + c(w, v))"], [3, 4]),
        c: { q: "What does p(v) record?", o: ["The router just before v on the best known path", "The price of the cheapest link out of v", "The number of paths that reach v"], a: 0, why: "p(v) is the predecessor. Following p back from any router recovers the whole path." } },
      { t: "Watch the table fill", b: `<p>Here is router A's table on the six-router network, one row per router added to N'. Press play, or step through. It will ask which router joins N' next.</p>`,
        v: (box, life) => lsRun(box, life),
        c: { q: "In A's table, what is the final d(F)?", o: ["7", "9", "10"], a: 0, why: "The cheapest path is A → D → E → F = 2 + 3 + 2 = 7. The first estimate (via C) was 9 and gets replaced." } },
      { t: "From shortest-path tree to forwarding table", b: `<p>The parents p(v) form a <b>shortest-path tree</b> rooted at A. But the forwarding table needs something different: for each destination, the <b>first link out of A</b>.</p><p>F's parent is E, yet A does not send packets to E (not a neighbour). It sends them to D, the first hop on A → D → E → F.</p>`,
        v: netFig(NE0, { hl: treeHl(NT0.A, "A"), sub: Object.fromEntries(NNODES.map((n) => [n, NT0.A.d[n]])) }) + table(["Destination", "Forward on link"], NNODES.filter((n) => n !== "A").map((n) => [n, `(A, ${NT0.A.first[n]})`]), 320),
        c: { q: "In A's table, which link is used to reach E?", o: ["(A, D)", "(A, B)", "(A, E)"], a: 0, why: "The path is A → D → E, and the first link out of A is (A, D). There is no direct link A–E." } },
      { t: "How much work?", b: `<p>Each pass finds the minimum among routers not yet in N'. That is a scan of up to N − 1, then N − 2, … comparisons:</p><p>$$1 + 2 + \\dots + (N - 1) = \\frac{N(N-1)}{2} \\;\\Rightarrow\\; O(|N|^2)$$</p><p>Hint from the lecture: a better <b>data structure</b> helps. Keep the candidates in a <b>priority queue (min-heap)</b> and finding the minimum is cheap: roughly $O((|N| + |E|)\\log|N|)$.</p>`,
        v: table(["Routers N", "comparisons N(N−1)/2"], [[6, 15], [10, 45], [100, 4950], [1000, 499500]], 340),
        c: { q: "With the plain scan method, roughly how many comparisons for N = 10 routers?", o: ["10", "45", "100"], a: 1, why: "10 × 9 / 2 = 45." } },
      { t: "Limits in a fast-changing network", b: `<p>The lecture's question: can link-state cope with a highly dynamic network?</p><p>Every change must be <b>flooded</b> and every router must <b>recompute</b>. That means a slow response, large tables and frequent LSPs eating bandwidth.</p><p>Two answers follow in the next lessons: <b>distance-vector</b> routing (local gossip) and <b>hierarchical</b> routing (smaller worlds).</p>`,
        v: F.compare({ title: "Link-state strengths", c: "teal", body: "same view everywhere<br>fast convergence<br>easy to reason about" }, { title: "Link-state costs", c: "rose", body: "floods on every change<br>big tables at scale<br>whole map needed" }),
        c: { q: "Which is a drawback of link-state routing in a rapidly changing network?", o: ["Frequent flooded updates use up bandwidth", "Routers cannot run Dijkstra", "Routers disagree about the map forever"], a: 0, why: "Each change triggers flooding and recomputation, which costs both time and bandwidth." } },
    ],
    guide: [
      "Pick router <b>A</b>, then <b>D</b>, and compare their forwarding tables.",
      "Raise the <b>A–D</b> slider and watch A's routes switch over.",
      "Find a setting where the tree changes shape but the other routers keep their route.",
    ],
  };

  /* =====================================================================
     2.10  Bellman-Ford and distance-vector routing
     ===================================================================== */
  // prettier-ignore
  const DP = { A: [50, 125], B: [170, 45], C: [330, 55], D: [170, 205], E: [350, 200] };
  // prettier-ignore
  const DE = [["A", "B", 3], ["A", "D", 6], ["B", "C", 2], ["B", "D", 4], ["C", "E", 1], ["D", "E", 3]];
  const DN = Object.keys(DP);
  // prettier-ignore
  const dvCost = (() => { const c = {}; DN.forEach((n) => (c[n] = {})); DE.forEach(([a, b, w]) => { c[a][b] = w; c[b][a] = w; }); return c; })();
  // prettier-ignore
  const dvInit = () => Object.fromEntries(DN.map((x) => [x, Object.fromEntries(DN.map((y) => [y, x === y ? 0 : dvCost[x][y] !== undefined ? dvCost[x][y] : INF]))]));
  // prettier-ignore
  const copyD = (D) => Object.fromEntries(DN.map((x) => [x, { ...D[x] }]));
  /** Synchronous rounds: every router recomputes from the vectors its neighbours had at the end of the last round. */
  // prettier-ignore
  function dvSim() {
    let D = dvInit();
    const rounds = [];
    for (let r = 1; r < 10; r++) {
      const prev = copyD(D), cur = copyD(D), nodes = [];
      DN.forEach((x) => {
        const changes = [];
        DN.forEach((y) => {
          if (x === y) return;
          let best = INF, via = "";
          const terms = Object.keys(dvCost[x]).sort().map((v) => { const t = dvCost[x][v] + prev[v][y]; if (t < best) { best = t; via = v; } return { v, c: dvCost[x][v], d: prev[v][y] }; });
          if (best < prev[x][y]) { cur[x][y] = best; changes.push({ y, from: prev[x][y], to: best, via, terms }); }
        });
        if (changes.length) nodes.push({ node: x, changes });
      });
      D = cur;
      rounds.push({ r, nodes, D: copyD(D) });
      if (!nodes.length) break;
    }
    return { D0: dvInit(), rounds, final: D };
  }
  const DVS = dvSim();
  // prettier-ignore
  const dvMatrix = (D, hit = []) => `<table class="t dv-m" style="max-width:420px"><tr><th>from \\ to</th>${DN.map((y) => `<th>${y}</th>`).join("")}</tr>${DN.map((x) => `<tr><th>${x}</th>${DN.map((y) => `<td class="dv-cell ${hit.includes(x + "-" + y) ? "hl" : ""}" data-k="${x}-${y}">${show(D[x][y])}</td>`).join("")}</tr>`).join("")}</table>`;
  // prettier-ignore
  const dvNextHop = (x, y) => { let best = INF, via = "–"; Object.keys(dvCost[x]).sort().forEach((v) => { const t = dvCost[x][v] + DVS.final[v][y]; if (t < best) { best = t; via = v; } }); return via; };

  function dvRun(box, life) {
    function* frames() {
      yield {
        D: DVS.D0,
        hit: [],
        cur: null,
        cap: `Initialisation: each router knows only the cost of its own links. Everything else is <b>∞</b>. Each router sends its vector to its neighbours.`,
        line: 0,
      };
      let asked = 0;
      for (const R of DVS.rounds) {
        if (!R.nodes.length) {
          yield {
            D: R.D,
            hit: [],
            cur: null,
            cap: `<b>Round ${R.r}</b>: no router changes anything, so nobody sends anything. The network is <b>quiet</b>: the vectors have converged.`,
            line: 4,
            mood: "love",
          };
          continue;
        }
        let Dshow = copyD(R.r === 1 ? DVS.D0 : DVS.rounds[R.r - 2].D);
        for (const nd of R.nodes) {
          nd.changes.forEach((c) => (Dshow[nd.node][c.y] = c.to));
          const hit = nd.changes.map((c) => nd.node + "-" + c.y);
          const txt = nd.changes
            .map(
              (c) =>
                `d(${nd.node},${c.y}) = min{${c.terms.map((t) => `${t.c}+${show(t.d)}`).join(", ")}} = <b>${c.to}</b> via ${c.via}`,
            )
            .join("; ");
          const ask =
            asked < 2 && R.r === 1
              ? (asked++,
                {
                  q: `Round 1: ${nd.node} receives its neighbours' vectors. Which of ${nd.node}'s entries improve? Tap one.`,
                  pick: ".dv-cell",
                  a: hit,
                  why: `${nd.node} can now see past its neighbours: ${nd.changes.map((c) => `${c.y} becomes ${c.to}`).join(", ")}.`,
                })
              : null;
          yield {
            D: copyD(Dshow),
            hit,
            cur: nd.node,
            cap: `<b>Round ${R.r}</b>: ${nd.node} recomputes. ${txt}. It will send its changed vector on.`,
            line: 2,
            ask,
          };
        }
      }
    }
    F.run(box, life, {
      code: [
        "init: D(x, y) = cost of link x–y, else ∞;  send D to neighbours",
        "wait until a link changes or a vector arrives",
        "recompute: D(x, y) = min over neighbours v of c(x, v) + D(v, y)",
        "if any D(x, y) changed: send D(x) to all neighbours",
        "repeat; when nothing changes, nothing is sent",
      ],
      build(stage) {
        const g = F.graphScene(stage, { nodes: DP, edges: DE, w: 420, h: 250 });
        const tb = document.createElement("div");
        tb.className = "rn-tbl";
        stage.appendChild(tb);
        return { ...g, tb };
      },
      draw(sc, f, c) {
        DN.forEach((n) => {
          const h = sc.node(n);
          h.g.setAttribute("class", `rn-node ${n === f.cur ? "s-cur" : ""}`);
          if (f.cur) F.rn.num(c, h.tag, f.D[f.cur][n]);
          else {
            h.tag.textContent = "";
            delete h.tag.dataset.v;
          }
        });
        sc.tb.innerHTML = dvMatrix(f.D, f.hit);
      },
      frames,
    });
  }

  reg({
    id: "a2-bellman",
    order: 10,
    num: "2.10",
    title: "Bellman–Ford and distance vectors",
    blurb: "A router can only ask its neighbours. Try the one equation behind distance-vector routing.",
    // prettier-ignore
    render(root) {
      root.appendChild(header(this, ""));
      const cAB = { B: 3, C: 6, D: 2 }, d = { B: 5, C: 3, D: 5 };
      const card = el(`<div class="card"><div class="card-head"><h2>How far is F from A?</h2><span class="faint">A hears each neighbour's own distance to F</span></div>
        <div class="controls" id="sl"></div>
        <div id="tbl"></div><div class="callout" id="note"></div></div>`);
      root.appendChild(card);
      ["B", "C", "D"].forEach((v) => { const s = N.slider(`Neighbour ${v} says d(${v},F)`, 0, 12, 1, d[v]); s.onInput((x) => { d[v] = x; draw(); }); qs("#sl", card).appendChild(s); });
      function draw() {
        const rows = ["B", "C", "D"].map((v) => ({ v, c: cAB[v], d: d[v], t: cAB[v] + d[v] }));
        const best = rows.reduce((a, b) => (b.t < a.t ? b : a));
        qs("#tbl", card).innerHTML = table(["neighbour v", "link cost c(A,v)", "d(v,F)", "c(A,v) + d(v,F)"], rows.map((r) => ({ c: [`<b>${r.v}</b>`, r.c, r.d, `<b>${r.c} + ${r.d} = ${r.t}</b>`], hl: r.v === best.v })), 520);
        const n = qs("#note", card);
        n.className = "callout teal";
        n.innerHTML = `$d_A(F) = \\min\\{${rows.map((r) => r.t).join(",\\ ")}\\} = ${best.t}$, so A's next hop to F is <b>${best.v}</b>.`;
        N.tex && N.tex(n);
      }
      draw();
      root.appendChild(predict({ id: "a2-bf-1", q: "With the sliders at B = 5, C = 3, D = 5, which neighbour does A choose for destination F?", opts: ["B (3 + 5)", "C (6 + 3)", "D (2 + 5)"], a: 2,
        why: "The candidates are 3 + 5 = 8, 6 + 3 = 9 and 2 + 5 = 7. The smallest is via D, even though C reports the shortest distance to F." }));
      root.appendChild(predict({ id: "a2-bf-2", q: "Now move D's report up to 9 (B = 5, C = 3). Which neighbour wins?", opts: ["B", "C", "D"], a: 0,
        why: "Via B: 3 + 5 = 8. Via C: 6 + 3 = 9. Via D: 2 + 9 = 11. B is now cheapest." }));
      root.appendChild(takeaways([
        "<code>d<sub>x</sub>(y) = min<sub>v</sub> { c(x, v) + d<sub>v</sub>(y) }</code> over the neighbours v of x.",
        "A router stores its link costs, its own <b>distance vector</b> and its neighbours' vectors.",
        "DV is <b>distributed</b>, <b>iterative</b> and <b>asynchronous</b>: no map, no stop signal.",
        "Recompute on every change, and notify neighbours <b>only if your vector changed</b>.",
      ], "Ask your neighbours how far they are, add your link cost, keep the smallest."));
    },
  });

  L["a2-bellman"] = {
    sum: "Distance-vector routing replaces the global map with local gossip. Each router keeps a vector of its best-known distances to every destination, and repeatedly applies the Bellman–Ford equation to what its neighbours report. Updates ripple through the network until nothing changes.",
    // prettier-ignore
    steps: [
      { t: "Another algorithm for routing", b: `<p>Link-state is slow to react and chatty in a fast-changing network. The other main approach, <b>distance vector (DV)</b>, has three features:</p><p><b>Distributed</b>: a router hears only from directly attached neighbours, computes, and sends the result back to them.<br><b>Iterative</b>: it continues until no more information is exchanged. There is no "stop" signal.<br><b>Asynchronous</b>: routers do not have to take turns in lockstep.</p>`,
        v: table(["", "Link state", "Distance vector"], [["Knows", "whole map", "own links and neighbours' vectors"], ["Type", "global", "decentralised"], ["Computes with", "Dijkstra", "Bellman–Ford equation"], ["Exchanges", "flooded link states", "distance vectors with neighbours"]]),
        c: { q: "What does 'asynchronous' mean for distance-vector routers?", o: ["They need not update in lockstep", "They send their updates only at midnight", "They never exchange anything with neighbours"], a: 0, why: "Each router acts when something arrives or changes. There is no global clock." } },
      { t: "The Bellman–Ford equation", b: `<p>Let $d_x(y)$ be the cost of the least-cost path from x to y. Look at each neighbour v of x: the path via v costs the link x–v plus v's own best distance to y.</p><p>$$d_x(y) = \\min_v \\{\\, c(x, v) + d_v(y) \\,\\}$$</p><p>Pick the smallest. The neighbour that gives the minimum is the <b>next hop</b>.</p>`,
        v: F.cells([{ v: "d(x,y)", c: "amber" }, "=", { v: "min", c: "violet" }, "{", { v: "c(x,v)", c: "teal" }, "+", { v: "d(v,y)", c: "teal" }, "}"]),
        c: { q: "In the equation, what is v?", o: ["A neighbour of x", "The destination", "Any router in the network"], a: 0, why: "The minimum is taken over the neighbours of x. The destination is y." } },
      { t: "A worked example", b: `<p>Router A wants the distance to F. Its neighbours are B, C and D, with link costs 3, 6 and 2. They report $d_B(F) = 5$, $d_C(F) = 3$ and $d_D(F) = 5$.</p><p>$$d_A(F) = \\min\\{3 + 5,\\; 6 + 3,\\; 2 + 5\\} = \\min\\{8, 9, 7\\} = 7$$</p><p>Next hop: D.</p>`,
        v: table(["via", "c(A,v)", "d(v,F)", "total"], [["B", 3, 5, 8], ["C", 6, 3, 9], { c: ["D", 2, 5, "<b>7</b>"], hl: true }], 420),
        c: { q: "Router A has neighbours X (link 4, X says 6 to the destination) and Y (link 7, Y says 1). What is A's distance to the destination?", o: ["8", "10", "11"], a: 0, why: "Via X: 4 + 6 = 10. Via Y: 7 + 1 = 8. The minimum is 8, even though Y is the more expensive link." } },
      { t: "What each router keeps", b: `<p>Each router x maintains:</p><p><b>c(x, v)</b>: the cost to each neighbour v.<br><b>D<sub>x</sub></b>: its own distance vector, a best-known distance to every destination.<br><b>D<sub>v</sub></b>: a copy of each neighbour's latest vector.</p><p>Its forwarding table follows from D<sub>x</sub> and the neighbour that gave each minimum.</p>`,
        v: table(["Item", "Meaning", "Example at A"], [["c(x, v)", "link cost to a neighbour", "c(A,B) = 3"], ["D<sub>x</sub>", "my vector", "[B 3, C 5, D 6, E 6]"], ["D<sub>v</sub>", "neighbour's vector", "B's vector [A 3, C 2, D 4, E 3]"]]),
        c: { q: "Which data does a router NOT need in distance-vector routing?", o: ["Link costs between two other routers", "The costs of its own attached links", "Its neighbours' latest distance vectors"], a: 0, why: "A DV router never sees links it is not attached to, only the distances its neighbours report." } },
      { t: "The loop: wait, recompute, notify", b: `<p>Every router runs the same loop forever:</p><p>1. <b>Initialise</b>: D(x, y) = c(x, y) for neighbours, ∞ otherwise. Send the vector to neighbours.<br>2. <b>Wait</b> for a link cost change or a vector from a neighbour.<br>3. <b>Recompute</b> every entry with the Bellman–Ford equation.<br>4. <b>Notify</b> neighbours, but only if some entry changed.</p>`,
        v: F.flow(["Initialise", "Wait", "Recompute", { t: "Notify if changed", c: "teal" }], { loop: true }),
        c: { q: "When does a router send its vector to its neighbours after the start?", o: ["Only when its own vector changed", "After every received message, whatever happened", "Never again once it has converged"], a: 0, why: "Silence means 'nothing new'. If no entry changed there is nothing to tell." } },
      { t: "Watch the vectors converge", b: `<p>A five-router network. Each row of the table is one router's vector. To keep the picture simple the run plays in <b>rounds</b> (real routers do not need to). It will ask which entries improve.</p>`,
        v: (box, life) => dvRun(box, life),
        c: { q: "In round 1, A's distance to C goes from ∞ to 5. Why?", o: ["B is 2 from C and A–B costs 3", "A has a direct link to C", "C sent its message straight to A"], a: 0, why: "Via B: 3 (link) + 2 (B's distance to C) = 5. Information travels one hop per round." } },
      { t: "Converged: what the tables say", b: `<p>After ${DVS.rounds.length - 1} rounds of changes the vectors stop moving and everyone agrees with the true shortest distances. The next hop for each entry is the neighbour that gave the minimum.</p><p>Information moves <b>one hop per round</b>, so a route of k links needs about k rounds to be learned.</p>`,
        v: dvMatrix(DVS.final) + table(["A's destination", "cost", "next hop"], DN.filter((n) => n !== "A").map((n) => [n, DVS.final.A[n], dvNextHop("A", n)]), 320),
        c: { q: `In the converged tables, what is A's next hop to reach E (cost ${DVS.final.A.E})?`, o: ["B", "D", "E"], a: 0, why: "A–B–C–E costs 3 + 2 + 1 = 6, which beats A–D–E at 6 + 3 = 9. There is no direct A–E link." } },
      { t: "Cost, history and where it is used", b: `<p>DV is a <b>distributed Bellman–Ford</b>. Counting the work: up to |N| rounds, each touching at most |E| links, so $O(|N|\\,|E|)$.</p><p>It is simple and was one of the earliest routing methods, used in the <b>ARPANET</b> (the Internet's ancestor) and in the Routing Information Protocol, RIP.</p>`,
        v: table(["", "Link state (Dijkstra)", "Distance vector (Bellman–Ford)"], [["Time", "O(|N|²), or less with a heap", "O(|N| · |E|)"], ["Local knowledge", "whole map", "neighbours only"], ["Used in", "OSPF", "ARPANET, RIP"]]),
        c: { q: "Which is the running time of the distributed Bellman–Ford?", o: ["O(|N| · |E|)", "O(log |N|)", "O(|E|)"], a: 0, why: "About |N| rounds of work over at most |E| links each." } },
    ],
    guide: [
      "Drag the three neighbour sliders and watch which row gives the smallest total.",
      "Find values where each of B, C and D takes a turn as the best next hop.",
      "Then answer the questions after the demo.",
    ],
  };

  /* =====================================================================
     2.12  Hierarchical routing: AS, RIP, OSPF, BGP
     ===================================================================== */
  // prettier-ignore
  const ASP = { a1: [50, 55], a2: [50, 180], a3: [130, 150], b1: [195, 150], b2: [240, 50], b3: [295, 150], c1: [345, 150], c2: [405, 60], c3: [425, 190] };
  const ASOF = (n) => n[0];
  // prettier-ignore
  const ASE = [["a1", "a2", 2], ["a2", "a3", 1], ["a1", "a3", 4], ["b1", "b2", 1], ["b2", "b3", 2], ["b1", "b3", 4], ["c1", "c2", 1], ["c2", "c3", 3], ["c1", "c3", 5]];
  // prettier-ignore
  const ASX = [["a3", "b1"], ["b3", "c1"]];
  // prettier-ignore
  const ASGW = { a: { b: "a3", c: "a3" }, b: { a: "b1", c: "b3" }, c: { a: "c1", b: "c1" } };
  // prettier-ignore
  function asDij(src) {
    const nodes = Object.keys(ASP).filter((n) => ASOF(n) === ASOF(src)), d = {}, first = {}, done = [];
    nodes.forEach((n) => (d[n] = INF)); d[src] = 0;
    while (done.length < nodes.length) {
      let w = null; nodes.forEach((n) => { if (!done.includes(n) && d[n] < INF && (w === null || d[n] < d[w])) w = n; });
      if (w === null) break; done.push(w);
      ASE.forEach(([p, q, c]) => { [[p, q], [q, p]].forEach(([u, v]) => { if (u === w && !done.includes(v) && d[w] + c < d[v]) { d[v] = d[w] + c; first[v] = w === src ? v : first[w]; } }); });
    }
    return { d, first };
  }
  /** Forwarding table of one router: internal entries from the intra-AS algorithm, external ones via the gateway. */
  // prettier-ignore
  function asTable(r) {
    const mine = ASOF(r), T = asDij(r);
    return Object.keys(ASP).filter((n) => n !== r).map((dst) => {
      if (ASOF(dst) === mine) return { dst, kind: "intra", hop: T.first[dst], cost: T.d[dst] };
      const gw = ASGW[mine][ASOF(dst)];
      if (r === gw) { const peer = ASX.find(([p, q]) => p === r || q === r); return { dst, kind: "inter", hop: peer[0] === r ? peer[1] : peer[0], via: gw }; }
      return { dst, kind: "inter", hop: T.first[gw], via: gw };
    });
  }
  const asFig = (sel) => {
    const reg3 = { a: [8, 8, 150, 224, "AS 1"], b: [170, 8, 148, 224, "AS 2"], c: [326, 8, 142, 224, "AS 3"] };
    let s = `<svg class="fig" viewBox="0 0 480 240" style="max-height:240px">`;
    Object.entries(reg3).forEach(
      ([k, [x, y, w, h, t]], i) =>
        (s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="color-mix(in srgb, ${["var(--blue)", "var(--violet)", "var(--amber)"][i]} 9%, var(--panel-2))" stroke="${["var(--blue)", "var(--violet)", "var(--amber)"][i]}" stroke-width="2" stroke-dasharray="6 5"/><text x="${x + w / 2}" y="${y + h - 8}" class="fig-sub">${t}</text>`),
    );
    ASE.forEach(
      ([p, q, c]) =>
        (s += `<line x1="${ASP[p][0]}" y1="${ASP[p][1]}" x2="${ASP[q][0]}" y2="${ASP[q][1]}" stroke="var(--line-2)" stroke-width="2.5"/>`),
    );
    ASX.forEach(
      ([p, q]) =>
        (s += `<line x1="${ASP[p][0]}" y1="${ASP[p][1]}" x2="${ASP[q][0]}" y2="${ASP[q][1]}" stroke="var(--rose)" stroke-width="3.5"/>`),
    );
    Object.entries(ASP).forEach(([n, [x, y]]) => {
      const gw = ["a3", "b1", "b3", "c1"].includes(n);
      s += `<g class="fi"><circle cx="${x}" cy="${y}" r="15" fill="${n === sel ? "color-mix(in srgb, var(--teal) 30%, var(--panel-2))" : "var(--panel-2)"}" stroke="${n === sel ? "var(--teal)" : gw ? "var(--rose)" : "var(--line-2)"}" stroke-width="${gw || n === sel ? 3 : 2}"/><text x="${x}" y="${y + 4}" class="fig-n" style="font-size:11px">${n}</text></g>`;
    });
    return s + `</svg>`;
  };

  reg({
    id: "a2-hierarchy",
    order: 12,
    num: "2.12",
    title: "Autonomous systems and Internet protocols",
    blurb:
      "Read a gateway router's table and see which entries come from the intra-AS protocol and which from the inter-AS one.",
    // prettier-ignore
    render(root) {
      root.appendChild(header(this, ""));
      let sel = "a1";
      const card = el(`<div class="card"><div class="card-head"><h2>Forwarding tables in three ASes</h2><span class="faint">red links and outlines = gateways between ASes</span></div>
        <div class="controls"><span class="faint">Router</span><span id="sa"></span></div>
        <div class="grid side"><div id="fig"></div><div id="tbl"></div></div></div>`);
      root.appendChild(card);
      qs("#sa", card).appendChild(N.seg(["a1", "a3", "b1", "b2", "c2"].map((n) => [n, n]), sel, (v) => { sel = v; draw(); }));
      function draw() {
        qs("#fig", card).innerHTML = `<div class="fig-wrap">${asFig(sel)}</div>`;
        const rows = asTable(sel).map((r) => ({ c: [`<b>${r.dst}</b>`, r.kind === "intra" ? `<span style="color:var(--blue)">intra-AS</span> (cost ${r.cost})` : `<span style="color:var(--rose)">inter-AS</span> → gateway ${r.via}`, r.hop], hl: r.kind === "inter" }));
        qs("#tbl", card).innerHTML = `<div class="faint">Router ${sel}'s forwarding table</div>` + table(["destination", "entry set by", "next hop"], rows, 420);
      }
      draw();
      root.appendChild(predict({ id: "a2-hi-1", q: "Router a1 wants to reach any router in AS 3. How many forwarding-table entries does a1 need for them?", opts: ["Three, all with the same next hop", "Zero, as a1 cannot reach other ASes", "One for each link inside AS 3"], a: 0,
        why: "a1 has an entry for each destination, but all the external ones leave through the same gateway, a3, so they share a next hop. Routers inside AS 1 do not need AS 3's internal map." }));
      root.appendChild(predict({ id: "a2-hi-2", q: "Select b1 (a gateway). For which destinations does it use only the intra-AS protocol?", opts: ["Those inside AS 2 (b2, b3)", "Those in AS 1 and AS 3", "All destinations"], a: 0,
        why: "Internal destinations are covered by the intra-AS protocol alone. External ones also depend on the inter-AS protocol, which decides the gateway and the next AS." }));
      root.appendChild(takeaways([
        "A flat network cannot hold or advertise every destination: group routers into <b>autonomous systems</b>.",
        "<b>Intra-AS</b> protocols (RIP, OSPF) work inside one AS; <b>inter-AS</b> (BGP) joins them through <b>gateway routers</b>.",
        "Inside an AS the goal is <b>performance</b>; between ASes <b>policy</b> comes first.",
        "RIP = distance vector (max 15 hops); OSPF = link state with Dijkstra; BGP = reachability over TCP.",
      ], "Think globally in small clusters: hierarchy shrinks tables and keeps administrators in control."));
    },
  });

  L["a2-hierarchy"] = {
    sum: "The Internet is far too large for one flat routing algorithm. Routers are grouped into autonomous systems. Inside an AS, one intra-AS protocol (RIP or OSPF) optimises performance; between ASes, BGP exchanges reachability under each administrator's policy. Gateway routers run both.",
    // prettier-ignore
    steps: [
      { t: "Why a flat network cannot work", b: `<p>Everything so far assumed a <b>flat</b> network of identical routers. Reality breaks that:</p><p>The Internet has hundreds of millions of destinations, and the number keeps growing.<br>A router cannot store every destination in its table.<br>Exchanging routing information about all of them would use up the bandwidth.<br>It is a <b>network of networks</b>, and each administrator wants control of their own.</p>`,
        v: table(["Flat assumption", "Reality"], [["Every router is identical", "different owners, different rules"], ["One table lists everything", "hundreds of millions of destinations"], ["Updates are free", "updates would swamp the links"]]),
        c: { q: "Why can't one router store a route to every destination on the Internet?", o: ["Far too many destinations for one table", "Routers have no memory to store tables", "Destinations never change over time at all"], a: 0, why: "The scale (hundreds of millions of destinations) overwhelms memory and the updates would overwhelm bandwidth." } },
      { t: "Autonomous systems", b: `<p>Aggregate routers into clusters called <b>autonomous systems (AS)</b>.</p><p><b>Intra-AS routing</b>: routers in the same AS run the same routing protocol.<br><b>Inter-AS routing</b>: <b>gateway routers</b> at the edge run both their AS's intra-AS protocol and the inter-AS protocol.</p>`,
        v: asFig(null),
        c: { q: "What is a gateway router?", o: ["A router at the edge of an AS that also speaks to other ASes", "A router that only forwards packets inside its AS", "A router that stores every destination"], a: 0, why: "Gateways run the intra-AS protocol for their own network and the inter-AS protocol to talk to neighbouring ASes." } },
      { t: "Forwarding tables of gateway routers", b: `<p>A gateway's table is filled by <b>both</b> algorithms:</p><p>Entries for <b>internal</b> destinations come from the intra-AS algorithm alone.<br>Entries for <b>external</b> destinations come from both: the inter-AS protocol decides which AS and gateway to use, the intra-AS protocol finds the way to that gateway.</p>`,
        v: table(["Destination", "set by", "example (router a1)"], [["inside my AS", "intra-AS protocol", "a3: next hop a2"], ["outside my AS", "inter-AS + intra-AS", "any AS 3 router: head for gateway a3"]]),
        c: { q: "Which algorithms set the table entry for a destination in another AS?", o: ["Both intra-AS and inter-AS", "Only the intra-AS algorithm", "Only the inter-AS algorithm"], a: 0, why: "The inter-AS protocol picks the exit; the intra-AS protocol gets you to it." } },
      { t: "Policy versus performance", b: `<p><b>Intra-AS</b>: a single administrator, so no policy decisions are needed; the protocol can focus on <b>performance</b>.</p><p><b>Inter-AS</b>: the administrator controls who may route through the network and how its traffic is routed, so <b>policy</b> beats performance.</p><p>Benefits of hierarchy: smaller routing tables, less update traffic.</p>`,
        v: F.compare({ title: "Inside an AS", c: "blue", body: "one owner<br>goal: <b>performance</b><br>RIP, OSPF" }, { title: "Between ASes", c: "rose", body: "many owners<br>goal: <b>policy</b><br>BGP" }),
        c: { q: "Which is a benefit of hierarchical routing?", o: ["Smaller routing tables and less update traffic", "Every router sees the whole Internet map", "No administrator is needed"], a: 0, why: "Routers only need detail about their own AS plus summaries of the others." } },
      { t: "RIP: Routing Information Protocol", b: `<p>RIP is a <b>distance-vector</b> protocol, one of the earliest intra-AS protocols (used in the Xerox Network Systems architecture).</p><p>Metric: <b>hops</b>, every link costs 1, with a maximum of <b>15</b>. A cost of 16 means "unreachable".<br>Vectors are exchanged with neighbours every <b>30 seconds</b>.<br>One advertisement lists up to <b>25</b> destination subnets.</p>`,
        v: F.cells([{ v: "hop 1", c: "teal" }, { v: "…", c: "teal" }, { v: "hop 15", c: "amber", sub: "last usable" }, { v: "16", c: "rose", sub: "= ∞" }]),
        c: { q: "In RIP, what does a cost of 16 mean?", o: ["The destination is unreachable", "A very slow but working route", "A route with 16 alternatives"], a: 0, why: "16 is RIP's 'infinity'. It also caps how far a count-to-infinity loop can climb." } },
      { t: "OSPF: Open Shortest Path First", b: `<p>OSPF is a <b>link-state</b> protocol. Every router builds a map of the entire AS and runs <b>Dijkstra</b> locally to get a shortest-path tree rooted at itself.</p><p>Link-state information is <b>flooded</b> whenever a link changes. "Open" means the specification is publicly available.</p><p>OSPF tends to be used at upper-tier ISPs, RIP at lower-tier ISPs and enterprise networks.</p>`,
        v: F.flow(["Link changes", { t: "Flood to the whole AS", c: "violet" }, { t: "Each router runs Dijkstra", c: "teal" }]),
        c: { q: "OSPF routers learn about a failed link by…", o: ["Flooding the change to the entire AS", "Waiting for the next 30-second update", "Asking only their immediate neighbour"], a: 0, why: "Link-state protocols flood changes, so everyone updates their map at once." } },
      { t: "BGP: the glue between ASes", b: `<p>BGP (Border Gateway Protocol) is the <b>de facto standard</b> for inter-AS routing. It lets each AS:</p><p>learn which subnets neighbouring ASes can reach,<br>spread that reachability to all of its internal routers,<br>choose good routes using the information <b>and the AS policy</b>.</p><p>It also lets a subnet announce "I am here" to the rest of the Internet. BGP messages travel over <b>TCP</b>.</p>`,
        v: table(["Message", "Purpose"], [["OPEN", "set up the TCP connection"], ["UPDATE", "advertise a new path"], ["KEEPALIVE", "keep the connection alive when there are no updates"], ["NOTIFICATION", "report an error, also used to close the connection"]]),
        c: { q: "Which BGP message advertises a new path?", o: ["UPDATE", "KEEPALIVE", "OPEN"], a: 0, why: "UPDATE carries new reachability and path information. KEEPALIVE only keeps the session up." } },
      { t: "Why the Internet needs more than one algorithm", b: `<p>The lecture's opening question has a neat answer: the jobs differ. Inside an AS you want speed and efficiency; between ASes you want control and scale.</p>`,
        v: table(["Protocol", "Level", "Type", "Metric / goal"], [["RIP", "intra-AS", "distance vector", "hop count (max 15)"], ["OSPF", "intra-AS", "link state, Dijkstra", "cost, fast convergence"], ["BGP", "inter-AS", "path advertisements over TCP", "policy and reachability"]]),
        c: { q: "Which pairing is right?", o: ["OSPF: link-state, inside an AS", "RIP: link-state, between ASes", "BGP: distance vector, inside an AS"], a: 0, why: "OSPF is intra-AS link-state. RIP is intra-AS distance-vector. BGP is inter-AS." } },
    ],
    guide: [
      "Select <b>a1</b> and read how it reaches AS 2 and AS 3 (all through gateway a3).",
      "Select the gateway <b>a3</b> and compare which entries are intra-AS or inter-AS.",
      "Select <b>b2</b>: it sits in the middle AS. Which gateway does it use for AS 1, and which for AS 3?",
    ],
  };
})();

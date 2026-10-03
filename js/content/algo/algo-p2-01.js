/* Phase 2 — Graph Search & Internet Routing: Dijkstra, A*, distance-vector */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  /* ============ 2.1 Dijkstra step by step ============ */
  const GPOS = { A: [70, 150], B: [220, 60], C: [200, 235], D: [370, 120], E: [390, 250] };
  const BASE = [
    ["A", "B", 4],
    ["A", "C", 2],
    ["C", "B", 1],
    ["C", "D", 5],
    ["B", "D", 3],
    ["C", "E", 7],
    ["D", "E", 2],
  ];
  // Negative mode: directed version (a DAG, so no negative cycles) with A→C = 5 and C→B = −3.
  // Dijkstra settles B at 4 before seeing C→B; the true distance is 5 − 3 = 2 (so D is really 5, E really 7).
  const NEG = BASE.map(([a, b, w]) =>
    a === "A" && b === "C" ? [a, b, 5] : a === "C" && b === "B" ? [a, b, -3] : [a, b, w],
  );

  function dijkstraTrace(edges, directed) {
    const adj = {};
    Object.keys(GPOS).forEach((n) => (adj[n] = []));
    edges.forEach(([a, b, w]) => {
      adj[a].push([b, w]);
      if (!directed) adj[b].push([a, w]);
    });
    const tent = {},
      parent = {},
      settled = [],
      steps = [];
    Object.keys(GPOS).forEach((n) => (tent[n] = n === "A" ? 0 : Infinity));
    for (;;) {
      let cur = null,
        best = Infinity;
      Object.keys(tent).forEach((n) => {
        if (!settled.includes(n) && tent[n] < best) {
          best = tent[n];
          cur = n;
        }
      });
      if (cur === null) break;
      settled.push(cur);
      const upd = [],
        missed = [];
      adj[cur].forEach(([nb, w]) => {
        const nd = tent[cur] + w;
        if (settled.includes(nb)) {
          if (nd < tent[nb]) missed.push(`${nb}: ${nd} < ${tent[nb]}`);
          return;
        }
        if (nd < tent[nb]) {
          tent[nb] = nd;
          parent[nb] = cur;
          upd.push(`${nb} → ${nd}`);
        }
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
      const adj = {};
      names.forEach((n) => (adj[n] = []));
      W.forEach(([a, b, w]) => {
        adj[a].push([b, w]);
        adj[b].push([a, w]);
      });
      const dist = Object.fromEntries(names.map((n) => [n, n === "A" ? 0 : Infinity])),
        parent = {},
        done = [];
      const snap = (x) => ({ dist: { ...dist }, parent: { ...parent }, done: done.slice(), ...x });
      yield snap({ cap: "Start: A is 0 away from itself. Everything else is <b>∞</b> (not reached yet).", line: 0 });
      for (let round = 0; ; round++) {
        const open = names.filter((n) => !done.includes(n) && dist[n] < Infinity);
        if (!open.length) break;
        const cur = open.reduce((a, b) => (dist[b] < dist[a] ? b : a));
        const tie = open.filter((n) => dist[n] === dist[cur]);
        done.push(cur);
        const ask =
          round >= 1 && round <= 3 && round !== 2
            ? {
                q: "Which node gets <b>settled</b> next? Tap it.",
                pick: ".rn-node.s-tent",
                a: tie,
                why: `The smallest tentative distance always settles next: <b>${cur} = ${dist[cur]}</b>.`,
              }
            : null;
        yield snap({
          cur,
          cap: `Settle <b>${cur}</b>: its ${dist[cur]} is the smallest tentative distance, so it's final.`,
          line: 1,
          ask,
          mood: "happy",
        });
        for (const [nb, w] of adj[cur]) {
          if (done.includes(nb)) continue;
          const nd = dist[cur] + w,
            old = dist[nb],
            better = nd < old;
          if (better) {
            dist[nb] = nd;
            parent[nb] = cur;
          }
          yield snap({
            cur,
            edge: [cur, nb],
            better,
            cap: `Relax ${cur}→${nb}: ${dist[cur]} + ${w} = <b>${nd}</b> ${better ? `&lt; ${old === Infinity ? "∞" : old}, so update ${nb} to ${nd}.` : `≥ ${old}, keep ${old}.`}`,
            line: better ? 3 : 2,
          });
        }
      }
      yield snap({
        cap: `Done. The green edges are the <b>shortest-path tree</b>: A→E costs ${dist.E}.`,
        line: 4,
        mood: "love",
      });
    }
    F.run(box, life, {
      code: [
        "dist[A] = 0; all others = ∞",
        "u = unsettled node with smallest dist; settle u",
        "for each edge u→v: try dist[u] + w",
        "  if smaller: dist[v] = it, parent[v] = u",
        "repeat until every reached node is settled",
      ],
      build(stage, api) {
        const g = F.graphScene(stage, { nodes: GPOS, edges: W, w: 460, h: 300, editable: true });
        W.forEach((e) => {
          const h = g.edge(e[0], e[1]);
          api.edit(h.wbox, {
            get: () => e[2],
            set: (v) => {
              e[2] = v;
              h.wt.textContent = v;
              h.wt.dataset.v = v;
            },
            min: 1,
            max: 9,
          });
        });
        return g;
      },
      draw(g, f, c) {
        names.forEach((n) => {
          const h = g.node(n),
            st = n === f.cur ? "s-cur" : f.done.includes(n) ? "s-done" : f.dist[n] < Infinity ? "s-tent" : "";
          h.g.setAttribute("class", `rn-node ${st}`);
          const moved = !c.prev || c.prev.dist[n] !== f.dist[n];
          F.rn.num(c, h.tag, f.dist[n]);
          if (moved && c.prev) F.rn.pulse(c, h.tagBox);
          if (n === f.cur && (!c.prev || c.prev.cur !== n)) F.rn.pulse(c, h.body);
        });
        W.forEach(([a, b]) => {
          const h = g.edge(a, b),
            tree = f.parent[b] === a || f.parent[a] === b;
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
      {
        t: "Every node is in one of two states",
        b: `<p>Dijkstra keeps two groups:</p><p><b style="color:var(--teal)">Settled</b>: we know its shortest distance for certain.<br><b style="color:var(--violet)">Tentative</b>: the best distance found <i>so far</i>. It might still drop.</p><span class="key">Each step: pick the tentative node with the <b>smallest</b> distance and settle it.</span>`,
        v:
          F.graph({
            nodes: {
              A: { x: 60, y: 110, sub: "0 · settled" },
              C: { x: 190, y: 50, sub: "2" },
              B: { x: 200, y: 175, sub: "4" },
              D: { x: 340, y: 110, sub: "∞" },
            },
            edges: [
              ["A", "C", 2],
              ["A", "B", 4],
              ["C", "B", 1],
              ["C", "D", 5],
              ["B", "D", 3],
            ],
            hl: { A: "teal", C: "violet", B: "violet" },
            w: 400,
            h: 215,
          }) + `<div class="fig-cap">A is settled. C (2) and B (4) are tentative. D hasn't been reached yet (∞).</div>`,
      },
      {
        t: "Why the smallest one is safe to settle",
        b: `<p>C has distance 2, and every other tentative node is at least 2. Could a sneaky detour reach C for less?</p><p>Any detour would have to go <b>through B first</b> (already 4) and then add a road (≥ 0). So it costs at least 4, which is more than 2. There's no cheaper way in.</p>`,
        v: F.compare(
          { title: "Direct: A → C", c: "teal", body: "cost <b>2</b>" },
          { title: "Any detour: A → B → … → C", c: "rose", body: "at least <b>4 + (something ≥ 0)</b> ≥ 4" },
        ),
        c: {
          q: "Why can Dijkstra lock in the node with the smallest tentative distance?",
          o: [
            "It's the node drawn closest to the start on the map",
            "Every other route passes a node at least as far away",
            "Nodes are always settled in alphabetical order, so it's next",
          ],
          a: 1,
          why: "Detours start from nodes that are already further away, and roads can't have negative length, so a detour can never undercut it.",
        },
      },
      {
        t: "Relaxing an edge = checking for a shortcut",
        b: `<p>After settling a node, look at each neighbour and ask: <i>is going through the node I just settled cheaper than what I had?</i></p><p><code>if dist[C] + w(C,B) &lt; dist[B]: dist[B] = dist[C] + w(C,B)</code></p>`,
        v: F.frames([
          {
            t: "Before: B was 4 (direct from A)",
            v: F.cells([
              { v: "A", sub: "0", c: "teal" },
              { v: "C", sub: "2", c: "teal" },
              { v: "B", sub: "4", c: "violet" },
            ]),
          },
          {
            t: "Check the shortcut: C→B costs 1, so 2 + 1 = 3",
            v: F.cells([{ v: "2", c: "teal" }, "+", { v: "1" }, "=", { v: "3", c: "amber" }]),
          },
          {
            t: "3 < 4, so update B to 3 (via C)",
            v: F.cells([
              { v: "A", sub: "0", c: "teal" },
              { v: "C", sub: "2", c: "teal" },
              { v: "B", sub: "3 ✓", c: "amber" },
            ]),
          },
        ]),
      },
      {
        t: "Watch it run",
        b: `<p>Here is the whole algorithm on a five-node graph. Press <b>play</b> or step with the arrows. The code panel lights up the line being run.</p><p>It will pause and ask you to predict the next node. Tap a weight to change it and the run recomputes.</p>`,
        v: (box, life) => dijkstraRun(box, life),
      },
      {
        t: "Why negative edges break it",
        b: `<p>The safety argument assumed a detour can only <b>add</b> cost. A negative edge <i>subtracts</i>.</p><p>Here Dijkstra settles B at 2, since it's the smallest. But A → C → B costs 3 + (−2) = <b>1</b>. B was locked in too early.</p><span class="key">Negative edges: use Bellman–Ford instead.</span>`,
        v: F.graph({
          nodes: {
            A: { x: 60, y: 100, sub: "0" },
            B: { x: 230, y: 40, sub: "settled at 2 ✗" },
            C: { x: 230, y: 165, sub: "3" },
          },
          edges: [
            ["A", "B", 2],
            ["A", "C", 3],
            ["C", "B", "−2", "rose"],
          ],
          hl: { B: "rose" },
          directed: true,
          w: 330,
          h: 205,
        }),
        c: {
          q: "A graph has a negative edge. What can go wrong with Dijkstra?",
          o: [
            "Nothing: it still gives the right distances, only more slowly",
            "It can settle a node before a cheaper route appears",
            "It just runs more slowly than usual because of the extra checks",
          ],
          a: 1,
          why: 'The "settled means final" guarantee depends on non-negative weights.',
        },
      },
    ],
    guide: [
      "Press <b>Step</b> repeatedly. The settled set grows A → C → B → D → E.",
      "Before each press, guess which node settles next (smallest tentative number in the table).",
      'Tick <b>Make B→D weight −10</b>, then step again. Find the moment the "final" answer turns out to be wrong.',
    ],
  };

  N.register({
    id: "a2-dijkstra",
    subject: "algo",
    lecture: 2,
    order: 1,
    num: "2.1",
    title: "Dijkstra step by step",
    blurb: "Settle nodes one by one and watch the shortest-path tree grow — then break it with a negative edge.",
    render(root) {
      root.appendChild(header(this, ""));
      let neg = false,
        ti = 0,
        trace = dijkstraTrace(BASE, false);
      const card =
        el(`<div class="card"><div class="controls"><button class="btn primary" id="step"></button><button class="btn ghost" id="rs">Reset</button>
        <label class="field"><input type="checkbox" id="neg"> Negative-edge mode (directed, C→B = −3)</label></div>
        <div class="grid side"><div id="svg"></div><div><table class="t" id="tbl"></table><div class="mono dim" id="log" style="margin-top:10px;min-height:22px"></div></div></div>
        <div class="legend"><span style="--c:var(--teal)">settled (final)</span><span style="--c:var(--violet)">tentative</span><span style="--c:var(--amber)">just settled</span><span style="--c:var(--text-faint)">tree edge = how we got there</span></div>
        <div class="callout" id="note" style="display:none"></div></div>`);
      root.appendChild(card);
      const edges = () => (neg ? NEG : BASE);
      function draw() {
        const done = trace.settled.slice(0, ti),
          s = ti ? trace.steps[ti - 1] : null,
          justNow = s && s.node;
        const tent = s ? s.tent : Object.fromEntries(Object.keys(GPOS).map((n) => [n, n === "A" ? 0 : Infinity]));
        const parent = s ? s.parent : {};
        const tree = done.filter((n) => parent[n]).map((n) => [parent[n], n]);
        const hl = {};
        done.forEach((n) => (hl[n] = n === justNow ? "amber" : "teal"));
        Object.keys(GPOS).forEach((n) => {
          if (!done.includes(n) && tent[n] !== Infinity) hl[n] = "violet";
        });
        tree.forEach(([p, n]) => (hl[`${p}-${n}`] = n === justNow ? "amber" : "teal"));
        if (neg && !hl["C-B"]) hl["C-B"] = "rose";
        const nodes = Object.fromEntries(
          Object.entries(GPOS).map(([n, [x, y]]) => [n, { x, y, sub: tent[n] === Infinity ? "∞" : tent[n] }]),
        );
        qs("#svg", card).innerHTML =
          `<div class="fig-wrap">${F.graph({ nodes, edges: edges(), hl, directed: neg, w: 460, h: 300, r: 20 })}</div>`;
        // only the edge that was just added draws itself in; older tree edges stay put
        qsa("#svg line.draw", card).forEach((l) => {
          if (!justNow || !l.getAttribute("stroke").includes("amber")) l.classList.remove("draw");
        });
        qsa("#svg .fi", card).forEach((g) => g.classList.remove("fi"));
        N.fx.play(qs("#svg", card));
        qs("#tbl", card).innerHTML =
          `<tr><th>node</th><th>distance</th><th>via</th><th>state</th></tr>` +
          Object.keys(GPOS)
            .map(
              (n) =>
                `<tr class="${n === justNow ? "hl" : ""}"><td><b>${n}</b></td><td class="mono">${tent[n] === Infinity ? "∞" : tent[n]}</td><td class="mono dim">${parent[n] || (n === "A" ? "start" : "—")}</td><td>${done.includes(n) ? `<span style="color:var(--teal)">settled</span>` : tent[n] === Infinity ? `<span class="faint">unseen</span>` : `<span style="color:var(--violet)">tentative</span>`}</td></tr>`,
            )
            .join("");
        qs("#log", card).innerHTML = s
          ? `settled <b style="color:var(--amber)">${s.node}</b>${s.upd.length ? ` · updated ${s.upd.join(", ")}` : " · no improvements"}${s.missed.length ? ` · <span style="color:var(--rose)">too late for ${s.missed.join(", ")}</span>` : ""}`
          : "Start: A = 0, everything else ∞.";
        const note = qs("#note", card),
          end = ti === trace.steps.length;
        if (end && neg) {
          note.style.display = "block";
          note.className = "callout rose";
          note.innerHTML = `<b>Wrong answer.</b> Dijkstra locked in <b>B = 4</b> before it settled C. But A→C→B = 5 + (−3) = <b>2</b>. The error spreads: it reports D = 7 and E = 9, when the true distances are 5 and 7. A negative edge breaks the rule that settled means final.`;
        } else if (end) {
          note.style.display = "block";
          note.className = "callout teal";
          note.innerHTML = `Done. Every node's distance is final, and the green edges form the <b>shortest-path tree</b>. Shortest A→E = <b>8</b> via A→C→B→D→E (2+1+3+2).`;
        } else note.style.display = "none";
        const btn = qs("#step", card);
        btn.disabled = end;
        btn.textContent = end ? "Finished" : `Settle next: ${trace.settled[ti]}  (${ti + 1}/${trace.steps.length})`;
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
      qs("#neg", card).onchange = (e) => {
        neg = e.target.checked;
        trace = dijkstraTrace(edges(), neg);
        ti = 0;
        draw();
      };
      draw();
      root.appendChild(
        predict({
          id: "a2-dij-1",
          q: "After settling A (dist 0) and C (dist 2), which node settles next?",
          opts: [
            "D, because it's reached through two nodes",
            "B: its tentative distance 3 is the smallest",
            "E, because it's the destination",
          ],
          a: 1,
          why: "B has tentative distance 3 (via C: 2+1). The smallest tentative always settles next: 3 &lt; 7 (D) &lt; 9 (E).",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Dijkstra settles the <b>smallest tentative</b> node, and that distance is final.",
            "Settling relaxes the node's edges: <code>dist[v] = min(dist[v], dist[u] + w(u,v))</code>.",
            "The correctness argument needs <b>non-negative edges</b>. A negative one can undercut a node that's already settled.",
          ],
          "The closest node on the frontier is already optimal: settle it, then relax its edges.",
        ),
      );
    },
  });
})();

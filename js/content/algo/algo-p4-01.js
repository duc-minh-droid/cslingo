/* Phase 4 — Minimum Spanning Trees: cut property, Prim vs Kruskal */
(function () {
  const partScope = (NIC.shared.algoP4 = NIC.shared.algoP4 || {});

  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;

  // two groups of towns and the four cables that cross the cut between them (each cable is tappable)
  const cutPick = () => {
    const at = { A: [70, 70], B: [70, 190], C: [350, 45], D: [350, 130], E: [350, 215] };
    const cables = [
      ["A", "C", 6],
      ["A", "D", 3],
      ["B", "D", 8],
      ["B", "E", 4],
    ];
    const wires = cables.map(([a, b, w]) => {
      const [x1, y1] = at[a],
        [x2, y2] = at[b],
        lx = x1 + (x2 - x1) * 0.62,
        ly = y1 + (y2 - y1) * 0.62;
      return `<g data-pick="Cable ${a} to ${b}" aria-label="Cable ${a} to ${b}, weight ${w}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--line-2)" stroke-width="3"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="22"/><rect x="${lx - 14}" y="${ly - 12}" width="28" height="22" rx="11" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/><text x="${lx}" y="${ly + 4}" text-anchor="middle" style="font:900 13px var(--sans);fill:var(--ink)">${w}</text></g>`;
    });
    const dots = Object.entries(at).map(
      ([k, [x, y]]) =>
        `<circle cx="${x}" cy="${y}" r="19" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="font:900 15px var(--sans);fill:var(--ink)">${k}</text>`,
    );
    return `<svg viewBox="0 0 420 260" role="group" aria-label="Towns A and B on one side of a dashed cut and C, D and E on the other. Four cables cross it: A to C weight 6, A to D weight 3, B to D weight 8, B to E weight 4"><rect x="20" y="25" width="110" height="210" rx="26" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/><rect x="290" y="12" width="110" height="236" rx="26" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/><line x1="210" y1="6" x2="210" y2="254" stroke="var(--rose)" stroke-width="3" stroke-dasharray="8 6"/>${wires.join("")}${dots.join("")}</svg>`;
  };

  const POS = { A: [70, 150], B: [185, 55], C: [215, 215], D: [345, 80], E: [415, 200] };
  const EDGES = [
    ["A", "B", 4],
    ["A", "C", 3],
    ["B", "C", 2],
    ["B", "D", 5],
    ["C", "D", 6],
    ["C", "E", 7],
    ["D", "E", 1],
  ];
  // MST = {D-E 1, B-C 2, A-C 3, B-D 5} = 11
  const nodes = (sub = {}, colorOf = () => null) =>
    Object.fromEntries(Object.entries(POS).map(([k, [x, y]]) => [k, { x, y, c: colorOf(k), sub: sub[k] }]));
  const ek = (a, b) => `${a}-${b}`;

  // Kruskal: sorted edges, union-find — record every decision (accept or reject) for the stepper
  function kruskalEvents() {
    const comp = Object.fromEntries(Object.keys(POS).map((n) => [n, n]));
    const find = (x) => (comp[x] === x ? x : (comp[x] = find(comp[x])));
    return EDGES.slice()
      .sort((a, b) => a[2] - b[2])
      .map(([a, b, w]) => {
        const ra = find(a),
          rb = find(b),
          ok = ra !== rb;
        if (ok) comp[ra] = rb;
        return {
          e: [a, b, w],
          ok,
          groups: Object.values(
            Object.keys(POS).reduce((g, n) => ((g[find(n)] = (g[find(n)] || []).concat(n)), g), {}),
          ).map((x) => x.join("")),
        };
      });
  }
  // Prim from A: the cheapest edge leaving the tree each step
  function primEvents() {
    const inT = new Set(["A"]),
      ev = [];
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
      {
        t: "The problem: connect everything, cheaply",
        b: `<p>Think of towns (nodes) and possible cable routes (edges, with costs). You want every town connected, <b>directly or indirectly</b>, for the least total cost.</p><p>The answer is always a <b>tree</b>: n − 1 edges and no loops. A loop would mean one of its cables is unnecessary.</p>`,
        v: F.compare(
          { title: "Spanning tree", c: "teal", body: "5 nodes, <b>4 edges</b>, no cycles, everything reachable" },
          {
            title: "Not a tree",
            c: "rose",
            body: "a cycle means one edge is redundant: remove it and the rest stays connected",
          },
        ),
      },
      {
        t: "Cut the graph in two",
        b: `<p>A <b>cut</b> splits the nodes into two groups. The edges that cross the split are the only bridges between them, so the tree <b>must</b> use at least one.</p>`,
        v:
          F.graph({
            nodes: nodes({}, (k) => (k === "A" ? "violet" : null)),
            edges: EDGES,
            hl: { "A-B": "amber", "A-C": "amber" },
            w: 480,
            h: 260,
          }) + `<div class="fig-cap">Cut {A} | {B, C, D, E}: only A–B (4) and A–C (3) cross it.</div>`,
      },
      {
        t: "The cheapest crossing edge is safe",
        b: `<p>Suppose some tree used A–B (4) instead of A–C (3). Swap them. Everything stays connected, and the total drops by 1. So the cheapest crossing edge is always part of some minimum tree.</p><span class="key">This one fact is why Prim and Kruskal are provably correct, not just good guesses.</span>`,
        v: F.compare(
          { title: "Tree using A–B (4)", c: "rose", body: "total = T + 4" },
          { title: "Swap to A–C (3)", c: "teal", body: "total = T + 3: <b>strictly cheaper</b>, still connected" },
        ),
        c: {
          type: "pick",
          q: "The dashed line is a cut: it splits the towns into {A, B} and {C, D, E}, and four cables cross it. Tap the cable that is <b>guaranteed</b> to be in some minimum spanning tree.",
          fig: cutPick(),
          a: "Cable A to D",
          hint: "Picture a tree that uses a heavier crossing cable. Could you swap it for another crossing cable and only get cheaper?",
          why: "The lightest edge across a cut is always safe. Any spanning tree using one of the heavier crossing cables (6, 8 or 4) can swap to the 3 and only get cheaper, and it stays connected.",
        },
      },
      {
        t: "The flip side: the heaviest edge in a cycle",
        b: `<p>In any cycle, the <b>heaviest</b> edge is never needed. The rest of the cycle already connects its two ends.</p><p>A–B–C is a cycle (4, 2, 3), so A–B (4) can go.</p>`,
        v: F.graph({
          nodes: { A: [60, 130], B: [190, 40], C: [210, 170] },
          edges: [
            ["A", "B", "4 ✗", "rose"],
            ["B", "C", 2, "teal"],
            ["A", "C", 3, "teal"],
          ],
          w: 300,
          h: 200,
        }),
        c: {
          q: "Why is it correct for Kruskal to skip an edge that would close a cycle?",
          o: ["It prunes randomly", "Its two ends are already connected", "It isn't. Kruskal is approximate"],
          a: 1,
          why: "A tree needs exactly n − 1 edges and no cycles, so a cycle edge is pure extra cost.",
        },
      },
    ],
    guide: [
      "Look at the dashed red line and click the <i>cheapest</i> edge crossing it.",
      "Solve all three cuts. Each answer is a forced MST edge.",
      "Say the rule out loud: lightest across a cut is safe, heaviest on a cycle is never needed.",
    ],
  };

  N.register({
    id: "a4-cut",
    subject: "algo",
    lecture: 4,
    order: 1,
    num: "4.1",
    title: "The cut property",
    blurb: "A dashed line splits the graph. Find the edge the MST is forced to use.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const CUTS = [
        { x: 128, left: ["A"], safe: "A-C", txt: "{A} | {B, C, D, E}" },
        { x: 290, left: ["A", "B", "C"], safe: "B-D", txt: "{A, B, C} | {D, E}" },
        { x: 385, left: ["A", "B", "C", "D"], safe: "D-E", txt: "{A, B, C, D} | {E}" },
      ];
      let ci = 0;
      const found = [];
      const card =
        el(`<div class="card"><div class="card-head"><h3>Cut <span id="ct" class="mono"></span></h3><span class="faint">click the cheapest crossing edge</span><span style="flex:1"></span><div class="boss-dots" id="dots" style="margin:0">${CUTS.map((_, i) => `<button disabled>${i + 1}</button>`).join("")}</div></div>
        <div class="fig-wrap" id="svg"></div><div class="callout" id="fb" style="display:none"></div></div>`);
      root.appendChild(card);
      const crossing = (cut) => EDGES.filter(([a, b]) => cut.left.includes(a) !== cut.left.includes(b));
      function draw() {
        const cut = CUTS[ci],
          hl = {};
        crossing(cut).forEach(([a, b]) => (hl[ek(a, b)] = "amber"));
        found.forEach((k) => (hl[k] = "teal"));
        qs("#ct", card).textContent = cut.txt;
        qs("#svg", card).innerHTML = F.graph({
          nodes: nodes({}, (k) => (cut.left.includes(k) ? "violet" : null)),
          edges: EDGES,
          hl,
          w: 480,
          h: 270,
        });
        const svgEl = qs("#svg svg", card);
        svgEl.insertAdjacentHTML(
          "afterbegin",
          `<line x1="${cut.x}" y1="0" x2="${cut.x}" y2="270" stroke="var(--rose)" stroke-width="2" stroke-dasharray="8 6"/>`,
        );
        qsa("#svg .draw", card).forEach((d) => d.classList.remove("draw"));
        crossing(cut).forEach(([a, b, w]) => {
          const [x1, y1] = POS[a],
            [x2, y2] = POS[b];
          svgEl.insertAdjacentHTML(
            "beforeend",
            `<circle cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" r="22" fill="transparent" style="cursor:pointer" data-e="${ek(a, b)}" data-w="${w}"><title>${a}–${b} (${w})</title></circle>`,
          );
        });
        qsa("[data-e]", svgEl).forEach((h) => h.addEventListener("click", () => answer(h.dataset.e, +h.dataset.w)));
        qsa("#dots button", card).forEach((b, i) => {
          b.className = i < ci || (found.length === CUTS.length && i === ci) ? "ok" : i === ci ? "cur" : "";
        });
      }
      function answer(k, w) {
        const cut = CUTS[ci],
          fb = qs("#fb", card),
          [a, b] = k.split("-");
        fb.style.display = "block";
        if (k === cut.safe) {
          if (!found.includes(k)) found.push(k);
          fb.className = "callout teal";
          fb.innerHTML = `<b>Safe edge: ${a}–${b} (${w}).</b> It's the cheapest bridge across this cut, so every minimum spanning tree can use it.`;
          N.fx.pop(fb);
          if (ci < CUTS.length - 1) {
            ci++;
            life.timeout(draw, 1100);
          } else {
            draw();
            fb.innerHTML += `<br>All three cuts solved. Together with B–C (2), they give the MST {D–E 1, B–C 2, A–C 3, B–D 5} = <b>11</b>.`;
            N.fx.celebrate(fb);
          }
        } else {
          fb.className = "callout rose";
          fb.innerHTML = `${a}–${b} costs ${w}, but there's a cheaper edge crossing this cut. Look again.`;
          N.fx.shake(fb);
        }
      }
      draw();
      root.appendChild(
        predict({
          id: "a4-cut-1",
          q: "Remove any edge from a minimum spanning tree and the tree splits into two groups: that's a cut. What must be true of the removed edge?",
          opts: [
            "It was the longest edge in the tree",
            "It was the lightest edge crossing that cut",
            "Nothing in particular can be said about it",
          ],
          a: 1,
          why: "If a cheaper edge crossed the same cut, swapping it in would give a cheaper spanning tree, which contradicts 'minimum'.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Cut property:</b> the lightest edge across a cut is always safe.",
            "<b>Cycle property:</b> the heaviest edge on a cycle is never needed.",
            "Prim and Kruskal are both greedy uses of the cut property, and that's their correctness proof.",
          ],
          "Lightest across a cut is forced in; heaviest on a cycle is dead weight.",
        ),
      );
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
      const hit = h.g.querySelector(".rn-base").cloneNode();
      hit.setAttribute("class", "rn-hit");
      hit.removeAttribute("marker-end");
      h.g.insertBefore(hit, h.g.firstChild);
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
  }
  function mstDraw(g, W, f, c) {
    NAMES.forEach((n) => {
      const h = g.node(n),
        st = f.newNode === n ? "s-cur" : f.inTree.includes(n) ? "s-done" : "";
      h.g.setAttribute("class", `rn-node ${st}`);
      if (f.tags) F.rn.text(c, h.tag, f.tags[n]);
      if (f.newNode === n && (!c.prev || c.prev.newNode !== n)) F.rn.pulse(c, h.body);
    });
    W.forEach(([a, b]) => {
      const k = g.key(a, b),
        h = g.edge(a, b),
        tree = f.tree.includes(k);
      h.g.classList.toggle("try", f.cands.includes(k) || (f.edge === k && !tree));
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
      const inT = ["A"],
        tree = [];
      const crossing = () => W.filter(([a, b]) => inT.includes(a) !== inT.includes(b)).sort((x, y) => x[2] - y[2]);
      const snap = (x) => ({
        inTree: inT.slice(),
        tree: tree.slice(),
        rejected: [],
        cands: crossing().map(([a, b]) => ek(...[a, b].sort())),
        ...x,
      });
      yield snap({
        cap: "Start with the tree <b>{A}</b>. The orange dashed edges cross from the tree to the rest of the graph.",
        line: 0,
      });
      for (let pick = 1; inT.length < NAMES.length; pick++) {
        const cr = crossing(),
          [a, b, w] = cr[0],
          nu = inT.includes(a) ? b : a,
          k = ek(...[a, b].sort());
        const ties = cr.filter((e) => e[2] === w).map(([x, y]) => ek(...[x, y].sort()));
        const ask =
          pick === 2 || pick === 3
            ? {
                q: "Which edge does Prim add next? Tap it.",
                pick: ".rn-edge.rn-todo",
                a: ties,
                why: `The cheapest edge crossing out of the tree: <b>${nice(k)} (${w})</b>.`,
              }
            : null;
        inT.push(nu);
        tree.push(k);
        const done = inT.length === NAMES.length;
        yield snap({
          edge: k,
          newNode: nu,
          done,
          ask,
          line: 2,
          mood: done ? "love" : "happy",
          cap: `Cheapest crossing edge: <b>${nice(k)} (${w})</b>. Add it, and <b>${nu}</b> joins the tree. Total so far <b>${sumW(W, tree)}</b>.`,
        });
      }
      yield snap({
        done: true,
        cands: [],
        line: 3,
        mood: "love",
        cap: `Every node is in. The minimum spanning tree has <b>${tree.length}</b> edges and total weight <b>${sumW(W, tree)}</b>.`,
      });
    }
    F.run(box, life, {
      code: [
        "tree = {A}",
        "look at edges with exactly one end in the tree",
        "add the cheapest one and its new node",
        "repeat until every node is in",
      ],
      build: (stage, api) => mstScene(stage, api, W, "prim"),
      draw: (g, f, c) => mstDraw(g, W, f, c),
      frames,
    });
  }
  Object.assign(partScope, {
    EDGES,
    NAMES,
    ek,
    kruskalEvents,
    mstDraw,
    mstScene,
    nice,
    nodes,
    primEvents,
    primRun,
    sumW,
  });
})();

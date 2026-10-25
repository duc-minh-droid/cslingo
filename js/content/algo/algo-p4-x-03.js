/* algo-p4-x-03: Phase 4 coverage pass: 4.6 correctness proof, 4.7 running time. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const L = N.LESSONS;
  const F = N.fig;
  const px = (NIC.shared.algoP4x = NIC.shared.algoP4x || {});
  const { K } = px;

  /* ============ 4.6 Why Prim and Kruskal are correct ============ */
  // prettier-ignore
  const G6 = { A: [50, 70], B: [160, 40], C: [270, 70], D: [50, 200], E: [160, 230], F: [270, 200] };
  // prettier-ignore
  const E6 = [["A", "B", 6], ["B", "C", 5], ["A", "D", 4], ["B", "E", 9], ["C", "F", 3], ["D", "E", 7], ["E", "F", 8], ["A", "E", 10]];
  // each scenario: X (the violet side of the cut), e (the lightest edge across it, not in T) and a spanning tree T without e
  // prettier-ignore
  const SWAPS = [
    { X: ["A", "D"], e: "A-B", T: ["A-D", "D-E", "B-E", "E-F", "C-F"] },   // cycle A-D-E-B-A; only D-E crosses the cut
    { X: ["C", "F"], e: "B-C", T: ["A-B", "B-E", "E-F", "C-F", "A-D"] },   // cycle B-E-F-C-B; only E-F crosses
    { X: ["E"], e: "D-E", T: ["A-B", "A-E", "E-F", "C-F", "A-D"] },        // cycle D-A-E-D; A-E crosses
  ];
  // prettier-ignore
  const w6 = (k) => { const [a, b] = k.split("-"); return E6.find((x) => K(x[0], x[1]) === K(a, b))[2]; };
  // prettier-ignore
  const crosses = (k, X) => { const [a, b] = k.split("-"); return X.includes(a) !== X.includes(b); };
  // prettier-ignore
  const pathIn = (T, a, b) => { // edges of the unique path a..b in tree T (list of "x-y" keys)
    const adj = {}; T.forEach((k) => { const [x, y] = k.split("-"); (adj[x] = adj[x] || []).push([y, k]); (adj[y] = adj[y] || []).push([x, k]); });
    const prev = { [a]: null }, q = [a];
    while (q.length) { const x = q.shift(); (adj[x] || []).forEach(([y, k]) => { if (!(y in prev)) { prev[y] = [x, k]; q.push(y); } }); }
    const out = []; let c = b; while (prev[c]) { out.push(prev[c][1]); c = prev[c][0]; } return out;
  };
  // prettier-ignore
  const cutFig = (X, hl, w = 330, h = 270, maxH) => F.graph({ nodes: Object.fromEntries(Object.entries(G6).map(([k, v]) => [k, { x: v[0], y: v[1], c: X.includes(k) ? "violet" : null }])), edges: E6, hl, w, h, maxH });

  /** Stages of the exchange proof on the six-town graph (X = {A, D}, e = A-B, f = D-E). */
  function proofFig(host, start) {
    const T = ["A-D", "D-E", "B-E", "E-F", "C-F"];
    const ST = [
      [
        "Tree T",
        {
          hl: Object.fromEntries(T.map((k) => [k, "blue"])),
          t: "T (blue) links every town but does not use A–B. Its total is 31.",
        },
      ],
      [
        "Add e",
        {
          hl: { ...Object.fromEntries(T.map((k) => [k, "blue"])), "A-B": "amber" },
          t: "Add e = A–B (orange). A and B were already joined through T, so this closes a loop.",
        },
      ],
      [
        "The loop",
        {
          hl: { "A-D": "rose", "D-E": "rose", "B-E": "rose", "A-B": "rose", "E-F": "blue", "C-F": "blue" },
          t: "The loop A–D–E–B–A (red) leaves the violet group at A–B, so it must re-enter it at D–E: that is f.",
        },
      ],
      [
        "Swap",
        {
          hl: { "A-D": "blue", "B-E": "blue", "E-F": "blue", "C-F": "blue", "A-B": "teal" },
          t: "Drop f = D–E (7), keep e = A–B (6). Still one connected network, now costing 30: cheaper than T.",
        },
      ],
    ];
    host.innerHTML = "";
    const box = el(
      `<div><div class="controls" data-a></div><div data-g></div><p class="mono" data-t style="min-height:3.6em;margin:6px 0 0"></p></div>`,
    );
    host.appendChild(box);
    const draw = (k) => {
      qs("[data-g]", box).innerHTML = cutFig(["A", "D"], ST[+k][1].hl, 330, 270);
      qs("[data-t]", box).textContent = ST[+k][1].t;
      N.fx.play(qs("[data-g]", box));
    };
    qs("[data-a]", box).appendChild(
      N.seg(
        ST.map((s, i) => [String(i), `${i + 1}. ${s[0]}`]),
        start,
        draw,
      ),
    );
    draw(start);
  }
  // prettier-ignore
  L["a4-proof"] = {
    sum: "Both algorithms rest on one lemma: the lightest edge across any cut belongs to the minimum spanning tree. The proof is an <b>exchange argument</b>: take any tree without that edge, swap one edge for it, and the total drops.",
    steps: [
      { t: "What “totally correct” means", b: `<p>Prim and Kruskal are designed to meet the specification: for every valid input they must deliver a <b>tree</b> whose total weight is as small as possible.</p><p>To be <b>totally correct</b>, an algorithm must satisfy the input-output relation for <b>every</b> valid input (and finish). Passing a few examples is not a proof.</p>`,
        v: F.flow(["Any weighted graph", { t: "Prim or Kruskal", c: "violet" }, { t: "A minimum spanning tree", s: "for every input", c: "teal" }]),
        c: { q: "Prim gives the right answer on 1000 test graphs. What can you conclude?", o: ["It is totally correct", "It passed those tests; only a proof covers every input", "It is correct on every graph with up to 1000 vertices"], a: 1, why: "Tests can find bugs but cannot show correctness for all inputs. The lemma below is what gives the proof." } },
      { t: "The lemma", b: `<p>Take any network. Split the towns into two groups, neither empty. Look at the cables stretching across the gap: the cheapest of them is <b>always</b> part of the cheapest network. The next two steps show why. Pick a split below.</p><details class="math-more"><summary>Show the maths</summary><p><b>Lemma.</b> In a weighted graph $G = (V, E, w)$, let $X$ be a <b>non-empty proper subset</b> of $V$, and let $e$ be the shortest edge joining a vertex in $X$ to a vertex in $V \\setminus X$. Then $e$ must be part of the minimum spanning tree.</p><p>Here $X$ is the violet group. The edges that cross from violet to white are the candidates; $e$ is the lightest.</p></details>`,
        v: (box) => NIC.shared.algoP4.cutExplorer(box, { pos: G6, edges: E6, cuts: [["A", "D"], ["C", "F"], ["E"], ["A", "B", "D"]], w: 330, h: 270 }),
        c: { q: "In the figure, which edge does the lemma force into the MST?", o: ["D–E (7)", "A–B (6)", "A–E (10)"], a: 1, why: "A–B is the lightest of the three edges crossing between {A, D} and the rest." } },
      { t: "Proof, part 1: add e to any tree", b: `<p>Take any network T that does <i>not</i> use the cheapest crossing cable e. Now add e to it. The two ends of e were already joined through T, so adding e closes a loop. A loop that crosses the gap at e has to come back, so it must cross the gap at least once more, along some other cable f of T. Step through it.</p><details class="math-more"><summary>Show the maths</summary><p>Suppose $T$ is a spanning tree that <b>does not contain $e$</b>; we will show $T$ is not minimal. Adding $e$ to $T$ gives a <b>cycle</b>. That cycle crosses the border of $X$ at $e$ and, since a cycle must come back, <b>at least one other edge $f$</b>.</p></details>`,
        v: (box) => proofFig(box, "0"),
        c: { q: "Why must the cycle contain a second edge across the border of X?", o: ["It returns to its start, so it crosses back", "Every cycle in a graph must have at least four edges", "Because the edge f is always lighter than the edge e"], a: 0, why: "A closed loop that leaves X must re-enter it, so it crosses the border an even number of times, at least twice." } },
      { t: "Proof, part 2: swap e for f", b: `<p>Now swap: remove f and keep e. Everything stays connected, because the rest of the loop still joins the two sides, and there are still the same number of cables. But e is cheaper than f, since e was the cheapest cable across the gap. So T was never the cheapest, and every cheapest network must use e.</p><p>In the example, swapping D–E (7) for A–B (6) turns a network costing 31 into one costing 30.</p><details class="math-more"><summary>Show the maths</summary><p>Since $e$ is the <b>shortest</b> edge across the border, $w(e) < w(f)$. Remove $f$ from $T$ and put $e$ in its place. The new tree $T' = T - f + e$ is still connected and still has $n - 1$ edges, so it is a spanning tree, and it is <b>cheaper</b> than $T$.</p><p>$T$ was an arbitrary tree without $e$, so every minimum spanning tree must contain $e$.</p></details>`,
        v: (box) => proofFig(box, "3"),
        c: { q: "Why is T′ = T − f + e still a spanning tree?", o: ["Taking out f splits T in two and e rejoins the halves", "Because e is lighter than f, which makes the tree valid", "Because T′ has one more edge than T has, which helps"], a: 0, why: "f lies on the cycle, so taking it out leaves T connected through the rest of the cycle. Adding e keeps the edge count at n − 1 with no cycle." } },
      { t: "Prim is correct", b: `<p>At each stage Prim adds the shortest edge joining the growing tree to the vertices outside it. Take $X$ = the tree's vertices: by the lemma, that edge belongs to the MST.</p><p>So the output is always contained in the minimum spanning tree. And Prim only stops when <b>every vertex</b> is in, so the output touches every vertex, and must <b>be</b> the minimum spanning tree.</p>`,
        v: F.cells([{ v: "{A}", c: "violet" }, "→", { v: "{A C}", c: "violet" }, "→", { v: "{A C B}", c: "violet" }, "→", { v: "all of V", c: "teal" }], { label: "each X" }),
        c: { q: "Which choice of X does the lemma use when Prim picks its next edge?", o: ["X = the vertices already in the tree", "X = the vertex with the smallest label", "X = the endpoints of the lightest edge in the graph"], a: 0, why: "Prim's rule is exactly “the lightest edge between the tree and the rest”, which is the lemma with X as the tree." } },
      { t: "Kruskal is correct", b: `<p>Part-way through, Kruskal holds a cycle-free subgraph $S$, possibly several components. It adds the shortest edge that keeps $S$ cycle-free, so the edge joins <b>two different components</b>.</p><p>Edges skipped earlier had both ends inside one component, and components only merge, so a skipped edge never crosses the border of a component. Hence the new edge is the shortest edge leaving one component: take $X$ as that component. By the lemma it is in the MST. Kruskal also stops only when the tree is complete, so it is correct.</p>`,
        v: F.graph({ nodes: { A: { x: 60, y: 120, c: "violet" }, B: { x: 160, y: 60, c: "violet" }, C: { x: 270, y: 120 }, D: { x: 370, y: 60 } }, edges: [["A", "B", 3, "violet"], ["B", "C", 5, "amber"], ["C", "D", 4], ["A", "C", 7]], w: 430, h: 190, maxH: 170 }) + `<div class="fig-cap">Component X = {A, B} (violet). The edges leaving it are B–C (5) and A–C (7). The lightest, B–C, is forced into the MST by the lemma.</div>`,
        c: { q: "Why can a rejected edge never be the lightest edge leaving a component later on?", o: ["Components only merge, so it stays inside one", "Rejected edges are deleted from the graph for good", "Rejected edges are always the heaviest ones overall"], a: 0, why: "It was rejected because both ends shared a group. Groups only grow, so those ends stay together and the edge never crosses a component's border." } },
      { t: "The caveat: equal weights", b: `<p>The proof leans on “the shortest edge”, which assumes <b>no two edges have exactly the same weight</b>. That is easy to meet in real data.</p><p>If weights tie, the MST may not be unique, but the proof can be adapted to show Prim and Kruskal still deliver <b>a</b> minimum spanning tree. The details are fiddly and left out.</p>`,
        v: F.frames([
          { t: "Drop AB", v: F.graph({ nodes: { A: [30, 90], B: [130, 90], C: [80, 20] }, edges: [["A", "B", 2, "dim"], ["B", "C", 2, "teal"], ["A", "C", 2, "teal"]], w: 160, h: 120, maxH: 110, r: 14 }) },
          { t: "Drop BC", v: F.graph({ nodes: { A: [30, 90], B: [130, 90], C: [80, 20] }, edges: [["A", "B", 2, "teal"], ["B", "C", 2, "dim"], ["A", "C", 2, "teal"]], w: 160, h: 120, maxH: 110, r: 14 }) },
          { t: "Drop AC", v: F.graph({ nodes: { A: [30, 90], B: [130, 90], C: [80, 20] }, edges: [["A", "B", 2, "teal"], ["B", "C", 2, "teal"], ["A", "C", 2, "dim"]], w: 160, h: 120, maxH: 110, r: 14 }) },
        ]),
        c: { q: "A triangle has all three edges of weight 2. How many different minimum spanning trees does it have?", o: ["1", "3", "6"], a: 1, why: "Every spanning tree uses two of the three edges, and all of them cost 4. There are 3 ways to choose which edge to drop." } },
    ],
    guide: ["Look at the violet group X. Click the tree edge that should be removed so that the new edge can take its place.", "Solve all three swaps. Each one shows the cheaper tree.", "Try clicking an edge that is not on the cycle, or not across the cut, and read why it fails."],
  };
  // prettier-ignore
  N.register({
    id: "a4-proof", subject: "algo", lecture: 4, order: 6, num: "4.6",
    title: "Why Prim and Kruskal are correct",
    blurb: "The cut lemma and its exchange proof, then why each algorithm inherits it.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let si = 0; const solved = [];
      const card = el(`<div class="card"><div class="card-head"><h3>Swap <span id="ct" class="mono"></span></h3><span class="faint">click the tree edge to remove</span><span style="flex:1"></span><div class="boss-dots" id="dots" style="margin:0">${SWAPS.map((_, i) => `<button disabled>${i + 1}</button>`).join("")}</div></div>
        <div class="fig-wrap" id="svg"></div><div class="mono dim" id="st" style="margin-top:8px;min-height:22px"></div><div class="callout" id="fb" style="min-height:76px"></div></div>`);
      root.appendChild(card);
      const tot = (T) => T.reduce((s, k) => s + w6(k), 0);
      function say(cls, html) { const fb = qs("#fb", card); fb.className = "callout " + cls; fb.innerHTML = html; }
      function draw(T = SWAPS[si].T, swapped = false) {
        const S = SWAPS[si], hl = {};
        T.forEach((k) => (hl[k] = swapped && k === S.e ? "teal" : "blue"));
        if (!swapped) hl[S.e] = "amber";
        qs("#ct", card).textContent = `${si + 1} of ${SWAPS.length}: X = {${S.X.join(", ")}}, e = ${S.e.replace("-", "–")} (${w6(S.e)})`;
        qs("#svg", card).innerHTML = cutFig(S.X, hl, 330, 270);
        const s = qs("#svg svg", card);
        qsa(".draw, .fi", s).forEach((d) => d.classList.remove("draw", "fi"));
        if (!swapped) T.forEach((k) => { const [a, b] = k.split("-"), [x1, y1] = G6[a], [x2, y2] = G6[b]; s.insertAdjacentHTML("beforeend", `<circle cx="${(x1 + x2) / 2}" cy="${(y1 + y2) / 2}" r="20" fill="transparent" style="cursor:pointer" data-t="${k}"><title>${a}–${b}</title></circle>`); });
        qsa("[data-t]", s).forEach((h) => h.addEventListener("click", () => pick(h.dataset.t)));
        qs("#st", card).innerHTML = swapped ? `New tree T′ total <b>${tot(T)}</b>` : `Tree T (blue) total <b>${tot(T)}</b> · orange e is not in T`;
        qsa("#dots button", card).forEach((b, i) => { b.className = solved.includes(i) ? "ok" : i === si ? "cur" : ""; });
      }
      function pick(g) {
        const S = SWAPS[si], [ea, eb] = S.e.split("-"), cyc = pathIn(S.T, ea, eb), nt = S.T.filter((k) => k !== g).concat(S.e), gn = g.replace("-", "–");
        if (!cyc.includes(g)) { say("rose", `<b>${gn} is not on the cycle.</b> The cycle is made of e and the tree path between its ends. Removing ${gn} would leave that cycle in place and cut the tree apart.`); N.fx.shake(qs("#fb", card)); return; }
        if (crosses(g, S.X)) {
          if (!solved.includes(si)) solved.push(si);
          say("teal", `<b>${gn} (${w6(g)}) crosses the border, and e is lighter.</b> Swapping gives a spanning tree costing ${tot(nt)} instead of ${tot(S.T)}: cheaper by ${w6(g) - w6(S.e)}. So T was not minimal.`);
          N.fx.pop(qs("#fb", card)); draw(nt, true);
          if (si < SWAPS.length - 1) life.timeout(() => { si++; draw(); say("blue", "Next swap. Remove the edge on the cycle that crosses the border of the violet group."); }, 2400);
          else say("teal", `<b>${gn} (${w6(g)}) crosses the border, and e is lighter.</b> New total ${tot(nt)} against ${tot(S.T)}. All three swaps made the tree cheaper: that is the lemma at work.`);
        } else if (tot(nt) < tot(S.T)) {
          say("amber", `${gn} (${w6(g)}) is on the cycle, and this swap does happen to be cheaper, but ${gn} does not cross the border. The lemma only <i>guarantees</i> a saving for an edge that crosses it.`);
        } else {
          say("rose", `${gn} (${w6(g)}) is on the cycle but does not cross the border, and e (${w6(S.e)}) is not lighter. The swap would cost ${tot(nt)}, more than ${tot(S.T)}. Remove the edge that crosses the violet border instead.`);
          N.fx.shake(qs("#fb", card));
        }
      }
      draw(); say("blue", "Adding e (orange) to the blue tree makes one cycle. Click the tree edge on that cycle that crosses the border of the violet group.");
      root.appendChild(predict({ id: "a4-proof-1", q: "In the exchange proof, why does e need to be the <i>lightest</i> edge across the cut, not just some edge across it?", opts: ["So the swap cannot make the tree dearer", "So that e is easy to find in the sorted edge list of the graph", "So that the cycle contains exactly three edges in total"], a: 0,
        why: "The whole argument is “replace f by e and the total drops”. That only works if e costs less than f. A heavier crossing edge could make the new tree more expensive." }));
      root.appendChild(predict({ id: "a4-proof-2", q: "A graph has two lightest edges across a cut with exactly the same weight. What does the proof (written for distinct weights) lose?", opts: ["The claim that e is in every MST, since a twin may replace it", "The guarantee that a spanning tree exists for the graph at all", "The ability to add the edge e to a spanning tree at all"], a: 0,
        why: "With a tie, swapping e for f no longer makes the tree strictly cheaper, only no worse. The MST can be non-unique, but a minimum tree containing e still exists." }));
      root.appendChild(takeaways([
        "<b>Lemma:</b> the lightest edge between X and the rest is in the MST. <b>Proof:</b> adding it to any other tree makes a cycle, and swapping out a crossing edge on that cycle gives a cheaper tree.",
        "<b>Prim</b>: X is the tree. <b>Kruskal</b>: X is a component. Both only ever take edges the lemma allows.",
        "Equal weights allow several MSTs; the algorithms still return one.",
      ], "Exchange argument: swap in the lightest crossing edge and the total can only fall."));
    },
  });

  /* ============ 4.7 Prim against Kruskal: running time ============ */
  // prettier-ignore
  const big = (x) => (x >= 1e6 ? (x / 1e6).toFixed(x >= 1e7 ? 0 : 1) + " M" : x >= 1e3 ? (x / 1e3).toFixed(x >= 1e4 ? 0 : 1) + " k" : String(Math.round(x)));
  /** Work as area: Prim is a square of V^2, Kruskal a square of E log V, drawn to the same scale. */
  function worksFig(host, { V, deg, free }) {
    host.innerHTML = "";
    const box = el(
      `<div><div class="controls" data-a></div><div data-g></div><p class="mono" data-t style="min-height:3.6em;margin:6px 0 0"></p></div>`,
    );
    host.appendChild(box);
    let d = deg;
    const draw = () => {
      const E = Math.min((V * (V - 1)) / 2, Math.round((V * d) / 2)),
        prim = (V - 1) ** 2,
        kr = E * Math.log2(V),
        hi = Math.max(prim, kr);
      const side = (x) => 170 * Math.sqrt(x / hi),
        sp = side(prim),
        sk = side(kr),
        kwin = kr < prim;
      const sq = (x, s, c, t, n) =>
        `<rect x="${x}" y="${190 - s}" width="${s}" height="${s}" rx="6" fill="color-mix(in srgb, var(${c}) 30%, var(--panel-2))" stroke="var(${c})" stroke-width="3"/><text x="${x + s / 2}" y="206" class="fig-sub" style="text-anchor:middle;fill:var(--text);font-size:13px;font-weight:700">${t}: ${big(n)}</text>`;
      qs("[data-g]", box).innerHTML =
        `<svg class="fig" viewBox="0 0 440 215" style="max-height:215px" role="img" aria-label="Two squares whose areas are the work of Prim and of Kruskal. ${kwin ? "Kruskal's is smaller" : "Prim's is smaller"}.">${sq(40, sp, "--violet", "Prim", prim)}${sq(250, sk, "--teal", "Kruskal", kr)}</svg>`;
      qs("[data-t]", box).innerHTML =
        `${V.toLocaleString("en-GB")} towns, ${E.toLocaleString("en-GB")} cables (about ${((2 * E) / V).toFixed(0)} per town). <b>${kwin ? "Kruskal" : "Prim"}</b> does about <b>${(hi / Math.min(prim, kr)).toFixed(1)}×</b> less work.`;
    };
    if (free) {
      const sl = N.slider("Roads per town", 2, 999, 1, d, (v) => String(v));
      sl.onInput((v) => ((d = v), draw()));
      qs("[data-a]", box).appendChild(
        N.seg(
          [
            ["3", "Road map (3)"],
            ["20", "Social network (20)"],
            ["999", "Complete graph"],
          ],
          "3",
          (v) => ((sl.value = d = +v), draw()),
        ),
      );
      qs("[data-a]", box).appendChild(sl);
    }
    draw();
  }
  // prettier-ignore
  L["a4-cost"] = {
    sum: "Prim's loops count vertices, so it costs <b>O(V²)</b> whatever the number of edges. Kruskal sorts the edges and costs <b>O(E log V)</b>. Which wins depends on how dense the graph is.",
    steps: [
      { t: "Prim: counting the loops", b: `<p>How long does Prim take? Each pass it scans the towns still outside the tree to choose one, then scans them again to update their notes. Fewer towns are left every pass, so the passes get cheaper, and stacked together they fill a square. The work grows like the square of the number of towns, whatever the number of cables. Slide to see it.</p><details class="math-more"><summary>Show the maths</summary><p>The outer loop runs $|V| - 1$ times. On pass $i$ the select loop scans $|V| - i$ vertices and the update loop $|V| - i - 1$. Adding up:</p>$$\\sum_{i=1}^{|V|-1} \\big[2(|V| - i) - 1\\big] = (|V| - 1)^2$$<p>Nothing here mentions $|E|$. Even a graph with a handful of edges costs $O(|V|^2)$.</p></details>`,
        v: (box) => px.primWork(box),
        c: { q: "Prim takes about 400 steps on 21 vertices. About how many on 42 vertices?", o: ["About 800", "About 1 600", "About 400 000"], a: 1, why: "Doubling the vertices quadruples a quadratic cost: 400 × 4 = 1 600 (exactly 41² = 1 681)." } },
      { t: "Kruskal: counting the work", b: `<p>Kruskal's bill has two parts. It sorts the cables (more cables, a longer list), then asks one quick “same group?” question per cable. Each question takes about as many steps as you can halve the number of towns before only one is left. So the work is roughly the number of cables times that halving count. Pick a size to compare a road map with a complete network.</p><details class="math-more"><summary>Show the maths</summary><p>Sorting the edges costs $O(|E| \\log |E|)$. The loop runs at most $|E|$ times, and each pass does two group lookups of cost $O(\\log |V|)$. So the total is $O(|E| \\log |E| + |E| \\log |V|)$.</p><p>Since $|E| \\le |V|^2/2$, we have $\\log |E| \\le 2 \\log |V|$, so the two terms are the same order: <b>$O(|E| \\log |V|)$</b>.</p></details>`,
        v: (box) => px.kruskalWork(box),
        c: { q: "A network keeps its towns but gains many more cables. What happens to Kruskal's work?", o: ["It stays the same, as the towns are unchanged", "It grows: there is more to sort and to check", "It falls, because a tree is easier to find"], a: 1, why: "Kruskal sorts the cables and may examine each one, so its work grows with the number of cables." } },
      { t: "Sparse graphs favour Kruskal", b: `<p>A road map is sparse: each junction has only a few roads. Prim (the plain-list version) still compares every town with every town, about a million steps for 1,024 towns, even though there are hardly any roads to look at. Kruskal only has to sort and check the roads themselves, about 2,000 of them, so around 20,000 steps.</p><p>In the picture each square's area is the work. Prim's violet square dwarfs Kruskal's teal one: about 50 times the work.</p><details class="math-more"><summary>Show the maths</summary><p>$|V| = 1024$ and $|E| = 2048$. Kruskal: about $2048 \\times 10 \\approx 20\\,000$ steps. Prim's array version: about $1024^2 \\approx 1\\,000\\,000$. Kruskal does around <b>50 times</b> less work.</p></details>`,
        v: (box) => worksFig(box, { V: 1024, deg: 4 }),
        c: { q: "A graph has 10 000 vertices and 15 000 edges. Which algorithm does less work?", o: ["Kruskal, by a large factor", "Prim, by a large factor", "They are about the same"], a: 0, why: "Kruskal: 15 000 × 13 ≈ 200 000 steps. Prim: 10 000² = 100 000 000. A factor of about 500." } },
      { t: "Dense graphs favour Prim", b: `<p>Now link every pair of 1,000 towns: nearly half a million cables. Kruskal has to sort them all, about five million steps. Prim does not care how many cables there are: it still needs only about a million. Now the teal square is the bigger one. (Prim with a priority queue instead of a plain list would match Kruskal; the version here is the simple one.)</p><details class="math-more"><summary>Show the maths</summary><p>$|E| \\approx 500\\,000$. Kruskal: about $500\\,000 \\times 10 = 5\\,000\\,000$ steps. Prim: about $1\\,000^2 = 1\\,000\\,000$. Prim wins by roughly a factor of five. Prim with a priority queue costs $O(|E| \\log |V|)$, like Kruskal; the array version is the one with $O(|V|^2)$.</p></details>`,
        v: (box) => worksFig(box, { V: 1000, deg: 999 }),
        c: { q: "Every one of 1 000 cities is linked to every other. Which is cheaper, Prim's array version or Kruskal?", o: ["Prim: roughly a million steps against about five million", "Kruskal: a half-million sort beats a million steps", "They cost exactly the same"], a: 0, why: "Prim stays at about V² = 1 000 000. Kruskal's sort of 500 000 edges costs about 5 000 000." } },
      { t: "Choosing: a rule of thumb", b: `<p>So which one? Compare the two squares. With few cables per town the teal square is small and Kruskal wins. When nearly every pair of towns is linked, the violet square is smaller and Prim wins. Both build the same tree, so only the cost differs. Choose a network, or slide the number of roads per town and watch the winner flip.</p><details class="math-more"><summary>Show the maths</summary><p>Compare $|V|^2$ with $|E| \\log |V|$. When $|E|$ is well below $|V|^2 / \\log |V|$, the graph is <b>sparse</b> and Kruskal does less work. When $|E|$ is close to $|V|^2$, it is <b>dense</b> and Prim's array version does less.</p><p>Both give the same tree, so the choice is purely about cost (and which data structures you have to hand).</p></details>`,
        v: (box) => worksFig(box, { V: 1000, deg: 3, free: true }),
        c: { q: "Two networks have the same number of vertices. One has far fewer edges. Which statement is true?", o: ["Prim's time changes, since fewer edges means less to scan", "Prim's array version costs about the same, but Kruskal gets cheaper", "Kruskal's time is the same, since it only depends on vertices"], a: 1, why: "Prim's array loops count vertices only. Kruskal's cost grows with the number of edges it must sort." } },
    ],
    guide: ["Move the sliders for the number of vertices and the average degree.", "Use the three buttons to jump to a road map, a social network and a complete graph.", "Watch which bar is shorter and by what factor.", "Answer the questions after the demo."],
  };
  // prettier-ignore
  N.register({
    id: "a4-cost", subject: "algo", lecture: 4, order: 7, num: "4.7",
    title: "Prim vs Kruskal: which is faster?",
    blurb: "Count each algorithm's steps and find where sparse and dense graphs swap the winner.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(`<div class="card"><div class="card-head"><h3>Step counts</h3><span class="faint">rule of thumb, constants ignored</span></div>
        <div class="controls" id="pre"></div><div class="controls" id="sl"></div><div id="out" style="min-height:150px"></div></div>`);
      root.appendChild(card);
      const sv = N.slider("Vertices V", 10, 1000, 10, 1000), sd = N.slider("Roads per vertex (average degree)", 2, 999, 1, 3);
      qs("#sl", card).appendChild(sv); qs("#sl", card).appendChild(sd);
      function draw() {
        const V = sv.value, E = Math.min((V * (V - 1)) / 2, Math.round((V * sd.value) / 2)), prim = (V - 1) * (V - 1), kr = E * Math.log2(V), r = kr > prim ? prim / kr : kr / prim;
        qs("#out", card).innerHTML = `<p class="mono dim">V = ${V}, E = ${E.toLocaleString("en-GB")} (${E >= (V * (V - 1)) / 2 ? "complete graph" : "average degree " + ((2 * E) / V).toFixed(1)})</p>` +
          F.bars([["Prim O(V²)", prim, "violet"], ["Kruskal O(E log V)", kr, "teal"]], { fmt: big, max: Math.max(prim, kr) }) +
          `<div class="callout ${kr < prim ? "teal" : "violet"}" style="margin-top:10px">${kr < prim ? "Kruskal" : "Prim"} does about <b>${(1 / r).toFixed(1)}× less</b> work here.</div>`;
        qsa("#out .fi", card).forEach((x) => x.classList.remove("fi"));
      }
      qs("#pre", card).appendChild(N.seg([["road", "Road map (3)"], ["social", "Social network (20)"], ["full", "Complete graph"]], "road", (v) => { sd.value = v === "road" ? 3 : v === "social" ? 20 : 999; draw(); }));
      sv.onInput(draw); sd.onInput(draw);
      draw();
      root.appendChild(predict({ id: "a4-cost-1", q: "A power grid has 50 000 substations, each linked to about 3 others. Which algorithm does less work?", opts: ["Kruskal: the edge count (about 75 000) is small", "Prim's array version: it needs no sorting", "Neither: both do about 50 000² steps"], a: 0,
        why: "Kruskal costs about 75 000 × 16 ≈ 1.2 million steps. Prim's array version costs about 50 000² = 2.5 billion. A sparse graph favours Kruskal." }));
      root.appendChild(predict({ id: "a4-cost-2", q: "You double the number of vertices of a very dense graph (links between nearly all pairs). Roughly how much more work does Prim's array version do?", opts: ["Twice as much", "Four times as much", "Eight times as much"], a: 1,
        why: "Its cost is (V − 1)², a quadratic, so doubling V quadruples the work." }));
      root.appendChild(takeaways([
        "Prim (arrays): <b>O(V²)</b>. It scans vertices, so edge count does not matter.",
        "Kruskal: <b>O(E log V)</b>. Sorting dominates, and log E and log V are the same order.",
        "Sparse graph: Kruskal. Nearly complete graph: Prim. Same tree either way.",
      ], "Count the loops, then compare V² with E log V."));
    },
  });
})();

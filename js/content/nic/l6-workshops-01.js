/* l6-workshops-01: Lecture 6 workshop 6.W, the program tree sandbox (no code). */
(function () {
  const N = NIC,
    { qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const sh = (NIC.shared.l6 = NIC.shared.l6 || {});
  const { mulberry, fn, tm, size, depth, nodesOf, mutate, randomProgram, treeSVG, clone, FN } = sh;

  const FS = ["+", "-", "*", "%"],
    TS = (r) => [() => "TIME", () => 1 + Math.floor(r() * 5)];
  const FUNCS = ["+", "-", "*", "%", ">"],
    LEAVES = ["TIME", 1, 2, 3, 4, 5, 7, 10];
  const isFn = (n) => !!n.kids;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const fmt = (v) => (Number.isInteger(v) ? String(v) : (+v).toFixed(2));
  /** parent A is the lecture's tree with its test the wrong way round; B is a small, different tree */
  const mkA = () => fn("-", fn("+", fn("*", tm(1), tm(3)), tm(4)), fn(">", tm(10), tm("TIME")));
  const mkB = () => fn("*", fn("+", tm("TIME"), tm(2)), tm(3));
  /** value at every node (pre-order, like the drawing), clamped like the kernel */
  const vals = (t, env) => {
    const out = [];
    (function go(n) {
      const id = out.length;
      out.push(0);
      const v = isFn(n) ? FN[n.op].f(...n.kids.map((k) => go(k))) : typeof n.v === "number" ? n.v : env[n.v];
      out[id] = Number.isFinite(v) ? Math.max(-1e6, Math.min(1e6, v)) : 1e6;
      return out[id];
    })(t);
    return out;
  };
  const at = (t, time) => vals(t, { TIME: time })[0];
  /** pre-order ids of the subtree rooted at id */
  const span = (t, id) => new Set(Array.from({ length: size(nodesOf(t)[id].node) }, (_, i) => id + i));

  function view(c, stage) {
    stage.innerHTML = `
      <div class="wk-card"><h3>Inputs and limit</h3><div class="wk-row" data-sl></div></div>
      <div class="wk-card"><h3>Two parent trees</h3>
        <div class="wk-grid2 nw6-pair"><div data-which="A"></div><div data-which="B"></div></div>
        <div class="wk-row nw6-acts"><button class="btn primary" data-mut>Mutate selected node</button><button class="btn" data-swap>Swap selected subtrees</button><button class="btn ghost" data-reset>Reset trees</button></div>
        <div class="wk-row nw6-pal" data-pal></div>
        <p class="nw6-note" data-note aria-live="polite"></p></div>
      <div class="wk-card"><h3>Children of the swap</h3><div data-kids></div></div>
      <div class="wk-card"><h3>Grow a random program</h3>
        <div class="wk-row"><button class="btn primary" data-grow>Grow a program</button><span class="nw6-meta" data-gmeta></span></div>
        <div data-grown></div></div>`;
    const sT = N.slider("TIME", 0, 15, 1, c.t),
      sD = N.slider("Max depth", 2, 5, 1, c.maxD);
    sT.onInput((v) => ((c.t = v), paint(c)));
    sD.onInput((v) => ((c.maxD = v), paint(c)));
    qs("[data-sl]", stage).append(sT, sD);
    c.q = (s) => qs(s, stage);
  }

  /** one tree with its numbers: size, depth, output at TIME; nodes are buttons */
  function treeBox(c, t, sel, tag, clickable) {
    const out = at(t, c.t);
    return `<div class="nw6-tbox"><div class="nw6-meta"><b>${tag}</b> ${plural(size(t), "node")} · depth ${depth(t)} · output at TIME ${c.t}: <b>${fmt(out)}</b></div>${treeSVG(t, { vals: vals(t, { TIME: c.t }), sel, showDepth: true, clickable })}</div>`;
  }

  function paint(c) {
    const keep =
      document.activeElement && document.activeElement.closest && document.activeElement.closest("[data-id]");
    const spot = keep &&
      keep.closest("[data-which]") && { w: keep.closest("[data-which]").dataset.which, id: keep.dataset.id };
    ["A", "B"].forEach((w) => {
      const box = qs(`[data-which="${w}"]`, c.stage),
        sel = c.sel[w] == null ? new Set() : span(c[w], c.sel[w]);
      box.innerHTML = treeBox(c, c[w], sel, `Tree ${w}`, true);
      qsa("g[data-id]", box).forEach((g) => {
        g.setAttribute("tabindex", "0");
        g.setAttribute("role", "button");
        g.setAttribute("aria-label", `Select node ${g.textContent.trim()}`);
      });
    });
    const g0 = spot && qs(`[data-which="${spot.w}"] g[data-id="${spot.id}"]`, c.stage);
    if (g0) g0.focus();
    const cur = c.sel[c.act] == null ? null : nodesOf(c[c.act])[c.sel[c.act]];
    const opts = cur ? (isFn(cur.node) ? FUNCS : LEAVES) : [];
    c.q("[data-pal]").innerHTML = cur
      ? `<small>Edit the selected node (tree ${c.act}):</small>` +
        opts.map((o) => `<button class="btn small" data-set="${o}">${o === ">" ? "&gt;" : o}</button>`).join("")
      : `<small>Click a node (or tab to it and press Enter) to select it and everything below it.</small>`;
    c.q("[data-note]").innerHTML = c.msg;
    const k = c.kids;
    c.q("[data-kids]").innerHTML = !k
      ? `<p class="dim">Select a node in <b>both</b> trees, then press <b>Swap selected subtrees</b>.</p>`
      : `<div class="wk-grid2">${treeBox(c, k.k1, k.h1, "Child 1")}${treeBox(c, k.k2, k.h2, "Child 2")}</div><div class="wk-stats"><div class="wk-stat blue"><small>Parents</small><b>${size(c.A)} + ${size(c.B)}</b></div><div class="wk-stat ${k.ok ? "teal" : "rose"}"><small>${k.ok ? "Children" : "Rejected"}</small><b>${k.ok ? `${size(k.k1)} + ${size(k.k2)}` : `depth ${Math.max(depth(k.k1), depth(k.k2))} > ${c.maxD}`}</b></div></div>`;
    const g = c.grown;
    c.q("[data-gmeta]").innerHTML = g
      ? `Max depth ${g.D} · biggest possible ${2 ** g.D - 1} nodes · tries ${c.tries}`
      : `Pick a Max depth, then grow.`;
    c.q("[data-grown]").innerHTML = g
      ? treeBox(c, g.tree, new Set(), "Grown program")
      : `<p class="dim">Nothing grown yet.</p>`;
  }

  function check(c) {
    const { api } = c;
    if ([c.A, c.B].some((t) => at(t, 5) === 7 && at(t, 11) === 6)) api.done("target");
    if (c.grown && c.grown.D >= 3 && size(c.grown.tree) === 2 ** c.grown.D - 1) api.done("full");
    if (c.hitLeaf && c.hitRoot) api.done("mutate");
    const k = c.kids;
    if (k && k.ok && size(k.k1) === size(k.k2) && k.sa !== k.sb) api.done("cross");
    if (k && !k.ok) api.done("limit");
  }

  function mutateSel(c) {
    const w = c.act,
      id = c.sel[w];
    if (id == null) return c.api.say("Select a node first: click it in tree A or B.", "think");
    const t = c[w],
      pick = nodesOf(t)[id],
      cut = size(pick.node);
    const res = mutate(c.r, t, c.maxD, FS, TS(c.r), id);
    if (!isFn(pick.node)) c.hitLeaf = true;
    if (id === 0) c.hitRoot = true;
    c[w] = res.tree;
    c.sel[w] = res.at;
    c.msg = `Mutation cut out a subtree of <b>${plural(cut, "node")}</b> and grew a new one (limit: depth ${c.maxD}). Tree ${w} went from ${size(t)} to <b>${size(res.tree)}</b> nodes.`;
    c.api.say(
      id === 0 ? "You picked the root: the whole tree was replaced." : "Only the part under that node changed.",
    );
    paint(c);
    check(c);
  }

  function swapSel(c) {
    const ia = c.sel.A,
      ib = c.sel.B;
    if (ia == null || ib == null) return c.api.say("Select a node in <b>both</b> trees first.", "think");
    const ca = clone(c.A),
      cb = clone(c.B),
      pa = nodesOf(ca)[ia],
      pb = nodesOf(cb)[ib],
      sa = pa.node,
      sb = pb.node;
    const put = (p, root, sub) => {
      if (!p.parent) return sub;
      p.parent.kids[p.idx] = sub;
      return root;
    };
    const k1 = put(pa, ca, sb),
      k2 = put(pb, cb, sa);
    const ok = depth(k1) <= c.maxD && depth(k2) <= c.maxD;
    c.kids = { k1, k2, ok, sa: size(sa), sb: size(sb), h1: new Set(), h2: new Set() };
    for (let i = 0; i < size(sb); i++) c.kids.h1.add(ia + i);
    for (let i = 0; i < size(sa); i++) c.kids.h2.add(ib + i);
    c.msg = ok
      ? `Swapped a <b>${plural(size(sa), "node")}</b> subtree of A with a <b>${plural(size(sb), "node")}</b> one of B. Node counts always add up: ${size(c.A) + size(c.B)} before, ${size(k1) + size(k2)} after.`
      : `Rejected: a child would be deeper than the limit of ${c.maxD}. Pick other nodes or raise Max depth.`;
    c.api.say(
      ok
        ? "Two children, built only from pieces of their parents."
        : "The depth limit stops trees growing without end.",
    );
    paint(c);
    check(c);
  }

  function setNode(c, val) {
    const w = c.act,
      nd = nodesOf(c[w])[c.sel[w]].node;
    if (isFn(nd)) nd.op = val;
    else nd.v = val === "TIME" ? val : +val;
    c.msg = `Node set to <b>${val === ">" ? "&gt;" : val}</b>.`;
    paint(c);
    check(c);
  }

  function wire(c, stage) {
    const pickNode = (e) => {
      const g = e.target.closest("g[data-id]");
      if (!g || !g.closest("[data-which]")) return;
      const w = g.closest("[data-which]").dataset.which,
        id = +g.dataset.id;
      c.sel[w] = c.sel[w] === id ? null : id;
      c.act = w;
      c.msg = "";
      paint(c);
    };
    stage.addEventListener("click", pickNode);
    stage.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("g[data-id]")) {
        e.preventDefault();
        e.stopPropagation();
        pickNode(e);
      }
    });
    qs("[data-mut]", stage).onclick = () => mutateSel(c);
    qs("[data-swap]", stage).onclick = () => swapSel(c);
    qs("[data-reset]", stage).onclick = () => {
      Object.assign(c, { A: mkA(), B: mkB(), kids: null, msg: "Trees reset." });
      c.sel = { A: null, B: null };
      paint(c);
    };
    qs("[data-pal]", stage).addEventListener("click", (e) => {
      const b = e.target.closest("[data-set]");
      if (b && c.sel[c.act] != null) setNode(c, b.dataset.set);
    });
    qs("[data-grow]", stage).onclick = () => {
      c.tries++;
      c.grown = { tree: randomProgram(c.r, c.maxD, FS, TS(c.r)), D: c.maxD };
      c.msg = "";
      paint(c);
      check(c);
    };
  }

  function build(stage, api) {
    const c = { stage, api, r: mulberry(2024), t: 5, maxD: 4, A: mkA(), B: mkB(), act: "A", tries: 0, msg: "" };
    c.sel = { A: null, B: null };
    view(c, stage);
    wire(c, stage);
    paint(c);
    check(c);
  }

  N.register({
    id: "l6-wtree",
    lecture: 6,
    order: 90,
    num: "6.W",
    workshop: true,
    title: "Workshop: program tree sandbox",
    blurb:
      "No code. Edit trees node by node, mutate, swap subtrees between parents and grow random programs under a depth limit.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "sprout",
        intro:
          "Two parent trees, one dial called <b>TIME</b>. Every node shows its value. Tree A is nearly the lecture's program, but its test is the wrong way round.",
        missions: [
          {
            id: "target",
            t: "Make a tree output 7 at TIME 5 and 6 at TIME 11",
            d: "Click a node of tree A, then edit it with the buttons under the trees. Slide <b>TIME</b> to check both values.",
            hint: "The test <b>(&gt; 10 TIME)</b> is 1 before TIME passes 10, and A subtracts it. Select the <b>10</b> leaf and set it to TIME, then select the other leaf and set it to 10.",
          },
          {
            id: "mutate",
            t: "Mutate a leaf, then the root",
            d: "Select a leaf and press <b>Mutate selected node</b>. Then select the very top node and mutate again. Compare how many nodes were replaced.",
            hint: "Leaves are the bottom nodes with no lines below them. The root is the node at the top (d1).",
          },
          {
            id: "full",
            t: "Grow the biggest program the limit allows",
            d: "Set <b>Max depth</b> to 3 or more and press <b>Grow a program</b> until you get a full tree, with no leaf above the bottom level.",
            hint: "At Max depth 3 the most nodes is 1 + 2 + 4 = 7. Keep pressing: roughly one try in four is full.",
          },
          {
            id: "cross",
            t: "Cross over to two children of equal size",
            d: "Select one node in each parent and press <b>Swap selected subtrees</b>. Make both children the same size, using subtrees of different sizes.",
            hint: "Reset the trees first. Parents have 9 and 5 nodes, so each child needs 7: swap a 5-node subtree of A for a 3-node subtree of B (or a 3-node one for a single leaf).",
          },
          {
            id: "limit",
            t: "Break the depth limit",
            d: "Find a swap the depth limit rejects, because a child would be too deep.",
            hint: "Put a deep subtree of A into a low leaf of B. Try A's <b>+</b> (with its three levels) into the <b>TIME</b> leaf of B at Max depth 4.",
          },
        ],
        build,
      });
      root.appendChild(
        predict({
          id: "l6-wtree-1",
          q: "Max depth is 3, the root is at depth 1 and every function takes two arguments. What is the most nodes a program can have?",
          opts: ["7", "5", "9"],
          a: 0,
          why: "Depth 1 holds 1 node, depth 2 holds 2 and depth 3 holds 4, so 1 + 2 + 4 = 7. A full tree doubles each level.",
        }),
      );
      root.appendChild(
        predict({
          id: "l6-wtree-2",
          q: "Subtree mutation picks one node at random and replaces everything below it. Which pick can change the most of the tree?",
          opts: ["The root", "A leaf", "A function one level above the leaves"],
          a: 0,
          why: "Everything hangs below the root, so choosing it replaces the whole tree. A leaf swaps one node, and most nodes sit near the bottom, so most mutations are small.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A program is a <b>tree</b>: values flow up from the leaves, and one node edit can change the output at some inputs and not others.",
            "<b>Mutation</b> replaces the subtree under one node. A pick near the root changes a lot, a pick near the leaves changes a little.",
            "<b>Crossover</b> swaps subtrees between parents. The two children together always have as many nodes as the two parents.",
            "A <b>depth limit</b> caps size: with two-argument functions, depth D allows at most 2<sup>D</sup> − 1 nodes. Children that break it are rejected.",
          ],
          "Edit the tree, run it, and let the depth limit keep it from growing wild.",
        ),
      );
    },
  });

  L["l6-wtree"] = {
    sum: "Edit program trees by hand, mutate and swap subtrees, and see the depth limit at work.",
    steps: [
      {
        t: "Trees run from the leaves up",
        b: `<p>The sandbox shows two <b>program trees</b>. Leaves are inputs (<b>TIME</b>) or constants; every other node is a function. Under each node you see its <b>value</b>: children first, then the node itself.</p><p>Slide <b>TIME</b> and the numbers update. You will <b>edit</b> nodes, <b>mutate</b> a subtree, and <b>swap</b> subtrees between the two parents.</p>`,
        v: (box) => {
          const t = mkA();
          box.innerHTML =
            treeSVG(t, { vals: vals(t, { TIME: 5 }) }) +
            `<p class="dim" style="text-align:center">Tree A at TIME = 5</p>`;
        },
        c: {
          q: "Tree A is (− (+ (* 1 3) 4) (&gt; 10 TIME)). What does it output at TIME = 5?",
          o: ["6", "7", "8"],
          a: 0,
          why: "1 × 3 + 4 = 7. The test 10 &gt; 5 is true, which counts as 1, so 7 − 1 = 6.",
        },
      },
      {
        t: "Mutation, crossover and the limit",
        b: `<p><b>Mutation</b> picks a node and replaces the subtree under it with a new random one. <b>Crossover</b> picks a node in each parent and swaps the subtrees. Both must respect the <b>depth limit</b>, which stops programs growing without end.</p><p>The sandbox counts everything: sizes, depths and outputs.</p>`,
        v: F.compare(
          { title: "Mutation", c: "blue", body: "one parent, one node: the subtree under it is replaced" },
          { title: "Crossover", c: "teal", body: "two parents, one node each: the subtrees trade places" },
        ),
        c: {
          q: "Parents have 9 and 5 nodes. A crossover swaps a 5-node subtree of the first for a 3-node subtree of the second. How big are the two children?",
          o: ["7 and 7", "9 and 5", "5 and 9"],
          a: 0,
          why: "Child 1 loses 5 nodes and gains 3: 9 − 5 + 3 = 7. Child 2 loses 3 and gains 5: 5 − 3 + 5 = 7. The total stays 14.",
        },
      },
    ],
    guide: ["Work through the five missions in the workshop."],
  };
})();

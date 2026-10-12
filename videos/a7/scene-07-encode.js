/* Phase 7 · Information Theory & Compression (algo-7), scene 07: CODEWORDS, "Common letters get short codes" (12 s).
   Part A (0-5.5): the finished Huffman tree. B glides up to hang one step from the root (the others stay three steps down), a 0 / 1
   sticker pops on every branch, and the five leaves are read one at a time: the path from the root lights up green and the leaf shows
   its code. Then the inner nodes fade and the five leaves glide up into a code book row.
   Part B (5.3-12): spell BBADEBC. For each letter the message tile gets a blue ring, its code book tile an orange ring, and its
   codeword appears in the 15-bit green strip (a blue line under it says which one it is). Then the grey fixed strip (21 bits) is drawn
   under it at the same cell size, so the saving shows in the lengths.
   Every value comes from A7.HUFF and A7.ENCODE (common.js); nothing is typed here. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;
  const H = A7.HUFF;
  const EN = A7.ENCODE;

  // ---------- the model: every number comes from the helpers, checked here ----------
  const TREE = { x0: 100, slot: 120, top: 52, dy: 140 };
  const posAt = (flat) => A7.treePos(H, { ...TREE, flat });
  const leafOrder = H.order;
  const BIGGEST = leafOrder[leafOrder.length - 1];
  A7.same("encode scene: codes", H.codes, { C: "000", E: "001", D: "010", A: "011", B: "1" });
  A7.same("encode scene: the message codes", EN.codes, [...A7.MSG].map((c) => H.codes[c]));
  A7.same("encode scene: bit counts", [EN.count, EN.fixedCount, EN.saved], [15, 21, 6]);
  A7.same("encode scene: B hangs one step from the root", [BIGGEST, H.nodes[BIGGEST].depth, H.nodes.B.parent], ["B", 1, H.root]);
  A7.same(
    "encode scene: the other leaves are three steps down",
    leafOrder.slice(0, -1).map((c) => H.nodes[c].depth),
    [3, 3, 3, 3],
  );
  A7.same("encode scene: B's final centre", posAt(0).B, [640, 192]);
  A7.same("encode scene: B's start centre", posAt(1).B, [640, 472]);

  // the path from the root down to a leaf: branches (with the step each is) and the inner nodes it passes
  const pathOf = (leaf) => {
    const out = [];
    for (let id = leaf; H.nodes[id].parent != null; id = H.nodes[id].parent)
      out.unshift({ id, key: A7.ek(H.nodes[id].parent, id), parent: H.nodes[id].parent, step: H.nodes[id].depth });
    return out;
  };
  // reading order: the commonest letter first (it is the shortest walk), then the rest left to right
  const READ = [BIGGEST, ...leafOrder.slice(0, -1)];
  const READ_T = [2.7, 3.1, 3.45, 3.8, 4.15];
  A7.same("encode scene: reading order", READ, ["B", "C", "E", "D", "A"]);
  const STEP_DT = 0.08; // each step down the path starts this much later
  // the code book row (leaf centres), one 170 px slot per letter in tree order
  const BOOK = Object.fromEntries(leafOrder.map((c, i) => [c, [128 + 170 * i, 62]]));

  const tonePick = (a) => a; // (kept simple: tones are literal names)

  // ---------- part A: the tree, the glide, the stickers, the reading and the change into a code book ----------
  function partA(stage) {
    const T = A7.tree(stage, { tree: H, pos: posAt(0) });
    const ids = Object.values(H.nodes)
      .sort((a, b) => a.depth - b.depth || posAt(0)[a.id][0] - posAt(0)[b.id][0])
      .map((n) => n.id);
    const isLeaf = (id) => H.nodes[id].leaf;
    const rootTag = A7.tag(stage, { x: 548, y: 26, text: "root", tone: "grey", h: 52 });
    const oneTag = A7.tag(stage, { x: 712, y: 166, text: "1 step", tone: "green", solid: true, h: 52 });
    const threeTag = A7.tag(stage, { x: 592, y: 446, text: "3 steps", tone: "grey", h: 52 });
    const paths = Object.fromEntries(leafOrder.map((c) => [c, pathOf(c)]));
    const nodeAt = (r, p) => READ_T[r] + STEP_DT * (p.step - 1); // when the walk reaches the child end of branch p

    return (t) => {
      const fade = 1 - ramp(t, 4.6, 5.1, lin);
      const flat = 1 - ramp(t, 0.9, 1.7, E.inOut);
      const glide = ramp(t, 4.7, 5.5, E.inOut);
      const pos0 = posAt(flat);
      const pos = Object.fromEntries(
        ids.map((id) => [id, isLeaf(id) ? [lerp(pos0[id][0], BOOK[id][0], glide), lerp(pos0[id][1], BOOK[id][1], glide)] : pos0[id]]),
      );
      const nodes = {};
      const edges = {};
      // 0.1-0.9: every node and branch pops in, top-down, grey
      ids.forEach((id, k) => {
        const n0 = 0.1 + 0.06 * k;
        const par = H.nodes[id].parent;
        nodes[id] = { k: ramp(t, n0, n0 + 0.3, lin), o: isLeaf(id) ? 1 : fade };
        if (par != null) {
          const s0 = n0 - 0.1;
          const bit = ramp(t, 1.8 + 0.07 * H.edges.findIndex((e) => e[1] === id), 2.1 + 0.07 * H.edges.findIndex((e) => e[1] === id), lin);
          edges[A7.ek(par, id)] = { k: ramp(t, s0, s0 + 0.28, lin), bit, o: fade };
        }
      });
      // 2.7-4.4: the reading, one letter at a time; later letters repaint the branches they share
      READ.forEach((c, r) => {
        paths[c].forEach((p) => {
          const at = nodeAt(r, p);
          if (t < at) return;
          const w = 1 + 0.4 * (1 - ramp(t, at, at + 0.4, lin));
          edges[p.key] = { ...edges[p.key], tone: "green", w, bitSolid: true, bitTone: "green" };
          if (!isLeaf(p.parent)) nodes[p.parent] = { ...nodes[p.parent], tone: "green" };
        });
        const last = paths[c][paths[c].length - 1];
        const arrive = nodeAt(r, last) + 0.1;
        if (t >= arrive)
          nodes[c] = {
            ...nodes[c],
            tone: "green",
            solid: true,
            sub: H.codes[c],
            s: 1 + 0.1 * flash(t, arrive, arrive + 0.3),
          };
      });
      T.update({ nodes, edges, pos });
      // the little labels: the root, and how many steps down each letter hangs
      const tagO = fade;
      rootTag.set({ k: ramp(t, 0.1, 0.5, lin), o: tagO });
      oneTag.set({ k: ramp(t, 1.6, 2.0, lin), o: tagO });
      threeTag.set({ k: ramp(t, 1.7, 2.1, lin), o: tagO });
    };
  }

  // ---------- part B: spell the message with the code book ----------
  function partB(stage) {
    // the book is the part-A tree's leaves, so part B only draws its rings: see ringOf in build()
    const msg = A7.tiles(stage, { x: 84, y: 164, items: [...A7.MSG], w: 96, h: 96, gap: 16, fs: 48 });
    const CELL = { cell: 34, h: 52, gap: 3, groupGap: 12, fs: 30 };
    const huff = A7.bits(stage, { x: 54, y: 330, groups: EN.codes, ...CELL, tone: "green" });
    const fix = A7.bits(stage, { x: 54, y: 480, groups: EN.fixed, ...CELL, tone: "grey" });
    const huffTag = A7.tag(stage, { x: 54, y: 270, text: `Huffman: ${EN.count} bits`, tone: "green", solid: true, h: 52 });
    const fixTag = A7.tag(stage, { x: 54, y: 420, text: `fixed: ${EN.fixedCount} bits`, tone: "grey", h: 52 });
    const savedTag = A7.tag(stage, { x: 54 + huff.width + 24, y: 336, text: `${EN.saved} fewer`, tone: "green", h: 52 });
    const under = A7.span(stage, { x: 0, y: 396, w: 40, h: 10, tone: "blue" });
    const U = (j) => 5.8 + 0.45 * j; // letter j starts here
    const n = EN.codes.length;

    return {
      update(t) {
        msg.all((j) => {
          const [a, b] = [U(j), j + 1 < n ? U(j + 1) : Infinity];
          const k = ramp(t, 5.3 + 0.05 * j, 5.6 + 0.05 * j, lin);
          const on = t >= a;
          return { k, ring: on ? "blue" : undefined, ringK: ramp(t, a, a + 0.15, lin) * (1 - ramp(t, b, b + 0.12, lin)) };
        });
        huff.set({ groupK: (g) => ramp(t, U(g) + 0.1, U(g) + 0.4, lin), tone: "green" });
        // the blue line under the codeword being written (it stays on the last one)
        const g = Math.max(0, Math.min(n - 1, Math.floor((t - 5.8) / 0.45)));
        const gp = huff.group(g);
        under.set({ x: gp.x, w: gp.w, k: ramp(t, U(g) + 0.1, U(g) + 0.4, lin) * (1 - ramp(t, 9.0, 9.2, lin)) });
        huffTag.set({ k: ramp(t, 9.0, 9.4, lin) });
        fix.set({ k: ramp(t, 9.2, 9.8, lin), tone: "grey" });
        fixTag.set({ k: ramp(t, 9.8, 10.2, lin) });
        savedTag.set({ k: ramp(t, 10.3, 10.7, lin) });
      },
      // the code book tile of letter j is looked up (orange ring) for 0.4 s from U(j)
      lookup: (t) => {
        let hit = null;
        [...A7.MSG].forEach((c, j) => {
          const u = U(j);
          if (t >= u && t < u + 0.45) hit = { c, j, u };
        });
        return hit;
      },
    };
  }

  V.scene({
    kicker: "CODEWORDS",
    title: ["Common letters get", "short codes"],
    dur: 12,
    caps: [
      [0.8, 2.8, "Common B sits one step from the root."],
      [2.9, 4.6, "The path down is the code."],
      [5.6, 8.6, "Spell BBADEBC with these codes."],
      [9.6, 11.6, "15 bits instead of 21."],
    ],
    build(stage) {
      void tonePick;
      const a = partA(stage);
      const b = partB(stage);
      return (t) => {
        a(t);
        b.update(t);
      };
    },
  });
})();

/* Phase 7 · Information Theory & Compression (algo-7), scene 07: CODEWORDS, "Common letters get short codes" (12 s).
   Part A (0-5.5): the finished Huffman tree. B glides up to hang one step from the root (the others stay three steps down), a 0 / 1
   sticker pops on every branch, and the five leaves are read one at a time: the path from the root lights up green and the leaf shows
   its code. Then the inner nodes fade and the five leaves glide up into a code book row.
   Part B (5.3-12.9): spell BBADEBC. For each letter the message tile gets a blue ring, its code book tile an orange ring, and its
   codeword appears in the 15-bit green strip (a blue line under it says which one it is). Then the grey fixed strip (21 bits) is drawn
   under it at the same cell size, so the saving shows in the lengths. Finally both strips slide together into the real gap-free
   bit strings (15 and 21 cells; the codewords were only spaced out to be readable) and seven blue lines cut the 15 bits back into
   their codewords: the stream reads back one way, as in scene 5.
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
  const LEAVES = H.order; // C E D A B, left to right
  const BIGGEST = LEAVES[LEAVES.length - 1];
  const MSG = [...A7.MSG];
  A7.same("encode scene: codes", H.codes, { C: "000", E: "001", D: "010", A: "011", B: "1" });
  A7.same(
    "encode scene: the message codes",
    EN.codes,
    MSG.map((c) => H.codes[c]),
  );
  A7.same("encode scene: bit counts", [EN.count, EN.fixedCount, EN.saved], [15, 21, 6]);
  A7.same(
    "encode scene: B hangs one step from the root",
    [BIGGEST, H.nodes[BIGGEST].depth, H.nodes[BIGGEST].parent],
    ["B", 1, H.root],
  );
  A7.same(
    "encode scene: the other leaves are three steps down",
    LEAVES.slice(0, -1).map((c) => H.nodes[c].depth),
    [3, 3, 3, 3],
  );
  A7.same("encode scene: B's final centre", posAt(0).B, [640, 192]);
  A7.same("encode scene: B's start centre", posAt(1).B, [640, 472]);

  // the path from the root down to a leaf: its branches, each with the step number it is
  const pathOf = (leaf) => {
    const out = [];
    for (let id = leaf; H.nodes[id].parent != null; id = H.nodes[id].parent)
      out.unshift({ id, key: A7.ek(H.nodes[id].parent, id), parent: H.nodes[id].parent, step: H.nodes[id].depth });
    return out;
  };
  // reading order: the commonest letter first (the shortest walk), then the rest left to right
  const READ = [BIGGEST, ...LEAVES.slice(0, -1)];
  const READ_T = [2.6, 2.98, 3.36, 3.74, 4.12]; // 0.38 s a letter
  A7.same("encode scene: reading order", READ, ["B", "C", "E", "D", "A"]);
  const PATH = Object.fromEntries(LEAVES.map((c) => [c, pathOf(c)]));
  const STEP_DT = 0.08; // every step down a path starts this much later
  const reach = (r, p) => READ_T[r] + STEP_DT * (p.step - 1); // when the walk gets to the lower end of branch p
  // the code book row: leaf centres, one 170 px slot per letter in tree order
  const BOOK = Object.fromEntries(LEAVES.map((c, i) => [c, [128 + 170 * i, 62]]));
  const U = (j) => 5.8 + 0.45 * j; // the encoding of letter j starts here (every letter takes 0.45 s)
  const END = U(MSG.length - 1) + 0.4; // the last codeword has landed (8.9)

  // ---------- part A: the tree, the glide, the stickers, the reading and the change into a code book ----------
  function treePart(stage) {
    const T = A7.tree(stage, { tree: H, pos: posAt(0) });
    const ids = Object.values(H.nodes)
      .sort((a, b) => a.depth - b.depth || posAt(0)[a.id][0] - posAt(0)[b.id][0])
      .map((n) => n.id);
    const tags = {
      root: A7.tag(stage, { x: 548, y: 26, text: "root", tone: "grey", h: 52 }),
      one: A7.tag(stage, { x: 712, y: 166, text: "1 step", tone: "green", solid: true, h: 52 }),
      three: A7.tag(stage, { x: 592, y: 446, text: "3 steps", tone: "grey", h: 52 }),
    };
    const edgeNo = (id) => H.edges.findIndex((e) => e[1] === id);

    // everything the tree shows at time t: {nodes, edges, pos, fade}
    const state = (t) => {
      const fade = 1 - ramp(t, 4.7, 5.1, lin); // the inner nodes and branches leave
      const flat = 1 - ramp(t, 0.7, 1.4, E.inOut); // B glides up to its own depth
      const glide = ramp(t, 4.8, 5.5, E.inOut); // the leaves glide into the code book row
      const home = posAt(flat);
      const pos = {};
      const nodes = {};
      const edges = {};
      ids.forEach((id, k) => {
        const leaf = H.nodes[id].leaf;
        pos[id] = leaf ? [lerp(home[id][0], BOOK[id][0], glide), lerp(home[id][1], BOOK[id][1], glide)] : home[id];
        const n0 = 0.05 + 0.045 * k;
        nodes[id] = { k: ramp(t, n0, n0 + 0.3, lin), o: leaf ? 1 : fade };
        const par = H.nodes[id].parent;
        if (par == null) return;
        const bit0 = 1.6 + 0.06 * edgeNo(id); // the 0 / 1 stickers pop 0.06 s apart
        edges[A7.ek(par, id)] = {
          k: ramp(t, n0 - 0.1, n0 + 0.18, lin),
          bit: ramp(t, bit0, bit0 + 0.3, lin),
          o: fade,
        };
      });
      // the reading, one letter at a time; later letters repaint the branches they share
      READ.forEach((c, r) => {
        PATH[c].forEach((p) => {
          const at = reach(r, p);
          if (t < at) return;
          const w = 1 + 0.4 * (1 - ramp(t, at, at + 0.4, lin));
          edges[p.key] = { ...edges[p.key], tone: "green", w, bitTone: "green", bitSolid: true };
          if (!H.nodes[p.parent].leaf) nodes[p.parent] = { ...nodes[p.parent], tone: "green" };
        });
        const arrive = reach(r, PATH[c][PATH[c].length - 1]) + 0.1;
        if (t >= arrive)
          nodes[c] = {
            ...nodes[c],
            tone: "green",
            solid: true,
            sub: H.codes[c],
            s: 1 + 0.1 * flash(t, arrive, arrive + 0.3),
          };
      });
      tags.root.set({ k: ramp(t, 0.1, 0.5, lin), o: fade });
      tags.one.set({ k: ramp(t, 1.35, 1.75, lin), o: fade });
      tags.three.set({ k: ramp(t, 1.45, 1.85, lin), o: fade });
      return { nodes, edges, pos };
    };
    return { T, state };
  }

  // ---------- part B: spell the message with the code book ----------
  function spellPart(stage) {
    const msg = A7.tiles(stage, { x: 84, y: 172, items: MSG, w: 96, h: 96, gap: 16, fs: 48 });
    const CELL = { cell: 34, h: 52, gap: 3, groupGap: 12, fs: 30 };
    const huff = A7.bits(stage, { x: 54, y: 366, groups: EN.codes, ...CELL, tone: "green" });
    const fix = A7.bits(stage, { x: 54, y: 534, groups: EN.fixed, ...CELL, tone: "grey" });
    const huffTag = A7.tag(stage, {
      x: 54,
      y: 306,
      text: `Huffman: ${EN.count} bits`,
      tone: "green",
      solid: true,
      h: 52,
    });
    const fixTag = A7.tag(stage, { x: 54, y: 474, text: `fixed: ${EN.fixedCount} bits`, tone: "grey", h: 52 });
    const under = A7.span(stage, { x: 0, y: 432, w: 40, h: 10, tone: "blue" });
    const n = EN.codes.length;
    // closing the gaps between codewords: group g moves left by SQUEEZE * g, so every strip ends up one unbroken run of bits
    const SQUEEZE = CELL.groupGap - CELL.gap;
    const JOIN = [10.1, 10.9];
    const groupOf = (codes) => codes.flatMap((c, g) => [...c].map(() => g));
    const [hGroups, fGroups] = [groupOf(EN.codes), groupOf(EN.fixed)];
    A7.same("encode scene: the joined strips", [hGroups.length, fGroups.length], [EN.count, EN.fixedCount]);
    const cuts = EN.codes.map((_, g) =>
      A7.span(stage, { x: huff.group(g).x, y: 432, w: huff.group(g).w, h: 10, tone: "blue" }),
    );

    return {
      // the message tiles, the strips and their labels
      draw(t) {
        msg.all((j) => {
          const [a, b] = [U(j), j + 1 < n ? U(j + 1) : END + 0.1]; // the last ring leaves when its codeword has landed
          const ring = t >= a ? "blue" : undefined;
          const ringK = ramp(t, a, a + 0.15, lin) * (1 - ramp(t, b, b + 0.12, lin));
          return { k: ramp(t, 5.3 + 0.05 * j, 5.6 + 0.05 * j, lin), ring, ringK };
        });
        const join = ramp(t, JOIN[0], JOIN[1], E.inOut);
        const slide = (groups) => Object.fromEntries(groups.map((g, i) => [i, { x: -SQUEEZE * g * join }]));
        huff.set({ groupK: (g) => ramp(t, U(g) + 0.1, U(g) + 0.4, lin), tone: "green", cells: slide(hGroups) });
        // a blue line under the codeword being written (it waits under its slot, then the codeword fills in; it goes when the tag comes)
        const g = Math.max(0, Math.min(n - 1, Math.floor((t - U(0)) / 0.45)));
        const gp = huff.group(g);
        under.set({ x: gp.x, w: gp.w, k: ramp(t, U(g), U(g) + 0.15, lin) * (1 - ramp(t, END, END + 0.2, lin)) });
        huffTag.set({ k: ramp(t, END, END + 0.4, lin) });
        fix.set({ k: ramp(t, 9.0, 9.5, lin), tone: "grey", cells: slide(fGroups) });
        // seven blue lines cut the joined 15 bits back into the codewords
        cuts.forEach((c, g) => {
          const gp = huff.group(g);
          c.set({ x: gp.x - SQUEEZE * g * join, k: ramp(t, JOIN[1] + 0.08 * g, JOIN[1] + 0.08 * g + 0.25, lin) });
        });
        fixTag.set({ k: ramp(t, 9.4, 9.8, lin) });
      },
      // the code book tile of the letter being spelled gets an orange ring for 0.4 s
      ring(t, nodes) {
        MSG.forEach((c, j) => {
          const k = ramp(t, U(j), U(j) + 0.1, lin) * (1 - ramp(t, U(j) + 0.3, U(j) + 0.45, lin));
          if (k <= 0) return;
          nodes[c] = {
            ...nodes[c],
            ring: "orange",
            ringK: k,
            s: (nodes[c].s ?? 1) + 0.05 * flash(t, U(j), U(j) + 0.4),
          };
        });
      },
    };
  }

  V.scene({
    kicker: "CODEWORDS",
    title: ["Common letters get", "short codes"],
    dur: 12.9,
    caps: [
      [1.4, 2.8, "Common B sits one step from the root."],
      [2.9, 4.6, "The path down is the code."],
      [5.6, 8.6, "Spell BBADEBC with these codes."],
      [9.6, 10.9, "15 bits instead of 21."],
      [11.0, 12.7, "Joined up, it still splits into the same codes."],
    ],
    build(stage) {
      const tree = treePart(stage);
      const spell = spellPart(stage);
      return (t) => {
        const st = tree.state(t);
        spell.ring(t, st.nodes);
        tree.T.update(st);
        spell.draw(t);
      };
    },
  });
})();

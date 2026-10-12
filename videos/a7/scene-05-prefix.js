/* Phase 7 · Information Theory & Compression (algo-7), scene 05: DECODING, "Codes you can read without any gaps".
   Part 1 (0.3-5.6): a bad code (A = 0, B = 1, C = 01) with no gaps between codewords: the bits 01 read as A then B, or as C.
   Part 2 (5.7-12): the good code A = 0, B = 10, C = 110, D = 111 drawn as a tree with every codeword at a leaf. A blue token walks
   the stream 010110 down from the root; a leaf turns green and its letter drops into the output, so it reads A B C only one way.
   Every value comes from A7.BAD and A7.PREFIX (its tree and its walk); nothing is typed here. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;

  // ---------- part 1: a code with two readings ----------
  function part1(stage) {
    const B = A7.BAD;
    const DY = 36; // the whole figure sits a little lower so it is centred on the stage
    const letters = Object.keys(B.codes);
    const book = A7.tiles(stage, {
      x: 316,
      y: 24 + DY,
      items: letters.map((c) => ({ text: c, sub: B.codes[c] })),
      w: 88,
      h: 104,
      gap: 20,
      fs: 44,
    });
    const codeTag = A7.tag(stage, { x: 180, y: 50 + DY, text: "code", tone: "grey", h: 52 });
    const recTag = A7.tag(stage, { x: 180, y: 220 + DY, text: "received", tone: "grey", h: 52 });
    const bitsRow = A7.bits(stage, {
      x: 400,
      y: 204 + DY,
      groups: B.stream,
      cell: 72,
      h: 72,
      gap: 8,
      fs: 44,
      tone: "blue",
    });
    const [r1, r2] = B.readings;
    const read1 = A7.tiles(stage, { x: 400, y: 320 + DY, items: r1, w: 72, h: 80, gap: 8, fs: 44 });
    const read2 = A7.tiles(stage, { x: 400, y: 440 + DY, items: r2, w: 152, h: 80, fs: 44 });
    const tag1 = A7.tag(stage, { x: 180, y: 334 + DY, text: "reading 1", tone: "grey", h: 52 });
    const tag2 = A7.tag(stage, { x: 180, y: 454 + DY, text: "reading 2", tone: "grey", h: 52 });
    const verdict = A7.tag(stage, { x: 636, y: 386 + DY, text: "two readings!", tone: "red", solid: true, h: 52 });
    const svg = L5.svg(stage, 936, 640);
    const cross = L5.cross(596, 420 + DY, 70, "red", { w: 12 });
    svg.append(cross);

    return (t) => {
      const o = 1 - ramp(t, 5.2, 5.6, lin);
      const verdictK = ramp(t, 4.5, 4.9, lin);
      const bad = t >= 4.5; // both readings turn red once we see they clash
      const readTone = bad ? "red" : "blue";
      book.all((i) => ({ k: ramp(t, 0.3 + 0.08 * i, 0.8 + 0.08 * i, lin), o }));
      codeTag.set({ k: ramp(t, 0.3, 0.7, lin), o });
      recTag.set({ k: ramp(t, 1.3, 1.7, lin), o });
      bitsRow.set({ k: ramp(t, 1.3, 1.9, lin), o });
      read1.all((i) => ({ k: ramp(t, 2.3 + 0.3 * i, 2.7 + 0.3 * i, lin), tone: readTone, o }));
      tag1.set({ k: ramp(t, 2.3, 2.7, lin), o });
      read2.set(0, { k: ramp(t, 3.6, 4.3, lin), tone: readTone, o });
      tag2.set({ k: ramp(t, 3.6, 4.0, lin), o });
      verdict.set({ k: verdictK, o });
      L5.drawOn(cross, ramp(t, 4.6, 5.0, lin));
      V.show(svg, o);
    };
  }

  // ---------- part 2: the prefix-free tree and its walk ----------
  function part2(stage) {
    const P = A7.PREFIX;
    const pos = A7.treePos(P.tree, { x0: 150, slot: 130, top: 52, dy: 140 });
    const T = A7.tree(stage, { tree: P.tree, pos, leafH: 80 });
    const ids = Object.values(P.tree.nodes)
      .sort((a, b) => a.depth - b.depth || pos[a.id][0] - pos[b.id][0])
      .map((n) => n.id);
    const [SX, SY] = [40, 552];
    const recTag = A7.tag(stage, { x: SX, y: SY - 58, text: "received", tone: "grey", h: 52 });
    const stream = A7.bits(stage, { x: SX, y: SY, groups: P.stream, cell: 56, h: 56, gap: 6, fs: 36, tone: "grey" });
    const out = A7.tiles(stage, {
      x: 520,
      y: SY - 4,
      items: [...P.out].map((c) => ({ text: c, tone: "green" })),
      w: 72,
      h: 64,
      gap: 12,
      fs: 40,
    });
    const tok = A7.token(stage, { tone: "blue" });
    const verdict = A7.tag(stage, { x: 668, y: 164, text: "prefix-free", tone: "green", solid: true, h: 52 });
    const leafTag = A7.tag(stage, { x: 712, y: 448, text: "leaf", tone: "grey", h: 52 });
    const svg = L5.svg(stage, 936, 640);
    const arrow = L5.arrow(SX + 372 + 14, SY + 28, 508, SY + 28, "grey", 1, { w: 7, head: 20 });
    const tick = L5.tick(632, 190, 56, "green", { w: 11 });
    const leafArrow = L5.arrow(704, 472, 668, 472, "grey", 1, { w: 6, head: 16 });
    svg.append(arrow, tick, leafArrow);

    // the walk: step i starts at 7.5 + 0.5 i and takes 0.4 s; a codeword ends at its leaf step
    const W = P.walk;
    const [T0, STEP, DUR] = [7.5, 0.5, 0.4];
    const st = (i) => T0 + STEP * i;
    const en = (i) => st(i) + DUR;
    const last = W.map((w, i) => W.findIndex((v, j) => j >= i && v.leaf)); // step that finishes step i's codeword
    const arrive = W.map((w, i) => (w.leaf ? i : -1)).filter((i) => i >= 0); // the step on which letter j arrives
    const ekOf = (w) => A7.ek(w.from, w.to);
    // where the token lands: a leaf's top edge on the branch, so the letter stays readable
    const target = (w) => {
      const [a, b] = [T.pt(w.from), T.pt(w.to)];
      if (!P.tree.nodes[w.to].leaf) return b;
      const top = b.y - T.size(w.to).h / 2 - 8; // a little above the edge, clear of the letter
      return { x: lerp(a.x, b.x, (top - a.y) / (b.y - a.y)), y: top };
    };

    return (t) => {
      // --- the tree builds top-down, blue branches, then settles to grey ---
      const nodes = {};
      const edges = {};
      const building = t < 7.0;
      ids.forEach((id, k) => {
        const n0 = 5.7 + 0.14 * k;
        nodes[id] = { k: ramp(t, n0, n0 + 0.4, lin) };
        const par = P.tree.nodes[id].parent;
        if (par != null) {
          const s0 = n0 - 0.12;
          edges[A7.ek(par, id)] = {
            tone: building ? "blue" : "grey",
            k: ramp(t, s0, s0 + 0.28, lin),
            bit: ramp(t, s0 + 0.1, s0 + 0.4, lin),
          };
        }
      });
      // --- the walk: tones of branches, leaves and stream cells ---
      const cells = {};
      W.forEach((w, i) => {
        const done = t >= en(last[i]);
        const tone = t < st(i) ? null : done ? "green" : "blue";
        if (tone) {
          edges[ekOf(w)] = { ...edges[ekOf(w)], tone };
          cells[i] = { tone };
        }
        if (w.leaf) {
          nodes[w.to] = {
            ...nodes[w.to],
            tone: t >= en(i) ? "green" : "grey",
            solid: t >= en(i),
            ring: "green",
            ringK: flash(t, en(i), en(i) + 0.8),
            s: 1 + 0.08 * flash(t, en(i), en(i) + 0.35),
          };
        }
      });
      T.update({ nodes, edges });
      // --- the token ---
      let tx = T.pt("root");
      let [ty, to, ts] = [tx.y, ramp(t, 7.3, 7.5, lin), 0.6 + 0.4 * E.pop(ramp(t, 7.3, 7.6, lin))];
      tx = tx.x;
      const i = W.reduce((a, w, j) => (t >= st(j) ? j : a), -1);
      if (i >= 0) {
        const w = W[i];
        const [a, b] = [T.pt(w.from), target(w)];
        const k = E.inOut(ramp(t, st(i), en(i), lin));
        [tx, ty] = [lerp(a.x, b.x, k), lerp(a.y, b.y, k)];
        to = 1;
        ts = 1;
        if (w.start === i && i > 0) {
          // a new codeword: the token pops up at the root again
          to = ramp(t, st(i), st(i) + 0.12, lin);
          ts = 0.6 + 0.4 * E.pop(ramp(t, st(i), st(i) + 0.2, lin));
        }
        if (w.leaf) to = Math.min(to, 1 - ramp(t, en(i), en(i) + 0.1, lin));
      }
      tok.set({ x: tx, y: ty, o: to, s: ts });
      // --- the stream, the output and the labels ---
      const sk = ramp(t, 6.9, 7.4, lin);
      recTag.set({ k: ramp(t, 6.9, 7.3, lin) });
      stream.set({ k: sk, cells });
      const k0 = ramp(t, 6.9, 7.4, lin);
      L5.drawOn(arrow, k0);
      out.all((j) => ({ k: ramp(t, en(arrive[j]), en(arrive[j]) + 0.4, lin) }));
      leafTag.set({ k: ramp(t, 6.9, 7.3, lin) });
      V.show(leafArrow, ramp(t, 7.0, 7.3, lin));
      verdict.set({ k: ramp(t, 10.5, 10.9, lin) });
      L5.drawOn(tick, ramp(t, 10.6, 11.0, lin));
    };
  }

  V.scene({
    kicker: "DECODING",
    title: ["Codes you can read", "without any gaps"],
    dur: 12,
    caps: [
      [0.4, 2.2, "Codes sit side by side, with no gaps."],
      [2.4, 3.8, "01 could be A then B…"],
      [3.8, 5.3, "…or C. Two readings!"],
      [5.7, 7.6, "Put every code at a branch end."],
      [7.6, 10.2, "Follow the bits down. A leaf means a letter is done."],
      [10.5, 11.9, "No code starts another."],
    ],
    build(stage) {
      const [u1, u2] = [part1(stage), part2(stage)];
      return (t) => {
        u1(t);
        u2(t);
      };
    },
  });
})();

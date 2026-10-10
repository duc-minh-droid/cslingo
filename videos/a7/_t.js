(function () {
  const V = window.VID;
  const A7 = V.a7;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const HF = A7.HUFF;

  // ---- T1: forest (scene 6 layout) ----
  V.scene({
    kicker: "TEST 1",
    title: ["Forest", "grows"],
    dur: 14,
    caps: [[0.4, 3, "Each letter has a chance. Join the two smallest."]],
    build(stage) {
      const pos = A7.treePos(HF, { x0: 20, slot: 120, top: 70, dy: 140, flat: 1 });
      const T = A7.tree(stage, { tree: HF, pos });
      const hd = A7.tag(stage, { x: 680, y: 20, text: "bits per letter" });
      const names = ["fixed code 3.00", "Huffman", "floor 1.96"].map((t, i) =>
        A7.tag(stage, { x: 680, y: 100 + i * 130, text: t, tone: ["grey", "green", "purple"][i] }),
      );
      const bars = [3, 0, 1.964].map((v, i) =>
        A7.bar(stage, { x: 680, y: 146 + i * 130, w: 240, tone: ["grey", "green", "purple"][i] }),
      );
      return (t) => {
        const m = Math.min(4, Math.max(0, Math.floor((t - 2.8) / 2.2)));
        const f = Math.min(1, ((t - 2.8) % 2.2) / 1.2);
        const nodes = {},
          edges = {};
        HF.order.forEach((id, i) => (nodes[id] = { k: ramp(t, 0.3 + i * 0.12, 0.9 + i * 0.12) }));
        HF.merges.forEach((mg, i) => {
          const born = t > 2.8 + i * 2.2 + 0.6 ? ramp(t, 2.8 + i * 2.2 + 0.6, 2.8 + i * 2.2 + 1.2) : 0;
          nodes[mg.id] = { k: born, tone: i === 3 ? "green" : "grey" };
          [mg.a, mg.b].forEach(
            (c) => (edges[A7.ek(mg.id, c)] = { k: ramp(t, 2.8 + i * 2.2 + 0.7, 2.8 + i * 2.2 + 1.2), tone: "blue" }),
          );
          if (t > 2.8 + i * 2.2 && t < 2.8 + i * 2.2 + 1.5)
            [mg.a, mg.b].forEach(
              (c) =>
                (nodes[c] = {
                  ...nodes[c],
                  ring: "orange",
                  ringK: ramp(t, 2.8 + i * 2.2, 2.8 + i * 2.2 + 0.3),
                  tone: "orange",
                }),
            );
        });
        T.update({ nodes, edges });
        hd.set({ k: ramp(t, 0.4, 0.9) });
        names.forEach((n, i) => n.set({ k: ramp(t, 0.6 + i * 0.1, 1.1) }));
        const cost = m >= 0 && t > 3.4 ? HF.merges[Math.min(3, m)].cost / 100 : 0;
        bars[0].set({ k: ramp(t, 0.6, 1.2), text: "3.00" });
        bars[1].set({ k: (t > 3.4 ? cost : 0) / 3, text: "" });
        bars[2].set({ k: t > 11 ? 1.964 / 3 : 0 });
      };
    },
  });

  // ---- T2: scene 2 layout ----
  V.scene({
    kicker: "TEST 2",
    title: ["Every letter costs", "the same bits"],
    dur: 10,
    caps: [[0.4, 3, "A fixed code spends 3 bits on every letter."]],
    build(stage) {
      const R = A7.REDUNDANCY;
      const book = A7.tiles(stage, {
        x: 65,
        y: 14,
        items: A7.ORDER.map((c) => ({ text: `${c} ${A7.FIXED[c]}` })),
        w: 150,
        h: 64,
        fs: 32,
        gap: 14,
      });
      const msg = A7.tiles(stage, { x: 44, y: 150, items: [...A7.MSG], w: 104, h: 100, gap: 20, fs: 56 });
      const strip = A7.bits(stage, { x: 42, y: 290, groups: R.fixed, cell: 34, h: 56, gap: 3, groupGap: 16, fs: 30 });
      const cnt = A7.counter(stage, { x: 330, y: 420, w: 276, label: "bits", tone: "grey" });
      const saved = A7.tag(stage, { x: 340, y: 520, text: "saved 6 bits", tone: "green", solid: true });
      return (t) => {
        book.all((i) => ({ k: ramp(t, 0.2 + i * 0.1, 0.7 + i * 0.1) }));
        msg.all((i) => ({
          k: ramp(t, 1 + i * 0.12, 1.5 + i * 0.12),
          ring: [0, 1, 5].includes(i) && t > 5.8 ? "blue" : undefined,
          ringK: ramp(t, 5.8 + i * 0.1, 6.2 + i * 0.1),
        }));
        const sh = ramp(t, 7, 8.2, E.inOut);
        const cells = {};
        [0, 1, 5].forEach((g) =>
          [0, 1].forEach((j) => {
            const i = g * 3 + 1 + j;
            cells[i] = { tone: "red", y: sh * 40, o: 1 - ramp(t, 7.2, 7.8, E.lin), k: ramp(t, 1.9, 3.7) * 21 - i };
          }),
        );
        [0, 1, 5].forEach((g) => (cells[g * 3] = { x: 37 * sh, tone: sh > 0.5 ? "green" : "grey", solid: sh > 0.5 }));
        strip.set({ k: ramp(t, 1.9, 3.7, E.lin), cells });
        const n = Math.round(lerp(0, 21, ramp(t, 1.9, 3.7, E.lin)) - 6 * ramp(t, 7.4, 8.4));
        cnt.set({ text: String(n), k: ramp(t, 1.8, 2.2), tone: t > 8 ? "green" : "grey", bump: flash(t, 8.4, 8.8) });
        saved.set({ k: ramp(t, 8.5, 9) });
      };
    },
  });

  // ---- T3: scene 4 gather ----
  V.scene({
    kicker: "TEST 3",
    title: ["Average surprise", "is the entropy"],
    dur: 12,
    caps: [[0.4, 3, "A source sends A, B, C or D."]],
    build(stage) {
      const D = A7.DIE,
        S = A7.SAMPLE;
      const legend = A7.tiles(stage, {
        x: 38,
        y: 0,
        items: D.letters.map((c, i) => ({
          text: c,
          sub: `${D.frac[i]}: ${D.bits[i]} bit${D.bits[i] > 1 ? "s" : ""}`,
          tone: "blue",
        })),
        w: 200,
        h: 96,
        gap: 20,
        fs: 40,
      });
      const samp = A7.tiles(stage, { x: 28, y: 128, items: [...S.msg], w: 96, h: 96, gap: 16, fs: 48 });
      const cell = 32,
        gap = 4;
      const src = [...S.msg].map((c, j) => {
        const n = S.bits[j];
        const w = n * cell + (n - 1) * gap;
        const b = A7.bits(stage, {
          x: 28 + j * 112 + 48 - w / 2,
          y: 244,
          groups: "1".repeat(n),
          cell,
          h: 44,
          gap,
          digits: false,
          tone: "orange",
        });
        return { b, w };
      });
      const groups = S.bits.map((n) => "1".repeat(n));
      const tgt = A7.bits(stage, {
        x: 40,
        y: 330,
        groups,
        cell,
        h: 44,
        gap,
        groupGap: 12,
        digits: false,
        tone: "orange",
      });
      const fix = A7.bits(stage, {
        x: 40,
        y: 400,
        groups: Array(8).fill("11"),
        cell,
        h: 44,
        gap,
        groupGap: 12,
        digits: false,
        tone: "grey",
      });
      const t14 = A7.tag(stage, { x: tgt.left + tgt.width + 16, y: 332, text: "14 bits", tone: "orange", solid: true });
      const t16 = A7.tag(stage, { x: fix.left + fix.width + 16, y: 402, text: "16 bits", tone: "grey" });
      const ent = A7.counter(stage, { x: 40, y: 500, w: 380, label: "entropy", tone: "purple" });
      const floor = A7.tag(stage, { x: 440, y: 516, text: "floor: none can beat it", tone: "purple" });
      return (t) => {
        legend.all((i) => ({ k: ramp(t, 0.2 + i * 0.15, 0.7 + i * 0.15) }));
        samp.all((i) => ({ k: ramp(t, 3 + i * 0.1, 3.5 + i * 0.1) }));
        const e = ramp(t, 6.4, 8, E.inOut);
        src.forEach((s, j) => {
          const t0 = tgt.group(j);
          const dx = t0.x - (28 + j * 112 + 48 - s.w / 2),
            dy = t0.y - 244;
          s.b.set({ k: ramp(t, 4.6 + j * 0.1, 5.1 + j * 0.1), x: dx * e, y: dy * e, o: e >= 1 ? 0 : 1 });
        });
        tgt.set({ groupK: () => (e >= 1 ? 1 : 0) });
        fix.set({ k: ramp(t, 8, 8.8) });
        t14.set({ k: ramp(t, 8, 8.4) });
        t16.set({ k: ramp(t, 8.4, 8.8) });
        ent.set({ text: "1.75", k: ramp(t, 9.4, 9.9), solid: true });
        floor.set({ k: ramp(t, 10, 10.4) });
      };
    },
  });

  // ---- T4: scene 7 tree -> codes and strips ----
  V.scene({
    kicker: "TEST 4",
    title: ["Common letters get", "short codes"],
    dur: 12,
    caps: [[0.4, 3, "B hangs one step from the root."]],
    build(stage) {
      const flatAt = (t) => 1 - ramp(t, 0.9, 1.7, E.inOut);
      const posAt = (t) => A7.treePos(HF, { x0: 100, slot: 120, top: 30, dy: 110, flat: flatAt(t) });
      const T = A7.tree(stage, { tree: HF, pos: posAt(0) });
      const msg = A7.tiles(stage, { x: 84, y: 170, items: [...A7.MSG], w: 96, h: 96, gap: 16, fs: 48 });
      const strip = A7.bits(stage, { x: 110, y: 330, groups: A7.ENCODE.codes, cell: 40, h: 52, gap: 4, groupGap: 14 });
      const fix = A7.bits(stage, { x: 54, y: 470, groups: A7.ENCODE.fixed, cell: 34, h: 52, gap: 3, groupGap: 12 });
      return (t) => {
        const p = posAt(t);
        const nodes = {},
          edges = {};
        Object.keys(HF.nodes).forEach((id, i) => {
          nodes[id] = { k: ramp(t, 0.1 + i * 0.05, 0.6 + i * 0.05), tone: "green" };
        });
        HF.edges.forEach(([a, b, bit], i) => {
          edges[A7.ek(a, b)] = { k: 1, bit: ramp(t, 1.8 + i * 0.1, 2.3 + i * 0.1), tone: t > 3 ? "green" : "grey" };
        });
        HF.order.forEach((id) => {
          if (t > 3.5) nodes[id].sub = HF.codes[id];
        });
        const out = t > 4.6 ? 1 - ramp(t, 4.6, 5.2) : 1;
        T.update({ nodes, edges, pos: p, o: out });
        msg.all((i) => ({ k: ramp(t, 5.4 + i * 0.1, 5.8 + i * 0.1) }));
        strip.set({ groupK: (g) => ramp(t, 6 + g * 0.55, 6.5 + g * 0.55) });
        fix.set({ k: ramp(t, 9.6, 10.4) });
      };
    },
  });

  // ---- T5: LZW layout ----
  V.scene({
    kicker: "TEST 5",
    title: ["LZW learns phrases", "as it reads"],
    dur: 13,
    caps: [[0.4, 3, "LZW starts with a tiny dictionary."]],
    build(stage) {
      const Z = A7.LZW;
      const tape = A7.tiles(stage, { x: 42, y: 20, items: [...Z.text], w: 84, h: 84, gap: 12, fs: 48 });
      const wSpan = A7.span(stage, { x: 42, y: 116, w: 84, tone: "blue" });
      const sent = A7.tiles(stage, { x: 140, y: 200, items: Z.codes.map(String), w: 72, h: 72, gap: 12, fs: 40 });
      const dict = A7.chips(stage, {
        x: 42,
        y: 346,
        cols: 3,
        items: Z.dict.map((d) => ({ idx: d.idx, text: d.text })),
      });
      const tag1 = A7.tag(stage, { x: 42, y: 150, text: "phrase so far", tone: "blue" });
      const tag2 = A7.tag(stage, { x: 300, y: 150, text: "next letter", tone: "orange" });
      const tag3 = A7.tag(stage, { x: 42, y: 212, text: "sent", tone: "green" });
      const tag4 = A7.tag(stage, { x: 42, y: 296, text: "dictionary", tone: "purple" });
      const fin = A7.tag(stage, { x: 650, y: 360, text: "9 letters, 5 codes", tone: "green", solid: true });
      return (t) => {
        const k = Math.min(8, Math.max(0, Math.floor((t - 2.5) / 1.1)));
        const st = Z.steps[k];
        tape.all((i) => ({
          k: ramp(t, 0.2 + i * 0.08, 0.6 + i * 0.08),
          tone: i >= st.wFrom && i < st.wTo ? "blue" : undefined,
          ring: i === st.i && st.c ? "orange" : undefined,
          ringK: 1,
        }));
        wSpan.set({ x: 42 + st.wFrom * 96, w: (st.wTo - st.wFrom) * 96 - 12, k: ramp(t, 1, 1.4) });
        const done = Z.steps.filter((s, i) => i <= k && s.code != null).length - (t < 2.5 ? 99 : 0);
        sent.all((i) => ({ k: ramp(t, 3 + i * 1.2, 3.4 + i * 1.2), tone: "green" }));
        dict.all((i) => ({
          k: i < 2 ? ramp(t, 0.8, 1.2) : ramp(t, 3 + (i - 2) * 1.5, 3.4 + (i - 2) * 1.5),
          tone: i < 2 ? "purple" : t < 4 + (i - 2) * 1.5 ? "orange" : "purple",
          solid: i >= 2 && t < 4 + (i - 2) * 1.5,
        }));
        [tag1, tag2, tag3, tag4].forEach((x, i) => x.set({ k: ramp(t, 0.8 + i * 0.1, 1.2 + i * 0.1) }));
        fin.set({ k: ramp(t, 12, 12.5) });
        void done;
      };
    },
  });

  // ---- T6: prefix tree (scene 5) + token + sym ----
  V.scene({
    kicker: "TEST 6",
    title: ["Codes you can read", "without any gaps"],
    dur: 12,
    caps: [[0.4, 3, "Put every code at the end of a branch."]],
    build(stage) {
      const P = A7.PREFIX;
      const pos = A7.treePos(P.tree, { x0: 150, slot: 130, top: 40, dy: 120 });
      const T = A7.tree(stage, { tree: P.tree, pos });
      const stream = A7.bits(stage, { x: 40, y: 540, groups: P.stream, cell: 56, h: 56, gap: 6, fs: 36 });
      const out = A7.tiles(stage, { x: 520, y: 536, items: [...P.out], w: 72, h: 64, gap: 12, fs: 40 });
      const tok = A7.token(stage, { tone: "blue" });
      const sv = L5.svg(stage);
      const g1 = sv.appendChild(A7.sym("plus", 700, 150, 44, "grey"));
      const g2 = sv.appendChild(A7.sym("equals", 780, 150, 44, "purple"));
      const g3 = sv.appendChild(L5.tick(860, 150, 60, "green"));
      return (t) => {
        const u = Math.max(0, (t - 3) / 0.7);
        const i = Math.min(5, Math.floor(u)),
          f = u - i;
        const w = P.walk[i];
        const a = T.pt(w.from),
          b = T.pt(w.to);
        tok.set({
          x: lerp(a.x, b.x, E.inOut(Math.min(1, f * 1.4))),
          y: lerp(a.y, b.y, E.inOut(Math.min(1, f * 1.4))),
          o: ramp(t, 2.5, 3),
        });
        const nodes = {},
          edges = {};
        Object.keys(P.tree.nodes).forEach(
          (id, j) =>
            (nodes[id] = {
              k: ramp(t, 0.2 + j * 0.1, 0.7 + j * 0.1),
              tone:
                P.tree.nodes[id].leaf && u > P.walk.findIndex((s) => s.to === id) + 1 && P.walk.some((s) => s.to === id)
                  ? "green"
                  : "grey",
              solid: !!(P.tree.nodes[id].leaf && P.walk.slice(0, i + 1).some((s) => s.to === id && s.leaf)),
            }),
        );
        P.tree.edges.forEach(
          ([p, c], j) =>
            (edges[A7.ek(p, c)] = {
              k: ramp(t, 0.5 + j * 0.1, 0.9 + j * 0.1),
              bit: ramp(t, 1 + j * 0.1, 1.4 + j * 0.1),
            }),
        );
        T.update({ nodes, edges });
        stream.set({
          k: ramp(t, 2, 2.6),
          tones: undefined,
          cells: Object.fromEntries([...Array(6).keys()].map((c) => [c, { tone: c <= i && t > 3 ? "blue" : "grey" }])),
        });
        out.all((j) => ({
          k: P.walk.some((s) => s.leaf && s.out.length === j + 1 && s.i <= i && t > 3) ? 1 : 0,
          tone: "green",
        }));
        V.place(g1, { o: ramp(t, 1, 1.5) });
        V.place(g2, { o: ramp(t, 1, 1.5) });
        L5.drawOn(g3, ramp(t, 1, 2));
      };
    },
  });
})();

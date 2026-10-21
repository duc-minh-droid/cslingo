/* Lecture 3 (ds-3) · Storage and retrieval, scene 11-recap: three rows, each a small pictogram and one bold line (bare scene).
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row
   (times below are pictogram time), 6.5 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop,
   no fade, no reset), so for the last 2.5 seconds only Pebble's bob moves.
   Row 1 (orange): a log writes fast but reads scan. Eight grey log tiles and a ninth, green one that pops on at the end (the
          append: one step), then a blue ring runs over all nine, each one turning blue as it is read, while the orange counter
          disc counts 1 to 9 (a scan reads every line).
   Row 2 (purple): an index in memory jumps to the data. A purple key chip "mew" and its orange byte offset "52" (D3.HASH.get), a
          strip of four grey log tiles, an orange pointer from the offset to the right line, a blue token hops along it and the
          line turns green with a green tick: one jump.
   Row 3 (green): sorted segments merge and need a sparse index. Two sorted columns (a b c, the older one, and a c d, the newer
          one, run through D3.mergeSegments): the newest copy of each key turns blue and flies into the merged row, the older
          repeats of a and c turn red and drop away; a purple index chip "a" with an orange pointer to the merged row pops on.
   Every number and every order comes from the D3 helpers (D3.HASH, D3.COST, D3.mergeSegments) and is asserted when the scene is
   built. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const { f1 } = D3;

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const START = APPEAR.map((a) => a + 0.4); // a pictogram starts a little after its row has slid in
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // drawn at 340 x 140, shown 10% larger
  const NEXT = "Next: Workshop 3.W";

  // ---------- row 1: a log writes fast, but reads scan ----------
  function logScan(pic) {
    const N = D3.COST.first.n; // eight lines on disk, the ninth is the append
    D3.same("recap row 1: eight lines, a scan of nine reads nine", [N, D3.COST.write], [8, 1]);
    const COUNT = N + 1;
    const [S, G, X0, Y0] = [34, 4, 1, 12];
    const tiles = Array.from({ length: COUNT }, (_, i) =>
      D3.chip(pic, { x: X0 + (S + G) * i, y: Y0, w: S, h: S, text: "", tone: i < N ? "grey" : "green", radius: 10 }),
    );
    const count = D3.disc(pic, { x: 170, y: 100, size: 56, text: "0", tone: "orange" });
    const T = { pop: 0.0, popStep: 0.04, add: 0.6, scan: 1.2, step: 0.24 };
    const readAt = (i) => T.scan + T.step * i;

    return (t) => {
      const q = t - START[0];
      tiles.forEach((tile, i) => {
        const appended = i === N;
        const k = appended
          ? ramp(q, T.add, T.add + 0.4, E.lin)
          : ramp(q, T.pop + T.popStep * i, T.pop + T.popStep * i + 0.35, E.lin);
        const read = q >= readAt(i);
        const here = q >= readAt(i) && q < readAt(i) + T.step;
        const last = i === N && q >= readAt(i);
        tile.set({
          tone: read && !appended ? "blue" : appended ? "green" : "grey",
          solid: appended || (read && !appended && here),
          k,
          s: 1 + 0.12 * flash(q, readAt(i), readAt(i) + 0.3),
          ring: here || last ? "blue" : undefined,
          ringK: here || last ? 1 : 0,
        });
      });
      const n = clamp(Math.floor((q - T.scan) / T.step) + 1, 0, COUNT);
      count.set({
        text: String(n),
        tone: "orange",
        k: ramp(q, T.scan - 0.4, T.scan, E.lin),
        s: 1 + 0.12 * flash(q, readAt(Math.max(0, n - 1)), readAt(Math.max(0, n - 1)) + 0.2),
      });
    };
  }

  // ---------- row 2: an index in memory jumps to the data ----------
  function indexJump(pic) {
    const G = D3.HASH.get;
    D3.same("recap row 2: get mew is one jump to byte offset 52", [G.k, G.off, G.reads], ["mew", 52, 1]);
    const LINES = 4;
    const HIT = 2; // the third line of the strip is the one the offset points at
    const [TX, TY, TW, TH, TG] = [248, 8, 76, 28, 6];
    const key = D3.chip(pic, { x: 6, y: 20, w: 104, h: 44, text: G.k, tone: "purple", fs: 28, radius: 14 });
    const off = D3.chip(pic, { x: 116, y: 20, w: 70, h: 44, text: String(G.off), tone: "orange", fs: 28, radius: 14 });
    const lines = Array.from({ length: LINES }, (_, i) =>
      D3.chip(pic, { x: TX, y: TY + (TH + TG) * i, w: TW, h: TH, text: "", tone: "grey", radius: 9 }),
    );
    const layer = L5.svg(pic, PIC.w, PIC.h);
    const from = { x: 188, y: 42 };
    const to = { x: TX - 6, y: TY + (TH + TG) * HIT + TH / 2 };
    const ptr = D3.ptr(layer, { tone: "orange", w: 6, head: 18, bow: 0 });
    const token = D3.token(layer, { tone: "blue", size: 26 });
    const tick = L5.tick(TX + TW - 6, TY + (TH + TG) * HIT + TH / 2 + 1, 24, "green", { ink: true, w: 6 });
    layer.append(tick);
    const T = { pop: 0.1, ptr: 0.9, hop: 1.9, hopDur: 0.7, tick: 3.0 };

    return (t) => {
      const q = t - START[1];
      key.set({ k: ramp(q, T.pop, T.pop + 0.4, E.lin) });
      off.set({ k: ramp(q, T.pop + 0.15, T.pop + 0.55, E.lin) });
      lines.forEach((line, i) => {
        const hit = i === HIT && q >= T.hop + T.hopDur;
        line.set({
          tone: hit ? "green" : "grey",
          solid: hit,
          k: ramp(q, T.pop + 0.1 * i + 0.2, T.pop + 0.1 * i + 0.6, E.lin),
          s: 1 + 0.1 * (i === HIT ? flash(q, T.hop + T.hopDur, T.hop + T.hopDur + 0.3) : 0),
        });
      });
      const pk = ramp(q, T.ptr, T.ptr + 0.9, E.inOut);
      ptr.set({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, k: pk });
      const hk = clamp((q - T.hop) / T.hopDur);
      const p = D3.along([from, to], E.inOut(hk));
      token.set({
        x: p.x,
        y: p.y,
        s: 0.6 + 0.4 * E.pop(ramp(hk, 0, 0.2, E.lin)),
        o: Math.min(ramp(hk, 0, 0.1, E.lin), 1 - ramp(hk, 0.9, 1, E.lin)),
      });
      const tk = ramp(q, T.tick, T.tick + 0.5, E.lin);
      L5.drawOn(tick, ramp(tk, 0.2, 1, E.lin));
      V.place(tick, { ...D3.pop(tk), o: tk });
    };
  }

  // ---------- row 3: sorted segments merge, a sparse index jumps near ----------
  function mergeSparse(pic) {
    const SEGS = [
      [
        { k: "a", v: 1 },
        { k: "b", v: 2 },
        { k: "c", v: 3 },
      ],
      [
        { k: "a", v: 4 },
        { k: "c", v: 5 },
        { k: "d", v: 6 },
      ],
    ];
    const M = D3.mergeSegments(SEGS);
    D3.same(
      "recap row 3: merging a b c with a c d (newest wins) writes a b c d",
      M.out.map((r) => r.k),
      ["a", "b", "c", "d"],
    );
    D3.same(
      "recap row 3: the winners are the newer a, b of the older, the newer c and d",
      M.frames.map((f) => f.take),
      [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
    );
    const [CS, CH, CG, CY] = [40, 36, 3, 6]; // a column tile: width, height, gap, top
    const COLX = [8, 58];
    const origin = (s, i) => ({ x: COLX[s], y: CY + (CH + CG) * i });
    const [MX, MY, MS, MG] = [152, 30, 40, 6];
    const slot = (i) => ({ x: MX + (MS + MG) * i, y: MY });
    const cols = SEGS.map((seg, s) =>
      seg.map((r, i) => D3.chip(pic, { ...origin(s, i), w: CS, h: CH, text: r.k, tone: "grey", fs: 28, radius: 11 })),
    );
    const ghosts = M.out.map((_, i) =>
      D3.chip(pic, { ...slot(i), w: MS, h: CH, text: "", tone: "grey", ghost: true, radius: 11 }),
    );
    const merged = M.out.map((r, i) =>
      D3.chip(pic, { ...slot(i), w: MS, h: CH, text: r.k, tone: "green", fs: 28, radius: 11 }),
    );
    const index = D3.chip(pic, { x: MX, y: 98, w: 44, h: 36, text: "a", tone: "purple", fs: 28, radius: 11 });
    const layer = L5.svg(pic, PIC.w, PIC.h);
    const ptr = D3.ptr(layer, { tone: "orange", w: 6, head: 18 });
    const T = { pop: 0.1, popStep: 0.08, first: 0.8, step: 0.42, fly: 0.4, index: 2.6 };
    const stepAt = (f) => T.first + T.step * f;

    return (t) => {
      const q = t - START[2];
      ghosts.forEach((g, i) => g.set({ k: ramp(q, T.pop + 0.3 + 0.05 * i, T.pop + 0.65 + 0.05 * i, E.lin) }));
      cols.forEach((col, s) =>
        col.forEach((chip, i) => {
          const f = M.frames.findIndex(
            (fr) => (fr.take[0] === s && fr.take[1] === i) || fr.drop.some(([ds, di]) => ds === s && di === i),
          );
          const fr = M.frames[f];
          const won = fr.take[0] === s && fr.take[1] === i;
          const k = ramp(q, T.pop + T.popStep * (s * 3 + i), T.pop + T.popStep * (s * 3 + i) + 0.35, E.lin);
          const pick = q >= stepAt(f) - 0.15;
          const fk = ramp(q, stepAt(f), stepAt(f) + T.fly, E.inOut);
          const to = slot(fr.outIndex);
          const from = origin(s, i);
          if (won) {
            chip.set({
              tone: pick ? "blue" : "grey",
              solid: pick,
              k,
              x: (to.x - from.x) * fk,
              y: (to.y - from.y) * fk,
              o: 1 - ramp(q, stepAt(f) + T.fly - 0.05, stepAt(f) + T.fly, E.lin), // the green copy below takes over
            });
          } else {
            const gone = ramp(q, stepAt(f) + 0.25, stepAt(f) + 0.65, E.lin);
            chip.set({ tone: pick ? "red" : "grey", solid: false, k, y: 14 * gone, o: 1 - gone });
          }
        }),
      );
      merged.forEach((chip, i) => {
        const f = M.frames.findIndex((fr) => fr.outIndex === i);
        const at = stepAt(f) + T.fly;
        chip.set({ k: q >= at - 0.05 ? ramp(q, at - 0.05, at + 0.1, E.lin) : 0, s: 1 + 0.12 * flash(q, at, at + 0.3) });
      });
      index.set({ k: ramp(q, T.index, T.index + 0.4, E.lin) });
      ptr.set({ x1: MX + 22, y1: 96, x2: MX + 22, y2: MY + CH + 8, k: ramp(q, T.index + 0.4, T.index + 0.8, E.inOut) });
    };
  }

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const head = V.h("div", {
        class: "v-title-line",
        text: "Remember",
        style: { position: "absolute", left: "72px", top: "108px", fontSize: "76px" },
      });
      // 30 px like the title card's kicker (the engine's .v-kicker is 24 px, below the 28 px minimum)
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP", style: { fontSize: "30px" } });
      const mascot = V.mascot("pebble", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["orange", "A log writes fast,\nbut reads scan", logScan],
        ["purple", "An index in memory\njumps to the data", indexJump],
        ["green", "Sorted segments merge,\nneed a sparse index", mergeSparse],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "440px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "36px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: NEXT,
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 904, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
      });
      ctaBar.append(cta);
      stage.append(ctaBar);

      return (t) => {
        V.place(kicker, { y: (1 - ramp(t, 0.05, 0.45)) * 10, o: ramp(t, 0.05, 0.45) });
        V.place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
        const m = ramp(t, 0.2, 0.9, E.pop);
        V.place(mascot, {
          y: (1 - m) * 30 + 6 * Math.sin((2 * Math.PI * t) / 2.6),
          r: 3 * Math.sin((2 * Math.PI * t) / 3.2 + 1),
          s: 0.7 + 0.3 * m,
          o: ramp(t, 0.2, 0.5),
        });
        rows.forEach((r, i) => {
          const k = ramp(t, APPEAR[i], APPEAR[i] + 0.5);
          V.place(r.card, { y: (1 - k) * 36, o: k });
          const kl = ramp(t, APPEAR[i] + 0.15, APPEAR[i] + 0.65);
          V.place(r.label, { x: (1 - kl) * 24, o: kl });
          r.update(t);
        });
        const c = ramp(t, 6.5, 7.1, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 6.5, 6.8) });
      };
    },
  });
})();

/* Phase 7 · Information Theory & Compression (algo-7), scene 04-entropy (12 s): entropy is the AVERAGE surprise, and it is the
   floor for compression. A source sends A, B, C or D with chances 1/2, 1/4, 1/8, 1/8 (surprise 1, 2, 3, 3 bits). A sample of
   eight symbols with exactly those chances (ABAACABD) costs 14 bits of surprise; a fixed 2-bit code needs 16; 14 / 8 = 1.75.
   Every number comes from A7.DIE / A7.SAMPLE (common.js) and is asserted below.
   Story (local seconds): 0.2-1.2 the legend (symbol, chance, surprise) pops tile by tile and each tile pulses once; 2.8-3.9 the
   eight sample tiles pop; 4.2-5.4 each symbol gets its orange surprise cells; 5.8-7.4 the cells of all eight symbols slide
   down and close up into one 14-cell strip (the swap to the strip itself is invisible: same cells, same place); 7.8-8.9 the
   grey fixed strip (2 bits each, 16 cells) and its tag; 9.0-10.4 the average (14 bits over 8 symbols), the entropy counter
   1.75 and the floor tag. Nothing moves after 10.4. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const { ramp, flash, ease: E } = V;
  const D = A7.DIE;
  const S = A7.SAMPLE;
  const lin = E.lin;

  A7.same("entropy scene: the source", [D.bits, D.H], [[1, 2, 3, 3], 1.75]);
  A7.same(
    "entropy scene: the sample",
    [S.msg, S.bits, S.total, S.fixedTotal, S.perSymbol],
    ["ABAACABD", [1, 2, 1, 1, 3, 1, 2, 3], 14, 16, 1.75],
  );

  // layout (stage px)
  const L = { legend: 14, samp: 136, src: 252, tgt: 316, fix: 388, row1: 462, row2: 552 };
  const CELL = { cell: 32, h: 44, gap: 4, digits: false };
  const slotMid = (j) => 76 + 112 * j; // centre of sample tile j
  const T0 = { pop: 0.2, pulse: 1.6, samp: 2.8, cells: 4.2, gather: 5.8, surp: 7.4, fix: 7.8, fixTag: 8.5 };

  function build(stage) {
    const bitsLabel = (n) => `${n} bit${n > 1 ? "s" : ""}`;
    const legend = A7.tiles(stage, {
      x: 38,
      y: L.legend,
      items: D.letters.map((c, i) => ({ text: c, sub: `${D.frac[i]}: ${bitsLabel(D.bits[i])}`, tone: "blue" })),
      w: 200,
      h: 96,
      gap: 20,
      fs: 40,
    });
    const samp = A7.tiles(stage, { x: 28, y: L.samp, items: [...S.msg], w: 96, h: 96, gap: 16, fs: 48 });

    // one orange strip of surprise cells under every symbol, centred under its tile
    const src = [...S.msg].map((_, j) => {
      const n = S.bits[j];
      const width = n * CELL.cell + (n - 1) * CELL.gap;
      return A7.bits(stage, {
        x: slotMid(j) - width / 2,
        y: L.src,
        groups: "1".repeat(n),
        ...CELL,
        tone: "orange",
        solid: true,
      });
    });
    // the 14-cell strip they gather into, and the fixed 16-cell strip under it
    const tgt = A7.bits(stage, {
      x: 40,
      y: L.tgt,
      groups: S.bits.map((n) => "1".repeat(n)),
      ...CELL,
      groupGap: 12,
      tone: "orange",
      solid: true,
    });
    const fix = A7.bits(stage, {
      x: 40,
      y: L.fix,
      groups: Array(S.msg.length).fill("1".repeat(D.fixedBits)),
      ...CELL,
      groupGap: 12,
      tone: "grey",
    });
    A7.same("entropy scene: cell counts", [tgt.n, fix.n], [S.total, S.fixedTotal]);
    const surpTag = A7.tag(stage, {
      x: tgt.left + tgt.width + 16,
      y: L.tgt - 8,
      text: `surprise: ${S.total} bits`,
      tone: "orange",
      solid: true,
    });
    const fixTag = A7.tag(stage, {
      x: fix.left + fix.width + 16,
      y: L.fix - 8,
      text: `fixed: ${S.fixedTotal} bits`,
      tone: "grey",
    });

    // the result: entropy = 14 bits over 8 symbols = 1.75, and the floor
    const ent = A7.counter(stage, { x: 40, y: L.row1, w: 320, h: 72, label: "entropy", tone: "purple" });
    const eq = A7.sym("equals", 392, L.row1 + 36, 36, "purple");
    V.l5.svg(stage).append(eq);
    const avg = A7.tag(stage, {
      x: 432,
      y: L.row1 + 6,
      text: `${S.total} bits / ${S.msg.length} symbols`,
      tone: "purple",
    });
    const floor = A7.tag(stage, {
      x: 40,
      y: L.row2,
      text: "the floor: none can beat it",
      tone: "purple",
      solid: true,
    });

    // where each source strip lands: its own left edge to its slot in the 14-cell strip
    const dx = src.map((s, j) => tgt.group(j).x - s.left);
    const dy = L.tgt - L.src;
    const arrive = (t, j) => ramp(t, T0.gather + 0.08 * j, T0.gather + 1 + 0.08 * j, E.inOut);

    return (t) => {
      legend.all((i) => ({
        k: ramp(t, T0.pop + 0.15 * i, T0.pop + 0.5 + 0.15 * i),
        s: 1 + 0.06 * flash(t, T0.pulse + 0.3 * i, T0.pulse + 0.7 + 0.3 * i),
      }));
      samp.all((j) => ({ k: ramp(t, T0.samp + 0.1 * j, T0.samp + 0.4 + 0.1 * j) }));

      src.forEach((s, j) => {
        const e = arrive(t, j);
        s.set({
          solid: true,
          k: ramp(t, T0.cells + 0.1 * j, T0.cells + 0.4 + 0.1 * j),
          x: dx[j] * e,
          y: dy * e,
          o: e >= 1 ? 0 : 1,
        });
      });
      tgt.set({ solid: true, groupK: (g) => (arrive(t, g) >= 1 ? 1 : 0) });
      surpTag.set({ k: ramp(t, T0.surp, T0.surp + 0.4) });
      fix.set({ k: ramp(t, T0.fix, T0.fix + 0.7, lin) });
      fixTag.set({ k: ramp(t, T0.fixTag, T0.fixTag + 0.4) });

      avg.set({ k: ramp(t, 9.0, 9.4) });
      V.place(eq, { s: 0.8 + 0.2 * E.pop(ramp(t, 9.2, 9.6, lin)), o: ramp(t, 9.2, 9.4, lin) });
      ent.set({
        text: S.perSymbol.toFixed(2),
        tone: "purple",
        solid: true,
        k: ramp(t, 9.4, 9.9),
        bump: flash(t, 9.7, 10.1),
      });
      floor.set({ k: ramp(t, 10.0, 10.4) });
    };
  }

  V.scene({
    kicker: "ENTROPY",
    title: ["Average surprise", "is the entropy"],
    dur: 12,
    caps: [
      [0.4, 2.6, "A source sends four symbols with these chances."],
      [2.8, 4.4, "Here are eight symbols it sent."],
      [4.6, 6.4, "Each one costs its surprise in bits."],
      [8.0, 9.8, "Fixed: 16 bits. Surprise: only 14."],
      [9.8, 11.6, "1.75 bits a symbol is the floor."],
    ],
    build,
  });
})();

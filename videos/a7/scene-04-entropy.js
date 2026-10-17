/* Phase 7 · Information Theory & Compression (algo-7), scene 04-entropy (13.2 s): entropy is the AVERAGE surprise, and it is the
   floor for compression. A source sends A, B, C or D with chances 1/2, 1/4, 1/8, 1/8 (surprise 1, 2, 3, 3 bits). A typical sample
   of eight symbols (A four times, B twice, C and D once: exactly those chances) costs 14 bits of surprise; a fixed 2-bit code
   needs 16; 14 / 8 = 1.75. Every number comes from A7.DIE / A7.SAMPLE (common.js) and is asserted below.
   Story (local seconds): 0.2-1.2 the legend (symbol, chance, surprise) pops tile by tile; 2.5-3.6 the eight sample tiles pop;
   4.4-6.9 the symbols are priced one at a time, 0.32 s each: the symbol's legend tile and its sample tile get one orange ring
   together and its orange surprise cells pop under it; 7.0-8.3 the cells of all eight symbols slide down and close up into one
   14-cell strip (the swap to the strip itself is invisible: same cells, same place); 8.7-9.3 the grey fixed strip (2 bits each,
   16 cells); 9.9-10.5 a purple dashed line marks the end of the 14th cell and the two extra fixed cells turn red (wasted);
   10.6-11.3 the average (14 bits over 8 symbols) and the entropy counter 1.75; 11.1 the floor tag. Nothing moves after 12. */
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
  const L = { legend: 22, samp: 142, src: 258, tgt: 322, fix: 394, row1: 548, row2: 462 }; // the legend's rings (9 px out) stay 12 px inside the stage
  const CELL = { cell: 32, h: 44, gap: 4, digits: false };
  const slotMid = (j) => 76 + 112 * j; // centre of sample tile j
  const T0 = {
    pop: 0.2,
    samp: 2.5,
    cells: 4.4, // symbol j is priced at cells + PRICE j
    gather: 7.0,
    surp: 8.3,
    fix: 8.7,
    fixTag: 9.3,
    line: 9.9, // the floor line and the two wasted cells
    avg: 10.6,
    ent: 10.9,
    floor: 11.1,
  };
  const PRICE = 0.32; // seconds a symbol takes to be priced: the learner sees which legend tile gives which cells

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

    // the floor drawn: a dashed purple line in the gap after the 14th fixed cell (as long as the surprise strip); the two cells
    // beyond it are the bits a fixed code wastes
    const lineX = (fix.cell(S.total - 1).x + CELL.cell + fix.cell(S.total).x) / 2;
    const floorLine = V.h("div", {
      class: "c-purple",
      style: {
        position: "absolute",
        left: `${(lineX - 3).toFixed(1)}px`,
        top: `${L.fix - 16}px`,
        width: "0",
        height: `${CELL.h + 32}px`,
        borderLeft: "6px dashed var(--c-lip)",
      },
    });
    stage.append(floorLine);
    const wasted = [...Array(S.fixedTotal - S.total).keys()].map((i) => S.total + i);

    // the result: entropy = 14 bits over 8 symbols = 1.75, and the floor
    const ent = A7.counter(stage, { x: 40, y: L.row1, w: 320, h: 72, label: "entropy", tone: "purple" });
    const eq = A7.sym("equals", 392, L.row1 + 36, 36, "purple");
    V.l5.svg(stage).append(eq);
    const avg = A7.tag(stage, {
      x: 432,
      y: L.row1 + 6,
      text: `${S.total} bits over ${S.msg.length} symbols`,
      tone: "purple",
    });
    // the floor tag hangs from the dashed line it names (centred on the line, 400 px wide)
    const floor = A7.tag(stage, {
      x: Math.round(lineX - 200),
      y: L.row2,
      text: "the floor, if nothing is lost",
      tone: "purple",
      solid: true,
    });
    floor.el.style.width = "400px";

    // where each source strip lands: its own left edge to its slot in the 14-cell strip
    const dx = src.map((s, j) => tgt.group(j).x - s.left);
    const dy = L.tgt - L.src;
    const arrive = (t, j) => ramp(t, T0.gather + 0.06 * j, T0.gather + 0.8 + 0.06 * j, E.inOut);

    return (t) => {
      // symbol j is priced in the window [a, a + PRICE]: ONE ring at a time, on its legend tile and its own sample tile
      const at = (j) => T0.cells + PRICE * j;
      const priced = (j) => ramp(t, at(j), at(j) + 0.1) * (1 - ramp(t, at(j) + PRICE - 0.1, at(j) + PRICE));
      legend.all((i) => {
        const lit = Math.max(0, ...[...S.msg].map((c, j) => (c === D.letters[i] ? priced(j) : 0)));
        return {
          k: ramp(t, T0.pop + 0.15 * i, T0.pop + 0.5 + 0.15 * i),
          s: 1 + 0.06 * lit,
          ring: lit > 0.01 ? "orange" : null,
          ringK: lit,
        };
      });
      samp.all((j) => ({
        k: ramp(t, T0.samp + 0.1 * j, T0.samp + 0.4 + 0.1 * j),
        ring: priced(j) > 0.01 ? "orange" : null,
        ringK: priced(j),
      }));

      src.forEach((s, j) => {
        const e = arrive(t, j);
        s.set({
          solid: true,
          k: ramp(t, at(j), at(j) + 0.3),
          x: dx[j] * e,
          y: dy * e,
          o: e >= 1 ? 0 : 1,
        });
      });
      tgt.set({ solid: true, groupK: (g) => (arrive(t, g) >= 1 ? 1 : 0) });
      surpTag.set({ k: ramp(t, T0.surp, T0.surp + 0.4) });
      const waste = ramp(t, T0.line + 0.2, T0.line + 0.5, lin);
      fix.set({
        k: ramp(t, T0.fix, T0.fix + 0.6, lin),
        cells:
          waste > 0
            ? Object.fromEntries(
                wasted.map((i) => [
                  i,
                  { tone: "red", solid: true, s: 1 + 0.12 * flash(t, T0.line + 0.2, T0.line + 0.6) },
                ]),
              )
            : {},
      });
      V.place(floorLine, {
        s: 0.6 + 0.4 * E.pop(ramp(t, T0.line, T0.line + 0.4, lin)),
        o: Math.min(1, ramp(t, T0.line, T0.line + 0.2, lin) * 4),
      });
      fixTag.set({ k: ramp(t, T0.fixTag, T0.fixTag + 0.4) });

      avg.set({ k: ramp(t, T0.avg, T0.avg + 0.4) });
      V.place(eq, { s: 0.8 + 0.2 * E.pop(ramp(t, T0.ent, T0.ent + 0.4, lin)), o: ramp(t, T0.ent, T0.ent + 0.2, lin) });
      ent.set({
        text: S.perSymbol.toFixed(2),
        tone: "purple",
        solid: true,
        k: ramp(t, T0.ent, T0.ent + 0.5),
        bump: flash(t, T0.ent + 0.3, T0.ent + 0.7),
      });
      floor.set({ k: ramp(t, T0.floor, T0.floor + 0.4) });
    };
  }

  V.scene({
    kicker: "ENTROPY",
    title: ["Average surprise", "is the entropy"],
    dur: 13.2,
    caps: [
      [0.4, 2.2, "A source sends four symbols with these chances."],
      [2.5, 4.2, "A typical eight: A four times, B twice."],
      [4.5, 6.9, "Each one costs its surprise in bits."],
      [9.0, 10.8, "A fixed 2-bit code: 16 bits. Surprise: only 14."],
      [11.2, 13.0, "1.75 bits a symbol: the floor, if nothing is lost."],
    ],
    build,
  });
})();

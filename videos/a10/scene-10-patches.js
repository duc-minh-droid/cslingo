/* Phase 10 · scene 10-patches (12 s): BEYOND TEXT (lesson 10.8). Anything that can be cut into tokens can go through a transformer, not
   only words: a Vision Transformer cuts a picture into square PATCHES and treats every patch as a token. A 224 x 224 picture in 16 x 16
   patches is 14 x 14 = 196 tokens; every token scores every token, so the grid of scores has 196 x 196 = 38,416 cells. Halve the
   patch size to 8 x 8: 28 x 28 = 784 tokens (four times as many) and 784 x 784 = 614,656 scores (sixteen times as many): attention
   costs the SQUARE of the number of tokens, and the old score grid is just one of sixteen equal blocks of the new one (the top-left
   block of a 4 x 4 arrangement, because 784 is 4 x 196). Every number comes from A10.VIT (common.js) and is asserted again here.
   Story (local seconds): 0.2-0.8 the picture pops; 0.8-2.2 the 14 x 14 lattice draws on; 1.0 the size tag; 2.0 the patch-size tag;
   2.5-3.5 the 14 patches of the top row light up orange one after another and the first ten token tiles pop in step, an orange arrow
   leads from the picture to the tiles, the dots and the green "14 x 14 = 196 tokens" tag follow (3.1); 4.8-5.9 one big green square (the grid of
   scores) pops with its "196 x 196" tag, then the green "38,416 scores" tag; 7.4-8.9 half-size patches: the 28 x 28 lattice draws
   over the picture, the patch-size tag changes to 8 x 8, the tokens tag turns into a red "28 x 28 = 784 tokens" with an orange "x 4";
   9.4-11.3 the big square shrinks into the corner of a 4 x 4 block, the other fifteen cells pop in red, the score tag turns into a
   red "614,656 scores" with an orange "x 16". Hold to 12. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const VIT = A10.VIT;
  const [C, F] = [VIT.coarse, VIT.fine];

  A10.same(
    "patches: 16 pixel patches of the 224 pixel picture",
    [VIT.image / C.patch, C.side, C.tokens, C.scoresTxt],
    [14, 14, 196, "38,416"],
  );
  A10.same(
    "patches: 8 pixel patches of the 224 pixel picture",
    [VIT.image / F.patch, F.side, F.tokens, F.scoresTxt],
    [28, 28, 784, "614,656"],
  );
  A10.same("patches: every token scores every token", [C.tokens * C.tokens, F.tokens * F.tokens], [C.scores, F.scores]);
  A10.same(
    "patches: half the patch size is four times the tokens and sixteen times the scores",
    [C.patch / F.patch, F.tokens / C.tokens, F.scores / C.scores],
    [2, 4, 16],
  );
  A10.same("patches: the ratio tags", [VIT.tokenRatio, VIT.scoreRatio], [4, 16]);
  A10.same(
    "patches: the old score grid is one block of a 4 x 4 arrangement (the tokens grow 4 times, so the grid grows 4 times per side)",
    [VIT.tokenRatio * VIT.tokenRatio, F.tokens ** 2 / C.scores, (VIT.tokenRatio * C.tokens) ** 2],
    [16, 16, F.scores],
  );

  // layout (stage px)
  const PIC = { x: 24, y: 40, size: 300 };
  const STRIP = { x: 380, y: 70, n: 10, w: 40, h: 40, gap: 6 };
  const BIG = { x: 410, y: 340, size: 232 };
  const BLOCK = { x: 410, y: 340, rows: 4, cols: 4, cell: 58, gap: 2, radius: 8 };
  const ROWS = VIT.tokenRatio; // the old grid is 1 of ROWS x ROWS equal blocks
  const SHRINK = BLOCK.cell / BIG.size; // 0.25: the big square ends as one cell of the block
  const HOP = (BIG.size - BLOCK.cell) / 2; // 87: how far its centre travels, in x and in y

  // timeline (local seconds)
  const TM = {
    pic: [0.2, 0.8],
    lattice: [0.8, 2.2],
    size: [1.0, 1.4],
    patch: [2.0, 2.4], // the patch-size tag
    row: [2.5, 3.5], // the 14 patches of the top row light up, one by one
    arrow: [2.6, 3.2],
    dots: [3.3, 3.6],
    tokens: [3.1, 3.5], // the green "196 tokens" tag
    big: [4.8, 5.3], // the big green square (the grid of scores) and its tag
    scores: [5.5, 5.9], // the green "38,416 scores" tag
    half: [7.4, 8.6], // the 28 x 28 lattice draws on
    rowOff: [7.3, 7.6], // the lit row fades
    patchTo: 7.6, // "patch: 8 x 8 pixels"
    coarseOut: [8.6, 8.9], // the 14 x 14 lattice fades out
    tokensTo: 8.1, // "784 tokens"
    x4: [8.5, 8.9],
    tagOut: [9.4, 9.6], // the "196 x 196" tag leaves the big square
    shrink: [9.5, 10.2],
    cells: 10.05, // the fifteen red cells pop from here, 0.05 s apart
    scoresTo: 10.5, // "614,656 scores"
    x16: [10.9, 11.3],
    bump: 0.3,
  };

  A10.same(
    "patches: the big square travels from its centre to the centre of the block's first cell",
    [BIG.x + BIG.size / 2 - HOP, BIG.y + BIG.size / 2 - HOP, BIG.size * SHRINK],
    [BLOCK.x + BLOCK.cell / 2, BLOCK.y + BLOCK.cell / 2, BLOCK.cell],
  );

  function build(stage) {
    // the picture and its two lattices
    const ph = A10.photo(stage, PIC);
    const l14 = A10.lattice(stage, { ...PIC, n: C.side });
    const l28 = A10.lattice(stage, { ...PIC, n: F.side });
    const size = A10.tag(stage, { x: 46, y: 352, text: `${VIT.image} × ${VIT.image} pixels` });
    A10.same("patches: the size tag is 265 px wide", size.w, 265);
    const patchTxt = (p) => `patch: ${p} × ${p} pixels`;
    const patch = A10.tag(stage, { x: 17, y: 422, w: A10.tagW(patchTxt(C.patch)), text: patchTxt(C.patch) });
    A10.same(
      "patches: the patch tag is 323 px wide and its second text fits",
      [patch.w, A10.tagW(patchTxt(F.patch)) <= patch.w],
      [323, true],
    );
    A10.same(
      "patches: the picture and its tags stay left of the token column",
      [patch.x + patch.w <= STRIP.x - 12, size.x + size.w <= STRIP.x - 12],
      [true, true],
    );
    A10.same(
      "patches: the patch is one lattice cell",
      [Math.round((PIC.size / C.side) * 100) / 100, Math.round((PIC.size / F.side) * 100) / 100],
      [21.43, 10.71],
    );

    // the tokens: a strip of tiles (the first ten of 196), dots, an arrow from the picture and the count
    const tok = A10.cells(stage, {
      x: STRIP.x,
      y: STRIP.y,
      texts: Array(STRIP.n).fill(""),
      w: STRIP.w,
      h: STRIP.h,
      gap: STRIP.gap,
      tone: "grey",
    });
    const dots = A10.tag(stage, { x: 842, y: 71, text: "…" });
    const arrowSvg = A10.svg(stage);
    const arrow = arrowSvg.appendChild(L5.arrow(332, 150, 374, 92, "orange", 1, { w: 6, head: 16, bow: 10 }));
    const tokTxt = (v) => `${v.side} × ${v.side} = ${v.tokens} tokens`; // "14 × 14 = 196 tokens": the count of patches
    const tkW = A10.tagW(tokTxt(C));
    const tk = A10.tag(stage, { x: 380, y: 126, w: tkW, text: tokTxt(C), tone: "green", solid: true });
    A10.same(
      "patches: the token tag has the same width for both counts",
      [A10.tagW(tokTxt(F)), tokTxt(C), tokTxt(F)],
      [tkW, "14 × 14 = 196 tokens", "28 × 28 = 784 tokens"],
    );
    const x4 = A10.tag(stage, {
      x: tk.x + tk.w + 16,
      y: 126,
      text: `× ${VIT.tokenRatio}`,
      tone: "orange",
      solid: true,
    });
    A10.same("patches: the x4 tag is 84 px wide", x4.w, 84);
    A10.same(
      "patches: the strip and the dots fit the stage",
      [tok.x + tok.width, dots.x + dots.w <= 924, x4.x + x4.w <= 924],
      [834, true, true],
    );

    // the scores: one big square (196 x 196) that shrinks into one block of a 4 x 4 arrangement
    const sq = A10.grid(stage, BLOCK);
    A10.same("patches: the block is 238 px wide", [sq.width, sq.height], [238, 238]);
    const big = A10.cells(stage, {
      x: BIG.x,
      y: BIG.y,
      texts: [""],
      w: BIG.size,
      h: BIG.size,
      tone: "green",
      solid: true,
      radius: Math.round(BLOCK.radius / SHRINK),
    });
    const t196 = A10.tag(stage, {
      x: BIG.x + BIG.size / 2 - 88,
      y: BIG.y + BIG.size / 2 - 29,
      text: `${C.tokens} × ${C.tokens}`,
      tone: "green",
    });
    A10.same("patches: the 196 x 196 tag is 176 px wide", t196.w, 176);
    const sc = A10.tag(stage, { x: 668, y: 350, w: 245, text: `${C.scoresTxt} scores`, tone: "green", solid: true });
    A10.same(
      "patches: the score tag fits both texts and the stage",
      [A10.tagW(`${C.scoresTxt} scores`) <= sc.w, A10.tagW(`${F.scoresTxt} scores`), sc.x + sc.w <= 924],
      [true, 245, true],
    );
    const x16 = A10.tag(stage, { x: 668, y: 420, text: `× ${VIT.scoreRatio}`, tone: "orange", solid: true });
    A10.same("patches: the x16 tag is 101 px wide", x16.w, 101);
    A10.same(
      "patches: the block ends inside the stage",
      [BLOCK.x + sq.width <= 924, BLOCK.y + sq.height <= 630],
      [true, true],
    );

    return (t) => {
      // 1. the picture, cut into 14 x 14 patches
      ph.set({ k: ramp(t, ...TM.pic, E.lin) });
      const litN = Math.ceil(C.side * ramp(t, ...TM.row, E.lin));
      const hotK = 1 - ramp(t, ...TM.rowOff, E.lin);
      l14.set({
        k: ramp(t, ...TM.lattice, E.lin),
        o: 1 - ramp(t, ...TM.coarseOut, E.lin),
        hot: hotK > 0 ? Array.from({ length: litN }, (_, c) => [0, c]) : [],
        hotTone: "orange",
        hotK,
      });
      l28.set({ k: ramp(t, ...TM.half, E.lin) });
      size.set({ k: ramp(t, ...TM.size, E.lin) });
      const fineP = t >= TM.patchTo;
      patch.set({
        k: ramp(t, ...TM.patch, E.lin),
        text: patchTxt(fineP ? F.patch : C.patch),
        s: 1 + 0.1 * flash(t, TM.patchTo, TM.patchTo + TM.bump),
      });

      // 2. every patch is a token
      tok.all((i) => A10.pop(A10.seq(t, TM.row[0], (TM.row[1] - TM.row[0]) / C.side, 0.3, i)));
      dots.set({ k: ramp(t, ...TM.dots, E.lin) });
      L5.drawOn(arrow, ramp(t, ...TM.arrow, E.out));
      const fineT = t >= TM.tokensTo;
      tk.set({
        k: ramp(t, ...TM.tokens, E.lin),
        text: tokTxt(fineT ? F : C),
        tone: fineT ? "red" : "green",
        s: 1 + 0.1 * flash(t, TM.tokensTo, TM.tokensTo + TM.bump),
      });
      x4.set({ k: ramp(t, ...TM.x4, E.lin) });

      // 3. every token scores every token
      const bk = ramp(t, ...TM.big, E.lin);
      const kk = E.inOut(ramp(t, ...TM.shrink, E.lin));
      const pop = A10.pop(bk);
      big.set(0, { x: -HOP * kk, y: -HOP * kk, s: pop.s * (1 - (1 - SHRINK) * kk), o: pop.o });
      t196.set({ k: bk, o: 1 - ramp(t, ...TM.tagOut, E.lin) });
      const fineS = t >= TM.scoresTo;
      sc.set({
        k: ramp(t, ...TM.scores, E.lin),
        text: `${(fineS ? F : C).scoresTxt} scores`,
        tone: fineS ? "red" : "green",
        s: 1 + 0.08 * flash(t, TM.scoresTo, TM.scoresTo + TM.bump),
      });

      // 4. half-size patches: the old grid is one block of sixteen, the other fifteen are new cost
      sq.all((r, c) => {
        const j = r * ROWS + c - 1; // the first cell is where the big square ends up
        return c + r === 0 ? { k: 0 } : { v: 0.6, tone: "red", k: A10.seq(t, TM.cells, 0.05, 0.3, j) };
      });
      x16.set({ k: ramp(t, ...TM.x16, E.lin) });
    };
  }

  V.scene({
    kicker: "BEYOND TEXT",
    title: ["Anything can be cut", "into tokens"],
    dur: 12,
    caps: [
      [0.9, 2.5, "A picture can be cut into patches."],
      [3, 4.8, "Each patch is a token: 196 in all."],
      [5, 6.8, "Every token scores every token: 196 × 196."],
      [7.8, 9.6, "Half-size patches: four times the tokens."],
      [10.1, 11.9, "But sixteen times the scores."],
    ],
    build,
  });
})();

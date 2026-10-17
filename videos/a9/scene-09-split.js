/* Phase 9 · Fourier Transform & FFT (algo-9), scene 09: "The FFT splits evens from odds" (12.5 s).
   IDEA (the FFT, first split): a DFT of 8 samples costs 8 x 8 = 64 products. Split the samples into evens (x0 x2 x4 x6) and odds (x1 x3 x5 x7):
   each half is a DFT of 4 samples (4 x 4 = 16 products), so the two halves cost 32. Their answers E0..E3 and O0..O3 are joined by 4 butterflies:
   butterfly k pairs E_k with O_k (turned by the purple dot) and makes TWO answers, X_k (plus) and X_(k+4) (minus), from ONE product.
   Layout: the shared FFT rig (A9.fftRig, also used by scene 10): input tiles on the left, the answer tiles X0..X7 on the right, the last level of
   butterflies between them. The COST is drawn as well as written: a block of small cells, one cell per product (an 8 x 8 block in the red box,
   rows = the 8 answers, columns = the 8 samples). The split keeps the top four rows (the half-size DFTs only compute E0..E3 and O0..O3; the other
   four answers come free from the butterflies), the even columns fly into the blue box and the odd columns into the purple box: 64 cells become
   two blocks of 16.
   Colours (video-wide): blue = the even half / samples, purple = the odd half and the butterfly's dot, orange = the answers, red = the direct way,
   green = saved work. Timeline: 0.2 input tiles, 0.7 red box, 1.0 the 64 cells, 1.3 answer tiles, 1.4 '64 products', 3.0-4.4 the split (the
   32 cells the halves do not need fade 3.0-3.5, the odd columns drop into the lower box 3.3-4.1, the columns close up and the boxes narrow
   3.7-4.4), 4.2 box labels, 4.4 'was 64 products' + the green cost tag, 5.0 E / O tiles, 5.6 butterflies draw on (grey), 6.6 butterfly 1
   lights up in a purple glow and the 'a butterfly' tag pops, 7.0 plus / minus, 7.2 rings on X1 and X5, 8.0 butterflies 0, 2, 3 light up,
   8.8 the cost tag reads '32 + 4 butterflies', 9.0 the answers go solid, 9.4 the butterflies settle green, then a calm hold.
   Differences from the storyboard (all for the margins or for clarity): the boxes use a local 26 px margin (the rig's R.rect adds 38, which
   makes the two half boxes overlap), E / O tiles are 36 px high (so they sit inside the box edges), the bottom tags are 52 px high (a
   62 px tag at y 574 ends past the 12 px stage margin) and each box is named 'even samples' / 'odd samples' as well as '4-point DFT'.
   Every number comes from A9.FFT (common.js) and is asserted below. update(t) is pure. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const FF = A9.FFT;
  const lin = E.lin;

  // ---------- when things happen (local seconds) ----------
  const TL = {
    tiles: 0.2, // the 8 input tiles pop (0.07 s apart)
    big: [0.7, 1.2], // the red box
    cells: 1.0, // the 64 cells pop, 0.01 s apart (the last at 1.93)
    outs: 1.3, // the answer tiles pop (0.06 s apart)
    tag64: [1.4, 1.9],
    split: [3.0, 4.4], // the samples glide to their rows
    drop: [3.0, 3.5], // the 32 cells the halves do not need fade out
    down: [3.3, 4.1], // the odd columns drop into the lower box (the even ones rise a little)
    narrow: [3.7, 4.4], // the columns close up and the boxes narrow
    halves: [3.1, 3.5], // the blue and the purple box fade in over the red one (they are its top and bottom half)
    bigOut: [3.4, 3.7],
    labels: [4.2, 4.7], // 'even samples' and 'odd samples'
    cost: [4.4, 4.8], // '64 products' turns grey, the green tag pops
    eo: 5.0, // E0..E3 and O0..O3 pop (0.12 s apart)
    bf: 5.6, // the four butterflies draw on (0.1 s apart)
    focus: [6.6, 7.0], // butterfly 1 lights up
    bfTag: [6.6, 7.1],
    signs: [7.0, 7.5],
    rings: [7.2, 7.6],
    ringsOut: [8.0, 8.4], // the rings and the purple glow around butterfly 1 fade as the others light up
    rest: 8.0, // butterflies 0, 2, 3 light up, 0.3 s apart
    cost2: [8.8, 9.2],
    fft: [0.6, 1.0], // 'FFT = fast DFT' (the F is for fast), bottom right
    fftOut: [6.0, 6.4], // ... and gone before 'a butterfly' takes its place
    bfOut: [9.4, 9.8], // 'a butterfly' goes once the four butterflies are done and settle green
    solid: 9.0, // the answer tiles go solid (0.05 s apart)
    settle: 9.4, // the butterflies turn green (0.1 s apart)
  };
  // every number written on the screen is the helper's own (a butterfly costs one product, so 32 + 4 = 36 products against 64)
  const SPLIT = FF.split.products;
  const BFS = FF.split.butterflies;
  const SUM = SPLIT + BFS;
  const CAPS = [
    [1.5, 3.1, `A full DFT does all ${FF.products} products.`],
    [3.3, 4.8, "Split into even and odd samples."],
    [5.0, 6.6, `Two half-size DFTs cost ${FF.half} each.`],
    [6.9, 8.6, "One butterfly: one product, two answers."],
    [9.2, 11.4, `${SPLIT} plus ${BFS} is ${SUM} products, not ${FF.products}.`],
  ];
  const REST_ORDER = { 0: 0, 2: 1, 3: 2 }; // butterfly -> its turn at 8.0
  const GROUP = ["blue", "purple"]; // even / odd columns
  const PAIRS = [
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  // the cells: one per product (row = answer, column = sample)
  const CELL = { big: { cs: 40, p: 46, y0: 140 }, small: { cs: 34, p: 39, dy: 84 } };

  // the box that covers rows r0..r1 between lines c0 and c1 (26 px above and below the rows, so two 4-row boxes leave a 16 px gap)
  const rectOf = (R, r0, r1, c0, c1) => ({
    x: R.cols[c0] + 12,
    y: R.rowY(r0) - 26,
    w: R.cols[c1] - R.cols[c0] - 24,
    h: R.rowY(r1) - R.rowY(r0) + 52,
  });

  function layout(R) {
    const rb = rectOf(R, 0, 7, 0, 3);
    const re = rectOf(R, 0, 3, 0, 2);
    const ro = rectOf(R, 4, 7, 0, 2);
    const bigX0 = Math.round(rb.x + rb.w / 2 - (8 * CELL.big.p - (CELL.big.p - CELL.big.cs)) / 2);
    const smallW = 4 * CELL.small.p - (CELL.small.p - CELL.small.cs);
    const smallX0 = Math.round(re.x + (re.w - 80) / 2 - smallW / 2); // the left 248 px of a half box: the right 80 are for the E / O tiles
    const cells = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const kept = r < 4;
        const g = c % 2;
        const big = {
          x: bigX0 + c * CELL.big.p + CELL.big.cs / 2,
          y: CELL.big.y0 + r * CELL.big.p + CELL.big.cs / 2,
        };
        const half = g ? ro : re;
        const small = {
          x: smallX0 + ((c - g) / 2) * CELL.small.p + CELL.small.cs / 2,
          y: half.y + CELL.small.dy + r * CELL.small.p + CELL.small.cs / 2,
        };
        cells.push({ r, c, kept, g, big, small, i: r * 8 + c });
      }
    return { rb, re, ro, cells };
  }

  function check(R, Lo) {
    const { rb, re, ro, cells } = Lo;
    A9.same("scene 9 rows of the split", FF.rows(FF.evenOdd), [0, 4, 1, 5, 2, 6, 3, 7]);
    A9.same("scene 9 costs", [FF.products, FF.half, FF.split.products, FF.split.butterflies], [64, 16, 32, 4]);
    A9.same("scene 9 the total of the split: 32 products + 4 butterflies (one product each) = 36", SUM, 36);
    A9.same("scene 9 two halves of 16 make the 32", [2 * FF.half, SPLIT / FF.half], [SPLIT, 2]);
    A9.same("scene 9 'FFT = fast DFT' is gone before 'a butterfly' arrives", TL.fftOut[1] <= TL.bfTag[0], true);
    A9.same(
      "scene 9 level 2 pairs",
      FF.levels[2].map((b) => [b.a, b.b]),
      PAIRS,
    );
    A9.same(
      "scene 9 boxes",
      [rb, re, ro],
      [
        { x: 124, y: 30, w: 504, h: 528 },
        { x: 124, y: 30, w: 328, h: 256 },
        { x: 124, y: 302, w: 328, h: 256 },
      ],
    );
    // the cells are the costs: 64 in all, 32 kept, 16 in each half
    A9.same(
      "scene 9 cells",
      [
        cells.length,
        cells.filter((c) => c.kept).length,
        cells.filter((c) => c.kept && c.g === 0).length,
        cells.filter((c) => c.kept && c.g === 1).length,
      ],
      [FF.products, FF.split.products, FF.half, FF.half],
    );
    // every kept cell lands in its own box, clear of the E / O tiles (x 380) and of the label zone
    cells
      .filter((c) => c.kept)
      .forEach((c) => {
        const box = c.g ? ro : re;
        const [x0, x1] = [c.small.x - CELL.small.cs / 2, c.small.x + CELL.small.cs / 2];
        const [y0, y1] = [c.small.y - CELL.small.cs / 2, c.small.y + CELL.small.cs / 2];
        if (x0 < box.x + 12 || x1 > 380 - 20 || y0 < box.y + 80 || y1 > box.y + box.h - 14)
          throw new Error(`VID.a9: scene 9 cell ${c.i} leaves its half box`);
      });
    // the big block sits inside the red box, below its label
    cells.forEach((c) => {
      const [x0, x1] = [c.big.x - CELL.big.cs / 2, c.big.x + CELL.big.cs / 2];
      const [y0, y1] = [c.big.y - CELL.big.cs / 2, c.big.y + CELL.big.cs / 2];
      if (x0 < rb.x + 12 || x1 > rb.x + rb.w - 12 || y0 < rb.y + 60 || y1 > rb.y + rb.h - 12)
        throw new Error(`VID.a9: scene 9 cell ${c.i} leaves the red box`);
    });
    // the pictures come before the words: each caption starts after the picture it names (and not long after)
    const starts = [
      TL.cells + 0.5, // the block is half filled
      TL.split[0],
      TL.eo,
      TL.focus[0],
      TL.cost2[1] - 0.2,
    ];
    A9.same(
      "scene 9 every caption starts after its picture does (and within half a second of it)",
      CAPS.map((c, i) => c[0] >= starts[i] - 1e-9 && c[0] - starts[i] < 0.6 + 1e-9),
      CAPS.map(() => true),
    );
    A9.same(
      "scene 9 captions do not overlap and read at 4.5 words a second or less",
      CAPS.every((c, i) => (i === 0 || c[0] >= CAPS[i - 1][1]) && c[2].split(" ").length / (c[1] - c[0]) <= 4.5),
      true,
    );
    // the three bottom tags never touch (widest text of each)
    const w = A9.tagW;
    const [t64, tc, tb] = [
      36 + w(`was ${FF.products} products`),
      330 + w(`${SPLIT} + ${BFS} = ${SUM} products`),
      690 + w("a butterfly"),
    ];
    if (!(t64 < 330 && tc < 690 && tb < 924)) throw new Error("VID.a9: scene 9 the bottom tags overlap");
    if (!(330 + w(`${SPLIT / FF.half} × ${FF.half} = ${SPLIT} products`) + 8 < 670))
      throw new Error("VID.a9: scene 9 the cost tag runs into 'FFT = fast DFT'");
    if (R.rowY(7) + 26 + 6 > 574) throw new Error("VID.a9: scene 9 the network runs into the bottom tags");
  }

  /* a label made of text (a box's name), centred in a strip of a box */
  function label(parent, o) {
    const el = V.h("div", {
      class: "v-text",
      text: o.text,
      style: {
        left: `${o.x}px`,
        top: `${o.y}px`,
        width: `${o.w}px`,
        textAlign: "center",
        whiteSpace: "pre-line",
        fontSize: `${o.fs}px`,
        lineHeight: "1.12",
        color: A9.tone(o.tone).ink,
      },
    });
    parent.append(el);
    return el;
  }

  V.scene({
    kicker: "THE FFT",
    title: ["The FFT splits", "evens from odds"],
    dur: 12.5,
    caps: CAPS,
    build(stage) {
      // ---- boxes first, so the network and the tiles draw over their tint ----
      const big = A9.box(stage, { tone: "red" });
      const eb = A9.box(stage, { tone: "blue" });
      const ob = A9.box(stage, { tone: "purple" });
      const haloSvg = A9.svg(stage); // the purple glow of the butterfly in focus (under the network)
      const R = A9.fftRig(stage);
      const Lo = layout(R);
      check(R, Lo);
      const { rb, re, ro, cells } = Lo;

      // butterfly 1 (E1, O1 -> X1, X5) glows purple while it is explained: the same five lines the rig draws, wider and paler, under the network
      const b1 = R.bf(2, 1);
      const halo = [
        [b1.b, b1.dot],
        [b1.a, b1.a1],
        [b1.a, b1.b1],
        [b1.dot, b1.a1],
        [b1.dot, b1.b1],
      ].map(([p, q]) =>
        haloSvg.appendChild(
          V.s("line", {
            x1: p.x,
            y1: p.y,
            x2: q.x,
            y2: q.y,
            "stroke-width": "24",
            "stroke-linecap": "round",
            style: { stroke: A9.tone("purple").edge },
          }),
        ),
      );

      // ---- the products: one small cell each ----
      const cellSvg = A9.svg(stage);
      cells.forEach((c) => {
        c.el = cellSvg.appendChild(V.s("rect", { "stroke-width": "3" }));
      });
      const bigLab = label(stage, { text: "8-point DFT", x: rb.x, y: rb.y + 10, w: rb.w, fs: 32, tone: "red" });
      const half = (box, name, tone) =>
        label(stage, {
          text: `${name} samples\n4-point DFT`,
          x: box.x,
          y: box.y + 10,
          w: box.w - 80,
          fs: 28,
          tone,
        });
      const evenLab = half(re, "even", "blue");
      const oddLab = half(ro, "odd", "purple");

      // ---- E0..E3 and O0..O3: what the two half-size DFTs hand to the butterflies ----
      const tileSvg = A9.svg(stage);
      const conn = Array.from({ length: 8 }, (_, r) => {
        const y = R.rowY(r);
        const mk = (w) =>
          tileSvg.appendChild(
            V.s("line", { x1: 440, x2: R.cols[2], y1: y, y2: y, "stroke-width": w, "stroke-linecap": "round" }),
          );
        return { base: mk(4), hot: mk(6) };
      });
      const eo = Array.from({ length: 8 }, (_, r) =>
        A9.tile(stage, {
          x: 380,
          y: R.rowY(r) - 20,
          w: 60,
          h: 36,
          text: `${r < 4 ? "E" : "O"}${r % 4}`,
          tone: "orange",
          fs: 28,
        }),
      );

      // a small cross on every purple dot: the dot is a multiplication (the one product of a butterfly)
      const markSvg = A9.svg(stage);
      const marks = [0, 1, 2, 3].map((b) => {
        const { x, y } = R.bf(2, b).dot;
        const g = markSvg.appendChild(V.s("g"));
        [
          [-5, -5, 5, 5],
          [-5, 5, 5, -5],
        ].forEach(([a, c, d, e]) =>
          g.append(
            V.s("line", {
              x1: x + a,
              y1: y + c,
              x2: x + d,
              y2: y + e,
              "stroke-width": "3",
              "stroke-linecap": "round",
              style: { stroke: A9.tone("purple").on },
            }),
          ),
        );
        return g;
      });

      // ---- the cost tags ----
      // (52 px high, so the row ends at y 626: the default 62 px tag at y 574 would run 6 px past the stage margin)
      const row = { y: 574, h: 52 };
      const tag64 = A9.tag(stage, { ...row, x: 36, text: `${FF.products} products`, tone: "red", solid: true });
      const costText = `${SPLIT / FF.half} × ${FF.half} = ${SPLIT} products`;
      const costTag = A9.tag(stage, { ...row, x: 330, text: costText, tone: "green", solid: true });
      const bfTag = A9.tag(stage, { ...row, x: 690, text: "a butterfly", tone: "purple" });
      const fftTag = A9.tag(stage, { ...row, x: 670, text: "FFT = fast DFT", tone: "grey" }); // what the F stands for

      // how far butterfly b has got (the rig's own k / lit / tone / signs)
      const bfAt = (t, b) => {
        const k = A9.seq(t, TL.bf, 0.1, 0.5, b);
        const green = t >= TL.settle + 0.1 * b;
        const lit =
          b === 1
            ? ramp(t, TL.focus[0], TL.focus[1], lin)
            : ramp(t, TL.rest + 0.3 * REST_ORDER[b], TL.rest + 0.3 * REST_ORDER[b] + 0.4, lin);
        return {
          k,
          s: E.pop(k),
          lit: green ? 1 : lit,
          tone: green ? "green" : "orange",
          signs: b === 1 ? ramp(t, TL.signs[0], TL.signs[1], E.out) : 0,
        };
      };

      return (t) => {
        const split = ramp(t, TL.split[0], TL.split[1], E.inOut);
        const down = ramp(t, TL.down[0], TL.down[1], E.inOut);
        const narrow = ramp(t, TL.narrow[0], TL.narrow[1], E.inOut);
        const kBig = ramp(t, TL.big[0], TL.big[1], lin);
        const bigO = 1 - ramp(t, TL.bigOut[0], TL.bigOut[1], lin);
        const halves = ramp(t, TL.halves[0], TL.halves[1], lin);
        // the blue and the purple box are the top and the bottom half of the red one, which then narrow to their final width
        const half = (to) => ({ x: rb.x, y: to.y, w: lerp(rb.w, to.w, narrow), h: to.h });

        // ---- the boxes ----
        big.set({ ...rb, k: kBig, o: bigO });
        eb.set({ ...half(re), o: halves });
        ob.set({ ...half(ro), o: halves });
        V.place(bigLab, { o: Math.min(1, kBig * 4) * bigO * (1 - ramp(t, TL.drop[0], TL.drop[1], lin)) });
        const lk = ramp(t, TL.labels[0], TL.labels[1], lin);
        V.place(evenLab, { y: (1 - lk) * 8, o: lk });
        V.place(oddLab, { y: (1 - lk) * 8, o: lk });

        // ---- the eight samples ----
        R.tilesAt(FF.natural, FF.evenOdd, split, (i) => {
          const p = A9.pop(A9.seq(t, TL.tiles, 0.07, 0.4, i));
          return { s: p.s, o: p.o, y: p.y, tone: i % 2 && split > 0.5 ? "purple" : "blue" };
        });

        // ---- the products ----
        const drop = ramp(t, TL.drop[0], TL.drop[1], lin);
        cells.forEach((c) => {
          const k = A9.seq(t, TL.cells, 0.01, 0.3, c.i);
          const [uy, ux] = c.kept ? [down, narrow] : [0, 0];
          const size = lerp(CELL.big.cs, CELL.small.cs, ux);
          const sc = (0.5 + 0.5 * E.pop(k)) * (1 - 0.4 * (c.kept ? 0 : drop));
          const tn = A9.tone(c.kept && down > 0.1 ? GROUP[c.g] : "red");
          const [cx, cy] = [lerp(c.big.x, c.small.x, ux), lerp(c.big.y, c.small.y, uy)];
          A9.at(c.el, {
            x: cx - (size * sc) / 2,
            y: cy - (size * sc) / 2,
            width: size * sc,
            height: size * sc,
            rx: lerp(9, 8, ux),
          });
          c.el.style.fill = "var(--panel)";
          c.el.style.stroke = tn.c;
          V.show(c.el, Math.min(1, k * 4) * (c.kept ? 1 : 1 - drop));
        });

        // ---- the answers ----
        R.outs.all((k) => {
          const p = ramp(t, TL.outs + 0.06 * k, TL.outs + 0.06 * k + 0.4, lin);
          const ringIn = k === 1 || k === 5 ? ramp(t, TL.rings[0], TL.rings[1], lin) : 0;
          const ringK = ringIn * (1 - ramp(t, TL.ringsOut[0], TL.ringsOut[1], lin));
          const sk = ramp(t, TL.solid + 0.05 * k, TL.solid + 0.05 * k + 0.2, lin);
          return {
            o: Math.min(1, p * 4),
            s: (0.7 + 0.3 * E.pop(p)) * (1 + 0.12 * flash(t, TL.solid + 0.05 * k, TL.solid + 0.05 * k + 0.35)),
            solid: sk > 0.5,
            ring: ringK > 0 ? (k === 1 ? "green" : "red") : null,
            ringK,
          };
        });

        // ---- E0..E3 and O0..O3, their connectors and the four butterflies ----
        eo.forEach((tl, r) => {
          const p = A9.seq(t, TL.eo, 0.12, 0.35, r % 4);
          tl.set({ o: Math.min(1, p * 4), s: 0.6 + 0.4 * E.pop(p), y: -(1 - E.out(p)) * 10 });
          const st = bfAt(t, r % 4);
          const lit = st.k > 0.01 ? st.lit : 0;
          const cn = conn[r];
          const ck = clamp(A9.seq(t, TL.bf - 0.1, 0.1, 0.4, r % 4));
          cn.base.style.stroke = "var(--line-2)";
          cn.hot.style.stroke = A9.tone(st.tone).c;
          V.show(cn.base, ck * p);
          V.show(cn.hot, lit * ck * p);
        });
        const glow = ramp(t, TL.focus[0], TL.focus[1], lin) * (1 - ramp(t, TL.ringsOut[0], TL.ringsOut[1], lin));
        halo.forEach((ln) => V.show(ln, glow));
        for (let b = 0; b < 4; b++) {
          const st = bfAt(t, b);
          R.bf(2, b).set(st);
          V.place(marks[b], { s: E.pop(st.k) * 0.9 + 0.1 * st.lit, o: Math.min(1, st.k * 3) });
        }

        // ---- the cost tags ----
        const was = t >= TL.cost[0];
        tag64.set({
          text: was ? `was ${FF.products} products` : `${FF.products} products`,
          tone: was ? "grey" : "red",
          solid: !was,
          k: ramp(t, TL.tag64[0], TL.tag64[1], lin),
          s: 1 + 0.08 * flash(t, TL.cost[0], TL.cost[0] + 0.3),
        });
        const now = t >= TL.cost2[0] + 0.2;
        costTag.set({
          text: now ? `${SPLIT} + ${BFS} = ${SUM} products` : costText,
          k: ramp(t, TL.cost[0], TL.cost[1], lin),
          s: 1 + 0.08 * flash(t, TL.cost2[0], TL.cost2[1]),
        });
        bfTag.set({ k: ramp(t, TL.bfTag[0], TL.bfTag[1], lin), o: 1 - ramp(t, TL.bfOut[0], TL.bfOut[1], lin) });
        fftTag.set({ k: ramp(t, TL.fft[0], TL.fft[1], lin), o: 1 - ramp(t, TL.fftOut[0], TL.fftOut[1], lin) });
      };
    },
  });
})();

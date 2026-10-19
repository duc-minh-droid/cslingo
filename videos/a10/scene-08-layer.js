/* Phase 10 · scene 08-layer (13 s): ONE LAYER of the transformer (lesson 10.6). A strip of four blocks (Attention, Add & Norm,
   Feed-forward, Add & Norm) stays on top; below it one small picture per block:
   BEAT 1 attention: three words (the dog barked) pass blue packets of numbers along purple arcs and their strips turn green.
   BEAT 2 Add & Norm, with the lesson's numbers: x = [1, 3, 5, 7] plus F(x) = [2, -1, 0.5, -2] (an orange row and orange pieces on the
   bars, brought by the orange skip arc) gives [3, 2, 5.5, 5]; layer norm then slides the mean (3.875, a dashed line) to 0 and
   rescales: [-0.61, -1.31, 1.14, 0.79].  BEAT 3 feed-forward: the same small network, applied to each word on its own.
   BEAT 4 stack: a layer hands back the same shape it received, so identical layers stack (6 in the original paper).
   Every number comes from A10.LAYER (common.js) and is asserted again here. The strip sits at y 56 (blocks 56-120) so that the two
   skip arcs can bypass the blocks ABOVE it (apex y 20, inside the 12 px margin) and read as a detour round the part, not a connector;
   it is centred with 34 px gaps so that the enlarged active block still keeps 12 px from the stage edges. Plain words name the rows
   of beat 2: "input", "output" (what the part produced: F(x)) and "input + output". The norm view is held 0.5 s longer than the
   storyboard (D), so beats 3 and 4 start 0.5 s later than in the storyboard.
   Story (local seconds): 0.3-1.6 the four blocks (0.9-1.9 the two main parts are tinted); 1.9-4.0 attention; 4.0-8.4 add then norm
   (4.2 first skip arc, 5.0 the output row and the orange pieces, 5.4 sums, 6.1 mean line, 6.4-6.9 mean slides to 0, 6.9-7.4 rescale,
   held to 8.4); 8.4-10.5 feed-forward; 10.5-13.5 the second skip arc, the whole strip becomes one layer and six of them stack. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;

  const LY = A10.LAYER;
  const WORDS = A10.QKV.words;
  const SUM = LY.sum;
  const PX = 60; // px per unit once the numbers are normalised
  const UNIT = 32; // px per unit before
  const D = 0.5; // beats 3 and 4 start this much later than in the storyboard (the norm view is held longer)
  const STRIP_Y = 56; // the strip of four blocks (blocks 56-120); the skip arcs bypass them above

  A10.same("layer: the sentence", WORDS.join(" "), "the dog barked");
  A10.same(
    "layer: x, F(x), x + F(x), mean",
    [LY.x, LY.fx, SUM, LY.mean],
    [[1, 3, 5, 7], [2, -1, 0.5, -2], [3, 2, 5.5, 5], 3.875],
  );
  LY.x.forEach((v, i) => A10.same(`layer: x + F(x) at ${i}`, A10.r(v + LY.fx[i], 3), SUM[i]));
  A10.same("layer: after layer norm", LY.normTxt, ["−0.61", "−1.31", "1.14", "0.79"]);
  A10.close("layer: the normalised numbers have mean 0", A10.sum(LY.norm) / 4, 0, 0.01);
  A10.close("layer: the normalised numbers have spread 1", A10.sum(LY.norm.map((v) => v * v)) / 4, 1, 0.01);
  A10.same("layer: six layers", LY.N, 6);
  const SUM_TXT = SUM.map(String);
  const FX_TXT = LY.fx.map((v) => (v < 0 ? "−" : "") + Math.abs(v));
  A10.same("layer: F(x) as shown", FX_TXT, ["2", "−1", "0.5", "−2"]);
  A10.same("layer: the sums as shown", SUM_TXT, ["3", "2", "5.5", "5"]);

  // ---------- layout (stage px) ----------
  const BLOCKS = [
    { x: 22, w: 190, text: "Attention", tone: "green" },
    { x: 246, w: 190, text: "Add & Norm", tone: "orange" },
    { x: 470, w: 220, text: "Feed-forward", tone: "blue" },
    { x: 724, w: 190, text: "Add & Norm", tone: "orange" },
  ];
  // the strip is centred, with room for the active block to grow 4% and still keep 12 px from the stage edges
  A10.same(
    "layer: the strip stays inside the margins even when a block is enlarged",
    [BLOCKS[0].x - 0.02 * BLOCKS[0].w >= 12, BLOCKS[3].x + 1.02 * BLOCKS[3].w <= 924],
    [true, true],
  );
  const mid = (b) => b.x + b.w / 2;
  BLOCKS.forEach((b) => A10.same(`layer: "${b.text}" fits its block`, A10.textW(b.text) <= b.w - 16, true));
  // seconds when a block is the active one (tinted and a little larger); both main parts light up for the first caption
  const ON = [
    [
      [0.9, 4.0],
      [10.8 + D, 99],
    ],
    [
      [4.0, 7.9 + D],
      [10.8 + D, 99],
    ],
    [
      [0.9, 1.9],
      [8.0 + D, 10.0 + D],
      [10.8 + D, 99],
    ],
    [[10.0 + D, 99]],
  ];
  const CX = [250, 468, 686]; // the three word columns of beats 1 and 3
  const BARS = { x: 286, y: 506, bw: 64, gap: 36 };
  const NUM = { x: 270, fy: 140, y: 212, w: 96, h: 50, gap: 4 }; // the output row above the input row, pitch 100 like the bars
  const BAR_MID = (i) => BARS.x + i * (BARS.bw + BARS.gap) + BARS.bw / 2;
  A10.same(
    "layer: number cells sit over their bars",
    [0, 1, 2, 3].map((i) => NUM.x + i * (NUM.w + NUM.gap) + NUM.w / 2),
    [0, 1, 2, 3].map(BAR_MID),
  );
  const MEAN_Y = BARS.y - UNIT * LY.mean;
  A10.same("layer: the mean line starts at y 382", MEAN_Y, 382);
  A10.same("layer: the output row clears the strip", NUM.fy >= STRIP_Y + 64 + 12 + 4, true);
  A10.same(
    "layer: the tallest bar stays under the number row",
    BARS.y - UNIT * Math.max(...LY.x, ...SUM) >= NUM.y + NUM.h + 12,
    true,
  );
  const LINE_X = [262, 670];
  const STACK = { x: 318, y: 500, w: 300, h: 44, step: 52 };
  const ROW = { x: 331, w: 64, h: 44, gap: 6, inY: 572, outY: 166 };

  const bump = (t, a, d = 0.35, amp = 0.1) => 1 + amp * flash(t, a, a + d);
  const inAny = (t, wins) => wins.some(([a, b]) => t >= a && t < b);

  function build(stage) {
    // ---------- the strip of four blocks, always on top ----------
    const cards = BLOCKS.map((b) =>
      A10.card(stage, { x: b.x, y: STRIP_Y, w: b.w, h: 64, text: b.text, tone: b.tone, plain: true }),
    );
    const svg = A10.svg(stage);
    const links = BLOCKS.slice(0, 3).map((b, i) =>
      svg.appendChild(
        L5.arrow(b.x + b.w + 4, STRIP_Y + 32, BLOCKS[i + 1].x - 4, STRIP_Y + 32, "grey", 1, { w: 5, head: 14 }),
      ),
    );
    // the skip path: from the start of the part, over it, into the Add & Norm that follows (a bypass above the strip)
    const skips = [
      [0, 1],
      [2, 3],
    ].map(([a, b]) =>
      A10.arc(svg, {
        x1: BLOCKS[a].x + 30,
        y1: STRIP_Y - 2,
        x2: mid(BLOCKS[b]),
        y2: STRIP_Y - 2,
        lift: 34,
        tone: "orange",
        w: 6,
      }),
    );
    A10.same("layer: the skip arcs peak inside the margin", STRIP_Y - 2 - 34 - 3 >= 12, true);

    // ---------- beat 1: attention, three words share numbers ----------
    const w1 = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
    stage.append(w1);
    const tags1 = WORDS.map((w, c) => A10.tag(w1, { x: CX[c] - A10.tagW(w) / 2, y: 170, text: w }));
    const strips1 = WORDS.map((_, c) =>
      A10.cells(w1, {
        x: CX[c] - 50,
        y: 240,
        texts: ["", "", "", ""],
        w: 100,
        h: 44,
        gap: 5,
        dir: "col",
        tone: "blue",
      }),
    );
    const numTag = A10.tag(w1, { x: CX[0] - 50 - 24 - A10.tagW("numbers"), y: 306, text: "numbers", tone: "blue" });
    const svg1 = A10.svg(w1);
    const PAIRS = [
      [0, 1, -50],
      [1, 2, -50],
      [0, 2, -90],
    ];
    const arcs1 = PAIRS.map(([a, b, lift]) =>
      A10.arc(svg1, { x1: CX[a], y1: 440, x2: CX[b], y2: 440, lift, tone: "green", w: 6, dot: false }),
    );
    const packet = (tone) => {
      const c = A10.tone(tone);
      return svg1.appendChild(V.s("circle", { r: 11, "stroke-width": 3, style: { fill: c.c, stroke: c.lip } }));
    };
    const packets = PAIRS.map(() => [packet("blue"), packet("blue")]); // one each way along every arc

    // ---------- beat 2: add, then norm (the lesson's numbers) ----------
    const w2 = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
    stage.append(w2);
    const base = V.h("div", {
      style: {
        position: "absolute",
        left: `${LINE_X[0]}px`,
        top: `${BARS.y - 2}px`,
        width: `${LINE_X[1] - LINE_X[0]}px`,
        height: "5px",
        borderRadius: "3px",
        background: "var(--line-2)",
      },
    });
    w2.append(base);
    const bx = A10.bars(w2, {
      x: BARS.x,
      y: BARS.y,
      n: 4,
      dir: "v",
      unit: UNIT,
      bw: BARS.bw,
      gap: BARS.gap,
      tone: "blue",
    });
    const bd = A10.bars(w2, {
      x: BARS.x,
      y: BARS.y,
      n: 4,
      dir: "v",
      unit: UNIT,
      bw: BARS.bw,
      gap: BARS.gap,
      tone: "orange",
    });
    const nums = A10.cells(w2, {
      x: NUM.x,
      y: NUM.y,
      texts: LY.x.map(String),
      w: NUM.w,
      h: NUM.h,
      gap: NUM.gap,
      tone: "blue",
    });
    // the row label says what the numbers are now; one tag per phase, right edge at x 258 (12 px before the first number)
    const LABEL_EDGE = NUM.x - 12;
    const label = (text, tone, solid) =>
      A10.tag(w2, { x: LABEL_EDGE - A10.tagW(text), y: NUM.y + NUM.h / 2 - 29, text, tone, solid });
    const lab = [label("input", "blue"), label("input + output", "blue"), label("after norm", "green", true)];
    A10.same(
      "layer: the row labels start inside the margin",
      lab.every((l) => l.x >= 12),
      true,
    );
    const fxRow = A10.cells(w2, {
      x: NUM.x,
      y: NUM.fy,
      texts: FX_TXT,
      w: NUM.w,
      h: NUM.h,
      gap: NUM.gap,
      tone: "orange",
    });
    const addTag = A10.tag(w2, {
      x: LABEL_EDGE - A10.tagW("output"),
      y: NUM.fy + NUM.h / 2 - 29,
      text: "output",
      tone: "orange",
    });
    const meanTag = A10.tag(w2, { x: 690, y: MEAN_Y - 29, w: A10.tagW("mean 0"), text: "mean", tone: "grey" });
    const svg2 = A10.svg(w2);
    const meanLine = svg2.appendChild(
      V.s("path", {
        d: `M ${LINE_X[0]} ${MEAN_Y} L ${LINE_X[1]} ${MEAN_Y}`,
        fill: "none",
        "stroke-width": 5,
        "stroke-dasharray": "12 9",
        "stroke-linecap": "round",
      }),
    );

    // ---------- beat 3: the feed-forward network, one word at a time ----------
    const w3 = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
    stage.append(w3);
    const svg3 = A10.svg(w3);
    const cols = WORDS.map((w, c) => {
      const cx = CX[c];
      const chips = (y, tone) =>
        A10.cells(w3, {
          x: cx - 50,
          y,
          texts: ["", "", "", ""],
          w: 100,
          h: 30,
          gap: 4,
          dir: "col",
          tone,
          solid: tone === "green",
        });
      return {
        tag: A10.tag(w3, { x: cx - A10.tagW(w) / 2, y: 140, text: w }),
        input: chips(212, "blue"),
        down1: svg3.appendChild(L5.arrow(cx, 348, cx, 368, "grey", 1, { w: 5, head: 12 })),
        net: A10.card(w3, { x: cx - 75, y: 374, w: 150, h: 64, text: "network", tone: "blue", plain: false }),
        down2: svg3.appendChild(L5.arrow(cx, 442, cx, 462, "grey", 1, { w: 5, head: 12 })),
        output: chips(468, "green"),
      };
    });

    // ---------- beat 4: identical layers stack ----------
    const w4 = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
    stage.append(w4);
    const layers = Array.from({ length: LY.N }, (_, i) =>
      A10.card(w4, { x: STACK.x, y: STACK.y - STACK.step * i, w: STACK.w, h: STACK.h, text: "layer", tone: "grey" }),
    );
    const row = (y) =>
      A10.cells(w4, {
        x: ROW.x,
        y,
        texts: ["", "", "", ""],
        w: ROW.w,
        h: ROW.h,
        gap: ROW.gap,
        tone: "green",
        solid: true,
      });
    const rowIn = row(ROW.inY);
    const rowOut = row(ROW.outY);
    A10.same("layer: the two rows have the same shape", [rowIn.width, rowIn.height], [rowOut.width, rowOut.height]);
    const tagIn = A10.tag(w4, { x: 236, y: ROW.inY + ROW.h / 2 - 29, text: "in" });
    const tagOut = A10.tag(w4, { x: 226, y: ROW.outY + ROW.h / 2 - 29, text: "out" });
    const times = A10.tag(w4, {
      x: 640,
      y: STACK.y - (STACK.step * (LY.N - 1)) / 2 + STACK.h / 2 - 29,
      text: `× ${LY.N}`,
      tone: "green",
      solid: true,
    });
    A10.same(
      "layer: the stack is clear of both rows",
      [ROW.outY + ROW.h + 6 < STACK.y - STACK.step * 5 - 6, STACK.y + STACK.h + 6 < ROW.inY],
      [true, true],
    );
    A10.same("layer: the stack ends inside the stage", [ROW.inY + ROW.h + 6 <= 630, ROW.outY >= 150], [true, true]);

    return (t) => {
      // ----- the strip -----
      cards.forEach((c, i) => {
        const on = inAny(t, ON[i]);
        const k = A10.seq(t, 0.3, 0.2, 0.35, i);
        const grow = ON[i].reduce((s, [a, b]) => s + ramp(t, a, a + 0.2) - ramp(t, b, b + 0.2), 0);
        c.set({ k, plain: !on, s: 1 + 0.04 * grow });
      });
      links.forEach((g, i) => L5.drawOn(g, ramp(t, 0.5 + 0.2 * i, 0.9 + 0.2 * i)));
      skips[0].set({ k: ramp(t, 4.2, 4.9) });
      skips[1].set({ k: ramp(t, 10.3 + D, 10.8 + D) });

      // ----- beat 1 -----
      V.place(w1, { o: 1 - ramp(t, 3.9, 4.2, E.lin) });
      tags1.forEach((g, c) => g.set({ k: A10.seq(t, 2.0, 0.15, 0.35, c) }));
      numTag.set({ k: ramp(t, 2.1, 2.45, E.lin) });
      strips1.forEach((st, c) => {
        const g0 = 3.3 + 0.08 * c;
        [0, 1, 2, 3].forEach((i) => {
          const pop = A10.pop(A10.seq(t, 2.1 + 0.15 * c, 0.05, 0.35, i));
          const gi = g0 + 0.04 * i;
          const green = t >= gi;
          st.set(i, { ...pop, s: pop.s * bump(t, gi, 0.3), tone: green ? "green" : "blue", solid: green });
        });
      });
      arcs1.forEach((a, n) => a.set({ k: ramp(t, 2.4 + 0.25 * n, 2.8 + 0.25 * n) }));
      PAIRS.forEach((_, n) => {
        const f = ramp(t, 3.0 + 0.05 * n, 3.5 + 0.05 * n, E.inOut);
        packets[n].forEach((dot, d) => {
          const p = arcs1[n].at(d ? 1 - f : f); // one packet each way
          dot.setAttribute("cx", p.x.toFixed(1));
          dot.setAttribute("cy", p.y.toFixed(1));
          V.show(dot, f > 0.002 && f < 0.998 ? 1 : 0);
        });
      });

      // ----- beat 2 -----
      V.place(w2, { o: ramp(t, 4.2, 4.3, E.lin) * (1 - ramp(t, 7.9 + D, 8.2 + D, E.lin)) });
      const merge = ramp(t, 6.0, 6.25, E.lin);
      const shift = ramp(t, 6.4, 6.9, E.inOut); // the mean slides to 0
      const stretch = ramp(t, 6.9, 7.4, E.inOut); // and the spread is made 1
      const green = stretch >= 0.5;
      LY.x.forEach((x, i) => {
        const k = A10.seq(t, 4.3, 0.1, 0.35, i);
        const afterAdd = lerp(x, SUM[i], merge);
        const centred = afterAdd - LY.mean * shift;
        const v = lerp(centred, (LY.norm[i] * PX) / UNIT, stretch);
        bx.set(i, { v, k, tone: green ? "green" : "blue", solid: true });
        bd.set(i, {
          v: SUM[i],
          from: x,
          grow: ramp(t, 5.0 + 0.1 * i, 5.5 + 0.1 * i),
          tone: "orange",
          k,
          o: (1 - merge) * ramp(t, 4.95, 5.0, E.lin),
        });
        const f1 = ramp(t, 5.4 + 0.07 * i, 5.75 + 0.07 * i, E.lin);
        const f2 = ramp(t, 6.9 + 0.05 * i, 7.25 + 0.05 * i, E.lin);
        const second = f2 > 0;
        nums.flip(i, second ? f2 : f1, {
          from: second ? SUM_TXT[i] : String(x),
          to: second ? LY.normTxt[i] : SUM_TXT[i],
          tone: "blue",
          toTone: second ? "green" : "blue",
          solid: second && f2 >= 0.5,
          hop: 6,
          ...A10.pop(k),
        });
      });
      lab[0].set({ k: ramp(t, 4.3, 4.65, E.lin), o: 1 - ramp(t, 5.4, 5.6, E.lin) });
      lab[1].set({ k: ramp(t, 5.4, 5.75, E.lin), o: 1 - ramp(t, 6.9, 7.1, E.lin) });
      lab[2].set({ k: ramp(t, 6.9, 7.25, E.lin) });
      const fxFade = 1 - ramp(t, 6.0, 6.3, E.lin);
      addTag.set({ k: ramp(t, 5.0, 5.35, E.lin), o: fxFade });
      fxRow.all((j) => {
        const p = A10.pop(A10.seq(t, 5.0, 0.06, 0.3, j));
        return { s: p.s, o: p.o * fxFade };
      });
      const lineY = MEAN_Y + (BARS.y - MEAN_Y) * shift;
      const meanDone = t >= 7.35;
      meanTag.set({
        k: ramp(t, 6.15, 6.5, E.lin),
        y: lineY - MEAN_Y,
        text: meanDone ? "mean 0" : "mean",
        tone: meanDone ? "green" : "grey",
        solid: meanDone,
        s: bump(t, 7.35, 0.35, 0.08),
      });
      meanLine.style.stroke = meanDone ? A10.tone("green").c : "var(--text-dim)";
      V.place(meanLine, { y: lineY - MEAN_Y, o: ramp(t, 6.1, 6.4, E.lin) });

      // ----- beat 3 -----
      V.place(w3, { o: ramp(t, 8.1 + D, 8.2 + D, E.lin) * (1 - ramp(t, 10.0 + D, 10.3 + D, E.lin)) });
      cols.forEach((c, i) => {
        const t0 = 8.3 + D + 0.2 * i;
        c.tag.set({ k: ramp(t, t0, t0 + 0.3, E.lin) });
        c.input.all((j) => A10.pop(A10.seq(t, t0 + 0.08, 0.05, 0.3, j)));
        L5.drawOn(c.down1, ramp(t, t0 + 0.2, t0 + 0.4));
        c.net.set({ k: ramp(t, t0 + 0.25, t0 + 0.55, E.lin), s: bump(t, 9.25 + D + 0.2 * i, 0.4, 0.1) });
        L5.drawOn(c.down2, ramp(t, t0 + 0.4, t0 + 0.6));
        c.output.all((j) => A10.pop(A10.seq(t, t0 + 0.45, 0.05, 0.3, j)));
      });

      // ----- beat 4 -----
      V.place(w4, { o: ramp(t, 10.3 + D, 10.4 + D, E.lin) });
      rowIn.all((j) => A10.pop(A10.seq(t, 10.4 + D, 0.06, 0.3, j)));
      tagIn.set({ k: ramp(t, 10.4 + D, 10.75 + D, E.lin) });
      layers.forEach((c, i) => c.set({ k: ramp(t, 10.7 + D + 0.12 * i, 11.0 + D + 0.12 * i, E.lin) }));
      rowOut.all((j) => A10.pop(A10.seq(t, 11.5 + D, 0.06, 0.3, j)));
      tagOut.set({ k: ramp(t, 11.5 + D, 11.85 + D, E.lin) });
      times.set({ k: ramp(t, 11.8 + D, 12.15 + D, E.lin) });
    };
  }

  V.scene({
    kicker: "ONE LAYER",
    title: ["Each layer mixes words,", "then thinks about each one"],
    dur: 13.5,
    caps: [
      [0.9, 2.4, "Two parts, each with Add & Norm."],
      [2.6, 4.2, "Attention lets the words share information."],
      [4.6, 6.3, "A skip path adds output to input."],
      [6.5, 8.3, "Norm re-centres the numbers around zero."],
      [8.6 + D, 10.2 + D, "The same network treats each word alone."],
      [10.9 + D, 12.8 + D, "Same shape in and out, so layers stack."],
    ],
    build,
  });
})();

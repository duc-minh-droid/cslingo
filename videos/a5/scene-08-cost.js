/* Phase 5 · scene 08-cost (12 s): WRAP OR SCAN? Gift wrapping sweeps all n points once per hull corner (about n x h steps), the
   Graham scan sorts and scans once (about n x log n steps) whatever the hull. Two rows share one scale: a dot cloud on the left,
   two bars on the right (one step = 400 / 10,240 px). Row 1, a blob with only 4 corners: wrap 4,096 against scan 10,240, wrap
   wins. Row 2, a ring where every point is a corner: wrap 1,048,576 (far off the scale: a longer bar with the break mark)
   against the same 10,240, scan wins, wrap costs about 100 times more. Every number comes from A5.COST (asserted below); the
   clouds are a picture of the SHAPE (fewer dots than 1,024), the tags carry the numbers.
   Story (local seconds): 0.2-1.1 the blob's dots pop in, 0.7 'n = ... points', 1.1-1.9 its four corners turn green and the hull
   outline draws, 1.5 'h = 4 corners'; 2.0 key 'wrap: n x h', 2.2-3.0 wrap bar, 2.8 key 'scan: n log n', 3.0-3.8 scan bar (3.4
   key 'log n = 10'), 4.0-4.6 verdict (wrap green, scan red, 'wrap wins'); 5.9-7.1 the ring pops in, turns green and closes,
   6.8 'n = ...', 7.0 'h = 1,024 corners'; 8.2-9.2 the wrap bar explodes past the scale (break mark), 9.4-10.0 the scan bar
   stays at the same length, 10.1-10.65 verdict (wrap red, scan green, 'scan wins'), 10.7 'about 100 x more', 11-12 hold. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const lin = E.lin;
  const com = A5.commas;

  // ---------- the numbers (all from the real cost formulas) ----------
  const C = A5.COST;
  const [SMALL, BIG] = C.cases;
  A5.same(
    "scene 8: cost",
    [C.n, C.scan, C.tie, C.cases.map((c) => [c.h, c.wrap, c.scan, c.winner])],
    [1024, 10240, 10, [[4, 4096, 10240, "wrap"], [1024, 1048576, 10240, "scan"]]], // prettier-ignore
  );
  A5.same("scene 8: log n", A5.log2n(C.n), 10);
  A5.same("scene 8: blob corners", A5.cloudHull(A5.BLOB).length, 4);
  A5.same("scene 8: ring corners", A5.cloudHull(A5.RING).length, 48);
  const RATIO = Math.round(BIG.wrap / BIG.scan / 100) * 100; // 102.4 -> "about 100 times"
  A5.same("scene 8: how many times dearer", RATIO, 100);

  // ---------- layout (stage px) ----------
  const X_COL = 270; // right-hand column: tags and labels
  const X_BAR = 380; // the bars start here
  const L = 400; // full scale: 10,240 steps = 400 px
  const L_BIG = 520; // the broken bar is drawn longer than the scale, with its break mark
  const BAR_H = 56;
  const BOX = 220; // the dot clouds live in a 220 px box at x 24
  const ROWS = [
    { y0: 76, cloud: A5.BLOB, cs: SMALL, blob: true },
    { y0: 360, cloud: A5.RING, cs: BIG, blob: false },
  ];

  // ---------- one row's dot cloud ----------
  function cloudRow(stage, R, T) {
    const pos = Object.fromEntries(R.cloud.map((c, i) => [`p${i}`, [24 + c[0] * BOX, R.y0 + c[1] * BOX]]));
    const pl = A5.plot(stage, { pos, r: 6, letters: false, segs: 0, arcs: 0, polys: 1, tags: 0 });
    const hull = A5.cloudHull(R.cloud); // indices, in hull order
    const isCorner = new Set(hull);
    // the dots pop in at a seeded random order (a blob) or one after another round the ring
    const rnd = A5.rng(R.blob ? 11 : 3);
    const key = R.cloud.map((_, i) => (R.blob ? rnd() : i));
    const rank = key.map((k) => key.filter((o) => o < k).length);
    const n = R.cloud.length;
    const dotT = (i) => lerp(T.dots[0], T.dots[1] - 0.3, rank[i] / (n - 1));
    const greenT = (i) => (R.blob ? T.green[0] + 0.1 * hull.indexOf(i) : lerp(T.green[0], T.green[1], rank[i] / (n - 1)));
    return (t) => {
      const points = {};
      R.cloud.forEach((_, i) => {
        const k = ramp(t, dotT(i), dotT(i) + 0.3, lin);
        const on = (R.blob ? isCorner.has(i) : true) && t >= greenT(i);
        const pulse = on ? flash(t, greenT(i), greenT(i) + 0.4) : 0;
        const big = R.blob && on ? lerp(1, 1.9, ramp(t, greenT(i), greenT(i) + 0.3)) : 1;
        points[`p${i}`] = {
          tone: on ? "green" : "grey",
          solid: on,
          s: E.pop(k) * big * (1 + 0.3 * pulse),
          o: Math.min(1, k * 4),
        };
      });
      const k = ramp(t, T.outline[0], T.outline[1], lin);
      pl.update({ points, polys: [{ pts: hull.map((i) => `p${i}`), tone: "green", fill: 0.3, w: 0.6, k }] });
    };
  }

  // ---------- one row's tags, labels and bars ----------
  const pop = (el, k, o = 1) => V.place(el, { s: 0.8 + 0.2 * E.pop(k), o: Math.min(1, k * 4) * o });

  function barsRow(stage, R, T) {
    const { y0, cs, blob } = R;
    const yW = y0 + 60; // wrap bar
    const yS = y0 + 130; // scan bar
    const nTag = A5.tag(stage, { x: X_COL, y: y0, text: `n = ${com(C.n)} points` });
    const hTag = A5.tag(stage, { x: X_COL + 304, y: y0, text: `h = ${com(cs.h)} corners`, tone: "green", solid: true });
    const label = (text, y) => V.h("div", { class: "v-text", text, style: { left: `${X_COL}px`, top: `${y + 9}px` } });
    const lW = label("wrap", yW);
    const lS = label("scan", yS);
    stage.append(lW, lS);
    const bW = A5.bar(stage, { x: X_BAR, y: yW, w: blob ? L : L_BIG, h: BAR_H });
    const bS = A5.bar(stage, { x: X_BAR, y: yS, w: L, h: BAR_H });
    const winTxt = `${cs.winner} wins`;
    const win = A5.tag(stage, { x: X_COL, y: y0 + 196, text: winTxt, tone: "green", solid: true });
    const times = blob
      ? null
      : A5.tag(stage, { x: X_COL + 190, y: y0 + 196, text: `wrap: about ${RATIO} × more`, tone: "red" });
    const wrapWins = cs.winner === "wrap";

    return (t) => {
      nTag.set({ k: ramp(t, T.n, T.n + 0.3, lin) });
      hTag.set({ k: ramp(t, T.h, T.h + 0.35, lin) });
      pop(lW, ramp(t, T.bW[0] - 0.1, T.bW[0] + 0.25, lin));
      pop(lS, ramp(t, T.bS[0] - 0.1, T.bS[0] + 0.25, lin));
      // the bars grow, the numbers count up with them (the broken bar is not to scale: its number is what counts)
      const gW = ramp(t, T.bW[0], T.bW[1], E.out);
      const gS = ramp(t, T.bS[0], T.bS[1], E.out);
      const tone = (own, w) => (t < T.verdict + (w ? 0 : 0.12) ? "grey" : own);
      const wrapTone = tone(wrapWins ? "green" : "red", true);
      const scanTone = tone(wrapWins ? "red" : "green", false);
      bW.set({
        k: blob ? gW * (cs.wrap / C.scan) : gW,
        tone: wrapTone,
        text: com(Math.round(cs.wrap * gW)),
        textOut: blob,
        over: blob ? 0 : ramp(gW, 0.8, 1, lin),
      });
      bS.set({ k: gS * (cs.scan / C.scan), tone: scanTone, text: com(Math.round(cs.scan * gS)), textOut: true });
      win.set({ k: ramp(t, T.verdict + 0.3, T.verdict + 0.65, lin) });
      if (times) times.set({ k: ramp(t, T.verdict + 0.6, T.verdict + 0.95, lin) });
    };
  }

  // ---------- the key: what each method costs ----------
  function keyRow(stage) {
    const wrapK = A5.tag(stage, { x: 24, y: 12, text: "wrap: n × h" });
    const scanK = A5.tag(stage, { x: 248, y: 12, text: "scan: n log n" });
    const logK = A5.tag(stage, { x: 510, y: 12, text: `log n = ${A5.log2n(C.n)}` });
    return (t) => {
      wrapK.set({ k: ramp(t, 2.0, 2.35, lin) });
      scanK.set({ k: ramp(t, 2.8, 3.15, lin) });
      logK.set({ k: ramp(t, 3.4, 3.75, lin) });
    };
  }

  V.scene({
    kicker: "WRAP OR SCAN?",
    title: ["The cost depends on", "the size of the hull"],
    dur: 12,
    caps: [
      [1, 3, "1,024 points, and only 4 are corners."],
      [3.2, 5, "Wrapping: 4,096 steps. Scan: 10,240."],
      [5.1, 6.6, "A small hull favours wrapping."],
      [7, 8.9, "Now every point is a corner."],
      [9.3, 11.6, "Wrapping explodes. The scan stays at 10,240."],
    ],
    build(stage) {
      const T1 = {
        dots: [0.2, 1.1], green: [1.1, 1.5], outline: [1.3, 1.9], n: 0.7, h: 1.5,
        bW: [2.2, 3.0], bS: [3.0, 3.8], verdict: 4.0,
      }; // prettier-ignore
      const T2 = {
        dots: [5.9, 6.8], green: [6.4, 6.9], outline: [6.5, 7.1], n: 6.8, h: 7.0,
        bW: [8.3, 9.2], bS: [9.4, 10.0], verdict: 10.1,
      }; // prettier-ignore
      const parts = [
        cloudRow(stage, ROWS[0], T1),
        cloudRow(stage, ROWS[1], T2),
        keyRow(stage),
        barsRow(stage, ROWS[0], T1),
        barsRow(stage, ROWS[1], T2),
      ];
      return (t) => parts.forEach((p) => p(t));
    },
  });
})();

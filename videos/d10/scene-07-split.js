/* Lecture 10 (ds-10) · scene 7 (ADWIN'S TEST): after each record ADWIN splits its window into an older part and a newer part
   and compares their error rates; when the gap reaches the threshold ε_cut it drops the oldest records. The threshold is big
   when a part is small, so a few odd records cannot trigger a cut. Lesson 10.2 step 3 (adwinRun): 80 records at 10%, then new
   records at 60%. Every split, rate, gap and threshold comes from D10.SPLIT (frames[end] = the best split of the first end
   records; after = the window once the cut is made); the scene only reads it.
   Colours: blue = the window, the newer part and the gap, grey = right records, the older part and the threshold, red = errors,
   a gap that beats the threshold and the dropped records, green = parts that agree.
   Story (local seconds): 0.3-1.2 80 records; 1.6 the best split and the test bars; 2.2-3.0 ten new records (gap 0.55 <
   threshold 0.79: no cut); 5.6-7.4 21 more records, the threshold shrinks; 7.4 at 111 the gap wins; 8.8-9.8 the 8 oldest
   fall away (window 103, no split passes); 10.4 the threshold for big and small parts. Hold to 13. */
(function () {
  const V = window.VID;
  const D10 = V.d10;
  const D4 = V.d4;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const S = D10.SPLIT;
  const { fm, pc } = D10;
  const F = S.frames[S.fire];
  const G = S.frames[90];
  const A = S.after;
  const OLD = S.old;
  const oldRate = S.all.slice(0, OLD).reduce((a, b) => a + b, 0) / OLD;
  // records in the stream: [t0, t1, from, to]
  const SEGS = [
    [0.3, 1.2, 0, OLD],
    [2.2, 3.0, OLD, 90],
    [5.6, 7.4, 90, S.fire],
  ];
  const endOf = (t) => {
    let n = 0;
    SEGS.forEach(([t0, t1, a, b]) => {
      if (t >= t0) n = t >= t1 ? b : lerp(a, b, (t - t0) / (t1 - t0));
    });
    return Math.floor(n + 1e-9);
  };
  const FIRE = 7.4; // the 111th record arrives and the gap wins
  const CUT = 8.8; // the oldest records fall away
  const SWAP = 9.4; // the parts and bars show the window after the cut
  D10.same(
    "split scene: 80 old at 10%; at 90 gap 0.55 < 0.79; fires at 111 (0.54 ≥ 0.52); drops 8 -> 103 (0.526 < 0.527)",
    [
      OLD,
      oldRate,
      fm(G.gap),
      fm(G.eps),
      G.fire,
      S.fire,
      fm(F.gap),
      fm(F.eps),
      S.drop,
      A.win,
      fm(A.gap, 3),
      fm(A.eps, 3),
    ],
    [80, 0.1, "0.55", "0.79", false, 111, "0.54", "0.52", 8, 103, "0.526", "0.527"],
  );

  V.scene({
    kicker: "ADWIN'S TEST",
    title: ["Cut where the two parts", "disagree"],
    dur: 13,
    caps: [
      [0.4, 1.8, `A window of ${OLD} records, about ${pc(oldRate)} errors.`],
      [1.9, 3.6, "ADWIN tries splits: an older part and a newer part."],
      [3.8, 5.4, `Few new records: gap ${fm(G.gap)}, threshold ${fm(G.eps)}. No cut.`],
      [5.6, 7.2, "More records, a lower threshold."],
      [7.4, 8.6, `${S.fire} records: gap ${fm(F.gap)} beats the threshold ${fm(F.eps)}.`],
      [8.8, 10.2, `Cut: drop the ${S.drop} oldest records. No split passes the test now.`],
      [10.4, 12.6, "Small parts need a big gap, so noise rarely cuts."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const s = D10.strip(svg, { x0: 30, x1: 906, r0: 0, r1: S.fire, y: 150, h: 70, cells: true });
      const win = D10.span(svg);
      const w0 = D10.span(svg);
      const w1 = D10.span(svg);
      const line = svg.appendChild(V.s("line", { y1: 124, y2: 246, "stroke-width": 5, "stroke-linecap": "round" }));
      line.setAttribute("stroke", D4.tone("blue").c);

      const head = D4.tag(stage, { x: 468, y: 80, text: `${OLD} records · ${pc(oldRate)} errors`, tone: "grey" });
      const older = D4.tag(stage, { y: 312, text: "older", tone: "grey" });
      const newer = D4.tag(stage, { y: 312, text: "newer", tone: "blue" });
      const gapBar = D4.bar(stage, { x: 300, y: 384, w: 560, h: 40, tone: "blue" });
      const epsBar = D4.bar(stage, { x: 300, y: 444, w: 560, h: 40, tone: "grey" });
      const gapLab = D4.label(stage, { x: 286, y: 404, text: "gap", tone: "blue", anchor: "r" });
      const epsLab = D4.label(stage, { x: 286, y: 464, text: "threshold", tone: "grey", anchor: "r" });
      const wait = D4.tag(stage, { x: 468, y: 536, text: "not enough evidence yet", tone: "grey" });
      const fire = D4.tag(stage, { x: 468, y: 536, text: "gap ≥ threshold: cut", tone: "red", solid: true });
      const agree = D4.tag(stage, { x: 468, y: 536, text: `no cut left: window ${A.win}`, tone: "green", solid: true });
      const small = D4.tag(stage, { x: 250, y: 602, text: `40 + 40: threshold ${fm(S.eps40)}`, tone: "grey" });
      const big = D4.tag(stage, { x: 690, y: 602, text: `100 + 100: threshold ${fm(S.eps100)}`, tone: "grey" });

      return (t) => {
        const end = endOf(t);
        const kc = E.inOut(ramp(t, CUT, CUT + 1.0, E.lin));
        const kFall = ramp(t, CUT, CUT + 0.8, E.lin);
        const start = S.drop * kc; // the window's tail slides past the dropped records
        const swapped = t >= SWAP;
        s.set({
          xs: S.all,
          to: end,
          groups: kFall > 0 ? [{ a: 0, b: S.drop, err: "red", ok: "red", dy: 40 * kFall, o: 1 - kFall }] : [],
        });
        win.set({ x1: s.x(start), x2: s.x(end), y: 132, h: 12, tone: "blue", w: 6, o: ramp(t, 0.3, 0.5, E.lin) });
        head.set({ k: ramp(t, 0.8, 1.2, E.lin), o: 1 - ramp(t, 2.0, 2.3, E.lin) });

        // the best split of the current window
        const kp = ramp(t, 1.6, 2.0, E.out);
        const fr = swapped ? A : S.frames[Math.max(OLD, end)];
        const cut = s.x(fr.i);
        const x0 = s.x(start);
        const xe = s.x(end);
        line.setAttribute("x1", cut.toFixed(1));
        line.setAttribute("x2", cut.toFixed(1));
        V.show(line, kp);
        w0.set({ x1: x0, x2: cut, y: 262, h: 12, up: true, tone: "grey", w: 5, k: kp });
        w1.set({ x1: cut, x2: xe, y: 262, h: 12, up: true, tone: "blue", w: 5, k: kp });
        older.set({ text: `older: ${pc(fr.m0, 1)}`, x: clamp((x0 + cut) / 2, 110, 800), k: kp });
        newer.set({ text: `newer: ${pc(fr.m1, 1)}`, x: clamp((cut + xe) / 2, 110, 800), k: kp });

        // the test: gap against threshold
        const won = t >= FIRE && !swapped;
        const fl = flash(t, FIRE, FIRE + 0.5);
        const kb = ramp(t, 1.7, 2.1, E.out);
        const d = swapped ? 3 : 2;
        gapBar.set({ k: fr.gap * kb, tone: won ? "red" : "blue", o: kb });
        epsBar.set({ k: fr.eps * kb, o: kb });
        V.place(gapBar.el, { s: 1 + 0.04 * fl, o: kb });
        V.place(epsBar.el, { s: 1 + 0.04 * fl, o: kb });
        gapLab.set({ text: `gap ${fm(fr.gap, d)}`, tone: won ? "red" : "blue", k: kb });
        epsLab.set({ text: `threshold ${fm(fr.eps, d)}`, k: kb });

        wait.set({ k: ramp(t, 3.2, 3.6, E.lin) * (1 - ramp(t, FIRE - 0.15, FIRE, E.lin)) });
        fire.set({ k: ramp(t, FIRE, FIRE + 0.35, E.lin) * (1 - ramp(t, SWAP - 0.15, SWAP, E.lin)) });
        agree.set({ k: ramp(t, SWAP, SWAP + 0.35, E.lin), s: 1 + 0.06 * flash(t, SWAP + 0.3, SWAP + 0.7) });
        small.set({ k: ramp(t, 10.4, 10.8, E.lin) });
        big.set({ k: ramp(t, 10.6, 11.0, E.lin) });
      };
    },
  });
})();

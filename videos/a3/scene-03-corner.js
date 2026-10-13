/* Algorithms Phase 3 · scene 03-corner: every plan earns z = 3x + 2y; slide the profit line outwards and the last point it
   touches is a corner, so only the corners need checking. Same plot call as scene 02. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const E = V.ease;
  const { clamp } = V;

  // numbers come from the real LP (common.js); fail loudly if they ever disagree
  const CORNERS = A3.CORNERS;
  const Z = CORNERS.map((c) => A3.z(c));
  A3.need(Z.join() === A3.CORNER_Z.join() && Z.join() === "0,15,18,10", "scene 03: corner scores");
  A3.need(Math.max(...Z) === 18 && Z.indexOf(18) === 2, "scene 03: the best corner is (4, 3) with z = 18");
  A3.need(Math.max(...Z) < 21, "scene 03: the line z = 21 must miss the polygon");

  const pop = (k) => 0.8 + 0.2 * E.pop(k);
  const TAG_AT = [
    [58, -40],
    [-70, -40],
    [84, 44],
    [58, -38],
  ]; // the corner tags, clear of their dots, the tick numbers and the rule badges
  const SLIDE = [4.2, 7.0]; // the profit line slides from z = 6 to z = 18 (after a hold on z = 6, where three points share the score)
  const GHOST = [7.6, 9.9]; // the line z = 21 is shown (fades in, holds about 1.5 s, fades out)
  const ROW0 = 8.6; // first bar starts growing
  const ROW_GAP = 0.4;
  const ROW_LEN = 0.6;

  V.scene({
    kicker: "THE SCORE",
    title: ["Slide the profit line", "until it leaves"],
    dur: 12,
    caps: [
      [0.4, 2.4, "Each plan earns a score: z = 3x + 2y."],
      [2.6, 4.2, "Every point on this line scores the same."],
      [4.4, 7.2, "Slide the profit line outwards until it leaves."],
      [7.4, 11.4, "It leaves at a corner, so check only the corners."],
    ],
    build(stage) {
      // ---------- the plot (identical call to scene 02) ----------
      const P = A3.plot(stage, {
        x: 0,
        y: 0,
        w: 600,
        h: 604,
        view: [-0.6, 7.8, -0.6, 7.4],
        equal: true,
        axes: "origin",
        xticks: [0, 1, 2, 3, 4, 5, 6, 7],
        yticks: [0, 1, 2, 3, 4, 5, 6, 7],
        pad: { l: 60, r: 24, t: 24, b: 60 },
      });
      const poly = P.poly({ tone: "green" });
      const l1 = P.eq(1, 2, 10, { w: 5 });
      const l2 = P.eq(3, 1, 15, { w: 5 });
      const iso = P.eq(3, 2, 6, { tone: "orange", w: 6, dash: "16 10" }); // the profit line, r = z
      const ghost = P.eq(3, 2, 21, { tone: "red", w: 6, dash: "16 10" });
      const xName = P.text({ tone: "grey", anchor: "end" });
      const yName = P.text({ tone: "grey", anchor: "start" });
      const lineBadge = [
        A3.badge(P.html, { x: P.px(6.8), y: P.py(1.6), size: 48, text: "1", tone: "purple" }),
        A3.badge(P.html, { x: P.px(3.1), y: P.py(5.7), size: 48, text: "2", tone: "purple" }),
      ];
      const dots = CORNERS.map(() => P.dot({ tone: "blue", r: 12 }));
      const tags = CORNERS.map(([cx, cy], i) =>
        A3.tag(P.html, {
          x: P.px(cx) + TAG_AT[i][0],
          y: P.py(cy) + TAG_AT[i][1],
          text: `(${cx}, ${cy})`,
          tone: "grey",
          anchor: "m",
        }),
      );
      // three points on the line: they all earn the same score
      const onLine = [0, 1, 2].map(() => P.dot({ tone: "orange", r: 9 }));
      const onTags = [0, 1, 2].map(() => A3.tag(P.html, { text: "6", tone: "orange", anchor: "m" }));
      const ghostTag = A3.tag(P.html, { text: "z = 21", tone: "red", anchor: "m" });
      const ghostNote = A3.sticker(stage, {
        x: 624,
        y: 484,
        w: 312,
        h: 64,
        text: "no legal plan",
        tone: "red",
        icon: "cross",
      });
      const zLabel = A3.tag(P.html, { x: 0, y: 0, text: "z = 6", tone: "orange", anchor: "m" }); // a sticker, so rule lines never cross it
      const star = A3.star(P.over, { size: 52 });
      const badge = A3.badge(stage, { x: P.px(6.2), y: P.py(1.2), icon: "cross", tone: "red", size: 48 });

      // ---------- right column ----------
      const stat = A3.stat(stage, { x: 624, y: 0, w: 312, label: "profit z", tone: "orange" });
      const B = A3.bars(stage, {
        x: 624,
        y: 128,
        w: 312,
        rows: CORNERS.map((c) => ({ label: `(${c.join(",")})`, tone: "blue" })),
        min: 0,
        max: 20,
        labelW: 100,
        valW: 56,
        title: "score at each corner",
      });

      return (t) => {
        P.set({ o: V.ramp(t, 0, 0.5, E.lin) });
        const z = 6 + 12 * V.ramp(t, SLIDE[0], SLIDE[1], E.inOut);
        const zi = Math.round(z);

        poly.set({ pts: CORNERS });
        l1.set({});
        l2.set({});
        const kn = V.ramp(t, 0, 0.5, E.lin);
        xName.set({ text: "x: product X", x: 7.7, y: 0, dy: -16, o: kn });
        yName.set({ text: "y: product Y", x: 0.2, y: 7.15, o: kn });
        lineBadge.forEach((b, i) => b.set({ text: String(i + 1), tone: "purple", o: kn }));

        // the profit line draws on at z = 6, then slides out to z = 18
        const lk = V.ramp(t, 1.0, 2.2, E.inOut);
        iso.set({ k: lk, o: V.ramp(t, 1.0, 1.6, E.lin), r: z });
        // three points on the line all earn the same z, each tagged with it (held about 1.5 s, they fade as the line starts to slide)
        [0, 1, 2].forEach((i) => {
          const a = 2.2 + 0.2 * i;
          const k = V.ramp(t, a, a + 0.4, E.lin);
          const o = clamp(k * 4) * (1 - V.ramp(t, SLIDE[0], SLIDE[0] + 0.4, E.lin));
          const [x, y] = [
            [0, 3],
            [1, 1.5],
            [2, 0],
          ][i];
          onLine[i].set({
            x: z > 6.01 ? [0, z / 6, z / 3][i] : x,
            y: z > 6.01 ? [z / 2, z / 4, 0][i] : y,
            s: pop(k),
            o,
          });
          onTags[i].set({ dx: P.px(x) + (i === 2 ? 30 : 46), dy: P.py(y) - (i === 2 ? 52 : 34), s: pop(k), o });
        });
        // the "z = ..." sticker rides next to the middle of the line; it steps aside while the z = 21 line is shown
        const kLab = V.ramp(t, SLIDE[0], SLIDE[0] + 0.4, E.lin); // the dots' tags hand over to the sliding "z = ..." sticker
        const kBack = V.ramp(t, GHOST[1] + 0.5, GHOST[1] + 1.1, E.lin);
        zLabel.set({
          text: `z = ${zi}`,
          dx: P.px(z / 6) + 80,
          dy: P.py(z / 4) - 24,
          s: pop(t > 9 ? kBack : kLab),
          o: Math.max(clamp(kLab * 4) * (1 - V.ramp(t, 7.5, 7.9, E.lin)), clamp(kBack * 4)),
        });

        // the line at z = 21 misses the polygon completely
        const gOut = 1 - V.ramp(t, GHOST[1], GHOST[1] + 0.5, E.lin);
        ghost.set({ k: 1, o: V.ramp(t, GHOST[0], GHOST[0] + 1.0, E.lin) * gOut });
        const kb = V.ramp(t, 7.8, 8.6, E.lin);
        badge.set({ k: kb, o: gOut });
        const kg = V.ramp(t, 7.9, 8.4, E.lin);
        ghostTag.set({ dx: P.px(4.9) + 74, dy: P.py(3.15) - 40, s: pop(kg), o: clamp(kg * 4) * gOut });
        const kn2 = V.ramp(t, 8.4, 8.9, E.lin);
        ghostNote.set({ text: "no legal plan", tone: "red", icon: "cross", k: kn2, o: gOut });

        // corner dots pulse as their bar grows; the star lands on (4, 3) when the line touches it (and pulses with its bar)
        const rowPulse = (i) => V.flash(t, ROW0 + ROW_GAP * i, ROW0 + ROW_GAP * i + ROW_LEN);
        CORNERS.forEach(([cx, cy], i) => {
          dots[i].set({
            x: cx,
            y: cy,
            tone: i === 2 && t >= 7.0 ? "orange" : "blue",
            s: 1 + 0.35 * (i === 2 ? 0 : rowPulse(i)),
          });
          tags[i].set({});
        });
        const ks = V.ramp(t, 7.0, 7.8, E.lin);
        star.set({ x: P.px(4), y: P.py(3), s: E.pop(ks) * (1 + 0.25 * rowPulse(2)), o: clamp(ks * 4) });

        // right column
        const kst = V.ramp(t, 0.6, 1.4, E.lin);
        stat.set({ text: String(zi), s: pop(kst), o: clamp(kst * 4), bump: 0.5 * V.flash(t, 7.0, 7.6) });

        // bars: one corner after another, each growing from zero
        const g = Z.map((_, i) => V.ramp(t, ROW0 + ROW_GAP * i, ROW0 + ROW_GAP * i + ROW_LEN));
        const kc = V.ramp(t, 8.4, 9.0, E.lin);
        const bestRow = t >= 10.4;
        B.set({
          vals: Z.map((v, i) => (g[i] > 0 ? v * g[i] : null)),
          k: 1,
          tones: ["blue", "blue", bestRow ? "orange" : "blue", "blue"],
          texts: Z.map((v, i) => (g[i] > 0.7 ? A3.fmt(v, 0) : "")),
          rowO: g.map((x) => clamp(x * 4)),
          hi: bestRow ? 2 : null,
          o: clamp(kc * 4),
          dy: (1 - E.out(kc)) * 24,
        });
      };
    },
  });
})();

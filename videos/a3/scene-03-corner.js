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
    [54, 32],
    [40, 30],
    [54, 30],
    [54, -26],
  ];
  const ROW0 = 8.6; // first bar starts growing
  const ROW_GAP = 0.4;
  const ROW_LEN = 0.6;

  V.scene({
    kicker: "THE SCORE",
    title: ["Slide the profit line", "until it leaves"],
    dur: 12,
    caps: [
      [0.4, 3.0, "Each plan earns a score: z = 3x + 2y."],
      [3.2, 7.2, "Slide the profit line outwards until it leaves."],
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
      const zLabel = P.text({ tone: "orange" });
      const star = A3.star(P.over, { size: 56 });
      const badge = A3.badge(stage, { x: P.px(6), y: P.py(1.5), icon: "cross", tone: "red", size: 48 });

      // ---------- right column ----------
      const stat = A3.stat(stage, { x: 624, y: 0, w: 312, label: "profit z", tone: "orange" });
      const B = A3.bars(stage, {
        x: 624,
        y: 128,
        w: 312,
        rows: CORNERS.map((c) => ({ label: `(${c.join(",")})`, tone: "blue" })),
        min: 0,
        max: 20,
        labelW: 120,
        valW: 56,
        title: "score at each corner",
      });

      return (t) => {
        P.set({ o: V.ramp(t, 0, 0.5, E.lin) });
        const z = 6 + 12 * V.ramp(t, 2.6, 7.0, E.inOut);
        const zi = Math.round(z);

        poly.set({ pts: CORNERS });
        l1.set({});
        l2.set({});

        // the profit line draws on at z = 6, then slides out to z = 18
        const lk = V.ramp(t, 1.0, 2.2, E.inOut);
        iso.set({ k: lk, o: V.ramp(t, 1.0, 1.6, E.lin), r: z });
        const kLab = V.ramp(t, 1.4, 2.0, E.lin);
        zLabel.set({
          text: `z = ${zi}`,
          x: z / 6,
          y: z / 4,
          dx: 80,
          dy: -14,
          s: pop(kLab),
          o: clamp(kLab * 4),
        });

        // the line at z = 21 misses the polygon completely
        ghost.set({
          k: 1,
          o: V.ramp(t, 7.6, 8.6, E.lin) * (1 - V.ramp(t, 9.0, 9.6, E.lin)),
        });
        const kb = V.ramp(t, 7.8, 8.6, E.lin);
        badge.set({ k: kb, o: 1 - V.ramp(t, 9.0, 9.6, E.lin) });

        // corner dots: pulse as their bar grows; (4, 3) turns orange when the line touches it
        CORNERS.forEach(([cx, cy], i) => {
          const best = i === 2 && t >= 7.0;
          const pulse = V.flash(t, ROW0 + ROW_GAP * i, ROW0 + ROW_GAP * i + ROW_LEN) + (i === 2 ? V.flash(t, 7.0, 7.6) : 0);
          dots[i].set({ x: cx, y: cy, tone: best ? "orange" : "blue", s: 1 + 0.35 * pulse });
          tags[i].set({});
        });
        const ks = V.ramp(t, 7.0, 7.8, E.lin);
        star.set({ x: P.px(4), y: P.py(3) - 36, s: E.pop(ks), o: clamp(ks * 4) });

        // right column
        const kst = V.ramp(t, 0.6, 1.4, E.lin);
        stat.set({ text: String(zi), s: pop(kst), o: clamp(kst * 4), bump: V.flash(t, 7.0, 7.6) });

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

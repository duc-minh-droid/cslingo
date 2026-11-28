/* Lecture 15 (ds-15) · scene 5 (MOORE'S LAW): transistors on a chip double about every two years (D15.MOORE: 1, 2, 4, 8, 16,
   then 32 at year 10); real chips now lag the doubling line; so new speed comes from more cores and more nodes.
   Story (local seconds): 0.3 five grey chips (year 0 .. year 8); 0.8-3.4 they fill with blue transistor squares one chip at a
   time, with 1× .. 16× under them; 3.6 a green 'year 10: 32×' tag; 6.1 the chips fade and a chart draws: grey axes, the
   dashed blue Moore line (6.5-7.5), then the red 'real chips' line that follows it and bends below (7.5-8.9);
   9.3 the chart fades and three cards: '1 core' (red), 'many cores' (blue), 'many nodes' (blue), joined by grey arrows.
   The chart is a picture of the trend (no figures on its axes): only the doubling counts above are numbers. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D9 = V.d9;
  const D15 = V.d15;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const M = D15.MOORE;

  V.scene({
    kicker: "MOORE'S LAW",
    title: ["Twice the transistors,", "about every two years"],
    dur: 13,
    caps: [
      [0.4, 3.4, "Moore's law: transistors on a chip double about every two years."],
      [3.6, 5.8, `${M.counts.join(", ")}. Ten years: ${M.ten} times as many.`],
      [6.1, 9.0, "Now chips are hitting limits and falling behind."],
      [9.3, 12.6, "So new speed comes from more cores and more nodes."],
    ],
    build(stage) {
      const chips = M.years.map((y, i) =>
        D15.box(stage, { x: 12 + i * 186, y: 50, w: 150, h: 150, title: "", tone: "grey", r: 18 }),
      );
      const cells = M.years.map((y, i) =>
        D15.cells(stage, { x: 12 + i * 186 + 14, y: 64, n: 16, cols: 4, size: 26, gap: 6, tone: "blue" }),
      );
      const yl = M.years.map((y, i) => D4.label(stage, { x: 87 + i * 186, y: 236, text: `year ${y}`, fs: 28 }));
      const xl = M.counts.map((c, i) =>
        D4.label(stage, { x: 87 + i * 186, y: 284, text: `${c}×`, tone: "blue", fs: 34 }),
      );
      const ten = D4.tag(stage, { x: 468, y: 380, text: `year 10: ${M.ten}×`, tone: "green", solid: true, fs: 36 });

      const p = D9.plot(stage, {
        x: 12,
        y: 12,
        w: 912,
        h: 600,
        xr: [0, 20],
        yr: [0, 10.5],
        pad: { l: 40, r: 30, t: 20, b: 40 },
        xlab: "years",
        ylab: "transistors (doublings)",
      });
      const moore = (x) => x / 2;
      const real = (x) => (x <= 10 ? x / 2 : 5 + (x - 10) * 0.22);
      const mTag = D4.tag(stage, { x: 700, y: 120, text: "Moore's law", tone: "blue" });
      const rTag = D4.tag(stage, { x: 790, y: 310, text: "real chips", tone: "red", solid: true });

      const STEPS = [
        ["1 core", "can't get much faster", "red", 1, 1],
        ["many cores", "share the work", "blue", 8, 4],
        ["many nodes", "a whole cluster", "blue", 12, 6],
      ];
      const steps = STEPS.map(([a, b, tone], i) =>
        D15.box(stage, { x: 12 + i * 322, y: 140, w: 268, h: 300, title: a, sub: b, tone, wrap: true, fs: 34 }),
      );
      steps.forEach((s) => Object.assign(s.el.style, { justifyContent: "flex-end", paddingBottom: "24px" }));
      const scells = STEPS.map(([, , tone, n, cols], i) => {
        const size = 34;
        const w = cols * size + (cols - 1) * 8;
        return D15.cells(stage, { x: 12 + i * 322 + 134 - w / 2, y: 180, n, cols, size, gap: 8, tone });
      });
      const asvg = D4.svg(stage);
      const arrows = [0, 1].map((i) =>
        asvg.appendChild(L5.arrow(286 + i * 322, 290, 330 + i * 322, 290, "grey", 1, { w: 6, head: 18 })),
      );

      return (t) => {
        const outA = 1 - ramp(t, 5.9, 6.2, E.lin);
        chips.forEach((c, i) => c.set({ k: D15.seq(t, 0.3, 0.1, 0.4, i), o: outA }));
        cells.forEach((cs, i) =>
          cs.set((j) =>
            j < M.counts[i] && outA > 0 ? { k: D15.seq(t, 0.8 + 0.52 * i, 0.4 / M.counts[i], 0.25, j) * outA } : null,
          ),
        );
        yl.forEach((l, i) => l.set({ k: D15.seq(t, 0.3, 0.1, 0.4, i), o: outA }));
        xl.forEach((l, i) => l.set({ k: ramp(t, 1.0 + 0.52 * i, 1.3 + 0.52 * i), o: outA }));
        ten.set({ k: ramp(t, 3.6, 4.0), o: outA, s: 1 + 0.1 * flash(t, 4.0, 4.4) });

        const kB = ramp(t, 6.1, 6.5) * (1 - ramp(t, 9.1, 9.4, E.lin));
        p.update({
          k: kB,
          axes: kB,
          curves: [
            { fn: moore, from: 0, to: 20, tone: "blue", w: 6, dash: true, k: ramp(t, 6.5, 7.5, E.lin) },
            { fn: real, from: 0, to: 20, tone: "red", w: 8, k: ramp(t, 7.5, 8.9, E.lin) },
          ],
        });
        mTag.set({ k: ramp(t, 7.3, 7.6) * (kB > 0 ? 1 : 0), o: kB });
        rTag.set({ k: ramp(t, 8.7, 9.0) * (kB > 0 ? 1 : 0), o: kB });

        steps.forEach((s, i) => s.set({ k: ramp(t, 9.4 + 0.8 * i, 9.8 + 0.8 * i) }));
        scells.forEach((cs, i) => cs.set((j) => ({ k: D15.seq(t, 9.6 + 0.8 * i, 0.04, 0.25, j) })));
        arrows.forEach((a, i) => L5.drawOn(a, ramp(t, 9.9 + 0.8 * i, 10.3 + 0.8 * i)));
      };
    },
  });
})();

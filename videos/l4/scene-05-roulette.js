/* Lecture 4 · scene 05-roulette: slices sized by fitness; one superfit individual swallows the wheel. */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const { ramp, ease: E, flash } = V;

  const F1 = L4.FIT_ROULETTE; // 2 3 5
  const F2 = L4.FIT_SUPER; // 100 .4 .3 .2 .1
  const P1 = [...L4.rouletteProbs(F1), 0, 0];
  const P2 = L4.rouletteProbs(F2);
  // the four spins; rotations are chained and come from L4.spinPlan, never typed
  const S1 = L4.spinPlan(F1, [7.3], 0, 720)[0];
  const S2 = L4.spinPlan(F1, [3.4], S1.rot, 720)[0];
  const S3 = L4.spinPlan(F2, [61.0], S2.rot, 360)[0];
  const S4 = L4.spinPlan(F2, [12.4], S3.rot, 360)[0];
  if ([S1.idx, S2.idx, S3.idx, S4.idx].join() !== "2,1,0,0") throw new Error("scene 5: wrong slices");
  const SPIN = [
    [3.4, 4.8, 0, S1.rot],
    [5.2, 6.5, S1.rot, S2.rot],
    [8.4, 9.6, S2.rot, S3.rot],
    [9.9, 10.9, S3.rot, S4.rot],
  ];
  // when each pick pops its slice out: [index, up from, up to, down from, down to]
  const HITS = [
    [S1.idx, 4.6, 4.9, 5.0, 5.2],
    [S2.idx, 6.3, 6.6, 6.7, 6.9],
    [S3.idx, 9.35, 9.65, 9.75, 9.85],
    [S4.idx, 10.65, 10.95, 99, 100],
  ];
  const GROW = [1.2, 1.8, 2.4]; // slice sweep-in starts (0.5 s each)
  const MORPH = [6.7, 8.2];
  const ROW_Y = (i) => 150 + 78 * i;

  V.scene({
    kicker: "ROULETTE WHEEL",
    title: ["Roulette: slices sized", "by fitness"],
    dur: 12,
    caps: [
      [0.8, 3.2, "Each slice is sized by fitness."],
      [3.4, 6.4, "The bigger the slice, the likelier the pick."],
      [6.8, 9.4, "One superfit individual takes 99% of the wheel."],
      [9.6, 11.5, "It is picked again and again."],
    ],
    build(stage) {
      const wheel = L4.wheel(stage, { cx: 250, cy: 350, r: 190 });
      const sum = L4.tag(stage, { x: 250, y: 574, anchor: "c", text: "2 + 3 + 5 = 10" });
      const rows = F2.map((_, i) => ({
        chip: L4.tiles(stage, { x: 520, y: ROW_Y(i), vals: [i < 3 ? F1[i] : F2[i]], w: 96, h: 60, gap: 0, font: 34 }),
        bar: L4.bar(stage, { x: 630, y: ROW_Y(i) + 16, len: 200, thick: 28, fs: 34, textGap: 10 }),
      }));

      return (t) => {
        const m = ramp(t, MORPH[0], MORPH[1], E.inOut);
        const sw = GROW.map((g) => ramp(t, g, g + 0.5, E.out));
        // slice fractions: sweep in, then morph to the superfit wheel
        const grown = P1.map((p, i) => (i < 3 ? p * sw[i] : 0));
        const p = m > 0 ? L4.mix(P1, P2, m) : grown;
        // rotation and the slice that is popped out
        let rot = 0;
        SPIN.forEach(([a, b, r0, r1]) => {
          if (t >= a) rot = r0 + (r1 - r0) * ramp(t, a, b, E.out);
        });
        let hit = -1;
        let hitK = 0;
        HITS.forEach(([i, u0, u1, d0, d1]) => {
          const k = ramp(t, u0, u1, E.back) * (1 - ramp(t, d0, d1, E.inOut));
          if (k > 0.001) {
            hit = i;
            hitK = Math.min(1, k);
          }
        });
        const big = m > 0.35;
        const tones = [big ? "red" : "grey", "grey", "grey", "grey", "grey"];
        wheel.update({
          p,
          rot,
          hit,
          hitK,
          o: ramp(t, 0.5, 0.9, E.lin),
          labels: m > 0.5 ? F2.map(String) : F1.map(String),
          tones,
        });
        V.place(wheel.el, { y: (1 - ramp(t, 0.5, 1.0, E.back)) * 16 });
        // sum tag
        const tot = m > 0.5;
        sum.set({
          text: tot ? "total 101" : "2 + 3 + 5 = 10",
          s: 0.6 + 0.4 * ramp(t, 2.8, 3.3, E.pop) + 0.12 * flash(t, 7.4, 7.9),
          o: ramp(t, 2.8, 3.0, E.lin),
        });
        // rows: chips and bars follow the slices
        rows.forEach((r, i) => {
          const appear = i < 3 ? sw[i] : ramp(t, 7.1 + (i - 3) * 0.25, 7.6 + (i - 3) * 0.25, E.out);
          const picked = hit === i && hitK > 0.5;
          const tone = i === 0 && big ? "red" : picked ? "blue" : "grey";
          const bump = hit === i ? 1 + 0.08 * hitK : 1;
          if (i < 3 && m > 0)
            r.chip.flip(0, ramp(t, 6.9, 7.5, E.inOut), {
              from: String(F1[i]),
              to: String(F2[i]),
              tone,
              toTone: tone,
              hop: 10,
              s: bump,
              o: appear,
            });
          else r.chip.set(0, { tone, s: (0.7 + 0.3 * appear) * bump, o: appear * 3 });
          const pi = Math.max(0, p[i]);
          r.bar.set({ k: pi, tone, text: L4.pct(pi), o: appear });
        });
      };
    },
  });
})();

/* Lecture 13 video, scene 06-sorting: lesson 13.2's non-dominated sorting on its 12 points a..l (L13.PEEL, both goals
   minimised, so better is down and to the left). Rank 0 = the points nobody dominates (a b c d e, green line); set them
   aside (they fade back) and the next non-dominated set is rank 1 (f g h, blue); then rank 2 (k i j, purple) and rank 3
   (l, orange). At the end every rank is shown at full strength: peeled like an onion.
   Layout (stage px): plot x 12, y 12, 600 x 616 (f1, f2 from 0 to 10); right panel x 636..924: four stats 'rank 0'..'rank 3'
   (288 x 80 at y 60, 160, 260, 360) with the count of each rank; a green 'better' arrow at the empty lower left.
   Story (local seconds): 0.3 plot + grey dots, 1.0 'better'; rank r lights at 2.4 / 4.8 / 7.4 / 9.0 (dots, then line, then
   its stat), earlier ranks fade to 0.3 while the next is found; 10.8 all ranks back to full; hold to 14. */
VID.scene({
  kicker: "NON-DOMINATED SORTING",
  title: ["Peel the fronts", "like an onion"],
  dur: 14,
  caps: [
    [0.5, 2.2, "Twelve solutions, both goals minimised."],
    [2.4, 4.6, "Rank 0: the ones that nobody dominates."],
    [4.8, 7.2, "Set them aside: the next front of what is left is rank 1."],
    [7.4, 10.6, "Keep peeling, like an onion: rank 2, then rank 3."],
    [10.8, 13.7, "Every solution now has a rank: lower is better."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const { ramp, ease: E } = V;
    const P = L13.PEEL;
    const TONES = ["green", "blue", "purple", "orange"];
    const RANKS = [0, 1, 2, 3].map((r) => P.inRank(r).sort((a, b) => P.at[a][0] - P.at[b][0]));
    L13.same(
      RANKS.map((r) => r.join("")),
      ["abcde", "fgh", "kij", "l"],
      "scene 6: the four ranks",
    );
    const START = [2.4, 4.8, 7.4, 9.0];
    const ALL = 10.8;

    const pl = L13.plot(stage, {
      x: 12,
      y: 12,
      w: 600,
      h: 616,
      xr: [0, 10],
      yr: [0, 10],
      xt: [0, 2, 4, 6, 8, 10],
      yt: [0, 2, 4, 6, 8, 10],
      xl: "f₁ (minimise)",
      yl: "f₂ (minimise)",
      dots: 12,
      lines: 4,
    });
    const better = L13.arrow(pl.svg, { tone: "green", w: 8, head: 22 });
    const betterLab = L13.label(stage, { x: 0, y: 0, w: 140, text: "better", tone: "green", bold: true });
    const stats = RANKS.map((r, i) =>
      L13.stat(stage, { x: 636, y: 60 + 100 * i, w: 288, h: 80, label: `rank ${i}`, tone: TONES[i] }),
    );

    return (t) => {
      // how strongly rank r is lit: on when found, faded to 0.3 while later ranks are found, back to 1 at the end
      const lit = (r) => {
        const on = ramp(t, START[r], START[r] + 0.4);
        const aside = r < 3 ? ramp(t, START[r + 1] - 0.2, START[r + 1] + 0.2) : 0;
        return on * (1 - 0.7 * aside * (1 - ramp(t, ALL, ALL + 0.5)));
      };
      const dots = P.ids.map((k, i) => {
        const r = P.r[i];
        const on = t >= START[r] + 0.1 * RANKS[r].indexOf(k);
        return {
          at: P.P[i],
          tone: on ? TONES[r] : "grey",
          k: L13.seq(t, 0.3, 0.04, 0.4, i),
          o: on ? Math.max(0.3, lit(r)) : 1,
        };
      });
      const lines = RANKS.map((ids, r) => ({
        pts: ids.map((k) => P.at[k]),
        tone: TONES[r],
        k: ramp(t, START[r] + 0.4, START[r] + 1.2),
        o: Math.max(0.3, lit(r)),
      }));
      pl.update({ k: ramp(t, 0.1, 0.4), dots, lines });
      stats.forEach((s, r) => s.set({ k: ramp(t, START[r] + 0.8, START[r] + 1.2), text: String(RANKS[r].length) }));
      const kb = ramp(t, 1.0, 1.5, E.out);
      better.set({ a: pl.ps([3.2, 2.8]), b: pl.ps([1.4, 1.0]), k: kb });
      const [lx, ly] = pl.pt([3.0, 2.6]);
      betterLab.set({ k: kb, x: lx, y: ly - 10, align: "left" });
    };
  },
});

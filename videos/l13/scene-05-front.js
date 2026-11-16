/* Lecture 13 video, scene 05-front: lesson 13.1's Pareto front of the wind farm (L13.FARM, same plot as scenes 3-4).
   Each dominated layout gets a grey dashed link from a layout that dominates it and turns red with a cross (F by B, G by D,
   H by C, I by A, J by E); the six left over (A B C D K E) turn green and a green line joins them in cost order: the Pareto
   front. The right panel counts them and then shows the answer as a set of six green chips.
   Layout (stage px): plot x 12, y 12, 584 x 616; right panel x 616..924: stats 'dominated' (y 90) and 'Pareto front'
   (y 190), the label 'the answer is a set' (y 330) and six chips (2 rows of 3, y 380 and 470).
   Story (local seconds): 0.3 plot (blue dots); 3.2 + 0.4 i the five dominated layouts (link then red), stat at 3.4;
   6.4 front dots turn green, 6.6-7.8 the line draws, 7.6 stat '6'; 9.4 label and chips; hold to 13. */
VID.scene({
  kicker: "THE PARETO FRONT",
  title: ["The layouts that", "nobody beats"],
  dur: 13,
  caps: [
    [0.5, 3.0, "Which layouts does no other layout dominate?"],
    [3.2, 6.2, "Five layouts are each beaten by another one: they turn red."],
    [6.4, 9.2, "The six left over form the Pareto front."],
    [9.4, 12.7, "So the answer is a whole set of layouts, not one best."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const { ramp, flash } = V;
    const F = L13.FARM;
    const LOSERS = ["F", "G", "H", "I", "J"];
    const FRONT = F.inRank(0)
      .slice()
      .sort((a, b) => F.at[a][0] - F.at[b][0]);
    L13.same(FRONT, ["A", "B", "C", "D", "K", "E"], "scene 5: the front in cost order");
    L13.same(
      LOSERS,
      F.ids.filter((k) => F.rank(k) > 0),
      "scene 5: the dominated layouts",
    );
    const BY = LOSERS.map((k) => F.by[k][0]);
    L13.same(BY, ["B", "D", "C", "A", "E"], "scene 5: one dominator each");

    const pl = L13.plot(stage, {
      x: 12,
      y: 12,
      w: 584,
      h: 616,
      xr: [15, 60],
      yr: [20, 75],
      xt: [20, 30, 40, 50, 60],
      yt: [30, 40, 50, 60, 70],
      xl: "cost (£m)",
      yl: "power (MW)",
      dots: 11,
      links: 5,
      lines: 1,
    });
    const RX = 616;
    const nDom = L13.stat(stage, { x: RX, y: 90, w: 308, h: 80, label: "dominated", tone: "red" });
    const nFront = L13.stat(stage, { x: RX, y: 190, w: 308, h: 80, label: "front", tone: "green" });
    const ans = L13.label(stage, { x: RX, y: 330, w: 308, text: "the answer is a set", bold: true });
    const chips = FRONT.map((k, i) =>
      L13.chip(stage, {
        x: RX + 10 + (i % 3) * 102,
        y: 380 + Math.floor(i / 3) * 92,
        w: 82,
        h: 72,
        text: k,
        tone: "green",
        fs: 36,
      }),
    );
    const LDX = { I: [18, 40], J: [-18, -16], E: [-18, -16] };
    const at = (i) => 3.2 + 0.4 * i;

    return (t) => {
      const dots = F.ids.map((k, i) => {
        const [ldx, ldy] = LDX[k] || [18, -16];
        const d = { at: F.P[i], tone: "blue", k: L13.seq(t, 0.3, 0.03, 0.4, i), lab: k, ldx, ldy };
        const li = LOSERS.indexOf(k);
        if (li >= 0) {
          const r = ramp(t, at(li) + 0.3, at(li) + 0.5);
          Object.assign(d, { tone: r > 0.5 ? "red" : "blue", cross: r });
        } else if (t >= 6.4 + 0.08 * FRONT.indexOf(k)) d.tone = "green";
        return d;
      });
      const links = LOSERS.map((k, i) => ({
        a: F.at[BY[i]],
        b: F.at[k],
        k: ramp(t, at(i), at(i) + 0.35),
        o: 1 - ramp(t, 6.2, 6.6),
      }));
      const lines = [{ pts: FRONT.map((k) => F.at[k]), tone: "green", k: ramp(t, 6.6, 7.8), w: 7 }];
      pl.update({ k: ramp(t, 0.1, 0.4), dots, links, lines });
      const nd = LOSERS.filter((_, i) => t >= at(i) + 0.4).length;
      nDom.set({
        k: ramp(t, 3.4, 3.8),
        text: String(nd),
        bump: flash(t, at(Math.max(0, nd - 1)) + 0.4, at(Math.max(0, nd - 1)) + 0.8),
      });
      nFront.set({ k: ramp(t, 7.6, 8.0), text: `${FRONT.length} of ${F.ids.length}` });
      ans.set({ k: ramp(t, 9.4, 9.8) });
      chips.forEach((c, i) => c.set({ k: L13.seq(t, 9.6, 0.12, 0.4, i), solid: true }));
    };
  },
});

/* Lecture 15 video, scene 02-nobest: lesson 15.1's nine drone routes A..I (L15.SWARM9; time and energy, both minimised).
   Plain PSO follows two remembered points, pbest and gbest. With two goals, five routes (A B C E G) are non-dominated and
   none beats the other four, so there is no single gbest to follow.
   Layout (stage px): L15.plot at x 12, y 12, 600 x 616; right panel x 636..924: card 'pbest' (y 12) and card 'gbest' (y 182).
   Story (local seconds): 0.3 plot, 0.6 nine grey routes pop in; 3.2 the two cards, F turns blue (the particle);
   6.0 the five non-dominated routes turn green and the front line draws; 8.8 orange dashed arrows from F to all five,
   the gbest card turns orange: 'gbest: ?'; hold to 12. */
VID.scene({
  kicker: "NO SINGLE BEST",
  title: ["Two goals, so", "no single gbest"],
  dur: 12,
  caps: [
    [0.5, 3.0, "Nine drone routes, each scored by time and energy. Lower is better."],
    [3.2, 5.8, "Plain PSO follows two points: its own pbest and the swarm's gbest."],
    [6.0, 8.6, "Five routes are not dominated by any other route."],
    [8.8, 11.7, "None beats the other four, so there is no single gbest."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L15 = V.l15;
    const { ramp } = V;
    const S = L15.SWARM9;
    const FR = L15.FRONT9;
    L15.same(FR, ["A", "B", "C", "E", "G"], "scene 2: the five non-dominated routes");
    const pl = L15.plot(stage, { dots: 9, lines: 1 });
    const svg = V.l5.svg(stage, 936, 640);
    const arrows = FR.map(() => L13.arrow(svg, { tone: "orange", w: 6, head: 18 }));
    const pb = L15.card(stage, {
      x: 636,
      y: 12,
      w: 288,
      h: 150,
      text: "pbest:\nthe particle's\nown best",
      tone: "blue",
    });
    const gb = L15.card(stage, { x: 636, y: 182, w: 288, h: 150, text: "gbest:\nthe swarm's\nbest", tone: "grey" });
    const front = FR.map((k) => S.at[k]).sort((a, b) => a[0] - b[0]);
    const F = S.at.F;

    return (t) => {
      const g = ramp(t, 6.0, 6.4);
      pl.update({
        k: ramp(t, 0.1, 0.4),
        dots: S.ids.map((k, i) => ({
          at: S.P[i],
          tone: k === "F" && t >= 3.2 ? "blue" : FR.includes(k) && g > 0.5 ? "green" : "grey",
          k: L13.seq(t, 0.6, 0.1, 0.4, i),
          lab: k,
          ring: k === "F" && t >= 3.2,
        })),
        lines: [{ pts: front, tone: "green", k: ramp(t, 6.4, 7.4), w: 5 }],
      });
      pb.set({ k: ramp(t, 3.2, 3.6) });
      const q = ramp(t, 8.8, 9.2);
      gb.set({
        k: ramp(t, 3.5, 3.9),
        tone: q > 0.5 ? "orange" : "grey",
        text: q > 0.5 ? "gbest: ?\nfive candidates,\nno single best" : "gbest:\nthe swarm's\nbest",
      });
      FR.forEach((k, i) => {
        const [a, b] = L15.inset(pl.pt(F), pl.pt(S.at[k]), 24, 24);
        arrows[i].set({ a, b, k: L13.seq(t, 9.0, 0.15, 0.6, i), tone: "orange", dash: true });
      });
    };
  },
});

/* Lecture 15 video, scene 07-run: a real run of the lessons' drone MOPSO (L15.RUN: 10 particles, archive cap 10, crowding
   prune, random leader, keep-newest pbest, seed 4), 21 snapshots, iteration 0..20. Particles (blue) glide from one snapshot
   to the next; the archive (green) is shown snapshot by snapshot; the true front is the dashed grey line (L15.TRUE).
   Energy above 12 is clipped to the top edge. The archive starts with 5 members and holds 10 (the cap) at the end.
   Layout (stage px): L15.plot x 12, y 12, 600 x 616, time 0..10, energy 0..12; right panel x 636..924: stats 'iteration'
   (y 12) and 'archive' (y 104), then legend tags 'swarm' (blue), 'archive' (green), 'true front' (grey) at y 230 / 300 / 370.
   Story (local seconds): 0.3 plot, 0.5 the dashed true front, 0.8 swarm and archive at iteration 0, stats and legend;
   iterations step every 0.45 s from 1.4 (iteration 20 at 10.4); 10.6 the archive line draws; hold to 13. */
VID.scene({
  kicker: "A MOPSO RUN",
  title: ["Watch the front", "fill out"],
  dur: 13,
  caps: [
    [0.5, 3.0, "A real run: ten drone routes (blue) and their archive (green)."],
    [3.2, 6.8, "Each step the particles follow leaders, and better routes enter the archive."],
    [7.0, 10.3, "The archive creeps towards the true front, the dashed line."],
    [10.5, 12.8, "Capped at ten, it stays spread along the whole front."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L15 = V.l15;
    const { ramp, lerp } = V;
    const RUN = L15.RUN;
    L15.same([RUN[0].A.length, RUN[20].A.length], [5, 10], "scene 7: archive size at the start and the end");
    const T0 = 1.4,
      DT = 0.45;
    const pl = L15.plot(stage, { yr: [0, 12], yt: [0, 3, 6, 9, 12], dots: 20, lines: 2 });
    const it = L13.stat(stage, { x: 636, y: 12, w: 288, h: 80, label: "iteration", tone: "blue" });
    const sz = L13.stat(stage, { x: 636, y: 104, w: 288, h: 80, label: "archive", tone: "green" });
    const leg = [
      ["swarm", "blue", true],
      ["archive", "green", true],
      ["true front", "grey", false],
    ].map(([text, tone, solid], i) => L13.tag(stage, { x: 650, y: 230 + 70 * i, text, tone, solid }));
    const clip = (p) => [p[0], Math.min(12, p[1])];

    return (t) => {
      const g = (t - T0) / DT;
      const n = g < 0 ? 0 : Math.min(20, Math.floor(g) + 1); // the snapshot the particles fly to
      const u = g < 0 || g >= 20 ? 1 : V.ease.inOut(Math.min(1, (g - Math.floor(g)) / 0.7));
      const m = Math.max(0, n - 1);
      const i = u >= 1 ? n : m; // the archive updates once the particles land
      const s = RUN[i];
      const arch = s.A.map(clip).sort((a, b) => a[0] - b[0]);
      const dots = s.A.map((p) => ({ at: clip(p), tone: "green", r: 13, k: ramp(t, 0.8, 1.2) }));
      RUN[m].P.forEach((p, q) => {
        const b = RUN[n].P[q];
        dots.push({
          at: clip([lerp(p[0], b[0], u), lerp(p[1], b[1], u)]),
          tone: "blue",
          r: 9,
          k: ramp(t, 0.9, 1.3),
        });
      });
      pl.update({
        k: ramp(t, 0.1, 0.4),
        dots,
        lines: [
          { pts: L15.TRUE, tone: "grey", dash: true, w: 5, k: ramp(t, 0.5, 1.3) },
          { pts: arch, tone: "green", w: 5, k: ramp(t, 10.6, 11.4) },
        ],
      });
      it.set({ k: ramp(t, 0.9, 1.3), text: String(i) });
      sz.set({ k: ramp(t, 1.0, 1.4), text: String(s.A.length) });
      leg.forEach((g, n) => g.set({ k: ramp(t, 1.0 + 0.15 * n, 1.4 + 0.15 * n) }));
    };
  },
});

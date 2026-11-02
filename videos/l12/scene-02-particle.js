/* Lecture 12 · scene-02-particle: a particle is one guess on the scent map. The swarm is L12.RUN at its start (frame 0, the
   same 14 dots scene 7 releases). Particle 11 is singled out: its position (two numbers), the odour where it stands (its
   fitness) and, later, every dot's velocity arrow (true to size). Then the scent fades: no particle can see the map.
   Every number comes from L12.RUN.frames[0] (asserted below). Local seconds: 0.1 map, 0.4 dots, 2.6 position, 5.0 odour,
   5.6 three more odours, 7.2 velocities, 9.2 the map fades. */
(function () {
  const V = window.VID;
  const L12 = V.l12;
  const L5 = V.l5;
  const { ramp, ease: E } = V;

  const F = L12.RUN.frames[0];
  const ME = 11; // the particle singled out
  const OTHERS = [0, 6, 8]; // three more odours, shown on the map
  L12.same(F.x.length, 14, "scene 2: fourteen particles");
  L12.close(F.x[ME], [6.36, 5.78], 0.005, "scene 2: particle 11's position");
  L12.same([F.f[ME], ...OTHERS.map((i) => F.f[i])], [11, 66, 49, 0], "scene 2: odours of particles 11, 0, 6 and 8");
  L12.same(
    F.f.every((f, i) => f === L12.odour(L12.fit(...F.x[i]))),
    true,
    "scene 2: the odour is the fitness where the dot stands",
  );
  const POS = `(${L12.fmt(F.x[ME][0], 1)}, ${L12.fmt(F.x[ME][1], 1)})`;
  L12.same(POS, "(6.4, 5.8)", "scene 2: position text");

  // ---------- timeline (local seconds) ----------
  const T = {
    map: [0.1, 0.6],
    legend: [0.3, 0.8],
    dots: { t0: 0.4, step: 0.05, dur: 0.3 },
    pos: [2.6, 3.2],
    odour: [5.0, 5.6],
    others: { t0: 5.6, step: 0.2, dur: 0.4 },
    vel: [7.2, 8.4],
    fade: [9.2, 10.4],
  };

  V.scene({
    kicker: "A PARTICLE",
    title: ["Each dot is a guess", "on a scent map"],
    dur: 12,
    caps: [
      [0.5, 2.6, "Each dot is a particle: one guess at the answer."],
      [2.8, 5, "Its guess is a position: two numbers on the map."],
      [5.2, 7.2, "The odour where it stands is its fitness."],
      [7.4, 9.2, "Each particle also has a velocity: its next move."],
      [9.4, 11.7, "No particle sees the map, only the odour underfoot."],
    ],
    build(stage) {
      const map = L12.field(stage, { x: 12, y: 12, size: 616, vecs: 14 });
      const lay = L5.svg(stage);
      const pointer = L12.arrow(lay, { tone: "grey", w: 4, head: 16 });

      // the right-hand panel (x 648 .. 924)
      const PX = 648;
      const legend = L12.tag(stage, { x: PX, y: 12, text: "green = scent", tone: "green" });
      const posLab = L12.label(stage, { x: PX, y: 106, w: 276, text: "position", align: "left" });
      const posChip = L12.chip(stage, { x: PX, y: 148, w: 240, h: 76, text: POS, tone: "blue", fs: 36 });
      const odLab = L12.label(stage, { x: PX, y: 262, w: 276, text: "odour = fitness", align: "left" });
      const odChip = L12.chip(stage, { x: PX, y: 304, w: 120, h: 76, text: String(F.f[ME]), tone: "green", fs: 40 });
      const velTag = L12.tag(stage, { x: PX, y: 432, text: "velocity", tone: "grey" });
      const velLab = L12.label(stage, { x: PX, y: 504, w: 276, text: "= its next move", align: "left" });

      // odour tags next to three other dots (kept inside the stage's 12 px margin)
      const odTags = OTHERS.map((i) => {
        const [px, py] = map.pt(F.x[i]);
        return L12.tag(stage, { x: px + 20, y: Math.max(12, py - 48), text: String(F.f[i]), tone: "green" });
      });
      // "nobody sees the map": on an empty patch of the map (left, middle)
      const [nx, ny] = map.pt([0.3, 4.3]);
      const blind = L12.tag(stage, { x: nx, y: ny, text: "nobody sees the map", tone: "grey" });

      const target = map.pt(F.x[ME]);
      return (t) => {
        const velK = ramp(t, T.vel[0], T.vel[1], E.inOut);
        const fade = ramp(t, T.fade[0], T.fade[1], E.inOut);
        map.update({
          k: ramp(t, T.map[0], T.map[1]),
          heat: 1 - 0.92 * fade,
          dots: F.x.map((x, i) => ({
            x,
            tone: "blue",
            r: 13,
            s: E.pop(L12.seq(t, T.dots.t0, T.dots.step, T.dots.dur, i)),
            focus: i === ME && t > T.pos[0],
          })),
          vecs: F.x.map((x, i) => ({
            a: x,
            b: [x[0] + F.v[i][0], x[1] + F.v[i][1]],
            tone: "grey",
            w: 5,
            head: 14,
            k: velK,
          })),
        });

        legend.set({ k: ramp(t, T.legend[0], T.legend[1]) });
        const posK = ramp(t, T.pos[0], T.pos[1]);
        posLab.set({ k: posK });
        posChip.set({ k: posK });
        // a thin pointer from the position chip to the dot (stops short of the dot's outline)
        const from = [PX - 6, 148 + 38];
        const d = Math.hypot(target[0] - from[0], target[1] - from[1]);
        const to = [target[0] + ((from[0] - target[0]) * 22) / d, target[1] + ((from[1] - target[1]) * 22) / d];
        pointer.set({ a: from, b: to, k: ramp(t, T.pos[0] + 0.1, T.pos[1] + 0.2, E.inOut), o: 0.9 });

        const odK = ramp(t, T.odour[0], T.odour[1]);
        odLab.set({ k: odK });
        odChip.set({ k: odK });
        odTags.forEach((g, j) => g.set({ k: L12.seq(t, T.others.t0, T.others.step, T.others.dur, j) }));

        const vK = ramp(t, T.vel[0], T.vel[0] + 0.6);
        velTag.set({ k: vK });
        velLab.set({ k: ramp(t, T.vel[0] + 0.3, T.vel[0] + 0.9) });
        blind.set({ k: ramp(t, T.fade[0] + 0.4, T.fade[0] + 1.0) });
      };
    },
  });
})();

/* Lecture 11 video, scene 2: a flock has no leader. The app's own 'A flock to poke' demo, run for real: L11.RUN.SCARE
   (50 boids already flocking, a predator strike at tick 120 at the flock centre). The nearby birds swerve away, the flock
   breaks into a few groups for a moment (polarisation dips to 0.22), then pulls itself back together (0.9 again at tick 253).
   Every frame is drawn from the precomputed log: tick = 36 * (t - 0.4). Polarisation is defined on screen here
   ('1 = all head the same way') and reused by later scenes. */
VID.scene({
  kicker: "FLOCKING",
  title: ["Many birds, one flock,", "and no leader"],
  dur: 10,
  caps: [
    [0.5, 3.1, "A flock moves as one, with no leader."],
    [3.6, 6, "A predator strikes: nearby birds swerve away."],
    [6.4, 9.6, "Then the flock pulls back together."],
  ],
  build(stage, V) {
    const L11 = V.l11;
    const { ramp, flash, clamp } = V;

    // ---- data (simulated and asserted in common.js), re-checked against the storyboard and the timeline
    const R = L11.RUN.SCARE;
    const TPS = 36;
    const T0 = 0.4;
    const tickAt = (t) => clamp(TPS * (t - T0), 0, 360);
    L11.same([R.polar[0].toFixed(2), R.groups[0]], ["1.00", 1], "scene 2: one flock before the strike");
    L11.same([R.fear.at, R.dip.toFixed(2), R.dipAt, R.back], [120, "0.22", 140, 253], "scene 2: strike, dip, recovery");
    L11.same(Math.max(...R.groups.slice(120, 250)), 4, "scene 2: most groups after the strike");
    // the strike lands while 'A predator strikes' is read, the dip and recovery fall inside their bump windows
    L11.close(T0 + R.fear.at / TPS, 3.73, 0.01, "scene 2: strike time");
    L11.close(T0 + R.dipAt / TPS, 4.29, 0.01, "scene 2: dip time");
    L11.close(T0 + R.back / TPS, 7.43, 0.01, "scene 2: recovery time");
    const oneAgain = R.groups.findIndex(
      (g, k) => k > R.dipAt && g === 1 && R.groups.slice(k, 345).every((x) => x === 1),
    );
    L11.same(oneAgain > 0 && T0 + oneAgain / TPS < 7.8, true, "scene 2: one group again by the groups bump");

    // ---- layout (the stats row keeps a 12 px margin; the definition tag sits between the two stats)
    const fv = L11.field(stage, { x: 0, y: 0, w: 936, h: 500, zoom: 1.56, size: 24 });
    const pol = L11.stat(stage, { x: 12, y: 528, w: 320, h: 80, label: "polarisation", tone: "blue" });
    const def = L11.tag(stage, { x: 343, y: 548, text: "1 = all head the same way", tone: "blue" });
    const grp = L11.stat(stage, { x: 744, y: 528, w: 180, h: 80, label: "groups", tone: "grey" });
    const lead = L11.tag(stage, { x: 16, y: 16, text: "no leader", tone: "grey", solid: true });

    return (t) => {
      const tick = tickAt(t);
      const k = Math.round(tick);
      fv.update({ run: R, tick, cam: "centre", k: ramp(t, 0.2, 0.7), fear: t >= 3.6 ? 1 : 0 });
      const sk = ramp(t, 0.6, 1.0);
      pol.set({ text: R.polar[k].toFixed(2), k: sk, bump: 0.6 * flash(t, 4.1, 4.6) });
      grp.set({ text: String(R.groups[k]), k: sk, bump: 0.6 * flash(t, 7.3, 7.8) });
      lead.set({ k: ramp(t, 1.0, 1.4) });
      def.set({ k: ramp(t, 1.3, 1.7) });
    };
  },
});

/* Lecture 11 video, scene 6: rule 2, alignment (lesson 11.2). The close-up run L11.RUN.ALI (alignment only): the focus boid
   (purple) heads north, its four flockmates head east. Each tick it turns part of the way towards the AVERAGE heading of
   the flockmates it senses (and they align too), so by tick 40 all five agree at 60 degrees from north. Frozen at tick 0
   while the picture is explained (own heading purple, the flockmates' headings and their average blue), then the real log
   plays (10 ticks/s, 0 -> 40) with every arrow following the live headings; the polarisation stat climbs to 1.00. Every
   number is read from the log and asserted in build(). */
VID.scene({
  kicker: "RULE 2",
  title: ["Alignment:", "match your neighbours"],
  dur: 10,
  caps: [
    [0.5, 2.6, "Rule 2, alignment: match your neighbours."],
    [2.9, 4.8, "On average, its neighbours head east."],
    [5.1, 7.4, "It turns a little towards them each step."],
    [7.7, 9.6, "Soon they all head the same way."],
  ],
  build(stage, V) {
    const L11 = V.l11;
    const { ramp, flash, clamp } = V;
    const R = L11.RUN.ALI;
    const N = R.n;

    // ---- the data (read from the log, asserted)
    L11.same([R.P.ws, R.P.wa, R.P.wc], [0, 1, 0], "scene 6: alignment only");
    const p0 = L11.pushes(R, 0, 0);
    L11.same(
      [p0.nb.length, ...p0.ali.map((v) => Math.round(v * 100) / 100)],
      [4, 0.19, 0.19],
      "scene 6: 4 neighbours and the alignment push at tick 0",
    );
    L11.same(p0.ali, L11.CLOSE.ALI.push, "scene 6: push agrees with CLOSE.ALI");
    const f0 = L11.frame(R, 0).map(L11.hdg);
    L11.same(f0, [0, 90, 90, 90, 90], "scene 6: the focus heads north, the four flockmates east");
    L11.same(Math.round(L11.hood(R, 0, 0).heading), 0, "scene 6: on average the neighbours head east (0 = right)");
    const f40 = L11.frame(R, 40).map(L11.hdg);
    L11.same(f40[0], 60, "scene 6: the focus heads 60 degrees at tick 40");
    L11.same(f40[0], L11.CLOSE.ALI.agree, "scene 6: agrees with CLOSE.ALI");
    L11.check(Math.max(...f40) - Math.min(...f40) <= 4, "scene 6: all five headings agree within 4 degrees at tick 40");
    const P0 = R.polar[0].toFixed(2),
      P40 = R.polar[40].toFixed(2);
    L11.check(P0 !== P40 && P40 === "1.00", "scene 6: polarisation climbs to 1.00 by tick 40");

    // ---- timeline
    const T0 = 4.8,
      TPS = 10,
      TEND = 40,
      TSAME = 7.7;
    const tickAt = (t) => clamp(TPS * (t - T0), 0, TEND);
    L11.same(R.polar[Math.round(TPS * (TSAME - T0))].toFixed(2), "1.00", "scene 6: all the same way when the tag pops");

    // ---- the window (zoom 3 >= 936 / 600 and 520 / 360: one world at most)
    const WIN = { w: 936, h: 520, zoom: 3 };
    const fv = L11.field(stage, { x: 0, y: 0, ...WIN, size: 40 });
    L11.check(WIN.zoom >= WIN.w / L11.K.W && WIN.zoom >= WIN.h / L11.K.H, "scene 6: zoom shows one world at most");
    const mateArrows = Array.from({ length: N - 1 }, () => L11.vec(fv.svg, { tone: "blue", w: 6, head: 18 }));
    const avgArrow = L11.vec(fv.svg, { tone: "blue", w: 7, head: 22 });
    const ownArrow = L11.vec(fv.svg, { tone: "purple", w: 7, head: 22 });
    const avgTag = L11.tag(stage, { x: 0, y: 0, text: "average heading", tone: "blue" });
    const avgW = L11.tagW("average heading");

    // bottom row: polarisation (defined in scene 2: 1 = all head the same way), then 'all the same way'
    const pol = L11.stat(stage, { x: 0, y: 548, w: 420, h: 80, label: "polarisation", tone: "blue" });
    const same = L11.tag(stage, { x: 460, y: 562, text: "all the same way", tone: "blue", solid: true });

    // the camera keeps the flock centre across but the focus boid's height, so its perception circle (210 px) always fits
    const camAt = (tick) => ({ x: L11.centre(L11.at(R, tick)).x, y: L11.at(R, tick)[0].y });
    const rad = (d) => (d * Math.PI) / 180;
    const ray = (a, deg, from, len) => ({
      x1: a.x + Math.cos(rad(deg)) * from,
      y1: a.y + Math.sin(rad(deg)) * from,
      x2: a.x + Math.cos(rad(deg)) * (from + len),
      y2: a.y + Math.sin(rad(deg)) * (from + len),
    });

    return (t) => {
      const tick = tickAt(t);
      fv.update({
        run: R,
        tick,
        cam: camAt(tick),
        focus: 0,
        ring: ramp(t, 0.9, 1.4),
        radius: ramp(t, 0.9, 1.4),
        hood: ramp(t, 1.2, 1.4),
        trail: tick > 0 ? 30 : 0,
        k: ramp(t, 0.2, 0.7),
      });
      // a short blue arrow in front of every flockmate, along its own heading
      mateArrows.forEach((a, i) => {
        const b = fv.boid(i + 1);
        a.set({ ...ray(b, b.r, 24, 60), k: L11.seq(t, 2.9, 0.1, 0.3, i) });
      });
      // the focus: its own heading (purple) and the neighbours' average heading (blue, longer)
      const F = fv.boid(0);
      const hood = L11.hood(R, tick, 0);
      const avgDeg = hood ? hood.heading : F.r;
      const kAvg = ramp(t, 3.7, 4.4);
      const A = ray(F, avgDeg, 46, 130);
      avgArrow.set({ ...A, k: kAvg });
      ownArrow.set({ ...ray(F, F.r, 46, 100), k: ramp(t, 1.6, 2.1) });
      // the tag sits just past the tip of the blue arrow, then fades once the headings agree (the arrows overlap)
      const tip = { x: A.x2 + Math.cos(rad(avgDeg)) * 26, y: A.y2 + Math.sin(rad(avgDeg)) * 26 };
      avgTag.set({
        x: tip.x - avgW / 2 + Math.cos(rad(avgDeg)) * (avgW / 2 - 10),
        y: tip.y - 25,
        k: ramp(t, 4.1, 4.5),
      });
      const k = Math.round(tick);
      pol.set({
        text: R.polar[k].toFixed(2),
        k: ramp(t, 0.4, 0.8),
        bump: flash(t, TSAME - 0.1, TSAME + 0.3),
      });
      same.set({ k: ramp(t, TSAME, TSAME + 0.4) });
    };
  },
});

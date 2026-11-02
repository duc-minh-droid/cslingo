/* Lecture 11 video, scene 5: rule 1, separation (lesson 11.2). The close-up run L11.RUN.SEP (separation only): the focus
   boid (purple, heading east) has flockmates 5 above, 15 below and 25 behind. Inside the separation distance 20 each one
   pushes 1 - d / 20 (0.75, 0.25, 0), so the net push points down, away from the close one. Frozen at tick 0 while the
   picture is explained, then the real log plays (6.25 ticks/s, 0 -> 20): the flockmates fly apart, the push arrow shrinks
   and fades out by tick 4 (before the lower flockmate becomes the nearer one) and the closest-pair stat climbs past 20.
   Every number is read from the log and asserted in build(). */
VID.scene({
  kicker: "RULE 1",
  title: ["Separation:", "don't crowd"],
  dur: 10,
  caps: [
    [0.5, 2.5, "Rule 1, separation: don't crowd."],
    [2.8, 5, "The closer a flockmate, the harder the push."],
    [5.3, 7.4, "So the boid steers away."],
    [7.7, 9.6, "Now nobody is too close."],
  ],
  build(stage, V) {
    const L11 = V.l11,
      L5 = V.l5;
    const { ramp, flash, clamp } = V;
    const R = L11.RUN.SEP;
    const C = L11.CLOSE.SEP;
    const SEP_R = L11.K.SEP_R;

    // ---- the data (read from the log, asserted)
    L11.same(SEP_R, 20, "scene 5: separation distance");
    L11.same([R.P.ws, R.P.wa, R.P.wc], [1, 0, 0], "scene 5: separation only");
    L11.same(
      C.mates.map((m) => [m.j, m.d, m.push]),
      [
        [1, 5, 0.75],
        [2, 15, 0.25],
        [3, 25, 0],
      ],
      "scene 5: flockmates and their pushes",
    );
    C.mates.forEach((m) => L11.close(m.push, Math.max(0, 1 - m.d / SEP_R), 1e-9, "scene 5: push = 1 - d / 20"));
    L11.same(
      C.push.map((v) => Math.round(v * 100) / 100),
      [0, 0.45],
      "scene 5: net push (down)",
    );
    const minPair = (b) => Math.min(...b.flatMap((p, i) => b.slice(i + 1).map((q) => L11.dist(p, q))));
    const closest = Array.from({ length: R.ticks + 1 }, (_, k) => minPair(L11.frame(R, k)));
    L11.same(Math.round(closest[0]), 5, "scene 5: closest pair at tick 0");
    const kClear = closest.findIndex((d) => d > SEP_R);
    L11.check(kClear > 0 && kClear <= 15, "scene 5: no pair within 20 by tick 15");
    L11.same(L11.hdg(L11.frame(R, 0)[0]), 90, "scene 5: the focus heads east");
    L11.same(L11.hdg(L11.frame(R, 20)[0]), 96, "scene 5: the focus turned away (90 -> 96 by tick 20)");

    // ---- timeline
    const T0 = 5.2,
      TPS = 6.25,
      TEND = 20;
    const tClear = T0 + kClear / TPS;
    // the camera follows the flock centre, shifted so the focus sits left of middle (room for the tags on its right)
    const camAt = (tick) => {
      const c = L11.centre(L11.at(R, tick));
      return { x: c.x + 25, y: c.y };
    };
    const tickAt = (t) => clamp(TPS * (t - T0), 0, TEND);
    const ARROW_OUT = [2.5, 4]; // ticks over which the red push arrow fades
    L11.check(L11.pushes(R, ARROW_OUT[1], 0).sep[1] > 0, "scene 5: the push still points down when its arrow is gone");

    // ---- the window (zoom 4.5 >= 936 / 600 and 520 / 360: one world at most)
    const WIN = { w: 936, h: 520, zoom: 4.5 };
    const fv = L11.field(stage, { x: 0, y: 0, ...WIN, size: 40 });
    L11.check(WIN.zoom >= WIN.w / L11.K.W && WIN.zoom >= WIN.h / L11.K.H, "scene 5: zoom shows one world at most");

    // distance tags (one per flockmate, nearest first), the separation-distance tag
    const TAGS = [
      { m: C.mates[0], tone: "red", solid: true, dx: 0, dy: -84, at: 1.6 },
      { m: C.mates[1], tone: "red", solid: false, dx: 40, dy: 20, left: true, at: 2.2 },
      { m: C.mates[2], tone: "grey", solid: false, dx: -77, dy: 56, at: 2.8 },
    ].map((o) => {
      const text = `${o.m.d} away · push ${o.m.push}`;
      return { ...o, text, w: L11.tagW(text), tg: L11.tag(stage, { x: 0, y: 0, text, tone: o.tone, solid: o.solid }) };
    });
    const sepTag = L11.tag(stage, { x: 0, y: 0, text: `separation distance ${SEP_R}`, tone: "red" });

    // bottom row: the closest pair, then a green tick and 'nobody within 20'
    const stat = L11.stat(stage, { x: 0, y: 548, w: 360, h: 80, label: "closest", tone: "red" });
    const svg = L5.svg(stage);
    const tickG = svg.appendChild(L5.tick(412, 588, 56, "green", { w: 10 }));
    const okTag = L11.tag(stage, { x: 456, y: 562, text: `nobody within ${SEP_R}`, tone: "green", solid: true });

    return (t) => {
      const tick = tickAt(t);
      fv.update({
        run: R,
        tick,
        cam: camAt(tick),
        focus: 0,
        ring: ramp(t, 0.8, 1.3),
        sepRing: ramp(t, 0.8, 1.3),
        // the push shrinks to nothing as the close one falls behind; fade it out before it can flip (the lower flockmate
        // becomes the nearer one from tick 5), so the arrow only ever shows the push away from the close flockmate
        arrows: { sep: ramp(t, 3.4, 4.2) * (1 - ramp(tick, ARROW_OUT[0], ARROW_OUT[1])) },
        arrowScale: 260,
        trail: tick > 0 ? 20 : 0,
        k: ramp(t, 0.2, 0.7),
      });
      // tags sit next to their boid at tick 0 and fade out as the run starts
      const out = 1 - ramp(t, T0, T0 + 0.3);
      TAGS.forEach((o) => {
        const b = fv.boid(o.m.j);
        o.tg.set({ x: b.x + o.dx - (o.left ? 0 : o.w / 2), y: b.y + o.dy, k: ramp(t, o.at, o.at + 0.4), o: out });
      });
      const F = fv.boid(0);
      sepTag.set({
        x: F.x + SEP_R * 4.5 + 16,
        y: F.y - 24,
        k: ramp(t, 1.1, 1.5),
        o: out,
      });
      const d = closest[Math.round(tick)];
      stat.set({
        text: String(Math.round(d)),
        k: ramp(t, 0.4, 0.8),
        bump: flash(t, tClear, tClear + 0.4),
      });
      L5.drawOn(tickG, ramp(t, tClear, tClear + 0.4));
      okTag.set({ k: ramp(t, tClear + 0.1, tClear + 0.5) });
    };
  },
});

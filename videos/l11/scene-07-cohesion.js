/* Lecture 11 video, scene 7: rule 3, cohesion (lesson 11.2). The close-up run L11.RUN.COH (cohesion only): everyone heads
   north and three of the focus boid's four flockmates are on its right. It steers towards the AVERAGE POSITION (the
   centre) of the flockmates it senses: dashed green lines show what is averaged, a green target marks the centre and the
   green cohesion arrow points at it. Then the real log plays (8.33 ticks/s, 0 -> 30): the focus leans right (heading
   0 -> 42 degrees), the target moves with the group and the spread stat falls 37 -> 17. Every number is read from the log
   and asserted in build(). */
VID.scene({
  kicker: "RULE 3",
  title: ["Cohesion:", "stay with the group"],
  dur: 10,
  caps: [
    [0.5, 2.6, "Rule 3, cohesion: stay with the group."],
    [2.9, 4.8, "It finds the centre of its neighbours."],
    [5.1, 7.4, "And steers towards that centre."],
    [7.7, 9.6, "The group closes up."],
  ],
  build(stage, V) {
    const L11 = V.l11;
    const { ramp, flash, clamp } = V;
    const R = L11.RUN.COH;

    // ---- the data (read from the log, asserted)
    L11.same([R.P.ws, R.P.wa, R.P.wc], [0, 0, 1], "scene 7: cohesion only");
    const p0 = L11.pushes(R, 0, 0);
    L11.same(
      [p0.nb.length, ...p0.coh.map((v) => Math.round(v * 100) / 100)],
      [4, 0.11, 0.04],
      "scene 7: 4 neighbours and the cohesion push at tick 0 (right, a little down)",
    );
    L11.same(p0.coh, L11.CLOSE.COH.push, "scene 7: push agrees with CLOSE.COH");
    L11.same(p0.nb.filter((q) => q.dx > 0).length, 3, "scene 7: three of the four flockmates are on its right");
    L11.same(
      [Math.round(R.spread[0]), Math.round(R.spread[30])],
      [37, 17],
      "scene 7: the spread falls 37 -> 17 by tick 30",
    );
    L11.same(
      [L11.hdg(L11.frame(R, 0)[0]), L11.hdg(L11.frame(R, 30)[0])],
      [0, 42],
      "scene 7: the focus leans right, heading 0 -> 42 degrees",
    );
    for (let k = 0; k <= 30; k++) L11.same(L11.pushes(R, k, 0).nb.length, 4, `scene 7: 4 neighbours at tick ${k}`);

    // ---- timeline
    const T0 = 5.1,
      TPS = 25 / 3,
      TEND = 30;
    const tickAt = (t) => clamp(TPS * (t - T0), 0, TEND);
    const TDONE = T0 + TEND / TPS; // 8.7

    // ---- the window (zoom 3 >= 936 / 600 and 520 / 360: one world at most)
    const WIN = { w: 936, h: 520, zoom: 3 };
    const fv = L11.field(stage, { x: 0, y: 0, ...WIN, size: 40 });
    L11.check(WIN.zoom >= WIN.w / L11.K.W && WIN.zoom >= WIN.h / L11.K.H, "scene 7: zoom shows one world at most");
    const lines = p0.nb.map(() =>
      fv.svg.appendChild(
        V.s("line", {
          "stroke-width": "3",
          "stroke-dasharray": "9 7",
          "stroke-linecap": "round",
          style: { stroke: "var(--teal)" },
        }),
      ),
    );
    const ring = fv.svg.appendChild(
      V.s("circle", { r: "26", fill: "none", "stroke-width": "4", style: { stroke: "var(--teal)" } }),
    );
    const dot = L11.token(stage, { tone: "green", size: 30 });
    const cTag = L11.tag(stage, { x: 0, y: 0, text: "centre", tone: "green" });
    const cW = L11.tagW("centre");

    // bottom row: the spread of the group, then 'closer together'
    const spread = L11.stat(stage, { x: 0, y: 548, w: 360, h: 80, label: "spread", tone: "green" });
    const closer = L11.tag(stage, { x: 400, y: 562, text: "closer together", tone: "green", solid: true });

    const f1 = (n) => n.toFixed(1);
    return (t) => {
      const tick = tickAt(t);
      fv.update({
        run: R,
        tick,
        cam: "centre",
        focus: 0,
        ring: ramp(t, 0.9, 1.4),
        radius: ramp(t, 0.9, 1.4),
        hood: ramp(t, 1.2, 1.4),
        arrows: { coh: ramp(t, 4.2, 4.7) },
        arrowScale: 600,
        trail: tick > 0 ? 30 : 0,
        k: ramp(t, 0.2, 0.7),
      });
      // the neighbours' centre (a world point), drawn as a green target
      const c = L11.hood(R, tick, 0).centre;
      const C = fv.px(c.x, c.y);
      // dashed lines from each neighbour to the centre: grow 2.9-3.5, fade 4.4-4.8
      const nb = L11.pushes(R, tick, 0).nb;
      const kOut = 1 - ramp(t, 4.4, 4.8);
      lines.forEach((ln, i) => {
        const b = fv.boid(nb[i].j);
        const k = L11.seq(t, 2.9, 0.08, 0.36, i);
        ln.setAttribute("x1", f1(b.x));
        ln.setAttribute("y1", f1(b.y));
        ln.setAttribute("x2", f1(b.x + (C.x - b.x) * k));
        ln.setAttribute("y2", f1(b.y + (C.y - b.y) * k));
        V.show(ln, k > 0.01 ? kOut : 0);
      });
      const kT = ramp(t, 3.5, 3.9);
      ring.setAttribute("cx", f1(C.x));
      ring.setAttribute("cy", f1(C.y));
      V.show(ring, kT);
      dot.set({ x: C.x, y: C.y, s: kT > 0 ? 0.6 + 0.4 * kT : 0, o: kT });
      // the tag sits below-left of the target (clear of the flockmates) and fades as the run starts
      cTag.set({ x: C.x - cW - 14, y: C.y + 24, k: ramp(t, 3.6, 4.0), o: 1 - ramp(t, T0, T0 + 0.3) });
      spread.set({
        text: String(Math.round(R.spread[Math.round(tick)])),
        k: ramp(t, 0.4, 0.8),
        bump: flash(t, TDONE, TDONE + 0.4),
      });
      closer.set({ k: ramp(t, TDONE, TDONE + 0.4) });
    };
  },
});

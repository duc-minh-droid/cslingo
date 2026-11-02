/* Lecture 11 video, scene 8: the three rules together make a flock (lessons 11.2 'Putting the three together' and 11.3
   'They polarise themselves'). One real run, L11.RUN.FORM (40 boids scattered with random headings, all three rules at
   weight 1, radius 70, seed 29, simulated once at load in l11/common.js).
   Beat 1 (frozen at tick R.show = 119): boid 37 (purple) senses 6 flockmates (orange); its separation (red), alignment
   (blue) and cohesion (green) pushes draw on one after another with an equation row under the window, then their purple SUM
   and the 'turn' chip; 3.8-4.6 the run plays 12 ticks so the boid visibly turns along the sum.
   Beat 2 (5.0-13.4): back to tick 0, the whole flock plays 50 ticks/s (0 -> 420): scattered boids swirl into small groups
   that merge and line up. Polarisation (defined in scene 2) and the number of groups follow the log; polarisation passes
   0.9 at tick 191 (bump), groups reach 1 at tick 364 and stay 1 (bump). Hold on one flock. */
VID.scene({
  kicker: "BOIDS",
  title: ["Three rules together", "make a flock"],
  dur: 14,
  caps: [
    [0.5, 2.8, "Each boid adds up its three pushes."],
    [3.1, 4.6, "The sum turns it."],
    [5.2, 8.8, "All boids do this at the same time."],
    [9.1, 13.7, "Out of the chaos, one flock forms."],
  ],
  build(stage, V) {
    const L11 = V.l11;
    const L5 = V.l5;
    const { ramp, flash, clamp, ease: E } = V;

    // ---- the data (computed and asserted in l11/common.js), asserted again here
    const R = L11.RUN.FORM;
    const r2 = (x) => Math.round(x * 100) / 100;
    const mag = (v) => Math.hypot(v[0], v[1]);
    L11.same([R.n, R.ticks, R.P.R], [40, 420, 70], "scene 8: 40 boids, 420 ticks, radius 70");
    L11.same([R.P.ws, R.P.wa, R.P.wc], [1, 1, 1], "scene 8: all three rules at weight 1");
    L11.same([R.focus, R.show], [37, 119], "scene 8: the focus boid and the show tick");
    const sh = L11.pushes(R, R.show, R.focus);
    L11.same(
      [sh.nb.length, ...[sh.sep, sh.ali, sh.coh, sh.sum].map((v) => r2(mag(v)))],
      [6, 0.22, 0.13, 0.11, 0.18],
      "scene 8: neighbours and push sizes at the show tick",
    );
    L11.same([r2(R.polar[0]), R.groups[0]], [0.06, 21], "scene 8: scattered at tick 0");
    L11.same(R.p90, 191, "scene 8: polarisation first reaches 0.9");
    const one = L11.firstTick(R, "groups", (g) => g === 1);
    L11.same(one, 364, "scene 8: first tick with one group");
    L11.check(
      R.groups.slice(one).every((g) => g === 1),
      "scene 8: stays one flock after it forms",
    );
    L11.same([r2(R.polar[420]), R.groups[420]], [0.99, 1], "scene 8: one flock heading one way at the end");

    // ---- timeline
    const T_PLAY1 = 3.8; // beat 1 plays 12 ticks from the show tick
    const TPS1 = 15;
    const T_FADE = 4.6; // window fades out, switches to tick 0 at 5.0, fades back in
    const T2 = 5.0; // beat 2 starts
    const TPS2 = 50; // 0 -> 420 by 13.4
    const tP90 = T2 + R.p90 / TPS2; // 8.82
    const tOne = T2 + one / TPS2; // 12.28

    // ---- the window and the rows under it
    const fv = L11.field(stage, { x: 0, y: 0, w: 936, h: 470, zoom: 1.56, size: 24 });
    const eq = [
      L11.chip(stage, { x: 0, y: 494, w: 220, h: 76, text: "separation", tone: "red", fs: 30 }),
      L11.chip(stage, { x: 260, y: 494, w: 200, h: 76, text: "alignment", tone: "blue", fs: 30 }),
      L11.chip(stage, { x: 500, y: 494, w: 190, h: 76, text: "cohesion", tone: "green", fs: 30 }),
      L11.chip(stage, { x: 730, y: 494, w: 206, h: 76, text: "turn", tone: "purple", fs: 30, solid: true }),
    ];
    const signs = L5.svg(stage);
    const marks = [
      signs.appendChild(L11.mark("plus", 240, 532, 34, "grey")),
      signs.appendChild(L11.mark("plus", 480, 532, 34, "grey")),
      signs.appendChild(L11.mark("equals", 710, 532, 34, "grey")),
    ];
    // tip-to-tail copies of the blue and green pushes: they show the adding (frozen at the show tick)
    const SCALE = 650; // px per unit of push: red 143, blue 84, green 72, purple sum 117 px
    const copies = [
      L11.vec(fv.svg, { tone: "blue", w: 6, head: 18 }),
      L11.vec(fv.svg, { tone: "green", w: 6, head: 18 }),
    ];
    const pol = L11.stat(stage, { x: 0, y: 494, w: 440, h: 80, label: "polarisation", tone: "blue" });
    const grp = L11.stat(stage, { x: 470, y: 494, w: 300, h: 80, label: "groups", tone: "grey" });

    return (t) => {
      // ---- the window
      const out = ramp(t, T_FADE, T2, E.inOut); // 0 -> 1 fading out (beat 1)
      const back = ramp(t, T2, T2 + 0.3, E.out); // 0 -> 1 fading in (beat 2)
      if (t < T2) {
        const tick = R.show + clamp((t - T_PLAY1) * TPS1, 0, 12);
        fv.update({
          run: R,
          tick,
          cam: "focus",
          focus: R.focus,
          ring: ramp(t, 0.6, 1.0),
          radius: ramp(t, 0.6, 1.0),
          hood: ramp(t, 0.6, 1.0),
          dim: 0.5,
          arrows: {
            sep: ramp(t, 1.0, 1.5),
            ali: ramp(t, 1.5, 2.0),
            coh: ramp(t, 2.0, 2.5),
            sum: ramp(t, 3.1, 3.7),
          },
          arrowScale: SCALE,
          trail: t > T_PLAY1 ? 12 : 0,
          k: ramp(t, 0.2, 0.7),
          o: 1 - 0.8 * out,
        });
        // the chain: blue slides to the red tip, green to the blue tip; it ends where the purple sum ends
        const F = fv.boid(R.focus);
        const slide = ramp(t, 2.6, 3.05, E.inOut);
        const co = ramp(t, 2.6, 2.75) * (1 - ramp(t, 3.65, 3.85));
        const a = { x: F.x + sh.sep[0] * SCALE * slide, y: F.y + sh.sep[1] * SCALE * slide };
        const b = { x: a.x + sh.ali[0] * SCALE * slide, y: a.y + sh.ali[1] * SCALE * slide };
        copies[0].set({
          x1: a.x,
          y1: a.y,
          x2: a.x + sh.ali[0] * SCALE,
          y2: a.y + sh.ali[1] * SCALE,
          dash: true,
          o: co * (1 - out),
        });
        copies[1].set({
          x1: b.x,
          y1: b.y,
          x2: b.x + sh.coh[0] * SCALE,
          y2: b.y + sh.coh[1] * SCALE,
          dash: true,
          o: co * (1 - out),
        });
      } else {
        copies.forEach((c) => c.set({ o: 0 }));
        const tick = clamp((t - T2) * TPS2, 0, R.ticks);
        fv.update({
          run: R,
          tick,
          cam: "centre",
          focus: R.focus,
          ring: 1,
          o: 0.2 + 0.8 * back,
        });
      }

      // ---- beat 1: the equation row (each chip pops with its arrow), gone by 5.0
      const eo = 1 - out;
      const pops = [1.0, 1.5, 2.0, 3.1];
      eq.forEach((c, i) => {
        const k = ramp(t, pops[i], pops[i] + 0.4);
        c.set({
          k,
          o: eo,
          solid: i === 3,
          s: 1 + 0.08 * flash(t, pops[i] + 0.3, pops[i] + 0.7) + (i === 3 ? 0.06 * flash(t, 3.8, 4.6) : 0),
        });
      });
      [1.5, 2.0, 3.1].forEach((t0, i) => {
        const k = ramp(t, t0, t0 + 0.3) * eo;
        marks[i].style.opacity = String(k);
        marks[i].style.visibility = k <= 0.001 ? "hidden" : "";
      });

      // ---- beat 2: the stats follow the log
      const k2 = clamp(Math.floor((t - T2) * TPS2), 0, R.ticks);
      const sk = ramp(t, T2, T2 + 0.4);
      pol.set({
        k: sk,
        text: R.polar[k2].toFixed(2),
        solid: t >= tP90,
        bump: flash(t, tP90, tP90 + 0.5),
      });
      grp.set({
        k: sk,
        text: String(R.groups[k2]),
        tone: t >= tOne ? "green" : "grey",
        solid: t >= tOne,
        bump: flash(t, tOne, tOne + 0.5),
      });
    };
  },
});

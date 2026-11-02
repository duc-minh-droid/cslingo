/* Lecture 11 video, scene 9: the same three rules give rich group behaviour with no extra rules (lesson 11.3, l11-behave).
   Two real runs side by side (simulated once at load in l11/common.js, asserted there and again here):
   LEFT, L11.RUN.BURST (60 boids packed in a 36-unit square, seed 5): flash expansion. Separation pushes them apart, the
   spread grows about ten times (15 -> 155 by tick 100), the groups go 1 -> 10, then cohesion and alignment pull them back
   to one group at tick 160. Plays 0.8-5.8 at 32 ticks/s, camera fixed on the packing point.
   RIGHT, L11.RUN.MEET (40 boids in two flocks heading for each other, seed 21): they meet, become one group at tick 32 and
   stay one, polarisation 0.00 -> 0.98 by tick 100. Plays 6.1-11.7 at 36 ticks/s. The window that is not playing is dimmed
   (its stats only to 0.8, text never fainter). */
VID.scene({
  kicker: "WHAT FLOCKS DO",
  title: ["Burst apart,", "then join up"],
  dur: 12,
  caps: [
    [0.6, 3.2, "Start them packed: they burst apart."],
    [3.5, 5.8, "Then they gather again."],
    [6.1, 8.6, "Two flocks meet head-on."],
    [8.9, 11.7, "They join and fly on as one flock."],
  ],
  build(stage, V) {
    const L11 = V.l11;
    const { ramp, flash, clamp, ease: E } = V;

    // ---- the data (computed and asserted in l11/common.js), asserted again here
    const B = L11.RUN.BURST;
    const M = L11.RUN.MEET;
    const r2 = (x) => Math.round(x * 100) / 100;
    L11.same([B.n, B.ticks, M.n, M.ticks], [60, 160, 40, 200], "scene 9: run sizes");
    L11.same(
      [Math.round(B.spread[0]), Math.round(B.spread[100])],
      [15, 155],
      "scene 9: BURST spread at ticks 0 and 100",
    );
    L11.same([B.groups[0], B.groups[100], B.groups[160]], [1, 10, 1], "scene 9: BURST groups at ticks 0, 100, 160");
    const bBack = B.groups.findLastIndex((g) => g !== 1) + 1; // the tick it is one group again (and stays)
    L11.same(bBack, 160, "scene 9: BURST back to one group at tick 160");
    L11.same([M.groups[0], M.merge], [2, 32], "scene 9: MEET two groups, one from tick 32");
    L11.check(
      M.groups.slice(M.merge).every((g) => g === 1),
      "scene 9: MEET stays one flock after merging",
    );
    L11.same([r2(M.polar[0]), r2(M.polar[100])], [0, 0.98], "scene 9: MEET polarisation at ticks 0 and 100");

    // ---- timeline
    const L0 = 0.8; // left plays 0 -> 160
    const LTPS = 32;
    const R0 = 6.1; // right plays 0 -> 200
    const RTPS = 36;
    const tSpread = L0 + 100 / LTPS; // 3.93: spread 155
    const tBack = L0 + bBack / LTPS; // 5.8: one group again
    const tMerge = R0 + M.merge / RTPS; // 6.99
    const tPol = R0 + 100 / RTPS; // 8.88

    // ---- the two windows, their tags and stats
    const left = L11.field(stage, { x: 0, y: 60, w: 456, h: 340, zoom: 0.95, size: 16 });
    const right = L11.field(stage, { x: 480, y: 60, w: 456, h: 340, zoom: 0.95, size: 16 });
    const lTag = L11.tag(stage, { x: 0, y: 0, text: "packed start", tone: "grey" });
    const rTag = L11.tag(stage, { x: 480, y: 0, text: "two flocks meet", tone: "grey" });
    const spread = L11.stat(stage, { x: 0, y: 420, w: 456, h: 80, label: "spread", tone: "red" });
    const flashTag = L11.tag(stage, { x: 0, y: 532, text: "flash expansion", tone: "red", solid: true });
    const lGroups = L11.tag(stage, { x: 280, y: 532, text: "groups 1", tone: "grey" });
    const rGroups = L11.stat(stage, { x: 480, y: 420, w: 456, h: 80, label: "groups", tone: "green" });
    const rPol = L11.stat(stage, { x: 480, y: 520, w: 456, h: 80, label: "polarisation", tone: "blue" });

    // the burst camera stays on the packing point, then glides (along the wrap) onto the regrouped flock
    const c0 = L11.centre(L11.frame(B, 0));
    const camAt = (tick, f) => {
      const c = L11.centre(L11.at(B, tick));
      return { x: c0.x + L11.wrap(c.x - c0.x, L11.K.W) * f, y: c0.y + L11.wrap(c.y - c0.y, L11.K.H) * f };
    };

    return (t) => {
      const k = ramp(t, 0.2, 0.6);
      const swap = ramp(t, 5.9, 6.1, E.inOut); // 0: left plays, 1: right plays
      const lo = 1 - 0.55 * swap;
      const ro = 0.45 + 0.55 * swap;
      const lso = 1 - 0.2 * swap;
      const rso = 0.8 + 0.2 * swap;

      // ---- left: the burst
      const lt = clamp((t - L0) * LTPS, 0, B.ticks);
      left.update({ run: B, tick: lt, cam: camAt(lt, ramp(t, 4.4, 5.8, E.inOut)), k, o: lo });
      const lk = Math.floor(lt);
      lTag.set({ k, o: lso });
      spread.set({
        k,
        o: lso,
        text: String(Math.round(B.spread[lk])),
        bump: flash(t, tSpread, tSpread + 0.5),
      });
      flashTag.set({ k: ramp(t, 1.8, 2.2), o: lso });
      const back = t >= tBack;
      lGroups.set({
        k,
        o: lso,
        text: `groups ${B.groups[lk]}`,
        tone: back ? "green" : "grey",
        solid: back,
        s: 1 + 0.12 * flash(t, tBack, tBack + 0.5),
      });

      // ---- right: two flocks meet
      const rt = clamp((t - R0) * RTPS, 0, M.ticks);
      right.update({ run: M, tick: rt, cam: "centre", k, o: (k > 0 ? 1 : 0) * ro });
      const rk = Math.floor(rt);
      rTag.set({ k, o: rso });
      rGroups.set({
        k,
        o: rso,
        text: String(M.groups[rk]),
        solid: t >= tMerge,
        bump: flash(t, tMerge, tMerge + 0.5),
      });
      rPol.set({
        k,
        o: rso,
        text: M.polar[rk].toFixed(2),
        solid: t >= tPol,
        bump: flash(t, tPol, tPol + 0.5),
      });
    };
  },
});

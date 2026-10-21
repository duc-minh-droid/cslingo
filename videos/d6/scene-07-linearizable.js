/* Lecture 6 · scene 07 (linearizable): many copies must act like one. Register x starts at 0 and client C writes 1 (a bar on a
   timeline). Good history: one flip moment inside the write bar explains every read. Bad history: B reads 0 after A read 1, so no
   flip fits. Every number comes from D6.LIN / D6.linCheck (asserted in common.js and again here). */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // the good and the bad history, straight from the lesson's rule
  const LIN = D6.LIN;
  const { good, bad } = LIN;
  D6.same([good.check.ok, good.check.flip], [true, 6], "scene 7 good history");
  D6.same([bad.check.ok, bad.check.lo, bad.check.hi], [false, 8, 7], "scene 7 bad history");
  const readOf = (hist, n) => hist.reads.find((r) => r.n === n);
  const aEnd = readOf(bad, bad.check.hiBy).e; // the flip must come before A's read of 1 ends
  const bStart = readOf(bad, bad.check.loBy).s; // ... and after B's read of 0 starts
  D6.same([aEnd, bStart], [bad.check.hi, bad.check.lo], "scene 7 range ends");

  V.scene({
    kicker: "LINEARIZABILITY",
    title: ["Linearizable: act", "like one copy"],
    dur: 14,
    caps: [
      [0.5, 2.5, "Many copies should act like one."],
      [3.0, 5.0, "Each bar is one operation in time."],
      [6.1, 7.9, "One flip explains every read."],
      [9.2, 11.0, "Now B reads 0 after A read 1."],
      [11.3, 13.4, "No flip fits: not linearizable."],
    ],
    build(stage) {
      // --- opening: three copies slide together into one ---
      const copies = ["R1", "R2", "R3"].map((name, i) =>
        D6.box(stage, { x: 60 + i * 240, y: 30, w: 150, h: 120, name, tone: "grey", vfs: 56 }),
      );
      const one = D6.box(stage, { x: 280, y: 30, w: 190, h: 120, name: "one copy", tone: "blue", vfs: 56 });
      const oneTag = D6.tag(stage, { x: 0, y: 0, text: "x = one copy", tone: "blue", solid: true });

      // --- the timeline ---
      const tl = D6.timeline(stage, { x: 0, y: 110, w: 936, T: LIN.T, lanes: LIN.lanes, laneH: 92, labelW: 170 });
      const zone0 = tl.zone({ s: 0, e: good.check.flip, tone: "grey", text: "x = 0" });
      const zone1 = tl.zone({ s: good.check.flip, e: LIN.T, tone: "green", text: "x = 1" });
      const wGood = tl.bar({ lane: 2, s: LIN.w.s, e: LIN.w.e, text: "write 1", tone: "purple" });
      const gBars = good.reads.map((r) =>
        tl.bar({ lane: r.c, s: r.s, e: r.e, text: `read ${r.v}`, tone: r.v ? "green" : "blue" }),
      );
      const flip = tl.flip();
      const goodWrap = V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "0", height: "0" } });
      stage.append(goodWrap);
      const goodBadge = L5.badge(goodWrap, {
        x: 0,
        y: 470,
        w: 440,
        h: 68,
        valid: "linearizable",
        invalid: "not linearizable",
      });

      const wBad = tl.bar({ lane: 2, s: LIN.w.s, e: LIN.w.e, text: "write 1", tone: "purple" });
      const bBars = bad.reads.map((r) =>
        tl.bar({ lane: r.c, s: r.s, e: r.e, text: `read ${r.v}`, tone: r.v ? "green" : "blue" }),
      );
      const rangeA = tl.range({ s: LIN.w.s, e: aEnd, row: 1, tone: "green", text: "before A ends" });
      const rangeB = tl.range({ s: bStart, e: LIN.w.e, row: 2, tone: "red", text: "after B starts" });
      const heading = D6.label(stage, { x: 0, y: 462, w: 380, text: "the flip must be…", tone: "grey", align: "left" });
      const badBadge = L5.badge(stage, {
        x: 0,
        y: 520,
        w: 440,
        h: 68,
        valid: "linearizable",
        invalid: "not linearizable",
      });

      return (t) => {
        // 0.1-2.6: three copies slide together into one, which shrinks into a tag
        const slide = ramp(t, 0.8, 1.6, E.inOut);
        const shrink = ramp(t, 2.0, 2.6, E.inOut);
        copies.forEach((c, i) => {
          c.set({
            value: "x",
            k: ramp(t, 0.1 + i * 0.1, 0.6),
            x: (1 - i) * 240 * slide,
            o: 1 - ramp(t, 1.5, 1.8, E.lin),
          });
        });
        one.set({
          value: "x",
          k: ramp(t, 1.5, 1.9),
          x: -277 * shrink,
          y: -61 * shrink,
          s: 1 - 0.65 * shrink,
          o: 1 - ramp(t, 2.3, 2.6, E.lin),
        });
        oneTag.set({ k: ramp(t, 2.3, 2.8), o: 1 });

        // 2.6: scaffold
        tl.set({ k: ramp(t, 2.6, 3.2, E.lin) });

        // good history 3.0-8.4
        const gOut = 1 - ramp(t, 8.0, 8.4, E.lin);
        wGood.set({ k: ramp(t, 3.0, 3.8), solid: true, o: gOut });
        gBars.forEach((b, i) => b.set({ k: ramp(t, 3.9 + i * 0.4, 4.4 + i * 0.4), o: gOut }));
        const fk = ramp(t, 6.0, 6.8);
        flip.set({ t: good.check.flip, k: fk, o: gOut });
        zone0.set({ k: ramp(t, 6.2, 6.8, E.lin), o: gOut });
        zone1.set({ k: ramp(t, 6.2, 6.8, E.lin), o: gOut });
        goodBadge("valid", ramp(t, 7.0, 7.5));
        V.show(goodWrap, gOut);

        // bad history 8.4-14
        wBad.set({ k: ramp(t, 8.4, 9.0), solid: true });
        const [bA, bB] = bBars;
        bA.set({ k: ramp(t, 8.6, 9.1) });
        const pop = flash(t, 9.7, 10.2);
        bB.set({ k: ramp(t, 8.95, 9.45), ring: t >= 9.7 ? "red" : null, s: 1 + 0.06 * pop });
        heading.set({ k: ramp(t, 10.0, 10.5) });
        rangeA.set({ k: ramp(t, 10.1, 10.6, E.lin) });
        rangeB.set({ k: ramp(t, 10.5, 11.0, E.lin) });
        badBadge(t >= 11.2 ? "invalid" : "none", ramp(t, 11.2, 11.8));
      };
    },
  });
})();

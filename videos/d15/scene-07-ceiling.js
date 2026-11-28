/* Lecture 15 (ds-15) · scene 7 (THE CEILING): Amdahl's formula S = 1 / ((1 − p) + p / s) and its curve against the number of
   processors (D15.amdahl, D15.CEIL): 90% shareable gives 4.7× on 8 and 8.8× on 64, never more than 1 ÷ 0.1 = 10×;
   50% shareable stays below 2× (1.9× on 32).
   Story (local seconds): 0.3 the formula, 0.9 / 1.6 the p and s tags; 3.4 the chart, the blue 90% curve draws (3.7-5.4), dots
   and tags at 8 (5.0) and 64 (5.6); 6.6 the green dashed ceiling at 10 and its tag; 9.2 the red 50% curve draws (9.2-10.4),
   its green dashed ceiling at 2 (10.4) and the dot at 32 (10.9). */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D9 = V.d9;
  const D15 = V.d15;
  const { ramp, flash, ease: E } = V;
  const C = D15.CEIL;
  const S90 = (s) => D15.amdahl(0.9, s);
  const S50 = (s) => D15.amdahl(0.5, s);
  D15.same("dots on the curves", [D15.f1(S90(8)), D15.f1(S90(64)), D15.f1(S50(32))], [C.p90.s8, C.p90.s64, C.p50.s32]);

  V.scene({
    kicker: "THE CEILING",
    title: ["More processors help,", "up to a limit"],
    dur: 13,
    caps: [
      [0.4, 3.2, "p: the share of time that can be shared. s: its speedup."],
      [3.4, 6.4, `90% shareable: 8 processors give ${C.p90.s8}×, 64 give ${C.p90.s64}×.`],
      [6.6, 9.0, `It can never beat 1 ÷ 0.1 = ${C.p90.max}×.`],
      [9.2, 12.6, `50% shareable: even 32 processors stay below ${C.p50.max}×.`],
    ],
    build(stage) {
      const f = D4.label(stage, { x: 468, y: 34, text: "S = 1 / ((1 − p) + p / s)", fs: 42 });
      const tp = D4.tag(stage, { x: 240, y: 100, text: "p = share that can be shared", tone: "blue" });
      const ts = D4.tag(stage, { x: 700, y: 100, text: "s = speedup of that part", tone: "blue" });
      const p = D9.plot(stage, {
        x: 12,
        y: 146,
        w: 912,
        h: 482,
        xr: [1, 64],
        yr: [0, 11],
        pad: { l: 64, r: 30, t: 14, b: 50 },
        xticks: [1, 8, 16, 32, 64],
        yticks: [0, 2, 4, 6, 8, 10],
        xlab: "processors",
        ylab: "speedup",
        dots: 6,
        segs: 4,
      });
      const mk = (x, y, dx, dy, text, tone, solid = true) => {
        const q = p.pt(x, y);
        return D4.tag(stage, { x: q.x + dx, y: q.y + dy, text, tone, solid });
      };
      const t8 = mk(8, S90(8), 62, 26, `${C.p90.s8}×`, "green");
      const t64 = mk(64, S90(64), -70, 38, `${C.p90.s64}×`, "green");
      const tCeil = mk(20, 10, 0, 32, `best possible: 1 ÷ 0.1 = ${C.p90.max}×`, "green");
      const l90 = mk(46, S90(46), 0, 50, "90% shareable", "blue", false);
      const t32 = mk(32, S50(32), 0, -36, `${C.p50.s32}×`, "green");
      const l50 = mk(40, S50(40), 0, 44, "50% shareable", "red", false);

      return (t) => {
        f.set({ k: ramp(t, 0.3, 0.7) });
        f.el.firstChild.style.color = "var(--ink)";
        tp.set({ k: ramp(t, 0.9, 1.2), s: 1 + 0.08 * flash(t, 1.2, 1.6) });
        ts.set({ k: ramp(t, 1.6, 1.9), s: 1 + 0.08 * flash(t, 1.9, 2.3) });
        const kc = ramp(t, 3.4, 3.8);
        const dots = [];
        if (t >= 5.0) dots.push({ at: [8, S90(8)], tone: "blue", r: 12, ring: t < 5.6 });
        if (t >= 5.6) dots.push({ at: [64, S90(64)], tone: "blue", r: 12 });
        if (t >= 10.9) dots.push({ at: [32, S50(32)], tone: "red", r: 12 });
        p.update({
          k: kc,
          axes: kc,
          curves: [
            { fn: S90, from: 1, to: 64, tone: "blue", w: 7, k: ramp(t, 3.7, 5.4, E.lin) },
            { fn: S50, from: 1, to: 64, tone: "red", w: 7, k: ramp(t, 9.2, 10.4, E.lin) },
          ],
          segs: [
            { a: [1, C.p90.max], b: [64, C.p90.max], tone: "green", w: 5, dash: true, k: ramp(t, 6.6, 7.4, E.lin) },
            { a: [1, C.p50.max], b: [64, C.p50.max], tone: "green", w: 5, dash: true, k: ramp(t, 10.3, 11.0, E.lin) },
          ],
          dots,
        });
        t8.set({ k: ramp(t, 5.0, 5.3) });
        t64.set({ k: ramp(t, 5.6, 5.9) });
        l90.set({ k: ramp(t, 4.6, 4.9) });
        tCeil.set({ k: ramp(t, 7.2, 7.6), s: 1 + 0.08 * flash(t, 7.6, 8.0) });
        l50.set({ k: ramp(t, 10.0, 10.3) });
        t32.set({ k: ramp(t, 10.9, 11.2) });
      };
    },
  });
})();

/* Lecture 10 (ds-10) · scene 5 (WATCH THE ERRORS): a deployed model only sees its error stream (1 wrong, 0 right); a rolling
   error rate over the last k records is jumpy when k is short (last 10 hits 30% with no drift at all) and slow when k is long
   (last 150 reaches 30% only at record 174 for a drift at record 100). Lesson 10.1 step 7 (rollFig). Every record, every
   rolling value and every record number comes from D10.ROLL (world(5), drift at record 100); this scene only reads it.
   Colours: red = errors and the false alarm, blue = the window and the rolling line the detector reads, purple = the drift,
   orange = 'slow', grey = right answers, axes, the 30% guide.
   Story (local seconds): 0.3 the first records as 1/0 chips; 1.8 two plots; 2.2-8.2 the playhead runs record 0 -> 260;
   ≈3.7 false alarm on last 10; ≈4.5 drift; ≈4.65 last 10 reacts; ≈6.2 last 150 reacts; 8.3 the chips make way for the
   verdicts 'jumpy' and 'slow'. Hold to 12. */
(function () {
  const V = window.VID;
  const D10 = V.d10;
  const D9 = V.d9;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;
  const R = D10.ROLL;
  const LINE = 30; // the alarm level both panels are read against (%)
  const P0 = 2.2; // playhead start
  const P1 = 8.2; // playhead end
  const tRec = (r) => P0 + ((P1 - P0) * r) / R.n; // when the playhead reaches record r
  const NCHIP = 14;
  D10.same(
    "window scene: last 10 swings 0..30% before the drift, false alarm at 66; reacts at 106 (k 10) and 174 (k 150)",
    [R.pre[10].hi, R.falseAt, R.first[10], R.first[150], R.at, R.n],
    [LINE, 66, 106, 174, 100, 260],
  );
  const KS = [10, 150];

  V.scene({
    kicker: "WATCH THE ERRORS",
    title: ["Read the errors", "through a window"],
    dur: 12,
    caps: [
      [0.4, 1.8, "Each prediction becomes a 1 if wrong, a 0 if right."],
      [2.2, 3.6, "Average the errors over a window of recent records."],
      [3.8, 5, `Last ${KS[0]} hits ${R.pre[10].hi}% before any drift: a false alarm.`],
      [5.1, 6.2, `After the drift at record ${R.at}, it reacts by ${R.first[10]}.`],
      [6.3, 8.2, `Last ${KS[1]} is steady, but reaches ${LINE}% only at ${R.first[150]}.`],
      [8.6, 11.8, "Too short is jumpy, too long is slow."],
    ],
    build(stage) {
      // the error stream, as 1 / 0 chips
      const chips = D4.chips(stage, {
        x: 12,
        y: 34,
        n: NCHIP,
        w: 44,
        h: 56,
        gap: 6,
        fs: 28,
        texts: (i) => String(R.xs[i]),
      });
      const streamLab = D4.label(stage, { x: 924, y: 62, text: "error stream", tone: "grey", fs: 28, anchor: "r" });

      const plots = KS.map((k, j) => {
        const p = D9.plot(stage, {
          x: 12,
          y: 120 + 260 * j,
          w: 912,
          h: 248,
          xr: [0, R.n],
          yr: [0, 80],
          yticks: [0, LINE],
          xticks: [],
          tickFmt: (v) => v + "%",
          pad: { l: 86, t: 64, b: 14 },
          marks: 4,
          texts: 2,
          dots: 4,
        });
        const strip = D10.strip(p.svg, { x0: p.lx(0), x1: p.lx(R.n), r1: R.n, y: 24, h: 30 });
        const span = D10.span(p.svg);
        const pts = R.roll[k].map((v, i) => (v == null ? null : [i + 1, v]));
        return { p, strip, span, pts, k };
      });
      const [A, B] = plots.map((q) => q.p);
      const at = (p, vx, vy) => p.pt(vx, vy);
      const falseTag = D4.tag(stage, { ...at(A, R.falseAt, 62), text: "false alarm", tone: "red" });
      const reactA = D4.tag(stage, { ...at(A, 150, 11), text: `record ${R.first[10]}`, tone: "blue" });
      const reactB = D4.tag(stage, { ...at(B, R.first[150], 62), text: `record ${R.first[150]}`, tone: "blue" });
      const jumpy = D4.tag(stage, { x: 300, y: 62, text: `last ${KS[0]}: jumpy`, tone: "red", solid: true, fs: 30 });
      const slow = D4.tag(stage, { x: 660, y: 62, text: `last ${KS[1]}: slow`, tone: "orange", solid: true, fs: 30 });

      const tFalse = tRec(R.falseAt);
      const tDrift = tRec(R.at);
      const tA = tRec(R.first[10]);
      const tB = tRec(R.first[150]);
      const OUT = 8.3; // the chips make way for the verdicts

      return (t) => {
        const out = ramp(t, OUT, OUT + 0.3, E.in);
        chips.all((i) => {
          const k = E.out(D10.seq(t, 0.3, 0.07, 0.3, i));
          const err = R.xs[i] === 1;
          return { tone: err ? "red" : "grey", solid: err, o: Math.min(1, k * 3) * (1 - out), s: 0.7 + 0.3 * E.pop(k) };
        });
        streamLab.set({ k: ramp(t, 0.9, 1.3, E.out) * (1 - out) });

        const rec = R.n * ramp(t, P0, P1, E.lin);
        const n = Math.floor(rec);
        plots.forEach((q, j) => {
          const { p, strip, span, pts, k } = q;
          const kp = ramp(t, 1.8 + 0.12 * j, 2.2 + 0.12 * j, E.lin);
          const dots = [];
          const texts = [{ at: [4, 72], text: `last ${k}`, tone: "blue", anchor: "start" }];
          const kd = ramp(t, tDrift, tDrift + 0.4, E.out);
          if (kd > 0)
            texts.push({ at: [103, 74], text: "drift", tone: "purple", anchor: "start", o: Math.min(1, kd * 2) });
          if (j === 0) {
            const kf = ramp(t, tFalse, tFalse + 0.3, E.out);
            if (kf > 0) dots.push({ at: [R.falseAt, LINE], tone: "red", r: 14, hollow: true, s: E.pop(kf) });
            const ka = ramp(t, tA, tA + 0.3, E.out);
            if (ka > 0) dots.push({ at: [R.first[10], LINE], tone: "blue", r: 11, s: E.pop(ka) });
          } else {
            const kb = ramp(t, tB, tB + 0.3, E.out);
            if (kb > 0) dots.push({ at: [R.first[150], LINE], tone: "blue", r: 11, s: E.pop(kb) });
          }
          p.update({
            k: kp,
            axes: kp,
            marks: [
              { y: LINE, tone: "grey", k: ramp(t, 2.0, 2.4, E.out) },
              { x: R.at, tone: "purple", w: 5, k: kd },
            ],
            curves: [{ pts: pts.slice(0, n).filter(Boolean), tone: "blue", w: 5 }],
            dots,
            texts,
          });
          strip.set({ xs: R.xs, to: n, o: kp });
          span.set({ x1: strip.x(Math.max(0, rec - k)), x2: strip.x(rec), y: 14, h: 8, tone: "blue", w: 5, o: kp });
        });
        falseTag.set({ k: ramp(t, tFalse + 0.1, tFalse + 0.45, E.lin) });
        reactA.set({ k: ramp(t, tA + 0.1, tA + 0.45, E.lin) });
        reactB.set({ k: ramp(t, tB + 0.1, tB + 0.45, E.lin) });
        jumpy.set({ k: ramp(t, 8.6, 9.0, E.lin), s: 1 + 0.06 * flash(t, 8.9, 9.3) });
        slow.set({ k: ramp(t, 8.8, 9.2, E.lin), s: 1 + 0.06 * flash(t, 9.1, 9.5) });
      };
    },
  });
})();

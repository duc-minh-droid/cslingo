/* Lecture 10 (ds-10) · scene 3 (THREE KINDS): the three kinds of concept drift, seen where a deployed model can see them, in its
   ERROR STREAM (lesson 10.1 steps 3-5 and its live demo). Three rows, one per kind, each the lessons' world(5) with a drift
   injected at record 100: abrupt (a pandemic), gradual (economic change), recurring (the seasons). Each row plays its stream:
   tall red ticks are errors, short grey ticks right answers; a purple dashed line is the true error rate and a purple dashed
   mark rises at the drift. Every record and rate comes from D10.KINDS (asserted on load). Colours: red = errors, grey = right
   answers and axes, purple = the world and its drift (true error rate, drift mark, kind labels). */
(function () {
  const V = window.VID;
  const D10 = V.d10;
  const D9 = V.d9;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;
  const K = D10.KINDS;
  const AT = K.at;
  const N = K.n;
  const [ab] = K.rows;
  const PRE = ab.truth[AT - 1],
    POST = ab.truth[AT];
  D10.same("kinds scene: the frozen model is wrong 10% before the drift, 50% after", [PRE, POST], [10, 50]);

  const T0 = [0.7, 4.6, 8.2];
  const PLAY = 2.6;
  const T = { pop: 0.2, end: 11.0 };
  const EX = ["a pandemic", "economic change", "the seasons"];
  const at = (i) => T0[i] + (PLAY * AT) / N; // when row i's playhead passes the drift

  V.scene({
    kicker: "THREE KINDS",
    title: ["Abrupt, gradual,", "recurring"],
    dur: 13,
    caps: [
      [0.4, 2, "Each tick is one prediction. Tall red ticks are errors."],
      [2.2, 4.2, `Abrupt, like ${EX[0]}: errors jump from ${PRE}% to ${POST}%.`],
      [5, 7.4, `Gradual, like ${EX[1]}: the new rule creeps in.`],
      [8.4, 10.8, `Recurring, like ${EX[2]}: the old rule comes back.`],
      [11, 12.8, "The model never changed. The world did."],
    ],
    build(stage) {
      const rows = K.rows.map((row, i) => {
        const y0 = 12 + 210 * i;
        const p = D9.plot(stage, {
          x: 168,
          y: y0,
          w: 756,
          h: 196,
          xr: [0, N],
          yr: [0, 70],
          yticks: [10, 50],
          xticks: [],
          tickFmt: (v) => `${v}%`,
          pad: { l: 86, r: 16, t: 58, b: 12 },
          texts: 3,
        });
        const strip = D10.strip(p.svg, { x0: p.lx(0), x1: p.lx(N), r0: 0, r1: N, y: 12, h: 38 });
        const label = D4.label(stage, { x: 84, y: y0 + 160, text: K.label[row.kind], tone: "purple", fs: 28 });
        return { row, y0, p, strip, label, icons: [] };
      });
      const svg = D4.svg(stage);
      rows[0].icons.push(svg.appendChild(D10.virus(84, rows[0].y0 + 72, 84, "red")));
      rows[1].icons.push(svg.appendChild(D10.coins(84, rows[1].y0 + 72, 84, "orange")));
      rows[2].icons.push(svg.appendChild(D10.sun(64, rows[2].y0 + 64, 60)));
      rows[2].icons.push(svg.appendChild(D10.snow(110, rows[2].y0 + 92, 56)));

      return (t) => {
        const endBump = flash(t, T.end, T.end + 0.6);
        rows.forEach((r, i) => {
          const k = D10.seq(t, T.pop, 0.12, 0.5, i);
          const t0 = T0[i];
          const head = N * ramp(t, t0, t0 + PLAY, E.lin);
          const n = Math.floor(head);
          const passed = t >= at(i);
          const bump = flash(t, at(i), at(i) + 0.5) + endBump;
          r.icons.forEach((g) => V.place(g, { s: (0.6 + 0.4 * E.pop(k)) * (1 + 0.15 * bump), o: Math.min(1, k * 3) }));
          r.label.set({ k });
          r.strip.set({ xs: r.row.xs, to: n });
          const mk = ramp(t, at(i), at(i) + 0.3, E.out);
          const ex = ramp(t, t0 + 2.0, t0 + 2.4, E.lin);
          const tr = i === 0 ? ramp(t, t0 + 2.2, t0 + 2.6, E.lin) : 0;
          r.p.update({
            k,
            axes: k,
            curves:
              n > 1 ? [{ pts: r.row.truth.slice(0, n).map((v, j) => [j, v]), tone: "purple", dash: true, w: 5 }] : [],
            marks: passed ? [{ x: AT, tone: "purple", dash: true, w: 4 + 4 * endBump, k: mk }] : [],
            texts: [
              { at: [N - 6, 62], text: EX[i], tone: "grey", anchor: "end", o: ex },
              { at: [AT + 6, 62], text: "drift", tone: "purple", anchor: "start", o: mk },
              { at: [N - 6, 50], dy: 36, text: "true error rate", tone: "purple", anchor: "end", o: tr },
            ],
          });
        });
      };
    },
  });
})();

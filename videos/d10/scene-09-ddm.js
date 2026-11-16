/* Lecture 10 (ds-10) · scene 9 (DDM): p + s against the warning and change lines, record by record.
   Story (local seconds; the playhead record n is pure in t):
     0.3-0.8 the plot pops.  0.8-4.0 n 0 -> 120: the error strip draws, and from record 30 the three curves: blue p + s, the
             orange dashed warning line p min + 2 s min and the red dashed change line p min + 3 s min (labels 2.2-2.6).
     4.0-4.4 a green ringed dot on the best moment, record 114, and the tag 'best: record 114'.
     5.4-5.8 a purple dashed mark after record 120: 'errors rise' (every other record wrong from 121).
     5.6-9.2 n 120 -> 138 at 0.2 s per record. Record 128 (7.2): an orange dot and 'warning: 0.154 ≥ 0.152', the records
             from 128 turn orange under an orange 'stored' bracket. Record 138 (9.2): a red dot, 'change: 0.183 ≥ 0.179' and a
             red vertical line.
     10.9-11.6 the warning and change tags fade (their dots stay), the orange bracket lifts and a blue arrow draws from it to
             the blue tag 'new model: records 128–138'. Hold to 13.
   Numbers from D10.DDM (xs, hist, pminAt, warn, change, rise). */
(function () {
  const V = window.VID;
  const D10 = V.d10;
  const D9 = V.d9;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const fm = D10.fm;

  const D = D10.DDM;
  const H = (n) => D.hist[n - 1];
  const W = D.warn;
  const C = D.change;
  const BEST = D.pminAt;
  const N0 = 30; // the lines exist from record 30
  D10.same(
    "s9: lines from record 30, best 114, rise 121, warning 128, change 138, 138 records",
    [H(N0).w2 != null, H(N0 - 1).w2 == null, BEST, D.rise, W.n, C.n, D.xs.length],
    [true, true, 114, 121, 128, 138, 138],
  );
  // from record 121 on, every other record is wrong (122, 124, ...)
  D10.same("s9: every other record wrong from 121", D.xs.slice(D.rise - 1, D.rise + 5), [0, 1, 0, 1, 0, 1]);
  D10.same(
    "s9: the warning and change crossings",
    [W.ps >= W.line, C.ps >= C.line, H(W.n - 1).ps < H(W.n - 1).w2],
    [true, true, true],
  );
  const cmp = (o) => `${fm(o.ps, 3)} ≥ ${fm(o.line, 3)}`;
  const N_CALM = 120;
  const playhead = (t) =>
    t < 5.6
      ? Math.floor(lerp(0, N_CALM, ramp(t, 0.8, 4.0, E.lin)))
      : Math.min(C.n, N_CALM + Math.floor((t - 5.6) / 0.2 + 1e-6));
  D10.same(
    "s9: playhead hits 128 at 7.2 and 138 at 9.2",
    [playhead(7.2), playhead(7.19), playhead(9.2)],
    [128, 127, 138],
  );

  V.scene({
    kicker: "DDM",
    title: ["Warning first,", "then change"],
    dur: 13,
    caps: [
      [0.4, 2, "DDM plots p + s as each record arrives."],
      [2.2, 3.8, "Warning at p min + 2 s min, change at p min + 3 s min."],
      [4, 5.4, `p min and s min: the best moment so far, record ${BEST}.`],
      [5.6, 7, `After record ${D.rise}, every other prediction is wrong.`],
      [7.2, 8.9, `Record ${W.n}: past the warning line. Store new records.`],
      [9.2, 10.8, `Record ${C.n}: past the change line. Drift detected.`],
      [11, 12.8, `Train a new model on records ${W.n} to ${C.n}.`],
    ],
    build(stage) {
      const p = D9.plot(stage, {
        x: 12,
        y: 12,
        w: 912,
        h: 616,
        xr: [0, 140],
        yr: [0, 0.3],
        xticks: [30, 60, 90, 120],
        yticks: [0, 0.1, 0.2, 0.3],
        xlab: "records",
        pad: { t: 112 },
        marks: 2,
        dots: 6,
        segs: 6,
        texts: 6,
      });
      const strip = D10.strip(p.svg, { x0: p.lx(0), x1: p.lx(140), r1: 140, y: 62, h: 36 });
      const stored = D10.span(p.svg);
      const best = D4.tag(stage, { ...p.pt(BEST, 0.07), text: `best: record ${BEST}`, tone: "green", fs: 30 });
      const tagX = p.px(W.n) - 16;
      const TAG_V = 0.27; // the warning tag's height (data units); change sits 66 px under it, the new model replaces both
      // legend (bottom left, under the curves): sample line + name for each curve
      const LEG = [
        { v: 0.085, tone: "blue", text: "p + s", dash: false },
        { v: 0.05, tone: "orange", text: "p min + 2 s min: warning", dash: true },
        { v: 0.015, tone: "red", text: "p min + 3 s min: change", dash: true },
      ];
      const warnTag = D4.tag(stage, {
        x: tagX,
        y: p.py(TAG_V),
        anchor: "r",
        text: `warning: ${cmp(W)}`,
        tone: "orange",
        solid: true,
        fs: 30,
      });
      const chTag = D4.tag(stage, {
        x: tagX,
        y: p.py(TAG_V) + 66,
        anchor: "r",
        text: `change: ${cmp(C)}`,
        tone: "red",
        solid: true,
        fs: 30,
      });
      const newTag = D4.tag(stage, {
        x: tagX,
        y: p.py(TAG_V),
        anchor: "r",
        text: `new model: records ${W.n}–${C.n}`,
        tone: "blue",
        solid: true,
        fs: 30,
      });
      // the blue arrow from the lifted bracket (y 8) to the new-model tag's right end (p.svg px = stage px − 12)
      const arrow = p.svg.appendChild(
        L5.arrow((strip.x(W.n - 1) + strip.x(C.n)) / 2, 20, tagX - 12 - 70, p.py(TAG_V) - 12 - 36, "blue", 1, {
          w: 6,
          head: 18,
        }),
      );
      const pts = (n, key) => {
        const out = [];
        for (let m = N0; m <= n; m++) out.push([m, H(m)[key]]);
        return out;
      };

      return (t) => {
        const n = playhead(t);
        const kp = ramp(t, 0.3, 0.8, E.out);
        const live = n >= N0 + 1;
        const kl = ramp(t, 2.2, 2.6, E.lin);
        const warned = n >= W.n;
        const changed = n >= C.n;
        const kw = ramp(t, 7.2, 7.6, E.out);
        const kc = ramp(t, 9.2, 9.6, E.out);
        const kn = ramp(t, 10.9, 11.6, E.out);
        const lift = -40 * kn;

        strip.set({
          xs: D.xs,
          to: n,
          groups: warned ? [{ a: W.n - 1, b: C.n, err: "red", ok: "orange", dy: 0 }] : [],
        });
        stored.set({
          x1: strip.x(W.n - 1),
          x2: strip.x(n),
          y: 48 + lift,
          h: 12 - lift,
          tone: "orange",
          w: 5,
          o: warned ? 1 : 0,
        });
        L5.drawOn(arrow, ramp(t, 11.0, 11.6, E.lin));

        p.update({
          k: kp,
          axes: kp,
          curves: live
            ? [
                { pts: pts(n, "w2"), tone: "orange", w: 5, dash: true },
                { pts: pts(n, "w3"), tone: "red", w: 5, dash: true },
                { pts: pts(n, "ps"), tone: "blue", w: 7 },
              ]
            : [],
          dots: [
            {
              at: [BEST, H(BEST).ps],
              tone: "green",
              r: 12,
              ring: true,
              o: ramp(t, 4.0, 4.4),
              s: E.pop(ramp(t, 4.0, 4.4)),
            },
            warned && { at: [W.n, W.ps], tone: "orange", r: 12, o: kw, s: E.pop(kw) * (1 + 0.3 * flash(t, 7.4, 8.0)) },
            changed && { at: [C.n, C.ps], tone: "red", r: 12, o: kc, s: E.pop(kc) * (1 + 0.3 * flash(t, 9.4, 10.0)) },
          ].filter(Boolean),
          segs: [
            ...LEG.map((l, i) => ({
              a: [4, l.v],
              b: [12, l.v],
              tone: l.tone,
              w: l.tone === "blue" ? 7 : 5,
              dash: l.dash,
              o: i ? kl : kp,
            })),
            changed && { a: [C.n, 0], b: [C.n, 0.3], tone: "red", w: 5, k: kc },
          ].filter(Boolean),
          marks: [{ x: N_CALM + 0.5, tone: "purple", dash: true, w: 4, k: ramp(t, 5.4, 5.8), o: ramp(t, 5.4, 5.6) }],
          texts: [
            ...LEG.map((l, i) => ({
              at: [14, l.v],
              text: l.text,
              tone: l.tone,
              anchor: "start",
              dy: 10,
              o: i ? kl : kp,
            })),
            { at: [119, 0.03], text: "errors rise", tone: "purple", anchor: "end", o: ramp(t, 5.4, 5.8) },
          ].filter(Boolean),
        });

        best.set({ k: ramp(t, 4.0, 4.4, E.out) });
        warnTag.set({ k: kw, o: 1 - ramp(t, 10.9, 11.2, E.lin) });
        chTag.set({ k: kc, o: 1 - ramp(t, 10.9, 11.2, E.lin) });
        newTag.set({ k: ramp(t, 11.3, 11.7, E.out) });
      };
    },
  });
})();

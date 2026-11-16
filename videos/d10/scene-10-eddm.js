/* Lecture 10 (ds-10) · scene 10 (EDDM): the gaps between errors, before and after a drift, their ratio, then the race.
   Story (local seconds):
     0.3-2.2 row 'before': 50 records draw left to right; at each error a blue arc spans the gap back to the previous error
             (or the start) and its length pops on top (9, 12, 8, 11, 10).   2.6-3.0 its tag 'mean + 2 spreads = 12.8'.
     4.2-5.4 row 'after': 19 records, short arcs (3, 2, 4, 2, 3, 2, 3).   5.6-6.0 its tag 'mean + 2 spreads = 4.1'.
     6.2-6.6 the ratio axis 0..1 with the orange 0.95 (warning) and red 0.90 (drift) lines; the blue dot pops at 1.
     6.6-7.6 the dot slides to 0.32 under the tag '4.1 ÷ 12.8 = 0.32'.   7.8 the dot and tag turn red, a red 'drift' tag pops.
     9.2-9.6 rows and ratio fade; the race appears: 'gradual drift', blue bars EDDM 108 and DDM 138 records (fill 9.6-10.4),
             10.6 a green ring and bump on the EDDM row (it fired first). Hold to 12.
   Numbers from D10.GAPS (gaps, mean + 2 spreads, ratio, 0.95 / 0.90) and D10.RACE.gradual (E 108, D 138). */
(function () {
  const V = window.VID;
  const D10 = V.d10;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const T = D4.tone;
  const fm = D10.fm;
  const f2 = (v) => v.toFixed(2); // thresholds read 0.95 / 0.90
  const f1 = (n) => n.toFixed(1);

  const G = D10.GAPS;
  const R = D10.RACE.gradual;
  const cum = (gaps) => gaps.reduce((a, g) => a.concat((a.length ? a[a.length - 1] : 0) + g), []);
  const ROWS = [
    { gaps: G.before, v: G.b.v, y: 96, t0: 0.3, t1: 2.2, tag: [640, 190], tagAt: 2.6 },
    { gaps: G.after, v: G.a.v, y: 262, t0: 4.2, t1: 5.4, tag: [640, 287], tagAt: 5.6 },
  ].map((r) => {
    const ends = cum(r.gaps);
    const n = ends[ends.length - 1];
    return { ...r, ends, n, xs: Array.from({ length: n }, (_, i) => (ends.includes(i + 1) ? 1 : 0)) };
  });
  D10.same(
    "s10: before errors at 9, 21, 29, 40, 50; after row 19 records",
    [ROWS[0].ends, ROWS[1].n],
    [[9, 21, 29, 40, 50], 19],
  );
  const V1 = fm(G.b.v, 1);
  const V2 = fm(G.a.v, 1);
  const RAT = fm(G.ratio);
  D10.same(
    "s10: 12.8, 4.1, ratio 0.32 (< 0.90 < 0.95)",
    [V1, V2, RAT, G.ratio < G.drift, G.drift < G.warn],
    ["12.8", "4.1", "0.32", true, true],
  );
  D10.same(
    "s10: race EDDM 108, DDM 138 (both < 300 on the bar scale)",
    [R.E, R.D, R.E < R.D && R.D < 300],
    [108, 138, true],
  );
  const PX = 15; // px per record
  const X0 = 60;
  const AX = { x0: 120, x1: 840, y: 530 };
  const ax = (v) => AX.x0 + (AX.x1 - AX.x0) * v;

  V.scene({
    kicker: "EDDM",
    title: ["Watch the gaps", "between errors"],
    dur: 12,
    caps: [
      [0.4, 2.4, `EDDM measures the gaps between errors: ${G.before.join(", ")}.`],
      [2.6, 4.2, `Mean gap plus 2 spreads: ${V1}, the best so far.`],
      [4.4, 6, `After a drift the gaps shrink: ${G.after.join(", ")}.`],
      [6.2, 7.8, `${V2} against the best ${V1}: a ratio of ${RAT}.`],
      [8, 9.4, `Below ${f2(G.warn)} is a warning, below ${f2(G.drift)} a drift.`],
      [9.6, 11.8, `Gradual drift: EDDM caught it after ${R.E} records, DDM ${R.D}.`],
    ],
    build(stage) {
      const B = T("blue");
      const svg = D4.svg(stage);
      const rowsG = svg.appendChild(V.s("g", {}));

      // ---------- the two record rows ----------
      const rows = ROWS.map((r, ri) => {
        const strip = D10.strip(rowsG, { x0: X0, x1: X0 + r.n * PX, r0: 0, r1: r.n, y: r.y, h: 50 });
        const xe = (c) => X0 + c * PX; // right edge of record c (1-based)
        const arcs = r.ends.map((c, j) => {
          const a = xe(j ? r.ends[j - 1] : 0);
          const b = xe(c);
          const path = rowsG.appendChild(
            V.s("path", {
              d: `M${f1(a)} ${r.y}Q${f1((a + b) / 2)} ${r.y - 68} ${f1(b)} ${r.y}`,
              fill: "none",
              stroke: B.c,
              "stroke-width": 5,
              "stroke-linecap": "round",
              pathLength: 1,
              "stroke-dasharray": "1 1",
            }),
          );
          const lab = D4.label(stage, { x: (a + b) / 2, y: r.y - 52, text: `${r.gaps[j]}`, tone: "blue", fs: 28 });
          return { path, lab, c };
        });
        const name = D4.label(stage, {
          x: xe(r.n) + 16,
          y: r.y + 25,
          text: ri ? "after" : "before",
          tone: "grey",
          fs: 30,
          anchor: "l",
        });
        const stat = D4.tag(stage, {
          x: r.tag[0],
          y: r.tag[1],
          text: `mean + 2 spreads = ${ri ? V2 : V1}`,
          tone: "blue",
          fs: 30,
        });
        return { ...r, strip, arcs, name, stat };
      });

      // ---------- the ratio axis ----------
      const axisG = svg.appendChild(V.s("g", {}));
      const line = (x1, y1, x2, y2, tone, w, dash) =>
        axisG.appendChild(
          V.s("line", {
            x1: f1(x1),
            y1: f1(y1),
            x2: f1(x2),
            y2: f1(y2),
            stroke: T(tone).c,
            "stroke-width": w,
            "stroke-linecap": "round",
            "stroke-dasharray": dash ? "10 8" : "none",
          }),
        );
      line(AX.x0, AX.y, AX.x1, AX.y, "grey", 5);
      [0, 0.5, 1].forEach((v) => line(ax(v), AX.y - 10, ax(v), AX.y + 10, "grey", 4));
      line(ax(G.warn), AX.y - 42, ax(G.warn), AX.y + 36, "orange", 4, true);
      line(ax(G.drift), AX.y - 42, ax(G.drift), AX.y + 36, "red", 4, true);
      const axLabs = [
        ...[0, 0.5, 1].map((v) => D4.label(stage, { x: ax(v), y: 592, text: fm(v), tone: "grey", fs: 28 })),
        D4.label(stage, { x: ax(G.warn) + 6, y: AX.y - 64, text: f2(G.warn), tone: "orange", fs: 28, anchor: "l" }),
        D4.label(stage, { x: ax(G.drift) - 6, y: AX.y - 64, text: f2(G.drift), tone: "red", fs: 28, anchor: "r" }),
      ];
      const dot = svg.appendChild(V.s("circle", { cy: AX.y, r: 16, "stroke-width": 4 }));
      const ratioTag = D4.tag(stage, { text: `${V2} ÷ ${V1} = ${RAT}`, tone: "blue", fs: 30 });
      const driftTag = D4.tag(stage, { x: 300, y: 592, text: "drift", tone: "red", solid: true, fs: 30 });

      // ---------- the race ----------
      const raceHead = D4.label(stage, { x: 60, y: 150, text: "gradual drift", tone: "purple", fs: 30, anchor: "l" });
      const raceNote = D4.label(stage, {
        x: 468,
        y: 420,
        text: "records each detector needed after the drift began",
        tone: "grey",
        fs: 28,
      });
      const BAR = { x: 200, w: 600, h: 48, max: 300 };
      const ring = svg.appendChild(
        V.s("rect", {
          x: 72,
          y: 206,
          width: 0,
          height: 76,
          rx: 22,
          fill: "none",
          stroke: T("green").c,
          "stroke-width": 5,
        }),
      );
      const race = [
        ["EDDM", R.E, 220],
        ["DDM", R.D, 310],
      ].map(([name, rec, y]) => {
        const bar = D4.bar(stage, { x: BAR.x, y, w: BAR.w, h: BAR.h, tone: "blue" });
        const lab = D4.label(stage, { x: 186, y: y + BAR.h / 2, text: name, tone: "grey", fs: 30, anchor: "r" });
        const end = BAR.x + 3 + (rec / BAR.max) * (BAR.w - 6);
        const val = D4.label(stage, {
          x: end + 14,
          y: y + BAR.h / 2,
          text: `${rec} records`,
          tone: "blue",
          fs: 30,
          anchor: "l",
        });
        return { bar, lab, val, rec, end };
      });
      ring.setAttribute("width", f1(BAR.x + BAR.w + 84 - 72));
      const tick = svg.appendChild(L5.tick(BAR.x + BAR.w + 44, 244, 48, "green", { w: 8 }));

      return (t) => {
        const out = 1 - ramp(t, 9.2, 9.6, E.lin); // rows and ratio fade out for the race
        V.show(rowsG, out);
        rows.forEach((r) => {
          const shown = Math.floor(lerp(0, r.n, ramp(t, r.t0, r.t1, E.lin)));
          const tc = (c) => lerp(r.t0, r.t1, c / r.n); // the moment the strip reaches record c
          r.strip.set({ xs: r.xs, to: shown });
          r.arcs.forEach(({ path, lab, c }) => {
            const k = ramp(t, tc(c), tc(c) + 0.25, E.lin);
            path.style.strokeDashoffset = f1(1 - k);
            path.style.visibility = k > 0 ? "" : "hidden";
            lab.set({ k: ramp(t, tc(c) + 0.1, tc(c) + 0.35, E.out), o: out });
          });
          r.name.set({ k: ramp(t, r.t0, r.t0 + 0.4, E.out), o: out });
          r.stat.set({ k: ramp(t, r.tagAt, r.tagAt + 0.4, E.out), o: out });
        });

        const ka = ramp(t, 6.2, 6.6, E.out);
        V.show(axisG, ka * out);
        axLabs.forEach((l) => l.set({ k: ka, o: out }));
        const slide = ramp(t, 6.6, 7.6, E.inOut);
        const v = lerp(1, G.ratio, slide);
        const red = t >= 7.8;
        const tone = T(red ? "red" : "blue");
        dot.setAttribute("cx", f1(ax(v)));
        dot.setAttribute("fill", tone.c);
        dot.setAttribute("stroke", tone.lip);
        const bump = flash(t, 7.8, 8.3);
        V.place(dot, { s: (0.5 + 0.5 * E.pop(ka)) * (1 + 0.3 * bump), o: ka * out });
        const tx = clamp(ax(v), 160, 924 - 150);
        ratioTag.set({
          x: tx,
          y: 400,
          k: ramp(t, 6.6, 7.0, E.out),
          o: out,
          tone: red ? "red" : "blue",
          solid: red,
        });
        driftTag.set({ k: ramp(t, 7.8, 8.2, E.out), o: out });

        const kr = ramp(t, 9.4, 9.8, E.out);
        raceHead.set({ k: kr });
        raceNote.set({ k: ramp(t, 9.6, 10.0, E.out) });
        const fill = ramp(t, 9.6, 10.4, E.out);
        const win = flash(t, 10.6, 11.2);
        race.forEach((r, i) => {
          r.bar.set({ k: (fill * r.rec) / BAR.max, o: kr });
          V.place(r.bar.el, { s: i ? 1 : 1 + 0.04 * win, o: kr });
          r.lab.set({ k: kr });
          r.val.set({ k: ramp(t, 9.6, 9.9, E.out), x: lerp(BAR.x + 3, r.end, fill) - r.end });
        });
        const kg = ramp(t, 10.6, 10.9, E.out);
        V.place(ring, { s: 0.96 + 0.04 * kg, o: kg });
        V.place(tick, { s: 0.5 + 0.5 * E.pop(kg), o: kg });
      };
    },
  });
})();

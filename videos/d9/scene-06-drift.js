/* Lecture 9 (ds-9) · scene 6 (CONCEPT DRIFT): data is not static. A model trained once and deployed keeps assuming the world it
   learned; when the link between input and output changes (concept drift) it is wrong on every trip until it is updated (lesson
   9.2 step 1, the roadworks stream of lesson 9.3). Courier records (km, minutes) as purple dots; the blue model line learned 4
   minutes per km and the green dashed truth line agrees with it; then roadworks turn the truth to 6 per km, new records land on
   the steeper line, and the frozen model is 8 minutes off at 4 km. Every record and number comes from D9.DRIFT (asserted on
   load). Colours: purple = records, blue = the model, green dashed = the real minutes per km, red = roadworks, the gap, drift.
   Story (local seconds): 0.2 plot; 0.6 old records; 1.2 model line; 1.8 truth line; 2.9 roadworks; 3.2 the truth rotates to 6;
   4.4 new records; 5.8 the 8-minute gap at 4 km; 7.2 "concept drift". */
(function () {
  const V = window.VID;
  const D9 = V.d9;
  const D4 = V.d4;
  const { ramp, flash, lerp, ease: E } = V;
  const DR = D9.DRIFT;
  const fm = D9.fm;
  const X4 = 4; // the gap is shown at 4 km

  D9.same(
    "drift scene: the model says 4 per km, the road now takes 6; at 4 km that is 16 against 24, 8 minutes off",
    [DR.model, DR.real, DR.model * X4, DR.real * X4, DR.gapAt4],
    [4, 6, 16, 24, 8],
  );
  const T = { plot: 0.2, old: 0.6, model: 1.2, truth: 1.8, road: 2.9, turn: 3.2, turnEnd: 4.4, now: 4.4, gap: 5.8 };
  T.drift = 7.2;
  const PX = 787;

  /** a roadworks barrier centred at (x, y), w wide: a red board with panel-coloured stripes on two grey legs */
  function roadBarrier(x, y, w) {
    const red = D4.tone("red");
    const grey = D4.tone("grey");
    const h = w * 0.28;
    const g = V.s("g", {});
    [-0.32, 0.32].forEach((f) =>
      g.append(
        V.s("rect", {
          x: x + f * w - 6,
          y: y - h / 2,
          width: 12,
          height: h * 1.9,
          rx: 5,
          fill: grey.c,
          stroke: grey.lip,
        }),
      ),
    );
    const clip = `d9road${Math.round(x)}`;
    g.append(V.s("clipPath", { id: clip }, V.s("rect", { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 10 })));
    g.append(V.s("rect", { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 10, fill: red.c }));
    const stripes = V.s("g", { "clip-path": `url(#${clip})` });
    for (let i = -1; i < 6; i++) {
      const sx = x - w / 2 + i * (w / 5);
      stripes.append(
        V.s("path", {
          d: `M${sx} ${y + h / 2}L${sx + h} ${y - h / 2}L${sx + h + w / 10} ${y - h / 2}L${sx + w / 10} ${y + h / 2}Z`,
          fill: "var(--panel)",
        }),
      );
    }
    g.append(stripes);
    g.append(
      V.s("rect", {
        x: x - w / 2,
        y: y - h / 2,
        width: w,
        height: h,
        rx: 10,
        fill: "none",
        stroke: red.lip,
        "stroke-width": 4,
      }),
    );
    return g;
  }

  V.scene({
    kicker: "CONCEPT DRIFT",
    title: ["The world changes,", "the model does not"],
    dur: 9,
    caps: [
      [1.6, 3, `The model learned ${fm(DR.model)} minutes per km.`],
      [3.2, 5.2, `Then roadworks: each km now takes about ${fm(DR.real)}.`],
      [5.9, 7.2, `The model still says ${fm(DR.model)}: ${fm(DR.gapAt4)} minutes off at ${X4} km.`],
      [7.4, 8.8, "The world changed, not the model: concept drift."],
    ],
    build(stage) {
      const p = D9.plot(stage, {
        x: 12,
        y: 12,
        w: 620,
        h: 616,
        xr: [0, 4.5],
        yr: [0, 28],
        xticks: [1, 2, 3, 4],
        yticks: [0, 8, 16, 24],
        xlab: "km",
        ylab: "minutes",
        dots: 20,
      });
      const mTag = D4.tag(stage, { x: PX, y: 70, text: `model: ${fm(DR.model)} per km`, tone: "blue", solid: true });
      const rTag = D4.tag(stage, { x: PX, y: 160, text: "", tone: "green" });
      const road = D4.tag(stage, { x: PX, y: 280, text: "roadworks", tone: "red" });
      // right of the tag just left of the gap, above the green line at the top of the gap (the plot is empty there)
      const gapPt = p.pt(X4, DR.real * X4);
      const gapTag = D4.tag(stage, {
        x: gapPt.x - 30,
        y: gapPt.y - 20,
        anchor: "r",
        text: `${fm(DR.gapAt4)} min off`,
        tone: "red",
        solid: true,
      });
      const drift = D4.tag(stage, { x: PX, y: 500, text: "concept drift", tone: "red", solid: true, fs: 32 });
      // a roadworks barrier (striped board on two legs) under the roadworks tag
      const svg = D4.svg(stage);
      const barrier = svg.appendChild(roadBarrier(PX, 372, 150));
      // the 8-minute gap is drawn in the plot's own svg, on top of the record dots
      const gapLine = p.svg.appendChild(
        V.s("line", { stroke: D4.tone("red").c, "stroke-width": 8, "stroke-linecap": "round" }),
      );

      return (t) => {
        const turn = E.inOut(ramp(t, T.turn, T.turnEnd, E.lin));
        const real = lerp(DR.model, DR.real, turn);
        const oldO = 1 - 0.65 * ramp(t, T.road, T.road + 0.3, E.lin);
        const dots = [
          ...DR.old.map((d, i) => {
            const k = D9.seq(t, T.old, 0.1, 0.35, i);
            return { at: [d.x, d.y], r: 11, s: E.pop(k), o: Math.min(1, k * 3) * oldO };
          }),
          ...DR.now.map((d, i) => {
            const k = D9.seq(t, T.now, 0.12, 0.35, i);
            return { at: [d.x, d.y], r: 11, s: E.pop(k), o: Math.min(1, k * 3) };
          }),
        ];
        const gk = ramp(t, T.gap, T.gap + 0.5, E.inOut);
        const pulse = flash(t, T.gap + 0.1, T.gap + 0.6);
        p.update({
          k: ramp(t, T.plot, T.plot + 0.5, E.lin),
          axes: ramp(t, T.plot, T.plot + 0.5, E.lin),
          curves: [
            { fn: (x) => DR.model * x, tone: "blue", w: 7 + 5 * pulse, k: ramp(t, T.model, T.model + 0.6, E.inOut) },
            { fn: (x) => real * x, tone: "green", w: 5, dash: true, o: ramp(t, T.truth, T.truth + 0.4, E.lin) },
          ],
          dots,
        });
        const y0 = p.ly(DR.model * X4);
        const y1 = lerp(y0, p.ly(real * X4), gk);
        [
          ["x1", p.lx(X4)],
          ["x2", p.lx(X4)],
          ["y1", y0],
          ["y2", y1],
        ].forEach(([a, v]) => gapLine.setAttribute(a, v.toFixed(1)));
        V.show(gapLine, gk > 0.01 ? 1 : 0);
        mTag.set({ k: ramp(t, T.model + 0.2, T.model + 0.6, E.lin), s: 1 + 0.1 * pulse });
        rTag.set({ text: `real: ${fm(real, 1)} per km`, k: ramp(t, T.truth + 0.1, T.truth + 0.5, E.lin) });
        const rk = ramp(t, T.road, T.road + 0.4, E.lin);
        road.set({ k: rk });
        V.place(barrier, { s: 0.6 + 0.4 * E.pop(rk), o: Math.min(1, rk * 3) });
        gapTag.set({ k: ramp(t, T.gap + 0.3, T.gap + 0.6, E.lin) });
        drift.set({ k: ramp(t, T.drift, T.drift + 0.3, E.lin) });
      };
    },
  });
})();

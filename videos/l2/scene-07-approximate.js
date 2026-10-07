/* Lecture 2 · scene 07-approximate: a quick method (nearest neighbour) against a slow better one (an EA) on a 25-city
   tour. Two tour panels above, a quality-versus-time chart below. Everything is computed by L2.tspRace(16). */
(function () {
  const V = window.VID;
  const L2 = V.l2;
  const L5 = V.l5;
  const L6 = V.l6;
  const { ramp, flash, ease: E } = V;

  const race = L2.tspRace(16);
  const EV = 4000;
  const T0 = 2.6; // the EA starts
  const T1 = 10; // and ends
  const tCross = T0 + ((T1 - T0) * (race.crossAt - 30)) / (EV - 30);
  const PANEL = { y: 0, w: 440, h: 316 };
  const CHART = { x: 12, y: 410, w: 912, h: 222 };
  const YMIN = -9.4;
  const YMAX = -1.6;
  const pct = Math.round(race.shorter * 100);

  V.scene({
    kicker: "APPROXIMATE",
    title: ["A quick method,", "or a slow better one"],
    dur: 13,
    caps: [
      [0.4, 2.4, "Nearest neighbour: an instant, decent tour."],
      [2.8, 4.2, "The EA starts from random tangles."],
      [4.4, 6.0, "It keeps improving its best tour."],
      [6.2, 9.8, "Given time, it overtakes the quick method."],
      [10.2, 12.6, "Approximate: good answers, no guarantee."],
    ],
    build(stage) {
      const nn = L2.tourPanel(stage, {
        ...PANEL,
        x: 12,
        cities: race.cities,
        tag: "Nearest neighbour",
        tone: "orange",
      });
      const ea = L2.tourPanel(stage, {
        ...PANEL,
        x: 484,
        cities: race.cities,
        tag: "Evolutionary algorithm",
        tone: "green",
      });
      if (!ea.fits) throw new Error("scene 7: the EA panel tags do not fit");
      const pl = L6.plot(stage, { ...CHART, xmin: 0, xmax: EV, ymin: YMIN, ymax: YMAX });
      const nnLine = pl.curve(() => -race.nnLen, "orange", 1, { dash: true, w: 6 });
      const eaCurve = pl.curve((x) => (x < 30 ? NaN : -race.bestAt(x)), "green", 1, { w: 7 });
      const over = L5.svg(stage);
      const mk = (tn, r) => {
        const c = V.s("circle", { r, "stroke-width": 3 });
        c.setAttribute("class", `c-${tn}`);
        c.style.fill = "var(--c)";
        c.style.stroke = "var(--c-lip)";
        return c;
      };
      const front = mk("green", 11);
      const ring = V.s("circle", { r: 20, fill: "none", "stroke-width": 6 });
      ring.setAttribute("class", "c-green");
      ring.style.stroke = "var(--c)";
      const upArrow = L5.arrow(CHART.x + 34, CHART.y + 150, CHART.x + 34, CHART.y + 100, "grey", 1, { w: 6, head: 18 });
      over.append(front, ring, upArrow);
      const nnY = pl.toPx(0, -race.nnLen)[1];
      const xc = pl.toPx(race.crossAt, -race.nnLen);
      const better = L2.tag(stage, {
        text: "shorter tour",
        tone: "grey",
        x: CHART.x + 62,
        y: CHART.y + 8,
        pad: "6px 14px 7px",
      });
      const time = L2.tag(stage, {
        text: "time",
        tone: "grey",
        x: CHART.x + CHART.w - 18,
        y: CHART.y + CHART.h - 14,
        anchor: "br",
      });
      const instant = L2.tag(stage, {
        text: "instant",
        tone: "orange",
        x: CHART.x + 410,
        y: nnY - 10,
        anchor: "bc",
      });
      const ahead = L2.tag(stage, {
        text: "EA ahead",
        tone: "green",
        solid: true,
        x: xc[0] + 24,
        y: nnY + 34,
        anchor: "tl",
      });
      const short = L2.tag(stage, {
        text: `${pct}% shorter`,
        tone: "green",
        solid: true,
        x: 484 + PANEL.w / 2,
        y: 366,
        anchor: "c",
      });
      const noGuarantee = L2.tag(stage, {
        text: "good, no guarantee",
        tone: "orange",
        x: 12 + PANEL.w / 2,
        y: 366,
        anchor: "c",
      });
      // the crossing marker: a dashed line down to the time axis
      const axisY = pl.toPx(0, YMIN)[1];
      const crossLine = V.h("div", {
        style: {
          position: "absolute",
          left: `${xc[0] - 2}px`,
          top: `${xc[1]}px`,
          width: "0",
          height: `${axisY - xc[1]}px`,
          borderLeft: `4px dashed ${L5.tone("green").c}`,
          boxSizing: "border-box",
        },
      });
      stage.append(crossLine);

      return (t) => {
        // panels, nearest neighbour
        const pIn = ramp(t, 0.2, 0.5);
        nn.update({
          tour: race.nn,
          draw: ramp(t, 0.8, 2.4, E.lin),
          dots: ramp(t, 0.2, 0.8, E.lin),
          o: pIn,
          len: t >= 2.4 ? race.nnLen : undefined,
          flash: flash(t, 2.4, 2.8),
        });
        // the EA
        const e = L2.raceEval(t, T0, T1);
        const started = t >= T0;
        const best = race.bestAt(e);
        const ahead1 = e >= race.crossAt;
        ea.update({
          tour: started ? race.tourAt(e) : undefined,
          dots: ramp(t, 0.2, 0.8, E.lin),
          o: pIn,
          len: started ? best : undefined,
          lenTone: ahead1 ? "green" : "red",
          flash: flash(t, tCross, tCross + 0.5),
        });
        // chart
        V.place(pl.svg, { s: 0.96 + 0.04 * E.pop(ramp(t, 0.2, 0.6, E.lin)), o: ramp(t, 0.2, 0.5) });
        nnLine.set({ k: ramp(t, 2.0, 2.8, E.lin) });
        eaCurve.set({ k: started ? e / EV : 0 });
        const [fx, fy] = pl.toPx(e, -best);
        front.setAttribute("cx", fx.toFixed(1));
        front.setAttribute("cy", fy.toFixed(1));
        V.place(front, { s: 0.3 + 0.7 * E.pop(ramp(t, T0, T0 + 0.3, E.lin)), o: started ? 1 : 0 });
        ring.setAttribute("cx", xc[0].toFixed(1));
        ring.setAttribute("cy", xc[1].toFixed(1));
        const rk = ramp(t, tCross, tCross + 0.7, E.lin);
        V.place(ring, { s: 0.5 + 1.1 * E.out(rk), o: t >= tCross ? 1 - rk : 0 });
        V.show(upArrow, ramp(t, 0.5, 0.9));
        better.set({ o: ramp(t, 0.5, 0.9), s: 0.8 + 0.2 * E.pop(ramp(t, 0.5, 0.9, E.lin)) });
        time.set({ o: ramp(t, 0.5, 0.9), s: 0.8 + 0.2 * E.pop(ramp(t, 0.5, 0.9, E.lin)) });
        const kI = ramp(t, 2.6, 3.0, E.lin);
        instant.set({ o: kI, s: 0.8 + 0.2 * E.pop(kI), y: (1 - E.out(kI)) * 8 });
        const kA = ramp(t, tCross, tCross + 0.4, E.lin);
        ahead.set({ o: kA, s: 0.7 + 0.3 * E.pop(kA) });
        V.show(crossLine, ramp(t, tCross, tCross + 0.4, E.lin));
        const kN = ramp(t, 10.9, 11.4, E.lin);
        noGuarantee.set({ o: kN, s: 0.7 + 0.3 * E.pop(kN) });
        const kS = ramp(t, 10.2, 10.8, E.lin);
        short.set({ o: kS, s: 0.7 + 0.3 * E.pop(kS) });
      };
    },
  });
})();

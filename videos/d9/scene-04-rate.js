/* Lecture 9 (ds-9) · scene 4 (LEARNING RATE): the learning rate sets the step size (lesson 9.1 step 4). Same bowl (w − 4)²,
   same start w = 10, six steps each, three rates side by side: 0.1 creeps (still far from 4 after six steps), 0.75 jumps past
   the bottom but zigzags in, 1.1 lands further out each time and diverges (its third jump leaves the chart). Every weight comes
   from D9.RATES (the runs are made once on load; this scene only reads them). Colours: blue = the balls and their landings,
   orange = the rate and the step path, red = the diverging run, green = the best spot and 'zigzags in', grey = the bowl.
   Story (local seconds): 0.3 three plots; 1.0 rate tags; 1.5 balls at w = 10; 2.2 'step = rate × slope'; six steps from 2.6
   every 0.85 s; 4.3 the 1.1 run flies off, turns red, 4.6 'diverges'; 6.7 'zigzags in'; 8.5 'slow'. Hold to 11. */
(function () {
  const V = window.VID;
  const D9 = V.d9;
  const D4 = V.d4;
  const { ramp, flash, lerp, ease: E } = V;
  const R = D9.RATES;
  const fm = D9.fm;
  const STEP0 = 2.6;
  const GAP = 0.85;
  const FLY = 0.55;
  const tj = (j) => STEP0 + GAP * (j - 1); // step j = 1..6 starts here
  const OFF = R.runs[2].shown; // the diverging run's step that leaves the chart (3)
  const VERDICT = [8.5, 6.7, 4.6];
  const TONE = ["grey", "green", "red"];
  D9.same(
    "rate scene: three runs of six steps, the third leaves the chart on step 3",
    [R.runs.map((r) => r.ws.length), OFF, tj(OFF)],
    [[7, 7, 7], 3, 4.3],
  );

  V.scene({
    kicker: "LEARNING RATE",
    title: ["The learning rate", "sets the step size"],
    dur: 11,
    caps: [
      [0.4, 2, "Same bowl, same start, three learning rates."],
      [2.2, 4.2, "Each step is learning rate × slope."],
      [4.6, 6.4, `${fm(R.runs[2].eta)} is too big: each jump lands further out. It diverges.`],
      [6.6, 8.4, `${fm(R.runs[1].eta)} jumps past the bottom but still settles.`],
      [8.6, 10.7, `${fm(R.runs[0].eta)} is safe but slow: it creeps down.`],
    ],
    build(stage) {
      const plots = R.runs.map((_, i) =>
        D9.plot(stage, {
          x: 12 + 308 * i,
          y: 146,
          w: 296,
          h: 404,
          xr: R.view.x,
          yr: R.view.y,
          xticks: [4],
          pad: { l: 18, r: 14, t: 14, b: 50 },
          dots: 10,
        }),
      );
      // the weight read-out: SVG text with a panel-coloured halo so it stays legible over the guide and the paths
      const reads = plots.map((p) =>
        p.svg.appendChild(
          V.s("text", {
            x: p.lx(4),
            y: p.ly(86),
            "text-anchor": "middle",
            "paint-order": "stroke",
            style: {
              font: "900 28px var(--sans)",
              stroke: "var(--panel)",
              strokeWidth: "10px",
              strokeLinejoin: "round",
            },
          }),
        ),
      );
      const balls = plots.map((p) => p.svg.appendChild(V.s("circle", { r: 15, "stroke-width": 3 })));
      const rates = R.runs.map((r, i) =>
        D4.tag(stage, { x: 160 + 308 * i, y: 112, text: `rate ${fm(r.eta)}`, tone: "orange", fs: 30 }),
      );
      const rule = D4.tag(stage, { x: 468, y: 44, text: "step = rate × slope", tone: "orange", fs: 30 });
      const verdicts = R.runs.map((r, i) =>
        D4.tag(stage, { x: 160 + 308 * i, y: 594, text: r.tag, tone: TONE[i], solid: i === 2 }),
      );

      return (t) => {
        R.runs.forEach((run, i) => {
          const p = plots[i];
          const div = i === 2;
          const last = div ? OFF : 6; // the last step this run takes
          const red = div && t >= 4.5;
          // where the ball is: flying on step j, or resting after the last finished one
          let at = [run.ws[0], D9.cost1(run.ws[0])];
          let arc = 0;
          const segs = [];
          const dots = [{ at: [4, 0], tone: "green", r: 9 }];
          for (let j = 1; j <= last; j++) {
            const k = ramp(t, tj(j), tj(j) + FLY, E.lin);
            if (k <= 0) break;
            const a = [run.ws[j - 1], D9.cost1(run.ws[j - 1])];
            const b = [run.ws[j], D9.cost1(run.ws[j])];
            const e = E.inOut(k);
            segs.push({ a, b, k: e, w: 4, tone: red ? "red" : "orange" });
            at = [lerp(a[0], b[0], e), lerp(a[1], b[1], e)];
            arc = Math.sin(Math.PI * k);
            if (k >= 1) dots.push({ at: b, tone: "blue", r: 6, hollow: true });
          }
          // a live read-out of the weight after the last landing
          const landed = Array.from({ length: last }, (_, j) => j + 1).filter((j) => t >= tj(j) + FLY).length;
          const rd = reads[i];
          const txt = `w = ${fm(run.ws[landed])}`;
          if (rd.textContent !== txt) rd.textContent = txt;
          rd.style.fill = D4.tone(red ? "red" : "blue").ink;
          V.show(rd, ramp(t, 1.6, 1.9, E.lin));
          p.update({
            k: ramp(t, 0.3 + 0.15 * i, 0.8 + 0.15 * i, E.lin),
            axes: ramp(t, 0.4 + 0.15 * i, 0.9 + 0.15 * i, E.lin),
            curves: [{ fn: D9.cost1, tone: "grey", w: 5 }],
            marks: [{ x: 4, tone: "green", k: ramp(t, 0.6, 1.0, E.out) }],
            segs,
            dots,
          });
          // the ball (drawn by hand so the diverging one can leave the chart before it fades)
          const kb = ramp(t, 1.5, 1.8, E.lin);
          const gone = div ? 1 - ramp(t, 4.55, 4.85, E.lin) : 1;
          const tone = D4.tone(div && t >= 4.45 ? "red" : "blue");
          const b = balls[i];
          b.setAttribute("cx", p.lx(at[0]).toFixed(1));
          b.setAttribute("cy", (p.ly(at[1]) - 14 * arc).toFixed(1));
          b.setAttribute("r", (15 * (0.5 + 0.5 * E.pop(kb))).toFixed(1));
          b.setAttribute("fill", tone.c);
          b.setAttribute("stroke", tone.lip);
          V.show(b, Math.min(1, kb * 3) * gone);

          rates[i].set({ k: ramp(t, 1.0 + 0.15 * i, 1.4 + 0.15 * i, E.lin) });
          const v = VERDICT[i];
          verdicts[i].set({ k: ramp(t, v, v + 0.4, E.lin), s: 1 + 0.08 * flash(t, v + 0.3, v + 0.6) });
        });
        rule.set({ k: ramp(t, 2.2, 2.6, E.lin) });
      };
    },
  });
})();

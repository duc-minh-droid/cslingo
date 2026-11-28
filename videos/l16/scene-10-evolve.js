/* Lecture 16 video, scene 10-evolve: lesson 16.5's EA on the 10-hidden-neuron network (L16.GA: the lesson demo, seed 1,
   population 12, tournament of two, uniform crossover, Gaussian mutation of one weight, best kept). Best of generation 0:
   MAE 0.407, NSE -1.95; generation 10: 0.157 / 0.59; generation 20: 0.072 / 0.92; generation 50: 0.023 / 0.99 (asserted).
   Nash-Sutcliffe: 1 is perfect, guessing the average scores 0, no lower limit.
   Layout (stage px): L16.plot x 12, y 12, 600 x 616 (real flow dashed grey, best guess blue). Right panel x 636..924: stats
   "generation" (y 12, blue), "MAE" (y 100, orange), "NSE" (y 188, grey, green from 0.9); label "best genome" (y 268) and ten
   weight bars (x 652 + 27 i, 20 wide, zero line y 410, 100 px per unit; negative red); 3.2: the mutated bar (L16.MUT) flashes
   orange and nudges, SVG plus and epsilon above it, cards "small Gaussian noise" (orange, y 452) and "crossover mixes two
   parents" (purple, y 540); 8.8: sparkline card (y 452..620) of the best MAE by generation, drawn up to the current one;
   11.0: the weight bars give way to a darts card (y 276..440): a target and "best: 1", "the average: 0", "no lower limit".
   Story (local seconds): 0.4 plot, real flow, generation 0 guess and stats; 3.2..5.8 mutation close-up (nudge 3.6..4.2),
   crossover card 4.4; 6.0..8.6 generations 0..20; 8.8..10.4 generations 20..50, sparkline; 11.0 darts card; hold to 14. */
VID.scene({
  kicker: "EVOLVING THE WEIGHTS",
  title: ["Mutate, keep the best,", "watch the error fall"],
  dur: 14,
  caps: [
    [0.4, 3.0, "Fitness is the mean absolute error, MAE. Start: 0.407."],
    [3.2, 5.8, "Mutation adds small Gaussian noise to one weight."],
    [6.0, 8.6, "Generation 20: MAE 0.072, Nash-Sutcliffe 0.92."],
    [8.8, 10.8, "Generation 50: NSE 0.99. Fast at first, then slow."],
    [11.0, 13.7, "NSE: best 1, guessing the average scores 0, no lower limit."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L16 = V.l16;
    const { ramp, lerp, ease: E } = V;
    const T = (n) => L13.tone(n);
    const GA = L16.GA;
    const f3 = (v) => v.toFixed(3),
      f2 = (v) => v.toFixed(2).replace("-", "−");
    L16.same(
      [f3(GA[0].mae), f3(GA[20].mae), f2(GA[20].nse), f2(GA[50].nse)],
      ["0.407", "0.072", "0.92", "0.99"],
      "scene 10",
    );
    const genAt = (t) =>
      t < 6.0
        ? 0
        : t < 8.8
          ? Math.min(20, Math.floor(20 * ramp(t, 6.0, 8.6, E.lin)))
          : 20 + Math.floor(30 * ramp(t, 8.8, 10.4, E.lin));

    const pl = L16.plot(stage, { lines: 2 });
    const sGen = L13.stat(stage, { x: 636, y: 12, w: 288, h: 76, label: "generation", tone: "blue" });
    const sMae = L13.stat(stage, { x: 636, y: 100, w: 288, h: 76, label: "MAE", tone: "orange" });
    const sNse = L13.stat(stage, { x: 636, y: 188, w: 288, h: 76, label: "NSE", tone: "grey" });
    const wLab = L13.label(stage, { x: 636, y: 268, w: 288, text: "best genome" });
    const svg = V.l5.svg(stage, 936, 640);
    const ZERO = 410,
      SC = 100;
    const bx = (i) => 652 + 27 * i;
    const zero = svg.appendChild(V.s("path", { d: `M644 ${ZERO} H916`, "stroke-width": 3 }));
    zero.style.stroke = "var(--text-dim)";
    const bars = GA[0].w.map(() => svg.appendChild(V.s("rect", { width: 20, rx: 4 })));
    const mutG = svg.appendChild(V.s("g", {}));
    const MX = bx(L16.MUT.i) + 10;
    mutG.appendChild(L13.mark("plus", MX - 16, 318, 24, "orange"));
    L16.eps(mutG, MX + 14, 318, 26, "orange");
    const cMut = L16.card(stage, { x: 636, y: 452, w: 288, h: 76, text: "small Gaussian\nnoise", tone: "orange" });
    const cX = L16.card(stage, { x: 636, y: 540, w: 288, h: 76, text: "crossover mixes\ntwo parents", tone: "purple" });

    // sparkline of the best MAE by generation
    const spark = L16.card(stage, { x: 636, y: 452, w: 288, h: 164, text: "", tone: "orange" });
    const sLab = L13.label(stage, { x: 636, y: 460, w: 288, text: "error by generation", tone: "orange" });
    const top = V.l5.svg(stage, 936, 640);
    const sp = top.appendChild(
      V.s("polyline", { fill: "none", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }),
    );
    sp.style.stroke = T("orange").c;
    const SP = GA.map((s, g) => [660 + (g / 50) * 240, 600 - (s.mae / GA[0].mae) * 90]);

    // darts card
    const darts = L16.card(stage, { x: 636, y: 276, w: 288, h: 164, text: "", tone: "green" });
    const dG = V.l5.svg(stage, 936, 640).appendChild(V.s("g", {}));
    [24, 15, 6].forEach((r, i) => {
      const c = dG.appendChild(V.s("circle", { cx: 892, cy: 306, r, "stroke-width": 3 }));
      c.style.fill = i === 2 ? T("green").c : "var(--panel)";
      c.style.stroke = T("green").c;
    });
    const dLines = ["best: 1", "the average: 0", "no lower limit"].map((text, i) =>
      L16.text(dG, { x: 656, y: 314 + 44 * i, text, anchor: "start", tone: i ? "grey" : "green", weight: 900 }),
    );

    return (t) => {
      const g = genAt(t);
      const S = GA[g];
      pl.update({
        k: ramp(t, 0.3, 0.6),
        lines: [
          { pts: L16.pts(L16.T), tone: "grey", dash: true, w: 5, k: ramp(t, 0.4, 1.2) },
          { pts: L16.pts(S.P), tone: "blue", w: 6, k: ramp(t, 0.8, 1.6) },
        ],
      });
      sGen.set({ k: ramp(t, 0.6, 1.0), text: String(g) });
      sMae.set({ k: ramp(t, 0.7, 1.1), text: f3(S.mae) });
      sNse.set({
        k: ramp(t, 0.8, 1.2),
        text: f2(S.nse),
        tone: S.nse >= 0.9 ? "green" : "grey",
        bump: V.flash(t, 8.2, 8.6) * (S.nse >= 0.9 ? 1 : 0),
      });

      const kw = ramp(t, 1.2, 1.6) * (1 - ramp(t, 11.0, 11.4));
      wLab.set({ k: kw, bold: true });
      zero.setAttribute("opacity", kw.toFixed(3));
      const nudge = ramp(t, 3.6, 4.2, E.inOut);
      const W = t < 6.0 ? GA[0].w.map((v, i) => (i === L16.MUT.i ? lerp(L16.MUT.from, L16.MUT.to, nudge) : v)) : S.w;
      bars.forEach((b, i) => {
        const v = Math.max(-0.9, Math.min(0.9, W[i]));
        const h = Math.abs(v) * SC;
        b.setAttribute("x", bx(i));
        b.setAttribute("y", (v >= 0 ? ZERO - h : ZERO).toFixed(1));
        b.setAttribute("height", h.toFixed(1));
        const hot = i === L16.MUT.i && t >= 3.2 && t < 6.0;
        b.style.fill = hot ? T("orange").c : v < 0 ? T("red").c : T("purple").c;
        b.setAttribute("opacity", kw.toFixed(3));
      });
      const km = ramp(t, 3.4, 3.8) * (1 - ramp(t, 5.8, 6.1));
      mutG.setAttribute("opacity", km.toFixed(3));
      cMut.set({ k: ramp(t, 3.4, 3.8), o: 1 - ramp(t, 5.8, 6.1) });
      cX.set({ k: ramp(t, 4.4, 4.8), o: 1 - ramp(t, 5.8, 6.1) });

      const ks = ramp(t, 8.8, 9.2);
      spark.set({ k: ks });
      sLab.set({ k: ks, bold: true });
      sp.setAttribute(
        "points",
        SP.slice(0, g + 1)
          .map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`)
          .join(" "),
      );
      sp.setAttribute("opacity", (t >= 8.8 ? ks : 0).toFixed(3));

      const kd = ramp(t, 11.2, 11.6);
      darts.set({ k: kd });
      dG.setAttribute("opacity", kd.toFixed(3));
      dLines.forEach((l, i) => l.set({ o: ramp(t, 11.4 + 0.4 * i, 11.7 + 0.4 * i) }));
    };
  },
});

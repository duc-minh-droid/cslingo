/* Lecture 16 video, scene 08-degrade: lesson 16.4's graceful degradation. Nell's rain brain with 20 hidden neurons
   (L16.BIG, guess L16.BIGP, fit score NSE 0.99); lightning switches off neuron 7 (index 6, centred at time 0.32, near the
   peak) and the guess dips there (L16.KOP, NSE 0.83). A rule system that loses one wire fails outright. Learned patterns
   also generalise (letter A written five ways).
   Layout (stage px): L16.plot x 12, y 12, 600 x 476 (real flow dashed grey, guess blue); 20 numbered cells in two rows of
   ten under it (y 504 / 568, 54 x 56, 60 apart from x 12). Right panel x 636..924: card "neurons working" (y 12, h 100),
   stat "fit score" (y 124); calculator icon (x 680..800, y 222..382) with a wire to a plug, label "rule system" (y 396)
   and red tag "fails" / "total failure" (y 230); orange tag "performance drops" inside the plot (top right); 10.6 the
   calculator fades and five A chips (y 236) plus a green card "learned patterns generalise" (y 316) take its place.
   Story (local seconds): 0.4 plot and real flow, 0.8 the guess, cells, card and stat; 3.2 a lightning bolt hits cell 7
   (3.2..3.6), the cell turns red, 3.6..4.4 the curve dips, 3.8 card "19 of 20", stat 0.83 with an orange flash; 6.0
   calculator, 6.6 its wire drops, 6.9 the screen turns red and "fails"; 8.8 "performance drops" and "total failure";
   10.6 the letter A chips and the card; hold to 13. */
VID.scene({
  kicker: "BEND, DON'T BREAK",
  title: ["Lose a neuron,", "keep going"],
  dur: 13,
  caps: [
    [0.4, 3.0, "Nell's rain brain: 20 hidden neurons, fit score 0.99."],
    [3.2, 5.8, "Lightning knocks out neuron 7. Fit score 0.83."],
    [6.0, 8.6, "Pull one wire from a rule system and it usually fails."],
    [8.8, 10.4, "That is graceful degradation."],
    [10.6, 12.7, "Learned patterns also generalise to new cases and noise."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L16 = V.l16;
    const { ramp, lerp, ease: E } = V;
    const T = (n) => L13.tone(n);
    const N0 = L16.nse(L16.BIGP).toFixed(2),
      N1 = L16.nse(L16.KOP).toFixed(2);
    L16.same([N0, N1, L16.BIG.H], ["0.99", "0.83", 20], "scene 8: fit scores and size");
    const pl = L16.plot(stage, { h: 476, lines: 2 });
    const cells = L16.BIG.cen.map((_, k) =>
      L13.chip(stage, {
        x: 12 + 60 * (k % 10),
        y: 504 + 64 * Math.floor(k / 10),
        w: 54,
        h: 56,
        fs: 28,
        text: String(k + 1),
      }),
    );
    const work = L16.card(stage, { x: 636, y: 12, w: 288, h: 100, text: "", tone: "green" });
    const fit = L13.stat(stage, { x: 636, y: 124, w: 288, h: 80, label: "fit score", tone: "green" });
    const svg = V.l5.svg(stage, 936, 640);
    const bolt = L16.bolt(svg, 12 + 60 * 6 + 27, 420, 84);

    // the calculator (a rule system) and its wire
    const calc = svg.appendChild(V.s("g", {}));
    const body = calc.appendChild(V.s("rect", { x: 680, y: 222, width: 120, height: 160, rx: 16, "stroke-width": 4 }));
    body.style.fill = T("grey").dim;
    body.style.stroke = T("grey").c;
    const screen = calc.appendChild(V.s("rect", { x: 696, y: 238, width: 88, height: 40, rx: 6, "stroke-width": 3 }));
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) {
        const b = calc.appendChild(V.s("rect", { x: 698 + 30 * c, y: 292 + 28 * r, width: 22, height: 20, rx: 5 }));
        b.style.fill = T("grey").c;
      }
    const wireA = calc.appendChild(
      V.s("path", { d: "M800 330 H846", fill: "none", "stroke-width": 7, "stroke-linecap": "round" }),
    );
    const wireB = calc.appendChild(
      V.s("path", { d: "M852 330 H890", fill: "none", "stroke-width": 7, "stroke-linecap": "round" }),
    );
    const plug = calc.appendChild(V.s("rect", { x: 886, y: 316, width: 26, height: 28, rx: 5 }));
    [wireA, wireB].forEach((w) => (w.style.stroke = "var(--text-dim)"));
    plug.style.fill = "var(--text-dim)";
    const calcLab = L13.label(stage, { x: 636, y: 396, w: 288, text: "rule system" });
    const fails = L13.tag(stage, { x: 816, y: 230, text: "fails", tone: "red", solid: true });
    const total = L13.tag(stage, { x: 636, y: 446, text: "total failure", tone: "red", solid: true });
    const drops = L13.tag(stage, { x: 330, y: 84, text: "performance drops", tone: "orange", solid: true });

    const STY = [
      { fontStyle: "italic" },
      { fontWeight: "900" },
      { transform: "rotate(-14deg)" },
      { fontFamily: "Georgia, serif" },
      { transform: "rotate(12deg) scale(1, 0.85)", fontStyle: "italic" },
    ];
    const As = STY.map((st, i) => {
      const c = L13.chip(stage, { x: 640 + 57 * i, y: 236, w: 50, h: 64, fs: 40, text: "A" });
      Object.assign(c.tile.style, st);
      return c;
    });
    const gen = L16.card(stage, { x: 636, y: 316, w: 288, h: 96, text: "learned patterns\ngeneralise", tone: "green" });
    const tick = V.l5.svg(stage, 936, 640).appendChild(V.l5.tick(884, 384, 34, "green"));

    return (t) => {
      const dip = ramp(t, 3.6, 4.4, E.inOut);
      const P = L16.BIGP.map((v, i) => lerp(v, L16.KOP[i], dip));
      pl.update({
        k: ramp(t, 0.3, 0.6),
        lines: [
          { pts: L16.pts(L16.T), tone: "grey", dash: true, w: 5, k: ramp(t, 0.4, 1.2) },
          { pts: L16.pts(P), tone: "blue", w: 6, k: ramp(t, 0.8, 1.8) },
        ],
      });
      cells.forEach((c, k) => {
        const dead = k === 6 && t >= 3.6;
        c.set({
          k: ramp(t, 0.8 + 0.03 * k, 1.1 + 0.03 * k),
          tone: dead ? "red" : "green",
          solid: !dead,
          s: 1 + (k === 6 ? 0.2 * V.flash(t, 3.5, 3.9) : 0),
        });
      });
      bolt.setAttribute("opacity", (ramp(t, 3.2, 3.35) * (1 - ramp(t, 4.0, 4.4))).toFixed(3));
      const ko = t >= 3.8;
      work.set({
        k: ramp(t, 1.0, 1.4),
        text: `neurons working\n${ko ? 19 : 20} of 20`,
        s: 1 + 0.08 * V.flash(t, 3.8, 4.2),
      });
      fit.set({
        k: ramp(t, 1.1, 1.5),
        text: ko ? N1 : N0,
        tone: t >= 3.8 && t < 4.8 ? "orange" : "green",
        bump: V.flash(t, 3.8, 4.3),
      });

      const kc = ramp(t, 6.0, 6.4) * (1 - ramp(t, 10.6, 11.0));
      calc.setAttribute("opacity", kc.toFixed(3));
      calcLab.set({ k: ramp(t, 6.1, 6.5), o: 1 - ramp(t, 10.6, 11.0) });
      const d = ramp(t, 6.6, 7.0, E.in);
      wireB.setAttribute(
        "transform",
        `translate(${(16 * d).toFixed(1)} ${(40 * d).toFixed(1)}) rotate(${(30 * d).toFixed(1)} 852 330)`,
      );
      const dead = t >= 6.9;
      screen.style.fill = dead ? T("red").c : T("blue").dim;
      screen.style.stroke = dead ? T("red").lip : T("blue").c;
      fails.set({ k: ramp(t, 6.9, 7.3), o: 1 - ramp(t, 10.6, 11.0) });
      drops.set({ k: ramp(t, 8.8, 9.2) });
      total.set({ k: ramp(t, 9.0, 9.4), o: 1 - ramp(t, 10.6, 11.0) });
      As.forEach((c, i) => c.set({ k: ramp(t, 10.8 + 0.15 * i, 11.1 + 0.15 * i), tone: "blue" }));
      gen.set({ k: ramp(t, 11.5, 11.9) });
      tick.setAttribute("opacity", ramp(t, 11.7, 12.0).toFixed(3));
    };
  },
});

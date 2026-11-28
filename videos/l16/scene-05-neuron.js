/* Lecture 16 video, scene 05-neuron: lesson 16.2's neuron. A real neuron (dendrites receive, cell body processes, axon
   transmits), then the McCulloch-Pitts threshold neuron (L16.fire) on inputs 1 and 1: weights 1 and 1, threshold 1.5 is AND;
   threshold 0.5 is OR; weights -1 and -1, threshold -1.5 is NAND (truth tables from L16.fire, asserted against L16.TRUTH).
   Layout (stage px): top strip y 12..200 (dendrites x 30..200, body (230, 80), axon to 540, two-line labels at y 160 / 192);
   the neuron below: inputs (70, 300) and (70, 500), weight labels on the wires, body (330, 400) r 80 with an SVG sigma and
   greater-or-equal sign, output (540, 400); a sum bar y 548..580 (x 120..560, scale -2..2, filled from -2 up to the sum: green once it reaches the purple threshold mark).
   Right panel x 636..924: gate tag (y 12), truth table (heads y 84, rows from y 132, 72 apart), rule card (y 446, h 110).
   Story (local seconds): 0.4 strip parts, labels at 0.8 / 1.4 / 2.0; 3.2 inputs, 3.5 wires, 3.8 weights, 4.0 body, 4.4 symbols,
   4.8 output; 6.0 the sum bar fills to 2 (6.0..6.8), 6.9 output green 1, AND tag and rows 6.4 / 6.9 / 7.4 / 7.9, card 6.2;
   9.2..9.8 threshold slides to 0.5, 9.8 OR, changed rows flash; 11.8..12.3 weights flip to -1 (red wires), threshold -1.5,
   sum -2, 12.4 output grey 0, NAND, changed rows flash; hold to 14. */
VID.scene({
  kicker: "ONE NEURON",
  title: ["Weigh the inputs,", "fire at the threshold"],
  dur: 14,
  caps: [
    [0.4, 3.0, "A neuron listens, decides, and passes it on."],
    [3.2, 5.8, "McCulloch and Pitts, 1943: inputs times weights, then add."],
    [6.0, 9.0, "1 + 1 = 2 clears a threshold of 1.5, so it fires. That is AND."],
    [9.2, 11.6, "Lower the threshold to 0.5: one input is enough. OR."],
    [11.8, 13.7, "Negative weights inhibit: weights −1, threshold −1.5 give NAND."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L16 = V.l16;
    const { ramp, lerp, ease: E } = V;
    const T = (n) => L13.tone(n);
    const G = ["AND", "OR", "NAND"];
    const TAB = G.map((g) => L16.IN4.map((x) => L16.fire(x, ...L16.GATES[g])));
    G.forEach((g, i) => L16.same(TAB[i], L16.TRUTH[g], `scene 5: ${g}`));
    const X = [1, 1];
    L16.same(
      G.map((g) => L16.fire(X, ...L16.GATES[g])),
      [1, 1, 0],
      "scene 5: output for inputs 1 and 1",
    );
    const GV = G.map((g) => [L16.GATES[g][0][0], L16.GATES[g][1]]);
    const num = (v) => (Math.round(v * 10) / 10).toString().replace("-", "−");
    const svg = V.l5.svg(stage, 936, 640);

    // ---------- the real neuron ----------
    const bio = svg.appendChild(V.s("g", {}));
    const dend = [30, 55, 80, 105, 130].map((y) => {
      const p = bio.appendChild(
        V.s("path", { d: `M40 ${y} Q120 ${y} 200 80`, fill: "none", "stroke-width": 6, "stroke-linecap": "round" }),
      );
      p.style.stroke = T("blue").c;
      return p;
    });
    const soma = L16.node(bio, { x: 230, y: 80, r: 34 });
    const axon = L13.arrow(bio, { tone: "green", w: 9, head: 24 });
    const bioLab = [
      [85, "dendrites", "receive", "blue"],
      [262, "cell body", "process", "purple"],
      [440, "axon", "transmit", "green"],
    ].map(([x, a, b, tone]) => [
      L16.text(bio, { x, y: 164, text: a, tone, weight: 900 }),
      L16.text(bio, { x, y: 196, text: b, tone: "grey" }),
    ]);

    // ---------- the McCulloch-Pitts neuron ----------
    const IN = [
      [70, 300],
      [70, 500],
    ];
    const BODY = [330, 400];
    const wires = IN.map(() => L16.wire(svg));
    const outWire = L16.wire(svg);
    const ins = IN.map(([x, y]) => L16.node(svg, { x, y, r: 38, fs: 36 }));
    const wLab = IN.map(([, y], i) =>
      L16.text(svg, { x: 196, y: i ? y + 8 : y + 2, text: "", weight: 900, halo: true }),
    );
    const body = L16.node(svg, { x: BODY[0], y: BODY[1], r: 84 });
    const sym = svg.appendChild(V.s("g", {}));
    L16.sigma(sym, 296, 372, 40);
    L16.geq(sym, 292, 432, 40);
    const sumT = L16.text(sym, { x: 318, y: 386, text: "", tone: "purple", fs: 36, weight: 900, anchor: "start" });
    const thT = L16.text(sym, { x: 318, y: 446, text: "", tone: "purple", fs: 36, weight: 900, anchor: "start" });
    const out = L16.node(svg, { x: 540, y: 400, r: 38, fs: 36 });

    const BAR = { x0: 120, x1: 560, y: 548, h: 32 };
    const bx = (v) => lerp(BAR.x0, BAR.x1, (v + 2) / 4);
    const track = svg.appendChild(
      V.s("rect", { x: BAR.x0, y: BAR.y, width: BAR.x1 - BAR.x0, height: BAR.h, rx: 10, "stroke-width": 3 }),
    );
    track.style.fill = T("grey").dim;
    track.style.stroke = T("grey").c;
    const fill = svg.appendChild(V.s("rect", { y: BAR.y + 4, height: BAR.h - 8, rx: 6 }));
    const mark = svg.appendChild(V.s("path", { "stroke-width": 7, "stroke-linecap": "round" }));
    mark.style.stroke = T("purple").c;
    const ticks = [-2, 0, 2].map((v) => L16.text(svg, { x: bx(v), y: BAR.y + 64, text: num(v) }));

    // ---------- the truth table ----------
    const gTag = L13.tag(stage, { x: 636, y: 12, text: "AND", tone: "purple", solid: true, fs: 32 });
    const grid = L16.grid(stage, {
      x: 650,
      y: 84,
      cols: [
        { w: 70, head: "in 1", tone: "blue" },
        { w: 70, head: "in 2", tone: "blue" },
        { w: 90, head: "out", tone: "green" },
      ],
      rows: 4,
      rowH: 72,
      gap: 14,
    });
    const rule = L16.card(stage, { x: 636, y: 446, w: 288, h: 110, text: "", tone: "purple" });

    const ROWT = [6.4, 6.9, 7.4, 7.9];
    return (t) => {
      // which gate is showing
      const gi = t >= 12.4 ? 2 : t >= 9.8 ? 1 : 0;
      const wv = lerp(1, -1, ramp(t, 11.8, 12.3, E.inOut));
      const th = lerp(lerp(1.5, 0.5, ramp(t, 9.2, 9.8, E.inOut)), -1.5, ramp(t, 11.8, 12.3, E.inOut));
      const s = X[0] * wv + X[1] * wv;
      const fires = s >= th - 1e-9;

      bio.setAttribute("opacity", "1");
      dend.forEach((p) => p.setAttribute("opacity", ramp(t, 0.4, 0.7).toFixed(3)));
      soma.set({ tone: "purple", k: ramp(t, 0.5, 0.8) });
      axon.set({ a: [266, 80], b: [540, 80], k: ramp(t, 0.6, 1.1, E.out) });
      bioLab.forEach((pair, i) => pair.forEach((l) => l.set({ o: ramp(t, 0.8 + 0.6 * i, 1.1 + 0.6 * i) })));

      const neg = wv < 0;
      // the numbers on screen snap to the gate's real values half-way through each change (no made-up in-between figures)
      const [W, TH] = GV[t >= 12.05 ? 2 : t >= 9.5 ? 1 : 0];
      ins.forEach((n) => n.set({ tone: "blue", text: "1", k: ramp(t, 3.2, 3.5) }));
      wires.forEach((w, i) =>
        w.set({
          a: IN[i],
          b: [BODY[0] - 80, BODY[1] + (i ? 30 : -30)],
          tone: neg ? "red" : "blue",
          w: 7,
          k: ramp(t, 3.5, 3.9),
        }),
      );
      wLab.forEach((l) => l.set({ text: `weight ${num(W)}`, tone: neg ? "red" : "blue", o: ramp(t, 3.8, 4.1) }));
      body.set({ tone: "purple", solid: false, k: ramp(t, 4.0, 4.3) });
      sym.setAttribute("opacity", ramp(t, 4.4, 4.7).toFixed(3));
      sumT.set({ text: num(2 * W) });
      thT.set({ text: num(TH) });
      outWire.set({
        a: [BODY[0] + 84, BODY[1]],
        b: [502, 400],
        tone: t >= 6.9 && fires ? "green" : "grey",
        k: ramp(t, 4.6, 4.9),
      });
      const lit = t >= 6.9;
      out.set({
        tone: lit && fires ? "green" : "grey",
        text: lit ? (fires ? "1" : "0") : "",
        k: ramp(t, 4.8, 5.1),
        s: 1 + 0.15 * (V.flash(t, 6.9, 7.3) + V.flash(t, 12.4, 12.8)),
      });

      const kb = ramp(t, 6.0, 6.3);
      track.setAttribute("opacity", kb.toFixed(3));
      ticks.forEach((l) => l.set({ o: kb }));
      const shown = lerp(-2, s, ramp(t, 6.0, 6.8, E.inOut));
      const [fx0, fx1] = [bx(-2), bx(shown)];
      fill.setAttribute("x", fx0.toFixed(1));
      fill.setAttribute("width", Math.max(0, fx1 - fx0).toFixed(1));
      fill.style.fill = shown >= th - 1e-9 ? T("green").c : T("grey").c;
      fill.setAttribute("opacity", kb.toFixed(3));
      mark.setAttribute("d", `M${bx(th).toFixed(1)} ${BAR.y - 14} V${BAR.y + BAR.h + 14}`);
      mark.setAttribute("opacity", kb.toFixed(3));

      gTag.set({ k: ramp(t, 6.0, 6.4), text: G[gi], s: 1 + 0.15 * (V.flash(t, 9.8, 10.2) + V.flash(t, 12.4, 12.8)) });
      const prev = gi > 0 ? TAB[gi - 1] : TAB[0];
      const at = [0, 9.8, 12.4][gi];
      grid.heads.forEach((h) => h.set({ k: ramp(t, 6.0, 6.4), bold: true }));
      grid.cells.forEach((row, r) => {
        const k = ramp(t, ROWT[r], ROWT[r] + 0.3);
        const x = L16.IN4[r];
        const v = TAB[gi][r];
        const changed = gi > 0 && prev[r] !== v;
        row[0].set({ k, text: x[0], tone: x[0] ? "blue" : "grey", solid: !!x[0] });
        row[1].set({ k, text: x[1], tone: x[1] ? "blue" : "grey", solid: !!x[1] });
        row[2].set({
          k,
          text: v,
          tone: v ? "green" : "grey",
          solid: !!v,
          s: 1 + (changed ? 0.18 * V.flash(t, at, at + 0.5) : 0),
          ring: changed && t < at + 1.2 ? "green" : undefined,
        });
      });
      rule.set({
        k: ramp(t, 6.2, 6.6),
        text: `weights ${num(W)} and ${num(W)}\nthreshold ${num(TH)}`,
        tone: neg ? "red" : "purple",
      });
    };
  },
});

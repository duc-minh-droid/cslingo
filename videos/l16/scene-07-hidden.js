/* Lecture 16 video, scene 07-hidden: lesson 16.2's fix. Two hidden neurons, OR and NAND, feed an AND output: XOR =
   AND(OR, NAND) (L16.xorNet, asserted). The four input rows play in the order 00, 11, 01, 10; then the generic multi-layer
   perceptron (Rumelhart and McClelland, 1986): input, hidden and output layers, car attributes in and fuel use out.
   Layout (stage px): network x 12..470: inputs (60, 170) / (60, 470) r 40 (blue), hidden OR (240, 170) and NAND (240, 470)
   r 56 (purple ring, green when firing, grey when silent), output AND (410, 320) r 54; layer tags at y 566. Right: table
   x 490..896 (heads y 12, rows from y 60, 70 apart: in 1, in 2, OR, NAND, out), a green outline round the out column and
   the tag "XOR" (y 350); purple tag "multi-layer perceptron" (y 430) and card "car attributes in, fuel use out" (y 500).
   Story (local seconds): 0.4..1.6 the network draws left to right, heads; rows at 3.2 (00), 4.8 (11), 6.6 (01), 8.0 (10):
   inputs light at +0, hidden at +0.4, output at +0.8, the row's cells fill at the same moments; 9.6 the outline and "XOR";
   11.4 layer tags, the MLP tag and the example card; hold to 14. */
VID.scene({
  kicker: "ONE MORE LAYER",
  title: ["Two hidden neurons", "make XOR"],
  dur: 14,
  caps: [
    [0.4, 3.0, "Add a hidden layer: OR and NAND feed an AND."],
    [3.2, 6.4, "0 0 and 1 1: the hidden pair disagree, so no light."],
    [6.6, 9.4, "0 1 and 1 0: both agree, so the output fires."],
    [9.6, 11.2, "That is XOR from three neurons."],
    [11.4, 13.7, "The multi-layer perceptron: Rumelhart and McClelland, 1986."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L16 = V.l16;
    const { ramp } = V;
    const T = (n) => L13.tone(n);
    const RUN = L16.IN4.map((x) => L16.xorNet(x));
    L16.same(
      RUN.map((r) => r.y),
      L16.TRUTH.XOR,
      "scene 7: the network computes XOR",
    );
    const ORDER = [0, 3, 1, 2];
    const PT = [3.2, 4.8, 6.6, 8.0];
    const svg = V.l5.svg(stage, 936, 640);
    const IN = [
      [60, 170],
      [60, 470],
    ];
    const HID = [
      [240, 170],
      [240, 470],
    ];
    const OUT = [410, 320];
    const W1 = [];
    IN.forEach((a, i) => HID.forEach((b, j) => W1.push({ a, b, i, j })));
    const wIn = W1.map(() => L16.wire(svg));
    const wOut = HID.map(() => L16.wire(svg));
    const nIn = IN.map(([x, y]) => L16.node(svg, { x, y, r: 40, fs: 36 }));
    const nHid = HID.map(([x, y]) => L16.node(svg, { x, y, r: 56, fs: 28 }));
    const nOut = L16.node(svg, { x: OUT[0], y: OUT[1], r: 54, fs: 30 });
    const layer = [
      [60, "input", "blue"],
      [240, "hidden", "purple"],
      [410, "output", "green"],
    ].map(([x, text, tone]) => L13.tag(stage, { x: x - L13.tagW(text) / 2, y: 566, text, tone }));

    const grid = L16.grid(stage, {
      x: 490,
      y: 12,
      cols: [
        { w: 70, head: "in 1", tone: "blue" },
        { w: 70, head: "in 2", tone: "blue" },
        { w: 78, head: "OR", tone: "purple" },
        { w: 86, head: "NAND", tone: "purple" },
        { w: 78, head: "out", tone: "green" },
      ],
      rows: 4,
      rowH: 70,
      gap: 6,
    });
    const ox = grid.xs[4];
    const outline = svg.appendChild(
      V.s("rect", { x: ox - 10, y: 50, width: 98, height: 292, rx: 18, fill: "none", "stroke-width": 6 }),
    );
    outline.style.stroke = T("green").c;
    const xorTag = L13.tag(stage, {
      x: ox + 39 - L13.tagW("XOR", 30) / 2,
      y: 350,
      text: "XOR",
      tone: "green",
      solid: true,
      fs: 30,
    });
    const mlp = L13.tag(stage, { x: 490, y: 430, text: "multi-layer perceptron", tone: "purple", solid: true });
    const ex = L16.card(stage, {
      x: 490,
      y: 500,
      w: 406,
      h: 96,
      text: "car attributes in,\nfuel use out",
      tone: "grey",
    });

    return (t) => {
      const p = PT.filter((x) => t >= x).length - 1; // the row being played (-1 = none yet)
      const r = p >= 0 ? ORDER[p] : -1;
      const x = r >= 0 ? L16.IN4[r] : [0, 0];
      const R = r >= 0 ? RUN[r] : null;
      const t0 = p >= 0 ? PT[p] : 99;
      const hOn = R && t >= t0 + 0.4;
      const oOn = R && t >= t0 + 0.8;
      nIn.forEach((n, i) =>
        n.set({
          tone: r >= 0 && x[i] ? "blue" : "grey",
          solid: !(r >= 0 && !x[i]),
          text: r >= 0 ? x[i] : "",
          k: ramp(t, 0.4, 0.7),
        }),
      );
      W1.forEach((w, n) =>
        wIn[n].set({
          a: w.a,
          b: w.b,
          tone: r >= 0 && x[w.i] ? "blue" : "grey",
          w: r >= 0 && x[w.i] ? 8 : 5,
          k: ramp(t, 0.6, 1.0),
        }),
      );
      nHid.forEach((n, j) => {
        const f = hOn ? R.h[j] : -1;
        n.set({
          text: j ? "NAND" : "OR",
          tone: f === 1 ? "green" : f === 0 ? "grey" : "purple",
          solid: f >= 0,
          k: ramp(t, 0.8, 1.1),
          s: 1 + 0.12 * V.flash(t, t0 + 0.4, t0 + 0.8),
        });
      });
      wOut.forEach((w, j) =>
        w.set({
          a: HID[j],
          b: OUT,
          tone: hOn && R.h[j] ? "green" : "grey",
          w: hOn && R.h[j] ? 8 : 5,
          k: ramp(t, 1.0, 1.4),
        }),
      );
      const fo = oOn ? R.y : -1;
      nOut.set({
        text: "AND",
        tone: fo === 1 ? "green" : fo === 0 ? "grey" : "purple",
        solid: fo >= 0,
        k: ramp(t, 1.2, 1.6),
        s: 1 + 0.15 * V.flash(t, t0 + 0.8, t0 + 1.2),
      });

      grid.heads.forEach((h, i) => h.set({ k: ramp(t, 1.4 + 0.1 * i, 1.7 + 0.1 * i), bold: true }));
      grid.cells.forEach((row, rr) => {
        const pi = ORDER.indexOf(rr);
        const s = PT[pi];
        const xi = L16.IN4[rr];
        const Q = RUN[rr];
        const cell = (c, v, at, on) =>
          row[c].set({ k: ramp(t, at, at + 0.3), text: v, tone: v ? on : "grey", solid: !!v });
        cell(0, xi[0], s, "blue");
        cell(1, xi[1], s, "blue");
        cell(2, Q.h[0], s + 0.4, "green");
        cell(3, Q.h[1], s + 0.4, "green");
        cell(4, Q.y, s + 0.8, "green");
      });
      const ko = ramp(t, 9.6, 10.0);
      outline.setAttribute("opacity", ko.toFixed(3));
      xorTag.set({ k: ko });
      layer.forEach((g, i) => g.set({ k: ramp(t, 11.4 + 0.15 * i, 11.8 + 0.15 * i) }));
      mlp.set({ k: ramp(t, 11.5, 11.9) });
      ex.set({ k: ramp(t, 11.9, 12.3) });
    };
  },
});

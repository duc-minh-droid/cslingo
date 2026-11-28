/* Lecture 16 video, scene 09-runoff: lesson 16.5's case study (Walker et al., 2014). Rainfall and air temperature go into
   a network with one hidden layer of 10 neurons and one output, which predicts sewer flow; 15 rainfall events from January
   2010 to October 2012; cross-validation holds one storm back per split; an EA trains it, and one individual is one
   complete set of weights (shown: the 10 weights of the best genome of the lesson's GA at generation 0, L16.GA[0].w).
   Layout (stage px): flow strip y 12..160: blue card "Rainfall, air temperature" (x 12, w 250), arrow, purple card with a
   mini 2-10-1 network (x 330..610), arrow, green card "Sewer flow" (x 686, w 238). Fifteen storm bars (x 12 + 61 i,
   52 wide, base y 350, height 13 px per unit of L16.STORMS), label (y 362); tags "test" (orange) and "train" (blue) at
   y 416, stat "split" (x 636, y 410); label (y 488) and ten weight chips (y 532, 84 x 60, 92 apart; negative ones red).
   Story (local seconds): 0.4 / 1.0 / 1.6 the three strip cards and arrows; 3.2..4.6 the bars rise one by one, 3.6 label;
   6.0 the test bar steps 1, 2, 3, 4 (0.6 s each) with "split n of 15", tags; 8.8 label and weight chips (0.08 s apart);
   hold to 12. */
VID.scene({
  kicker: "MOSSBROOK'S RAIN BRAIN",
  title: ["Rain in,", "sewer flow out"],
  dur: 12,
  caps: [
    [0.4, 3.0, "The case study: rainfall and temperature in, sewer flow out."],
    [3.2, 5.8, "15 rainfall events, January 2010 to October 2012."],
    [6.0, 8.6, "Cross-validation: each split holds one storm back for testing."],
    [8.8, 11.7, "Train with an EA: each solution is a complete set of weights."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L16 = V.l16;
    const { ramp } = V;
    const T = (n) => L13.tone(n);
    const W = L16.GA[0].w;
    L16.same([W.length, L16.SMALL.H, L16.STORMS.length], [10, 10, 15], "scene 9: 10 weights, 10 hidden, 15 storms");

    const inCard = L16.card(stage, { x: 12, y: 22, w: 250, h: 128, text: "Rainfall,\nair temperature", tone: "blue" });
    const netCard = L16.card(stage, { x: 330, y: 12, w: 280, h: 148, text: "", tone: "purple" });
    const outCard = L16.card(stage, { x: 686, y: 22, w: 238, h: 128, text: "Sewer flow", tone: "green" });
    const svg = V.l5.svg(stage, 936, 640);
    const arrows = [
      [268, 324],
      [616, 680],
    ].map(() => L13.arrow(svg, { tone: "grey", w: 7, head: 20 }));
    const net = svg.appendChild(V.s("g", {}));
    const IN = [
      [372, 62],
      [372, 110],
    ];
    const HID = Array.from({ length: 10 }, (_, k) => [470, 26 + 13.6 * k]);
    const OUT = [568, 86];
    const line = (a, b) => {
      const l = net.appendChild(V.s("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], "stroke-width": 2 }));
      l.style.stroke = "var(--line)";
    };
    IN.forEach((a) => HID.forEach((b) => line(a, b)));
    HID.forEach((a) => line(a, OUT));
    const dot = ([x, y], r, tone) => {
      const c = net.appendChild(V.s("circle", { cx: x, cy: y.toFixed(1), r, "stroke-width": 2 }));
      c.style.fill = T(tone).c;
      c.style.stroke = T(tone).lip;
    };
    IN.forEach((p) => dot(p, 11, "blue"));
    HID.forEach((p) => dot(p, 6, "purple"));
    dot(OUT, 12, "green");

    const bars = L16.STORMS.map((h, i) => {
      const r = svg.appendChild(
        V.s("rect", { x: 12 + 61 * i, y: 350 - 13 * h, width: 52, height: 13 * h, rx: 8, "stroke-width": 3 }),
      );
      return r;
    });
    const storms = L13.label(stage, { x: 12, y: 362, w: 912, text: "15 storms, January 2010 to October 2012" });
    const tagT = L13.tag(stage, { x: 12, y: 416, text: "test", tone: "orange", solid: true });
    const tagR = L13.tag(stage, { x: 116, y: 416, text: "train", tone: "blue", solid: true });
    const split = L13.stat(stage, { x: 636, y: 410, w: 288, h: 70, label: "split", tone: "orange" });
    const wLab = L13.label(stage, { x: 12, y: 486, w: 912, text: "one genome: one complete set of weights" });
    const chips = W.map((v, i) =>
      L13.chip(stage, { x: 12 + 92 * i, y: 532, w: 84, h: 60, fs: 28, text: v.toFixed(2).replace("-", "−") }),
    );
    const ST = [6.0, 6.6, 7.2, 7.8];

    return (t) => {
      inCard.set({ k: ramp(t, 0.4, 0.8) });
      arrows[0].set({ a: [268, 86], b: [324, 86], k: ramp(t, 0.8, 1.1) });
      netCard.set({ k: ramp(t, 1.0, 1.4) });
      net.setAttribute("opacity", ramp(t, 1.2, 1.6).toFixed(3));
      arrows[1].set({ a: [616, 86], b: [680, 86], k: ramp(t, 1.4, 1.7) });
      outCard.set({ k: ramp(t, 1.6, 2.0) });
      const sp = t >= ST[0] ? ST.filter((s) => t >= s).length - 1 : -1;
      bars.forEach((b, i) => {
        const k = ramp(t, 3.2 + 0.09 * i, 3.5 + 0.09 * i);
        const h = L16.STORMS[i] * 13 * k;
        b.setAttribute("y", (350 - h).toFixed(1));
        b.setAttribute("height", Math.max(0, h).toFixed(1));
        b.setAttribute("opacity", k > 0 ? "1" : "0");
        const test = i === sp;
        b.style.fill = test ? T("orange").c : T("blue").c;
        b.style.stroke = test ? T("orange").lip : T("blue").lip;
      });
      storms.set({ k: ramp(t, 3.6, 4.0), bold: true });
      tagT.set({ k: ramp(t, 6.0, 6.3) });
      tagR.set({ k: ramp(t, 6.1, 6.4) });
      split.set({
        k: ramp(t, 6.0, 6.4),
        text: `${Math.max(1, sp + 1)} of 15`,
        bump: sp >= 0 ? V.flash(t, ST[sp], ST[sp] + 0.3) : 0,
      });
      wLab.set({ k: ramp(t, 8.8, 9.2), tone: "purple", bold: true });
      chips.forEach((c, i) => c.set({ k: ramp(t, 9.0 + 0.08 * i, 9.3 + 0.08 * i), tone: W[i] < 0 ? "red" : "purple" }));
    };
  },
});

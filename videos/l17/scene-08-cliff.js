/* Lecture 17 video, scene 08-cliff: why plain backpropagation gets stuck (lesson 17.5). Backprop walks back from the output
   error using each neuron's slope; a sigmoid has the slope f(a)(1 - f(a)). A spiking neuron is a step: 0 below the
   threshold, then a jump; its slope is the Dirac delta (zero everywhere but one infinitely thin spike), so there is no
   gradient information.
   Layout (stage px): part 1: tags 'Output error' (red), 'Hidden layer', 'Input weights' (y 12) with grey arrows pointing
   right (the backward walk); a sigmoid hill (grey) over a = -6..6 at x 470 + 55 a, y 470 - 300 f, Pip (s 0.45) on it at
   a = -1.4 with a green tangent arrow pointing downhill and the green tag 'slope f(a)(1 − f(a))' (x 120, y 150).
   Part 2: left plot x 12..452 (axes from (50, 470), blue step at the threshold x 250), title 'spike output'; right plot
   x 484..924 (axes from (520, 470), red flat slope with a thin spike at x 715 up to y 120), title 'its slope', label
   'Dirac delta'; Pip on the left plot's flat part (x 130) with a red tag 'slope 0'; the red stamp 'no gradient
   information' over the right plot.
   Story (local seconds): 0.4 strip, hill, Pip, slope arrow and tag; 3.0 part 1 fades; 3.2 the left plot draws (step);
   6.0 the right plot, its spike, 'Dirac delta', Pip and 'slope 0'; 8.8 the stamp; hold to 12. */
VID.scene({
  kicker: "WHERE BACKPROP GETS STUCK",
  title: ["No slope,", "no direction"],
  dur: 12,
  caps: [
    [0.4, 3.0, "Backpropagation walks back from the error, using each neuron's slope."],
    [3.2, 5.8, "A spiking neuron is 0 below the threshold, then jumps."],
    [6.0, 8.6, "Its slope is the Dirac delta: zero everywhere but one point."],
    [8.8, 11.7, "No gradient information, so plain backprop can't be used."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L17 = V.l17;
    const { ramp } = V;
    const f1 = L17.f1;
    const svg = L17.svg(stage);
    const sg = (a) => L17.sig(a, 1);
    const HX = (a) => 470 + 55 * a;
    const HY = (f) => 470 - 300 * f;

    // part 1
    const STRIP = ["Output error", "Hidden layer", "Input weights"];
    const xs = L17.row(STRIP, 12, 90);
    const strip = STRIP.map((text, i) => L13.tag(stage, { x: xs[i], y: 12, text, tone: i ? "grey" : "red" }));
    const sArr = [0, 1].map(() => L13.arrow(svg, { tone: "grey", w: 5, head: 16 }));
    const back = L17.text(svg, { x: 924, y: 112, text: "backward pass", anchor: "end", tone: "grey" });
    const hill = L17.path(svg);
    const hillD = `M${Array.from({ length: 61 }, (_, i) => {
      const a = -6 + i * 0.2;
      return `${f1(HX(a))} ${f1(HY(sg(a)))}`;
    }).join(" L")}`;
    const A0 = -1.4;
    const slopeArr = L13.arrow(svg, { tone: "green", w: 7, head: 22 });
    const slopeTag = L13.tag(stage, { x: 120, y: 150, text: "slope f(a)(1 − f(a))", tone: "green", solid: true });

    // part 2
    const axL = svg.appendChild(V.s("path", { d: "M50 130 V470 H440", fill: "none", "stroke-width": 4 }));
    const axR = svg.appendChild(V.s("path", { d: "M520 130 V470 H910", fill: "none", "stroke-width": 4 }));
    [axL, axR].forEach((e) => (e.style.stroke = "var(--text-dim)"));
    const step = L17.path(svg);
    const flat = L17.path(svg);
    const delta = L17.path(svg);
    const tL = L17.text(svg, { x: 245, y: 118, text: "spike output", anchor: "middle", tone: "blue" });
    const tR = L17.text(svg, { x: 715, y: 108, text: "its slope", anchor: "middle", tone: "red" });
    const thL = L17.text(svg, { x: 250, y: 510, text: "threshold", anchor: "middle", tone: "grey" });
    const thR = L17.text(svg, { x: 715, y: 510, text: "threshold", anchor: "middle", tone: "grey" });
    const y0 = L17.text(svg, { x: 36, y: 480, text: "0", anchor: "end", tone: "grey" });
    const y1 = L17.text(svg, { x: 36, y: 180, text: "1", anchor: "end", tone: "grey" });
    const dLab = L17.text(svg, { x: 732, y: 190, text: "Dirac delta", tone: "red" });
    const pip = L17.pip(svg);
    const zero = L13.tag(stage, { x: 66, y: 330, text: "slope 0", tone: "red", solid: true });
    const stamp = L13.tag(stage, { x: 528, y: 300, text: "no gradient information", tone: "red", solid: true, fs: 30 });

    return (t) => {
      // part 1
      const k1 = ramp(t, 0.3, 0.7) * (1 - ramp(t, 3.0, 3.3));
      strip.forEach((s, i) => s.set({ k: L13.seq(t, 0.4, 0.3, 0.4, i), o: 1 - ramp(t, 3.0, 3.3) }));
      sArr.forEach((a, i) =>
        a.set({
          a: [xs[i] + L13.tagW(STRIP[i]) + 32, 39],
          b: [xs[i + 1] - 10, 39],
          k: L13.seq(t, 0.6, 0.3, 0.3, i),
          o: 1 - ramp(t, 3.0, 3.3),
        }),
      );
      back.set({ o: ramp(t, 1.0, 1.4) * (1 - ramp(t, 3.0, 3.3)) });
      hill.set({ d: hillD, tone: "grey", w: 6, k: ramp(t, 0.6, 1.6), o: k1 });
      const px = HX(A0);
      const py = HY(sg(A0));
      const m = 0.4 + 0.6 * ramp(t, 1.4, 1.8);
      // the downhill tangent: direction (-55, +300 * slope) in px, normalised
      const sl = sg(A0) * (1 - sg(A0));
      const L = Math.hypot(55, 300 * sl);
      const [ux, uy] = [-55 / L, (300 * sl) / L];
      slopeArr.set({ a: [px, py + 8], b: [px + 130 * ux, py + 8 + 130 * uy], k: ramp(t, 1.6, 2.2), o: k1 });
      slopeTag.set({ k: ramp(t, 1.9, 2.3), o: 1 - ramp(t, 3.0, 3.3) });
      // part 2
      const k2 = ramp(t, 3.2, 3.6);
      L17.vis(axL, k2);
      [tL, thL, y0, y1].forEach((e) => e.set({ o: k2 }));
      step.set({ d: "M50 470 H250 V170 H440", tone: "blue", w: 7, k: ramp(t, 3.6, 5.0) });
      const k3 = ramp(t, 6.0, 6.4);
      L17.vis(axR, k3);
      [tR, thR].forEach((e) => e.set({ o: k3 }));
      flat.set({ d: "M520 470 H910", tone: "red", w: 7, k: ramp(t, 6.2, 7.0) });
      delta.set({ d: "M715 470 V120", tone: "red", w: 3, k: ramp(t, 7.0, 7.4) });
      dLab.set({ o: ramp(t, 7.3, 7.7) });
      // Pip: on the hill, then on the flat part of the step
      const onStep = t >= 3.2;
      const pk = onStep ? ramp(t, 6.4, 6.8) : k1 * m;
      pip.set({ x: onStep ? 130 : px, y: onStep ? 466 : py + 2, s: 0.45, o: pk });
      zero.set({ k: ramp(t, 6.8, 7.2) });
      stamp.set({ k: ramp(t, 8.8, 9.2) });
      stamp.el.style.transform += " rotate(-6deg)";
    };
  },
});

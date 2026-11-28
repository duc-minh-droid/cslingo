/* Lecture 17 video, scene 09-surrogate: the surrogate slope (lesson 17.5, L17.slope = k s (1 - s), s the sigmoid of k a).
   Real spikes go forward; the backward pass pretends the neuron is a smooth sigmoid. Its slope is a bell centred on the
   threshold with peak k / 4: k 1 -> 0.25 (at a = 2: 0.10), k 5 -> 1.25 (almost 0 at a = 2), k 20 -> 5; as k grows the bell
   becomes the Dirac delta.
   Layout (stage px): tags 'forward: real spikes' (orange) and 'backward: smooth surrogate' (purple) at y 12; plot axes from
   (100, 540): a = -10..10 at x 500 + 40 a, slope 0..5.2 at y 540 - 82.7 s; ticks -10 / 0 / 10 and 0 / 5; titles 'slope'
   (top left) and 'a (charge minus threshold)' (bottom right); a faint red dashed Dirac line at a = 0. Peak tags 'k = n:
   peak p' sit left of the centre (right edge x 480) at the height of each peak; a dot at a = 2 on the newest curve with
   its value tag to the right (x 600).
   Story (local seconds): 0.4 the two tags; 1.0 axes; 3.2 k = 1 draws (purple), its peak tag and the a = 2 dot '0.10';
   6.0 k = 1 turns grey, k = 5 draws, tag 'peak 1.25', dot 'almost 0'; 8.8 k = 5 turns grey, k = 20 draws, tag 'peak 5',
   the red Dirac outline and 'as k grows: the Dirac delta'; hold to 12. */
VID.scene({
  kicker: "BORROW A SMOOTH STAND-IN",
  title: ["A surrogate slope", "for the backward pass"],
  dur: 12,
  caps: [
    [0.4, 3.0, "Keep real spikes forward; pretend a smooth sigmoid backward."],
    [3.2, 5.8, "Its slope is a bell centred on the threshold. k = 1: peak 0.25."],
    [6.0, 8.6, "k = 5: peak 1.25, narrower."],
    [8.8, 11.7, "k = 20: peak 5. As k grows, the bell becomes the delta."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L17 = V.l17;
    const { ramp } = V;
    const f1 = L17.f1;
    const SU = L17.SURR;
    L17.same(
      SU.map((s) => s.peak),
      [0.25, 1.25, 5],
      "scene 9: peaks",
    );
    const AT2 = SU.map((s) => (s.at2 < 0.01 ? "almost 0" : s.at2.toFixed(2)));
    L17.same(AT2, ["0.10", "almost 0", "almost 0"], "scene 9: slope at a = 2");
    const X = (a) => 500 + 40 * a;
    const Y = (s) => 540 - 82.7 * s;
    const svg = L17.svg(stage);
    const tone = (n) => L13.tone(n);

    const TAGS = ["forward: real spikes", "backward: smooth surrogate"];
    const tx = L17.row(TAGS, 12, 24);
    const tags = TAGS.map((text, i) =>
      L13.tag(stage, { x: tx[i], y: 12, text, tone: i ? "purple" : "orange", solid: true }),
    );
    const dirac = svg.appendChild(V.s("line", { x1: X(0), x2: X(0), y1: 540, y2: 110, "stroke-width": 5 }));
    dirac.setAttribute("stroke-dasharray", "12 10");
    dirac.style.stroke = tone("red").c;
    const axes = svg.appendChild(V.s("path", { d: "M100 104 V540 H906", fill: "none", "stroke-width": 4 }));
    axes.style.stroke = "var(--text-dim)";
    const ticks = [
      [X(-10), 578, "-10", "middle"],
      [X(0), 578, "0", "middle"],
      [X(10) - 6, 578, "10", "middle"],
      [86, Y(0) + 10, "0", "end"],
      [86, Y(5) + 10, "5", "end"],
    ].map(([x, y, text, anchor]) => L17.text(svg, { x, y, text, anchor, tone: "grey" }));
    const yT = L17.text(svg, { x: 112, y: 100, text: "slope", tone: "grey" });
    const xT = L17.text(svg, { x: 906, y: 622, text: "a (charge minus threshold)", anchor: "end", tone: "grey" });
    const curves = SU.map((s) => {
      const d = `M${Array.from({ length: 401 }, (_, i) => {
        const a = -10 + i * 0.05;
        return `${f1(X(a))} ${f1(Y(L17.slope(a, s.k)))}`;
      }).join(" L")}`;
      return { d, p: L17.path(svg) };
    });
    const peakTags = SU.map((s) => {
      const text = `k = ${s.k}: peak ${s.peak}`;
      const w = L13.tagW(text) + 22;
      const y = Math.max(110, Y(s.peak) - 70);
      return L13.tag(stage, { x: 480 - w, y, text, tone: "purple" });
    });
    const dot = L17.dot(svg, 12, "purple");
    const valTag = L13.tag(stage, { x: 600, y: 0, text: "", tone: "purple" });
    const dLab = L17.text(svg, { x: 530, y: 230, text: "as k grows: the Dirac delta", tone: "red" });
    const AT = [3.2, 6.0, 8.8];

    return (t) => {
      tags.forEach((g, i) => g.set({ k: L13.seq(t, 0.4, 0.5, 0.4, i) }));
      const ka = ramp(t, 1.0, 1.4);
      L17.vis(axes, ka);
      ticks.forEach((e) => e.set({ o: ka }));
      yT.set({ o: ka });
      xT.set({ o: ka });
      let cur = -1;
      AT.forEach((a, i) => {
        if (t >= a) cur = i;
      });
      curves.forEach((c, i) => {
        c.p.set({ d: c.d, tone: i === cur ? "purple" : "grey", w: 6, k: ramp(t, AT[i], AT[i] + 1.0) });
        peakTags[i].set({ k: ramp(t, AT[i] + 0.6, AT[i] + 1.0), tone: i === cur ? "purple" : "grey" });
      });
      if (cur >= 0) {
        const s = SU[cur];
        const y = Y(L17.slope(2, s.k));
        dot.setAttribute("cx", X(2));
        dot.setAttribute("cy", f1(y));
        valTag.set({ k: ramp(t, AT[cur] + 1.0, AT[cur] + 1.4), text: `a = 2: ${AT2[cur]}`, y: y - 76 });
      } else valTag.set({ k: 0 });
      L17.vis(dot, cur >= 0 ? ramp(t, AT[cur] + 0.9, AT[cur] + 1.1) : 0);
      L17.vis(dirac, 0.45 * ramp(t, 9.6, 10.0));
      dLab.set({ o: ramp(t, 9.8, 10.2) });
    };
  },
});

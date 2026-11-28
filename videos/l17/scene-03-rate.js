/* Lecture 17 video, scene 03-rate: spike trains and rate coding (lesson 17.2, L17.ARCH, L17.RATE, L17.encode). Every spike is
   the same short blip; a neuron's run of spikes over time is a spike train. Rate coding: strength s (out of 10) gives s
   evenly spaced spikes in 20 steps: dim 2, medium 5, bright 9.
   Layout (stage px): raster rows x 12..924 (labels 200 px, counts in the last 70 px), 20 steps. Part 1: Pip's three sensor
   rows (whisker 3, light 5, sound 2; orange) at y 12 / 76 / 140, a grey bracket from them down into a blue neuron at
   (44, 262), and its own row (blue ticks at steps 8, 14, 20) at y 230. Part 2: rows 'dim (2)', 'medium (5)', 'bright (9)'
   at the same three places, counts at the right. Part 3: a demo row (y 300) and a slider (track y 430) 'light strength'.
   Story (local seconds): 0.4 sensor rows and the neuron row draw under a playhead (0.4..2.8); 3.0 they fade; 3.4..5.8 the
   three rate rows draw; 6.0 the counts 2, 5, 9 (orange); 8.8 the slider knob steps from 2 to 9 (8.9..11.0) and the demo
   row redraws with that many spikes, with the note 'strength s out of 10 gives s spikes in 20 steps'; hold to 12. */
VID.scene({
  kicker: "SPIKE TRAINS",
  title: ["Count the spikes:", "rate coding"],
  dur: 12,
  caps: [
    [0.4, 3.0, "A neuron's run of spikes over time is a spike train."],
    [3.2, 5.8, "Rate coding: a stronger signal sends more spikes."],
    [6.0, 8.6, "Dim 2, medium 5, bright 9 spikes in 20 steps."],
    [8.8, 11.7, "Only how many count, not their size."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L17 = V.l17;
    const { ramp, clamp } = V;
    const A = L17.ARCH;
    const n = (tr) => L17.on(tr).length;
    L17.same([A.ins.map(n), L17.on(A.out)].join("|"), "3,5,2|8,14,20", "scene 3: sensor raster");
    L17.same(L17.RATE.map(n), [2, 5, 9], "scene 3: dim, medium, bright");
    const svg = L17.svg(stage);
    const G = { x: 12, w: 912, labW: 200, cntW: 70, rh: 64 };

    // part 1: Pip's sensors and one neuron
    const sens = L17.raster(svg, { ...G, x: 64, w: 860, labW: 148, y: 12, rows: 3, labs: A.labs });
    const outR = L17.raster(svg, { ...G, x: 64, w: 860, labW: 148, y: 230, rows: 1, labs: ["neuron"], time: true });
    const brk = svg.appendChild(
      V.s("path", {
        d: "M58 44 H30 V172 H58 M30 108 V228",
        fill: "none",
        "stroke-width": 4,
        "stroke-linejoin": "round",
      }),
    );
    brk.style.stroke = "var(--line-2)";
    const brkHead = L13.arrow(svg, { tone: "grey", w: 4, head: 14 });
    const neuron = L17.node(svg, { x: 30, y: 262, r: 22, lab: "" });

    // part 2: rate code rows
    const rate = L17.raster(svg, { ...G, y: 12, rows: 3, labs: ["dim (2)", "medium (5)", "bright (9)"] });

    // part 3: demo row and slider
    const demo = L17.raster(svg, { ...G, y: 300, rows: 1, labs: ["light 2"], time: true });
    const TR = { x0: 212, x1: 854, y: 450 };
    const sx = (s) => TR.x0 + ((TR.x1 - TR.x0) * s) / 10;
    const track = svg.appendChild(V.s("line", { x1: TR.x0, x2: TR.x1, y1: TR.y, y2: TR.y, "stroke-width": 10 }));
    track.setAttribute("stroke-linecap", "round");
    track.style.stroke = "var(--line-2)";
    const slLab = L17.text(svg, { x: 12, y: TR.y + 10, text: "strength" });
    const ends = [0, 10].map((s) =>
      L17.text(svg, { x: sx(s), y: TR.y + 52, text: String(s), anchor: "middle", tone: "grey" }),
    );
    const knob = L17.dot(svg, 22, "blue");
    const note = L13.label(stage, {
      x: 12,
      y: 540,
      w: 912,
      text: "strength s out of 10 gives s spikes in 20 steps",
      tone: "blue",
    });

    return (t) => {
      // part 1
      const k1 = ramp(t, 0.2, 0.5) * (1 - ramp(t, 3.0, 3.3));
      const up1 = 20 * clamp((t - 0.4) / 2.4);
      sens.o(k1);
      outR.o(k1);
      A.ins.forEach((tr, i) => sens.set(i, { train: tr, upto: up1, lab: A.labs[i] }));
      sens.head({ upto: up1, o: t < 2.9 ? 1 : 0 });
      outR.set(0, { train: A.out, upto: up1, tone: "blue", lab: "neuron", labTone: "blue" });
      L17.vis(brk, k1);
      brkHead.set({ a: [30, 200], b: [30, 238], o: k1 });
      neuron.set({
        tone: "blue",
        k: k1,
        s: 1 + 0.2 * [8, 14, 20].reduce((a, s) => a + V.flash(up1, s - 0.5, s + 0.7), 0),
      });
      // part 2
      const k2 = ramp(t, 3.2, 3.5);
      const up2 = 20 * clamp((t - 3.4) / 2.4);
      rate.o(k2);
      const cntK = ramp(t, 6.0, 6.4);
      L17.RATE.forEach((tr, i) =>
        rate.set(i, {
          train: tr,
          upto: up2,
          cnt: String(n(tr)),
          cntO: cntK,
          labTone: cntK > 0.5 ? "orange" : undefined,
        }),
      );
      rate.head({ upto: up2, o: t > 3.3 && t < 5.9 ? 1 : 0 });
      // part 3
      const k3 = ramp(t, 8.8, 9.2);
      const s = 2 + Math.min(7, Math.floor(clamp((t - 8.9) / 2.1) * 8));
      demo.o(k3);
      demo.set(0, { train: L17.encode(s, "rate"), lab: `light ${s}`, labTone: "blue", cnt: String(s) });
      [track].forEach((e) => L17.vis(e, k3));
      slLab.set({ o: k3 });
      ends.forEach((e) => e.set({ o: k3 }));
      knob.setAttribute("cx", sx(s).toFixed(1));
      knob.setAttribute("cy", TR.y);
      L17.vis(knob, k3);
      note.set({ k: ramp(t, 9.4, 9.8) });
    };
  },
});

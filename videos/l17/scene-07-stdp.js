/* Lecture 17 video, scene 07-stdp: spike-timing-dependent plasticity (lesson 17.4, L17.STDP = the kernel's stdp rule over 8
   steps). Pre fires one step before post: +1 (potentiation); post fires one step before pre: -1 (depression).
   Run 1: pre at 2 and 5, post at 3 and 6: w 0 -> 1 -> 2. Run 2: pre at 3 and 6, post at 2 and 5: w 0 -> -1 -> -2.
   Layout (stage px): pre neuron (blue, 130, 96) and post neuron (orange, 620, 96), r 46, with 'sender (whisker)' and
   'receiver (stop!)' under them; the synapse arrow between them (thickness and colour follow w), the 'synapse' label
   under it and the weight tag 'w = n' above it; the tag 'potentiation' / 'depression' at x 700, y 70. Rasters (8 steps,
   x 12..924, labels 150 px): 'pre' at y 196 (blue ticks), 'post' at y 316 (orange ticks); between them a curved arrow per
   pair (green +1 or red -1). Bottom (y 450..628): a green card 'STDP' and a grey card 'Backprop (Lecture 16)'.
   Story (local seconds): 0.4 neurons, synapse and labels; 3.2..5.6 run 1 draws under a playhead, each pair's arrow and
   +1 appear as its second spike lands, w steps up, the synapse thickens and turns green, 5.8 'potentiation'; 7.4 run 1
   clears, 7.6..10.0 run 2 the same way with red -1 arrows, the synapse thins and turns red, 'depression'; 10.6 the two
   cards; hold to 14. */
VID.scene({
  kicker: "FIRE FIRST, GET CLOSER",
  title: ["Spike order", "sets the strength"],
  dur: 14,
  caps: [
    [0.4, 3.0, "A synapse links a pre-synaptic sender to a post-synaptic receiver."],
    [3.2, 7.2, "Pre fires just before post: strengthen. Potentiation."],
    [7.4, 10.4, "Post fires before pre: weaken. Depression."],
    [10.6, 13.7, "No labels needed: STDP is unsupervised learning."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L17 = V.l17;
    const { ramp, clamp } = V;
    const S = L17.STDP;
    L17.same([S.plus.R.w, S.minus.R.w], [2, -2], "scene 7: final weights");
    const RUNS = [
      { ...S.plus, a: 3.2, b: 5.6, show: [3.1, 7.4], tone: "green", word: "potentiation" },
      { ...S.minus, a: 7.6, b: 10.0, show: [7.5, 99], tone: "red", word: "depression" },
    ];
    // each run's pairs: [first step, second step] from the rule's log (a change lands at log[t] != 0)
    RUNS.forEach((r) => {
      r.pairs = r.R.log.map((d, i) => (d ? { at: i + 1, d } : null)).filter(Boolean);
      L17.same(
        r.pairs.map((p) => p.d),
        r.R.w > 0 ? [1, 1] : [-1, -1],
        "scene 7: pair changes",
      );
    });

    const cardS = L17.card(stage, {
      x: 12,
      y: 450,
      w: 540,
      h: 172,
      text: "STDP: needs only spike timing;\neach synapse updates locally;\nno labels: unsupervised",
      tone: "green",
      plain: false,
    });
    const cardB = L17.card(stage, {
      x: 572,
      y: 450,
      w: 352,
      h: 172,
      text: "Backprop (Lecture 16):\nneeds the right\nanswers",
      tone: "grey",
      plain: false,
    });
    const svg = L17.svg(stage);
    const syn = L13.arrow(svg, { tone: "grey", w: 10, head: 26 });
    const pre = L17.node(svg, { x: 130, y: 96, r: 46, lab: "pre" });
    const post = L17.node(svg, { x: 620, y: 96, r: 46, lab: "post" });
    const preLab = L17.text(svg, { x: 130, y: 178, text: "sender (whisker)", anchor: "middle", tone: "blue" });
    const postLab = L17.text(svg, { x: 620, y: 178, text: "receiver (stop!)", anchor: "middle", tone: "orange" });
    const synLab = L17.text(svg, { x: 375, y: 140, text: "synapse", anchor: "middle", tone: "grey" });
    const wTag = L13.tag(stage, { x: 315, y: 6, text: "w = 0", tone: "grey", solid: true });
    const word = L13.tag(stage, { x: 700, y: 70, text: "potentiation", tone: "green", solid: true });

    const rPre = L17.raster(svg, { y: 196, rows: 1, rh: 70, labW: 150, n: 8, labs: ["pre"] });
    const rPost = L17.raster(svg, { y: 316, rows: 1, rh: 70, labW: 150, n: 8, labs: ["post"] });
    const arcs = [0, 1].map(() => {
      const p = L17.path(svg);
      const lab = L17.text(svg, { x: 0, y: 0, text: "", fs: 34, weight: 900 });
      return { p, lab };
    });

    return (t) => {
      const k0 = ramp(t, 0.4, 0.8);
      pre.set({ tone: "blue", k: k0 });
      post.set({ tone: "orange", k: ramp(t, 0.6, 1.0) });
      preLab.set({ o: ramp(t, 0.8, 1.2) });
      postLab.set({ o: ramp(t, 1.0, 1.4) });
      synLab.set({ o: ramp(t, 1.4, 1.8) });
      const r = t < RUNS[1].show[0] ? RUNS[0] : RUNS[1];
      const op = ramp(t, r.show[0], r.show[0] + 0.3) * (1 - ramp(t, r.show[1] - 0.3, r.show[1]));
      const up = 8 * clamp((t - r.a) / (r.b - r.a));
      rPre.o(ramp(t, 1.8, 2.2));
      rPost.o(ramp(t, 1.8, 2.2));
      rPre.set(0, { train: r.pre, upto: up, tone: "blue", labTone: "blue" });
      rPost.set(0, { train: r.post, upto: up, tone: "orange", labTone: "orange" });
      rPre.head({ upto: up, o: t > r.a - 0.1 && t < r.b + 0.1 ? 1 : 0 });
      rPost.head({ upto: up, o: t > r.a - 0.1 && t < r.b + 0.1 ? 1 : 0 });
      let w = 0;
      r.pairs.forEach((pr, j) => {
        const k = clamp((up - pr.at + 0.5) * 2.5);
        if (k >= 1) w += pr.d;
        const from = pr.d > 0 ? [rPre.colX(pr.at - 1), 196 + 62] : [rPost.colX(pr.at - 1), 316 + 8];
        const to = pr.d > 0 ? [rPost.colX(pr.at), 316 + 10] : [rPre.colX(pr.at), 196 + 60];
        const mx = (from[0] + to[0]) / 2 - 30;
        const my = (from[1] + to[1]) / 2;
        arcs[j].p.set({
          d: `M${from[0].toFixed(1)} ${from[1]} Q${mx.toFixed(1)} ${my} ${to[0].toFixed(1)} ${to[1]}`,
          tone: r.tone,
          w: 6,
          k,
          o: op,
        });
        arcs[j].lab.set({ text: pr.d > 0 ? "+1" : "−1", tone: r.tone, o: op * k });
        arcs[j].lab.el.setAttribute("x", (to[0] + 14).toFixed(1));
        arcs[j].lab.el.setAttribute("y", String(my + 12));
      });
      const wt = t < r.a ? 0 : w;
      const tone = wt > 0 ? "green" : wt < 0 ? "red" : "grey";
      syn.set({ a: [184, 96], b: [566, 96], tone, w: Math.max(4, 10 + 6 * wt), o: ramp(t, 1.2, 1.6) });
      wTag.set({ k: ramp(t, 1.4, 1.8), text: `w = ${wt < 0 ? "−" : ""}${Math.abs(wt)}`, tone });
      const done = t >= r.b + 0.2;
      word.set({
        k: done ? ramp(t, r.b + 0.2, r.b + 0.6) : 0,
        text: r.word,
        tone: r.tone,
        o: t < RUNS[1].show[0] - 0.2 || t >= RUNS[1].show[0] ? 1 : 0,
      });
      cardS.set({ k: ramp(t, 10.6, 11.0) });
      cardB.set({ k: ramp(t, 11.0, 11.4) });
    };
  },
});

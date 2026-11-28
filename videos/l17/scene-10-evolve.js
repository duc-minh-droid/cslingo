/* Lecture 17 video, scene 10-evolve: evolving a spiking network (lesson 17.6, L17.EVO). An evolutionary algorithm can tune an
   SNN's weights, delays, thresholds and structure (neural architecture search); it is often bi-level: structure is the
   upper problem, weights the lower one, and the search switches between them. Cost: 30 networks a generation for 100
   generations is 3000 tests, each already costly; optimising several aspects together is still an open challenge.
   Layout (stage px): left card x 12..452, y 12..312: a small SNN (3-3-2) with the tags 'weights', 'delays', 'thresholds',
   'structure' in its corners; below (y 330..470) three candidate brains with green fitness bars under the label 'how well
   Pip drives' (y 360), later replaced by a grey card (y 330..470). Right: purple box 'Upper: structure' (x 472..924,
   y 12..172) and blue box 'Lower: weights' (y 232..392), each with a mini network (2-3-1) at x 720..900; between them the
   tag 'periodically switch' with a down arrow (x 500) and an up arrow (x 896). Cost rows (x 472..924, y 420 + 70 i): a
   label, then a bar of width 452 * n / 3000 (at least 8 px): green 1, orange 30, red 3000; tag 'expensive' (red).
   Story (local seconds): 0.4 the SNN and its four tags, 1.6 the three candidates and their fitness bars; 3.2 the two boxes;
   upper active 3.6..4.4 (a neuron pops in, a link fades), lower active 4.4..5.2 (link widths change), upper again
   5.2..6.0; 6.0 cost rows every 0.6 s; 8.8 'expensive' and the grey card 'Co-evolving several aspects together: still an
   open challenge' replaces the candidates; hold to 12. */
VID.scene({
  kicker: "LET EVOLUTION DESIGN THE BRAIN",
  title: ["Evolve the structure,", "then the weights"],
  dur: 12,
  caps: [
    [0.4, 3.0, "An EA can tune weights, delays, thresholds and structure."],
    [3.2, 5.8, "Often bi-level: structure upper, weights lower."],
    [6.0, 8.6, "30 networks a generation, 100 generations: 3000 tests."],
    [8.8, 11.7, "Costly, and co-evolving everything at once is still open."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L17 = V.l17;
    const { ramp } = V;
    const E = L17.EVO;
    L17.same([E.pop, E.gens, E.tests], [30, 100, 3000], "scene 10: evolution cost");
    const card = L13.card(stage, { x: 12, y: 12, w: 440, h: 300, text: "", tone: "grey" });
    const up = L13.card(stage, { x: 472, y: 12, w: 452, h: 160, text: "", tone: "purple", plain: false });
    const lo = L13.card(stage, { x: 472, y: 232, w: 452, h: 160, text: "", tone: "blue", plain: false });
    const open = L17.card(stage, {
      x: 12,
      y: 330,
      w: 440,
      h: 150,
      text: "Co-evolving several aspects\ntogether: still an\nopen challenge",
      tone: "grey",
      plain: false,
    });
    const svg = L17.svg(stage);

    // a small network drawer: layers of node counts inside a box; returns nodes and edges
    const net = (x0, y0, w, h, layers, r) => {
      const pos = layers.map((n, li) =>
        Array.from({ length: n }, (_, i) => [x0 + (w * li) / (layers.length - 1), y0 + (h * (i + 0.5)) / n]),
      );
      const edges = [];
      for (let li = 0; li + 1 < layers.length; li++)
        pos[li].forEach((a) => pos[li + 1].forEach((b) => edges.push({ a, b, w: L17.wire(svg) })));
      const nodes = pos.flat().map(([x, y]) => L17.node(svg, { x, y, r }));
      return { edges, nodes };
    };
    const big = net(130, 70, 200, 190, [3, 3, 2], 20);
    const ASPECTS = [
      ["weights", 24, 24],
      ["delays", 270, 24],
      ["thresholds", 24, 252],
      ["structure", 252, 252],
    ];
    const asp = ASPECTS.map(([text, x, y]) => L13.tag(stage, { x, y, text, tone: "purple" }));
    const fitLab = L13.label(stage, { x: 12, y: 330, w: 440, text: "how well Pip drives" });
    const cands = [0, 1, 2].map((i) => net(52 + 150 * i, 380, 70, 50, [2, 2, 1], 9));
    const FIT = [0.5, 0.9, 0.3];
    const bars = FIT.map((f, i) => {
      const r = svg.appendChild(V.s("rect", { x: 22 + 150 * i, y: 446, height: 18, rx: 8 }));
      r.style.fill = L13.tone("green").c;
      return { r, w: 130 * f };
    });
    const upLab = L17.text(svg, { x: 492, y: 104, text: "Upper: structure", tone: "purple", weight: 900 });
    const loLab = L17.text(svg, { x: 492, y: 324, text: "Lower: weights", tone: "blue", weight: 900 });
    const upNet = net(740, 32, 150, 120, [2, 3, 1], 13);
    const extra = L17.node(svg, { x: 890, y: 140, r: 13 });
    const loNet = net(740, 252, 150, 120, [2, 3, 1], 13);
    const sw = L13.tag(stage, { x: 560, y: 176, text: "periodically switch", tone: "grey" });
    const down = L13.arrow(svg, { tone: "purple", w: 6, head: 18 });
    const upA = L13.arrow(svg, { tone: "blue", w: 6, head: 18 });

    const COST = [
      ["one SNN test: 1", 1, "green"],
      [`a generation, ${E.pop} SNNs: ${E.pop}`, E.pop, "orange"],
      [`${E.gens} generations: ${E.tests}`, E.tests, "red"],
    ];
    const rows = COST.map(([text, n, tone], i) => {
      const y = 420 + 70 * i;
      const lab = L17.text(svg, { x: 472, y: y + 26, text, tone });
      const r = svg.appendChild(V.s("rect", { x: 472, y: y + 38, height: 22, rx: 8 }));
      r.style.fill = L13.tone(tone).c;
      return { lab, r, w: Math.max(8, (452 * n) / E.tests) };
    });
    const exp = L13.tag(stage, { x: 748, y: 418, text: "expensive", tone: "red", solid: true });

    return (t) => {
      card.set({ k: ramp(t, 0.3, 0.6) });
      const kn = ramp(t, 0.4, 0.8);
      big.edges.forEach((e) => e.w.set({ a: e.a, b: e.b, w: 3, o: kn }));
      big.nodes.forEach((n, i) => n.set({ k: L13.seq(t, 0.4, 0.04, 0.3, i), tone: i === 4 ? "orange" : "grey" }));
      asp.forEach((a, i) => a.set({ k: L13.seq(t, 0.8, 0.3, 0.4, i) }));
      // candidates, replaced at 8.8
      const kc = ramp(t, 1.6, 2.0) * (1 - ramp(t, 8.6, 8.9));
      fitLab.set({ k: kc });
      cands.forEach((c, i) => {
        c.edges.forEach((e) => e.w.set({ a: e.a, b: e.b, w: 2, o: kc }));
        c.nodes.forEach((n) => n.set({ k: kc }));
        bars[i].r.setAttribute("width", (bars[i].w * ramp(t, 2.0 + 0.2 * i, 2.6 + 0.2 * i)).toFixed(1));
        L17.vis(bars[i].r, kc);
      });
      open.set({ k: ramp(t, 9.0, 9.4) });
      // bi-level
      const kb = ramp(t, 3.2, 3.6);
      const active = t < 3.6 ? "" : t < 4.4 ? "up" : t < 5.2 ? "lo" : t < 6.0 ? "up" : "";
      up.set({ k: kb, plain: active !== "up" });
      lo.set({ k: ramp(t, 3.3, 3.7), plain: active !== "lo" });
      upLab.set({ o: kb });
      loLab.set({ o: ramp(t, 3.3, 3.7) });
      const grow = ramp(t, 3.8, 4.2);
      const cut = ramp(t, 3.9, 4.3);
      upNet.edges.forEach((e, i) => e.w.set({ a: e.a, b: e.b, w: 3, tone: "purple", o: kb * (i === 2 ? 1 - cut : 1) }));
      upNet.nodes.forEach((n) => n.set({ k: kb, tone: "purple", solid: false }));
      extra.set({ k: grow * kb, tone: "purple" });
      const wob = ramp(t, 4.4, 5.2);
      loNet.edges.forEach((e, i) =>
        e.w.set({ a: e.a, b: e.b, w: 3 + 5 * wob * (0.5 + 0.5 * Math.sin(i * 2.1)), tone: "blue", o: kb }),
      );
      loNet.nodes.forEach((n) => n.set({ k: kb, tone: "blue", solid: false }));
      sw.set({ k: ramp(t, 3.6, 4.0) });
      down.set({ a: [520, 176], b: [520, 228], k: ramp(t, 4.3, 4.6), o: active === "lo" ? 1 : 0.35 });
      upA.set({ a: [900, 228], b: [900, 176], k: ramp(t, 5.1, 5.4), o: active === "up" && t > 5.2 ? 1 : 0.35 });
      // costs
      rows.forEach((r, i) => {
        const k = ramp(t, 6.0 + 0.6 * i, 6.4 + 0.6 * i);
        r.lab.set({ o: k });
        r.r.setAttribute("width", (r.w * ramp(t, 6.1 + 0.6 * i, 6.7 + 0.6 * i, V.ease.out)).toFixed(1));
        L17.vis(r.r, k);
      });
      exp.set({ k: ramp(t, 8.8, 9.2) });
    };
  },
});

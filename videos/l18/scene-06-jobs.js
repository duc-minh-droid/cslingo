/* Lecture 18 video, scene 06-jobs: what neuromorphic chips are good for (lesson 18.2), four quadrants filling in turn.
   Top left: graph algorithms, lesson 18.1's six-node network (L18.NET) with the route A B D E lighting blue hop by hop.
   Top right: optimisation, four tags (constraint satisfaction, QUBO, optimal control, Bayesian optimisation) and a note on
   LASSO. Bottom left: Markov chain random walkers, a hedgehog hops between four flower beds (each bed a neuron that spikes
   purple when the walker arrives; the hops come from L18.rng(5)). Bottom right: signal processing, a wave becomes purple
   spikes, then a green car and alarm bell: 'steer, or raise an alarm'.
   Layout (stage px): quadrants 450 x 306 at (12, 12), (474, 12), (12, 322), (474, 322), each a grey panel with a bold title.
   Story (local seconds): quadrants at 0.4 / 3.2 / 6.0 / 8.8; route hops at 1.2 + 0.5 i; optimisation tags 3.5 + 0.35 i,
   note 5.0; hops every 0.55 s from 6.6; signal: wave 9.1, spikes 9.7, icons 10.3, tag 10.8; hold to 12. */
VID.scene({
  kicker: "JOBS THAT LOOK LIKE NETWORKS",
  title: ["Graphs, optimisation,", "walkers and signals"],
  dur: 12,
  caps: [
    [0.4, 3.0, "Graph algorithms: routing messages through a network."],
    [3.2, 5.8, "Optimisation: constraint satisfaction, QUBO, optimal control."],
    [6.0, 8.6, "Random walkers hop between neurons that stand for states."],
    [8.8, 11.7, "Signal processing: steering vehicles, detecting seizures."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L18 = V.l18;
    const { ramp, flash } = V;
    const Q = [
      [12, 12],
      [474, 12],
      [12, 322],
      [474, 322],
    ];
    const AT = [0.4, 3.2, 6.0, 8.8];
    const svg = V.l5.svg(stage, 936, 640);
    const panels = Q.map(([x, y]) => L18.rect(svg, { x, y, w: 450, h: 306, rx: 20, tone: "grey" }));
    const titles = ["Graph algorithms", "Optimisation", "Markov chain random walkers", "Signal processing"].map(
      (text, i) => L13.label(stage, { x: Q[i][0] + 18, y: Q[i][1] + 12, w: 420, text, align: "left", bold: true }),
    );

    // graph
    const { nodes, edges, route } = L18.NET;
    const P = (k) => [Q[0][0] + 30 + nodes[k][0], Q[0][1] + 60 + nodes[k][1] * 1.3];
    const g1 = svg.appendChild(V.s("g", {}));
    const routeEdges = route
      .slice(1)
      .map((b, i) => edges.findIndex(([p, q]) => [p, q].sort().join() === [route[i], b].sort().join()));
    L18.same(
      routeEdges.every((i) => i >= 0),
      true,
      "scene 6: route edges exist",
    );
    const eLines = edges.map(([a, b]) => L18.line(g1, P(a), P(b), "grey", 6));
    const nDots = Object.keys(nodes).map((k) => L18.circ(g1, ...P(k), 22, "grey", "dim"));
    const nLabs = Object.keys(nodes).map((k) => L13.label(stage, { x: P(k)[0] - 22, y: P(k)[1] - 21, w: 44, text: k }));

    // optimisation
    const OPT = [
      ["constraint satisfaction", 0, 54],
      ["QUBO", 0, 112],
      ["optimal control", 140, 112],
      ["Bayesian optimisation", 0, 170],
    ];
    const tags = OPT.map(([text, dx, dy]) =>
      L13.tag(stage, { x: Q[1][0] + 18 + dx, y: Q[1][1] + dy, text, tone: "blue" }),
    );
    const lasso = L13.label(stage, {
      x: Q[1][0] + 18,
      y: Q[1][1] + 228,
      w: 420,
      text: "LASSO: solved with\na spiking network",
      align: "left",
    });
    lasso.el.style.whiteSpace = "pre-line";
    lasso.el.style.lineHeight = "1.15";

    // walkers
    const BED = [
      [100, 120],
      [330, 120],
      [330, 250],
      [100, 250],
    ].map(([x, y]) => [Q[2][0] + x, Q[2][1] + y]);
    const g3 = svg.appendChild(V.s("g", {}));
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 2],
    ].forEach(([a, b]) => L18.line(g3, BED[a], BED[b], "grey", 4));
    const beds = BED.map(([x, y]) => L18.circ(g3, x, y, 30, "green", "dim"));
    const r = L18.rng(5);
    const HOPS = [0];
    for (let i = 0; i < 8; i++) {
      const opts = [0, 1, 2, 3].filter((b) => b !== HOPS[HOPS.length - 1]);
      HOPS.push(opts[Math.floor(r() * opts.length)]);
    }
    const hog = L18.hedgehog(g3, 0, 0, 0.55);
    const bedTag = L13.tag(stage, { x: Q[2][0] + 150, y: Q[2][1] + 160, text: "bed = neuron", tone: "purple" });

    // signal
    const g4 = svg.appendChild(V.s("g", {}));
    const [sx, sy] = Q[3];
    const wave = L18.wave(g4, sx + 20, sy + 130, 130, 34, "blue");
    const sp = [0, 1, 2, 3, 4].map((i) => L18.spike(g4, sx + 214 + i * 16, sy + 156, i % 2 ? 34 : 52));
    const a1 = L13.arrow(svg, { tone: "grey", w: 5, head: 16 });
    const a2 = L13.arrow(svg, { tone: "grey", w: 5, head: 16 });
    const car = L18.car(g4, sx + 370, sy + 92, 0.9, "green");
    const alarm = L18.bell(g4, sx + 370, sy + 186, 0.7, "green");
    const sTag = L13.tag(stage, { x: sx + 18, y: sy + 240, text: "steer, or raise an alarm", tone: "green" });

    return (t) => {
      panels.forEach((p, i) => L18.op(p, ramp(t, AT[i], AT[i] + 0.4)));
      titles.forEach((l, i) => l.set({ k: ramp(t, AT[i] + 0.1, AT[i] + 0.5) }));
      // graph: the route lights hop by hop
      L18.op(g1, ramp(t, 0.5, 0.9));
      const hop = Math.floor((t - 1.2) / 0.5);
      eLines.forEach((l, i) => {
        const n = routeEdges.indexOf(i);
        const lit = n >= 0 && hop >= n + 1;
        l.style.stroke = lit ? L13.tone("blue").c : "var(--line-2)";
        l.setAttribute("stroke-width", lit ? 9 : 6);
      });
      Object.keys(nodes).forEach((k, i) => {
        const lit = route.indexOf(k) >= 0 && hop >= route.indexOf(k);
        L18.paint(nDots[i], lit ? "blue" : "grey", lit ? "c" : "dim");
        nLabs[i].set({ k: ramp(t, 0.5, 0.9), bold: lit });
        nLabs[i].el.style.color = lit ? L13.tone("blue").on : "";
      });
      // optimisation
      tags.forEach((g, i) => g.set({ k: ramp(t, 3.5 + 0.35 * i, 3.9 + 0.35 * i) }));
      lasso.set({ k: ramp(t, 5.0, 5.4) });
      // walkers
      L18.op(g3, ramp(t, 6.1, 6.5));
      const j = Math.max(0, Math.min(HOPS.length - 1, Math.floor((t - 6.6) / 0.55) + 1));
      const f = t < 6.6 ? 0 : V.ease.inOut(V.clamp(((t - 6.6) % 0.55) / 0.35));
      const from = BED[HOPS[Math.max(0, j - 1)]],
        to = BED[HOPS[j]];
      const cur = j === 0 ? BED[0] : [V.lerp(from[0], to[0], f), V.lerp(from[1], to[1], f)];
      hog.setAttribute("transform", `translate(${(cur[0] - 6).toFixed(1)} ${(cur[1] + 10).toFixed(1)})`);
      beds.forEach((b, i) => {
        const here = HOPS[j] === i && f >= 1;
        L18.paint(b, here ? "purple" : "green", here ? "c" : "dim");
      });
      bedTag.set({ k: ramp(t, 7.0, 7.4) });
      // signal
      L18.op(g4, ramp(t, 8.9, 9.2));
      wave.style.strokeDasharray = "600";
      wave.style.strokeDashoffset = (600 * (1 - ramp(t, 9.1, 9.7))).toFixed(1);
      sp.forEach((s, i) => L18.op(s, ramp(t, 9.7 + 0.1 * i, 9.9 + 0.1 * i)));
      a1.set({ a: [sx + 160, sy + 130], b: [sx + 200, sy + 130], k: ramp(t, 9.5, 9.7) });
      a2.set({ a: [sx + 294, sy + 140], b: [sx + 318, sy + 140], k: ramp(t, 10.2, 10.4) });
      V.place(car, { s: 0.7 + 0.3 * ramp(t, 10.3, 10.6, V.ease.back), o: ramp(t, 10.3, 10.5) });
      V.place(alarm, {
        s: (0.7 + 0.3 * ramp(t, 10.5, 10.8, V.ease.back)) * (1 + 0.1 * flash(t, 11.0, 11.4)),
        o: ramp(t, 10.5, 10.7),
      });
      sTag.set({ k: ramp(t, 10.8, 11.2) });
    };
  },
});

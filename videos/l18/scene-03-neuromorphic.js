/* Lecture 18 video, scene 03-neuromorphic: in a neuromorphic computer the synapses both store and compute (each green synapse
   carries a tiny memory cell); there is no program as such, the synapse structure sets what it does; inputs are spikes whose
   timing and magnitude carry information (lesson 18.1's spike trains, L18.RASTER); the term began in the 1980s.
   Layout (stage px): ghost von Neumann (grey Processor / Memory boxes, 'Program' tag) at x 12..232, y 12..250; the network
   (two inputs, two middle neurons, one output, six green synapses with memory cells) at x 300..880, y 30..230; structure tag
   at y 262; raster rows at y 380 / 450 / 520 (time 0..13 across x 200..876) with its tag at y 560; at 9.6 the raster fades and
   the 1980s -> today timeline takes its place (cards at y 360..540).
   Story (local seconds): 0.4 ghost, network neurons pop, synapses draw, memory cells pop; 3.2 'Program' fades, structure tag,
   a-c and d-e thicken, b-c thins; 6.0 a playhead sweeps the raster (6.2..8.2) and drops the purple spikes, 8.4 its tag;
   9.6 the timeline (two cards and an arrow); hold to 13. */
VID.scene({
  kicker: "A CHIP MADE OF NEURONS",
  title: ["Synapses store", "and compute"],
  dur: 13,
  caps: [
    [0.4, 3.0, "In a neuromorphic computer, synapses store data and process it."],
    [3.2, 5.8, "No program as such: the synapse structure sets what it does."],
    [6.0, 9.4, "Inputs are spikes; their timing and magnitude carry information."],
    [9.6, 12.7, "The term began in the 1980s; today it covers many brain-inspired ideas."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L18 = V.l18;
    const { ramp, lerp } = V;
    const R = L18.RASTER;
    L18.same(
      R.map((r) => r[1].length),
      [4, 2, 5],
      "scene 3: spikes per neuron",
    );
    const svg = V.l5.svg(stage, 936, 640);

    // ghost von Neumann
    const ghost = svg.appendChild(V.s("g", {}));
    L18.rect(ghost, { x: 12, y: 12, w: 220, h: 80, rx: 16, tone: "grey", fill: "dim" });
    L18.rect(ghost, { x: 12, y: 112, w: 220, h: 80, rx: 16, tone: "grey", fill: "dim" });
    L18.line(ghost, [122, 92], [122, 112], "grey", 6);
    const gl = ["Processor", "Memory"].map((text, i) =>
      L13.label(stage, { x: 12, y: 32 + 100 * i, w: 220, text, tone: "grey" }),
    );
    const prog = L13.tag(stage, { x: 40, y: 206, text: "Program", tone: "grey" });

    // network
    const N = { a: [320, 50], b: [320, 210], c: [600, 40], d: [600, 220], e: [860, 130] };
    const SYN = [
      ["a", "c", 1, 0.5],
      ["a", "d", 0, 0.3],
      ["b", "c", -1, 0.7],
      ["b", "d", 0, 0.5],
      ["c", "e", 0, 0.5],
      ["d", "e", 1, 0.5],
    ];
    const syn = SYN.map(([p, q]) => L18.line(svg, N[p], N[q], "green", 7));
    const cells = SYN.map(([p, q, , f]) => {
      const m = [lerp(N[p][0], N[q][0], f), lerp(N[p][1], N[q][1], f)];
      return L18.rect(svg, { x: m[0] - 13, y: m[1] - 13, w: 26, h: 26, rx: 5, tone: "green", fill: "c", sw: 3 });
    });
    const neu = Object.values(N).map(([x, y]) => L18.circ(svg, x, y, 26, "green", "dim"));
    const struct = L13.tag(stage, {
      x: 250,
      y: 262,
      text: "who connects to whom, how strongly",
      tone: "green",
      solid: true,
    });

    // raster
    const X = (u) => 200 + u * 52;
    const ROWY = [380, 450, 520];
    const raster = svg.appendChild(V.s("g", {}));
    const rl = R.map(([name], i) => L13.label(stage, { x: 12, y: ROWY[i] - 34, w: 170, text: name, align: "left" }));
    ROWY.forEach((y) => L18.line(raster, [X(0), y], [X(13), y], "grey", 4));
    const ticks = R.flatMap(([, ts], i) => ts.map((u, k) => [u, L18.spike(raster, X(u), ROWY[i], k % 2 ? 36 : 54)]));
    const head = L18.line(svg, [0, 320], [0, 540], "grey", 4);
    const rtag = L13.tag(stage, { x: 200, y: 556, text: "timing and magnitude carry information", tone: "purple" });

    // timeline
    const c1 = L18.card(stage, {
      x: 12,
      y: 360,
      w: 400,
      h: 180,
      text: "1980s:\nmixed analogue-\ndigital chips",
      tone: "grey",
    });
    const c2 = L18.card(stage, {
      x: 500,
      y: 360,
      w: 424,
      h: 180,
      text: "Today: a broad\nfamily of brain-\ninspired techniques",
      tone: "green",
    });
    const arr = L13.arrow(svg, { tone: "grey", w: 7, head: 22 });

    return (t) => {
      const gk = ramp(t, 0.4, 0.8);
      L18.op(ghost, gk * (1 - 0.35 * ramp(t, 1.0, 1.6)));
      gl.forEach((l) => l.set({ k: gk }));
      prog.set({ k: gk * (1 - ramp(t, 3.2, 3.6)) });
      neu.forEach((n, i) => V.place(n, { s: 0.5 + 0.5 * ramp(t, 0.5 + 0.12 * i, 0.9 + 0.12 * i, V.ease.back) }));
      neu.forEach((n, i) => L18.op(n, ramp(t, 0.5 + 0.12 * i, 0.7 + 0.12 * i)));
      syn.forEach((l, i) => {
        L18.op(l, ramp(t, 1.0 + 0.1 * i, 1.4 + 0.1 * i));
        const w = SYN[i][2];
        l.setAttribute("stroke-width", lerp(7, w > 0 ? 15 : w < 0 ? 3 : 7, ramp(t, 3.6, 4.2)).toFixed(1));
      });
      cells.forEach((c, i) => L18.op(c, ramp(t, 1.8 + 0.1 * i, 2.1 + 0.1 * i)));
      struct.set({ k: ramp(t, 3.4, 3.8) });

      const out = 1 - ramp(t, 9.4, 9.8);
      const rk = ramp(t, 6.0, 6.4) * out;
      L18.op(raster, rk);
      rl.forEach((l) => l.set({ k: rk }));
      const u = 13 * ramp(t, 6.2, 8.2, V.ease.lin);
      ticks.forEach(([at, el]) => L18.op(el, ramp(u, at, at + 0.4)));
      head.setAttribute("x1", X(u).toFixed(1));
      head.setAttribute("x2", X(u).toFixed(1));
      L18.op(head, ramp(t, 6.2, 6.4) * (1 - ramp(t, 8.2, 8.5)));
      rtag.set({ k: ramp(t, 8.4, 8.8) * out });

      c1.set({ k: ramp(t, 9.8, 10.2) });
      c2.set({ k: ramp(t, 10.6, 11.0) });
      arr.set({ a: [420, 450], b: [490, 450], k: ramp(t, 10.2, 10.6), tone: "grey" });
    };
  },
});

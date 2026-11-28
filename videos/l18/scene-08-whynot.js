/* Lecture 18 video, scene 08-whynot: why neuromorphic computing is not mainstream yet (lesson 18.3). Deep learning (blue)
   still wins on results, neuromorphic (green) wins on energy against edge GPUs; few machines, special-purpose simulators
   and long training (red strip); no shared benchmark that uses timing (a race track: the deep-learning lane has its
   ImageNet stopwatch, the neuromorphic lane has none); networks wired by hand, neuron by neuron (a cursor draws the nine
   arrows of a six-neuron network a, b -> c, d, e -> f), which is error prone, so examples lean on graph problems.
   Layout (stage px): top band y 12..200: Deep learning card x 12..300, Neuromorphic card x 636..924, middle x 312..624 two
   rows 'results' (y 40) and 'energy' (y 120) with a tick on the winning side. Red strip y 222 (three tags and arrows). Left
   half x 12..452, y 320..628: two race lanes and the red 'no shared benchmark' card. Right half x 468..924: the network
   (y 330..480) and two tags at y 500 / 562.
   Story (local seconds): 0.4 cards, 1.2 results row, 2.0 energy row; 3.2 strip tags 3.4 + 0.6 i; 6.0 lanes, 6.3 the stopwatch
   and ImageNet (it pulses at 7.8), 6.5 an empty dashed slot in the neuromorphic lane, 8.2 the red card; 9.4 neurons, arrows 9.8 + 0.2 i with the cursor, tags 11.6 / 12.0; hold. */
VID.scene({
  kicker: "SO WHY ISN'T HOGLET NEUROMORPHIC YET?",
  title: ["Promising,", "but not there yet"],
  dur: 13,
  caps: [
    [0.4, 3.0, "Deep learning still wins on results; neuromorphic wins on energy."],
    [3.2, 5.8, "Little hardware and software to use, and long training times."],
    [6.0, 9.2, "No benchmark suite that tests the time aspect."],
    [9.4, 12.7, "Networks are wired neuron by neuron, which is error prone."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L18 = V.l18;
    const L5 = V.l5;
    const { ramp } = V;
    const dl = L18.card(stage, {
      x: 12,
      y: 12,
      w: 288,
      h: 188,
      text: "Deep learning\nusually better\nresults today",
      tone: "blue",
    });
    const nm = L18.card(stage, {
      x: 636,
      y: 12,
      w: 288,
      h: 188,
      text: "Neuromorphic\nfar less energy\nthan edge GPUs",
      tone: "green",
    });
    const rows = ["results", "energy"].map((text, i) =>
      L13.label(stage, { x: 372, y: 36 + 90 * i, w: 192, text, bold: true }),
    );
    const svg = V.l5.svg(stage, 936, 640);
    const ticks = [svg.appendChild(L5.tick(340, 56, 48, "blue")), svg.appendChild(L5.tick(596, 146, 48, "green"))];
    // red strip
    const W = (s) => Math.round(s.length * 14.6 + 40);
    const STRIP = ["Few machines", "One-purpose simulators", "Long training"];
    let sx = 12;
    const strip = STRIP.map((text) => {
      const tag = L13.tag(stage, { x: sx, y: 222, text, tone: "red", solid: true });
      const x0 = sx;
      sx += W(text) + 60;
      return { tag, x0, x1: x0 + W(text) };
    });
    const sArr = [0, 1].map(() => L13.arrow(svg, { tone: "red", w: 5, head: 16 }));
    // race track
    const lanes = [
      [320, "blue", "deep learning"],
      [400, "green", "neuromorphic"],
    ].map(([y, tone, text]) => ({
      r: L18.rect(svg, { x: 12, y, w: 440, h: 70, rx: 18, tone, fill: "dim", sw: 4 }),
      l: L13.label(stage, { x: 28, y: y + 16, w: 200, text, tone, align: "left", bold: true }),
    }));
    const watch = L18.watch(svg, 262, 360, 22, "blue");
    const imnet = L13.label(stage, { x: 296, y: 336, w: 150, text: "ImageNet", tone: "blue", align: "left" });
    const none = L18.circ(svg, 262, 435, 22, "grey", "none");
    none.setAttribute("stroke-dasharray", "8 6");
    const noBench = L18.card(stage, {
      x: 12,
      y: 492,
      w: 440,
      h: 96,
      text: "no shared benchmark\nthat uses timing",
      tone: "red",
      plain: false,
    });
    // hand-wired network
    const N = { a: [510, 360], b: [510, 450], c: [690, 330], d: [690, 405], e: [690, 480], f: [870, 405] };
    const E = ["ac", "ad", "ae", "bc", "bd", "be", "cf", "df", "ef"];
    const arrows = E.map(() => L13.arrow(svg, { tone: "purple", w: 5, head: 16 }));
    const dots = Object.values(N).map(([x, y]) => L18.circ(svg, x, y, 20, "green", "dim"));
    const nl = Object.entries(N).map(([k, [x, y]]) => L13.label(stage, { x: x - 20, y: y - 20, w: 40, text: k }));
    const cur = L18.cursor(svg, 0, 0, 1);
    const err = L13.tag(stage, { x: 476, y: 512, text: "neuron by neuron: error prone", tone: "red", solid: true });
    const graph = L13.tag(stage, { x: 476, y: 570, text: "graph problems map readily", tone: "green", solid: true });
    const AT = (i) => 9.8 + 0.2 * i;

    return (t) => {
      dl.set({ k: ramp(t, 0.4, 0.8) });
      nm.set({ k: ramp(t, 0.6, 1.0) });
      rows.forEach((r, i) => r.set({ k: ramp(t, 1.2 + 0.8 * i, 1.6 + 0.8 * i) }));
      ticks.forEach((g, i) => L5.drawOn(g, ramp(t, 1.4 + 0.8 * i, 1.9 + 0.8 * i)));
      strip.forEach((s, i) => s.tag.set({ k: ramp(t, 3.4 + 0.6 * i, 3.8 + 0.6 * i) }));
      sArr.forEach((a, i) =>
        a.set({ a: [strip[i].x1 + 6, 248], b: [strip[i + 1].x0 - 6, 248], k: ramp(t, 3.7 + 0.6 * i, 4.0 + 0.6 * i) }),
      );
      lanes.forEach((ln, i) => {
        L18.op(ln.r, ramp(t, 6.0 + 0.2 * i, 6.4 + 0.2 * i));
        ln.l.set({ k: ramp(t, 6.1 + 0.2 * i, 6.5 + 0.2 * i) });
      });
      V.place(watch, { o: ramp(t, 6.3, 6.6), s: 1 + 0.15 * V.flash(t, 7.8, 8.2) });
      imnet.set({ k: ramp(t, 6.4, 6.8) });
      L18.op(none, ramp(t, 6.5, 6.9));
      noBench.set({ k: ramp(t, 8.2, 8.6) });
      // the network, wired by hand
      dots.forEach((d, i) => L18.op(d, ramp(t, 9.4 + 0.05 * i, 9.7 + 0.05 * i)));
      nl.forEach((l, i) => l.set({ k: ramp(t, 9.4 + 0.05 * i, 9.7 + 0.05 * i) }));
      let at = N.a;
      E.forEach((e, i) => {
        const [p, q] = [N[e[0]], N[e[1]]];
        const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const [ux, uy] = [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
        const a = [p[0] + ux * 22, p[1] + uy * 22];
        const b = [q[0] - ux * 24, q[1] - uy * 24];
        const k = ramp(t, AT(i), AT(i) + 0.18, V.ease.lin);
        arrows[i].set({ a, b, k, tone: "purple" });
        if (t >= AT(i)) at = [V.lerp(a[0], b[0], k), V.lerp(a[1], b[1], k)];
      });
      cur.setAttribute("transform", `translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})`);
      L18.op(cur, ramp(t, 9.6, 9.8) * (1 - ramp(t, 11.6, 11.9)));
      err.set({ k: ramp(t, 11.6, 12.0) });
      graph.set({ k: ramp(t, 12.0, 12.4) });
    };
  },
});

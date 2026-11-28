/* Lecture 17 video, scene 02-pip: Pip, a palm-sized garden rover on one coin battery, needs a brain. A conventional ANN
   computes every neuron every step (all twelve glow on every tick, the battery drains); Pip needs quick reactions, low
   power and learning on the go; a spiking network stays quiet and sends one spike when a whisker touches a leaf.
   Layout (stage px): flow strip of three tags (y 12); left card x 12..452, y 100..470 with a 4 x 3 grid of neurons and its
   title; tags under it (y 484); right panel x 472..924: 'coin battery' and the battery gauge (y 110..190), the green card
   'What Pip needs' (y 220..470); Pip drives along the ground line (y 626) towards a leaf at x 850.
   Story (local seconds): 0.4 strip, Pip starts to drive, 0.6 the battery; 3.2 the ANN card, its neurons pulse red on every
   tick (0.5 s) and the battery drains (3.4..8.8), 4.0 three red tags; 6.0 the green card and its three lines; 8.8 the card
   becomes 'Spiking neural network', the neurons go grey, a green tag 'discrete spikes over time' replaces the red tags,
   the battery holds; 9.6 Pip's whisker touches the leaf: one neuron fires orange with a spike tick and Pip stops; hold to 12. */
VID.scene({
  kicker: "A BRAIN FOR A TINY ROBOT",
  title: ["Pip needs a brain", "that sips power"],
  dur: 12,
  caps: [
    [0.4, 3.0, "Pip patrols a garden on one coin battery."],
    [3.2, 5.8, "A conventional ANN computes every neuron, every step."],
    [6.0, 8.6, "Pip needs quick reactions, low power and learning on the go."],
    [8.8, 11.7, "An SNN sends discrete spikes only when needed."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L17 = V.l17;
    const L5 = V.l5;
    const { ramp, clamp } = V;
    const TOUCH = 9.6;

    // cards first (HTML under the svg layer)
    const ann = L13.card(stage, { x: 12, y: 100, w: 440, h: 370, text: "", tone: "red", plain: false });
    const annTitle = L13.label(stage, { x: 12, y: 116, w: 440, text: "Conventional ANN", tone: "red", bold: true });
    const need = L13.card(stage, { x: 472, y: 220, w: 452, h: 250, text: "", tone: "green", plain: false });
    const needTitle = L13.label(stage, { x: 472, y: 236, w: 452, text: "What Pip needs", tone: "green" });
    const batLab = L13.label(stage, { x: 472, y: 130, w: 200, text: "coin battery", align: "left" });

    const svg = L17.svg(stage);
    // flow strip
    const STRIP = ["Whiskers, light, sound", "Pip's brain", "Turn, stop, go"];
    const xs = L17.row(STRIP, 12, 84);
    const strip = STRIP.map((text, i) => L13.tag(stage, { x: xs[i], y: 12, text, tone: ["blue", "grey", "green"][i] }));
    const stripArrows = [0, 1].map(() => L13.arrow(svg, { tone: "grey", w: 5, head: 16 }));
    // neuron grid
    const grid = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 4; c++) grid.push(L17.node(svg, { x: 82 + 100 * c, y: 210 + 90 * r, r: 30 }));
    const FIRE = 5;
    const spikeTick = svg.appendChild(V.s("rect", { x: 220, y: 270, width: 14, height: 48, rx: 4, "stroke-width": 2 }));
    spikeTick.style.fill = L13.tone("orange").c;
    spikeTick.style.stroke = L13.tone("orange").lip;
    // needs
    const NEEDS = ["work only when needed", "quick reactions", "low power, learns on the go"];
    const needLines = NEEDS.map((text, i) => L17.text(svg, { x: 540, y: 324 + 52 * i, text, tone: "green" }));
    const needTicks = NEEDS.map((_, i) => L5.tick(512, 314 + 52 * i, 34, "green"));
    needTicks.forEach((g) => svg.appendChild(g));
    // battery
    const bat = L17.battery(svg, { x: 690, y: 110, w: 210, h: 80 });
    // tags under the card
    const BAD = ["costly to train", "high latency", "energy hungry"];
    const bx = L17.row(BAD, 12, 30, 28, 924);
    const bad = BAD.map((text, i) => L13.tag(stage, { x: bx[i], y: 484, text, tone: "red" }));
    const good = L13.tag(stage, { x: 12, y: 484, text: "discrete spikes over time", tone: "green" });
    // ground, leaf, Pip
    const ground = svg.appendChild(V.s("line", { x1: 12, x2: 924, y1: 628, y2: 628, "stroke-width": 4 }));
    ground.style.stroke = "var(--line-2)";
    const leaf = svg.appendChild(
      V.s("path", { d: "M850 626 C820 600 830 560 880 550 C890 590 880 615 850 626 Z", "stroke-width": 3 }),
    );
    leaf.style.fill = L13.tone("green").c;
    leaf.style.stroke = L13.tone("green").lip;
    const pip = L17.pip(svg);
    const X0 = 90;
    const X1 = 746;

    return (t) => {
      const k0 = ramp(t, 0.3, 0.7);
      strip.forEach((s, i) => s.set({ k: L13.seq(t, 0.3, 0.25, 0.4, i) }));
      stripArrows.forEach((a, i) => {
        const ax = xs[i] + L13.tagW(STRIP[i]) + 32;
        a.set({ a: [ax, 39], b: [xs[i + 1] - 8, 39], k: L13.seq(t, 0.5, 0.25, 0.3, i) });
      });
      // battery
      batLab.set({ k: ramp(t, 0.6, 1.0) });
      const drain = 1 - 0.7 * clamp((t - 3.4) / 5.4);
      bat.set({ level: drain, o: ramp(t, 0.6, 1.0) });
      // ANN card
      const kA = ramp(t, 3.2, 3.6);
      const snn = t >= 8.8;
      ann.set({ k: kA, tone: snn ? "green" : "red" });
      annTitle.set({
        k: ramp(t, 3.3, 3.7),
        text: snn ? "Spiking neural network" : "Conventional ANN",
        tone: snn ? "green" : "red",
        bold: true,
      });
      const tick = Math.floor((t - 3.2) / 0.5);
      const ph = (t - 3.2) / 0.5 - tick;
      grid.forEach((n, i) => {
        const fire = snn && i === FIRE && t >= TOUCH;
        n.set({
          k: L13.seq(t, 3.4, 0.04, 0.35, i),
          tone: snn ? (fire ? "orange" : "grey") : "red",
          s: snn ? 1 + 0.15 * V.flash(t, TOUCH, TOUCH + 0.5) * (fire ? 1 : 0) : 1 + 0.08 * Math.sin(Math.PI * ph),
        });
      });
      L17.vis(spikeTick, snn ? ramp(t, TOUCH, TOUCH + 0.2) : 0);
      bad.forEach((b, i) => b.set({ k: L13.seq(t, 4.0, 0.3, 0.4, i), o: 1 - ramp(t, 8.6, 8.9) }));
      good.set({ k: ramp(t, 9.0, 9.4) });
      // needs
      need.set({ k: ramp(t, 6.0, 6.4) });
      needTitle.set({ k: ramp(t, 6.1, 6.5), bold: true });
      needLines.forEach((l, i) => l.set({ o: L13.seq(t, 6.4, 0.5, 0.4, i) }));
      needTicks.forEach((g, i) => L5.drawOn(g, L13.seq(t, 6.4, 0.5, 0.4, i)));
      // Pip drives until its whisker meets the leaf
      const d = clamp((t - 0.4) / (TOUCH - 0.4));
      const px = X0 + (X1 - X0) * d;
      pip.set({ x: px, y: 626, s: 0.8, o: k0, roll: (px - X0) / 14 });
      L17.vis(leaf, k0);
    };
  },
});

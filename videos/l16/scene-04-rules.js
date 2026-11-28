/* Lecture 16 video, scene 04-rules: lesson 16.1's symbolic AI against connectionism. Nell's rulebook line (IF rain over
   20 mm AND ground wet THEN warn) misses a storm it never imagined (19 mm on soaked ground) and cracks; a network learns
   numbers (weights) instead. Then the trade-offs: symbolic is easy to read but fragile; connectionism handles perception,
   generalises and fails gracefully, but is a black box.
   Layout (stage px): two plain cards x 12..452 and x 484..924, y 12..400, titles at y 26. Left: the rule (blue, y 76, h 130),
   the storm row (y 222..318: cloud icon at (90, 266), labels "rain 19 mm" / "ground soaked"), the red tag "outside its
   scope" (y 330). Right: a 3-4-1 network (inputs x 560, hidden x 700, output x 850) with three weight labels. Tags y 420 /
   484 / 548 under the cards.
   Story (local seconds): 0.3 left card, the rule types in 0.6..2.4; 3.2 the storm row; 4.2 the rule does not fire: red
   crack, the rule card turns red, the tag; 6.0 right card and grey network, 6.6..7.4 wire widths change and the weight
   labels pop, 7.8 inputs blue and the output green; 8.8 tags every 0.25 s; hold to 12. */
VID.scene({
  kicker: "RULES OR LEARNING?",
  title: ["Write the rules,", "or learn the weights"],
  dur: 12,
  caps: [
    [0.4, 3.0, "Symbolic AI: an expert types in IF-THEN rules."],
    [3.2, 5.8, "Easy to read, but fragile outside its scope."],
    [6.0, 8.6, "Connectionism learns numbers, called weights, in a network."],
    [8.8, 11.7, "It generalises and fails gracefully, but is a black box."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L16 = V.l16;
    const { ramp } = V;
    const T = (n) => L13.tone(n);

    const left = L16.card(stage, { x: 12, y: 12, w: 440, h: 388, text: "", tone: "grey" });
    const right = L16.card(stage, { x: 484, y: 12, w: 440, h: 388, text: "", tone: "grey" });
    const titles = [
      L13.label(stage, { x: 12, y: 24, w: 440, text: "Symbolic AI", fs: 32 }),
      L13.label(stage, { x: 484, y: 24, w: 440, text: "Connectionism", fs: 32 }),
    ];
    const RULE = "IF rain over 20 mm\nAND ground wet\nTHEN warn";
    const rule = L16.card(stage, { x: 36, y: 76, w: 392, h: 130, text: "", tone: "blue", fs: 30 });
    rule.el.style.textAlign = "left";
    rule.el.style.justifyContent = "flex-start";
    rule.el.style.padding = "0 24px";
    const stormLab = [
      L13.label(stage, { x: 160, y: 232, w: 270, text: "rain 19 mm", tone: "blue", align: "left" }),
      L13.label(stage, { x: 160, y: 272, w: 270, text: "ground soaked", tone: "blue", align: "left" }),
    ];
    const scope = L13.tag(stage, { x: 36, y: 330, text: "outside its scope", tone: "red", solid: true });
    const svg = V.l5.svg(stage, 936, 640);

    // the storm cloud with three drops
    const cloud = svg.appendChild(V.s("g", {}));
    const cl = cloud.appendChild(
      V.s("path", {
        d: "M58 262 a22 22 0 0 1 8 -40 a28 28 0 0 1 52 -6 a20 20 0 0 1 16 46 Z",
        "stroke-width": 4,
        "stroke-linejoin": "round",
      }),
    );
    cl.style.fill = T("grey").dim;
    cl.style.stroke = T("grey").c;
    [70, 96, 122].forEach((x) => {
      const d = cloud.appendChild(V.s("path", { d: `M${x} 276 l-8 22`, "stroke-width": 6, "stroke-linecap": "round" }));
      d.style.stroke = T("blue").c;
    });
    const crack = svg.appendChild(
      V.s("path", {
        d: "M404 80 L372 118 L398 136 L360 170 L384 186 L352 214",
        fill: "none",
        "stroke-width": 7,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    );
    crack.style.stroke = T("red").c;
    const len = 220;
    crack.setAttribute("stroke-dasharray", `${len} ${len}`);

    // the 3-4-1 network
    const IN = [140, 235, 330].map((y) => [560, y]);
    const HID = [110, 190, 270, 350].map((y) => [700, y]);
    const OUT = [850, 230];
    const WT = [0.8, -0.4, 1.2, 0.3, -0.9, 0.5, 0.2, 1.0, -0.6, 0.7, 0.4, -0.3, 1.1, -0.8, 0.6, 0.9];
    const wires = [];
    IN.forEach((a) => HID.forEach((b) => wires.push({ a, b, w: wires.length })));
    HID.forEach((a) => wires.push({ a, b: OUT, w: wires.length }));
    const wEls = wires.map(() => L16.wire(svg));
    const nIn = IN.map(([x, y]) => L16.node(svg, { x, y, r: 26 }));
    const nHid = HID.map(([x, y]) => L16.node(svg, { x, y, r: 26 }));
    const nOut = L16.node(svg, { x: OUT[0], y: OUT[1], r: 30 });
    const SHOW = [
      [0, -14],
      [13, -16],
      [15, 40],
    ];
    const wLab = SHOW.map(([i, dy]) => {
      const { a, b } = wires[i];
      return L16.text(svg, {
        x: (a[0] + b[0]) / 2,
        y: (a[1] + b[1]) / 2 + dy,
        text: String(WT[i]).replace("-", "−"),
        tone: WT[i] < 0 ? "red" : "purple",
        fs: 28,
        weight: 900,
        halo: true,
      });
    });

    const TAGS = [
      [12, 420, "easy to read", "green"],
      [234, 420, "fragile", "red"],
      [484, 420, "handles perception", "green"],
      [484, 484, "generalises", "green"],
      [484, 548, "fails gracefully", "green"],
      [690, 484, "black box", "grey"],
    ].map(([x, y, text, tone]) => L13.tag(stage, { x, y, text, tone, solid: tone !== "grey" }));

    return (t) => {
      left.set({ k: ramp(t, 0.3, 0.6) });
      titles[0].set({ k: ramp(t, 0.3, 0.6), bold: true });
      const broke = t >= 4.2;
      rule.set({
        k: ramp(t, 0.5, 0.8),
        text: V.type(RULE, ramp(t, 0.6, 2.4, V.ease.lin)),
        tone: broke ? "red" : "blue",
      });
      cloud.setAttribute("opacity", ramp(t, 3.2, 3.6).toFixed(3));
      stormLab.forEach((l, i) => l.set({ k: ramp(t, 3.4 + 0.3 * i, 3.8 + 0.3 * i), bold: true }));
      crack.setAttribute("stroke-dashoffset", (len * (1 - ramp(t, 4.2, 4.7))).toFixed(1));
      crack.setAttribute("opacity", t >= 4.2 ? "1" : "0");
      scope.set({ k: ramp(t, 4.6, 5.0) });

      const kr = ramp(t, 6.0, 6.3);
      right.set({ k: kr });
      titles[1].set({ k: kr, bold: true });
      const kw = ramp(t, 6.6, 7.4);
      const lit = t >= 7.8;
      wires.forEach((q, i) => {
        const v = WT[q.w];
        wEls[i].set({
          a: q.a,
          b: q.b,
          w: 3 + kw * (1 + 5 * Math.abs(v)),
          tone: kw > 0.5 ? (v < 0 ? "red" : "purple") : "grey",
          k: ramp(t, 6.1 + 0.02 * i, 6.5 + 0.02 * i),
        });
      });
      nIn.forEach((n) => n.set({ tone: lit ? "blue" : "grey", k: ramp(t, 6.1, 6.4) }));
      nHid.forEach((n) => n.set({ tone: "grey", k: ramp(t, 6.2, 6.5) }));
      nOut.set({ tone: lit ? "green" : "grey", k: ramp(t, 6.3, 6.6), s: 1 + 0.15 * V.flash(t, 7.8, 8.2) });
      wLab.forEach((l, i) => l.set({ o: ramp(t, 6.8 + 0.2 * i, 7.1 + 0.2 * i) }));
      TAGS.forEach((g, i) => g.set({ k: ramp(t, 8.8 + 0.25 * i, 9.2 + 0.25 * i) }));
    };
  },
});

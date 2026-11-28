/* Lecture 17 video, scene 06-ripple: spikes travel one step at a time (lesson 17.3's propagation figure, L17.PROP). Inputs A
   (fires at steps 1 and 3) and B (2 and 3); A feeds A1, A2 and B feeds B1, B2 one step later; all four feed O (threshold 3)
   one step later. O receives 0, 0, 2, 2, 4 spikes at steps 1..5 and fires only at step 5.
   Layout (stage px): nodes A (90, 170), B (90, 450), A1 (340, 80), A2 (340, 240), B1 (340, 380), B2 (340, 540), O (600, 310),
   r 42; tag 'threshold 3' under O (x 510, y 372); right panel x 636..924: stat 'step' (y 12) and stat 'O gets' (y 110, text
   'n of 3') with a green tick beside it once O fires.
   Story (local seconds): 0.1..0.4 the network draws (grey); steps start at 0.4 / 2.4 / 4.4 / 6.6 / 8.8: the neurons firing
   at that step turn orange (pop), their outgoing wires turn orange and a spike dot runs along each (+0.3..+1.3); the stats
   show the step and what O receives now; at step 5 O fires orange and the tick draws; hold to 13. */
VID.scene({
  kicker: "RIPPLES THROUGH THE NETWORK",
  title: ["Spikes travel", "one step at a time"],
  dur: 13,
  caps: [
    [0.4, 2.2, "t = 1: input A fires."],
    [2.4, 4.2, "t = 2: one step later, both of A's neighbours fire."],
    [4.4, 6.4, "O needs 3 spikes at once. Two is not enough."],
    [6.6, 8.6, "t = 4: A's and B's neighbours fire together."],
    [8.8, 12.7, "t = 5: O gets 4 spikes, crosses its threshold and fires."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L17 = V.l17;
    const L5 = V.l5;
    const { ramp } = V;
    const P = L17.PROP;
    L17.same(
      P.slice(0, 5).map((s) => s.got),
      [0, 0, 2, 2, 4],
      "scene 6: spikes O receives",
    );
    L17.same(
      P.slice(0, 5).map((s) => s.O),
      [false, false, false, false, true],
      "scene 6: O fires at step 5",
    );
    const AT = [0.4, 2.4, 4.4, 6.6, 8.8];
    const POS = {
      A: [90, 170],
      B: [90, 450],
      A1: [340, 80],
      A2: [340, 240],
      B1: [340, 380],
      B2: [340, 540],
      O: [600, 310],
    };
    const EDGES = [
      ["A", "A1"],
      ["A", "A2"],
      ["B", "B1"],
      ["B", "B2"],
      ["A1", "O"],
      ["A2", "O"],
      ["B1", "O"],
      ["B2", "O"],
    ];
    const R = 42;
    const svg = L17.svg(stage);
    const inset = (a, b) => {
      const [p, q] = [POS[a], POS[b]];
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const [ux, uy] = [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
      return [
        [p[0] + ux * R, p[1] + uy * R],
        [q[0] - ux * (R + 4), q[1] - uy * (R + 4)],
      ];
    };
    const wires = EDGES.map(() => L13.arrow(svg, { tone: "grey", w: 6, head: 18 }));
    const dots = EDGES.map(() => L17.dot(svg, 11, "orange"));
    const nodes = Object.fromEntries(
      Object.entries(POS).map(([k, [x, y]]) => [k, L17.node(svg, { x, y, r: R, lab: k })]),
    );
    const thr = L13.tag(stage, { x: 516, y: 372, text: "threshold 3", tone: "grey" });
    const stStep = L13.stat(stage, { x: 636, y: 12, w: 288, label: "step t", tone: "grey" });
    const stGot = L13.stat(stage, { x: 636, y: 110, w: 288, label: "O gets", tone: "grey" });
    const tick = L5.tick(890, 230, 48, "green");
    svg.appendChild(tick);

    return (t) => {
      const k0 = ramp(t, 0.1, 0.4);
      let i = -1;
      AT.forEach((a, j) => {
        if (t >= a) i = j;
      });
      const s = i >= 0 ? P[i] : null;
      const a0 = i >= 0 ? AT[i] : 0;
      Object.entries(nodes).forEach(([k, n]) => {
        const on = s && s[k];
        n.set({ k: k0, tone: on ? "orange" : "grey", s: on ? 1 + 0.15 * V.flash(t, a0, a0 + 0.5) : 1 });
      });
      EDGES.forEach(([a, b], j) => {
        const on = s && s[a];
        const [p, q] = inset(a, b);
        wires[j].set({ a: p, b: q, tone: on ? "orange" : "grey", o: k0 });
        const f = ramp(t, a0 + 0.3, a0 + 1.3, V.ease.inOut);
        dots[j].setAttribute("cx", (p[0] + (q[0] - p[0]) * f).toFixed(1));
        dots[j].setAttribute("cy", (p[1] + (q[1] - p[1]) * f).toFixed(1));
        L17.vis(dots[j], on && f > 0 && f < 1 ? 1 : 0);
      });
      const fired = s && s.O;
      thr.set({ k: ramp(t, 0.3, 0.6), tone: fired ? "orange" : "grey" });
      stStep.set({ k: ramp(t, 0.3, 0.6), text: String(i + 1), bump: V.flash(t, a0, a0 + 0.4) });
      const got = s ? s.got : 0;
      stGot.set({
        k: ramp(t, 0.3, 0.6),
        text: `${got} of 3`,
        tone: fired ? "green" : got ? "red" : "grey",
        bump: got ? V.flash(t, a0, a0 + 0.4) : 0,
      });
      L5.drawOn(tick, fired ? ramp(t, AT[4] + 0.2, AT[4] + 0.7) : 0);
    };
  },
});

/* Lecture 16 (ds-16) · scene 9 (RIGHT JOB, RIGHT CHIP): match each kind of work to a processor, and let the software stack map
   the model onto the chip (lesson 16.6).
   Story (local seconds): 0.3 three cards pop (stagger 0.4): CPU (blue, varied tasks, control flow), GPU (purple, similar maths
   in parallel), Specialised chip (green, frequent, stable operations); 4.8 they fold into three small name stickers at the top;
   5.0 a relay builds: CPU: prepare -> copy -> GPU: network -> copy -> CPU: show, 5.6-7.6 an orange baton dot runs along it,
   7.6 green tag '40 ms instead of 132' (D16.P); 8.4 the relay fades, three layers draw from the top: Framework (blue, expresses
   the model), Compiler (purple, picks chip operations), Runtime (green, schedules work and memory), arrows down to a purple chip
   (11.0). */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D16 = V.d16;
  const { ramp, flash, ease: E } = V;
  const P = D16.P;
  const fm = D16.fm;

  const T = { cards: 0.3, fold: 4.8, relay: 5.0, baton: [5.6, 7.6], win: 7.6, out: 8.2, stack: 8.6, chip: 10.6 };
  const XS = [157, 468, 779];
  const CARDS = [
    ["CPU", "varied tasks, control flow", "blue"],
    ["GPU", "similar maths in parallel", "purple"],
    ["Specialised chip", "frequent, stable operations", "green"],
  ];
  const RELAY = [
    ["CPU: prepare", "blue"],
    ["copy", "orange"],
    ["GPU: network", "purple"],
    ["copy", "orange"],
    ["CPU: show", "blue"],
  ];
  const RY = 236;
  const GAP = 40;
  const widths = RELAY.map(([s]) => D4.tagW(s, 28));
  const span = widths.reduce((a, w) => a + w, 0) + GAP * (RELAY.length - 1);
  const RX = widths.map((w, i) => 468 - span / 2 + widths.slice(0, i).reduce((a, v) => a + v + GAP, 0) + w / 2);
  const LAYERS = [
    ["Framework", "expresses the model", "blue"],
    ["Compiler", "picks chip operations", "purple"],
    ["Runtime", "schedules work and memory", "green"],
  ];
  const LY = [150, 276, 402];

  V.scene({
    kicker: "RIGHT JOB, RIGHT CHIP",
    title: ["Match the work to the chip,", "let the stack translate"],
    dur: 12.5,
    caps: [
      [0.4, 4.6, "CPU: varied tasks. GPU: maths in parallel. Specialised: stable work."],
      [4.8, 8.2, "CPU prepares, GPU runs the network, CPU shows the answer."],
      [8.4, 12.2, "Framework, compiler, runtime: the stack maps the model to the chip."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const cards = CARDS.map(([title, sub, tone], i) =>
        D16.box(stage, { x: XS[i], y: 140, w: 290, h: 250, title, sub, tone, icon: "chip", iconSize: 76 }),
      );
      const small = CARDS.map(([title, , tone], i) =>
        D4.tag(stage, { x: XS[i], y: 40, text: title, tone, solid: true }),
      );
      const relay = RELAY.map(([text, tone], i) => D4.tag(stage, { x: RX[i], y: RY, text, tone, solid: true }));
      const rArr = [0, 1, 2, 3].map((i) =>
        D16.arrow(svg, [RX[i] + widths[i] / 2 + 4, RY], [RX[i + 1] - widths[i + 1] / 2 - 4, RY], { w: 5, head: 14 }),
      );
      const baton = V.s("circle", { r: 14, "stroke-width": 4 });
      baton.style.fill = D16.tone("orange").c;
      baton.style.stroke = D16.tone("orange").lip;
      svg.append(baton);
      const win = D4.tag(stage, {
        x: 468,
        y: 372,
        text: `${fm(P.gpu.total)} ms instead of ${fm(P.cpu.total)}`,
        tone: "green",
        solid: true,
      });
      const layers = LAYERS.map(([title, sub, tone], i) =>
        D16.box(stage, { x: 468, y: LY[i], w: 620, h: 92, title, sub, tone, fs: 32 }),
      );
      const lArr = [0, 1, 2].map((i) =>
        D16.arrow(svg, [468, LY[i] + 50], [468, i < 2 ? LY[i + 1] - 48 : 476], { w: 6, head: 16 }),
      );
      const chip = D16.chip(468, 532, 104, "purple");
      svg.append(chip);

      return (t) => {
        const fold = ramp(t, T.fold, T.fold + 0.4, E.in);
        cards.forEach((c, i) => c.set({ k: D16.seq(t, T.cards, 0.4, 0.5, i), y: -60 * fold, o: 1 - fold }));
        small.forEach((s, i) => s.set({ k: D16.seq(t, T.fold + 0.2, 0.1, 0.4, i) }));
        const out = 1 - ramp(t, T.out, T.out + 0.4, E.lin);
        relay.forEach((r, i) => r.set({ k: D16.seq(t, T.relay, 0.12, 0.4, i), o: out }));
        rArr.forEach((a, i) => a.set({ k: D16.seq(t, T.relay + 0.2, 0.12, 0.3, i), o: out }));
        const kb = ramp(t, T.baton[0], T.baton[1], E.inOut);
        const bx = RX[0] + (RX[4] - RX[0]) * kb;
        baton.setAttribute("cx", bx.toFixed(1));
        baton.setAttribute("cy", String(RY + 46));
        V.show(baton, Math.min(ramp(t, T.baton[0] - 0.2, T.baton[0], E.lin), out));
        relay.forEach((r, i) => {
          if (i % 2) return;
          const hit = flash(
            t,
            T.baton[0] + (T.baton[1] - T.baton[0]) * (i / 4) - 0.1,
            T.baton[0] + (T.baton[1] - T.baton[0]) * (i / 4) + 0.3,
          );
          r.set({ k: D16.seq(t, T.relay, 0.12, 0.4, i), o: out, s: 1 + 0.12 * hit });
        });
        win.set({ k: ramp(t, T.win, T.win + 0.4), o: out });
        layers.forEach((l, i) => l.set({ k: D16.seq(t, T.stack, 0.5, 0.5, i) }));
        lArr.forEach((a, i) => a.set({ k: D16.seq(t, T.stack + 0.4, 0.5, 0.4, i) }));
        V.place(chip, { s: 0.7 + 0.3 * ramp(t, T.chip, T.chip + 0.5, E.pop), o: ramp(t, T.chip, T.chip + 0.3, E.lin) });
      };
    },
  });
})();

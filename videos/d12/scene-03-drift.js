/* Lecture 12 (ds-12) · scene 3 (DRIFT): development, test and production start out alike and drift apart; the big idea is to
   pack the whole environment with the code (lesson 12.1).
   Story (local seconds): 0.3 three grey boxes (Development, Test, Production) with the same three orange chips (OS, Python,
   libraries), grey arrows between them; 3.0 a clock appears and its hand turns; one chip changes in each box (3.4 Development
   "OS update", 4.0 Test "new Python", 4.6 Production "new libraries", all red); 5.4 a red wavy line "drift" draws under them.
   7.8 everything fades; a stack builds bottom-up (8.0 grey Hardware, 8.4 blue Operating system, 8.8 orange Libraries and
   settings, 9.2 green Mo's forecaster); 9.6 a purple dashed outline closes round it, "pack it all: virtualisation or
   containers". */
(function () {
  const V = window.VID;
  const D12 = V.d12;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;

  const BOX = [
    { x: 12, name: "Development", sub: "Mo's laptop", change: [0, "OS update", 3.4] },
    { x: 333, name: "Test", sub: "a shared test box", change: [1, "new Python", 4.0] },
    { x: 654, name: "Production", sub: "the live server", change: [2, "new libraries", 4.6] },
  ];
  const CHIPS = ["OS", "Python", "libraries"];
  const T = { clock: 3.0, wave: 5.4, out: 7.8, stack: 8.0, pack: 9.6 };
  const STACK = [
    ["Hardware", "grey"],
    ["Operating system", "blue"],
    ["Libraries and settings", "orange"],
    ["Mo's forecaster", "green"],
  ];

  V.scene({
    kicker: "DRIFT",
    title: ["Environments drift apart", "on the road to production"],
    dur: 12,
    caps: [
      [0.4, 2.8, "Development, test, production: three machines that start out alike."],
      [3.0, 5.2, "Each gets its own updates and tweaks."],
      [5.4, 7.6, "They drift apart, so deploying across them is fragile."],
      [7.8, 11.7, "The big idea: pack the environment along with the code."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const boxes = BOX.map((b) => D12.box(stage, { x: b.x, y: 24, w: 270, h: 300, text: "" }));
      const names = BOX.map((b) => D4.label(stage, { x: b.x + 135, y: 62, text: b.name, fs: 32 }));
      const subs = BOX.map((b) => D4.label(stage, { x: b.x + 135, y: 102, text: b.sub, fs: 28 }));
      const chips = BOX.map((b) => CHIPS.map((c, i) => D4.tag(stage, { x: b.x + 135, y: 162 + i * 56, text: c })));
      const arrows = [0, 1].map((i) => svg.appendChild(L5.arrow(BOX[i].x + 276, 174, BOX[i + 1].x - 6, 174, "grey")));
      const wave = svg.appendChild(D12.wave(40, 896, 372, 14, 12, "red"));
      const drift = D4.tag(stage, { x: 468, y: 372, text: "drift", tone: "red", solid: true, fs: 30 });
      const clock = D12.clock(468, 470, 84);
      svg.appendChild(clock.g);

      const layers = STACK.map(([text, tone], i) =>
        D12.box(stage, { x: 208, y: 450 - i * 76, w: 520, h: 64, text, tone }),
      );
      const frame = D12.box(stage, { x: 186, y: 206, w: 564, h: 328, text: "", tone: "purple", dash: true });
      const pack = D4.tag(stage, {
        x: 468,
        y: 156,
        text: "pack it all: virtualisation or containers",
        tone: "purple",
        solid: true,
      });

      return (t) => {
        const gone = 1 - ramp(t, T.out, T.out + 0.4, E.lin);
        BOX.forEach((b, j) => {
          const k = ramp(t, 0.3 + 0.2 * j, 0.7 + 0.2 * j, E.lin);
          boxes[j].set({ k, o: gone });
          names[j].set({ k, o: gone });
          subs[j].set({ k, o: gone });
          const [ci, text, at] = b.change;
          chips[j].forEach((c, i) => {
            const changed = i === ci && t >= at;
            c.set({
              k: ramp(t, 0.6 + 0.2 * j + 0.15 * i, 1.0 + 0.2 * j + 0.15 * i, E.lin),
              text: changed ? text : CHIPS[i],
              tone: changed ? "red" : "orange",
              solid: changed,
              s: 1 + 0.15 * flash(t, at, at + 0.4) * (i === ci ? 1 : 0),
              o: gone,
            });
          });
        });
        arrows.forEach((a, i) => {
          L5.drawOn(a, ramp(t, 1.4 + 0.3 * i, 1.8 + 0.3 * i));
          V.show(a, gone);
        });
        V.show(clock.g, ramp(t, T.clock, T.clock + 0.3) * gone);
        const turn = lerp(0, 720, ramp(t, T.clock, T.wave, E.inOut)) - 90;
        clock.hand.setAttribute("transform", `rotate(${turn.toFixed(1)} 468 470)`);
        D12.drawOn(wave, ramp(t, T.wave, T.wave + 0.8, E.inOut));
        V.show(wave, t >= T.wave ? gone : 0);
        drift.set({ k: ramp(t, T.wave + 0.5, T.wave + 0.9, E.lin), o: gone });

        layers.forEach((l, i) => {
          const k = ramp(t, T.stack + 0.4 * i, T.stack + 0.4 * i + 0.4, E.lin);
          l.set({ k, y: (1 - E.out(k)) * -30 });
        });
        frame.set({ k: ramp(t, T.pack, T.pack + 0.4, E.lin) });
        pack.set({ k: ramp(t, T.pack + 0.3, T.pack + 0.7, E.lin) });
      };
    },
  });
})();

/* Lecture 12 (ds-12) · scene 5 (EMULATION OR VIRTUALISATION): an emulator pretends to be other hardware and translates every
   instruction; a hypervisor lets the guest run on the real hardware and only keeps guests apart (lesson 12.2).
   Story (local seconds): 0.6 the left column builds (green Guest software "a retro game", orange Emulator "mimics the old
   console", grey Host hardware); from 2.4 four grey instruction dots fall from the guest, stop in the emulator, turn into orange
   squares (translated) and only then go down; 3.4 the tag "each instruction translated". 5.4 the right column builds (green
   Guest software "a full OS and apps", purple Hypervisor "shares the real hardware", grey Host hardware); from 6.6 green dots
   ride a green curved bypass straight to the host hardware, tag "runs on the real CPU"; 9.0 a green tick beside it and a
   purple tag "keeps guests apart" by the hypervisor. */
(function () {
  const V = window.VID;
  const D12 = V.d12;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, lerp, clamp, ease: E } = V;

  const COL = [
    { x: 12, w: 430, title: "Emulation", mid: ["Emulator", "mimics the old console", "orange"], sub: "a retro game" },
    {
      x: 484,
      w: 360,
      title: "Virtualisation",
      mid: ["Hypervisor", "shares the real hardware", "purple"],
      sub: "a full OS and apps",
    },
  ];
  const Y = { top: 70, mid: 256, bot: 442, h: 96 };
  const T = { left: 0.6, dots: 2.4, ltag: 3.4, right: 5.4, bypass: 6.6, rtag: 7.4, tick: 9.0 };
  const N = 4;
  const P0 = { x: 760, y: Y.top + Y.h };
  const P1 = { x: 1000, y: Y.mid + Y.h / 2 };
  const P2 = { x: 760, y: Y.bot };
  const quad = (k) => ({
    x: (1 - k) ** 2 * P0.x + 2 * (1 - k) * k * P1.x + k * k * P2.x,
    y: (1 - k) ** 2 * P0.y + 2 * (1 - k) * k * P1.y + k * k * P2.y,
  });

  V.scene({
    kicker: "EMULATION OR VIRTUALISATION",
    title: ["Pretend to be other hardware,", "or share the real one"],
    dur: 11,
    caps: [
      [0.4, 2.2, "An emulator mimics other hardware, like an old console."],
      [2.4, 5.2, "Every instruction is translated; the game never touches the real hardware."],
      [5.4, 8.8, "A virtual machine does use the host hardware."],
      [9.0, 10.7, "The hypervisor keeps the guests apart."],
    ],
    build(stage) {
      const cols = COL.map((c) => ({
        title: D4.label(stage, { x: c.x + c.w / 2, y: 28, text: c.title, fs: 34 }),
        boxes: [
          D12.box(stage, { x: c.x, y: Y.top, w: c.w, h: Y.h, text: "Guest software", sub: c.sub, tone: "green" }),
          D12.box(stage, { x: c.x, y: Y.mid, w: c.w, h: Y.h, text: c.mid[0], sub: c.mid[1], tone: c.mid[2] }),
          D12.box(stage, { x: c.x, y: Y.bot, w: c.w, h: Y.h, text: "Host hardware" }),
        ],
      }));
      const svg = D4.svg(stage);
      const path = svg.appendChild(
        V.s("path", {
          d: `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`,
          fill: "none",
          stroke: D12.tone("green").c,
          "stroke-width": 8,
          "stroke-linecap": "round",
          pathLength: 1,
          "stroke-dasharray": "1 1",
        }),
      );
      const dot = () => svg.appendChild(V.s("rect", { width: 36, height: 36, "stroke-width": 3 }));
      const left = Array.from({ length: N }, dot);
      const right = Array.from({ length: N }, dot);
      const put = (el, p, sq, tone, o) => {
        const c = D12.tone(tone);
        el.setAttribute("x", (p.x - 18).toFixed(1));
        el.setAttribute("y", (p.y - 18).toFixed(1));
        el.setAttribute("rx", lerp(18, 6, sq).toFixed(1));
        el.setAttribute("fill", c.c);
        el.setAttribute("stroke", c.lip);
        V.show(el, o);
      };
      const ltag = D4.tag(stage, { x: 227, y: 594, text: "each instruction translated", tone: "orange", solid: true });
      const rtag = D4.tag(stage, { x: 664, y: 594, text: "runs on the real CPU", tone: "green", solid: true });
      const tick = svg.appendChild(L5.tick(884, 594, 52, "green"));
      const apart = D4.tag(stage, { x: 640, y: 216, text: "keeps guests apart", tone: "purple", solid: true });

      return (t) => {
        cols.forEach((c, j) => {
          const t0 = j ? T.right : T.left;
          c.title.set({ k: ramp(t, t0 - 0.2, t0 + 0.2) });
          c.boxes.forEach((b, i) => b.set({ k: ramp(t, t0 + 0.3 * i, t0 + 0.3 * i + 0.4, E.lin) }));
        });
        // left: fall, stop in the emulator, turn into a square, fall again
        left.forEach((el, i) => {
          const s = T.dots + 0.65 * i;
          const x = 46;
          const a = ramp(t, s, s + 0.45, E.inOut);
          const b = ramp(t, s + 0.85, s + 1.3, E.inOut);
          const y = lerp(lerp(Y.top + Y.h, Y.mid + Y.h / 2, a), Y.bot, b);
          const sq = ramp(t, s + 0.5, s + 0.75);
          const o = t < s ? 0 : 1 - ramp(t, s + 1.3, s + 1.5, E.lin);
          put(el, { x, y }, sq, sq > 0.5 ? "orange" : "grey", o);
        });
        ltag.set({ k: ramp(t, T.ltag, T.ltag + 0.4, E.lin) });
        // right: straight down the bypass to the real hardware
        D12.drawOn(path, ramp(t, T.bypass, T.bypass + 0.6, E.inOut));
        V.show(path, t >= T.bypass ? 1 : 0);
        right.forEach((el, i) => {
          const s = T.bypass + 0.3 + 0.55 * i;
          const k = ramp(t, s, s + 1.0, E.inOut);
          const o = t < s ? 0 : 1 - ramp(t, s + 1.0, s + 1.2, E.lin);
          put(el, quad(clamp(k)), 0, "green", o);
        });
        rtag.set({ k: ramp(t, T.rtag, T.rtag + 0.4, E.lin) });
        L5.drawOn(tick, ramp(t, T.tick, T.tick + 0.4));
        apart.set({ k: ramp(t, T.tick + 0.2, T.tick + 0.6, E.lin) });
      };
    },
  });
})();

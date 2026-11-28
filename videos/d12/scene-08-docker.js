/* Lecture 12 (ds-12) · scene 8 (DOCKER): a container packs the app with its dependencies and runs as an isolated process:
   namespaces give it its own view, cgroups cap what it may use; on Windows, Docker Desktop runs a small Linux VM (lesson 12.4).
   Story (local seconds): 0.5 a dashed green box "One container" opens in the middle and fills top to bottom (green
   "forecast.py (the app)", orange "Python 3.12 + pandas 2.2", orange "settings and config"). 3.2 it slides left and becomes
   "Forecaster"; a second box "Shop" appears on the right; 3.6 three blue chips under each ("Own files", "Own network", "Own
   processes") and the blue tag "namespaces". 6.4 the chips give way to three orange bars per box (CPU, Memory, IO) that fill to
   different levels under red cap lines (the forecaster's memory reaches its cap and the cap flashes); tag "cgroups (limits)".
   9.6 the bars fade, a stack builds below (grey "Laptop hardware", blue "Windows", purple "WSL2 (modern) or Hyper-V (older)",
   blue "Small Linux VM") and the two containers drop onto it. */
(function () {
  const V = window.VID;
  const D12 = V.d12;
  const D4 = V.d4;
  const { ramp, flash, lerp, ease: E } = V;

  const BW = 400;
  const BX = [30, 506];
  const MID = 268; // the first box starts centred
  const DROP = 134;
  const T = { open: 0.5, split: 3.2, ns: 3.6, cg: 6.4, stack: 9.6, drop: 11.4 };
  const BOXES = [
    {
      name: ["One container", "Forecaster"],
      rows: [
        ["forecast.py (the app)", "green"],
        ["Python 3.12 + pandas 2.2", "orange"],
        ["settings and config", "orange"],
      ],
      fill: [0.55, 0.8, 0.35],
    },
    {
      name: ["Shop", "Shop"],
      rows: [
        ["shop app", "green"],
        ["its own libraries", "orange"],
        ["its own settings", "orange"],
      ],
      fill: [0.4, 0.5, 0.65],
    },
  ];
  const CAP = 0.8;
  const RES = ["CPU", "Memory", "IO"];
  const STACK = [
    ["Laptop hardware", "grey"],
    ["Windows", "blue"],
    ["WSL2 (modern) or Hyper-V (older)", "purple"],
    ["Small Linux VM", "blue"],
  ];

  V.scene({
    kicker: "DOCKER",
    title: ["A packaged app,", "running in isolation"],
    dur: 14,
    caps: [
      [0.4, 3.0, "Docker packs the app with all its dependencies."],
      [3.2, 6.2, "Namespaces: each container sees its own files, network and processes."],
      [6.4, 9.4, "Cgroups: limits on CPU, memory and IO."],
      [9.6, 13.7, "On Windows, Docker Desktop runs a small Linux VM via WSL2 or Hyper-V."],
    ],
    build(stage) {
      const stack = STACK.map(([text, tone], i) =>
        D12.box(stage, { x: 20, y: 574 - i * 58, w: 896, h: 50, text, tone, fs: 28 }),
      );
      const parts = BOXES.map((b, j) => {
        const x0 = BX[j];
        const frame = D12.box(stage, { x: x0, y: 40, w: BW, h: 216, text: "", tone: "green", dash: true });
        const rows = b.rows.map(([text, tone], i) =>
          D12.box(stage, { x: x0 + 16, y: 64 + i * 60, w: BW - 32, h: 52, text, tone, fs: 28 }),
        );
        const tag = D4.tag(stage, { x: x0 + BW / 2, y: 40, text: b.name[0], tone: "green", solid: true });
        const ns = [
          D4.tag(stage, { x: x0 + 92, y: 298, text: "Own files", tone: "blue" }),
          D4.tag(stage, { x: x0 + 300, y: 298, text: "Own network", tone: "blue" }),
          D4.tag(stage, { x: x0 + BW / 2, y: 356, text: "Own processes", tone: "blue" }),
        ];
        const res = RES.map((r, i) => D4.label(stage, { x: x0 + 8, y: 300 + i * 50, text: r, fs: 28, anchor: "l" }));
        const bars = RES.map((_, i) => D4.bar(stage, { x: x0 + 130, y: 284 + i * 50, w: 262, h: 32, tone: "orange" }));
        return { frame, rows, tag, ns, res, bars };
      });
      const svg = D4.svg(stage);
      const caps = BX.flatMap((x0) =>
        RES.map((_, i) => {
          const cx = x0 + 130 + 3 + CAP * (262 - 6);
          return svg.appendChild(
            V.s("line", {
              x1: cx,
              y1: 280 + i * 50,
              x2: cx,
              y2: 320 + i * 50,
              stroke: D12.tone("red").c,
              "stroke-width": 7,
              "stroke-linecap": "round",
            }),
          );
        }),
      );
      const nsTag = D4.tag(stage, { x: 468, y: 430, text: "namespaces", tone: "blue", solid: true });
      const cgTag = D4.tag(stage, { x: 468, y: 474, text: "cgroups (limits)", tone: "orange", solid: true });

      return (t) => {
        const split = ramp(t, T.split, T.split + 0.6, E.inOut);
        const nsOn = ramp(t, T.ns, T.ns + 0.4, E.lin) * (1 - ramp(t, T.cg, T.cg + 0.4, E.lin));
        const cgOn = ramp(t, T.cg + 0.2, T.cg + 0.6, E.lin) * (1 - ramp(t, T.stack, T.stack + 0.4, E.lin));
        const dy = DROP * ramp(t, T.drop, T.drop + 0.8, E.inOut);
        parts.forEach((p, j) => {
          const dx = j === 0 ? lerp(MID - BX[0], 0, split) : 0;
          const open = j === 0 ? ramp(t, T.open, T.open + 0.4, E.lin) : ramp(t, T.split + 0.3, T.split + 0.7, E.lin);
          p.frame.set({ k: open, x: dx, y: dy });
          p.rows.forEach((r, i) => {
            const at = (j === 0 ? T.open + 0.5 : T.split + 0.6) + 0.5 * i;
            const k = ramp(t, at, at + 0.4, E.lin);
            r.set({ k, x: dx, y: dy + (1 - E.out(k)) * -24 });
          });
          p.tag.set({ k: open, x: dx, y: dy, text: t >= T.split ? BOXES[j].name[1] : BOXES[j].name[0] });
          p.ns.forEach((c, i) => c.set({ k: D12.seq(t, T.ns + 0.1 * j, 0.2, 0.4, i), o: nsOn }));
          p.res.forEach((l) => l.set({ k: cgOn ? 1 : 0, o: cgOn }));
          p.bars.forEach((b, i) => {
            const k = ramp(t, T.cg + 0.4 + 0.2 * i, T.cg + 1.6 + 0.2 * i, E.out);
            b.set({ k: Math.min(CAP, BOXES[j].fill[i]) * k, o: cgOn });
          });
        });
        caps.forEach((c, n) => {
          const hit = n === 1; // the forecaster's memory reaches its cap
          V.place(c, { s: 1 + (hit ? 0.3 * flash(t, T.cg + 1.6, T.cg + 2.0) : 0), o: cgOn });
        });
        nsTag.set({ k: ramp(t, T.ns + 0.8, T.ns + 1.2, E.lin), o: nsOn });
        cgTag.set({ k: cgOn });
        stack.forEach((s, i) => {
          const k = ramp(t, T.stack + 0.2 + 0.35 * i, T.stack + 0.6 + 0.35 * i, E.lin);
          s.set({ k, y: (1 - E.out(k)) * 30 });
        });
      };
    },
  });
})();

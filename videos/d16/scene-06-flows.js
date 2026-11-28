/* Lecture 16 (ds-16) · scene 6 (FOUR FLOWS): bottom-up, top-down, co-design and the iterative loop (lesson 16.3).
   Three rows, each a purple Hardware box and a blue Software box with an arrow between them and a grey example tag under it.
   Story (local seconds): 0.4 row 1 'Bottom-up', Hardware -> Software, tag 'early GPU computing'; 3.8 row 2 'Top-down',
   Software -> Hardware, tag 'Volta tensor cores'; 7.2 row 3 'Co-design', arrows both ways pulsing in turn, tag 'Snapdragon
   Ride Flex, Ride Vision'; 10.6 below them a loop Demand (orange) -> Software (blue) -> Hardware (purple) -> back to Demand
   draws, 11.6 a green dot runs round it twice (to 13.8) and stops on Demand, grey tag 'iterative'. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D16 = V.d16;
  const { ramp, flash, ease: E } = V;

  const ROWS = [
    { at: 0.4, name: "Bottom-up", dir: [1], tag: "early GPU computing" },
    { at: 3.8, name: "Top-down", dir: [-1], tag: "Volta tensor cores" },
    { at: 7.2, name: "Co-design", dir: [1, -1], tag: "Snapdragon Ride Flex, Ride Vision" },
  ];
  const TOP = (i) => 12 + 128 * i;
  const HX = 330;
  const SX = 650;
  const LOOP = { at: 10.6, y: 474, xs: [150, 468, 786], run: [11.6, 13.8], laps: 2 };

  V.scene({
    kicker: "FOUR FLOWS",
    title: ["Chip first, code first,", "or both at once"],
    dur: 14,
    caps: [
      [0.4, 3.5, "Bottom-up: hardware first, software later. Early GPU computing."],
      [3.8, 6.9, "Top-down: the workload drives the chip. Volta tensor cores."],
      [7.2, 10.3, "Co-design: both together. Snapdragon Ride Flex and Ride Vision."],
      [10.6, 13.7, "Demand, software, hardware, round again: an iterative loop."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const rows = ROWS.map((r, i) => {
        const y = TOP(i) + 34;
        const name = D4.label(stage, { x: 12, y, text: r.name, fs: 32, anchor: "l" });
        const hw = D16.box(stage, { x: HX, y, w: 200, h: 64, title: "Hardware", tone: "purple", solid: true, fs: 30 });
        const sw = D16.box(stage, { x: SX, y, w: 200, h: 64, title: "Software", tone: "blue", solid: true, fs: 30 });
        const two = r.dir.length > 1;
        const arrows = r.dir.map((d, j) => {
          const dy = two ? (j ? 13 : -13) : 0;
          const a = [HX + 104, y + dy];
          const b = [SX - 104, y + dy];
          return D16.arrow(svg, d > 0 ? a : b, d > 0 ? b : a, { w: two ? 6 : 8, head: two ? 18 : 22 });
        });
        const tag = D4.tag(stage, { x: 490, y: TOP(i) + 98, text: r.tag });
        return { ...r, name, hw, sw, arrows, tag };
      });

      const LY = LOOP.y;
      const lBox = [
        ["Demand", "orange"],
        ["Software", "blue"],
        ["Hardware", "purple"],
      ].map(([title, tone], i) =>
        D16.box(stage, { x: LOOP.xs[i], y: LY, w: 220, h: 70, title, tone, solid: true, fs: 30 }),
      );
      const lArr = [
        D16.arrow(svg, [LOOP.xs[0] + 114, LY], [LOOP.xs[1] - 114, LY], { tone: "green", w: 7, head: 20 }),
        D16.arrow(svg, [LOOP.xs[1] + 114, LY], [LOOP.xs[2] - 114, LY], { tone: "green", w: 7, head: 20 }),
        D16.arrow(svg, [LOOP.xs[2], LY + 42], [LOOP.xs[0], LY + 42], { tone: "green", w: 7, head: 20, bow: 52 }),
      ];
      const iter = D4.tag(stage, { x: 468, y: 598, text: "iterative" });
      // the dot's path: along the top row, then back along the curved return arrow (sampled from its quadratic)
      const back = Array.from({ length: 13 }, (_, i) => {
        const u = i / 12;
        const cy = LY + 42 + 2 * 52;
        const x = (1 - u) * LOOP.xs[2] + u * LOOP.xs[0];
        const y = (1 - u) ** 2 * (LY + 42) + 2 * u * (1 - u) * cy + u * u * (LY + 42);
        return { x, y };
      });
      const PATH = [{ x: LOOP.xs[0], y: LY }, { x: LOOP.xs[2], y: LY }, ...back, { x: LOOP.xs[0], y: LY }];
      const dot = V.s("circle", { r: 15, "stroke-width": 4 });
      dot.style.fill = D16.tone("green").c;
      dot.style.stroke = D16.tone("green").lip;
      const dsvg = D4.svg(stage);
      dsvg.append(dot);

      return (t) => {
        rows.forEach((r) => {
          const k = (d) => ramp(t, r.at + d, r.at + d + 0.4);
          r.name.set({ k: k(0) });
          r.hw.set({ k: k(0.1) });
          r.sw.set({ k: k(0.2) });
          r.arrows.forEach((a, j) => {
            const beat =
              r.dir.length > 1 && t > r.at + 1.6 ? flash(((t - r.at - 1.6 + j * 0.7) % 1.4) / 1.4, 0, 0.5) : 0;
            a.set({ k: ramp(t, r.at + 0.5 + 0.5 * j, r.at + 1.1 + 0.5 * j, E.inOut), s: 1 + 0.12 * beat });
          });
          r.tag.set({ k: ramp(t, r.at + 1.2, r.at + 1.6, E.lin) });
        });
        lBox.forEach((b, i) => b.set({ k: D16.seq(t, LOOP.at, 0.2, 0.4, i) }));
        lArr.forEach((a, i) => a.set({ k: E.inOut(D16.seq(t, LOOP.at + 0.4, 0.2, 0.4, i)) }));
        iter.set({ k: ramp(t, LOOP.at + 1.0, LOOP.at + 1.4, E.lin) });
        const run = ramp(t, LOOP.run[0], LOOP.run[1], E.inOut) * LOOP.laps;
        const p = D16.along(PATH, run >= LOOP.laps ? 1 : run % 1);
        dot.setAttribute("cx", p.x.toFixed(1));
        dot.setAttribute("cy", p.y.toFixed(1));
        V.show(dot, t >= LOOP.run[0] - 0.2 ? ramp(t, LOOP.run[0] - 0.2, LOOP.run[0], V.ease.lin) : 0);
      };
    },
  });
})();

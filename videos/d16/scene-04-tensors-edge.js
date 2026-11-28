/* Lecture 16 (ds-16) · scene 4 (WHAT AI ASKS): dense and sparse tensors, and the move to the edge (lesson 16.2).
   Story (local seconds): 0.3 grey label 'tensor operations' over two empty 6 x 6 grids; 3.2 the left grid fills every cell
   blue, row by row (dense: images, CNNs), 3.6 the right grid fills only 5 scattered cells (sparse: recommendations);
   6.0 the grids slide away, a grey cloud at the top and the phone at the bottom, a purple 'network' block in the cloud,
   6.4 an orange 'photo' packet goes up, 7.6 the orange answer 'ivy' comes down; 9.0 the network block slides down into the
   phone, the cloud fades back, 9.8 green tag 'on the device: edge computing'. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D16 = V.d16;
  const { ramp, ease: E } = V;
  const B = D16.tone("blue");

  const T = { grids: 0.3, dense: 3.2, sparse: 3.6, away: 5.8, cloud: 6.0, up: [6.4, 7.2], down: [7.6, 8.4], edge: 9.0 };
  const N = 6;
  const CELL = 42;
  const GAP = 6;
  const GRID = [110, 544];
  const GY = 92;
  const SPARSE = [
    [0, 4],
    [1, 1],
    [2, 5],
    [3, 2],
    [5, 0],
  ];
  D16.same("sparse grid: filled cells", SPARSE.length, 5);
  const CL = { x: 468, y: 104 };
  const PH = { x: 468, y: 425, s: 230 };

  V.scene({
    kicker: "WHAT AI ASKS",
    title: ["Full grids, empty grids,", "and the move to the edge"],
    dur: 12.5,
    caps: [
      [0.4, 3.0, "AI models run on tensor operations."],
      [3.2, 5.8, "Images: dense tensors. Recommendations: sparse ones."],
      [6.0, 8.8, "AI usually runs in the cloud."],
      [9.0, 12.2, "Personal models move it onto the phone: edge computing."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const grids = GRID.map((gx) => {
        const g = V.s("g", {});
        const cells = [];
        for (let r = 0; r < N; r++)
          for (let c = 0; c < N; c++) {
            const cell = V.s("rect", {
              x: gx + c * (CELL + GAP),
              y: GY + r * (CELL + GAP),
              width: CELL,
              height: CELL,
              rx: 8,
              "stroke-width": 3,
            });
            g.append(cell);
            cells.push({ el: cell, r, c });
          }
        svg.append(g);
        return { g, cells };
      });
      const head = D4.label(stage, { x: 468, y: 40, text: "tensor operations", fs: 32 });
      const lDense = D4.tag(stage, { x: 251, y: 420, text: "dense: images (CNNs)", tone: "blue" });
      const lSparse = D4.tag(stage, { x: 685, y: 420, text: "sparse: recommendations", tone: "blue" });

      const cloud = D16.cloud(CL.x, CL.y, 250);
      const phone = V.s("g", {}, D16.phone(PH.x, PH.y, PH.s), D16.leaf(PH.x, PH.y - 50, 56));
      svg.append(cloud, phone);
      const net = D4.tag(stage, { text: "network", tone: "purple", solid: true });
      const up = D4.packet(stage, { text: "photo", tone: "orange" });
      const down = D4.packet(stage, { text: "ivy", tone: "orange" });
      const edge = D4.tag(stage, { x: 468, y: 592, text: "on the device: edge computing", tone: "green", solid: true });

      const fill = (el, on) => {
        el.style.fill = on ? B.c : "var(--panel)";
        el.style.stroke = on ? B.lip : "var(--line-2)";
      };
      return (t) => {
        const away = ramp(t, T.away, T.away + 0.4, E.in);
        const kg = ramp(t, T.grids, T.grids + 0.5);
        grids.forEach((g, i) => {
          V.place(g.g, { x: -60 * away, o: kg * (1 - away) });
          g.cells.forEach(({ el, r, c }) => {
            const on =
              i === 0
                ? t >= T.dense + 0.26 * r + 0.03 * c
                : SPARSE.some(([sr, sc], j) => sr === r && sc === c && t >= T.sparse + 0.22 * j);
            fill(el, on);
          });
        });
        head.set({ k: ramp(t, T.grids, T.grids + 0.4, E.lin), o: 1 - away });
        lDense.set({ k: ramp(t, T.dense + 0.3, T.dense + 0.7, E.lin), o: 1 - away });
        lSparse.set({ k: ramp(t, T.sparse + 0.6, T.sparse + 1.0, E.lin), o: 1 - away });

        const kc = ramp(t, T.cloud, T.cloud + 0.5);
        const ke = ramp(t, T.edge, T.edge + 0.8, E.inOut);
        V.place(cloud, { s: 0.8 + 0.2 * E.pop(kc), o: kc * (1 - 0.6 * ke) });
        V.place(phone, { s: 0.8 + 0.2 * E.pop(kc), o: kc });
        net.set({
          x: CL.x,
          y: CL.y + 6 + (PH.y + 40 - CL.y - 6) * ke,
          k: ramp(t, T.cloud + 0.2, T.cloud + 0.6, E.lin),
        });
        const fly = (pk, a, b, k) => {
          const live = k > 0 && k < 1;
          pk.set({ x: CL.x, y: a + (b - a) * k, k: live ? 1 : 0, o: live ? Math.min(1, k * 8, (1 - k) * 8) : 0 });
        };
        fly(up, PH.y - 116, CL.y + 60, ramp(t, T.up[0], T.up[1], E.inOut));
        fly(down, CL.y + 60, PH.y - 116, ramp(t, T.down[0], T.down[1], E.inOut));
        edge.set({ k: ramp(t, T.edge + 0.8, T.edge + 1.2, E.lin) });
      };
    },
  });
})();

/* Lecture 14 (ds-14) · scene 2 (THE ORDER OF A TENSOR): one figure grows in place, and the order counts the indices needed to
   find one value (lesson 14.1). Data from D14.ORD. Colours: blue the values, purple the index arrows and the order counter,
   grey the plain label, green-tinted and purple-tinted outlines for the grids stacked behind.
   Story (local seconds): 0.5 one blue cube "18°" (the greenhouse thermometer), "order 0", "scalar · 0 indices"; 3.0 the cube
   flips to 3 and 5, 1, 4 pop in beside it, a purple arrow along the row, "order 1"; 5.8 two more rows drop in below, the row
   arrow slides under the grid, a second purple arrow down the side, "order 2"; 8.8 two copies of the grid slide in behind
   (purple and green outlines), a third purple arrow into the depth, "order 3". Hold to 14. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const O = D14.ORD;
  D14.same("orders scene: 3 x 4 grid", [O.mat.length, O.mat[0].length], [3, 4]);

  const CS = 84;
  const GAP = 12;
  const GW = 4 * CS + 3 * GAP;
  const GH = 3 * CS + 2 * GAP;
  const GX = 468 - GW / 2;
  const GY = 200;
  const PILE = 40;
  const AT = [0.5, 3.0, 5.8, 8.8];
  const LABELS = [
    "scalar · 0 indices",
    "vector · 1 index",
    "matrix · 2 indices (row, column)",
    "3-order tensor · 3 indices (grid, row, column)",
  ];

  V.scene({
    kicker: "THE ORDER OF A TENSOR",
    title: ["Count the indices", "you need to find one value"],
    dur: 14,
    caps: [
      [0.4, 2.8, `Sprout's thermometer: ${O.scalar}°. One number is a scalar.`],
      [3.0, 5.6, `One member's ratings, ${O.vec.join(", ")}: a vector.`],
      [5.8, 8.6, "Rows under rows: a matrix. Two indices find a value."],
      [8.8, 13.7, "A pile of grids is a 3-order tensor: three indices."],
    ],
    build(stage) {
      const back = [2, 1].map((i) =>
        D4.card(stage, {
          x: GX - 10 + i * PILE,
          y: GY - 10 - i * PILE,
          w: GW + 20,
          h: GH + 20,
          tone: i === 2 ? "green" : "purple",
          plain: true,
        }),
      );
      const svg = D4.svg(stage);
      const across = L5.arrow(GX, GY + CS + 34, GX + GW, GY + CS + 34, "purple", 1, { w: 7, head: 22 });
      const down = L5.arrow(GX - 34, GY, GX - 34, GY + GH, "purple", 1, { w: 7, head: 22 });
      const depth = L5.arrow(GX + GW + 18, GY - 18, GX + GW + 2 * PILE + 44, GY - 2 * PILE - 44, "purple", 1, {
        w: 7,
        head: 22,
      });
      svg.append(across, down, depth);
      const g = D14.grid(stage, { x: GX, y: GY, M: O.mat, cs: CS, gap: GAP, fs: 36 });
      const counter = D4.tag(stage, { x: 110, y: 40, text: "order 0", tone: "purple", solid: true, fs: 32 });
      const label = D4.tag(stage, { x: 468, y: 596, text: LABELS[0], tone: "grey" });

      return (t) => {
        const phase = AT.filter((a) => t >= a).length - 1;
        const kRow = ramp(t, AT[1] + 0.1, AT[1] + 0.9);
        const kRows = ramp(t, AT[2], AT[2] + 0.9);
        g.all((r, c, v) => {
          if (r === 0 && c === 0) {
            const k0 = ramp(t, AT[0], AT[0] + 0.4, E.lin);
            if (t < AT[1]) return { ...D14.cellSt(1, { text: `${O.scalar}°` }), s: 0.8 + 0.2 * E.pop(k0), o: k0 };
            const kf = ramp(t, AT[1], AT[1] + 0.4, E.lin);
            return {
              ...D14.cellSt(v),
              sx: Math.abs(Math.cos(Math.PI * kf)),
              text: kf < 0.5 ? `${O.scalar}°` : String(v),
            };
          }
          if (r === 0) {
            const k = D14.seq(t, AT[1] + 0.2, 0.15, 0.35, c - 1);
            return { ...D14.cellSt(v), s: 0.8 + 0.2 * E.pop(k), o: k };
          }
          const k = D14.seq(t, AT[2], 0.3, 0.5, r - 1);
          return { ...D14.cellSt(v), y: -60 * (1 - E.out(k)), o: k };
        });
        // the row arrow sits under the last row shown
        V.place(across, { y: lerp(0, GH - CS, E.inOut(kRows)) });
        L5.drawOn(across, kRow);
        L5.drawOn(down, ramp(t, AT[2] + 0.7, AT[2] + 1.3));
        back.forEach((b, i) => {
          const k = D14.seq(t, AT[3], 0.35, 0.6, 1 - i);
          b.set({ x: 80 * (1 - E.out(k)), o: k, k: 1 });
        });
        L5.drawOn(depth, ramp(t, AT[3] + 1.0, AT[3] + 1.6));
        const bump = Math.max(...AT.map((a) => flash(t, a, a + 0.4)));
        counter.set({ text: `order ${Math.max(0, phase)}`, k: ramp(t, AT[0], AT[0] + 0.4, E.lin), s: 1 + 0.12 * bump });
        label.set({
          text: LABELS[Math.max(0, phase)],
          k: ramp(t, AT[0] + 0.3, AT[0] + 0.7, E.lin),
          s: 1 + 0.06 * bump,
        });
      };
    },
  });
})();

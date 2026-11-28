/* Lecture 14 (ds-14) · scene 10 (CSR OR CSC): store the matrix the way you will read it (lessons 14.5 and 14.6, when to use
   each). Data from D14.CHOOSE. Colours: blue the CSR card and the stored 1s, orange the CSC card, grey zeros, links, names and
   the use tags, purple the row-by-row sweep of A × x, green the row or column that answers a question, red "slow for one column".
   Story (local seconds): 0.5 the blue card "CSR: fast rows": a small adjacency grid (rows and columns A, B, C, D for Ada, Ben,
   Cy, Dot) and the graph beside it, Ada linked to Ben, Cy and Dot; 1.6 Ada's row glows green, "Ada's row: Ben, Cy, Dot";
   3.6 grey tags "row slicing" and "many A × x products" while a purple frame sweeps the grid row by row; 6.2 the orange card
   "CSC: fast columns": a sparse table of swaps (columns tomato, basil, sunflower); 7.2 the tomato column glows green, "who
   swapped it: Ada, Cy, Dot"; 9.4 a grey tag "many categorical features" and, on the CSR card, red "slow for one column".
   Hold to 12. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;
  const C = D14.CHOOSE;
  const L = 12;
  const R = 476;
  const CW = 448;
  const ini = C.names.map((s) => s[0]);
  D14.same("choose scene: initials", ini.join(""), "ABCD");

  V.scene({
    kicker: "CSR OR CSC",
    title: ["Store it", "the way you will read it"],
    dur: 12,
    caps: [
      [0.4, 3.4, "CSR: fast row operations. A graph row is one node's neighbours."],
      [3.6, 6.0, "Good for row slicing and many A × x products."],
      [6.2, 9.2, `CSC: fast column operations, like 'who swapped ${C.crops[0]}?'`],
      [9.4, 11.7, "Good for huge datasets with many categorical features."],
    ],
    build(stage) {
      const cards = [L, R].map((x, i) =>
        D4.card(stage, { x, y: 12, w: CW, h: 600, tone: i ? "orange" : "blue", plain: true }),
      );
      // ---- CSR card ----
      const svg = D4.svg(stage);
      const head1 = D4.tag(stage, { x: L + CW / 2, y: 58, text: "CSR: fast rows", tone: "blue", solid: true, fs: 30 });
      const colHead = ini.map((s, j) => D4.label(stage, { x: L + 98 + 22 + 50 * j, y: 116, text: s, fs: 28 }));
      const g = D14.grid(stage, { x: L + 98, y: 140, M: C.adj, cs: 44, gap: 6, fs: 28 });
      const rowHead = C.names.map((s, r) =>
        D4.label(stage, { x: L + 84, y: 162 + 50 * r, text: s, fs: 28, anchor: "r" }),
      );
      const NODE = [{ x: L + 345, y: 237 }, ...[0, 1, 2].map((i) => ({ x: L + 410, y: 162 + 75 * i }))];
      const links = C.adaRow.map((_, i) => D4.wire(svg, { pts: [NODE[0], NODE[i + 1]], tone: "grey", w: 5 }));
      const nodes = NODE.map((p, i) =>
        D4.disc(stage, { x: p.x, y: p.y, size: 52, text: ini[i], tone: "grey", fs: 28 }),
      );
      const rowRing = D14.frame(stage, { tone: "green", w: 5 });
      const sweep = D14.frame(stage, { tone: "purple", w: 5 });
      const answer = D4.tag(stage, {
        x: L + CW / 2,
        y: 384,
        text: `Ada's row: ${C.adaRow.join(", ")}`,
        tone: "green",
        solid: true,
      });
      const use1 = [
        D4.tag(stage, { x: L + CW / 2, y: 446, text: "row slicing", tone: "grey" }),
        D4.tag(stage, { x: L + CW / 2, y: 502, text: "many A × x products", tone: "grey" }),
      ];
      const slow = D4.label(stage, { x: L + CW / 2, y: 562, text: "slow for one column", tone: "red", fs: 30 });
      // ---- CSC card ----
      const head2 = D4.tag(stage, {
        x: R + CW / 2,
        y: 58,
        text: "CSC: fast columns",
        tone: "orange",
        solid: true,
        fs: 30,
      });
      const cropHead = C.crops.map((s, j) => D4.label(stage, { x: R + 108 + 48 + 104 * j, y: 116, text: s, fs: 28 }));
      const table = C.swaps.map((row, r) =>
        D4.chips(stage, { x: R + 108, y: 140 + 52 * r, n: 3, w: 96, h: 44, gap: 8, fs: 28, texts: row.map(String) }),
      );
      const names2 = C.names.map((s, r) =>
        D4.label(stage, { x: R + 94, y: 162 + 52 * r, text: s, fs: 28, anchor: "r" }),
      );
      const colRing = D14.frame(stage, { tone: "green", w: 5 });
      const who = D4.tag(stage, {
        x: R + CW / 2,
        y: 400,
        text: `who swapped it: ${C.tomato.join(", ")}`,
        tone: "green",
        solid: true,
      });
      const use2 = D4.tag(stage, { x: R + CW / 2, y: 470, text: "many categorical features", tone: "grey" });

      return (t) => {
        const k1 = ramp(t, 0.5, 0.9, E.lin);
        cards[0].set({ k: k1 });
        head1.set({ k: k1 });
        colHead.forEach((l) => l.set({ k: k1 }));
        rowHead.forEach((l, r) => l.set({ k: k1, tone: r === 0 && t >= 1.6 ? "green" : "grey" }));
        g.all((r, c, v) => D14.cellSt(v, { o: k1 }));
        nodes.forEach((d, i) =>
          d.set({ k: D14.seq(t, 0.7, 0.1, 0.3, i), solid: false, tone: i && t >= 1.9 ? "green" : "grey" }),
        );
        links.forEach((w, i) =>
          w.set({ k: ramp(t, 1.0 + 0.15 * i, 1.4 + 0.15 * i, E.inOut), tone: t >= 1.9 ? "green" : "grey" }),
        );
        const a0 = g.cell(0, 0);
        rowRing.set({
          x: a0.x - 28,
          y: a0.y - 28,
          w: 4 * 50 + 6,
          h: 56,
          k: ramp(t, 1.6, 1.9, E.lin) * (1 - ramp(t, 3.7, 3.9, E.lin)),
        });
        answer.set({ k: ramp(t, 2.0, 2.3, E.lin) });
        use1.forEach((u, i) => u.set({ k: ramp(t, 3.6 + 0.3 * i, 3.9 + 0.3 * i, E.lin) }));
        const si = Math.floor((t - 4.0) / 0.4);
        const sp = g.cell(Math.min(3, Math.max(0, si)), 0);
        sweep.set({ x: sp.x - 28, y: sp.y - 28, w: 4 * 50 + 6, h: 56, k: t >= 4.0 && si < 4 ? 1 : 0 });
        slow.set({ k: ramp(t, 9.8, 10.1, E.lin) });

        const k2 = ramp(t, 6.2, 6.6, E.lin);
        cards[1].set({ k: k2 });
        head2.set({ k: k2 });
        cropHead.forEach((l, j) => l.set({ k: k2, tone: j === 0 && t >= 7.2 ? "green" : "grey" }));
        names2.forEach((l, r) => l.set({ k: k2, tone: C.swaps[r][0] && t >= 7.6 ? "green" : "grey" }));
        table.forEach((row, r) =>
          row.all((j) =>
            D14.cellSt(C.swaps[r][j], {
              o: D14.seq(t, 6.4, 0.08, 0.3, r),
              s: j === 0 && C.swaps[r][j] ? 1 + 0.12 * flash(t, 7.3, 7.8) : 1,
            }),
          ),
        );
        const c0 = table[0].mid(0);
        colRing.set({ x: c0.x - 56, y: c0.y - 30, w: 112, h: 4 * 52 + 8, k: ramp(t, 7.2, 7.5, E.lin) });
        who.set({ k: ramp(t, 7.6, 7.9, E.lin) });
        use2.set({ k: ramp(t, 9.4, 9.7, E.lin) });
      };
    },
  });
})();

/* Lecture 14 (ds-14) · scene 4 (SPARSE OR DENSE): Sprout's 8 x 8 swap sheet fills up; sparsity and the cost of a list of
   non-zeros against the full grid (lesson 14.3, its sparsityLab demo). Cells fill in the lesson's fixed order (D14.SHEET.fill).
   Colours: grey the zeros and plain labels, blue the non-zero cells and their counter, orange the sparsity, green the smaller
   store, red the bigger one.
   Story (local seconds): 0.2 the grey sheet; 0.5-3.3 six cells fill one by one, the counters follow (6 non-zeros, sparsity
   91%), "sparse: mostly 0"; 4.2 two bars: red "Full grid: 64 numbers", green "Non-zero list: 18 numbers"; 7.6-10.0 the sheet
   fills to 52 cells, the counters run to 52 and 19%, the label turns to "dense: mostly filled", the list bar grows past the grid
   bar to 156 and turns red while the grid bar turns green. Hold to 13. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;
  const S = D14.SHEET;
  const MAX = S.list(S.dense);
  D14.same("sparse scene: the list of 52 is the longest bar", MAX, 156);
  const fillAt = (j) => (j < S.sparse ? 0.5 + 0.55 * j : 7.6 + ((j - S.sparse) * 2.4) / (S.dense - S.sparse));
  const cellOf = {};
  for (let j = 0; j < S.dense; j++) {
    const f = S.fill(j);
    cellOf[`${f.r},${f.c}`] = { j, v: f.v };
  }
  const CX = 724;
  const BW = 384;

  V.scene({
    kicker: "SPARSE OR DENSE",
    title: ["Mostly zeros,", "or mostly filled"],
    dur: 13,
    caps: [
      [0.4, 4.0, `Sprout's swap sheet: ${S.sparse} non-zeros of ${S.n}. Sparsity ${S.sparsity(S.sparse)}%.`],
      [4.2, 7.4, `Listing only the non-zeros: ${S.list(S.sparse)} numbers instead of ${S.n}.`],
      [7.6, 10.2, `Fill it to ${S.dense}: dense, sparsity ${S.sparsity(S.dense)}%.`],
      [10.4, 12.7, `Now the list, ${S.list(S.dense)} numbers, is bigger than the grid.`],
    ],
    build(stage) {
      const head = D4.label(stage, { x: 257, y: 26, text: "8 members × 8 seed packets", fs: 28 });
      const g = D14.grid(stage, { x: 12, y: 60, M: D14.sheet(0), cs: 56, gap: 6, fs: 28 });
      const nz = D4.tag(stage, { x: CX, y: 92, text: "", tone: "blue", solid: true, fs: 30 });
      const sp = D4.tag(stage, { x: CX, y: 164, text: "", tone: "orange", solid: true, fs: 30 });
      const kind = D4.label(stage, { x: CX, y: 230, text: "", fs: 30 });
      const gridLab = D4.label(stage, { x: CX, y: 310, text: `Full grid: ${S.n} numbers`, fs: 28 });
      const gridBar = D4.bar(stage, { x: CX - BW / 2, y: 338, w: BW, h: 42, tone: "red" });
      const listLab = D4.label(stage, { x: CX, y: 430, text: "", fs: 28 });
      const listBar = D4.bar(stage, { x: CX - BW / 2, y: 458, w: BW, h: 42, tone: "green" });

      return (t) => {
        let count = 0;
        g.all((r, c) => {
          const cell = cellOf[`${r},${c}`];
          const k = cell ? ramp(t, fillAt(cell.j), fillAt(cell.j) + 0.25, E.lin) : 0;
          if (k > 0) count++;
          const st = k > 0 ? D14.cellSt(cell.v) : D14.cellSt(0);
          return {
            ...st,
            s: 1 + 0.15 * (cell ? flash(t, fillAt(cell.j), fillAt(cell.j) + 0.3) : 0),
            o: ramp(t, 0.1, 0.4, E.lin),
          };
        });
        head.set({ k: ramp(t, 0.1, 0.4, E.lin) });
        const kIn = ramp(t, 0.5, 0.8, E.lin);
        nz.set({ text: `Non-zero cells: ${count}`, k: kIn });
        sp.set({ text: `Sparsity: ${S.sparsity(count)}%`, k: kIn });
        const dense = count > S.n / 2;
        kind.set({
          text: dense ? "dense: mostly filled" : "sparse: mostly 0",
          tone: dense ? "blue" : "grey",
          k: dense
            ? ramp(t, fillAt(S.n / 2), fillAt(S.n / 2) + 0.3, E.lin)
            : ramp(t, 3.4, 3.7, E.lin) * (1 - ramp(t, 7.8, 8.0, E.lin)),
        });
        const kb = ramp(t, 4.2, 4.6, E.lin);
        const listN = S.list(count);
        const listBig = listN > S.n;
        gridLab.set({ k: kb, tone: listBig ? "green" : "red" });
        listLab.set({ k: kb, text: `Non-zero list: ${listN} numbers`, tone: listBig ? "red" : "green" });
        gridBar.set({ k: (S.n / MAX) * ramp(t, 4.3, 4.9), tone: listBig ? "green" : "red", o: kb });
        listBar.set({ k: (listN / MAX) * ramp(t, 4.6, 5.2), tone: listBig ? "red" : "green", o: kb });
      };
    },
  });
})();

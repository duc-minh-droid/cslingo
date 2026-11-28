/* Lecture 14 (ds-14) · scene 8 (READING A ROW BACK): rebuild row 2 of the slides' 4 x 6 matrix from its CSR arrays, then
   an empty row (lesson 14.5, "Read a row back"). Data from D14.M12 / F12 / R2 and D14.M3 / F3 / R3. Colours: grey zeros, blue
   the values (V), orange the columns (COL_INDEX), purple the bookmarks (ROW_INDEX), green the slice and the rebuilt row.
   Story (local seconds): 0.5 the matrix (row 2 still empty, dashed) and its three arrays; 2.4 ROW_INDEX[2] = 4 and
   ROW_INDEX[3] = 7 glow purple, "start 4", "end 7"; 4.8 a green frame covers positions 4 to 6 of V and COL_INDEX; 7.0 the
   values 50, 60, 70 fly into row 2 at columns 2, 3, 4, the other cells of the row turn grey 0, a green tick; 9.4-10.0 the
   picture changes to the 3 x 3 matrix with an empty middle row: ROW_INDEX 0, 2, 2, 3; 10.4 the two middle bookmarks (2 and 2)
   glow purple, 10.9 a grey dashed frame on the all-zero middle row and "empty slice: all 0". Hold to 14. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const F = D14.F12;
  const R = D14.R2;
  const RR = 2;
  const F3 = D14.F3;
  const R3 = D14.R3;
  D14.same("read-row scene: row 2 spans V[4..7)", [R.start, R.end], [4, 7]);
  const GX = 250;
  const CS = 60;
  const AX = 254;
  const SW = 70;
  const SG = 8;
  const inSlice = (i) => i >= R.start && i < R.end;

  V.scene({
    kicker: "READING A ROW BACK",
    title: ["Open at one bookmark,", "stop at the next"],
    dur: 14,
    caps: [
      [0.4, 2.2, "Read row 2 of the slides' 4 × 6 matrix."],
      [2.4, 4.6, `Start = ROW_INDEX[${RR}] = ${R.start}, end = ROW_INDEX[${RR + 1}] = ${R.end}.`],
      [4.8, 6.8, `Slice V: ${R.vals.join(", ")} at columns ${R.cols.join(", ")}.`],
      [7.0, 9.4, `Row ${RR} is ${R.row.join(", ")}.`],
      [9.6, 13.7, `Equal bookmarks, ${F3.ROW[1]} and ${F3.ROW[2]}: an empty slice, an all-zero row.`],
    ],
    build(stage) {
      // ---- part A: the 4 x 6 matrix ----
      const A = V.h("div", {
        style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
      });
      stage.append(A);
      const g = D14.grid(A, { x: GX, y: 0, M: D14.M12, cs: CS, gap: 6, fs: 28, idx: true });
      const mk = (name, len, y, tone) =>
        D14.arr(A, { x: AX, y, name, n: len, w: SW, h: 56, gap: SG, tone, side: "left" });
      const aV = mk("V", F.V.length, 328, "blue");
      const aC = mk("COL_INDEX", F.COL.length, 406, "orange");
      const aR = mk("ROW_INDEX", F.ROW.length, 484, "purple");
      const slice = D14.frame(A, { tone: "green", w: 6 });
      const startLab = D4.label(A, {
        x: aR.mid(RR).x + 24,
        y: 580,
        text: `start ${R.start}`,
        tone: "purple",
        fs: 28,
        anchor: "r",
      });
      const endLab = D4.label(A, {
        x: aR.mid(RR + 1).x - 24,
        y: 580,
        text: `end ${R.end}`,
        tone: "purple",
        fs: 28,
        anchor: "l",
      });
      const svgA = D4.svg(A);
      const rowEnd = g.cell(RR, 5);
      const tick = L5.tick(rowEnd.x + 64, rowEnd.y, 52, "green", { w: 9 });
      svgA.append(tick);
      const flies = R.vals.map(() => D14.fly(A, { tone: "blue" }));

      // ---- part B: the empty middle row ----
      const B = V.h("div", {
        style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
      });
      stage.append(B);
      const g3 = D14.grid(B, { x: 40, y: 60, M: D14.M3, cs: 76, gap: 8, fs: 34, idx: true });
      const mk3 = (name, len, y, tone) =>
        D14.arr(B, { x: 540, y, name, n: len, w: 66, h: 58, gap: 10, tone, side: "above" });
      const bV = mk3("V", F3.V.length, 90, "blue");
      const bC = mk3("COL_INDEX", F3.COL.length, 230, "orange");
      const bR = mk3("ROW_INDEX", F3.ROW.length, 370, "purple");
      const emptyRing = D14.frame(B, { tone: "grey", dash: true, w: 5 });
      const emptyLab = D4.label(B, { x: 40 + g3.w / 2 + 23, y: 470, text: "empty slice: all 0", fs: 30 });
      const svgB = D4.svg(B);
      const mark = L5.arrow(bV.edge(R3.start), 20, bV.edge(R3.start), 82, "purple", 1, { w: 6, head: 16 });
      svgB.append(mark);
      const markLab = D4.label(B, {
        x: bV.edge(R3.start) + 18,
        y: 34,
        text: `start = end = ${R3.start}`,
        tone: "purple",
        fs: 28,
        anchor: "l",
      });

      return (t) => {
        const kA = ramp(t, 0.2, 0.5, E.lin) * (1 - ramp(t, 9.4, 9.7, E.lin));
        V.show(A, kA);
        g.idx(1);
        const kFly = (j) => ramp(t, 7.0 + 0.2 * j, 7.6 + 0.2 * j, E.lin);
        g.all((r, c, v) => {
          if (r !== RR) return D14.cellSt(v);
          const j = R.cols.indexOf(c);
          if (j >= 0)
            return t >= 7.6 + 0.2 * j
              ? D14.cellSt(v, { ring: "green", ringK: ramp(t, 8.3, 8.6) })
              : { ghost: true, text: "" };
          return t >= 8.2 ? D14.cellSt(0, { s: 0.85 + 0.15 * E.pop(ramp(t, 8.2, 8.5)) }) : { ghost: true, text: "" };
        });
        [aV, aC, aR].forEach((a) => a.name(1));
        F.V.forEach((v, i) => {
          const hl = inSlice(i) && t >= 4.8;
          aV.set(i, { text: String(v), tone: "blue", solid: true, s: hl ? 1 + 0.12 * flash(t, 4.9, 5.4) : 1 });
          aC.set(i, { text: String(F.COL[i]), tone: "orange", solid: hl });
        });
        F.ROW.forEach((v, i) => {
          const on = (i === RR || i === RR + 1) && t >= 2.4;
          aR.set(i, {
            text: String(v),
            tone: "purple",
            solid: on,
            ring: on ? "purple" : null,
            ringK: ramp(t, 2.4 + 0.4 * (i - RR), 2.7 + 0.4 * (i - RR)),
          });
        });
        startLab.set({ k: ramp(t, 2.5, 2.8, E.lin) });
        endLab.set({ k: ramp(t, 2.9, 3.2, E.lin) });
        slice.set({
          x: aV.edge(R.start) - 8,
          y: 316,
          w: aV.edge(R.end) - aV.edge(R.start) + 16,
          h: 158,
          k: ramp(t, 4.8, 5.2, E.lin),
        });
        R.vals.forEach((v, j) => {
          flies[j].set({ a: aV.mid(R.start + j), b: g.cell(RR, R.cols[j]), k: kFly(j), text: String(v) });
        });
        L5.drawOn(tick, ramp(t, 8.6, 9.0));

        V.show(B, ramp(t, 9.7, 10.0, E.lin));
        g3.idx(1);
        g3.all((r, c, v) => D14.cellSt(v));
        [bV, bC, bR].forEach((a) => a.name(1));
        F3.V.forEach((v, i) => {
          bV.set(i, { text: String(v), tone: "blue", solid: true });
          bC.set(i, { text: String(F3.COL[i]), tone: "orange" });
        });
        F3.ROW.forEach((v, i) => {
          const on = (i === 1 || i === 2) && t >= 10.4;
          bR.set(i, {
            text: String(v),
            tone: "purple",
            solid: on,
            ring: on ? "purple" : null,
            ringK: ramp(t, 10.4, 10.7),
            s: on ? 1 + 0.12 * flash(t, 10.4, 10.9) : 1,
          });
        });
        L5.drawOn(mark, ramp(t, 10.6, 11.0));
        markLab.set({ k: ramp(t, 10.8, 11.1, E.lin) });
        const mid = g3.cell(1, 0);
        emptyRing.set({ x: mid.x - 46, y: mid.y - 46, w: 3 * 84 + 8, h: 92, k: ramp(t, 10.9, 11.2, E.lin) });
        emptyLab.set({ k: ramp(t, 11.2, 11.5, E.lin) });
      };
    },
  });
})();

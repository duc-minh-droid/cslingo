/* Lecture 14 (ds-14) · scene 9 (COMPRESSED SPARSE COLUMN): read the slides' 4 x 4 matrix column by column into VALUES,
   ROW_INDEX and COL_PTR, then read column 0 back (lesson 14.6). Data from D14.M13 / F13 / C0 (the lesson's formats()).
   Colours: grey zeros and the reading cursor, blue the values (VALUES), orange the rows (ROW_INDEX and the row numbers), purple
   the bookmarks (COL_PTR, the ticks above VALUES), green the column read back.
   Story (local seconds): 0.2 matrix and empty arrays; 0.5-4.5 a cursor reads the 16 cells column by column, top to bottom
   (0.25 s a cell); at each non-zero a blue packet flies into VALUES and an orange packet (its row number) into ROW_INDEX;
   4.6-6.2 COL_PTR fills 0, 2, 3, 4, 5 (one every 0.4 s), a purple tick drops above VALUES where that column starts and the
   matrix column gets a purple ring; 7.0 COL_PTR[0] and COL_PTR[1] glow; 7.5 a green frame covers VALUES and ROW_INDEX 0 to 1;
   8.1-8.9 the two values fly into column 0 at rows 0 and 3 (green rings); 9.1 a green frame on column 0 and a tick. Hold to 11. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const M = D14.M13;
  const F = D14.F13;
  const C = D14.C0;
  const m = M.length;
  const n = M[0].length;
  D14.same("csc scene: n + 1 bookmarks", F.cPTR.length, n + 1);
  const CELL = 0.25;
  const T0 = 0.5;
  const nzAt = F.byCol.map(([r, c]) => T0 + CELL * (c * m + r));
  const PTR_AT = (i) => 4.6 + 0.4 * i;
  const AX = 596;
  const SW = 58;
  const SG = 8;
  const GY = 140;

  V.scene({
    kicker: "COMPRESSED SPARSE COLUMN",
    title: ["The same trick,", "turned on its side"],
    dur: 11,
    caps: [
      [0.4, 4.4, `CSC reads column by column: VALUES = ${F.cV.join(", ")}.`],
      [4.6, 6.8, `COL_PTR marks where each column starts: ${F.cPTR.join(", ")}.`],
      [
        7.0,
        10.7,
        `Column 0: from ${C.start} to ${C.end}, so ${C.vals[0]} at row ${C.rows[0]} and ${C.vals[1]} at row ${C.rows[1]}.`,
      ],
    ],
    build(stage) {
      const g = D14.grid(stage, { x: 12, y: GY, M, cs: 72, gap: 8, fs: 34, idx: true });
      const mk = (name, len, y, tone) =>
        D14.arr(stage, { x: AX, y, name, n: len, w: SW, h: 58, gap: SG, tone, side: "left" });
      const aV = mk("VALUES", F.cV.length, 130, "blue");
      const aR = mk("ROW_INDEX", F.cROW.length, 250, "orange");
      const aP = mk("COL_PTR", F.cPTR.length, 370, "purple");
      const svg = D4.svg(stage);
      const ticks = F.cPTR.map((p) => {
        const x = aV.edge(p);
        const a = L5.arrow(x, 64, x, 122, "purple", 1, { w: 6, head: 16 });
        svg.append(a);
        return a;
      });
      const bottom = g.cell(m - 1, 0);
      const tick = L5.tick(bottom.x, bottom.y + 84, 52, "green", { w: 9 });
      svg.append(tick);
      const cursor = D14.frame(stage, { tone: "grey", w: 5 });
      const colRing = D14.frame(stage, { tone: "purple", w: 5 });
      const slice = D14.frame(stage, { tone: "green", w: 6 });
      const colFrame = D14.frame(stage, { tone: "green", w: 6 });
      const flyV = F.byCol.map(() => D14.fly(stage, { tone: "blue" }));
      const flyR = F.byCol.map(() => D14.fly(stage, { tone: "orange" }));
      const back = C.vals.map(() => D14.fly(stage, { tone: "green" }));

      return (t) => {
        const kIn = ramp(t, 0.1, 0.4, E.lin);
        g.idx(kIn);
        g.all((r, c, v) => {
          const j = c === 0 ? C.rows.indexOf(r) : -1;
          const land = 8.7 + 0.2 * j;
          return D14.cellSt(v, {
            o: kIn,
            ring: j >= 0 ? "green" : null,
            ringK: j >= 0 ? ramp(t, land, land + 0.3) : 0,
            s: j >= 0 ? 1 + 0.12 * flash(t, land, land + 0.4) : 1,
          });
        });
        [aV, aR, aP].forEach((a) => a.name(kIn));
        F.cV.forEach((v, i) => {
          const land = nzAt[i] + 0.6;
          const done = t >= land;
          const pop = 1 + 0.15 * flash(t, land, land + 0.3);
          const inSlice = i >= C.start && i < C.end && t >= 7.5;
          aV.set(i, done ? { text: String(v), tone: "blue", solid: true, s: pop } : { ghost: true, text: "", o: kIn });
          aR.set(
            i,
            done
              ? { text: String(F.cROW[i]), tone: "orange", solid: inSlice, s: pop }
              : { ghost: true, text: "", o: kIn },
          );
          const [r, c] = F.byCol[i];
          const k = ramp(t, nzAt[i] + 0.1, land, E.lin);
          flyV[i].set({ a: g.cell(r, c), b: aV.mid(i), k, text: String(v) });
          flyR[i].set({ a: { x: 28, y: g.cell(r, c).y }, b: aR.mid(i), k, text: String(r), bow: 40 });
        });
        const q = Math.floor((t - T0) / CELL);
        const reading = t >= T0 && q < m * n;
        const p = g.cell(Math.max(0, q % m), Math.min(n - 1, Math.max(0, Math.floor(q / m))));
        cursor.set({ x: p.x - 42, y: p.y - 42, w: 84, h: 84, k: reading ? 1 : 0 });
        F.cPTR.forEach((v, i) => {
          const k = ramp(t, PTR_AT(i), PTR_AT(i) + 0.3, E.lin);
          const glow = (i === 0 || i === 1) && t >= 7.0;
          aP.set(
            i,
            k > 0
              ? {
                  text: String(v),
                  tone: "purple",
                  solid: true,
                  s: 0.85 + 0.15 * E.pop(k),
                  ring: glow ? "purple" : null,
                  ringK: ramp(t, 7.0 + 0.2 * i, 7.3 + 0.2 * i),
                }
              : { ghost: true, text: "", o: kIn },
          );
          L5.drawOn(ticks[i], k);
        });
        const ci = Math.floor((t - PTR_AT(0)) / 0.4);
        const top = g.cell(0, Math.min(n - 1, Math.max(0, ci)));
        colRing.set({ x: top.x - 42, y: top.y - 42, w: 84, h: m * 80 + 4, k: t >= PTR_AT(0) && ci < n ? 1 : 0 });
        slice.set({
          x: aV.edge(C.start) - 8,
          y: 118,
          w: aV.edge(C.end) - aV.edge(C.start) + 16,
          h: 202,
          k: ramp(t, 7.5, 7.9, E.lin),
        });
        C.vals.forEach((v, j) => {
          back[j].set({
            a: aV.mid(C.start + j),
            b: g.cell(C.rows[j], 0),
            k: ramp(t, 8.1 + 0.2 * j, 8.7 + 0.2 * j, E.lin),
            text: String(v),
          });
        });
        const c0 = g.cell(0, 0);
        colFrame.set({ x: c0.x - 44, y: c0.y - 44, w: 88, h: m * 80 + 8, k: ramp(t, 9.1, 9.4, E.lin) });
        L5.drawOn(tick, ramp(t, 9.3, 9.7));
      };
    },
  });
})();

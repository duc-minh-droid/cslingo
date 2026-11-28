/* Lecture 14 (ds-14) · scene 7 (COMPRESSED SPARSE ROW): read the slides' 4 x 4 matrix row by row into V, COL_INDEX and
   ROW_INDEX (lesson 14.5). Data from D14.M9 / D14.F9 (the lesson's formats()). Colours: grey zeros and the reading cursor,
   blue the values (V), orange the columns (COL_INDEX and the column numbers), purple the bookmarks (ROW_INDEX, the ticks above V,
   the brace).
   Story (local seconds): 0.2 matrix and empty arrays; 0.5-4.5 a cursor reads the 16 cells row by row (0.25 s a cell); at each
   non-zero a blue packet flies into V and an orange packet (its column number) into COL_INDEX; 4.9-6.9 ROW_INDEX fills 0, 1, 2,
   3, 4 (one every 0.5 s) while a purple tick drops above V where that row starts and the matrix row gets a purple ring;
   8.4 a purple brace under ROW_INDEX "4 rows: 5 entries (m + 1)"; 9.4 the last entry pulses, "the last marks the end".
   Hold to 13. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const M = D14.M9;
  const F = D14.F9;
  const m = M.length;
  const n = M[0].length;
  D14.same("csr scene: m + 1 bookmarks", F.ROW.length, m + 1);
  const CELL = 0.25;
  const T0 = 0.5;
  const qOf = (r, c) => r * n + c;
  const nzAt = F.nz.map(([r, c]) => T0 + CELL * qOf(r, c));
  const ROW_AT = (i) => 4.9 + 0.5 * i;
  const AX = 596;
  const SW = 58;
  const SG = 8;

  V.scene({
    kicker: "COMPRESSED SPARSE ROW",
    title: ["Values, columns,", "and bookmarks for each row"],
    dur: 13,
    caps: [
      [0.4, 4.6, `Read row by row: V = ${F.V.join(", ")}; COL_INDEX = ${F.COL.join(", ")}.`],
      [4.8, 8.2, `ROW_INDEX marks where each row starts in V: ${F.ROW.join(", ")}.`],
      [8.4, 12.7, "m rows need m + 1 bookmarks: the last marks the end."],
    ],
    build(stage) {
      const g = D14.grid(stage, { x: 12, y: 140, M, cs: 72, gap: 8, fs: 34, idx: true });
      const mk = (name, len, y, tone) =>
        D14.arr(stage, { x: AX, y, name, n: len, w: SW, h: 58, gap: SG, tone, side: "left" });
      const aV = mk("V", F.V.length, 130, "blue");
      const aC = mk("COL_INDEX", F.COL.length, 250, "orange");
      const aR = mk("ROW_INDEX", F.ROW.length, 370, "purple");
      const svg = D4.svg(stage);
      const ticks = F.ROW.map((p) => {
        const x = aV.edge(p);
        const a = L5.arrow(x, 64, x, 122, "purple", 1, { w: 6, head: 16 });
        svg.append(a);
        return a;
      });
      const x1 = aR.edge(0) + SG / 2;
      const x2 = aR.edge(F.ROW.length) - SG / 2;
      const P = D14.tone("purple");
      const brace = V.s("path", {
        d: `M ${x1} 444 V 458 H ${(x1 + x2) / 2 - 12} L ${(x1 + x2) / 2} 472 L ${(x1 + x2) / 2 + 12} 458 H ${x2} V 444`,
        fill: "none",
        stroke: P.c,
        "stroke-width": 5,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
        pathLength: "1",
      });
      svg.append(brace);
      const braceLab = D4.label(stage, {
        x: (x1 + x2) / 2,
        y: 510,
        text: `${m} rows: ${m + 1} entries (m + 1)`,
        tone: "purple",
        fs: 30,
      });
      const endLab = D4.label(stage, {
        x: (x1 + x2) / 2,
        y: 566,
        text: "the last marks the end",
        tone: "purple",
        fs: 30,
      });
      const cursor = D14.frame(stage, { tone: "grey", w: 5 });
      const rowRing = D14.frame(stage, { tone: "purple", w: 5 });
      const flyV = F.nz.map(() => D14.fly(stage, { tone: "blue" }));
      const flyC = F.nz.map(() => D14.fly(stage, { tone: "orange" }));

      return (t) => {
        const kIn = ramp(t, 0.1, 0.4, E.lin);
        g.idx(kIn);
        g.all((r, c, v) => D14.cellSt(v, { o: kIn }));
        [aV, aC, aR].forEach((a) => a.name(kIn));
        F.V.forEach((v, i) => {
          const land = nzAt[i] + 0.6;
          const done = t >= land;
          aV.set(
            i,
            done
              ? { text: String(v), tone: "blue", solid: true, s: 1 + 0.15 * flash(t, land, land + 0.3) }
              : { ghost: true, text: "", o: kIn },
          );
          aC.set(
            i,
            done
              ? { text: String(F.COL[i]), tone: "orange", s: 1 + 0.15 * flash(t, land, land + 0.3) }
              : { ghost: true, text: "", o: kIn },
          );
          const [r, c] = F.nz[i];
          const k = ramp(t, nzAt[i] + 0.1, land, E.lin);
          flyV[i].set({ a: g.cell(r, c), b: aV.mid(i), k, text: String(v) });
          flyC[i].set({ a: { x: g.cell(r, c).x, y: 158 }, b: aC.mid(i), k, text: String(c), bow: -40 });
        });
        const q = Math.floor((t - T0) / CELL);
        const reading = t >= T0 && q < m * n;
        const cr = Math.min(m - 1, Math.max(0, Math.floor(q / n)));
        const cc = Math.max(0, q % n);
        const p = g.cell(cr, cc);
        cursor.set({ x: p.x - 42, y: p.y - 42, w: 84, h: 84, k: reading ? 1 : 0 });
        F.ROW.forEach((v, i) => {
          const k = ramp(t, ROW_AT(i), ROW_AT(i) + 0.3, E.lin);
          aR.set(
            i,
            k > 0
              ? {
                  text: String(v),
                  tone: "purple",
                  solid: true,
                  s: 0.85 + 0.15 * E.pop(k) + 0.15 * flash(t, 9.4, 9.9) * (i === m),
                  ring: i === m ? "purple" : null,
                  ringK: ramp(t, 9.4, 9.7),
                }
              : { ghost: true, text: "", o: kIn },
          );
          L5.drawOn(ticks[i], k);
        });
        const ri = Math.floor((t - ROW_AT(0)) / 0.5);
        const ringOn = t >= ROW_AT(0) && ri < m;
        const rp = g.cell(Math.min(m - 1, Math.max(0, ri)), 0);
        rowRing.set({ x: rp.x - 42, y: rp.y - 42, w: n * 80 + 4, h: 84, k: ringOn ? 1 : 0 });
        brace.style.strokeDasharray = `${ramp(t, 8.4, 8.9).toFixed(3)} 1`;
        V.show(brace, ramp(t, 8.4, 8.45, E.lin));
        braceLab.set({ k: ramp(t, 8.7, 9.0, E.lin) });
        endLab.set({ k: ramp(t, 9.5, 9.8, E.lin) });
      };
    },
  });
})();

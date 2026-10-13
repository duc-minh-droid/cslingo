/* Phase 6 · Error Detection & Correction: the long-division widget (VID.a6, short name A6). Same rules as common-2.js: positions
   are the parent's pixels, every call is PURE (pass everything every frame). Needs a6/common.js and a6/common-2.js.

   const d = A6.division(parent, {x, y, dividend: "1011000", gen: "1101", size: 60, gap: 8, rowGap: 14, padFrom: 4, o...});
       A mod-2 long division drawn as the rows a person writes (x, y = the top-left of the FIRST tile of the dividend row;
       the XOR signs hang size * 0.95 px to the left of x, so keep x >= 60). Rows, from the top:
         row 0        the dividend: tiles 0 .. padFrom - 1 grey (the message), tiles padFrom .. end orange (the appended zeros
                      or the check bits). padFrom: dividend.length means all grey.
         row 2i + 1   the generator under the bits it meets in step i (purple tiles, columns col .. col + gen.length - 1) and a
                      purple XOR sign to the left of the row
         row 2i + 2   the result of the XOR: the whole row, the XOR'd window flipping in tile by tile, the leading zeros as
                      dashed ghost tiles ("done"), the rest grey tiles
       The steps are the real ones from A6.divide(dividend, gen) (d.steps; for 1011000 / 1101: two steps, columns 0 and 1,
       remainder 100 in the last three tiles of the last row, which turn orange when remK reaches 1).
   d.update({p, padK, remK, o, msgK})
       p     progress 0 .. steps.length. Step i runs from p = i to i + 1: first half the window of the row above is ringed in
             purple and the generator slides in; second half the XOR result flips in. Use the fractions to time it, e.g. one step
             = 2.4 s means p = (t - t0) / 2.4.
       padK  0..1 how far the appended zeros (tiles padFrom ..) have popped into row 0 (default 1);  msgK the message tiles (1)
       remK  0..1 the remainder tiles of the last row turn solid orange (with one small bounce on the way);  o opacity of all
   Geometry (parent pixels): d.width, d.height (the whole stack), d.rowY(r) top of row r, d.colX(c) left of column c,
       d.mid(r, c) -> {x, y} the centre of tile c in row r, d.last -> the index of the last row (2 * steps.length),
       d.remMid() -> {x, y} the middle of the remainder tiles of the last row, d.xorMid(i) -> {x, y} the XOR sign of step i,
       d.rem (the remainder string), d.steps, d.n (columns), d.glen (generator length), d.size, d.el. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { clamp, flash, ease: E } = V;

  function division(parent, opt = {}) {
    const { x = 0, y = 0, dividend = "1011000", gen = "1101", size = 60, gap = 8, rowGap = 14 } = opt;
    const div = A6.divide(dividend, gen);
    const { steps } = div;
    const n = dividend.length;
    const glen = gen.length;
    const padFrom = opt.padFrom ?? n;
    const rowsN = 1 + 2 * steps.length;
    const rowY = (r) => y + r * (size + rowGap);
    const colX = (c) => x + c * (size + gap);
    const width = n * size + (n - 1) * gap;
    const height = rowsN * size + (rowsN - 1) * rowGap;
    const root = V.h("div", { style: A6.abs(0, 0, 0, 0) });
    parent.append(root);
    const rows = Array.from({ length: rowsN }, (_, r) =>
      A6.bits(root, { x, y: rowY(r), bits: r === 0 ? dividend : "0".repeat(n), size, gap }),
    );
    const svg = L5.svg(root, 936, 640);
    const xors = steps.map((_, i) =>
      svg.appendChild(A6.xorIcon(x - size * 0.5, rowY(2 * i + 1) + size / 2, size * 0.62)),
    );
    const firstOne = (s) => {
      const k = [...s].indexOf("1");
      return k < 0 ? n : k;
    };

    function update(st = {}) {
      const p = clamp(st.p ?? 0, 0, steps.length);
      const o = st.o ?? 1;
      const padK = st.padK ?? 1;
      const msgK = st.msgK ?? 1;
      const remK = clamp(st.remK ?? 0);
      // the state of every tile of every row, then applied in one go (a ring on a row belongs to the step below it)
      const S = rows.map(() => Array.from({ length: n }, () => ({ o: 0 })));
      for (let c = 0; c < n; c++) {
        const pad = c >= padFrom;
        const k = pad ? clamp(padK * (n - padFrom + 1) - (c - padFrom)) : clamp(msgK * (padFrom + 1) - c);
        S[0][c] = { tone: pad ? "orange" : "grey", s: E.pop(k), o: Math.min(1, k * 4) * o };
      }
      steps.forEach((s, i) => {
        const u = clamp(p - i);
        const ua = clamp(u / 0.5);
        const ub = clamp((u - 0.5) / 0.5);
        const lead = firstOne(s.after);
        const last = i === steps.length - 1;
        for (let c = 0; c < n; c++) {
          const j = c - s.col;
          const inWin = j >= 0 && j < glen;
          if (inWin) {
            // the generator slides in, and the window of the row above is ringed
            const k = clamp(ua * 1.6 - j * 0.15);
            S[2 * i + 1][c] = { tone: "purple", text: gen[j], y: (1 - E.out(k)) * -22, o: Math.min(1, k * 4) * o };
            Object.assign(S[2 * i][c], { ring: "purple", ringK: ua * (1 - ub) });
          }
          // the XOR result: the window flips in tile by tile, the copied bits appear together
          const k = inWin ? clamp(ub * 1.6 - j * 0.15) : clamp(ub * 3);
          const hot = last && c >= n - (glen - 1) && remK > 0.002;
          S[2 * i + 2][c] = {
            text: s.after[c],
            tone: hot ? "orange" : "grey",
            solid: hot,
            ghost: c < lead && !hot,
            s: E.pop(k) * (hot ? 1 + 0.14 * flash(remK, 0, 1) : 1),
            o: Math.min(1, k * 4) * o,
          };
        }
        V.place(xors[i], { s: 0.6 + 0.4 * E.pop(ua), o: Math.min(1, ua * 4) * o });
      });
      rows.forEach((row, r) => row.all((c) => S[r][c]));
    }
    update({});
    const mid = (r, c) => ({ x: colX(c) + size / 2, y: rowY(r) + size / 2 });
    return {
      el: root,
      update,
      steps,
      rem: div.rem,
      n,
      glen,
      size,
      width,
      height,
      last: rowsN - 1,
      rowY,
      colX,
      mid,
      remMid: () => ({ x: (colX(n - glen + 1) + colX(n - 1) + size) / 2, y: rowY(rowsN - 1) + size / 2 }),
      xorMid: (i) => ({ x: x - size * 0.5, y: rowY(2 * i + 1) + size / 2 }),
    };
  }

  A6.division = division;
})();

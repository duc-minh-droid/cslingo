/* Phase 7 · Information Theory & Compression (algo-7), scene 03: information is surprise, counted in bits.
   A ladder of five rows. In each one the chance of the news halves (certain, 1 in 2, 1 in 4, 1 in 8, 1 in 16: blue bars, 300, 150,
   75, 37.5 and 18.75 px, drawn at exactly those widths) and every halving adds exactly one bit of surprise (orange cells, 0 to 4).
   A bit is one yes-or-no answer: a key at the bottom shows an orange cell (the same cell as in the rows), a tick and a cross
   and says so before the first bit is counted. Every number (bar widths, cell counts, labels) comes from A7.LADDER.
   Margins: everything sits at least 12 px inside the stage (labels at x 12, headers at y 12, the key ends at y 628). */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;

  const LAD = A7.LADDER;
  // the ladder is what the scene says it is: each row halves the chance and adds one bit
  A7.same(
    "scene 3 bits",
    LAD.map((r) => r.bits),
    [0, 1, 2, 3, 4],
  );
  LAD.forEach((r, k) => {
    if (k) A7.close(`scene 3 row ${k} halves the chance`, r.p, LAD[k - 1].p / 2, 1e-12);
    if (k) A7.same(`scene 3 row ${k} adds one bit`, r.bits, LAD[k - 1].bits + 1);
  });

  const LABEL_X = 12; // the row labels (12 px stage margin)
  const BAR_X = 182; // the chance bars: the whole width = everything that could happen
  const BAR_W = 300;
  const CELL_X = 552; // the surprise cells
  const TAG_X = 752;
  const ROW_H = 56;
  const rowY = (k) => 80 + 104 * k; // rows at 80, 184, 288, 392, 496 (the last lip ends at 558)
  const ROW_AT = [0.4, 2.4, 4.1, 5.8, 7.5]; // when each row starts (local s)
  const bitsText = (n) => `${n} bit${n === 1 ? "" : "s"}`;
  const KEY_Y = 574; // the key's words (44 px high) and its cell (52 px, like the cells in the rows) sit 12 px under the last row's lip
  const KEY_H = 44;
  const KEY_MID = KEY_Y + KEY_H / 2; // the key's centre line (y 596); the cell ends at y 622 with its lip at 628
  // the bars are drawn at exactly these widths: they halve, and even the last one is clearly wider than the helper's 14 px minimum
  const WIDTHS = LAD.map((r) => BAR_W * r.p);
  A7.same("scene 3 bar widths", WIDTHS, [300, 150, 75, 37.5, 18.75]);
  WIDTHS.forEach((w, k) => {
    if (w < 16) throw new Error(`scene 3: bar ${k} would be drawn at ${w} px, too thin to compare`);
    if (k) A7.close(`scene 3 bar ${k} is half the one above`, w, WIDTHS[k - 1] / 2, 1e-9);
  });

  V.scene({
    kicker: "SURPRISE",
    title: ["Rare news carries", "more information"],
    dur: 11,
    caps: [
      [0.4, 2.3, "News we expect tells us nothing: 0 bits."],
      [2.8, 5.0, "Half the chance: one yes-or-no answer, 1 bit."],
      [5.1, 7.9, "Each time the chance halves, one more bit."],
      [8.8, 10.4, "Rarer news tells us more."],
    ],
    build(stage) {
      // ----- column headers -----
      const hChance = A7.tag(stage, { x: BAR_X, y: 12, text: "chance", tone: "grey" });
      const hSurprise = A7.tag(stage, { x: CELL_X, y: 12, text: "surprise", tone: "orange" });

      // ----- the five rows -----
      const rows = LAD.map((r, k) => {
        const y = rowY(k);
        return {
          label: A7.tag(stage, { x: LABEL_X, y: y + 4, text: r.say, tone: "grey" }),
          track: A7.bar(stage, { x: BAR_X, y, w: BAR_W, h: ROW_H, tone: "grey", solid: false }),
          fill: A7.bar(stage, { x: BAR_X, y, w: BAR_W, h: ROW_H, tone: "blue", solid: true }),
          cells: k
            ? A7.bits(stage, {
                x: CELL_X,
                y: y + 2,
                groups: "1".repeat(r.bits),
                cell: 40,
                h: 52,
                gap: 8,
                digits: false,
                tone: "orange",
                solid: true,
              })
            : null,
          tag: A7.tag(stage, { x: TAG_X, y: y + 4, text: bitsText(r.bits), tone: "orange", solid: true }),
        };
      });

      // ----- the key: a bit is one yes-or-no answer (the same orange cell as in the rows, then a tick and a cross, then the words) -----
      const keyCell = A7.bits(stage, {
        x: LABEL_X,
        y: KEY_MID - 26,
        groups: "1",
        cell: 40,
        h: 52,
        digits: false,
        tone: "orange",
        solid: true,
      });
      const icons = L5.svg(stage);
      const tick = L5.tick(92, KEY_MID, 46, "green");
      const cross = L5.cross(152, KEY_MID, 46, "red");
      icons.append(tick, cross);
      const key = A7.tag(stage, {
        x: 192,
        y: KEY_Y,
        text: `${bitsText(LAD[1].bits)}: one yes-or-no answer`,
        tone: "orange",
        h: KEY_H,
      });

      return (t) => {
        // headers
        hChance.set({ k: ramp(t, 0.2, 0.6) });
        hSurprise.set({ k: ramp(t, 0.2, 0.6) });

        // row 0: certain. The label, the track and a full bar pop in
        const r0 = rows[0];
        r0.label.set({ k: ramp(t, 0.4, 0.7) });
        r0.track.set({ o: ramp(t, 0.4, 0.7, E.lin) });
        r0.fill.set({ k: ramp(t, 0.5, 0.9) * LAD[0].p, o: ramp(t, 0.5, 0.6, E.lin) });

        // rows 1-4: the bar starts at the last row's chance and HALVES, then the new bit pops in
        for (let k = 1; k < rows.length; k++) {
          const u = t - ROW_AT[k];
          const row = rows[k];
          row.label.set({ k: ramp(u, 0, 0.3) });
          row.track.set({ o: ramp(u, 0, 0.3, E.lin) });
          row.fill.set({ k: lerp(LAD[k - 1].p, LAD[k].p, ramp(u, 0.2, 0.9, E.inOut)), o: ramp(u, 0, 0.2, E.lin) });
          row.cells.set({ k: ramp(u, 0.9, 1.2), solid: true });
        }

        // the key pops in before the first bit is counted; its cell, tick and cross nod when the first yes-or-no cell appears
        const pulse = flash(t, ROW_AT[1] + 0.9, ROW_AT[1] + 1.4);
        const nod = 1 + 0.25 * pulse;
        key.set({ k: ramp(t, 0.8, 1.2) });
        keyCell.set({ k: ramp(t, 0.8, 1.2), solid: true, s: 1 + 0.12 * pulse });
        V.place(tick, { s: ramp(t, 0.8, 1.2, E.pop) * nod, o: ramp(t, 0.8, 0.95, E.lin) });
        V.place(cross, { s: ramp(t, 0.9, 1.3, E.pop) * nod, o: ramp(t, 0.9, 1.05, E.lin) });

        // the five orange tags pulse once, in order (the rarer, the more bits)
        rows.forEach((row, k) => {
          const a = 9.0 + 0.15 * k;
          const base = k === 0 ? ramp(t, 1.2, 1.5) : ramp(t - ROW_AT[k], 1.1, 1.4);
          row.tag.set({ k: base, s: 1 + 0.08 * flash(t, a, a + 0.4) });
        });
      };
    },
  });
})();

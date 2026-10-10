/* Phase 5 · scene 03-turn: the turn test, the one tiny question every hull algorithm asks.
   Three little paths p -> a -> b on a pale grid (maths orientation, y up), one per row of lesson 5.2's table. Each path is walked,
   then a card writes the cross-product sum row by row (a - p, b - p, the two products, the difference) and its sign decides the
   turn: positive = LEFT (green), negative = RIGHT (red), zero = STRAIGHT (orange). A turn arrow, the tinted card and the matching
   legend tile say the verdict. The legend fills up tile by tile, so the last frame shows all three rules next to the last path.
   Every number comes from A5.TRIPLES (asserted below and in common.js). update(t) is a pure function of t. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;
  const MINUS = "−";
  const TIMES = "×";

  // ---------- the facts (asserted) ----------
  const TR = A5.TRIPLES;
  A5.same(
    "turn test verdicts",
    TR.map((T) => [T.cross, T.turn]),
    [
      [11, "left"],
      [-11, "right"],
      [0, "straight"],
    ],
  );
  A5.same(
    "turn test products",
    TR.map((T) => T.terms),
    [
      [12, 1],
      [-6, 5],
      [6, 6],
    ],
  );
  const sgn = (n) => (n < 0 ? MINUS + -n : String(n));
  const par = (n) => (n < 0 ? `(${sgn(n)})` : String(n));
  /** the four lines of the sum for one triple: the two differences, the products, the answer */
  const rowsOf = (T) => [
    `a ${MINUS} p = (${sgn(T.va[0])}, ${sgn(T.va[1])})`,
    `b ${MINUS} p = (${sgn(T.vb[0])}, ${sgn(T.vb[1])})`,
    `${T.va[0]} ${TIMES} ${par(T.vb[1])} ${MINUS} ${T.va[1]} ${TIMES} ${par(T.vb[0])}`,
    `= ${sgn(T.cross)}`,
  ];
  A5.same("sum of triple 1", rowsOf(TR[0]), [`a ${MINUS} p = (3, 1)`, `b ${MINUS} p = (1, 4)`, `3 ${TIMES} 4 ${MINUS} 1 ${TIMES} 1`, "= 11"]); // prettier-ignore
  A5.same("sum of triple 2", rowsOf(TR[1]).slice(1), [`b ${MINUS} p = (5, ${MINUS}2)`, `3 ${TIMES} (${MINUS}2) ${MINUS} 1 ${TIMES} 5`, `= ${MINUS}11`]); // prettier-ignore
  A5.same("sum of triple 3", rowsOf(TR[2]).slice(2), [`2 ${TIMES} 3 ${MINUS} 1 ${TIMES} 6`, "= 0"]);

  // ---------- timings (global seconds; u = seconds into a triple) ----------
  const T0 = [0.3, 5.9, 9.7]; // each triple starts, the previous one fades out as it does
  const ROWS_U = [
    [1.2, 1.8, 2.4], // triple 1 writes its sum slowly, it is the first one the viewer sees
    [0.9, 1.3, 1.7],
    [0.9, 1.3, 1.7],
  ];
  const VERDICT_U = [2.9, 2.3, 2.3]; // the sign decides: 3.2, 8.2 and 12.0 on the video clock
  const TONE = { left: "green", right: "red", straight: "orange" };
  const ICON = [
    [472, 292], // beside a, in the free space of each plot
    [268, 76],
    [236, 268],
  ];

  function build(host) {
    // everything sits 20 px lower than the helpers' own coordinates, so the figure is centred between the headline and the caption
    const stage = V.h("div", { style: { position: "absolute", left: "0px", top: "20px", width: "936px", height: "640px" } });
    host.append(stage);
    const g = A5.grid(stage, { x: 48, y: 56, cols: 7, rows: 5, u: 72 });
    const plots = TR.map((T) =>
      A5.plot(stage, {
        pos: { p: g.xy(...T.p), a: g.xy(...T.a), b: g.xy(...T.b) },
        polys: 0,
        arcs: 0,
        tags: 2,
        segs: 3,
      }),
    );
    const sheets = TR.map(() => A5.sheet(stage, { x: 560, y: 56, w: 364, rows: 4, rowH: 58, fs: 30 }));
    const label = A5.tag(stage, { x: 584, y: 28, text: "cross product", tone: "blue", solid: true });
    const legend = A5.tiles(stage, {
      x: 48,
      y: 470,
      items: [
        { text: "positive: left", tone: "green" },
        { text: "negative: right", tone: "red" },
        { text: "zero: straight", tone: "orange" },
      ],
      w: 284,
      h: 70,
      gap: 12,
      fs: 30,
    });
    const ov = L5.svg(stage);
    const bigIcons = TR.map((T, i) => A5.turnIcon(T.turn, ICON[i][0], ICON[i][1], 72, TONE[T.turn]));
    const cardIcons = TR.map((T, i) => A5.turnIcon(T.turn, 884, sheets[i].rowY(3), 56, TONE[T.turn]));
    ov.append(...bigIcons, ...cardIcons);

    function triple(i, t) {
      const T = TR[i];
      const tone = TONE[T.turn];
      const u = t - T0[i];
      const v = VERDICT_U[i];
      const rowAt = ROWS_U[i];
      const out = i < 2 ? 1 - ramp(t, T0[i + 1], T0[i + 1] + 0.3, lin) : 1; // the next path replaces this one
      const decided = u >= v;
      const kv = ramp(u, v, v + 0.4, lin); // the verdict arrow draws on
      const bump = flash(u, v, v + 0.45);

      // the three points pop in one after another, and turn blue as the walk reaches them
      const reach = [0.6, 1.0, 1.4];
      const points = {};
      ["p", "a", "b"].forEach((name, j) => {
        const k = ramp(u, 0.1 * j, 0.1 * j + 0.3, E.pop);
        const col = decided ? tone : u >= reach[j] ? "blue" : "grey";
        points[name] = { tone: col, solid: col !== "grey", s: lerp(0.5, 1, k) * (1 + 0.12 * bump), o: Math.min(1, k * 4) };
      });

      // the walk p -> a -> b; the first leg flashes while 'a - p' is written, a dashed arrow p -> b shows 'b - p'
      const pathTone = decided ? tone : "blue";
      const second = ramp(u, rowAt[1], rowAt[1] + 0.4, lin) * (1 - ramp(u, v, v + 0.3, lin));
      const segs = [
        { a: "p", b: "b", tone: "blue", dash: true, arrow: true, o: second * 0.85 },
        { a: "p", b: "a", tone: pathTone, arrow: true, w: 1.1, k: ramp(u, 0.6, 1.0, lin), halo: Math.max(flash(u, rowAt[0], rowAt[0] + 0.6), bump) }, // prettier-ignore
        { a: "a", b: "b", tone: pathTone, arrow: true, w: 1.1, k: ramp(u, 1.0, 1.4, lin), halo: bump },
      ];
      // the question, once, before the first sum is finished
      const ask = i === 0 && u >= 1.4 ? ramp(u, 1.4, 1.8, E.pop) * (1 - ramp(u, v - 0.1, v + 0.1, lin)) : 0;
      const tags = ask > 0.002 ? [{ at: "a", anchor: "l", dx: 44, dy: 44, text: "left or right?", tone: "orange", k: Math.min(1, ask), o: ask }] : []; // prettier-ignore
      plots[i].update({ points, segs, tags, o: out });

      // the card with the sum, row by row
      const sh = sheets[i];
      const cardK = ramp(u, rowAt[0] - 0.4, rowAt[0], E.pop);
      sh.card({ tone: decided ? tone : "grey", k: cardK, o: out });
      const rows = rowsOf(T);
      rows.forEach((text, r) => {
        const last = r === 3;
        const at = last ? v : rowAt[r];
        sh.set(r, { text, k: ramp(u, at, at + 0.4, lin), o: out, tone: last ? tone : undefined, bold: last });
      });

      // the verdict arrows: big, in the free space of the plot, and small, inside the card
      [
        [bigIcons[i], 1],
        [cardIcons[i], 1],
      ].forEach(([icon]) => {
        L5.drawOn(icon, kv);
        V.place(icon, { s: lerp(0.7, 1, E.pop(kv)), o: kv > 0.002 ? out : 0 });
      });
    }

    return (t) => {
      g.update({ k: ramp(t, T0[0], T0[0] + 0.6, lin) });
      TR.forEach((_, i) => triple(i, t));
      label.set({ k: ramp(t, T0[0] + ROWS_U[0][0] - 0.4, T0[0] + ROWS_U[0][0], E.pop) });
      TR.forEach((T, i) => {
        const at = T0[i] + VERDICT_U[i];
        const k = ramp(t, at, at + 0.4, E.pop);
        legend.set(i, { solid: true, s: lerp(0.7, 1, k) + 0.05 * flash(t, at + 0.1, at + 0.5), o: Math.min(1, k * 4) });
      });
    };
  }

  V.scene({
    kicker: "THE TURN TEST",
    title: ["Which way does", "the path turn?"],
    dur: 14,
    caps: [
      [0.6, 3.2, "Walk from p to a to b. Left or right?"],
      [3.4, 5.8, "The cross product: positive means a left turn."],
      [6.2, 8.1, "Now try a different path."],
      [8.3, 9.9, "Negative means a right turn."],
      [10, 11.9, "And one more path."],
      [12.1, 13.6, "Zero means a straight line."],
    ],
    build,
  });
})();

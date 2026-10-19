/* Phase 9 · scene 05-table (12 s): test every frequency, that is the DFT.
   The spinning-arrow test of scene 4 is run for EVERY spin speed k = 0..7 on the same 8 samples. The blue samples stand as stems above the
   columns of an 8 x 8 table; row k is the test with k spins (its cell n holds the purple test arrow for sample n); each row, as it runs,
   pulses the eight stems (it reads all 8 samples) and grows one orange bar. Then every cell flashes red once (each cell is one product:
   8 x 8 = 64) and the two tall bars, 1 spin and 7 spins, are joined by a purple arrow: a real wave gives a mirror pair.
   Timeline (local s): 0.2-1.0 stems, 0.6 '8 samples in', row k runs from 1.2 + 0.62 k (cells, purple tint, 8 stem pulses, bar 0.5 s later;
   the two long bars write their value, 4, inside their right end, the same 4 as the total arrow of scene 4),
   3.0 'row number = spins', 6.7 '8 bars out', 8.2-8.7 the red '8 x 8 = 64 products' tag replaces it, 8.35-9.1 the 64 cells flash red in
   reading order (the rings fade 9.35-9.75), 9.4-10.0 the mirror arrow, 9.6-10.4 rows 1 and 7 ring, 9.9 'mirror pair', then hold.
   Every number comes from A9.W8 (common.js) and is asserted below. update(t) is pure. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, flash, ease: E } = V;
  const W8 = A9.W8;
  const lin = E.lin;
  const N = W8.n;
  const ks = Array.from({ length: N }, (_, k) => k);

  // ---- the numbers, from the real transform ----
  A9.same("scene 5 bars", W8.bars, [0, 4, 0, 0, 0, 0, 0, 4]);
  A9.same("scene 5 products", W8.n * W8.n, W8.products);
  A9.same("scene 5 products are 64", W8.products, 64);
  A9.closeAll(
    "scene 5 every bar is the length of its chain",
    W8.all.map((c) => c.len),
    W8.bars,
    1e-9,
  );
  const TALL = ks.filter((k) => W8.bars[k] > 0.5); // the rows whose bar is long: 1 spin and its mirror
  A9.same("scene 5 the tall rows", TALL, [1, 7]);
  A9.same("scene 5 the tall rows mirror each other (1 + 7 = 8)", TALL[0] + TALL[1], N);
  A9.same("scene 5 the two tall bars are equal", W8.bars[TALL[0]], W8.bars[TALL[1]]);
  // row 7's arrows are row 1's arrows turned the other way: their angles add up to a whole turn
  A9.same(
    "scene 5 row 7 is row 1 mirrored",
    ks.every((n) => (W8.ang(TALL[0], n) + W8.ang(TALL[1], n)) % N === 0),
    true,
  );

  // ---- layout (stage px) ----
  const GRID = { x: 100, y: 110, cell: 50, gap: 5, unit: 70 }; // the grid ends at x 535, y 545; the bars start at x 560
  const TAGS = { samples: [540, 24], bars: [580, 564], row: [100, 564], mirror: [680, 326] };
  const BOW = 24; // how far the mirror arrow bulges to the right of the two tall bars (it ends 26 px inside the stage edge)
  const MIRROR_X = 886; // the arrow stands just right of the row rings (they end at x 871)

  // ---- timing ----
  const row0 = 1.2;
  const step = 0.62;
  const rs = (k) => row0 + step * k; // row k starts here
  const FRONT = {
    head: [0.2, 1.0],
    samples: [0.6, 1.1],
    rowTag: [3.0, 3.5], // once four rows stand (the tag sits under the table, so it waits for the table to get there)
    barsTag: [6.7, 7.2],
    swap: [8.2, 8.7],
    products: [8.35, 9.1], // the first and the last cell start to flash
    gone: [9.35, 9.75], // the red rings fade
    mirror: [9.4, 10.0],
    mirrorRows: [9.6, 10.4],
    mirrorTag: [9.9, 10.3],
  };
  const CAPS = [
    [1.2, 3.0, "Run the test at every spin speed."],
    [3.2, 5.0, `Each test reads all ${N} samples.`],
    [6.6, 8.1, "Eight tests give eight bars."],
    [8.3, 9.8, `That is ${N} × ${N} = ${W8.products} products.`],
    [10.0, 11.6, "A real wave gives a mirror pair."],
  ];

  function check() {
    // each caption starts as the picture it names appears (and never before it)
    const starts = [rs(0), rs(3), rs(N - 1) + 0.5, FRONT.swap[0], FRONT.mirror[1]];
    A9.same(
      "scene 5 every caption starts after its picture does",
      CAPS.map((c, i) => c[0] >= starts[i] - 1e-9 && c[0] - starts[i] < 0.6),
      CAPS.map(() => true),
    );
    A9.same(
      "scene 5 captions do not overlap and read at 4.5 words a second or less",
      CAPS.every(
        (c, i) =>
          (i === 0 || c[0] >= CAPS[i - 1][1]) &&
          c[2].split(" ").filter((w) => /\w/.test(w)).length / (c[1] - c[0]) <= 4.5,
      ),
      true,
    );
    A9.same("scene 5 the last bar is done by the third caption", rs(N - 1) + 1.0 <= CAPS[2][0], true);
    A9.same("scene 5 the product caption says 8 x 8 = 64", CAPS[3][2].includes("8 × 8 = 64"), true);
    A9.same("scene 5 the mirror caption comes after the arrow is drawn", CAPS[4][0] >= FRONT.mirror[1], true);
    // the arrow stands clear of the row rings (they end 28 px after the longest bar) and well inside the stage
    const ringEdge = GRID.x + (N * (GRID.cell + GRID.gap) + 20) + W8.bars[TALL[0]] * GRID.unit + 28;
    A9.same("scene 5 the mirror arrow clears the rings", MIRROR_X >= ringEdge + 10, true);
    A9.same("scene 5 the mirror arrow keeps 12 px from the stage edge", MIRROR_X + BOW + 4 <= 936 - 12, true);
  }

  V.scene({
    kicker: "THE DFT",
    title: ["Test every frequency:", "that is the DFT"],
    dur: 12,
    caps: CAPS,
    build(stage) {
      check();
      const G = A9.dftGrid(stage, GRID);
      const ov = A9.svg(stage); // our own layer above the table: stem pulses, the red product rings, the mirror arrow
      const blue = A9.tone("blue");
      const red = A9.tone("red");
      const pulses = ks.map((c) => {
        const tip = G.stem(c);
        return ov.appendChild(
          V.s("circle", {
            cx: A9.f1(tip.x),
            cy: A9.f1(tip.y),
            fill: "none",
            "stroke-width": "4",
            style: { stroke: blue.c },
          }),
        );
      });
      const prods = ks.flatMap((r) =>
        ks.map((c) =>
          ov.appendChild(
            V.s("rect", {
              x: A9.f1(G.left + c * G.pitch),
              y: A9.f1(G.top + r * G.pitch),
              width: GRID.cell,
              height: GRID.cell,
              rx: 12,
              fill: "none",
              "stroke-width": "6",
              style: { stroke: red.c },
            }),
          ),
        ),
      );
      const [a, b] = [G.rowEnd(TALL[0]), G.rowEnd(TALL[1])];
      const mirror = ov.appendChild(A9.arrow(MIRROR_X, a.y, MIRROR_X, b.y, "purple", 1, { w: 6, head: 18, bow: BOW }));

      const samplesTag = A9.tag(stage, {
        x: TAGS.samples[0],
        y: TAGS.samples[1],
        text: `${N} samples in`,
        tone: "blue",
      });
      const barsTag = A9.tag(stage, { x: TAGS.bars[0], y: TAGS.bars[1], text: `${N} bars out`, tone: "orange" });
      const rowTag = A9.tag(stage, { x: TAGS.row[0], y: TAGS.row[1], text: "row number = spins", tone: "purple" });
      const prodTag = A9.tag(stage, {
        x: TAGS.row[0],
        y: TAGS.row[1],
        text: `${N} × ${N} = ${W8.products} products`,
        tone: "red",
        solid: true,
      });
      const mirrorTag = A9.tag(stage, { x: TAGS.mirror[0], y: TAGS.mirror[1], text: "mirror pair", tone: "grey" });

      return (t) => {
        // every row k: its cells pop, it is lit and ringed while it runs, then its bar grows
        const mirrorHot = flash(t, FRONT.mirrorRows[0], FRONT.mirrorRows[1]);
        G.set({
          head: ramp(t, FRONT.head[0], FRONT.head[1], lin),
          rows: (k) => {
            const on = flash(t, rs(k) + 0.1, rs(k) + 0.9);
            return {
              k: ramp(t, rs(k), rs(k) + 0.4, lin),
              lit: on,
              bar: ramp(t, rs(k) + 0.5, rs(k) + 1.0, lin),
              hot: Math.max(on, TALL.includes(k) ? mirrorHot : 0),
            };
          },
        });

        // each test reads all eight samples: the stems pulse left to right as its row runs
        pulses.forEach((p, c) => {
          const f = Math.max(...ks.map((k) => flash(t, rs(k) + 0.1 + 0.04 * c, rs(k) + 0.4 + 0.04 * c)));
          A9.at(p, { r: 12 + 2.5 * f });
          V.show(p, f);
        });

        // each cell is one product: a red ring runs over all 64 in reading order
        const gone = 1 - ramp(t, FRONT.gone[0], FRONT.gone[1], lin);
        prods.forEach((p, i) => {
          const s = FRONT.products[0] + ((FRONT.products[1] - FRONT.products[0]) * i) / (prods.length - 1);
          V.show(p, ramp(t, s, s + 0.15, lin) * gone);
        });

        // tags
        samplesTag.set({ k: ramp(t, FRONT.samples[0], FRONT.samples[1], lin) });
        rowTag.set({
          k: ramp(t, FRONT.rowTag[0], FRONT.rowTag[1], lin),
          o: 1 - ramp(t, FRONT.swap[0], FRONT.swap[0] + 0.3, lin),
        });
        barsTag.set({ k: ramp(t, FRONT.barsTag[0], FRONT.barsTag[1], lin) });
        prodTag.set({ k: ramp(t, FRONT.swap[0] + 0.1, FRONT.swap[1], lin) });

        // the mirror pair
        A9.drawOn(mirror, ramp(t, FRONT.mirror[0], FRONT.mirror[1], E.inOut));
        mirrorTag.set({ k: ramp(t, FRONT.mirrorTag[0], FRONT.mirrorTag[1], lin) });
      };
    },
  });
})();

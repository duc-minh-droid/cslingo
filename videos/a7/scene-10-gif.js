/* Phase 7 · Information Theory & Compression (algo-7), scene 10-gif (12.5 s): the real-world payoff. A GIF stores every pixel as a
   palette colour (a letter here) and packs each row with LZW. Two rows of 18 pixels are on screen from the start: the lesson's "Lecture
   row" AAAAAABBBCCCCCDDDD (long runs of one colour: LZW cuts it into 11 pieces) and the lesson's "Noisy" row ABCCABDCACBBCDADDB
   (15 pieces: noise rarely repeats, so it saves little). Every piece gets ONE code: a grey line marks the piece under its pixels and a code
   cell drops from it into a strip of equal cells (one cell per code, the same size as a pixel), so the saving is SEEN as a shorter strip:
   11 cells against 18 pixels, then 15 against 18. The rows, the pieces and the counts all come from A7.GIF (common.js) and are asserted.
   Story (local seconds): 0.2-1.8 both rows' labels and 18 solid tiles pop; 2.6-5.3 eleven pieces grow one by one (the count
   goes 1..11, each code cell drops into the strip), 6.05 the strip and its count turn green and a tick draws on; 7.7-9.8 fifteen pieces
   (the count goes 1..15), 10.6 the strip and its count turn red and a cross draws on; 10.9 the footer tag. Nothing moves after 11.4. The
   four palette colours are the only exception to the video's colour roles and every tile carries its letter; the pieces are grey so
   they never read as pixel colours. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const G = A7.GIF;

  A7.same(
    "gif scene: the two rows",
    [G.flat.text, G.noisy.text, G.flat.text.length, G.noisy.text.length, G.flat.count, G.noisy.count],
    ["AAAAAABBBCCCCCDDDD", "ABCCABDCACBBCDADDB", 18, 18, 11, 15],
  );
  // the pieces of a row must tile it end to end, and spell it
  [G.flat, G.noisy].forEach((r) => {
    A7.same(
      "gif scene: pieces cover the row",
      [r.chunks.map((c) => c.text).join(""), r.chunks.length, r.chunks[0].from, r.chunks[r.chunks.length - 1].to],
      [r.text, r.count, 0, r.text.length],
    );
    r.chunks.forEach((c, i) => {
      if (i) A7.same(`gif scene: piece ${i} starts where the last ended`, c.from, r.chunks[i - 1].to);
    });
  });

  // layout (stage px): each row is a header line (label on the left, the running count and its tick or cross on the right), pixel
  // tiles, parse lines and code cells. The code cells are as big and as far apart as the pixels (pitch 50), so a strip of n cells
  // ends exactly under pixel n
  const X0 = 20;
  const PITCH = 50; // tile 46 + gap 4
  const TILE = 46;
  const CELL_H = 40;
  const ROWS = [
    {
      data: G.flat,
      y: 20,
      label: "a GIF row: long runs",
      tone: "green",
      mark: L5.tick,
      time: { label: 0.2, tiles: 0.3, parse: 2.6, step: 0.27, verdict: 6.05 },
    },
    {
      data: G.noisy,
      y: 280,
      label: "a GIF row: noisy",
      tone: "red",
      mark: L5.cross,
      time: { label: 0.8, tiles: 1.0, parse: 7.7, step: 0.15, verdict: 10.6 },
    },
  ];
  const LAND = 0.5; // a code cell takes this long to drop from its piece into the strip
  const COUNT = { w: 312, right: 910 }; // the count tag is 312 px wide for every count and ends 26 px inside the stage (its 8% bump stays inside)
  const MARK_X = COUNT.right - COUNT.w - 40; // the tick or cross sits just left of it
  const codesText = (n) => `18 pixels, ${n} code${n === 1 ? "" : "s"}`;

  function buildRow(stage, svg, r) {
    const { data, y, time: T } = r;
    const yPix = y + 76;
    const ySpan = y + 134;
    const yCell = y + 160;
    const label = A7.tag(stage, { x: X0, y, text: r.label, tone: "grey" });
    const px = A7.tiles(stage, {
      x: X0,
      y: yPix,
      items: [...data.text].map((c) => ({ text: c, tone: G.tones[c] })),
      w: TILE,
      h: TILE,
      gap: PITCH - TILE,
      fs: 28,
    });
    [...px.el.children].forEach((b) => (b.style.borderRadius = "12px"));
    const spans = data.chunks.map((c) =>
      A7.span(stage, { x: X0 + PITCH * c.from, y: ySpan, w: PITCH * (c.to - c.from) - 4, h: 14, tone: "grey" }),
    );
    // one code cell per piece, in a strip of equal cells under the spans
    const cells = A7.bits(stage, {
      x: X0,
      y: yCell,
      groups: "1".repeat(data.count),
      cell: TILE,
      h: CELL_H,
      gap: PITCH - TILE,
      digits: false,
      tone: "grey",
    });
    const count = A7.tag(stage, { x: COUNT.right - COUNT.w, y, text: codesText(0), tone: "grey" });
    count.el.style.width = `${COUNT.w}px`;
    const mark = r.mark(MARK_X, y + 30, 48, r.tone, { w: 9 });
    svg.append(mark);
    const at = (i) => T.parse + T.step * i; // piece i is found here
    const landed = (i) => at(i) + 0.15 + LAND; // its code cell is in the strip here

    return (t) => {
      label.set({ k: ramp(t, T.label, T.label + 0.3) });
      px.all((j) => ({ solid: true, k: ramp(t, T.tiles + 0.04 * j, T.tiles + 0.04 * j + 0.3) }));
      spans.forEach((s, i) => s.set({ k: ramp(t, at(i), at(i) + 0.2) }));
      const done = t >= T.verdict;
      // each code cell drops from the middle of its piece into its slot
      const cellState = {};
      data.chunks.forEach((c, i) => {
        const e = ramp(t, at(i) + 0.15, at(i) + 0.15 + LAND, E.inOut);
        const fromX = X0 + PITCH * c.from + (PITCH * (c.to - c.from) - 4) / 2;
        cellState[i] = {
          k: ramp(t, at(i) + 0.15, at(i) + 0.4),
          x: (1 - e) * (fromX - (X0 + PITCH * i + TILE / 2)),
          y: (1 - e) * (ySpan - yCell),
          s: 1 + 0.12 * flash(t, T.verdict, T.verdict + 0.4),
        };
      });
      cells.set({ cells: cellState, tone: done ? r.tone : "grey", solid: true, k: 1 });
      const n = data.chunks.filter((_, i) => t >= landed(i)).length;
      count.set({
        text: codesText(n),
        tone: done ? r.tone : "grey",
        solid: done,
        k: ramp(t, T.tiles + 0.5, T.tiles + 0.8),
        s: 1 + 0.08 * flash(t, T.verdict, T.verdict + 0.4),
      });
      L5.drawOn(mark, ramp(t, T.verdict + 0.1, T.verdict + 0.5, E.lin));
    };
  }

  function build(stage) {
    const svg = L5.svg(stage);
    const rows = ROWS.map((r) => buildRow(stage, svg, r));
    const foot = A7.tag(stage, { x: X0, y: 548, text: "every GIF row is packed this way", tone: "purple" });
    return (t) => {
      rows.forEach((u) => u(t));
      foot.set({ k: ramp(t, 10.9, 11.3) });
    };
  }

  V.scene({
    kicker: "GIF IMAGES",
    title: ["Repeats shrink,", "noise barely does"],
    dur: 12.5,
    caps: [
      [0.4, 2.4, "A GIF packs each row of pixels with LZW."],
      [2.6, 5.9, "Each piece of the row gets one code."],
      [6.1, 7.5, "Repeats share codes: 18 pixels, 11 codes."],
      [7.7, 10.5, "Noise rarely repeats, so it saves little."],
      [10.7, 12.3, "LZW feeds on repeats."],
    ],
    build,
  });
})();

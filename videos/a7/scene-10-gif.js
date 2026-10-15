/* Phase 7 · Information Theory & Compression (algo-7), scene 10-gif (11 s): the real-world payoff. A GIF stores every pixel as a
   palette colour (a letter here) and packs each row with LZW. The lesson's row AAAAAABBBCCCCCDDDD is runs of one colour: LZW cuts
   it into 11 pieces (11 codes for 18 pixels). A noisy row of the same 18 pixels, DBCBAABDADDCDDACCA, needs 17 codes: noise rarely
   repeats, so almost nothing shrinks. The rows, the pieces and the counts all come from A7.GIF (common.js) and are asserted.
   Story (local seconds): 0.2-1.3 the flat row's label, its LZW tag and 18 solid tiles pop, 1.3 the count tag; 1.5-4.5 eleven blue
   spans grow over the pieces one by one (the count goes 1..11), 4.6 the count turns green and a tick draws on; 5.0-6.3 the same
   for the noisy row, 6.1-8.0 seventeen spans (the count goes 1..17), 8.2 the count turns red and a cross draws on; 8.8-9.2 the
   footer tag. Nothing moves after 9.2. The four palette colours are the only exception to the video's colour roles and every
   tile carries its letter. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const G = A7.GIF;

  A7.same(
    "gif scene: the two rows",
    [G.flat.text, G.noisy.text, G.flat.text.length, G.noisy.text.length, G.flat.count, G.noisy.count],
    ["AAAAAABBBCCCCCDDDD", "DBCBAABDADDCDDACCA", 18, 18, 11, 17],
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

  // layout (stage px): each row is label, pixel tiles, parse spans, count
  const X0 = 20;
  const PITCH = 50; // tile 46 + gap 4
  const ROWS = [
    {
      data: G.flat,
      y: 20,
      label: "a GIF row: flat colour",
      tone: "green",
      mark: L5.tick,
      time: { label: 0.2, tiles: 0.3, tag: 1.3, parse: 1.5, step: 0.27, verdict: 4.6 },
    },
    {
      data: G.noisy,
      y: 288,
      label: "a GIF row: noisy",
      tone: "red",
      mark: L5.cross,
      time: { label: 5.0, tiles: 5.1, tag: 6.0, parse: 6.1, step: 0.12, verdict: 8.2 },
    },
  ];
  const MARK_X = 366; // just right of the count tag at its widest ("18 pixels, 17 codes")
  const codesText = (n) => `18 pixels, ${n} code${n === 1 ? "" : "s"}`;

  function buildRow(stage, svg, r) {
    const { data, y, time: T } = r;
    const label = A7.tag(stage, { x: X0, y, text: r.label, tone: "grey" });
    const lzw = A7.tag(stage, { x: 640, y, text: "packed with LZW", tone: "purple" });
    const px = A7.tiles(stage, {
      x: X0,
      y: y + 72,
      items: [...data.text].map((c) => ({ text: c, tone: G.tones[c] })),
      w: 46,
      h: 46,
      gap: PITCH - 46,
      fs: 28,
    });
    [...px.el.children].forEach((b) => (b.style.borderRadius = "12px"));
    const spans = data.chunks.map((c) =>
      A7.span(stage, { x: X0 + PITCH * c.from, y: y + 134, w: PITCH * (c.to - c.from) - 4, h: 14, tone: "blue" }),
    );
    const count = A7.tag(stage, { x: X0, y: y + 160, text: codesText(0), tone: "grey" });
    const mark = r.mark(MARK_X, y + 160 + 31, 48, r.tone, { w: 9 });
    svg.append(mark);
    const at = (c) => T.parse + T.step * data.chunks.indexOf(c);

    return (t) => {
      label.set({ k: ramp(t, T.label, T.label + 0.3) });
      lzw.set({ k: ramp(t, T.label + 0.3, T.label + 0.6) });
      px.all((j) => ({ solid: true, k: ramp(t, T.tiles + 0.04 * j, T.tiles + 0.04 * j + 0.3) }));
      spans.forEach((s, i) => s.set({ k: ramp(t, at(data.chunks[i]), at(data.chunks[i]) + 0.2) }));
      const n = data.chunks.filter((c) => t >= at(c)).length;
      const done = t >= T.verdict;
      count.set({
        text: codesText(n),
        tone: done ? r.tone : "grey",
        solid: done,
        k: ramp(t, T.tag, T.tag + 0.3),
        s: 1 + 0.08 * flash(t, T.verdict, T.verdict + 0.4),
      });
      L5.drawOn(mark, ramp(t, T.verdict + 0.1, T.verdict + 0.5, E.lin));
    };
  }

  function build(stage) {
    const svg = L5.svg(stage);
    const rows = ROWS.map((r) => buildRow(stage, svg, r));
    const foot = A7.tag(stage, { x: X0, y: 556, text: "GIF stores its pixels this way", tone: "purple" });
    return (t) => {
      rows.forEach((u) => u(t));
      foot.set({ k: ramp(t, 8.8, 9.2) });
    };
  }

  V.scene({
    kicker: "GIF IMAGES",
    title: ["Repeats shrink,", "noise does not"],
    dur: 11,
    caps: [
      [0.4, 2.6, "A GIF packs its pixels with LZW."],
      [3.4, 5.2, "Runs of one colour shrink into single codes."],
      [6.2, 8.2, "Noise rarely repeats, so almost nothing shrinks."],
      [8.4, 10.4, "LZW feeds on repeats."],
    ],
    build,
  });
})();

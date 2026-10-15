/* Phase 8 · Cryptography & Blockchain (algo-8), scene 07: "A hash is a fingerprint of data" (10 s).
   The lesson's toy hash (A8.HASH, common.js) as one machine drawn three times: data -> hash -> fingerprint (8 hex digits).
   Row 1: "cat" goes in and f01dce9c comes out. Row 2: "cat" again gives the SAME fingerprint (every digit green, a green equals disc
   between the two). Row 3: one letter of "cat" is changed to give "cot" and ALL EIGHT digits of the fingerprint change (orange,
   with a tag that says so). Row 4: the way back, from the fingerprint to the data, is a red arrow with a cross on it and a "?".
   Colours (video-wide): grey = the data, blue = fingerprints (public), green = the same, orange = what changed, red = no way back.
   Timeline (local seconds): 0.2 "cat" and the "data" label; 0.5 arrow, 0.7 "hash", 0.95 arrow, 1.2 the "fingerprint" label and
   the digits type out (1.3-1.9). 2.9 "cat" again, 3.15-3.75 arrow / machine / arrow, 3.7 the digits type out in green (3.8-4.3),
   4.3 the equals disc. 5.05 a third "cat" which at 5.6 turns into "cot" (the tile bumps, the middle letter lights up), 5.85-6.5 arrow /
   machine / arrow, 6.45 the digits type out in orange (6.55-7.05), 7.1 "all 8 digits differ". 7.6 the ghost fingerprint, 7.8-8.5 the red
   arrow draws right to left, 8.4 the cross, 8.5 "no way back", 8.8 the question mark; 9.2-10 hold.
   Every number and string comes from A8.HASH / A8.toy and is asserted below. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const lin = E.lin;
  const H = A8.HASH;

  // ---------- the model: every string comes from the helper, checked here against the real toy hash ----------
  const CAT = "cat";
  const COT = "cot";
  A8.same(
    "hash: cat and cot",
    [H.cat, H.cot, A8.toy(CAT), A8.toy(COT)],
    ["f01dce9c", "cb26b6bb", "f01dce9c", "cb26b6bb"],
  );
  A8.same("hash: the same data hashed again gives the same fingerprint", A8.toy(CAT), A8.toy(CAT));
  A8.same("hash: cat and cot differ in one letter only (the middle one)", A8.diffIdx(CAT, COT), [1]);
  A8.same(
    "hash: every one of the 8 digits differs",
    [A8.diffIdx(H.cat, H.cot), H.cat.length],
    [[0, 1, 2, 3, 4, 5, 6, 7], 8],
  );
  A8.same(
    "hash: the fingerprint is short whatever the size of the data",
    [A8.toy("a").length, A8.toy("x".repeat(500)).length],
    [8, 8],
  );
  const DIFFS = H.diffHex.length;
  A8.same("hash: the tag counts the digits that differ", DIFFS, H.cat.length);

  // ---------- layout (stage px) ----------
  const ROWY = [100, 240, 380];
  const WAY = 552; // the way-back row
  const X = { in: 130, mach: 468, fp: 780 };
  const ARR1 = [205, 366]; // arrow from the data tile to the machine
  const ARR2 = [572, 655]; // arrow from the machine to the fingerprint
  const GHOST = { x: X.fp, y: WAY };
  const BACK = [655, 196]; // the red arrow, right to left, from the ghost fingerprint to the "?" tile
  A8.must(X.fp - (8 * 36 * 0.62 + 46) / 2 > ARR2[1] + 6, "the fingerprint stays clear of the second arrow");

  // ---------- timeline (local seconds) ----------
  const T = {
    rows: [
      { tile: 0.2, a1: [0.5, 0.8], mach: 0.7, a2: [0.95, 1.25], fp: 1.2, type: [1.3, 1.9] },
      { tile: 2.9, a1: [3.15, 3.4], mach: 3.3, a2: [3.5, 3.75], fp: 3.7, type: [3.8, 4.3] },
      { tile: 5.05, a1: [5.85, 6.1], mach: 6.05, a2: [6.25, 6.5], fp: 6.45, type: [6.55, 7.05] },
    ],
    labelData: 0.2,
    labelFp: 1.2,
    equals: 4.3,
    flip: 5.6,
    flipFlash: [5.4, 5.8],
    diffTag: 7.1,
    ghost: 7.6,
    back: [7.8, 8.5],
    cross: 8.4,
    crossDraw: [8.45, 8.8],
    way: 8.5,
    ask: 8.8,
  };
  const pop = (t, a, d = 0.35) => ramp(t, a, a + d, lin);
  const draw = (t, w) => ramp(t, w[0], w[1], lin);
  // digits typed one by one; the rest stay as non-breaking spaces so the pill keeps its width and stays put
  const NBSP = " ";
  const typed = (full, t, w) => {
    const s = V.type(full, ramp(t, w[0], w[1], lin));
    return s + NBSP.repeat(full.length - s.length);
  };
  const marks = (tone) => (tone ? (i, ch) => (ch === NBSP ? null : tone) : null);
  const CHIP =
    "display:inline-block;padding:0 9px;margin:0 1px;border-radius:12px;background:var(--amber);color:var(--amber-on)";
  const COT_HTML = `c<span style="${CHIP}">o</span>t`;

  function build(stage) {
    const svg = L5.svg(stage);

    // one copy of the machine: the data tile, two arrows, the "hash" box and the fingerprint
    const row = (y, tw) => {
      const tile = A8.tag(stage, { x: X.in, y, text: CAT, box: true, tone: "grey", fs: 44, w: 130, h: 76 });
      const a1 = svg.appendChild(L5.arrow(ARR1[0], y, ARR1[1], y, "grey", 1, { w: 7, head: 20 }));
      const a2 = svg.appendChild(L5.arrow(ARR2[0], y, ARR2[1], y, "grey", 1, { w: 7, head: 20 }));
      const mach = A8.tag(stage, { x: X.mach, y, text: "hash", box: true, tone: "grey", fs: 40, w: 190, h: 76 });
      const fp = A8.digest(stage, { x: X.fp, y, text: H.cat, fs: 36 });
      return { tile, a1, a2, mach, fp, tw };
    };
    const rows = ROWY.map((y, i) => row(y, T.rows[i]));
    const [r1, r2, r3] = rows;

    // column labels over the first row: what each side is
    const label = (text, x, colour) =>
      V.h("div", {
        class: "v-text",
        text,
        style: { left: `${x}px`, top: "17px", transform: "translateX(-50%)", color: colour },
      });
    const lblData = label("data", X.in, "var(--ink)");
    const lblFp = label("fingerprint", X.fp, "var(--blue-ink)");
    stage.append(lblData, lblFp);

    const equals = A8.icon(stage, "equals", {
      x: X.fp,
      y: (ROWY[0] + ROWY[1]) / 2,
      tone: "green",
      disc: true,
      size: 52,
    });
    const diffTag = A8.tag(stage, { x: X.fp, y: 452, text: `all ${DIFFS} digits differ`, tone: "orange", fs: 28 });

    // no way back
    const ghost = A8.digest(stage, { x: GHOST.x, y: GHOST.y, text: H.cat, fs: 36 });
    const back = svg.appendChild(L5.arrow(BACK[0], WAY, BACK[1], WAY, "red", 1, { w: 6, head: 18 }));
    const cross = A8.icon(stage, "cross", { x: 450, y: WAY, tone: "red", disc: true, size: 56 });
    const wayTag = A8.tag(stage, { x: 450, y: WAY - 64, text: "no way back", tone: "red", fs: 28 });
    const ask = A8.tag(stage, { x: X.in, y: WAY, text: "", box: true, tone: "red", fs: 44, w: 100, h: 76 });
    const qmark = A8.icon(stage, "qmark", { x: X.in, y: WAY, tone: "red", size: 50 });

    const showRow = (r, t) => {
      const w = r.tw;
      L5.drawOn(r.a1, draw(t, w.a1));
      L5.drawOn(r.a2, draw(t, w.a2));
      r.mach.set({ k: pop(t, w.mach) });
      return w;
    };

    return (t) => {
      lblData.style.opacity = String(pop(t, T.labelData, 0.3));
      lblFp.style.opacity = String(pop(t, T.labelFp, 0.3));

      // row 1: "cat" goes in, the fingerprint comes out
      const w1 = showRow(r1, t);
      r1.tile.set({ k: pop(t, w1.tile) });
      r1.fp.set({ text: typed(H.cat, t, w1.type), k: pop(t, w1.fp, 0.3) });

      // row 2: the same data again, the same fingerprint (every digit green)
      const w2 = showRow(r2, t);
      r2.tile.set({ k: pop(t, w2.tile) });
      r2.fp.set({ text: typed(H.cat, t, w2.type), marks: marks("green"), k: pop(t, w2.fp, 0.3) });
      equals.set({ k: pop(t, T.equals, 0.3) });

      // row 3: a third "cat" whose middle letter is changed, and a fingerprint that changes in every digit
      const w3 = showRow(r3, t);
      const flipped = t >= T.flip;
      r3.tile.set({
        html: flipped ? COT_HTML : CAT,
        tone: flipped ? "orange" : "grey",
        k: pop(t, w3.tile),
        s: 1 + 0.12 * flash(t, ...T.flipFlash),
      });
      r3.fp.set({ text: typed(H.cot, t, w3.type), marks: marks("orange"), k: pop(t, w3.fp, 0.3) });
      diffTag.set({ k: pop(t, T.diffTag, 0.3) });

      // row 4: from the fingerprint back to the data is a crossed-out arrow
      ghost.set({ ghost: true, k: pop(t, T.ghost) });
      L5.drawOn(back, draw(t, T.back));
      cross.set({ k: pop(t, T.cross, 0.3), draw: draw(t, T.crossDraw) });
      wayTag.set({ k: pop(t, T.way, 0.3) });
      ask.set({ k: pop(t, T.ask) });
      qmark.set({ k: pop(t, T.ask) });
    };
  }

  V.scene({
    kicker: "HASH",
    title: ["A hash is a", "fingerprint of data"],
    dur: 10,
    caps: [
      [1.0, 2.8, "A hash turns data into a short fingerprint."],
      [3.6, 5.3, "The same data always gives the same fingerprint."],
      [5.7, 7.5, "Change one letter and every digit changes."],
      [8.0, 9.6, "And you cannot work backwards from it."],
    ],
    build,
  });
})();

/* Phase 8 · Cryptography & Blockchain (algo-8), scene 09: "Sealing a block means guessing" (13.5 s), proof of work (lesson 8.7).
   Part 1 (0 to 8.8 s). Block 7 ("cat pays dan 4") has a nonce, a number to try. The miner changes the nonce and hashes again until
   the hash starts with 0. The block card on the left shows the try in hand (nonce, fingerprint with its first digit marked), the
   log on the right lists the tries (red first digit and a cross for a miss), and an orange tag names the target. Nonce 14 wins
   after 15 hashes (the row and the card turn green). Two bars then compare the work: finding took 15 hashes, checking the winner
   takes 1. Colours (video-wide): orange = the target and the guesses being tried, blue = the fingerprint, red = a miss,
   green = the winner and the check.
   Part 2 (8.1 s on). The odds. One square is one hash: 256 consecutive nonces of block 7, row by row (the window is found in code:
   exactly 16 of them start with 0 and exactly one starts with 00, and the first row has just one 0-hit). The strip of 16 (the first
   row) has one green square (starts with 0: 1 in 16); it grows into the 16 x 16 square, where about one square per row is green
   (16 in all) and one of them, ringed in orange, starts with 00 (1 in 256), so one more zero is 16 times more work.
   Timeline (local seconds): 0.2 the block card pops, 0.3 the dashed log frame, 0.6 the target tag. 1.2-5.7 the hunt (15 tries,
   0.3 s each; the card follows the newest try). 5.7-6.2 the winner turns green, 6.0 the found tag, 6.4-6.9 the orange bar grows,
   7.2 the green bar (one fifteenth of it) pops, 7.45 its tick. 8.1-8.5 the first figure fades. 8.5-9.1 the strip of 16 builds,
   9.0 its tag, 10.0-10.9 the other 15 rows pop in, 11.0 the 1-in-256 tag and the ring round the 00 square, 11.6 the "16 times more
   work" sticker; 12.4-13.5 hold.
   Every number comes from A8.MINE / A8.ZEROS (common.js) and is checked below against the real toy hash. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const { ramp, clamp, ease: E } = V;
  const lin = E.lin;
  const M = A8.MINE;
  const Z = A8.ZEROS;

  // ---------- the model: every number is recomputed from the real toy hash and checked ----------
  const hashN = (n, b = M.data) => A8.toy(`${b}|${M.text}|nonce ${n}`);
  A8.same(
    "mining: the 15 hashes are the toy hash of block 7 with nonce 0 to 14",
    M.rows.map((r) => r.hash),
    M.rows.map((_, n) => hashN(n)),
  );
  A8.same(
    "mining: nonce 14 is the first hash that starts with 0, after 15 hashes",
    [M.rows.findIndex((r) => r.hash.startsWith(M.target)), M.win, M.tries, M.rows.length],
    [14, 14, 15, 15],
  );
  A8.same(
    "mining: every miss before the winner has a first digit other than 0",
    M.rows.slice(0, M.win).map((r) => r.hash[0] !== M.target && !r.ok),
    M.rows.slice(0, M.win).map(() => true),
  );
  A8.same("mining: the winner is checked with one hash", [hashN(M.win), M.checkCost], ["0d84059e", 1]);
  // one hash in 16 starts with 0, one in 256 with 00: counted over 65 536 nonces of block 7
  const NONCES = 65536;
  const hits = (prefix) => {
    let c = 0;
    for (let n = 0; n < NONCES; n++) if (hashN(n).startsWith(prefix)) c++;
    return c;
  };
  A8.close("odds: starts with 0 is about 1 in 16", (hits("0") / NONCES) * 16, 1, 0.1);
  A8.close("odds: starts with 00 is about 1 in 256", (hits("00") / NONCES) * 256, 1, 0.15);
  // and one more zero costs about 16 times more tries: the mean number of tries over 400 different blocks
  const meanTries = (prefix, blocks) => {
    let total = 0;
    for (let b = 1; b <= blocks; b++) {
      let n = 0;
      while (!hashN(n, `block ${b}`).startsWith(prefix)) n++;
      total += n + 1;
    }
    return total / blocks;
  };
  const [ZERO1, ZERO2] = Z;
  const WORK = ZERO2.odds / ZERO1.odds;
  A8.same("odds: one zero is 1 in 16, two zeros 1 in 256", [ZERO1.odds, ZERO2.odds, WORK], [16, 256, 16]);
  A8.close(
    "work: two zeros cost about 16 times the tries of one",
    meanTries("00", 400) / meanTries("0", 400),
    WORK,
    2.5,
  );
  const COLS = ZERO1.cells; // the strip: 16 squares
  const ROWS = ZERO2.cells / ZERO1.cells; // the square: 16 strips
  A8.same("odds: a strip of 16 and a square of 256", [COLS, ROWS, COLS * ROWS], [16, 16, 256]);
  // the 256 squares are 256 consecutive nonces of block 7: a window where exactly 16 hashes start with 0, exactly one starts with 00,
  // and the first row (the strip) holds a single 0-hit that is not the 00 one (an honest lottery, nothing is painted by hand)
  const PRE = Array.from({ length: 3000 }, (_, n) => hashN(n));
  const windowAt = (s) => PRE.slice(s, s + ZERO2.cells);
  const goodWindow = (s) => {
    const w = windowAt(s);
    const row0 = w.slice(0, COLS).filter((h) => h.startsWith("0"));
    return (
      w.length === ZERO2.cells &&
      w.filter((h) => h.startsWith("0")).length === ZERO2.cells / ZERO1.odds &&
      w.filter((h) => h.startsWith("00")).length === 1 &&
      row0.length === 1 &&
      !row0[0].startsWith("00")
    );
  };
  const START = PRE.findIndex((_, s) => goodWindow(s));
  A8.must(START >= 0, "a window of 256 nonces with 16 zero-starts and one 00 exists");
  const SQ = windowAt(START);
  const at = (r, c) => SQ[r * COLS + c];
  const HITS = SQ.map((h, i) => ({ r: Math.floor(i / COLS), c: i % COLS, h })).filter((x) => x.h.startsWith("0"));
  const HIT00 = HITS.find((x) => x.h.startsWith("00"));
  A8.same(
    "odds: 16 of the 256 squares start with 0, one with 00, and the first row has a single hit",
    [
      HITS.length,
      HITS.filter((x) => x.h.startsWith("00")).length,
      HITS.filter((x) => x.r === 0).length,
      at(HIT00.r, HIT00.c),
    ],
    [16, 1, 1, hashN(START + HIT00.r * COLS + HIT00.c)],
  );

  // ---------- layout (stage px, 12 px margins) ----------
  const OY = 70; // part 1 is centred on the stage (it spans y 60..590)
  const BLK = { x: 12, y: OY, w: 300 };
  const LOG = { x: 352, y: OY, w: 560, rows: 5, rowH: 62 };
  const LOG_H = (LOG.rows - 1) * LOG.rowH + LOG.rowH - 10; // the window shows five rows
  const TARGET = { x: BLK.x + BLK.w / 2, y: OY + 276 };
  const FOUND = { x: LOG.x + LOG.w / 2, y: OY + 352 };
  const BAR = { x: 12, w: 600, find: 468, check: 534 };
  const GRID = { x: 60, y: 130, size: 20, gap: 4 };
  const SIDE = 480; // the left edge of the column of odds tags
  const GRID_W = COLS * GRID.size + (COLS - 1) * GRID.gap;
  const GRID_H = ROWS * GRID.size + (ROWS - 1) * GRID.gap;
  const gridMidY = GRID.y + GRID_H / 2;
  A8.must(GRID.x + GRID_W + 11 < SIDE - 24, "the grid and its ring stay clear of the odds tags");
  A8.must(GRID.y + GRID_H + 11 <= 640 - 12, "the grid and its ring stay inside the stage");
  const CHECK_BAR = BAR.w * (M.checkCost / M.tries); // 40 px: one hash against fifteen
  A8.same("bars: the check bar is one fifteenth of the find bar", [CHECK_BAR, BAR.w / M.tries], [40, 40]);
  const checkText = `check: ${M.checkCost} hash`;
  const TICK = { x: BAR.x + CHECK_BAR + 14 + A8.textW(checkText) * 0.96 + 32, y: BAR.check + 24 };

  // ---------- timeline (local seconds) ----------
  const T = {
    card: 0.2,
    frame: 0.3,
    target: 0.6,
    hunt: [1.2, 5.7],
    win: [5.7, 6.2],
    found: 6.0,
    barFind: [6.4, 6.9],
    barCheck: [7.2, 7.45],
    tick: [7.45, 7.8],
    out: [8.1, 8.5],
    strip: [8.5, 9.1],
    label: 8.4,
    tag16: 9.0,
    square: [10.0, 10.9],
    tag256: 11.0,
    ring00: 11.1,
    work: 11.6,
  };
  const pop = (t, a, d = 0.35) => ramp(t, a, a + d, lin);

  function build(stage) {
    // ---------- part 1: the hunt ----------
    const g1 = V.h("div", {
      style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
    });
    stage.append(g1);

    const frame = V.h("div", {
      style: {
        position: "absolute",
        left: `${LOG.x - 10}px`,
        top: `${LOG.y - 10}px`,
        width: `${LOG.w + 20}px`,
        height: `${LOG_H + 20}px`,
        boxSizing: "border-box",
        border: "3px dashed var(--line-2)",
        borderRadius: "26px",
      },
    });
    g1.append(frame);

    const blk = A8.block(g1, { x: BLK.x, y: BLK.y, w: BLK.w, fields: ["data", "nonce", "hash"], title: "Block 7" });
    const log = A8.tries(g1, {
      x: LOG.x,
      y: LOG.y,
      w: LOG.w,
      rows: LOG.rows,
      rowH: LOG.rowH,
      count: M.rows.length,
      lead: true,
      row: (i) => ({ a: `nonce ${M.rows[i].n}`, b: M.rows[i].hash, ok: M.rows[i].ok }),
    });
    const target = A8.tag(g1, { x: TARGET.x, y: TARGET.y, text: `hash starts with ${M.target}`, tone: "orange" });
    const found = A8.tag(g1, {
      x: FOUND.x,
      y: FOUND.y,
      text: `found after ${M.tries} hashes`,
      tone: "green",
      solid: true,
    });
    const barFind = A8.bar(g1, { x: BAR.x, y: BAR.find, w: BAR.w, tone: "orange" });
    const barCheck = A8.bar(g1, { x: BAR.x, y: BAR.check, w: BAR.w, tone: "green" });
    const tick = A8.icon(g1, "tick", { x: TICK.x, y: TICK.y, size: 44, tone: "green" });

    // ---------- part 2: the odds ----------
    const grid = A8.cells(stage, { x: GRID.x, y: GRID.y, cols: COLS, rows: ROWS, size: GRID.size, gap: GRID.gap });
    // an orange ring round the strip (1 in 16) and a wider one round the whole square (1 in 256)
    const ring = (tone, pad, w, radius, wd, ht) =>
      V.h("div", {
        class: `c-${tone}`,
        style: {
          position: "absolute",
          left: `${GRID.x - pad - w}px`,
          top: `${GRID.y - pad - w}px`,
          width: `${wd + 2 * (pad + w)}px`,
          height: `${ht + 2 * (pad + w)}px`,
          boxSizing: "border-box",
          border: `${w}px solid var(--c)`,
          borderRadius: `${radius}px`,
        },
      });
    const ringStrip = ring("green", 1, 2, 9, GRID_W, GRID.size);
    const ringSquare = ring("orange", 8, 3, 20, GRID_W, GRID_H);
    // the square that starts with 00: a small orange ring round it
    const c00 = grid.cellAt(HIT00.r, HIT00.c);
    const ring00 = V.h("div", {
      class: "c-orange",
      style: {
        position: "absolute",
        left: `${c00.x - GRID.size / 2 - 5}px`,
        top: `${c00.y - GRID.size / 2 - 5}px`,
        width: `${GRID.size + 10}px`,
        height: `${GRID.size + 10}px`,
        boxSizing: "border-box",
        border: "3px solid var(--c)",
        borderRadius: "9px",
      },
    });
    stage.append(ringStrip, ringSquare, ring00);
    const label = A8.tag(stage, { x: GRID.x, y: GRID.y - 46, text: "one square, one hash", tone: "grey", anchor: "l" });
    const zeros = (z) => `starts with ${"0".repeat(z.zeros)}: 1 in ${z.odds}`;
    const tag16 = A8.tag(stage, {
      x: SIDE,
      y: GRID.y + GRID.size / 2,
      text: zeros(ZERO1),
      tone: "green",
      anchor: "l",
    });
    const tag256 = A8.tag(stage, { x: SIDE, y: gridMidY, text: zeros(ZERO2), tone: "orange", anchor: "l" });
    const work = A8.tag(stage, {
      x: SIDE,
      y: GRID.y + GRID_H - 40,
      text: `${WORK} times more work`,
      tone: "orange",
      solid: true,
      fs: 36,
      anchor: "l",
    });

    return (t) => {
      // ----- part 1 -----
      const f1 = 1 - ramp(t, T.out[0], T.out[1], lin);
      V.show(g1, f1);
      const upto = M.tries * ramp(t, T.hunt[0], T.hunt[1], lin);
      const n = clamp(Math.floor(upto - 1e-9), 0, M.tries - 1); // the try in hand: the newest row
      const row = M.rows[n];
      const seen = upto - n > 0.3; // its row is mostly in the log, so its first digit is judged
      const win = ramp(t, T.win[0], T.win[1], lin);

      frame.style.opacity = String(pop(t, T.frame, 0.3));
      blk.set({
        title: "Block 7",
        data: M.text,
        nonce: row.n,
        hash: row.hash,
        nonceTone: "orange",
        hashTone: win > 0.01 ? "green" : "blue",
        hashMarks: (j) => (j === 0 && seen ? (row.ok ? "green" : "red") : null),
        tone: win > 0.5 ? "green" : "grey",
        mark: win > 0.01 ? "ok" : null,
        markK: win,
        k: pop(t, T.card, 0.4),
      });
      log.update({ upto, hi: M.win, hiK: win });
      target.set({ k: pop(t, T.target, 0.4) });
      found.set({ k: pop(t, T.found, 0.35) });
      barFind.set({ k: ramp(t, T.barFind[0], T.barFind[1]), text: `find: ${M.tries} hashes` });
      barCheck.set({
        k: (M.checkCost / M.tries) * ramp(t, T.barCheck[0], T.barCheck[1], lin),
        text: checkText,
        textOut: true,
      });
      tick.set({ draw: ramp(t, T.tick[0], T.tick[1], lin), o: t >= T.tick[0] ? 1 : 0 });

      // ----- part 2 -----
      const cols = COLS * ramp(t, T.strip[0], T.strip[1], lin);
      const rows = 1 + (ROWS - 1) * ramp(t, T.square[0], T.square[1], lin);
      grid.update((r, c) => (at(r, c).startsWith("0") ? { tone: "green" } : undefined), { rows, cols });
      label.set({ k: pop(t, T.label, 0.3) });
      tag16.set({ k: pop(t, T.tag16, 0.35) });
      tag256.set({ k: pop(t, T.tag256, 0.35) });
      V.show(ringStrip, pop(t, T.tag16, 0.3));
      V.show(ringSquare, pop(t, T.tag256, 0.3));
      V.show(ring00, pop(t, T.ring00, 0.3));
      work.set({ k: pop(t, T.work, 0.35) });
    };
  }

  V.scene({
    kicker: "PROOF OF WORK",
    title: ["Sealing a block", "means guessing"],
    dur: 13.5,
    caps: [
      [0.4, 2.4, "Try numbers (nonces) until the hash starts with 0."],
      [2.6, 5.6, "Every try gives a new, unpredictable hash."],
      [6.0, 7.2, `Found it after ${M.tries} hashes.`],
      [7.3, 8.4, `Checking takes just ${M.checkCost} hash.`],
      [9.0, 10.8, `One hash in ${ZERO1.odds} starts with 0.`],
      [11.0, 13.0, `Two zeros: 1 in ${ZERO2.odds}, so ${WORK} times more work.`],
    ],
    build,
  });
})();

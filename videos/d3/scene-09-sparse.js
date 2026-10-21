/* Lecture 3 (ds-3) · scene 9 (SPARSE INDEX): sorted keys need only a sparse index (lesson 3.3 "A sparse index is enough", the words
   hand ... harbour). The segment is SORTED by key, so the in-memory index does not need every key: it keeps the first key of each
   block (3 of 12 keys, each with the byte offset of its block). To find a key: jump to the nearest indexed key BEFORE it (the largest
   one that is not past it) and scan one short block. Sorted order also makes a range cheap: one jump to the start, then read on
   (across the block border) until a key is past the end. Every key, block, offset, read and hit comes from D3.SPARSE
   (D3.sparseFind, asserted when the page loads) and is checked again below against an independent rule. Words are defined where they
   first appear: the grey pill "block: 4 keys next to each other" (the three grey boxes), the purple pill "sparse index: one key per
   block" (with the orange "3 of 12 keys"), and the counter "records read". Colours: grey = the segment on disk, purple = the index in
   memory, orange = byte offsets, pointers and the counter, blue = the request, the jump and the scan ring (a record that was read
   but is not an answer stays blue), green = found (and the range).
   Story (local seconds): 0.0 the three blocks (grey boxes) are there, 0.15-1.1 the twelve sorted keys pop (0.06 s apart, down each
   block), 0.5 the grey pill that says what a block is; 2.0-2.5 the segment sinks 64 px (it sat higher while alone, for balance),
   2.45 the purple box "index in memory: key and byte offset" pops, 2.65-3.2 its three entries (key, byte offset of its block),
   3.05-3.9 an orange pointer from each entry drops onto the first key of its block, 3.3 the purple pill "sparse index: one key per
   block", 3.95 the orange tag "3 of 12 keys"; GET: 5.0 the blue tag "get handbag", 5.25 the entry "hand" rings blue (handsome is
   already past handbag), 5.4-5.9 a blue jump runs down its pointer to block 1, 6.2 the counter "records read" pops, 6.5-7.5 the
   scan reads hand (not it: blue) then handbag (found: green, 2 records read); RANGE: 8.4 the tag becomes "range: handbag to
   handy" and the marks clear, 8.6 the ring and 8.7-9.1 the jump again, 9.15-10.99 the scan reads seven records, 0.22 s each: hand
   (before the range), the five keys of the range turn green (the scan crosses into block 2 without a new jump) and hang (past
   handy: it stops there); hold to the end (12.0 s: 0.5 s over the storyboard, so the last picture can be read). */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- the data (the real sparse index, asserted against the storyboard, the lesson and an independent rule) ----------
  const S = D3.SPARSE;
  const KEYS = S.recs.map((r) => r.k);
  const N = KEYS.length;
  const BLOCK = S.block;
  const NB = N / BLOCK;
  const IDX = S.index;
  const FIND = S.find;
  const RANGE = S.range;
  const blockOf = (i) => Math.floor(i / BLOCK);
  const span = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const viaOf = (key) => IDX.findLast((e) => e.key <= key); // the nearest indexed key before (or at) the one we want
  const stopAt = (from, past) => {
    let i = from;
    while (!past(KEYS[i])) i++; // read on until the first key that is past the target
    return i;
  };
  D3.same("sparse scene: twelve sorted keys in three blocks of four", [N, BLOCK, NB], [12, 4, 3]);
  D3.same(
    "sparse scene: the index holds the first key of every block, with that block's byte offset",
    IDX.map((e) => [e.key, e.i, e.off]),
    span(0, NB - 1).map((b) => [KEYS[b * BLOCK], b * BLOCK, D3.offsets(S.recs)[b * BLOCK]]),
  );
  D3.same("sparse scene: three of twelve keys are indexed", [IDX.length, S.entries], [NB, 3]);
  D3.same(
    "sparse scene: get handbag jumps to hand and reads hand, handbag: two records, both in one block",
    [FIND.via, FIND.reads, FIND.hit, FIND.reads.every((i) => blockOf(i) === 0), FIND.reads.length <= BLOCK],
    [
      viaOf(FIND.key).key,
      span(
        viaOf(FIND.key).i,
        stopAt(viaOf(FIND.key).i, (k) => k >= FIND.key),
      ),
      KEYS.indexOf(FIND.key),
      true,
      true,
    ],
  );
  const RG_END = stopAt(viaOf(RANGE.from).i, (k) => k > RANGE.to);
  D3.same(
    "sparse scene: the range handbag to handy is one jump to hand, then a scan until the first key past handy",
    [RANGE.via, RANGE.scanned, RANGE.hits, RANGE.jumps],
    [
      viaOf(RANGE.from).key,
      span(viaOf(RANGE.from).i, RG_END),
      span(viaOf(RANGE.from).i, RG_END).filter((i) => KEYS[i] >= RANGE.from && KEYS[i] <= RANGE.to),
      1,
    ],
  );
  D3.same(
    "sparse scene: the range runs from block 1 into block 2 without a second jump",
    [blockOf(RANGE.hits[0]), blockOf(RANGE.hits[RANGE.hits.length - 1]), RANGE.scanned.length],
    [0, 1, 7],
  );
  const VIA = IDX.findIndex((e) => e.key === FIND.via); // the entry that is looked up (the same one for the range)
  D3.same(
    "sparse scene: handsome is already past handbag, so hand is the entry to use",
    [VIA, IDX[VIA + 1].key > FIND.key],
    [0, true],
  );

  // ---------- layout (stage px; the stage is 936 x 640, the margin is 12) ----------
  const COL = { x: [43, 343, 643], w: 250, pitch: 300 }; // the three block boxes
  const PAD = 14;
  const CHIP = { w: COL.w - 2 * PAD, h: 52, gap: 12 }; // a key sticker in a block
  const BP = { y: 212, h: 2 * PAD + BLOCK * CHIP.h + (BLOCK - 1) * CHIP.gap };
  const IP = { x: 16, y: 14, w: 904, h: 148 }; // the index box (memory)
  const EN = { y: 90, keyW: 160, arrowW: 40, valW: 76, h: 52 };
  const EN_W = EN.keyW + EN.arrowW + EN.valW;
  const EN_X = COL.x.map((x) => x + (COL.w - EN_W) / 2); // an entry is centred over its block
  const BAND = { tag: 526, stat: 516, statH: 80 }; // the bottom band: pills and the query tag, the counter
  const LOW = 64; // the segment sits this much higher while it is alone on the stage (balance); it sinks as the index appears
  const CX = 468; // the stage's centre line: the pills are centred on it
  const STAT = { x: COL.x[2] + COL.w - 341, w: 341 };
  const pillW = (text) => D3.tagW(text) + 28; // D3.tagW is a little short for bold text (measured)
  const TXT = {
    block: `block: ${BLOCK} keys next to each other`,
    sparse: "sparse index: one key per block",
    title: "index in memory: key and byte offset",
    keys: `${IDX.length} of ${N} keys`,
    get: `get ${FIND.key}`,
    range: `range: ${RANGE.from} to ${RANGE.to}`,
  };
  const KEYS_TAG = { x: IP.x + IP.w - 24 - pillW(TXT.keys), y: IP.y + 8 };
  D3.same(
    "sparse scene: everything fits the stage with the 12 px margin",
    [
      COL.x[0] >= 14 &&
        COL.x[2] + COL.w <= 922 &&
        COL.x[1] - COL.x[0] === COL.pitch &&
        COL.x[2] - COL.x[1] === COL.pitch,
      IP.y >= 14 && IP.x >= 12 && IP.x + IP.w <= 924,
      EN_X[0] >= IP.x + 12 && EN_X[2] + EN_W <= IP.x + IP.w - 12,
      EN.y + EN.h + 6 + 6 <= IP.y + IP.h, // the entries sit inside the box, their lips too
      KEYS_TAG.y + 58 + 4 <= EN.y && KEYS_TAG.x > IP.x + 20 + D3.tagW(TXT.title) + 20,
      IP.y + IP.h + 6 + 40 <= BP.y, // room for the pointers between the index and the blocks
      BP.y - LOW >= 14 && Math.abs((BP.y - LOW + BAND.tag - LOW + 58) / 2 - 320) < 30, // the lone segment (and its pill) is centred
      BP.y + BP.h + 6 + 24 <= BAND.stat,
      BAND.stat + BAND.statH + 6 + 4 <= 628 && BAND.tag + 58 + 4 <= 628,
      CX - pillW(TXT.block) / 2 >= 14 && CX + pillW(TXT.block) / 2 <= 922,
      CX - pillW(TXT.sparse) / 2 >= 14 && CX + pillW(TXT.sparse) / 2 <= 922,
      COL.x[0] + pillW(TXT.range) + 24 <= STAT.x && STAT.x + STAT.w <= 922,
    ],
    Array(12).fill(true),
  );

  // ---------- timeline ----------
  const T = {
    chips: 0.15, // key i pops at 0.15 + 0.06 i
    chipStep: 0.06,
    def1: [0.5, 2.3], // "block: 4 keys next to each other"
    slide: [2.0, 2.5], // the segment sinks by LOW to make room for the index
    idx: 2.45, // the index box
    ent: 2.65, // entry j pops at 2.65 + 0.15 j
    entStep: 0.15,
    ptr: 3.05, // pointer j draws at 3.05 + 0.25 j
    ptrStep: 0.25,
    ptrDur: 0.4,
    def2: [3.3, 4.9], // "sparse index: one key per block"
    keys: 3.95, // "3 of 12 keys"
    q: 5.0, // the blue tag "get handbag"
    ring: 5.25, // the entry hand rings blue
    jump: 5.4, // the blue jump runs down the pointer (0.5 s)
    stat: 6.2, // the counter pops
    get0: 6.5, // the scan of block 1 starts: one record every 0.5 s
    getStep: 0.5,
    reset: 8.4, // the first query is done, the second begins
    ring2: 8.6,
    jump2: 8.7, // (0.4 s)
    rg0: 9.15, // the range scan starts: one record every 0.22 s
    rgStep: 0.22,
  };
  const GET_AT = FIND.reads.map((_, j) => T.get0 + T.getStep * j);
  const RG_AT = RANGE.scanned.map((_, j) => T.rg0 + T.rgStep * j);
  const DUR = 12.0;
  D3.same(
    "sparse scene: the order of events",
    [
      T.chips + T.chipStep * (N - 1) + 0.3 <= 1.2, // the keys are in before the first caption has long started
      T.slide[0] >= 1.5 &&
        T.slide[1] <= T.idx + 0.1 &&
        T.def1[1] <= T.idx + 0.2 &&
        T.ent + T.entStep * (NB - 1) + 0.3 <= T.def2[0] + 0.1,
      T.ptr + T.ptrStep * (NB - 1) + T.ptrDur <= T.keys + 0.1,
      T.def2[1] <= T.q && T.q < T.ring && T.ring < T.jump && T.jump + 0.5 < T.get0,
      T.stat + 0.3 <= T.get0 + 0.1,
      GET_AT[GET_AT.length - 1] + 0.5 + 0.8 <= T.reset, // the found record is held for 0.8 s or more
      T.reset < T.ring2 && T.ring2 < T.jump2 && T.jump2 + 0.4 <= T.rg0 + 0.1,
      RG_AT[RG_AT.length - 1] + T.rgStep + 0.3 + 0.5 + 0.3 <= DUR, // the last ring clears, then the picture holds 0.5 s before the scene fades out
    ],
    Array(8).fill(true),
  );

  function build(stage) {
    // ---- the segment: three grey blocks, twelve sorted keys (read down, then on at the top of the next block) ----
    const low = V.h("div", { style: D3.abs(0, 0, 936, 640) });
    stage.append(low);
    const blocks = COL.x.map((x) => D3.panel(low, { x, y: BP.y, w: COL.w, h: BP.h, tone: "grey", plain: true }));
    const seg = D3.recs(low, {
      x: COL.x[0] + PAD,
      y: BP.y + PAD,
      w: CHIP.w,
      h: CHIP.h,
      gap: CHIP.gap,
      colGap: COL.pitch - CHIP.w,
      rows: BLOCK,
      recs: KEYS.map((k) => ({ k })),
      tone: "grey",
    });

    // ---- the index in memory: a purple box with one entry (key, byte offset) over each block ----
    const index = D3.panel(stage, { ...IP, tone: "purple", plain: true, title: TXT.title });
    const ents = IDX.map((e, j) =>
      D3.entries(stage, {
        x: EN_X[j],
        y: EN.y,
        rows: [{ key: e.key, val: e.off }],
        keyW: EN.keyW,
        arrowW: EN.arrowW,
        valW: EN.valW,
        h: EN.h,
      }),
    );
    const keysTag = D3.tag(stage, { ...KEYS_TAG, text: TXT.keys, tone: "orange" });

    // ---- the pointers (one layer over the boxes): an orange pointer per entry, a blue jump per query ----
    const layer = L5.svg(stage);
    const ptrs = IDX.map(() => D3.ptr(layer, { tone: "orange", w: 6, head: 20 }));
    const jumps = [0, 1].map(() => D3.ptr(layer, { tone: "blue", w: 9, head: 26 }));
    const geo = (j) => {
      const v = ents[j].valMid(0); // the pointer drops from the byte offset onto the first key of the block
      return { x1: v.x, y1: v.y + EN.h / 2 + 8, x2: v.x, y2: seg.top(j * BLOCK).y - 6 };
    };
    D3.same(
      "sparse scene: each pointer falls inside the key sticker it points at",
      IDX.map((_, j) => {
        const g = geo(j);
        return (
          g.x1 > seg.slot(j * BLOCK).x &&
          g.x1 < seg.right(j * BLOCK).x &&
          g.y2 < seg.top(j * BLOCK).y &&
          g.y2 > g.y1 + 30
        );
      }),
      Array(NB).fill(true),
    );

    // ---- the bottom band: the definitions (centred), then the query tag and the counter ----
    const msg = (parent, text, tone, solid, a, b) => {
      const w = pillW(text);
      const tag = D3.tag(parent, { x: Math.round(CX - w / 2), y: BAND.tag, text, tone, solid });
      tag.el.style.width = `${w}px`;
      return (t) => tag.set({ k: Math.min(ramp(t, a, a + 0.3, E.lin), 1 - ramp(t, b - 0.2, b, E.lin)) });
    };
    const pills = [
      msg(low, TXT.block, "grey", false, T.def1[0], T.def1[1]),
      msg(stage, TXT.sparse, "purple", true, T.def2[0], T.def2[1]),
    ];
    const query = D3.tag(stage, { x: COL.x[0], y: BAND.tag, text: TXT.get, tone: "blue" });
    const stat = D3.stat(stage, {
      x: STAT.x,
      y: BAND.stat,
      w: STAT.w,
      h: BAND.statH,
      label: "records read",
      tone: "orange",
    });

    /** key i: its state at time t (grey until it is read; blue = read, not an answer; green = an answer). Pure in t. */
    function keyState(i, t) {
      const st = { k: D3.seq(t, T.chips, T.chipStep, 0.3, i) };
      [
        { reads: FIND.reads, at: GET_AT, step: T.getStep, hits: [FIND.hit], until: T.reset },
        { reads: RANGE.scanned, at: RG_AT, step: T.rgStep, hits: RANGE.hits, until: Infinity },
      ].forEach((p) => {
        const j = p.reads.indexOf(i);
        if (j < 0 || t < p.at[j] || t >= p.until) return;
        const since = t - p.at[j];
        const hit = p.hits.includes(i);
        const hold = p.step + (j === p.reads.length - 1 ? 0.3 : 0); // the last ring stays a little longer
        const ring = Math.min(ramp(since, 0, 0.1, E.lin), 1 - ramp(since, hold - 0.1, hold, E.lin));
        Object.assign(st, {
          tone: hit ? "green" : "blue",
          solid: hit || since < 0.3,
          s: 1 + 0.08 * flash(since, 0, 0.3),
        });
        if (ring > 0.002) Object.assign(st, { ring: "blue", ringK: ring });
      });
      return st;
    }

    return (t) => {
      const k = (a, d = 0.35) => ramp(t, a, a + d, E.lin);

      // ---- the segment ----
      V.place(low, { y: -LOW * (1 - ramp(t, T.slide[0], T.slide[1], E.inOut)) });
      const first = 0.3 + 0.7 * k(0, 0.4); // the blocks are there on the first frame
      blocks.forEach((b) => b.set({ k: first }));
      seg.all((i) => keyState(i, t));

      // ---- the index ----
      index.set({ k: k(T.idx, 0.4) });
      const ringOn = (a, b) => Math.min(k(a, 0.25), 1 - ramp(t, b, b + 0.2, E.lin)); // in at a, out at b
      ents.forEach((m, j) => {
        const st = { k: D3.seq(t, T.ent, T.entStep, 0.35, j) };
        const rk = j === VIA ? Math.max(ringOn(T.ring, T.reset), ringOn(T.ring2, 99)) : 0;
        if (rk > 0.002) Object.assign(st, { ring: "blue", ringK: rk });
        m.set(0, st);
      });
      keysTag.set({ k: k(T.keys, 0.35), s: 1 + 0.05 * flash(t, T.keys, T.keys + 0.4) });
      // the blue jump runs over the orange pointer of its entry; the orange one steps back as the blue head appears (no muddy mix)
      const jk = [ramp(t, T.jump, T.jump + 0.5, E.inOut), ramp(t, T.jump2, T.jump2 + 0.4, E.inOut)];
      const jo = [t < T.reset ? 1 : 0, 1]; // the first jump is wiped when the second query starts (a cut: no half-faded arrows)
      const covered = Math.max(...jk.map((q, n) => ramp(q, 0.7, 1, E.lin) * jo[n]));
      ptrs.forEach((p, j) =>
        p.set({ ...geo(j), k: D3.seq(t, T.ptr, T.ptrStep, T.ptrDur, j), o: j === VIA ? 1 - covered : 1 }),
      );
      jumps.forEach((q, n) => q.set({ ...geo(VIA), k: jk[n], o: jo[n] }));

      // ---- the bottom band ----
      pills.forEach((p) => p(t));
      const swapped = t >= T.reset;
      query.set({
        text: swapped ? TXT.range : TXT.get,
        k: k(T.q, 0.3),
        s: 1 + 0.06 * flash(t, T.reset, T.reset + 0.3),
      });
      const at = swapped ? RG_AT : GET_AT;
      stat.set({
        text: String(at.filter((a) => t >= a).length),
        k: k(T.stat, 0.3),
        bump: clamp(0.4 * at.reduce((s, a) => s + flash(t, a, a + 0.25), 0) + 0.3 * flash(t, T.reset, T.reset + 0.3)),
      });
    };
  }

  V.scene({
    kicker: "SPARSE INDEX",
    title: ["Sorted keys need only", "a sparse index"],
    dur: DUR,
    caps: [
      [0.95, 2.5, "A segment sorted by key."],
      [3.0, 4.95, "The index holds only some keys."],
      [5.3, 6.95, "Jump to the key before it."],
      [7.0, 8.4, "Scan a short block."],
      [8.6, 11.7, "A range: one jump, read on."],
    ],
    build,
  });
})();

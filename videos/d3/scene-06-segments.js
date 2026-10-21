/* Lecture 3 (ds-3) · scene 6 (SEGMENTS): cut the log into segments, then compact them (lesson 3.2 "Segment files" and "Compaction",
   the cat-video play counts of scene 5). A log that only grows fills the disk, so it is cut into SEGMENTS: a file is closed when it
   holds the size limit (6 records) and the next write opens a new one. Many records, few keys: the 12 records hold only three keys
   (mew 6, purr 4, yawn 2). COMPACTION keeps the LATEST value of every key and drops the older copies, so the closed segments become
   one small compacted segment (12 records, 3 left). Everything comes from D3.SEG (D3.segment / D3.compact, asserted below and when
   the page loads). Words are defined where they first appear: "segment: one file of the log" and "size limit: 6 records" under the
   first file, "closed: full" and "active: new writes" under the files, "compaction: drop old values" beside the result. Colours: grey =
   a closed file and its records (and the disk drum), green = the file being written (the active one), a record just written, the kept
   (newest) records and the compacted result, blue = the write request and one key's records being looked at, red = old copies that
   are dropped, orange = the counters and the limit (purple does not appear: nothing here is in memory). The files sit lower while
   only they show (a balanced stage) and rise when the compaction row appears below them.
   Story (local seconds): 0.0 the first file (segment 1, green border: the active one) opens in the middle with six dashed slots,
   0.25 the two definitions pop under it, 0.6 the disk drum and the counter "records on disk", 0.9-2.0 six records are appended
   (0.22 s apart, each pops green and settles grey, the counter counts), 2.3 the limit is reached (the "size limit" tag lights up
   orange), 2.7 the definitions go, 3.0 the file CLOSES (its border turns grey, "closed: full") and slides left, 3.8 a new file opens
   in the middle, 4.25 the blue request "set mew 4" slides into its first slot (4.8), 4.8-5.65 the other five records land (0.17 s
   apart), 6.05 file 2 closes too, 6.45 file 3 opens ("active: new writes") and the counter makes room for a second one; KEYS: 7.15 /
   7.85 / 8.55 the records of mew, then purr, then yawn light up blue one key at a time while the counter "different keys" reads 1, 2,
   3; COMPACT: 9.35 the files rise, 9.65 the green card "compaction: drop old values" and the empty "compacted segment" (three
   dashed slots, its name under them) pop, 10.15 the three newest records (one per key) turn green, 10.55-11.35 the other nine turn
   red one after another, 11.45-12.3 copies of the three green records drop out of their file and slide into the compacted segment
   (the right-most first, so none cross), 12.35 the old files become dashed ghosts and the counter counts 12 down to 3; hold to the
   end (14 s: longer than the storyboard's 13 s, to give each state and the final comparison time to be read). */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- the data (the real segment() and compact(), asserted against the storyboard and the lesson) ----------
  const S = D3.SEG;
  const LIMIT = S.limit;
  const FLAT = S.flat;
  const NSEG = S.segs.length;
  const KEYS = [...new Set(FLAT.map((r) => r.k))]; // in order of first write
  const GROUPS = KEYS.map((k) => FLAT.map((r, i) => (r.k === k ? i : -1)).filter((i) => i >= 0));
  const KEEP = S.keep;
  const DROP = S.drop;
  D3.same("segments scene: two full segments of 6, the next write opens segment 3", [NSEG, LIMIT, S.next], [2, 6, 2]);
  D3.same("segments scene: the segments hold the 12 records in order", S.segs.flat(), FLAT);
  D3.same("segments scene: three keys in order of first write", KEYS, ["mew", "purr", "yawn"]);
  D3.same(
    "segments scene: 12 records for 3 keys (mew 6, purr 4, yawn 2)",
    [FLAT.length, GROUPS.map((g) => g.length)],
    [12, [6, 4, 2]],
  );
  D3.same(
    "segments scene: compaction keeps the latest record of each key",
    GROUPS.map((g) => g[g.length - 1]).sort((a, b) => a - b),
    KEEP,
  );
  D3.same("segments scene: one record survives per key", [KEEP.length, S.after, S.before], [KEYS.length, 3, 12]);
  D3.same(
    "segments scene: the dropped records are all the others",
    [...KEEP, ...DROP].sort((a, b) => a - b),
    FLAT.map((_, i) => i),
  );
  D3.same(
    "segments scene: the survivors are the compacted output, in log order",
    KEEP.map((i) => FLAT[i]),
    S.out,
  );

  // ---------- layout (stage px; the stage is 936 x 640, the margin is 12). A = the files, which sit lower at first ----------
  const P = { w: 296, h: 242, y: 14 }; // a file (segment panel)
  const X = [14, 320, 626]; // x of segment 1, 2, 3; the first file opens in the middle (X[1]) and slides left
  const R = { x: 10, y: 56, w: 134, h: 52, gap: 8, colGap: 8 }; // the six slots of a file: 2 columns x 3 rows
  const slotAt = (i) => ({ x: R.x + (i % 2) * (R.w + R.colGap), y: R.y + Math.floor(i / 2) * (R.h + R.gap) });
  const flatAt = (i) => {
    const q = slotAt(i % LIMIT);
    return { x: X[Math.floor(i / LIMIT)] + q.x, y: P.y + q.y }; // top-left of record i, in A coordinates
  };
  const TAG_Y = P.y + P.h + 14; // the row of tags under the files
  const DY0 = 90; // A sits this much lower until compaction starts (the stage is balanced while only the files show)
  const STAT = { y: 520, h: 80, rw: 350, kw: 320, gap: 24 };
  const DISK = { w: 70, gap: 16 }; // a small disk drum in front of the counters: "on disk"
  const rowW = (n) => DISK.w + DISK.gap + STAT.rw + (n > 1 ? STAT.gap + STAT.kw : 0); // the row of icon and counters
  STAT.x0 = Math.round((936 - rowW(2)) / 2);
  STAT.x = STAT.x0 + DISK.w + DISK.gap;
  STAT.shift = Math.round((936 - rowW(1)) / 2) - STAT.x0; // the first counter starts centred (alone), then moves left
  const C = { x: 82, y: 360, w: 458, h: 126 }; // the compacted segment
  const CR = { x: C.x + 20, y: C.y + 14 }; // its three slots (the name sits under them, out of the copies' way)
  const CARD = { x: 620, y: 373, w: 292, h: 100 };
  const TXT = {
    seg: "segment: one file of the log",
    lim: `size limit: ${LIMIT} records`,
    closed: "closed: full",
    active: "active: new writes",
  };
  const W = Object.fromEntries(Object.entries(TXT).map(([n, s]) => [n, Math.round(s.length * 28 * 0.49 + 40)])); // measured: about 13.7 px a character plus the pill
  const LEG_W = W.seg + 24 + W.lim;
  const LEG_X = Math.round(X[1] + P.w / 2 - LEG_W / 2);
  const CHIP = { w: 180, h: 52, from: 640 }; // "set mew 4" slides from the right into the first slot of segment 2
  D3.same(
    "segments scene: everything fits the stage with the 12 px margin",
    [
      X[0] >= 14 && X[2] + P.w <= 922,
      R.x + 2 * R.w + R.colGap + R.x === P.w,
      R.y + 3 * R.h + 2 * R.gap + 14 <= P.h,
      Math.max(W.closed, W.active) <= P.w,
      LEG_X >= 14 && LEG_X + LEG_W <= 922,
      STAT.x0 >= 14 && STAT.x + STAT.rw + STAT.gap + STAT.kw <= 922,
      STAT.y + STAT.h + 6 <= 626,
      TAG_Y + 58 + DY0 + 8 < STAT.y, // the lowered files stay clear of the counters
      CR.x + 3 * R.w + 2 * R.colGap <= C.x + C.w - 14,
      C.y + 74 + 34 + 18 === C.y + C.h && CARD.y + CARD.h / 2 === C.y + C.h / 2,
      C.y > TAG_Y + 58 + 6 && C.y + C.h + 6 < STAT.y,
      C.x + C.w + 60 < CARD.x && CARD.x + CARD.w <= 922,
      CHIP.from + CHIP.w <= 922,
    ],
    Array(13).fill(true),
  );

  // ---------- timeline ----------
  const T = {
    rec: 0.9, // record i of segment 1 lands at 0.9 + 0.22 i
    step1: 0.22,
    limit: 2.3, // the sixth record is in: the size limit is reached
    legOut: 2.7, // the two definitions give way to "closed: full"
    close1: 3.0,
    slide: 3.35, // file 1 slides left (0.45 s)
    open2: 3.8,
    chip: 4.25, // the write request pops, flies 4.5-4.8 and becomes the first record of file 2
    fly: 4.5,
    rec2: 4.8, // record i of segment 2 lands at 4.8 + 0.17 (i - 6)
    step2: 0.17,
    close2: 6.05,
    open3: 6.45,
    active: 6.7,
    keys: 7.15, // the three keys light up one after another, 0.7 s each
    group: 0.7,
    rise: 9.35, // the files rise, the compaction row appears below
    cmp: 9.65,
    keep: 10.15, // the newest record of every key turns green
    drop: 10.55, // the other nine turn red, 0.09 s apart
    dropStep: 0.09,
    copy: 11.45, // copies of the survivors slide into the compacted segment (0.12 s apart, 0.65 s each)
    copyStep: 0.12,
    copyDur: 0.65,
    ghost: 12.35, // the old files are done: dashed ghosts, and the counter counts down
  };
  const DUR = 14;
  const OPEN = [0, T.open2, T.open3];
  const CLOSE = [T.close1, T.close2];
  const LAND = FLAT.map((_, i) => (i < LIMIT ? T.rec + T.step1 * i : T.rec2 + T.step2 * (i - LIMIT)));
  const COPY_AT = KEEP.map((_, j) => T.copy + T.copyStep * (KEEP.length - 1 - j)); // the right-most goes first, so no two copies cross
  const COPY_END = Math.max(...COPY_AT) + T.copyDur;
  D3.same(
    "segments scene: the order of events",
    [
      LAND[LIMIT - 1] + 0.3 <= T.limit && T.limit + 0.4 <= T.legOut && T.legOut + 0.25 <= T.close1,
      T.close1 + 0.35 <= T.slide && T.slide + 0.45 <= T.open2 + 1e-9 && T.open2 + 0.4 <= T.chip,
      T.chip + 0.25 <= T.fly && T.fly + 0.3 <= LAND[LIMIT],
      LAND[FLAT.length - 1] + 0.3 <= T.close2 && T.close2 + 0.35 <= T.open3 && T.open3 + 0.2 <= T.active,
      T.active + 0.35 <= T.keys && T.keys + T.group * KEYS.length <= T.rise,
      T.rise + 0.55 <= T.cmp + 0.4 && T.cmp + 0.4 <= T.keep && T.keep + 0.3 <= T.drop,
      T.drop + T.dropStep * (DROP.length - 1) + 0.2 <= T.copy + 0.05 && COPY_END <= T.ghost,
      T.ghost + 0.6 + 1 <= DUR,
    ],
    Array(8).fill(true),
  );

  function build(stage) {
    // ---- A: the three files (panel, six dashed slots, records, tag), the definitions, the write request ----
    const A = V.h("div", { style: D3.abs(0, 0, 936, 640) });
    stage.append(A);
    const wraps = X.map((x) => A.appendChild(V.h("div", { style: D3.abs(x, P.y, P.w, P.h) })));
    const panels = wraps.map((w, s) =>
      D3.panel(w, { x: 0, y: 0, w: P.w, h: P.h, tone: "green", plain: true, title: `segment ${s + 1}` }),
    );
    const rec = { x: R.x, y: R.y, w: R.w, h: R.h, gap: R.gap, colGap: R.colGap, cols: 2 };
    const slots = wraps.map((w) => D3.recs(w, { ...rec, recs: Array(LIMIT).fill({}) }));
    const lists = S.segs.map((seg, s) => D3.recs(wraps[s], { ...rec, recs: seg }));
    const tagAt = (text, w) => ({ x: Math.round((P.w - w) / 2), y: P.h + 14, text });
    const closed = [0, 1].map((s) => D3.tag(wraps[s], { ...tagAt(TXT.closed, W.closed), tone: "grey" }));
    const active = D3.tag(wraps[2], { ...tagAt(TXT.active, W.active), tone: "green", solid: true });
    const legSeg = D3.tag(A, { x: LEG_X, y: TAG_Y, text: TXT.seg, tone: "grey" });
    const legLim = D3.tag(A, { x: LEG_X + W.seg + 24, y: TAG_Y, text: TXT.lim, tone: "orange" });
    const first = flatAt(LIMIT);
    const chip = D3.chip(A, {
      x: CHIP.from,
      y: first.y,
      w: CHIP.w,
      h: CHIP.h,
      text: `set ${FLAT[LIMIT].k} ${FLAT[LIMIT].v}`,
      tone: "blue",
      fs: 28,
      radius: 16,
    });

    // ---- the two counters ----
    const diskLayer = L5.svg(stage);
    const disk = diskLayer.appendChild(D3.disk(STAT.x0 + DISK.w / 2, STAT.y + STAT.h / 2, 62, "grey"));
    const statRec = D3.stat(stage, {
      x: STAT.x,
      y: STAT.y,
      w: STAT.rw,
      h: STAT.h,
      label: "records on disk",
      tone: "orange",
    });
    const statKeys = D3.stat(stage, {
      x: STAT.x + STAT.rw + STAT.gap,
      y: STAT.y,
      w: STAT.kw,
      h: STAT.h,
      label: "different keys",
      tone: "orange",
    });

    // ---- the compaction row: a green card that says what it does, an arrow, the compacted segment and its three slots ----
    const card = D3.card(stage, {
      ...CARD,
      text: "compaction:\ndrop old values",
      tone: "green",
      plain: false,
    });
    card.el.style.whiteSpace = "pre-line"; // the text breaks where it says
    const panelC = D3.panel(stage, { ...C, tone: "green", plain: false, title: "" });
    const nameC = D3.label(stage, { x: C.x, y: C.y + 74, w: C.w, text: "compacted segment", tone: "green" });
    const slotsC = D3.recs(stage, { ...rec, x: CR.x, y: CR.y, cols: 3, recs: S.out.map(() => ({})) });
    const layer = L5.svg(stage);
    const ptr = D3.ptr(layer, { tone: "green", w: 7, head: 22 });
    const copies = S.out.map((r, j) =>
      D3.recCell(stage, { x: CR.x + j * (R.w + R.colGap), y: CR.y, w: R.w, h: R.h, fs: 28, radius: 16, rec: r }),
    );

    // a little less air between a record's key and its value badge, so "yawn 2" has room in its tile
    stage.querySelectorAll(".v-gene").forEach((tile) => {
      tile.style.gap = "6px";
      if (tile.children[1]) tile.children[1].style.padding = "0 8px";
    });

    return (t) => {
      const k = (a, d = 0.35) => ramp(t, a, a + d, E.lin);
      const dy = DY0 * (1 - ramp(t, T.rise, T.rise + 0.55, E.inOut));
      V.place(A, { y: dy });

      // ---- the files: green while they are written, grey once closed, dashed ghosts when compaction is done ----
      panels.forEach((p, s) => {
        const closeAt = s < NSEG ? CLOSE[s] : 1e9;
        const ghost = s < NSEG && t >= T.ghost + 0.15 * s;
        p.set({
          tone: t >= closeAt ? "grey" : "green",
          k: s === 0 ? 0.25 + 0.75 * k(0, 0.4) : k(OPEN[s], 0.4), // the first file is already there on the first frame
          s: 1 + 0.04 * flash(t, closeAt, closeAt + 0.3),
        });
        p.el.style.borderStyle = ghost ? "dashed" : "";
        if (ghost) Object.assign(p.el.style, { background: "transparent", boxShadow: "none" });
      });
      V.place(wraps[0], { x: (X[1] - X[0]) * (1 - ramp(t, T.slide, T.slide + 0.45, E.inOut)) });
      slots.forEach((sl, s) =>
        sl.all((i) => ({
          ghost: true,
          k: s === 0 ? 0.25 + 0.75 * k(0, 0.4) : k(OPEN[s], 0.4),
          o: s < NSEG && t >= LAND[s * LIMIT + i] ? 0 : 1, // a slot is empty until its record lands
        })),
      );

      // ---- the records: pop in green, settle grey; one key at a time blue; newest green, the rest red; then ghosts ----
      lists.forEach((ls, s) =>
        ls.all((i) => {
          const f = s * LIMIT + i;
          const st = { tone: "grey", k: ramp(t, LAND[f], LAND[f] + 0.3, E.lin) };
          if (t >= LAND[f] && t < LAND[f] + 0.4) Object.assign(st, { tone: "green", solid: true });
          GROUPS.forEach((g, gi) => {
            const a = T.keys + T.group * gi;
            if (t >= a && t < a + T.group && g.includes(f))
              Object.assign(st, { tone: "blue", s: 1 + 0.06 * flash(t, a, a + 0.3) });
          });
          if (t >= T.keep && KEEP.includes(f))
            Object.assign(st, { tone: "green", solid: true, s: 1 + 0.08 * flash(t, T.keep, T.keep + 0.3) });
          const j = DROP.indexOf(f);
          const a = T.drop + T.dropStep * j;
          if (j >= 0 && t >= a) Object.assign(st, { tone: "red", s: 1 + 0.08 * flash(t, a, a + 0.25) });
          if (t >= T.ghost + 0.04 * f) Object.assign(st, { ghost: true, solid: false });
          return st;
        }),
      );

      // ---- tags: the two definitions, "closed: full" under a full file, "active: new writes" under the open one ----
      const legK = Math.min(k(0.25), 1 - ramp(t, T.legOut, T.legOut + 0.25, E.lin));
      legSeg.set({ k: legK });
      legLim.set({
        k: legK,
        solid: t >= T.limit && t < T.limit + 0.4,
        s: 1 + 0.06 * flash(t, T.limit, T.limit + 0.4),
      });
      closed.forEach((tg, s) => tg.set({ k: Math.min(k(CLOSE[s]), 1 - ramp(t, T.rise, T.rise + 0.25, E.lin)) }));
      active.set({ k: k(T.active) });

      // ---- the write request: pops on the right, slides into the first slot of the new file and becomes its first record ----
      chip.set({
        k: k(T.chip, 0.25),
        x: (first.x - CHIP.from) * ramp(t, T.fly, T.rec2, E.inOut),
        o: 1 - ramp(t, T.rec2 - 0.1, T.rec2, E.lin),
      });

      // ---- the counters: records on disk (counts every append, then counts down), different keys (1, 2, 3) ----
      const written = LAND.filter((a) => t >= a).length;
      const shown =
        t < T.ghost ? written : S.before - Math.round((S.before - S.after) * ramp(t, T.ghost, T.ghost + 0.6, E.inOut));
      const bump = LAND.reduce((s, a) => s + flash(t, a, a + 0.25), 0) + flash(t, T.ghost, T.ghost + 0.6);
      statRec.set({
        text: String(shown),
        k: k(0.6, 0.3),
        x: STAT.shift * (1 - ramp(t, T.keys - 0.6, T.keys - 0.1, E.inOut)),
        bump: 0.4 * clamp(bump),
      });
      V.place(disk, { x: STAT.shift * (1 - ramp(t, T.keys - 0.6, T.keys - 0.1, E.inOut)), ...D3.pop(k(0.6, 0.3)) });
      const nk = clamp(1 + Math.floor((t - T.keys) / T.group), 1, KEYS.length);
      const nkAt = T.keys + T.group * (nk - 1);
      statKeys.set({ text: String(nk), k: k(T.keys, 0.3), bump: 0.4 * flash(t, nkAt, nkAt + 0.3) });

      // ---- the compaction row: the card and the empty compacted segment pop, then the survivors slide in ----
      card.set({ k: k(T.cmp, 0.4) });
      panelC.set({ k: k(T.cmp + 0.1, 0.4) });
      nameC.set({ k: k(T.cmp + 0.2, 0.3), bold: true });
      ptr.set({
        x1: CARD.x - 8,
        y1: C.y + C.h / 2,
        x2: C.x + C.w + 12,
        y2: C.y + C.h / 2,
        k: ramp(t, T.cmp + 0.3, T.cmp + 0.6, E.out),
      });
      slotsC.all((j) => ({
        ghost: true,
        k: k(T.cmp + 0.1, 0.4),
        o: 1 - ramp(t, COPY_AT[j] + T.copyDur - 0.05, COPY_AT[j] + T.copyDur, E.lin),
      }));
      copies.forEach((cp, j) => {
        const t0 = COPY_AT[j];
        const f = ramp(t, t0, t0 + T.copyDur, E.inOut);
        const from = flatAt(KEEP[j]);
        const to = { x: CR.x + j * (R.w + R.colGap), y: CR.y };
        cp.set({
          tone: "green",
          solid: true,
          k: k(t0, 0.1),
          x: (from.x - to.x) * (1 - ramp(f, 0.45, 1, E.inOut)), // drops out of its file first, then slides across
          y: (from.y + dy - to.y) * (1 - f),
          s: 1 + 0.08 * flash(t, t0 + T.copyDur - 0.1, t0 + T.copyDur + 0.15),
        });
      });
    };
  }

  V.scene({
    kicker: "SEGMENTS",
    title: ["Cut the log into segments,", "then compact them"],
    dur: DUR,
    caps: [
      [1.0, 3.2, "A log that only grows fills the disk."],
      [3.35, 6.9, "So close a file at its size limit."],
      [7.15, 9.7, "Many records, only three keys."],
      [10.2, 13.9, "Compaction keeps the latest value per key."],
    ],
    build,
  });
})();

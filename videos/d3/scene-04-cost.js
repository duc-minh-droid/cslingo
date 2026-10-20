/* Lecture 3 (ds-3) · scene 4 (THE COST): appending is cheap, finding means scanning (lesson 3.1 "Performance of the simple database").
   A write adds ONE line to the end of the log: one step. A read must look at EVERY line, because the last line for the key can be
   the very last one (so the scan cannot stop early): 8 lines take 8 steps, 16 lines take 16 steps, twice the data is twice the scan,
   O(n). So a log needs an index. The file is the same grey "log file" panel as scene 3 (lines are "key value" stickers, the newest
   line is at the end), but now it is long: it reads down a column and on to the next, so the end of the file is the bottom of
   the last column. Every number comes from D3.runLog / D3.COST (asserted below and when the page loads): the first log has 8 lines
   (the last one is the newly written "bike 8"), the second has 16 (8 more arrive, the newest "bike 16" is again the last line).
   Words are defined where they first appear: "1 step = 1 line written or read" (orange tag, with the write), the line counts sit in
   the read counters ("read 8 lines", "read 16 lines"), "n lines = n steps" defines O(n), and "an index skips the scan" says what
   an index is for. Colours: grey = the file, blue = the request and the scan ring, green = written / found, orange = steps (cost),
   purple = in memory (the index).
   Story (local seconds): 0.0 the panel pops, 0.05 seven lines pop (0.04 s apart), 0.4 the dashed "next line" slot, 0.55 the blue
   chip "set bike 8" pops at the right, 0.95-1.5 it slides into the slot, 1.5 the eighth line pops green, 1.85 the green counter
   "write 1 line: 1 step", 2.0 the orange tag that says what a step is; READ: 3.3 the chip "get bike" pops in the panel header, 3.4
   the orange counter "read 8 lines: 0 steps", 3.7-5.7 a blue ring reads the eight lines one after another (0.25 s each, every
   line it has read turns orange, the counter counts 1 to 8), 5.7 the last line, the answer, turns solid green; DOUBLE: 6.2-6.8
   the file widens, the lines pan left, the whole picture rises 34 px (it sat lower while the file was short, for balance) and the
   first read's marks clear, 6.45 eight more lines pop in the new columns, 6.95 the
   second counter "read 16 lines", 7.15-8.91 the ring reads sixteen lines (0.11 s each: the older bike line turns blue and the scan
   goes on, the newest bike line at the end turns solid green), 8.95 the orange "x2" between the two counters, 9.05 "O(n)" and
   "n lines = n steps", 9.45 the purple "an index skips the scan". The last lines of the file (bike 8 blue, bike 16 green solid) and the three rows of
   counters and tags hold. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (run through the real log, asserted against the storyboard and the lesson) ----------
  const KEY = "bike";
  const OLD = ["dock", "helmet", "dock", "dock", "helmet", "dock", "helmet"]; // the seven lines already in the file
  const MORE = ["dock", "helmet", "helmet", "dock", "dock", "helmet", "dock"]; // seven more arrive later
  /** set every key in order (the value is the line number, like the lesson's counter), then get bike */
  const run = (keys) => {
    const r = D3.runLog([...keys.map((k, i) => ({ op: "set", k, v: i + 1 })), { op: "get", k: KEY }]);
    return { lines: r.lines, writes: r.steps.slice(0, -1), read: r.steps[r.steps.length - 1] };
  };
  const R1 = run([...OLD, KEY]); // 8 lines: the newest write is the bike line at the end
  const R2 = run([...OLD, KEY, ...MORE, KEY]); // 16 lines
  const N1 = R1.lines.length;
  const N2 = R2.lines.length;
  D3.same(
    "cost scene: every write is one step",
    [...new Set([...R1.writes, ...R2.writes].map((w) => w.cost))],
    [D3.COST.write],
  );
  D3.same("cost scene: 8 lines take 8 steps to read", [N1, R1.read.scanned], [D3.COST.first.n, D3.COST.first.scan]);
  D3.same("cost scene: 16 lines take 16 steps to read", [N2, R2.read.scanned], [D3.COST.second.n, D3.COST.second.scan]);
  D3.same("cost scene: twice the lines, twice the steps", R2.read.scanned / R1.read.scanned, D3.COST.ratio);
  D3.same(
    "cost scene: the newest bike line is the last line, so the scan cannot stop early",
    [R1.read.win, R2.read.win, R1.read.hits, R2.read.hits],
    [N1 - 1, N2 - 1, [N1 - 1], [N1 - 1, N2 - 1]],
  );
  D3.same("cost scene: the second log starts with the first", R2.lines.slice(0, N1), R1.lines);
  const WRITE = R1.writes[N1 - 1]; // the write that makes line 8
  D3.same("cost scene: that write appends line 8", [WRITE.op.k, WRITE.op.v, WRITE.line], [KEY, N1, N1 - 1]);
  const LAST = N1 - 1; // index of the written line
  const SCANS = [
    { r: R1.read, t0: 3.7, d: 0.25 }, // the first read, 8 lines: 0.25 s a line
    { r: R2.read, t0: 7.15, d: 0.11 }, // the second read, 16 lines: faster
  ].map((s) => ({ ...s, n: s.r.scanned, win: s.r.win, hits: s.r.hits, end: s.t0 + s.r.scanned * s.d }));

  // ---------- layout (stage px; the stage is 936 x 640, the margin is 12) ----------
  const ROWS = 4; // lines per column
  const COLS = [N1 / ROWS, N2 / ROWS]; // 2 columns for 8 lines, 4 for 16
  D3.same("cost scene: 8 lines fill two columns of four, 16 lines four", COLS, [2, 4]);
  const TILE = { w: 192, h: 60, gap: 10, colGap: 12, fs: 30, radius: 18 };
  const PITCH = TILE.w + TILE.colGap; // one column to the next
  const PAD = 24;
  const HEAD = 60; // the panel's header row (its title, the get chip)
  const panelW = (cols) => 2 * PAD + cols * TILE.w + (cols - 1) * TILE.colGap;
  const PANEL = { y: 106, h: HEAD + ROWS * TILE.h + (ROWS - 1) * TILE.gap + 14 };
  const PANEL_X = [(936 - panelW(COLS[0])) / 2, (936 - panelW(COLS[1])) / 2]; // centred before and after
  const SLIDE = (PITCH * (COLS[1] - COLS[0])) / 2; // how far the lines pan left while the file widens (the panel grows 2 x this)
  D3.same("cost scene: the panel grows by 2 x the pan", panelW(COLS[1]) - panelW(COLS[0]), 2 * SLIDE);
  const LIST = { x: PANEL_X[1] + PAD, y: PANEL.y + HEAD }; // the lines at their final places (pan = SLIDE before the file widens)
  const slotXY = (i) => ({ x: Math.floor(i / ROWS) * PITCH, y: (i % ROWS) * (TILE.h + TILE.gap) }); // line i inside the list
  const STAT = { w: 400, h: 80, y: PANEL.y + PANEL.h + 16 }; // the read counters under the file
  const STAT_X = [(936 - STAT.w) / 2, 24, 936 - 24 - STAT.w]; // centred first, then left and right
  const WRITE_STAT = { w: 360, y: 12 };
  const LEGEND_TEXT = "1 step = 1 line written or read";
  const LEGEND_W = D3.tagW(LEGEND_TEXT);
  const TOP_X = Math.round((936 - (WRITE_STAT.w + 16 + LEGEND_W)) / 2); // the write counter and its legend, centred together
  const CHIP = { w: 180, h: 56, x: 716 }; // "set bike 8": starts at the right of the file, level with the slot
  const GET = { w: 160, h: 44, y: PANEL.y + 4 }; // "get bike": in the header, at the file's right end
  const TAG_Y = STAT.y + STAT.h + 16; // the conclusion row
  const LOWER = 34; // while the file is short the picture sits this much lower (better balance), then it rises
  const TAG_H = 58;
  const O_TEXT = "O(n)";
  const N_TEXT = "n lines = n steps";
  const IDX_TEXT = "an index skips the scan";
  const ROW_W = D3.tagW(O_TEXT) + 12 + D3.tagW(N_TEXT) + 16 + D3.tagW(IDX_TEXT);
  const ROW_X = Math.round((936 - ROW_W) / 2);
  D3.same(
    "cost scene: everything keeps the 12 px margin and the stage",
    [
      PANEL_X[1] >= 12,
      STAT_X[1] - 0.02 * STAT.w >= 12,
      STAT_X[2] + STAT.w + 0.02 * STAT.w <= 924,
      TOP_X >= 12 && WRITE_STAT.y >= 12,
      TOP_X + WRITE_STAT.w + 16 + LEGEND_W <= 924,
      CHIP.x + CHIP.w <= 924,
      ROW_X >= 12 && ROW_X + ROW_W <= 924,
      TAG_Y + TAG_H + 6 <= 640 - 12,
      STAT_X[1] + STAT.w + 76 <= STAT_X[2],
    ],
    Array(9).fill(true),
  );

  // ---------- timeline ----------
  const T = {
    panel: 0,
    tiles: 0.05, // line i of the first seven pops at 0.05 + 0.04 i
    slot: 0.4,
    chip: 0.55, // the write request pops ...
    slide: 0.95, // ... slides left into the slot (0.55 s) ...
    land: 1.5, // ... and the line pops
    wstat: 1.85,
    legend: 2.0,
    gchip: 3.3,
    rstat: 3.4,
    grow: 6.2, // the file widens (0.6 s) and the first read's marks clear
    more: 6.45, // eight more lines pop, 0.05 s apart
    rstat2: 6.95,
    x2: SCANS[1].end + 0.04,
    ot: SCANS[1].end + 0.14,
    idx: 9.45,
  };
  D3.same(
    "cost scene: the order of events",
    [
      T.chip + 0.3 <= T.slide,
      T.land > T.slide + 0.5,
      T.legend > T.wstat,
      SCANS[0].end < T.grow,
      T.more + 7 * 0.05 + 0.3 <= SCANS[1].t0, // all sixteen lines are there before the second read starts
      T.rstat2 < SCANS[1].t0,
      T.x2 < T.ot && T.ot < T.idx,
    ],
    Array(7).fill(true),
  );
  const clearAt = (i) => T.grow + 0.02 * i; // the first read's marks clear line by line while the file widens

  /** the file panel: a plain grey sticker whose width follows the number of columns (D3.panel has a fixed size) */
  function fileBox(parent) {
    const el = V.h("div", {
      class: "v-card plain c-grey",
      style: { ...D3.abs(0, PANEL.y, 100, PANEL.h), borderRadius: "26px" },
    });
    el.append(
      V.h("div", {
        text: "log file",
        style: {
          ...D3.abs(20, 10, 300),
          fontSize: "28px",
          fontWeight: "900",
          whiteSpace: "nowrap",
          color: "var(--c-ink)",
        },
      }),
    );
    parent.append(el);
    return {
      set({ x, w, k }) {
        el.style.left = `${D3.f1(x)}px`;
        el.style.width = `${D3.f1(w)}px`;
        V.place(el, { s: D3.popOf({ k }, 0.94, 0.06), o: D3.fadeOf({ k }) });
      },
    };
  }
  const stepsText = (n) => `${n} step${n === 1 ? "" : "s"}`;
  /** a counter sticker with every number in one size (D3.stat shrinks long numbers) and a calmer bump */
  const setStat = (s, st) => {
    s.set({ ...st, bump: 0.4 * (st.bump || 0) });
    s.el.lastElementChild.style.fontSize = "38px";
  };

  function build(stage) {
    // everything lives in one rig so the picture can sit a little lower while the file is short, and rise as it widens
    const rig = V.h("div", { style: D3.abs(0, 0, 936, 640) });
    stage.append(rig);
    // ---- the file: the panel, the lines at their final places (they are panned right until the file widens) ----
    const box = fileBox(rig);
    const list = D3.recs(rig, {
      x: LIST.x,
      y: LIST.y,
      w: TILE.w,
      h: TILE.h,
      gap: TILE.gap,
      colGap: TILE.colGap,
      rows: ROWS,
      recs: R2.lines,
      fs: TILE.fs,
      radius: TILE.radius,
    });
    const slot = D3.recCell(list.el, { ...slotXY(LAST), w: TILE.w, h: TILE.h, fs: 28, radius: TILE.radius, rec: {} });

    // ---- the requests: "set bike 8" comes in from the right, "get bike" sits in the panel header ----
    const slotY = LIST.y + slotXY(LAST).y;
    const setChip = D3.chip(rig, {
      x: CHIP.x,
      y: slotY + (TILE.h - CHIP.h) / 2,
      w: CHIP.w,
      h: CHIP.h,
      text: `set ${WRITE.op.k} ${WRITE.op.v}`,
      tone: "blue",
      fs: 28,
      radius: 16,
    });
    const slotX = LIST.x + SLIDE + slotXY(LAST).x; // where the slot is before the file widens
    const getChip = D3.chip(rig, {
      x: PANEL_X[0] + panelW(COLS[0]) - PAD - GET.w,
      y: GET.y,
      w: GET.w,
      h: GET.h,
      text: `get ${KEY}`,
      tone: "blue",
      fs: 28,
      radius: 16,
    });

    // ---- the counters ----
    const wstat = D3.stat(rig, { x: TOP_X, y: WRITE_STAT.y, w: WRITE_STAT.w, label: "write 1 line", tone: "green" });
    const legend = D3.tag(rig, {
      x: TOP_X + WRITE_STAT.w + 16,
      y: WRITE_STAT.y + (80 - TAG_H) / 2,
      text: LEGEND_TEXT,
      tone: "orange",
    });
    const rstats = SCANS.map((s, i) =>
      D3.stat(rig, { x: STAT_X[i === 0 ? 0 : 2], y: STAT.y, w: STAT.w, label: `read ${s.n} lines`, tone: "orange" }),
    );
    const twice = D3.disc(rig, { x: 468, y: STAT.y + STAT.h / 2, size: 64, text: "×2", tone: "orange" });

    // ---- the conclusion: O(n), what n is, and what an index is for ----
    const oTag = D3.tag(rig, { x: ROW_X, y: TAG_Y, text: O_TEXT, tone: "orange", solid: true });
    const nTag = D3.tag(rig, { x: ROW_X + D3.tagW(O_TEXT) + 12, y: TAG_Y, text: N_TEXT, tone: "orange" });
    const idxTag = D3.tag(rig, {
      x: ROW_X + D3.tagW(O_TEXT) + 12 + D3.tagW(N_TEXT) + 16,
      y: TAG_Y,
      text: IDX_TEXT,
      tone: "purple",
    });

    return (t) => {
      const k = (a, d = 0.35) => ramp(t, a, a + d, E.lin);
      const grow = ramp(t, T.grow, T.grow + 0.6, E.inOut); // 0 = eight lines in two columns, 1 = sixteen in four

      // ---- the file widens to the right and the lines pan left so it stays centred (the whole picture rises a little) ----
      V.place(rig, { y: LOWER * (1 - grow) });
      box.set({
        x: PANEL_X[0] + (PANEL_X[1] - PANEL_X[0]) * grow,
        w: panelW(COLS[0]) + (panelW(COLS[1]) - panelW(COLS[0])) * grow,
        k: k(T.panel, 0.4),
      });
      V.place(list.el, { x: SLIDE * (1 - grow) });

      // ---- the lines: seven pop in, the written one, then eight more; the ring and the marks of the two reads ----
      list.all((i) => {
        const k0 =
          i < LAST
            ? D3.seq(t, T.tiles, 0.04, 0.3, i)
            : i === LAST
              ? ramp(t, T.land, T.land + 0.3, E.lin)
              : D3.seq(t, T.more, 0.05, 0.3, i - N1);
        const st = { k: k0, tone: "grey" };
        if (i === LAST && t >= T.land && t < clearAt(i)) Object.assign(st, { tone: "green", solid: t < T.land + 0.55 }); // just written
        SCANS.forEach((s, si) => {
          if (t < s.t0 || i >= s.n || (si === 0 && t >= clearAt(i))) return; // not started, a line the file did not have yet, cleared
          const at = s.t0 + i * s.d; // the ring reaches line i
          if (t < at) return;
          st.tone = i === s.win ? "green" : s.hits.includes(i) ? "blue" : "orange"; // the key's older line stays blue, the rest is a step paid
          st.solid = false;
          if (t < at + s.d) Object.assign(st, { ring: "blue", ringK: ramp(t, at, at + 0.1, E.lin) });
          if (i === s.win && t >= s.end)
            Object.assign(st, { solid: true, s: 1 + 0.08 * flash(t, s.end, s.end + 0.35) }); // the last bike line: found
        });
        return st;
      });
      slot.set({
        ghost: true,
        text: "next line",
        k: k(T.slot, 0.35),
        o: 1 - ramp(t, T.land - 0.1, T.land + 0.1, E.lin),
      });

      // ---- write: the request slides into the slot, the line appears, one step ----
      setChip.set({
        k: k(T.chip, 0.3),
        x: (slotX + (TILE.w - CHIP.w) / 2 - CHIP.x) * ramp(t, T.slide, T.land, E.inOut),
        o: 1 - ramp(t, T.land + 0.02, T.land + 0.2, E.lin),
      });
      setStat(wstat, { text: stepsText(WRITE.cost), k: k(T.wstat), bump: flash(t, T.wstat, T.wstat + 0.3) });
      legend.set({ k: k(T.legend) });

      // ---- read: the request, the counter and the ring (the ring is drawn by the lines above) ----
      getChip.set({ k: k(T.gchip, 0.3), x: SLIDE * grow, o: 1 - ramp(t, T.x2 - 0.1, T.x2 + 0.15, E.lin) });
      SCANS.forEach((s, si) => {
        const steps = t < s.t0 ? 0 : Math.min(s.n, Math.floor((t - s.t0) / s.d) + 1);
        const bump = Math.min(
          1,
          Array.from({ length: s.n }, (_, i) => flash(t, s.t0 + i * s.d, s.t0 + i * s.d + Math.max(0.15, s.d))).reduce(
            (a, b) => a + b,
            0,
          ),
        );
        setStat(rstats[si], {
          text: stepsText(steps),
          k: k(si === 0 ? T.rstat : T.rstat2),
          x: si === 0 ? (STAT_X[1] - STAT_X[0]) * grow : 0,
          bump,
        });
      });

      // ---- twice the data, twice the scan, so the cost grows with n ----
      twice.set({ k: k(T.x2, 0.3) });
      oTag.set({ k: k(T.ot, 0.3) });
      nTag.set({ k: k(T.ot + 0.12, 0.3) });
      idxTag.set({ k: k(T.idx, 0.35) });
    };
  }

  V.scene({
    kicker: "THE COST",
    title: ["Appending is cheap,", "finding means scanning"],
    dur: 11,
    caps: [
      [0.9, 3.3, "A write is one append: one step."],
      [3.6, 6.1, "A read scans every line."],
      [7.05, 9.3, "Twice the data, twice the scan."],
      [9.5, 10.9, "We need an index."],
    ],
    build,
  });
})();

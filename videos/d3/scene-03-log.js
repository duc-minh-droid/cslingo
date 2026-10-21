/* Lecture 3 (ds-3) · scene 3 (THE LOG): the simplest database is a file you only add to (lesson 3.1 "A very simple database", bike-share).
   A log file is a list of lines, each "key value". set adds a line at the END (the dashed "next line" slot steps down), get scans
   from the top and the LAST line of the key wins, delete adds a TOMBSTONE line (a delete marker: nothing is erased). Requests are blue
   chips (the same role as the "write" packets of scene 2); the lines, the ring that reads them, the answers and the tombstone all
   come from D3.LOG (asserted below and when the page loads).
   Story (local seconds): 0.0 the file panel pops, 0.3 the "key" / "value" column heads, 0.45 the dashed "next line" slot, 0.9 the
   orange "append" tag and arrow (they stay beside the slot while lines are added and rest while the file is only read), 1.3 the
   grey note "newest line at the bottom" under the file (it makes "the last line" mean something; the legend below replaces it);
   SET: the chips "set bike 1", "set dock 2", "set bike 3" pop at 1.9, 2.8 and 3.7, slide into the slot and become its line 0.74 s
   later (the slot fades and returns one row lower); 4.74 the grey "old line stays" tag points at the first bike line; GET bike:
   5.1 the chip, 5.55-6.9 a blue ring reads the lines one after another (0.45 s each; both bike lines turn blue and the chip walks
   down with the ring), 6.9 the LAST bike line turns green, 7.0 "bike = 3", 7.3 "last line wins", 7.9 all of it clears; DELETE:
   7.85 the chip "delete dock" slides into the slot, 8.59 the fourth line pops in red with a cross where the value would be (a
   tombstone), 8.89 the red legend defines the cross; GET dock: 9.65 the chip, 10.1-11.5 the ring reads four lines (0.35 s each),
   11.5 the LAST dock line, the tombstone, turns red, 11.6 "dock: deleted", 11.9 "last line wins"; hold to 13. The scene is data
   driven: every key, value, scan count and winner is read from D3.LOG. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (asserted against the storyboard and the lesson) ----------
  const LOG = D3.LOG;
  const OPS = LOG.steps.map((s) => s.op);
  D3.same(
    "log scene: the six requests",
    OPS.map((o) => o.op),
    ["set", "set", "set", "get", "del", "get"],
  );
  D3.same(
    "log scene: four lines, one per set or delete",
    [LOG.lines.length, LOG.steps.filter((s) => s.cost).length],
    [4, 4],
  );
  D3.same(
    "log scene: the lines",
    LOG.lines.map((r) => `${r.k} ${r.tomb ? "TOMB" : r.v}`),
    ["bike 1", "dock 2", "bike 3", "dock TOMB"],
  );
  D3.same(
    "log scene: get bike reads 3 lines, the last of 2 hits wins",
    [LOG.getBike.scanned, LOG.getBike.hits, LOG.getBike.win],
    [3, [0, 2], 2],
  );
  D3.same("log scene: get bike returns 3", LOG.getBike.value, 3);
  D3.same(
    "log scene: get dock reads 4 lines, the tombstone is the last hit",
    [LOG.getDock.scanned, LOG.getDock.hits, LOG.getDock.win, LOG.getDock.deleted],
    [4, [1, 3], 3, true],
  );
  const cmdText = (o) => (o.op === "set" ? `set ${o.k} ${o.v}` : o.op === "del" ? `delete ${o.k}` : `get ${o.k}`);
  const TOMB = LOG.lines.findIndex((r) => r.tomb);
  const OLD = LOG.getBike.hits[0]; // the older bike line that stays in the file

  // ---------- layout (stage px; the stage is 936 x 640, the margin is 12) ----------
  const PANEL = { x: 324, y: 16, w: 288, h: 516 }; // the file, centred on the stage
  const TILE = { x: PANEL.x + 24, y0: 106, w: 240, h: 72, gap: 12, fs: 40, radius: 18 };
  const PITCH = TILE.h + TILE.gap;
  const rowY = (i) => TILE.y0 + i * PITCH;
  const rowMid = (i) => rowY(i) + TILE.h / 2;
  const KEY_C = TILE.x + 92; // centre of the key text and of the value badge inside a line (a measured fact of the tile layout)
  const VAL_C = TILE.x + 168;
  const RIGHT = 640; // the notes beside the file
  const TAG_H = 62; // a tag's height, used to centre it on a row
  const CHIP = { h: 56, set: 180, del: 210, get: 160, x0: 30, gx: 120 }; // request chips: width by kind, start x, resting x of a get
  const LEGEND_Y = 552;
  const EDGE_L = TILE.x - 10; // where the get pointer ends
  const EDGE_R = TILE.x + TILE.w + 8; // where the notes' arrows start / end (inside the panel, next to the lines)
  D3.same(
    "log scene: the panel holds four lines and the next-line slot, and the legend clears its lip",
    [PANEL.y + PANEL.h >= rowY(LOG.lines.length) + TILE.h + 12, LEGEND_Y >= PANEL.y + PANEL.h + 6 + 8],
    [true, true],
  );
  D3.same("log scene: the legend row stays inside the stage", LEGEND_Y + TAG_H + 8 <= 640 - 12, true);

  // ---------- timeline ----------
  const WRITES = [0, 1, 2, 4]; // the steps that add a line (the three sets and the delete)
  D3.same(
    "log scene: the writes make lines 1 to 4 in order",
    WRITES.map((si) => LOG.steps[si].line),
    [0, 1, 2, 3],
  );
  const CHIP_AT = [1.9, 2.8, 3.7, 7.85]; // the chip of each pops
  const LAND = CHIP_AT.map((t) => t + 0.74); // its line starts to pop
  const GETS = [
    { step: LOG.getBike, t0: 5.55, d: 0.45, pop: 5.1, clear: 7.9 },
    { step: LOG.getDock, t0: 10.1, d: 0.35, pop: 9.65, clear: 99 },
  ].map((g) => ({
    ...g,
    n: g.step.scanned,
    hits: g.step.hits,
    winLine: g.step.win,
    deleted: !!g.step.deleted,
    winAt: g.t0 + g.step.scanned * g.d, // the ring has read every line
    tone: g.step.deleted ? "red" : "green",
    text: g.step.deleted ? `${g.step.op.k}: deleted` : `${g.step.op.k} = ${g.step.value}`,
  }));
  const T = {
    panel: 0,
    heads: 0.3,
    slot: 0.45,
    append: 0.9,
    note: 1.3, // "newest line at the bottom"
    old: LAND[2] + 0.3, // "old line stays" appears once bike 3 is in
    legend: LAND[3] + 0.3,
  };
  D3.same(
    "log scene: the order of events",
    [
      CHIP_AT[0] > T.append + 0.4,
      LAND[2] + 0.3 < GETS[0].pop,
      GETS[0].winAt + 0.9 <= GETS[0].clear,
      GETS[0].clear - CHIP_AT[3] <= 0.1,
      LAND[3] + 0.3 < GETS[1].pop,
      GETS[1].winAt < 11.7,
    ],
    [true, true, true, true, true, true],
  );

  /** a coloured cross in a white badge, the same sign the tombstone line carries (drawn here to define it in the legend) */
  const crossBadge = (parent, x, y, size) => {
    const el = V.h(
      "div",
      {
        class: "c-red",
        style: {
          ...D3.abs(x, y, size, size),
          boxSizing: "border-box",
          border: "3px solid var(--c-edge)",
          borderRadius: "12px",
          background: "var(--panel)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      V.s(
        "svg",
        { width: 28, height: 28, viewBox: "0 0 28 28", style: { display: "block" } },
        V.s("path", {
          d: "M6 6 L22 22 M22 6 L6 22",
          fill: "none",
          "stroke-width": 5,
          "stroke-linecap": "round",
          style: { stroke: "var(--rose)" },
        }),
      ),
    );
    parent.append(el);
    return el;
  };

  function build(stage) {
    // ---- the file: a panel, two column heads, one sticker per line, and the dashed slot for the next line ----
    const panel = D3.panel(stage, { ...PANEL, tone: "grey", plain: true, title: "log file" });
    const headKey = D3.label(stage, { x: KEY_C - 50, y: 64, w: 100, text: "key" });
    const headVal = D3.label(stage, { x: VAL_C - 50, y: 64, w: 100, text: "value" });
    const lines = D3.recs(stage, {
      x: TILE.x,
      y: TILE.y0,
      w: TILE.w,
      h: TILE.h,
      gap: TILE.gap,
      cols: 1,
      recs: LOG.lines,
      fs: TILE.fs,
      radius: TILE.radius,
    });
    lines.all((i) => (i === TOMB ? { tone: "red", k: 0 } : { k: 0 }));
    const slot = D3.recCell(stage, {
      x: TILE.x,
      y: rowY(0),
      w: TILE.w,
      h: TILE.h,
      fs: 32,
      radius: TILE.radius,
      rec: {},
    });

    // ---- arrows (one layer under the chips): the append arrow, the notes' arrows, the get pointers ----
    const layer = L5.svg(stage);
    const appendArrow = layer.appendChild(
      L5.arrow(RIGHT - 6, rowMid(0), EDGE_R, rowMid(0), "orange", 1, { w: 6, head: 18 }),
    );
    const oldArrow = layer.appendChild(
      L5.arrow(RIGHT - 6, rowMid(OLD), EDGE_R, rowMid(OLD), "grey", 1, { w: 6, head: 18 }),
    );
    const ptrs = GETS.map(() => D3.ptr(layer, { tone: "blue", w: 6, head: 18 }));
    const resArrows = GETS.map((g) =>
      layer.appendChild(
        L5.arrow(EDGE_R, rowMid(g.winLine), RIGHT - 6, rowMid(g.winLine), g.tone, 1, { w: 6, head: 18 }),
      ),
    );

    // ---- notes beside the file ----
    const appendTag = D3.tag(stage, { x: RIGHT, y: rowY(0) + (TILE.h - TAG_H) / 2, text: "append", tone: "orange" });
    const oldTag = D3.tag(stage, {
      x: RIGHT,
      y: rowY(OLD) + (TILE.h - TAG_H) / 2,
      text: "old line stays",
      tone: "grey",
    });
    const results = GETS.map((g) => ({
      tag: D3.tag(stage, {
        x: RIGHT,
        y: rowY(g.winLine) + (TILE.h - TAG_H) / 2,
        text: g.text,
        tone: g.tone,
        solid: true,
      }),
      sub: D3.label(stage, {
        x: RIGHT,
        y: rowY(g.winLine) + (TILE.h + TAG_H) / 2 + 6,
        w: 284,
        text: "last line wins",
        tone: g.tone,
        align: "left",
      }),
    }));

    // ---- under the file: first which end is the newest (so "last line" means something), later what the cross means ----
    const noteText = "newest line at the bottom";
    const noteW = 393; // measured: 351 px of text at 28 px plus the tag's padding and border
    const note = D3.tag(stage, { x: Math.round((936 - noteW) / 2), y: LEGEND_Y, text: noteText, tone: "grey" });

    // ---- the tombstone legend, in the same row: the cross on the line is a delete marker ----
    const legendText = "tombstone: a delete marker";
    const legendW = 52 + 14 + 418; // badge + gap + tag (the tag is about 418 px wide at 28 px)
    const legendX = Math.round((936 - legendW) / 2);
    const legendBadge = crossBadge(stage, legendX, LEGEND_Y + (TAG_H - 52) / 2, 52);
    const legendTag = D3.tag(stage, { x: legendX + 66, y: LEGEND_Y, text: legendText, tone: "red" });

    // ---- the requests: blue chips (set / delete slide into the file, get walks down beside it) ----
    const writeChips = WRITES.map((si, w) => {
      const o = OPS[si];
      const cw = o.op === "del" ? CHIP.del : CHIP.set;
      const row = LOG.steps[si].line;
      const y = rowY(row) + (TILE.h - CHIP.h) / 2;
      const chip = D3.chip(stage, {
        x: CHIP.x0,
        y,
        w: cw,
        h: CHIP.h,
        text: cmdText(o),
        tone: "blue",
        fs: 28,
        radius: 16,
      });
      return { chip, dx: TILE.x + (TILE.w - cw) / 2 - CHIP.x0, w };
    });
    const getChips = GETS.map((g) =>
      D3.chip(stage, {
        x: CHIP.gx,
        y: rowY(0) + (TILE.h - CHIP.h) / 2,
        w: CHIP.get,
        h: CHIP.h,
        text: cmdText(g.step.op),
        tone: "blue",
        fs: 28,
        radius: 16,
      }),
    );

    return (t) => {
      const k = (a, d = 0.35) => ramp(t, a, a + d, E.lin);
      const vis = (a, b, d = 0.35) => Math.min(k(a, d), 1 - ramp(t, b, b + 0.25, E.lin)); // in at a, out at b

      // ---- the file and its dashed slot (the slot steps down one row each time a line lands) ----
      panel.set({ k: k(T.panel, 0.4) });
      headKey.set({ k: k(T.heads) });
      headVal.set({ k: k(T.heads + 0.1) });
      const down = LAND.reduce((s, a) => s + ramp(t, a + 0.1, a + 0.45, E.inOut), 0); // rows the "append" tag and arrow have slid down
      // the slot steps down while it is invisible: it fades as the request chip slides over it and returns one row lower
      const row = LAND.filter((a) => t >= a + 0.1).length;
      const dip = LAND.reduce((s, a) => s + ramp(t, a - 0.35, a - 0.12, E.lin) - ramp(t, a + 0.2, a + 0.45, E.lin), 0);
      slot.set({ ghost: true, text: "next line", k: k(T.slot, 0.4), y: row * PITCH, o: 1 - dip });
      lines.all((i) => {
        const st = { tone: i === TOMB ? "red" : "grey", solid: false, k: k(LAND[i], 0.3) };
        GETS.forEach((g) => {
          if (t < g.t0 || t >= g.clear + 0.15 || i >= g.n) return; // this get has not started, is cleared, or the line did not exist yet
          const at = g.t0 + i * g.d; // the ring reaches line i
          if (t >= at && g.hits.includes(i)) st.tone = "blue"; // a line of the key we asked for
          if (t >= at && t < at + g.d) Object.assign(st, { ring: "blue", ringK: ramp(t, at, at + 0.12, E.lin) });
          if (i === g.winLine && t >= g.winAt) {
            Object.assign(st, { tone: g.tone, solid: true, s: 1 + 0.08 * flash(t, g.winAt, g.winAt + 0.35) }); // the last line of the key wins
          }
        });
        return st;
      });

      // ---- "append": beside the slot while lines are added, resting while the file is only read ----
      const ak = Math.max(vis(T.append, GETS[0].pop - 0.1), vis(CHIP_AT[3] + 0.45, GETS[1].pop - 0.05));
      const bob =
        6 * Math.sin((2 * Math.PI * Math.max(0, t - 1.3)) / 0.9) * ramp(t, 1.3, 1.5, E.lin) * (t < CHIP_AT[0] ? 1 : 0);
      appendTag.set({ k: ak, y: down * PITCH });
      V.place(appendArrow, { x: bob, y: down * PITCH, o: ak >= 1 ? 1 : ak });
      L5.drawOn(appendArrow, ramp(t, T.append + 0.1, T.append + 0.4, E.out));

      // ---- the older bike line is still there ----
      const ok = vis(T.old, GETS[0].clear, 0.35);
      oldTag.set({ k: ok });
      V.show(oldArrow, ok > 0 ? 1 : 0);
      L5.drawOn(oldArrow, ramp(t, T.old, T.old + 0.3, E.out) * (ok > 0 ? 1 : 0));

      // ---- the requests that add a line: pop, wait a beat, slide into the slot, fade into the line ----
      writeChips.forEach(({ chip, dx, w }) => {
        const s0 = CHIP_AT[w];
        chip.set({
          k: k(s0, 0.3),
          x: dx * ramp(t, s0 + 0.4, s0 + 0.8, E.inOut),
          o: 1 - ramp(t, s0 + 0.66, s0 + 0.8, E.lin),
        });
      });

      // ---- the reads: the chip and its pointer hop down beside the ring, then the answer comes out ----
      GETS.forEach((g, gi) => {
        const out = 1 - ramp(t, g.clear, g.clear + 0.3, E.lin);
        let hop = 0; // rows the chip has moved down
        for (let j = 1; j < g.n; j++) hop += ramp(t, g.t0 + j * g.d - 0.12, g.t0 + j * g.d + 0.06, E.inOut);
        const y = rowMid(0) + hop * PITCH;
        getChips[gi].set({ k: k(g.pop, 0.3), y: hop * PITCH, o: out });
        ptrs[gi].set({
          x1: CHIP.gx + CHIP.get + 6,
          y1: y,
          x2: EDGE_L,
          y2: y,
          k: ramp(t, g.pop + 0.3, g.pop + 0.45, E.lin),
          o: out,
        });
        const rk = vis(g.winAt + 0.1, g.clear, 0.35);
        results[gi].tag.set({ k: rk });
        results[gi].sub.set({ k: Math.min(k(g.winAt + 0.4, 0.3), out) });
        V.show(resArrows[gi], rk > 0 ? 1 : 0);
        L5.drawOn(resArrows[gi], ramp(t, g.winAt, g.winAt + 0.25, E.out) * (rk > 0 ? 1 : 0));
      });

      // ---- the note under the file hands over to the tombstone legend ----
      note.set({ k: vis(T.note, T.legend - 0.45, 0.35) });

      // ---- what the cross means ----
      V.place(legendBadge, D3.pop(k(T.legend, 0.35)));
      legendTag.set({ k: k(T.legend + 0.1, 0.35) });
    };
  }

  V.scene({
    kicker: "THE LOG",
    title: ["The simplest database", "is a file you append to"],
    dur: 13,
    caps: [
      [0.5, 2.9, "A log is a file you only add to."],
      [3.1, 5.3, "Set adds a line at the end."],
      [5.6, 8.1, "Get scans for the last line of a key."],
      [8.5, 10.7, "Delete adds a tombstone line."],
      [10.9, 12.8, "The newest line says: deleted."],
    ],
    build,
  });
})();

/* Lecture 3 (ds-3) · scene 5 (HASH INDEX): a map in memory jumps straight to a key (lesson 3.2 "The hash index", cat-video play counts).
   The log file is on the right: nine lines "key value", each with its BYTE OFFSET (where the line starts in the file) in orange in
   the gutter (an orange card defines the word). The hash index is a map IN MEMORY (purple, "in memory") on the left: every key
   points at the byte offset of its LATEST line (purr 32, yawn 45, mew 52, sorted by offset so the three orange pointers never
   cross). A get looks the key up (blue chip "get mew", a blue ring on its entry) and the request jumps along the pointer to
   that line: ONE disk read (a scan would read all nine lines). A write appends a line (purr 3 at byte 58) and moves purr's
   entry from 32 to 58, so the next get purr jumps to the new line. Every line, offset, map entry and count comes from D3.HASH /
   D3.runLog (asserted below and when the page loads). Colours: grey = the file, purple = memory, orange = offsets, pointers and
   the read counter, blue = the request, green = found / newly written.
   Story (local seconds): 0.0 the file panel pops, 0.1-0.7 nine lines pop with their offsets, 0.55 the orange card "byte offset:
   where a line starts", 1.3 the purple tag "hash index" and the panel "in memory" with its two column heads, 1.6-2.0 the three
   entries pop, 2.2-3.3 the three orange pointers draw on, one after another; GET mew: 4.3 the blue chip, 4.45 the entry rings
   blue, 4.5 the card gives way to the orange counter "disk reads 0", 5.15-5.7 a blue arrow jumps along mew's pointer, 5.7 line 8
   turns green and the counter reads 1, 5.95 "mew = 5", 6.35 the orange tag "a scan reads 9 lines"; the request clears at 7.7;
   WRITE: 7.75 the dashed "next line" slot, 7.9 the chip "set purr 3" pops, 8.35-8.75 it slides into the slot and fades, 8.95 the line
   "purr 3" pops green with its offset 58, 9.1 the scan tag now says 10, 9.35 the other two pointers fade, 9.5 purr's number
   changes 32 to 58, 9.85-10.55 purr's pointer slides down to the new line; GET purr: 10.8 chip, 10.95 ring, counter 0, 11.5-12.05
   the blue arrow jumps to line 9, which turns green, counter 1, 12.3 "purr = 3"; hold to the end (13.4 s: longer than the
   storyboard's 12 s, to give the byte-offset card, each state and the closing get purr time to be read). */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;

  // ---------- the data (run through the real log and the real map, asserted against the storyboard and the lesson) ----------
  const H = D3.HASH;
  const ALL = [...H.recs, H.write.rec]; // the nine lines on disk, then the newly appended tenth
  const N0 = H.recs.length;
  const NEW = ALL.length - 1; // index of the appended line
  const OFFS = D3.offsets(ALL);
  D3.same("hash scene: nine lines, then one append", [N0, ALL.length, NEW], [9, 10, 9]);
  D3.same("hash scene: the byte offset of every line", OFFS, [...H.offs, H.write.off]);
  const MAP1 = D3.hashIndex(H.recs); // the map after nine appends
  const MAP2 = D3.hashIndex(ALL); // the map after the tenth
  D3.same("hash scene: the map after nine appends", MAP1, H.map);
  const KEYS = Object.keys(MAP1).sort((a, b) => MAP1[a].off - MAP1[b].off); // by offset: the pointers never cross
  D3.same("hash scene: three keys, ordered by offset", KEYS, ["purr", "yawn", "mew"]);
  D3.same(
    "hash scene: every entry holds the offset of its latest line",
    KEYS.map((k) => [OFFS[MAP1[k].i], ALL[MAP1[k].i].k]),
    KEYS.map((k) => [MAP1[k].off, k]),
  );
  D3.same(
    "hash scene: the append moves one entry, purr, to the new line",
    KEYS.filter((k) => MAP1[k].off !== MAP2[k].off).map((k) => [k, MAP2[k].i, MAP2[k].off]),
    [["purr", NEW, H.write.off]],
  );
  /** the lines a get reads when it has to scan: every line (the real log, as in scene 4) */
  const scanned = (list, key) =>
    D3.runLog([...list.map((r) => ({ op: "set", k: r.k, v: r.v })), { op: "get", k: key }]).steps.pop().scanned;
  const SCAN = [scanned(H.recs, H.get.k), scanned(ALL, H.get2.k)];
  D3.same("hash scene: a scan reads every line, the index reads one", [SCAN[0], H.get.scan, H.get.reads], [9, 9, 1]);
  D3.same("hash scene: after the append a scan reads ten lines", SCAN[1], 10);
  D3.same(
    "hash scene: the two gets",
    [
      H.get.k,
      MAP1[H.get.k].i,
      H.get.off,
      H.get.value,
      H.get2.k,
      MAP2[H.get2.k].i,
      H.get2.off,
      H.get2.value,
      H.get2.reads,
    ],
    ["mew", 8, 52, 5, "purr", NEW, 58, 3, 1],
  );
  const LINE_OF = (k, after) => (after ? MAP2 : MAP1)[k].i;
  const ENT = Object.fromEntries(KEYS.map((k, i) => [k, i]));
  const PURR = ENT.purr;

  // ---------- layout (stage px; the stage is 936 x 640, the margin is 12) ----------
  const FILE = { x: 580, y: 14, w: 340, h: 602 };
  const LIST = { x: FILE.x + 20, y: FILE.y + 56, w: 150, h: 48, gap: 6, gutter: 150 };
  const TIP_X = LIST.x + LIST.gutter - 14 - 44; // pointers end just left of the offset numbers
  const MEM = { x: 20, y: 82, w: 340, h: 296 };
  const EN = { x: MEM.x + 29, y: 184, keyW: 130, arrowW: 56, valW: 96, h: 52, gap: 12 };
  const TAGROW = { y: 14 }; // the purple "hash index" tag and the request chip
  const CHIP = { x: 214, y: 17, w: 146, h: 52 };
  const SLOT = { y: 396 }; // the left column below the map: the card, then the counter
  const RES_Y = 490;
  const SCAN_Y = 560;
  D3.same(
    "hash scene: the file fits the stage and the map fits its panel",
    [
      FILE.x + FILE.w <= 920,
      LIST.y + (NEW + 1) * (LIST.h + LIST.gap) - LIST.gap + 12 <= FILE.y + FILE.h,
      FILE.y + FILE.h + 6 <= 628,
      EN.y + 3 * EN.h + 2 * EN.gap + 14 <= MEM.y + MEM.h,
      EN.x + EN.keyW + EN.arrowW + EN.valW + 29 <= MEM.x + MEM.w,
      SCAN_Y + 58 + 6 <= 628,
      CHIP.x + CHIP.w <= MEM.x + MEM.w,
      MEM.x + D3.tagW("hash index") + 12 <= CHIP.x,
      Math.min(FILE.y, TAGROW.y, CHIP.y, MEM.y) >= 14, // a pop-in overshoots a little: keep clear of the 12 px margin
      SCAN_Y + 58 + 6 + 3 <= 628, // the scan tag's lip and its bump
      MEM.x >= 18 && SLOT.y + 100 + 6 < SCAN_Y,
    ],
    Array(11).fill(true),
  );
  const lineMid = (i) => ({ x: TIP_X, y: LIST.y + i * (LIST.h + LIST.gap) + LIST.h / 2 });
  const SET = { w: 176, h: 52 };
  const SET_FROM = 372;
  const SET_TO = LIST.x + LIST.gutter + (LIST.w - SET.w) / 2;
  const SET_Y = LIST.y + NEW * (LIST.h + LIST.gap) + (LIST.h - SET.h) / 2;

  // ---------- timeline ----------
  const T = {
    lines: 0.1, // line i pops at 0.1 + 0.07 i
    card: 0.55,
    hash: 1.3,
    ents: 1.6, // entry i pops at 1.6 + 0.12 i
    ptr: 2.2, // pointer i draws at 2.2 + 0.35 i
    slot: 7.75,
    chip: 7.9,
    slide: 8.35,
    land: 8.95,
    scan: 9.1,
    dim: 9.35,
    upd: 9.5,
    move: 9.85,
  };
  const GETS = [
    { ...H.get, chip: 4.3, ring: 4.45, stat: 4.5, jump: 5.15, land: 5.7, res: 5.95, clear: 7.7, after: false },
    { ...H.get2, chip: 10.8, ring: 10.95, stat: 11.0, jump: 11.5, land: 12.05, res: 12.3, clear: 99, after: true },
  ].map((g) => ({ ...g, ent: ENT[g.k], line: LINE_OF(g.k, g.after), text: `${g.k} = ${g.value}` }));
  const DUR = 13.4;
  D3.same(
    "hash scene: the order of events",
    [
      T.ptr + 0.35 * 2 + 0.5 < GETS[0].chip,
      GETS[0].land < GETS[0].res && GETS[0].res < GETS[0].clear,
      GETS[0].clear <= T.slot,
      T.slot < T.chip && T.chip + 0.3 <= T.slide && T.slide + 0.6 <= T.land,
      T.land < T.upd && T.upd < T.move,
      T.move + 0.7 < GETS[1].chip,
      GETS[1].land < GETS[1].res && GETS[1].res + 1 <= DUR,
    ],
    Array(7).fill(true),
  );

  function build(stage) {
    // ---- the file (right): a panel, two column heads, ten line stickers (the tenth appears with the write) ----
    const filePanel = D3.panel(stage, { ...FILE, tone: "grey", plain: true, title: "" });
    const headOff = D3.label(stage, {
      x: LIST.x + LIST.gutter - 14 - 176,
      y: FILE.y + 12,
      w: 176,
      text: "byte offset",
      tone: "orange",
      align: "right",
    });
    const headFile = D3.label(stage, { x: LIST.x + LIST.gutter, y: FILE.y + 12, w: LIST.w, text: "log file" });
    const list = D3.recs(stage, {
      x: LIST.x,
      y: LIST.y,
      w: LIST.w,
      h: LIST.h,
      gap: LIST.gap,
      cols: 1,
      gutter: LIST.gutter,
      recs: ALL,
      marks: OFFS.map(String),
      fs: 28,
      radius: 16,
    });
    const slot = D3.recCell(list.el, {
      x: LIST.gutter,
      y: NEW * (LIST.h + LIST.gap),
      w: LIST.w,
      h: LIST.h,
      fs: 28,
      radius: 16,
      rec: {},
    });

    // ---- the hash index (left): its name, the memory panel, two column heads and one entry per key ----
    const tagHash = D3.tag(stage, { x: MEM.x, y: TAGROW.y, text: "hash index", tone: "purple", solid: true });
    const memPanel = D3.panel(stage, { ...MEM, tone: "purple", plain: true, title: "in memory" });
    const headKey = D3.label(stage, { x: EN.x, y: EN.y - 38, w: EN.keyW, text: "key" });
    const headVal = D3.label(stage, {
      x: EN.x + EN.keyW,
      y: EN.y - 38,
      w: EN.arrowW + EN.valW,
      text: "byte offset",
      tone: "orange",
    });
    const ents = D3.entries(stage, {
      x: EN.x,
      y: EN.y,
      rows: KEYS.map((k) => ({ key: k, val: MAP1[k].off })),
      keyW: EN.keyW,
      arrowW: EN.arrowW,
      valW: EN.valW,
      h: EN.h,
      gap: EN.gap,
    });

    // ---- the left column below the map: the definition card, which gives way to the counter and the answers ----
    const card = D3.card(stage, {
      x: MEM.x,
      y: SLOT.y,
      w: MEM.w,
      h: 100,
      text: "byte offset:\nwhere a line starts",
      tone: "orange",
      plain: false,
    });
    card.el.style.whiteSpace = "pre-line"; // the text breaks where it says
    const stat = D3.stat(stage, { x: MEM.x + 4, y: SLOT.y, w: MEM.w - 8, h: 80, label: "disk reads", tone: "orange" });
    const answers = GETS.map((g) => D3.tag(stage, { x: MEM.x, y: RES_Y, text: g.text, tone: "green", solid: true }));
    const scanTag = D3.tag(stage, { x: MEM.x, y: SCAN_Y, text: `a scan reads ${SCAN[0]} lines`, tone: "orange" });

    // ---- the pointers (one layer over the panels): an orange pointer per entry, a blue jump per get ----
    const layer = L5.svg(stage);
    const ptrs = KEYS.map(() => D3.ptr(layer, { tone: "orange", w: 6, head: 20 }));
    const jumps = GETS.map(() => D3.ptr(layer, { tone: "blue", w: 9, head: 26 }));

    // ---- the requests: "get ..." chips beside the map's name, "set purr 3" slides into the file ----
    const getChips = GETS.map((g) =>
      D3.chip(stage, {
        x: CHIP.x,
        y: CHIP.y,
        w: CHIP.w,
        h: CHIP.h,
        text: `get ${g.k}`,
        tone: "blue",
        fs: 28,
        radius: 16,
      }),
    );
    const setChip = D3.chip(stage, {
      x: SET_FROM,
      y: SET_Y,
      w: SET.w,
      h: SET.h,
      text: `set ${H.write.rec.k} ${H.write.rec.v}`,
      tone: "blue",
      fs: 28,
      radius: 16,
    });

    return (t) => {
      const k = (a, d = 0.35) => ramp(t, a, a + d, E.lin);
      const vis = (a, b, d = 0.35) => Math.min(k(a, d), 1 - ramp(t, b, b + 0.25, E.lin)); // in at a, out at b

      // ---- the file ----
      filePanel.set({ k: k(0, 0.4) });
      headOff.set({ k: k(0.2, 0.3), bold: true });
      headFile.set({ k: k(0.3, 0.3), bold: true });
      list.all((i) => {
        const st = {
          tone: "grey",
          k: i < N0 ? D3.seq(t, T.lines, 0.07, 0.3, i) : ramp(t, T.land, T.land + 0.3, E.lin),
        };
        if (i === NEW && t >= T.land && t < T.land + 0.8) Object.assign(st, { tone: "green", solid: t < T.land + 0.6 }); // just written
        GETS.forEach((g) => {
          if (i !== g.line || t < g.land || t >= g.clear + 0.2) return;
          const out = ramp(t, g.clear, g.clear + 0.2, E.lin);
          if (out < 0.5)
            Object.assign(st, { tone: "green", solid: true, s: 1 + 0.08 * flash(t, g.land, g.land + 0.35) }); // found: one read
        });
        return st;
      });
      slot.set({
        ghost: true,
        text: "next line",
        k: k(T.slot, 0.3),
        o: 1 - ramp(t, T.land - 0.12, T.land + 0.1, E.lin),
      });

      // ---- the hash index ----
      tagHash.set({ k: k(T.hash, 0.35) });
      memPanel.set({ k: k(T.hash, 0.4) });
      headKey.set({ k: k(T.hash + 0.2, 0.3), bold: true });
      headVal.set({ k: k(T.hash + 0.3, 0.3), bold: true });
      const upd = k(T.upd + 0.15, 0.01); // purr's number has changed
      ents.all((e) => {
        const st = { k: D3.seq(t, T.ents, 0.12, 0.35, e) };
        GETS.forEach((g) => {
          if (e !== g.ent) return;
          const rk = vis(g.ring, g.clear, 0.25);
          if (rk > 0) Object.assign(st, { ring: "blue", ringK: rk, valRing: "blue", valRingK: rk });
        });
        if (e === PURR) {
          st.val = String(upd >= 1 ? MAP2.purr.off : MAP1.purr.off);
          st.bump = flash(t, T.upd, T.upd + 0.4);
          const ak = vis(T.upd, T.move + 0.7, 0.25);
          if (ak > 0 && !(st.ring && t >= GETS[1].ring - 0.05)) Object.assign(st, { valRing: "orange", valRingK: ak });
        }
        return st;
      });

      // ---- the pointers: key -> the line holding its latest value ----
      const fade = 1 - 0.75 * ramp(t, T.dim, T.dim + 0.3, E.lin); // the entries the write did not touch step back
      KEYS.forEach((key, e) => {
        const from = ents.valRight(e);
        const slide = e === PURR ? ramp(t, T.move, T.move + 0.7, E.inOut) : 0;
        const y2 = lerp(lineMid(LINE_OF(key, false)).y, lineMid(LINE_OF(key, true)).y, slide);
        ptrs[e].set({
          x1: from.x + 8,
          y1: from.y,
          x2: TIP_X,
          y2,
          k: D3.seq(t, T.ptr, 0.35, 0.5, e),
          o: e === PURR ? 1 : fade,
        });
      });

      // ---- the requests: chip, ring (drawn by the entry above), a blue jump along the pointer, the counter and the answer ----
      GETS.forEach((g, gi) => {
        const from = ents.valRight(g.ent);
        const out = 1 - ramp(t, g.clear, g.clear + 0.25, E.lin);
        getChips[gi].set({ k: k(g.chip, 0.3), o: out });
        jumps[gi].set({
          x1: from.x + 8,
          y1: from.y,
          x2: TIP_X,
          y2: lineMid(g.line).y,
          k: ramp(t, g.jump, g.land - 0.05, E.inOut),
          o: out,
        });
        answers[gi].set({
          k: Math.min(k(g.res), gi === 0 ? 1 - ramp(t, GETS[1].chip, GETS[1].chip + 0.25, E.lin) : 1),
        });
      });
      const [g1, g2] = GETS;
      const reads = t >= g2.land ? g2.reads : t >= g2.stat ? 0 : t >= g1.land ? g1.reads : 0;
      card.set({ k: k(T.card, 0.35), o: 1 - ramp(t, g1.stat - 0.12, g1.stat + 0.1, E.lin) });
      stat.set({
        text: String(reads),
        k: k(g1.stat, 0.3),
        bump:
          0.4 *
          (flash(t, g1.land, g1.land + 0.3) + flash(t, g2.stat, g2.stat + 0.3) + flash(t, g2.land, g2.land + 0.3)),
      });
      scanTag.set({
        text: `a scan reads ${t >= T.scan ? SCAN[1] : SCAN[0]} lines`,
        k: k(g1.res + 0.4, 0.35),
        s: 1 + 0.04 * flash(t, T.scan, T.scan + 0.35),
      });

      // ---- the write: the request slides into the dashed slot and becomes the tenth line ----
      setChip.set({
        k: k(T.chip, 0.3),
        x: (SET_TO - SET_FROM) * ramp(t, T.slide, T.land - 0.2, E.inOut),
        o: 1 - ramp(t, T.land - 0.2, T.land - 0.04, E.lin), // gone before the line pops, so the two texts never overlap
      });
    };
  }

  V.scene({
    kicker: "HASH INDEX",
    title: ["A map in memory", "jumps straight to a key"],
    dur: DUR,
    caps: [
      [1.75, 4.25, "Keep a map in memory: key to byte offset."],
      [4.5, 6.2, "Get mew: look up its offset."],
      [6.25, 7.75, "One jump, one disk read."],
      [8.05, 9.45, "A write appends a line."],
      [9.65, 11.35, "Every write updates the map."],
      [11.4, 13.0, "Get purr: still one jump."],
    ],
    build,
  });
})();

/* Lecture 3 · Storage and retrieval: record lists, map entries and panels (VID.d3, short name D3). Needs l5/common.js, d3/common.js and
   d3/common-2.js loaded first. Positions are the parent's pixels (stage 936 x 640). EVERY CALL IS PURE: call set() every frame from
   update(t) with everything you want to see (an element you do not pass `k`/`o` to is fully visible); nothing is remembered between frames.
   Tones: see the colour roles at the top of common-2.js (grey = on disk, blue = the request, green = good, red = dead, orange = addresses
   and costs, purple = in memory).

   1. A LIST OF RECORDS  (the log file, a segment, a sorted run; every record is a sticker "key [value]")
        const f = D3.recs(parent, {x, y, w: 140, h: 52, gap: 8, colGap: 12, cols: 1, rows, recs, tone: "grey", fs: 28, radius: 16,
                                   gutter: 0, marks, valW});
            recs  = [{k: "mew", v: 3}, {k: "kiwi", tomb: true}, {k: "hand"} (key only), {} (an empty tile), ...] (the records of D3.PLAYS,
                    D3.LOG.lines, D3.MERGE.segs ... fit as they are). A value is drawn as a small white badge after the key; a tombstone
                    draws a red cross in the badge.
            LAYOUT  cols = n: row by row, n records per row (cols: 1 = a vertical list; cols: 2 and 3 rows is a 2 x 3 block);
                    rows = n: column by column, n records per column (12 keys with rows: 4 = three blocks of four, read down then right).
            gutter  px reserved LEFT of the tiles for a line of orange numbers (byte offsets): marks = ["0", "6", ...] (or numbers).
            w       tile width (140 fits "mew 3" and "purr 4"; "apple 13" needs 170; key-only "handsome" 190).
        f.set(i, {tone, solid, ghost, tomb, key, val, text, k, x, y, s, sx, o, ring, ringK, mark, markTone, markO})
            i = record index. tone: grey (default) | blue | green | red | orange | purple; solid = filled in the tone (text in its -on
            shade); ghost = dashed outline (an empty slot, or a record that is used up); tomb: true draws the red cross (default: the
            record's own tomb); key, val override the shown text; text replaces the whole tile text (no badge); k 0..1 pops the tile in
            (0 hides it); x, y = offset from the tile's own slot; s scale; sx horizontal squash (0 = edge on); o opacity; ring = a tone
            name draws a coloured ring just outside (ringK 0..1 pops it in); mark = text of the gutter label (default marks[i]),
            markTone (default "orange"), markO = its own opacity (default o).
        f.all((i) => state | undefined)   set every record from one function
        f.slot(i) -> {x, y} top-left of tile i in PARENT coordinates;  f.mid(i) centre;  f.left(i), f.right(i), f.top(i), f.bottom(i) the
            middle of that edge;  f.gutterMid(i) -> centre of the gutter label.   f.el (the whole list: V.place / V.show it), f.n, f.w, f.h,
            f.width, f.height (the box of all tiles, gutter included), f.x, f.y
   2. MAP ENTRIES  (key -> number rows: the hash map and the sparse index; a purple key sticker, an arrow, an orange number sticker)
        const m = D3.entries(parent, {x, y, rows: [{key: "mew", val: 52}, ...], keyW: 130, valW: 96, h: 52, gap: 10, arrowW: 56,
                                      tone: "purple", valTone: "orange", fs: 28});
        m.set(i, {val, tone, valTone, solid, ring, ringK, valRing, valRingK, k, x, y, s, o, bump: 0..1})
            ring rings the KEY sticker, valRing the NUMBER sticker; bump = a one-off pulse of the number (V.flash(t, a, b));
            val replaces the number (the pointer value changes: 32 -> 58).
        m.all(fn)   m.keyMid(i), m.valMid(i), m.valLeft(i), m.valRight(i), m.keyLeft(i), m.keyRight(i) -> {x, y} in PARENT coordinates
        m.el, m.n, m.width, m.height, m.x, m.y
   3. PANELS  (a sticker box: a zone, a segment file, a disk or memory area; children go on the PARENT, not inside)
        const p = D3.panel(parent, {x, y, w, h, tone: "grey", plain: true, title, fs: 28});   a rounded box with an optional title at its
            top-left corner (28 px, bold, the tone's ink shade); content starts about 56 px below its top.
        p.set({tone, plain, title, k, x, y, s, o, solid})   k 0..1 pops it in;  p.el
        D3.cell(parent, {x, y, w, h, fs, radius, tone}) is the bare sticker these are made of: {wrap, tile, ring, apply(st)}.
        D3.recCell(parent, {x, y, w, h, fs, radius, tone, rec}) is one record sticker on its own (a node of the memtable tree, a packet):
            {wrap, tile, set(st)} where set takes the same state as f.set(i, ...) above (tone, solid, ghost, tomb, key, val, text, k, x, y,
            s, sx, o, ring, ringK); rec = {k, v} | {k, tomb: true} | {k} | {}. */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const { clamp, ease: E } = V;
  const { abs, f1, tn, popOf, fadeOf, setClass, setText, solidStyle } = D3;

  /** The sticker under every record and map entry: wrap (positioned, transformed), ring (coloured outline) and tile (the face). */
  function cell(parent, o = {}) {
    const { x = 0, y = 0, w = 140, h = 52, fs = 28, radius = 16, tone: base = "grey" } = o;
    const wrap = V.h("div", { style: abs(x, y, w, h) });
    const ring = V.h("div", {
      style: {
        ...abs(-8, -8, w + 16, h + 16),
        boxSizing: "border-box",
        border: "5px solid var(--violet)",
        borderRadius: `${radius + 8}px`,
        visibility: "hidden",
      },
    });
    const tile = V.h("div", {
      class: `v-gene c-${tn(base)}`,
      style: {
        ...abs(0, 0, w, h),
        fontSize: `${fs}px`,
        borderRadius: `${radius}px`,
        whiteSpace: "nowrap",
        gap: "10px",
      },
    });
    wrap.append(ring, tile);
    parent.append(wrap);
    const apply = (st = {}) => {
      setClass(tile, `v-gene c-${tn(st.tone || base)}${st.solid ? " solid" : ""}${st.ghost ? " ghost" : ""}`);
      const k = clamp(st.k ?? 1);
      const pop = popOf(st, 0.7, 0.3);
      const op = fadeOf(st);
      wrap.style.opacity = op >= 1 ? "" : String(Math.max(0, op));
      wrap.style.visibility = op <= 0.001 ? "hidden" : "";
      wrap.style.transform = `translate(${f1(st.x || 0)}px, ${f1(st.y || 0)}px) scale(${(pop * (st.sx ?? 1)).toFixed(3)}, ${pop.toFixed(3)})`;
      const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
      if (st.ring && rk > 0.002) {
        ring.style.borderColor = D3.tone(st.ring).c;
        ring.style.visibility = "";
        ring.style.opacity = String(Math.min(1, rk * 3) * (k > 0 ? 1 : 0));
        ring.style.transform = `scale(${(0.85 + 0.15 * E.pop(rk)).toFixed(3)})`;
      } else ring.style.visibility = "hidden";
    };
    return { wrap, tile, ring, apply };
  }
  D3.cell = cell;

  const badgeStyle = {
    padding: "0 10px",
    borderRadius: "10px",
    border: "2px solid var(--c-edge)",
    background: "var(--panel)",
    color: "var(--ink)",
    fontWeight: "800",
    lineHeight: "1.25",
  };
  const crossSvg = () =>
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
    );

  /** One record sticker: key, value badge (or the red tombstone cross), on a cell. */
  function recCell(parent, o = {}) {
    const r = o.rec || {};
    const c = cell(parent, o);
    const key = V.h("span", { text: r.k || "", style: { fontWeight: "900" } });
    const val = V.h("span", { style: badgeStyle });
    const tomb = V.h(
      "span",
      { style: { ...badgeStyle, display: "none", padding: "0 6px", height: "34px" } },
      crossSvg(),
    );
    c.tile.append(key, val, tomb);
    const set = (st = {}) => {
      const isTomb = st.tomb ?? !!r.tomb;
      const valText = st.val ?? (r.v == null ? "" : String(r.v));
      const plain = st.text != null;
      setText(key, plain ? st.text : (st.key ?? r.k ?? ""));
      val.style.display = !plain && !isTomb && valText !== "" ? "" : "none";
      setText(val, valText);
      tomb.style.display = !plain && isTomb ? "" : "none";
      c.apply(st);
    };
    return { wrap: c.wrap, tile: c.tile, set };
  }
  D3.recCell = recCell;

  // ---------- 1. a list of records ----------
  function recs(parent, o = {}) {
    const {
      x = 0,
      y = 0,
      w = 140,
      h = 52,
      gap = 8,
      colGap = 12,
      tone: base = "grey",
      fs = 28,
      radius = 16,
      gutter = 0,
    } = o;
    const list = o.recs || [];
    const n = list.length;
    const cols = o.rows ? Math.ceil(n / o.rows) : o.cols || 1;
    const rows = o.rows || Math.ceil(n / cols);
    const at = (i) => (o.rows ? [Math.floor(i / rows), i % rows] : [i % cols, Math.floor(i / cols)]);
    const slotXY = (i) => {
      const [c, r] = at(i);
      return { x: gutter + c * (w + colGap), y: r * (h + gap) };
    };
    const width = gutter + cols * w + (cols - 1) * colGap;
    const height = rows * h + (rows - 1) * gap;
    const el = V.h("div", { style: abs(x, y, width, height) });
    parent.append(el);
    const items = list.map((r, i) => {
      const s = slotXY(i);
      const rc = recCell(el, { x: s.x, y: s.y, w, h, fs, radius, tone: base, rec: r });
      const mark = V.h("div", {
        class: "v-mono",
        style: {
          ...abs(s.x - gutter, s.y, gutter - 14, h),
          display: gutter ? "flex" : "none",
          alignItems: "center",
          justifyContent: "flex-end",
          fontSize: `${fs}px`,
          visibility: "hidden",
        },
      });
      el.append(mark);
      return { rc, mark };
    });
    const set = (i, st = {}) => {
      const it = items[i];
      it.rc.set(st);
      const mk = st.mark ?? (o.marks ? o.marks[i] : null);
      const mo = Math.min(1, clamp(st.k ?? 1) * 4) * (st.markO ?? st.o ?? 1);
      if (mk != null && gutter) {
        setText(it.mark, mk);
        it.mark.style.color = D3.tone(tn(st.markTone || "orange")).ink;
        it.mark.style.visibility = mo <= 0.001 ? "hidden" : "";
        it.mark.style.opacity = mo >= 1 ? "" : String(mo);
        it.mark.style.transform = `translate(${f1(st.x || 0)}px, ${f1(st.y || 0)}px)`;
      } else it.mark.style.visibility = "hidden";
    };
    const P = (i, fx, fy) => {
      const s = slotXY(i);
      return { x: x + s.x + w * fx, y: y + s.y + h * fy };
    };
    return {
      el,
      n,
      w,
      h,
      width,
      height,
      x,
      y,
      set,
      all: (fn) => list.forEach((_, i) => set(i, fn(i) || {})),
      slot: (i) => P(i, 0, 0),
      mid: (i) => P(i, 0.5, 0.5),
      left: (i) => P(i, 0, 0.5),
      right: (i) => P(i, 1, 0.5),
      top: (i) => P(i, 0.5, 0),
      bottom: (i) => P(i, 0.5, 1),
      gutterMid: (i) => {
        const s = slotXY(i);
        return { x: x + s.x - gutter / 2, y: y + s.y + h / 2 };
      },
    };
  }

  // ---------- 2. map entries ----------
  function entries(parent, o = {}) {
    const { x = 0, y = 0, keyW = 130, valW = 96, h = 52, gap = 10, arrowW = 56, fs = 28 } = o;
    const [tone, valTone] = [o.tone || "purple", o.valTone || "orange"];
    const rows = o.rows || [];
    const n = rows.length;
    const width = keyW + arrowW + valW;
    const height = n * h + (n - 1) * gap;
    const el = V.h("div", { style: abs(x, y, width, height) });
    parent.append(el);
    const items = rows.map((r, i) => {
      const top = i * (h + gap);
      const wrap = V.h("div", { style: abs(0, top, width, h) });
      el.append(wrap);
      const kc = cell(wrap, { x: 0, y: 0, w: keyW, h, fs, tone });
      kc.tile.append(V.h("span", { text: r.key, style: { fontWeight: "900" } }));
      const arrow = V.s(
        "svg",
        {
          width: arrowW,
          height: h,
          viewBox: `0 0 ${arrowW} ${h}`,
          style: { position: "absolute", left: `${keyW}px`, top: "0", overflow: "visible" },
        },
        V.s("path", {
          d: `M 10 ${h / 2} H ${arrowW - 12}`,
          fill: "none",
          "stroke-width": 6,
          "stroke-linecap": "round",
          style: { stroke: D3.tone(tn(tone)).c },
        }),
        V.s("path", {
          d: `M ${arrowW - 8} ${h / 2} L ${arrowW - 22} ${h / 2 - 11} L ${arrowW - 22} ${h / 2 + 11} Z`,
          "stroke-width": 3,
          "stroke-linejoin": "round",
          style: { fill: D3.tone(tn(tone)).c, stroke: D3.tone(tn(tone)).c },
        }),
      );
      wrap.append(arrow);
      const vc = cell(wrap, { x: keyW + arrowW, y: 0, w: valW, h, fs, tone: valTone });
      const val = V.h("span", { text: String(r.val), style: { fontFamily: "var(--mono)", fontWeight: "800" } });
      vc.tile.append(val);
      return { wrap, kc, vc, val, arrow, top };
    });
    const set = (i, st = {}) => {
      const it = items[i];
      const op = fadeOf(st);
      const pop = popOf(st, 0.85, 0.15);
      it.wrap.style.opacity = op >= 1 ? "" : String(Math.max(0, op));
      it.wrap.style.visibility = op <= 0.001 ? "hidden" : "";
      it.wrap.style.transform = `translate(${f1(st.x || 0)}px, ${f1(st.y || 0)}px) scale(${pop.toFixed(3)})`;
      it.kc.apply({ tone: st.tone || tone, solid: st.solid, ring: st.ring, ringK: st.ringK });
      it.vc.apply({
        tone: st.valTone || valTone,
        solid: st.solid,
        ring: st.valRing,
        ringK: st.valRingK,
        s: 1 + 0.12 * (st.bump || 0),
      });
      setText(it.val, st.val ?? rows[i].val);
    };
    const P = (i, fx, fy) => ({ x: x + fx, y: y + items[i].top + h * fy });
    return {
      el,
      n,
      width,
      height,
      x,
      y,
      set,
      all: (fn) => rows.forEach((_, i) => set(i, fn(i) || {})),
      keyMid: (i) => P(i, keyW / 2, 0.5),
      keyLeft: (i) => P(i, 0, 0.5),
      keyRight: (i) => P(i, keyW, 0.5),
      valMid: (i) => P(i, keyW + arrowW + valW / 2, 0.5),
      valLeft: (i) => P(i, keyW + arrowW, 0.5),
      valRight: (i) => P(i, width, 0.5),
    };
  }

  // ---------- 3. panels ----------
  function panel(parent, o = {}) {
    const { x = 0, y = 0, w = 300, h = 200, tone: base = "grey", plain = true, fs = 28 } = o;
    const el = V.h("div", {
      class: `v-card${plain ? " plain" : ""} c-${tn(base)}`,
      style: { ...abs(x, y, w, h), borderRadius: "26px" },
    });
    const title = V.h("div", {
      text: o.title || "",
      style: {
        ...abs(20, 10, w - 40),
        fontSize: `${fs}px`,
        fontWeight: "900",
        whiteSpace: "nowrap",
        color: "var(--c-ink)",
      },
    });
    el.append(title);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card${(st.plain ?? plain) ? " plain" : ""} c-${tn(st.tone || base)}`);
        Object.assign(el.style, solidStyle(!!st.solid));
        setText(title, st.title);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: popOf(st, 0.94, 0.06), o: fadeOf(st) });
      },
    };
  }
  Object.assign(D3, { recs, entries, panel });
})();

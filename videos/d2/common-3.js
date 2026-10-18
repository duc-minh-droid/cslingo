/* Data Science · Lecture 2 (ds-2): the stores every scene draws: a table, a document, the profile page and the grid of dots (VID.d2,
   short name D2). Needs l5/common.js, d2/common.js and d2/common-2.js. Positions are the parent's pixels. EVERY CALL IS PURE: call
   set() each frame from update(t) with everything you want to see; nothing is remembered between frames. All text is 28 px or more.

   1. TABLE  (a sticker with the table's name on top and one strip per row; a cell is a chip)
        const T = D2.table(parent, {x, y, w: 210, name: "users", rows: [[{text: "251", tone: "orange"}, ""], ...], widths: [72], tone: "grey", fs: 28});
          rows: one array per row, one entry per cell: a string (text on a grey chip), "" (an empty chip: a placeholder for data we do
          not name), or {text, tone, solid: false}. widths: px of every cell but the last, which takes the rest of the row (default: the first cell 72).
          Height = T.h = 56 + rows * 46 + 8 (one row: 110, two rows: 156); T.w = w.
        T.set({k: 1, o: 1, x: 0, y: 0, s: 1, tone, hot: [row indices] | row index, hotTone: "blue", hotK: 1, cells: {"0,1": {text, tone, solid}}, rowTone: {0: "green"}})
          k 0..1 pops the table in; x, y offset; hot rings the rows (hotK 0..1 pops the rings); cells overrides single cells; rowTone tints a whole row.
        T.mid() -> {x, y} centre of the table;  T.top() / T.bottom() / T.left() / T.right() -> the middle of an edge;
        T.rowMid(i) -> centre of row i;  T.cellMid(r, c) -> centre of a cell;  T.x, T.y, T.w, T.h (where it was placed).
   2. DOCUMENT  (a sticker that looks like JSON: a braces icon and a title on top, then one line per field)
        const Dc = D2.doc(parent, {x, y, w: 420, title: "chef #251", lines: [{key: "name", n: 1}, {key: "steps", items: ["Mix", "Rest"]}, {key: "mins", text: "20"}], tone: "blue"});
          a line has a key (mono text) and ONE of: n (that many small empty chips: values we do not name), items (chips with text),
          text (plain text after the key).   Height = Dc.h = 64 + lines * 46 + 12.
        Dc.set({k, o, x, y, s, tone, fill: [0..1 per line], fillTone: "blue", hot: [line indices] | line index, hotTone: "orange", hotK: 1, texts: {2: "21"}})
          fill[i] turns the chips of line i solid in fillTone one after another (0 = empty, 1 = all full); hot rings a line;
          texts overrides the text of a line.
        Dc.mid() / top() / bottom() / left() / right() -> {x, y}; Dc.lineMid(i) -> centre of line i (the chips: Dc.chipMid(i, j));
        Dc.x, Dc.y, Dc.w, Dc.h.
   3. PROFILE PAGE  (the thing the app has to show: an avatar, two header lines and six slots that fill up as the data arrives)
        const P = D2.page(parent, {x, y, w: 210, h: 380, slots: 6});
        P.set({k, o, x, y, s, fill: [0..1 per slot], tone: "blue", wait: slot index | -1, waitK})
          fill[i] 0..1 makes slot i solid in the tone (an empty slot is a dashed ghost); wait pulses one empty slot (we are waiting for it).
        P.slotMid(i) -> {x, y};  P.mid();  P.left() / right() / top() / bottom();  P.x, P.y, P.w, P.h.
   4. DOT GRID  (many small records: the 400 profiles; a dot is a rounded square)
        const G = D2.dots(parent, {x, y, cols: 25, rows: 16, size: 18, gap: 6});     width G.w = cols * (size + gap) - gap, G.h likewise
        G.set((i) => undefined | "orange" | {tone, solid, ring, o, s})     i = 0..n-1, row by row; called for every dot every frame (cheap: only
          changed dots are rewritten). ring = a tone name draws a thicker outline in it (the dot that needs attention).
        G.mid(i) -> {x, y} centre of dot i in PARENT coordinates;  G.n, G.cols, G.rows, G.size, G.gap, G.w, G.h, G.x, G.y.
        Use  D2.rowCol(i)  (common.js) for the dot's row and column. */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { f1, abs, flex, setText, setClass, tn } = D2.u;
  const asArr = (v) => (v == null || v < 0 ? [] : Array.isArray(v) ? v : [v]);
  const head = (st) => ({ x: st.x || 0, y: st.y || 0, k: clamp(st.k ?? 1), o: st.o ?? 1, s: st.s ?? 1 });
  const placeBox = (el, h) =>
    V.place(el, { x: h.x, y: h.y, s: h.s * (0.85 + 0.15 * E.pop(h.k)), o: Math.min(1, h.k * 4) * h.o });
  const ring = (w, h, r, x, y) =>
    V.h("div", {
      class: "c-blue",
      style: {
        ...abs(x, y, w, h),
        boxSizing: "border-box",
        border: "5px solid var(--c)",
        borderRadius: `${r}px`,
        visibility: "hidden",
      },
    });
  const setRing = (el, on, tone, k) => {
    el.style.visibility = on && k > 0.002 ? "" : "hidden";
    if (!on) return;
    setClass(el, `c-${tn(tone)}`);
    el.style.opacity = String(Math.min(1, k * 3));
    el.style.transform = `scale(${(0.94 + 0.06 * E.pop(k)).toFixed(3)})`;
  };
  const chipStyle = (w, h) => ({
    ...abs(0, 0, w, h),
    boxSizing: "border-box",
    border: "3px solid var(--c-edge)",
    borderRadius: "10px",
    background: "var(--c-dim)",
  });
  const paintChip = (el, tone, solid, text) => {
    setClass(el, `c-${tn(tone)}`);
    el.style.background = solid ? "var(--c)" : "var(--c-dim)";
    el.style.borderColor = solid ? "var(--c-lip)" : "var(--c-edge)";
    el.style.color = solid ? "var(--c-on)" : "var(--c-ink)";
    if (text != null) setText(el, text);
  };

  // ---------- 1. table ----------
  const CH = 40; // chip height
  const PITCH = 46;
  function table(parent, o = {}) {
    const { x = 0, y = 0, w = 210, name = "", rows = [], tone: base = "grey", fs = 28 } = o;
    const widths = o.widths || [72];
    const h = 56 + rows.length * PITCH + 8;
    const el = V.h("div", { class: `v-card plain c-${tn(base)}`, style: { ...abs(x, y, w, h), borderRadius: "22px" } });
    const title = V.h("div", {
      text: name,
      style: {
        ...abs(14, 8, w - 28, 40),
        ...flex,
        justifyContent: "flex-start",
        fontSize: `${fs}px`,
        fontWeight: "900",
        color: "var(--c-ink)",
      },
    });
    el.append(title);
    const cellW = (c, n) =>
      c < n - 1
        ? (widths[c] ?? widths[widths.length - 1])
        : w - 28 - widths.slice(0, n - 1).reduce((a, b) => a + b + 8, 0);
    const cells = rows.map((row, r) =>
      row.map((spec, c) => {
        const s = typeof spec === "string" ? { text: spec } : spec;
        const left = 14 + row.slice(0, c).reduce((a, _, j) => a + cellW(j, row.length) + 8, 0);
        const chip = V.h("div", {
          style: {
            ...chipStyle(cellW(c, row.length), CH),
            ...flex,
            left: `${left}px`,
            top: `${56 + r * PITCH}px`,
            fontSize: `${fs}px`,
            fontWeight: "800",
            whiteSpace: "nowrap",
          },
        });
        el.append(chip);
        return { chip, text: s.text || "", tone: s.tone || "grey", solid: !!s.solid, left, w: cellW(c, row.length) };
      }),
    );
    const rings = rows.map((_, r) => {
      const g = ring(w + 4, PITCH, 18, -2, 52 + r * PITCH);
      el.append(g);
      return g;
    });
    parent.append(el);
    const [cx, cy] = [x + w / 2, y + h / 2];
    return {
      el,
      x,
      y,
      w,
      h,
      mid: () => ({ x: cx, y: cy }),
      top: () => ({ x: cx, y }),
      bottom: () => ({ x: cx, y: y + h }),
      left: () => ({ x, y: cy }),
      right: () => ({ x: x + w, y: cy }),
      rowMid: (i) => ({ x: cx, y: y + 56 + i * PITCH + CH / 2 }),
      cellMid: (r, c) => ({ x: x + cells[r][c].left + cells[r][c].w / 2, y: y + 56 + r * PITCH + CH / 2 }),
      set(st = {}) {
        const hd = head(st);
        setClass(el, `v-card plain c-${tn(st.tone || base)}`);
        const hot = asArr(st.hot);
        cells.forEach((row, r) =>
          row.forEach((cell, c) => {
            const ov = (st.cells && st.cells[`${r},${c}`]) || {};
            const tone = ov.tone || (st.rowTone && st.rowTone[r]) || cell.tone;
            paintChip(cell.chip, tone, ov.solid ?? cell.solid, ov.text ?? cell.text);
          }),
        );
        rings.forEach((g, r) => setRing(g, hot.includes(r), st.hotTone || "blue", clamp(st.hotK ?? 1)));
        placeBox(el, hd);
      },
    };
  }

  // ---------- 2. document ----------
  const LINE = 46;
  const KEYW = 17; // px per character of the 28 px mono font
  function doc(parent, o = {}) {
    const { x = 0, y = 0, w = 420, title = "", lines = [], tone: base = "blue" } = o;
    const h = 64 + lines.length * LINE + 12;
    const el = V.h("div", { class: `v-card plain c-${tn(base)}`, style: { ...abs(x, y, w, h), borderRadius: "22px" } });
    const svg = L5.svg(el, w, 60);
    svg.style.top = "0";
    svg.appendChild(D2.icon.braces(36, 32, 40, base));
    const ttl = V.h("div", {
      text: title,
      style: {
        ...abs(66, 6, w - 80, 52),
        ...flex,
        justifyContent: "flex-start",
        fontSize: "28px",
        fontWeight: "700",
        fontFamily: "var(--mono)",
        color: "var(--c-ink)",
      },
    });
    el.append(ttl);
    const keyW = Math.max(0, ...lines.map((l) => l.key.length)) * KEYW + 34;
    const rows = lines.map((l, i) => {
      const top = 64 + i * LINE;
      const key = V.h("div", {
        text: `${l.key}:`,
        style: {
          ...abs(18, top, keyW, 40),
          ...flex,
          justifyContent: "flex-start",
          fontSize: "28px",
          fontWeight: "700",
          fontFamily: "var(--mono)",
          color: "var(--text-dim)",
        },
      });
      el.append(key);
      const items = l.items
        ? l.items.map((t) => ({ text: t, w: t.length * KEYW + 26 }))
        : l.n
          ? Array.from({ length: l.n }, () => ({ text: "", w: 56 }))
          : [];
      let left = 18 + keyW;
      const chips = items.map((it) => {
        const chip = V.h("div", {
          style: {
            ...chipStyle(it.w, 34),
            ...flex,
            left: `${left}px`,
            top: `${top + 3}px`,
            fontSize: "28px",
            fontWeight: "800",
            fontFamily: "var(--mono)",
          },
        });
        left += it.w + 10;
        el.append(chip);
        return { chip, text: it.text, w: it.w, left: left - it.w - 10 };
      });
      const txt =
        l.text != null
          ? V.h("div", {
              text: l.text,
              style: {
                ...abs(18 + keyW, top, w - keyW - 36, 40),
                ...flex,
                justifyContent: "flex-start",
                fontSize: "28px",
                fontWeight: "700",
                fontFamily: "var(--mono)",
                color: "var(--ink)",
              },
            })
          : null;
      if (txt) el.append(txt);
      return { key, chips, txt, top };
    });
    const rings = lines.map((_, i) => {
      const g = ring(w - 20, LINE, 16, 10, 62 + i * LINE);
      el.append(g);
      return g;
    });
    parent.append(el);
    const [cx, cy] = [x + w / 2, y + h / 2];
    return {
      el,
      x,
      y,
      w,
      h,
      mid: () => ({ x: cx, y: cy }),
      top: () => ({ x: cx, y }),
      bottom: () => ({ x: cx, y: y + h }),
      left: () => ({ x, y: cy }),
      right: () => ({ x: x + w, y: cy }),
      lineMid: (i) => ({ x: cx, y: y + rows[i].top + 20 }),
      chipMid: (i, j) => ({ x: x + rows[i].chips[j].left + rows[i].chips[j].w / 2, y: y + rows[i].top + 20 }),
      set(st = {}) {
        const hd = head(st);
        setClass(el, `v-card plain c-${tn(st.tone || base)}`);
        const hot = asArr(st.hot);
        rows.forEach((r, i) => {
          const f = clamp(st.fill ? (st.fill[i] ?? 0) : 0);
          r.chips.forEach((c, j) => {
            const on = clamp(f * r.chips.length - j) >= 0.5;
            paintChip(c.chip, on ? st.fillTone || "blue" : "grey", on, c.text);
          });
          if (r.txt) setText(r.txt, st.texts && st.texts[i] != null ? st.texts[i] : lines[i].text);
          setRing(rings[i], hot.includes(i), st.hotTone || "orange", clamp(st.hotK ?? 1));
        });
        placeBox(el, hd);
      },
    };
  }

  // ---------- 3. profile page ----------
  function page(parent, o = {}) {
    const { x = 0, y = 0, w = 210, h = 380, slots = 6 } = o;
    const el = V.h("div", { class: "v-card plain c-blue", style: { ...abs(x, y, w, h), borderRadius: "24px" } });
    const svg = L5.svg(el, w, h);
    svg.appendChild(
      V.s("circle", {
        cx: 52,
        cy: 56,
        r: 34,
        style: { fill: "var(--blue-dim)", stroke: "var(--blue-edge)" },
        "stroke-width": 3,
      }),
    );
    svg.appendChild(D2.icon.person(52, 56, 52, "blue"));
    [
      [104, 44, 82],
      [104, 70, 56],
    ].forEach(([lx, ly, lw]) =>
      svg.appendChild(
        V.s("rect", { x: lx, y: ly - 7, width: lw, height: 14, rx: 7, style: { fill: "var(--line-2)" } }),
      ),
    );
    const top0 = 118;
    const pitch = Math.floor((h - top0 - 18) / slots);
    const slotH = pitch - 10;
    const els = Array.from({ length: slots }, (_, i) => {
      const s = V.h("div", {
        class: "c-blue",
        style: {
          ...abs(18, top0 + i * pitch, w - 36, slotH),
          boxSizing: "border-box",
          borderRadius: "12px",
          border: "3px dashed var(--c-edge)",
        },
      });
      el.append(s);
      return s;
    });
    parent.append(el);
    const [cx, cy] = [x + w / 2, y + h / 2];
    return {
      el,
      x,
      y,
      w,
      h,
      mid: () => ({ x: cx, y: cy }),
      top: () => ({ x: cx, y }),
      bottom: () => ({ x: cx, y: y + h }),
      left: () => ({ x, y: cy }),
      right: () => ({ x: x + w, y: cy }),
      slotMid: (i) => ({ x: x + w / 2, y: y + top0 + i * pitch + slotH / 2 }),
      set(st = {}) {
        const hd = head(st);
        const tone = st.tone || "blue";
        els.forEach((s, i) => {
          const f = clamp(st.fill ? (st.fill[i] ?? 0) : 0);
          const on = f >= 0.5;
          setClass(s, `c-${tn(tone)}`);
          s.style.border = on ? "3px solid var(--c-lip)" : "3px dashed var(--c-edge)";
          s.style.background = on ? "var(--c)" : "";
          s.style.boxShadow = on ? "0 4px 0 var(--c-lip)" : "";
          const pulse = st.wait === i ? 0.5 + 0.5 * Math.sin(Math.PI * clamp(st.waitK ?? 0)) : 0;
          s.style.background = on ? "var(--c)" : pulse > 0.01 ? "var(--c-dim)" : "";
          s.style.transform = `scaleX(${(on ? 0.92 + 0.08 * E.pop(f) : 1).toFixed(3)})`;
        });
        placeBox(el, hd);
      },
    };
  }

  // ---------- 4. dot grid ----------
  function dots(parent, o = {}) {
    const { x = 0, y = 0, cols = 25, rows = 16, size = 18, gap = 6 } = o;
    const n = cols * rows;
    const w = cols * (size + gap) - gap;
    const h = rows * (size + gap) - gap;
    const el = V.h("div", { style: abs(x, y, w, h) });
    const items = Array.from({ length: n }, (_, i) => {
      const d = V.h("div", {
        class: "c-grey",
        style: {
          ...abs((i % cols) * (size + gap), Math.floor(i / cols) * (size + gap), size, size),
          boxSizing: "border-box",
          borderRadius: `${Math.round(size * 0.28)}px`,
          border: "2px solid var(--c-edge)",
          background: "var(--c-dim)",
        },
      });
      el.append(d);
      return { d, last: "" };
    });
    parent.append(el);
    return {
      el,
      n,
      cols,
      rows,
      size,
      gap,
      w,
      h,
      x,
      y,
      mid: (i) => ({
        x: x + (i % cols) * (size + gap) + size / 2,
        y: y + Math.floor(i / cols) * (size + gap) + size / 2,
      }),
      set(fn) {
        items.forEach((it, i) => {
          const r = fn(i);
          const st = typeof r === "string" ? { tone: r } : r || {};
          const { tone = "grey", solid = false, ring: rg = null, o: op = 1, s = 1 } = st;
          const key = `${tone}|${solid ? 1 : 0}|${rg || ""}|${op.toFixed(2)}|${s.toFixed(2)}`;
          if (key === it.last) return;
          it.last = key;
          const d = it.d;
          setClass(d, `c-${tn(tone)}`);
          d.style.background = solid ? "var(--c)" : "var(--c-dim)";
          d.style.borderColor = rg ? D2.tone(rg).c : solid ? "var(--c-lip)" : "var(--c-edge)";
          d.style.borderWidth = rg ? "5px" : "2px";
          d.style.opacity = op >= 1 ? "" : String(Math.max(0, op));
          d.style.visibility = op <= 0.001 ? "hidden" : "";
          d.style.transform = s === 1 ? "" : `scale(${s.toFixed(3)})`;
        });
      },
    };
  }
  Object.assign(D2, { table, doc, page, dots });
})();

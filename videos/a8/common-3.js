/* Phase 8 · Cryptography & Blockchain (video algo-8): bigger drawing pieces (VID.a8, short name A8): fingerprints (digests), chain
   blocks, the tries table, grids of cells and bars. Loaded after common.js and common-2.js (see videos/algo-8.html). Same rules
   as common-2.js: parent pixels (stage 936 x 640), every set() / update() call is PURE (pass everything every frame), tones
   "blue" public, "purple" secret, "green" valid, "red" Eve / broken, "orange" attention / being tried, "grey" neutral.

   A8.digest(parent, {x, y, text = "f01dce9c", tone = "blue", fs = 32, n = text.length, anchor = "c"}) -> d
       a monospace fingerprint pill, one cell per hex digit. x, y = centre (anchor "l" / "r" / "tl" as for A8.tag).
       d.set({text, tone, solid, ghost, marks, x, y, dx, dy, s, r, o, k})
         marks  which digits are highlighted: a function (i, ch) -> tone | null, an array of tones / nulls, or an object
                {index: tone}. Example: marks: (i) => A8.HASH.diffHex.includes(i) ? "orange" : null.
       d.width = about its width in px (fs 32, 8 digits: about 200).
   A8.block(parent, {x, y, w = 270, fields = ["data", "prev", "hash"], title = "Block 1"}) -> b
       a chain block card, x, y = TOP-LEFT. Rows (in the order of `fields`, any of "data" "prev" "nonce" "hash"): data is one
       text strip, the others have a label ("prev", "nonce", "hash") and a monospace value. Height = 58 + 54 x rows + 6
       (3 rows 226, 4 rows 280). Needs w >= 270 for "ann pays EVE 50" at 28 px.
       b.set({title, data, prev, nonce, hash, dataTone, prevTone, nonceTone, hashTone, hashMarks, prevMarks, tone, mark, markK,
              x, y, dx, dy, s, r, o, k})
         each field value is a string (a number for nonce); *Tone is the colour of that strip (default grey); hashMarks /
         prevMarks highlight single digits like A8.digest marks (e.g. the leading zero of a sealed block);
         tone = the card border; mark = "ok" | "bad" | null shows a green tick / red cross at the right of the title (markK
         draws it on, default 1).
       b.pt(field, side = "l" | "r") -> {x, y} the left / right edge of a field's strip in parent coordinates (for links),
       b.mid -> {x, y} the card centre, b.w, b.h, b.left, b.top, b.el.
   A8.elbow(p, q) -> a polyline [p, [mx, p.y], [mx, q.y], q] with p, q = {x, y}: use it for A8.link({pts}) between two blocks.
   A8.tries(parent, {x, y, w = 600, rows = 5, rowH = 62, count, row, lead = false}) -> t
       a window onto a growing list of tries (a scrolling table): row(i) -> {a: "nonce 3", b: "7d987054", ok: false} is
       called once per i < count when it is built (a = label on the left, b = the monospace value in the middle-right, ok picks the
       verdict icon: green tick when true, red cross when false). lead: true marks the first digit of b (green when ok, red
       when not): "does it start with 0?". x, y = TOP-LEFT of the window, which is `rows` rows high (rowH each).
       t.update({upto, hi, hiK = 1, o})
         upto  how many rows are revealed (fractional: 3.4 = three rows in and the fourth sliding in). When more than `rows`
               rows are in, the window scrolls so the newest row is at the bottom.
         hi    index of a row to highlight in green (the winner), hiK 0..1 how far;
       t.rowY(i, upto) -> y (parent px) of the middle of row i at that moment; t.height = rows x rowH.
   A8.cells(parent, {x, y, cols, rows = 1, size = 16, gap = 4}) -> g       a grid of small square cells (a chance of 1 in 16).
       g.update((r, c) => undefined | {k, tone, ghost}, {o})   undefined = an idle pale cell; k 0..1 pops a solid cell in the
       tone; ghost = dashed outline only.   g.cellAt(r, c) -> {x, y} centre in parent px, g.width, g.height, g.el.
   A8.bar(parent, {x, y, w, h = 48, tone = "grey", solid = true, text = "", fs = 28}) -> b     a horizontal sticker bar growing
       from x to the right, full length w at k = 1 (never shorter than 14 px once visible).
       b.set({k, tone, solid, text, textOut, o})   text sits inside the bar (left, 16 px padding) or, with textOut, just right
       of its end.   b.end(k) -> x of the bar's right end at k.   b.el. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const { anchor, SHIFT, css, px, f1, flex, tn } = A8.kit;
  const { clamp, ease: E } = V;

  const marksOf = (m) =>
    typeof m === "function" ? m : Array.isArray(m) ? (i) => m[i] || null : m ? (i) => m[i] || null : () => null;
  /* a string drawn as one inline cell per character; marks colour single characters */
  function chars(parent, n, extra = {}) {
    const cells = Array.from({ length: n }, () =>
      V.h("span", {
        style: { display: "inline-block", padding: "0 1px", margin: "0 1px", borderRadius: "6px", ...extra },
      }),
    );
    parent.append(...cells);
    const mem = [];
    return (text, marks) => {
      const mk = marksOf(marks);
      cells.forEach((c, i) => {
        const ch = text[i] == null ? "" : text[i];
        const tone = mk(i, ch);
        const key = `${ch}|${tone}`;
        if (mem[i] === key) return;
        mem[i] = key;
        c.textContent = ch;
        c.className = tone ? `c-${tn(tone)}` : "";
        css(c, tone ? { background: "var(--c-edge)", color: "var(--c-ink)" } : { background: "", color: "" });
      });
    };
  }

  // ---------- digest ----------
  function digest(parent, o = {}) {
    const text0 = o.text || "f01dce9c";
    const n = o.n || text0.length;
    const fs = o.fs || 32;
    const { outer, place } = anchor(parent, o.x || 0, o.y || 0);
    const el = V.h("div", {
      class: "v-tag",
      style: {
        left: "0px",
        top: "0px",
        transform: SHIFT[o.anchor || "c"],
        fontSize: px(fs),
        fontFamily: "var(--mono)",
        fontWeight: "700",
        padding: "5px 14px 6px",
        lineHeight: "1.15",
        ...flex,
      },
    });
    outer.append(el);
    const put = chars(el, n);
    const base = { tone: o.tone || "blue", solid: !!o.solid };
    return {
      el,
      width: n * fs * 0.62 + 12 + 28 + 6,
      set(s = {}) {
        const tone = tn(s.tone || base.tone);
        const solid = s.solid == null ? base.solid : s.solid;
        const cls = `v-tag c-${tone}${solid && !s.ghost ? " solid" : ""}`;
        if (el.className !== cls) el.className = cls;
        css(el, {
          boxShadow: s.ghost ? "none" : `0 4px 0 var(--${solid ? "c-lip" : "c-edge"})`,
          background: s.ghost ? "transparent" : "",
          borderStyle: s.ghost ? "dashed" : "",
        });
        put(s.text == null ? text0 : s.text, s.marks);
        place(s);
      },
    };
  }

  // ---------- chain block ----------
  const FIELD_LABEL = { prev: "prev", nonce: "nonce", hash: "hash" };
  function block(parent, o = {}) {
    const w = o.w || 270;
    const fields = o.fields || ["data", "prev", "hash"];
    const h = 58 + 54 * fields.length + 6;
    const [x0, y0] = [o.x || 0, o.y || 0];
    const { outer, place } = anchor(parent, x0 + w / 2, y0 + h / 2);
    const card = V.h("div", {
      class: "v-card plain c-grey",
      style: { left: px(-w / 2), top: px(-h / 2), width: px(w), height: px(h) },
    });
    outer.append(card);
    const title = V.h("div", {
      class: "v-text",
      style: { left: "16px", top: "9px", fontSize: "30px", fontWeight: "900", color: "var(--ink)" },
    });
    card.append(title);
    const tickI = A8.icon(card, "tick", { x: w - 40, y: 30, size: 40, tone: "green" });
    const crossI = A8.icon(card, "cross", { x: w - 40, y: 30, size: 40, tone: "red" });
    const strips = {};
    fields.forEach((f, j) => {
      const strip = V.h("div", {
        style: {
          position: "absolute",
          left: "9px",
          top: px(52 + j * 54),
          width: px(w - 24),
          height: "46px",
          boxSizing: "border-box",
          border: "2px solid var(--c-edge)",
          borderRadius: "12px",
          background: "var(--c-dim)",
          color: "var(--c-ink)",
          fontSize: "28px",
          fontWeight: "800",
          ...flex,
          justifyContent: "space-between",
          padding: "0 10px",
          whiteSpace: "nowrap",
        },
      });
      const label =
        f === "data"
          ? null
          : V.h("span", { text: FIELD_LABEL[f], style: { color: "var(--text-dim)", fontWeight: "800" } });
      const value = V.h("span", f === "data" ? {} : { style: { fontFamily: "var(--mono)", fontWeight: "700" } });
      if (label) strip.append(label);
      strip.append(value);
      card.append(strip);
      strips[f] = { strip, value, put: f === "data" ? null : chars(value, f === "nonce" ? 3 : 8), mem: {} };
    });
    const mem = {};
    const rowY = (f) => y0 + 3 + 52 + fields.indexOf(f) * 54 + 23;
    return {
      el: outer,
      w,
      h,
      left: x0,
      top: y0,
      mid: { x: x0 + w / 2, y: y0 + h / 2 },
      pt: (f, side = "l") => ({ x: side === "r" ? x0 + w : x0, y: rowY(f) }),
      set(s = {}) {
        if (s.title != null && mem.title !== s.title) title.textContent = mem.title = s.title;
        const ctone = tn(s.tone || "grey");
        if (mem.tone !== ctone) card.className = `v-card plain c-${(mem.tone = ctone)}`;
        fields.forEach((f) => {
          const st = strips[f];
          const tone = tn(s[`${f}Tone`] || "grey");
          if (st.mem.tone !== tone) {
            st.mem.tone = tone;
            st.strip.className = `c-${tone}`;
          }
          const v = s[f];
          if (v == null) return;
          if (f === "data") {
            if (st.mem.v !== String(v)) st.value.textContent = st.mem.v = String(v);
          } else st.put(String(v), s[`${f}Marks`]);
        });
        const mk = s.mark || null;
        const mkK = s.markK == null ? 1 : s.markK;
        tickI.set({ o: mk === "ok" ? 1 : 0, draw: mkK });
        crossI.set({ o: mk === "bad" ? 1 : 0, draw: mkK });
        place({ ...s, x: s.x == null ? null : s.x + w / 2, y: s.y == null ? null : s.y + h / 2 });
      },
    };
  }
  /* the corners of an arrow from point p to point q: right, up or down, right */
  const elbow = (p, q) => {
    const mx = (p.x + q.x) / 2;
    return [
      [p.x, p.y],
      [mx, p.y],
      [mx, q.y],
      [q.x, q.y],
    ];
  };

  // ---------- tries table ----------
  function tries(parent, o = {}) {
    const [w, nRows, rowH] = [o.w || 600, o.rows || 5, o.rowH || 62];
    const root = V.h("div", {
      style: { position: "absolute", left: px(o.x || 0), top: px(o.y || 0), width: px(w), height: px(nRows * rowH) },
    });
    parent.append(root);
    const items = Array.from({ length: o.count }, (_, i) => {
      const d = o.row(i);
      const el = V.h("div", {
        class: "c-grey",
        style: {
          position: "absolute",
          left: "0px",
          top: "0px",
          width: px(w),
          height: px(rowH - 10),
          boxSizing: "border-box",
          border: "3px solid var(--c-edge)",
          borderRadius: "18px",
          background: "var(--panel)",
          color: "var(--ink)",
          fontSize: "28px",
          fontWeight: "800",
          ...flex,
          justifyContent: "space-between",
          padding: "0 18px",
          whiteSpace: "nowrap",
        },
      });
      const a = V.h("span", { text: d.a });
      const b = V.h("span", { style: { fontFamily: "var(--mono)", fontWeight: "700" } });
      const marks = o.lead ? (j) => (j === 0 ? (d.ok ? "green" : "red") : null) : null;
      chars(b, d.b.length)(d.b, marks);
      const ic = A8.icon(el, d.ok ? "tick" : "cross", { x: 0, y: 0, size: 38, tone: d.ok ? "green" : "red" });
      Object.assign(ic.outer.style, {
        position: "relative",
        left: "0px",
        top: "0px",
        width: "38px",
        height: "38px",
        flex: "none",
      });
      Object.assign(ic.el.style, { left: "0px", top: "0px" });
      el.append(a, b, ic.outer);
      root.append(el);
      return { el, ic, mem: "" };
    });
    return {
      el: root,
      height: nRows * rowH,
      rowY(i, upto) {
        const scroll = Math.max(0, upto - nRows);
        return (o.y || 0) + (i - scroll) * rowH + (rowH - 10) / 2;
      },
      update(u = {}) {
        const upto = u.upto || 0;
        const scroll = Math.max(0, upto - nRows);
        const hiK = u.hi == null ? 0 : clamp(u.hiK == null ? 1 : u.hiK);
        items.forEach((it, i) => {
          const e = clamp(upto - i);
          const slot = i - scroll;
          const op = Math.min(clamp(e * 3), clamp(slot + 1)) * (u.o == null ? 1 : u.o);
          const hi = i === u.hi && hiK > 0.01;
          const cls = hi ? "c-green" : "c-grey";
          if (it.mem !== cls) {
            it.mem = cls;
            it.el.className = cls;
            css(it.el, {
              background: hi ? "var(--c-dim)" : "var(--panel)",
              boxShadow: hi ? "0 5px 0 var(--c-edge)" : "none",
            });
          }
          V.place(it.el, { y: slot * rowH + (1 - E.out(e)) * 14, o: op });
          it.ic.set({ draw: clamp((e - 0.55) / 0.45), o: op > 0.01 ? 1 : 0 });
        });
      },
    };
  }

  // ---------- cells ----------
  function cells(parent, o = {}) {
    const [cols, rows, size, gap] = [o.cols, o.rows || 1, o.size || 16, o.gap || 4];
    const width = cols * size + (cols - 1) * gap;
    const height = rows * size + (rows - 1) * gap;
    const root = V.h("div", {
      style: { position: "absolute", left: px(o.x || 0), top: px(o.y || 0), width: px(width), height: px(height) },
    });
    parent.append(root);
    const els = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const e = V.h("div", {
          style: {
            position: "absolute",
            left: px(c * (size + gap)),
            top: px(r * (size + gap)),
            width: px(size),
            height: px(size),
            boxSizing: "border-box",
            borderRadius: `${Math.max(3, size / 4)}px`,
            border: "2px solid var(--line-2)",
            background: "var(--panel-2)",
          },
        });
        root.append(e);
        els.push(e);
      }
    return {
      el: root,
      width,
      height,
      cellAt: (r, c) => ({ x: (o.x || 0) + c * (size + gap) + size / 2, y: (o.y || 0) + r * (size + gap) + size / 2 }),
      update(fn, u = {}) {
        els.forEach((e, idx) => {
          const st = fn(Math.floor(idx / cols), idx % cols);
          if (!st)
            return void css(e, {
              background: "var(--panel-2)",
              borderColor: "var(--line-2)",
              borderStyle: "solid",
              transform: "",
            });
          const k = st.k == null ? 1 : clamp(st.k);
          e.className = `c-${tn(st.tone || "green")}`;
          css(
            e,
            st.ghost
              ? { background: "transparent", borderColor: "var(--c)", borderStyle: "dashed", transform: "" }
              : {
                  background: "var(--c)",
                  borderColor: "var(--c-lip)",
                  borderStyle: "solid",
                  transform: `scale(${f1(0.6 + 0.4 * E.pop(k))})`,
                  opacity: String(clamp(k * 4)),
                },
          );
        });
        V.show(root, u.o == null ? 1 : u.o);
      },
    };
  }

  // ---------- bar ----------
  function bar(parent, o = {}) {
    const [w, h, fs] = [o.w, o.h || 48, o.fs || 28];
    const el = V.h("div", {
      style: {
        position: "absolute",
        left: px(o.x || 0),
        top: px(o.y || 0),
        height: px(h),
        boxSizing: "border-box",
        borderRadius: px(h / 2),
        border: "3px solid var(--c-edge)",
        display: "flex",
        alignItems: "center",
        paddingLeft: "16px",
        fontSize: px(fs),
        fontWeight: "900",
        whiteSpace: "nowrap",
        overflow: "hidden",
      },
    });
    const out = V.h("div", { class: "v-text", style: { fontSize: px(fs) } });
    parent.append(el, out);
    const end = (k) => (o.x || 0) + Math.max(14, w * clamp(k));
    return {
      el,
      end,
      set(s = {}) {
        const k = clamp(s.k == null ? 1 : s.k);
        const tone = tn(s.tone || o.tone || "grey");
        const solid = s.solid == null ? o.solid !== false : s.solid;
        el.className = `c-${tone}`;
        const text = s.text == null ? o.text || "" : s.text;
        css(el, {
          width: px(Math.max(14, w * k)),
          background: solid ? "var(--c)" : "var(--c-dim)",
          borderColor: solid ? "var(--c-lip)" : "var(--c-edge)",
          boxShadow: `0 5px 0 var(--${solid ? "c-lip" : "c-edge"})`,
          color: solid ? "var(--c-on)" : "var(--c-ink)",
        });
        el.textContent = s.textOut ? "" : text;
        out.textContent = s.textOut ? text : "";
        css(out, { left: px(end(k) + 14), top: px((o.y || 0) + (h - fs * 1.2) / 2) });
        const op = s.o == null ? 1 : s.o;
        V.show(el, k > 0.002 ? op : 0);
        V.show(out, s.textOut && k > 0.002 ? op : 0);
      },
    };
  }

  Object.assign(A8, { digest, block, elbow, tries, cells, bar });
})();

/* Phase 10 · Transformers & Attention: the bigger drawing pieces (VID.a10, short name A10): a sentence of word tags, attention arcs,
   heat grids, bars, a share-out bar, the picture and its patch lattice. Needs common.js and common-2.js loaded first. Same rules as
   common-2.js: positions are the parent's pixels, EVERY CALL IS PURE (call set() each frame with everything you want to see), text
   is at least 28 px, colour roles as listed in common-2.js (purple query, blue keys / numbers, orange added / handed over, green
   result, red blocked, grey words).

   1. SENTENCE  (a row of word tags with exact positions; the words of a sentence, left to right)
        const s = A10.sentence(parent, {x, y, words: A10.ATT.words, gap: 14, tone: "grey", tones: [per word], fs: 28, w: [optional fixed widths]});
        s.set(i, {text, tone, solid, ghost, k, x, y, s, r, o})  (same fields as A10.tag().set)    s.all((i) => state | undefined)
        s.mid(i) / s.top(i) / s.bottom(i) / s.left(i) / s.right(i) -> {x, y} in parent coordinates;  s.tags, s.n, s.width (px), s.height 58
        A10.sentenceW(words, gap = 14, fs = 28) -> the width such a row would have (to centre it: x = (936 - width) / 2)
   2. ARC  (a curved line over or under a sentence; attention between two words; thickness = weight)
        const a = A10.arc(svgLayer, {x1, y1, x2, y2, lift: 60, tone: "green", w: 6, dot: true});     svgLayer = A10.svg(stage)
            (x1, y1) the asking word, (x2, y2) the word looked at; lift = height of the curve in px (positive = bulges UP, negative = DOWN);
            when both ends are the same point the arc is a small loop over the word (the word looking at itself). dot = a round end cap.
        a.set({k: 1, w, tone, o: 1})   k 0..1 draws the arc on from (x1, y1) (the end dot pops in at the end), w stroke width in px
        a.g (the <g>), a.at(f) -> {x, y} the point at fraction f of the way along the curve (put a weight tag there: f = 0.5 is the top)
        A10.arcW(weight, lo = 4, hi = 18) -> a stroke width for a weight 0..1
        A10.arcLift(dx, base = 30, k = 0.2, max = 170) -> a lift for an arc that spans dx px (longer arcs bulge higher; keep the apex inside
            the stage: a sentence at y needs y - lift >= 12). An arc is invisible until its first set().
   3. GRID  (a heat grid: rows = the word asking, columns = the word looked at; or a matrix of numbers)
        const g = A10.grid(parent, {x, y, rows: 7, cols: 7, cell: 28, cw, ch, gap: 2, radius: 6, fs: 28});    cell = square size; cw / ch = width / height
        g.set(r, c, {v: 0..1, tone: "green", blocked: 0..1, text, ring, ringK, k, o, s})
            v = how strongly the cell is filled in its tone (0 = an empty grey cell), text = a number or word written in it (28 px: make the
            cell at least 84 wide), blocked = a red cell with a cross (the masked future; the number is the pop-in), ring = a tone name
            draws a ring just outside the cell, k pops the cell in (0 hides it).
        g.all((r, c) => state | undefined)     g.mid(r, c) -> {x, y}     g.rowLeft(r) / g.rowRight(r) -> {x, y} (outside the row, 10 px out)
        g.colTop(c) / g.colBottom(c) -> {x, y} (outside the column);  g.el, g.width, g.height, g.rows, g.cols, g.x, g.y
   4. BARS  (horizontal or vertical bars with a baseline, a number at the end of each)
        const b = A10.bars(parent, {x, y, n: 3, dir: "h" | "v", unit: 56, bw: 48, gap: 20, zero: 0, tone: "blue"});
            "h": bar i is a row at y + i * (bw + gap), the baseline is the vertical line x + zero, positive values go right, negative left.
            "v": bar i is a column at x + i * (bw + gap), the baseline is the horizontal line y + zero, positive values go UP, negative down.
            unit = px per 1.0 of value.
        b.set(i, {v, from: 0, grow: 1, tone, solid: true, text, textTone, k: 1, o: 1})   the bar spans from `from` to `v` (a delta on top
            of another bar: from = the old value); grow 0..1 draws it from `from` towards `v`; text = the number written at its end
            (default none); k pops it in.
        b.pt(i, v) -> {x, y} the point of bar i's centre line at value v (aim arrows, tags);  b.base(i) -> {x, y} where the bar starts;
        b.width / b.height (of the bars' area is not fixed: it depends on v), b.el
   5. SHARE BAR  (one bar split into shares that add up to 1)
        const sb = A10.shareBar(parent, {x, y, w: 560, h: 64});
        sb.set({vals: [0.665, 0.245, 0.09], tones: ["green", "blue", "grey"], k: 1, o: 1, solid: true})   vals = fractions of the whole width (they
            do not have to add up to 1: a partial bar is a partly filled one); k 0..1 grows the bar from the left
        sb.seg(i, vals) -> {x0, x1, mid}   exact pixel span of segment i in parent coordinates (use it to place labels above it);  sb.el
   6. THE PICTURE AND ITS PATCHES  (scene 10: the 224 x 224 picture of the lesson, drawn in house style)
        const p = A10.photo(parent, {x, y, size: 320});     p.set({k: 1, o: 1, s: 1, x, y});  p.el   a sky, a sun, a hill and a house
        const l = A10.lattice(parent, {x, y, size: 320, n: 14, pre: [[row, col], ...]});   the patch lines over the picture (same x, y, size);
            pre = every patch that set() will ever light (their rects are built once, hidden, so that set() only restyles: update(t) stays pure)
        l.set({k: 1, o: 1, hot: [[row, col], ...], hotTone: "orange", hotK: 1})   k 0..1 draws the lines on, hot = patches filled in the tone
        l.cellMid(r, c) -> {x, y};  l.cell (px per patch)  */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const { clamp, ease: E } = V;
  const { abs, flex, f1, setText } = A10;

  // ---------- 1. sentence ----------
  A10.sentenceW = (words, gap = 14, fs = 28) =>
    words.reduce((a, w) => a + A10.tagW(w, fs), 0) + gap * (words.length - 1);
  function sentence(parent, o = {}) {
    const { x = 0, y = 0, words = [], gap = 14, fs = 28 } = o;
    let cx = x;
    const tags = words.map((w, i) => {
      const t = A10.tag(parent, {
        x: cx,
        y,
        text: w,
        tone: (o.tones && o.tones[i]) || o.tone || "grey",
        fs,
        w: o.w && o.w[i],
      });
      cx += t.w + gap;
      return t;
    });
    return {
      tags,
      n: words.length,
      width: cx - gap - x,
      height: 58,
      set: (i, st) => tags[i].set(st),
      all: (fn) => tags.forEach((t, i) => t.set(fn(i) || {})),
      mid: (i) => tags[i].mid(),
      top: (i) => tags[i].top(),
      bottom: (i) => tags[i].bottom(),
      left: (i) => tags[i].left(),
      right: (i) => tags[i].right(),
    };
  }

  // ---------- 2. arcs ----------
  A10.arcW = (weight, lo = 4, hi = 18) => lo + (hi - lo) * clamp(weight);
  A10.arcLift = (dx, base = 30, k = 0.2, max = 170) => Math.min(max, base + k * Math.abs(dx));
  function arc(svg, o = {}) {
    const { x1, y1, x2, y2, lift = 60, tone: base = "green", w: w0 = 6, dot = true } = o;
    const loop = Math.abs(x2 - x1) < 4 && Math.abs(y2 - y1) < 4;
    const up = lift >= 0 ? 1 : -1;
    const [ex, ey] = loop ? [x1 + 20, y1] : [x2, y2];
    const [sx, sy] = loop ? [x1 - 20, y1] : [x1, y1];
    const d = loop
      ? `M ${f1(sx)} ${f1(sy)} C ${f1(sx - 28)} ${f1(sy - up * Math.abs(lift) * 1.5)}, ${f1(ex + 28)} ${f1(ey - up * Math.abs(lift) * 1.5)}, ${f1(ex)} ${f1(ey)}`
      : `M ${f1(sx)} ${f1(sy)} Q ${f1((sx + ex) / 2)} ${f1((sy + ey) / 2 - 2 * lift)} ${f1(ex)} ${f1(ey)}`;
    const path = V.s("path", { d, fill: "none", pathLength: "1", "stroke-linecap": "round" });
    const cap = V.s("circle", { cx: f1(ex), cy: f1(ey), r: 6 });
    const g = V.s("g", {}, path, cap);
    path.style.visibility = "hidden";
    cap.style.visibility = "hidden";
    svg.append(g);
    const at = (f) => {
      const c = loop ? [(sx + ex) / 2, sy - up * Math.abs(lift) * 1.1] : [(sx + ex) / 2, (sy + ey) / 2 - 2 * lift];
      if (loop) return { x: c[0], y: c[1] };
      const q = (a, b, m) => (1 - f) * (1 - f) * a + 2 * (1 - f) * f * m + f * f * b;
      return { x: q(sx, ex, c[0]), y: q(sy, ey, c[1]) };
    };
    return {
      g,
      at,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        const w = st.w ?? w0;
        const colour = A10.tone(st.tone || base).c;
        path.style.stroke = colour;
        path.style.strokeWidth = f1(w);
        path.style.strokeDasharray = "1 1";
        path.style.strokeDashoffset = String(1 - k);
        path.style.visibility = k <= 0.002 ? "hidden" : "";
        const kd = dot ? V.ramp(k, 0.85, 1, E.lin) : 0;
        cap.style.fill = colour;
        cap.setAttribute("r", f1(Math.max(5, w * 0.7) * (0.5 + 0.5 * E.pop(kd))));
        V.show(cap, kd);
        g.style.opacity = (st.o ?? 1) >= 1 ? "" : String(Math.max(0, st.o));
        g.style.visibility = (st.o ?? 1) <= 0.001 ? "hidden" : "";
      },
    };
  }

  // ---------- 3. heat grid ----------
  function grid(parent, o = {}) {
    const { x = 0, y = 0, rows = 3, cols = 3, gap = 2, radius = 6 } = o;
    const cw = o.cw ?? o.cell ?? 40;
    const ch = o.ch ?? o.cell ?? 40;
    const fs = o.fs ?? 28;
    A10.minFs(fs, "grid");
    const width = cols * cw + (cols - 1) * gap;
    const height = rows * ch + (rows - 1) * gap;
    const el = V.h("div", { style: abs(x, y, width, height) });
    const ringPad = 5;
    const items = [];
    const crossBar = (rot) =>
      V.h("div", {
        style: {
          position: "absolute",
          left: "50%",
          top: "50%",
          width: `${Math.round(Math.min(cw, ch) * 0.52)}px`,
          height: "5px",
          marginLeft: `${-Math.round(Math.min(cw, ch) * 0.26)}px`,
          marginTop: "-2.5px",
          borderRadius: "3px",
          background: "var(--rose)",
          transform: `rotate(${rot}deg)`,
        },
      });
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const px = c * (cw + gap);
        const py = r * (ch + gap);
        const ring = V.h("div", {
          style: {
            ...abs(px - ringPad, py - ringPad, cw + 2 * ringPad, ch + 2 * ringPad),
            boxSizing: "border-box",
            border: "4px solid var(--violet)",
            borderRadius: `${radius + ringPad}px`,
            visibility: "hidden",
          },
        });
        const tile = V.h("div", {
          style: {
            ...abs(px, py, cw, ch),
            ...flex,
            boxSizing: "border-box",
            border: "2px solid var(--line)",
            borderRadius: `${radius}px`,
            fontSize: `${fs}px`,
            fontWeight: "800",
            overflow: "hidden",
          },
        });
        const bars = [crossBar(45), crossBar(-45)];
        tile.append(...bars);
        bars.forEach((b) => (b.style.display = "none"));
        el.append(ring, tile);
        items.push({ ring, tile, bars, px, py });
      }
    parent.append(el);
    const set = (r, c, st = {}) => {
      const it = items[r * cols + c];
      const tone = A10.tone(st.tone || "green");
      const v = clamp(st.v ?? 0);
      const bl = clamp(typeof st.blocked === "number" ? st.blocked : st.blocked ? 1 : 0);
      const t = it.tile;
      if (bl > 0.01) {
        t.style.background = "var(--rose-dim)";
        t.style.borderColor = "var(--rose-edge)";
      } else {
        t.style.background =
          v <= 0.001 ? "var(--panel-2)" : `color-mix(in srgb, ${tone.c} ${Math.round(v * 100)}%, var(--panel-2))`;
        t.style.borderColor = v > 0.4 ? tone.lip : "var(--line)";
      }
      t.style.color = v > 0.6 ? tone.on : "var(--ink)";
      it.bars.forEach((b) => (b.style.display = bl > 0.01 ? "" : "none"));
      it.bars.forEach((b) => (b.style.opacity = String(bl)));
      const label = st.text == null ? "" : String(st.text);
      if (it.label !== label) {
        [...t.childNodes].filter((n) => n.nodeType === 3).forEach((n) => n.remove());
        if (label) t.prepend(document.createTextNode(label));
        it.label = label;
      }
      const k = clamp(st.k ?? 1);
      V.place(t, { s: (st.s ?? 1) * (0.7 + 0.3 * E.pop(k)), o: Math.min(1, k * 4) * (st.o ?? 1) });
      const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
      if (st.ring && rk > 0.002) {
        it.ring.style.borderColor = A10.tone(st.ring).c;
        it.ring.style.visibility = "";
        it.ring.style.opacity = String(Math.min(1, rk * 3));
        it.ring.style.transform = `scale(${(0.85 + 0.15 * E.pop(rk)).toFixed(3)})`;
      } else it.ring.style.visibility = "hidden";
    };
    const mid = (r, c) => ({ x: x + c * (cw + gap) + cw / 2, y: y + r * (ch + gap) + ch / 2 });
    return {
      el,
      width,
      height,
      rows,
      cols,
      x,
      y,
      set,
      all: (fn) => {
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) set(r, c, fn(r, c) || {});
      },
      mid,
      rowLeft: (r) => ({ x: x - 10, y: mid(r, 0).y }),
      rowRight: (r) => ({ x: x + width + 10, y: mid(r, 0).y }),
      colTop: (c) => ({ x: mid(0, c).x, y: y - 10 }),
      colBottom: (c) => ({ x: mid(0, c).x, y: y + height + 10 }),
    };
  }

  // ---------- 4. bars ----------
  function bars(parent, o = {}) {
    const { x = 0, y = 0, n = 3, dir = "h", unit = 56, bw = 48, gap = 20, zero = 0, tone: base = "blue" } = o;
    const horiz = dir === "h";
    const el = V.h("div", { style: abs(0, 0) });
    parent.append(el);
    const items = Array.from({ length: n }, () => {
      const bar = V.h("div", {
        style: { position: "absolute", boxSizing: "border-box", border: "3px solid", borderRadius: "12px" },
      });
      const label = V.h("div", {
        class: "v-text",
        style: { fontSize: "28px", fontWeight: "900", textAlign: "center", whiteSpace: "nowrap" },
      });
      el.append(bar, label);
      return { bar, label };
    });
    const lane = (i) => i * (bw + gap);
    const pt = (i, v) =>
      horiz ? { x: x + zero + v * unit, y: y + lane(i) + bw / 2 } : { x: x + lane(i) + bw / 2, y: y + zero - v * unit };
    const set = (i, st = {}) => {
      const { bar, label } = items[i];
      const tone = A10.tone(st.tone || base);
      const solid = st.solid ?? true;
      const from = st.from ?? 0;
      const end = from + ((st.v ?? 0) - from) * clamp(st.grow ?? 1);
      const [lo, hi] = [Math.min(from, end), Math.max(from, end)];
      const len = (hi - lo) * unit;
      const k = clamp(st.k ?? 1);
      const [fillC, edgeC] = solid ? [tone.c, tone.lip] : [tone.dim, tone.edge];
      Object.assign(bar.style, { background: fillC, borderColor: edgeC });
      if (horiz)
        Object.assign(bar.style, {
          left: `${f1(x + zero + lo * unit)}px`,
          top: `${f1(y + lane(i))}px`,
          width: `${f1(len)}px`,
          height: `${bw}px`,
        });
      else
        Object.assign(bar.style, {
          left: `${f1(x + lane(i))}px`,
          top: `${f1(y + zero - hi * unit)}px`,
          width: `${bw}px`,
          height: `${f1(len)}px`,
        });
      V.place(bar, { s: 0.85 + 0.15 * E.pop(k), o: len < 2 ? 0 : Math.min(1, k * 4) * (st.o ?? 1) });
      const text = st.text == null ? "" : String(st.text);
      setText(label, text);
      label.style.color = st.textTone ? A10.tone(st.textTone).ink : tone.ink;
      const tip = pt(i, end);
      const grows = end >= from ? 1 : -1;
      if (horiz) {
        const w = A10.textW(text, 28) + 8;
        Object.assign(label.style, {
          left: `${f1(grows > 0 ? tip.x + 12 : tip.x - 12 - w)}px`,
          top: `${f1(y + lane(i) + bw / 2 - 17)}px`,
          width: `${f1(w)}px`,
        });
      } else {
        const w = A10.textW(text, 28) + 8;
        Object.assign(label.style, {
          left: `${f1(tip.x - w / 2)}px`,
          top: `${f1(grows > 0 ? tip.y - 42 : tip.y + 8)}px`,
          width: `${f1(w)}px`,
        });
      }
      V.place(label, { o: text ? Math.min(1, k * 4) * (st.o ?? 1) : 0 });
    };
    return { el, set, pt, base: (i) => pt(i, 0) };
  }

  // ---------- 5. share bar ----------
  function shareBar(parent, o = {}) {
    const { x = 0, y = 0, w = 560, h = 64 } = o;
    const el = V.h("div", {
      style: {
        ...abs(x, y, w, h),
        boxSizing: "border-box",
        border: "3px solid var(--line-2)",
        borderRadius: "20px",
        background: "var(--panel-2)",
      },
    });
    const segs = [0, 1, 2, 3, 4, 5].map(() =>
      V.h("div", {
        style: {
          position: "absolute",
          top: "3px",
          bottom: "3px",
          boxSizing: "border-box",
          border: "3px solid",
          borderRadius: "14px",
        },
      }),
    );
    el.append(...segs);
    parent.append(el);
    const inner = w - 6;
    const spans = (vals, kk = 1) => {
      let a = 0;
      return vals.map((v) => {
        const s = { x0: x + 3 + a * inner * kk, x1: x + 3 + (a + v) * inner * kk };
        a += v;
        return { ...s, mid: (s.x0 + s.x1) / 2 };
      });
    };
    return {
      el,
      seg: (i, vals) => spans(vals)[i],
      set(st = {}) {
        const vals = st.vals || [];
        const k = clamp(st.k ?? 1);
        const sp = spans(vals, k);
        segs.forEach((s, i) => {
          if (i >= vals.length || vals[i] <= 0) return V.show(s, 0);
          const tone = A10.tone((st.tones && st.tones[i]) || "green");
          const solid = st.solid ?? true;
          Object.assign(s.style, {
            left: `${f1(sp[i].x0 - x - 3 + 2)}px`,
            width: `${f1(Math.max(0, sp[i].x1 - sp[i].x0 - 4))}px`,
            background: solid ? tone.c : tone.dim,
            borderColor: solid ? tone.lip : tone.edge,
          });
          V.show(s, 1);
        });
        V.place(el, { s: 0.9 + 0.1 * E.out(Math.min(1, k * 3)), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  }

  // ---------- 6. the picture and its patches ----------
  function photo(parent, o = {}) {
    const { x = 0, y = 0, size = 320 } = o;
    const px = (n) => String(n);
    const svg = V.s(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 224 224",
        style: { position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px`, overflow: "visible" },
      },
      V.s("rect", {
        x: 2,
        y: 2,
        width: 220,
        height: 220,
        rx: 14,
        "stroke-width": 4,
        style: { fill: "var(--blue-dim)", stroke: "var(--blue-edge)" },
      }),
      V.s("circle", {
        cx: 170,
        cy: 52,
        r: 26,
        "stroke-width": 4,
        style: { fill: "var(--amber)", stroke: "var(--amber-lip)" },
      }),
      V.s("path", {
        d: "M 4 182 Q 110 112 220 172 L 220 210 Q 220 220 210 220 L 14 220 Q 4 220 4 210 Z",
        "stroke-width": 4,
        "stroke-linejoin": "round",
        style: { fill: "var(--teal)", stroke: "var(--teal-lip)" },
      }),
      V.s("rect", {
        x: 50,
        y: 120,
        width: 52,
        height: 42,
        "stroke-width": 4,
        style: { fill: "var(--amber)", stroke: "var(--amber-lip)" },
      }),
      V.s("path", {
        d: "M 42 122 L 76 90 L 110 122 Z",
        "stroke-width": 4,
        "stroke-linejoin": "round",
        style: { fill: "var(--rose)", stroke: "var(--rose-lip)" },
      }),
      V.s("rect", { x: px(68), y: 138, width: 16, height: 24, rx: 3, style: { fill: "var(--rose-lip)" } }),
    );
    parent.append(svg);
    return {
      el: svg,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        V.place(svg, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.9 + 0.1 * E.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }
  function lattice(parent, o = {}) {
    const { x = 0, y = 0, size = 320, n = 14 } = o;
    const cell = size / n;
    const lw = n > 20 ? 1.5 : 2.5;
    const hot = V.s("g", {});
    const lines = [];
    const svg = V.s("svg", {
      width: size,
      height: size,
      style: { position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px`, overflow: "visible" },
    });
    svg.append(hot);
    for (let i = 0; i <= n; i++)
      for (const horiz of [true, false]) {
        const p = i * cell;
        const l = V.s("path", {
          d: horiz ? `M 0 ${f1(p)} L ${size} ${f1(p)}` : `M ${f1(p)} 0 L ${f1(p)} ${size}`,
          fill: "none",
          pathLength: "1",
          "stroke-width": lw,
          style: { stroke: "var(--ink)", strokeOpacity: n > 20 ? "0.4" : "0.5" },
        });
        svg.append(l);
        lines.push({ l, i });
      }
    parent.append(svg);
    const rects = new Map();
    const hotRect = (key, tone) => {
      const [r, c] = key.split(",").map(Number);
      const rect = V.s("rect", {
        x: f1(c * cell),
        y: f1(r * cell),
        width: f1(cell),
        height: f1(cell),
        "stroke-width": 3,
        style: { fill: tone.c, fillOpacity: "0.55", stroke: tone.lip },
      });
      hot.append(rect);
      V.show(rect, 0);
      rects.set(key, rect);
    };
    (o.pre || []).forEach(([r, c]) => hotRect(`${r},${c}`, A10.tone("orange")));
    return {
      el: svg,
      cell,
      cellMid: (r, c) => ({ x: x + (c + 0.5) * cell, y: y + (r + 0.5) * cell }),
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        lines.forEach(({ l, i }) => {
          const kk = clamp((k - (i / (n + 1)) * 0.5) / 0.5);
          l.style.strokeDasharray = "1 1";
          l.style.strokeDashoffset = String(1 - kk);
          l.style.visibility = kk <= 0.002 ? "hidden" : "";
        });
        const tone = A10.tone(st.hotTone || "orange");
        const want = new Set((st.hot || []).map(([r, c]) => `${r},${c}`));
        for (const [key, rect] of rects) if (!want.has(key)) V.show(rect, 0);
        want.forEach((key) => {
          if (!rects.has(key)) hotRect(key, tone); // only when a cell was not listed in `pre`
          const rect = rects.get(key);
          rect.style.fill = tone.c;
          rect.style.stroke = tone.lip;
          V.show(rect, clamp(st.hotK ?? 1));
        });
        V.place(svg, { o: st.o ?? 1 });
      },
    };
  }

  Object.assign(A10, { sentence, arc, grid, bars, shareBar, photo, lattice });
})();

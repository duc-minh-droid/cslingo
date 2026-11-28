/* Lecture 14 · Tensors: the drawing pieces the scenes share (VID.d14, short name D14). Needs videos/l5/common.js,
   videos/d4/common*.js and d14/common.js first. Positions are the parent's pixels (stage 936 x 640, origin top-left). PURE: call
   set() every frame with everything you want to see; nothing is remembered between frames.

   const g = D14.grid(parent, {x, y, M, cs: 72, gap: 8, fs: 30, idx: false});   a matrix of chip cells (x, y = top-left of the
       whole piece; with idx the orange column numbers sit above and the row numbers to the left, inside the piece).
       g.set(r, c, st) (a D4 chips state), g.all((r, c, v) => st), g.idx(k) (shows the index numbers), g.cell(r, c) -> {x, y} centre
       in PARENT coordinates, g.el (the wrapper: V.place it to slide or fade the whole grid), g.w, g.h, g.ox, g.oy.
   D14.cellSt(v, extra) -> the standard look of a value: non-zero = solid blue, zero = grey "0".
   const a = D14.arr(parent, {x, y, name, n, w: 70, h: 60, gap: 10, tone, side: "above" | "left", nameW});  a named array
       of slots. a.set(i, {text, tone, solid, ghost, ring, ringK, s, o}), a.name(k, st), a.mid(i), a.edge(i) (x of the boundary
       before slot i; edge(n) is the end), a.top, a.bottom.  An empty slot: {ghost: true, text: ""}.
   const p = D14.fly(parent, {tone: "blue"});  a packet that flies: p.set({a: {x, y}, b: {x, y}, k, text, bow}); hidden
       unless 0 < k < 1.
   const f = D14.frame(parent, {tone: "green", dash: false, r: 18, w: 5});  an outline box: f.set({x, y, w, h, k, tone}).
   D14.glass(size, tone) -> an SVG magnifier group centred on 0, 0 (V.place / transform it). */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    ...(w != null ? { width: `${f1(w)}px` } : {}),
    ...(h != null ? { height: `${f1(h)}px` } : {}),
  });

  D14.cellSt = (v, extra = {}) =>
    v ? { tone: "blue", solid: true, text: String(v), ...extra } : { tone: "grey", text: "0", ...extra };

  function grid(parent, o = {}) {
    const { x = 0, y = 0, M, cs = 72, gap = 8, fs = 30, idx = false } = o;
    const m = M.length;
    const n = M[0].length;
    const ox = idx ? 46 : 0;
    const oy = idx ? 46 : 0;
    const w = ox + n * cs + (n - 1) * gap;
    const h = oy + m * cs + (m - 1) * gap;
    const el = V.h("div", { style: abs(x, y, w, h) });
    parent.append(el);
    const rows = M.map((row, r) =>
      D4.chips(el, { x: ox, y: oy + r * (cs + gap), n, w: cs, h: cs, gap, fs, texts: row.map(String), lip: 5 }),
    );
    const labels = [];
    if (idx) {
      for (let c = 0; c < n; c++)
        labels.push(D4.label(el, { x: ox + c * (cs + gap) + cs / 2, y: 18, text: String(c), tone: "orange", fs: 28 }));
      for (let r = 0; r < m; r++)
        labels.push(D4.label(el, { x: 16, y: oy + r * (cs + gap) + cs / 2, text: String(r), tone: "orange", fs: 28 }));
    }
    return {
      el,
      rows,
      w,
      h,
      ox,
      oy,
      m,
      n,
      set: (r, c, st) => rows[r].set(c, st),
      all(fn) {
        M.forEach((row, r) => row.forEach((v, c) => rows[r].set(c, fn(r, c, v) || {})));
      },
      idx(k, st = {}) {
        labels.forEach((l) => l.set({ k, ...st }));
      },
      cell: (r, c) => ({ x: x + ox + c * (cs + gap) + cs / 2, y: y + oy + r * (cs + gap) + cs / 2 }),
    };
  }
  D14.grid = grid;

  function arr(parent, o = {}) {
    const { x = 0, y = 0, name = "", n = 4, w = 70, h = 60, gap = 10, tone = "blue", side = "above", fs = 30 } = o;
    const row = D4.chips(parent, { x, y, n, w, h, gap, fs, tone, texts: () => "", lip: 5 });
    const lab =
      side === "above"
        ? D4.label(parent, { x, y: y - 26, text: name, tone, fs: 28, anchor: "l" })
        : D4.label(parent, { x: x - 18, y: y + h / 2, text: name, tone, fs: 28, anchor: "r" });
    return {
      row,
      n,
      top: y,
      bottom: y + h,
      set: (i, st) => row.set(i, st),
      name: (k, st = {}) => lab.set({ k, ...st }),
      mid: (i) => row.mid(i),
      edge: (i) => x + i * (w + gap) - gap / 2,
    };
  }
  D14.arr = arr;

  function fly(parent, o = {}) {
    const p = D4.packet(parent, { tone: o.tone || "blue", text: "" });
    return {
      el: p.el,
      set(st = {}) {
        const k = st.k ?? 0;
        if (k <= 0 || k >= 1) {
          p.set({ o: 0 });
          return;
        }
        const at = D4.at(st.a, st.b, E.inOut(clamp(k)), st.bow || 0);
        p.set({ x: at.x, y: at.y, text: st.text, tone: st.tone || o.tone || "blue", k: 1, s: st.s ?? 1 });
      },
    };
  }
  D14.fly = fly;

  function frame(parent, o = {}) {
    const { tone = "green", dash = false, r = 18, w: bw = 5 } = o;
    const el = V.h("div", {
      style: {
        ...abs(0, 0, 10, 10),
        boxSizing: "border-box",
        border: `${bw}px ${dash ? "dashed" : "solid"} ${D14.tone(tone).c}`,
        borderRadius: `${r}px`,
        visibility: "hidden",
      },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        Object.assign(el.style, abs(st.x, st.y, st.w, st.h));
        el.style.borderColor = D14.tone(st.tone || tone).c;
        V.place(el, { s: 0.92 + 0.08 * E.out(k), o: k });
      },
    };
  }
  D14.frame = frame;

  /** a centred block of text that may wrap (x, y = its centre, w = the wrap width): n.set({k, text, tone, s}) */
  D14.note = (parent, o = {}) => {
    const { x = 0, y = 0, w = 400, fs = 28 } = o;
    const el = V.h("div", {
      class: "v-text",
      text: o.text || "",
      style: {
        left: `${f1(x - w / 2)}px`,
        top: `${f1(y)}px`,
        width: `${f1(w)}px`,
        transform: "translateY(-50%)",
        whiteSpace: "normal",
        textAlign: "center",
        textWrap: "balance",
        fontSize: `${fs}px`,
        fontWeight: "900",
      },
    });
    const inner = V.h("div", {}, el);
    inner.style.position = "absolute";
    parent.append(inner);
    return {
      el: inner,
      set(st = {}) {
        const tone = st.tone || o.tone || "grey";
        el.style.color = tone === "grey" ? "var(--text-dim)" : D14.tone(tone).ink;
        if (st.text != null && el.textContent !== st.text) el.textContent = st.text;
        const k = clamp(st.k ?? 1);
        V.place(inner, { y: (1 - k) * 8, s: st.s ?? 1, o: k });
      },
    };
  };

  D14.glass = (size, tone = "grey") => {
    const c = D14.tone(tone);
    const r = size * 0.32;
    return V.s(
      "g",
      {},
      V.s("line", {
        x1: r * 0.7,
        y1: r * 0.7,
        x2: size * 0.5,
        y2: size * 0.5,
        stroke: c.lip,
        "stroke-width": size * 0.12,
        "stroke-linecap": "round",
      }),
      V.s("circle", { cx: 0, cy: 0, r, fill: "none", stroke: c.c, "stroke-width": size * 0.1 }),
    );
  };
})();

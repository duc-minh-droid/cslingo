/* Lecture 15 · High-performance computing: the drawing pieces of this video (VID.d15, short name D15). Needs videos/l5/common.js,
   d4/common*.js, d9/common*.js and d15/common.js first (see videos/ds-15.html). Positions are the parent's pixels (the stage is
   936 x 640, origin top-left). EVERY CALL IS PURE: call set() each frame from update(t) with everything you want to see;
   anything you leave out falls back to its default. Tones are the video's colour roles (see common.js). Text >= 28 px.

   1. BOX  (a sticker card with a bold title and an optional small line under it: chips, nodes, job cards, the laptop)
        const b = D15.box(parent, {x, y, w, h, title: "", sub: "", tone: "grey", solid: false, fs: 30, sfs: 28, r: 22,
                                     wrap: false (the sub line may wrap)});
          x, y = TOP-LEFT.  b.set({k: 1 (pops in), x, y (offset px), s, o, tone, solid, title, sub, ring: "" (a tone name:
          a 5 px ring around it), dash: false (dashed outline, no lip: a free slot)})
          b.mid -> {x, y} centre, b.x, b.y, b.w, b.h
   2. FRAME  (a dashed rounded outline with a small label tag on its top edge: a partition, the cluster)
        const f = D15.frame(parent, {x, y, w, h, label: "", tone: "grey"});  f.set({k: 1, o: 1, tone, label})
   3. TERMINAL  (a framed panel of monospace lines that type themselves)
        const tm = D15.term(parent, {x, y, w, h, n: 12, fs: 28, lh: 40});
          tm.set({k: 1, lines: [{text, k: 1 (0..1 typed), tone: "" (a tone name: the line's ink colour; "" = ink)}],
                  hi: [{line, from, to, tone}] (a solid pill behind characters from..to of a typed line, e.g. "PD")})
   4. CELLS  (a grid of small squares: cores, transistors)
        const c = D15.cells(parent, {x, y, n, cols, size: 22, gap: 6, tone: "blue"});  c.set((i) => ({k, tone}) | null)
          (k 0..1 pops square i in; null hides it)  c.w, c.h  the grid's size
   5. TIMING  D15.seq(t, t0, step, dur, i) (stagger ramps, from D4) */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D15 = V.d15;
  const { clamp, ease: E } = V;
  const T = D4.tone;
  const f1 = (n) => (+n).toFixed(1);
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const setText = (el, s) => {
    if (s != null && el.textContent !== String(s)) el.textContent = String(s);
  };
  const pop = (k) => 0.8 + 0.2 * E.pop(clamp(k));

  // ---------- 1. box ----------
  D15.box = (parent, o = {}) => {
    const { x = 0, y = 0, w = 200, h = 100, fs = 30, sfs = 28, r = 22 } = o;
    const el = V.h("div", {
      style: {
        ...abs(x, y, w, h),
        boxSizing: "border-box",
        borderRadius: `${r}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: "900",
        lineHeight: "1.15",
        whiteSpace: "nowrap",
      },
    });
    const title = V.h("div", { text: o.title || "", style: { fontSize: `${fs}px` } });
    const sub = V.h("div", { text: o.sub || "", style: { fontSize: `${sfs}px`, fontWeight: "800" } });
    const ring = V.h("div", {
      style: {
        position: "absolute",
        left: "-12px",
        top: "-12px",
        right: "-12px",
        bottom: "-16px",
        borderRadius: `${r + 10}px`,
        border: "5px solid transparent",
      },
    });
    if (o.wrap) Object.assign(sub.style, { whiteSpace: "normal", padding: "0 10px" });
    el.append(ring, title, sub);
    parent.append(el);
    const base = { tone: o.tone || "grey", solid: !!o.solid };
    return {
      el,
      x,
      y,
      w,
      h,
      mid: { x: x + w / 2, y: y + h / 2 },
      set(st = {}) {
        const tone = st.tone || base.tone;
        const solid = st.solid ?? base.solid;
        const c = T(tone);
        const dash = !!st.dash;
        el.className = `c-${tone}`;
        el.style.background = dash ? "transparent" : solid ? c.c : tone === "grey" ? "var(--panel)" : c.dim;
        el.style.border = `3px ${dash ? "dashed" : "solid"} ${solid ? c.lip : c.edge}`;
        el.style.boxShadow = dash ? "none" : `0 6px 0 ${solid ? c.lip : c.edge}`;
        el.style.color = solid ? c.on : tone === "grey" ? "var(--ink)" : c.ink;
        sub.style.color = solid ? c.on : tone === "grey" ? "var(--text-dim)" : c.ink;
        setText(title, st.title);
        setText(sub, st.sub);
        sub.style.display = sub.textContent ? "" : "none";
        ring.style.borderColor = st.ring ? T(st.ring).c : "transparent";
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: (st.s ?? 1) * pop(k), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  };

  // ---------- 2. frame ----------
  D15.frame = (parent, o = {}) => {
    const { x = 0, y = 0, w = 300, h = 200 } = o;
    const el = V.h("div", {
      style: { ...abs(x, y, w, h), boxSizing: "border-box", borderRadius: "26px", border: "4px dashed var(--line-2)" },
    });
    parent.append(el);
    const lab = D4.tag(parent, { x: x + w / 2, y, text: o.label || "", tone: o.tone || "grey", solid: false });
    return {
      el,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        const tone = st.tone || o.tone || "grey";
        el.style.borderColor = tone === "grey" ? "var(--line-2)" : T(tone).c;
        V.place(el, { o: k * (st.o ?? 1), s: 0.96 + 0.04 * E.out(k) });
        lab.set({ k, o: st.o ?? 1, tone, text: st.label ?? o.label ?? "" });
        lab.inner.style.background = "var(--panel)";
      },
    };
  };

  // ---------- 3. terminal ----------
  D15.term = (parent, o = {}) => {
    const { x = 0, y = 0, w = 520, h = 600, n = 12, fs = 28, lh = 40 } = o;
    const el = V.h("div", {
      style: {
        ...abs(x, y, w, h),
        boxSizing: "border-box",
        borderRadius: "22px",
        border: "3px solid var(--line-2)",
        boxShadow: "0 6px 0 var(--line-2)",
        background: "var(--panel-2)",
        overflow: "hidden",
      },
    });
    const bar = V.h("div", {
      style: { ...abs(0, 0, w - 6, 40), background: "var(--line-2)", display: "flex", alignItems: "center" },
    });
    ["red", "orange", "green"].forEach((tn, i) =>
      bar.append(
        V.h("div", {
          style: { ...abs(18 + i * 30, 11, 18, 18), borderRadius: "50%", background: T(tn).c },
        }),
      ),
    );
    el.append(bar);
    const rows = Array.from({ length: n }, (_, i) => {
      const hi = V.h("div", { style: { position: "absolute", borderRadius: "10px", display: "none" } });
      const line = V.h("div", {
        class: "v-mono",
        style: {
          ...abs(16, 52 + i * lh, w - 38, lh),
          fontSize: `${fs}px`,
          lineHeight: `${lh}px`,
          whiteSpace: "pre",
          color: "var(--ink)",
        },
      });
      el.append(hi, line);
      return { line, hi, top: 52 + i * lh };
    });
    parent.append(el);
    const cw = fs * 0.6; // a monospace character is about 0.6 em wide
    return {
      el,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        V.place(el, { o: k, y: (1 - k) * 12 });
        const ls = st.lines || [];
        rows.forEach((r, i) => {
          const L = ls[i];
          const txt = L ? V.type(L.text, L.k ?? 1) : "";
          setText(r.line, txt);
          r.line.style.color = L && L.tone ? T(L.tone).ink : "var(--ink)";
          r.hi.style.display = "none";
        });
        (st.hi || []).forEach((h0) => {
          const r = rows[h0.line];
          const L = ls[h0.line];
          if (!r || !L || (L.k ?? 1) < 1 || (h0.k ?? 1) <= 0) return;
          const c = T(h0.tone || "orange");
          Object.assign(r.hi.style, {
            ...abs(16 + h0.from * cw - 6, r.top + 2, (h0.to - h0.from) * cw + 12, lh - 4),
            display: "block",
            background: c.c,
            opacity: f1(clamp(h0.k ?? 1)),
          });
          r.line.style.color = "var(--ink)";
        });
      },
    };
  };

  // ---------- 4. cells ----------
  D15.cells = (parent, o = {}) => {
    const { x = 0, y = 0, n = 8, cols = 4, size = 22, gap = 6, tone = "blue" } = o;
    const rowsN = Math.ceil(n / cols);
    const els = Array.from({ length: n }, (_, i) => {
      const el = V.h("div", {
        style: {
          ...abs(x + (i % cols) * (size + gap), y + Math.floor(i / cols) * (size + gap), size, size),
          boxSizing: "border-box",
          borderRadius: `${Math.round(size * 0.25)}px`,
        },
      });
      parent.append(el);
      return el;
    });
    return {
      w: cols * size + (cols - 1) * gap,
      h: rowsN * size + (rowsN - 1) * gap,
      set(fn) {
        els.forEach((el, i) => {
          const st = fn(i);
          if (!st || (st.k ?? 1) <= 0) {
            el.style.display = "none";
            return;
          }
          el.style.display = "";
          const c = T(st.tone || tone);
          el.style.background = c.c;
          el.style.border = `2px solid ${c.lip}`;
          V.place(el, { s: E.pop(clamp(st.k ?? 1)), o: Math.min(1, (st.k ?? 1) * 3) });
        });
      },
    };
  };
})();

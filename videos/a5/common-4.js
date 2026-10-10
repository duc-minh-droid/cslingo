/* Phase 5 · Convex Hulls: a pale grid (scene 3) and a card of text rows (the cross-product sum of scene 3, the pair counts of scene 9).
   VID.a5, short name A5. Same rules as common-2.js: pure calls, parent pixels (stage 936 x 640), nothing remembered between frames.

   A5.grid(parent, {x, y, cols = 7, rows = 5, u = 72}) -> g     a pale grid of cols x rows squares of u px, in MATHS orientation: grid
       point (0, 0) is its bottom-left corner and y grows UP. x, y = the stage px of the TOP-left corner of the grid.
       g.xy(gx, gy) -> [px, py]   stage px of grid point (gx, gy), e.g. A5.grid(stage, {x: 36, y: 40}).xy(2, 0) = [180, 400]
       g.update({o = 1, k = 1})   o opacity; k 0..1 draws the lines on (the axes first)         g.el  g.width  g.height
       The grid has no numbers (labels would be under 28 px); the learner counts squares. Use it with a plot built from
       pos: {p: g.xy(2, 0), a: g.xy(5, 1), b: g.xy(3, 4)} (letters "p", "a", "b" are 28 px: pass letters in `pos` names).
   A5.sheet(parent, {x, y, w = 360, rows = 3, rowH = 58, fs = 32, pad = 20, tone = "grey"}) -> s     a card holding `rows` lines of text
       that appear one at a time. x, y = top-left. Height = rows * rowH + 2 * pad (s.height).
       s.set(i, {text, tone, k = 1, o, bold})   line i (0-based): text (use "x" or the real signs: "×", "−", "="), tone = ink colour of
                                                the text (default the card's), k 0..1 slides/fades it in, bold true = 900 weight.
       s.card({tone, solid, o, k})                the card itself: tone ("grey" default; "green" tints it green), solid true fills it.
       s.el the card element  s.rowY(i) -> stage y of the middle of line i. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const tn = (t) => {
    if (!A5.TONES.includes(t)) throw new Error(`VID.a5: unknown tone "${t}" (use ${A5.TONES.join(", ")})`);
    return t;
  };
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    ...(w != null ? { width: `${f1(w)}px` } : {}),
    ...(h != null ? { height: `${f1(h)}px` } : {}),
  });

  // ---------- grid ----------
  function grid(parent, o = {}) {
    const { x = 0, y = 0, cols = 7, rows = 5, u = 72 } = o;
    const svg = V.s("svg", { width: 936, height: 640 });
    Object.assign(svg.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const lines = [];
    for (let i = 0; i <= cols; i++) lines.push({ x0: x + i * u, y0: y, x1: x + i * u, y1: y + rows * u, axis: i === 0 });
    for (let j = 0; j <= rows; j++) lines.push({ x0: x, y0: y + j * u, x1: x + cols * u, y1: y + j * u, axis: j === rows });
    const els = lines.map((l) => {
      const e = V.s("path", { d: `M${f1(l.x0)} ${f1(l.y0)}L${f1(l.x1)} ${f1(l.y1)}`, fill: "none", "stroke-linecap": "round", pathLength: "1" });
      e.style.stroke = l.axis ? "var(--line-2)" : "var(--line)";
      e.style.strokeWidth = l.axis ? "5px" : "3px";
      svg.append(e);
      return e;
    });
    parent.append(svg);
    return {
      el: svg,
      width: cols * u,
      height: rows * u,
      xy: (gx, gy) => [x + gx * u, y + (rows - gy) * u],
      update(st = {}) {
        const k = clamp(st.k ?? 1);
        els.forEach((e, i) => {
          const p = clamp(k * 1.6 - (lines[i].axis ? 0 : 0.6) * (i / els.length));
          e.style.strokeDasharray = p >= 0.999 ? "" : `${p.toFixed(4)} 2`;
          V.show(e, p < 0.003 ? 0 : (st.o ?? 1));
        });
      },
    };
  }

  // ---------- sheet of text rows ----------
  function sheet(parent, o = {}) {
    const { x = 0, y = 0, w = 360, rows = 3, rowH = 58, fs = 32, pad = 20, tone: base = "grey" } = o;
    const height = rows * rowH + 2 * pad;
    const el = V.h("div", { class: `v-card plain c-${tn(base)}`, style: { ...abs(x, y, w, height), borderRadius: "22px" } });
    const lines = Array.from({ length: rows }, (_, i) =>
      V.h("div", {
        class: "v-text",
        style: { ...abs(24, pad + i * rowH, w - 48, rowH), lineHeight: `${rowH}px`, fontSize: `${fs}px` },
      }),
    );
    el.append(...lines);
    parent.append(el);
    return {
      el,
      height,
      rowY: (i) => y + pad + i * rowH + rowH / 2,
      card(st = {}) {
        const tone = tn(st.tone || base);
        const cls = `v-card ${st.solid ? "" : "plain "}c-${tone}`;
        if (el.className !== cls) el.className = cls;
        Object.assign(el.style, {
          background: st.solid ? "var(--c)" : tone === "grey" ? "" : "var(--c-dim)",
          borderColor: st.solid ? "var(--c-lip)" : "",
          boxShadow: st.solid ? "0 6px 0 var(--c-lip)" : "",
        });
        const k = clamp(st.k ?? 1);
        V.place(el, { s: 0.85 + 0.15 * E.pop(k), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
      set(i, st = {}) {
        const e = lines[i];
        const tone = st.tone ? tn(st.tone) : null;
        e.className = `v-text${tone ? ` c-${tone}` : ""}`;
        e.style.color = tone ? "var(--c-ink)" : "";
        e.style.fontWeight = st.bold ? "900" : "";
        if (st.text != null && e.textContent !== String(st.text)) e.textContent = String(st.text);
        const k = clamp(st.k ?? 1);
        V.place(e, { y: (1 - E.out(k)) * 10, o: Math.min(1, k * 3) * (st.o ?? 1) });
      },
    };
  }

  Object.assign(A5, { grid, sheet });
})();

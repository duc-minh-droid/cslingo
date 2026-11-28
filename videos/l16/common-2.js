/* Lecture 16 · Neural networks: the drawing helpers the scenes share (VID.l16, short name L16). Everything else is reused from
   Lecture 13 (the page loads l5/common.js and l13/common*.js): L13.plot, L13.tag, L13.stat, L13.card, L13.label, L13.chip,
   L13.arrow, L13.mark (see their header comments). EVERY CALL IS PURE: call set() each frame with everything you want to see.

   COLOUR ROLES of THIS video (videos/_plan/lecture-16.json): green = fires / output 1 / correct / the brain side / the fit
   score; blue = inputs, the network's guess, the computer side; purple = the neuron itself and the hidden layer; orange =
   attention (the held-out storm, the mutated weight, the error MAE, lightning); red = inhibit / negative weight / a switched-off
   neuron / a rule that breaks; grey = neutral (silent neuron, the dashed real flow, unused items).

   L16.card(parent, o)          L13.card that keeps "\n" line breaks (same set API)
   L16.step(t, t0, dt, n)       integer 0..n: which item of a timed sequence is showing
   L16.text(svg, {x, y, text, fs: 28, anchor: "middle", tone: "grey", weight: 800, halo}) -> <text>; t.set({text, tone, o})
   L16.node(svg, {x, y, r: 40, fs: 30}) -> {set({tone, solid, text, k, o, s})}   a neuron circle with a centred label
   L16.wire(svg) -> {set({a: [x, y], b: [x, y], tone, w: 6, k: 1, o: 1, dash})}   a straight connection
   L16.sigma(svg, x, y, size, tone), L16.geq(...), L16.eps(...) -> <path>   the symbols Σ, ≥ and ε drawn as strokes
   L16.bolt(svg, x, y, h, tone = "orange") -> <path>  a lightning bolt, tip at (x, y + h)
   L16.plot(stage, o)          L13.plot preset for the storm: x 12, y 12, 600 x 616, time 0..1, flow -0.2..1.2
   L16.pts(P)                   storm curve values -> plot points [[time, flow]], clipped to the plot
   L16.grid(parent, {x, y, cols: [{w, head}], rows, rowH: 70, gap: 8, cellH: 58, fs: 30}) -> {heads, cells[r][c]} a table of
                                L13 chips with L13 labels as column heads */
(function () {
  const V = window.VID;
  const L16 = V.l16;
  const L13 = V.l13;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);

  L16.card = (parent, o) => {
    const c = L13.card(parent, o);
    Object.assign(c.el.style, {
      whiteSpace: "pre-line",
      lineHeight: "1.2",
      padding: "0 10px",
      boxSizing: "border-box",
    });
    return c;
  };
  L16.step = (t, t0, dt, n) => Math.max(0, Math.min(n, Math.floor((t - t0) / dt)));

  L16.text = (svg, o) => {
    const el = svg.appendChild(V.s("text", { x: f1(o.x), y: f1(o.y), "text-anchor": o.anchor || "middle" }));
    el.style.font = `${o.weight || 800} ${o.fs || 28}px Nunito, sans-serif`;
    el.style.stroke = o.halo ? "var(--panel)" : "none";
    if (o.halo) Object.assign(el.style, { strokeWidth: "10px", paintOrder: "stroke", strokeLinejoin: "round" });
    const base = o.tone || "grey";
    el.set = (st = {}) => {
      const tone = st.tone || base;
      el.style.fill = tone === "grey" ? "var(--text-dim)" : L13.tone(tone).ink;
      const txt = String(st.text ?? o.text ?? "");
      if (el.textContent !== txt) el.textContent = txt;
      el.setAttribute("opacity", clamp(st.o ?? 1).toFixed(3));
    };
    el.set();
    return el;
  };

  L16.node = (svg, o) => {
    const { x, y, r = 40, fs = 30 } = o;
    const g = svg.appendChild(V.s("g", {}));
    const c = g.appendChild(V.s("circle", { cx: 0, cy: 0, r, "stroke-width": 4 }));
    const t = g.appendChild(V.s("text", { x: 0, y: f1(fs * 0.36), "text-anchor": "middle" }));
    t.style.font = `900 ${fs}px Nunito, sans-serif`;
    t.style.stroke = "none";
    return {
      g,
      set(st = {}) {
        const tn = L13.tone(st.tone || "grey");
        const solid = st.solid ?? true;
        c.style.fill = solid ? tn.c : "var(--panel)";
        c.style.stroke = solid ? tn.lip : tn.c;
        t.style.fill = solid ? tn.on : tn.ink;
        const txt = String(st.text ?? "");
        if (t.textContent !== txt) t.textContent = txt;
        const k = clamp(st.k ?? 1);
        const s = (st.s ?? 1) * (0.6 + 0.4 * E.pop(k));
        g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${Math.max(0.001, s).toFixed(3)})`);
        g.setAttribute("opacity", (Math.min(1, k * 4) * (st.o ?? 1)).toFixed(3));
      },
    };
  };

  L16.wire = (svg) => {
    const l = svg.appendChild(V.s("line", { "stroke-linecap": "round" }));
    return {
      el: l,
      set(st = {}) {
        const [a, b] = [st.a || [0, 0], st.b || [0, 0]];
        const k = clamp(st.k ?? 1);
        l.setAttribute("x1", f1(a[0]));
        l.setAttribute("y1", f1(a[1]));
        l.setAttribute("x2", f1(a[0] + (b[0] - a[0]) * k));
        l.setAttribute("y2", f1(a[1] + (b[1] - a[1]) * k));
        l.setAttribute("stroke-width", f1(st.w ?? 6));
        l.setAttribute("stroke-dasharray", st.dash ? "12 9" : "none");
        l.style.stroke = (st.tone || "grey") === "grey" ? "var(--line)" : L13.tone(st.tone).c;
        l.setAttribute("opacity", (k > 0 ? clamp(st.o ?? 1) : 0).toFixed(3));
      },
    };
  };

  const stroke = (svg, d, w, tone) => {
    const p = svg.appendChild(V.s("path", { d, fill: "none", "stroke-width": w, "stroke-linecap": "round" }));
    p.setAttribute("stroke-linejoin", "round");
    p.style.stroke = tone === "grey" ? "var(--text-dim)" : L13.tone(tone).ink;
    return p;
  };
  /** Σ centred on x, y, size = height. */
  L16.sigma = (svg, x, y, size, tone = "purple") => {
    const h = size / 2,
      w = size * 0.36;
    return stroke(
      svg,
      `M${f1(x + w)} ${f1(y - h)} H${f1(x - w)} L${f1(x + w * 0.2)} ${f1(y)} L${f1(x - w)} ${f1(y + h)} H${f1(x + w)}`,
      size * 0.13,
      tone,
    );
  };
  /** ≥ centred on x, y. */
  L16.geq = (svg, x, y, size, tone = "purple") => {
    const h = size * 0.32,
      w = size * 0.3;
    return stroke(
      svg,
      `M${f1(x - w)} ${f1(y - h - 6)} L${f1(x + w)} ${f1(y - 6)} L${f1(x - w)} ${f1(y + h - 6)} M${f1(x - w)} ${f1(y + h + 6)} H${f1(x + w)}`,
      size * 0.12,
      tone,
    );
  };
  /** ε centred on x, y. */
  L16.eps = (svg, x, y, size, tone = "orange") => {
    const s = size / 2;
    return stroke(
      svg,
      `M${f1(x + s * 0.6)} ${f1(y - s * 0.7)} C${f1(x - s * 0.2)} ${f1(y - s * 1.1)} ${f1(x - s * 0.9)} ${f1(y - s * 0.3)} ${f1(x - s * 0.1)} ${f1(y)}` +
        ` C${f1(x - s * 1.0)} ${f1(y + s * 0.2)} ${f1(x - s * 0.4)} ${f1(y + s * 1.1)} ${f1(x + s * 0.6)} ${f1(y + s * 0.7)}` +
        ` M${f1(x - s * 0.1)} ${f1(y)} H${f1(x + s * 0.4)}`,
      size * 0.13,
      tone,
    );
  };
  L16.bolt = (svg, x, y, h, tone = "orange") => {
    const u = h / 10;
    const p = svg.appendChild(
      V.s("path", {
        d: `M${f1(x + 2 * u)} ${f1(y)} L${f1(x - 3 * u)} ${f1(y + 5.5 * u)} L${f1(x)} ${f1(y + 5.5 * u)} L${f1(x - 2 * u)} ${f1(y + 10 * u)} L${f1(x + 4 * u)} ${f1(y + 3.8 * u)} L${f1(x + u)} ${f1(y + 3.8 * u)} L${f1(x + 3.5 * u)} ${f1(y)} Z`,
        "stroke-width": 4,
        "stroke-linejoin": "round",
      }),
    );
    p.style.fill = L13.tone(tone).c;
    p.style.stroke = L13.tone(tone).lip;
    return p;
  };

  L16.plot = (stage, o = {}) =>
    L13.plot(stage, {
      x: 12,
      y: 12,
      w: 600,
      h: 616,
      xr: [0, 1],
      yr: [-0.2, 1.2],
      xt: [0, 0.5, 1],
      yt: [0, 0.5, 1],
      xl: "time",
      yl: "flow",
      dots: 0,
      boxes: 0,
      links: 0,
      ...o,
    });
  L16.pts = (P) => L16.XS.map((x, i) => [x, clamp(P[i], -0.2, 1.2)]);

  L16.grid = (parent, o) => {
    const { x, y, cols, rows, rowH = 70, gap = 8, cellH = 58, fs = 30 } = o;
    const xs = [];
    cols.reduce((acc, c) => (xs.push(acc), acc + c.w + gap), x);
    const heads = cols.map((c, i) =>
      L13.label(parent, { x: xs[i] - 10, y, w: c.w + 20, text: c.head || "", bold: true, tone: c.tone || "grey" }),
    );
    const cells = Array.from({ length: rows }, (_, r) =>
      cols.map((c, i) => L13.chip(parent, { x: xs[i], y: y + 48 + r * rowH, w: c.w, h: cellH, fs, text: "" })),
    );
    return { heads, cells, xs };
  };
})();

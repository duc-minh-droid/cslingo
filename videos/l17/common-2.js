/* Lecture 17 · Spiking neural networks: the drawing helpers shared by the scenes (VID.l17, short name L17). Reuses
   videos/l5/common.js (svg, tick) and videos/l13/common-2.js (tag, stat, card, label, arrow, seq, tone). Every call is pure:
   call set() each frame with everything you want to see.

   COLOUR ROLES of THIS video (videos/_plan/lecture-17.json): orange = a spike (ticks, firing neurons, lit wires); blue = input
   and charge (sensor trains, the charge trace, the pre-synaptic neuron); green = what Pip needs / what works (the SNN side,
   potentiation, a usable slope); red = the threshold line, the costly ANN side, depression, "no gradient"; purple = the
   surrogate curve and the structure (upper level); grey = neutral (silent neurons, axes, idle steps).

   L17.svg(stage) -> a full-stage <svg> (936 x 640)
   L17.text(svg, {x, y, text, fs: 28, tone, anchor: "start", weight: 800}) -> {el, set({text, tone, o, dx, dy})}
        tone undefined = ink, "grey" = the dim text colour, any other tone = its -ink shade
   L17.raster(svg, {x: 12, y, w: 912, labW: 180, cntW: 0, n: 20, rows: 1, rh: 60, labs: [], time: false})
        -> {x0, x1, dx, colX(step 1..n), rowY(i), set(i, {train, upto: n, tone: "orange", lab, labTone, cnt, cntTone}),
            head({upto, o}), o(k)}   ticks pop in as the playhead (upto, in steps) passes their centre
   L17.node(svg, {x, y, r: 34, lab, fs}) -> {set({tone: "grey", solid, k, s, o})}   a neuron with a lip
   L17.wire(svg) -> {set({a, b, tone: "grey", w: 5, o})}
   L17.pip(svg) -> {set({x, y, s, o, roll})}   Pip the rover, facing right; x, y = the middle of its ground line
   L17.battery(svg, {x, y, w, h}) -> {set({level, o})}   green above half, red below
   L17.card(parent, o) -> L13.card that keeps newline line breaks (same set API)
   L17.dot(svg, r, tone) -> a filled circle with a lip-coloured stroke;  L17.path(svg) -> {set({d, tone, w, dash, o, k})} */
(function () {
  const V = window.VID;
  const L17 = V.l17;
  const L13 = V.l13;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const T = (n) => L13.tone(n);
  const colour = (tone) => (!tone ? "var(--ink)" : tone === "grey" ? "var(--text-dim)" : T(tone).ink);
  const vis = (el, op) => {
    el.style.visibility = op <= 0.001 ? "hidden" : "";
    el.setAttribute("opacity", clamp(op).toFixed(3));
  };

  L17.svg = (stage) => L5.svg(stage, 936, 640);
  L17.f1 = f1;
  L17.vis = vis;

  L17.text = (svg, o) => {
    const el = svg.appendChild(
      V.s("text", {
        x: o.x,
        y: o.y,
        "text-anchor": o.anchor || "start",
        "font-size": o.fs || 28,
        "font-weight": o.weight || 800,
      }),
    );
    el.textContent = o.text || "";
    el.style.fill = colour(o.tone);
    return {
      el,
      set(st = {}) {
        if (st.text != null && el.textContent !== String(st.text)) el.textContent = String(st.text);
        el.style.fill = colour(st.tone === undefined ? o.tone : st.tone);
        vis(el, st.o ?? 1);
        el.setAttribute("transform", `translate(${f1(st.dx || 0)} ${f1(st.dy || 0)})`);
      },
    };
  };

  L17.dot = (svg, r, tone) => {
    const c = svg.appendChild(V.s("circle", { r, "stroke-width": 3 }));
    c.style.fill = T(tone).c;
    c.style.stroke = T(tone).lip;
    return c;
  };

  L17.path = (svg) => {
    const p = svg.appendChild(
      V.s("path", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: "1" }),
    );
    return {
      el: p,
      set(st = {}) {
        if (st.d && p.getAttribute("d") !== st.d) p.setAttribute("d", st.d);
        p.style.stroke = st.tone === "ink" ? "var(--text-dim)" : T(st.tone || "grey").c;
        p.setAttribute("stroke-width", st.w || 5);
        const k = clamp(st.k ?? 1);
        if (st.dash) p.setAttribute("stroke-dasharray", "0.012 0.012");
        else p.setAttribute("stroke-dasharray", k >= 1 ? "none" : `${k.toFixed(4)} 1`);
        vis(p, (st.o ?? 1) * (k > 0 ? 1 : 0));
      },
    };
  };

  // ---------- spike raster ----------
  L17.raster = (svg, o = {}) => {
    const { x = 12, y = 0, w = 912, labW = 180, cntW = 0, n = 20, rows = 1, rh = 60 } = o;
    const x0 = x + labW;
    const x1 = x + w - cntW;
    const dx = (x1 - x0) / n;
    const g = svg.appendChild(V.s("g"));
    const colX = (s) => x0 + (s - 0.5) * dx;
    const rowY = (i) => y + i * rh;
    const tw = Math.min(14, dx * 0.45);
    const R = Array.from({ length: rows }, (_, i) => {
      const ry = rowY(i);
      const base = g.appendChild(V.s("line", { x1: x0, x2: x1, y1: ry + rh - 8, y2: ry + rh - 8, "stroke-width": 3 }));
      base.style.stroke = "var(--line-2)";
      const lab = L17.text(g, { x, y: ry + rh / 2 + 10, text: (o.labs || [])[i] || "" });
      const ticks = Array.from({ length: n }, (_, t) =>
        g.appendChild(V.s("rect", { x: f1(colX(t + 1) - tw / 2), width: f1(tw), rx: 4, "stroke-width": 2 })),
      );
      const cnt = L17.text(g, {
        x: x1 + cntW / 2,
        y: ry + rh / 2 + 14,
        text: "",
        anchor: "middle",
        fs: 36,
        weight: 900,
      });
      return { ry, lab, ticks, cnt };
    });
    const head = g.appendChild(
      V.s("line", { y1: y - 4, y2: y + rows * rh, "stroke-width": 4, "stroke-linecap": "round" }),
    );
    head.style.stroke = "var(--text-dim)";
    head.style.visibility = "hidden";
    if (o.time) {
      L17.text(g, { x: x1 - 52, y: y + rows * rh + 30, text: "time", anchor: "end", tone: "grey" });
      L13.arrow(g, { tone: "grey", w: 4, head: 14 }).set({
        a: [x1 - 44, y + rows * rh + 20],
        b: [x1, y + rows * rh + 20],
      });
    }
    return {
      g,
      x0,
      x1,
      dx,
      colX,
      rowY,
      set(i, st = {}) {
        const r = R[i];
        const upto = st.upto ?? n;
        const tone = T(st.tone || "orange");
        const full = rh - 22;
        const base = r.ry + rh - 10;
        r.ticks.forEach((el, t) => {
          const k = st.train && st.train[t] ? clamp((upto - t - 0.5) * 2.5) : 0;
          if (k <= 0) {
            el.style.visibility = "hidden";
            return;
          }
          const hh = full * E.out(k);
          el.style.visibility = "";
          el.setAttribute("y", f1(base - hh));
          el.setAttribute("height", f1(hh));
          el.style.fill = tone.c;
          el.style.stroke = tone.lip;
        });
        r.lab.set({ text: st.lab, tone: st.labTone });
        r.cnt.set({ text: st.cnt ?? "", tone: st.cntTone || st.tone || "orange", o: st.cntO ?? 1 });
      },
      head(st = {}) {
        vis(head, st.o ?? 0);
        const hx = x0 + clamp(st.upto ?? 0, 0, n) * dx;
        head.setAttribute("x1", f1(hx));
        head.setAttribute("x2", f1(hx));
      },
      o(k) {
        vis(g, k);
      },
    };
  };

  // ---------- neurons and wires ----------
  L17.node = (svg, o) => {
    const { x, y, r = 34 } = o;
    const fs = o.fs || 28;
    const g = svg.appendChild(V.s("g"));
    const lip = g.appendChild(V.s("circle", { cx: 0, cy: 5, r }));
    const body = g.appendChild(V.s("circle", { cx: 0, cy: 0, r, "stroke-width": 3 }));
    const lab = g.appendChild(
      V.s("text", { x: 0, y: fs * 0.36, "text-anchor": "middle", "font-size": fs, "font-weight": 900 }),
    );
    lab.textContent = o.lab || "";
    return {
      g,
      x,
      y,
      r,
      set(st = {}) {
        const tone = st.tone || "grey";
        const t = T(tone);
        const solid = st.solid ?? tone !== "grey";
        body.style.fill = solid ? t.c : t.dim;
        body.style.stroke = solid ? t.lip : t.c;
        lip.style.fill = solid ? t.lip : t.c;
        lab.style.fill = solid ? t.on : "var(--ink)";
        const k = clamp(st.k ?? 1);
        const s = (st.s ?? 1) * (0.6 + 0.4 * E.pop(k));
        vis(g, Math.min(1, k * 3) * (st.o ?? 1));
        g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)})`);
      },
    };
  };
  L17.wire = (svg) => {
    const l = svg.appendChild(V.s("line", { "stroke-linecap": "round" }));
    return {
      el: l,
      set(st = {}) {
        const [a, b] = [st.a || [0, 0], st.b || [0, 0]];
        l.setAttribute("x1", f1(a[0]));
        l.setAttribute("y1", f1(a[1]));
        l.setAttribute("x2", f1(b[0]));
        l.setAttribute("y2", f1(b[1]));
        l.setAttribute("stroke-width", f1(st.w || 5));
        l.style.stroke = T(st.tone || "grey").c;
        vis(l, st.o ?? 1);
      },
    };
  };

  // ---------- Pip the rover ----------
  L17.pip = (svg) => {
    const g = svg.appendChild(V.s("g"));
    const G = T("green");
    const add = (tag, attrs, fill, stroke) => {
      const e = g.appendChild(V.s(tag, attrs));
      if (fill) e.style.fill = fill;
      if (stroke) e.style.stroke = stroke;
      return e;
    };
    add(
      "line",
      { x1: -30, y1: -70, x2: -40, y2: -98, "stroke-width": 5, "stroke-linecap": "round" },
      null,
      "var(--ink)",
    );
    add("circle", { cx: -40, cy: -102, r: 9, "stroke-width": 3 }, T("blue").c, T("blue").lip);
    add("rect", { x: -62, y: -66, width: 124, height: 50, rx: 18 }, G.lip);
    add("rect", { x: -62, y: -72, width: 124, height: 50, rx: 18, "stroke-width": 3 }, G.c, G.lip);
    add("circle", { cx: 26, cy: -50, r: 11, "stroke-width": 3 }, "var(--panel)", "var(--ink)");
    add("circle", { cx: 29, cy: -50, r: 4 }, "var(--ink)");
    add(
      "path",
      { d: "M60 -40 L96 -56 M60 -34 L98 -30", fill: "none", "stroke-width": 4, "stroke-linecap": "round" },
      null,
      "var(--ink)",
    );
    const W = [-34, 34];
    const wheels = W.map((wx) => {
      add("circle", { cx: wx, cy: -17, r: 17, "stroke-width": 3 }, "var(--ink)", "var(--ink)");
      return add(
        "path",
        { d: "M-10 0 H10 M0 -10 V10", "stroke-width": 4, "stroke-linecap": "round" },
        null,
        "var(--panel)",
      );
    });
    return {
      g,
      set(st = {}) {
        vis(g, st.o ?? 1);
        g.setAttribute("transform", `translate(${f1(st.x || 0)} ${f1(st.y || 0)}) scale(${(st.s ?? 1).toFixed(3)})`);
        const deg = ((st.roll || 0) * 180) / Math.PI;
        wheels.forEach((w, i) => w.setAttribute("transform", `translate(${W[i]} -17) rotate(${f1(deg)})`));
      },
    };
  };

  // ---------- battery ----------
  L17.battery = (svg, o) => {
    const { x, y, w, h } = o;
    const g = svg.appendChild(V.s("g"));
    const lip = g.appendChild(V.s("rect", { x, y: y + 5, width: w, height: h, rx: 16 }));
    lip.style.fill = "var(--line-2)";
    const shell = g.appendChild(V.s("rect", { x, y, width: w, height: h, rx: 16, "stroke-width": 4 }));
    shell.style.fill = "var(--panel)";
    shell.style.stroke = "var(--line-2)";
    const nub = g.appendChild(V.s("rect", { x: x + w, y: y + h * 0.3, width: 14, height: h * 0.4, rx: 4 }));
    nub.style.fill = "var(--line-2)";
    const fill = g.appendChild(V.s("rect", { x: x + 10, y: y + 10, height: h - 20, rx: 8 }));
    return {
      g,
      set(st = {}) {
        const lv = clamp(st.level ?? 1);
        fill.setAttribute("width", f1((w - 20) * lv));
        fill.style.fill = T(lv >= 0.5 ? "green" : "red").c;
        vis(g, st.o ?? 1);
      },
    };
  };

  // ---------- multi-line card ----------
  L17.card = (parent, o) => {
    const c = L13.card(parent, o);
    Object.assign(c.el.style, {
      whiteSpace: "pre-line",
      lineHeight: "1.25",
      padding: "0 14px",
      boxSizing: "border-box",
    });
    return c;
  };
  /** Layout guard: x positions for tags in a row (gap px between), asserted to end inside the stage. */
  L17.row = (texts, x0, gap, fs = 28, xMax = 924) => {
    let x = x0;
    const xs = texts.map((t) => {
      const at = x;
      x += L13.tagW(t, fs) + gap;
      return at;
    });
    L17.same(x - gap <= xMax, true, `tag row "${texts.join(" | ")}" ends at ${x - gap}, past ${xMax}`);
    return xs;
  };
})();

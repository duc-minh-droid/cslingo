/* Lecture 18 · Neuromorphic computing: small SVG pictograms shared by the scenes (VID.l18). Needs l5/common.js,
   l13/common*.js and l18/common.js first. Every builder APPENDS to the svg you give it and returns the element (a <g> unless
   said otherwise), drawn at absolute stage coordinates, so V.place(g, {x, y, s, o}) moves / scales / fades it from there.
   Colours come from L13.tone (CSLingo tokens): c = fill, lip = sticker edge, dim = tint, ink = text. No white anywhere.

   COLOUR ROLES of THIS video: orange = the conventional side (von Neumann chip, clocked chip, frame camera); green = the
   neuromorphic side (synapses, event-driven chip, event camera, best setting); purple = spikes; blue = data, memory, big
   machines, deep learning; red = problems and costs; grey = neutral.

   L18.paint(el, tone, fill = "c")   fill (c | dim | none) and lip stroke;  L18.op(el, k) opacity 0..1 (hidden at 0)
   L18.rect(svg, {x, y, w, h, rx: 14, tone, fill: "dim", sw: 4}) -> <rect>;  L18.line(svg, a, b, tone, w) -> <line>
   L18.circ(svg, x, y, r, tone, fill = "c") -> <circle>
   L18.battery(svg, x, y, w, h) -> {g, set({level 0..1, tone})}       a horizontal battery with a cap on the right
   L18.camera(svg, x, y, s)     Hoglet: a camera box on a post (x, y = top-left of the box, 120 x 80 at s 1, post 150 below)
   L18.hedgehog(svg, x, y, s, tone = "grey")   a spiky dome facing right, x, y = centre of its base, about 90 wide at s 1
   L18.bell(svg, x, y, s, tone)  a doorbell (round push button on a plate), centred, 60 x 80 at s 1
   L18.chip(svg, x, y, size, tone, n = 0) -> {g, cells}  a square chip with pins; n x n core squares inside (cells row by row)
   L18.scroll(svg, x, y, w, h, tone = "grey")   a paper scroll with rolled ends (text goes on top as HTML)
   L18.watch(svg, x, y, r, tone)  a stopwatch;  L18.flask(svg, x, y, s, tone);  L18.cursor(svg, x, y, s)  a mouse pointer
   L18.car(svg, x, y, s, tone)   a small car, x, y = centre;  L18.wave(svg, x, y, w, h, tone, n = 3) -> <path> a wavy signal
   L18.spike(svg, x, y, h, tone = "purple", w = 7) -> <line> a vertical tick standing on (x, y)
   L18.card(parent, o) -> L13.card (HTML) whose text keeps "\n" line breaks; same set() API
   L18.tile(parent, {x, y, w, h, label, tone, fs: 46}) -> {el, set({text, tone, k, bump})}  label on top, big value below */
(function () {
  const V = window.VID;
  const L18 = V.l18;
  const L13 = V.l13;
  const T = (n) => L13.tone(n);
  const f1 = (n) => (+n).toFixed(1);

  L18.paint = (el, tone, fill = "c") => {
    el.style.fill = fill === "none" ? "none" : T(tone)[fill];
    el.style.stroke = T(tone).lip;
    return el;
  };
  L18.op = (el, k) => {
    el.style.opacity = k >= 1 ? "" : Math.max(0, k).toFixed(3);
    el.style.visibility = k <= 0.001 ? "hidden" : "";
    return el;
  };
  const add = (p, tag, attrs) => p.appendChild(V.s(tag, attrs));
  L18.rect = (svg, { x, y, w, h, rx = 14, tone = "grey", fill = "dim", sw = 4 }) =>
    L18.paint(
      add(svg, "rect", { x: f1(x), y: f1(y), width: f1(w), height: f1(h), rx, "stroke-width": sw }),
      tone,
      fill,
    );
  L18.circ = (svg, x, y, r, tone, fill = "c") =>
    L18.paint(add(svg, "circle", { cx: f1(x), cy: f1(y), r: f1(r), "stroke-width": 4 }), tone, fill);
  L18.line = (svg, a, b, tone = "grey", w = 5) => {
    const l = add(svg, "line", {
      x1: f1(a[0]),
      y1: f1(a[1]),
      x2: f1(b[0]),
      y2: f1(b[1]),
      "stroke-width": w,
      "stroke-linecap": "round",
    });
    l.style.stroke = tone === "grey" ? "var(--line-2)" : T(tone).c;
    return l;
  };
  L18.spike = (svg, x, y, h, tone = "purple", w = 7) => L18.line(svg, [x, y], [x, y - h], tone, w);

  L18.battery = (svg, x, y, w, h) => {
    const g = add(svg, "g", {});
    L18.rect(g, { x, y, w, h, rx: 10, tone: "grey", fill: "dim", sw: 4 });
    L18.rect(g, { x: x + w, y: y + h * 0.3, w: 10, h: h * 0.4, rx: 3, tone: "grey", fill: "c", sw: 3 });
    const lvl = add(g, "rect", { x: x + 7, y: y + 7, height: h - 14, rx: 5 });
    return {
      g,
      set({ level = 1, tone = "green" } = {}) {
        lvl.setAttribute("width", f1(Math.max(0, (w - 14) * level)));
        lvl.style.fill = T(tone).c;
      },
    };
  };

  L18.camera = (svg, x, y, s = 1) => {
    const g = add(svg, "g", {});
    L18.rect(g, { x: x + 52 * s, y: y + 70 * s, w: 16 * s, h: 150 * s, rx: 4, tone: "grey", fill: "c", sw: 3 });
    L18.rect(g, { x, y, w: 120 * s, h: 80 * s, rx: 16 * s, tone: "grey", fill: "c", sw: 4 });
    L18.circ(g, x + 60 * s, y + 40 * s, 24 * s, "blue", "c");
    L18.circ(g, x + 60 * s, y + 40 * s, 10 * s, "grey", "dim");
    L18.circ(g, x + 102 * s, y + 16 * s, 6 * s, "red", "c");
    return g;
  };

  L18.hedgehog = (svg, x, y, s = 1, tone = "grey") => {
    const g = add(svg, "g", {});
    const w = 80 * s,
      h = 40 * s;
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI - (i * Math.PI) / 12;
      const R = i % 2 ? 1.3 : 1;
      pts.push(`${f1(x - 8 * s + Math.cos(a) * (w / 2) * R)},${f1(y - Math.sin(a) * h * R)}`);
    }
    L18.paint(add(g, "polygon", { points: pts.join(" "), "stroke-width": 3, "stroke-linejoin": "round" }), tone, "c");
    const snout = add(g, "path", {
      d: `M${f1(x + 22 * s)} ${f1(y)} Q${f1(x + 26 * s)} ${f1(y - 22 * s)} ${f1(x + 48 * s)} ${f1(y - 4 * s)} L${f1(x + 48 * s)} ${f1(y)} Z`,
      "stroke-width": 3,
      "stroke-linejoin": "round",
    });
    L18.paint(snout, tone, "dim");
    const nose = L18.circ(g, x + 48 * s, y - 3 * s, 4 * s, tone);
    nose.style.fill = "var(--ink)";
    const eye = L18.circ(g, x + 34 * s, y - 11 * s, 3 * s, tone);
    eye.style.fill = "var(--ink)";
    return g;
  };

  L18.bell = (svg, x, y, s = 1, tone = "green") => {
    const g = add(svg, "g", {});
    L18.rect(g, { x: x - 30 * s, y: y - 40 * s, w: 60 * s, h: 80 * s, rx: 14 * s, tone, fill: "dim", sw: 4 });
    L18.circ(g, x, y, 18 * s, tone, "c");
    return g;
  };

  L18.chip = (svg, x, y, size, tone, n = 0) => {
    const g = add(svg, "g", {});
    const pins = Math.max(3, Math.round(size / 26));
    for (let i = 0; i < pins; i++) {
      const p = x + ((i + 0.5) * size) / pins;
      const q = y + ((i + 0.5) * size) / pins;
      L18.line(g, [p, y - 12], [p, y], tone, 5);
      L18.line(g, [p, y + size], [p, y + size + 12], tone, 5);
      L18.line(g, [x - 12, q], [x, q], tone, 5);
      L18.line(g, [x + size, q], [x + size + 12, q], tone, 5);
    }
    L18.rect(g, { x, y, w: size, h: size, rx: 12, tone, fill: "dim", sw: 5 });
    const cells = [];
    if (n) {
      const pad = 10,
        gap = 5;
      const c = (size - 2 * pad - gap * (n - 1)) / n;
      for (let r = 0; r < n; r++)
        for (let k = 0; k < n; k++)
          cells.push(
            L18.rect(g, {
              x: x + pad + k * (c + gap),
              y: y + pad + r * (c + gap),
              w: c,
              h: c,
              rx: 3,
              tone,
              fill: "c",
              sw: 2,
            }),
          );
    }
    return { g, cells };
  };

  L18.scroll = (svg, x, y, w, h, tone = "grey") => {
    const g = add(svg, "g", {});
    L18.rect(g, { x, y: y + 8, w, h: h - 16, rx: 6, tone, fill: "dim", sw: 4 });
    L18.rect(g, { x: x - 8, y, w: w + 16, h: 18, rx: 9, tone, fill: "c", sw: 3 });
    L18.rect(g, { x: x - 8, y: y + h - 18, w: w + 16, h: 18, rx: 9, tone, fill: "c", sw: 3 });
    return g;
  };

  L18.watch = (svg, x, y, r, tone) => {
    const g = add(svg, "g", {});
    L18.rect(g, { x: x - 8, y: y - r - 16, w: 16, h: 14, rx: 3, tone, fill: "c", sw: 3 });
    L18.circ(g, x, y, r, tone, "dim");
    L18.line(g, [x, y], [x, y - r * 0.65], tone, 6);
    L18.line(g, [x, y], [x + r * 0.45, y + r * 0.2], tone, 6);
    return g;
  };

  L18.flask = (svg, x, y, s, tone) => {
    const g = add(svg, "g", {});
    const p = add(g, "path", {
      d: `M${f1(x - 10 * s)} ${f1(y - 34 * s)} V${f1(y - 8 * s)} L${f1(x - 30 * s)} ${f1(y + 28 * s)} H${f1(x + 30 * s)} L${f1(x + 10 * s)} ${f1(y - 8 * s)} V${f1(y - 34 * s)} Z`,
      "stroke-width": 4,
      "stroke-linejoin": "round",
    });
    L18.paint(p, tone, "dim");
    const liq = add(g, "path", {
      d: `M${f1(x - 19 * s)} ${f1(y + 10 * s)} L${f1(x - 28 * s)} ${f1(y + 26 * s)} H${f1(x + 28 * s)} L${f1(x + 19 * s)} ${f1(y + 10 * s)} Z`,
    });
    liq.style.fill = T(tone).c;
    return g;
  };

  L18.cursor = (svg, x, y, s = 1) => {
    const g = add(svg, "g", {});
    const p = add(g, "path", {
      d: `M${x} ${y} l0 ${f1(40 * s)} l${f1(10 * s)} ${f1(-9 * s)} l${f1(8 * s)} ${f1(17 * s)} l${f1(7 * s)} ${f1(-3 * s)} l${f1(-8 * s)} ${f1(-17 * s)} l${f1(14 * s)} 0 Z`,
      "stroke-width": 3,
      "stroke-linejoin": "round",
    });
    p.style.fill = "var(--ink)";
    p.style.stroke = "var(--panel)";
    return g;
  };

  L18.car = (svg, x, y, s, tone) => {
    const g = add(svg, "g", {});
    const p = add(g, "path", {
      d: `M${f1(x - 44 * s)} ${f1(y + 10 * s)} V${f1(y - 6 * s)} L${f1(x - 26 * s)} ${f1(y - 10 * s)} L${f1(x - 14 * s)} ${f1(y - 28 * s)} H${f1(x + 18 * s)} L${f1(x + 30 * s)} ${f1(y - 10 * s)} L${f1(x + 44 * s)} ${f1(y - 6 * s)} V${f1(y + 10 * s)} Z`,
      "stroke-width": 4,
      "stroke-linejoin": "round",
    });
    L18.paint(p, tone, "dim");
    L18.circ(g, x - 24 * s, y + 12 * s, 10 * s, tone, "c");
    L18.circ(g, x + 24 * s, y + 12 * s, 10 * s, tone, "c");
    return g;
  };

  /** L13.card whose text may hold "\n" line breaks (pre-line, line height 1.2). Same set() API. */
  L18.card = (parent, o) => {
    const c = L13.card(parent, o);
    Object.assign(c.el.style, {
      whiteSpace: "pre-line",
      lineHeight: "1.2",
      padding: "0 12px",
      boxSizing: "border-box",
    });
    return c;
  };

  /** A stat tile: a 28 px label on top (may wrap), a big number below. set({text, tone, k, bump}) */
  L18.tile = (parent, { x, y, w, h, label, tone = "grey", fs = 46 }) => {
    const el = V.h("div", {
      class: `v-card c-${tone}`,
      style: {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        boxSizing: "border-box",
        padding: "10px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: "22px",
      },
    });
    const lab = V.h("div", { text: label, style: { fontSize: "28px", fontWeight: "800", lineHeight: "1.15" } });
    const val = V.h("div", { text: "", style: { fontSize: `${fs}px`, fontWeight: "900", lineHeight: "1.1" } });
    el.append(lab, val);
    parent.append(el);
    return {
      el,
      set({ text = "", tone: tn = tone, k = 1, bump = 0 } = {}) {
        const cls = `v-card c-${tn}`;
        if (el.className !== cls) el.className = cls;
        if (val.textContent !== String(text)) val.textContent = String(text);
        V.place(el, { s: (0.9 + 0.1 * V.ease.pop(V.clamp(k))) * (1 + 0.06 * bump), o: Math.min(1, k * 4) });
      },
    };
  };

  L18.wave = (svg, x, y, w, h, tone, n = 3) => {
    let d = `M${f1(x)} ${f1(y)}`;
    const N = 48;
    for (let i = 1; i <= N; i++) {
      const u = i / N;
      d += ` L${f1(x + u * w)} ${f1(y - Math.sin(u * n * 2 * Math.PI) * h * (0.6 + 0.4 * Math.sin(u * 7)))}`;
    }
    const p = add(svg, "path", { d, fill: "none", "stroke-width": 5, "stroke-linejoin": "round" });
    p.style.stroke = T(tone).c;
    return p;
  };
})();

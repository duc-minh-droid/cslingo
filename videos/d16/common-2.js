/* Lecture 16 · Hardware–software co-design: the drawing pieces (VID.d16, short name D16). Needs videos/l5/common.js,
   videos/d4/common*.js and d16/common.js first. Positions are stage pixels (936 x 640, origin top-left). EVERY CALL IS PURE:
   call set() each frame from update(t) with everything you want to see; nothing is remembered between frames. Tones are the
   video's colour roles (see common.js). All text is 28 px or more.

   1. BOX  (the video's main sticker: a processor, a job, a design step)
        const b = D16.box(parent, {x, y, w: 240, h: 130, title, sub: "", tone: "grey", solid: false, fs: 32, subFs: 28,
                                   icon: null | "chip" | "code" | "camera" | "cloud" | "leaf" | "knife" | "press", iconSize: 64,
                                   iconTone, row: false});   x, y = the CENTRE. Title (900) over an optional sub line (wraps,
          balanced), an optional pictogram above them (row: true puts the icon at the left of the text instead).
        b.set({k: 1 (pops in), x, y (offset), s, o, tone, solid, title, sub, subO: 1 (fades the sub line), ring: 0..1 (a
               ring in the tone)})       b.edge("l" | "r" | "t" | "b") -> {x, y} the middle of that side (rest position)
   2. ARROWS  const a = D16.arrow(svg, [x1, y1], [x2, y2], {tone: "grey", w: 7, head: 22, bow: 0});  a curved L5.arrow
        (bow > 0 bends it to the left of its direction of travel).  a.set({k: 1 (draw-on 0..1), o: 1, s: 1 (pulse)})
   3. PICTOGRAMS  (SVG groups at absolute coordinates: x, y = the centre, s = the size; V.place moves and fades them)
        D16.chip(x, y, s, tone = "purple")   a chip: a square with pins on every side and a die in the middle
        D16.code(x, y, s, tone = "blue")     a page of code: two angle brackets and a slash
        D16.cloud(x, y, s, tone = "grey")    a cloud server
        D16.leaf(x, y, s, tone = "green")    a leaf with its midrib
        D16.phone(x, y, s, tone = "grey")    a phone outline, its screen empty (draw a leaf on it yourself)
        D16.signal(x, y, s, tone = "grey")   four signal bars
        D16.knife(x, y, s)                   a Swiss army knife: a red body with tools fanned out (grey)
        D16.press(x, y, s, tone = "green")   a garlic press: two handles, a hinge and a cup
   4. TOOLS  D16.along(pts, f) -> {x, y} at fraction f (0..1) along a polyline [{x, y} ...] (a dot that runs round a loop);
             D16.svgIn(parent, w, h) -> an <svg> of that size appended to parent (a box's icon slot). */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const L5 = V.l5;
  const D16 = V.d16;
  const { clamp } = V;
  const T = D4.tone;
  const f1 = (n) => (+n).toFixed(1);
  const el = (tag, attrs) => V.s(tag, attrs);
  const fillS = (tone, fill) => ({
    fill: fill || T(tone).c,
    stroke: T(tone).lip,
    "stroke-width": 3,
    "stroke-linejoin": "round",
  });
  const stroke = (tone, w) => ({ fill: "none", stroke: T(tone).lip, "stroke-width": w, "stroke-linecap": "round" });

  // ---------- 3. pictograms ----------
  D16.chip = (x, y, s, tone = "purple") => {
    const g = V.s("g", {});
    const h = s * 0.32;
    const pin = (x1, y1, x2, y2) => g.append(el("line", { x1, y1, x2, y2, ...stroke(tone, s * 0.07) }));
    for (let i = -1; i <= 1; i++) {
      const o = i * s * 0.2;
      pin(x + o, y - h, x + o, y - s * 0.48);
      pin(x + o, y + h, x + o, y + s * 0.48);
      pin(x - h, y + o, x - s * 0.48, y + o);
      pin(x + h, y + o, x + s * 0.48, y + o);
    }
    g.append(el("rect", { x: x - h, y: y - h, width: 2 * h, height: 2 * h, rx: s * 0.06, ...fillS(tone) }));
    g.append(
      el("rect", {
        x: x - s * 0.13,
        y: y - s * 0.13,
        width: s * 0.26,
        height: s * 0.26,
        rx: s * 0.03,
        fill: T(tone).on,
      }),
    );
    return g;
  };
  D16.code = (x, y, s, tone = "blue") => {
    const g = V.s("g", {});
    const P = (a, b) => `${f1(x + a * s)} ${f1(y + b * s)}`;
    g.append(
      el("rect", { x: x - s * 0.46, y: y - s * 0.36, width: s * 0.92, height: s * 0.72, rx: s * 0.1, ...fillS(tone) }),
    );
    const d = `M${P(-0.14, -0.16)}L${P(-0.3, 0)}L${P(-0.14, 0.16)}M${P(0.14, -0.16)}L${P(0.3, 0)}L${P(0.14, 0.16)}M${P(0.05, -0.2)}L${P(-0.05, 0.2)}`;
    g.append(el("path", { d, ...stroke(tone, s * 0.07), stroke: T(tone).on, "stroke-linejoin": "round" }));
    return g;
  };
  D16.cloud = (x, y, s, tone = "grey") => {
    const P = (a, b) => `${f1(x + a * s)} ${f1(y + b * s)}`;
    const r = (v) => f1(v * s);
    const d = `M${P(-0.42, 0.22)}L${P(0.4, 0.22)}A${r(0.2)} ${r(0.2)} 0 0 0 ${P(0.4, -0.18)}A${r(0.26)} ${r(0.26)} 0 0 0 ${P(-0.06, -0.3)}A${r(0.22)} ${r(0.22)} 0 0 0 ${P(-0.42, -0.1)}A${r(0.16)} ${r(0.16)} 0 0 0 ${P(-0.42, 0.22)}Z`;
    return V.s("g", {}, el("path", { d, ...fillS(tone, "var(--panel)"), "stroke-width": 5 }));
  };
  D16.leaf = (x, y, s, tone = "green") => {
    const P = (a, b) => `${f1(x + a * s)} ${f1(y + b * s)}`;
    const body = `M${P(-0.4, 0.4)}C${P(-0.5, -0.1)} ${P(-0.05, -0.45)} ${P(0.42, -0.42)}C${P(0.45, 0.05)} ${P(0.1, 0.5)} ${P(-0.4, 0.4)}Z`;
    return V.s(
      "g",
      {},
      el("path", { d: body, ...fillS(tone) }),
      el("path", { d: `M${P(-0.42, 0.42)}L${P(0.2, -0.2)}`, ...stroke(tone, s * 0.05) }),
    );
  };
  D16.phone = (x, y, s, tone = "grey") =>
    V.s(
      "g",
      {},
      el("rect", {
        x: x - 0.3 * s,
        y: y - 0.48 * s,
        width: 0.6 * s,
        height: 0.96 * s,
        rx: 0.1 * s,
        ...fillS(tone, "var(--panel)"),
        "stroke-width": 5,
      }),
      el("rect", {
        x: x - 0.24 * s,
        y: y - 0.38 * s,
        width: 0.48 * s,
        height: 0.7 * s,
        rx: 0.04 * s,
        fill: "var(--panel-2)",
      }),
      el("circle", { cx: x, cy: y + 0.41 * s, r: 0.035 * s, fill: T(tone).c }),
    );
  D16.signal = (x, y, s, tone = "grey") => {
    const g = V.s("g", {});
    [0, 1, 2, 3].forEach((i) => {
      const h = s * (0.25 + 0.25 * i);
      g.append(
        el("rect", {
          x: x - s * 0.5 + i * s * 0.27,
          y: y + s * 0.5 - h,
          width: s * 0.18,
          height: h,
          rx: s * 0.04,
          fill: T(tone).c,
        }),
      );
    });
    return g;
  };
  D16.knife = (x, y, s) => {
    const g = V.s("g", {});
    const px = x - s * 0.3;
    const tool = (deg, len, wd) => {
      const a = (deg * Math.PI) / 180;
      g.append(
        el("line", {
          x1: px,
          y1: y,
          x2: px + Math.cos(a) * len * s,
          y2: y + Math.sin(a) * len * s,
          ...stroke("grey", wd * s),
        }),
      );
    };
    tool(-62, 0.6, 0.09);
    tool(-36, 0.7, 0.13);
    tool(-12, 0.62, 0.06);
    tool(205, 0.22, 0.08);
    g.append(
      el("rect", { x: x - s * 0.5, y: y - s * 0.12, width: s * 0.86, height: s * 0.26, rx: s * 0.13, ...fillS("red") }),
    );
    g.append(el("circle", { cx: px, cy: y + s * 0.01, r: s * 0.05, fill: T("red").on }));
    return g;
  };
  D16.press = (x, y, s, tone = "green") => {
    const g = V.s("g", {});
    const P = (a, b) => `${f1(x + a * s)} ${f1(y + b * s)}`;
    g.append(el("path", { d: `M${P(-0.42, -0.06)}L${P(0.48, -0.3)}`, ...stroke(tone, s * 0.12) }));
    g.append(el("path", { d: `M${P(-0.42, 0.04)}L${P(0.48, 0.22)}`, ...stroke(tone, s * 0.12) }));
    g.append(
      el("rect", { x: x - s * 0.3, y: y - s * 0.16, width: s * 0.32, height: s * 0.32, rx: s * 0.05, ...fillS(tone) }),
    );
    g.append(el("circle", { cx: x - s * 0.42, cy: y - s * 0.01, r: s * 0.08, ...fillS(tone) }));
    return g;
  };
  const ICON = {
    chip: D16.chip,
    code: D16.code,
    camera: D4.camera,
    cloud: D16.cloud,
    leaf: D16.leaf,
    knife: D16.knife,
    press: D16.press,
  };
  D16.svgIn = (parent, w, h) => {
    const svg = V.s("svg", { width: w, height: h, viewBox: `0 0 ${w} ${h}`, style: "overflow: visible; flex: none" });
    parent.append(svg);
    return svg;
  };

  // ---------- 1. box ----------
  D16.box = (parent, o = {}) => {
    const { x = 0, y = 0, w = 240, h = 130, fs = 32, subFs = 28, iconSize = 64, row = false } = o;
    const base = { tone: o.tone || "grey", solid: !!o.solid };
    const card = V.h("div", {
      class: "v-card",
      style: {
        left: `${f1(x - w / 2)}px`,
        top: `${f1(y - h / 2)}px`,
        width: `${w}px`,
        height: `${h}px`,
        display: "flex",
        flexDirection: row ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: row ? "14px" : "2px",
        padding: "6px 12px",
        textAlign: "center",
      },
    });
    let icon = null;
    if (o.icon) {
      const svg = D16.svgIn(card, iconSize, iconSize);
      icon = ICON[o.icon](iconSize / 2, iconSize / 2, iconSize, o.iconTone || base.tone);
      svg.append(icon);
    }
    const txt = V.h("div", {
      style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" },
    });
    const title = V.h("div", {
      text: o.title || "",
      style: { fontSize: `${fs}px`, fontWeight: "900", lineHeight: "1.1", whiteSpace: "nowrap" },
    });
    const sub = V.h("div", {
      text: o.sub || "",
      style: { fontSize: `${subFs}px`, fontWeight: "800", lineHeight: "1.12", textWrap: "balance" },
    });
    txt.append(title);
    if (o.sub) txt.append(sub);
    card.append(txt);
    parent.append(card);
    return {
      el: card,
      icon,
      edge: (side) =>
        ({
          l: { x: x - w / 2, y },
          r: { x: x + w / 2, y },
          t: { x, y: y - h / 2 },
          b: { x, y: y + h / 2 + 6 },
        })[side],
      set(st = {}) {
        const tone = st.tone || base.tone;
        const solid = st.solid ?? base.solid;
        const cls = `v-card c-${tone}`;
        if (card.className !== cls) card.className = cls;
        card.style.background = solid ? "var(--c)" : tone === "grey" ? "var(--panel)" : "var(--c-dim)";
        card.style.borderColor = solid ? "var(--c-lip)" : "var(--c-edge)";
        const ring = clamp(st.ring || 0);
        card.style.boxShadow = `0 6px 0 ${solid ? "var(--c-lip)" : "var(--c-edge)"}${ring ? `, 0 0 0 ${f1(8 * ring)}px var(--c)` : ""}`;
        card.style.color = solid ? "var(--c-on)" : tone === "grey" ? "var(--ink)" : "var(--c-ink)";
        if (st.title != null && title.textContent !== st.title) title.textContent = st.title;
        if (st.sub != null && sub.textContent !== st.sub) sub.textContent = st.sub;
        sub.style.opacity = f1(clamp(st.subO ?? 1));
        const k = clamp(st.k ?? 1);
        V.place(card, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.8 + 0.2 * V.ease.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  };

  // ---------- 2. arrows ----------
  D16.arrow = (svg, a, b, o = {}) => {
    const g = L5.arrow(a[0], a[1], b[0], b[1], o.tone || "grey", 1, {
      w: o.w || 7,
      head: o.head || 22,
      bow: o.bow || 0,
    });
    svg.append(g);
    return {
      g,
      set(st = {}) {
        L5.drawOn(g, clamp(st.k ?? 1));
        V.place(g, { s: st.s ?? 1, o: st.o ?? 1 });
      },
    };
  };

  // ---------- 4. tools ----------
  D16.along = (pts, f) => {
    const segs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
    const total = segs.reduce((s, v) => s + v, 0);
    let d = clamp(f) * total;
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) {
        const k = segs[i] ? Math.min(1, d / segs[i]) : 0;
        return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k };
      }
      d -= segs[i];
    }
    return pts[pts.length - 1];
  };
})();

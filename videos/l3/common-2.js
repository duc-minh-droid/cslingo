/* Lecture 3 · landscape panel and its markers (window.VID.l3, part 2 of 3; needs common.js and VID.l5). Stage px (936 x 640).
   Every call is PURE: call set/update every frame from update(t) with everything you want to see; nothing is remembered.
   Tones: "blue" "green" "red" "orange" "purple" "grey" (VID.l5.tone).

   ───────────────────────────── L3.land(parent, opts) -> P ─────────────────────────────
     const P = L3.land(stage, { x: 0, y: 10, w: 936, h: 450, kind: "multi", frame: true, pad: undefined });
       kind   "multi" | "uni" | "plateau" | "deceptive"  (the 40-point landscapes of common.js)
       frame  true: sticker card (rounded, 3 px grey edge, 6 px lip under the h px body, var(--panel) fill). false: no card
              (recap pictograms) and tighter padding. pad: number or {l, r, t, b} to override (frame: 24 / 24 / 36 / 24)
       Inside: a flat grey area under the curve, a 6 px grey-ink curve on top, a faint baseline. The curve peaks at 88 % of the
       plot height. The curve runs from grid index 0 to 39 (px(0) .. px(39)).
     P.update({ curve: 0..1, fill: 0..1, bars: 0..1 | (i) => 0..1, o: 1, s: 1 })
         curve  outline draws on left to right        fill  the area under it fades in
         bars   40 thin grey rounded bars (height f(i)) growing from the baseline; a number applies to all, a function per bar
                (stagger: i => V.ramp(t, 0.3 + 0.05 * i, 0.65 + 0.05 * i)). Use bars for "one bar per solution", then fade them
                out (bars: 0) while the curve draws on.
         o      opacity of the whole panel: card, curve, markers, tags made with P.tag      s  scale about the panel centre
         Anything you leave out is hidden / 0 (curve, fill, bars) or 1 (o, s). A frame needs the full state.
     P.f (40 values)  P.kind  P.best (index of the global best)  P.box {x, y, w, h}  P.base (stage y of the baseline)
     P.px(i), P.py(i)   stage coordinates of grid index i (i may be fractional; py follows the smooth curve)
     P.arc(i0, i1, lift = 60) -> SVG path data of a quadratic arc from the curve at i0 to the curve at i1 (for dotted arcs: append
         V.s("path", {d, fill: "none", "stroke-dasharray": "2 14", "stroke-linecap": "round", ...}) to P.over)
     P.under / P.over   <g> layers (below / above the markers) for your own SVG, in stage coordinates
     P.html   absolutely positioned <div> at the stage origin that fades with the panel (o): put your own HTML tags in it
     P.tag(text, { at: "tl" | "tr" | "tc" | {x, y}, anchor: "l", tone: "grey", solid: false, fs: 28 }) -> the L3.tag element
         (see common-3.js): a pill inside the panel (24 px from the corner, 20 below the top; "tr" grows leftwards, "tc" is
         centred), part of P.html so it dims with the panel. Pass {x, y, anchor: "l" | "c" | "r"} in `at` for your own spot
     P.marker(type, opts) -> m           m.set({ i, dx, dy, s, o, r, ring, ringK, tone, k, icon })
         i  grid index (fractional ok, follows the curve)      dx, dy  extra px (dy > 0 is DOWN; use dy < 0 to float)
         s  scale  o  opacity (0 hides)  r  degrees  tone  override the marker's tone  ring  a tone name (or null): a ring round
         the marker in that colour, ringK 0..1 grows it in (default 1)    k  0..1 pop-in/draw-on of a badge icon
       types (opts: size, tone, icon):
         "token"    round sticker (default blue, size 30): the hiker / a population member. Centre sits size/2 above the curve
         "ghost"    dashed ring of a tone (default purple, size 30): a proposed move; ring works too
         "star"     orange five-point star (size 30) on the global best
         "diamond"  orange best-so-far diamond (22), floats 20 px above the curve
         "crumb"    small grey dot (14) on the curve (Tabu list)
         "badge"    40 px circle with an icon: icon "tick" (green) | "cross" (red) | "down" (orange arrow) | "up" (green arrow).
                    Floats 54 px above the curve by default; set dy to move it (e.g. dy: -20 above a token)
       m.el is the <g> (hidden until you call set).
     L3.hop(i0, i1, k, height = 40) -> { i, dy }   a hop between two grid indices: eased fractional index and a -height*sin(pi k) lift:
         const h = L3.hop(7, 8, V.ramp(t, 4, 4.3, V.ease.lin), 30); token.set({ i: h.i, dy: h.dy })
     L3.rest(i0, i1, k) -> eased fractional index only (for a slide along the curve without the lift) */
(function () {
  const V = window.VID;
  const L3 = (V.l3 = V.l3 || {});
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const f1 = (n) => (+n).toFixed(1);
  const absStyle = (x, y, w, h) => ({ position: "absolute", left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  const SAMPLES = 160;

  const hop = (i0, i1, k, height = 40) => {
    const kk = clamp(k);
    return { i: i0 + (i1 - i0) * E.inOut(kk), dy: -height * Math.sin(Math.PI * kk) };
  };
  const rest = (i0, i1, k) => i0 + (i1 - i0) * E.inOut(clamp(k));

  // ---------- markers ----------
  const starPoints = (r) =>
    Array.from({ length: 10 }, (_, j) => {
      const a = -Math.PI / 2 + (j * Math.PI) / 5;
      const rr = j % 2 ? r * 0.46 : r;
      return `${f1(rr * Math.cos(a))},${f1(rr * Math.sin(a))}`;
    }).join(" ");
  const ICONS = { tick: "green", cross: "red", down: "orange", up: "green" };

  const buildMarker = (type, opts) => {
    const size = opts.size || (type === "diamond" ? 22 : type === "crumb" ? 14 : type === "badge" ? 40 : 30);
    const baseTone = opts.tone || (type === "ghost" ? "purple" : type === "star" || type === "diamond" ? "orange" : type === "crumb" ? "grey" : "blue");
    const r = size / 2;
    const g = V.s("g", {});
    const body = V.s("g", {});
    const ring = V.s("circle", { r: f1(r + 8), fill: "none", "stroke-width": "5" });
    const parts = {};
    if (type === "token") {
      parts.lip = V.s("circle", { r: f1(r), cy: "3" });
      parts.base = V.s("circle", { r: f1(r), "stroke-width": "3" });
      parts.dot = V.s("circle", { r: f1(size * 0.16), style: { fill: "var(--panel)" } });
      body.append(parts.lip, parts.base, parts.dot);
    } else if (type === "ghost") {
      parts.base = V.s("circle", { r: f1(r - 2), fill: "none", "stroke-width": "4", "stroke-dasharray": "7 6", "stroke-linecap": "round" });
      body.append(parts.base);
    } else if (type === "star") {
      parts.base = V.s("polygon", { points: starPoints(r), "stroke-width": "3.5", "stroke-linejoin": "round" });
      body.append(parts.base);
    } else if (type === "diamond") {
      parts.base = V.s("rect", { x: f1(-r * 0.72), y: f1(-r * 0.72), width: f1(r * 1.44), height: f1(r * 1.44), rx: "3", "stroke-width": "3", transform: "rotate(45)" });
      body.append(parts.base);
    } else if (type === "crumb") {
      parts.base = V.s("circle", { r: f1(r), style: { fill: "var(--node-off-ic)", stroke: "var(--node-off-lip)", strokeWidth: "2.5" } });
      body.append(parts.base);
    } else if (type === "badge") {
      parts.lip = V.s("circle", { r: f1(r), cy: "3" });
      parts.base = V.s("circle", { r: f1(r), "stroke-width": "3" });
      parts.icons = {
        tick: L5.tick(0, 0, size * 0.62, "green", { on: true, w: 5 }),
        cross: L5.cross(0, 0, size * 0.62, "red", { on: true, w: 5 }),
        down: L5.arrow(0, -size * 0.26, 0, size * 0.28, "orange", 1, { on: true, w: 5, head: 13 }),
        up: L5.arrow(0, size * 0.28, 0, -size * 0.26, "green", 1, { on: true, w: 5, head: 13 }),
      };
      body.append(parts.lip, parts.base, ...Object.values(parts.icons));
    } else throw new Error(`VID.l3.marker: unknown type "${type}"`);
    g.append(ring, body);
    return { g, body, ring, parts, size, r, baseTone, type };
  };
  const LIFT = { token: 1, ghost: 1, star: 1, crumb: 1 }; // centre rests r above the curve; diamond and badge float

  const makeMarker = (P, layer, type, opts = {}) => {
    const m = buildMarker(type, opts);
    V.show(m.g, 0);
    layer.append(m.g);
    const set = (st = {}) => {
      const { i = 0, dx = 0, dy = 0, s = 1, o = 1, r: rot = 0, ring = null, ringK = 1, k = 1 } = st;
      const icon = st.icon || (m.type === "badge" ? "tick" : "");
      const tn = L5.tone(st.tone || (m.type === "badge" ? ICONS[icon] || "green" : m.baseTone));
      const float = m.type === "diamond" ? 20 + m.r : m.type === "badge" ? 54 : LIFT[m.type] ? m.r + (m.type === "token" ? 3 : 0) : 0;
      const [x, y] = [P.px(i) + dx, P.py(i) - float + dy];
      const pop = m.type === "badge" ? E.pop(clamp(k)) : 1;
      m.g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${(s * pop).toFixed(3)})`);
      V.show(m.g, m.type === "badge" ? Math.min(o, clamp(k * 5)) : o);
      const { base, lip } = m.parts;
      if (m.type === "token" || m.type === "badge") {
        lip.style.fill = tn.lip;
        base.style.fill = tn.c;
        base.style.stroke = tn.lip;
      } else if (m.type === "ghost") {
        base.style.stroke = tn.c;
      } else if (m.type === "star" || m.type === "diamond") {
        base.style.fill = tn.c;
        base.style.stroke = tn.lip;
      }
      if (m.type === "badge") {
        Object.entries(m.parts.icons).forEach(([name, g]) => {
          V.show(g, +(name === icon));
          L5.drawOn(g, V.ramp(k, 0.25, 1, E.lin));
        });
      }
      const rk = ring ? clamp(ringK) : 0;
      m.ring.style.stroke = ring ? L5.tone(ring).c : "none";
      m.ring.setAttribute("r", f1(m.r + 8 + (1 - E.out(rk)) * 10));
      V.show(m.ring, rk * 3);
    };
    return { el: m.g, set, type, size: m.size };
  };

  // ---------- the landscape panel ----------
  function land(parent, opt = {}) {
    const { x = 0, y = 0, w = 936, h = 450, kind = "multi", frame = true } = opt;
    const f = L3.fvals(kind);
    const n = L3.N;
    const defPad = frame ? { l: 24, r: 24, t: 36, b: 24 } : { l: 6, r: 6, t: 12, b: 8 };
    const pad = typeof opt.pad === "number" ? { l: opt.pad, r: opt.pad, t: opt.pad, b: opt.pad } : { ...defPad, ...(opt.pad || {}) };
    const slot = (w - pad.l - pad.r) / n;
    const px = (i) => x + pad.l + (i + 0.5) * slot;
    const base = y + h - pad.b;
    const top = Math.max(...f);
    const scale = (0.88 * (h - pad.t - pad.b)) / top;
    const fy = (i) => FN_AT(kind, i);
    const py = (i) => base - fy(i) * scale;

    const svg = V.s("svg", { width: 936, height: 640, style: { ...absStyle(0, 0, 936, 640), overflow: "visible" } });
    const g = V.s("g", {});
    const rect = (a) => V.s("rect", { x: f1(x), y: f1(y), width: f1(w), height: f1(h), rx: "26", ...a });
    if (frame) {
      g.append(
        V.s("rect", { x: f1(x), y: f1(y + 6), width: f1(w), height: f1(h), rx: "26", style: { fill: "var(--line-2)" } }),
        rect({ "stroke-width": "3", style: { fill: "var(--panel)", stroke: "var(--line-2)" } }),
      );
    }
    const pts = Array.from({ length: SAMPLES + 1 }, (_, j) => [px((j * (n - 1)) / SAMPLES), py((j * (n - 1)) / SAMPLES)]);
    const line = pts.map((p, j) => `${j ? "L" : "M"} ${f1(p[0])} ${f1(p[1])}`).join(" ");
    const area = V.s("path", { d: `${line} L ${f1(px(n - 1))} ${f1(base)} L ${f1(px(0))} ${f1(base)} Z`, style: { fill: "var(--line)" } });
    const baseline = V.s("line", { x1: f1(x + pad.l / 2), x2: f1(x + w - pad.r / 2), y1: f1(base), y2: f1(base), "stroke-width": "3", "stroke-linecap": "round", style: { stroke: "var(--line-2)" } });
    const bw = Math.min(slot * 0.62, 22);
    const bars = Array.from({ length: n }, (_, i) =>
      V.s("rect", { x: f1(px(i) - bw / 2), width: f1(bw), rx: f1(bw / 2.5), style: { fill: "var(--line-2)" } }),
    );
    const curve = V.s("path", { d: line, fill: "none", pathLength: "1", "stroke-width": "6", "stroke-linecap": "round", "stroke-linejoin": "round", style: { stroke: "var(--text-dim)" } });
    const under = V.s("g", {});
    const marks = V.s("g", {});
    const over = V.s("g", {});
    g.append(area, baseline, ...bars, curve, under, marks, over);
    svg.append(g);
    parent.append(svg);
    const html = V.h("div", { style: { ...absStyle(0, 0, 936, 640), pointerEvents: "none" } });
    parent.append(html);

    const P = { svg, g, under, over, html, f, kind, best: L3.bestOf(f), box: { x, y, w, h }, base, px, py, pad };
    P.arc = (i0, i1, lift = 60) => {
      const [a, b] = [[px(i0), py(i0) - 14], [px(i1), py(i1) - 14]];
      return `M ${f1(a[0])} ${f1(a[1])} Q ${f1((a[0] + b[0]) / 2)} ${f1(Math.min(a[1], b[1]) - lift * 1.6)} ${f1(b[0])} ${f1(b[1])}`;
    };
    P.marker = (type, o) => makeMarker(P, marks, type, o);
    P.tag = (text, o = {}) => {
      const at = o.at || "tl";
      const pos = typeof at === "object" ? at : { x: at === "tr" ? x + w - 24 : at === "tc" ? x + w / 2 : x + 24, y: y + 20 };
      const anchor = typeof at === "object" ? o.anchor || "l" : at === "tr" ? "r" : at === "tc" ? "c" : "l";
      return L3.tag(html, { x: pos.x, y: pos.y, text, tone: o.tone || "grey", solid: o.solid, fs: o.fs, anchor });
    };
    P.update = (st = {}) => {
      const { curve: ck = 0, fill: fk = 0, bars: bk = 0, o = 1, s = 1 } = st;
      curve.style.strokeDasharray = "1 1";
      curve.style.strokeDashoffset = String(1 - clamp(ck));
      V.show(curve, clamp(ck) <= 0.002 ? 0 : 1);
      V.show(area, clamp(fk));
      bars.forEach((b, i) => {
        const k = clamp(typeof bk === "function" ? bk(i) : bk);
        const hh = Math.max(0, fy(i) * scale * E.out(k));
        b.setAttribute("y", f1(base - hh));
        b.setAttribute("height", f1(hh));
        V.show(b, k <= 0.002 ? 0 : 1);
      });
      V.show(g, o);
      V.show(html, o);
      g.style.transformBox = "view-box";
      g.style.transformOrigin = `${f1(x + w / 2)}px ${f1(y + h / 2)}px`;
      g.style.transform = s === 1 ? "" : `scale(${s})`;
    };
    return P;
  }

  // analytic height of the curve at a fractional grid index (the drawn curve and the markers agree)
  function FN_AT(kind, i) {
    const n = L3.N;
    return L3.FN[kind](clamp(i, 0, n - 1) / (n - 1));
  }

  Object.assign(L3, { land, hop, rest });
})();

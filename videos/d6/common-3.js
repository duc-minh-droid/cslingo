/* Lecture 6 · Consistency and consensus: pictograms and the pieces of a distributed system (VID.d6, short name D6), part 3.
   Needs videos/l5/common.js and d6/common.js, common-2.js. Same rules as common-2.js: positions are the parent's pixels, every
   set()/update() call is PURE (call it each frame with everything you want to see), the tones are the video's colour roles
   (green agreed / latest / committed, red failure, orange old / undone / waiting, blue the request or data followed, purple the
   coordinator and the rules, grey neutral).

   1. PICTOGRAMS  (SVG <g>; draw them into your own L5.svg(parent) layer at ABSOLUTE coordinates, x, y = centre, size = about the
      width. V.place(g, {x, y, s, r, o}) then moves / scales / fades them from where they are drawn)
        D6.bolt(x, y, size, tone = "red")          a lightning bolt: a crash. Pop it in and out quickly.
        D6.qmark(x, y, size, tone = "orange")      a question mark (stroke + dot); L5.drawOn(g, k) draws the hook on.
        D6.padlock(x, y, size, tone = "orange")    a closed padlock (a held lock). D6.lockOpen(g, k) 0..1 raises the shackle (0 closed, 1 open).
        D6.clock(x, y, size, tone = "orange")      a clock face. D6.clockHand(g, k) turns its hand: k 0..1 = one full turn from 12 o'clock.
        D6.server(x, y, size, tone = "grey")       a server: three stacked bars with a light on each.
        D6.cylinder(x, y, size, tone = "grey")     a database drum.
        D6.person(x, y, size, tone = "blue")       a client: head and shoulders.
        L5.tick(x, y, size, tone, {w, ink, on}) / L5.cross(...) / L5.arrow(x1, y1, x2, y2, tone, o, {w, head, bow}) / L5.drawOn(g, k) come
        from l5 (the arrow's head appears in the last 30% of drawOn).
   2. A NODE, ACCOUNT OR DATABASE  (a named sticker holding one value)
        const n = D6.box(parent, {x, y, w: 190, h: 170, name: "Node A", tone: "grey", icon: null | "server" | "db" | "person", vfs: 60});
        n.set({value, sub, tone, solid, mark, markK, k, x, y, s, o, vfs})
            value = the big text (a number or a word; use vfs 34-40 for words like "committed"); sub = a 28 px line at the bottom (a
            status such as "old", "latest", "locked"); tone = the sticker colour (face tinted, text in the tone's ink; solid fills
            it); mark = "tick" | "cross" | "qmark" | "lock" | null: a round badge on the top-right corner (markK 0..1 pops it in);
            k pops the whole box in; x, y = offset from where it was placed; s scale; o opacity.
        n.mid / n.top / n.bottom / n.left / n.right -> {x, y} in PARENT pixels (centre, and the middle of each edge) to aim links,
        packets, arrows and padlocks at; n.w, n.h, n.el.   With icon the name sits to the right of a 34 px icon: use w >= 220.
   3. A LINK  (a line between two points that can be drawn on and cut)
        const lk = D6.link(parent, {a: {x, y}, b: {x, y}, w: 8, gap: 84});   draws into its own full-stage SVG layer: create it BEFORE
            the boxes it joins so the boxes sit on top of the line.
        lk.update({k: 1, tone: "grey", cut: 0, o: 1, w})
            k 0..1 draws the line on from a to b; cut 0..1 opens a gap of `gap` px in the middle with two red slashes (the cut link):
            cut 0 is whole, cut 1 fully cut (the halves keep `tone`); o opacity.
        lk.mid -> {x, y} (the gap);  lk.at(f, inset = 0) -> {x, y, r} point at fraction f from a to b (a packet's lane).
   4. A PACKET  (a message that travels: a small solid pill)
        const p = D6.packet(parent, {tone: "blue", text: "sell 5", fs: 28});   a pill centred on (x, y)
        p.set({x, y, s, o, tone, text, solid: true})   x, y = its CENTRE in parent pixels (move it with D6.along / lk.at / D6.polyAt);
            o 0 hides it. Make a message "die" with s -> 0 / o -> 0 and a red cross (L5.cross) or bolt at the spot.
        D6.packetW(text, fs) = width estimate.
   5. OUTLINE  D6.bracket(parent, {x, y, w, h, tone: "purple", dash: false, radius: 24})  a rounded outline (no fill): groups things
        (a transaction). b.set({tone, k, o, x, y}) k 0..1 fades and scales it in. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { abs, flex, f1, D, tn, setText, setClass, popOf, fadeOf } = D6;

  // ---------- 1. pictograms ----------
  const stroke = (d, w, colour, extra = {}) =>
    V.s("path", {
      d,
      fill: "none",
      "stroke-width": f1(w),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      style: { stroke: colour },
      ...extra,
    });
  const sticker = (tag, attrs, t, w = 3) =>
    V.s(tag, { ...attrs, "stroke-width": f1(w), "stroke-linejoin": "round", style: { fill: t.c, stroke: t.lip } });

  function bolt(x, y, size, tone = "red") {
    const t = D6.tone(tone);
    const pts = [
      [0.12, -0.5],
      [-0.32, 0.06],
      [-0.03, 0.06],
      [-0.14, 0.5],
      [0.32, -0.14],
      [0.04, -0.14],
    ].map((p) => [x + p[0] * size, y + p[1] * size]);
    return sticker(
      "path",
      { d: D("M", pts[0], ...pts.slice(1).flatMap((p) => ["L", p]), "Z") },
      t,
      Math.max(3, size * 0.07),
    );
  }
  function qmark(x, y, size, tone = "orange") {
    const t = D6.tone(tone);
    const s = size;
    const hook = D(
      "M",
      [x - 0.24 * s, y - 0.22 * s],
      "C",
      [x - 0.24 * s, y - 0.62 * s],
      [x + 0.26 * s, y - 0.62 * s],
      [x + 0.26 * s, y - 0.24 * s],
      "C",
      [x + 0.26 * s, y - 0.04 * s],
      [x, y - 0.06 * s],
      [x, y + 0.14 * s],
    );
    const w = Math.max(5, s * 0.16);
    const g = V.s("g", {}, stroke(hook, w, t.c, { pathLength: "1", "data-draw": "1" }));
    g.append(V.s("circle", { cx: f1(x), cy: f1(y + 0.36 * s), r: f1(w * 0.62), style: { fill: t.c } }));
    return g;
  }
  function padlock(x, y, size, tone = "orange") {
    const t = D6.tone(tone);
    const s = size;
    const shackle = stroke(
      D(
        "M",
        [x - 0.2 * s, y - 0.02 * s],
        "L",
        [x - 0.2 * s, y - 0.2 * s],
        "A",
        0.2 * s,
        0.2 * s,
        "0 0 1",
        [x + 0.2 * s, y - 0.2 * s],
        "L",
        [x + 0.2 * s, y - 0.02 * s],
      ),
      Math.max(5, s * 0.12),
      t.lip,
      { "data-shackle": "1" },
    );
    const body = sticker(
      "rect",
      { x: f1(x - 0.34 * s), y: f1(y - 0.04 * s), width: f1(0.68 * s), height: f1(0.5 * s), rx: f1(0.1 * s) },
      t,
      Math.max(3, s * 0.07),
    );
    const hole = V.s("circle", { cx: f1(x), cy: f1(y + 0.17 * s), r: f1(0.06 * s), style: { fill: t.lip } });
    const g = V.s("g", {}, shackle, body, hole);
    g.dataset.lift = String(0.16 * s);
    return g;
  }
  D6.lockOpen = (g, k) => {
    const sh = g.querySelector("[data-shackle]");
    sh.style.transform = `translateY(${f1(-clamp(k) * +g.dataset.lift)}px)`;
  };
  function clock(x, y, size, tone = "orange") {
    const t = D6.tone(tone);
    const r = size / 2;
    const w = Math.max(4, size * 0.08);
    const face = V.s("circle", {
      cx: f1(x),
      cy: f1(y),
      r: f1(r),
      "stroke-width": f1(w),
      style: { fill: "var(--panel)", stroke: t.c },
    });
    const hand = V.s("line", {
      x1: f1(x),
      y1: f1(y),
      x2: f1(x),
      y2: f1(y - r * 0.62),
      "stroke-width": f1(w),
      "stroke-linecap": "round",
      style: { stroke: t.lip },
    });
    const hub = V.s("circle", { cx: f1(x), cy: f1(y), r: f1(w * 0.8), style: { fill: t.lip } });
    const g = V.s("g", {}, face, hand, hub);
    g.dataset.cx = String(x);
    g.dataset.cy = String(y);
    g.dataset.len = String(r * 0.62);
    return g;
  }
  D6.clockHand = (g, k) => {
    const a = clamp(k, 0, 4) * 2 * Math.PI - Math.PI / 2;
    const [cx, cy, len] = [+g.dataset.cx, +g.dataset.cy, +g.dataset.len];
    const hand = g.querySelector("line");
    hand.setAttribute("x2", f1(cx + Math.cos(a) * len));
    hand.setAttribute("y2", f1(cy + Math.sin(a) * len));
  };
  function server(x, y, size, tone = "grey") {
    const t = D6.tone(tone);
    const s = size;
    const bars = [-0.34, -0.06, 0.22].flatMap((dy) => [
      V.s("rect", {
        x: f1(x - 0.42 * s),
        y: f1(y + dy * s - 0.01 * s),
        width: f1(0.84 * s),
        height: f1(0.26 * s),
        rx: f1(0.07 * s),
        "stroke-width": f1(Math.max(3, s * 0.05)),
        style: { fill: t.dim, stroke: t.c },
      }),
      V.s("circle", { cx: f1(x + 0.29 * s), cy: f1(y + dy * s + 0.12 * s), r: f1(0.045 * s), style: { fill: t.c } }),
      V.s("path", {
        d: D("M", [x - 0.32 * s, y + dy * s + 0.12 * s], "L", [x - 0.1 * s, y + dy * s + 0.12 * s]),
        fill: "none",
        "stroke-width": f1(Math.max(3, s * 0.05)),
        "stroke-linecap": "round",
        style: { stroke: t.c },
      }),
    ]);
    return V.s("g", {}, ...bars);
  }
  function cylinder(x, y, size, tone = "grey") {
    const t = D6.tone(tone);
    const s = size;
    const [rx, ry, top, bot] = [0.4 * s, 0.14 * s, y - 0.34 * s, y + 0.34 * s];
    const w = f1(Math.max(3, s * 0.06));
    const body = V.s("path", {
      d: D("M", [x - rx, top], "L", [x - rx, bot], "A", rx, ry, "0 0 0", [x + rx, bot], "L", [x + rx, top]),
      "stroke-width": w,
      style: { fill: t.dim, stroke: t.c },
    });
    const lid = V.s("ellipse", {
      cx: f1(x),
      cy: f1(top),
      rx: f1(rx),
      ry: f1(ry),
      "stroke-width": w,
      style: { fill: t.dim, stroke: t.c },
    });
    const band = stroke(D("M", [x - rx, y], "A", rx, ry, "0 0 0", [x + rx, y]), Number(w), t.c);
    return V.s("g", {}, body, band, lid);
  }
  function person(x, y, size, tone = "blue") {
    const t = D6.tone(tone);
    const s = size;
    const body = sticker(
      "path",
      {
        d: D(
          "M",
          [x - 0.4 * s, y + 0.48 * s],
          "C",
          [x - 0.4 * s, y + 0.08 * s],
          [x + 0.4 * s, y + 0.08 * s],
          [x + 0.4 * s, y + 0.48 * s],
          "Z",
        ),
      },
      t,
      Math.max(3, s * 0.06),
    );
    const head = sticker("circle", { cx: f1(x), cy: f1(y - 0.22 * s), r: f1(0.23 * s) }, t, Math.max(3, s * 0.06));
    return V.s("g", {}, body, head);
  }

  // ---------- 2. a named sticker holding one value ----------
  const ICONS = { server, db: cylinder, person };
  function box(parent, o = {}) {
    const { x = 0, y = 0, w = 190, h = 170, name = "", tone: base = "grey", icon = null, vfs: vfs0 = 60 } = o;
    const el = V.h("div", { class: `v-card c-${tn(base)}`, style: abs(x, y, w, h) });
    const iconW = icon ? 42 : 0;
    const nm = V.h("div", {
      text: name,
      style: {
        ...abs(icon ? 16 + iconW : 0, 8, icon ? w - 32 - iconW : w, 38),
        textAlign: icon ? "left" : "center",
        fontSize: "28px",
        fontWeight: "900",
        lineHeight: "38px",
        whiteSpace: "nowrap",
      },
    });
    el.append(nm);
    if (icon) {
      if (!ICONS[icon]) throw new Error(`VID.d6.box: unknown icon "${icon}"`);
      const svg = V.s("svg", {
        width: 36,
        height: 36,
        viewBox: "-18 -18 36 36",
        style: { position: "absolute", left: "14px", top: "9px", overflow: "visible" },
      });
      svg.append(ICONS[icon](0, 0, 34, "grey"));
      const g0 = D6.tone("grey");
      const follow = { [g0.c]: "var(--c)", [g0.dim]: "var(--panel)", [g0.lip]: "var(--c-lip)" };
      svg.querySelectorAll("*").forEach((n) => {
        // the icon follows the sticker's own colours (the c-<tone> class), not a fixed tone
        ["stroke", "fill"].forEach((p) => {
          if (follow[n.style[p]]) n.style[p] = follow[n.style[p]];
        });
      });
      el.append(svg);
    }
    const val = V.h("div", {
      style: { ...abs(0, 44, w, h - 44 - 40), ...flex, fontWeight: "900", lineHeight: "1", whiteSpace: "nowrap" },
    });
    const sub = V.h("div", {
      style: {
        ...abs(0, h - 48, w, 38),
        textAlign: "center",
        fontSize: "28px",
        fontWeight: "800",
        lineHeight: "38px",
        whiteSpace: "nowrap",
      },
    });
    const badge = V.s("svg", {
      width: 56,
      height: 56,
      viewBox: "-28 -28 56 56",
      style: { position: "absolute", left: `${w - 40}px`, top: "-24px", overflow: "visible" },
    });
    const disc = V.s("circle", {
      cx: 0,
      cy: 0,
      r: 24,
      "stroke-width": 4,
      style: { fill: "var(--panel)", stroke: D6.tone("grey").c },
    });
    const glyphs = {
      tick: [L5.tick(0, 0, 30, "green", { w: 6 }), "green"],
      cross: [L5.cross(0, 0, 30, "red", { w: 6 }), "red"],
      qmark: [qmark(0, 0, 28, "orange"), "orange"],
      lock: [padlock(0, 0, 30, "orange"), "orange"],
    };
    badge.append(disc, ...Object.values(glyphs).map((g) => g[0]));
    el.append(val, sub, badge);
    parent.append(el);
    const mid = () => ({ x: x + w / 2, y: y + h / 2 });
    return {
      el,
      w,
      h,
      get mid() {
        return mid();
      },
      top: { x: x + w / 2, y },
      bottom: { x: x + w / 2, y: y + h },
      left: { x, y: y + h / 2 },
      right: { x: x + w, y: y + h / 2 },
      set(st = {}) {
        setClass(el, `v-card c-${tn(st.tone || base)}`);
        Object.assign(el.style, {
          background: st.solid ? "var(--c)" : "",
          borderColor: st.solid ? "var(--c-lip)" : "",
          boxShadow: st.solid ? "0 6px 0 var(--c-lip)" : "",
          color: st.solid ? "var(--c-on)" : "",
        });
        setText(val, st.value ?? "");
        val.style.fontSize = `${st.vfs || vfs0}px`;
        setText(sub, st.sub ?? "");
        const mk = st.mark && glyphs[st.mark] ? st.mark : null;
        const mk0 = clamp(st.markK ?? (mk ? 1 : 0));
        Object.entries(glyphs).forEach(([name, [g]]) => V.show(g, +(name === mk)));
        if (mk) {
          disc.style.stroke = D6.tone(glyphs[mk][1]).c;
          if (mk === "tick" || mk === "cross") L5.drawOn(glyphs[mk][0], V.ramp(mk0, 0.3, 1, E.lin));
        }
        V.place(badge, { s: 0.5 + 0.5 * E.pop(mk0), o: mk ? Math.min(1, mk0 * 4) : 0 });
        V.place(el, { x: st.x || 0, y: st.y || 0, s: popOf(st, 0.85, 0.15), o: fadeOf(st) });
      },
    };
  }

  // ---------- 3. a link that can be cut ----------
  function link(parent, o = {}) {
    const { a, b, w: w0 = 8, gap = 84 } = o;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const svg = L5.svg(parent);
    const seg = () => V.s("line", { "stroke-linecap": "round" });
    const [s1, s2] = [seg(), seg()];
    const slash = () => V.s("path", { fill: "none", "stroke-linecap": "round", style: { stroke: D6.tone("red").c } });
    const [m1, m2] = [slash(), slash()];
    svg.append(s1, s2, m1, m2);
    const at = (f, inset = 0) => D6.along(a, b, f, inset);
    const P = (f) => at(clamp(f));
    const u = [(b.x - a.x) / len, (b.y - a.y) / len];
    const n = [-u[1], u[0]];
    const mid = at(0.5);
    const place = (e, p, q) => {
      e.setAttribute("x1", f1(p.x));
      e.setAttribute("y1", f1(p.y));
      e.setAttribute("x2", f1(q.x));
      e.setAttribute("y2", f1(q.y));
    };
    return {
      mid,
      at,
      update(st = {}) {
        const { k = 1, tone = "grey", cut = 0, o: op = 1, w = w0 } = st;
        const g = (gap * clamp(cut)) / len; // the gap, as a fraction of the link
        const colour = D6.tone(tone).c;
        [s1, s2].forEach((s) => {
          s.style.stroke = colour;
          s.setAttribute("stroke-width", f1(w));
        });
        const f = clamp(k);
        const e1 = Math.min(f, 0.5 - g / 2);
        const b2 = 0.5 + g / 2;
        place(s1, P(0), P(Math.max(0, e1)));
        place(s2, P(b2), P(Math.max(b2, f)));
        V.show(s1, f > 0.002 ? 1 : 0);
        V.show(s2, f > b2 + 0.002 ? 1 : 0);
        const kk = clamp(cut);
        [m1, m2].forEach((m, i) => {
          const c = P(i ? b2 : 0.5 - g / 2);
          const d = 22;
          const p0 = { x: c.x + n[0] * d - u[0] * 8, y: c.y + n[1] * d - u[1] * 8 };
          const p1 = { x: c.x - n[0] * d + u[0] * 8, y: c.y - n[1] * d + u[1] * 8 };
          m.setAttribute("d", D("M", [p0.x, p0.y], "L", [p1.x, p1.y]));
          m.setAttribute("stroke-width", f1(Math.max(5, w * 0.7)));
          V.show(m, V.ramp(kk, 0.4, 1, E.lin));
        });
        V.show(svg, op);
      },
    };
  }

  // ---------- 4. a packet ----------
  D6.packetW = (text, fs = 28) => D6.tagW(text, fs);
  function packet(parent, o = {}) {
    const { tone: base = "blue", text: t0 = "", fs = 28 } = o;
    const wrap = V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "0", height: "0" } });
    const pill = V.h("div", {
      class: `v-tag solid c-${tn(base)}`,
      text: t0,
      style: {
        ...flex,
        position: "absolute",
        left: "0",
        top: "0",
        fontSize: `${fs}px`,
        transform: "translate(-50%, -50%)",
      },
    });
    wrap.append(pill);
    parent.append(wrap);
    return {
      el: wrap,
      set(st = {}) {
        setClass(pill, `v-tag${(st.solid ?? true) ? " solid" : ""} c-${tn(st.tone || base)}`);
        setText(pill, st.text);
        wrap.style.left = `${f1(st.x || 0)}px`;
        wrap.style.top = `${f1(st.y || 0)}px`;
        V.place(wrap, { s: st.s ?? 1, o: st.o ?? 1 });
      },
    };
  }

  // ---------- 5. an outline ----------
  function bracket(parent, o = {}) {
    const { x = 0, y = 0, w = 200, h = 100, tone: base = "purple", dash = false, radius = 24 } = o;
    const el = V.h("div", {
      class: `c-${tn(base)}`,
      style: {
        ...abs(x, y, w, h),
        boxSizing: "border-box",
        border: `5px ${dash ? "dashed" : "solid"} var(--c)`,
        borderRadius: `${radius}px`,
      },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `c-${tn(st.tone || base)}`);
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: 0.92 + 0.08 * E.out(k), o: Math.min(1, k * 3) * (st.o ?? 1) });
      },
    };
  }

  Object.assign(D6, { bolt, qmark, padlock, clock, server, cylinder, person, box, link, packet, bracket });
})();

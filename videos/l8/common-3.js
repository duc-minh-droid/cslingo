/* Lecture 8 · The Ant System: the small drawing pieces every scene shares (VID.l8, short name L8). Needs videos/l5/common.js
   and l8/common.js loaded first. Positions are the parent's pixels (the stage is 936 x 640, origin top-left). EVERY CALL IS
   PURE: call set()/update() each frame from your scene's update(t) with everything you want to see; anything you leave out
   falls back to its default and nothing is remembered between frames.

   TONES (colour roles of THIS video, used everywhere): "blue" = pheromone: the trail, tau (thick blue road = strong trail);
   "purple" = closeness, eta = 1/d (the fixed local hint: near is attractive); "orange" = the ant and what it picks (the ant
   icon, the current town, the random draw, a chosen road); "green" = good / allowed / deposit / the best round / on time;
   "red" = blocked / loss: the tabu list (towns already visited), evaporation, a late job, a colony stuck on a poor round;
   "grey" = neutral. L8.tone("blue") -> {c, ink, dim, edge, lip, on} (CSS var() strings, same as VID.l5.tone: c = fill/icon,
   ink = text on a tint, dim = tint fill, edge = tint border, lip = sticker edge, on = text on a c fill). L8.TONES lists them.
   All text is 28 px or more; symbols (x, =, +, ticks, crosses, arrows, dice) are SVG, never glyphs.

   1. TAGS, STATS, CHIPS  (stickers; x, y = top-left of the element for tag/stat/chip/card, the CENTRE for disc/token)
        const t = L8.tag(parent, {x, y, text, tone: "grey", solid: false, h, fs: 28});  a pill. t.set({text, tone, solid, k: 1, x, y, s, o})
            k 0..1 pops it in; x, y = offset from where it was placed; s scale; o opacity. L8.tagW(text, fs) = width estimate.
        const c = L8.chip(parent, {x, y, w: 96, h: 76, text, tone: "grey", fs: 40, solid: false, radius: 22});  a rounded tile of any
            size (a number, a letter, a unit block). c.set({text, tone, solid, ghost, k, x, y, s, sx, o, ring: tone, ringK})
            ghost = dashed outline; sx = extra horizontal squash (0 = edge on); ring draws a coloured ring just outside it.
        const s = L8.stat(parent, {x, y, w: 270, h: 80, label, tone: "blue"});  label left, big number right.
            s.set({text, tone, solid, bump: 0..1 (V.flash pulse), k, o, x, y})
        const d = L8.disc(parent, {x, y, size: 64, text, tone: "orange"});  a solid round number. d.set({text, tone, solid: true, k, x, y, s, o})
        const m = L8.token(parent, {tone: "blue", size: 30});  a round marker. m.set({x, y, s, o, tone})
        const b = L8.card(parent, {x, y, w, h, text, tone: "grey", plain: true, fs: 28});  a panel with centred text. b.set({text, tone, plain, k, x, y, s, o})
        const l = L8.label(parent, {x, y, w, text, tone: "grey", fs: 28, align: "center"});  plain text (grey = dim; a tone = its ink shade).
            l.set({text, tone, k, x, y, o, bold})   k 0..1 rises 8 px and fades in.
   2. SVG PICTOGRAMS  (append to your own L5.svg(parent, w, h) layer; drawn at absolute coordinates, so V.place(g, {x, y, s, r, o})
      moves, scales and turns them from where they are drawn; x, y = centre)
        L8.ant(x, y, size, tone = "orange")   an ant seen from above, facing RIGHT, body about `size` px long. V.place(g, {x: dx, y: dy,
            r: heading in degrees (0 = right, 90 = down)}). L8.along(a, b, f) gives the point and heading along a road.
        L8.mark(kind, x, y, size, tone = "grey")   kind "times" (multiply), "plus", "minus", "equals" (strokes: drawOn works on none of them)
        VID.l5.tick / cross / arrow / dice / drawOn / badge / svg come from l5 (arrow(x1, y1, x2, y2, tone, o, {w, head, bow})).
   3. TOOLS
        L8.seq(t, t0, step, dur, i) -> 0..1: ramp of the i-th item of a staggered list (item i runs from t0 + i * step for dur s)
        L8.along(a, b, f, inset = 0) -> {x, y, r}: point at fraction f of the way from a to b ({x, y} each), heading r in degrees
        L8.fit(nodes, {x, y, w, h}, pad = 0) -> {id: [px, py]} scales a map's coordinates ({id: [x, y]}) to fill the box, centred,
            keeping the aspect ratio (also returns .s the scale in .scale)
   (the figures: net, strip, bar, dial, gantt are in common-4.js) */
(function () {
  const V = window.VID;
  const L8 = V.l8;
  const L5 = V.l5;
  const { clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  L8.TONES = ["green", "red", "orange", "blue", "purple", "grey"];
  const tn = (t) => {
    if (!L8.TONES.includes(t)) throw new Error(`VID.l8: unknown tone "${t}" (use ${L8.TONES.join(", ")})`);
    return t;
  };
  L8.tone = (name) => L5.tone(tn(name));
  const abs = (x, y, w, h) => {
    const st = { position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px` };
    if (w != null) st.width = `${f1(w)}px`;
    if (h != null) st.height = `${f1(h)}px`;
    return st;
  };
  const flex = { display: "flex", alignItems: "center", justifyContent: "center" };
  const setText = (el, text) => {
    if (text != null && el.textContent !== String(text)) el.textContent = String(text);
  };
  const setClass = (el, cls) => {
    if (el.className !== cls) el.className = cls;
  };
  const D = (...a) =>
    a.map((q) => (Array.isArray(q) ? `${f1(q[0])} ${f1(q[1])}` : typeof q === "number" ? f1(q) : q)).join(" ");
  L8.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  L8.tagW = (text, fs = 28) => Math.round(String(text).length * fs * 0.465 + 40);
  L8.along = (a, b, f, inset = 0) => {
    const [dx, dy] = [b.x - a.x, b.y - a.y];
    const len = Math.hypot(dx, dy) || 1;
    const [ux, uy] = [dx / len, dy / len];
    const [x0, y0, x1, y1] = [a.x + ux * inset, a.y + uy * inset, b.x - ux * inset, b.y - uy * inset];
    return { x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f, r: (Math.atan2(dy, dx) * 180) / Math.PI };
  };
  L8.fit = (nodes, box, pad = 0) => {
    const pts = Object.values(nodes);
    const [x0, x1] = [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0]))];
    const [y0, y1] = [Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))];
    const s = Math.min((box.w - 2 * pad) / (x1 - x0 || 1), (box.h - 2 * pad) / (y1 - y0 || 1));
    const ox = box.x + (box.w - (x1 - x0) * s) / 2;
    const oy = box.y + (box.h - (y1 - y0) * s) / 2;
    const out = Object.fromEntries(
      Object.entries(nodes).map(([id, p]) => [id, [ox + (p[0] - x0) * s, oy + (p[1] - y0) * s]]),
    );
    Object.defineProperty(out, "scale", { value: s, enumerable: false });
    return out;
  };

  // ---------- 1. tags, chips, stats ----------
  const popOf = (st, base = 0.8, mix = 0.2) => (st.s ?? 1) * (base + mix * E.pop(clamp(st.k ?? 1)));
  const fadeOf = (st) => Math.min(1, clamp(st.k ?? 1) * 4) * (st.o ?? 1);
  function tag(parent, o = {}) {
    const el = V.h("div", {
      class: "v-tag",
      text: o.text || "",
      style: {
        ...abs(o.x || 0, o.y || 0),
        ...flex,
        fontSize: `${o.fs || 28}px`,
        ...(o.h ? { height: `${o.h}px` } : {}),
      },
    });
    parent.append(el);
    const base = { tone: o.tone || "grey", solid: !!o.solid };
    return {
      el,
      set(st = {}) {
        setClass(el, `v-tag c-${tn(st.tone || base.tone)}${(st.solid ?? base.solid) ? " solid" : ""}`);
        setText(el, st.text);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: popOf(st), o: fadeOf(st) });
      },
    };
  }
  function chip(parent, o = {}) {
    const { x = 0, y = 0, w = 96, h = 76, tone: base = "grey", fs = 40 } = o;
    const radius = o.radius ?? 22;
    const ringPad = 8;
    const el = V.h("div", { style: abs(x, y, w, h) });
    const ring = V.h("div", {
      style: {
        ...abs(-ringPad, -ringPad, w + 2 * ringPad, h + 2 * ringPad),
        boxSizing: "border-box",
        border: "5px solid var(--violet)",
        borderRadius: `${radius + ringPad}px`,
        visibility: "hidden",
      },
    });
    const tile = V.h("div", {
      class: `v-gene c-${tn(base)}`,
      text: o.text || "",
      style: { ...abs(0, 0, w, h), fontSize: `${fs}px`, borderRadius: `${radius}px` },
    });
    el.append(ring, tile);
    parent.append(el);
    return {
      el,
      tile,
      set(st = {}) {
        setClass(tile, `v-gene c-${tn(st.tone || base)}${st.solid ? " solid" : ""}${st.ghost ? " ghost" : ""}`);
        setText(tile, st.text);
        const k = clamp(st.k ?? 1);
        const sx = st.sx ?? 1;
        el.style.opacity = fadeOf(st) >= 1 ? "" : String(Math.max(0, fadeOf(st)));
        el.style.visibility = fadeOf(st) <= 0.001 ? "hidden" : "";
        el.style.transform = `translate(${f1(st.x || 0)}px, ${f1(st.y || 0)}px) scale(${(popOf(st, 0.7, 0.3) * sx).toFixed(3)}, ${popOf(st, 0.7, 0.3).toFixed(3)})`;
        const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
        if (st.ring && rk > 0.002) {
          ring.style.borderColor = L8.tone(st.ring).c;
          ring.style.visibility = "";
          ring.style.opacity = String(Math.min(1, rk * 3) * (k > 0 ? 1 : 0));
          ring.style.transform = `scale(${(0.85 + 0.15 * E.pop(rk)).toFixed(3)})`;
        } else ring.style.visibility = "hidden";
      },
    };
  }
  const solidStyle = (on) => ({
    background: on ? "var(--c)" : "",
    borderColor: on ? "var(--c-lip)" : "",
    boxShadow: on ? "0 6px 0 var(--c-lip)" : "",
    color: on ? "var(--c-on)" : "",
  });
  function stat(parent, o = {}) {
    const { x = 0, y = 0, w = 270, h = 80, label = "total", tone: base = "blue" } = o;
    const el = V.h("div", {
      class: `v-card c-${tn(base)}`,
      style: { ...abs(x, y, w, h), ...flex, justifyContent: "space-between", padding: "0 24px", borderRadius: "22px" },
    });
    const lab = V.h("span", { text: label, style: { fontSize: "28px", fontWeight: "800", flex: "none" } });
    const val = V.h("span", {
      text: "0",
      style: { fontSize: "50px", fontWeight: "900", lineHeight: "1", whiteSpace: "nowrap" },
    });
    el.append(lab, val);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card c-${tn(st.tone || base)}`);
        Object.assign(el.style, solidStyle(!!st.solid));
        setText(val, st.text);
        const len = val.textContent.length;
        val.style.fontSize = `${len <= 3 ? 50 : len <= 6 ? 44 : 38}px`;
        V.place(el, { x: st.x || 0, y: st.y || 0, s: popOf(st) * (1 + 0.1 * (st.bump || 0)), o: fadeOf(st) });
      },
    };
  }
  function disc(parent, o = {}) {
    const { x = 0, y = 0, size = 64, tone: base = "orange" } = o;
    const el = V.h("div", {
      class: `v-gene solid c-${tn(base)}`,
      text: o.text || "",
      style: {
        ...abs(x - size / 2, y - size / 2, size, size),
        borderRadius: "50%",
        fontSize: `${Math.round(size * 0.55)}px`,
      },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-gene c-${tn(st.tone || base)}${st.solid === false ? "" : " solid"}`);
        setText(el, st.text);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: popOf(st, 0.7, 0.3), o: fadeOf(st) });
      },
    };
  }
  function token(parent, o = {}) {
    const { tone: base = "blue", size = 30 } = o;
    const el = V.h("div", {
      class: `v-gene solid c-${tn(base)}`,
      style: { ...abs(0, 0, size, size), borderRadius: "50%", boxShadow: `0 ${Math.round(size / 8)}px 0 var(--c-lip)` },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-gene solid c-${tn(st.tone || base)}`);
        el.style.left = `${f1((st.x || 0) - size / 2)}px`;
        el.style.top = `${f1((st.y || 0) - size / 2)}px`;
        V.place(el, { s: st.s ?? 1, o: st.o ?? 1 });
      },
    };
  }
  function card(parent, o = {}) {
    const { x = 0, y = 0, w = 130, h = 100, tone: base = "grey", plain = true, fs = 28 } = o;
    const el = V.h("div", {
      class: `v-card${plain ? " plain" : ""} c-${tn(base)}`,
      text: o.text || "",
      style: { ...abs(x, y, w, h), ...flex, fontSize: `${fs}px`, borderRadius: "22px", textAlign: "center" },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card${(st.plain ?? plain) ? " plain" : ""} c-${tn(st.tone || base)}`);
        setText(el, st.text);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: popOf(st, 0.9, 0.1), o: fadeOf(st) });
      },
    };
  }
  function label(parent, o = {}) {
    const el = V.h("div", {
      class: "v-text dim",
      text: o.text || "",
      style: {
        ...abs(o.x || 0, o.y || 0, o.w),
        textAlign: o.align || "center",
        fontSize: `${o.fs || 28}px`,
        visibility: "hidden",
      },
    });
    parent.append(el);
    const base = o.tone || "grey";
    return {
      el,
      set(st = {}) {
        setText(el, st.text);
        const tone = st.tone || base;
        el.style.color = tone === "grey" ? "" : L8.tone(tn(tone)).ink;
        el.style.fontWeight = st.bold ? "900" : "";
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: (st.y || 0) + (1 - k) * 8, o: k * (st.o ?? 1) });
      },
    };
  }

  // ---------- 2. svg pictograms ----------
  /** An ant from above, facing right: abdomen, thorax, head, two antennae and three pairs of legs. */
  function ant(x, y, size, tone = "orange") {
    const t = L8.tone(tn(tone));
    const s = size;
    const w = f1(Math.max(3, s * 0.07));
    const line = (pts, extra = {}) =>
      V.s("path", {
        d: D(...pts),
        fill: "none",
        "stroke-width": w,
        "stroke-linecap": "round",
        style: { stroke: t.lip },
        ...extra,
      });
    const legs = [-0.1, 0.04, 0.18].flatMap((dx, i) =>
      [-1, 1].map((sg) => line(["M", [x + dx * s, y], "L", [x + (dx + (i - 1) * 0.08) * s, y + sg * 0.34 * s]])),
    );
    const feel = [-1, 1].map((sg) =>
      line([
        "M",
        [x + 0.34 * s, y + sg * 0.05 * s],
        "Q",
        [x + 0.46 * s, y + sg * 0.1 * s],
        [x + 0.52 * s, y + sg * 0.26 * s],
      ]),
    );
    const body = (cx, cy, rx, ry) =>
      V.s("ellipse", {
        cx: f1(cx),
        cy: f1(cy),
        rx: f1(rx),
        ry: f1(ry),
        "stroke-width": w,
        style: { fill: t.c, stroke: t.lip },
      });
    return V.s(
      "g",
      {},
      ...legs,
      ...feel,
      body(x - 0.3 * s, y, 0.22 * s, 0.17 * s),
      body(x - 0.02 * s, y, 0.14 * s, 0.1 * s),
      body(x + 0.24 * s, y, 0.13 * s, 0.12 * s),
    );
  }
  /** Small arithmetic signs drawn as strokes: "times", "plus", "minus", "equals". */
  function mark(kind, x, y, size, tone = "grey") {
    const t = L8.tone(tn(tone));
    const a = size * 0.32;
    const g = size * 0.14;
    const paths = {
      times: ["M", [x - a, y - a], "L", [x + a, y + a], "M", [x + a, y - a], "L", [x - a, y + a]],
      plus: ["M", [x - a, y], "L", [x + a, y], "M", [x, y - a], "L", [x, y + a]],
      minus: ["M", [x - a, y], "L", [x + a, y]],
      equals: ["M", [x - a, y - g], "L", [x + a, y - g], "M", [x - a, y + g], "L", [x + a, y + g]],
    };
    if (!paths[kind]) throw new Error(`VID.l8.mark: unknown kind "${kind}"`);
    return V.s("path", {
      d: D(...paths[kind]),
      fill: "none",
      "stroke-width": f1(Math.max(5, size * 0.17)),
      "stroke-linecap": "round",
      style: { stroke: t.ink },
    });
  }

  Object.assign(L8, {
    tag,
    chip,
    stat,
    disc,
    token,
    card,
    label,
    ant,
    mark,
    abs,
    flex,
    setText,
    setClass,
    D,
    f1,
    tn,
    popOf,
    fadeOf,
  });
})();

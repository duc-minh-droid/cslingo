/* Lecture 3 · Storage and retrieval: the small drawing pieces every scene shares (VID.d3, short name D3). Needs videos/l5/common.js
   and d3/common.js loaded first. Positions are the parent's pixels (the stage is 936 x 640, origin top-left). EVERY CALL IS PURE:
   call set()/update() each frame from your scene's update(t) with everything you want to see; anything you leave out falls back to its
   default and nothing is remembered between frames.

   COLOUR ROLES OF THIS VIDEO (tone names, the same as VID.l5.tone; D3.TONES lists them):
     "grey"   DATA ON DISK: records, log lines, segment files, neutral labels
     "blue"   THE REQUEST: the key we ask for (get), the scan pointer, the head of a pointer, the record being read
     "green"  good: found, newest, kept, written, the merged result, a tick
     "red"    dead or bad: a tombstone, an overwritten old copy that is dropped, a miss, "does not fit"
     "orange" ADDRESSES AND COSTS: byte offsets, step counters (O(n)), attention rings
     "purple" IN MEMORY: the hash map, the sparse index, the memtable (and the memory zone)
     D3.tone("red") -> {c, ink, dim, edge, lip, on} (CSS var() strings, same as VID.l5.tone: c = fill/icon, ink = text on a tint, dim =
     tint fill, edge = tint border, lip = sticker edge, on = text on a c fill). All text is 28 px or more; symbols are SVG, never glyphs.

   1. TAGS, CHIPS, STATS  (stickers; x, y = top-left of the element for tag/chip/stat/card/label, the CENTRE for disc/token)
        const t = D3.tag(parent, {x, y, text, tone: "grey", solid: false, h, fs: 28});  a pill. t.set({text, tone, solid, k: 1, x, y, s, o})
            k 0..1 pops it in (0 hides it); x, y = offset from where it was placed; s scale; o opacity. D3.tagW(text, fs) = width estimate
            (about 13 px per character + 40; a tag is about 58 px high).
        const c = D3.chip(parent, {x, y, w: 96, h: 76, text, tone: "grey", fs: 40, solid: false, radius: 22});  a rounded tile of any size.
            c.set({text, tone, solid, ghost, k, x, y, s, sx, o, ring: tone, ringK})  ghost = dashed outline; sx = extra horizontal squash
            (0 = edge on); ring draws a coloured ring just outside it.
        const s = D3.stat(parent, {x, y, w: 270, h: 80, label, tone: "orange"});  label left, a big number right.
            s.set({text, tone, solid, bump: 0..1 (V.flash pulse), k, o, x, y})
        const d = D3.disc(parent, {x, y, size: 64, text, tone: "orange"});  a solid round number. d.set({text, tone, solid: true, k, x, y, s, o})
        const m = D3.token(parent, {tone: "blue", size: 30});  a round marker. m.set({x, y, s, o, tone})
        const b = D3.card(parent, {x, y, w, h, text, tone: "grey", plain: true, fs: 28});  a panel with centred text.
            b.set({text, tone, plain, k, x, y, s, o});  b.el (append your own absolutely placed children to it)
        const l = D3.label(parent, {x, y, w, text, tone: "grey", fs: 28, align: "center"});  plain text (grey = dim; a tone = its ink shade).
            l.set({text, tone, k, x, y, o, bold})   k 0..1 rises 8 px and fades in.
   2. SVG PICTOGRAMS AND LINES  (append to your own L5.svg(parent, w, h) layer; drawn at absolute coordinates, so V.place(g, {x, y, s, r, o})
      moves and scales the icons from where they are drawn; x, y = centre)
        D3.disk(x, y, size = 120, tone = "grey")      a database drum (a stack of three bands), about `size` wide and 1.1 x `size` high
        D3.ram(x, y, size = 120, tone = "purple")     a memory chip: a body with four pins above and below, about `size` wide
        const p = D3.ptr(svgLayer, {tone: "blue", w: 7, head: 22, bow: 0});   an arrow you can MOVE every frame (the pointer of a map entry,
            the jump to an offset). p.set({x1, y1, x2, y2, k: 1 (draw-on 0..1), o: 1, tone, bow})  p.el
        const r = D3.span(svgLayer, {tone: "green", w: 7, up: false});   a bracket under (up: true = over) a stretch of a row.
            r.set({x1, x2, y, k: 1 (grows from x1 to x2), o, tone})  r.el;   y = the bracket's line, its two ends reach 14 px towards the row
        VID.l5.tick / cross / arrow / drawOn / badge / svg come from l5 (arrow(x1, y1, x2, y2, tone, o, {w, head, bow}); a tombstone cross
        is L5.cross(x, y, size, "red")).
   3. TOOLS
        D3.seq(t, t0, step, dur, i) -> 0..1: ramp of the i-th item of a staggered list (item i runs from t0 + i * step for dur s)
        D3.along(points, f) -> {x, y}: the point at fraction f (0..1) of the way along a polyline of {x, y} points (a chip travelling a route)
        D3.pop(k) -> {s, o}: the usual pop-in of an element, scale 0.5 -> 1 (overshoot) with a quick fade, from a ramp k 0..1
        (more pieces: record lists, map entries and panels in common-3.js; the merge rig and the memtable tree in common-4.js) */
(function () {
  const V = window.VID;
  const D3 = V.d3;
  const L5 = V.l5;
  const { clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  D3.f1 = f1;
  D3.TONES = ["green", "red", "orange", "blue", "purple", "grey"];
  const tn = (t) => {
    if (!D3.TONES.includes(t)) throw new Error(`VID.d3: unknown tone "${t}" (use ${D3.TONES.join(", ")})`);
    return t;
  };
  D3.tn = tn;
  D3.tone = (name) => L5.tone(tn(name));
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
  const unit = (v) => [v[0] / (Math.hypot(v[0], v[1]) || 1), v[1] / (Math.hypot(v[0], v[1]) || 1)];
  const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s];
  Object.assign(D3, { abs, flex, setText, setClass, D });

  D3.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  D3.tagW = (text, fs = 28) => Math.round(String(text).length * fs * 0.465 + 40);
  D3.pop = (k) => ({ s: 0.5 + 0.5 * E.pop(clamp(k)), o: Math.min(1, clamp(k) * 4) });
  D3.along = (pts, f) => {
    const lens = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
    let left = clamp(f) * lens.reduce((a, b) => a + b, 0);
    for (let i = 0; i < lens.length; i++) {
      if (left <= lens[i] || i === lens.length - 1) {
        const q = lens[i] ? Math.min(1, left / lens[i]) : 1;
        return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * q, y: pts[i].y + (pts[i + 1].y - pts[i].y) * q };
      }
      left -= lens[i];
    }
    return { x: pts[0].x, y: pts[0].y };
  };

  // ---------- 1. tags, chips, stats ----------
  const popOf = (st, base = 0.8, mix = 0.2) => (st.s ?? 1) * (base + mix * E.pop(clamp(st.k ?? 1)));
  const fadeOf = (st) => Math.min(1, clamp(st.k ?? 1) * 4) * (st.o ?? 1);
  Object.assign(D3, { popOf, fadeOf });
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
          ring.style.borderColor = D3.tone(st.ring).c;
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
  D3.solidStyle = solidStyle;
  function stat(parent, o = {}) {
    const { x = 0, y = 0, w = 270, h = 80, label = "total", tone: base = "orange" } = o;
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
        el.style.color = tone === "grey" ? "" : D3.tone(tone).ink;
        el.style.fontWeight = st.bold ? "900" : "";
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: (st.y || 0) + (1 - k) * 8, o: k * (st.o ?? 1) });
      },
    };
  }
  Object.assign(D3, { tag, chip, stat, disc, token, card, label });

  // ---------- 2. svg pictograms and lines ----------
  const pathOf = (d, extra = {}) =>
    V.s("path", { d, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", ...extra });
  /** A database drum: a lip (the sticker edge) behind a body with a top ellipse and two band lines. */
  D3.disk = (x, y, size = 120, tone = "grey") => {
    const t = D3.tone(tn(tone));
    const [rx, ry, h] = [size / 2, size * 0.17, size * 1.1];
    const [x0, y0] = [x - rx, y - h / 2];
    const body = (dy) =>
      `M ${f1(x0)} ${f1(y0 + ry + dy)} A ${f1(rx)} ${f1(ry)} 0 0 1 ${f1(x0 + size)} ${f1(y0 + ry + dy)} V ${f1(y0 + h - ry + dy)} A ${f1(rx)} ${f1(ry)} 0 0 1 ${f1(x0)} ${f1(y0 + h - ry + dy)} Z`;
    const band = (k) =>
      pathOf(
        `M ${f1(x0)} ${f1(y0 + ry + (h - 2 * ry) * k)} A ${f1(rx)} ${f1(ry)} 0 0 0 ${f1(x0 + size)} ${f1(y0 + ry + (h - 2 * ry) * k)}`,
        { "stroke-width": 4, style: { stroke: t.edge } },
      );
    const lip = V.s("path", { d: body(size * 0.06), "stroke-width": 4, style: { fill: t.edge, stroke: t.edge } });
    const main = V.s("path", { d: body(0), "stroke-width": 4, style: { fill: t.dim, stroke: t.edge } });
    const top = V.s("ellipse", {
      cx: f1(x),
      cy: f1(y0 + ry),
      rx: f1(rx),
      ry: f1(ry),
      "stroke-width": 4,
      style: { fill: t.dim, stroke: t.edge },
    });
    return V.s("g", {}, lip, main, band(0.4), band(0.8), top);
  };
  /** A memory chip: a rounded body with four pins above and four below, and a notch. */
  D3.ram = (x, y, size = 120, tone = "purple") => {
    const t = D3.tone(tn(tone));
    const [w, h, pw, ph] = [size, size * 0.62, size * 0.1, size * 0.14];
    const [x0, y0] = [x - w / 2, y - h / 2];
    const pins = [0, 1, 2, 3].flatMap((i) => {
      const px = x0 + w * (0.14 + 0.24 * i);
      return [y0 - ph + 3, y0 + h - 3].map((py) =>
        V.s("rect", { x: f1(px), y: f1(py), width: f1(pw), height: f1(ph), rx: 3, style: { fill: t.edge } }),
      );
    });
    const lipBody = V.s("rect", {
      x: f1(x0),
      y: f1(y0 + size * 0.05),
      width: f1(w),
      height: f1(h),
      rx: f1(size * 0.1),
      "stroke-width": 4,
      style: { fill: t.edge, stroke: t.edge },
    });
    const body = V.s("rect", {
      x: f1(x0),
      y: f1(y0),
      width: f1(w),
      height: f1(h),
      rx: f1(size * 0.1),
      "stroke-width": 4,
      style: { fill: t.dim, stroke: t.edge },
    });
    const notch = pathOf(
      `M ${f1(x0)} ${f1(y - h * 0.18)} A ${f1(h * 0.18)} ${f1(h * 0.18)} 0 0 1 ${f1(x0)} ${f1(y + h * 0.18)}`,
      { "stroke-width": 4, style: { stroke: t.edge } },
    );
    const mid = pathOf(`M ${f1(x - w * 0.22)} ${f1(y)} H ${f1(x + w * 0.22)}`, {
      "stroke-width": 6,
      style: { stroke: t.c },
    });
    return V.s("g", {}, ...pins, lipBody, body, notch, mid);
  };
  const arrowGeo = (x1, y1, x2, y2, head, bow) => {
    const u = unit([x2 - x1, y2 - y1]);
    const c = [(x1 + x2) / 2 + u[1] * bow * 2, (y1 + y2) / 2 - u[0] * bow * 2];
    const dir = unit([x2 - c[0], y2 - c[1]]);
    const base = add([x2, y2], dir, -head);
    return {
      line: D("M", [x1, y1], "Q", c, add([x2, y2], dir, -head * 0.75)),
      tri: D(
        "M",
        [x2, y2],
        "L",
        add(base, [-dir[1], dir[0]], head * 0.46),
        "L",
        add(base, [-dir[1], dir[0]], -head * 0.46),
        "Z",
      ),
    };
  };
  D3.ptr = (parent, o = {}) => {
    const { tone: base = "blue", w = 7, head = 22, bow: bow0 = 0 } = o;
    const line = V.s("path", {
      fill: "none",
      pathLength: "1",
      "data-draw": "1",
      "stroke-width": f1(w),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    const tri = V.s("path", { "stroke-width": "3", "stroke-linejoin": "round", "data-head": "1" });
    const g = V.s("g", {}, line, tri);
    parent.append(g);
    return {
      el: g,
      set(st = {}) {
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0, k = 1, o: op = 1, tone = base, bow = bow0 } = st;
        const geo = arrowGeo(x1, y1, x2, y2, head, bow);
        line.setAttribute("d", geo.line);
        tri.setAttribute("d", geo.tri);
        const c = D3.tone(tn(tone)).c;
        line.style.stroke = c;
        tri.style.fill = c;
        tri.style.stroke = c;
        L5.drawOn(g, k);
        V.show(g, op);
      },
    };
  };
  D3.span = (parent, o = {}) => {
    const { tone: base = "green", w = 7, up = false } = o;
    const line = V.s("path", {
      fill: "none",
      pathLength: "1",
      "data-draw": "1",
      "stroke-width": f1(w),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    const g = V.s("g", {}, line);
    parent.append(g);
    return {
      el: g,
      set(st = {}) {
        const { x1 = 0, x2 = 0, y = 0, k = 1, o: op = 1, tone = base } = st;
        const d = up ? 14 : -14; // the ends reach towards the row
        line.setAttribute("d", D("M", [x1, y + d], "L", [x1, y], "L", [x2, y], "L", [x2, y + d]));
        line.style.stroke = D3.tone(tn(tone)).c;
        L5.drawOn(g, k);
        V.show(g, op);
      },
    };
  };
})();

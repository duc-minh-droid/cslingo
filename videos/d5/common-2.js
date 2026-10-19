/* Lecture 5 · Partitioning: the small drawing pieces every scene shares (VID.d5, short name D5). Needs videos/l5/common.js and
   d5/common.js loaded first (see videos/ds-5.html). Positions are the parent's pixels (the stage is 936 x 640, origin top-left;
   keep a 12 px margin). EVERY CALL IS PURE: call set() every frame from your scene's update(t) with everything you want to see;
   anything you leave out falls back to its default and nothing is remembered between frames.

   TONES (colour roles of this video; D5.TONES lists them):  "blue" the data and what we ask about (keys, orders, records, the
   query, the search word);  "green" even, fits, cheap, healthy (a fair node, a tick, "asked 1 node");  "red" overload, overflow,
   hot spot, expensive ("asked 4 nodes", "moved 9 of 12");  "orange" attention and things in motion (the new node, the key being
   placed, a pointer, a hashed number, a stolen partition);  "purple" the routing rule or lookup table (range tags A-F, hash
   ranges, the hash box, the index, "key mod N", the size limit);  "grey" neutral (idle nodes, empty slots, the rest).
     D5.tone("red") -> {c, ink, dim, edge, lip, on}   (CSS var() strings, same as VID.l5.tone)

   1. CHIP  (one record, key, order, partition or number; class .v-gene; THE moving piece of the video)
        const c = D5.chip(parent, {text: "101", tone: "blue", w: 60, h: 48, fs: 28, radius: 14, lip: 5});
        c.set({x, y, s, sx, r, o, tone, text, solid, ghost, dashed, ring, ringK, ringDash})
            x, y = the CENTRE of the chip in parent px (not an offset: put it where you want it, e.g. cl.slot(2, 1));
            s scale, sx extra horizontal squash, r degrees, o opacity (0 hides it); solid = filled in the tone (text in its -on
            shade); ghost = dashed outline, no fill (an empty slot); dashed = dashed outline but filled (a follower copy);
            ring = tone name draws a coloured ring just outside (ringK 0..1 pops it in, ringDash true = dashed).
        D5.chipW(text, fs = 28) -> a chip width that fits the text (about 0.6 x fs per character plus 24)
        c.el, c.w, c.h
   2. TAGS, COUNTERS, DISCS
        const t = D5.tag(parent, {x, y, text, tone: "grey", solid: false, fs: 28, h, w, icon});   a pill sticker (x, y = top-left);
            icon: "search" | "client" | "hash" | "plus" | "server" puts that small icon before the text (about 42 px wider)
            t.set({text, tone, solid, k: 1, x, y, s, o})   k 0..1 pops it in (and fades it out when going back to 0); x, y =
            offset from where it was placed.  w fixes the width (text centred), so you can centre a tag: x = cx - w / 2.
            D5.tagW(text, fs = 28) -> estimated width (about 0.465 x fs per character plus 40). A tag is 58 px high at 28 px.
        const s = D5.stat(parent, {x, y, w: 270, h: 80, label: "asked", tone: "blue"});  label left, a big number right
            s.set({text, tone, solid, bump: 0..1 (a pulse: V.flash(t, a, b)), k, o, x, y})
        const d = D5.disc(parent, {x, y, size: 64, text: "11", tone: "orange"});   round solid sticker with a number (x, y =
            CENTRE).  d.set({text, tone, solid: true, k, x, y, s, o})   x, y = offset from where it was placed
   3. MOTION AND TIMING
        D5.fly(a, b, k, {arc: 0}) -> {x, y}   the point at progress k (0..1, ease it first) from a to b, both {x, y}; arc bends the
            path sideways by that many px at the middle (positive = up when travelling right, negative = down), so things do not
            slide through each other.   D5.appear(k) -> {s, o}   a pop-in to spread into chip.set;   D5.seq(t, t0, step, dur, i) -> 0..1, the
            ramp of the i-th item of a staggered list (item i starts at t0 + i * step and lasts dur);  D5.lerp2(a, b, k)
   4. SVG ICONS  (return a <g> drawn at absolute coordinates, x, y = CENTRE; append to your own L5.svg(parent) layer and move
      with V.place(g, {x, y, s, r, o}); tone = a tone name, omit it to inherit the colours of the enclosing .c-<tone> element (grey when there is none), "ink" for the
      -ink shade of that element, or "on" for its -on shade, for use on a solid fill)
        D5.icon.server(x, y, size, tone)   a server rack (two units with lights): the node symbol
        D5.icon.client(x, y, size, tone)   a laptop: who sends the requests
        D5.icon.hash(x, y, size, tone)     the # sign, drawn with four strokes: the hash function
        D5.icon.search(x, y, size, tone)   a magnifier: a search or query
        D5.icon.plus(x, y, size, tone)     a plus sign: a new item or node joins
        VID.l5.tick / cross / arrow / drawOn / badge / svg as in lecture 5 (arrows draw on with L5.drawOn(g, k)). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const L5 = V.l5;
  const { clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  D5.f1 = f1;
  D5.TONES = ["blue", "green", "red", "orange", "purple", "grey"];
  const tn = (t) => {
    if (!D5.TONES.includes(t)) throw new Error(`VID.d5: unknown tone "${t}" (use ${D5.TONES.join(", ")})`);
    return t;
  };
  D5.tn = tn;
  D5.tone = (name) => L5.tone(tn(name));
  const INHERIT = {
    c: "var(--c, var(--text-dim))",
    ink: "var(--c-ink, var(--text-dim))",
    dim: "var(--c-dim, var(--panel-2))",
    edge: "var(--c-edge, var(--line-2))",
    lip: "var(--c-lip, var(--line-2))",
    on: "var(--c-on, var(--ink))",
  };
  const INK = {
    ...INHERIT,
    c: "var(--c-ink, var(--text-dim))",
    edge: "var(--c-ink, var(--text-dim))",
    lip: "var(--c-ink, var(--text-dim))",
  };
  const ON = {
    c: "var(--c-on)",
    ink: "var(--c-on)",
    dim: "var(--c-dim)",
    edge: "var(--c-on)",
    lip: "var(--c-on)",
    on: "var(--c-on)",
  };
  const paint = (tone) => (tone === "on" ? ON : tone === "ink" ? INK : tone ? D5.tone(tone) : INHERIT);
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

  // ---------- 3. motion and timing ----------
  D5.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  D5.appear = (k) => ({ s: 0.6 + 0.4 * E.pop(k), o: clamp(k * 4) });
  D5.lerp2 = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
  D5.fly = (a, b, k, { arc = 0 } = {}) => {
    const p = D5.lerp2(a, b, k);
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const bow = arc * Math.sin(Math.PI * clamp(k));
    return { x: p.x + ((b.y - a.y) / len) * bow, y: p.y - ((b.x - a.x) / len) * bow };
  };
  D5.tagW = (text, fs = 28) => Math.round(String(text).length * fs * 0.465 + 40);
  D5.chipW = (text, fs = 28) => Math.round(String(text).length * fs * 0.6 + 24);

  // ---------- 1. chip ----------
  function chip(parent, o = {}) {
    const { text = "", tone: base = "blue", w = 60, h = 48, fs = 28, radius = 14, lip = 5 } = o;
    const pad = 8;
    const el = V.h("div", {
      class: `v-gene c-${tn(base)}`,
      text,
      style: { ...abs(-w / 2, -h / 2, w, h), fontSize: `${fs}px`, borderRadius: `${radius}px`, whiteSpace: "nowrap" },
    });
    const ring = V.h("div", {
      style: {
        ...abs(-w / 2 - pad, -h / 2 - pad, w + 2 * pad, h + 2 * pad),
        boxSizing: "border-box",
        border: "5px solid var(--blue)",
        borderRadius: `${radius + pad}px`,
        visibility: "hidden",
      },
    });
    parent.append(ring, el);
    const set = (st = {}) => {
      const solid = !!st.solid;
      const ghost = !!st.ghost;
      setClass(el, `v-gene c-${tn(st.tone || base)}${solid ? " solid" : ""}${ghost ? " ghost" : ""}`);
      setText(el, st.text);
      el.style.borderStyle = st.dashed || ghost ? "dashed" : "solid";
      el.style.boxShadow = ghost ? "none" : `0 ${lip}px 0 var(${solid ? "--c-lip" : "--c-edge"})`;
      const { x = 0, y = 0, s = 1, sx = 1, r = 0, o: op = 1 } = st;
      el.style.opacity = op >= 1 ? "" : String(Math.max(0, op));
      el.style.visibility = op <= 0.001 ? "hidden" : "";
      el.style.transform = `translate(${f1(x)}px, ${f1(y)}px) rotate(${r}deg) scale(${(s * sx).toFixed(3)}, ${s})`;
      const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
      if (st.ring && rk > 0.002 && op > 0.001) {
        ring.style.borderColor = D5.tone(st.ring).c;
        ring.style.borderStyle = st.ringDash ? "dashed" : "solid";
        ring.style.visibility = "";
        ring.style.opacity = String(Math.min(1, rk * 3) * Math.max(0, op));
        ring.style.transform = `translate(${f1(x)}px, ${f1(y)}px) scale(${((0.85 + 0.15 * E.pop(rk)) * s).toFixed(3)})`;
      } else ring.style.visibility = "hidden";
    };
    return { el, ring, set, w, h };
  }

  // ---------- 2. tags, counters, discs ----------
  function tag(parent, o = {}) {
    const el = V.h("div", {
      class: "v-tag",
      style: {
        ...abs(o.x || 0, o.y || 0, o.w),
        ...flex,
        fontSize: `${o.fs || 28}px`,
        ...(o.h ? { height: `${o.h}px` } : {}),
      },
    });
    const label = V.h("span", { text: o.text || "" });
    let icons = null;
    if (o.icon) {
      const svg = V.s("svg", {
        width: 34,
        height: 34,
        viewBox: "0 0 34 34",
        style: { flex: "none", marginRight: "8px", overflow: "visible", marginLeft: "-6px" },
      });
      icons = [icon[o.icon](17, 17, 30, "ink"), icon[o.icon](17, 17, 30, "on")];
      svg.append(...icons);
      el.append(svg);
    }
    el.append(label);
    parent.append(el);
    const base = { tone: o.tone || "grey", solid: !!o.solid };
    return {
      el,
      set(st = {}) {
        const solid = st.solid ?? base.solid;
        setClass(el, `v-tag c-${tn(st.tone || base.tone)}${solid ? " solid" : ""}`);
        setText(label, st.text);
        if (icons) icons.forEach((g, i) => V.show(g, +(i === +solid)));
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.8 + 0.2 * E.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
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
    const lab = V.h("span", { text: label, style: { fontSize: "28px", fontWeight: "800" } });
    const val = V.h("span", { text: "0", style: { fontSize: "50px", fontWeight: "900", lineHeight: "1" } });
    el.append(lab, val);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card c-${tn(st.tone || base)}`);
        Object.assign(el.style, solidStyle(!!st.solid));
        setText(val, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (0.8 + 0.2 * E.pop(k)) * (1 + 0.1 * (st.bump || 0)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
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
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.7 + 0.3 * E.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }

  // ---------- 4. svg icons ----------
  const line = (d, w, colour, extra = {}) =>
    V.s("path", {
      d,
      fill: "none",
      "stroke-width": f1(w),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      style: { stroke: colour },
      ...extra,
    });
  const rect = (x, y, w, h, r, fill, stroke, sw) =>
    V.s("rect", {
      x: f1(x),
      y: f1(y),
      width: f1(w),
      height: f1(h),
      rx: f1(r),
      "stroke-width": f1(sw),
      style: { fill, stroke },
    });
  const dot = (x, y, r, fill) => V.s("circle", { cx: f1(x), cy: f1(y), r: f1(r), style: { fill } });
  const icon = {
    server(x, y, size, tone) {
      const t = paint(tone);
      const [w, u] = [size, size * 0.4];
      const unit = (dy) => [
        rect(x - w / 2, y + dy, w, u, u * 0.3, "var(--panel)", t.edge, Math.max(2.5, size * 0.07)),
        dot(x - w / 2 + u * 0.5, y + dy + u / 2, size * 0.065, t.c),
        dot(x - w / 2 + u * 1.0, y + dy + u / 2, size * 0.065, t.edge),
      ];
      return V.s("g", {}, ...unit(-size * 0.46), ...unit(size * 0.06));
    },
    client(x, y, size, tone) {
      const t = paint(tone);
      const sw = Math.max(2.5, size * 0.07);
      return V.s(
        "g",
        {},
        rect(x - size * 0.4, y - size * 0.42, size * 0.8, size * 0.56, size * 0.07, "var(--panel)", t.edge, sw),
        line(D("M", [x - size * 0.5, y + size * 0.28], "L", [x + size * 0.5, y + size * 0.28]), sw * 1.4, t.edge),
        dot(x, y - size * 0.14, size * 0.07, t.c),
      );
    },
    hash(x, y, size, tone) {
      const t = paint(tone);
      const [a, b] = [size * 0.17, size * 0.42];
      const w = Math.max(4, size * 0.13);
      const d = D(
        "M",
        [x - a - 0.07 * size, y - b],
        "L",
        [x - a + 0.07 * size, y + b],
        "M",
        [x + a - 0.07 * size, y - b],
        "L",
        [x + a + 0.07 * size, y + b],
      );
      const d2 = D("M", [x - b, y - a], "L", [x + b, y - a], "M", [x - b, y + a], "L", [x + b, y + a]);
      return V.s("g", {}, line(d, w, t.c), line(d2, w, t.c));
    },
    search(x, y, size, tone) {
      const t = paint(tone);
      const w = Math.max(4, size * 0.12);
      const [cx, cy, r] = [x - size * 0.1, y - size * 0.1, size * 0.3];
      return V.s(
        "g",
        {},
        V.s("circle", {
          cx: f1(cx),
          cy: f1(cy),
          r: f1(r),
          "stroke-width": f1(w),
          style: { fill: "var(--panel)", stroke: t.c },
        }),
        line(D("M", [cx + r * 0.72, cy + r * 0.72], "L", [x + size * 0.42, y + size * 0.42]), w * 1.25, t.c),
      );
    },
    plus(x, y, size, tone) {
      const t = paint(tone);
      const a = size * 0.36;
      return V.s(
        "g",
        {},
        line(D("M", [x - a, y], "L", [x + a, y], "M", [x, y - a], "L", [x, y + a]), Math.max(5, size * 0.17), t.c),
      );
    },
  };

  Object.assign(D5, { chip, tag, stat, disc, icon, abs, flex, setText, setClass, D });
})();

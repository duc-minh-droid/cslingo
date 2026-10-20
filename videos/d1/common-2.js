/* Lecture 1 · Reliable, scalable and maintainable systems: the small drawing pieces every scene shares (VID.d1, short name D1).
   Needs videos/l5/common.js and d1/common.js loaded first (see videos/ds-1.html). Positions are the parent's pixels (the stage is
   936 x 640, origin top-left). EVERY CALL IS PURE: call set() / update() each frame from your scene's update(t) with everything you
   want to see; anything you leave out falls back to its default and nothing is remembered between frames.

   TONES (colour roles of this video, the same in every scene): "blue" traffic: requests, load, the work, the thing we look at;
   "green" healthy / served / fast / correct / a hit / a tick; "red" broken / dropped / failed / slow / stale / wrong; "orange"
   a limit, a cost, a fault, attention (a machine near capacity, the number to watch); "purple" the extra piece that helps:
   copies, cache, index, load balancer, mailbox, the abstraction layer; "grey" neutral machine, box or background.
   D1.TONES lists them; D1.tone("red") -> {c, ink, dim, edge, lip, on} (CSS var() strings, same as VID.l5.tone: c = fill or
   icon, ink = text on a tint, dim = tint fill, edge = tint border, lip = sticker edge, on = text on a c fill).

   1. TAGS, CHIPS, COUNTERS  (HTML stickers; x, y = top-left unless noted; set() offsets are relative to where it was placed)
        const t = D1.tag(parent, {x, y, text, tone: "grey", solid: false, h, fs: 28});   a pill (about 58 px high)
            t.set({text, tone, solid, k: 1, x, y, s, o})   k 0..1 pops it in (a tag not yet popped needs set({k: 0}) every frame)
            D1.tagW(text, fs = 28) -> estimated width in px (about 13 px per character plus 40)
        const c = D1.chip(parent, {x, y, w, h, text, tone, fs, solid, radius});   any rounded tile (a number, a name, a unit)
            c.set({text, tone, solid, ghost, k, x, y, s, sx, o, ring, ringK})   ghost = dashed empty slot; ring = tone name
        const n = D1.stat(parent, {x, y, w: 270, h: 80, label, tone});   a label on the left and a big number on the right
            n.set({text, tone, solid, bump: 0..1 (a pulse: V.flash(t, a, b)), k, o, x, y})
        const d = D1.disc(parent, {x, y, size: 64, text, tone});   a round solid sticker (x, y = its CENTRE)
            d.set({text, tone, solid, k, x, y, s, o})
        const m = D1.token(parent, {tone, size: 30, square: false});   a round (or rounded-square) marker, x, y = CENTRE
            m.set({x, y, s, o, tone, r})
        const b = D1.card(parent, {x, y, w, h, text, tone: "grey", plain: true, fs: 28});   a sticker box with centred text
            b.set({text, tone, plain, k, x, y, s, o})
        const l = D1.label(parent, {x, y, w, text, tone: "grey", fs: 28, align: "center"});   plain text (tone = its -ink colour)
            l.set({text, tone, k, x, y, o, bold})   (a label wider than w wraps: give it enough width)
   2. ICONS  (now in common-5.js, load it right after this file; SVG <g> at absolute coordinates, x, y = centre, size = about the height; append to your own L5.svg(parent) layer;
      V.place(g, {x, y, s, r, o}) moves, scales and fades them; tone = a tone name)
        D1.icon.server(x, y, size, tone)    a rack with two slots and an LED          D1.icon.disk(x, y, size, tone)  a round disk
        D1.icon.db(x, y, size, tone)        a database cylinder                       D1.icon.person(x, y, size, tone)
        D1.icon.mailbox(x, y, size, tone)   a mailbox with a flag                     D1.icon.envelope(x, y, size, tone)  a tweet
        D1.icon.bolt(x, y, size, tone)      a fault                                   D1.icon.bug(x, y, size, tone)  a software bug
        D1.icon.clock(x, y, size, tone)     a stopwatch                               D1.icon.moon / sun(x, y, size, tone)
        D1.icon.gear(x, y, size, tone)      a gear (rotate it with V.place r)         D1.icon.doc(x, y, size, tone)  a report
        D1.icon.wrench(x, y, size, tone)    D1.icon.spark(x, y, size, tone)  a burst (a cut, an alarm)
        D1.mark(kind, x, y, size, tone)     kind "times" | "plus" | "equals" | "minus"   (use these instead of x + = glyphs)
        plus VID.l5.tick(x, y, size, tone, {w, ink, on}) / cross / arrow(x1, y1, x2, y2, tone, o, {w, head, bow}) / drawOn(g, k) /
        svg(parent, w, h) (a full-stage <svg> layer) from l5.
   3. TIMING AND PATH TOOLS
        D1.seq(t, t0, step, dur, i) -> 0..1: the ramp of the i-th item of a staggered list (item i runs from t0 + i * step)
        D1.poly([[x, y], ...]) -> {len, at(f) -> {x, y, dx, dy}}   a polyline you can walk along with f in 0..1 (dx, dy = heading)
        D1.lerp2(a, b, f) -> [x, y]
        D1.loop(t, t0, period) -> time inside the current cycle, -1 before t0 (for things that repeat while a scene holds) */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  D1.TONES = ["green", "red", "orange", "blue", "purple", "grey"];
  const tn = (t) => {
    if (!D1.TONES.includes(t)) throw new Error(`VID.d1: unknown tone "${t}" (use ${D1.TONES.join(", ")})`);
    return t;
  };
  D1.tone = (name) => L5.tone(tn(name));
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
  const solidStyle = (on) => ({
    background: on ? "var(--c)" : "",
    borderColor: on ? "var(--c-lip)" : "",
    boxShadow: on ? "0 6px 0 var(--c-lip)" : "",
    color: on ? "var(--c-on)" : "",
  });
  D1.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  D1.tagW = (text, fs = 28) => Math.round(String(text).length * fs * 0.465 + 40);
  D1.lerp2 = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  D1.loop = (t, t0, period) => (t < t0 ? -1 : (t - t0) % period);
  D1.poly = (pts) => {
    const segs = pts.slice(1).map((p, i) => ({ a: pts[i], b: p, len: Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]) }));
    const len = segs.reduce((s, g) => s + g.len, 0);
    return {
      len,
      at(f) {
        let d = clamp(f) * len;
        for (const g of segs) {
          if (d <= g.len || g === segs[segs.length - 1]) {
            const u = g.len ? clamp(d / g.len) : 0;
            const [dx, dy] = g.len ? [(g.b[0] - g.a[0]) / g.len, (g.b[1] - g.a[1]) / g.len] : [1, 0];
            return { x: g.a[0] + (g.b[0] - g.a[0]) * u, y: g.a[1] + (g.b[1] - g.a[1]) * u, dx, dy };
          }
          d -= g.len;
        }
        return { x: pts[0][0], y: pts[0][1], dx: 1, dy: 0 };
      },
    };
  };

  // ---------- 1. tags, chips, counters ----------
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
        const solid = st.solid ?? base.solid;
        setClass(el, `v-tag c-${tn(st.tone || base.tone)}${solid ? " solid" : ""}`);
        setText(el, st.text);
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
  function chip(parent, o = {}) {
    const { x = 0, y = 0, w = 100, h = 76, tone: base = "grey", fs = 40, solid: s0 = false } = o;
    const radius = o.radius ?? Math.round(Math.min(w, h) * 0.26);
    const el = V.h("div", {
      class: "v-gene",
      text: o.text || "",
      style: {
        ...abs(x, y, w, h),
        width: `${w}px`,
        height: `${h}px`,
        fontSize: `${fs}px`,
        borderRadius: `${radius}px`,
      },
    });
    const ring = V.h("div", {
      style: {
        ...abs(x - 8, y - 8, w + 16, h + 16),
        boxSizing: "border-box",
        border: "5px solid var(--violet)",
        borderRadius: `${radius + 8}px`,
        visibility: "hidden",
      },
    });
    parent.append(ring, el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-gene c-${tn(st.tone || base)}${(st.solid ?? s0) ? " solid" : ""}${st.ghost ? " ghost" : ""}`);
        setText(el, st.text);
        const k = clamp(st.k ?? 1);
        const [dx, dy, sc, sx] = [st.x || 0, st.y || 0, (st.s ?? 1) * (0.8 + 0.2 * E.pop(k)), st.sx ?? 1];
        const op = Math.min(1, k * 4) * (st.o ?? 1);
        el.style.opacity = op >= 1 ? "" : String(Math.max(0, op));
        el.style.visibility = op <= 0.001 ? "hidden" : "";
        el.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) scale(${(sc * sx).toFixed(3)}, ${sc.toFixed(3)})`;
        const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
        if (st.ring && rk > 0.002) {
          ring.style.borderColor = D1.tone(st.ring).c;
          ring.style.visibility = "";
          ring.style.opacity = String(Math.min(1, rk * 3) * op);
          ring.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) scale(${(0.85 + 0.15 * E.pop(rk)).toFixed(3)})`;
        } else ring.style.visibility = "hidden";
      },
    };
  }
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
  function token(parent, o = {}) {
    const { tone: base = "blue", size = 30, square = false } = o;
    const el = V.h("div", {
      class: `v-gene solid c-${tn(base)}`,
      style: {
        ...abs(0, 0, size, size),
        borderRadius: square ? `${Math.round(size * 0.3)}px` : "50%",
        borderWidth: `${Math.max(2, Math.round(size / 10))}px`,
        boxShadow: `0 ${Math.round(size / 8)}px 0 var(--c-lip)`,
      },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-gene solid c-${tn(st.tone || base)}`);
        el.style.left = `${f1((st.x || 0) - size / 2)}px`;
        el.style.top = `${f1((st.y || 0) - size / 2)}px`;
        V.place(el, { s: st.s ?? 1, o: st.o ?? 1, r: st.r || 0 });
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
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.9 + 0.1 * E.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }
  function label(parent, o = {}) {
    const { x = 0, y = 0, w = 200, fs = 28, align = "center", tone: base = "grey" } = o;
    const el = V.h("div", {
      class: "v-text dim",
      text: o.text || "",
      style: { ...abs(x, y, w), textAlign: align, fontSize: `${fs}px`, whiteSpace: "normal" },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setText(el, st.text);
        const tone = st.tone || base;
        el.style.color = tone === "grey" ? "" : D1.tone(tone).ink;
        el.style.fontWeight = st.bold ? "900" : "";
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: (st.y || 0) + (1 - k) * 8, o: k * (st.o ?? 1) });
      },
    };
  }

  const D = (...a) =>
    a.map((q) => (Array.isArray(q) ? `${f1(q[0])} ${f1(q[1])}` : typeof q === "number" ? f1(q) : q)).join(" ");
  Object.assign(D1, { tag, chip, stat, disc, token, card, label, abs, flex, setText, setClass, D, f1, tn });
})();

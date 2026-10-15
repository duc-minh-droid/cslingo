/* Phase 9 · Fourier Transform & FFT: tags, tiles, numbers and small icons (window.VID.a9, part 3 of 4; needs common.js and common-2.js).
   Positions are stage px (the stage is 936 x 640, origin top-left). EVERY set() is PURE: call it every frame from update(t) with
   everything you want to see; what you leave out falls back to its default and nothing is remembered between frames.
   Tones: "blue" "orange" "purple" "green" "red" "grey" (see the top of common-2.js for what each means in this video).

   1. TAGS AND COUNTERS  (28 px text minimum; a tag is about 58 px high)
        const t = A9.tag(parent, {x, y, text, tone: "grey", solid: false, h, fs: 28});   a pill sticker (x, y = top-left)
            t.set({text, tone, solid, k: 1, x, y, s, o})   k 0..1 pops it in; x, y = offset from where it was placed;   t.el
            A9.tagW(text, fs = 28) -> an estimate of the pill's width (about 0.52 x fs per character plus 40; "by frequency" is about 215 px).
        const c = A9.stat(parent, {x, y, w: 270, h: 80, label: "bars", tone: "blue"});   a card, label on the left and a big number on the right
            c.set({text, tone, solid, bump: 0..1 (one pulse: V.flash(t, a, b)), k, o})
        const d = A9.disc(parent, {x, y, size: 64, text: "6", tone: "orange"});   a round solid sticker with text (x, y = its CENTRE)
            d.set({text, tone, solid: true, k, x, y, s, o})
        const m = A9.token(parent, {tone: "blue", size: 30});   a round marker;  m.set({x, y, s, o, tone})  x, y = its CENTRE
        const b = A9.card(parent, {x, y, w: 130, h: 100, text: "", tone: "grey", plain: true, fs: 28});   a sticker box with centred text
            b.set({text, tone, plain, k: 1, x, y, s, o})   plain = white face with the tone's edge, false = the tone's tint
        const bx = A9.box(parent, {tone: "grey", plain: false, fs: 28});   a sticker box whose geometry you pass EVERY frame
            bx.set({x, y, w, h, text, tone, plain, k: 1, o: 1, s: 1})   x, y, w, h = absolute stage px (so a box can slide, split and shrink)
   2. TILES  (class .v-gene: a rounded square or rectangle; a sample x0, a result X1, a bin)
        const tl = A9.tile(parent, {x, y, w: 64, h: 64, text, tone: "blue", fs, radius});    x, y = top-left
            tl.set({text, tone, solid, ghost, x, y, s, sx, r, o, ring, ringK, ringDash})
              x, y = offset from where it was placed; s scale; sx extra horizontal squash (0 = edge on); r degrees; o opacity (0 hides it);
              solid = filled in the tone (text in its -on shade); ghost = dashed outline, no fill (an empty slot); ring = a tone name draws a
              coloured ring just outside the tile (ringK 0..1 pops it in, ringDash true = dashed).      tl.el;  tl.mid() -> {x, y} its centre
        const row = A9.tiles(parent, {x, y, texts: ["x0", ...], w, h, gap: 12, tone, tones: [per tile], fs, radius});   a row of tiles
            row.set(i, state) (as tl.set; x, y = offset from the tile's slot)   row.all((i) => state)   row.mid(i) -> {x, y} centre in parent px
            row.tiles (the A9.tile handles)   row.pos(i) -> x of slot i   row.width
   3. ICONS  (SVG: append to your own L5.svg(parent) layer; they are drawn at absolute coordinates, so V.place(g, {x, y, s, r, o}) moves them)
        A9.tick(x, y, size, tone = "green", {w, ink, on})  /  A9.cross(...)  /  A9.arrow(x1, y1, x2, y2, tone, o, {w, head, bow})  /  A9.drawOn(g, k)
            (the VID.l5 pictograms: x, y = centre; drawOn(g, k) draws a tick, cross or arrow on from 0 to 1)
        A9.stamp(g, k)    pops a tick / cross / arrow in AND draws it on with k 0..1 (what the recaps do)
        A9.svg(parent, w = 936, h = 640)   a full-stage <svg> layer already appended to parent
   4. TIMING TOOLS  (all pure; t and the times are local seconds)
        A9.seq(t, t0, step, dur, i) -> 0..1: the ramp of the i-th item of a staggered list starting at t0 (item i runs from t0 + i * step for dur s).
        A9.lin(t, a, b) -> 0..1 straight ramp;  A9.pop(k) -> {s, o, y}: a scale-in style for V.place (s 0.5 -> 1 with the spring, o fades in fast, y rises 14 px)
        A9.mixTo(a, b, k) -> a + (b - a) k   (an alias of V.lerp) */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { f1, tn, abs, flex, setText, setClass } = A9;

  A9.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  A9.lin = (t, a, b) => V.ramp(t, a, b, E.lin);
  A9.pop = (k) => ({ s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4), y: -(1 - E.out(k)) * 14 });
  A9.mixTo = V.lerp;
  A9.tagW = (text, fs = 28) => Math.round(String(text).length * fs * 0.52 + 40);
  A9.tick = L5.tick;
  A9.cross = L5.cross;
  A9.arrow = L5.arrow;
  A9.drawOn = L5.drawOn;
  A9.svg = L5.svg;
  A9.stamp = (g, k) => {
    L5.drawOn(g, V.ramp(k, 0.15, 1, E.lin));
    V.place(g, { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });
  };

  // ---------- 1. tags and counters ----------
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
        const tone = tn(st.tone || base.tone);
        const solid = st.solid ?? base.solid;
        setClass(el, `v-tag c-${tone}${solid ? " solid" : ""}`);
        setText(el, st.text ?? (o.text || ""));
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
        setText(val, st.text ?? "0");
        const k = clamp(st.k ?? 1);
        V.place(el, { s: (0.8 + 0.2 * E.pop(k)) * (1 + 0.1 * (st.bump || 0)), o: Math.min(1, k * 4) * (st.o ?? 1) });
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
        setText(el, st.text ?? (o.text || ""));
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
        setText(el, st.text ?? (o.text || ""));
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

  /* a sticker box whose size you set every frame (a box that splits in two, a panel that grows): x, y, w, h are ABSOLUTE stage px */
  function box(parent, o = {}) {
    const { tone: base = "grey", plain = false, fs = 28 } = o;
    const el = V.h("div", {
      class: `v-card${plain ? " plain" : ""} c-${tn(base)}`,
      style: { ...abs(0, 0, 10, 10), ...flex, fontSize: `${fs}px`, borderRadius: "22px", textAlign: "center" },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card${(st.plain ?? plain) ? " plain" : ""} c-${tn(st.tone || base)}`);
        setText(el, st.text ?? "");
        const { x = 0, y = 0, w = 10, h = 10, k = 1, o: op = 1, s = 1 } = st;
        Object.assign(el.style, {
          left: `${f1(x)}px`,
          top: `${f1(y)}px`,
          width: `${f1(Math.max(4, w))}px`,
          height: `${f1(Math.max(4, h))}px`,
        });
        V.place(el, { s: s * (0.94 + 0.06 * E.pop(clamp(k))), o: Math.min(1, clamp(k) * 4) * op });
      },
    };
  }

  // ---------- 2. tiles ----------
  function tile(parent, o = {}) {
    const { x = 0, y = 0, w = 64, h = 64, tone: base = "blue", text = "" } = o;
    const fs = o.fs || Math.round(Math.min(w, h) * 0.5);
    const radius = Math.round(o.radius ?? Math.min(w, h) * 0.23);
    const ringPad = Math.max(7, Math.round(Math.min(w, h) * 0.1));
    const ring = V.h("div", {
      style: {
        ...abs(x - ringPad, y - ringPad, w + 2 * ringPad, h + 2 * ringPad),
        boxSizing: "border-box",
        border: "5px solid var(--violet)",
        borderRadius: `${radius + ringPad}px`,
        visibility: "hidden",
      },
    });
    const el = V.h("div", {
      class: `v-gene c-${tn(base)}`,
      text,
      style: { ...abs(x, y, w, h), fontSize: `${fs}px`, borderRadius: `${radius}px` },
    });
    parent.append(ring, el);
    const set = (st = {}) => {
      setClass(el, `v-gene c-${tn(st.tone || base)}${st.solid ? " solid" : ""}${st.ghost ? " ghost" : ""}`);
      setText(el, st.text ?? text);
      const { x: dx = 0, y: dy = 0, s = 1, sx = 1, r = 0, o: op = 1 } = st;
      el.style.opacity = op >= 1 ? "" : String(Math.max(0, op));
      el.style.visibility = op <= 0.001 ? "hidden" : "";
      el.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) rotate(${r}deg) scale(${(s * sx).toFixed(3)}, ${s})`;
      const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
      if (st.ring && rk > 0.002) {
        ring.style.borderColor = A9.tone(st.ring).c;
        ring.style.borderStyle = st.ringDash ? "dashed" : "solid";
        ring.style.visibility = "";
        ring.style.opacity = String(Math.min(1, rk * 3) * Math.max(0, op));
        ring.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) scale(${(0.85 + 0.15 * E.pop(rk)).toFixed(3)})`;
      } else ring.style.visibility = "hidden";
    };
    return { el, set, mid: () => ({ x: x + w / 2, y: y + h / 2 }), w, h, x, y };
  }
  function tiles(parent, o = {}) {
    const { x = 0, y = 0, w = 64, h = 64, gap = 12, tone = "blue", texts = [] } = o;
    const row = texts.map((t, i) =>
      tile(parent, {
        x: x + i * (w + gap),
        y,
        w,
        h,
        text: t,
        tone: (o.tones && o.tones[i]) || tone,
        fs: o.fs,
        radius: o.radius,
      }),
    );
    return {
      tiles: row,
      width: texts.length * w + (texts.length - 1) * gap,
      pos: (i) => i * (w + gap),
      mid: (i) => ({ x: x + i * (w + gap) + w / 2, y: y + h / 2 }),
      set: (i, st) => row[i].set(st),
      all: (fn) => row.forEach((t, i) => t.set(fn(i) || {})),
    };
  }
  Object.assign(A9, { tag, stat, disc, token, card, box, tile, tiles });
})();

/* Phase 6 · Error Detection & Correction: the small drawing pieces every scene shares (VID.a6, short name A6). Needs
   videos/l5/common.js and a6/common.js loaded first (see videos/algo-6.html). Positions are the parent's pixels (the stage is
   936 x 640, origin top-left). EVERY CALL IS PURE: call set()/update() each frame from your scene's update(t) with everything
   you want to see; anything you leave out falls back to its default and nothing is remembered between frames.

   TONES (colour roles of this video): "green" good (a clean word, a passed check, remainder 000, a repaired bit, a tick),
   "red" bad (a flipped bit, a failed check, a wrong word, an alarm), "blue" what is being counted or looked at, "orange" a
   check bit / redundancy / attention (the parity bit, the CRC remainder, p1 p2 p4, a pointer), "purple" the rule applied (the
   generator 1101, XOR, the group a check is reading), "grey" neutral (data bits, things not in play). A6.TONES lists them.
     A6.tone("red") -> {c, ink, dim, edge, lip, on}   (CSS var() strings, same as VID.l5.tone: c = fill/icon, ink = text on a
     tint, dim = tint fill, edge = tint border, lip = sticker edge, on = text on a c fill).

   1. A ROW OF BIT TILES  (class .v-gene; the workhorse of the video)
        const row = A6.bits(parent, {x, y, bits: "10110010" | ["p1", "p2", "1"], size: 84, gap: 12, tone: "grey",
                                      tones: [per-tile tone], fs: size * 0.56 (font px), radius: size * 0.23});
        row.set(i, {text, tone, solid, ghost, x, y, s, sx, r, o, ring, ringK, ringDash})
            i = tile index. x, y = offset from the tile's own slot; s scale; sx extra horizontal squash (0 = edge on); r degrees;
            o opacity (0 hides it); text = the digit shown (default: the one given in bits); tone; solid = filled in the tone
            (text in its -on shade); ghost = dashed outline, no fill (an empty slot); ring = a tone name draws a coloured
            ring just outside the tile (ringK 0..1 pops it in, ringDash true = dashed).
        row.flip(i, k, {from, to, tone, toTone, hop, ...set fields})   k 0..1: the tile squashes edge-on, switches digit and
            tone at k 0.5 and opens again (hop = px it jumps).   For a noise hit: row.flip(1, k, {from: "0", to: "1", tone:
            "grey", toTone: "red", solid: false}).
        row.all((i) => state | undefined)   set every tile from one function
        row.pos(i) -> x of slot i inside the row;  row.mid(i) -> {x, y} centre of tile i in PARENT coordinates (use it to aim
            arrows, tags and tokens);  row.top(i) -> {x, y} the middle of its top edge;  row.bottom(i) -> {x, y} its bottom edge
        row.el (the row: V.place / V.show it to move or fade the whole row), row.tiles, row.n, row.size, row.gap, row.width,
            row.height, row.left, row.top0 (y of the row)
        With  labels: true  (or {texts: [...], dy: 0}) in the options the row also owns a line of small 28 px labels under every
            tile (dy < 0 puts them above the tiles; default texts 1, 2, 3 ... = the positions). Drive it every frame with
            row.labels(k, {tone, texts}) (k 0..1 fades them in, 0 hides them). For per-label colours build your own A6.labelRow.
   2. A ROW OF LABELS  (plain 28 px text centred under a column of tiles)
        const lab = A6.labelRow(parent, {x, y, texts: ["1","2"], size: 84, gap: 12, mono: false, fs: 28});   x = left of the first slot
        lab.set(i, {k, tone, text, o, bold})  k 0..1 rises 8 px and fades in;  tone "grey" = dim, or a tone name = its -ink colour
        lab.all(fn)  lab.pos(i) -> {x, y} centre
   3. TAGS AND COUNTERS
        const t = A6.tag(parent, {x, y, text, tone: "grey", solid: false, h, fs: 28});   a pill sticker (x, y = top-left)
            t.set({text, tone, solid, k: 1, x, y, s, o})  k 0..1 pops it in; x, y = offset from where it was placed
            t.el;  t.w, t.h are NOT known before layout: use A6.tagW(text, fs) for an estimate of the width.
        const c = A6.stat(parent, {x, y, w: 270, h: 80, label: "ones", tone: "blue"});   label on the left, a big number right
            c.set({text, tone, solid, bump: 0..1 (one pulse: V.flash(t, a, b)), k, o})
        const o = A6.disc(parent, {x, y, size: 64, text: "6", tone: "orange"});   a round solid sticker with a number inside
            (x, y = its CENTRE).  o.set({text, tone, solid: true, k, x, y, s, o})   x, y = offset
        const m = A6.token(parent, {tone: "blue", size: 30});   a round marker, m.set({x, y, s, o, tone})  x, y = its CENTRE
        const b = A6.card(parent, {x, y, w: 130, h: 100, text: "sender", tone: "grey", plain: true, fs: 28});   a sticker box with
            centred text (a panel, the sender / receiver stubs).  b.set({text, tone, plain, k: 1, x, y, s, o})   plain = white
            face with the tone's edge, false = the tone's tint
   4. SVG ICONS  (append to your own L5.svg(parent) layer; drawn at absolute coordinates, so V.place(g, {x, y, s, r, o}) moves
      and scales them; x, y = centre.  Strokes can be drawn on with VID.l5.drawOn(g, k).)
        A6.bolt(x, y, size, tone = "orange")      a lightning bolt (the noise).  Pop it in and out quickly.
        A6.xorIcon(x, y, size, tone = "purple")   a circle with a plus: the XOR sign.
        A6.qmark(x, y, size, tone = "orange")     a question mark (stroke + dot).
        VID.l5.tick(x, y, size, tone, {w, ink, on}) / .cross(...) / .arrow(x1, y1, x2, y2, tone, o, {w, head, bow}) / .drawOn(g, k)
        / .badge(parent, {x, y, w, h, valid: "text", invalid: "text"})  come from l5 (badge(state, k): "valid" green tick,
        "invalid" red cross, "none" hidden).
   5. TIMING TOOL
        A6.seq(t, t0, step, dur, i) -> 0..1: the ramp of the i-th item of a staggered list starting at t0 (item i runs from
            t0 + i * step for dur seconds).  Ease it yourself (E.out, E.pop, ...). */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  A6.TONES = ["green", "red", "orange", "blue", "purple", "grey"];
  const tn = (t) => {
    if (!A6.TONES.includes(t)) throw new Error(`VID.a6: unknown tone "${t}" (use ${A6.TONES.join(", ")})`);
    return t;
  };
  A6.tone = (name) => L5.tone(tn(name));
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
  A6.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  A6.tagW = (text, fs = 28) => Math.round(String(text).length * fs * 0.56 + 42);

  // ---------- 1. a row of bit tiles ----------
  function bits(parent, opt = {}) {
    const { x = 0, y = 0, size = 84, gap = 12, tone: base = "grey" } = opt;
    const texts = typeof opt.bits === "string" ? [...opt.bits] : (opt.bits || []).map(String);
    const n = texts.length;
    const width = n * size + (n - 1) * gap;
    const pos = (i) => i * (size + gap);
    const tone0 = (i) => tn((opt.tones && opt.tones[i]) || base);
    const fs = opt.fs || Math.round(size * 0.56);
    const radius = Math.round(opt.radius ?? size * 0.23);
    const el = V.h("div", { style: abs(x, y, width, size) });
    const ringPad = Math.max(7, Math.round(size * 0.1));
    const rings = texts.map((_, i) =>
      V.h("div", {
        style: {
          ...abs(pos(i) - ringPad, -ringPad, size + 2 * ringPad, size + 2 * ringPad),
          boxSizing: "border-box",
          border: "5px solid var(--violet)",
          borderRadius: `${radius + ringPad}px`,
          visibility: "hidden",
        },
      }),
    );
    const tiles = texts.map((t, i) =>
      V.h("div", {
        class: `v-gene c-${tone0(i)}`,
        text: t,
        style: { ...abs(pos(i), 0, size, size), fontSize: `${fs}px`, borderRadius: `${radius}px` },
      }),
    );
    el.append(...rings, ...tiles);
    parent.append(el);

    const set = (i, st = {}) => {
      const tile = tiles[i];
      setClass(tile, `v-gene c-${tn(st.tone || tone0(i))}${st.solid ? " solid" : ""}${st.ghost ? " ghost" : ""}`);
      setText(tile, st.text == null ? texts[i] : st.text);
      const { x: dx = 0, y: dy = 0, s = 1, sx = 1, r = 0, o = 1 } = st;
      tile.style.opacity = o >= 1 ? "" : String(Math.max(0, o));
      tile.style.visibility = o <= 0.001 ? "hidden" : "";
      tile.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) rotate(${r}deg) scale(${(s * sx).toFixed(3)}, ${s})`;
      const ring = rings[i];
      const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
      if (st.ring && rk > 0.002) {
        ring.style.borderColor = A6.tone(st.ring).c;
        ring.style.borderStyle = st.ringDash ? "dashed" : "solid";
        ring.style.visibility = "";
        ring.style.opacity = String(Math.min(1, rk * 3) * Math.max(0, o));
        ring.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) scale(${(0.85 + 0.15 * E.pop(rk)).toFixed(3)})`;
      } else ring.style.visibility = "hidden";
    };
    const flip = (i, k, st = {}) => {
      const kk = clamp(k);
      const { from = texts[i], to = texts[i], tone: t1, toTone, hop = 0, ...rest } = st;
      const second = kk >= 0.5;
      set(i, {
        ...rest,
        text: second ? to : from,
        tone: second ? toTone || t1 : t1,
        sx: Math.abs(Math.cos(Math.PI * kk)) * (rest.sx ?? 1),
        y: (rest.y || 0) - hop * Math.sin(Math.PI * kk),
      });
    };
    const row = {
      el,
      tiles,
      n,
      size,
      gap,
      width,
      height: size,
      left: x,
      top0: y,
      pos,
      mid: (i) => ({ x: x + pos(i) + size / 2, y: y + size / 2 }),
      top: (i) => ({ x: x + pos(i) + size / 2, y }),
      bottom: (i) => ({ x: x + pos(i) + size / 2, y: y + size }),
      set,
      flip,
      all: (fn) => texts.forEach((_, i) => set(i, fn(i) || {})),
    };
    const lo = opt.labels === true ? {} : opt.labels;
    const lab = lo
      ? A6.labelRow(parent, {
          x,
          y: lo.dy < 0 ? y + lo.dy : y + size + 10 + (lo.dy || 0),
          texts: lo.texts || texts.map((_, i) => String(i + 1)),
          size,
          gap,
        })
      : null;
    row.labels = (k, o = {}) => lab && lab.all((i) => ({ k, tone: o.tone || "grey", text: o.texts && o.texts[i] }));
    return row;
  }

  // ---------- 2. a row of labels ----------
  function labelRow(parent, opt = {}) {
    const { x = 0, y = 0, texts = [], size = 84, gap = 12, mono = false, fs = 28 } = opt;
    const els = texts.map((t, i) =>
      V.h("div", {
        class: `v-text dim${mono ? " v-mono" : ""}`,
        text: t,
        style: {
          ...abs(x + i * (size + gap), y, size),
          textAlign: "center",
          fontSize: `${fs}px`,
          visibility: "hidden",
        },
      }),
    );
    parent.append(...els);
    const set = (i, st = {}) => {
      const e = els[i];
      setText(e, st.text);
      const tone = st.tone || "grey";
      e.style.color = tone === "grey" ? "" : A6.tone(tone).ink;
      e.style.fontWeight = st.bold ? "900" : "";
      const k = clamp(st.k ?? 1);
      V.place(e, { y: (1 - k) * 8, o: k * (st.o ?? 1) });
    };
    return {
      els,
      set,
      all: (fn) => texts.forEach((_, i) => set(i, fn(i) || {})),
      pos: (i) => ({ x: x + i * (size + gap) + size / 2, y: y + fs * 0.6 }),
    };
  }

  // ---------- 3. tags and counters ----------
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

  // ---------- 4. svg icons ----------
  const D = (...a) =>
    a.map((q) => (Array.isArray(q) ? `${f1(q[0])} ${f1(q[1])}` : typeof q === "number" ? f1(q) : q)).join(" ");
  function bolt(x, y, size, tone = "orange") {
    const t = A6.tone(tone);
    const s = size;
    const pts = [
      [0.12, -0.5],
      [-0.32, 0.06],
      [-0.03, 0.06],
      [-0.14, 0.5],
      [0.32, -0.14],
      [0.04, -0.14],
    ];
    const d = D(
      "M",
      [x + pts[0][0] * s, y + pts[0][1] * s],
      ...pts.slice(1).flatMap((p) => ["L", [x + p[0] * s, y + p[1] * s]]),
      "Z",
    );
    return V.s("path", {
      d,
      "stroke-width": f1(Math.max(3, s * 0.07)),
      "stroke-linejoin": "round",
      style: { fill: t.c, stroke: t.lip },
    });
  }
  function xorIcon(x, y, size, tone = "purple") {
    const t = A6.tone(tone);
    const r = size / 2;
    const w = f1(Math.max(4, size * 0.11));
    const arm = r * 0.55;
    return V.s(
      "g",
      {},
      V.s("circle", {
        cx: f1(x),
        cy: f1(y),
        r: f1(r),
        "stroke-width": w,
        style: { fill: "var(--panel)", stroke: t.c },
      }),
      V.s("path", {
        d: D("M", [x - arm, y], "L", [x + arm, y], "M", [x, y - arm], "L", [x, y + arm]),
        fill: "none",
        "stroke-width": w,
        "stroke-linecap": "round",
        style: { stroke: t.c },
      }),
    );
  }
  function qmark(x, y, size, tone = "orange") {
    const t = A6.tone(tone);
    const s = size;
    const w = f1(Math.max(5, s * 0.16));
    const d = D(
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
    const hook = V.s("path", {
      d,
      fill: "none",
      pathLength: "1",
      "data-draw": "1",
      "stroke-width": w,
      "stroke-linecap": "round",
      style: { stroke: t.c },
    });
    const dot = V.s("circle", { cx: f1(x), cy: f1(y + 0.42 * s), r: f1(Math.max(4, s * 0.1)), style: { fill: t.c } });
    return V.s("g", {}, hook, dot);
  }

  Object.assign(A6, {
    bits,
    labelRow,
    tag,
    stat,
    disc,
    token,
    bolt,
    xorIcon,
    qmark,
    abs,
    flex,
    setText,
    setClass,
    D,
    f1,
    tn,
  });
})();

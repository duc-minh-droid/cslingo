/* Phase 10 · Transformers & Attention: the small drawing pieces every scene shares (VID.a10, short name A10). Needs videos/l5/common.js
   and a10/common.js loaded first (see videos/algo-10.html). Positions are the parent's pixels (the stage is 936 x 640, origin top-left).
   EVERY CALL IS PURE: call set() each frame from your scene's update(t) with everything you want to see; anything you leave out falls
   back to its default and nothing is remembered between frames. No text is ever smaller than 28 px (the helpers throw if you ask).

   TONES (colour roles of THIS video):  "purple" the QUERY (the word asking, the question), "blue" the KEYS and the numbers that
   describe a word (embedding, scores), "orange" what is ADDED or HANDED OVER (the position signal, the values, the skip path, the
   thing being compared), "green" the RESULT (shares and weights, the new vector, the model input, the winner), "red" BLOCKED or
   costly (the masked future, a cost that explodes), "grey" words and anything neutral.  A10.TONES lists them.
     A10.tone("red") -> {c, ink, dim, edge, lip, on}   (CSS var() strings: c = fill/icon, ink = text on a tint, dim = tint fill,
     edge = tint border, lip = sticker edge, on = text on a c fill).

   1. TEXT WIDTH  (real Nunito 900 advance widths: tags are exact, nothing is measured in the DOM)
        A10.textW(text, fs = 28) -> px width of the text      A10.tagW(text, fs = 28) -> px width of a tag holding it (text + 42)
   2. TAGS  (pill stickers; the video's labels and its words)
        const t = A10.tag(parent, {x, y, text, tone: "grey", solid: false, ghost: false, fs: 28, w, h: 58});   x, y = top-left
            w defaults to A10.tagW(text); the box is exactly w x h and the text is centred, so t.mid() etc. are exact.
            t.set({text, tone, solid, ghost, k: 1, x, y, s, r, o})   k 0..1 pops it in (scale 0.8 -> 1, fades in); x, y = offset from
            where it was built (like V.place); s scale; r degrees; o opacity.   ghost = dashed outline, no fill (an empty slot).
            t.el, t.w, t.h, t.x, t.y;  t.mid() -> {x, y} centre;  t.top() / t.bottom() / t.left() / t.right() -> {x, y} edge middles.
   3. CELLS  (a row or column of small number tiles: a vector, a chip, a strip; class .v-gene)
        const c = A10.cells(parent, {x, y, texts: ["1", "0.5"], w: 64, h: 56, gap: 6, dir: "row" | "col", tone: "grey",
                                      tones: [per-cell], fs: 28, radius: 14, solid: false});
        c.set(i, {text, tone, solid, ghost, x, y, s, sx, r, o, ring, ringK, ringDash})    i = cell index. x, y = offset from the cell's own
            slot; s scale; sx extra horizontal squash (0 = edge on); o opacity (0 hides it); ring = a tone name draws a coloured ring
            just outside the cell (ringK 0..1 pops it in); ghost = dashed empty cell; solid = filled in the tone.
        c.flip(i, k, {from, to, tone, toTone, hop, ...set fields})   k 0..1: the cell squashes edge-on, switches its text and tone at
            k 0.5 and opens again (hop = px it jumps).      c.all((i) => state | undefined)   set every cell from one function
        c.mid(i) -> {x, y} centre of cell i in PARENT coordinates;  c.top(i) / c.bottom(i) / c.left(i) / c.right(i) edge middles
        c.el (the whole strip: V.place / V.show it), c.n, c.w, c.h, c.gap, c.width, c.height, c.x, c.y.   Typical widths: a 1-digit
        cell 64, "0.14" 84, "−1.31" 100 (28 px text needs about 15 px per character + 24).
   4. DISCS AND CARDS
        const d = A10.disc(parent, {x, y, size: 56, text: "7", tone: "orange"});   a round solid sticker (x, y = its CENTRE; size >= 52
            so the 28 px text fits; text of 1 or 2 characters only, longer numbers go in A10.cells or A10.tag)   d.set({text, tone, solid: true, k: 1, x, y, s, o})   x, y = offset
        const b = A10.card(parent, {x, y, w: 190, h: 64, text: "Attention", tone: "grey", plain: true, fs: 28});   a sticker box with
            centred text (a block of a diagram)   b.set({text, tone, plain, k, x, y, s, o});  b.mid() / left() / right() / top() / bottom()
   5. SVG ICONS  (append to your own A10.svg(parent) layer; drawn at absolute coordinates, so V.place(g, {x, y, s, r, o}) moves and scales
      them; x, y = centre; tone "grey" draws them in the dim text colour)
        A10.op(kind, x, y, size, tone = "grey")   kind: "plus" | "minus" | "times" | "div" | "equals"   (never type + x / = as glyphs)
        A10.qmark(x, y, size, tone = "orange")    a question mark (stroke + dot)
        A10.svg(parent, w = 936, h = 640) -> a full-stage <svg> layer, already appended to parent (it is VID.l5.svg)
        VID.l5.tick(x, y, size, tone, {w, ink, on}) / .cross(...) / .arrow(x1, y1, x2, y2, tone, o, {w, head, bow}) / .drawOn(g, k)
   6. TIMING TOOLS
        A10.seq(t, t0, step, dur, i) -> 0..1: the ramp of the i-th item of a staggered list starting at t0 (item i runs from
            t0 + i * step for dur seconds). Ease it yourself (E.out, E.pop, ...).
        A10.pop(k) -> {s, o}: a springy appear for a tile (spread it into set: c.set(i, {...A10.pop(k)}))  */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  A10.TONES = ["green", "red", "orange", "blue", "purple", "grey"];
  const tn = (t) => {
    if (!A10.TONES.includes(t)) throw new Error(`VID.a10: unknown tone "${t}" (use ${A10.TONES.join(", ")})`);
    return t;
  };
  A10.tone = (name) => L5.tone(tn(name));
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
  const minFs = (fs, what) => {
    if (fs < 28) throw new Error(`VID.a10: ${what} text is ${fs}px, the minimum is 28`);
    return fs;
  };
  A10.svg = L5.svg;
  A10.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  A10.pop = (k) => ({ s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) });

  // ---------- 1. text width: advance widths of Nunito 900 per 100 px, characters 32..126 ----------
  const ADV = [
    29, 27, 51, 60, 60, 96, 77, 27, 41, 41, 46, 60, 27, 44, 27, 35, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 27, 27, 60,
    60, 60, 48, 95, 76, 70, 69, 79, 61, 58, 75, 79, 31, 39, 71, 58, 88, 76, 81, 68, 81, 71, 65, 64, 75, 74, 113, 70, 64,
    62, 40, 35, 40, 60, 50, 40, 57, 62, 48, 62, 55, 40, 63, 61, 28, 29, 58, 35, 90, 61, 60, 62, 62, 43, 50, 43, 60, 54,
    87, 57, 54, 49, 44, 32, 44, 60,
  ];
  const EXTRA = { "×": 60, "÷": 60, "−": 60, "“": 50, "”": 50, "’": 27, "·": 27, "…": 82 };
  A10.textW = (text, fs = 28) =>
    ([...String(text)].reduce((a, ch) => a + (EXTRA[ch] ?? ADV[ch.charCodeAt(0) - 32] ?? 60), 0) * fs) / 100;
  A10.tagW = (text, fs = 28) => Math.ceil(A10.textW(text, fs) + 42);

  // ---------- 2. tags ----------
  const ghostStyle = (g) => ({
    background: g ? "transparent" : "",
    borderStyle: g ? "dashed" : "",
    boxShadow: "none",
  });
  function tag(parent, o = {}) {
    const fs = minFs(o.fs || 28, "tag");
    const text0 = o.text || "";
    const w = o.w ?? A10.tagW(text0, fs);
    const h = o.h ?? 58;
    const [x, y] = [o.x || 0, o.y || 0];
    const el = V.h("div", {
      class: "v-tag",
      text: text0,
      style: { ...abs(x, y, w, h), ...flex, padding: "0", fontSize: `${fs}px` },
    });
    parent.append(el);
    const base = { tone: o.tone || "grey", solid: !!o.solid, ghost: !!o.ghost };
    const t = {
      el,
      w,
      h,
      x,
      y,
      mid: () => ({ x: x + w / 2, y: y + h / 2 }),
      top: () => ({ x: x + w / 2, y }),
      bottom: () => ({ x: x + w / 2, y: y + h }),
      left: () => ({ x, y: y + h / 2 }),
      right: () => ({ x: x + w, y: y + h / 2 }),
      set(st = {}) {
        const tone = tn(st.tone || base.tone);
        const solid = st.solid ?? base.solid;
        const ghost = st.ghost ?? base.ghost;
        setClass(el, `v-tag c-${tone}${solid ? " solid" : ""}`);
        Object.assign(el.style, ghostStyle(ghost));
        setText(el, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.8 + 0.2 * E.pop(k)),
          r: st.r || 0,
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
    return t;
  }

  // ---------- 3. cells ----------
  function cells(parent, o = {}) {
    const { x = 0, y = 0, w = 64, h = 56, gap = 6, dir = "row", tone: base = "grey" } = o;
    const fs = minFs(o.fs || 28, "cell");
    const texts = (o.texts || []).map(String);
    const n = texts.length;
    const radius = o.radius ?? 14;
    const row = dir === "row";
    const width = row ? n * w + (n - 1) * gap : w;
    const height = row ? h : n * h + (n - 1) * gap;
    const slot = (i) => (row ? { x: i * (w + gap), y: 0 } : { x: 0, y: i * (h + gap) });
    const tone0 = (i) => tn((o.tones && o.tones[i]) || base);
    const el = V.h("div", { style: abs(x, y, width, height) });
    const pad = 8;
    const rings = texts.map((_, i) =>
      V.h("div", {
        style: {
          ...abs(slot(i).x - pad, slot(i).y - pad, w + 2 * pad, h + 2 * pad),
          boxSizing: "border-box",
          border: "5px solid var(--violet)",
          borderRadius: `${radius + pad}px`,
          visibility: "hidden",
        },
      }),
    );
    const tiles = texts.map((t, i) =>
      V.h("div", {
        class: `v-gene c-${tone0(i)}`,
        text: t,
        style: { ...abs(slot(i).x, slot(i).y, w, h), fontSize: `${fs}px`, borderRadius: `${radius}px` },
      }),
    );
    el.append(...rings, ...tiles);
    parent.append(el);
    const set = (i, st = {}) => {
      const tile = tiles[i];
      const solid = !!(st.solid ?? o.solid);
      setClass(tile, `v-gene c-${tn(st.tone || tone0(i))}${solid ? " solid" : ""}${st.ghost ? " ghost" : ""}`);
      tile.style.boxShadow = st.ghost ? "none" : `0 4px 0 var(${solid ? "--c-lip" : "--c-edge"})`;
      setText(tile, st.text == null ? texts[i] : st.text);
      const { x: dx = 0, y: dy = 0, s = 1, sx = 1, r = 0, o: op = 1 } = st;
      tile.style.opacity = op >= 1 ? "" : String(Math.max(0, op));
      tile.style.visibility = op <= 0.001 ? "hidden" : "";
      tile.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) rotate(${r}deg) scale(${(s * sx).toFixed(3)}, ${s})`;
      const ring = rings[i];
      const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
      if (st.ring && rk > 0.002) {
        ring.style.borderColor = A10.tone(st.ring).c;
        ring.style.borderStyle = st.ringDash ? "dashed" : "solid";
        ring.style.visibility = "";
        ring.style.opacity = String(Math.min(1, rk * 3) * Math.max(0, op));
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
    const mid = (i) => ({ x: x + slot(i).x + w / 2, y: y + slot(i).y + h / 2 });
    return {
      el,
      n,
      w,
      h,
      gap,
      width,
      height,
      x,
      y,
      set,
      flip,
      all: (fn) => texts.forEach((_, i) => set(i, fn(i) || {})),
      mid,
      top: (i) => ({ x: mid(i).x, y: y + slot(i).y }),
      bottom: (i) => ({ x: mid(i).x, y: y + slot(i).y + h }),
      left: (i) => ({ x: x + slot(i).x, y: mid(i).y }),
      right: (i) => ({ x: x + slot(i).x + w, y: mid(i).y }),
    };
  }

  // ---------- 4. discs and cards ----------
  function disc(parent, o = {}) {
    const { x = 0, y = 0, size = 56, tone: base = "orange" } = o;
    const fs = Math.max(28, Math.round(size * 0.55));
    const el = V.h("div", {
      class: `v-gene solid c-${tn(base)}`,
      text: o.text || "",
      style: { ...abs(x - size / 2, y - size / 2, size, size), borderRadius: "50%", fontSize: `${fs}px` },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        if (st.text != null && String(st.text).length * 16 + 14 > size)
          throw new Error(
            `VID.a10: disc text "${st.text}" does not fit a ${size}px disc (1-2 characters only; use A10.cells or A10.tag for numbers like 0.14)`,
          );
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
  function card(parent, o = {}) {
    const { x = 0, y = 0, w = 190, h = 64, tone: base = "grey", plain = true } = o;
    const fs = minFs(o.fs || 28, "card");
    const el = V.h("div", {
      class: `v-card${plain ? " plain" : ""} c-${tn(base)}`,
      text: o.text || "",
      style: {
        ...abs(x, y, w, h),
        ...flex,
        fontSize: `${fs}px`,
        borderRadius: "22px",
        textAlign: "center",
        lineHeight: "1.15",
      },
    });
    parent.append(el);
    return {
      el,
      w,
      h,
      x,
      y,
      mid: () => ({ x: x + w / 2, y: y + h / 2 }),
      top: () => ({ x: x + w / 2, y }),
      bottom: () => ({ x: x + w / 2, y: y + h }),
      left: () => ({ x, y: y + h / 2 }),
      right: () => ({ x: x + w, y: y + h / 2 }),
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

  // ---------- 5. svg icons ----------
  const D = (...a) =>
    a.map((q) => (Array.isArray(q) ? `${f1(q[0])} ${f1(q[1])}` : typeof q === "number" ? f1(q) : q)).join(" ");
  const inkOf = (tone) => (tone === "grey" ? "var(--text-dim)" : A10.tone(tone).c);
  const stroke = (d, w, colour) =>
    V.s("path", { d, fill: "none", "stroke-width": f1(w), "stroke-linecap": "round", style: { stroke: colour } });
  function op(kind, x, y, size, tone = "grey") {
    const [w, a, c] = [Math.max(5, size * 0.16), size * 0.38, inkOf(tone)];
    const bar = (x1, y1, x2, y2) => stroke(D("M", [x1, y1], "L", [x2, y2]), w, c);
    const dot = (dy) => V.s("circle", { cx: f1(x), cy: f1(y + dy), r: f1(w * 0.7), style: { fill: c } });
    const parts = {
      plus: () => [bar(x - a, y, x + a, y), bar(x, y - a, x, y + a)],
      minus: () => [bar(x - a, y, x + a, y)],
      times: () => [
        bar(x - a * 0.8, y - a * 0.8, x + a * 0.8, y + a * 0.8),
        bar(x + a * 0.8, y - a * 0.8, x - a * 0.8, y + a * 0.8),
      ],
      div: () => [bar(x - a, y, x + a, y), dot(-a * 0.8), dot(a * 0.8)],
      equals: () => [bar(x - a, y - a * 0.38, x + a, y - a * 0.38), bar(x - a, y + a * 0.38, x + a, y + a * 0.38)],
    };
    if (!parts[kind]) throw new Error(`VID.a10: unknown operator "${kind}"`);
    return V.s("g", {}, ...parts[kind]());
  }
  function qmark(x, y, size, tone = "orange") {
    const s = size;
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
    const hook = stroke(d, Math.max(5, s * 0.16), A10.tone(tone).c);
    hook.setAttribute("pathLength", "1");
    hook.setAttribute("data-draw", "1");
    const dot = V.s("circle", {
      cx: f1(x),
      cy: f1(y + 0.42 * s),
      r: f1(Math.max(4, s * 0.1)),
      style: { fill: A10.tone(tone).c },
    });
    return V.s("g", {}, hook, dot);
  }

  Object.assign(A10, { tag, cells, disc, card, op, qmark, abs, flex, setText, setClass, D, f1, tn, minFs });
})();

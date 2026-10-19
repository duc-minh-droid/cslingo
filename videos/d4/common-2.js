/* Lecture 4 · Replication: the small drawing pieces every scene shares (VID.d4, short name D4). Needs videos/l5/common.js and
   d4/common.js loaded first (see videos/ds-4.html). Positions are the parent's pixels (the stage is 936 x 640, origin top-left).
   EVERY CALL IS PURE: call set()/draw calls each frame from your scene's update(t) with everything you want to see; anything you
   leave out falls back to its default and nothing is remembered between frames.

   TONES (colour roles of THIS video, the same in every scene):
     "blue"   the LEADER and the writes sent to it (the leader node, its crown, a write packet, the thing we look at)
     "green"  up to date / safe / confirmed / fresh (a follower that has everything, an answer that is right, a tick)
     "orange" behind / stale / waiting / attention (a lagging follower, an out-of-date answer, a pending wait, the snapshot)
     "red"    crashed / lost / conflict (a dead node, a lost change, two leaders, a cross, the bolt)
     "purple" the replication LOG: entries (#1, #2 ...) and the copies of data travelling between nodes
     "grey"   neutral (the client, an idle node, an empty slot, a plain wire)
     D4.tone(name) -> {c, ink, dim, edge, lip, on}  (CSS var() strings: c fill/icon, ink text on a tint, dim tint, edge tint
     border, lip sticker edge, on text on a c fill).   The tone name "self" means "the colours of the card I sit in".

   1. TEXT AND STICKERS  (all anchored at their CENTRE by default: x, y = the centre, so a variable text width never matters;
      anchor "l" = x, y is the left-middle, "r" = right-middle)
        const t = D4.tag(parent, {x, y, text, tone: "grey", solid: false, fs: 28, anchor: "c", plain: false});   a pill sticker
            t.set({text, tone, solid, k: 1, x, y, s, r, o})   k 0..1 pops it in; x, y = OFFSET from where it was placed
            (give no x, y when you move it yourself: then set({x, y}) is the absolute position).  A write / read / log packet is
            just a solid tag:  D4.packet(parent, {text: "pic 1", tone: "blue"})  (solid by default), fly it with D4.at / wire.at.
        const l = D4.label(parent, {x, y, text, tone: "grey", fs: 30, anchor: "c"});  plain text in the tone's ink colour
            l.set({text, tone, k, x, y, s, o})   (never fade below o 0.8 unless it is gone)
        const d = D4.disc(parent, {x, y, size: 64, text, tone: "orange"});   a round sticker (x, y = centre), solid
            d.set({text, tone, solid: true, k, x, y, s, o})
        const c = D4.card(parent, {x, y, w, h, text, tone: "grey", plain: true, fs: 28});  a plain panel (x, y = TOP-LEFT)
            c.set({text, tone, plain, k, x, y, s, o})
        const b = D4.bar(parent, {x, y, w: 300, h: 34, tone: "orange"});   a pill track (x, y top-left) with a fill from the left
            b.set({k: 0..1 (fill fraction of the track, exact: k * (w - 6) px), tone, o})
   2. ROW OF CHIPS  (log entries, records, cells; the workhorse tiles)
        const row = D4.chips(parent, {x, y, n, w: 76, h: 64, gap: 10, texts: ["#1", ...] | (i) => "#" + (i + 1) | omitted (empty),
                                      fs: 30 (0 = no text), tone: "grey", tones: [per chip], radius: 18, lip: 6});
        row.set(i, {text, tone, solid, ghost, x, y, s, sx, r, o, ring, ringK, ringDash})
            x, y = offset from the chip's own slot; solid = filled in the tone; ghost = dashed empty slot; ring = a tone name draws a
            ring around it (ringK 0..1 pops it in); sx extra horizontal squash (0 = edge on); o 0 hides it.
        row.all((i) => state | undefined)   row.flip(i, k, {from, to, tone, toTone, hop, ...})  edge-on flip at k 0.5
        row.pos(i) -> x of slot i inside the row;  row.mid(i) / row.top(i) / row.bottom(i) -> {x, y} in PARENT coordinates
        row.el (V.place / V.show the whole row), row.tiles, row.n, row.width, row.height, row.left, row.top0, row.w, row.h
   3. WIRES  (an SVG polyline between points; draw it in a layer made by const svg = D4.svg(stage), BEFORE the nodes so it lies under them)
        const w = D4.wire(svg, {pts: [[x1, y1], [x2, y2], ...] | [{x, y}...], tone: "grey", w: 6, dash: ""});
        w.set({tone, o, k: 1 (0..1 drawn from the first point), cut: 0 (0..1, only for 2-point wires: the wire breaks in the
                middle, the two halves pull apart and a red bolt pops in the gap), w})
        w.at(f) -> {x, y} at fraction f (0..1) of the wire's length: packets ride the wire with it;  w.len;  w.pts;  w.mid
        D4.at(a, b, k, bow = 0) -> {x, y} on the straight line a -> b at k 0..1 (bow px sideways peak);  D4.svg(parent) -> full-stage <svg>
   4. PICTOGRAMS  (SVG groups drawn at absolute stage coordinates: x, y = CENTRE; append to your D4.svg(stage) layer, then V.place(g,
      {x, y, s, r, o}) moves, scales (E.pop) and fades them; tone default in the signature)
        D4.bolt(x, y, size, tone = "red")      a lightning bolt: a crash, noise, a cut wire
        D4.crown(x, y, size, tone = "blue")    the leader's crown
        D4.server(x, y, size, tone = "grey")   a server: three stacked drive bays
        D4.person(x, y, size, tone = "grey")   a client
        D4.phone(x, y, size, tone = "grey")    a phone showing a page
        D4.camera(x, y, size, tone = "orange") a snapshot camera
        D4.neq(x, y, size, tone = "red")       a "not equal" sign (two histories disagree)
        VID.l5.tick(x, y, size, tone, {w}) / .cross(...) / .arrow(x1, y1, x2, y2, tone, o, {w, head, bow}) / .drawOn(g, k) (0..1 draw-on)
   5. TIMING TOOLS
        D4.seq(t, t0, step, dur, i) -> 0..1: ramp of the i-th item of a staggered list (item i runs from t0 + i * step for dur s);
            ease it yourself (E.out, E.pop ...).      D4.tagW(text, fs = 28) -> estimated pixel width of a tag. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const L5 = V.l5;
  const { clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  D4.TONES = ["blue", "green", "orange", "red", "purple", "grey"];
  const SELF = {
    c: "var(--c)",
    ink: "var(--c-ink)",
    dim: "var(--c-dim)",
    edge: "var(--c-edge)",
    lip: "var(--c-lip)",
    on: "var(--c-on)",
  };
  const tn = (t) => {
    if (t !== "self" && !D4.TONES.includes(t))
      throw new Error(`VID.d4: unknown tone "${t}" (use ${D4.TONES.join(", ")})`);
    return t;
  };
  const T = (name) => (name === "self" ? SELF : L5.tone(tn(name)));
  D4.tone = T;
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
  D4.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  D4.tagW = (text, fs = 28) => Math.round(String(text).length * fs * 0.465 + 40);
  D4.at = (a, b, k, bow = 0) => {
    const kk = clamp(k);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const n = Math.hypot(dx, dy) || 1;
    const peak = bow * 4 * kk * (1 - kk);
    return { x: a.x + dx * kk + (-dy / n) * peak, y: a.y + dy * kk + (dx / n) * peak };
  };
  D4.svg = (parent) => L5.svg(parent);

  /** an element centred (or left/right anchored) on a zero-size outer box, so V.place moves and scales it about its anchor */
  function floater(parent, inner, anchor = "c") {
    const outer = V.h("div", { style: abs(0, 0, 0, 0) });
    const tx = { c: "-50%", l: "0%", r: "-100%" }[anchor];
    if (tx == null) throw new Error(`VID.d4: unknown anchor "${anchor}" (c, l or r)`);
    Object.assign(inner.style, { left: "0px", top: "0px", transform: `translate(${tx}, -50%)` });
    outer.append(inner);
    parent.append(outer);
    return outer;
  }
  const pop = (k, minS = 0.8) => minS + (1 - minS) * E.pop(clamp(k));

  // ---------- 1. tags, labels, discs, cards, bars ----------
  function tag(parent, o = {}) {
    const inner = V.h("div", {
      class: "v-tag",
      text: o.text || "",
      style: { ...flex, fontSize: `${o.fs || 28}px`, ...(o.plain ? { background: "var(--panel)" } : {}) },
    });
    const outer = floater(parent, inner, o.anchor);
    const base = { tone: o.tone || "grey", solid: !!o.solid, x: o.x || 0, y: o.y || 0 };
    return {
      el: outer,
      inner,
      set(st = {}) {
        const tone = tn(st.tone || base.tone);
        setClass(inner, `v-tag c-${tone}${(st.solid ?? base.solid) ? " solid" : ""}`);
        setText(inner, st.text);
        const k = clamp(st.k ?? 1);
        V.place(outer, {
          x: base.x + (st.x || 0),
          y: base.y + (st.y || 0),
          s: (st.s ?? 1) * pop(k),
          r: st.r || 0,
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }
  D4.tag = tag;
  D4.packet = (parent, o = {}) => tag(parent, { solid: true, tone: "blue", ...o });

  function label(parent, o = {}) {
    const inner = V.h("div", {
      class: "v-text",
      text: o.text || "",
      style: { fontSize: `${o.fs || 30}px`, fontWeight: "900" },
    });
    const outer = floater(parent, inner, o.anchor);
    const base = { tone: o.tone || "grey", x: o.x || 0, y: o.y || 0 };
    return {
      el: outer,
      set(st = {}) {
        const tone = tn(st.tone || base.tone);
        inner.style.color = tone === "grey" ? "var(--text-dim)" : T(tone).ink;
        setText(inner, st.text);
        const k = clamp(st.k ?? 1);
        V.place(outer, {
          x: base.x + (st.x || 0),
          y: base.y + (st.y || 0) + (1 - k) * 8,
          s: st.s ?? 1,
          o: k * (st.o ?? 1),
        });
      },
    };
  }
  D4.label = label;

  function disc(parent, o = {}) {
    const { size = 64, tone: base = "orange" } = o;
    const inner = V.h("div", {
      class: `v-gene solid c-${tn(base)}`,
      text: o.text || "",
      style: { ...abs(0, 0, size, size), borderRadius: "50%", fontSize: `${Math.round(o.fs || size * 0.55)}px` },
    });
    const outer = floater(parent, inner, "c");
    const at = { x: o.x || 0, y: o.y || 0 };
    return {
      el: outer,
      set(st = {}) {
        setClass(inner, `v-gene c-${tn(st.tone || base)}${st.solid === false ? "" : " solid"}`);
        setText(inner, st.text);
        const k = clamp(st.k ?? 1);
        V.place(outer, {
          x: at.x + (st.x || 0),
          y: at.y + (st.y || 0),
          s: (st.s ?? 1) * pop(k, 0.7),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }
  D4.disc = disc;

  function card(parent, o = {}) {
    const { x = 0, y = 0, w = 130, h = 100, tone: base = "grey", plain: p0 = true, fs = 28 } = o;
    const el = V.h("div", {
      class: `v-card${p0 ? " plain" : ""} c-${tn(base)}`,
      text: o.text || "",
      style: { ...abs(x, y, w, h), ...flex, fontSize: `${fs}px`, borderRadius: "22px", textAlign: "center" },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card${(st.plain ?? p0) ? " plain" : ""} c-${tn(st.tone || base)}`);
        setText(el, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: (st.s ?? 1) * pop(k), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  }
  D4.card = card;

  function bar(parent, o = {}) {
    const { x = 0, y = 0, w = 300, h = 34, tone: base = "orange" } = o;
    const track = V.h("div", {
      style: {
        ...abs(x, y, w, h),
        boxSizing: "border-box",
        border: "3px solid var(--line-2)",
        borderRadius: `${h / 2}px`,
        background: "var(--panel-2)",
      },
    });
    const fill = V.h("div", { class: `c-${tn(base)}`, style: { ...abs(0, 0, 0, h - 6), boxSizing: "border-box" } });
    track.append(fill);
    parent.append(track);
    return {
      el: track,
      set(st = {}) {
        const px = clamp(st.k ?? 1) * (w - 6);
        setClass(fill, `c-${tn(st.tone || base)}`);
        Object.assign(fill.style, {
          width: `${f1(px)}px`,
          borderRadius: `${f1(Math.min((h - 6) / 2, px / 2))}px`,
          background: "var(--c)",
          boxShadow: px > 1 ? "inset 0 -4px 0 var(--c-lip)" : "none",
          visibility: px > 0.5 ? "" : "hidden",
        });
        V.show(track, st.o ?? 1);
      },
    };
  }
  D4.bar = bar;

  // ---------- 2. a row of chips ----------
  function chips(parent, o = {}) {
    const { x = 0, y = 0, n = 3, w = 76, h = 64, gap = 10, tone: base = "grey", lip = 6 } = o;
    const texts = Array.from({ length: n }, (_, i) =>
      typeof o.texts === "function" ? o.texts(i) : o.texts ? o.texts[i] : "",
    );
    const width = n * w + (n - 1) * gap;
    const pos = (i) => i * (w + gap);
    const tone0 = (i) => tn((o.tones && o.tones[i]) || base);
    const fs = o.fs ?? 30;
    const radius = Math.round(o.radius ?? Math.min(18, h * 0.3));
    const el = V.h("div", { style: abs(x, y, width, h) });
    const pad = 8;
    const rings = texts.map((_, i) =>
      V.h("div", {
        style: {
          ...abs(pos(i) - pad, -pad, w + 2 * pad, h + 2 * pad),
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
        style: { ...abs(pos(i), 0, w, h), fontSize: `${fs}px`, borderRadius: `${radius}px` },
      }),
    );
    el.append(...rings, ...tiles);
    parent.append(el);
    const set = (i, st = {}) => {
      const tile = tiles[i];
      setClass(tile, `v-gene c-${tn(st.tone || tone0(i))}${st.solid ? " solid" : ""}${st.ghost ? " ghost" : ""}`);
      setText(tile, st.text == null ? texts[i] : st.text);
      tile.style.boxShadow = st.ghost ? "none" : `0 ${lip}px 0 var(${st.solid ? "--c-lip" : "--c-edge"})`;
      const { x: dx = 0, y: dy = 0, s = 1, sx = 1, r = 0, o: op = 1 } = st;
      tile.style.opacity = op >= 1 ? "" : String(Math.max(0, op));
      tile.style.visibility = op <= 0.001 ? "hidden" : "";
      tile.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) rotate(${r}deg) scale(${(s * sx).toFixed(3)}, ${s})`;
      const ring = rings[i];
      const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
      if (st.ring && rk > 0.002) {
        ring.style.borderColor = T(st.ring).c;
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
    return {
      el,
      tiles,
      n,
      w,
      h,
      gap,
      width,
      height: h,
      left: x,
      top0: y,
      pos,
      mid: (i) => ({ x: x + pos(i) + w / 2, y: y + h / 2 }),
      top: (i) => ({ x: x + pos(i) + w / 2, y }),
      bottom: (i) => ({ x: x + pos(i) + w / 2, y: y + h }),
      set,
      flip,
      all: (fn) => texts.forEach((_, i) => set(i, fn(i) || {})),
    };
  }
  D4.chips = chips;

  // ---------- 4. pictograms (drawn before the wire, which uses the bolt) ----------
  const poly = (pts, tone, w = 3) =>
    V.s("polygon", {
      points: pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(" "),
      "stroke-width": w,
      "stroke-linejoin": "round",
      style: { fill: T(tone).c, stroke: T(tone).lip },
    });
  const rect = (x, y, w, h, r, fill, stroke, sw = 3) =>
    V.s("rect", {
      x: f1(x),
      y: f1(y),
      width: f1(w),
      height: f1(h),
      rx: f1(r),
      "stroke-width": sw,
      style: { fill, stroke },
    });
  const circle = (x, y, r, fill, stroke, sw = 3) =>
    V.s("circle", { cx: f1(x), cy: f1(y), r: f1(r), "stroke-width": sw, style: { fill, stroke: stroke || "none" } });
  const line = (x1, y1, x2, y2, stroke, sw) =>
    V.s("line", {
      x1: f1(x1),
      y1: f1(y1),
      x2: f1(x2),
      y2: f1(y2),
      "stroke-width": f1(sw),
      "stroke-linecap": "round",
      style: { stroke },
    });
  const BOLT = [
    [0.14, -0.5],
    [-0.26, 0.06],
    [-0.02, 0.06],
    [-0.14, 0.5],
    [0.26, -0.08],
    [0.02, -0.08],
  ];
  D4.bolt = (x, y, s, tone = "red") =>
    V.s(
      "g",
      {},
      poly(
        BOLT.map(([a, b]) => [x + a * s, y + b * s]),
        tone,
      ),
    );
  const CROWN = [
    [-0.5, 0.32],
    [-0.5, -0.3],
    [-0.24, 0.02],
    [0, -0.42],
    [0.24, 0.02],
    [0.5, -0.3],
    [0.5, 0.32],
  ];
  D4.crown = (x, y, s, tone = "blue") =>
    V.s(
      "g",
      {},
      poly(
        CROWN.map(([a, b]) => [x + a * s, y + b * s]),
        tone,
      ),
    );
  D4.server = (x, y, s, tone = "grey") => {
    const g = V.s("g", {});
    [-1, 0, 1].forEach((i) => {
      const cy = y + i * 0.34 * s;
      g.append(rect(x - 0.45 * s, cy - 0.14 * s, 0.9 * s, 0.28 * s, 0.07 * s, "var(--panel)", T(tone).lip));
      g.append(circle(x - 0.28 * s, cy, 0.05 * s, T(tone).c));
      g.append(line(x - 0.02 * s, cy, x + 0.28 * s, cy, T(tone).edge, 0.05 * s));
    });
    return g;
  };
  D4.person = (x, y, s, tone = "grey") => {
    const d = `M ${f1(x - 0.4 * s)} ${f1(y + 0.46 * s)} Q ${f1(x - 0.4 * s)} ${f1(y + 0.05 * s)} ${f1(x)} ${f1(y + 0.05 * s)} Q ${f1(x + 0.4 * s)} ${f1(y + 0.05 * s)} ${f1(x + 0.4 * s)} ${f1(y + 0.46 * s)} Z`;
    return V.s(
      "g",
      {},
      V.s("path", {
        d,
        "stroke-width": 3,
        "stroke-linejoin": "round",
        style: { fill: T(tone).c, stroke: T(tone).lip },
      }),
      circle(x, y - 0.22 * s, 0.2 * s, T(tone).c, T(tone).lip),
    );
  };
  D4.phone = (x, y, s, tone = "grey") =>
    V.s(
      "g",
      {},
      rect(x - 0.3 * s, y - 0.48 * s, 0.6 * s, 0.96 * s, 0.12 * s, "var(--panel)", T(tone).lip),
      line(x - 0.1 * s, y - 0.36 * s, x + 0.1 * s, y - 0.36 * s, T(tone).c, 0.06 * s),
      rect(x - 0.17 * s, y - 0.2 * s, 0.34 * s, 0.34 * s, 0.05 * s, T(tone).c, "none", 0),
      circle(x, y + 0.36 * s, 0.05 * s, T(tone).c),
    );
  D4.camera = (x, y, s, tone = "orange") =>
    V.s(
      "g",
      {},
      rect(x - 0.2 * s, y - 0.44 * s, 0.4 * s, 0.24 * s, 0.06 * s, T(tone).c, T(tone).lip),
      rect(x - 0.48 * s, y - 0.28 * s, 0.96 * s, 0.7 * s, 0.12 * s, T(tone).c, T(tone).lip),
      circle(x, y + 0.07 * s, 0.2 * s, "var(--panel)", T(tone).lip),
    );
  D4.neq = (x, y, s, tone = "red") => {
    const c = T(tone).c;
    const w = 0.11 * s;
    return V.s(
      "g",
      {},
      line(x - 0.34 * s, y - 0.14 * s, x + 0.34 * s, y - 0.14 * s, c, w),
      line(x - 0.34 * s, y + 0.14 * s, x + 0.34 * s, y + 0.14 * s, c, w),
      line(x + 0.18 * s, y - 0.4 * s, x - 0.18 * s, y + 0.4 * s, c, w),
    );
  };

  // ---------- 3. wires ----------
  function wire(svg, o = {}) {
    const pts = (o.pts || []).map((p) => (Array.isArray(p) ? { x: p[0], y: p[1] } : p));
    if (pts.length < 2) throw new Error("VID.d4.wire: needs at least two points");
    const segs = [];
    let len = 0;
    pts.slice(1).forEach((b, i) => {
      const a = pts[i];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      segs.push({ a, b, d, from: len });
      len += d;
    });
    const at = (f) => {
      const L = clamp(f) * len;
      const sg = segs.find((s) => L <= s.from + s.d) || segs[segs.length - 1];
      return D4.at(sg.a, sg.b, sg.d ? (L - sg.from) / sg.d : 0);
    };
    const mid = at(0.5);
    const dStr = pts.map((p, i) => `${i ? "L" : "M"} ${f1(p.x)} ${f1(p.y)}`).join(" ");
    const dash = o.dash || "";
    const base = { tone: o.tone || "grey", w: o.w || 6 };
    const path = V.s("path", {
      d: dStr,
      fill: "none",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      ...(dash ? {} : { pathLength: "1" }),
    });
    const halves = [V.s("line", { "stroke-linecap": "round" }), V.s("line", { "stroke-linecap": "round" })];
    const bolt = D4.bolt(mid.x, mid.y, 64, "red");
    const g = V.s("g", {}, path, ...halves, bolt);
    svg.append(g);
    const first = pts[0];
    const last = pts[pts.length - 1];
    const unit = Math.hypot(last.x - first.x, last.y - first.y) || 1;
    const ux = (last.x - first.x) / unit;
    const uy = (last.y - first.y) / unit;
    return {
      el: g,
      pts,
      len,
      mid,
      at,
      set(st = {}) {
        const tone = tn(st.tone || base.tone);
        const colour = tone === "grey" ? T(tone).edge : T(tone).c;
        const w = st.w || base.w;
        const k = clamp(st.k ?? 1);
        const cut = clamp(st.cut || 0);
        [path, ...halves].forEach((e) => {
          e.style.stroke = colour;
          e.setAttribute("stroke-width", f1(w));
        });
        const whole = cut < 0.01;
        path.style.visibility = whole && k > 0.002 ? "" : "hidden";
        path.style.strokeDasharray = dash || (k >= 1 ? "none" : `${k.toFixed(4)} 1`);
        const gap = 42 * E.out(cut);
        halves.forEach((h, i) => {
          const a = i ? { x: mid.x + ux * gap, y: mid.y + uy * gap } : first;
          const b = i ? last : { x: mid.x - ux * gap, y: mid.y - uy * gap };
          h.setAttribute("x1", f1(a.x));
          h.setAttribute("y1", f1(a.y));
          h.setAttribute("x2", f1(b.x));
          h.setAttribute("y2", f1(b.y));
          h.style.visibility = whole ? "hidden" : "";
          h.style.strokeDasharray = dash;
        });
        V.place(bolt, { s: E.pop(cut), o: Math.min(1, cut * 4) });
        V.show(g, st.o ?? 1);
      },
    };
  }
  D4.wire = wire;
})();

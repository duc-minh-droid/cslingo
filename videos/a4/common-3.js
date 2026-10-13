/* Phase 4 · Minimum Spanning Trees: small drawing pieces (VID.a4, short name A4): tags, tiles, a total counter, bars, a token and
   a little geometry. Same rules as common-2.js: positions are the parent's pixels (stage 936 x 640), every call is PURE (pass
   everything each frame; nothing is remembered). Tones: "green" "red" "orange" "blue" "purple" "grey".

   A4.tag(parent, {x, y, text, tone = "grey", solid = false, h, fs = 28}) -> t     a pill sticker (.v-tag); x, y = top-left
       t.set({text, tone, solid, k = 1, x, y, s, o})   k 0..1 pops it in (scale 0.8 -> 1 with a little spring, fades in);
                                                       x, y = offset from where it was placed; s = scale; o = opacity.
       t.el the element.   Text must stay <= about 26 characters at 28 px in a 440 px column.
   A4.tiles(parent, {x, y, items, w = 118, h = 56, gap = 12, dir = "row" | "col", fs = 30, tone = "grey"}) -> row
       a row (or column) of sticker tiles holding short texts, for example the sorted cables "DE 1", "BC 2".
       items: ["DE 1", ...] or [{text, tone}].   row.set(i, {tone, solid, ghost, text, x, y, s, o})   (x, y = offset from the
       tile's own slot)   row.all((i) => state | undefined) sets every tile   row.pos(i) -> {x, y} top-left of slot i in
       parent coordinates   row.mid(i) -> {x, y} centre   row.width, row.height, row.left, row.top, row.el.
       ghost = dashed outline, no fill (a slot that was emptied).   solid = filled with the tone.
   A4.total(parent, {x, y, w = 270, h = 80, label = "total", tone = "green"}) -> c     a counter sticker: small label on the
       left, a big number (50 px) on the right.   c.set({text, tone, solid, bump = 0..1, k = 1, o})   text = the number as a
       string (you tween the number yourself, e.g. String(Math.round(V.lerp(5, 10, k)))); bump 0..1 = one pulse (pass
       V.flash(t, a, b)); k pops it in.
   A4.bar(parent, {x, y, w, h = 56, tone = "grey", solid = true, text = "", fs = 32}) -> b     a horizontal sticker bar that
       grows from x to the right, full length w at k = 1 (never shorter than 14 px once it is visible).
       b.set({k, tone, solid, text, textOut = false, o})   text sits inside the bar (left, 18 px padding) or, with textOut,
       just right of its end (ink colour). Use textOut for short bars. b.end(k) -> x of the bar's right end at k.
   A4.token(parent, {tone = "blue", size = 30}) -> m     a round sticker marker with a lip. m.set({x, y, s, o, tone}); x, y
       = its CENTRE (parent px); use it for the walker of scene 9.
   A4.marker(parent, {x, y, tone, name, text, anchor = "mid" | "right"}) -> m     a point on a number line: a round token centred on
       x, y with a tinted NAME tag above it (28 px) and a solid NUMBER pill below it. anchor "right" puts the tag's right edge
       34 px right of x (use it near the right-hand end of the stage). m.set({k = 1 pop-in, o, tone, name, text, bump 0..1}).
   A4.equals(x, y, size, tone = "green") -> SVG <g> of an equals sign centred on x, y (append it to your own <svg>, e.g. from
       L5.svg(stage); V.place(g, {s, o}) animates it).

   A4.leq(x, y, size, colour = "var(--ink)") -> SVG <g> of a "less than or equal" sign centred on x, y (a chevron over a bar; colour is
       any CSS colour; append it to your own <svg>, V.place(g, {s, o}) animates it).

   GEOMETRY (pure)
   A4.along(points, f) -> {x, y, dx, dy, i}   the point at fraction f (0..1) of the length of a polyline [[x, y], ...], its unit
                          heading (dx, dy) and the index of the segment it is on.
   A4.offsetLine(p, q, off) -> [p2, q2]       the segment p -> q moved sideways by off px (to the left of the direction of
                          travel, as seen on screen, when off > 0): the two lanes of a cable walked in both directions.
   A4.lerpPt(p, q, f) -> [x, y]. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const tn = (t) => {
    if (!A4.TONES.includes(t)) throw new Error(`VID.a4: unknown tone "${t}" (use ${A4.TONES.join(", ")})`);
    return t;
  };
  const abs = (x, y, w, h) => {
    const st = { position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px` };
    if (w != null) st.width = `${f1(w)}px`;
    if (h != null) st.height = `${f1(h)}px`;
    return st;
  };
  const flex = { display: "flex", alignItems: "center", justifyContent: "center" };
  const solidStyle = (on) => ({
    background: on ? "var(--c)" : "",
    borderColor: on ? "var(--c-lip)" : "",
    boxShadow: on ? "0 6px 0 var(--c-lip)" : "",
    color: on ? "var(--c-on)" : "",
  });
  const setText = (el, text) => {
    if (text != null && el.textContent !== text) el.textContent = text;
  };

  // ---------- tag ----------
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
        const cls = `v-tag c-${tone}${solid ? " solid" : ""}`;
        if (el.className !== cls) el.className = cls;
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

  // ---------- tiles ----------
  function tiles(parent, o = {}) {
    const { x = 0, y = 0, w = 118, h = 56, gap = 12, dir = "row", fs = 30, tone: base = "grey" } = o;
    const items = (o.items || []).map((it) => (typeof it === "string" ? { text: it } : it));
    const n = items.length;
    const slot = (i) => (dir === "row" ? [i * (w + gap), 0] : [0, i * (h + gap)]);
    const width = dir === "row" ? n * w + (n - 1) * gap : w;
    const height = dir === "row" ? h : n * h + (n - 1) * gap;
    const el = V.h("div", { style: abs(x, y, width, height) });
    const els = items.map((it, i) =>
      V.h("div", {
        class: `v-gene c-${tn(it.tone || base)}`,
        text: it.text,
        style: { ...abs(...slot(i), w, h), fontSize: `${fs}px`, borderRadius: "18px", whiteSpace: "nowrap" },
      }),
    );
    el.append(...els);
    parent.append(el);
    const set = (i, st = {}) => {
      const e = els[i];
      const cls = `v-gene c-${tn(st.tone || items[i].tone || base)}${st.solid ? " solid" : ""}${st.ghost ? " ghost" : ""}`;
      if (e.className !== cls) e.className = cls;
      setText(e, st.text ?? items[i].text);
      V.place(e, { x: st.x || 0, y: st.y || 0, s: st.s ?? 1, o: st.o ?? 1 });
    };
    return {
      el,
      tiles: els,
      width,
      height,
      left: x,
      top: y,
      set,
      all: (fn) => items.forEach((_, i) => set(i, fn(i) || {})),
      pos: (i) => ({ x: x + slot(i)[0], y: y + slot(i)[1] }),
      mid: (i) => ({ x: x + slot(i)[0] + w / 2, y: y + slot(i)[1] + h / 2 }),
    };
  }

  // ---------- total counter ----------
  function total(parent, o = {}) {
    const { x = 0, y = 0, w = 270, h = 80, label = "total", tone: base = "green" } = o;
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
        const tone = tn(st.tone || base);
        const cls = `v-card c-${tone}`;
        if (el.className !== cls) el.className = cls;
        Object.assign(el.style, solidStyle(!!st.solid));
        setText(val, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, { s: (0.8 + 0.2 * E.pop(k)) * (1 + 0.1 * (st.bump || 0)), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  }

  // ---------- bar ----------
  function bar(parent, o = {}) {
    const { x = 0, y = 0, w = 400, h = 56, fs = 32 } = o;
    const el = V.h("div", {
      class: "v-card",
      style: {
        ...abs(x, y, w, h),
        ...flex,
        justifyContent: "flex-start",
        padding: "0 18px",
        borderRadius: `${h / 2}px`,
        overflow: "hidden",
        fontSize: `${fs}px`,
        fontWeight: "900",
        whiteSpace: "nowrap",
        transformOrigin: "0 50%",
      },
    });
    const out = V.h("div", {
      class: "v-text",
      style: { ...abs(0, 0), fontSize: `${fs}px`, fontWeight: "900", lineHeight: `${h}px` },
    });
    parent.append(el, out);
    const end = (k) => x + Math.max(14, w * clamp(k));
    return {
      el,
      end,
      set(st = {}) {
        const tone = tn(st.tone || o.tone || "grey");
        const solid = st.solid ?? o.solid ?? true;
        const k = clamp(st.k ?? 0);
        const op = k < 0.003 ? 0 : (st.o ?? 1);
        el.className = `v-card c-${tone}`;
        Object.assign(el.style, solidStyle(solid), {
          width: `${f1(Math.max(14, w * k))}px`,
          padding: st.textOut ? "0" : "0 18px",
        });
        V.show(el, op);
        setText(el, st.textOut ? "" : st.text);
        out.className = `v-text c-${tone}`;
        out.style.color = "var(--c-ink)";
        out.style.left = `${f1(end(k) + 14)}px`;
        out.style.top = `${f1(y)}px`;
        setText(out, st.textOut ? st.text : "");
        V.show(out, st.textOut ? op : 0);
      },
    };
  }

  // ---------- token ----------
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
        const cls = `v-gene solid c-${tn(st.tone || base)}`;
        if (el.className !== cls) el.className = cls;
        el.style.left = `${f1((st.x || 0) - size / 2)}px`;
        el.style.top = `${f1((st.y || 0) - size / 2)}px`;
        V.place(el, { s: st.s ?? 1, o: st.o ?? 1 });
      },
    };
  }

  // ---------- marker on a number line ----------
  function marker(parent, o = {}) {
    const { x = 0, y = 0, tone: base = "blue", name = "", text = "", anchor = "mid" } = o;
    const root = V.h("div", { style: abs(x, y, 0, 0) });
    const shift = anchor === "right" ? "translateX(-100%)" : "translateX(-50%)";
    const dot = V.h("div", {
      class: `v-gene solid c-${tn(base)}`,
      style: { ...abs(-15, -15, 30, 30), borderRadius: "50%", boxShadow: "0 4px 0 var(--c-lip)" },
    });
    const nameTag = V.h("div", {
      class: `v-tag c-${tn(base)}`,
      text: name,
      style: { ...abs(anchor === "right" ? 34 : 0, -72), transform: shift },
    });
    const num = V.h("div", {
      class: `v-tag solid c-${tn(base)}`,
      text,
      style: { ...abs(0, 26), transform: "translateX(-50%)" },
    });
    root.append(dot, nameTag, num);
    parent.append(root);
    return {
      el: root,
      set(st = {}) {
        const tone = tn(st.tone || base);
        [dot, nameTag, num].forEach((e, i) => {
          const cls = `${i ? "v-tag" : "v-gene solid"}${i === 2 ? " solid" : ""} c-${tone}`;
          if (e.className !== cls) e.className = cls;
        });
        setText(nameTag, st.name);
        setText(num, st.text);
        const k = clamp(st.k ?? 1);
        V.place(root, { s: (0.7 + 0.3 * E.pop(k)) * (1 + 0.15 * (st.bump || 0)), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  }

  // ---------- equals sign ----------
  function equals(x, y, size, tone = "green") {
    const fill = V.l5.tone(tn(tone)).c;
    const bar_ = (dy) =>
      V.s("rect", {
        x: f1(x - size / 2),
        y: f1(y + dy - size * 0.07),
        width: f1(size),
        height: f1(size * 0.14),
        rx: f1(size * 0.07),
        style: { fill },
      });
    return V.s("g", {}, bar_(-size * 0.17), bar_(size * 0.17));
  }

  // ---------- less-than-or-equal sign ----------
  function leq(x, y, size, colour = "var(--ink)") {
    const a = size * 0.3;
    const stroke = (d) =>
      V.s("path", {
        d,
        fill: "none",
        "stroke-width": f1(size * 0.14),
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        style: { stroke: colour },
      });
    return V.s(
      "g",
      {},
      stroke(`M${f1(x + a)} ${f1(y - a * 1.1)}L${f1(x - a)} ${f1(y - a * 0.1)}L${f1(x + a)} ${f1(y + a * 0.9)}`),
      stroke(`M${f1(x - a)} ${f1(y + a * 1.6)}H${f1(x + a)}`),
    );
  }

  // ---------- geometry ----------
  const lerpPt = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
  function along(points, f) {
    const segs = points.slice(1).map((q, i) => Math.hypot(q[0] - points[i][0], q[1] - points[i][1]));
    const total_ = segs.reduce((a, b) => a + b, 0);
    let d = clamp(f) * total_;
    let i = 0;
    while (i < segs.length - 1 && d > segs[i]) d -= segs[i++];
    const [p, q] = [points[i], points[i + 1]];
    const k = segs[i] ? d / segs[i] : 0;
    const len = segs[i] || 1;
    return {
      x: p[0] + (q[0] - p[0]) * k,
      y: p[1] + (q[1] - p[1]) * k,
      dx: (q[0] - p[0]) / len,
      dy: (q[1] - p[1]) / len,
      i,
    };
  }
  function offsetLine(p, q, off) {
    const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    const [nx, ny] = [(q[1] - p[1]) / d, (p[0] - q[0]) / d]; // to the left of the direction of travel, as seen on screen
    return [
      [p[0] + nx * off, p[1] + ny * off],
      [q[0] + nx * off, q[1] + ny * off],
    ];
  }

  Object.assign(A4, { tag, tiles, total, bar, token, marker, equals, leq, lerpPt, along, offsetLine });
})();

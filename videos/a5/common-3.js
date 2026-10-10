/* Phase 5 · Convex Hulls: small drawing pieces (VID.a5, short name A5): tags, tiles, a counter, bars, a token, the stack cup and
   turn icons. Same rules as common-2.js: positions are the parent's pixels (stage 936 x 640), every call is PURE (pass everything
   each frame; nothing is remembered). Tones: "green" "red" "orange" "blue" "purple" "grey". Needs l5/common.js (L5.tone, drawOn).

   A5.tag(parent, {x, y, text, tone = "grey", solid = false, h, fs = 28}) -> t     a pill sticker (.v-tag); x, y = top-left
       t.set({text, tone, solid, k = 1, x, y, s, o})   k 0..1 pops it in (scale 0.8 -> 1 with a little spring, fades in);
                                                       x, y = offset from where it was placed; s = scale; o = opacity.
       t.el the element.   (To put a tag ON a point of the plot use the plot's own `tags`, which are centred.)
   A5.tiles(parent, {x, y, items, w = 118, h = 56, gap = 12, dir = "row" | "col" | "up", fs = 30, tone = "grey"}) -> row
       sticker tiles holding short texts: the order of the sorted points "D", "E", ... or the hull list. dir "col" fills downwards,
       "up" is a STACK: slot 0 is the bottom tile, the last slot is the top one (x, y = top-left of the whole block).
       items: ["D", ...] or [{text, tone}].   row.set(i, {tone, solid, ghost, text, x, y, s, o})   (x, y = offset from the tile's
       own slot)   row.all((i) => state | undefined) sets every tile   row.pos(i) -> {x, y} top-left of slot i in parent
       coordinates   row.mid(i) -> {x, y} centre   row.width, row.height, row.left, row.top, row.el.
       ghost = dashed outline, no fill (an emptied slot).   solid = filled with the tone.   An unused tile: set(i, {o: 0}).
   A5.counter(parent, {x, y, w = 270, h = 80, label = "total", tone = "green"}) -> c     a counter sticker: small label on the left,
       a big number (50 px) on the right.   c.set({text, tone, solid, bump = 0..1, k = 1, o, label})   text = the number as a string
       (you tween it yourself, e.g. String(Math.round(V.lerp(21, 10, k)))); bump 0..1 = one pulse (pass V.flash(t, a, b)); k pops it in.
   A5.bar(parent, {x, y, w, h = 56, tone = "grey", solid = true, text = "", fs = 32}) -> b     a horizontal sticker bar that grows
       from x to the right, full length w at k = 1 (never shorter than 14 px once it is visible).
       b.set({k, tone, solid, text, textOut = false, o, over = 0})   text sits inside the bar (left, 18 px padding) or, with textOut,
       just right of its end (ink colour). over 0..1 draws a "break" mark near the right end (two slanted strokes: the bar is
       much longer than it can be drawn).   b.end(k) -> x of the bar's right end at k.
   A5.token(parent, {tone = "blue", size = 30}) -> m     a round sticker marker with a lip (the walker of scene 4).
       m.set({x, y, s, o, tone}); x, y = its CENTRE (parent px).
   A5.stack(parent, {x, y, w = 170, h = 60, gap = 10, slots = 5, label = "stack", fs = 32}) -> st     the stack of scene 7: a grey cup
       (open on top) with `slots` tiles in it, slot 0 at the bottom, and its label under the cup. x, y = top-left of the topmost slot.
       st.set(i, {text, tone, solid, ghost, x, y, s, o})   like tiles.set (a tile you do not set stays as it was drawn: call
       st.all((i) => state) every frame; set o: 0 for an empty slot)   st.slotPos(i) -> {x, y} top-left of slot i   st.mid(i) -> {x, y}
       centre   st.height  height of the cup   st.el   st.cup(o) sets the opacity of the cup and its label.
   A5.turnIcon(kind, x, y, size, tone = "green", opt) -> SVG <g>   a curved arrow showing a turn: kind "left" | "right" | "straight"
       (the walker comes from below; left bends left). Centred on x, y, `size` px tall. opt {w: stroke width}. Append it to your own
       <svg> (L5.svg(stage)); L5.drawOn(g, k) draws it on (0..1); V.place(g, {s, o}) pops it.  A5.turnIcon("left", 0, 0, 64) etc.
   A5.arrowHead is not needed: use the plot's seg {arrow: true}. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const tn = (t) => {
    if (!A5.TONES.includes(t)) throw new Error(`VID.a5: unknown tone "${t}" (use ${A5.TONES.join(", ")})`);
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
    if (text != null && el.textContent !== String(text)) el.textContent = String(text);
  };

  // ---------- tag ----------
  function tag(parent, o = {}) {
    const el = V.h("div", {
      class: "v-tag",
      text: o.text || "",
      style: { ...abs(o.x || 0, o.y || 0), ...flex, fontSize: `${o.fs || 28}px`, ...(o.h ? { height: `${o.h}px` } : {}) },
    });
    parent.append(el);
    const base = { tone: o.tone || "grey", solid: !!o.solid };
    return {
      el,
      set(st = {}) {
        const tone = tn(st.tone || base.tone);
        const cls = `v-tag c-${tone}${st.solid ?? base.solid ? " solid" : ""}`;
        if (el.className !== cls) el.className = cls;
        setText(el, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: (st.s ?? 1) * (0.8 + 0.2 * E.pop(k)), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  }

  // ---------- tiles ----------
  function tiles(parent, o = {}) {
    const { x = 0, y = 0, w = 118, h = 56, gap = 12, dir = "row", fs = 30, tone: base = "grey" } = o;
    const items = (o.items || []).map((it) => (typeof it === "string" ? { text: it } : it));
    const n = items.length;
    const slot = (i) => (dir === "row" ? [i * (w + gap), 0] : dir === "up" ? [0, (n - 1 - i) * (h + gap)] : [0, i * (h + gap)]);
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

  // ---------- counter ----------
  function counter(parent, o = {}) {
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
        setText(lab, st.label);
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
    const out = V.h("div", { class: "v-text", style: { ...abs(0, 0), fontSize: `${fs}px`, fontWeight: "900", lineHeight: `${h}px` } });
    const mark = V.h("div", { style: { ...abs(0, y, 0, h), pointerEvents: "none" } });
    const slash = [0, 1].map((i) =>
      V.h("div", { style: { ...abs(i * 22, -4, 10, h + 8), background: "var(--bg)", transform: "skewX(-22deg)" } }),
    );
    mark.append(...slash);
    parent.append(el, out, mark);
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
        Object.assign(el.style, solidStyle(solid), { width: `${f1(Math.max(14, w * k))}px`, padding: st.textOut ? "0" : "0 18px" });
        V.show(el, op);
        setText(el, st.textOut ? "" : st.text);
        out.className = `v-text c-${tone}`;
        out.style.color = "var(--c-ink)";
        out.style.left = `${f1(end(k) + 14)}px`;
        out.style.top = `${f1(y)}px`;
        setText(out, st.textOut ? st.text : "");
        V.show(out, st.textOut ? op : 0);
        mark.style.left = `${f1(end(k) - 64)}px`;
        V.show(mark, clamp(st.over || 0) * op);
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

  // ---------- the stack cup ----------
  function stack(parent, o = {}) {
    const { x = 0, y = 0, w = 170, h = 60, gap = 10, slots = 5, label = "stack", fs = 32 } = o;
    const items = Array.from({ length: slots }, () => ({ text: "", tone: "grey" }));
    const inner = slots * h + (slots - 1) * gap;
    const svg = V.s("svg", { width: 936, height: 640 });
    Object.assign(svg.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const cup = V.s("path", {
      d: `M${f1(x - 16)} ${f1(y - 8)}L${f1(x - 16)} ${f1(y + inner + 16)}L${f1(x + w + 16)} ${f1(y + inner + 16)}L${f1(x + w + 16)} ${f1(y - 8)}`,
      fill: "none",
      "stroke-width": "7",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    cup.style.stroke = "var(--line-2)";
    svg.append(cup);
    const name = V.h("div", { class: "v-text dim", text: label, style: { ...abs(x - 16, y + inner + 30, w + 32), textAlign: "center", fontSize: "30px" } });
    parent.append(svg, name);
    const t = tiles(parent, { x, y, items, w, h, gap, dir: "up", fs, tone: "grey" });
    return {
      ...t,
      cup(op = 1) {
        V.show(svg, op);
        V.show(name, op);
      },
      slotPos: t.pos,
      height: inner + 16,
    };
  }

  // ---------- turn icons ----------
  function turnIcon(kind, x, y, size, tone = "green", opt = {}) {
    const colour = L5.tone(tn(tone)).c;
    const s = size;
    const m = kind === "right" ? -1 : 1; // mirror for a right turn
    const dx = kind === "straight" ? 0 : m * 0.19 * s; // centre the bent arrow in its box
    const X = (v) => f1(x + dx + m * v * s);
    const Y = (v) => f1(y + v * s);
    const body =
      kind === "straight"
        ? `M${f1(x)} ${Y(0.45)}L${f1(x)} ${Y(-0.12)}`
        : `M${X(0.12)} ${Y(0.45)}L${X(0.12)} ${Y(0)}Q${X(0.12)} ${Y(-0.3)} ${X(-0.16)} ${Y(-0.3)}`;
    const head =
      kind === "straight"
        ? `M${f1(x)} ${Y(-0.5)}L${f1(x - 0.22 * s)} ${Y(-0.14)}L${f1(x + 0.22 * s)} ${Y(-0.14)}Z`
        : `M${X(-0.5)} ${Y(-0.3)}L${X(-0.16)} ${Y(-0.52)}L${X(-0.16)} ${Y(-0.08)}Z`;
    const path = V.s("path", {
      d: body,
      fill: "none",
      pathLength: "1",
      "data-draw": "1",
      "stroke-width": f1(opt.w || s * 0.16),
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    path.style.stroke = colour;
    const tip = V.s("path", { d: head, "data-head": "1", "stroke-width": "3", "stroke-linejoin": "round" });
    Object.assign(tip.style, { fill: colour, stroke: colour });
    return V.s("g", {}, path, tip);
  }

  Object.assign(A5, { tag, tiles, counter, bar, token, stack, turnIcon });
})();

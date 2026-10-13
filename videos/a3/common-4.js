/* Algorithms Phase 3 · stickers, bars, stats and pictograms (window.VID.a3, part 4 of 5; needs common.js, VID.l5). Stage px (936 x 640).
   Every set() is PURE: call it every frame from update(t) with the whole state you want to see. An argument you leave out falls back to
   its default. Tones: "green" "red" "blue" "purple" "orange" "grey". Text is >= 28 px. Pop-ins: el.set({s: 0.8 + 0.2 * V.ease.pop(k), o: k * 4}).

   ───────────────────────────── A3.tag(parent, {x, y, text, tone: "grey", solid: false, fs: 28, anchor: "l", minW}) -> el ─────────────────────────────
     A .v-tag pill. x, y is its top-left ("l"), top-centre ("c"), top-right ("r", grows leftwards) corner, or its CENTRE ("m").
     el.set({text, html, tone, solid, s, o, dx, dy, r}) changes it (html allows <sup>). el.holder = the positioning wrapper (never move it).
     Pass an HTML parent (the stage, P.html or a card). One idea per tag, at most about 24 characters.

   ───────────────────────────── A3.chip(parent, {x, y, w: 216, h: 60, text, tone}) -> c ─────────────────────────────
     A station chip: c.set({state: "grey" | "active" | "done", pop: 1, o: 1, dx, dy, pulse: 0, tone, text}). grey = neutral, active = solid tone,
     done = soft tone; pop 0..1 pops it in; pulse 0..1 one bump (V.flash). c.el, c.w, c.h.

   ───────────────────────────── A3.sticker(parent, {x, y, w: 330, h: 64, text, tone, icon, fs: 28}) -> s ─────────────────────────────
     A rounded verdict sticker with an icon at its left ("tick" | "cross" | null) and a short text ("feasible", "not allowed").
     s.set({text, tone, icon, solid, k: 1, o: 1, dx, dy}) k 0..1 pops it in and draws the icon on. s.el, s.w, s.h.

   ───────────────────────────── A3.badge(parent, {x, y, size: 48, icon, text, tone}) -> b ─────────────────────────────
     A round solid sticker holding a drawn icon ("tick" | "cross") or a short text ("1", "2", "z"). x, y is its CENTRE.
     b.set({icon, text, tone, k: 1, o: 1, x, y, dx, dy, s}) k 0..1 pops it in and draws the icon on.

   ───────────────────────────── A3.bars(parent, {x, y, w, rows, ...}) -> B ─────────────────────────────
     A card of horizontal bars, one row per item (the corner scores, the gain per unit, the ratio test, the width left).
       rows: [{label: "x", tone: "blue"}, ...]  label: 34 px bold at the left (labelW px wide, default 150); {html: "s<sub>1</sub>"} instead of label
             allows subscripts
       opts: rowH 56, gap 16, labelW 150, valW 64 (room for the value text), min 0, max 1 (the value range the bar region spans; use a negative
             min for signed bars: the zero line sits inside, negative bars grow left), frame true (sticker card round the rows, 20 px padding),
             title "gain per unit" (small grey tag on the top edge), fmt (v) => text (default A3.fmt)
     B.set({vals: [3, 2, null, ...] (null hides a row), k: 0..1 (bars grow from zero), tones: [..] (override the row tones), texts: ["+3", ...]
            (override the value text), labels: ["y", "s<sub>2</sub>"] (override the row labels, html allowed: the same card can be re-used for the next corner), hi: row index | null (an orange dashed frame round that row), rowO: [per-row opacity], o, dy})
     B.w, B.h: the card size (so you can stack cards: next y = y + h + 24)      B.rowY(i): stage y of the top of row i
     The value text shows once a bar has grown past 60 % (k). Values are drawn as given: pass the real numbers from the algorithm.

   ───────────────────────────── A3.stat(parent, {x, y, w: 220, h: 104, label, tone: "grey"}) -> s ─────────────────────────────
     A sticker with a small label above a big value ("evaluations 7", "width 0.146").  s.set({text, o, bump: 0..1 (a pop, pass V.flash), tone, dx, dy, s}).

   ───────────────────────────── A3.moves(parent, {x, y, w: 936, h: 64, gap: 16}) -> m ─────────────────────────────
     The four Nelder-Mead move chips in a row: reflect (purple), expand (green), contract (orange), shrink (red).
     m.set({active: "reflect" | "expand" | "in" | "out" | "shrink" | null, used: ["reflect", ...] (soft tint), counts: {reflect: 29, expand: 19, contract: 36,
            shrink: 0} (appends the number to a chip's name), pop: 1, o: 1, pulse: 0..1}); m.chips = the four A3.chip objects.

   ───────────────────────────── pictograms (SVG, centred on x, y) ─────────────────────────────
     A3.star(parent, {size: 44, tone: "orange"}) -> s     s.set({x, y, s, o, r, dx, dy})   the optimum / minimum star. parent: an SVG element (P.over) or an
         HTML element (a full-stage svg is added)
     A3.diamond(parent, {size: 24, tone: "orange"}) -> d  same set(): the centroid marker (a small diamond)
     VID.l5.tick(x, y, size, tone, opt) / cross(...) / arrow(...) + VID.l5.drawOn(g, k) are the shared drawn icons (see l5/common.js). */
(function () {
  const V = window.VID;
  const A3 = (V.a3 = V.a3 || {});
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const f1 = (n) => (+n).toFixed(1);
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const dflt = (v, d) => (v == null ? d : v);
  const cls = (e, c) => {
    if (e.className !== c) e.className = c;
  };
  const flex = { display: "flex", alignItems: "center", justifyContent: "center" };

  // ---------- tag ----------
  function tag(parent, opt = {}) {
    const { x = 0, y = 0, tone = "grey", solid = false, fs = 28, anchor = "l", minW } = opt;
    const justify = { l: "flex-start", c: "center", r: "flex-end", m: "center" }[anchor] || "flex-start";
    const holder = V.h("div", {
      style: {
        ...abs(x, y, 0, 0),
        display: "flex",
        justifyContent: justify,
        alignItems: anchor === "m" ? "center" : "flex-start",
        pointerEvents: "none",
      },
    });
    const el = V.h("div", {
      class: `v-tag c-${tone}${solid ? " solid" : ""}`,
      text: opt.text || "",
      style: {
        position: "relative",
        flex: "none",
        fontSize: `${fs}px`,
        lineHeight: "1.2",
        textAlign: "center",
        minWidth: minW ? `${minW}px` : "",
      },
    });
    holder.append(el);
    parent.append(holder);
    el.holder = holder;
    el.set = (st = {}) => {
      cls(el, `v-tag c-${st.tone || tone}${dflt(st.solid, solid) ? " solid" : ""}`);
      if (st.html != null) {
        if (el.innerHTML !== st.html) el.innerHTML = st.html;
      } else {
        const text = st.text != null ? String(st.text) : opt.text || "";
        if (el.textContent !== text || el.children.length) el.textContent = text;
      }
      V.place(el, { x: st.dx || 0, y: st.dy || 0, s: dflt(st.s, 1), r: st.r || 0, o: dflt(st.o, 1) });
    };
    return el;
  }

  // ---------- chip ----------
  function chip(parent, opt = {}) {
    const { x = 0, y = 0, w = 216, h = 60, text = "", tone = "blue" } = opt;
    const el = V.h("div", {
      class: "v-tag c-grey",
      text,
      style: { ...abs(x, y, w, h), ...flex, padding: "0", fontSize: "28px", lineHeight: "1" },
    });
    parent.append(el);
    const set = (st = {}) => {
      const { state = "grey", pop = 1, o = 1, dx = 0, dy = 0, pulse = 0, tone: tn = tone } = st;
      cls(el, state === "grey" ? "v-tag c-grey" : `v-tag c-${tn}${state === "active" ? " solid" : ""}`);
      el.style.boxShadow = state === "active" ? "0 4px 0 var(--c-lip)" : "";
      if (st.text != null && el.textContent !== st.text) el.textContent = st.text;
      const k = clamp(pop);
      V.place(el, {
        x: dx,
        y: dy,
        s: (0.8 + 0.2 * E.pop(k)) * (1 + 0.08 * Math.sin(Math.PI * clamp(pulse))),
        o: Math.min(o, clamp(k * 4)),
      });
    };
    return { el, set, w, h };
  }

  // ---------- badge and sticker ----------
  function iconSvg(parent, size) {
    const svg = V.s("svg", {
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`,
      style: { position: "absolute", left: "0", top: "0" },
    });
    const [tk, cr] = [
      L5.tick(size / 2, size / 2, size * 0.62, "green", { on: true, w: size * 0.12 }),
      L5.cross(size / 2, size / 2, size * 0.62, "red", { on: true, w: size * 0.12 }),
    ];
    svg.append(tk, cr);
    parent.append(svg);
    return { svg, tk, cr };
  }
  function showIcon(ic, icon, k) {
    const [tk, cr] = [icon === "tick", icon === "cross"];
    V.show(ic.tk, +tk);
    V.show(ic.cr, +cr);
    if (tk) L5.drawOn(ic.tk, V.ramp(k, 0.3, 1));
    if (cr) L5.drawOn(ic.cr, V.ramp(k, 0.3, 1));
    V.show(ic.svg, +(tk || cr));
  }
  function badge(parent, opt = {}) {
    const { x = 0, y = 0, size = 48, tone = "blue", icon = null, text = "" } = opt;
    const el = V.h("div", {
      class: `v-tag solid c-${tone}`,
      style: {
        ...abs(x - size / 2, y - size / 2, size, size),
        ...flex,
        padding: "0",
        borderRadius: "50%",
        fontSize: `${Math.round(size * 0.58)}px`,
        lineHeight: "1",
        boxShadow: "0 4px 0 var(--c-lip)",
      },
    });
    const label = V.h("span", { text });
    el.append(label);
    const ic = iconSvg(el, size - 6);
    ic.svg.style.left = ic.svg.style.top = "0";
    parent.append(el);
    const set = (st = {}) => {
      const { icon: i = icon, text: t = text, tone: tn = tone, k = 1, o = 1, dx = 0, dy = 0, s = 1 } = st;
      cls(el, `v-tag solid c-${tn}`);
      if (label.textContent !== (i ? "" : t)) label.textContent = i ? "" : t;
      showIcon(ic, i, k);
      const [px, py] = [dflt(st.x, x) - x + dx, dflt(st.y, y) - y + dy];
      V.place(el, { x: px, y: py, s: s * (0.7 + 0.3 * E.pop(clamp(k))), o: Math.min(o, clamp(k * 4)) });
    };
    return { el, set, size };
  }
  function sticker(parent, opt = {}) {
    const { x = 0, y = 0, w = 330, h = 64, tone = "green", text = "", icon = null, fs = 28 } = opt;
    const el = V.h("div", {
      class: `v-tag c-${tone}`,
      style: {
        ...abs(x, y, w, h),
        ...flex,
        gap: "10px",
        padding: "0 18px 0 8px",
        fontSize: `${fs}px`,
        lineHeight: "1",
      },
    });
    const box = V.h("div", {
      style: { position: "relative", width: `${h - 16}px`, height: `${h - 16}px`, flex: "none" },
    });
    const ic = iconSvg(box, h - 16);
    const label = V.h("span", { text });
    el.append(box, label);
    parent.append(el);
    const set = (st = {}) => {
      const { text: t = text, tone: tn = tone, icon: i = icon, solid = false, k = 1, o = 1, dx = 0, dy = 0 } = st;
      cls(el, `v-tag c-${tn}${solid ? " solid" : ""}`);
      if (label.textContent !== t) label.textContent = t;
      box.style.display = i ? "" : "none";
      showIcon(ic, i, k);
      V.place(el, { x: dx, y: dy, s: 0.8 + 0.2 * E.pop(clamp(k)), o: Math.min(o, clamp(k * 4)) });
    };
    return { el, set, w, h };
  }

  // ---------- bars ----------
  function bars(parent, opt = {}) {
    const {
      x = 0,
      y = 0,
      w = 400,
      rows = [],
      rowH = 56,
      gap = 16,
      labelW = 150,
      valW = 64,
      min = 0,
      max = 1,
      frame = true,
      title,
    } = opt;
    const fmt = opt.fmt || ((v) => A3.fmt(v));
    const pad = frame ? 20 : 0;
    const top = pad + (title ? 36 : 0);
    const h = top + rows.length * rowH + (rows.length - 1) * gap + pad;
    const el = V.h("div", { style: abs(x, y, w, h) });
    if (frame) el.append(V.h("div", { class: "v-card plain", style: abs(0, 0, w, h) }));
    const valL = min < 0 ? valW : 0; // signed bars: room at the left for the text of a negative value
    const regionX = pad + labelW + valL;
    const regionW = w - pad * 2 - labelW - valL - valW;
    const px = (v) => regionX + ((v - min) / (max - min)) * regionW;
    const rowY = (i) => top + i * (rowH + gap);
    const rowBox = { height: `${rowH}px`, lineHeight: `${rowH}px` };
    const hiBox = V.h("div", {
      style: {
        ...abs(pad - 10, 0, w - pad * 2 + 20, rowH + 12),
        border: "4px dashed var(--amber)",
        borderRadius: "20px",
        boxSizing: "border-box",
      },
    });
    if (min < 0) {
      const zero = V.h("div", {
        style: {
          ...abs(px(0) - 1.5, top - 6, 3, h - top - pad + 12),
          background: "var(--line-2)",
          borderRadius: "2px",
        },
      });
      el.append(zero);
    }
    const R = rows.map((r, i) => {
      const label = V.h("div", {
        class: "v-text big",
        style: { left: `${pad}px`, top: `${rowY(i) + 3}px`, fontSize: "34px", ...rowBox },
      });
      if (r.html) label.innerHTML = r.html;
      else label.textContent = r.label;
      const bar = V.h("div", {
        class: `v-card c-${r.tone || "blue"}`,
        style: {
          height: `${rowH - 20}px`,
          top: `${rowY(i) + 10}px`,
          borderRadius: "14px",
          background: "var(--c)",
          borderColor: "var(--c-lip)",
          boxShadow: "0 4px 0 var(--c-lip)",
        },
      });
      const val = V.h("div", {
        class: "v-text",
        style: { top: `${rowY(i) + 3}px`, fontSize: "30px", fontWeight: "900", ...rowBox },
      });
      el.append(label, bar, val);
      return { label, bar, val, r };
    });
    if (title)
      el.append(
        V.h("div", { class: "v-text dim", text: title, style: { left: `${pad}px`, top: "8px", fontSize: "28px" } }),
      );
    el.append(hiBox);
    parent.append(el);
    const set = (st = {}) => {
      const { vals = [], k = 1, tones = [], texts = [], labels = [], hi = null, rowO = [], o = 1, dy = 0 } = st;
      R.forEach((row, i) => {
        const v = vals[i];
        const on = v != null;
        const ro = dflt(rowO[i], 1);
        const kk = clamp(k);
        const tn = tones[i] || row.r.tone || "blue";
        const [from, to] = on
          ? v < 0
            ? [px(0) - (px(0) - px(v)) * kk, px(0)]
            : [px(0), px(0) + (px(v) - px(0)) * kk]
          : [0, 0];
        cls(row.bar, `v-card c-${tn}`);
        Object.assign(row.bar.style, { left: `${f1(from)}px`, width: `${f1(Math.max(4, to - from))}px` });
        V.show(row.bar, on ? ro * clamp(kk * 6) : 0);
        const text = texts[i] != null ? texts[i] : on ? fmt(v) : "";
        if (row.val.textContent !== text) row.val.textContent = text;
        Object.assign(row.val.style, {
          left: `${f1(v < 0 ? from - 14 - text.length * 17 : to + 14)}px`,
          color: L5.tone(tn).ink,
        });
        V.show(row.val, on ? ro * V.ramp(kk, 0.6, 1, E.lin) : 0);
        if (labels[i] != null && row.label.innerHTML !== labels[i]) row.label.innerHTML = labels[i];
        V.show(row.label, on ? ro : 0);
      });
      if (hi != null) hiBox.style.top = `${f1(rowY(hi) - 6)}px`;
      V.show(hiBox, hi != null ? 1 : 0);
      V.place(el, { y: dy, o });
    };
    return { el, set, w, h, rowY: (i) => y + rowY(i) };
  }

  // ---------- stat ----------
  function stat(parent, opt = {}) {
    const { x = 0, y = 0, w = 220, h = 104, label = "", tone = "grey" } = opt;
    const el = V.h("div", { class: `v-card c-${tone}`, style: abs(x, y, w, h) });
    const lab = V.h("div", { class: "v-text dim", text: label, style: { left: "18px", top: "8px", fontSize: "28px" } });
    const val = V.h("div", {
      class: "v-text big",
      style: { left: "18px", top: `${h - 62}px`, fontSize: "48px", color: "var(--c-ink)" },
    });
    el.append(lab, val);
    parent.append(el);
    const set = (st = {}) => {
      const { text = "", o = 1, bump = 0, tone: tn = tone, dx = 0, dy = 0, s = 1 } = st;
      cls(el, `v-card c-${tn}`);
      if (val.textContent !== text) val.textContent = text;
      V.place(el, { x: dx, y: dy, s: s * (1 + 0.08 * clamp(bump)), o });
    };
    return { el, set, w, h };
  }

  // ---------- Nelder-Mead move chips ----------
  const MOVES = [
    ["reflect", "purple"],
    ["expand", "green"],
    ["contract", "orange"],
    ["shrink", "red"],
  ];
  function moves(parent, opt = {}) {
    const { x = 0, y = 0, w = 936, h = 64, gap = 16 } = opt;
    const cw = (w - gap * 3) / 4;
    const chips = MOVES.map(([name, tone], i) =>
      chip(parent, { x: x + i * (cw + gap), y, w: cw, h, text: name, tone }),
    );
    const set = (st = {}) => {
      const { active = null, used = [], counts = null, pop = 1, o = 1, pulse = 0 } = st;
      const key = active === "in" || active === "out" ? "contract" : active;
      MOVES.forEach(([name, tone], i) => {
        const n = counts ? counts[name] : 0;
        const state = key === name ? "active" : used.includes(name) || n > 0 ? "done" : "grey";
        chips[i].set({ state, tone, pop, o, pulse: key === name ? pulse : 0, text: counts ? `${name} ${n}` : name });
      });
    };
    return { chips, set };
  }

  // ---------- pictograms ----------
  const starPts = (r) =>
    Array.from({ length: 10 }, (_, j) => {
      const a = -Math.PI / 2 + (j * Math.PI) / 5;
      const rr = j % 2 ? r * 0.46 : r;
      return `${f1(rr * Math.cos(a))},${f1(rr * Math.sin(a))}`;
    }).join(" ");
  const shape = (parent, opt, make) => {
    const svg = parent instanceof SVGElement ? parent : L5.svg(parent);
    const g = svg.appendChild(V.s("g"));
    make(g);
    return {
      el: g,
      set: ({ x = 0, y = 0, s = 1, o = 1, r = 0, dx = 0, dy = 0 } = {}) =>
        V.place(g, { x: x + dx, y: y + dy, s, o, r }),
    };
  };
  const star = (parent, { size = 44, tone = "orange" } = {}) =>
    shape(parent, {}, (g) => {
      const t = L5.tone(tone);
      g.append(
        V.s("polygon", { points: starPts(size / 2), transform: "translate(0 4)", style: { fill: t.lip } }),
        V.s("polygon", {
          points: starPts(size / 2),
          "stroke-width": "3",
          "stroke-linejoin": "round",
          style: { fill: t.c, stroke: t.lip },
        }),
      );
    });
  const diamond = (parent, { size = 24, tone = "orange" } = {}) =>
    shape(parent, {}, (g) => {
      const t = L5.tone(tone);
      const pts = `0,${-size / 2} ${size / 2},0 0,${size / 2} ${-size / 2},0`;
      g.append(
        V.s("polygon", {
          points: pts,
          "stroke-width": "3",
          "stroke-linejoin": "round",
          style: { fill: t.c, stroke: t.lip },
        }),
      );
    });

  Object.assign(A3, { tag, chip, badge, sticker, bars, stat, moves, star, diamond });
})();

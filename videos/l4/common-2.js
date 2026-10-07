/* Lecture 4 · drawing helpers, part 1: tag, tiles, bar, knob, cut line, bell curve. (Part 2 is common-3.js: wheel, heat, pixels.)
   Everything hangs off VID.l4 (L4). Positions are stage pixels (936 x 640, origin top-left). Every set / update call is a PURE
   function of its arguments: call it each frame from your scene's update(t), pass everything you want to see (omitted fields fall
   back to defaults) and keep no state between frames. Tones: "green" "red" "blue" "purple" "orange" "grey" (see l5/common.js).

   1. TAG  (compact pill label, fixed height round(fs * 1.65): 46 px at the default 28 px, 56 px at 34 px; width = text + 42 px)
        const t = L4.tag(stage, { x, y, text, tone: "grey", solid: false, fs: 28, anchor: "l" });
        t.set({ text, tone, solid, x, y, s, o })   // x, y = offset from the home position (like V.place), s scale, o opacity
        t.el   the element (t.el.offsetWidth in a browser gives the real width);   t.h  its height
      anchor "l" (default): x is the left edge; "c": x is the centre; "r": x is the right edge. y is always the top edge.

   2. TILES  (a row of rounded tiles; one tile = a chip. Same API as L5.chromosome, with free tile size and font)
        const row = L4.tiles(stage, { x, y, vals: [0.1, 0.5], w: 104, h: 104, gap: 14, font: 58, tone: "grey", tones: [per tile] });
        row.set(i, { x, y, s, sx, r, o, tone, text, solid, ghost })   // x, y = offset from the tile's own slot; text replaces the value;
                                                                      // solid = filled with the tone; ghost = dashed outline, no fill
        row.flip(i, k, { from, to, tone, toTone, hop, ...set fields })   // k 0..1: squash to 0 width, swap value and tone, open again
        row.all((i) => state | undefined)     // set every tile from one function
        row.pos(i) -> x of slot i inside the row (fractions work);   row.mid(i) -> {x, y} centre of slot i in stage px
        row.el, row.tiles, row.width, row.height, row.left, row.top, row.w, row.h

   3. BAR  (sticker bar: grey track, rounded fill with a lip)
        const b = L4.bar(stage, { x, y, len, thick: 36, dir: "h", textPos: "end", fs, textGap: 12 });
        b.set({ k, tone, o, text, textTone, ghost })
      dir "h": the track runs right from (x, y = top edge) over len px; the text sits in a fixed column textGap px after the track
      end (textPos "end"), centred over the track ("in") or hidden ("none"). dir "v": the track stands on the baseline y (x = left
      edge, thick = width) and grows upwards over len px; the text sits just above the fill top.
      k = fill fraction 0..1 of len (a nonzero k is drawn at least 6 px so a 0.4% bar is visible). ghost = fraction 0..1 of a dashed
      marker (the old value), omit for none. text = whatever you compute (L4.pct(p)); textTone defaults to the fill tone (grey ->
      plain ink). Text size defaults to max(28, min(34, thick)).

   4. KNOB  (sticker slider with numbered stops and a pill)
        const kn = L4.knob(stage, { x, y, w, stops: [0, 1, 2], thumb: 40, pillX: x - 150, tone: "purple", fs: 34 });
        kn.set({ v, text, o })      // v = value in stops' units (fractional is fine); text = pill text ("b = 1"); stops need not be even
      The track runs from x to x + w with y at its centre line; stop labels (28 px) sit under the track, the nearest one is bold.
      kn.at(v) -> x of a value; kn.stopsX the x of each stop.

   5. CUT LINE  (orange dashed vertical line)
        const c = L4.cutLine(stage, { x, y1, y2 });   c.set({ x, k, o })    // x absolute (omit = start x), k 0..1 draws on from the top

   6. BELL  (small Gaussian curve pictogram; parent may be a stage div or an <svg>/<g>)
        const b = L4.bell(stage, { x, y, w, h });     b.set({ k, mark, o })   // k draws the curve on, mark 0..1 puts a dot on it at that
        b.g  the SVG group                                                     // fraction of the width (omit = no dot)
      Pictograms use V.place semantics for movement: V.place(b.g, { x, y }). */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const { clamp } = V;
  const { abs, f1, svgIn } = L4.ui;
  const dflt = (v, d) => (v == null ? d : v);
  const TONES = ["green", "red", "blue", "purple", "orange", "grey"];
  const tn = (t) => {
    if (!TONES.includes(t)) throw new Error(`VID.l4: unknown tone "${t}"`);
    return t;
  };
  const ink = (t) => (t === "grey" ? "var(--ink)" : `var(--c-ink)`);
  const opac = (e, o) => {
    e.style.opacity = o >= 1 ? "" : String(Math.max(0, o));
    e.style.visibility = o <= 0.001 ? "hidden" : "";
  };

  // ---------- 1. tag ----------
  function tag(parent, opt = {}) {
    const { x = 0, y = 0, fs = 28, anchor = "l" } = opt;
    const h = Math.round(fs * 1.65);
    const el = V.h("div", {
      style: {
        ...abs(x, y, null, h),
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 18px",
        lineHeight: "1",
        fontSize: `${fs}px`,
        boxShadow: "0 4px 0 var(--c-edge)",
      },
    });
    parent.append(el);
    const shift = anchor === "c" ? "-50%" : anchor === "r" ? "-100%" : "0";
    const set = (st = {}) => {
      const cls = `v-tag c-${tn(st.tone || opt.tone || "grey")}${(dflt(st.solid, opt.solid) && " solid") || ""}`;
      if (el.className !== cls) el.className = cls;
      const text = st.text == null ? String(opt.text == null ? "" : opt.text) : String(st.text);
      if (el.textContent !== text) el.textContent = text;
      el.style.boxShadow = dflt(st.solid, opt.solid) ? "0 4px 0 var(--c-lip)" : "0 4px 0 var(--c-edge)";
      const { x: dx = 0, y: dy = 0, s = 1, o = 1 } = st;
      opac(el, o);
      el.style.transformOrigin = "50% 50%";
      el.style.transform = `translate(${shift}, 0) translate(${f1(dx)}px, ${f1(dy)}px) scale(${s.toFixed(3)})`;
    };
    set();
    return { el, set, h };
  }

  // ---------- 2. tiles ----------
  function tiles(parent, opt = {}) {
    const { x = 0, y = 0, w = 104, h = 104, gap = 14, font = 58, tone: base = "grey" } = opt;
    const vals = (opt.vals || []).map(String);
    const width = vals.length * w + (vals.length - 1) * gap;
    const pos = (i) => i * (w + gap);
    const tone0 = (i) => (opt.tones && opt.tones[i]) || base;
    const el = V.h("div", { style: abs(x, y, width, h) });
    const radius = `${Math.round(Math.min(24, Math.min(w, h) * 0.23))}px`;
    const ts = vals.map((v, i) =>
      V.h("div", {
        class: `v-gene c-${tn(tone0(i))}`,
        text: v,
        style: { ...abs(pos(i), 0, w, h), fontSize: `${font}px`, borderRadius: radius },
      }),
    );
    el.append(...ts);
    parent.append(el);
    const set = (i, st = {}) => {
      const t = ts[i];
      const cls = `v-gene c-${tn(st.tone || tone0(i))}${st.solid ? " solid" : ""}${st.ghost ? " ghost" : ""}`;
      if (t.className !== cls) t.className = cls;
      const text = st.text == null ? vals[i] : String(st.text);
      if (t.textContent !== text) t.textContent = text;
      const { x: dx = 0, y: dy = 0, s = 1, sx = 1, r = 0, o = 1 } = st;
      opac(t, o);
      t.style.transform = `translate(${f1(dx)}px, ${f1(dy)}px) rotate(${r}deg) scale(${(s * sx).toFixed(3)}, ${s})`;
    };
    const flip = (i, k, st = {}) => {
      const kk = clamp(k);
      const { from = vals[i], to = vals[i], tone: t1, toTone, hop = 0, ...rest } = st;
      const second = kk >= 0.5;
      set(i, {
        ...rest,
        text: second ? to : from,
        tone: second ? toTone || t1 : t1,
        sx: Math.abs(Math.cos(Math.PI * kk)) * dflt(rest.sx, 1),
        y: (rest.y || 0) - hop * Math.sin(Math.PI * kk),
      });
    };
    ts.forEach((_, i) => set(i));
    return {
      el,
      tiles: ts,
      width,
      height: h,
      left: x,
      top: y,
      w,
      h,
      pos,
      set,
      flip,
      mid: (i) => ({ x: x + pos(i) + w / 2, y: y + h / 2 }),
      all: (fn) => vals.forEach((_, i) => set(i, fn(i) || {})),
    };
  }

  // ---------- 3. bar ----------
  function bar(parent, opt = {}) {
    const { x = 0, y = 0, len = 200, thick = 36, dir = "h", textPos = "end", textGap = 12 } = opt;
    const fs = opt.fs || Math.max(28, Math.min(34, thick));
    const horiz = dir !== "v";
    const el = V.h("div", { style: abs(0, 0, 0, 0) });
    const track = V.h("div", {
      class: "c-grey",
      style: {
        ...abs(horiz ? x : x, horiz ? y : y - len, horiz ? len : thick, horiz ? thick : len),
        boxSizing: "border-box",
        border: "3px solid var(--line-2)",
        borderRadius: `${thick / 2}px`,
        background: "var(--panel-2)",
      },
    });
    const fill = V.h("div", { style: { position: "absolute", borderRadius: `${(thick - 6) / 2}px` } });
    const ghostEl = V.h("div", {
      style: { position: "absolute", boxSizing: "border-box", borderStyle: "dashed", borderColor: "var(--ink)" },
    });
    const text = V.h("div", {
      style: {
        position: "absolute",
        fontSize: `${fs}px`,
        fontWeight: "900",
        lineHeight: "1",
        whiteSpace: "nowrap",
        color: "var(--ink)",
      },
    });
    el.append(track, fill, ghostEl, text);
    parent.append(el);
    const inner = len - 6; // room for the fill inside the track border
    const set = (st = {}) => {
      const k = clamp(st.k || 0);
      const t = tn(st.tone || "grey");
      const L = k > 0 ? Math.max(6, k * inner) : 0;
      fill.className = `c-${t}`;
      fill.style.background = t === "grey" ? "var(--line-2)" : "var(--c)";
      fill.style.boxShadow = `inset 0 -4px 0 ${t === "grey" ? "var(--node-off-lip)" : "var(--c-lip)"}`;
      fill.style.visibility = L > 0 ? "" : "hidden";
      const gk = st.ghost == null ? null : clamp(st.ghost);
      const gp = gk == null ? 0 : Math.max(6, gk * inner) + 3;
      if (horiz) {
        Object.assign(fill.style, {
          left: `${f1(x + 3)}px`,
          top: `${f1(y + 3)}px`,
          width: `${f1(L)}px`,
          height: `${thick - 6}px`,
        });
        Object.assign(ghostEl.style, {
          left: `${f1(x + gp - 1.5)}px`,
          top: `${f1(y - 8)}px`,
          width: "0px",
          height: `${thick + 16}px`,
          borderWidth: "0 0 0 3px",
        });
        const tx = textPos === "in" ? x + len / 2 : x + len + textGap;
        Object.assign(text.style, {
          left: `${f1(tx)}px`,
          top: `${f1(y + thick / 2 - fs / 2)}px`,
          transform: textPos === "in" ? "translateX(-50%)" : "",
        });
      } else {
        Object.assign(fill.style, {
          left: `${f1(x + 3)}px`,
          top: `${f1(y - 3 - L)}px`,
          width: `${thick - 6}px`,
          height: `${f1(L)}px`,
        });
        Object.assign(ghostEl.style, {
          left: `${f1(x - 8)}px`,
          top: `${f1(y - gp - 1.5)}px`,
          width: `${thick + 16}px`,
          height: "0px",
          borderWidth: "3px 0 0 0",
        });
        Object.assign(text.style, {
          left: `${f1(x + thick / 2)}px`,
          top: `${f1(y - Math.max(L, 0) - 6 - fs - 6)}px`,
          transform: "translateX(-50%)",
        });
      }
      ghostEl.style.visibility = gk == null ? "hidden" : "";
      const tt = st.text == null ? "" : String(st.text);
      if (text.textContent !== tt) text.textContent = tt;
      const tt2 = st.textTone || (t === "grey" ? "grey" : t);
      text.className = `c-${tn(tt2)}`;
      text.style.color = ink(tt2);
      text.style.visibility = textPos === "none" ? "hidden" : "";
      opac(el, dflt(st.o, 1));
    };
    set();
    return { el, set };
  }

  // ---------- 4. knob ----------
  function knob(parent, opt = {}) {
    const { x = 0, y = 0, w = 400, stops = [0, 1, 2], thumb = 40, pillX = x - 150 } = opt;
    const el = V.h("div", { style: abs(0, 0, 0, 0) });
    const track = V.h("div", {
      style: {
        ...abs(x, y - 9, w, 18),
        boxSizing: "border-box",
        border: "3px solid var(--line-2)",
        borderRadius: "9px",
        background: "var(--panel-2)",
        boxShadow: "0 4px 0 var(--line-2)",
      },
    });
    const n = stops.length;
    const stopsX = stops.map((_, i) => x + (w * i) / (n - 1));
    const labels = stops.map((s, i) =>
      V.h("div", {
        text: String(s),
        style: {
          ...abs(stopsX[i] - 40, y + thumb / 2 + 6, 80),
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "900",
          lineHeight: "1",
        },
      }),
    );
    const marks = stops.map((_, i) =>
      V.h("div", { style: { ...abs(stopsX[i] - 3, y - 14, 6, 28), borderRadius: "3px", background: "var(--line-2)" } }),
    );
    const thumbEl = V.h("div", {
      class: `c-${tn(opt.tone || "purple")} solid`,
      style: {
        ...abs(x - thumb / 2, y - thumb / 2, thumb, thumb),
        boxSizing: "border-box",
        borderRadius: "50%",
        background: "var(--c)",
        border: "3px solid var(--c-lip)",
        boxShadow: "0 4px 0 var(--c-lip)",
      },
    });
    el.append(track, ...marks, ...labels, thumbEl);
    parent.append(el);
    const pill = tag(parent, {
      x: pillX,
      y: y - Math.round((opt.fs || 34) * 1.65) / 2,
      tone: opt.tone || "purple",
      solid: true,
      fs: opt.fs || 34,
      text: "",
    });
    const frac = (v) => {
      if (v <= stops[0]) return 0;
      for (let i = 1; i < n; i++)
        if (v <= stops[i]) return (i - 1 + (v - stops[i - 1]) / (stops[i] - stops[i - 1])) / (n - 1);
      return 1;
    };
    const at = (v) => x + w * frac(v);
    const set = (st = {}) => {
      const v = dflt(st.v, stops[0]);
      const px = at(v);
      thumbEl.style.left = `${f1(px - thumb / 2)}px`;
      let near = 0;
      stops.forEach((s, i) => {
        if (Math.abs(s - v) < Math.abs(stops[near] - v)) near = i;
      });
      labels.forEach((l, i) => {
        l.style.color = i === near ? "var(--ink)" : "var(--text-dim)";
      });
      const o = dflt(st.o, 1);
      opac(el, o);
      pill.set({ text: st.text, o });
    };
    set();
    return { el, set, at, stopsX };
  }

  // ---------- 5. cut line ----------
  function cutLine(parent, opt = {}) {
    const { x = 0, y1 = 0, y2 = 100 } = opt;
    const svg = svgIn(parent, 0, 0);
    const line = V.s("line", {
      x1: 0,
      x2: 0,
      "stroke-width": 5,
      "stroke-linecap": "round",
      "stroke-dasharray": "12 10",
      style: { stroke: "var(--amber)" },
    });
    svg.append(line);
    const set = (st = {}) => {
      const k = clamp(dflt(st.k, 1));
      line.setAttribute("y1", f1(y1));
      line.setAttribute("y2", f1(y1 + (y2 - y1) * k));
      line.setAttribute("transform", `translate(${f1(dflt(st.x, x))} 0)`);
      opac(svg, k <= 0.001 ? 0 : dflt(st.o, 1));
    };
    set();
    return { el: svg, set };
  }

  // ---------- 6. bell ----------
  function bell(parent, opt = {}) {
    const { x = 0, y = 0, w = 120, h = 40 } = opt;
    const root = parent instanceof SVGElement ? parent : svgIn(parent);
    const g = V.s("g", {});
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      pts.push([x + u * w, y + h - (h - 4) * Math.exp(-Math.pow((u - 0.5) / 0.17, 2) / 2)]);
    }
    const base = V.s("line", {
      x1: x,
      x2: x + w,
      y1: y + h,
      y2: y + h,
      "stroke-width": 3,
      "stroke-linecap": "round",
      style: { stroke: "var(--line-2)" },
    });
    const curve = V.s("path", {
      d: pts.map((p, i) => `${i ? "L" : "M"} ${f1(p[0])} ${f1(p[1])}`).join(" "),
      fill: "none",
      pathLength: "1",
      "stroke-width": 4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      style: { stroke: "var(--blue)" },
    });
    const dot = V.s("circle", { r: 7, style: { fill: "var(--blue)", stroke: "var(--blue-lip)" }, "stroke-width": 3 });
    g.append(base, curve, dot);
    root.append(g);
    const set = (st = {}) => {
      const k = clamp(dflt(st.k, 1));
      curve.style.strokeDasharray = "1";
      curve.style.strokeDashoffset = String(1 - k);
      const m = st.mark;
      if (m != null) {
        const i = Math.min(40, Math.max(0, Math.round(clamp(m) * 40)));
        dot.setAttribute("cx", f1(pts[i][0]));
        dot.setAttribute("cy", f1(pts[i][1]));
      }
      dot.style.visibility = m == null ? "hidden" : "";
      opac(base, k);
      opac(g, k <= 0.001 ? 0 : dflt(st.o, 1));
    };
    set();
    return { g, el: g, set };
  }

  Object.assign(L4, { tag, tiles, bar, knob, cutLine, bell });
})();

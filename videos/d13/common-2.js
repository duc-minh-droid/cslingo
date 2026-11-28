/* Lecture 13 · Thread-level parallelism: the drawing pieces (VID.d13, short name D13). Needs videos/l5/common.js,
   videos/d4/common*.js and d13/common.js first. Positions are stage pixels (936 x 640, origin top-left). Every set() is
   pure: call it each frame with everything you want to see. Tones are the video's colour roles (see common.js).

   D13.box(parent, {x, y, w, h, tone, title, sub, fs: 30, solid, plain, r: 22})   a sticker card with a bold title and an
        optional 28 px sub line.  .set({k, s, o, x, y, tone, solid, title, sub, ring: tone, ringK, dash})
        .top / .bottom / .left / .right / .mid -> {x, y} stage px
   D13.outline(parent, {x, y, w, h, tone, label, dash, fill, fs: 30, bw: 4})   a frame with a label in its top-left corner.
        .set({k, o, x, y, s, bw})
   D13.wavy(svg, {x, y0, y1, amp: 14, waves: 2.5, tone: "blue", shade: "c", w: 7})   a vertical wavy thread line.
        .at(f) -> {x, y} at fraction f;  .set({k (draw-on 0..1), o})
   D13.seg(svg, {a, b, tone: "grey", w: 5, dash: ""})   a straight line drawn from a towards b.  .set({k, o, tone, dash})
   D13.mark(svg, {shape: "circle" | "square" | "triangle" | "diamond", tone, r: 12})   a travelling dot.
        .set({x, y, o, s, tone})
   Icons (SVG groups at x, y, size s): D13.chip, D13.envelope, D13.door, D13.clock (hands at 7:00), D13.priceTag, D13.noSend
        (an envelope with a red cross over it).
   D13.lanes(stage, {x, y, w, rows: [names], gaps: [extra px before row i], T, ticks, unit: "min", rowH: 50, gap: 10,
        nameW: 150, max: 30, marksMax: 8})   timeline lanes with a minutes axis.
        .set({k, axes, names, now, bars: [{row, a, b, kind: "work" | "seq" | "idle", text, k, glow}],
              marks: [{t, r0, r1, tone: "green", text, k, top: true}]})   .X(t), .rowY(i), .rowTop(i), .axisY, .bottom */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D13 = V.d13;
  const { clamp, lerp, ease: E } = V;
  const T = D4.tone;
  const f1 = (n) => (+n).toFixed(1);
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    ...(w != null ? { width: `${f1(Math.max(0, w))}px` } : {}),
    ...(h != null ? { height: `${f1(Math.max(0, h))}px` } : {}),
  });
  D13.abs = abs;
  D13.tone = T;
  const stroke = (tn) => (tn === "grey" ? T(tn).edge : T(tn).c);

  // ---------- sticker boxes and frames ----------
  function box(parent, o = {}) {
    const { x = 0, y = 0, w = 200, h = 90, tone = "grey", r = 22 } = o;
    const el = V.h("div", {
      class: `v-card c-${tone}`,
      style: {
        ...abs(x, y, w, h),
        borderRadius: `${r}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "4px 10px",
        lineHeight: "1.1",
      },
    });
    const title = V.h("div", { text: o.title || "", style: { fontSize: `${o.fs || 30}px`, fontWeight: "900" } });
    const sub = V.h("div", {
      text: o.sub || "",
      style: {
        fontSize: "28px",
        fontWeight: "800",
        marginTop: "4px",
        textWrap: "balance",
        display: o.sub ? "" : "none",
      },
    });
    const ring = V.h("div", {
      style: {
        ...abs(-11, -11, w + 16, h + 16),
        boxSizing: "border-box",
        border: "6px solid var(--blue)",
        borderRadius: `${r + 10}px`,
        visibility: "hidden",
      },
    });
    el.append(ring, title, sub);
    parent.append(el);
    return {
      el,
      x,
      y,
      w,
      h,
      mid: { x: x + w / 2, y: y + h / 2 },
      top: { x: x + w / 2, y },
      bottom: { x: x + w / 2, y: y + h },
      left: { x, y: y + h / 2 },
      right: { x: x + w, y: y + h / 2 },
      set(st = {}) {
        const tn = st.tone || tone;
        const cls = `v-card c-${tn}`;
        if (el.className !== cls) el.className = cls;
        const solid = st.solid ?? !!o.solid;
        const plain = st.plain ?? !!o.plain;
        Object.assign(el.style, {
          background: solid ? "var(--c)" : plain ? "var(--panel)" : "",
          borderColor: solid ? "var(--c-lip)" : "",
          boxShadow: solid ? "0 6px 0 var(--c-lip)" : "",
          color: solid ? "var(--c-on)" : "",
          borderStyle: st.dash ? "dashed" : "",
        });
        if (st.title != null && title.textContent !== st.title) title.textContent = st.title;
        if (st.sub != null && sub.textContent !== st.sub) sub.textContent = st.sub;
        const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
        if (st.ring && rk > 0.002) {
          ring.style.borderColor = T(st.ring).c;
          ring.style.visibility = "";
          ring.style.opacity = String(Math.min(1, rk * 3));
          ring.style.transform = `scale(${(0.94 + 0.06 * E.pop(rk)).toFixed(3)})`;
        } else ring.style.visibility = "hidden";
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
  D13.box = box;

  function outline(parent, o = {}) {
    const { x = 0, y = 0, w = 300, h = 200, tone = "purple", r = 26, bw = 4 } = o;
    const el = V.h("div", {
      class: `c-${tone}`,
      style: {
        ...abs(x, y, w, h),
        boxSizing: "border-box",
        border: `${bw}px ${o.dash ? "dashed" : "solid"} var(--c)`,
        borderRadius: `${r}px`,
        background: o.fill ? "var(--c-dim)" : "transparent",
      },
    });
    const lab = V.h("div", {
      class: "v-text",
      text: o.label || "",
      style: { left: "18px", top: "6px", fontSize: `${o.fs || 30}px`, fontWeight: "900", color: "var(--c-ink)" },
    });
    el.append(lab);
    parent.append(el);
    return {
      el,
      lab,
      x,
      y,
      w,
      h,
      set(st = {}) {
        el.style.borderWidth = `${f1(st.bw ?? bw)}px`;
        V.place(el, { x: st.x || 0, y: st.y || 0, s: st.s ?? 1, o: clamp(st.k ?? 1) * (st.o ?? 1) });
      },
    };
  }
  D13.outline = outline;

  // ---------- lines and dots ----------
  function wavy(svg, o = {}) {
    const { x = 0, y0 = 0, y1 = 100, amp = 14, waves = 2.5, tone = "blue", shade = "c", w = 7 } = o;
    const N = 60;
    const at = (f) => ({ x: x + amp * Math.sin(clamp(f) * waves * 2 * Math.PI), y: lerp(y0, y1, clamp(f)) });
    const d = Array.from({ length: N + 1 }, (_, i) => {
      const p = at(i / N);
      return `${i ? "L" : "M"} ${f1(p.x)} ${f1(p.y)}`;
    }).join(" ");
    const path = V.s("path", {
      d,
      fill: "none",
      pathLength: "1",
      "stroke-width": w,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    path.style.stroke = T(tone)[shade];
    svg.append(path);
    return {
      el: path,
      at,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        path.style.strokeDasharray = k >= 1 ? "none" : `${k.toFixed(4)} 1`;
        V.show(path, k > 0.002 ? (st.o ?? 1) : 0);
      },
    };
  }
  D13.wavy = wavy;

  function seg(svg, o = {}) {
    const { a, b, tone = "grey", w = 5, dash = "" } = o;
    const ln = V.s("line", { "stroke-linecap": "round", "stroke-width": w, x1: f1(a.x), y1: f1(a.y) });
    svg.append(ln);
    return {
      el: ln,
      a,
      b,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        ln.setAttribute("x2", f1(lerp(a.x, b.x, k)));
        ln.setAttribute("y2", f1(lerp(a.y, b.y, k)));
        ln.style.stroke = stroke(st.tone || tone);
        ln.style.strokeDasharray = (st.dash ?? dash) || "none";
        V.show(ln, k > 0.002 ? (st.o ?? 1) : 0);
      },
    };
  }
  D13.seg = seg;

  function mark(svg, o = {}) {
    const { shape = "circle", tone = "purple", r = 12 } = o;
    const shapes = {
      circle: () => V.s("circle", { cx: 0, cy: 0, r }),
      square: () => V.s("rect", { x: -r * 0.9, y: -r * 0.9, width: r * 1.8, height: r * 1.8, rx: 3 }),
      triangle: () =>
        V.s("polygon", { points: `0,${f1(-r * 1.1)} ${f1(r * 1.05)},${f1(r * 0.8)} ${f1(-r * 1.05)},${f1(r * 0.8)}` }),
      diamond: () =>
        V.s("polygon", { points: `0,${f1(-r * 1.2)} ${f1(r * 1.2)},0 0,${f1(r * 1.2)} ${f1(-r * 1.2)},0` }),
    };
    if (!shapes[shape]) throw new Error(`VID.d13.mark: unknown shape "${shape}"`);
    const el = shapes[shape]();
    el.setAttribute("stroke-width", "3");
    el.setAttribute("stroke-linejoin", "round");
    const g = V.s("g", {}, el);
    svg.append(g);
    return {
      el: g,
      set(st = {}) {
        const c = T(st.tone || tone);
        el.style.fill = c.c;
        el.style.stroke = c.lip;
        g.setAttribute("transform", `translate(${f1(st.x || 0)} ${f1(st.y || 0)}) scale(${(st.s ?? 1).toFixed(3)})`);
        V.show(g, st.o ?? 1);
      },
    };
  }
  D13.mark = mark;

  // ---------- icons ----------
  const rect = (x, y, w, h, rx, fill, strokeC, sw = 3) =>
    V.s("rect", {
      x: f1(x),
      y: f1(y),
      width: f1(w),
      height: f1(h),
      rx: f1(rx),
      "stroke-width": sw,
      style: { fill, stroke: strokeC },
    });
  const line = (x1, y1, x2, y2, c, sw) =>
    V.s("line", {
      x1: f1(x1),
      y1: f1(y1),
      x2: f1(x2),
      y2: f1(y2),
      "stroke-width": f1(sw),
      "stroke-linecap": "round",
      style: { stroke: c },
    });
  D13.chip = (x, y, s, tone = "grey") => {
    const c = T(tone);
    const g = V.s("g", {});
    [-0.25, 0, 0.25].forEach((d) => {
      g.append(line(x + d * s, y - 0.5 * s, x + d * s, y + 0.5 * s, c.lip, 0.07 * s));
      g.append(line(x - 0.5 * s, y + d * s, x + 0.5 * s, y + d * s, c.lip, 0.07 * s));
    });
    g.append(rect(x - 0.36 * s, y - 0.36 * s, 0.72 * s, 0.72 * s, 0.1 * s, "var(--panel)", c.lip));
    g.append(rect(x - 0.18 * s, y - 0.18 * s, 0.36 * s, 0.36 * s, 0.05 * s, c.c, c.lip, 2));
    return g;
  };
  D13.envelope = (x, y, s, tone = "orange") => {
    const c = T(tone);
    const g = V.s("g", {});
    g.append(rect(x - 0.5 * s, y - 0.34 * s, s, 0.68 * s, 0.08 * s, c.c, c.lip));
    g.append(
      V.s("polyline", {
        points: `${f1(x - 0.44 * s)},${f1(y - 0.28 * s)} ${f1(x)},${f1(y + 0.06 * s)} ${f1(x + 0.44 * s)},${f1(y - 0.28 * s)}`,
        fill: "none",
        "stroke-width": f1(0.06 * s),
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
        style: { stroke: c.lip },
      }),
    );
    return g;
  };
  D13.door = (x, y, s, tone = "green") => {
    const c = T(tone);
    const g = V.s("g", {});
    g.append(rect(x - 0.32 * s, y - 0.5 * s, 0.64 * s, s, 0.08 * s, c.c, c.lip));
    g.append(rect(x - 0.2 * s, y - 0.38 * s, 0.4 * s, 0.32 * s, 0.04 * s, "none", c.lip, 0.04 * s));
    g.append(V.s("circle", { cx: f1(x + 0.18 * s), cy: f1(y + 0.08 * s), r: f1(0.06 * s), style: { fill: c.on } }));
    return g;
  };
  D13.clock = (x, y, s, tone = "grey") => {
    const c = T(tone);
    const g = V.s("g", {});
    g.append(
      V.s("circle", {
        cx: f1(x),
        cy: f1(y),
        r: f1(0.46 * s),
        "stroke-width": f1(0.08 * s),
        style: { fill: "var(--panel)", stroke: c.lip },
      }),
    );
    const hour = (7 / 12) * 2 * Math.PI; // 7 o'clock
    g.append(line(x, y, x + 0.24 * s * Math.sin(hour), y - 0.24 * s * Math.cos(hour), "var(--ink)", 0.08 * s));
    g.append(line(x, y, x, y - 0.34 * s, "var(--ink)", 0.06 * s));
    return g;
  };
  D13.priceTag = (x, y, s, tone = "red") => {
    const c = T(tone);
    const pts = [
      [-0.5, -0.3],
      [0.22, -0.3],
      [0.5, 0],
      [0.22, 0.3],
      [-0.5, 0.3],
    ];
    return V.s(
      "g",
      {},
      V.s("polygon", {
        points: pts.map(([a, b]) => `${f1(x + a * s)},${f1(y + b * s)}`).join(" "),
        "stroke-width": 3,
        "stroke-linejoin": "round",
        style: { fill: c.c, stroke: c.lip },
      }),
      V.s("circle", { cx: f1(x + 0.24 * s), cy: f1(y), r: f1(0.07 * s), style: { fill: "var(--panel)" } }),
    );
  };
  D13.noSend = (x, y, s) => {
    const g = D13.envelope(x, y, s, "grey");
    g.append(V.l5.cross(x, y, s * 1.1, "red", { w: 0.12 * s }));
    return g;
  };

  // ---------- timeline lanes (minutes) ----------
  const KIND = { work: "blue", seq: "purple", idle: "red" };
  function lanes(stage, o = {}) {
    const { x = 12, y = 12, w = 912, rows = [], T: Tmax = 10, rowH = 50, gap = 10, nameW = 150, max = 30 } = o;
    const ticks = o.ticks || [0, Tmax];
    const gaps = o.gaps || [];
    const unit = o.unit || "min";
    const x0 = x + nameW + 14;
    const x1 = x + w - 20;
    const X = (t) => x0 + (clamp(t, 0, Tmax) / Tmax) * (x1 - x0);
    const tops = [];
    let yy = y;
    rows.forEach((_, i) => {
      yy += gaps[i] || 0;
      tops.push(yy);
      yy += rowH + gap;
    });
    const rowTop = (i) => tops[i];
    const rowY = (i) => tops[i] + rowH / 2;
    const bottom = yy - gap;
    const axisY = bottom + 10;
    const root = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
    stage.append(root);
    const names = rows.map((n, i) => {
      const el = V.h("div", {
        class: "v-text",
        text: n,
        style: { ...abs(x, rowY(i) - 20, nameW, 40), fontSize: "28px", lineHeight: "40px", textAlign: "right" },
      });
      el.style.fontWeight = "900";
      el.style.color = "var(--text-dim)";
      root.append(el);
      return el;
    });
    const axis = V.h("div", {
      style: { ...abs(x0, axisY, x1 - x0, 4), background: "var(--line-2)", borderRadius: "2px" },
    });
    root.append(axis);
    const tickEls = ticks.map((t, i) => {
      const last = i === ticks.length - 1;
      const el = V.h("div", {
        class: "v-text",
        text: last ? `${t} ${unit}` : `${t}`,
        style: {
          ...abs(X(t) - (last ? 100 : 60), axisY + 6, last ? 200 : 120, 36),
          fontSize: "28px",
          lineHeight: "36px",
          textAlign: "center",
        },
      });
      el.style.color = "var(--text-dim)";
      root.append(el);
      return el;
    });
    const barEls = Array.from({ length: max }, () => {
      const el = V.h("div", {
        class: "c-blue",
        style: {
          position: "absolute",
          boxSizing: "border-box",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          fontWeight: "900",
          whiteSpace: "nowrap",
          overflow: "hidden",
          outlineOffset: "3px",
        },
      });
      root.append(el);
      return el;
    });
    const markEls = Array.from({ length: o.marksMax || 8 }, () => {
      const ln = V.h("div", { style: { position: "absolute", borderRadius: "3px" } });
      root.append(ln);
      const tag = D4.tag(root, { tone: "green", solid: true });
      return { ln, tag };
    });

    return {
      el: root,
      X,
      rowY,
      rowTop,
      bottom,
      axisY,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        V.place(root, { o: k, y: (1 - k) * 12 });
        const ax = clamp(st.axes ?? 1);
        V.show(axis, ax);
        tickEls.forEach((el) => V.show(el, ax));
        names.forEach((el, i) => V.show(el, clamp(Array.isArray(st.names) ? st.names[i] : (st.names ?? 1))));
        const now = st.now ?? Infinity;
        const bars = st.bars || [];
        if (bars.length > max) throw new Error(`VID.d13.lanes: ${bars.length} bars, made for ${max}`);
        barEls.forEach((el, i) => {
          const b = bars[i];
          const bk = b ? clamp(b.k ?? 1) : 0;
          const end = b ? Math.min(b.b, now) : 0;
          if (!b || bk <= 0 || end <= b.a) {
            el.style.display = "none";
            return;
          }
          el.style.display = "flex";
          const kind = b.kind || "work";
          const idle = kind === "idle";
          const cls = `c-${b.tone || KIND[kind]}`;
          if (el.className !== cls) el.className = cls;
          const left = X(b.a);
          const wpx = X(end) - left;
          const hpx = rowH - 8;
          Object.assign(el.style, abs(left + 2, rowY(b.row) - hpx / 2, wpx - 4, hpx));
          el.style.background = idle ? "transparent" : "var(--c)";
          el.style.border = idle ? "3px dashed var(--c)" : "3px solid var(--c-lip)";
          el.style.boxShadow = idle ? "none" : "0 4px 0 var(--c-lip)";
          el.style.color = idle ? "var(--c-ink)" : "var(--c-on)";
          const glow = clamp(b.glow || 0);
          el.style.outline = glow > 0.01 ? `${f1(5 * glow)}px solid var(--c)` : "none";
          const txt = b.text || "";
          const fits = txt && D4.tagW(txt, 28) - 30 <= wpx - 8;
          el.textContent = now >= b.b && fits ? txt : "";
          el.style.opacity = f1(Math.min(1, bk * 3) * (b.o ?? 1));
          el.style.transform = `scaleY(${f1(0.6 + 0.4 * E.out(bk))})`;
        });
        const marks = st.marks || [];
        markEls.forEach((m, i) => {
          const mk = marks[i];
          const mkK = mk ? clamp(mk.k ?? 1) : 0;
          if (!mk || mkK <= 0) {
            m.ln.style.display = "none";
            m.tag.set({ k: 0, text: "" });
            return;
          }
          const tone = mk.tone || "green";
          const mx = X(mk.t);
          const top = rowTop(mk.r0 ?? 0) - 6;
          const bot = rowTop(mk.r1 ?? rows.length - 1) + rowH + 6;
          m.ln.style.display = "block";
          Object.assign(m.ln.style, abs(mx - 3, top, 6, (bot - top) * E.out(mkK)));
          m.ln.style.background = T(tone).c;
          if (mk.text)
            m.tag.set({
              text: mk.text,
              tone,
              solid: true,
              x: mx + (mk.dx || 0),
              y: mk.top === false ? bot + 26 : top - 24,
              k: mkK,
            });
          else m.tag.set({ k: 0, text: "" });
        });
      },
    };
  }
  D13.lanes = lanes;
})();

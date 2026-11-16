/* Lecture 10 · Concept drift detection: the drawing pieces of this video (VID.d10, short name D10). Needs videos/l5/common.js,
   d4/common.js, d4/common-2.js, d4/common-3.js, d9/common.js, d9/common-2.js and d10/common.js loaded first (see
   videos/ds-10.html). EVERY CALL IS PURE: call set() each frame from your scene's update(t) with everything you want to see;
   anything you leave out is hidden or falls back to its default, and nothing is remembered between frames.

   TONES (colour roles of THIS video, the same in every scene; D4.tone(name) -> {c, ink, dim, edge, lip, on}):
     "red"    an ERROR (a wrong prediction: a tall red tick), the error rate, a confirmed change / drift detected (DDM's change
              line p_min + 3 s_min, EDDM's 0.90 line, ADWIN's cut and the records it drops)
     "orange" a WARNING: DDM's warning line p_min + 2 s_min and its warning zone, the records stored since the warning, 0.95
     "purple" the WORLD and its DRIFT: the moment a drift starts (a purple dashed vertical mark 'drift'), the true error rate
              (a purple dashed line), the new rule, the real click rates now
     "blue"   what the DETECTOR measures and a model that keeps learning: the rolling error line, ADWIN's window bracket and
              window-size line, DDM's p + s line, EDDM's gap arcs and ratio, the model retrained every 4 weeks
     "green"  stable / fine: the 'stable' state, the best moment (p_min + s_min), a window whose halves agree, a tick
     "grey"   neutral: right predictions (short grey ticks), axes, labels, and the FROZEN model trained once (a grey dashed
              outline or grey bars)
   Text stays at 28 px or more. Symbols are SVG (pictograms below, L5.tick / cross / arrow), never glyphs.

   CHARTS: use D9.plot (videos/d9/common-2.js header: p.update({k, axes, curves, dots, segs, marks, texts}), p.lx / p.ly,
   p.px / p.py / p.pt, p.svg, p.area). Error-rate charts use y in PER CENT (0..60 or 0..80). Pieces below go into p.svg
   (give them p.lx(...) coordinates) or into a D4.svg(stage) layer (stage px).

   1. ERROR STRIP  (one tick per record: a tall tick for an error, a short one for a right answer)
        const s = D10.strip(svgParent, {x0, x1, r0: 0, r1, y, h: 40, cells: false, groups: 4});
          records r0..r1 map to x0..x1 (px of svgParent); y = the TOP of the strip, h its height.
          cells: true draws every record as a full-height cell (errors red, right ones grey): the ADWIN split scene.
        s.set({xs, from: 0, to: xs.length, err: "red", ok: "grey", o: 1, dy: 0,
               groups: [{a, b, err, ok, o, dy}]})   records [from, to) are drawn; records inside a group's [a, b) use that
               group's tones / opacity / vertical offset dy (a cut drops the oldest records: group them, o -> 0, dy -> 30)
        s.x(i) left edge of record i (px), s.mid(i) its centre, s.bw the width of one record, s.el (the <g>)
   2. BRACKET  (ADWIN's window, the records since a warning, a part W0 / W1 of a window)
        const b = D10.span(svgParent);  b.set({x1, x2, y, tone: "blue", h: 16, w: 6, up: false, o: 1, k: 1})
          a square bracket over x1..x2 at height y: legs point DOWN to the strip under it (up: true -> legs point up)
   3. BARS  (click rates, weekly error bars)  const bars = D10.bars(p, n)  (p = a D9.plot; n = pool size)
        bars.set([{x (centre, data units), w (width, data units), y0: 0, y1, tone: "purple", hollow: false, dash: false,
                   k: 1 (grows from y0), o: 1}])
   4. PICTOGRAMS  (SVG groups at absolute coordinates of the layer you append them to: x, y = CENTRE, size ~ the width;
      V.place(g, {x, y, s, r, o}) moves, scales and fades them from where they are drawn)
        D10.basket(x, y, size, tone = "purple")  a shopping basket (Basketly, the grocery app)
        D10.virus(x, y, size, tone = "red")      a virus (abrupt drift: a pandemic)
        D10.coins(x, y, size, tone = "orange")   a stack of coins (gradual drift: economic change)
        D10.sun(x, y, size, tone = "orange")     a sun;  D10.snow(x, y, size, tone = "blue") a snowflake (recurring: seasons)
        D10.lens(x, y, size, tone = "blue")      a magnifying glass (a drift detector watching the errors)
   5. TIMING  D10.seq(t, t0, step, dur, i) = D4.seq (ramp 0..1 of item i of a staggered list; ease it yourself) */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D10 = V.d10;
  const { clamp } = V;
  const T = D4.tone;
  const f1 = (n) => (Math.round(n * 10) / 10).toString();
  D10.seq = D4.seq;

  // ---------- 1. error strip ----------
  D10.strip = (parent, o = {}) => {
    const { x0 = 0, x1 = 600, r0 = 0, r1 = 600, y = 0, h = 40, cells = false } = o;
    const bw = (x1 - x0) / (r1 - r0);
    const g = parent.appendChild(V.s("g", {}));
    const pair = () => [
      g.appendChild(V.s("path", { "stroke-width": 0 })),
      g.appendChild(V.s("path", { "stroke-width": 0 })),
    ];
    const paths = Array.from({ length: 1 + (o.groups ?? 4) }, pair);
    const x = (i) => x0 + (i - r0) * bw;
    const tick = (i, err, dy) => {
      const top = err || cells ? y + dy : y + dy + h * 0.72;
      const ht = err || cells ? h : h * 0.28;
      const gapW = cells ? Math.min(2, bw * 0.25) : Math.min(0.6, bw * 0.2);
      return `M${f1(x(i))} ${f1(top)}h${f1(Math.max(0.8, bw - gapW))}v${f1(ht)}h${f1(-Math.max(0.8, bw - gapW))}Z`;
    };
    return {
      el: g,
      bw,
      x,
      mid: (i) => x(i) + bw / 2,
      set(st = {}) {
        const xs = st.xs || [];
        const from = Math.max(0, Math.floor(st.from ?? 0));
        const to = Math.min(xs.length, Math.floor(st.to ?? xs.length));
        const groups = st.groups || [];
        if (groups.length > paths.length - 1) throw new Error(`VID.d10.strip: ${groups.length} groups, pool holds 4`);
        const d = paths.map(() => ["", ""]);
        for (let i = from; i < to; i++) {
          let gi = groups.findIndex((q) => i >= q.a && i < q.b);
          const dy = gi >= 0 ? groups[gi].dy || 0 : st.dy || 0;
          gi += 1;
          d[gi][xs[i] ? 0 : 1] += tick(i, xs[i], dy);
        }
        paths.forEach(([pe, po], j) => {
          const q = j === 0 ? st : { ...st, ...groups[j - 1] };
          const op = j === 0 ? (st.o ?? 1) : (q.o ?? 1) * (st.o ?? 1);
          pe.setAttribute("d", d[j][0] || "M0 0");
          po.setAttribute("d", d[j][1] || "M0 0");
          pe.setAttribute("fill", T(q.err || "red").c);
          po.setAttribute("fill", cells ? T(q.ok || "grey").dim : T(q.ok || "grey").c);
          if (cells) po.setAttribute("stroke", T(q.ok || "grey").edge);
          if (cells) po.setAttribute("stroke-width", bw > 5 ? 1.5 : 0);
          [pe, po].forEach((e) => {
            e.setAttribute("opacity", f1(clamp(op)));
            e.setAttribute("visibility", d[j][0] || d[j][1] ? "visible" : "hidden");
          });
        });
      },
    };
  };

  // ---------- 2. bracket ----------
  D10.span = (parent) => {
    const path = parent.appendChild(
      V.s("path", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }),
    );
    return {
      el: path,
      set({ x1 = 0, x2 = 0, y = 0, tone = "blue", h = 16, w = 6, up = false, o = 1, k = 1 } = {}) {
        if (o <= 0 || k <= 0 || x2 - x1 < 1) return path.setAttribute("visibility", "hidden");
        path.setAttribute("visibility", "visible");
        const leg = up ? -h : h;
        const mid = (x1 + x2) / 2,
          half = ((x2 - x1) / 2) * clamp(k);
        path.setAttribute("d", `M${f1(mid - half)} ${f1(y + leg)}V${f1(y)}H${f1(mid + half)}V${f1(y + leg)}`);
        path.setAttribute("stroke", T(tone).c);
        path.setAttribute("stroke-width", w);
        path.setAttribute("opacity", f1(clamp(o)));
      },
    };
  };

  // ---------- 3. bars ----------
  D10.bars = (p, n = 8) => {
    const pool = Array.from({ length: n }, () => p.svg.appendChild(V.s("rect", { rx: 8 })));
    return {
      set(list = []) {
        if (list.length > n) throw new Error(`VID.d10.bars: ${list.length} bars, pool holds ${n}`);
        pool.forEach((r, i) => {
          const b = list[i];
          if (!b || (b.o ?? 1) <= 0 || (b.k ?? 1) <= 0) return r.setAttribute("visibility", "hidden");
          const tone = T(b.tone || "purple");
          const y0 = b.y0 ?? 0;
          const yTop = y0 + (b.y1 - y0) * clamp(b.k ?? 1);
          const xa = p.lx(b.x - b.w / 2),
            xb = p.lx(b.x + b.w / 2);
          const ya = p.ly(Math.max(y0, yTop)),
            yb = p.ly(Math.min(y0, yTop));
          r.setAttribute("visibility", "visible");
          r.setAttribute("x", f1(xa));
          r.setAttribute("y", f1(ya));
          r.setAttribute("width", f1(Math.max(0, xb - xa)));
          r.setAttribute("height", f1(Math.max(0, yb - ya)));
          r.setAttribute("rx", f1(Math.min(8, (xb - xa) / 3)));
          r.setAttribute("fill", b.hollow ? "none" : tone.c);
          r.setAttribute("stroke", b.hollow ? tone.c : tone.lip);
          r.setAttribute("stroke-width", b.hollow ? 5 : 3);
          r.setAttribute("stroke-dasharray", b.dash ? "12 9" : "none");
          r.setAttribute("opacity", f1(clamp(b.o ?? 1)));
        });
      },
    };
  };

  // ---------- 4. pictograms ----------
  const P = (d, fill, stroke, sw) =>
    V.s("path", { d, fill, stroke, "stroke-width": f1(sw), "stroke-linecap": "round", "stroke-linejoin": "round" });
  const C = (cx, cy, r, fill, stroke, sw) =>
    V.s("circle", { cx: f1(cx), cy: f1(cy), r: f1(r), fill, stroke, "stroke-width": f1(sw) });

  D10.basket = (x, y, s, tone = "purple") => {
    const t = T(tone),
      g = V.s("g", {}),
      sw = Math.max(3, 0.06 * s);
    g.append(P(`M${x - 0.3 * s} ${y - 0.1 * s}Q${x} ${y - 0.62 * s} ${x + 0.3 * s} ${y - 0.1 * s}`, "none", t.lip, sw));
    g.append(
      P(
        `M${x - 0.5 * s} ${y - 0.12 * s}H${x + 0.5 * s}L${x + 0.38 * s} ${y + 0.36 * s}H${x - 0.38 * s}Z`,
        t.c,
        t.lip,
        sw,
      ),
    );
    [-0.2, 0, 0.2].forEach((f) =>
      g.append(P(`M${x + f * s} ${y}V${y + 0.26 * s}`, "none", t.on || "var(--panel)", sw * 0.8)),
    );
    return g;
  };
  D10.virus = (x, y, s, tone = "red") => {
    const t = T(tone),
      g = V.s("g", {}),
      sw = Math.max(3, 0.06 * s);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4,
        c = Math.cos(a),
        si = Math.sin(a);
      g.append(
        P(`M${x + 0.25 * s * c} ${y + 0.25 * s * si}L${x + 0.42 * s * c} ${y + 0.42 * s * si}`, "none", t.lip, sw),
      );
      g.append(C(x + 0.44 * s * c, y + 0.44 * s * si, 0.065 * s, t.c, t.lip, sw * 0.6));
    }
    g.append(C(x, y, 0.3 * s, t.c, t.lip, sw));
    g.append(C(x - 0.08 * s, y - 0.06 * s, 0.06 * s, t.lip, "none", 0));
    g.append(C(x + 0.1 * s, y + 0.08 * s, 0.045 * s, t.lip, "none", 0));
    return g;
  };
  D10.coins = (x, y, s, tone = "orange") => {
    const t = T(tone),
      g = V.s("g", {}),
      sw = Math.max(3, 0.05 * s);
    [0.3, 0.12, -0.06, -0.24].forEach((dy) => {
      g.append(V.s("ellipse", { cx: f1(x), cy: f1(y + dy * s), rx: f1(0.4 * s), ry: f1(0.13 * s), fill: t.c }));
      g.append(
        V.s("ellipse", {
          cx: f1(x),
          cy: f1(y + dy * s),
          rx: f1(0.4 * s),
          ry: f1(0.13 * s),
          fill: "none",
          stroke: t.lip,
          "stroke-width": f1(sw),
        }),
      );
    });
    return g;
  };
  D10.sun = (x, y, s, tone = "orange") => {
    const t = T(tone),
      g = V.s("g", {}),
      sw = Math.max(3, 0.07 * s);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      g.append(
        P(
          `M${x + 0.32 * s * Math.cos(a)} ${y + 0.32 * s * Math.sin(a)}L${x + 0.48 * s * Math.cos(a)} ${y + 0.48 * s * Math.sin(a)}`,
          "none",
          t.c,
          sw,
        ),
      );
    }
    g.append(C(x, y, 0.24 * s, t.c, t.lip, sw * 0.7));
    return g;
  };
  D10.snow = (x, y, s, tone = "blue") => {
    const t = T(tone),
      g = V.s("g", {}),
      sw = Math.max(3, 0.07 * s);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3,
        c = Math.cos(a),
        si = Math.sin(a);
      const ex = x + 0.46 * s * c,
        ey = y + 0.46 * s * si;
      g.append(P(`M${x} ${y}L${ex} ${ey}`, "none", t.c, sw));
      const bx = x + 0.3 * s * c,
        by = y + 0.3 * s * si;
      [-1, 1].forEach((sg) => {
        const b = a + (sg * Math.PI) / 4;
        g.append(P(`M${bx} ${by}L${bx + 0.13 * s * Math.cos(b)} ${by + 0.13 * s * Math.sin(b)}`, "none", t.c, sw));
      });
    }
    g.append(C(x, y, 0.08 * s, t.c, t.lip, sw * 0.5));
    return g;
  };
  D10.lens = (x, y, s, tone = "blue") => {
    const t = T(tone),
      g = V.s("g", {}),
      sw = Math.max(3, 0.08 * s);
    g.append(P(`M${x + 0.12 * s} ${y + 0.12 * s}L${x + 0.42 * s} ${y + 0.42 * s}`, "none", t.lip, sw * 1.9));
    g.append(C(x - 0.1 * s, y - 0.1 * s, 0.3 * s, t.dim, t.c, sw));
    return g;
  };
})();

/* Lecture 9 · Batch and online machine learning: the drawing pieces of this video (VID.d9, short name D9). Needs
   videos/l5/common.js, d4/common.js, d4/common-2.js, d4/common-3.js and d9/common.js loaded first (see videos/ds-9.html).
   Positions are the parent's pixels (the stage is 936 x 640, origin top-left). EVERY CALL IS PURE: call update()/set() each
   frame from your scene's update(t) with everything you want to see; anything you leave out is hidden or falls back to its
   default, and nothing is remembered between frames.

   TONES (colour roles of THIS video, the same in every scene; D4.tone(name) -> {c, ink, dim, edge, lip, on}):
     "blue"   the MODEL: its weight w, the ball on the cost bowl, the model's line or weight trace, the model card
     "green"  the TRUTH / the best: the bottom of the bowl (w = 4), the true gradient, the real minutes per km (a dashed line)
     "purple" the DATA: trips and records (chips, dots, parcels), batches, weeks of data and GB
     "orange" the STEP: the slope (the dashed tangent), the downhill step arrow, the learning rate and "learning rate × slope"
     "red"    wrong / bad: an error or cost gap, a diverging run, the bad record, data that does not fit in memory
     "grey"   neutral: axes, ticks, a frozen or old model, plain labels
   Small text stays at 28 px or more. Symbols are SVG (D9.parcel, D9.face, D9.memchip, L5.tick / cross), never glyphs.

   1. PLOT  (the chart every scene uses: the cost bowl, km against minutes, the weight against records)
        const p = D9.plot(parent, {x, y, w, h, xr: [x0, x1], yr: [y0, y1], pad: {l: 64, r: 16, t: 14, b: 50},
                                   xticks: [values], yticks: [values], tickFmt: D9.fm, xlab: "", ylab: "", fs: 28,
                                   frame: true, curves: 4, dots: 30, segs: 8, marks: 4, texts: 4});
          x, y, w, h = the panel box in parent px (a sticker panel when frame is true); xr / yr = the data window; pad = room
          for the tick labels inside the panel; xlab sits under the axis at the right end, ylab above the axis at the top-left
          (both 28 px grey). The last five options size the element pools (how many of each one frame may show).
        p.px(vx), p.py(vy) -> parent px;  p.pt(vx, vy) -> {x, y} parent px (place D4 tags / labels next to a data point);
        p.area = {x0, x1, y0, y1} the plot area in parent px;  p.el (the root: V.place / V.show it);  p.svg (its <svg>,
        own px = parent px minus (x, y): use p.lx(vx) / p.ly(vy) for your own SVG children)
        p.update({
          k: 1,       0..1 pops the whole panel in (scale 0.94 -> 1 and fade)
          axes: 1,    0..1 the axes, ticks and axis labels fade in
          curves: [{fn: (vx) => vy, from, to, n: 120  |  pts: [[vx, vy], ...], tone: "blue", w: 6, dash: false, k: 1, o: 1}]
                      k 0..1 draws it on from its first point;  clipped to the plot area
          dots:   [{at: [vx, vy], tone: "purple", r: 10, o: 1, s: 1, hollow: false, ring: false}]
                      a sticker dot (fill + darker edge); hollow = an outline only; ring = an extra ring around it (focus)
                      The BALL on the bowl is a dot: {at: [w, cost], tone: "blue", r: 18}. Dots outside the area are hidden.
          segs:   [{a: [vx, vy], b: [vx, vy], tone: "orange", w: 6, dash: false, head: false, k: 1, o: 1, clip: true}]
                      a straight line in data units (the tangent, an error bar, a step arrow when head is true; k draws it
                      on from a towards b; clip false lets it poke out of the area)
          marks:  [{x: vx} | {y: vy}, tone: "grey", dash: true, w: 4, o: 1, k: 1]   a full-height / full-width guide line
          texts:  [{at: [vx, vy], text, tone: "grey", fs: 28, anchor: "middle" | "start" | "end", dy: 0, o: 1}]  SVG text
        })

   2. PICTOGRAMS  (SVG groups at absolute coordinates of the layer you append them to: x, y = CENTRE, size = about the width;
      put them in a D4.svg(stage) layer and V.place(g, {x, y, s, r, o}) moves, scales and fades them from where they are drawn)
        D9.parcel(x, y, size, tone = "purple")   a delivery parcel (a box with tape): one trip / record
        D9.face(x, y, size, {tone = "purple", mask = false})   a face; mask = a face mask over the lower half
        D9.memchip(x, y, size, tone = "grey")   a memory chip (the machine's RAM)
        D9.brace(x1, x2, y, tone = "purple", {h: 16, w: 5, up: false})   a square bracket under (or, up, over) x1..x2: a batch
   3. TIMING
        D9.seq(t, t0, step, dur, i) = D4.seq: ramp 0..1 of item i of a staggered list (ease it yourself) */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D9 = V.d9;
  const { clamp, ease: E } = V;
  const T = D4.tone;
  const f1 = (n) => (Math.round(n * 10) / 10).toString();
  const hide = (e) => e.setAttribute("visibility", "hidden");
  const showA = (e) => e.removeAttribute("visibility");
  D9.seq = D4.seq;
  let clipId = 0;

  // ---------- 1. plot ----------
  D9.plot = (parent, o = {}) => {
    const { x = 0, y = 0, w = 600, h = 400, xr = [0, 10], yr = [0, 10], fs = 28, frame = true } = o;
    const pad = { l: 64, r: 16, t: 14, b: 50, ...(o.pad || {}) };
    const fmt = o.tickFmt || D9.fm;
    const A = { x0: pad.l, x1: w - pad.r, y0: pad.t, y1: h - pad.b };
    const lx = (v) => A.x0 + ((v - xr[0]) / (xr[1] - xr[0])) * (A.x1 - A.x0);
    const ly = (v) => A.y1 - ((v - yr[0]) / (yr[1] - yr[0])) * (A.y1 - A.y0);
    const root = V.h("div", {
      style: { position: "absolute", left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` },
    });
    const svg = V.s("svg", {
      width: w,
      height: h,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    root.append(svg);
    parent.append(root);
    const id = `d9clip${++clipId}`;
    const defs = V.s(
      "defs",
      {},
      V.s("clipPath", { id }, V.s("rect", { x: A.x0, y: A.y0 - 2, width: A.x1 - A.x0, height: A.y1 - A.y0 + 2 })),
    );
    svg.append(defs);
    if (frame)
      svg.append(
        V.s("rect", { x: 0, y: 6, width: w, height: h - 6, rx: 23, fill: "var(--line-2)" }),
        V.s("rect", {
          x: 1.5,
          y: 1.5,
          width: w - 3,
          height: h - 9,
          rx: 22,
          fill: "var(--panel)",
          stroke: "var(--line-2)",
          "stroke-width": 3,
        }),
      );
    const axes = V.s("g", {});
    const axis = (x1, y1, x2, y2) =>
      V.s("line", { x1, y1, x2, y2, stroke: "var(--line-2)", "stroke-width": 4, "stroke-linecap": "round" });
    axes.append(axis(A.x0, A.y1, A.x1, A.y1), axis(A.x0, A.y0, A.x0, A.y1));
    const txt = (tx, ty, s, anchor, size = fs) =>
      V.s("text", {
        x: tx,
        y: ty,
        "text-anchor": anchor,
        text: s,
        style: { font: `800 ${size}px var(--sans)`, fill: "var(--text-dim)" },
      });
    (o.xticks || []).forEach((v) => {
      axes.append(
        V.s("line", { x1: lx(v), y1: A.y1, x2: lx(v), y2: A.y1 + 8, stroke: "var(--line-2)", "stroke-width": 3 }),
      );
      axes.append(txt(lx(v), A.y1 + 8 + fs * 0.95, fmt(v), "middle"));
    });
    (o.yticks || []).forEach((v) => {
      axes.append(
        V.s("line", { x1: A.x0 - 8, y1: ly(v), x2: A.x0, y2: ly(v), stroke: "var(--line-2)", "stroke-width": 3 }),
      );
      axes.append(txt(A.x0 - 14, ly(v) + fs * 0.35, fmt(v), "end"));
    });
    if (o.xlab) axes.append(txt(A.x1, A.y1 - 12, o.xlab, "end"));
    if (o.ylab) axes.append(txt(A.x0 + 14, A.y0 + fs * 0.85, o.ylab, "start"));
    svg.append(axes);

    const clipped = V.s("g", { "clip-path": `url(#${id})` });
    const free = V.s("g", {});
    svg.append(clipped, free);
    const pool = (n, make, host) => Array.from({ length: n }, () => host.appendChild(make()));
    const marks = pool(o.marks ?? 4, () => V.s("line", { "stroke-linecap": "round" }), clipped);
    const curves = pool(
      o.curves ?? 4,
      () => V.s("path", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }),
      clipped,
    );
    const segs = pool(
      o.segs ?? 8,
      () => {
        const g = V.s("g", {});
        g.append(V.s("line", { "stroke-linecap": "round" }), V.s("path", {}));
        return g;
      },
      free,
    );
    const dots = pool(
      o.dots ?? 30,
      () => {
        const g = V.s("g", {});
        g.append(V.s("circle", { fill: "none" }), V.s("circle", {}));
        return g;
      },
      free,
    );
    const texts = pool(o.texts ?? 4, () => V.s("text", {}), free);
    const inA = (px, py) => px >= A.x0 - 0.5 && px <= A.x1 + 0.5 && py >= A.y0 - 0.5 && py <= A.y1 + 0.5;

    const p = {
      el: root,
      svg,
      lx,
      ly,
      px: (v) => x + lx(v),
      py: (v) => y + ly(v),
      pt: (vx, vy) => ({ x: x + lx(vx), y: y + ly(vy) }),
      area: { x0: x + A.x0, x1: x + A.x1, y0: y + A.y0, y1: y + A.y1 },
      update(st = {}) {
        const k = clamp(st.k ?? 1);
        V.place(root, { s: 0.94 + 0.06 * E.out(k), o: k });
        axes.style.opacity = String(clamp(st.axes ?? 1));
        const list = (name, arr, n) => {
          if ((arr || []).length > n) throw new Error(`VID.d9.plot: ${arr.length} ${name} but the pool holds ${n}`);
          return arr || [];
        };
        const cl = list("curves", st.curves, curves.length);
        curves.forEach((el, i) => {
          const c = cl[i];
          if (!c || (c.k ?? 1) <= 0 || (c.o ?? 1) <= 0) return hide(el);
          let pts = c.pts;
          if (!pts) {
            const n = c.n || 120;
            const a = c.from ?? xr[0];
            const b = c.to ?? xr[1];
            pts = Array.from({ length: n + 1 }, (_, j) => [a + ((b - a) * j) / n, c.fn(a + ((b - a) * j) / n)]);
          }
          const kk = clamp(c.k ?? 1);
          const upto = kk * (pts.length - 1);
          const last = Math.floor(upto);
          const use = pts.slice(0, last + 1).map(([vx, vy]) => [lx(vx), ly(vy)]);
          if (last < pts.length - 1 && upto > last) {
            const [ax, ay] = pts[last];
            const [bx, by] = pts[last + 1];
            const f = upto - last;
            use.push([lx(ax + (bx - ax) * f), ly(ay + (by - ay) * f)]);
          }
          if (use.length < 2) return hide(el);
          showA(el);
          el.setAttribute("d", use.map(([px, py], j) => `${j ? "L" : "M"}${f1(px)} ${f1(py)}`).join(""));
          el.setAttribute("stroke", T(c.tone || "blue").c);
          el.setAttribute("stroke-width", c.w || 6);
          el.setAttribute("stroke-dasharray", c.dash ? (c.dash === true ? "12 10" : c.dash) : "none");
          el.setAttribute("opacity", c.o ?? 1);
        });
        const ml = list("marks", st.marks, marks.length);
        marks.forEach((el, i) => {
          const m = ml[i];
          if (!m || (m.o ?? 1) <= 0 || (m.k ?? 1) <= 0) return hide(el);
          showA(el);
          const kk = clamp(m.k ?? 1);
          const at =
            m.x != null
              ? { x1: lx(m.x), x2: lx(m.x), y1: A.y1, y2: A.y1 - (A.y1 - A.y0) * kk }
              : { x1: A.x0, x2: A.x0 + (A.x1 - A.x0) * kk, y1: ly(m.y), y2: ly(m.y) };
          Object.entries(at).forEach(([a, v]) => el.setAttribute(a, f1(v)));
          el.setAttribute("stroke", T(m.tone || "grey").c);
          el.setAttribute("stroke-width", m.w || 4);
          el.setAttribute("stroke-dasharray", m.dash === false ? "none" : "10 9");
          el.setAttribute("opacity", m.o ?? 1);
        });
        const sl = list("segs", st.segs, segs.length);
        segs.forEach((g, i) => {
          const s = sl[i];
          if (!s || (s.k ?? 1) <= 0 || (s.o ?? 1) <= 0) return hide(g);
          const ax = lx(s.a[0]);
          const ay = ly(s.a[1]);
          const kk = clamp(s.k ?? 1);
          const bx = ax + (lx(s.b[0]) - ax) * kk;
          const by = ay + (ly(s.b[1]) - ay) * kk;
          const len = Math.hypot(bx - ax, by - ay);
          if (len < 3) return hide(g);
          showA(g);
          if (s.clip === false) g.removeAttribute("clip-path");
          else g.setAttribute("clip-path", `url(#${id})`);
          const tone = T(s.tone || "orange");
          const sw = s.w || 6;
          const hd = s.head ? Math.min(sw * 3.4, len * 0.6) : 0;
          const ux = (bx - ax) / len;
          const uy = (by - ay) / len;
          const [ln, head] = g.children;
          ln.setAttribute("x1", f1(ax));
          ln.setAttribute("y1", f1(ay));
          ln.setAttribute("x2", f1(bx - ux * hd * 0.8));
          ln.setAttribute("y2", f1(by - uy * hd * 0.8));
          ln.setAttribute("stroke", tone.c);
          ln.setAttribute("stroke-width", sw);
          ln.setAttribute("stroke-dasharray", s.dash ? (s.dash === true ? "12 10" : s.dash) : "none");
          if (hd) {
            const bxh = bx - ux * hd;
            const byh = by - uy * hd;
            head.setAttribute(
              "d",
              `M${f1(bx)} ${f1(by)}L${f1(bxh - uy * hd * 0.6)} ${f1(byh + ux * hd * 0.6)}L${f1(bxh + uy * hd * 0.6)} ${f1(byh - ux * hd * 0.6)}Z`,
            );
            head.setAttribute("fill", tone.c);
            showA(head);
          } else hide(head);
          g.setAttribute("opacity", s.o ?? 1);
        });
        const dl = list("dots", st.dots, dots.length);
        dots.forEach((g, i) => {
          const d = dl[i];
          if (!d || (d.o ?? 1) <= 0 || (d.s ?? 1) <= 0) return hide(g);
          const cx = lx(d.at[0]);
          const cy = ly(d.at[1]);
          if (!inA(cx, cy)) return hide(g);
          showA(g);
          const tone = T(d.tone || "purple");
          const r = (d.r || 10) * (d.s ?? 1);
          const [ring, c] = g.children;
          c.setAttribute("cx", f1(cx));
          c.setAttribute("cy", f1(cy));
          c.setAttribute("r", f1(r));
          c.setAttribute("fill", d.hollow ? "var(--panel)" : tone.c);
          c.setAttribute("stroke", d.hollow ? tone.c : tone.lip);
          c.setAttribute("stroke-width", d.hollow ? 5 : Math.max(2.5, r * 0.2));
          if (d.ring) {
            showA(ring);
            ring.setAttribute("cx", f1(cx));
            ring.setAttribute("cy", f1(cy));
            ring.setAttribute("r", f1(r + 9));
            ring.setAttribute("stroke", tone.c);
            ring.setAttribute("stroke-width", 4);
          } else hide(ring);
          g.setAttribute("opacity", d.o ?? 1);
        });
        const tl = list("texts", st.texts, texts.length);
        texts.forEach((el, i) => {
          const s = tl[i];
          if (!s || (s.o ?? 1) <= 0) return hide(el);
          showA(el);
          el.setAttribute("x", f1(lx(s.at[0])));
          el.setAttribute("y", f1(ly(s.at[1]) + (s.dy || 0)));
          el.setAttribute("text-anchor", s.anchor || "middle");
          el.setAttribute("opacity", s.o ?? 1);
          const tone = s.tone || "grey";
          el.style.font = `900 ${s.fs || 28}px var(--sans)`;
          el.style.fill = tone === "grey" ? "var(--text-dim)" : T(tone).ink;
          if (el.textContent !== String(s.text)) el.textContent = String(s.text);
        });
      },
    };
    p.update({ k: 0 });
    return p;
  };

  // ---------- 2. pictograms ----------
  const rect = (x, y, w, h, r, fill, stroke, sw = 3) =>
    V.s("rect", { x: f1(x), y: f1(y), width: f1(w), height: f1(h), rx: f1(r), fill, stroke, "stroke-width": sw });
  const line = (x1, y1, x2, y2, stroke, sw) =>
    V.s("line", {
      x1: f1(x1),
      y1: f1(y1),
      x2: f1(x2),
      y2: f1(y2),
      stroke,
      "stroke-width": f1(sw),
      "stroke-linecap": "round",
    });

  D9.parcel = (x, y, s, tone = "purple") => {
    const t = T(tone);
    const g = V.s("g", {});
    g.append(rect(x - 0.5 * s, y - 0.4 * s, s, 0.8 * s, 0.1 * s, t.c, t.lip, Math.max(2.5, 0.06 * s)));
    g.append(line(x, y - 0.4 * s, x, y + 0.4 * s, t.lip, 0.1 * s));
    g.append(line(x - 0.5 * s, y - 0.12 * s, x + 0.5 * s, y - 0.12 * s, t.lip, 0.06 * s));
    return g;
  };
  D9.face = (x, y, s, opt = {}) => {
    const t = T(opt.tone || "purple");
    const g = V.s("g", {});
    g.append(
      V.s("circle", {
        cx: f1(x),
        cy: f1(y),
        r: f1(0.5 * s),
        fill: t.dim,
        stroke: t.c,
        "stroke-width": f1(Math.max(3, 0.06 * s)),
      }),
    );
    [-1, 1].forEach((sd) =>
      g.append(V.s("circle", { cx: f1(x + sd * 0.17 * s), cy: f1(y - 0.1 * s), r: f1(0.06 * s), fill: t.ink })),
    );
    if (opt.mask) {
      g.append(
        rect(x - 0.36 * s, y + 0.02 * s, 0.72 * s, 0.32 * s, 0.1 * s, "var(--panel)", t.ink, Math.max(2.5, 0.05 * s)),
      );
      [-1, 1].forEach((sd) =>
        g.append(line(x + sd * 0.36 * s, y + 0.1 * s, x + sd * 0.5 * s, y - 0.04 * s, t.ink, 0.04 * s)),
      );
    } else {
      g.append(
        V.s("path", {
          d: `M${f1(x - 0.2 * s)} ${f1(y + 0.14 * s)}Q${f1(x)} ${f1(y + 0.32 * s)} ${f1(x + 0.2 * s)} ${f1(y + 0.14 * s)}`,
          fill: "none",
          stroke: t.ink,
          "stroke-width": f1(Math.max(3, 0.05 * s)),
          "stroke-linecap": "round",
        }),
      );
    }
    return g;
  };
  D9.memchip = (x, y, s, tone = "grey") => {
    const t = T(tone);
    const g = V.s("g", {});
    for (let i = 0; i < 5; i++) {
      const px = x - 0.36 * s + i * 0.18 * s;
      g.append(line(px, y - 0.42 * s, px, y + 0.42 * s, t.edge, 0.06 * s));
    }
    g.append(rect(x - 0.5 * s, y - 0.3 * s, s, 0.6 * s, 0.08 * s, t.dim, t.lip, Math.max(2.5, 0.05 * s)));
    g.append(rect(x - 0.22 * s, y - 0.14 * s, 0.44 * s, 0.28 * s, 0.04 * s, t.c, "none", 0));
    return g;
  };
  D9.brace = (x1, x2, y, tone = "purple", opt = {}) => {
    const { h = 16, w = 5, up = false } = opt;
    const d = up ? -h : h;
    return V.s("path", {
      d: `M${f1(x1)} ${f1(y)}L${f1(x1)} ${f1(y + d)}L${f1(x2)} ${f1(y + d)}L${f1(x2)} ${f1(y)}`,
      fill: "none",
      stroke: T(tone).c,
      "stroke-width": w,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
  };
})();

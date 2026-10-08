/* Algorithms Phase 3 · the plot panel (window.VID.a3, part 3 of 5; needs common.js, VID.l5). Stage px (936 x 640).
   Every handle's set() is PURE: call it every frame from update(t) with everything you want to see. An argument you leave out
   falls back to its default (o 1, k 1, ...). Nothing is remembered between frames. Tones: "green" "red" "blue" "purple" "orange" "grey".
   Data coordinates are the plot's own (x, y of the maths); pixel offsets (dx, dy) are stage pixels, dy > 0 is DOWN.

   ───────────────────────────── const P = A3.plot(parent, opts) ─────────────────────────────
     opts  x, y, w, h        the card in stage px (default 0, 0, 936, 640)
           view: [x0, x1, y0, y1]   the data window the inner area shows
           equal: true       same px per unit on both axes (the view grows to fill the area, centred): use it for the LP and contour plots
           pad: {l: 24, r: 24, t: 24, b: 24}    space between the card edge and the inner area (leave b >= 56 for P.span / tick labels)
           frame: true       sticker card (3 px edge, 6 px lip, var(--panel) fill) | false: no card (recap pictograms)
           grid: true        faint grid lines at the tick values          xticks / yticks: [values]  where grid lines and numbers go
           labels: true      28 px numbers on the ticks (false: lines only)        axes: "origin" | "bottom" | "none" (default "none")
                             origin = grey axes through (0, 0);  bottom = one baseline at the bottom edge of the inner area
           clip: true        curves, lines and fills are clipped to the inner area
     P.area {x, y, w, h}      the inner area in stage px            P.box {x, y, w, h} the card
     P.view(v?)  set the data window for this frame ([x0, x1, y0, y1]); call it FIRST in update(t) if you zoom (A3.mixView), then every handle
                 below uses it. Without a call the window stays the one you gave at creation. Returns P.cur = {x0, x1, y0, y1, sx, sy} (visible range, px per unit)
     P.px(vx) / P.py(vy) / P.pt(vx, vy) -> stage px (pt returns [x, y]) for the current window
     P.set({o, s, dy})  opacity / scale about the card centre / lift of the WHOLE panel (card, svg, html layer)
     P.under / P.mid / P.over  <g> layers (stage px coordinates) for your own SVG: grid+fills / curves+lines / dots+labels
     P.html  absolutely positioned <div> at the stage origin (over the svg): put A3.tag / A3.sticker pills in it so they fade with the panel

   ───────────────────────────── handles (create once in build(), call .set() every frame) ─────────────────────────────
     P.curve(fn, {tone: "grey", w: 6, n: 240, x0, x1, base}) -> c       c.set({k, o, tone, w, fillO, fn})
         the graph of fn (x -> y), default over the visible x range (x0, x1 fix the domain). k 0..1 draws it on left to right; fillO 0..1 fades in
         the area under it (down to data y = base, default the bottom of the area). Grey curves use the dark grey ink, others the tone colour.
     P.eq(a, b, r, {tone: "purple", w: 6, dash}) -> q      q.set({k, o, tone, rev, r})       the line a x + b y = r clipped to the window;
         k draws it on from its left end (or its lower end when vertical); rev: true starts at the other end. r overrides the right-hand
         side for this frame (slide the profit line: q.set({r: z})). The geometry follows the window.
     P.half(a, b, r, {tone: "red"}) -> h      h.set({o, tone, r})     tints the side a x + b y >= r of the window (the NOT allowed side), 18 % opacity
     P.poly({tone: "green", w: 5, fill: true}) -> g      g.set({pts: [[x, y], ...], o, fillO, strokeO, tone})    closed polygon in data coords
     P.path({tone: "blue", w: 4, dash}) -> g      g.set({pts: [[x, y], ...], o, k, tone})    OPEN polyline in data coords (the trail of the best corner); k 0..1 shows the first part
     P.dot({tone: "blue", r: 14}) -> d      d.set({x, y, o, s, tone, dx, dy, ring, ringK})       a sticker dot centred on data (x, y); s pops (use E.pop),
         ring: a tone name draws a ring round it (ringK 0..1 grows it). d.el is the <g>.
     P.text({fs: 28, tone: "grey", anchor: "middle", px: false}) -> t     t.set({text, x, y, dx, dy, o, tone, s})    SVG text with a paper halo
         (so it stays legible over lines). x, y data coords (stage px when px: true), 900 weight, ink shade of the tone. Labels are >= 28 px.
     P.vline({tone: "grey", w: 3, dash: "3 8"}) -> v      v.set({x, y0, y1, o, k, tone})      vertical segment at data x from y0 to y1 (k draws it from y1 to y0)
     P.band({tone: "red"}) -> b      b.set({x0, x1, o, tone})      a full-height vertical band between two data x (a bracket's thrown-away part), 22 % opacity
     P.span({tone: "purple", dy: 30}) -> s      s.set({x0, x1, o, tone})      a thick rounded bar with end ticks under the bottom axis, between data x0 and x1 (the bracket)
     P.contours(levels, {tone: "grey", w: 2}) -> c      c.set({o, tone})      level curves from A3.contours(...) (data coords, follows the window)
     P.ring, P.tangent, P.arrow and P.simplex are added to every plot by common-4.js (documented there) */
(function () {
  const V = window.VID;
  const A3 = (V.a3 = V.a3 || {});
  const L5 = V.l5;
  const { clamp } = V;
  const f1 = (n) => (+n).toFixed(1);
  const tn = (n) => L5.tone(n);
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const ink = (name) => (name === "grey" ? "var(--text-dim)" : tn(name).c);
  const pts2d = (pts) => pts.map(([x, y]) => `${f1(x)} ${f1(y)}`);
  /** set several attributes at once (numbers print with one decimal) */
  const at = (e, o) => {
    Object.entries(o).forEach(([k, v]) => e.setAttribute(k, typeof v === "number" ? f1(v) : v));
    return e;
  };
  let uid = 0;

  function plot(parent, opt = {}) {
    const {
      x = 0,
      y = 0,
      w = 936,
      h = 640,
      frame = true,
      grid = true,
      equal = false,
      axes = "none",
      labels = true,
      clip = true,
    } = opt;
    const pad = { l: 24, r: 24, t: 24, b: 24, ...opt.pad };
    const area = { x: x + pad.l, y: y + pad.t, w: w - pad.l - pad.r, h: h - pad.t - pad.b };
    const P = { area, box: { x, y, w, h }, cur: null };
    const root = V.h("div", { style: { ...abs(0, 0, 936, 640), pointerEvents: "none" } });
    if (frame) root.append(V.h("div", { class: "v-card plain", style: abs(x, y, w, h) }));
    const svg = V.s("svg", {
      width: 936,
      height: 640,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    const cid = `a3clip${uid++}`;
    svg.append(
      V.s(
        "defs",
        {},
        V.s(
          "clipPath",
          { id: cid },
          V.s("rect", { x: f1(area.x), y: f1(area.y), width: f1(area.w), height: f1(area.h) }),
        ),
      ),
    );
    const layer = (clipped) => svg.appendChild(V.s("g", clipped && clip ? { "clip-path": `url(#${cid})` } : {}));
    const [under, mid, over] = [layer(true), layer(true), layer(false)];
    const html = V.h("div", { style: { ...abs(0, 0, 936, 640), pointerEvents: "none" } });
    root.append(svg, html);
    parent.append(root);
    Object.assign(P, { under, mid, over, html, root });

    // ---------- the data window ----------
    P.view = (v) => {
      if (v) {
        let [x0, x1, y0, y1] = v;
        let [sx, sy] = [area.w / (x1 - x0), area.h / (y1 - y0)];
        if (equal) {
          const s = Math.min(sx, sy);
          const [cx, cy] = [(x0 + x1) / 2, (y0 + y1) / 2];
          [sx, sy] = [s, s];
          [x0, x1, y0, y1] = [
            cx - area.w / (2 * s),
            cx + area.w / (2 * s),
            cy - area.h / (2 * s),
            cy + area.h / (2 * s),
          ];
        }
        P.cur = { x0, x1, y0, y1, sx, sy };
        P.key = `${v.map((n) => n.toFixed(5)).join()}`;
      }
      drawGrid();
      return P.cur;
    };
    P.px = (vx) => area.x + (vx - P.cur.x0) * P.cur.sx;
    P.py = (vy) => area.y + area.h - (vy - P.cur.y0) * P.cur.sy;
    P.pt = (vx, vy) => [P.px(vx), P.py(vy)];
    P.set = ({ o = 1, s = 1, dy = 0 } = {}) => {
      root.style.transformOrigin = `${f1(x + w / 2)}px ${f1(y + h / 2)}px`;
      root.style.transform = `translateY(${f1(dy)}px) scale(${s})`;
      V.show(root, o);
    };

    // ---------- grid, axes, tick numbers ----------
    const xt = opt.xticks || [];
    const yt = opt.yticks || [];
    const gridG = under.appendChild(V.s("g"));
    const gl = (extra) =>
      gridG.appendChild(V.s("line", { "stroke-width": "2", style: { stroke: "var(--line)" }, ...extra }));
    const xLines = xt.map(() => gl());
    const yLines = yt.map(() => gl());
    const tickTxt = (anchor) =>
      V.s("text", {
        "text-anchor": anchor,
        style: { fontFamily: "var(--sans)", fontWeight: "800", fontSize: "28px", fill: "var(--text-dim)" },
      });
    const xNums = xt.map(() => over.appendChild(tickTxt("middle")));
    const yNums = yt.map(() => over.appendChild(tickTxt("end")));
    const axis = () =>
      gridG.appendChild(
        V.s("line", { "stroke-width": "4", "stroke-linecap": "round", style: { stroke: "var(--line-2)" } }),
      );
    const [axX, axY] = [axis(), axis()];
    function drawGrid() {
      const [L, R, T, B] = [area.x, area.x + area.w, area.y, area.y + area.h];
      xt.forEach((v, i) => {
        const px = P.px(v);
        const inside = px >= L - 1 && px <= R + 1;
        V.show(xLines[i], +(grid && inside));
        at(xLines[i], { x1: px, x2: px, y1: T, y2: B });
        if (xNums[i].textContent !== A3.fmt(v, 2)) xNums[i].textContent = A3.fmt(v, 2);
        at(xNums[i], { x: px, y: B + 34 });
        V.show(xNums[i], +(labels && inside));
      });
      yt.forEach((v, i) => {
        const py = P.py(v);
        const inside = py >= T - 1 && py <= B + 1;
        V.show(yLines[i], +(grid && inside));
        at(yLines[i], { x1: L, x2: R, y1: py, y2: py });
        if (yNums[i].textContent !== A3.fmt(v, 2)) yNums[i].textContent = A3.fmt(v, 2);
        at(yNums[i], { x: L - 10, y: py + 10 });
        V.show(yNums[i], +(labels && inside));
      });
      const [ox, oy] = [P.px(0), P.py(0)];
      const origin = axes === "origin";
      V.show(axX, +(axes === "bottom" || (origin && oy >= T && oy <= B)));
      at(axX, { x1: L, x2: R, y1: origin ? oy : B, y2: origin ? oy : B });
      V.show(axY, +(origin && ox >= L && ox <= R));
      at(axY, { x1: ox, x2: ox, y1: T, y2: B });
    }
    P.view(opt.view || [0, 1, 0, 1]);

    // ---------- helpers for handles ----------
    const mk = (tag, attrs, g = mid) => g.appendChild(V.s(tag, attrs));
    const stroked = (extra) => ({ fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", ...extra });

    // ---------- curve ----------
    P.curve = (fn0, { tone = "grey", w: sw = 6, n = 240, x0, x1, base } = {}) => {
      const fillE = mk("path", { "stroke-width": "0" }, under);
      const line = mk("path", stroked({ "stroke-width": f1(sw) }));
      const set = ({ k = 1, o = 1, tone: t = tone, w: ww = sw, fillO = 0, fn = fn0 } = {}) => {
        const [lo, hi] = [x0 == null ? P.cur.x0 : x0, x1 == null ? P.cur.x1 : x1];
        const [a, b] = [Math.max(lo, P.cur.x0 - 8 / P.cur.sx), Math.min(hi, P.cur.x1 + 8 / P.cur.sx)]; // only what is on screen, so a zoom stays smooth
        const m = Math.max(2, Math.round(n * clamp(k)));
        const P0 = Array.from({ length: m + 1 }, (_, i) => {
          const xv = a + ((b - a) * clamp(k) * i) / m;
          return [P.px(xv), P.py(fn(xv))];
        });
        const d = `M${pts2d(P0).join("L")}`;
        line.setAttribute("d", d);
        line.setAttribute("stroke-width", f1(ww));
        line.style.stroke = ink(t);
        V.show(line, k > 0.001 ? o : 0);
        const by = base == null ? area.y + area.h : P.py(base);
        fillE.setAttribute("d", `${d}L${f1(P0[m][0])} ${f1(by)}L${f1(P0[0][0])} ${f1(by)}Z`);
        fillE.style.fill = t === "grey" ? "var(--line)" : tn(t).dim;
        V.show(fillE, k > 0.001 ? o * fillO : 0);
      };
      return { set, el: line };
    };

    // ---------- lines, half-planes ----------
    /** the two ends of the line a x + b y = r inside the current window (left end first; lower end first when vertical) */
    const edgePts = (a, b, r) => {
      const c = P.cur;
      const hits = [];
      const inY = (yv) => yv >= c.y0 - 1e-9 && yv <= c.y1 + 1e-9;
      const inX = (xv) => xv >= c.x0 - 1e-9 && xv <= c.x1 + 1e-9;
      if (b)
        [c.x0, c.x1].forEach((xv) => {
          if (inY((r - a * xv) / b)) hits.push([xv, (r - a * xv) / b]);
        });
      if (a)
        [c.y0, c.y1].forEach((yv) => {
          if (inX((r - b * yv) / a)) hits.push([(r - b * yv) / a, yv]);
        });
      hits.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
      return hits.length >= 2 ? [hits[0], hits[hits.length - 1]] : null;
    };
    P.eq = (a, b, r, { tone = "purple", w: sw = 6, dash } = {}) => {
      const line = mk("line", { "stroke-width": f1(sw), "stroke-linecap": "round", "stroke-dasharray": dash || "" });
      return {
        el: line,
        set({ k = 1, o = 1, tone: t = tone, rev = false, r: rr = r } = {}) {
          const e = edgePts(a, b, rr);
          if (!e || k <= 0.001) return V.show(line, 0);
          const [p0, p1] = (rev ? [e[1], e[0]] : e).map(([vx, vy]) => P.pt(vx, vy));
          const q = [p0[0] + (p1[0] - p0[0]) * clamp(k), p0[1] + (p1[1] - p0[1]) * clamp(k)];
          at(line, { x1: p0[0], y1: p0[1], x2: q[0], y2: q[1] });
          line.style.stroke = tn(t).c;
          V.show(line, o);
        },
      };
    };
    P.half = (a, b, r, { tone = "red" } = {}) => {
      const e = mk("polygon", { style: { fill: tn(tone).c } }, under);
      return {
        el: e,
        set({ o = 1, tone: t = tone, r: rr = r } = {}) {
          const c = P.cur;
          const box = [
            [c.x0, c.y0],
            [c.x1, c.y0],
            [c.x1, c.y1],
            [c.x0, c.y1],
          ];
          const poly = A3.clip(box, -a, -b, -rr);
          e.setAttribute("points", pts2d(poly.map(([vx, vy]) => P.pt(vx, vy))).join(" "));
          e.style.fill = tn(t).c;
          V.show(e, poly.length > 2 ? o * 0.18 : 0);
        },
      };
    };

    // ---------- polygon ----------
    P.poly = ({ tone = "green", w: sw = 5, fill = true } = {}) => {
      const e = mk("polygon", stroked({ "stroke-width": f1(sw) }), under);
      return {
        el: e,
        set({ pts = [], o = 1, fillO = 1, strokeO = 1, tone: t = tone } = {}) {
          const px = pts.map(([vx, vy]) => P.pt(vx, vy));
          e.setAttribute("points", pts2d(px).join(" "));
          e.style.fill = fill ? tn(t).dim : "none";
          e.style.fillOpacity = String(fillO);
          e.style.stroke = tn(t).c;
          e.style.strokeOpacity = String(strokeO);
          V.show(e, pts.length > 2 ? o : 0);
        },
      };
    };

    // ---------- dot ----------
    P.dot = ({ tone = "blue", r = 14 } = {}) => {
      const g = mk("g", {}, over);
      const ringE = g.appendChild(V.s("circle", { r: f1(r + 12), fill: "none", "stroke-width": "5" }));
      const lip = g.appendChild(V.s("circle", { cx: 0, cy: 3, r: f1(r) }));
      const body = g.appendChild(V.s("circle", { cx: 0, cy: 0, r: f1(r), "stroke-width": "3" }));
      return {
        el: g,
        set({ x: vx = 0, y: vy = 0, o = 1, s = 1, tone: t = tone, dx = 0, dy = 0, ring = null, ringK = 1 } = {}) {
          const tt = tn(t);
          lip.style.fill = tt.lip;
          body.style.fill = tt.c;
          body.style.stroke = tt.lip;
          if (ring) ringE.style.stroke = tn(ring).c;
          V.show(ringE, ring ? clamp(ringK * 3) : 0);
          ringE.setAttribute("r", f1(r + 4 + 8 * (1 - clamp(ringK))));
          V.place(g, { x: P.px(vx) + dx, y: P.py(vy) + dy, s, o });
        },
      };
    };

    // ---------- text ----------
    P.text = ({ fs = 28, tone = "grey", anchor = "middle", px = false } = {}) => {
      const e = mk(
        "text",
        {
          "text-anchor": anchor,
          "stroke-linejoin": "round",
          style: {
            fontFamily: "var(--sans)",
            fontWeight: "900",
            fontSize: `${fs}px`,
            stroke: "var(--panel)",
            strokeWidth: "8px",
            paintOrder: "stroke",
          },
        },
        over,
      );
      return {
        el: e,
        set({ text = "", x: vx = 0, y: vy = 0, dx = 0, dy = 0, o = 1, tone: t = tone, s = 1 } = {}) {
          if (e.textContent !== text) e.textContent = text;
          e.style.fill = t === "grey" ? "var(--text-dim)" : tn(t).ink;
          const [X, Y] = px ? [vx, vy] : P.pt(vx, vy);
          e.setAttribute("x", f1(X + dx));
          e.setAttribute("y", f1(Y + dy));
          e.style.transformOrigin = `${f1(X + dx)}px ${f1(Y + dy)}px`;
          e.style.transform = `scale(${s})`;
          V.show(e, o);
        },
      };
    };

    // ---------- vertical marks ----------
    P.vline = ({ tone = "grey", w: sw = 3, dash = "3 8" } = {}) => {
      const e = mk("line", { "stroke-width": f1(sw), "stroke-linecap": "round", "stroke-dasharray": dash });
      return {
        el: e,
        set({ x: vx = 0, y0 = P.cur.y0, y1 = P.cur.y1, o = 1, k = 1, tone: t = tone } = {}) {
          const X = P.px(vx);
          at(e, { x1: X, x2: X, y1: P.py(y1), y2: P.py(y1 + (y0 - y1) * clamp(k)) });
          e.style.stroke = t === "grey" ? "var(--line-2)" : tn(t).c;
          V.show(e, k > 0.001 ? o : 0);
        },
      };
    };
    P.band = ({ tone = "red" } = {}) => {
      const e = mk("rect", {}, under);
      return {
        el: e,
        set({ x0 = 0, x1 = 0, o = 1, tone: t = tone } = {}) {
          const [a, b] = [Math.min(P.px(x0), P.px(x1)), Math.max(P.px(x0), P.px(x1))];
          at(e, { x: a, y: area.y, width: Math.max(0, b - a), height: area.h });
          e.style.fill = tn(t).c;
          V.show(e, o * 0.22);
        },
      };
    };
    P.span = ({ tone = "purple", dy: off = 30 } = {}) => {
      const g = mk("g", {}, over);
      const lip = g.appendChild(V.s("rect", { rx: 8, height: 14 }));
      const bar = g.appendChild(V.s("rect", { rx: 8, height: 14, "stroke-width": "3" }));
      const [t0, t1] = [0, 1].map(() => g.appendChild(V.s("line", { "stroke-width": "5", "stroke-linecap": "round" })));
      return {
        el: g,
        set({ x0 = 0, x1 = 1, o = 1, tone: t = tone } = {}) {
          const [a, b] = [P.px(x0), P.px(x1)];
          const [Y, W] = [area.y + area.h + off, Math.max(10, b - a)];
          const tt = tn(t);
          [bar, lip].forEach((e, i) => at(e, { x: a, y: Y + (i ? 4 : 0), width: W }));
          bar.style.fill = tt.c;
          bar.style.stroke = tt.lip;
          lip.style.fill = tt.lip;
          [
            [t0, a],
            [t1, b],
          ].forEach(([e, X]) => {
            at(e, { x1: X, x2: X, y1: Y - 12, y2: Y + 26 });
            e.style.stroke = tt.lip;
          });
          V.show(g, o);
        },
      };
    };

    // ---------- open polyline ----------
    P.path = ({ tone = "blue", w: sw = 4, dash } = {}) => {
      const e = mk("path", stroked({ "stroke-width": f1(sw), "stroke-dasharray": dash || "" }), mid);
      return {
        el: e,
        set({ pts = [], o = 1, k = 1, tone: t = tone } = {}) {
          const n = Math.max(0, Math.round((pts.length - 1) * clamp(k)));
          const px = pts.slice(0, n + 1).map(([vx, vy]) => P.pt(vx, vy));
          e.setAttribute("d", px.length > 1 ? `M${pts2d(px).join("L")}` : "");
          e.style.stroke = tn(t).c;
          V.show(e, px.length > 1 ? o : 0);
        },
      };
    };

    // ---------- contours ----------
    P.contours = (levels, { tone = "grey", w: sw = 2 } = {}) => {
      const e = mk("path", stroked({ "stroke-width": f1(sw) }), under);
      let cache = "";
      return {
        el: e,
        set({ o = 1, tone: t = tone } = {}) {
          if (cache !== P.key) {
            cache = P.key;
            e.setAttribute(
              "d",
              levels
                .map((lv) =>
                  lv.segs
                    .map(([ax, ay, bx, by]) => `M${f1(P.px(ax))} ${f1(P.py(ay))}L${f1(P.px(bx))} ${f1(P.py(by))}`)
                    .join(""),
                )
                .join(""),
            );
          }
          e.style.stroke = t === "grey" ? "var(--line-2)" : tn(t).c;
          V.show(e, o);
        },
      };
    };

    P.internals = { mk, mid, over, under, stroked };
    return P;
  }
  A3.plot = plot;
})();

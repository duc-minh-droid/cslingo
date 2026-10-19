/* Phase 9 · Fourier Transform & FFT: the plot panel (window.VID.a9, part 2 of 4; needs VID.l5 and a9/common.js). Stage px (936 x 640).
   EVERY handle's set() is PURE: call it every frame from update(t) with everything you want to see; an argument you leave out falls
   back to its default (o 1, k 1, ...) and nothing is remembered between frames. Create handles once in build().

   TONES (colour roles of THIS video): "blue" the signal in time (the wiggle, the samples, the even half), "orange" the frequency
   side (the bars, the answer, X), "purple" the probe or the rule (a spinning arrow, the window, the twiddle W, the odd half),
   "green" good / true / kept / clean, "red" bad / a lie / deleted, "grey" neutral. A9.TONES lists them; A9.tone("red") ->
   {c, ink, dim, edge, lip, on} (CSS var() strings: c = fill / icon, ink = text on a tint, dim = tint fill, edge = tint border,
   lip = sticker edge, on = text on a c fill). A9.ink("grey") -> the stroke colour of a thin line (grey = the dark grey ink).

   ───────────────────────────── const P = A9.plot(parent, opts) ─────────────────────────────
     opts  x, y, w, h        the panel in stage px (default 0, 0, 936, 640)
           view: [x0, x1, y0, y1]   the data window the inner area shows (x to the right, y UP)
           equal: true       same px per unit on both axes (the view grows to fill the area, centred): the arrow plane of scene 4
           pad: {l: 24, r: 24, t: 24, b: 24}    space between the panel edge and the inner area; keep b >= 52 when you show x tick numbers
           frame: true       sticker card (3 px edge, 6 px lip, var(--panel) fill) | false: no card (recap pictograms)
           axes: "mid" | "bottom" | "none"     mid = a grey line through data y = 0 (inside the window); bottom = one baseline on the bottom edge
           xticks / yticks: [value | {v, text}]   tick values (text = what is written, default the number); grid lines go there when grid is true
           grid: false       faint grid lines at the ticks         labels: true  28 px numbers on the ticks (false: none)
           clip: true        curves, bars and lines are clipped to the inner area
     P.area {x, y, w, h}  the inner area in stage px        P.box {x, y, w, h}  the panel        P.cur = {x0, x1, y0, y1, sx, sy}
     P.view(v?)  set the data window for this frame; call it FIRST in update(t) if you zoom. Returns P.cur.
     P.px(vx) / P.py(vy) / P.pt(vx, vy) -> stage px ([x, y] for pt) in the current window. P.len(dx) -> px of a data width.
     P.set({o, s, dy})   opacity / scale about the panel centre / lift of the WHOLE panel (card, svg, html layer)
     P.under / P.mid / P.over   <g> layers (stage px) for your own SVG: grid+fills / curves+bars / dots+labels (the last is not clipped)
     P.html   an absolutely positioned <div> at the stage origin, above the svg: put A9.tag pills in it so they fade with the panel

   ───────────────────────────── handles ─────────────────────────────
     P.curve(fn, {tone: "blue", w: 6, n: 300, dash, x0, x1, base, color}) -> c    c.set({fn, k, o, tone, w, fillO, base, dash, dy, color})
         the graph of fn (data x -> data y). k 0..1 draws it on left to right; fillO 0..1 fades in the area under it (down to data y = base,
         default 0); fn overrides the function for this frame (morph a wave: pass a new function every frame); dy shifts it down in px.
         x0, x1 fix the domain (default: the visible x range). A grey curve uses the dark grey ink; color: "var(--line-2)" (any CSS colour) overrides the
         stroke, for a light target line behind your own curve.
     P.dots({max: 16, r: 10, tone: "blue", stem: true}) -> d    d.set([{x, y, o, s, tone, ring, ringK, stem}, ...])
         up to max sample dots, centred on data (x, y), each with a thin stem down to data y = 0 (stem false = no stem). s pops (use E.pop),
         ring: a tone name draws a ring round it (ringK 0..1 grows it). Items you do not pass are hidden; pass the list EVERY frame.
         d.at(i) -> the dot's element (a <g>), for your own tweaks.
     P.bars({max: 8, bw: 28, tone: "orange"}) -> b    b.set([{x, v, o, k, tone, ghost, ring, ringK, w, base}, ...])
         vertical bars standing on data y = 0, centred on data x, v tall (data units), bw px wide (w overrides it per bar), rounded top, sticker
         edge when wide enough (a bar under 14 px wide is a plain spike). k 0..1 is the grow factor (height = k v); ghost: true = a dashed
         outline only (where a bar was or would be); ring/ringK: a tone ring round the top. Items you do not pass are hidden.
     P.vline({tone: "grey", w: 3, dash: "3 8"}) -> v     v.set({x, y0, y1, o, k, tone})      vertical segment at data x (k draws it from y1 down to y0)
     P.band({tone: "red"}) -> b     b.set({x0, x1, o, tone})     a full-height vertical band between two data x, 22 % opacity
     P.text({fs: 28, tone: "grey", anchor: "middle", px: false}) -> t    t.set({text, x, y, dx, dy, o, tone, s, r})
         SVG text with a paper halo. x, y data coords (stage px when px: true); y is the BASELINE (a 28 px label sits about 10 px above it);
         r degrees clockwise about (x, y). Labels are at least 28 px.
     P.path({tone: "blue", w: 4, dash, color}) -> g     g.set({pts: [[x, y], ...], o, k, tone, color})     open polyline in data coords; k 0..1 shows the first part
     P.vec({tone: "blue", w: 7, head: 22}) -> a    a.set({x1, y1, x2, y2, k, o, tone, w})     an arrow from data (x1, y1) to (x2, y2) with a head;
         k 0..1 grows it from the tail (the head appears once the shaft is longer than the head); a vector of length 0 is hidden.
     P.dot({tone: "blue", r: 14}) -> d    d.set({x, y, o, s, tone, dx, dy, ring, ringK})     one sticker dot on data (x, y) (a moving marker)
 */
(function () {
  const V = window.VID;
  const A9 = (V.a9 = V.a9 || {});
  const L5 = V.l5;
  const { clamp } = V;

  const f1 = (n) => (+n).toFixed(1);
  A9.TONES = ["green", "red", "orange", "blue", "purple", "grey"];
  const tn = (t) => {
    if (!A9.TONES.includes(t)) throw new Error(`VID.a9: unknown tone "${t}" (use ${A9.TONES.join(", ")})`);
    return t;
  };
  A9.tone = (name) => L5.tone(tn(name));
  A9.ink = (name) => (name === "grey" ? "var(--text-dim)" : A9.tone(name).c);
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
  const at = (e, o) => {
    Object.entries(o).forEach(([k, v]) => e.setAttribute(k, typeof v === "number" ? f1(v) : v));
    return e;
  };
  const pts2d = (pts) => pts.map(([x, y]) => `${f1(x)} ${f1(y)}`);
  let uid = 0;
  Object.assign(A9, { f1, tn, abs, flex, setText, setClass, at, pts2d });

  function plot(parent, opt = {}) {
    const {
      x = 0,
      y = 0,
      w = 936,
      h = 640,
      frame = true,
      grid = false,
      equal = false,
      axes = "none",
      labels = true,
    } = opt;
    const clip = opt.clip !== false;
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
    const cid = `a9clip${uid++}`;
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
        P.key = v.map((n) => n.toFixed(5)).join();
      }
      drawGrid();
      return P.cur;
    };
    P.px = (vx) => area.x + (vx - P.cur.x0) * P.cur.sx;
    P.py = (vy) => area.y + area.h - (vy - P.cur.y0) * P.cur.sy;
    P.pt = (vx, vy) => [P.px(vx), P.py(vy)];
    P.len = (dx) => dx * P.cur.sx;
    P.set = ({ o = 1, s = 1, dy = 0 } = {}) => {
      root.style.transformOrigin = `${f1(x + w / 2)}px ${f1(y + h / 2)}px`;
      root.style.transform = `translateY(${f1(dy)}px) scale(${s})`;
      V.show(root, o);
    };

    // ---------- grid, axes, tick numbers ----------
    const tick = (t) => (typeof t === "object" ? t : { v: t, text: String(t) });
    const xt = (opt.xticks || []).map(tick);
    const yt = (opt.yticks || []).map(tick);
    const gridG = under.appendChild(V.s("g"));
    const gl = () => gridG.appendChild(V.s("line", { "stroke-width": "2", style: { stroke: "var(--line)" } }));
    const xLines = xt.map(gl);
    const yLines = yt.map(gl);
    const tickTxt = (anchor, text) =>
      V.s("text", {
        "text-anchor": anchor,
        text,
        style: { fontFamily: "var(--sans)", fontWeight: "800", fontSize: "28px", fill: "var(--text-dim)" },
      });
    const xNums = xt.map((t) => over.appendChild(tickTxt("middle", t.text)));
    const yNums = yt.map((t) => over.appendChild(tickTxt("end", t.text)));
    const axis = () =>
      gridG.appendChild(
        V.s("line", { "stroke-width": "4", "stroke-linecap": "round", style: { stroke: "var(--line-2)" } }),
      );
    const axX = axis();
    function drawGrid() {
      const [L, R, T, B] = [area.x, area.x + area.w, area.y, area.y + area.h];
      xt.forEach((t, i) => {
        const px = P.px(t.v);
        const inside = px >= L - 1 && px <= R + 1;
        V.show(xLines[i], +(grid && inside));
        at(xLines[i], { x1: px, x2: px, y1: T, y2: B });
        at(xNums[i], { x: px, y: B + 34 });
        V.show(xNums[i], +(labels && inside));
      });
      yt.forEach((t, i) => {
        const py = P.py(t.v);
        const inside = py >= T - 1 && py <= B + 1;
        V.show(yLines[i], +(grid && inside));
        at(yLines[i], { x1: L, x2: R, y1: py, y2: py });
        at(yNums[i], { x: L - 10, y: py + 10 });
        V.show(yNums[i], +(labels && inside));
      });
      const oy = P.py(0);
      const mid0 = axes === "mid" && oy >= T && oy <= B;
      V.show(axX, +(axes === "bottom" || mid0));
      at(axX, { x1: L, x2: R, y1: axes === "mid" ? oy : B, y2: axes === "mid" ? oy : B });
    }
    P.view(opt.view || [0, 1, 0, 1]);

    // ---------- helpers for handles ----------
    const mk = (tag, attrs, g = mid) => g.appendChild(V.s(tag, attrs));
    const stroked = (extra) => ({ fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", ...extra });

    // ---------- curve ----------
    P.curve = (fn0, { tone = "blue", w: sw = 6, n = 300, dash, x0, x1, base: base0 = 0, color: color0 } = {}) => {
      const fillE = mk("path", { "stroke-width": "0" }, under);
      const line = mk("path", stroked({ "stroke-width": f1(sw) }));
      const set = ({
        k = 1,
        o = 1,
        tone: t = tone,
        w: ww = sw,
        fillO = 0,
        fn = fn0,
        base = base0,
        dash: dd = dash,
        dy = 0,
        color = color0,
      } = {}) => {
        const [lo, hi] = [x0 == null ? P.cur.x0 : x0, x1 == null ? P.cur.x1 : x1];
        const m = Math.max(2, Math.round(n * clamp(k)));
        const P0 = Array.from({ length: m + 1 }, (_, i) => {
          const xv = lo + ((hi - lo) * clamp(k) * i) / m;
          return [P.px(xv), P.py(fn(xv)) + dy];
        });
        const d = `M${pts2d(P0).join("L")}`;
        line.setAttribute("d", d);
        line.setAttribute("stroke-width", f1(ww));
        line.setAttribute("stroke-dasharray", dd || "");
        line.style.stroke = color || A9.ink(t);
        V.show(line, k > 0.001 ? o : 0);
        const by = P.py(base) + dy;
        fillE.setAttribute("d", `${d}L${f1(P0[m][0])} ${f1(by)}L${f1(P0[0][0])} ${f1(by)}Z`);
        fillE.style.fill = t === "grey" ? "var(--line)" : A9.tone(t).dim;
        V.show(fillE, k > 0.001 ? o * fillO : 0);
      };
      return { set, el: line };
    };

    // ---------- sample dots ----------
    P.dots = ({ max = 16, r = 10, tone = "blue", stem = true } = {}) => {
      const items = Array.from({ length: max }, () => {
        const sE = mk("line", { "stroke-width": "4", "stroke-linecap": "round" }, mid);
        const g = mk("g", {}, over);
        const ringE = g.appendChild(V.s("circle", { fill: "none", "stroke-width": "5" }));
        const lip = g.appendChild(V.s("circle", { cx: 0, cy: 3, r: f1(r) }));
        const body = g.appendChild(V.s("circle", { cx: 0, cy: 0, r: f1(r), "stroke-width": "3" }));
        return { sE, g, ringE, lip, body };
      });
      return {
        at: (i) => items[i].g,
        set(list = []) {
          items.forEach((it, i) => {
            const d = list[i];
            if (!d) {
              V.show(it.g, 0);
              V.show(it.sE, 0);
              return;
            }
            const { x: vx = 0, y: vy = 0, o = 1, s = 1, tone: t = tone, ring = null, ringK = 1, stem: st = stem } = d;
            const tt = A9.tone(t);
            const [X, Y, Y0] = [P.px(vx), P.py(vy), P.py(0)];
            it.lip.style.fill = tt.lip;
            it.body.style.fill = tt.c;
            it.body.style.stroke = tt.lip;
            if (ring) it.ringE.style.stroke = A9.tone(ring).c;
            V.show(it.ringE, ring ? clamp(ringK * 3) : 0);
            it.ringE.setAttribute("r", f1(r + 5 + 8 * (1 - clamp(ringK))));
            at(it.sE, { x1: X, x2: X, y1: Y0, y2: Y });
            it.sE.style.stroke = tt.c;
            V.show(it.sE, st ? o * clamp(s) * 0.55 : 0);
            V.place(it.g, { x: X, y: Y, s, o });
          });
        },
      };
    };

    // ---------- bars ----------
    P.bars = ({ max = 8, bw = 28, tone = "orange" } = {}) => {
      const items = Array.from({ length: max }, () => {
        const body = mk("path", { "stroke-linejoin": "round" }, mid);
        const ringE = mk("rect", { fill: "none", "stroke-width": "5", rx: 12 }, over);
        return { body, ringE };
      });
      return {
        set(list = []) {
          items.forEach((it, i) => {
            const b = list[i];
            if (!b) {
              V.show(it.body, 0);
              V.show(it.ringE, 0);
              return;
            }
            const {
              x: vx = 0,
              v = 0,
              o = 1,
              k = 1,
              tone: t = tone,
              ghost = false,
              ring = null,
              ringK = 1,
              w: ww = bw,
              base = 0,
            } = b;
            const tt = A9.tone(t);
            const [X0, Yb] = [P.px(vx) - ww / 2, P.py(base)];
            const Yt = Yb - (P.py(base) - P.py(base + v)) * clamp(k);
            const hh = Yb - Yt;
            const rr = Math.min(10, ww / 2, hh);
            const d =
              hh < 1
                ? ""
                : `M${f1(X0)} ${f1(Yb)}L${f1(X0)} ${f1(Yt + rr)}Q${f1(X0)} ${f1(Yt)} ${f1(X0 + rr)} ${f1(Yt)}L${f1(X0 + ww - rr)} ${f1(Yt)}Q${f1(X0 + ww)} ${f1(Yt)} ${f1(X0 + ww)} ${f1(Yt + rr)}L${f1(X0 + ww)} ${f1(Yb)}Z`;
            it.body.setAttribute("d", d);
            it.body.style.fill = ghost ? "none" : tt.c;
            it.body.style.stroke = ghost ? tt.c : tt.lip;
            it.body.setAttribute("stroke-width", ghost ? "4" : ww < 14 ? "0" : "3");
            it.body.setAttribute("stroke-dasharray", ghost ? "10 8" : "");
            V.show(it.body, hh < 1 ? 0 : o);
            if (ring) {
              it.ringE.style.stroke = A9.tone(ring).c;
              at(it.ringE, { x: X0 - 9, y: Yt - 9, width: ww + 18, height: Math.max(hh, 0) + 18 });
              it.ringE.setAttribute("rx", f1(Math.min(14, (ww + 18) / 2)));
            }
            V.show(it.ringE, ring && hh >= 1 ? clamp(ringK * 3) * o : 0);
          });
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
        set({ text = "", x: vx = 0, y: vy = 0, dx = 0, dy = 0, o = 1, tone: t = tone, s = 1, r = 0 } = {}) {
          setText(e, text);
          e.style.fill = t === "grey" ? "var(--text-dim)" : A9.tone(t).ink;
          const [X, Y] = px ? [vx, vy] : P.pt(vx, vy);
          e.setAttribute("x", f1(X + dx));
          e.setAttribute("y", f1(Y + dy));
          e.style.transformOrigin = `${f1(X + dx)}px ${f1(Y + dy)}px`;
          e.style.transform = `rotate(${r}deg) scale(${s})`;
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
          e.style.stroke = t === "grey" ? "var(--line-2)" : A9.tone(t).c;
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
          e.style.fill = A9.tone(t).c;
          V.show(e, o * 0.22);
        },
      };
    };

    // ---------- open polyline ----------
    P.path = ({ tone = "blue", w: sw = 4, dash, color: color0 } = {}) => {
      const e = mk("path", stroked({ "stroke-width": f1(sw), "stroke-dasharray": dash || "" }), mid);
      return {
        el: e,
        set({ pts = [], o = 1, k = 1, tone: t = tone, color = color0 } = {}) {
          const n = Math.max(0, Math.round((pts.length - 1) * clamp(k)));
          const px = pts.slice(0, n + 1).map(([vx, vy]) => P.pt(vx, vy));
          e.setAttribute("d", px.length > 1 ? `M${pts2d(px).join("L")}` : "");
          e.style.stroke = color || A9.ink(t);
          V.show(e, px.length > 1 ? o : 0);
        },
      };
    };

    // ---------- a vector (arrow) ----------
    P.vec = ({ tone = "blue", w: sw = 7, head = 22 } = {}) => {
      const g = mk("g", {}, over);
      const shaft = g.appendChild(V.s("line", { "stroke-linecap": "round" }));
      const tip = g.appendChild(V.s("polygon", { "stroke-linejoin": "round", "stroke-width": "3" }));
      return {
        el: g,
        set({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, k = 1, o = 1, tone: t = tone, w: ww = sw } = {}) {
          const [a, b] = [P.pt(x1, y1), P.pt(x2, y2)];
          const e = [a[0] + (b[0] - a[0]) * clamp(k), a[1] + (b[1] - a[1]) * clamp(k)];
          const len = Math.hypot(e[0] - a[0], e[1] - a[1]);
          const col = A9.tone(t);
          if (len < 2 || k <= 0.001) return V.show(g, 0);
          const [ux, uy] = [(e[0] - a[0]) / len, (e[1] - a[1]) / len];
          const hd = Math.min(head, len * 0.7);
          const [bx, by] = [e[0] - ux * hd * 0.8, e[1] - uy * hd * 0.8];
          at(shaft, { x1: a[0], y1: a[1], x2: bx, y2: by, "stroke-width": ww });
          shaft.style.stroke = col.c;
          const [nx, ny] = [-uy, ux];
          tip.setAttribute(
            "points",
            pts2d([e, [bx + nx * hd * 0.55, by + ny * hd * 0.55], [bx - nx * hd * 0.55, by - ny * hd * 0.55]]).join(
              " ",
            ),
          );
          tip.style.fill = col.c;
          tip.style.stroke = col.c;
          V.show(g, o);
        },
      };
    };

    // ---------- one sticker dot ----------
    P.dot = ({ tone = "blue", r = 14 } = {}) => {
      const g = mk("g", {}, over);
      const ringE = g.appendChild(V.s("circle", { r: f1(r + 12), fill: "none", "stroke-width": "5" }));
      const lip = g.appendChild(V.s("circle", { cx: 0, cy: 3, r: f1(r) }));
      const body = g.appendChild(V.s("circle", { cx: 0, cy: 0, r: f1(r), "stroke-width": "3" }));
      return {
        el: g,
        set({ x: vx = 0, y: vy = 0, o = 1, s = 1, tone: t = tone, dx = 0, dy = 0, ring = null, ringK = 1 } = {}) {
          const tt = A9.tone(t);
          lip.style.fill = tt.lip;
          body.style.fill = tt.c;
          body.style.stroke = tt.lip;
          if (ring) ringE.style.stroke = A9.tone(ring).c;
          V.show(ringE, ring ? clamp(ringK * 3) : 0);
          ringE.setAttribute("r", f1(r + 4 + 8 * (1 - clamp(ringK))));
          V.place(g, { x: P.px(vx) + dx, y: P.py(vy) + dy, s, o });
        },
      };
    };
    return P;
  }
  A9.plot = plot;
})();

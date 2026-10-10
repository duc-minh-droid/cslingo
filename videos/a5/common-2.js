/* Phase 5 · Convex Hulls: the point-plot drawing every scene shares (VID.a5, short name A5). Needs videos/l5/common.js and
   a5/common.js to be loaded first (see videos/algo-5.html). Positions are the parent's pixels (the stage is 936 x 640, origin
   top-left, y DOWN). EVERY CALL IS PURE: call update() each frame from your scene's update(t) with everything you want to see;
   anything you leave out falls back to its default, and nothing is remembered between frames.

   TONES (colour roles of this video): "green" on the hull / kept / a left turn / the cheaper method, "red" a right turn / a dent /
   popped / the dearer method, "blue" what we look at right now (the current point, the walker, the test path), "purple" angles (the
   reference line, the sweeping line, angle badges, the sorted order), "orange" attention / the one chosen (first point touched, the
   loose band, the farthest pair), "grey" neutral (a point not decided yet, an inside point, a candidate ray). A5.TONES lists them.

   POSITIONS
     A5.pos({x = 50, y = 60, s = 1.75})   the seven points A..G of lessons 5.2-5.4 at stage px: {A: [x, y], ...} = the app's own
                          coordinates (A5.PTS) shifted so the box 60..410 x 45..245 starts at (x, y) and scaled by s. The default fills
                          x 50..662, y 60..410 and leaves the right-hand column (x 700..920) and the band y 440..620 free. The
                          smallest distance between two points is 129 px at s = 1.75, so r = 26 discs never touch.
                          With the defaults: A (50,384) B (225,279) C (277,410) D (522,349) E (662,191) F (382,226) G (347,60).

   THE PLOT
     const p = A5.plot(parent, {pos, r: 26, font: 30, letters: true, hidden: false, segs: 26, polys: 4, arcs: 6, tags: 16});
       pos     {name: [x, y]} the points to draw (default A5.pos()); any names work (clouds use "p0", "p1", ...)
       r       disc radius (26; use 5-7 with letters: false for a cloud of dots);  font  letter size (30, never below 28)
       letters false = discs without their letter (the letter needs r >= 22)     hidden  true = a point you do not list is not drawn
       segs / polys / arcs / tags   how many of each can be drawn in one frame (pools; an Error says when you ask for more)
     p.update({
       points: { A: "green" | {tone, solid, s, o, dx, dy, ring, ringK, ringDash, text} , ... },
       polys:  [{pts: ["A","C",...] | [[x, y], ...], tone, fill: 0..1, w, dash, o, k, spread, amount}],
       segs:   [{a, b, tone, k, w, dash, o, arrow, halo, rev, trimA, trimB}],
       arcs:   [{c, r, from, to, tone, w, k, o, dash}],
       tags:   [{at, dx, dy, text, tone, solid, k, o, fs, disc, anchor, h}],
       base:   {tone, solid, o, ...}     the state of every point you do NOT list (default grey; hidden: true makes it o 0)
       o: 1,                             opacity of the whole plot
     })
       POINT   tone  one of A5.TONES (grey = white disc with a grey rim)    solid  true = filled with the tone ("on the hull")
               s  scale (1)  o  opacity (1)  dx, dy  offset in px (a hop or shake)   text  replaces the letter ("p", "a", "1")
               ring  a tone: a ring round the point (attention);  ringK 0..1 its pop-in (1);  ringDash  true = dashed ring
       POLY    a closed outline through the points `pts` (names or [x, y]), drawn behind everything.  tone (green), fill 0..1 the
               strength of the tint inside (0.5), w width multiplier (1), dash true = dashed, o opacity (1), k 0..1 how much of the
               outline is drawn from the first point (1), spread 0..1 moves every edge outward by spread * amount px (0 = tight on
               the points; 1 = a LOOSE band, `amount` px (default 40) outside; corners are mitred): animate it 1 -> 0 and the
               band snaps onto the points. Keep the plot at least amount + 20 px from the stage edge.
       SEG     a straight stroke from a to b (names or [x, y]).  tone (grey), k 0..1 how much is drawn growing from a (1; from b
               with rev: true), w width multiplier (1 = 7 px), dash true = dashed (k ignored), o opacity (1), arrow true = an
               arrowhead at b (it appears as k passes 0.9), halo 0..1 a pale band behind it in the tone, trimA / trimB px cut off
               each end (default: r + 6 at a NAMED point so the stroke starts and ends just outside the disc, 0 at a coordinate).
       ARC     part of a circle round c (a name or [x, y]) of radius r from screen angle `from` to `to` in degrees (0 = east,
               90 = south, -90 = up; to > from runs clockwise as seen). k 0..1 grows it from `from`. Use it for an angle between two
               rays, then put a tag at A5.polar(centre, middle angle, r + 30).
       TAG     a pill centred on `at` (a point name or [x, y]) plus dx, dy: text (28 px bold; a bigger fs is fine, never smaller),
               tone (grey), solid false (tinted) / true (filled), k 0..1 pops it in, o opacity, disc: 46 = a round badge of that
               diameter for one or two digits, anchor "c" (default) | "l" | "r" = which part of the pill sits on the point (l: its left
               edge is on the point, r: its right edge), h height.
     p.pt("A") -> {x, y}     p.xy("A") -> [x, y]     p.r -> disc radius     p.pos -> the position map     p.el -> the <div> holding it all

   A5.polyPath(points, spread = 0, amount = 40) -> SVG path data of the closed outline (for your own SVG). */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const { s, h, clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const cls = (t) => {
    if (!A5.TONES.includes(t)) throw new Error(`VID.a5: unknown tone "${t}" (use ${A5.TONES.join(", ")})`);
    return `c-${t}`;
  };
  const css = (e, o) => (Object.assign(e.style, o), e);
  const spec = (v) => (typeof v === "string" ? { tone: v } : v || {});
  const mean = (pts) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
  const zero = { position: "absolute", left: "0px", top: "0px", width: "0px", height: "0px" };

  const pos = ({ x = 50, y = 60, s: k = 1.75 } = {}) =>
    Object.fromEntries(Object.entries(A5.PTS).map(([n, [px, py]]) => [n, [x + (px - 60) * k, y + (py - 45) * k]]));

  /** closed outline path; spread (0..1) times amount (px) moves every edge outward by that distance (a loose band, mitred corners) */
  const polyPath = (pts, spread = 0, amount = 40) => {
    const d = spread * amount;
    let q = pts;
    if (d > 0.01 && pts.length >= 3) {
      const c = mean(pts);
      const unit = (a, b) => {
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const n = [(b[1] - a[1]) / len, -(b[0] - a[0]) / len];
        return n[0] * ((a[0] + b[0]) / 2 - c[0]) + n[1] * ((a[1] + b[1]) / 2 - c[1]) >= 0 ? n : [-n[0], -n[1]];
      };
      q = pts.map((p, i) => {
        const n1 = unit(pts[(i + pts.length - 1) % pts.length], p);
        const n2 = unit(p, pts[(i + 1) % pts.length]);
        const k = Math.min(1.6, 1 / Math.max(0.2, 1 + n1[0] * n2[0] + n1[1] * n2[1])); // mitre factor, capped so sharp corners stay near
        const m = [(n1[0] + n2[0]) * k * d, (n1[1] + n2[1]) * k * d];
        return [p[0] + m[0], p[1] + m[1]];
      });
    }
    return `${q.map((p, i) => `${i ? "L" : "M"}${f1(p[0])} ${f1(p[1])}`).join("")}Z`;
  };

  function plot(parent, opts = {}) {
    const P = opts.pos || pos();
    const R = opts.r ?? 26;
    const font = opts.font ?? 30;
    const lip = Math.max(2, Math.round(R * 0.19));
    const svg = s("svg", { width: 936, height: 640 });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const [gPolys, gSegs, gArcs, gRings, gPts] = [0, 1, 2, 3, 4].map(() => svg.appendChild(s("g")));
    const tagLayer = h("div", { style: zero });
    const root = h("div", { style: zero }, svg, tagLayer);
    parent.append(root);

    const xy = (ref) => {
      if (Array.isArray(ref)) return ref;
      if (!P[ref]) throw new Error(`VID.a5.plot: unknown point "${ref}" (points: ${Object.keys(P).join(", ")})`);
      return P[ref];
    };
    const trimOf = (ref) => (Array.isArray(ref) ? 0 : R + 6);

    // polygons: a tint and an outline
    const polys = Array.from({ length: opts.polys ?? 4 }, () => {
      const fill = css(s("path", {}), { stroke: "none", fill: "var(--c-dim)" });
      const line = css(s("path", { fill: "none", "stroke-linejoin": "round", pathLength: "1" }), { stroke: "var(--c)" });
      gPolys.append(fill, line);
      return { fill, line };
    });
    // segments: halo, line, head
    const segs = Array.from({ length: opts.segs ?? 26 }, () => {
      const halo = css(s("path", { fill: "none", "stroke-linecap": "round" }), { stroke: "var(--c-dim)" });
      const line = css(s("path", { fill: "none", "stroke-linecap": "round" }), { stroke: "var(--c)" });
      const head = css(s("path", { "stroke-linejoin": "round", "stroke-width": "3" }), { fill: "var(--c)", stroke: "var(--c)" });
      gSegs.append(halo, line, head);
      return { halo, line, head };
    });
    const arcs = Array.from({ length: opts.arcs ?? 6 }, () => {
      const path = css(s("path", { fill: "none", "stroke-linecap": "round" }), { stroke: "var(--c)" });
      gArcs.append(path);
      return path;
    });
    // tags: a zero-size box on the point, the pill centred (or anchored) on it
    const tags = Array.from({ length: opts.tags ?? 16 }, () => {
      const pill = h("div", { class: "v-tag", style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" } });
      const box = h("div", { style: { ...zero, display: "flex", alignItems: "center", justifyContent: "center" } }, pill);
      tagLayer.append(box);
      return { box, pill };
    });
    // points and their rings
    const T = {};
    Object.keys(P).forEach((name) => {
      const [x, y] = P[name];
      const circ = (dy, r, ex) => s("circle", { cx: f1(x), cy: f1(y + dy), r, ...ex });
      const ring = css(circ(0, R + 13, { fill: "none", "stroke-width": 6 }), { stroke: "var(--c)" });
      gRings.append(ring);
      const lipC = circ(lip, R, {});
      const face = circ(0, R, { "stroke-width": R < 14 ? 3 : 4 });
      const label = opts.letters === false ? "" : name;
      const txt = css(s("text", { x: f1(x), y: f1(y), "text-anchor": "middle", dy: ".36em", text: label }), {
        fontSize: `${font}px`,
        fontWeight: "900",
      });
      const g = s("g", {}, lipC, face, txt);
      gPts.append(g);
      T[name] = { name, label, ring, lip: lipC, face, txt, g };
    });

    function paintPoint(t, st) {
      const tone = st.tone || "grey";
      const solid = !!st.solid;
      t.g.setAttribute("class", cls(tone));
      css(t.face, {
        fill: solid ? "var(--c)" : tone === "grey" ? "var(--panel)" : "var(--c-dim)",
        stroke: solid ? "var(--c-lip)" : "var(--c-edge)",
      });
      t.lip.style.fill = solid ? "var(--c-lip)" : "var(--c-edge)";
      t.txt.style.fill = solid ? "var(--c-on)" : "var(--ink)";
      const text = st.text != null ? String(st.text) : t.label;
      if (t.txt.textContent !== text) t.txt.textContent = text;
      V.place(t.g, { x: st.dx || 0, y: st.dy || 0, s: st.s ?? 1, o: st.o ?? 1 });
      const rk = st.ring ? clamp(st.ringK ?? 1) : 0;
      if (st.ring) t.ring.setAttribute("class", cls(st.ring));
      t.ring.style.strokeDasharray = st.ringDash ? "14 10" : "";
      t.ring.setAttribute("r", f1(R + 13 + (1 - E.out(rk)) * 14));
      V.place(t.ring, { x: st.dx || 0, y: st.dy || 0, o: Math.min(1, rk * 3) * (st.o ?? 1) });
    }

    function paintPoly(el, st) {
      const k = clamp(st.k ?? 1);
      const o = st.o ?? 1;
      const w = st.w ?? 1;
      const d = polyPath(st.pts.map(xy), st.spread ?? 0, st.amount ?? 40);
      const tone = cls(st.tone || "green");
      [el.fill, el.line].forEach((e) => {
        e.setAttribute("d", d);
        e.setAttribute("class", tone);
      });
      el.line.style.strokeWidth = `${f1(7 * w)}px`;
      el.line.setAttribute("pathLength", st.dash ? "" : "1");
      el.line.style.strokeDasharray = st.dash ? `${f1(14 * w)} ${f1(11 * w)}` : k >= 0.999 ? "" : `${k.toFixed(4)} 2`;
      V.show(el.line, k < 0.003 ? 0 : o);
      V.show(el.fill, k < 0.003 ? 0 : (st.fill ?? 0.5) * o);
    }

    function paintSeg(el, st) {
      const [ra, rb] = st.rev ? [st.b, st.a] : [st.a, st.b];
      const [pa, pb] = [xy(ra), xy(rb)];
      const len0 = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) || 1;
      const u = [(pb[0] - pa[0]) / len0, (pb[1] - pa[1]) / len0];
      const ta = (st.rev ? st.trimB : st.trimA) ?? trimOf(ra);
      const tb = (st.rev ? st.trimA : st.trimB) ?? trimOf(rb);
      const w = 7 * (st.w ?? 1);
      const head = st.arrow ? Math.max(24, 3.4 * w) : 0;
      const q0 = [pa[0] + u[0] * ta, pa[1] + u[1] * ta];
      const q1 = [pb[0] - u[0] * tb, pb[1] - u[1] * tb];
      const len = Math.max(1, Math.hypot(q1[0] - q0[0], q1[1] - q0[1]));
      const body = [q1[0] - u[0] * head * 0.7, q1[1] - u[1] * head * 0.7];
      const k = clamp(st.k ?? 1);
      const o = st.o ?? 1;
      const tone = cls(st.tone || "grey");
      const d = `M${f1(q0[0])} ${f1(q0[1])}L${f1(body[0])} ${f1(body[1])}`;
      [el.halo, el.line, el.head].forEach((e) => e.setAttribute("class", tone));
      el.line.setAttribute("d", d);
      el.halo.setAttribute("d", d);
      el.line.style.strokeWidth = `${f1(w)}px`;
      el.halo.style.strokeWidth = `${f1(w * 2.7)}px`;
      const bodyLen = Math.max(1, len - head * 0.7);
      if (st.dash) {
        el.line.style.strokeDasharray = `${f1(w * 1.8)} ${f1(w * 1.5)}`;
        V.show(el.line, o);
      } else {
        el.line.style.strokeDasharray = k >= 0.999 ? "" : `${f1(k * bodyLen)} ${f1(len * 2)}`;
        V.show(el.line, k < 0.003 ? 0 : o);
      }
      const halo = clamp(st.halo || 0);
      el.halo.style.strokeDasharray = el.line.style.strokeDasharray;
      V.show(el.halo, halo < 0.003 || k < 0.003 ? 0 : halo * o);
      if (!st.arrow) return V.show(el.head, 0);
      const n = [-u[1], u[0]];
      const b1 = [body[0] + n[0] * head * 0.5, body[1] + n[1] * head * 0.5];
      const b2 = [body[0] - n[0] * head * 0.5, body[1] - n[1] * head * 0.5];
      el.head.setAttribute("d", `M${f1(q1[0])} ${f1(q1[1])}L${f1(b1[0])} ${f1(b1[1])}L${f1(b2[0])} ${f1(b2[1])}Z`);
      const hk = st.dash ? 1 : clamp((k - 0.88) / 0.12);
      V.show(el.head, hk < 0.003 ? 0 : o * Math.min(1, hk * 2));
    }

    function paintArc(el, st) {
      const c = xy(st.c);
      const k = clamp(st.k ?? 1);
      const span = (st.to - st.from) * k;
      if (Math.abs(span) < 0.3) return V.show(el, 0);
      const pt = (a) => [c[0] + Math.cos((a * Math.PI) / 180) * st.r, c[1] + Math.sin((a * Math.PI) / 180) * st.r];
      const [p0, p1] = [pt(st.from), pt(st.from + span)];
      const flags = `${Math.abs(span) > 180 ? 1 : 0} ${span > 0 ? 1 : 0}`;
      el.setAttribute("d", `M${f1(p0[0])} ${f1(p0[1])}A${f1(st.r)} ${f1(st.r)} 0 ${flags} ${f1(p1[0])} ${f1(p1[1])}`);
      el.setAttribute("class", cls(st.tone || "purple"));
      el.style.strokeWidth = `${f1(7 * (st.w ?? 1))}px`;
      el.style.strokeDasharray = st.dash ? "12 10" : "";
      V.show(el, st.o ?? 1);
    }

    function paintTag(el, st) {
      const at = xy(st.at);
      const k = clamp(st.k ?? 1);
      const tone = st.tone || "grey";
      cls(tone);
      el.box.style.left = `${f1(at[0] + (st.dx || 0))}px`;
      el.box.style.top = `${f1(at[1] + (st.dy || 0))}px`;
      el.box.style.justifyContent = st.anchor === "l" ? "flex-start" : st.anchor === "r" ? "flex-end" : "center";
      const c = `v-tag c-${tone}${st.solid ? " solid" : ""}`;
      if (el.pill.className !== c) el.pill.className = c;
      const text = String(st.text ?? "");
      if (el.pill.textContent !== text) el.pill.textContent = text;
      Object.assign(el.pill.style, {
        fontSize: `${st.fs || 28}px`,
        width: st.disc ? `${st.disc}px` : "",
        height: st.disc ? `${st.disc}px` : st.h ? `${st.h}px` : "",
        padding: st.disc ? "0" : "",
        borderRadius: st.disc ? "50%" : "",
      });
      V.place(el.pill, { s: 0.8 + 0.2 * E.pop(k), o: Math.min(1, k * 4) * (st.o ?? 1) });
    }

    const hideAll = {
      polys: (el) => [el.line, el.fill].forEach((e) => V.show(e, 0)),
      segs: (el) => [el.line, el.halo, el.head].forEach((e) => V.show(e, 0)),
      arcs: (el) => V.show(el, 0),
      tags: (el) => V.show(el.pill, 0),
    };
    const kinds = { polys: [polys, paintPoly], segs: [segs, paintSeg], arcs: [arcs, paintArc], tags: [tags, paintTag] };

    function update(st = {}) {
      Object.keys(st.points || {}).forEach(xy); // throws on a mistyped point
      const base = st.base || {};
      Object.values(T).forEach((t) => {
        const own = (st.points || {})[t.name];
        paintPoint(t, own ? spec(own) : { ...(opts.hidden ? { o: 0 } : {}), ...base });
      });
      Object.entries(kinds).forEach(([kind, [els, paint]]) => {
        const items = st[kind] || [];
        if (items.length > els.length)
          throw new Error(`VID.a5.plot: ${items.length} ${kind} in one frame, the pool holds ${els.length} (raise the ${kind} option)`);
        els.forEach((el, i) => (items[i] ? paint(el, items[i]) : hideAll[kind](el)));
      });
      V.show(root, st.o ?? 1);
    }

    return { el: root, update, pt: (n) => ({ x: xy(n)[0], y: xy(n)[1] }), xy, r: R, pos: P };
  }

  Object.assign(A5, { pos, plot, polyPath });
})();

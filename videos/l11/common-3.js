/* Lecture 11 · Flocking and agents: the two big figures (VID.l11, short name L11). Needs l5/common.js, l11/common.js and
   l11/common-2.js loaded first. EVERY update() IS PURE: pass everything you want to see each frame; nothing is remembered.

   1. THE FLOCK VIEW  (a window onto one precomputed run of L11.RUN, see common.js)
        const fv = L11.field(parent, {x, y, w, h, zoom: 1, size: 22, max: 60, panel: true});
            x, y, w, h: the window in the parent's pixels (clipped; panel: true draws a plain grey sticker frame).
            zoom: px per world unit. The world is 600 x 360 and WRAPS ROUND, so keep zoom >= w / 600 and >= h / 360 (the
            window must not show more than one world). size: boid length in px (the focus boid is drawn 1.3x larger).
        fv.update({
          run,                 // a run from L11.RUN (required)
          tick,                // fractional tick (e.g. 36 * (t - t0)); clamped to the run, positions interpolated
          cam: "centre",       // what sits in the middle of the window: "centre" (the flock's circular-mean centre),
                               //   "focus" (the focus boid), "start" (the flock centre at tick 0, fixed) or {x, y} (world)
          focus: null,         // index of the highlighted boid (purple, drawn on top) or null
          ring: 0,             // 0..1 purple halo round the focus boid
          radius: 0,           // 0..1 orange dashed perception circle round the focus (radius run.P.R, or R below)
          R: null,             // override the drawn perception radius (world units), e.g. to grow it
          sepRing: 0,          // 0..1 red dashed circle of the separation distance (20) round the focus
          hood: 0,             // 0..1: the flockmates the focus senses (inside run.P.R) turn orange (switch at 0.5)
          dim: 1,              // opacity of boids OUTSIDE the focus's radius while hood > 0.5 (e.g. 0.45)
          arrows: {sep: 0, ali: 0, coh: 0, sum: 0},   // 0..1 draw-on of the focus boid's pushes (red, blue, green) and
                               //   their sum (purple), from L11.pushes at round(tick), drawn from the focus boid
          arrowScale: 140,     // px per unit of push (pushes are 0.03 to 0.7); every arrow is capped at 150 px
          trail: 0,            // ticks of the focus boid's recent path to draw as purple dots (0 = none); trailK 0..1
          fear: 0,             // 0..1: show the predator strike of a run that has one (run.fear): a red ring growing for
                               //   40 ticks from run.fear.at at the strike point
          tone: "grey",        // tone of ordinary boids; tones: (i) => tone | null overrides per boid
          k: 1, o: 1,          // k 0..1 fades the boids in; o fades the whole view
        });
        fv.px(wx, wy) -> {x, y} where a world point is drawn (parent pixels, last update's camera);  fv.boid(i) -> {x, y, r}
            the parent-pixel position and heading (degrees) of boid i in the last update;  fv.el (the window div), fv.svg
   2. THE AGENTS RING  (lesson 11.5: n agents on a circle, links, a central monitor)
        const rg = L11.ring(parent, {cx, cy, r: 200, n: 10, size: 56});   (centre and radius in parent pixels)
        rg.update({
          k: 1,                // 0..1 the agents pop in (staggered)
          all: 0,              // 0..1 draws every pair link (n (n - 1) / 2 lines, red, thin), staggered by pair
          ring: 0,             // 0..1 draws the n neighbour links (green, thick), one after another
          tones: (i) => "blue",   // tone of agent i ("blue" default; e.g. red infected, grey isolated, green healthy)
          bump: (i) => 0,      // 0..1 pulse of agent i (pass V.flash)
          hub: 0,              // 0..1 the central monitor (a blue disc labelled `hubText`) pops in; hubTone ("blue")
          hubText: "monitor", spokes: 0,          // 0..1 dashed blue spokes from the monitor to every agent
          broken: 0,           // 0..1 the monitor greys out and gets a red cross (spokes fade)
          o: 1,
        });
        rg.pt(i) -> {x, y} centre of agent i (agent 0 at the top, clockwise);  rg.hubPt -> {x, y};  rg.el (the svg) */
(function () {
  const V = window.VID;
  const L11 = V.l11;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { f1, K, wrap } = L11;
  const deg = (r) => (r * 180) / Math.PI;

  // ---------- 1. the flock view ----------
  function field(parent, o = {}) {
    const { x = 0, y = 0, w = 600, h = 360, zoom = 1, size = 22, max = 60 } = o;
    const el = V.h("div", {
      class: o.panel === false ? "" : "v-card plain c-grey",
      style: {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        overflow: "hidden",
        padding: "0",
        boxSizing: "border-box",
      },
    });
    parent.append(el);
    const svg = L5.svg(el, w, h);
    svg.style.overflow = "hidden";
    const S = (tag, a) => svg.appendChild(V.s(tag, a));
    const circ = (stroke, fill, dash) =>
      S("circle", { "stroke-width": "4", "stroke-dasharray": dash, style: { stroke, fill } });
    const rad = circ("var(--amber)", "color-mix(in srgb, var(--amber) 10%, transparent)", "12 9");
    const sepC = circ("var(--rose)", "color-mix(in srgb, var(--rose) 10%, transparent)", "8 7");
    const fearC = circ("var(--rose)", "none", "");
    const dots = Array.from({ length: 40 }, () => S("circle", { r: "4", style: { fill: "var(--violet)" } }));
    const path = L11.dartPath(size);
    const pool = Array.from({ length: max }, () =>
      S("path", { d: path, "stroke-width": "1.5", "stroke-linejoin": "round" }),
    );
    const halo = S("circle", {
      r: f1(size * 1.15),
      fill: "none",
      "stroke-width": "5",
      style: { stroke: "var(--violet)" },
    });
    const me = S("path", { d: L11.dartPath(size * 1.3), "stroke-width": "2", "stroke-linejoin": "round" });
    const vecs = { sep: "red", ali: "blue", coh: "green", sum: "purple" };
    const arrows = Object.fromEntries(
      Object.entries(vecs).map(([k, tone]) => [k, L11.vec(svg, { tone, w: 7, head: 20 })]),
    );
    let cam = { x: K.W / 2, y: K.H / 2 };
    let last = [];
    const px = (wx, wy) => ({ x: w / 2 + wrap(wx - cam.x, K.W) * zoom, y: h / 2 + wrap(wy - cam.y, K.H) * zoom });
    const vis = (e, k) => {
      e.style.visibility = k <= 0.001 ? "hidden" : "";
      e.style.opacity = k >= 1 ? "" : String(Math.max(0, k));
    };
    const paint = (e, tone) => {
      const t = L11.tone(tone);
      e.style.fill = t.c;
      e.style.stroke = t.lip;
    };
    const api = {
      el,
      svg,
      px,
      boid: (i) => last[i],
      update(st = {}) {
        const R = st.run;
        const tick = clamp(st.tick || 0, 0, R.ticks);
        const b = L11.at(R, tick);
        const fi = st.focus ?? null;
        if (st.cam && typeof st.cam === "object") cam = { x: st.cam.x, y: st.cam.y };
        else if (st.cam === "focus" && fi != null) cam = { x: b[fi].x, y: b[fi].y };
        else if (st.cam === "start") cam = L11.centre(L11.frame(R, 0));
        else cam = L11.centre(b);
        V.show(el, st.o ?? 1);
        const Rw = st.R ?? R.P.R;
        const hoodOn = fi != null && (st.hood || 0) > 0.5;
        const inside = new Set(
          hoodOn
            ? b
                .map((q, j) => [j, Math.hypot(wrap(q.x - b[fi].x, K.W), wrap(q.y - b[fi].y, K.H))])
                .filter(([j, d]) => j !== fi && d < Rw && d > 0)
                .map(([j]) => j)
            : [],
        );
        const kk = clamp(st.k ?? 1);
        last = b.map((p) => ({ ...px(p.x, p.y), r: deg(Math.atan2(p.vy, p.vx)) }));
        pool.forEach((e, i) => {
          if (i >= b.length || i === fi) return vis(e, 0);
          const q = last[i];
          e.setAttribute("transform", `translate(${f1(q.x)} ${f1(q.y)}) rotate(${f1(q.r)})`);
          const tone = (st.tones && st.tones(i)) || (inside.has(i) ? "orange" : st.tone || "grey");
          paint(e, tone);
          vis(e, kk * (hoodOn && !inside.has(i) ? (st.dim ?? 1) : 1));
        });
        // the focus boid, its circles, trail and arrows
        const F = fi != null ? last[fi] : null;
        vis(me, F ? kk : 0);
        vis(halo, F ? clamp(st.ring || 0) * kk : 0);
        if (F) {
          me.setAttribute("transform", `translate(${f1(F.x)} ${f1(F.y)}) rotate(${f1(F.r)})`);
          paint(me, "purple");
          halo.setAttribute("cx", f1(F.x));
          halo.setAttribute("cy", f1(F.y));
          [
            [rad, st.radius, Rw],
            [sepC, st.sepRing, K.SEP_R],
          ].forEach(([c, k, r]) => {
            c.setAttribute("cx", f1(F.x));
            c.setAttribute("cy", f1(F.y));
            c.setAttribute("r", f1(r * zoom * (0.6 + 0.4 * E.out(clamp(k || 0)))));
            vis(c, clamp((k || 0) * 2));
          });
        } else [rad, sepC].forEach((c) => vis(c, 0));
        const tr = F && st.trail ? L11.trail(R, tick, fi, st.trail, 3).slice(1) : [];
        dots.forEach((d, i) => {
          if (i >= tr.length) return vis(d, 0);
          const p = px(tr[i].x, tr[i].y);
          d.setAttribute("cx", f1(p.x));
          d.setAttribute("cy", f1(p.y));
          vis(d, (st.trailK ?? 1) * (1 - i / (tr.length + 1)) * 0.9);
        });
        const A = st.arrows || {};
        const push = F ? L11.pushes(R, tick, fi) : null;
        Object.entries(arrows).forEach(([key, a]) => {
          const k = clamp(A[key] || 0);
          if (!F || k <= 0) return a.set({ o: 0 });
          const v = push[key];
          const m = Math.hypot(v[0], v[1]);
          const len = Math.min(150, m * (st.arrowScale || 140));
          const [ux, uy] = m > 1e-9 ? [v[0] / m, v[1] / m] : [0, 0];
          a.set({ x1: F.x, y1: F.y, x2: F.x + ux * len, y2: F.y + uy * len, k });
        });
        // the predator strike
        const fr = R.fear;
        const fk = fr ? clamp(st.fear || 0) * (tick >= fr.at && tick <= fr.at + 40 ? 1 : 0) : 0;
        vis(fearC, fk * (fr ? 1 - (tick - fr.at) / 40 : 0));
        if (fk > 0) {
          const p = px(fr.x, fr.y);
          fearC.setAttribute("cx", f1(p.x));
          fearC.setAttribute("cy", f1(p.y));
          fearC.setAttribute("r", f1((14 + (tick - fr.at) * 2.5) * zoom));
          fearC.setAttribute("stroke-width", "6");
        }
      },
    };
    return api;
  }

  // ---------- 2. the agents ring ----------
  function ring(parent, o = {}) {
    const { cx = 468, cy = 320, r = 200, n = 10, size = 56 } = o;
    const svg = L5.svg(parent);
    const pt = (i) => ({
      x: cx + r * Math.cos((i / n) * 2 * Math.PI - Math.PI / 2),
      y: cy + r * Math.sin((i / n) * 2 * Math.PI - Math.PI / 2),
    });
    const S = (tag, a) => svg.appendChild(V.s(tag, a));
    const line = (a, b, wdt, dash) =>
      S("line", {
        x1: f1(a.x),
        y1: f1(a.y),
        x2: f1(b.x),
        y2: f1(b.y),
        "stroke-width": wdt,
        "stroke-linecap": "round",
        "stroke-dasharray": dash,
      });
    const hubPt = { x: cx, y: cy };
    const pairs = [];
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j]);
    const chords = pairs.map(([i, j]) => line(pt(i), pt(j), "3"));
    const spokes = Array.from({ length: n }, (_, i) => line(hubPt, pt(i), "4", "10 9"));
    const links = Array.from({ length: n }, (_, i) => line(pt(i), pt((i + 1) % n), "9"));
    const node = (p, s) =>
      S("circle", { cx: f1(p.x), cy: f1(p.y), r: f1(s / 2), "stroke-width": "4", style: { transformBox: "fill-box" } });
    const nodes = Array.from({ length: n }, (_, i) => node(pt(i), size));
    const hub = node(hubPt, size * 2.5);
    const hubLabel = S("text", {
      x: f1(cx),
      y: f1(cy + 10),
      "text-anchor": "middle",
      style: { fontSize: "28px", fontWeight: "900", fontFamily: "inherit" },
    });
    const cross = svg.appendChild(L5.cross(cx, cy - 100, 44, "red"));
    const vis = (e, k) => {
      e.style.visibility = k <= 0.001 ? "hidden" : "";
      e.style.opacity = k >= 1 ? "" : String(Math.max(0, k));
    };
    return {
      el: svg,
      pt,
      hubPt,
      update(st = {}) {
        vis(svg, st.o ?? 1);
        const all = clamp(st.all || 0) * pairs.length;
        chords.forEach((c, p) => {
          c.style.stroke = "var(--rose)";
          vis(c, clamp(all - p) * 0.55);
        });
        const rk = clamp(st.ring || 0) * n;
        links.forEach((l, i) => {
          l.style.stroke = "var(--teal)";
          const k = clamp(rk - i);
          const a = pt(i),
            b = pt((i + 1) % n);
          l.setAttribute("x2", f1(a.x + (b.x - a.x) * k));
          l.setAttribute("y2", f1(a.y + (b.y - a.y) * k));
          vis(l, k > 0 ? 1 : 0);
        });
        const br = clamp(st.broken || 0);
        const hk = clamp(st.hub || 0);
        spokes.forEach((s) => {
          s.style.stroke = "var(--blue)";
          vis(s, clamp(st.spokes || 0) * hk * (1 - 0.8 * br));
        });
        const ht = L11.tone(br > 0.5 ? "grey" : st.hubTone || "blue");
        hub.style.fill = ht.c;
        hub.style.stroke = ht.lip;
        hub.style.transform = `scale(${(0.6 + 0.4 * E.pop(hk)).toFixed(3)})`;
        hub.style.transformOrigin = "50% 50%";
        vis(hub, hk > 0 ? Math.min(1, hk * 3) : 0);
        hubLabel.textContent = st.hubText || "monitor";
        hubLabel.style.fill = ht.on;
        vis(hubLabel, hk > 0.5 ? 1 : 0);
        vis(cross, br);
        if (br > 0) L5.drawOn(cross, br);
        const k = clamp(st.k ?? 1);
        nodes.forEach((c, i) => {
          const ki = clamp(k * (n + 2) - i);
          const t = L11.tone((st.tones && st.tones(i)) || "blue");
          c.style.fill = t.c;
          c.style.stroke = t.lip;
          c.style.transformOrigin = "50% 50%";
          c.style.transform = `scale(${((0.5 + 0.5 * E.pop(ki)) * (1 + 0.25 * ((st.bump && st.bump(i)) || 0))).toFixed(3)})`;
          vis(c, ki > 0 ? Math.min(1, ki * 3) : 0);
        });
      },
    };
  }

  Object.assign(L11, { field, ring });
})();

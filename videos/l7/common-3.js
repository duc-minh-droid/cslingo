/* Lecture 7 · Swarm intelligence: the DOUBLE BRIDGE drawing (VID.l7, short name L7). Needs l5/common.js, l7/common.js and common-2.js.
   Every call is PURE (call update() every frame with everything to show; nothing is remembered).

     const B = L7.bridge(parent, {x, y, w, h, cy, lenU: 5, lenL: 5, r: 40, bow, dot: 8});
       The box is x, y, w, h in the parent's pixels (stage 936 x 640). The nest (a round sticker with the word "Nest", radius r) sits at the
       left, the food at the right, both with their centre cy px below the box top (default h / 2). Two roads run from the nest rim to the
       food rim. lenU, lenL are the walking times in ticks (the UPPER road is always the short one, lenU <= lenL).
         lenU === lenL  two equal arcs, the upper bowing up and the lower bowing down by `bow` px (default min(cy - 0.62 r - 14, 0.3 x chord)).
         lenU < lenL    the upper road is a straight line and the lower one a deep bowl whose DRAWN length is lenL / lenU times as long
                        (so ants walk at the same speed on both, and arrive after lenU and lenL ticks). The bowl needs about
                        0.8 x the chord below the road: w 540 (chord 380) needs h >= cy + 320, w 480 needs cy + 274, w 600 cy + 366.
                        A box that is too small throws an Error that says how much room is missing.
       Drawn from the bottom up: grey ground roads (16 px), blue pheromone trails on top (width L7.trailW(trail)), a pulse ring where an
       ant lands, the ants (ink dots), then nest and food.
       B.update({sim, T, o, trails: 1, ants: 1, tone: {U: "blue", L: "blue"}, ground: 1, tau: [tauU, tauL]})
           sim, T   a colony (L7.bridgeSim / L7.EQ.up / L7.SH ...) and the tick time (0..149, any real number): draws the ants in flight, the
                    trails and the landing pulses from L7.bridgeAt(sim, T) and RETURNS that state ({tauU, tauL, ants, landed, n, share, t}).
                    Without sim nothing moves; pass tau: [u, l] to draw fixed trails (or leave them out for none).
           o        opacity of the whole bridge;  trails, ants 0..1 fade those layers;  tone recolours a trail (e.g. {U: "green"});
           ground   0..1 how much of the grey roads is drawn (grows from the nest), for a build-up animation.
       B.pt(b, s) -> {x, y, a}  point at fraction s (0..1 of the drawn length) of road b (0 upper, 1 lower), heading a in degrees (0 = right)
       B.apex(b) -> {x, y}      the middle of road b (put a label there: above it for b = 0, below it for b = 1)
       B.nest, B.food -> {x, y} centres;  B.r the radius;  B.chord the straight distance between the road ends;  B.len[b] drawn px of road b;
       B.speed(b) px per tick on road b;  B.el the svg;  B.box {x, y, w, h}.  Pulses come from `landed`, a deposit ring that grows and fades. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);

  const quad = (p0, c, p2) => (t) => [
    (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0],
    (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1],
  ];
  const cubic = (p0, c1, c2, p3) => (t) => {
    const u = 1 - t;
    return [
      u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1],
    ];
  };
  /** arc-length table of a curve: {pts, cum, len} */
  function table(f, n = 240) {
    const pts = [f(0)];
    const cum = [0];
    for (let i = 1; i <= n; i++) {
      const p = f(i / n);
      pts.push(p);
      cum.push(cum[i - 1] + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]));
    }
    return { pts, cum, len: cum[n] };
  }
  /** point and heading (degrees) at fraction s of the arc length */
  function atLen(tab, s) {
    const target = clamp(s) * tab.len;
    let lo = 0;
    let hi = tab.cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (tab.cum[mid] <= target) lo = mid;
      else hi = mid;
    }
    const seg = tab.cum[hi] - tab.cum[lo] || 1;
    const f = (target - tab.cum[lo]) / seg;
    const [a, b] = [tab.pts[lo], tab.pts[hi]];
    return {
      x: a[0] + (b[0] - a[0]) * f,
      y: a[1] + (b[1] - a[1]) * f,
      a: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI,
    };
  }
  const pathOf = (tab) =>
    `M ${tab.pts
      .filter((_, i) => i % 3 === 0 || i === tab.pts.length - 1)
      .map((p) => `${f1(p[0])} ${f1(p[1])}`)
      .join(" L ")}`;

  function bridge(parent, o = {}) {
    const { x = 0, y = 0, w = 936, h = 300, r = 40, lenU = 5, lenL = 5, dot = 8 } = o;
    if (lenL < lenU) throw new Error("VID.l7.bridge: the upper road is the short one (lenU <= lenL)");
    const cy = o.cy ?? h / 2;
    const [nest, food] = [
      { x: x + r, y: y + cy },
      { x: x + w - r, y: y + cy },
    ];
    const rim = (deg) => {
      const q = (deg * Math.PI) / 180;
      return [
        [nest.x + r * Math.cos(q), nest.y + r * Math.sin(q)],
        [food.x - r * Math.cos(q), food.y + r * Math.sin(q)],
      ];
    };
    let tabs;
    let chord;
    if (lenU === lenL) {
      const [[a0, a2], [b0, b2]] = [rim(-38), rim(38)];
      chord = a2[0] - a0[0];
      const bow = o.bow ?? Math.min(cy - 0.62 * r - 14, 0.3 * chord);
      tabs = [
        table(quad(a0, [(a0[0] + a2[0]) / 2, a0[1] - 2 * bow], a2)),
        table(quad(b0, [(b0[0] + b2[0]) / 2, b0[1] + 2 * bow], b2)),
      ];
    } else {
      const [[s0, s2], [l0, l2]] = [rim(0), rim(62)];
      chord = s2[0] - s0[0];
      const straight = table(quad(s0, [(s0[0] + s2[0]) / 2, s0[1]], s2));
      const want = (straight.len * lenL) / lenU;
      const wide = l2[0] - l0[0];
      const bowl = (H) => table(cubic(l0, [l0[0] + 0.06 * wide, l0[1] + H], [l2[0] - 0.06 * wide, l0[1] + H], l2));
      let [lo, hi] = [0, 3000];
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (bowl(mid).len < want) lo = mid;
        else hi = mid;
      }
      const tab = bowl((lo + hi) / 2);
      const bottom = Math.max(...tab.pts.map((p) => p[1]));
      if (bottom + 12 > y + h)
        throw new Error(
          `VID.l7.bridge: the long road reaches ${Math.round(bottom - nest.y)} px below the road, but the box only has ${Math.round(y + h - 12 - nest.y)} (make the chord shorter or the box taller)`,
        );
      tabs = [straight, tab];
    }

    const svg = V.s("svg", {
      width: 936,
      height: 640,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    const ground = tabs.map((t) =>
      V.s("path", {
        d: pathOf(t),
        fill: "none",
        "stroke-width": "16",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        style: { stroke: "var(--line-2)" },
      }),
    );
    const trails = tabs.map((t) =>
      V.s("path", {
        d: pathOf(t),
        fill: "none",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        style: { stroke: "var(--blue)" },
      }),
    );
    const rings = Array.from({ length: 8 }, () =>
      V.s("circle", { r: 10, fill: "none", "stroke-width": "6", style: { stroke: "var(--blue)" } }),
    );
    const dots = Array.from({ length: lenU + lenL + 4 }, () =>
      V.s("circle", { r: dot, "stroke-width": "3", style: { fill: "var(--ink)", stroke: "var(--bg)" } }),
    );
    svg.append(
      ...ground,
      ...trails,
      ...rings,
      ...dots,
      L7.spot(nest.x, nest.y, "Nest", r),
      L7.spot(food.x, food.y, "Food", r),
    );
    parent.append(svg);

    const pt = (b, s) => {
      const q = atLen(tabs[b], s);
      return { x: q.x, y: q.y, a: q.a };
    };
    const lens = [lenU, lenL];
    function update(st = {}) {
      const state = st.sim ? L7.bridgeAt(st.sim, st.T || 0) : null;
      const tau = state ? [state.tauU, state.tauL] : st.tau || [0, 0];
      const tone = { U: "blue", L: "blue", ...(st.tone || {}) };
      const tk = clamp(st.trails ?? 1);
      const gk = clamp(st.ground ?? 1);
      tabs.forEach((t, b) => {
        const g = ground[b];
        g.style.strokeDasharray = `${f1(t.len * gk + 0.01)} ${f1(t.len * 2)}`;
        V.show(g, gk > 0.001 ? 1 : 0);
        const wd = L7.trailW(tau[b]) * tk;
        trails[b].style.stroke = L7.tone(tone[b ? "L" : "U"]).c;
        trails[b].setAttribute("stroke-width", f1(wd));
        V.show(trails[b], wd > 0.5 ? 1 : 0);
      });
      const ak = clamp(st.ants ?? 1);
      dots.forEach((d, i) => {
        const a = state && state.ants[i];
        if (!a || ak <= 0.001) return V.show(d, 0);
        const q = atLen(tabs[a.b], a.s);
        d.setAttribute("cx", f1(q.x));
        d.setAttribute("cy", f1(q.y));
        V.show(d, ak);
      });
      rings.forEach((rg, i) => {
        const l = state && state.landed[i];
        if (!l || ak <= 0.001) return V.show(rg, 0);
        const q = atLen(tabs[l.b], 1);
        rg.setAttribute("cx", f1(q.x));
        rg.setAttribute("cy", f1(q.y));
        rg.setAttribute("r", f1(12 + 26 * E.out(l.age)));
        V.show(rg, (1 - l.age) * ak);
      });
      V.show(svg, st.o ?? 1);
      return state;
    }
    return {
      el: svg,
      update,
      pt,
      apex: (b) => pt(b, 0.5),
      nest,
      food,
      r,
      chord,
      len: tabs.map((t) => t.len),
      speed: (b) => tabs[b].len / lens[b],
      box: { x, y, w, h },
    };
  }
  L7.bridge = bridge;
})();

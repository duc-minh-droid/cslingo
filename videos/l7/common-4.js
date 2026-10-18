/* Lecture 7 · Swarm intelligence: the FOUR-TOWN MAP and the TANK (VID.l7, short name L7). Needs l5/common.js, l7/common.js, common-2.js.
   Every call is PURE: call update()/set() every frame with everything to show; nothing is remembered.

   1. THE MAP  (towns A B on top, C D below; the lesson's roads, distances L7.MAP.dist and pheromone L7.MAP.tau0)
        const M = L7.map(parent, {x, y, w: 480, h: 300, r: 34});   x, y = top-left of the box, parent px (stage 936 x 640).
          Towns sit at A (r + 6, r + 6), B (w - r - 6, r + 6), C (0.27 w, h - r - 6), D (0.73 w, h - r - 6); with the defaults A (40, 40),
          B (440, 40), C (130, 260), D (350, 260) inside the box. Road pills (28 px text) sit half way along a road, but 0.36 of the way
          from the first town on A-D and B-C (0.55 on A-C and B-D), so the two diagonals never put their pills on top of each other.
        M.update({
          tau: {"A-B": 24, ...},     pheromone per road: sets the blue trail width (L7.trailW(tau, 0.5)). Missing roads count as 0.
          tone: {"A-C": "orange"},   recolour a road's trail (default "blue"); a toned road is at least 8 px wide so it always shows
          halo: {"A-C": "orange"},   a pale tinted band under a road (tone's tint colour), for "these are the roads in play"
          dim:  {"A-B": 0.4},        fade one road (trail, ground and halo)
          grow: 1,                   0..1 how much of every road is drawn (grows from the first town of each key) for a build-up
          pills: {"A-B": {text: "3", tone: "grey", solid: false, k: 1, o: 1, s: 1, x: 0, y: 0}, ...}   one pill per road; a road without
                 an entry has no pill. See M.distPills() and M.tauPills().
          towns: {A: {tone: "grey", solid: false, text: "A", ring: "orange" | null, ringK: 1, s: 1, o: 1, x: 0, y: 0}, ...}   towns not
                 listed are drawn plain grey; ring draws a coloured ring just outside the town; x, y offset it.
          ant: {x, y, r, s, o}       the ink ant (size 56, facing right): x, y = its CENTRE in parent px, r degrees, o 0 hides it
          o: 1                       opacity of the whole map
        })
        M.distPills(k = 1, tone = "grey") -> pills object with every road's distance;  M.tauPills(tau, {k, tone: "blue", only}) -> pills
            showing tau (integers as they are, others to 1 decimal; only = list of road keys to include)
        M.pt(town) -> {x, y} centre in parent px;  M.road(key) -> {a, b, A: {x, y}, B: {x, y}, len};  M.pillAt(key) -> {x, y} pill centre
        M.edgePt(a, b, f) -> {x, y, r} point at fraction f along the road from town a to town b (centre to centre), r = heading degrees
        M.antAt(a, b, f, hop = 0, lift = 0) -> {x, y, r} for M.update({ant}): the ant walking from a to b, `hop` px of arc (a hop), `lift` px
            above the road line (use 40 so a resting ant stands on top of its town and the town letter stays readable)
        M.towns, M.r, M.box {x, y, w, h}, M.svgTop (the svg above the pills: add your own overlays there), M.el (the road svg)
   2. THE TANK  (a bucket whose level is pheromone; lesson 7.3)
        const T = L7.tank(parent, {x, y, w: 150, h: 360, max: 24, tone: "blue"});
        T.set({v, o, k, tone, mark: 20 | null, markTone: "orange", x, y})   v = level (0..max, clipped), k 0..1 pops it in, mark draws a
            dashed level line (for the 4 / 0.2 = 20 level)
        T.yOf(v) -> parent y of level v;  T.inner -> {x, y, w, h} the inside;  T.el;  T.max */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const fmt = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1));

  function map(parent, o = {}) {
    const { x = 0, y = 0, w = 480, h = 300, r = 34 } = o;
    const pad = r + 6;
    const P = {
      A: [x + pad, y + pad],
      B: [x + w - pad, y + pad],
      C: [x + 0.27 * w, y + h - pad],
      D: [x + 0.73 * w, y + h - pad],
    };
    const at = { "A-B": 0.5, "A-C": 0.55, "A-D": 0.36, "B-C": 0.36, "B-D": 0.55, "C-D": 0.5 };
    const keys = L7.MAP.roads;
    const ends = (k) => [P[k[0]], P[k[2]]];
    const len = (k) => Math.hypot(ends(k)[1][0] - ends(k)[0][0], ends(k)[1][1] - ends(k)[0][1]);
    const grey = L7.tone("grey");

    const svg = V.s("svg", {
      width: 936,
      height: 640,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    const line = (k, wd, extra = {}) => {
      const [a, b] = ends(k);
      return V.s("path", {
        d: `M ${f1(a[0])} ${f1(a[1])} L ${f1(b[0])} ${f1(b[1])}`,
        fill: "none",
        "stroke-width": wd,
        "stroke-linecap": "round",
        ...extra,
      });
    };
    const ground = Object.fromEntries(keys.map((k) => [k, line(k, 14, { style: { stroke: "var(--line-2)" } })]));
    const halo = Object.fromEntries(keys.map((k) => [k, line(k, 30)]));
    const trail = Object.fromEntries(keys.map((k) => [k, line(k, 4)]));
    svg.append(...keys.map((k) => ground[k]), ...keys.map((k) => halo[k]), ...keys.map((k) => trail[k]));
    parent.append(svg);

    const pills = Object.fromEntries(
      keys.map((k) => {
        const [a, b] = ends(k);
        const f = at[k];
        const c = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
        const el = V.h("div", {
          class: "v-tag",
          style: { position: "static", minWidth: "64px", textAlign: "center", visibility: "hidden" },
        });
        parent.append(V.h("div", { style: { ...L7.abs(c[0] - 100, c[1] - 30, 200, 60), ...L7.flex } }, el));
        return [k, { el, c }];
      }),
    );

    const top = V.s("svg", {
      width: 936,
      height: 640,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    const towns = Object.fromEntries(
      [..."ABCD"].map((n) => {
        const [cx, cy] = P[n];
        const ring = V.s("circle", { cx: f1(cx), cy: f1(cy), r: r + 9, fill: "none", "stroke-width": "6" });
        const lip = V.s("circle", { cx: f1(cx), cy: f1(cy + 5), r, "stroke-width": "4" });
        const disc = V.s("circle", { cx: f1(cx), cy: f1(cy), r, "stroke-width": "4" });
        const txt = V.s("text", {
          x: f1(cx),
          y: f1(cy),
          dy: ".36em",
          "text-anchor": "middle",
          style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: "36px" },
          text: n,
        });
        const g = V.s("g", {}, ring, lip, disc, txt);
        top.append(g);
        return [n, { g, ring, lip, disc, txt }];
      }),
    );
    const antG = L7.ant(0, 0, 56);
    top.append(antG);
    parent.append(top);

    function update(st = {}) {
      const tau = st.tau || {};
      const grow = clamp(st.grow ?? 1);
      keys.forEach((k) => {
        const dim = st.dim && st.dim[k] != null ? st.dim[k] : 1;
        const tone = st.tone && st.tone[k];
        const wd = tau[k] > 0 || tone ? Math.max(L7.trailW(tau[k] || 0, 0.5), tone ? 8 : 0) : 0;
        const L = len(k);
        const dash = `${f1(L * grow + 0.01)} ${f1(L * 2)}`;
        ground[k].style.strokeDasharray = trail[k].style.strokeDasharray = halo[k].style.strokeDasharray = dash;
        trail[k].setAttribute("stroke-width", f1(wd));
        trail[k].style.stroke = L7.tone(tone || "blue").c;
        V.show(trail[k], wd > 0.5 && grow > 0.04 ? dim : 0); // no round-capped dot while a road has barely started
        V.show(ground[k], grow > 0.02 ? dim : 0);
        const hl = st.halo && st.halo[k];
        halo[k].setAttribute("stroke-width", f1(wd + 20));
        if (hl) halo[k].style.stroke = L7.tone(hl).dim;
        V.show(halo[k], hl && grow > 0.04 ? dim : 0);
      });
      keys.forEach((k) => {
        const p = st.pills && st.pills[k];
        const { el } = pills[k];
        if (!p) return V.show(el, 0);
        const tone = p.tone || "grey";
        const cls = `v-tag c-${tone}${p.solid ? " solid" : ""}`;
        if (el.className !== cls) el.className = cls;
        if (el.textContent !== String(p.text)) el.textContent = String(p.text);
        const kk = clamp(p.k ?? 1);
        V.place(el, {
          x: p.x || 0,
          y: p.y || 0,
          s: (p.s ?? 1) * (0.8 + 0.2 * E.pop(kk)),
          o: Math.min(1, kk * 4) * (p.o ?? 1),
        });
      });
      [..."ABCD"].forEach((n) => {
        const t = towns[n];
        const s = (st.towns && st.towns[n]) || {};
        const tone = s.tone ? L7.tone(s.tone) : grey;
        const [lipC, faceC, strokeC] = s.solid
          ? [tone.lip, tone.c, tone.lip]
          : s.tone
            ? [tone.edge, tone.dim, tone.edge]
            : [grey.edge, "var(--panel)", grey.edge];
        [t.lip.style.fill, t.lip.style.stroke] = [lipC, lipC];
        [t.disc.style.fill, t.disc.style.stroke] = [faceC, strokeC];
        t.txt.style.fill = s.solid ? tone.on : "var(--ink)";
        if (s.text != null && t.txt.textContent !== s.text) t.txt.textContent = s.text;
        else if (s.text == null && t.txt.textContent !== n) t.txt.textContent = n;
        const rk = clamp(s.ringK ?? (s.ring ? 1 : 0));
        t.ring.style.stroke = s.ring ? L7.tone(s.ring).c : "";
        V.show(t.ring, s.ring ? rk : 0);
        V.place(t.g, { x: s.x || 0, y: s.y || 0, s: s.s ?? 1, o: s.o ?? 1 });
      });
      const a = st.ant;
      if (a) V.place(antG, { x: a.x, y: a.y, r: a.r || 0, s: a.s ?? 1, o: a.o ?? 1 });
      else V.show(antG, 0);
      V.show(svg, st.o ?? 1);
      V.show(top, st.o ?? 1);
    }
    const edgePt = (a, b, f) => {
      const [A, B] = [P[a], P[b]];
      return {
        x: A[0] + (B[0] - A[0]) * f,
        y: A[1] + (B[1] - A[1]) * f,
        r: (Math.atan2(B[1] - A[1], B[0] - A[0]) * 180) / Math.PI,
      };
    };
    return {
      el: svg,
      svgTop: top,
      update,
      towns: P,
      r,
      box: { x, y, w, h },
      pt: (n) => ({ x: P[n][0], y: P[n][1] }),
      road: (k) => ({
        a: k[0],
        b: k[2],
        A: { x: ends(k)[0][0], y: ends(k)[0][1] },
        B: { x: ends(k)[1][0], y: ends(k)[1][1] },
        len: len(k),
      }),
      pillAt: (k) => ({ x: pills[k].c[0], y: pills[k].c[1] }),
      edgePt,
      antAt: (a, b, f, hop = 0, lift = 0) => {
        const q = edgePt(a, b, f);
        return { x: q.x, y: q.y - lift - hop * Math.sin(Math.PI * clamp(f)), r: q.r };
      },
      distPills: (k = 1, tone = "grey") =>
        Object.fromEntries(keys.map((key) => [key, { text: String(L7.MAP.dist[key]), tone, k }])),
      tauPills: (tau, opt = {}) =>
        Object.fromEntries(
          (opt.only || keys).map((key) => [
            key,
            { text: fmt(tau[key] || 0), tone: opt.tone || "blue", k: opt.k ?? 1, o: opt.o ?? 1 },
          ]),
        ),
    };
  }

  function tank(parent, o = {}) {
    const { x = 0, y = 0, w = 150, h = 360, max = 24, tone: base = "blue" } = o;
    const el = V.h("div", {
      class: `v-card plain c-${base}`,
      style: { ...L7.abs(x, y, w, h), borderRadius: "22px", overflow: "hidden" },
    });
    const inner = { x: x + 3, y: y + 3, w: w - 6, h: h - 6 };
    const fill = V.h("div", {
      style: {
        position: "absolute",
        left: "0",
        right: "0",
        bottom: "0",
        height: "0",
        background: "var(--c)",
        borderTop: "5px solid var(--c-lip)",
      },
    });
    const mark = V.h("div", {
      style: {
        position: "absolute",
        left: "0",
        right: "0",
        height: "0",
        borderTop: "5px dashed var(--ink)",
        visibility: "hidden",
      },
    });
    el.append(fill, mark);
    parent.append(el);
    return {
      el,
      max,
      inner,
      yOf: (v) => inner.y + inner.h * (1 - clamp(v / max)),
      set(st = {}) {
        const cls = `v-card plain c-${st.tone || base}`;
        if (el.className !== cls) el.className = cls;
        const lvl = clamp((st.v || 0) / max);
        fill.style.height = lvl > 0.001 ? `${f1(Math.max(8, lvl * inner.h))}px` : "0";
        fill.style.visibility = lvl > 0.001 ? "" : "hidden";
        if (st.mark != null) {
          mark.style.bottom = `${f1(clamp(st.mark / max) * inner.h)}px`;
          mark.style.borderTopColor = L7.tone(st.markTone || "orange").c;
          mark.style.visibility = "";
        } else mark.style.visibility = "hidden";
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: 0.9 + 0.1 * E.pop(k), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  }
  Object.assign(L7, { map, tank, fmt });
})();

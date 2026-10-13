/* Algorithms Phase 3 · scene 09-valley: Nelder-Mead crawls down Rosenbrock's curved valley, f = 100 (y - x^2)^2 + (1 - x)^2.
   The REAL run of the lesson (a3-nm-stop, A3.NM_ROS, asserted in common-2.js): 84 rounds, 198 evaluations, 29 reflect, 19 expand,
   36 contract, 0 shrink, from (-1, 1) to (1, 1). The triangle stretches along the valley when moves work and squeezes when they do
   not; only comparisons of f are used. The triangle is only 10-30 px wide on the 936 px map, so an orange-edged ZOOM card (lower
   right) always draws the current triangle at a constant size (corner colours by rank: green best, blue good, red worst) and a
   size meter (lower left) shows how big it really is: the shape and the size changes are both visible. The grey contour map, the blue
   trail of the triangle's middle, the orange finder ring, two stat cards and the move chips with live counts complete the picture.
   The run is played through a smooth time warp (monotone cubic through keyframes) so the busy stretches get more time.
   Every number comes from A3.NM_ROS; update(t) is a pure function of t. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const { ease: E, ramp, flash, clamp } = V;

  const RUN0 = 2.8; // the run starts here ...
  const RUN1 = 11.0; // ... and the last round ends here
  // [seconds into the run, round u]: busy stretches (the stretches, the squeeze) get more time per round
  const KEYS = [
    [0, 0],
    [0.4, 5],
    [2.0, 14], // rounds 6-14: five expansions, the triangle becomes a long thin sliver, then fat
    [2.8, 28],
    [5.1, 35.5], // rounds 29-35: seven expansions in a row (the size grows 11 times)
    [6.4, 72],
    [8.2, 84], // the squeeze: the triangle shrinks to 0.0014
  ];
  const STRETCH = [
    [6, 14],
    [28, 35.5],
  ];
  const SQUEEZE_FROM = 72; // the last rounds: a tiny triangle
  const METER_MAX = 0.35; // the size meter spans 0 .. 0.35 (the biggest triangle is 0.33)

  /** monotone cubic (Fritsch-Butland) through the keys: a smooth, never-backwards map from run time to round number */
  function warp(keys) {
    const n = keys.length;
    const h = keys.slice(1).map((k, i) => k[0] - keys[i][0]);
    const d = keys.slice(1).map((k, i) => (k[1] - keys[i][1]) / h[i]);
    const m = keys.map((k, i) => {
      if (i === 0 || i === n - 1) return 0;
      const [w1, w2] = [2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]];
      return (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    });
    return (s) => {
      if (s <= 0) return 0;
      if (s >= keys[n - 1][0]) return keys[n - 1][1];
      let i = 0;
      while (s > keys[i + 1][0]) i++;
      const x = (s - keys[i][0]) / h[i];
      const [x2, x3] = [x * x, x * x * x];
      return (
        (2 * x3 - 3 * x2 + 1) * keys[i][1] +
        (x3 - 2 * x2 + x) * h[i] * m[i] +
        (-2 * x3 + 3 * x2) * keys[i + 1][1] +
        (x3 - x2) * h[i] * m[i + 1]
      );
    };
  }

  /** drop the loose little level-curve fragments the marching squares leave in the narrow valley floor */
  function tidy(levels, minSegs) {
    const key = (x, y) => `${Math.round(x * 1e6)},${Math.round(y * 1e6)}`;
    return levels.map((lv) => {
      const parent = lv.segs.map((_, i) => i);
      const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
      const seen = new Map();
      lv.segs.forEach(([ax, ay, bx, by], i) => {
        [key(ax, ay), key(bx, by)].forEach((k) => {
          if (seen.has(k)) parent[find(i)] = find(seen.get(k));
          else seen.set(k, i);
        });
      });
      const size = new Map();
      lv.segs.forEach((_, i) => size.set(find(i), (size.get(find(i)) || 0) + 1));
      return { ...lv, segs: lv.segs.filter((_, i) => size.get(find(i)) >= minSegs) };
    });
  }

  const K = (t, a, d) => ramp(t, a, a + d, E.lin); // linear 0..1 progress of t over [a, a + d]
  const pk = (k) => Math.min(1, k * 4); // opacity that comes in with a pop
  const pop = (k) => 0.8 + 0.2 * E.pop(k);
  const abs = (x, y, w, h) => ({
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
  });

  V.scene({
    kicker: "NELDER–MEAD",
    title: ["It crawls down", "a curved valley"],
    dur: 14,
    caps: [
      [0.4, 2.8, "Real problems have curved valleys, not bowls."],
      [3.0, 5.4, "Moves work? The triangle stretches."],
      [5.6, 8.5, "More good moves: it stretches along the valley."],
      [8.8, 11.3, "Near the end it squeezes to a tiny triangle."],
      [11.5, 13.6, "No derivatives needed, just comparisons."],
    ],
    build(stage) {
      // ---------- the facts (asserted) ----------
      const run = A3.NM_ROS;
      const { need } = A3;
      const edge = (L) =>
        Math.max(...[0, 1, 2].map((i) => Math.hypot(L[i][0] - L[(i + 1) % 3][0], L[i][1] - L[(i + 1) % 3][1])));
      const c = run.counts[run.it];
      need(run.it === 84 && run.ev === 198, "scene 9: 84 rounds, 198 evaluations");
      need(c.reflect === 29 && c.expand === 19 && c.contract === 36 && c.shrink === 0, "scene 9: move counts");
      need(
        run.rounds.slice(28, 35).every((r) => r.op === "expand"),
        "scene 9: rounds 29-35 are seven expansions in a row",
      );
      need(
        run.rounds.slice(6, 13).filter((r) => r.op === "expand").length === 5 && edge(run.slots[12]) > 0.3,
        "scene 9: rounds 7-13 grow the triangle past 0.3",
      );
      need(edge(run.slots[0]) < 0.15 && edge(run.slots[75]) < 0.04 && edge(run.slots[84]) < 0.002, "scene 9: sizes");
      need(edge(run.slots[35]) > 10 * edge(run.slots[28]), "scene 9: the seven expansions grow the triangle 10 times");
      need(Math.hypot(run.final.p[0] - 1, run.final.p[1] - 1) < 1e-3, "scene 9: the run ends at the minimum (1, 1)");
      const uAt = warp(KEYS);
      need(KEYS[KEYS.length - 1][0] === RUN1 - RUN0 && KEYS[KEYS.length - 1][1] === run.it, "scene 9: time warp keys");

      // ---------- the plot ----------
      const P = A3.plot(stage, {
        x: 0,
        y: 0,
        w: 936,
        h: 540,
        view: [-1.6, 1.6, -0.4, 2.2],
        equal: true,
        grid: false,
        pad: { l: 12, r: 12, t: 12, b: 12 },
      });
      const levels = tidy(A3.contours(A3.ROSEN, [-3, 3, -2, 4], A3.ROS_LEVELS, { log: true, n: 360 }), 14);
      const rings = P.contours(levels, { w: 3 });
      const tri = P.poly({ tone: "purple", w: 4 });
      const trail = P.path({ tone: "blue", w: 5 });
      const star = A3.star(P.over, { size: 48 });
      const ring = P.ring({ tone: "orange", r: 32, w: 5 });
      const dots = [0, 1, 2].map(() => P.dot({ tone: "blue", r: 11 }));
      const [sx, sy] = [P.px(1), P.py(1)];
      const startTag = A3.tag(P.html, { anchor: "m", text: "start", tone: "grey" });
      const minTag = A3.tag(P.html, { anchor: "m", text: "minimum", tone: "grey" });
      const rounds = A3.stat(stage, { x: 258, y: 24, w: 200, label: "rounds" });
      const evals = A3.stat(stage, { x: 478, y: 24, w: 220, label: "evaluations" });
      const mv = A3.moves(stage, { x: 0, y: 560, w: 936, h: 60 });

      // ---------- the zoom card (lower right): the current triangle at a constant size ----------
      const Z = { x: 652, y: 292, w: 272, h: 236 };
      const zCard = V.h("div", { class: "v-card plain c-orange", style: abs(Z.x, Z.y, Z.w, Z.h) });
      stage.append(zCard);
      const Q = A3.plot(stage, {
        x: Z.x,
        y: Z.y,
        w: Z.w,
        h: Z.h,
        frame: false,
        view: [-1, 1, -1, 1],
        equal: true,
        grid: false,
        pad: { l: 14, r: 14, t: 62, b: 14 },
      });
      const zTri = Q.simplex({ tone: "purple" });
      const zoomTag = A3.tag(Q.html, { x: Z.x + 14, y: Z.y + 12, anchor: "l", text: "zoomed in", tone: "grey" });
      const moveTag = A3.tag(Q.html, { x: Z.x + 14, y: Z.y + 12, anchor: "l", text: "stretch", tone: "purple" });
      const squeezeTag = A3.tag(Q.html, { x: Z.x + 14, y: Z.y + 12, anchor: "l", text: "squeeze", tone: "orange" });

      // ---------- the size meter (lower left): how big the triangle really is ----------
      const M = { x: 24, y: 432, w: 276, h: 96 };
      const mCard = V.h("div", { class: "v-card plain", style: abs(M.x, M.y, M.w, M.h) });
      const mLab = V.h("div", {
        class: "v-text dim",
        text: "size",
        style: { left: "16px", top: "6px", fontSize: "28px" },
      });
      const mVal = V.h("div", {
        class: "v-text big",
        style: { left: "116px", top: "2px", width: "140px", textAlign: "right", fontSize: "34px" },
      });
      const mTrack = V.h("div", {
        style: {
          ...abs(16, 58, 240, 20),
          borderRadius: "10px",
          background: "var(--panel-2)",
          border: "3px solid var(--line-2)",
          boxSizing: "border-box",
        },
      });
      const mBar = V.h("div", {
        class: "c-purple",
        style: {
          ...abs(16, 58, 240, 20),
          borderRadius: "10px",
          background: "var(--c)",
          border: "3px solid var(--c-lip)",
          boxSizing: "border-box",
          transformOrigin: "0 50%",
        },
      });
      mCard.append(mLab, mVal, mTrack, mBar);
      stage.append(mCard);
      const sizeText = (v) => (v >= 0.1 ? v.toFixed(2) : v >= 0.01 ? v.toFixed(3) : v.toFixed(4));

      const found = A3.sticker(stage, {
        x: 640,
        y: 380,
        w: 284,
        h: 64,
        text: "minimum found",
        tone: "green",
        icon: "tick",
      });

      return (t) => {
        // ----- the run: round number u -> the three corners, the middle, the counts -----
        const u = uAt(t - RUN0);
        const s = A3.nmAt(run, u, E.lin);
        const px = s.slots.map(([x, y]) => P.pt(x, y));
        const mid = P.pt(s.centre[0], s.centre[1]);
        const ePx = edge(px); // longest side, px
        const dotR = clamp(0.28 * ePx, 4.5, 11);
        const reach = Math.max(...px.map((p) => Math.hypot(p[0] - mid[0], p[1] - mid[1])));
        const size = edge(s.slots); // longest side, data units
        const end = t >= RUN1;
        const kStretch = Math.max(
          ...STRETCH.map(([a, b]) => ramp(u, a - 0.4, a + 0.4, E.lin) * (1 - ramp(u, b, b + 0.8, E.lin))),
        );
        const kSqueeze = ramp(u, SQUEEZE_FROM - 0.4, SQUEEZE_FROM + 0.6, E.lin) * (1 - K(t, RUN1 - 0.4, 0.4));
        const stretching = STRETCH.some(([a, b]) => u >= a && u <= b);

        // ----- the card, the rings of the valley, the minimum -----
        P.set({ o: ramp(t, 0, 0.4, E.lin) });
        rings.set({ o: ramp(t, 0.4, 1.4, E.lin) });
        const ks = K(t, 1.2, 0.4);
        star.set({ x: sx, y: sy, s: E.pop(ks) * (1 + 0.25 * flash(t, RUN1, RUN1 + 0.5)), o: pk(ks) });
        const km = K(t, 1.4, 0.3);
        minTag.set({ s: pop(km), o: pk(km), dx: sx + 124, dy: sy - 4 });

        // ----- the start: three corners pop 0.15 s apart, then the triangle and the finder ring -----
        const popK = (i) => K(t, 1.6 + 0.15 * i, 0.4);
        tri.set({ pts: s.slots, o: K(t, 1.95, 0.35) });
        trail.set({ pts: s.centreTrail, o: K(t, RUN0, 0.3) });
        dots.forEach((d, i) => {
          d.set({
            x: s.slots[i][0],
            y: s.slots[i][1],
            tone: "blue",
            s: (dotR / 11) * E.pop(popK(i)),
            o: pk(popK(i)),
          });
        });
        const kr = K(t, 1.9, 0.4);
        const pulse = 1 + 0.5 * flash(t, 2.1, 2.8) + 0.3 * flash(t, RUN1, RUN1 + 0.5);
        ring.set({
          x: s.centre[0],
          y: s.centre[1],
          r: Math.max(32, reach + dotR + 14) * pulse * (0.8 + 0.2 * E.pop(kr)),
          tone: end ? "green" : "orange",
          o: pk(kr),
        });
        const kst = K(t, 1.9, 0.35);
        startTag.set({ s: pop(kst), o: pk(kst) * (1 - K(t, 3.6, 0.4)), dx: P.px(-1) - 122, dy: P.py(1) + 2 });

        // ----- the zoom card: the same triangle, always the same size on screen -----
        const xs = s.slots.map((p) => p[0]);
        const ys = s.slots.map((p) => p[1]);
        const [cx, cy] = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
        const [ex, ey] = [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
        const sc = Math.min(Q.area.w / (1.5 * ex + 1e-9), Q.area.h / (1.5 * ey + 1e-9));
        Q.view([
          cx - Q.area.w / (2 * sc),
          cx + Q.area.w / (2 * sc),
          cy - Q.area.h / (2 * sc),
          cy + Q.area.h / (2 * sc),
        ]);
        const kz = K(t, 2.0, 0.4) * (1 - K(t, RUN1 + 0.1, 0.3));
        const zS = 0.85 + 0.15 * E.pop(K(t, 2.0, 0.5));
        V.place(zCard, { o: pk(kz), s: zS });
        Q.set({ o: pk(kz), s: zS });
        const f = s.slots.map((p) => A3.ROSEN(p));
        const order = [0, 1, 2].sort((a, b) => f[a] - f[b]);
        const tones = [];
        ["green", "blue", "red"].forEach((tn, rank) => (tones[order[rank]] = tn));
        zTri.set({ pts: s.slots, tones, o: 1 });
        const kInTag = (1 - kStretch) * (1 - kSqueeze);
        zoomTag.set({ o: kInTag, s: pop(K(t, 2.0, 0.4)) });
        moveTag.set({ o: pk(kStretch) * (1 - kSqueeze), s: pop(kStretch) });
        squeezeTag.set({ o: pk(kSqueeze), s: pop(kSqueeze) });

        // ----- the size meter -----
        const km2 = K(t, 2.2, 0.4);
        V.place(mCard, { o: pk(km2), s: pop(km2) });
        mVal.textContent = sizeText(size);
        mBar.style.transform = `scaleX(${Math.max(0.03, Math.min(1, size / METER_MAX)).toFixed(4)})`;

        // ----- the two stats and the four move chips (live counts), lit while stretching / squeezing -----
        const kStat = (d) => K(t, 2.4 + d, 0.4);
        rounds.set({ text: String(s.it), s: pop(kStat(0)), o: pk(kStat(0)) });
        evals.set({ text: String(run.evAt[s.it]), s: pop(kStat(0.15)), o: pk(kStat(0.15)) });
        mv.set({
          counts: s.counts,
          active: end ? null : kSqueeze > 0.5 ? "in" : stretching ? "expand" : null,
          pop: K(t, 2.4, 0.4),
        });

        // ----- the end: minimum found (the sticker takes the zoom card's place) -----
        found.set({ k: K(t, RUN1 + 0.3, 0.4), o: 1 });
      };
    },
  });
})();

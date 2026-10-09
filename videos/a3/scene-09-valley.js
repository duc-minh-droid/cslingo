/* Algorithms Phase 3 · scene 09-valley: Nelder-Mead crawls down Rosenbrock's curved valley, f = 100 (y - x^2)^2 + (1 - x)^2.
   The REAL run of the lesson (a3-nm-stop, A3.NM_ROS, asserted in common-2.js): 84 rounds, 198 evaluations, 29 reflect, 19 expand,
   36 contract, 0 shrink, from (-1, 1) to (1, 1). The triangle stretches along the valley when moves work and squeezes when they do
   not; only comparisons of f are used. The picture is the grey contour map, the blue trail of the triangle's middle, the triangle
   itself with an orange finder ring (so even the tiny triangle is easy to find), two stat cards and the move chips with live counts.
   The run is played through a smooth time warp (monotone cubic through keyframes) so the busy stretches get more time.
   Every number comes from A3.NM_ROS; update(t) is a pure function of t. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const { ease: E, ramp, flash, lerp, clamp } = V;

  const RUN0 = 3.0; // the run starts here ...
  const RUN1 = 10.4; // ... and the last round ends here
  // [seconds into the run, round u]: busy stretches (the stretch, the squeeze) get more time per round
  const KEYS = [
    [0, 0],
    [0.9, 7],
    [1.7, 14],
    [2.35, 28],
    [3.45, 36],
    [5.2, 66],
    [6.3, 76],
    [7.4, 84],
  ];
  const STRETCH = [
    [6.2, 13.6], // rounds 7-13: the first growth
    [28, 35.2], // rounds 29-35: seven expansions in a row
  ];
  const SQUEEZE_FROM = 72; // the last rounds: a tiny triangle

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

  const K = (t, a, d) => ramp(t, a, a + d, E.lin); // linear 0..1 progress of t over [a, a + d]
  const pk = (k) => Math.min(1, k * 4); // opacity that comes in with a pop
  const pop = (k) => 0.8 + 0.2 * E.pop(k);

  V.scene({
    kicker: "NELDER–MEAD",
    title: ["It crawls down", "a curved valley"],
    dur: 13,
    caps: [
      [0.4, 3.0, "Real problems have curved valleys, not simple bowls."],
      [3.2, 6.4, "The triangle stretches along the valley."],
      [6.6, 9.8, "Near the bottom it shrinks to a tiny triangle."],
      [10.0, 12.4, "No derivatives needed, just comparisons."],
    ],
    build(stage) {
      // ---------- the facts (asserted) ----------
      const run = A3.NM_ROS;
      const { need } = A3;
      const edge = (L) => Math.max(...[0, 1, 2].map((i) => Math.hypot(L[i][0] - L[(i + 1) % 3][0], L[i][1] - L[(i + 1) % 3][1])));
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
      need(
        Math.hypot(run.final.p[0] - 1, run.final.p[1] - 1) < 1e-3,
        "scene 9: the run ends at the minimum (1, 1)",
      );
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
      const rings = P.contours(A3.contours(A3.ROSEN, [-3, 3, -2, 4], A3.ROS_LEVELS, { log: true, n: 360 }), { w: 3 });
      const tri = P.poly({ tone: "purple", w: 4 });
      const trail = P.path({ tone: "blue", w: 5 });
      const star = A3.star(P.over, { size: 48 });
      const ring = P.ring({ tone: "orange", r: 32, w: 5 });
      const dots = [0, 1, 2].map(() => P.dot({ tone: "blue", r: 11 }));
      const [sx, sy] = [P.px(1), P.py(1)];
      const startTag = A3.tag(P.html, { anchor: "m", text: "start", tone: "grey" });
      const minTag = A3.tag(P.html, { anchor: "m", text: "minimum", tone: "grey" });
      const moveTag = A3.tag(P.html, { anchor: "m", text: "stretch", tone: "purple" });
      const squeezeTag = A3.tag(P.html, { anchor: "m", text: "squeeze", tone: "orange" });
      const rounds = A3.stat(stage, { x: 258, y: 24, w: 200, label: "rounds" });
      const evals = A3.stat(stage, { x: 478, y: 24, w: 220, label: "evaluations" });
      const mv = A3.moves(stage, { x: 0, y: 560, w: 936, h: 60 });
      const found = A3.sticker(stage, { x: 570, y: 440, w: 330, h: 64, text: "minimum found", tone: "green", icon: "tick" });

      return (t) => {
        // ----- the run: round number u -> the three corners, the middle, the counts -----
        const u = uAt(t - RUN0);
        const s = A3.nmAt(run, u, E.lin);
        const px = s.slots.map(([x, y]) => P.pt(x, y));
        const mid = P.pt(s.centre[0], s.centre[1]);
        const ePx = edge(px); // longest side, px
        const dotR = clamp(0.28 * ePx, 4.5, 11);
        const reach = Math.max(...px.map((p) => Math.hypot(p[0] - mid[0], p[1] - mid[1])));
        const stretching = STRETCH.some(([a, b]) => u >= a && u <= b);
        const squeezing = u >= SQUEEZE_FROM;
        const kStretch = Math.max(...STRETCH.map(([a, b]) => ramp(u, a - 0.4, a + 0.4, E.lin) * (1 - ramp(u, b, b + 0.8, E.lin))));
        const kSqueeze = ramp(u, SQUEEZE_FROM - 0.4, SQUEEZE_FROM + 0.6, E.lin);
        const end = t >= RUN1;

        // ----- the card, the rings of the valley, the minimum -----
        P.set({ o: ramp(t, 0, 0.4, E.lin) });
        rings.set({ o: ramp(t, 0.4, 1.4, E.lin) });
        const ks = K(t, 1.2, 0.4);
        star.set({ x: sx, y: sy, s: E.pop(ks) * (1 + 0.25 * flash(t, RUN1, RUN1 + 0.5)), o: pk(ks) });
        const km = K(t, 1.4, 0.3);
        minTag.set({ s: pop(km), o: pk(km), dx: sx + 108, dy: sy - 4 });

        // ----- the start: three corners pop 0.15 s apart, then the triangle and the finder ring -----
        const popK = (i) => K(t, 1.6 + 0.15 * i, 0.4);
        const kTri = K(t, 1.95, 0.35);
        tri.set({
          pts: s.slots,
          o: kTri,
          fillO: 1,
          strokeO: 1,
        });
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
        startTag.set({
          s: pop(K(t, 1.9, 0.35)),
          o: pk(K(t, 1.9, 0.35)) * (1 - K(t, 3.6, 0.4)),
          dx: P.px(-1),
          dy: P.py(1) - 78,
        });

        // ----- tags that ride beside the triangle while it stretches, then squeezes -----
        const mx = clamp(mid[0] + 96, 120, 810);
        moveTag.set({
          s: pop(kStretch),
          o: pk(kStretch) * (1 - kSqueeze),
          dx: mx,
          dy: mid[1] - 58,
        });
        squeezeTag.set({
          s: pop(kSqueeze),
          o: pk(kSqueeze),
          dx: mid[0] - 118,
          dy: mid[1] - 70,
        });

        // ----- the two stats and the four move chips (live counts), lit while stretching / squeezing -----
        const kStat = (d) => K(t, 2.4 + d, 0.4);
        rounds.set({ text: String(s.it), s: pop(kStat(0)), o: pk(kStat(0)) });
        evals.set({ text: String(run.evAt[s.it]), s: pop(kStat(0.15)), o: pk(kStat(0.15)) });
        mv.set({
          counts: s.counts,
          active: end ? null : squeezing ? "in" : stretching ? "expand" : null,
          pop: K(t, 2.4, 0.4),
        });

        // ----- the end: minimum found -----
        const kf = K(t, RUN1 + 0.2, 0.4);
        found.set({ k: kf, o: 1 });
        // (lerp keeps its place in the helpers for the final hold)
        void lerp;
      };
    },
  });
})();

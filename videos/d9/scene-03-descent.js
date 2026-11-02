/* Lecture 9 (ds-9) · scene 3 (GRADIENT DESCENT): the slope of the cost where the ball stands shows which way is uphill, and
   gradient descent steps against it by learning rate × slope: new w = w − 0.25 × slope (lesson 9.1 steps 2-3). From w = 10 the
   ball goes 10, 7, 5.5, 4.75, 4.375: the slope halves, so each step halves, and so does the distance to the bottom w = 4.
   Every number comes from D9.DESC. Colours: blue = the ball and the weights, orange = the slope (dashed tangent), the step
   arrow and the sum, red = the distance still to go, green = the best spot, grey = the bowl.
   Layout: the update sum is too wide for the right column (D4.tagW > 276 px), so it and the slope tag sit in a strip above
   the plot, and 'nearly 4' goes under the column of weights (by the ball it would cover the distances).
   Story (local seconds): 0.2 plot; 0.5 ball at w = 10; 0.9 tangent and 'slope 12'; steps at 2.4, 4.6, 6.1, 7.4 (sum + arrow,
   then the hop, then the next 'w = …' tag and the re-aimed tangent); 8.2-9.1 the four distances; 10.0 'nearly 4'. Hold to 12. */
(function () {
  const V = window.VID;
  const D9 = V.d9;
  const D4 = V.d4;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const G = D9.DESC;
  const fm = (v) => D9.fm(v, 3);
  const T0 = [2.4, 4.6, 6.1, 7.4];
  const DIST = [8.2, 8.5, 8.8, 9.1];
  const sum = (j) => `${fm(G.ws[j])} − ${fm(G.eta)} × ${fm(G.slopes[j])} = ${fm(G.ws[j + 1])}`;
  D9.same("descent scene: four steps, four slopes", [T0.length, G.slopes.length, G.ws.length], [4, 4, 5]);

  // hops completed by t, and the ball's place (w, cost, arc 0..1) as a pure function of t
  const done = (t) => T0.filter((t0) => t >= t0 + 1.0).length;
  const ball = (t) => {
    for (let j = 0; j < T0.length; j++) {
      const k = ramp(t, T0[j] + 0.5, T0[j] + 1.0, E.lin);
      if (k > 0 && k < 1) {
        const w = lerp(G.ws[j], G.ws[j + 1], E.inOut(k));
        return { w, arc: Math.sin(Math.PI * k) };
      }
    }
    return { w: G.ws[done(t)], arc: 0 };
  };

  V.scene({
    kicker: "GRADIENT DESCENT",
    title: ["Step downhill,", "against the slope"],
    dur: 12,
    caps: [
      [1, 2.6, `The slope shows which way is uphill: ${fm(G.slopes[0])} at w = ${fm(G.ws[0])}.`],
      [3, 4.8, `Step against it: ${sum(0)}.`],
      [5, 7.6, "The slope is smaller now, so each step is smaller too."],
      [8.5, 9.8, `${G.ws.map(fm).join(", ")}: the distance halves.`],
      [10, 11.7, "The ball settles at the bottom, w = 4."],
    ],
    build(stage) {
      const p = D9.plot(stage, {
        x: 12,
        y: 84,
        w: 620,
        h: 544,
        xr: [0, 11],
        yr: [0, 40],
        xticks: [0, 2, 4, 6, 8, 10],
        yticks: [0, 20, 40],
        xlab: "weight w",
        ylab: "cost",
      });
      const sx = p.lx(1) - p.lx(0);
      const sy = p.ly(0) - p.ly(1);
      // the tangent at w: L px down the slope, R px up it (screen lengths, so it reads the same at every step)
      const tangent = (w, L, R) => {
        const s = D9.slope1(w);
        const len = Math.hypot(sx, s * sy);
        const ux = sx / len;
        const c = D9.cost1(w);
        return { a: [w - (L * ux) / sx, c - (L * ux * s) / sx], b: [w + (R * ux) / sx, c + (R * ux * s) / sx] };
      };
      const ws = G.ws.map((w, i) =>
        D4.tag(stage, { x: 786, y: 136 + 92 * i, text: `w = ${fm(w)}`, tone: "blue", fs: 30 }),
      );
      const step = D4.tag(stage, { x: 346, y: 38, text: sum(0), tone: "orange", fs: 28 });
      const slope = D4.tag(stage, { x: 786, y: 38, text: "", tone: "orange", fs: 28 });
      const near = D4.tag(stage, { x: 786, y: 136 + 92 * 4 + 76, text: "nearly 4", tone: "green", solid: true });

      return (t) => {
        const n = done(t);
        const { w, arc } = ball(t);
        const c = D9.cost1(w) + (arc * 18) / sy;
        const kBall = ramp(t, 0.5, 0.9, E.lin);
        const kEnd = ramp(t, 10.0, 10.4, E.lin);

        // the tangent at the ball's resting place n (none after the last hop)
        const tStart = n === 0 ? 0.9 : T0[n - 1] + 1.0;
        const kTan = n < T0.length ? ramp(t, tStart, tStart + 0.4, E.out) : 0;
        const oTan = n < T0.length ? 1 - ramp(t, T0[n] + 0.5, T0[n] + 0.7, E.lin) : 0;
        const L = 260 * 0.82 ** n;
        const tg = tangent(G.ws[n], L, L * 0.58);

        const segs = [];
        if (kTan > 0 && oTan > 0) segs.push({ ...tg, tone: "orange", dash: true, w: 5, k: kTan, o: oTan });
        // the current step arrow: drawn at the ball's height, it stays until the next one starts
        T0.forEach((t0, j) => {
          const k = ramp(t, t0, t0 + 0.5, E.out);
          const next = j + 1 < T0.length ? T0[j + 1] : 8.4;
          const o = 1 - ramp(t, next, next + 0.3, E.lin);
          const cj = G.costs[j];
          if (k > 0 && o > 0) segs.push({ a: [G.ws[j], cj], b: [G.ws[j + 1], cj], head: true, w: 6, k, o });
        });
        // the distance still to go, from the bottom to each place the ball stood (they halve)
        const texts = [];
        DIST.forEach((d0, j) => {
          const k = ramp(t, d0, d0 + 0.35, E.out);
          if (k <= 0) return;
          const cj = G.costs[j];
          segs.push({ a: [4, cj], b: [G.ws[j], cj], tone: "red", w: 8, k });
          if (j < 3)
            texts.push({
              at: [(4 + G.ws[j]) / 2, cj],
              dy: -16,
              text: fm(G.dist[j]),
              tone: "red",
              o: ramp(t, d0 + 0.2, d0 + 0.4),
            });
        });

        const dots = [{ at: [4, 0], tone: "green", r: 10, o: ramp(t, 0.3, 0.7, E.lin) }];
        G.ws.slice(0, n + 1).forEach((v, j) => {
          if (j < T0.length && t >= T0[j] + 0.5) dots.push({ at: [v, G.costs[j]], tone: "blue", r: 8, hollow: true });
        });
        if (kEnd > 0) dots.push({ at: [w, c], tone: "green", r: 30 * (0.6 + 0.4 * E.pop(kEnd)), hollow: true });
        if (kBall > 0) dots.push({ at: [w, c], tone: "blue", r: 18 * (0.5 + 0.5 * E.pop(kBall)) });
        p.update({
          k: ramp(t, 0.2, 0.7, E.lin),
          axes: ramp(t, 0.3, 0.7, E.lin),
          curves: [{ fn: D9.cost1, tone: "grey", w: 6 }],
          marks: [{ x: 4, tone: "green", k: ramp(t, 0.4, 0.8, E.out) }],
          segs,
          dots,
          texts,
        });

        ws.forEach((tag, i) => {
          const at = i === 0 ? 0.5 : T0[i - 1] + 1.0;
          tag.set({ k: ramp(t, at, at + 0.4, E.lin), solid: i === n, s: 1 + 0.08 * flash(t, at, at + 0.3) });
        });
        const j = clamp(T0.filter((t0) => t >= t0).length - 1, 0, 3);
        step.set({ k: ramp(t, T0[0], T0[0] + 0.4, E.lin), text: sum(j), s: 1 + 0.1 * flash(t, T0[j], T0[j] + 0.3) });
        slope.set({
          text: `slope ${fm(G.slopes[Math.min(n, 3)])}`,
          k: ramp(t, tStart + 0.2, tStart + 0.6, E.lin) * (n < T0.length ? 1 : 0),
          o: oTan,
        });
        near.set({ k: ramp(t, 10.2, 10.6, E.lin) });
      };
    },
  });
})();

/* Lecture 9 (ds-9) · scene 8 (MINI-BATCHES): the app's batch-size race (lesson 9.2). The same 24 trips, one epoch, learning
   rate 0.02, from w = 10, for three batch sizes. A mini-batch uses part of the data per update, so its gradient is an estimate;
   one epoch makes trips ÷ batch size updates. One at a time makes 24 noisy updates (some go UPHILL, red), batches of 8 make
   3, the full batch makes one smooth step with the true gradient. Every weight and loss comes from D9.RACE (asserted on load).
   Colours: purple = the trips and the batches, blue = the model (the ball and its path), green = the bottom of the bowl,
   red = an uphill step, grey = the bowl and the counters.
   Story (local seconds): 0.3 strip and rows pop; 1.2 the balls appear at w 10; 1.6-10.6 the trips are seen one by one (0.375 s
   each); a run updates when it has seen a whole batch: one at a time after every trip, batches of 8 at 4.6, 7.6 and 10.6, the
   full batch once at 10.6; 10.9 a loss tag ends each row. Hold to 14. On the loss scale the one-at-a-time jitter near the
   bottom is too small to see, so a red counter in its panel ('1 uphill' … '10 uphill', from RACE.ups) counts the uphill
   updates as they happen. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D9 = V.d9;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const R = D9.RACE;
  const N = R.d.length;
  const ROWS = [R.runs[2], R.runs[1], R.runs[0]]; // one at a time, batches of 8, full batch (top to bottom)
  const NAMES = ["one at a time", `batches of ${R.runs[1].B}`, `full batch (${R.runs[0].B})`];
  D9.same(
    "batches scene: 24 trips; batch sizes 1, 8, 24 make 24, 3 and 1 updates",
    [N, ROWS.map((r) => r.B), ROWS.map((r) => r.n)],
    [24, [1, 8, 24], [24, 3, 1]],
  );
  const T = { pop: 0.3, balls: 1.2, s0: 1.6, s1: 10.6, hop: 0.3, loss: 10.9 };
  const per = (T.s1 - T.s0) / N; // seconds per trip
  const upAt = (run, u) => T.s0 + per * u * run.B; // update u (1-based) starts when u × B trips are seen
  const jumpAt = upAt(ROWS[0], R.jump.i + 1);
  const cnt = (u) => `${u} update${u === 1 ? "" : "s"}`;

  V.scene({
    kicker: "MINI-BATCHES",
    title: ["Smaller batches:", "more, noisier steps"],
    dur: 14,
    caps: [
      [0.4, 1.6, `${N} trips, one epoch, three batch sizes.`],
      [1.8, 4.4, "One at a time: an update after every trip."],
      [4.7, 6.6, `Batches of ${R.runs[1].B}: an update after every ${R.runs[1].B} trips.`],
      [7.3, 9.2, "Small batches are noisy: some steps go uphill."],
      [10.7, 12.2, "Full batch: one step, with the true gradient."],
      [
        12.4,
        13.8,
        `After one epoch the losses are ${D9.fm(R.runs[0].steps[0].l, 0)}, ${D9.fm(R.runs[1].steps[2].l, 0)} and ${D9.fm(R.runs[2].steps[23].l, 1)}.`,
      ],
    ],
    build(stage) {
      const strip = D4.chips(stage, {
        x: 288,
        y: 12,
        n: N,
        w: 22,
        h: 40,
        gap: 4,
        fs: 0,
        radius: 8,
        lip: 4,
        tone: "purple",
      });
      const stripLab = D4.label(stage, { x: 140, y: 32, text: `${N} trips`, tone: "purple", fs: 30 });
      const bowl = Array.from({ length: 121 }, (_, j) => {
        const w = R.view.x[0] + ((R.view.x[1] - R.view.x[0]) * j) / 120;
        return [w, D9.loss(R.d, w)];
      });
      const rows = ROWS.map((run, r) => {
        const top = 70 + 190 * r;
        const plot = D9.plot(stage, {
          x: 288,
          y: top,
          w: 636,
          h: 176,
          xr: R.view.x,
          yr: R.view.y,
          xticks: [4, 6, 8, 10],
          pad: { l: 20, r: 16, t: 10, b: 44 },
          dots: 2,
          curves: 2,
          texts: 0,
          segs: 0,
          marks: 0,
        });
        // px -> data units for the 10 px hop arc
        const perPx = (R.view.y[1] - R.view.y[0]) / (plot.area.y1 - plot.area.y0);
        const pts = [R.start, ...run.steps];
        const name = D4.tag(stage, { x: 140, y: top + 50, text: NAMES[r], tone: "purple", fs: 30 });
        const count = D4.tag(stage, { x: 140, y: top + 120, text: cnt(0), tone: "grey", fs: 28 });
        const last = run.steps[run.n - 1].l;
        const loss = D4.tag(stage, { x: 600, y: top + 40, text: `loss ${D9.fm(last, 2)}`, tone: "blue", fs: 28 });
        return { run, r, plot, perPx, pts, name, count, loss };
      });
      const uphill = D4.tag(stage, { text: "uphill", tone: "red", solid: true, fs: 28 });
      const upCount = D4.tag(stage, { x: 430, y: 70 + 40, text: "", tone: "red", fs: 28 });
      const upTimes = R.ups.map((i) => upAt(ROWS[0], i + 1)); // when each uphill update of one at a time starts
      const js = ROWS[0].steps[R.jump.i];
      const jumpPt = rows[0].plot.pt(js.w, js.l);

      return (t) => {
        const seen = N * ramp(t, T.s0, T.s1, E.lin);
        stripLab.set({ k: ramp(t, T.pop, T.pop + 0.4, E.lin) });
        const sk = ramp(t, T.pop, T.pop + 0.5, E.lin);
        for (let i = 0; i < N; i++) {
          const b8 = Math.floor(i / ROWS[1].B) + 1; // the 8-batch this chip belongs to
          const f8 = flash(t, upAt(ROWS[1], b8), upAt(ROWS[1], b8) + 0.6);
          const fAll = flash(t, upAt(ROWS[2], 1), upAt(ROWS[2], 1) + 0.6);
          const rk = Math.max(f8, fAll);
          strip.set(i, { solid: seen > i, ghost: seen <= i, o: sk, ring: rk > 0 ? "purple" : null, ringK: rk });
        }
        rows.forEach(({ run, r, plot, perPx, pts, name, count, loss }) => {
          const rk = ramp(t, T.pop + 0.15 * r, T.pop + 0.15 * r + 0.5, E.lin);
          name.set({ k: rk });
          // how many updates have started, and how far the current hop is
          let u = 0;
          while (u < run.n && t >= upAt(run, u + 1)) u++;
          const hk = u ? clamp((t - upAt(run, u)) / T.hop) : 1;
          const a = pts[Math.max(0, u - 1)];
          const b = pts[u];
          const e = E.inOut(hk);
          const arc = 10 * perPx * Math.sin(Math.PI * hk);
          const ball = [lerp(a.w, b.w, e), lerp(a.l, b.l, e) + arc];
          const up = u > 0 && run.B === 1 && R.ups.includes(u - 1);
          const red = up ? flash(t, upAt(run, u), upAt(run, u) + T.hop + 0.25) : 0;
          count.set({
            text: cnt(u),
            k: rk,
            s: u ? 1 + 0.08 * flash(t, upAt(run, u), upAt(run, u) + 0.3) : 1,
          });
          const path = [...pts.slice(0, u).map((p) => [p.w, p.l]), ball];
          plot.update({
            k: rk,
            curves: [
              { pts: bowl, tone: "grey", w: 5 },
              { pts: path, tone: "blue", w: 3, o: path.length > 1 ? 0.9 : 0 },
            ],
            dots: [
              { at: [R.best, R.min], tone: "green", r: 8 },
              {
                at: ball,
                tone: red > 0.15 ? "red" : "blue",
                r: 14,
                s: E.pop(ramp(t, T.balls, T.balls + 0.5, E.lin)),
                ring: red > 0.15,
              },
            ],
          });
          loss.set({ k: ramp(t, T.loss + 0.15 * r, T.loss + 0.15 * r + 0.5, E.lin) });
        });
        const uk = ramp(t, jumpAt + 0.1, jumpAt + 0.5, E.lin);
        uphill.set({ x: jumpPt.x, y: jumpPt.y - 46, k: uk, o: 1 - ramp(t, 10.0, 10.4, E.lin) });
        const nUp = upTimes.filter((u0) => t >= u0).length;
        upCount.set({
          text: `${nUp} uphill`,
          k: ramp(t, upTimes[0], upTimes[0] + 0.3, E.lin),
          s: nUp ? 1 + 0.12 * flash(t, upTimes[nUp - 1], upTimes[nUp - 1] + 0.3) : 1,
        });
      };
    },
  });
})();

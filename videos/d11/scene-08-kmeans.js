/* Lecture 11 (ds-11) · scene 8 (K-MEANS): the lesson's 45-point cloud, k = 3, two starting centres badly placed close
   together (lesson 11.3 steps 1-2). k-means repeats ASSIGN (each point joins its nearest centre) and UPDATE (each centre moves
   to the mean of its points); 45 assigned, then 3, 7, 12, 2 switch; in iteration 6 nothing switches, so it stops. Every
   assignment and centre is read from D11.KM (precomputed and asserted in common.js); nothing is computed here.
   Colours: the clusters are tones (0 blue, 1 orange, 2 purple: nothing travels in this scene); grey the plane, the step tags
   and the counter; green 'converged' and the tick.
   Story (local seconds): 0.2 plane; 0.3-0.9 grey points; 0.9 start crosses; assign at A[i], update at U[i] (iteration i + 1);
   8.4 iteration 6: '0 switched' turns green; 9.0 'converged'; 9.3 tick; 9.4 the crosses bump. Hold to 12. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const KM = D11.KM;
  const IT = KM.iters;
  const TONES = ["blue", "orange", "purple"];
  const A = [1.4, 3.2, 4.5, 5.8, 7.1, 8.4]; // assign times, iterations 1..6
  const U = [2.0, 3.8, 5.1, 6.4, 7.7]; // update times (iteration 6 has none: nothing changed)
  const GLIDE = 0.45;
  D11.same("k-means scene: one assign time per iteration", [IT.length, KM.converged], [A.length, A.length]);
  D11.same("k-means scene: switches", KM.moved, [45, 3, 7, 12, 2, 0]);
  const N = KM.pts.length;
  const last = KM.converged;

  // how many of the sorted times are <= t
  const count = (times, t) => times.filter((x) => t >= x).length;
  // centre k's position at time t (started, gliding, or done)
  const centreAt = (k, t) => {
    const j = count(U, t); // updates started
    if (!j) return KM.start[k];
    const it = IT[j - 1];
    const f = E.inOut(ramp(t, U[j - 1], U[j - 1] + GLIDE, E.lin));
    return [lerp(it.before[k][0], it.after[k][0], f), lerp(it.before[k][1], it.after[k][1], f)];
  };
  const counterText = (i) => (i === 1 ? `all ${KM.moved[0]} assigned` : `${KM.moved[i - 1]} switched`);

  V.scene({
    kicker: "K-MEANS",
    title: ["Assign to the nearest,", "move to the mean"],
    dur: 12,
    caps: [
      [0.4, 1.9, `${N} points and ${KM.start.length} starting centres.`],
      [2.1, 4.3, "Assign each point to the nearest centre, then move each centre to its mean."],
      [4.5, 8, "Repeat: points switch cluster and the centres follow."],
      [8.8, 11.7, `Iteration ${last}: no point switches, so k-means stops.`],
    ],
    build(stage) {
      const pl = D11.plane(stage, { x: 12, y: 12, w: 616, h: 616, xr: [0.08, 0.9], yr: [0.22, 0.94], n: N });
      const iter = D4.tag(stage, { x: 780, y: 60, text: "iteration 1", fs: 30 });
      const sA = D4.tag(stage, { x: 780, y: 160, text: "assign" });
      const sU = D4.tag(stage, { x: 780, y: 230, text: "update" });
      const ctr = D4.tag(stage, { x: 780, y: 330, text: "" });
      const conv = D4.tag(stage, { x: 780, y: 430, text: "converged", tone: "green", solid: true });
      const svg = D4.svg(stage);
      const tick = L5.tick(780, 520, 64, "green");
      svg.append(tick);

      return (t) => {
        const i = count(A, t); // iterations whose assign step has started (0..6)
        const cur = Math.max(1, i);
        const shown = count(A, t - 0.15); // the tones flip 0.15 s after the assign moment
        const pts = KM.pts.map((p, n) => {
          const tone = shown ? TONES[IT[shown - 1].asg[n]] : "grey";
          let s = E.pop(D11.seq(t, 0.3, 0.012, 0.3, n));
          if (i) {
            const sw = i === 1 || IT[i - 1].asg[n] !== IT[i - 2].asg[n];
            if (sw) s *= 1 + 0.5 * flash(t, A[i - 1], A[i - 1] + 0.4);
          }
          return { at: p, tone, r: 11, s };
        });
        const ck = ramp(t, 0.9, 1.2, E.lin);
        const bump = 1 + 0.4 * flash(t, 9.4, 9.8);
        const centres = [0, 1, 2].map((k) => ({ at: centreAt(k, t), tone: TONES[k], k: ck, s: bump }));
        const j = count(U, t);
        const trails = [0, 1, 2].map((k) =>
          j ? { pts: [...KM.trail(k, j - 2), centreAt(k, t)], tone: TONES[k], o: 0.9 } : null,
        );
        pl.set({ k: ramp(t, 0.2, 0.6, E.lin), pts, centres, trails });

        const side = ramp(t, 1.0, 1.3, E.lin);
        const fresh = i ? flash(t, A[i - 1], A[i - 1] + 0.4) : 0;
        iter.set({ k: side, text: `iteration ${cur}`, solid: i > 0 && t < A[i - 1] + 0.5, s: 1 + 0.12 * fresh });
        sA.set({ k: side, solid: i > 0 && t < A[i - 1] + 0.5 && t >= A[i - 1] });
        const inU = j > 0 && t < U[j - 1] + 0.5 && j === i;
        sU.set({ k: side, solid: inU });
        const done = i === last;
        ctr.set({
          k: ramp(t, A[0], A[0] + 0.3, E.lin),
          text: counterText(cur),
          tone: done ? "green" : "grey",
          solid: done,
          s: 1 + 0.12 * fresh,
        });
        conv.set({ k: ramp(t, 9.0, 9.3, E.lin) });
        L5.drawOn(tick, ramp(t, 9.3, 9.7, E.out));
        tick.style.display = t >= 9.3 ? "" : "none";
      };
    },
  });
})();

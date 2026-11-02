/* Lecture 9 (ds-9) · scene 2 (THE COST): learning means lowering a cost (lesson 9.1, ds9-descent). The courier model is
   minutes = w × km with one weight w. A 1 km trip took 4 minutes; the guess w = 7 predicts 7 minutes, 3 off, cost 3² = 9. The
   ball then slides along the bowl (w 7 -> 10 -> 0 -> 4) and the grey bowl (w − 4)² is drawn over the range it has visited, so
   every guess has a cost; it rests at the bottom, w = 4, cost 0: the best weight. Every number comes from D9.BOWL / D9.cost1.
   Colours: blue = the model (w, the ball), purple = the trip, red = the error and the cost, green = the best, grey = the bowl.
   Story (local seconds): 0.3 model tag; 1.2 the trip; 1.6 the plot; 3.4 guess, 3.7 prediction, 3.9 error, 4.0 cost + ball;
   5.8-7.9 the ball slides and the bowl appears; 7.9 the best spot is marked. Hold to 10. */
(function () {
  const V = window.VID;
  const D9 = V.d9;
  const D4 = V.d4;
  const { ramp, flash, lerp, ease: E } = V;
  const B = D9.BOWL;
  const fm = D9.fm;

  // the slide: [from w, to w, start s, end s]; the ball path is a pure function of t
  const LEGS = [
    [B.guess, B.view.x[1], 5.8, 6.3],
    [B.view.x[1], B.view.x[0], 6.3, 7.2],
    [B.view.x[0], B.best, 7.2, 7.9],
  ];
  const wAt = (t) => {
    if (t <= LEGS[0][2]) return B.guess;
    for (const [a, b, t0, t1] of LEGS) if (t <= t1) return lerp(a, b, ramp(t, t0, t1, E.inOut));
    return B.best;
  };
  // the range of w visited so far (from the legs, no state)
  const span = (t) => {
    let lo = B.guess;
    let hi = B.guess;
    for (const [a, , t0, t1] of LEGS) {
      if (t <= t0) break;
      const w = wAt(Math.min(t, t1));
      lo = Math.min(lo, a, w);
      hi = Math.max(hi, a, w);
    }
    return [lo, hi];
  };
  D9.same("cost scene: the slide ends at the best weight with cost 0", [wAt(9), D9.cost1(wAt(9))], [B.best, 0]);

  V.scene({
    kicker: "THE COST",
    title: ["Every guess", "has a cost"],
    dur: 10,
    caps: [
      [0.4, 1.7, "A courier app predicts minutes = w × km."],
      [1.9, 3.6, `This trip: ${fm(B.km)} km in ${fm(B.min)} minutes.`],
      [4, 5.7, `Guess w = ${fm(B.guess)}: ${fm(B.err)} minutes off, so the cost is ${fm(B.cost)}.`],
      [5.9, 7.8, "Every guess has a cost: together they make a bowl."],
      [8.1, 9.8, `The bottom, w = ${fm(B.best)}, is the best weight.`],
    ],
    build(stage) {
      const p = D9.plot(stage, {
        x: 312,
        y: 12,
        w: 612,
        h: 616,
        xr: B.view.x,
        yr: B.view.y,
        xticks: [0, 2, 4, 6, 8, 10],
        yticks: [0, 20, 40],
        xlab: "weight w",
        ylab: "cost",
      });
      const model = D4.tag(stage, { x: 154, y: 50, text: "minutes = w × km", tone: "blue", fs: 30 });
      const svg = D4.svg(stage);
      const parcel = svg.appendChild(D9.parcel(50, 160, 64));
      const trip = D4.tag(stage, {
        x: 92,
        y: 160,
        anchor: "l",
        text: `${fm(B.km)} km · ${fm(B.min)} min`,
        tone: "purple",
      });
      const guess = D4.tag(stage, { x: 154, y: 280, text: "", tone: "blue", fs: 30 });
      const pred = D4.tag(stage, { x: 154, y: 360, text: `predicts ${fm(B.pred)} min`, tone: "blue" });
      const off = D4.tag(stage, { x: 154, y: 440, text: `${fm(B.err)} min off`, tone: "red" });
      const cost = D4.tag(stage, { x: 154, y: 520, text: "", tone: "red", solid: true, fs: 30 });
      const bp = p.pt(B.best, 0);
      const best = D4.tag(stage, {
        x: bp.x,
        y: bp.y - 190,
        text: `best: w = ${fm(B.best)}, cost 0`,
        tone: "green",
        solid: true,
      });

      return (t) => {
        model.set({ k: ramp(t, 0.3, 0.7, E.lin) });
        const kp = ramp(t, 1.2, 1.7, E.lin);
        V.place(parcel, { s: 0.4 + 0.6 * E.pop(kp), o: Math.min(1, kp * 3) });
        trip.set({ k: ramp(t, 1.3, 1.7, E.lin) });

        const w = wAt(t);
        const c = D9.cost1(w);
        const sliding = t >= LEGS[0][2];
        const atBest = t >= 7.9;
        const fade = 1 - ramp(t, 5.8, 6.1, E.lin);
        guess.set({
          k: ramp(t, 3.4, 3.8, E.lin),
          text: sliding ? `w = ${fm(w, 1)}` : `guess w = ${fm(B.guess)}`,
          s: 1 + 0.1 * flash(t, 7.9, 8.3),
        });
        pred.set({ k: ramp(t, 3.7, 4.1, E.lin), o: fade });
        off.set({ k: ramp(t, 3.9, 4.3, E.lin), o: fade });
        cost.set({
          k: ramp(t, 4.0, 4.4, E.lin),
          text: sliding ? `cost ${fm(c, 1)}` : `cost ${fm(B.err)}² = ${fm(B.cost)}`,
          tone: atBest ? "green" : "red",
          s: 1 + 0.1 * flash(t, 7.9, 8.3),
        });

        const kd = ramp(t, 4.0, 4.5, E.lin);
        const drop = (1 - E.out(kd)) * 14;
        const [lo, hi] = span(t);
        const kb = ramp(t, 7.9, 8.3, E.lin);
        const dots = [];
        if (kb > 0) dots.push({ at: [B.best, 0], tone: "green", r: 30 * (0.6 + 0.4 * E.pop(kb)), hollow: true });
        if (kd > 0) dots.push({ at: [w, c + drop], tone: "blue", r: 18, o: Math.min(1, kd * 3) });
        p.update({
          k: ramp(t, 1.6, 2.1, E.lin),
          axes: ramp(t, 1.8, 2.3, E.lin),
          curves: hi - lo > 0.01 ? [{ fn: D9.cost1, from: lo, to: hi, tone: "grey", w: 6 }] : [],
          segs:
            c > 0.05 ? [{ a: [w, 0], b: [w, c + drop], tone: "red", dash: true, w: 5, o: Math.min(1, kd * 3) }] : [],
          marks: kb > 0 ? [{ x: B.best, tone: "green", k: kb }] : [],
          dots,
        });
        best.set({ k: ramp(t, 8.0, 8.4, E.lin) });
      };
    },
  });
})();

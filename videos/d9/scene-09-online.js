/* Lecture 9 (ds-9) · scene 9 (ONLINE LEARNING): records of a stream ride a conveyor belt past the model (lesson 9.3). Each one
   makes one small update of the weight from that single record (stochastic gradient descent) and then rides away and is gone:
   one pass, nothing stored. Record 1 (3 km, 15 min) is worked slowly: predict 4 × 3 = 12, gradient −18, w 4 → 4.36; records
   2 to 5 go fast. Every figure comes from D9.ONLINE (asserted on load).
   Colours: purple = the records (and the "seen" counter), blue = the model and its weights, orange = the step (the gradient,
   learning rate × gradient), green = the tick for "nothing stored", grey = the belt and the "stored" counter.
   Story (local seconds): 0.3 belt, model and counters pop; 1.0 record 1 rides in and waits at the model; 2.1 the prediction,
   2.6 the gradient, 3.0 the update, 3.3 the model shows 4.36; 3.6-4.4 the record rides on and vanishes; 4.8, 6.0, 7.2, 8.4
   records 2-5 pass quickly; 9.6 a tick beside "stored: 0" and a brace under the row of weights. Hold to 11. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D9 = V.d9;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const O = D9.ONLINE;
  const R0 = O.rows[0];
  const fm = D9.fm;
  const N = O.rows.length;
  D9.same(
    "online scene: five records; record 1 is 3 km in 15 min, predicted 12, gradient −18, w 4 → 4.36",
    [N, R0.x, R0.y, R0.pred, R0.grad, O.ws2[1]],
    [5, 3, 15, 12, -18, 4.36],
  );
  const T = {
    pop: 0.3,
    in0: 1.0,
    in1: 2.0,
    pred: 2.1,
    grad: 2.6,
    upd: 3.0,
    flip: 3.3,
    out0: 3.6,
    out1: 4.4,
    fade: 4.6,
  };
  const fast = (r) => 4.8 + 1.2 * (r - 1); // record r + 1 (r = 1..4) starts here
  const BELT = 336;
  const X0 = 90;
  const XOUT = 840;
  const recText = (row) => `${row.x} km · ${row.y} min`;
  // the record waits just left of the model card (x 358) so it stays readable while it is used
  const stopX = (row) => 358 - D4.tagW(recText(row), 30) / 2 - 12;
  const upAt = (i) => (i === 0 ? T.flip : fast(i) + 0.45); // when weight i + 1 appears
  const passAt = (i) => (i === 0 ? T.out1 : fast(i) + 1.0); // when record i has gone

  V.scene({
    kicker: "ONLINE LEARNING",
    title: ["Learn from each record,", "then let it go"],
    dur: 11,
    caps: [
      [1, 2.8, "On a stream, records arrive one at a time."],
      [3.4, 5, `Each one makes one small update: ${fm(O.ws[0])} → ${fm(R0.nw)}.`],
      [5.2, 7.4, "Then the record is gone: one pass, nothing stored."],
      [7.6, 10.6, "Always adjusting: this is stochastic gradient descent."],
    ],
    build(stage) {
      const svg = D4.svg(stage);
      const belt = V.s("g", {});
      for (let x = 52; x < 924; x += 80)
        belt.append(
          V.s("circle", { cx: x, cy: 386, r: 8, fill: "var(--panel)", stroke: "var(--line-2)", "stroke-width": 3 }),
        );
      [380, 392].forEach((y) =>
        belt.append(
          V.s("line", {
            x1: 12,
            y1: y,
            x2: 924,
            y2: y,
            stroke: "var(--line-2)",
            "stroke-width": 4,
            "stroke-linecap": "round",
          }),
        ),
      );
      svg.append(belt);
      const recs = O.rows.map((row) => D4.tag(stage, { text: recText(row), tone: "purple", solid: true, fs: 30 }));
      const card = D4.card(stage, {
        x: 358,
        y: 250,
        w: 220,
        h: 120,
        tone: "blue",
        plain: false,
        fs: 40,
        text: "w = 4",
      });
      const modelLab = D4.label(stage, { x: 468, y: 226, text: "model", tone: "blue", fs: 30 });
      const seen = D4.tag(stage, { x: 120, y: 40, text: "seen: 0", tone: "purple", fs: 30 });
      const stored = D4.tag(stage, { x: 816, y: 40, text: "stored: 0", tone: "grey", fs: 30 });
      const pred = D4.tag(stage, {
        x: 468,
        y: 160,
        text: `${fm(R0.w)} × ${R0.x} = ${fm(R0.pred)} min`,
        tone: "blue",
        fs: 28,
      });
      const grad = D4.tag(stage, { x: 700, y: 160, text: `gradient ${fm(R0.grad)}`, tone: "orange", fs: 28 });
      const upd = D4.tag(stage, {
        x: 468,
        y: 470,
        text: `${fm(R0.w)} − ${fm(O.eta)} × (${fm(R0.grad)}) = ${fm(R0.nw)}`,
        tone: "orange",
        fs: 28,
      });
      const ws = D4.chips(stage, {
        x: 108,
        y: 536,
        n: N + 1,
        w: 112,
        h: 64,
        gap: 8,
        fs: 30,
        tone: "blue",
        texts: O.ws.map((w) => fm(w)),
      });
      const top = V.s("g", {});
      const tick = L5.tick(696, 40, 40, "green");
      const brace = D9.brace(108, 108 + ws.width, 612, "blue", { h: 12 });
      top.append(tick, brace);
      L5.svg(stage).append(top);

      return (t) => {
        const pk = ramp(t, T.pop, T.pop + 0.5, E.lin);
        V.show(belt, pk);
        modelLab.set({ k: pk });
        // how many records have been used / have passed
        let used = 0;
        while (used < N && t >= upAt(used)) used++;
        let gone = 0;
        while (gone < N && t >= passAt(gone)) gone++;
        const bumpU = used ? flash(t, upAt(used - 1), upAt(used - 1) + 0.3) : 0;
        const bumpG = gone ? flash(t, passAt(gone - 1), passAt(gone - 1) + 0.3) : 0;
        card.set({ text: `w = ${fm(O.ws[used])}`, k: pk, s: 1 + 0.08 * bumpU });
        seen.set({ text: `seen: ${gone}`, k: pk, s: 1 + 0.08 * bumpG });
        stored.set({ k: pk, s: 1 + 0.08 * bumpG });
        for (let i = 0; i <= N; i++) {
          const on = i <= used;
          const kk = i === 0 ? 1 : ramp(t, upAt(i - 1), upAt(i - 1) + 0.4, E.lin);
          ws.set(i, {
            text: on ? undefined : "",
            solid: on,
            ghost: !on,
            o: pk,
            s: on && i > 0 ? 0.8 + 0.2 * E.pop(kk) : 1,
          });
        }
        // the records on the belt
        O.rows.forEach((row, i) => {
          let x;
          let o;
          let k;
          if (i === 0) {
            k = ramp(t, T.in0, T.in0 + 0.3, E.lin);
            if (t < T.out0) x = lerp(X0, stopX(row), ramp(t, T.in0, T.in1, E.inOut));
            else x = lerp(stopX(row), XOUT, ramp(t, T.out0, T.out1, E.inOut));
            o = 1 - ramp(t, T.out1 - 0.25, T.out1, E.lin);
          } else {
            const t0 = fast(i);
            k = ramp(t, t0, t0 + 0.2, E.lin);
            if (t < t0 + 0.6) x = lerp(X0, stopX(row), ramp(t, t0, t0 + 0.4, E.inOut));
            else x = lerp(stopX(row), XOUT, ramp(t, t0 + 0.6, t0 + 1.0, E.inOut));
            o = 1 - ramp(t, t0 + 0.8, t0 + 1.0, E.lin);
          }
          recs[i].set({ x, y: BELT, k, o });
        });
        // the slow worked update of record 1
        const fade = 1 - ramp(t, T.fade, T.fade + 0.4, E.lin);
        pred.set({ k: ramp(t, T.pred, T.pred + 0.4, E.lin), o: fade });
        grad.set({ k: ramp(t, T.grad, T.grad + 0.4, E.lin), o: fade });
        upd.set({ k: ramp(t, T.upd, T.upd + 0.4, E.lin), o: fade });
        const ek = ramp(t, 9.6, 10.2, E.lin);
        V.place(tick, { s: 0.6 + 0.4 * E.pop(ek), o: Math.min(1, ek * 4) });
        L5.drawOn(tick, ek);
        V.show(brace, ramp(t, 9.8, 10.2, E.lin));
      };
    },
  });
})();

/* Lecture 10 (ds-10) · scene 4 (BATCH MODELS): a batch model trained once goes stale as soon as the concept drifts; retraining
   on a fixed schedule helps but lags, because the schedule cannot see when the drift happened (lesson 10.1 step 6). Sixteen
   weeks of error bars appear one by one: grey = the frozen model, blue = the model retrained every 4 weeks on the last 4 weeks.
   The shoppers change habit in week 6 (purple dashed mark); blue dashed marks show each retrain; the blue bars fall to 20%,
   then 10%, while the grey bars stay at 50%. Every number comes from D10.STALE (asserted on load). Colours: grey = the frozen
   model, blue = the retrained model, purple = the drift, red = stuck at a high error. */
(function () {
  const V = window.VID;
  const D10 = V.d10;
  const D9 = V.d9;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;
  const S = D10.STALE;
  const NW = S.weeks.length;
  const EVERY = S.every;
  const RETRAIN = S.weeks.filter((w) => w % EVERY === 0 && w < NW); // 4, 8, 12 (week 16's retrain shows nothing more)
  const HIGH = S.frozen[NW - 1];
  D10.same(
    "stale scene: 16 weeks, drift in week 6, retrain after 4, 8, 12; frozen ends at 50; retrained 20 in week 9, 10 in 13",
    [NW, S.drift, RETRAIN, HIGH, S.monthly[8], S.monthly[12]],
    [16, 6, [4, 8, 12], 50, 20, 10],
  );

  const T = { plot: 0.3, legend: 0.5, w1: 1.0, step: 0.42, stuck: 8.4, late: 8.8 };
  const tw = (w) => T.w1 + T.step * (w - 1); // week w's bars start growing
  const SECOND = RETRAIN[1]; // 8: the first retrain that has seen the drift
  const BACK = RETRAIN[2]; // 12: after it the retrained model is back to its old error

  V.scene({
    kicker: "BATCH MODELS",
    title: ["Trained once,", "soon out of date"],
    dur: 11,
    caps: [
      [0.4, 2.2, `One model is frozen; one retrains every ${EVERY} weeks.`],
      [3.2, 4.6, `Week ${S.drift}: shoppers change habit overnight.`],
      [4.8, 6.6, `Retrained on weeks ${SECOND - EVERY + 1}–${SECOND}, it is still ${S.monthly[SECOND]}% wrong.`],
      [6.8, 8.4, `Only after week ${BACK} is it back to ${S.monthly[BACK]}%.`],
      [8.6, 10.8, `The frozen model stays at ${HIGH}%: it never updates.`],
    ],
    build(stage) {
      const p = D9.plot(stage, {
        x: 12,
        y: 96,
        w: 912,
        h: 532,
        xr: [0.3, 17.8],
        yr: [0, 68],
        xticks: [1, 4, 8, 12, 16],
        yticks: [0, 10, 20, 50],
        xlab: "week",
        ylab: "error %",
        marks: 6,
        texts: 6,
      });
      const bars = D10.bars(p, 2 * NW);
      // the red 'stuck' line lies over the grey bar tops, so it is drawn in p.svg after the bars
      const stuck = p.svg.appendChild(
        V.s("path", { fill: "none", "stroke-linecap": "round", "stroke-width": 5, "stroke-dasharray": "14 10" }),
      );
      stuck.setAttribute("stroke", D4.tone("red").c);
      stuck.setAttribute("d", `M${p.lx(S.drift - 0.5)} ${p.ly(HIGH)}H${p.lx(NW + 0.5)}`);
      const frozen = D4.tag(stage, { x: 236, y: 44, text: "frozen: trained once", tone: "grey" });
      const monthly = D4.tag(stage, { x: 640, y: 44, text: `retrained every ${EVERY} weeks`, tone: "blue" });
      const sp = p.pt(9.7, HIGH);
      const stuckTag = D4.tag(stage, { x: sp.x, y: sp.y - 36, text: `stuck at ${HIGH}%`, tone: "red", solid: true });
      const lp = p.pt(15.1, 56);
      const late = D4.tag(stage, { x: lp.x, y: lp.y, text: "catches up, late", tone: "blue", solid: true });

      return (t) => {
        const pk = ramp(t, T.plot, T.plot + 0.5, E.lin);
        frozen.set({ k: ramp(t, T.legend, T.legend + 0.4, E.lin) });
        monthly.set({ k: ramp(t, T.legend + 0.1, T.legend + 0.5, E.lin) });
        const list = [];
        S.weeks.forEach((w, i) => {
          const k = ramp(t, tw(w), tw(w) + 0.3, E.out);
          list.push({ x: w - 0.2, w: 0.36, y1: S.frozen[i], tone: "grey", k });
          list.push({ x: w + 0.2, w: 0.36, y1: S.monthly[i], tone: "blue", k });
        });
        bars.set(list);
        const dk = ramp(t, tw(S.drift), tw(S.drift) + 0.3, E.out);
        const marks = [{ x: S.drift - 0.5, tone: "purple", dash: true, k: dk, o: dk > 0 ? 1 : 0 }];
        const texts = [{ at: [S.drift - 0.4, 56], text: "drift", tone: "purple", anchor: "start", o: dk }];
        RETRAIN.forEach((w) => {
          const rk = ramp(t, tw(w) + 0.3, tw(w) + 0.6, E.out);
          marks.push({ x: w + 0.5, tone: "blue", dash: true, k: rk, o: rk > 0 ? 1 : 0 });
          texts.push({ at: [w + 0.5, 63], text: "retrain", tone: "blue", o: rk });
        });
        p.update({ k: pk, axes: pk, marks, texts });
        const sk = ramp(t, T.stuck, T.stuck + 0.5, E.lin);
        stuck.setAttribute("visibility", sk > 0 ? "visible" : "hidden");
        stuck.setAttribute("stroke-width", 5 + 4 * flash(t, T.stuck, T.stuck + 0.5));
        stuck.setAttribute("opacity", sk.toFixed(2));
        stuckTag.set({ k: ramp(t, T.stuck, T.stuck + 0.4, E.lin) });
        late.set({ k: ramp(t, T.late, T.late + 0.4, E.lin) });
      };
    },
  });
})();

/* Lecture 10 (ds-10) · scene 2 (CONCEPT DRIFT): concept drift is a change in the RELATIONSHIP between input and output
   (lesson 10.1 steps 1-2). Basketly suggests plant milk; four purple bars are the real click rates of four age bands, a grey
   dashed outline on each is what the week-1 model learned. The weeks run 1 -> 52: the same shoppers click more and more, the
   purple bars climb, the grey outlines stay put; on the 30–44 bar a red line marks the gap and a purple 'concept drift' tag
   names it. Every number comes from D10.PREFS (asserted on load). Colours: purple = the world (real click rates now, the week),
   grey = the frozen week-1 model, red = how far off it is. */
(function () {
  const V = window.VID;
  const D10 = V.d10;
  const D9 = V.d9;
  const D4 = V.d4;
  const { ramp, flash, lerp, ease: E } = V;
  const P = D10.PREFS;
  const W = 52; // the last week of the run
  const END = P.now(W);
  const OFF = END[1] - P.w1[1]; // 30–44: points the model is off by in week 52
  D10.same("rule scene: week 52 matches w52; 30–44 is 26 points off", [END, OFF], [P.w52, 26]);

  const T = { basket: 0.3, plot: 0.6, grow: 1.2, model: 2.6, run: 3.6, runEnd: 6.8, gap: 7.0, drift: 8.4 };
  const weekAt = (t) => Math.round(lerp(1, W, ramp(t, T.run, T.runEnd, E.inOut)));

  V.scene({
    kicker: "CONCEPT DRIFT",
    title: ["Same shoppers,", "a new rule"],
    dur: 10,
    caps: [
      [0.4, 2.2, "A grocery app suggests plant milk to its shoppers."],
      [2.6, 4, "The model learns who clicks in week 1."],
      [4.2, 6.6, "Week by week, the same shoppers click more often."],
      [7, 8.2, `Ages ${P.ages[1]}: ${END[1]}% click now. The model still says ${P.w1[1]}%.`],
      [8.4, 9.8, "Same inputs, new rule: that is concept drift."],
    ],
    build(stage) {
      const p = D9.plot(stage, {
        x: 312,
        y: 12,
        w: 612,
        h: 616,
        xr: [0, 4],
        yr: [0, 60],
        yticks: [0, 20, 40, 60],
        xticks: [],
        ylab: "% who click",
        pad: { l: 70, b: 64 },
        texts: 8,
      });
      const real = D10.bars(p, 4);
      const model = D10.bars(p, 4);
      // the red gap lies over the bars, so it is drawn in p.svg after them (the plot's own segs sit under the bars)
      const gap = p.svg.appendChild(V.s("path", { fill: "none", "stroke-linecap": "round", "stroke-width": 8 }));
      gap.setAttribute("stroke", D4.tone("red").c);
      const gx = p.lx(1.5),
        gy0 = p.ly(P.w1[1]),
        gy1 = p.ly(END[1]);
      const svg = D4.svg(stage);
      const basket = svg.appendChild(D10.basket(156, 110, 120));
      const what = D4.label(stage, { x: 156, y: 206, text: "suggests plant milk", fs: 28 });
      const modelTag = D4.tag(stage, { x: 156, y: 300, text: "model: week 1", tone: "grey" });
      const week = D4.tag(stage, { x: 156, y: 400, text: "week 1", tone: "purple", fs: 34 });
      const off = D4.tag(stage, { x: 156, y: 520, text: `${OFF} points off`, tone: "red", solid: true });
      const mp = p.pt(1.5 + 0.28, P.w1[1]);
      const was = D4.tag(stage, { x: mp.x, y: mp.y, text: `${P.w1[1]}%`, tone: "grey" });
      const dp = p.pt(2.6, 54);
      const drift = D4.tag(stage, { x: dp.x, y: dp.y, text: "concept drift", tone: "purple", solid: true, fs: 30 });

      return (t) => {
        const bk = ramp(t, T.basket, T.basket + 0.5, E.lin);
        V.place(basket, { s: 0.6 + 0.4 * E.pop(bk), o: Math.min(1, bk * 3) });
        what.set({ k: bk });
        const pk = ramp(t, T.plot, T.plot + 0.5, E.lin);
        const wk = weekAt(t);
        const now = P.now(wk);
        const bump = flash(t, T.gap, T.gap + 0.45);
        real.set(
          now.map((v, i) => ({
            x: i + 0.5,
            w: 0.56 * (i === 1 ? 1 + 0.12 * bump : 1),
            y1: v,
            tone: "purple",
            k: E.out(D10.seq(t, T.grow, 0.15, 0.5, i)),
          })),
        );
        const mk = ramp(t, T.model, T.model + 0.6, E.out);
        model.set(P.w1.map((v, i) => ({ x: i + 0.5, w: 0.56, y1: v, tone: "grey", hollow: true, dash: true, k: mk })));
        const running = t >= T.run;
        const vk = ramp(t, T.run, T.run + 0.3, E.lin);
        const gk = ramp(t, T.gap, T.gap + 0.5, E.out);
        p.update({
          k: pk,
          axes: pk,
          texts: [
            ...P.ages.map((a, i) => ({ at: [i + 0.5, 0], dy: 44, text: a, tone: "grey", o: pk })),
            { at: [1.5, now[1]], dy: -16, text: `${now[1]}%`, tone: "purple", o: running ? vk : 0 },
          ],
        });
        gap.setAttribute("d", `M${gx} ${gy0}V${lerp(gy0, gy1, gk)}`);
        gap.setAttribute("visibility", gk > 0 ? "visible" : "hidden");
        was.set({ k: running ? vk : 0 });
        modelTag.set({ k: mk });
        week.set({ text: `week ${wk}`, k: ramp(t, T.grow, T.grow + 0.4, E.lin) });
        off.set({ k: ramp(t, T.gap, T.gap + 0.4, E.lin) });
        drift.set({ k: ramp(t, T.drift, T.drift + 0.4, E.lin) });
      };
    },
  });
})();

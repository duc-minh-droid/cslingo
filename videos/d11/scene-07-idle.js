/* Lecture 11 (ds-11) · scene 7 (THE DRAWBACK): all-reduce SGD is minibatch SGD, but the workers sit IDLE while the
   all-reduce runs (lesson 11.2 step 6): computing and communication are not overlapped. Four workers, three iterations of
   3 s computing then a 1 s all-reduce, so they compute 3 ÷ 4 = 75% of the time. Numbers from D11.IDLE.
   Colours: blue computing, purple the all-reduce on the network, red dashed the waiting, grey names and axis.
   Story (local seconds): 0.2 lanes; 0.6-5.4 the timeline sweeps 0 -> 12 s; 2.2 the 'all-reduce' tag under the first network
   bar (the moment it is complete); 5.5-6.1 the busy meter fills to 75%; 5.7 its tag. Hold to 9. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const I = D11.IDLE;
  D11.same("idle scene: 4 workers, 3 iterations of 3 s + 1 s", [I.workers, I.k, I.c, I.m], [4, 3, 3, 1]);
  const BARS = D11.flat(I.rows);
  const SWEEP = [0.6, 5.4];
  const tOf = (sim) => SWEEP[0] + (sim / I.T) * (SWEEP[1] - SWEEP[0]); // local second at which the sweep reaches sim
  const firstNet = I.rows[I.workers].bars[0];

  V.scene({
    kicker: "THE DRAWBACK",
    title: ["Workers sit idle", "during the all-reduce"],
    dur: 9,
    caps: [
      [0.4, 2.6, `Each iteration: ${I.c} s of computing, then a ${I.m} s all-reduce.`],
      [2.8, 5.4, "While the gradients travel, every worker waits."],
      [6, 8.7, `So the workers compute only ${I.pct}% of the time.`],
    ],
    build(stage) {
      const ln = D11.lanes(stage, {
        x: 12,
        y: 30,
        w: 912,
        rows: [...I.rows.map((r) => r.name)],
        T: I.T,
        ticks: [0, 4, 8, 12],
        rowH: 56,
        gap: 12,
        max: BARS.length,
      });
      const ax = ln.X((firstNet.a + firstNet.b) / 2);
      const netY = ln.rowY(I.workers);
      const tag = D4.tag(stage, { x: ax, y: 452, text: "all-reduce", tone: "purple", solid: true });
      const svg = D4.svg(stage);
      const arrow = L5.arrow(ax, 424, ax, netY + 34, "purple", 1, { w: 6, head: 18 });
      svg.append(arrow);
      const meter = D4.bar(stage, { x: 180, y: 510, w: 576, h: 40, tone: "blue" });
      const pct = D4.tag(stage, { x: 468, y: 590, text: `computing ${I.pct}% of the time`, tone: "blue", solid: true });
      const tagAt = tOf(firstNet.b);

      return (t) => {
        const now = I.T * ramp(t, SWEEP[0], SWEEP[1], E.lin);
        ln.set({
          k: ramp(t, 0.2, 0.6, E.lin),
          now,
          cursor: true,
          bars: BARS.map((b) => ({ ...b, k: 1 })),
        });
        tag.set({ k: ramp(t, tagAt, tagAt + 0.4, E.lin) });
        L5.drawOn(arrow, ramp(t, tagAt + 0.1, tagAt + 0.5, E.out));
        arrow.style.display = t >= tagAt + 0.1 ? "" : "none";
        meter.set({ k: I.busy * ramp(t, 5.5, 6.1, E.inOut), o: ramp(t, 5.4, 5.6, E.lin) });
        pct.set({ k: ramp(t, 5.7, 6.0, E.lin), s: 1 + 0.1 * flash(t, 6.1, 6.5) });
      };
    },
  });
})();

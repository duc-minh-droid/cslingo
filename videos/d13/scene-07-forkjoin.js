/* Lecture 13 (ds-13) · scene 7 (OPENMP: FORK AND JOIN): OpenMP parallelism is implicit: you mark the slow part and the
   compiler builds a parallel executable (lesson 13.4). At a fork the master thread spawns workers; here the master, Worker 1
   and Worker 2 tally for 3, 2 and 1.5 minutes (D13.FORK), so the two workers sit idle until the join at 3 minutes, a
   synchronisation point; then the master carries on alone.
   Colours: purple your program and the master's lone segment, grey compiler and axis, green the parallel executable and the
   fork / join lines, blue tally bars, red dashed idle bars.
   Story (local seconds): 0.5 / 0.9 / 1.3 the three flow boxes and their arrows; 3.0-3.6 the flow slides up, the lanes appear,
   3.2 the fork line; 3.4-6.2 the tally bars grow from 0 to 3 minutes; 6.6 the idle bars; 8.4 the join line; 8.8-9.8 the
   master's lone bar from 3 to 4. Hold to 12. */
(function () {
  const V = window.VID;
  const D13 = V.d13;
  const { ramp, ease: E } = V;
  const F = D13.FORK;
  D13.same("fork scene: work and join", [F.work, F.join], [[3, 2, 1.5], 3]);

  const FLOW = [
    ["purple", "Your program", "slow loop marked"],
    ["grey", "Compiler", "adds the threads"],
    ["green", "Parallel executable", "runs on all cores"],
  ];
  const SWEEP = [3.4, 6.2];
  const BARS = F.rows.flatMap((r, i) =>
    r.bars.map((b) => ({ row: i, ...b, text: b.kind === "seq" ? "alone" : b.text })),
  );

  V.scene({
    kicker: "OPENMP: FORK AND JOIN",
    title: ["Mark the slow part,", "the master calls in helpers"],
    dur: 12,
    caps: [
      [0.4, 2.8, "OpenMP: mark what to parallelise; the compiler adds the threads."],
      [3.0, 6.4, "Fork: the master thread spawns worker threads."],
      [6.6, 8.2, "Faster threads wait for the slowest."],
      [8.4, 11.7, "Join: a sync point. Then the master carries on alone."],
    ],
    build(stage) {
      const flow = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
      stage.append(flow);
      const svg = V.l5.svg(flow);
      const boxes = FLOW.map(([tone, title, sub], i) =>
        D13.box(flow, { x: i * 333, y: 0, w: 270, h: 150, tone, title, sub, fs: 30 }),
      );
      const arrows = [0, 1].map((i) =>
        svg.appendChild(V.l5.arrow(i * 333 + 276, 75, i * 333 + 328, 75, "grey", 1, { w: 6, head: 18 })),
      );
      const ln = D13.lanes(stage, {
        x: 12,
        y: 268,
        w: 912,
        rows: F.names,
        T: F.T,
        ticks: [0, 1, 2, 3, 4],
        rowH: 60,
        gap: 14,
      });

      return (t) => {
        const up = ramp(t, 3.0, 3.6, E.inOut);
        V.place(flow, { y: 120 * (1 - up) });
        boxes.forEach((b, i) => b.set({ k: ramp(t, 0.5 + 0.4 * i, 0.9 + 0.4 * i, E.lin) }));
        arrows.forEach((a, i) => V.l5.drawOn(a, ramp(t, 0.8 + 0.4 * i, 1.2 + 0.4 * i, E.out)));

        const now = t < 8.8 ? F.join * ramp(t, SWEEP[0], SWEEP[1], E.lin) : F.join + ramp(t, 8.8, 9.8, E.lin);
        ln.set({
          k: ramp(t, 3.0, 3.4, E.lin),
          now: t < SWEEP[0] ? 0 : now,
          bars: BARS.map((b) => (b.kind === "idle" ? { ...b, k: ramp(t, 6.6, 7.0, E.lin) } : b)),
          marks: [
            { t: 0, text: "fork", k: ramp(t, 3.2, 3.5, E.lin), dx: 20 },
            { t: F.join, text: "join", k: ramp(t, 8.4, 8.8, E.lin) },
          ],
        });
      };
    },
  });
})();

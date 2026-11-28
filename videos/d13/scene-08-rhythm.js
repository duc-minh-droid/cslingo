/* Lecture 13 (ds-13) · scene 8 (THE RHYTHM OF A PROGRAM): Crumb's night shift is load 2, tally 8, sort 1, tally 4, report 1
   minutes (lesson 13.4, the lesson's forkJoin ported in D13.RHYTHM). On 1 thread: 16 minutes. On 2 threads the master forks
   a worker for each tally and joins it: 10 minutes. On 4 threads: 7 minutes. The master's sequential parts, 4 minutes in
   all, never shrink: only the fork-join segments get faster.
   Colours: purple the master's lone segments, blue tally bars, red dashed idle workers, green fork / join lines and the
   7-minute finish, grey names, axis and the other finish times.
   Story (local seconds): 0.5 the 1-thread lane and the legend, 0.6-3.4 its sweep; 3.8 the 2-thread lanes, 3.9-5.65 the sweep
   (fork and join lines appear as it passes them); 7.0 the 4-thread lanes, 7.1-8.3 the sweep; every sweep runs at RATE
   seconds per minute; 10.0 the purple segments glow and "sequential: 4 minutes, always". Hold to 13. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D13 = V.d13;
  const { ramp, flash, ease: E } = V;
  const R = D13.RHYTHM;
  D13.same(
    "rhythm scene: finish times",
    R.runs.map((r) => r.end),
    [16, 10, 7],
  );

  const RATE = 0.175; // seconds per simulated minute
  const START = [0.6, 3.9, 7.1];
  const POP = [0.5, 3.8, 7.0];
  const TMAX = 22;
  const first = [0, 1, 3]; // first lane of each run
  const names = R.runs.flatMap((r) => r.rows.map((row) => row.name));
  const BARS = R.runs.flatMap((r, i) =>
    r.rows.flatMap((row, j) => row.bars.map((b) => ({ ...b, row: first[i] + j, run: i }))),
  );
  const MARKS = R.runs.flatMap((r, i) =>
    r.marks.map(([t, kind], m) => ({
      t,
      run: i,
      r0: first[i],
      r1: first[i] + r.n - 1,
      text: i === 1 && m < 2 ? kind : "",
    })),
  );
  const GLOW = 10.0;

  V.scene({
    kicker: "THE RHYTHM OF A PROGRAM",
    title: ["Only the parallel parts", "get faster"],
    dur: 13,
    caps: [
      [0.4, 3.6, `1 thread: load, tally, sort, tally, report: ${R.runs[0].end} minutes.`],
      [3.8, 6.8, `2 threads: each tally is forked and joined: ${R.runs[1].end} minutes.`],
      [7.0, 9.8, `4 threads: ${R.runs[2].end} minutes.`],
      [10.0, 12.7, `The ${R.seq} sequential minutes never shrink.`],
    ],
    build(stage) {
      const ln = D13.lanes(stage, {
        x: 12,
        y: 8,
        w: 912,
        rows: names,
        gaps: [0, 52, 0, 26],
        T: TMAX,
        ticks: [0, 4, 8, 12, 16, 20],
        rowH: 44,
        gap: 6,
        nameW: 120,
        max: 40,
      });
      const ends = R.runs.map((r, i) =>
        D4.tag(stage, {
          x: ln.X(r.end) + 12,
          y: (ln.rowTop(first[i]) + ln.rowTop(first[i] + r.n - 1) + 44) / 2,
          text: `${r.end} minutes`,
          tone: i === 2 ? "green" : "grey",
          solid: true,
          anchor: "l",
        }),
      );
      const legA = D4.tag(stage, {
        x: 240,
        y: 520,
        text: "load, sort, report: master alone",
        tone: "purple",
        solid: true,
      });
      const legB = D4.tag(stage, { x: 640, y: 520, text: "tally: all threads", tone: "blue", solid: true });
      const seqTag = D4.tag(stage, {
        x: 468,
        y: 600,
        text: `sequential: ${R.seq} minutes, always`,
        tone: "purple",
        solid: true,
        fs: 32,
      });

      return (t) => {
        const nowOf = (i) => (t < START[i] ? 0 : (t - START[i]) / RATE);
        const glow =
          ramp(t, GLOW, GLOW + 0.4, E.lin) * (0.75 + 0.25 * Math.cos(2 * Math.PI * Math.max(0, t - GLOW) * 0.8));
        ln.set({
          names: names.map((_, r) => {
            const i = r >= 3 ? 2 : r >= 1 ? 1 : 0;
            return ramp(t, POP[i], POP[i] + 0.3, E.lin);
          }),
          axes: ramp(t, 0.5, 0.8, E.lin),
          bars: BARS.map((b) => {
            const now = nowOf(b.run);
            return {
              ...b,
              b: Math.min(b.b, now),
              k: now > b.a ? 1 : 0,
              text: now >= b.b ? b.text : "",
              glow: b.kind === "seq" ? glow : 0,
            };
          }),
          marks: MARKS.map((m) => ({ ...m, k: ramp(nowOf(m.run), m.t, m.t + 0.8, E.lin) })),
        });
        ends.forEach((e, i) => {
          const at = START[i] + R.runs[i].end * RATE;
          e.set({ k: ramp(t, at, at + 0.3, E.lin), s: 1 + 0.1 * flash(t, at, at + 0.4) });
        });
        legA.set({ k: ramp(t, 0.8, 1.1, E.lin) });
        legB.set({ k: ramp(t, 1.0, 1.3, E.lin) });
        seqTag.set({ k: ramp(t, GLOW + 0.2, GLOW + 0.6, E.lin) });
      };
    },
  });
})();

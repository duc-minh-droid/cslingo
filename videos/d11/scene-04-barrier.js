/* Lecture 11 (ds-11) · scene 4 (WAIT AND BARRIER): two patterns about TIME, not data (lesson 11.1). Wait: B computes 3 s, then
   sits idle until A's signal at 9 s (6 s idle). Barrier: C1..C4 arrive at 4, 6, 5 and 9 s and nobody goes on before the
   slowest: 5 + 3 + 4 + 0 = 12 s of idle machines (D11.WAIT, D11.BAR). Both are D11.lanes timelines swept by `now`.
   Story (local seconds): 0.2 the wait panel; 0.6-3.3 its sweep, 3.0 the orange signal; 3.4 'waiting 6 s';
   4.4 the barrier panel, 4.8 the barrier line; 5.0-7.8 its sweep; 8.3 the idle total. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const W = D11.WAIT;
  const B = D11.BAR;
  const fm = D11.fm;
  D11.same("wait and barrier idle seconds", [W.idle, B.idle, B.total, B.open], [6, [5, 3, 4, 0], 12, 9]);

  const T = {
    pop1: 0.2,
    sweep1: [0.6, 3.3],
    signal: 3.0,
    waitTxt: 3.4,
    pop2: 4.4,
    bar: 4.8,
    sweep2: [5.0, 7.8],
    total: 8.3,
  };
  const waitBars = D11.flat(W.rows).map((b) => (b.kind === "idle" ? { ...b, text: `waiting ${fm(W.idle)} s` } : b));
  const barBars = D11.flat(B.rows).map((b) => (b.kind === "idle" ? { ...b, text: `${fm(B.idle[b.row])} s` } : b));
  const sum = `idle ${B.idle.map(fm).join(" + ")} = ${fm(B.total)} s`;

  V.scene({
    kicker: "WAIT AND BARRIER",
    title: ["A machine that waits", "is a machine wasted"],
    dur: 11,
    caps: [
      [0.4, 3, "Wait: B stops until A's signal arrives."],
      [3.3, 4.7, `B sat idle for ${fm(W.idle)} s.`],
      [5, 7.8, "Barrier: nobody goes on until all four arrive."],
      [8.3, 10.7, `They all wait for the slowest: ${fm(B.total)} s of idle machines.`],
    ],
    build(stage) {
      const ticks = [0, 2, 4, 6, 8, 10];
      const head1 = D4.tag(stage, { x: 80, y: 36, text: "Wait", tone: "grey", solid: true, fs: 30 });
      const ln1 = D11.lanes(stage, { x: 12, y: 80, w: 912, rows: ["A", "B"], T: W.T, ticks, rowH: 56, gap: 14 });
      const head2 = D4.tag(stage, { x: 100, y: 300, text: "Barrier", tone: "grey", solid: true, fs: 30 });
      const ln2 = D11.lanes(stage, {
        x: 12,
        y: 340,
        w: 912,
        rows: ["C1", "C2", "C3", "C4"],
        T: B.T,
        ticks,
        rowH: 48,
        gap: 10,
      });
      const total = D4.tag(stage, { x: 480, y: 300, text: sum, tone: "red", solid: true });

      // A's signal: a short orange arrow from A's row down to B's row, just right of the signal line
      const top = D4.svg(stage);
      const ax = ln1.X(W.a) + 26;
      const arrow = top.appendChild(
        L5.arrow(ax, ln1.rowY(0) + 2, ax, ln1.rowY(1) - 6, "orange", 1, { w: 6, head: 16 }),
      );

      const simAt = (t, [a, b], to) => to * ramp(t, a, b, E.lin);
      return (t) => {
        // WAIT
        const k1 = ramp(t, T.pop1, T.pop1 + 0.4, E.lin);
        head1.set({ k: k1 });
        const now1 = t < T.sweep1[0] ? 0 : simAt(t, T.sweep1, W.T);
        const flashIdle = flash(t, T.waitTxt, T.waitTxt + 0.4);
        ln1.set({
          k: k1,
          axes: ramp(t, T.pop1 + 0.2, T.pop1 + 0.6, E.lin),
          now: now1,
          cursor: t < T.sweep1[1],
          bars: waitBars.map((b) =>
            b.kind === "idle" ? { ...b, text: t >= T.waitTxt ? b.text : "", k: 1 - 0.3 * flashIdle } : b,
          ),
          marks: [{ t: W.a, text: "signal", k: ramp(t, T.signal, T.signal + 0.3, E.lin) }],
        });
        L5.drawOn(arrow, ramp(t, T.signal, T.signal + 0.3, E.lin));

        // BARRIER
        const k2 = ramp(t, T.pop2, T.pop2 + 0.4, E.lin);
        head2.set({ k: k2 });
        const now2 = t < T.sweep2[0] ? 0 : simAt(t, T.sweep2, B.open);
        const done = t >= T.sweep2[1];
        const pulse = flash(t, T.sweep2[1], T.sweep2[1] + 0.4);
        ln2.set({
          k: k2,
          axes: ramp(t, T.pop2 + 0.2, T.pop2 + 0.6, E.lin),
          now: now2,
          cursor: t >= T.sweep2[0] && !done,
          bars: barBars.map((b) => (b.kind === "idle" ? { ...b, text: done ? b.text : "", k: 1 - 0.3 * pulse } : b)),
          marks: [{ t: B.open, text: "barrier", k: ramp(t, T.bar, T.bar + 0.3, E.lin) }],
        });
        total.set({ k: ramp(t, T.total, T.total + 0.4, E.lin), s: 1 + 0.1 * flash(t, T.total, T.total + 0.4) });
      };
    },
  });
})();

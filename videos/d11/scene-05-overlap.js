/* Lecture 11 (ds-11) · scene 5 (OVERLAP): hide the network's latency by computing the next round while the last result is
   still being sent (lesson 11.1). Four rounds of 3 s computing and 2 s sending: stop and wait takes 20 s (the compute lane
   stalls during every send), overlapped they take 4 × 3 + 2 = 14 s, so 6 s are saved (D11.OVER, the lesson's overlapPlan).
   Two D11.lanes panels on the same time scale, both swept at the same speed (20 sim s per 3.6 s).
   Story (local seconds): 0.2 stop and wait; 0.6-4.2 its sweep, 4.3 '20 s'; 4.6 overlap; 5.0-7.52 its sweep, 7.6 '14 s';
   8.2 '6 s saved'. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;
  const O = D11.OVER;
  const fm = D11.fm;
  D11.same(
    "overlap: rounds, compute, send, ends, saved",
    [O.k, O.c, O.m, O.wait.end, O.over.end, O.saved],
    [4, 3, 2, 20, 14, 6],
  );

  const RATE = O.wait.end / 3.6; // sim seconds per scene second, the same in both panels
  const T = {
    pop1: 0.2,
    s1: 0.6,
    end1: 4.3,
    pop2: 4.6,
    s2: 5.0,
    end2: 7.6,
    saved: 8.2,
  };
  const now = (t, t0, end) => Math.min(end, Math.max(0, (t - t0) * RATE));
  const opts = { x: 12, w: 912, rows: ["Compute", "Network"], T: O.T, ticks: [0, 5, 10, 15, 20], rowH: 60, gap: 14 };

  V.scene({
    kicker: "OVERLAP",
    title: ["Keep computing", "while you send"],
    dur: 11,
    caps: [
      [0.4, 2.4, `Four rounds: ${fm(O.c)} s of computing, then ${fm(O.m)} s of sending.`],
      [2.6, 4.7, `Stop and wait: the worker sits still while it sends. ${fm(O.wait.end)} s.`],
      [5, 7.8, "Overlap: start the next round while the last result is sent."],
      [8.2, 10.7, `Done in ${fm(O.over.end)} s: ${fm(O.saved)} s of waiting is hidden.`],
    ],
    build(stage) {
      const head1 = D4.tag(stage, { x: 130, y: 36, text: "Stop and wait", tone: "grey", solid: true, fs: 30 });
      const ln1 = D11.lanes(stage, { ...opts, y: 80 });
      const head2 = D4.tag(stage, { x: 100, y: 316, text: "Overlap", tone: "grey", solid: true, fs: 30 });
      const ln2 = D11.lanes(stage, { ...opts, y: 360 });
      // the saving sits under the time it saves: between the overlap's end (14 s) and stop and wait's end (20 s)
      const savedX = (ln2.X(O.over.end) + ln2.X(O.wait.end)) / 2;
      const saved = D4.tag(stage, { x: savedX, y: 590, text: `${fm(O.saved)} s saved`, tone: "green", solid: true });
      const bars1 = D11.flat(O.wait.rows);
      const bars2 = D11.flat(O.over.rows);

      return (t) => {
        const k1 = ramp(t, T.pop1, T.pop1 + 0.4, E.lin);
        const n1 = now(t, T.s1, O.wait.end);
        head1.set({ k: k1 });
        ln1.set({
          k: k1,
          axes: ramp(t, T.pop1 + 0.2, T.pop1 + 0.6, E.lin),
          now: n1,
          cursor: n1 < O.wait.end,
          bars: bars1,
          marks: [{ t: O.wait.end, tone: "red", text: `${fm(O.wait.end)} s`, k: ramp(t, T.end1, T.end1 + 0.3, E.lin) }],
        });

        const k2 = ramp(t, T.pop2, T.pop2 + 0.4, E.lin);
        const n2 = now(t, T.s2, O.over.end);
        head2.set({ k: k2 });
        ln2.set({
          k: k2,
          axes: ramp(t, T.pop2 + 0.2, T.pop2 + 0.6, E.lin),
          now: n2,
          cursor: t >= T.s2 && n2 < O.over.end,
          bars: bars2,
          marks: [
            { t: O.over.end, tone: "green", text: `${fm(O.over.end)} s`, k: ramp(t, T.end2, T.end2 + 0.3, E.lin) },
          ],
        });
        saved.set({ k: ramp(t, T.saved, T.saved + 0.4, E.lin), s: 1 + 0.1 * flash(t, T.saved, T.saved + 0.4) });
      };
    },
  });
})();

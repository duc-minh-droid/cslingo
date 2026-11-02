/* Lecture 8 (ds-8) · scene 3 (SHRINK THE WINDOW): batches over fixed windows always look at the past; shrink the window (daily,
   every 6 hours, hourly) and the worst wait shrinks with it; with no windows at all every post is handled as it arrives: stream
   processing (lesson 8.1, 'Shrink the window' and the 'A day of posts' demo). One day line (D8.dayline) runs four times over the
   same 12 posts; the worst waits and the processed counts come from D8.DAY / D8.processed (asserted).
   Colours: purple = the batch runs (window tag and run lines), orange = a post waiting and its wait bar, green = processed,
   blue = the clock line and the stream, grey = neutral.
   Story (local seconds): A daily 0.3-3.9 (sweep 0.8-3.0, stat 3.1); B every 6 hours 3.9-6.8 (sweep 4.3-6.3); C hourly 6.8-9.5
   (sweep 7.2-9.0); D stream 9.5-13 (run lines fade by 9.8, sweep 9.8-11.8, tick 12.0). Each phase starts with no posts. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const WIN = D8.DAY.windows;
  const N = D8.DAY.posts.length;

  D8.same(
    "window scene: worst waits and run counts of the four windows",
    WIN.map((w) => [w.W, w.name, w.worstText, w.runs.length]),
    [
      [24, "Daily", "23 h 36 min", 1],
      [6, "Every 6 hours", "5 h 42 min", 4],
      [1, "Hourly", "54 min", 24],
      [0, "Stream", "0 min", 0],
    ],
  );
  D8.same(
    "window scene: every window processes all 12 posts by the end of the day",
    WIN.map((w) => D8.processed(w.W, 24)),
    [12, 12, 12, 12],
  );
  // phase p: from `a` (window switches), run lines pop runs..runs+0.4 (or 0.3), the clock sweeps s0..s1, posts fade out at `out`
  const PH = [
    { a: 0, runs: 0.5, s0: 0.8, s1: 3.0, out: 3.6 },
    { a: 3.9, runs: 3.9, s0: 4.3, s1: 6.3, out: 6.5 },
    { a: 6.8, runs: 6.8, s0: 7.2, s1: 9.0, out: 9.2 },
    { a: 9.5, runs: 9.5, s0: 9.8, s1: 11.8, out: 99 },
  ];
  const T = { pop: 0.3, stat: 3.1, tick: 12.0 };

  V.scene({
    kicker: "SHRINK THE WINDOW",
    title: ["Smaller windows,", "shorter waits"],
    dur: 13,
    caps: [
      [0.5, 3.7, "A daily batch run: every post waits for midnight."],
      [3.9, 6.6, `Run every ${WIN[1].W} hours and the wait shrinks.`],
      [6.8, 9.3, `Every hour: no post waits more than ${WIN[2].worstText.replace("min", "minutes")}.`],
      [9.5, 12.6, "No windows at all: each post is handled as it arrives."],
    ],
    build(stage) {
      const day = D8.dayline(stage, { x: 40, y: 300, w: 856 });
      const winTag = D4.tag(stage, { x: 468, y: 60, text: WIN[0].name, tone: "purple", solid: true, fs: 34 });
      const stat = D4.tag(stage, { x: 468, y: 470, text: "", tone: "orange" });
      const count = D4.tag(stage, { x: 468, y: 560, text: "", tone: "grey" });
      const svg = D4.svg(stage);
      // legend: what the discs and the bars mean (defined before the captions use them)
      const LEG = [
        { x: 150, tone: "orange", text: "waiting" },
        { x: 400, tone: "green", text: "processed" },
        { x: 680, tone: "purple", text: "batch run", bar: true },
      ];
      const legend = LEG.map((l) => ({
        mark: l.bar
          ? svg.appendChild(
              V.s("rect", {
                x: l.x - 4,
                y: 150 - 22,
                width: 8,
                height: 44,
                rx: 4,
                "stroke-width": 2,
                style: { fill: D8.tone("purple").c, stroke: D8.tone("purple").lip },
              }),
            )
          : D4.disc(stage, { x: l.x, y: 150, size: 30, text: "", tone: l.tone }),
        label: D4.label(stage, { x: l.x + 24, y: 150, text: l.text, tone: "grey", fs: 28, anchor: "l" }),
      }));
      const tickX = 468 + D4.tagW(`worst wait: ${WIN[3].worstText}`) / 2 + 40;
      const tick = svg.appendChild(L5.tick(tickX, 470, 44, "green", { ink: true, w: 9 }));

      return (t) => {
        const p = PH.reduce((acc, ph, i) => (t >= ph.a ? i : acc), 0);
        const ph = PH[p];
        const w = WIN[p];
        const k = ramp(t, T.pop, T.pop + 0.5, E.lin);
        const now = 24 * ramp(t, ph.s0, ph.s1, E.lin);
        const postsK = 1 - ramp(t, ph.out, ph.out + 0.3, E.lin);
        if (p === 3 && t < ph.s0) {
          // the hourly run lines fade out (right to left) before the stream starts
          day.set({ k, W: WIN[2].W, runsK: 1 - ramp(t, ph.a, ph.s0, E.lin), now: 0, waitK: 1, postsK });
        } else {
          const runsK = ramp(t, ph.runs, ph.runs + (p ? 0.4 : 0.3), E.lin);
          day.set({ k, W: w.W, runsK, now, waitK: 1, postsK });
        }
        legend.forEach((l, i) => {
          const lk = D4.seq(t, T.pop, 0.12, 0.4, i);
          if (l.mark.set) l.mark.set({ k: lk });
          else V.place(l.mark, { o: lk });
          l.label.set({ k: lk });
        });
        const bump = p ? flash(t, ph.a, ph.a + 0.35) : 0;
        winTag.set({ k, text: w.name, tone: p === 3 ? "blue" : "purple", s: 1 + 0.12 * bump });
        const stream = p === 3;
        stat.set({
          k: ramp(t, T.stat, T.stat + 0.4, E.lin),
          text: `worst wait: ${w.worstText}`,
          tone: stream ? "green" : "orange",
          solid: stream,
          s: 1 + 0.12 * bump,
        });
        count.set({ k, text: `processed: ${D8.processed(w.W, now)} of ${N}` });
        const tk = ramp(t, T.tick, T.tick + 0.4, E.lin);
        L5.drawOn(tick, tk);
        V.place(tick, { s: 0.6 + 0.4 * E.pop(tk), o: tk });
      };
    },
  });
})();

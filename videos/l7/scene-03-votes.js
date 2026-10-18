/* Lecture 7 · scene-03-votes: emergence by numbers. Scouts that are each right 60% of the time vote and the colony follows the
   majority. The bars are the CHANCE THE MAJORITY IS RIGHT over many votes (1 scout 60%, 11 scouts 75%, 31 scouts 87%); the green
   tag on each row is the one typical vote that was drawn (1 v 0, 7 v 4, 19 v 12), so a 7 v 4 vote next to a 75% bar is no clash.
   Every number and every vote comes from L7.VOTE (asserted below). Local seconds: 0.15 header, 0.5 single scout (flips 1.1),
   3.0-3.8 eleven scouts pop, 3.9-5.0 they vote, 5.0 verdict, 5.2-5.9 bar 2; 6.2-7.0 thirty-one pop, 7.1-8.15 vote, 8.2 verdict,
   8.35-9.0 bar 3. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const E = V.ease;
  const { clamp, ramp } = V;
  const { seq } = L7;

  const rows = L7.VOTE.rows;
  const pct = Math.round(L7.VOTE.p * 100);
  L7.same(
    "scene 3 bars",
    rows.map((r) => r.shown),
    [60, 75, 87],
  );
  L7.same("scene 3 scout percentage", pct, 60);
  L7.same(
    "scene 3 typical votes",
    rows.slice(1).map((r) => [r.right, r.wrong, r.votes.length]),
    [
      [7, 4, 11],
      [19, 12, 31],
    ],
  );

  // one typical vote per row as "right v wrong": the single scout votes right; 11 and 31 scouts come from L7.VOTE
  const VERDICT = rows.map((r, i) => (i ? [r.right, r.wrong] : [1, 0]));
  L7.same("scene 3 typical votes as right v wrong", VERDICT, [
    [1, 0],
    [7, 4],
    [19, 12],
  ]);
  L7.same(
    "scene 3 every typical vote has a right majority",
    VERDICT.every(([a, b]) => a > b),
    true,
  );
  const votesOf = (r) => (r === 0 ? [true] : rows[r].votes);

  // ---------- geometry (12 px stage margins) ----------
  const ROW_Y = [98, 258, 418];
  const grid = (n, x0, pitch, perLine, ys) => {
    L7.same("rows of scouts", ys.length, Math.ceil(n / perLine));
    return Array.from({ length: n }, (_, i) => [x0 + pitch * (i % perLine), ys[Math.floor(i / perLine)]]);
  };
  const LAYOUT = [
    { size: 48, pts: [[250, ROW_Y[0] + 70]] },
    { size: 34, pts: grid(11, 236, 42, 6, [ROW_Y[1] + 38, ROW_Y[1] + 84]) },
    { size: 28, pts: grid(31, 224, 32, 12, [ROW_Y[2] + 24, ROW_Y[2] + 58, ROW_Y[2] + 92]) },
  ];
  const LABELS = ["1 scout", "11 scouts", "31 scouts"];
  const LEG_X = 352; // legend dot centre: clear of the single scout
  const BAR = { x: 612, w: 304, h: 56, dy: 48 };
  const VERDICT_W = 184; // the green 'n v m' tag under each row label: a tick, then the count
  const HEAD_R = 916; // the right header tag ends 8 px inside the right margin, so its pop stays inside it

  // ---------- timeline (local seconds) ----------
  const T = {
    head: 0.15, // header tags then row labels pop, 0.07 s apart
    one: { scout: 0.5, flip: 1.1, bar: 0.6, fill: [0.95, 2.0], verdict: 1.5 },
    legend: 0.8, // the two vote colours are named before the first scout votes
    r2: { pop: 3.0, popStep: 0.05, flip: 3.9, flipStep: 0.08, verdict: 5.0, fill: [5.2, 5.9] },
    r3: { pop: 6.2, popStep: 0.018, flip: 7.1, flipStep: 0.025, verdict: 8.2, fill: [8.35, 9.0] },
  };
  const ROWS = [T.one, T.r2, T.r3];
  // a caption names a percentage only once its bar has filled (the caption is fully visible 0.25 s after it starts)
  const CAP = { r2: 5.8, r3: 8.9 };
  L7.same(
    "scene 3 the bars are full when their captions are fully visible",
    [T.r2.fill[1] <= CAP.r2 + 0.25, T.r3.fill[1] <= CAP.r3 + 0.25],
    [true, true],
  );
  L7.same(
    "scene 3 votes are in before the verdict",
    [
      T.r2.verdict >= T.r2.flip + 10 * T.r2.flipStep + 0.3 - 1e-9,
      T.r3.verdict >= T.r3.flip + 30 * T.r3.flipStep + 0.3 - 1e-9,
    ],
    [true, true],
  );

  const L5 = V.l5;
  V.scene({
    kicker: "EMERGENCE",
    title: ["Many weak votes", "make a strong one"],
    dur: 11.6,
    caps: [
      [0.4, 2.9, `One scout ant is right ${pct}% of the time.`],
      [3.0, 5.3, "Eleven scouts each vote for a route."],
      [CAP.r2, 8.2, `The majority is right ${rows[1].shown}% of the time.`],
      [CAP.r3, 11.0, `With 31 scouts it climbs to ${rows[2].shown}%.`],
    ],
    build(stage) {
      // header (the right tag ends on the margin), row labels, one verdict tag per row
      const HEAD_TEXT = ["each scout is right " + pct + "%", "chance the majority is right"];
      const HEAD_W = [358, 413]; // measured tag widths at 28 px
      const head = HEAD_TEXT.map((text, i) =>
        L7.tag(stage, { x: i ? HEAD_R - HEAD_W[1] : 12, y: 12, text, tone: "grey" }),
      );
      const labels = LABELS.map((text, i) => L7.text(stage, { x: 12, y: ROW_Y[i] + 6, text, fs: 32, bold: true }));
      const verdicts = VERDICT.map(([a, b], r) => {
        const t = L7.tag(stage, { x: 12, y: ROW_Y[r] + 58, text: `${a} v ${b}`, tone: "green", solid: true, h: 58 });
        Object.assign(t.el.style, { width: `${VERDICT_W}px`, paddingLeft: "52px" });
        return t;
      });
      const ticks = L5.svg(stage);
      const tickEls = VERDICT.map((_v, r) =>
        ticks.appendChild(L5.tick(46, ROW_Y[r] + 58 + 29, 34, "green", { on: true })),
      );

      // scouts: grey until they vote, then green (better route) or red (worse route)
      const scouts = LAYOUT.map((row) => row.pts.map(() => L7.token(stage, { tone: "grey", size: row.size })));
      // bars: the chance the majority is right
      const bars = rows.map((_, r) =>
        L7.bar(stage, { x: BAR.x, y: ROW_Y[r] + BAR.dy, w: BAR.w, h: BAR.h, tone: "green" }),
      );
      // legend: defines the two vote colours before they are used
      const legend = [
        { y: ROW_Y[0] + 22, tone: "green", text: "better route" },
        { y: ROW_Y[0] + 66, tone: "red", text: "worse route" },
      ].map((o) => ({
        y: o.y,
        dot: L7.token(stage, { tone: o.tone, size: 26 }),
        txt: L7.text(stage, { x: LEG_X + 22, y: o.y - 17, text: o.text, fs: 28, bold: true }),
      }));

      const popOf = (t, t0, dur) => ramp(t, t0, t0 + dur, E.lin);

      return (t) => {
        // 1. header and labels
        head.forEach((h, i) => h.set({ k: seq(t, T.head, 0.07, 0.35, i) }));
        labels.forEach((l, i) => l.set({ k: ramp(t, T.head + (2 + i) * 0.07, T.head + (2 + i) * 0.07 + 0.35) }));

        // 2. scouts
        scouts.forEach((row, r) =>
          row.forEach((tok, i) => {
            const [x, y] = LAYOUT[r].pts[i];
            const c = ROWS[r];
            let kPop;
            let flipAt;
            if (r === 0) {
              kPop = popOf(t, c.scout, 0.35);
              flipAt = c.flip;
            } else {
              kPop = popOf(t, c.pop + i * c.popStep, 0.25);
              flipAt = c.flip + i * c.flipStep;
            }
            const voted = t >= flipAt;
            const s = voted ? 1.3 - 0.3 * E.pop(clamp((t - flipAt) / 0.3)) : 1;
            tok.set({
              x,
              y,
              s: E.pop(kPop) * s,
              o: Math.min(1, kPop * 4),
              tone: voted ? (votesOf(r)[i] ? "green" : "red") : "grey",
            });
          }),
        );

        // 3. legend
        legend.forEach((g, i) => {
          const k = seq(t, T.legend, 0.15, 0.3, i);
          g.dot.set({ x: LEG_X, y: g.y, s: E.pop(k), o: Math.min(1, k * 4) });
          g.txt.set({ k: ramp(t, T.legend + 0.1 + i * 0.15, T.legend + 0.4 + i * 0.15) });
        });

        // 4. the verdict of the vote that was drawn (green tick, 'right v wrong')
        verdicts.forEach((v, r) => {
          const k = ramp(t, ROWS[r].verdict, ROWS[r].verdict + 0.35);
          v.set({ k });
          V.place(tickEls[r], { s: E.pop(k), o: Math.min(1, k * 4) });
          L5.drawOn(tickEls[r], ramp(t, ROWS[r].verdict + 0.1, ROWS[r].verdict + 0.4));
        });

        // 5. bars
        bars.forEach((b, r) => {
          const [f0, f1] = ROWS[r].fill;
          const appear = r === 0 ? T.one.bar : ROWS[r].pop;
          const p = ramp(t, appear, appear + 0.3);
          const fill = ramp(t, f0, f1);
          b.set({
            k: (fill * rows[r].shown) / 100,
            text: fill > 0 ? `${Math.round(fill * rows[r].shown)}%` : "",
            o: p,
            y: (1 - p) * 10,
          });
        });
      };
    },
  });
})();

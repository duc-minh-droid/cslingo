/* Lecture 7 · scene-03-votes: emergence by numbers. Scouts that are each right 60% of the time vote and the colony follows the
   majority: 1 scout 60%, 11 scouts 75%, 31 scouts 87%. Every number and every vote comes from L7.VOTE (asserted below). */
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

  // ---------- geometry ----------
  const ROW_Y = [90, 250, 410];
  const grid = (n, x0, pitch, perLine, ys) => {
    L7.same("rows of scouts", ys.length, Math.ceil(n / perLine));
    return Array.from({ length: n }, (_, i) => [x0 + pitch * (i % perLine), ys[Math.floor(i / perLine)]]);
  };
  const LAYOUT = [
    { size: 48, pts: [[224, ROW_Y[0] + 70]] },
    { size: 34, pts: grid(11, 217, 42, 6, [ROW_Y[1] + 38, ROW_Y[1] + 84]) },
    { size: 28, pts: grid(31, 214, 32, 12, [ROW_Y[2] + 24, ROW_Y[2] + 58, ROW_Y[2] + 92]) },
  ];
  const LABELS = ["1 scout", "11 scouts", "31 scouts"];
  const LEG_X = 352; // legend dot centre: clear of the single scout
  const BAR = { x: 616, w: 304, h: 56, dy: 48 };

  // ---------- timeline (local seconds) ----------
  const T = {
    head: 0.15, // header tags then row labels pop, 0.07 s apart
    one: { scout: 0.5, bar: 0.6, fill: [0.95, 2.0] },
    legend: 3.2,
    r2: { pop: 3.0, popStep: 0.05, flip: 3.9, flipStep: 0.08, fill: [5.2, 6.0] },
    r3: { pop: 6.25, popStep: 0.018, flip: 7.05, flipStep: 0.025, fill: [8.15, 8.95] },
  };
  const ROWS = [null, T.r2, T.r3];

  V.scene({
    kicker: "EMERGENCE",
    title: ["Many weak votes", "make a strong one"],
    dur: 11,
    caps: [
      [0.4, 2.8, "One scout is right 60% of the time."],
      [3.0, 6.0, "Eleven scouts vote, and the majority wins."],
      [6.2, 9.0, "Thirty-one scouts are right 87% of the time."],
      [9.2, 10.8, "Many weak votes make one strong choice."],
    ],
    build(stage) {
      // header, row labels
      const head = [
        L7.tag(stage, { x: 0, y: 0, text: `each scout is right ${pct}%`, tone: "grey" }),
        L7.tag(stage, { x: 650, y: 0, text: "group is right", tone: "grey" }),
      ];
      const labels = LABELS.map((text, i) => L7.text(stage, { x: 0, y: ROW_Y[i] + 51, text, fs: 32, bold: true }));

      // scouts: grey until they vote, then green (better route) or red (worse route)
      const scouts = LAYOUT.map((row) => row.pts.map(() => L7.token(stage, { tone: "grey", size: row.size })));
      // bars
      const bars = rows.map((_, r) =>
        L7.bar(stage, { x: BAR.x, y: ROW_Y[r] + BAR.dy, w: BAR.w, h: BAR.h, tone: "green" }),
      );
      // legend: defines the two vote colours before they are used
      const legend = [
        { y: 112, tone: "green", text: "better route" },
        { y: 156, tone: "red", text: "worse route" },
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
            let kPop;
            let flipAt = Infinity;
            if (r === 0) kPop = popOf(t, T.one.scout, 0.35);
            else {
              const c = ROWS[r];
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
              tone: voted ? (rows[r].votes[i] ? "green" : "red") : "grey",
            });
          }),
        );

        // 3. legend
        legend.forEach((g, i) => {
          const k = seq(t, T.legend, 0.15, 0.3, i);
          g.dot.set({ x: LEG_X, y: g.y, s: E.pop(k), o: Math.min(1, k * 4) });
          g.txt.set({ k: ramp(t, T.legend + 0.1 + i * 0.15, T.legend + 0.4 + i * 0.15) });
        });

        // 4. bars
        bars.forEach((b, r) => {
          const [f0, f1] = r === 0 ? T.one.fill : ROWS[r].fill;
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

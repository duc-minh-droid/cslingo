/* Algorithms phase 2 (algo-2), scene 06: the race. The same 10 x 7 grid and wall, searched twice side by side at the same
   speed (one cell per 0.09 s): Dijkstra (h = 0) floods 59 cells, A* (h = Manhattan distance) expands 20, both find cost 11 along
   the same path. Then the rule that keeps A* honest: its guess h must never be higher than the true cost still to go.
   Every number comes from A2.RUNS and A2.HONEST (asserted below), nothing is typed by hand. */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  const { pop, fade, lin, bump } = A2;

  // ---------- data (all from the helpers, asserted here) ----------
  const AS = A2.RUNS.astar;
  const DJ = A2.RUNS.dijkstra;
  const H = A2.HONEST;
  const [S, G] = [A2.GRID.S, A2.GRID.G];
  const free = A2.GRID.cols * A2.GRID.rows - A2.GRID.walls.length;
  A2.need(AS.count === 20 && DJ.count === 59 && free === 66, "scene 6: A* expands 20 cells, Dijkstra 59 of 66");
  A2.need(AS.cost === 11 && DJ.cost === 11, "scene 6: both searches cost 11");
  A2.need(JSON.stringify(AS.path) === JSON.stringify(DJ.path) && AS.path.length === 12, "scene 6: same 12-cell path");
  A2.need(H.trueLeft === AS.cost, "scene 6: the true cost left from S is the route cost");
  A2.need(
    H.honest === Math.abs(G[0] - S[0]) + Math.abs(G[1] - S[1]),
    "scene 6: the honest guess is the Manhattan distance",
  );
  A2.need(H.honest === AS.steps[0].h && AS.steps[0].g === 0, "scene 6: A* starts on S with h = the honest guess");
  A2.need(
    H.doubled === 2 * H.honest && H.honest <= H.trueLeft && H.doubled > H.trueLeft,
    "scene 6: 7 is fine, 2 x 7 is too high",
  );

  // ---------- timeline (local seconds) ----------
  const T = {
    grid: 0.2, // column i of both grids pops at grid + 0.04 i
    headL: 0.6,
    headR: 0.8,
    count: 1.0, // the two counters
    go: 1.4, // the race starts: one expansion per `per` seconds
    per: 0.09,
    pathA: 3.7, // the A* route lights up 3.7 - 4.4
    doneA: 4.0, // its counter turns solid green
    costA: 4.2,
    redD: 6.9, // Dijkstra's counter turns solid red
    pathD: 7.0, // its route lights up 7.0 - 7.7
    costD: 7.5,
    dim: 8.0, // both grids dim 8.0 - 8.6
    r1: 8.4, // rule: the true cost, then an honest guess, then a doubled guess; 0.6 s each
    r2: 9.2,
    r3: 10.0,
    cross: 10.6,
  };
  const endA = T.go + AS.count * T.per;
  const endD = T.go + DJ.count * T.per;
  A2.need(endA < T.pathA && endD < T.redD, "scene 6: each counter stops before its route lights up");
  const done = (run, t) => Math.min(run.count, Math.max(0, (t - T.go) / T.per));

  // ---------- layout ----------
  const GRID = { y: 66, cell: 38, gap: 4, fs: 28 };
  const BAR = { x: 330, unit: 38, h: 44, ys: [450, 508, 566] };

  V.scene({
    kicker: "A* VS DIJKSTRA",
    title: ["Same route,", "far less work"],
    dur: 12,
    caps: [
      [0.4, 3.4, "Same grid, same wall. Dijkstra looks everywhere."],
      [3.6, 7.4, "A* aims at the goal and expands far fewer cells."],
      [7.8, 11.6, "But its guess must never be higher than the true cost."],
    ],
    build(stage) {
      const GL = A2.grid(stage, { x: 20, ...GRID }); // Dijkstra
      const GR = A2.grid(stage, { x: 500, ...GRID }); // A*

      const headL = A2.tag(stage, { x: 228, y: 34, text: "Dijkstra: h = 0", tone: "grey" });
      const headR = A2.tag(stage, { x: 708, y: 34, text: "A*: h = guess", tone: "purple" });
      const countL = A2.tag(stage, { x: 150, y: 392, text: "0 cells", tone: "blue", fs: 36, minW: 190 });
      const countR = A2.tag(stage, { x: 630, y: 392, text: "0 cells", tone: "blue", fs: 36, minW: 190 });
      const costL = A2.tag(stage, { x: 345, y: 392, text: `cost ${DJ.cost}`, tone: "green" });
      const costR = A2.tag(stage, { x: 825, y: 392, text: `cost ${AS.cost}`, tone: "green" });

      // the rule: three bars, a label for each, and a marker at the true cost
      const bars = [
        A2.bar(stage, {
          x: BAR.x,
          y: BAR.ys[0],
          h: BAR.h,
          unit: BAR.unit,
          segs: [{ v: H.trueLeft, tone: "green", text: String(H.trueLeft) }],
        }),
        A2.bar(stage, {
          x: BAR.x,
          y: BAR.ys[1],
          h: BAR.h,
          unit: BAR.unit,
          segs: [{ v: H.honest, tone: "purple", text: String(H.honest) }],
        }),
        A2.bar(stage, {
          x: BAR.x,
          y: BAR.ys[2],
          h: BAR.h,
          unit: BAR.unit,
          segs: [{ v: H.doubled, tone: "red", text: String(H.doubled) }],
        }),
      ];
      const lab = (i, text, tone) => A2.tag(stage, { x: 170, y: BAR.ys[i] + BAR.h / 2, text, tone, minW: 290 });
      const labels = [
        lab(0, "true cost left", "green"),
        lab(1, "h, never too high", "purple"),
        lab(2, `2 x h, too high`, "red"),
      ];
      const svg = L5.svg(stage);
      const mark = V.s(
        "g",
        {},
        V.s("path", {
          d: `M${bars[0].endX} ${BAR.ys[0] - 14}L${bars[0].endX} ${BAR.ys[2] + BAR.h + 14}`,
          fill: "none",
          "stroke-width": 4,
          "stroke-dasharray": "10 8",
          "stroke-linecap": "round",
          style: { stroke: L5.tone("green").lip },
        }),
      );
      const cross = L5.cross(bars[2].endX + 30, BAR.ys[2] + BAR.h / 2, 44, "red");
      svg.append(mark, cross);

      /* a grid paint with the column-by-column pop-in of the start */
      const wave = (paint, t) => (cx, cy, key) => {
        const a = T.grid + 0.04 * cx;
        const st = paint(cx, cy, key);
        return { ...st, o: (st.o ?? 1) * fade(t, a, 0.2), s: (st.s ?? 1) * (0.7 + 0.3 * pop(t, a)) };
      };

      return (t) => {
        // ---- the two searches, side by side at the same speed ----
        const [nD, nA] = [done(DJ, t), done(AS, t)];
        const dim = 1 - 0.65 * lin(t, T.dim, T.dim + 0.6);
        GL.update({ cells: wave(A2.gridPaint(DJ, nD, { pathK: lin(t, T.pathD, T.pathD + 0.7), o: dim }), t) });
        GR.update({ cells: wave(A2.gridPaint(AS, nA, { pathK: lin(t, T.pathA, T.pathA + 0.7), o: dim }), t) });

        // ---- headers, counters, costs ----
        const show = (tag, a, extra = {}) => tag.set({ s: 0.8 + 0.2 * pop(t, a), o: fade(t, a, 0.2), ...extra });
        show(headL, T.headL);
        show(headR, T.headR);
        const counter = (tag, n, at, tone) => {
          const finished = t >= at;
          show(tag, T.count, {
            text: `${Math.floor(n + 1e-9)} cells`,
            tone: finished ? tone : "blue",
            solid: finished,
            s: (0.8 + 0.2 * pop(t, T.count)) * (1 + 0.12 * bump(t, at, 0.4)),
          });
        };
        counter(countL, nD, T.redD, "red");
        counter(countR, nA, T.doneA, "green");
        show(costL, T.costD);
        show(costR, T.costA);

        // ---- the rule: three bars against the true cost ----
        const starts = [T.r1, T.r2, T.r3];
        bars.forEach((b, i) => b.update({ k: lin(t, starts[i], starts[i] + 0.6) }));
        labels.forEach((tag, i) => show(tag, starts[i]));
        const red = t >= T.cross;
        labels[2].set({
          tone: "red",
          solid: red,
          s: (0.8 + 0.2 * pop(t, T.r3)) * (1 + 0.1 * bump(t, T.cross, 0.4)),
          o: fade(t, T.r3, 0.2),
        });
        V.place(mark, { o: fade(t, T.r1 + 0.6, 0.3) });
        const ck = lin(t, T.cross, T.cross + 0.4);
        L5.drawOn(cross, ck);
        V.place(cross, { s: 0.7 + 0.3 * pop(t, T.cross), o: ck > 0 ? 1 : 0 });
      };
    },
  });
})();

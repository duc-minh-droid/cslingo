/* Algorithms Phase 1 · scene 04-count: count the work, not the seconds.
   Three loops at n = 8 are drawn on the SAME 8 x 8 frame of (i, j) pairs; every lit cell is one call of work().
   The lit cells are the real calls of A1.calls(kind, 8) in execution order: one loop 8 (the left column), a growing inner
   loop 28 (the staircase j < i), two full nested loops 64. Every number comes from A1.calls and is asserted against
   A1.COUNTS8. At the end the other half of the square (the diagonal and everything above it) is drawn as dashed purple
   ghosts around the staircase: 28 is about half of 64.
   Story (local seconds): 0.3-1.3 labels, grids, stats and the legend pop in. 1.4-3.0 panel 1 fills (8 calls, 0.2 s each).
   3.4-6.5 panel 2 fills row by row (row 0 has none, rows 1-3 take 0.5 s each, the rest speed up) and a "+k" appears beside each
   finished row, so 0 + 1 + 2 + ... + 7 is read straight off the picture. 6.8-9.1 panel 3 fills (64 calls); 9.2 its number turns
   red with a small shake. 9.4 the purple tag pops, 9.4-9.9 the ghosts fade in. 10.0-10.8 still. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const T = V.l5.tone;
  const { h, s, place, show, ramp, flash, ease: E } = V;
  const lin = E.lin;
  const pop = (t, a, d = 0.45) => E.pop(ramp(t, a, a + d, lin));
  const fade = (t, a, d = 0.2) => ramp(t, a, a + d, lin);
  const f1 = (v) => v.toFixed(1);

  const N = 8;
  const POP = 0.12; // a cell takes this long to pop in
  const PITCH = 34;
  const CELL = 28;

  // ---------- when every work() call lights up (local seconds), in the order the loops really run ----------
  const callsOf = (kind) => {
    const c = A1.calls(kind, N);
    A1.must(c.length === A1.COUNTS8[kind], `scene 04: ${kind} has ${c.length} calls, expected ${A1.COUNTS8[kind]}`);
    return c;
  };
  const ONE = callsOf("one");
  const TRI = callsOf("tri");
  const SQ = callsOf("sq");

  const oneTimes = ONE.map((_, c) => 1.4 + 0.2 * c);
  // the staircase: row 0 has no calls (a beat), rows 1-3 take 0.5 s each, rows 4-7 share what is left of the time
  const ROW0 = 3.4;
  const rowStart = [ROW0, 3.7, 4.2, 4.7];
  const rowDur = [0.3, 0.5, 0.5, 0.5];
  const FAST_FROM = 5.2;
  const FAST_DUR = 1.25;
  const fastCalls = TRI.filter((c) => c.i >= 4).length; // 22
  let at = FAST_FROM;
  for (let i = 4; i < N; i++) {
    rowStart[i] = at;
    rowDur[i] = (i * FAST_DUR) / fastCalls;
    at += rowDur[i];
  }
  const triTimes = TRI.map(({ i, j }) => rowStart[i] + (j * rowDur[i]) / i);
  const SQ_FROM = 6.8;
  const SQ_DUR = 2.3;
  const sqTimes = SQ.map((_, c) => SQ_FROM + (SQ_DUR * c) / (SQ.length - 1));
  const TRI_END = Math.max(...triTimes) + POP;
  const SQ_END = Math.max(...sqTimes) + POP;
  A1.must(TRI_END < 6.55 && SQ_END < 9.25, "scene 04: the fills must end before their captions do");

  const RED_AT = 9.2; // the nested loops' number turns red
  const TAG_AT = 9.4; // the purple tag, and the ghosts in 9.4-9.9
  const LABELS_OUT = 6.5; // the "+k" row labels fade before the third panel fills

  const PANELS = [
    { label: "one loop", calls: ONE, times: oneTimes, fillAt: 1.4 },
    { label: "inner loop grows", calls: TRI, times: triTimes, fillAt: 3.4 },
    { label: "nested loops", calls: SQ, times: sqTimes, fillAt: SQ_FROM },
  ];
  PANELS.forEach((P, p) => {
    P.x0 = p * 324;
    P.order = new Map(P.calls.map((c, idx) => [`${c.i},${c.j}`, idx]));
    P.end = Math.max(...P.times) + POP;
  });

  // the other half of the square: the diagonal and everything above it (j >= i) around the staircase
  const GHOST = [];
  for (let r = 0; r < N; r++) for (let c = r; c < N; c++) GHOST.push([r, c]);
  A1.must(GHOST.length === A1.COUNTS8.sq - A1.COUNTS8.tri, "scene 04: the ghost half plus the staircase fill the square");

  VID.scene({
    kicker: "COUNTING WORK",
    title: ["Count the work,", "not the seconds"],
    dur: 11,
    caps: [
      [0.4, 3.2, "Count how many times work() runs when n is 8."],
      [3.4, 6.6, "The inner loop grows: 0 + 1 + 2 + … + 7 = 28."],
      [6.8, 9.2, "Two full loops: 8 × 8 = 64."],
      [9.4, 10.9, "28 is about half of 64."],
    ],
    build(stage) {
      const panels = PANELS.map((P) => ({
        ...P,
        tag: A1.tag(stage, { text: P.label, tone: "grey" }),
        grid: A1.grid(stage, { x: P.x0 + 11, y: 110, rows: N, cols: N, pitch: PITCH, cell: CELL }),
        stat: A1.stat(stage, { x: P.x0 + 44, y: 410, w: 200, h: 128, label: "work() calls", text: "0", tone: "blue" }),
      }));
      const mid = panels[1];

      // dashed purple ghosts over the other half of panel 2 (they fade in at the end)
      const ghostSvg = s("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
      Object.assign(ghostSvg.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
      GHOST.forEach(([r, c]) => {
        const p = mid.grid.cellAt(r, c);
        const rect = s("rect", { x: f1(p.x - CELL / 2), y: f1(p.y - CELL / 2), width: CELL, height: CELL, rx: 6, "stroke-width": 3, "stroke-dasharray": "5 3" });
        Object.assign(rect.style, { fill: T("purple").dim, stroke: T("purple").c });
        ghostSvg.append(rect);
      }); // prettier-ignore
      stage.append(ghostSvg);

      // "+k" beside each row of the staircase: row i adds i calls
      const rowLabels = Array.from({ length: N }, (_, i) => {
        const e = h("div", { class: "v-text", text: `+${i}` });
        Object.assign(e.style, {
          left: `${f1(mid.grid.cellAt(i, N - 1).x + CELL / 2 + 10)}px`,
          top: `${f1(mid.grid.cellAt(i, N - 1).y - 14)}px`,
          fontSize: "28px",
          lineHeight: "28px",
          fontWeight: "900",
          color: "var(--blue-ink)",
        });
        stage.append(e);
        return e;
      });

      // the legend: n = 8, one cell = one call
      const legend = h("div", { style: { position: "absolute", left: "0px", top: "564px", width: "330px", height: "52px" } });
      const nTag = A1.tag(legend, { text: "n = 8", tone: "blue" });
      nTag.set({ x: 0, y: 0 });
      const mini = s("svg", { width: 32, height: 32, viewBox: "0 0 32 32" });
      Object.assign(mini.style, { position: "absolute", left: "132px", top: "10px", overflow: "visible" });
      const miniCell = s("rect", { x: 2, y: 2, width: CELL, height: CELL, rx: 6, "stroke-width": 2 });
      Object.assign(miniCell.style, { fill: T("blue").c, stroke: T("blue").lip });
      mini.append(miniCell);
      const miniText = h("div", { class: "v-text dim", text: "= one call" });
      Object.assign(miniText.style, { left: "176px", top: "9px", fontSize: "28px", lineHeight: "34px" });
      legend.append(mini, miniText);
      stage.append(legend);

      const sumTag = A1.tag(stage, { text: "28 is about half of 64", tone: "purple", solid: true });

      return (t) => {
        panels.forEach((P, p) => {
          const a = 0.3 + 0.15 * p;
          const bump = 1 + 0.1 * flash(t, P.fillAt - 0.15, P.fillAt + 0.25);
          P.tag.set({ x: P.x0 + 144, y: 56, center: true, s: pop(t, a) * bump, o: fade(t, a, 0.15) });
          P.grid.update(
            (r, c) => {
              const idx = P.order.get(`${r},${c}`);
              if (idx === undefined) return undefined;
              const k = ramp(t, P.times[idx], P.times[idx] + POP, lin);
              return k > 0 ? { k, tone: "blue" } : undefined;
            },
            { o: fade(t, a + 0.05, 0.3) },
          );
          const count = P.times.reduce((n, x) => n + (x < t ? 1 : 0), 0);
          const red = p === 2 && t >= RED_AT;
          const shake = p === 2 ? 7 * Math.sin((t - RED_AT) * 31) * (1 - ramp(t, RED_AT, RED_AT + 0.45, lin)) : 0;
          const done = 1 + 0.07 * flash(t, P.end, P.end + 0.35);
          P.stat.set({
            text: String(count),
            tone: red ? "red" : "blue",
            dx: t >= RED_AT ? shake : 0,
            s: pop(t, a + 0.1) * (p === 2 ? 1 : done),
            o: fade(t, a + 0.1, 0.15),
          });
        });

        // the "+k" labels: row i pops in when its row starts, they all go before the third panel fills
        const out = 1 - fade(t, LABELS_OUT, 0.3);
        rowLabels.forEach((e, i) => {
          const k = pop(t, rowStart[i], 0.3);
          place(e, { s: 0.6 + 0.4 * k, o: Math.min(1, k * 4) * out });
        });

        // the other half of panel 2, and the purple tag
        show(ghostSvg, fade(t, TAG_AT, 0.5));
        sumTag.set({ x: 636, y: 590, center: true, s: pop(t, TAG_AT), o: fade(t, TAG_AT, 0.15) });

        const lk = fade(t, 0.9, 0.35);
        place(legend, { y: (1 - lk) * 10, o: lk });
      };
    },
  });
})();

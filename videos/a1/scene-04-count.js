/* Algorithms Phase 1 · scene 04-count: count the work, not the seconds.
   Three loops at n = 8, always in the same three columns (one loop | nested loops | halving loop), each with its own code
   card on top, so the picture says which loop is which. Every square is one call of work(): the lit squares are the real
   calls of A1.calls(kind, 8) in the order the loops run, and every number is asserted against A1.COUNTS8.
   Column 2 shows the growing inner loop first (for j in 0..i: the staircase, 28 calls) and then the one-word change
   (0..i becomes 0..n) that makes it a full nested loop (all 64 squares). Column 3 is the halving loop: every arrow of the
   chain 8, 4, 2, 1 is one call (3 in all), from A1.halving(8).
   Story (local seconds): 0.3-1.4 code cards, grids, stats and the legend pop in. 1.5-3.1 column 1 fills (8 calls, 0.2 s
   each). 3.4-6.5 column 2 fills row by row (the staircase, 28 calls) with a "+k" beside each row. 7.0-7.3 the bound i turns
   into n; 7.4-9.2 the other 36 squares fill (orange, then blue) and the number reaches 64 (red). 9.8-11.5 the halving chain:
   three arrows, three calls. 11.6-12.8 still. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const T = V.l5.tone;
  const { h, s, place, ramp, flash, clamp, ease: E } = V;
  const lin = E.lin;
  const pop = (t, a, d = 0.45) => E.pop(ramp(t, a, a + d, lin));
  const fade = (t, a, d = 0.2) => ramp(t, a, a + d, lin);
  const f1 = (v) => v.toFixed(1);

  const N = 8;
  const POP = 0.12; // a cell takes this long to pop in
  const [PITCH, CELL] = [32, 26];
  const COL = [0, 324, 648];
  const [Y_CODE, CODE_H, Y_GRID, Y_STAT, Y_LEGEND] = [8, 128, 148, 410, 556];
  const GRID_X = (x0) => x0 + (288 - ((N - 1) * PITCH + CELL)) / 2;

  // ---------- when every work() call lights up (local seconds), in the order the loops really run ----------
  const callsOf = (kind) => {
    const c = A1.calls(kind, N);
    A1.must(c.length === A1.COUNTS8[kind], `scene 04: ${kind} has ${c.length} calls, expected ${A1.COUNTS8[kind]}`);
    return c;
  };
  const ONE = callsOf("one");
  const TRI = callsOf("tri");
  const SQ = callsOf("sq");
  const REST = SQ.filter((c) => c.j >= c.i); // what the full nested loop adds to the staircase: 36 squares
  A1.must(REST.length === A1.COUNTS8.sq - A1.COUNTS8.tri, "scene 04: the staircase plus the rest fill the square");
  const HALF = A1.halving(N);
  A1.must(
    HALF.steps === A1.COUNTS8.half && HALF.chain.join() === "8,4,2,1",
    "scene 04: halving 8 is 8, 4, 2, 1 in 3 calls",
  );

  const oneTimes = ONE.map((_, c) => 1.5 + 0.2 * c);
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
  const BOUND_AT = 7.0; // the bound of the inner loop turns from i into n
  const REST_FROM = 7.4;
  const REST_DUR = 1.8;
  const restTimes = REST.map((_, k) => REST_FROM + (REST_DUR * k) / (REST.length - 1));
  const SETTLE = 9.6; // the orange squares turn blue
  const RED_AT = REST_FROM + REST_DUR + POP; // the 64 turns red
  const HALF_FROM = 9.8;
  const HALF_STEP = 0.6;
  const halfAt = (k) => HALF_FROM + HALF_STEP * k; // arrow k (0, 1, 2) is crossed, its call lights
  A1.must(Math.max(...triTimes) + POP < 6.55, "scene 04: the staircase must end before its caption does");
  const LABELS_OUT = 6.5; // the "+k" row labels fade before the full loop starts

  const PANELS = [
    { code: ["for i in 0..n:", "  work()"], times: oneTimes, calls: ONE, fillAt: 1.5, end: Math.max(...oneTimes) + POP },
    { code: ["for i in 0..n:", "  for j in 0..", "    work()"], times: triTimes, calls: TRI, fillAt: 3.4, end: Math.max(...triTimes) + POP },
    { code: ["while i > 1:", "  work()", "  halve i"], times: [0, 1, 2].map(halfAt), calls: [], fillAt: HALF_FROM, end: halfAt(2) + 0.45 },
  ]; // prettier-ignore
  PANELS.forEach((P, p) => {
    P.x0 = COL[p];
    P.order = new Map(P.calls.map((c, idx) => [`${c.i},${c.j}`, idx]));
  });
  const restOrder = new Map(REST.map((c, k) => [`${c.i},${c.j}`, k]));
  const lastTime = [PANELS[0].end, restTimes[restTimes.length - 1] + POP, PANELS[2].end];

  /* a code card: a few lines of pseudo-code; `hot` marks one word (the bound that changes) */
  function codeCard(stage, P) {
    const el = h("div", { class: "v-card plain c-grey", style: { left: `${P.x0 + 12}px`, top: `${Y_CODE}px`, width: "264px", height: `${CODE_H}px` } }); // prettier-ignore
    const top = (CODE_H - 6 - P.code.length * 36) / 2;
    let hot;
    P.code.forEach((line, k) => {
      const ind = line.length - line.trimStart().length;
      const row = h("div", {
        class: "v-text",
        style: {
          left: `${16 + ind * 11}px`,
          top: `${top + 36 * k}px`,
          fontSize: "28px",
          lineHeight: "36px",
          fontWeight: "800",
        },
      });
      if (P === PANELS[1] && k === 1) {
        row.append(document.createTextNode("for j in 0.."));
        hot = h("span", { text: "i", style: { display: "inline-block", color: "var(--amber-ink)" } });
        row.append(hot);
      } else row.textContent = line.trim();
      el.append(row);
    });
    stage.append(el);
    return { el, hot };
  }

  V.scene({
    kicker: "COUNTING WORK",
    title: ["Count the work,", "not the seconds"],
    dur: 13,
    caps: [
      [0.4, 3.3, "Each square is one work() call. One loop: 8."],
      [3.4, 6.9, "The inner loop grows: 0 + 1 + 2 + … + 7 = 28."],
      [7.0, 9.6, "Let it run to n instead: 8 × 8 = 64."],
      [9.8, 12.6, "Halving: 8, 4, 2, 1 is only 3 calls."],
    ],
    build(stage) {
      const panels = PANELS.map((P, p) => {
        const card = codeCard(stage, P);
        return {
          ...P,
          card,
          grid:
            p < 2 ? A1.grid(stage, { x: GRID_X(P.x0), y: Y_GRID, rows: N, cols: N, pitch: PITCH, cell: CELL }) : null,
          stat: A1.stat(stage, {
            x: P.x0 + 44,
            y: Y_STAT,
            w: 200,
            h: 118,
            label: "work() calls",
            text: "0",
            tone: "blue",
          }),
        };
      });
      const colTri = panels[1];

      // the halving chain (8, 4, 2, 1): idle dashed boxes that fill in, an arrow between neighbours, a call square beside each arrow
      const CHX = COL[2] + 122;
      const boxY = (k) => Y_GRID + 23 + 68 * k;
      const ghosts = HALF.chain.map(() => A1.tag(stage, { text: "", tone: "grey", ghost: true, w: 88, h: 46 }));
      const boxes = HALF.chain.map((v) => A1.tag(stage, { text: String(v), tone: "grey", w: 88, h: 46 }));
      const arrows = HALF.chain.slice(1).map(() => {
        const a = A1.icon("arrow", 22, "blue", { w: 7 });
        stage.append(a);
        return a;
      });
      const calls = A1.grid(stage, {
        x: CHX + 44 + 18,
        y: boxY(0) + 34 - CELL / 2,
        rows: 3,
        cols: 1,
        pitch: 68,
        cell: CELL,
      });

      // the "+k" beside each row of the staircase: row i adds i calls
      const rowLabels = Array.from({ length: N }, (_, i) => {
        const p = colTri.grid.cellAt(i, N - 1);
        const e = h("div", { class: "v-text", text: `+${i}` });
        Object.assign(e.style, { left: `${f1(p.x + CELL / 2 + 8)}px`, top: `${f1(p.y - 14)}px`, fontSize: "28px", lineHeight: "28px", fontWeight: "900", color: "var(--blue-ink)" }); // prettier-ignore
        stage.append(e);
        return e;
      });

      // the legend: n = 8, one square = one call
      const legend = h("div", {
        style: { position: "absolute", left: "12px", top: `${Y_LEGEND}px`, width: "420px", height: "52px" },
      });
      const nTag = A1.tag(legend, { text: "n = 8", tone: "blue" });
      nTag.set({ x: 0, y: 0 });
      const mini = s("svg", { width: 32, height: 32, viewBox: "0 0 32 32" });
      Object.assign(mini.style, { position: "absolute", left: "132px", top: "10px", overflow: "visible" });
      const miniCell = s("rect", { x: 2, y: 2, width: CELL, height: CELL, rx: 6, "stroke-width": 2 });
      Object.assign(miniCell.style, { fill: T("blue").c, stroke: T("blue").lip });
      mini.append(miniCell);
      const miniText = h("div", { class: "v-text dim", text: "= one call of work()" });
      Object.assign(miniText.style, { left: "176px", top: "9px", fontSize: "28px", lineHeight: "34px" });
      legend.append(mini, miniText);
      stage.append(legend);

      return (t) => {
        const count = [
          oneTimes.reduce((n, x) => n + (x < t ? 1 : 0), 0),
          triTimes.reduce((n, x) => n + (x < t ? 1 : 0), 0) + restTimes.reduce((n, x) => n + (x < t ? 1 : 0), 0),
          [0, 1, 2].reduce((n, k) => n + (halfAt(k) + 0.25 < t ? 1 : 0), 0),
        ];
        panels.forEach((P, p) => {
          const a = 0.3 + 0.15 * p;
          const bump = 1 + 0.03 * flash(t, P.fillAt - 0.15, P.fillAt + 0.25);
          const active = t >= P.fillAt - 0.1 && t < lastTime[p] + 0.3;
          P.card.el.className = `v-card plain c-${active ? "blue" : "grey"}`;
          place(P.card.el, { s: (0.8 + 0.2 * pop(t, a)) * bump, o: fade(t, a, 0.15) });
          if (P.grid) {
            P.grid.update(
              (r, c) => {
                const key = `${r},${c}`;
                const idx = P.order.get(key);
                if (idx !== undefined) {
                  const k = ramp(t, P.times[idx], P.times[idx] + POP, lin);
                  return k > 0 ? { k, tone: "blue" } : undefined;
                }
                const ridx = p === 1 ? restOrder.get(key) : undefined;
                if (ridx === undefined) return undefined;
                const k = ramp(t, restTimes[ridx], restTimes[ridx] + POP, lin);
                return k > 0 ? { k, tone: t >= SETTLE ? "blue" : "orange" } : undefined;
              },
              { o: fade(t, a + 0.05, 0.3) },
            );
          }
          const red = p === 1 && t >= RED_AT;
          const shake = red ? 7 * Math.sin((t - RED_AT) * 31) * (1 - ramp(t, RED_AT, RED_AT + 0.45, lin)) : 0;
          const done = 1 + 0.07 * flash(t, lastTime[p], lastTime[p] + 0.35);
          P.stat.set({
            text: String(count[p]),
            tone: red ? "red" : "blue",
            dx: shake,
            s: pop(t, a + 0.1) * (p === 1 ? 1 : done),
            o: fade(t, a + 0.1, 0.15),
          });
        });

        // the bound of the inner loop: i (the staircase) turns into n (the full square)
        const swap = ramp(t, BOUND_AT, BOUND_AT + 0.3, lin);
        const hot = colTri.card.hot;
        hot.textContent = swap >= 0.5 ? "n" : "i";
        hot.style.transform = `scale(${(1 + 0.45 * flash(t, BOUND_AT, BOUND_AT + 0.5)).toFixed(3)})`;

        // the "+k" labels: row i pops in when its row starts, they all go before the full loop starts
        const out = 1 - fade(t, LABELS_OUT, 0.3);
        rowLabels.forEach((e, i) => {
          const k = pop(t, rowStart[i], 0.3);
          place(e, { s: 0.6 + 0.4 * k, o: Math.min(1, k * 4) * out });
        });

        // the halving chain: box 0 (8) is there from the start, each call crosses an arrow and fills the next box
        const ck = fade(t, 0.5, 0.3);
        HALF.chain.forEach((_, k) => {
          const born = k === 0 ? ck : ramp(t, halfAt(k - 1) + 0.25, halfAt(k - 1) + 0.55, lin);
          ghosts[k].set({
            x: CHX,
            y: boxY(k),
            center: true,
            s: 0.8 + 0.2 * E.pop(ck),
            o: fade(t, 0.5, 0.3) * (1 - clamp(born * 4)),
          });
          boxes[k].set({ x: CHX, y: boxY(k), center: true, s: 0.8 + 0.2 * E.pop(born), o: clamp(born * 4) });
        });
        arrows.forEach((a, k) => {
          const ak = ramp(t, halfAt(k), halfAt(k) + 0.3, lin);
          place(a, { x: CHX - 11, y: boxY(k) + 34 - 11, r: 90, o: ak > 0 ? 1 : 0 });
          A1.drawOn(a, ak);
        });
        calls.update(
          (r) => {
            const k = ramp(t, halfAt(r) + 0.25, halfAt(r) + 0.25 + POP, lin);
            return k > 0 ? { k, tone: "blue" } : undefined;
          },
          { o: ck },
        );

        const lk = fade(t, 0.9, 0.35);
        place(legend, { y: (1 - lk) * 10, o: lk });
      };
    },
  });
})();

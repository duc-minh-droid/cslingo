/* Algorithms phase 2 (algo-2), scene 05: A* is Dijkstra plus a compass. Each open cell is ranked by f = g + h (g = real cost so far,
   h = Manhattan guess to the goal); A* expands the lowest f, runs at the goal, meets the wall, fans round it and finds cost 11.
   Every number comes from A2.RUNS.astar (asserted below); the grid picture is A2.gridPaint. */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  const { pop, fade, lin, bump } = A2;

  // ---------- data (all from the helpers, asserted here) ----------
  const RUN = A2.RUNS.astar;
  const NEAR = RUN.at(1).open; // the open cells after S is expanded
  const [SK, GK] = [A2.gridKey(...A2.GRID.S), A2.gridKey(...A2.GRID.G)];
  const [EAST, WEST] = [NEAR["2,3"], NEAR["0,3"]];
  A2.need(
    RUN.count === 20 && RUN.cost === 11 && RUN.path.length === 12,
    "scene 5: A* expands 20 cells, cost 11, 12-cell path",
  );
  A2.need(
    RUN.steps[0].key === SK && RUN.steps[0].g === 0 && RUN.steps[0].h === 7 && RUN.steps[0].f === 7,
    "scene 5: S has g 0, h 7, f 7",
  );
  A2.need(RUN.steps[0].added.length === 4, "scene 5: S opens four neighbours");
  A2.need(EAST.g === 1 && EAST.h === 6 && EAST.f === 7, "scene 5: (2,3) has g 1, h 6, f 7");
  A2.need(WEST.g === 1 && WEST.h === 8 && WEST.f === 9, "scene 5: (0,3) has g 1, h 8, f 9");
  A2.need(
    ["1,2", "1,4"].every((k) => NEAR[k].f === 9) && Object.keys(NEAR).length === 4,
    "scene 5: the other two neighbours of S have f 9",
  );
  A2.need(
    RUN.steps.slice(0, 4).every((s) => s.f === 7) &&
      RUN.steps.slice(4, 13).every((s) => s.f === 9) &&
      RUN.steps.slice(13).every((s) => s.f === 11),
    "scene 5: f 7 four times, f 9 nine times, f 11 seven times",
  );

  // ---------- timeline (local seconds) ----------
  const T = {
    grid: 0.2, // column c pops at grid + 0.04 c
    chipG: 1.0,
    chipH: 1.5,
    chipF: 2.0,
    guess: [1.5, 2.1], // the compass arrow draws S -> G; it fades 2.5-2.9
    nums: 3.2, // the chips switch to numbers
    west: 3.8,
    east2: 4.2,
    chipsOut: 4.6,
    path: [10.0, 11.4],
    cost: 11.2,
    goalRing: 11.3,
  };
  // expansions done so far (fractional): 1 at 3.4, then 4 by 5.9, 13 by 7.7 and 20 by 9.8
  const N_CURVE = [[2.6, 0], [3.4, 1], [4.4, 1], [4.9, 2], [5.4, 3], [5.9, 4], [7.7, 13], [9.8, 20]]; // prettier-ignore

  /* which cell wears the orange ring, and how far it has grown: the cell A* is weighing up against the others */
  function ringOf(t) {
    if (t < T.nums || t >= 4.4) return null;
    if (t < T.west) return { key: "2,3", k: lin(t, T.nums, T.nums + 0.3) };
    if (t < T.east2) return { key: "0,3", k: lin(t, T.west, T.west + 0.3) };
    return { key: "2,3", k: lin(t, T.east2, T.east2 + 0.2) };
  }

  /* the three chips: definitions first, then the numbers of the cell being weighed */
  function chipTexts(t) {
    if (t < T.nums) return { g: "g: cost so far", h: "h: guess to goal", f: "f = g + h", solid: false };
    const c = t < T.west || t >= T.east2 ? EAST : WEST;
    return { g: `g = ${c.g}`, h: `h = ${c.h}`, f: `f = ${c.f}`, solid: t >= T.east2 };
  }

  V.scene({
    kicker: "A*",
    title: ["A* is Dijkstra", "plus a compass"],
    dur: 13,
    caps: [
      [0.4, 2.6, "A* is Dijkstra with a compass."],
      [2.8, 5.0, "Score each cell: cost so far g, plus a guess h."],
      [5.2, 9.6, "It expands the lowest score, so it heads for the goal."],
      [10.0, 12.6, "It finds the way round the wall: cost 11."],
    ],
    build(stage) {
      const Gd = A2.grid(stage, { x: 81, y: 70, cell: 72, gap: 6, fs: 28 });
      const chipG = A2.tag(stage, { x: 190, y: 34, text: "g: cost so far", tone: "green" });
      const chipH = A2.tag(stage, { x: 480, y: 34, text: "h: guess to goal", tone: "purple" });
      const chipF = A2.tag(stage, { x: 770, y: 34, text: "f = g + h", tone: "orange" });
      const plus = A2.tag(stage, { x: 335, y: 34, text: "+", tone: "grey" });
      const equals = A2.tag(stage, { x: 625, y: 34, text: "=", tone: "grey" });
      const cost = A2.tag(stage, { x: 468, y: 34, text: `cost ${RUN.cost}`, tone: "green", solid: true });

      // the compass: a straight guess from S to G that ignores the wall
      const [s0, g0] = [Gd.centre(...A2.GRID.S), Gd.centre(...A2.GRID.G)];
      const svg = L5.svg(stage);
      const guess = svg.appendChild(L5.arrow(s0.x + 40, s0.y, g0.x - 42, g0.y, "purple", 1, { w: 7, head: 22 }));

      return (t) => {
        // ---- the grid: a wave pops in from the left, then the search runs ----
        const paint = A2.gridPaint(RUN, A2.curve(t, N_CURVE), { nums: true, pathK: lin(t, ...T.path) });
        const ring = ringOf(t);
        Gd.update({
          cells: (cx, cy, key) => {
            const st = paint(cx, cy, key);
            const a = T.grid + 0.04 * cx;
            const out = { ...st, o: (st.o ?? 1) * fade(t, a, 0.2), s: (st.s ?? 1) * (0.8 + 0.2 * pop(t, a)) };
            if (ring && ring.key === key)
              Object.assign(out, { ring: "orange", ringK: ring.k, pulse: bump(t, T.east2, 0.4) });
            if (key === GK && t >= T.goalRing)
              Object.assign(out, { ring: "orange", ringK: lin(t, T.goalRing, T.goalRing + 0.3) });
            return out;
          },
        });

        // ---- the compass arrow ----
        L5.drawOn(guess, lin(t, ...T.guess));
        V.place(guess, { o: 1 - lin(t, 2.5, 2.9) });

        // ---- the three chips: g, h and f, then their numbers ----
        const tx = chipTexts(t);
        const out = 1 - lin(t, T.chipsOut, T.chipsOut + 0.3);
        const showing = (a) => ({ s: 0.8 + 0.2 * pop(t, a), o: fade(t, a, 0.2) * out });
        const swap = 1 + 0.12 * Math.max(bump(t, T.nums, 0.4), bump(t, T.west, 0.4), bump(t, T.east2, 0.4));
        const num = (a) => {
          const k = showing(a);
          return { ...k, s: k.s * (t >= T.nums ? swap : 1) };
        };
        chipG.set({ text: tx.g, ...num(T.chipG) });
        chipH.set({ text: tx.h, ...num(T.chipH) });
        chipF.set({ text: tx.f, solid: tx.solid, ...num(T.chipF) });
        plus.set({ ...showing(T.nums) });
        equals.set({ ...showing(T.nums) });

        // ---- the cost of the route ----
        cost.set({ s: 0.8 + 0.2 * pop(t, T.cost), o: fade(t, T.cost, 0.2) });
      };
    },
  });
})();

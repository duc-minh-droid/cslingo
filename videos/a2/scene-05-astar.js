/* Algorithms phase 2 (algo-2), scene 05: A* is Dijkstra plus a compass. The grid is a map too (every step costs 1: four "1"
   pills round S). Each open cell is ranked by f = g + h (g = real cost so far, h = Manhattan guess to the goal). h is worked out
   on screen: the compass swings to G, then the cells from (2,3) to G light up 1..6 in turn, ignoring the wall, while the h chip
   counts. A* then expands the lowest f, runs at the goal, meets the wall, fans round it and finds cost 11. After the chips go, a
   small legend ("each number is f = g + h") stays above the grid.
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
  // the cells counted for h of (2,3): straight along the row to G, the wall cell included (the guess ignores walls)
  const [GX, GY] = A2.GRID.G;
  const COUNT = Array.from({ length: EAST.h }, (_, i) => [3 + i, GY]);
  A2.need(
    COUNT.length === 6 && COUNT[5][0] === GX && A2.isWall(...COUNT[2]),
    "scene 5: h of (2,3) is six cells along the row, the third is the wall",
  );

  // ---------- timeline (local seconds) ----------
  const T = {
    grid: 0.2, // column c pops at grid + 0.04 c
    bridge: 0.8, // a "1" in each of the four cells next to S and the tag "every step costs 1"
    bridgeOut: 2.1,
    chipG: 2.4,
    compass: 2.9, // the compass pops and swings round to G
    chipH: 3.0,
    chipF: 3.5,
    nums: 4.6, // the chips switch to numbers (the cell (2,3) is weighed)
    count0: 4.7, // the cells towards G light up 1..6, 0.2 s each
    step: 0.2,
    countOut: 6.2,
    west: 6.5,
    east2: 6.9,
    chipsOut: 7.4,
    path: [12.3, 13.7],
    cost: 13.5,
    goalRing: 13.6,
  };
  const countDone = T.count0 + T.step * COUNT.length;
  const litAt = (i) => T.count0 + T.step * i; // when the i-th cell of the count lights
  // expansions done so far (fractional): S at 3.8-4.4, a pause while the cells are weighed, then 4 by 8.9, 13 by 10.7, 20 by 12.1
  const N_CURVE = [[3.8, 0], [4.4, 1], [T.chipsOut, 1], [7.9, 2], [8.4, 3], [8.9, 4], [10.7, 13], [12.1, 20]]; // prettier-ignore

  /* which cell wears the orange ring, and how far it has grown: the cell A* is weighing up against the others */
  function ringOf(t) {
    if (t < T.nums || t >= T.east2 + 0.5) return null;
    if (t < T.west) return { key: "2,3", k: lin(t, T.nums, T.nums + 0.3) };
    if (t < T.east2) return { key: "0,3", k: lin(t, T.west, T.west + 0.3) };
    return { key: "2,3", k: lin(t, T.east2, T.east2 + 0.2) };
  }

  /* the three chips: definitions first, then the numbers of the cell being weighed (h counts up while the cells light) */
  function chipTexts(t) {
    if (t < T.nums) return { g: "g: cost so far", h: "h: guess", f: "f = g + h", solid: false };
    if (t >= T.west && t < T.east2) return { g: `g = ${WEST.g}`, h: `h = ${WEST.h}`, f: `f = ${WEST.f}`, solid: false };
    const lit = t < T.count0 ? 0 : Math.min(COUNT.length, Math.floor((t - T.count0) / T.step + 1e-9) + 1);
    const done = t >= countDone;
    return {
      g: `g = ${EAST.g}`,
      h: lit ? `h = ${lit}` : "h = ?",
      f: done ? `f = ${EAST.f}` : "f = ?",
      solid: t >= T.east2,
    };
  }

  V.scene({
    kicker: "A*",
    title: ["A* is Dijkstra", "plus a compass"],
    dur: 15,
    caps: [
      [0.4, 2.2, "Same search, on a grid: every step costs 1."],
      [2.5, 4.4, "A* adds a compass: score = cost so far g + a guess h."],
      [4.6, 6.4, "h counts the cells to the goal, ignoring the wall."],
      [6.6, 12.0, "It tries the lowest f first: straight at the goal, then round the wall."],
      [12.4, 14.6, "It finds the way round the wall: cost 11."],
    ],
    build(stage) {
      const Gd = A2.grid(stage, { x: 81, y: 70, cell: 72, gap: 6, fs: 28 });
      const chipG = A2.tag(stage, { x: 190, y: 34, text: "g: cost so far", tone: "green" });
      const chipH = A2.tag(stage, { x: 500, y: 34, text: "h: guess", tone: "purple" });
      const chipF = A2.tag(stage, { x: 725, y: 34, text: "f = g + h", tone: "orange" });
      const plus = A2.tag(stage, { x: 315, y: 34, text: "+", tone: "grey" });
      const equals = A2.tag(stage, { x: 610, y: 34, text: "=", tone: "grey" });
      const cost = A2.tag(stage, { x: 468, y: 34, text: `cost ${RUN.cost}`, tone: "green", solid: true });
      const legend = A2.tag(stage, { x: 468, y: 34, text: "each number is f = g + h", tone: "orange" });
      const every = A2.tag(stage, { x: 468, y: 34, text: "every step costs 1", tone: "blue" });

      // a "1" in each of the four cells next to S (one step away)
      const [sx, sy] = A2.GRID.S;
      const ones = [[1, 0], [-1, 0], [0, -1], [0, 1]].map(([dx, dy]) => {
        const c = Gd.centre(sx + dx, sy + dy); // a "1" in each neighbour: one step away
        return A2.tag(stage, { x: c.x, y: c.y, text: "1", tone: "blue", solid: true });
      }); // prettier-ignore

      // the compass: swings, then points at the goal; it sits between "+" and the h chip
      const svg = L5.svg(stage);
      const cp = A2.compass(388, 34, 26);
      svg.append(cp.g);

      return (t) => {
        // ---- the grid: a wave pops in from the left, then the search runs ----
        const paint = A2.gridPaint(RUN, A2.curve(t, N_CURVE), { nums: true, pathK: lin(t, ...T.path) });
        const ring = ringOf(t);
        const nLit = t < T.count0 ? 0 : Math.min(COUNT.length, Math.floor((t - T.count0) / T.step + 1e-9) + 1);
        const counting = nLit > 0 && t < T.countOut;
        Gd.update({
          cells: (cx, cy, key) => {
            let st = paint(cx, cy, key);
            const i = counting ? COUNT.findIndex(([x, y]) => x === cx && y === cy) : -1;
            if (i >= 0 && i < nLit) {
              const a = litAt(i);
              st =
                key === GK
                  ? { ...st, text: String(i + 1), pulse: bump(t, a, 0.3) }
                  : {
                      look: "soft",
                      tone: "purple",
                      text: String(i + 1),
                      s: 0.7 + 0.3 * pop(t, a, 0.3),
                      o: fade(t, a, 0.12),
                      under: 1,
                    };
            }
            const a = T.grid + 0.04 * cx;
            const out = { ...st, o: (st.o ?? 1) * fade(t, a, 0.2), s: (st.s ?? 1) * (0.8 + 0.2 * pop(t, a)) };
            if (ring && ring.key === key)
              Object.assign(out, { ring: "orange", ringK: ring.k, pulse: bump(t, T.east2, 0.4) });
            if (key === GK && t >= T.goalRing)
              Object.assign(out, { ring: "orange", ringK: lin(t, T.goalRing, T.goalRing + 0.3) });
            return out;
          },
        });

        // ---- the bridge from the road map: every step costs 1 ----
        const bo = 1 - lin(t, T.bridgeOut, T.bridgeOut + 0.3);
        ones.forEach((tag, k) => {
          const a = T.bridge + 0.1 * k;
          tag.set({ s: 0.8 + 0.2 * pop(t, a), o: fade(t, a, 0.2) * bo });
        });
        every.set({ s: 0.8 + 0.2 * pop(t, T.bridge + 0.1), o: fade(t, T.bridge + 0.1, 0.2) * bo });

        // ---- the compass: swings, settles on the goal ----
        const q = t - T.compass;
        const out = 1 - lin(t, T.chipsOut, T.chipsOut + 0.3);
        V.place(cp.g, { s: 0.7 + 0.3 * pop(t, T.compass), o: fade(t, T.compass, 0.2) * out });
        V.place(cp.needle, { r: q < 0 ? 0 : 40 * Math.sin(q * 10) * (1 - lin(q, 0.3, 1.1)) });

        // ---- the three chips: g, h and f, then their numbers ----
        const tx = chipTexts(t);
        const showing = (a) => ({ s: 0.8 + 0.2 * pop(t, a), o: fade(t, a, 0.2) * out });
        const swapK = 1 + 0.12 * Math.max(bump(t, T.nums, 0.4), bump(t, T.west, 0.4), bump(t, T.east2, 0.4));
        const num = (a) => {
          const k = showing(a);
          return { ...k, s: k.s * (t >= T.nums ? swapK : 1) };
        };
        chipG.set({ text: tx.g, ...num(T.chipG) });
        chipH.set({ text: tx.h, ...num(T.chipH) });
        chipF.set({ text: tx.f, solid: tx.solid, ...num(T.chipF) });
        plus.set({ ...showing(T.nums) });
        equals.set({ ...showing(T.nums) });

        // ---- the legend that stays once the chips have gone, then the cost of the route ----
        const lg = T.chipsOut + 0.2;
        legend.set({ s: 0.8 + 0.2 * pop(t, lg), o: fade(t, lg, 0.2) * (1 - lin(t, T.path[0] - 0.3, T.path[0])) });
        cost.set({ s: 0.8 + 0.2 * pop(t, T.cost), o: fade(t, T.cost, 0.2) });
      };
    },
  });
})();

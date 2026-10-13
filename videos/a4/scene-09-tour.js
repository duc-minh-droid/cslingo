/* Phase 4 · scene 09-tour: from tree to tour. The seven towns of lesson 4.9 (a NEW map: straight-line distances).
   Set-up first: the goal is the shortest round trip through every town (the best tour, purple and dashed: the same benchmark as in
   scene 10). That is hard to find, so start from the cheapest tree: the minimum spanning tree is laid (green, W), the walk goes
   all the way round it (every cable twice, orange, 2W), the towns it visits a second time are flagged, and skipping them turns the
   walk into a shortcut tour (blue) that is no shorter than the best but never longer than the walk (straight lines are never
   longer than a detour).
   Only running totals are shown (tree W, 2W the walk, tour), never single cable lengths. Under the map a strip of tiles carries the
   walk's letters: they light up as the walker (a ring, so no letter is hidden) passes, the repeats turn red and drop out, the rest
   close up into the tour.
   Story (local seconds): 0.2-1.0 towns, 1.0-2.6 the best round trip (purple dashes), 3.0-4.3 the tree, 5.0-8.2 the walk,
   8.4-9.2 the repeats, 9.4-11.5 the tour, 11.6 'never longer'. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const T = A4.TSP;
  const num = (x) => A4.num(x);
  const f1 = (n) => n.toFixed(1);

  // ---------- the data, from the real algorithm (asserted against the storyboard) ----------
  const WALK = [...T.walk];
  const LAST = WALK.length - 1;
  A4.same(
    "tour: tree order",
    T.mst.map((m) => m.key),
    ["AB", "AC", "CD", "DE", "DF", "FG"],
  );
  A4.same("tour: tree totals", T.runW.map(num), ["11.2", "23.3", "37.1", "49.1", "63.0", "75.7"]);
  A4.same("tour: walk", T.walk, "ABACDEDFGFDCA");
  A4.same("tour: walk total", num(T.runWalk[T.runWalk.length - 1]), "151.4");
  A4.close("tour: walk is twice the tree", T.walkLen, 2 * T.W, 1e-9);
  A4.same("tour: tour order", T.pre, "ABCDEFG");
  A4.same("tour: tour totals", T.runTour.map(num), ["11.2", "30.3", "44.1", "56.0", "75.1", "87.8", "124.8"]);
  A4.same(
    "tour: legs",
    T.legs.map((l) => `${l.from}${l.to}${l.tree ? "" : ":" + l.skipped.join("")}`),
    ["AB", "BC:A", "CD", "DE", "EF:D", "FG", "GA:FDC"],
  );
  if (!(T.tourLen <= T.walkLen)) throw new Error("tour: the shortcut tour must not be longer than the walk");
  // a walk step that arrives at a town already visited (the closing return to A is not a repeat)
  const REPEAT = WALK.map((c, j) => j > 0 && j < LAST && WALK.indexOf(c) < j);
  const KEEP = WALK.map((_, j) => j).filter((j) => !REPEAT[j]); // walk steps that become the tour
  A4.same("tour: kept steps", KEEP, [0, 1, 3, 4, 5, 7, 8, 12]);
  A4.same("tour: kept letters", KEEP.map((j) => WALK[j]).join(""), `${T.pre}${T.pre[0]}`);
  const TWICE = WALK.filter((c, j) => REPEAT[j]).filter((c, i, a) => a.indexOf(c) === i); // towns seen again, first time seen again first
  A4.same("tour: towns visited twice", TWICE, ["A", "D", "F", "C"]);
  // the tour leg that skips walk step j
  const SKIP_LEG = WALK.map((_, j) => KEEP.findIndex((k, p) => k < j && j < KEEP[p + 1]));
  A4.same(
    "tour: skipped towns",
    T.legs.map((_, i) => WALK.filter((c, j) => SKIP_LEG[j] === i).join("")),
    T.legs.map((l) => l.skipped.join("")),
  );

  // ---------- timeline (local seconds) ----------
  const BEST0 = 1.0; // the best round trip: cable i fades in at BEST0 + 0.1 i, all gone by BEST_OUT
  const BEST_OUT = 2.7;
  const TREE0 = 3.0; // cable i of the tree starts here + 0.2 i and draws for 0.3 s
  const TREE_STEP = 0.2;
  const DRAW = 0.3;
  const WALK0 = 5.0; // leg i of the walk runs from here + 0.27 i for 0.27 s
  const LEG = 0.27;
  const WALK_END = WALK0 + LEG * (WALK.length - 1);
  const RING0 = 8.4; // the repeats are flagged (0.1 s apart)
  const LET_GO = 9.2; // the walk, its lanes and the red rings fade
  const TOUR0 = 9.4; // tour leg i starts here + 0.3 i and draws for 0.3 s
  const TOUR_STEP = 0.3;
  const TOUR_END = TOUR0 + TOUR_STEP * (T.legs.length - 1) + DRAW;
  const DROP0 = TOUR_END + 0.1; // the repeats drop out first (0.35 s), then the tour tiles close up (0.6 s)
  const DROP1 = DROP0 + 0.35;
  const CLOSE0 = DROP1;
  const CLOSE1 = CLOSE0 + 0.6;
  const BOW = 92; // the way home G to A would run through D: a gentle bow clears the town (the curve dips about BOW / 2 px)

  // when each town turns green (the tree reaches it) and blue (the tour reaches it)
  const GREEN_AT = { A: TREE0 };
  T.mst.forEach((m, i) => (GREEN_AT[m.to] = TREE0 + TREE_STEP * i + DRAW));
  const BLUE_AT = { A: TOUR0 };
  T.legs.forEach((l, i) => (BLUE_AT[l.to] = BLUE_AT[l.to] ?? TOUR0 + TOUR_STEP * i + DRAW));
  const legStart = (i) => TOUR0 + TOUR_STEP * i;

  // running totals: how many of a list of finish times have passed, and the value then
  const counter = (t, ends, vals) => {
    const n = ends.filter((e) => t >= e).length;
    return { text: n ? num(vals[n - 1]) : "0", bump: n ? flash(t, ends[n - 1], ends[n - 1] + 0.2) : 0 };
  };

  // the two rings a town can wear: solid red (visited twice) and dashed red (skipped by a shortcut)
  function ringOf(c, t) {
    const j = TWICE.indexOf(c);
    if (j >= 0) {
      const a = RING0 + 0.1 * j;
      const k = ramp(t, a, a + 0.35) * (1 - ramp(t, LET_GO, LET_GO + 0.4, E.lin));
      if (k > 0.003) return { ring: "red", ringK: k };
    }
    for (let i = 0; i < T.legs.length; i++) {
      if (!T.legs[i].skipped.includes(c)) continue;
      const k = Math.min(ramp(t, legStart(i), legStart(i) + 0.15, E.lin), ramp(legStart(i) + 0.55 - t, 0, 0.15, E.lin));
      if (k > 0.003) return { ring: "red", ringDash: true, ringK: k };
    }
    return {};
  }

  V.scene({
    kicker: "FROM TREE TO TOUR",
    title: ["Walk round the tree,", "skip the repeats"],
    dur: 13.6,
    caps: [
      [0.4, 2.7, "Goal: the shortest round trip through every town."],
      [2.9, 4.9, "A cheap start: the cheapest tree, cost W."],
      [5.0, 8.3, "Walk round it. Every cable is used twice: 2W."],
      [8.4, 11.3, "Skip towns already visited. Detours become direct legs."],
      [11.5, 13.4, "Straight is never longer: tour at most 2W."],
    ],
    build(stage) {
      const m = A4.tspMap(stage, { x: -40, y: -32 }); // scene 10 draws the same map in the same place
      const P = (c) => {
        const p = m.pt(c);
        return [p.x, p.y];
      };

      // the walk lanes and the tour legs: lines between the cables and the towns, so the towns stay on top of them
      const lay = V.s("g");
      m.el.insertBefore(lay, m.el.children[2] || null);
      const line = (colour, wd) =>
        lay.appendChild(V.s("line", { "stroke-width": wd, "stroke-linecap": "round", style: { stroke: colour } }));
      const place = (el, a, b) => {
        el.setAttribute("x1", f1(a[0]));
        el.setAttribute("y1", f1(a[1]));
        el.setAttribute("x2", f1(b[0]));
        el.setAttribute("y2", f1(b[1]));
      };
      const lanes = WALK.slice(0, LAST).map((_, i) => A4.offsetLine(P(WALK[i]), P(WALK[i + 1]), 11));
      const laneEls = lanes.map(() => line("var(--amber)", 6));
      // a leg is a straight cable, except the way home: G to A would run straight through D, so it bows a little underneath it
      const tourEls = T.legs.map((l) => {
        const [p, q] = [P(l.from), P(l.to)];
        const mid = A4.lerpPt(p, q, 0.5);
        const home = l.skipped.length > 1;
        const d = home
          ? `M${f1(p[0])} ${f1(p[1])}Q${f1(mid[0])} ${f1(mid[1] + BOW)} ${f1(q[0])} ${f1(q[1])}`
          : `M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}`;
        return lay.appendChild(
          V.s("path", {
            d,
            pathLength: 1,
            fill: "none",
            "stroke-width": 12.6,
            "stroke-linecap": "round",
            style: { stroke: "var(--blue)" },
          }),
        );
      });

      // the three totals: W (the tree), 2W (the walk: an arrow says "twice"), the tour
      const tree = A4.total(stage, { x: 650, y: 30, w: 270, h: 80, label: "tree W", tone: "green" });
      const walk = A4.total(stage, { x: 650, y: 176, w: 270, h: 80, label: "2W", tone: "orange" });
      const tour = A4.total(stage, { x: 650, y: 276, w: 270, h: 80, label: "tour", tone: "blue" });
      const svg = L5.svg(stage);
      const down = svg.appendChild(L5.arrow(686, 122, 686, 168, "orange", 1, { w: 6, head: 20 }));
      const twoX = A4.tag(stage, { x: 716, y: 121, text: "twice", tone: "orange" });
      const bestTag = A4.tag(stage, { x: 650, y: 30, text: "best round trip", tone: "purple" });
      const again = A4.tag(stage, { x: 24, y: 420, text: "visited again", tone: "red", solid: true });
      const straight = A4.tag(stage, { x: 650, y: 376, text: "straight lines" });
      const never = A4.tag(stage, { x: 650, y: 436, text: "never longer", tone: "green" });
      const strip = A4.tiles(stage, { x: 56, y: 540, items: WALK, w: 56, h: 52, gap: 8, fs: 28 });
      // the walker is a ring, so the letter of the town it stands on stays readable
      const walker = A4.token(stage, { tone: "orange", size: 44 });
      Object.assign(walker.el.style, {
        background: "transparent",
        border: "6px solid var(--amber)",
        boxShadow: "none",
      });

      return (t) => {
        // --- the map: towns, then the tree cables ---
        const dim = 1 - 0.5 * ramp(t, WALK0 - 0.1, WALK0 + 0.2);
        const unused = ramp(t, TOUR_END - 0.2, TOUR_END + 0.2);
        const edges = {};
        // set-up: the best round trip, purple and dashed, fades in cable by cable and out again
        T.best.legs.forEach((l, i) => {
          const a = BEST0 + 0.1 * i;
          edges[A4.key(l.from, l.to)] = {
            tone: "purple",
            dash: true,
            o: ramp(t, a, a + 0.3) * (1 - ramp(t, BEST_OUT, BEST_OUT + 0.4)),
          };
        });
        T.mst.forEach((c, i) => {
          const a = TREE0 + TREE_STEP * i;
          const spare = c.key === "AC" || c.key === "DF";
          edges[c.key] = {
            tone: "green",
            w: 1.2,
            from: c.from,
            k: ramp(t, a, a + DRAW),
            o: spare ? dim - (dim - 0.15) * unused : dim,
          };
        });
        const towns = {};
        T.towns.forEach((c, i) => {
          const pk = ramp(t, 0.2 + 0.1 * i, 0.7 + 0.1 * i);
          const blue = t >= BLUE_AT[c];
          const green = t >= GREEN_AT[c];
          const hop = flash(t, GREEN_AT[c], GREEN_AT[c] + 0.3) + flash(t, BLUE_AT[c], BLUE_AT[c] + 0.3);
          towns[c] = {
            tone: blue ? "blue" : green ? "green" : "grey",
            solid: green || blue,
            s: E.pop(pk) * (1 + 0.15 * hop),
            o: Math.min(1, 4 * pk),
            ...ringOf(c, t),
          };
        });
        m.update({ edges, towns });

        // --- the walk: lanes grow with the walker, then fade ---
        const lanesO = 0.9 - 0.72 * ramp(t, LET_GO, LET_GO + 0.5, E.lin);
        lanes.forEach((l, i) => {
          const f = ramp(t, WALK0 + LEG * i, WALK0 + LEG * (i + 1), E.lin);
          place(laneEls[i], l[0], A4.lerpPt(l[0], l[1], f));
          V.show(laneEls[i], f < 0.003 ? 0 : lanesO);
        });
        const j = clamp(Math.floor((t - WALK0) / LEG), 0, LAST - 1);
        const at = A4.lerpPt(P(WALK[j]), P(WALK[j + 1]), clamp((t - WALK0 - j * LEG) / LEG));
        const wk = ramp(t, WALK0 - 0.1, WALK0 + 0.1) * (1 - ramp(t, WALK_END + 0.05, WALK_END + 0.35, E.lin));
        walker.set({ x: at[0], y: at[1], s: 0.6 + 0.4 * E.pop(wk), o: Math.min(1, wk * 4) });

        // --- the tour legs, drawn on in blue ---
        T.legs.forEach((_, i) => {
          const k = ramp(t, legStart(i), legStart(i) + DRAW);
          tourEls[i].style.strokeDasharray = `${k.toFixed(3)} 2`;
          V.show(tourEls[i], k < 0.003 ? 0 : 1);
        });

        // --- counters and tags ---
        const treeEnds = T.mst.map((_, i) => TREE0 + TREE_STEP * i + DRAW);
        const walkEnds = lanes.map((_, i) => WALK0 + LEG * (i + 1));
        const tourEnds = T.legs.map((_, i) => legStart(i) + DRAW);
        tree.set({ ...counter(t, treeEnds, T.runW), k: ramp(t, TREE0, TREE0 + 0.3) });
        walk.set({ ...counter(t, walkEnds, T.runWalk), k: ramp(t, WALK0 - 0.1, WALK0 + 0.2) });
        tour.set({ ...counter(t, tourEnds, T.runTour), k: ramp(t, TOUR0, TOUR0 + 0.3) });
        again.set({ k: ramp(t, RING0, RING0 + 0.3) * (1 - ramp(t, LET_GO, LET_GO + 0.3, E.lin)) });
        // "twice": the walk costs 2W, twice the tree (it pops as the walk total settles)
        const tk = ramp(t, WALK_END, WALK_END + 0.4);
        twoX.set({ k: tk });
        L5.drawOn(down, tk);
        V.show(down, tk > 0 ? 1 : 0);
        bestTag.set({ k: ramp(t, BEST0, BEST0 + 0.3) * (1 - ramp(t, BEST_OUT, BEST_OUT + 0.3)) });
        straight.set({ k: ramp(t, 1.8, 2.2) });
        never.set({ k: ramp(t, TOUR_END + 0.1, TOUR_END + 0.5) });

        // --- the strip: the walk's letters, the repeats drop out, the rest close up into the tour ---
        const drop = ramp(t, DROP0, DROP1, E.inOut);
        const close = ramp(t, CLOSE0, CLOSE1, E.inOut);
        strip.all((s) => {
          const a = WALK0 + LEG * s;
          const k = ramp(t, a, a + 0.2, E.lin);
          const st = { tone: "orange", ghost: false, x: 0, s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, 4 * k) };
          if (REPEAT[s]) {
            const r = RING0 + 0.1 * TWICE.indexOf(WALK[s]);
            if (t >= r) {
              st.tone = "red";
              st.s *= 1 + 0.12 * flash(t, r, r + 0.3);
            }
            st.ghost = t >= legStart(SKIP_LEG[s]);
            st.s *= 1 - 0.5 * drop;
            st.o *= 1 - drop;
          } else {
            const p = KEEP.indexOf(s);
            const b = p ? legStart(p - 1) + DRAW : TOUR0;
            if (t >= b) {
              st.tone = "blue";
              st.s *= 1 + 0.12 * flash(t, b, b + 0.3);
            }
            st.x = (216 + 64 * p - (56 + 64 * s)) * close;
          }
          return st;
        });
      };
    },
  });
})();

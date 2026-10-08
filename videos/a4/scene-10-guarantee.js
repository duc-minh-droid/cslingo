/* Phase 4 · scene 10-guarantee: why the shortcut tour of scene 9 is never worse than twice the best tour.
   (1) Cut one cable out of the BEST round trip (purple, dashed: the benchmark) and a spanning tree is left (blue); no spanning
   tree costs less than the minimum one, W, so W <= best. (2) Our tour is no longer than the walk, which is 2W. So
   tour <= 2W <= 2 x best. A number line collects the five totals (W, best, tour, 2W, twice best); only totals are shown,
   never single cable lengths. The way home of our tour (G to A) would run straight through D, so it bows underneath it,
   as it does in scene 9. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const T = A4.TSP;
  const num = (x) => A4.num(x);
  const f1 = (n) => n.toFixed(1);

  // ---------- the data, from the real algorithm (asserted against the storyboard) ----------
  A4.same("guarantee: best tour", [T.best.order, num(T.best.len)], ["ABEGFDC", "97.6"]);
  A4.same(
    "guarantee: best legs",
    T.best.legs.map((l) => l.from + l.to),
    ["AB", "BE", "EG", "GF", "FD", "DC", "CA"],
  );
  A4.same("guarantee: the longest leg", [T.cut.key, num(T.cut.len)], ["BE", "18.0"]);
  A4.same("guarantee: the five totals", [T.W, T.best.len, T.tourLen, T.walkLen, T.twiceBest].map(num), [
    "75.7",
    "97.6",
    "124.8",
    "151.4",
    "195.2",
  ]);
  A4.same(
    "guarantee: our tour legs",
    T.legs.map((l) => l.from + l.to),
    ["AB", "BC", "CD", "DE", "EF", "FG", "GA"],
  );
  A4.close("guarantee: twice the best", T.twiceBest, 2 * T.best.len, 1e-9);
  A4.close("guarantee: the walk is 2W", T.walkLen, 2 * T.W, 1e-9);
  A4.close("guarantee: what is left without the cut cable", T.cut.pathLen, T.best.len - T.cut.len, 1e-9);
  if (!(T.W <= T.cut.pathLen && T.cut.pathLen <= T.best.len && T.best.len <= T.tourLen && T.tourLen <= T.walkLen))
    throw new Error("guarantee: W <= tree <= best <= tour <= 2W must hold");
  // the six cables left after the cut are a spanning tree: seven towns in one piece with 7 - 1 cables
  const CUT_KEY = T.cut.key;
  const LEFT = T.best.legs.map((l) => A4.key(l.from, l.to)).filter((k) => k !== CUT_KEY);
  A4.same("guarantee: six cables are left", LEFT.length, 6);
  A4.same("guarantee: they link all seven towns", A4.groupsOf(LEFT, T.towns).length, 1);
  const TOUR_KEYS = T.legs.map((l) => A4.key(l.from, l.to));

  // ---------- the number line ----------
  const LINE_Y = 540;
  const X = (v) => 24 + (v - 50) * 5.573;
  const POS = { W: X(T.W), best: X(T.best.len), tour: X(T.tourLen), walk: X(T.walkLen), twice: X(T.twiceBest) };
  A4.same("guarantee: marker positions", Object.values(POS).map(Math.round), [167, 289, 441, 589, 833]);

  // ---------- timeline (local seconds) ----------
  const LINE0 = 0.2; // the number line draws on
  const BEST0 = 0.8; // cable i of the best tour fades in at BEST0 + 0.1 i
  const BEST_MARK = 1.6;
  const CROSS0 = 2.2; // the longest cable is crossed out
  const CUT_RED = 2.6; // ... turns red and fades
  const TREE0 = 2.8; // the six left over turn solid blue
  const TREE_TAG = 3.0;
  const W_MARK = 3.4;
  const TOUR0 = 4.6; // leg i of our tour draws at TOUR0 + 0.1 i
  const TOUR_MARK = 5.6;
  const WALK_MARK = 6.0;
  const TWICE_MARK = 7.0;
  const BRACKET0 = 7.2;
  const BRACKET1 = 8.4;
  const TICK0 = 8.6;

  V.scene({
    kicker: "THE GUARANTEE",
    title: ["The tour is never worse", "than twice the best"],
    dur: 10,
    caps: [
      [0.4, 3.8, "Cut one cable from the best tour: a spanning tree is left."],
      [4.0, 6.8, "So the best tour costs at least W. Ours costs at most 2W."],
      [7.0, 9.6, "Our tour is never worse than twice the best."],
    ],
    build(stage) {
      const m = A4.tspMap(stage, { x: -35, y: -15, s: 1.35 });
      const P = (c) => {
        const p = m.pt(c);
        return [p.x, p.y];
      };

      // blue cables (the spanning tree, then our tour): between the cables and the towns, so the towns stay on top
      const lay = V.s("g");
      m.el.insertBefore(lay, m.el.children[2] || null);
      const BOW = 150; // the way home G to A would run straight through D, so it bows underneath it
      const paths = {};
      const addPath = (from, to, bowed, extra) => {
        const [p, q] = [P(from), P(to)];
        const mid = A4.lerpPt(p, q, 0.5);
        const d = bowed
          ? `M${f1(p[0])} ${f1(p[1])}Q${f1(mid[0])} ${f1(mid[1] + BOW)} ${f1(q[0])} ${f1(q[1])}`
          : `M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}`;
        const el = V.s("path", {
          d,
          pathLength: 1,
          fill: "none",
          "stroke-width": f1(m.r * 0.321 * 1.3),
          "stroke-linecap": "round",
          style: { stroke: "var(--blue)" },
        });
        lay.append(el);
        paths[A4.key(from, to)] = { el, ...extra };
      };
      // the tree first (cables of the best tour, minus the longest), then our tour on top of it
      T.best.legs.forEach((l) => {
        const k = A4.key(l.from, l.to);
        if (k !== CUT_KEY) addPath(l.from, l.to, false, { inTree: true, leg: TOUR_KEYS.indexOf(k) });
      });
      T.legs.forEach((l, i) => {
        const k = A4.key(l.from, l.to);
        if (!paths[k]) addPath(l.from, l.to, l.skipped.length > 1, { inTree: false, leg: i });
      });
      A4.same("guarantee: cables in the blue layer", Object.keys(paths).length, 10);

      // pictograms over the map: the number line and its head, the cross, the bracket, the tick and two short arrows
      const svg = L5.svg(stage);
      const line = svg.appendChild(
        V.s("line", {
          y1: LINE_Y,
          y2: LINE_Y,
          x1: 24,
          "stroke-width": 5,
          "stroke-linecap": "round",
          style: { stroke: "var(--line-2)" },
        }),
      );
      const head = svg.appendChild(
        V.s("path", {
          d: `M890 ${LINE_Y - 13}L916 ${LINE_Y}L890 ${LINE_Y + 13}Z`,
          "stroke-width": 4,
          "stroke-linejoin": "round",
          style: { fill: "var(--line-2)", stroke: "var(--line-2)" },
        }),
      );
      const bracket = svg.appendChild(
        V.s("path", {
          d: `M${f1(POS.best)} 436v-14H${f1(POS.twice)}v14`,
          pathLength: 1,
          fill: "none",
          "stroke-width": 5,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: "var(--violet)" },
        }),
      );
      const mid = m.mid(CUT_KEY);
      const cross = svg.appendChild(L5.cross(mid.x, mid.y, 56, "red"));
      const tick = svg.appendChild(L5.tick(560, 392, 56, "green"));
      const toBest = svg.appendChild(
        L5.arrow(POS.W + 22, LINE_Y, POS.best - 22, LINE_Y, "green", 1, { w: 7, head: 22 }),
      );
      const toWalk = svg.appendChild(
        L5.arrow(POS.tour + 22, LINE_Y, POS.walk - 22, LINE_Y, "orange", 1, { w: 7, head: 22 }),
      );

      const mk = (tone, name, text, v, anchor) => A4.marker(stage, { x: POS[v], y: LINE_Y, tone, name, text, anchor });
      const mW = mk("green", "W", num(T.W), "W");
      const mBest = mk("purple", "best", num(T.best.len), "best");
      const mTour = mk("blue", "tour", num(T.tourLen), "tour");
      const mWalk = mk("orange", "2W", num(T.walkLen), "walk");
      const mTwice = mk("purple", "twice best", num(T.twiceBest), "twice", "right");
      const tagAt = { x: 620, y: 120, solid: true };
      const tagBest = A4.tag(stage, { ...tagAt, text: "best tour", tone: "purple" });
      const tagTree = A4.tag(stage, { ...tagAt, text: "a spanning tree", tone: "blue" });
      const tagTour = A4.tag(stage, { ...tagAt, text: "our tour", tone: "blue" });

      const lin = E.lin;
      return (t) => {
        // --- the map ---
        const gone = ramp(t, TOUR0, TOUR0 + 0.4, lin); // the best tour and the left-over tree make way for our tour
        const edges = {};
        T.best.legs.forEach((l, i) => {
          const a = BEST0 + 0.1 * i;
          const cut = A4.key(l.from, l.to) === CUT_KEY;
          // the dashes stay under the blue cable until it is fully there; the cut cable fades away red
          const o = ramp(t, a, a + 0.3, lin) * (cut ? 1 - ramp(t, CUT_RED, CUT_RED + 0.4, lin) : +(t < TREE0 + 0.6));
          edges[A4.key(l.from, l.to)] = { tone: cut && t >= CUT_RED ? "red" : "purple", dash: true, o };
        });
        const towns = {};
        T.towns.forEach((c, i) => {
          const pk = ramp(t, 0.2 + 0.1 * i, 0.7 + 0.1 * i);
          const b = TREE_TAG + 0.04 * i;
          towns[c] = {
            tone: t >= b ? "blue" : "grey",
            solid: t >= b,
            s: E.pop(pk) * (1 + 0.15 * flash(t, b, b + 0.3)),
            o: Math.min(1, 4 * pk),
          };
        });
        m.update({ edges, towns });

        const tree = ramp(t, TREE0, TREE0 + 0.6, lin);
        Object.values(paths).forEach((p) => {
          // a cable of the tree that our tour also uses stays; the other tree cables go; the rest of our tour draws on
          const k = p.inTree ? 1 : ramp(t, TOUR0 + 0.1 * p.leg, TOUR0 + 0.1 * p.leg + 0.3);
          const o = p.inTree ? (p.leg >= 0 ? tree : tree * (1 - gone)) : k < 0.003 ? 0 : 1;
          p.el.style.strokeDasharray = `${k.toFixed(3)} 2`;
          V.show(p.el, o);
        });

        // --- the number line ---
        const lk = ramp(t, LINE0, LINE0 + 0.7, E.inOut);
        line.setAttribute("x2", f1(24 + (892 - 24) * lk));
        V.show(line, lk < 0.003 ? 0 : 1);
        V.show(head, ramp(t, LINE0 + 0.5, LINE0 + 0.8, lin));
        const pop = (a, d = 0.4) => ramp(t, a, a + d, lin);
        mBest.set({ k: pop(BEST_MARK) });
        mW.set({ k: pop(W_MARK), bump: flash(t, W_MARK + 0.3, W_MARK + 0.6) });
        mTour.set({ k: pop(TOUR_MARK), bump: flash(t, 7.5, 7.9) });
        mWalk.set({ k: pop(WALK_MARK), bump: flash(t, 7.9, 8.3) });
        mTwice.set({ k: pop(TWICE_MARK) });

        // --- tags: they name what the map shows ---
        tagBest.set({ k: pop(1.2) * (1 - ramp(t, CUT_RED, CUT_RED + 0.3, lin)) });
        tagTree.set({ k: pop(TREE_TAG) * (1 - ramp(t, 4.4, 4.7, lin)) });
        tagTour.set({ k: pop(TOUR0 + 0.3) });

        // --- the cross on the longest cable ---
        const ck = ramp(t, CROSS0, CROSS0 + 0.4);
        L5.drawOn(cross, ck);
        V.show(cross, 1 - ramp(t, CUT_RED + 0.4, CUT_RED + 0.7, lin));

        // --- arrows along the line, the bracket and the tick ---
        L5.drawOn(toBest, ramp(t, 4.0, 4.5));
        L5.drawOn(toWalk, ramp(t, 6.3, 6.8));
        const bk = ramp(t, BRACKET0, BRACKET1, E.inOut);
        bracket.style.strokeDasharray = `${bk.toFixed(3)} 2`;
        V.show(bracket, bk < 0.003 ? 0 : 1);
        const tk = ramp(t, TICK0, TICK0 + 0.5);
        L5.drawOn(tick, tk);
        V.place(tick, { s: 0.7 + 0.3 * E.pop(ramp(t, TICK0, TICK0 + 0.6, lin)), o: tk < 0.003 ? 0 : 1 });
      };
    },
  });
})();

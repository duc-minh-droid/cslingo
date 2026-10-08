/* Phase 4 · scene 07-correct: why Prim and Kruskal cannot go wrong.
   Two sticker panels run their four steps side by side on the example network. In every step the cable taken is the
   cheapest cable across SOME cut (Prim: X is the tree grown so far, Kruskal: X is one group), so by the cut property it is
   safe. Different order, the same four cables, the same total.
   Data (asserted when the scene is built): Prim from A (A4.PRIM.steps) takes AC, BC, BD, DE with X = {A}, {A,C}, {A,C,B},
   {A,C,B,D}; Kruskal (A4.KRUSKAL.cuts, one cut per ACCEPTED cable) takes DE, BC, AC, BD with X = {D}, {B}, {A}, {A,B,C}. In every
   step the cable taken is A4.safe(X), the lightest of A4.crossing(X). Both end on A4.MST.keys, total 11.
   Story (local seconds): 0.2-1.0 panels, headers, graphs and empty order slots pop in. Step k (0..3) starts at 1.2 + 2 k and
   lasts 2 s. u = 0-0.4 the cut: a purple blob round X, the cables across it turn orange (solid pills), the rest dims;
   0.5-0.9 the lightest crossing cable pulses and its tile flies from the cable into slot k of the order row; 0.9-1.4 the cable,
   the town it reaches and the tile turn solid green and the other crossing cables dim; 1.4-1.8 blob and orange fade; 1.8-2.0
   hold. 9.2-9.6 both trees flash once. 9.4-10.0 both totals pop reading 11 and the green equals sign pops between them. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const lin = E.lin;

  const S0 = 1.2; // the first step starts
  const STEP = 2.0; // seconds per step
  const END = S0 + 4 * STEP; // 9.2: the last step ends
  const DIM = 0.4; // opacity of cables that are out of play

  // ---------- the real steps, asserted against the storyboard ----------
  const keysOf = (list) => list.map((c) => c.key);
  const PRIM_STEPS = A4.PRIM.steps.map((st) => ({ X: st.X, key: st.pick.key, w: st.pick.w, reach: [st.town] }));
  const KRUSKAL_STEPS = A4.KRUSKAL.cuts.map((c) => ({
    X: c.X,
    key: c.key,
    w: A4.wOf(c.key),
    reach: [c.key[0], c.key[1]],
  }));
  [PRIM_STEPS, KRUSKAL_STEPS].forEach((steps, p) =>
    steps.forEach((st) => {
      st.cross = A4.crossing(st.X); // cheapest first
      A4.same(
        `scene 07: ${["Prim", "Kruskal"][p]} takes ${st.key}, the lightest across ${st.X}`,
        st.cross[0].key,
        st.key,
      );
      A4.same(`scene 07: ${st.key} is A4.safe`, A4.safe(st.X).key, st.key);
    }),
  );
  A4.same("scene 07: Prim cuts", PRIM_STEPS.map((s) => s.X), [["A"], ["A", "C"], ["A", "C", "B"], ["A", "C", "B", "D"]]); // prettier-ignore
  A4.same("scene 07: Prim cables", keysOf(PRIM_STEPS), ["AC", "BC", "BD", "DE"]);
  A4.same("scene 07: Prim crossing", PRIM_STEPS.map((s) => keysOf(s.cross)), [["AC", "AB"], ["BC", "AB", "CD", "CE"], ["BD", "CD", "CE"], ["DE", "CE"]]); // prettier-ignore
  A4.same("scene 07: Kruskal cuts", KRUSKAL_STEPS.map((s) => s.X), [["D"], ["B"], ["A"], ["A", "B", "C"]]); // prettier-ignore
  A4.same("scene 07: Kruskal cables", keysOf(KRUSKAL_STEPS), ["DE", "BC", "AC", "BD"]);
  A4.same("scene 07: Kruskal crossing", KRUSKAL_STEPS.map((s) => keysOf(s.cross)), [["DE", "BD", "CD"], ["BC", "AB", "BD"], ["AC", "AB"], ["BD", "CD", "CE"]]); // prettier-ignore
  const MST_SORTED = A4.MST.keys.slice().sort();
  A4.same("scene 07: Prim tree is the MST", keysOf(PRIM_STEPS).sort(), MST_SORTED);
  A4.same("scene 07: Kruskal tree is the MST", keysOf(KRUSKAL_STEPS).sort(), MST_SORTED);
  A4.same("scene 07: Prim total", A4.sumOf(keysOf(PRIM_STEPS)), A4.MST.total);
  A4.same("scene 07: Kruskal total", A4.sumOf(keysOf(KRUSKAL_STEPS)), A4.MST.total);
  A4.same("scene 07: the total is 11", A4.MST.total, 11);
  const TOTAL = String(A4.MST.total);

  const PANELS = [
    // xAt: where the purple "X" tag sits for each step (stage px, top-left), on the outline of that step's blob
    { head: "Prim: X is the tree", steps: PRIM_STEPS, dx: 0, delay: 0, start: "A", xAt: [[18, 298], [18, 298], [18, 298], [18, 298]] }, // prettier-ignore
    { head: "Kruskal: X is a group", steps: KRUSKAL_STEPS, dx: 468, delay: 0.1, start: null, xAt: [[836, 106], [532, 98], [486, 298], [486, 298]] }, // prettier-ignore
  ];
  const stepAt = (t) => (t < S0 || t >= END ? -1 : Math.floor((t - S0) / STEP));
  const startOf = (j) => S0 + STEP * j;

  V.scene({
    kicker: "WHY BOTH ARE CORRECT",
    title: ["Every step is", "a safe cut"],
    dur: 11,
    caps: [
      [0.4, 3.0, "Every cable they take is the cheapest across some cut."],
      [3.2, 7.0, "Prim cuts off its tree. Kruskal cuts off one group."],
      [7.2, 10.5, "Both only make safe choices, so both find the same tree."],
    ],
    build(stage) {
      const panels = PANELS.map((P) => {
        const { dx, steps } = P;
        const card = V.h("div", {
          class: "v-card plain c-grey",
          style: { left: `${12 + dx}px`, top: "8px", width: "444px", height: "520px" },
        });
        stage.append(card);
        const head = A4.tag(stage, { x: 26 + dx, y: 22, text: P.head });
        const g = A4.net(stage, { x: 32 + dx, y: 100, s: 0.68, blobs: 2 });
        const xTag = A4.tag(stage, { x: 0, y: 0, text: "X", tone: "purple", solid: true });
        const slots = A4.tiles(stage, {
          x: 23 + dx,
          y: 430,
          items: steps.map(() => ""),
          w: 98,
          h: 48,
          gap: 10,
          fs: 28,
        });
        const tiles = A4.tiles(stage, {
          x: 23 + dx,
          y: 430,
          items: steps.map((s) => `${s.key} ${s.w}`),
          w: 98,
          h: 48,
          gap: 10,
          fs: 28,
        });
        // when each town turns solid green: Prim's start town at once, every other town when the cable that reaches it does
        const greenAt = {};
        if (P.start) greenAt[P.start] = S0;
        steps.forEach((st, j) => st.reach.forEach((town) => (greenAt[town] = greenAt[town] ?? startOf(j) + 0.9)));
        return { ...P, card, head, g, xTag, slots, tiles, greenAt };
      });

      // totals under the panels and the equals sign between them
      const totals = [190, 506].map((x) =>
        A4.total(stage, { x, y: 548, w: 240, h: 80, label: "total", tone: "green" }),
      );
      const svg = L5.svg(stage);
      const eq = svg.appendChild(A4.equals(468, 588, 52, "green"));

      function updatePanel(P, t) {
        const { steps, g, xTag, tiles, slots, greenAt } = P;
        const kin = ramp(t, 0.2 + P.delay, 0.8 + P.delay, lin);
        V.place(P.card, { s: 0.92 + 0.08 * E.pop(kin), o: clamp(kin * 4) });
        P.head.set({ k: ramp(t, 0.3 + P.delay, 0.8 + P.delay, lin) });
        slots.all(() => ({ ghost: true, text: "", s: 0.85 + 0.15 * E.pop(kin), o: clamp(kin * 3) }));

        const k = stepAt(t);
        const u = k < 0 ? 0 : t - startOf(k);
        const dim = t < S0 ? 1 : lerp(1, DIM, ramp(t, S0, S0 + 0.4, lin));
        const endFlash = flash(t, END, END + 0.4);

        // cables
        const edges = {};
        A4.EDGE_KEYS.forEach((key) => {
          const j = steps.findIndex((st) => st.key === key);
          const greenFrom = j >= 0 ? startOf(j) + 0.9 : Infinity;
          const st = k >= 0 ? steps[k] : null;
          let e = { tone: "grey", o: dim };
          if (t >= greenFrom) {
            const arrive = flash(t, greenFrom, greenFrom + 0.5);
            e = { tone: "green", solid: true, w: 1 + 0.25 * arrive, halo: Math.max(arrive, endFlash) };
          } else if (st && st.cross.some((c) => c.key === key)) {
            const picked = key === st.key;
            const cut = flash(u, 0, 0.5) * 0.5; // a soft halo as the cut lights its cables
            if (picked) {
              const pulse = flash(u, 0.5, 0.9);
              e = { tone: "orange", solid: true, w: 1.2 + 0.25 * pulse, halo: Math.max(cut, pulse) };
            } else if (u < 1.4) {
              e = { tone: "orange", solid: true, w: 1.2, halo: cut, o: lerp(1, 0.6, ramp(u, 0.9, 1.3, lin)) };
            } else if (u < 1.6) {
              e = { tone: "orange", solid: true, w: 1.2, o: 0.6 * (1 - ramp(u, 1.4, 1.6, lin)) };
            } else {
              e = { tone: "grey", o: DIM * ramp(u, 1.6, 1.8, lin) };
            }
          }
          edges[key] = e;
        });

        // towns
        const towns = {};
        A4.TOWNS.forEach((town) => {
          if (t >= greenAt[town]) {
            towns[town] = { tone: "green", solid: true, s: 1 + 0.2 * flash(t, greenAt[town], greenAt[town] + 0.5) };
          }
        });

        // the cut: a purple blob round X, in and out inside its own step
        const cut = k < 0 ? 0 : ramp(u, 0, 0.4) * (1 - ramp(u, 1.4, 1.8, lin));
        g.update({
          edges,
          towns,
          blobs: k < 0 ? [] : [{ set: steps[k].X, tone: "purple", k: cut }],
          o: clamp(kin * 2),
        });
        const [xx, xy] = P.xAt[Math.max(k, 0)];
        xTag.set({ k: cut, x: xx, y: xy });

        // the order row: each tile flies from its cable into its slot, orange at first, then green
        steps.forEach((st, j) => {
          const uj = t - startOf(j);
          if (uj < 0.5) return tiles.set(j, { o: 0 });
          if (uj < 0.9) {
            const f = ramp(uj, 0.5, 0.9);
            const from = g.mid(st.key);
            const to = tiles.mid(j);
            return tiles.set(j, {
              tone: "orange",
              x: (from.x - to.x) * (1 - f),
              y: (from.y - to.y) * (1 - f),
              s: lerp(0.55, 1, f),
              o: clamp((uj - 0.5) * 10),
            });
          }
          tiles.set(j, { tone: "green", solid: true, s: 1 + 0.12 * flash(uj, 0.9, 1.3) });
        });
      }

      return (t) => {
        panels.forEach((P) => updatePanel(P, t));
        const kt = ramp(t, 9.4, 10.0, lin);
        totals.forEach((c) => c.set({ text: TOTAL, solid: true, k: kt, bump: flash(t, 9.7, 10.1) }));
        const ke = ramp(t, 9.6, 10.1, lin);
        V.place(eq, { s: lerp(0.6, 1, E.pop(ke)), o: clamp(ke * 5) });
      };
    },
  });
})();

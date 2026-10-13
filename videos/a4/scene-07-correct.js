/* Phase 4 · scene 07-correct: why Prim and Kruskal cannot go wrong.
   Two sticker panels on the example network, run ONE AFTER THE OTHER (the panel that is running gets a blue edge and a solid
   header, the other waits, so the viewer follows one thing at a time). In every step the cable taken is the cheapest cable across
   SOME cut (Prim: X is the tree grown so far, Kruskal: X is one group), so by the cut property it is safe. Different order, the
   same four cables, the same total.
   Data (asserted when the scene is built): Prim from A (A4.PRIM.steps) takes AC, BC, BD, DE with X = {A}, {A,C}, {A,C,B},
   {A,C,B,D}; Kruskal (A4.KRUSKAL.cuts, one cut per ACCEPTED cable) takes DE, BC, AC, BD with X = {D}, {B}, {A}, {A,B,C}. In every
   step the cable taken is A4.safe(X), the lightest of A4.crossing(X). Both end on A4.MST.keys, total 11.
   Story (local seconds): 0.2-1.0 both panels pop in. Prim's four steps start at 1.1 / 2.5 / 3.6 / 4.7, Kruskal's at 6.1 / 7.5 /
   8.6 / 9.7 (a step is 1.4 s for the first of a panel, 1.1 s after). In a step, as a fraction q of its length: 0-0.28 the cut (a
   purple outline round X, the cables across it turn orange, the rest dims), 0.3-0.55 the lightest crossing cable pulses and its
   tile flies from the cable into the order row, 0.55 the cable, the town it reaches and the tile turn solid green, 0.8-1 the cut
   and the orange fade. 10.8-11.3 both trees flash and both totals pop reading 11 with a green equals sign between them. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const lin = E.lin;

  const LENS = [1.4, 1.1, 1.1, 1.1]; // seconds per step: the first of a panel is slower, the rest follow the same pattern
  const STARTS = (first) => LENS.map((_, j) => first + LENS.slice(0, j).reduce((a, b) => a + b, 0));
  const FINAL = 10.8; // both trees are finished
  const DIM = 0.4; // opacity of cables that are out of play (their weights stay readable)

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
    { name: "prim", head: "Prim: X is the tree", steps: PRIM_STEPS, dx: 0, starts: STARTS(1.1), sides: ["above", "auto", "auto", "auto"] }, // prettier-ignore
    { name: "kruskal", head: "Kruskal: X is a group", steps: KRUSKAL_STEPS, dx: 468, starts: STARTS(6.1), sides: ["right", "left", "above", "auto"] }, // prettier-ignore
  ];
  A4.same(
    "scene 07: Prim runs first, then Kruskal",
    [PANELS[0].starts[3] + LENS[3] <= PANELS[1].starts[0], PANELS[1].starts[3] + LENS[3] <= FINAL],
    [true, true],
  );
  // where the purple "X" tag sits, just outside the outline round X (r + 18 beyond the towns). side: "above" / "left" / "right" of a
  // single town, or "auto": beside the up-left edge of the outline round several towns
  function xTagAt(points, pad, panelX, side) {
    const [p] = points;
    const far = pad + 26;
    let c;
    if (side === "above") c = [p[0] - 20, p[1] - far];
    else if (side === "left") c = [p[0] - far - 4, p[1]];
    else if (side === "right") c = [p[0] + far, p[1] - 26];
    else {
      const h = A4.hull(points);
      const lean = (n) => n[0] + 0.6 * n[1]; // the smaller, the more left and up
      const edges = h.length === 2 ? [h, h.slice().reverse()] : h.map((q, i) => [q, h[(i + 1) % h.length]]);
      const best = edges
        .map(([q, r]) => {
          const d = Math.hypot(r[0] - q[0], r[1] - q[1]) || 1;
          return { n: [(r[1] - q[1]) / d, -(r[0] - q[0]) / d], mid: [(q[0] + r[0]) / 2, (q[1] + r[1]) / 2] };
        })
        .sort((u, v) => lean(u.n) - lean(v.n))[0];
      c = [best.mid[0] + best.n[0] * (pad + 24), best.mid[1] + best.n[1] * (pad + 24)];
    }
    return [Math.max(panelX + 10, c[0] - 25), Math.max(80, c[1] - 23)];
  }
  const stepAt = (P, t) => P.starts.findIndex((st, j) => t >= st && t < st + LENS[j]);

  V.scene({
    kicker: "WHY BOTH ARE CORRECT",
    title: ["Every step is", "a safe cut"],
    dur: 13,
    caps: [
      [0.4, 2.7, "Prim: the cut is the tree so far."],
      [2.8, 5.9, "It takes the cheapest cable across the cut."],
      [6.1, 8.2, "Kruskal: the cut is one group."],
      [8.3, 10.7, "Same rule: the cheapest cable across."],
      [10.9, 12.8, "Only safe choices, so the same tree."],
    ],
    build(stage) {
      const panels = PANELS.map((P) => {
        const { dx, steps } = P;
        const card = V.h("div", {
          class: "v-card plain c-grey",
          style: { left: `${12 + dx}px`, top: "14px", width: "444px", height: "500px" },
        });
        stage.append(card);
        const head = A4.tag(stage, { x: 26 + dx, y: 28, text: P.head });
        const g = A4.net(stage, { x: 32 + dx, y: 100, s: 0.68, blobs: 2 });
        const xTag = A4.tag(stage, { x: 0, y: 0, text: "X", tone: "purple", solid: true });
        const slots = A4.tiles(stage, {
          x: 23 + dx,
          y: 424,
          items: steps.map(() => ""),
          w: 98,
          h: 48,
          gap: 10,
          fs: 28,
        });
        const tiles = A4.tiles(stage, {
          x: 23 + dx,
          y: 424,
          items: steps.map((s) => `${s.key} ${s.w}`),
          w: 98,
          h: 48,
          gap: 10,
          fs: 28,
        });
        // the outline round X is r + 18 beyond the towns: the X tag sits on its up-left edge
        const xAt = steps.map((st, j) =>
          xTagAt(
            st.X.map((c) => [g.pt(c).x, g.pt(c).y]),
            g.r + 18,
            12 + dx,
            P.sides[j],
          ),
        );
        // when each town turns solid green: Prim's start town when its run starts, every other town when its cable is taken
        const greenAt = {};
        const takenAt = (j) => P.starts[j] + 0.55 * LENS[j];
        if (P.name === "prim") greenAt.A = P.starts[0];
        steps.forEach((st, j) => st.reach.forEach((town) => (greenAt[town] = greenAt[town] ?? takenAt(j))));
        return { ...P, card, head, g, xTag, slots, tiles, greenAt, takenAt, xAt };
      });

      // totals under the panels and the equals sign between them
      const totals = [190, 506].map((x) =>
        A4.total(stage, { x, y: 534, w: 240, h: 80, label: "total", tone: "green" }),
      );
      const svg = L5.svg(stage);
      const eq = svg.appendChild(A4.equals(468, 574, 52, "green"));

      function updatePanel(P, t) {
        const { steps, g, xTag, tiles, slots, greenAt, takenAt } = P;
        const kin = ramp(t, 0.2 + 0.1 * (P.dx > 0), 0.8 + 0.1 * (P.dx > 0), lin);
        V.place(P.card, { s: 0.92 + 0.08 * E.pop(kin), o: clamp(kin * 4) });
        slots.all(() => ({ ghost: true, text: "", s: 0.85 + 0.15 * E.pop(kin), o: clamp(kin * 3) }));

        const k = stepAt(P, t);
        const q = k < 0 ? 0 : (t - P.starts[k]) / LENS[k];
        const running = k >= 0 || (t >= P.starts[0] - 0.3 && t < P.starts[3] + LENS[3]);
        P.card.className = `v-card plain c-${running ? "blue" : "grey"}`;
        P.head.set({ k: ramp(t, 0.3, 0.8, lin), tone: running ? "blue" : "grey", solid: running });
        const dim = t < P.starts[0] ? 1 : lerp(1, DIM, ramp(t, P.starts[0], P.starts[0] + 0.3, lin));
        const endFlash = flash(t, FINAL, FINAL + 0.4);

        // cables
        const edges = {};
        A4.EDGE_KEYS.forEach((key) => {
          const j = steps.findIndex((st) => st.key === key);
          const greenFrom = j >= 0 ? takenAt(j) : Infinity;
          const st = k >= 0 ? steps[k] : null;
          let e = { tone: "grey", o: dim };
          if (t >= greenFrom) {
            const arrive = flash(t, greenFrom, greenFrom + 0.4);
            e = { tone: "green", solid: true, w: 1 + 0.25 * arrive, halo: Math.max(arrive, endFlash) };
          } else if (st && st.cross.some((c) => c.key === key)) {
            const picked = key === st.key;
            const cut = flash(q, 0, 0.35) * 0.5; // a soft halo as the cut lights its cables
            if (picked) {
              const pulse = flash(q, 0.3, 0.55);
              e = { tone: "orange", solid: true, w: 1.2 + 0.25 * pulse, halo: Math.max(cut, pulse) };
            } else if (q < 0.8) {
              e = { tone: "orange", solid: true, w: 1.2, halo: cut, o: lerp(1, 0.6, ramp(q, 0.55, 0.75, lin)) };
            } else {
              const r = ramp(q, 0.8, 1, lin); // orange fades out, then the cable comes back as a dimmed grey one
              e =
                r < 0.5
                  ? { tone: "orange", solid: true, w: 1.2, o: 0.6 * (1 - 2 * r) }
                  : { tone: "grey", o: DIM * (2 * r - 1) };
            }
          }
          edges[key] = e;
        });

        // towns
        const towns = {};
        A4.TOWNS.forEach((town) => {
          if (t >= greenAt[town]) {
            towns[town] = { tone: "green", solid: true, s: 1 + 0.2 * flash(t, greenAt[town], greenAt[town] + 0.4) };
          }
        });

        // the cut: a purple outline round X, in and out inside its own step
        const cut = k < 0 ? 0 : ramp(q, 0, 0.28, lin) * (1 - ramp(q, 0.8, 1, lin));
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
          const qj = (t - P.starts[j]) / LENS[j];
          if (qj < 0.3) return tiles.set(j, { o: 0 });
          if (qj < 0.55) {
            const f = ramp(qj, 0.3, 0.55);
            const from = g.mid(st.key);
            const to = tiles.mid(j);
            return tiles.set(j, {
              tone: "orange",
              x: (from.x - to.x) * (1 - f),
              y: (from.y - to.y) * (1 - f),
              s: lerp(0.55, 1, f),
              o: clamp((qj - 0.3) * 20),
            });
          }
          tiles.set(j, { tone: "green", solid: true, s: 1 + 0.12 * flash(t, takenAt(j), takenAt(j) + 0.4) });
        });
      }

      return (t) => {
        panels.forEach((P) => updatePanel(P, t));
        const kt = ramp(t, FINAL + 0.1, FINAL + 0.6, lin);
        totals.forEach((c) => c.set({ text: TOTAL, solid: true, k: kt, bump: flash(t, FINAL + 0.4, FINAL + 0.8) }));
        const ke = ramp(t, FINAL + 0.3, FINAL + 0.8, lin);
        V.place(eq, { s: lerp(0.6, 1, E.pop(ke)), o: clamp(ke * 5) });
      };
    },
  });
})();

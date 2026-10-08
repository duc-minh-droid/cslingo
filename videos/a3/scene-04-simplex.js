/* Algorithms Phase 3 · scene 04-simplex: the simplex walk on the lesson's LP (a3-simplex).
   Stand on a corner, ask two questions, walk, repeat: (0,0) -> (5,0) -> (4,3), never (0,5).
   Question 1 "which direction gains most?" is a signed bar card (gain of z per unit of each non-basic variable, A3.SIMPLEX).
   Question 2 "how far can it grow?" is the ratio test card (the smallest limit wins and that rule leaves). The walk follows
   the real pivots; at (4,3) both gains are negative, so it stops. Every number comes from A3.SIMPLEX (exact fractions) and is
   asserted when the scene is built. update(t) is a pure function of t. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;

  // ---------- the facts (asserted) ----------
  const [S0, S1] = A3.SIMPLEX.steps;
  const FIN = A3.SIMPLEX.final;
  const { need, qv, qt } = A3;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const visited = [S0.from, S0.to, S1.to];
  need(
    same(visited, [
      [0, 0],
      [5, 0],
      [4, 3],
    ]) && same(FIN.at, S1.to),
    "simplex visits (0,0), (5,0), (4,3)",
  );
  need(
    same(
      A3.CORNERS.filter((c) => !visited.some((v) => same(v, c))),
      [[0, 5]],
    ),
    "the corner (0,5) is never visited",
  );
  need(S0.enter === "x" && S1.enter === "y", "x enters first, then y");
  need(S0.from[1] === 0 && S0.to[1] === 0, "pivot 1 walks along the x-axis");
  need(3 * S0.to[0] + S0.to[1] === 15 && 3 * S1.to[0] + S1.to[1] === 15, "pivot 2 walks along the material line");
  need(S0.zTo === 15 && S1.zTo === 18 && FIN.z === 18 && S0.z === 0 && S1.z === 15, "z along the walk");
  need(
    FIN.gains.every((g) => qv(g) < 0),
    "no gain left at the end",
  );

  const VAR = { x: "x", y: "y", s1: "s<sub>1</sub>", s2: "s<sub>2</sub>" };
  const gainState = (nb, gains, order) => ({
    labels: order.map((i) => VAR[nb[i]]),
    vals: order.map((i) => qv(gains[i])),
    texts: order.map((i) => (qv(gains[i]) > 0 ? "+" : "") + qt(gains[i])),
    tones: order.map((i) => (qv(gains[i]) > 0 ? "green" : "red")),
  });
  const GAINS = [
    gainState(S0.nb, S0.gains, [0, 1]),
    gainState(S1.nb, S1.gains, [1, 0]), // y (+1) on top, s2 (-1) below
    gainState(FIN.nb, FIN.gains, [0, 1]),
  ];
  need(
    GAINS.map((g) => g.labels.join("|") + g.texts.join("|")).join(" ") ===
      "x|y+3|+2 y|s<sub>2</sub>+1|−1 s<sub>2</sub>|s<sub>1</sub>−4/5|−3/5",
    "gain rows",
  );
  const ratioState = (st) => {
    const vals = st.ratios.map((r) => qv(r.val));
    const hi = vals.indexOf(Math.min(...vals));
    need(st.ratios[hi].row === st.leave, "the smallest ratio is the row that leaves");
    return { labels: st.ratios.map((r) => A3.ROW_NAME[r.row]), vals, texts: vals.map((v) => A3.fmt(v)), hi };
  };
  const RATIOS = [ratioState(S0), ratioState(S1)];
  need(
    RATIOS.map((r) => `${r.labels.join("|")} ${r.texts.join("|")} ${r.hi}`).join(" ; ") ===
      "machine|material 10|5 1 ; machine|y-axis 3|15 0",
    "ratio rows",
  );

  // ---------- timings (local seconds) ----------
  const T = {
    ring0: 2.6, // x enters: highlight + ring
    walk1: [4.8, 5.9],
    walk2: [8.9, 10.0],
    swap1: 6.2, // gains card empties, refills for (5,0)
    swap2: 10.4, // and again for (4,3)
  };
  const pt = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const pop = (t, a, d = 0.5) => {
    const k = ramp(t, a, a + d, lin);
    return { k, s: 0.8 + 0.2 * E.pop(k), o: Math.min(1, k * 4) };
  };
  const holder = (stage) => {
    const e = V.h("div", { style: { position: "absolute", left: "0", top: "0", pointerEvents: "none" } });
    stage.append(e);
    return e;
  };
  /** a bars card inside its own holder, so the whole card can pop (scale + fade) about its centre */
  const card = (stage, opt) => {
    const h = holder(stage);
    const B = A3.bars(h, { ...opt, x: 0, y: 0 });
    Object.assign(h.style, { left: `${opt.x}px`, top: `${opt.y}px`, width: `${B.w}px`, height: `${B.h}px` });
    return { B, h };
  };
  /** gains card: which phase are we in, and how far has each row grown (0..1)? */
  function gainPhase(t) {
    const rows = (a, d) => [0, 1].map((i) => ramp(t, a + 0.2 * i, a + d + 0.2 * i));
    if (t < T.swap1) return { st: 0, g: [0, 1].map((i) => ramp(t, 1.6 + 0.3 * i, 2.1 + 0.3 * i)) };
    if (t < T.swap1 + 0.3) return { st: 0, g: Array(2).fill(1 - ramp(t, T.swap1, T.swap1 + 0.3, E.inOut)) };
    if (t < T.swap2) return { st: 1, g: rows(6.5, 0.4) };
    if (t < T.swap2 + 0.3) return { st: 1, g: Array(2).fill(1 - ramp(t, T.swap2, T.swap2 + 0.3, E.inOut)) };
    return { st: 2, g: rows(10.7, 0.4) };
  }

  V.scene({
    kicker: "SIMPLEX",
    title: ["Walk corner to corner,", "never the middle"],
    dur: 15,
    caps: [
      [0.4, 3.4, "Start at a corner. Which direction gains most?"],
      [3.6, 7.6, "Walk until the nearest rule blocks the way."],
      [7.8, 10.4, "Repeat from the new corner."],
      [10.6, 14.2, "No direction gains: the corner is optimal."],
    ],
    build(stage) {
      // ----- the plot -----
      const P = A3.plot(stage, {
        x: 0,
        y: 0,
        w: 480,
        h: 560,
        view: [-0.6, 7, -0.6, 7],
        equal: true,
        axes: "origin",
        xticks: [0, 1, 2, 3, 4, 5, 6],
        yticks: [0, 1, 2, 3, 4, 5, 6],
        pad: { l: 52, r: 20, t: 20, b: 56 },
      });
      const poly = P.poly({ tone: "green" });
      const l1 = P.eq(1, 2, 10, { w: 5 });
      const l2 = P.eq(3, 1, 15, { w: 5 });
      const trail = P.path({ tone: "blue", w: 8 });
      const dots = A3.CORNERS.map(() => P.dot({ tone: "grey", r: 9 }));
      const arrow = P.arrow({ tone: "orange", w: 6 });
      const token = P.dot({ tone: "blue", r: 15 });
      const star = A3.star(P.over, { size: 52 });
      const xName = P.text({ tone: "grey" });
      const yName = P.text({ tone: "grey" });

      // ----- the right column -----
      const gain = card(stage, {
        x: 504,
        y: 0,
        w: 432,
        rows: [{ label: "x" }, { label: "y" }],
        min: -1,
        max: 3,
        labelW: 64,
        valW: 70,
        title: "gain per unit of z",
      });
      const ratio = card(stage, {
        x: 504,
        y: 228,
        w: 432,
        rows: [
          { label: "machine", tone: "grey" },
          { label: "material", tone: "grey" },
        ],
        min: 0,
        max: 15,
        labelW: 160,
        valW: 50,
        title: "how far can it grow?",
      });
      const zStat = A3.stat(stage, { x: 504, y: 456, w: 432, label: "profit z", tone: "orange" });
      const done = A3.sticker(stage, {
        x: 504,
        y: 228,
        w: 432,
        h: 64,
        text: "no gain left: optimal",
        tone: "green",
        icon: "tick",
      });

      return (t) => {
        // ----- where the token is, and the walk so far -----
        const k1 = ramp(t, T.walk1[0], T.walk1[1], E.inOut);
        const k2 = ramp(t, T.walk2[0], T.walk2[1], E.inOut);
        const tok = k2 > 0 ? pt(S1.from, S1.to, k2) : pt(S0.from, S0.to, k1);
        const z = Math.round(k2 > 0 ? lerp(S1.z, S1.zTo, k2) : lerp(S0.z, S0.zTo, k1));
        const trailPts = t < T.walk1[0] ? [] : k2 > 0 ? [S0.from, S0.to, tok] : [S0.from, tok];

        // ----- plot -----
        P.set({ o: ramp(t, 0, 0.8, lin) });
        poly.set({ pts: A3.CORNERS });
        // the rule that blocks the way turns orange while its ratio row is the smallest
        const stop1 = ramp(t, 4.6, 4.9, lin) * (1 - ramp(t, T.swap1, T.swap1 + 0.3, lin));
        const stop2 = ramp(t, 8.7, 9.0, lin) * (1 - ramp(t, T.swap2, T.swap2 + 0.3, lin));
        l1.set({ tone: stop2 > 0.5 ? "orange" : "purple" });
        l2.set({ tone: stop1 > 0.5 ? "orange" : "purple" });
        trail.set({ pts: trailPts });
        dots.forEach((d, i) => {
          const c = A3.CORNERS[i];
          const seen =
            (same(c, S0.from) && t >= 0.6) ||
            (same(c, S0.to) && t >= T.walk1[1]) ||
            (same(c, S1.to) && t >= T.walk2[1]);
          d.set({ x: c[0], y: c[1], tone: seen ? "blue" : "grey" });
        });
        // arrows: first along the x-axis (x enters), then up the material edge (y enters)
        const a1 = ramp(t, 3.0, 3.5);
        const a2 = ramp(t, 7.2, 7.8);
        const fade1 = 1 - ramp(t, T.walk1[0], T.walk1[0] + 0.5, lin);
        const fade2 = 1 - ramp(t, T.walk2[0], T.walk2[0] + 0.5, lin);
        const dir1 = pt(S0.from, S0.to, 0.48);
        const dir2 = pt(S1.from, S1.to, 0.45);
        if (t < 6.2) arrow.set({ x1: S0.from[0], y1: S0.from[1], x2: dir1[0], y2: dir1[1], k: a1, o: fade1 });
        else arrow.set({ x1: S1.from[0], y1: S1.from[1], x2: dir2[0], y2: dir2[1], k: a2, o: fade2 });
        const born = pop(t, 0.6, 0.4);
        const ringK = Math.max(
          ramp(t, T.ring0, T.ring0 + 0.3, lin) * (1 - ramp(t, T.walk1[1], T.walk1[1] + 0.3, lin)),
          ramp(t, 7.1, 7.4, lin) * (1 - ramp(t, T.walk2[1], T.walk2[1] + 0.3, lin)),
        );
        token.set({
          x: tok[0],
          y: tok[1],
          s: born.s,
          o: born.o,
          tone: t >= 11.0 ? "green" : "blue",
          ring: "orange",
          ringK,
        });
        const sp = ramp(t, 11.0, 11.5, lin);
        star.set({ x: P.px(4), y: P.py(3) - 44, s: sp > 0 ? E.pop(sp) : 0, o: Math.min(1, sp * 5) });
        xName.set({ text: "x", x: 6.75, y: 0, dy: -16 });
        yName.set({ text: "y", x: 0, y: 7.3, dx: 26, dy: 8 });

        // ----- question 1: which direction gains most? -----
        const gp = gainPhase(t);
        const gs = GAINS[gp.st];
        const gPop = pop(t, 1.3, 0.4);
        const hiG = gp.st === 0 && t >= T.ring0 ? 0 : gp.st === 1 && t >= 7.1 ? 0 : null;
        V.place(gain.h, { s: gPop.s, o: gPop.o });
        gain.B.set({
          vals: gs.vals.map((v, i) => v * gp.g[i]),
          k: 1,
          tones: gs.tones,
          texts: gs.texts,
          labels: gs.labels,
          rowO: gp.g.map((g) => Math.min(1, g * 4)),
          hi: hiG,
        });

        // ----- question 2: how far can it grow? (the ratio test) -----
        const second = t >= 7;
        const rs = RATIOS[second ? 1 : 0];
        const rPop = second ? pop(t, 8.0, 0.4) : pop(t, 3.6, 0.4);
        const rOut = second ? 1 - ramp(t, 10.8, 11.2, lin) : 1 - ramp(t, T.swap1, T.swap1 + 0.3, lin);
        const rStart = second ? 8.1 : 3.9;
        const rG = [0, 1].map((i) =>
          ramp(t, rStart + (second ? 0.2 : 0.3) * i, rStart + (second ? 0.4 : 0.45) + (second ? 0.2 : 0.3) * i),
        );
        const lit = t >= (second ? 8.7 : 4.6);
        V.place(ratio.h, { s: rPop.s, o: Math.min(rPop.o, rOut) });
        ratio.B.set({
          vals: rs.vals.map((v, i) => v * rG[i]),
          k: 1,
          tones: rs.vals.map((_, i) => (lit && i === rs.hi ? "orange" : "grey")),
          texts: rs.texts,
          labels: rs.labels,
          rowO: rG.map((g) => Math.min(1, g * 4)),
          hi: lit ? rs.hi : null,
        });

        // ----- profit z and the verdict -----
        const zp = pop(t, 0.8, 0.4);
        zStat.set({ text: String(z), s: zp.s, o: zp.o, bump: Math.max(flash(t, 5.8, 6.3), flash(t, 10.0, 10.5)) });
        done.set({ k: ramp(t, 11.4, 11.9, lin) });
      };
    },
  });
})();

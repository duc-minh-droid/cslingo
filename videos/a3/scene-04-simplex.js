/* Algorithms Phase 3 · scene 04-simplex: the simplex walk on the lesson's LP (a3-simplex).
   Stand on a corner, ask two questions, walk, repeat: (0,0) -> (5,0) -> (4,3), never (0,5).
   Question 1 "which direction gains most?" is a signed bar card (z gained per unit of each non-basic variable, A3.SIMPLEX); every
   row is also drawn as a short arrow from the corner (green gains, red loses, the chosen one orange and thick) so the card and the
   plot say the same thing. The two slack variables are defined on screen when they first appear: s1 = machine hours left over,
   s2 = material left over (moving off a rule line leaves some of it over, which costs profit); the rules are named on their lines.
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

  const VAR = { x: "x", y: "y", s1: "s1", s2: "s2" };
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
    GAINS.map((g) => g.labels.join("|") + g.texts.join("|")).join(" ") === "x|y+3|+2 y|s2+1|−1 s2|s1−4/5|−3/5",
    "gain rows",
  );
  const ratioState = (st) => {
    const vals = st.ratios.map((r) => qv(r.val));
    const hi = vals.indexOf(Math.min(...vals));
    need(st.ratios[hi].row === st.leave, "the smallest ratio is the row that leaves");
    return { labels: st.ratios.map((r) => A3.ROW_NAME[r.row].replace("-", " ")), vals, texts: vals.map((v) => A3.fmt(v)), hi };
  };
  const RATIOS = [ratioState(S0), ratioState(S1)];
  need(
    RATIOS.map((r) => `${r.labels.join("|")} ${r.texts.join("|")} ${r.hi}`).join(" ; ") ===
      "machine|material 10|5 1 ; machine|y axis 3|15 0",
    "ratio rows",
  );

  // ---------- the candidate directions: one short arrow per row of the gain card (same order as GAINS) ----------
  // from = the corner, to = the arrow tip (data coordinates), tag = where the variable's name sits (stage px from the tip)
  const DIRS = [
    {
      from: S0.from,
      c: [
        { to: [1.7, 0], tag: [40, 2] }, // x grows: along the x-axis
        { to: [0, 1.7], tag: [2, -36] }, // y grows: along the y-axis
      ],
    },
    {
      from: S1.from,
      c: [
        { to: pt(S1.from, S1.to, 0.45), tag: [-36, -34] }, // y grows: up the material edge (s2 stays 0)
        { to: [3.3, 0], tag: [-46, 2] }, // s2 grows: back along the x-axis (material left over)
      ],
    },
    {
      from: FIN.at,
      c: [
        { to: pt(FIN.at, [0, 5], 0.35), tag: [-38, -26] }, // s2 grows: along the machine edge towards (0,5)
        { to: pt(FIN.at, S1.from, 0.45), tag: [46, 20] }, // s1 grows: along the material edge towards (5,0)
      ],
    },
  ];
  need(
    DIRS[1].c[1].to[1] === 0 && S1.from[1] === 0 && Math.abs(3 * DIRS[1].c[0].to[0] + DIRS[1].c[0].to[1] - 15) < 1e-9,
    "arrows: s2 stays on the x-axis, y stays on the material line",
  );
  need(
    Math.abs(DIRS[2].c[0].to[0] + 2 * DIRS[2].c[0].to[1] - 10) < 1e-9 &&
      Math.abs(3 * DIRS[2].c[1].to[0] + DIRS[2].c[1].to[1] - 15) < 1e-9,
    "arrows at (4,3): s2 along the machine line, s1 along the material line",
  );
  const CHOSEN = [0, 0, null]; // x enters, then y; nothing at the end

  // ---------- timings (local seconds) ----------
  const T = {
    arrows: [2.0, 7.2, 12.2], // the candidate arrows grow (0.4 s each, 0.2 s apart)
    enter: [2.9, 8.0], // the entering variable is chosen: orange row, arrow and ring
    ratio: [3.6, 8.6], // the ratio card pops
    stop: [4.6, 9.5], // the blocking rule turns orange
    walk1: [4.9, 6.0],
    walk2: [9.8, 10.9],
    swap1: 6.3, // gains card empties, refills for (5,0)
    swap2: 11.2, // and again for (4,3)
    s2: 6.7, // slack definitions pop (s2 when it first appears, s1 when the machine rule starts to block)
    s1: 9.6,
  };
  function pt(a, b, k) {
    return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  }
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
    if (t < T.swap2) return { st: 1, g: rows(6.8, 0.4) };
    if (t < T.swap2 + 0.3) return { st: 1, g: Array(2).fill(1 - ramp(t, T.swap2, T.swap2 + 0.3, E.inOut)) };
    return { st: 2, g: rows(11.8, 0.4) };
  }

  V.scene({
    kicker: "SIMPLEX",
    title: ["Walk corner to corner,", "never the middle"],
    dur: 16,
    caps: [
      [0.4, 3.4, "Start at a corner. Which direction gains most?"],
      [3.6, 6.2, "Walk until the nearest rule blocks the way."],
      [6.6, 8.8, "Repeat. s = what a rule has left over."],
      [9.0, 11.0, "Leftovers cost profit, so only y gains."],
      [11.8, 15.6, "No direction gains: the corner is optimal."],
    ],
    build(stage) {
      // ----- the plot -----
      const P = A3.plot(stage, {
        x: 0,
        y: 0,
        w: 480,
        h: 500,
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
      const thin = [0, 1].map(() => P.arrow({ tone: "green", w: 5 }));
      const thick = [0, 1].map(() => P.arrow({ tone: "orange", w: 9 }));
      const names = [0, 1].map(() => A3.tag(P.html, { anchor: "m", text: "x", tone: "green" }));
      const token = P.dot({ tone: "blue", r: 15 });
      const star = A3.star(P.over, { size: 52 });
      const xName = P.text({ tone: "grey" });
      const yName = P.text({ tone: "grey" });
      const machine = P.text({ tone: "purple" });
      const material = P.text({ tone: "purple", anchor: "start" });
      const yAxis = P.text({ tone: "grey" });
      const leg = [
        A3.tag(stage, { x: 0, y: 520, anchor: "l", html: "", tone: "purple" }),
        A3.tag(stage, { x: 0, y: 574, anchor: "l", html: "", tone: "purple" }),
      ];
      const LEG = ["s2 = material left over", "s1 = machine hours left over"];

      // ----- the right column: profit on top, then question 1, then question 2 -----
      const zStat = A3.stat(stage, { x: 504, y: 0, w: 432, label: "profit z", tone: "orange" });
      const gain = card(stage, {
        x: 504,
        y: 128,
        w: 432,
        rows: [{ label: "x" }, { label: "y" }],
        min: -1,
        max: 3,
        labelW: 64,
        valW: 70,
        title: "z gained per unit",
      });
      const ratio = card(stage, {
        x: 504,
        y: 356,
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
      const done = A3.sticker(stage, {
        x: 504,
        y: 356,
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
        const stop1 = ramp(t, T.stop[0], T.stop[0] + 0.3, lin) * (1 - ramp(t, T.swap1, T.swap1 + 0.3, lin));
        const stop2 = ramp(t, T.stop[1], T.stop[1] + 0.3, lin) * (1 - ramp(t, T.swap2, T.swap2 + 0.3, lin));
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
        const born = pop(t, 0.6, 0.4);
        const ringK = Math.max(
          ramp(t, T.enter[0], T.enter[0] + 0.3, lin) * (1 - ramp(t, T.walk1[1], T.walk1[1] + 0.3, lin)),
          ramp(t, T.enter[1], T.enter[1] + 0.3, lin) * (1 - ramp(t, T.walk2[1], T.walk2[1] + 0.3, lin)),
        );
        token.set({
          x: tok[0],
          y: tok[1],
          s: born.s,
          o: born.o,
          tone: t >= 12.8 ? "green" : "blue",
          ring: "orange",
          ringK,
        });
        const sp = ramp(t, 12.8, 13.3, lin);
        star.set({ x: P.px(4), y: P.py(3) - 44, s: sp > 0 ? E.pop(sp) : 0, o: Math.min(1, sp * 5) });
        xName.set({ text: "x", x: 6.75, y: 0, dy: -16 });
        yName.set({ text: "y", x: 0, y: 7.3, dx: 26, dy: 8 });
        // the rules are named on their lines (the ratio rows use the same words)
        const kn = ramp(t, 0.5, 0.9, lin);
        machine.set({ text: "machine", x: 5.6, y: 2.2, dy: -22, r: 26.6, o: kn });
        material.set({ text: "material", x: 3.3, y: 5.8, o: kn });
        const kya = ramp(t, T.ratio[1] + 0.3, T.ratio[1] + 0.6, lin) * (1 - ramp(t, T.swap2, T.swap2 + 0.3, lin));
        yAxis.set({ text: "y axis", x: 0, y: 2.5, dx: 30, r: -90, o: kya });

        // ----- the candidate directions: one arrow per row of the gain card -----
        const gp = gainPhase(t);
        const gs = GAINS[gp.st];
        const dir = DIRS[gp.st];
        const walkFade = [
          1 - ramp(t, T.walk1[0], T.walk1[0] + 0.4, lin),
          1 - ramp(t, T.walk2[0], T.walk2[0] + 0.4, lin),
          1,
        ][gp.st];
        [0, 1].forEach((i) => {
          const ka = ramp(t, T.arrows[gp.st] + 0.2 * i, T.arrows[gp.st] + 0.2 * i + 0.4, lin);
          const chosen = CHOSEN[gp.st] === i && t >= T.enter[gp.st];
          const base = { x1: dir.from[0], y1: dir.from[1], x2: dir.c[i].to[0], y2: dir.c[i].to[1], k: ka };
          thin[i].set({ ...base, tone: gs.tones[i], o: (gp.g[i] > 0.01 ? walkFade : 0) * (chosen ? 0 : 1) });
          thick[i].set({ ...base, o: chosen ? walkFade : 0 });
          const tip = P.pt(dir.c[i].to[0], dir.c[i].to[1]);
          names[i].set({
            text: gs.labels[i],
            tone: chosen ? "orange" : gs.tones[i],
            solid: chosen,
            s: 0.8 + 0.2 * E.pop(ka),
            o: Math.min(1, ka * 4) * walkFade * (gp.g[i] > 0.01 ? 1 : 0),
            dx: tip[0] + dir.c[i].tag[0],
            dy: tip[1] + dir.c[i].tag[1],
          });
        });

        // ----- slack: what a rule leaves over, defined when it first matters -----
        leg.forEach((tg, i) => {
          const p = pop(t, i ? T.s1 : T.s2, 0.4);
          tg.set({ html: LEG[i], s: p.s, o: p.o });
        });

        // ----- question 1: which direction gains most? -----
        const gPop = pop(t, 1.3, 0.4);
        const hiG = gp.st < 2 && t >= T.enter[gp.st] ? 0 : null;
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
        const second = t >= 6.6;
        const rs = RATIOS[second ? 1 : 0];
        const rPop = second ? pop(t, T.ratio[1], 0.4) : pop(t, T.ratio[0], 0.4);
        const rOut = second ? 1 - ramp(t, T.swap2, T.swap2 + 0.4, lin) : 1 - ramp(t, T.swap1, T.swap1 + 0.3, lin);
        const rStart = second ? T.ratio[1] + 0.3 : T.ratio[0] + 0.3;
        const rG = [0, 1].map((i) => ramp(t, rStart + 0.25 * i, rStart + 0.5 + 0.25 * i));
        const lit = t >= T.stop[second ? 1 : 0] + 0.1;
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
        // a small bump on arrival (the card is as wide as the column, so keep it under 1.04)
        zStat.set({
          text: String(z),
          s: zp.s,
          o: zp.o,
          bump: 0.5 * Math.max(flash(t, T.walk1[1], T.walk1[1] + 0.5), flash(t, T.walk2[1], T.walk2[1] + 0.5)),
        });
        done.set({ k: ramp(t, 13.2, 13.7, lin) });
      };
    },
  });
})();

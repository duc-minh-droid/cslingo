/* Algorithms Phase 3 · scene 10-recap: three rows, each a small looping pictogram and one bold line (storyboard: "recap").
   Story (local seconds): 0.1 kicker, headline and Byte, rows slide in at 0.8 / 1.9 / 3.0 (the pictogram starts 0.4 s later), 5.4 the call to action.
   Row 1 (period 4.0): the lesson's polygon (green) between its two rule lines (purple); a blue token hops (0,0) -> (5,0) -> (4,3) along the edges
          leaving a blue trail while the orange z read-out climbs 0 -> 15 -> 18 (A3.CORNER_Z); the orange star pops on (4,3). Corners come from A3.SIMPLEX.
   Row 2 (period 4.2): the bowl e^x - 2x with a purple bracket bar under it that halves three times (A3.bisect(3): 0.5, 0.25, 0.125); the thrown-away
          part flashes red while the blue end moves to the midpoint; the orange star pops at ln 2 inside the last bracket.
   Row 3 (period 4.4): contour map of (x - 3.5)^2 + (y - 2.2)^2 with the Nelder-Mead triangle (purple, corners tinted by rank). Rounds 1-4 are the
          scene 8 moves (expand, expand, reflect, contract = A3.NM_BOWL, checked), rounds 5-6 follow faster; the triangle then closes round
          the minimum (checked: the star lies inside it), the orange star and a green tick pop in. Every number comes from the A3 helpers. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const { need } = A3;

  const f1 = (n) => n.toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const cyc = (t, t0, period) => (t < t0 ? -1 : (t - t0) % period); // time inside the current lap, -1 before the first
  const K = (u, a, b) => ramp(u, a, b, E.lin); // linear 0..1 progress of u over [a, b]
  const pk = (k) => Math.min(1, k * 4); // opacity that comes in with a pop
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const START = APPEAR.map((a) => a + 0.4);
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const plotOf = (pic, view, extra) =>
    A3.plot(pic, {
      x: 0,
      y: 0,
      w: PIC.w,
      h: PIC.h,
      frame: false,
      grid: false,
      labels: false,
      view,
      ...extra,
    });

  // ---------- row 1: walk the corners ----------
  function simplexRow(pic) {
    const [S0, S1] = A3.SIMPLEX.steps;
    const WALK = [S0.from, S0.to, S1.to];
    need(same(WALK, [[0, 0], [5, 0], [4, 3]]) && same(WALK[2], A3.BEST), "recap row 1: the walk is (0,0), (5,0), (4,3)"); // prettier-ignore
    need(same(WALK.map(A3.z), [0, 15, 18]) && same(A3.CORNER_Z.slice(0, 3), [0, 15, 18]), "recap row 1: z along the walk");
    const [A, B, C] = WALK;
    // the polygon sits at the left of the picture, room for the z read-out on the right (equal scale: about 19.7 px per unit)
    const P = plotOf(pic, [-2.1, 14.3, -0.5, 5.8], { equal: true, pad: { l: 8, r: 8, t: 8, b: 8 } });
    const poly = P.poly({ tone: "green", w: 4 });
    // each rule line runs a little past the polygon's corners, so they read as the lines the edges lie on
    const rules = [
      [[-0.5, 5.25], [5, 2.5]], // x + 2y = 10 // prettier-ignore
      [[5.17, -0.5], [3.5, 4.5]], // 3x + y = 15 // prettier-ignore
    ];
    rules.forEach(([p, q], i) => {
      const r = A3.LP.rules[i];
      need(r.a * p[0] + r.b * p[1] === r.r && r.a * q[0] + r.b * q[1] === r.r, `recap row 1: rule ${i + 1} line`);
    });
    const lines = rules.map(() => P.path({ tone: "purple", w: 4 }));
    const trail = P.path({ tone: "blue", w: 5 });
    const token = P.dot({ tone: "blue", r: 10 });
    const star = A3.star(P.over, { size: 34 });
    const zTag = A3.tag(P.html, { x: 262, y: 70, anchor: "m", tone: "orange", fs: 28, minW: 112 });
    const T = { shape: [0, 0.45], token: 0.5, hop1: [1.0, 1.6], hop2: [2.0, 2.6], star: 2.65, out: [3.6, 3.95] };
    return (t) => {
      const alive = t >= START[0];
      const u = Math.max(0, cyc(t, START[0], 4.0));
      P.set({ o: alive ? K(u, 0, 0.25) * (1 - K(u, ...T.out)) : 0 });
      poly.set({ pts: A3.CORNERS, o: K(u, ...T.shape), fillO: K(u, ...T.shape) });
      rules.forEach(([p, q], i) => lines[i].set({ pts: [p, q], k: ramp(u, 0.1, 0.6) }));

      const [h1, h2] = [ramp(u, ...T.hop1, E.inOut), ramp(u, ...T.hop2, E.inOut)];
      const pos = [A[0] + (B[0] - A[0]) * h1 + (C[0] - B[0]) * h2, A[1] + (B[1] - A[1]) * h1 + (C[1] - B[1]) * h2];
      const pts = [A];
      if (h1 > 0) pts.push(h1 < 1 ? pos : B);
      if (h2 > 0) pts.push(pos);
      trail.set({ pts });
      const born = ramp(u, T.token, T.token + 0.5, E.lin);
      token.set({
        x: pos[0],
        y: pos[1],
        dy: -10 * (Math.sin(Math.PI * h1) + Math.sin(Math.PI * h2)),
        s: E.pop(born) * (1 + 0.15 * (flash(u, T.hop1[1], T.hop1[1] + 0.3) + flash(u, T.hop2[1], T.hop2[1] + 0.3))),
        o: pk(born) * (1 - K(u, T.star, T.star + 0.15)),
      });
      const sk = ramp(u, T.star, T.star + 0.5, E.lin);
      star.set({ x: P.px(C[0]), y: P.py(C[1]), s: E.pop(sk), o: pk(sk) });
      // the score read-out: z = 0, then 15, then 18, bumping every time the token lands
      const zNow = u < T.hop1[1] ? A3.z(A) : u < T.hop2[1] ? A3.z(B) : A3.z(C);
      zTag.set({
        text: `z = ${zNow}`,
        solid: u >= T.hop2[1],
        s: (0.8 + 0.2 * E.pop(K(u, T.token, T.token + 0.4))) * (1 + 0.1 * (flash(u, T.hop1[1], T.hop1[1] + 0.35) + flash(u, T.hop2[1], T.hop2[1] + 0.35))), // prettier-ignore
        o: pk(K(u, T.token, T.token + 0.4)),
      });
    };
  }

  // ---------- row 2: trap the minimum, then halve the trap ----------
  function bowlRow(pic) {
    const { f, min: XMIN } = A3.EXP;
    const { rows } = A3.bisect(3);
    need(rows.map((r) => r.width).join() === "0.5,0.25,0.125", "recap row 2: widths 0.5, 0.25, 0.125");
    need(rows[2].wa < XMIN && XMIN < rows[2].wb, "recap row 2: ln 2 is inside the last bracket");
    need(same(rows.map((r) => r.cut), [[0, 0.5], [0.75, 1], [0.5, 0.625]]), "recap row 2: the thrown-away parts"); // prettier-ignore
    const P = plotOf(pic, [-0.1, 1.1, 0.5, 1.15], { pad: { l: 8, r: 8, t: 8, b: 46 } });
    const curve = P.curve(f, { x0: -0.1, x1: 1.1 });
    const bands = rows.map(() => P.band({ tone: "red" }));
    const span = P.span({ tone: "purple", dy: 16 });
    const dots = [P.dot({ tone: "blue", r: 9 }), P.dot({ tone: "blue", r: 9 })];
    const star = A3.star(P.over, { size: 36 });
    const TK = (k) => 1.1 + 0.75 * k; // round k starts here; the thrown part flashes, the end moves in the middle of it
    const T = { curve: [0, 0.6], dots: 0.55, star: 3.1, out: [3.8, 4.15] };
    return (t) => {
      const alive = t >= START[1];
      const u = Math.max(0, cyc(t, START[1], 4.2));
      P.set({ o: alive ? K(u, 0, 0.25) * (1 - K(u, ...T.out)) : 0 });
      const grow = ramp(u, ...T.curve, E.lin);
      curve.set({ k: grow, fillO: grow });
      // the bracket ends: each round moves one end to the midpoint (the same lerp chain gives the exact end values after a round)
      let [a, b] = [0, 1];
      rows.forEach((r, k) => {
        const e = ramp(u, TK(k) + 0.15, TK(k) + 0.55, E.inOut);
        [a, b] = [lerp(a, r.wa, e), lerp(b, r.wb, e)];
        bands[k].set({ x0: r.cut[0], x1: r.cut[1], o: flash(u, TK(k), TK(k) + 0.75) });
      });
      const born = ramp(u, T.dots, T.dots + 0.45, E.lin);
      const gone = 1 - K(u, T.star, T.star + 0.25);
      [a, b].forEach((x, i) =>
        dots[i].set({ x, y: f(x), s: E.pop(born) * (1 + 0.2 * flash(u, TK(i ? 1 : 0) + 0.45, TK(i ? 1 : 0) + 0.75)), o: pk(born) * gone }),
      ); // prettier-ignore
      span.set({ x0: a, x1: b, o: pk(born) });
      const sk = ramp(u, T.star, T.star + 0.5, E.lin);
      star.set({ x: P.px(XMIN), y: P.py(f(XMIN)), s: E.pop(sk), o: pk(sk) });
    };
  }

  // ---------- row 3: flip the worst corner ----------
  function triangleRow(pic) {
    const f = A3.BOWL2;
    const START_TRI = [[0, 0], [1, 0], [0, 1]]; // prettier-ignore
    const run = A3.nmRun(f, START_TRI, { n: 6 });
    need(
      run.rounds.slice(0, 4).map((r) => r.op + (r.tried ? "*" : "")).join() === A3.NM_BOWL.rounds.map((r) => r.op + (r.tried ? "*" : "")).join() &&
        same(run.slots.slice(0, 5), A3.NM_BOWL.slots),
      "recap row 3: the first four rounds are the scene 8 moves",
    ); // prettier-ignore
    const STAR = [3.5, 2.2];
    const inside = (p, [a, b, c]) => {
      const s = (u, v, w) => (u[0] - w[0]) * (v[1] - w[1]) - (v[0] - w[0]) * (u[1] - w[1]);
      const d = [s(p, a, b), s(p, b, c), s(p, c, a)];
      return !(d.some((x) => x < 0) && d.some((x) => x > 0));
    };
    need(f(STAR) === 0 && inside(STAR, run.slots[run.it]), "recap row 3: the minimum lies inside the last triangle");
    const P = plotOf(pic, [-1.45, 7.45, -0.5, 3.1], { equal: true, pad: { l: 8, r: 8, t: 8, b: 8 } });
    const cont = P.contours(A3.contours(f, [-1.6, 7.6, -0.7, 3.3], A3.BOWL_LEVELS, { n: 160 }), { w: 2 });
    const tri = P.simplex({ tone: "purple" });
    const star = A3.star(P.over, { size: 36 });
    const tick = A3.badge(P.html, { x: 304, y: 34, size: 46, icon: "tick", tone: "green" });
    // rounds 1-4 take 0.45 s each, rounds 5-6 0.3 s each; u counts rounds
    const T = { move: 0.6, fast: 0.6 + 4 * 0.45, end: 0.6 + 4 * 0.45 + 2 * 0.3, star: 3.0, tick: 3.2, out: [3.9, 4.25] };
    const rounds = (q) => (q < T.fast ? (4 * Math.max(0, q - T.move)) / (T.fast - T.move) : 4 + (2 * (q - T.fast)) / (T.end - T.fast));
    const TONES = ["green", "blue", "red"];
    return (t) => {
      const alive = t >= START[2];
      const q = Math.max(0, cyc(t, START[2], 4.4));
      P.set({ o: alive ? K(q, 0, 0.25) * (1 - K(q, ...T.out)) : 0 });
      cont.set({ o: ramp(q, 0, 0.4) });
      const at = A3.nmAt(run, Math.min(run.it, rounds(q)));
      // corners are tinted by rank at the START of the round (best green, middle blue, worst red), so the colour changes when a corner lands
      const order = run.slots[at.it].map((p, i) => [f(p), i]).sort((x, y) => x[0] - y[0]);
      const tones = [];
      order.forEach(([, i], rank) => (tones[i] = TONES[rank]));
      const born = ramp(q, 0.2, 0.7, E.lin);
      tri.set({ pts: at.slots, tones, o: pk(born), fillO: 1 - 0.6 * K(q, T.star, T.star + 0.3), dotO: pk(born) * (1 - 0.5 * K(q, T.star, T.star + 0.3)) });
      const sk = ramp(q, T.star, T.star + 0.5, E.lin);
      star.set({ x: P.px(STAR[0]), y: P.py(STAR[1]), s: E.pop(sk), o: pk(sk) });
      tick.set({ k: ramp(q, T.tick, T.tick + 0.5, E.lin) });
    };
  }

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const head = V.h("div", {
        class: "v-title-line",
        text: "Remember",
        style: { position: "absolute", left: "72px", top: "108px", fontSize: "76px" },
      });
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP" });
      const mascot = V.mascot("byte", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["blue", "The best is a corner:\nsimplex walks there", simplexRow],
        ["purple", "Trap the minimum,\nthen shrink the trap", bowlRow],
        ["green", "No gradient needed:\nflip the worst corner", triangleRow],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "440px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "36px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = A3.tag(stage, { x: 540, y: 904, anchor: "m", solid: true, tone: "blue", fs: 34, text: "Beat the Phase 3 boss quiz" });
      cta.style.padding = "8px 34px 10px";

      return (t) => {
        V.place(kicker, { y: (1 - ramp(t, 0.05, 0.45)) * 10, o: ramp(t, 0.05, 0.45) });
        V.place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
        const m = ramp(t, 0.2, 0.9, E.pop);
        V.place(mascot, {
          y: (1 - m) * 30 + 6 * Math.sin((2 * Math.PI * t) / 2.6),
          r: 3 * Math.sin((2 * Math.PI * t) / 3.2 + 1),
          s: 0.7 + 0.3 * m,
          o: ramp(t, 0.2, 0.5),
        });
        rows.forEach((r, i) => {
          const k = ramp(t, APPEAR[i], APPEAR[i] + 0.5);
          V.place(r.card, { y: (1 - k) * 36, o: k });
          const kl = ramp(t, APPEAR[i] + 0.15, APPEAR[i] + 0.65);
          V.place(r.label, { x: (1 - kl) * 24, o: kl });
          r.update(t);
        });
        const c = ramp(t, 5.4, 6.0, E.pop);
        cta.set({ s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();

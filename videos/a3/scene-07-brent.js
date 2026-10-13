/* Algorithms Phase 3 · scene 07-brent: Brent's method on the same curve and start triple as scene 6.
   Three points and their heights define ONE parabola; jump to its lowest point, evaluate there, keep the best three. When a jump
   looks unsafe (the step is not shrinking fast enough: the jump is more than half the last step, lesson a3-brent) take a golden
   step instead. The picture zooms in as the bracket collapses (a "zoomed in" tag says so).
   The unsafe step is drawn with the two lengths the rule compares: the last step (grey arrow from a to b) and the new jump (red
   arrow from b to the parabola's bottom). Every number comes from A3.brent(4) and A3.golden(4) (common.js, asserted there against
   the lesson); update(t) is a pure function of t. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const { ease: E, ramp, flash, lerp, clamp } = V;

  const K = (t, a, d) => ramp(t, a, a + d, E.lin); // linear 0..1 progress of t over [a, a + d]
  const pk = (k) => Math.min(1, k * 4); // opacity that comes in with a pop
  const pop = (k) => 0.8 + 0.2 * E.pop(k);
  const V0 = [-0.04, 1.04, 0.12, 1.5]; // the scene 6 view
  const START = [0.35, 0.5, 0.78]; // the three start points pop in (the curve has drawn past them)

  /* when things happen in each step (local seconds): par = [start, length, "draw" | "fade"] of the parabola, ring = the vertex ring,
     jump = the dotted jump line, probe = the probe pops, band = the thrown-away part tints, settle = colours / letters / bracket
     bar move to the new triple, out = ring, jump line and parabola fade, cross = the red cross (unsafe step only). */
  const PLAN = [
    { par: [1.0, 1.1, "draw"], ring: 2.2, jump: 2.4, probe: 2.65, band: 3.0, settle: 3.05, out: 3.4, hold: 0.75 },
    { par: [3.4, 0.3, "fade"], ring: 4.3, jump: 4.45, probe: 4.65, band: 5.0, settle: 5.05, out: 5.7, hold: 0.7 },
    { par: [5.8, 0.55, "draw"], ring: 7.4, jump: 7.55, probe: 7.7, band: 8.0, settle: 8.05, out: 8.5, hold: 0.4 },
    { par: [8.6, 0.6, "draw"], ring: 9.3, cross: 10.5, probe: 11.9, band: 12.1, settle: 12.2, out: 11.6, hold: 0.45 },
  ];
  const CHIPS = [
    [1.0, 3.4],
    [3.4, 5.8],
    [5.8, 8.6],
    [10.5, 12.6],
  ]; // [turns active, done]
  const ZOOM1 = [3.4, 4.3]; // zoom in on the triple of step 2 (b and the probe are 77 px apart instead of 28)
  const ZOOM2 = [6.5, 7.3]; // zoom in on the tiny triple of step 3 / 4 (the probe is 64 px from b instead of 11)
  const UNSAFE = { last: 9.5, jump: 10.0 }; // the two arrows of the unsafe step grow here

  V.scene({
    kicker: "BRENT'S METHOD",
    title: ["Fit a parabola,", "jump to its bottom"],
    dur: 15,
    caps: [
      [0.4, 2.3, "Same curve: fit a parabola through three points."],
      [2.5, 5.6, "Jump to the bottom of the parabola."],
      [5.8, 8.4, "Repeat: the bracket collapses fast."],
      [8.6, 12.3, "Jump not shrinking? Take a golden step instead."],
      [12.4, 14.6, "Same 7 tests, a bracket 5 times tighter."],
    ],
    build(stage) {
      const B = A3.brent(4);
      const S = B.steps;
      const ST = B.start;
      const gold = A3.golden(4).steps[3];
      A3.need(S.map((s) => s.kind).join("") === "PPPG", "scene 7: step kinds");
      A3.need(S.map((s) => s.x.toFixed(4)).join() === "0.6067,0.6408,0.6116,0.6228", "scene 7: probes");
      A3.need(S.map((s) => s.vertex.toFixed(4)).join() === "0.6067,0.6408,0.6116,0.6207", "scene 7: vertices");
      A3.need(S.map((s) => s.evals).join() === "4,5,6,7", "scene 7: evaluations");
      A3.need(S.map((s) => A3.fmt(s.width, 3)).join() === "0.618,0.259,0.034,0.029", "scene 7: widths");
      A3.need(A3.fmt(gold.width, 3) === "0.146", "scene 7: golden width after the same 4 steps");
      A3.need(S.map((s) => s.fx < s.t.fb).join() === "true,false,true,true", "scene 7: lower / higher");
      const lag = S.map((s) => A3.lagrange(s.t));
      const vy = S.map((s, k) => lag[k](s.vertex)); // the parabola's lowest value in each step
      A3.need(A3.near2(vy[0], 0.413) && A3.near2(vy[1], 0.25) && A3.near2(vy[3], 0.251), "scene 7: parabola bottoms");
      // the unsafe rule: the jump b -> vertex is more than half the last step (a -> b)
      const u4 = S[3];
      const [lastStep, jump] = [S[2].step, Math.abs(u4.vertex - u4.t.b)];
      A3.need(Math.abs(u4.t.b - u4.t.a - lastStep) < 1e-12, "scene 7: the last step is the distance a to b");
      A3.need(jump > 0.5 * lastStep && jump > lastStep, "scene 7: the jump of step 4 is not shrinking");
      A3.need(A3.fmt(lastStep, 4) === "0.0049" && A3.fmt(jump, 4) === "0.0091", "scene 7: step lengths");

      const P = A3.plot(stage, {
        x: 0,
        y: 0,
        w: 936,
        h: 520,
        view: V0,
        axes: "bottom",
        xticks: [],
        grid: false,
        labels: false,
        pad: { l: 24, r: 24, t: 24, b: 80 },
      });
      const V1 = A3.viewFor(S[2].t, { padX: 0.25, top: 0.5 });
      const V2 = A3.viewFor(S[3].t, { padX: 0.5, top: 0.5 });

      // ---------- the points: the start triple, then one probe per step ----------
      const pts = [ST.a, ST.b, ST.c].map((x, i) => ({ x, at: START[i] }));
      S.forEach((s, k) => pts.push({ x: s.x, at: PLAN[k].probe }));
      S.forEach((s, k) => {
        const keep = [s.nt.a, s.nt.b, s.nt.c];
        const gone = [s.t.a, s.t.b, s.t.c].filter((v) => !keep.includes(v));
        A3.need(gone.length === 1, `scene 7: step ${k + 1} drops exactly one point`);
        pts.find((p) => p.x === gone[0]).drop = PLAN[k].settle + 0.1;
      });

      // ---------- handles (layers stack in creation order) ----------
      const curve = P.curve(A3.BF, { x0: 0, x1: 1 });
      const band = P.band({ tone: "red" });
      const par = S.map((s, k) => P.curve(lag[k], { tone: "purple", w: 5, x0: s.t.a, x1: s.t.c })); // over the bracket only
      const jumps = S.slice(0, 3).map(() => P.vline({ tone: "purple", w: 5, dash: "2 11" }));
      const guides = pts.map(() => P.vline({}));
      const span = P.span({ tone: "purple" });
      const rings = S.map(() => P.ring({ tone: "purple", r: 18, w: 5 }));
      const dots = pts.map(() => P.dot({ tone: "blue", r: 14 }));
      const lastArrow = P.arrow({ tone: "grey", w: 7 });
      const jumpArrow = P.arrow({ tone: "red", w: 7 });
      const letters = {
        a: P.text({ tone: "blue", px: true }),
        b: P.text({ tone: "green", px: true }),
        c: P.text({ tone: "blue", px: true }),
        x: P.text({ tone: "orange", px: true }),
      };
      const verdict = A3.tag(P.html, { anchor: "m", text: "lower", tone: "green" });
      const cross = A3.badge(P.html, { size: 48, icon: "cross", tone: "red" });
      const lastTag = A3.tag(P.html, { x: 24, y: 24, anchor: "l", text: "last step 0.0049", tone: "grey" });
      const jumpTag = A3.tag(P.html, { x: 24, y: 78, anchor: "l", text: "this jump 0.0091", tone: "red" });
      const sticker = A3.sticker(P.html, {
        x: 24,
        y: 134,
        w: 340,
        h: 64,
        text: "step not shrinking",
        tone: "red",
        icon: "cross",
      });
      const zoomTag = A3.tag(P.html, { x: 912, y: 24, anchor: "r", text: "zoomed in", tone: "grey" });
      const evalStat = A3.stat(stage, { x: 484, y: 24, w: 200, label: "evaluations" });
      const cmpBox = V.h("div", {
        style: {
          position: "absolute",
          left: "232px",
          top: "24px",
          width: "472px",
          height: "204px",
          pointerEvents: "none",
        },
      });
      P.html.append(cmpBox);
      const cmp = A3.bars(cmpBox, {
        x: 0,
        y: 0,
        w: 472,
        rows: [
          { label: "golden", tone: "grey" },
          { label: "Brent", tone: "purple" },
        ],
        min: 0,
        max: 0.15,
        labelW: 130,
        valW: 110,
        title: "after the same 7 evaluations",
      });
      const chips = S.map((s, k) =>
        A3.chip(stage, {
          x: 242 * k,
          y: 548,
          w: 210,
          h: 60,
          text: `${s.kind === "P" ? "parabola" : "golden"} ${s.k}`,
          tone: s.kind === "P" ? "purple" : "orange",
        }),
      );

      /** which step is running at t, and the triple the dots show (before the colours settle, or after) */
      const stateAt = (t) => {
        let k = -1;
        PLAN.forEach((p, i) => {
          if (t >= p.par[0]) k = i;
        });
        if (k < 0) return { k, tri: ST, live: null };
        const done = t >= PLAN[k].settle + 0.2;
        return { k, tri: done ? S[k].nt : S[k].t, live: done ? null : S[k] };
      };
      const toneOf = (x, tri, live) => (live && live.x === x ? "orange" : x === tri.b ? "green" : "blue");
      /** where the letter of a role (a, b or c) sits: it glides to its new point while the colours settle */
      const roleX = (r, st, t) =>
        st.k < 0
          ? ST[r]
          : lerp(S[st.k].t[r], S[st.k].nt[r], ramp(t, PLAN[st.k].settle, PLAN[st.k].settle + 0.4, E.inOut));

      return (t) => {
        // the window: scene 6's view, zoomed in on step 2's triple, then on the tiny triple of steps 3 and 4
        const view =
          t < ZOOM2[0]
            ? A3.mixView(V0, V1, ramp(t, ZOOM1[0], ZOOM1[1], E.lin))
            : A3.mixView(V1, V2, ramp(t, ZOOM2[0], ZOOM2[1], E.lin));
        P.view(view);
        const y0 = P.cur.y0;
        const base = P.area.y + P.area.h; // the axis, in stage px
        // a point that has left the window fades (the dots and letters are not clipped to the card)
        const seen = (px) => clamp((px - P.area.x + 6) / 30) * clamp((P.area.x + P.area.w + 6 - px) / 30);
        const st = stateAt(t);
        const s = S[Math.max(0, st.k)];
        const p = PLAN[Math.max(0, st.k)];
        P.set({ o: ramp(t, 0, 0.4, E.lin) });
        curve.set({ k: ramp(t, 0.05, 0.75, E.lin), fillO: ramp(t, 0.6, 0.95, E.lin) });

        // the thrown-away part
        band.set({
          x0: s.cut[0],
          x1: s.cut[1],
          o: st.k < 0 ? 0 : K(t, p.band, 0.35) * (1 - K(t, p.band + p.hold, 0.3)),
        });

        // parabola, vertex ring and dotted jump line of every step
        S.forEach((q, k) => {
          const [a, d, mode] = PLAN[k].par;
          const out = K(t, PLAN[k].out, 0.3);
          par[k].set({
            k: mode === "draw" ? ramp(t, a, a + d, E.inOut) : 1,
            o: (mode === "draw" ? 1 : K(t, a, d)) * (1 - out),
          });
          const kr = K(t, PLAN[k].ring, 0.3);
          rings[k].set({
            x: q.vertex,
            y: vy[k],
            r: 18 + 16 * (1 - E.out(kr)),
            o: pk(kr) * (1 - out) * seen(P.px(q.vertex)),
          });
          if (k < 3) jumps[k].set({ x: q.vertex, y1: vy[k], y0: q.fx, k: K(t, PLAN[k].jump, 0.25), o: 1 - out });
        });

        // dots and their guides
        pts.forEach((pt, i) => {
          const k = K(t, pt.at, 0.4);
          const out = pt.drop == null ? 0 : K(t, pt.drop, 0.4);
          let bump = 0;
          S.forEach((q, j) => {
            if (toneOf(pt.x, q.t, q) !== toneOf(pt.x, q.nt, null))
              bump = Math.max(bump, flash(t, PLAN[j].settle + 0.1, PLAN[j].settle + 0.5));
          });
          dots[i].set({
            x: pt.x,
            y: A3.BF(pt.x),
            tone: toneOf(pt.x, st.tri, st.live),
            s: E.pop(k) * (1 - 0.4 * out) * (1 + 0.25 * bump),
            o: pk(k) * (1 - out) * seen(P.px(pt.x)),
          });
          guides[i].set({ x: pt.x, y0, y1: A3.BF(pt.x), k: K(t, pt.at + 0.1, 0.4), o: 1 - out });
        });

        // letters: a, b, c glide to their new points, x names the probe; letters that would touch are pushed apart
        const lo = {
          a: pk(K(t, START[0] + 0.15, 0.3)),
          b: pk(K(t, START[1] + 0.15, 0.3)),
          c: pk(K(t, START[2] + 0.15, 0.3)),
        };
        lo.x = st.k < 0 ? 0 : pk(K(t, p.probe, 0.4)) * (1 - K(t, p.settle, 0.2));
        const lx = { a: P.px(roleX("a", st, t)), b: P.px(roleX("b", st, t)), c: P.px(roleX("c", st, t)), x: P.px(s.x) };
        Object.keys(lx).forEach((r) => (lo[r] *= seen(lx[r])));
        const order = Object.keys(lx).sort((m, n) => lx[m] - lx[n]);
        for (let pass = 0; pass < 2; pass++)
          order.slice(1).forEach((n, i) => {
            const m = order[i];
            const push = (Math.max(0, 40 - (lx[n] - lx[m])) / 2) * Math.min(lo[m], lo[n]);
            lx[n] += push;
            lx[m] -= push;
          });
        Object.keys(lx).forEach((r) => letters[r].set({ text: r, x: lx[r], y: base, dy: -16, o: lo[r] }));

        // the bracket bar under the axis: grows to [0, 1], then glides to each new triple (kept inside the window)
        const g = st.k < 0 ? 0 : ramp(t, p.settle, p.settle + 0.5, E.inOut);
        const sx0 = lerp(s.t.a, s.nt.a, g);
        const [wx0, wx1] = [P.cur.x0 + 0.005 * (P.cur.x1 - P.cur.x0), P.cur.x1 - 0.005 * (P.cur.x1 - P.cur.x0)];
        span.set({
          x0: clamp(sx0, wx0, wx1),
          x1: clamp(lerp(sx0, lerp(s.t.c, s.nt.c, g), ramp(t, 0.7, 1.2, E.inOut)), wx0, wx1),
          o: K(t, 0.7, 0.2),
        });

        // "lower" / "higher": is the probe below the green middle?
        const vk = S.findIndex((q, k) => t >= PLAN[k].probe + 0.3 && t < PLAN[k].settle + 0.4);
        if (vk >= 0) {
          const q = S[vk];
          const kv = K(t, PLAN[vk].probe + 0.3, 0.3);
          const lower = q.fx < q.t.fb;
          verdict.set({
            text: lower ? "lower" : "higher",
            tone: lower ? "green" : "red",
            s: pop(kv),
            o: pk(kv) * (1 - K(t, PLAN[vk].settle + 0.1, 0.25)),
            dx: P.px(q.x),
            dy: Math.min(P.py(q.fx), P.py(q.t.fb), P.py(vy[vk])) - 62,
          });
        } else verdict.set({ o: 0 });

        // the unsafe jump: the last step against the new jump (two arrows above the dots), a red cross on the ring, the sticker
        const u = PLAN[3];
        const yA = u4.t.fb + 62 / P.cur.sy; // the arrows float 62 px above the dots
        const [kl, kj] = [K(t, UNSAFE.last, 0.4), K(t, UNSAFE.jump, 0.4)];
        const aOut = 1 - K(t, u.out, 0.3);
        lastArrow.set({ x1: u4.t.a, y1: yA, x2: u4.t.b, y2: yA, k: kl, o: aOut });
        jumpArrow.set({ x1: u4.t.b, y1: yA, x2: u4.vertex, y2: yA, k: kj, o: aOut });
        lastTag.set({ s: pop(kl), o: pk(kl) * aOut });
        jumpTag.set({ s: pop(kj), o: pk(kj) * aOut });
        const kc = K(t, u.cross, 0.35);
        cross.set({ x: P.px(u4.vertex) + 32, y: P.py(vy[3]) - 38, k: kc, o: 1 - K(t, u.out, 0.3) });
        sticker.set({ k: kc, o: 1 - K(t, u.out, 0.25) });

        // stats, zoom tag, step chips
        const kStat = K(t, 0.9, 0.35);
        evalStat.set({
          text: String(3 + PLAN.filter((q) => t >= q.probe + 0.2).length),
          s: pop(kStat),
          o: pk(kStat) * (1 - K(t, 12.7, 0.2)),
          bump: Math.max(0, ...PLAN.map((q) => flash(t, q.probe + 0.2, q.probe + 0.5))),
        });
        const kz = K(t, ZOOM1[0], 0.3);
        zoomTag.set({ s: pop(kz), o: pk(kz) });
        chips.forEach((c, k) => {
          const [on, done] = CHIPS[k];
          c.set({
            state: t >= done ? "done" : t >= on ? "active" : "grey",
            pop: K(t, 0.8, 0.4),
            pulse: flash(t, on, on + 0.4),
          });
        });

        // the finish: golden against Brent after the same 7 evaluations, as two bars on one scale
        const kc2 = K(t, 12.8, 0.4);
        V.place(cmpBox, { s: pop(kc2), o: pk(kc2) });
        cmp.set({
          vals: [gold.width, S[3].width],
          k: K(t, 13.2, 0.8),
          texts: [A3.fmt(gold.width, 3), A3.fmt(S[3].width, 3)],
        });
      };
    },
  });
})();

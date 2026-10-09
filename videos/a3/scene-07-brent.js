/* Algorithms Phase 3 · scene 07-brent: Brent's method on the same curve and start triple as scene 6.
   Three points and their heights define ONE parabola; jump to its lowest point, evaluate there, keep the best three. When a jump
   looks unsafe (the step is not shrinking fast enough) take a golden step instead. The picture zooms in as the bracket collapses.
   Every number comes from A3.brent(4) and A3.golden(4) (common.js, asserted there against the lesson); update(t) is a pure function of t. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const { ease: E, ramp, flash, lerp } = V;

  const K = (t, a, d) => ramp(t, a, a + d, E.lin); // linear 0..1 progress of t over [a, a + d]
  const pk = (k) => Math.min(1, k * 4); // opacity that comes in with a pop
  const pop = (k) => 0.8 + 0.2 * E.pop(k);
  const V0 = [-0.04, 1.04, 0.12, 1.5]; // the scene 6 view
  const START = [0.35, 0.5, 0.78]; // the three start points pop in (the curve has drawn past them)
  const WIDE = V0[1] - V0[0];

  /* when things happen in each step (local seconds): par = [start, length, "draw" | "fade"] of the parabola, ring = the vertex ring,
     jump = the dotted jump line, probe = the probe pops, band = the thrown-away part tints, settle = colours / letters / bracket
     bar move to the new triple, out = ring, jump line and parabola fade, cross = the red cross (unsafe step only). */
  const PLAN = [
    { par: [1.0, 1.1, "draw"], ring: 2.2, jump: 2.4, probe: 2.65, band: 3.0, settle: 3.05, out: 3.4, hold: 0.75 },
    { par: [3.4, 0.3, "fade"], ring: 3.8, jump: 3.95, probe: 4.15, band: 4.5, settle: 4.55, out: 5.25, hold: 0.7 },
    { par: [6.8, 0.55, "draw"], ring: 7.1, jump: 7.25, probe: 7.4, band: 7.7, settle: 7.75, out: 8.15, hold: 0.4 },
    { par: [9.0, 0.6, "draw"], ring: 9.5, cross: 9.8, probe: 10.3, band: 10.45, settle: 10.55, out: 10.2, hold: 0.45 },
  ];
  const CHIPS = [
    [1.0, 3.4],
    [3.4, 5.4],
    [6.8, 8.6],
    [9.8, 11.05],
  ]; // [turns active, done]

  V.scene({
    kicker: "BRACKETING",
    title: ["Fit a parabola,", "jump to its bottom"],
    dur: 13,
    caps: [
      [0.4, 3.2, "Same curve. Fit a parabola through the three points."],
      [3.4, 6.2, "Jump to the bottom of the parabola."],
      [6.4, 9.2, "Repeat: it homes in much faster than golden section."],
      [9.4, 12.4, "If a jump looks unsafe, take a golden step instead."],
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
      const letters = {
        a: P.text({ tone: "blue", px: true }),
        b: P.text({ tone: "green", px: true }),
        c: P.text({ tone: "blue", px: true }),
        x: P.text({ tone: "orange", px: true }),
      };
      const verdict = A3.tag(P.html, { anchor: "m", text: "lower", tone: "green" });
      const cross = A3.badge(P.html, { size: 48, icon: "cross", tone: "red" });
      const sticker = A3.sticker(P.html, {
        x: 24,
        y: 24,
        w: 340,
        h: 64,
        text: "jump too big",
        tone: "red",
        icon: "cross",
      });
      const zoomTag = A3.tag(P.html, { x: 912, y: 24, anchor: "r", text: "zoom ×1", tone: "grey" });
      const evalStat = A3.stat(stage, { x: 484, y: 24, w: 200, label: "evaluations" });
      const cmpGold = A3.stat(P.html, { x: 232, y: 24, w: 220, label: "golden width", tone: "grey" });
      const cmpBrent = A3.stat(P.html, { x: 484, y: 24, w: 220, label: "Brent width", tone: "purple" });
      const same = A3.tag(P.html, { x: 468, y: 150, anchor: "c", text: "same 7 evaluations", tone: "grey" });
      const chips = S.map((s, k) =>
        A3.chip(stage, {
          x: 242 * k,
          y: 548,
          w: 210,
          h: 60,
          text: `${s.k} ${s.kind === "P" ? "parabola" : "golden"}`,
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
        // the window: scene 6's view, zoomed in on the new triple after step 2 and again after step 3
        const view =
          t < 6.8 ? A3.mixView(V0, V1, ramp(t, 5.4, 6.8, E.lin)) : A3.mixView(V1, V2, ramp(t, 8.2, 9.0, E.lin));
        P.view(view);
        const y0 = P.cur.y0;
        const base = P.area.y + P.area.h; // the axis, in stage px
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
          rings[k].set({ x: q.vertex, y: vy[k], r: 18 + 16 * (1 - E.out(kr)), o: pk(kr) * (1 - out) });
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
            o: pk(k) * (1 - out),
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
        const order = Object.keys(lx).sort((m, n) => lx[m] - lx[n]);
        for (let pass = 0; pass < 2; pass++)
          order.slice(1).forEach((n, i) => {
            const m = order[i];
            const push = (Math.max(0, 40 - (lx[n] - lx[m])) / 2) * Math.min(lo[m], lo[n]);
            lx[n] += push;
            lx[m] -= push;
          });
        Object.keys(lx).forEach((r) => letters[r].set({ text: r, x: lx[r], y: base, dy: -16, o: lo[r] }));

        // the bracket bar under the axis: grows to [0, 1], then glides to each new triple
        const g = st.k < 0 ? 0 : ramp(t, p.settle, p.settle + 0.5, E.inOut);
        const sx0 = lerp(s.t.a, s.nt.a, g);
        span.set({
          x0: sx0,
          x1: lerp(sx0, lerp(s.t.c, s.nt.c, g), ramp(t, 0.7, 1.2, E.inOut)),
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

        // the unsafe jump: a red cross on the ring and the sticker
        const u = PLAN[3];
        const kc = K(t, u.cross, 0.35);
        cross.set({
          x: P.px(S[3].vertex) + 32,
          y: P.py(vy[3]) - 38,
          k: kc,
          o: 1 - K(t, u.out, 0.3),
        });
        sticker.set({ k: kc, o: 1 - K(t, 10.4, 0.2) });

        // stats, zoom tag, step chips
        const kStat = K(t, 0.9, 0.35);
        evalStat.set({
          text: String(3 + PLAN.filter((q) => t >= q.probe + 0.2).length),
          s: pop(kStat),
          o: pk(kStat) * (1 - K(t, 11.05, 0.2)),
          bump: Math.max(0, ...PLAN.map((q) => flash(t, q.probe + 0.2, q.probe + 0.5))),
        });
        const kz = K(t, 5.6, 0.3);
        zoomTag.set({
          text: `zoom ×${A3.fmt(WIDE / (P.cur.x1 - P.cur.x0), 1)}`,
          s: pop(kz),
          o: pk(kz) * (1 - K(t, 10.9, 0.25)),
        });
        chips.forEach((c, k) => {
          const [on, done] = CHIPS[k];
          c.set({
            state: t >= done ? "done" : t >= on ? "active" : "grey",
            pop: K(t, 0.8, 0.4),
            pulse: flash(t, on, on + 0.4),
          });
        });

        // the finish: golden against Brent after the same 7 evaluations
        const [k1, k2, k3] = [K(t, 11.3, 0.4), K(t, 11.5, 0.4), K(t, 11.8, 0.4)];
        cmpGold.set({ text: A3.fmt(gold.width, 3), s: pop(k1), o: pk(k1) });
        cmpBrent.set({ text: A3.fmt(S[3].width, 3), s: pop(k2), o: pk(k2), bump: flash(t, 12.1, 12.6) });
        same.set({ s: pop(k3), o: pk(k3) });
      };
    },
  });
})();

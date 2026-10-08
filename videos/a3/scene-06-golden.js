/* Algorithms Phase 3 · scene 06-golden: golden-section search on f(x) = 2.2 |x - 0.62|^1.4 + 0.25 (no slope, only values).
   A bracket is a triple a < b < c with the lowest point b in the middle. Each step adds ONE probe x, keeps the lowest point in
   the middle with its neighbours, throws the rest away: the width shrinks to 0.618 of itself and old probes are reused.
   Every number comes from A3.golden(4) (common.js, asserted there against the lesson); update(t) is a pure function of t. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const L5 = V.l5;
  const { ease: E, ramp, flash, lerp } = V;

  const T0 = 3.4; // first step starts here, a step lasts DT seconds
  const DT = 1.9;
  const Tk = (k) => T0 + DT * k;
  const K = (t, a, d) => ramp(t, a, a + d, E.lin); // linear 0..1 progress of t over [a, a + d]
  const pk = (k) => Math.min(1, k * 4); // opacity that comes in with a pop
  const toneOf = (x, tri, live) => (live && live.x === x ? "orange" : x === tri.b ? "green" : "blue");

  V.scene({
    kicker: "BRACKETING",
    title: ["No slope needed:", "one new probe a step"],
    dur: 13,
    caps: [
      [0.4, 3.2, "No slope? Three points can still trap a minimum."],
      [3.4, 7.2, "Add one probe a step. The lowest stays in the middle."],
      [7.4, 11.0, "Old probes are reused, so each cut costs one test."],
      [11.2, 12.8, "Every step keeps 0.618 of the bracket."],
    ],
    build(stage) {
      const G = A3.golden(4);
      const S = G.steps;
      const ST = G.start;
      A3.need(S.map((s) => s.evals).join() === "4,5,6,7", "scene 6: evaluations");
      A3.need(S.map((s) => A3.fmt(s.width, 3)).join() === "0.618,0.382,0.236,0.146", "scene 6: widths");
      A3.need(S.map((s) => s.lower).join() === "true,false,false,false", "scene 6: lower flags");

      const P = A3.plot(stage, {
        x: 0,
        y: 0,
        w: 936,
        h: 540,
        view: [-0.04, 1.04, 0.12, 1.5],
        axes: "bottom",
        xticks: [0, 0.5, 1],
        grid: false,
        labels: false,
        pad: { l: 24, r: 24, t: 24, b: 76 },
      });
      const y0 = () => P.cur.y0;

      // ---------- the points: the three start points, then one probe per step ----------
      const pts = [ST.a, ST.b, ST.c].map((x, i) => ({ x, at: 1.4 + 0.3 * i }));
      S.forEach((s, k) => pts.push({ x: s.x, at: Tk(k) }));
      S.forEach((s, k) => {
        const keep = [s.nt.a, s.nt.b, s.nt.c];
        const gone = [s.t.a, s.t.b, s.t.c].filter((v) => !keep.includes(v));
        A3.need(gone.length === 1, `scene 6: step ${k + 1} drops exactly one point`);
        pts.find((p) => p.x === gone[0]).drop = Tk(k) + 0.85;
      });
      // an old probe that is kept, not tested again: [probe x, start time]
      const reuse = [
        [S[0].x, Tk(1) + 0.05],
        [S[1].x, Tk(2) + 0.1],
      ];

      // ---------- handles (layers stack in creation order) ----------
      const curve = P.curve(A3.BF, { x0: 0, x1: 1 });
      const band = P.band({ tone: "red" });
      const ref = P.internals.mk("line", { "stroke-width": "5", "stroke-linecap": "round", "stroke-dasharray": "2 10" });
      ref.style.stroke = L5.tone("green").c;
      const gap = P.vline({ w: 5, dash: "2 10" });
      const lead = P.vline({ tone: "green", w: 4, dash: "2 10" });
      const guides = pts.map(() => P.vline({}));
      const span = P.span({ tone: "purple" });
      const dots = pts.map(() => P.dot({ tone: "blue", r: 14 }));
      const letters = {
        a: P.text({ tone: "blue" }),
        b: P.text({ tone: "green" }),
        c: P.text({ tone: "blue" }),
        x: P.text({ tone: "orange" }),
      };
      const star = A3.star(P.over, { size: 52 });
      const midTag = A3.tag(P.html, { anchor: "m", text: "lowest in the middle", tone: "green" });
      const verdict = A3.tag(P.html, { anchor: "m", text: "lower", tone: "green" });
      const reused = A3.tag(P.html, { anchor: "m", text: "reused", tone: "grey" });
      const evalStat = A3.stat(stage, { x: 484, y: 24, w: 200, label: "evaluations" });
      const widthStat = A3.stat(stage, { x: 704, y: 24, w: 220, label: "width", tone: "purple" });
      const times = A3.tag(stage, { x: 814, y: 178, anchor: "m", text: "× 0.618", tone: "orange", solid: true });

      /** which step is running at t, and the triple the dots show (before the colours settle at T + 1.35, or after) */
      const stateAt = (t) => {
        let k = -1;
        S.forEach((s, i) => {
          if (t >= Tk(i)) k = i;
        });
        if (k < 0) return { k, tri: ST, live: null };
        const done = t >= Tk(k) + 1.35;
        return { k, tri: done ? S[k].nt : S[k].t, live: done ? null : S[k] };
      };
      /** where the letter of a role (a, b or c) sits: it glides to its new point while the colours settle */
      const roleX = (r, st, t) => {
        if (st.k < 0) return ST[r];
        const T = Tk(st.k);
        return lerp(S[st.k].t[r], S[st.k].nt[r], ramp(t, T + 1.15, T + 1.55, E.inOut));
      };

      return (t) => {
        const st = stateAt(t);
        const s = st.k >= 0 ? S[st.k] : null;
        const T = s ? Tk(st.k) : 0;
        P.set({ o: ramp(t, 0, 0.4, E.lin) });
        curve.set({ k: ramp(t, 0.4, 1.4, E.lin), fillO: ramp(t, 1.2, 1.6, E.lin) });

        // the red band over the part that is thrown away, and the dashed "lower or higher than b?" line
        const cut = (s || S[0]).cut;
        band.set({ x0: cut[0], x1: cut[1], o: s ? K(t, T + 0.85, 0.4) * (1 - K(t, T + 1.6, 0.3)) : 0 });
        if (s) {
          const [bx, by] = P.pt(s.t.b, s.t.fb);
          const ex = lerp(bx, P.px(s.x), K(t, T + 0.15, 0.3));
          ref.setAttribute("x1", bx.toFixed(1));
          ref.setAttribute("x2", ex.toFixed(1));
          ref.setAttribute("y1", by.toFixed(1));
          ref.setAttribute("y2", by.toFixed(1));
          V.show(ref, K(t, T + 0.15, 0.1) * (1 - K(t, T + 0.85, 0.2)));
          const lowerNow = s.lower;
          gap.set({
            x: s.x,
            y0: s.fx,
            y1: s.t.fb,
            tone: lowerNow ? "green" : "red",
            k: K(t, T + 0.4, 0.2),
            o: 1 - K(t, T + 0.85, 0.2),
          });
        } else {
          V.show(ref, 0);
          gap.set({ k: 0 });
        }

        // dots and their guides
        pts.forEach((p, i) => {
          const k = K(t, p.at, 0.4);
          const out = p.drop == null ? 0 : K(t, p.drop, 0.4);
          let bump = 0;
          S.forEach((q, j) => {
            if (toneOf(p.x, q.t, q) !== toneOf(p.x, q.nt, null)) bump = Math.max(bump, flash(t, Tk(j) + 1.2, Tk(j) + 1.6));
          });
          const ev = reuse.find(([x, a]) => x === p.x && t >= a - 0.1 && t < a + 1.3);
          const ringK = ev ? K(t, ev[1], 0.35) * (1 - K(t, ev[1] + 0.85, 0.3)) : 0;
          dots[i].set({
            x: p.x,
            y: A3.BF(p.x),
            tone: toneOf(p.x, st.tri, st.live),
            s: E.pop(k) * (1 - 0.4 * out) * (1 + 0.25 * bump),
            o: pk(k) * (1 - out),
            ring: ringK > 0 ? "green" : null,
            ringK,
          });
          guides[i].set({ x: p.x, y0: y0(), y1: A3.BF(p.x), k: K(t, p.at + 0.1, 0.4), o: 1 - out });
        });

        // letters: a, b, c glide to their new points, x names the probe
        ["a", "b", "c"].forEach((r, i) => {
          letters[r].set({ text: r, x: roleX(r, st, t), y: y0(), dy: -16, o: pk(K(t, 1.4 + 0.3 * i, 0.4)) });
        });
        letters.x.set({
          text: "x",
          x: s ? s.x : 0,
          y: y0(),
          dy: -16,
          o: s ? pk(K(t, T, 0.4)) * (1 - K(t, T + 1.0, 0.25)) : 0,
        });

        // the bracket bar under the axis
        const g = s ? ramp(t, T + 1.15, T + 1.55, E.inOut) : 0;
        span.set({
          x0: s ? lerp(s.t.a, s.nt.a, g) : ST.a,
          x1: s ? lerp(s.t.c, s.nt.c, g) : ST.a + (ST.c - ST.a) * ramp(t, 2.2, 2.8, E.inOut),
          o: K(t, 2.2, 0.2),
        });

        // tags: lowest in the middle (start), lower / higher (each probe), reused (kept probes)
        const kb = K(t, 2.6, 0.35);
        const [tagX, tagY] = [P.px(ST.b) + 90, P.py(ST.fb) - 110];
        midTag.set({ s: 0.8 + 0.2 * E.pop(kb), o: pk(kb) * (1 - K(t, 3.15, 0.25)), dx: tagX, dy: tagY });
        lead.set({
          x: ST.b,
          y0: ST.fb,
          y1: P.cur.y0 + (P.area.y + P.area.h - (tagY + 24)) / P.cur.sy,
          k: kb,
          o: 1 - K(t, 3.15, 0.25),
        });
        if (s) {
          const kv = K(t, T + 0.35, 0.3);
          verdict.set({
            text: s.lower ? "lower" : "higher",
            tone: s.lower ? "green" : "red",
            s: 0.8 + 0.2 * E.pop(kv),
            o: pk(kv) * (1 - K(t, T + 0.85, 0.15)),
            dx: P.px(s.x),
            dy: Math.min(P.py(s.fx), P.py(s.t.fb)) - 62,
          });
        } else verdict.set({ o: 0 });
        const re = reuse.find(([, a]) => t >= a && t < a + 1.3);
        const kr = re ? K(t, re[1], 0.3) : 0;
        reused.set({
          s: 0.8 + 0.2 * E.pop(kr),
          o: re ? pk(kr) * (1 - K(t, re[1] + 0.85, 0.25)) : 0,
          dx: re ? P.px(re[0]) : 0,
          dy: re ? P.py(A3.BF(re[0])) - 62 : 0,
        });

        // the two stats and the "x 0.618" tag
        const kStat = K(t, 2.2, 0.4);
        const evals = 3 + S.filter((q, j) => t >= Tk(j) + 0.3).length;
        evalStat.set({
          text: String(evals),
          s: 0.8 + 0.2 * E.pop(kStat),
          o: pk(kStat),
          bump: Math.max(0, ...S.map((q, j) => flash(t, Tk(j) + 0.3, Tk(j) + 0.6))),
        });
        const kW = K(t, 2.4, 0.4);
        const w0 = st.k > 0 ? S[st.k - 1].width : 1;
        widthStat.set({
          text: A3.fmt(s ? lerp(w0, s.width, ramp(t, T + 1.3, T + 1.7, E.inOut)) : 1, 3),
          s: 0.8 + 0.2 * E.pop(kW),
          o: pk(kW),
          bump: 0.6 * Math.max(0, ...S.map((q, j) => flash(t, Tk(j) + 1.3, Tk(j) + 1.7))),
        });
        let j = -1;
        S.forEach((q, i) => {
          if (t >= Tk(i) + 1.3) j = i;
        });
        const kt = j >= 0 ? K(t, Tk(j) + 1.3, 0.35) : 0;
        times.set({ s: 0.8 + 0.2 * E.pop(kt), o: j === 0 ? pk(kt) : j > 0 ? 1 : 0 });

        // the minimum, found
        const ks = K(t, 11.2, 0.4);
        star.set({ x: P.px(0.62), y: P.py(A3.BF(0.62)) - 46, s: E.pop(ks), o: pk(ks) });
      };
    },
  });
})();

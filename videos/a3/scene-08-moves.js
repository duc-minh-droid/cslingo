/* Algorithms Phase 3 · scene 08-moves: Nelder-Mead moves on f = (x - 3.5)^2 + (y - 2.2)^2 (minimum 0 at (3.5, 2.2)).
   A triangle B, G, W (best, good, worst by f) replaces its worst corner each round: reflect W through the middle C of the best side (R);
   a flip that beats the best earns a longer try (expand, E); a flip no better than G overshot (contract: M1 inside, M2 outside);
   nothing works -> shrink towards B. Every point comes from A3.NM_BOWL (common-2.js, asserted there): round 1 expand, round 2 expand,
   round 3 reflect (the expansion failed), round 4 inside contraction; the shrink is the hypothetical A3.nmShrink of the triangle
   after round 4. update(t) is a pure function of t: which round runs, where each corner is, and its colours (by rank of f, recomputed
   from the corners that have landed) all come from t. The tags sit where planLayouts() put them: one fixed layout per round, found
   at build time (greedy: nearest free spot, outward first, clear of dots, arrows, edges and other tags), so they never jump. */
(function () {
  const V = window.VID;
  const A3 = V.a3;
  const { ease: E, ramp, lerp, clamp, flash } = V;

  const RD = A3.NM_BOWL.rounds;
  const F = A3.BOWL2;
  const MIN = [3.5, 2.2];
  // f as the lessons print it: exact to 3 decimals where it is (3.865, 0.765), else 2 decimals (5.82)
  const fv = (p) => {
    const v = F(p);
    return A3.fmt(Math.abs(v - +v.toFixed(3)) < 1e-9 ? v : +v.toFixed(2), 3);
  };
  const TONES = ["green", "blue", "red"];
  const LETTERS = ["B", "G", "W"];
  const WORDS = ["best", "good", "worst"]; // round 1 spells the letters out: "B best 11.09"
  /** the corner tag: letter and f (round 1 adds the word, so B, G and W are explained where they first appear) */
  const cornerText = (first, rank, p) => `${LETTERS[rank]}${first ? ` ${WORDS[rank]}` : ""} ${fv(p)}`;
  const mix = (a, b, q) => [lerp(a[0], b[0], q), lerp(a[1], b[1], q)];
  const pk = (t, a, d = 0.3) => ramp(t, a, a + d, E.lin);
  const popS = (k) => 0.8 + 0.2 * E.pop(k);
  const op = (k) => Math.min(1, k * 4);
  const same = (p, q) => Math.abs(p[0] - q[0]) < 1e-9 && Math.abs(p[1] - q[1]) < 1e-9;

  // ---------- the real algorithm, checked ----------
  A3.need(RD.map((r) => r.op + (r.tried ? "*" : "")).join() === "expand,expand,reflect*,in", "scene 8: moves");
  A3.need(
    RD.every((r, k) => r.moved.length === 1 && (k === 0 || RD[k - 1].to.every((p, i) => same(p, r.from[i])))),
    "scene 8: one corner moves per round, slots carry over",
  );
  A3.need(RD[0].fR < RD[0].B.f && RD[0].fE < RD[0].fR, "scene 8: round 1 expands");
  A3.need(RD[1].fR < RD[1].B.f && RD[1].fE < RD[1].fR, "scene 8: round 2 expands");
  A3.need(RD[2].fR < RD[2].B.f && RD[2].fE >= RD[2].fR, "scene 8: round 3, the expansion fails");
  A3.need(
    RD[3].fR >= RD[3].G.f && RD[3].f1 < RD[3].W.f && RD[3].f1 < RD[3].f2 && RD[3].f2 >= RD[3].W.f,
    "scene 8: round 4",
  );
  const SHR = A3.nmShrink(RD[3].next);
  const AFTER = RD[3].to; // the three corners (slot order) before the hypothetical shrink
  const SHRUNK = AFTER.map((p) => {
    const j = RD[3].next.findIndex((v) => same(v.p, p));
    return [SHR.B, SHR.G, SHR.W][j];
  });
  A3.need(
    SHRUNK.map((p) => p.join()).join(";") === "3.5,1.5;4.25,1.75;4,1",
    `scene 8: shrink ${SHRUNK.map((p) => p.join())}`,
  );

  // ---------- timeline (local seconds) ----------
  // C: centre appears, a1: flip arrow grows, R: flip appears, vR: its verdict, a2: stretch arrow, E / M1 / M2: further candidates,
  // g: the worst corner glides to the winner
  // a failed candidate (the stretch of round 3, the overshoot of round 4) stays up with its red cross for about a second
  const SCH = [
    { C: 2.6, a1: [2.85, 3.4], R: 3.4, vR: 3.65, a2: [3.9, 4.35], E: 4.35, vE: 4.45, g: [4.7, 5.3] },
    { C: 5.4, a1: [5.5, 5.8], R: 5.8, vR: 5.9, a2: [5.95, 6.2], E: 6.2, vE: 6.25, g: [6.35, 6.8] },
    { C: 7.0, a1: [7.15, 7.55], R: 7.55, vR: 7.65, a2: [7.7, 8.1], E: 8.1, vE: 8.2, dropE: 9.2, g: [9.4, 9.9] },
    { C: 10.0, a1: [10.15, 10.55], R: 10.55, vR: 10.65, M1: 11.5, M2: 11.7, vM: 12.1, dropR: 11.7, g: [12.3, 12.9] },
  ];
  const WHATIF = 13.0; // "what if nothing works?" appears, then the shrink demo runs
  const SHR_T = [13.3, 14.1];
  const TAGS_END = SCH[3].g[1]; // the number tags give way to plain letters once the last glide lands
  const CHOSEN = { expand: "E", reflect: "R", in: "M1", out: "M2" };
  const PULSE_AT = [2.85, 4.4, 6.25, 9.2, 12.1, SHR_T[0]];

  /** the three corners (slot order) at t, gliding while a round moves one; settled = the corners that have landed */
  function cornersAt(t, settled) {
    let pts = RD[0].from;
    for (let k = 0; k < 4; k++) {
      const [g0, g1] = SCH[k].g;
      if (t >= g1) {
        pts = RD[k].to;
        continue;
      }
      if (t > g0 && !settled) {
        const q = E.inOut(ramp(t, g0, g1, E.lin));
        return pts.map((p, i) => (RD[k].moved.includes(i) ? mix(p, RD[k].to[i], q) : p));
      }
      return pts;
    }
    if (settled) return t >= SHR_T[1] ? SHRUNK : pts;
    const q = E.inOut(ramp(t, SHR_T[0], SHR_T[1], E.lin));
    return pts.map((p, i) => mix(p, SHRUNK[i], q));
  }
  /** colour and letter of every corner by rank of f */
  function roles(pts) {
    const order = pts.map((p, i) => i).sort((a, b) => F(pts[a]) - F(pts[b]));
    const rank = [];
    order.forEach((slot, r) => (rank[slot] = r));
    return { rank, tones: rank.map((r) => TONES[r]), letters: rank.map((r) => LETTERS[r]) };
  }

  // ---------- tag layout (build time) ----------
  const DIRS = Array.from({ length: 16 }, (_, i) => [Math.cos((i * Math.PI) / 8), Math.sin((i * Math.PI) / 8)]);
  const GAPS = [14, 20, 28, 38, 50, 66, 86];
  const TAG_H = 53;
  const tagW = (text) => Math.round(46 + 14.8 * text.length);
  const hitCircle = (b, [x, y, r]) => (x - clamp(x, b.x0, b.x1)) ** 2 + (y - clamp(y, b.y0, b.y1)) ** 2 < r * r;
  const hitRect = (a, b, m) => a.x0 < b.x1 + m && a.x1 > b.x0 - m && a.y0 < b.y1 + m && a.y1 > b.y0 - m;
  const samples = (a, b, r, step = 10) => {
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    return Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n), r]);
  };
  function placeOne(it, circles, rects, area) {
    const [hw, hh] = [it.w / 2, it.h / 2];
    const len = Math.hypot(...it.pref) || 1;
    const [ux, uy] = [it.pref[0] / len, it.pref[1] / len];
    let best = null;
    DIRS.forEach(([dx, dy]) => {
      const ang = Math.acos(clamp(dx * ux + dy * uy, -1, 1));
      GAPS.forEach((g) => {
        const s = g + hw * Math.abs(dx) + hh * Math.abs(dy);
        const [cx, cy] = [it.at[0] + dx * s, it.at[1] + dy * s];
        const b = { x0: cx - hw, x1: cx + hw, y0: cy - hh, y1: cy + hh };
        const out = b.x0 < area.x + 6 || b.x1 > area.x + area.w - 6 || b.y0 < area.y + 6 || b.y1 > area.y + area.h - 6;
        const hits = circles.filter((c) => hitCircle(b, c)).length + rects.filter((r) => hitRect(b, r, 6)).length;
        const score = (hits + (out ? 5 : 0)) * 1000 + g + 26 * ang;
        if (!best || score < best.score) best = { score, cx, cy, b, hits: hits + (out ? 5 : 0) };
      });
    });
    return best;
  }

  /** where every tag and badge of round k goes: {id: [cx, cy]} in stage px, found once, with the tag's text width */
  function planLayouts(P, legend) {
    return RD.map((r, k) => {
      const pt = (p) => P.pt(p[0], p[1]);
      const cor = r.from.map(pt);
      const cen = [0, 1].map((a) => (cor[0][a] + cor[1][a] + cor[2][a]) / 3);
      const rl = roles(r.from);
      const far = k < 3 ? r.E : r.R;
      const C = pt(r.C);
      const circles = [
        ...cor.map(([x, y]) => [x, y, 17]),
        [...C, 18],
        [...pt(MIN), 34],
        ...samples(pt(r.W.p), pt(far), 11),
        ...samples(pt(r.B.p), pt(r.G.p), 8),
        ...samples(cor[0], cor[1], 8),
        ...samples(cor[1], cor[2], 8),
        ...samples(cor[2], cor[0], 8),
      ];
      const cands = k < 3 ? { R: r.R, E: r.E } : { R: r.R, M1: r.M1, M2: r.M2 };
      Object.values(cands).forEach((p) => circles.push([...pt(p), 17]));
      const rects = [legend];
      const items = [];
      cor.forEach((at, i) =>
        items.push({
          id: `c${i}`,
          at,
          pref: [at[0] - cen[0], at[1] - cen[1]],
          w: tagW(cornerText(k === 0, rl.rank[i], r.from[i])),
          h: TAG_H,
        }),
      );
      const label = {
        R: `R ${fv(r.R)}`,
        E: k < 3 ? `E ${fv(r.E)}` : "",
        M1: `M1 ${fv(r.M1 || [0, 0])}`,
        M2: `M2 ${fv(r.M2 || [0, 0])}`,
      };
      Object.entries(cands).forEach(([id, p]) => {
        const at = pt(p);
        const w = tagW(label[id]);
        items.push({ id, at, pref: [at[0] - cen[0], at[1] - cen[1]], w: w + 50, h: TAG_H, tagW: w });
      });
      if (k === 0) items.push({ id: "mid", at: C, pref: [0, -1], w: tagW("middle"), h: TAG_H, optional: true });
      const out = {};
      items.forEach((it) => {
        const best = placeOne(it, circles, rects, P.area);
        if (it.optional && best.hits) return; // no room: this tag is left out
        A3.need(best.hits === 0, `scene 8: no free spot for the tag ${it.id} of round ${k + 1}`);
        rects.push(best.b);
        if (it.tagW) {
          const side = best.cx >= it.at[0] ? 1 : -1; // the tag stays on the side nearest its dot, the badge goes outside
          out[it.id] = [best.cx - side * (it.w / 2 - it.tagW / 2), best.cy];
          out[`${it.id}v`] = [best.cx + side * (it.w / 2 - 22), best.cy];
        } else out[it.id] = [best.cx, best.cy];
      });
      return out;
    });
  }

  V.scene({
    kicker: "NELDER–MEAD",
    title: ["A triangle flips", "its worst corner"],
    dur: 15,
    caps: [
      [0.4, 2.4, "Two numbers, no slopes: keep a triangle."],
      [2.6, 4.5, "Flip the worst corner through the middle."],
      [4.6, 6.9, "A great flip? Stretch even further."],
      [7.0, 9.3, "Stretched too far? Keep the plain flip."],
      [9.9, 12.9, "Flip overshoots? Pull the corner in instead."],
      [13.0, 14.6, "If every try fails: shrink towards the best."],
    ],
    build(stage) {
      const P = A3.plot(stage, {
        x: 0,
        y: 0,
        w: 936,
        h: 528,
        view: [-0.6, 7.2, -0.7, 3.3],
        equal: true,
        grid: false,
        pad: { l: 12, r: 12, t: 12, b: 12 },
      });
      P.view([-0.6, 7.2, -0.7, 3.3]);
      const legendBox = { x0: 24, y0: 24, x1: 24 + 310, y1: 24 + 2 * TAG_H + 8 };
      const LAY = planLayouts(P, legendBox);

      // ---------- handles (they stack in creation order) ----------
      const rings = P.contours(A3.contours(F, [-3, 10, -3, 6], A3.BOWL_LEVELS));
      const star = A3.star(P.over, { size: 48 });
      const ghost = P.simplex({ tone: "grey" });
      const arrow1 = P.arrow({ tone: "purple", w: 6 });
      const arrow2 = P.arrow({ tone: "purple", w: 6 });
      const tri = P.simplex({ tone: "purple" });
      const side = P.path({ tone: "grey", w: 5, dash: "2 11" });
      const centre = A3.diamond(P.over, { size: 24, tone: "grey" });
      const dots = {
        R: P.dot({ tone: "purple", r: 12 }),
        E: P.dot({ tone: "purple", r: 12 }),
        M1: P.dot({ tone: "purple", r: 12 }),
        M2: P.dot({ tone: "purple", r: 12 }),
      };
      const cTags = [0, 1, 2].map(() => A3.tag(P.html, { anchor: "m", text: "B 0", tone: "green" }));
      const kTags = {};
      const badges = {};
      ["R", "E", "M1", "M2"].forEach((id) => {
        kTags[id] = A3.tag(P.html, { anchor: "m", text: id, tone: "purple" });
        badges[id] = A3.badge(P.html, { size: 44, icon: "tick" });
      });
      const midTag = A3.tag(P.html, { anchor: "m", text: "middle", tone: "grey" });
      const legend = A3.tag(P.html, { x: 24, y: 24, text: "rings: same f", tone: "grey" });
      const legend2 = A3.tag(P.html, { x: 24, y: 24 + TAG_H + 8, text: "lower f is better", tone: "grey" });
      const lastTag = A3.tag(P.html, { anchor: "m", text: "what if nothing works?", tone: "grey" });
      const mv = A3.moves(stage, { x: 12, y: 548, w: 912, h: 60 }); // 12 px in: a pulse or a pop never leaves the stage

      // where the last-resort tag goes: beside the triangles of the shrink demo
      const lastAt = (() => {
        const pt = (p) => P.pt(p[0], p[1]);
        const pts = [...AFTER, ...SHRUNK].map(pt);
        const all = [...pts, pt(MIN)];
        const circles = [...all.map(([x, y]) => [x, y, 40]), [...pt(MIN), 34]];
        [AFTER, SHRUNK].forEach((tr) => tr.forEach((p, i) => circles.push(...samples(pt(p), pt(tr[(i + 1) % 3]), 8))));
        const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
        const best = placeOne({ at: [cx, cy], pref: [1, 1], w: tagW("what if nothing works?"), h: TAG_H }, circles, [legendBox], P.area);
        A3.need(best.hits === 0, "scene 8: no free spot for the last-resort tag");
        return [best.cx, best.cy];
      })();

      const px = (p) => P.pt(p[0], p[1]);
      /** a point d px before q on the way from p to q (data coordinates): so an arrow stops short of the dot it points at */
      const short = (p, q, d) => {
        const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
        const s = d / P.cur.sx / L;
        return [q[0] - (q[0] - p[0]) * s, q[1] - (q[1] - p[1]) * s];
      };

      return (t) => {
        const n = SCH.filter((s) => t >= s.g[1]).length; // glides that have landed
        const kk = SCH.reduce((a, s, i) => (t >= s.C ? i : a), -1);
        const k = Math.max(kk, 0);
        const r = RD[k];
        const s = SCH[k];
        const [g0, g1] = s.g;
        const pts = cornersAt(t, false);
        const rl = roles(cornersAt(t, true));
        const live = kk >= 0;

        P.set({ o: ramp(t, 0, 0.4, E.lin) });
        rings.set({ o: ramp(t, 0, 1.0, E.lin) });
        // the minimum is not known to the algorithm: the star only appears once the last move has landed
        const kS = pk(t, SCH[3].g[1] + 0.1, 0.4);
        star.set({ x: P.px(MIN[0]), y: P.py(MIN[1]), s: popS(kS), o: op(kS) });
        const kL = pk(t, 0.8);
        legend.set({ s: popS(kL), o: op(kL) });
        legend2.set({ s: popS(kL), o: op(kL) });

        // ---------- the triangle, its ghost and the corner tags ----------
        const kT = pk(t, 1.0, 0.5);
        const late = t >= TAGS_END;
        tri.set({
          pts,
          tones: rl.tones,
          labels: late ? rl.letters : [],
          fillO: kT,
          dotO: ramp(t, 1.0, 1.3, E.lin),
          o: ramp(t, 0.95, 1.2, E.lin), // nothing of the triangle (not even its outline) shows before it arrives
        });
        let gp = RD[0].from;
        let go = 0;
        RD.forEach((q, i) => {
          const [a, b] = SCH[i].g;
          if (t >= a - 0.05 && t < b + 0.5) {
            gp = q.from;
            go = ramp(t, a - 0.05, a + 0.1, E.lin) * (1 - ramp(t, b + 0.2, b + 0.5, E.lin));
          }
        });
        if (t >= SHR_T[0] - 0.05) {
          gp = AFTER;
          go = ramp(t, SHR_T[0] - 0.05, SHR_T[0] + 0.1, E.lin);
        }
        ghost.set({ pts: gp, tones: ["grey", "grey", "grey"], labels: [], o: 0.35 * go, fillO: 0, dotO: 0 });

        const lay = LAY[Math.min(n, 3)];
        cTags.forEach((tg, i) => {
          const live2 = t >= 1.4 && t < TAGS_END;
          const popT = n === 0 ? 1.4 + 0.3 * rl.rank[i] : SCH[n - 1].g[1];
          const kk2 = pk(t, popT);
          let o = live2 ? op(kk2) : 0;
          if (n < 4 && RD[n].moved.includes(i)) o *= 1 - ramp(t, SCH[n].g[0] - 0.05, SCH[n].g[0] + 0.1, E.lin);
          const from = RD[Math.min(n, 3)].from[i];
          const off = lay[`c${i}`];
          const anchor = px(from);
          const here = px(pts[i]);
          tg.set({
            text: cornerText(n === 0, rl.rank[i], pts[i]),
            tone: rl.tones[i],
            dx: here[0] + (off[0] - anchor[0]),
            dy: here[1] + (off[1] - anchor[1]),
            s: popS(kk2),
            o,
          });
        });

        // ---------- the flip and its candidates ----------
        const fo = 1 - ramp(t, g0 + 0.05, g0 + 0.4, E.lin); // the whole round clears as the corner glides
        const dropE = s.dropE ? 1 - ramp(t, s.dropE, s.dropE + 0.3, E.lin) : 1;
        const dropR = s.dropR ? 1 - ramp(t, s.dropR, s.dropR + 0.3, E.lin) : 1;
        const chosen = CHOSEN[r.op];
        const keep = t < g1 ? 1 : 0; // the winner's purple dot waits for the corner, then it becomes that corner
        const kC = pk(t, s.C);
        const lc = RD[k].C;
        centre.set({ x: P.px(lc[0]), y: P.py(lc[1]), s: popS(kC), o: live ? op(kC) * fo : 0 });
        side.set({
          pts: [short(r.G.p, r.B.p, 16), short(r.B.p, r.G.p, 16)],
          k: ramp(t, s.C, s.C + 0.3, E.lin),
          o: live ? op(kC) * fo : 0,
        });
        const kM = pk(t, s.C + 0.1);
        midTag.set({
          dx: (LAY[0].mid || [0, 0])[0],
          dy: (LAY[0].mid || [0, 0])[1],
          s: popS(kM),
          o: kk === 0 && LAY[0].mid ? op(kM) * (1 - ramp(t, 3.95, 4.2, E.lin)) : 0,
        });

        const W = r.W.p;
        const far = k < 3 ? r.E : r.R;
        const a1 = short(r.R, W, 16); // starts just outside W's dot
        arrow1.set({
          x1: a1[0],
          y1: a1[1],
          x2: short(W, r.R, 18)[0],
          y2: short(W, r.R, 18)[1],
          k: ramp(t, s.a1[0], s.a1[1], E.inOut),
          o: live ? fo * (k === 3 ? 0.35 + 0.65 * dropR : 1) : 0,
        });
        const b0 = short(far, r.R, 18);
        const b1 = short(r.R, far, 18);
        arrow2.set({
          x1: b0[0],
          y1: b0[1],
          x2: b1[0],
          y2: b1[1],
          k: k < 3 ? ramp(t, s.a2[0], s.a2[1], E.inOut) : 0,
          o: live && k < 3 ? fo * dropE : 0,
        });

        const cand = {
          R: { p: r.R, at: s.R, v: s.vR, ok: r.fR < r.G.f, drop: k === 3 ? dropR : 1, on: true },
          E: { p: r.E, at: s.E, v: s.vE, ok: k < 3 && r.fE < r.fR, drop: dropE, on: k < 3 },
          M1: { p: r.M1, at: s.M1, v: s.vM, ok: k === 3 && r.f1 < r.W.f && r.f1 < r.f2, drop: 1, on: k === 3 },
          M2: { p: r.M2, at: s.M2, v: s.vM, ok: k === 3 && r.f2 < r.W.f && r.f2 < r.f1, drop: 1, on: k === 3 },
        };
        Object.entries(cand).forEach(([id, c]) => {
          const p = c.p || [0, 0];
          const on = live && c.on;
          const kd = pk(t, c.at || 0);
          const here = px(p);
          dots[id].set({
            x: p[0],
            y: p[1],
            s: popS(kd),
            o: on ? op(kd) * (id === chosen ? keep : fo) * c.drop : 0,
          });
          const off = LAY[k][id] || [here[0], here[1]];
          kTags[id].set({
            text: `${id} ${fv(p)}`,
            dx: off[0],
            dy: off[1],
            s: popS(kd),
            o: on ? op(kd) * fo * c.drop : 0,
          });
          const kv = pk(t, c.v || 0, 0.35);
          const bo = LAY[k][`${id}v`] || off;
          badges[id].set({
            icon: c.ok ? "tick" : "cross",
            tone: c.ok ? "green" : "red",
            k: kv,
            o: on && kv > 0 ? fo * c.drop : 0,
            x: bo[0],
            y: bo[1],
          });
        });

        // ---------- the move chips and the last-resort tag ----------
        const [aR, aE, aB, aM] = [SCH[0].a1[0], SCH[0].E, SCH[2].dropE, SCH[3].vM];
        const act = t < aR ? null : t < aE ? "reflect" : t < aB ? "expand" : t < aM ? "reflect" : t < SHR_T[0] ? "in" : "shrink";
        const used = [];
        if (t >= aR) used.push("reflect");
        if (t >= aE) used.push("expand");
        if (t >= aM) used.push("contract");
        if (t >= SHR_T[0]) used.push("shrink");
        const pulse = Math.max(...PULSE_AT.map((a) => flash(t, a, a + 0.45)));
        mv.set({ active: act, used, pop: pk(t, 1.0, 0.35), pulse });
        const kR = pk(t, WHATIF);
        lastTag.set({ dx: lastAt[0], dy: lastAt[1], s: popS(kR), o: op(kR) });
      };
    },
  });
})();

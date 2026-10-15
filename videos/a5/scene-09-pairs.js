/* Phase 5 · scene 09-pairs (14.6 s): WHAT HULLS ARE FOR. Question (stated on screen): which two points are farthest apart? Trying
   every pair is slow, but the farthest pair is always two hull corners, so only pairs of corners need checking. The seven example
   points have 21 pairs: all drawn as grey segments and counted; the longest of ALL 21, A-E, turns orange (and it is two corners);
   then why an inside point can never win: the pair E-B (B is inside) is shorter than A-E, because a corner is always farther out.
   So the 11 pairs that involve an inside point (B or F, labelled 'inside') fade away, the five corners turn green inside the hull
   tint and 10 pairs are left. Then the same idea for 1,000 points with a 10-corner hull: a cloud with its 10 corners and two cards,
   499,500 pairs against 45. Every pair, its length, its corner flag and the big numbers come from A5.FAR (real distances); they are
   asserted below. Nothing is dimmed: text stays at full strength, only the segments fade; the small example leaves as a whole group.
   Story (local seconds): 0.2-1.0 the points pop in and the goal tag, 1.0-3.2 the 21 pairs draw (0.1 s apart) with the counter,
   3.4-4.2 A-E turns orange (the other pairs fade to a pale grey), 3.9 'farthest pair', 5.4-6.4 the E-B pair is red and shorter,
   7.4-8.0 'inside' tags on B and F, 7.6-8.4 the 11 pairs with B or F fade (counter 21 -> 10), 7.8-8.6 the corners turn green and the
   hull tint appears, 8.6-10 hold, 10-10.4 the small example leaves, 10.4-12 the 1,000-point cloud and its 10 corners, 11.9 all pairs
   499,500, 12.5 corner pairs 45, 13.2 '11,100 x fewer', 13.2-15 hold. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;
  const com = A5.commas;

  const { pairs: PAIRS, longest: LONGEST, big: BIG } = A5.FAR;
  const DROP = PAIRS.filter((q) => !q.corner); // the pairs with an inside point
  const KEEP = PAIRS.filter((q) => q.corner);
  A5.same("scene 9: pairs, corner pairs, dropped", [PAIRS.length, KEEP.length, DROP.length], [21, 10, 11]);
  A5.same(
    "scene 9: every dropped pair has an inside point",
    DROP.every((q) => A5.INSIDE.includes(q.a) || A5.INSIDE.includes(q.b)),
    true,
  );
  A5.same(
    "scene 9: the farthest pair is the longest of ALL the pairs and the longest corner pair too",
    [LONGEST.key, KEEP.reduce((m, q) => (q.len > m.len ? q : m)).key, LONGEST.corner],
    ["AE", "AE", true],
  );
  A5.same("scene 9: the 1,000-point numbers", [BIG.n, BIG.hull, BIG.all, BIG.corners], [1000, 10, 499500, 45]);
  // the demo: an inside point (B) is beaten by a corner (A) as seen from E
  const BE = PAIRS.find((q) => q.key === "BE");
  A5.same(
    "scene 9: B-E (B is inside) is shorter than A-E",
    [A5.INSIDE.includes("B"), BE.len < LONGEST.len],
    [true, true],
  );
  const FEWER = BIG.all / BIG.corners; // 11,100 times fewer pairs
  A5.same("scene 9: how many times fewer", FEWER, 11100);

  const DRAW0 = 1.0; // the first pair starts to draw
  const DRAW_STEP = 0.1;
  const DRAW_LEN = 0.25;
  const PICK0 = 3.4; // A-E turns orange, the other pairs turn pale
  const DEMO0 = 5.4; // the pair E-B turns red
  const DROP0 = 7.6; // the first dropped pair starts to fade
  const DROP_STEP = 0.05;
  const DROP_LEN = 0.5;
  const CORNER0 = 7.8; // the first corner turns green
  const LEAVE = [10, 10.4]; // the small example leaves
  const dropAt = (q) => DROP0 + DROP_STEP * DROP.indexOf(q);
  const MID = 0.3; // a fading pair no longer counts after this many seconds

  /* a cloud of 'many points' with exactly 10 corners (unit box): ten corners on an ellipse and 70 dots well inside, none touching */
  function bigCloud() {
    const r = A5.rng(5);
    const pts = Array.from({ length: BIG.hull }, (_, i) => {
      const a = (2 * Math.PI * (i + 0.25 * (r() - 0.5))) / BIG.hull;
      return [0.5 + 0.5 * Math.cos(a) * (0.94 + 0.06 * r()), 0.5 + 0.46 * Math.sin(a) * (0.94 + 0.06 * r())];
    });
    let guard = 0;
    while (pts.length < 80 && guard++ < 5000) {
      const a = 2 * Math.PI * r();
      const d = 0.37 * Math.sqrt(r());
      const p = [0.5 + d * Math.cos(a), 0.5 + 0.9 * d * Math.sin(a)];
      if (pts.every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.075)) pts.push(p);
    }
    return pts;
  }
  const CLOUD = bigCloud();
  A5.same("scene 9: the big cloud has 10 corners, the first ten dots", A5.cloudHull(CLOUD).sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); // prettier-ignore
  const BOX = 340;
  const CLOUD_AT = { x: 40, y: 150 };

  V.scene({
    kicker: "WHAT HULLS ARE FOR",
    title: ["The farthest pair is", "always on the hull"],
    dur: 14.6,
    caps: [
      [1, 3.2, "Try every pair: 21 of them."],
      [3.5, 5.3, "The farthest pair is A and E: two corners."],
      [5.5, 7.4, "An inside point always loses to a corner."],
      [7.6, 9.4, "So drop every pair that uses an inside point."],
      [10.6, 12.2, "1,000 points, 10 corners."],
      [12.4, 14.3, "45 pairs to check, not 499,500."],
    ],
    build(stage) {
      const pl = A5.plot(stage, { segs: 26, polys: 1, tags: 6 });
      const between = (a, b, dx = 0, dy = 0) => [0, 1].map((k, i) => (pl.xy(a)[k] + pl.xy(b)[k]) / 2 + (i ? dy : dx));
      const mid = between(LONGEST.a, LONGEST.b);
      const HULL_TAG = between("D", "E", 20, 10); // just outside the edge D-E: it names the green shape
      const redMid = between("B", "E", 44, -46); // the shorter pair E-B, labelled above its line

      const pairs = A5.counter(stage, { x: 708, y: 40, w: 208, label: "pairs", tone: "grey" });
      const seven = A5.tag(stage, { x: 716, y: 138, text: "7 points", tone: "grey" });
      const goal = A5.tag(stage, { x: 12, y: 456, text: "goal: the two points farthest apart", tone: "orange" });

      // the big example: a cloud of dots with 10 green corners, and the two numbers
      const dots = Object.fromEntries(
        CLOUD.map((c, i) => [`p${i}`, [CLOUD_AT.x + c[0] * BOX, CLOUD_AT.y + c[1] * BOX]]),
      );
      const big = A5.plot(stage, { pos: dots, r: 7, letters: false, segs: 0, arcs: 0, polys: 1, tags: 0 });
      const rnd = A5.rng(9);
      const order = CLOUD.map(() => rnd());
      const rank = order.map((k) => order.filter((o) => o < k).length);
      const sizeTag = A5.tag(stage, { x: 440, y: 118, text: "n = 1,000 points · 10 corners", tone: "grey" });
      const allC = A5.counter(stage, { x: 440, y: 210, w: 470, h: 100, label: "all pairs", tone: "red" });
      const cornC = A5.counter(stage, {
        x: 440,
        y: 340,
        w: 470,
        h: 100,
        label: "corner pairs",
        tone: "green",
        solid: true,
      });
      const fewer = A5.tag(stage, { x: 440, y: 480, text: `${com(FEWER)} × fewer`, tone: "green", solid: true });

      return (t) => {
        // ---- the small example leaves as a whole group (its text is never dimmed)
        const out = 1 - ramp(t, LEAVE[0], LEAVE[1], lin);

        // ---- the seven points
        const points = {};
        A5.NAMES.forEach((name, i) => {
          const k = ramp(t, 0.2 + 0.07 * i, 0.6 + 0.07 * i, lin);
          const st = { s: E.pop(k), o: Math.min(1, k * 4) };
          const c = A5.HULL.indexOf(name);
          if (c >= 0) {
            const tc = CORNER0 + 0.1 * c;
            if (t >= tc)
              Object.assign(st, { tone: "green", solid: true, s: st.s * (1 + 0.25 * flash(t, tc, tc + 0.4)) });
          }
          if ((name === LONGEST.a || name === LONGEST.b) && t >= PICK0 + 0.3)
            Object.assign(st, { ring: "orange", ringK: ramp(t, PICK0 + 0.3, PICK0 + 0.7, lin) });
          if (name === "B" && t >= DEMO0) Object.assign(st, { ring: "red", ringK: ramp(t, DEMO0, DEMO0 + 0.4, lin) * (1 - ramp(t, 7.4, 7.7, lin)) }); // prettier-ignore
          points[name] = st;
        });

        // ---- the 21 pairs: draw, find the longest, drop the ones with an inside point
        const pale = lerp(1, 0.35, ramp(t, PICK0, PICK0 + 0.5, lin)); // the pairs that are not the answer turn pale (segments only)
        const segs = PAIRS.map((q, i) => {
          const s0 = DRAW0 + DRAW_STEP * i;
          const o = q.corner ? pale : pale * (1 - ramp(t, dropAt(q), dropAt(q) + DROP_LEN, lin));
          const base = { a: q.a, b: q.b, tone: "grey", w: 0.45, k: ramp(t, s0, s0 + DRAW_LEN, lin), o };
          if (q.key === LONGEST.key) {
            const k = ramp(t, PICK0, PICK0 + 0.8, E.inOut);
            return { ...base, tone: t >= PICK0 ? "orange" : "grey", w: lerp(0.45, 1.6, k), halo: k, o: 1 };
          }
          if (q.key === "BE" && t >= DEMO0) {
            const k = ramp(t, DEMO0, DEMO0 + 0.6, E.inOut);
            const gone = 1 - ramp(t, dropAt(q), dropAt(q) + DROP_LEN, lin);
            return { ...base, tone: "red", w: lerp(0.45, 1.2, k), halo: 0.6 * k, o: gone };
          }
          return base;
        });

        const polys = [{ pts: A5.HULL, tone: "green", fill: 0.5, w: 0.01, o: ramp(t, 8.0, 8.6, lin) }];
        const tags = [
          { at: "B", dy: 62, text: "inside", tone: "grey", k: ramp(t, 7.4, 7.7, lin), o: 1 - ramp(t, 8.6, 9.0, lin) },
          { at: "F", dy: -62, text: "inside", tone: "grey", k: ramp(t, 7.4, 7.7, lin), o: 1 - ramp(t, 8.6, 9.0, lin) },
          { at: HULL_TAG, anchor: "l", text: "hull", tone: "green", solid: true, k: ramp(t, 8.4, 8.7, lin) },
          { at: mid, dx: 12, dy: 8, text: "farthest pair", tone: "orange", solid: true, k: ramp(t, 3.9, 4.3, lin) },
          { at: redMid, text: "shorter", tone: "red", solid: true, k: ramp(t, DEMO0 + 0.5, DEMO0 + 0.9, lin), o: 1 - ramp(t, 7.4, 7.7, lin) }, // prettier-ignore
        ];
        pl.update({ points, polys, segs, tags, o: out });

        // ---- the counter of the small example: 0 -> 21 as the pairs draw, 21 -> 10 as the inside ones fade
        const started = t < DRAW0 ? 0 : Math.min(PAIRS.length, Math.floor((t - DRAW0) / DRAW_STEP + 1e-6) + 1);
        const gone = DROP.filter((q) => t >= dropAt(q) + MID).length;
        pairs.set({
          text: String(started - gone),
          k: ramp(t, DRAW0, DRAW0 + 0.3, lin),
          bump: Math.max(flash(t, DROP0, DROP0 + 0.4), flash(t, 8.4, 8.8)),
          o: out,
        });
        seven.set({ k: ramp(t, 0.35, 0.7, lin), o: out });
        goal.set({ k: ramp(t, 0.5, 0.9, lin), o: out });

        // ---- the big example: a cloud with 10 corners, then the two numbers (no count-up: each pops with its final value)
        const T0 = LEAVE[1];
        const bpts = {};
        CLOUD.forEach((_, i) => {
          const k = ramp(
            t,
            T0 + 0.7 * (rank[i] / (CLOUD.length - 1)),
            T0 + 0.7 * (rank[i] / (CLOUD.length - 1)) + 0.3,
            lin,
          );
          const on = i < BIG.hull && t >= T0 + 1.0 + 0.06 * i;
          bpts[`p${i}`] = {
            tone: on ? "green" : "grey",
            solid: on,
            s: E.pop(k) * (on ? 1 + 0.5 * ramp(t, T0 + 1.0 + 0.06 * i, T0 + 1.3 + 0.06 * i, lin) : 1),
            o: Math.min(1, k * 4),
          };
        });
        const hullK = ramp(t, T0 + 1.2, T0 + 1.9, lin);
        big.update({
          points: bpts,
          polys: [{ pts: A5.cloudHull(CLOUD).map((i) => `p${i}`), tone: "green", fill: 0.3, w: 0.6, k: hullK }],
        });
        sizeTag.set({ k: ramp(t, T0 + 0.5, T0 + 0.9, lin) });
        allC.set({ text: com(BIG.all), k: ramp(t, 11.9, 12.2, lin), bump: flash(t, 12.2, 12.6) });
        cornC.set({ text: com(BIG.corners), solid: true, k: ramp(t, 12.5, 12.8, lin), bump: flash(t, 12.8, 13.2) });
        fewer.set({ k: ramp(t, 13.2, 13.55, lin) });
      };
    },
  });
})();

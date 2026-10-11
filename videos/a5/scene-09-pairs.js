/* Phase 5 · scene 09-pairs (11 s): WHAT HULLS ARE FOR. Question (stated on screen): which two points are farthest apart? Trying
   every pair is slow, but the farthest pair is always two hull corners, so only pairs of corners need checking. The seven example
   points have 21 pairs: all drawn as grey segments and counted; the 11 that involve an inside point (B or F, labelled 'inside')
   fade away, the five corners turn green inside the hull tint and 10 pairs are left; the longest of them, A-E, turns orange and is
   tagged 'farthest pair'. Then the same idea for 1,000 points with a 10-corner hull: 499,500 pairs against 45.
   Every pair, its length, its corner flag and the big numbers come from A5.FAR (real distances); they are asserted below.
   Story (local seconds): 0.2-1.0 the points pop in and the goal tag, 1.0-3.25 the 21 pairs draw (0.1 s apart) with the counter,
   3.2-3.6 'inside' tags on B and F, 3.6-4.6 the 11 pairs with B or F fade (counter 21 -> 10), 4.0-4.8 the corners turn green
   and the hull tint appears, 4.6-5.6 hold, 5.6-6.4 A-E turns orange (the other nine dim), 6.2 'farthest pair', 7.7-8.4 the
   small example dims and the goal tag becomes 'n = 1,000 points', 8.4-9.0 all pairs counts up, 9.2-9.8 corner pairs. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;

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
    "scene 9: the farthest pair is the longest corner pair too",
    [LONGEST.key, KEEP.reduce((m, q) => (q.len > m.len ? q : m)).key],
    ["AE", "AE"],
  );
  A5.same("scene 9: the 1,000-point numbers", [BIG.n, BIG.hull, BIG.all, BIG.corners], [1000, 10, 499500, 45]);

  const DRAW0 = 1.0; // the first pair starts to draw
  const DRAW_STEP = 0.1;
  const DRAW_LEN = 0.25;
  const DROP0 = 3.6; // the first dropped pair starts to fade
  const DROP_STEP = 0.05;
  const DROP_LEN = 0.5;
  const CORNER0 = 4.0; // the first corner turns green
  const PICK0 = 5.6; // A-E turns orange
  const dropAt = (q) => DROP0 + DROP_STEP * DROP.indexOf(q);
  const MID = 0.3; // a fading pair no longer counts after this many seconds

  V.scene({
    kicker: "WHAT HULLS ARE FOR",
    title: ["The farthest pair is", "always on the hull"],
    dur: 11,
    caps: [
      [1, 3.2, "Try every pair: 21 of them."],
      [3.6, 5.5, "Drop pairs with an inside point."],
      [5.8, 7.8, "The farthest pair is two hull corners."],
      [8.4, 10.9, "1,000 points, 10 corners: 45 pairs, not 499,500."],
    ],
    build(stage) {
      const pl = A5.plot(stage, { segs: 26, polys: 1, tags: 4 });
      const mid = [0, 1].map((k) => (pl.xy(LONGEST.a)[k] + pl.xy(LONGEST.b)[k]) / 2);

      const pairs = A5.counter(stage, { x: 716, y: 40, w: 208, label: "pairs", tone: "grey" });
      const seven = A5.tag(stage, { x: 716, y: 138, text: "7 points", tone: "grey" });
      const goal = A5.tag(stage, { x: 12, y: 456, text: "goal: the two points farthest apart", tone: "orange" });
      const sizeTag = A5.tag(stage, { x: 12, y: 456, text: "n = 1,000 points · 10 corners", tone: "grey" });
      const allC = A5.counter(stage, { x: 12, y: 532, w: 400, label: "all pairs", tone: "red" });
      const cornC = A5.counter(stage, { x: 432, y: 532, w: 330, label: "corner pairs", tone: "green", solid: true });

      return (t) => {
        // ---- the small example dims once the big numbers take over
        const dim = lerp(1, 0.5, ramp(t, 7.9, 8.4, lin));

        // ---- the seven points
        const points = {};
        A5.NAMES.forEach((name, i) => {
          const k = ramp(t, 0.2 + 0.07 * i, 0.6 + 0.07 * i, lin);
          const st = { s: E.pop(k), o: Math.min(1, k * 4) };
          if (A5.INSIDE.includes(name)) st.o *= lerp(1, 0.5, ramp(t, DROP0, DROP0 + 0.6, lin));
          const c = A5.HULL.indexOf(name);
          if (c >= 0) {
            const tc = CORNER0 + 0.1 * c;
            if (t >= tc) Object.assign(st, { tone: "green", solid: true, s: st.s * (1 + 0.25 * flash(t, tc, tc + 0.4)) });
          }
          if ((name === LONGEST.a || name === LONGEST.b) && t >= PICK0 + 0.3)
            Object.assign(st, { ring: "orange", ringK: ramp(t, PICK0 + 0.3, PICK0 + 0.7, lin) });
          points[name] = st;
        });

        // ---- the 21 pairs: draw, drop the ones with an inside point, dim the rest
        const dimKeep = lerp(1, 0.35, ramp(t, PICK0, PICK0 + 0.8, lin));
        const segs = PAIRS.map((q, i) => {
          const s0 = DRAW0 + DRAW_STEP * i;
          const o = q.corner ? dimKeep : 1 - ramp(t, dropAt(q), dropAt(q) + DROP_LEN, lin);
          return { a: q.a, b: q.b, tone: "grey", w: 0.45, k: ramp(t, s0, s0 + DRAW_LEN, lin), o };
        });
        segs.push({
          a: LONGEST.a,
          b: LONGEST.b,
          tone: "orange",
          w: 1.6,
          k: ramp(t, PICK0, PICK0 + 0.8, E.inOut),
          halo: ramp(t, PICK0, PICK0 + 0.8, lin),
        });

        const polys = [{ pts: A5.HULL, tone: "green", fill: 0.5, w: 0.01, o: ramp(t, 4.2, 4.8, lin) }];
        const tags = [
          { at: "B", dy: 54, text: "inside", tone: "grey", k: ramp(t, 3.2, 3.5, lin), o: 1 - ramp(t, 4.6, 5.0, lin) },
          { at: "F", dy: -54, text: "inside", tone: "grey", k: ramp(t, 3.2, 3.5, lin), o: 1 - ramp(t, 4.6, 5.0, lin) },
          { at: mid, text: "farthest pair", tone: "orange", solid: true, k: ramp(t, 6.2, 6.6, lin) },
        ];
        pl.update({ points, polys, segs, tags, o: dim });

        // ---- the counter of the small example: 0 -> 21 as the pairs draw, 21 -> 10 as the inside ones fade
        const started = t < DRAW0 ? 0 : Math.min(PAIRS.length, Math.floor((t - DRAW0) / DRAW_STEP + 1e-6) + 1);
        const gone = DROP.filter((q) => t >= dropAt(q) + MID).length;
        pairs.set({
          text: String(started - gone),
          k: ramp(t, DRAW0, DRAW0 + 0.3, lin),
          bump: Math.max(flash(t, 3.2, 3.6), flash(t, 4.5, 4.9)),
          o: dim,
        });
        seven.set({ k: ramp(t, 0.35, 0.7, lin), o: dim });

        // ---- the bottom band: the goal, then the 1,000-point numbers
        goal.set({ k: ramp(t, 0.5, 0.9, lin), o: 1 - ramp(t, 7.7, 7.95, lin) });
        sizeTag.set({ k: ramp(t, 8.0, 8.4, lin) });
        const up = (a, b, n) => String(Math.round(n * ramp(t, a, b, E.out)));
        allC.set({ text: A5.commas(up(8.4, 9.0, BIG.all)), k: ramp(t, 8.4, 8.7, lin), bump: flash(t, 9.0, 9.4) });
        cornC.set({ text: up(9.2, 9.8, BIG.corners), k: ramp(t, 9.2, 9.5, lin), bump: flash(t, 9.8, 10.2) });
      };
    },
  });
})();

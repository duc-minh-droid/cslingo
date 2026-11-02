/* Lecture 12 video, scene 7: the swarm finds the food. Every particle does the step of scene 4 at once, every step: this is
   the app's own first demo ('Release the swarm': L12.RUN, seed 5, 14 particles, c₁ = c₂ = 2, w = 1), steps 0 to 12, the same
   swarm as scene 2. The swarm's best odour climbs 66, 78, 85, 99 in the first three steps (a row of chips keeps the history),
   the orange star jumps with it, and the dots gather round the food peak though no particle ever saw the map; with the plain
   formula they keep circling it. Every figure comes from L12.RUN (recorded and asserted in l12/common.js), asserted again here.
   Story (local seconds): 0.2-0.8 the map, the 14 dots, the two stats and the first chip; 0.9-1.4 the star and its legend;
   1.4-5.0 steps 1-3, slow (1.2 s each: best and star update at each landing); 5.0-11.75 steps 4-12 (0.75 s each); 7.4 small
   purple rings show each particle's own best; 12.0-12.6 the dashed green ring round the food and '13 of 14 near the food';
   hold to 15. */
VID.scene({
  kicker: "THE SWARM",
  title: ["Every particle, every step:", "the swarm finds the food"],
  dur: 15,
  caps: [
    [1.4, 4.8, "All 14 particles take that step together."],
    [5, 7.4, "The swarm's best climbed: 66, 78, 85, then 99."],
    [7.6, 10, "Pulled to their own bests and the swarm's, they gather."],
    [10.2, 11.9, "They swarm around the food and keep searching."],
    [12.1, 14.7, "Nobody saw the map, yet the swarm found the food."],
  ],
  build(stage, V) {
    const L12 = V.l12;
    const L5 = V.l5;
    const { ramp, flash, ease: E } = V;

    // ---- the data (L12.RUN, asserted in l12/common.js; the figures shown are asserted again here)
    const R = L12.RUN;
    const N = R.frames[0].x.length;
    const LAST = 12;
    L12.same([N, R.P.c1, R.P.c2, R.P.w], [14, 2, 2, 1], "scene 7: 14 particles, c₁ = c₂ = 2, w = 1");
    const BESTS = [0, 1, 2, 3].map((k) => R.frames[k].best);
    L12.same(BESTS, [66, 78, 85, 99], "scene 7: swarm best odour after steps 0..3");
    L12.same(
      R.frames.slice(3, LAST + 1).every((f) => f.best === 99),
      true,
      "scene 7: best stays 99 to step 12",
    );
    const near = (k, r) => R.frames[k].x.filter((q) => Math.hypot(q[0] - L12.FOOD[0], q[1] - L12.FOOD[1]) < r).length;
    const NEAR_R = 2.5;
    L12.same([near(0, NEAR_R), near(LAST, NEAR_R)], [3, 13], "scene 7: dots within 2.5 of the food at steps 0 and 12");
    // the star moves exactly when the best changes (steps 1, 2, 3) and then stays
    const gMoves = R.frames.slice(1, LAST + 1).map((f, i) => f.g.join() !== R.frames[i].g.join());
    L12.same(
      gMoves.map((m, i) => (m ? i + 1 : 0)).filter(Boolean),
      [1, 2, 3],
      "scene 7: g moves at steps 1, 2, 3 only",
    );

    // ---- timeline (local seconds)
    const T = {
      map: [0.2, 0.8],
      star: [0.9, 1.4],
      slow: [1.4, 5.0],
      fast: [5.0, 11.75],
      own: [7.4, 8.0],
      end: [12.0, 12.6],
    };
    const play = (t) =>
      t < T.slow[1] ? 3 * ramp(t, T.slow[0], T.slow[1], E.lin) : 3 + (LAST - 3) * ramp(t, T.fast[0], T.fast[1], E.lin);
    const land = (n) => T.slow[0] + ((T.slow[1] - T.slow[0]) / 3) * n; // when step n (1..3) lands
    L12.same(Math.abs(play(land(2)) - 2) < 1e-9, true, "scene 7: the play head reaches step 2 at its landing time");

    // ---- the map and the panel
    const map = L12.field(stage, { x: 12, y: 12, size: 616, dots: N, rings: N + 1, tails: N });
    const stepStat = L12.stat(stage, { x: 648, y: 12, w: 276, h: 80, label: "step", tone: "grey" });
    const bestStat = L12.stat(stage, { x: 648, y: 108, w: 276, h: 80, label: "best", tone: "green" });
    // the climb, kept as a row of chips: 66, 78, 85, 99
    const chips = BESTS.map((b, i) =>
      L12.chip(stage, { x: 648 + i * 72, y: 208, w: 60, h: 56, text: String(b), tone: "green", fs: 28, radius: 16 }),
    );
    // the legend: the orange star (swarm best g), then the small purple ring (each particle's own best p)
    const lSvg = L5.svg(stage);
    const legStar = lSvg.appendChild(L12.star(676, 318, 36, "orange"));
    const legStarL = L12.label(stage, { x: 704, y: 299, text: "swarm best g", tone: "orange", align: "left" });
    const legRing = lSvg.appendChild(
      V.s("circle", {
        cx: 676,
        cy: 382,
        r: 13,
        fill: "none",
        "stroke-width": 5,
        style: { stroke: L12.tone("purple").c },
      }),
    );
    const legRingL = L12.label(stage, { x: 704, y: 363, text: "own bests p", tone: "purple", align: "left" });
    const nearCard = L12.card(stage, {
      x: 648,
      y: 440,
      w: 276,
      h: 100,
      fs: 28,
      text: `${near(LAST, NEAR_R)} of ${N}\nnear the food`,
      tone: "green",
    });
    nearCard.el.style.whiteSpace = "pre-line";
    nearCard.el.style.lineHeight = "1.2";

    return (t) => {
      const mk = ramp(t, T.map[0], T.map[1], E.lin);
      const s = play(t);
      const A = L12.at(R, s);
      const k = s >= LAST ? LAST : A.k;
      const fr = R.frames[k];

      // the bests: which of the first steps has landed, and a bump on each landing
      const landed = [1, 2, 3].filter((n) => t >= land(n)).length; // 0..3
      const bump = landed > 0 ? flash(t, land(landed), land(landed) + 0.4) : 0;
      const starK = landed > 0 ? 0.5 + 0.5 * ramp(t, land(landed), land(landed) + 0.4, E.lin) : 1;

      // the tails shorten and fade once the fast steps start, so the gathering round the food stays readable
      const fastK = ramp(t, T.fast[0], T.fast[0] + 1.5, E.lin);
      const tailBack = 1.5 - 0.7 * fastK;
      const tailO = 0.4 - 0.12 * fastK;
      const ownK = ramp(t, T.own[0], T.own[1], E.lin);
      const rings = ownK > 0 ? fr.p.map((x) => ({ x, r: 11, o: 0.6, k: ownK })) : [];
      const endK = ramp(t, T.end[0], T.end[1], E.lin);
      if (endK > 0) rings.push({ x: L12.FOOD, r: NEAR_R * map.s, tone: "green", dash: true, k: endK });

      map.update({
        k: mk,
        dots: mk > 0 ? A.x.map((x) => ({ x, r: 13 })) : [],
        tails: s > 0 ? A.x.map((_, i) => ({ pts: L12.trail(R, i, s, tailBack), o: tailO, w: 5 })) : [],
        rings,
        star: { x: fr.g, size: 44, k: Math.min(ramp(t, T.star[0], T.star[1], E.lin), starK) },
      });

      // the panel
      stepStat.set({ text: String(k), k: mk });
      bestStat.set({ text: String(fr.best), k: mk, bump: 0.5 * bump });
      chips.forEach((c, i) => {
        const at = i === 0 ? T.map[0] : land(i);
        c.set({ k: ramp(t, at, at + 0.4, E.lin), solid: i === landed });
      });
      const lk = ramp(t, T.star[0], T.star[1], E.lin);
      V.place(legStar, { o: Math.min(1, lk * 3), s: 0.6 + 0.4 * E.pop(lk) });
      legStarL.set({ k: lk });
      V.place(legRing, { o: Math.min(1, ownK * 3), s: 0.6 + 0.4 * E.pop(ownK) });
      legRingL.set({ k: ownK });
      nearCard.set({ k: endK });
    };
  },
});

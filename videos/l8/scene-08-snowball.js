/* Lecture 8 video, scene 8: positive feedback. Short rounds leave more trail, more ants follow that trail, so it gets even
   more trail: it snowballs. A time-lapse of a real colony on lesson 8.1's ten villages (10 ants, alpha 2, beta 2, rho 0.5,
   Q 100, every ant deposits, seed 1: L8.SNOW, run and asserted in l8/common-2.js). Every number on screen (round, best tour
   in km, share of trail on the best round, ants on the best round) is read from the colony's own history.
   Story (local seconds): 0.2-1.0 the ten towns, 0.65-1.35 the 45 roads as thin equal blue trails, 1.4 'start', 1.6-2.3 the
   share sticker and the ten grey ant dots. 3.1-10.8 the time-lapse over 14 rounds: the round counts, the trails thicken on
   the good roads (blue), the best round so far is a dotted green loop (round 1's best, then round 2 finds a shorter one and
   keeps it), the ant dots turn orange (ants that walked the best round), the share of trail on it climbs from 40 % to 100 %.
   10.8-12.5 hold on round 14. */
VID.scene({
  kicker: "POSITIVE FEEDBACK",
  title: ["Good trails", "snowball"],
  dur: 12.5,
  caps: [
    [1.0, 2.9, "At first the trails are thin and equal."],
    [3.4, 6.2, "Short rounds leave more trail, so more ants follow."],
    [6.5, 9.1, "More ants, more trail: it snowballs."],
    [9.6, 12.2, "The colony settles on one short round."],
  ],
  build(stage, V) {
    const L8 = V.l8;
    const { ramp, flash, lerp, ease: E } = V;

    // ---- the data: the lesson's colony (computed and asserted in l8/common-2.js), asserted again here
    const T = L8.TEN;
    const H = L8.SNOW.hist;
    const ids = [...T.names];
    const NR = H.length;
    const nameOf = (tour) => tour.map((c) => ids[c]).join("");
    L8.same(NR, 14, "scene 8: rounds in the time-lapse");
    L8.same(ids.join(""), "ABCDEFGHIJ", "scene 8: the ten villages");
    L8.same(H[0].onBest, 1, "scene 8: ants on the best round, round 1");
    L8.same(H[9].onBest, 10, "scene 8: ants on the best round, round 10");
    L8.same(H[0].best.toFixed(2), "132.98", "scene 8: round 1 best (km)");
    L8.same(nameOf(H[0].bestTour), "CJHBAIGFED", "scene 8: round 1 best round");
    L8.same(H[1].best.toFixed(2), "115.13", "scene 8: round 2 best (km)");
    L8.same(nameOf(H[1].bestTour), "JIGFEDCBAH", "scene 8: round 2 best round");
    L8.same(
      H.slice(1).every((h) => nameOf(h.bestTour) === "JIGFEDCBAH" && h.best === H[1].best),
      true,
      "scene 8: the colony keeps round 2's best to the end",
    );
    L8.same(
      [0, 3, 6, 9, 13].map((r) => L8.pct(H[r].share)),
      [40, 75, 86, 96, 100],
      "scene 8: share of trail on the best round (%) at rounds 1, 4, 7, 10, 14",
    );
    L8.same(
      H.every((h, r) => r === 0 || h.share >= H[r - 1].share),
      true,
      "scene 8: the share only climbs",
    );
    L8.same(
      H.every((h) => h.onBest >= 0 && h.onBest <= 10),
      true,
      "scene 8: at most ten ants on the best round",
    );
    {
      // the thick ring in the last frame is the best round: its ten roads carry more trail than any other road
      const last = H[NR - 1];
      const loop = last.bestTour.map((c, k) => [c, last.bestTour[(k + 1) % 10]]);
      const onLoop = (a, b) => loop.some(([p, q]) => (p === a && q === b) || (p === b && q === a));
      let weakestLoop = Infinity;
      let strongestOther = 0;
      for (let a = 0; a < 10; a++)
        for (let b = a + 1; b < 10; b++) {
          const v = last.tau[a][b];
          if (onLoop(a, b)) weakestLoop = Math.min(weakestLoop, v);
          else strongestOther = Math.max(strongestOther, v);
        }
      L8.same(weakestLoop > strongestOther * 10, true, "scene 8: the best round carries the thick trail at the end");
    }
    L8.same(L8.tenTau(0, 0, 1), 1, "scene 8: the trails start equal (1 on every road)");

    // ---- timeline (local seconds): the time-lapse runs X0 -> X1 over NR rounds, linear in time
    const X0 = 3.1;
    const X1 = 10.8;
    const xOf = (t) => NR * ramp(t, X0, X1, E.lin); // the fractional round
    const roundOf = (t) => Math.floor(xOf(t) + 0.5); // the round shown in the text (0 = start)
    const tb = (r) => X0 + ((r - 0.5) / NR) * (X1 - X0); // when round r's numbers appear
    const onAt = (r) => (r < 1 ? 0 : H[r - 1].onBest);
    const shareAt = (r) => (r < 1 ? 0 : H[r - 1].share);

    // ---- the map: the ten villages, no grey roads, every road is a blue trail whose thickness follows its pheromone
    const pos = L8.fit(Object.fromEntries(ids.map((id, i) => [id, T.xy[i]])), { x: 60, y: 8, w: 816, h: 448 }, 34);
    const edges = ids.flatMap((a, i) => ids.slice(i + 1).map((b) => [a, b]));
    const net = L8.net(stage, { nodes: pos, edges, r: 26, fs: 30, maxPaths: 20 });
    const tauAt = (x, a, b) => {
      const f = Math.floor(x);
      return lerp(L8.tenTau(f, a, b), L8.tenTau(Math.min(f + 1, NR), a, b), x - f);
    };
    const loopPaths = (tour, o) =>
      tour.map((c, k) => ({ a: ids[c], b: ids[tour[(k + 1) % 10]], k: 1, tone: "green", w: 8, dash: true, o }));

    // ---- under the map: round and best tags, the share sticker, the ten ant dots and their label
    const roundTag = L8.tag(stage, { x: 18, y: 477, text: "start", tone: "grey" });
    const bestTag = L8.tag(stage, { x: 196, y: 477, text: `best ${H[0].best.toFixed(1)} km`, tone: "green" });
    const share = L8.stat(stage, { x: 468, y: 470, w: 456, h: 72, label: "trail on best round", tone: "blue" });
    const dots = Array.from({ length: 10 }, () => L8.token(stage, { tone: "grey", size: 40 }));
    const dotsTag = L8.tag(stage, { x: 564, y: 563, text: "ants on the best round", tone: "grey" });

    return (t) => {
      const x = xOf(t);
      const r = roundOf(t);

      // ---- trails: this frame's values set the thickness scale (the lesson's map does the same)
      const val = {};
      let [mn, mx] = [Infinity, 0];
      for (let a = 0; a < 10; a++)
        for (let b = a + 1; b < 10; b++) {
          const v = tauAt(x, a, b);
          val[L8.ek(ids[a], ids[b])] = v;
          mn = Math.min(mn, v);
          mx = Math.max(mx, v);
        }

      // ---- the best round so far: round 1's best, crossfading into the shorter one round 2 finds
      const o1 = ramp(t, tb(1), tb(1) + 0.25, E.lin) * (1 - ramp(t, tb(2), tb(2) + 0.2, E.lin));
      const o2 = ramp(t, tb(2), tb(2) + 0.2, E.lin);
      const paths = [...loopPaths(H[0].bestTour, o1), ...loopPaths(H[1].bestTour, o2)].filter((p) => p.o > 0.001);

      net.update({
        roads: 0,
        tau: (a, b) => val[L8.ek(a, b)],
        tauNorm: { min: mn, max: mx, w0: 2, w1: 16, o0: 0.18, o1: 0.7 },
        tauK: ramp(t, 0.65, 1.35, E.lin),
        paths,
        nodes: Object.fromEntries(ids.map((id, i) => [id, { k: L8.seq(t, 0.2, 0.055, 0.3, i) }])),
      });

      // ---- tags: the round counts, the best tag appears with round 1 and shows the shorter round at round 2
      roundTag.set({
        text: r < 1 ? "start" : `round ${r}`,
        k: ramp(t, 1.4, 1.8, E.lin),
        s: 1 + 0.08 * (r < 1 ? 0 : flash(t, tb(r), tb(r) + 0.25)),
      });
      const shown = r < 1 ? H[0] : H[r - 1];
      bestTag.set({
        text: `best ${shown.best.toFixed(1)} km`,
        k: ramp(t, tb(1), tb(1) + 0.3, E.lin),
        s: 1 + 0.12 * flash(t, tb(2), tb(2) + 0.35),
      });

      // ---- the share of trail on the best round, and the ants that walked it
      share.set({
        text: `${L8.pct(shareAt(r))}%`,
        k: ramp(t, 1.6, 2.0, E.lin),
        bump: flash(t, X1, X1 + 0.4),
        solid: t >= X1,
      });
      dotsTag.set({ k: ramp(t, 1.7, 2.1, E.lin) });
      dots.forEach((d, i) => {
        const k = L8.seq(t, 1.7, 0.04, 0.35, i);
        const on = i < onAt(r);
        const flipped = r >= 1 && on !== i < onAt(r - 1);
        d.set({
          x: 40 + 52 * i,
          y: 592,
          tone: on ? "orange" : "grey",
          s: (0.6 + 0.4 * E.pop(k)) * (1 + (flipped ? 0.3 * flash(t, tb(r), tb(r) + 0.3) : 0)),
          o: Math.min(1, k * 4),
        });
      });
    };
  },
});

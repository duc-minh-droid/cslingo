/* Lecture 8 video, scene 2: the loop. One iteration of the Ant System is three steps (place the ants on random towns, every ant
   builds a whole tour, update the trails) and then the loop repeats: the ants start afresh, the trails stay. Run for real on
   the five villages P Q R S T (L8.LOOP: three ants, iteration 1 from equal trails, iteration 2 from the updated trails).
   Word use in the whole video: 'iteration' = one pass of the loop, 'tour' = one ant's walk round the villages.
   Story (local seconds): 0.55-1.4 roads (after their towns), towns and equal blue trails appear (a thin and a thick sample
   road define the blue 'trail (pheromone)'), 1.0-1.6 the three step cards, STEP 1 1.35 the die tumbles and the ants pop onto
   P S Q, STEP 2 3.6 the ants walk their tours (3.8-6.3, five hops of 0.5 s; two ants on one town stand side by side), STEP 3
   6.6 the orange tours are undrawn (never blended with the blue trails), 6.9 '3 ants' / '0 ants' tags on the busiest and the
   unused road, 7.0-8.4 the trails swell or thin; REPEAT 9.6 the loop arrow draws on, 10.2 'iteration 2', 10.4 the ants pop
   onto T P S (no tours: they forget), 10.8 the legend reads 'trail = memory'. */
VID.scene({
  kicker: "THE LOOP",
  title: ["Ants build tours,", "then the trails learn"],
  dur: 13.2,
  caps: [
    [1.4, 3.5, "Step 1: put the ants on random towns."],
    [3.8, 6.2, "Step 2: every ant builds a whole tour."],
    [6.9, 9.3, "Step 3: roads the ants used get thicker."],
    [10.4, 13.0, "Repeat until done. Ants forget; trails remember."],
  ],
  build(stage, V) {
    const L8 = V.l8;
    const L5 = V.l5;
    const { ramp, flash, clamp, lerp, ease: E } = V;

    // ---- the data: the real run (computed and asserted in l8/common.js), asserted again here
    const F = L8.FIVE;
    const R = L8.LOOP.iters;
    L8.same(R[0].starts, "PSQ", "scene 2: iteration 1 starts");
    L8.same(
      R[0].ants.map((a) => a.tour),
      ["PQRST", "SRPTQ", "QTPSR"],
      "scene 2: iteration 1 tours",
    );
    L8.same(R[1].starts, "TPS", "scene 2: iteration 2 starts");
    L8.same(+R[0].after["R-S"].toFixed(2), 4.05, "scene 2: trail on R-S after iteration 1");
    L8.same(+R[0].after["R-T"].toFixed(2), 0.5, "scene 2: trail on R-T after iteration 1");
    const tours = R[0].ants.map((a) => a.tour);
    const N = F.ids.length;
    // how many of the three ants walked each road in iteration 1 (either way): 3 on P-T and R-S, 0 on R-T
    const used = Object.fromEntries(F.edges.map(([a, b]) => [L8.ek(a, b), 0]));
    tours.forEach((tour) => [...tour].forEach((a, j) => used[L8.ek(a, tour[(j + 1) % tour.length])]++));
    L8.same([used["P-T"], used["R-S"], used["R-T"]], [3, 3, 0], "scene 2: ants on the busiest and the unused road");
    L8.same(Math.max(...Object.values(used)), 3, "scene 2: three ants is the most any road gets");
    const tauAt = (a, b, mix) => {
      const key = L8.ek(a, b);
      return R[0].before[key] * (1 - mix) + R[0].after[key] * mix;
    };

    // ---- timeline (local seconds)
    const T = {
      roads: [0.55, 1.15], // after their towns have popped (the last one is up at 0.9)
      trails: [0.95, 1.4],
      cards: 1.0, // the three step cards pop 0.15 s apart
      round: 1.2,
      step1: 1.35,
      ants1: 1.5, // the ants pop 0.15 s apart
      step2: 3.6,
      walk: 3.8,
      hop: 0.5,
      step3: 6.6,
      erase: [6.6, 7.2], // the orange tours are undrawn, so orange and blue are never mixed
      antsOut: [6.7, 7.0], // the ants shrink away
      count: [6.9, 7.3], // the '3 ants' / '0 ants' tags pop ...
      countOut: [9.3, 9.6], // ... and go
      swell: [7.0, 8.4],
      loop: [9.6, 10.2],
      round2: 10.2,
      ants2: 10.4,
      roll: [1.4, 2.0], // the die tumbles while the ants pick their towns
      memory: 10.8,
    };
    const walkEnd = T.walk + N * T.hop;
    const stepAt = (t) => (t < T.step1 ? -1 : t < T.step2 ? 0 : t < T.step3 ? 1 : t < T.round2 ? 2 : 0);
    const stepOn = [T.step1, T.step2, T.step3];

    // ---- the map: ten grey roads, five towns, blue trails, orange tour overlays
    const pos = L8.fit(Object.fromEntries(F.ids.map((id) => [id, F.xy[id]])), { x: 10, y: 70, w: 560, h: 380 }, 44);
    const net = L8.net(stage, { nodes: pos, edges: F.edges, r: 30, fs: 36, maxPaths: 16, labels: true });
    const svg = L5.svg(stage);
    const ants = [0, 1, 2].map(() => svg.appendChild(L8.ant(0, 0, 64)));

    // legend: a thin and a thick blue sample road say what the blue lines are (thicker = stronger trail)
    const sample = [
      [22, 58, 6],
      [76, 112, 18],
    ].map(([x1, x2, w]) =>
      svg.appendChild(
        V.s("line", {
          x1,
          y1: 530,
          x2,
          y2: 530,
          "stroke-width": w,
          "stroke-linecap": "round",
          style: { stroke: "var(--blue)" },
        }),
      ),
    );
    const legend = L8.tag(stage, { x: 134, y: 508, text: "trail (pheromone)", tone: "blue" });
    // the last beat: the trails are the colony's memory
    const memEq = svg.appendChild(L8.mark("equals", 446, 530, 40, "grey"));
    const memory = L8.tag(stage, { x: 478, y: 508, text: "memory", tone: "blue" });
    const roundTag = L8.tag(stage, { x: 20, y: 20, text: "iteration 1", tone: "grey" });

    // ---- the three step cards on the right, each with a number disc and a label
    const NAMES = ["place ants", "build tours", "update trails"];
    const cards = NAMES.map((_, i) =>
      L8.card(stage, { x: 596, y: 90 + 140 * i, w: 290, h: 96, text: "", tone: "grey", plain: true }),
    );
    const discs = NAMES.map((_, i) =>
      L8.disc(stage, { x: 636, y: 90 + 140 * i + 48, size: 52, text: String(i + 1), tone: "orange" }),
    );
    const labels = NAMES.map((name, i) =>
      L8.label(stage, { x: 674, y: 90 + 140 * i + 29, w: 206, text: name, align: "left", fs: 30 }),
    );
    // a die on card 1 (the towns are chosen at random) and the loop arrow, on a layer above the cards
    const top = L5.svg(stage);
    const dice = [1, 2, 3, 4, 5, 6].map((face) => top.appendChild(L5.dice(852, 138, 44, { face, tone: "orange" })));
    const loop = top.appendChild(L5.arrow(888, 418, 888, 138, "grey", 1, { w: 6, head: 20, bow: -24 }));

    // ---- where an ant is: standing on a town, or walking a road (blended over 0.2 s at both ends of a hop)
    const rest = (town) => net.rest(town);
    // after m hops ant i stands on tours[i][m % N]; an ant that shares its town with a lower-numbered ant stands beside it
    const spot = (i, m) => {
      const town = tours[i][m % N];
      const p = rest(town);
      const mates = tours.slice(0, i).filter((tour) => tour[m % N] === town).length;
      return { ...p, x: p.x + 30 * mates };
    };
    function walking(i, t) {
      const j = Math.min(N - 1, Math.floor((t - T.walk) / T.hop));
      const a = tours[i][j];
      const b = tours[i][(j + 1) % N];
      const local = t - (T.walk + j * T.hop);
      const w = net.walk(a, b, E.inOut(local / T.hop));
      const m = E.inOut(Math.min(ramp(local, 0, 0.2, E.lin), ramp(T.hop - local, 0, 0.2, E.lin)));
      const home = spot(i, local < T.hop / 2 ? j : j + 1);
      return { x: lerp(home.x, w.x, m), y: lerp(home.y, w.y, m), r: w.r * m };
    }
    function antState(i, t) {
      if (t >= T.ants2) {
        const k = ramp(t, T.ants2 + 0.15 * i, T.ants2 + 0.15 * i + 0.5, E.lin);
        return { ...rest(R[1].starts[i]), s: 0.5 + 0.5 * E.pop(k), o: clamp(k * 3) };
      }
      const k = ramp(t, T.ants1 + 0.15 * i, T.ants1 + 0.15 * i + 0.5, E.lin);
      const p = t >= T.walk && t < walkEnd ? walking(i, t) : { ...rest(R[0].starts[i]), r: 0 };
      const gone = ramp(t, T.antsOut[0], T.antsOut[1], E.in);
      return { ...p, s: (0.5 + 0.5 * E.pop(k)) * (1 - gone), o: clamp(k * 3) * (gone < 0.98 ? 1 : 0) };
    }

    return (t) => {
      // ---- map: roads, towns, trails (before -> after iteration 1), the orange tours
      const mix = ramp(t, T.swell[0], T.swell[1], E.inOut);
      const erase = ramp(t, T.erase[0], T.erase[1], E.inOut); // the tours are undrawn, not faded
      const paths = tours.flatMap((tour) =>
        [...tour].map((a, j) => ({
          a,
          b: tour[(j + 1) % N],
          k: ramp(t, T.walk + T.hop * j, T.walk + T.hop * (j + 1), E.inOut) * (1 - erase),
          tone: "orange",
          w: 6,
        })),
      );
      // how many ants used a road: shown on the busiest roads and the unused one while the trails change
      const countK = ramp(t, T.count[0], T.count[1], E.lin) * (1 - ramp(t, T.countOut[0], T.countOut[1], E.lin));
      const roadTags = {
        "P-T": { text: `${used["P-T"]} ants`, tone: "blue", k: countK },
        "R-S": { text: `${used["R-S"]} ants`, tone: "blue", k: countK },
        "R-T": { text: `${used["R-T"]} ants`, tone: "red", k: countK },
      };
      net.update({
        roads: ramp(t, T.roads[0], T.roads[1], E.lin),
        nodes: Object.fromEntries(F.ids.map((id, i) => [id, { k: L8.seq(t, 0.2, 0.08, 0.4, i) }])),
        tau: (a, b) => tauAt(a, b, mix),
        tauW: [2, 4],
        tauK: ramp(t, T.trails[0], T.trails[1], E.lin),
        paths,
        labels: countK > 0.001 ? roadTags : {},
      });
      ants.forEach((g, i) => V.place(g, antState(i, t)));

      // ---- legend and iteration tag
      const legK = ramp(t, 0.9, 1.3, E.lin);
      sample.forEach((g) => V.place(g, { o: legK }));
      legend.set({ k: legK });
      const memK = ramp(t, T.memory, T.memory + 0.4, E.lin);
      V.place(memEq, { o: memK });
      memory.set({ k: memK, s: 1 + 0.12 * flash(t, T.memory + 0.3, T.memory + 0.7) });
      roundTag.set({
        text: t >= T.round2 ? "iteration 2" : "iteration 1",
        k: ramp(t, T.round, T.round + 0.4, E.lin),
        s: 1 + 0.06 * flash(t, T.round2, T.round2 + 0.4),
      });

      // ---- step cards: the active one is orange and pulses as it takes over
      const active = stepAt(t);
      cards.forEach((card, i) => {
        const k = L8.seq(t, T.cards, 0.15, 0.4, i);
        const on = active === i;
        const turned = t >= T.round2 && i === 0 ? T.round2 : stepOn[i];
        const bump = 1 + 0.06 * flash(t, turned, turned + 0.4) * (on ? 1 : 0);
        card.set({ tone: on ? "orange" : "grey", plain: !on, k, s: bump });
        discs[i].set({ tone: on ? "orange" : "grey", k, s: bump });
        labels[i].set({ tone: on ? "orange" : "grey", bold: on, k });
      });
      // the die tumbles through its faces while the ants pick their towns, then settles on 5
      const dieK = L8.seq(t, T.cards, 0.15, 0.4, 0);
      const rolling = t >= T.roll[0] && t < T.roll[1];
      const face = rolling ? 1 + (Math.floor((t - T.roll[0]) * 10) % 6) : t < T.roll[0] ? 3 : 5;
      dice.forEach((d, i) =>
        V.place(d, {
          o: i + 1 === face ? dieK : 0,
          r: rolling ? 16 * Math.sin(26 * t) : 0,
          s: rolling ? 1.08 : 1,
        }),
      );

      // ---- the loop arrow draws on from card 3 up to card 1
      L5.drawOn(loop, ramp(t, T.loop[0], T.loop[1], E.inOut));
    };
  },
});

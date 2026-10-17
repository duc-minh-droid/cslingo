/* Lecture 8 video, scene 2: the loop. One round of the Ant System is three steps (place the ants on random towns, every ant
   builds a whole tour, update the trails) and then the loop repeats: the ants start afresh, the trails stay. Run for real on
   the five villages P Q R S T (L8.LOOP: three ants, round 1 from equal trails, round 2 from the updated trails).
   Story (local seconds): 0.2-1.3 roads, towns and equal blue trails appear, 1.0-1.6 the three step cards, STEP 1 1.35 the ants
   pop onto P S Q, STEP 2 3.6 the ants walk their tours (3.8-6.3, five hops of 0.5 s), STEP 3 6.6 the paths fade and the
   trails swell or thin (6.8-8.0), REPEAT 8.4 the loop arrow draws on, 9.0 'round 2', 9.2 the ants pop onto T P S. */
VID.scene({
  kicker: "THE LOOP",
  title: ["Ants build tours,", "then the trails learn"],
  dur: 11,
  caps: [
    [1.4, 3.5, "Step 1: put the ants on random towns."],
    [3.8, 6.2, "Step 2: every ant builds a whole tour."],
    [6.6, 8.4, "Step 3: update the trails."],
    [8.9, 10.9, "Repeat. The trails are the memory."],
  ],
  build(stage, V) {
    const L8 = V.l8;
    const L5 = V.l5;
    const { ramp, flash, clamp, lerp, ease: E } = V;

    // ---- the data: the real run (computed and asserted in l8/common.js), asserted again here
    const F = L8.FIVE;
    const R = L8.LOOP.iters;
    L8.same(R[0].starts, "PSQ", "scene 2: round 1 starts");
    L8.same(
      R[0].ants.map((a) => a.tour),
      ["PQRST", "SRPTQ", "QTPSR"],
      "scene 2: round 1 tours",
    );
    L8.same(R[1].starts, "TPS", "scene 2: round 2 starts");
    L8.same(+R[0].after["R-S"].toFixed(2), 4.05, "scene 2: trail on R-S after round 1");
    L8.same(+R[0].after["R-T"].toFixed(2), 0.5, "scene 2: trail on R-T after round 1");
    const tours = R[0].ants.map((a) => a.tour);
    const N = F.ids.length;
    const tauAt = (a, b, mix) => {
      const key = L8.ek(a, b);
      return R[0].before[key] * (1 - mix) + R[0].after[key] * mix;
    };

    // ---- timeline (local seconds)
    const T = {
      roads: [0.2, 1.0],
      trails: [0.8, 1.3],
      cards: 1.0, // the three step cards pop 0.15 s apart
      round: 1.2,
      step1: 1.35,
      ants1: 1.5, // the ants pop 0.15 s apart
      step2: 3.6,
      walk: 3.8,
      hop: 0.5,
      step3: 6.6,
      fade: [6.7, 7.3],
      swell: [6.8, 8.0],
      loop: [8.4, 9.0],
      round2: 9.0,
      ants2: 9.2,
    };
    const walkEnd = T.walk + N * T.hop;
    const stepAt = (t) => (t < T.step1 ? -1 : t < T.step2 ? 0 : t < T.step3 ? 1 : t < T.round2 ? 2 : 0);
    const stepOn = [T.step1, T.step2, T.step3];

    // ---- the map: ten grey roads, five towns, blue trails, orange tour overlays
    const pos = L8.fit(Object.fromEntries(F.ids.map((id) => [id, F.xy[id]])), { x: 10, y: 70, w: 560, h: 380 }, 44);
    const net = L8.net(stage, { nodes: pos, edges: F.edges, r: 30, fs: 36, maxPaths: 16 });
    const svg = L5.svg(stage);
    const ants = [0, 1, 2].map(() => svg.appendChild(L8.ant(0, 0, 64)));

    // legend: a blue sample road says what the blue lines are
    const sample = svg.appendChild(
      V.s("line", {
        x1: 24,
        y1: 530,
        x2: 84,
        y2: 530,
        "stroke-width": 14,
        "stroke-linecap": "round",
        style: { stroke: "var(--blue)" },
      }),
    );
    const legend = L8.tag(stage, { x: 104, y: 508, text: "trail", tone: "blue" });
    const roundTag = L8.tag(stage, { x: 10, y: 6, text: "round 1", tone: "grey" });

    // ---- the three step cards on the right, each with a number disc and a label
    const NAMES = ["place ants", "build tours", "update trails"];
    const cards = NAMES.map((_, i) =>
      L8.card(stage, { x: 596, y: 90 + 140 * i, w: 290, h: 96, text: "", tone: "grey", plain: true }),
    );
    const discs = NAMES.map((_, i) =>
      L8.disc(stage, { x: 636, y: 90 + 140 * i + 48, size: 52, text: String(i + 1), tone: "orange" }),
    );
    const labels = NAMES.map((name, i) =>
      L8.label(stage, { x: 680, y: 90 + 140 * i + 28, w: 200, text: name, align: "left", fs: 32 }),
    );
    // a die on card 1: the towns are chosen at random
    const die = svg.appendChild(L5.dice(852, 138, 44, { face: 5, tone: "orange" }));
    const loop = svg.appendChild(L5.arrow(888, 418, 888, 138, "grey", 1, { w: 6, head: 20, bow: -24 }));

    // ---- where an ant is: standing on a town, or walking a road (blended over 0.2 s at both ends of a hop)
    const rest = (town) => net.rest(town);
    function walking(i, t) {
      const j = Math.min(N - 1, Math.floor((t - T.walk) / T.hop));
      const a = tours[i][j];
      const b = tours[i][(j + 1) % N];
      const local = t - (T.walk + j * T.hop);
      const w = net.walk(a, b, E.inOut(local / T.hop));
      const m = E.inOut(Math.min(ramp(local, 0, 0.2, E.lin), ramp(T.hop - local, 0, 0.2, E.lin)));
      const home = rest(local < T.hop / 2 ? a : b);
      return { x: lerp(home.x, w.x, m), y: lerp(home.y, w.y, m), r: w.r * m };
    }
    function antState(i, t) {
      if (t >= T.ants2) {
        const k = ramp(t, T.ants2 + 0.15 * i, T.ants2 + 0.15 * i + 0.5, E.lin);
        return { ...rest(R[1].starts[i]), s: 0.5 + 0.5 * E.pop(k), o: clamp(k * 3) };
      }
      const k = ramp(t, T.ants1 + 0.15 * i, T.ants1 + 0.15 * i + 0.5, E.lin);
      const p = t >= T.walk && t < walkEnd ? walking(i, t) : { ...rest(R[0].starts[i]), r: 0 };
      return { ...p, s: 0.5 + 0.5 * E.pop(k), o: clamp(k * 3) * (1 - ramp(t, T.fade[0], T.fade[1], E.lin)) };
    }

    return (t) => {
      // ---- map: roads, towns, trails (before -> after round 1), the orange tours
      const mix = ramp(t, T.swell[0], T.swell[1], E.inOut);
      const paths = tours.flatMap((tour) =>
        [...tour].map((a, j) => ({
          a,
          b: tour[(j + 1) % N],
          k: ramp(t, T.walk + T.hop * j, T.walk + T.hop * (j + 1), E.inOut),
          tone: "orange",
          w: 6,
          o: 1 - ramp(t, T.fade[0], T.fade[1], E.lin),
        })),
      );
      net.update({
        roads: ramp(t, T.roads[0], T.roads[1], E.lin),
        nodes: Object.fromEntries(F.ids.map((id, i) => [id, { k: L8.seq(t, 0.2, 0.08, 0.4, i) }])),
        tau: (a, b) => tauAt(a, b, mix),
        tauW: [2, 4],
        tauK: ramp(t, T.trails[0], T.trails[1], E.lin),
        paths,
      });
      ants.forEach((g, i) => V.place(g, antState(i, t)));

      // ---- legend and round tag
      const legK = ramp(t, 0.9, 1.3, E.lin);
      V.place(sample, { o: legK });
      legend.set({ k: legK });
      roundTag.set({
        text: t >= T.round2 ? "round 2" : "round 1",
        k: ramp(t, T.round, T.round + 0.4, E.lin),
        s: 1 + 0.18 * flash(t, T.round2, T.round2 + 0.4),
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
      V.place(die, { o: L8.seq(t, T.cards, 0.15, 0.4, 0), r: 14 * flash(t, T.ants1, T.ants1 + 0.7) });

      // ---- the loop arrow draws on from card 3 up to card 1
      L5.drawOn(loop, ramp(t, T.loop[0], T.loop[1], E.inOut));
    };
  },
});

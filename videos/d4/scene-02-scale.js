/* Lecture 4 (ds-4) · scene 2 (WHY DISTRIBUTE): the same load on one big machine (scale up) or on three small ones with the same
   total capacity (scale out); when a machine crashes the big one takes the whole service down and the small ones carry on with
   what is left (lesson 4.1). Six discs are the load (one disc = 100 requests a second, 600 in all). Row A: one machine of 600.
   Row B: three machines of 200. Every number comes from D4.SCALE (asserted on load) and the captions are built from it.
   Colours: grey = the neutral client, machines and the load before it lands, green = a request that is served, red = a crash and
   the requests that crashed with it. Story (local seconds): 0.2-1.0 headings, machines and clients pop in (row A, then row B);
   1.2-3.0 the discs fly in one after another and turn green on arrival, the "served" tags count up; 3.8 a bolt hits the big
   machine, it goes down, its six discs turn red and "served" drops to 0, "outage" pops; 6.6 a bolt hits machine 1 only, its two
   discs turn red, the other four stay green, "served" drops to 400 and "keeps going" pops. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const { ramp, flash, clamp, ease: E } = V;
  const S = D4.SCALE;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const UP = S.slots(S.up);
  const OUT = S.slots(S.out);
  D4.same(
    "scale scene: six discs of 100 req/s, 600 before and after the two crashes",
    [S.load, S.unit, S.discs, S.up.before, S.up.after, S.out.before, S.out.after],
    [600, 100, 6, 600, 0, 600, 400],
  );
  D4.same(
    "scale scene: what a crash takes with it is every disc of the dead machine and no other",
    [UP.filter((d) => d.lost).length * S.unit, OUT.filter((d) => d.lost).length * S.unit],
    [S.up.away, S.out.away],
  );
  D4.same(
    "scale scene: served after the crash is the discs that did not crash",
    [UP.filter((d) => !d.lost).length * S.unit, OUT.filter((d) => !d.lost).length * S.unit],
    [S.up.after, S.out.after],
  );

  // ---------- the timeline (local seconds) ----------
  const T = {
    pop: 0.2,
    popRow: 0.25, // row B pops this much after row A
    fly: 1.2,
    flyStep: 0.2,
    flyDur: 0.5,
    boltA: 3.8,
    downA: 3.9,
    redA: 4.3,
    servedA: 4.5,
    outage: 5.0,
    boltB: 6.6,
    downB: 6.8,
    redB: 7.1,
    servedB: 7.4,
    keeps: 7.9,
  };
  const landAt = (j) => T.fly + T.flyStep * j + T.flyDur; // disc j lands

  V.scene({
    kicker: "WHY DISTRIBUTE",
    title: ["One machine hits a ceiling,", "and can die"],
    dur: 12,
    caps: [
      [0.7, 3.6, `${S.load} requests a second, on one machine or three.`],
      [4.0, 6.6, "The big machine crashes: nothing is served."],
      [7.0, 9.6, `A small one crashes: ${S.out.after} are still served.`],
      [9.8, 11.8, "Scaling out survives failures."],
    ],
    build(stage) {
      // ---- row A: scale up (one big machine) ----
      const headA = D4.tag(stage, { x: 190, y: 30, anchor: "l", text: "Scale up: one big machine" });
      const bigNode = D4.node(stage, { x: 190, y: 62, w: 538, h: 190, name: "One big machine", icon: "server" });
      const slotsA = D4.chips(stage, { x: 190 + 29, y: 62 + 136, n: 6, w: 70, h: 52, gap: 12, fs: 0, tone: "grey" });

      // ---- row B: scale out (three small machines) ----
      const headB = D4.tag(stage, { x: 190, y: 322, anchor: "l", text: "Scale out: three small machines" });
      const NODE_X = [190, 372, 554];
      const smallNodes = NODE_X.map((x, m) =>
        D4.node(stage, { x, y: 354, w: 170, h: 190, name: `Machine ${m + 1}`, icon: "server" }),
      );
      const slotsB = NODE_X.map((x) =>
        D4.chips(stage, { x: x + 18, y: 354 + 136, n: 2, w: 62, h: 52, gap: 10, fs: 0, tone: "grey" }),
      );

      // ---- the clients, their load tags and the result tags ----
      const ROW_Y = [150, 442];
      const svg = D4.svg(stage);
      const persons = ROW_Y.map((y) => svg.appendChild(D4.person(92, y, 74, "grey")));
      const loadTags = ROW_Y.map((y) => D4.tag(stage, { x: 92, y: y + 65, text: `${S.load} req/s` }));
      const served = [128, 420].map((y) => D4.tag(stage, { x: 837, y, text: "served 0" }));
      const verdicts = [
        D4.tag(stage, { x: 837, y: 190, text: "outage", tone: "red", solid: true }),
        D4.tag(stage, { x: 837, y: 482, text: "keeps going", tone: "green", solid: true }),
      ];

      // ---- the load: six discs per row, flying from the client to a slot ----
      const START = [
        { x: 142, y: 150 },
        { x: 142, y: 442 },
      ];
      const target = (row, j) => (row === 0 ? slotsA.mid(UP[j].s) : slotsB[OUT[j].m].mid(OUT[j].s));
      const discs = [0, 1].map((row) =>
        Array.from({ length: S.discs }, () => D4.disc(stage, { ...START[row], size: 44, text: "", tone: "grey" })),
      );

      // ---- the crash bolts, above everything ----
      const top = D4.svg(stage);
      const boltA = top.appendChild(D4.bolt(bigNode.iconAt.x, bigNode.iconAt.y, 90, "red"));
      const boltB = top.appendChild(D4.bolt(smallNodes[0].iconAt.x, smallNodes[0].iconAt.y, 90, "red"));

      const shake = (t, a) => 6 * Math.sin((t - a) * 60) * (1 - clamp((t - a) / 0.3)) * (t >= a ? 1 : 0);

      return (t) => {
        // pop-in of the two rows
        const kA = ramp(t, T.pop, T.pop + 0.5, E.lin);
        const kB = ramp(t, T.pop + T.popRow, T.pop + T.popRow + 0.5, E.lin);
        headA.set({ k: kA });
        headB.set({ k: kB });
        bigNode.set({ k: kA, down: ramp(t, T.downA, T.downA + 0.4, E.lin) });
        slotsA.all(() => ({ ghost: true, o: kA }));
        smallNodes.forEach((n, m) => n.set({ k: kB, down: m === 0 ? ramp(t, T.downB, T.downB + 0.4, E.lin) : 0 }));
        slotsB.forEach((row) => row.all(() => ({ ghost: true, o: kB })));
        V.place(persons[0], { s: 0.6 + 0.4 * E.pop(kA), o: kA });
        V.place(persons[1], { s: 0.6 + 0.4 * E.pop(kB), o: kB });
        loadTags[0].set({ k: kA });
        loadTags[1].set({ k: kB });

        // the discs: fly, land green, then the lost ones turn red and shake
        const landed = (j) => t >= landAt(j);
        const count = [0, 1].map((row) => {
          let n = 0;
          discs[row].forEach((d, j) => {
            const from = START[row];
            const to = target(row, j);
            const f = ramp(t, T.fly + T.flyStep * j, landAt(j), E.out);
            const lost = row === 0 ? UP[j].lost : OUT[j].lost;
            const redAt = row === 0 ? T.redA : T.redB;
            const dead = lost && t >= redAt;
            if (landed(j) && !dead) n += 1;
            const p = D4.at(from, to, f, 20);
            d.set({
              k: ramp(t, T.fly + T.flyStep * j - 0.1, T.fly + T.flyStep * j + 0.15, E.lin),
              x: p.x - from.x + (lost && t >= redAt ? shake(t, redAt) : 0),
              y: p.y - from.y,
              tone: dead ? "red" : landed(j) ? "green" : "grey",
              s: 1 + 0.15 * flash(t, landAt(j), landAt(j) + 0.25),
            });
          });
          return n;
        });

        // the served tags count the discs that are green (a drop is one step a disc, smoothed by the red flash)
        const servedNow = count.map((n) => n * S.unit);
        served[0].set({
          text: `served ${servedNow[0]}`,
          tone: t >= T.redA ? "red" : servedNow[0] ? "green" : "grey",
          k: kA,
        });
        served[1].set({ text: `served ${servedNow[1]}`, tone: servedNow[1] ? "green" : "grey", k: kB });
        verdicts[0].set({ k: ramp(t, T.outage, T.outage + 0.4, E.lin) });
        verdicts[1].set({ k: ramp(t, T.keeps, T.keeps + 0.4, E.lin) });

        // the bolts: pop on the machine that crashes, then fade
        const bA = ramp(t, T.boltA, T.boltA + 0.25, E.lin);
        V.place(boltA, { s: 0.5 + 0.5 * E.pop(bA), o: bA * (1 - ramp(t, T.boltA + 0.6, T.boltA + 0.9, E.lin)) });
        const bB = ramp(t, T.boltB, T.boltB + 0.25, E.lin);
        V.place(boltB, { s: 0.5 + 0.5 * E.pop(bB), o: bB * (1 - ramp(t, T.boltB + 0.6, T.boltB + 0.9, E.lin)) });
      };
    },
  });
})();

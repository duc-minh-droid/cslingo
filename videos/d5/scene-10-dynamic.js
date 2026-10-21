/* Lecture 5 (ds-5) · scene 10 (DYNAMIC PARTITIONS): partitions have a size limit (10 GB). When data grows and a partition goes over the
   limit it splits in two (and one half can move to another node); when data shrinks, small neighbouring partitions merge
   (lesson 5.5). Three nodes, partitions P1 6 GB, P2 8 GB, P3 4 GB; everything grows by 4 GB, P2 reaches 12 GB and splits into two 6 GB
   halves; later everything halves and the two 3 GB neighbours fuse into one 6 GB partition. Every size comes from D5.DYN (asserted
   on load). Colours: blue = a partition (a tank of data), purple = the size limit (the rule), red = over the limit, grey = names.
   Story (local seconds): 0.2 the nodes, the limit line and the tanks (6, 8, 4 GB) pop; 3.0 all tanks grow by 4 GB, P2 crosses the
   line and turns red; 5.8 P2 splits into two 6 GB halves; 6.6 the new half slides to node 3 beside the old P3; 8.2 all tanks halve and
   the two 3 GB neighbours slide together and fuse into one 6 GB partition. Hold to the end. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const { ramp, flash, lerp, ease: E } = V;
  const Y = D5.DYN;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  D5.same(
    "dynamic scene: sizes before and after growing, splitting, shrinking and merging, and the limit",
    [Y.limit, Y.start, Y.grown, Y.split, Y.splitAt, Y.shrunk, Y.merged, Y.mergeAt],
    [10, [6, 8, 4], [10, 12, 8], [10, 6, 6, 8], 1, [5, 3, 3, 4], [5, 6, 4], 1],
  );
  D5.same(
    "dynamic scene: only the middle partition goes over the limit, and its two halves are small again",
    [
      Y.grown.filter((g) => g > Y.limit).length,
      Y.grown[Y.splitAt] > Y.limit,
      Y.split[Y.splitAt] + Y.split[Y.splitAt + 1] === Y.grown[Y.splitAt],
    ],
    [1, true, true],
  );
  D5.same(
    "dynamic scene: the two neighbours that merge are below the merge size and fuse into the sum",
    [Y.shrunk[Y.mergeAt] + Y.shrunk[Y.mergeAt + 1], Y.merged[Y.mergeAt], Y.shrunk[Y.mergeAt] < Y.mergeBelow],
    [6, 6, true],
  );
  const T = {
    pop: 0.2,
    grow: [3.0, 4.2],
    split: [5.8, 6.6],
    slide: [6.6, 7.8],
    shrink: [8.2, 8.9],
    merge: [8.9, 9.8],
  };
  const BASE = 456;
  const CX = [156, 468, 780];
  const SCALE = 15;
  const LIMIT_Y = BASE - Y.limit * SCALE;

  V.scene({
    kicker: "DYNAMIC PARTITIONS",
    title: ["Big partitions split,", "small ones merge"],
    dur: 10.5,
    caps: [
      [0.4, 2.8, `Each partition has a size limit: ${Y.limit} GB.`],
      [3.0, 5.6, `Data grows: P2 hits ${Y.grown[Y.splitAt]} GB, over the limit.`],
      [5.8, 8.1, "It splits; one half can move node."],
      [8.2, 10.4, "Data shrinks: neighbours merge."],
    ],
    build(stage) {
      const cl = D5.cluster(stage, {
        x: 12,
        y: 120,
        n: 3,
        w: 288,
        gap: 24,
        cols: 1,
        rows: 1,
        cw: 200,
        ch: 44,
        h: 360,
        slots: false,
      });
      const rule = D5.rule(stage, { x: 12, y: LIMIT_Y, w: 912, text: `limit ${Y.limit} GB` });
      // four tanks: P1, P2 (the big one, then its left half), P3 (its right half, born at the split) and P4 (the old third one)
      const HOME = [CX[0], CX[1], CX[1], CX[2]];
      const tanks = HOME.map((x) => D5.tank(stage, { x, y: BASE, w: 84, scale: SCALE, tone: "blue" }));
      const LABELS = ["P1", "P2", "P3", "P4"]; // the old third partition is P3 until the split makes a new one, then it is renamed P4
      const names = LABELS.map((text, i) =>
        D5.text(stage, { x: HOME[i] - 42, y: 464, w: 84, align: "center", text, tone: "grey" }),
      );
      const over = (gb) => gb > Y.limit + 0.01;

      return (t) => {
        const popK = (i) => ramp(t, T.pop + 0.1 * i, T.pop + 0.1 * i + 0.6, E.lin);
        for (let n = 0; n < 3; n++) cl.set(n, { k: popK(n) });
        rule.set({ k: ramp(t, T.pop + 0.3, T.pop + 0.8, E.lin) });

        const g = E.inOut(ramp(t, T.grow[0], T.grow[1], E.lin)); // every tank grows by 4 GB together
        const sp = E.inOut(ramp(t, T.split[0], T.split[1], E.lin)); // P2 splits in two
        const sl = E.inOut(ramp(t, T.slide[0], T.slide[1], E.lin)); // the new half moves to node 3
        const sh = E.inOut(ramp(t, T.shrink[0], T.shrink[1], E.lin)); // everything halves
        const mg = E.inOut(ramp(t, T.merge[0], T.merge[1], E.lin)); // the two small neighbours fuse
        const grown = [0, 1, 2].map((i) => lerp(Y.start[i], Y.grown[i], g));
        const fill = (i) => (t < T.grow[0] ? Y.start[i] * popK(i) : grown[i]); // the tanks fill from empty as they pop in

        // sizes
        const p1 = t < T.shrink[0] ? fill(0) : lerp(Y.grown[0], Y.shrunk[0], sh);
        let p2 = fill(1);
        if (t >= T.split[0]) p2 = lerp(Y.grown[1], Y.split[1], sp);
        if (t >= T.shrink[0]) p2 = lerp(Y.split[1], Y.shrunk[1], sh);
        if (t >= T.merge[0]) p2 = lerp(Y.shrunk[1], Y.merged[1], mg);
        let p3 = lerp(0, Y.split[2], sp);
        if (t >= T.shrink[0]) p3 = lerp(Y.split[2], Y.shrunk[2], sh);
        const p4 = t < T.shrink[0] ? fill(2) : lerp(Y.grown[2], Y.shrunk[3], sh);
        // places (tank centres): the new half slides into node 3 on the left, the old third tank makes room, then P3 joins P2
        const x3 = lerp(lerp(CX[1], CX[2] - 56, sl), CX[1], mg);
        const x4 = lerp(lerp(CX[2], CX[2] + 56, sl), CX[2], mg);
        const flashSplit = flash(t, T.split[0] + 0.3, T.split[0] + 0.8);

        const show = (i, x, gb, o, extra = 1) => {
          tanks[i].set({
            gb: Math.max(gb, 0.01),
            x: x - HOME[i],
            tone: over(gb) ? "red" : "blue",
            o,
            s: extra,
            text: gb < 3 ? "" : undefined,
          });
          names[i].set({ x: x - HOME[i], k: o, text: i === 3 && t < T.split[0] ? "P3" : LABELS[i] });
        };
        show(0, CX[0], p1, popK(0));
        show(1, CX[1], p2, popK(1), 1 + 0.1 * flashSplit);
        show(
          2,
          x3,
          p3,
          ramp(t, T.split[0], T.split[0] + 0.2, E.lin) * (1 - ramp(t, T.merge[1] - 0.25, T.merge[1], E.lin)),
          1 + 0.1 * flashSplit,
        );
        show(3, x4, p4, popK(2));
      };
    },
  });
})();

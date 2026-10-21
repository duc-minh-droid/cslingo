/* Lecture 5 (ds-5) · scene 2 (WHY PARTITION): replication copies the whole dataset to every node, which fails when the data is too
   big for one node; partitioning gives each node a different subset (a partition), each order in exactly one, and real systems also
   keep a copy (a follower) of each partition on another node (lesson 5.1). Twelve orders, four nodes, room for eight on each node
   (the eight dashed slots). Every count comes from D5.SPLIT and D5.layout (asserted on load). Colours: blue = the orders (the
   data), red = overflow (copies that do not fit), green = fits, purple = the partition tags, orange = nothing here, grey = the
   idle nodes. Story (local seconds): 0.2 the nodes and the twelve orders pop; 2.8 replication: a copy of all twelve flies to
   every node, orders 9 to 12 do not fit (red) and each node gets a red ring and "no room"; 5.0 the copies vanish; 5.4 split:
   each order flies to its own node (three each), the tags P1 to P4 pop and green rings follow; 8.2 a follower copy of every
   partition (dashed) lands on the next node; 10.2 the tags read "6 of 8". Hold to the end. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const { ramp, flash, ease: E } = V;
  const S = D5.SPLIT;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const REP = D5.layout("rep");
  const PART = D5.layout("part");
  const BOTH = D5.layout("both");
  D5.same(
    "split scene: twelve orders on four nodes with room for eight; replication overflows by four, partitioning needs three each, both six",
    [
      S.orders.length,
      S.nodes,
      S.cap,
      S.over,
      REP.map((n) => n.length),
      PART.map((n) => n.length),
      BOTH.map((n) => n.length),
    ],
    [12, 4, 8, 4, [12, 12, 12, 12], [3, 3, 3, 3], [6, 6, 6, 6]],
  );
  D5.same(
    "split scene: one crashed node loses its three orders with partitioning only and nothing when every partition has a follower",
    [D5.lost("part", [1]).length, D5.lost("both", [1]).length],
    [3, 0],
  );
  const NODES = S.nodes;
  const ORDERS = S.orders;
  D5.same(
    "split scene: partition p holds orders 3p+1 to 3p+3 and its follower sits on the next node",
    [PART.map((n) => n.map((o) => o.id)), [0, 1, 2, 3].map(D5.followerNode)],
    [
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10, 11, 12],
      ],
      [1, 2, 3, 0],
    ],
  );

  const T = {
    nodes: 0.2,
    nodeStep: 0.08,
    tray: 0.3,
    trayStep: 0.05,
    rep: 2.8,
    repNode: 0.25,
    repStep: 0.07,
    repDur: 0.9,
    ring: 4.4,
    gone: 5.0,
    split: 5.4,
    splitStep: 0.12,
    splitDur: 0.9,
    tags: 6.8,
    green: 7.4,
    legend: 8.0,
    fol: 8.2,
    folStep: 0.1,
    folDur: 0.8,
    fits: 10.2,
  };

  V.scene({
    kicker: "WHY PARTITION",
    title: ["Copies do not fit,", "so split the data"],
    dur: 12,
    caps: [
      [0.5, 2.7, `${ORDERS.length} orders; room for eight per node.`],
      [2.9, 5.2, "A full copy per node does not fit."],
      [5.4, 8.0, "Split: each order lives in one partition."],
      [8.2, 11.6, "Each partition is also copied to another node."],
    ],
    build(stage) {
      const cl = D5.cluster(stage, {
        x: 12,
        y: 250,
        n: NODES,
        w: 210,
        gap: 24,
        cols: 4,
        rows: 2,
        cw: 44,
        ch: 44,
        cg: 6,
      });
      const trayAt = (i) => ({ x: 160 + 56 * i, y: 96 });
      const trayTag = D5.tag(stage, { x: 383, y: 6, w: 170, text: `${ORDERS.length} orders`, tone: "blue" });

      // the twelve orders in their tray
      const orders = ORDERS.map((id, i) => D5.chip(stage, { text: String(id), tone: "blue", w: 44, h: 44 }));
      // replication: a copy of every order for every node (the last four hang below the card)
      const copies = Array.from({ length: NODES }, () =>
        ORDERS.map((id) => D5.chip(stage, { text: String(id), tone: "blue", w: 44, h: 44 })),
      );
      // followers: a dashed copy of each order, flown from its leader to the next node
      const followers = ORDERS.map((id) =>
        D5.chip(stage, { text: String(id), tone: "blue", w: 44, h: 44, dashed: true }),
      );

      const noRoom = Array.from({ length: NODES }, (_, n) =>
        D5.tag(stage, { x: cl.mid(n).x - 80, y: 478, w: 160, text: "no room", tone: "red" }),
      );
      const fits = Array.from({ length: NODES }, (_, n) =>
        D5.tag(stage, { x: cl.mid(n).x - 70, y: 440, w: 140, text: `${BOTH[n].length} of ${S.cap}`, tone: "green" }),
      );

      // the legend: a solid chip is a leader, a dashed chip a follower
      const legLead = D5.chip(stage, { text: "", tone: "blue", w: 44, h: 44, solid: true });
      const legFol = D5.chip(stage, { text: "", tone: "blue", w: 44, h: 44, dashed: true });
      const legLeadTag = D5.tag(stage, { x: 280, y: 520, text: "leader", tone: "blue" });
      const legFolTag = D5.tag(stage, { x: 550, y: 520, text: "follower", tone: "blue" });

      return (t) => {
        const nodeK = (n) => ramp(t, T.nodes + T.nodeStep * n, T.nodes + T.nodeStep * n + 0.5, E.lin);
        const repGone = ramp(t, T.gone, T.gone + 0.4, E.lin);
        const ringK = ramp(t, T.ring, T.ring + 0.4, E.lin) * (1 - repGone);
        const green = ramp(t, T.green, T.green + 0.4, E.lin);
        const done = ramp(t, T.fits, T.fits + 0.4, E.lin);
        for (let n = 0; n < NODES; n++) {
          cl.set(n, {
            k: nodeK(n),
            tone: done > 0.5 ? "green" : "grey",
            ring: ringK > 0 ? "red" : green > 0 ? "green" : undefined,
            ringK: ringK > 0 ? ringK : green,
            tag: `P${n + 1}`,
            tagTone: "purple",
            tagK: ramp(t, T.tags + 0.08 * n, T.tags + 0.08 * n + 0.4, E.lin),
          });
        }

        // the tray: appears, then each order flies to its node
        trayTag.set({ k: ramp(t, T.tray, T.tray + 0.4, E.lin) * (1 - ramp(t, T.green, T.green + 0.4, E.lin)) });
        orders.forEach((c, i) => {
          const p = Math.floor(i / S.per);
          const j = i % S.per;
          const a = trayAt(i);
          const b = cl.slot(p, j);
          const s0 = T.split + T.splitStep * i;
          const k = E.inOut(ramp(t, s0, s0 + T.splitDur, E.lin));
          const pos = D5.fly(a, b, k, { arc: -40 });
          const pop = D5.appear(ramp(t, T.tray + T.trayStep * i, T.tray + T.trayStep * i + 0.4, E.lin));
          c.set({
            x: pos.x,
            y: pos.y,
            s: pop.s * (1 + 0.12 * flash(t, s0 + T.splitDur, s0 + T.splitDur + 0.3)),
            o: pop.o,
            tone: "blue",
            solid: true,
          });
        });

        // replication: every node receives all twelve; four do not fit
        copies.forEach((row, n) =>
          row.forEach((c, i) => {
            const s0 = T.rep + T.repNode * n + T.repStep * i;
            const f = ramp(t, s0, s0 + T.repDur, E.lin);
            const pos = D5.fly(trayAt(i), cl.slot(n, i), E.inOut(f), { arc: -30 });
            const over = i >= S.cap;
            const landed = f >= 1;
            c.set({
              x: pos.x,
              y: pos.y,
              s: (1 - 0.4 * repGone) * (f > 0 ? 1 : 0),
              o: f > 0 ? 1 - repGone : 0,
              tone: over && landed ? "red" : "blue",
              solid: over && landed,
            });
          }),
        );
        noRoom.forEach((tag, n) =>
          tag.set({ k: ramp(t, T.ring + 0.1 * n, T.ring + 0.1 * n + 0.4, E.lin) * (1 - repGone) }),
        );

        // the followers: dashed copies land on the next node
        followers.forEach((c, i) => {
          const p = Math.floor(i / S.per);
          const j = i % S.per;
          const s0 = T.fol + T.folStep * i;
          const f = ramp(t, s0, s0 + T.folDur, E.lin);
          const pos = D5.fly(cl.slot(p, j), cl.slot(D5.followerNode(p), S.per + j), E.inOut(f), { arc: 30 });
          c.set({
            x: pos.x,
            y: pos.y,
            dashed: true,
            o: f > 0 ? 1 : 0,
            s: f > 0 ? 1 + 0.12 * flash(t, s0 + T.folDur, s0 + T.folDur + 0.3) : 0,
          });
        });

        // the legend and the "x of 8" tags
        const lg = ramp(t, T.legend, T.legend + 0.4, E.lin);
        const pop = D5.appear(lg);
        legLead.set({ x: 250, y: 549, s: pop.s, o: pop.o, solid: true });
        legFol.set({ x: 520, y: 549, s: pop.s, o: pop.o, dashed: true });
        legLeadTag.set({ k: lg });
        legFolTag.set({ k: lg });
        fits.forEach((tag, n) => tag.set({ k: ramp(t, T.fits + 0.08 * n, T.fits + 0.08 * n + 0.4, E.lin) }));
      };
    },
  });
})();

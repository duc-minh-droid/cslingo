/* Lecture 5 (ds-5) · scene 9 (REBALANCING): a fourth node joins a cluster of three that holds twelve items. With "node = key mod N" the
   rule itself changes (N = 3 becomes N = 4), so 9 of the 12 keys move to a different node (only keys 0, 1 and 2 stay). With a fixed
   number of partitions (12, spread by p mod 3) the new node just steals whole partitions (P9, P10, P11), so only three move
   (lesson 5.5). Every key, partition and count comes from D5.MOD and D5.FIXED, asserted on load. Colours: blue = keys (the data),
   grey = fixed partitions at rest, purple = the routing rules (the labels), orange = the new node and anything in motion, red =
   expensive ("moved 9 of 12"), green = cheap ("moved 3 of 12"). Story (local seconds): 0.2 both rows (nodes A-C, a ghost D) pop; 2.0
   node D joins in both rows and "N = 3" flips to "N = 4"; 3.4 on the top row the nine keys that change node turn orange and fly one
   after another, the red counter counts to 9; 7.4 on the bottom row P9, P10 and P11 fly to node D, the green counter counts to 3. Hold. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const M = D5.MOD;
  const F = D5.FIXED;
  D5.same(
    "rebalance scene: key mod 3 becomes key mod 4, nine of the twelve keys change node, keys 0 1 2 stay",
    [M.n0, M.n1, M.keys.length, M.moved, M.stay],
    [3, 4, 12, [3, 4, 5, 6, 7, 8, 9, 10, 11], [0, 1, 2]],
  );
  D5.same(
    "rebalance scene: the keys that move are exactly those whose node changes",
    M.keys.filter((k) => k % 3 !== k % 4),
    M.moved,
  );
  D5.same(
    "rebalance scene: fixed partitions, node D steals P9 P10 P11 (three moves) and ends with three partitions like the others",
    [F.parts, F.steals, F.moved, F.nodes1.map((n) => n.length)],
    [
      12,
      [
        { p: 9, from: 0 },
        { p: 10, from: 1 },
        { p: 11, from: 2 },
      ],
      3,
      [3, 3, 3, 3],
    ],
  );
  const before = (k) => ({ node: k % M.n0, slot: Math.floor(k / M.n0) });
  const after = (k) => ({ node: k % M.n1, slot: Math.floor(k / M.n1) });

  const T = {
    pop: 0.2,
    labels: 0.8,
    join: 2.0,
    flip: 2.6,
    move: 3.4,
    moveStep: 0.25,
    moveDur: 0.5,
    steal: 7.4,
    stealStep: 1.0,
    stealDur: 0.7,
    bump: 10.4,
  };
  const landAt = (i) => T.move + T.moveStep * i + T.moveDur;
  const stealLand = (i) => T.steal + T.stealStep * i + T.stealDur;

  V.scene({
    kicker: "REBALANCING",
    title: ["A new node joins:", "move as little as you can"],
    dur: 13.5,
    caps: [
      [0.4, 3.2, "Twelve items on three nodes. A fourth joins."],
      [3.6, 6.8, `Hash mod N: N changed, so ${M.moved.length} of 12 keys move.`],
      [7.4, 10.4, `Fixed partitions: it steals ${F.moved} whole ones.`],
      [10.8, 13.1, "Three moves instead of nine."],
    ],
    build(stage) {
      const names = ["Node A", "Node B", "Node C", "Node D"];
      const mk = (y) =>
        D5.cluster(stage, {
          x: 12,
          y,
          n: 4,
          w: 210,
          gap: 24,
          cols: 2,
          rows: 2,
          cw: 70,
          ch: 44,
          cg: 8,
          headH: 52,
          names,
        });
      const top = mk(76);
      const bottom = mk(396);
      const keys = M.keys.map((k) => D5.chip(stage, { text: String(k), w: 70, h: 44, tone: "blue" }));
      const parts = M.keys.map((p) => D5.chip(stage, { text: `P${p}`, w: 70, h: 44, tone: "grey" }));
      const ruleTag = D5.tag(stage, { x: 12, y: 8, text: "node = key mod N", tone: "purple" });
      const nTag = D5.tag(stage, { x: 290, y: 8, text: "N = 3", tone: "purple" });
      const fixedTag = D5.tag(stage, { x: 12, y: 328, text: "12 fixed partitions", tone: "purple" });
      const statTop = D5.stat(stage, { x: 600, y: 4, w: 324, h: 64, label: "moved", tone: "red" });
      const statBottom = D5.stat(stage, { x: 600, y: 324, w: 324, h: 64, label: "moved", tone: "green" });

      return (t) => {
        const joined = ramp(t, T.join, T.join + 0.5, E.lin);
        [top, bottom].forEach((cl, row) => {
          for (let n = 0; n < 4; n++) {
            const k = ramp(t, T.pop + 0.06 * (row * 4 + n), T.pop + 0.06 * (row * 4 + n) + 0.5, E.lin);
            if (n < 3) {
              // a source node flashes a blue ring while a bottom partition leaves it
              let ring = 0;
              if (row === 1) {
                F.steals.forEach((s, i) => {
                  if (s.from === n)
                    ring = Math.max(ring, flash(t, T.steal + T.stealStep * i, T.steal + T.stealStep * i + 0.5));
                });
              }
              cl.set(n, { k, ring: ring > 0 ? "blue" : undefined, ringK: ring });
            } else {
              cl.set(n, { k, ghost: t < T.join, tone: t >= T.join ? "orange" : "grey", ring: "orange", ringK: joined });
            }
          }
        });

        // top row: the keys, most stay and nine move to the node of key mod 4
        keys.forEach((c, k) => {
          const i = M.moved.indexOf(k);
          const a = before(k);
          const b = after(k);
          const from = top.slot(a.node, a.slot);
          const to = top.slot(b.node, b.slot);
          const p = D5.appear(ramp(t, T.pop + 0.3 + 0.03 * k, T.pop + 0.8 + 0.03 * k, E.lin));
          let pos = from;
          let moving = false;
          if (i >= 0) {
            const s0 = T.move + T.moveStep * i;
            const f = ramp(t, s0, s0 + T.moveDur, E.lin);
            pos = D5.fly(from, to, E.inOut(f), { arc: i % 2 ? 40 : -40 });
            moving = f > 0 && f < 1;
          }
          c.set({
            x: pos.x,
            y: pos.y,
            s: p.s * (moving ? 1.12 : 1),
            o: p.o,
            tone: moving ? "orange" : "blue",
            solid: moving,
          });
        });
        // bottom row: twelve fixed partitions, node D steals the last three
        parts.forEach((c, pIdx) => {
          const a = { node: pIdx % 3, slot: Math.floor(pIdx / 3) };
          const from = bottom.slot(a.node, a.slot);
          const si = F.steals.findIndex((s) => s.p === pIdx);
          const p = D5.appear(ramp(t, T.pop + 0.3 + 0.03 * pIdx, T.pop + 0.8 + 0.03 * pIdx, E.lin));
          let pos = from;
          let moving = false;
          if (si >= 0) {
            const s0 = T.steal + T.stealStep * si;
            const f = ramp(t, s0, s0 + T.stealDur, E.lin);
            pos = D5.fly(from, bottom.slot(3, si), E.inOut(f), { arc: -30 });
            moving = f > 0 && f < 1;
          }
          c.set({
            x: pos.x,
            y: pos.y,
            s: p.s * (moving ? 1.12 : 1),
            o: p.o,
            tone: moving ? "orange" : "grey",
            solid: moving,
          });
        });

        // the labels and the counters
        const lk = ramp(t, T.labels, T.labels + 0.4, E.lin);
        ruleTag.set({ k: lk });
        nTag.set({
          text: t >= T.flip ? `N = ${M.n1}` : `N = ${M.n0}`,
          k: lk,
          s: 1 + 0.12 * flash(t, T.flip, T.flip + 0.4),
        });
        fixedTag.set({ k: lk });
        const movedTop = M.moved.filter((_, i) => t >= landAt(i)).length;
        const movedBottom = F.steals.filter((_, i) => t >= stealLand(i)).length;
        statTop.set({
          text: `${movedTop} of 12`,
          k: ramp(t, T.move - 0.3, T.move + 0.2, E.lin),
          bump: flash(t, T.bump, T.bump + 0.5),
        });
        statBottom.set({
          text: `${movedBottom} of 12`,
          k: ramp(t, T.steal - 0.3, T.steal + 0.2, E.lin),
          bump: flash(t, T.bump, T.bump + 0.5),
        });
      };
    },
  });
})();

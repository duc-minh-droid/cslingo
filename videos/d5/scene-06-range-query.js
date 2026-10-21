/* Lecture 5 (ds-5) · scene 6 (THE PRICE OF HASHING): the same 16 ids (101 to 116) laid out two ways: by key range (101-104 on node 1,
   105-108 on node 2 ...) and by hash (scattered over all four nodes). A query for ids 101 to 104 asks one node in the first layout
   and all four in the second, so hashing makes range queries expensive (lesson 5.3). Every layout and count comes from D5
   (D5.RNODES, D5.HNODES, D5.RQ, D5.askedNodes), asserted on load. Colours: grey = the ids at rest, blue = the query and the ids it
   asks for, purple = the two routing rules (the labels "key ranges" and "hash"), green = cheap (asked 1 node), red = expensive
   (asked 4 nodes). Story (local seconds): 0.2 both clusters and their ids pop; 3.4 the query "ids 101 to 104" pops and the four
   ids light up in both layouts; 6.0 the key-range node gets a blue ring and "nodes asked 1" pops in green; 8.8 the four hash nodes
   get red rings one after another and "nodes asked 4" pops in red. Hold to the end. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const RQ = D5.RQ;
  const RN = D5.RNODES;
  const HN = D5.HNODES;
  D5.same(
    "range-query scene: the query 101 to 104 asks 1 node with key ranges and 4 with hashing",
    [RQ.ids, RQ.range, RQ.hash, D5.askedNodes(RQ.ids, D5.rNode), D5.askedNodes(RQ.ids, D5.hNode)],
    [[101, 102, 103, 104], [0], [0, 1, 2, 3], [0], [0, 1, 2, 3]],
  );
  D5.same(
    "range-query scene: every node holds four of the sixteen ids in both layouts",
    [RN.map((n) => n.length), HN.map((n) => n.length), D5.sum(RN.map((n) => n.length))],
    [[4, 4, 4, 4], [4, 4, 4, 4], 16],
  );

  const T = {
    pop: 0.2,
    popStep: 0.04,
    labels: 0.6,
    pill: 3.4,
    hit: 4.0,
    hitStep: 0.1,
    top: 6.0,
    bottom: 8.8,
    ringStep: 0.4,
    stat: 10.4,
  };

  V.scene({
    kicker: "THE PRICE OF HASHING",
    title: ["Hashing scatters", "range queries"],
    dur: 11.5,
    caps: [
      [0.4, 3.0, "The same 16 users, laid out two ways."],
      [3.4, 5.6, `Now ask for ids ${RQ.ids[0]} to ${RQ.ids[RQ.ids.length - 1]}.`],
      [6.0, 8.4, "Key ranges: all four are on one node."],
      [8.8, 11.2, "Hash: they are on four different nodes."],
    ],
    build(stage) {
      const mk = (y) =>
        D5.cluster(stage, { x: 12, y, n: 4, w: 210, gap: 24, cols: 2, rows: 2, cw: 64, ch: 44, cg: 8, headH: 52 });
      const top = mk(70);
      const bottom = mk(396);
      const make = (cl, layout) =>
        layout
          .map((ids, n) =>
            ids.map((id, j) => ({
              id,
              n,
              j,
              cl,
              chip: D5.chip(stage, { text: String(id), w: 64, h: 44, tone: "grey" }),
            })),
          )
          .flat();
      const chips = [...make(top, RN), ...make(bottom, HN)];
      const tagTop = D5.tag(stage, { x: 12, y: 0, text: "key ranges", tone: "purple" });
      const tagBottom = D5.tag(stage, { x: 12, y: 326, text: "hash", tone: "purple" });
      const statTop = D5.stat(stage, { x: 612, y: 0, w: 312, h: 64, label: "nodes asked", tone: "green" });
      const statBottom = D5.stat(stage, { x: 612, y: 326, w: 312, h: 64, label: "nodes asked", tone: "red" });
      const pill = D5.tag(stage, { x: 357, y: 252, text: "ids 101 to 104", tone: "blue", solid: true, icon: "search" });

      return (t) => {
        [top, bottom].forEach((cl, row) => {
          for (let n = 0; n < 4; n++) {
            const k = ramp(t, T.pop + T.popStep * (row * 4 + n), T.pop + T.popStep * (row * 4 + n) + 0.5, E.lin);
            const askedTop = row === 0 && n === RQ.range[0];
            const askedBottom = row === 1 && RQ.hash.includes(n);
            const rs = row === 0 ? T.top : T.bottom + T.ringStep * n;
            const ringK = askedTop || askedBottom ? ramp(t, rs, rs + 0.4, E.lin) : 0;
            cl.set(n, { k, ring: askedTop ? "blue" : "red", ringK, tone: "grey" });
          }
        });
        chips.forEach((c, ord) => {
          const k = ramp(t, T.pop + T.popStep * (ord % 16), T.pop + T.popStep * (ord % 16) + 0.5, E.lin);
          const q = RQ.ids.indexOf(c.id);
          const lit = q >= 0 && t >= T.hit + T.hitStep * q;
          const p = D5.appear(k);
          const pos = c.cl.slot(c.n, c.j);
          c.chip.set({
            x: pos.x,
            y: pos.y,
            s: p.s * (lit ? 1 + 0.15 * flash(t, T.hit + T.hitStep * q, T.hit + T.hitStep * q + 0.4) : 1),
            o: p.o,
            tone: lit ? "blue" : "grey",
            solid: lit,
          });
        });
        tagTop.set({ k: ramp(t, T.labels, T.labels + 0.4, E.lin) });
        tagBottom.set({ k: ramp(t, T.labels + 0.1, T.labels + 0.5, E.lin) });
        pill.set({ k: ramp(t, T.pill, T.pill + 0.5, E.lin) });
        statTop.set({
          text: String(RQ.range.length),
          k: ramp(t, T.top + 0.4, T.top + 0.9, E.lin),
          bump: flash(t, T.top + 0.4, T.top + 0.8),
        });
        statBottom.set({
          text: String(RQ.hash.length),
          k: ramp(t, T.stat, T.stat + 0.5, E.lin),
          bump: flash(t, T.stat, T.stat + 0.4),
        });
      };
    },
  });
})();

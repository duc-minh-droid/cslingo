/* Lecture 4 (ds-4) · scene 3 (REPLICATION): replication is a copy of ALL the data on every node, partitioning is a piece on each
   node (next lecture); when a node fails nothing is lost if the others hold copies (lesson 4.1). Records A B C. Row 1 (purple
   heading): node 1 holds A B C and sends copies to nodes 2 and 3 (purple chips that fly along arcs), then all nine chips turn
   green. Row 2 (grey heading, "lecture 5"): each node holds one record (A, B, C). Then the middle node of both rows crashes and
   record B is counted: two copies are left with replication, none with partitioning. Every count comes from D4.COPY (asserted on
   load) and the verdict tags are built from it. Colours: grey = a record that is only stored, purple = a copy travelling and the
   replication heading, green = stored safely and the surviving B chips, red = the crashed node, its lost records and "0 copies left".
   Story (local seconds): 0.3 heading 1 and the three nodes pop; 0.9 node 1's chips pop; 1.5-2.9 the six copies fly; 3.2 all nine
   chips turn green; 3.8 heading 2 and the second row of nodes pop; 4.4 the three single chips pop; 6.6 a bolt hits the middle
   node of both rows; 7.3 the verdict tags pop (two copies of B left in row 1, none in row 2). Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const { ramp, flash, ease: E } = V;
  const C = D4.COPY;

  // ---------- the data (asserted against the storyboard and checked again by counting the chips drawn) ----------
  D4.same(
    "copies scene: B is held by 3 nodes (replication) or 1 (partitioning) before the crash, 2 or 0 after",
    [C.held.replica, C.held.part],
    [
      { before: 3, after: 2 },
      { before: 1, after: 0 },
    ],
  );
  D4.same(
    "copies scene: the layout drawn holds exactly what D4.COPY says (every node a full copy; one record per node)",
    [C.replica.map((r) => r.join("")), C.part.map((r) => r.join(""))],
    [
      ["ABC", "ABC", "ABC"],
      ["A", "B", "C"],
    ],
  );
  const B = C.records.indexOf("B");
  const HELD = C.held;

  const T = {
    pop: 0.3,
    chips: 0.9,
    chipStep: 0.1,
    fly: 1.5,
    flyStep: 0.12,
    flyDur: 0.5,
    green: 3.2,
    head2: 3.8,
    single: 4.4,
    singleStep: 0.2,
    bolt: 6.6,
    down: 6.8,
    verdict: 7.3,
  };

  V.scene({
    kicker: "REPLICATION",
    title: ["Replication keeps a", "full copy on every node"],
    dur: 10.5,
    caps: [
      [0.9, 3.8, "Replication: every node keeps a full copy."],
      [4.4, 6.8, "Partitioning: each node keeps a piece."],
      [7.2, 10.2, "When a node fails, the copies carry on."],
    ],
    build(stage) {
      const NODE_X = [12, 333, 654];
      const ROW_Y = [70, 388];
      const mk = (row, i) =>
        D4.node(stage, {
          x: NODE_X[i],
          y: ROW_Y[row],
          w: 270,
          h: 170,
          layout: "slots",
          name: `Node ${i + 1}`,
          icon: "server",
        });
      const head1 = D4.tag(stage, { x: 468, y: 36, text: "Replication: a full copy each", tone: "purple" });
      const head2 = D4.tag(stage, { x: 468, y: 354, text: "Partitioning: a piece each" });
      const lecture5 = D4.tag(stage, { x: 828, y: 354, text: "lecture 5" });
      const nodes = [0, 1].map((row) => NODE_X.map((_, i) => mk(row, i)));

      // the records: three per node in row 1, one per node in row 2
      const rec1 = nodes[0].map((n) =>
        D4.chips(stage, { ...n.slot({ n: 3, w: 70, h: 64, gap: 12 }), texts: C.records, fs: 34 }),
      );
      const rec2 = nodes[1].map((n, i) =>
        D4.chips(stage, { ...n.slot({ n: 1, w: 70, h: 64, gap: 12 }), texts: [C.part[i][0]], fs: 34 }),
      );

      // the copies in flight: one purple chip per record and per target node
      const TARGETS = [1, 2];
      const flyers = TARGETS.flatMap((to) =>
        C.records.map((r, ri) => ({
          to,
          ri,
          chip: D4.chips(stage, { ...nodes[0][0].slot({ n: 3, w: 70, h: 64, gap: 12 }), n: 1, texts: [r], fs: 34 }),
        })),
      );
      const flyIndex = (f) => f.ri * TARGETS.length + TARGETS.indexOf(f.to); // A to node 2, A to node 3, B to node 2 ...
      const flyAt = (f) => T.fly + T.flyStep * flyIndex(f);
      const landAt = (f) => flyAt(f) + T.flyDur;

      const verdicts = [
        D4.tag(stage, { x: 468, y: 275, text: `B: ${HELD.replica.after} copies left`, tone: "green", solid: true }),
        D4.tag(stage, { x: 468, y: 598, text: `B: ${HELD.part.after} copies left`, tone: "red", solid: true }),
      ];
      const top = D4.svg(stage);
      const bolts = [0, 1].map((row) => top.appendChild(D4.bolt(nodes[row][1].mid.x, nodes[row][1].mid.y, 90, "red")));

      return (t) => {
        const k1 = ramp(t, T.pop, T.pop + 0.5, E.lin);
        const k2 = ramp(t, T.head2, T.head2 + 0.5, E.lin);
        const dead = ramp(t, T.down, T.down + 0.4, E.lin);
        head1.set({ k: k1 });
        head2.set({ k: k2 });
        lecture5.set({ k: ramp(t, T.head2 + 0.2, T.head2 + 0.6, E.lin) });
        nodes[0].forEach((n, i) => n.set({ k: k1, down: i === 1 ? dead : 0 }));
        nodes[1].forEach((n, i) => n.set({ k: k2, down: i === 1 ? dead : 0 }));

        // row 1: node 1's originals, then the copies land on nodes 2 and 3
        rec1.forEach((row, node) =>
          row.all((ri) => {
            const orig = node === 0;
            const f = flyers.find((x) => x.to === node && x.ri === ri);
            const shown = orig
              ? ramp(t, T.chips + T.chipStep * ri, T.chips + T.chipStep * ri + 0.3, E.lin)
              : t >= landAt(f)
                ? 1
                : 0;
            const lost = node === 1 && dead > 0;
            const keepsB = ri === B && node !== 1 && t >= T.verdict;
            return {
              o: shown,
              s:
                0.6 +
                0.4 * E.pop(shown) +
                0.12 * flash(t, T.green + 0.06 * (node * 3 + ri), T.green + 0.06 * (node * 3 + ri) + 0.3),
              tone: lost ? "red" : t >= T.green ? "green" : "grey",
              ring: keepsB ? "green" : undefined,
              ringK: keepsB ? ramp(t, T.verdict, T.verdict + 0.3, E.lin) : 0,
            };
          }),
        );
        // the copies in flight
        flyers.forEach((f) => {
          const src = rec1[0].mid(f.ri);
          const dst = rec1[f.to].mid(f.ri);
          const k = ramp(t, flyAt(f), landAt(f), E.out);
          const p = D4.at(src, dst, k, f.to === 1 ? 30 : -30);
          const base = f.chip.mid(0); // the chip's own slot: the offsets below are measured from it
          f.chip.set(0, {
            x: p.x - base.x,
            y: p.y - base.y,
            tone: "purple",
            solid: true,
            o: t >= flyAt(f) && t < landAt(f) ? 1 : 0,
            s: 0.8 + 0.2 * E.pop(ramp(t, flyAt(f), flyAt(f) + 0.2, E.lin)),
          });
        });

        // row 2: each node holds one record; the middle one dies with its record
        rec2.forEach((row, node) => {
          const shown = ramp(t, T.single + T.singleStep * node, T.single + T.singleStep * node + 0.3, E.lin);
          const lost = node === 1 && dead > 0;
          row.set(0, { o: shown, s: 0.6 + 0.4 * E.pop(shown), tone: lost ? "red" : "grey" });
        });

        verdicts[0].set({ k: ramp(t, T.verdict, T.verdict + 0.4, E.lin) });
        verdicts[1].set({ k: ramp(t, T.verdict + 0.2, T.verdict + 0.6, E.lin) });
        bolts.forEach((b) => {
          const k = ramp(t, T.bolt, T.bolt + 0.25, E.lin);
          V.place(b, { s: 0.5 + 0.5 * E.pop(k), o: k * (1 - ramp(t, T.bolt + 0.6, T.bolt + 0.9, E.lin)) });
        });
      };
    },
  });
})();

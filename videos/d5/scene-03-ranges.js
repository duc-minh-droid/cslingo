/* Lecture 5 (ds-5) · scene 3 (KEY RANGES): key-range partitioning gives each node a range of sorted keys (surnames A-F, G-M, N-S,
   T-Z): a new key goes to the node whose range holds it, and neighbouring keys stay together, so a range query reads one node
   (lesson 5.2). Every name, range and answer comes from D5 (D5.RANGES, D5.NAME_NODES, D5.NEW_NAME, D5.insertAt, D5.QUERY), asserted on
   load. Colours: blue = the data and what we ask (a key, the query), purple = the range tags (the routing rule), orange = the pointer
   that looks for the right range, red = a range that does not match (a flash), green = the range that matches and "nodes asked 1",
   grey = names at rest. Story (local seconds): 0.2 the four nodes pop with their range tags and names; 1.4 the key Okafor pops;
   2.9 an orange pointer hops over the tags A-F, G-M, N-S until one matches (N-S turns green); 4.3 Okafor drops into the N-S node
   between Nolan and Patel; 6.4 the query "Khan to Mills" pops and an arrow points at the G-M node: Khan and Lewis light up and
   "nodes asked 1" pops. Hold to the end. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const NAMES = D5.NAME_NODES;
  const NEW = D5.NEW_NAME;
  const NEW_NODE = D5.nodeOfName(NEW);
  const NEW_AT = D5.insertAt(NAMES[NEW_NODE], NEW);
  D5.same(
    "ranges scene: four ranges, Okafor belongs to the N-S node and sits between Nolan and Patel",
    [D5.RANGES.length, NEW, NEW_NODE, NEW_AT, NAMES[NEW_NODE].slice(NEW_AT - 1, NEW_AT + 1)],
    [4, "Okafor", 2, 1, ["Nolan", "Patel"]],
  );
  const Q = D5.QUERY;
  D5.same(
    "ranges scene: the query Khan to Mills asks one node (G-M) and finds Khan and Lewis, not Morgan",
    [Q.nodes, Q.hits],
    [
      [1],
      [
        [1, "Khan"],
        [1, "Lewis"],
      ],
    ],
  );
  D5.same(
    "ranges scene: every surname starts with a letter of its node's range",
    NAMES.map((list, n) => list.every((name) => D5.nodeOfName(name) === n)),
    [true, true, true, true],
  );

  const T = {
    nodes: 0.2,
    nodeStep: 0.1,
    key: 1.4,
    point: 2.9,
    hop: 0.5,
    drop: 4.3,
    dropDur: 1.2,
    pill: 6.4,
    arrow: 6.9,
    hits: 7.4,
    stat: 8.3,
    pulse: 9.2,
  };
  const HIT_NAMES = Q.hits.map((h) => h[1]);

  V.scene({
    kicker: "KEY RANGES",
    title: ["Each partition owns", "a range of keys"],
    dur: 12,
    caps: [
      [0.7, 2.9, "Each node owns a range of keys."],
      [3.0, 5.9, `${NEW} falls in N to S, so node 3 takes it.`],
      [6.6, 9.2, "Khan to Mills: one node holds them all."],
      [9.4, 11.8, "Neighbouring keys sit together."],
    ],
    build(stage) {
      const cl = D5.cluster(stage, { x: 12, y: 150, n: 4, w: 210, gap: 24, cols: 1, rows: 4, cw: 178, ch: 44, cg: 6 });
      // the names: a grey chip on every slot, one per surname (the new key is placed later)
      const names = NAMES.map((list, n) =>
        list.map((name) => D5.chip(stage, { text: name, w: 178, h: 44, tone: "grey" })),
      );
      const key = D5.chip(stage, { text: NEW, w: 150, h: 48, tone: "blue", solid: true });
      const svg = L5.svg(stage);
      const pill = D5.tag(stage, { x: 357, y: 8, text: "Khan to Mills", tone: "blue", solid: true, icon: "search" });
      const link = D5.link(svg, { x: 440, y: 70 }, { x: cl.top(1).x, y: cl.top(1).y - 56 }, "blue", { w: 7, head: 22 });
      const stat = D5.stat(stage, { x: 330, y: 470, w: 276, h: 80, label: "nodes asked", tone: "green" });
      const pointer = D5.disc(stage, { x: 0, y: 0, size: 40, text: "", tone: "orange" });

      // where each name sits: the new key pushes Patel and Quinn down one slot
      const slotOf = (n, i, t) => {
        const pushed = n === NEW_NODE && i >= NEW_AT ? ramp(t, T.drop, T.drop + 0.5, E.inOut) : 0;
        const a = cl.slot(n, i);
        const b = cl.slot(n, i + 1);
        return { x: a.x + (b.x - a.x) * pushed, y: a.y + (b.y - a.y) * pushed };
      };

      return (t) => {
        // the nodes pop in with their range tags
        for (let n = 0; n < 4; n++) {
          const k = ramp(t, T.nodes + T.nodeStep * n, T.nodes + T.nodeStep * n + 0.5, E.lin);
          const matched = n === NEW_NODE && t >= T.point + 2 * T.hop && t < T.drop + T.dropDur;
          const asked = n === Q.nodes[0] && t >= T.arrow + 0.3;
          // a range the pointer has left flashes red: the key is not in it
          const missed = n < NEW_NODE && t >= T.point + T.hop * (n + 1) && t < T.point + T.hop * (n + 1) + 0.5;
          cl.set(n, {
            k,
            tag: D5.RANGES[n],
            tagK: k,
            tagTone: matched ? "green" : missed ? "red" : "purple",
            tagSolid: matched || missed,
            ring: matched ? "blue" : asked ? "blue" : undefined,
            ringK: matched
              ? ramp(t, T.point + 2 * T.hop, T.point + 2 * T.hop + 0.3, E.lin) *
                (1 - ramp(t, T.drop + 0.8, T.drop + 1.2, E.lin))
              : asked
                ? ramp(t, T.arrow + 0.3, T.arrow + 0.7, E.lin)
                : 0,
          });
        }

        // the names, then the key drops into its node and the others make room
        names.forEach((row, n) =>
          row.forEach((c, i) => {
            const k = ramp(t, T.nodes + T.nodeStep * n + 0.3, T.nodes + T.nodeStep * n + 0.7, E.lin);
            const p = D5.appear(k);
            const pos = slotOf(n, i, t);
            const hit = n === Q.nodes[0] && HIT_NAMES.includes(NAMES[n][i]) && t >= T.hits;
            c.set({
              x: pos.x,
              y: pos.y,
              s: p.s * (1 + (hit ? 0.1 * flash(t, T.pulse, T.pulse + 0.6) : 0)),
              o: p.o,
              tone: hit ? "blue" : "grey",
              solid: hit,
            });
          }),
        );
        const kk = ramp(t, T.key, T.key + 0.5, E.lin);
        const kp = D5.appear(kk);
        const land = ramp(t, T.drop, T.drop + T.dropDur, E.inOut);
        const kpos = D5.fly({ x: 468, y: 36 }, cl.slot(NEW_NODE, NEW_AT), land, { arc: -30 });
        const landed = land >= 1;
        key.set({
          x: kpos.x,
          y: kpos.y,
          s: kp.s * (1 + 0.1 * flash(t, T.drop + T.dropDur, T.drop + T.dropDur + 0.3)),
          sx: 1 + (178 / 150 - 1) * land, // it widens to fill the slot it lands in
          o: kp.o,
          tone: landed ? "grey" : "blue",
          solid: !landed,
        });

        // the orange pointer hops over the range tags until one matches
        const hops = [0, 1, 2];
        let px = cl.tagAt(0);
        hops.forEach((h) => {
          if (h === 0) return;
          const f = E.inOut(ramp(t, T.point + T.hop * (h - 1), T.point + T.hop * h, E.lin));
          px = D5.lerp2(px, cl.tagAt(h), f);
        });
        const pk = ramp(t, T.point - 0.3, T.point, E.lin) * (1 - ramp(t, T.drop - 0.2, T.drop + 0.2, E.lin));
        pointer.set({ x: px.x, y: px.y - 50, k: pk });

        // the query
        pill.set({ k: ramp(t, T.pill, T.pill + 0.5, E.lin) });
        link(ramp(t, T.arrow, T.arrow + 0.5, E.lin), 1);
        stat.set({
          text: String(Q.nodes.length),
          k: ramp(t, T.stat, T.stat + 0.5, E.lin),
          bump: flash(t, T.stat, T.stat + 0.4),
        });
      };
    },
  });
})();

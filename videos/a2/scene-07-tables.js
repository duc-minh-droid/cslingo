/* Algorithms phase 2 (algo-2), scene 07: routers forward one hop at a time (link-state routing + forwarding).
   Every router learns the whole six-router map (flood), router A runs Dijkstra and keeps only the FIRST hop of each route
   (its forwarding table), then a packet for F is passed on one table lookup at a time: A says "via D", D says "via E", E says
   "direct". Every number (tree, distances, table, hops, lookups) comes from the A2 helpers and is asserted below. */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  const { pop, fade, lin, io, bump } = A2;

  // ---------- data (all from the helpers, asserted here) ----------
  const [SRC, DST] = ["A", "F"];
  const RUN = A2.netDijkstra(SRC);
  const TREE = RUN.tree; // [parent, node] in settle order
  const TABLE = A2.TABLE_A;
  const HOPS = A2.hops(SRC, DST);
  const ROUTE = [HOPS[0].at, ...HOPS.map((h) => h.next)];
  const key = (a, b) => [a, b].sort().join("-");
  A2.need(TREE.map((e) => e.join("")).join() === "AD,AB,BC,DE,EF", "scene 7: A's tree is A-D, A-B, B-C, D-E, E-F");
  A2.need(
    TREE.map(([, v]) => RUN.d[v]).join() === "2,3,5,5,7" && RUN.d.F === 7,
    "scene 7: A's distances in settle order are 2 3 5 5 7",
  );
  A2.need(
    TABLE.map((r) => r.dest + r.next).join() === "BB,CB,DD,ED,FD",
    "scene 7: A's table is B B, C B, D D, E D, F D",
  );
  A2.need(ROUTE.join("") === "ADEF" && HOPS[0].cost === 7, "scene 7: a packet A to F goes A D E F, total 7");
  A2.need(A2.NET.names.length === 6 && A2.NET.edges.length === 10, "scene 7: six routers, ten links");
  const FIRST = key(HOPS[0].at, HOPS[0].next); // the first hop of A's route to F
  const VIA = TABLE.find((r) => r.dest === DST).next; // the next hop A keeps for F
  A2.need(VIA === HOPS[0].next, "scene 7: the table's first hop for F is the first hop of the route");
  const lookup = (h) => (h.next === DST ? `${DST}: direct` : `${DST} via ${h.next}`); // what the router's own table says

  // ---------- timeline (local seconds) ----------
  const T = {
    node0: 0.2, // node i pops at node0 + 0.1 i
    road0: 0.55, // road i draws 0.4 s from road0 + 0.05 i
    pill0: 1.0, // weight pill i pops at pill0 + 0.04 i
    me: 1.2, // A becomes "the router we follow"
    tree0: 3.0, // road i of the tree draws 0.4 s from tree0 + 0.44 i
    treeStep: 0.44,
    treeDur: 0.4,
    table: 5.4, // the table pops in, its rows follow
    row0: 5.6,
    rowStep: 0.25,
    flash: [6.55, 7.1], // the first road A-D flashes orange
    unwind: 7.2, // the tree retracts, last road first (0.05 s apart, 0.2 s each)
    packet: 7.4,
    rowF: 7.6, // the table row for F lights up
    done: 11.4, // the packet arrives
  };
  const ICON = { A: 1.6, B: 1.9, D: 1.9, C: 2.2, E: 2.2, F: 2.5 }; // the map icons pop outward from A
  const ICON_OUT = [3.0, 3.4];
  const HOP = [[7.8, 8.5], [9.3, 10.0], [10.7, 11.4]]; // prettier-ignore
  const LOOK_AT = [8.7, 10.2]; // when D's and E's own lookup tags pop
  A2.need(HOP.length === HOPS.length, "scene 7: one hop window per hop");
  const treeAt = (i) => T.tree0 + T.treeStep * i;
  const unwindAt = (i) => T.unwind + 0.05 * (TREE.length - 1 - i);
  const ARR = {}; // when a node's tree road arrives
  const GONE = {}; // when that road has retracted again
  TREE.forEach(([, v], i) => ((ARR[v] = treeAt(i) + T.treeDur), (GONE[v] = unwindAt(i) + 0.2)));
  const DIM_ROW = HOP[0][0] + 0.3; // the used table row dims once the packet has left A
  const END = HOP[HOP.length - 1][1];
  A2.need(END === T.done, "scene 7: the packet arrives at T.done");

  /* the road that is drawn in colour at time t (the tree, the first-hop flash, the packet's trail), or null */
  function overlay(k, t) {
    const i = TREE.findIndex(([p, v]) => key(p, v) === k);
    if (i >= 0) {
      const f = io(t, treeAt(i), treeAt(i) + T.treeDur) * (1 - io(t, unwindAt(i), unwindAt(i) + 0.2));
      if (f > 0.001) {
        const flash = k === FIRST && t >= T.flash[0] && t <= T.flash[1];
        const w = 12 + 6 * (k === FIRST ? bump(t, T.flash[0], T.flash[1] - T.flash[0]) : 0);
        return { tone: flash ? "orange" : "green", k: f, from: TREE[i][0], w };
      }
    }
    const j = HOPS.findIndex((h) => key(h.at, h.next) === k);
    if (j >= 0 && io(t, ...HOP[j]) > 0.001) return { tone: "green", k: io(t, ...HOP[j]), from: HOPS[j].at, w: 12 };
    return null;
  }

  function nodeState(n, t) {
    let st = { look: "grey" };
    if (n === SRC && t >= T.me)
      st = { look: t >= T.packet ? "soft" : "solid", tone: "blue", pulse: bump(t, T.me, 0.4) }; // soft once the packet sits on it
    const fk = bump(t, ICON[n], 0.6);
    if (fk > 0.001) Object.assign(st, { ring: "blue", ringK: fk });
    if (n !== SRC && t >= ARR[n] && t < GONE[n])
      st = { look: "soft", tone: "green", pulse: bump(t, ARR[n] - 0.1, 0.4) };
    const j = ROUTE.indexOf(n); // the packet's journey: a router it has reached
    if (j > 0 && t >= HOP[j - 1][1]) {
      const arrive = HOP[j - 1][1];
      if (n === DST) return { look: "solid", tone: "green", pulse: bump(t, arrive, 0.4) };
      st = { look: "soft", tone: "green", pulse: bump(t, arrive, 0.4) };
      if (t < HOP[j][0]) Object.assign(st, { ring: "orange", ringK: lin(t, arrive, arrive + 0.3) });
    }
    return st;
  }

  V.scene({
    kicker: "ROUTERS",
    title: ["Routers forward", "one hop at a time"],
    dur: 13,
    caps: [
      [0.4, 3.0, "Every router learns the whole map."],
      [3.2, 7.0, "Each runs Dijkstra and keeps only the first hop."],
      [7.4, 12.4, "A packet moves on one table lookup at a time."],
    ],
    build(stage) {
      const G = A2.graph(stage, {
        nodes: A2.NET.pos,
        edges: A2.NET.edges,
        x: 0,
        y: 40,
        at: { "A-C": 0.25, "B-D": 0.62, "C-D": 0.55 },
        badge: { B: "t", C: "t", D: "bl", E: "br", F: "tr" },
      });
      const names = A2.NET.names;
      const roadKeys = A2.NET.edges.map(([a, b]) => key(a, b));

      // the flood: one ring of "map" icons per distance, with a thin wave travelling out from A
      const DOWN = new Set(["D", "E"]); // icons sit above a router, or below for the two at the bottom
      const icons = A2.obj(names, (n) => {
        const p = G.pt(n);
        const g = A2.mapIcon(p.x, p.y + (DOWN.has(n) ? 62 : -62), 44, "blue");
        G.over.appendChild(g);
        return g;
      });
      const reach = (time) =>
        Math.max(
          ...names
            .filter((n) => ICON[n] === time)
            .map((n) => Math.hypot(G.pt(n).x - G.pt(SRC).x, G.pt(n).y - G.pt(SRC).y)),
        );
      const ringTimes = [...new Set(Object.values(ICON))].sort((a, b) => a - b);
      const waveCurve = ringTimes.map((a) => [a, a === ringTimes[0] ? 0 : reach(a)]);
      const clip = V.s("clipPath", { id: "a2s7-stage" }, V.s("rect", { x: 0, y: 24, width: 936, height: 592 }));
      const wave = V.s("circle", {
        cx: G.pt(SRC).x,
        cy: G.pt(SRC).y,
        r: 1,
        fill: "none",
        "stroke-width": 6,
        "clip-path": "url(#a2s7-stage)",
      });
      wave.style.stroke = L5.tone("blue").c;
      G.under.append(V.s("defs", {}, clip), wave);

      // the table of A, and the heading tags
      const table = A2.table(stage, {
        x: 676,
        y: 76,
        cols: [90, 130],
        head: ["to", "via"],
        rows: TABLE.map((r) => [r.dest, r.next]),
      });
      const algo = A2.tag(stage, { x: 800, y: 40, text: "Dijkstra", tone: "purple" });
      const head = A2.tag(stage, { x: 800, y: 40, text: `${SRC}'s table`, tone: "blue" });

      // the packet, the lookups at D and E, and the arrival
      const packet = A2.token(stage, { text: DST, size: 44, tone: "blue", fs: 28 });
      const looks = [
        { tag: A2.tag(stage, { x: 100, y: 592, text: lookup(HOPS[1]), tone: "orange", solid: true }), a: LOOK_AT[0] },
        { tag: A2.tag(stage, { x: 545, y: 575, text: lookup(HOPS[2]), tone: "orange", solid: true }), a: LOOK_AT[1] },
      ];
      const cost = A2.tag(stage, { x: 600, y: 476, text: `cost ${HOPS[0].cost}`, tone: "green", solid: true });
      const svg = L5.svg(stage);
      const tick = L5.tick(0, 0, 50, "green", { w: 9 });
      svg.append(tick);

      return (t) => {
        // ---- the network builds ----
        const nodes = {};
        names.forEach((n, i) => {
          const a = T.node0 + 0.1 * i;
          nodes[n] = { ...nodeState(n, t), s: 0.8 + 0.2 * pop(t, a), o: fade(t, a, 0.15) };
        });
        const edges = {};
        roadKeys.forEach((k, i) => {
          const a = T.road0 + 0.05 * i;
          const base = { pk: lin(t, T.pill0 + 0.04 * i, T.pill0 + 0.04 * i + 0.45) };
          const on = overlay(k, t);
          edges[k] = on ? { ...base, ...on } : { ...base, tone: null, k: lin(t, a, a + 0.4) };
        });
        const badges = {};
        TREE.forEach(([, v]) => {
          const k = lin(t, ARR[v], ARR[v] + 0.35);
          if (k > 0 && t < GONE[v])
            badges[v] = { text: String(RUN.d[v]), tone: "green", k, o: 1 - fade(t, T.unwind, 0.3) };
        });
        G.update({ nodes, edges, badges });

        // ---- the flood: a wave and the map icons ----
        const wk = A2.curve(t, waveCurve);
        const wo = fade(t, ICON[SRC], 0.1) * (1 - fade(t, ringTimes[ringTimes.length - 1], 0.4));
        wave.setAttribute("r", wk.toFixed(1));
        V.show(wave, wo * 0.55 * (1 - 0.6 * lin(t, ringTimes[0], ringTimes[ringTimes.length - 1])));
        names.forEach((n) => {
          const out = lin(t, ...ICON_OUT);
          V.place(icons[n], {
            s: (0.6 + 0.4 * pop(t, ICON[n], 0.45)) * (1 - 0.2 * out),
            o: fade(t, ICON[n], 0.2) * (1 - out),
          });
        });

        // ---- the table: pops in, rows slide in, the first hop flashes, row F is looked up ----
        const flash = t >= T.flash[0] && t <= T.flash[1];
        const rows = TABLE.map((r, i) => {
          const k = lin(t, T.row0 + T.rowStep * i, T.row0 + T.rowStep * i + 0.4);
          const lit = r.dest === DST && t >= T.rowF && t < DIM_ROW;
          return { k, hl: lit ? "orange" : null, solid: lit };
        });
        const cells = TABLE.map((r) => {
          if (r.dest === DST && t >= DIM_ROW) return [{ tone: "grey" }, { tone: "grey" }];
          return [{}, r.next === VIA && flash ? { tone: "orange" } : {}];
        });
        table.update({ k: pop(t, T.table), rows, cells });
        algo.set({ s: 0.8 + 0.2 * pop(t, T.tree0), o: fade(t, T.tree0, 0.25) * (1 - fade(t, T.table - 0.25, 0.2)) });
        head.set({ s: 0.8 + 0.2 * pop(t, T.table), o: fade(t, T.table, 0.2) });

        // ---- the packet and the two lookups ----
        const j = HOP.findLastIndex(([a]) => t >= a);
        const p = j < 0 ? G.pt(ROUTE[0]) : G.along([ROUTE[j], ROUTE[j + 1]], io(t, ...HOP[j]));
        const gone = lin(t, END, END + 0.15);
        packet.set({
          x: p.x,
          y: p.y,
          s: (0.6 + 0.4 * pop(t, T.packet, 0.4)) * (1 - 0.4 * gone),
          o: fade(t, T.packet, 0.2) * (1 - gone),
        });
        looks.forEach(({ tag, a }) => tag.set({ s: 0.8 + 0.2 * pop(t, a), o: fade(t, a, 0.2) }));
        const tk = lin(t, END + 0.2, END + 0.6);
        L5.drawOn(tick, tk);
        V.place(tick, { x: G.pt(DST).x, y: G.pt(DST).y - 70, s: 0.7 + 0.3 * pop(t, END + 0.2), o: tk > 0 ? 1 : 0 });
        cost.set({ s: 0.8 + 0.2 * pop(t, END + 0.2), o: fade(t, END + 0.2, 0.2) });
      };
    },
  });
})();

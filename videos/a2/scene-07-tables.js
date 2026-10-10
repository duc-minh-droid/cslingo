/* Algorithms phase 2 (algo-2), scene 07: routers forward one hop at a time (link-state routing + forwarding).
   Every router learns the whole six-router map (flood), router A runs Dijkstra and keeps only the FIRST hop of each route
   (its forwarding table), then a packet for F is passed on one table lookup at a time, and each router uses ITS OWN table:
   A's table says "F via D", the panel swaps to D's table ("F via E"), then to E's table ("F via F"). The packet travels along
   the roads between routers (it never covers a router letter) and circles the router while the lookup happens.
   Every number (tree, distances, tables, hops) comes from the A2 helpers and is asserted below. */
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
  // the table of each router the packet visits: the same netTable the lessons use, one row per other router
  const OWN = HOPS.map((h) => A2.netTable(h.at));
  A2.need(
    OWN.every((tb, j) => tb.find((r) => r.dest === DST).next === HOPS[j].next),
    "scene 7: each router's own table gives the next hop of the packet",
  );
  A2.need(OWN[0].map((r) => r.next).join("") === TABLE.map((r) => r.next).join(""), "scene 7: the first table is A's");

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
    done: 11.6, // the packet arrives
  };
  const ICON = { A: 1.6, B: 1.9, D: 1.9, C: 2.2, E: 2.2, F: 2.5 }; // the map icons pop outward from A
  const ICON_OUT = [3.0, 3.4];
  const HOP = [[7.9, 8.6], [9.4, 10.1], [10.9, 11.6]]; // prettier-ignore
  const SWAP = [8.7, 10.2]; // the panel swaps to D's table, then to E's table
  const LOOK = [7.6, 9.1, 10.6]; // when the row for F lights up in A's, D's and E's table
  A2.need(HOP.length === HOPS.length, "scene 7: one hop window per hop");
  const treeAt = (i) => T.tree0 + T.treeStep * i;
  const unwindAt = (i) => T.unwind + 0.05 * (TREE.length - 1 - i);
  const ARR = {}; // when a node's tree road arrives
  const GONE = {}; // when that road has retracted again
  TREE.forEach(([, v], i) => ((ARR[v] = treeAt(i) + T.treeDur), (GONE[v] = unwindAt(i) + 0.2)));
  const DIM = HOP.map(([a]) => a + 0.3); // the used table row dims once the packet has left that router
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
      st = { look: t >= T.packet ? "soft" : "solid", tone: "blue", pulse: bump(t, T.me, 0.4) }; // soft once the packet waits beside it
    if (n === SRC && t >= T.packet && t < HOP[0][0])
      Object.assign(st, { ring: "orange", ringK: lin(t, T.packet, T.packet + 0.3) });
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
    dur: 13.5,
    caps: [
      [0.4, 3.0, "Routers are the places. Every router learns the whole map."],
      [3.2, 7.0, "Each runs Dijkstra and keeps only the first hop."],
      [7.4, 8.6, "A packet for F. A's table says: next hop D."],
      [8.8, 10.2, "D has its own table: next hop E."],
      [10.4, 12.9, "E's table: F is one hop away. Every router uses its own table."],
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
        const g = A2.mapIcon(p.x, p.y + (DOWN.has(n) ? 58 : -62), 64, "blue");
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
      // the wave is an arc that opens towards the right of A, kept short enough to stay inside the stage (round ends, no clipping)
      const wave = V.s("path", { fill: "none", "stroke-width": 6, "stroke-linecap": "round" });
      wave.style.stroke = L5.tone("blue").c;
      G.under.append(wave);
      const arc = (r) => {
        if (r < 4) return "";
        const [cx, cy] = [G.pt(SRC).x, G.pt(SRC).y];
        const th = Math.min(1.2, Math.asin(Math.min(1, 270 / r)));
        const [x, dy] = [cx + r * Math.cos(th), r * Math.sin(th)];
        return `M${x.toFixed(1)} ${(cy - dy).toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x.toFixed(1)} ${(cy + dy).toFixed(1)}`;
      };

      // the tables of the three routers the packet visits (same place, one at a time), and the heading tags
      const tables = OWN.map((tb) =>
        A2.table(stage, { x: 676, y: 76, cols: [90, 130], head: ["to", "via"], rows: tb.map((r) => [r.dest, r.next]) }),
      );
      const algo = A2.tag(stage, { x: 800, y: 40, text: "Dijkstra", tone: "purple" });
      const heads = HOPS.map((h) => A2.tag(stage, { x: 800, y: 40, text: `${h.at}'s table`, tone: "blue" }));
      const appears = [T.table, ...SWAP]; // when each table pops in
      const leaves = [SWAP[0], SWAP[1], 1e6]; // when each table is replaced by the next router's

      // the packet: it rides the road between two routers and circles the router that holds it during the lookup
      const packet = A2.token(stage, { text: DST, size: 44, tone: "blue", fs: 28 });
      const OFF = 74; // how far from a router's centre the packet sits (clear of its letter and ring)
      const dirTo = (a, b) => Math.atan2(G.pt(b).y - G.pt(a).y, G.pt(b).x - G.pt(a).x);
      const at = (n, ang) => ({ x: G.pt(n).x + OFF * Math.cos(ang), y: G.pt(n).y + OFF * Math.sin(ang) });
      const turn = (a, b) => ((((b - a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI; // shortest turn a -> b
      const cost = A2.tag(stage, { x: 600, y: 476, text: `cost ${HOPS[0].cost}`, tone: "green", solid: true });
      const svg = L5.svg(stage);
      const tick = L5.tick(0, 0, 50, "green", { w: 9 });
      svg.append(tick);

      /* where the packet is at time t: before the first hop it waits beside A on the road to D; during a hop it rides the road
         from the spot beside one router to the spot beside the next; between two hops it circles the router it has reached,
         from the road it came by to the road it leaves by (that is the table lookup) */
      function packetPos(t) {
        const j = HOP.findLastIndex(([a]) => t >= a); // the hop under way, or the last one finished; -1 before the first
        if (j < 0) return at(ROUTE[0], dirTo(ROUTE[0], ROUTE[1]));
        const [x, y] = [ROUTE[j], ROUTE[j + 1]];
        const [a0, b0] = HOP[j];
        if (t < b0 || j === HOP.length - 1) return A2.lerpPt(at(x, dirTo(x, y)), at(y, dirTo(y, x)), io(t, a0, b0));
        const [c0, c1] = [dirTo(y, x), dirTo(y, ROUTE[j + 2])];
        return at(y, c0 + turn(c0, c1) * io(t, b0 + 0.05, HOP[j + 1][0] - 0.1));
      }

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
        wave.setAttribute("d", arc(wk));
        V.show(wave, wo * 0.55 * (1 - 0.6 * lin(t, ringTimes[0], ringTimes[ringTimes.length - 1])));
        names.forEach((n) => {
          const out = lin(t, ...ICON_OUT);
          V.place(icons[n], {
            s: (0.6 + 0.4 * pop(t, ICON[n], 0.45)) * (1 - 0.2 * out),
            o: fade(t, ICON[n], 0.2) * (1 - out),
          });
        });

        // ---- A's table: pops in, rows slide in, the first hop flashes, row F is looked up; then D's and E's replace it ----
        const flash = t >= T.flash[0] && t <= T.flash[1];
        tables.forEach((tb, w) => {
          const used = (r) => r.dest === DST && t >= LOOK[w] && t < DIM[w]; // the row being looked up
          const rows = OWN[w].map((r, i) => {
            const k = w ? 1 : lin(t, T.row0 + T.rowStep * i, T.row0 + T.rowStep * i + 0.4);
            return { k, hl: used(r) ? "orange" : null, solid: used(r) };
          });
          const cells = OWN[w].map((r) => {
            if (r.dest === DST && t >= DIM[w]) return [{ tone: "grey" }, { tone: "grey" }];
            return [{}, !w && r.next === VIA && flash ? { tone: "orange" } : {}];
          });
          const gone = lin(t, leaves[w], leaves[w] + 0.25);
          tb.update({ k: pop(t, appears[w]), o: 1 - gone, rows, cells });
          heads[w].set({ s: 0.8 + 0.2 * pop(t, appears[w]), o: fade(t, appears[w], 0.2) * (1 - gone) });
        });
        algo.set({ s: 0.8 + 0.2 * pop(t, T.tree0), o: fade(t, T.tree0, 0.25) * (1 - fade(t, T.table - 0.25, 0.2)) });

        // ---- the packet ----
        const p = packetPos(t);
        const gone = lin(t, END, END + 0.15);
        packet.set({
          x: p.x,
          y: p.y,
          s: (0.6 + 0.4 * pop(t, T.packet, 0.4)) * (1 - 0.4 * gone),
          o: fade(t, T.packet, 0.2) * (1 - gone),
        });
        const tk = lin(t, END + 0.2, END + 0.6);
        L5.drawOn(tick, tk);
        V.place(tick, { x: G.pt(DST).x, y: G.pt(DST).y - 70, s: 0.7 + 0.3 * pop(t, END + 0.2), o: tk > 0 ? 1 : 0 });
        cost.set({ s: 0.8 + 0.2 * pop(t, END + 0.2), o: fade(t, END + 0.2, 0.2) });
      };
    },
  });
})();

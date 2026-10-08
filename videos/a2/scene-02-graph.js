/* Algorithms phase 2 (algo-2), scene 02: a map is a graph. Places are nodes, roads are edges with a cost, a route adds its roads up.
   Route A-C-E has the fewest roads (2) but costs 9; route A-C-B-D-E has four roads and costs 8; there are 7 routes in all.
   Every number comes from A2.ROUTES (asserted below); the road keys come from the route paths. */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  const { pop, fade, lin, bump } = A2;

  // ---------- data (all from the helpers, asserted here) ----------
  const R1 = A2.ROUTES.find((r) => r.path === "ACE"); // the fewest roads
  const R2 = A2.ROUTES[0]; // the cheapest
  A2.need(A2.ROUTES.length === 7, "scene 2: 7 routes from A to E");
  A2.need(R1 && R1.legs.join() === "2,7" && R1.cost === 9 && R1.hops === 2, "scene 2: route A-C-E is 2 + 7 = 9");
  A2.need(
    R2.path === "ACBDE" && R2.legs.join() === "2,1,3,2" && R2.cost === 8 && R2.hops === 4,
    "scene 2: A-C-B-D-E is 8",
  );
  A2.need(
    A2.ROUTES.every((r) => r.hops >= R1.hops) && A2.ROUTES.every((r) => r.cost >= R2.cost),
    "scene 2: A-C-E has the fewest roads, A-C-B-D-E the lowest cost",
  );
  A2.need(
    R1.legs.reduce((a, b) => a + b, 0) === R1.cost && R2.legs.reduce((a, b) => a + b, 0) === R2.cost,
    "scene 2: sums",
  );

  // ---------- timeline (local seconds) ----------
  const T = {
    node0: 0.25, // node i pops at node0 + 0.15 i
    road0: 0.9, // road i draws 0.5 s from road0 + 0.12 i
    pill0: 2.3, // weight pill i pops at pill0 + 0.1 i
    marks: 3.5, // start and goal
    r1: 4.0, // route 1: leg i draws 0.5 s from r1 + 0.6 i
    r1end: 5.1,
    retract: 5.9, // route 1 pulls back: the last leg first, 0.2 s each
    r2: 6.4, // route 2: leg i draws 0.425 s from r2 + 0.425 i
    r2end: 8.1,
    wave: 8.2, // the route turns green, 0.15 s per road
    seven: 9.2,
  };
  const DR2 = 0.425;
  const legStart1 = (i) => T.r1 + 0.6 * i;
  const legStart2 = (i) => T.r2 + DR2 * i;
  const waveAt = (i) => T.wave + 0.15 * i;

  const legsOf = (G, r) =>
    r.path
      .split("")
      .slice(1)
      .map((to, i) => {
        const e = G.edge(`${r.path[i]}-${to}`);
        return { key: `${e.a}-${e.b}`, from: r.path[i], to };
      });
  const sumText = (r, n, done) => r.legs.slice(0, n).join(" + ") + (done ? ` = ${r.cost}` : "");

  V.scene({
    kicker: "THE PROBLEM",
    title: ["A map is a graph:", "every road has a cost"],
    dur: 11,
    caps: [
      [0.4, 3.2, "A map is places joined by roads."],
      [3.4, 6.2, "Each road has a cost. A route adds them up."],
      [6.4, 9.0, "The fewest roads is not always the cheapest."],
      [9.2, 10.8, "There are 7 routes. We need a method."],
    ],
    build(stage) {
      const G = A2.graph(stage, { nodes: A2.DIJ.pos, edges: A2.DIJ.edges, x: 158, y: 20, at: { "A-C": 0.38 } });
      const L1 = legsOf(G, R1);
      const L2 = legsOf(G, R2);
      const roadKeys = A2.DIJ.edges.map(([a, b]) => `${a}-${b}`);
      const names = A2.DIJ.names;

      const sum = A2.tag(stage, { x: 468, y: 40, text: "", tone: "blue", fs: 30 });
      const start = A2.tag(stage, { x: 166, y: 254, text: "start", tone: "blue", solid: true });
      const goal = A2.tag(stage, { x: 835, y: 580, text: "goal", tone: "orange", solid: true });
      const seven = A2.tag(stage, { x: 150, y: 596, text: `${A2.ROUTES.length} routes in all`, tone: "grey" });
      const svg = L5.svg(stage);
      const tick = L5.tick(812, 506, 56, "green");
      svg.append(tick);
      const dots = A2.ROUTES.map((r, i) => {
        const d = A2.dot(150 + (i - 3) * 36, 548, 11, i === 0 ? "green" : "grey");
        svg.append(d);
        return d;
      });

      /* the coloured stretch of a road, or null when no route is on it (the grey road is then drawn by G.update) */
      function overlay(key, t) {
        const [i1, i2] = [L1.findIndex((l) => l.key === key), L2.findIndex((l) => l.key === key)];
        let k1 = 0;
        if (i1 >= 0) {
          const out = lin(t, T.retract + 0.2 * (1 - i1), T.retract + 0.2 * (2 - i1));
          k1 = lin(t, legStart1(i1), legStart1(i1) + 0.5) * (1 - out);
        }
        const k2 = i2 >= 0 ? lin(t, legStart2(i2), legStart2(i2) + DR2) : 0;
        if (k2 > 0.001) {
          const green = t >= waveAt(i2);
          return {
            tone: green ? "green" : "blue",
            k: k2,
            from: L2[i2].from,
            w: 12 + 2 * lin(t, waveAt(i2), waveAt(i2) + 0.2),
          };
        }
        if (k1 > 0.001) return { tone: "blue", k: k1, from: L1[i1].from, w: 12 };
        return null;
      }

      /* what a place looks like: dim until the marks, then start and goal, then reached by a route (blue), then final (green) */
      function nodeLook(n, t) {
        const marked = t >= T.marks;
        if (n === "A" && marked) return { look: "solid", tone: "blue", pulse: bump(t, T.marks, 0.4) };
        if (n === "E" && marked) {
          const hit = Math.max(bump(t, T.r1end, 0.4), bump(t, T.r2end, 0.4), bump(t, waveAt(3), 0.4));
          return { look: "solid", tone: "orange", pulse: hit };
        }
        const i1 = L1.findIndex((l) => l.to === n && l.to !== "E");
        if (i1 >= 0 && t >= T.r1 + 0.5 && t < T.retract + 0.2) {
          return { look: "soft", tone: "blue", pulse: bump(t, T.r1 + 0.5, 0.4) };
        }
        const i2 = L2.findIndex((l) => l.to === n && l.to !== "E");
        if (i2 >= 0) {
          const reached = legStart2(i2) + DR2;
          if (t >= waveAt(i2)) return { look: "soft", tone: "green", pulse: bump(t, waveAt(i2), 0.4) };
          if (t >= reached) return { look: "soft", tone: "blue", pulse: bump(t, reached, 0.4) };
        }
        return { look: "grey" };
      }

      return (t) => {
        // ---- the map: places pop in, roads draw on, costs pop in ----
        const nodes = {};
        names.forEach((n, i) => {
          const a = T.node0 + 0.15 * i;
          nodes[n] = { ...nodeLook(n, t), s: 0.8 + 0.2 * pop(t, a), o: fade(t, a) };
        });
        const edges = {};
        roadKeys.forEach((key, i) => {
          const a = T.road0 + 0.12 * i;
          const base = { pk: lin(t, T.pill0 + 0.1 * i, T.pill0 + 0.1 * i + 0.45) };
          const on = overlay(key, t);
          edges[key] = on ? { ...base, ...on } : { ...base, tone: null, k: lin(t, a, a + 0.5) };
        });
        G.update({ nodes, edges });

        // ---- start and goal ----
        const mk = (tag) => tag.set({ s: 0.8 + 0.2 * pop(t, T.marks + 0.05), o: fade(t, T.marks + 0.05, 0.2) });
        mk(start);
        mk(goal);

        // ---- the running cost of the route being tried ----
        let st = { o: 0 };
        if (t >= T.r1 && t < T.retract + 0.4) {
          const n = t >= legStart1(1) ? 2 : 1;
          st = {
            text: sumText(R1, n, t >= T.r1end),
            tone: "blue",
            s: 0.8 + 0.2 * pop(t, T.r1),
            o: Math.min(fade(t, T.r1, 0.2), 1 - lin(t, T.retract, T.retract + 0.4)),
          };
        } else if (t >= T.r2) {
          const n = Math.min(L2.length, Math.floor((t - T.r2) / DR2) + 1);
          const done = t >= waveAt(L2.length - 1) + 0.05;
          st = {
            text: sumText(R2, n, t >= T.r2end),
            tone: done ? "green" : "blue",
            solid: done,
            s: (0.8 + 0.2 * pop(t, T.r2)) * (1 + 0.1 * bump(t, waveAt(L2.length - 1) + 0.05, 0.4)),
            o: fade(t, T.r2, 0.2),
          };
        }
        sum.set(st);

        // ---- the tick, and the count of all routes ----
        const tk = lin(t, waveAt(3) + 0.15, waveAt(3) + 0.55);
        L5.drawOn(tick, tk);
        V.place(tick, { s: 0.7 + 0.3 * pop(t, waveAt(3) + 0.15), o: tk > 0 ? 1 : 0 });
        dots.forEach((d, i) => {
          const a = T.seven + 0.1 * i;
          V.place(d, { s: 0.6 + 0.4 * pop(t, a, 0.4), o: fade(t, a, 0.15) });
        });
        seven.set({ s: 0.8 + 0.2 * pop(t, T.seven + 0.7), o: fade(t, T.seven + 0.7, 0.2) });
      };
    },
  });
})();

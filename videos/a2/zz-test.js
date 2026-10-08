/* TEMPORARY layout checks for the specs (delete before finishing). */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  V.scenes.length = 0;

  // scene 3 layout, state after round C (t ~ 7.8)
  V.scene({
    kicker: "DIJKSTRA",
    title: ["Settle the closest node,", "then relax its roads"],
    dur: 10,
    caps: [[0.2, 9, "Then check its roads. A shorter way replaces the old distance."]],
    build(stage) {
      const G = A2.graph(stage, {
        nodes: A2.DIJ.pos,
        edges: A2.DIJ.edges,
        badge: { A: "t", B: "tl", C: "bl", D: "tr", E: "tr" },
        at: { "A-C": 0.38 },
      });
      const waiting = A2.list(stage, { x: 664, y: 20, head: "waiting room", headTone: "purple", keys: A2.DIJ.names });
      const settled = A2.list(stage, { x: 664, y: 262, head: "settled", headTone: "green", keys: A2.DIJ.names });
      return (t) => {
        const run = A2.DIJ_RUN;
        const n = t < 3 ? 2 : t < 6 ? 3 : 5;
        const sn = run.snap(n);
        const nodes = {};
        const badges = {};
        const edges = {};
        A2.DIJ.names.forEach((v) => {
          const st = sn.settled.includes(v) ? "settled" : sn.dist[v] < A2.INF ? "waiting" : "unseen";
          nodes[v] =
            st === "settled"
              ? { look: "soft", tone: "green" }
              : st === "waiting"
                ? { look: "soft", tone: "purple" }
                : { look: "grey" };
          badges[v] = {
            text: A2.fmt(sn.dist[v]),
            tone: st === "settled" ? "green" : st === "waiting" ? "purple" : "grey",
          };
        });
        Object.entries(sn.parent).forEach(
          ([v, u]) => (edges[`${u}-${v}`] = { tone: sn.settled.includes(v) ? "green" : "purple", w: 12 }),
        );
        if (t > 3 && t < 6) {
          nodes.B = { look: "solid", tone: "orange", ring: "orange" };
          edges["C-B"] = { tone: "blue", w: 12, text: "2 + 1 = 3", pill: "blue", from: "C" };
          badges.B = { text: "4", tone: "purple", strike: 1 };
        }
        G.update({ nodes, badges, edges });
        waiting.update({
          items: Object.fromEntries(
            sn.waiting.map((v, i) => [v, { text: `${v} = ${sn.dist[v]}`, slot: i, tone: "purple" }]),
          ),
        });
        settled.update({
          items: Object.fromEntries(
            sn.settled.map((v, i) => [v, { text: `${v} = ${sn.dist[v]}`, slot: i, tone: "green" }]),
          ),
        });
      };
    },
  });

  // scene 4 layout beat A
  V.scene({
    kicker: "WHY IT WORKS",
    title: ["Why settled means final,", "and when it breaks"],
    dur: 10,
    caps: [[0.2, 9, "Any other way to C goes via B, and B is already further."]],
    build(stage) {
      const Ga = A2.graph(stage, { nodes: A2.TRI.pos, edges: A2.SAFE.edges });
      const bar1 = A2.bar(stage, { x: 560, y: 210, unit: 70, segs: [{ v: 2, tone: "green", text: "2" }] });
      const bar2 = A2.bar(stage, {
        x: 560,
        y: 330,
        unit: 70,
        segs: [
          { v: 4, tone: "blue", text: "4" },
          { v: 1, tone: "blue", text: "1" },
        ],
      });
      const t1 = A2.tag(stage, { x: 610, y: 172, text: "direct", tone: "green" });
      const t2 = A2.tag(stage, { x: 655, y: 292, text: "detour via B", tone: "blue" });
      const t3 = A2.tag(stage, { x: 735, y: 420, text: "4 + 1 = 5", tone: "blue" });
      const mk = V.s("svg", {
        width: 936,
        height: 640,
        style: { position: "absolute", left: "0px", top: "0px", overflow: "visible" },
      });
      mk.append(
        V.s("path", {
          d: "M700 196V400",
          "stroke-width": 4,
          "stroke-dasharray": "10 8",
          style: { stroke: "var(--amber)" },
        }),
      );
      stage.append(mk);
      const tk = L5.tick(470, 560, 48, "green");
      mk.append(tk);
      return () => {
        Ga.update({
          nodes: {
            A: { look: "soft", tone: "green" },
            B: { look: "soft", tone: "purple" },
            C: { look: "soft", tone: "purple", ring: "orange" },
          },
          badges: {
            A: { text: "0", tone: "green" },
            B: { text: "4", tone: "purple" },
            C: { text: "2", tone: "purple" },
          },
          edges: { "A-B": { tone: "blue", dash: true, w: 12 }, "C-B": { tone: "blue", dash: true, w: 12, from: "B" } },
        });
        bar1.update({});
        bar2.update({});
        [t1, t2, t3].forEach((t) => t.set({}));
      };
    },
  });

  // scene 5 layout
  V.scene({
    kicker: "A*",
    title: ["A* is Dijkstra", "plus a compass"],
    dur: 10,
    caps: [[0.2, 9, "Score each cell: cost so far g, plus a guess h."]],
    build(stage) {
      const Gd = A2.grid(stage, { x: 81, y: 70, cell: 72, gap: 6, fs: 28 });
      const g = A2.tag(stage, { x: 190, y: 34, text: "g = 1", tone: "green" });
      const h = A2.tag(stage, { x: 480, y: 34, text: "h = 6", tone: "purple" });
      const f = A2.tag(stage, { x: 770, y: 34, text: "f = 7", tone: "orange", solid: true });
      const p = A2.tag(stage, { x: 335, y: 34, text: "+", tone: "grey" });
      const e = A2.tag(stage, { x: 625, y: 34, text: "=", tone: "grey" });
      return (t) => {
        [g, h, f, p, e].forEach((x) => x.set({}));
        const base = A2.gridPaint(A2.RUNS.astar, t < 5 ? 1 : 13, { nums: true });
        Gd.update({
          cells: (cx, cy, key) =>
            cx === 2 && cy === 3 && t < 5 ? { ...base(cx, cy, key), ring: "orange" } : base(cx, cy, key),
        });
      };
    },
  });

  // scene 6 layout
  V.scene({
    kicker: "A* VS DIJKSTRA",
    title: ["Same route,", "far less work"],
    dur: 10,
    caps: [[0.2, 9, "But its guess must never be higher than the true cost."]],
    build(stage) {
      const GL = A2.grid(stage, { x: 20, y: 66, cell: 38, gap: 4, fs: 28 });
      const GR = A2.grid(stage, { x: 500, y: 66, cell: 38, gap: 4, fs: 28 });
      const tags = [
        A2.tag(stage, { x: 228, y: 34, text: "Dijkstra: h = 0", tone: "grey" }),
        A2.tag(stage, { x: 708, y: 34, text: "A*: h = guess", tone: "purple" }),
        A2.tag(stage, { x: 150, y: 392, text: "59 cells", tone: "red", solid: true, fs: 36 }),
        A2.tag(stage, { x: 630, y: 392, text: "20 cells", tone: "green", solid: true, fs: 36 }),
        A2.tag(stage, { x: 330, y: 392, text: "cost 11", tone: "green", fs: 36 }),
        A2.tag(stage, { x: 810, y: 392, text: "cost 11", tone: "green", fs: 36 }),
        A2.tag(stage, { x: 170, y: 472, text: "true cost left", tone: "green" }),
        A2.tag(stage, { x: 170, y: 530, text: "h, never too high", tone: "purple" }),
        A2.tag(stage, { x: 170, y: 588, text: "2 x h, too high", tone: "red", solid: true }),
      ];
      const bars = [
        A2.bar(stage, { x: 330, y: 450, unit: 40, segs: [{ v: 11, tone: "green", text: "11" }] }),
        A2.bar(stage, { x: 330, y: 508, unit: 40, segs: [{ v: 7, tone: "purple", text: "7" }] }),
        A2.bar(stage, { x: 330, y: 566, unit: 40, segs: [{ v: 14, tone: "red", text: "14" }] }),
      ];
      return () => {
        GL.update({ o: 0.35, cells: A2.gridPaint(A2.RUNS.dijkstra, 59, { pathK: 1 }) });
        GR.update({ o: 0.35, cells: A2.gridPaint(A2.RUNS.astar, 20, { pathK: 1 }) });
        tags.forEach((t) => t.set({}));
        bars.forEach((b) => b.update({}));
      };
    },
  });

  // scene 7 layout
  V.scene({
    kicker: "ROUTERS",
    title: ["Routers forward", "one hop at a time"],
    dur: 10,
    caps: [[0.2, 9, "A packet moves on one table lookup at a time."]],
    build(stage) {
      const G = A2.graph(stage, {
        nodes: A2.NET.pos,
        edges: A2.NET.edges,
        x: 0,
        y: 40,
        at: { "A-C": 0.25, "B-D": 0.3, "C-D": 0.55 },
      });
      const T = A2.table(stage, {
        x: 676,
        y: 70,
        cols: [90, 130],
        head: ["to", "via"],
        rows: A2.TABLE_A.map((r) => [r.dest, r.next]),
      });
      const ttag = A2.tag(stage, { x: 800, y: 34, text: "A's table", tone: "blue" });
      const pk = A2.token(stage, { text: "F", size: 44 });
      const l1 = A2.tag(stage, { x: 100, y: 592, text: "F via E", tone: "orange" });
      const l2 = A2.tag(stage, { x: 545, y: 575, text: "F: direct", tone: "orange" });
      const svg = V.s("svg", {
        width: 936,
        height: 640,
        style: { position: "absolute", left: "0px", top: "0px", overflow: "visible" },
      });
      stage.append(svg);
      const pos = { A: [50, 278], B: [210, 78], C: [430, 128], D: [210, 602], E: [430, 572], F: [590, 278] };
      Object.values(pos).forEach(([x, y]) => svg.append(A2.mapIcon(x, y, 44, "blue")));
      return (t) => {
        const tree = A2.netDijkstra("A");
        const edges = {};
        tree.tree.forEach(([u, v]) => (edges[`${u}-${v}`] = { tone: "green", w: 12 }));
        const badges = {};
        Object.entries(tree.d).forEach(([v, d]) => v !== "A" && (badges[v] = { text: d, tone: "green" }));
        G.update({ nodes: { A: { look: "solid", tone: "blue" } }, edges, badges });
        T.update({ rows: [0, 0, 0, 0, { hl: "orange", solid: true }].map((r) => r || {}) });
        [ttag, l1, l2].forEach((x) => x.set({}));
        const p = G.along(["A", "D", "E", "F"], 0.5);
        pk.set({ x: p.x, y: p.y });
      };
    },
  });

  // scene 8 layout
  V.scene({
    kicker: "NO MAP",
    title: ["Routing without a map:", "ask your neighbours"],
    dur: 10,
    caps: [[0.2, 9, "Each says how far F is. A adds its own road cost."]],
    build(stage) {
      const G = A2.graph(stage, {
        nodes: { A: [110, 330], B: [400, 130], C: [400, 330], D: [400, 530], F: [820, 330] },
        edges: [
          ["A", "B", 3],
          ["A", "C", 6],
          ["A", "D", 2],
          ["B", "F", null],
          ["C", "F", null],
          ["D", "F", null],
        ],
      });
      const T = A2.table(stage, {
        x: 12,
        y: 500,
        cols: [80, 100, 100],
        head: ["to", "cost", "via"],
        rows: [["F", "7", "D"]],
        rowH: 48,
      });
      return () => {
        G.update({
          nodes: {
            A: { look: "solid", tone: "blue" },
            F: { look: "solid", tone: "orange" },
            D: { look: "soft", tone: "blue" },
          },
          edges: {
            "A-B": { text: "3 + 5 = 8", pill: "blue", ps: 1.1 },
            "A-C": { text: "6 + 3 = 9", pill: "blue" },
            "A-D": { text: "2 + 5 = 7", pill: "orange", tone: "green", w: 14 },
            "B-F": { dash: true, tone: "blue", text: "5" },
            "C-F": { dash: true, tone: "blue", text: "3" },
            "D-F": { dash: true, tone: "blue", text: "5" },
          },
        });
        T.update({ rows: [{ hl: "orange" }] });
      };
    },
  });

  // scene 9 layout
  V.scene({
    kicker: "BAD NEWS",
    title: ["When a road breaks,", "the gossip can loop"],
    dur: 10,
    caps: [[0.2, 9, "The cost creeps up, one step at a time."]],
    build(stage) {
      const G = A2.graph(stage, {
        nodes: { A: [140, 230], B: [468, 230], C: [796, 230] },
        edges: [
          ["A", "B", 1],
          ["B", "C", 1],
        ],
      });
      const bar = A2.bar(stage, { x: 52, y: 470, unit: 52, segs: [{ v: 16, tone: "red", text: "" }] });
      const tags = [
        A2.tag(stage, { x: 140, y: 330, text: "C: 6 via B", tone: "red" }),
        A2.tag(stage, { x: 468, y: 330, text: "C: ∞", tone: "red", solid: true }),
        A2.tag(stage, { x: 150, y: 440, text: "cost of C", tone: "grey" }),
        A2.tag(stage, { x: 700, y: 540, text: "RIP: 16 = ∞", tone: "red" }),
        A2.tag(stage, { x: 304, y: 160, text: "C: 5", tone: "blue" }),
      ];
      const pk = A2.token(stage, { size: 40 });
      return () => {
        G.update({
          nodes: {
            C: { look: "solid", tone: "orange" },
            A: { look: "soft", tone: "blue" },
            B: { look: "soft", tone: "blue" },
          },
          edges: { "B-C": { cut: 1, tone: "red" } },
        });
        bar.update({ k: 6 / 16 });
        tags.forEach((t) => t.set({}));
        pk.set({ x: 304, y: 230 });
      };
    },
  });
  // scene 5 with the real schedule
  V.scene({
    kicker: "A*",
    title: ["A* is Dijkstra", "plus a compass"],
    dur: 13,
    caps: [[0.2, 9, "It expands the lowest score, so it heads for the goal."]],
    build(stage) {
      const Gd = A2.grid(stage, { x: 81, y: 70, cell: 72, gap: 6, fs: 28 });
      return (t) => {
        const n = A2.curve(t, [
          [3.0, 0],
          [3.4, 1],
          [4.4, 1],
          [4.9, 2],
          [5.4, 3],
          [5.9, 4],
          [7.7, 13],
          [9.8, 20],
        ]);
        Gd.update({ cells: A2.gridPaint(A2.RUNS.astar, n, { nums: true, pathK: A2.lin(t, 10.0, 11.4) }) });
      };
    },
  });
  // bars with align
  V.scene({
    kicker: "BAR",
    title: ["Bars", "test"],
    dur: 5,
    caps: [[0.2, 4, "x"]],
    build(stage) {
      const bar2 = A2.bar(stage, {
        x: 560,
        y: 330,
        unit: 70,
        segs: [
          { v: 4, tone: "blue", text: "4", align: "right" },
          { v: 1, tone: "blue", text: "1" },
        ],
      });
      const tg = A2.tag(stage, { x: 300, y: 300, text: "C: ∞ and RIP: 16 = ∞", tone: "red" });
      return () => {
        bar2.update({});
        tg.set({});
      };
    },
  });
  V.scene({
    kicker: "DIRECTED",
    title: ["Partial", "draws"],
    dur: 5,
    caps: [[0.2, 4, "x"]],
    build(stage) {
      const G = A2.graph(stage, { nodes: A2.TRI.pos, edges: A2.NEG.edges, directed: true, scale: 0.9, x: 0, y: 10 });
      const H = A2.graph(stage, {
        nodes: { A: [560, 100], B: [800, 100], C: [800, 400] },
        edges: [
          ["A", "B", 4],
          ["B", "C", 2],
          ["A", "C", 7],
        ],
      });
      return () => {
        G.update({
          edges: {
            "A-B": { k: 0.3, tone: "blue", w: 12 },
            "A-C": { k: 0.65, tone: "green", w: 12 },
            "C-B": { k: 1, tone: "red", w: 12 },
          },
          nodes: { B: { ring: "orange", ringK: 0.4 } },
        });
        H.update({
          edges: {
            "A-B": { cut: 0.4, tone: "red" },
            "B-C": { k: 0.5, from: "C", tone: "blue", w: 12 },
            "A-B": { cut: 0.6, tone: "red" },
            "A-C": { dash: "dots", tone: "purple", w: 12 },
          },
          nodes: { A: { look: "ghost", tone: "purple" }, C: { look: "solid", tone: "green", pulse: 0.5 } },
        });
      };
    },
  });
})();

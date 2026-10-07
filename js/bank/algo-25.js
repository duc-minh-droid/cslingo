(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { C, L, P, R, SVG, T, col, dijkRun, hit, ink, mapState, node, pk, tint, wpill } = partScope;
  const B = NIC.bank;

  // 2. relaxing the roads out of a freshly settled node
  const hubFig = (() => {
    const hub = [170, 124],
      sat = { P: [170, 28], Q: [280, 76], R: [280, 176], S: [170, 224], T: [60, 124] };
    const road = { P: 3, Q: 4, R: 2, S: 1, T: 6 },
      now = { P: ["9", null], Q: ["9", null], R: ["2, settled", "teal"], S: ["∞", null], T: ["10", null] };
    let b = "";
    Object.entries(sat).forEach(([k, [x, y]]) => {
      b += L(hub[0], hub[1], x, y, { sw: 2.5 }) + wpill((hub[0] + x) / 2, (hub[1] + y) / 2, road[k]);
    });
    b +=
      C(hub[0], hub[1], 27, { fill: tint("teal"), stroke: col("teal") }) +
      T(hub[0], hub[1] - 2, "X", { sz: 16, c: "var(--ink)", w: 900 }) +
      T(hub[0], hub[1] + 15, "5", { sz: 13, c: ink("teal"), w: 900 });
    Object.entries(sat).forEach(([k, [x, y]]) => {
      const [t, c] = now[k];
      b += node(x, y, k, { fill: c, stroke: c });
      b +=
        k === "T"
          ? T(x, y + 36, "now " + t, { sz: 13, c: c ? ink(c) : "var(--text)" })
          : T(x + 28, y + 5, "now " + t, { a: "start", sz: 13, c: c ? ink(c) : "var(--text)" });
    });
    b += T(330, 124, "X is settled at 5.", { a: "start", sz: 13, c: ink("teal") });
    return SVG(430, 252, b, "Node X, settled at 5, with five neighbours and the road lengths to them");
  })();

  // 3. shortest-path tree (verified: roads S-A 2, S-B 4, A-C 3, A-D 7, B-D 4, B-E 3, C-D 6, D-F 2, E-F 6)
  const treeRun = dijkRun(
    [
      ["S", "A", 2],
      ["S", "B", 4],
      ["A", "C", 3],
      ["A", "D", 7],
      ["B", "D", 4],
      ["B", "E", 3],
      ["C", "D", 6],
      ["D", "F", 2],
      ["E", "F", 6],
    ],
    "S",
  );
  const treeFig = (() => {
    const pos = {
      S: [250, 28],
      A: [130, 100],
      B: [370, 100],
      C: [130, 176],
      D: [310, 176],
      E: [430, 176],
      F: [310, 252],
    };
    const tree = [
      ["S", "A", 2],
      ["S", "B", 4],
      ["A", "C", 3],
      ["B", "D", 4],
      ["B", "E", 3],
      ["D", "F", 2],
    ];
    let b = "";
    tree.forEach(([u, v]) => (b += L(pos[u][0], pos[u][1], pos[v][0], pos[v][1], { sw: 3, stroke: "var(--line-2)" })));
    tree.forEach(([u, v, w]) => (b += wpill((pos[u][0] + pos[v][0]) / 2, (pos[u][1] + pos[v][1]) / 2, w)));
    Object.entries(pos).forEach(([k, [x, y]]) => {
      const sh = k === "S";
      b +=
        (sh ? "" : "") +
        (k === "S"
          ? node(x, y, k, { fill: "teal", stroke: "teal" })
          : pk(
              k,
              C(x, y, 19, { fill: "var(--panel)", stroke: "var(--line-2)" }) +
                T(x, y + 5, k, { sz: 15, c: "var(--ink)", w: 900 }),
            ));
      b += T(x + 28, y + 5, String(treeRun.dist[k]), { a: "start", sz: 14, c: ink("amber"), w: 900 });
    });
    b += T(250, 284, "number beside a node = its shortest distance from S", { sz: 12, c: "var(--text-faint)" });
    return SVG(500, 292, b, "The shortest-path tree from S, with each node's distance");
  })();

  // 4. distance each node had when it was settled, in settling order
  const settleLog = [
    ["S", 0],
    ["A", 2],
    ["B", 3],
    ["C", 3],
    ["D", 6],
    ["E", 5],
    ["F", 8],
    ["G", 9],
  ];
  const settlePlot = (() => {
    const x0 = 56,
      w = 424,
      y0 = 16,
      h = 200,
      X = (i) => x0 + 26 + i * ((w - 52) / 7),
      Y = (v) => y0 + h - (v / 10) * h;
    let b = R(x0, y0, w, h, { rx: 4 });
    [0, 2, 4, 6, 8, 10].forEach(
      (v) =>
        (b +=
          L(x0, Y(v), x0 + w, Y(v), { sw: 1, stroke: "var(--line)" }) +
          T(x0 - 8, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })),
    );
    b += P(settleLog.map(([, v], i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" "), {
      stroke: "var(--line-2)",
      sw: 2.5,
    });
    settleLog.forEach(([k, v], i) => {
      b +=
        pk("p" + (i + 1), C(X(i), Y(v), 11, { fill: tint("blue"), stroke: col("blue"), sw: 3 })) +
        T(X(i), y0 + h + 20, k, { sz: 15, c: "var(--ink)", w: 900 });
    });
    b +=
      T(x0 + w / 2, y0 + h + 42, "nodes in the order they were settled", { sz: 12, c: "var(--text-faint)" }) +
      T(14, y0 + h / 2, "distance", { sz: 12, c: "var(--text-faint)" }).replace(
        "<text ",
        `<text transform="rotate(-90 14 ${y0 + h / 2})" `,
      );
    return SVG(500, y0 + h + 52, b, "The distance of each node when it was settled, in order");
  })();

  // 5. nested regions: settled, waiting room, not reached
  const regionFig = (() => {
    const nodes = {
      S: [88, 104, "0"],
      C: [88, 170, "2"],
      B: [88, 236, "3"],
      D: [220, 104, "8"],
      H: [220, 170, "9"],
      E: [220, 236, "10"],
      F: [390, 130, "∞"],
      G: [390, 220, "∞"],
    };
    let b =
      R(6, 6, 488, 288, { rx: 22, fill: "var(--bg-2)", dash: "8 6" }) +
      T(400, 36, "not reached yet", { sz: 13, c: "var(--text-dim)" });
    b +=
      R(16, 46, 286, 240, { rx: 20, fill: tint("amber"), stroke: col("amber") }) +
      T(224, 68, "waiting room", { sz: 13, c: ink("amber") });
    b +=
      R(26, 76, 124, 200, { rx: 16, fill: tint("teal"), stroke: col("teal") }) +
      T(88, 94, "settled", { sz: 13, c: ink("teal") });
    Object.entries(nodes).forEach(([k, [x, y, d]]) => {
      b +=
        pk(
          k,
          C(x, y, 19, { fill: "var(--panel)", stroke: "var(--line-2)" }) +
            T(x, y + 5, k, { sz: 15, c: "var(--ink)", w: 900 }),
        ) + T(x + 28, y + 5, d, { a: "start", sz: 14, c: "var(--text)", w: 900 });
    });
    return SVG(500, 300, b, "Eight nodes: three settled, three in the waiting room, two not reached");
  })();

  // 6. tentative distance of each node after each settle (roads S-A 1, S-B 4, S-C 9, A-B 2, A-C 5, B-C 2, B-D 7, C-D 1)
  const stepRun = (() => {
    const edges = [
      ["S", "A", 1],
      ["S", "B", 4],
      ["S", "C", 9],
      ["A", "B", 2],
      ["A", "C", 5],
      ["B", "C", 2],
      ["B", "D", 7],
      ["C", "D", 1],
    ];
    const adj = {};
    edges.forEach(([a, b, w]) => {
      (adj[a] = adj[a] || []).push([b, w]);
      (adj[b] = adj[b] || []).push([a, w]);
    });
    const dist = { S: 0, A: Infinity, B: Infinity, C: Infinity, D: Infinity },
      done = new Set(),
      snaps = [],
      order = [];
    for (;;) {
      let u = null;
      Object.keys(dist).forEach((k) => {
        if (!done.has(k) && dist[k] < Infinity && (u === null || dist[k] < dist[u])) u = k;
      });
      if (u === null) break;
      done.add(u);
      order.push(u);
      adj[u].forEach(([v, w]) => {
        if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
      });
      snaps.push({ ...dist });
    }
    return { snaps, order };
  })();
  const stepFig = (() => {
    const x0 = 60,
      w = 420,
      y0 = 14,
      h = 190,
      X = (i) => x0 + 34 + i * ((w - 68) / 4),
      Y = (v) => y0 + h - (v / 10) * h;
    const colr = { A: "teal", B: "blue", C: "amber", D: "violet" },
      ord = stepRun.order,
      snaps = stepRun.snaps;
    let b = R(x0, y0, w, h, { rx: 4 });
    [0, 2, 4, 6, 8, 10].forEach(
      (v) =>
        (b +=
          L(x0, Y(v), x0 + w, Y(v), { sw: 1, stroke: "var(--line)" }) +
          T(x0 - 8, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })),
    );
    ["A", "B", "C", "D"].forEach((k) => {
      const last = ord.indexOf(k),
        pts = [];
      snaps.forEach((s, i) => {
        if (i <= last && s[k] < Infinity) pts.push([i, s[k]]);
      });
      b += P(pts.map(([i, v], j) => `${j ? "L" : "M"}${X(i)},${Y(v)}`).join(" "), { stroke: col(colr[k]), sw: 3.5 });
      pts.forEach(([i, v]) => (b += C(X(i), Y(v), 4.5, { fill: col(colr[k]), stroke: col(colr[k]), sw: 1 })));
      const [li, lv] = pts[pts.length - 1];
      b += T(X(li) + 16, Y(lv) + 5, k, { sz: 15, c: ink(colr[k]), w: 900 });
    });
    ord.slice(0, 5).forEach((k, i) => (b += T(X(i), y0 + h + 20, "after " + k, { sz: 13, c: "var(--text-dim)" })));
    b += T(x0 + w / 2, y0 + h + 42, "A line starts when a node is first reached and ends when it is settled.", {
      sz: 12,
      c: "var(--text-faint)",
    });
    return SVG(500, y0 + h + 52, b, "Tentative distance of A, B, C and D after each node is settled");
  })();

  B.add("a2-watch", [
    {
      type: "order",
      q: "Dijkstra from S. S and A are settled. The amber nodes are in the waiting room with the distances shown, and the grey nodes have not been reached. Put the next three nodes in the order they get settled.",
      fig: mapState.fig,
      items: mapState.run.order.slice(2, 5).map((k) => `<b>${k}</b>`),
      why: "B (5) is the smallest in the waiting room, so it goes first, and its road to D reaches D at 8. Now D (8) beats C (10), so D is settled second, and its road to C of length 1 drops C from 10 to 9. C is third. Taking C before D would settle it at 10, when 9 is available.",
    },
    {
      type: "cat",
      q: "Node X has just been settled at distance 5. The diagram shows the road lengths from X and what each neighbour holds now. Sort the neighbours by what happens when you check the roads out of X.",
      fig: hubFig,
      buckets: ["Gets updated", "Left alone"],
      items: [
        ["Node <b>P</b>", 0],
        ["Node <b>Q</b>", 1],
        ["Node <b>R</b>", 1],
        ["Node <b>S</b>", 0],
        ["Node <b>T</b>", 1],
      ],
      hint: "New distance = 5 + the road length. Compare it with what the node holds now.",
      why: "P: 5 + 3 = 8 beats 9. S: 5 + 1 = 6 beats ∞, a first way in. Q: 5 + 4 = 9 only ties 9, and a tie is not better, so Q is left alone. R is already settled, so its distance is final. T: 5 + 6 = 11 is worse than 10.",
    },
    {
      type: "pick",
      q: "This is the shortest-path tree Dijkstra built from S, with each node's distance. The road between B and D closes. Click every node whose best route in this tree used that road.",
      fig: treeFig,
      a: ["D", "F"],
      why: "A node's route is the chain of tree roads back to S. D hangs off B by that road, and F hangs off D, so both routes pass over it. E is also below B, but it uses the B–E road, so it is unaffected. A and C do not touch B at all.",
    },
    {
      type: "pick",
      q: "A friend logged the distance each node had at the moment it was settled, in the order they were settled. One dot proves a mistake was made. Click it.",
      fig: settlePlot,
      a: "p6",
      why: "Dijkstra always settles the smallest waiting distance, and roads never subtract, so the settled distances can only stay level or rise. E at 5 comes after D at 6, which cannot happen. The two 3s are fine: a tie is allowed.",
    },
    {
      type: "pick",
      q: "In Dijkstra, which nodes could still end up with a smaller distance than the one shown? Roads are never negative. Click every one.",
      fig: regionFig,
      a: ["H", "E", "F", "G"],
      why: "Settled nodes are final. D (8) is the smallest in the waiting room, so any other route would have to leave through a node that is already 8 or more away, and it cannot win: D is final too. H and E could still be beaten via D, and the unreached nodes F and G have no distance at all yet.",
    },
    {
      type: "mcq",
      q: "Dijkstra ran on a small map. The chart shows the distance each node held after each node was settled. A drop means a shorter way in was found. Which node's distance dropped twice after it was first reached?",
      fig: stepFig,
      o: ["Node A", "Node B", "Node C", "Node D"],
      a: 2,
      why: "C was first reached at 9, dropped to 6 when A was settled, and dropped again to 5 when B was settled. B dropped once (4 to 3) and D once (10 to 6). A was reached at 1 and never improved, because nothing can beat the node next to the start.",
    },
  ]);

  /* =====================================================================
     a2-code  (Dijkstra code lab)
     ===================================================================== */
  // 1. printed result of a buggy relax step (Python run on the map S-X 7, S-Y 2, Y-X 3, X-Z 1)
  const outDiff = (() => {
    const rows = [
      ["S", "0", "0"],
      ["X", "5", "1"],
      ["Y", "2", "2"],
      ["Z", "6", "1"],
    ];
    let b =
      T(70, 18, "node", { sz: 12, c: "var(--text-faint)" }) +
      T(190, 18, "should print", { sz: 12, c: "var(--text-faint)" }) +
      T(330, 18, "your code printed", { sz: 12, c: "var(--text-faint)" });
    rows.forEach(([k, e, g], i) => {
      const y = 28 + i * 40,
        bad = e !== g;
      b +=
        R(20, y, 440, 32, { rx: 8 }) +
        T(70, y + 22, k, { sz: 16, c: "var(--ink)", w: 900 }) +
        T(190, y + 22, e, { sz: 16, f: "var(--mono)" });
      b +=
        R(270, y + 3, 120, 26, {
          rx: 8,
          fill: bad ? tint("rose") : tint("teal"),
          stroke: bad ? col("rose") : col("teal"),
        }) + T(330, y + 22, g, { sz: 16, f: "var(--mono)", c: bad ? ink("rose") : ink("teal") });
    });
    return SVG(480, 196, b, "Expected and printed distances for the map");
  })();

  // 2. look-by-look trace of a student's relax step that only writes a distance the first time (Python run)
  const lookTrace = (() => {
    const rows = [
      ["S – X", "7", "∞", "7"],
      ["S – Y", "2", "∞", "2"],
      ["Y – S", "4", "0", "0"],
      ["Y – X", "5", "7", "7"],
      ["X – S", "14", "0", "0"],
      ["X – Y", "10", "2", "2"],
      ["X – Z", "8", "∞", "8"],
    ];
    let b =
      T(40, 18, "road checked", { a: "start", sz: 12, c: "var(--text-faint)" }) +
      T(190, 18, "cand", { sz: 12, c: "var(--text-faint)" }) +
      T(290, 18, "dist[v] was", { sz: 12, c: "var(--text-faint)" }) +
      T(410, 18, "dist[v] now", { sz: 12, c: "var(--text-faint)" });
    rows.forEach(([r, c, w, n], i) => {
      const y = 26 + i * 38;
      b +=
        R(8, y, 484, 32, { rx: 10 }) +
        T(40, y + 22, r, { a: "start", sz: 15, c: "var(--ink)", w: 900 }) +
        T(190, y + 22, c, { sz: 15, f: "var(--mono)" }) +
        T(290, y + 22, w, { sz: 15, f: "var(--mono)" }) +
        T(410, y + 22, n, { sz: 15, f: "var(--mono)" }) +
        pk("l" + (i + 1), hit(8, y, 484, 32));
    });
    return SVG(
      500,
      26 + rows.length * 38 + 4,
      b,
      "A trace of the roads checked, with the candidate and the distance before and after",
    );
  })();

  // 3. a one-way adjacency table for four towns (row = from, column = to)
  const adjTable = (() => {
    const names = ["S", "X", "Y", "Z"],
      have = { SX: 7, SY: 2, YX: 3, XZ: 1 },
      cell = 62,
      x0 = 90,
      y0 = 46;
    let b =
      T(x0 + 2 * cell, 16, "to", { sz: 13, c: "var(--text-dim)" }) +
      T(36, y0 + 2 * cell + 4, "from", { sz: 13, c: "var(--text-dim)" });
    names.forEach((p, j) => (b += T(x0 + j * cell + cell / 2, y0 - 8, p, { sz: 16, c: "var(--ink)", w: 900 })));
    names.forEach((s, i) => {
      b += T(x0 - 14, y0 + i * cell + cell / 2 + 6, s, { a: "end", sz: 16, c: "var(--ink)", w: 900 });
      names.forEach((r, j) => {
        const x = x0 + j * cell,
          y = y0 + i * cell,
          v = have[s + r];
        if (s === r) {
          b += R(x, y, cell, cell, { rx: 0, sw: 1.5, fill: "var(--bg-2)" });
          return;
        }
        b +=
          R(x, y, cell, cell, {
            rx: 0,
            sw: 1.5,
            fill: v ? tint("blue") : "var(--panel)",
            stroke: v ? col("blue") : "var(--line-2)",
          }) +
          (v
            ? T(x + cell / 2, y + cell / 2 + 6, String(v), { sz: 18, c: "var(--ink)", w: 900 })
            : pk(s + r, hit(x + 3, y + 3, cell - 6, cell - 6, 6)));
      });
    });
    b += T(x0 + 2 * cell, y0 + 4 * cell + 22, "Row S says: from S, road to X is 7 and to Y is 2.", {
      sz: 12,
      c: "var(--text-dim)",
    });
    return SVG(400, y0 + 4 * cell + 32, b, "A table of roads, row = from, column = to, with four filled cells");
  })();
  Object.assign(partScope, { adjTable, lookTrace, outDiff });
})();

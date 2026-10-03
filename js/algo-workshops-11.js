/* Algorithms, Phase 11 workshop: the algorithm picker (no code).
   11.W "Consultancy: pick the algorithm". Route each client brief to the right tool (drag the card, or tap a tool).
   Every demo runs the real algorithm on a small input; nothing shown is typed in. */
(function () {
  const N = NIC,
    { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const fxOn = () => N.fx && N.fx.ok && !N.fx.reduce();
  const snd = (n) => N.sfx && N.sfx.play(n);

  /* =====================================================================
     The real algorithms (small, plain versions)
     ===================================================================== */
  const INF = Infinity;
  function dijkstra(nodes, edges, s) {
    const dist = {},
      prev = {},
      done = new Set(),
      order = [];
    nodes.forEach((n) => (dist[n] = INF));
    dist[s] = 0;
    for (;;) {
      let u = null;
      nodes.forEach((v) => {
        if (!done.has(v) && dist[v] < INF && (u === null || dist[v] < dist[u])) u = v;
      });
      if (u === null) break;
      done.add(u);
      order.push(u);
      edges.forEach(([a, b, w]) => {
        const v = a === u ? b : b === u ? a : null;
        if (v && dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          prev[v] = u;
        }
      });
    }
    return { dist, prev, order };
  }
  function kruskal(nodes, edges) {
    const root = Object.fromEntries(nodes.map((n) => [n, n])),
      find = (x) => (root[x] === x ? x : (root[x] = find(root[x])));
    const steps = [];
    let total = 0;
    edges
      .map((e, i) => [e, i])
      .sort((p, q) => p[0][2] - q[0][2] || p[1] - q[1])
      .forEach(([e]) => {
        const ra = find(e[0]),
          rb = find(e[1]),
          take = ra !== rb;
        if (take) {
          root[ra] = rb;
          total += e[2];
        }
        steps.push({ e, take });
      });
    return { steps, total, tree: steps.filter((s) => s.take).map((s) => s.e) };
  }
  function treeCost(tree, a, b) {
    // cost of the only path a -> b inside a tree
    const seen = new Set([a]);
    const go = (u, c) => {
      if (u === b) return c;
      for (const [x, y, w] of tree) {
        const v = x === u ? y : y === u ? x : null;
        if (v && !seen.has(v)) {
          seen.add(v);
          const r = go(v, c + w);
          if (r !== null) return r;
        }
      }
      return null;
    };
    return go(a, 0);
  }
  /** Grid search. h = 0 gives Dijkstra; h = Manhattan distance gives A*. Returns the cells in the order they were expanded. */
  function gridSearch(cols, rows, walls, s, g, useH) {
    const key = (x, y) => x + "," + y,
      h = (x, y) => (useH ? Math.abs(x - g[0]) + Math.abs(y - g[1]) : 0);
    const gs = { [key(...s)]: 0 },
      prev = {},
      open = [s],
      closed = new Set(),
      order = [];
    while (open.length) {
      let bi = 0;
      open.forEach((c, i) => {
        const b = open[bi],
          fc = gs[key(...c)] + h(...c),
          fb = gs[key(...b)] + h(...b);
        if (fc < fb || (fc === fb && h(...c) < h(...b))) bi = i;
      });
      const [x, y] = open.splice(bi, 1)[0],
        k = key(x, y);
      if (closed.has(k)) continue;
      closed.add(k);
      order.push([x, y]);
      if (x === g[0] && y === g[1]) {
        const path = [];
        for (let c = k; c; c = prev[c]) path.unshift(c.split(",").map(Number));
        return { order, path, cost: gs[k] };
      }
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].forEach(([dx, dy]) => {
        const nx = x + dx,
          ny = y + dy,
          nk = key(nx, ny);
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || walls.has(nk) || closed.has(nk)) return;
        if (gs[nk] === undefined || gs[k] + 1 < gs[nk]) {
          gs[nk] = gs[k] + 1;
          prev[nk] = k;
          open.push([nx, ny]);
        }
      });
    }
    return { order, path: [], cost: INF };
  }
  /** Graham scan (maths orientation, y up). Records every push and pop. */
  function graham(pts) {
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const p0 = pts.reduce((m, p) => (p[1] < m[1] || (p[1] === m[1] && p[0] < m[0]) ? p : m));
    const rest = pts
      .filter((p) => p !== p0)
      .sort(
        (a, b) =>
          Math.atan2(a[1] - p0[1], a[0] - p0[0]) - Math.atan2(b[1] - p0[1], b[0] - p0[0]) ||
          Math.hypot(a[0] - p0[0], a[1] - p0[1]) - Math.hypot(b[0] - p0[0], b[1] - p0[1]),
      );
    const st = [p0, rest[0]],
      ops = [{ op: "push", p: rest[0], st: st.slice() }];
    for (let i = 1; i < rest.length; i++) {
      const p = rest[i];
      while (st.length >= 2 && cross(st[st.length - 2], st[st.length - 1], p) <= 0) {
        const q = st.pop();
        ops.push({ op: "pop", p: q, cur: p, st: st.slice() });
      }
      st.push(p);
      ops.push({ op: "push", p, st: st.slice() });
    }
    return { hull: st, ops, p0, rest };
  }
  const HPOS = [1, 2, 3, 4, 5, 6, 7],
    PGROUP = { 1: [1, 3, 5, 7], 2: [2, 3, 6, 7], 4: [4, 5, 6, 7] };
  function hammingEncode(d) {
    // d = 4 data bits -> 7-bit word, positions 1..7 stored at index 0..6
    const w = [0, 0, d[0], 0, d[1], d[2], d[3]];
    [1, 2, 4].forEach((p) => {
      w[p - 1] = PGROUP[p].filter((q) => q !== p).reduce((s, q) => s ^ w[q - 1], 0);
    });
    return w;
  }
  function hammingCheck(w) {
    const fail = {};
    let pos = 0;
    [1, 2, 4].forEach((p) => {
      fail[p] = PGROUP[p].reduce((s, q) => s ^ w[q - 1], 0) === 1;
      if (fail[p]) pos += p;
    });
    return { fail, pos };
  }
  function crcRem(bits, gen) {
    // mod-2 long division of bits followed by zeros
    const a = (bits + "0".repeat(gen.length - 1)).split("").map(Number),
      g = gen.split("").map(Number);
    for (let i = 0; i + g.length <= a.length; i++) if (a[i]) g.forEach((b, k) => (a[i + k] ^= b));
    return a.slice(a.length - (gen.length - 1)).join("");
  }
  const djb2 = (s) => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  function huffman(freq) {
    let nodes = Object.entries(freq).map(([s, f], i) => ({ s, f, id: i })),
      id = nodes.length;
    const steps = [];
    while (nodes.length > 1) {
      nodes.sort((a, b) => a.f - b.f || a.id - b.id);
      const [a, b] = nodes.splice(0, 2),
        m = { s: a.s + b.s, f: a.f + b.f, id: id++, l: a, r: b };
      steps.push({ a, b, m });
      nodes.push(m);
    }
    const codes = {};
    (function walk(n, c) {
      if (!n.l) codes[n.s] = c || "0";
      else {
        walk(n.l, c + "0");
        walk(n.r, c + "1");
      }
    })(nodes[0], "");
    return { steps, codes };
  }
  function lpCorners(cons, profit) {
    // cons: [a, b, c] meaning a*x + b*y <= c, plus x,y >= 0
    const all = [...cons, [-1, 0, 0], [0, -1, 0]],
      pts = [];
    for (let i = 0; i < all.length; i++)
      for (let j = i + 1; j < all.length; j++) {
        const [a1, b1, c1] = all[i],
          [a2, b2, c2] = all[j],
          det = a1 * b2 - a2 * b1;
        if (!det) continue;
        const x = (c1 * b2 - c2 * b1) / det,
          y = (a1 * c2 - a2 * c1) / det;
        if (
          all.every(([a, b, c]) => a * x + b * y <= c + 1e-9) &&
          !pts.some((p) => Math.abs(p[0] - x) + Math.abs(p[1] - y) < 1e-9)
        )
          pts.push([x, y]);
      }
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length,
      cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    pts.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
    return pts.map((p) => ({ x: p[0], y: p[1], v: profit[0] * p[0] + profit[1] * p[1] }));
  }
  function pageRank(nodes, links, d, iters) {
    let r = Object.fromEntries(nodes.map((n) => [n, 1 / nodes.length]));
    const hist = [r];
    for (let t = 0; t < iters; t++) {
      const nr = Object.fromEntries(nodes.map((n) => [n, (1 - d) / nodes.length]));
      nodes.forEach((u) => links[u].forEach((v) => (nr[v] += (d * r[u]) / links[u].length)));
      r = nr;
      hist.push(r);
    }
    return hist;
  }
  function dftMags(x) {
    const n = x.length;
    return Array.from({ length: n / 2 + 1 }, (_, k) => {
      let re = 0,
        im = 0;
      x.forEach((v, t) => {
        re += v * Math.cos((2 * Math.PI * k * t) / n);
        im -= v * Math.sin((2 * Math.PI * k * t) / n);
      });
      return (Math.hypot(re, im) * (k === 0 || k === n / 2 ? 1 : 2)) / n;
    });
  }
  N.aw11 = {
    dijkstra,
    kruskal,
    treeCost,
    gridSearch,
    graham,
    hammingEncode,
    hammingCheck,
    crcRem,
    djb2,
    huffman,
    lpCorners,
    pageRank,
    dftMags,
  };

  /* =====================================================================
     Demo data
     ===================================================================== */
  const ROADS = {
    nodes: { A: [50, 150], B: [170, 52], C: [170, 248], D: [330, 82], E: [330, 238], F: [470, 150] },
    edges: [
      ["A", "B", 4],
      ["A", "C", 2],
      ["B", "C", 1],
      ["B", "D", 5],
      ["C", "D", 8],
      ["C", "E", 10],
      ["D", "E", 2],
      ["D", "F", 6],
      ["E", "F", 3],
    ],
  };
  const OFFICES = {
    nodes: { HQ: [50, 150], N1: [170, 52], N2: [170, 248], E1: [330, 82], E2: [330, 238], W: [470, 150] },
    edges: [
      ["HQ", "N1", 4],
      ["HQ", "N2", 3],
      ["N1", "N2", 5],
      ["N1", "E1", 6],
      ["N2", "E2", 7],
      ["E1", "E2", 2],
      ["E1", "W", 8],
      ["E2", "W", 4],
      ["N1", "E2", 9],
    ],
  };
  const SQUARE = {
    nodes: { S: [90, 232], P: [90, 70], Q: [430, 70], T: [430, 232] },
    edges: [
      ["S", "P", 6],
      ["P", "Q", 6],
      ["Q", "T", 6],
      ["S", "T", 10],
    ],
  };
  const FIELD = [
    [60, 200],
    [120, 80],
    [200, 150],
    [250, 60],
    [300, 180],
    [340, 110],
    [400, 220],
    [430, 90],
    [470, 160],
    [220, 222],
    [160, 170],
    [350, 150],
  ];
  const HAM_DATA = [1, 0, 1, 1],
    HAM_HIT = 6,
    CRC_GEN = "1011",
    CRC_DATA = "1101";
  const LEDGER = ["Ana +5", "Ben +12", "Cy +3", "Di +8"];
  const SIG = Array.from(
    { length: 16 },
    (_, n) => Math.sin((2 * Math.PI * 2 * n) / 16) + 0.5 * Math.sin((2 * Math.PI * 5 * n) / 16),
  );
  const LP = {
    cons: [
      [2, 3, 24],
      [1, 1, 10],
    ],
    profit: [40, 50],
  };
  const WEB = { nodes: ["A", "B", "C", "D"], links: { A: ["B", "C"], B: ["C"], C: ["A"], D: ["C"] } };
  const FREQ = { A: 8, B: 2, C: 1, D: 1 };
  const GRID = { cols: 11, rows: 7, walls: new Set(["6,2", "6,3", "6,4"]), s: [0, 3], g: [10, 3] };

  /* =====================================================================
     Drawing helpers
     ===================================================================== */
  const r2 = (n) => Math.round(n * 100) / 100;
  function graphSvg(box, g, opts = {}) {
    const pos = g.nodes,
      W = 520,
      H = opts.h || 300;
    box.innerHTML = `<svg class="aw11-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${opts.label || "A small weighted graph"}">
      ${g.edges.map(([a, b]) => `<line class="aw11-ge" data-e="${a}-${b}" x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${pos[b][0]}" y2="${pos[b][1]}"/>`).join("")}
      ${g.edges
        .map(([a, b, w]) => {
          const x = (pos[a][0] + pos[b][0]) / 2,
            y = (pos[a][1] + pos[b][1]) / 2;
          return `<g class="aw11-gw"><rect x="${x - 13}" y="${y - 11}" width="26" height="22" rx="8"/><text x="${x}" y="${y}">${w}</text></g>`;
        })
        .join("")}
      ${Object.keys(pos)
        .map(
          (n) =>
            `<g class="aw11-gn" data-n="${n}"><circle cx="${pos[n][0]}" cy="${pos[n][1]}" r="${n.length > 1 ? 24 : 21}"/><text class="nm" x="${pos[n][0]}" y="${pos[n][1]}">${n}</text><text class="sub" x="${pos[n][0]}" y="${pos[n][1] + 40}"></text></g>`,
        )
        .join("")}</svg>`;
    const svg = qs("svg", box);
    return {
      svg,
      e: (a, b) => qs(`[data-e="${a}-${b}"]`, svg) || qs(`[data-e="${b}-${a}"]`, svg),
      n: (x) => qs(`[data-n="${x}"]`, svg),
      sub: (x, t) => {
        qs(".sub", qs(`[data-n="${x}"]`, svg)).textContent = t;
      },
    };
  }
  const cells = (arr, cls = "") =>
    `<div class="aw11-cells ${cls}">${arr.map((c) => `<span class="aw11-cell ${c.c || ""}" ${c.id ? `data-id="${c.id}"` : ""}><small>${c.sub == null ? "" : c.sub}</small><b>${c.v}</b></span>`).join("")}</div>`;
  const flash = (n, cls) => {
    if (!n) return;
    n.classList.remove(cls);
    void n.getBoundingClientRect();
    n.classList.add(cls);
  };

  /* =====================================================================
     Demos: each runs a real algorithm and narrates with c.cap(html). c.wait(ms) resolves false when superseded.
     ===================================================================== */
  const DEMOS = {
    async dijkstra(box, c) {
      const g = graphSvg(box, ROADS),
        r = dijkstra(Object.keys(ROADS.nodes), ROADS.edges, "A");
      g.sub("A", "0");
      c.cap(`Dijkstra starts at <b>A</b> (0) and always settles the closest unsettled junction.`);
      for (const u of r.order) {
        if (!(await c.wait(520))) return;
        g.n(u).classList.add("cur");
        g.sub(u, String(r.dist[u]));
        if (r.prev[u]) g.e(r.prev[u], u).classList.add("tree");
        if (!(await c.wait(260))) return;
        g.n(u).classList.remove("cur");
        g.n(u).classList.add("done");
        c.cap(`Settled <b>${u}</b> at <b>${r.dist[u]}</b>. No road is negative, so nothing can make it cheaper later.`);
      }
      c.cap(
        `Every junction is settled with its quickest time from A (teal roads are the best routes). Longest: <b>${Math.max(...Object.values(r.dist))}</b>.`,
      );
    },
    async tree(box, c, mode) {
      // trap demos on the square: "path" (MST used as a route) or "spt" (shortest-path tree used as cabling)
      const nodes = Object.keys(SQUARE.nodes),
        g = graphSvg(box, SQUARE, { h: 300 }),
        mst = kruskal(nodes, SQUARE.edges),
        sp = dijkstra(nodes, SQUARE.edges, "S");
      const mstST = treeCost(mst.tree, "S", "T"),
        spTree = nodes
          .filter((n) => sp.prev[n])
          .map((n) => [
            sp.prev[n],
            n,
            SQUARE.edges.find(([a, b]) => (a === sp.prev[n] && b === n) || (b === sp.prev[n] && a === n))[2],
          ]),
        spTotal = spTree.reduce((s, e) => s + e[2], 0);
      if (mode === "path") {
        c.cap(`The cheapest wiring (an MST) keeps the three cheap links: total <b>${mst.total}</b>.`);
        mst.tree.forEach(([a, b]) => g.e(a, b).classList.add("ok"));
        if (!(await c.wait(900))) return;
        ["S", "P", "Q", "T"].forEach((n) => g.n(n).classList.add("cur"));
        c.cap(
          `But driving S to T along that tree costs <b>${mstST}</b>, while the direct road is only <b>${sp.dist.T}</b>. An MST minimises total wiring, not any single journey.`,
        );
        g.e("S", "T").classList.add("route");
      } else {
        c.cap(
          `Dijkstra's shortest-path tree from S: every junction as close to S as possible. Total length <b>${spTotal}</b>.`,
        );
        spTree.forEach(([a, b]) => g.e(a, b).classList.add("route"));
        if (!(await c.wait(1000))) return;
        qsa(".aw11-ge", g.svg).forEach((e) => e.classList.remove("route"));
        mst.tree.forEach(([a, b]) => g.e(a, b).classList.add("ok"));
        c.cap(
          `Cheapest way to connect everything (MST): only <b>${mst.total}</b> in total, against ${spTotal}. Shortest routes are not cheapest wiring.`,
        );
      }
    },
    async grid(box, c) {
      const { cols, rows, walls, s, g } = GRID,
        dj = gridSearch(cols, rows, walls, s, g, false),
        as = gridSearch(cols, rows, walls, s, g, true);
      const mk = (title) =>
        `<div class="aw11-gb"><b>${title}</b><span class="aw11-cnt">0 explored</span><div class="aw11-gridc" style="--cols:${cols}">${Array.from(
          { length: cols * rows },
          (_, i) => {
            const x = i % cols,
              y = (i / cols) | 0;
            return `<i data-k="${x},${y}" class="${walls.has(x + "," + y) ? "w" : x === s[0] && y === s[1] ? "s" : x === g[0] && y === g[1] ? "g" : ""}"></i>`;
          },
        ).join("")}</div></div>`;
      box.innerHTML = `<div class="aw11-2">${mk("Dijkstra")}${mk("A* (with a distance guess)")}</div>`;
      const boxes = qsa(".aw11-gb", box),
        run = [dj, as];
      c.cap("Both searches look for the same shelf. Watch how many squares each has to explore before it finds it.");
      const steps = Math.max(dj.order.length, as.order.length);
      for (let i = 0; i < steps; i += 2) {
        if (!(await c.wait(70))) return;
        run.forEach((r, b) => {
          for (let k = i; k < Math.min(i + 2, r.order.length); k++) {
            const cell = qs(`[data-k="${r.order[k][0]},${r.order[k][1]}"]`, boxes[b]);
            if (cell && !cell.className) cell.className = "seen";
          }
          qs(".aw11-cnt", boxes[b]).textContent = `${Math.min(i + 2, r.order.length)} explored`;
        });
      }
      run.forEach((r, b) => {
        r.path.forEach(([x, y]) => {
          const cell = qs(`[data-k="${x},${y}"]`, boxes[b]);
          if (cell && !/[sg]/.test(cell.className)) cell.className = "path";
        });
        qs(".aw11-cnt", boxes[b]).textContent = `${r.order.length} explored`;
      });
      c.cap(
        `Same shortest path (<b>${dj.cost}</b> steps). Dijkstra explored <b>${dj.order.length}</b> squares; A* explored only <b>${as.order.length}</b>, because its estimate pulls it towards the goal.`,
      );
    },
    async kruskal(box, c) {
      const g = graphSvg(box, OFFICES),
        nodes = Object.keys(OFFICES.nodes),
        r = kruskal(nodes, OFFICES.edges);
      c.cap(
        "Kruskal goes through the links <b>cheapest first</b>, keeping a link only if it joins two separate pieces.",
      );
      let total = 0;
      for (const { e, take } of r.steps) {
        if (!(await c.wait(650))) return;
        const line = g.e(e[0], e[1]);
        line.classList.add(take ? "ok" : "skip");
        if (take) {
          total += e[2];
          c.cap(`<b>${e[0]}–${e[1]}</b> (${e[2]}) joins two separate pieces: <b>keep</b>. Running total ${total}.`);
        } else {
          c.cap(
            `<b>${e[0]}–${e[1]}</b> (${e[2]}): both ends are already connected. A second route would be a loop: <b>skip</b>.`,
          );
          setTimeout(() => line.classList.remove("skip"), 500);
        }
      }
      c.cap(
        `Every office is connected using ${r.tree.length} links for a total of <b>${r.total}</b>. Nothing cheaper connects them all.`,
      );
    },
    async hull(box, c) {
      const H = 260,
        pts = FIELD.map(([x, y]) => [x, H - y]),
        gr = graham(pts),
        flipY = (p) => [p[0], H - p[1]];
      box.innerHTML = `<svg class="aw11-svg" viewBox="0 0 520 ${H + 10}" role="img" aria-label="Points with a fence growing around them"><polygon class="aw11-hl" points=""/><polyline class="aw11-hp" points=""/>${FIELD.map(([x, y], i) => `<circle class="aw11-pt" data-i="${i}" cx="${x}" cy="${y}" r="7"/>`).join("")}<circle class="aw11-ring" r="12" cx="-50" cy="-50"/></svg>`;
      const svg = qs("svg", box),
        pl = qs(".aw11-hp", svg),
        ring = qs(".aw11-ring", svg),
        ptEl = (p) => qs(`[data-i="${FIELD.findIndex(([x, y]) => x === p[0] && H - y === p[1])}"]`, svg);
      c.cap(
        "Graham scan: sort the pins by angle around the lowest one, then walk round with a stack. A <b>right turn</b> pops the last pin.",
      );
      for (const o of gr.ops) {
        if (!(await c.wait(o.op === "pop" ? 650 : 480))) return;
        const show = o.st.map(flipY),
          p = flipY(o.p);
        pl.setAttribute("points", show.map((q) => q.join(",")).join(" "));
        ring.setAttribute("cx", p[0]);
        ring.setAttribute("cy", p[1]);
        if (o.op === "pop") {
          flash(ptEl(o.p), "bad");
          c.cap(`The turn at this pin goes the wrong way (a right turn): <b>pop</b> it. It is inside the fence.`);
        } else c.cap(`Left turn: <b>keep</b> this pin on the stack (${o.st.length} on the fence so far).`);
      }
      const hs = gr.hull.map(flipY);
      qs(".aw11-hl", svg).setAttribute("points", hs.map((q) => q.join(",")).join(" "));
      pl.setAttribute("points", "");
      ring.setAttribute("cx", -50);
      gr.hull.forEach((p) => ptEl(p).classList.add("hullpt"));
      c.cap(
        `The fence touches <b>${gr.hull.length}</b> of the ${FIELD.length} pins. The other ${FIELD.length - gr.hull.length} are inside, so they need no fence.`,
      );
    },
    async hamming(box, c) {
      const w = hammingEncode(HAM_DATA),
        bad = w.slice();
      bad[HAM_HIT - 1] ^= 1;
      const row = (word, marks = {}) =>
        cells(
          HPOS.map((p) => ({
            v: word[p - 1],
            sub: [1, 2, 4].includes(p) ? "p" + p : "d" + p,
            c: marks[p] || ([1, 2, 4].includes(p) ? "par" : ""),
          })),
        );
      box.innerHTML = `<div class="aw11-ham"><div data-r1></div><div class="aw11-chk" data-chk></div></div>`;
      const r1 = qs("[data-r1]", box),
        chk = qs("[data-chk]", box);
      r1.innerHTML = row(w);
      c.cap(`The probe sends 4 data bits as a 7-bit codeword (parity bits at positions 1, 2 and 4).`);
      if (!(await c.wait(900))) return;
      r1.innerHTML = row(bad, { [HAM_HIT]: "bad" });
      c.cap(`Noise flips one bit on the way. The receiver does not know which.`);
      flash(qs(".bad", r1), "aw11-pop");
      if (!(await c.wait(900))) return;
      const ck = hammingCheck(bad);
      chk.innerHTML = [4, 2, 1]
        .map(
          (p) => `<span class="aw11-chip ${ck.fail[p] ? "no" : "ok"}">p${p} ${ck.fail[p] ? "fails" : "passes"}</span>`,
        )
        .join("");
      c.cap(
        `It re-checks the three overlapping groups. Failed checks p4 p2 p1 read <b>${[4, 2, 1].map((p) => (ck.fail[p] ? 1 : 0)).join("")}</b> in binary.`,
      );
      if (!(await c.wait(1100))) return;
      const fixed = bad.slice();
      fixed[ck.pos - 1] ^= 1;
      r1.innerHTML = row(fixed, { [ck.pos]: "good" });
      flash(qs(".good", r1), "aw11-pop");
      c.cap(`That is position <b>${ck.pos}</b>. Flip it back and the codeword is repaired at once, with no resend.`);
    },
    async crc(box, c) {
      const rem = crcRem(CRC_DATA, CRC_GEN),
        frame = (CRC_DATA + rem).split("").map(Number),
        bad = frame.slice();
      bad[5] ^= 1;
      const row = (word, mark) =>
        cells(word.map((b, i) => ({ v: b, sub: i < 4 ? "data" : "crc", c: i === mark ? "bad" : i >= 4 ? "par" : "" })));
      box.innerHTML = `<div class="aw11-ham"><div data-r1></div><div class="aw11-chk" data-chk></div></div>`;
      const r1 = qs("[data-r1]", box),
        chk = qs("[data-chk]", box);
      r1.innerHTML = row(frame, -1);
      c.cap(`CRC: divide by ${CRC_GEN}, send the remainder <b>${rem}</b> after the data.`);
      if (!(await c.wait(900))) return;
      r1.innerHTML = row(bad, 5);
      flash(qs(".bad", r1), "aw11-pop");
      const check = crcRem(bad.join("").slice(0, 4), CRC_GEN) !== bad.join("").slice(4);
      chk.innerHTML = `<span class="aw11-chip no">${check ? "CRC mismatch: corrupted!" : "no mismatch"}</span><span class="aw11-chip">which bit? unknown</span>`;
      c.cap(
        `One bit flips. The receiver's CRC no longer matches, so it knows the frame is bad, <b>but not where</b>. All CRC can do is ask for a resend. This probe cannot be asked.`,
      );
    },
    async hash(box, c) {
      const mk = (data) => {
        const b = [];
        data.forEach((d, i) => {
          const prev = i ? b[i - 1].hash : "00000000";
          b.push({ d, prev, hash: djb2(`${i}|${d}|${prev}`) });
        });
        return b;
      };
      const good = mk(LEDGER),
        sh = (h) => h.slice(0, 5);
      const draw = (blocks, edit, broke) => {
        box.innerHTML = `<div class="aw11-chain">${blocks.map((b, i) => `<div class="aw11-blk ${i === edit ? "edit" : ""} ${broke !== null && i > broke ? "after" : ""}"><b>Block ${i}</b><span>${b.d}</span><small>prev ${sh(b.prev)}</small><small>hash ${sh(i === edit ? djb2(`${i}|${b.d}|${b.prev}`) : b.hash)}</small></div>${i < blocks.length - 1 ? `<i class="aw11-lk ${broke === i ? "no" : "ok"}">${broke === i ? "✗" : "→"}</i>` : ""}`).join("")}</div>`;
      };
      draw(good, -1, null);
      c.cap("Each block stores the hash of the block before it. Everything checks out.");
      if (!(await c.wait(1100))) return;
      const forged = good.map((b) => ({ ...b }));
      forged[1].d = "Ben +2";
      draw(forged, 1, 1);
      flash(qs(".edit", box), "aw11-pop");
      c.cap(
        `Someone quietly edits block 1. Its hash becomes <b>${sh(djb2(`1|${forged[1].d}|${forged[1].prev}`))}</b>, not <b>${sh(good[1].hash)}</b>, so block 2's stored <i>prev</i> no longer matches: the link turns red. To hide it they would have to recompute every later block.`,
      );
    },
    async fft(box, c) {
      const mags = dftMags(SIG),
        mx = 1.2;
      box.innerHTML = `<svg class="aw11-svg" viewBox="0 0 520 120" aria-label="The 16 samples of the signal"><line class="aw11-ax" x1="10" x2="510" y1="60" y2="60"/><polyline class="aw11-wave" points=""/>${SIG.map((v, i) => `<circle class="aw11-dot" cx="${20 + i * 32}" cy="${60 - v * 34}" r="4.5"/>`).join("")}</svg>
        <div class="aw11-bars">${mags.map((m, k) => `<div class="aw11-bar" data-k="${k}"><i style="transform:scaleY(0)"></i><small>${k}</small></div>`).join("")}</div>`;
      const wave = qs(".aw11-wave", box);
      wave.setAttribute("points", SIG.map((v, i) => `${20 + i * 32},${60 - v * 34}`).join(" "));
      c.cap(
        "Sixteen samples of a hum look like a messy wiggle. The DFT asks, for each frequency, how much of it is inside.",
      );
      if (!(await c.wait(1100))) return;
      for (let k = 0; k < mags.length; k++) {
        if (!(await c.wait(130))) return;
        const b = qs(`[data-k="${k}"] i`, box);
        b.style.transform = `scaleY(${Math.min(1, mags[k] / mx).toFixed(3)})`;
        if (mags[k] > 0.1) b.className = "peak";
      }
      const peaks = mags.map((m, k) => [k, m]).filter(([, m]) => m > 0.1);
      c.cap(
        `One bar per frequency. Two tall bars: <b>${peaks.map(([k, m]) => `${k} cycles (${r2(m)})`).join("</b> and <b>")}</b>. The hum is two pure tones mixed together. (The FFT gives the same bars, just faster.)`,
      );
    },
    async huffman(box, c) {
      const h = huffman(FREQ),
        total = Object.values(FREQ).reduce((a, b) => a + b, 0);
      box.innerHTML = `<div class="aw11-huf"><div class="aw11-hs" data-s></div><div class="aw11-hc" data-c></div></div>`;
      const s = qs("[data-s]", box),
        cc = qs("[data-c]", box);
      c.cap(
        `Letter counts: ${Object.entries(FREQ)
          .map(([a, f]) => `<b>${a}</b> ${f}`)
          .join(", ")}. Huffman repeatedly merges the two <b>rarest</b>.`,
      );
      for (const st of h.steps) {
        if (!(await c.wait(900))) return;
        s.insertAdjacentHTML(
          "beforeend",
          `<div class="aw11-merge"><span>${st.a.s} (${st.a.f})</span><em>+</em><span>${st.b.s} (${st.b.f})</span><em>→</em><b>${st.m.f}</b></div>`,
        );
        flash(s.lastElementChild, "aw11-pop");
      }
      if (!(await c.wait(800))) return;
      let bits = 0;
      cc.innerHTML = Object.entries(h.codes)
        .map(([a, code]) => {
          bits += code.length * FREQ[a];
          return `<div class="aw11-code"><b>${a}</b><span>${code
            .split("")
            .map((x) => `<i>${x}</i>`)
            .join("")}</span><small>${FREQ[a]} times</small></div>`;
        })
        .join("");
      c.cap(
        `The common letter gets the shortest code. The whole message takes <b>${bits}</b> bits, against <b>${total * 2}</b> with a plain 2 bits per letter.`,
      );
    },
    async lp(box, c) {
      const pts = lpCorners(LP.cons, LP.profit),
        best = pts.reduce((m, p) => (p.v > m.v ? p : m)),
        X = (x) => 50 + x * 30,
        Y = (y) => 270 - y * 30;
      box.innerHTML = `<svg class="aw11-svg" viewBox="0 0 520 290" role="img" aria-label="Feasible region for chairs and tables"><line class="aw11-ax" x1="50" y1="270" x2="470" y2="270"/><line class="aw11-ax" x1="50" y1="270" x2="50" y2="20"/>
        <text class="aw11-lab" x="470" y="286" text-anchor="end">chairs</text><text class="aw11-lab" x="8" y="20">tables</text>
        <polygon class="aw11-poly" points="${pts.map((p) => `${X(p.x)},${Y(p.y)}`).join(" ")}"/>
        ${pts.map((p, i) => `<g class="aw11-cor" data-i="${i}"><circle cx="${X(p.x)}" cy="${Y(p.y)}" r="8"/><text x="${X(p.x) + (p.x < 1 ? 14 : 10)}" y="${Y(p.y) - 12}">(${r2(p.x)}, ${r2(p.y)}) → ${r2(p.v)}</text></g>`).join("")}</svg>`;
      c.cap(
        `Wood and hours limits cut out a polygon of allowed plans. Profit is <b>${LP.profit[0]}</b> per chair, <b>${LP.profit[1]}</b> per table.`,
      );
      qs(".aw11-poly", box).classList.add("on");
      if (!(await c.wait(900))) return;
      for (let i = 0; i < pts.length; i++) {
        if (!(await c.wait(650))) return;
        const g = qs(`[data-i="${i}"]`, box);
        g.classList.add("on");
        c.cap(`Corner (${r2(pts[i].x)} chairs, ${r2(pts[i].y)} tables) earns <b>${r2(pts[i].v)}</b>.`);
      }
      if (!(await c.wait(650))) return;
      qs(`[data-i="${pts.indexOf(best)}"]`, box).classList.add("best");
      c.cap(
        `The best plan is always at a <b>corner</b>: ${r2(best.x)} chairs and ${r2(best.y)} tables for <b>${r2(best.v)}</b>. Simplex walks corner to corner instead of searching the inside.`,
      );
    },
    async pagerank(box, c) {
      const hist = pageRank(WEB.nodes, WEB.links, 0.85, 14);
      box.innerHTML = `<div class="aw11-pr"><div class="aw11-links">${WEB.nodes.map((n) => `<span><b>${n}</b> → ${WEB.links[n].join(", ")}</span>`).join("")}</div>
        <div class="aw11-rbars">${WEB.nodes.map((n) => `<div class="aw11-rrow"><b>${n}</b><span class="aw11-tr"><i style="transform:scaleX(${hist[0][n] / 0.6})"></i></span><output>${r2(hist[0][n])}</output></div>`).join("")}</div><div class="aw11-it">start</div></div>`;
      c.cap("Everyone starts with equal rank. Each round, every page shares its rank out along its links.");
      for (let t = 1; t < hist.length; t++) {
        if (!(await c.wait(380))) return;
        qsa(".aw11-rrow", box).forEach((row, i) => {
          const v = hist[t][WEB.nodes[i]];
          qs("i", row).style.transform = `scaleX(${Math.min(1, v / 0.6).toFixed(3)})`;
          qs("output", row).textContent = r2(v);
        });
        qs(".aw11-it", box).textContent = `round ${t}`;
      }
      const last = hist[hist.length - 1],
        top = WEB.nodes.reduce((m, n) => (last[n] > last[m] ? n : m));
      qsa(".aw11-rrow", box).forEach((row, i) => row.classList.toggle("top", WEB.nodes[i] === top));
      c.cap(
        `The scores settle. <b>${top}</b> wins (${r2(last[top])}) because the most pages link to it, and <b>D</b> (nobody links to it) stays at the teleport floor, ${r2(last.D)}.`,
      );
    },
  };

  /* =====================================================================
     Tools and scenarios
     ===================================================================== */
  const TOOLS = [
    {
      id: "dijk",
      name: "Dijkstra",
      ph: 2,
      does: "quickest routes from one start to everywhere, when no cost is negative",
    },
    {
      id: "astar",
      name: "A*",
      ph: 2,
      does: "one start and one goal, guided by an honest estimate of the distance left",
    },
    {
      id: "lp",
      name: "Linear programming",
      ph: 3,
      does: "the best mix of quantities when everything is a straight-line limit",
    },
    {
      id: "golden",
      name: "Golden-section search",
      ph: 3,
      does: "the lowest point of a one-knob curve with a single dip, using only evaluations",
    },
    { id: "mst", name: "MST (Prim / Kruskal)", ph: 4, does: "connecting every point with the cheapest total wiring" },
    { id: "hull", name: "Convex hull", ph: 5, does: "the smallest outline that wraps around a set of points" },
    { id: "crc", name: "CRC", ph: 6, does: "detecting accidental bit flips so the data can be resent" },
    { id: "ham", name: "Hamming code", ph: 6, does: "finding and repairing one flipped bit without a resend" },
    { id: "huff", name: "Huffman coding", ph: 7, does: "shrinking data whose symbols have very uneven frequencies" },
    { id: "lzw", name: "LZW", ph: 7, does: "shrinking data in which whole phrases repeat" },
    { id: "hash", name: "Hash chain", ph: 8, does: "making any later edit to a history visible" },
    { id: "fft", name: "DFT / FFT", ph: 9, does: "finding which frequencies are inside a signal" },
    { id: "attn", name: "Attention", ph: 10, does: "letting each item in a sequence decide which others matter to it" },
    { id: "pr", name: "PageRank", ph: 1, does: "scoring pages by who links to them" },
  ];
  const TOOL = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

  const CASES = [
    {
      id: "amb",
      t: "Ambulance dispatch",
      brief:
        "A city has known travel times between junctions, none negative. Dispatch needs the quickest route from the station to <b>every</b> junction.",
      need: "quickest routes to every junction, non-negative times",
      tool: "dijk",
      why: "Non-negative costs are exactly what lets Dijkstra declare the closest unsettled junction final.",
      demo: "dijkstra",
      traps: {
        mst: { demo: (b, c) => DEMOS.tree(b, c, "path"), say: "An MST minimises total wiring, not any one journey." },
        astar: {
          say: "A* aims at <b>one</b> goal using a distance estimate. Dispatch needs every junction, so there is no single goal to aim at: Dijkstra is the tool.",
        },
      },
    },
    {
      id: "bot",
      t: "Warehouse robot",
      brief:
        "A robot must reach <b>one</b> shelf on a grid. The straight-line grid distance to the shelf is known and never overestimates. Explore as little as you can.",
      need: "one goal, plus an honest distance estimate",
      tool: "astar",
      why: "An estimate that never overestimates keeps A* correct while it explores far fewer squares.",
      demo: "grid",
      near: {
        dijk: {
          demo: (b, c) => DEMOS.grid(b, c),
          say: "Dijkstra would find the right path, but it ignores the estimate and explores more. Watch the counts.",
        },
      },
    },
    {
      id: "cab",
      t: "Fibre for nine offices",
      brief:
        "Every office must be able to reach every other over fibre. Each link costs money to lay. Keep the <b>total</b> cost as low as possible.",
      need: "connect everything with the cheapest total cost",
      tool: "mst",
      why: "The cut property guarantees the cheapest link across any split is safe, so Prim and Kruskal build the cheapest connected network.",
      demo: "kruskal",
      traps: {
        dijk: {
          demo: (b, c) => DEMOS.tree(b, c, "spt"),
          say: "Shortest routes from one office are not the same as the cheapest total wiring.",
        },
        astar: {
          demo: (b, c) => DEMOS.tree(b, c, "spt"),
          say: "A* finds one route between two points. Here the job is to wire everything.",
        },
      },
    },
    {
      id: "fen",
      t: "Fence the troughs",
      brief:
        "A farmer has GPS pins for twelve water troughs and wants the shortest fence that encloses all of them, bulging only outwards.",
      need: "the smallest convex outline around points",
      tool: "hull",
      why: "The convex hull is the rubber band around the pins. Graham scan finds it with left turns and a stack.",
      demo: "hull",
      traps: {
        mst: {
          say: "An MST joins the pins with a network of links. A fence needs a closed outline around the outside.",
        },
      },
    },
    {
      id: "pro",
      t: "Deep-space probe",
      brief:
        "A probe sends 4-bit readings. Sometimes <b>one</b> bit flips in transit and there is no chance to resend. The receiver must repair it itself.",
      need: "locate and repair one flipped bit, no resend",
      tool: "ham",
      why: "Overlapping parity groups make the failed checks spell the position of the flipped bit, so the receiver can fix it.",
      demo: "hamming",
      traps: { crc: { demo: (b, c) => DEMOS.crc(b, c), say: "CRC can tell the frame is bad, but not where." } },
    },
    {
      id: "led",
      t: "Donation log",
      brief:
        "A charity wants its log to be tamper-evident: if anyone quietly edits an old entry, everyone who checks should be able to see it.",
      need: "edits to history show up for everyone",
      tool: "hash",
      why: "Each block stores the previous block's hash, so an edit breaks every link after it.",
      demo: "hash",
      traps: {
        crc: {
          say: "A CRC catches accidents, but anyone who edits deliberately can simply recompute it. Chained hashes make the edit show up downstream.",
        },
      },
    },
    {
      id: "hum",
      t: "The mystery hum",
      brief:
        "A sound engineer records sixteen samples of a hum and wants to know <b>which pure tones</b> are mixed inside it.",
      need: "which frequencies a signal contains",
      tool: "fft",
      why: "The DFT reads a signal back as one bin per frequency. The FFT is the fast way to compute the same bins.",
      demo: "fft",
      traps: {
        attn: {
          say: "Attention compares items in a sequence with each other. It does not split a waveform into frequencies.",
        },
      },
    },
    {
      id: "arc",
      t: "News archive",
      brief:
        "An archive stores text where a few letters are extremely common and others are rare. Make it smaller without losing a single character.",
      need: "shrink data with very uneven symbol frequencies",
      tool: "huff",
      why: "Huffman gives the commonest symbols the shortest codes, which is optimal for symbol-by-symbol coding.",
      demo: "huffman",
      traps: {
        lzw: {
          say: "LZW wins when whole <b>phrases</b> repeat. This archive's pattern is uneven letter frequency, which is Huffman's home ground.",
        },
      },
    },
    {
      id: "wor",
      t: "Chairs and tables",
      brief:
        "A workshop makes chairs and tables. Each uses wood and hours, both limited, and the profit on each item is fixed. How many of each give the most profit?",
      need: "best mix of two quantities under straight-line limits",
      tool: "lp",
      why: "A linear objective with linear limits has its best plan at a corner of the allowed polygon.",
      demo: "lp",
      traps: {
        golden: {
          say: "Golden-section search has <b>one</b> knob and a single dip. This problem has two quantities and straight-line limits.",
        },
      },
    },
    {
      id: "web",
      t: "Which page matters?",
      brief: "A search engine wants one importance score per page, using only which pages link to which.",
      need: "importance scores from a link graph",
      tool: "pr",
      why: "PageRank lets rank flow along links, repeating until the scores settle, with teleporting to avoid traps.",
      demo: "pagerank",
      traps: { attn: { say: "Attention scores words within a sentence. Ranking pages from their links is PageRank." } },
    },
  ];

  /* =====================================================================
     The workshop
     ===================================================================== */
  function picker(stage, api, life) {
    let idx = 0,
      score = 0,
      combo = 0,
      best = 0,
      wrong = 0,
      solved = 0,
      locked = false,
      tried = new Set(),
      gen = 0;
    const card =
      el(`<div class="wk-card aw11-main"><h3>Client brief<span class="wk-sp"></span><span class="wk-badge" data-round>Case 1 of ${CASES.length}</span></h3>
      <div class="aw11-case" data-case tabindex="0"><div class="aw11-ct" data-ct></div><div class="aw11-cb" data-cb></div><div class="aw11-cn" data-cn></div></div>
      <div class="aw11-hintline" data-hl>Drag the card onto a tool, or tap a tool.</div>
      <div class="wk-stats"><div class="wk-stat amber"><small>Score</small><b data-score>0</b></div><div class="wk-stat teal"><small>Combo</small><b data-combo>×1</b></div><div class="wk-stat rose"><small>Slips</small><b data-wrong>0</b></div></div></div>`);
    const tools = el(
      `<div class="wk-card"><h3>Toolbox<span class="wk-sp"></span><span class="faint" style="text-transform:none;letter-spacing:0">some tools are decoys</span></h3><div class="aw11-tools" data-tools>${TOOLS.slice()
        .sort((a, b) => a.ph - b.ph)
        .map((t) => `<button class="aw11-tool" data-t="${t.id}"><small>Phase ${t.ph}</small><b>${t.name}</b></button>`)
        .join("")}</div></div>`,
    );
    const demo =
      el(`<div class="wk-card aw11-dcard"><h3>Why it fits, or why it fails<span class="wk-sp"></span><button class="btn small ghost" data-replay hidden>Replay</button></h3><div class="aw11-demo" data-demo><div class="aw11-idle">Pick a tool and a small demo runs here.</div></div><div class="wk-note aw11-cap" data-cap></div>
      <div class="wk-row" style="margin-top:10px"><button class="btn primary" data-next hidden>Next case</button><button class="btn ghost small" data-restart>Restart deck</button></div></div>`);
    stage.append(card, tools, demo);
    const caseEl = qs("[data-case]", card),
      demoEl = qs("[data-demo]", demo),
      capEl = qs("[data-cap]", demo),
      nextBtn = qs("[data-next]", demo),
      replay = qs("[data-replay]", demo),
      hl = qs("[data-hl]", card);
    const toolBtn = (id) => qs(`[data-t="${id}"]`, tools);
    let lastRun = null;

    function stats() {
      qs("[data-score]", card).textContent = score;
      qs("[data-combo]", card).textContent = "×" + Math.min(5, Math.max(1, combo));
      qs("[data-wrong]", card).textContent = wrong;
      qs("[data-round]", card).textContent = solved >= CASES.length ? "All done" : `Case ${idx + 1} of ${CASES.length}`;
    }
    function showCase() {
      const s = CASES[idx];
      tried = new Set();
      locked = false;
      qs("[data-ct]", caseEl).innerHTML = s.t;
      qs("[data-cb]", caseEl).innerHTML = s.brief;
      qs("[data-cn]", caseEl).innerHTML = `<span>Needs:</span> ${s.need}`;
      caseEl.className = "aw11-case";
      qsa(".aw11-tool", tools).forEach((b) => (b.className = "aw11-tool"));
      nextBtn.hidden = true;
      replay.hidden = true;
      hl.textContent = "Drag the card onto a tool, or tap a tool.";
      demoEl.innerHTML = `<div class="aw11-idle">Pick a tool and a small demo runs here.</div>`;
      capEl.innerHTML = "";
      gen++;
      stats();
      if (fxOn()) N.fx.enter(caseEl, { y: 10, dur: 0.24 });
      api.say(`New client: <b>${s.t}</b>. What does the problem really ask for?`, "think");
    }
    function startDemo(fn) {
      const my = ++gen;
      demoEl.innerHTML = "";
      capEl.innerHTML = "";
      lastRun = fn;
      replay.hidden = false;
      const c = {
        cap: (h) => {
          if (my === gen) capEl.innerHTML = h;
        },
        wait: (ms) => new Promise((r) => setTimeout(() => r(my === gen && demoEl.isConnected), fxOn() ? ms : 0)),
      };
      return Promise.resolve(fn(demoEl, c)).catch((e) => console.error(e));
    }
    async function choose(id) {
      if (locked || tried.has(id) || solved >= CASES.length) return;
      const s = CASES[idx],
        tl = TOOL[id],
        btn = toolBtn(id);
      if (id === s.tool) {
        locked = true;
        combo++;
        best = Math.max(best, combo);
        const pts = 10 * Math.min(5, combo);
        score += pts;
        solved++;
        btn.classList.add("ok");
        caseEl.classList.add("ok");
        snd("correct");
        if (fxOn()) {
          N.fx.pop && N.fx.pop(btn);
          N.fx.floatText(btn, `+${pts}`, "#58cc02");
        }
        api.done("first");
        if (combo >= 3) api.done("combo");
        hl.innerHTML = `<b>${tl.name}</b> is the fit. ${s.why}`;
        api.say(
          combo > 1 ? `Yes! <b>×${Math.min(5, combo)}</b> combo. ${s.why}` : `Yes, <b>${tl.name}</b>. ${s.why}`,
          "love",
        );
        stats();
        qs("[data-score]", card).parentNode && N.wk.flash(qs("[data-score]", card).parentNode);
        await startDemo((b, c) => DEMOS[s.demo](b, c));
        if (solved >= CASES.length) finish();
        else {
          nextBtn.hidden = false;
          nextBtn.textContent = "Next case";
          if (!fxOn()) nextBtn.focus && 0;
        }
        return;
      }
      tried.add(id);
      btn.classList.add("no");
      const near = s.near && s.near[id],
        trap = (s.traps && s.traps[id]) || near;
      if (near) {
        snd("tick");
        hl.innerHTML = `Close, but not the best fit. ${near.say}`;
        api.say(`Close: ${tl.name} works, but there is a better fit. ${near.say}`, "think");
        btn.classList.remove("no");
        btn.classList.add("near");
        await startDemo(near.demo);
        api.done("trap");
        return;
      }
      combo = 0;
      wrong++;
      snd("wrong");
      if (fxOn()) N.fx.shake(btn);
      stats();
      const why = trap ? trap.say : `<b>${tl.name}</b> is for ${tl.does}. This client needs ${s.need}.`;
      hl.innerHTML = `Not quite. ${why}`;
      api.say(`Not quite. ${why}`, "sad");
      if (trap && trap.demo) {
        await startDemo(trap.demo);
        api.done("trap");
      } else {
        demoEl.innerHTML = `<div class="aw11-idle">${why}</div>`;
        capEl.innerHTML = "";
        replay.hidden = true;
      }
    }
    function finish() {
      api.done("clear");
      if (wrong <= 2) api.done("sharp");
      nextBtn.hidden = true;
      qs("[data-ct]", caseEl).innerHTML = "Consultancy complete";
      qs("[data-cb]", caseEl).innerHTML =
        `You matched all ${CASES.length} clients. Score <b>${score}</b>, best combo <b>×${Math.min(5, best)}</b>, <b>${wrong}</b> slip${wrong === 1 ? "" : "s"}.`;
      qs("[data-cn]", caseEl).innerHTML =
        wrong <= 2 ? "Sharp work: two slips or fewer." : "Restart the deck and aim for two slips or fewer.";
      qs("[data-round]", card).textContent = "All done";
      if (fxOn()) N.fx.celebrate(caseEl, { silent: true });
    }
    nextBtn.onclick = () => {
      idx = Math.min(CASES.length - 1, idx + 1);
      showCase();
    };
    replay.onclick = () => lastRun && startDemo(lastRun);
    qs("[data-restart]", demo).onclick = () => {
      idx = 0;
      score = 0;
      combo = 0;
      best = 0;
      wrong = 0;
      solved = 0;
      showCase();
      api.say("Fresh deck. Same clients, new chance for a clean run.", "happy");
    };
    qsa(".aw11-tool", tools).forEach((b) => (b.onclick = () => choose(b.dataset.t)));

    /* drag the card onto a tool */
    let drag = null;
    caseEl.addEventListener("pointerdown", (e) => {
      if (locked || solved >= CASES.length || e.button > 0) return;
      drag = { x: e.clientX, y: e.clientY, moved: false };
      try {
        caseEl.setPointerCapture(e.pointerId);
      } catch (x) {
        /* ignore */
      }
    });
    caseEl.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      drag.moved = true;
      caseEl.classList.add("drag");
      caseEl.style.transform = `translate(${dx}px,${dy}px) scale(.96)`;
      caseEl.style.pointerEvents = "none";
      const t = document.elementFromPoint(e.clientX, e.clientY);
      caseEl.style.pointerEvents = "";
      qsa(".aw11-tool.hot", tools).forEach((b) => b.classList.remove("hot"));
      const tb = t && t.closest && t.closest(".aw11-tool");
      if (tb) tb.classList.add("hot");
    });
    const end = (e) => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      caseEl.classList.remove("drag");
      caseEl.style.transform = "";
      qsa(".aw11-tool.hot", tools).forEach((b) => b.classList.remove("hot"));
      if (!moved) return;
      caseEl.style.pointerEvents = "none";
      const t = document.elementFromPoint(e.clientX, e.clientY);
      caseEl.style.pointerEvents = "";
      const tb = t && t.closest && t.closest(".aw11-tool");
      if (tb) choose(tb.dataset.t);
    };
    caseEl.addEventListener("pointerup", end);
    caseEl.addEventListener("pointercancel", () => {
      drag = null;
      caseEl.classList.remove("drag");
      caseEl.style.transform = "";
    });
    life.onDispose &&
      life.onDispose(() => {
        gen++;
      });
    showCase();
  }

  N.register({
    id: "a11-picker",
    subject: "algo",
    lecture: 11,
    order: 90,
    num: "11.W",
    workshop: true,
    title: "Workshop: pick the algorithm",
    blurb: "Be the consultant. Match ten client problems to the right tool, and see each tool fit or fail.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "byte",
        intro:
          "You are the consultant. Each client brings a problem. Drag their card onto the tool that fits, or tap the tool. Name the <b>assumption</b> that decides it.",
        missions: [
          {
            id: "first",
            t: "First match",
            d: "Route a client to the right tool and watch the demo.",
            hint: "Read what the client needs: every junction, one goal, cheapest total, a fence, one flipped bit, edits showing up, frequencies, letters, a mix, link scores.",
          },
          {
            id: "trap",
            t: "Watch a tool fail",
            d: "Pick a tool that does not fit. Some of them play a demo showing why they fail.",
            hint: "Try <b>MST</b> on the ambulance case, or <b>CRC</b> on the probe. A slip resets your combo, so do it on purpose.",
          },
          {
            id: "combo",
            t: "Combo of three",
            d: "Get three right in a row with no slip in between.",
            hint: "If you slip, the combo resets. Restart the deck to try again from the top.",
          },
          {
            id: "clear",
            t: "Clear the desk",
            d: "Match all ten clients.",
            hint: "Some decoys are close cousins: CRC and Hamming, Huffman and LZW, Dijkstra and A*, PageRank and Attention.",
          },
          {
            id: "sharp",
            t: "Sharp consultant",
            d: "Finish all ten with two slips or fewer.",
            hint: "Use <b>Restart deck</b> for a clean run once you know the answers, and explain each one to yourself.",
          },
        ],
        build: (stage, api) => picker(stage, api, life),
      });
      root.appendChild(
        predict({
          id: "a11-picker-1",
          q: "A planner's route tool starts returning wrong answers after refund roads with negative cost are added. What broke?",
          opts: [
            "The settled-means-final rule",
            "The rule that an MST has no loops",
            "The need for parity bits to overlap",
          ],
          a: 0,
          why: "Dijkstra locks in the closest unsettled node because any detour can only add cost. A negative road subtracts cost, so a settled node can later be undercut.",
        }),
      );
      root.appendChild(
        predict({
          id: "a11-picker-2",
          q: "A link flips one bit and the receiver cannot ask for a resend. Which tool repairs it?",
          opts: ["Hamming code", "CRC", "Hash chain"],
          a: 0,
          why: "Hamming's overlapping parity checks spell out the position of a single flipped bit. A CRC only detects the error, and a hash chain guards against edits, not noise.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Pick the algorithm by the <b>assumption</b> it exploits: non-negative costs, a safe cut, skewed symbols, a linear objective, one flipped bit.",
            "Close cousins differ in what they promise: <b>shortest route</b> is not <b>cheapest wiring</b>, and <b>detect</b> is not <b>correct</b>.",
            "When an assumption breaks, find the guarantee that went with it, then choose a tool that survives.",
          ],
          "Name the tool and the assumption that makes it right.",
        ),
      );
    },
  });
  L["a11-picker"] = {
    sum: "Play consultant: match ten client problems to the right algorithm from the whole course, and watch each choice fit or fail.",
    steps: [
      {
        t: "What you will practise",
        b: `<p>Ten phases, ten tools. Each brief hides one <b>decisive assumption</b>: costs that are never negative, a linear objective, a single flipped bit.</p><p><span class="key">Find the assumption first. The algorithm follows.</span></p>`,
        v: F.flow([
          { t: "Read the brief", c: "blue" },
          { t: "Spot the assumption", c: "amber" },
          { t: "Choose the tool", c: "teal" },
        ]),
        c: {
          q: "What should you look for first in a client brief?",
          o: [
            "The assumption behind the right tool",
            "The longest word in the problem",
            "Whichever algorithm you met most recently",
          ],
          a: 0,
          why: "Every algorithm is a bet on its assumptions, so the assumptions in the brief point to the tool.",
        },
      },
      {
        t: "Near neighbours",
        b: `<p>The hard cases are cousins: <b>Dijkstra</b> and <b>MST</b> both grow outwards greedily, but one minimises a journey and the other the total wiring. <b>CRC</b> and <b>Hamming</b> both add check bits, but only one can repair.</p>`,
        v: F.compare(
          { title: "Shortest path", c: "blue", body: "cheapest journey from one start" },
          { title: "MST", c: "teal", body: "cheapest wiring for everyone" },
        ),
        c: {
          q: "Which goal does an MST serve?",
          o: [
            "Linking every point as cheaply as possible",
            "Finding the quickest journey between two points",
            "Finding the outline around a set of points",
          ],
          a: 0,
          why: "An MST minimises the total cost of a connected network, which is not the same as any single shortest route.",
        },
      },
    ],
    guide: ["Work through the missions in the workshop."],
  };
})();

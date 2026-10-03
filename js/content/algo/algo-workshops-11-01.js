/* Algorithms, Phase 11 workshop: the algorithm picker (no code).
   11.W "Consultancy: pick the algorithm". Route each client brief to the right tool (drag the card, or tap a tool).
   Every demo runs the real algorithm on a small input; nothing shown is typed in. */
(function () {
  const partScope = (NIC.shared.algoWorkshops11 = NIC.shared.algoWorkshops11 || {});

  const N = NIC,
    { qs } = N;

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
  Object.assign(partScope, {
    CRC_DATA,
    CRC_GEN,
    FIELD,
    FREQ,
    GRID,
    HAM_DATA,
    HAM_HIT,
    HPOS,
    LEDGER,
    LP,
    OFFICES,
    ROADS,
    SIG,
    SQUARE,
    WEB,
    cells,
    crcRem,
    dftMags,
    dijkstra,
    djb2,
    flash,
    fxOn,
    graham,
    graphSvg,
    gridSearch,
    hammingCheck,
    hammingEncode,
    huffman,
    kruskal,
    lpCorners,
    pageRank,
    r2,
    snd,
    treeCost,
  });
})();

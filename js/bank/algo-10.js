(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { grid, surfFig1, svg, tokenFig, trapFig, tx, wallSet } = partScope;
  const B = NIC.bank,
    Qf = NIC.qfig;
  const dashed = "stroke-dasharray:5 4";

  B.add("a1-surfer", [
    {
      type: "pick",
      q: "Every page starts equal and the usual damped PageRank is run to convergence. Click the page with the <b>highest</b> PageRank. (Arrows show who links to whom.)",
      fig: surfFig1,
      a: "H",
      hint: "Which page gets rank from a page that itself receives rank from lots of places?",
      why: "H wins. U and H both have three incoming links, but U's come from p, q and r, which nobody links to, so they carry almost no rank. H is fed by U, by s and by T, and T returns everything H passes it. A link is worth what its source is worth.",
    },
    {
      type: "pick",
      q: "This web is run with <b>no teleporting</b> (d = 1), forever. A double arrow means each page links to the other. Click every page whose rank ends up at zero.",
      fig: trapFig,
      a: ["S", "T", "W"],
      why: "U and V only link to each other, so rank that reaches them never comes back out. S has no incoming links at all, so it gets nothing, W only gets from S, and T's rank drains into the U–V trap. In the long run all of it sits in U and V. Teleporting is what stops this.",
    },
    {
      type: "mcq",
      q: "Each page pours all its tokens into its outgoing links, split equally. The tokens now are shown. After <b>one</b> step, how many tokens will C hold?",
      fig: tokenFig,
      o: ["10", "20", "30", "60"],
      a: 2,
      hint: "C hears from A and from B. A has two links, so only half of its 20 reaches C. B has one link.",
      why: "From A: 20 ÷ 2 = 10. From B (a single link): all 20. C holds 10 + 20 = <b>30</b>. (D passes on nothing to C: it links to A and B.) A page with fewer links gives each target a bigger share.",
    },
    {
      type: "slider",
      q: "A surfer follows a random link with probability d = 0.5 and teleports otherwise. What percentage of surfers are <b>still</b> clicking links, with no teleport yet, after 3 clicks in a row?",
      min: 0,
      max: 100,
      step: 0.5,
      ans: 12.5,
      tol: 5,
      unit: "%",
      hint: "Each click survives with probability ½. So ½ × ½ × ½.",
      why: "The chance of avoiding the teleport three times running is d³ = 0.5 × 0.5 × 0.5 = 0.125, so about 12.5%. With d = 0.85 it would be about 61%: a high d keeps surfers on the links, a low d scatters them.",
    },
    {
      type: "cat",
      q: "Run PageRank with <b>no teleporting and no dangling-page repair</b>. What happens to the rank in each situation?",
      buckets: ["Rank leaks away", "Rank gets trapped", "Flows normally"],
      items: [
        ["A page with no outgoing links", 0],
        ["A page whose only link points to a page with no links", 0],
        ["Two pages that only link to each other, with other pages linking in", 1],
        ["A page that links only to itself", 1],
        ["A page with 200 outgoing links among a well-connected web", 2],
        ["Every page has a link, and any page can be reached from any other", 2],
      ],
      why: "A page with no links out simply loses the rank it receives (the total shrinks). A cycle that nothing leaves keeps the rank forever and starves the pages that feed it. A long link list only dilutes each share; and a strongly connected web with no dead ends keeps all its rank moving.",
    },
    {
      type: "bug",
      q: "One damped PageRank step. The rank is not being shared out correctly. Click the faulty line.",
      code: [
        "def step(rank, links, d):",
        "    n = len(rank)",
        "    new = {p: (1 - d) / n for p in rank}",
        "    for p in rank:",
        "        share = rank[p] / len(links)",
        "        for q in links[p]:",
        "            new[q] += d * share",
        "    return new",
      ],
      a: 4,
      why: "A page splits its rank over <i>its own</i> outgoing links: <code>len(links[p])</code>. Dividing by <code>len(links)</code> (the number of pages in the web) gives every link the same tiny share, whether the page links to two pages or two hundred.",
    },
  ]);

  /* =====================================================================
     Phase 1: PageRank as a matrix
     ===================================================================== */
  const hFig = (() => {
    const g = Qf.graph(
      { A: [60, 50], B: [190, 50], D: [60, 180], C: [190, 180] },
      [
        ["A", "B"],
        ["A", "C"],
        ["B", "C"],
        ["C", "D"],
        ["D", "A"],
        ["D", "B"],
      ],
      { directed: true, w: 260, h: 240 },
    );
    const cols = { A: ["0", "½", "½", "0"], B: ["0", "0", "1", "0"], C: ["0", "0", "0", "1"], D: ["1", "1", "0", "0"] },
      names = ["A", "B", "C", "D"];
    let s = "";
    names.forEach((n, i) => {
      s += tx(40, 66 + i * 34, "to " + n, { sz: 12, c: "var(--text-dim)", a: "end" });
    });
    names.forEach((n, j) => {
      const x = 60 + j * 66;
      s += `<g data-pick="${n}"><rect x="${x}" y="8" width="58" height="176" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(x + 29, 30, "from " + n, { sz: 12, c: "var(--text-dim)" })}${cols[n].map((v, i) => tx(x + 29, 66 + i * 34, v, { sz: 17, f: "var(--mono)" })).join("")}</g>`;
    });
    return `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center"><div style="flex:1 1 200px;min-width:200px">${g}</div><div style="flex:1 1 280px;min-width:280px">${svg(330, 190, s, true)}</div></div>`;
  })();

  const convFig = (() => {
    const e5 = [0.07692, 0.03077, 0.01058, 0.00288, 0.0012, 0.00048, 0.00017, 0.00005, 0.00002, 0.00001, 0, 0];
    const e95 = [
      0.22175, 0.17496, 0.11618, 0.06284, 0.04515, 0.03563, 0.02366, 0.0128, 0.00919, 0.00725, 0.00482, 0.00261,
    ];
    const w = 520,
      h = 250,
      X = (i) => 56 + (i - 1) * 40,
      Y = (v) => h - 40 - v * (180 / 0.25);
    let s = "";
    [0, 0.05, 0.1, 0.15, 0.2, 0.25].forEach(
      (v) =>
        (s += `<line x1="50" y1="${Y(v)}" x2="500" y2="${Y(v)}" stroke="var(--line)"/>${tx(44, Y(v) + 4, v.toFixed(2), { a: "end", sz: 11, c: "var(--text-dim)" })}`),
    );
    for (let i = 1; i <= 12; i++) s += tx(X(i), h - 22, i, { sz: 11, c: "var(--text-dim)" });
    s += tx(280, h - 4, "iteration", { sz: 12, c: "var(--text-dim)" });
    s +=
      `<line x1="50" y1="${Y(0.01)}" x2="500" y2="${Y(0.01)}" stroke="var(--rose)" stroke-width="2" style="${dashed}"/>` +
      tx(498, Y(0.01) - 6, "stop when below 0.01", { a: "end", sz: 11, c: "var(--rose-ink)" });
    const line = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${X(i + 1)} ${Y(v)}`).join("");
    s += `<g data-pick="low"><path d="${line(e5)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linecap="round"/><path d="${line(e5)}" fill="none" stroke="transparent" stroke-width="18"/>${tx(X(2) + 34, Y(e5[1]) - 16, "blue run", { c: "var(--blue-ink)", sz: 12 })}</g>`;
    s += `<g data-pick="high"><path d="${line(e95)}" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linecap="round"/><path d="${line(e95)}" fill="none" stroke="transparent" stroke-width="18"/>${tx(X(5), Y(e95[4]) - 12, "orange run", { c: "var(--amber-ink)", sz: 12 })}</g>`;
    return svg(w, h, s, true);
  })();

  const sumFig = `<table class="t" style="max-width:380px"><thead><tr><th>Iteration</th><th class="num">Sum of all ranks</th></tr></thead><tbody>${[
    ["0 (start)", "1.000"],
    ["1", "0.787"],
    ["2", "0.697"],
    ["3", "0.582"],
    ["4", "0.533"],
    ["5", "0.498"],
    ["6", "0.472"],
  ]
    .map(([a, b]) => `<tr><td>${a}</td><td class="num">${b}</td></tr>`)
    .join("")}</tbody></table>`;
  const fixFig = Qf.graph(
    { A: [60, 125], B: [230, 45], C: [230, 205], D: [400, 125] },
    [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["D", "A"],
    ],
    { directed: true, w: 460, h: 250 },
  );

  B.add("a1-pagerank", [
    {
      type: "pick",
      q: "The link matrix <b>H</b> was built for the web on the left (column = the page that is linking). One column breaks the rule for H. Click it.",
      fig: hFig,
      a: "D",
      hint: "Each column should add up to 1: a page shares out exactly its whole rank.",
      why: "D links to A and B, so it should pass ½ to each: column D is (½, ½, 0, 0). As drawn it adds up to 2, so the matrix would create rank from nothing. Every column of H (and of G) must sum to 1.",
    },
    {
      type: "pick",
      q: "Two PageRank runs on the same web use d = 0.5 and d = 0.95. The graph shows how far the rank vector moved each iteration. Click the run that used d = 0.95.",
      fig: convFig,
      a: "high",
      why: "A high d means a surfer teleports rarely, so rank takes many more rounds to spread out and settle. The orange run falls by only about a quarter each iteration and needs 9 iterations to get below 0.01; the blue run (d = 0.5) is there in 4.",
    },
    {
      type: "mcq",
      q: "With no damping, the PageRank vector p must satisfy <b>p = G p</b>: one more step changes nothing. Which vector does that for this web?",
      fig: fixFig,
      o: [
        "A 1/3 · B 1/6 · C 1/6 · D 1/3",
        "A 1/4 · B 1/4 · C 1/4 · D 1/4",
        "A 1/6 · B 1/3 · C 1/3 · D 1/6",
        "A 1/3 · B 1/3 · C 1/6 · D 1/6",
      ],
      a: 0,
      hint: "A gets rank only from D. B and C each get half of A's rank. D gets all of B's and C's.",
      why: "Check the rules: A = D, B = A/2, C = A/2, D = B + C. With A = D = 1/3 and B = C = 1/6 all four hold, and they add to 1. The uniform vector fails: B would receive only half of A's 1/4, which is 1/8, not 1/4.",
    },
    {
      type: "order",
      q: "Put one damped PageRank iteration in order.",
      items: [
        "Split each page's rank equally across its outgoing links (a page with none shares with everyone)",
        "Multiply every share by the damping factor d",
        "Add the teleport share (1 − d)/N to every page",
        "Measure how far the vector moved, and stop if it is below the tolerance",
      ],
      why: "Move the rank along the links first, damp it, then top every page up with its teleport floor so the total returns to 1. Only the finished new vector is compared with the old one to decide whether to stop.",
    },
    {
      type: "bug",
      q: "This power iteration for PageRank always returns a vector of zeros. Click the faulty line.",
      code: [
        "def pagerank(G, tol=1e-8):",
        "    n = len(G)",
        "    p = np.zeros(n)",
        "    while True:",
        "        new = G @ p",
        "        if abs(new - p).sum() < tol:",
        "            return new",
        "        p = new",
      ],
      a: 2,
      why: "A matrix times a zero vector is a zero vector, so the loop 'converges' straight away on the wrong answer. The start must be a probability distribution that sums to 1, usually <code>np.full(n, 1 / n)</code>.",
    },
    {
      type: "mcq",
      q: "A team's PageRank code adds the damping and the teleport step correctly, but the total rank behaves like this on a web where one page has no outgoing links. What is most likely missing?",
      fig: sumFig,
      o: [
        "Rank held by pages with no links out is never redistributed",
        "The teleport share (1 − d)/N is being added to every page twice over",
        "The starting vector was not normalised, so it adds up to more than 1",
        "The loop keeps running for more iterations than the tolerance needs",
      ],
      a: 0,
      why: "The total starts at exactly 1 and then falls every round, so something is removing rank. A page with no links pours its rank nowhere unless its column is repaired (replaced by 1/N each). Adding teleport twice would make the total rise, not fall.",
    },
  ]);

  /* =====================================================================
     Lecture 2: Dijkstra
     ===================================================================== */
  const dG1 = { S: [50, 130], A: [170, 50], B: [170, 210], C: [320, 50], D: [320, 210], T: [450, 130] };
  const dE1 = [
    ["S", "A", 2],
    ["S", "B", 5],
    ["A", "B", 2],
    ["A", "C", 4],
    ["B", "D", 3],
    ["C", "T", 3],
    ["D", "T", 1],
    ["C", "D", 6],
  ];
  const dG2 = { S: [50, 130], B: [150, 55], A: [150, 210], D: [290, 55], C: [290, 210], E: [440, 130] };
  const dE2 = [
    ["S", "B", 1],
    ["S", "A", 3],
    ["B", "A", 1],
    ["A", "C", 4],
    ["B", "D", 6],
    ["C", "E", 2],
    ["D", "E", 3],
  ];
  const claimed = { S: 0, B: 1, A: 3, C: 6, D: 7, E: 8 };
  const wrongFig = Qf.graph(dG2, dE2, { pick: "nodes", w: 500, h: 270 }).replace(
    "</svg>",
    Object.entries(dG2)
      .map(([k, [x, y]]) => tx(x, y + (y > 150 ? 40 : -28), "dist " + claimed[k], { sz: 12, c: "var(--amber-ink)" }))
      .join("") + "</svg>",
  );
  const hopFig = Qf.graph(
    { S: [50, 130], A: [170, 50], B: [310, 50], C: [240, 215], T: [450, 130] },
    [
      ["S", "T", 9],
      ["S", "A", 2],
      ["A", "B", 3],
      ["B", "T", 1],
      ["S", "C", 5],
      ["C", "T", 5],
    ],
    { w: 500, h: 260 },
  );

  B.add("a2-dijkstra", [
    {
      type: "pick",
      q: "Dijkstra runs from S on this map. The final <b>shortest-path tree</b> is the set of roads actually used to reach each node. Click every road in it.",
      fig: Qf.graph(dG1, dE1, { pick: "edges", w: 500, h: 260 }),
      a: ["S-A", "A-B", "A-C", "B-D", "D-T"],
      hint: "Find each node's final distance, then ask which road delivered it.",
      why: "Distances: A 2, B 4 (via A, beating the direct road of 5), C 6, D 7, T 8 (via D: 7 + 1, beating C: 6 + 3 = 9). The roads S–B, C–T and C–D are never the best way into a node, so they stay out of the tree.",
    },
    {
      type: "pick",
      q: "A student claims these are the shortest distances from S. Exactly one label is wrong. Click that node.",
      fig: wrongFig,
      a: "A",
      hint: "Look for a cheaper way into each node than the direct road.",
      why: "S → B → A costs 1 + 1 = 2, cheaper than the direct road S–A (3). The rest check out: C = 2 + 4 = 6, D = 1 + 6 = 7, E = 6 + 2 = 8. The slip is typical of grabbing the first road you see rather than relaxing through every settled node.",
    },
    {
      type: "bug",
      q: "This heap-based Dijkstra is meant to always take the closest unsettled node next, but it doesn't. Click the line that breaks that.",
      code: [
        "def dijkstra(graph, s):",
        '    dist = {v: float("inf") for v in graph}',
        "    dist[s] = 0",
        "    heap = [(0, s)]",
        "    while heap:",
        "        d, u = heapq.heappop(heap)",
        "        for v, w in graph[u]:",
        "            if d + w < dist[v]:",
        "                dist[v] = d + w",
        "                heapq.heappush(heap, (w, v))",
        "    return dist",
      ],
      a: 9,
      why: "The heap must be ordered by distance from the source, <code>d + w</code>. Pushing just the edge weight <code>w</code> orders nodes by the length of their last road, so far-away nodes can jump the queue and the guarantee that 'popped means final' is lost.",
    },
    {
      type: "cat",
      q: "Which of these can Dijkstra's algorithm handle safely?",
      buckets: ["Dijkstra is safe", "Needs another algorithm"],
      items: [
        ["A road map with distances in kilometres", 0],
        ["Flights where some legs are free (cost 0)", 0],
        ["Several parallel roads between the same two towns", 0],
        ["A network where one link refunds 2 units (cost −2)", 1],
        ["Currency exchange scored as negative logs of rates, so some trades gain", 1],
      ],
      why: "Dijkstra's safety argument says a later detour can only add cost. Zero is fine, and parallel roads just give it more choices. Negative weights break the argument, so use Bellman–Ford instead.",
    },
    {
      type: "mcq",
      q: "A traveller wants the cheapest trip from S to T on this map (road costs shown). Which route does Dijkstra return?",
      fig: hopFig,
      o: [
        "S → T directly, total cost 9",
        "S → A → B → T, total cost 6",
        "S → C → T, total cost 10",
        "S → A → B → T, total cost 8",
      ],
      a: 1,
      why: "Dijkstra minimises the <i>total weight</i>, not the number of roads. The direct road is only one hop but costs 9, while 2 + 3 + 1 = 6 using three hops. Via C it costs 5 + 5 = 10.",
    },
    {
      type: "multi",
      q: "At the moment Dijkstra settles a node u, which of these are true? Select all that apply.",
      o: [
        "u's distance is final and cannot drop later",
        "Every node still waiting has a tentative distance at least as big as u's",
        "Every neighbour of u is already settled",
        "Every node settled earlier has a distance no bigger than u's",
        "u's shortest path goes only through nodes that are already settled",
        "Every road in the graph has been relaxed at least once",
      ],
      a: [0, 1, 3, 4],
      why: "Settling the smallest tentative distance means nothing waiting can undercut it (there is no negative road), and the settled nodes come out in non-decreasing order. u's neighbours may well still be waiting (relaxing them is the next job), and many roads haven't been looked at yet.",
    },
  ]);

  /* =====================================================================
     Lecture 2: A*
     ===================================================================== */
  const aWalls = wallSet([
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
  ]);
  const nextFig = (() => {
    const cs = 52,
      cells = {},
      gTxt = (g) => ({ fill: "var(--violet-dim)", stroke: "var(--violet)", t: "g " + g });
    [
      ["0,1", 1],
      ["0,3", 1],
      ["1,1", 2],
      ["1,3", 2],
      ["2,1", 3],
      ["2,3", 3],
      ["3,2", 3],
    ].forEach(([k, g]) => (cells[k] = { ...gTxt(g), pick: k }));
    cells["0,2"] = { fill: "var(--amber-dim)", stroke: "var(--amber)", t: "S" };
    cells["1,2"] = { fill: "var(--teal-dim)", stroke: "var(--teal)", t: "done" };
    cells["2,2"] = { fill: "var(--teal-dim)", stroke: "var(--teal)", t: "done" };
    cells["7,2"] = { fill: "var(--rose-dim)", stroke: "var(--rose)", t: "G" };
    return svg(
      8 * cs + 2,
      5 * cs + 30,
      grid(8, 5, cs, { cells, walls: aWalls }) +
        tx(4 * cs, 5 * cs + 22, "green: already expanded · purple: waiting, with its g · dark: wall", {
          sz: 12,
          c: "var(--text-dim)",
        }),
      true,
    );
  })();
  Object.assign(partScope, { nextFig });
})();

(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { hLab, inj, oneStepFig, qualityFig, rowRect, svg, tx } = partScope;
  const B = NIC.bank,
    Qf = NIC.qfig;

  B.add("a1-pagerank", [
    {
      type: "slider",
      q: "A web has 5 pages and the damping is d = 0.85. Even a page that nobody links to still receives a small steady share of rank from teleporting. How much rank is that, as a percentage of all the rank?",
      min: 0,
      max: 20,
      step: 1,
      ans: 3,
      tol: 1,
      unit: "%",
      hint: "Teleporting gives (1 − d) ÷ n to every page. Work out 0.15 ÷ 5.",
      why: "(1 − 0.85) ÷ 5 = 0.03, so every page has at least 3%. That floor is why no page in the damped matrix ever ends up at zero.",
    },
    {
      type: "pick",
      q: "Every page starts with 0.25 and there is <b>no</b> damping. Each page splits its rank equally between the pages it links to. After <b>one</b> step, which page holds the <b>least</b> rank?",
      fig: oneStepFig,
      a: "B",
      hint: "Count who links to each page, and how many links each of those pages has.",
      why: "B gets only A's third (0.25 ÷ 3 ≈ 0.08). A gets half of C's 0.25 (0.125), D gets a third of A plus half of C (about 0.21), and C collects from A, B and D (about 0.58).",
    },
    {
      type: "cat",
      q: "Think about the full damped PageRank matrix <b>G</b> (links plus teleporting). Is each statement true of it?",
      buckets: ["True of G", "Not true of G"],
      items: [
        ["Every column adds up to 1", 0],
        ["Every entry is greater than 0", 0],
        ["Every row adds up to 1", 1],
        ["Most entries are zero, so it is sparse", 1],
        ["1 is an eigenvalue, and PageRank is its eigenvector", 0],
      ],
      why: "Each column is a probability split, so it sums to 1. Teleporting adds a positive amount everywhere, which makes G dense. Rows can add up to anything: a popular page has a big row sum.",
    },
    {
      type: "multi",
      q: "You have a PageRank program that has converged. Which changes would alter the final PageRank vector? Select all.",
      o: [
        "Changing the damping from 0.85 to 0.5",
        "Starting from a random positive vector instead of equal ranks",
        "Adding one new link between two pages",
        "Stopping when the change is below 1e-8 instead of 1e-6",
        "Numbering the pages in a different order",
      ],
      a: [0, 2],
      why: "The answer depends on the web and on d. The start vector only affects the journey, the tolerance only affects when you stop, and renumbering relabels pages without changing who links to whom.",
    },
    {
      type: "mcq",
      q: "Page P has two incoming links from pages nobody links to. Page Q has just one incoming link, from W, which has five incoming links of its own. Which page ends up with the higher PageRank?",
      fig: qualityFig,
      o: [
        "Q, because its single link comes from a well-linked page",
        "P, because two incoming links beat one",
        "They tie, because every page starts with equal rank",
        "P, because it links back to a page that links to it",
      ],
      a: 0,
      why: "Run the iteration and Q settles near 0.21, P near 0.15. A link passes on a share of the rank of the page it comes from, so one link from an important page is worth more than two from pages that nobody links to.",
    },
    {
      type: "bug",
      q: "This power iteration should stop once the ranks stop changing, but it always stops after one step with a wrong answer. Click the faulty line.",
      code: [
        "p = [1 / n] * n",
        "while True:",
        "    q = matvec(G, p)",
        "    if diff(q, q) < 1e-9:",
        "        break",
        "    p = q",
      ],
      a: 3,
      why: "<code>diff(q, q)</code> compares the new vector with itself, so it is always 0. It should compare with the old one, <code>diff(q, p)</code>.",
    },
  ]);

  /* =====================================================================
     a2-dijkstra
     ===================================================================== */
  const orderGraph = Qf.graph(
    { S: [45, 130], A: [160, 50], B: [160, 210], D: [290, 50], C: [290, 210], E: [385, 50], T: [455, 150] },
    [
      ["S", "A", 4],
      ["S", "B", 2],
      ["B", "A", 1],
      ["B", "C", 5],
      ["A", "D", 3],
      ["C", "T", 2],
      ["D", "T", 6],
      ["D", "E", 2],
      ["E", "T", 3],
    ],
    { w: 500, h: 262, r: 18 },
  );
  const whatIfGraph = Qf.graph(
    { S: [40, 135], X: [140, 135], P: [250, 55], Q: [250, 150], Y: [350, 100], T: [450, 135], Z: [250, 260] },
    [
      ["S", "X", 3],
      ["X", "P", 2],
      ["P", "Y", 2],
      ["X", "Q", 3],
      ["Q", "Y", 1],
      ["Y", "T", 4],
      ["S", "Z", 10],
      ["Z", "T", 2],
    ],
    { pick: "edges", w: 490, h: 290, r: 18 },
  );
  const stopGraph = Qf.graph(
    {
      S: [45, 130],
      A: [150, 45],
      B: [150, 130],
      C: [150, 215],
      D: [275, 85],
      E: [300, 170],
      F: [300, 235],
      T: [430, 130],
    },
    [
      ["S", "A", 3],
      ["S", "B", 5],
      ["S", "C", 9],
      ["A", "D", 4],
      ["B", "D", 1],
      ["B", "E", 6],
      ["C", "F", 2],
      ["D", "T", 2],
      ["E", "T", 3],
      ["F", "T", 4],
    ],
    { pick: "nodes", w: 490, h: 262, r: 18 },
  );
  const bfsGraph = Qf.graph(
    { S: [50, 140], A: [170, 55], B: [320, 55], C: [250, 220], T: [450, 140] },
    [
      ["S", "T", 9],
      ["S", "A", 2],
      ["A", "B", 3],
      ["B", "T", 2],
      ["S", "C", 4],
      ["C", "T", 6],
    ],
    { w: 500, h: 262, r: 19 },
  );

  B.add("a2-dijkstra", [
    {
      type: "order",
      q: "Dijkstra runs from S on this map (road costs shown). Put the nodes in the order Dijkstra <b>settles</b> them, S first.",
      fig: orderGraph,
      items: ["S", "B", "A", "D", "C", "E", "T"],
      hint: "Final distances: B 2, A 3, D 6, C 7, E 8, T 9.",
      why: "Each time, Dijkstra settles the unsettled node with the smallest tentative distance: S (0), B (2), A (3 via B), D (6), C (7), E (8) and T (9 via C).",
    },
    {
      type: "match",
      q: "Dijkstra always needs the closest unsettled node. Match each graph to the way of finding it that suits best.",
      pairs: [
        ["A tiny classroom graph with 6 nodes", "Scan every node: simple and fast enough"],
        [
          "A road network with millions of junctions and about 3 roads each",
          "A binary heap that hands over the minimum",
        ],
        ["Every road costs exactly 1", "Plain breadth-first search: no priority queue needed"],
        ["Almost every pair of towns joined by its own road", "A simple array scan: the heap saves little"],
      ],
      why: "Scanning costs about n² in total. A heap costs about (n + roads) × log n, which wins hugely on sparse maps but not on dense ones. With equal costs, a queue already gives the closest node.",
    },
    {
      type: "pick",
      q: "Each road below is made <b>1 more expensive</b>, one road at a time. Click every road where doing that makes the shortest distance from S to T <b>increase</b>.",
      fig: whatIfGraph,
      a: ["S-X", "Y-T"],
      hint: "Find every shortest route first. Is there more than one?",
      why: "The shortest distance is 11, along S–X–P–Y–T and also S–X–Q–Y–T (and S–Z–T ties at 12 only after a rise). S–X and Y–T lie on every shortest route, so raising either one lifts the distance to 12. Raising a road on just one of the tied routes changes nothing.",
    },
    {
      type: "bug",
      q: "Dijkstra saves for each node the node it came from (<code>prev</code>). This should return the route from <code>s</code> to <code>t</code>, but it comes out backwards. Click the faulty line.",
      code: [
        "def route(prev, s, t):",
        "    path = [t]",
        "    while path[-1] != s:",
        "        path.append(prev[path[-1]])",
        "    return path",
      ],
      a: 4,
      why: "The loop walks from t back to s, so the list is in reverse. It should end with <code>return path[::-1]</code>.",
    },
    {
      type: "mcq",
      q: "A friend uses breadth-first search (fewest roads) on this map and drives that route. Dijkstra finds the cheapest. How do the two routes from S to T compare?",
      fig: bfsGraph,
      o: [
        "The fewest-roads route costs 2 more than the cheapest",
        "The two routes are the same",
        "The fewest-roads route costs 5 more than the cheapest",
        "The fewest-roads route is also the cheapest, but not unique",
      ],
      a: 0,
      hint: "Cheapest: S–A–B–T. Fewest roads: the single road S–T.",
      why: "BFS picks S–T, one road costing 9. Dijkstra picks S–A–B–T for 2 + 3 + 2 = 7. BFS counts roads, not costs, so it only suits maps where every road costs the same.",
    },
    {
      type: "pick",
      q: "Dijkstra stops the instant it settles T, because that is all it was asked for. Click <b>every</b> node that never gets settled.",
      fig: stopGraph,
      a: ["C", "E", "F"],
      hint: "A node is settled before T only if its distance from S is less than T's.",
      why: "Distances from S: A 3, B 5, D 6, T 8, then C 9, E 11 and F 11. Anything farther than T is still waiting when Dijkstra stops, so asking for one target saves work.",
    },
  ]);

  /* =====================================================================
     a2-astar
     ===================================================================== */
  const astarNodes = { S: [50, 130], A: [170, 50], B: [170, 210], C: [310, 50], D: [310, 210], G: [450, 130] };
  const astarGraph = inj(
    Qf.graph(
      astarNodes,
      [
        ["S", "A", 2],
        ["S", "B", 3],
        ["A", "C", 4],
        ["B", "D", 2],
        ["C", "G", 3],
        ["D", "G", 5],
        ["A", "B", 2],
      ],
      { w: 500, h: 262, r: 18 },
    ),
    hLab(astarNodes, { S: 6, A: 5, B: 3, C: 2, D: 5, G: 0 }, 34),
  );
  const heurNodes = { S: [50, 130], A: [170, 50], B: [170, 210], C: [310, 50], D: [310, 210], G: [450, 130] };
  const heurGraph = inj(
    Qf.graph(
      heurNodes,
      [
        ["S", "A", 3],
        ["S", "B", 4],
        ["A", "C", 2],
        ["B", "C", 5],
        ["C", "G", 4],
        ["B", "D", 3],
        ["D", "G", 6],
      ],
      { pick: "nodes", w: 500, h: 262, r: 18 },
    ),
    hLab(heurNodes, { S: 8, A: 7, B: 9, C: 4, D: 8, G: 0 }, 34),
  );
  const runsTable = (() => {
    const rows = [
      ["k0", "0 × Manhattan (that is Dijkstra)", "58", "16"],
      ["k1", "1 × Manhattan", "39", "16"],
      ["k3", "3 × Manhattan", "29", "18"],
      ["k6", "6 × Manhattan", "26", "20"],
    ];
    let s =
      tx(150, 18, "Heuristic used", { sz: 12, c: "var(--text-dim)" }) +
      tx(340, 18, "Cells expanded", { sz: 12, c: "var(--text-dim)" }) +
      tx(440, 18, "Path length", { sz: 12, c: "var(--text-dim)" });
    rows.forEach(([id, a, b, c], i) => {
      const y = 28 + i * 44;
      s += rowRect(
        6,
        y,
        488,
        36,
        id,
        tx(150, y + 24, a, { sz: 14 }) + tx(340, y + 24, b, { sz: 15 }) + tx(440, y + 24, c, { sz: 15 }),
      );
    });
    return svg(500, 210, s);
  })();

  B.add("a2-astar", [
    {
      type: "order",
      q: "A* runs from S to G on this graph. Each node shows its heuristic h. Put the nodes A* <b>expands</b> in order, S first. (D is never expanded, so it isn't listed.)",
      fig: astarGraph,
      items: ["S", "B", "A", "C", "G"],
      hint: "Expand the open node with the smallest f = g + h. Start: f(S) = 0 + 6.",
      why: "S (f 6). Then B (g 3, f 6) and A (g 2, f 7). B's neighbour D gets f = 5 + 5 = 10. A leads to C (g 6, f 8), then G (g 9, f 9). D's f of 10 is above the goal's 9, so A* finishes before touching it.",
    },
    {
      type: "pick",
      q: "The same maze was searched four times with the heuristic multiplied by a different number. Dijkstra's run (0 ×) is always shortest. Click <b>every</b> run that returned a longer-than-shortest path.",
      fig: runsTable,
      a: ["k3", "k6"],
      why: "The shortest path is 16. Multiplying by 3 or 6 makes the heuristic overestimate, so A* chases the goal and expands fewer cells but accepts a longer path (18 and 20). Weight 1 is safe and still beats Dijkstra on work.",
    },
    {
      type: "bug",
      q: "This A* sets a node's cost the first time it sees it and never improves it. It sometimes returns a long route. Click the faulty line.",
      code: [
        "for nb, w in graph[u]:",
        "    new_g = g[u] + w",
        "    if nb not in g:",
        "        g[nb] = new_g",
        "        push(open, (new_g + h(nb), nb))",
      ],
      a: 2,
      why: "A cheaper way to reach a node already seen must be accepted. The test should be <code>if nb not in g or new_g &lt; g[nb]:</code>.",
    },
    {
      type: "match",
      q: "Pick the best search for each job.",
      pairs: [
        ["Shortest route through a maze where every step costs 1", "Breadth-first search"],
        ["Cheapest route on a road map, with no idea where the goal is", "Dijkstra"],
        ["Cheapest route on a road map, and you know the goal's coordinates", "A* with a straight-line heuristic"],
        ["Shortest paths when some edges can be negative", "Bellman–Ford"],
      ],
      why: "A* needs a location sense (a heuristic) to beat Dijkstra. Dijkstra needs non-negative costs, and BFS only counts steps.",
    },
    {
      type: "pick",
      q: "A* is being tested with the heuristic values h shown under each node, and the goal is G. Click <b>every</b> node where h overestimates the real remaining cost, so A* can no longer be trusted.",
      fig: heurGraph,
      a: ["A", "D"],
      hint: "True cost from A: A–C–G. From D: D–G.",
      why: "From A the true cost is 2 + 4 = 6 but h says 7. From D it is 6 but h says 8. At S (true 9, h 8), B (true 9, h 9) and C (true 4, h 4) the guesses are fine. One bad node is enough to lose the guarantee.",
    },
  ]);

  /* =====================================================================
     a2-routing
     ===================================================================== */
  const loopFig = (() => {
    const P = { A: [50, 150], B: [160, 150], C: [270, 150], F: [380, 150], D: [160, 50], E: [270, 50] };
    const links = [
      ["A", "B"],
      ["B", "C"],
      ["B", "D"],
      ["D", "E"],
      ["E", "F"],
    ];
    let s = links
      .map(
        ([a, b]) =>
          `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="var(--line-2)" stroke-width="3"/>`,
      )
      .join("");
    s +=
      `<line x1="270" y1="150" x2="380" y2="150" stroke="var(--rose)" stroke-width="3" stroke-dasharray="6 5"/>` +
      tx(325, 140, "✗", { sz: 18, c: "var(--rose-ink)" });
    const arrow = (x1, y1, x2, y2) =>
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--amber)" stroke-width="4" stroke-linecap="round" marker-end="url(#lpa)"/>`;
    s +=
      arrow(72, 150, 134, 150) +
      arrow(182, 134, 246, 134) +
      arrow(248, 166, 184, 166) +
      arrow(182, 50, 244, 50) +
      arrow(286, 66, 358, 130);
    Object.entries(P).forEach(([k, [x, y]]) => {
      const c =
        `<circle cx="${x}" cy="${y}" r="20" fill="var(--panel)" stroke="${k === "F" ? "var(--teal)" : "var(--line-2)"}" stroke-width="3"/>` +
        tx(x, y + 5, k, { sz: 15 });
      s += k === "F" ? `<g>${c}</g>` : `<g data-pick="${k}">${c}</g>`;
    });
    return (
      `<svg viewBox="0 0 440 200" style="width:100%;max-height:200px"><defs><marker id="lpa" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--amber)"/></marker></defs>${s}</svg>` +
      `<div class="faint" style="font-weight:800">Orange arrows: each router's next hop towards F. The link C–F has just failed.</div>`
    );
  })();
  Object.assign(partScope, { loopFig });
})();

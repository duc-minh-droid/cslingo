/* Algorithms boss quizzes — new graphs, points, messages and keys (none reused from the lessons).
   All numbers verified with node before writing. */
(function () {
  const partScope = (NIC.shared.bossAlgo = NIC.shared.bossAlgo || {});

  const N = NIC,
    Qf = N.qfig;
  const boss = (lec, b) =>
    N.registerBoss({ id: `a${lec}-boss`, subject: "algo", lecture: lec, title: `Phase ${lec} boss quiz`, ...b });

  // ---------- small bespoke figures ----------
  const bits = (word, { pick = false, labels = true } = {}) =>
    `<svg viewBox="0 0 ${word.length * 54 + 10} 86" style="max-height:90px">${[...word].map((b, i) => `<g ${pick ? `data-pick="${i + 1}"` : ""}><rect x="${8 + i * 54}" y="8" width="46" height="46" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${31 + i * 54}" y="39" text-anchor="middle" style="font:900 20px var(--sans);fill:var(--ink)">${b}</text>${labels ? `<text x="${31 + i * 54}" y="76" text-anchor="middle" style="font:800 12px var(--sans);fill:var(--text-faint)">${i + 1}</text>` : ""}</g>`).join("")}</svg>`;
  const spectrum = (vals) =>
    `<svg viewBox="0 0 420 170" style="max-height:170px">${vals.map((_, k) => `<g data-pick="k${k}"><rect x="${30 + k * 95}" y="20" width="70" height="120" rx="12" fill="var(--bg-2)" stroke="var(--line-2)" stroke-width="3"/><text x="${65 + k * 95}" y="86" text-anchor="middle" style="font:900 18px var(--sans);fill:var(--text-dim)">?</text><text x="${65 + k * 95}" y="162" text-anchor="middle" style="font:800 13px var(--sans);fill:var(--text-faint)">bin k=${k}</text></g>`).join("")}</svg>`;
  const maskGrid = (toks) =>
    `<svg viewBox="0 0 ${80 + toks.length * 58} ${60 + toks.length * 50}" style="max-height:${70 + toks.length * 50}px">${toks.map((t, j) => `<text x="${104 + j * 58}" y="24" text-anchor="middle" style="font:800 13px var(--sans);fill:var(--text-dim)">${t}</text>`).join("")}${toks.map((t, i) => `<text x="66" y="${66 + i * 50}" text-anchor="end" style="font:800 13px var(--sans);fill:var(--text-dim)">${t}</text>` + toks.map((_, j) => `<g data-pick="r${i}c${j}"><rect x="${78 + j * 58}" y="${40 + i * 50}" width="52" height="44" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/></g>`).join("")).join("")}<text x="10" y="${54 + toks.length * 50}" style="font:700 11px var(--sans);fill:var(--text-faint)">rows = the word doing the looking · columns = the word being looked at</text></svg>`;

  /* ================= Phase 1 ================= */
  boss(1, {
    blurb: "Eight questions: invariants, growth rates and PageRank on a web you haven't seen.",
    lede: "New code, new graphs. Trace rather than recall.",
    qs: [
      {
        type: "bug",
        q: "This function should return the largest number in a non-empty list, but it gives the wrong answer for <code>[-7, -3, -9]</code>. Click the faulty line.",
        code: [
          "def largest(xs):",
          "    best = 0",
          "    for x in xs:",
          "        if x > best:",
          "            best = x",
          "    return best",
        ],
        a: 1,
        why: 'Starting at 0 breaks the invariant "best is the largest item seen so far" before any item has been seen. With all-negative input it returns 0, which isn\'t even in the list. Start with <code>best = xs[0]</code>.',
      },
      {
        type: "mcq",
        q: "How many times does <code>work()</code> run when n = 12?<br><code>for i in range(n):<br>&nbsp;&nbsp;for j in range(i):<br>&nbsp;&nbsp;&nbsp;&nbsp;work()</code>",
        o: ["12", "66", "78", "144"],
        a: 1,
        why: "0 + 1 + 2 + … + 11 = 12 × 11 / 2 = <b>66</b>. Roughly n²/2, so it's still quadratic.",
      },
      {
        type: "order",
        q: "Order these by how fast they grow as n gets large, <b>slowest first</b>.",
        items: ["log n", "√n", "n log n", "n²", "2ⁿ"],
        why: "Logarithmic < square root < n log n < quadratic < exponential. The exponential eventually overtakes every polynomial.",
      },
      {
        type: "mcq",
        q: "A three-page web: A links to B and C, B links to C, C links to A. Start with each page at 1/3 and apply one PageRank step <b>with no damping</b>. What is C's rank now?",
        o: ["1/6", "1/3", "1/2", "2/3"],
        a: 2,
        fig: Qf.graph(
          { A: [80, 60], B: [80, 190], C: [300, 125] },
          [
            ["A", "B"],
            ["A", "C"],
            ["B", "C"],
            ["C", "A"],
          ],
          { directed: true, w: 380, h: 240 },
        ),
        why: "C receives half of A's rank (1/6) plus all of B's rank (1/3): 1/6 + 1/3 = <b>0.5</b>.",
      },
      {
        type: "mcq",
        q: "The same three-page web (A links to B and C, B links to C, C links to A), iterated until it settles (still no damping). Which ranking comes out?",
        fig: Qf.graph(
          { A: [80, 60], B: [80, 190], C: [300, 125] },
          [
            ["A", "B"],
            ["A", "C"],
            ["B", "C"],
            ["C", "A"],
          ],
          { directed: true, w: 380, h: 240 },
        ),
        o: ["A = B = C", "A and C tie at 0.4, B has 0.2", "C highest, then B, then A", "B highest"],
        a: 1,
        why: "The fixed point is A = 0.4, B = 0.2, C = 0.4. Check it: A gets all of C (0.4); B gets half of A (0.2); C gets half of A plus all of B (0.2 + 0.2). B is only fed by half of one page.",
      },
      {
        type: "pick",
        q: "In this web, one page will <b>leak rank out of the system</b> if nothing repairs it. Click it.",
        fig: Qf.graph(
          { P: [70, 70], Q: [230, 50], R: [380, 110], S: [150, 200], T: [320, 220] },
          [
            ["P", "Q"],
            ["Q", "R"],
            ["R", "P"],
            ["P", "S"],
            ["S", "T"],
            ["R", "T"],
          ],
          { directed: true, pick: "nodes", w: 450, h: 260 },
        ),
        a: "T",
        why: "<b>T</b> has no outgoing links. Whatever rank flows into it has nowhere to go, so without a repair (spread it evenly over all pages) the total leaks away.",
      },
      {
        type: "slider",
        q: "With damping d = 0.85, a random surfer follows a link with probability 0.85 and teleports otherwise. On average, how many clicks do they make between teleports?",
        min: 1,
        max: 20,
        step: 0.1,
        start: 3,
        ans: 6.7,
        tol: 0.7,
        unit: "clicks",
        hint: "Each click ends with a teleport with chance 0.15. On average that takes 1 / 0.15 = 100 / 15 clicks.",
        why: "Teleport chance per step is 0.15, so the average run is 1 / 0.15 ≈ <b>6.7 clicks</b>. Lower d means shorter walks and more uniform ranks.",
      },
      {
        type: "multi",
        q: "A spammer builds 1,000 fake pages that all link to their shop. Why does PageRank resist this better than counting incoming links? Select all that apply.",
        o: [
          "Each fake page has almost no rank of its own to pass on",
          "A link's value is split among all the links on its page",
          "PageRank ignores links from new pages",
          "PageRank weights each link by how many words the linking page contains",
        ],
        a: [0, 1],
        why: "Rank comes from rank: pages nobody important links to have little to give, and what they do have is split over their links. PageRank has no rule about new pages or word counts.",
      },
    ],
  });

  /* ================= Phase 2 ================= */
  const G2 = { S: [60, 130], A: [180, 50], B: [180, 210], C: [320, 50], D: [320, 210], T: [440, 130] };
  const E2 = [
    ["S", "A", 4],
    ["S", "B", 1],
    ["A", "B", 2],
    ["A", "C", 5],
    ["B", "D", 8],
    ["C", "D", 3],
    ["C", "T", 2],
    ["D", "T", 6],
  ];
  boss(2, {
    blurb: "Eight questions: trace Dijkstra on a new map, judge heuristics, diagnose routing.",
    lede: "A fresh road map from S to T, then heuristics and routing protocols.",
    qs: [
      {
        type: "pick",
        q: "Dijkstra from S. <b>Click the node settled third</b> (S itself counts as first).",
        fig: Qf.graph(G2, E2, { pick: "nodes", w: 500, h: 260 }),
        a: "A",
        why: "S (0) → B (1) → A: its distance drops to 1 + 2 = 3 once B is settled, which beats the direct 4. So <b>A</b> settles third, then C (8), D (9) and T (10).",
      },
      {
        type: "mcq",
        q: "Using the map shown, what is the shortest distance from S to T?",
        fig: Qf.graph(G2, E2, { w: 500, h: 260 }),
        o: ["9", "10", "11", "15"],
        a: 1,
        why: "S→B→A→C→T = 1 + 2 + 5 + 2 = <b>10</b>. The route via D costs 1 + 8 + 6 = 15.",
      },
      {
        type: "bug",
        q: "This Dijkstra returns wrong distances. Click the faulty line.",
        code: [
          "dist = {v: INF for v in G}; dist[s] = 0",
          "done = set()",
          "while len(done) < len(G):",
          "    u = max((v for v in G if v not in done), key=dist.get)",
          "    done.add(u)",
          "    for v, w in G[u]:",
          "        dist[v] = min(dist[v], dist[u] + w)",
        ],
        a: 3,
        why: 'Dijkstra must settle the <b>closest</b> unsettled node (<code>min</code>). Taking the farthest breaks the "settled means final" guarantee.',
      },
      {
        type: "cat",
        q: "On a road map where you can drive in any direction, is each heuristic <b>admissible</b> (never overestimates the remaining distance)?",
        buckets: ["Admissible", "Not admissible"],
        items: [
          ["Straight-line distance to the goal", 0],
          ["Straight-line distance × 1.3", 1],
          ["h = 0 everywhere", 0],
          ["Manhattan (|dx| + |dy|) distance, when diagonal roads exist", 1],
        ],
        why: "No road can be shorter than the straight line, and 0 never overestimates. Scaling up, or using Manhattan distance when diagonal shortcuts exist, can exceed the true cost.",
      },
      {
        type: "mcq",
        q: "Suppose A* is given the <b>perfect</b> heuristic: h(n) equals the true remaining distance exactly. What does it do?",
        o: [
          "Explores the whole graph, just like Dijkstra",
          "Expands essentially only the nodes on a shortest path",
          "Finds a fast but suboptimal path",
          "Loops forever between equal nodes",
        ],
        a: 1,
        why: "With perfect h, f = g + h equals the optimal total for every node on a shortest path and is larger for everything else, so the search walks straight to the goal. Real heuristics sit between 0 (Dijkstra) and perfect.",
      },
      {
        type: "match",
        q: "Match each network to the routing approach it would use.",
        pairs: [
          [
            "A university campus run by one IT team, needing fast recovery",
            "Link-state (OSPF): every router knows the full map",
          ],
          ["Traffic between two competing internet providers", "Path-vector between autonomous systems (BGP)"],
          ["A tiny office network with three routers", "Distance-vector (RIP): simple gossip"],
        ],
        why: "One administrator and quick convergence suggest link-state. Separate organisations exchanging reachability use BGP. For a tiny network, RIP's simplicity is enough.",
      },
      {
        type: "order",
        q: "Put the count-to-infinity story in order.",
        items: [
          "The link between B and C fails",
          'B still holds A\'s old claim "C is 2 away" and installs a route via A (cost 3)',
          "A hears B advertise 3 and updates to 4, via B",
          "The two keep raising each other's cost by one per round",
          "The cost reaches the protocol's infinity (16 in RIP), so C is finally declared unreachable",
        ],
        why: "A stale advertisement creates a loop, the loop inflates the cost round by round, and it only stops at the 'infinity' cap. Poisoned reverse would block the loop at step 2.",
      },
      {
        type: "mcq",
        q: "Why doesn't adding a large constant to every edge weight keep Dijkstra's shortest <i>paths</i> the same?",
        o: [
          "It does: every path gets the same increase",
          "Paths with more edges pick up more of the constant",
          "Dijkstra can't cope with very large weights",
          "The larger weights turn some edges negative",
        ],
        a: 1,
        why: "A path of k edges gains k × c. That penalises long-hop routes, so the ranking of paths can change. Contrast with MSTs, where every tree has n − 1 edges, so adding c changes nothing.",
      },
    ],
  });

  /* ================= Phase 3 ================= */
  const LPP = { O: [0, 0], A: [6, 0], B: [2, 4], C: [0, 4] };
  boss(3, {
    blurb: "Eight questions: a new LP, bracketing arithmetic, and choosing the right optimiser.",
    lede: "A new linear program, then bracketing, simplex reasoning and Nelder–Mead.",
    qs: [
      {
        type: "pick",
        q: "Maximise <b>z = 2x + 5y</b> subject to x + y ≤ 6, y ≤ 4, x, y ≥ 0. The feasible region is shaded. <b>Click the optimal corner.</b>",
        fig: Qf.points(LPP, { max: 7, poly: ["O", "A", "B", "C"] }),
        a: "B",
        why: "Corner values: O = 0, A (6,0) = 12, <b>B (2,4) = 24</b>, C (0,4) = 20. Profit per unit of y is much higher, so push y to its cap, then use the leftover x capacity.",
      },
      {
        type: "mcq",
        q: "Maximise z = 2x + 5y subject to x + y ≤ 6, y ≤ 4, x, y ≥ 0. What is the maximum value of z?",
        o: ["12", "20", "24", "30"],
        a: 2,
        why: "At (2, 4): 2·2 + 5·4 = 4 + 20 = <b>24</b>.",
      },
      {
        type: "mcq",
        q: "Same LP (maximise z = 2x + 5y, x + y ≤ 6, y ≤ 4, x, y ≥ 0), starting simplex at the origin. Dantzig's rule picks y to enter (coefficient 5 > 2). How far can y increase before a constraint stops it?",
        o: ["y = 6, from x + y ≤ 6", "y = 4, from y ≤ 4", "y = 2", "y can grow forever"],
        a: 1,
        why: "With x = 0, the limits on y are 6 (from x + y ≤ 6) and 4 (from y ≤ 4). The ratio test takes the <b>smaller</b>, so y = 4 and the walk moves to C (0,4). Then x enters and it reaches B.",
      },
      {
        type: "mcq",
        q: "Golden-section search starts with a bracket of width 10. How wide is the bracket after 5 iterations?",
        o: ["about 5", "about 2", "about 0.9", "about 0.3"],
        a: 2,
        hint: "0.618² ≈ 0.38, so 0.618⁴ ≈ 0.15. One more factor of 0.6…",
        why: "Each step multiplies the width by 0.618: 10 × 0.618⁵ ≈ <b>0.90</b>.",
      },
      {
        type: "cat",
        q: "Pick the best-suited optimiser for each job.",
        buckets: ["Linear programming", "Golden-section", "Nelder–Mead"],
        items: [
          ["Cheapest animal feed mix meeting linear nutrient minimums", 0],
          ["Tune one knob of a slow simulator whose output dips once then rises", 1],
          ["Tune three knobs of a noisy black-box simulator", 2],
          ["Plan factory output under linear labour and material limits", 0],
        ],
        why: "Linear objective with linear constraints: LP. One variable on a unimodal bracket: golden-section. Several continuous knobs with no gradient: Nelder–Mead.",
      },
      {
        type: "mcq",
        q: "You drop the constraint y ≤ 4 and also x + y ≤ 6, keeping only x, y ≥ 0. What does a solver report for maximising 2x + 5y?",
        o: ["Optimum at (0, 0)", "Unbounded", "Infeasible", "Optimum at (6, 0)"],
        a: 1,
        why: "Nothing stops x or y from growing, and both increase z. The region isn't closed, so there's no maximum: <b>unbounded</b>. (Infeasible would mean no point satisfies the constraints.)",
      },
      {
        type: "order",
        q: "Order Nelder–Mead's fallbacks in one iteration, from first tried to last resort.",
        items: [
          "Reflect the worst corner through the midpoint of the others",
          "If the reflection is the best so far, try expanding further",
          "If the reflection is still poor, contract towards the midpoint",
          "If contraction also fails, shrink the whole triangle towards the best corner",
        ],
        why: "Reflect first; stretch if it pays off; pull back if it overshot; shrink everything only when nothing else works.",
      },
      {
        type: "multi",
        q: "Which statements about the simplex method are true? Select all that apply.",
        o: [
          "It only ever visits corners of the feasible region",
          "Each pivot (in the non-degenerate case) strictly improves the objective",
          "It needs the gradient of the objective at each step",
          "It stops when no neighbouring corner is better",
        ],
        a: [0, 1, 3],
        why: "Simplex walks corner to corner, improving each time, and stops when no neighbour is better. It uses the LP's coefficients directly; there's no gradient estimation involved.",
      },
    ],
  });

  /* ================= Phase 4 ================= */
  const G4 = { A: [60, 90], B: [190, 40], C: [200, 200], D: [320, 100], E: [360, 230], F: [460, 150] };
  const E4 = [
    ["A", "B", 3],
    ["A", "C", 6],
    ["B", "C", 4],
    ["B", "D", 2],
    ["C", "D", 5],
    ["C", "E", 7],
    ["D", "E", 8],
    ["D", "F", 9],
    ["E", "F", 1],
  ];
  boss(4, {
    blurb: "Seven questions on a new six-node network: weights, excluded edges, invariance.",
    lede: "A new network. Use the cut and cycle properties rather than trial and error.",
    qs: [
      {
        type: "mcq",
        q: "What is the total weight of this graph's minimum spanning tree?",
        fig: Qf.graph(G4, E4, { w: 500, h: 270 }),
        o: ["15", "17", "19", "22"],
        a: 1,
        why: "Kruskal takes E–F 1, B–D 2, A–B 3, B–C 4, skips C–D 5 and A–C 6 (they'd close loops), takes C–E 7, and skips the rest: 1 + 2 + 3 + 4 + 7 = <b>17</b>.",
      },
      {
        type: "pick",
        q: "<b>Click every edge that is NOT in the MST.</b>",
        fig: Qf.graph(G4, E4, { pick: "edges", w: 500, h: 270 }),
        a: ["A-C", "C-D", "D-E", "D-F"],
        why: "Each excluded edge is the heaviest on some cycle: A–C on A-B-C, C–D on B-C-D, D–E on C-D-E, and D–F on D-E-F. The heaviest edge on a cycle is never needed.",
      },
      {
        type: "order",
        q: "In what order does Kruskal <b>accept</b> edges on this graph?",
        fig: Qf.graph(G4, E4, { w: 500, h: 270 }),
        items: ["E–F (1)", "B–D (2)", "A–B (3)", "B–C (4)", "C–E (7)"],
        why: "Kruskal accepts in weight order, skipping only edges that would close a loop (C–D, A–C, D–E, D–F).",
      },
      {
        type: "mcq",
        q: "You add 10 to <b>every</b> edge weight. What happens to the MST?",
        o: ["It may change completely", "Same edges", "It gains an extra edge", "Kruskal fails"],
        a: 1,
        why: "All spanning trees grow by the same amount, so their order doesn't change. (Shortest paths can change, because paths have different numbers of edges.)",
      },
      {
        type: "mcq",
        q: "Is the path between two nodes along an MST always their shortest path?",
        o: [
          "Yes: an MST always contains the shortest route between any two nodes",
          "No: A–B 3, B–C 4, A–C 6 routes A→C as 7, not 6",
          "Only in directed graphs",
          "Only if all the weights are equal",
        ],
        a: 1,
        why: "An MST minimises the cost of the whole <b>network</b>, not of individual trips. A–C (6) was left out because it's the heaviest edge on the cycle A–B–C, yet it's still the shorter route from A to C.",
      },
      {
        type: "mcq",
        q: "A spanning tree connects 12 cities. How many edges does it have?",
        o: ["11", "12", "13", "66"],
        a: 0,
        why: "Any spanning tree on n nodes has exactly <b>n − 1 = 11</b> edges. One fewer and something is disconnected; one more creates a cycle.",
      },
      {
        type: "multi",
        q: "Which statements are true? Select all that apply.",
        o: [
          "If all edge weights are distinct, the MST is unique",
          "Prim and Kruskal can return different trees with different total weights",
          "The cheapest edge in the whole graph is always in some MST",
          "A disconnected graph has no spanning tree",
        ],
        a: [0, 2, 3],
        why: "Distinct weights give one MST. Both algorithms always reach the minimum total (their trees can differ only when there are ties). The globally cheapest edge crosses some cut as its lightest edge, so it's safe. No spanning tree exists without connectivity.",
      },
    ],
  });

  /* ================= Phase 5 ================= */
  const H5 = { P: [1, 1], Q: [4, 0], R: [7, 2], S: [6, 6], T: [3, 7], U: [0, 4], V: [3, 3], W: [5, 3], X: [2, 5] };
  Object.assign(partScope, { H5, bits, boss, maskGrid, spectrum });
})();

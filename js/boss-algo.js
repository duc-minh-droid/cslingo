/* Algorithms boss quizzes — new graphs, points, messages and keys (none reused from the lessons).
   All numbers verified with node before writing. */
(function () {
  const N = NIC, Qf = N.qfig;
  const boss = (lec, b) => N.registerBoss({ id: `a${lec}-boss`, subject: "algo", lecture: lec, title: `Phase ${lec} boss quiz`, ...b });

  // ---------- small bespoke figures ----------
  const bits = (word, { pick = false, labels = true } = {}) => `<svg viewBox="0 0 ${word.length * 54 + 10} 86" style="max-height:90px">${[...word].map((b, i) => `<g ${pick ? `data-pick="${i + 1}"` : ""}><rect x="${8 + i * 54}" y="8" width="46" height="46" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/><text x="${31 + i * 54}" y="39" text-anchor="middle" style="font:900 20px var(--sans);fill:var(--ink)">${b}</text>${labels ? `<text x="${31 + i * 54}" y="76" text-anchor="middle" style="font:800 12px var(--sans);fill:var(--text-faint)">${i + 1}</text>` : ""}</g>`).join("")}</svg>`;
  const spectrum = (vals) => `<svg viewBox="0 0 420 170" style="max-height:170px">${vals.map((_, k) => `<g data-pick="k${k}"><rect x="${30 + k * 95}" y="20" width="70" height="120" rx="12" fill="var(--bg-2)" stroke="var(--line-2)" stroke-width="3"/><text x="${65 + k * 95}" y="86" text-anchor="middle" style="font:900 18px var(--sans);fill:var(--text-dim)">?</text><text x="${65 + k * 95}" y="162" text-anchor="middle" style="font:800 13px var(--sans);fill:var(--text-faint)">bin k=${k}</text></g>`).join("")}</svg>`;
  const maskGrid = (toks) => `<svg viewBox="0 0 ${80 + toks.length * 58} ${60 + toks.length * 50}" style="max-height:${70 + toks.length * 50}px">${toks.map((t, j) => `<text x="${104 + j * 58}" y="24" text-anchor="middle" style="font:800 13px var(--sans);fill:var(--text-dim)">${t}</text>`).join("")}${toks.map((t, i) => `<text x="66" y="${66 + i * 50}" text-anchor="end" style="font:800 13px var(--sans);fill:var(--text-dim)">${t}</text>` + toks.map((_, j) => `<g data-pick="r${i}c${j}"><rect x="${78 + j * 58}" y="${40 + i * 50}" width="52" height="44" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/></g>`).join("")).join("")}<text x="10" y="${54 + toks.length * 50}" style="font:700 11px var(--sans);fill:var(--text-faint)">rows = the word doing the looking · columns = the word being looked at</text></svg>`;

  /* ================= Phase 1 ================= */
  boss(1, {
    blurb: "Eight questions: invariants, growth rates and PageRank on a web you haven't seen.",
    lede: "New code, new graphs. Trace rather than recall.",
    qs: [
      { type: "bug", q: "This function should return the largest number in a non-empty list, but it gives the wrong answer for <code>[-7, -3, -9]</code>. Click the faulty line.",
        code: ["def largest(xs):", "    best = 0", "    for x in xs:", "        if x > best:", "            best = x", "    return best"], a: 1,
        why: "Starting at 0 breaks the invariant \"best is the largest item seen so far\" before any item has been seen. With all-negative input it returns 0, which isn't even in the list. Start with <code>best = xs[0]</code>." },
      { type: "mcq", q: "How many times does <code>work()</code> run when n = 12?<br><code>for i in range(n):<br>&nbsp;&nbsp;for j in range(i):<br>&nbsp;&nbsp;&nbsp;&nbsp;work()</code>", o: ["12", "66", "78", "144"], a: 1,
        why: "0 + 1 + 2 + … + 11 = 12 × 11 / 2 = <b>66</b>. Roughly n²/2, so it's still quadratic." },
      { type: "order", q: "Order these by how fast they grow as n gets large, <b>slowest first</b>.",
        items: ["log n", "√n", "n log n", "n²", "2ⁿ"],
        why: "Logarithmic < square root < n log n < quadratic < exponential. The exponential eventually overtakes every polynomial." },
      { type: "mcq", q: "A three-page web: A links to B and C, B links to C, C links to A. Start with each page at 1/3 and apply one PageRank step <b>with no damping</b>. What is C's rank now?", o: ["1/6", "1/3", "1/2", "2/3"], a: 2,
        fig: Qf.graph({ A: [80, 60], B: [80, 190], C: [300, 125] }, [["A", "B"], ["A", "C"], ["B", "C"], ["C", "A"]], { directed: true, w: 380, h: 240 }),
        why: "C receives half of A's rank (1/6) plus all of B's rank (1/3): 1/6 + 1/3 = <b>0.5</b>." },
      { type: "mcq", q: "The same three-page web (A links to B and C, B links to C, C links to A), iterated until it settles (still no damping). Which ranking comes out?",
        fig: Qf.graph({ A: [80, 60], B: [80, 190], C: [300, 125] }, [["A", "B"], ["A", "C"], ["B", "C"], ["C", "A"]], { directed: true, w: 380, h: 240 }),
        o: ["A = B = C", "A and C tie at 0.4, B has 0.2", "C highest, then B, then A", "B highest"], a: 1,
        why: "The fixed point is A = 0.4, B = 0.2, C = 0.4. Check it: A gets all of C (0.4); B gets half of A (0.2); C gets half of A plus all of B (0.2 + 0.2). B is only fed by half of one page." },
      { type: "pick", q: "In this web, one page will <b>leak rank out of the system</b> if nothing repairs it. Click it.",
        fig: Qf.graph({ P: [70, 70], Q: [230, 50], R: [380, 110], S: [150, 200], T: [320, 220] }, [["P", "Q"], ["Q", "R"], ["R", "P"], ["P", "S"], ["S", "T"], ["R", "T"]], { directed: true, pick: "nodes", w: 450, h: 260 }),
        a: "T",
        why: "<b>T</b> has no outgoing links. Whatever rank flows into it has nowhere to go, so without a repair (spread it evenly over all pages) the total leaks away." },
      { type: "slider", q: "With damping d = 0.85, a random surfer follows a link with probability 0.85 and teleports otherwise. On average, how many clicks do they make between teleports?", min: 1, max: 20, step: 0.1, start: 3, ans: 6.7, tol: 0.7, unit: "clicks", hint: "Each click ends with a teleport with chance 0.15. On average that takes 1 / 0.15 = 100 / 15 clicks.",
        why: "Teleport chance per step is 0.15, so the average run is 1 / 0.15 ≈ <b>6.7 clicks</b>. Lower d means shorter walks and more uniform ranks." },
      { type: "multi", q: "A spammer builds 1,000 fake pages that all link to their shop. Why does PageRank resist this better than counting incoming links? Select all that apply.",
        o: ["Each fake page has almost no rank of its own to pass on", "A link's value is split among all the links on its page", "PageRank ignores links from new pages", "PageRank weights each link by how many words the linking page contains"], a: [0, 1],
        why: "Rank comes from rank: pages nobody important links to have little to give, and what they do have is split over their links. PageRank has no rule about new pages or word counts." },
    ],
  });

  /* ================= Phase 2 ================= */
  const G2 = { S: [60, 130], A: [180, 50], B: [180, 210], C: [320, 50], D: [320, 210], T: [440, 130] };
  const E2 = [["S", "A", 4], ["S", "B", 1], ["A", "B", 2], ["A", "C", 5], ["B", "D", 8], ["C", "D", 3], ["C", "T", 2], ["D", "T", 6]];
  boss(2, {
    blurb: "Eight questions: trace Dijkstra on a new map, judge heuristics, diagnose routing.",
    lede: "A fresh road map from S to T, then heuristics and routing protocols.",
    qs: [
      { type: "pick", q: "Dijkstra from S. <b>Click the node settled third</b> (S itself counts as first).", fig: Qf.graph(G2, E2, { pick: "nodes", w: 500, h: 260 }), a: "A",
        why: "S (0) → B (1) → A: its distance drops to 1 + 2 = 3 once B is settled, which beats the direct 4. So <b>A</b> settles third, then C (8), D (9) and T (10)." },
      { type: "mcq", q: "Using the map shown, what is the shortest distance from S to T?", fig: Qf.graph(G2, E2, { w: 500, h: 260 }), o: ["9", "10", "11", "15"], a: 1,
        why: "S→B→A→C→T = 1 + 2 + 5 + 2 = <b>10</b>. The route via D costs 1 + 8 + 6 = 15." },
      { type: "bug", q: "This Dijkstra returns wrong distances. Click the faulty line.",
        code: ["dist = {v: INF for v in G}; dist[s] = 0", "done = set()", "while len(done) < len(G):", "    u = max((v for v in G if v not in done), key=dist.get)", "    done.add(u)", "    for v, w in G[u]:", "        dist[v] = min(dist[v], dist[u] + w)"], a: 3,
        why: "Dijkstra must settle the <b>closest</b> unsettled node (<code>min</code>). Taking the farthest breaks the \"settled means final\" guarantee." },
      { type: "cat", q: "On a road map where you can drive in any direction, is each heuristic <b>admissible</b> (never overestimates the remaining distance)?",
        buckets: ["Admissible", "Not admissible"],
        items: [["Straight-line distance to the goal", 0], ["Straight-line distance × 1.3", 1], ["h = 0 everywhere", 0], ["Manhattan (|dx| + |dy|) distance, when diagonal roads exist", 1]],
        why: "No road can be shorter than the straight line, and 0 never overestimates. Scaling up, or using Manhattan distance when diagonal shortcuts exist, can exceed the true cost." },
      { type: "mcq", q: "Suppose A* is given the <b>perfect</b> heuristic: h(n) equals the true remaining distance exactly. What does it do?",
        o: ["Explores the whole graph, just like Dijkstra", "Expands essentially only the nodes on a shortest path", "Finds a fast but suboptimal path", "Loops forever between equal nodes"], a: 1,
        why: "With perfect h, f = g + h equals the optimal total for every node on a shortest path and is larger for everything else, so the search walks straight to the goal. Real heuristics sit between 0 (Dijkstra) and perfect." },
      { type: "match", q: "Match each network to the routing approach it would use.",
        pairs: [["A university campus run by one IT team, needing fast recovery", "Link-state (OSPF): every router knows the full map"], ["Traffic between two competing internet providers", "Path-vector between autonomous systems (BGP)"], ["A tiny office network with three routers", "Distance-vector (RIP): simple gossip"]],
        why: "One administrator and quick convergence suggest link-state. Separate organisations exchanging reachability use BGP. For a tiny network, RIP's simplicity is enough." },
      { type: "order", q: "Put the count-to-infinity story in order.",
        items: ["The link between B and C fails", "B still holds A's old claim \"C is 2 away\" and installs a route via A (cost 3)", "A hears B advertise 3 and updates to 4, via B", "The two keep raising each other's cost by one per round", "The cost reaches the protocol's infinity (16 in RIP), so C is finally declared unreachable"],
        why: "A stale advertisement creates a loop, the loop inflates the cost round by round, and it only stops at the 'infinity' cap. Poisoned reverse would block the loop at step 2." },
      { type: "mcq", q: "Why doesn't adding a large constant to every edge weight keep Dijkstra's shortest <i>paths</i> the same?",
        o: ["It does: every path gets the same increase", "Paths with more edges pick up more of the constant", "Dijkstra can't cope with very large weights", "The larger weights turn some edges negative"], a: 1,
        why: "A path of k edges gains k × c. That penalises long-hop routes, so the ranking of paths can change. Contrast with MSTs, where every tree has n − 1 edges, so adding c changes nothing." },
    ],
  });

  /* ================= Phase 3 ================= */
  const LPP = { O: [0, 0], A: [6, 0], B: [2, 4], C: [0, 4] };
  boss(3, {
    blurb: "Eight questions: a new LP, bracketing arithmetic, and choosing the right optimiser.",
    lede: "A new linear program, then bracketing, simplex reasoning and Nelder–Mead.",
    qs: [
      { type: "pick", q: "Maximise <b>z = 2x + 5y</b> subject to x + y ≤ 6, y ≤ 4, x, y ≥ 0. The feasible region is shaded. <b>Click the optimal corner.</b>",
        fig: Qf.points(LPP, { max: 7, poly: ["O", "A", "B", "C"] }), a: "B",
        why: "Corner values: O = 0, A (6,0) = 12, <b>B (2,4) = 24</b>, C (0,4) = 20. Profit per unit of y is much higher, so push y to its cap, then use the leftover x capacity." },
      { type: "mcq", q: "Maximise z = 2x + 5y subject to x + y ≤ 6, y ≤ 4, x, y ≥ 0. What is the maximum value of z?", o: ["12", "20", "24", "30"], a: 2,
        why: "At (2, 4): 2·2 + 5·4 = 4 + 20 = <b>24</b>." },
      { type: "mcq", q: "Same LP (maximise z = 2x + 5y, x + y ≤ 6, y ≤ 4, x, y ≥ 0), starting simplex at the origin. Dantzig's rule picks y to enter (coefficient 5 > 2). How far can y increase before a constraint stops it?",
        o: ["y = 6, from x + y ≤ 6", "y = 4, from y ≤ 4", "y = 2", "y can grow forever"], a: 1,
        why: "With x = 0, the limits on y are 6 (from x + y ≤ 6) and 4 (from y ≤ 4). The ratio test takes the <b>smaller</b>, so y = 4 and the walk moves to C (0,4). Then x enters and it reaches B." },
      { type: "mcq", q: "Golden-section search starts with a bracket of width 10. How wide is the bracket after 5 iterations?", o: ["about 5", "about 2", "about 0.9", "about 0.3"], a: 2, hint: "0.618² ≈ 0.38, so 0.618⁴ ≈ 0.15. One more factor of 0.6…",
        why: "Each step multiplies the width by 0.618: 10 × 0.618⁵ ≈ <b>0.90</b>." },
      { type: "cat", q: "Pick the best-suited optimiser for each job.",
        buckets: ["Linear programming", "Golden-section", "Nelder–Mead"],
        items: [["Cheapest animal feed mix meeting linear nutrient minimums", 0], ["Tune one knob of a slow simulator whose output dips once then rises", 1], ["Tune three knobs of a noisy black-box simulator", 2], ["Plan factory output under linear labour and material limits", 0]],
        why: "Linear objective with linear constraints: LP. One variable on a unimodal bracket: golden-section. Several continuous knobs with no gradient: Nelder–Mead." },
      { type: "mcq", q: "You drop the constraint y ≤ 4 and also x + y ≤ 6, keeping only x, y ≥ 0. What does a solver report for maximising 2x + 5y?",
        o: ["Optimum at (0, 0)", "Unbounded", "Infeasible", "Optimum at (6, 0)"], a: 1,
        why: "Nothing stops x or y from growing, and both increase z. The region isn't closed, so there's no maximum: <b>unbounded</b>. (Infeasible would mean no point satisfies the constraints.)" },
      { type: "order", q: "Order Nelder–Mead's fallbacks in one iteration, from first tried to last resort.",
        items: ["Reflect the worst corner through the midpoint of the others", "If the reflection is the best so far, try expanding further", "If the reflection is still poor, contract towards the midpoint", "If contraction also fails, shrink the whole triangle towards the best corner"],
        why: "Reflect first; stretch if it pays off; pull back if it overshot; shrink everything only when nothing else works." },
      { type: "multi", q: "Which statements about the simplex method are true? Select all that apply.",
        o: ["It only ever visits corners of the feasible region", "Each pivot (in the non-degenerate case) strictly improves the objective", "It needs the gradient of the objective at each step", "It stops when no neighbouring corner is better"], a: [0, 1, 3],
        why: "Simplex walks corner to corner, improving each time, and stops when no neighbour is better. It uses the LP's coefficients directly; there's no gradient estimation involved." },
    ],
  });

  /* ================= Phase 4 ================= */
  const G4 = { A: [60, 90], B: [190, 40], C: [200, 200], D: [320, 100], E: [360, 230], F: [460, 150] };
  const E4 = [["A", "B", 3], ["A", "C", 6], ["B", "C", 4], ["B", "D", 2], ["C", "D", 5], ["C", "E", 7], ["D", "E", 8], ["D", "F", 9], ["E", "F", 1]];
  boss(4, {
    blurb: "Seven questions on a new six-node network: weights, excluded edges, invariance.",
    lede: "A new network. Use the cut and cycle properties rather than trial and error.",
    qs: [
      { type: "mcq", q: "What is the total weight of this graph's minimum spanning tree?", fig: Qf.graph(G4, E4, { w: 500, h: 270 }), o: ["15", "17", "19", "22"], a: 1,
        why: "Kruskal takes E–F 1, B–D 2, A–B 3, B–C 4, skips C–D 5 and A–C 6 (they'd close loops), takes C–E 7, and skips the rest: 1 + 2 + 3 + 4 + 7 = <b>17</b>." },
      { type: "pick", q: "<b>Click every edge that is NOT in the MST.</b>", fig: Qf.graph(G4, E4, { pick: "edges", w: 500, h: 270 }), a: ["A-C", "C-D", "D-E", "D-F"],
        why: "Each excluded edge is the heaviest on some cycle: A–C on A-B-C, C–D on B-C-D, D–E on C-D-E, and D–F on D-E-F. The heaviest edge on a cycle is never needed." },
      { type: "order", q: "In what order does Kruskal <b>accept</b> edges on this graph?", fig: Qf.graph(G4, E4, { w: 500, h: 270 }),
        items: ["E–F (1)", "B–D (2)", "A–B (3)", "B–C (4)", "C–E (7)"],
        why: "Kruskal accepts in weight order, skipping only edges that would close a loop (C–D, A–C, D–E, D–F)." },
      { type: "mcq", q: "You add 10 to <b>every</b> edge weight. What happens to the MST?",
        o: ["It may change completely", "Same edges", "It gains an extra edge", "Kruskal fails"], a: 1,
        why: "All spanning trees grow by the same amount, so their order doesn't change. (Shortest paths can change, because paths have different numbers of edges.)" },
      { type: "mcq", q: "Is the path between two nodes along an MST always their shortest path?",
        o: ["Yes: an MST always contains the shortest route between any two nodes", "No: A–B 3, B–C 4, A–C 6 routes A→C as 7, not 6", "Only in directed graphs", "Only if all the weights are equal"], a: 1,
        why: "An MST minimises the cost of the whole <b>network</b>, not of individual trips. A–C (6) was left out because it's the heaviest edge on the cycle A–B–C, yet it's still the shorter route from A to C." },
      { type: "mcq", q: "A spanning tree connects 12 cities. How many edges does it have?", o: ["11", "12", "13", "66"], a: 0,
        why: "Any spanning tree on n nodes has exactly <b>n − 1 = 11</b> edges. One fewer and something is disconnected; one more creates a cycle." },
      { type: "multi", q: "Which statements are true? Select all that apply.",
        o: ["If all edge weights are distinct, the MST is unique", "Prim and Kruskal can return different trees with different total weights", "The cheapest edge in the whole graph is always in some MST", "A disconnected graph has no spanning tree"], a: [0, 2, 3],
        why: "Distinct weights give one MST. Both algorithms always reach the minimum total (their trees can differ only when there are ties). The globally cheapest edge crosses some cut as its lightest edge, so it's safe. No spanning tree exists without connectivity." },
    ],
  });

  /* ================= Phase 5 ================= */
  const H5 = { P: [1, 1], Q: [4, 0], R: [7, 2], S: [6, 6], T: [3, 7], U: [0, 4], V: [3, 3], W: [5, 3], X: [2, 5] };
  boss(5, {
    blurb: "Seven questions: a new point set, turn tests by hand, algorithm choice.",
    lede: "New points on a grid (y points up). Use the cross product rather than eyeballing.",
    qs: [
      { type: "pick", q: "<b>Click every point on the convex hull.</b>", fig: Qf.points(H5, { max: 8 }), a: ["P", "Q", "R", "S", "T", "U"],
        why: "The hull is U → P → Q → R → S → T. V, W and X sit inside that polygon." },
      { type: "cat", q: "Walking p → a → b, which way does each path turn?",
        buckets: ["Left", "Right", "Straight"],
        items: [["(1,1) → (4,2) → (3,5)", 0], ["(0,0) → (2,1) → (4,2)", 2], ["(0,0) → (3,1) → (5,0)", 1]],
        why: "Cross products: (3,1)×(2,4) = 3·4 − 1·2 = <b>10</b> (left); (2,1)×(4,2) = 4 − 4 = <b>0</b> (collinear); (3,1)×(5,0) = 0 − 5 = <b>−5</b> (right)." },
      { type: "mcq", q: "Compute the cross product (a − p) × (b − p) for p = (2,2), a = (5,3), b = (4,6).", o: ["−10, a right turn", "0, collinear", "10, a left turn", "14, a left turn"], a: 2,
        why: "a − p = (3,1), b − p = (2,4): 3·4 − 1·2 = <b>10</b>, so it's a left turn." },
      { type: "mcq", q: "1,000,000 points, and you know only about 8 of them are on the hull. Which algorithm is the better bet?",
        o: ["Graham scan, because O(n log n) always wins", "Gift wrapping: n·h ≈ 8 million vs ~20 million to sort", "Both take the same time on this input", "Neither can handle a million points"], a: 1,
        why: "With h = 8, n·h = 8 × 10⁶, while n log₂ n ≈ 2 × 10⁷. Gift wrapping is <b>output-sensitive</b>: a small hull makes it faster." },
      { type: "mcq", q: "What input makes gift wrapping slowest?",
        o: ["All points in a tight cluster", "All points on a circle", "Points on a straight line", "Two points"], a: 1,
        why: "Cost is n per hull point. If every point is on the hull, that's n × n." },
      { type: "mcq", q: "Graham scan's stack holds (bottom → top) U, P, Q, and the next point in angle order is W. Q → W turns right. What happens?",
        o: ["Push W on top of Q and continue with the next point", "Pop Q, then re-test P → W", "Pop U, the bottom of the stack, and push W", "Stop: the hull is finished"], a: 1,
        why: "A right turn means Q would dent the hull inward, so Q is popped. Then check the turn again with the new top pair before pushing W." },
      { type: "multi", q: "Which are true of both gift wrapping and Graham scan? Select all that apply.",
        o: ["They decide hull membership with orientation (turn) tests", "They must sort all the points first", "They need care with collinear points", "Their running time depends on the hull size"], a: [0, 2],
        why: "Both are built on the turn test and both need a rule for collinear points. Only Graham sorts; only gift wrapping's cost depends on hull size." },
    ],
  });

  /* ================= Phase 6 ================= */
  boss(6, {
    blurb: "Seven questions: a new CRC, a new Hamming codeword to fix, and detection vs correction.",
    lede: "New messages and a different generator. Work the bits on paper.",
    qs: [
      { type: "mcq", q: "CRC with generator <b>1011</b>. Message 1101. Append three zeros and divide (XOR long division). What's the 3-bit remainder?", o: ["001", "110", "011", "100"], a: 0,
        hint: "1101000: XOR 1011 under the first 1, then keep shifting.",
        why: "1101000 → 1101 ⊕ 1011 = 0110 → 1100 ⊕ 1011 = 0111 → 1110 ⊕ 1011 = 0101 → 1010 ⊕ 1011 = 0001: remainder <b>001</b>. The frame sent is 1101001, which divides exactly." },
      { type: "pick", q: "Hamming(7,4) received word below (positions 1–7, parity at 1, 2, 4). One bit flipped. <b>Click the flipped bit.</b>", fig: bits("1110110", { pick: true }), a: "3",
        hint: "Recompute p1 over 1,3,5,7; p2 over 2,3,6,7; p4 over 4,5,6,7.",
        why: "Checks: p1 (1,3,5,7) = 1⊕1⊕1⊕0 = 1 ✗, p2 (2,3,6,7) = 1⊕1⊕1⊕0 = 1 ✗, p4 (4,5,6,7) = 0⊕1⊕1⊕0 = 0 ✓. Syndrome p4 p2 p1 = 011 = <b>3</b>. The original codeword was 1100110." },
      { type: "multi", q: "A single parity bit protects a byte. Which error patterns does it detect? Select all that apply.",
        o: ["1 bit flipped", "2 bits flipped", "3 bits flipped", "4 bits flipped", "7 bits flipped"], a: [0, 2, 4],
        why: "Parity detects any <b>odd</b> number of flips: 1, 3 and 7. Even counts cancel out." },
      { type: "mcq", q: "Hamming(7,4) sends 4 data bits in 7. What's its code rate (the fraction of transmitted bits that are data)?", o: ["3/7", "1/2", "4/7", "7/4"], a: 2,
        why: "4 / 7 ≈ <b>0.571</b>. Hamming(15,11) is 11/15 ≈ 0.733: longer codes waste less, but still correct only one error per block." },
      { type: "cat", q: "Detection plus retransmission, or forward error correction?",
        buckets: ["Detect + resend", "Correct on arrival"],
        items: [["Downloading a file over a reliable home connection", 0], ["Commands to a Mars rover, 20 minutes away", 1], ["A web page request that can simply be retried", 0], ["Memory chips in a server where a crash is costly", 1]],
        why: "If re-sending is cheap and fast, detection (CRC) is enough. If the round trip is long or retries are impossible, fix errors on arrival (Hamming-style ECC)." },
      { type: "mcq", q: "Two bits flip in a Hamming(7,4) codeword and the receiver applies the syndrome fix. What happens?",
        o: ["Both are fixed", "It flips a third, innocent bit", "It reports a double error", "Nothing changes"], a: 1,
        why: "The two errors combine into a syndrome pointing at some other position, and the 'correction' damages it. Adding an overall parity bit (SECDED) detects this case instead." },
      { type: "mcq", q: "An attacker changes a packet and recomputes its CRC so it checks out. Why doesn't the CRC stop them?",
        o: ["A CRC is too short to be secure", "The CRC is a public calculation with no key", "The attacker got lucky with the remainder", "It does stop them: the remainder would change"], a: 1,
        why: "No secret is involved, so the attacker can compute a valid CRC just like the sender. Tamper-resistance needs a keyed MAC or a digital signature." },
    ],
  });

  /* ================= Phase 7 ================= */
  boss(7, {
    blurb: "Eight questions: entropy and Huffman on new distributions, an LZW trace, choosing a compressor.",
    lede: "New distributions and a new string for LZW. Keep a calculator handy for the logs.",
    qs: [
      { type: "mcq", q: "A sensor sends one of four symbols with probabilities 0.7, 0.1, 0.1, 0.1. Roughly what's its entropy?", o: ["0 bits: one symbol dominates", "about 0.5 bits", "about 1.4 bits", "exactly 2 bits"], a: 2, hint: "Four equally likely symbols would give 2 bits. Skew lowers it, but 30% of the time you still get one of three surprises.",
        why: "H = −0.7 log₂ 0.7 − 3 × 0.1 log₂ 0.1 ≈ 0.360 + 0.997 = <b>1.36</b> bits, well below the 2 bits a fixed-length code uses." },
      { type: "mcq", q: "A biased coin lands heads 90% of the time. Roughly what's its entropy?", o: ["about 0.1 bits", "about 0.5 bits", "about 0.9 bits", "1 bit"], a: 1,
        hint: "A fair coin is 1 bit. This one is very predictable, but the rare tails are a big surprise.",
        why: "H = −0.9 log₂ 0.9 − 0.1 log₂ 0.1 ≈ <b>0.47</b> bits. Very predictable, so each toss carries less than half a bit." },
      { type: "order", q: "Build a Huffman code for probabilities 0.4, 0.3, 0.2, 0.1. Put the merges in the order they happen.",
        items: ["Merge 0.1 and 0.2 → 0.3", "Merge the two 0.3 nodes → 0.6", "Merge 0.4 and 0.6 → the root"],
        why: "Always merge the two smallest weights: 0.1 + 0.2, then 0.3 + 0.3, then 0.4 + 0.6." },
      { type: "mcq", q: "Same code: symbol depths come out as 1, 2, 3, 3 (for 0.4, 0.3, 0.2, 0.1). What's the average code length in bits?", o: ["1.75", "1.9", "2", "2.5"], a: 1, hint: "Multiply each probability by its depth, then add: 0.4 × 1, 0.3 × 2, 0.2 × 3, 0.1 × 3.",
        why: "0.4·1 + 0.3·2 + 0.2·3 + 0.1·3 = 0.4 + 0.6 + 0.6 + 0.3 = <b>1.9</b> bits." },
      { type: "mcq", q: "LZW encodes <code>ABABABA</code> starting from the dictionary A = 0, B = 1. How many codes does it output?", o: ["3", "4", "5", "7"], a: 1,
        why: "Outputs 0 (A), 1 (B), 2 (AB), 4 (ABA): <b>4</b> codes for 7 characters, adding AB = 2, BA = 3 and ABA = 4 along the way." },
      { type: "mcq", q: "LZW encoded <code>ABABABA</code> (starting dictionary A = 0, B = 1) as 0, 1, 2, 4. When decoding that output, which code arrives <b>before the decoder has built its entry</b>?",
        o: ["0", "1", "2", "4"], a: 3,
        why: "After 0, 1, 2 the decoder has built entries up to 3. Code 4 was used by the encoder immediately after creating it, so the decoder rebuilds it as previous + its own first letter: AB + A = <b>ABA</b>." },
      { type: "cat", q: "Which approach compresses each source best?",
        buckets: ["Huffman", "LZW", "Neither helps"],
        items: [["Symbols with very uneven frequencies, no repeated phrases", 0], ["Log files full of repeated long phrases", 1], ["Output of a good encryption algorithm", 2], ["A file that has already been zipped", 2]],
        why: "Huffman exploits skewed symbol frequencies, and LZW exploits repeated sequences. Encrypted or already-compressed data looks random: its entropy is near the maximum, so nothing is left to squeeze out." },
      { type: "mcq", q: "Why can't any lossless compressor shrink <i>every</i> possible file?",
        o: ["Computers can't search every possible encoding", "There are more files of length n than shorter files", "Only Huffman coding can reach the entropy limit", "Floating-point rounding loses information"], a: 1,
        why: "It's a counting argument: 2ⁿ files of n bits, but only 2ⁿ − 1 shorter bit strings. A lossless code can't map them all to shorter outputs." },
    ],
  });

  /* ================= Phase 8 ================= */
  boss(8, {
    blurb: "Eight questions: new DH and RSA numbers, choosing the right primitive, chain attacks.",
    lede: "New toy keys. The arithmetic is small enough for paper.",
    qs: [
      { type: "mcq", q: "Diffie–Hellman with p = 17, g = 3. Alice picks a = 4. What value A does she send?", o: ["12", "13", "4", "81"], a: 1,
        why: "3⁴ = 81 and 81 mod 17 = 81 − 68 = <b>13</b>." },
      { type: "mcq", q: "Diffie–Hellman with p = 17, g = 3. Alice picked a = 4 and sent A = 13. Bob picks b = 5 and sends B = 3⁵ mod 17 = 5. What shared secret do both compute?", o: ["5", "8", "13", "15"], a: 2,
        hint: "Alice computes 5⁴ mod 17: 5⁴ = 625, and 17 × 36 = 612.",
        why: "Alice: 5⁴ = 625 and 625 mod 17 = 13. Bob: 13⁵ mod 17 = 13. Both get <b>13</b>." },
      { type: "mcq", q: "Toy RSA with p = 3, q = 11, so n = 33 and φ = 20. Take e = 3. What's the private exponent d (3d ≡ 1 mod 20, smallest positive)?", o: ["3", "7", "9", "13"], a: 1,
        why: "3 × 7 = 21 = 20 + 1, so <b>d = 7</b>. Check: 4 encrypts to 4³ mod 33 = 31, and 31⁷ mod 33 = 4." },
      { type: "mcq", q: "Same n = 33, φ = 20. Why can't you use e = 4?",
        o: ["4 is too small", "gcd(4, 20) = 4", "4 is even and keys must be odd", "It would work fine"], a: 1,
        why: "d must satisfy 4d ≡ 1 (mod 20), but 4d is always a multiple of 4, and 1 is not. No inverse, so no decryption." },
      { type: "match", q: "Match each security goal to the primitive that provides it.",
        pairs: [["Detect whether a downloaded file was altered, given a trusted fingerprint", "Cryptographic hash"], ["Two strangers agree on a secret key over a public channel", "Diffie–Hellman"], ["Keep the contents of a message private", "Encryption"], ["Prove a message really came from a specific sender", "Digital signature"]],
        why: "Hashes fingerprint data, DH agrees keys, encryption hides content, and signatures bind a message to a private key." },
      { type: "mcq", q: "Proof of work requires a hash starting with <b>5</b> hex zeros. About how many tries does it take on average?", o: ["80 (5 × 16)", "about 1 million (16⁵)", "about 1 billion (16⁷·⁵)", "32 (2⁵)"], a: 1,
        why: "Each hex digit is 1 in 16, so 16⁵ = <b>1,048,576</b>. Checking the result takes one hash." },
      { type: "multi", q: "An attacker wants to rewrite a transaction deep in a proof-of-work chain and have the network accept it. What must they do? Select all that apply.",
        o: ["Recompute the proof of work for the edited block", "Recompute the proof of work for every block after it", "Out-pace the honest network while doing so", "Guess a user's private key"], a: [0, 1, 2],
        why: "Editing a block invalidates it and every successor, so all of them need new work, and the attacker's chain must overtake the honest one. That's why security rests on honest miners having most of the computing power. No private keys are involved." },
      { type: "order", q: "Order the steps of a typical secure connection (like HTTPS).",
        items: ["Server presents a certificate signed by a trusted authority", "Client checks the signature to authenticate the server", "Both sides run a key agreement (Diffie–Hellman) to create a session key", "Data flows encrypted with a fast symmetric cipher"],
        why: "Authenticate first (this stops man-in-the-middle attacks), then agree a key, then use cheap symmetric encryption for the bulk data." },
    ],
  });

  /* ================= Phase 9 ================= */
  boss(9, {
    blurb: "Eight questions: aliasing, bin spacing, a new hand DFT, FFT savings.",
    lede: "New signals and sample rates. The DFT one works out on paper.",
    qs: [
      { type: "mcq", q: "A 130 Hz tone is sampled at 100 Hz. At what frequency does it appear in the spectrum (between 0 and 50 Hz)?", o: ["30 Hz", "50 Hz", "70 Hz", "130 Hz"], a: 0,
        why: "It folds down: |130 − 100| = <b>30 Hz</b>. Anything above half the sample rate impersonates a lower frequency." },
      { type: "mcq", q: "What's the smallest sample rate you'd need, in theory, to capture a 440 Hz tone without aliasing? (The Nyquist rate: you need strictly more than this.)", o: ["220 Hz", "440 Hz", "880 Hz", "1,320 Hz"], a: 2,
        why: "Twice the highest frequency: 2 × 440 = <b>880 Hz</b>. In practice you'd sample comfortably above it." },
      { type: "mcq", q: "You record 250 samples at 1,000 Hz. How far apart are the DFT's frequency bins?", o: ["0.25 Hz", "4 Hz", "250 Hz", "1,000 Hz"], a: 1,
        why: "Bin spacing = fs / N = 1000 / 250 = <b>4 Hz</b>. Record for longer to get finer resolution." },
      { type: "pick", q: "The DFT of the 4-sample signal <b>[2, 0, 2, 0]</b>. <b>Click every bin that is non-zero.</b>", fig: spectrum([0, 0, 0, 0]), a: ["k0", "k2"],
        hint: "The signal is a constant 1 plus an alternating ±1.",
        why: "X₀ = 2 + 0 + 2 + 0 = 4, X₁ = 2 − 2 = 0, X₂ = 2 + 2 = 4, X₃ = 0. It's a DC level (k = 0) plus the fastest alternation (k = 2)." },
      { type: "mcq", q: "For N = 4096, roughly how many times fewer operations does the FFT need than the direct DFT (N² vs N log₂ N)?", o: ["about 12", "about 340", "about 4,000", "about 16 million"], a: 1, hint: "N² / (N log₂ N) = N / log₂ N, and log₂ 4096 = 12.",
        why: "N² / (N log₂ N) = N / log₂ N = 4096 / 12 ≈ <b>341</b>." },
      { type: "order", q: "Recursive radix-2 FFT with N = 4. Order the input samples as they appear at the bottom of the recursion (bit-reversed).",
        items: ["x₀", "x₂", "x₁", "x₃"],
        why: "Split into evens (x₀, x₂) and odds (x₁, x₃), then split again. Leaf order 0, 2, 1, 3 is the bit-reversal of 00, 01, 10, 11." },
      { type: "mcq", q: "A 12.5 Hz tone recorded for exactly 1 second shows energy spread over several bins around 12–13 Hz. What's going on, and what helps?",
        o: ["Aliasing: the tone is above Nyquist, so sample much faster", "Leakage: 12.5 cycles don't fit; a Hann window helps", "The FFT is inaccurate for tones that aren't whole numbers", "Random noise: average several recordings"], a: 1,
        why: "12.5 cycles don't fit the window, so its edges don't match up and energy smears. That's leakage, not aliasing (the tone is far below the Nyquist limit)." },
      { type: "mcq", q: "Why does the FFT give <b>exactly</b> the same answer as the direct DFT?",
        o: ["It's an approximation that's usually very close", "It's the same sum, regrouped so shared work is done once", "It drops the terms that are too small to matter", "It only computes half the bins and mirrors them"], a: 1,
        why: "It's pure algebra: the even/odd split rewrites the same sum. Only rounding differs." },
    ],
  });

  /* ================= Phase 10 ================= */
  boss(10, {
    blurb: "Eight questions: new softmax numbers, masks, scaling, and what attention can't tell you.",
    lede: "New scores and a new sentence. Softmax by hand is fine with e ≈ 2.718.",
    qs: [
      { type: "mcq", q: "Attention scores for three tokens are [1, 1, 0]. After softmax, roughly what weight does the third token get? (e ≈ 2.7)", o: ["0", "about 0.16", "about 0.33", "about 0.5"], a: 1, hint: "The first two each get e ≈ 2.7 and the third gets e⁰ = 1. The total is about 6.4, so the third gets about 1 part in 6.",
        why: "e¹, e¹, e⁰ = 2.718, 2.718, 1, which sum to 6.437. The third gets 1 / 6.437 ≈ <b>0.155</b>; the first two get 0.422 each." },
      { type: "pick", q: "A decoder is generating the sentence \"cats chase small mice\". <b>Click every cell the causal mask must block.</b>", fig: maskGrid(["cats", "chase", "small", "mice"]),
        a: ["r0c1", "r0c2", "r0c3", "r1c2", "r1c3", "r2c3"],
        why: "Each word may look at itself and earlier words only, so everything above the diagonal (a later column) is masked: 6 cells." },
      { type: "mcq", q: "A model's context grows from 512 to 2,048 tokens. By what factor does the attention score matrix grow?", o: ["4×", "8×", "16×", "64×"], a: 2,
        why: "It's n × n: 4× longer means 4² = <b>16×</b> more pairs. That's why long contexts are expensive." },
      { type: "mcq", q: "Keys and queries have dimension d_k = 64. What do the raw dot products get divided by before softmax?", o: ["64", "32", "8", "6"], a: 2,
        why: "√64 = <b>8</b>. Without it, large dot products push softmax towards all-or-nothing, which stalls learning." },
      { type: "match", q: "A library analogy: match each part of attention to its role.",
        pairs: [["Query", "What you type into the library search box"], ["Key", "The label on each book's spine that the search matches against"], ["Value", "The contents of the book you actually read"]],
        why: "Queries are compared with keys to decide how relevant each item is; values are what gets blended into the output." },
      { type: "mcq", q: "Scores are [5, 3, 1]. You subtract 5 from all of them before softmax (a common trick for numerical safety). What happens to the weights?",
        o: ["They all shrink", "They're identical", "The first becomes 0", "They become uniform"], a: 1,
        why: "e^(s − 5) = e^s × e^(−5), and the common factor cancels when you normalise. That's why subtracting the max is safe." },
      { type: "mcq", q: "A researcher shows a heatmap where \"it\" puts 80% weight on \"trophy\" and claims this <b>proves</b> the model resolved the pronoun. What's the problem?",
        o: ["80% is too low to count as evidence; it would need to be 100%", "It shows where information flowed in one layer, not why", "Heatmaps can't show pronouns at all", "Nothing: 80% weight is proof"], a: 1,
        why: "Attention is one mechanism among many (other heads, other layers, MLPs). High weight is suggestive, but it isn't a causal explanation." },
      { type: "multi", q: "Which statements about transformers are true? Select all that apply.",
        o: ["Without position information, shuffling the words would give the same set of outputs", "Every attention weight row sums to 1", "Values decide how much attention each token gets", "Multiple heads can attend to different relationships at once"], a: [0, 1, 3],
        why: "Attention itself ignores order, hence position vectors. Softmax rows sum to 1. Keys (via query·key scores), not values, decide the weights. Heads run in parallel with their own projections." },
    ],
  });

  /* ================= Capstone ================= */
  N.registerBoss({
    id: "a11-capstone", subject: "algo", lecture: 11, title: "Final boss: pick the algorithm",
    blurb: "Ten mixed questions across all ten phases: choose tools, spot broken assumptions, estimate costs.",
    lede: "Every phase in one quiz. For each scenario, find the assumption that decides which tool fits.",
    qs: [
      { type: "cat", q: "A logistics company has four problems. Which tool fits each?",
        buckets: ["Dijkstra / A*", "MST (Prim / Kruskal)", "Linear programming", "Evolutionary search"],
        items: [["Fastest van route from depot to one customer", 0], ["Cheapest fibre network linking all 40 depots", 1], ["How many of each product to ship, with linear capacity limits", 2], ["Driver rosters with dozens of messy, non-linear union rules", 3]],
        why: "Point-to-point shortest path: Dijkstra/A*. Connect everything cheaply: MST. Linear objective and constraints: LP. Messy, non-linear, hard: heuristic search." },
      { type: "mcq", q: "A route planner starts giving wrong answers after the company adds <b>refund edges with negative cost</b>. Which assumption broke, and what's the fix?",
        o: ["Admissibility; use a better heuristic", "Non-negative edge weights", "Connectivity; add edges", "Nothing broke"], a: 1,
        why: "Dijkstra's \"settled means final\" rule needs non-negative weights. Bellman–Ford handles negative edges (and detects negative cycles)." },
      { type: "match", q: "Match each data problem to the right tool.",
        pairs: [["Shrink English text with very uneven letter frequencies", "Huffman coding"], ["Shrink server logs full of repeated phrases", "LZW"], ["Catch accidental bit flips on a fast, retryable link", "CRC + retransmit"], ["Survive bit flips where resending is impossible", "Hamming error correction"]],
        why: "Skewed symbols: Huffman. Repeated sequences: LZW. Cheap retries: detect with CRC. No retries: correct on arrival." },
      { type: "multi", q: "Which of these need a <b>secret</b> to work? Select all that apply.",
        o: ["Checking a file against its SHA-256 fingerprint", "Diffie–Hellman key agreement", "Signing a software update", "Computing a CRC"], a: [1, 2],
        why: "DH needs each side's private exponent, and signing needs a private key. Hashes and CRCs are public calculations; anyone can compute them." },
      { type: "slider", q: "Estimate: how many times slower is a direct DFT than an FFT for N = 1,048,576 (2²⁰) samples?", min: 1000, max: 100000, step: 1000, start: 10000, ans: 52000, tol: 6000, unit: "×", hint: "The ratio is N / log₂ N. Here log₂ N = 20, so it's about a million divided by 20.",
        why: "N / log₂ N = 1,048,576 / 20 ≈ <b>52,000×</b>. That gap is the difference between real-time and hopeless." },
      { type: "order", q: "A search engine's pipeline, from crawling to answering a query. Put it in order.",
        items: ["Crawl pages and record their links", "Build the link matrix and repair dangling pages", "Iterate PageRank until the scores settle", "At query time, combine text relevance with PageRank to order the results"],
        why: "PageRank is computed offline over the whole link graph; at query time it's one signal combined with text matching." },
      { type: "mcq", q: "You need the lowest point of an expensive, noisy simulation with three continuous knobs and no gradient available. Which tool?",
        o: ["The simplex method for LP", "Golden-section search", "Nelder–Mead", "Kruskal's algorithm"], a: 2,
        why: "No linear structure rules out LP; three knobs rules out 1-D golden-section; no gradient rules out gradient descent. Nelder–Mead only needs comparisons." },
      { type: "cat", q: "What happens to each algorithm when its key assumption is removed?",
        buckets: ["Still correct", "Can give wrong answers"],
        items: [["A* with h = 0", 0], ["A* with h = 2 × true distance", 1], ["Hamming decoding with two flipped bits", 1], ["Kruskal with tied edge weights", 0], ["Golden-section on a function with two dips", 1]],
        why: "h = 0 is just Dijkstra, and ties don't hurt MSTs. An overestimating heuristic, two-bit errors and a non-unimodal bracket all break the guarantee." },
      { type: "mcq", q: "Which pair shares the most similar core idea?",
        o: ["Prim and Dijkstra", "Huffman and RSA", "FFT and Kruskal", "Graham scan and PageRank"], a: 0,
        why: "Prim adds the cheapest edge leaving the tree; Dijkstra settles the closest frontier node. Same greedy frontier pattern with a different key (edge weight vs path length)." },
      { type: "mcq", q: "An attention model processes 1,024 tokens. How many query–key scores does <b>one</b> attention head compute?", o: ["1,024", "2,048", "about 1 million (1,024²)", "about 1 billion (1,024³)"], a: 2,
        why: "Every token scores every token: 1,024² = <b>1,048,576</b>, the quadratic cost again." },
    ],
  });
})();

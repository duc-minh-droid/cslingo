/* ALGO revision bank, second round of understanding questions, part 1.
   Phase 1 (anatomy, big-O, surfer, PageRank), Dijkstra, A*, routing, linear programming.
   Every number was checked by running the real algorithm in node. */
(function () {
  const B = NIC.bank, Qf = NIC.qfig;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px">${body}</svg>`;
  const inj = (s, extra) => s.replace("</svg>", extra + "</svg>");
  const codeBox = (lines) => `<div style="font:700 13px var(--mono);background:var(--bg-2);border:2px solid var(--line);border-radius:12px;padding:8px 12px;margin-bottom:8px;white-space:pre;overflow-x:auto">${lines.join("\n")}</div>`;
  const hLab = (nodes, h, dy = 34) => Object.entries(h).map(([k, v]) => tx(nodes[k][0], nodes[k][1] + dy, "h = " + v, { sz: 12, c: "var(--amber-ink)" })).join("");
  const rowRect = (x, y, w, h, pick, inner) => `<g data-pick="${pick}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${inner}</g>`;

  /* =====================================================================
     a1-anatomy
     ===================================================================== */
  const euclid = codeBox(["def gcd(a, b):", "    while b != 0:", "        a, b = b, a % b", "    return a"]);
  const isSortedChips = (() => {
    const items = [["c1", "[1, 2, 3]"], ["c2", "[3, 1, 2]"], ["c3", "[1, 2, 0]"], ["c4", "[ ]"], ["c5", "[4]"], ["c6", "[2, 1, 0]"]];
    const body = items.map(([id, t], i) => rowRect(10 + (i % 3) * 160, 8 + Math.floor(i / 3) * 50, 148, 40, id, tx(84 + (i % 3) * 160, 34 + Math.floor(i / 3) * 50, t, { sz: 15, f: "var(--mono)" }))).join("");
    return codeBox(["def is_sorted(xs):", "    return xs[0] <= xs[1]"]) + svg(490, 112, body);
  })();

  B.add("a1-anatomy", [
    { type: "cat", q: "A binary search looks for <code>t</code> in a list <code>xs</code>. Sort each statement by the job it does.",
      buckets: ["Precondition", "Loop invariant", "Postcondition"],
      items: [["<code>xs</code> is already sorted", 0], ["If <code>t</code> is in the list, it sits between positions <code>lo</code> and <code>hi</code>", 1], ["Any index returned holds the value <code>t</code>", 2], ["Every item left of <code>lo</code> is smaller than <code>t</code>", 1], ["The items can be compared with <code>&lt;</code>", 0], ["The answer is −1 only when <code>t</code> is not in the list", 2]],
      why: "A precondition is what the caller must give you. An invariant is true at the top of every pass. A postcondition is what the function promises when it ends." },
    { type: "multi", q: "Euclid's method for the greatest common divisor is shown. Select every statement that is true.", fig: euclid,
      o: ["gcd(a, b) is the same before and after each pass", "b gets strictly smaller on every pass, so the loop must stop", "When the loop ends, <code>a</code> holds the answer", "<code>a</code> gets strictly smaller on every pass", "It only works if <code>a</code> starts bigger than <code>b</code>"],
      a: [0, 1, 2], hint: "Try a = 3, b = 5 by hand. What are a and b after one pass?",
      why: "The invariant (same gcd) plus a shrinking b (a % b is always below b) give a correct, terminating loop. With a = 3, b = 5 the first pass gives a = 5, b = 3, so a grew, and a smaller first number is handled without any special case." },
    { type: "bug", q: "This should return the position of <code>t</code> in <code>xs</code>, or −1 if it is missing. It says −1 for almost everything. Click the faulty line.",
      code: ["def find(xs, t):", "    for i in range(len(xs)):", "        if xs[i] == t:", "            return i", "        return -1"], a: 4,
      why: "The <code>return -1</code> sits inside the loop, so it runs after the very first item. It belongs after the loop, once every item has been checked." },
    { type: "match", q: "Every loop must stop. Match each loop to the quantity that shrinks and forces it to stop.",
      pairs: [["<code>while n &gt; 1: n = n // 2</code>", "n itself"], ["<code>while lo &lt;= hi:</code> in binary search", "The gap hi − lo"], ["<code>for x in xs:</code>", "Items still to visit"], ["<code>while x &lt; 100: x += 7</code>", "100 − x, the distance left"]],
      why: "A loop is safe when some whole number that cannot go below a floor shrinks on every pass. Naming it is the termination argument." },
    { type: "pick", q: "<code>is_sorted</code> is meant to say whether a whole list is in order, but it only looks at the first two items. Click <b>every</b> input where this function gives a wrong result or crashes.",
      fig: isSortedChips, a: ["c3", "c4", "c5"],
      why: "[1, 2, 0] is not sorted, yet the first two items are in order, so it says True. [ ] and [4] have no second item, so <code>xs[1]</code> crashes. The other three happen to agree with the right answer, which is why tests like those miss the bug." },
  ]);

  /* =====================================================================
     a1-bigo
     ===================================================================== */
  const bigoBlocks = (() => {
    const blk = (y, h, id, lines) => rowRect(8, y, 484, h, id, lines.map((l, i) => tx(24, y + 24 + i * 20, l, { a: "start", sz: 13, f: "var(--mono)" })).join(""));
    return svg(500, 250,
      blk(6, 62, "b1", ["# block 1", "total = sum(xs)    # one pass over xs"]) +
      blk(76, 62, "b2", ["# block 2", "xs.sort()    # sorting costs about n log n"]) +
      blk(146, 100, "b3", ["# block 3", "for a in xs:", "    for b in xs:", "        if a + b == 100: count += 1"]));
  })();

  B.add("a1-bigo", [
    { type: "slider", q: "A quadratic, O(n²), program takes 3 seconds on 1,000 items. About how many seconds would it need for 10,000 items?",
      min: 0, max: 600, step: 10, ans: 300, tol: 60, unit: " s",
      hint: "10 times the items means 10 × 10 = 100 times the work.",
      why: "Squaring is what hurts: n grows 10 times, n² grows 100 times, so 3 s becomes about 300 s (five minutes)." },
    { type: "order", q: "Each fragment runs with n = 1,000. Order them from the <b>fewest</b> steps to the most.",
      items: ["<code>while n &gt; 1: n = n // 2</code>", "<code>for i in range(n): work()</code>", "<code>for i in range(n):</code> then <code>for j in range(10): work()</code>", "<code>for i in range(n):</code> then <code>for j in range(n): work()</code>"],
      why: "Halving takes about 10 steps (2¹⁰ ≈ 1,000). One loop is 1,000. A loop with a fixed inner 10 is 10,000. Two full loops is 1,000,000." },
    { type: "pick", q: "This program does all three blocks one after another on a list of a million items. Click the block that sets its big-O.", fig: bigoBlocks, a: "b3",
      hint: "Add them up as n + n log n + n². Which term wins when n is huge?",
      why: "The total is O(n) + O(n log n) + O(n²), and the n² term towers over the others. Making blocks 1 and 2 faster would barely change the running time." },
    { type: "cat", q: "A teammate speeds up some code. Does each change move it into a <b>different</b> big-O class?",
      buckets: ["Different class", "Same class"],
      items: [["Replace a nested-loop duplicate check with a <code>set</code> lookup", 0], ["Move to a computer that is ten times faster", 1], ["Delete a debug <code>print</code> inside the inner loop", 1], ["Replace a scan of a sorted list with binary search", 0], ["Make the search loop stop as soon as it finds the item", 1], ["Sort first, then compare only neighbours instead of every pair", 0]],
      why: "Big-O is about how the work grows with n. Faster hardware, deleting a constant-time line or an early exit (the worst case still scans everything) leave the growth alone. Changing the method itself changes the class." },
    { type: "multi", q: "Which statements about big-O are true? Select all.",
      o: ["O(n) says the time is at most a constant times n once n is big", "An O(n²) program always runs exactly n² steps", "Two O(n) programs can differ in speed by a factor of 100", "Big-O counts the lines of code in a program", "Buying a faster computer changes the big-O class", "An O(n log n) algorithm is also O(n²)"],
      a: [0, 2, 5],
      why: "Big-O is an upper bound on growth that hides constants, so two O(n) programs may differ a lot and O(n log n) fits under O(n²). It is not an exact count, not about code length, and hardware speed only changes the constant." },
    { type: "slider", q: "Binary search needs about 10 comparisons to search 1,000 sorted items. About how many for 1,000,000 items?",
      min: 0, max: 100, step: 1, ans: 20, tol: 3, unit: " comparisons",
      hint: "1,000,000 is 1,000 × 1,000. Each factor of 1,000 adds about 10 halvings.",
      why: "log₂(1,000,000) ≈ 20. A thousand times more data costs only 10 extra comparisons, which is why logarithmic algorithms scale so well." },
  ]);

  /* =====================================================================
     a1-surfer
     ===================================================================== */
  const trailFig = (() => {
    const nodes = { A: [60, 90], B: [170, 30], C: [180, 150], D: [320, 90], E: [430, 90] };
    const edges = [["A", "B"], ["A", "C"], ["B", "C"], ["C", "A"], ["C", "D"], ["D", "E"], ["E", "D"]];
    const g = Qf.graph(nodes, edges, { directed: true, w: 490, h: 180, r: 17 });
    const trail = [["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "A"], ["A", "C"], ["C", "A"], ["A", "E"]];
    const chips = trail.map(([a, b], i) => rowRect(6 + (i % 4) * 121, 6 + Math.floor(i / 4) * 46, 112, 38, "s" + (i + 1),
      tx(62 + (i % 4) * 121, 31 + Math.floor(i / 4) * 46, `${i + 1}:  ${a} → ${b}`, { sz: 14 }))).join("");
    return g + `<div class="faint" style="margin:4px 0;font-weight:800">The surfer's eight moves, in order</div>` + svg(490, 98, chips);
  })();

  const hubFig = (() => {
    const nodes = { H: [220, 140], A: [370, 140], D: [370, 45], E: [470, 45], B: [70, 55], C: [70, 225] };
    const edges = [["A", "H"], ["B", "H"], ["C", "H"], ["H", "A"], ["D", "A"], ["E", "D"]];
    return Qf.graph(nodes, edges, { pick: "nodes", directed: true, w: 520, h: 270, r: 19 });
  })();

  const visitsFig = (() => {
    const bars = [["P", 0], ["Q", 0], ["R", 5030], ["S", 4970]];
    let s = "";
    bars.forEach(([k, v], i) => {
      const x = 40 + i * 115, hgt = Math.round(v / 5030 * 110);
      s += `<rect x="${x}" y="${140 - hgt}" width="70" height="${Math.max(hgt, 2)}" rx="8" fill="${v ? "var(--blue)" : "var(--line-2)"}"/>` + tx(x + 35, 160, "page " + k, { sz: 13 }) + tx(x + 35, 132 - hgt, v.toLocaleString("en-GB"), { sz: 13 });
    });
    return svg(500, 172, s) + `<div class="faint" style="margin-top:4px;font-weight:800">Visits to each page in 10,000 steps</div>`;
  })();

  B.add("a1-surfer", [
    { type: "pick", q: "A surfer's walk is below. A <b>click</b> only follows an arrow from the page the surfer is on. Click <b>every</b> move that cannot have been a link click, so it must have been a teleport.",
      fig: trailFig, a: ["s5", "s8"],
      why: "E has only one link, to D, so E → A has to be a teleport. A links to B and C only, so A → E is a teleport too. All other moves follow an arrow." },
    { type: "pick", q: "Two runs of the same web: one with the surfer teleporting 5% of the time, one with 50%. Click <b>every</b> page whose rank goes <b>down</b> when the teleporting becomes more frequent.",
      fig: hubFig, a: ["H", "A"],
      hint: "More teleporting spreads rank evenly. Who has the most to lose?",
      why: "Teleporting hands every page an equal share, so rank drains from the pages that were hoarding it. H and A (which pass rank round between them) fall from about 0.48 each to about 0.31, while B, C, D and E all rise." },
    { type: "match", q: "Match each moment in the surfer story to the maths that describes it.",
      pairs: [["Clicks one of the page's links at random", "A column of the link matrix: equal shares to each link"], ["Gets bored and jumps to any page", "The teleport term, (1 − d) ÷ n for every page"], ["Circles inside a closed group of pages for ever", "A rank sink, which teleporting fixes"], ["Share of all visits to a page, over a long walk", "That page's PageRank"]],
      why: "The surfer is the picture and the matrix is the calculation: clicks make H, boredom makes the teleport term, and long-run visit shares are the PageRank." },
    { type: "multi", q: "Which statements about the random surfer are true? Select all.",
      o: ["Where the surfer goes next depends only on the page they are on now", "A page with more incoming links always outranks one with fewer", "Teleporting lets the surfer escape a closed loop of pages", "The surfer remembers visited pages and avoids them", "Over a long walk, each page's share of visits settles down"],
      a: [0, 2, 4],
      why: "The surfer is memoryless: only the current page matters. Teleporting is the escape route from loops. Visit shares settle to the PageRank. Who links to you matters as well as how many, and the surfer never avoids old pages." },
    { type: "mcq", q: "A simulation of 10,000 steps produced these counts, with exactly 0 visits to P and Q. Which explanation fits best?", fig: visitsFig,
      o: ["R and S link only to each other and the surfer never teleported", "P and Q have a PageRank of 0.01, which rounds to zero visits", "P and Q are dangling pages that soaked up all the early visits", "Teleporting was on, but P and Q have too few incoming links"],
      a: 0, hint: "If P had rank 0.01, about how many visits would 10,000 steps give it?",
      why: "A rank of 0.01 would give about 100 visits, and with teleporting every page gets some. An exact zero means the surfer was trapped in R and S. A dangling page would have collected visits, not none." },
    { type: "bug", q: "A surfer simulation should follow a link with probability <code>d</code> (say 0.85) and teleport otherwise. It teleports almost every time. Click the faulty line.",
      code: ["def step(page, links, pages, d):", "    if random() > d:", "        return choice(links[page])", "    return choice(pages)"], a: 1,
      why: "<code>random()</code> is below <code>d</code> with probability d, so the test should be <code>&lt; d</code>. With <code>&gt;</code> the surfer clicks a link only 15% of the time." },
  ]);

  /* =====================================================================
     a1-pagerank
     ===================================================================== */
  const oneStepFig = Qf.graph({ A: [70, 70], B: [250, 70], C: [250, 200], D: [70, 200] },
    [["A", "B"], ["A", "C"], ["A", "D"], ["B", "C"], ["C", "A"], ["C", "D"], ["D", "C"]], { pick: "nodes", directed: true, w: 330, h: 270, r: 20 });

  const qualityFig = (() => {
    const nodes = { s1: [40, 30], s2: [40, 75], s3: [40, 120], s4: [40, 165], s5: [40, 210], W: [180, 120], Q: [310, 120], t1: [250, 235], t2: [420, 235], P: [420, 160] };
    const edges = [["s1", "W"], ["s2", "W"], ["s3", "W"], ["s4", "W"], ["s5", "W"], ["W", "Q"], ["Q", "s1"], ["t1", "P"], ["t2", "P"], ["P", "t1"]];
    return Qf.graph(nodes, edges, { directed: true, w: 480, h: 265, r: 15 });
  })();

  B.add("a1-pagerank", [
    { type: "slider", q: "A web has 5 pages and the damping is d = 0.85. Even a page that nobody links to still receives a small steady share of rank from teleporting. How much rank is that, as a percentage of all the rank?",
      min: 0, max: 20, step: 1, ans: 3, tol: 1, unit: "%",
      hint: "Teleporting gives (1 − d) ÷ n to every page. Work out 0.15 ÷ 5.",
      why: "(1 − 0.85) ÷ 5 = 0.03, so every page has at least 3%. That floor is why no page in the damped matrix ever ends up at zero." },
    { type: "pick", q: "Every page starts with 0.25 and there is <b>no</b> damping. Each page splits its rank equally between the pages it links to. After <b>one</b> step, which page holds the <b>least</b> rank?",
      fig: oneStepFig, a: "B", hint: "Count who links to each page, and how many links each of those pages has.",
      why: "B gets only A's third (0.25 ÷ 3 ≈ 0.08). A gets half of C's 0.25 (0.125), D gets a third of A plus half of C (about 0.21), and C collects from A, B and D (about 0.58)." },
    { type: "cat", q: "Think about the full damped PageRank matrix <b>G</b> (links plus teleporting). Is each statement true of it?",
      buckets: ["True of G", "Not true of G"],
      items: [["Every column adds up to 1", 0], ["Every entry is greater than 0", 0], ["Every row adds up to 1", 1], ["Most entries are zero, so it is sparse", 1], ["1 is an eigenvalue, and PageRank is its eigenvector", 0]],
      why: "Each column is a probability split, so it sums to 1. Teleporting adds a positive amount everywhere, which makes G dense. Rows can add up to anything: a popular page has a big row sum." },
    { type: "multi", q: "You have a PageRank program that has converged. Which changes would alter the final PageRank vector? Select all.",
      o: ["Changing the damping from 0.85 to 0.5", "Starting from a random positive vector instead of equal ranks", "Adding one new link between two pages", "Stopping when the change is below 1e-8 instead of 1e-6", "Numbering the pages in a different order"],
      a: [0, 2],
      why: "The answer depends on the web and on d. The start vector only affects the journey, the tolerance only affects when you stop, and renumbering relabels pages without changing who links to whom." },
    { type: "mcq", q: "Page P has two incoming links from pages nobody links to. Page Q has just one incoming link, from W, which has five incoming links of its own. Which page ends up with the higher PageRank?", fig: qualityFig,
      o: ["Q, because its single link comes from a well-linked page", "P, because two incoming links beat one", "They tie, because every page starts with equal rank", "P, because it links back to a page that links to it"],
      a: 0,
      why: "Run the iteration and Q settles near 0.21, P near 0.15. A link passes on a share of the rank of the page it comes from, so one link from an important page is worth more than two from pages that nobody links to." },
    { type: "bug", q: "This power iteration should stop once the ranks stop changing, but it always stops after one step with a wrong answer. Click the faulty line.",
      code: ["p = [1 / n] * n", "while True:", "    q = matvec(G, p)", "    if diff(q, q) < 1e-9:", "        break", "    p = q"], a: 3,
      why: "<code>diff(q, q)</code> compares the new vector with itself, so it is always 0. It should compare with the old one, <code>diff(q, p)</code>." },
  ]);

  /* =====================================================================
     a2-dijkstra
     ===================================================================== */
  const orderGraph = Qf.graph({ S: [45, 130], A: [160, 50], B: [160, 210], D: [290, 50], C: [290, 210], E: [385, 50], T: [455, 150] },
    [["S", "A", 4], ["S", "B", 2], ["B", "A", 1], ["B", "C", 5], ["A", "D", 3], ["C", "T", 2], ["D", "T", 6], ["D", "E", 2], ["E", "T", 3]], { w: 500, h: 262, r: 18 });
  const whatIfGraph = Qf.graph({ S: [40, 135], X: [140, 135], P: [250, 55], Q: [250, 150], Y: [350, 100], T: [450, 135], Z: [250, 260] },
    [["S", "X", 3], ["X", "P", 2], ["P", "Y", 2], ["X", "Q", 3], ["Q", "Y", 1], ["Y", "T", 4], ["S", "Z", 10], ["Z", "T", 2]], { pick: "edges", w: 490, h: 290, r: 18 });
  const stopGraph = Qf.graph({ S: [45, 130], A: [150, 45], B: [150, 130], C: [150, 215], D: [275, 85], E: [300, 170], F: [300, 235], T: [430, 130] },
    [["S", "A", 3], ["S", "B", 5], ["S", "C", 9], ["A", "D", 4], ["B", "D", 1], ["B", "E", 6], ["C", "F", 2], ["D", "T", 2], ["E", "T", 3], ["F", "T", 4]], { pick: "nodes", w: 490, h: 262, r: 18 });
  const bfsGraph = Qf.graph({ S: [50, 140], A: [170, 55], B: [320, 55], C: [250, 220], T: [450, 140] },
    [["S", "T", 9], ["S", "A", 2], ["A", "B", 3], ["B", "T", 2], ["S", "C", 4], ["C", "T", 6]], { w: 500, h: 262, r: 19 });

  B.add("a2-dijkstra", [
    { type: "order", q: "Dijkstra runs from S on this map (road costs shown). Put the nodes in the order Dijkstra <b>settles</b> them, S first.", fig: orderGraph,
      items: ["S", "B", "A", "D", "C", "E", "T"], hint: "Final distances: B 2, A 3, D 6, C 7, E 8, T 9.",
      why: "Each time, Dijkstra settles the unsettled node with the smallest tentative distance: S (0), B (2), A (3 via B), D (6), C (7), E (8) and T (9 via C)." },
    { type: "match", q: "Dijkstra always needs the closest unsettled node. Match each graph to the way of finding it that suits best.",
      pairs: [["A tiny classroom graph with 6 nodes", "Scan every node: simple and fast enough"], ["A road network with millions of junctions and about 3 roads each", "A binary heap that hands over the minimum"], ["Every road costs exactly 1", "Plain breadth-first search: no priority queue needed"], ["Almost every pair of towns joined by its own road", "A simple array scan: the heap saves little"]],
      why: "Scanning costs about n² in total. A heap costs about (n + roads) × log n, which wins hugely on sparse maps but not on dense ones. With equal costs, a queue already gives the closest node." },
    { type: "pick", q: "Each road below is made <b>1 more expensive</b>, one road at a time. Click every road where doing that makes the shortest distance from S to T <b>increase</b>.",
      fig: whatIfGraph, a: ["S-X", "Y-T"], hint: "Find every shortest route first. Is there more than one?",
      why: "The shortest distance is 11, along S–X–P–Y–T and also S–X–Q–Y–T (and S–Z–T ties at 12 only after a rise). S–X and Y–T lie on every shortest route, so raising either one lifts the distance to 12. Raising a road on just one of the tied routes changes nothing." },
    { type: "bug", q: "Dijkstra saves for each node the node it came from (<code>prev</code>). This should return the route from <code>s</code> to <code>t</code>, but it comes out backwards. Click the faulty line.",
      code: ["def route(prev, s, t):", "    path = [t]", "    while path[-1] != s:", "        path.append(prev[path[-1]])", "    return path"], a: 4,
      why: "The loop walks from t back to s, so the list is in reverse. It should end with <code>return path[::-1]</code>." },
    { type: "mcq", q: "A friend uses breadth-first search (fewest roads) on this map and drives that route. Dijkstra finds the cheapest. How do the two routes from S to T compare?", fig: bfsGraph,
      o: ["The fewest-roads route costs 2 more than the cheapest", "The two routes are the same", "The fewest-roads route costs 5 more than the cheapest", "The fewest-roads route is also the cheapest, but not unique"],
      a: 0, hint: "Cheapest: S–A–B–T. Fewest roads: the single road S–T.",
      why: "BFS picks S–T, one road costing 9. Dijkstra picks S–A–B–T for 2 + 3 + 2 = 7. BFS counts roads, not costs, so it only suits maps where every road costs the same." },
    { type: "pick", q: "Dijkstra stops the instant it settles T, because that is all it was asked for. Click <b>every</b> node that never gets settled.",
      fig: stopGraph, a: ["C", "E", "F"], hint: "A node is settled before T only if its distance from S is less than T's.",
      why: "Distances from S: A 3, B 5, D 6, T 8, then C 9, E 11 and F 11. Anything farther than T is still waiting when Dijkstra stops, so asking for one target saves work." },
  ]);

  /* =====================================================================
     a2-astar
     ===================================================================== */
  const astarNodes = { S: [50, 130], A: [170, 50], B: [170, 210], C: [310, 50], D: [310, 210], G: [450, 130] };
  const astarGraph = inj(Qf.graph(astarNodes, [["S", "A", 2], ["S", "B", 3], ["A", "C", 4], ["B", "D", 2], ["C", "G", 3], ["D", "G", 5], ["A", "B", 2]], { w: 500, h: 262, r: 18 }),
    hLab(astarNodes, { S: 6, A: 5, B: 3, C: 2, D: 5, G: 0 }, 34));
  const heurNodes = { S: [50, 130], A: [170, 50], B: [170, 210], C: [310, 50], D: [310, 210], G: [450, 130] };
  const heurGraph = inj(Qf.graph(heurNodes, [["S", "A", 3], ["S", "B", 4], ["A", "C", 2], ["B", "C", 5], ["C", "G", 4], ["B", "D", 3], ["D", "G", 6]], { pick: "nodes", w: 500, h: 262, r: 18 }),
    hLab(heurNodes, { S: 8, A: 7, B: 9, C: 4, D: 8, G: 0 }, 34));
  const runsTable = (() => {
    const rows = [["k0", "0 × Manhattan (that is Dijkstra)", "58", "16"], ["k1", "1 × Manhattan", "39", "16"], ["k3", "3 × Manhattan", "29", "18"], ["k6", "6 × Manhattan", "26", "20"]];
    let s = tx(150, 18, "Heuristic used", { sz: 12, c: "var(--text-dim)" }) + tx(340, 18, "Cells expanded", { sz: 12, c: "var(--text-dim)" }) + tx(440, 18, "Path length", { sz: 12, c: "var(--text-dim)" });
    rows.forEach(([id, a, b, c], i) => { const y = 28 + i * 44; s += rowRect(6, y, 488, 36, id, tx(150, y + 24, a, { sz: 14 }) + tx(340, y + 24, b, { sz: 15 }) + tx(440, y + 24, c, { sz: 15 })); });
    return svg(500, 210, s);
  })();

  B.add("a2-astar", [
    { type: "order", q: "A* runs from S to G on this graph. Each node shows its heuristic h. Put the nodes A* <b>expands</b> in order, S first. (D is never expanded, so it isn't listed.)",
      fig: astarGraph, items: ["S", "B", "A", "C", "G"], hint: "Expand the open node with the smallest f = g + h. Start: f(S) = 0 + 6.",
      why: "S (f 6). Then B (g 3, f 6) and A (g 2, f 7). B's neighbour D gets f = 5 + 5 = 10. A leads to C (g 6, f 8), then G (g 9, f 9). D's f of 10 is above the goal's 9, so A* finishes before touching it." },
    { type: "pick", q: "The same maze was searched four times with the heuristic multiplied by a different number. Dijkstra's run (0 ×) is always shortest. Click <b>every</b> run that returned a longer-than-shortest path.",
      fig: runsTable, a: ["k3", "k6"],
      why: "The shortest path is 16. Multiplying by 3 or 6 makes the heuristic overestimate, so A* chases the goal and expands fewer cells but accepts a longer path (18 and 20). Weight 1 is safe and still beats Dijkstra on work." },
    { type: "bug", q: "This A* sets a node's cost the first time it sees it and never improves it. It sometimes returns a long route. Click the faulty line.",
      code: ["for nb, w in graph[u]:", "    new_g = g[u] + w", "    if nb not in g:", "        g[nb] = new_g", "        push(open, (new_g + h(nb), nb))"], a: 2,
      why: "A cheaper way to reach a node already seen must be accepted. The test should be <code>if nb not in g or new_g &lt; g[nb]:</code>." },
    { type: "match", q: "Pick the best search for each job.",
      pairs: [["Shortest route through a maze where every step costs 1", "Breadth-first search"], ["Cheapest route on a road map, with no idea where the goal is", "Dijkstra"], ["Cheapest route on a road map, and you know the goal's coordinates", "A* with a straight-line heuristic"], ["Shortest paths when some edges can be negative", "Bellman–Ford"]],
      why: "A* needs a location sense (a heuristic) to beat Dijkstra. Dijkstra needs non-negative costs, and BFS only counts steps." },
    { type: "pick", q: "A* is being tested with the heuristic values h shown under each node, and the goal is G. Click <b>every</b> node where h overestimates the real remaining cost, so A* can no longer be trusted.",
      fig: heurGraph, a: ["A", "D"], hint: "True cost from A: A–C–G. From D: D–G.",
      why: "From A the true cost is 2 + 4 = 6 but h says 7. From D it is 6 but h says 8. At S (true 9, h 8), B (true 9, h 9) and C (true 4, h 4) the guesses are fine. One bad node is enough to lose the guarantee." },
  ]);

  /* =====================================================================
     a2-routing
     ===================================================================== */
  const loopFig = (() => {
    const P = { A: [50, 150], B: [160, 150], C: [270, 150], F: [380, 150], D: [160, 50], E: [270, 50] };
    const links = [["A", "B"], ["B", "C"], ["B", "D"], ["D", "E"], ["E", "F"]];
    let s = links.map(([a, b]) => `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="var(--line-2)" stroke-width="3"/>`).join("");
    s += `<line x1="270" y1="150" x2="380" y2="150" stroke="var(--rose)" stroke-width="3" stroke-dasharray="6 5"/>` + tx(325, 140, "✗", { sz: 18, c: "var(--rose-ink)" });
    const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--amber)" stroke-width="4" stroke-linecap="round" marker-end="url(#lpa)"/>`;
    s += arrow(72, 150, 134, 150) + arrow(182, 134, 246, 134) + arrow(248, 166, 184, 166) + arrow(182, 50, 244, 50) + arrow(286, 66, 358, 130);
    Object.entries(P).forEach(([k, [x, y]]) => {
      const c = `<circle cx="${x}" cy="${y}" r="20" fill="var(--panel)" stroke="${k === "F" ? "var(--teal)" : "var(--line-2)"}" stroke-width="3"/>` + tx(x, y + 5, k, { sz: 15 });
      s += k === "F" ? `<g>${c}</g>` : `<g data-pick="${k}">${c}</g>`;
    });
    return `<svg viewBox="0 0 440 200" style="width:100%;max-height:200px"><defs><marker id="lpa" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--amber)"/></marker></defs>${s}</svg>` +
      `<div class="faint" style="font-weight:800">Orange arrows: each router's next hop towards F. The link C–F has just failed.</div>`;
  })();

  B.add("a2-routing", [
    { type: "cat", q: "Router A has a table of costs and the neighbour B (the A–B link costs 2) has just advertised its own costs. What should A do with each entry?",
      buckets: ["A changes its entry", "A keeps its entry"],
      items: [["P: A has 9 (not via B). B says P is 5 away.", 0], ["Q: A has 6 (not via B). B says Q is 4 away.", 1], ["R: A has 5 (not via B). B says R is 1 away.", 0], ["T: A has 8 (not via B). B says T is 7 away.", 1], ["U: A has no route. B says U is 12 away.", 0], ["V: A has 4, and the route goes <b>via B</b>. B now says V is 6 away.", 0]],
      why: "A adds 2 to B's number: P 7 beats 9, Q 6 only ties 6 so it stays, R 3 beats 5, T 9 loses to 8, U 14 beats having nothing. V is the sneaky one: A's route goes through B, so when B's cost rises A must follow it to 8, even though that is worse." },
    { type: "pick", q: "After the failure, the routers' tables are out of step. A packet for F follows the next hops shown. Click <b>every</b> router that is stuck in a routing loop.",
      fig: loopFig, a: ["B", "C"],
      why: "B sends the packet to C, and C sends it straight back to B, so it bounces between them until its time runs out. A is only passing it on to B, and D and E still have a working route." },
    { type: "slider", q: "A, B and C sit in a line, each link costing 1. The link B–C breaks. A still believes C is 2 away, and B believes it from A, so each router raises its cost by 1 on every exchange. RIP treats a cost of 16 as unreachable. B's first new cost is 3. How many table updates, counting that first one, happen before the cost reaches 16?",
      min: 0, max: 30, step: 1, ans: 14, tol: 2, unit: " updates",
      hint: "The costs go 3, 4, 5, and so on, one per update, until 16.",
      why: "The two routers keep trading the news that C is reachable, adding 1 each time: 3, 4, 5, ..., 16. That is 14 updates of slow counting. Poisoned reverse stops it at once." },
    { type: "bug", q: "A link-state router should pass each new advertisement on once. This one keeps re-flooding the same advertisements for ever. Click the faulty line.",
      code: ["def on_lsa(lsa):", "    old = seen.get(lsa.src, 0)", "    if lsa.seq >= old:", "        seen[lsa.src] = lsa.seq", "        flood(lsa)"], a: 2,
      why: "With <code>&gt;=</code> an advertisement that was already seen still passes the test, so every router forwards it again and again. Only a strictly newer sequence number (<code>&gt;</code>) should be flooded." },
    { type: "match", q: "Match each kind of router to what it knows.",
      pairs: [["A link-state router", "The whole map: every router and every link cost"], ["A distance-vector router", "Its neighbours' claims about how far things are"], ["Both kinds", "The cost of their own directly connected links"], ["Neither kind", "A central server that holds the map for them"]],
      why: "Link-state routers each build the full map and run Dijkstra. Distance-vector routers only trade tables with neighbours. Both start from their own links, and there is no central server." },
  ]);

  /* =====================================================================
     a3-lp
     ===================================================================== */
  const regionFig = Qf.points({ O: [0, 0], X: [5, 0], Y: [5, 3], Z: [0, 8] }, { max: 10, w: 400, h: 300, pick: false, poly: ["O", "X", "Y", "Z"] });
  const cornerFig = Qf.points({ A: [0, 0], B: [5, 0], C: [4, 4], D: [1, 5] }, { max: 6, w: 400, h: 300, pick: false, poly: ["A", "B", "C", "D"] });
  const redundantFig = (() => {
    const W = 460, H = 280, X = (x) => 40 + x * 46, Y = (y) => H - 30 - y * 30;
    const poly = [[0, 0], [4, 0], [4, 2], [1, 5], [0, 5]].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ");
    let s = `<polygon points="${poly}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2"/>`;
    s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(8)}" y2="${Y(0)}" stroke="var(--line-2)" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(8)}" stroke="var(--line-2)" stroke-width="2"/>`;
    const L = (id, x1, y1, x2, y2, lx, ly, t, col) => `<g data-pick="${id}"><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${col}" stroke-width="3"/><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="transparent" stroke-width="18"/>${tx(X(lx), Y(ly), t, { sz: 13, c: col })}</g>`;
    s += L("c1", 0, 6.4, 6.4, 0, 6.2, 0.4, "x + y ≤ 6", "var(--blue-ink)");
    s += L("c2", 4, 0, 4, 7.4, 4.5, 7.5, "x ≤ 4", "var(--violet-ink)");
    s += L("c3", 0, 7, 8, 3, 6.3, 3.6, "x + 2y ≤ 14", "var(--amber-ink)");
    s += L("c4", 0, 5, 7, 5, 6.5, 5.5, "y ≤ 5", "var(--rose-ink)");
    return svg(W, H, s) + `<div class="faint" style="font-weight:800">The shaded area is what all four constraints allow, with x, y ≥ 0.</div>`;
  })();

  B.add("a3-lp", [
    { type: "match", q: "A bakery makes <b>x</b> trays of buns and <b>y</b> cakes. Match each sentence to its place in the linear program.",
      pairs: [["A tray takes 2 hours and a cake takes 3, and only 40 hours are available", "2x + 3y ≤ 40"], ["At least 5 trays must be made", "x ≥ 5"], ["A tray earns 4 and a cake earns 5, as much as possible", "Maximise 4x + 5y"], ["You cannot bake a negative number of anything", "x ≥ 0 and y ≥ 0"]],
      why: "Resources and requirements become constraints, the thing you want becomes the objective, and the obvious facts (no negative amounts) still have to be written down." },
    { type: "slider", q: "Maximise profit z = 3x + 2y. The shaded plans obey x + y ≤ 8 and x ≤ 5 (best corner (5, 3), z = 21). The limit grows to x + y ≤ 10, with x ≤ 5 unchanged. What is the best profit now?",
      fig: regionFig, min: 15, max: 40, step: 1, ans: 25, tol: 2, unit: "",
      hint: "The best corner moves up to x = 5 and y = 10 − 5. Work out 3 × 5 + 2 × 5.",
      why: "The new corner is (5, 5), giving 15 + 10 = 25. The extra 2 units of the first limit were worth 4 profit, so it is a valuable constraint to relax." },
    { type: "multi", q: "A plan must obey x + y ≤ 6 with x, y ≥ 0. Adding one more constraint to this list, which would leave <b>no</b> feasible plan at all? Select all.",
      o: ["x + y ≥ 8", "x ≥ 7", "y ≥ 2", "x − y ≤ 3", "x + y ≥ 6"], a: [0, 1],
      why: "x + y ≥ 8 and x + y ≤ 6 contradict each other, and x ≥ 7 pushes x past the largest value x + y ≤ 6 allows. y ≥ 2 and x − y ≤ 3 still leave plans such as (1, 3), and x + y ≥ 6 leaves the whole line x + y = 6 feasible." },
    { type: "order", q: "Order the four corners of the feasible region from the <b>lowest</b> to the highest value of z = 2x + 3y.",
      fig: cornerFig, items: ["A", "B", "D", "C"], hint: "Read each corner's x and y off the grid: z = 2x + 3y.",
      why: "A (0, 0) gives 0, B (5, 0) gives 10, D (1, 5) gives 17 and C (4, 4) gives 20. The best corner is C, and checking corners is enough because the best value always sits on one." },
    { type: "pick", q: "One of these four constraints is <b>redundant</b>: deleting it would not change the feasible region at all. Click it.",
      fig: redundantFig, a: "c3", hint: "Look at which lines actually form the edges of the shaded area.",
      why: "x + 2y ≤ 14 lies far outside the shaded area, so the other three constraints already keep every plan inside it (at the corner (1, 5), x + 2y is only 11). Removing x + y ≤ 6, x ≤ 4 or y ≤ 5 would each enlarge the region." },
  ]);
})();

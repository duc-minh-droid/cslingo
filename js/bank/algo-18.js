/* ===== bank-w-algo-1.js ===== */
/* ALGO revision bank, second round of understanding questions, part 1.
   Phase 1 (anatomy, big-O, surfer, PageRank), Dijkstra, A*, routing, linear programming.
   Every number was checked by running the real algorithm in node. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const B = NIC.bank,
    Qf = NIC.qfig;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px">${body}</svg>`;
  const inj = (s, extra) => s.replace("</svg>", extra + "</svg>");
  const codeBox = (lines) =>
    `<div style="font:700 13px var(--mono);background:var(--bg-2);border:2px solid var(--line);border-radius:12px;padding:8px 12px;margin-bottom:8px;white-space:pre;overflow-x:auto">${lines.join("\n")}</div>`;
  const hLab = (nodes, h, dy = 34) =>
    Object.entries(h)
      .map(([k, v]) => tx(nodes[k][0], nodes[k][1] + dy, "h = " + v, { sz: 12, c: "var(--amber-ink)" }))
      .join("");
  const rowRect = (x, y, w, h, pick, inner) =>
    `<g data-pick="${pick}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${inner}</g>`;

  /* =====================================================================
     a1-anatomy
     ===================================================================== */
  const euclid = codeBox(["def gcd(a, b):", "    while b != 0:", "        a, b = b, a % b", "    return a"]);
  const isSortedChips = (() => {
    const items = [
      ["c1", "[1, 2, 3]"],
      ["c2", "[3, 1, 2]"],
      ["c3", "[1, 2, 0]"],
      ["c4", "[ ]"],
      ["c5", "[4]"],
      ["c6", "[2, 1, 0]"],
    ];
    const body = items
      .map(([id, t], i) =>
        rowRect(
          10 + (i % 3) * 160,
          8 + Math.floor(i / 3) * 50,
          148,
          40,
          id,
          tx(84 + (i % 3) * 160, 34 + Math.floor(i / 3) * 50, t, { sz: 15, f: "var(--mono)" }),
        ),
      )
      .join("");
    return codeBox(["def is_sorted(xs):", "    return xs[0] <= xs[1]"]) + svg(490, 112, body);
  })();

  B.add("a1-anatomy", [
    {
      type: "cat",
      q: "A binary search looks for <code>t</code> in a list <code>xs</code>. Sort each statement by the job it does.",
      buckets: ["Precondition", "Loop invariant", "Postcondition"],
      items: [
        ["<code>xs</code> is already sorted", 0],
        ["If <code>t</code> is in the list, it sits between positions <code>lo</code> and <code>hi</code>", 1],
        ["Any index returned holds the value <code>t</code>", 2],
        ["Every item left of <code>lo</code> is smaller than <code>t</code>", 1],
        ["The items can be compared with <code>&lt;</code>", 0],
        ["The answer is −1 only when <code>t</code> is not in the list", 2],
      ],
      why: "A precondition is what the caller must give you. An invariant is true at the top of every pass. A postcondition is what the function promises when it ends.",
    },
    {
      type: "multi",
      q: "Euclid's method for the greatest common divisor is shown. Select every statement that is true.",
      fig: euclid,
      o: [
        "gcd(a, b) is the same before and after each pass",
        "b gets strictly smaller on every pass, so the loop must stop",
        "When the loop ends, <code>a</code> holds the answer",
        "<code>a</code> gets strictly smaller on every pass",
        "It only works if <code>a</code> starts bigger than <code>b</code>",
      ],
      a: [0, 1, 2],
      hint: "Try a = 3, b = 5 by hand. What are a and b after one pass?",
      why: "The invariant (same gcd) plus a shrinking b (a % b is always below b) give a correct, terminating loop. With a = 3, b = 5 the first pass gives a = 5, b = 3, so a grew, and a smaller first number is handled without any special case.",
    },
    {
      type: "bug",
      q: "This should return the position of <code>t</code> in <code>xs</code>, or −1 if it is missing. It says −1 for almost everything. Click the faulty line.",
      code: [
        "def find(xs, t):",
        "    for i in range(len(xs)):",
        "        if xs[i] == t:",
        "            return i",
        "        return -1",
      ],
      a: 4,
      why: "The <code>return -1</code> sits inside the loop, so it runs after the very first item. It belongs after the loop, once every item has been checked.",
    },
    {
      type: "match",
      q: "Every loop must stop. Match each loop to the quantity that shrinks and forces it to stop.",
      pairs: [
        ["<code>while n &gt; 1: n = n // 2</code>", "n itself"],
        ["<code>while lo &lt;= hi:</code> in binary search", "The gap hi − lo"],
        ["<code>for x in xs:</code>", "Items still to visit"],
        ["<code>while x &lt; 100: x += 7</code>", "100 − x, the distance left"],
      ],
      why: "A loop is safe when some whole number that cannot go below a floor shrinks on every pass. Naming it is the termination argument.",
    },
    {
      type: "pick",
      q: "<code>is_sorted</code> is meant to say whether a whole list is in order, but it only looks at the first two items. Click <b>every</b> input where this function gives a wrong result or crashes.",
      fig: isSortedChips,
      a: ["c3", "c4", "c5"],
      why: "[1, 2, 0] is not sorted, yet the first two items are in order, so it says True. [ ] and [4] have no second item, so <code>xs[1]</code> crashes. The other three happen to agree with the right answer, which is why tests like those miss the bug.",
    },
  ]);

  /* =====================================================================
     a1-bigo
     ===================================================================== */
  const bigoBlocks = (() => {
    const blk = (y, h, id, lines) =>
      rowRect(
        8,
        y,
        484,
        h,
        id,
        lines.map((l, i) => tx(24, y + 24 + i * 20, l, { a: "start", sz: 13, f: "var(--mono)" })).join(""),
      );
    return svg(
      500,
      250,
      blk(6, 62, "b1", ["# block 1", "total = sum(xs)    # one pass over xs"]) +
        blk(76, 62, "b2", ["# block 2", "xs.sort()    # sorting costs about n log n"]) +
        blk(146, 100, "b3", ["# block 3", "for a in xs:", "    for b in xs:", "        if a + b == 100: count += 1"]),
    );
  })();

  B.add("a1-bigo", [
    {
      type: "slider",
      q: "A quadratic, O(n²), program takes 3 seconds on 1,000 items. About how many seconds would it need for 10,000 items?",
      min: 0,
      max: 600,
      step: 10,
      ans: 300,
      tol: 60,
      unit: " s",
      hint: "10 times the items means 10 × 10 = 100 times the work.",
      why: "Squaring is what hurts: n grows 10 times, n² grows 100 times, so 3 s becomes about 300 s (five minutes).",
    },
    {
      type: "order",
      q: "Each fragment runs with n = 1,000. Order them from the <b>fewest</b> steps to the most.",
      items: [
        "<code>while n &gt; 1: n = n // 2</code>",
        "<code>for i in range(n): work()</code>",
        "<code>for i in range(n):</code> then <code>for j in range(10): work()</code>",
        "<code>for i in range(n):</code> then <code>for j in range(n): work()</code>",
      ],
      why: "Halving takes about 10 steps (2¹⁰ ≈ 1,000). One loop is 1,000. A loop with a fixed inner 10 is 10,000. Two full loops is 1,000,000.",
    },
    {
      type: "pick",
      q: "This program does all three blocks one after another on a list of a million items. Click the block that sets its big-O.",
      fig: bigoBlocks,
      a: "b3",
      hint: "Add them up as n + n log n + n². Which term wins when n is huge?",
      why: "The total is O(n) + O(n log n) + O(n²), and the n² term towers over the others. Making blocks 1 and 2 faster would barely change the running time.",
    },
    {
      type: "cat",
      q: "A teammate speeds up some code. Does each change move it into a <b>different</b> big-O class?",
      buckets: ["Different class", "Same class"],
      items: [
        ["Replace a nested-loop duplicate check with a <code>set</code> lookup", 0],
        ["Move to a computer that is ten times faster", 1],
        ["Delete a debug <code>print</code> inside the inner loop", 1],
        ["Replace a scan of a sorted list with binary search", 0],
        ["Make the search loop stop as soon as it finds the item", 1],
        ["Sort first, then compare only neighbours instead of every pair", 0],
      ],
      why: "Big-O is about how the work grows with n. Faster hardware, deleting a constant-time line or an early exit (the worst case still scans everything) leave the growth alone. Changing the method itself changes the class.",
    },
    {
      type: "multi",
      q: "Which statements about big-O are true? Select all.",
      o: [
        "O(n) says the time is at most a constant times n once n is big",
        "An O(n²) program always runs exactly n² steps",
        "Two O(n) programs can differ in speed by a factor of 100",
        "Big-O counts the lines of code in a program",
        "Buying a faster computer changes the big-O class",
        "An O(n log n) algorithm is also O(n²)",
      ],
      a: [0, 2, 5],
      why: "Big-O is an upper bound on growth that hides constants, so two O(n) programs may differ a lot and O(n log n) fits under O(n²). It is not an exact count, not about code length, and hardware speed only changes the constant.",
    },
    {
      type: "slider",
      q: "Binary search needs about 10 comparisons to search 1,000 sorted items. About how many for 1,000,000 items?",
      min: 0,
      max: 100,
      step: 1,
      ans: 20,
      tol: 3,
      unit: " comparisons",
      hint: "1,000,000 is 1,000 × 1,000. Each factor of 1,000 adds about 10 halvings.",
      why: "log₂(1,000,000) ≈ 20. A thousand times more data costs only 10 extra comparisons, which is why logarithmic algorithms scale so well.",
    },
  ]);

  /* =====================================================================
     a1-surfer
     ===================================================================== */
  const trailFig = (() => {
    const nodes = { A: [60, 90], B: [170, 30], C: [180, 150], D: [320, 90], E: [430, 90] };
    const edges = [
      ["A", "B"],
      ["A", "C"],
      ["B", "C"],
      ["C", "A"],
      ["C", "D"],
      ["D", "E"],
      ["E", "D"],
    ];
    const g = Qf.graph(nodes, edges, { directed: true, w: 490, h: 180, r: 17 });
    const trail = [
      ["A", "B"],
      ["B", "C"],
      ["C", "D"],
      ["D", "E"],
      ["E", "A"],
      ["A", "C"],
      ["C", "A"],
      ["A", "E"],
    ];
    const chips = trail
      .map(([a, b], i) =>
        rowRect(
          6 + (i % 4) * 121,
          6 + Math.floor(i / 4) * 46,
          112,
          38,
          "s" + (i + 1),
          tx(62 + (i % 4) * 121, 31 + Math.floor(i / 4) * 46, `${i + 1}:  ${a} → ${b}`, { sz: 14 }),
        ),
      )
      .join("");
    return (
      g +
      `<div class="faint" style="margin:4px 0;font-weight:800">The surfer's eight moves, in order</div>` +
      svg(490, 98, chips)
    );
  })();

  const hubFig = (() => {
    const nodes = { H: [220, 140], A: [370, 140], D: [370, 45], E: [470, 45], B: [70, 55], C: [70, 225] };
    const edges = [
      ["A", "H"],
      ["B", "H"],
      ["C", "H"],
      ["H", "A"],
      ["D", "A"],
      ["E", "D"],
    ];
    return Qf.graph(nodes, edges, { pick: "nodes", directed: true, w: 520, h: 270, r: 19 });
  })();

  const visitsFig = (() => {
    const bars = [
      ["P", 0],
      ["Q", 0],
      ["R", 5030],
      ["S", 4970],
    ];
    let s = "";
    bars.forEach(([k, v], i) => {
      const x = 40 + i * 115,
        hgt = Math.round((v / 5030) * 110);
      s +=
        `<rect x="${x}" y="${140 - hgt}" width="70" height="${Math.max(hgt, 2)}" rx="8" fill="${v ? "var(--blue)" : "var(--line-2)"}"/>` +
        tx(x + 35, 160, "page " + k, { sz: 13 }) +
        tx(x + 35, 132 - hgt, v.toLocaleString("en-GB"), { sz: 13 });
    });
    return (
      svg(500, 172, s) +
      `<div class="faint" style="margin-top:4px;font-weight:800">Visits to each page in 10,000 steps</div>`
    );
  })();

  B.add("a1-surfer", [
    {
      type: "pick",
      q: "A surfer's walk is below. A <b>click</b> only follows an arrow from the page the surfer is on. Click <b>every</b> move that cannot have been a link click, so it must have been a teleport.",
      fig: trailFig,
      a: ["s5", "s8"],
      why: "E has only one link, to D, so E → A has to be a teleport. A links to B and C only, so A → E is a teleport too. All other moves follow an arrow.",
    },
    {
      type: "pick",
      q: "Two runs of the same web: one with the surfer teleporting 5% of the time, one with 50%. Click <b>every</b> page whose rank goes <b>down</b> when the teleporting becomes more frequent.",
      fig: hubFig,
      a: ["H", "A"],
      hint: "More teleporting spreads rank evenly. Who has the most to lose?",
      why: "Teleporting hands every page an equal share, so rank drains from the pages that were hoarding it. H and A (which pass rank round between them) fall from about 0.48 each to about 0.31, while B, C, D and E all rise.",
    },
    {
      type: "match",
      q: "Match each moment in the surfer story to the maths that describes it.",
      pairs: [
        ["Clicks one of the page's links at random", "A column of the link matrix: equal shares to each link"],
        ["Gets bored and jumps to any page", "The teleport term, (1 − d) ÷ n for every page"],
        ["Circles inside a closed group of pages for ever", "A rank sink, which teleporting fixes"],
        ["Share of all visits to a page, over a long walk", "That page's PageRank"],
      ],
      why: "The surfer is the picture and the matrix is the calculation: clicks make H, boredom makes the teleport term, and long-run visit shares are the PageRank.",
    },
    {
      type: "multi",
      q: "Which statements about the random surfer are true? Select all.",
      o: [
        "Where the surfer goes next depends only on the page they are on now",
        "A page with more incoming links always outranks one with fewer",
        "Teleporting lets the surfer escape a closed loop of pages",
        "The surfer remembers visited pages and avoids them",
        "Over a long walk, each page's share of visits settles down",
      ],
      a: [0, 2, 4],
      why: "The surfer is memoryless: only the current page matters. Teleporting is the escape route from loops. Visit shares settle to the PageRank. Who links to you matters as well as how many, and the surfer never avoids old pages.",
    },
    {
      type: "mcq",
      q: "A simulation of 10,000 steps produced these counts, with exactly 0 visits to P and Q. Which explanation fits best?",
      fig: visitsFig,
      o: [
        "R and S link only to each other and the surfer never teleported",
        "P and Q have a PageRank of 0.01, which rounds to zero visits",
        "P and Q are dangling pages that soaked up all the early visits",
        "Teleporting was on, but P and Q have too few incoming links",
      ],
      a: 0,
      hint: "If P had rank 0.01, about how many visits would 10,000 steps give it?",
      why: "A rank of 0.01 would give about 100 visits, and with teleporting every page gets some. An exact zero means the surfer was trapped in R and S. A dangling page would have collected visits, not none.",
    },
    {
      type: "bug",
      q: "A surfer simulation should follow a link with probability <code>d</code> (say 0.85) and teleport otherwise. It teleports almost every time. Click the faulty line.",
      code: [
        "def step(page, links, pages, d):",
        "    if random() > d:",
        "        return choice(links[page])",
        "    return choice(pages)",
      ],
      a: 1,
      why: "<code>random()</code> is below <code>d</code> with probability d, so the test should be <code>&lt; d</code>. With <code>&gt;</code> the surfer clicks a link only 15% of the time.",
    },
  ]);

  /* =====================================================================
     a1-pagerank
     ===================================================================== */
  const oneStepFig = Qf.graph(
    { A: [70, 70], B: [250, 70], C: [250, 200], D: [70, 200] },
    [
      ["A", "B"],
      ["A", "C"],
      ["A", "D"],
      ["B", "C"],
      ["C", "A"],
      ["C", "D"],
      ["D", "C"],
    ],
    { pick: "nodes", directed: true, w: 330, h: 270, r: 20 },
  );

  const qualityFig = (() => {
    const nodes = {
      s1: [40, 30],
      s2: [40, 75],
      s3: [40, 120],
      s4: [40, 165],
      s5: [40, 210],
      W: [180, 120],
      Q: [310, 120],
      t1: [250, 235],
      t2: [420, 235],
      P: [420, 160],
    };
    const edges = [
      ["s1", "W"],
      ["s2", "W"],
      ["s3", "W"],
      ["s4", "W"],
      ["s5", "W"],
      ["W", "Q"],
      ["Q", "s1"],
      ["t1", "P"],
      ["t2", "P"],
      ["P", "t1"],
    ];
    return Qf.graph(nodes, edges, { directed: true, w: 480, h: 265, r: 15 });
  })();
  Object.assign(partScope, { hLab, inj, oneStepFig, qualityFig, rowRect, svg, tx });
})();

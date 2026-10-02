/* ALGO revision bank, visual and varied questions, part 1. Phase 1 (anatomy, big-O, PageRank), Dijkstra, A*, routing, linear programming.
   Every figure carries the data the question needs. Numbers were checked by running the real algorithms. */
(function () {
  const B = NIC.bank, Qf = NIC.qfig;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body, pick) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px${pick ? "" : ";display:block"}">${body}</svg>`;
  const codeBox = (lines) => `<div style="font:700 13px var(--mono);background:var(--bg-2);border:2px solid var(--line);border-radius:12px;padding:8px 12px;margin-bottom:8px;white-space:pre;overflow-x:auto">${lines.join("\n")}</div>`;
  const dashed = "stroke-dasharray:5 4";

  /* grid of cells for A* pictures. cells: {"x,y": {fill, stroke, t, t2, pick}} */
  const grid = (W, H, cs, o = {}) => {
    let s = "";
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = x + "," + y, c = (o.cells && o.cells[k]) || {}, wall = o.walls && o.walls.has(k);
      const fill = wall ? "var(--text-dim)" : c.fill || "var(--panel)";
      let g = `<rect x="${x * cs + 1}" y="${y * cs + 1}" width="${cs - 2}" height="${cs - 2}" rx="${cs > 30 ? 7 : 3}" fill="${fill}" stroke="${wall ? "var(--text-dim)" : c.stroke || "var(--line)"}" stroke-width="${c.sw || 2}"/>`;
      if (c.t) g += tx(x * cs + cs / 2, y * cs + cs / 2 + (c.t2 ? -2 : 5), c.t, { sz: c.sz || 14, c: c.c });
      if (c.t2) g += tx(x * cs + cs / 2, y * cs + cs / 2 + 14, c.t2, { sz: 11, w: 800, c: "var(--text-dim)" });
      s += c.pick ? `<g data-pick="${c.pick}">${g}</g>` : g;
    }
    return s;
  };
  const wallSet = (list) => new Set(list.map(([x, y]) => x + "," + y));

  /* tiny A* used only to draw the wall-pocket picture, so the expanded cells are the real ones */
  function astar(W, H, walls, S, G, h0) {
    const key = (x, y) => x + "," + y, g = { [key(...S)]: 0 }, open = new Set([key(...S)]), closed = [];
    const hf = (x, y) => (h0 ? 0 : Math.abs(x - G[0]) + Math.abs(y - G[1]));
    while (open.size) {
      let best = null, bf = 1e9, bh = 1e9;
      for (const k of open) { const [x, y] = k.split(",").map(Number), f = g[k] + hf(x, y), h = hf(x, y); if (f < bf || (f === bf && h < bh)) { bf = f; bh = h; best = k; } }
      open.delete(best); closed.push(best);
      const [x, y] = best.split(",").map(Number);
      if (x === G[0] && y === G[1]) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || walls.has(k)) continue;
        if (g[k] === undefined || g[best] + 1 < g[k]) { g[k] = g[best] + 1; open.add(k); }
      }
    }
    return closed;
  }

  /* =====================================================================
     Phase 1: algorithm anatomy
     ===================================================================== */
  const traceRows = [["1", "9", "9", "9"], ["2", "2", "9", "9"], ["3", "7", "7", "9"], ["4", "1", "7", "9"]];
  const traceFig = () => {
    const cx = [56, 150, 280, 420];
    let s = ["i", "xs[i]", "best after the step", "biggest of xs[0..i]"].map((h, k) => tx(cx[k], 18, h, { sz: 12, c: "var(--text-dim)" })).join("");
    traceRows.forEach((r, k) => {
      const y = 30 + k * 38;
      s += `<g data-pick="r${k + 1}"><rect x="8" y="${y}" width="484" height="32" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${r.map((v, j) => tx(cx[j], y + 21, v, { sz: 15, f: "var(--mono)" })).join("")}</g>`;
    });
    return codeBox(["best = xs[0]", "for i in range(1, len(xs)):", "    if xs[i] > xs[i - 1]:", "        best = xs[i]"]) +
      `<div class="faint" style="margin:0 0 6px;font-weight:800">Trace on xs = [4, 9, 2, 7, 1] (xs[0] = 4, so best starts at 4)</div>` + svg(500, 190, s, true);
  };

  B.add("a1-anatomy", [
    { type: "bug", q: "This binary search sometimes never finishes. Click the line that stops the search range from shrinking.",
      code: ["def find(xs, t):", "    lo, hi = 0, len(xs) - 1", "    while lo <= hi:", "        mid = (lo + hi) // 2", "        if xs[mid] == t:", "            return mid", "        elif xs[mid] < t:", "            lo = mid", "        else:", "            hi = mid - 1", "    return -1"], a: 7,
      why: "Termination needs something that strictly shrinks every round. With <code>lo = mid</code>, on xs = [1, 3] and t = 3 we get lo = 0, hi = 1, mid = 0 forever. Since xs[mid] is already ruled out, the line must be <code>lo = mid + 1</code>." },
    { type: "cat", q: "Assume <code>n</code> is any integer, positive, zero or negative. Which loops are guaranteed to stop?",
      buckets: ["Always stops", "Can run forever"],
      items: [["<code>while n &gt; 0: n = n - 2</code>", 0], ["<code>while n != 0: n = n - 2</code>", 1], ["<code>while n &gt; 1: n = n // 2</code>", 0], ["<code>while n != 1: n = n // 2</code>", 1],
        ["<code>while i &lt; len(xs): total += xs[i]</code> (i never changes)", 1], ["<code>for x in xs: total += x</code>", 0]],
      why: "A loop stops when some quantity must run out. <code>n &gt; 0</code> fails once n drops to 0 or below, whatever the start. But <code>n != 0</code> is skipped over by odd n (5, 3, 1, −1 …) and <code>n != 1</code> never fires for n = 0 (0 // 2 is 0) or negative n. A forgotten <code>i += 1</code> means nothing ever changes. A <code>for</code> over a list has a built-in bound." },
    { type: "pick", q: "The invariant is: <b>best = the biggest of the items checked so far</b>. Click the first row of this trace where the invariant stops being true.",
      fig: traceFig(), a: "r3",
      hint: "In each row, compare the \"best after the step\" column with the biggest of xs[0..i].",
      why: "In row 3 the loop compares 7 with the <i>previous item</i> (2) instead of with <code>best</code>. 7 &gt; 2, so best drops from 9 to 7 while the biggest item so far is still 9. The comparison must be <code>xs[i] &gt; best</code>." },
    { type: "match", q: "Match each loop to the promise (invariant) that makes it correct.",
      pairs: [["<code>total = 0</code>, then <code>total += x</code> for each x", "total = the sum of the items handled so far"],
        ["<code>count += 1</code> only when <code>x % 2 == 0</code>", "count = how many even items have been handled so far"],
        ["Binary search with <code>lo</code> and <code>hi</code>", "if the target is present, it lies between lo and hi"],
        ["<code>best = x</code> whenever <code>x &gt; best</code>", "best = the largest item handled so far"]],
      why: "An invariant describes the state in terms of the progress made, and it must be true before the first round, kept true by every round, and strong enough to give the answer at the end." },
    { type: "multi", q: "<code>second_largest(xs)</code> should return the second biggest value in a list. Select every input that probes an edge case the specification has to settle.",
      o: ["<code>[5, 1, 3]</code>", "<code>[]</code>", "<code>[4]</code>", "<code>[7, 7, 7]</code>", "<code>[9, 9, 2]</code>", "<code>[2, 9, 6, 1]</code>"], a: [1, 2, 3, 4],
      why: "An empty list and a one-item list have no second item at all. In <code>[7, 7, 7]</code> and <code>[9, 9, 2]</code> a tie forces a decision: is the second largest 9 or 2? The spec must say. <code>[5, 1, 3]</code> and <code>[2, 9, 6, 1]</code> are ordinary inputs." },
  ]);

  /* =====================================================================
     Phase 1: big-O
     ===================================================================== */
  const curvesFig = () => {
    const w = 520, h = 250, X = (n) => 46 + n * (456 / 40), Y = (v) => h - 36 - v * (190 / 40);
    const path = (f, from, to) => { let d = "", started = false; for (let n = from; n <= to + 1e-9; n += 0.1) { const v = f(n); if (v > 40) { d += `L${X(n).toFixed(1)} ${Y(40).toFixed(1)}`; break; } d += `${started ? "L" : "M"}${X(n).toFixed(1)} ${Y(v).toFixed(1)}`; started = true; } return d; };
    const endOf = (f, from) => { for (let n = from; n <= 40; n += 0.05) if (f(n) >= 40) return [n, 40]; return [40, f(40)]; };
    const defs = [["P", (n) => n * n, "var(--amber)", 0], ["Q", (n) => n * Math.log2(n), "var(--violet)", 1], ["R", (n) => n, "var(--blue)", 0], ["S", (n) => Math.log2(n), "var(--teal)", 1]];
    let s = "";
    for (let v = 0; v <= 40; v += 10) s += `<line x1="46" y1="${Y(v)}" x2="502" y2="${Y(v)}" stroke="var(--line)"/>${tx(38, Y(v) + 4, v, { a: "end", sz: 11, c: "var(--text-dim)" })}`;
    for (let n = 0; n <= 40; n += 10) s += tx(X(n), h - 18, n, { sz: 11, c: "var(--text-dim)" });
    s += tx(274, h - 2, "input size n", { sz: 12, c: "var(--text-dim)" }) + tx(6, 8, "steps", { sz: 12, c: "var(--text-dim)", a: "start" });
    defs.forEach(([id, f, col, from]) => {
      const [ex, ey] = endOf(f, from || 1), px = X(ex), py = Y(ey);
      s += `<g data-pick="${id}"><path d="${path(f, from || 1, 40)}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"/><path d="${path(f, from || 1, 40)}" fill="none" stroke="transparent" stroke-width="18"/><circle cx="${Math.min(px, 494)}" cy="${py + (id === "S" ? -14 : 0)}" r="11" fill="var(--panel)" stroke="${col}" stroke-width="3"/>${tx(Math.min(px, 494), py + (id === "S" ? -9 : 5), id, { sz: 12, c: col })}</g>`;
    });
    return svg(w, h, s, true);
  };
  const crossFig = () => {
    const w = 520, h = 260, X = (n) => 50 + n * 4.5, Y = (v) => h - 44 - v * (190 / 6000);
    let s = "";
    for (let v = 0; v <= 6000; v += 2000) s += `<line x1="50" y1="${Y(v)}" x2="500" y2="${Y(v)}" stroke="var(--line)"/>${tx(42, Y(v) + 4, v.toLocaleString("en-GB"), { a: "end", sz: 11, c: "var(--text-dim)" })}`;
    let dB = "", dA = "";
    for (let n = 0; n <= 100; n += 1) { const a = 50 * n; dA += `${n ? "L" : "M"}${X(n)} ${Y(a)}`; }
    for (let n = 0; n <= 77; n += 1) dB += `${n ? "L" : "M"}${X(n)} ${Y(n * n)}`;
    s += `<path d="${dA}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linecap="round"/><path d="${dB}" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linecap="round"/>`;
    s += tx(470, Y(5000) - 10, "A: 50n", { c: "var(--blue-ink)", sz: 14 }) + tx(X(75) - 36, Y(5800) + 2, "B: n²", { c: "var(--amber-ink)", sz: 14 });
    [20, 40, 60, 80].forEach((n) => { s += `<g data-pick="${n}"><line x1="${X(n)}" y1="${Y(0)}" x2="${X(n)}" y2="${Y(6000)}" stroke="var(--line-2)" stroke-width="2" style="${dashed}"/><rect x="${X(n) - 28}" y="${h - 34}" width="56" height="26" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(X(n), h - 16, "n = " + n, { sz: 12 })}</g>`; });
    return svg(w, h, s, true);
  };

  B.add("a1-bigo", [
    { type: "match", q: "A student timed three programs at n = 1,000, 2,000 and 4,000 (each doubling). Match each set of timings to its growth.",
      pairs: [["10 ms, 20 ms, 40 ms", "O(n)"], ["10 ms, 40 ms, 160 ms", "O(n²)"], ["10 ms, 11 ms, 12 ms", "O(log n)"], ["10 ms, 22 ms, 48 ms", "O(n log n)"]],
      why: "Look at what doubling n does. Twice the time: linear. Four times: quadratic. Only a little extra each time: logarithmic. Slightly more than double: n log n (the extra log n factor adds a little each doubling)." },
    { type: "pick", q: "Program A takes 50n steps and program B takes n² steps. A is the clever, linear one. Click the <b>first</b> marked input size where A is really faster than B.",
      fig: crossFig(), a: "60", hint: "A beats B when 50n &lt; n². Divide both sides by n.",
      why: "50n &lt; n² as soon as n &gt; 50, so the curves cross at n = 50. At n = 40 B is still cheaper (1,600 against 2,000). At n = 60 A wins (3,000 against 3,600). Big-O only promises that the slower-growing one wins <i>eventually</i>; the constant decides where." },
    { type: "bug", q: "This should find a duplicate in O(n) time, but it is secretly O(n²). Click the line with the hidden cost.",
      code: ["def has_duplicate(xs):", "    seen = []", "    for x in xs:", "        if x in seen:", "            return True", "        seen.append(x)", "    return False"], a: 3,
      why: "<code>x in seen</code> on a list scans the list item by item, so the loop does 0 + 1 + 2 + … comparisons. Make <code>seen</code> a set (<code>seen = set()</code>, <code>seen.add(x)</code>) and the membership test is O(1) on average." },
    { type: "cat", q: "A Python list <code>xs</code> holds a million items. Which operations take the same time however long the list is?",
      buckets: ["Same cost at any length", "Slows down as the list grows"],
      items: [["<code>xs[500000]</code>", 0], ["<code>xs.append(7)</code>", 0], ["<code>len(xs)</code>", 0], ["<code>7 in xs</code>", 1], ["<code>xs.insert(0, 7)</code>", 1], ["<code>sum(xs)</code>", 1]],
      why: "Indexing, appending to the end and reading the length don't look at the other items. Searching with <code>in</code> and <code>sum</code> touch every item, and <code>insert(0, …)</code> has to shuffle every existing item along one place." },
    { type: "pick", q: "These curves show steps against input size n. Click the one where doubling n only adds a fixed number of steps.",
      fig: curvesFig(), a: "S", hint: "Look for the curve that flattens out: it barely rises as n keeps growing.",
      why: "S is logarithmic: log₂(2n) = log₂ n + 1, so each doubling costs one more step. R (linear) doubles when n doubles, Q (n log n) a little more than doubles, and P (quadratic) quadruples." },
    { type: "mcq", q: "Here n could be a billion. How does the running time grow with n?",
      fig: codeBox(["for i in range(n):", "    for j in range(1000):", "        work()"]), o: ["O(n)", "O(n²)", "O(1000²)", "O(n log n)"], a: 0,
      why: "The inner loop always runs exactly 1,000 times, however big n is, so the total is 1,000 × n. Constant factors vanish in Big-O: it's linear. (The nested shape only becomes quadratic when the inner bound itself depends on n.)" },
  ]);

  /* =====================================================================
     Phase 1: the random surfer
     ===================================================================== */
  const dArrow = { directed: true };
  const surfFig1 = Qf.graph({ p: [50, 50], q: [50, 130], r: [50, 210], U: [200, 130], s: [350, 225], H: [350, 130], T: [480, 130] },
    [["p", "U"], ["q", "U"], ["r", "U"], ["U", "H"], ["s", "H"], ["H", "T"], ["T", "H"]], { pick: "nodes", w: 530, h: 260, ...dArrow });
  const trapFig = Qf.graph({ S: [50, 130], T: [190, 50], W: [190, 210], U: [340, 50], V: [470, 130] },
    [["S", "T"], ["S", "W"], ["W", "T"], ["T", "U"], ["U", "V"], ["V", "U"]], { pick: "nodes", w: 520, h: 260, ...dArrow });
  const tokenFig = (() => {
    const N = { A: [90, 70], B: [90, 210], C: [330, 210], D: [330, 70] }, tok = { A: 20, B: 20, C: 40, D: 20 };
    let f = Qf.graph(N, [["A", "B"], ["A", "C"], ["B", "C"], ["C", "D"], ["D", "A"], ["D", "B"]], { w: 430, h: 280, ...dArrow });
    const lab = Object.entries(N).map(([k, [x, y]]) => { const ly = y > 150 ? y + 26 : y - 48; return `<g><rect x="${x - 34}" y="${ly}" width="68" height="22" rx="8" fill="var(--amber-dim)" stroke="var(--amber)" stroke-width="2"/>${tx(x, ly + 15, tok[k] + " tokens", { sz: 11, c: "var(--amber-ink)" })}</g>`; }).join("");
    return f.replace("</svg>", lab + "</svg>");
  })();

  B.add("a1-surfer", [
    { type: "pick", q: "Every page starts equal and the usual damped PageRank is run to convergence. Click the page with the <b>highest</b> PageRank. (Arrows show who links to whom.)",
      fig: surfFig1, a: "H", hint: "Which page gets rank from a page that itself receives rank from lots of places?",
      why: "H wins. It has no more links in than U does, yet it is fed by U <i>and</i> s, and passes everything it has to T, which sends it straight back. U has the most incoming links (three), but they come from pages nobody links to, so they carry almost no rank. A link is worth what its source is worth." },
    { type: "pick", q: "This web is run with <b>no teleporting</b> (d = 1), forever. A double arrow means each page links to the other. Click every page whose rank ends up at zero.",
      fig: trapFig, a: ["S", "T", "W"],
      why: "U and V only link to each other, so rank that reaches them never comes back out. S has no incoming links at all, so it gets nothing, W only gets from S, and T's rank drains into the U–V trap. In the long run all of it sits in U and V. Teleporting is what stops this." },
    { type: "mcq", q: "Each page pours all its tokens into its outgoing links, split equally. The tokens now are shown. After <b>one</b> step, how many tokens will C hold?",
      fig: tokenFig, o: ["10", "20", "30", "60"], a: 2, hint: "C hears from A and from B. A has two links, so only half of its 20 reaches C. B has one link.",
      why: "From A: 20 ÷ 2 = 10. From B (a single link): all 20. C holds 10 + 20 = <b>30</b>. (D passes on nothing to C: it links to A and B.) A page with fewer links gives each target a bigger share." },
    { type: "slider", q: "A surfer follows a random link with probability d = 0.5 and teleports otherwise. What percentage of surfers are <b>still</b> clicking links, with no teleport yet, after 3 clicks in a row?",
      min: 0, max: 100, step: 0.5, ans: 12.5, tol: 5, unit: "%", hint: "Each click survives with probability ½. So ½ × ½ × ½.",
      why: "The chance of avoiding the teleport three times running is d³ = 0.5 × 0.5 × 0.5 = 0.125, so about 12.5%. With d = 0.85 it would be about 61%: a high d keeps surfers on the links, a low d scatters them." },
    { type: "cat", q: "Run PageRank with <b>no teleporting and no dangling-page repair</b>. What happens to the rank in each situation?",
      buckets: ["Rank leaks away", "Rank gets trapped", "Flows normally"],
      items: [["A page with no outgoing links", 0], ["A page whose only link points to a page with no links", 0], ["Two pages that only link to each other, with other pages linking in", 1], ["A page that links only to itself", 1], ["A page with 200 outgoing links among a well-connected web", 2], ["Every page has a link, and any page can be reached from any other", 2]],
      why: "A page with no links out simply loses the rank it receives (the total shrinks). A cycle that nothing leaves keeps the rank forever and starves the pages that feed it. A long link list only dilutes each share; and a strongly connected web with no dead ends keeps all its rank moving." },
    { type: "bug", q: "One damped PageRank step. The rank is not being shared out correctly. Click the faulty line.",
      code: ["def step(rank, links, d):", "    n = len(rank)", "    new = {p: (1 - d) / n for p in rank}", "    for p in rank:", "        share = rank[p] / len(links)", "        for q in links[p]:", "            new[q] += d * share", "    return new"], a: 4,
      why: "A page splits its rank over <i>its own</i> outgoing links: <code>len(links[p])</code>. Dividing by <code>len(links)</code> (the number of pages in the web) gives every link the same tiny share, whether the page links to two pages or two hundred." },
  ]);

  /* =====================================================================
     Phase 1: PageRank as a matrix
     ===================================================================== */
  const hFig = (() => {
    const g = Qf.graph({ A: [60, 50], B: [190, 50], D: [60, 180], C: [190, 180] },
      [["A", "B"], ["A", "C"], ["B", "C"], ["C", "D"], ["D", "A"], ["D", "B"]], { directed: true, w: 260, h: 240 });
    const cols = { A: ["0", "½", "½", "0"], B: ["0", "0", "1", "0"], C: ["0", "0", "0", "1"], D: ["1", "1", "0", "0"] }, names = ["A", "B", "C", "D"];
    let s = "";
    names.forEach((n, i) => { s += tx(40, 66 + i * 34, "to " + n, { sz: 12, c: "var(--text-dim)", a: "end" }); });
    names.forEach((n, j) => {
      const x = 60 + j * 66;
      s += `<g data-pick="${n}"><rect x="${x}" y="8" width="58" height="176" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(x + 29, 30, "from " + n, { sz: 12, c: "var(--text-dim)" })}${cols[n].map((v, i) => tx(x + 29, 66 + i * 34, v, { sz: 17, f: "var(--mono)" })).join("")}</g>`;
    });
    return `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center"><div style="flex:1 1 200px;min-width:200px">${g}</div><div style="flex:1 1 280px;min-width:280px">${svg(330, 190, s, true)}</div></div>`;
  })();

  const convFig = (() => {
    const e5 = [0.07692, 0.03077, 0.01058, 0.00288, 0.0012, 0.00048, 0.00017, 0.00005, 0.00002, 0.00001, 0, 0];
    const e95 = [0.22175, 0.17496, 0.11618, 0.06284, 0.04515, 0.03563, 0.02366, 0.0128, 0.00919, 0.00725, 0.00482, 0.00261];
    const w = 520, h = 250, X = (i) => 56 + (i - 1) * 40, Y = (v) => h - 40 - v * (180 / 0.25);
    let s = "";
    [0, 0.05, 0.1, 0.15, 0.2, 0.25].forEach((v) => (s += `<line x1="50" y1="${Y(v)}" x2="500" y2="${Y(v)}" stroke="var(--line)"/>${tx(44, Y(v) + 4, v.toFixed(2), { a: "end", sz: 11, c: "var(--text-dim)" })}`));
    for (let i = 1; i <= 12; i++) s += tx(X(i), h - 22, i, { sz: 11, c: "var(--text-dim)" });
    s += tx(280, h - 4, "iteration", { sz: 12, c: "var(--text-dim)" });
    s += `<line x1="50" y1="${Y(0.01)}" x2="500" y2="${Y(0.01)}" stroke="var(--rose)" stroke-width="2" style="${dashed}"/>` + tx(498, Y(0.01) - 6, "stop when below 0.01", { a: "end", sz: 11, c: "var(--rose-ink)" });
    const line = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${X(i + 1)} ${Y(v)}`).join("");
    s += `<g data-pick="low"><path d="${line(e5)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linecap="round"/><path d="${line(e5)}" fill="none" stroke="transparent" stroke-width="18"/>${tx(X(2) + 34, Y(e5[1]) - 16, "blue run", { c: "var(--blue-ink)", sz: 12 })}</g>`;
    s += `<g data-pick="high"><path d="${line(e95)}" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linecap="round"/><path d="${line(e95)}" fill="none" stroke="transparent" stroke-width="18"/>${tx(X(5), Y(e95[4]) - 12, "orange run", { c: "var(--amber-ink)", sz: 12 })}</g>`;
    return svg(w, h, s, true);
  })();

  const sumFig = `<table class="t" style="max-width:380px"><thead><tr><th>Iteration</th><th class="num">Sum of all ranks</th></tr></thead><tbody>${[["0 (start)", "1.000"], ["1", "0.787"], ["2", "0.697"], ["3", "0.582"], ["4", "0.533"], ["5", "0.498"], ["6", "0.472"]].map(([a, b]) => `<tr><td>${a}</td><td class="num">${b}</td></tr>`).join("")}</tbody></table>`;
  const fixFig = Qf.graph({ A: [60, 125], B: [230, 45], C: [230, 205], D: [400, 125] }, [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["D", "A"]], { directed: true, w: 460, h: 250 });

  B.add("a1-pagerank", [
    { type: "pick", q: "The link matrix <b>H</b> was built for the web on the left (column = the page that is linking). One column breaks the rule for H. Click it.",
      fig: hFig, a: "D", hint: "Each column should add up to 1: a page shares out exactly its whole rank.",
      why: "D links to A and B, so it should pass ½ to each: column D is (½, ½, 0, 0). As drawn it adds up to 2, so the matrix would create rank from nothing. Every column of H (and of G) must sum to 1." },
    { type: "pick", q: "Two PageRank runs on the same web use d = 0.5 and d = 0.95. The graph shows how far the rank vector moved each iteration. Click the run that used d = 0.95.",
      fig: convFig, a: "high",
      why: "A high d means a surfer teleports rarely, so rank takes many more rounds to spread out and settle. The orange run falls by only about a quarter each iteration and needs 9 iterations to get below 0.01; the blue run (d = 0.5) is there in 4." },
    { type: "mcq", q: "With no damping, the PageRank vector p must satisfy <b>p = G p</b>: one more step changes nothing. Which vector does that for this web?",
      fig: fixFig, o: ["A 1/3 · B 1/6 · C 1/6 · D 1/3", "A 1/4 · B 1/4 · C 1/4 · D 1/4", "A 1/6 · B 1/3 · C 1/3 · D 1/6", "A 1/3 · B 1/3 · C 1/6 · D 1/6"], a: 0,
      hint: "A gets rank only from D. B and C each get half of A's rank. D gets all of B's and C's.",
      why: "Check the rules: A = D, B = A/2, C = A/2, D = B + C. With A = D = 1/3 and B = C = 1/6 all four hold, and they add to 1. The uniform vector fails: B would receive only half of A's 1/4, which is 1/8, not 1/4." },
    { type: "order", q: "Put one damped PageRank iteration in order.",
      items: ["Split each page's rank equally across its outgoing links (a page with none shares with everyone)", "Multiply every share by the damping factor d", "Add the teleport share (1 − d)/N to every page", "Measure how far the vector moved, and stop if it is below the tolerance"],
      why: "Move the rank along the links first, damp it, then top every page up with its teleport floor so the total returns to 1. Only the finished new vector is compared with the old one to decide whether to stop." },
    { type: "bug", q: "This power iteration for PageRank always returns a vector of zeros. Click the faulty line.",
      code: ["def pagerank(G, tol=1e-8):", "    n = len(G)", "    p = np.zeros(n)", "    while True:", "        new = G @ p", "        if abs(new - p).sum() < tol:", "            return new", "        p = new"], a: 2,
      why: "A matrix times a zero vector is a zero vector, so the loop 'converges' straight away on the wrong answer. The start must be a probability distribution that sums to 1, usually <code>np.full(n, 1 / n)</code>." },
    { type: "mcq", q: "A team's PageRank code adds the damping and the teleport step correctly, but the total rank behaves like this on a web where one page has no outgoing links. What is most likely missing?",
      fig: sumFig, o: ["Rank held by pages with no links out is never redistributed", "The teleport share (1 − d)/N is being added to every page twice over", "The starting vector was not normalised, so it adds up to more than 1", "The loop keeps running for more iterations than the tolerance needs"], a: 0,
      why: "The total starts at exactly 1 and then falls every round, so something is removing rank. A page with no links pours its rank nowhere unless its column is repaired (replaced by 1/N each). Adding teleport twice would make the total rise, not fall." },
  ]);

  /* =====================================================================
     Lecture 2: Dijkstra
     ===================================================================== */
  const dG1 = { S: [50, 130], A: [170, 50], B: [170, 210], C: [320, 50], D: [320, 210], T: [450, 130] };
  const dE1 = [["S", "A", 2], ["S", "B", 5], ["A", "B", 2], ["A", "C", 4], ["B", "D", 3], ["C", "T", 3], ["D", "T", 1], ["C", "D", 6]];
  const dG2 = { S: [50, 130], B: [150, 55], A: [150, 210], D: [290, 55], C: [290, 210], E: [440, 130] };
  const dE2 = [["S", "B", 1], ["S", "A", 3], ["B", "A", 1], ["A", "C", 4], ["B", "D", 6], ["C", "E", 2], ["D", "E", 3]];
  const claimed = { S: 0, B: 1, A: 3, C: 6, D: 7, E: 8 };
  const wrongFig = Qf.graph(dG2, dE2, { pick: "nodes", w: 500, h: 270 }).replace("</svg>", Object.entries(dG2).map(([k, [x, y]]) => tx(x, y + (y > 150 ? 40 : -28), "dist " + claimed[k], { sz: 12, c: "var(--amber-ink)" })).join("") + "</svg>");
  const hopFig = Qf.graph({ S: [50, 130], A: [170, 50], B: [310, 50], C: [240, 215], T: [450, 130] }, [["S", "T", 9], ["S", "A", 2], ["A", "B", 3], ["B", "T", 1], ["S", "C", 5], ["C", "T", 5]], { w: 500, h: 260 });

  B.add("a2-dijkstra", [
    { type: "pick", q: "Dijkstra runs from S on this map. The final <b>shortest-path tree</b> is the set of roads actually used to reach each node. Click every road in it.",
      fig: Qf.graph(dG1, dE1, { pick: "edges", w: 500, h: 260 }), a: ["S-A", "A-B", "A-C", "B-D", "D-T"], hint: "Find each node's final distance, then ask which road delivered it.",
      why: "Distances: A 2, B 4 (via A, beating the direct road of 5), C 6, D 7, T 8 (via D: 7 + 1, beating C: 6 + 3 = 9). The roads S–B, C–T and C–D are never the best way into a node, so they stay out of the tree." },
    { type: "pick", q: "A student claims these are the shortest distances from S. Exactly one label is wrong. Click that node.",
      fig: wrongFig, a: "A", hint: "Look for a cheaper way into each node than the direct road.",
      why: "S → B → A costs 1 + 1 = 2, cheaper than the direct road S–A (3). The rest check out: C = 2 + 4 = 6, D = 1 + 6 = 7, E = 6 + 2 = 8. The slip is typical of grabbing the first road you see rather than relaxing through every settled node." },
    { type: "bug", q: "This heap-based Dijkstra is meant to always take the closest unsettled node next, but it doesn't. Click the line that breaks that.",
      code: ["def dijkstra(graph, s):", "    dist = {v: float(\"inf\") for v in graph}", "    dist[s] = 0", "    heap = [(0, s)]", "    while heap:", "        d, u = heapq.heappop(heap)", "        for v, w in graph[u]:", "            if d + w < dist[v]:", "                dist[v] = d + w", "                heapq.heappush(heap, (w, v))", "    return dist"], a: 9,
      why: "The heap must be ordered by distance from the source, <code>d + w</code>. Pushing just the edge weight <code>w</code> orders nodes by the length of their last road, so far-away nodes can jump the queue and the guarantee that 'popped means final' is lost." },
    { type: "cat", q: "Which of these can Dijkstra's algorithm handle safely?",
      buckets: ["Dijkstra is safe", "Needs another algorithm"],
      items: [["A road map with distances in kilometres", 0], ["Flights where some legs are free (cost 0)", 0], ["Several parallel roads between the same two towns", 0], ["A network where one link refunds 2 units (cost −2)", 1], ["Currency exchange scored as negative logs of rates, so some trades gain", 1]],
      why: "Dijkstra's safety argument says a later detour can only add cost. Zero is fine, and parallel roads just give it more choices. Negative weights break the argument, so use Bellman–Ford instead." },
    { type: "mcq", q: "A traveller wants the cheapest trip from S to T on this map (road costs shown). Which route does Dijkstra return?",
      fig: hopFig, o: ["S → T directly, total cost 9", "S → A → B → T, total cost 6", "S → C → T, total cost 10", "S → A → B → T, total cost 8"], a: 1,
      why: "Dijkstra minimises the <i>total weight</i>, not the number of roads. The direct road is only one hop but costs 9, while 2 + 3 + 1 = 6 using three hops. Via C it costs 5 + 5 = 10." },
    { type: "multi", q: "At the moment Dijkstra settles a node u, which of these are true? Select all that apply.",
      o: ["u's distance is final and cannot drop later", "Every node still waiting has a tentative distance at least as big as u's", "Every neighbour of u is already settled", "Every node settled earlier has a distance no bigger than u's", "u's shortest path goes only through nodes that are already settled", "Every road in the graph has been relaxed at least once"], a: [0, 1, 3, 4],
      why: "Settling the smallest tentative distance means nothing waiting can undercut it (there is no negative road), and the settled nodes come out in non-decreasing order. u's neighbours may well still be waiting (relaxing them is the next job), and many roads haven't been looked at yet." },
  ]);

  /* =====================================================================
     Lecture 2: A*
     ===================================================================== */
  const aWalls = wallSet([[4, 0], [4, 1], [4, 2], [4, 3]]);
  const nextFig = (() => {
    const cs = 52, cells = {}, gTxt = (g) => ({ fill: "var(--violet-dim)", stroke: "var(--violet)", t: "g " + g });
    [["0,1", 1], ["0,3", 1], ["1,1", 2], ["1,3", 2], ["2,1", 3], ["2,3", 3], ["3,2", 3]].forEach(([k, g]) => (cells[k] = { ...gTxt(g), pick: k }));
    cells["0,2"] = { fill: "var(--amber-dim)", stroke: "var(--amber)", t: "S" }; cells["1,2"] = { fill: "var(--teal-dim)", stroke: "var(--teal)", t: "done" }; cells["2,2"] = { fill: "var(--teal-dim)", stroke: "var(--teal)", t: "done" };
    cells["7,2"] = { fill: "var(--rose-dim)", stroke: "var(--rose)", t: "G" };
    return svg(8 * cs + 2, 5 * cs + 30, grid(8, 5, cs, { cells, walls: aWalls }) + tx(4 * cs, 5 * cs + 22, "green: already expanded · purple: waiting, with its g · dark: wall", { sz: 12, c: "var(--text-dim)" }), true);
  })();
  const diagFig = (() => {
    const cs = 52, cells = {}, G = [7, 2], put = (id, x, y) => (cells[x + "," + y] = { fill: "var(--violet-dim)", stroke: "var(--violet)", t: "h " + (Math.abs(x - G[0]) + Math.abs(y - G[1])), pick: id });
    put("a", 4, 2); put("b", 5, 0); put("c", 2, 2); put("d", 3, 4); put("e", 6, 1); put("f", 6, 2);
    cells["7,2"] = { fill: "var(--rose-dim)", stroke: "var(--rose)", t: "G" };
    return svg(8 * cs + 2, 5 * cs + 30, grid(8, 5, cs, { cells }) + tx(4 * cs, 5 * cs + 22, "each purple cell shows its Manhattan distance to G: |dx| + |dy|", { sz: 12, c: "var(--text-dim)" }), true);
  })();
  const pocketFig = (() => {
    const W = 11, H = 7, S = [0, 3], G = [7, 3], list = [];
    for (let y = 1; y <= 5; y++) list.push([5, y], [9, y]); for (let x = 5; x <= 9; x++) list.push([x, 1], [x, 5]);
    const walls = wallSet(list); walls.delete("9,3");
    const one = (h0, name) => {
      const closed = astar(W, H, walls, S, G, h0), cells = {};
      closed.forEach((k) => (cells[k] = { fill: "var(--teal-dim)", stroke: "var(--teal)" }));
      cells["0,3"] = { ...cells["0,3"], fill: "var(--amber-dim)", stroke: "var(--amber)", t: "S", sz: 11 }; cells["7,3"] = { fill: "var(--rose-dim)", stroke: "var(--rose)", t: "G", sz: 11 };
      return `<div style="flex:1 1 250px;min-width:230px">${svg(W * 26 + 2, H * 26 + 2, grid(W, H, 26, { cells, walls }), true)}<div style="text-align:center;font-weight:800;margin-top:4px">${name}: ${closed.length} cells expanded</div></div>`;
    };
    return `<div style="display:flex;flex-wrap:wrap;gap:14px">${one(false, "A* (Manhattan)")}${one(true, "Dijkstra (h = 0)")}</div><div class="faint" style="margin-top:6px;font-weight:800">Green cells were expanded. G sits inside a dark pocket whose opening faces away from S.</div>`;
  })();

  B.add("a2-astar", [
    { type: "pick", q: "A* (Manhattan distance, 4-way moves, every step costs 1) is part-way through. Click the waiting cell it will expand next.",
      fig: nextFig, a: "3,2", hint: "For each purple cell: f = g + h, where h counts the squares to G ignoring walls.",
      why: "Cell (3,2) has g = 3 and h = 4, so f = 7. Every other waiting cell has f = 9 (for instance g = 1 and h = 8). A* heads for the goal even though the wall will block that column: Manhattan distance never looks at walls, so it only finds out when the cell is expanded." },
    { type: "bug", q: "This A* returns a path that isn't always the shortest. Click the line that turns it into greedy best-first search.",
      code: ["def astar(start, goal, h, nbrs):", "    g = {start: 0}", "    open_ = [(h(start), start)]", "    while open_:", "        _, u = heapq.heappop(open_)", "        if u == goal:", "            return g[u]", "        for v, w in nbrs(u):", "            if g[u] + w < g.get(v, INF):", "                g[v] = g[u] + w", "                heapq.heappush(open_, (h(v), v))", "    return None"], a: 10,
      why: "The priority must be <code>g[v] + h(v)</code>. Ranking by <code>h</code> alone only chases whatever looks nearest to the goal and ignores what it cost to get there, so the first time the goal is popped the route can be long." },
    { type: "mcq", q: "G is walled in, with the opening on the far side. A* uses Manhattan distance, yet expands almost as many cells as Dijkstra (see the counts). Why?",
      fig: pocketFig, o: ["Manhattan distance ignores walls, so cells in front of them look close", "A* must expand every cell on the map once before it can return a path", "The heuristic is inadmissible here, so A* quietly falls back to Dijkstra", "Dijkstra's search was stopped early so that the comparison looks fair"], a: 0,
      why: "h only counts squares, so every cell next to the wall looks only a few steps from G while the real way round is long. A* keeps expanding them until f finally exceeds the length of the route round the back. The heuristic is still admissible; it is just not informative here." },
    { type: "pick", q: "Moves can now be <b>diagonal</b>, costing 1 each, and the heuristic is still Manhattan distance to G (shown in each cell). Click every cell where the heuristic <b>overestimates</b> the true remaining cost.",
      fig: diagFig, a: ["b", "d", "e"], hint: "With diagonal steps, a cell 2 right and 2 up needs just 2 moves, not 4.",
      why: "A diagonal move covers one square across and one up for a single step, so the true cost is max(|dx|, |dy|). Cell b is 2 across and 2 up (true cost 2, h = 4), d is 4 and 2 (true 4, h = 6), e is 1 and 1 (true 1, h = 2). Cells on a straight line from G (a, c, f) are fine. Manhattan distance is only admissible with 4-way moves." },
    { type: "match", q: "Match each heuristic with how A* behaves on an open grid with 4-way moves.",
      pairs: [["h = 0 everywhere", "Same as Dijkstra: spreads out in a diamond"], ["Manhattan distance", "Still shortest, with far fewer cells expanded"], ["3 × Manhattan distance", "Very fast, but may return a longer path"], ["h = the exact remaining cost", "Heads almost straight down a shortest path"]],
      why: "A* is a dial. 0 gives no guidance. A good admissible h gives guidance without losing optimality. Overestimating buys speed but breaks the guarantee. A perfect h removes all the wasted work." },
  ]);

  /* =====================================================================
     Lecture 2: routing
     ===================================================================== */
  const dvFig = (() => {
    const nb = [["B", 2, 4], ["C", 3, 5], ["D", 3, 4], ["E", 1, 6]];
    let s = `<rect x="10" y="70" width="170" height="86" rx="12" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>${tx(95, 100, "Router A", { sz: 15, c: "var(--blue-ink)" })}${tx(95, 124, "route to X:", { sz: 12, c: "var(--text-dim)" })}${tx(95, 144, "cost 7, via D", { sz: 14 })}`;
    nb.forEach(([n, link, adv], i) => {
      const y = 10 + i * 58;
      s += `<line x1="180" y1="113" x2="330" y2="${y + 24}" stroke="var(--line-2)" stroke-width="3"/>${tx(262, 113 + (y + 24 - 113) * 0.55 - 7, "link " + link, { sz: 12, c: "var(--text-dim)" })}`;
      s += `<g data-pick="${n}"><rect x="330" y="${y}" width="180" height="48" rx="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(420, y + 20, "Router " + n + " advertises", { sz: 12, c: "var(--text-dim)" })}${tx(420, y + 39, "\"X is " + adv + " away\"", { sz: 14 })}</g>`;
    });
    return svg(520, 245, s, true);
  })();
  const poisonFig = (() => {
    const rows = [["X", 3, "A"], ["Y", 2, "C"], ["Z", 5, "A"], ["W", 1, "D"], ["V", 4, "C"]], cx = [60, 170, 290];
    let s = ["Destination", "Cost", "Next hop"].map((h, k) => tx(cx[k], 18, h, { sz: 12, c: "var(--text-dim)" })).join("");
    rows.forEach(([d, c, n], i) => { const y = 28 + i * 38; s += `<g data-pick="${d}"><rect x="8" y="${y}" width="344" height="32" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(cx[0], y + 21, d, { sz: 15 })}${tx(cx[1], y + 21, c, { sz: 15, f: "var(--mono)" })}${tx(cx[2], y + 21, n, { sz: 15 })}</g>`; });
    return `<div class="faint" style="font-weight:800;margin-bottom:6px">Router B's own routing table</div>` + svg(360, 222, s, true);
  })();
  const failG = { A: [60, 130], B: [200, 45], C: [190, 130], E: [200, 220], D: [340, 130], F: [470, 130] };
  const failFig = Qf.graph(failG, [["A", "B", 2], ["A", "C", 1], ["A", "E", 1], ["B", "F", 3], ["C", "D", 2], ["D", "F", 1], ["E", "F", 7]], { pick: "nodes", w: 520, h: 260, hl: { "C-D": "var(--rose)", F: "var(--amber)" } });

  B.add("a2-routing", [
    { type: "pick", q: "Router A currently reaches X at cost 7 (via D). The four neighbours below have just sent their latest distance-vector advertisements. Click the one whose message makes A <b>switch</b> to a new route.",
      fig: dvFig, a: "B", hint: "For each neighbour, add the link cost to the distance it advertises. Switch only if the total is strictly below 7.",
      why: "Via B: 2 + 4 = 6, which beats 7. C gives 3 + 5 = 8 (worse). D gives 3 + 4 = 7, the route A already uses. E gives 1 + 6 = 7, a tie: no improvement, so A keeps what it has." },
    { type: "order", q: "A link in a link-state network fails. Put the recovery in order.",
      items: ["A router next to the failed link notices it has stopped answering", "It floods a new link-state message to every router", "Each router updates its own copy of the network map", "Each router re-runs Dijkstra on the updated map", "Forwarding tables switch to the new shortest paths"],
      why: "The news travels first (flooding), then every router independently recomputes from the same shared map. No router has to trust a neighbour's maths, which is why link-state recovers without counting to infinity." },
    { type: "pick", q: "Router B is about to send its table to its neighbour A. With <b>poisoned reverse</b>, click every destination that B advertises to A as unreachable (∞).",
      fig: poisonFig, a: ["X", "Z"], hint: "Which routes does B reach <i>through A</i>?",
      why: "B reaches X and Z through A. Telling A 'I can get to X in 3' would invite A to route back through B, creating a loop. So B says ∞ for those two. Routes via C or D, and W, are safe to advertise normally." },
    { type: "pick", q: "All routers use link-state routing towards F (link costs shown). The red link C–D fails and everyone recomputes. Click every router, apart from F, whose <b>next hop</b> towards F changes.",
      fig: failFig, a: ["A", "C"], hint: "Work out the cheapest path to F for A, B, C and E before and after the failure.",
      why: "Before: A uses C (1 + 2 + 1 = 4) and C uses D. After: C must go back via A, and A uses B instead (2 + 3 = 5). B reaches F directly and D's road is unaffected. E's cost rises from 5 to 6, but its best next hop is still A, so only its cost changes." },
    { type: "bug", q: "A distance-vector router handles an advertisement from a neighbour. The router keeps picking routes that look far too cheap. Click the faulty line.",
      code: ["def on_advert(table, neighbour, link_cost, advert):", "    for dest, cost in advert.items():", "        new_cost = cost", "        if new_cost < table.get(dest, INF):", "            table[dest] = new_cost"], a: 2,
      why: "The neighbour reports its own distance to the destination. Reaching it costs the link to the neighbour <i>plus</i> that distance: <code>new_cost = link_cost + cost</code>. Without it, a far-away destination looks as close as it is to the neighbour." },
  ]);

  /* =====================================================================
     Lecture 3: linear programming
     ===================================================================== */
  const lpBase = (xmax, ymax, w, h) => {
    const sx = (w - 60) / xmax, sy = (h - 56) / ymax, X = (x) => 40 + x * sx, Y = (y) => h - 30 - y * sy;
    let s = "";
    for (let i = 0; i <= xmax; i++) s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(ymax)}" stroke="var(--line)"/>${tx(X(i), Y(0) + 16, i, { sz: 11, c: "var(--text-dim)" })}`;
    for (let i = 0; i <= ymax; i++) s += `<line x1="${X(0)}" y1="${Y(i)}" x2="${X(xmax)}" y2="${Y(i)}" stroke="var(--line)"/>${tx(X(0) - 16, Y(i) + 4, i, { a: "end", sz: 11, c: "var(--text-dim)" })}`;
    s += tx(X(xmax) - 6, Y(0) + 28, "x", { sz: 12, c: "var(--text-dim)" }) + tx(X(0) - 30, Y(ymax) + 4, "y", { sz: 12, c: "var(--text-dim)" });
    return { X, Y, s };
  };
  const minFig = (() => {
    const w = 500, h = 340, { X, Y, s } = lpBase(7, 7, w, h);
    const poly = [[4, 0], [5, 0], [5, 5], [0, 5], [0, 4]];
    let o = s + `<polygon points="${poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3"/>`;
    o += tx(X(2.5) + 24, Y(2.5) + 4, "feasible region", { sz: 12, c: "var(--teal-ink)" }) + tx(X(1), Y(2) + 4, "x + y ≥ 4", { sz: 12, c: "var(--text-dim)" });
    o += tx(X(5) + 8, Y(6.3), "x ≤ 5", { a: "start", sz: 12, c: "var(--text-dim)" }) + tx(X(6.9), Y(5) - 6, "y ≤ 5", { a: "end", sz: 12, c: "var(--text-dim)" });
    const off = { "4,0": [-14, -16, "end"], "5,0": [16, -10, "start"], "5,5": [16, -6, "start"], "0,5": [18, -12, "start"], "0,4": [18, 20, "start"] };
    poly.forEach(([x, y]) => { const [dx, dy, an] = off[x + "," + y]; o += `<g data-pick="${x},${y}"><circle cx="${X(x)}" cy="${Y(y)}" r="10" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(X(x) + dx, Y(y) + dy, `(${x}, ${y})`, { sz: 12, c: "var(--text)", a: an })}</g>`; });
    return svg(w, h, o, true);
  })();
  const feasFig = (() => {
    const w = 520, h = 340, { X, Y, s } = lpBase(9, 8, w, h);
    let o = s;
    o += `<line x1="${X(0)}" y1="${Y(8)}" x2="${X(8)}" y2="${Y(0)}" stroke="var(--blue)" stroke-width="3"/>${tx(X(1.5) + 6, Y(6.5) - 8, "x + y = 8", { sz: 12, c: "var(--blue-ink)", a: "start" })}`;
    o += `<line x1="${X(6)}" y1="${Y(0)}" x2="${X(6)}" y2="${Y(8)}" stroke="var(--violet)" stroke-width="3"/>${tx(X(6) + 6, Y(7.5), "x = 6", { sz: 12, c: "var(--violet-ink)", a: "start" })}`;
    o += `<line x1="${X(0)}" y1="${Y(5)}" x2="${X(9)}" y2="${Y(5)}" stroke="var(--amber)" stroke-width="3"/>${tx(X(8.9), Y(5) - 7, "y = 5", { sz: 12, c: "var(--amber-ink)", a: "end" })}`;
    [["A", 2, 2], ["B", 6, 3], ["C", 6, 2], ["D", 3, 6], ["E", 1, 5], ["F", 5, 4]].forEach(([id, x, y]) => { o += `<g data-pick="${id}"><circle cx="${X(x)}" cy="${Y(y)}" r="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${tx(X(x), Y(y) + 5, id, { sz: 13 })}</g>`; });
    return svg(w, h, o, true);
  })();
  const bindFig = (() => {
    const w = 520, h = 340, { X, Y, s } = lpBase(8, 7, w, h);
    const poly = [[0, 0], [5, 0], [5, 2], [3, 4], [0, 4]];
    let o = s + `<polygon points="${poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--teal-dim)" stroke="none" opacity="0.8"/>`;
    const line = (id, x1, y1, x2, y2, col, label, lx, ly, anchor) => `<g data-pick="${id}"><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="${col}" stroke-width="3"/><line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="transparent" stroke-width="18"/><rect x="${X(lx) - label.length * 3.4 - 6}" y="${Y(ly) - 11}" width="${label.length * 6.8 + 12}" height="22" rx="8" fill="var(--panel)" stroke="${col}" stroke-width="2"/>${tx(X(lx), Y(ly) + 4, label, { sz: 12, c: col })}</g>`;
    o += line("oven", 0, 7, 7, 0, "var(--blue)", "Oven hours: x + y ≤ 7", 6.1, 0.9, "start");
    o += line("demx", 5, 0, 5, 7, "var(--violet)", "Demand for X: x ≤ 5", 5, 6.5, "start");
    o += line("demy", 0, 4, 8, 4, "var(--amber)", "Demand for Y: y ≤ 4", 1.5, 4, "start");
    o += line("flour", 0, 6, 8, 2, "var(--rose)", "Flour: x + 2y ≤ 12", 6.7, 2.65, "start");
    o += tx(X(1.2), Y(1.6), "feasible", { sz: 12, c: "var(--teal-ink)" });
    return svg(w, h, o, true);
  })();
  const tableauFig = (() => {
    const cx = [40, 112, 164, 216, 268, 320, 372, 450], head = ["", "x", "y", "s₁", "s₂", "s₃", "s₄", "RHS"];
    const rows = [["s₁", 2, 1, 1, 0, 0, 0, 10], ["s₂", 1, 1, 0, 1, 0, 0, 8], ["s₃", "−1", 1, 0, 0, 1, 0, 2], ["s₄", 1, 0, 0, 0, 0, 1, 6]];
    let s = head.map((h, k) => tx(cx[k], 20, h, { sz: 14, c: k === 1 ? "var(--amber-ink)" : "var(--text-dim)", f: "var(--mono)" })).join("");
    rows.forEach((r, i) => { const y = 32 + i * 36; s += `<g data-pick="r${i + 1}"><rect x="6" y="${y}" width="484" height="30" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${r.map((v, k) => tx(cx[k], y + 20, v, { sz: 15, f: "var(--mono)", c: k === 0 ? "var(--text-dim)" : "var(--text)" })).join("")}</g>`; });
    const zy = 32 + 4 * 36 + 4;
    s += `<rect x="6" y="${zy}" width="484" height="30" rx="9" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/>` + ["z", "−4", "−3", 0, 0, 0, 0, 0].map((v, k) => tx(cx[k], zy + 20, v, { sz: 15, f: "var(--mono)", c: k === 0 ? "var(--text-dim)" : "var(--text)" })).join("");
    return svg(496, 214, s, true);
  })();

  B.add("a3-lp", [
    { type: "pick", q: "A diet plan <b>minimises</b> cost z = 3x + y, subject to x + y ≥ 4, x ≤ 5 and y ≤ 5, with x, y ≥ 0. Click the corner that gives the lowest cost.",
      fig: minFig, a: "0,4", hint: "Work out 3x + y at each corner. Cheap means small x, because x costs 3 per unit.",
      why: "Costs: (4, 0) = 12, (5, 0) = 15, (5, 5) = 20, (0, 5) = 5, (0, 4) = 4. The minimum is at <b>(0, 4)</b>. The origin would be cheapest of all, but it isn't feasible: it breaks x + y ≥ 4." },
    { type: "pick", q: "A planner has three limits: x + y ≤ 8, x ≤ 6 and y ≤ 5 (all with x, y ≥ 0). Click every plan (point) that satisfies <b>all</b> of them.",
      fig: feasFig, a: ["A", "C", "E"], hint: "Read each point's coordinates from the axes, then test it against all three rules. A point exactly on a line still counts.",
      why: "A (2, 2) and E (1, 5) pass everything. C (6, 2) sits exactly on x = 6 and on x + y = 8, which is allowed with ≤. B (6, 3) and F (5, 4) both total 9, too much. D (3, 6) breaks y ≤ 5." },
    { type: "cat", q: "Sort each linear program by the kind of outcome a solver reports.",
      buckets: ["One best corner", "A whole edge ties", "No answer"],
      items: [["Maximise 2x + y subject to x + y ≤ 4, x, y ≥ 0", 0], ["Maximise x + y subject to x + y ≤ 4, x, y ≥ 0", 1], ["Minimise x + y subject to x + y ≥ 3, x, y ≥ 0", 1], ["Minimise x + y subject to x ≥ 1, y ≥ 1", 0], ["Maximise x + y subject to x ≥ 1, y ≥ 1", 2], ["Maximise x subject to x ≤ 2 and x ≥ 3", 2]],
      why: "2x + y is best at (4, 0) alone (value 8). Whenever the objective line is parallel to a boundary edge, every point on that edge ties (x + y = 4, or x + y = 3). Minimising x + y with x, y ≥ 1 stops at (1, 1). Maximising it with only lower bounds can grow forever (unbounded), and x ≤ 2 with x ≥ 3 is impossible (infeasible)." },
    { type: "pick", q: "Simplex maximises z = 4x + 3y. The most negative entry in the z row is −4, so <b>x enters</b>. Click the row that must leave (the one that stops x rising first). Rows read as constraints, for example row s₁: 2x + y + s₁ = 10.",
      fig: tableauFig, a: "r1", hint: "For each row with a positive x entry, divide the right-hand side by it. The smallest ratio wins. A negative entry puts no limit on x.",
      why: "Ratios: s₁ gives 10 ÷ 2 = 5, s₂ gives 8 ÷ 1 = 8 and s₄ gives 6 ÷ 1 = 6. Row s₃ has −1 for x, so raising x only makes it looser: no limit. The smallest ratio, 5, belongs to s₁, so x can only rise to 5 before that constraint binds. Picking any other row would push s₁ negative (infeasible)." },
    { type: "pick", q: "Profit is z = 3x + 2y. Find the best corner of the shaded region, then click every constraint that is <b>binding</b> there (the ones that stop profit rising).",
      fig: bindFig, a: ["demx", "oven"], hint: "Corners: (5, 0), (5, 2), (3, 4), (0, 4). Work out z at each one.",
      why: "z at the corners: (5, 0) = 15, (5, 2) = 19, (3, 4) = 17, (0, 4) = 8. The best is (5, 2), where x = 5 and x + y = 7 meet: demand for X and the oven are binding. The flour line is never even touched by the region, and the y ≤ 4 line is not reached at (5, 2), so both have slack." },
    { type: "bug", q: "This brute-force solver maximises c·(x, y) over every point where two constraint lines cross, yet it sometimes returns a plan that breaks a constraint. Click the faulty line.",
      code: ["def best_corner(lines, c):", "    best, best_z = None, float(\"-inf\")", "    for (x, y) in intersections(lines):", "        z = c[0] * x + c[1] * y", "        if z > best_z:", "            best, best_z = (x, y), z", "    return best"], a: 4,
      why: "Crossing points of constraint lines are only <i>candidates</i>. Many lie outside the feasible region. The test must be <code>if feasible(x, y, lines) and z &gt; best_z:</code>, so only genuine corners compete." },
  ]);
})();

/* ===== bank-v-algo-1.js ===== */
/* ALGO revision bank, visual and varied questions, part 1. Phase 1 (anatomy, big-O, PageRank), Dijkstra, A*, routing, linear programming.
   Every figure carries the data the question needs. Numbers were checked by running the real algorithms. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const B = NIC.bank,
    Qf = NIC.qfig;

  /* ---------- small SVG helpers ---------- */
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.sz || 13}px ${o.f || "var(--sans)"};fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body, pick) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-height:${h}px${pick ? "" : ";display:block"}">${body}</svg>`;
  const codeBox = (lines) =>
    `<div style="font:700 13px var(--mono);background:var(--bg-2);border:2px solid var(--line);border-radius:12px;padding:8px 12px;margin-bottom:8px;white-space:pre;overflow-x:auto">${lines.join("\n")}</div>`;
  const dashed = "stroke-dasharray:5 4";

  /* grid of cells for A* pictures. cells: {"x,y": {fill, stroke, t, t2, pick}} */
  const grid = (W, H, cs, o = {}) => {
    let s = "";
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const k = x + "," + y,
          c = (o.cells && o.cells[k]) || {},
          wall = o.walls && o.walls.has(k);
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
    const key = (x, y) => x + "," + y,
      g = { [key(...S)]: 0 },
      open = new Set([key(...S)]),
      closed = [];
    const hf = (x, y) => (h0 ? 0 : Math.abs(x - G[0]) + Math.abs(y - G[1]));
    while (open.size) {
      let best = null,
        bf = 1e9,
        bh = 1e9;
      for (const k of open) {
        const [x, y] = k.split(",").map(Number),
          f = g[k] + hf(x, y),
          h = hf(x, y);
        if (f < bf || (f === bf && h < bh)) {
          bf = f;
          bh = h;
          best = k;
        }
      }
      open.delete(best);
      closed.push(best);
      const [x, y] = best.split(",").map(Number);
      if (x === G[0] && y === G[1]) break;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx,
          ny = y + dy,
          k = key(nx, ny);
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || walls.has(k)) continue;
        if (g[k] === undefined || g[best] + 1 < g[k]) {
          g[k] = g[best] + 1;
          open.add(k);
        }
      }
    }
    return closed;
  }

  /* =====================================================================
     Phase 1: algorithm anatomy
     ===================================================================== */
  const traceRows = [
    ["1", "9", "9", "9"],
    ["2", "2", "9", "9"],
    ["3", "7", "7", "9"],
    ["4", "1", "7", "9"],
  ];
  const traceFig = () => {
    const cx = [56, 150, 280, 420];
    let s = ["i", "xs[i]", "best after the step", "biggest of xs[0..i]"]
      .map((h, k) => tx(cx[k], 18, h, { sz: 12, c: "var(--text-dim)" }))
      .join("");
    traceRows.forEach((r, k) => {
      const y = 30 + k * 38;
      s += `<g data-pick="r${k + 1}"><rect x="8" y="${y}" width="484" height="32" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${r.map((v, j) => tx(cx[j], y + 21, v, { sz: 15, f: "var(--mono)" })).join("")}</g>`;
    });
    return (
      codeBox(["best = xs[0]", "for i in range(1, len(xs)):", "    if xs[i] > xs[i - 1]:", "        best = xs[i]"]) +
      `<div class="faint" style="margin:0 0 6px;font-weight:800">Trace on xs = [4, 9, 2, 7, 1] (xs[0] = 4, so best starts at 4)</div>` +
      svg(500, 190, s, true)
    );
  };

  B.add("a1-anatomy", [
    {
      type: "bug",
      q: "This binary search sometimes never finishes. Click the line that stops the search range from shrinking.",
      code: [
        "def find(xs, t):",
        "    lo, hi = 0, len(xs) - 1",
        "    while lo <= hi:",
        "        mid = (lo + hi) // 2",
        "        if xs[mid] == t:",
        "            return mid",
        "        elif xs[mid] < t:",
        "            lo = mid",
        "        else:",
        "            hi = mid - 1",
        "    return -1",
      ],
      a: 7,
      why: "Termination needs something that strictly shrinks every round. With <code>lo = mid</code>, on xs = [1, 3] and t = 3 we get lo = 0, hi = 1, mid = 0 forever. Since xs[mid] is already ruled out, the line must be <code>lo = mid + 1</code>.",
    },
    {
      type: "cat",
      q: "Assume <code>n</code> is any integer, positive, zero or negative. Which loops are guaranteed to stop?",
      buckets: ["Always stops", "Can run forever"],
      items: [
        ["<code>while n &gt; 0: n = n - 2</code>", 0],
        ["<code>while n != 0: n = n - 2</code>", 1],
        ["<code>while n &gt; 1: n = n // 2</code>", 0],
        ["<code>while n != 1: n = n // 2</code>", 1],
        ["<code>while i &lt; len(xs): total += xs[i]</code> (i never changes)", 1],
        ["<code>for x in xs: total += x</code>", 0],
      ],
      why: "A loop stops when some quantity must run out. <code>n &gt; 0</code> fails once n drops to 0 or below, whatever the start. But <code>n != 0</code> is skipped over by odd n (5, 3, 1, −1 …) and <code>n != 1</code> never fires for n = 0 (0 // 2 is 0) or negative n. A forgotten <code>i += 1</code> means nothing ever changes. A <code>for</code> over a list has a built-in bound.",
    },
    {
      type: "pick",
      q: "The invariant is: <b>best = the biggest of the items checked so far</b>. Click the first row of this trace where the invariant stops being true.",
      fig: traceFig(),
      a: "r3",
      hint: 'In each row, compare the "best after the step" column with the biggest of xs[0..i].',
      why: "In row 3 the loop compares 7 with the <i>previous item</i> (2) instead of with <code>best</code>. 7 &gt; 2, so best drops from 9 to 7 while the biggest item so far is still 9. The comparison must be <code>xs[i] &gt; best</code>.",
    },
    {
      type: "match",
      q: "Match each loop to the promise (invariant) that makes it correct.",
      pairs: [
        [
          "<code>total = 0</code>, then <code>total += x</code> for each x",
          "total = the sum of the items handled so far",
        ],
        [
          "<code>count += 1</code> only when <code>x % 2 == 0</code>",
          "count = how many even items have been handled so far",
        ],
        [
          "Binary search with <code>lo</code> and <code>hi</code>",
          "if the target is present, it lies between lo and hi",
        ],
        ["<code>best = x</code> whenever <code>x &gt; best</code>", "best = the largest item handled so far"],
      ],
      why: "An invariant describes the state in terms of the progress made, and it must be true before the first round, kept true by every round, and strong enough to give the answer at the end.",
    },
    {
      type: "multi",
      q: "<code>second_largest(xs)</code> should return the second biggest value in a list. Select every input that probes an edge case the specification has to settle.",
      o: [
        "<code>[5, 1, 3]</code>",
        "<code>[]</code>",
        "<code>[4]</code>",
        "<code>[7, 7, 7]</code>",
        "<code>[9, 9, 2]</code>",
        "<code>[2, 9, 6, 1]</code>",
      ],
      a: [1, 2, 3, 4],
      why: "An empty list and a one-item list have no second item at all. In <code>[7, 7, 7]</code> and <code>[9, 9, 2]</code> a tie forces a decision: is the second largest 9 or 2? The spec must say. <code>[5, 1, 3]</code> and <code>[2, 9, 6, 1]</code> are ordinary inputs.",
    },
  ]);

  /* =====================================================================
     Phase 1: big-O
     ===================================================================== */
  const curvesFig = () => {
    const w = 520,
      h = 250,
      X = (n) => 46 + n * (456 / 40),
      Y = (v) => h - 36 - v * (190 / 40);
    const path = (f, from, to) => {
      let d = "",
        started = false;
      for (let n = from; n <= to + 1e-9; n += 0.1) {
        const v = f(n);
        if (v > 40) {
          d += `L${X(n).toFixed(1)} ${Y(40).toFixed(1)}`;
          break;
        }
        d += `${started ? "L" : "M"}${X(n).toFixed(1)} ${Y(v).toFixed(1)}`;
        started = true;
      }
      return d;
    };
    const endOf = (f, from) => {
      for (let n = from; n <= 40; n += 0.05) if (f(n) >= 40) return [n, 40];
      return [40, f(40)];
    };
    const defs = [
      ["P", (n) => n * n, "var(--amber)", 0],
      ["Q", (n) => n * Math.log2(n), "var(--violet)", 1],
      ["R", (n) => n, "var(--blue)", 0],
      ["S", (n) => Math.log2(n), "var(--teal)", 1],
    ];
    let s = "";
    for (let v = 0; v <= 40; v += 10)
      s += `<line x1="46" y1="${Y(v)}" x2="502" y2="${Y(v)}" stroke="var(--line)"/>${tx(38, Y(v) + 4, v, { a: "end", sz: 11, c: "var(--text-dim)" })}`;
    for (let n = 0; n <= 40; n += 10) s += tx(X(n), h - 18, n, { sz: 11, c: "var(--text-dim)" });
    s +=
      tx(274, h - 2, "input size n", { sz: 12, c: "var(--text-dim)" }) +
      tx(6, 8, "steps", { sz: 12, c: "var(--text-dim)", a: "start" });
    defs.forEach(([id, f, col, from]) => {
      const [ex, ey] = endOf(f, from || 1),
        px = X(ex),
        py = Y(ey);
      s += `<g data-pick="${id}"><path d="${path(f, from || 1, 40)}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"/><path d="${path(f, from || 1, 40)}" fill="none" stroke="transparent" stroke-width="18"/><circle cx="${Math.min(px, 494)}" cy="${py + (id === "S" ? -14 : 0)}" r="11" fill="var(--panel)" stroke="${col}" stroke-width="3"/>${tx(Math.min(px, 494), py + (id === "S" ? -9 : 5), id, { sz: 12, c: col })}</g>`;
    });
    return svg(w, h, s, true);
  };
  const crossFig = () => {
    const w = 520,
      h = 260,
      X = (n) => 50 + n * 4.5,
      Y = (v) => h - 44 - v * (190 / 6000);
    let s = "";
    for (let v = 0; v <= 6000; v += 2000)
      s += `<line x1="50" y1="${Y(v)}" x2="500" y2="${Y(v)}" stroke="var(--line)"/>${tx(42, Y(v) + 4, v.toLocaleString("en-GB"), { a: "end", sz: 11, c: "var(--text-dim)" })}`;
    let dB = "",
      dA = "";
    for (let n = 0; n <= 100; n += 1) {
      const a = 50 * n;
      dA += `${n ? "L" : "M"}${X(n)} ${Y(a)}`;
    }
    for (let n = 0; n <= 77; n += 1) dB += `${n ? "L" : "M"}${X(n)} ${Y(n * n)}`;
    s += `<path d="${dA}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linecap="round"/><path d="${dB}" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linecap="round"/>`;
    s +=
      tx(470, Y(5000) - 10, "A: 50n", { c: "var(--blue-ink)", sz: 14 }) +
      tx(X(75) - 36, Y(5800) + 2, "B: n²", { c: "var(--amber-ink)", sz: 14 });
    [20, 40, 60, 80].forEach((n) => {
      s += `<g data-pick="${n}"><line x1="${X(n)}" y1="${Y(0)}" x2="${X(n)}" y2="${Y(6000)}" stroke="var(--line-2)" stroke-width="2" style="${dashed}"/><rect x="${X(n) - 28}" y="${h - 34}" width="56" height="26" rx="9" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${tx(X(n), h - 16, "n = " + n, { sz: 12 })}</g>`;
    });
    return svg(w, h, s, true);
  };

  B.add("a1-bigo", [
    {
      type: "match",
      q: "A student timed three programs at n = 1,000, 2,000 and 4,000 (each doubling). Match each set of timings to its growth.",
      pairs: [
        ["10 ms, 20 ms, 40 ms", "O(n)"],
        ["10 ms, 40 ms, 160 ms", "O(n²)"],
        ["10 ms, 11 ms, 12 ms", "O(log n)"],
        ["10 ms, 22 ms, 48 ms", "O(n log n)"],
      ],
      why: "Look at what doubling n does. Twice the time: linear. Four times: quadratic. Only a little extra each time: logarithmic. Slightly more than double: n log n (the extra log n factor adds a little each doubling).",
    },
    {
      type: "pick",
      q: "Program A takes 50n steps and program B takes n² steps. A is the clever, linear one. Click the <b>first</b> marked input size where A is really faster than B.",
      fig: crossFig(),
      a: "60",
      hint: "A beats B when 50n &lt; n². Divide both sides by n.",
      why: "50n &lt; n² as soon as n &gt; 50, so the curves cross at n = 50. At n = 40 B is still cheaper (1,600 against 2,000). At n = 60 A wins (3,000 against 3,600). Big-O only promises that the slower-growing one wins <i>eventually</i>; the constant decides where.",
    },
    {
      type: "bug",
      q: "This should find a duplicate in O(n) time, but it is secretly O(n²). Click the line with the hidden cost.",
      code: [
        "def has_duplicate(xs):",
        "    seen = []",
        "    for x in xs:",
        "        if x in seen:",
        "            return True",
        "        seen.append(x)",
        "    return False",
      ],
      a: 3,
      why: "<code>x in seen</code> on a list scans the list item by item, so the loop does 0 + 1 + 2 + … comparisons. Make <code>seen</code> a set (<code>seen = set()</code>, <code>seen.add(x)</code>) and the membership test is O(1) on average.",
    },
    {
      type: "cat",
      q: "A Python list <code>xs</code> holds a million items. Which operations take the same time however long the list is?",
      buckets: ["Same cost at any length", "Slows down as the list grows"],
      items: [
        ["<code>xs[500000]</code>", 0],
        ["<code>xs.append(7)</code>", 0],
        ["<code>len(xs)</code>", 0],
        ["<code>7 in xs</code>", 1],
        ["<code>xs.insert(0, 7)</code>", 1],
        ["<code>sum(xs)</code>", 1],
      ],
      why: "Indexing, appending to the end and reading the length don't look at the other items. Searching with <code>in</code> and <code>sum</code> touch every item, and <code>insert(0, …)</code> has to shuffle every existing item along one place.",
    },
    {
      type: "pick",
      q: "These curves show steps against input size n. Click the one where doubling n only adds a fixed number of steps.",
      fig: curvesFig(),
      a: "S",
      hint: "Look for the curve that flattens out: it barely rises as n keeps growing.",
      why: "S is logarithmic: log₂(2n) = log₂ n + 1, so each doubling costs one more step. R (linear) doubles when n doubles, Q (n log n) a little more than doubles, and P (quadratic) quadruples.",
    },
    {
      type: "mcq",
      q: "Here n could be a billion. How does the running time grow with n?",
      fig: codeBox(["for i in range(n):", "    for j in range(1000):", "        work()"]),
      o: ["O(n)", "O(n²)", "O(1000²)", "O(n log n)"],
      a: 0,
      why: "The inner loop always runs exactly 1,000 times, however big n is, so the total is 1,000 × n. Constant factors vanish in Big-O: it's linear. (The nested shape only becomes quadratic when the inner bound itself depends on n.)",
    },
  ]);

  /* =====================================================================
     Phase 1: the random surfer
     ===================================================================== */
  const dArrow = { directed: true };
  const surfFig1 = Qf.graph(
    { p: [50, 50], q: [50, 130], r: [50, 210], U: [200, 130], s: [350, 225], H: [350, 130], T: [480, 130] },
    [
      ["p", "U"],
      ["q", "U"],
      ["r", "U"],
      ["U", "H"],
      ["s", "H"],
      ["H", "T"],
      ["T", "H"],
    ],
    { pick: "nodes", w: 530, h: 260, ...dArrow },
  );
  const trapFig = Qf.graph(
    { S: [50, 130], T: [190, 50], W: [190, 210], U: [340, 50], V: [470, 130] },
    [
      ["S", "T"],
      ["S", "W"],
      ["W", "T"],
      ["T", "U"],
      ["U", "V"],
      ["V", "U"],
    ],
    { pick: "nodes", w: 520, h: 260, ...dArrow },
  );
  const tokenFig = (() => {
    const N = { A: [90, 70], B: [90, 210], C: [330, 210], D: [330, 70] },
      tok = { A: 20, B: 20, C: 40, D: 20 };
    let f = Qf.graph(
      N,
      [
        ["A", "B"],
        ["A", "C"],
        ["B", "C"],
        ["C", "D"],
        ["D", "A"],
        ["D", "B"],
      ],
      { w: 430, h: 280, ...dArrow },
    );
    const lab = Object.entries(N)
      .map(([k, [x, y]]) => {
        const ly = y > 150 ? y + 26 : y - 48;
        return `<g><rect x="${x - 34}" y="${ly}" width="68" height="22" rx="8" fill="var(--amber-dim)" stroke="var(--amber)" stroke-width="2"/>${tx(x, ly + 15, tok[k] + " tokens", { sz: 11, c: "var(--amber-ink)" })}</g>`;
      })
      .join("");
    return f.replace("</svg>", lab + "</svg>");
  })();
  Object.assign(partScope, { astar, grid, surfFig1, svg, tokenFig, trapFig, tx, wallSet });
})();

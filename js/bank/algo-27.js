(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { C, L, P, R, SVG, T, adjTable, arrowDef, codeBox, col, hit, ink, lookTrace, node, outDiff, pk, tint, wpill } =
    partScope;
  const B = NIC.bank;

  // 4. a map with an island (verified by counting looks in the Python run: 8)
  const islandMap = (() => {
    const pos = { S: [44, 96], A: [140, 36], B: [140, 156], C: [250, 156], D: [350, 44], E: [440, 96], F: [380, 160] };
    const edges = [
      ["S", "A", 2],
      ["S", "B", 5],
      ["A", "B", 1],
      ["B", "C", 3],
      ["D", "E", 4],
      ["E", "F", 2],
    ];
    let b =
      R(300, 8, 192, 188, { rx: 18, fill: "var(--bg-2)", dash: "7 5" }) +
      T(396, 188, "no road to S", { sz: 12, c: "var(--text-dim)" });
    edges.forEach(([u, v]) => (b += L(pos[u][0], pos[u][1], pos[v][0], pos[v][1], { sw: 2.5 })));
    edges.forEach(([u, v, w]) => (b += wpill((pos[u][0] + pos[v][0]) / 2, (pos[u][1] + pos[v][1]) / 2, w)));
    Object.entries(pos).forEach(
      ([k, [x, y]]) => (b += node(x, y, k, { fill: k === "S" ? "teal" : null, stroke: k === "S" ? "teal" : null })),
    );
    b += T(44, 134, "start", { sz: 12, c: ink("teal") });
    return SVG(500, 204, b, "A map with a connected part containing S and a separate island");
  })();

  // 5. four frames of a table of distances (run on S-A 2, S-B 5, A-B 1, B-C 3, A-C 7); frame 3 is corrupted
  const frameFig = (() => {
    const frames = [
        [0, 2, 5, null],
        [0, 2, 3, 9],
        [0, 2, 4, 6],
        [0, 2, 3, 6],
      ],
      nm = ["S", "A", "B", "C"];
    const pw = 114,
      bw = 18,
      h = 110,
      y0 = 34,
      Y = (v) => y0 + h - (v / 10) * h;
    let b = "";
    frames.forEach((f, k) => {
      const ox = 6 + k * (pw + 10);
      b +=
        R(ox, 4, pw, 196, { rx: 12, fill: "var(--panel)" }) +
        T(ox + pw / 2, 24, "after settle " + (k + 1), { sz: 13, c: "var(--ink)", w: 900 });
      f.forEach((v, i) => {
        const x = ox + 12 + i * 25;
        if (v === null)
          b +=
            R(x, y0, bw, h, { rx: 3, fill: "var(--bg-2)", dash: "3 3", sw: 1.5 }) +
            T(x + bw / 2, y0 + h / 2 + 5, "∞", { sz: 14, c: "var(--text-dim)" });
        else
          b +=
            R(x, Y(v), bw, h - (Y(v) - y0), { rx: 3, fill: col("blue"), stroke: col("blue"), sw: 1, op: 0.8 }) +
            T(x + bw / 2, Y(v) - 5, String(v), { sz: 13, c: "var(--ink)", w: 900 });
        b += T(x + bw / 2, y0 + h + 18, nm[i], { sz: 13, c: "var(--text-dim)" });
      });
      b += pk("f" + (k + 1), hit(ox, 4, pw, 196, 12));
    });
    return SVG(500, 206, b, "Four small bar charts of the distances to S, A, B and C after each settle");
  })();

  B.add("a2-code", [
    {
      type: "bug",
      q: "On the map S–X 7, S–Y 2, Y–X 3, X–Z 1 (start S) this relax step prints X = 1 and Z = 1, as the table shows. Click the faulty line.",
      fig: outDiff,
      code: ["for v, w in graph[u]:", "    cand = dist[u] + w", "    if cand < dist[v]:", "        dist[v] = w"],
      a: 3,
      why: "The test compares the right thing (<code>cand</code>), but the update stores <code>w</code>, the length of one road, instead of the whole route length. Every distance then forgets how far it took to reach u. It should be <code>dist[v] = cand</code>.",
    },
    {
      type: "pick",
      q: "A student's relax step only writes a distance when the node has none yet. Their code printed this trace on the map S–X 7, S–Y 2, Y–X 3, X–Z 1. Click the row where an improvement was missed.",
      fig: lookTrace,
      a: "l4",
      why: "On Y – X the candidate is 5, which beats the 7 that X holds, yet X is still 7 afterwards. A shorter way was found and thrown away, so X and everything beyond it (Z comes out at 8 instead of 6) is too big. The other rows are fine: their candidates either fill an empty ∞ or are not better.",
    },
    {
      type: "pick",
      q: "The roads S–X, S–Y, Y–X and X–Z are two-way, but the code reads <code>graph[u]</code>, the roads out of u. This table only lists each road in one direction. Click every empty cell that must be filled so that every road works both ways.",
      fig: adjTable,
      a: ["XS", "YS", "XY", "ZX"],
      why: "A two-way road needs an entry in both rows: S–X gives S → X (7) and X → S (7), and so on. The missing mirrors are X → S, Y → S, X → Y and Z → X. The other empty cells, such as S to Z, are pairs with no road at all and stay empty.",
    },
    {
      type: "mcq",
      q: "The lab's code records one 'look' for every road it checks out of a node it settles. All roads are two-way and Dijkstra starts at S. How many looks are recorded?",
      fig: islandMap,
      o: ["4", "6", "8", "12"],
      a: 2,
      hint: "Each road is checked from both ends, but only from nodes that actually get settled.",
      why: "S, A, B and C are settled. The four roads among them are each looked at from both ends: 8 looks. The island is never reached, so D, E and F are never settled and their two roads are never looked at. Counting every road from both ends would give 12.",
    },
    {
      type: "pick",
      q: "A student's code prints the table of distances after each settle, drawn as four small charts (a dashed bar = ∞, not reached). One frame cannot come from a correct Dijkstra run. Click it.",
      fig: frameFig,
      a: "f3",
      why: "Distances only ever fall or stay level. In frame 3, B has risen from 3 to 4. A route was found for B at 3, so a correct run can never give that up. Frame 4 has B back at 3, so frame 3 is the glitch, not frame 4.",
    },
    {
      type: "match",
      q: "Four students each made one slip in their Dijkstra code. Match each slip to what they saw when they ran the tests.",
      pairs: [
        ["The node is never marked as done", "The run never finishes: it hits the 2-second limit"],
        [
          "The relax test is written <code>cand &gt; dist[v]</code>",
          "Only the start gets a distance; everything else stays at ∞",
        ],
        ["The update is <code>dist[v] = w</code>", "Distances are tiny: each is just one road's length"],
        [
          "The next node is the first reached one, not the smallest",
          "Right on some maps, too big where a side road is shorter",
        ],
      ],
      why: "Without a done mark, the same smallest node is picked for ever. A reversed test is never true when the old value is ∞, so nothing updates. Storing w forgets the distance so far. Taking any reached node, not the smallest, locks in a node before its shortcut is found, so it works only by luck.",
    },
  ]);

  /* =====================================================================
     a1-anatomy
     ===================================================================== */
  // 1. the contract of binary search drawn as a pipeline
  const contractFig = (() => {
    let b = arrowDef("xa-ct");
    b +=
      R(110, 4, 280, 34, { rx: 12, fill: "var(--bg-2)" }) +
      T(250, 26, "binary_search([9, 2, 7], 9)", { sz: 14, f: "var(--mono)", c: "var(--ink)" });
    b += P("M250,40 L250,66", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-ct" });
    const box = (x, id, title, l1, l2, c) =>
      pk(
        id,
        R(x, 70, 156, 92, { rx: 14, fill: tint(c), stroke: col(c) }) +
          T(x + 78, 92, title, { sz: 14, c: ink(c), w: 900 }) +
          T(x + 78, 114, l1, { sz: 13 }) +
          T(x + 78, 132, l2, { sz: 13 }) +
          hit(x, 70, 156, 92, 14),
      );
    b +=
      box(8, "pre", "Precondition", "the list", "is sorted", "blue") +
      box(172, "inv", "Loop invariant", "if t is in the list, it is", "between lo and hi", "violet") +
      box(336, "post", "Postcondition", "returns the position", "of t, or -1", "teal");
    b +=
      P("M166,116 L170,116", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-ct" }) +
      P("M330,116 L334,116", { stroke: "var(--text-faint)", sw: 2.5, mk: "xa-ct" });
    b +=
      R(110, 176, 280, 34, { rx: 12, fill: tint("rose"), stroke: col("rose") }) +
      T(250, 198, "returned -1, but 9 is at position 0", { sz: 14, c: ink("rose") });
    return SVG(500, 218, b, "The contract of binary search: precondition, loop invariant, postcondition");
  })();

  // 2. bubble sort snapshots (real passes; the snapshot after pass 2 is corrupted)
  const bubble = (a) => {
    a = a.slice();
    const snaps = [a.slice()];
    for (let k = 0; k < 3; k++) {
      for (let i = 0; i < a.length - 1 - k; i++) if (a[i] > a[i + 1]) [a[i], a[i + 1]] = [a[i + 1], a[i]];
      snaps.push(a.slice());
    }
    return snaps;
  };
  const bubSnaps = bubble([5, 2, 9, 1, 7, 3]);
  const bubFig = (() => {
    const snaps = bubSnaps.map((s, k) => (k === 2 ? [2, 1, 5, 3, 9, 7] : s)),
      labels = ["start", "after pass 1", "after pass 2", "after pass 3"];
    const cw = 44,
      x0 = 168;
    let b = "";
    snaps.forEach((s, k) => {
      const y = 8 + k * 62;
      b += T(14, y + 29, labels[k], { a: "start", sz: 14, c: "var(--ink)", w: 900 });
      s.forEach((v, i) => {
        const fixed = i >= s.length - k;
        b +=
          R(x0 + i * cw, y, cw - 4, 40, {
            rx: 8,
            fill: fixed ? tint("teal") : "var(--panel)",
            stroke: fixed ? col("teal") : "var(--line-2)",
          }) + T(x0 + i * cw + (cw - 4) / 2, y + 27, String(v), { sz: 17, c: "var(--ink)", w: 900 });
      });
      b += pk("r" + k, hit(4, y - 6, 492, 52, 12));
    });
    b += T(250, 8 + 4 * 62 + 4, "green cells = where pass k says the k biggest items sit, in order", {
      sz: 12,
      c: "var(--text-faint)",
    });
    return SVG(500, 8 + 4 * 62 + 12, b, "The list [5, 2, 9, 1, 7, 3] at the start and after each bubble-sort pass");
  })();

  // 3. a two-cell binary-search window
  const windowFig = (() => {
    const xs = [4, 9, 15, 22, 28, 35, 41, 50, 57, 66],
      cw = 46,
      x0 = 20,
      y = 52;
    let b = "";
    xs.forEach((v, i) => {
      const inw = i === 5 || i === 6;
      b +=
        R(x0 + i * cw, y, cw - 4, 44, {
          rx: 8,
          fill: inw ? tint("blue") : "var(--bg-2)",
          stroke: inw ? col("blue") : "var(--line)",
        }) +
        T(x0 + i * cw + (cw - 4) / 2, y + 28, String(v), {
          sz: 16,
          c: inw ? "var(--ink)" : "var(--text-faint)",
          w: 900,
        }) +
        T(x0 + i * cw + (cw - 4) / 2, y + 62, String(i), { sz: 12, c: "var(--text-faint)" });
    });
    b +=
      T(x0 + 5 * cw + 21, y - 28, "lo, mid", { sz: 14, c: ink("blue"), w: 900 }) +
      P(`M${x0 + 5 * cw + 21},${y - 22} L${x0 + 5 * cw + 21},${y - 6}`, { stroke: col("blue"), sw: 2.5 });
    b += T(x0 + 6 * cw + 21, y - 14, "hi", { sz: 14, c: ink("blue"), w: 900 });
    b +=
      T(250, y + 94, "t = 41    xs[mid] = 35", { sz: 15, f: "var(--mono)", c: "var(--ink)" }) +
      T(250, y + 118, "the numbers under the cells are positions", { sz: 12, c: "var(--text-faint)" });
    return SVG(500, y + 126, b, "A sorted list of ten numbers with a search window of two cells");
  })();

  // 4. scatter of the tests tried so far: list length (across) against biggest item (up)
  const testScatter = (() => {
    const pts = [
      [1, 3],
      [2, 7],
      [2, 1],
      [3, 5],
      [3, 9],
      [4, 2],
      [4, 6],
      [5, 8],
      [6, 4],
      [7, 3],
      [8, 7],
      [9, 5],
      [9, 1],
      [10, 9],
      [11, 6],
      [12, 2],
      [12, 8],
      [6, 10],
    ];
    const x0 = 56,
      w = 424,
      y0 = 12,
      h = 240,
      X = (v) => x0 + (v / 13) * w,
      Y = (v) => y0 + h / 2 - (v / 10) * (h / 2);
    let b =
      R(x0, y0, w, h, { rx: 4 }) +
      L(x0, Y(0), x0 + w, Y(0), { stroke: "var(--text-faint)", sw: 2 }) +
      L(X(6.5), y0, X(6.5), y0 + h, { stroke: "var(--text-faint)", sw: 1.5, dash: "5 4" });
    [-10, -5, 0, 5, 10].forEach(
      (v) => (b += T(x0 - 8, Y(v) + 4, String(v), { a: "end", sz: 12, c: "var(--text-faint)" })),
    );
    [1, 4, 7, 10].forEach((v) => (b += T(X(v), y0 + h + 18, String(v), { sz: 12, c: "var(--text-faint)" })));
    b +=
      T(x0 + w / 2, y0 + h + 38, "items in the list", { sz: 12, c: "var(--text-dim)" }) +
      T(14, y0 + h / 2, "biggest item", { sz: 12, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 14 ${y0 + h / 2})" `,
      );
    pts.forEach(([x, y]) => (b += C(X(x), Y(y), 6, { fill: tint("blue"), stroke: col("blue"), sw: 2.5 })));
    b +=
      pk("tl", hit(x0 + 2, y0 + 2, X(6.5) - x0 - 4, h / 2 - 4, 8)) +
      pk("tr", hit(X(6.5) + 2, y0 + 2, x0 + w - X(6.5) - 4, h / 2 - 4, 8)) +
      pk("bl", hit(x0 + 2, y0 + h / 2 + 2, X(6.5) - x0 - 4, h / 2 - 4, 8)) +
      pk("br", hit(X(6.5) + 2, y0 + h / 2 + 2, x0 + w - X(6.5) - 4, h / 2 - 4, 8));
    b +=
      T(x0 + 70, y0 + 20, "short list", { a: "middle", sz: 12, c: "var(--text-faint)" }) +
      T(x0 + w - 70, y0 + 20, "long list", { sz: 12, c: "var(--text-faint)" });
    return (
      codeBox(["best = 0", "for x in xs:", "    if x &gt; best:", "        best = x"]) +
      SVG(500, y0 + h + 46, b, "Each dot is a test: how many items the list had, and its biggest item")
    );
  })();

  B.add("a1-anatomy", [
    {
      type: "pick",
      q: "<code>binary_search(xs, t)</code> promises to return the position of <code>t</code> when <code>xs</code> is sorted. A caller runs it on [9, 2, 7] looking for 9 and gets −1, which is wrong. Click the part of the contract that was broken first.",
      fig: contractFig,
      a: "pre",
      why: "The caller broke the precondition: the list is not sorted. Everything after that follows from it. The invariant (t lies between lo and hi) only holds for a sorted list, and the postcondition is only promised when the precondition holds. The function is not at fault: it was handed an input outside its contract.",
    },
    {
      type: "pick",
      q: "Bubble sort has the invariant: after pass k, the last k items are the k biggest, in order. A student printed the list [5, 2, 9, 1, 7, 3] after each pass. Click the row where the invariant is broken.",
      fig: bubFig,
      a: "r2",
      why: "After pass 2 the last two cells should be 7 and 9, in that order. The row shows 9 then 7: the right items, in the wrong order, so the promise fails. After pass 1 the 9 is in place, and after pass 3 the last three are 5, 7, 9, so those rows keep the promise.",
    },
    {
      type: "mcq",
      q: "Binary search has found that <code>xs[mid]</code> is smaller than <code>t</code> while its window is just the two marked cells. Which update keeps <code>t</code> inside the window and also guarantees the loop will finish?",
      fig: windowFig,
      o: [
        "Move lo past mid, to mid + 1",
        "Move lo up to mid, keeping mid",
        "Move hi down to mid - 1",
        "Move hi down to mid, keeping mid",
      ],
      a: 0,
      why: "xs[mid] = 35 is below 41, so t cannot be at mid or to its left: lo = mid + 1 is safe, and the window shrinks to one cell. Setting lo = mid also keeps t inside, but lo stays at 5 and mid is 5 again, so the loop never ends. Both hi updates throw t away.",
    },
    {
      type: "pick",
      q: "This function should return the biggest item of a list. The dots are the inputs the tests already tried. Click every region where an input would make the function give a wrong answer.",
      fig: testScatter,
      a: ["bl", "br"],
      why: "<code>best = 0</code> is a wrong starting value whenever every item is below 0, because the loop never beats it and the function returns 0. That happens for short and long lists alike, and no test dot lives in either lower region. The upper regions are covered by tests and work fine.",
    },
  ]);

  /* =====================================================================
     a1-bigo
     ===================================================================== */
  // 1. 100% stacked bars of 5n^2 + 40n + 900
  const stackFig = (() => {
    const ns = [10, 15, 20, 30, 100],
      x0 = 50,
      w = 440,
      y0 = 18,
      h = 220,
      bw = 54,
      gap = (w - ns.length * bw) / (ns.length + 1);
    let b = "";
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
      const y = y0 + h - v * h;
      b +=
        L(x0, y, x0 + w, y, {
          sw: v === 0.5 ? 2.5 : 1,
          stroke: v === 0.5 ? "var(--text-faint)" : "var(--line)",
          dash: v === 0.5 ? "6 4" : null,
        }) + T(x0 - 8, y + 4, Math.round(v * 100) + "%", { a: "end", sz: 12, c: "var(--text-faint)" });
    });
    ns.forEach((n, i) => {
      const parts = [
          [5 * n * n, "blue"],
          [40 * n, "amber"],
          [900, "violet"],
        ],
        tot = parts.reduce((s, p) => s + p[0], 0),
        x = x0 + gap + i * (bw + gap);
      let acc = 0;
      parts.forEach(([v, c]) => {
        const ph = (v / tot) * h;
        b += R(x, y0 + h - acc - ph, bw, ph, { rx: 0, sw: 1.5, fill: col(c), op: 0.75, stroke: col(c) });
        acc += ph;
      });
      b +=
        T(x + bw / 2, y0 + h + 20, "n = " + n, { sz: 13, c: "var(--ink)", w: 900 }) +
        pk("n" + n, hit(x - 4, y0, bw + 8, h + 4, 6));
    });
    b +=
      R(50, y0 + h + 34, 12, 12, { rx: 3, fill: col("blue"), stroke: col("blue"), op: 0.75 }) +
      T(68, y0 + h + 45, "5n² piece", { a: "start", sz: 12 }) +
      R(160, y0 + h + 34, 12, 12, { rx: 3, fill: col("amber"), stroke: col("amber"), op: 0.75 }) +
      T(178, y0 + h + 45, "40n piece", { a: "start", sz: 12 }) +
      R(270, y0 + h + 34, 12, 12, { rx: 3, fill: col("violet"), stroke: col("violet"), op: 0.75 }) +
      T(288, y0 + h + 45, "900 piece", { a: "start", sz: 12 }) +
      T(440, y0 + h + 45, "dashed = half", { sz: 12, c: "var(--text-faint)" });
    return SVG(500, y0 + h + 56, b, "Five bars showing how a cost of 5n² + 40n + 900 splits into its three pieces");
  })();

  // 2. where does work() run? six 12 x 12 grids
  const gridFig = (() => {
    const n = 12,
      cs = 11,
      pw = 160,
      ph = 190;
    const rules = [
      ["a", "range(3)", (i, j) => j < 3],
      ["b", "range(i)", (i, j) => j < i],
      ["c", "range(i - 1, i + 2)", (i, j) => Math.abs(j - i) <= 1],
      ["d", "range(0, n, 4)", (i, j) => j % 4 === 0],
      ["e", "range(n)", () => true],
      ["f", "range(n // 2)", (i, j) => j < n / 2],
    ];
    let b = "";
    rules.forEach(([id, lab, f], k) => {
      const ox = 6 + (k % 3) * (pw + 6),
        oy = 4 + Math.floor(k / 3) * (ph + 8);
      b +=
        R(ox, oy, pw, ph, { rx: 12 }) +
        T(ox + pw / 2, oy + 20, "for j in " + lab, { sz: 11.5, f: "var(--mono)", c: "var(--ink)", w: 700 });
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const on = f(i, j);
          b += `<rect x="${ox + 14 + j * cs}" y="${oy + 32 + i * cs}" width="${cs - 1}" height="${cs - 1}" rx="1.5" fill="${on ? "var(--blue)" : "var(--bg-2)"}"/>`;
        }
      b +=
        T(ox + pw / 2, oy + ph - 8, "row i, column j", { sz: 11, c: "var(--text-faint)" }) +
        pk(id, hit(ox, oy, pw, ph, 12));
    });
    return SVG(500, 2 * ph + 20, b, "Six grids showing which (i, j) pairs run work() when n is 12");
  })();
  Object.assign(partScope, { gridFig, stackFig });
})();

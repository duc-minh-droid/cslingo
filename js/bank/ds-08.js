/* ===== bank-v-ds-1.js ===== */
/* DS revision bank, visual and varied questions, part 1.
   Modules: ds-why, ds-blocks, ds-reliability, ds-load, ds-twitter, ds-scaling, ds-maintain.
   Every question stands on its own; the figure carries the data needed. Numbers checked with node. */
(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});

  const B = NIC.bank;

  /* ---- tiny SVG helpers (theme tokens only) ---- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, t, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${t}</text>`;
  const rc = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx === undefined ? 10 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}"/>`;
  const ln = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}" stroke-linecap="round" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const table = (head, rows) =>
    `<table class="t"><thead><tr>${head.map((h, i) => `<th${i ? ' class="num"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  /* ================= ds-why ================= */

  /* online shop: users -> two load balancers -> three app servers -> ONE database */
  const shopChain = (() => {
    let s = "";
    [60, 130].forEach((y) => [37, 102, 167].forEach((ay) => (s += ln(180, y + 20, 240, ay + 20, { sw: 2 }))));
    [37, 102, 167].forEach((ay) => (s += ln(330, ay + 20, 420, 119, { sw: 2 })));
    s += ln(80, 119, 110, 80, { sw: 2 }) + ln(80, 119, 110, 150, { sw: 2 });
    s += pk("users", rc(10, 99, 70, 40) + tx(45, 124, "Users"));
    s +=
      pk("lb1", rc(110, 60, 70, 40) + tx(145, 85, "Balancer")) +
      pk("lb2", rc(110, 130, 70, 40) + tx(145, 155, "Balancer"));
    [37, 102, 167].forEach((ay, i) => (s += pk("app" + (i + 1), rc(240, ay, 90, 40) + tx(285, ay + 25, "App server"))));
    s += pk("db", rc(420, 94, 110, 50) + tx(475, 124, "Database"));
    return svg(550, 215, s);
  })();

  /* demand bars vs one server's capacity */
  const demandBars = (() => {
    const v = [20, 30, 45, 65, 95, 140, 200, 290],
      base = 190,
      k = 0.55;
    let s = "";
    v.forEach((d, i) => {
      const x = 36 + i * 64,
        h = d * k;
      s += pk(
        "w" + (i + 1),
        rc(x, base - h, 50, h, { rx: 6, f: "var(--blue-dim, var(--panel))", s: "var(--blue)", sw: 2 }) +
          tx(x + 25, base - h - 6, d, { s: 12 }) +
          tx(x + 25, base + 17, "Wk " + (i + 1), { s: 12, c: "var(--text-dim)" }),
      );
    });
    s +=
      ln(26, base - 100 * k, 548, base - 100 * k, { s: "var(--rose)", sw: 3, d: "7 6" }) +
      tx(30, base - 100 * k - 8, "One server copes with 100 requests per second", {
        a: "start",
        s: 12,
        c: "var(--rose-ink)",
      });
    s += tx(10, 12, "Requests per second at the weekly peak", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(560, 215, s);
  })();

  B.add("ds-why", [
    {
      type: "pick",
      q: "A shop's traffic grew, so it added machines at every layer except one. Tap the part whose failure would STILL take the whole shop offline.",
      fig: shopChain,
      a: "db",
      why: "Users reach the shop through either balancer and any of three app servers, so each of those can fail without anyone noticing. The single database is the one part with no copy: it is the single point of failure. Adding servers only helped where the work could be shared.",
    },
    {
      type: "order",
      q: "Two copies of a bank balance sit in London and Sydney, and the link between them breaks. Put the events in the order that produces a stale read.",
      hint: "Think: what happens first, what is then missed, and who answers anyway?",
      items: [
        "The link between the London and Sydney copies is cut",
        "A London customer withdraws 40, so the London copy drops to 60",
        "A Sydney customer asks for their balance",
        "Sydney answers 100 from its own copy, without hearing about the withdrawal",
      ],
      why: "Once the copies cannot talk, an update on one side never reaches the other. If Sydney chooses to stay available it answers from what it has, which is out of date. Choosing consistency would mean refusing to answer until the link is back.",
    },
    {
      type: "pick",
      q: "One server copes with 100 requests per second (dashed line). Tap the first week in which it can no longer cope.",
      fig: demandBars,
      a: "w6",
      why: "Demand is 95 in week 5, then 140 in week 6, above the line. It grows by roughly 45% a week, so buying a machine twice as big (200) would only last about two more weeks. Rapid growth is why one server stopped being enough.",
    },
    {
      type: "bug",
      q: 'A team writes: "We removed our single point of failure by adding a second database server." Which line of the plan quietly undoes that claim?',
      code: [
        "Plan: add a second database server, B, beside server A",
        "Both servers start with a full copy of the data",
        "All writes go to A only; B is never told about them",
        "If A dies, clients are switched to B",
        "Result: users never lose service or data",
      ],
      a: 2,
      why: "Server B starts as a copy but never hears about new writes, so after a switch it would be missing everything since the copy. Keeping copies in step is the cost of replication. Without it the second server gives availability only on paper.",
    },
    {
      type: "mcq",
      q: "Using the two options in the table, what is the main price the cluster pays for being cheaper and for losing only an eighth of its capacity when one box dies?",
      fig: table(
        ["", "One big server", "Cluster of 8 small"],
        [
          ["Cores in total", "64", "8 × 8 = 64"],
          ["Hardware price", "£40k", "8 × £3k = £24k"],
          ["One machine dies", "100% of capacity lost", "12.5% of capacity lost"],
        ],
      ),
      o: [
        "The eight machines must be coordinated, and some can be down while others carry on",
        "Each machine runs programs more slowly than one 8-core server would",
        "The programs would have to be rewritten in a different language",
        "Every request must be answered by all eight machines at once",
      ],
      a: 0,
      why: "Cheap commodity machines scale and fail gently, but now data copies, ordering and partial failures have to be managed. That coordination is the trade-off behind the second lecture trade-off (one big machine versus many cheap ones).",
    },
    {
      type: "match",
      q: "Each change fixed one problem for a growing app. Match it to the NEW problem it brings.",
      pairs: [
        ["Keep a second copy of the database on another machine", "The two copies can disagree for a while"],
        ["Spread requests over ten identical web servers", "A user's session must be found on whichever one answers"],
        [
          "Replace a rack of big servers with hundreds of cheap ones",
          "Something is always broken somewhere, so partial failure is normal",
        ],
        ["Stay on one very large server", "Its price keeps climbing and one fault stops everything"],
      ],
      why: "No scaling step is free: copies bring consistency questions, spreading work brings shared state, cheap machines bring routine partial failure, and one big box keeps cost and availability risk.",
    },
  ]);

  /* ================= ds-blocks ================= */

  const cacheFlow = svg(
    560,
    170,
    tx(60, 30, "Request", { s: 14 }) +
      rc(10, 40, 100, 44) +
      tx(60, 67, "10 requests") +
      ln(110, 62, 190, 62) +
      rc(190, 38, 120, 48, { s: "var(--teal)" }) +
      tx(250, 67, "Cache") +
      ln(310, 52, 400, 30, { s: "var(--teal)" }) +
      rc(400, 8, 150, 44, { f: "var(--teal-dim)", s: "var(--teal)" }) +
      tx(475, 28, "Hit: 9 of 10", { s: 13 }) +
      tx(475, 44, "answered in 1 ms", { s: 12, c: "var(--text-dim)" }) +
      ln(310, 74, 400, 126, { s: "var(--rose)" }) +
      rc(400, 100, 150, 56, { f: "var(--rose-dim)", s: "var(--rose)" }) +
      tx(475, 120, "Miss: 1 of 10", { s: 13 }) +
      tx(475, 137, "1 ms check + 100 ms", { s: 12, c: "var(--text-dim)" }) +
      tx(475, 151, "database read = 101 ms", { s: 12, c: "var(--text-dim)" }),
  );

  const prodCards = (() => {
    const P = [
      ["a", "Kettle", 900, 2],
      ["b", "Toaster", 40, 1],
      ["c", "Flash-sale stock", 700, 1500],
      ["d", "Mug", 35, 0],
      ["e", "Blender", 500, 3],
      ["f", "Whisk", 20, 1],
    ];
    let s = "";
    P.forEach(([id, n, v, c], i) => {
      const x = 8 + (i % 3) * 182,
        y = 8 + Math.floor(i / 3) * 92;
      s += pk(
        id,
        rc(x, y, 172, 82) +
          tx(x + 86, y + 26, n, { s: 14 }) +
          tx(x + 86, y + 49, `${v} views a day`, { s: 12.5, c: "var(--blue-ink)" }) +
          tx(x + 86, y + 68, `changes ${c} times a day`, { s: 12.5, c: "var(--amber-ink)" }),
      );
    });
    return svg(556, 190, s);
  })();

  const timeline = (() => {
    const T = [
      ["t1", 150, "18:00", "evening"],
      ["t2", 290, "02:00", "batch starts"],
      ["t3", 420, "02:40", "batch finishes"],
      ["t4", 530, "03:30", "later"],
    ];
    let s = ln(20, 80, 585, 80, { s: "var(--line-2)", sw: 4 });
    s +=
      `<circle cx="50" cy="80" r="9" fill="var(--amber)"/>` +
      tx(50, 58, "14:00", { s: 13 }) +
      tx(50, 110, "kettle bought", { s: 12, c: "var(--amber-ink)" });
    s +=
      rc(290, 66, 130, 28, { rx: 6, f: "var(--violet-dim, var(--panel))", s: "var(--violet)", sw: 2 }) +
      tx(355, 85, "nightly batch job", { s: 11.5, c: "var(--violet-ink)" });
    T.forEach(
      ([id, x, t, l]) =>
        (s += pk(
          id,
          `<circle cx="${x}" cy="80" r="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` +
            tx(x, 55, t, { s: 13 }) +
            tx(x, 118, l, { s: 12, c: "var(--text-dim)" }),
        )),
    );
    s += tx(
      300,
      150,
      "Recommendations are recomputed from ALL of the day's purchases, then published when the job ends. Not to scale.",
      { s: 11.5, w: 700, c: "var(--text-faint)" },
    );
    return svg(600, 165, s);
  })();

  B.add("ds-blocks", [
    {
      type: "slider",
      q: "Look at the flow for 10 requests. Roughly what is the AVERAGE answer time per request, in milliseconds?",
      fig: cacheFlow,
      min: 0,
      max: 60,
      step: 1,
      ans: 11,
      tol: 4,
      unit: " ms",
      hint: "Nine requests take 1 ms each, one takes 101 ms. Add them up (9 + 101) and divide by 10.",
      why: "(9 × 1 + 1 × 101) ÷ 10 = 11 ms. The slow 10% of misses contribute more than 90% of the total time, so the hit rate decides whether a cache pays off, not the speed of a hit.",
    },
    {
      type: "pick",
      q: "The cache has room for TWO products. Tap the two that benefit most from being cached.",
      fig: prodCards,
      a: ["a", "e"],
      hint: "A cached copy only helps while it is still correct. Compare how often something is read with how often it changes.",
      why: "The kettle (900 views, 2 changes) and the blender (500 views, 3 changes) are read far more often than they change. The flash-sale stock has many views, but it changes about twice as often as it is read, so a cached copy would nearly always be out of date.",
    },
    {
      type: "bug",
      q: "Users change their display name, and the database shows the new name, but the app keeps showing the old one for hours. Which line is faulty?",
      code: [
        "function getName(id):",
        "  if cache.has(id): return cache.get(id)",
        "  row = database.read(id)",
        "  cache.put(id, row); return row.name",
        "function setName(id, newName):",
        "  database.write(id, newName)",
      ],
      a: 5,
      why: "The update writes only to the database. The cache still holds the old row, and reads keep hitting it. The fix is to delete or refresh the cached copy when the data changes. Keeping a cache in step with its source is its classic risk.",
    },
    {
      type: "mcq",
      q: "The table shows four features. If a team adds an extra index to each feature's main table, which feature will it hurt most?",
      fig: table(
        ["Feature", "Reads per second", "Writes per second"],
        [
          ["Product search", "2,000", "5"],
          ["Sensor log", "50", "3,000"],
          ["Profile page", "300", "20"],
          ["Wishlist", "100", "40"],
        ],
      ),
      o: ["Product search", "Sensor log", "Profile page", "Wishlist"],
      a: 1,
      why: "An index speeds up finding data but must be updated on every write. The sensor log writes 3,000 times a second and hardly ever reads, so it would pay the cost without getting the benefit. Read-heavy features like search gain the most.",
    },
    {
      type: "cat",
      q: "Sort each item by whether it is safe to serve from a cache or must be read from the database.",
      buckets: ["Safe to serve from a cache", "Must come from the database"],
      items: [
        ["The weather summary on a travel homepage, refreshed every ten minutes", 0],
        ["How many tickets are left, at the moment a customer clicks Buy", 1],
        ["The like counter on a very popular post", 0],
        ["A customer's account balance just before approving a payment", 1],
        ['The "trending now" list, rebuilt each hour', 0],
        ["Whether a username is already taken at sign-up", 1],
      ],
      why: "A cache is fine when slightly old data does no harm. When a decision depends on the exact current value (last ticket, money, uniqueness) a stale copy can cause a wrong or duplicate action, so read the source of truth.",
    },
    {
      type: "pick",
      q: "A recommendations page is built by a nightly batch job. A customer buys a kettle at 14:00. Tap the earliest moment their recommendations can reflect that purchase.",
      fig: timeline,
      a: "t3",
      why: "The batch job reads all of the day's data and publishes only when it finishes (02:40). Starting at 02:00 is not enough, and the evening is too early. This delay is the price of batch processing: big and efficient, but not real time.",
    },
  ]);

  /* ================= ds-reliability ================= */

  const cascade = (() => {
    const S = [
      ["s1", "Stage 1", "one disk dies,", "node 3 is out", [0, 0, 2, 0, 0]],
      ["s2", "Stage 2", "other 4 nodes", "take its work", [1, 1, 2, 1, 1]],
      ["s3", "Stage 3", "node 1 overloads", "and crashes", [2, 1, 2, 1, 1]],
      ["s4", "Stage 4", "node 5 crashes;", "pages still load", [2, 1, 2, 1, 2]],
      ["s5", "Stage 5", "last nodes fail,", "error page", [2, 2, 2, 2, 2]],
    ];
    const col = ["var(--teal)", "var(--amber)", "var(--rose)"];
    let s = "";
    S.forEach(([id, a, b, c, st], i) => {
      const x = 4 + i * 114;
      s += pk(
        id,
        rc(x, 6, 108, 146) +
          st
            .map((v, k) => `<rect x="${x + 10 + k * 18}" y="18" width="14" height="30" rx="4" fill="${col[v]}"/>`)
            .join("") +
          tx(x + 54, 74, a, { s: 12.5 }) +
          tx(x + 54, 100, b, { s: 10.5, w: 700, c: "var(--text-dim)" }) +
          tx(x + 54, 116, c, { s: 10.5, w: 700, c: "var(--text-dim)" }) +
          tx(x + 54, 140, ["all fine", "busy", "overload", "slow", "OFFLINE"][i], {
            s: 11,
            c: i === 4 ? "var(--rose-ink)" : "var(--text-faint)",
          }),
      );
    });
    s += tx(300, 172, "green = healthy, orange = running hot, red = down", { s: 11.5, w: 700, c: "var(--text-faint)" });
    return svg(590, 182, s);
  })();

  const crashGrid = (() => {
    const marks = { 2: [2], 4: [5], 5: [1, 6], 7: [3], 9: [1, 2, 3, 4, 5, 6], 10: [4] };
    let s = "";
    for (let d = 1; d <= 10; d++) {
      const x = 56 + (d - 1) * 50;
      s += pk(
        "d" + d,
        rc(x, 8, 44, 192, { rx: 8, sw: 2 }) +
          tx(x + 22, 220, "Day " + d, { s: 11.5, c: "var(--text-dim)" }) +
          (marks[d] || [])
            .map((n) => `<g><circle cx="${x + 22}" cy="${14 + n * 28}" r="9" fill="var(--rose)"/></g>`)
            .join(""),
      );
    }
    for (let n = 1; n <= 6; n++) s += tx(46, 18 + n * 28, "Node " + n, { a: "end", s: 11.5, c: "var(--text-dim)" });
    return svg(570, 232, s);
  })();

  const nodesFig = (() => {
    let s = tx(280, 22, "Peak demand: 400 requests per second", { s: 15, c: "var(--amber-ink)" });
    for (let i = 0; i < 5; i++)
      s +=
        rc(30 + i * 100, 40, 90, 56, { s: "var(--teal)" }) +
        tx(75 + i * 100, 64, "Node", { s: 13 }) +
        tx(75 + i * 100, 84, "handles 100", { s: 12, c: "var(--text-dim)" });
    s += tx(280, 124, "Today: five identical nodes share the load evenly", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(540, 134, s);
  })();
  Object.assign(partScope, { cascade, crashGrid, ln, nodesFig, pk, rc, svg, table, tx });
})();

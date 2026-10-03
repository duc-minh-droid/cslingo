/* ===== bank-w-ds-1.js ===== */
/* DS revision bank, second set of visual and varied questions, part 1.
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
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;
  const table = (head, rows) =>
    `<table class="t"><thead><tr>${head.map((h, i) => `<th${i ? ' class="num"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const box2 = (x, y, w, h, a, b, o = {}) =>
    rc(x, y, w, h, o) +
    tx(x + w / 2, y + h / 2 - 3, a, { s: 12 }) +
    tx(x + w / 2, y + h / 2 + 13, b, { s: 11, c: "var(--text-dim)", w: 700 });

  /* ================= ds-why ================= */

  const growthTable = table(
    ["Month", "0", "3", "6", "9", "12"],
    [["Peak requests per second", "100", "200", "400", "800", "1,600"]],
  );

  const designsTable = `<table class="t"><thead><tr><th>Design</th><th>What a Sydney customer sees while the link is down (London paid out £40 a minute ago)</th></tr></thead><tbody><tr><td>X</td><td>Their balance of £100, shown at once, no warning</td></tr><tr><td>Y</td><td>An apology: "We can't show your balance right now"</td></tr><tr><td>Z</td><td>Their balance of £100 at once, tagged "may be out of date"</td></tr></tbody></table>`;

  const splitFig = (() => {
    let s = ln(150, 53, 270, 53, { s: "var(--teal)", sw: 4 });
    s += ln(90, 78, 175, 128, { s: "var(--rose)", d: "7 6" }) + ln(330, 78, 245, 128, { s: "var(--rose)", d: "7 6" });
    s += tx(126, 108, "✗", { c: "var(--rose-ink)", s: 18 }) + tx(294, 108, "✗", { c: "var(--rose-ink)", s: 18 });
    s +=
      pk("london", rc(30, 30, 120, 46) + tx(90, 59, "London")) +
      pk("paris", rc(270, 30, 120, 46) + tx(330, 59, "Paris")) +
      pk("sydney", rc(150, 130, 120, 46) + tx(210, 159, "Sydney"));
    return svg(420, 190, s);
  })();

  const twoServers = (() => {
    let s = tx(280, 16, "Either server can answer every request", { s: 12, c: "var(--text-dim)" });
    s +=
      rc(100, 30, 150, 46, { s: "var(--teal)" }) +
      tx(175, 52, "Server 1", { s: 13 }) +
      tx(175, 68, "up 99% of the time", { s: 11, c: "var(--text-dim)", w: 700 });
    s +=
      rc(310, 30, 150, 46, { s: "var(--teal)" }) +
      tx(385, 52, "Server 2", { s: 13 }) +
      tx(385, 68, "up 99% of the time", { s: 11, c: "var(--text-dim)", w: 700 });
    return svg(560, 90, s);
  })();

  B.add("ds-why", [
    {
      type: "slider",
      q: "Demand doubles every three months (see the table). Today's server copes with 400 requests per second. It will be replaced by one 4 times bigger. Roughly how many extra months does that buy, counting from the moment the old server runs out?",
      fig: growthTable,
      min: 0,
      max: 12,
      step: 1,
      ans: 6,
      tol: 1,
      unit: " months",
      hint: "Going from 400 to 1,600 means doubling twice. Each doubling takes three months.",
      why: "400 is reached at month 6 and 1,600 at month 12, so the 4 times bigger machine buys only 6 months. When demand grows exponentially, buying a bigger machine is a short reprieve, which is why a design that can add machines is needed.",
    },
    {
      type: "multi",
      q: "A bank's data centres in London and Sydney cannot talk to each other. Which designs have chosen availability over consistency? Select all.",
      fig: designsTable,
      o: ["Design X", "Design Y", "Design Z"],
      a: [0, 2],
      why: "X and Z both answer at once from a copy that cannot know about the withdrawal. Tagging Z's answer as possibly out of date is honest, but it is still an answer that may be wrong. Only Y refuses to answer until the copies can agree, which is the consistency choice.",
    },
    {
      type: "pick",
      q: "A fault has cut the red dashed links. Tap the data centres that can still reach each other.",
      fig: splitFig,
      a: ["london", "paris"],
      why: "London and Paris still share a working link, so they can agree between them. Sydney is cut off on its own. Each side must now decide whether to keep answering (availability) or wait to be sure its data is right (consistency).",
    },
    {
      type: "bug",
      q: "A hosting contract is used to promise customers that a single-server service will rarely be down. Which line of the reasoning is wrong?",
      code: [
        "Contract: the server is up 99.9% of the year",
        "99.9% uptime allows about 9 hours of unplanned downtime a year",
        "Planned upgrades: 6 a year, each needs a 2-hour restart",
        "Conclusion: users will lose at most 9 hours of service a year",
      ],
      a: 3,
      why: "0.1% of a year is about 9 hours, but the upgrades add another 6 × 2 = 12 hours, so users lose about 21 hours. With a single server even routine maintenance is downtime, which is one of the limits that pushes designs towards several machines.",
    },
    {
      type: "mcq",
      q: "Two independent servers are each up 99% of the time, and either one can serve users. Roughly how often are BOTH down at the same moment?",
      fig: twoServers,
      o: ["About 0.01% of the time", "About 0.5% of the time", "About 1% of the time", "About 2% of the time"],
      a: 0,
      hint: "Each is down 1 time in 100. Both at once is 1 in 100 of those moments: 1 in 100 × 100.",
      why: "1% of 1% is 0.01%, about 1 minute in a week. Redundancy multiplies small failure chances together, which is its great strength. The sum only works if the faults are independent, which is the catch with shared causes.",
    },
    {
      type: "mcq",
      q: 'A forum shows each member\'s "last seen online" time. One database copy is sometimes about two seconds behind. What is the sensible design call?',
      o: [
        "Serve it: a slightly old last-seen time harms nobody",
        "Make every read wait until all copies agree, to be safe",
        "Remove the copies, because any lag makes them useless",
        "Show an error whenever two copies differ at all",
      ],
      a: 0,
      why: "A two-second-old timestamp does no damage, so availability and speed matter more than perfect agreement. Waiting for agreement or erroring is the right call for balances or the last seat on a flight, not for a harmless label.",
    },
  ]);

  /* ================= ds-blocks ================= */

  const lruFig = (() => {
    const it = [
      ["a", "Item A", "last used 2 s ago", "used 3 times"],
      ["b", "Item B", "last used 9 s ago", "used 40 times"],
      ["c", "Item C", "last used 6 s ago", "used once"],
    ];
    let s = tx(280, 16, "The cache is full. A new item, D, arrives and one item must go.", {
      s: 12,
      c: "var(--text-dim)",
    });
    it.forEach(
      ([id, n, l, u], i) =>
        (s += pk(
          id,
          rc(10 + i * 185, 30, 170, 80, { s: "var(--blue)" }) +
            tx(95 + i * 185, 54, n) +
            tx(95 + i * 185, 74, l, { s: 12, c: "var(--text-dim)", w: 700 }) +
            tx(95 + i * 185, 94, u, { s: 12, c: "var(--text-dim)", w: 700 }),
        )),
    );
    return svg(560, 125, s);
  })();

  const indexFig = table(
    ["id (has an index)", "name", "city", "joined"],
    [
      ["4021", "Priya", "Leeds", "2021"],
      ["4022", "Tom", "Exeter", "2019"],
      ["4023", "Aisha", "Leeds", "2023"],
      ["…", "…", "…", "…"],
    ],
  );

  const hitTable = table(
    ["Cache today", ""],
    [
      ["Share of requests answered by the cache", "90%"],
      ["Time for a cache hit", "2 ms"],
      ["Time for a miss (cache, then database)", "102 ms"],
      ["Option A", "Raise the hit share to 95%"],
      ["Option B", "Cut the hit time to 1 ms"],
    ],
  );

  const coldFig = (() => {
    const v = [50, 50, 50, 950, 500, 200, 100],
      base = 190,
      k = 0.15;
    let s = tx(10, 14, "Database load in requests per second. The cache is restarted, empty, at minute 4.", {
      a: "start",
      s: 12,
      c: "var(--text-dim)",
    });
    v.forEach((d, i) => {
      const x = 30 + i * 74,
        h = d * k;
      s += pk(
        "m" + (i + 1),
        rc(x, base - h, 54, h, { rx: 6, f: "var(--panel)", s: "var(--blue)", sw: 2 }) +
          tx(x + 27, base - h - 6, d, { s: 12 }) +
          tx(x + 27, base + 17, "Min " + (i + 1), { s: 12, c: "var(--text-dim)" }),
      );
    });
    s +=
      ln(20, base - 300 * k, 548, base - 300 * k, { s: "var(--rose)", d: "7 6" }) +
      tx(24, base - 300 * k - 6, "Database copes with 300", { a: "start", s: 12, c: "var(--rose-ink)" });
    return svg(560, 215, s);
  })();

  B.add("ds-blocks", [
    {
      type: "pick",
      q: "The cache evicts the least recently used item. Tap the slot that is thrown out to make room for D.",
      fig: lruFig,
      a: "b",
      why: "Least recently used means the item untouched for the longest time: B, at 9 seconds. It is the most used overall, but the policy bets on recency, not on how popular an item was in the past. Counting uses would be a different policy.",
    },
    {
      type: "multi",
      q: "The customers table has an index on id only (shown). Which lookups does that index speed up? Select all.",
      fig: indexFig,
      o: [
        "Find the customer whose id is 4021",
        "List every customer who lives in Leeds",
        "Fetch customer 77's record at log-in",
        "Count all the customers who joined in 2023",
      ],
      a: [0, 2],
      why: "An index is a shortcut on one field. Looking up by id (a login, a profile page) can jump straight to the record. Finding by city or joining year has no shortcut, so the database still scans the whole table.",
    },
    {
      type: "match",
      q: "Match each symptom to the building block that fixes it.",
      pairs: [
        ["Every visitor makes the server recompute the same expensive result", "Cache"],
        ["Finding one customer in a huge table takes ages", "Index"],
        ["A yearly report must crunch every sale in the company", "Batch job"],
        ["A card-fraud alert must appear within seconds of a payment", "Stream processing"],
      ],
      why: "A cache stores a repeated answer, an index speeds finding by one field, batch processing handles huge jobs when delay is fine, and stream processing reacts to events as they arrive.",
    },
    {
      type: "mcq",
      q: "The cache is nearly always right. Which change lowers the average response time more?",
      fig: hitTable,
      o: [
        "Option A: raise the hit share to 95%",
        "Option B: cut the hit time to 1 ms",
        "They help about equally",
        "Neither: the database alone sets the average",
      ],
      a: 0,
      hint: "A hit costs 2 ms, a miss 102 ms. Where is most of the average time spent?",
      why: "Today the average is 0.9 × 2 + 0.1 × 102 = 12 ms. Option A gives 0.95 × 2 + 0.05 × 102 = 7 ms. Option B gives only 0.9 × 1 + 0.1 × 102 = 11.1 ms. The rare misses dominate, so avoiding them is worth far more than speeding up hits.",
    },
    {
      type: "pick",
      q: "The database copes with 300 requests per second. Tap the LAST minute in which it was overloaded.",
      fig: coldFig,
      a: "m5",
      why: "With the cache empty, nearly every request reaches the database, and it takes time to refill. Minute 4 has 950 and minute 5 has 500, both above 300. By minute 6 the load of 200 is back within its limit. A cache hides load, so losing it can overwhelm the database behind it.",
    },
    {
      type: "order",
      q: "Put the steps in order so that a changed address never leaves a stale copy in the cache for long.",
      items: [
        "A customer changes their address and the app writes it to the database",
        "The app deletes that customer's old cached copy",
        "Later, someone asks for the address and the cache has no entry",
        "The app reads the fresh row from the database",
        "The app stores the fresh row in the cache and returns it",
      ],
      why: "The database stays the source of truth. Deleting the old cached copy forces the next read to miss, fetch the fresh row and refill the cache, so the stale value cannot be served again.",
    },
  ]);

  /* ================= ds-reliability ================= */

  const chainFig = (() => {
    let s = "";
    for (let i = 0; i < 5; i++) {
      s +=
        rc(8 + i * 110, 20, 90, 50, { s: "var(--blue)" }) +
        tx(53 + i * 110, 42, "Service " + (i + 1), { s: 12 }) +
        tx(53 + i * 110, 59, "up 99%", { s: 12, c: "var(--text-dim)", w: 700 });
      if (i < 4) s += ln(100 + i * 110, 45, 116 + i * 110, 45, { sw: 3 });
    }
    s += tx(280, 92, "A request must pass through all five, and each fails independently.", {
      s: 12,
      c: "var(--text-dim)",
    });
    return svg(560, 104, s);
  })();

  const powerFig = (() => {
    let s = ln(80, 110, 110, 110) + ln(190, 110, 230, 40) + ln(190, 110, 230, 110) + ln(190, 110, 230, 180);
    [40, 110, 180].forEach((y) => (s += ln(330, y, 450, 110, { sw: 2, s: "var(--amber)" })));
    s += rc(10, 90, 70, 40) + tx(45, 115, "Users");
    s += pk("router", rc(110, 90, 80, 40) + tx(150, 115, "Router"));
    [20, 90, 160].forEach(
      (y, i) => (s += pk("srv" + (i + 1), rc(230, y, 100, 40) + tx(280, y + 25, "Server " + (i + 1)))),
    );
    s += pk("power", rc(450, 90, 100, 40, { s: "var(--amber)" }) + tx(500, 115, "Power strip"));
    return svg(560, 215, s);
  })();

  const mttrTable = table(
    ["", "How often it fails", "Time to recover each time"],
    [
      ["Service A", "Once every 100 days", "1 day"],
      ["Service B", "Once every 10 days", "1 minute"],
    ],
  );

  B.add("ds-reliability", [
    {
      type: "mcq",
      q: "Each service in the chain is up 99% of the time and any one failing breaks the request. Roughly how often does a request succeed?",
      fig: chainFig,
      o: ["About 99%", "About 95%", "About 85%", "About 60%"],
      a: 1,
      hint: "Each service costs you about one percentage point. There are five of them.",
      why: "0.99 × 0.99 × 0.99 × 0.99 × 0.99 is about 0.95. Dependencies in a chain multiply their failure chances, so a system is less reliable than any single part. This is the opposite of redundancy, which multiplies in your favour.",
    },
    {
      type: "cat",
      q: "A post-mortem lists these events. Sort each one as a fault (a part misbehaves) or a failure (users are affected).",
      buckets: ["Fault", "Failure"],
      items: [
        ["A disk starts returning read errors", 0],
        ['Customers see a "service unavailable" page for 20 minutes', 1],
        ["A bad config file is pushed to one server", 0],
        ["Orders placed during the outage are lost", 1],
        ["A node reboots in a loop", 0],
      ],
      why: "A fault is a component departing from its spec. A failure is the whole service stopping its job for users. Fault tolerance is about stopping faults from turning into failures.",
    },
    {
      type: "pick",
      q: "The team claims three servers means any single failure is survivable. Tap EVERY part whose failure alone would still take the service down.",
      fig: powerFig,
      a: ["router", "power"],
      why: "The three servers are redundant, but they all depend on one router and one power strip. Redundancy only protects you from a part if there are spares of that part. Hidden shared dependencies are the usual way a redundant design still fails.",
    },
    {
      type: "bug",
      q: "Under normal load this works. When the backend slows down, the whole system collapses. Which line turns one slow service into a cascading failure?",
      code: [
        "def call_backend(req):",
        "    for attempt in range(1000):",
        "        resp = backend.send(req)",
        "        if resp.ok: return resp",
        "    raise Error('backend unavailable')",
      ],
      a: 1,
      why: "Up to 1,000 instant retries multiply the load on an already struggling backend. Every client piles on, which makes it slower still. A few retries with growing pauses, plus a limit, keep a fault local.",
    },
    {
      type: "match",
      q: "A dependency is down. Match each to the graceful reaction that keeps the service useful.",
      pairs: [
        ["The product-recommendations service times out", "Show the bestsellers list instead"],
        ["The card provider cannot be reached", "Accept the order and retry the charge later"],
        ["The image-resizing service is down", "Serve the original photo, uncropped"],
        ["The primary database loses power", "Promote a replica to take over"],
      ],
      why: "Fault tolerance is usually a fallback that keeps the core job going: a worse but acceptable answer, a retry queue, or a standby that takes over.",
    },
    {
      type: "mcq",
      q: "Over a whole year, which service is down for less time in total?",
      fig: mttrTable,
      o: [
        "Service B, though it fails ten times more often",
        "Service A, because it fails only a tenth as often",
        "They tie, since both are eventually fixed",
        "Neither: it depends on what caused each fault",
      ],
      a: 0,
      hint: "Count failures in a year, then multiply by the repair time of each.",
      why: "A fails about 3.65 times a year at 1 day each, roughly 3.65 days of downtime. B fails about 36.5 times at 1 minute each, about 36.5 minutes. Fast recovery can matter more than rare failure, which is why teams invest in automatic restarts and failover.",
    },
  ]);

  /* ================= ds-load ================= */

  const tenCalls = (() => {
    let s = "";
    for (let i = 0; i < 10; i++)
      s +=
        rc(8 + i * 54, 14, 46, 38, { s: i === 6 ? "var(--rose)" : "var(--blue)", sw: 2 }) +
        tx(31 + i * 54, 38, "S" + (i + 1), { s: 12 });
    s += tx(280, 76, "Each call is slow 1 time in 100. The page waits for all ten calls.", {
      s: 12,
      c: "var(--text-dim)",
    });
    return svg(560, 88, s);
  })();

  const abTable = table(
    ["Service", "Median", "Average", "Slowest 1% start at"],
    [
      ["A", "80 ms", "120 ms", "2,500 ms"],
      ["B", "150 ms", "170 ms", "600 ms"],
    ],
  );
  Object.assign(partScope, { abTable, box2, ln, pk, rc, svg, table, tenCalls, tx });
})();

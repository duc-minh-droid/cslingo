/* DS revision bank, visual and varied questions, part 1.
   Modules: ds-why, ds-blocks, ds-reliability, ds-load, ds-twitter, ds-scaling, ds-maintain.
   Every question stands on its own; the figure carries the data needed. Numbers checked with node. */
(function () {
  const B = NIC.bank;

  /* ---- tiny SVG helpers (theme tokens only) ---- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${t}</text>`;
  const rc = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx === undefined ? 10 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}"/>`;
  const ln = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}" stroke-linecap="round" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const table = (head, rows) => `<table class="t"><thead><tr>${head.map((h, i) => `<th${i ? ' class="num"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  /* ================= ds-why ================= */

  /* online shop: users -> two load balancers -> three app servers -> ONE database */
  const shopChain = (() => {
    let s = "";
    [60, 130].forEach((y) => [37, 102, 167].forEach((ay) => (s += ln(180, y + 20, 240, ay + 20, { sw: 2 }))));
    [37, 102, 167].forEach((ay) => (s += ln(330, ay + 20, 420, 119, { sw: 2 })));
    s += ln(80, 119, 110, 80, { sw: 2 }) + ln(80, 119, 110, 150, { sw: 2 });
    s += pk("users", rc(10, 99, 70, 40) + tx(45, 124, "Users"));
    s += pk("lb1", rc(110, 60, 70, 40) + tx(145, 85, "Balancer") ) + pk("lb2", rc(110, 130, 70, 40) + tx(145, 155, "Balancer"));
    [37, 102, 167].forEach((ay, i) => (s += pk("app" + (i + 1), rc(240, ay, 90, 40) + tx(285, ay + 25, "App server"))));
    s += pk("db", rc(420, 94, 110, 50) + tx(475, 124, "Database"));
    return svg(550, 215, s);
  })();

  /* demand bars vs one server's capacity */
  const demandBars = (() => {
    const v = [20, 30, 45, 65, 95, 140, 200, 290], base = 190, k = 0.55;
    let s = "";
    v.forEach((d, i) => {
      const x = 36 + i * 64, h = d * k;
      s += pk("w" + (i + 1), rc(x, base - h, 50, h, { rx: 6, f: "var(--blue-dim, var(--panel))", s: "var(--blue)", sw: 2 }) + tx(x + 25, base - h - 6, d, { s: 12 }) + tx(x + 25, base + 17, "Wk " + (i + 1), { s: 12, c: "var(--text-dim)" }));
    });
    s += ln(26, base - 100 * k, 548, base - 100 * k, { s: "var(--rose)", sw: 3, d: "7 6" }) + tx(548, base - 100 * k - 8, "One server copes with 100 requests per second", { a: "end", s: 12, c: "var(--rose-ink)" });
    s += tx(10, 12, "Requests per second at the weekly peak", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(560, 215, s);
  })();

  B.add("ds-why", [
    { type: "pick", q: "A shop's traffic grew, so it added machines at every layer except one. Tap the part whose failure would STILL take the whole shop offline.", fig: shopChain, a: "db",
      why: "Users reach the shop through either balancer and any of three app servers, so each of those can fail without anyone noticing. The single database is the one part with no copy: it is the single point of failure. Adding servers only helped where the work could be shared." },
    { type: "order", q: "Two copies of a bank balance sit in London and Sydney, and the link between them breaks. Put the events in the order that produces a stale read.", hint: "Think: what happens first, what is then missed, and who answers anyway?",
      items: ["The link between the London and Sydney copies is cut", "A London customer withdraws 40, so the London copy drops to 60", "A Sydney customer asks for their balance", "Sydney answers 100 from its own copy, without hearing about the withdrawal"],
      why: "Once the copies cannot talk, an update on one side never reaches the other. If Sydney chooses to stay available it answers from what it has, which is out of date. Choosing consistency would mean refusing to answer until the link is back." },
    { type: "pick", q: "One server copes with 100 requests per second (dashed line). Tap the first week in which it can no longer cope.", fig: demandBars, a: "w6",
      why: "Demand is 95 in week 5, then 140 in week 6, above the line. It grows by roughly 45% a week, so buying a machine twice as big (200) would only last about two more weeks. Rapid growth is why one server stopped being enough." },
    { type: "bug", q: "A team writes: \"We removed our single point of failure by adding a second database server.\" Which line of the plan quietly undoes that claim?",
      code: ["Plan: add a second database server, B, beside server A", "Both servers start with a full copy of the data", "All writes go to A only; B is never told about them", "If A dies, clients are switched to B", "Result: users never lose service or data"], a: 2,
      why: "Server B starts as a copy but never hears about new writes, so after a switch it would be missing everything since the copy. Keeping copies in step is the cost of replication. Without it the second server gives availability only on paper." },
    { type: "mcq", q: "Using the two options in the table, what is the main price the cluster pays for being cheaper and for losing only an eighth of its capacity when one box dies?",
      fig: table(["", "One big server", "Cluster of 8 small"], [["Cores in total", "64", "8 × 8 = 64"], ["Hardware price", "£40k", "8 × £3k = £24k"], ["One machine dies", "100% of capacity lost", "12.5% of capacity lost"]]),
      o: ["The eight machines must be coordinated, and some can be down while others carry on", "Each machine runs programs more slowly than one 8-core server would", "The programs would have to be rewritten in a different language", "Every request must be answered by all eight machines at once"], a: 0,
      why: "Cheap commodity machines scale and fail gently, but now data copies, ordering and partial failures have to be managed. That coordination is the trade-off behind the second lecture trade-off (one big machine versus many cheap ones)." },
    { type: "match", q: "Each change fixed one problem for a growing app. Match it to the NEW problem it brings.",
      pairs: [["Keep a second copy of the database on another machine", "The two copies can disagree for a while"], ["Spread requests over ten identical web servers", "A user's session must be found on whichever one answers"], ["Replace a rack of big servers with hundreds of cheap ones", "Something is always broken somewhere, so partial failure is normal"], ["Stay on one very large server", "Its price keeps climbing and one fault stops everything"]],
      why: "No scaling step is free: copies bring consistency questions, spreading work brings shared state, cheap machines bring routine partial failure, and one big box keeps cost and availability risk." },
  ]);

  /* ================= ds-blocks ================= */

  const cacheFlow = svg(560, 170,
    tx(60, 30, "Request", { s: 14 }) + rc(10, 40, 100, 44) + tx(60, 67, "10 requests")
    + ln(110, 62, 190, 62) + rc(190, 38, 120, 48, { s: "var(--teal)" }) + tx(250, 67, "Cache")
    + ln(310, 52, 400, 30, { s: "var(--teal)" }) + rc(400, 8, 150, 44, { f: "var(--teal-dim)", s: "var(--teal)" }) + tx(475, 28, "Hit: 9 of 10", { s: 13 }) + tx(475, 44, "answered in 1 ms", { s: 12, c: "var(--text-dim)" })
    + ln(310, 74, 400, 126, { s: "var(--rose)" }) + rc(400, 100, 150, 56, { f: "var(--rose-dim)", s: "var(--rose)" }) + tx(475, 120, "Miss: 1 of 10", { s: 13 }) + tx(475, 137, "1 ms check + 100 ms", { s: 12, c: "var(--text-dim)" }) + tx(475, 151, "database read = 101 ms", { s: 12, c: "var(--text-dim)" }));

  const prodCards = (() => {
    const P = [["a", "Kettle", 900, 2], ["b", "Toaster", 40, 1], ["c", "Flash-sale stock", 700, 1500], ["d", "Mug", 35, 0], ["e", "Blender", 500, 3], ["f", "Whisk", 20, 1]];
    let s = "";
    P.forEach(([id, n, v, c], i) => {
      const x = 8 + (i % 3) * 182, y = 8 + Math.floor(i / 3) * 92;
      s += pk(id, rc(x, y, 172, 82) + tx(x + 86, y + 26, n, { s: 14 }) + tx(x + 86, y + 49, `${v} views a day`, { s: 12.5, c: "var(--blue-ink)" }) + tx(x + 86, y + 68, `changes ${c} times a day`, { s: 12.5, c: "var(--amber-ink)" }));
    });
    return svg(556, 190, s);
  })();

  const timeline = (() => {
    const T = [["t1", 150, "18:00", "evening"], ["t2", 290, "02:00", "batch starts"], ["t3", 420, "02:40", "batch finishes"], ["t4", 530, "03:30", "later"]];
    let s = ln(20, 80, 585, 80, { s: "var(--line-2)", sw: 4 });
    s += `<circle cx="50" cy="80" r="9" fill="var(--amber)"/>` + tx(50, 58, "14:00", { s: 13 }) + tx(50, 110, "kettle bought", { s: 12, c: "var(--amber-ink)" });
    s += rc(290, 66, 130, 28, { rx: 6, f: "var(--violet-dim, var(--panel))", s: "var(--violet)", sw: 2 }) + tx(355, 85, "nightly batch job", { s: 11.5, c: "var(--violet-ink)" });
    T.forEach(([id, x, t, l]) => (s += pk(id, `<circle cx="${x}" cy="80" r="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` + tx(x, 55, t, { s: 13 }) + tx(x, 118, l, { s: 12, c: "var(--text-dim)" }))));
    s += tx(300, 150, "Recommendations are recomputed from ALL of the day's purchases, then published when the job ends. Not to scale.", { s: 11.5, w: 700, c: "var(--text-faint)" });
    return svg(600, 165, s);
  })();

  B.add("ds-blocks", [
    { type: "slider", q: "Look at the flow for 10 requests. Roughly what is the AVERAGE answer time per request, in milliseconds?", fig: cacheFlow, min: 0, max: 60, step: 1, ans: 11, tol: 4, unit: " ms",
      hint: "Nine requests take 1 ms each, one takes 101 ms. Add them up (9 + 101) and divide by 10.",
      why: "(9 × 1 + 1 × 101) ÷ 10 = 11 ms. The slow 10% of misses contribute more than 90% of the total time, so the hit rate decides whether a cache pays off, not the speed of a hit." },
    { type: "pick", q: "The cache has room for TWO products. Tap the two that benefit most from being cached.", fig: prodCards, a: ["a", "e"],
      hint: "A cached copy only helps while it is still correct. Compare how often something is read with how often it changes.",
      why: "The kettle (900 views, 2 changes) and the blender (500 views, 3 changes) are read far more often than they change. The flash-sale stock has many views, but it changes about twice as often as it is read, so a cached copy would nearly always be out of date." },
    { type: "bug", q: "Users change their display name, and the database shows the new name, but the app keeps showing the old one for hours. Which line is faulty?",
      code: ["function getName(id):", "  if cache.has(id): return cache.get(id)", "  row = database.read(id)", "  cache.put(id, row); return row.name", "function setName(id, newName):", "  database.write(id, newName)"], a: 5,
      why: "The update writes only to the database. The cache still holds the old row, and reads keep hitting it. The fix is to delete or refresh the cached copy when the data changes. Keeping a cache in step with its source is its classic risk." },
    { type: "mcq", q: "The table shows four features. If a team adds an extra index to each feature's main table, which feature will it hurt most?",
      fig: table(["Feature", "Reads per second", "Writes per second"], [["Product search", "2,000", "5"], ["Sensor log", "50", "3,000"], ["Profile page", "300", "20"], ["Wishlist", "100", "40"]]),
      o: ["Product search", "Sensor log", "Profile page", "Wishlist"], a: 1,
      why: "An index speeds up finding data but must be updated on every write. The sensor log writes 3,000 times a second and hardly ever reads, so it would pay the cost without getting the benefit. Read-heavy features like search gain the most." },
    { type: "cat", q: "Sort each item by whether it is safe to serve from a cache or must be read from the database.", buckets: ["Safe to serve from a cache", "Must come from the database"],
      items: [["The weather summary on a travel homepage, refreshed every ten minutes", 0], ["How many tickets are left, at the moment a customer clicks Buy", 1], ["The like counter on a very popular post", 0], ["A customer's account balance just before approving a payment", 1], ["The \"trending now\" list, rebuilt each hour", 0], ["Whether a username is already taken at sign-up", 1]],
      why: "A cache is fine when slightly old data does no harm. When a decision depends on the exact current value (last ticket, money, uniqueness) a stale copy can cause a wrong or duplicate action, so read the source of truth." },
    { type: "pick", q: "A recommendations page is built by a nightly batch job. A customer buys a kettle at 14:00. Tap the earliest moment their recommendations can reflect that purchase.", fig: timeline, a: "t3",
      why: "The batch job reads all of the day's data and publishes only when it finishes (02:40). Starting at 02:00 is not enough, and the evening is too early. This delay is the price of batch processing: big and efficient, but not real time." },
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
      s += pk(id, rc(x, 6, 108, 146) + st.map((v, k) => `<rect x="${x + 10 + k * 18}" y="18" width="14" height="30" rx="4" fill="${col[v]}"/>`).join("")
        + tx(x + 54, 74, a, { s: 12.5 }) + tx(x + 54, 100, b, { s: 10.5, w: 700, c: "var(--text-dim)" }) + tx(x + 54, 116, c, { s: 10.5, w: 700, c: "var(--text-dim)" })
        + tx(x + 54, 140, ["all fine", "busy", "overload", "slow", "OFFLINE"][i], { s: 11, c: i === 4 ? "var(--rose-ink)" : "var(--text-faint)" }));
    });
    s += tx(300, 172, "green = healthy, orange = running hot, red = down", { s: 11.5, w: 700, c: "var(--text-faint)" });
    return svg(590, 182, s);
  })();

  const crashGrid = (() => {
    const marks = { 2: [2], 4: [5], 5: [1, 6], 7: [3], 9: [1, 2, 3, 4, 5, 6], 10: [4] };
    let s = "";
    for (let d = 1; d <= 10; d++) {
      const x = 56 + (d - 1) * 50;
      s += pk("d" + d, rc(x, 8, 44, 192, { rx: 8, sw: 2 }) + tx(x + 22, 220, "Day " + d, { s: 11.5, c: "var(--text-dim)" })
        + (marks[d] || []).map((n) => `<g><circle cx="${x + 22}" cy="${14 + n * 28}" r="9" fill="var(--rose)"/></g>`).join(""));
    }
    for (let n = 1; n <= 6; n++) s += tx(46, 18 + n * 28, "Node " + n, { a: "end", s: 11.5, c: "var(--text-dim)" });
    return svg(570, 232, s);
  })();

  const nodesFig = (() => {
    let s = tx(280, 22, "Peak demand: 400 requests per second", { s: 15, c: "var(--amber-ink)" });
    for (let i = 0; i < 5; i++) s += rc(30 + i * 100, 40, 90, 56, { s: "var(--teal)" }) + tx(75 + i * 100, 64, "Node", { s: 13 }) + tx(75 + i * 100, 84, "handles 100", { s: 12, c: "var(--text-dim)" });
    s += tx(280, 124, "Today: five identical nodes share the load evenly", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(540, 134, s);
  })();

  B.add("ds-reliability", [
    { type: "pick", q: "Each panel shows five nodes sharing a service as one failure leads to the next. Tap the stage at which the FAULT has become a FAILURE of the service.", fig: cascade, a: "s5",
      why: "A fault is one component misbehaving. In stages 1 to 4 users are still being served, even if slowly. Only in stage 5 does the system as a whole stop providing the service. The earlier stages show how a cascade of faults can march toward a failure." },
    { type: "cat", q: "Sort each protective measure by the kind of fault it mainly guards against.", buckets: ["Hardware faults", "Software faults", "Human mistakes"],
      items: [["Mirror every disk so a copy survives a dead drive", 0], ["Fit two power supplies per machine", 0], ["Release a new version to 5% of servers before the rest", 1], ["Cap the memory a runaway process can use", 1], ["Rehearse risky operations on a staging copy first", 2], ["Keep a one-click rollback for configuration changes", 2]],
      why: "Redundant parts handle independent hardware faults. Software bugs hit many nodes at once, so you limit their spread (staged release, resource limits). People will make mistakes, so give them safe places to practise and an easy way to undo." },
    { type: "mcq", q: "The service must still cope with peak demand if ANY TWO nodes are down at once. How many nodes of this size does it need in total?", fig: nodesFig,
      o: ["5", "6", "8", "10"], a: 1, hint: "Four nodes cover 400 (4 × 100). Then add two more as spare.",
      why: "400 ÷ 100 = 4 nodes must be working. To survive two failures you keep two spare, so 4 + 2 = 6. Five nodes would still manage one loss, but a second would overload the rest and could start a cascade." },
    { type: "bug", q: "A migration runbook is meant to limit the damage of a mistake or a bug. Which step makes the plan dangerous?",
      code: ["1. Copy last night's production data to a staging database", "2. Run the new migration script on staging and check the results", "3. Run the same script on production at 14:00 on Friday, in all regions at once", "4. Keep the pre-migration backup ready to restore"], a: 2,
      why: "Staging and a backup are good. Hitting every region at once means a bug in the script (or a human slip) is correlated across the whole system with nobody left untouched. Doing one region first, off-peak, would turn a possible failure into a contained fault." },
    { type: "order", q: "Put the steps of a staged rollout in order, so a software bug stays a fault and does not become a failure.",
      items: ["Ship the new build to 1 of 20 servers", "Compare the new server's error rate with the other 19", "Spot errors rising on the updated server only", "Roll that server back before any others are updated", "Fix the bug and start the rollout again"],
      why: "Software faults tend to appear on every node that runs the same code. Updating a small slice first, and comparing it with the rest, keeps 19 servers healthy while you find out. Rolling out to all 20 at once would risk a total failure." },
    { type: "pick", q: "A red dot is a node crashing. Two pictures of a cluster for 10 days: tap the day that shows a CORRELATED fault, a software problem rather than worn-out hardware.", fig: crashGrid, a: "d9",
      why: "Hardware faults are mostly independent: a disk here, a power supply there, scattered over time. On day 9 all six nodes died together, which points to something they share, such as the same buggy software. Day 5 (two dots) is only what chance can produce." },
  ]);

  /* ================= ds-load ================= */

  const hist = (() => {
    const c = [20, 35, 25, 10, 6, 4], lab = ["0–100", "100–200", "200–300", "300–400", "400–500", "500+"], base = 175;
    let s = "";
    c.forEach((n, i) => {
      const x = 40 + i * 88, h = n * 3.6;
      s += pk("b" + (i + 1), rc(x, base - h, 76, h, { rx: 6, f: "var(--blue-dim, var(--panel))", s: "var(--blue)", sw: 2 }) + tx(x + 38, base - h - 6, n, { s: 13 }) + tx(x + 38, base + 18, lab[i], { s: 12, c: "var(--text-dim)" }));
    });
    s += tx(300, 214, "Response time in ms. Bar height = number of requests (100 in total)", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(580, 224, s);
  })();

  const kneeChart = (() => {
    const L = [200, 400, 600, 800, 1000], p50 = [40, 42, 45, 70, 150], p99 = [120, 130, 160, 420, 780];
    const X = (v) => 70 + (v - 200) * 0.6, Y = (v) => 200 - v * 0.22;
    let s = ln(60, 200, 540, 200, { s: "var(--line)", sw: 2 }) + ln(60, 20, 60, 200, { s: "var(--line)", sw: 2 });
    [0, 200, 400, 600, 800].forEach((v) => (s += tx(52, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-faint)" })));
    s += ln(60, Y(200), 540, Y(200), { s: "var(--rose)", sw: 2.5, d: "7 6" }) + tx(540, Y(200) - 6, "Promise: p99 under 200 ms", { a: "end", s: 12, c: "var(--rose-ink)" });
    s += `<polyline points="${L.map((l, i) => `${X(l)},${Y(p50[i])}`).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="3"/>`;
    s += `<polyline points="${L.map((l, i) => `${X(l)},${Y(p99[i])}`).join(" ")}" fill="none" stroke="var(--amber)" stroke-width="3"/>`;
    L.forEach((l, i) => (s += tx(X(l), 220, l, { s: 11.5, c: "var(--text-dim)" }) + pk("l" + l, `<circle cx="${X(l)}" cy="${Y(p99[i])}" r="11" fill="var(--panel)" stroke="var(--amber)" stroke-width="3"/>`)));
    s += tx(300, 240, "Load: requests per second", { s: 12, w: 700, c: "var(--text-faint)" }) + tx(80, 14, "orange line = p99 (tap its dots)", { a: "start", s: 12, c: "var(--amber-ink)" }) + tx(330, 14, "green line = p50", { a: "start", s: 12, c: "var(--teal-ink)" });
    return svg(560, 248, s);
  })();

  B.add("ds-load", [
    { type: "pick", q: "100 requests were timed, as shown. Tap the bar that contains the p95 response time.", fig: hist, a: "b5",
      hint: "Add the bars from the fast end until you have passed 95 requests: 20, 55, 80, 90, ...",
      why: "Running totals are 20, 55, 80, 90 and 96. The 95th-fastest request falls in the 400–500 ms bar. The median (50th) is in the 100–200 ms bar, so a typical visit looks fine while one in twenty waits over 400 ms." },
    { type: "multi", q: "The service promises that 99% of requests are answered in under 500 ms. On which days was the promise broken?",
      fig: table(["Day", "p50", "p99"], [["Mon", "80 ms", "400 ms"], ["Tue", "85 ms", "460 ms"], ["Wed", "90 ms", "620 ms"], ["Thu", "85 ms", "480 ms"], ["Fri", "100 ms", "510 ms"]]),
      o: ["Mon", "Tue", "Wed", "Thu", "Fri"], a: [2, 4],
      why: "A promise about 99% of requests is a promise about p99. Wednesday (620) and Friday (510) are over 500 ms. The medians all look healthy, which is exactly why a median alone can hide a broken promise." },
    { type: "cat", q: "A dashboard for an online shop lists these items. Sort each into what goes IN to the system (load) or how the system RESPONDS (performance).", buckets: ["Load parameter", "Performance measure"],
      items: [["Orders placed per minute", 0], ["Time from tapping Pay to seeing the confirmation", 1], ["Average number of items in a basket", 0], ["Share of requests that are searches rather than purchases", 0], ["99th-percentile checkout time", 1], ["Time to process one night's two million orders", 1]],
      why: "Load parameters describe what you put on the system, and they differ by application. Performance measures describe how it copes: response time for interactive services, processing time or records per second for data jobs." },
    { type: "bug", q: "A load-test script ends by announcing whether users will be happy. Which line judges them in a way that can hide slow experiences?",
      code: ["times = run_load_test(users=500, duration=60)", "avg = sum(times) / len(times)", "print('average response:', avg)", "if avg < 300: print('Users are happy')", "else: print('Too slow')"], a: 3,
      why: "An average blends fast and slow requests: 95 requests at 100 ms and 5 at 2,000 ms still average under 300 ms, while 5 users in 100 wait two seconds. Judge happiness with a percentile such as p95 or p99 instead." },
    { type: "order", q: "Put the steps in order for reading the p90 response time from 50 measurements.",
      items: ["Collect all 50 response times", "Sort them from fastest to slowest", "Count along to 90% of the list (the 45th value)", "Read the response time at that position"],
      why: "A percentile is a position in the sorted data, so the data must be sorted first. For 50 values the 45th is 90% of the way along, and 10% of requests (5 of them) are slower than it." },
    { type: "pick", q: "A load test produced these curves. Tap the HIGHEST load that still keeps p99 inside the promise (the dashed line).", fig: kneeChart, a: "l600",
      why: "At 600 requests per second p99 is 160 ms, under the 200 ms promise. At 800 it jumps to 420 ms. The median barely moves at 800, which shows why the tail, not the middle, tells you when the system stops coping." },
  ]);

  /* ================= ds-twitter ================= */

  const accounts = (() => {
    const A = [["a", "@harbour_news", "500,000", "60"], ["b", "@famous_chef", "20 million", "1"], ["c", "@gig_venue", "3 million", "5"], ["d", "@neighbour_ann", "900", "200"]];
    let s = "";
    A.forEach(([id, n, f, p], i) => {
      const x = 8 + (i % 2) * 280, y = 8 + Math.floor(i / 2) * 88;
      s += pk(id, rc(x, y, 268, 78) + tx(x + 134, y + 26, n, { s: 14 }) + tx(x + 134, y + 48, `${f} followers`, { s: 12.5, c: "var(--blue-ink)" }) + tx(x + 134, y + 66, `${p} posts a day`, { s: 12.5, c: "var(--amber-ink)" }));
    });
    return svg(556, 182, s);
  })();

  const cross = (() => {
    const X = (r) => 60 + r * 110, Y = (v) => 215 - v * 0.5;
    let s = pk("left", `<rect x="${X(0)}" y="12" width="${X(1) - X(0)}" height="203" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/>` + tx((X(0) + X(1)) / 2, 34, "Zone 1", { s: 12, c: "var(--text-dim)" }))
      + pk("right", `<rect x="${X(1)}" y="12" width="${X(4) - X(1)}" height="203" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/>` + tx((X(1) + X(4)) / 2, 34, "Zone 2", { s: 12, c: "var(--text-dim)" }));
    s += ln(60, 215, 500, 215, { s: "var(--line-2)", sw: 2 }) + ln(60, 12, 60, 215, { s: "var(--line-2)", sw: 2 });
    [0, 1, 2, 3, 4].forEach((r) => (s += tx(X(r), 233, r, { s: 11.5, c: "var(--text-dim)" })));
    [0, 100, 200, 300, 400].forEach((v) => (s += tx(52, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-faint)" })));
    s += ln(X(0), Y(100), X(4), Y(104), { s: "var(--blue)", sw: 4 }) + ln(X(0), Y(1), X(4), Y(401), { s: "var(--amber)", sw: 4 });
    s += tx(X(3) - 10, Y(104) - 12, "Fan-out on write", { s: 12.5, c: "var(--blue-ink)" }) + tx(X(1.5), Y(250), "Merge on read", { s: 12.5, c: "var(--amber-ink)" });
    s += tx(280, 252, "Timeline reads per post", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(560, 262, s);
  })();

  B.add("ds-twitter", [
    { type: "pick", q: "A hybrid system wants to know which account will cost the MOST fan-out writes in a day (writes = followers × posts). Tap it.", fig: accounts, a: "a",
      hint: "Multiply each card. Use millions: 0.5 × 60, 20 × 1, 3 × 5, and 900 × 200 is well under a million.",
      why: "The news account makes 0.5 million × 60 = 30 million writes a day, more than the chef (20 million × 1 = 20 million) and the venue (3 million × 5 = 15 million). Cost depends on followers AND how often someone posts, not on fame alone." },
    { type: "order", q: "In a hybrid timeline, Alice follows ordinary friends and one celebrity. Put in order what happens when she opens the app.",
      items: ["Read Alice's pre-built timeline cache (her friends' posts)", "Look up which celebrity accounts she follows", "Fetch those celebrities' latest posts directly", "Merge both lists by time", "Show the finished timeline"],
      why: "Ordinary posts were fanned out when written, so they are already waiting in her cache. Celebrity posts were never copied (too many writes), so they are fetched at read time and merged in." },
    { type: "pick", q: "Every account has about 100 followers and follows about 100 accounts. The chart shows total operations per post as the number of timeline reads per post changes. Tap the zone where fan-out on write does LESS work.", fig: cross, a: "right",
      why: "Fan-out on write pays about 100 extra writes up front, then each read is one cheap lookup. Merge on read is nearly free to post, but every read costs about 100 lookups. The lines cross at one read per post; to the right of that, where posts are read often, fan-out on write wins." },
    { type: "bug", q: "Opening the timeline is very slow for people who follow thousands of accounts. Which line does far more work than the screen needs?",
      code: ["function timeline(user):", "  result = []", "  for friend in following(user):", "    result += all_tweets_ever_by(friend)", "  return newest_50(sort_by_time(result))"], a: 3,
      why: "The screen shows only 50 posts, yet this line downloads every tweet each friend ever wrote before sorting. Fetching just each friend's latest 50 would give the same answer with a fraction of the work. Even then, merge-on-read costs grow with the number followed." },
    { type: "cat", q: "Which design is each symptom evidence of?", buckets: ["Merge on read", "Fan-out on write"],
      items: [["Opening a timeline is slow for someone who follows 5,000 accounts", 0], ["One post by a huge account triggers millions of cache writes", 1], ["The same tweet is stored again in every follower's mailbox", 1], ["Posting is one cheap insert, however many followers there are", 0], ["Opening a timeline is a single cheap lookup", 1], ["Reading cost grows with the number of accounts you follow", 0]],
      why: "Merge on read keeps writes trivial and pushes the work to every reader. Fan-out on write does the work once per post, in every follower's mailbox, so reads are cheap but celebrities are costly to post for." },
    { type: "multi", q: "A team runs fan-out on write. Which changes to their app would make that design look WORSE? Select all that apply.",
      o: ["Average followers per account rises from 75 to 5,000", "People open their timeline once a week instead of daily", "People start following 2,000 accounts instead of 200", "Posting rate doubles overnight"], a: [0, 1, 3],
      why: "More followers, or more posts, means more writes. Fewer timeline reads means the up-front work is rewarded less often. Following more accounts makes MERGE-on-read slower, but fan-out on write already reads a single mailbox, so it is not hurt." },
  ]);

  /* ================= ds-scaling ================= */

  const hotNodes = (() => {
    const L = [["N1", 20], ["N2", 25], ["N3", 95], ["N4", 15]], base = 160;
    let s = "";
    L.forEach(([n, v], i) => {
      const x = 40 + i * 132, h = v * 1.3, c = v > 80 ? "var(--rose)" : "var(--blue)";
      s += pk(n.toLowerCase(), rc(x, 20, 110, 150, { rx: 12, sw: 2, f: "var(--bg-2)" }) + rc(x + 20, base - h + 10, 70, h, { rx: 6, s: c, f: v > 80 ? "var(--rose-dim)" : "var(--blue-dim, var(--panel))", sw: 2 }) + tx(x + 55, base - h + 4, v + "% busy", { s: 12.5 }) + tx(x + 55, 186, n, { s: 14 }));
    });
    s += tx(280, 208, "Each node owns a fixed set of accounts and only serves those", { s: 11.5, w: 700, c: "var(--text-faint)" });
    return svg(560, 218, s);
  })();

  const ceiling = (() => {
    const d = (m) => 10 * Math.pow(1.15, m), X = (m) => 50 + m * 20, Y = (v) => 195 - v * 0.62;
    let s = ln(50, 195, 540, 195, { s: "var(--line-2)", sw: 2 }) + ln(50, 12, 50, 195, { s: "var(--line-2)", sw: 2 });
    s += ln(50, Y(100), 540, Y(100), { s: "var(--rose)", sw: 2.5, d: "7 6" }) + tx(540, Y(100) - 6, "Biggest machine you can buy", { a: "end", s: 12, c: "var(--rose-ink)" });
    let pts = ""; for (let m = 0; m <= 24; m++) pts += `${X(m)},${Y(d(m))} `;
    s += `<polyline points="${pts}" fill="none" stroke="var(--amber)" stroke-width="3.5"/>`;
    [6, 12, 18, 24].forEach((m) => (s += tx(X(m), 214, "Month " + m, { s: 11.5, c: "var(--text-dim)" }) + pk("m" + m, `<circle cx="${X(m)}" cy="${Y(d(m))}" r="11" fill="var(--panel)" stroke="var(--amber)" stroke-width="3"/>`)));
    s += tx(30, 18, "Demand", { a: "end", s: 11.5, c: "var(--text-dim)" });
    return svg(560, 224, s);
  })();

  const shards = (() => {
    let s = "";
    [["M1", "customers A–F"], ["M2", "customers G–L"], ["M3", "customers M–R"], ["M4", "customers S–Z"]].forEach(([m, d], i) => {
      const x = 12 + i * 136, dead = i === 2;
      s += rc(x, 12, 124, 100, { s: dead ? "var(--rose)" : "var(--teal)", f: dead ? "var(--rose-dim)" : "var(--panel)" }) + tx(x + 62, 36, m, { s: 15 }) + tx(x + 62, 62, "own CPU, RAM, disk", { s: 11, w: 700, c: "var(--text-dim)" }) + tx(x + 62, 88, d, { s: 12 });
      if (dead) s += ln(x + 6, 18, x + 118, 106, { s: "var(--rose)", sw: 4 }) + ln(x + 118, 18, x + 6, 106, { s: "var(--rose)", sw: 4 });
    });
    s += tx(278, 136, "No copies: each customer's data is stored on exactly one machine", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(556, 146, s);
  })();

  B.add("ds-scaling", [
    { type: "pick", q: "A team added three machines to a cluster to cut slow pages, but users are still waiting. Tap the node that is holding the cluster back.", fig: hotNodes, a: "n3",
      why: "Scaling out only helps if the work is spread across the machines. N3 runs at 95% while the other three sit mostly idle, so extra machines are wasted. Balancing the load (or splitting the hot accounts) is part of the price of scaling out." },
    { type: "slider", q: "The table lists what one machine costs. You need 64 cores in total. Roughly how many times MORE does a single 64-core machine cost than sixteen 4-core machines?",
      fig: table(["Machine", "Cores", "Price"], [["Small", "4", "£1k"], ["Medium", "8", "£2.2k"], ["Large", "16", "£5k"], ["Extra large", "32", "£12k"], ["Huge", "64", "£30k"]]),
      min: 1, max: 4, step: 0.5, ans: 2, tol: 0.5, unit: "×", hint: "Sixteen small machines cost 16 × £1k = £16k. Compare that with £30k.",
      why: "£30k against £16k is nearly double. Price climbs faster than power, so scaling up gets expensive, and eventually there is no bigger machine to buy at all." },
    { type: "multi", q: "A team moves its web tier from 2 big machines to 10 identical small ones. Which NEW problems must it now handle? Select all that apply.",
      o: ["Spreading requests across the machines", "Keeping a user's login or basket available whichever machine answers", "Carrying on when some machines are down and others are fine", "The ten machines now share one pool of memory", "Making copies of data agree with each other"], a: [0, 1, 2, 4],
      why: "Shared-nothing machines each have their own CPU, memory and disk, so the work, the state and the data copies must be coordinated, and partial failure is normal. They do NOT share memory: that is the shared-memory, scale-up design." },
    { type: "bug", q: "This code runs on each of 10 web servers behind a load balancer. Users report that their basket sometimes appears empty. Which line is the root cause?",
      code: ["# runs on every web server", "baskets = {}   # kept in this server's memory", "def add_item(user, item):", "    baskets.setdefault(user, []).append(item)", "def show_basket(user): return baskets.get(user, [])"], a: 1,
      why: "Each server keeps its own baskets. A user's next request may land on a different server that never saw the item. In a scale-out design, shared state belongs in a store all servers use, so any machine can answer." },
    { type: "pick", q: "Demand for an app grows as shown. Tap the first marked month in which demand is above the biggest single machine you could ever buy (dashed line).", fig: ceiling, a: "m18",
      why: "Month 12 is about 54, month 18 about 124, past the ceiling of 100. Scaling up has a hard limit; scaling out has none, because you can keep adding machines. That ceiling is why a rapidly growing service cannot rely on one ever-bigger server." },
    { type: "mcq", q: "Machine M3 loses power in this shared-nothing cluster. What do users experience?", fig: shards,
      o: ["Only customers stored on M3 get errors; everyone else is served normally", "The whole shop goes offline, because any one lost machine stops a cluster", "Nothing at all, because the other machines take over M3's customers", "Customers on M3 are served by the others, only a little more slowly"], a: 0,
      why: "With no copies of the data, M3's customers have nowhere else to be served from: a partial failure. The other three machines carry on. Scaling out gives you smaller failures only; surviving them needs replication on top." },
  ]);

  /* ================= ds-maintain ================= */

  const files = (() => {
    const F = [["cart", "cart.js", "builds its own price text"], ["email", "email.js", "builds its own price text"], ["invoice", "invoice.js", "builds its own price text"], ["pricing", "pricing.js", "defines formatPrice()"], ["checkout", "checkout.js", "calls formatPrice()"]];
    let s = "";
    F.forEach(([id, n, d], i) => {
      const x = 8 + (i % 3) * 182, y = 8 + Math.floor(i / 3) * 70;
      s += pk(id, rc(x, y, 172, 60) + tx(x + 86, y + 24, n, { s: 14 }) + tx(x + 86, y + 44, d, { s: 12, c: "var(--text-dim)" }));
    });
    return svg(556, 150, s);
  })();

  const hours = (() => {
    const H = [["New features", 10, "var(--teal)"], ["Fixing bugs", 8, "var(--rose)"], ["Working out how old code works", 14, "var(--violet)"], ["Manual deploys and restarts", 8, "var(--amber)"]];
    let s = "";
    H.forEach(([n, v, c], i) => (s += tx(10, 30 + i * 36, n, { a: "start", s: 12.5 }) + `<rect x="230" y="${14 + i * 36}" width="${v * 20}" height="26" rx="6" fill="${c}"/>` + tx(238 + v * 20, 33 + i * 36, v + " h", { a: "start", s: 12.5 })));
    s += tx(280, 164, "Engineer-hours per week (40 in total)", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(560, 174, s);
  })();

  const links = (() => {
    const mesh = [[60, 20], [110, 75], [90, 140], [30, 140], [10, 75]].map(([x, y]) => [x + 10, y + 5]);
    let s = "";
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) s += ln(mesh[i][0], mesh[i][1], mesh[j][0], mesh[j][1], { sw: 2, s: "var(--rose)" });
    mesh.forEach(([x, y], i) => (s += `<circle cx="${x}" cy="${y}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` + tx(x, y + 5, "ABCDE"[i], { s: 13 })));
    s += tx(70, 185, "Design A", { s: 14 });
    const chain = [0, 1, 2, 3, 4].map((i) => [260 + i * 62, 80]);
    for (let i = 0; i < 4; i++) s += ln(chain[i][0], 80, chain[i + 1][0], 80, { sw: 3, s: "var(--teal)" });
    chain.forEach(([x, y], i) => (s += `<circle cx="${x}" cy="${y}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` + tx(x, y + 5, "ABCDE"[i], { s: 13 })));
    s += tx(384, 185, "Design B", { s: 14 });
    return svg(560, 198, s);
  })();

  B.add("ds-maintain", [
    { type: "pick", q: "The business wants every price shown as \"GBP 4.50\" instead of \"£4.50\". Tap EVERY file an engineer must edit.", fig: files, a: ["cart", "email", "invoice", "pricing"],
      why: "Three files each format prices their own way, so each needs the change, plus pricing.js where the shared helper lives. checkout.js only calls formatPrice(), so it is fixed for free. A good abstraction keeps a change in one place, which is evolvability; copy-paste is accidental complexity." },
    { type: "bug", q: "A deploy script should not depend on any particular machine. Which line breaks that rule?",
      code: ["for s in servers_from_registry('web'):", "    drain_traffic(s)", "    deploy(s, build)", "    wait_until_healthy(s)", "restart('10.0.4.17')   # the box nobody put in the registry"], a: 4,
      why: "Everything else asks the registry which machines exist, so adding or retiring servers needs no script change. The hard-coded address depends on one machine that only one person remembers. Operability means no dependence on individual machines." },
    { type: "mcq", q: "The chart shows where one team's time goes. Which improvement attacks the biggest drain?", fig: hours,
      o: ["Clean up tangled code and write down the architecture", "Script deploys and restarts so tools can run them", "Hide the payment provider behind one interface so it can be swapped", "Add dashboards that show what the system is doing"], a: 0,
      why: "The biggest bar, 14 of 40 hours, is working out how old code works, which is the cost of accidental complexity. Reducing it is the simplicity goal. Automation (8 h) and swapping providers would help, but they are smaller or different problems." },
    { type: "match", q: "Each incident could have been avoided by a maintainability improvement. Match them up.",
      pairs: [["Nobody noticed the disk filling until the site stopped", "Add monitoring and alerts"], ["A new hire spent a week finding which of three tax functions was live", "Delete duplicate code and document the design"], ["Adding a currency took months because prices were hard-coded in 40 places", "Put money behind one abstraction"], ["After each crash an engineer had to log in and restart by hand", "Script the restart so tools can run it"]],
      why: "Visibility and automation are operability, deleting accidental complexity is simplicity, and a clean abstraction makes change easy, which is evolvability. Matching the cure to the symptom is how you decide where to invest." },
    { type: "mcq", q: "Both designs have five modules. Now a sixth module F is added to each: in A it must talk to every existing module, in B it only talks to E at the end of the chain. By about how many does each newcomer's map of links grow?", fig: links,
      o: ["A grows by 5, B grows by 1", "A grows by 1, B grows by 5", "A grows by 6, B grows by 2", "A and B each grow by 1"], a: 0,
      why: "Design A has 10 links among 5 modules (each pair); F adds 5 more, and the total keeps growing much faster than the module count. Design B stays easy to hold in your head: one new link. Tangled dependencies are accidental complexity." },
    { type: "cat", q: "A bike-hire app has these features and quirks. Sort each by whether it is essential complexity (part of the problem) or accidental complexity (an artefact of how it was built).", buckets: ["Essential complexity", "Accidental complexity"],
      items: [["A reserved bike is held for 15 minutes, then released", 0], ["Three services each write dates in a different format", 1], ["Vans must move bikes from full docks to empty ones", 0], ["A script that works only on one developer's laptop", 1], ["Prices change with the time of day", 0], ["One bug fixed separately in four copy-pasted functions", 1]],
      why: "Reservations, rebalancing and time-based pricing exist because of what the business does, so they cannot be removed. Date-format clashes, laptop-only scripts and copy-paste come from how the system was built, and can be simplified away." },
  ]);
})();

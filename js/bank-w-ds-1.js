/* DS revision bank, second set of visual and varied questions, part 1.
   Modules: ds-why, ds-blocks, ds-reliability, ds-load, ds-twitter, ds-scaling, ds-maintain.
   Every question stands on its own; the figure carries the data needed. Numbers checked with node. */
(function () {
  const B = NIC.bank;

  /* ---- tiny SVG helpers (theme tokens only) ---- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${t}</text>`;
  const rc = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx === undefined ? 10 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}"/>`;
  const ln = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}" stroke-linecap="round" ${o.d ? `stroke-dasharray="${o.d}"` : ""}/>`;
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;
  const table = (head, rows) => `<table class="t"><thead><tr>${head.map((h, i) => `<th${i ? ' class="num"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const box2 = (x, y, w, h, a, b, o = {}) => rc(x, y, w, h, o) + tx(x + w / 2, y + h / 2 - 3, a, { s: 12 }) + tx(x + w / 2, y + h / 2 + 13, b, { s: 11, c: "var(--text-dim)", w: 700 });

  /* ================= ds-why ================= */

  const growthTable = table(["Month", "0", "3", "6", "9", "12"], [["Peak requests per second", "100", "200", "400", "800", "1,600"]]);

  const designsTable = `<table class="t"><thead><tr><th>Design</th><th>What a Sydney customer sees while the link is down (London paid out £40 a minute ago)</th></tr></thead><tbody><tr><td>X</td><td>Their balance of £100, shown at once, no warning</td></tr><tr><td>Y</td><td>An apology: "We can't show your balance right now"</td></tr><tr><td>Z</td><td>Their balance of £100 at once, tagged "may be out of date"</td></tr></tbody></table>`;

  const splitFig = (() => {
    let s = ln(150, 53, 270, 53, { s: "var(--teal)", sw: 4 });
    s += ln(90, 78, 175, 128, { s: "var(--rose)", d: "7 6" }) + ln(330, 78, 245, 128, { s: "var(--rose)", d: "7 6" });
    s += tx(126, 108, "✗", { c: "var(--rose-ink)", s: 18 }) + tx(294, 108, "✗", { c: "var(--rose-ink)", s: 18 });
    s += pk("london", rc(30, 30, 120, 46) + tx(90, 59, "London")) + pk("paris", rc(270, 30, 120, 46) + tx(330, 59, "Paris")) + pk("sydney", rc(150, 130, 120, 46) + tx(210, 159, "Sydney"));
    return svg(420, 190, s);
  })();

  const twoServers = (() => {
    let s = tx(280, 16, "Either server can answer every request", { s: 12, c: "var(--text-dim)" });
    s += rc(100, 30, 150, 46, { s: "var(--teal)" }) + tx(175, 52, "Server 1", { s: 13 }) + tx(175, 68, "up 99% of the time", { s: 11, c: "var(--text-dim)", w: 700 });
    s += rc(310, 30, 150, 46, { s: "var(--teal)" }) + tx(385, 52, "Server 2", { s: 13 }) + tx(385, 68, "up 99% of the time", { s: 11, c: "var(--text-dim)", w: 700 });
    return svg(560, 90, s);
  })();

  B.add("ds-why", [
    { type: "slider", q: "Demand doubles every three months (see the table). Today's server copes with 400 requests per second. It will be replaced by one 4 times bigger. Roughly how many extra months does that buy, counting from the moment the old server runs out?",
      fig: growthTable, min: 0, max: 12, step: 1, ans: 6, tol: 1, unit: " months", hint: "Going from 400 to 1,600 means doubling twice. Each doubling takes three months.",
      why: "400 is reached at month 6 and 1,600 at month 12, so the 4 times bigger machine buys only 6 months. When demand grows exponentially, buying a bigger machine is a short reprieve, which is why a design that can add machines is needed." },
    { type: "multi", q: "A bank's data centres in London and Sydney cannot talk to each other. Which designs have chosen availability over consistency? Select all.",
      fig: designsTable, o: ["Design X", "Design Y", "Design Z"], a: [0, 2],
      why: "X and Z both answer at once from a copy that cannot know about the withdrawal. Tagging Z's answer as possibly out of date is honest, but it is still an answer that may be wrong. Only Y refuses to answer until the copies can agree, which is the consistency choice." },
    { type: "pick", q: "A fault has cut the red dashed links. Tap the data centres that can still reach each other.",
      fig: splitFig, a: ["london", "paris"],
      why: "London and Paris still share a working link, so they can agree between them. Sydney is cut off on its own. Each side must now decide whether to keep answering (availability) or wait to be sure its data is right (consistency)." },
    { type: "bug", q: "A hosting contract is used to promise customers that a single-server service will rarely be down. Which line of the reasoning is wrong?",
      code: ["Contract: the server is up 99.9% of the year", "99.9% uptime allows about 9 hours of unplanned downtime a year", "Planned upgrades: 6 a year, each needs a 2-hour restart", "Conclusion: users will lose at most 9 hours of service a year"], a: 3,
      why: "0.1% of a year is about 9 hours, but the upgrades add another 6 × 2 = 12 hours, so users lose about 21 hours. With a single server even routine maintenance is downtime, which is one of the limits that pushes designs towards several machines." },
    { type: "mcq", q: "Two independent servers are each up 99% of the time, and either one can serve users. Roughly how often are BOTH down at the same moment?",
      fig: twoServers, o: ["About 0.01% of the time", "About 0.5% of the time", "About 1% of the time", "About 2% of the time"], a: 0, hint: "Each is down 1 time in 100. Both at once is 1 in 100 of those moments: 1 in 100 × 100.",
      why: "1% of 1% is 0.01%, about 1 minute in a week. Redundancy multiplies small failure chances together, which is its great strength. The sum only works if the faults are independent, which is the catch with shared causes." },
    { type: "mcq", q: "A forum shows each member's \"last seen online\" time. One database copy is sometimes about two seconds behind. What is the sensible design call?",
      o: ["Serve it: a slightly old last-seen time harms nobody", "Make every read wait until all copies agree, to be safe", "Remove the copies, because any lag makes them useless", "Show an error whenever two copies differ at all"], a: 0,
      why: "A two-second-old timestamp does no damage, so availability and speed matter more than perfect agreement. Waiting for agreement or erroring is the right call for balances or the last seat on a flight, not for a harmless label." },
  ]);

  /* ================= ds-blocks ================= */

  const lruFig = (() => {
    const it = [["a", "Item A", "last used 2 s ago", "used 3 times"], ["b", "Item B", "last used 9 s ago", "used 40 times"], ["c", "Item C", "last used 6 s ago", "used once"]];
    let s = tx(280, 16, "The cache is full. A new item, D, arrives and one item must go.", { s: 12, c: "var(--text-dim)" });
    it.forEach(([id, n, l, u], i) => (s += pk(id, rc(10 + i * 185, 30, 170, 80, { s: "var(--blue)" }) + tx(95 + i * 185, 54, n) + tx(95 + i * 185, 74, l, { s: 12, c: "var(--text-dim)", w: 700 }) + tx(95 + i * 185, 94, u, { s: 12, c: "var(--text-dim)", w: 700 }))));
    return svg(560, 125, s);
  })();

  const indexFig = table(["id (has an index)", "name", "city", "joined"], [["4021", "Priya", "Leeds", "2021"], ["4022", "Tom", "Exeter", "2019"], ["4023", "Aisha", "Leeds", "2023"], ["…", "…", "…", "…"]]);

  const hitTable = table(["Cache today", ""], [["Share of requests answered by the cache", "90%"], ["Time for a cache hit", "2 ms"], ["Time for a miss (cache, then database)", "102 ms"], ["Option A", "Raise the hit share to 95%"], ["Option B", "Cut the hit time to 1 ms"]]);

  const coldFig = (() => {
    const v = [50, 50, 50, 950, 500, 200, 100], base = 190, k = 0.15;
    let s = tx(10, 14, "Database load in requests per second. The cache is restarted, empty, at minute 4.", { a: "start", s: 12, c: "var(--text-dim)" });
    v.forEach((d, i) => {
      const x = 30 + i * 74, h = d * k;
      s += pk("m" + (i + 1), rc(x, base - h, 54, h, { rx: 6, f: "var(--panel)", s: "var(--blue)", sw: 2 }) + tx(x + 27, base - h - 6, d, { s: 12 }) + tx(x + 27, base + 17, "Min " + (i + 1), { s: 12, c: "var(--text-dim)" }));
    });
    s += ln(20, base - 300 * k, 548, base - 300 * k, { s: "var(--rose)", d: "7 6" }) + tx(24, base - 300 * k - 6, "Database copes with 300", { a: "start", s: 12, c: "var(--rose-ink)" });
    return svg(560, 215, s);
  })();

  B.add("ds-blocks", [
    { type: "pick", q: "The cache evicts the least recently used item. Tap the slot that is thrown out to make room for D.", fig: lruFig, a: "b",
      why: "Least recently used means the item untouched for the longest time: B, at 9 seconds. It is the most used overall, but the policy bets on recency, not on how popular an item was in the past. Counting uses would be a different policy." },
    { type: "multi", q: "The customers table has an index on id only (shown). Which lookups does that index speed up? Select all.", fig: indexFig,
      o: ["Find the customer whose id is 4021", "List every customer who lives in Leeds", "Fetch customer 77's record at log-in", "Count all the customers who joined in 2023"], a: [0, 2],
      why: "An index is a shortcut on one field. Looking up by id (a login, a profile page) can jump straight to the record. Finding by city or joining year has no shortcut, so the database still scans the whole table." },
    { type: "match", q: "Match each symptom to the building block that fixes it.",
      pairs: [["Every visitor makes the server recompute the same expensive result", "Cache"], ["Finding one customer in a huge table takes ages", "Index"], ["A yearly report must crunch every sale in the company", "Batch job"], ["A card-fraud alert must appear within seconds of a payment", "Stream processing"]],
      why: "A cache stores a repeated answer, an index speeds finding by one field, batch processing handles huge jobs when delay is fine, and stream processing reacts to events as they arrive." },
    { type: "mcq", q: "The cache is nearly always right. Which change lowers the average response time more?", fig: hitTable,
      o: ["Option A: raise the hit share to 95%", "Option B: cut the hit time to 1 ms", "They help about equally", "Neither: the database alone sets the average"], a: 0, hint: "A hit costs 2 ms, a miss 102 ms. Where is most of the average time spent?",
      why: "Today the average is 0.9 × 2 + 0.1 × 102 = 12 ms. Option A gives 0.95 × 2 + 0.05 × 102 = 7 ms. Option B gives only 0.9 × 1 + 0.1 × 102 = 11.1 ms. The rare misses dominate, so avoiding them is worth far more than speeding up hits." },
    { type: "pick", q: "The database copes with 300 requests per second. Tap the LAST minute in which it was overloaded.", fig: coldFig, a: "m5",
      why: "With the cache empty, nearly every request reaches the database, and it takes time to refill. Minute 4 has 950 and minute 5 has 500, both above 300. By minute 6 the load of 200 is back within its limit. A cache hides load, so losing it can overwhelm the database behind it." },
    { type: "order", q: "Put the steps in order so that a changed address never leaves a stale copy in the cache for long.",
      items: ["A customer changes their address and the app writes it to the database", "The app deletes that customer's old cached copy", "Later, someone asks for the address and the cache has no entry", "The app reads the fresh row from the database", "The app stores the fresh row in the cache and returns it"],
      why: "The database stays the source of truth. Deleting the old cached copy forces the next read to miss, fetch the fresh row and refill the cache, so the stale value cannot be served again." },
  ]);

  /* ================= ds-reliability ================= */

  const chainFig = (() => {
    let s = "";
    for (let i = 0; i < 5; i++) {
      s += rc(8 + i * 110, 20, 90, 50, { s: "var(--blue)" }) + tx(53 + i * 110, 42, "Service " + (i + 1), { s: 12 }) + tx(53 + i * 110, 59, "up 99%", { s: 12, c: "var(--text-dim)", w: 700 });
      if (i < 4) s += ln(100 + i * 110, 45, 116 + i * 110, 45, { sw: 3 });
    }
    s += tx(280, 92, "A request must pass through all five, and each fails independently.", { s: 12, c: "var(--text-dim)" });
    return svg(560, 104, s);
  })();

  const powerFig = (() => {
    let s = ln(80, 110, 110, 110) + ln(190, 110, 230, 40) + ln(190, 110, 230, 110) + ln(190, 110, 230, 180);
    [40, 110, 180].forEach((y) => (s += ln(330, y, 450, 110, { sw: 2, s: "var(--amber)" })));
    s += rc(10, 90, 70, 40) + tx(45, 115, "Users");
    s += pk("router", rc(110, 90, 80, 40) + tx(150, 115, "Router"));
    [20, 90, 160].forEach((y, i) => (s += pk("srv" + (i + 1), rc(230, y, 100, 40) + tx(280, y + 25, "Server " + (i + 1)))));
    s += pk("power", rc(450, 90, 100, 40, { s: "var(--amber)" }) + tx(500, 115, "Power strip"));
    return svg(560, 215, s);
  })();

  const mttrTable = table(["", "How often it fails", "Time to recover each time"], [["Service A", "Once every 100 days", "1 day"], ["Service B", "Once every 10 days", "1 minute"]]);

  B.add("ds-reliability", [
    { type: "mcq", q: "Each service in the chain is up 99% of the time and any one failing breaks the request. Roughly how often does a request succeed?", fig: chainFig,
      o: ["About 99%", "About 95%", "About 85%", "About 60%"], a: 1, hint: "Each service costs you about one percentage point. There are five of them.",
      why: "0.99 × 0.99 × 0.99 × 0.99 × 0.99 is about 0.95. Dependencies in a chain multiply their failure chances, so a system is less reliable than any single part. This is the opposite of redundancy, which multiplies in your favour." },
    { type: "cat", q: "A post-mortem lists these events. Sort each one as a fault (a part misbehaves) or a failure (users are affected).", buckets: ["Fault", "Failure"],
      items: [["A disk starts returning read errors", 0], ["Customers see a \"service unavailable\" page for 20 minutes", 1], ["A bad config file is pushed to one server", 0], ["Orders placed during the outage are lost", 1], ["A node reboots in a loop", 0]],
      why: "A fault is a component departing from its spec. A failure is the whole service stopping its job for users. Fault tolerance is about stopping faults from turning into failures." },
    { type: "pick", q: "The team claims three servers means any single failure is survivable. Tap EVERY part whose failure alone would still take the service down.", fig: powerFig, a: ["router", "power"],
      why: "The three servers are redundant, but they all depend on one router and one power strip. Redundancy only protects you from a part if there are spares of that part. Hidden shared dependencies are the usual way a redundant design still fails." },
    { type: "bug", q: "Under normal load this works. When the backend slows down, the whole system collapses. Which line turns one slow service into a cascading failure?",
      code: ["def call_backend(req):", "    for attempt in range(1000):", "        resp = backend.send(req)", "        if resp.ok: return resp", "    raise Error('backend unavailable')"], a: 1,
      why: "Up to 1,000 instant retries multiply the load on an already struggling backend. Every client piles on, which makes it slower still. A few retries with growing pauses, plus a limit, keep a fault local." },
    { type: "match", q: "A dependency is down. Match each to the graceful reaction that keeps the service useful.",
      pairs: [["The product-recommendations service times out", "Show the bestsellers list instead"], ["The card provider cannot be reached", "Accept the order and retry the charge later"], ["The image-resizing service is down", "Serve the original photo, uncropped"], ["The primary database loses power", "Promote a replica to take over"]],
      why: "Fault tolerance is usually a fallback that keeps the core job going: a worse but acceptable answer, a retry queue, or a standby that takes over." },
    { type: "mcq", q: "Over a whole year, which service is down for less time in total?", fig: mttrTable,
      o: ["Service B, though it fails ten times more often", "Service A, because it fails only a tenth as often", "They tie, since both are eventually fixed", "Neither: it depends on what caused each fault"], a: 0, hint: "Count failures in a year, then multiply by the repair time of each.",
      why: "A fails about 3.65 times a year at 1 day each, roughly 3.65 days of downtime. B fails about 36.5 times at 1 minute each, about 36.5 minutes. Fast recovery can matter more than rare failure, which is why teams invest in automatic restarts and failover." },
  ]);

  /* ================= ds-load ================= */

  const tenCalls = (() => {
    let s = "";
    for (let i = 0; i < 10; i++) s += rc(8 + i * 54, 14, 46, 38, { s: i === 6 ? "var(--rose)" : "var(--blue)", sw: 2 }) + tx(31 + i * 54, 38, "S" + (i + 1), { s: 12 });
    s += tx(280, 76, "Each call is slow 1 time in 100. The page waits for all ten calls.", { s: 12, c: "var(--text-dim)" });
    return svg(560, 88, s);
  })();

  const abTable = table(["Service", "Median", "Average", "Slowest 1% start at"], [["A", "80 ms", "120 ms", "2,500 ms"], ["B", "150 ms", "170 ms", "600 ms"]]);

  const burstFig = (() => {
    let s = tx(10, 14, "Requests per second", { a: "start", s: 12, c: "var(--text-dim)" });
    [["Server can handle", 100, "var(--teal)"], ["During a one-minute burst", 120, "var(--rose)"], ["After the burst", 80, "var(--blue)"]].forEach(([l, v, c], i) => {
      const y = 28 + i * 34;
      s += tx(10, y + 18, l, { a: "start", s: 12 }) + rc(190, y, v * 2.6, 24, { rx: 6, f: c, s: c, sw: 1 }) + tx(190 + v * 2.6 + 8, y + 18, v, { a: "start", s: 13 });
    });
    return svg(560, 140, s);
  })();

  B.add("ds-load", [
    { type: "slider", q: "A page waits for all ten backend calls. Each call is slow 1 time in 100. Roughly what percentage of page loads hit at least one slow call?", fig: tenCalls,
      min: 0, max: 50, step: 1, ans: 10, tol: 3, unit: "%", hint: "Ten chances, each at about 1 in 100.",
      why: "The chance all ten are fast is 0.99 to the power 10, about 0.90. So about 10% of pages are slow, even though each call is slow only 1% of the time. Tail latency spreads through a design with many calls." },
    { type: "mcq", q: "A checkout promises \"almost every payment answers in under a second\". Which service should it use?", fig: abTable,
      o: ["Service B, because its slowest requests are far milder", "Service A, because its median and average are lower", "Service A, because 99% of its requests are very fast", "Either one: the average is all that matters"], a: 0,
      why: "The promise is about nearly every request, so the tail decides it. A is faster for most requests, but 1 request in 100 takes 2.5 seconds or more. B's worst 1% start at 0.6 seconds. Median and average hide this." },
    { type: "order", q: "A load test adds more and more users. Put in order what you would expect to see.",
      items: ["Throughput rises in step with the number of users", "Response times stay flat while there is spare capacity", "Throughput stops rising because the system is at capacity", "Requests queue up and the p99 climbs sharply", "Timeouts and errors begin to appear"],
      why: "While capacity is spare, extra load is absorbed with no visible cost. Once it runs out, extra requests wait in queues, so tail latency shoots up first and errors follow." },
    { type: "slider", q: "The burst ends and load falls to 80 requests per second. The queue built up during the burst now drains. Roughly how many seconds until it is empty?", fig: burstFig,
      min: 0, max: 180, step: 5, ans: 60, tol: 15, unit: " s", hint: "Backlog = 20 extra per second × 60 seconds. It drains at 20 per second of spare capacity.",
      why: "During the burst 20 extra requests a second pile up for 60 seconds: 1,200 waiting. Afterwards there are 20 spare slots a second, so it takes 1,200 ÷ 20 = 60 seconds to clear. Users keep seeing slow answers long after the burst ends." },
    { type: "bug", q: "A script combines the response times of several servers into one overall p99. Which line is wrong?",
      code: ["for server in servers:", "    p99s.append(percentile(server.times, 99))", "overall_p99 = sum(p99s) / len(p99s)", "print('overall p99:', overall_p99)"], a: 2,
      why: "Percentiles cannot be averaged. One slow server's tail gets diluted by the others. Combine all the raw times (or the histograms) first and then take the 99th percentile." },
    { type: "match", q: "Match each complaint to the measure that would show it.",
      pairs: [["\"Once in a while checkout hangs for ages\"", "p99 response time"], ["\"Most people say it feels quick\"", "Median response time"], ["\"Launch-day traffic is ten times a normal day\"", "Peak requests per second"], ["\"Customers keep seeing 'something went wrong'\"", "Error rate"]],
      why: "Rare slow experiences live in the tail (p99), typical ones in the median, demand is a load parameter, and failures show in the error rate. No single number covers all four." },
  ]);

  /* ================= ds-twitter ================= */

  const followersFig = (() => {
    const f = [["f1", "Follower 1 · opened 2 days ago"], ["f2", "Follower 2 · opened today"], ["f3", "Follower 3 · opened 14 months ago"], ["f4", "Follower 4 · opened 3 weeks ago"], ["f5", "Follower 5 · opened 2 years ago"]];
    let s = "";
    f.forEach(([id, t], i) => {
      const y = 8 + i * 52;
      s += ln(90, 120, 190, y + 20, { sw: 2 }) + pk(id, rc(190, y, 270, 40, { s: "var(--blue)" }) + tx(325, y + 25, t, { s: 12 }));
    });
    s += rc(10, 100, 80, 40) + tx(50, 125, "Author");
    return svg(470, 270, s);
  })();

  const buckets = [["A", 1000000, 100, 2], ["B", 10000, 10000, 4], ["C", 100, 5000000, 10]];
  const bucketTable = table(["Group", "Accounts", "Followers each", "Posts per day each"], [["A", "1 million", "100", "2"], ["B", "10,000", "10,000", "4"], ["C", "100", "5 million", "10"]]);

  const stepsFig = (() => {
    const st = [["s1", "1 · Look up", "who I follow"], ["s2", "2 · Fetch latest", "tweets of each"], ["s3", "3 · Merge and", "sort by time"], ["s4", "4 · Show the", "first 50"]];
    let s = "";
    st.forEach(([id, a, b], i) => (s += pk(id, box2(8 + i * 138, 14, 126, 56, a, b, { s: "var(--blue)" })) + (i < 3 ? ln(134 + i * 138, 42, 146 + i * 138, 42, { sw: 2 }) : "")));
    return svg(560, 84, s);
  })();

  B.add("ds-twitter", [
    { type: "pick", q: "A system writes each new tweet only into the timeline caches of followers who opened the app within the last 30 days. Tap every cache that gets a write.", fig: followersFig, a: ["f1", "f2", "f4"],
      why: "Followers 1, 2 and 4 opened the app within 30 days. Followers 3 and 5 have not been seen for over a year, so writing to their caches is wasted work. Their timeline can be built when (if) they ever return. This trims the fan-out bill without changing what active users see." },
    { type: "bug", q: "This hybrid should push tweets from ordinary accounts into followers' timeline caches and leave huge accounts to be merged at read time. Yet the write bill is enormous. Which line is wrong?",
      code: ["def post(author, text):", "    id = save_tweet(author, text)", "    if follower_count(author) > 1_000_000:", "        push_to_follower_timelines(id)", "    # otherwise followers merge this tweet in when they read", "    return id"], a: 2,
      why: "The test is the wrong way round: it pushes millions of cache writes for celebrities and leaves ordinary accounts to be merged on read. It should push when the count is below the threshold." },
    { type: "cat", q: "Each trend below grows tenfold. Which design gets MORE expensive?", buckets: ["Merge on read", "Fan-out on write"],
      items: [["The number of times each user opens their timeline a day", 0], ["The number of accounts each user follows", 0], ["The number of followers each account has", 1], ["The number of tweets posted each day", 1]],
      why: "Merge on read pays on each timeline open, and more per open the more accounts you follow. Fan-out on write pays on each post, once per follower, so tweets per day and followers per account drive it." },
    { type: "mcq", q: "Under fan-out on write, which group causes the most timeline-cache writes per day?", fig: bucketTable,
      o: ["Group C, with only 100 accounts", "Group A, with by far the most accounts", "Group B, the middle of the range", "They cause about the same"], a: 0, hint: "Writes = accounts × followers × posts. Compare 100 × 5 million × 10 with 1 million × 100 × 2.",
      why: "C: 100 × 5,000,000 × 10 = 5 billion. B: 10,000 × 10,000 × 4 = 400 million. A: 1,000,000 × 100 × 2 = 200 million. A handful of huge accounts dominates the bill, which is why hybrids treat them differently." },
    { type: "mcq", q: "A colleague says fan-out on write is wasteful, since most followers will never read most tweets. Which fact best answers them?",
      o: ["Timeline reads far outnumber posts, so paying once per post saves repeated work", "Writes to caches are always cheaper than reads from any database", "Followers are certain to read every tweet they are sent", "Fan-out on write needs no storage for the timelines"], a: 0,
      why: "The design is a bet on the read-to-write ratio. With hundreds of reads for every post, preparing timelines at post time costs less overall than merging on every open. It is not free, and the bet fails for huge accounts." },
    { type: "pick", q: "A user opens their timeline under fan-out on write, where it is already built. Tap EVERY step that no longer has to happen at read time.", fig: stepsFig, a: ["s1", "s2", "s3"],
      why: "The merging was done earlier, at post time. At read time the app only has to show the first page of the ready-made cache, which is step 4. This is the trade: slower posting for much faster reading." },
  ]);

  /* ================= ds-scaling ================= */

  const serialFig = (() => {
    let s = tx(10, 14, "A job takes 100 minutes on one machine", { a: "start", s: 12, c: "var(--text-dim)" });
    s += rc(10, 28, 100, 36, { rx: 6, f: "var(--amber)", s: "var(--amber)", sw: 1 }) + tx(60, 51, "20 min", { c: "#fff" }) + tx(60, 82, "must run in one piece", { s: 12, c: "var(--text-dim)" });
    s += rc(110, 28, 400, 36, { rx: 6, f: "var(--blue)", s: "var(--blue)", sw: 1 }) + tx(310, 51, "80 min", { c: "#fff" }) + tx(310, 82, "splits across as many machines as you like", { s: 12, c: "var(--text-dim)" });
    return svg(530, 96, s);
  })();

  const shardTable = table(["Sharding key", "Node 1", "Node 2", "Node 3", "Node 4"], [["Country", "55%", "25%", "12%", "8%"], ["Hash of the user id", "26%", "25%", "25%", "24%"], ["Month the user signed up", "4%", "6%", "10%", "80%"]]);

  const queryFig = (() => {
    const n = [["n1", "Exeter, Bath"], ["n2", "Leeds, York"], ["n3", "Cardiff, Swansea"], ["n4", "Glasgow, Perth"]];
    let s = rc(110, 8, 340, 32, { s: "var(--violet)" }) + tx(280, 29, "Query: all customers in Exeter and Leeds", { s: 12 });
    n.forEach(([id, c], i) => (s += pk(id, box2(8 + i * 138, 76, 126, 56, "Node " + (i + 1), c, { s: "var(--blue)" }))));
    return svg(560, 144, s);
  })();

  B.add("ds-scaling", [
    { type: "slider", q: "Even with unlimited machines, roughly how many times faster than a single machine can this job get?", fig: serialFig,
      min: 1, max: 20, step: 1, ans: 5, tol: 1, unit: "×", hint: "With endless machines the 80 minutes shrink to almost nothing. What is left?",
      why: "The 20-minute part cannot be split, so the best possible time is just over 20 minutes: 100 ÷ 20 = 5 times faster. With 10 machines it takes 20 + 8 = 28 minutes. Scaling out helps only the part of the work that can be shared." },
    { type: "mcq", q: "Which sharding key spreads the work evenly across the four nodes?", fig: shardTable,
      o: ["Hash of the user id, with every node near 25%", "Country, because users in one place stay together", "Sign-up month, because it is easy to explain", "Any of them: the key never changes the load"], a: 0,
      why: "A hash scatters users almost evenly, so every node carries about a quarter. Country makes Node 1 a hot spot. Sign-up month sends nearly all new activity to one node. A shard that carries most of the load defeats scaling out." },
    { type: "order", q: "A shop's single web server keeps baskets in its own memory. Put the steps in order for scaling out safely.",
      items: ["Move baskets out of server memory into a shared store", "Put a load balancer in front of the server", "Start a second identical server behind the balancer", "Switch one server off while users browse, to prove nothing is lost", "Add more servers as demand grows"],
      why: "A second server only helps if either one can serve any user. So state moves out first. Then add the balancer and the copy, test by removing one, and only then grow." },
    { type: "match", q: "Match each consequence to the architecture it describes.",
      pairs: [["Upgrading means buying a bigger, much pricier single machine", "Shared memory"], ["All the nodes queue up at one common storage unit", "Shared disk"], ["Each node adds its own capacity, but data must be split between them", "Shared nothing"]],
      why: "Shared memory is one big machine (scaling up). Shared disk puts many machines on one storage array, which becomes the bottleneck. Shared nothing scales out best, at the cost of splitting the data." },
    { type: "bug", q: "Adding a fourth server to this setup would send most users to a different server, so their cached data is lost. Which line causes that?",
      code: ["servers = ['web1', 'web2', 'web3']", "def pick_server(user_id):", "    return servers[user_id % 3]", "# next week: add 'web4' and change the 3 to a 4"], a: 2,
      hint: "Try user ids 0 to 11 with 3 servers, then with 4. How many land on the same server?",
      why: "Choosing by id % number-of-servers ties every user's place to the server count. Changing 3 to 4 leaves only 3 of every 12 users where they were, so 75% move. Schemes that move only a small share of data when servers are added avoid this." },
    { type: "pick", q: "The data is partitioned by city, as shown. Tap every node that must be asked to answer the query.", fig: queryFig, a: ["n1", "n2"],
      why: "Exeter's customers live on Node 1 and Leeds's on Node 2. The other nodes hold nothing relevant, so they can be left alone. Choosing a partition key that matches common queries keeps a query from having to ask every node." },
  ]);

  /* ================= ds-maintain ================= */

  const errBars = (() => {
    const v = [0.5, 0.6, 1, 2.5, 3.5, 6, 9], base = 190, k = 16;
    let s = tx(10, 14, "Share of requests failing, per minute", { a: "start", s: 12, c: "var(--text-dim)" });
    v.forEach((d, i) => {
      const x = 30 + i * 74, h = d * k;
      s += pk("m" + (i + 1), rc(x, base - h, 54, h, { rx: 6, f: "var(--panel)", s: "var(--rose)", sw: 2 }) + tx(x + 27, base - h - 6, d + "%", { s: 12 }) + tx(x + 27, base + 17, "Min " + (i + 1), { s: 12, c: "var(--text-dim)" }));
    });
    s += ln(20, base - 2 * k, 548, base - 2 * k, { s: "var(--amber)", d: "7 6" }) + tx(24, base - 2 * k - 6, "Rule: above 2% for two minutes in a row", { a: "start", s: 12, c: "var(--amber-ink, var(--text))" });
    return svg(560, 215, s);
  })();

  const debtBars = (() => {
    const A = [10, 9, 8, 6, 4, 3], Bv = [8, 8, 8, 8, 8, 8], base = 180, k = 14;
    let s = tx(10, 14, "Features shipped per month", { a: "start", s: 12, c: "var(--text-dim)" });
    s += rc(330, 4, 12, 12, { rx: 3, f: "var(--amber)", s: "var(--amber)", sw: 1 }) + tx(348, 15, "Team A: never tidies up", { a: "start", s: 12 });
    s += rc(330, 22, 12, 12, { rx: 3, f: "var(--teal)", s: "var(--teal)", sw: 1 }) + tx(348, 33, "Team B: spends time tidying", { a: "start", s: 12 });
    A.forEach((a, i) => {
      const x = 30 + i * 86;
      s += pk("m" + (i + 1), rc(x, base - a * k, 34, a * k, { rx: 5, f: "var(--amber)", s: "var(--amber)", sw: 1 }) + rc(x + 38, base - Bv[i] * k, 34, Bv[i] * k, { rx: 5, f: "var(--teal)", s: "var(--teal)", sw: 1 }) + tx(x + 17, base - a * k - 5, a, { s: 12 }) + tx(x + 55, base - Bv[i] * k - 5, Bv[i], { s: 12 }) + tx(x + 36, base + 17, "Month " + (i + 1), { s: 12, c: "var(--text-dim)" }));
    });
    return svg(560, 205, s);
  })();

  const costFig = (() => {
    let s = tx(10, 14, "Where a typical system's lifetime cost goes", { a: "start", s: 12, c: "var(--text-dim)" });
    s += rc(10, 28, 50, 36, { rx: 6, f: "var(--blue)", s: "var(--blue)", sw: 1 }) + tx(35, 51, "10%", { c: "#fff" }) + tx(35, 82, "building", { s: 12, c: "var(--text-dim)" });
    s += rc(60, 28, 450, 36, { rx: 6, f: "var(--amber)", s: "var(--amber)", sw: 1 }) + tx(285, 51, "90%", { c: "#fff" }) + tx(285, 82, "running, fixing and changing it", { s: 12, c: "var(--text-dim)" });
    return svg(530, 96, s);
  })();

  B.add("ds-maintain", [
    { type: "pick", q: "Good monitoring should page the on-call engineer. Tap the minute at which the alert rule first fires.", fig: errBars, a: "m5",
      why: "Minute 4 is above 2% but one minute is not enough. Minute 5 is the second in a row (3.5%), so the rule fires then. Waiting for two minutes avoids false alarms from blips. Minute 7's 9% is far too late, since users have been suffering for several minutes." },
    { type: "pick", q: "Tap the first month in which team B ships MORE features than team A.", fig: debtBars, a: "m4",
      why: "In month 3 both ship 8, a tie. In month 4 team A has dropped to 6 while B still ships 8. Skipping tidy-up looks fastest at first, but the mess slows every later change. Simpler code is what keeps a team able to evolve the system." },
    { type: "order", q: "A company wants to replace its old billing module without a risky big-bang switch. Put the steps in order.",
      items: ["Wrap the old billing module behind a small interface", "Build the new module behind the same interface", "Send 1% of invoices to the new module and compare results", "Raise the share step by step while the results stay identical", "Retire the old module once it receives no traffic"],
      why: "A clean interface lets old and new swap places. A small share of traffic proves the new module with little risk, and growing it gradually means any problem is found early. This is what evolvability buys you." },
    { type: "slider", q: "Building a system costs £200 thousand. Maintenance is typically about 90% of its lifetime cost. Roughly what is the lifetime cost, in £ thousand?", fig: costFig,
      min: 0, max: 3000, step: 100, ans: 2000, tol: 300, unit: "k", hint: "If the build is 10% of the total, the total is 10 times the build.",
      why: "The build is only 10% of the lifetime cost, so the total is about 10 × £200k = £2 million. Most of the money is spent keeping a system running and changing it, which is why maintainability is worth designing for." },
    { type: "match", q: "Match each warning sign to the practice that would fix it.",
      pairs: [["A deploy takes 20 manual steps and someone always skips one", "Automate the deploy"], ["The same discount rule is pasted into five services", "Define it once and reuse it"], ["Nobody notices the queue filling until customers phone", "Add monitoring and alerts"], ["Swapping the payment provider means editing every service", "Hide the provider behind one interface"]],
      why: "Manual steps and invisible problems are operability issues, duplication is a simplicity problem, and a change that touches everything is an evolvability problem. Each has a different fix." },
  ]);
})();

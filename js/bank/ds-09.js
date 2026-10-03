(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { cascade, crashGrid, ln, nodesFig, pk, rc, svg, table, tx } = partScope;
  const B = NIC.bank;

  B.add("ds-reliability", [
    {
      type: "pick",
      q: "Each panel shows five nodes sharing a service as one failure leads to the next. Tap the stage at which the FAULT has become a FAILURE of the service.",
      fig: cascade,
      a: "s5",
      why: "A fault is one component misbehaving. In stages 1 to 4 users are still being served, even if slowly. Only in stage 5 does the system as a whole stop providing the service. The earlier stages show how a cascade of faults can march toward a failure.",
    },
    {
      type: "cat",
      q: "Sort each protective measure by the kind of fault it mainly guards against.",
      buckets: ["Hardware faults", "Software faults", "Human mistakes"],
      items: [
        ["Mirror every disk so a copy survives a dead drive", 0],
        ["Fit two power supplies per machine", 0],
        ["Release a new version to 5% of servers before the rest", 1],
        ["Cap the memory a runaway process can use", 1],
        ["Rehearse risky operations on a staging copy first", 2],
        ["Keep a one-click rollback for configuration changes", 2],
      ],
      why: "Redundant parts handle independent hardware faults. Software bugs hit many nodes at once, so you limit their spread (staged release, resource limits). People will make mistakes, so give them safe places to practise and an easy way to undo.",
    },
    {
      type: "mcq",
      q: "The service must still cope with peak demand if ANY TWO nodes are down at once. How many nodes of this size does it need in total?",
      fig: nodesFig,
      o: ["5", "6", "8", "10"],
      a: 1,
      hint: "Four nodes cover 400 (4 × 100). Then add two more as spare.",
      why: "400 ÷ 100 = 4 nodes must be working. To survive two failures you keep two spare, so 4 + 2 = 6. Five nodes would still manage one loss, but a second would overload the rest and could start a cascade.",
    },
    {
      type: "bug",
      q: "A migration runbook is meant to limit the damage of a mistake or a bug. Which step makes the plan dangerous?",
      code: [
        "1. Copy last night's production data to a staging database",
        "2. Run the new migration script on staging and check the results",
        "3. Run the same script on production at 14:00 on Friday, in all regions at once",
        "4. Keep the pre-migration backup ready to restore",
      ],
      a: 2,
      why: "Staging and a backup are good. Hitting every region at once means a bug in the script (or a human slip) is correlated across the whole system with nobody left untouched. Doing one region first, off-peak, would turn a possible failure into a contained fault.",
    },
    {
      type: "order",
      q: "Put the steps of a staged rollout in order, so a software bug stays a fault and does not become a failure.",
      items: [
        "Ship the new build to 1 of 20 servers",
        "Compare the new server's error rate with the other 19",
        "Spot errors rising on the updated server only",
        "Roll that server back before any others are updated",
        "Fix the bug and start the rollout again",
      ],
      why: "Software faults tend to appear on every node that runs the same code. Updating a small slice first, and comparing it with the rest, keeps 19 servers healthy while you find out. Rolling out to all 20 at once would risk a total failure.",
    },
    {
      type: "pick",
      q: "A red dot is a node crashing. Two pictures of a cluster for 10 days: tap the day that shows a CORRELATED fault, a software problem rather than worn-out hardware.",
      fig: crashGrid,
      a: "d9",
      why: "Hardware faults are mostly independent: a disk here, a power supply there, scattered over time. On day 9 all six nodes died together, which points to something they share, such as the same buggy software. Day 5 (two dots) is only what chance can produce.",
    },
  ]);

  /* ================= ds-load ================= */

  const hist = (() => {
    const c = [20, 35, 25, 10, 6, 4],
      lab = ["0–100", "100–200", "200–300", "300–400", "400–500", "500+"],
      base = 175;
    let s = "";
    c.forEach((n, i) => {
      const x = 40 + i * 88,
        h = n * 3.6;
      s += pk(
        "b" + (i + 1),
        rc(x, base - h, 76, h, { rx: 6, f: "var(--blue-dim, var(--panel))", s: "var(--blue)", sw: 2 }) +
          tx(x + 38, base - h - 6, n, { s: 13 }) +
          tx(x + 38, base + 18, lab[i], { s: 12, c: "var(--text-dim)" }),
      );
    });
    s += tx(300, 214, "Response time in ms. Bar height = number of requests (100 in total)", {
      s: 12,
      w: 700,
      c: "var(--text-faint)",
    });
    return svg(580, 224, s);
  })();

  const kneeChart = (() => {
    const L = [200, 400, 600, 800, 1000],
      p50 = [40, 42, 45, 70, 150],
      p99 = [120, 130, 160, 420, 780];
    const X = (v) => 70 + (v - 200) * 0.6,
      Y = (v) => 200 - v * 0.22;
    let s = ln(60, 200, 540, 200, { s: "var(--line)", sw: 2 }) + ln(60, 20, 60, 200, { s: "var(--line)", sw: 2 });
    [0, 200, 400, 600, 800].forEach((v) => (s += tx(52, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-faint)" })));
    s +=
      ln(60, Y(200), 540, Y(200), { s: "var(--rose)", sw: 2.5, d: "7 6" }) +
      tx(540, Y(200) - 6, "Promise: p99 under 200 ms", { a: "end", s: 12, c: "var(--rose-ink)" });
    s += `<polyline points="${L.map((l, i) => `${X(l)},${Y(p50[i])}`).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="3"/>`;
    s += `<polyline points="${L.map((l, i) => `${X(l)},${Y(p99[i])}`).join(" ")}" fill="none" stroke="var(--amber)" stroke-width="3"/>`;
    L.forEach(
      (l, i) =>
        (s +=
          tx(X(l), 220, l, { s: 11.5, c: "var(--text-dim)" }) +
          pk(
            "l" + l,
            `<circle cx="${X(l)}" cy="${Y(p99[i])}" r="11" fill="var(--panel)" stroke="var(--amber)" stroke-width="3"/>`,
          )),
    );
    s +=
      tx(300, 240, "Load: requests per second", { s: 12, w: 700, c: "var(--text-faint)" }) +
      tx(80, 14, "orange line = p99 (tap its dots)", { a: "start", s: 12, c: "var(--amber-ink)" }) +
      tx(330, 14, "green line = p50", { a: "start", s: 12, c: "var(--teal-ink)" });
    return svg(560, 248, s);
  })();

  B.add("ds-load", [
    {
      type: "pick",
      q: "100 requests were timed, as shown. Tap the bar that contains the p95 response time.",
      fig: hist,
      a: "b5",
      hint: "Add the bars from the fast end until you have passed 95 requests: 20, 55, 80, 90, ...",
      why: "Running totals are 20, 55, 80, 90 and 96. The 95th-fastest request falls in the 400–500 ms bar. The median (50th) is in the 100–200 ms bar, so a typical visit looks fine while one in twenty waits over 400 ms.",
    },
    {
      type: "multi",
      q: "The service promises that 99% of requests are answered in under 500 ms. On which days was the promise broken?",
      fig: table(
        ["Day", "p50", "p99"],
        [
          ["Mon", "80 ms", "400 ms"],
          ["Tue", "85 ms", "460 ms"],
          ["Wed", "90 ms", "620 ms"],
          ["Thu", "85 ms", "480 ms"],
          ["Fri", "100 ms", "510 ms"],
        ],
      ),
      o: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      a: [2, 4],
      why: "A promise about 99% of requests is a promise about p99. Wednesday (620) and Friday (510) are over 500 ms. The medians all look healthy, which is exactly why a median alone can hide a broken promise.",
    },
    {
      type: "cat",
      q: "A dashboard for an online shop lists these items. Sort each into what goes IN to the system (load) or how the system RESPONDS (performance).",
      buckets: ["Load parameter", "Performance measure"],
      items: [
        ["Orders placed per minute", 0],
        ["Time from tapping Pay to seeing the confirmation", 1],
        ["Average number of items in a basket", 0],
        ["Share of requests that are searches rather than purchases", 0],
        ["99th-percentile checkout time", 1],
        ["Time to process one night's two million orders", 1],
      ],
      why: "Load parameters describe what you put on the system, and they differ by application. Performance measures describe how it copes: response time for interactive services, processing time or records per second for data jobs.",
    },
    {
      type: "bug",
      q: "A load-test script ends by announcing whether users will be happy. Which line judges them in a way that can hide slow experiences?",
      code: [
        "times = run_load_test(users=500, duration=60)",
        "avg = sum(times) / len(times)",
        "print('average response:', avg)",
        "if avg < 300: print('Users are happy')",
        "else: print('Too slow')",
      ],
      a: 3,
      why: "An average blends fast and slow requests: 95 requests at 100 ms and 5 at 2,000 ms still average under 300 ms, while 5 users in 100 wait two seconds. Judge happiness with a percentile such as p95 or p99 instead.",
    },
    {
      type: "order",
      q: "Put the steps in order for reading the p90 response time from 50 measurements.",
      items: [
        "Collect all 50 response times",
        "Sort them from fastest to slowest",
        "Count along to 90% of the list (the 45th value)",
        "Read the response time at that position",
      ],
      why: "A percentile is a position in the sorted data, so the data must be sorted first. For 50 values the 45th is 90% of the way along, and 10% of requests (5 of them) are slower than it.",
    },
    {
      type: "pick",
      q: "A load test produced these curves. Tap the HIGHEST load that still keeps p99 inside the promise (the dashed line).",
      fig: kneeChart,
      a: "l600",
      why: "At 600 requests per second p99 is 160 ms, under the 200 ms promise. At 800 it jumps to 420 ms. The median barely moves at 800, which shows why the tail, not the middle, tells you when the system stops coping.",
    },
  ]);

  /* ================= ds-twitter ================= */

  const accounts = (() => {
    const A = [
      ["a", "@harbour_news", "500,000", "60"],
      ["b", "@famous_chef", "20 million", "1"],
      ["c", "@gig_venue", "3 million", "5"],
      ["d", "@neighbour_ann", "900", "200"],
    ];
    let s = "";
    A.forEach(([id, n, f, p], i) => {
      const x = 8 + (i % 2) * 280,
        y = 8 + Math.floor(i / 2) * 88;
      s += pk(
        id,
        rc(x, y, 268, 78) +
          tx(x + 134, y + 26, n, { s: 14 }) +
          tx(x + 134, y + 48, `${f} followers`, { s: 12.5, c: "var(--blue-ink)" }) +
          tx(x + 134, y + 66, `${p} posts a day`, { s: 12.5, c: "var(--amber-ink)" }),
      );
    });
    return svg(556, 182, s);
  })();

  const cross = (() => {
    const X = (r) => 60 + r * 110,
      Y = (v) => 215 - v * 0.5;
    let s =
      pk(
        "left",
        `<rect x="${X(0)}" y="12" width="${X(1) - X(0)}" height="203" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/>` +
          tx((X(0) + X(1)) / 2, 34, "Zone 1", { s: 12, c: "var(--text-dim)" }),
      ) +
      pk(
        "right",
        `<rect x="${X(1)}" y="12" width="${X(4) - X(1)}" height="203" fill="var(--bg-2)" stroke="var(--line)" stroke-width="2"/>` +
          tx((X(1) + X(4)) / 2, 34, "Zone 2", { s: 12, c: "var(--text-dim)" }),
      );
    s += ln(60, 215, 500, 215, { s: "var(--line-2)", sw: 2 }) + ln(60, 12, 60, 215, { s: "var(--line-2)", sw: 2 });
    [0, 1, 2, 3, 4].forEach((r) => (s += tx(X(r), 233, r, { s: 11.5, c: "var(--text-dim)" })));
    [0, 100, 200, 300, 400].forEach((v) => (s += tx(52, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-faint)" })));
    s +=
      ln(X(0), Y(100), X(4), Y(104), { s: "var(--blue)", sw: 4 }) +
      ln(X(0), Y(1), X(4), Y(401), { s: "var(--amber)", sw: 4 });
    s +=
      tx(X(3) - 10, Y(104) - 12, "Fan-out on write", { s: 12.5, c: "var(--blue-ink)" }) +
      tx(X(1.5), Y(250), "Merge on read", { s: 12.5, c: "var(--amber-ink)" });
    s += tx(280, 252, "Timeline reads per post", { s: 12, w: 700, c: "var(--text-faint)" });
    return svg(560, 262, s);
  })();

  B.add("ds-twitter", [
    {
      type: "pick",
      q: "A hybrid system wants to know which account will cost the MOST fan-out writes in a day (writes = followers × posts). Tap it.",
      fig: accounts,
      a: "a",
      hint: "Multiply each card. Use millions: 0.5 × 60, 20 × 1, 3 × 5, and 900 × 200 is well under a million.",
      why: "The news account makes 0.5 million × 60 = 30 million writes a day, more than the chef (20 million × 1 = 20 million) and the venue (3 million × 5 = 15 million). Cost depends on followers AND how often someone posts, not on fame alone.",
    },
    {
      type: "order",
      q: "In a hybrid timeline, Alice follows ordinary friends and one celebrity. Put in order what happens when she opens the app.",
      items: [
        "Read Alice's pre-built timeline cache (her friends' posts)",
        "Look up which celebrity accounts she follows",
        "Fetch those celebrities' latest posts directly",
        "Merge both lists by time",
        "Show the finished timeline",
      ],
      why: "Ordinary posts were fanned out when written, so they are already waiting in her cache. Celebrity posts were never copied (too many writes), so they are fetched at read time and merged in.",
    },
    {
      type: "pick",
      q: "Every account has about 100 followers and follows about 100 accounts. The chart shows total operations per post as the number of timeline reads per post changes. Tap the zone where fan-out on write does LESS work.",
      fig: cross,
      a: "right",
      why: "Fan-out on write pays about 100 extra writes up front, then each read is one cheap lookup. Merge on read is nearly free to post, but every read costs about 100 lookups. The lines cross at one read per post; to the right of that, where posts are read often, fan-out on write wins.",
    },
    {
      type: "bug",
      q: "Opening the timeline is very slow for people who follow thousands of accounts. Which line does far more work than the screen needs?",
      code: [
        "function timeline(user):",
        "  result = []",
        "  for friend in following(user):",
        "    result += all_tweets_ever_by(friend)",
        "  return newest_50(sort_by_time(result))",
      ],
      a: 3,
      why: "The screen shows only 50 posts, yet this line downloads every tweet each friend ever wrote before sorting. Fetching just each friend's latest 50 would give the same answer with a fraction of the work. Even then, merge-on-read costs grow with the number followed.",
    },
    {
      type: "cat",
      q: "Which design is each symptom evidence of?",
      buckets: ["Merge on read", "Fan-out on write"],
      items: [
        ["Opening a timeline is slow for someone who follows 5,000 accounts", 0],
        ["One post by a huge account triggers millions of cache writes", 1],
        ["The same tweet is stored again in every follower's mailbox", 1],
        ["Posting is one cheap insert, however many followers there are", 0],
        ["Opening a timeline is a single cheap lookup", 1],
        ["Reading cost grows with the number of accounts you follow", 0],
      ],
      why: "Merge on read keeps writes trivial and pushes the work to every reader. Fan-out on write does the work once per post, in every follower's mailbox, so reads are cheap but celebrities are costly to post for.",
    },
    {
      type: "multi",
      q: "A team runs fan-out on write. Which changes to their app would make that design look WORSE? Select all that apply.",
      o: [
        "Average followers per account rises from 75 to 5,000",
        "People open their timeline once a week instead of daily",
        "People start following 2,000 accounts instead of 200",
        "Posting rate doubles overnight",
      ],
      a: [0, 1, 3],
      why: "More followers, or more posts, means more writes. Fewer timeline reads means the up-front work is rewarded less often. Following more accounts makes MERGE-on-read slower, but fan-out on write already reads a single mailbox, so it is not hurt.",
    },
  ]);

  /* ================= ds-scaling ================= */

  const hotNodes = (() => {
    const L = [
        ["N1", 20],
        ["N2", 25],
        ["N3", 95],
        ["N4", 15],
      ],
      base = 160;
    let s = "";
    L.forEach(([n, v], i) => {
      const x = 40 + i * 132,
        h = v * 1.3,
        c = "var(--blue)";
      s += pk(
        n.toLowerCase(),
        rc(x, 20, 110, 150, { rx: 12, sw: 2, f: "var(--bg-2)" }) +
          rc(x + 20, base - h + 10, 70, h, { rx: 6, s: c, f: "var(--blue-dim, var(--panel))", sw: 2 }) +
          tx(x + 55, base - h + 4, v + "% busy", { s: 12.5 }) +
          tx(x + 55, 186, n, { s: 14 }),
      );
    });
    s += tx(280, 208, "Each node owns a fixed set of accounts and only serves those", {
      s: 11.5,
      w: 700,
      c: "var(--text-faint)",
    });
    return svg(560, 218, s);
  })();

  const ceiling = (() => {
    const d = (m) => 10 * Math.pow(1.15, m),
      X = (m) => 50 + m * 20,
      Y = (v) => 195 - v * 0.62;
    let s = ln(50, 195, 540, 195, { s: "var(--line-2)", sw: 2 }) + ln(50, 12, 50, 195, { s: "var(--line-2)", sw: 2 });
    s +=
      ln(50, Y(100), 540, Y(100), { s: "var(--rose)", sw: 2.5, d: "7 6" }) +
      tx(56, Y(100) - 6, "Biggest machine you can buy", { a: "start", s: 12, c: "var(--rose-ink)" });
    let pts = "";
    for (let m = 0; m <= 24; m++) pts += `${X(m)},${Y(d(m))} `;
    s += `<polyline points="${pts}" fill="none" stroke="var(--amber)" stroke-width="3.5"/>`;
    [6, 12, 18, 24].forEach(
      (m) =>
        (s +=
          tx(X(m), 214, "Month " + m, { s: 11.5, c: "var(--text-dim)" }) +
          pk(
            "m" + m,
            `<circle cx="${X(m)}" cy="${Y(d(m))}" r="11" fill="var(--panel)" stroke="var(--amber)" stroke-width="3"/>`,
          )),
    );
    s += tx(56, 14, "Demand", { a: "start", s: 11.5, c: "var(--text-dim)" });
    return svg(560, 224, s);
  })();

  const shards = (() => {
    let s = "";
    [
      ["M1", "customers A–F"],
      ["M2", "customers G–L"],
      ["M3", "customers M–R"],
      ["M4", "customers S–Z"],
    ].forEach(([m, d], i) => {
      const x = 12 + i * 136,
        dead = i === 2;
      s +=
        rc(x, 12, 124, 100, { s: dead ? "var(--rose)" : "var(--teal)", f: dead ? "var(--rose-dim)" : "var(--panel)" }) +
        tx(x + 62, 36, m, { s: 15 }) +
        tx(x + 62, 62, "own CPU, RAM, disk", { s: 11, w: 700, c: "var(--text-dim)" }) +
        tx(x + 62, 88, d, { s: 12 });
      if (dead)
        s +=
          ln(x + 6, 18, x + 118, 106, { s: "var(--rose)", sw: 4 }) +
          ln(x + 118, 18, x + 6, 106, { s: "var(--rose)", sw: 4 });
    });
    s += tx(278, 136, "No copies: each customer's data is stored on exactly one machine", {
      s: 12,
      w: 700,
      c: "var(--text-faint)",
    });
    return svg(556, 146, s);
  })();
  Object.assign(partScope, { ceiling, hotNodes, shards });
})();

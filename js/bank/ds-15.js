(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { abTable, box2, ln, pk, rc, svg, table, tenCalls, tx } = partScope;
  const B = NIC.bank;

  const burstFig = (() => {
    let s = tx(10, 14, "Requests per second", { a: "start", s: 12, c: "var(--text-dim)" });
    [
      ["Server can handle", 100, "var(--teal)"],
      ["During a one-minute burst", 120, "var(--rose)"],
      ["After the burst", 80, "var(--blue)"],
    ].forEach(([l, v, c], i) => {
      const y = 28 + i * 34;
      s +=
        tx(10, y + 18, l, { a: "start", s: 12 }) +
        rc(190, y, v * 2.6, 24, { rx: 6, f: c, s: c, sw: 1 }) +
        tx(190 + v * 2.6 + 8, y + 18, v, { a: "start", s: 13 });
    });
    return svg(560, 140, s);
  })();

  B.add("ds-load", [
    {
      type: "slider",
      q: "A page waits for all ten backend calls. Each call is slow 1 time in 100. Roughly what percentage of page loads hit at least one slow call?",
      fig: tenCalls,
      min: 0,
      max: 50,
      step: 1,
      ans: 10,
      tol: 3,
      unit: "%",
      hint: "Ten chances, each at about 1 in 100.",
      why: "The chance all ten are fast is 0.99 to the power 10, about 0.90. So about 10% of pages are slow, even though each call is slow only 1% of the time. Tail latency spreads through a design with many calls.",
    },
    {
      type: "mcq",
      q: 'A checkout promises "almost every payment answers in under a second". Which service should it use?',
      fig: abTable,
      o: [
        "Service B, because its slowest requests are far milder",
        "Service A, because its median and average are lower",
        "Service A, because 99% of its requests are very fast",
        "Either one: the average is all that matters",
      ],
      a: 0,
      why: "The promise is about nearly every request, so the tail decides it. A is faster for most requests, but 1 request in 100 takes 2.5 seconds or more. B's worst 1% start at 0.6 seconds. Median and average hide this.",
    },
    {
      type: "order",
      q: "A load test adds more and more users. Put in order what you would expect to see.",
      items: [
        "Throughput rises in step with the number of users",
        "Response times stay flat while there is spare capacity",
        "Throughput stops rising because the system is at capacity",
        "Requests queue up and the p99 climbs sharply",
        "Timeouts and errors begin to appear",
      ],
      why: "While capacity is spare, extra load is absorbed with no visible cost. Once it runs out, extra requests wait in queues, so tail latency shoots up first and errors follow.",
    },
    {
      type: "slider",
      q: "The burst ends and load falls to 80 requests per second. The queue built up during the burst now drains. Roughly how many seconds until it is empty?",
      fig: burstFig,
      min: 0,
      max: 180,
      step: 5,
      ans: 60,
      tol: 15,
      unit: " s",
      hint: "Backlog = 20 extra per second × 60 seconds. It drains at 20 per second of spare capacity.",
      why: "During the burst 20 extra requests a second pile up for 60 seconds: 1,200 waiting. Afterwards there are 20 spare slots a second, so it takes 1,200 ÷ 20 = 60 seconds to clear. Users keep seeing slow answers long after the burst ends.",
    },
    {
      type: "bug",
      q: "A script combines the response times of several servers into one overall p99. Which line is wrong?",
      code: [
        "for server in servers:",
        "    p99s.append(percentile(server.times, 99))",
        "overall_p99 = sum(p99s) / len(p99s)",
        "print('overall p99:', overall_p99)",
      ],
      a: 2,
      why: "Percentiles cannot be averaged. One slow server's tail gets diluted by the others. Combine all the raw times (or the histograms) first and then take the 99th percentile.",
    },
    {
      type: "match",
      q: "Match each complaint to the measure that would show it.",
      pairs: [
        ['"Once in a while checkout hangs for ages"', "p99 response time"],
        ['"Most people say it feels quick"', "Median response time"],
        ['"Launch-day traffic is ten times a normal day"', "Peak requests per second"],
        ["\"Customers keep seeing 'something went wrong'\"", "Error rate"],
      ],
      why: "Rare slow experiences live in the tail (p99), typical ones in the median, demand is a load parameter, and failures show in the error rate. No single number covers all four.",
    },
  ]);

  /* ================= ds-twitter ================= */

  const followersFig = (() => {
    const f = [
      ["f1", "Follower 1 · opened 2 days ago"],
      ["f2", "Follower 2 · opened today"],
      ["f3", "Follower 3 · opened 14 months ago"],
      ["f4", "Follower 4 · opened 3 weeks ago"],
      ["f5", "Follower 5 · opened 2 years ago"],
    ];
    let s = "";
    f.forEach(([id, t], i) => {
      const y = 8 + i * 52;
      s +=
        ln(90, 120, 190, y + 20, { sw: 2 }) +
        pk(id, rc(190, y, 270, 40, { s: "var(--blue)" }) + tx(325, y + 25, t, { s: 12 }));
    });
    s += rc(10, 100, 80, 40) + tx(50, 125, "Author");
    return svg(470, 270, s);
  })();

  const bucketTable = table(
    ["Group", "Accounts", "Followers each", "Posts per day each"],
    [
      ["A", "1 million", "100", "2"],
      ["B", "10,000", "10,000", "4"],
      ["C", "100", "5 million", "10"],
    ],
  );

  const stepsFig = (() => {
    const st = [
      ["s1", "1 · Look up", "who I follow"],
      ["s2", "2 · Fetch latest", "tweets of each"],
      ["s3", "3 · Merge and", "sort by time"],
      ["s4", "4 · Show the", "first 50"],
    ];
    let s = "";
    st.forEach(
      ([id, a, b], i) =>
        (s +=
          pk(id, box2(8 + i * 138, 14, 126, 56, a, b, { s: "var(--blue)" })) +
          (i < 3 ? ln(134 + i * 138, 42, 146 + i * 138, 42, { sw: 2 }) : "")),
    );
    return svg(560, 84, s);
  })();

  B.add("ds-twitter", [
    {
      type: "pick",
      q: "A system writes each new tweet only into the timeline caches of followers who opened the app within the last 30 days. Tap every cache that gets a write.",
      fig: followersFig,
      a: ["f1", "f2", "f4"],
      why: "Followers 1, 2 and 4 opened the app within 30 days. Followers 3 and 5 have not been seen for over a year, so writing to their caches is wasted work. Their timeline can be built when (if) they ever return. This trims the fan-out bill without changing what active users see.",
    },
    {
      type: "bug",
      q: "This hybrid should push tweets from ordinary accounts into followers' timeline caches and leave huge accounts to be merged at read time. Yet the write bill is enormous. Which line is wrong?",
      code: [
        "def post(author, text):",
        "    id = save_tweet(author, text)",
        "    if follower_count(author) > 1_000_000:",
        "        push_to_follower_timelines(id)",
        "    # otherwise followers merge this tweet in when they read",
        "    return id",
      ],
      a: 2,
      why: "The test is the wrong way round: it pushes millions of cache writes for celebrities and leaves ordinary accounts to be merged on read. It should push when the count is below the threshold.",
    },
    {
      type: "cat",
      q: "Each trend below grows tenfold. Which design gets MORE expensive?",
      buckets: ["Merge on read", "Fan-out on write"],
      items: [
        ["The number of times each user opens their timeline a day", 0],
        ["The number of accounts each user follows", 0],
        ["The number of followers each account has", 1],
        ["The number of tweets posted each day", 1],
      ],
      why: "Merge on read pays on each timeline open, and more per open the more accounts you follow. Fan-out on write pays on each post, once per follower, so tweets per day and followers per account drive it.",
    },
    {
      type: "mcq",
      q: "Under fan-out on write, which group causes the most timeline-cache writes per day?",
      fig: bucketTable,
      o: [
        "Group C, with only 100 accounts",
        "Group A, with by far the most accounts",
        "Group B, the middle of the range",
        "They cause about the same",
      ],
      a: 0,
      hint: "Writes = accounts × followers × posts. Compare 100 × 5 million × 10 with 1 million × 100 × 2.",
      why: "C: 100 × 5,000,000 × 10 = 5 billion. B: 10,000 × 10,000 × 4 = 400 million. A: 1,000,000 × 100 × 2 = 200 million. A handful of huge accounts dominates the bill, which is why hybrids treat them differently.",
    },
    {
      type: "mcq",
      q: "A colleague says fan-out on write is wasteful, since most followers will never read most tweets. Which fact best answers them?",
      o: [
        "Timeline reads far outnumber posts, so paying once per post saves repeated work",
        "Writes to caches are always cheaper than reads from any database",
        "Followers are certain to read every tweet they are sent",
        "Fan-out on write needs no storage for the timelines",
      ],
      a: 0,
      why: "The design is a bet on the read-to-write ratio. With hundreds of reads for every post, preparing timelines at post time costs less overall than merging on every open. It is not free, and the bet fails for huge accounts.",
    },
    {
      type: "pick",
      q: "A user opens their timeline under fan-out on write, where it is already built. Tap EVERY step that no longer has to happen at read time.",
      fig: stepsFig,
      a: ["s1", "s2", "s3"],
      why: "The merging was done earlier, at post time. At read time the app only has to show the first page of the ready-made cache, which is step 4. This is the trade: slower posting for much faster reading.",
    },
  ]);

  /* ================= ds-scaling ================= */

  const serialFig = (() => {
    let s = tx(10, 14, "A job takes 100 minutes on one machine", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      rc(10, 28, 100, 36, { rx: 6, f: "var(--amber)", s: "var(--amber)", sw: 1 }) +
      tx(60, 51, "20 min", { c: "#fff" }) +
      tx(60, 82, "must run in one piece", { s: 12, c: "var(--text-dim)" });
    s +=
      rc(110, 28, 400, 36, { rx: 6, f: "var(--blue)", s: "var(--blue)", sw: 1 }) +
      tx(310, 51, "80 min", { c: "#fff" }) +
      tx(310, 82, "splits across as many machines as you like", { s: 12, c: "var(--text-dim)" });
    return svg(530, 96, s);
  })();

  const shardTable = table(
    ["Sharding key", "Node 1", "Node 2", "Node 3", "Node 4"],
    [
      ["Country", "55%", "25%", "12%", "8%"],
      ["Hash of the user id", "26%", "25%", "25%", "24%"],
      ["Month the user signed up", "4%", "6%", "10%", "80%"],
    ],
  );

  const queryFig = (() => {
    const n = [
      ["n1", "Exeter, Bath"],
      ["n2", "Leeds, York"],
      ["n3", "Cardiff, Swansea"],
      ["n4", "Glasgow, Perth"],
    ];
    let s =
      rc(110, 8, 340, 32, { s: "var(--violet)" }) + tx(280, 29, "Query: all customers in Exeter and Leeds", { s: 12 });
    n.forEach(
      ([id, c], i) => (s += pk(id, box2(8 + i * 138, 76, 126, 56, "Node " + (i + 1), c, { s: "var(--blue)" }))),
    );
    return svg(560, 144, s);
  })();

  B.add("ds-scaling", [
    {
      type: "slider",
      q: "Even with unlimited machines, roughly how many times faster than a single machine can this job get?",
      fig: serialFig,
      min: 1,
      max: 20,
      step: 1,
      ans: 5,
      tol: 1,
      unit: "×",
      hint: "With endless machines the 80 minutes shrink to almost nothing. What is left?",
      why: "The 20-minute part cannot be split, so the best possible time is just over 20 minutes: 100 ÷ 20 = 5 times faster. With 10 machines it takes 20 + 8 = 28 minutes. Scaling out helps only the part of the work that can be shared.",
    },
    {
      type: "mcq",
      q: "Which sharding key spreads the work evenly across the four nodes?",
      fig: shardTable,
      o: [
        "Hash of the user id, with every node near 25%",
        "Country, because users in one place stay together",
        "Sign-up month, because it is easy to explain",
        "Any of them: the key never changes the load",
      ],
      a: 0,
      why: "A hash scatters users almost evenly, so every node carries about a quarter. Country makes Node 1 a hot spot. Sign-up month sends nearly all new activity to one node. A shard that carries most of the load defeats scaling out.",
    },
    {
      type: "order",
      q: "A shop's single web server keeps baskets in its own memory. Put the steps in order for scaling out safely.",
      items: [
        "Move baskets out of server memory into a shared store",
        "Put a load balancer in front of the server",
        "Start a second identical server behind the balancer",
        "Switch one server off while users browse, to prove nothing is lost",
        "Add more servers as demand grows",
      ],
      why: "A second server only helps if either one can serve any user. So state moves out first. Then add the balancer and the copy, test by removing one, and only then grow.",
    },
    {
      type: "match",
      q: "Match each consequence to the architecture it describes.",
      pairs: [
        ["Upgrading means buying a bigger, much pricier single machine", "Shared memory"],
        ["All the nodes queue up at one common storage unit", "Shared disk"],
        ["Each node adds its own capacity, but data must be split between them", "Shared nothing"],
      ],
      why: "Shared memory is one big machine (scaling up). Shared disk puts many machines on one storage array, which becomes the bottleneck. Shared nothing scales out best, at the cost of splitting the data.",
    },
    {
      type: "bug",
      q: "Adding a fourth server to this setup would send most users to a different server, so their cached data is lost. Which line causes that?",
      code: [
        "servers = ['web1', 'web2', 'web3']",
        "def pick_server(user_id):",
        "    return servers[user_id % 3]",
        "# next week: add 'web4' and change the 3 to a 4",
      ],
      a: 2,
      hint: "Try user ids 0 to 11 with 3 servers, then with 4. How many land on the same server?",
      why: "Choosing by id % number-of-servers ties every user's place to the server count. Changing 3 to 4 leaves only 3 of every 12 users where they were, so 75% move. Schemes that move only a small share of data when servers are added avoid this.",
    },
    {
      type: "pick",
      q: "The data is partitioned by city, as shown. Tap every node that must be asked to answer the query.",
      fig: queryFig,
      a: ["n1", "n2"],
      why: "Exeter's customers live on Node 1 and Leeds's on Node 2. The other nodes hold nothing relevant, so they can be left alone. Choosing a partition key that matches common queries keeps a query from having to ask every node.",
    },
  ]);

  /* ================= ds-maintain ================= */

  const errBars = (() => {
    const v = [0.5, 0.6, 1, 2.5, 3.5, 6, 9],
      base = 190,
      k = 16;
    let s = tx(10, 14, "Share of requests failing, per minute", { a: "start", s: 12, c: "var(--text-dim)" });
    v.forEach((d, i) => {
      const x = 30 + i * 74,
        h = d * k;
      s += pk(
        "m" + (i + 1),
        rc(x, base - h, 54, h, { rx: 6, f: "var(--panel)", s: "var(--rose)", sw: 2 }) +
          tx(x + 27, base - h - 6, d + "%", { s: 12 }) +
          tx(x + 27, base + 17, "Min " + (i + 1), { s: 12, c: "var(--text-dim)" }),
      );
    });
    s +=
      ln(20, base - 2 * k, 548, base - 2 * k, { s: "var(--amber)", d: "7 6" }) +
      tx(24, base - 2 * k - 6, "Rule: above 2% for two minutes in a row", {
        a: "start",
        s: 12,
        c: "var(--amber-ink, var(--text))",
      });
    return svg(560, 215, s);
  })();

  const debtBars = (() => {
    const A = [10, 9, 8, 6, 4, 3],
      Bv = [8, 8, 8, 8, 8, 8],
      base = 180,
      k = 14;
    let s = tx(10, 14, "Features shipped per month", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      rc(330, 4, 12, 12, { rx: 3, f: "var(--amber)", s: "var(--amber)", sw: 1 }) +
      tx(348, 15, "Team A: never tidies up", { a: "start", s: 12 });
    s +=
      rc(330, 22, 12, 12, { rx: 3, f: "var(--teal)", s: "var(--teal)", sw: 1 }) +
      tx(348, 33, "Team B: spends time tidying", { a: "start", s: 12 });
    A.forEach((a, i) => {
      const x = 30 + i * 86;
      s += pk(
        "m" + (i + 1),
        rc(x, base - a * k, 34, a * k, { rx: 5, f: "var(--amber)", s: "var(--amber)", sw: 1 }) +
          rc(x + 38, base - Bv[i] * k, 34, Bv[i] * k, { rx: 5, f: "var(--teal)", s: "var(--teal)", sw: 1 }) +
          tx(x + 17, base - a * k - 5, a, { s: 12 }) +
          tx(x + 55, base - Bv[i] * k - 5, Bv[i], { s: 12 }) +
          tx(x + 36, base + 17, "Month " + (i + 1), { s: 12, c: "var(--text-dim)" }),
      );
    });
    return svg(560, 205, s);
  })();

  const costFig = (() => {
    let s = tx(10, 14, "Where a typical system's lifetime cost goes", { a: "start", s: 12, c: "var(--text-dim)" });
    s +=
      rc(10, 28, 50, 36, { rx: 6, f: "var(--blue)", s: "var(--blue)", sw: 1 }) +
      tx(35, 51, "10%", { c: "#fff" }) +
      tx(35, 82, "building", { s: 12, c: "var(--text-dim)" });
    s +=
      rc(60, 28, 450, 36, { rx: 6, f: "var(--amber)", s: "var(--amber)", sw: 1 }) +
      tx(285, 51, "90%", { c: "#fff" }) +
      tx(285, 82, "running, fixing and changing it", { s: 12, c: "var(--text-dim)" });
    return svg(530, 96, s);
  })();
  Object.assign(partScope, { costFig, debtBars, errBars });
})();

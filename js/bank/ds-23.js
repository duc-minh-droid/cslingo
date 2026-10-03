(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { ci, hit, ln, pk, rc, svg, tx } = partScope;
  const B = NIC.bank;

  /* =====================================================================
     1.4  ds-load
     ===================================================================== */

  // CDF: share of requests finished within a time, for two services
  const loadCdf = (() => {
    const X = (ms) => 50 + ms * 0.185,
      Y = (p) => 240 - p * 2;
    const A = [
      [0, 0],
      [50, 22],
      [100, 50],
      [200, 76],
      [500, 90],
      [1000, 96],
      [1800, 99],
      [2000, 99.4],
    ];
    const Bp = [
      [0, 0],
      [100, 4],
      [200, 24],
      [300, 50],
      [500, 90],
      [700, 99],
      [1000, 100],
      [2000, 100],
    ];
    const path = (a) => a.map(([m, p], i) => `${i ? "L" : "M"} ${X(m).toFixed(1)} ${Y(p).toFixed(1)}`).join(" ");
    let s = ln(50, 240, 420, 240, { s: "var(--line-2)" }) + ln(50, 30, 50, 240, { s: "var(--line-2)" });
    [0, 500, 1000, 1500, 2000].forEach((m) => (s += tx(X(m), 258, m, { s: 12, c: "var(--text-dim)" })));
    [0, 50, 100].forEach((p) => (s += tx(42, Y(p) + 4, p + "%", { a: "end", s: 12, c: "var(--text-dim)" })));
    s += tx(235, 276, "response time (ms)", { s: 12, c: "var(--text-dim)" });
    s +=
      ln(50, Y(99), 420, Y(99), { s: "var(--rose)", sw: 2, d: "6 4" }) +
      tx(414, Y(99) - 8, "99% of requests", { a: "end", s: 12, c: "var(--rose-ink)" });
    s +=
      ln(X(1000), 30, X(1000), 240, { s: "var(--amber)", sw: 2.5, d: "6 4" }) +
      tx(X(1000) + 6, 226, "1 s limit", { a: "start", s: 12, c: "var(--amber-ink)" });
    s += pk(
      "A",
      `<path d="${path(A)}" fill="none" stroke="var(--violet)" stroke-width="4" stroke-linejoin="round"/>` +
        rc(X(2000) - 66, Y(60), 62, 24, { sw: 2.2, rx: 12, s: "var(--violet)" }) +
        tx(X(2000) - 35, Y(60) + 16, "Service A", { s: 11.5 }),
    );
    s += pk(
      "B",
      `<path d="${path(Bp)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>` +
        rc(X(700) - 30, Y(30), 62, 24, { sw: 2.2, rx: 12, s: "var(--blue)" }) +
        tx(X(700) + 1, Y(30) + 16, "Service B", { s: 11.5 }),
    );
    s += tx(14, 136, "share finished", { s: 12, c: "var(--text-dim)" }).replace(
      "<text ",
      `<text transform="rotate(-90 14 136)" `,
    );
    return svg(440, 284, s);
  })();

  // waterfall: one page, four backend calls (two chains)
  const loadFall = (() => {
    const x0 = 80,
      k = 0.85;
    let s = "";
    [0, 100, 200, 300, 400].forEach(
      (t) =>
        (s +=
          ln(x0 + t * k, 30, x0 + t * k, 190, { s: "var(--line)", sw: 1.5 }) +
          tx(x0 + t * k, 206, t, { s: 11, c: "var(--text-dim)" })),
    );
    s += tx(x0 + 200 * k, 224, "milliseconds", { s: 11, c: "var(--text-dim)" });
    const R = [
      ["auth", "Auth", 0, 120, "var(--blue)"],
      ["profile", "Profile", 0, 300, "var(--violet)"],
      ["orders", "Orders", 120, 220, "var(--amber)"],
      ["recs", "Recs", 300, 380, "var(--teal)"],
    ];
    R.forEach(([id, t, a, b, c], i) => {
      const y = 40 + i * 38;
      s +=
        tx(x0 - 8, y + 17, t, { a: "end" }) +
        rc(x0 + a * k, y, (b - a) * k, 26, { f: c, fo: 0.45, s: c, sw: 2.2, rx: 5 }) +
        tx(x0 + ((a + b) / 2) * k, y + 17, `${b - a} ms`, { s: 11 });
      s += hit(id, 4, y - 5, 432, 36, 8);
    });
    s +=
      `<path d="M ${x0 + 120 * k} 66 V 78 H ${x0 + 120 * k} V 116" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-dasharray="4 3"/>` +
      `<path d="M ${x0 + 300 * k} 92 V 104 V 154" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-dasharray="4 3"/>`;
    return svg(440, 232, s);
  })();

  // stacked bars: where the time goes at p50 and p99
  const loadStack = (() => {
    const S = [
        ["network", "var(--blue)", 20, 25],
        ["waiting in a queue", "var(--amber)", 5, 400],
        ["app code", "var(--violet)", 30, 40],
        ["database", "var(--teal)", 25, 60],
      ],
      k = 0.66;
    let s = "";
    [
      ["typical request (p50)", 2],
      ["slowest 1 in 100 (p99)", 3],
    ].forEach(([t, ix], r) => {
      const y = 28 + r * 70;
      s += tx(12, y - 8, t, { a: "start", s: 12 });
      let x = 12;
      S.forEach(([n, c, a, b]) => {
        const v = r ? b : a;
        s += rc(x, y, v * k, 34, { f: c, fo: 0.55, s: c, sw: 2, rx: 3 });
        x += v * k;
      });
      s += tx(x + 8, y + 22, (r ? 525 : 80) + " ms", { a: "start", s: 13 });
    });
    S.forEach(([n, c], i) => {
      const lx = 12 + (i % 2) * 210,
        ly = 176 + Math.floor(i / 2) * 24;
      s +=
        rc(lx, ly - 11, 16, 16, { f: c, fo: 0.55, s: c, sw: 2, rx: 4 }) + tx(lx + 24, ly + 2, n, { a: "start", s: 12 });
    });
    return svg(440, 226, s);
  })();

  B.add("ds-load", [
    {
      type: "pick",
      q: 'The promise is: "at least 99% of requests finish within 1 second". Each curve shows the share of requests finished by a given time. Tap the service that keeps the promise.',
      fig: loadCdf,
      a: "B",
      why: "Service B is at 99% by about 700 ms, inside the 1 s limit. Service A is quicker for the typical request (half done in 100 ms against 300 ms) but only 96% are done at 1 s, because its slowest few take almost 2 s. A promise about the tail needs the tail, not the median.",
    },
    {
      type: "pick",
      q: "A page waits for all four backend calls (bars). Orders can only start once Auth has answered, and Recs once Profile has. Tap every call whose speed-up would make the page load sooner.",
      fig: loadFall,
      a: ["profile", "recs"],
      why: "The page is done when its longest chain finishes: Profile then Recs, 300 + 80 = 380 ms. Auth then Orders ends at 220 ms, which is not holding anything up, so speeding it up changes nothing. Look for the slowest chain, not the single biggest bar.",
    },
    {
      type: "mcq",
      q: "The bars show where the time goes for a typical request and for the slowest 1 in 100. Which single change would shrink the 99th-percentile response the most?",
      fig: loadStack,
      o: [
        "Faster network links between regions",
        "Spare servers, so requests rarely queue",
        "A quicker database query plan",
        "Smaller JSON responses",
      ],
      a: 1,
      why: "The slow requests are not slow because of their network, app or database work, which grow only a little. They are slow because they waited about 400 ms in a queue. Cutting the wait, by keeping servers less busy, fixes the tail; shaving the other parts barely touches it.",
    },
  ]);

  /* =====================================================================
     1.5  ds-twitter
     ===================================================================== */

  // log-log scatter: followers against posts per day
  const twScatter = (() => {
    const X = (f) => 60 + 72 * (Math.log10(f) - 2),
      Y = (p) => 246 - 100 * Math.log10(p);
    let s = ln(60, 246, 420, 246, { s: "var(--line-2)" }) + ln(60, 40, 60, 246, { s: "var(--line-2)" });
    [
      ["100", 2],
      ["1k", 3],
      ["10k", 4],
      ["100k", 5],
      ["1M", 6],
      ["10M", 7],
    ].forEach(([t, e]) => (s += tx(X(Math.pow(10, e)), 264, t, { s: 11, c: "var(--text-dim)" })));
    [
      [1, "1"],
      [10, "10"],
      [100, "100"],
    ].forEach(([p, t]) => (s += tx(52, Y(p) + 4, t, { a: "end", s: 11, c: "var(--text-dim)" })));
    s +=
      tx(240, 282, "followers (each tick is 10 times more)", { s: 11, c: "var(--text-dim)" }) +
      tx(12, 140, "posts per day (log scale)", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 140)" `,
      );
    s +=
      ln(X(1e4), Y(100), X(1e6), Y(1), { s: "var(--rose)", sw: 2.5, d: "7 5" }) +
      tx(424, 104, "1 million writes a day", { a: "end", s: 12, c: "var(--rose-ink)" });
    const P = [
      ["a", 200, 5, "Maya"],
      ["b", 5e4, 10, "BrightNews"],
      ["c", 2e6, 2, "StarCo"],
      ["d", 3e4, 80, "TickerBot"],
      ["e", 300, 40, "Sam"],
      ["f", 5e5, 1, "ClubFC"],
    ];
    P.forEach(([id, f, p, t]) => {
      const x = X(f),
        y = Y(p),
        left = id === "b" || id === "f";
      s += pk(
        id,
        ci(x, y, 8, { f: "var(--blue)", fo: 0.7, s: "var(--blue)" }) +
          tx(x + (left ? -12 : 12), y + (id === "f" ? -8 : 4), t, { a: left ? "end" : "start", s: 12 }),
      );
    });
    return svg(440, 292, s);
  })();

  // small multiples: posts and timeline reads per second, in three workloads
  const twPanels = (() => {
    const P = [
        ["Panel X", 5, 300],
        ["Panel Y", 100, 10],
        ["Panel Z", 20, 20],
      ],
      w = 140,
      k = 0.4;
    let s = "";
    P.forEach(([t, po, re], i) => {
      const x = 4 + i * (w + 4),
        base = 172;
      s +=
        rc(x, 4, w, 208, { sw: 2, s: "var(--line)", rx: 10 }) +
        tx(x + w / 2, 24, t) +
        ln(x + 10, base, x + w - 10, base, { sw: 2 });
      s +=
        rc(x + 26, base - po * k, 38, po * k, { f: "var(--violet)", fo: 0.55, s: "var(--violet)", sw: 2, rx: 4 }) +
        tx(x + 45, base - po * k - 6, po + "k", { s: 13 }) +
        tx(x + 45, base + 17, "posts/s", { s: 11.5, c: "var(--text-dim)" });
      s +=
        rc(x + 84, base - re * k, 38, re * k, { f: "var(--amber)", fo: 0.55, s: "var(--amber)", sw: 2, rx: 4 }) +
        tx(x + 103, base - re * k - 6, re + "k", { s: 13 }) +
        tx(x + 103, base + 17, "reads/s", { s: 11.5, c: "var(--text-dim)" });
      s += hit(["x", "y", "z"][i], x, 4, w, 208, 10);
    });
    return svg(3 * (w + 4) + 4, 216, s);
  })();

  // Venn: followers of two accounts
  const twVenn = (() => {
    let s =
      ci(160, 110, 88, { f: "var(--violet)", fo: 0.14, s: "var(--violet)" }) +
      ci(280, 110, 88, { f: "var(--amber)", fo: 0.14, s: "var(--amber)" });
    s +=
      tx(130, 14, "followers of Bob", { c: "var(--violet-ink)" }) +
      tx(310, 14, "followers of Cara", { c: "var(--amber-ink)" });
    const dot = (x, y) => ci(x, y, 9, { f: "var(--blue)", fo: 0.6, s: "var(--blue)", sw: 2 });
    [
      [110, 80],
      [110, 118],
      [125, 150],
    ].forEach(([x, y]) => (s += dot(x, y)));
    [
      [220, 92],
      [220, 132],
    ].forEach(([x, y]) => (s += dot(x, y)));
    [
      [320, 90],
      [335, 135],
    ].forEach(([x, y]) => (s += dot(x, y)));
    s += tx(220, 212, "each dot is one user; Bob and Cara each post once", { s: 11.5, c: "var(--text-dim)" });
    return svg(440, 222, s);
  })();

  B.add("ds-twitter", [
    {
      type: "pick",
      q: "Fan-out on write does one cache write per follower for every post, so an account's daily cost is followers × posts per day. The dashed line marks 1 million writes a day (both axes are log scales). Tap every account whose cost is above that line.",
      fig: twScatter,
      a: ["c", "d"],
      hint: "Points to the right of the dashed line cost more than 1 million a day.",
      why: "StarCo has 2 million followers and posts twice: 4 million writes a day. TickerBot has only 30,000 followers but posts 80 times a day: 2.4 million. A bot can be as costly as a celebrity, so a hybrid scheme should choose by followers × posts, not by fame alone.",
    },
    {
      type: "pick",
      q: "Merge-on-read costs 1 write per post and 100 fetches per timeline read. Fan-out-on-write costs 75 writes per post and 1 fetch per read. Each panel shows a workload (thousands per second). Tap the panel where merge-on-read is the cheaper choice.",
      fig: twPanels,
      a: "y",
      hint: "Work out each approach's total for Panel Y, then check Panel Z.",
      why: "In Panel Y there are ten times more posts than reads: merge-on-read costs about 1.1 million operations a second, fan-out about 7.5 million. Panel Z looks balanced but fan-out still wins slightly (1.5 against 2.0 million). Only when reads are rarer than posts does doing the work at read time pay off.",
    },
    {
      type: "mcq",
      q: "Bob and Cara each post once. Under fan-out on write, each post is copied into the timeline cache of every follower (the diagram shows both followings). How many timeline-cache writes happen in total?",
      fig: twVenn,
      o: ["7 writes", "9 writes", "5 writes", "2 writes"],
      a: 1,
      hint: "Count the dots in each circle, then add the two circles.",
      why: "Bob has 5 followers and Cara has 4, so 5 + 4 = 9 writes. The 2 users who follow both get two writes, one per post, because the cost is counted per post and follower pair, not per user. The 7 would be the number of different users.",
    },
  ]);

  /* =====================================================================
     1.6  ds-scaling
     ===================================================================== */

  // line plot: demand through a day
  const scDemand = (() => {
    const D = [
      100, 80, 70, 60, 60, 80, 150, 300, 450, 500, 480, 450, 500, 520, 480, 450, 500, 600, 750, 800, 700, 500, 300, 150,
    ];
    const X = (h) => 52 + h * 15.4,
      Y = (v) => 222 - v * 0.22;
    let s = ln(52, 222, 420, 222, { s: "var(--line-2)" }) + ln(52, 30, 52, 222, { s: "var(--line-2)" });
    [0, 6, 12, 18, 24].forEach((h) => (s += tx(X(h), 240, h + ":00", { s: 11, c: "var(--text-dim)" })));
    [0, 400, 800].forEach((v) => (s += tx(44, Y(v) + 4, v, { a: "end", s: 11, c: "var(--text-dim)" })));
    let d = `M ${X(0)} ${Y(0)}`;
    D.forEach((v, h) => (d += ` L ${X(h + 0.5).toFixed(1)} ${Y(v).toFixed(1)}`));
    d += ` L ${X(24)} ${Y(0)} Z`;
    s += `<path d="${d}" fill="var(--blue)" fill-opacity="0.3" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    s +=
      ln(52, Y(800), 420, Y(800), { s: "var(--rose)", sw: 2.5, d: "7 5" }) +
      tx(414, Y(800) - 6, "one big machine, sized for the peak (800)", { a: "end", s: 11, c: "var(--rose-ink)" });
    s +=
      tx(236, 258, "time of day", { s: 11, c: "var(--text-dim)" }) +
      tx(12, 126, "requests per second", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 126)" `,
      );
    return svg(440, 266, s);
  })();

  // heat grid: load per node per hour
  const scHeat = (() => {
    const V = [
      [22, 25, 24, 23, 26, 24],
      [21, 24, 23, 22, 25, 23],
      [96, 99, 100, 100, 98, 100],
      [20, 22, 21, 24, 22, 23],
    ];
    let s = tx(240, 13, "hour of the day", { c: "var(--text-dim)", s: 11.5 });
    ["9", "10", "11", "12", "13", "14"].forEach((h, j) => (s += tx(100 + j * 54 + 25, 32, h + ":00", { s: 11 })));
    V.forEach((row, i) => {
      s += tx(88, 58 + i * 36 + 4, `Node ${i + 1}`, { a: "end" });
      row.forEach(
        (v, j) =>
          (s +=
            rc(100 + j * 54, 40 + i * 36, 50, 32, { sw: 2, s: "var(--line)", rx: 6 }) +
            rc(100 + j * 54, 40 + i * 36, 50, 32, {
              f: v > 90 ? "var(--rose)" : "var(--teal)",
              fo: v > 90 ? 0.55 : 0.2,
              s: "none",
              sw: 0,
              rx: 6,
            }) +
            tx(125 + j * 54, 61 + i * 36, v + "%")),
      );
    });
    s += tx(220, 200, "% of each node's capacity in use", { s: 11.5, c: "var(--text-dim)" });
    return svg(440, 208, s);
  })();

  B.add("ds-scaling", [
    {
      type: "slider",
      q: "One big machine is bought for the peak (dashed line), and demand through the day is shown. Roughly what share of the big machine's capacity sits idle on average over the 24 hours?",
      fig: scDemand,
      min: 0,
      max: 100,
      step: 5,
      ans: 53,
      tol: 10,
      unit: "%",
      hint: "Most hours run at about 300 to 500, against a capacity of 800.",
      why: "Average demand is about 376 against a capacity of 800, so roughly half the machine is idle, all day, because it was sized for 8 pm. A fleet of small machines that grows and shrinks with demand (elasticity) pays for what is used. That is a cost argument for scaling out.",
    },
    {
      type: "mcq",
      q: "A cluster stores customer data on 4 nodes, split by customer. The map shows how busy each node is across six hours. What does this pattern show, and what is the sensible fix?",
      fig: scHeat,
      o: [
        "A hot partition: split up the busy node's data",
        "Too few machines: add more nodes of the same kind",
        "A network fault: nodes 1, 2 and 4 get no traffic",
        "A new machine that will balance itself in time",
      ],
      a: 0,
      why: "Nodes 1, 2 and 4 are only about a quarter busy, so capacity is not the problem. Node 3 is pinned near 100% hour after hour: one customer or key sends it most of the work. New nodes would get only the leftovers, so the busy partition itself has to be split across machines.",
    },
    {
      type: "bug",
      q: "A web fleet is meant to scale with demand, but servers are added and removed over and over, every few minutes, wasting money and causing blips. Which line of the autoscaler's settings is the cause?",
      code: ["scale_out_when_cpu_over: 70", "scale_in_when_cpu_under: 70", "check_every_seconds: 10", "min_servers: 2"],
      a: 1,
      why: "When CPU passes 70% a server is added, which spreads the load and pushes CPU just below 70%, so the same rule removes it again. Scale in should trigger well below scale out, say under 30%, leaving a gap so the fleet settles instead of flapping.",
    },
  ]);
})();

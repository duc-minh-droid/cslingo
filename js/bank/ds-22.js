(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { arrow, ci, hit, ln, pk, rc, svg, tx, xm } = partScope;
  const B = NIC.bank;

  /* =====================================================================
     1.1  ds-why
     ===================================================================== */

  // sequence: a write at London, a lag of 2 s, reads at two copies
  const whySeq = (() => {
    const Y = (t) => 66 + t * 48,
      xl = 58,
      xs = 322;
    let s =
      ln(xl, 38, xl, 268, { s: "var(--line)", sw: 2, d: "4 4" }) +
      ln(xs, 38, xs, 268, { s: "var(--line)", sw: 2, d: "4 4" });
    s +=
      rc(xl - 54, 6, 108, 30, { sw: 2.5 }) +
      tx(xl, 26, "London copy", { s: 13 }) +
      rc(xs - 54, 6, 108, 30, { sw: 2.5 }) +
      tx(xs, 26, "Sydney copy", { s: 13 });
    s += tx(xl + 10, Y(0) - 8, "write: balance 60 (was 100)", { a: "start", s: 12, c: "var(--teal-ink)" });
    s +=
      arrow(xl, Y(0), xs, Y(2), { s: "var(--teal)" }) +
      tx(250, Y(2) + 22, "copy lands at 2 s", { a: "end", s: 12, c: "var(--teal-ink)" });
    [
      ["r1", 0.5, "read 0.5 s", 1],
      ["r2", 1, "read 1 s", 0],
      ["r3", 1.5, "read 1.5 s", 1],
      ["r4", 2.5, "read 2.5 s", 1],
      ["r5", 4, "read 4 s", 1],
    ].forEach(([id, t, lbl, syd]) => {
      const px = syd ? xs + 8 : xl + 8;
      s +=
        ln(syd ? xs : xl, Y(t), px, Y(t), { s: "var(--text-dim)", sw: 2 }) +
        pk(id, rc(px, Y(t) - 13, 88, 26, { sw: 2.2, rx: 13 }) + tx(px + 44, Y(t) + 5, lbl, { s: 12 }));
    });
    s +=
      tx(14, 160, "time", { s: 12, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 14 160)" `) +
      arrow(24, 100, 24, 230, { s: "var(--text-dim)", sw: 1.5 });
    return svg(424, 276, s);
  })();

  // stacked bar: where one server's downtime comes from
  const whyStack = (() => {
    const S = [
      ["disk dies", 4, "var(--rose)"],
      ["upgrade restarts", 10, "var(--amber)"],
      ["power cut", 3, "var(--violet)"],
      ["network outage", 2, "var(--blue)"],
      ["app bug crash", 5, "var(--teal)"],
    ];
    const k = 16.4;
    let s = tx(220, 16, "one server in one building: hours of downtime in a year", { c: "var(--text-dim)", s: 11.5 });
    let x = 20;
    S.forEach(([t, h, c]) => {
      s += rc(x, 30, h * k, 44, { f: c, fo: 0.55, s: c, sw: 2.5, rx: 4 }) + tx(x + (h * k) / 2, 58, h + "h", { s: 13 });
      x += h * k;
    });
    S.forEach(([t, h, c], i) => {
      const lx = 20 + (i % 2) * 210,
        ly = 104 + Math.floor(i / 2) * 26;
      s +=
        rc(lx, ly - 11, 16, 16, { f: c, fo: 0.55, s: c, sw: 2, rx: 4 }) +
        tx(lx + 24, ly + 2, `${t}, ${h} h`, { a: "start", s: 12 });
    });
    s += tx(220, 184, "total 24 hours a year", { c: "var(--text-dim)", s: 11.5 });
    return svg(440, 194, s);
  })();

  // scatter quadrant: harm of stale data against harm of waiting
  const whyScatter = (() => {
    const X = (v) => 52 + v * 37,
      Y = (v) => 244 - v * 22;
    let s = ln(52, 244, 424, 244, { s: "var(--line-2)" }) + ln(52, 24, 52, 244, { s: "var(--line-2)" });
    s += ln(X(0), Y(0), X(10), Y(10), { s: "var(--line-2)", sw: 2, d: "6 5" });
    s +=
      tx(238, 270, "harm if a user sees slightly old data  →", { s: 11, c: "var(--text-dim)" }) +
      tx(12, 134, "harm if the app makes them wait  →", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 134)" `,
      );
    [0, 5, 10].forEach(
      (v) => (s += tx(X(v), 258, v === 0 ? "none" : v === 10 ? "huge" : "", { s: 10, c: "var(--text-dim)" })),
    );
    const P = [
      ["a", 1, 8.3, "like counter"],
      ["b", 9, 3, "bank transfer"],
      ["c", 2.1, 5.6, "online status"],
      ["d", 8, 5, "last flight seat"],
      ["e", 3.6, 7.2, "photo feed"],
      ["f", 6.5, 2, "medicine stock"],
    ];
    P.forEach(([id, x, y, t]) => {
      const anchor = x > 6 ? "end" : "start",
        dx = x > 6 ? -14 : 14;
      s += pk(
        id,
        ci(X(x), Y(y), 8, { f: "var(--blue)", fo: 0.7, s: "var(--blue)" }) +
          tx(X(x) + dx, Y(y) + 4, t, { a: anchor, s: 12 }),
      );
    });
    s +=
      tx(100, 40, "wait hurts more", { s: 11, c: "var(--text-dim)", a: "start" }) +
      tx(420, 232, "stale hurts more", { s: 11, c: "var(--text-dim)", a: "end" });
    return svg(440, 276, s);
  })();

  B.add("ds-why", [
    {
      type: "pick",
      q: "A bank balance is changed in London and copied to Sydney, which takes 2 seconds. Reads happen at both places (drawn on a time line). Tap every read that returns the OLD balance of 100.",
      fig: whySeq,
      a: ["r1", "r3"],
      why: "The new balance only lands in Sydney at 2 seconds. Sydney's reads at 0.5 s and 1.5 s come before it, so they are stale. London already holds 60, so its read at 1 s is right, and Sydney is right from 2.5 s on. Stale reads are the price of answering from a copy that has not caught up.",
    },
    {
      type: "slider",
      q: "Over a year, one server in one building is down for the 24 hours shown. A second identical server is added in the same building, behind a load balancer, and upgrades are done one server at a time. Roughly how many of the 24 hours disappear?",
      fig: whyStack,
      min: 0,
      max: 24,
      step: 1,
      ans: 14,
      tol: 2,
      unit: " hours",
      hint: "Which causes would the second server NOT share?",
      why: "A second server covers its own disk failing (4 h) and lets upgrades happen without downtime (10 h): 14 hours. The power cut, the network outage and the app bug hit both servers at the same time, so those 10 hours stay. Copies only help against faults they do not share.",
    },
    {
      type: "pick",
      q: "Each dot is a feature that keeps copies of its data in two data centres. During a network split it must either answer from its own copy (availability) or refuse until the copies agree (consistency). Tap every feature that should choose availability.",
      fig: whyScatter,
      a: ["a", "c", "e"],
      why: "Points above the dashed line are where waiting hurts more than seeing slightly old data: a like counter, an online status and a photo feed. For a bank transfer, the last seat on a flight or medicine stock, a wrong answer costs more than a pause, so those should choose consistency.",
    },
  ]);

  /* =====================================================================
     1.2  ds-blocks
     ===================================================================== */

  // tree: a sorted index of names
  const blkTree = (() => {
    const N = { M: [190, 34], F: [100, 100], S: [280, 100], C: [55, 170], H: [145, 170], P: [235, 170], V: [325, 170] };
    const E = [
      ["M", "F"],
      ["M", "S"],
      ["F", "C"],
      ["F", "H"],
      ["S", "P"],
      ["S", "V"],
    ];
    let s = E.map(([a, b]) => ln(N[a][0], N[a][1] + 16, N[b][0], N[b][1] - 16, { sw: 2.5 })).join("");
    Object.entries(N).forEach(
      ([k, [x, y]]) =>
        (s += pk(k.toLowerCase(), rc(x - 24, y - 17, 48, 34, { sw: 2.5, rx: 10 }) + tx(x, y + 5, k, { s: 14 }))),
    );
    s += tx(190, 218, "left = earlier in the alphabet, right = later", { s: 12, c: "var(--text-dim)" });
    return svg(380, 228, s);
  })();

  // heat strip: requests per minute in 2-hour blocks
  const blkHeat = (() => {
    const V = [120, 40, 30, 260, 700, 650, 540, 480, 560, 820, 600, 300],
      T = (i) => `${String((i * 2) % 24).padStart(2, "0")}–${String((i * 2 + 2) % 24).padStart(2, "0")}`;
    let s = tx(220, 14, "requests per minute from users, in 2-hour blocks", { c: "var(--text-dim)", s: 11.5 });
    V.forEach((v, i) => {
      const x = 8 + (i % 6) * 71,
        y = 28 + Math.floor(i / 6) * 78;
      s +=
        rc(x, y, 67, 66, { sw: 2, s: "var(--line)", rx: 8 }) +
        rc(x, y, 67, 66, { f: "var(--rose)", fo: +(0.08 + (v / 820) * 0.6).toFixed(2), s: "none", sw: 0, rx: 8 }) +
        tx(x + 33.5, y + 25, T(i), { s: 12 }) +
        tx(x + 33.5, y + 48, v, { s: 14 });
      s += hit(`b${i}`, x, y, 67, 66, 8);
    });
    return svg(440, 186, s);
  })();

  // small multiples: popularity of 20 items; the cache holds the top 2
  const blkPop = (() => {
    const zip = (s) => Array.from({ length: 20 }, (_, i) => Math.pow(i + 1, -s));
    const P = [
        ["A", zip(1)],
        ["B", zip(0.5)],
        ["C", zip(0)],
      ],
      w = 142;
    let s = "";
    P.forEach(([t, v], i) => {
      const x = 4 + i * (w + 4),
        mx = v[0],
        sh = (j) => (v[j] / mx) * 110;
      s +=
        rc(x, 4, w, 190, { sw: 2, s: "var(--line)", rx: 10 }) +
        tx(x + w / 2, 24, "Panel " + t) +
        ln(x + 8, 160, x + w - 8, 160, { sw: 2 });
      v.forEach(
        (_, j) =>
          (s += `<rect x="${x + 9 + j * 6.4}" y="${160 - sh(j)}" width="5" height="${sh(j)}" rx="1.5" fill="${j < 2 ? "var(--teal)" : "var(--line-2)"}"/>`),
      );
      s += tx(x + w / 2, 180, "requests per item", { s: 10.5, c: "var(--text-dim)" });
    });
    return svg(3 * (w + 4) + 4, 198, s);
  })();

  B.add("ds-blocks", [
    {
      type: "pick",
      q: "A sorted index stores names as a tree: at each node, go left for an earlier name and right for a later one. Tap every node examined while searching for <b>Q</b>, which is not in the index.",
      fig: blkTree,
      a: ["m", "s", "p"],
      why: "Q comes after M, so go right to S. Q is before S, so go left to P. Q comes after P, and nothing is to the right, so Q is not there. Three looks settled it, where a scan of all 7 names would take 7. Each step halves what is left, which is why indexes stay fast on a million records.",
    },
    {
      type: "pick",
      q: "A nightly batch job needs 4 hours in a row and must finish before the 08:00 report. It competes with users, so it should run when they are quietest. Tap the block where it should START.",
      fig: blkHeat,
      a: "b1",
      hint: "Add up the two neighbouring blocks that make 4 hours, and look for the smallest total.",
      why: "Starting at 02:00 uses the 02–04 and 04–06 blocks, 40 + 30 requests per minute, the quietest pair, and it ends at 06:00. Starting at 00:00 would cross a busier 120 block, and 04:00 would run into the morning rise. Batch work runs on accumulated data, so it can wait for the quiet hours.",
    },
    {
      type: "mcq",
      q: "Each panel shows how popular 20 items are (taller bar = more requests). A cache can hold only 2 items (the green bars, the most popular). Which workload does it help most?",
      fig: blkPop,
      o: [
        "Panel A: a few items take most requests",
        "Panel B: popularity falls away gently",
        "Panel C: every item is equally popular",
        "All three panels benefit the same",
      ],
      a: 0,
      why: "A cache works because popularity is skewed. In Panel A the top two items draw about 42% of requests. In B it is about 22% and in C only 10%, no better than a random pick. If everything is equally popular, a small cache catches little.",
    },
  ]);

  /* =====================================================================
     1.3  ds-reliability
     ===================================================================== */

  // racks: where do the copies of each shard live?
  const relRacks = (() => {
    const C = { A: "var(--violet)", B: "var(--blue)", C: "var(--amber)", D: "var(--teal)", E: "var(--rose)" };
    const R = [
      ["Rack 1", ["A", "A", "B", "C"]],
      ["Rack 2", ["B", "D", "D", "E"]],
      ["Rack 3", ["C", "E", "E", "D"]],
    ];
    let s = "";
    R.forEach(([t, sl], i) => {
      const x = 8 + i * 144,
        dead = i === 0;
      s +=
        rc(x, 30, 136, 222, { sw: 2.5, rx: 12, s: dead ? "var(--rose)" : "var(--line-2)", d: dead ? "7 5" : null }) +
        tx(x + 68, 22, t + (dead ? "  ⚡ power cut" : ""), { c: dead ? "var(--rose-ink)" : "var(--text)" });
      sl.forEach(
        (k, j) =>
          (s += pk(
            k,
            rc(x + 14, 42 + j * 50, 108, 42, { f: C[k], fo: 0.35, s: C[k], sw: 2.5, rx: 8 }) +
              tx(x + 68, 69 + j * 50, "shard " + k, { s: 13 }),
          )),
      );
    });
    return svg(440, 260, s);
  })();

  // Gantt: a mirrored pair loses a disk and rebuilds
  const relGantt = (() => {
    const x0 = 64,
      k = 30;
    let s = "";
    [0, 2, 4, 6, 8, 10, 12].forEach(
      (t) =>
        (s +=
          ln(x0 + t * k, 40, x0 + t * k, 158, { s: "var(--line)", sw: 1.5 }) +
          tx(x0 + t * k, 176, t, { s: 12, c: "var(--text-dim)" })),
    );
    s += tx(x0 + 6 * k, 194, "hours since Disk A died", { s: 12, c: "var(--text-dim)" });
    s +=
      tx(x0 - 8, 61, "Disk A", { a: "end", s: 13 }) +
      rc(x0, 44, 7 * k, 26, { f: "var(--amber)", fo: 0.4, s: "var(--amber)", sw: 2, rx: 5 }) +
      tx(x0 + 3.5 * k, 62, "rebuilding from B", { s: 12 }) +
      rc(x0 + 7 * k, 44, 5 * k, 26, { f: "var(--teal)", fo: 0.3, s: "var(--teal)", sw: 2, rx: 5 }) +
      tx(x0 + 9.5 * k, 62, "healthy again", { s: 12 });
    s +=
      tx(x0 - 8, 101, "Disk B", { a: "end", s: 13 }) +
      rc(x0, 84, 12 * k, 26, { f: "var(--teal)", fo: 0.3, s: "var(--teal)", sw: 2, rx: 5 }) +
      tx(x0 + 6 * k, 102, "healthy so far", { s: 12 });
    s += tx(x0 - 8, 138, "dies here?", { a: "end", s: 12, c: "var(--rose-ink)" });
    [2, 5, 8, 11].forEach((t) => {
      const x = x0 + t * k;
      s +=
        ln(x, 112, x, 124, { s: "var(--rose)", sw: 2, d: "3 3" }) +
        pk(`t${t}`, ci(x, 138, 14, { f: "var(--rose)", fo: 0.12, s: "var(--rose)", sw: 2.5 }) + xm(x, 138, 5));
    });
    return svg(440, 202, s);
  })();

  // DAG: who needs whom
  const relDag = (() => {
    const N = {
      Web: [220, 30],
      Cart: [120, 100],
      Search: [320, 100],
      StockDB: [60, 180],
      Auth: [210, 180],
      Index: [370, 180],
    };
    const E = [
      ["Web", "Cart"],
      ["Web", "Search"],
      ["Cart", "Auth"],
      ["Cart", "StockDB"],
      ["Search", "Auth"],
      ["Search", "Index"],
    ];
    let s = "";
    E.forEach(
      ([a, b]) => (s += arrow(N[a][0], N[a][1] + 17, N[b][0], N[b][1] - 20, { s: "var(--text-dim)", sw: 2.2 })),
    );
    Object.entries(N).forEach(([k, [x, y]]) => {
      const dead = k === "Auth";
      s +=
        rc(x - 42, y - 17, 84, 34, {
          sw: 2.5,
          rx: 9,
          s: dead ? "var(--rose)" : "var(--line-2)",
          f: dead ? "var(--rose)" : "var(--panel)",
          fo: dead ? 0.25 : null,
        }) + tx(x, y + 5, dead ? "Auth (down)" : k, { c: dead ? "var(--rose-ink)" : "var(--text)" });
    });
    s += tx(222, 224, "an arrow means: needs", { s: 11, c: "var(--text-dim)" });
    return svg(440, 234, s);
  })();

  B.add("ds-reliability", [
    {
      type: "pick",
      q: "Every shard of data has at least 2 copies, each in a slot of a rack. Rack 1 loses power (dashed). Tap the shard that becomes completely unavailable.",
      fig: relRacks,
      a: "A",
      why: "Both copies of shard A sit in Rack 1, so the power cut removes them together. Every other shard has a copy in another rack. Copies protect you only when their faults are independent, and a shared rack is a shared cause: spread the replicas.",
    },
    {
      type: "pick",
      q: "Two disks mirror each other. Disk A dies at hour 0 and its replacement takes until hour 7 to be rebuilt from Disk B. Tap every moment at which Disk B dying would lose data.",
      fig: relGantt,
      a: ["t2", "t5"],
      why: "While the rebuild runs, Disk B holds the only copy, so a failure at hour 2 or 5 loses everything. By hour 8 the mirror is whole again and Disk B can die safely. A faster rebuild, or a third copy, shrinks the window in which one more ordinary fault becomes a failure.",
    },
    {
      type: "cat",
      q: 'Each arrow means "needs". Every dependency is a hard one. Auth has crashed. What happens to each of the other services?',
      fig: relDag,
      buckets: ["Still works", "Breaks too"],
      items: [
        ["Web", 1],
        ["Cart", 1],
        ["Search", 1],
        ["StockDB", 0],
        ["Index", 0],
      ],
      why: "Failure travels up the arrows: Cart and Search need Auth, and Web needs both of them, so all three break. StockDB and Index never depend on Auth, so they keep running. One small fault in a shared service can become a failure of the whole page, which is why optional dependencies should degrade gracefully.",
    },
  ]);
})();

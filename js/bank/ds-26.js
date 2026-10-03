(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { Circ, Ln, PK, R, T, seq, svg } = partScope;
  const B = NIC.bank;

  /* ================= ds-graph ================= */
  function figMatrix() {
    const P = ["A", "B", "C", "D", "E"],
      on = new Set(["A-B", "A-C", "B-A", "B-D", "C-D", "D-E", "E-D"]),
      x0 = 74,
      y0 = 62,
      s = 46;
    let b =
      T(8, 16, "Filled cell: the ROW person follows", { s: 12, c: "var(--text-dim)" }) +
      T(8, 34, "the COLUMN person", { s: 12, c: "var(--text-dim)" });
    P.forEach(
      (p, i) =>
        (b +=
          T(x0 + i * s + s / 2, y0 - 10, p, { a: "middle" }) + T(x0 - 18, y0 + i * s + s / 2 + 5, p, { a: "middle" })),
    );
    P.forEach((r, j) =>
      P.forEach((c, i) => {
        const id = `${r}-${c}`,
          x = x0 + i * s,
          y = y0 + j * s;
        b += on.has(id)
          ? PK(
              id,
              R(x + 2, y + 2, s - 4, s - 4, { f: "var(--blue-dim)", st: "var(--blue)", rx: 6 }) +
                Circ(x + s / 2, y + s / 2, 6, { f: "var(--blue)", st: "var(--blue)", sw: 1 }),
            )
          : R(x + 2, y + 2, s - 4, s - 4, { f: r === c ? "var(--line)" : "none", st: "var(--line)", sw: 1.5, rx: 6 });
      }),
    );
    return svg(340, 306, b);
  }

  function figRings() {
    const cum = [1, 7, 37, 187],
      k = 165 / Math.sqrt(187),
      cx = 170,
      cy = 180,
      r = cum.map((c) => k * Math.sqrt(c));
    let b = Circ(cx, cy, r[3], { f: "var(--violet-dim)", st: "var(--violet)", d: "6 6", sw: 2 });
    b +=
      Circ(cx, cy, r[2], { f: "var(--blue-dim)", st: "var(--blue)" }) +
      Circ(cx, cy, r[1], { f: "var(--teal-dim)", st: "var(--teal)" }) +
      Circ(cx, cy, r[0], { f: "var(--amber)", st: "var(--amber)", sw: 1 });
    [
      ["var(--amber)", "You", "the start"],
      ["var(--teal)", "Hop 1", "6 people"],
      ["var(--blue)", "Hop 2", "30 people"],
      ["var(--violet)", "Hop 3", "? people"],
    ].forEach(([c, t, s], i) => {
      b +=
        R(344, 40 + i * 62, 16, 16, { f: c, st: c, rx: 4 }) +
        T(366, 54 + i * 62, t, { s: 13 }) +
        T(366, 73 + i * 62, s, { s: 12, c: "var(--text-dim)" });
    });
    b += T(8, 18, "Areas show how many people are reached so far", { s: 12, c: "var(--text-dim)" });
    return svg(450, 360, b);
  }

  function figVenn() {
    const L = "M230,62.92 A90,90 0 1 0 230,197.08 A90,90 0 0 1 230,62.92 Z",
      Rr = "M230,62.92 A90,90 0 1 1 230,197.08 A90,90 0 0 0 230,62.92 Z",
      M = "M230,62.92 A90,90 0 0 0 230,197.08 A90,90 0 0 0 230,62.92 Z";
    const path = (d, f, st) => `<path d="${d}" fill="${f}" stroke="${st}" stroke-width="2.5" stroke-linejoin="round"/>`;
    let b = T(170, 24, "Ana's friends", { a: "middle" }) + T(290, 24, "Ben's friends", { a: "middle" });
    b += PK(
      "ana",
      path(L, "var(--blue-dim)", "var(--blue)") +
        T(135, 122, "Eli", { a: "middle" }) +
        T(135, 150, "Flo", { a: "middle" }),
    );
    b += PK("ben", path(Rr, "var(--violet-dim)", "var(--violet)") + T(327, 136, "Gus", { a: "middle" }));
    b += PK(
      "both",
      path(M, "var(--teal-dim)", "var(--teal)") +
        T(230, 122, "Cy", { a: "middle" }) +
        T(230, 150, "Dee", { a: "middle" }),
    );
    return svg(340, 236, `<g transform="translate(-60,0)">${b}</g>`);
  }

  B.add("ds-graph", [
    {
      type: "pick",
      q: "The matrix records who follows whom. Two people <i>follow each other</i> when each one follows the other. <b>Tap every cell that belongs to a pair of mutual followers.</b>",
      fig: figMatrix(),
      a: ["A-B", "B-A", "D-E", "E-D"],
      why: "A follows B and B follows A, and D and E follow each other too: each pair fills two cells that mirror each other across the diagonal. A to C, B to D and C to D have no cell going back, so those follows are one-way.",
    },
    {
      type: "slider",
      q: "Each hop out from you reaches about 5 times as many new people as the hop before. Hop 1 reached 6 and hop 2 reached 30. About how many <b>new</b> people does hop 3 reach?",
      fig: figRings(),
      min: 0,
      max: 400,
      step: 10,
      ans: 150,
      tol: 30,
      unit: " people",
      hint: "6, then 30, then 30 × 5.",
      why: "The crowd multiplies at every hop: 6 × 5 = 30, and 30 × 5 = 150. A traversal is cheap for one or two hops, but the number of vertices it must touch grows fast, so deep traversals get costly.",
    },
    {
      type: "pick",
      q: "Ana wants to introduce friends of hers to Ben. The query is: <i>Ana's friends who are not yet friends with Ben.</i> <b>Tap the region the query returns.</b>",
      fig: figVenn(),
      a: "ana",
      why: "The query keeps Ana's friends and drops anyone Ben already knows. That is the left-hand crescent: Eli and Flo. Cy and Dee are in both circles, so they are already connected to Ben.",
    },
    {
      type: "bug",
      q: 'Friendships are mutual and each is stored once, as <code>(a, b)</code>. After <code>friends("ben")</code> the list holds only Cy, but Ana is Ben\'s friend too. Click the faulty line.',
      code: [
        'edges = [("ana", "ben"), ("ben", "cy")]',
        "def friends(v):",
        "    out = []",
        "    for a, b in edges:",
        "        if a == v:",
        "            out.append(b)",
        "    return out",
      ],
      a: 4,
      why: "The test only follows an edge from its first end. A mutual friendship has to be followed from either end: <code>if a == v</code> must also handle <code>b == v</code> and add <code>a</code>. Ana's edge starts at \"ana\", so Ben's lookup never sees her.",
    },
  ]);

  /* ================= ds-nosql ================= */
  function figHeat() {
    const hours = ["09:00 to 10:00", "10:00 to 11:00", "11:00 to 12:00", "12:00 to 13:00"];
    let b = T(8, 18, "Writes per second reaching each server (thousands)", { s: 12, c: "var(--text-dim)" });
    ["Server 1", "Server 2", "Server 3", "Server 4"].forEach(
      (s, i) => (b += T(180 + i * 70, 46, s, { a: "middle", s: 12 })),
    );
    hours.forEach((h, j) => {
      b += T(8, 76 + j * 44, h, { s: 12, c: "var(--text-dim)" });
      for (let i = 0; i < 4; i++) {
        const hot = i === j;
        b +=
          R(148 + i * 70, 54 + j * 44, 64, 38, {
            f: hot ? "var(--amber)" : "var(--amber-dim)",
            st: hot ? "var(--amber-ink)" : "var(--amber-edge)",
            rx: 6,
            sw: 1.5,
          }) + T(180 + i * 70, 78 + j * 44, hot ? "4.0" : "0.1", { a: "middle", c: hot ? "#fff" : "var(--amber-ink)" });
      }
    });
    return svg(440, 236, b);
  }

  function figReplicas() {
    const px = [60, 150, 240, 330, 420],
      sx = [75, 195, 315, 435],
      rep = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [0, 2],
      ],
      down = new Set([0, 2]);
    let b = T(8, 14, "Each partition is stored on two servers", { s: 12, c: "var(--text-dim)" });
    rep.forEach(([a, c], p) =>
      [a, c].forEach((s) => (b += Ln(px[p], 60, sx[s], 178, down.has(s) ? "var(--rose-edge)" : "var(--line-2)", 2.5))),
    );
    px.forEach(
      (x, p) =>
        (b += PK(
          `P${p + 1}`,
          R(x - 35, 24, 70, 36, { f: "var(--violet-dim)", st: "var(--violet)" }) +
            T(x, 48, `P${p + 1}`, { a: "middle" }),
        )),
    );
    sx.forEach((x, s) => {
      b +=
        R(x - 45, 178, 90, 38, {
          f: down.has(s) ? "var(--rose-dim)" : "var(--teal-dim)",
          st: down.has(s) ? "var(--rose)" : "var(--teal)",
        }) +
        T(x, 201, `S${s + 1}${down.has(s) ? " down" : ""}`, {
          a: "middle",
          c: down.has(s) ? "var(--rose-ink)" : "var(--text)",
        });
    });
    return svg(480, 228, b);
  }

  function figScale() {
    const X = (x) => 56 + x * 40,
      Y = (c) => 250 - c * 18,
      up = (x) => 0.5 + 0.4 * x * x,
      out = (x) => 2 + x;
    let b = Ln(56, 250, 460, 250, "var(--text-dim)", 2) + Ln(56, 250, 56, 20, "var(--text-dim)", 2);
    b +=
      T(458, 272, "load handled", { a: "end", s: 12, c: "var(--text-dim)" }) +
      T(62, 16, "cost", { s: 12, c: "var(--text-dim)" });
    let pu = "";
    for (let x = 0; x <= 5.001; x += 0.25) pu += `${pu ? "L" : "M"}${X(x).toFixed(1)},${Y(up(x)).toFixed(1)}`;
    b += `<path d="${pu}" fill="none" stroke="var(--amber)" stroke-width="3.5" stroke-linecap="round"/>`;
    b += Ln(X(0), Y(out(0)), X(10), Y(out(10)), "var(--blue)", 3.5);
    b +=
      T(X(1.7), Y(up(1.7)) + 26, "one bigger machine", { s: 12, c: "var(--amber-ink)" }) +
      T(X(5.4), Y(out(5.4)) - 12, "more machines", { s: 12, c: "var(--blue-ink)" });
    [
      ["A", 0, up(0)],
      ["B", 3.5549, 5.5552],
      ["C", 5, up(5)],
      ["D", 8, out(8)],
    ].forEach(
      ([id, x, c]) =>
        (b += PK(
          id,
          Circ(X(x), Y(c), 14, { f: "var(--panel)", st: "var(--ink)" }) + T(X(x), Y(c) + 4.5, id, { a: "middle" }),
        )),
    );
    return svg(480, 284, b);
  }

  function figKeys() {
    const rows = [
      ["S-7", "09:00", "21.5", "88"],
      ["S-7", "09:15", "21.9", "87"],
      ["S-7", "09:30", "22.4", "87"],
      ["S-8", "09:00", "19.0", "42"],
      ["S-8", "09:15", "19.4", "42"],
    ];
    const th = (t, c, sub) =>
      `<th style="background:var(--${c}-dim);border-bottom:3px solid var(--${c})">${t}${sub ? `<div style="font:700 11px var(--sans);color:var(--text-dim)">${sub}</div>` : ""}</th>`;
    return `<table class="t" style="font-family:var(--mono);font-size:13px"><tr>${th("sensor", "amber", "partition key")}${th("time", "blue", "sort key")}<th>temp</th><th>battery %</th></tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  }

  B.add("ds-nosql", [
    {
      type: "mcq",
      q: "A table of sensor readings is split across four servers by one partition key. The grid shows the writes reaching each server, hour by hour. Which partition key fits this picture?",
      fig: figHeat(),
      o: [
        "The hour of the write, so each hour shares one partition",
        "The sensor ID, with thousands of sensors all writing evenly",
        "A random ID given to every reading as it arrives, to scatter them",
        "The building a sensor sits in, with four equally busy buildings",
      ],
      a: 0,
      why: "All of one hour's writes land on a single server while the others idle, and the hot spot moves on every hour. That is a time-based key. A sensor or random key spreads the load, and four busy buildings would keep every server steadily loaded.",
    },
    {
      type: "pick",
      q: "Each partition is stored on two servers, as the lines show. Servers S1 and S3 go down. <b>Tap the partition that can no longer be read.</b>",
      fig: figReplicas(),
      a: "P5",
      why: "P5 lived on S1 and S3, and both are down. Every other partition has a copy on S2 or S4. Keeping several copies on different servers is how a store stays available when machines fail.",
    },
    {
      type: "pick",
      q: "The chart compares what it costs to handle more load. Spreading across machines has a set-up cost but then grows steadily. <b>Tap the point where both options cost the same.</b>",
      fig: figScale(),
      a: "B",
      why: "B is where the lines cross: about 3.6 units of load. Below it one bigger machine is cheaper. Above it adding machines wins, and the big machine runs out at C, where D shows scaling out still going.",
    },
    {
      type: "match",
      q: "This table has partition key <code>sensor</code> and sort key <code>time</code>. Match each request to how the store finds the data.",
      fig: figKeys(),
      pairs: [
        ["S-7 readings from 09:00 to 09:30", "Go to one partition, read a slice in order"],
        ["S-7 reading at exactly 09:15", "Go to one partition, jump to one item"],
        ["Every sensor's reading at 09:15", "Ask every partition: time alone picks none"],
        ["S-7 and S-8 readings from 09:00 to 09:30", "Go to two partitions, read a slice from each"],
      ],
      why: "The partition key chooses where to look, and the sort key orders what is inside. A request that names the sensor stays within that partition. One that names only the time cannot pick a partition, so every partition has to be asked.",
    },
  ]);

  /* ================= ds-log ================= */
  function figInterleave() {
    const L = [
      [70, "Client 1"],
      [245, "Log file"],
      [420, "Client 2"],
    ];
    const m = [
      { id: "w1", from: 0, to: 1, y: 74, label: 'write "bike,"  (half)' },
      { id: "w2", from: 2, to: 1, y: 118, label: 'write "dock,7\\n"  (whole)' },
      { id: "w3", from: 0, to: 1, y: 162, label: 'write "5\\n"  (other half)' },
    ];
    const extra =
      T(6, 74, "1", { s: 12, c: "var(--text-dim)" }) +
      T(6, 118, "2", { s: 12, c: "var(--text-dim)" }) +
      T(6, 162, "3", { s: 12, c: "var(--text-dim)" });
    return seq(480, 186, L, m, { extra });
  }

  function figScatter() {
    const P = { A: [0.9, 0.08], B: [0.12, 0.9], C: [0.7, 0.18], D: [0.25, 0.75], E: [0.82, 0.25] };
    const X = (v) => 60 + v * 380,
      Y = (v) => 240 - v * 210;
    let b = Ln(60, 240, 450, 240, "var(--text-dim)", 2) + Ln(60, 240, 60, 20, "var(--text-dim)", 2);
    b +=
      Ln(X(0.5), 24, X(0.5), 240, "var(--line)", 1.5, "5 5") + Ln(60, Y(0.5), 440, Y(0.5), "var(--line)", 1.5, "5 5");
    b +=
      T(450, 262, "writes per second, low to high", { a: "end", s: 12, c: "var(--text-dim)" }) +
      T(66, 16, "rows read per query, few to many", { s: 12, c: "var(--text-dim)" });
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (b +=
          Circ(X(x), Y(y), 16, { f: "var(--blue-dim)", st: "var(--blue)" }) + T(X(x), Y(y) + 5, k, { a: "middle" })),
    );
    return svg(470, 274, b);
  }

  function figSnaps() {
    const panels = [
      ["P", 5, 6, ["dock=2", "dock=5", "dock: del"]],
      ["Q", 235, 6, []],
      ["R", 5, 120, ["dock=2"]],
      ["S", 235, 120, ["dock=2", "dock=5"]],
    ];
    let b = "";
    panels.forEach(([n, x, y, recs]) => {
      b +=
        R(x, y, 220, 104, { f: "var(--panel-2)", st: "var(--line)" }) +
        T(x + 12, y + 24, `Panel ${n}`, { s: 13 }) +
        T(x + 208, y + 24, `${recs.length} record${recs.length === 1 ? "" : "s"}`, {
          a: "end",
          s: 12,
          c: "var(--text-dim)",
        });
      recs.forEach((r, i) => {
        const dead = r.includes("del");
        b +=
          R(x + 8 + i * 70, y + 46, 66, 36, {
            f: dead ? "var(--rose-dim)" : "var(--panel)",
            st: dead ? "var(--rose)" : "var(--blue)",
            rx: 6,
          }) +
          T(x + 41 + i * 70, y + 69, r, { a: "middle", m: true, s: 10, c: dead ? "var(--rose-ink)" : "var(--text)" });
      });
      if (!recs.length) b += T(x + 110, y + 72, "empty file", { a: "middle", s: 13, c: "var(--text-faint)", w: 700 });
    });
    return svg(460, 232, b);
  }

  B.add("ds-log", [
    {
      type: "mcq",
      q: "Two clients append to the same log at once, and each record is sent in more than one write. Following the diagram, what goes wrong, and what is the usual fix?",
      fig: figInterleave(),
      o: [
        "Records are cut into broken lines; write each record as one uninterrupted append",
        "Both records are lost because the file is locked; retry the writes until it frees up",
        "Nothing: appends always land at the end, so each record stays whole and in order",
        "The second record overwrites the first; give every client a separate log file",
      ],
      a: 0,
      why: "The halves interleave, giving a line that reads bike,dock,7 and another that reads 5. Neither is a valid record. A log needs concurrency control so each record goes in as one uninterrupted append, for example through a single writer or a lock.",
    },
    {
      type: "cat",
      q: "Each dot is an application, placed by how many writes it makes per second and how many rows each of its reads must look at. Which kind of workload is each?",
      fig: figScatter(),
      buckets: ["Transactional (write-heavy)", "Analytics (read-heavy)"],
      items: [
        ["Dot A", 0],
        ["Dot B", 1],
        ["Dot C", 0],
        ["Dot D", 1],
        ["Dot E", 0],
      ],
      why: "A, C and E sit at many small writes with tiny reads, like payments or orders: transactional. B and D make few writes but scan huge amounts per read, like reports: analytics. The workload decides which storage engine fits.",
    },
    {
      type: "order",
      q: "A key <b>dock</b> is set twice, then deleted, then a compaction runs. These four snapshots of the log file were taken right after each of those events, but are shown in a mixed order. Put them in the order they were taken.",
      fig: figSnaps(),
      items: ["Panel R", "Panel S", "Panel P", "Panel Q"],
      why: "The first set adds one record (R) and the second adds another (S). The delete adds a tombstone line, so the file grows to three records (P). Only compaction removes lines, so the empty file (Q) comes last: a delete never erases anything by itself.",
    },
    {
      type: "bug",
      q: "Records are written as <code>key,value</code>. When a value such as <code>Reid, Mo</code> contains a comma, <code>get()</code> crashes. Click the faulty line.",
      code: [
        "def get(key):",
        "    last = None",
        '    for line in open("db.log"):',
        '        k, v = line.rstrip().split(",")',
        "        if k == key:",
        "            last = v",
        "    return last",
      ],
      a: 3,
      why: 'Splitting at every comma gives three pieces for that record, so the unpacking fails. The format is ambiguous. Split once (<code>split(",", 1)</code>) or use a binary format that stores lengths, which is one reason real logs prefer binary files.',
    },
  ]);
})();

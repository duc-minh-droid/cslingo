(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { FIG_FOLLOW, FIG_PROPS, FIG_TABLES, chips, ln, pk, rc, segRows, svg, table, tx } = partScope;
  const B = NIC.bank;

  B.add("ds-graph", [
    {
      type: "pick",
      q: 'Arrows mean "follows". Asha (A, in green) wants suggestions. Tap everyone she reaches in exactly two follow hops, not one and not three.',
      fig: FIG_FOLLOW,
      a: ["D", "E"],
      why: 'One hop from A reaches B and C. One more hop from those reaches D (from B or C) and E (from C). F and G need a third hop. This is why a graph is good at "friends of friends": each hop just follows the edges leaving a vertex.',
    },
    {
      type: "mcq",
      q: "Using only these two tables, which person does Mia KNOW who has also VISITED Cafe Nim?",
      fig: FIG_TABLES,
      o: ["Leo", "Zed", "Leo and Zed", "Nobody"],
      a: 0,
      why: "Mia's outgoing KNOWS edge (e1) goes to Leo, and Leo has a VISITED edge (e2) to Cafe Nim. Zed visited the cafe too, but the KNOWS edge e4 points from Zed to Mia, which is the other direction.",
      hint: "Start at vertex 1 and follow only edges that leave it with the label KNOWS.",
    },
    {
      type: "cat",
      q: "Sort each query by how a graph database answers it.",
      buckets: ["Start at one vertex and follow edges outward", "Needs a pass over everything"],
      items: [
        ["Everyone within three referrals of one doctor", 0],
        ["The average age of all patients", 1],
        ["The fewest changes between two stations", 0],
        ["The total number of trips made this year", 1],
        ["Which cafes the friends of Mia have visited", 0],
        ["The oldest account across the whole network", 1],
      ],
      why: "Traversals touch only the neighbourhood around a start vertex, following the edges stored with each vertex. Whole-dataset summaries have to look at every vertex or edge, whichever model holds them.",
    },
    {
      type: "bug",
      q: "This traversal should suggest new people for Ola to follow: friends of friends who are not already connected to her. Click the faulty line.",
      code: [
        'start = vertex("Ola")',
        'friends = start.out("FOLLOWS")',
        'fof = friends.out("FOLLOWS")',
        "suggestions = fof",
        "show(suggestions)",
      ],
      a: 3,
      why: "Friends of friends include people Ola already follows and often Ola herself (a friend follows her back). Remove start and friends from fof before suggesting anyone.",
    },
    {
      type: "slider",
      q: "Everyone follows exactly 10 accounts, with no overlaps. Starting from one person, about how many accounts could you reach in exactly three hops?",
      min: 0,
      max: 2000,
      step: 100,
      ans: 1000,
      tol: 300,
      unit: " accounts",
      why: "Each hop multiplies the reach by 10: 10 after one hop, 100 after two, 1,000 after three. Fan-out grows fast, which is why graph stores keep each vertex's edges close at hand.",
      hint: "10 × 10 = 100, then × 10 again.",
    },
    {
      type: "multi",
      q: "In a property graph, which of these facts should be stored as properties on the edge between Ana and Orbit Ltd, not on either vertex? Select all that apply.",
      fig: FIG_PROPS,
      o: [
        "The year Ana started at Orbit Ltd",
        "Ana's year of birth",
        "Ana's job title at Orbit Ltd",
        "The city where Orbit Ltd is based",
      ],
      a: [0, 2],
      why: "A property belongs on the edge when it describes the relationship itself. When she started and her title there exist only because of the WORKS_AT link. Her birth year belongs to Ana, and the city belongs to the company.",
    },
  ]);

  /* ================= ds-nosql ================= */
  const rowsKV = [
    ["r1", "S-A", "09:00", "11"],
    ["r2", "S-A", "09:20", "12"],
    ["r3", "S-A", "09:40", "14"],
    ["r4", "S-A", "10:00", "15"],
    ["r5", "S-B", "09:20", "20"],
    ["r6", "S-B", "09:40", "21"],
    ["r7", "S-C", "09:00", "8"],
  ];
  const FIG_KV = svg(
    460,
    28 + rowsKV.length * 34 + 6,
    tx(30, 20, "Sensor (partition key)", { s: 12, c: "var(--text-dim)" }) +
      tx(210, 20, "Time (sort key)", { s: 12, c: "var(--text-dim)" }) +
      tx(360, 20, "Temp", { s: 12, c: "var(--text-dim)" }) +
      rowsKV
        .map(([id, s, t, v], i) =>
          pk(
            id,
            rc(8, 28 + i * 34, 444, 30) +
              tx(30, 49 + i * 34, s, { m: true }) +
              tx(210, 49 + i * 34, t, { m: true }) +
              tx(360, 49 + i * 34, v, { m: true }),
          ),
        )
        .join(""),
  );

  const dcard = (x, lines) =>
    rc(x, 6, 170, 100, { rx: 10 }) + lines.map((l, i) => tx(x + 12, 32 + i * 22, l, { m: true, s: 12 })).join("");
  const FIG_ITEMS = svg(
    560,
    116,
    dcard(4, ["title: Dune", "author: Herbert", "pages: 320"]) +
      dcard(194, ["title: Alien", "director: Scott", "minutes: 117"]) +
      dcard(384, ["title: Torch", "price: 40", "voltage: 5"]),
  );

  const FIG_SPARSE = table(
    ["Row", "Columns this row actually has"],
    [
      ["1", "name, age"],
      ["2", "name, city, phone"],
      ["3", "name, age, city"],
      ["4", "name, plan"],
    ],
  );

  B.add("ds-nosql", [
    {
      type: "pick",
      q: "A store keeps these rows grouped by partition key and ordered by sort key. A query asks for sensor S-A's readings from 09:20 to 09:40 inclusive. Tap every row it returns.",
      fig: FIG_KV,
      a: ["r2", "r3"],
      why: "The partition key picks the group (S-A only), and the sort key then gives a range inside it (09:20 to 09:40). The S-B rows have matching times but the wrong partition, and the other S-A rows fall outside the range.",
    },
    {
      type: "cat",
      q: "Sort these jobs by how well a pure key-value store handles them.",
      buckets: ["Fits a key-value store", "Awkward for a key-value store"],
      items: [
        ["Fetch one player's session by its session ID", 0],
        ["Find every session started from Leeds", 1],
        ["Read a sensor's readings between two times inside one partition", 0],
        ["Join each order with its customer's details", 1],
        ["Find the shortest chain of introductions between two people", 1],
        ["Overwrite a basket after every click", 0],
      ],
      why: "Key-value stores are built for lookups by key (and ranges on a sort key within one partition). Searching by values, joining and path-finding need a different model or a lot of scanning.",
    },
    {
      type: "bug",
      q: "A team designs a key-value table for click events, spread over 10 servers by hashing the partition key. At peak 50,000 writes a second arrive and one server melts while the other nine idle. Click the line that causes it.",
      code: [
        "Table: Clicks",
        "Partition key: today's date",
        "Sort key: time of click",
        "Servers: 10, partitions spread by hashing the partition key",
        "Traffic: 50,000 writes a second, all for today",
      ],
      a: 1,
      why: "Every click today has the same partition key, so every write hashes to the same partition on the same server. A key with many different values (such as a user or session ID) spreads writes across all ten servers.",
    },
    {
      type: "multi",
      q: "These three documents sit in one document-store collection. Select all statements that are true.",
      fig: FIG_ITEMS,
      o: [
        "A query for pages above 300 can only ever match the book",
        "The store would reject the film because it has no pages field",
        "Code that totals price over the collection must cope with documents that lack one",
        "Each of the three shapes needs its own database server",
      ],
      a: [0, 2],
      why: "Documents in a collection may differ, so nothing is rejected, but the application has to expect missing fields. Fields only match the documents that have them. Shapes do not need separate servers.",
    },
    {
      type: "mcq",
      q: "A wide-column store holds these four rows, each with only the columns shown. A fixed-column table would need one column for every name used by any row. How many cells would be empty in that table?",
      fig: FIG_SPARSE,
      o: ["6", "10", "14", "20"],
      a: 1,
      why: "Five distinct column names (name, age, city, phone, plan) across four rows make 20 cells, but only 2 + 3 + 3 + 2 = 10 hold data, so 10 are empty. A wide-column row stores just the columns it has.",
      hint: "Count the distinct names, multiply by 4 rows, then take away the cells that hold data.",
    },
    {
      type: "slider",
      q: "A document collection holds 600 GB. Each server can store 150 GB, and every item is kept on 3 different servers so the data stays available if some machines fail. How many servers does the cluster need?",
      min: 0,
      max: 20,
      step: 1,
      ans: 12,
      tol: 1,
      unit: " servers",
      why: "600 GB across 150 GB servers is 4 servers for one copy. Three copies of everything need 4 × 3 = 12. Adding machines (horizontal scaling) buys both room and availability.",
      hint: "First how many servers hold one copy (600 ÷ 150), then multiply by 3.",
    },
  ]);

  /* ================= ds-log ================= */
  const FIG_LOG1 = svg(
    580,
    70,
    [["set a=1"], ["set b=2"], ["set a=5"], ["delete b"], ["set c=7"]]
      .map(([s], i) =>
        pk("r" + (i + 1), rc(6 + i * 114, 22, 106, 40) + tx(59 + i * 114, 48, s, { a: "middle", m: true, s: 13 })),
      )
      .join("") +
      [1, 2, 3, 4, 5]
        .map((n, i) => tx(59 + i * 114, 14, "record " + n, { a: "middle", s: 11, c: "var(--text-faint)" }))
        .join(""),
  );

  const FIG_LOG2 = chips([
    "set a=1",
    "set b=2",
    "set a=4",
    "delete b",
    "set c=9",
    "delete c",
    "set c=3",
    "set d=6",
    "delete d",
  ]);

  const FIG_CRASH = svg(
    560,
    120,
    rc(6, 20, 150, 44, { st: "var(--teal)" }) +
      tx(81, 48, "len 9 | set a=1", { a: "middle", m: true, s: 12 }) +
      rc(166, 20, 150, 44, { st: "var(--teal)" }) +
      tx(241, 48, "len 9 | set b=2", { a: "middle", m: true, s: 12 }) +
      rc(326, 20, 96, 44, { st: "var(--rose)", d: "6 4" }) +
      tx(374, 48, "len 20 | se", { a: "middle", m: true, s: 12 }) +
      ln(430, 8, 430, 76, "var(--rose)", 4) +
      tx(438, 28, "power", { s: 12, c: "var(--rose)" }) +
      tx(438, 46, "cut", { s: 12, c: "var(--rose)" }) +
      tx(81, 88, "record 1: complete", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(241, 88, "record 2: complete", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(374, 88, "record 3: cut short", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(374, 106, "(header says 20 bytes)", { a: "middle", s: 11, c: "var(--text-faint)" }),
  );

  const FIG_CHART = svg(
    440,
    230,
    ln(50, 190, 420, 190, "var(--line-2)", 2) +
      ln(50, 190, 50, 20, "var(--line-2)", 2) +
      [10, 20, 30, 40]
        .map((g, i) => tx(100 + i * 100, 210, g + " GB", { a: "middle", s: 12, c: "var(--text-dim)" }))
        .join("") +
      tx(235, 228, "size of the log file", { a: "middle", s: 12, c: "var(--text-faint)" }) +
      tx(14, 110, "time", { s: 12, c: "var(--text-faint)" }) +
      `<polyline points="100,160 200,130 300,100 400,70" fill="none" stroke="var(--rose)" stroke-width="4" stroke-linecap="round"/>` +
      `<polyline points="100,182 200,182 300,182 400,182" fill="none" stroke="var(--teal)" stroke-width="4" stroke-linecap="round"/>` +
      tx(400, 58, "A", { a: "middle", s: 15, c: "var(--rose-ink)" }) +
      tx(400, 172, "B", { a: "middle", s: 15, c: "var(--teal-ink)" }),
  );

  B.add("ds-log", [
    {
      type: "pick",
      q: "A log-based key-value store holds the five records below, oldest first. A client asks for b. Tap the record that decides the answer.",
      fig: FIG_LOG1,
      a: "r4",
      why: 'The newest record for a key wins, and the newest record for b is the tombstone (delete b). The answer is "not found", even though record 2 still holds the old value.',
    },
    {
      type: "slider",
      q: "A plain log holds 50 million records of 100 bytes each, and a read scans the whole file at 100 MB per second. About how many seconds does one read take?",
      min: 0,
      max: 120,
      step: 5,
      ans: 50,
      tol: 15,
      unit: " s",
      why: "50 million × 100 bytes = 5,000 MB, and 5,000 MB at 100 MB per second is 50 seconds. A scan per read does not survive real data volumes, which is why an index is needed.",
      hint: "50 million × 100 bytes is 5,000 MB (5 billion bytes). Then divide by 100 MB per second.",
    },
    {
      type: "bug",
      q: "After a restart the store rebuilds its in-memory hash map from the log. Click the line that makes it end up with old values.",
      code: [
        "on restart:",
        "  index = empty map",
        "  for each record in the log, from the newest to the oldest:",
        "    index[record.key] = that record's offset",
        "  now serve reads",
      ],
      a: 2,
      why: "Each assignment overwrites the previous one for that key, so the last record processed wins. Reading newest to oldest leaves the oldest record in the map. Replay from the oldest to the newest instead.",
    },
    {
      type: "mcq",
      q: "The power fails while the third record is being appended. After the restart the file ends as drawn. What should the store do?",
      fig: FIG_CRASH,
      o: [
        "Spot that the last record is incomplete and cut the file back to the end of record 2",
        "Throw the whole file away and start again with an empty log",
        "Read record 3 as it is and treat the missing bytes as zeros",
        "Keep waiting for the missing bytes of record 3 to arrive",
      ],
      a: 0,
      why: "Records 1 and 2 are complete, and because the log only appends, they were never touched. The partial tail is the only damage, so recovery trims it. Losing everything or guessing the missing bytes would throw away good data or invent data.",
    },
    {
      type: "cat",
      q: 'Replay this log from the top. For each request, does the store return a value or report "not found"?',
      fig: FIG_LOG2,
      buckets: ["Returns a value", "Reports not found"],
      items: [
        ["get(a)", 0],
        ["get(b)", 1],
        ["get(c)", 0],
        ["get(d)", 1],
        ["get(e)", 1],
      ],
      why: "a ends at 4. b was deleted. c was written, deleted and written again, so it ends at 3. d was deleted last. e never appears in the log at all.",
    },
    {
      type: "mcq",
      q: "A team charts how long a get and a set take as their log file grows. Line A rises steadily while line B stays flat. Which reading of the chart is right?",
      fig: FIG_CHART,
      o: [
        "A is get: it scans a bigger file each time. B is set: it only appends at the end",
        "A is set: bigger files take longer to write to. B is get: it jumps straight to the record",
        "A is delete: it must scan for the key. B is get: it reads the last line",
        "A is set: it must check every old record first. B is delete: it adds a marker only",
      ],
      a: 0,
      why: "In a plain log, appending costs the same however big the file is, so its time is flat. Reading has to scan for the key, so its time grows with the file. That growth is the problem an index solves.",
    },
  ]);

  /* ================= ds-hashidx ================= */
  const FIG_COMPACT = segRows(
    [
      {
        id: "1",
        label: "Segment 1 (oldest)",
        recs: [
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ],
      },
      {
        id: "2",
        label: "Segment 2",
        recs: [
          ["a", 4],
          ["d", 5],
          ["b", 6],
        ],
      },
      {
        id: "3",
        label: "Segment 3 (newest)",
        recs: [
          ["a", 7],
          ["c", 8],
          ["e", 9],
        ],
      },
    ],
    { pick: true },
  );

  const FIG_WORK = table(
    ["", "Workload A", "Workload B"],
    [
      ["Distinct keys", "40 thousand", "3 billion"],
      ["Writes per day", "2 billion updates", "3 billion, each key written once"],
      ["Reads", "by key", "by key"],
    ],
  );

  const FIG_IDX = segRows(
    [
      {
        id: "1",
        label: "Segment 1 (oldest)",
        recs: [
          ["k1", 4],
          ["k2", 7],
        ],
      },
      {
        id: "2",
        label: "Segment 2",
        recs: [
          ["k1", 9],
          ["k3", 2],
        ],
      },
      { id: "3", label: "Segment 3 (newest)", recs: [["k3", 5]] },
    ],
    { head: "index: k1 → seg 2,  k2 → seg 1,  k3 → seg 3" },
  );
  Object.assign(partScope, { FIG_COMPACT, FIG_IDX, FIG_WORK });
})();

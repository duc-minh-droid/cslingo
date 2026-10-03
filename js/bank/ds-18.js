(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { FIG_PKEYS, ln, mono, pk, rc, svg, table, tx } = partScope;
  const B = NIC.bank;

  const FIG_FAMS = (() => {
    const panel = (x, y, id, inner) => pk(id, rc(x, y, 150, 120) + inner);
    let s = panel(
      6,
      6,
      "A",
      mono(18, 38, '{ "name": "Ana",', { s: 12 }) +
        mono(18, 62, '  "tags": [...],', { s: 12 }) +
        mono(18, 86, '  "town": "Hull" }', { s: 12 }),
    );
    s += panel(
      170,
      6,
      "B",
      ["u:17", "u:18", "u:19", "u:20"]
        .map(
          (k, i) =>
            mono(184, 34 + i * 25, k, { s: 12 }) +
            tx(236, 34 + i * 25, "→", { s: 12 }) +
            rc(252, 21 + i * 25, 50, 18, { rx: 4, f: "var(--bg-2)" }),
        )
        .join(""),
    );
    const cell = (x, y, t, on) =>
      rc(x, y, 28, 24, {
        rx: 3,
        f: on ? "var(--violet-dim)" : "var(--bg-2)",
        st: on ? "var(--violet)" : "var(--line)",
        sw: 1.5,
      }) + (on ? mono(x + 14, y + 16, t, { a: "middle", s: 12 }) : "");
    const rows = [
      [1, 1, 0, 0],
      [1, 0, 1, 1],
      [0, 1, 0, 0],
    ];
    s += panel(
      6,
      136,
      "C",
      rows
        .map((r, i) => r.map((on, j) => cell(20 + j * 31, 152 + i * 32, ["a", "b", "c", "d"][j], on)).join(""))
        .join(""),
    );
    s += panel(
      170,
      136,
      "D",
      ln(220, 170, 290, 192, "var(--line-2)", 2.5) +
        ln(220, 170, 230, 232, "var(--line-2)", 2.5) +
        ln(230, 232, 290, 192, "var(--line-2)", 2.5) +
        [
          [220, 170],
          [290, 192],
          [230, 232],
        ]
          .map(
            ([x, y]) =>
              `<circle cx="${x}" cy="${y}" r="12" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>`,
          )
          .join(""),
    );
    return svg(326, 262, s);
  })();

  B.add("ds-nosql", [
    {
      type: "mcq",
      q: "A key-value table is split into partitions by its partition key, and each partition lives on one server. Order writes arrive all day. Using the table, which partition key spreads the writes best?",
      fig: FIG_PKEYS,
      o: ["Country code", "Plan type", "Order date", "Customer ID"],
      a: 3,
      hint: "Look for many distinct values and no value that takes a big share.",
      why: "Customer ID has millions of values and no single one takes a noticeable share, so work spreads over all servers. Today's date puts every write on one partition. Plan type and country code leave one value with most or a third of the traffic.",
    },
    {
      type: "cat",
      q: "Which NoSQL family fits each job best?",
      buckets: ["Document", "Key-value", "Wide-column", "Graph"],
      items: [
        ["Look up a login session by its token", 1],
        ["Product pages where each item has its own attributes", 0],
        ["Suggest people two links away from you", 3],
        ["Rows that each carry their own mix of columns", 2],
        ["A blog post stored with nested comments, loaded as one unit", 0],
        ["A shopping basket fetched by user ID, never searched by contents", 1],
      ],
      why: "Key-value suits fetch-by-key. Documents suit self-contained nested items with varying fields. Wide-column rows may differ in their columns. Graphs suit following links across several hops.",
    },
    {
      type: "order",
      q: "A DynamoDB-style table has a partition key and a sort key. Put these steps in the order a lookup follows.",
      items: [
        "Take the partition key value from the request",
        "Use it to choose the partition, and so the server",
        "Within that partition, jump to the right sort key",
        "Read the item stored there",
      ],
      why: "The partition key decides where the data lives. Inside that partition, items are ordered by sort key, which gives the exact position or range.",
    },
    {
      type: "bug",
      q: "A team uses a plain key-value store for baskets. Click the line that the store is badly suited to, because it cannot find items by what is inside them.",
      code: [
        'store.set("basket:42", basket_a)',
        'store.set("basket:43", basket_b)',
        'mine = store.get("basket:42")',
        "big = [b for b in store.all() if b.total > 50]",
      ],
      a: 3,
      why: "Get and set by key are what the store does well. Asking for every basket with a total above 50 has no key to jump to, so it must read every value. A document store could be indexed on that field.",
    },
    {
      type: "match",
      q: "Match each worry to the NoSQL aim that addresses it.",
      pairs: [
        ["Traffic on a sale day is 20 times normal", "Scale out by adding machines"],
        ["Each product has different fields", "A flexible schema per item"],
        ["One data centre loses power but the site must keep answering", "Availability from copies on other machines"],
        ["A new hire must understand the design in a day", "Simplicity of design"],
      ],
      why: "NoSQL stores stress simple design, horizontal scaling and availability. Per-item schemas are one of the ways they stay flexible and easy to adopt.",
    },
    {
      type: "pick",
      q: "Four sample stores are drawn. Tap the wide-column store: table-like rows where each row has its own set of columns.",
      fig: FIG_FAMS,
      a: "C",
      why: "Panel C is the table with rows that fill different columns. A is a document with nested values, B is key-value (an opaque value behind each key) and D is a graph of vertices and edges.",
    },
  ]);

  /* ================= ds-log ================= */
  const FIG_SEQ = table(
    ["Task: store 100,000 records of 100 bytes", "Time on the same disk"],
    [
      ["Append each record to the end of one file", "0.1 s"],
      ["Overwrite each record in place at scattered positions", "12 s"],
    ],
  );

  const FIG_LOGH = (() => {
    const recs = ["bal = 100", "rent = 500", "bal = 80", "bal = 95", "rent = 520", "bal = 60"];
    let s = tx(8, 16, "log file, oldest first", { s: 12, c: "var(--text-dim)" });
    recs.forEach(
      (r, i) =>
        (s += pk(
          "r" + (i + 1),
          rc(8 + (i % 3) * 112, 26 + Math.floor(i / 3) * 56, 106, 48) +
            tx(61 + (i % 3) * 112, 44 + Math.floor(i / 3) * 56, "#" + (i + 1), {
              a: "middle",
              s: 11,
              c: "var(--text-faint)",
            }) +
            mono(61 + (i % 3) * 112, 63 + Math.floor(i / 3) * 56, r, { a: "middle", s: 13 }),
        )),
    );
    return svg(346, 140, s);
  })();

  const FIG_LOGT = (() => {
    const recs = [
      ["a", "5"],
      ["b", "7"],
      ["a", "9"],
      ["b", "✕ deleted"],
      ["c", "1"],
    ];
    let s = "";
    recs.forEach(([k, v], i) => {
      const x = 8 + (i % 3) * 116,
        y = 8 + Math.floor(i / 3) * 56,
        dl = v[0] === "✕";
      s +=
        rc(x, y, 110, 48, { st: dl ? "var(--rose)" : "var(--line-2)", f: dl ? "var(--rose-dim)" : "var(--panel)" }) +
        tx(x + 55, y + 18, "#" + (i + 1), { a: "middle", s: 11, c: "var(--text-faint)" }) +
        mono(x + 55, y + 38, dl ? `${k}: deleted` : `${k} = ${v}`, { a: "middle", s: 13 });
    });
    return svg(356, 120, s);
  })();

  B.add("ds-log", [
    {
      type: "mcq",
      q: "Same disk, same records. What mostly explains the gap in the table?",
      fig: FIG_SEQ,
      o: [
        "Appends carry on where the last one ended, but scattered writes make the disk jump",
        "Appended records are smaller than overwritten ones, so less data is written overall",
        "Appends wait in memory until the whole batch is ready, then reach the disk once",
        "Log files are kept in a faster part of the disk than ordinary data files are",
      ],
      a: 0,
      why: "The gap is about 120 times (12 s ÷ 0.1 s). Appending is sequential, so there is no seeking. Overwriting scattered places forces the disk to move for every record. That is why databases like append-only logs for writes.",
    },
    {
      type: "match",
      q: "Match each property of an append-only log to the reason behind it.",
      pairs: [
        ["Writes are fast", "Every record goes straight onto the end, with no seeking"],
        ["Recovery after a crash is simple", "Earlier records are never overwritten, so they stay intact"],
        ["Reads without an index are slow", "The only way to find a key is to scan the records"],
        ["The file keeps growing", "Old values and deleted keys are never removed in place"],
      ],
      why: 'All four follow from "only ever add to the end": cheap writes and safe history on one side, scans and growth on the other.',
    },
    {
      type: "pick",
      q: "Every record is kept. What was the value of bal immediately before record #4 was appended? Tap the record that tells you.",
      fig: FIG_LOGH,
      a: "r3",
      why: 'The newest bal before #4 is #3 (bal = 80). Record #4 itself is the value after, and #1 is older but was already replaced. A log keeps history, so "as it was then" is a scan that stops earlier.',
    },
    {
      type: "slider",
      q: "Appending to a log runs at 200 MB per second. Each record is 100 bytes. About how many million records can be written per second?",
      min: 0,
      max: 5,
      step: 0.5,
      ans: 2,
      tol: 0.5,
      unit: " million",
      hint: "1 MB holds 10,000 records of 100 bytes. So 200 MB holds 200 × 10,000.",
      why: "200 MB × 10,000 records per MB = 2,000,000 records a second. Sequential appends are fast enough that the disk is rarely the limit.",
    },
    {
      type: "bug",
      q: "This delete() edits the file in place instead of using the log's one rule: only ever append. Click the line that breaks that rule.",
      code: [
        "def delete(key):",
        '    lines = open("db.log").read().splitlines()',
        '    keep = [x for x in lines if not x.startswith(key + ",")]',
        '    open("db.log", "w").write("\\n".join(keep))',
      ],
      a: 3,
      why: "Reopening the file in write mode wipes it and rewrites everything. A crash halfway loses the whole log, and history is gone. The log way is to append a tombstone record for the key.",
    },
    {
      type: "multi",
      q: "Read this log. Select all statements that are true.",
      fig: FIG_LOGT,
      o: [
        "Scanning from the newest end finds a's current value after reading three records",
        "Scanning from the oldest end can stop at record #1 and answer for a",
        "b reads as deleted, even though record #2 still holds a value for it",
        "Record #3 erased record #1 from the file",
      ],
      a: [0, 2],
      why: "From the newest end the order is #5, #4, #3, and #3 gives a = 9. Scanning from the oldest end cannot stop early, because later records may override. The tombstone in #4 hides #2. Nothing is erased: #3 only supersedes #1.",
    },
  ]);

  /* ================= ds-hashidx ================= */
  const FIG_TOMB = (() => {
    const seg = (y, label, recs, dim) =>
      tx(8, y + 14, label, { s: 12, c: "var(--text-dim)" }) +
      recs
        .map(
          ([t, bad], i) =>
            rc(8 + i * 140, y + 20, 130, 34, {
              st: bad ? "var(--rose)" : "var(--line-2)",
              f: bad ? "var(--rose-dim)" : "var(--panel)",
              d: dim ? "5 4" : "",
            }) + mono(73 + i * 140, y + 42, t, { a: "middle", s: 13 }),
        )
        .join("");
    return svg(
      290,
      262,
      seg(2, "S1 (oldest, not merged)", [["k = 4"], ["m = 2"]], true) +
        seg(60, "S2 (to be merged)", [["m = 8"], ["n = 1"]]) +
        seg(118, "S3 (to be merged)", [["k: deleted", 1], ["p = 3"]]) +
        tx(8, 198, "Compaction merges only S2 and S3", { s: 12, c: "var(--text-dim)" }) +
        tx(8, 216, "into a new segment. S1 stays as it is.", { s: 12, c: "var(--text-dim)" }),
    );
  })();

  const FIG_IDXSIZE = table(
    ["Store", "Distinct keys", "Typical value size", "Updates a day"],
    [
      ["Photos", "2 million", "1 MB", "10 thousand"],
      ["Clicks", "500 million", "20 bytes", "2 million"],
      ["Profiles", "10 million", "100 KB", "50 million"],
    ],
  );

  const FIG_STALE = (() => {
    const rows = [
      ["ia", "a", "S1 @0"],
      ["ib", "b", "S2 @0"],
      ["ic", "c", "S1 @40"],
    ];
    let s = tx(8, 14, "in-memory index", { s: 12, c: "var(--text-dim)" });
    rows.forEach(([id, k, t], i) => (s += pk(id, rc(8, 22 + i * 44, 160, 36) + mono(20, 46 + i * 44, `${k} → ${t}`))));
    s += tx(196, 14, "segments on disk", { s: 12, c: "var(--text-dim)" });
    const rec = (x, y, t) => rc(x, y, 76, 30, { rx: 6 }) + mono(x + 38, y + 20, t, { a: "middle", s: 12 });
    s += tx(196, 38, "S1 (older)", { s: 12 }) + rec(196, 44, "a=1 @0") + rec(280, 44, "c=5 @40");
    s += tx(196, 100, "S2 (newer)", { s: 12 }) + rec(196, 106, "b=2 @0") + rec(280, 106, "c=9 @40");
    return svg(364, 160, s);
  })();

  B.add("ds-hashidx", [
    {
      type: "mcq",
      q: "Compaction is about to merge S2 and S3 into one new segment. Key k has a tombstone in S3. What should the merged segment do with it?",
      fig: FIG_TOMB,
      o: [
        "Keep it: S1 still holds k = 4, which would otherwise come back",
        "Drop it: compaction removes any key whose newest record is a deletion",
        "Drop it: the in-memory index forgets k, so the files no longer matter",
      ],
      a: 0,
      why: "S1 is not part of this merge, so an older k = 4 still sits there. If the tombstone vanished, a read (or an index rebuilt after a restart) would find 4. The tombstone can only go when no older segment holds the key. The index is rebuilt from the files, so it cannot be relied on.",
    },
    {
      type: "bug",
      q: "A hash-indexed log deletes a key like this. The server restarts and rebuilds its index by replaying the log. Click the line that lets the deleted key come back.",
      code: ["def delete(key):", "    if key in index:", "        del index[key]", "    return True"],
      a: 2,
      why: "Only the in-memory index forgets the key. The log still holds its old value and no tombstone, so the replay after a restart finds it again. The delete must also append a tombstone record.",
    },
    {
      type: "match",
      q: "Match each design change to its main consequence.",
      pairs: [
        ["Make segments much smaller", "More files to check, and compaction runs more often"],
        ["Keep the hash index on disk instead of memory", "Every lookup pays an extra disk read"],
        ["Ask for every key between two values", "No shortcut: a hash gives no order"],
        ["Let one key be rewritten millions of times", "Index stays small, but the log grows until compaction"],
      ],
      why: "The hash index trades memory for one-jump reads. Moving it to disk loses that speed, and hashing scatters keys so ranges cannot use it. Rewrites cost disk space, not index space, until compaction cleans up.",
    },
    {
      type: "mcq",
      q: "Which store needs the most memory for its hash index?",
      fig: FIG_IDXSIZE,
      o: ["Photos", "Clicks", "Profiles"],
      a: 1,
      hint: "The index holds one small entry per key. Does value size or update count change that?",
      why: "The index has one entry per distinct key, whatever the value size or how often it changes. Clicks has 500 million keys, far more than the others. Photos has the biggest values and Profiles the most updates, but neither adds index entries.",
    },
    {
      type: "slider",
      q: "After a crash, the server rebuilds its hash index by reading all its segments, 20 GB in total, at 400 MB per second. About how many seconds does the rebuild take?",
      min: 0,
      max: 120,
      step: 10,
      ans: 50,
      tol: 15,
      unit: " s",
      hint: "20 GB is 20,000 MB. How many lots of 400 fit in 20,000? Try 20,000 ÷ 400 = 200 ÷ 4.",
      why: "20,000 MB ÷ 400 MB/s = 50 s. The index lives in memory, so every restart has to scan the files again. That is a real cost of a hash index and why some stores save snapshots of it.",
    },
    {
      type: "pick",
      q: "A get for c returns 5, but c was updated later. Tap the index entry that is out of date.",
      fig: FIG_STALE,
      a: "ic",
      why: "c = 9 sits in the newer segment S2, but the index still points at the old copy in S1. On every write the index must be updated to the newest offset. Entries a and b point at their only records.",
    },
  ]);

  /* ================= ds-sstable ================= */
  const KEYS = ["b", "c", "e", "g", "h", "j", "m", "n", "p", "q", "s", "t"];
  const FIG_SPARSE = (() => {
    let s = tx(8, 16, "sparse index (every 4th key)", { s: 12, c: "var(--text-dim)" });
    [
      ["ib", "b", 0],
      ["ih", "h", 4],
      ["ip", "p", 8],
    ].forEach(
      ([id, k, i], j) =>
        (s += pk(id, rc(8 + j * 100, 24, 92, 34) + mono(54 + j * 100, 46, `${k} → #${i}`, { a: "middle" }))),
    );
    s += tx(8, 90, "sorted segment on disk", { s: 12, c: "var(--text-dim)" });
    KEYS.forEach((k, i) => {
      const x = 8 + (i % 6) * 52,
        y = 98 + Math.floor(i / 6) * 58;
      s +=
        rc(x, y, 46, 34, { rx: 6 }) +
        mono(x + 23, y + 22, k, { a: "middle" }) +
        tx(x + 23, y + 48, "#" + i, { a: "middle", s: 10, c: "var(--text-faint)" });
    });
    return svg(320, 216, s);
  })();

  const FIG_RANGE = (() => {
    const ks = ["a", "c", "d", "e", "f", "h", "k", "m"];
    let s = tx(8, 16, "one sorted segment", { s: 12, c: "var(--text-dim)" });
    ks.forEach(
      (k, i) =>
        (s += pk(
          "k" + k,
          rc(8 + (i % 4) * 70, 26 + Math.floor(i / 4) * 52, 64, 42) +
            mono(40 + (i % 4) * 70, 53 + Math.floor(i / 4) * 52, k, { a: "middle", s: 15 }),
        )),
    );
    return svg(296, 134, s);
  })();
  Object.assign(partScope, { FIG_RANGE, FIG_SPARSE });
})();

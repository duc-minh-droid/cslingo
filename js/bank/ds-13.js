(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { FIG_COMPACT, FIG_IDX, FIG_WORK, ln, rc, segRows, svg, tx } = partScope;
  const B = NIC.bank;

  B.add("ds-hashidx", [
    {
      type: "pick",
      q: "Compaction merges these three segments into one, keeping only the newest value for each key. Tap every record that gets thrown away.",
      fig: FIG_COMPACT,
      a: ["1a", "1b", "1c", "2a"],
      why: "Newest values: a = 7 and c = 8 (segment 3), b = 6 and d = 5 (segment 2), e = 9 (segment 3). That leaves segment 1's a, b and c and segment 2's a as stale. Segment 1 is wholly out of date.",
    },
    {
      type: "slider",
      q: "A hash index keeps one entry per key and each entry takes about 100 bytes of memory. The server has 8 GB of memory set aside for it. Roughly how many million keys can it index?",
      min: 0,
      max: 200,
      step: 10,
      ans: 80,
      tol: 30,
      unit: " million",
      why: "8 GB is about 8,000 MB, and each entry is 100 bytes, so 8,000 MB ÷ 100 bytes = 80 million entries. The hash map must fit in memory, which caps the number of distinct keys.",
      hint: "8 GB is 8,000 MB. How many 100-byte entries fit in one MB?",
    },
    {
      type: "bug",
      q: "Compaction runs in the background while the store keeps serving reads. Click the step that can lose data or break reads.",
      code: [
        "compaction (background):",
        "  read the old segments and keep the newest record for each key",
        "  delete the old segments",
        "  write the kept records to a new segment file",
        "  point the index at the new segment",
      ],
      a: 2,
      why: "Until the new segment is written and the index points at it, reads still need the old files, and a crash in between would lose everything. Safe order: write the new segment, switch the index, then delete the old ones.",
    },
    {
      type: "mcq",
      q: "Which workload suits a hash-indexed log?",
      fig: FIG_WORK,
      o: [
        "A: few keys fit in memory, and compaction collapses billions of updates",
        "A: so many updates make every lookup slower than a scan",
        "B: the log never needs compaction, so the index can be smaller",
        "B: 3 billion keys is easy because the index lives on disk",
      ],
      a: 0,
      why: "The index needs one in-memory entry per distinct key. A has 40 thousand keys (a few MB) and compaction shrinks its pile of updates to 40 thousand records. B would need hundreds of GB of memory for its keys.",
    },
    {
      type: "cat",
      q: "The server restarts. For each item, does it survive on disk, or must it be rebuilt?",
      buckets: ["Survives the restart", "Must be rebuilt"],
      items: [
        ["The segment files", 0],
        ["The in-memory hash map of keys to offsets", 1],
        ["The newest value written for every key", 0],
        ["The record of which segment each key lives in (held in the map)", 1],
        ["Old overwritten values that compaction has not reached yet", 0],
      ],
      why: "Everything written is appended to files, so it survives. The hash map lives in memory and is lost, so the store replays the segments to rebuild it.",
    },
    {
      type: "multi",
      q: "Look at the index and the three segments. Select all statements that are true.",
      fig: FIG_IDX,
      o: [
        "The k1 record in segment 1 is out of date",
        "Merging segments 1 and 2 keeps k1 = 9 and k2 = 7",
        "k3's newest value is in segment 2",
        "Segment 1 could be deleted without losing any current value",
      ],
      a: [0, 1],
      why: "k1 was rewritten in segment 2, so segment 1's copy is stale. A merge of segments 1 and 2 keeps k1 = 9 and k2 = 7. k3's newest value is 5 in segment 3. Segment 1 is the only place with k2, so deleting it would lose a current value.",
    },
  ]);

  /* ================= ds-sstable ================= */
  const tn = (x, y, k) =>
    `<circle cx="${x}" cy="${y}" r="20" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>` +
    tx(x, y + 5, k, { a: "middle", m: true, s: 15 });
  const FIG_TREE = svg(
    560,
    190,
    ln(280, 30, 140, 90) +
      ln(280, 30, 420, 90) +
      ln(140, 90, 70, 160) +
      ln(140, 90, 210, 160) +
      ln(420, 90, 350, 160) +
      ln(420, 90, 490, 160) +
      tn(280, 30, "m") +
      tn(140, 90, "f") +
      tn(420, 90, "s") +
      tn(70, 160, "c") +
      tn(210, 160, "i") +
      tn(350, 160, "p") +
      tn(490, 160, "w"),
  );

  const FIG_READ = segRows(
    [
      {
        id: "m",
        label: "Memtable (memory)",
        recs: [
          ["c", 1],
          ["m", 2],
        ],
      },
      {
        id: "3",
        label: "Segment 3 (newest)",
        recs: [
          ["b", 5],
          ["x", 1],
        ],
      },
      {
        id: "2",
        label: "Segment 2",
        recs: [
          ["m", 3],
          ["q", "DELETED", "var(--rose)"],
        ],
      },
      {
        id: "1",
        label: "Segment 1 (oldest)",
        recs: [
          ["a", 1],
          ["q", 8],
        ],
      },
    ],
    { pick: true },
  );

  const FIG_SPARSEIDX = svg(
    560,
    200,
    tx(8, 22, "One sorted segment of 6,000 keys, two index designs", { s: 13, c: "var(--text-dim)" }) +
      tx(8, 56, "Design A", { s: 14 }) +
      [0, 1, 2, 3, 4, 5]
        .map(
          (i) =>
            rc(90 + i * 74, 38, 70, 26, { st: "var(--blue)" }) +
            tx(125 + i * 74, 56, "100 keys", { a: "middle", s: 11, w: 700 }),
        )
        .join("") +
      tx(8, 76, "index entry at the start of each block", { s: 11, c: "var(--text-faint)", w: 700 }) +
      tx(8, 120, "Design B", { s: 14 }) +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        .map(
          (i) =>
            rc(90 + i * 37, 102, 34, 26, { st: "var(--amber)" }) +
            tx(107 + i * 37, 120, "10", { a: "middle", s: 11, w: 700 }),
        )
        .join("") +
      tx(8, 140, "index entry at the start of each block", { s: 11, c: "var(--text-faint)", w: 700 }) +
      tx(8, 176, "A: every 100th key is indexed (60 entries).   B: every 10th key is indexed (600 entries).", {
        s: 12,
        c: "var(--text-dim)",
        w: 700,
      }) +
      tx(8, 194, "Blocks are drawn only in part.", { s: 11, c: "var(--text-faint)", w: 700 }),
  );

  B.add("ds-sstable", [
    {
      type: "order",
      q: "The memtable is the balanced tree drawn here. It is flushed to disk as a new SSTable. Put the keys in the order they are written into the file.",
      fig: FIG_TREE,
      items: ["c", "f", "i", "m", "p", "s", "w"],
      why: "An SSTable is sorted by key, and reading a balanced search tree in order (left branch, then the node, then right branch) hands the keys over already sorted. That is why the memtable is a tree, and why no separate sort is needed at flush time.",
    },
    {
      type: "pick",
      q: "A read for key q checks the memtable first, then segments from newest to oldest, and stops at the first record it finds for q. Tap the record that decides the answer.",
      fig: FIG_READ,
      a: "2q",
      why: 'The memtable and segment 3 have no q, so the search reaches segment 2 and finds the tombstone there. It stops, so the answer is "not found", even though segment 1 still holds q = 8.',
    },
    {
      type: "mcq",
      q: "Memory is tight and reads are not time-critical. Which design fits, and what does it cost?",
      fig: FIG_SPARSEIDX,
      o: [
        "Design A: 60 index entries, but a lookup may scan about 100 records",
        "Design A: 600 index entries, and a lookup scans about 10 records",
        "Design B: 60 index entries, but a lookup may scan about 100 records",
        "Design B: 600 index entries, so every key is found with no scan",
      ],
      a: 0,
      why: "A sparse index trades memory for scanning. Indexing every 100th key needs a tenth of the memory of indexing every 10th, but each lookup has to scan a block ten times as long.",
    },
    {
      type: "bug",
      q: "This put() is meant to keep writes flowing while a full memtable is saved. Click the line that breaks that.",
      code: [
        "put(key, value):",
        "  memtable.insert(key, value)",
        "  if memtable is full:",
        "    freeze it, start a new empty memtable",
        "    block all puts until the frozen one is saved",
      ],
      a: 4,
      why: "New writes go into a fresh memtable while the full one is written out in the background, so writing stays fast. Blocking every put until the flush ends would stall the store each time the memtable fills.",
    },
    {
      type: "multi",
      q: "Three sorted segments of 1,000 keys each are merged into one. Select all statements that are true.",
      o: [
        "The inputs are read one after another from start to end, with no random jumping",
        "The output may hold fewer than 3,000 records",
        "The output must be sorted again afterwards",
        "When a key is in several segments, the oldest segment's value wins",
      ],
      a: [0, 1],
      why: "Merging sorted files is like the merge step of merge sort: read them side by side, sequentially. Duplicate keys collapse to one record, so the result can be smaller than 3,000. The output comes out sorted already, and the newest value wins, not the oldest.",
    },
    {
      type: "slider",
      q: "A store flushes its memtable whenever it fills 64 MB. Writes arrive at 8 MB per second. If nothing is ever merged, about how many SSTables pile up in one hour?",
      min: 0,
      max: 1000,
      step: 50,
      ans: 450,
      tol: 100,
      unit: " SSTables",
      why: "64 MB at 8 MB per second fills every 8 seconds. One hour is 3,600 seconds, so 3,600 ÷ 8 = 450 files. A read might have to check each of them, which is why background merging matters.",
      hint: "How many seconds to fill 64 MB at 8 MB per second? Then divide 3,600 by that.",
    },
  ]);
})();

(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { arrow, chipH, ci, hit, ln, pk, qlDocs, qlGraph, qlPipes, qlVenn, rc, svg, table, tx } = partScope;
  const B = NIC.bank;

  // tree: how far a friendship search fans out
  const qlTree = (() => {
    let s = "";
    const lvl = [
      ["hop 0", 28],
      ["hop 1", 92],
      ["hop 2", 156],
      ["hop 3", 220],
    ];
    lvl.forEach(([t, y]) => (s += tx(8, y + 4, t, { a: "start", c: "var(--text-dim)", s: 12 })));
    s += ci(240, 28, 18, { f: "var(--violet)", fo: 0.3, s: "var(--violet)" }) + tx(240, 32, "Ana", { s: 11 });
    const x1 = [130, 240, 350];
    x1.forEach((x) => {
      s += ln(240, 46, x, 78) + ci(x, 92, 14);
    });
    const x2 = [];
    x1.forEach((x) => [-36, 0, 36].forEach((d) => x2.push(x + d)));
    x2.forEach((x, i) => {
      s += ln(x1[Math.floor(i / 3)], 106, x, 144) + ci(x, 156, 9);
    });
    x2.forEach((x) => [-9, 9].forEach((d) => (s += ln(x, 165, x + d, 205, { sw: 1.5, s: "var(--line)" }))));
    s +=
      tx(300, 124, "× 100", { c: "var(--amber-ink)", a: "start", s: 13 }) +
      tx(398, 150, "× 100", { c: "var(--amber-ink)", a: "start", s: 13 }) +
      tx(418, 214, "× 100", { c: "var(--amber-ink)", a: "end", s: 13 });
    s += tx(432, 20, "each person has 100 friends, none shared", { c: "var(--text-dim)", s: 12, a: "end" });
    return svg(440, 236, s);
  })();

  // table plus two pipelines
  const qlTable = `${table(
    ["name", "city", "works at", "friends with"],
    [
      ["Ana", "Leeds", "Acme", "Ben"],
      ["Ben", "Leeds", "<b>Bolt</b>", "Ana, Cy"],
      ["Cy", "York", "Acme", "Ben, Dee"],
      ["Dee", "York", "<b>Bolt</b>", "Cy, Eli"],
      ["Eli", "Hull", "Acme", "Dee"],
    ],
  )}
    <div style="margin-top:10px;font:800 12px var(--sans);color:var(--text-dim)">Pipeline X</div>${chipH("Start: Ana", "var(--violet)")}${chipH("▸", "transparent")}${chipH("Works at Bolt", "var(--blue)")}${chipH("▸", "transparent")}${chipH("Go to friends", "var(--amber)")}
    <div style="margin-top:8px;font:800 12px var(--sans);color:var(--text-dim)">Pipeline Y</div>${chipH("Start: Ana", "var(--violet)")}${chipH("▸", "transparent")}${chipH("Go to friends", "var(--amber)")}${chipH("▸", "transparent")}${chipH("Works at Bolt", "var(--blue)")}`;

  B.add("ds-querylab", [
    {
      type: "pick",
      q: "The Venn diagram shows who lives in York and who works at Acme. A query starts with everyone, then chains <b>Works at Acme</b> followed by <b>City is York</b>. Tap everyone the FIRST filter throws out.",
      fig: qlVenn,
      a: ["ben", "dee"],
      why: "The first filter keeps only the Acme circle, so Ben and Dee, who are outside it, go. The second filter then removes Ana and Eli, leaving Cy. In the other order the filters remove different people at each step but the final answer is the same, because chained filters are an intersection.",
    },
    {
      type: "pick",
      q: "Friendships are shown as lines. Start at Ana and press <b>Go to friends</b> twice. A hop only adds people not already reached. Tap everyone who first appears on the SECOND hop.",
      fig: qlGraph,
      a: ["dee", "eli"],
      why: "Hop 1 reaches Ben and Cy. Hop 2 reaches Dee, through either of them, and Eli through Cy. Ana is already known and Dee is added only once even though two paths lead to her. Fay would only appear on hop 3.",
    },
    {
      type: "cat",
      q: "Five people are friends in a chain (Ana, Ben, Cy, Dee, Eli). A hop costs a self-join in tables, one document fetch for every person you start the hop from, and one edge hop in the graph. Which query is larger on each cost?",
      fig: qlPipes,
      buckets: ["Query A is larger", "Query B is larger"],
      items: [
        ["Self-joins on the friendships table", 0],
        ["Extra documents fetched by your code", 1],
        ["Edge hops followed in the graph", 0],
        ["People a document hop starts from", 1],
      ],
      hint: "Query B starts a single hop from all five people at once.",
      why: "Query A makes 3 hops, so 3 joins and 3 graph hops, but each hop starts from just one person, 3 fetches in total. Query B makes 1 hop from all 5 people, so only 1 join but 5 fetches. Documents pay per person you expand, tables per hop you write.",
    },
    {
      type: "pick",
      q: "Each person is stored as a document that lists their friends. Ben and Cy stop being friends. Tap every document the application must change.",
      fig: qlDocs,
      a: ["ben", "cy"],
      why: "Each friendship is stored twice, once in each person's list, so ending one friendship means editing two documents, and forgetting one leaves them disagreeing. In a table it is one row to delete and in a graph one edge.",
    },
    {
      type: "bug",
      q: "Five people are friends in a chain: Ana, Ben, Cy, Dee, Eli. Ana, Cy and Eli work at Acme. A hop adds only people not reached before. This trace of a query has one wrong step. Which line?",
      code: [
        "Start: Ana  ->  {Ana}",
        "Go to friends  ->  {Ben}",
        "Go to friends  ->  {Ana, Cy}",
        "Works at Acme  ->  {Ana, Cy}",
      ],
      a: 2,
      why: "On the second hop Ana is already reached, so only Cy is new and the result is {Cy}. The Acme filter then correctly keeps Cy. The error in line 3 spreads into line 4, which looks right only because it follows the wrong input.",
    },
    {
      type: "mcq",
      q: "Each person has 100 friends and nobody's friends overlap. The document model must fetch the document of every person at hop 2 to find the people at hop 3 (tree shown). Roughly how many fetches is that one step?",
      fig: qlTree,
      o: ["About 100", "About 10,000", "About 1,000,000", "About 100,000,000"],
      a: 1,
      hint: "People at hop 2 = 100 × 100.",
      why: "Hop 1 has 100 people and hop 2 has 100 × 100 = 10,000, so expanding hop 2 needs 10,000 document fetches, each a round trip from your own code. The frontier multiplies at every hop, which is why variable-depth relationship questions strain tables and documents.",
    },
    {
      type: "cat",
      q: "Which data model fits each job best?",
      buckets: ["Tables", "Documents", "Graph"],
      items: [
        ["Total sales per city per month over millions of rows", 0],
        ["Load a whole user profile, with settings and address, in one read", 1],
        ["Find the shortest chain of introductions between two strangers", 2],
        ["Join orders to customers, then group and add up", 0],
        ["Store records whose fields differ from one to the next", 1],
        ["Who bought what my friends' friends bought?", 2],
      ],
      why: "Tables suit filtering, joining and aggregating many uniform rows. Documents suit self-contained records that are read and written whole. Graphs suit questions about how things connect, especially to unknown depth.",
    },
    {
      type: "mcq",
      q: "Using the people and friendships in the table, which pipeline returns Ben?",
      fig: qlTable,
      o: ["Only pipeline Y", "Only pipeline X", "Both pipelines", "Neither pipeline"],
      a: 0,
      why: "Order matters between a filter and a hop. In X, filtering Ana for Bolt leaves nobody (she works at Acme), so the hop has nothing to start from. In Y the hop reaches Ben first, and the Bolt filter then keeps him. Two filters in a row can swap, but a hop changes who you are looking at.",
    },
  ]);

  /* =====================================================================
     3.W  ds-engine
     ===================================================================== */

  // layers: memory, then segments newest to oldest
  const enLayers = (() => {
    const chip = (x, y, t, tomb) =>
      rc(x, y, 104, 30, {
        sw: 2.2,
        rx: 7,
        s: tomb ? "var(--rose)" : "var(--line-2)",
        f: tomb ? "var(--rose)" : "var(--panel)",
        fo: tomb ? 0.14 : null,
        d: tomb ? "5 3" : null,
      }) + tx(x + 52, y + 20, t, { s: 12 });
    const rows = [
      ["mem", "Memtable", "in memory", [["date: v9"]]],
      ["s3", "Segment 3", "newest", [["apple: v5"], ["fig: deleted", 1]]],
      ["s2", "Segment 2", "", [["fig: v2"], ["kiwi: v3"]]],
      ["s1", "Segment 1", "oldest", [["apple: v1"], ["fig: v1"]]],
    ];
    let s = "";
    rows.forEach(([id, a, b, cells], i) => {
      const y = 8 + i * 60;
      s +=
        rc(4, y, 346, 52, { sw: 2, s: "var(--line)", rx: 10 }) +
        tx(14, y + 24, a, { a: "start", s: 13 }) +
        (b ? tx(14, y + 40, b, { a: "start", s: 11, c: "var(--text-dim)" }) : "");
      cells.forEach(([t, tomb], j) => (s += chip(122 + j * 112, y + 11, t, tomb)));
      s += hit(id, 4, y, 346, 52, 10);
    });
    return svg(354, 252, s);
  })();

  // sawtooth: segments on disk over 16 minutes
  const enSaw = (() => {
    const X = (m) => 50 + m * 23,
      Y = (n) => 224 - n * 28;
    const ev = [
      [2, 3],
      [4, 4],
      [6, 5],
      [8, 6],
      [9, 1],
      [10, 2],
      [12, 3],
      [14, 4],
      [16, 4],
    ];
    let s = ln(50, 224, 420, 224, { s: "var(--line-2)" }) + ln(50, 20, 50, 224, { s: "var(--line-2)" });
    for (let m = 0; m <= 16; m += 2) s += tx(X(m), 242, m, { s: 11, c: "var(--text-dim)" });
    for (let n = 0; n <= 7; n++)
      s +=
        tx(42, Y(n) + 4, n, { a: "end", s: 11, c: "var(--text-dim)" }) +
        (n ? ln(50, Y(n), 420, Y(n), { s: "var(--line)", sw: 1 }) : "");
    s +=
      tx(235, 262, "minutes", { s: 11, c: "var(--text-dim)" }) +
      tx(12, 120, "segments on disk", { s: 11, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 120)" `,
      );
    let d = `M ${X(0)} ${Y(2)}`;
    ev.forEach(([m, n]) => (d += ` H ${X(m)} V ${Y(n)}`));
    s += `<path d="${d}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    s +=
      ln(X(15), 24, X(15), 224, { s: "var(--amber)", sw: 2.5, d: "6 4" }) +
      tx(X(15), 16, "read here", { c: "var(--amber-ink)" });
    s += tx(X(9) - 6, Y(3), "compaction", { a: "end", c: "var(--rose-ink)", s: 12 });
    return svg(440, 270, s);
  })();

  // swimlane: writes, the log, the disk, a power cut
  const enLanes = (() => {
    const W = [["fig"], ["kiwi"], ["date"], ["plum"], ["apple"], ["fig"]];
    const X = (i) => 62 + i * 58;
    let s =
      tx(4, 38, "writes", { a: "start", c: "var(--text-dim)", s: 11 }) +
      tx(4, 110, "log file", { a: "start", c: "var(--text-dim)", s: 11 }) +
      tx(4, 178, "disk", { a: "start", c: "var(--text-dim)", s: 11 });
    s +=
      rc(56, 90, 2 * 58 - 2, 30, { f: "var(--teal)", fo: 0.3, s: "var(--teal)", sw: 2, rx: 6 }) +
      tx(56 + 56, 110, "log ON", { s: 12 });
    s +=
      rc(56 + 2 * 58 + 2, 90, 4 * 58 - 8, 30, { f: "var(--rose)", fo: 0.25, s: "var(--rose)", sw: 2, rx: 6 }) +
      tx(56 + 2 * 58 + 2 + (4 * 58 - 8) / 2, 110, "log OFF", { s: 12 });
    s +=
      rc(268, 160, 134, 30, { f: "var(--blue)", fo: 0.28, s: "var(--blue)", sw: 2, rx: 6 }) +
      tx(335, 180, "segment saved", { s: 12 });
    s +=
      ln(268, 126, 268, 160, { s: "var(--blue)", sw: 2, d: "4 3" }) +
      tx(274, 143, "memtable full: flush", { a: "start", s: 11.5, c: "var(--blue-ink)" });
    W.forEach(
      ([k], i) =>
        (s += pk(
          `w${i + 1}`,
          rc(X(i) - 24, 16, 52, 40, { sw: 2.5, rx: 8 }) +
            tx(X(i) + 2, 32, `#${i + 1}`, { s: 10, c: "var(--text-dim)" }) +
            tx(X(i) + 2, 48, k, { s: 12 }),
        )),
    );
    s +=
      ln(56 + 6 * 58 - 2, 12, 56 + 6 * 58 - 2, 200, { s: "var(--rose)", sw: 3, d: "6 4" }) +
      tx(56 + 6 * 58 - 2, 212, "power cut", { c: "var(--rose-ink)", a: "end" });
    return svg(440, 222, s);
  })();

  // sequence diagram: a risky write path
  const enSeq = (() => {
    const L = [
      ["Client", 56],
      ["Engine", 160],
      ["Log (disk)", 272],
      ["Memtable (RAM)", 370],
    ];
    let s = "";
    L.forEach(([t, x], i) => {
      const w = i === 3 ? 118 : 92;
      s +=
        ln(x, 44, x, 222, { s: "var(--line)", sw: 2, d: "4 4" }) +
        rc(x - w / 2, 8, w, 32, { sw: 2.5, rx: 8 }) +
        tx(x, 28, t, { s: 13 });
    });
    const msg = (id, x1, x2, y, t, w) =>
      arrow(x1, y, x2, y, { s: "var(--text)" }) +
      pk(id, rc((x1 + x2) / 2 - w / 2, y - 29, w, 24, { sw: 2.2, rx: 12 }) + tx((x1 + x2) / 2, y - 12, t, { s: 12.5 }));
    s +=
      msg("m1", 56, 160, 78, "1 put fig=v9", 100) +
      msg("m2", 160, 56, 120, "2 ok, saved!", 98) +
      msg("m3", 160, 370, 162, "3 insert into memory", 164) +
      msg("m4", 160, 272, 204, "4 append", 84);
    return svg(440, 232, s);
  })();

  // tape: a run of writes
  const enTape = (() => {
    const K = ["fig", "kiwi", "kiwi", "fig", "date", "fig", "plum", "apple"];
    let s = tx(220, 14, "writes, in the order they arrive", { c: "var(--text-dim)", s: 12 });
    K.forEach((k, i) => {
      const x = 8 + i * 53;
      s +=
        rc(x, 40, 49, 50, { sw: 2.5, rx: 8 }) +
        tx(x + 24.5, 36, i + 1, { s: 12, c: "var(--text-dim)" }) +
        tx(x + 24.5, 71, k, { s: 13.5 }) +
        hit(`w${i + 1}`, x, 40, 49, 50, 8);
    });
    s += tx(220, 112, "memtable: full at 4 different keys", { c: "var(--blue-ink)", s: 12.5 });
    return svg(440, 122, s);
  })();

  // strips: three segments before compaction
  const enStrips = (() => {
    const S = [
      ["Segment 3", ["date: deleted", "fig: deleted", "kiwi: v9"]],
      ["Segment 2", ["apple: v5", "date: v6", "kiwi: v7", "plum: v8"]],
      ["Segment 1", ["apple: v1", "fig: v2", "kiwi: v3", "mango: v4"]],
    ];
    let s = "";
    S.forEach(([n, cells], i) => {
      const y = 8 + i * 48;
      s += tx(4, y + 24, n, { a: "start", s: 11 });
      cells.forEach((c, j) => {
        const tomb = c.includes("deleted");
        s +=
          rc(76 + j * 90, y + 4, 86, 34, {
            sw: 2.2,
            rx: 7,
            s: tomb ? "var(--rose)" : "var(--line-2)",
            f: tomb ? "var(--rose)" : "var(--panel)",
            fo: tomb ? 0.14 : null,
            d: tomb ? "5 3" : null,
          }) + tx(76 + j * 90 + 43, y + 26, c, { s: 11.5 });
      });
    });
    s += tx(4, 160, "dashed red = a tombstone: a record that the key was deleted", {
      a: "start",
      s: 12,
      c: "var(--text-dim)",
    });
    return svg(440, 168, s);
  })();

  // bars: places checked per key
  const enBars = (() => {
    const K = [
      ["apple", 3],
      ["date", 2],
      ["fig", 4],
      ["kiwi", 1],
      ["mango", 3],
      ["plum", 2],
    ];
    let s =
      ln(10, 176, 430, 176, { s: "var(--line-2)" }) +
      tx(220, 14, "places checked by a read of each key", { c: "var(--text-dim)", s: 11 });
    K.forEach(([k, n], i) => {
      const x = 22 + i * 68,
        h = n * 34;
      s +=
        rc(x, 176 - h, 48, h, { f: "var(--blue)", fo: 0.55, s: "var(--blue)", sw: 2.5, rx: 6 }) +
        tx(x + 24, 176 - h - 6, n, { s: 13 }) +
        tx(x + 24, 194, k, { s: 12 });
      s += hit(k, x - 6, 20, 60, 180, 8);
    });
    return svg(440, 204, s);
  })();

  B.add("ds-engine", [
    {
      type: "pick",
      q: "A read for <b>fig</b> checks memory first, then the segments from newest to oldest, and stops at the first layer that mentions the key. Tap the layer where this search stops.",
      fig: enLayers,
      a: "s3",
      why: "Memory has no fig, but Segment 3 holds a tombstone for it. That is the newest word on the key, so the read stops there and answers deleted. The older fig in Segment 2 and Segment 1 is hidden until compaction removes it for good.",
    },
    {
      type: "mcq",
      q: "Each flush adds one segment on disk and one compaction merges all segments into one (chart). A read for a key that lives only in the oldest segment checks the memtable, then every segment, newest first. How many places does it check at minute 15? (Memory counts as one.)",
      fig: enSaw,
      o: ["3 places", "4 places", "5 places", "6 places"],
      a: 2,
      hint: "Read the height of the line at the dashed marker, then add one for memory.",
      why: "At minute 15 there are 4 segments (flushes at 10, 12 and 14 after the merge at 9), plus the memtable: 5 places. The saw-tooth is the cost of fast writes: reads slow down as segments pile up, and compaction pulls them back.",
    },
    {
      type: "pick",
      q: "The memtable is flushed to a segment as soon as it holds 4 different keys, and a flush covers every write so far. The log was switched off after write 2. The machine then loses power. Tap every write that is lost for ever.",
      fig: enLanes,
      a: ["w5", "w6"],
      why: "Writes 3 and 4 were never logged, but write 4 filled the memtable, so the flush saved both to disk. Only writes 5 and 6 sat in memory with no log, so they are gone. Durability comes from either the log or a flush, and the log only matters for what has not been flushed.",
    },
    {
      type: "bug",
      q: "Users keep seeing values that were overwritten days ago. Which line of the engine's settings explains it?",
      code: [
        "memtable_max_keys: 4",
        "log_before_ack: true",
        "read_segments: oldest_to_newest",
        "stop_at_first_match: true",
      ],
      a: 2,
      why: "Stopping at the first match is right only when you look at the newest data first. Reading oldest to newest, the first match is the oldest copy of the key, which is the stale one. The newest value must win.",
    },
    {
      type: "cat",
      q: "The three segments (shown) are merged into a single new segment, keeping the newest value for every key and dropping deleted keys. Sort each record: kept, dropped as overwritten, or dropped as deleted?",
      fig: enStrips,
      buckets: ["Kept", "Overwritten", "Deleted"],
      items: [
        ["apple: v5 (Segment 2)", 0],
        ["apple: v1 (Segment 1)", 1],
        ["kiwi: v7 (Segment 2)", 1],
        ["date: v6 (Segment 2)", 2],
        ["mango: v4 (Segment 1)", 0],
        ["date tombstone (Segment 3)", 2],
      ],
      why: "Kiwi has three copies, so only the newest (v9) survives. Date was deleted last, so both its value and the tombstone vanish. Apple v1 was overwritten by v5. The merged segment holds apple v5, kiwi v9, mango v4 and plum v8: four keys instead of eleven records.",
    },
    {
      type: "pick",
      q: 'The write path is drawn in a risky order: the engine says "ok" before it has saved anything safely. Power fails right after step 2. Tap the step that must happen BEFORE the ok to keep the write.',
      fig: enSeq,
      a: "m4",
      why: "Memory is wiped by a power cut, so inserting into the memtable (step 3) is not enough. The append to the log on disk is what survives, so it has to happen before the ok. Write-ahead means log first, acknowledge second.",
    },
    {
      type: "pick",
      q: "The memtable flushes the moment it holds 4 different keys, and writing a key it already holds does not add a new one. Tap the write that triggers the first flush.",
      fig: enTape,
      a: "w7",
      why: "Counting different keys: fig (1), kiwi (2), date (3), then plum is the fourth at write 7. The repeats at writes 3, 4 and 6 only overwrite entries already in memory, so they never fill it. Updating hot keys is cheap for the memtable.",
    },
    {
      type: "pick",
      q: "The bars show how many places a read of each key checks now: memory first, then the segments, newest to oldest. All segments on disk are then compacted into one. Tap every key whose read becomes cheaper.",
      fig: enBars,
      a: ["apple", "fig", "mango"],
      hint: "After compaction a disk read costs at most 2 places: memory, then the one segment.",
      why: "After compaction the most any key can cost is 2: memory, then the single merged segment. Apple (3), mango (3) and fig (4) all drop to 2. Kiwi is found in memory at 1 and date and plum at 2 already, so they stay as they are.",
    },
  ]);
})();

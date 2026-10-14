/* js/bank/ds-36.js: Data Science lecture 5 revision questions, part 2: ds5-hash and ds5-index. */
(function () {
  const B = NIC.bank;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const cards = (list, { w = 460, h = 110 } = {}) => {
    const cw = (w - 10 * (list.length + 1)) / list.length;
    const g = list
      .map(([id, lines], i) => {
        const x = 10 + i * (cw + 10);
        const t = lines
          .map(
            (l, j) =>
              `<text x="${x + cw / 2}" y="${34 + j * 22}" text-anchor="middle" style="font:800 ${j ? 12 : 14}px var(--sans);fill:var(--ink)">${esc(l)}</text>`,
          )
          .join("");
        return `<g data-pick="${id}"><rect x="${x}" y="10" width="${cw}" height="${h - 20}" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${t}</g>`;
      })
      .join("");
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px">${g}</svg>`;
  };
  const caption = (s) => `<p class="faint" style="font-weight:800;margin:0 0 6px">${s}</p>`;

  B.add("ds5-hash", [
    {
      type: "pick",
      q: 'Hashes run from 0 to 99, split in four equal ranges, one per node. The key "order-58" hashes to <b>58</b>. Tap the node that stores it.',
      fig:
        caption("Hash ranges") +
        cards(
          [
            ["n1", ["Node 1", "0 to 24"]],
            ["n2", ["Node 2", "25 to 49"]],
            ["n3", ["Node 3", "50 to 74"]],
            ["n4", ["Node 4", "75 to 99"]],
          ],
          { h: 90 },
        ),
      a: "n3",
      why: "58 lies between 50 and 74, so the third node owns it. The node depends on the hash, not on the key's own order.",
    },
    {
      type: "order",
      q: "Put the steps of placing a key in a hash-partitioned cluster in order.",
      items: [
        "Take the key",
        "Run the hash function to get a number",
        "Find the partition whose hash range contains that number",
        "Store the record on the node holding that partition",
      ],
      hint: "The hash comes before the range lookup.",
      why: "The partition owns a range of hashes, so the key must be hashed first. The range then names the partition.",
    },
    {
      type: "slider",
      q: "A fair hash spreads 1,000 keys over 8 partitions. About how many keys land in each partition?",
      min: 0,
      max: 500,
      step: 25,
      start: 250,
      ans: 125,
      tol: 25,
      unit: " keys",
      hint: "1,000 divided by 8.",
      why: "1,000 / 8 = 125. Good hash functions distribute keys fairly, so each partition gets close to its share.",
    },
    {
      type: "cat",
      q: "In a hash-partitioned database, is each operation still <b>efficient</b> or <b>expensive</b>?",
      buckets: ["Still efficient", "Expensive"],
      items: [
        ["Reading the one record with id 4,812", 0],
        ["Reading all records with ids from 4,000 to 5,000", 1],
        ["Writing a stream of timestamped events without a hot spot", 0],
        ["Scanning neighbouring keys in order", 1],
      ],
      hint: "Hashing helps exact lookups and write spread, but hurts neighbours.",
      why: "An exact key hashes straight to its node, and writes spread evenly. Ranges and ordered scans have to visit every partition, since neighbours are scattered.",
    },
    {
      type: "mcq",
      q: "Which approach does MongoDB use for a range query on a hash-partitioned key, as taught in the lecture?",
      o: [
        "It sends the query to all partitions",
        "It asks only the partitions at the two ends of the range",
        "It hashes the range into one number",
        "It refuses range queries on any key",
      ],
      a: 0,
      why: "Because adjacent keys are scattered, the database cannot guess which partitions hold the range, so it asks all of them and merges the answers.",
    },
    {
      type: "bug",
      q: "<code>range_query()</code> reads ids between lo and hi in a hash-partitioned cluster, but it misses records. Click the faulty line.",
      code: [
        "def range_query(lo, hi, nodes):",
        "    first = node_for(lo)",
        "    last = node_for(hi)",
        "    return ask_nodes(first, last)",
      ],
      a: 3,
      hint: "Where do the keys between lo and hi hash to?",
      why: "Hashing scatters the keys in between, so they are not on the nodes of lo and hi. The query must ask all nodes.",
    },
    {
      type: "multi",
      q: "Which statements about hash partitioning are true? Select all that apply.",
      o: [
        "Each partition owns a range of hashes",
        "Neighbouring keys usually land on different partitions",
        "It distributes keys fairly between partitions",
        "It keeps keys sorted across the cluster",
        "Range queries are cheaper than with key ranges",
      ],
      a: [0, 1, 2],
      why: "Hashing assigns hash ranges and spreads keys fairly, scattering neighbours as it goes. That destroys key order, so range queries get more expensive.",
    },
    {
      type: "mcq",
      q: 'Messages use the compound key (conversation, time), and only <b>conversation</b> is hashed. How is "conversation 88, messages from yesterday" answered?',
      o: [
        "By one partition, reading a sorted time range",
        "By every partition, scanning all messages",
        "By hashing the time of every message",
        "It cannot be answered without a secondary index",
      ],
      a: 0,
      why: "All of conversation 88 hashes to one partition, where messages are kept sorted by time. A time range there is a cheap scan.",
    },
    {
      type: "mcq",
      q: "A logging service keys events by timestamp and sees all writes hit the newest of its key-range partitions. What change addresses the hot spot?",
      o: [
        "Hash the key, so writes spread over partitions",
        "Give the newest partition a bigger disk",
        "Sort the keys in descending order",
        "Replicate the newest partition to every node",
      ],
      a: 0,
      why: "Hashing breaks the link between arrival order and partition. Growing a disk or copying the partition does not spread the writes.",
    },
    {
      type: "match",
      q: "Match each approach to the idea behind it.",
      pairs: [
        ["Key-range partitioning", "Each partition owns a span of sorted keys"],
        ["Hash partitioning", "Each partition owns a span of hash values"],
        ["MongoDB range query", "Ask all partitions"],
        ["Cassandra compound key", "Hash the first column only"],
      ],
      why: "The two schemes differ in what their ranges are made of. The last two are the lecture's answers to the lost range queries.",
    },
    {
      type: "mcq",
      q: "A table of hashes shows key 7 hashes to 71, key 8 to 12 and key 9 to 40, with four equal ranges over 0 to 99 (25 each). Where are keys 7, 8 and 9 stored, as node numbers?",
      o: ["Nodes 3, 1 and 2", "All on node 1", "Nodes 1, 2 and 3", "Nodes 2, 1 and 4"],
      a: 0,
      hint: "71 is in 50-74, 12 in 0-24 and 40 in 25-49.",
      why: "Node 3 owns 50-74 (71), node 1 owns 0-24 (12) and node 2 owns 25-49 (40). Three consecutive keys sit on three different nodes.",
    },
  ]);

  const docs = (rows) =>
    caption("Three document partitions, each with a local index on colour") +
    cards(
      rows.map(([id, a, b]) => [id, [a, b]]),
      { h: 100 },
    );
  const idxTerms = (rows) =>
    caption("A global index split by term (first letter)") +
    cards(
      rows.map(([id, a, b]) => [id, [a, b]]),
      { h: 90 },
    );

  B.add("ds5-index", [
    {
      type: "pick",
      q: "Documents are partitioned by id, and each partition has a <b>local</b> index on colour. A search for <b>red</b> arrives. Tap every partition that must be asked.",
      fig: docs([
        ["d1", "Partition 1", "its own cars"],
        ["d2", "Partition 2", "its own cars"],
        ["d3", "Partition 3", "its own cars"],
      ]),
      a: ["d1", "d2", "d3"],
      hint: "Cars are partitioned by id, not by colour. Where could a red car be?",
      why: "Each local index only describes its own documents. The search cannot know in advance who has red entries, so it goes to every partition and the answers are gathered (scatter-gather).",
    },
    {
      type: "cat",
      q: "Does each point fit an index <b>by document</b> (local) or <b>by term</b> (global)?",
      buckets: ["By document", "By term"],
      items: [
        ["A write only updates the partition that holds the document", 0],
        ["Reads can go to just the partition that owns the term", 1],
        ["Searches must be scattered over every partition", 0],
        ["One saved document can change several index partitions", 1],
      ],
      hint: "A local index is easy on writes. A global index is easy on reads.",
      why: "By document keeps all work local to the document's partition, so reads must be scattered. By term keeps reads local to one index partition, so writes spread out.",
    },
    {
      type: "slider",
      q: "A cluster has 12 document partitions with local indexes. A search for one tag is scattered. How many partitions does it ask?",
      min: 0,
      max: 20,
      step: 1,
      start: 6,
      ans: 12,
      tol: 1,
      unit: " partitions",
      why: "Any partition could hold matches, so all 12 are asked. Adding partitions makes each search wider.",
    },
    {
      type: "order",
      q: "Put the steps of a scatter-gather search over local indexes in order.",
      items: [
        "The search term arrives",
        "The query is sent to every partition",
        "Each partition searches its own local index",
        "The partial results are combined into one answer",
      ],
      hint: "Everyone must answer before the results can be combined.",
      why: "Scatter sends the query out, each local index answers for its own documents, and gather merges the pieces.",
    },
    {
      type: "mcq",
      q: "A global index is split by term. A new document has 3 different terms, each stored in a different index partition. How many index partitions does saving it update?",
      o: ["1", "3", "All of them, always"],
      a: 1,
      why: "Each term's entry lives in its own index partition, so the write reaches 3 of them. That is the extra cost of a term-partitioned index.",
    },
    {
      type: "multi",
      q: "Which statements about secondary indexes are true? Select all that apply.",
      o: [
        "A secondary index value can match many records",
        "It is used for searching or sorting by something other than the key",
        "It does not map neatly onto partitions",
        "A secondary index uniquely identifies each record",
        "It removes the need for any partitioning",
      ],
      a: [0, 1, 2],
      why: "Unlike a key, a secondary value can repeat, and the matching records are spread around, so the index needs its own partitioning design. It does not replace partitioning.",
    },
    {
      type: "mcq",
      q: "Posts are stored by post id. You want all posts written by user 55. Which statement is right?",
      o: [
        "user_id needs a secondary index, because many posts share it",
        "user_id is a unique key, so no index is needed to find posts",
        "Only the post id can ever be searched in this database",
        "A secondary index would find only one post per user at most",
      ],
      a: 0,
      why: "The key is the post id. The author is an ordinary attribute shared by many posts, so searching on it needs a secondary index.",
    },
    {
      type: "bug",
      q: "<code>search()</code> should find every document with a term using <b>local</b> indexes, but it misses some. Click the faulty line.",
      code: [
        "def search(term, partitions):",
        "    results = []",
        "    p = partitions[0]",
        "    results += p.local_index.get(term, [])",
        "    return results",
      ],
      a: 2,
      hint: "How many partitions does this search?",
      why: "It only reads the first partition. With a local index, a search has to loop over every partition and combine the results.",
    },
    {
      type: "mcq",
      q: "A dashboard is read thousands of times a minute by tag and updated only a few times a day. Which secondary index design suits it?",
      o: [
        "By term: each search reads one index partition",
        "By document: it makes every search cheap",
        "Neither: tags cannot be indexed",
        "By document, because writes are rare",
      ],
      a: 0,
      why: "The workload is read-heavy, so the cheaper reads of a term-partitioned index pay off. The occasional wider write costs little.",
    },
    {
      type: "pick",
      q: "A global index is split by the first letter of the term. Tap the index partition a search for <b>purple</b> is sent to.",
      fig: idxTerms([
        ["i1", "Index 1", "a to h"],
        ["i2", "Index 2", "i to p"],
        ["i3", "Index 3", "q to z"],
      ]),
      a: "i2",
      why: "Purple starts with p, which is in the range i to p, so one index partition holds all of its entries.",
    },
    {
      type: "match",
      q: "Match each indexing design to its main cost.",
      pairs: [
        ["Index by document", "Searches are scatter-gather"],
        ["Index by term", "Writes touch several partitions"],
        ["Primary key", "Identifies exactly one record"],
        ["Secondary index", "Can match many records"],
      ],
      why: "The first two costs are the trade-off of the two designs. The last two define what a key and a secondary index are.",
    },
  ]);
})();

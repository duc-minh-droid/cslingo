(function () {
  const partScope = (NIC.shared.dsL23 = NIC.shared.dsL23 || {});
  const { mergeRun, mono } = partScope;
  const N = NIC;
  const F = N.fig,
    L = N.LESSONS;
  const FG = F;

  L["ds-graph"] = {
    sum: "A <b>graph</b> stores entities as <b>vertices</b> and relationships as <b>edges</b>. It shines when relationships are what you ask about.",
    steps: [
      {
        t: "Why graphs?",
        b: `<p>Complex <b>many-to-many</b> relationships are especially awkward for document and relational models. A <b>graph</b> represents <b>entities as nodes</b> and <b>relationships as edges</b>.</p>`,
        v: FG.graph({
          nodes: {
            A: { x: 60, y: 110, label: "Ana", c: "blue" },
            B: { x: 210, y: 40, label: "Ben", c: "blue" },
            C: { x: 210, y: 180, label: "Cy", c: "blue" },
            D: { x: 360, y: 110, label: "Dee", c: "blue" },
          },
          edges: [
            ["A", "B"],
            ["A", "C"],
            ["B", "D"],
            ["C", "D"],
            ["B", "C"],
          ],
          w: 420,
          h: 220,
        }),
      },
      {
        t: "Where graphs appear",
        b: `<p><b>Social networks</b> (different kinds of vertex and edge), the <b>World Wide Web</b> (pages linked to pages), and <b>road networks</b> (junctions and roads).</p>`,
        v: FG.cells(
          [
            { v: "social network", sub: "people, pages, events", c: "blue" },
            { v: "the web", sub: "links between pages", c: "violet" },
            { v: "roads", sub: "junctions and roads", c: "amber" },
          ],
          { size: 150 },
        ),
      },
      {
        t: "Ready-made algorithms",
        b: `<p>Well-known algorithms already work on graphs: <b>Dijkstra</b> finds the shortest route on a road network, and <b>PageRank</b> scores how relevant a web page is in search results.</p>`,
        v: FG.compare(
          { title: "Dijkstra", c: "teal", body: "shortest route between two junctions" },
          { title: "PageRank", c: "violet", body: "which pages matter most, based on who links to them" },
        ),
        c: {
          q: "Which task is a classic graph algorithm?",
          o: ["Ranking web pages by relevance", "Sorting a list of names alphabetically", "Adding two numbers"],
          a: 0,
          why: "PageRank scores pages from the links between them, which is graph structure.",
        },
      },
      {
        t: "Property graphs",
        b: `<p>Each <b>vertex</b> holds a unique ID, its <b>incoming</b> and <b>outgoing</b> edges, and key-value <b>properties</b>. Each <b>edge</b> holds a unique ID, a <b>head</b> and <b>tail</b> vertex, a relationship <b>label</b> and properties.</p>`,
        v: FG.graph({
          nodes: {
            A: { x: 70, y: 100, label: "Ana", c: "blue", sub: "person" },
            B: { x: 350, y: 100, label: "Leeds", c: "amber", sub: "city" },
          },
          edges: [["A", "B", "LIVES_IN", "teal"]],
          directed: true,
          w: 420,
          h: 200,
          r: 28,
        }),
      },
      {
        t: "It looks like two tables",
        b: `<p>You can view a property graph as two relational tables: one for <b>vertices</b>, one for <b>edges</b>. The difference: <b>any vertex can connect to any other</b>, and given a vertex you can quickly find its incoming and outgoing edges, so <b>traversal is easy</b>. Different edge labels represent different relationships.</p>`,
        v: FG.compare(
          { title: "Vertices table", c: "blue", body: "id · properties" },
          { title: "Edges table", c: "amber", body: "id · head · tail · label · properties" },
        ),
        c: {
          q: "What makes graph traversal easy?",
          o: [
            "Each vertex can quickly list its incoming and outgoing edges",
            "Vertices are stored in alphabetical order",
            "Every vertex must link to the same kinds of vertex",
          ],
          a: 0,
          why: "Finding a vertex's edges is direct, so walking from vertex to vertex is cheap.",
        },
      },
    ],
    guide: [
      "In <b>Inspect a vertex</b> mode, tap each vertex and read its outgoing and incoming edges.",
      "Switch to <b>Find a path</b>, tap a start and an end vertex, and read the hop count.",
      "Answer the questions after the demo.",
    ],
  };

  L["ds-nosql"] = {
    sum: "<b>NoSQL</b> = non-relational stores aimed at simple design, scaling out and availability, in four families.",
    steps: [
      {
        t: "What NoSQL means",
        b: `<p>Non-relational storage and retrieval of data, focused on <b>simplicity of design</b>, <b>scalability</b> (especially <b>horizontal</b> scaling) and <b>availability</b>.</p>`,
        v: FG.cells(
          [
            { v: "simple design", c: "teal" },
            { v: "scale out", c: "blue" },
            { v: "stay available", c: "amber" },
          ],
          { size: 150 },
        ),
      },
      {
        t: "Four families",
        b: `<p><b>Document</b>, <b>key-value</b>, <b>wide-column</b> and <b>graph</b>.</p>`,
        v: FG.cells(
          [
            { v: "Document", sub: "MongoDB", c: "blue" },
            { v: "Key-value", sub: "DynamoDB", c: "amber" },
            { v: "Wide-column", sub: "Cassandra", c: "violet" },
            { v: "Graph", sub: "vertices and edges", c: "teal" },
          ],
          { size: 130 },
        ),
      },
      {
        t: "Document store",
        b: `<p>Different products group documents differently. MongoDB has <b>databases</b> and <b>collections</b> (like tables, but with no rigid schema) and a <b>query language</b> to search them.</p>`,
        v: FG.flow([
          { t: "Database" },
          { t: "Collection", s: "like a table", c: "violet" },
          { t: "Documents", s: "JSON-like", c: "teal" },
        ]),
        c: {
          q: "In MongoDB, what is a collection closest to?",
          o: [
            "A table with no rigid schema",
            "A single column shared by every document",
            "A labelled edge between two vertices in a graph",
          ],
          a: 0,
          why: "Collections group documents like tables group rows, without a fixed schema.",
        },
      },
      {
        t: "Key-value store",
        b: `<p>Data is stored as <b>associative arrays</b>: every object is a set of <b>key-value pairs</b>. DynamoDB uses a <b>complex primary key</b> (a <b>partition key</b> plus a <b>sort key</b>), and the schema is defined <b>per item</b>.</p>`,
        v: FG.compare(
          { title: "Partition key", c: "amber", body: "picks the partition. Related items share it" },
          { title: "Sort key", c: "blue", body: "orders the items within that partition" },
        ),
      },
      {
        t: "Wide-column store",
        b: `<p>Similar to relational: data sits in <b>tables, rows and columns</b>, but the <b>names and formats of the columns can vary from record to record</b>.</p>`,
        v: FG.compare(
          { title: "Relational table", c: "violet", body: "every row has the same columns" },
          { title: "Wide-column table", c: "teal", body: "each row may have its own columns" },
        ),
        c: {
          q: "What sets a wide-column store apart from a relational table?",
          o: [
            "Columns can vary per row",
            "It has no rows at all, only one long list of values",
            "It stores nothing except graphs and their edges",
          ],
          a: 0,
          why: "Rows are still in tables, but each row can carry different columns.",
        },
      },
    ],
    guide: [
      "Switch through the four shapes and read each explanation.",
      "Sort the 8 scenarios into the right family.",
      "Answer the questions after the demo.",
    ],
  };

  L["ds-log"] = {
    sum: "A <b>log</b> is an append-only file: writes are cheap, reads scan everything. That makes an <b>index</b> the natural next step.",
    steps: [
      {
        t: "The two jobs of a database",
        b: `<p>When you give it data it must <b>store</b> it, and when you ask for that data it must <b>give it back</b>. The storage engine depends on the workload: <b>transactional</b> (write-intensive) or <b>analytics</b> (read-intensive).</p>`,
        v: FG.compare(
          { title: "Transactional", c: "amber", body: "many small writes: orders, payments" },
          { title: "Analytics", c: "violet", body: "big reads over lots of data: reports" },
        ),
      },
      {
        t: "A very simple database",
        b: `<p>A key-value store in two functions: <b>set</b> appends <code>key,value</code> to a file; <b>get</b> finds the <b>last</b> line for that key.</p>`,
        v: mono(
          `set bike  #1\nset dock  #2\nset bike  #3     <span class="faint">(bike overwritten, old line stays)</span>\nget bike  →  #3`,
        ),
      },
      {
        t: "Performance of the simple database",
        b: `<p><b>Write</b>: append to the end of a file, so <b>very fast</b>. <b>Read</b>: scan the whole file for the key, so <b>O(n)</b>: double the data, double the time.</p>`,
        v: FG.bars(
          [
            ["write: append one line", 1, "teal", " step"],
            ["read: scan n lines (n = 1000)", 1000, "rose", " steps"],
          ],
          { max: 1000 },
        ),
        c: {
          q: "A read scans a log of n lines. If n doubles, the scan time…",
          o: ["roughly doubles", "stays the same", "roughly squares"],
          a: 0,
          why: "O(n): proportional to the number of records.",
        },
      },
      {
        t: "What a log is",
        b: `<p>Many databases use a <b>log</b> to record data: not a log in the traditional sense, but a file of records in <b>sequence</b>. New records are only added at the end, so old lines are never modified.</p>`,
        v: FG.flow([{ t: "record 1" }, { t: "record 2" }, { t: "record 3", s: "newest", c: "teal" }]),
      },
      {
        t: "Things a real log must handle",
        b: `<p><b>File format</b>: binary files are usually more efficient than text. <b>Deleting</b>: appending a special <b>tombstone</b> record is cheaper than scanning to erase. <b>Crash recovery</b>: an in-memory hash map is lost on restart. <b>Partially written records</b> and <b>concurrency control</b> also need care.</p>`,
        v: FG.cells(
          [
            { v: "binary format", c: "blue" },
            { v: "tombstones", c: "rose" },
            { v: "crash recovery", c: "amber" },
            { v: "partial writes", c: "violet" },
            { v: "concurrency", c: "teal" },
          ],
          { size: 130 },
        ),
        c: {
          q: "What is a tombstone?",
          o: ["A delete marker appended to the log", "An index of every key", "A backup copy of the whole file"],
          a: 0,
          why: "Appending a delete record avoids scanning and rewriting the log.",
        },
      },
    ],
    guide: [
      "Press <b>Set</b> several times for different keys, then <b>Get</b> and watch the lines scanned.",
      "Press <b>Add 50 more records</b> and <b>Get</b> again.",
      "Try <b>Delete</b>, then <b>Get</b> the same key. Answer the questions after the demo.",
    ],
  };

  L["ds-hashidx"] = {
    sum: "A <b>hash index</b> maps each key to its byte offset so a read is one jump. <b>Segments</b> and <b>compaction</b> stop the log growing forever.",
    steps: [
      {
        t: "The hash index",
        b: `<p>Like a dictionary, but for disk: keep a <b>hash map</b> in memory mapping each key to its <b>byte offset</b> in the log file. On every append, update the map. Reads jump straight to the offset. This is simple and efficient, <b>as long as all the keys fit in memory</b>.</p>`,
        v: FG.flow([
          { t: 'Get "mew"', s: "ask", c: "violet" },
          { t: "hash map", s: "mew → byte 64", c: "blue" },
          { t: "log file", s: "read at byte 64", c: "teal" },
        ]),
        c: {
          q: "Where does the hash map live in this design?",
          o: ["In memory", "Only on disk in the log", "In a separate remote server"],
          a: 0,
          why: "Keeping it in memory is what makes lookups a single jump.",
        },
      },
      {
        t: "Segment files",
        b: `<p>If we only ever append, we run out of disk. So the log is broken into <b>segments</b>: close a file when it reaches a size and write to a new one.</p>`,
        v: FG.flow([
          { t: "segment 1", s: "closed" },
          { t: "segment 2", s: "closed" },
          { t: "segment 3", s: "active", c: "teal" },
        ]),
      },
      {
        t: "Compaction",
        b: `<p>To save space, throw away <b>duplicate keys</b> and keep only the <b>latest</b> value. Example: a database counting plays of each cat video has many writes but few keys, so compaction shrinks it hugely.</p>`,
        v: FG.compare(
          { title: "Before", c: "amber", body: "mew: 1078, purr: 2103, mew: 1079, mew: 1080… (many copies)" },
          { title: "After", c: "teal", body: "mew: 1082, purr: 2108, yawn: 511 (one each)" },
        ),
        c: {
          q: "What does compaction keep for each key?",
          o: ["Only the latest value", "Every value ever written", "Only the first value"],
          a: 0,
          why: "Older values were overwritten and can be discarded.",
        },
      },
      {
        t: "Advantages",
        b: `<p>① <b>Sequential writes</b> are much faster than random disk access. ② <b>Crash recovery is easier</b>: you never overwrite old content when updating a value.</p>`,
        v: FG.cells(
          [
            { v: "fast appends", sub: "sequential", c: "teal" },
            { v: "safe recovery", sub: "nothing overwritten", c: "blue" },
          ],
          { size: 170 },
        ),
      },
      {
        t: "Disadvantages",
        b: `<p>① The <b>hash table must fit in memory</b>. ② <b>Range queries</b> (for example keys <code>kitty1000</code> to <code>kitty2000</code>) are inefficient: the map has no order, so you would look up each key separately.</p>`,
        v: FG.compare(
          { title: "Fits in RAM", c: "teal", body: "every lookup is one jump" },
          { title: "Too many keys", c: "rose", body: "the map does not fit, and the design breaks" },
        ),
        c: {
          q: "Which limitation belongs to a hash-indexed log?",
          o: [
            "Range queries are inefficient",
            "Writes need random disk access",
            "It cannot be recovered after a crash",
          ],
          a: 0,
          why: "A hash map has no key order, so ranges have no shortcut.",
        },
      },
    ],
    guide: [
      "Press <b>Play a video</b> until a second segment opens, then <b>Get</b> a key.",
      "Press <b>Compact old segments</b> and compare the records on disk.",
      "Press <b>Crash and restart</b>, try <b>Get</b>, then <b>Rebuild index</b>.",
    ],
  };

  L["ds-sstable"] = {
    sum: "An <b>SSTable</b> is a segment sorted by key. Sorting makes merges cheap, the index sparse and ranges possible. A <b>memtable</b> keeps writes sorted in memory.",
    steps: [
      {
        t: "Sorted String Tables",
        b: `<p>Two changes to the log: <b>each key appears once per segment</b>, and the segment is <b>sorted by key</b>. Merging several segments is then like the merge step of merge sort: read them side by side and keep the newest value of each key.</p>`,
        v: FG.compare(
          { title: "Plain log segment", c: "amber", body: "mew, purr, mew, yawn… any order, duplicates" },
          { title: "SSTable segment", c: "teal", body: "mew, purr, yawn… <b>sorted</b>, each key once" },
        ),
      },
      {
        t: "Watch a merge",
        b: `<p>Three sorted segments merge into one. Segment 3 is newest, so its values win. Step through it, or press play.</p>`,
        v: (box, life) => mergeRun(box, life),
      },
      {
        t: "A sparse index is enough",
        b: `<p>You still need an in-memory index, but not for every key. Because the segment is sorted, keep the offset of <b>some</b> keys: to find a key, jump to the nearest indexed key before it and <b>scan a short block</b>. (Blocks can be compressed too.)</p>`,
        v: FG.flow([
          { t: "sparse index", s: "hand → 91k, handsome → 104k", c: "blue" },
          { t: "jump near", s: "handbag lies between", c: "violet" },
          { t: "scan a block", s: "find it", c: "teal" },
        ]),
        c: {
          q: "Why can the index hold only some of the keys?",
          o: [
            "The segment is sorted, so you scan a short block",
            "Missing keys are recomputed from a hash",
            "Only the newest keys are ever read",
          ],
          a: 0,
          why: "Sorted order tells you the key lies between two indexed keys.",
        },
      },
      {
        t: "Keeping it sorted while writing",
        b: `<p>Data arrives in random order, so how do we keep it sorted? Use a <b>tree structure</b> in memory (an <b>AVL tree</b>, a balanced tree). This is the <b>memtable</b>.</p>`,
        v: FG.graph({
          nodes: {
            M: { x: 210, y: 40, label: "kiwi", c: "violet" },
            L: { x: 110, y: 120, label: "fig", c: "violet" },
            R: { x: 310, y: 120, label: "plum", c: "violet" },
            A: { x: 60, y: 200, label: "apple", c: "violet" },
            G: { x: 160, y: 200, label: "grape", c: "violet" },
          },
          edges: [
            ["M", "L"],
            ["M", "R"],
            ["L", "A"],
            ["L", "G"],
          ],
          w: 420,
          h: 240,
          r: 24,
        }),
      },
      {
        t: "The write path",
        b: `<p>① <b>Write</b> into the memtable. ② When it grows big, <b>write it out as an SSTable file</b>: the newest segment. ③ While that happens, writes continue into a <b>new memtable</b>.</p>`,
        v: FG.flow([
          { t: "write", s: "into memtable", c: "violet" },
          { t: "memtable full", s: "flush sorted", c: "amber" },
          { t: "new SSTable", s: "newest segment", c: "teal" },
        ]),
        c: {
          q: "What is written to disk when the memtable is flushed?",
          o: ["A sorted segment (SSTable) file", "An unsorted append of raw writes", "A hash index of every key"],
          a: 0,
          why: "The tree is walked in order, so the file comes out sorted.",
        },
      },
      {
        t: "The read path and merging",
        b: `<p><b>Read</b>: look in the memtable, then the <b>most recent</b> segment, then the next older one, and so on. From time to time a background process <b>merges and compacts</b> segments, discarding overwritten and deleted values.</p>`,
        v: FG.flow([
          { t: "memtable", c: "violet" },
          { t: "newest segment", c: "blue" },
          { t: "older segments", c: "dim" },
        ]),
      },
    ],
    guide: [
      "Write random keys until the memtable flushes, then <b>Get</b> a key that lives in an older segment.",
      "Delete a key, then press <b>Merge all segments</b> and read the result.",
      "Step through <b>Watch a merge</b> and answer its question before the next step.",
    ],
  };
})();

(function () {
  const partScope = (NIC.shared.dsL23 = NIC.shared.dsL23 || {});
  const { mono, pick, reg3 } = partScope;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  reg3({
    id: "ds-sstable",
    order: 3,
    num: "3.3",
    title: "SSTables and memtables",
    blurb: "Keep segments sorted by key: merging is easy, the index can be sparse, and range queries work.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const POOL = ["apple", "date", "fig", "grape", "kiwi", "lime", "olive", "plum"];
      let limit = 4,
        mem = {},
        segs = [],
        counter = 0,
        steps = "Press <b>Write</b> a few times, then <b>Get</b> a key.",
        checks = "-";
      const card =
        el(`<div class="card"><div class="card-head"><h2>Memtable and SSTables</h2><span class="tag">writes go to memory first</span></div>
        <div class="controls" id="t1"></div>
        <div class="controls"><button class="btn primary" id="tw">Write a random key</button><button class="btn" id="td">Delete a random key</button><button class="btn" id="tm">Merge all segments</button><button class="btn ghost" id="tr">Reset</button></div>
        <div id="tv"></div>
        <div class="controls" id="tg"><span class="faint" style="font-size:13px">Get key:</span></div>
        <div class="stat-row"><div class="stat"><small>Memtable entries</small><b id="tn"></b></div><div class="stat blue"><small>SSTable segments</small><b id="ts"></b></div><div class="stat amber"><small>Places checked by last Get</small><b id="tc"></b></div></div>
        <p id="tt" class="dim" style="min-height:64px"></p></div>`);
      root.appendChild(card);
      const sl = N.slider("Memtable size before flushing", 3, 6, 1, limit);
      sl.onInput((v) => (limit = v));
      qs("#t1", card).appendChild(sl);
      const flush = () => {
        const ents = Object.entries(mem).sort((a, b) => (a[0] < b[0] ? -1 : 1));
        segs.unshift(ents);
        mem = {};
      };
      const put = (k, v) => {
        mem[k] = v;
        if (Object.keys(mem).length >= limit) {
          flush();
          return true;
        }
        return false;
      };
      const draw = () => {
        const mk = Object.keys(mem).sort();
        qs("#tv", card).innerHTML =
          `<div style="margin:8px 0"><span class="faint" style="font-size:12px;font-weight:800">Memtable (in memory, kept sorted by a balanced tree)</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:3px">${mk.map((k) => `<span class="mono" style="border:2px solid var(--violet);border-radius:8px;padding:2px 8px;font-size:12.5px;background:var(--panel-2)">${k}: ${mem[k] === null ? "✗" : mem[k]}</span>`).join("") || '<span class="faint">(empty)</span>'}</div></div>` +
          segs
            .map(
              (sg, i) =>
                `<div style="margin:6px 0"><span class="faint" style="font-size:12px;font-weight:800">SSTable ${segs.length - i}${i === 0 ? " (newest)" : ""} · sparse index: ${sg
                  .filter((_, j) => j % 2 === 0)
                  .map((e) => e[0])
                  .join(
                    ", ",
                  )}</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:3px">${sg.map(([k, v]) => `<span class="mono" style="border:2px solid var(--line-2);border-radius:8px;padding:2px 8px;font-size:12.5px;background:var(--panel-2)">${k}: ${v === null ? "✗" : v}</span>`).join("")}</div></div>`,
            )
            .join("");
        qs("#tn", card).textContent = mk.length;
        qs("#ts", card).textContent = segs.length;
        qs("#tc", card).textContent = checks;
        qs("#tt", card).innerHTML = steps;
      };
      POOL.forEach((k) => {
        const b = el(`<button class="btn small">${k}</button>`);
        qs("#tg", card).appendChild(b);
        b.onclick = () => {
          const log = [];
          let n = 0,
            ans;
          n++;
          if (k in mem) {
            ans = mem[k];
            log.push("memtable: <b>hit</b>");
          } else log.push("memtable: miss");
          if (ans === undefined)
            for (let i = 0; i < segs.length; i++) {
              n++;
              const e = segs[i].find((x) => x[0] === k);
              if (e) {
                ans = e[1];
                log.push(`SSTable ${segs.length - i}: <b>hit</b>`);
                break;
              } else log.push(`SSTable ${segs.length - i}: miss`);
            }
          checks = n;
          steps = `Looking for <b>${k}</b>: ${log.join(" → ")}. ${ans === undefined ? "Not found anywhere." : ans === null ? "The newest entry is a tombstone: deleted." : `Value <b>${ans}</b> (the newest copy wins).`} Each SSTable needs only a <b>sparse index</b> plus a short scan of one block.`;
          draw();
        };
      });
      qs("#tw", card).onclick = () => {
        const k = pick(POOL);
        const fl = put(k, ++counter);
        steps = fl
          ? `Wrote <b>${k}</b>. The memtable was full, so it was <b>flushed</b> to disk as a new sorted SSTable (the newest segment). New writes go to a fresh memtable.`
          : `Wrote <b>${k}</b> into the memtable (in memory, sorted). Nothing is on disk yet for this write, and the tree keeps the keys ordered.`;
        draw();
      };
      qs("#td", card).onclick = () => {
        const ks = [...Object.keys(mem), ...segs.flat().map((e) => e[0])];
        if (!ks.length) {
          steps = "Nothing to delete yet.";
          draw();
          return;
        }
        const k = pick(ks);
        const fl = put(k, null);
        steps = `Deleted <b>${k}</b> by writing a <b>tombstone</b> ✗ to the memtable.${fl ? " The memtable flushed." : ""}`;
        draw();
      };
      qs("#tm", card).onclick = () => {
        if (segs.length < 2) {
          steps = "Need at least two SSTables to merge.";
          draw();
          return;
        }
        const before = segs.reduce((a, s) => a + s.length, 0),
          m = {};
        for (let i = segs.length - 1; i >= 0; i--) segs[i].forEach(([k, v]) => (m[k] = v));
        segs = [
          Object.entries(m)
            .filter((e) => e[1] !== null)
            .sort((a, b) => (a[0] < b[0] ? -1 : 1)),
        ];
        steps = `Merged: ${before} entries in ${before ? "several segments" : "0"} became <b>${segs[0].length}</b> in one sorted segment. Older duplicates and tombstoned keys were dropped.`;
        draw();
      };
      qs("#tr", card).onclick = () => {
        mem = {};
        segs = [];
        counter = 0;
        checks = "-";
        steps = "Press <b>Write</b> a few times, then <b>Get</b> a key.";
        draw();
      };
      draw();

      root.appendChild(
        predict({
          id: "ds-sstable-1",
          q: "You read a key that was never written. In what order does the store look for it?",
          opts: [
            "Memtable, then the newest segment, then older ones",
            "Oldest segment first, then newer ones, then the memtable",
            "Only the memtable, since segments are read at merge time",
          ],
          a: 0,
          why: "Newest data wins, so the search goes from the memtable to the most recent segment and then back through older segments. A missing key has to be checked everywhere.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-sstable-2",
          q: "Why can an SSTable's in-memory index hold only some of the keys, unlike a hash index?",
          opts: [
            "Sorted order lets you scan a short block",
            "SSTables are always so small that every key fits anyway",
            "The database guesses the offsets of the missing keys from a hash",
          ],
          a: 0,
          why: "Sorted order means a key lives between two indexed keys, so you jump to the nearer indexed one and scan a short block. The index can be sparse.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-sstable-3",
          q: "While a full memtable is being written out as an SSTable, what happens to new writes?",
          opts: [
            "They continue into a new memtable",
            "They are refused until the flush ends",
            "They go straight into the old segment files",
          ],
          a: 0,
          why: "The store starts a fresh memtable so writes are not blocked. The finished SSTable becomes the newest segment.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>SSTable</b> (Sorted String Table): each key appears <b>once per segment</b> and the segment is <b>sorted by key</b>. Merging segments is fast (like merge sort), and the newest value wins.",
            "The in-memory index can be <b>sparse</b>: only offsets of some keys, because sorted order tells you where to scan.",
            "<b>Write path</b>: add to an in-memory balanced tree (the <b>memtable</b>, for example an AVL tree). When it grows, write it out as a new SSTable, the newest segment, while writes continue into a new memtable.",
            "<b>Read path</b>: memtable, then the newest segment, then older ones. In the background, <b>merge and compact</b> segments to drop overwritten and deleted values.",
          ],
          "Sorted segments make merging cheap and indexes small, so writes stay fast without losing reads.",
        ),
      );
    },
  });

  /* =================== LESSONS =================== */
  const FG = F;
  const jsonCard = mono(
    `{ "user_id": 251,\n  "first_name": "Ada",\n  "positions": [\n    { "job": "Chef", "org": "Casserole Co" },\n    { "job": "Owner", "org": "Ada's Bakes" } ],\n  "education": [ { "school": "Leeds Uni" } ] }`,
  );

  L["ds-models"] = {
    sum: "A <b>data model</b> maps your app's objects to storage. Documents keep a tree of data together; relational tables share common data by joining.",
    steps: [
      {
        t: "What a data model is",
        b: `<p>Applications work with <b>objects</b> (people, transactions, conversations). To store them we need a <b>data model</b>: the mapping from an object to tables, JSON or a spreadsheet.</p>`,
        v: FG.flow([
          { t: "App object", s: "a Python chef" },
          { t: "Data model", s: "the mapping", c: "violet" },
          { t: "Stored as", s: "tables or JSON", c: "teal" },
        ]),
      },
      {
        t: "The relational model and its awkward fit",
        b: `<p>Relational databases store <b>tables</b> of rows. An <b>ORM</b> (object-relational mapper) translates classes into tables. It works, but the translation is often not intuitive from the business point of view.</p><span class="analogy">Like disassembling a lorry into labelled boxes every time you park it, then rebuilding it when you need it.</span>`,
        v: FG.compare(
          {
            title: "In your code",
            c: "blue",
            body: "one <b>Chef</b> object with a list of jobs and a list of schools",
          },
          {
            title: "In the database",
            c: "amber",
            body: "<b>users</b>, <b>positions</b>, <b>education</b>, <b>contact_info</b> tables joined by a foreign key",
          },
        ),
      },
      {
        t: "One-to-many: three ways to store it",
        b: `<p>A profile has <b>many</b> positions, education entries and contacts. Options:</p><p>① <b>Normalised tables</b>, each row holding a foreign key to the user.<br>② A column with a <b>structured type</b> (JSON or XML) inside the user row (newer SQL can index and query it).<br>③ Store it as <b>JSON or XML text</b> in a text field.</p>`,
        v: FG.cells(
          [
            { v: "① separate tables", sub: "foreign key", c: "blue" },
            { v: "② JSON column", sub: "queryable", c: "teal" },
            { v: "③ JSON as text", sub: "opaque to the DB", c: "amber" },
          ],
          { size: 160 },
        ),
        c: {
          q: "Which option lets the database query and index inside the nested data, while keeping it in the user row?",
          o: ["A JSON text blob the DB cannot see into", "A structured JSON or XML column type", "Nothing can do that"],
          a: 1,
          why: "Newer SQL versions support structured column types that can be indexed and queried. A plain text blob is opaque.",
        },
      },
      {
        t: "The document model",
        b: `<p>A <b>document</b> encodes an object in a semi-structured standard (JSON, XML). All of an object's information sits in <b>one place</b>, so the mapping from your object is natural, and documents in one store can differ. Examples: MongoDB, CouchDB, Firestore.</p>`,
        v: jsonCard,
      },
      {
        t: "Where documents struggle: many-to-one and many-to-many",
        b: `<p>A company appears in <b>many</b> profiles (many-to-one), and people connect to <b>many</b> people (many-to-many). Documents handle this badly: shared data is copied around, and many document databases offer some <b>join</b> support that is <b>more complicated and less efficient than SQL</b>.</p>`,
        v: FG.compare(
          {
            title: "Rename the company (relational)",
            c: "teal",
            body: "change <b>1 row</b>, every profile follows the reference",
          },
          { title: "Rename the company (document)", c: "rose", body: "rewrite the name in <b>every copy</b>" },
        ),
        c: {
          q: "Which relationship is hardest for a pure document model?",
          o: [
            "Many-to-many, such as who connects to whom",
            "One-to-many owned by a single parent",
            "A single object with no relationships",
          ],
          a: 0,
          why: "Owned trees fit documents. Shared, cross-linked data needs joins.",
        },
      },
      {
        t: "Which model, when?",
        b: `<p><b>Document advantages</b>: schema flexibility, locality, a closer match to app data structures.<br><b>Relational advantages</b>: better joins and better many-to-one / many-to-many support.</p>`,
        v: FG.compare(
          { title: "Reach for documents", c: "blue", body: "self-contained records read as a whole" },
          { title: "Reach for relational", c: "violet", body: "data shared and joined across records" },
        ),
      },
    ],
    guide: [
      "Press <b>Load the profile page</b> in relational mode and count the lookups, then switch to <b>Document</b> and repeat.",
      "In the company demo, drag <b>Profiles</b> to 1000 and compare the two bars.",
      "Answer the questions after the demo.",
    ],
  };

  L["ds-schema"] = {
    sum: "Document stores read data with an <b>implicit</b> schema (schema-on-read), so changes are easy. Their <b>locality</b> is fast for whole objects and wasteful for slivers.",
    steps: [
      {
        t: "Most document stores enforce no schema",
        b: `<p>Arbitrary keys and values can be added, so you have <b>no guarantee</b> which fields a document holds.</p>`,
        v: mono(`{ "name": "Ada Byte" }\n{ "first_name": "Cy", "last_name": "Dee", "vegan": true }`),
      },
      {
        t: "Schema-on-read",
        b: `<p>The structure is <b>implicit</b> and interpreted when the <b>application reads</b> the data. It resembles <b>dynamic typing</b> in programming: check the shape when you use it. Compare <b>schema-on-write</b> (relational): the schema is explicit and enforced when data is written, like static typing.</p>`,
        v: FG.compare(
          { title: "Schema-on-read", c: "teal", body: "documents may differ. The app copes when reading" },
          { title: "Schema-on-write", c: "violet", body: "every row must fit the table's schema when written" },
        ),
        c: {
          q: "In which style does the application decide how to interpret a record's fields when it reads it?",
          o: ["Schema-on-write", "Schema-on-read"],
          a: 1,
          why: "Schema-on-read: structure is implicit and interpreted at read time.",
        },
      },
      {
        t: "Changing a field's format",
        b: `<p>Store a full name, then later want first and last names. <b>Document</b>: change the application to split old names as it reads them. <b>Relational</b>: alter the table, then update every row. On a big table the update is slow and may need <b>downtime</b>. (You can also set the new columns to NULL and fill them in on read.)</p>`,
        v: FG.compare(
          { title: "Document store", c: "teal", body: "new code + split-on-read. <b>No downtime</b>" },
          { title: "Relational database", c: "amber", body: "alter table, then rewrite <b>every row</b>" },
        ),
        c: {
          q: "Why can a relational schema change be painful on a very large table?",
          o: [
            "Every row must be rewritten",
            "Relational databases cannot add columns to existing tables",
            "The alter command always deletes the old data first",
          ],
          a: 0,
          why: "Updating every row on a huge table takes a long time and may block other work.",
        },
      },
      {
        t: "When schema-on-read helps",
        b: `<p>Use it when your data is <b>heterogeneous</b> (different kinds of object in one collection) or when you <b>do not control the structure</b> (for example, tweets).</p>`,
        v: FG.cells(
          [
            { v: "mixed objects", sub: "one collection", c: "teal" },
            { v: "not your data", sub: "structure changes without asking", c: "amber" },
          ],
          { size: 170 },
        ),
      },
      {
        t: "Locality: pro and con",
        b: `<p>A document is usually stored as <b>one continuous string</b> (JSON, XML or BSON). <b>Pro</b>: if the app often needs large parts of the data, one read is better than gathering it from several tables. <b>Con</b>: the DB loads the <b>entire</b> document, which is wasteful when documents are large and you need a little.</p>`,
        v: FG.compare(
          { title: "Wants the whole profile", c: "teal", body: "one read from one place" },
          { title: "Wants just the name", c: "rose", body: "still loads the <b>whole</b> document" },
        ),
        c: {
          q: "When does document locality hurt most?",
          o: [
            "Big documents, small need",
            "The app always needs the whole document every time",
            "There is only a single document in the whole collection",
          ],
          a: 0,
          why: "The DB loads the whole document, so a small need on a large document wastes work.",
        },
      },
      {
        t: "The two worlds are converging",
        b: `<p>Locality is not only for documents: <b>Google Spanner</b> offers it within a relational model, and <b>column families</b> (Cassandra) manage locality similarly. Relational databases now support <b>JSON/XML</b> (PostgreSQL after 9.3, MySQL after 5.7) with indexing and querying inside them, and some document stores (RethinkDB) support relational-like <b>joins</b>.</p>`,
        v: FG.flow([
          { t: "Relational", s: "+ JSON columns", c: "violet" },
          { t: "getting closer", c: "dim" },
          { t: "Document", s: "+ joins", c: "blue" },
        ]),
      },
    ],
    guide: [
      "In the first demo, press <b>Make the change</b> in <b>Document store</b> mode, then in <b>Relational</b> mode. Use the slider to add more records.",
      "In the locality demo, try <b>whole profile</b> versus <b>just the name</b>, and raise the document size.",
      "Answer the questions after the demo.",
    ],
  };
})();

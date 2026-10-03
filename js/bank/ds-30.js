(function () {
  const B = NIC.bank,
    Qf = NIC.qfig;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  /* Row of tappable cards: [id, [line, line...]] */
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

  B.add("ds-models", [
    {
      type: "multi",
      q: "Which of these are many-to-one relationships (many records point at one shared thing)? Select all that apply.",
      o: [
        "Many comments, each written by one author",
        "Many flights, each departing from one airport",
        "Each person and their one fingerprint record",
        "Authors and books, where each can have several of the other",
      ],
      a: [0, 1],
      hint: "Ask: do many of these share a single one of those?",
      why: "Many comments share one author, and many flights share one airport, so both are many-to-one. A person and their fingerprint is one-to-one, and authors and books can each have many of the other, which is many-to-many.",
    },
    {
      type: "order",
      q: "A company is stored once in a <b>companies</b> table, and each profile row points to it by a foreign key. Put the steps of renaming the company in order.",
      items: [
        "Find the one companies row by its ID",
        "Change the name stored in that single row",
        "Profile pages follow their foreign key to that row",
        "Every profile now shows the new name",
      ],
      hint: "Think: what do you change, and what simply follows?",
      why: "The name lives in one place, so a single edit is enough. Every profile only holds a reference, so each one follows it automatically. That is the strength of the relational model for many-to-one data.",
    },
    {
      type: "multi",
      q: "A venue's name and address are copied into each of its 200 event documents. Which problems can that cause? Select all that apply.",
      o: [
        "Renaming the venue means editing every copy",
        "Some copies may be updated and others missed, leaving them out of step",
        "The same facts take up storage again in every document",
        "The database refuses to save any document that holds a copy",
      ],
      a: [0, 1, 2],
      hint: "Copies are cheap to read but costly to keep in step.",
      why: "Copying shared data makes rewrites larger and risks stale copies. Nothing stops a document store saving the copy, which is exactly why the risk exists.",
    },
    {
      type: "pick",
      q: "This profile is stored as one document. <b>Tap the field that holds a one-to-many list.</b>",
      fig: cards(
        [
          ["id", ["id", "7"]],
          ["name", ["name", "Ada"]],
          ["pos", ["positions", "3 job entries"]],
          ["photo", ["photo", "ada.png"]],
        ],
        { w: 560, h: 100 },
      ),
      a: "pos",
      why: "One profile has many positions, so that field is the one-to-many list nested inside the document. The id, name and photo each hold a single value.",
    },
    {
      type: "bug",
      q: "The company is stored once in a table and profiles refer to it by <code>company_id</code>. This code renames it, but one line copies data that should not be copied. Click that line.",
      code: [
        "company = db.companies.get(7)",
        'company.name = "Northwind"',
        "db.save(company)",
        "for p in db.positions.where(company_id=7):",
        '    p.company_name = "Northwind"  # copy the name',
      ],
      a: 4,
      hint: "If profiles follow the reference, what do they need updating?",
      why: "In a normalised design the name lives only in the companies row, so the first three lines already finish the job. Copying it into each position recreates the duplication the foreign key was meant to avoid.",
    },
    {
      type: "slider",
      q: "A quiz has 10 questions and each question has 4 answers. Stored in three tables (quizzes, questions, answers), about how many rows does one quiz take? A document would hold it as 1 item.",
      min: 0,
      max: 100,
      step: 5,
      start: 20,
      ans: 50,
      tol: 5,
      hint: "10 questions × 4 answers = 40 answer rows, plus the questions and the quiz itself.",
      why: "1 quiz row + 10 question rows + 40 answer rows = 51 rows, where one document holds the whole tree in one place.",
    },
  ]);

  B.add("ds-schema", [
    {
      type: "mcq",
      q: "A payments table must never hold a row without an account number, however sloppy the app is. Which approach gives that guarantee?",
      o: [
        "Schema-on-write, checked as each row is saved",
        "Schema-on-read, where each reader copes with what it finds",
        "Locality, where the data is stored as one continuous string",
      ],
      a: 0,
      why: "Schema-on-write is enforced at the moment of writing, so a row without the field is rejected. With schema-on-read the missing field is only noticed later, by whichever code reads the record.",
    },
    {
      type: "pick",
      q: "<b>Tap the read where document locality wastes the most work.</b> Each card shows how much of the stored document the app needs.",
      fig: cards(
        [
          ["a", ["Needs 90 KB", "of a 100 KB doc"]],
          ["b", ["Needs 1 KB", "of a 100 KB doc"]],
          ["c", ["Needs 5 KB", "of an 8 KB doc"]],
        ],
        { h: 100 },
      ),
      a: "b",
      why: "The whole document is loaded each time. Card B loads 100 KB to use 1 KB, so 99% is wasted. In A and C most of what is loaded gets used, which is when locality pays off.",
    },
    {
      type: "order",
      q: "Old documents hold <code>name</code> and new ones hold <code>first</code> and <code>last</code>. Put the steps of reading code that copes with both in order.",
      items: [
        "Load the document from the store",
        "Check which fields it actually contains",
        "If it has only name, split that into first and last",
        "Show the first and last name on the page",
      ],
      hint: "You cannot decide what to do until you know the document's shape.",
      why: "With schema-on-read the application interprets the shape as it reads. It must look before it uses the fields, then convert the old shape on the fly, so no one has to rewrite the stored documents.",
    },
    {
      type: "bug",
      q: 'Old documents look like <code>{"name": "Ada Byte"}</code> and new ones like <code>{"first": "Ada", "last": "Byte"}</code>. This reader crashes on new documents. Click the faulty line.',
      code: [
        "def first_name(doc):",
        '    parts = doc["name"].split(" ")',
        '    if "first" in doc:',
        '        return doc["first"]',
        "    return parts[0]",
      ],
      a: 1,
      hint: "Which line uses a field before checking it exists?",
      why: 'Line 2 reads doc["name"] before the shape is known, and new documents have no name, so it fails with a missing key. In schema-on-read the reader must check the shape first and only then use the fields.',
    },
    {
      type: "slider",
      q: "A feed of 2,000 records arrives and 1 in 10 has no account number. A schema-on-write table rejects those as they are saved. About how many records does it reject?",
      min: 0,
      max: 1000,
      step: 50,
      start: 500,
      ans: 200,
      tol: 50,
      hint: "1 in 10 of 2,000: 2,000 ÷ 10.",
      why: "2,000 ÷ 10 = 200 records are rejected at write time. With schema-on-read all 2,000 would be stored, and the gaps would only show up when some reader met them.",
    },
    {
      type: "multi",
      q: "Which statements about a document stored as one continuous string (JSON, XML or BSON) are true? Select all that apply.",
      o: [
        "One read brings back the whole object from one place",
        "Asking for one small field can still load the entire document",
        "It saves the app from ever having to check a field exists",
        "It suits objects the app usually needs in large parts",
      ],
      a: [0, 1, 3],
      hint: "Locality helps when you want most of the data, and hurts when you want a sliver.",
      why: "Locality gives a single read for the whole object, which pays off when most of it is used. It also means a sliver costs a full load. Schema-on-read still needs the app to check what fields exist.",
    },
  ]);

  const FOLLOW = { P: [60, 60], Q: [200, 40], R: [340, 70], S: [120, 190], T: [280, 190] };
  const FEDGES = [
    ["P", "R"],
    ["Q", "R"],
    ["S", "R"],
    ["T", "R"],
    ["P", "Q"],
    ["S", "T"],
  ];
  B.add("ds-graph", [
    {
      type: "mcq",
      q: "Which of these questions would a graph database answer LEAST naturally?",
      o: [
        "What is the average of 10 million sale amounts?",
        "Which pages link to this page, and which link to those?",
        "Who are the friends of Ana's friends?",
        "Which junctions lie between the depot and the shop?",
      ],
      a: 0,
      why: "The first is a plain total over a column, which tables handle well and which needs no relationships. The others all follow edges from vertex to vertex, which is where graphs shine.",
    },
    {
      type: "pick",
      q: "<b>Arrows mean &quot;links to&quot;.</b> Tap the page with the most incoming links, the one a PageRank-style score would favour most.",
      fig: Qf.graph(FOLLOW, FEDGES, { pick: "nodes", directed: true, w: 420, h: 240 }),
      a: ["R"],
      hint: "Count the arrowheads arriving at each page.",
      why: "R receives four arrows, from P, Q, S and T. Q and T each receive one. Pages that many others link to look more relevant to PageRank.",
    },
    {
      type: "order",
      q: "Put the steps in order for storing &quot;Ana lives in Leeds&quot; in a property graph.",
      items: [
        "Create a vertex for Ana with its own ID and properties",
        "Create a vertex for Leeds with its own ID and properties",
        "Create an edge with tail Ana, head Leeds and the label LIVES_IN",
        "Ana's outgoing edges now include that edge, so it can be found at once",
      ],
      hint: "An edge needs both ends to exist first.",
      why: "An edge records a head and a tail vertex, so both vertices must exist. Once the edge is created, each vertex can list it among its incoming or outgoing edges.",
    },
    {
      type: "bug",
      q: "The edges below are <code>(id, tail, head, label)</code>. This function should list the companies a person works for, but it also returns the city. Click the faulty line.",
      code: [
        'edges = [("e1", "ana", "orbit", "WORKS_AT"), ("e2", "ana", "leeds", "LIVES_IN")]',
        "def employers(person):",
        "    out = []",
        "    for (eid, tail, head, label) in edges:",
        "        if tail == person:",
        "            out.append(head)",
        "    return out",
      ],
      a: 4,
      hint: "Which part of an edge says what kind of relationship it is?",
      why: 'The test only checks the tail, so every edge leaving Ana qualifies, including LIVES_IN. It also needs label == "WORKS_AT". Edge labels are what let one graph hold many kinds of relationship.',
    },
    {
      type: "slider",
      q: "A network has 200 people. Each person follows exactly 4 others, and every follow is a one-way edge. About how many edges does the graph hold?",
      min: 0,
      max: 1600,
      step: 100,
      start: 400,
      ans: 800,
      tol: 100,
      hint: "Each of 200 people starts 4 edges.",
      why: "200 × 4 = 800 directed edges. Unlike a mutual friendship, a one-way follow is its own edge, so nothing is halved.",
    },
    {
      type: "multi",
      q: "Which statements about a property graph are true? Select all that apply.",
      o: [
        "An edge can hold properties, such as the year a link began",
        "Two vertices can be joined by more than one edge with different labels",
        "Every vertex must hold exactly the same set of properties",
        "Each vertex can quickly list its incoming and outgoing edges",
      ],
      a: [0, 1, 3],
      why: "Edges carry a label and their own properties, and several labelled edges can join the same pair. Vertices may differ in their properties. Fast edge lists per vertex are what make traversal cheap.",
    },
  ]);

  B.add("ds-nosql", [
    {
      type: "cat",
      q: "A chat table has a partition key (the room) and a sort key (the time sent). Sort each job by the key that does it.",
      buckets: ["Partition key", "Sort key"],
      items: [
        ["Keeps all of one room's messages together", 0],
        ["Puts the messages of a room in time order", 1],
        ["Decides which partition an item is stored in", 0],
        ["Lets a query ask for messages between 09:00 and 10:00", 1],
      ],
      why: "The partition key groups related items and chooses where they live. The sort key orders the items inside that group, which is what makes time ranges easy to read.",
    },
    {
      type: "multi",
      q: "Which statements about a key-value store are true? Select all that apply.",
      o: [
        "Each object is a set of key-value pairs",
        "Every item must use exactly the same attributes",
        "The schema can be defined per item",
        "Each item is found directly by its key",
      ],
      a: [0, 2, 3],
      why: "Key-value stores hold pairs, let each item define its own schema and find an item by its key. Items are not forced to share attributes.",
    },
    {
      type: "order",
      q: "Put the steps of scaling out a NoSQL cluster in order as traffic grows.",
      items: [
        "Traffic grows beyond what one machine can handle",
        "Add more ordinary machines to the cluster",
        "Split the data into partitions by key",
        "Spread the partitions so every machine takes a share of the load",
      ],
      hint: "You need the machines before you can spread anything across them.",
      why: "Horizontal scaling adds machines rather than a bigger one. The data is then partitioned and shared out, so each machine only handles part of the work.",
    },
    {
      type: "pick",
      q: "<b>Tap the snippet that is written as a document.</b>",
      fig: cards(
        [
          ["kv", ["user:42", "→ Ana"]],
          ["doc", ["{ title: Dune,", "tags: [sf] }"]],
          ["graph", ["(Ana) → (Ben)", "labelled KNOWS"]],
          ["wide", ["row 7: name,", "age, city"]],
        ],
        { w: 600, h: 100 },
      ),
      a: "doc",
      why: "A document is a JSON-like object with named fields and may hold nested values such as the tags list. The others are a key-value pair, a graph edge and a table-like row.",
    },
    {
      type: "bug",
      q: "A wide-column table lets each row hold its own columns, and some rows have no <code>phone</code>. This loop crashes. Click the faulty line.",
      code: ["for row in table.rows:", '    name = row["name"]', '    phone = row["phone"]', "    print(name, phone)"],
      a: 2,
      hint: "Which line assumes every row has the same columns?",
      why: 'Column names can vary from record to record, so row["phone"] fails for rows without it. The code should check the column exists, or use a default, as in a schema-on-read store.',
    },
    {
      type: "slider",
      q: "A cluster has 8 servers and each handles about 5,000 writes a second. The team adds 4 more servers of the same kind and the load spreads evenly. About how many writes a second can the cluster now take?",
      min: 0,
      max: 100000,
      step: 5000,
      start: 20000,
      ans: 60000,
      tol: 5000,
      hint: "12 servers at 5,000 each: 12 × 5 = 60 thousand.",
      why: "12 × 5,000 = 60,000. Capacity grows roughly in step with the machines added, which is the point of horizontal scaling.",
    },
  ]);
})();

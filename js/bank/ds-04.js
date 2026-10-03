/* ===== bank-ds-3.js ===== */
/* Data Science revision bank, part 3 (revision mode only). Lecture 2: data models, schema, graphs, NoSQL. Concepts only, no SQL syntax, no calculator. Numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});

  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  /* A small ferry network for the pick questions. */
  const PORTS = { A: [60, 130], B: [170, 50], C: [170, 210], D: [290, 130], E: [400, 60], F: [400, 210] };
  const ROUTES = [
    ["A", "B"],
    ["A", "C"],
    ["B", "D"],
    ["C", "D"],
    ["D", "E"],
    ["D", "F"],
    ["E", "F"],
  ];

  B.add("ds-models", [
    M(
      "What does a data model do for an application?",
      [
        "It maps the app's objects to a stored form such as tables or JSON",
        "It copies the app's objects onto extra servers, so a crash never loses any of them",
        "It scrambles the app's objects so outsiders cannot read them",
        "It times how long the app's objects take to load",
      ],
      0,
      "A data model is the mapping between an application entity and how a system stores it.",
    ),
    TF(
      "An object-relational mapper (ORM) removes any mismatch between objects and tables.",
      false,
      "It automates the translation, but the fit is still often unintuitive from the business point of view.",
    ),
    {
      type: "cat",
      q: "A plant nursery app. Which kind of relationship is each one?",
      buckets: ["One-to-many", "Many-to-one", "Many-to-many"],
      items: [
        ["One greenhouse holds many plants, each in only that greenhouse", 0],
        ["Hundreds of plants all come from the same supplier", 1],
        ["Gardeners follow many gardeners and are followed by many", 2],
        ["One plant has several care tips that belong only to it", 0],
      ],
      why: "One parent with owned children is one-to-many; many records sharing one entity is many-to-one; links that go both ways in bulk are many-to-many.",
    },
    M(
      "Which is NOT one of the lecture's ways to store a one-to-many list such as a profile's positions?",
      [
        "A separate table whose rows carry a foreign key to the user",
        "A structured JSON or XML column inside the user row",
        "JSON or XML text kept in a plain text field",
        "A separate database server that holds one copy per position",
      ],
      3,
      "The three options are normalised tables, a structured column, or text in a field. Adding servers is a scaling tool, not a data model.",
    ),
    {
      type: "match",
      q: "Match each way of storing a gardener's list of plants to its main trait.",
      pairs: [
        ["Separate table with a foreign key", "Each row points back to its owner"],
        ["Structured JSON column", "Nested data can still be indexed and queried"],
        ["JSON text in a text field", "The database sees only opaque text"],
      ],
      why: "Normalised rows link by key, a structured column stays queryable, and plain text is opaque to the database.",
    },
    TF(
      "All documents in one collection must have exactly the same fields.",
      false,
      "Documents in a single store can differ from one another; that flexibility is the point.",
    ),
    M(
      "Which of these is an example of a document database?",
      ["CouchDB", "Cassandra", "DynamoDB", "PostgreSQL"],
      0,
      "CouchDB, MongoDB and Firestore are the lecture's document stores. Cassandra is wide-column, DynamoDB key-value, PostgreSQL relational.",
    ),
    M(
      "Why do document models handle many-to-many links badly?",
      [
        "Shared data is copied into many documents, or joined with clumsy support",
        "Documents cannot hold more than one link, so each needs its own file",
        "Documents forget their links whenever the database restarts or is moved to a new machine",
        "Every link forces the whole collection to be locked while it is read",
      ],
      0,
      "Without good joins, the same data is either duplicated or fetched by slower, more complicated join features.",
    ),
    {
      type: "multi",
      q: "Which are genuine advantages of the relational model over the document model? Select all that apply.",
      o: [
        "Better support for joins",
        "Better support for many-to-one and many-to-many links",
        "All of an object's data is stored together in one place",
        "Documents in the same table can each have different fields",
      ],
      a: [0, 1],
      why: "Locality and flexible fields are the document model's strengths. Joins and shared entities are where relational wins.",
    },
    {
      type: "order",
      q: "Put the steps in order for storing a user's list of positions in normalised tables.",
      items: [
        "Give each user row a unique ID",
        "Create a separate table for the positions",
        "Add a column that holds the owner's user ID",
        "Insert one row per position",
      ],
      why: "The ID must exist first, then a child table with a foreign key column, then one row per item.",
    },
    M(
      'Why is translating between objects and tables "not always intuitive"?',
      [
        "Objects nest and link freely, but rows are flat and joined by keys",
        "Objects are stored on disk while tables live only in memory",
        "Objects can only hold numbers, while tables are the only place that can hold any text",
        "Objects change each time they are read, but tables never change",
      ],
      0,
      "One nested object may need several tables and joins to rebuild, which is awkward to reason about.",
    ),
    M(
      '"Semi-structured" documents such as JSON mean the data…',
      [
        "carries its own labels, but needs no fixed table layout",
        "has no labels at all, so it is only ever stored as raw text",
        "must match one shared layout before it can be saved",
        "is split into rows and columns the moment it arrives",
      ],
      0,
      "Keys label the values inside each document, without a rigid schema imposed from outside.",
    ),
    TF(
      "In a normalised design, a profile's positions live in rows that point back to the profile with a foreign key.",
      true,
      "That is the definition of the normalised one-to-many representation.",
    ),
    M(
      "Three gardeners list 5, 2 and 4 plants. How many rows does the separate plants table hold?",
      ["3", "11", "33", "40"],
      1,
      "One row per plant: 5 + 2 + 4 = 11. The three gardeners are rows in a different table.",
      { hint: "One row per plant, so add the three counts: 5 + 2 + 4." },
    ),
  ]);

  B.add("ds-schema", [
    M(
      "Schema-on-read is closest to which idea from programming?",
      [
        "Dynamic typing: the shape is checked when the data is used",
        "Static typing: the shape is checked before the program runs",
        "Garbage collection: unused data is cleaned up later",
        "Compiling: the data is turned into machine code first",
      ],
      0,
      "Neither side checks the shape up front; the code that reads the data deals with whatever it finds.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Schema-on-write", "Structure enforced when data is stored"],
        ["Schema-on-read", "Structure interpreted when the app reads it"],
        ["Locality", "An object's data sits together in one place"],
        ["Heterogeneous data", "Different kinds of object in one collection"],
      ],
      why: "Write-time versus read-time structure, plus the storage layout and data variety that go with them.",
    },
    TF(
      "Most document databases reject a document that is missing a field.",
      false,
      "Most enforce no schema at all, so no field is guaranteed.",
    ),
    {
      type: "cat",
      q: "Which data suits which approach?",
      buckets: ["Schema-on-read", "Schema-on-write"],
      items: [
        ["A catalogue where each product type has very different attributes", 0],
        ["Partner feeds whose format you do not control", 0],
        ["A ledger where every row must have an amount and a date", 1],
        ["A payroll table whose fixed columns every report relies on", 1],
      ],
      why: "Varied or uncontrolled data favours flexible reading. Data with rules that must always hold favours an enforced schema.",
    },
    M(
      'A weather startup replaces a "location" field with separate "lat" and "lon" fields in a document store. Old documents keep the old field. How should the reading code cope?',
      [
        "Test which fields exist and convert the old one when needed",
        "Refuse to read any document that still has the old field",
        "Wait until every stored document has been rewritten into the new shape first",
        "Assume every document already has the new fields",
      ],
      0,
      "Schema-on-read means the application handles both shapes as it reads.",
    ),
    M(
      "A hotel booking page always shows the guest, room, extras and notes for one booking together. How does locality help?",
      [
        "One read fetches the whole booking, not several tables",
        "The booking is copied to a second server to spread the load",
        "The guest's name is stored once and shared by every booking",
        "The extras are sorted alphabetically before they are shown",
      ],
      0,
      "The document is stored as one continuous piece, so one request brings everything back.",
    ),
    TF(
      "Locality is something only document databases can offer.",
      false,
      "Google Spanner offers it in a relational model, and wide-column stores manage it with column families.",
    ),
    {
      type: "multi",
      q: "When does schema-on-read help most? Select all that apply.",
      o: [
        "Different kinds of object share one collection",
        "You do not control the structure of incoming data, such as tweets",
        "Every record must be checked before it is ever saved",
        "Every field must have the same type in all records",
      ],
      a: [0, 1],
      why: "Heterogeneous data and data you cannot control need a tolerant reader. Strict pre-save checks call for schema-on-write.",
    },
    {
      type: "order",
      q: 'Put the steps in order for splitting one "full name" column into first and last names in a relational database.',
      items: [
        "Alter the table to add first-name and last-name columns",
        "Update every existing row to fill the new columns",
        "Deploy code that reads the new columns",
      ],
      why: "The columns must exist before they can be filled, and the app switches over once the data is ready.",
    },
    M(
      "What is the main downside of having no schema at all?",
      [
        "No guarantee which fields a given document contains",
        "The database can no longer store more than one document",
        "Every document must be read twice before it is used",
        "Documents have to be written in alphabetical order",
      ],
      0,
      "Your code cannot assume a field exists, so it must check the shape itself.",
    ),
    {
      type: "slider",
      q: "A table has 200 million rows. Filling in a new column updates 2 million rows every minute. About how many minutes does the update run?",
      min: 0,
      max: 300,
      step: 10,
      ans: 100,
      tol: 20,
      unit: " min",
      hint: "200 million ÷ 2 million per minute.",
      why: "200 ÷ 2 = 100 minutes, which is why large relational changes can need downtime.",
    },
    M(
      'A schema that is "implicit" in a document store lives…',
      [
        "in the application code that reads the documents",
        "in a rulebook the database checks before saving",
        "in the file name of each document",
        "in an index that is rebuilt every night",
      ],
      0,
      "Nothing in the store enforces it; the reading code carries the assumptions.",
    ),
    {
      type: "bug",
      q: "This reader should return a full name from new documents (first_name and last_name) or old ones (name). Click the faulty line.",
      code: [
        "def full_name(doc):",
        '    if "first_name" in doc:',
        '        return doc["first_name"] + " " + doc["last_name"]',
        '    return doc["first_name"]',
      ],
      a: 3,
      why: 'Old documents have no first_name field. The fallback should read doc["name"].',
    },
  ]);
  Object.assign(partScope, { M, PORTS, ROUTES, TF });
})();

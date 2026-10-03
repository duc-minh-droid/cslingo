(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { M, PORTS, ROUTES, TF } = partScope;
  const B = NIC.bank,
    Qf = NIC.qfig;

  B.add("ds-graph", [
    M(
      "Which kind of problem is naturally easy for a graph model but awkward for tables or documents?",
      [
        "Many-to-many links followed for several hops",
        "Storing a single long list of monthly totals",
        "Keeping one large text document for each author",
        "Counting how many rows a table currently holds",
      ],
      0,
      "Graphs make relationships the first-class thing, so hopping along them is direct.",
    ),
    {
      type: "cat",
      q: "In a ferry network, is each item a vertex or an edge?",
      buckets: ["Vertex (node)", "Edge"],
      items: [
        ["A port", 0],
        ["A ferry route between two ports", 1],
        ["A passenger in a social network", 0],
        ['A "follows" link between two passengers', 1],
      ],
      why: "Entities are vertices; the relationships between them are edges.",
    },
    {
      type: "match",
      q: "Match each property-graph part to its role.",
      pairs: [
        ["Unique ID", "Identifies one vertex or edge"],
        ["Incoming and outgoing edges", "Let you hop to neighbouring vertices"],
        ["Key-value properties", "Hold extra facts such as a name or a date"],
        ["Relationship label", "Says what kind of link an edge is"],
      ],
      why: "IDs identify, edges connect, properties describe, labels classify the relationship.",
    },
    {
      type: "pick",
      q: "<b>Click the port with the most routes attached to it.</b>",
      fig: Qf.graph(PORTS, ROUTES, { pick: "nodes", w: 460, h: 260 }),
      a: ["D"],
      why: "D has four routes (to B, C, E and F). Every other port has two.",
    },
    {
      type: "pick",
      q: "<b>Click every route that touches port E.</b>",
      fig: Qf.graph(PORTS, ROUTES, { pick: "edges", w: 460, h: 260 }),
      a: ["D-E", "E-F"],
      why: "E connects to D and to F. Those are its only two routes.",
    },
    M(
      "A property graph can be viewed as two relational tables. What do they hold?",
      [
        "Vertices in one table and edges in the other",
        "Reads in one table and writes in the other",
        "Old records in one table and new records in the other",
        "Names in one table and numbers in the other",
      ],
      0,
      "One table lists the vertices with their properties; the other lists the edges with their head, tail, label and properties.",
    ),
    TF(
      "In a property graph, any vertex may be connected to any other vertex.",
      true,
      "There is no restriction on which vertices can be linked; labels say what each link means.",
    ),
    {
      type: "match",
      q: "Match each graph technique to what it does.",
      pairs: [
        ["Dijkstra", "Finds the shortest route across a road network"],
        ["PageRank", "Scores how relevant a web page is for a search"],
        ["Traversal", "Hops along edges from a starting vertex"],
      ],
      why: "Dijkstra and PageRank are the lecture's ready-made graph algorithms; traversal is the basic operation they build on.",
    },
    M(
      "A hospital records which doctors refer patients to which specialists, and wants everyone within three referrals of one doctor. Why fit a graph?",
      [
        "Each vertex leads straight to its edges, so hops are cheap to follow",
        "Graphs store every doctor's name only once on a single server",
        "Graphs stop two doctors from ever sharing the same specialist",
        "Graphs keep every referral in one sorted list on disk",
      ],
      0,
      "Given a vertex you can quickly find its incoming and outgoing edges, so repeated hops stay easy.",
    ),
    {
      type: "multi",
      q: "Which datasets are naturally graphs? Select all that apply.",
      o: [
        "A road network of junctions and roads",
        "Web pages linked to other pages",
        "A social network of people and friendships",
        "A list of 10,000 temperature readings",
      ],
      a: [0, 1, 2],
      why: "Roads, links and friendships are entities joined by relationships. A plain list of readings has no links between items.",
    },
    {
      type: "order",
      q: "Put the steps in order for a two-hop trip starting at vertex A.",
      items: [
        "Start at vertex A",
        "Read A's outgoing edges",
        "Move to one of A's neighbours",
        "Read that neighbour's outgoing edges",
      ],
      why: "Each hop is: read the edges of where you are, then move along one of them.",
    },
    TF(
      "Different edge labels let one graph represent many different kinds of relationship.",
      true,
      'Labels such as "follows" or "works at" sit on edges, so one graph can mix relationships.',
    ),
    M(
      'In a property graph, where would you store "friends since 2019"?',
      [
        "As a property on the friendship edge",
        "As a property on the first friend's vertex only",
        "In a separate document for the year 2019",
        "In the ID of the second friend's vertex",
      ],
      0,
      "A fact about the relationship belongs on the edge that represents it.",
    ),
    TF(
      "To find a vertex's neighbours in a graph, you must scan every edge in the graph.",
      false,
      "A vertex keeps its own incoming and outgoing edges, so its neighbours are found directly.",
    ),
  ]);

  B.add("ds-nosql", [
    {
      type: "cat",
      q: "Which NoSQL family does each product belong to?",
      buckets: ["Document", "Key-value", "Wide-column"],
      items: [
        ["MongoDB", 0],
        ["Firestore", 0],
        ["DynamoDB", 1],
        ["Cassandra", 2],
        ["CouchDB", 0],
      ],
      why: "MongoDB, Firestore and CouchDB are document stores; DynamoDB is key-value; Cassandra is wide-column.",
    },
    M(
      "In the lecture's sense, NoSQL databases are…",
      [
        "non-relational stores that favour simple design and scaling out",
        "relational stores that have no query language and no way to search",
        "databases that only run on a single powerful server",
        "old formats that were replaced by spreadsheets",
      ],
      0,
      "The label means non-relational storage and retrieval, with simplicity, scalability and availability as priorities.",
    ),
    M(
      "In MongoDB, what sits directly inside a database?",
      [
        "Collections of documents",
        "One giant table shared by every document",
        "Foreign-key rules linking every document",
        "A property graph of all the documents",
      ],
      0,
      "Databases hold collections, and collections hold documents.",
    ),
    TF(
      "A wide-column store requires every row to use exactly the same column names.",
      false,
      "Column names and formats can vary from record to record.",
    ),
    M(
      "A session store must get, set and expire a shopping basket by its session ID, millions of times a second. Which family fits best?",
      ["Key-value", "Graph", "Wide-column", "Relational with many joins"],
      0,
      "Every access is by one exact key, which is what key-value stores do best.",
    ),
    {
      type: "match",
      q: "Match each scaling term to its meaning.",
      pairs: [
        ["Horizontal scaling", "Adding more machines to share the load"],
        ["Vertical scaling", "Moving to one bigger machine"],
        ["Availability", "The service keeps answering requests"],
      ],
      why: "NoSQL systems lean on horizontal scaling and availability.",
    },
    {
      type: "multi",
      q: "Which of these are NoSQL families in the lecture? Select all that apply.",
      o: ["Document", "Key-value", "Wide-column", "Graph", "Fixed-schema table store"],
      a: [0, 1, 2, 3],
      why: "The lecture lists document, key-value, wide-column and graph. A fixed-schema table store is the relational approach.",
    },
    {
      type: "order",
      q: "Put MongoDB's building blocks in order, from smallest to largest.",
      items: ["A field with a value", "A document", "A collection", "A database"],
      why: "Fields make up a document, documents fill a collection, collections live in a database.",
    },
    M(
      "A museum catalogue keeps rows in named columns, but paintings, coins and fossils each need different columns. Which family fits?",
      ["Wide-column", "Key-value", "Graph", "Fixed-schema tables"],
      0,
      "Wide-column stores use tables and rows, with column names that can vary per record.",
    ),
    TF(
      "A graph database counts as one of the NoSQL families.",
      true,
      "Graph is the fourth family, alongside document, key-value and wide-column.",
    ),
    M(
      "A ticketing app saves each event with its venue, price tiers and a nested seat map, and always loads it whole. Which family fits?",
      ["Document", "Key-value", "Graph", "Wide-column"],
      0,
      "Self-contained nested records that are read together are the document model's home ground.",
    ),
    M(
      "A rail planner wants the fewest changes between two stations across a web of lines. Which family fits?",
      ["Graph", "Key-value", "Document", "Wide-column"],
      0,
      "Stations are vertices and lines are edges, so route finding follows edges directly.",
    ),
    {
      type: "slider",
      q: "Each server handles 20,000 requests a second and the peak load is 100,000 requests a second. About how many servers share the peak?",
      min: 0,
      max: 12,
      step: 1,
      ans: 5,
      tol: 1,
      unit: " servers",
      hint: "How many 20,000s fit into 100,000?",
      why: "100,000 ÷ 20,000 = 5 servers, the scale-out idea behind NoSQL.",
    },
    M(
      'DynamoDB\'s "complex primary key" combines…',
      [
        "a partition key plus a sort key",
        "a graph edge plus a vertex ID",
        "a table name plus a column name",
        "a document ID plus a collection name",
      ],
      0,
      "The two-part key lets items be grouped by one part and ordered by the other.",
    ),
  ]);
})();

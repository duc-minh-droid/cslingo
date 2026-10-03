/* ===== bank-w-ds-2.js ===== */
/* DS revision bank, second set of visual and varied questions, part 2.
   Lecture 2 (models, schema, graph, NoSQL) and Lecture 3 (log, hash index, SSTable).
   New angles: diagnose, predict, compare, refute. Every figure is needed; numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});

  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto"><defs><marker id="wds-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--line-2)"/></marker></defs>${body}</svg>`;
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "start"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "var(--mono)" : "var(--sans)"}" fill="${o.c || "var(--text)"}">${esc(s)}</text>`;
  const rc = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 3, extra = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;
  const table = (head, rows) =>
    `<table class="t"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const mono = (x, y, s, o = {}) => tx(x, y, s, { m: true, s: 13, ...o });
  const arrow = (a, b, r = 19) => {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]),
      ux = (b[0] - a[0]) / d,
      uy = (b[1] - a[1]) / d;
    return `<line x1="${a[0] + ux * r}" y1="${a[1] + uy * r}" x2="${b[0] - ux * (r + 2)}" y2="${b[1] - uy * (r + 2)}" stroke="var(--line-2)" stroke-width="2.5" marker-end="url(#wds-arr)"/>`;
  };

  /* ================= ds-models ================= */
  const tbl = (x, title, cols) => {
    let s =
      rc(x, 8, 170, 30 + cols.length * 26 + 6, { rx: 8 }) +
      `<rect x="${x}" y="8" width="170" height="28" rx="8" fill="var(--bg-2)" stroke="var(--line-2)" stroke-width="2"/>` +
      tx(x + 85, 27, title, { a: "middle", s: 13 });
    cols.forEach((c, i) => (s += mono(x + 12, 56 + i * 26, c, { s: 12 })));
    return s;
  };
  const FIG_RECIPES = svg(
    580,
    120,
    tbl(5, "recipes", ["id", "title"]) +
      pk("ing", tbl(205, "ingredients", ["id", "name"])) +
      pk("link", tbl(405, "recipe_ingredients", ["recipe_id", "ingredient_id"])),
  );

  const FIG_CUSTOMER = svg(
    560,
    200,
    rc(6, 6, 548, 188) +
      mono(20, 28, `{ "customer": "Ola Park", "town": "York",`) +
      mono(20, 50, `  "orders": [`) +
      mono(20, 74, `    { "day": "3 May",  "item": "Socks",  "price": 4 },`) +
      mono(20, 98, `    { "day": "9 May",  "item": "Socks",  "price": 4 },`) +
      mono(20, 122, `    { "day": "21 May", "item": "Gloves", "price": 7 } ] }`) +
      tx(20, 156, "One document, stored in a collection of 2 million customers.", { s: 12, c: "var(--text-dim)" }) +
      tx(20, 176, "No fixed schema is declared for the collection.", { s: 12, c: "var(--text-dim)" }),
  );

  B.add("ds-models", [
    {
      type: "cat",
      q: "Sort each need by the data model that suits it best.",
      buckets: ["Relational tables", "Document", "Graph"],
      items: [
        ["Invoices, customers and products that many different reports join together", 0],
        ["A CV page that is always loaded as one unit, with jobs nested inside", 1],
        ['"Who do my friends know that I don\'t?"', 2],
        ["Strict rules, such as every order must point at a real customer", 0],
        ["Each product page has its own set of attributes", 1],
        ["Finding the connection between two strangers through shared contacts", 2],
      ],
      why: "Tables shine when many reports join shared records under strict rules. Documents shine when one self-contained unit is loaded whole. Graphs shine when the answer is found by following links through several hops.",
    },
    {
      type: "pick",
      q: "Each recipe uses many ingredients, and each ingredient appears in many recipes. The amount in grams belongs to one recipe-and-ingredient pair. Tap the table where a grams column should go.",
      fig: FIG_RECIPES,
      a: "link",
      why: "Grams describes the relationship, not the recipe alone (a recipe has many amounts) and not the ingredient alone (flour is used in different amounts). The link table holds one row per pair, so that is where the amount lives.",
    },
    {
      type: "multi",
      q: "This customer is stored as one document with their orders nested inside. Select all statements that are true.",
      fig: FIG_CUSTOMER,
      o: [
        "One read returns the customer's whole order history",
        "Finding every customer who bought socks is as cheap as loading one customer",
        "Renaming a product leaves the old name inside past orders",
        "A product bought twice has its details stored twice",
        "An order with an extra field is rejected until the schema changes",
      ],
      a: [0, 2, 3],
      why: "Nesting gives locality, so one read gets everything, but it copies product details into each order, and those copies do not change when the product is renamed. Searching across all customers has no shortcut. With no declared schema, an extra field is simply stored.",
    },
    {
      type: "slider",
      q: "A reading club has 30 members. Each member subscribes to 4 of the club's magazines. Members and magazines are separate tables. About how many rows does the link table hold, with one row per subscription?",
      min: 0,
      max: 300,
      step: 10,
      ans: 120,
      tol: 20,
      hint: "30 members × 4 subscriptions each: 30 + 30 + 30 + 30.",
      why: "Each subscription is one member-magazine pair, so 30 × 4 = 120 rows. The link table grows with the number of relationships, not with the number of members or magazines.",
    },
    {
      type: "match",
      q: "Match each problem to the usual fix.",
      pairs: [
        ["The same employer name is typed into thousands of rows", "Move it to its own table and refer to it by ID"],
        ["A tag labels many posts and a post has many tags", "A link table holding both IDs"],
        ["A page needs a post and its comments in one read", "Nest the comments inside the post document"],
        ["Reports must combine data from several record types", "Keep separate tables so they can be joined"],
      ],
      why: "Repeated values belong in one shared record. Many-to-many needs a link table. Data that is always fetched together can be nested for locality. Frequent cross-record reports are what joins are for.",
    },
    {
      type: "bug",
      q: "A reviewer lists claims about moving a CV site from tables to documents. One claim is wrong. Click it.",
      code: [
        "Locality: one read can return a whole CV",
        "Joins across documents are weaker, so the app may do some in code",
        "Documents guarantee that no data is ever duplicated",
        "A shared record, such as an employer, needs care once it is copied into many documents",
      ],
      a: 2,
      why: "Embedding copies data into every document that uses it, so duplication is the usual cost of the document model. The other three claims describe real benefits and costs.",
    },
  ]);

  /* ================= ds-schema ================= */
  const FIG_FIELDS = svg(
    560,
    190,
    mono(10, 20, "Field names that hold an email address, 10,000 documents", { s: 12, c: "var(--text-dim)" }) +
      [
        ["f1", "email", "9,800"],
        ["f2", "e-mail", "150"],
        ["f3", "mail", "40"],
        ["f4", "emial", "10"],
      ]
        .map(([id, n, c], i) =>
          pk(
            id,
            rc(10, 32 + i * 38, 540, 32) +
              mono(24, 54 + i * 38, `"${n}"`) +
              tx(536, 54 + i * 38, `${c} documents`, { a: "end", s: 13, c: "var(--text-dim)" }),
          ),
        )
        .join(""),
  );

  const FIG_SHAPES = svg(
    560,
    110,
    rc(10, 10, 308, 38, { st: "var(--rose)", f: "var(--rose-dim)" }) +
      tx(164, 34, 'v1: one "name" field  (40 million)', { a: "middle", s: 13 }) +
      rc(318, 10, 192, 38, { st: "var(--amber)", f: "var(--amber-dim)" }) +
      tx(414, 34, "v2: first + last  (25 M)", { a: "middle", s: 13 }) +
      rc(510, 10, 40, 38, { st: "var(--teal)", f: "var(--teal-dim)" }) +
      tx(530, 34, "v3", { a: "middle", s: 12 }) +
      tx(530, 72, "5 M", { a: "middle", s: 13, c: "var(--teal)" }) +
      ln(530, 52, 530, 62, "var(--teal)", 2) +
      tx(10, 96, "Total: 70 million user documents, none ever rewritten. v3 adds first, last and nickname.", {
        s: 12,
        c: "var(--text-dim)",
      }),
  );

  B.add("ds-schema", [
    {
      type: "cat",
      q: "For each outcome, which approach is it a sign of?",
      buckets: ["Schema-on-write", "Schema-on-read"],
      items: [
        ["A misspelt field name is quietly stored", 1],
        ["Text typed into a number column is refused at insert", 0],
        ["Reading code must cope with old and new shapes side by side", 1],
        ["Every reader can rely on each row having the same columns", 0],
        ["Data from an outside partner is saved as it arrives, whatever its shape", 1],
        ["Adding a field to existing data needs a migration step", 0],
      ],
      why: "Schema-on-write checks the shape when data goes in, so readers can trust it, but changes need migrations. Schema-on-read accepts anything and pushes the checking, the old-and-new handling and the typo risk onto the readers.",
    },
    {
      type: "pick",
      q: 'In a schema-on-read collection, the team counts which field names hold an email address. A search for exactly "email" is run. Tap every spelling that this search would miss.',
      fig: FIG_FIELDS,
      a: ["f2", "f3", "f4"],
      why: 'Nothing enforced one spelling, so three variants crept in. The search only matches the exact name "email", so it silently skips 200 documents. That is the hidden cost of schema-on-read: the reader must know every shape that ever got written.',
    },
    {
      type: "match",
      q: "Match each symptom to its most likely cause.",
      pairs: [
        ["A report shows 12% of customers with no country", "Old documents were written before the field existed"],
        ["An insert fails with a type error", "The value does not fit the declared column type"],
        [
          'Both "zip" and "postcode" appear in one collection',
          "Writers followed different conventions and nothing enforced one",
        ],
        ["A dashboard breaks after a team renames a field", "Readers still expect the old shape"],
      ],
      why: "Each symptom traces to when the structure is checked. Missing and duplicate fields point to a store that never rejected anything. A type error is the schema doing its job. A rename breaks any reader that assumed the old name.",
    },
    {
      type: "bug",
      q: 'Old user documents hold one "name" typed by people, such as "Mo Reid" or "Mary Ann Smith". This reader must never crash. Click the faulty line.',
      code: [
        "def first_name(doc):",
        '    if "first" in doc:',
        '        return doc["first"]',
        '    first, last = doc["name"].split(" ")',
        "    return first",
      ],
      a: 3,
      why: 'Unpacking into exactly two parts crashes for a name with three words (or one). With schema-on-read the reader cannot assume tidy data, so it should take just the part before the first space, for example doc["name"].split(" ")[0].',
    },
    {
      type: "mcq",
      q: "A new reader is written that understands only the v3 shape. About what share of the stored documents can it handle?",
      fig: FIG_SHAPES,
      o: ["About 7%", "About 35%", "About 60%"],
      a: 0,
      hint: "Add the three groups for the total (40 + 25 + 5 = 70 million), then compare 5 with 70.",
      why: "Only the 5 million v3 documents match, and 5 out of 70 is about 7%. The 35% and 60% choices are the v2 and v1 shares. Because old documents were never rewritten, every reader must keep handling all three shapes.",
    },
  ]);

  /* ================= ds-graph ================= */
  const FIG_BRIDGE = (() => {
    const P = { A: [60, 45], B: [60, 155], C: [170, 100], D: [320, 100], E: [430, 45], F: [430, 155] };
    const E = [
      ["A", "B"],
      ["A", "C"],
      ["B", "C"],
      ["C", "D"],
      ["D", "E"],
      ["D", "F"],
      ["E", "F"],
    ];
    let s = E.map(([a, b]) => ln(P[a][0], P[a][1], P[b][0], P[b][1], "var(--line-2)", 3)).join("");
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (s += pk(
          k,
          `<circle cx="${x}" cy="${y}" r="19" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>` +
            tx(x, y + 5, k, { a: "middle" }),
        )),
    );
    return svg(490, 200, s);
  })();

  const FIG_ONEWAY = (() => {
    const P = { D: [50, 100], P: [150, 100], Q: [250, 55], R: [350, 100], S: [150, 175], T: [50, 175] };
    const E = [
      ["D", "P"],
      ["P", "Q"],
      ["Q", "R"],
      ["R", "P"],
      ["S", "P"],
      ["T", "S"],
    ];
    let s = E.map(([a, b]) => arrow(P[a], P[b])).join("");
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (s += pk(
          k,
          `<circle cx="${x}" cy="${y}" r="19" fill="var(--panel)" stroke="${k === "D" ? "var(--teal)" : "var(--blue)"}" stroke-width="3"/>` +
            tx(x, y + 5, k, { a: "middle" }),
        )),
    );
    return svg(420, 205, s + tx(405, 195, "D = depot", { a: "end", s: 12, c: "var(--text-dim)" }));
  })();

  const FIG_HOPS = table(
    ["Hops from one person", "Stored as tables (ms)", "Stored as a graph (ms)"],
    [
      ["1", "12", "8"],
      ["2", "90", "14"],
      ["3", "2,400", "20"],
    ],
  );

  B.add("ds-graph", [
    {
      type: "pick",
      q: "Lines are friendships. If one person deletes their account, the network can split into two groups that no longer connect. Tap every person whose deletion would do that.",
      fig: FIG_BRIDGE,
      a: ["C", "D"],
      why: "C is the only link between A and B on one side and the rest, and D is the only link to E and F. Remove either and the groups separate. A, B, E and F each have another route, so the rest stays connected.",
    },
    {
      type: "pick",
      q: "Arrows are one-way streets. A van starts at the depot D (green) and follows the arrows, for as many streets as it likes. Tap every other place it can reach.",
      fig: FIG_ONEWAY,
      a: ["P", "Q", "R"],
      why: "D goes to P, P to Q, Q to R. R only leads back to P. S and T point toward P but nothing points to them, so the van can never get there. Direction matters: a link in one direction does not give a path in the other.",
    },
    {
      type: "cat",
      q: "In a property graph of people and companies, is each item a vertex, an edge, or a property?",
      buckets: ["Vertex", "Edge", "Property"],
      items: [
        ["Ana", 0],
        ["Orbit Ltd", 0],
        ['"works at" between Ana and Orbit Ltd', 1],
        ['"since 2019", stored on the works-at link', 2],
        ["Ana's date of birth", 2],
        ['"is friends with" between two people', 1],
      ],
      why: "Things are vertices and relationships are edges. Facts that describe one vertex (a birth date) or one edge (when the job began) are properties on it.",
    },
    {
      type: "slider",
      q: "A friendship network has 1,000 people and each has 50 friends. Friendship is mutual and each friendship is stored as one edge. About how many edges are there?",
      min: 0,
      max: 100000,
      step: 5000,
      ans: 25000,
      tol: 5000,
      hint: "1,000 × 50 = 50,000 friend slots. Each edge uses up two of them (one at each end).",
      why: "Counting each person's friends gives 50,000, but that counts every friendship twice, once from each side. So there are 25,000 edges.",
    },
    {
      type: "mcq",
      q: "The same friend network was queried both ways. At three hops, about how many times slower is the table version than the graph version?",
      fig: FIG_HOPS,
      o: ["About 6×", "About 30×", "About 120×"],
      a: 2,
      hint: "2,400 ÷ 20: halve both to get 1,200 ÷ 10.",
      why: "2,400 ÷ 20 = 120. The table time explodes with each extra hop because every hop is another join over the whole table, while the graph just follows stored links from where it stands.",
    },
    {
      type: "bug",
      q: 'A graph database holds people and the companies they work for. The team wants to answer "who works with Ana?" by following links. Click the line that blocks this.',
      code: [
        'vertex 1: Person   {name: "Ana"}',
        'vertex 2: Company  {name: "Orbit Ltd"}',
        'vertex 3: Person   {name: "Bo", employer: "Orbit Ltd"}',
        "edge 1 -> 2: WORKS_AT   {since: 2019}",
      ],
      a: 2,
      why: "Bo's employer is stored as text inside a property, so there is no edge to follow. It should be an edge from Bo to Orbit Ltd. Then Ana to Orbit Ltd and back to Bo is a two-hop traversal.",
    },
  ]);

  /* ================= ds-nosql ================= */
  const FIG_PKEYS = table(
    ["Candidate key", "Distinct values", "Busiest value's share of writes"],
    [
      ["Country code", "40", "35%"],
      ["Plan type", "3", "80%"],
      ["Order date", "1 (today)", "100%"],
      ["Customer ID", "2,000,000", "0.01%"],
    ],
  );
  Object.assign(partScope, { FIG_PKEYS, ln, mono, pk, rc, svg, table, tx });
})();

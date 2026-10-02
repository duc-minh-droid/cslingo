/* DS revision bank, second set of visual and varied questions, part 2.
   Lecture 2 (models, schema, graph, NoSQL) and Lecture 3 (log, hash index, SSTable).
   New angles: diagnose, predict, compare, refute. Every figure is needed; numbers verified with node. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto"><defs><marker id="wds-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--line-2)"/></marker></defs>${body}</svg>`;
  const tx = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "start"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "var(--mono)" : "var(--sans)"}" fill="${o.c || "var(--text)"}">${esc(s)}</text>`;
  const rc = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 3, extra = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const pk = (id, inner) => `<g data-pick="${id}" style="cursor:pointer">${inner}</g>`;
  const table = (head, rows) => `<table class="t"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const mono = (x, y, s, o = {}) => tx(x, y, s, { m: true, s: 13, ...o });
  const node = (x, y, label, col = "var(--blue)", r = 17) => `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--panel)" stroke="${col}" stroke-width="3"/>` + tx(x, y + 5, label, { a: "middle", s: 13 });
  const arrow = (a, b, r = 19) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d; return `<line x1="${a[0] + ux * r}" y1="${a[1] + uy * r}" x2="${b[0] - ux * (r + 2)}" y2="${b[1] - uy * (r + 2)}" stroke="var(--line-2)" stroke-width="2.5" marker-end="url(#wds-arr)"/>`; };

  /* ================= ds-models ================= */
  const tbl = (x, title, cols) => {
    let s = rc(x, 8, 170, 30 + cols.length * 26 + 6, { rx: 8 }) + `<rect x="${x}" y="8" width="170" height="28" rx="8" fill="var(--bg-2)" stroke="var(--line-2)" stroke-width="2"/>` + tx(x + 85, 27, title, { a: "middle", s: 13 });
    cols.forEach((c, i) => (s += mono(x + 12, 56 + i * 26, c, { s: 12 })));
    return s;
  };
  const FIG_RECIPES = svg(580, 120,
    tbl(5, "recipes", ["id", "title"]) + pk("ing", tbl(205, "ingredients", ["id", "name"])) +
    pk("link", tbl(405, "recipe_ingredients", ["recipe_id", "ingredient_id"])));

  const FIG_CUSTOMER = svg(560, 200,
    rc(6, 6, 548, 188) + mono(20, 28, `{ "customer": "Ola Park", "town": "York",`) + mono(20, 50, `  "orders": [`) +
    mono(20, 74, `    { "day": "3 May",  "item": "Socks",  "price": 4 },`) +
    mono(20, 98, `    { "day": "9 May",  "item": "Socks",  "price": 4 },`) +
    mono(20, 122, `    { "day": "21 May", "item": "Gloves", "price": 7 } ] }`) +
    tx(20, 156, "One document, stored in a collection of 2 million customers.", { s: 12, c: "var(--text-dim)" }) +
    tx(20, 176, "No fixed schema is declared for the collection.", { s: 12, c: "var(--text-dim)" }));

  B.add("ds-models", [
    { type: "cat", q: "Sort each need by the data model that suits it best.", buckets: ["Relational tables", "Document", "Graph"],
      items: [["Invoices, customers and products that many different reports join together", 0], ["A CV page that is always loaded as one unit, with jobs nested inside", 1], ["\"Who do my friends know that I don't?\"", 2], ["Strict rules, such as every order must point at a real customer", 0], ["Each product page has its own set of attributes", 1], ["Finding the connection between two strangers through shared contacts", 2]],
      why: "Tables shine when many reports join shared records under strict rules. Documents shine when one self-contained unit is loaded whole. Graphs shine when the answer is found by following links through several hops." },
    { type: "pick", q: "Each recipe uses many ingredients, and each ingredient appears in many recipes. The amount in grams belongs to one recipe-and-ingredient pair. Tap the table where a grams column should go.", fig: FIG_RECIPES, a: "link",
      why: "Grams describes the relationship, not the recipe alone (a recipe has many amounts) and not the ingredient alone (flour is used in different amounts). The link table holds one row per pair, so that is where the amount lives." },
    { type: "multi", q: "This customer is stored as one document with their orders nested inside. Select all statements that are true.", fig: FIG_CUSTOMER,
      o: ["One read returns the customer's whole order history", "Finding every customer who bought socks is as cheap as loading one customer", "Renaming a product leaves the old name inside past orders", "A product bought twice has its details stored twice", "An order with an extra field is rejected until the schema changes"], a: [0, 2, 3],
      why: "Nesting gives locality, so one read gets everything, but it copies product details into each order, and those copies do not change when the product is renamed. Searching across all customers has no shortcut. With no declared schema, an extra field is simply stored." },
    { type: "slider", q: "A reading club has 30 members. Each member subscribes to 4 of the club's magazines. Members and magazines are separate tables. About how many rows does the link table hold, with one row per subscription?", min: 0, max: 300, step: 10, ans: 120, tol: 20, hint: "30 members × 4 subscriptions each: 30 + 30 + 30 + 30.",
      why: "Each subscription is one member-magazine pair, so 30 × 4 = 120 rows. The link table grows with the number of relationships, not with the number of members or magazines." },
    { type: "match", q: "Match each problem to the usual fix.",
      pairs: [["The same employer name is typed into thousands of rows", "Move it to its own table and refer to it by ID"], ["A tag labels many posts and a post has many tags", "A link table holding both IDs"], ["A page needs a post and its comments in one read", "Nest the comments inside the post document"], ["Reports must combine data from several record types", "Keep separate tables so they can be joined"]],
      why: "Repeated values belong in one shared record. Many-to-many needs a link table. Data that is always fetched together can be nested for locality. Frequent cross-record reports are what joins are for." },
    { type: "bug", q: "A reviewer lists claims about moving a CV site from tables to documents. One claim is wrong. Click it.",
      code: ["Locality: one read can return a whole CV", "Joins across documents are weaker, so the app may do some in code", "Documents guarantee that no data is ever duplicated", "A shared record, such as an employer, needs care once it is copied into many documents"], a: 2,
      why: "Embedding copies data into every document that uses it, so duplication is the usual cost of the document model. The other three claims describe real benefits and costs." },
  ]);

  /* ================= ds-schema ================= */
  const FIG_FIELDS = svg(560, 190,
    mono(10, 20, "Field names that hold an email address, 10,000 documents", { s: 12, c: "var(--text-dim)" }) +
    [["f1", "email", "9,800"], ["f2", "e-mail", "150"], ["f3", "mail", "40"], ["f4", "emial", "10"]].map(([id, n, c], i) => pk(id, rc(10, 32 + i * 38, 540, 32) + mono(24, 54 + i * 38, `"${n}"`) + tx(536, 54 + i * 38, `${c} documents`, { a: "end", s: 13, c: "var(--text-dim)" }))).join(""));

  const FIG_SHAPES = svg(560, 110,
    rc(10, 10, 308, 38, { st: "var(--rose)", f: "var(--rose-dim)" }) + tx(164, 34, "v1: one \"name\" field  (40 million)", { a: "middle", s: 13 }) +
    rc(318, 10, 192, 38, { st: "var(--amber)", f: "var(--amber-dim)" }) + tx(414, 34, "v2: first + last  (25 M)", { a: "middle", s: 13 }) +
    rc(510, 10, 40, 38, { st: "var(--teal)", f: "var(--teal-dim)" }) + tx(530, 34, "v3", { a: "middle", s: 12 }) +
    tx(530, 72, "5 M", { a: "middle", s: 13, c: "var(--teal)" }) + ln(530, 52, 530, 62, "var(--teal)", 2) +
    tx(10, 96, "Total: 70 million user documents, none ever rewritten. v3 adds first, last and nickname.", { s: 12, c: "var(--text-dim)" }));

  B.add("ds-schema", [
    { type: "cat", q: "For each outcome, which approach is it a sign of?", buckets: ["Schema-on-write", "Schema-on-read"],
      items: [["A misspelt field name is quietly stored", 1], ["Text typed into a number column is refused at insert", 0], ["Reading code must cope with old and new shapes side by side", 1], ["Every reader can rely on each row having the same columns", 0], ["Data from an outside partner is saved as it arrives, whatever its shape", 1], ["Adding a field to existing data needs a migration step", 0]],
      why: "Schema-on-write checks the shape when data goes in, so readers can trust it, but changes need migrations. Schema-on-read accepts anything and pushes the checking, the old-and-new handling and the typo risk onto the readers." },
    { type: "pick", q: "In a schema-on-read collection, the team counts which field names hold an email address. A search for exactly \"email\" is run. Tap every spelling that this search would miss.", fig: FIG_FIELDS, a: ["f2", "f3", "f4"],
      why: "Nothing enforced one spelling, so three variants crept in. The search only matches the exact name \"email\", so it silently skips 200 documents. That is the hidden cost of schema-on-read: the reader must know every shape that ever got written." },
    { type: "match", q: "Match each symptom to its most likely cause.",
      pairs: [["A report shows 12% of customers with no country", "Old documents were written before the field existed"], ["An insert fails with a type error", "The value does not fit the declared column type"], ["Both \"zip\" and \"postcode\" appear in one collection", "Writers followed different conventions and nothing enforced one"], ["A dashboard breaks after a team renames a field", "Readers still expect the old shape"]],
      why: "Each symptom traces to when the structure is checked. Missing and duplicate fields point to a store that never rejected anything. A type error is the schema doing its job. A rename breaks any reader that assumed the old name." },
    { type: "bug", q: "Old user documents hold one \"name\" typed by people, such as \"Mo Reid\" or \"Mary Ann Smith\". This reader must never crash. Click the faulty line.",
      code: ["def first_name(doc):", "    if \"first\" in doc:", "        return doc[\"first\"]", "    first, last = doc[\"name\"].split(\" \")", "    return first"], a: 3,
      why: "Unpacking into exactly two parts crashes for a name with three words (or one). With schema-on-read the reader cannot assume tidy data, so it should take just the part before the first space, for example doc[\"name\"].split(\" \")[0]." },
    { type: "mcq", q: "A new reader is written that understands only the v3 shape. About what share of the stored documents can it handle?", fig: FIG_SHAPES, o: ["About 7%", "About 35%", "About 60%"], a: 0,
      hint: "Add the three groups for the total (40 + 25 + 5 = 70 million), then compare 5 with 70.",
      why: "Only the 5 million v3 documents match, and 5 out of 70 is about 7%. The 35% and 60% choices are the v2 and v1 shares. Because old documents were never rewritten, every reader must keep handling all three shapes." },
  ]);

  /* ================= ds-graph ================= */
  const FIG_BRIDGE = (() => {
    const P = { A: [60, 45], B: [60, 155], C: [170, 100], D: [320, 100], E: [430, 45], F: [430, 155] };
    const E = [["A", "B"], ["A", "C"], ["B", "C"], ["C", "D"], ["D", "E"], ["D", "F"], ["E", "F"]];
    let s = E.map(([a, b]) => ln(P[a][0], P[a][1], P[b][0], P[b][1], "var(--line-2)", 3)).join("");
    Object.entries(P).forEach(([k, [x, y]]) => (s += pk(k, `<circle cx="${x}" cy="${y}" r="19" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>` + tx(x, y + 5, k, { a: "middle" }))));
    return svg(490, 200, s);
  })();

  const FIG_ONEWAY = (() => {
    const P = { D: [50, 100], P: [150, 100], Q: [250, 55], R: [350, 100], S: [150, 175], T: [50, 175] };
    const E = [["D", "P"], ["P", "Q"], ["Q", "R"], ["R", "P"], ["S", "P"], ["T", "S"]];
    let s = E.map(([a, b]) => arrow(P[a], P[b])).join("");
    Object.entries(P).forEach(([k, [x, y]]) => (s += pk(k, `<circle cx="${x}" cy="${y}" r="19" fill="var(--panel)" stroke="${k === "D" ? "var(--teal)" : "var(--blue)"}" stroke-width="3"/>` + tx(x, y + 5, k, { a: "middle" }))));
    return svg(420, 205, s + tx(405, 195, "D = depot", { a: "end", s: 12, c: "var(--text-dim)" }));
  })();

  const FIG_HOPS = table(["Hops from one person", "Stored as tables (ms)", "Stored as a graph (ms)"], [["1", "12", "8"], ["2", "90", "14"], ["3", "2,400", "20"]]);

  B.add("ds-graph", [
    { type: "pick", q: "Lines are friendships. If one person deletes their account, the network can split into two groups that no longer connect. Tap every person whose deletion would do that.", fig: FIG_BRIDGE, a: ["C", "D"],
      why: "C is the only link between A and B on one side and the rest, and D is the only link to E and F. Remove either and the groups separate. A, B, E and F each have another route, so the rest stays connected." },
    { type: "pick", q: "Arrows are one-way streets. A van starts at the depot D (green) and follows the arrows, for as many streets as it likes. Tap every other place it can reach.", fig: FIG_ONEWAY, a: ["P", "Q", "R"],
      why: "D goes to P, P to Q, Q to R. R only leads back to P. S and T point toward P but nothing points to them, so the van can never get there. Direction matters: a link in one direction does not give a path in the other." },
    { type: "cat", q: "In a property graph of people and companies, is each item a vertex, an edge, or a property?", buckets: ["Vertex", "Edge", "Property"],
      items: [["Ana", 0], ["Orbit Ltd", 0], ["\"works at\" between Ana and Orbit Ltd", 1], ["\"since 2019\", stored on the works-at link", 2], ["Ana's date of birth", 2], ["\"is friends with\" between two people", 1]],
      why: "Things are vertices and relationships are edges. Facts that describe one vertex (a birth date) or one edge (when the job began) are properties on it." },
    { type: "slider", q: "A friendship network has 1,000 people and each has 50 friends. Friendship is mutual and each friendship is stored as one edge. About how many edges are there?", min: 0, max: 100000, step: 5000, ans: 25000, tol: 5000, hint: "1,000 × 50 = 50,000 friend slots. Each edge uses up two of them (one at each end).",
      why: "Counting each person's friends gives 50,000, but that counts every friendship twice, once from each side. So there are 25,000 edges." },
    { type: "mcq", q: "The same friend network was queried both ways. At three hops, about how many times slower is the table version than the graph version?", fig: FIG_HOPS, o: ["About 6×", "About 30×", "About 120×"], a: 2,
      hint: "2,400 ÷ 20: halve both to get 1,200 ÷ 10.",
      why: "2,400 ÷ 20 = 120. The table time explodes with each extra hop because every hop is another join over the whole table, while the graph just follows stored links from where it stands." },
    { type: "bug", q: "A graph database holds people and the companies they work for. The team wants to answer \"who works with Ana?\" by following links. Click the line that blocks this.",
      code: ["vertex 1: Person   {name: \"Ana\"}", "vertex 2: Company  {name: \"Orbit Ltd\"}", "vertex 3: Person   {name: \"Bo\", employer: \"Orbit Ltd\"}", "edge 1 -> 2: WORKS_AT   {since: 2019}"], a: 2,
      why: "Bo's employer is stored as text inside a property, so there is no edge to follow. It should be an edge from Bo to Orbit Ltd. Then Ana to Orbit Ltd and back to Bo is a two-hop traversal." },
  ]);

  /* ================= ds-nosql ================= */
  const FIG_PKEYS = table(["Candidate key", "Distinct values", "Busiest value's share of writes"], [["Country code", "40", "35%"], ["Plan type", "3", "80%"], ["Order date", "1 (today)", "100%"], ["Customer ID", "2,000,000", "0.01%"]]);

  const FIG_FAMS = (() => {
    const panel = (x, y, id, inner) => pk(id, rc(x, y, 150, 120) + inner);
    let s = panel(6, 6, "A", mono(18, 38, "{ \"name\": \"Ana\",", { s: 12 }) + mono(18, 62, "  \"tags\": [...],", { s: 12 }) + mono(18, 86, "  \"town\": \"Hull\" }", { s: 12 }));
    s += panel(170, 6, "B", ["u:17", "u:18", "u:19", "u:20"].map((k, i) => mono(184, 34 + i * 25, k, { s: 12 }) + tx(236, 34 + i * 25, "→", { s: 12 }) + rc(252, 21 + i * 25, 50, 18, { rx: 4, f: "var(--bg-2)" })).join(""));
    const cell = (x, y, t, on) => rc(x, y, 28, 24, { rx: 3, f: on ? "var(--violet-dim)" : "var(--bg-2)", st: on ? "var(--violet)" : "var(--line)", sw: 1.5 }) + (on ? mono(x + 14, y + 16, t, { a: "middle", s: 12 }) : "");
    const rows = [[1, 1, 0, 0], [1, 0, 1, 1], [0, 1, 0, 0]];
    s += panel(6, 136, "C", rows.map((r, i) => r.map((on, j) => cell(20 + j * 31, 152 + i * 32, ["a", "b", "c", "d"][j], on)).join("")).join(""));
    s += panel(170, 136, "D", ln(220, 170, 290, 192, "var(--line-2)", 2.5) + ln(220, 170, 230, 232, "var(--line-2)", 2.5) + ln(230, 232, 290, 192, "var(--line-2)", 2.5) + [[220, 170], [290, 192], [230, 232]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>`).join(""));
    return svg(326, 262, s);
  })();

  B.add("ds-nosql", [
    { type: "mcq", q: "A key-value table is split into partitions by its partition key, and each partition lives on one server. Order writes arrive all day. Using the table, which partition key spreads the writes best?", fig: FIG_PKEYS, o: ["Country code", "Plan type", "Order date", "Customer ID"], a: 3,
      hint: "Look for many distinct values and no value that takes a big share.",
      why: "Customer ID has millions of values and no single one takes a noticeable share, so work spreads over all servers. Today's date puts every write on one partition. Plan type and country code leave one value with most or a third of the traffic." },
    { type: "cat", q: "Which NoSQL family fits each job best?", buckets: ["Document", "Key-value", "Wide-column", "Graph"],
      items: [["Look up a login session by its token", 1], ["Product pages where each item has its own attributes", 0], ["Suggest people two links away from you", 3], ["Rows that each carry their own mix of columns", 2], ["A blog post stored with nested comments, loaded as one unit", 0], ["A shopping basket fetched by user ID, never searched by contents", 1]],
      why: "Key-value suits fetch-by-key. Documents suit self-contained nested items with varying fields. Wide-column rows may differ in their columns. Graphs suit following links across several hops." },
    { type: "order", q: "A DynamoDB-style table has a partition key and a sort key. Put these steps in the order a lookup follows.", items: ["Take the partition key value from the request", "Use it to choose the partition, and so the server", "Within that partition, jump to the right sort key", "Read the item stored there"],
      why: "The partition key decides where the data lives. Inside that partition, items are ordered by sort key, which gives the exact position or range." },
    { type: "bug", q: "A team uses a plain key-value store for baskets. Click the line that the store is badly suited to, because it cannot find items by what is inside them.",
      code: ["store.set(\"basket:42\", basket_a)", "store.set(\"basket:43\", basket_b)", "mine = store.get(\"basket:42\")", "big = [b for b in store.all() if b.total > 50]"], a: 3,
      why: "Get and set by key are what the store does well. Asking for every basket with a total above 50 has no key to jump to, so it must read every value. A document store could be indexed on that field." },
    { type: "match", q: "Match each worry to the NoSQL aim that addresses it.",
      pairs: [["Traffic on a sale day is 20 times normal", "Scale out by adding machines"], ["Each product has different fields", "A flexible schema per item"], ["One data centre loses power but the site must keep answering", "Availability from copies on other machines"], ["A new hire must understand the design in a day", "Simplicity of design"]],
      why: "NoSQL stores stress simple design, horizontal scaling and availability. Per-item schemas are one of the ways they stay flexible and easy to adopt." },
    { type: "pick", q: "Four sample stores are drawn. Tap the wide-column store: table-like rows where each row has its own set of columns.", fig: FIG_FAMS, a: "C",
      why: "Panel C is the table with rows that fill different columns. A is a document with nested values, B is key-value (an opaque value behind each key) and D is a graph of vertices and edges." },
  ]);

  /* ================= ds-log ================= */
  const FIG_SEQ = table(["Task: store 100,000 records of 100 bytes", "Time on the same disk"], [["Append each record to the end of one file", "0.1 s"], ["Overwrite each record in place at scattered positions", "12 s"]]);

  const FIG_LOGH = (() => {
    const recs = ["bal = 100", "rent = 500", "bal = 80", "bal = 95", "rent = 520", "bal = 60"];
    let s = tx(8, 16, "log file, oldest first", { s: 12, c: "var(--text-dim)" });
    recs.forEach((r, i) => (s += pk("r" + (i + 1), rc(8 + (i % 3) * 112, 26 + Math.floor(i / 3) * 56, 106, 48) + tx(61 + (i % 3) * 112, 44 + Math.floor(i / 3) * 56, "#" + (i + 1), { a: "middle", s: 11, c: "var(--text-faint)" }) + mono(61 + (i % 3) * 112, 63 + Math.floor(i / 3) * 56, r, { a: "middle", s: 13 }))));
    return svg(346, 140, s);
  })();

  const FIG_LOGT = (() => {
    const recs = [["a", "5"], ["b", "7"], ["a", "9"], ["b", "✕ deleted"], ["c", "1"]];
    let s = "";
    recs.forEach(([k, v], i) => { const x = 8 + (i % 3) * 116, y = 8 + Math.floor(i / 3) * 56, dl = v[0] === "✕"; s += rc(x, y, 110, 48, { st: dl ? "var(--rose)" : "var(--line-2)", f: dl ? "var(--rose-dim)" : "var(--panel)" }) + tx(x + 55, y + 18, "#" + (i + 1), { a: "middle", s: 11, c: "var(--text-faint)" }) + mono(x + 55, y + 38, dl ? `${k}: deleted` : `${k} = ${v}`, { a: "middle", s: 13 }); });
    return svg(356, 120, s);
  })();

  B.add("ds-log", [
    { type: "mcq", q: "Same disk, same records. What mostly explains the gap in the table?", fig: FIG_SEQ,
      o: ["Appends carry on where the last one ended, but scattered writes make the disk jump", "Appended records are smaller than overwritten ones, so less data is written overall", "Appends wait in memory until the whole batch is ready, then reach the disk once", "Log files are kept in a faster part of the disk than ordinary data files are"], a: 0,
      why: "The gap is about 120 times (12 s ÷ 0.1 s). Appending is sequential, so there is no seeking. Overwriting scattered places forces the disk to move for every record. That is why databases like append-only logs for writes." },
    { type: "match", q: "Match each property of an append-only log to the reason behind it.",
      pairs: [["Writes are fast", "Every record goes straight onto the end, with no seeking"], ["Recovery after a crash is simple", "Earlier records are never overwritten, so they stay intact"], ["Reads without an index are slow", "The only way to find a key is to scan the records"], ["The file keeps growing", "Old values and deleted keys are never removed in place"]],
      why: "All four follow from \"only ever add to the end\": cheap writes and safe history on one side, scans and growth on the other." },
    { type: "pick", q: "Every record is kept. What was the value of bal immediately before record #4 was appended? Tap the record that tells you.", fig: FIG_LOGH, a: "r3",
      why: "The newest bal before #4 is #3 (bal = 80). Record #4 itself is the value after, and #1 is older but was already replaced. A log keeps history, so \"as it was then\" is a scan that stops earlier." },
    { type: "slider", q: "Appending to a log runs at 200 MB per second. Each record is 100 bytes. About how many million records can be written per second?", min: 0, max: 5, step: 0.5, ans: 2, tol: 0.5, unit: " million", hint: "1 MB holds 10,000 records of 100 bytes. So 200 MB holds 200 × 10,000.",
      why: "200 MB × 10,000 records per MB = 2,000,000 records a second. Sequential appends are fast enough that the disk is rarely the limit." },
    { type: "bug", q: "This delete() edits the file in place instead of using the log's one rule: only ever append. Click the line that breaks that rule.",
      code: ["def delete(key):", "    lines = open(\"db.log\").read().splitlines()", "    keep = [x for x in lines if not x.startswith(key + \",\")]", "    open(\"db.log\", \"w\").write(\"\\n\".join(keep))"], a: 3,
      why: "Reopening the file in write mode wipes it and rewrites everything. A crash halfway loses the whole log, and history is gone. The log way is to append a tombstone record for the key." },
    { type: "multi", q: "Read this log. Select all statements that are true.", fig: FIG_LOGT,
      o: ["Scanning from the newest end finds a's current value after reading three records", "Scanning from the oldest end can stop at record #1 and answer for a", "b reads as deleted, even though record #2 still holds a value for it", "Record #3 erased record #1 from the file"], a: [0, 2],
      why: "From the newest end the order is #5, #4, #3, and #3 gives a = 9. Scanning from the oldest end cannot stop early, because later records may override. The tombstone in #4 hides #2. Nothing is erased: #3 only supersedes #1." },
  ]);

  /* ================= ds-hashidx ================= */
  const FIG_TOMB = (() => {
    const seg = (y, label, recs, dim) => tx(8, y + 14, label, { s: 12, c: "var(--text-dim)" }) + recs.map(([t, bad], i) => rc(8 + i * 140, y + 20, 130, 34, { st: bad ? "var(--rose)" : "var(--line-2)", f: bad ? "var(--rose-dim)" : "var(--panel)", d: dim ? "5 4" : "" }) + mono(73 + i * 140, y + 42, t, { a: "middle", s: 13 })).join("");
    return svg(290, 262,
      seg(2, "S1 (oldest, not merged)", [["k = 4"], ["m = 2"]], true) + seg(60, "S2 (to be merged)", [["m = 8"], ["n = 1"]]) + seg(118, "S3 (to be merged)", [["k: deleted", 1], ["p = 3"]]) +
      tx(8, 198, "Compaction merges only S2 and S3", { s: 12, c: "var(--text-dim)" }) + tx(8, 216, "into a new segment. S1 stays as it is.", { s: 12, c: "var(--text-dim)" }));
  })();

  const FIG_IDXSIZE = table(["Store", "Distinct keys", "Typical value size", "Updates a day"], [["Photos", "2 million", "1 MB", "10 thousand"], ["Clicks", "500 million", "20 bytes", "2 million"], ["Profiles", "10 million", "100 KB", "50 million"]]);

  const FIG_STALE = (() => {
    const rows = [["ia", "a", "S1 @0"], ["ib", "b", "S2 @0"], ["ic", "c", "S1 @40"]];
    let s = tx(8, 14, "in-memory index", { s: 12, c: "var(--text-dim)" });
    rows.forEach(([id, k, t], i) => (s += pk(id, rc(8, 22 + i * 44, 160, 36) + mono(20, 46 + i * 44, `${k} → ${t}`))));
    s += tx(196, 14, "segments on disk", { s: 12, c: "var(--text-dim)" });
    const rec = (x, y, t) => rc(x, y, 76, 30, { rx: 6 }) + mono(x + 38, y + 20, t, { a: "middle", s: 12 });
    s += tx(196, 38, "S1 (older)", { s: 12 }) + rec(196, 44, "a=1 @0") + rec(280, 44, "c=5 @40");
    s += tx(196, 100, "S2 (newer)", { s: 12 }) + rec(196, 106, "b=2 @0") + rec(280, 106, "c=9 @40");
    return svg(364, 160, s);
  })();

  B.add("ds-hashidx", [
    { type: "mcq", q: "Compaction is about to merge S2 and S3 into one new segment. Key k has a tombstone in S3. What should the merged segment do with it?", fig: FIG_TOMB,
      o: ["Keep it: S1 still holds k = 4, which would otherwise come back", "Drop it: compaction removes any key whose newest record is a deletion", "Drop it: the in-memory index forgets k, so the files no longer matter"], a: 0,
      why: "S1 is not part of this merge, so an older k = 4 still sits there. If the tombstone vanished, a read (or an index rebuilt after a restart) would find 4. The tombstone can only go when no older segment holds the key. The index is rebuilt from the files, so it cannot be relied on." },
    { type: "bug", q: "A hash-indexed log deletes a key like this. The server restarts and rebuilds its index by replaying the log. Click the line that lets the deleted key come back.",
      code: ["def delete(key):", "    if key in index:", "        del index[key]", "    return True"], a: 2,
      why: "Only the in-memory index forgets the key. The log still holds its old value and no tombstone, so the replay after a restart finds it again. The delete must also append a tombstone record." },
    { type: "match", q: "Match each design change to its main consequence.",
      pairs: [["Make segments much smaller", "More files to check, and compaction runs more often"], ["Keep the hash index on disk instead of memory", "Every lookup pays an extra disk read"], ["Ask for every key between two values", "No shortcut: a hash gives no order"], ["Let one key be rewritten millions of times", "Index stays small, but the log grows until compaction"]],
      why: "The hash index trades memory for one-jump reads. Moving it to disk loses that speed, and hashing scatters keys so ranges cannot use it. Rewrites cost disk space, not index space, until compaction cleans up." },
    { type: "mcq", q: "Which store needs the most memory for its hash index?", fig: FIG_IDXSIZE, o: ["Photos", "Clicks", "Profiles"], a: 1,
      hint: "The index holds one small entry per key. Does value size or update count change that?",
      why: "The index has one entry per distinct key, whatever the value size or how often it changes. Clicks has 500 million keys, far more than the others. Photos has the biggest values and Profiles the most updates, but neither adds index entries." },
    { type: "slider", q: "After a crash, the server rebuilds its hash index by reading all its segments, 20 GB in total, at 400 MB per second. About how many seconds does the rebuild take?", min: 0, max: 120, step: 10, ans: 50, tol: 15, unit: " s", hint: "20 GB is 20,000 MB. How many lots of 400 fit in 20,000? Try 20,000 ÷ 400 = 200 ÷ 4.",
      why: "20,000 MB ÷ 400 MB/s = 50 s. The index lives in memory, so every restart has to scan the files again. That is a real cost of a hash index and why some stores save snapshots of it." },
    { type: "pick", q: "A get for c returns 5, but c was updated later. Tap the index entry that is out of date.", fig: FIG_STALE, a: "ic",
      why: "c = 9 sits in the newer segment S2, but the index still points at the old copy in S1. On every write the index must be updated to the newest offset. Entries a and b point at their only records." },
  ]);

  /* ================= ds-sstable ================= */
  const KEYS = ["b", "c", "e", "g", "h", "j", "m", "n", "p", "q", "s", "t"];
  const FIG_SPARSE = (() => {
    let s = tx(8, 16, "sparse index (every 4th key)", { s: 12, c: "var(--text-dim)" });
    [["ib", "b", 0], ["ih", "h", 4], ["ip", "p", 8]].forEach(([id, k, i], j) => (s += pk(id, rc(8 + j * 100, 24, 92, 34) + mono(54 + j * 100, 46, `${k} → #${i}`, { a: "middle" }))));
    s += tx(8, 90, "sorted segment on disk", { s: 12, c: "var(--text-dim)" });
    KEYS.forEach((k, i) => { const x = 8 + (i % 6) * 52, y = 98 + Math.floor(i / 6) * 58; s += rc(x, y, 46, 34, { rx: 6 }) + mono(x + 23, y + 22, k, { a: "middle" }) + tx(x + 23, y + 48, "#" + i, { a: "middle", s: 10, c: "var(--text-faint)" }); });
    return svg(320, 216, s);
  })();

  const FIG_RANGE = (() => {
    const ks = ["a", "c", "d", "e", "f", "h", "k", "m"];
    let s = tx(8, 16, "one sorted segment", { s: 12, c: "var(--text-dim)" });
    ks.forEach((k, i) => (s += pk("k" + k, rc(8 + (i % 4) * 70, 26 + Math.floor(i / 4) * 52, 64, 42) + mono(40 + (i % 4) * 70, 53 + Math.floor(i / 4) * 52, k, { a: "middle", s: 15 }))));
    return svg(296, 134, s);
  })();

  B.add("ds-sstable", [
    { type: "pick", q: "A read for key n uses the sparse index to decide where to start scanning the sorted segment. Tap the index entry it jumps to.", fig: FIG_SPARSE, a: "ih",
      why: "Keys are sorted, so n must lie at or after the largest indexed key that is not past it. That is h (position 4), and a short scan h, j, m, n finds it. Entry p is already beyond n, and b would scan further than needed." },
    { type: "bug", q: "Merging an old and a new sorted segment (the leftover tails are handled after the loop). When the same key is in both, the newer value must win. Click the faulty line.",
      code: ["while i < len(old) and j < len(new):", "    if old[i][0] < new[j][0]:", "        out.append(old[i]); i += 1", "    elif old[i][0] > new[j][0]:", "        out.append(new[j]); j += 1", "    else:", "        out.append(old[i]); i += 1; j += 1"], a: 6,
      why: "When the keys are equal, this keeps the old record and drops the new one, so stale values survive the merge. It should append new[j]. Both pointers move on either way." },
    { type: "pick", q: "A range query asks for every key from d to h inclusive. Tap the records it returns.", fig: FIG_RANGE, a: ["kd", "ke", "kf", "kh"],
      why: "Because the segment is sorted, the answer is one block: find d, then read along until you pass h. A hash index would give no such block, since its keys are scattered." },
    { type: "slider", q: "A 64 MB segment has a sparse index with one entry for each 4 KB block. About how many index entries are there, in thousands?", min: 0, max: 100, step: 2, ans: 16, tol: 3, unit: " thousand", hint: "64 MB is about 64,000 KB. How many 4 KB blocks is that? 64,000 ÷ 4.",
      why: "64,000 KB ÷ 4 KB = 16,000 entries. The index stays small because it covers blocks, not every key; a scan inside one block finds the record." },
    { type: "match", q: "Match each event to what follows.",
      pairs: [["The memtable fills up", "It is written out as a new sorted SSTable"], ["Many small SSTables pile up", "Reads check more files, so they are merged"], ["A key is in no segment at all", "The read checks every place before saying not found"], ["The newest segment holds a tombstone for the key", "The read stops there and reports not found"]],
      why: "Reads go newest to oldest, so a newer tombstone settles the answer at once. A missing key is the worst case, because every file must be ruled out. Merging keeps that number of files small." },
    { type: "mcq", q: "Why does the memtable keep its keys in a sorted tree instead of a plain hash map?", o: ["A flush can then write sorted keys to a new file in one pass", "A read can skip the SSTables and answer from memory every time", "Deleted keys vanish from memory without needing tombstones", "It uses less memory than a hash map could ever manage"], a: 0,
      why: "An SSTable must be sorted. If the memtable already holds keys in order, a flush is just a sequential walk of the tree. A hash map would need a full sort first. The tree changes neither read coverage, tombstones nor memory use." },
  ]);
})();

/* DS revision bank, visual and varied questions, part 2.
   Lecture 2 (models, schema, graphs, NoSQL) and Lecture 3 (log, hash index, SSTable).
   Every figure is needed to answer; numbers verified with node. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto">${body}</svg>`;
  const tx = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "start"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "var(--mono)" : "var(--sans)"}" fill="${o.c || "var(--text)"}">${esc(s)}</text>`;
  const rc = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 3, extra = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const table = (head, rows) => `<table class="t"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const chips = (list) => `<div style="display:flex;flex-wrap:wrap;gap:6px">${list.map((s, i) => `<span style="border:2px solid var(--line-2);border-radius:8px;padding:3px 8px;background:var(--panel);font:800 13px var(--mono)"><span style="color:var(--text-faint)">${i + 1}</span> ${esc(s)}</span>`).join("")}</div>`;

  /* Stacked segment rows (oldest at the top). rows: [{id, label, recs:[[key, value, colour?]]}] */
  function segRows(rows, { pick = false, head = "", w = 560 } = {}) {
    const top = head ? 34 : 6;
    let b = head ? tx(8, 22, head, { m: true, s: 13, c: "var(--text-dim)" }) : "";
    rows.forEach((r, i) => {
      const y = top + i * 54;
      b += tx(8, y + 28, r.label, { s: 12, c: "var(--text-dim)" });
      r.recs.forEach(([k, v, c], j) => {
        const x = 150 + j * 130, col = c || "var(--line-2)";
        const g = rc(x, y + 6, 118, 36, { st: col, f: c ? "var(--rose-dim)" : "var(--panel)" }) + tx(x + 59, y + 30, `${k} = ${v}`, { a: "middle", m: true, s: 14 });
        b += pick ? pk(r.id + k, g) : g;
      });
    });
    return svg(w, top + rows.length * 54, b);
  }

  /* ================= ds-models ================= */
  const dotPanel = (ox, id, title, links) => {
    const L = [0, 1, 2].map((i) => [ox + 45, 78 + i * 38]), R = [0, 1, 2].map((i) => [ox + 135, 78 + i * 38]);
    let s = rc(ox + 4, 6, 172, 166, { rx: 12 }) + tx(ox + 90, 28, title, { a: "middle", s: 14 }) + tx(ox + 45, 52, "left", { a: "middle", s: 11, c: "var(--text-faint)" }) + tx(ox + 135, 52, "right", { a: "middle", s: 11, c: "var(--text-faint)" });
    links.forEach(([a, b]) => (s += ln(L[a][0], L[a][1], R[b][0], R[b][1], "var(--blue)", 2.5)));
    L.forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="9" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>`));
    R.forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="9" fill="var(--panel)" stroke="var(--amber)" stroke-width="3"/>`));
    return pk(id, s);
  };
  const FIG_DOTS = svg(580, 180, dotPanel(0, "a", "Set A", [[0, 0], [0, 1], [1, 2]]) + dotPanel(200, "b", "Set B", [[0, 0], [0, 1], [1, 1], [1, 2], [2, 0]]) + dotPanel(400, "c", "Set C", [[0, 0], [1, 1], [2, 2]]));

  const mono = (x, y, s, o = {}) => tx(x, y, s, { m: true, s: 13, ...o });
  const FIG_POST = svg(560, 230,
    pk("title", rc(10, 6, 540, 34) + mono(24, 28, `"title": "Sourdough tips",`)) +
    pk("author", rc(10, 46, 540, 78) + mono(24, 68, `"author": {`) + mono(44, 90, `"name": "Mo Reid",  "town": "Leeds"`) + mono(24, 112, `},`)) +
    pk("published", rc(10, 130, 540, 34) + mono(24, 152, `"published": "2 March",`)) +
    pk("comments", rc(10, 170, 540, 52) + mono(24, 192, `"comments": [ {"text": "Lovely crumb!"},`) + mono(24, 212, `              {"text": "Will try this"} ]`)));

  const FIG_TEXTFIELD = table(["id", "name", "positions (one text field)"], [
    ["1", "Ana", "Chef at Orbit Ltd; Baker at Nim Cafe"],
    ["2", "Bo", "Barista at Nim Cafe"],
    ["3", "Cy", "Chef at Orbit Ltd; Chef at Dune Bistro; Waiter at Pia's"],
  ]);

  B.add("ds-models", [
    { type: "pick", q: "Each dot is a record and each line is a link between a left record and a right record. Judge only from the lines: which set shows a many-to-many relationship?", fig: FIG_DOTS, a: "b",
      why: "In Set B some left records link to several right records and some right records link back to several left ones, so both sides are many. Set A is one-to-many (every right dot has at most one left), and Set C is one-to-one." },
    { type: "bug", q: "A normalised design keeps users, positions and education in separate tables, each child row pointing at its user. This code builds the profile page for user 42. Click the faulty line.",
      code: ["user = users.find(id = 42)", "jobs = positions.find(id = 42)", "schools = education.find(user_id = 42)", "page = { user, jobs, schools }"], a: 1,
      why: "A positions row's own id is just that row's number. To get user 42's positions you must match the foreign key column (user_id = 42), as the education line does." },
    { type: "cat", q: "A cooking site uses a document database. For each piece of data, should it sit inside the document that uses it, or be its own shared record?", buckets: ["Embed inside the document", "Keep as its own shared record"],
      items: [["The ordered steps of one recipe, only ever shown on that recipe's page", 0], ["The restaurant that 4,000 chef profiles list as their employer, and which sometimes renames itself", 1], ["The address history of one customer, read only with that customer", 0], ["A band credited on thousands of albums, searched on its own", 1], ["The line items of one order, always read together with the order", 0], ["A topic tag used by thousands of posts and browsed on its own page", 1]],
      why: "Data owned by one parent and always read with it fits inside the document (locality, one read). Data shared by many documents, or used on its own, is better kept once, otherwise every copy has to be edited when it changes." },
    { type: "multi", q: "This design stores each person's positions as plain text in one field. Which jobs does it make hard for the database? Select all that apply.", fig: FIG_TEXTFIELD,
      o: ["Find every person who ever worked at Orbit Ltd", "Count how many positions each person has", "Show one person's name", "Load one person by their id"], a: [0, 1],
      why: "The database sees the positions field as opaque text, so it cannot index inside it, match on employer or count entries without custom string handling. Reading a name or an id is untouched." },
    { type: "pick", q: "A blog keeps each post as one document, like the one below. Mo has written 300 posts, so Mo's details are copied into every one of them. Mo moves house. Tap the part that would need editing in all 300 documents.", fig: FIG_POST, a: "author",
      why: "The author block is a many-to-one link flattened into a copy. The title, date and comments belong to this one post, but Mo's town is repeated in every post Mo wrote, so one change means 300 edits (or a shared record and a join)." },
    { type: "bug", q: "A university stores students and courses in tables. A student can take many courses and a course has many students. This setup script hides one mistake. Click the faulty line.",
      code: ["students(id, name)", "courses(id, title)", "enrolments(student_id, course_id)   -- one row per pairing", "add enrolment (5, 2)  and  add enrolment (5, 9)", "students.update(id = 5, course_id = 9)"], a: 4,
      why: "A single course_id column in students can hold only one course, so it cannot describe a many-to-many link. The separate enrolments table already records both pairings. The last line is the mistake." },
  ]);

  /* ================= ds-schema ================= */
  const card = (x, id, lines) => pk(id, rc(x, 8, 128, 112, { rx: 10 }) + lines.map((l, i) => tx(x + 10, 34 + i * 22, l, { m: true, s: 12 })).join("") + tx(x + 64, 140, id.toUpperCase(), { a: "middle", s: 13, c: "var(--text-faint)" }));
  const FIG_CARDS = svg(560, 150, card(4, "d1", ["name: Kettle", "price: 20"]) + card(144, "d2", ["name: Lamp", "price: 15", "voltage: 12"]) + card(284, "d3", ["name: Gift card", "value: 25"]) + card(424, "d4", ["name: Mug", "price: 6", "colour: red"]));

  const FIG_SCHEMA = `<div style="font:800 13px var(--sans);margin-bottom:6px">Schema of the table <b>orders</b></div>` + table(["column", "type", "rule"], [["id", "whole number", "required"], ["qty", "whole number", "required"], ["note", "text", "optional"]]);

  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const FIG_TIME = svg(560, 170,
    months.map((m, i) => tx(50 + i * 40, 150, m, { a: "middle", s: 13, c: "var(--text-dim)" })).join("") +
    rc(30, 20, 120, 40, { st: "var(--blue)" }) + tx(90, 45, "{ name }", { a: "middle", m: true }) +
    rc(150, 20, 200, 40, { st: "var(--amber)" }) + tx(250, 45, "{ first, last }", { a: "middle", m: true }) +
    rc(350, 20, 160, 40, { st: "var(--violet)" }) + tx(430, 45, "{ first, last, title }", { a: "middle", m: true, s: 12 }) +
    tx(30, 84, "Code changes deployed: Jan, Apr and Sep. Old documents were never rewritten.", { s: 12, c: "var(--text-dim)", w: 700 }) +
    ln(30, 124, 510, 124, "var(--line-2)", 2) + `<path d="M510 108 v32" stroke="var(--rose)" stroke-width="3"/>` + tx(512, 104, "now", { a: "middle", s: 12, c: "var(--rose)" }));

  B.add("ds-schema", [
    { type: "pick", q: "A shop's collection has no enforced schema. The basket code runs total = sum of doc.price over every document. Tap the document that this code cannot handle.", fig: FIG_CARDS, a: "d3",
      why: "Schema-on-read means nothing stopped the gift card being saved with value instead of price. The reading code meets the surprise: it must either check for a missing price or use the other field. Extra fields like voltage or colour do no harm to a sum of prices." },
    { type: "order", q: "A document store is changing from one \"name\" field to \"first\" and \"last\", with 50 million documents. Put a safe, gradual migration in order.",
      items: ["Deploy code that reads both the old and the new shape", "Make every new write use the new shape", "Rewrite old documents when they are read, or in the background", "Delete the old-shape handling once none remain"],
      why: "Readers must cope with both shapes before anything is written in the new one, otherwise they break. Only when no old documents are left is it safe to remove the old-shape code." },
    { type: "cat", q: "For each job, does keeping a document's data together in one stored piece (locality) help or hurt?", buckets: ["Locality helps", "Locality hurts"],
      items: [["Show one order with all its lines and delivery notes", 0], ["List only the titles of 10,000 articles that each hold 3 MB of images", 1], ["Open a profile page that needs name, positions, education and contacts", 0], ["Chart one tiny number from every one of a million large documents", 1], ["Change a single small field inside a very large document", 1], ["Load a recipe with its steps and ingredients in one go", 0]],
      why: "Locality pays off when you want most of a document in one read. It hurts when you want a small part of many big documents, because the whole of each one is still loaded (or rewritten)." },
    { type: "match", q: "A relational table is declared as below (schema-on-write). Match each incoming record to what the database does with it.", fig: FIG_SCHEMA,
      pairs: [["{ id: 1, qty: \"two\" }", "Rejected: qty is the wrong type"], ["{ id: 2, note: \"hi\" }", "Rejected: required qty is missing"], ["{ id: 3, qty: 4 }", "Accepted"], ["{ id: 4, qty: 5, colour: \"red\" }", "Rejected: no such column"]],
      why: "With schema-on-write the structure is checked when data is stored: types, required fields and the list of columns are all enforced. A document store without a schema would have accepted all four." },
    { type: "mcq", q: "The team never rewrote old documents. Looking at the timeline, how many different shapes might the reading code meet in December?", fig: FIG_TIME,
      o: ["1", "2", "3", "4"], a: 2,
      why: "Documents written in each period keep the shape they were saved in, so old { name } documents, { first, last } documents and { first, last, title } documents all still sit in the store. With schema-on-read, the code carries that history.", hint: "Each deployment created a new shape, and nothing removed the old ones." },
    { type: "bug", q: "A team explains why partner product feeds go into a schema-on-read store. One reason is wrong. Click it.",
      code: ["Partners add and rename fields without telling us.", "So the database cannot reject their uploads for us.", "So our code never has to handle a missing or renamed field.", "We interpret and tidy each document as we read it."], a: 2,
      why: "Schema-on-read moves the checking into the application. Because nothing is enforced on write, the reading code has to be ready for missing and renamed fields." },
  ]);

  /* ================= ds-graph ================= */
  const Qf = NIC.qfig;
  const FIG_FOLLOW = Qf.graph({ A: [50, 130], B: [140, 60], C: [140, 200], D: [250, 100], E: [250, 200], F: [360, 60], G: [360, 200] },
    [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["C", "E"], ["D", "F"], ["E", "G"]], { pick: "nodes", directed: true, w: 420, h: 260, hl: { A: "var(--teal)" } });

  const FIG_TABLES = `<div style="display:grid;grid-template-columns:1fr 1.2fr;gap:12px;align-items:start"><div><div style="font:800 13px var(--sans);margin-bottom:4px">Vertices</div>${table(["id", "label", "name"], [["1", "Person", "Mia"], ["2", "Person", "Leo"], ["3", "Place", "Cafe Nim"], ["4", "Person", "Zed"]])}</div><div><div style="font:800 13px var(--sans);margin-bottom:4px">Edges</div>${table(["id", "from", "label", "to"], [["e1", "1", "KNOWS", "2"], ["e2", "2", "VISITED", "3"], ["e3", "4", "VISITED", "3"], ["e4", "4", "KNOWS", "1"]])}</div></div>`;

  const FIG_PROPS = svg(560, 190,
    rc(10, 40, 160, 100, { st: "var(--blue)", rx: 14 }) + tx(90, 66, "Ana", { a: "middle", s: 15 }) + tx(90, 88, "(Person)", { a: "middle", s: 12, c: "var(--text-dim)" }) + tx(90, 114, "born: 1990", { a: "middle", m: true, s: 12 }) +
    rc(390, 40, 160, 100, { st: "var(--amber)", rx: 14 }) + tx(470, 66, "Orbit Ltd", { a: "middle", s: 15 }) + tx(470, 88, "(Company)", { a: "middle", s: 12, c: "var(--text-dim)" }) + tx(470, 114, "city: Leeds", { a: "middle", m: true, s: 12 }) +
    ln(172, 90, 386, 90, "var(--line-2)", 3, 'marker-end="url(#ga)"') + `<defs><marker id="ga" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-2)"/></marker></defs>` +
    tx(280, 78, "WORKS_AT", { a: "middle", s: 13, c: "var(--text-dim)" }));

  B.add("ds-graph", [
    { type: "pick", q: "Arrows mean \"follows\". Asha (A, in green) wants suggestions. Tap everyone she reaches in exactly two follow hops, not one and not three.", fig: FIG_FOLLOW, a: ["D", "E"],
      why: "One hop from A reaches B and C. One more hop from those reaches D (from B or C) and E (from C). F and G need a third hop. This is why a graph is good at \"friends of friends\": each hop just follows the edges leaving a vertex." },
    { type: "mcq", q: "Using only these two tables, which person does Mia KNOW who has also VISITED Cafe Nim?", fig: FIG_TABLES,
      o: ["Leo", "Zed", "Leo and Zed", "Nobody"], a: 0,
      why: "Mia's outgoing KNOWS edge (e1) goes to Leo, and Leo has a VISITED edge (e2) to Cafe Nim. Zed visited the cafe too, but the KNOWS edge e4 points from Zed to Mia, which is the other direction.", hint: "Start at vertex 1 and follow only edges that leave it with the label KNOWS." },
    { type: "cat", q: "Sort each query by how a graph database answers it.", buckets: ["Start at one vertex and follow edges outward", "Needs a pass over everything"],
      items: [["Everyone within three referrals of one doctor", 0], ["The average age of all patients", 1], ["The fewest changes between two stations", 0], ["The total number of trips made this year", 1], ["Which cafes the friends of Mia have visited", 0], ["The oldest account across the whole network", 1]],
      why: "Traversals touch only the neighbourhood around a start vertex, following the edges stored with each vertex. Whole-dataset summaries have to look at every vertex or edge, whichever model holds them." },
    { type: "bug", q: "This traversal should suggest new people for Ola to follow: friends of friends who are not already connected to her. Click the faulty line.",
      code: ["start = vertex(\"Ola\")", "friends = start.out(\"FOLLOWS\")", "fof = friends.out(\"FOLLOWS\")", "suggestions = fof", "show(suggestions)"], a: 3,
      why: "Friends of friends include people Ola already follows and often Ola herself (a friend follows her back). Remove start and friends from fof before suggesting anyone." },
    { type: "slider", q: "Everyone follows exactly 10 accounts, with no overlaps. Starting from one person, about how many accounts could you reach in exactly three hops?", min: 0, max: 2000, step: 100, ans: 1000, tol: 300, unit: " accounts",
      why: "Each hop multiplies the reach by 10: 10 after one hop, 100 after two, 1,000 after three. Fan-out grows fast, which is why graph stores keep each vertex's edges close at hand.", hint: "10 × 10 = 100, then × 10 again." },
    { type: "multi", q: "In a property graph, which of these facts should be stored as properties on the edge between Ana and Orbit Ltd, not on either vertex? Select all that apply.", fig: FIG_PROPS,
      o: ["The year Ana started at Orbit Ltd", "Ana's year of birth", "Ana's job title at Orbit Ltd", "The city where Orbit Ltd is based"], a: [0, 2],
      why: "A property belongs on the edge when it describes the relationship itself. When she started and her title there exist only because of the WORKS_AT link. Her birth year belongs to Ana, and the city belongs to the company." },
  ]);

  /* ================= ds-nosql ================= */
  const rowsKV = [["r1", "S-A", "09:00", "11"], ["r2", "S-A", "09:20", "12"], ["r3", "S-A", "09:40", "14"], ["r4", "S-A", "10:00", "15"], ["r5", "S-B", "09:20", "20"], ["r6", "S-B", "09:40", "21"], ["r7", "S-C", "09:00", "8"]];
  const FIG_KV = svg(460, 28 + rowsKV.length * 34 + 6,
    tx(30, 20, "Sensor (partition key)", { s: 12, c: "var(--text-dim)" }) + tx(210, 20, "Time (sort key)", { s: 12, c: "var(--text-dim)" }) + tx(360, 20, "Temp", { s: 12, c: "var(--text-dim)" }) +
    rowsKV.map(([id, s, t, v], i) => pk(id, rc(8, 28 + i * 34, 444, 30) + tx(30, 49 + i * 34, s, { m: true }) + tx(210, 49 + i * 34, t, { m: true }) + tx(360, 49 + i * 34, v, { m: true }))).join(""));

  const dcard = (x, lines) => rc(x, 6, 170, 100, { rx: 10 }) + lines.map((l, i) => tx(x + 12, 32 + i * 22, l, { m: true, s: 12 })).join("");
  const FIG_ITEMS = svg(560, 116, dcard(4, ["title: Dune", "author: Herbert", "pages: 320"]) + dcard(194, ["title: Alien", "director: Scott", "minutes: 117"]) + dcard(384, ["title: Torch", "price: 40", "voltage: 5"]));

  const FIG_SPARSE = table(["Row", "Columns this row actually has"], [["1", "name, age"], ["2", "name, city, phone"], ["3", "name, age, city"], ["4", "name, plan"]]);

  B.add("ds-nosql", [
    { type: "pick", q: "A store keeps these rows grouped by partition key and ordered by sort key. A query asks for sensor S-A's readings from 09:20 to 09:40 inclusive. Tap every row it returns.", fig: FIG_KV, a: ["r2", "r3"],
      why: "The partition key picks the group (S-A only), and the sort key then gives a range inside it (09:20 to 09:40). The S-B rows have matching times but the wrong partition, and the other S-A rows fall outside the range." },
    { type: "cat", q: "Sort these jobs by how well a pure key-value store handles them.", buckets: ["Fits a key-value store", "Awkward for a key-value store"],
      items: [["Fetch one player's session by its session ID", 0], ["Find every session started from Leeds", 1], ["Read a sensor's readings between two times inside one partition", 0], ["Join each order with its customer's details", 1], ["Find the shortest chain of introductions between two people", 1], ["Overwrite a basket after every click", 0]],
      why: "Key-value stores are built for lookups by key (and ranges on a sort key within one partition). Searching by values, joining and path-finding need a different model or a lot of scanning." },
    { type: "bug", q: "A team designs a key-value table for click events, spread over 10 servers by hashing the partition key. At peak 50,000 writes a second arrive and one server melts while the other nine idle. Click the line that causes it.",
      code: ["Table: Clicks", "Partition key: today's date", "Sort key: time of click", "Servers: 10, partitions spread by hashing the partition key", "Traffic: 50,000 writes a second, all for today"], a: 1,
      why: "Every click today has the same partition key, so every write hashes to the same partition on the same server. A key with many different values (such as a user or session ID) spreads writes across all ten servers." },
    { type: "multi", q: "These three documents sit in one document-store collection. Select all statements that are true.", fig: FIG_ITEMS,
      o: ["A query for pages above 300 can only ever match the book", "The store would reject the film because it has no pages field", "Code that totals price over the collection must cope with documents that lack one", "Each of the three shapes needs its own database server"], a: [0, 2],
      why: "Documents in a collection may differ, so nothing is rejected, but the application has to expect missing fields. Fields only match the documents that have them. Shapes do not need separate servers." },
    { type: "mcq", q: "A wide-column store holds these four rows, each with only the columns shown. A fixed-column table would need one column for every name used by any row. How many cells would be empty in that table?", fig: FIG_SPARSE,
      o: ["6", "10", "14", "20"], a: 1,
      why: "Five distinct column names (name, age, city, phone, plan) across four rows make 20 cells, but only 2 + 3 + 3 + 2 = 10 hold data, so 10 are empty. A wide-column row stores just the columns it has.", hint: "Count the distinct names, multiply by 4 rows, then take away the cells that hold data." },
    { type: "slider", q: "A document collection holds 600 GB. Each server can store 150 GB, and every item is kept on 3 different servers so the data stays available if some machines fail. How many servers does the cluster need?", min: 0, max: 20, step: 1, ans: 12, tol: 1, unit: " servers",
      why: "600 GB across 150 GB servers is 4 servers for one copy. Three copies of everything need 4 × 3 = 12. Adding machines (horizontal scaling) buys both room and availability.", hint: "First how many servers hold one copy (600 ÷ 150), then multiply by 3." },
  ]);

  /* ================= ds-log ================= */
  const FIG_LOG1 = svg(580, 70, [["set a=1"], ["set b=2"], ["set a=5"], ["delete b"], ["set c=7"]].map(([s], i) => pk("r" + (i + 1), rc(6 + i * 114, 22, 106, 40) + tx(59 + i * 114, 48, s, { a: "middle", m: true, s: 13 }))).join("") + [1, 2, 3, 4, 5].map((n, i) => tx(59 + i * 114, 14, "record " + n, { a: "middle", s: 11, c: "var(--text-faint)" })).join(""));

  const FIG_LOG2 = chips(["set a=1", "set b=2", "set a=4", "delete b", "set c=9", "delete c", "set c=3", "set d=6", "delete d"]);

  const FIG_CRASH = svg(560, 120,
    rc(6, 20, 150, 44, { st: "var(--teal)" }) + tx(81, 48, "len 9 | set a=1", { a: "middle", m: true, s: 12 }) +
    rc(166, 20, 150, 44, { st: "var(--teal)" }) + tx(241, 48, "len 9 | set b=2", { a: "middle", m: true, s: 12 }) +
    rc(326, 20, 96, 44, { st: "var(--rose)", d: "6 4" }) + tx(374, 48, "len 20 | se", { a: "middle", m: true, s: 12 }) +
    ln(430, 8, 430, 76, "var(--rose)", 4) + tx(438, 28, "power", { s: 12, c: "var(--rose)" }) + tx(438, 46, "cut", { s: 12, c: "var(--rose)" }) +
    tx(81, 88, "record 1: complete", { a: "middle", s: 12, c: "var(--text-dim)" }) + tx(241, 88, "record 2: complete", { a: "middle", s: 12, c: "var(--text-dim)" }) + tx(374, 88, "record 3: cut short", { a: "middle", s: 12, c: "var(--text-dim)" }) + tx(374, 106, "(header says 20 bytes)", { a: "middle", s: 11, c: "var(--text-faint)" }));

  const FIG_CHART = svg(440, 230,
    ln(50, 190, 420, 190, "var(--line-2)", 2) + ln(50, 190, 50, 20, "var(--line-2)", 2) +
    [10, 20, 30, 40].map((g, i) => tx(100 + i * 100, 210, g + " GB", { a: "middle", s: 12, c: "var(--text-dim)" })).join("") +
    tx(235, 228, "size of the log file", { a: "middle", s: 12, c: "var(--text-faint)" }) + tx(14, 110, "time", { s: 12, c: "var(--text-faint)" }) +
    `<polyline points="100,160 200,130 300,100 400,70" fill="none" stroke="var(--rose)" stroke-width="4" stroke-linecap="round"/>` +
    `<polyline points="100,182 200,182 300,182 400,182" fill="none" stroke="var(--teal)" stroke-width="4" stroke-linecap="round"/>` +
    tx(400, 58, "A", { a: "middle", s: 15, c: "var(--rose-ink)" }) + tx(400, 172, "B", { a: "middle", s: 15, c: "var(--teal-ink)" }));

  B.add("ds-log", [
    { type: "pick", q: "A log-based key-value store holds the five records below, oldest first. A client asks for b. Tap the record that decides the answer.", fig: FIG_LOG1, a: "r4",
      why: "The newest record for a key wins, and the newest record for b is the tombstone (delete b). The answer is \"not found\", even though record 2 still holds the old value." },
    { type: "slider", q: "A plain log holds 50 million records of 100 bytes each, and a read scans the whole file at 100 MB per second. About how many seconds does one read take?", min: 0, max: 120, step: 5, ans: 50, tol: 15, unit: " s",
      why: "50 million × 100 bytes = 5,000 MB, and 5,000 MB at 100 MB per second is 50 seconds. A scan per read does not survive real data volumes, which is why an index is needed.", hint: "50 million × 100 bytes is 5,000 MB (5 billion bytes). Then divide by 100 MB per second." },
    { type: "bug", q: "After a restart the store rebuilds its in-memory hash map from the log. Click the line that makes it end up with old values.",
      code: ["on restart:", "  index = empty map", "  for each record in the log, from the newest to the oldest:", "    index[record.key] = that record's offset", "  now serve reads"], a: 2,
      why: "Each assignment overwrites the previous one for that key, so the last record processed wins. Reading newest to oldest leaves the oldest record in the map. Replay from the oldest to the newest instead." },
    { type: "mcq", q: "The power fails while the third record is being appended. After the restart the file ends as drawn. What should the store do?", fig: FIG_CRASH,
      o: ["Spot that the last record is incomplete and cut the file back to the end of record 2", "Throw the whole file away and start again with an empty log", "Read record 3 as it is and treat the missing bytes as zeros", "Keep waiting for the missing bytes of record 3 to arrive"], a: 0,
      why: "Records 1 and 2 are complete, and because the log only appends, they were never touched. The partial tail is the only damage, so recovery trims it. Losing everything or guessing the missing bytes would throw away good data or invent data." },
    { type: "cat", q: "Replay this log from the top. For each request, does the store return a value or report \"not found\"?", fig: FIG_LOG2, buckets: ["Returns a value", "Reports not found"],
      items: [["get(a)", 0], ["get(b)", 1], ["get(c)", 0], ["get(d)", 1], ["get(e)", 1]],
      why: "a ends at 4. b was deleted. c was written, deleted and written again, so it ends at 3. d was deleted last. e never appears in the log at all." },
    { type: "mcq", q: "A team charts how long a get and a set take as their log file grows. Line A rises steadily while line B stays flat. Which reading of the chart is right?", fig: FIG_CHART,
      o: ["A is get: it scans a bigger file each time. B is set: it only appends at the end", "A is set: bigger files take longer to write to. B is get: it jumps straight to the record", "A is delete: it must scan for the key. B is get: it reads the last line", "A is set: it must check every old record first. B is delete: it adds a marker only"], a: 0,
      why: "In a plain log, appending costs the same however big the file is, so its time is flat. Reading has to scan for the key, so its time grows with the file. That growth is the problem an index solves." },
  ]);

  /* ================= ds-hashidx ================= */
  const FIG_COMPACT = segRows([
    { id: "1", label: "Segment 1 (oldest)", recs: [["a", 1], ["b", 2], ["c", 3]] },
    { id: "2", label: "Segment 2", recs: [["a", 4], ["d", 5], ["b", 6]] },
    { id: "3", label: "Segment 3 (newest)", recs: [["a", 7], ["c", 8], ["e", 9]] },
  ], { pick: true });

  const FIG_WORK = table(["", "Workload A", "Workload B"], [["Distinct keys", "40 thousand", "3 billion"], ["Writes per day", "2 billion updates", "3 billion, each key written once"], ["Reads", "by key", "by key"]]);

  const FIG_IDX = segRows([
    { id: "1", label: "Segment 1 (oldest)", recs: [["k1", 4], ["k2", 7]] },
    { id: "2", label: "Segment 2", recs: [["k1", 9], ["k3", 2]] },
    { id: "3", label: "Segment 3 (newest)", recs: [["k3", 5]] },
  ], { head: "index: k1 → seg 2,  k2 → seg 1,  k3 → seg 3" });

  B.add("ds-hashidx", [
    { type: "pick", q: "Compaction merges these three segments into one, keeping only the newest value for each key. Tap every record that gets thrown away.", fig: FIG_COMPACT, a: ["1a", "1b", "1c", "2a"],
      why: "Newest values: a = 7 and c = 8 (segment 3), b = 6 and d = 5 (segment 2), e = 9 (segment 3). That leaves segment 1's a, b and c and segment 2's a as stale. Segment 1 is wholly out of date." },
    { type: "slider", q: "A hash index keeps one entry per key and each entry takes about 100 bytes of memory. The server has 8 GB of memory set aside for it. Roughly how many million keys can it index?", min: 0, max: 200, step: 10, ans: 80, tol: 30, unit: " million",
      why: "8 GB is about 8,000 MB, and each entry is 100 bytes, so 8,000 MB ÷ 100 bytes = 80 million entries. The hash map must fit in memory, which caps the number of distinct keys.", hint: "8 GB is 8,000 MB. How many 100-byte entries fit in one MB?" },
    { type: "bug", q: "Compaction runs in the background while the store keeps serving reads. Click the step that can lose data or break reads.",
      code: ["compaction (background):", "  read the old segments and keep the newest record for each key", "  delete the old segments", "  write the kept records to a new segment file", "  point the index at the new segment"], a: 2,
      why: "Until the new segment is written and the index points at it, reads still need the old files, and a crash in between would lose everything. Safe order: write the new segment, switch the index, then delete the old ones." },
    { type: "mcq", q: "Which workload suits a hash-indexed log?", fig: FIG_WORK,
      o: ["A: few keys fit in memory, and compaction collapses billions of updates", "A: so many updates make every lookup slower than a scan", "B: the log never needs compaction, so the index can be smaller", "B: 3 billion keys is easy because the index lives on disk"], a: 0,
      why: "The index needs one in-memory entry per distinct key. A has 40 thousand keys (a few MB) and compaction shrinks its pile of updates to 40 thousand records. B would need hundreds of GB of memory for its keys." },
    { type: "cat", q: "The server restarts. For each item, does it survive on disk, or must it be rebuilt?", buckets: ["Survives the restart", "Must be rebuilt"],
      items: [["The segment files", 0], ["The in-memory hash map of keys to offsets", 1], ["The newest value written for every key", 0], ["The record of which segment each key lives in (held in the map)", 1], ["Old overwritten values that compaction has not reached yet", 0]],
      why: "Everything written is appended to files, so it survives. The hash map lives in memory and is lost, so the store replays the segments to rebuild it." },
    { type: "multi", q: "Look at the index and the three segments. Select all statements that are true.", fig: FIG_IDX,
      o: ["The k1 record in segment 1 is out of date", "Merging segments 1 and 2 keeps k1 = 9 and k2 = 7", "k3's newest value is in segment 2", "Segment 1 could be deleted without losing any current value"], a: [0, 1],
      why: "k1 was rewritten in segment 2, so segment 1's copy is stale. A merge of segments 1 and 2 keeps k1 = 9 and k2 = 7. k3's newest value is 5 in segment 3. Segment 1 is the only place with k2, so deleting it would lose a current value." },
  ]);

  /* ================= ds-sstable ================= */
  const tn = (x, y, k) => `<circle cx="${x}" cy="${y}" r="20" fill="var(--panel)" stroke="var(--blue)" stroke-width="3"/>` + tx(x, y + 5, k, { a: "middle", m: true, s: 15 });
  const FIG_TREE = svg(560, 190,
    ln(280, 30, 140, 90) + ln(280, 30, 420, 90) + ln(140, 90, 70, 160) + ln(140, 90, 210, 160) + ln(420, 90, 350, 160) + ln(420, 90, 490, 160) +
    tn(280, 30, "m") + tn(140, 90, "f") + tn(420, 90, "s") + tn(70, 160, "c") + tn(210, 160, "i") + tn(350, 160, "p") + tn(490, 160, "w"));

  const FIG_READ = segRows([
    { id: "m", label: "Memtable (memory)", recs: [["c", 1], ["m", 2]] },
    { id: "3", label: "Segment 3 (newest)", recs: [["b", 5], ["x", 1]] },
    { id: "2", label: "Segment 2", recs: [["m", 3], ["q", "DELETED", "var(--rose)"]] },
    { id: "1", label: "Segment 1 (oldest)", recs: [["a", 1], ["q", 8]] },
  ], { pick: true });

  const FIG_SPARSEIDX = svg(560, 200,
    tx(8, 22, "One sorted segment of 6,000 keys, two index designs", { s: 13, c: "var(--text-dim)" }) +
    tx(8, 56, "Design A", { s: 14 }) + [0, 1, 2, 3, 4, 5].map((i) => rc(90 + i * 74, 38, 70, 26, { st: "var(--blue)" }) + tx(125 + i * 74, 56, "100 keys", { a: "middle", s: 11, w: 700 })).join("") + tx(8, 76, "index entry at the start of each block", { s: 11, c: "var(--text-faint)", w: 700 }) +
    tx(8, 120, "Design B", { s: 14 }) + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => rc(90 + i * 37, 102, 34, 26, { st: "var(--amber)" }) + tx(107 + i * 37, 120, "10", { a: "middle", s: 11, w: 700 })).join("") + tx(8, 140, "index entry at the start of each block", { s: 11, c: "var(--text-faint)", w: 700 }) +
    tx(8, 176, "A: every 100th key is indexed (60 entries).   B: every 10th key is indexed (600 entries).", { s: 12, c: "var(--text-dim)", w: 700 }) + tx(8, 194, "Blocks are drawn only in part.", { s: 11, c: "var(--text-faint)", w: 700 }));

  B.add("ds-sstable", [
    { type: "order", q: "The memtable is the balanced tree drawn here. It is flushed to disk as a new SSTable. Put the keys in the order they are written into the file.", fig: FIG_TREE, items: ["c", "f", "i", "m", "p", "s", "w"],
      why: "An SSTable is sorted by key, and reading a balanced search tree in order (left branch, then the node, then right branch) hands the keys over already sorted. That is why the memtable is a tree, and why no separate sort is needed at flush time." },
    { type: "pick", q: "A read for key q checks the memtable first, then segments from newest to oldest, and stops at the first record it finds for q. Tap the record that decides the answer.", fig: FIG_READ, a: "2q",
      why: "The memtable and segment 3 have no q, so the search reaches segment 2 and finds the tombstone there. It stops, so the answer is \"not found\", even though segment 1 still holds q = 8." },
    { type: "mcq", q: "Memory is tight and reads are not time-critical. Which design fits, and what does it cost?", fig: FIG_SPARSEIDX,
      o: ["Design A: 60 index entries, but a lookup may scan about 100 records", "Design A: 600 index entries, and a lookup scans about 10 records", "Design B: 60 index entries, but a lookup may scan about 100 records", "Design B: 600 index entries, so every key is found with no scan"], a: 0,
      why: "A sparse index trades memory for scanning. Indexing every 100th key needs a tenth of the memory of indexing every 10th, but each lookup has to scan a block ten times as long." },
    { type: "bug", q: "This put() is meant to keep writes flowing while a full memtable is saved. Click the line that breaks that.",
      code: ["put(key, value):", "  memtable.insert(key, value)", "  if memtable is full:", "    freeze it, start a new empty memtable", "    block all puts until the frozen one is saved"], a: 4,
      why: "New writes go into a fresh memtable while the full one is written out in the background, so writing stays fast. Blocking every put until the flush ends would stall the store each time the memtable fills." },
    { type: "multi", q: "Three sorted segments of 1,000 keys each are merged into one. Select all statements that are true.",
      o: ["The inputs are read one after another from start to end, with no random jumping", "The output may hold fewer than 3,000 records", "The output must be sorted again afterwards", "When a key is in several segments, the oldest segment's value wins"], a: [0, 1],
      why: "Merging sorted files is like the merge step of merge sort: read them side by side, sequentially. Duplicate keys collapse to one record, so the result can be smaller than 3,000. The output comes out sorted already, and the newest value wins, not the oldest." },
    { type: "slider", q: "A store flushes its memtable whenever it fills 64 MB. Writes arrive at 8 MB per second. If nothing is ever merged, about how many SSTables pile up in one hour?", min: 0, max: 1000, step: 50, ans: 450, tol: 100, unit: " SSTables",
      why: "64 MB at 8 MB per second fills every 8 seconds. One hour is 3,600 seconds, so 3,600 ÷ 8 = 450 files. A read might have to check each of them, which is why background merging matters.", hint: "How many seconds to fill 64 MB at 8 MB per second? Then divide 3,600 by that." },
  ]);
})();

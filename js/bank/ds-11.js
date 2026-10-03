/* ===== bank-v-ds-2.js ===== */
/* DS revision bank, visual and varied questions, part 2.
   Lecture 2 (models, schema, graphs, NoSQL) and Lecture 3 (log, hash index, SSTable).
   Every figure is needed to answer; numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});

  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto">${body}</svg>`;
  const tx = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "start"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "var(--mono)" : "var(--sans)"}" fill="${o.c || "var(--text)"}">${esc(s)}</text>`;
  const rc = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 3, extra = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const table = (head, rows) =>
    `<table class="t"><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  const chips = (list) =>
    `<div style="display:flex;flex-wrap:wrap;gap:6px">${list.map((s, i) => `<span style="border:2px solid var(--line-2);border-radius:8px;padding:3px 8px;background:var(--panel);font:800 13px var(--mono)"><span style="color:var(--text-faint)">${i + 1}</span> ${esc(s)}</span>`).join("")}</div>`;

  /* Stacked segment rows (oldest at the top). rows: [{id, label, recs:[[key, value, colour?]]}] */
  function segRows(rows, { pick = false, head = "", w = 560 } = {}) {
    const top = head ? 34 : 6;
    let b = head ? tx(8, 22, head, { m: true, s: 13, c: "var(--text-dim)" }) : "";
    rows.forEach((r, i) => {
      const y = top + i * 54;
      b += tx(8, y + 28, r.label, { s: 12, c: "var(--text-dim)" });
      r.recs.forEach(([k, v, c], j) => {
        const x = 150 + j * 130,
          col = c || "var(--line-2)";
        const g =
          rc(x, y + 6, 118, 36, { st: col, f: c ? "var(--rose-dim)" : "var(--panel)" }) +
          tx(x + 59, y + 30, `${k} = ${v}`, { a: "middle", m: true, s: 14 });
        b += pick ? pk(r.id + k, g) : g;
      });
    });
    return svg(w, top + rows.length * 54, b);
  }

  /* ================= ds-models ================= */
  const dotPanel = (ox, id, title, links) => {
    const L = [0, 1, 2].map((i) => [ox + 45, 78 + i * 38]),
      R = [0, 1, 2].map((i) => [ox + 135, 78 + i * 38]);
    let s =
      rc(ox + 4, 6, 172, 166, { rx: 12 }) +
      tx(ox + 90, 28, title, { a: "middle", s: 14 }) +
      tx(ox + 45, 52, "left", { a: "middle", s: 11, c: "var(--text-faint)" }) +
      tx(ox + 135, 52, "right", { a: "middle", s: 11, c: "var(--text-faint)" });
    links.forEach(([a, b]) => (s += ln(L[a][0], L[a][1], R[b][0], R[b][1], "var(--blue)", 2.5)));
    L.forEach(
      ([x, y]) =>
        (s += `<circle cx="${x}" cy="${y}" r="9" fill="var(--panel)" stroke="var(--teal)" stroke-width="3"/>`),
    );
    R.forEach(
      ([x, y]) =>
        (s += `<circle cx="${x}" cy="${y}" r="9" fill="var(--panel)" stroke="var(--amber)" stroke-width="3"/>`),
    );
    return pk(id, s);
  };
  const FIG_DOTS = svg(
    580,
    180,
    dotPanel(0, "a", "Set A", [
      [0, 0],
      [0, 1],
      [1, 2],
    ]) +
      dotPanel(200, "b", "Set B", [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
        [2, 0],
      ]) +
      dotPanel(400, "c", "Set C", [
        [0, 0],
        [1, 1],
        [2, 2],
      ]),
  );

  const mono = (x, y, s, o = {}) => tx(x, y, s, { m: true, s: 13, ...o });
  const FIG_POST = svg(
    560,
    230,
    pk("title", rc(10, 6, 540, 34) + mono(24, 28, `"title": "Sourdough tips",`)) +
      pk(
        "author",
        rc(10, 46, 540, 78) +
          mono(24, 68, `"author": {`) +
          mono(44, 90, `"name": "Mo Reid",  "town": "Leeds"`) +
          mono(24, 112, `},`),
      ) +
      pk("published", rc(10, 130, 540, 34) + mono(24, 152, `"published": "2 March",`)) +
      pk(
        "comments",
        rc(10, 170, 540, 52) +
          mono(24, 192, `"comments": [ {"text": "Lovely crumb!"},`) +
          mono(24, 212, `              {"text": "Will try this"} ]`),
      ),
  );

  const FIG_TEXTFIELD = table(
    ["id", "name", "positions (one text field)"],
    [
      ["1", "Ana", "Chef at Orbit Ltd; Baker at Nim Cafe"],
      ["2", "Bo", "Barista at Nim Cafe"],
      ["3", "Cy", "Chef at Orbit Ltd; Chef at Dune Bistro; Waiter at Pia's"],
    ],
  );

  B.add("ds-models", [
    {
      type: "pick",
      q: "Each dot is a record and each line is a link between a left record and a right record. Judge only from the lines: which set shows a many-to-many relationship?",
      fig: FIG_DOTS,
      a: "b",
      why: "In Set B some left records link to several right records and some right records link back to several left ones, so both sides are many. Set A is one-to-many (every right dot has at most one left), and Set C is one-to-one.",
    },
    {
      type: "bug",
      q: "A normalised design keeps users, positions and education in separate tables, each child row pointing at its user. This code builds the profile page for user 42. Click the faulty line.",
      code: [
        "user = users.find(id = 42)",
        "jobs = positions.find(id = 42)",
        "schools = education.find(user_id = 42)",
        "page = { user, jobs, schools }",
      ],
      a: 1,
      why: "A positions row's own id is just that row's number. To get user 42's positions you must match the foreign key column (user_id = 42), as the education line does.",
    },
    {
      type: "cat",
      q: "A cooking site uses a document database. For each piece of data, should it sit inside the document that uses it, or be its own shared record?",
      buckets: ["Embed inside the document", "Keep as its own shared record"],
      items: [
        ["The ordered steps of one recipe, only ever shown on that recipe's page", 0],
        ["The restaurant that 4,000 chef profiles list as their employer, and which sometimes renames itself", 1],
        ["The address history of one customer, read only with that customer", 0],
        ["A band credited on thousands of albums, searched on its own", 1],
        ["The line items of one order, always read together with the order", 0],
        ["A topic tag used by thousands of posts and browsed on its own page", 1],
      ],
      why: "Data owned by one parent and always read with it fits inside the document (locality, one read). Data shared by many documents, or used on its own, is better kept once, otherwise every copy has to be edited when it changes.",
    },
    {
      type: "multi",
      q: "This design stores each person's positions as plain text in one field. Which jobs does it make hard for the database? Select all that apply.",
      fig: FIG_TEXTFIELD,
      o: [
        "Find every person who ever worked at Orbit Ltd",
        "Count how many positions each person has",
        "Show one person's name",
        "Load one person by their id",
      ],
      a: [0, 1],
      why: "The database sees the positions field as opaque text, so it cannot index inside it, match on employer or count entries without custom string handling. Reading a name or an id is untouched.",
    },
    {
      type: "pick",
      q: "A blog keeps each post as one document, like the one below. Mo has written 300 posts, so Mo's details are copied into every one of them. Mo moves house. Tap the part that would need editing in all 300 documents.",
      fig: FIG_POST,
      a: "author",
      why: "The author block is a many-to-one link flattened into a copy. The title, date and comments belong to this one post, but Mo's town is repeated in every post Mo wrote, so one change means 300 edits (or a shared record and a join).",
    },
    {
      type: "bug",
      q: "A university stores students and courses in tables. A student can take many courses and a course has many students. This setup script hides one mistake. Click the faulty line.",
      code: [
        "students(id, name)",
        "courses(id, title)",
        "enrolments(student_id, course_id)   -- one row per pairing",
        "add enrolment (5, 2)  and  add enrolment (5, 9)",
        "students.update(id = 5, course_id = 9)",
      ],
      a: 4,
      why: "A single course_id column in students can hold only one course, so it cannot describe a many-to-many link. The separate enrolments table already records both pairings. The last line is the mistake.",
    },
  ]);

  /* ================= ds-schema ================= */
  const card = (x, id, lines) =>
    pk(
      id,
      rc(x, 8, 128, 112, { rx: 10 }) +
        lines.map((l, i) => tx(x + 10, 34 + i * 22, l, { m: true, s: 12 })).join("") +
        tx(x + 64, 140, id.toUpperCase(), { a: "middle", s: 13, c: "var(--text-faint)" }),
    );
  const FIG_CARDS = svg(
    560,
    150,
    card(4, "d1", ["name: Kettle", "price: 20"]) +
      card(144, "d2", ["name: Lamp", "price: 15", "voltage: 12"]) +
      card(284, "d3", ["name: Gift card", "value: 25"]) +
      card(424, "d4", ["name: Mug", "price: 6", "colour: red"]),
  );

  const FIG_SCHEMA =
    `<div style="font:800 13px var(--sans);margin-bottom:6px">Schema of the table <b>orders</b></div>` +
    table(
      ["column", "type", "rule"],
      [
        ["id", "whole number", "required"],
        ["qty", "whole number", "required"],
        ["note", "text", "optional"],
      ],
    );

  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const FIG_TIME = svg(
    560,
    170,
    months.map((m, i) => tx(50 + i * 40, 150, m, { a: "middle", s: 13, c: "var(--text-dim)" })).join("") +
      rc(30, 20, 120, 40, { st: "var(--blue)" }) +
      tx(90, 45, "{ name }", { a: "middle", m: true }) +
      rc(150, 20, 200, 40, { st: "var(--amber)" }) +
      tx(250, 45, "{ first, last }", { a: "middle", m: true }) +
      rc(350, 20, 160, 40, { st: "var(--violet)" }) +
      tx(430, 45, "{ first, last, title }", { a: "middle", m: true, s: 12 }) +
      tx(30, 84, "Code changes deployed: Jan, Apr and Sep. Old documents were never rewritten.", {
        s: 12,
        c: "var(--text-dim)",
        w: 700,
      }) +
      ln(30, 124, 510, 124, "var(--line-2)", 2) +
      `<path d="M510 108 v32" stroke="var(--rose)" stroke-width="3"/>` +
      tx(512, 104, "now", { a: "middle", s: 12, c: "var(--rose)" }),
  );

  B.add("ds-schema", [
    {
      type: "pick",
      q: "A shop's collection has no enforced schema. The basket code runs total = sum of doc.price over every document. Tap the document that this code cannot handle.",
      fig: FIG_CARDS,
      a: "d3",
      why: "Schema-on-read means nothing stopped the gift card being saved with value instead of price. The reading code meets the surprise: it must either check for a missing price or use the other field. Extra fields like voltage or colour do no harm to a sum of prices.",
    },
    {
      type: "order",
      q: 'A document store is changing from one "name" field to "first" and "last", with 50 million documents. Put a safe, gradual migration in order.',
      items: [
        "Deploy code that reads both the old and the new shape",
        "Make every new write use the new shape",
        "Rewrite old documents when they are read, or in the background",
        "Delete the old-shape handling once none remain",
      ],
      why: "Readers must cope with both shapes before anything is written in the new one, otherwise they break. Only when no old documents are left is it safe to remove the old-shape code.",
    },
    {
      type: "cat",
      q: "For each job, does keeping a document's data together in one stored piece (locality) help or hurt?",
      buckets: ["Locality helps", "Locality hurts"],
      items: [
        ["Show one order with all its lines and delivery notes", 0],
        ["List only the titles of 10,000 articles that each hold 3 MB of images", 1],
        ["Open a profile page that needs name, positions, education and contacts", 0],
        ["Chart one tiny number from every one of a million large documents", 1],
        ["Change a single small field inside a very large document", 1],
        ["Load a recipe with its steps and ingredients in one go", 0],
      ],
      why: "Locality pays off when you want most of a document in one read. It hurts when you want a small part of many big documents, because the whole of each one is still loaded (or rewritten).",
    },
    {
      type: "match",
      q: "A relational table is declared as below (schema-on-write). Match each incoming record to what the database does with it.",
      fig: FIG_SCHEMA,
      pairs: [
        ['{ id: 1, qty: "two" }', "Rejected: qty is the wrong type"],
        ['{ id: 2, note: "hi" }', "Rejected: required qty is missing"],
        ["{ id: 3, qty: 4 }", "Accepted"],
        ['{ id: 4, qty: 5, colour: "red" }', "Rejected: no such column"],
      ],
      why: "With schema-on-write the structure is checked when data is stored: types, required fields and the list of columns are all enforced. A document store without a schema would have accepted all four.",
    },
    {
      type: "mcq",
      q: "The team never rewrote old documents. Looking at the timeline, how many different shapes might the reading code meet in December?",
      fig: FIG_TIME,
      o: ["1", "2", "3", "4"],
      a: 2,
      why: "Documents written in each period keep the shape they were saved in, so old { name } documents, { first, last } documents and { first, last, title } documents all still sit in the store. With schema-on-read, the code carries that history.",
      hint: "Each deployment created a new shape, and nothing removed the old ones.",
    },
    {
      type: "bug",
      q: "A team explains why partner product feeds go into a schema-on-read store. One reason is wrong. Click it.",
      code: [
        "Partners add and rename fields without telling us.",
        "So the database cannot reject their uploads for us.",
        "So our code never has to handle a missing or renamed field.",
        "We interpret and tidy each document as we read it.",
      ],
      a: 2,
      why: "Schema-on-read moves the checking into the application. Because nothing is enforced on write, the reading code has to be ready for missing and renamed fields.",
    },
  ]);

  /* ================= ds-graph ================= */
  const Qf = NIC.qfig;
  const FIG_FOLLOW = Qf.graph(
    { A: [50, 130], B: [140, 60], C: [140, 200], D: [250, 100], E: [250, 200], F: [360, 60], G: [360, 200] },
    [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["C", "E"],
      ["D", "F"],
      ["E", "G"],
    ],
    { pick: "nodes", directed: true, w: 420, h: 260, hl: { A: "var(--teal)" } },
  );

  const FIG_TABLES = `<div style="display:grid;grid-template-columns:1fr 1.2fr;gap:12px;align-items:start"><div><div style="font:800 13px var(--sans);margin-bottom:4px">Vertices</div>${table(
    ["id", "label", "name"],
    [
      ["1", "Person", "Mia"],
      ["2", "Person", "Leo"],
      ["3", "Place", "Cafe Nim"],
      ["4", "Person", "Zed"],
    ],
  )}</div><div><div style="font:800 13px var(--sans);margin-bottom:4px">Edges</div>${table(
    ["id", "from", "label", "to"],
    [
      ["e1", "1", "KNOWS", "2"],
      ["e2", "2", "VISITED", "3"],
      ["e3", "4", "VISITED", "3"],
      ["e4", "4", "KNOWS", "1"],
    ],
  )}</div></div>`;

  const FIG_PROPS = svg(
    560,
    190,
    rc(10, 40, 160, 100, { st: "var(--blue)", rx: 14 }) +
      tx(90, 66, "Ana", { a: "middle", s: 15 }) +
      tx(90, 88, "(Person)", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(90, 114, "born: 1990", { a: "middle", m: true, s: 12 }) +
      rc(390, 40, 160, 100, { st: "var(--amber)", rx: 14 }) +
      tx(470, 66, "Orbit Ltd", { a: "middle", s: 15 }) +
      tx(470, 88, "(Company)", { a: "middle", s: 12, c: "var(--text-dim)" }) +
      tx(470, 114, "city: Leeds", { a: "middle", m: true, s: 12 }) +
      ln(172, 90, 386, 90, "var(--line-2)", 3, 'marker-end="url(#ga)"') +
      `<defs><marker id="ga" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-2)"/></marker></defs>` +
      tx(280, 78, "WORKS_AT", { a: "middle", s: 13, c: "var(--text-dim)" }),
  );
  Object.assign(partScope, { FIG_FOLLOW, FIG_PROPS, FIG_TABLES, chips, ln, pk, rc, segRows, svg, table, tx });
})();

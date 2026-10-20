/* Data Science · Lecture 2 · Data models and NoSQL (video ds-2): the data and algorithms every scene shares (pure, no DOM, no
   randomness). Everything hangs off VID.d2; scenes start with  const D2 = VID.d2;  Drawing helpers are in common-2.js (tags,
   cards, counters, bars, icons), common-3.js (tables, documents, the profile page, the dot grid) and common-4.js (the property
   graph and the family icons). Every number below comes from running the real rule when the page loads and is asserted against
   the storyboard (videos/_plan/ds-2.json): a wrong number throws an Error with a clear message.

   1. THE PROFILE PAGE (scene 2; lesson 2.1 "Load one profile page": a recipe-site chef profile, chef #251)
        D2.PROFILE = {id: 251,
          fields: [{table, field, n}] x 6 in this order: users / name / 1, regions / region / 1, industries / industry / 1,
                  positions / positions / 2, education / education / 2, contact_info / contacts / 2
                  (table = the relational table, field = the key in the document, n = rows for this chef = chips in the document)
          rows: 9 (1+1+1+2+2+2),   relational: {lookups: 6, places: 6},   document: {lookups: 1, places: 1}}
        D2.profileDoc() -> the document as lines [{key, n}] ready for D2.doc  (the same six fields, in the same order).
   2. THE RENAME (scene 3; lesson 2.1 "A company changes its name", many-to-one)
        D2.RENAME = {profiles: 400, company: {id: 7, from: "Acme", to: "Apex"}, cols: 25, rows: 16 (25 x 16 = 400 dots),
                     relational: {rows: 1}, document: {docs: 400}, stale: 213 (the one copy a rewrite loop misses; row 8, col 13, 0-based)}
        D2.rowCol(i, cols = 25) -> {r, c} of dot i.
   3. THE SCHEMA CHANGE (scene 4; lesson 2.2 "Split name into first and last name")
        D2.SCHEMA = {rows: 1000000, old: {name: "Ada Byte"}, next: {first_name: "Cy", last_name: "Dee"}, split: "Ada Byte" -> ["Ada", "Byte"]}
          (1M rows: a table big enough for "slow", one of the values of the lesson's own record slider, which runs from 1,000 to 100 million)
        D2.splitName(s) -> [first, last].   D2.migrate(p) -> {done, pct}: rows rewritten after a fraction p (0..1) of the sweep.
        D2.abbr(n) -> "489k" / "1M": a count the way the lesson's slider writes it (thousands round DOWN, so a count never runs ahead).
   4. LOCALITY (scene 5; lesson 2.2 "Locality: one document, one read", the lesson's own formula, document size 20 KB)
        D2.LOCALITY = {size: 20, nameKB: 0.2, wasted: 19.8,
                       all:  {doc: {reads: 1, kb: 20}, tables: {reads: 6, kb: 20}},     the page needs the whole profile
                       name: {doc: {reads: 1, kb: 20}, tables: {reads: 1, kb: 0.2}}}    the page needs just the name
        D2.locality(need, size) -> the same shape for need "all" | "name".   D2.kb(x) -> "20 KB" / "0.2 KB".
   5. THE PROPERTY GRAPH (scenes 6, 7; lesson 2.3, the lesson's own seven vertices and eight edges)
        D2.GRAPH = {nodes: [{id, kind: "person" | "city" | "company"}] Ana Ben Cy Dee Eli (person), Leeds (city), Acme (company),
                    edges: [{a, b, label, key: "Ana>Ben"}] in the lesson's order:
                      Ana>Ben FRIEND, Ben>Cy FRIEND, Cy>Dee FRIEND, Eli>Dee FRIEND, Ana>Leeds LIVES_IN, Ben>Leeds LIVES_IN,
                      Cy>Acme WORKS_AT, Eli>Acme WORKS_AT,
                    path: ["Ana", "Ben", "Cy", "Dee"] (the shortest chain Ana to Dee, 3 hops), hops: 3,
                    ben: {out: [{to: "Cy", label: "FRIEND", key}, {to: "Leeds", label: "LIVES_IN", key}], in: [{from: "Ana", label: "FRIEND", key}]}}
        D2.bfs(a, b) -> the shortest chain as an array of ids ([] when none); the walk treats an edge as usable in both directions,
        exactly like the lesson's demo.   D2.vertex(id) -> {out, in} (the edges a vertex stores, as above).
        D2.pathKeys(path) -> the edge keys the chain uses, in walking order, e.g. ["Ana>Ben", "Ben>Cy", "Cy>Dee"].
        D2.ekey(a, b) -> the stored key of the edge between a and b, whichever way you ask: D2.ekey("Dee", "Cy") = "Cy>Dee".
        D2.LAYOUT = {id: [x, y]} suggested centres for the whole graph on the 936 x 640 stage (scene 6).
   6. FRIENDS OF FRIENDS (scene 7; workshop 2.W "Ask the data": five people in a chain of friendships)
        D2.CHAIN = {people: ["Ana", "Ben", "Cy", "Dee", "Eli"], friends: [["Ana","Ben"], ["Ben","Cy"], ["Cy","Dee"], ["Dee","Eli"]]}
        D2.walk(start, hops) -> {steps: [{hop, from: [ids], reached: [ids], edges: ["Ana>Ben"]}], hops, fetches, joins, result: [ids]}
          (the workshop's runQuery: a hop goes to the friends not seen yet; joins = tables need one self-join per hop; fetches = documents the
          code reads (one per person the hop starts from); graph hops = hops)
          walk("Ana", 2) -> result ["Cy"] (friends of friends); walk("Ana", 3) -> result ["Dee"], joins 3, fetches 3;
          walk("Ana", 4) -> result ["Eli"], joins 4, fetches 4.
   7. THE FOUR NoSQL FAMILIES (scenes 8, 9; lesson 2.4 "One pancake recipe, four shapes")
        D2.AIMS = ["simple design", "scales out", "stays available"]   (NoSQL = non-relational storage focused on these three)
        D2.FAMILIES = {
          doc:   {name: "Document", lines: [{key: "name", text: "Pancakes"}, {key: "mins", text: "20"}, {key: "steps", items: ["Mix", "Rest", "Fry"]}], coll: "recipes"},
          kv:    {name: "Key-value", rows: [["recipe#7", "meta"], ["recipe#7", "step#1"], ["recipe#7", "step#2"], ["recipe#7", "step#3"]]}
                 (partition key = first column, the same for all four items; sort key = second column, different for each),
          wide:  {name: "Wide-column", rows: [{id: 7, cols: ["name", "mins", "tags"]}, {id: 8, cols: ["name", "vegan", "kcal"]}, {id: 9, cols: ["name", "mins"]}]}
                 (column names vary from row to row),
          graph: {name: "Graph", nodes: ["Pancakes", "Flour", "Eggs", "Breakfast", "Waffles"],
                  edges: [["Pancakes", "Flour", "USES"], ["Pancakes", "Eggs", "USES"], ["Pancakes", "Breakfast", "TAGGED"], ["Waffles", "Flour", "USES"]]}}
        D2.FAMILY_ORDER = ["doc", "kv", "wide", "graph"]       D2.usersOf("Flour") -> ["Pancakes", "Waffles"]  (who else uses flour?)
        D2.WORKLOADS = [{text, lines: [l1, l2], family}] x 4, in this order (from the lesson's "Which NoSQL family fits?" sorter):
          Cart by user id -> kv, One whole product page -> doc, Friends of friends -> graph, Events with varying columns -> wide
   SMALL TOOLS.  D2.same(what, got, want) / D2.close(what, got, want, tol) throw when a number differs from the storyboard;
   D2.rng(seed) -> () => 0..1 (mulberry32, seeded: the only randomness allowed). */
(function () {
  const V = window.VID;
  const D2 = (V.d2 = V.d2 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d2: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.001) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.d2: ${what} is ${got}, the storyboard says ${want}`);
  };
  const rng = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  Object.assign(D2, { same, close, rng });

  // ---------- 1. the profile page ----------
  const FIELDS = [
    ["users", "name", 1],
    ["regions", "region", 1],
    ["industries", "industry", 1],
    ["positions", "positions", 2],
    ["education", "education", 2],
    ["contact_info", "contacts", 2],
  ].map(([table, field, n]) => ({ table, field, n }));
  const PROFILE = {
    id: 251,
    fields: FIELDS,
    rows: FIELDS.reduce((a, f) => a + f.n, 0),
    relational: { lookups: FIELDS.length, places: FIELDS.length },
    document: { lookups: 1, places: 1 },
  };
  same(
    "profile: rows per table",
    FIELDS.map((f) => f.n),
    [1, 1, 1, 2, 2, 2],
  );
  same("profile: total rows", PROFILE.rows, 9);
  same("profile: relational lookups", PROFILE.relational.lookups, 6);
  same(
    "profile: tables",
    FIELDS.map((f) => f.table),
    ["users", "regions", "industries", "positions", "education", "contact_info"],
  );
  D2.PROFILE = PROFILE;
  D2.profileDoc = () => FIELDS.map((f) => ({ key: f.field, n: f.n }));

  // ---------- 2. the rename ----------
  const COLS = 25;
  const RENAME = {
    profiles: 400,
    company: { id: 7, from: "Acme", to: "Apex" },
    cols: COLS,
    rows: 16,
    relational: { rows: 1 },
    document: { docs: 400 },
    stale: 213,
  };
  D2.rowCol = (i, cols = COLS) => ({ r: Math.floor(i / cols), c: i % cols });
  same("rename: dots", RENAME.cols * RENAME.rows, RENAME.profiles);
  same("rename: stale dot (row, col)", D2.rowCol(RENAME.stale), { r: 8, c: 13 });
  same("rename: the document store rewrites every profile", RENAME.document.docs, RENAME.profiles);
  D2.RENAME = RENAME;

  // ---------- 3. the schema change ----------
  const splitName = (s) => s.split(" ");
  const SCHEMA = {
    rows: 1000000,
    old: { name: "Ada Byte" },
    next: { first_name: "Cy", last_name: "Dee" },
    split: splitName("Ada Byte"),
  };
  D2.splitName = splitName;
  D2.migrate = (p) => {
    const k = Math.min(1, Math.max(0, p));
    return { done: Math.round(k * SCHEMA.rows), pct: Math.round(k * 100) };
  };
  same("schema: the old name splits in code", SCHEMA.split, ["Ada", "Byte"]);
  // the lesson's own number format (its record slider writes 1000 as 1k and 1000000 as 1M)
  D2.abbr = (n) => (n >= 1e6 ? `${n / 1e6}M` : n >= 1e3 ? `${Math.floor(n / 1e3)}k` : String(n));
  same("schema: rows", SCHEMA.rows, 1000000);
  same("schema: half way", D2.migrate(0.5), { done: 500000, pct: 50 });
  same("schema: counts as written", [D2.abbr(SCHEMA.rows), D2.abbr(489999), D2.abbr(999)], ["1M", "489k", "999"]);
  D2.SCHEMA = SCHEMA;

  // ---------- 4. locality (the lesson's formula) ----------
  const locality = (need, size = 20) => ({
    doc: { reads: 1, kb: size },
    tables: { reads: need === "all" ? PROFILE.relational.lookups : 1, kb: need === "all" ? size : 0.2 },
  });
  const LOCALITY = { size: 20, nameKB: 0.2, wasted: 19.8, all: locality("all"), name: locality("name") };
  D2.locality = locality;
  D2.kb = (x) => `${x} KB`;
  same("locality: the whole profile", LOCALITY.all, { doc: { reads: 1, kb: 20 }, tables: { reads: 6, kb: 20 } });
  same("locality: just the name", LOCALITY.name, { doc: { reads: 1, kb: 20 }, tables: { reads: 1, kb: 0.2 } });
  close("locality: KB a name-only page wastes on the document", LOCALITY.name.doc.kb - LOCALITY.name.tables.kb, 19.8);
  D2.LOCALITY = LOCALITY;

  // ---------- 5. the property graph ----------
  const KIND = {
    Ana: "person",
    Ben: "person",
    Cy: "person",
    Dee: "person",
    Eli: "person",
    Leeds: "city",
    Acme: "company",
  };
  const ekey = (a, b) => `${a}>${b}`;
  const EDGES = [
    ["Ana", "Ben", "FRIEND"],
    ["Ben", "Cy", "FRIEND"],
    ["Cy", "Dee", "FRIEND"],
    ["Eli", "Dee", "FRIEND"],
    ["Ana", "Leeds", "LIVES_IN"],
    ["Ben", "Leeds", "LIVES_IN"],
    ["Cy", "Acme", "WORKS_AT"],
    ["Eli", "Acme", "WORKS_AT"],
  ].map(([a, b, label]) => ({ a, b, label, key: ekey(a, b) }));
  const NODES = Object.entries(KIND).map(([id, kind]) => ({ id, kind }));
  /* the lesson's breadth-first search: an edge can be walked either way, neighbours are tried in the order the edges are stored */
  const bfs = (a, b) => {
    const prev = { [a]: null };
    const q = [a];
    while (q.length) {
      const c = q.shift();
      if (c === b) break;
      EDGES.forEach(({ a: x, b: y }) => {
        const o = x === c ? y : y === c ? x : null;
        if (o && !(o in prev)) {
          prev[o] = c;
          q.push(o);
        }
      });
    }
    if (!(b in prev)) return [];
    const p = [];
    for (let c = b; c; c = prev[c]) p.unshift(c);
    return p;
  };
  const vertex = (id) => ({
    out: EDGES.filter((e) => e.a === id).map((e) => ({ to: e.b, label: e.label, key: e.key })),
    in: EDGES.filter((e) => e.b === id).map((e) => ({ from: e.a, label: e.label, key: e.key })),
  });
  const keyOf = (a, b) => (EDGES.some((e) => e.key === ekey(a, b)) ? ekey(a, b) : ekey(b, a));
  const pathKeys = (path) => path.slice(1).map((c, i) => keyOf(path[i], c));
  /* suggested centres for the seven vertices on the 936 x 640 stage (the lesson's layout, stretched) */
  const LAYOUT = {
    Ana: [140, 150],
    Ben: [410, 64],
    Cy: [700, 130],
    Dee: [800, 420],
    Eli: [500, 556],
    Leeds: [190, 440],
    Acme: [560, 330],
  };

  const PATH = bfs("Ana", "Dee");
  same(
    "graph: vertices",
    NODES.map((n) => n.id),
    ["Ana", "Ben", "Cy", "Dee", "Eli", "Leeds", "Acme"],
  );
  same(
    "graph: edge count by label",
    ["FRIEND", "LIVES_IN", "WORKS_AT"].map((l) => EDGES.filter((e) => e.label === l).length),
    [4, 2, 2],
  );
  same("graph: shortest chain Ana to Dee", PATH, ["Ana", "Ben", "Cy", "Dee"]);
  same("graph: the chain's edges", pathKeys(PATH), ["Ana>Ben", "Ben>Cy", "Cy>Dee"]);
  same(
    "graph: Ben's outgoing edges",
    vertex("Ben").out.map((e) => `${e.label} ${e.to}`),
    ["FRIEND Cy", "LIVES_IN Leeds"],
  );
  same(
    "graph: Ben's incoming edges",
    vertex("Ben").in.map((e) => `${e.from} ${e.label}`),
    ["Ana FRIEND"],
  );
  D2.GRAPH = { nodes: NODES, edges: EDGES, path: PATH, hops: PATH.length - 1, ben: vertex("Ben") };
  Object.assign(D2, { bfs, vertex, pathKeys, ekey: keyOf, LAYOUT });

  // ---------- 6. friends of friends (the workshop's query lab) ----------
  const CHAIN = {
    people: ["Ana", "Ben", "Cy", "Dee", "Eli"],
    friends: [
      ["Ana", "Ben"],
      ["Ben", "Cy"],
      ["Cy", "Dee"],
      ["Dee", "Eli"],
    ],
  };
  /* the workshop's runQuery on a chain: every hop goes to the friends not seen yet */
  const walk = (start, hops) => {
    let cur = [start];
    const seen = new Set(cur);
    let fetches = 0;
    const steps = [];
    for (let h = 1; h <= hops; h++) {
      fetches += cur.length;
      const reached = [];
      const edges = [];
      CHAIN.friends.forEach(([a, b]) => {
        [
          [a, b],
          [b, a],
        ].forEach(([x, y]) => {
          if (cur.includes(x) && !seen.has(y) && !reached.includes(y)) {
            reached.push(y);
            edges.push(ekey(x, y));
          }
        });
      });
      reached.forEach((p) => seen.add(p));
      steps.push({ hop: h, from: cur.slice(), reached, edges });
      cur = reached;
    }
    return { steps, hops, fetches, joins: hops, result: cur };
  };
  const w2 = walk("Ana", 2);
  const w3 = walk("Ana", 3);
  const w4 = walk("Ana", 4);
  same("hops: friends of friends of Ana", w2.result, ["Cy"]);
  same("hops: three hops", [w3.result, w3.joins, w3.fetches], [["Dee"], 3, 3]);
  same("hops: four hops", [w4.result, w4.joins, w4.fetches], [["Eli"], 4, 4]);
  same(
    "hops: the four hops' edges",
    w4.steps.map((s) => s.edges[0]),
    ["Ana>Ben", "Ben>Cy", "Cy>Dee", "Dee>Eli"],
  );
  D2.CHAIN = CHAIN;
  D2.walk = walk;

  // ---------- 7. the four NoSQL families ----------
  const FAMILIES = {
    doc: {
      name: "Document",
      coll: "recipes",
      lines: [
        { key: "name", text: "Pancakes" },
        { key: "mins", text: "20" },
        { key: "steps", items: ["Mix", "Rest", "Fry"] },
      ],
    },
    kv: {
      name: "Key-value",
      rows: [
        ["recipe#7", "meta"],
        ["recipe#7", "step#1"],
        ["recipe#7", "step#2"],
        ["recipe#7", "step#3"],
      ],
    },
    wide: {
      name: "Wide-column",
      rows: [
        { id: 7, cols: ["name", "mins", "tags"] },
        { id: 8, cols: ["name", "vegan", "kcal"] },
        { id: 9, cols: ["name", "mins"] },
      ],
    },
    graph: {
      name: "Graph",
      nodes: ["Pancakes", "Flour", "Eggs", "Breakfast", "Waffles"],
      edges: [
        ["Pancakes", "Flour", "USES"],
        ["Pancakes", "Eggs", "USES"],
        ["Pancakes", "Breakfast", "TAGGED"],
        ["Waffles", "Flour", "USES"],
      ],
    },
  };
  const usersOf = (ing) => FAMILIES.graph.edges.filter((e) => e[1] === ing && e[2] === "USES").map((e) => e[0]);
  const WORKLOADS = [
    { text: "Cart by user id", lines: ["Cart by", "user id"], family: "kv" },
    { text: "One whole product page", lines: ["One whole", "product page"], family: "doc" },
    { text: "Friends of friends", lines: ["Friends of", "friends"], family: "graph" },
    { text: "Events with varying columns", lines: ["Events with", "varying columns"], family: "wide" },
  ];
  same(
    "families: the key-value items share one partition key",
    [...new Set(FAMILIES.kv.rows.map((r) => r[0]))],
    ["recipe#7"],
  );
  same(
    "families: every sort key is different",
    new Set(FAMILIES.kv.rows.map((r) => r[1])).size,
    FAMILIES.kv.rows.length,
  );
  same(
    "families: wide-column rows have different columns",
    new Set(FAMILIES.wide.rows.map((r) => r.cols.join())).size,
    3,
  );
  same("families: who else uses flour", usersOf("Flour"), ["Pancakes", "Waffles"]);
  same("families: the four workloads use the four families once each", WORKLOADS.map((w) => w.family).sort(), [
    "doc",
    "graph",
    "kv",
    "wide",
  ]);
  Object.assign(D2, {
    AIMS: ["simple design", "scales out", "stays available"],
    FAMILIES,
    FAMILY_ORDER: ["doc", "kv", "wide", "graph"],
    WORKLOADS,
    usersOf,
  });
})();

/* Lecture 5 · Partitioning (Data Science, COM3021): the DATA and ALGORITHMS every scene of this video shares (window.VID.d5,
   short name D5). Pure data and rules, no DOM. Every number a scene shows comes from here, and every figure is asserted when the
   page loads (D5.same throws a clear Error if a rule ever disagrees with the numbers written in the storyboard).
   Drawing helpers: common-2.js (chip, tag, stat, disc, icons, fly) and common-3.js (cluster, meter, tank, hash box, cells).
   Indices are 0-based (node 0 = "Node 1", partition 0 = "P1") unless a name says otherwise. The data is the lecture's own (lessons
   ds5-why, ds5-range, ds5-hash, ds5-index, ds5-rebalance, workshop ds5-cluster in js/content/ds/ds-l5-*.js).

   0. TOOLS
        D5.same(label, got, want)   deep-equal assert, throws Error(`label: got ..., want ...`) otherwise; returns got
        D5.sum(list) D5.count(list, x) D5.sorted(list)   tiny helpers;  D5.pct(a, b) -> whole percent

   1. SPLIT THE DATA  (scene 2; lesson 5.1: twelve orders, four nodes, room for eight on each)
        D5.SPLIT = {orders: [1..12], nodes: 4, cap: 8, per: 3}
        D5.layout("rep" | "part" | "both") -> per node a list of {id, role: "copy" | "lead" | "fol"}
            rep  = every node holds all 12 copies (12 > cap: overflow 4)
            part = node p holds the 3 orders of partition p (orders 3p+1 .. 3p+3), role "lead"
            both = part + node p also holds a follower of partition p-1 (the previous node's leaders): 6 per node
        D5.SPLIT.over = 4 (copies that do not fit on a node)   D5.SPLIT.fits = 6 (orders per node with followers)
        D5.followerNode(p) -> the node that holds partition p's follower: (p + 1) % 4
        D5.lost(mode, crashedNodes) -> order ids with no live copy (used in the asserts: part loses 3 when one node crashes,
            both loses none)

   2. KEY RANGES  (scene 3; lesson 5.2: surnames in four ranges)
        D5.RANGES = ["A–F", "G–M", "N–S", "T–Z"]   (the en dash is a real "–")
        D5.nodeOfName(name) -> 0..3 by first letter       D5.NAME_NODES = [[...], [...], [...], [...]] the surnames each node
        starts with, in sorted order (every one asserted to belong to its node); D5.NEW_NAME = "Okafor" (goes to node 2,
        the N–S node, at list index 1, between Nolan and Patel);  D5.insertAt(list, name) -> index where the name keeps the list sorted
        D5.rangeQuery(from, to) -> {nodes: [indexes asked], hits: [[node, name], ...]} over D5.NAME_NODES
        D5.QUERY = rangeQuery("Khan", "Mills") = {nodes: [1], hits: [[1,"Khan"], [1,"Lewis"]]}  (Morgan is outside)

   3. THE TIMESTAMP TRAP  (scene 4; lesson 5.2)
        D5.HOURS = ["00–05", "06–11", "12–17", "18–23"]      D5.nodeOfTime("14:02") -> 2
        D5.WRITES = ["14:02", "14:09", "14:13", "14:21", "14:34", "14:50"]   D5.WRITE_NODE = 2 (every write lands there)
        D5.loadAt(k) -> [writes on node 0..3] after the first k writes, e.g. D5.loadAt(6) = [0, 0, 6, 0]

   4. HASH PARTITIONING  (scenes 5 and 6; lesson 5.3, ids 101-116, hash values 0-15, four hash values per node)
        D5.HASH_RANGES = ["0–3", "4–7", "8–11", "12–15"]
        D5.hashOf(id) -> 0..15 (the toy hash table from the lesson)     D5.hNode(id) -> node 0..3 (hash range holds the value)
        D5.rNode(id) -> node 0..3 for the KEY-RANGE layout (101-104 | 105-108 | 109-112 | 113-116)
        D5.ids(from, to) -> [from .. to]
        D5.KEYS8 = [101..108] in arrival order, D5.ARRIVALS = [{id, hash, node}, ...] (what scene 5 shows, in order)
        D5.HNODES / D5.RNODES = ids held by each node, in hash-layout order of arrival (sorted by id) for the 16 ids
        D5.askedNodes(ids, nodeFn) -> sorted node indexes a query for these ids must ask
        D5.RQ = {ids: [101..104], range: [0], hash: [0,1,2,3]}  asked nodes in the two layouts (1 node vs 4 nodes)

   5. SECONDARY INDEXES  (scenes 7 and 8; lesson 5.4, 12 used cars in 3 document partitions, id mod 3)
        D5.CARS = [[id, colour, make], ...] (ids 1..12), D5.carText(id) -> "4 red"     D5.docPart(id) -> (id - 1) % 3
        D5.DOCS = ids held by document partition 0..2 = [[1,4,7,10], [2,5,8,11], [3,6,9,12]]
        D5.TERMS = ["blue","ford","green","kia","mini","red"]     D5.idxPart(term) -> term index / 2 = 0..2 (index partitions
        split by term: [blue, ford] [green, kia] [mini, red])     D5.postings(term) -> ids of the cars that have the term
        D5.search("red") -> {term, ids: [1,4,6,9,12], local: [[1,4],[],[6,9,12]] (what each document partition's own index
            finds), askedDoc: 3 (partitions a by-document search must ask), idx: 2 (the one index partition of a by-term search),
            fetch: [0, 2] (document partitions read afterwards)}
        D5.NEWCAR = [13, "blue", "mini"]   D5.write(car) -> {docPart: 0, idxParts: [0, 2], byDoc: 1, byTerm: 3} (partitions
            touched: by document 1; by term the document partition plus 2 index partitions)

   6. REBALANCING  (scenes 9 and 10; lesson 5.5)
        D5.MOD = {n0: 3, n1: 4, keys: [0..11], from: k % 3, to: k % 4, moved: [3,4,...,11] (9 keys), stay: [0,1,2]}
        D5.FIXED = {parts: 12, own0: node of partition p before (p % 3), steals: [{p: 9, from: 0}, {p: 10, from: 1}, {p: 11,
            from: 2}] in order, own1: owner of every partition afterwards, nodes1: partitions per node after = [[0,3,6],
            [1,4,7],[2,5,8],[9,10,11]], moved: 3}
        D5.slotsOf(list, node) -> the keys/partitions held by a node, in order
        D5.DYN = {limit: 10, start: [6,8,4], grown: [10,12,8], split: [10,6,6,8], splitAt: 1, shrunk: [5,3,3,4],
            merged: [5,6,4], mergeAt: 1, mergeBelow: 7}   (GB; the lesson's demo rules, run as code: grow(sz, 4), splitOver,
            halve, mergeSmall)
*/
(function () {
  const V = window.VID;
  const D5 = (V.d5 = V.d5 || {});

  // ---------- 0. tools ----------
  const show = (v) => JSON.stringify(v);
  D5.same = (label, got, want) => {
    if (show(got) !== show(want)) throw new Error(`VID.d5 ${label}: got ${show(got)}, want ${show(want)}`);
    return got;
  };
  D5.sum = (a) => a.reduce((x, y) => x + y, 0);
  D5.count = (a, x) => a.filter((y) => y === x).length;
  D5.sorted = (a) => [...a].sort((p, q) => (p < q ? -1 : p > q ? 1 : 0));
  D5.pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  D5.ids = range;

  // ---------- 1. split the data ----------
  const N4 = 4;
  const SPLIT = (D5.SPLIT = { orders: range(1, 12), nodes: N4, cap: 8, per: 3 });
  D5.followerNode = (p) => (p + 1) % N4;
  D5.layout = (mode) => {
    const nodes = Array.from({ length: N4 }, () => []);
    SPLIT.orders.forEach((id) => {
      const p = Math.floor((id - 1) / SPLIT.per);
      if (mode === "rep") nodes.forEach((n) => n.push({ id, role: "copy" }));
      else {
        nodes[p].push({ id, role: "lead" });
        if (mode === "both") nodes[D5.followerNode(p)].push({ id, role: "fol" });
      }
    });
    return nodes;
  };
  D5.lost = (mode, crashed) => {
    const lay = D5.layout(mode);
    return SPLIT.orders.filter((id) => !lay.some((n, i) => !crashed.includes(i) && n.some((c) => c.id === id)));
  };
  SPLIT.over = SPLIT.orders.length - SPLIT.cap;
  SPLIT.fits = D5.layout("both")[0].length;
  D5.same(
    "split: replication needs 12 slots per node, 4 more than the 8 that fit",
    [D5.layout("rep").map((n) => n.length), SPLIT.over],
    [[12, 12, 12, 12], 4],
  );
  D5.same(
    "split: partitioning puts 3 orders on each node",
    D5.layout("part").map((n) => n.map((c) => c.id)),
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
    ],
  );
  D5.same(
    "split: with followers every node holds 6 (it fits in 8)",
    [D5.layout("both").map((n) => n.length), SPLIT.fits],
    [[6, 6, 6, 6], 6],
  );
  D5.same(
    "split: node 2 holds the followers of orders 1-3",
    D5.layout("both")[1]
      .filter((c) => c.role === "fol")
      .map((c) => c.id),
    [1, 2, 3],
  );
  D5.same(
    "split: node 1 holds the followers of orders 10-12",
    D5.layout("both")[0]
      .filter((c) => c.role === "fol")
      .map((c) => c.id),
    [10, 11, 12],
  );
  D5.same(
    "split: one crash loses 3 orders without followers, none with them",
    [D5.lost("part", [0]), D5.lost("both", [0])],
    [[1, 2, 3], []],
  );

  // ---------- 2. key ranges ----------
  const RANGES = (D5.RANGES = ["A–F", "G–M", "N–S", "T–Z"]);
  const EDGE = [70, 77, 83, 90]; // last letter code of each range (F, M, S, Z)
  D5.nodeOfName = (name) => EDGE.findIndex((e) => name.charCodeAt(0) <= e);
  D5.NAME_NODES = [
    ["Adams", "Chen", "Evans"],
    ["Jones", "Khan", "Lewis", "Morgan"],
    ["Nolan", "Patel", "Quinn"],
    ["Taylor", "Usman", "Young"],
  ];
  D5.NEW_NAME = "Okafor";
  D5.insertAt = (list, name) => {
    const i = list.findIndex((x) => x > name);
    return i < 0 ? list.length : i;
  };
  D5.NAME_NODES.forEach((list, n) =>
    list.forEach((name, i) => {
      D5.same(`ranges: ${name} belongs to node ${n}`, D5.nodeOfName(name), n);
      if (i) D5.same(`ranges: ${name} is sorted after ${list[i - 1]}`, list[i - 1] < name, true);
    }),
  );
  D5.rangeQuery = (from, to) => {
    const hits = D5.NAME_NODES.flatMap((list, n) => list.filter((x) => x >= from && x <= to).map((x) => [n, x]));
    return { nodes: [...new Set(hits.map((h) => h[0]))], hits };
  };
  D5.QUERY = D5.rangeQuery("Khan", "Mills");
  D5.same(
    "ranges: Okafor goes to N–S, between Nolan and Patel",
    [RANGES[D5.nodeOfName(D5.NEW_NAME)], D5.insertAt(D5.NAME_NODES[2], D5.NEW_NAME)],
    ["N–S", 1],
  );
  D5.same("ranges: Khan to Mills lives on one node", D5.QUERY, {
    nodes: [1],
    hits: [
      [1, "Khan"],
      [1, "Lewis"],
    ],
  });

  // ---------- 3. the timestamp trap ----------
  D5.HOURS = ["00–05", "06–11", "12–17", "18–23"];
  D5.nodeOfTime = (hhmm) => Math.floor(+hhmm.slice(0, 2) / 6);
  D5.WRITES = ["14:02", "14:09", "14:13", "14:21", "14:34", "14:50"];
  D5.WRITE_NODE = 2;
  D5.loadAt = (k) => {
    const load = [0, 0, 0, 0];
    D5.WRITES.slice(0, k).forEach((w) => load[D5.nodeOfTime(w)]++);
    return load;
  };
  D5.same(
    "hot spot: every write of the afternoon lands on node 2 (12–17)",
    [D5.WRITES.map(D5.nodeOfTime), D5.loadAt(6)],
    [Array(6).fill(2), [0, 0, 6, 0]],
  );

  // ---------- 4. hash partitioning ----------
  D5.HASH_RANGES = ["0–3", "4–7", "8–11", "12–15"];
  const HASH = [11, 2, 14, 6, 9, 0, 13, 4, 7, 15, 1, 10, 5, 12, 3, 8]; // ids 101..116
  D5.hashOf = (id) => HASH[id - 101];
  D5.hNode = (id) => Math.floor(D5.hashOf(id) / 4);
  D5.rNode = (id) => Math.floor((id - 101) / 4);
  D5.KEYS8 = range(101, 108);
  D5.ARRIVALS = D5.KEYS8.map((id) => ({ id, hash: D5.hashOf(id), node: D5.hNode(id) }));
  const ALL = range(101, 116);
  D5.HNODES = [0, 1, 2, 3].map((n) => ALL.filter((id) => D5.hNode(id) === n));
  D5.RNODES = [0, 1, 2, 3].map((n) => ALL.filter((id) => D5.rNode(id) === n));
  D5.askedNodes = (ids, fn) => [...new Set(ids.map(fn))].sort((a, b) => a - b);
  D5.RQ = {
    ids: range(101, 104),
    range: D5.askedNodes(range(101, 104), D5.rNode),
    hash: D5.askedNodes(range(101, 104), D5.hNode),
  };
  D5.same("hash: the 16 ids hash to 0-15 once each", D5.sorted(ALL.map(D5.hashOf)), range(0, 15));
  D5.same(
    "hash: ids 101-108 arrive as hash 11, 2, 14, 6, 9, 0, 13, 4 on nodes 2, 0, 3, 1, 2, 0, 3, 1",
    [D5.ARRIVALS.map((a) => a.hash), D5.ARRIVALS.map((a) => a.node)],
    [
      [11, 2, 14, 6, 9, 0, 13, 4],
      [2, 0, 3, 1, 2, 0, 3, 1],
    ],
  );
  D5.same(
    "hash: after eight keys every node holds two",
    [0, 1, 2, 3].map((n) =>
      D5.count(
        D5.ARRIVALS.map((a) => a.node),
        n,
      ),
    ),
    [2, 2, 2, 2],
  );
  D5.same(
    "hash: four ids per node in both layouts",
    [D5.HNODES.map((l) => l.length), D5.RNODES.map((l) => l.length)],
    [
      [4, 4, 4, 4],
      [4, 4, 4, 4],
    ],
  );
  D5.same("hash: the hash layout of 16 ids", D5.HNODES, [
    [102, 106, 111, 115],
    [104, 108, 109, 113],
    [101, 105, 112, 116],
    [103, 107, 110, 114],
  ]);
  D5.same("hash: ids 101-104 sit on 1 node with key ranges and on 4 with hashing", D5.RQ, {
    ids: [101, 102, 103, 104],
    range: [0],
    hash: [0, 1, 2, 3],
  });

  // ---------- 5. secondary indexes ----------
  D5.CARS = [
    [1, "red", "ford"], [2, "blue", "kia"], [3, "green", "mini"], [4, "red", "kia"],
    [5, "blue", "ford"], [6, "red", "mini"], [7, "green", "ford"], [8, "blue", "mini"],
    [9, "red", "ford"], [10, "green", "kia"], [11, "blue", "kia"], [12, "red", "mini"],
  ]; // prettier-ignore
  D5.carText = (id) => `${id} ${D5.CARS[id - 1][1]}`;
  D5.docPart = (id) => (id - 1) % 3;
  D5.DOCS = [0, 1, 2].map((p) => D5.CARS.filter((c) => D5.docPart(c[0]) === p).map((c) => c[0]));
  D5.TERMS = ["blue", "ford", "green", "kia", "mini", "red"];
  D5.idxPart = (term) => Math.floor(D5.TERMS.indexOf(term) / 2);
  const has = (car, term) => car[1] === term || car[2] === term;
  D5.postings = (term) => D5.CARS.filter((c) => has(c, term)).map((c) => c[0]);
  D5.search = (term) => {
    const ids = D5.postings(term);
    return {
      term,
      ids,
      local: D5.DOCS.map((d) => d.filter((id) => ids.includes(id))),
      askedDoc: 3,
      idx: D5.idxPart(term),
      fetch: D5.askedNodes(ids, D5.docPart),
    };
  };
  D5.NEWCAR = [13, "blue", "mini"];
  D5.write = (car) => {
    const idxParts = D5.askedNodes([car[1], car[2]], D5.idxPart);
    return { docPart: D5.docPart(car[0]), idxParts, byDoc: 1, byTerm: 1 + idxParts.length };
  };
  D5.same("index: 12 cars, four in each document partition", D5.DOCS, [
    [1, 4, 7, 10],
    [2, 5, 8, 11],
    [3, 6, 9, 12],
  ]);
  D5.same("index: red cars are 1, 4, 6, 9, 12 and partition 2 has none", D5.search("red").local, [
    [1, 4],
    [],
    [6, 9, 12],
  ]);
  D5.same(
    "index: a by-term search reads index partition 3 and fetches from partitions 1 and 3",
    [D5.search("red").idx, D5.search("red").fetch],
    [2, [0, 2]],
  );
  D5.same(
    "index: colour and make words per index partition",
    [0, 1, 2].map((p) => D5.TERMS.filter((t) => D5.idxPart(t) === p)),
    [
      ["blue", "ford"],
      ["green", "kia"],
      ["mini", "red"],
    ],
  );
  D5.same("index: saving car 13 (blue mini) touches 1 partition by document and 3 by term", D5.write(D5.NEWCAR), {
    docPart: 0,
    idxParts: [0, 2],
    byDoc: 1,
    byTerm: 3,
  });

  // ---------- 6. rebalancing ----------
  const KEYS12 = range(0, 11);
  D5.MOD = { n0: 3, n1: 4, keys: KEYS12, from: KEYS12.map((k) => k % 3), to: KEYS12.map((k) => k % 4) };
  D5.MOD.moved = KEYS12.filter((k) => k % 3 !== k % 4);
  D5.MOD.stay = KEYS12.filter((k) => k % 3 === k % 4);
  D5.same(
    "rebalance: hash mod N moves 9 of 12 keys when N goes 3 to 4",
    [D5.MOD.moved, D5.MOD.stay],
    [range(3, 11), [0, 1, 2]],
  );
  const own0 = KEYS12.map((p) => p % 3);
  const own1 = own0.slice();
  const steals = [];
  while (own1.filter((o) => o === 3).length < Math.floor(12 / 4)) {
    const cnt = (n) => own1.filter((o) => o === n).length;
    const most = Math.max(cnt(0), cnt(1), cnt(2));
    const from = [0, 1, 2].find((n) => cnt(n) === most);
    const p = own1.lastIndexOf(from);
    own1[p] = 3;
    steals.push({ p, from });
  }
  D5.slotsOf = (list, node) => list.flatMap((o, i) => (o === node ? [i] : []));
  D5.FIXED = {
    parts: 12,
    own0,
    steals,
    own1,
    nodes1: [0, 1, 2, 3].map((n) => D5.slotsOf(own1, n)),
    moved: steals.length,
  };
  D5.same(
    "rebalance: the new node steals P9, P10, P11 from the fullest nodes",
    [steals, D5.FIXED.nodes1, D5.FIXED.moved],
    [
      [
        { p: 9, from: 0 },
        { p: 10, from: 1 },
        { p: 11, from: 2 },
      ],
      [
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [9, 10, 11],
      ],
      3,
    ],
  );
  // dynamic partitions: the lesson's demo rules in GB (limit 10, merge neighbours that fit under 7)
  const LIMIT = 10;
  const grow = (sz, add) => sz.map((g) => g + add);
  const splitOver = (sz) => sz.flatMap((g) => (g > LIMIT ? [g / 2, g / 2] : [g]));
  const mergeSmall = (sz, below) => {
    const out = sz.slice();
    for (let i = 0; i < out.length;) {
      if (i + 1 < out.length && out[i] + out[i + 1] < below) {
        out[i] += out[i + 1];
        out.splice(i + 1, 1);
      } else i++;
    }
    return out;
  };
  const start = [6, 8, 4];
  const grown = grow(start, 4);
  const split = splitOver(grown);
  const shrunk = split.map((g) => g / 2);
  D5.DYN = { limit: LIMIT, start, grown, split, splitAt: grown.findIndex((g) => g > LIMIT), shrunk, mergeBelow: 7 };
  D5.DYN.merged = mergeSmall(shrunk, D5.DYN.mergeBelow);
  D5.DYN.mergeAt = shrunk.findIndex((g, i) => i + 1 < shrunk.length && g + shrunk[i + 1] < D5.DYN.mergeBelow);
  D5.same(
    "dynamic: +4 GB each takes 6, 8, 4 to 10, 12, 8 and only the 12 splits",
    [grown, split, D5.DYN.splitAt],
    [[10, 12, 8], [10, 6, 6, 8], 1],
  );
  D5.same(
    "dynamic: halving the data and merging small neighbours",
    [shrunk, D5.DYN.merged, D5.DYN.mergeAt],
    [[5, 3, 3, 4], [5, 6, 4], 1],
  );
})();

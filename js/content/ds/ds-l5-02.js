/* Data Science Lecture 5, part 2: ds5-hash (5.3) hash partitioning and ds5-index (5.4) secondary indexes. */
(function () {
  const S = NIC.shared.dsL5 || {};
  const { reg, chip, nodesHtml } = S;
  const N = NIC;
  const { el, qs, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;

  /* ============ 5.3 Hash partitioning ============ */
  // Toy hash for ids 101..116: values 0..15, four per node (hash range 0-3, 4-7, 8-11, 12-15).
  const HASH = [11, 2, 14, 6, 9, 0, 13, 4, 7, 15, 1, 10, 5, 12, 3, 8];
  const H0 = 101,
    HN = 16;
  const hNode = (id) => Math.floor(HASH[id - H0] / 4);
  const rNode = (id) => Math.floor((id - H0) / 4);
  const HR = ["0–3", "4–7", "8–11", "12–15"];

  function hashRun(box, life) {
    F.run(box, life, {
      code: [
        "take the key",
        "hash it to a number from 0 to 15",
        "find the node whose hash range holds that number",
        "store the key there",
      ],
      build(stage) {
        const r = el(`<div></div>`);
        stage.appendChild(r);
        return r;
      },
      *frames() {
        const got = [[], [], [], []];
        const snap = (x) => ({ got: got.map((a) => a.slice()), id: 0, to: -1, ...x });
        yield snap({
          cap: "Four nodes, each owning a <b>range of hash values</b> (0 to 15 split in four). Keys arrive in order: 101, 102, 103...",
          line: 0,
        });
        for (let id = H0; id < H0 + 8; id++) {
          const h = HASH[id - H0],
            to = hNode(id);
          got[to].push(id);
          const f = snap({
            id,
            to,
            cap: `Key <b>${id}</b> hashes to <b>${h}</b>, which is in <b>${HR[to]}</b>: <b>Node ${to + 1}</b>.`,
            line: 2,
          });
          if (id === H0)
            f.ask = {
              q: "Key 101 hashes to 11. Tap the node whose hash range contains 11.",
              pick: ".ds5-node",
              a: ["N3"],
              why: "11 lies in 8–11, which is Node 3's range.",
            };
          yield f;
        }
        yield snap({
          cap: "Eight keys, two on every node. Keys 101 to 104, which were neighbours, ended up on <b>four different nodes</b>: even load, but scattered.",
          line: 3,
        });
      },
      draw(sc, f) {
        sc.innerHTML = `${f.id ? `<div class="faint" style="font-weight:800;margin-bottom:4px">Key <b class="mono">${f.id}</b> hash <b class="mono">${HASH[f.id - H0]}</b></div>` : ""}${nodesHtml(
          f.got.map((a, i) => ({
            name: `Node ${i + 1}`,
            k: `N${i + 1}`,
            sub: `hash ${HR[i]}`,
            cls: f.to === i ? "hit" : "",
            chips: a.map((id) => chip(id, id === f.id ? "new" : "")),
          })),
        )}`;
      },
    });
  }

  reg({
    id: "ds5-hash",
    order: 3,
    num: "5.3",
    title: "Hash partitioning",
    blurb: "Hash the key and give each partition a range of hashes: an even spread, but range queries get scattered.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let start = 101,
        width = 4;
      const card =
        el(`<div class="card"><div class="card-head"><h2>One range query, two layouts</h2><span class="tag">user ids 101 to 116, four nodes</span></div>
        <div class="controls" id="sl"></div>
        <div class="grid two"><div><div class="ds5-lbl">Key-range layout</div><div id="a"></div></div><div><div class="ds5-lbl">Hash layout</div><div id="b"></div></div></div>
        <div class="stat-row"><div class="stat"><small>Nodes asked: key range</small><b id="s1"></b></div><div class="stat amber"><small>Nodes asked: hash</small><b id="s2"></b></div></div>
        <p id="msg" class="dim" style="min-height:48px"></p></div>`);
      root.appendChild(card);
      const s1 = N.slider("Query starts at user id", 101, 116, 1, start),
        s2 = N.slider("Number of ids wanted", 1, 8, 1, width);
      s1.onInput((v) => ((start = v), draw()));
      s2.onInput((v) => ((width = v), draw()));
      qs("#sl", card).append(s1, s2);
      function draw() {
        const ids = Array.from({ length: width }, (_, i) => start + i).filter((x) => x < H0 + HN);
        const mk = (of, lab) =>
          nodesHtml(
            [0, 1, 2, 3].map((n) => {
              const mine = Array.from({ length: HN }, (_, i) => H0 + i).filter((id) => of(id) === n);
              return {
                name: `Node ${n + 1}`,
                sub: lab(n),
                cls: ids.some((id) => of(id) === n) ? "hit" : "",
                chips: mine.map((id) => chip(id, ids.includes(id) ? "hit" : "")),
              };
            }),
          );
        qs("#a", card).innerHTML = mk(rNode, (n) => `${H0 + 4 * n}–${H0 + 4 * n + 3}`);
        qs("#b", card).innerHTML = mk(hNode, (n) => `hash ${HR[n]}`);
        const a = new Set(ids.map(rNode)).size,
          b = new Set(ids.map(hNode)).size;
        qs("#s1", card).textContent = a;
        qs("#s2", card).textContent = b;
        qs("#msg", card).innerHTML =
          ids.length < 2
            ? "A lookup of a <b>single key</b> goes to one node in both layouts."
            : b > a
              ? `Key ranges keep neighbours together: <b>${a}</b> node${a > 1 ? "s" : ""}. Hashing scatters them, so the query has to ask <b>${b}</b> nodes.`
              : `This particular range happens to touch the same number of nodes (${a}). Try a different start or a wider range.`;
      }
      draw();
      root.appendChild(
        predict({
          id: "ds5-hash-1",
          q: "The query is ids <b>101 to 104</b> (start 101, four ids). How many nodes does each layout have to ask?",
          opts: ["Key range 1, hash 4", "Key range 4, hash 1", "Both ask 1 node"],
          a: 0,
          why: "In the key-range layout, 101 to 104 are neighbours on Node 1. Their hashes (11, 2, 14, 6) fall in four different hash ranges, so each lives on a different node.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds5-hash-2",
          q: "Why can't the hash layout aim a range query at just a few nodes?",
          opts: [
            "Neighbouring keys hash to unrelated values, so any node may hold some",
            "Hash nodes refuse range queries by design, to protect themselves",
            "The keys are no longer sorted inside each individual node",
          ],
          a: 0,
          why: "A hash function deliberately destroys key order. Without knowing which hash values the range maps to, the database must ask every partition.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Hash partitioning</b>: a hash function maps the key to a number, and each partition owns a <b>range of hashes</b> instead of a range of keys.",
            "It distributes keys <b>fairly</b> and avoids the timestamp hot spot.",
            "The price: keys that were adjacent are <b>scattered</b>, so efficient <b>range queries</b> are lost.",
            "Workarounds: <b>send the query to all partitions</b> (MongoDB), or use a <b>compound key</b> and hash only the first part (Cassandra).",
          ],
          "Hashing buys an even spread by throwing away key order.",
        ),
      );
    },
  });

  L["ds5-hash"] = {
    sum: "<b>Hash partitioning</b> sends each key to the partition that owns its hash. Load is spread evenly, but a range query must ask every partition.",
    steps: [
      {
        t: "Hash the key",
        b: `<p>A <b>hash function</b> turns a key into a number. Instead of giving each partition a range of <b>keys</b>, give it a range of <b>hashes</b>. To place a key, hash it and see whose range contains the result.</p>`,
        v: F.flow([
          { t: "key", s: "user 101", c: "violet" },
          { t: "hash", s: "11", c: "blue" },
          { t: "range 8–11", s: "Node 3", c: "teal" },
        ]),
        c: {
          q: "Hashes run from 0 to 99, split into four equal ranges: 0–24, 25–49, 50–74 and 75–99 (nodes 1 to 4). A key hashes to 62. Which node stores it?",
          o: ["Node 2", "Node 3", "Node 4"],
          a: 1,
          why: "62 lies between 50 and 74, the third range, so the key goes to Node 3.",
        },
      },
      {
        t: "Neighbours are scattered",
        b: `<p>A good hash function gives <b>unrelated</b> outputs for similar inputs. So consecutive keys land on <b>different</b> partitions.</p>`,
        v: F.cells(
          [
            { v: "101", sub: "hash 11", c: "teal" },
            { v: "102", sub: "hash 2", c: "blue" },
            { v: "103", sub: "hash 14", c: "amber" },
            { v: "104", sub: "hash 6", c: "violet" },
          ],
          { size: 70, label: "Neighbouring keys" },
        ),
        c: {
          q: "Keys 201, 202 and 203 are stored one after another by a hash-partitioned database. Where are they likely to be?",
          o: [
            "On unrelated partitions",
            "Always together in the same partition",
            "In partitions that follow the key order",
          ],
          a: 0,
          why: "The hash output has no relation to the key order, so adjacent keys are spread around.",
        },
      },
      {
        t: "A fair spread",
        b: `<p>Hash partitioning is good at distributing keys <b>fairly</b> among partitions. Even if keys arrive in order, such as timestamps, their hashes are all over the place, so the writes spread out instead of piling up.</p>`,
        v: F.compare(
          { title: "Key range, timestamp key", c: "rose", body: "one partition takes every new write" },
          { title: "Hash of the timestamp", c: "teal", body: "writes spread over every partition" },
        ),
        c: {
          q: "A stream of readings is keyed by timestamp. What does hashing the key do to the write load?",
          o: [
            "It spreads the writes across the partitions",
            "It sends every write to one partition",
            "It sorts the writes by time",
          ],
          a: 0,
          why: "Hashing breaks the link between arrival order and partition, so there is no single hot partition.",
        },
      },
      {
        t: "Watch it run",
        b: `<p>Keys 101 to 108 arrive in order. Press <b>play</b> or step through them and see where each one lands.</p>`,
        v: (box, life) => hashRun(box, life),
      },
      {
        t: "The cost: range queries",
        b: `<p>You <b>lose</b> efficient range queries: keys that were once adjacent are now scattered across partitions. One answer is to <b>send the query to all partitions</b> (MongoDB does this).</p>`,
        v: F.compare(
          { title: "Key range", c: "teal", body: "ids 101 to 104: ask <b>1</b> node" },
          { title: "Hash", c: "rose", body: "ids 101 to 104: ask <b>all 4</b> nodes" },
        ),
        c: {
          q: "A hash-partitioned cluster has 8 partitions. A query wants all orders with ids from 500 to 520. What must the database do?",
          o: ["Ask every partition", "Ask only the partition holding 500", "Ask two neighbouring partitions"],
          a: 0,
          why: "Ids 500 to 520 hash to unrelated places, so any partition might hold some. The query goes to all of them.",
        },
      },
      {
        t: "Compound keys",
        b: `<p>Another answer, used in <b>Cassandra</b>: a <b>compound key</b> of several columns, and only the <b>first</b> is hashed. That picks the partition. Inside it, the rows stay sorted by the other columns, so a range over them is efficient.</p>`,
        v: F.flow([
          { t: "key", s: "(sensor 12, time)", c: "violet" },
          { t: "hash sensor 12", s: "picks partition", c: "blue" },
          { t: "sorted by time", s: "range scan inside", c: "teal" },
        ]),
        c: {
          q: "Readings use the compound key (sensor, time), hashing only the sensor. A query asks for sensor 12's readings between 09:00 and 10:00. How is it answered?",
          o: [
            "By one partition, scanning a sorted time range",
            "By every partition, because time is not hashed",
            "It cannot be answered without scanning all data",
          ],
          a: 0,
          why: "Hashing the sensor places all of sensor 12's readings in one partition, sorted by time, so the range query only visits that partition.",
        },
      },
    ],
    guide: [
      "Drag <b>Query starts at user id</b> and <b>Number of ids wanted</b> and compare the nodes asked in each layout.",
      "Set the number of ids to 1, then to 8.",
      "Answer the questions after the demo.",
    ],
  };

  /* ============ 5.4 Secondary indexes ============ */
  const BASE = [
    [1, "red", "ford"],
    [2, "blue", "kia"],
    [3, "green", "mini"],
    [4, "red", "kia"],
    [5, "blue", "ford"],
    [6, "red", "mini"],
    [7, "green", "ford"],
    [8, "blue", "mini"],
    [9, "red", "ford"],
    [10, "green", "kia"],
    [11, "blue", "kia"],
    [12, "red", "mini"],
  ];
  const TERMS = ["blue", "ford", "green", "kia", "mini", "red"];
  const dPart = (id) => (id - 1) % 3;
  const iPart = (t) => Math.floor(TERMS.indexOf(t) / 2);

  reg({
    id: "ds5-index",
    order: 4,
    num: "5.4",
    title: "Secondary indexes",
    blurb: "Searching by colour or make is not by key. Index by document or by term: compare the nodes each one asks.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let mode = "doc",
        docs = BASE.map((d) => d.slice()),
        v = { ask: new Set(), idx: new Set(), hit: new Set(), neu: 0, wd: new Set(), wi: new Set() };
      const card =
        el(`<div class="card"><div class="card-head"><h2>Used cars in three partitions</h2><span class="tag">documents partitioned by id</span></div>
        <div class="controls" id="m"></div>
        <div class="ds5-lbl">Search for</div><div class="controls" id="t"></div>
        <div id="dp"></div><div id="ip"></div>
        <div class="controls"><button class="btn" id="add">Save a new car</button></div>
        <div class="stat-row"><div class="stat"><small>Partitions asked by the last search</small><b id="s1">-</b></div><div class="stat amber"><small>Partitions touched by the last write</small><b id="s2">-</b></div></div>
        <p id="msg" class="dim" style="min-height:66px">Pick a word to search for.</p></div>`);
      root.appendChild(card);
      qs("#m", card).appendChild(
        N.seg(
          [
            ["doc", "Index by document"],
            ["term", "Index by term"],
          ],
          mode,
          (x) => {
            mode = x;
            v = { ask: new Set(), idx: new Set(), hit: new Set(), neu: 0, wd: new Set(), wi: new Set() };
            qs("#s1", card).textContent = qs("#s2", card).textContent = "-";
            qs("#msg", card).innerHTML = "Pick a word to search for.";
            draw();
          },
        ),
      );
      TERMS.forEach((t) => {
        const b = el(`<button class="btn small">${t}</button>`);
        b.onclick = () => search(t);
        qs("#t", card).appendChild(b);
      });
      const has = (d, t) => d[1] === t || d[2] === t;
      function search(t) {
        const m = docs.filter((d) => has(d, t));
        v.hit = new Set(m.map((d) => d[0]));
        v.neu = 0;
        v.wd = new Set();
        v.wi = new Set();
        if (mode === "doc") {
          v.ask = new Set([0, 1, 2]);
          v.idx = new Set();
          qs("#s1", card).textContent = 3;
          qs("#msg", card).innerHTML =
            `"<b>${t}</b>" matches ${m.length} cars, but any partition may hold some, so the query goes to <b>all 3</b> partitions. Each searches its own local index and the answers are <b>gathered</b>: <b>scatter-gather</b>.`;
        } else {
          v.idx = new Set([iPart(t)]);
          v.ask = new Set(m.map((d) => dPart(d[0])));
          qs("#s1", card).textContent = 1;
          qs("#msg", card).innerHTML =
            `"<b>${t}</b>" lives in index partition <b>${iPart(t) + 1}</b>. Asking <b>just that one</b> gives the ids of all ${m.length} cars, then the documents are fetched from ${v.ask.size} partition${v.ask.size > 1 ? "s" : ""}.`;
        }
        draw();
      }
      qs("#add", card).onclick = () => {
        const d = [
          docs.length + 1,
          ["red", "blue", "green"][Math.floor(N.rnd() * 3)],
          ["ford", "kia", "mini"][Math.floor(N.rnd() * 3)],
        ];
        docs.push(d);
        v = { ask: new Set(), idx: new Set(), hit: new Set(), neu: d[0], wd: new Set([dPart(d[0])]), wi: new Set() };
        if (mode === "term") v.wi = new Set([iPart(d[1]), iPart(d[2])]);
        const n = v.wd.size + v.wi.size;
        qs("#s2", card).textContent = n;
        qs("#s1", card).textContent = "-";
        qs("#msg", card).innerHTML =
          mode === "doc"
            ? `Car ${d[0]} (${d[1]} ${d[2]}) is saved in partition ${dPart(d[0]) + 1}, and that partition updates its own local index: <b>1</b> partition touched.`
            : `Car ${d[0]} (${d[1]} ${d[2]}) is saved in partition ${dPart(d[0]) + 1}, and its terms <b>${d[1]}</b> and <b>${d[2]}</b> live in ${v.wi.size === 1 ? "the same index partition" : "<b>two different</b> index partitions"}: <b>${n}</b> partitions touched.`;
        draw();
      };
      function draw() {
        qs("#dp", card).innerHTML = nodesHtml(
          [0, 1, 2].map((p) => {
            const mine = docs.filter((d) => dPart(d[0]) === p);
            const loc = TERMS.map((t) => [t, mine.filter((d) => has(d, t)).map((d) => d[0])])
              .filter((x) => x[1].length)
              .map((x) => `${x[0]}: ${x[1].join(",")}`)
              .join(" · ");
            return {
              name: `Documents ${p + 1}`,
              sub: `${mine.length} cars`,
              cls: v.ask.has(p) ? "hit" : v.wd.has(p) ? "fresh" : "",
              chips: mine.map((d) =>
                chip(`${d[0]} ${d[1]} ${d[2]}`, d[0] === v.neu ? "new" : v.hit.has(d[0]) ? "hit" : ""),
              ),
              extra:
                mode === "doc"
                  ? `<div class="faint" style="font-size:11px;font-weight:700;margin-top:6px">local index: ${loc}</div>`
                  : "",
            };
          }),
        );
        qs("#ip", card).innerHTML =
          mode === "term"
            ? `<div class="ds5-lbl">Index partitions (split by term)</div>${nodesHtml(
                [0, 1, 2].map((p) => ({
                  name: `Index ${p + 1}`,
                  cls: v.idx.has(p) ? "hit" : v.wi.has(p) ? "fresh" : "",
                  chips: TERMS.filter((t) => iPart(t) === p).map((t) =>
                    chip(
                      `${t} → ${docs
                        .filter((d) => has(d, t))
                        .map((d) => d[0])
                        .join(",")}`,
                    ),
                  ),
                })),
              )}`
            : "";
      }
      draw();
      root.appendChild(
        predict({
          id: "ds5-index-1",
          q: '<b>Index by document</b> with 3 partitions. You search for "red". How many partitions must be asked?',
          opts: ["1", "2", "All 3"],
          a: 2,
          why: "Each partition indexes only its own documents, and red cars could be in any of them. The query is scattered to every partition and the answers gathered.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds5-index-2",
          q: '<b>Index by term</b>. A new <b>blue mini</b> is saved. "blue" lives in index partition 1 and "mini" in index partition 3. Besides the document\'s own partition, how many index partitions are updated?',
          opts: ["0", "1", "2"],
          a: 2,
          why: "One document has two terms, and they are stored in different index partitions, so a single write updates both. Writes get more expensive, reads cheaper.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>secondary index</b> does not identify a record uniquely (many cars are red). It is used for searching and sorting, and it does not map neatly onto partitions.",
            "<b>By document</b> (local): each partition indexes its own documents. A write touches one partition; a search is <b>scatter-gather</b> over all.",
            "<b>By term</b> (global): the index itself is partitioned by term. A search asks the term's partition; a write may touch <b>several</b> index partitions.",
            "Choose by workload: many searches favour by term, many writes favour by document.",
          ],
          "A local index makes writes cheap and reads wide; a global index makes reads narrow and writes wide.",
        ),
      );
    },
  });

  Object.assign(S, { HASH });
})();

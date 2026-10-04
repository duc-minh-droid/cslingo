(function () {
  const partScope = (NIC.shared.dsL23 = NIC.shared.dsL23 || {});
  const { GE, GN, bfs, mono, pick, reg2, reg3, sorter } = partScope;
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  reg2({
    id: "ds-graph",
    order: 3,
    num: "2.3",
    title: "Graph models",
    blurb: "When relationships are the data: vertices, edges, and asking questions by walking the graph.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let mode = "inspect",
        sel = null,
        start = null,
        path = [];
      const card =
        el(`<div class="card"><div class="card-head"><h2>A property graph</h2><span class="tag">people, a city and a company</span></div>
        <div class="controls" id="g1"></div>
        <div class="grid two"><div><svg id="gs" viewBox="0 0 460 260" class="fig" style="max-height:260px"></svg></div><div id="gp" class="dim" style="min-height:120px"></div></div></div>`);
      root.appendChild(card);
      qs("#g1", card).append(
        N.seg(
          [
            ["inspect", "Inspect a vertex"],
            ["path", "Find a path"],
          ],
          mode,
          (v) => {
            mode = v;
            sel = null;
            start = null;
            path = [];
            draw();
          },
        ),
      );
      const COL = { person: "var(--blue)", city: "var(--amber)", company: "var(--violet)" };
      function draw() {
        const onPath = (a, b) =>
          path.some((x, i) => path[i + 1] && ((x === a && path[i + 1] === b) || (x === b && path[i + 1] === a)));
        const lines = GE.map(([a, b, lb]) => {
          const [x1, y1] = GN[a],
            [x2, y2] = GN[b],
            hot = onPath(a, b) || (sel && (a === sel || b === sel));
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hot ? "var(--teal)" : "var(--line-2)"}" stroke-width="${hot ? 4 : 2}" stroke-linecap="round"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 4}" text-anchor="middle" style="font:700 9.5px var(--sans);fill:var(--text-faint)">${lb}</text>`;
        }).join("");
        const dots = Object.entries(GN)
          .map(([k, [x, y, t]]) => {
            const on = sel === k || start === k || path.includes(k);
            return `<g data-n="${k}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="22" fill="color-mix(in srgb, ${COL[t]} ${on ? 32 : 14}%, var(--panel-2))" stroke="${on ? "var(--teal)" : COL[t]}" stroke-width="${on ? 4 : 2.5}"/><text x="${x}" y="${y + 4}" text-anchor="middle" style="font:800 12px var(--sans);fill:var(--text)">${k}</text></g>`;
          })
          .join("");
        qs("#gs", card).innerHTML = lines + dots;
        qsa("[data-n]", card).forEach((g) => (g.onclick = () => click(g.dataset.n)));
        const P = qs("#gp", card);
        if (mode === "inspect") {
          if (!sel)
            P.innerHTML =
              "Tap any <b>vertex</b>. The graph lists its <b>outgoing</b> and <b>incoming</b> edges straight away, which is what makes traversal cheap.";
          else {
            const out = GE.filter((e) => e[0] === sel),
              inn = GE.filter((e) => e[1] === sel);
            P.innerHTML = `<b>${sel}</b> <span class="faint">(${GN[sel][2]}, id ${Object.keys(GN).indexOf(sel) + 1})</span><br><b>Outgoing:</b> ${out.length ? out.map((e) => `${e[2]} → ${e[1]}`).join(", ") : "none"}<br><b>Incoming:</b> ${inn.length ? inn.map((e) => `${e[0]} → (${e[2]})`).join(", ") : "none"}`;
          }
        } else if (!start) P.innerHTML = "Tap a <b>start</b> vertex, then an <b>end</b> vertex.";
        else if (!path.length) P.innerHTML = `Start: <b>${start}</b>. Now tap the end vertex.`;
        else
          P.innerHTML = `Shortest chain from <b>${path[0]}</b> to <b>${path[path.length - 1]}</b>: <b>${path.join(" → ")}</b><br>That is <b>${path.length - 1} hop${path.length > 2 ? "s" : ""}</b>. Edges can join any two vertices, and the label says what the relationship means.`;
      }
      function click(k) {
        if (mode === "inspect") sel = k;
        else if (!start || path.length) {
          start = k;
          path = [];
        } else path = k === start ? [k] : bfs(start, k);
        N.sfx && N.sfx.play("select");
        draw();
      }
      draw();

      root.appendChild(
        predict({
          id: "ds-graph-1",
          q: "Which data is most naturally a graph?",
          opts: [
            "Junctions and roads, when routes matter",
            "Monthly sales totals for one small shop",
            "A pile of independent temperature readings from sensors",
          ],
          a: 0,
          why: "Junctions are vertices and roads are edges, and questions like shortest route are about walking the edges. Totals and independent readings have no relationships to walk.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-graph-2",
          q: "In a property graph, which items does an edge hold?",
          opts: [
            "An ID, its two end vertices, a label and properties",
            "A row of values matching one shared table schema",
            "A list of every other vertex it could reach",
          ],
          a: 0,
          why: "An edge has a unique ID, a head and a tail vertex, a relationship label and key-value properties. Each vertex has an ID, its incoming and outgoing edges and properties.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Complex <b>many-to-many</b> relationships are hard for document and relational models. A <b>graph</b> models entities as <b>vertices</b> and relationships as <b>edges</b>.",
            "Examples: social networks (heterogeneous vertices and edges), the web, road networks.",
            "Well-known algorithms work on graphs: <b>Dijkstra</b> for shortest routes, <b>PageRank</b> for page relevance.",
            "<b>Property graph</b>: vertex = ID, in/out edges, properties. Edge = ID, head, tail, label, properties. It can be seen as two tables (vertices, edges), but any vertex may link to any other.",
          ],
          "When the relationships are the point, store them as edges so a question becomes a walk across the graph.",
        ),
      );
    },
  });

  /* ============ 2.4 NoSQL families ============ */
  reg2({
    id: "ds-nosql",
    order: 4,
    num: "2.4",
    title: "The four NoSQL families",
    blurb: "Document, key-value, wide-column and graph: what NoSQL is for, and what each family is good at.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let fam = "doc";
      const card =
        el(`<div class="card"><div class="card-head"><h2>One pancake recipe, four shapes</h2><span class="tag">same data</span></div>
        <div class="controls" id="f1"></div><div id="f2"></div><p id="f3" class="dim"></p></div>`);
      root.appendChild(card);
      const SHAPES = {
        doc: [
          mono(
            `collection: recipes\n{ "_id": 7,\n  "name": "Pancakes",\n  "mins": 20,\n  "steps": ["Mix", "Rest", "Fry"],\n  "tags": ["breakfast"] }`,
          ),
          "<b>Document</b> (MongoDB): databases hold <b>collections</b> (like tables without a rigid schema). One recipe is one document, and a query language searches inside them.",
        ],
        kv: [
          mono(
            `partition key   sort key      attributes\nrecipe#7        meta          name: Pancakes, mins: 20\nrecipe#7        step#1        Mix\nrecipe#7        step#2        Rest\nrecipe#7        step#3        Fry`,
          ),
          "<b>Key-value</b> (DynamoDB): every item is found by its key. A <b>complex key</b> (partition key + sort key) groups related items and orders them. The schema is defined per item.",
        ],
        wide: [
          mono(
            `row 7:  name=Pancakes | mins=20 | tags=breakfast\nrow 8:  name=Salad    | vegan=yes | kcal=180\nrow 9:  name=Soup      | mins=45`,
          ),
          "<b>Wide-column</b> (Cassandra): data sits in tables, rows and columns like a relational database, but <b>column names and formats can vary from row to row</b>.",
        ],
        graph: [
          mono(
            `(Pancakes)-[USES]->(Flour)\n(Pancakes)-[USES]->(Eggs)\n(Pancakes)-[TAGGED]->(Breakfast)\n(Waffles)-[USES]->(Flour)`,
          ),
          "<b>Graph</b>: vertices and edges. Ideal when the question is about how things connect (who else uses flour?).",
        ],
      };
      qs("#f1", card).append(
        N.seg(
          [
            ["doc", "Document"],
            ["kv", "Key-value"],
            ["wide", "Wide-column"],
            ["graph", "Graph"],
          ],
          fam,
          (v) => {
            fam = v;
            dr();
          },
        ),
      );
      const dr = () => {
        qs("#f2", card).innerHTML = SHAPES[fam][0];
        qs("#f3", card).innerHTML = SHAPES[fam][1];
      };
      dr();
      sorter(
        root,
        "Which NoSQL family fits?",
        [
          ["Document", "whole objects"],
          ["Key-value", "look up by key"],
          ["Wide-column", "rows vary, huge scale"],
          ["Graph", "relationships"],
        ],
        [
          ["Shopping cart per user id, read and overwritten as a whole", "Key-value"],
          [
            "A product catalogue where each product type has different attributes and a page shows one whole product",
            "Document",
          ],
          ["Suggest friends of friends in a social network", "Graph"],
          [
            "Time-stamped events spread over many servers, where each event has a different set of columns",
            "Wide-column",
          ],
          ["Session tokens fetched by token id, millions per second", "Key-value"],
          ["Blog posts with their nested comments, fetched together", "Document"],
          ["Find accounts that share phone numbers, addresses and cards", "Graph"],
          ["A huge sensor archive where devices report different measurements", "Wide-column"],
        ],
      );
      root.appendChild(
        predict({
          id: "ds-nosql-1",
          q: "Which of these is NOT one of the aims NoSQL databases stress?",
          opts: [
            "Enforcing one strict schema on every record",
            "Simplicity of design",
            "Horizontal scaling and availability",
          ],
          a: 0,
          why: "NoSQL stresses simplicity, scalability (scaling out across machines) and availability, and mostly relaxes rigid schemas.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-nosql-2",
          q: "In a key-value store with a partition key and a sort key, what does the sort key let you do?",
          opts: [
            "Keep related items under one partition key, in order",
            "Join two tables together by a foreign key",
            "Force every item to use exactly the same attributes",
          ],
          a: 0,
          why: "A composite key groups items that belong together (same partition key) and orders them (sort key). Attributes are still defined per item.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>NoSQL</b> = non-relational storage and retrieval, focused on <b>simple design</b>, <b>scalability</b> (horizontal) and <b>availability</b>.",
            "Four families: <b>document</b> (MongoDB, CouchDB, Firestore), <b>key-value</b> (DynamoDB), <b>wide-column</b> (Cassandra) and <b>graph</b>.",
            "Choose by the shape of the questions: whole objects, lookups by key, varying columns at scale, or relationships.",
          ],
          "NoSQL is four tools, not one: pick the family whose shape matches how your data is read.",
        ),
      );
    },
  });

  /* ================= LECTURE 3 ================= */

  /* ============ 3.1 Logs: the simplest database ============ */
  reg3({
    id: "ds-log",
    order: 1,
    num: "3.1",
    title: "Logs: the simplest database",
    blurb:
      "Append-only files are fast to write and slow to read. Meet tombstones and the problems a real log must solve.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let log = [],
        counter = 0,
        key = "bike",
        lastW = "-",
        lastR = "-",
        msg = "Press <b>Set</b> a few times, then <b>Get</b>.";
      const KEYS = ["bike", "dock", "helmet"];
      const card =
        el(`<div class="card"><div class="card-head"><h2>A tiny log-based database</h2><span class="tag">bike-share, one key-value pair per line</span></div>
        <div class="controls" id="k1"></div>
        <div class="controls"><button class="btn primary" id="bset">Set (append a line)</button><button class="btn" id="bget">Get (scan the log)</button><button class="btn" id="bdel">Delete</button><button class="btn ghost" id="bmore">Add 50 more records</button><button class="btn ghost" id="brs">Reset</button></div>
        <div class="grid two"><div><h3>The log file (newest at the bottom)</h3><div id="lg"></div></div>
        <div><div class="stat-row"><div class="stat"><small>Records in the log</small><b id="ln">0</b></div><div class="stat teal"><small>Cost of last write</small><b id="lw">-</b></div><div class="stat amber"><small>Lines scanned by last read</small><b id="lr">-</b></div></div><p id="lm" class="dim" style="min-height:70px"></p></div></div></div>`);
      root.appendChild(card);
      qs("#k1", card).append(
        N.seg(
          KEYS.map((k) => [k, k]),
          key,
          (v) => (key = v),
        ),
      );
      const draw = () => {
        const last = log.slice(-7);
        qs("#lg", card).innerHTML = mono(
          `${log.length > 7 ? `<span class="faint">… ${log.length - 7} earlier lines</span>\n` : ""}${last.map((r) => (r.t ? `<span style="color:var(--rose-ink)">${r.k}, ✗ tombstone</span>` : `${r.k}, #${r.v}`)).join("\n") || '<span class="faint">(empty)</span>'}`,
          "min-height:150px",
        );
        qs("#ln", card).textContent = log.length;
        qs("#lw", card).textContent = lastW;
        qs("#lr", card).textContent = lastR;
        qs("#lm", card).innerHTML = msg;
      };
      qs("#bset", card).onclick = () => {
        log.push({ k: key, v: ++counter });
        lastW = "1 append";
        msg = `Wrote <b>${key} = #${counter}</b> by appending one line. Writing is <b>cheap</b>: nothing is searched or moved. The old value is still in the file.`;
        draw();
      };
      qs("#bdel", card).onclick = () => {
        log.push({ k: key, t: 1 });
        lastW = "1 append";
        msg = `Deleting does not erase anything. The database appends a <b>tombstone</b> for <b>${key}</b>. Readers see the tombstone as the newest entry, and a later clean-up drops the old lines.`;
        draw();
      };
      qs("#bget", card).onclick = () => {
        lastR = log.length;
        let hit = null;
        log.forEach((r) => {
          if (r.k === key) hit = r;
        });
        msg = !log.length
          ? "The log is empty: nothing to find."
          : `Scanned <b>all ${log.length}</b> lines (the file is not indexed). ${!hit ? `<b>${key}</b> was never written.` : hit.t ? `The newest line for <b>${key}</b> is a tombstone: it is deleted.` : `The <b>last</b> line for <b>${key}</b> wins: <b>#${hit.v}</b>.`} Reading is <b>O(n)</b>: twice the data, twice the scan.`;
        draw();
      };
      qs("#bmore", card).onclick = () => {
        for (let i = 0; i < 50; i++) log.push({ k: pick(KEYS), v: ++counter });
        lastW = "50 appends";
        msg = "Added 50 records. The next <b>Get</b> has to scan them all.";
        draw();
      };
      qs("#brs", card).onclick = () => {
        log = [];
        counter = 0;
        lastW = "-";
        lastR = "-";
        msg = "Press <b>Set</b> a few times, then <b>Get</b>.";
        draw();
      };
      draw();

      root.appendChild(
        predict({
          id: "ds-log-1",
          q: "You press <b>Set</b> on the same key three times with different values, then press <b>Get</b> for that key. Which value comes back?",
          opts: ["The last one written", "The first one written", "All three, one per line"],
          a: 0,
          why: "Set only appends, so all three lines stay in the file. Get looks for the <b>last</b> line with that key, because that is the newest value. The older lines are still there, wasting space, until the log is compacted.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-log-2",
          q: "A tombstone is appended to delete the key 'dock' from a 10-line log. What happens to the file's size?",
          opts: [
            "It grows by one line until a later compaction",
            "It shrinks, because the old lines are erased",
            "It stays the same: the tombstone overwrites a line",
          ],
          a: 0,
          why: "The log is append-only, so old lines are never touched: the delete marker is one extra line (11 now). The dead lines only disappear when a background compaction rewrites the segments without them.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A database has two jobs: <b>store</b> data and <b>give it back</b>. Design depends on the workload: <b>transactional</b> (write-intensive) or <b>analytics</b> (read-intensive).",
            "A <b>log</b> is a read-only-by-history, append-only file of records in sequence. Writes are cheap (append), reads are <b>O(n)</b> (scan).",
            "Things a real log must handle: a <b>binary file format</b> (more efficient than text), <b>tombstones</b> for deletes, <b>crash recovery</b>, <b>partially written records</b> and <b>concurrency control</b>.",
            "We need a faster way to find data in the log: an <b>index</b>.",
          ],
          "Appending is fast but finding is slow, so a log needs an index to be a usable database.",
        ),
      );
    },
  });
})();

/* Data Science (COM3021), Lectures 2 and 3: data models & NoSQL, then storage and retrieval.
   Lecture 2 = ds-models, ds-schema, ds-graph, ds-nosql. Lecture 3 = ds-log, ds-hashidx, ds-sstable. */
(function () {
  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const reg2 = (m) => N.register({ subject: "ds", lecture: 2, ...m });
  const reg3 = (m) => N.register({ subject: "ds", lecture: 3, ...m });
  const pick = (a) => a[Math.floor(N.rnd() * a.length)];

  // ---------- small builders ----------
  const mono = (s, extra = "") =>
    `<pre class="mono" style="margin:0;padding:10px 12px;border:2px solid var(--line);border-radius:12px;background:var(--bg-2);font-size:12.5px;line-height:1.5;overflow:auto;${extra}">${s}</pre>`;
  function sorter(root, title, cats, items) {
    let order = N.shuffle(items.map((_, i) => i)),
      idx = 0,
      right = 0,
      log = [];
    const card =
      el(`<div class="card"><div class="card-head"><h2>${title}</h2><span class="mono dim" data-sc></span></div>
      <div data-item style="font-size:18px;font-weight:600;margin:4px 0 14px"></div>
      <div style="display:grid;grid-template-columns:repeat(${Math.min(cats.length, 4)},1fr);gap:10px">${cats.map(([c, d]) => `<button class="btn" data-c="${c}" style="text-align:left;padding:12px 14px;white-space:normal"><b>${c}</b>${d ? `<br><span class="faint" style="font-size:12.5px">${d}</span>` : ""}</button>`).join("")}</div>
      <div data-fb style="margin-top:12px;min-height:24px"></div><table class="t" data-log style="margin-top:8px"></table></div>`);
    const draw = () => {
      qs("[data-sc]", card).textContent = `${right} / ${log.length}`;
      qs("[data-item]", card).textContent =
        idx < order.length ? `“${items[order[idx]][0]}”` : `Done: ${right}/${items.length}`;
      qs("[data-log]", card).innerHTML = log
        .map(
          ([i, p]) =>
            `<tr><td>${items[i][0]}</td><td style="color:${p === items[i][1] ? "var(--teal)" : "var(--rose)"}">${p}</td><td class="faint">${p === items[i][1] ? "" : "→ " + items[i][1]}${items[i][2] ? ` · ${items[i][2]}` : ""}</td></tr>`,
        )
        .join("");
    };
    qsa("[data-c]", card).forEach(
      (b) =>
        (b.onclick = () => {
          if (idx >= order.length) return;
          const i = order[idx],
            ok = b.dataset.c === items[i][1];
          if (ok) right++;
          log.unshift([i, b.dataset.c]);
          idx++;
          qs("[data-fb]", card).innerHTML = ok
            ? `<span style="color:var(--teal)">✓ ${items[i][1]}</span>${items[i][2] ? ` <span class="dim">· ${items[i][2]}</span>` : ""}`
            : `<span style="color:var(--rose)">✗ It's <b>${items[i][1]}</b></span>${items[i][2] ? ` <span class="dim">· ${items[i][2]}</span>` : ""}`;
          draw();
        }),
    );
    draw();
    root.appendChild(card);
  }

  /* ================= LECTURE 2 ================= */

  /* ============ 2.1 Relational vs document ============ */
  reg2({
    id: "ds-models",
    order: 1,
    num: "2.1",
    title: "Relational vs document",
    blurb: "One profile page stored two ways: tables joined together, or a single document.",
    render(root, life) {
      root.appendChild(header(this, ""));
      // --- demo 1: load a profile ---
      let mode = "relational",
        count = 0,
        timers = [];
      const TABLES = [
        ["users", 1],
        ["regions", 1],
        ["industries", 1],
        ["positions", 2],
        ["education", 2],
        ["contact_info", 2],
      ];
      const card =
        el(`<div class="card"><div class="card-head"><h2>Load one profile page</h2><span class="tag">a recipe-site chef profile</span></div>
        <div class="controls" id="m1"></div>
        <div class="grid two"><div id="store"></div>
        <div><div class="stat-row"><div class="stat"><small>Lookups for the page</small><b id="lk">0</b></div><div class="stat amber"><small>Separate places</small><b id="pl">0</b></div></div><p id="why" class="dim" style="min-height:66px"></p></div></div>
        <div class="controls"><button class="btn primary" id="load">Load the profile page</button></div></div>`);
      root.appendChild(card);
      const cellStyle = (on) =>
        `border:2px solid ${on ? "var(--teal)" : "var(--line-2)"};background:${on ? "color-mix(in srgb, var(--teal) 14%, var(--panel-2))" : "var(--panel-2)"};border-radius:10px;padding:6px 10px;font-size:13px`;
      function drawStore(hit = []) {
        qs("#store", card).innerHTML =
          mode === "relational"
            ? `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">${TABLES.map(([t, n]) => `<div style="${cellStyle(hit.includes(t))}"><b class="mono">${t}</b><br><span class="faint">${n} row${n > 1 ? "s" : ""} for this chef</span></div>`).join("")}</div>`
            : `<div style="${cellStyle(hit.includes("doc"))}"><b class="mono">chef #251</b><br><span class="faint">name, summary, region, industry, 2 positions, 2 education entries, 2 contacts: all in one document</span></div>`;
      }
      function reset() {
        timers.forEach(clearTimeout);
        timers = [];
        count = 0;
        qs("#lk", card).textContent = "0";
        qs("#pl", card).textContent = "0";
        qs("#why", card).innerHTML = "Press <b>Load the profile page</b>.";
        drawStore();
      }
      qs("#m1", card).append(
        N.seg(
          [
            ["relational", "Relational (6 tables)"],
            ["document", "Document (1 JSON)"],
          ],
          mode,
          (v) => {
            mode = v;
            reset();
          },
        ),
      );
      qs("#load", card).onclick = () => {
        reset();
        const hits = mode === "relational" ? TABLES.map((t) => t[0]) : ["doc"];
        hits.forEach((h, i) =>
          timers.push(
            setTimeout(() => {
              count = i + 1;
              qs("#lk", card).textContent = count;
              qs("#pl", card).textContent = count;
              drawStore(hits.slice(0, i + 1));
              if (i === hits.length - 1)
                qs("#why", card).innerHTML =
                  mode === "relational"
                    ? "The page needs data from <b>six tables</b>. The database <b>joins</b> them by foreign key (each row remembers its chef's <code>user_id</code>)."
                    : "One read returns the <b>whole profile</b>: the data is stored <b>together</b> (locality).";
            }, 260 * i),
          ),
        );
      };
      life && life.onCleanup && life.onCleanup(() => timers.forEach(clearTimeout));
      reset();

      // --- demo 2: many-to-one, rename ---
      let n = 400;
      const c2 =
        el(`<div class="card"><div class="card-head"><h2>A company changes its name</h2><span class="tag">many-to-one</span></div>
        <p class="dim">Many chefs list the <b>same company</b>. Relational stores the name <b>once</b> in a companies table. A document store usually <b>copies</b> the name into every profile that mentions it.</p>
        <div class="controls" id="c2s"></div><div id="c2b"></div>
        <p id="c2t" class="dim"></p></div>`);
      root.appendChild(c2);
      const s = N.slider("Profiles that list the company", 1, 1000, 1, n, (v) => v.toLocaleString());
      qs("#c2s", c2).appendChild(s);
      const dr = () => {
        qs("#c2b", c2).innerHTML = F.bars(
          [
            ["Relational: rows to update", 1, "teal"],
            ["Document: documents to rewrite", n, "amber"],
          ],
          { max: 1000 },
        );
        qs("#c2t", c2).innerHTML =
          n === 1
            ? "With one profile the two approaches cost the same."
            : `Renaming touches <b>1 row</b> relationally, but <b>${n.toLocaleString()} documents</b> in the document store (and if one is missed, that profile shows a stale name).`;
      };
      s.onInput((v) => {
        n = v;
        dr();
      });
      dr();

      root.appendChild(
        predict({
          id: "ds-models-1",
          q: "A recipe site shows each recipe page with its ingredients and steps. Ingredients and steps belong to that one recipe only, and the page always needs all of them. Which storage shape gives the simplest single read?",
          opts: [
            "One document per recipe",
            "Separate tables joined by a foreign key, one per kind of item",
            "A graph with one vertex for every ingredient and step",
          ],
          a: 0,
          why: "Data that is a tree owned by one parent and read as a whole fits a single document: one read, no joins. Tables and graphs work, but add work you do not need here.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-models-2",
          q: "A company renames itself. 400 chef profiles mention it. The relational schema stores the company once (profiles point to it); the document store copies the name into each profile. What does the rename cost?",
          opts: [
            "Relational: 1 row. Document: 400 documents",
            "Both: 1 update",
            "Relational: 400 rows. Document: 1 document",
          ],
          a: 0,
          why: "Many-to-one data is shared, so store it once and reference it. Copying it into every document means many writes and a risk of stale copies.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "A <b>data model</b> maps an application's objects to how they are stored (tables, JSON, spreadsheets).",
            "<b>Relational</b>: normalised tables joined by foreign keys. Object-relational mappers (ORMs) translate objects to tables, but the fit is often awkward.",
            "<b>Document</b> (JSON/XML): the whole object in one place. A natural fit for one-to-many trees, with locality.",
            "<b>Many-to-one and many-to-many</b> relationships are where documents struggle and joins shine.",
          ],
          "Documents keep an object's tree together for fast whole reads, and relational tables share common data through joins.",
        ),
      );
    },
  });

  /* ============ 2.2 Schema flexibility & locality ============ */
  reg2({
    id: "ds-schema",
    order: 2,
    num: "2.2",
    title: "Schema flexibility and locality",
    blurb:
      "Schema-on-read vs schema-on-write, why a whole document is loaded at once, and how the two worlds converge.",
    render(root, life) {
      root.appendChild(header(this, ""));
      // --- demo 1: changing a field's format ---
      let db = "doc",
        rows = 1000,
        tm = 0;
      const c1 =
        el(`<div class="card"><div class="card-head"><h2>Split "name" into first and last name</h2><span class="tag">schema change</span></div>
        <p class="dim">Users were stored with one <code>name</code> field. The new app wants <code>first_name</code> and <code>last_name</code>. What has to happen?</p>
        <div class="controls" id="s1c"></div>
        <div id="s1v" style="margin:10px 0"></div>
        <div class="controls"><button class="btn primary" id="s1go">Make the change</button><button class="btn ghost" id="s1rs">Reset</button></div></div>`);
      root.appendChild(c1);
      const fmt = (r) => (r >= 1e6 ? `${r / 1e6}M` : r >= 1e3 ? `${r / 1e3}k` : String(r));
      const draw = (pct = 0, state = "idle") => {
        const relTxt = state === "idle" ? "Waiting" : pct < 100 ? `Rewriting every row… ${pct}%` : "Done";
        qs("#s1v", c1).innerHTML =
          db === "doc"
            ? `<div class="grid two"><div>${mono(`{ "name": "Ada Byte" }        <span class="faint">old document</span>\n{ "first_name": "Cy", "last_name": "Dee" }   <span class="faint">new document</span>`)}</div>
             <div><p class="dim" style="margin:0"><b>Schema-on-read.</b> ${state === "idle" ? "Old and new documents sit side by side in one collection." : `Start writing the new shape now. When the app <b>reads</b> an old document it splits the name in code. <b style="color:var(--teal)">No downtime, no waiting for ${fmt(rows)} documents.</b>`}</p></div></div>`
            : `<div class="grid two"><div>${mono(`table users\n  name         <span class="faint">(old column)</span>\n  first_name   <span class="faint">(new column, NULL for now)</span>\n  last_name    <span class="faint">(new column, NULL for now)</span>`)}</div>
             <div><p class="dim" style="margin:0"><b>Schema-on-write.</b> Alter the table's shape, then fill the new columns for <b>every</b> row.</p>
             <div style="height:10px;border-radius:5px;background:var(--bg);margin:8px 0;overflow:hidden"><div style="height:100%;width:${pct}%;background:${pct < 100 ? "var(--amber)" : "var(--teal)"}"></div></div><b style="color:${pct < 100 && state !== "idle" ? "var(--amber)" : "var(--text)"}">${relTxt}</b>
             <p class="faint" style="font-size:12.5px;margin:6px 0 0">${state === "idle" ? `${fmt(rows)} rows to rewrite. On a big table this can be slow and may need downtime.` : pct < 100 ? "Big tables make this slow and may block other work." : "Only now is the table fully migrated."}</p></div></div>`;
      };
      const reset = () => {
        clearInterval(tm);
        draw(0, "idle");
      };
      const rs = N.slider("Existing records", 1000, 100000000, 1000, rows, (v) => fmt(v));
      rs.onInput((v) => {
        rows = v;
        reset();
      });
      qs("#s1c", c1).append(
        N.seg(
          [
            ["doc", "Document store"],
            ["rel", "Relational database"],
          ],
          db,
          (v) => {
            db = v;
            reset();
          },
        ),
        rs,
      );
      qs("#s1go", c1).onclick = () => {
        reset();
        if (db === "doc") {
          draw(100, "go");
          return;
        }
        let p = 0;
        const step = Math.max(2, Math.round(600 / Math.log10(rows + 10)) / 100);
        tm = setInterval(() => {
          p = Math.min(100, p + step);
          draw(Math.round(p), "go");
          if (p >= 100) clearInterval(tm);
        }, 120);
      };
      qs("#s1rs", c1).onclick = reset;
      life && life.onCleanup && life.onCleanup(() => clearInterval(tm));
      draw(0, "idle");

      // --- demo 2: locality ---
      let need = "all",
        size = 20;
      const c2 =
        el(`<div class="card"><div class="card-head"><h2>Locality: one document, one read</h2><span class="tag">a double-edged sword</span></div>
        <div class="controls" id="l1"></div>
        <div class="stat-row" id="l2"></div><p class="dim" id="l3"></p></div>`);
      root.appendChild(c2);
      const sl = N.slider("Size of a whole document (KB)", 1, 500, 1, size, (v) => `${v} KB`);
      qs("#l1", c2).append(
        N.seg(
          [
            ["all", "Page needs the whole profile"],
            ["name", "Page needs just the name"],
          ],
          need,
          (v) => {
            need = v;
            dl();
          },
        ),
        sl,
      );
      const dl = () => {
        const docPlaces = 1,
          docKB = size,
          relPlaces = need === "all" ? 6 : 1,
          relKB = need === "all" ? size : 0.2;
        qs("#l2", c2).innerHTML =
          `<div class="stat"><small>Document: places · KB loaded</small><b>${docPlaces} · ${docKB}</b></div><div class="stat blue"><small>Tables: places · KB loaded</small><b>${relPlaces} · ${relKB}</b></div>`;
        qs("#l3", c2).innerHTML =
          need === "all"
            ? `Whole profile wanted: the document is <b>1 read</b>; tables need <b>6 separate reads</b> and joins. <b style="color:var(--teal)">Locality wins.</b>`
            : `Only the name wanted: the document still loads <b>${size} KB</b> (the DB loads the entire document). Tables read a tiny row. <b style="color:var(--rose)">Locality wastes work</b> when documents are large and you need a sliver.`;
      };
      sl.onInput((v) => {
        size = v;
        dl();
      });
      dl();

      root.appendChild(
        predict({
          id: "ds-schema-1",
          q: "Your document database stores each user's full name in one field, and you now want first and last names separately. What is the smallest change in a document store?",
          opts: [
            "Update the application to split old names when it reads them",
            "Lock the collection and rewrite every document first",
            "Convert to tables, because documents cannot change shape",
          ],
          a: 0,
          why: "Documents in one store can differ, so the application handles the old shape on read (schema-on-read). No downtime, and old documents can be upgraded gradually.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-schema-2",
          q: "Which data suits schema-on-read best?",
          opts: [
            "Social posts of many kinds that the app does not control",
            "A bank's account ledger with fixed columns every team relies on",
            "A payroll table with strict rules on every field",
          ],
          a: 0,
          why: "Schema-on-read helps when data is heterogeneous or its structure is outside your control (like tweets). Strict, shared, regulated data benefits from the schema being enforced when it is written.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "Most document databases do not enforce a schema: <b>schema-on-read</b> (structure is implied and interpreted when the app reads), like dynamic typing.",
            "Relational schema changes can be slow (rewriting every row) and may need downtime. NULL defaults and update-on-read soften it.",
            "<b>Locality</b>: a document is stored as one continuous string, so loading it is one read. Pro and con: the <b>whole</b> document is loaded, even if you want a sliver.",
            "Locality is not exclusive to documents (Spanner in relational, column families in Cassandra). The two worlds are <b>converging</b>: JSON columns in PostgreSQL and MySQL, joins in RethinkDB.",
          ],
          "Documents trade a rigid schema for flexibility and fast whole-object reads, but you pay when you only want part of a large document.",
        ),
      );
    },
  });

  /* ============ 2.3 Graph models ============ */
  const GN = {
    Ana: [70, 70, "person"],
    Ben: [200, 40, "person"],
    Cy: [330, 70, "person"],
    Dee: [400, 185, "person"],
    Eli: [270, 215, "person"],
    Leeds: [110, 195, "city"],
    Acme: [370, 135, "company"],
  };
  const GE = [
    ["Ana", "Ben", "FRIEND"],
    ["Ben", "Cy", "FRIEND"],
    ["Cy", "Dee", "FRIEND"],
    ["Eli", "Dee", "FRIEND"],
    ["Ana", "Leeds", "LIVES_IN"],
    ["Ben", "Leeds", "LIVES_IN"],
    ["Cy", "Acme", "WORKS_AT"],
    ["Eli", "Acme", "WORKS_AT"],
  ];
  function bfs(a, b) {
    const prev = { [a]: null },
      q = [a];
    while (q.length) {
      const c = q.shift();
      if (c === b) break;
      GE.forEach(([x, y]) => {
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
  }
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
          `${log.length > 7 ? `<span class="faint">… ${log.length - 7} earlier lines</span>\n` : ""}${last.map((r) => (r.t ? `<span style="color:var(--rose)">${r.k}, ✗ tombstone</span>` : `${r.k}, #${r.v}`)).join("\n") || '<span class="faint">(empty)</span>'}`,
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
          q: "A log database has 1,000,000 records and reads by scanning the whole file. It now grows to 10,000,000 records. About how does the time for one read change?",
          opts: ["About ten times longer", "About the same", "About one hundred times longer"],
          a: 0,
          why: "A scan touches every record, so time is proportional to n (O(n)). Ten times the data means about ten times the scan.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-log-2",
          q: "A record for the key 'dock' must be deleted from an append-only log. What does the database normally do?",
          opts: [
            "Append a special tombstone record for 'dock'",
            "Find the old lines and erase them in place",
            "Copy the whole file, leaving out 'dock'",
          ],
          a: 0,
          why: "Scanning and rewriting to delete is inefficient, so it appends a delete marker (tombstone). Later compaction removes the dead lines.",
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

  /* ============ 3.2 Hash index, segments, compaction ============ */
  reg3({
    id: "ds-hashidx",
    order: 2,
    num: "3.2",
    title: "Hash index, segments and compaction",
    blurb: "Keep a map of key to byte offset in memory. Split the log into segments and compact them.",
    render(root, life) {
      root.appendChild(header(this, ""));
      let limit = 6,
        segs = [[]],
        cnt = { mew: 0, purr: 0, yawn: 0 },
        idx = {},
        alive = true,
        lastGet = "Press <b>Get</b> for any key.",
        scanned = 0;
      const KEYS = ["mew", "purr", "yawn"];
      const rebuild = () => {
        idx = {};
        segs.forEach((sg, si) => sg.forEach((r, pi) => (idx[r.k] = { s: si, p: pi })));
      };
      const write = (k) => {
        if (segs[segs.length - 1].length >= limit) segs.push([]);
        const sg = segs[segs.length - 1];
        sg.push({ k, v: ++cnt[k] });
        if (alive) idx[k] = { s: segs.length - 1, p: sg.length - 1 };
      };
      for (let i = 0; i < 9; i++) write(["mew", "mew", "purr", "yawn", "mew", "purr", "mew", "yawn", "mew"][i]);
      const card =
        el(`<div class="card"><div class="card-head"><h2>Play counts, indexed</h2><span class="tag">3 videos, many plays</span></div>
        <div class="controls" id="h1"></div>
        <div class="controls" id="hkeys"></div>
        <div class="controls"><button class="btn primary" id="hp">Play a video (append)</button><button class="btn" id="hc">Compact old segments</button><button class="btn" id="hx">Crash and restart</button><button class="btn" id="hr">Rebuild index</button></div>
        <div id="hm" style="margin:8px 0"></div><div id="hs"></div>
        <div class="stat-row"><div class="stat"><small>Records on disk</small><b id="hn"></b></div><div class="stat blue"><small>Distinct keys</small><b id="hd"></b></div><div class="stat amber"><small>Disk reads by last Get</small><b id="hg"></b></div></div>
        <p id="ht" class="dim" style="min-height:48px"></p></div>`);
      root.appendChild(card);
      const sl = N.slider("Segment size (records)", 3, 8, 1, limit);
      sl.onInput((v) => (limit = v));
      qs("#h1", card).appendChild(sl);
      const draw = () => {
        qs("#hm", card).innerHTML =
          `<b>In-memory hash map</b> <span class="faint">(key → segment, position)</span><div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">${
            alive
              ? KEYS.filter((k) => idx[k])
                  .map((k) => `<span class="pill blue mono">${k} → seg ${idx[k].s + 1} @ ${idx[k].p}</span>`)
                  .join("")
              : '<span class="pill rose">memory lost: the map is empty</span>'
          }</div>`;
        qs("#hs", card).innerHTML = segs
          .map(
            (sg, si) =>
              `<div style="margin:6px 0"><span class="faint" style="font-size:12px">Segment ${si + 1}${si === segs.length - 1 ? " (active: still being written)" : " (closed)"}</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:3px">${sg.map((r) => `<span class="mono" style="border:2px solid var(--line-2);border-radius:8px;padding:2px 8px;font-size:12.5px;background:var(--panel-2)">${r.k}: ${r.v}</span>`).join("") || '<span class="faint">(empty)</span>'}</div></div>`,
          )
          .join("");
        const total = segs.reduce((a, s) => a + s.length, 0);
        qs("#hn", card).textContent = total;
        qs("#hd", card).textContent = new Set(segs.flat().map((r) => r.k)).size;
        qs("#hg", card).textContent = scanned || "-";
        qs("#ht", card).innerHTML = lastGet;
      };
      KEYS.forEach((k) => {
        const b = el(`<button class="btn small">Get ${k}</button>`);
        qs("#hkeys", card).appendChild(b);
        b.onclick = () => {
          if (!alive) {
            scanned = 0;
            lastGet = `<span style="color:var(--rose)">The hash map died with the process, so the database cannot jump to <b>${k}</b>.</span> It must <b>rebuild</b> the map by reading every segment.`;
          } else if (!idx[k]) {
            scanned = 1;
            lastGet = `Not in the map: <b>${k}</b> does not exist.`;
          } else {
            scanned = 1;
            const r = segs[idx[k].s][idx[k].p];
            lastGet = `Map says <b>${k}</b> is in segment ${idx[k].s + 1} at position ${idx[k].p}: <b>one disk read</b> returns <b>${r.v}</b>. No scanning.`;
          }
          draw();
        };
      });
      qs("#hp", card).onclick = () => {
        write(pick(["mew", "mew", "purr", "yawn"]));
        lastGet =
          "Appended one record, and the map now points at it. Old values for that key stay on disk until compaction.";
        draw();
      };
      qs("#hc", card).onclick = () => {
        if (segs.length < 2) {
          lastGet = "Only one segment so far: keep playing until a second one opens.";
          draw();
          return;
        }
        const closed = segs.slice(0, -1),
          before = closed.reduce((a, s) => a + s.length, 0),
          latest = {};
        closed.flat().forEach((r) => {
          delete latest[r.k];
          latest[r.k] = r;
        });
        segs = [Object.values(latest), segs[segs.length - 1]];
        if (alive) rebuild();
        lastGet = `Compaction kept only the <b>latest value per key</b>: ${before} old records became <b>${segs[0].length}</b>. Disk space is reclaimed.`;
        draw();
      };
      qs("#hx", card).onclick = () => {
        alive = false;
        idx = {};
        scanned = 0;
        lastGet = "The process restarted and the in-memory map is gone. The data on disk is fine.";
        draw();
      };
      qs("#hr", card).onclick = () => {
        if (alive) {
          lastGet = "The map is already there.";
          draw();
          return;
        }
        alive = true;
        rebuild();
        scanned = segs.reduce((a, s) => a + s.length, 0);
        lastGet = `Rebuilt the map by scanning <b>${scanned}</b> records, oldest to newest (the last write of each key wins). On a huge log this is slow.`;
        draw();
      };
      draw();

      root.appendChild(
        predict({
          id: "ds-hashidx-1",
          q: "A play-counter log receives 1,000,000 updates spread over 50 videos. After compaction, how many records remain for each video?",
          opts: ["One: the latest count", "A few thousand", "Half of what it had"],
          a: 0,
          why: "Compaction throws away overwritten values, keeping the newest record per key. A counter with few keys and many writes shrinks enormously.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-hashidx-2",
          q: "Which request is a poor fit for a hash-indexed log?",
          opts: [
            "All keys from user1000 up to user2000",
            "The value of exactly one named key in the store",
            "Overwriting one existing key's value with a new one",
          ],
          a: 0,
          why: "A hash map does not keep keys in order, so a range query has no shortcut. It would need to look up keys one by one or scan.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-hashidx-3",
          q: "A hash index must fit in memory. Your database has 10 billion distinct keys but memory holds about one billion map entries. What is the problem?",
          opts: [
            "The map does not fit, so this design breaks down",
            "None: the operating system compacts it",
            "Only writes get slower, reads stay quick",
          ],
          a: 0,
          why: "The scheme is simple and fast only while all keys fit in RAM. Beyond that, lookups would fall back to slow disk reads or need a different structure.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Hash index</b>: an in-memory map of every key to its <b>byte offset</b> in the log. Reads are one jump, writes append and update the map. Simple, but <b>all keys must fit in memory</b>.",
            "The log is cut into <b>segments</b> (close a file at a size limit, write to a new one), then <b>compaction</b> keeps the latest value per key to save disk.",
            "<b>Pros</b>: sequential writes are much faster than random disk access, and crash recovery is easier because old values are never overwritten.",
            "<b>Cons</b>: the map must fit in RAM, <b>range queries</b> are inefficient, and a crash loses the map (rebuild it from the log).",
          ],
          "A hash map of offsets turns a slow scan into one jump, until the keys stop fitting in memory or you need a range.",
        ),
      );
    },
  });

  /* ============ 3.3 SSTables & memtables ============ */
  const SEGS = [
    // oldest to newest; null = tombstone
    [
      ["apple", 1],
      ["fig", 2],
      ["mango", 3],
      ["plum", 4],
    ],
    [
      ["apple", 5],
      ["kiwi", 6],
      ["mango", 7],
    ],
    [
      ["fig", 8],
      ["kiwi", null],
      ["plum", 9],
    ],
  ];
  function mergeRun(box, life) {
    const cell = (s, j, f) => {
      const [k, v] = SEGS[s][j],
        consumed = j < f.p[s],
        head = j === f.p[s];
      const taken = f.taken[0] === s && f.taken[1] === j,
        skipped = f.skipped.some((x) => x[0] === s && x[1] === j);
      const bd = taken ? "var(--teal)" : skipped ? "var(--rose)" : head ? "var(--blue)" : "var(--line-2)";
      return `<div class="${head ? "sm-head" : ""}" data-k="${k}" style="border:2px solid ${bd};border-radius:9px;padding:4px 8px;margin:4px 0;font-size:13px;opacity:${consumed && !taken && !skipped ? 0.35 : 1};background:${taken ? "color-mix(in srgb, var(--teal) 16%, var(--panel-2))" : head ? "color-mix(in srgb, var(--blue) 12%, var(--panel-2))" : "var(--panel-2)"};${head ? "cursor:pointer" : ""}${skipped ? ";text-decoration:line-through" : ""}"><b class="mono">${k}</b>: ${v === null ? '<span style="color:var(--rose)">✗ tombstone</span>' : v}</div>`;
    };
    F.run(box, life, {
      code: [
        "pointers at the start of each segment",
        "key = smallest key under any pointer",
        "if several segments hold it, keep the newest one",
        "if the newest is a tombstone, write nothing",
        "advance every pointer that held that key",
      ],
      build(stage) {
        const r = el(`<div class="sm"></div>`);
        stage.appendChild(r);
        return r;
      },
      *frames() {
        const p = SEGS.map(() => 0),
          out = [];
        const snap = (x) => ({ p: p.slice(), out: out.slice(), taken: [-1, -1], skipped: [], ...x });
        yield snap({
          cap: "Three <b>sorted</b> segments (segment 3 is the newest). A pointer sits on the smallest unread key of each. Merging works like the merge step of merge sort.",
          line: 0,
        });
        while (p.some((x, i) => x < SEGS[i].length)) {
          const heads = SEGS.map((s, i) => (p[i] < s.length ? s[p[i]][0] : null));
          const key = heads.filter(Boolean).sort()[0];
          const who = heads.map((h, i) => (h === key ? i : -1)).filter((i) => i >= 0),
            win = Math.max(...who);
          const v = SEGS[win][p[win]][1];
          who.forEach((i) => p[i]++);
          const fr = { taken: [win, p[win] - 1], skipped: who.filter((i) => i !== win).map((i) => [i, p[i] - 1]) };
          if (v !== null) out.push([key, v]);
          const older =
            who.length > 1
              ? ` It is in segments ${who.map((i) => i + 1).join(" and ")}: keep the <b>newest</b> (segment ${win + 1}) and drop the older copy.`
              : "";
          const cap =
            v === null
              ? `<b>${key}</b>: the newest entry is a <b>tombstone</b>, so the key is deleted. Write nothing.${older}`
              : `Smallest key: <b>${key}</b>.${older || " It appears once, so write it."}`;
          const f = snap({ ...fr, cap, line: v === null ? 3 : who.length > 1 ? 2 : 1 });
          if (out.length === 0 && v !== null && who.length > 1)
            f.ask = {
              q: "Every pointer sits on its smallest unread key. Tap the segment head that goes into the output first.",
              pick: ".sm-head",
              a: [key],
              why: `Sorted order: <b>${key}</b> is smallest. Two segments hold it, and the newer one wins.`,
            };
          yield f;
        }
        yield snap({
          cap: "Done: <b>one</b> sorted segment. Overwritten values and the deleted key are gone, and no random disk access was needed.",
          line: 4,
        });
      },
      draw(sc, f) {
        sc.innerHTML = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${SEGS.map((s, i) => `<div><div class="faint" style="font-size:12px;font-weight:800">Segment ${i + 1}${i === 2 ? " (newest)" : i === 0 ? " (oldest)" : ""}</div>${s.map((_, j) => cell(i, j, f)).join("")}</div>`).join("")}
          <div><div class="faint" style="font-size:12px;font-weight:800">Merged output</div>${f.out.map(([k, v]) => `<div style="border:2px solid var(--teal);border-radius:9px;padding:4px 8px;margin:4px 0;font-size:13px;background:var(--panel-2)"><b class="mono">${k}</b>: ${v}</div>`).join("") || '<div class="faint">(empty)</div>'}</div></div>`;
      },
    });
  }

  reg3({
    id: "ds-sstable",
    order: 3,
    num: "3.3",
    title: "SSTables and memtables",
    blurb: "Keep segments sorted by key: merging is easy, the index can be sparse, and range queries work.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const POOL = ["apple", "date", "fig", "grape", "kiwi", "lime", "olive", "plum"];
      let limit = 4,
        mem = {},
        segs = [],
        counter = 0,
        steps = "Press <b>Write</b> a few times, then <b>Get</b> a key.",
        checks = "-";
      const card =
        el(`<div class="card"><div class="card-head"><h2>Memtable and SSTables</h2><span class="tag">writes go to memory first</span></div>
        <div class="controls" id="t1"></div>
        <div class="controls"><button class="btn primary" id="tw">Write a random key</button><button class="btn" id="td">Delete a random key</button><button class="btn" id="tm">Merge all segments</button><button class="btn ghost" id="tr">Reset</button></div>
        <div id="tv"></div>
        <div class="controls" id="tg"><span class="faint" style="font-size:13px">Get key:</span></div>
        <div class="stat-row"><div class="stat"><small>Memtable entries</small><b id="tn"></b></div><div class="stat blue"><small>SSTable segments</small><b id="ts"></b></div><div class="stat amber"><small>Places checked by last Get</small><b id="tc"></b></div></div>
        <p id="tt" class="dim" style="min-height:64px"></p></div>`);
      root.appendChild(card);
      const sl = N.slider("Memtable size before flushing", 3, 6, 1, limit);
      sl.onInput((v) => (limit = v));
      qs("#t1", card).appendChild(sl);
      const flush = () => {
        const ents = Object.entries(mem).sort((a, b) => (a[0] < b[0] ? -1 : 1));
        segs.unshift(ents);
        mem = {};
      };
      const put = (k, v) => {
        mem[k] = v;
        if (Object.keys(mem).length >= limit) {
          flush();
          return true;
        }
        return false;
      };
      const draw = () => {
        const mk = Object.keys(mem).sort();
        qs("#tv", card).innerHTML =
          `<div style="margin:8px 0"><span class="faint" style="font-size:12px;font-weight:800">Memtable (in memory, kept sorted by a balanced tree)</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:3px">${mk.map((k) => `<span class="mono" style="border:2px solid var(--violet);border-radius:8px;padding:2px 8px;font-size:12.5px;background:var(--panel-2)">${k}: ${mem[k] === null ? "✗" : mem[k]}</span>`).join("") || '<span class="faint">(empty)</span>'}</div></div>` +
          segs
            .map(
              (sg, i) =>
                `<div style="margin:6px 0"><span class="faint" style="font-size:12px;font-weight:800">SSTable ${segs.length - i}${i === 0 ? " (newest)" : ""} · sparse index: ${sg
                  .filter((_, j) => j % 2 === 0)
                  .map((e) => e[0])
                  .join(
                    ", ",
                  )}</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:3px">${sg.map(([k, v]) => `<span class="mono" style="border:2px solid var(--line-2);border-radius:8px;padding:2px 8px;font-size:12.5px;background:var(--panel-2)">${k}: ${v === null ? "✗" : v}</span>`).join("")}</div></div>`,
            )
            .join("");
        qs("#tn", card).textContent = mk.length;
        qs("#ts", card).textContent = segs.length;
        qs("#tc", card).textContent = checks;
        qs("#tt", card).innerHTML = steps;
      };
      POOL.forEach((k) => {
        const b = el(`<button class="btn small">${k}</button>`);
        qs("#tg", card).appendChild(b);
        b.onclick = () => {
          const log = [];
          let n = 0,
            ans;
          n++;
          if (k in mem) {
            ans = mem[k];
            log.push("memtable: <b>hit</b>");
          } else log.push("memtable: miss");
          if (ans === undefined)
            for (let i = 0; i < segs.length; i++) {
              n++;
              const e = segs[i].find((x) => x[0] === k);
              if (e) {
                ans = e[1];
                log.push(`SSTable ${segs.length - i}: <b>hit</b>`);
                break;
              } else log.push(`SSTable ${segs.length - i}: miss`);
            }
          checks = n;
          steps = `Looking for <b>${k}</b>: ${log.join(" → ")}. ${ans === undefined ? "Not found anywhere." : ans === null ? "The newest entry is a tombstone: deleted." : `Value <b>${ans}</b> (the newest copy wins).`} Each SSTable needs only a <b>sparse index</b> plus a short scan of one block.`;
          draw();
        };
      });
      qs("#tw", card).onclick = () => {
        const k = pick(POOL);
        const fl = put(k, ++counter);
        steps = fl
          ? `Wrote <b>${k}</b>. The memtable was full, so it was <b>flushed</b> to disk as a new sorted SSTable (the newest segment). New writes go to a fresh memtable.`
          : `Wrote <b>${k}</b> into the memtable (in memory, sorted). Nothing is on disk yet for this write, and the tree keeps the keys ordered.`;
        draw();
      };
      qs("#td", card).onclick = () => {
        const ks = [...Object.keys(mem), ...segs.flat().map((e) => e[0])];
        if (!ks.length) {
          steps = "Nothing to delete yet.";
          draw();
          return;
        }
        const k = pick(ks);
        const fl = put(k, null);
        steps = `Deleted <b>${k}</b> by writing a <b>tombstone</b> ✗ to the memtable.${fl ? " The memtable flushed." : ""}`;
        draw();
      };
      qs("#tm", card).onclick = () => {
        if (segs.length < 2) {
          steps = "Need at least two SSTables to merge.";
          draw();
          return;
        }
        const before = segs.reduce((a, s) => a + s.length, 0),
          m = {};
        for (let i = segs.length - 1; i >= 0; i--) segs[i].forEach(([k, v]) => (m[k] = v));
        segs = [
          Object.entries(m)
            .filter((e) => e[1] !== null)
            .sort((a, b) => (a[0] < b[0] ? -1 : 1)),
        ];
        steps = `Merged: ${before} entries in ${before ? "several segments" : "0"} became <b>${segs[0].length}</b> in one sorted segment. Older duplicates and tombstoned keys were dropped.`;
        draw();
      };
      qs("#tr", card).onclick = () => {
        mem = {};
        segs = [];
        counter = 0;
        checks = "-";
        steps = "Press <b>Write</b> a few times, then <b>Get</b> a key.";
        draw();
      };
      draw();

      root.appendChild(
        predict({
          id: "ds-sstable-1",
          q: "You read a key that was never written. In what order does the store look for it?",
          opts: [
            "Memtable, then the newest segment, then older ones",
            "Oldest segment first, then newer ones, then the memtable",
            "Only the memtable, since segments are read at merge time",
          ],
          a: 0,
          why: "Newest data wins, so the search goes from the memtable to the most recent segment and then back through older segments. A missing key has to be checked everywhere.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-sstable-2",
          q: "Why can an SSTable's in-memory index hold only some of the keys, unlike a hash index?",
          opts: [
            "Sorted order lets you scan a short block",
            "SSTables are always so small that every key fits anyway",
            "The database guesses the offsets of the missing keys from a hash",
          ],
          a: 0,
          why: "Sorted order means a key lives between two indexed keys, so you jump to the nearer indexed one and scan a short block. The index can be sparse.",
        }),
      );
      root.appendChild(
        predict({
          id: "ds-sstable-3",
          q: "While a full memtable is being written out as an SSTable, what happens to new writes?",
          opts: [
            "They continue into a new memtable",
            "They are refused until the flush ends",
            "They go straight into the old segment files",
          ],
          a: 0,
          why: "The store starts a fresh memtable so writes are not blocked. The finished SSTable becomes the newest segment.",
        }),
      );
      root.appendChild(
        takeaways(
          [
            "<b>SSTable</b> (Sorted String Table): each key appears <b>once per segment</b> and the segment is <b>sorted by key</b>. Merging segments is fast (like merge sort), and the newest value wins.",
            "The in-memory index can be <b>sparse</b>: only offsets of some keys, because sorted order tells you where to scan.",
            "<b>Write path</b>: add to an in-memory balanced tree (the <b>memtable</b>, for example an AVL tree). When it grows, write it out as a new SSTable, the newest segment, while writes continue into a new memtable.",
            "<b>Read path</b>: memtable, then the newest segment, then older ones. In the background, <b>merge and compact</b> segments to drop overwritten and deleted values.",
          ],
          "Sorted segments make merging cheap and indexes small, so writes stay fast without losing reads.",
        ),
      );
    },
  });

  /* =================== LESSONS =================== */
  const FG = F;
  const jsonCard = mono(
    `{ "user_id": 251,\n  "first_name": "Ada",\n  "positions": [\n    { "job": "Chef", "org": "Casserole Co" },\n    { "job": "Owner", "org": "Ada's Bakes" } ],\n  "education": [ { "school": "Leeds Uni" } ] }`,
  );

  L["ds-models"] = {
    sum: "A <b>data model</b> maps your app's objects to storage. Documents keep a tree of data together; relational tables share common data by joining.",
    steps: [
      {
        t: "What a data model is",
        b: `<p>Applications work with <b>objects</b> (people, transactions, conversations). To store them we need a <b>data model</b>: the mapping from an object to tables, JSON or a spreadsheet.</p>`,
        v: FG.flow([
          { t: "App object", s: "a Python chef" },
          { t: "Data model", s: "the mapping", c: "violet" },
          { t: "Stored as", s: "tables or JSON", c: "teal" },
        ]),
      },
      {
        t: "The relational model and its awkward fit",
        b: `<p>Relational databases store <b>tables</b> of rows. An <b>ORM</b> (object-relational mapper) translates classes into tables. It works, but the translation is often not intuitive from the business point of view.</p><span class="analogy">Like disassembling a lorry into labelled boxes every time you park it, then rebuilding it when you need it.</span>`,
        v: FG.compare(
          {
            title: "In your code",
            c: "blue",
            body: "one <b>Chef</b> object with a list of jobs and a list of schools",
          },
          {
            title: "In the database",
            c: "amber",
            body: "<b>users</b>, <b>positions</b>, <b>education</b>, <b>contact_info</b> tables joined by a foreign key",
          },
        ),
      },
      {
        t: "One-to-many: three ways to store it",
        b: `<p>A profile has <b>many</b> positions, education entries and contacts. Options:</p><p>① <b>Normalised tables</b>, each row holding a foreign key to the user.<br>② A column with a <b>structured type</b> (JSON or XML) inside the user row (newer SQL can index and query it).<br>③ Store it as <b>JSON or XML text</b> in a text field.</p>`,
        v: FG.cells(
          [
            { v: "① separate tables", sub: "foreign key", c: "blue" },
            { v: "② JSON column", sub: "queryable", c: "teal" },
            { v: "③ JSON as text", sub: "opaque to the DB", c: "amber" },
          ],
          { size: 160 },
        ),
        c: {
          q: "Which option lets the database query and index inside the nested data, while keeping it in the user row?",
          o: ["A JSON text blob the DB cannot see into", "A structured JSON or XML column type", "Nothing can do that"],
          a: 1,
          why: "Newer SQL versions support structured column types that can be indexed and queried. A plain text blob is opaque.",
        },
      },
      {
        t: "The document model",
        b: `<p>A <b>document</b> encodes an object in a semi-structured standard (JSON, XML). All of an object's information sits in <b>one place</b>, so the mapping from your object is natural, and documents in one store can differ. Examples: MongoDB, CouchDB, Firestore.</p>`,
        v: jsonCard,
      },
      {
        t: "Where documents struggle: many-to-one and many-to-many",
        b: `<p>A company appears in <b>many</b> profiles (many-to-one), and people connect to <b>many</b> people (many-to-many). Documents handle this badly: shared data is copied around, and many document databases offer some <b>join</b> support that is <b>more complicated and less efficient than SQL</b>.</p>`,
        v: FG.compare(
          {
            title: "Rename the company (relational)",
            c: "teal",
            body: "change <b>1 row</b>, every profile follows the reference",
          },
          { title: "Rename the company (document)", c: "rose", body: "rewrite the name in <b>every copy</b>" },
        ),
        c: {
          q: "Which relationship is hardest for a pure document model?",
          o: [
            "Many-to-many, such as who connects to whom",
            "One-to-many owned by a single parent",
            "A single object with no relationships",
          ],
          a: 0,
          why: "Owned trees fit documents. Shared, cross-linked data needs joins.",
        },
      },
      {
        t: "Which model, when?",
        b: `<p><b>Document advantages</b>: schema flexibility, locality, a closer match to app data structures.<br><b>Relational advantages</b>: better joins and better many-to-one / many-to-many support.</p>`,
        v: FG.compare(
          { title: "Reach for documents", c: "blue", body: "self-contained records read as a whole" },
          { title: "Reach for relational", c: "violet", body: "data shared and joined across records" },
        ),
      },
    ],
    guide: [
      "Press <b>Load the profile page</b> in relational mode and count the lookups, then switch to <b>Document</b> and repeat.",
      "In the company demo, drag <b>Profiles</b> to 1000 and compare the two bars.",
      "Answer the questions after the demo.",
    ],
  };

  L["ds-schema"] = {
    sum: "Document stores read data with an <b>implicit</b> schema (schema-on-read), so changes are easy. Their <b>locality</b> is fast for whole objects and wasteful for slivers.",
    steps: [
      {
        t: "Most document stores enforce no schema",
        b: `<p>Arbitrary keys and values can be added, so you have <b>no guarantee</b> which fields a document holds.</p>`,
        v: mono(`{ "name": "Ada Byte" }\n{ "first_name": "Cy", "last_name": "Dee", "vegan": true }`),
      },
      {
        t: "Schema-on-read",
        b: `<p>The structure is <b>implicit</b> and interpreted when the <b>application reads</b> the data. It resembles <b>dynamic typing</b> in programming: check the shape when you use it. Compare <b>schema-on-write</b> (relational): the schema is explicit and enforced when data is written, like static typing.</p>`,
        v: FG.compare(
          { title: "Schema-on-read", c: "teal", body: "documents may differ. The app copes when reading" },
          { title: "Schema-on-write", c: "violet", body: "every row must fit the table's schema when written" },
        ),
        c: {
          q: "In which style does the application decide how to interpret a record's fields when it reads it?",
          o: ["Schema-on-write", "Schema-on-read"],
          a: 1,
          why: "Schema-on-read: structure is implicit and interpreted at read time.",
        },
      },
      {
        t: "Changing a field's format",
        b: `<p>Store a full name, then later want first and last names. <b>Document</b>: change the application to split old names as it reads them. <b>Relational</b>: alter the table, then update every row. On a big table the update is slow and may need <b>downtime</b>. (You can also set the new columns to NULL and fill them in on read.)</p>`,
        v: FG.compare(
          { title: "Document store", c: "teal", body: "new code + split-on-read. <b>No downtime</b>" },
          { title: "Relational database", c: "amber", body: "alter table, then rewrite <b>every row</b>" },
        ),
        c: {
          q: "Why can a relational schema change be painful on a very large table?",
          o: [
            "Every row must be rewritten",
            "Relational databases cannot add columns to existing tables",
            "The alter command always deletes the old data first",
          ],
          a: 0,
          why: "Updating every row on a huge table takes a long time and may block other work.",
        },
      },
      {
        t: "When schema-on-read helps",
        b: `<p>Use it when your data is <b>heterogeneous</b> (different kinds of object in one collection) or when you <b>do not control the structure</b> (for example, tweets).</p>`,
        v: FG.cells(
          [
            { v: "mixed objects", sub: "one collection", c: "teal" },
            { v: "not your data", sub: "structure changes without asking", c: "amber" },
          ],
          { size: 170 },
        ),
      },
      {
        t: "Locality: pro and con",
        b: `<p>A document is usually stored as <b>one continuous string</b> (JSON, XML or BSON). <b>Pro</b>: if the app often needs large parts of the data, one read is better than gathering it from several tables. <b>Con</b>: the DB loads the <b>entire</b> document, which is wasteful when documents are large and you need a little.</p>`,
        v: FG.compare(
          { title: "Wants the whole profile", c: "teal", body: "one read from one place" },
          { title: "Wants just the name", c: "rose", body: "still loads the <b>whole</b> document" },
        ),
        c: {
          q: "When does document locality hurt most?",
          o: [
            "Big documents, small need",
            "The app always needs the whole document every time",
            "There is only a single document in the whole collection",
          ],
          a: 0,
          why: "The DB loads the whole document, so a small need on a large document wastes work.",
        },
      },
      {
        t: "The two worlds are converging",
        b: `<p>Locality is not only for documents: <b>Google Spanner</b> offers it within a relational model, and <b>column families</b> (Cassandra) manage locality similarly. Relational databases now support <b>JSON/XML</b> (PostgreSQL after 9.3, MySQL after 5.7) with indexing and querying inside them, and some document stores (RethinkDB) support relational-like <b>joins</b>.</p>`,
        v: FG.flow([
          { t: "Relational", s: "+ JSON columns", c: "violet" },
          { t: "getting closer", c: "dim" },
          { t: "Document", s: "+ joins", c: "blue" },
        ]),
      },
    ],
    guide: [
      "In the first demo, press <b>Make the change</b> in <b>Document store</b> mode, then in <b>Relational</b> mode. Use the slider to add more records.",
      "In the locality demo, try <b>whole profile</b> versus <b>just the name</b>, and raise the document size.",
      "Answer the questions after the demo.",
    ],
  };

  L["ds-graph"] = {
    sum: "A <b>graph</b> stores entities as <b>vertices</b> and relationships as <b>edges</b>. It shines when relationships are what you ask about.",
    steps: [
      {
        t: "Why graphs?",
        b: `<p>Complex <b>many-to-many</b> relationships are especially awkward for document and relational models. A <b>graph</b> represents <b>entities as nodes</b> and <b>relationships as edges</b>.</p>`,
        v: FG.graph({
          nodes: {
            A: { x: 60, y: 110, label: "Ana", c: "blue" },
            B: { x: 210, y: 40, label: "Ben", c: "blue" },
            C: { x: 210, y: 180, label: "Cy", c: "blue" },
            D: { x: 360, y: 110, label: "Dee", c: "blue" },
          },
          edges: [
            ["A", "B"],
            ["A", "C"],
            ["B", "D"],
            ["C", "D"],
            ["B", "C"],
          ],
          w: 420,
          h: 220,
        }),
      },
      {
        t: "Where graphs appear",
        b: `<p><b>Social networks</b> (different kinds of vertex and edge), the <b>World Wide Web</b> (pages linked to pages), and <b>road networks</b> (junctions and roads).</p>`,
        v: FG.cells(
          [
            { v: "social network", sub: "people, pages, events", c: "blue" },
            { v: "the web", sub: "links between pages", c: "violet" },
            { v: "roads", sub: "junctions and roads", c: "amber" },
          ],
          { size: 150 },
        ),
      },
      {
        t: "Ready-made algorithms",
        b: `<p>Well-known algorithms already work on graphs: <b>Dijkstra</b> finds the shortest route on a road network, and <b>PageRank</b> scores how relevant a web page is in search results.</p>`,
        v: FG.compare(
          { title: "Dijkstra", c: "teal", body: "shortest route between two junctions" },
          { title: "PageRank", c: "violet", body: "which pages matter most, based on who links to them" },
        ),
        c: {
          q: "Which task is a classic graph algorithm?",
          o: ["Ranking web pages by relevance", "Sorting a list of names alphabetically", "Adding two numbers"],
          a: 0,
          why: "PageRank scores pages from the links between them, which is graph structure.",
        },
      },
      {
        t: "Property graphs",
        b: `<p>Each <b>vertex</b> holds a unique ID, its <b>incoming</b> and <b>outgoing</b> edges, and key-value <b>properties</b>. Each <b>edge</b> holds a unique ID, a <b>head</b> and <b>tail</b> vertex, a relationship <b>label</b> and properties.</p>`,
        v: FG.graph({
          nodes: {
            A: { x: 70, y: 100, label: "Ana", c: "blue", sub: "person" },
            B: { x: 350, y: 100, label: "Leeds", c: "amber", sub: "city" },
          },
          edges: [["A", "B", "LIVES_IN", "teal"]],
          directed: true,
          w: 420,
          h: 200,
          r: 28,
        }),
      },
      {
        t: "It looks like two tables",
        b: `<p>You can view a property graph as two relational tables: one for <b>vertices</b>, one for <b>edges</b>. The difference: <b>any vertex can connect to any other</b>, and given a vertex you can quickly find its incoming and outgoing edges, so <b>traversal is easy</b>. Different edge labels represent different relationships.</p>`,
        v: FG.compare(
          { title: "Vertices table", c: "blue", body: "id · properties" },
          { title: "Edges table", c: "amber", body: "id · head · tail · label · properties" },
        ),
        c: {
          q: "What makes graph traversal easy?",
          o: [
            "Each vertex can quickly list its incoming and outgoing edges",
            "Vertices are stored in alphabetical order",
            "Every vertex must link to the same kinds of vertex",
          ],
          a: 0,
          why: "Finding a vertex's edges is direct, so walking from vertex to vertex is cheap.",
        },
      },
    ],
    guide: [
      "In <b>Inspect a vertex</b> mode, tap each vertex and read its outgoing and incoming edges.",
      "Switch to <b>Find a path</b>, tap a start and an end vertex, and read the hop count.",
      "Answer the questions after the demo.",
    ],
  };

  L["ds-nosql"] = {
    sum: "<b>NoSQL</b> = non-relational stores aimed at simple design, scaling out and availability, in four families.",
    steps: [
      {
        t: "What NoSQL means",
        b: `<p>Non-relational storage and retrieval of data, focused on <b>simplicity of design</b>, <b>scalability</b> (especially <b>horizontal</b> scaling) and <b>availability</b>.</p>`,
        v: FG.cells(
          [
            { v: "simple design", c: "teal" },
            { v: "scale out", c: "blue" },
            { v: "stay available", c: "amber" },
          ],
          { size: 150 },
        ),
      },
      {
        t: "Four families",
        b: `<p><b>Document</b>, <b>key-value</b>, <b>wide-column</b> and <b>graph</b>.</p>`,
        v: FG.cells(
          [
            { v: "Document", sub: "MongoDB", c: "blue" },
            { v: "Key-value", sub: "DynamoDB", c: "amber" },
            { v: "Wide-column", sub: "Cassandra", c: "violet" },
            { v: "Graph", sub: "vertices and edges", c: "teal" },
          ],
          { size: 130 },
        ),
      },
      {
        t: "Document store",
        b: `<p>Different products group documents differently. MongoDB has <b>databases</b> and <b>collections</b> (like tables, but with no rigid schema) and a <b>query language</b> to search them.</p>`,
        v: FG.flow([
          { t: "Database" },
          { t: "Collection", s: "like a table", c: "violet" },
          { t: "Documents", s: "JSON-like", c: "teal" },
        ]),
        c: {
          q: "In MongoDB, what is a collection closest to?",
          o: [
            "A table with no rigid schema",
            "A single column shared by every document",
            "A labelled edge between two vertices in a graph",
          ],
          a: 0,
          why: "Collections group documents like tables group rows, without a fixed schema.",
        },
      },
      {
        t: "Key-value store",
        b: `<p>Data is stored as <b>associative arrays</b>: every object is a set of <b>key-value pairs</b>. DynamoDB uses a <b>complex primary key</b> (a <b>partition key</b> plus a <b>sort key</b>), and the schema is defined <b>per item</b>.</p>`,
        v: FG.compare(
          { title: "Partition key", c: "amber", body: "picks the partition. Related items share it" },
          { title: "Sort key", c: "blue", body: "orders the items within that partition" },
        ),
      },
      {
        t: "Wide-column store",
        b: `<p>Similar to relational: data sits in <b>tables, rows and columns</b>, but the <b>names and formats of the columns can vary from record to record</b>.</p>`,
        v: FG.compare(
          { title: "Relational table", c: "violet", body: "every row has the same columns" },
          { title: "Wide-column table", c: "teal", body: "each row may have its own columns" },
        ),
        c: {
          q: "What sets a wide-column store apart from a relational table?",
          o: [
            "Columns can vary per row",
            "It has no rows at all, only one long list of values",
            "It stores nothing except graphs and their edges",
          ],
          a: 0,
          why: "Rows are still in tables, but each row can carry different columns.",
        },
      },
    ],
    guide: [
      "Switch through the four shapes and read each explanation.",
      "Sort the 8 scenarios into the right family.",
      "Answer the questions after the demo.",
    ],
  };

  L["ds-log"] = {
    sum: "A <b>log</b> is an append-only file: writes are cheap, reads scan everything. That makes an <b>index</b> the natural next step.",
    steps: [
      {
        t: "The two jobs of a database",
        b: `<p>When you give it data it must <b>store</b> it, and when you ask for that data it must <b>give it back</b>. The storage engine depends on the workload: <b>transactional</b> (write-intensive) or <b>analytics</b> (read-intensive).</p>`,
        v: FG.compare(
          { title: "Transactional", c: "amber", body: "many small writes: orders, payments" },
          { title: "Analytics", c: "violet", body: "big reads over lots of data: reports" },
        ),
      },
      {
        t: "A very simple database",
        b: `<p>A key-value store in two functions: <b>set</b> appends <code>key,value</code> to a file; <b>get</b> finds the <b>last</b> line for that key.</p>`,
        v: mono(
          `set bike  #1\nset dock  #2\nset bike  #3     <span class="faint">(bike overwritten, old line stays)</span>\nget bike  →  #3`,
        ),
      },
      {
        t: "Performance of the simple database",
        b: `<p><b>Write</b>: append to the end of a file, so <b>very fast</b>. <b>Read</b>: scan the whole file for the key, so <b>O(n)</b>: double the data, double the time.</p>`,
        v: FG.bars(
          [
            ["write: append one line", 1, "teal", " step"],
            ["read: scan n lines (n = 1000)", 1000, "rose", " steps"],
          ],
          { max: 1000 },
        ),
        c: {
          q: "A read scans a log of n lines. If n doubles, the scan time…",
          o: ["roughly doubles", "stays the same", "roughly squares"],
          a: 0,
          why: "O(n): proportional to the number of records.",
        },
      },
      {
        t: "What a log is",
        b: `<p>Many databases use a <b>log</b> to record data: not a log in the traditional sense, but a file of records in <b>sequence</b>. New records are only added at the end, so old lines are never modified.</p>`,
        v: FG.flow([{ t: "record 1" }, { t: "record 2" }, { t: "record 3", s: "newest", c: "teal" }]),
      },
      {
        t: "Things a real log must handle",
        b: `<p><b>File format</b>: binary files are usually more efficient than text. <b>Deleting</b>: appending a special <b>tombstone</b> record is cheaper than scanning to erase. <b>Crash recovery</b>: an in-memory hash map is lost on restart. <b>Partially written records</b> and <b>concurrency control</b> also need care.</p>`,
        v: FG.cells(
          [
            { v: "binary format", c: "blue" },
            { v: "tombstones", c: "rose" },
            { v: "crash recovery", c: "amber" },
            { v: "partial writes", c: "violet" },
            { v: "concurrency", c: "teal" },
          ],
          { size: 130 },
        ),
        c: {
          q: "What is a tombstone?",
          o: ["A delete marker appended to the log", "An index of every key", "A backup copy of the whole file"],
          a: 0,
          why: "Appending a delete record avoids scanning and rewriting the log.",
        },
      },
    ],
    guide: [
      "Press <b>Set</b> several times for different keys, then <b>Get</b> and watch the lines scanned.",
      "Press <b>Add 50 more records</b> and <b>Get</b> again.",
      "Try <b>Delete</b>, then <b>Get</b> the same key. Answer the questions after the demo.",
    ],
  };

  L["ds-hashidx"] = {
    sum: "A <b>hash index</b> maps each key to its byte offset so a read is one jump. <b>Segments</b> and <b>compaction</b> stop the log growing forever.",
    steps: [
      {
        t: "The hash index",
        b: `<p>Like a dictionary, but for disk: keep a <b>hash map</b> in memory mapping each key to its <b>byte offset</b> in the log file. On every append, update the map. Reads jump straight to the offset. This is simple and efficient, <b>as long as all the keys fit in memory</b>.</p>`,
        v: FG.flow([
          { t: 'Get "mew"', s: "ask", c: "violet" },
          { t: "hash map", s: "mew → byte 64", c: "blue" },
          { t: "log file", s: "read at byte 64", c: "teal" },
        ]),
        c: {
          q: "Where does the hash map live in this design?",
          o: ["In memory", "Only on disk in the log", "In a separate remote server"],
          a: 0,
          why: "Keeping it in memory is what makes lookups a single jump.",
        },
      },
      {
        t: "Segment files",
        b: `<p>If we only ever append, we run out of disk. So the log is broken into <b>segments</b>: close a file when it reaches a size and write to a new one.</p>`,
        v: FG.flow([
          { t: "segment 1", s: "closed" },
          { t: "segment 2", s: "closed" },
          { t: "segment 3", s: "active", c: "teal" },
        ]),
      },
      {
        t: "Compaction",
        b: `<p>To save space, throw away <b>duplicate keys</b> and keep only the <b>latest</b> value. Example: a database counting plays of each cat video has many writes but few keys, so compaction shrinks it hugely.</p>`,
        v: FG.compare(
          { title: "Before", c: "amber", body: "mew: 1078, purr: 2103, mew: 1079, mew: 1080… (many copies)" },
          { title: "After", c: "teal", body: "mew: 1082, purr: 2108, yawn: 511 (one each)" },
        ),
        c: {
          q: "What does compaction keep for each key?",
          o: ["Only the latest value", "Every value ever written", "Only the first value"],
          a: 0,
          why: "Older values were overwritten and can be discarded.",
        },
      },
      {
        t: "Advantages",
        b: `<p>① <b>Sequential writes</b> are much faster than random disk access. ② <b>Crash recovery is easier</b>: you never overwrite old content when updating a value.</p>`,
        v: FG.cells(
          [
            { v: "fast appends", sub: "sequential", c: "teal" },
            { v: "safe recovery", sub: "nothing overwritten", c: "blue" },
          ],
          { size: 170 },
        ),
      },
      {
        t: "Disadvantages",
        b: `<p>① The <b>hash table must fit in memory</b>. ② <b>Range queries</b> (for example keys <code>kitty1000</code> to <code>kitty2000</code>) are inefficient: the map has no order, so you would look up each key separately.</p>`,
        v: FG.compare(
          { title: "Fits in RAM", c: "teal", body: "every lookup is one jump" },
          { title: "Too many keys", c: "rose", body: "the map does not fit, and the design breaks" },
        ),
        c: {
          q: "Which limitation belongs to a hash-indexed log?",
          o: [
            "Range queries are inefficient",
            "Writes need random disk access",
            "It cannot be recovered after a crash",
          ],
          a: 0,
          why: "A hash map has no key order, so ranges have no shortcut.",
        },
      },
    ],
    guide: [
      "Press <b>Play a video</b> until a second segment opens, then <b>Get</b> a key.",
      "Press <b>Compact old segments</b> and compare the records on disk.",
      "Press <b>Crash and restart</b>, try <b>Get</b>, then <b>Rebuild index</b>.",
    ],
  };

  L["ds-sstable"] = {
    sum: "An <b>SSTable</b> is a segment sorted by key. Sorting makes merges cheap, the index sparse and ranges possible. A <b>memtable</b> keeps writes sorted in memory.",
    steps: [
      {
        t: "Sorted String Tables",
        b: `<p>Two changes to the log: <b>each key appears once per segment</b>, and the segment is <b>sorted by key</b>. Merging several segments is then like the merge step of merge sort: read them side by side and keep the newest value of each key.</p>`,
        v: FG.compare(
          { title: "Plain log segment", c: "amber", body: "mew, purr, mew, yawn… any order, duplicates" },
          { title: "SSTable segment", c: "teal", body: "mew, purr, yawn… <b>sorted</b>, each key once" },
        ),
      },
      {
        t: "Watch a merge",
        b: `<p>Three sorted segments merge into one. Segment 3 is newest, so its values win. Step through it, or press play.</p>`,
        v: (box, life) => mergeRun(box, life),
      },
      {
        t: "A sparse index is enough",
        b: `<p>You still need an in-memory index, but not for every key. Because the segment is sorted, keep the offset of <b>some</b> keys: to find a key, jump to the nearest indexed key before it and <b>scan a short block</b>. (Blocks can be compressed too.)</p>`,
        v: FG.flow([
          { t: "sparse index", s: "hand → 91k, handsome → 104k", c: "blue" },
          { t: "jump near", s: "handbag lies between", c: "violet" },
          { t: "scan a block", s: "find it", c: "teal" },
        ]),
        c: {
          q: "Why can the index hold only some of the keys?",
          o: [
            "The segment is sorted, so you scan a short block",
            "Missing keys are recomputed from a hash",
            "Only the newest keys are ever read",
          ],
          a: 0,
          why: "Sorted order tells you the key lies between two indexed keys.",
        },
      },
      {
        t: "Keeping it sorted while writing",
        b: `<p>Data arrives in random order, so how do we keep it sorted? Use a <b>tree structure</b> in memory (an <b>AVL tree</b>, a balanced tree). This is the <b>memtable</b>.</p>`,
        v: FG.graph({
          nodes: {
            M: { x: 210, y: 40, label: "kiwi", c: "violet" },
            L: { x: 110, y: 120, label: "fig", c: "violet" },
            R: { x: 310, y: 120, label: "plum", c: "violet" },
            A: { x: 60, y: 200, label: "apple", c: "violet" },
            G: { x: 160, y: 200, label: "grape", c: "violet" },
          },
          edges: [
            ["M", "L"],
            ["M", "R"],
            ["L", "A"],
            ["L", "G"],
          ],
          w: 420,
          h: 240,
          r: 24,
        }),
      },
      {
        t: "The write path",
        b: `<p>① <b>Write</b> into the memtable. ② When it grows big, <b>write it out as an SSTable file</b>: the newest segment. ③ While that happens, writes continue into a <b>new memtable</b>.</p>`,
        v: FG.flow([
          { t: "write", s: "into memtable", c: "violet" },
          { t: "memtable full", s: "flush sorted", c: "amber" },
          { t: "new SSTable", s: "newest segment", c: "teal" },
        ]),
        c: {
          q: "What is written to disk when the memtable is flushed?",
          o: ["A sorted segment (SSTable) file", "An unsorted append of raw writes", "A hash index of every key"],
          a: 0,
          why: "The tree is walked in order, so the file comes out sorted.",
        },
      },
      {
        t: "The read path and merging",
        b: `<p><b>Read</b>: look in the memtable, then the <b>most recent</b> segment, then the next older one, and so on. From time to time a background process <b>merges and compacts</b> segments, discarding overwritten and deleted values.</p>`,
        v: FG.flow([
          { t: "memtable", c: "violet" },
          { t: "newest segment", c: "blue" },
          { t: "older segments", c: "dim" },
        ]),
      },
    ],
    guide: [
      "Write random keys until the memtable flushes, then <b>Get</b> a key that lives in an older segment.",
      "Delete a key, then press <b>Merge all segments</b> and read the result.",
      "Step through <b>Watch a merge</b> and answer its question before the next step.",
    ],
  };
})();

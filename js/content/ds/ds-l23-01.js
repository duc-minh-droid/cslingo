/* Data Science (COM3021), Lectures 2 and 3: data models & NoSQL, then storage and retrieval.
   Lecture 2 = ds-models, ds-schema, ds-graph, ds-nosql. Lecture 3 = ds-log, ds-hashidx, ds-sstable. */
(function () {
  const partScope = (NIC.shared.dsL23 = NIC.shared.dsL23 || {});

  const N = NIC;
  const { el, qs, qsa, predict, takeaways, header } = N;
  const F = N.fig;
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
            ? `<span style="color:var(--teal-ink)">✓ ${items[i][1]}</span>${items[i][2] ? ` <span class="dim">· ${items[i][2]}</span>` : ""}`
            : `<span style="color:var(--rose-ink)">✗ It's <b>${items[i][1]}</b></span>${items[i][2] ? ` <span class="dim">· ${items[i][2]}</span>` : ""}`;
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
             <div><p class="dim" style="margin:0"><b>Schema-on-read.</b> ${state === "idle" ? "Old and new documents sit side by side in one collection." : `Start writing the new shape now. When the app <b>reads</b> an old document it splits the name in code. <b style="color:var(--teal-ink)">No downtime, no waiting for ${fmt(rows)} documents.</b>`}</p></div></div>`
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
            ? `Whole profile wanted: the document is <b>1 read</b>; tables need <b>6 separate reads</b> and joins. <b style="color:var(--teal-ink)">Locality wins.</b>`
            : `Only the name wanted: the document still loads <b>${size} KB</b> (the DB loads the entire document). Tables read a tiny row. <b style="color:var(--rose-ink)">Locality wastes work</b> when documents are large and you need a sliver.`;
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
  Object.assign(partScope, { GE, GN, bfs, mono, pick, reg2, reg3, sorter });
})();

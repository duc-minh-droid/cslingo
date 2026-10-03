/* Revision bank, third set of varied, visual questions (ds-2).
   Lecture 2 (models, schema, graph, NoSQL) and Lecture 3 (log, hash index, SSTable).
   Every module gets four new questions, each with a different diagram kind from the earlier sets:
   tree, timeline, small multiples, flowchart | presence grid, sequence diagram, grouped bars, table trace |
   matrix, rings, Venn, code | heat grid, replica map, line plot, key diagram | sequence, scatter, snapshot panels, code |
   byte tape, segment matrix, gauge, crash sequence | layer stack, merge trace, key ruler, step chart.
   Concepts only, no SQL, no calculator. Numbers verified with node. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto">${body}</svg>`;
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "start"}" style="font:${o.w || 800} ${(o.s || 13) + 1}px ${o.m ? "var(--mono)" : "var(--sans)"}" fill="${o.c || "var(--text)"}">${esc(s)}</text>`;
  const R = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const Ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2.5, d = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
  const Circ = (x, y, r, o = {}) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2.5}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const arrow = (x1, y1, x2, y2, c = "var(--text-dim)", w = 2.5, d = "") => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 9, bx = x2 - Math.cos(a) * h, by = y2 - Math.sin(a) * h, s = Math.sin(a) * 5, k = Math.cos(a) * 5;
    return Ln(x1, y1, bx, by, c, w, d) + `<polygon points="${x2},${y2} ${bx + s},${by - k} ${bx - s},${by + k}" fill="${c}"/>`;
  };
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;

  /* Sequence diagram. lifelines [[x, label]], msgs [{id, from, to (lifeline idx), y, label, c, d, soft}] */
  function seq(w, h, lifelines, msgs, { pick = false, extra = "" } = {}) {
    let b = "";
    lifelines.forEach(([x, label]) => {
      b += Ln(x, 40, x, h - 6, "var(--line-2)", 2, "5 5");
      b += R(x - 62, 6, 124, 32, { f: "var(--panel-2)" }) + T(x, 27, label, { a: "middle", s: 13 });
    });
    msgs.forEach((m) => {
      const x1 = lifelines[m.from][0], x2 = lifelines[m.to][0], dir = x2 > x1 ? 1 : -1, col = m.c || "var(--text-dim)";
      const row = pick ? R(10, m.y - 22, w - 20, 36, { rx: 8, f: "var(--panel)", st: "var(--line)", sw: 2 }) : "";
      let inner = row + T((x1 + x2) / 2, m.y - 6, m.label, { a: "middle", s: 13, c: m.soft ? "var(--text-dim)" : "var(--text)" });
      inner += arrow(x1 + dir * 4, m.y + 6, x2 - dir * 4, m.y + 6, col, 2.5, m.d || "");
      b += pick ? PK(m.id, inner) : inner;
    });
    return svg(w, h, b + extra);
  }

  /* ================= ds-models ================= */
  function figTree() {
    const depts = [["Design", 90], ["Games", 250], ["Web", 410]];
    const ppl = [["Ana", 44], ["Kai", 140], ["Raj", 250], ["Mia", 350], ["Zed", 440]];
    let b = T(8, 18, "Each team lists the people who belong to it", { s: 12, c: "var(--text-dim)" });
    [[0, 0], [0, 1], [1, 1], [1, 2], [2, 3], [2, 4]].forEach(([d, p]) => (b += Ln(depts[d][1], 76, ppl[p][1], 168, "var(--line-2)", 3)));
    depts.forEach(([n, x]) => (b += R(x - 48, 40, 96, 36, { f: "var(--violet-dim)", st: "var(--violet)" }) + T(x, 63, n, { a: "middle" })));
    ppl.forEach(([n, x]) => (b += PK(n.toLowerCase(), R(x - 38, 168, 76, 36, { f: "var(--blue-dim)", st: "var(--blue)" }) + T(x, 191, n, { a: "middle" }))));
    return svg(480, 222, b);
  }

  function figPrice() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], x0 = 30, dw = 60;
    let b = "";
    days.forEach((d, i) => {
      b += T(x0 + i * dw + dw / 2, 16, d, { a: "middle", s: 12, c: "var(--text-dim)" });
      b += Ln(x0 + i * dw, 24, x0 + i * dw, 186, "var(--line)", 1.5);
    });
    b += Ln(x0 + 7 * dw, 24, x0 + 7 * dw, 186, "var(--line)", 1.5);
    b += T(x0, 44, "Price of dried figs", { s: 12, c: "var(--text-dim)" });
    b += R(x0, 52, 3 * dw, 30, { f: "var(--amber-dim)", st: "var(--amber)" }) + T(x0 + 1.5 * dw, 72, "4 per kg", { a: "middle" });
    b += R(x0 + 3 * dw, 52, 4 * dw, 30, { f: "var(--teal-dim)", st: "var(--teal)" }) + T(x0 + 5 * dw, 72, "5 per kg", { a: "middle" });
    b += T(x0, 112, "Orders placed (each stores a copy)", { s: 12, c: "var(--text-dim)" });
    [[1, "Order #1", "figs, 4 per kg"], [4, "Order #2", "figs, 5 per kg"]].forEach(([d, t, c]) => {
      const cx = x0 + d * dw + dw / 2;
      b += R(cx - 62, 122, 124, 52, { f: "var(--panel)", st: "var(--blue)" }) + T(cx, 143, t, { a: "middle" }) + T(cx, 162, c, { a: "middle", s: 12, c: "var(--text-dim)" });
    });
    return svg(460, 190, b);
  }

  function figLookups() {
    const panels = [
      ["Normalised tables", ["users", "positions", "education", "contacts"], "amber"],
      ["JSON column", ["user row"], "teal"],
      ["Document", ["document"], "blue"],
    ];
    let b = T(8, 16, "Lookups needed to build ONE profile", { s: 12, c: "var(--text-dim)" });
    panels.forEach(([title, blocks, col], i) => {
      const x = 10 + i * 152, base = 196;
      b += R(x, 26, 140, 176, { f: "var(--panel-2)", st: "var(--line)" });
      b += T(x + 70, 46, title, { a: "middle", s: 12 });
      blocks.forEach((t, k) => {
        b += R(x + 22, base - 30 - k * 34, 96, 28, { f: `var(--${col}-dim)`, st: `var(--${col})`, rx: 6 }) + T(x + 70, base - 11 - k * 34, t, { a: "middle", s: 12 });
      });
    });
    return svg(460, 210, b);
  }

  function figFlow() {
    const box = (x, y, w, h, lines, o = {}) => R(x, y, w, h, { f: o.f || "var(--panel)", st: o.st || "var(--line-2)" }) + lines.map((t, i) => T(x + w / 2, y + h / 2 + 5 - (lines.length - 1) * 8 + i * 16, t, { a: "middle", s: 12 })).join("");
    let b = box(130, 8, 220, 46, ["Do many records", "share this item?"], { f: "var(--violet-dim)", st: "var(--violet)" });
    b += arrow(160, 54, 85, 118, "var(--text-dim)", 2.5) + T(95, 84, "yes", { s: 12, c: "var(--text-dim)" });
    b += arrow(320, 54, 345, 98, "var(--text-dim)", 2.5) + T(345, 78, "no", { s: 12, c: "var(--text-dim)" });
    b += PK("ref", box(10, 120, 150, 58, ["Its own record,", "parents point to it"], { f: "var(--amber-dim)", st: "var(--amber)" }));
    b += box(235, 100, 225, 46, ["Is it read together with", "its parent almost every time?"], { f: "var(--violet-dim)", st: "var(--violet)" });
    b += arrow(290, 146, 245, 208, "var(--text-dim)", 2.5) + T(250, 176, "yes", { s: 12, c: "var(--text-dim)" });
    b += arrow(405, 146, 405, 208, "var(--text-dim)", 2.5) + T(412, 180, "no", { s: 12, c: "var(--text-dim)" });
    b += PK("embed", box(165, 210, 150, 58, ["Embed it inside", "the parent document"], { f: "var(--teal-dim)", st: "var(--teal)" }));
    b += PK("link", box(335, 210, 130, 58, ["Its own record,", "linked by parent ID"], { f: "var(--blue-dim)", st: "var(--blue)" }));
    return svg(480, 276, b);
  }

  B.add("ds-models", [
    { type: "pick", q: "A company stores each team's people as a list inside the team's own record. That nests neatly while every person belongs to one team. <b>Tap the person this nesting cannot store just once.</b>",
      fig: figTree(), a: "kai",
      why: "Kai sits under two teams, a many-to-many link. Nested inside both Design and Games, Kai's details would be copied twice and could drift apart. Everyone else has one parent, which is the one-to-many shape that documents nest well." },
    { type: "multi", q: "A dried-fruit shop stores each order as a document that copies the product's name and price at the time of sale. Using the timeline, select all statements that are true.",
      fig: figPrice(),
      o: ["Order #1 still says 4, which is what that customer paid", "Copying the price into orders is a mistake: they should show the live price", "A report of Tuesday's takings stays right after the price rise", "If the product is renamed later, the copy in order #1 will not follow", "Order #2 would switch back to 4 if the price were cut again on Saturday"],
      a: [0, 2, 3],
      why: "Orders are history, so a copy frozen at the time of sale is the point. The cost is that later edits do not reach the copies. Orders do not read the live price, so a Saturday cut changes nothing already stored." },
    { type: "slider", q: "A page shows 25 profile cards, and each card is built on its own. Using the three panels, about how many lookups does the normalised-tables design need for the whole page?",
      fig: figLookups(), min: 0, max: 250, step: 10, ans: 100, tol: 20, unit: " lookups", hint: "Count the blocks in the first panel, then multiply by 25.",
      why: "Four tables means four lookups for each profile: 4 × 25 = 100. The document design keeps a profile in one place, so it needs 25. Locality is the difference." },
    { type: "pick", q: "A user's 30 saved search filters are shown only on a settings page, and the user document is large. Follow the flowchart for the filters. <b>Tap the box where the path ends.</b>",
      fig: figFlow(), a: "link",
      why: "Only this user has the filters, so they are not shared. They are rarely read with the user, so embedding would load them every time for nothing. Keeping them as their own linked record avoids that waste." },
  ]);

  /* ================= ds-schema ================= */
  function figPresence() {
    const cols = ["id", "name", "email", "age", "city"], rows = [[1, 1, 1, 1, 1], [1, 1, 1, 0, 0], [1, 1, 0, 1, 0], [1, 1, 1, 0, 1], [1, 1, 0, 0, 0], [1, 1, 1, 1, 0]];
    let b = T(8, 18, "Which fields each of six sample documents has", { s: 12, c: "var(--text-dim)" });
    cols.forEach((c, i) => (b += T(96 + i * 72, 44, c, { a: "middle", m: true })));
    rows.forEach((r, j) => {
      b += T(10, 74 + j * 34, `doc ${j + 1}`, { s: 12, c: "var(--text-dim)" });
      r.forEach((on, i) => (b += on ? R(64 + i * 72, 54 + j * 34, 64, 28, { f: "var(--blue-dim)", st: "var(--blue)", rx: 6 }) + Circ(96 + i * 72, 68 + j * 34, 4.5, { f: "var(--blue)", st: "var(--blue)", sw: 1 }) : R(64 + i * 72, 54 + j * 34, 64, 28, { f: "none", st: "var(--line-2)", d: "4 4", sw: 1.5, rx: 6 })));
    });
    return svg(440, 266, b);
  }

  function figRolling() {
    const L = [[72, "App v1"], [240, "Database"], [408, "App v2"]];
    const m = [
      { id: "m1", from: 0, to: 1, y: 74, label: "save Ada: {name}" },
      { id: "m2", from: 2, to: 1, y: 114, label: "save Cy: {first, last}" },
      { id: "m3", from: 0, to: 1, y: 154, label: "read Cy" },
      { id: "m4", from: 1, to: 0, y: 194, label: "Cy: {first, last}", d: "5 4" },
      { id: "m5", from: 2, to: 1, y: 234, label: "read Ada" },
      { id: "m6", from: 1, to: 2, y: 274, label: "Ada: {name}", d: "5 4" },
    ];
    return seq(480, 292, L, m, { pick: true });
  }

  function figBars() {
    const base = 214, k = 4; // 4 px per KB
    let b = "";
    [0, 10, 20, 30, 40].forEach((v) => {
      b += Ln(70, base - v * k, 450, base - v * k, "var(--line)", 1.5) + T(62, base - v * k + 4, v, { a: "end", s: 11, c: "var(--text-dim)" });
    });
    b += T(8, 18, "KB read for one user", { s: 12, c: "var(--text-dim)" });
    b += R(190, 6, 14, 14, { f: "var(--amber-dim)", st: "var(--amber)", rx: 3 }) + T(210, 18, "Document store", { s: 12 });
    b += R(320, 6, 14, 14, { f: "var(--blue-dim)", st: "var(--blue)", rx: 3 }) + T(340, 18, "Normalised tables", { s: 12 });
    [[150, "Show the whole profile", 40, 40], [350, "Show just the name", 40, 1]].forEach(([cx, t, d, n]) => {
      b += R(cx - 48, base - d * k, 40, d * k, { f: "var(--amber-dim)", st: "var(--amber)", rx: 4 }) + T(cx - 28, base - d * k - 6, `${d} KB`, { a: "middle", s: 12 });
      b += R(cx + 8, base - n * k, 40, n * k, { f: "var(--blue-dim)", st: "var(--blue)", rx: 2 }) + T(cx + 28, base - n * k - 6, `${n} KB`, { a: "middle", s: 12 });
      b += T(cx, base + 22, t, { a: "middle", s: 13 });
    });
    return svg(460, 240, b);
  }

  function figBackfill() {
    const rows = [["1", "Ada Byte", "Ada", "Byte", ""], ["2", "Cy Dee", "Cy", "Dee", ""], ["3", "Eli Moss", "Eli", "Moss", ""], ["4", "Flo Park", null, null, ""], ["5", "Gus Lamb", null, null, ""], ["6", "Ivy Cole", "Ivy", "Cole", "written by v2"], ["7", "Jon Reed", null, null, "written by v1"]];
    let b = T(8, 16, "Backfill copies name into first and last, in id order. It has done ids 1 to 3.", { s: 12, c: "var(--text-dim)" });
    [["id", 18], ["name", 62], ["first", 196], ["last", 288], ["", 380]].forEach(([t, x]) => (b += T(x, 44, t, { s: 12, m: true, c: "var(--text-dim)" })));
    rows.forEach(([id, nm, f, l, note], j) => {
      const y = 54 + j * 36;
      b += PK(`r${id}`, R(8, y, 464, 30, { f: "var(--panel)", st: "var(--line)", sw: 1.5, rx: 6 }) + T(18, y + 20, id, { m: true }) + T(62, y + 20, nm, { m: true, s: 12 }) +
        (f ? T(196, y + 20, f, { m: true, s: 12 }) + T(288, y + 20, l, { m: true, s: 12 }) : T(196, y + 20, "NULL", { m: true, s: 12, c: "var(--text-faint)", w: 700 }) + T(288, y + 20, "NULL", { m: true, s: 12, c: "var(--text-faint)", w: 700 })) +
        T(380, y + 20, note, { s: 11, c: "var(--text-dim)" }));
    });
    return svg(480, 314, b);
  }

  B.add("ds-schema", [
    { type: "mcq", q: "These six documents come from a schema-on-read collection. Every one has <code>name</code>. May the reading code skip its check for a missing <code>name</code> from now on?",
      fig: figPresence(), o: ["No: a later write is free to leave it out", "Yes: six out of six documents is enough to rely on", "Yes: the database validates each document on save", "Yes: a name field is always kept in a separate place"], a: 0,
      why: "The grid shows what happens to exist today, not a rule. Without a schema, nothing stops tomorrow's document from missing a field, so the reader has to cope with that case itself." },
    { type: "pick", q: "During a rolling update, old servers (v1) and new servers (v2) run together. v1 only understands <code>name</code>. v2 writes <code>first</code> and <code>last</code> but can still read old shapes. <b>Tap the message where something breaks.</b>",
      fig: figRolling(), a: "m4",
      why: "In message 4 the old v1 server reads a document that v2 wrote: no name field. With schema-on-read, every reader must cope with every shape, including the old code still running during the roll-out." },
    { type: "slider", q: "The user list needs just the name of 50 users. Each profile document is 40 KB. Using the chart, about how many MB does the document store load for the list?",
      fig: figBars(), min: 0, max: 6, step: 0.5, ans: 2, tol: 0.5, unit: " MB", hint: "50 × 40 KB = 2,000 KB, and 1,000 KB is 1 MB.",
      why: "A document is loaded whole, so every user costs 40 KB even for one short field: 50 × 40 KB = 2,000 KB, about 2 MB. Tables would read around 50 KB. Locality is wasteful when you need a sliver." },
    { type: "pick", q: "A relational table gets new <code>first</code> and <code>last</code> columns while the backfill job runs and both app versions keep writing. A new feature reads <code>first</code> straight from the table. <b>Tap every row that would give it NULL.</b>",
      fig: figBackfill(), a: ["r4", "r5", "r7"],
      why: "Rows 4 and 5 are still waiting for the backfill. Row 7 was written by the old app after the change, so nobody filled its new columns. Row 6 came from v2, which fills them. A migration is not finished until the old writers are gone too." },
  ]);

  /* ================= ds-graph ================= */
  function figMatrix() {
    const P = ["A", "B", "C", "D", "E"], on = new Set(["A-B", "A-C", "B-A", "B-D", "C-D", "D-E", "E-D"]), x0 = 74, y0 = 62, s = 46;
    let b = T(8, 16, "Filled cell: the ROW person follows", { s: 12, c: "var(--text-dim)" }) + T(8, 34, "the COLUMN person", { s: 12, c: "var(--text-dim)" });
    P.forEach((p, i) => (b += T(x0 + i * s + s / 2, y0 - 10, p, { a: "middle" }) + T(x0 - 18, y0 + i * s + s / 2 + 5, p, { a: "middle" })));
    P.forEach((r, j) => P.forEach((c, i) => {
      const id = `${r}-${c}`, x = x0 + i * s, y = y0 + j * s;
      b += on.has(id) ? PK(id, R(x + 2, y + 2, s - 4, s - 4, { f: "var(--blue-dim)", st: "var(--blue)", rx: 6 }) + Circ(x + s / 2, y + s / 2, 6, { f: "var(--blue)", st: "var(--blue)", sw: 1 })) : R(x + 2, y + 2, s - 4, s - 4, { f: r === c ? "var(--line)" : "none", st: "var(--line)", sw: 1.5, rx: 6 });
    }));
    return svg(340, 306, b);
  }

  function figRings() {
    const cum = [1, 7, 37, 187], k = 165 / Math.sqrt(187), cx = 170, cy = 180, r = cum.map((c) => k * Math.sqrt(c));
    let b = Circ(cx, cy, r[3], { f: "var(--violet-dim)", st: "var(--violet)", d: "6 6", sw: 2 });
    b += Circ(cx, cy, r[2], { f: "var(--blue-dim)", st: "var(--blue)" }) + Circ(cx, cy, r[1], { f: "var(--teal-dim)", st: "var(--teal)" }) + Circ(cx, cy, r[0], { f: "var(--amber)", st: "var(--amber)", sw: 1 });
    [["var(--amber)", "You", "the start"], ["var(--teal)", "Hop 1", "6 people"], ["var(--blue)", "Hop 2", "30 people"], ["var(--violet)", "Hop 3", "? people"]].forEach(([c, t, s], i) => {
      b += R(344, 40 + i * 62, 16, 16, { f: c, st: c, rx: 4 }) + T(366, 54 + i * 62, t, { s: 13 }) + T(366, 73 + i * 62, s, { s: 12, c: "var(--text-dim)" });
    });
    b += T(8, 18, "Areas show how many people are reached so far", { s: 12, c: "var(--text-dim)" });
    return svg(450, 360, b);
  }

  function figVenn() {
    const L = "M230,62.92 A90,90 0 1 0 230,197.08 A90,90 0 0 1 230,62.92 Z", Rr = "M230,62.92 A90,90 0 1 1 230,197.08 A90,90 0 0 0 230,62.92 Z", M = "M230,62.92 A90,90 0 0 0 230,197.08 A90,90 0 0 0 230,62.92 Z";
    const path = (d, f, st) => `<path d="${d}" fill="${f}" stroke="${st}" stroke-width="2.5" stroke-linejoin="round"/>`;
    let b = T(170, 24, "Ana's friends", { a: "middle" }) + T(290, 24, "Ben's friends", { a: "middle" });
    b += PK("ana", path(L, "var(--blue-dim)", "var(--blue)") + T(135, 122, "Eli", { a: "middle" }) + T(135, 150, "Flo", { a: "middle" }));
    b += PK("ben", path(Rr, "var(--violet-dim)", "var(--violet)") + T(327, 136, "Gus", { a: "middle" }));
    b += PK("both", path(M, "var(--teal-dim)", "var(--teal)") + T(230, 122, "Cy", { a: "middle" }) + T(230, 150, "Dee", { a: "middle" }));
    return svg(340, 236, `<g transform="translate(-60,0)">${b}</g>`);
  }

  B.add("ds-graph", [
    { type: "pick", q: "The matrix records who follows whom. Two people <i>follow each other</i> when each one follows the other. <b>Tap every cell that belongs to a pair of mutual followers.</b>",
      fig: figMatrix(), a: ["A-B", "B-A", "D-E", "E-D"],
      why: "A follows B and B follows A, and D and E follow each other too: each pair fills two cells that mirror each other across the diagonal. A to C, B to D and C to D have no cell going back, so those follows are one-way." },
    { type: "slider", q: "Each hop out from you reaches about 5 times as many new people as the hop before. Hop 1 reached 6 and hop 2 reached 30. About how many <b>new</b> people does hop 3 reach?",
      fig: figRings(), min: 0, max: 400, step: 10, ans: 150, tol: 30, unit: " people", hint: "6, then 30, then 30 × 5.",
      why: "The crowd multiplies at every hop: 6 × 5 = 30, and 30 × 5 = 150. A traversal is cheap for one or two hops, but the number of vertices it must touch grows fast, so deep traversals get costly." },
    { type: "pick", q: "Ana wants to introduce friends of hers to Ben. The query is: <i>Ana's friends who are not yet friends with Ben.</i> <b>Tap the region the query returns.</b>",
      fig: figVenn(), a: "ana",
      why: "The query keeps Ana's friends and drops anyone Ben already knows. That is the left-hand crescent: Eli and Flo. Cy and Dee are in both circles, so they are already connected to Ben." },
    { type: "bug", q: "Friendships are mutual and each is stored once, as <code>(a, b)</code>. After <code>friends(\"ben\")</code> the list holds only Cy, but Ana is Ben's friend too. Click the faulty line.",
      code: ["edges = [(\"ana\", \"ben\"), (\"ben\", \"cy\")]", "def friends(v):", "    out = []", "    for a, b in edges:", "        if a == v:", "            out.append(b)", "    return out"], a: 4,
      why: "The test only follows an edge from its first end. A mutual friendship has to be followed from either end: <code>if a == v</code> must also handle <code>b == v</code> and add <code>a</code>. Ana's edge starts at \"ana\", so Ben's lookup never sees her." },
  ]);

  /* ================= ds-nosql ================= */
  function figHeat() {
    const hours = ["09:00 to 10:00", "10:00 to 11:00", "11:00 to 12:00", "12:00 to 13:00"];
    let b = T(8, 18, "Writes per second reaching each server (thousands)", { s: 12, c: "var(--text-dim)" });
    ["Server 1", "Server 2", "Server 3", "Server 4"].forEach((s, i) => (b += T(180 + i * 70, 46, s, { a: "middle", s: 12 })));
    hours.forEach((h, j) => {
      b += T(8, 76 + j * 44, h, { s: 12, c: "var(--text-dim)" });
      for (let i = 0; i < 4; i++) {
        const hot = i === j;
        b += R(148 + i * 70, 54 + j * 44, 64, 38, { f: hot ? "var(--amber)" : "var(--amber-dim)", st: hot ? "var(--amber-ink)" : "var(--amber-edge)", rx: 6, sw: 1.5 }) + T(180 + i * 70, 78 + j * 44, hot ? "4.0" : "0.1", { a: "middle", c: hot ? "#fff" : "var(--amber-ink)" });
      }
    });
    return svg(440, 236, b);
  }

  function figReplicas() {
    const px = [60, 150, 240, 330, 420], sx = [75, 195, 315, 435], rep = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]], down = new Set([0, 2]);
    let b = T(8, 14, "Each partition is stored on two servers", { s: 12, c: "var(--text-dim)" });
    rep.forEach(([a, c], p) => [a, c].forEach((s) => (b += Ln(px[p], 60, sx[s], 178, down.has(s) ? "var(--rose-edge)" : "var(--line-2)", 2.5))));
    px.forEach((x, p) => (b += PK(`P${p + 1}`, R(x - 35, 24, 70, 36, { f: "var(--violet-dim)", st: "var(--violet)" }) + T(x, 48, `P${p + 1}`, { a: "middle" }))));
    sx.forEach((x, s) => {
      b += R(x - 45, 178, 90, 38, { f: down.has(s) ? "var(--rose-dim)" : "var(--teal-dim)", st: down.has(s) ? "var(--rose)" : "var(--teal)" }) + T(x, 201, `S${s + 1}${down.has(s) ? " down" : ""}`, { a: "middle", c: down.has(s) ? "var(--rose-ink)" : "var(--text)" });
    });
    return svg(480, 228, b);
  }

  function figScale() {
    const X = (x) => 56 + x * 40, Y = (c) => 250 - c * 18, up = (x) => 0.5 + 0.4 * x * x, out = (x) => 2 + x;
    let b = Ln(56, 250, 460, 250, "var(--text-dim)", 2) + Ln(56, 250, 56, 20, "var(--text-dim)", 2);
    b += T(458, 272, "load handled", { a: "end", s: 12, c: "var(--text-dim)" }) + T(62, 16, "cost", { s: 12, c: "var(--text-dim)" });
    let pu = "", pg = [];
    for (let x = 0; x <= 5.001; x += 0.25) pu += `${pu ? "L" : "M"}${X(x).toFixed(1)},${Y(up(x)).toFixed(1)}`;
    b += `<path d="${pu}" fill="none" stroke="var(--amber)" stroke-width="3.5" stroke-linecap="round"/>`;
    b += Ln(X(0), Y(out(0)), X(10), Y(out(10)), "var(--blue)", 3.5);
    b += T(X(1.7), Y(up(1.7)) + 26, "one bigger machine", { s: 12, c: "var(--amber-ink)" }) + T(X(5.4), Y(out(5.4)) - 12, "more machines", { s: 12, c: "var(--blue-ink)" });
    [["A", 0, up(0)], ["B", 3.5549, 5.5552], ["C", 5, up(5)], ["D", 8, out(8)]].forEach(([id, x, c]) => (b += PK(id, Circ(X(x), Y(c), 14, { f: "var(--panel)", st: "var(--ink)" }) + T(X(x), Y(c) + 4.5, id, { a: "middle" }))));
    return svg(480, 284, b);
  }

  function figKeys() {
    const rows = [["S-7", "09:00", "21.5", "88"], ["S-7", "09:15", "21.9", "87"], ["S-7", "09:30", "22.4", "87"], ["S-8", "09:00", "19.0", "42"], ["S-8", "09:15", "19.4", "42"]];
    const th = (t, c, sub) => `<th style="background:var(--${c}-dim);border-bottom:3px solid var(--${c})">${t}${sub ? `<div style="font:700 11px var(--sans);color:var(--text-dim)">${sub}</div>` : ""}</th>`;
    return `<table class="t" style="font-family:var(--mono);font-size:13px"><tr>${th("sensor", "amber", "partition key")}${th("time", "blue", "sort key")}<th>temp</th><th>battery %</th></tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
  }

  B.add("ds-nosql", [
    { type: "mcq", q: "A table of sensor readings is split across four servers by one partition key. The grid shows the writes reaching each server, hour by hour. Which partition key fits this picture?",
      fig: figHeat(), o: ["The hour of the write, so each hour shares one partition", "The sensor ID, with thousands of sensors all writing evenly", "A random ID given to every reading as it arrives, to scatter them", "The building a sensor sits in, with four equally busy buildings"], a: 0,
      why: "All of one hour's writes land on a single server while the others idle, and the hot spot moves on every hour. That is a time-based key. A sensor or random key spreads the load, and four busy buildings would keep every server steadily loaded." },
    { type: "pick", q: "Each partition is stored on two servers, as the lines show. Servers S1 and S3 go down. <b>Tap the partition that can no longer be read.</b>",
      fig: figReplicas(), a: "P5",
      why: "P5 lived on S1 and S3, and both are down. Every other partition has a copy on S2 or S4. Keeping several copies on different servers is how a store stays available when machines fail." },
    { type: "pick", q: "The chart compares what it costs to handle more load. Spreading across machines has a set-up cost but then grows steadily. <b>Tap the point where both options cost the same.</b>",
      fig: figScale(), a: "B",
      why: "B is where the lines cross: about 3.6 units of load. Below it one bigger machine is cheaper. Above it adding machines wins, and the big machine runs out at C, where D shows scaling out still going." },
    { type: "match", q: "This table has partition key <code>sensor</code> and sort key <code>time</code>. Match each request to how the store finds the data.",
      fig: figKeys(),
      pairs: [["S-7 readings from 09:00 to 09:30", "Go to one partition, read a slice in order"], ["S-7 reading at exactly 09:15", "Go to one partition, jump to one item"], ["Every sensor's reading at 09:15", "Ask every partition: time alone picks none"], ["S-7 and S-8 readings from 09:00 to 09:30", "Go to two partitions, read a slice from each"]],
      why: "The partition key chooses where to look, and the sort key orders what is inside. A request that names the sensor stays within that partition. One that names only the time cannot pick a partition, so every partition has to be asked." },
  ]);

  /* ================= ds-log ================= */
  function figInterleave() {
    const L = [[70, "Client 1"], [245, "Log file"], [420, "Client 2"]];
    const m = [
      { id: "w1", from: 0, to: 1, y: 74, label: "write \"bike,\"  (half)" },
      { id: "w2", from: 2, to: 1, y: 118, label: "write \"dock,7\\n\"  (whole)" },
      { id: "w3", from: 0, to: 1, y: 162, label: "write \"5\\n\"  (other half)" },
    ];
    const extra = T(6, 74, "1", { s: 12, c: "var(--text-dim)" }) + T(6, 118, "2", { s: 12, c: "var(--text-dim)" }) + T(6, 162, "3", { s: 12, c: "var(--text-dim)" });
    return seq(480, 186, L, m, { extra });
  }

  function figScatter() {
    const P = { A: [0.9, 0.08], B: [0.12, 0.9], C: [0.7, 0.18], D: [0.25, 0.75], E: [0.82, 0.25] };
    const X = (v) => 60 + v * 380, Y = (v) => 240 - v * 210;
    let b = Ln(60, 240, 450, 240, "var(--text-dim)", 2) + Ln(60, 240, 60, 20, "var(--text-dim)", 2);
    b += Ln(X(0.5), 24, X(0.5), 240, "var(--line)", 1.5, "5 5") + Ln(60, Y(0.5), 440, Y(0.5), "var(--line)", 1.5, "5 5");
    b += T(450, 262, "writes per second, low to high", { a: "end", s: 12, c: "var(--text-dim)" }) + T(66, 16, "rows read per query, few to many", { s: 12, c: "var(--text-dim)" });
    Object.entries(P).forEach(([k, [x, y]]) => (b += Circ(X(x), Y(y), 16, { f: "var(--blue-dim)", st: "var(--blue)" }) + T(X(x), Y(y) + 5, k, { a: "middle" })));
    return svg(470, 274, b);
  }

  function figSnaps() {
    const panels = [["P", 5, 6, ["dock=2", "dock=5", "dock: del"]], ["Q", 235, 6, []], ["R", 5, 120, ["dock=2"]], ["S", 235, 120, ["dock=2", "dock=5"]]];
    let b = "";
    panels.forEach(([n, x, y, recs]) => {
      b += R(x, y, 220, 104, { f: "var(--panel-2)", st: "var(--line)" }) + T(x + 12, y + 24, `Panel ${n}`, { s: 13 }) + T(x + 208, y + 24, `${recs.length} record${recs.length === 1 ? "" : "s"}`, { a: "end", s: 12, c: "var(--text-dim)" });
      recs.forEach((r, i) => {
        const dead = r.includes("del");
        b += R(x + 8 + i * 70, y + 46, 66, 36, { f: dead ? "var(--rose-dim)" : "var(--panel)", st: dead ? "var(--rose)" : "var(--blue)", rx: 6 }) + T(x + 41 + i * 70, y + 69, r, { a: "middle", m: true, s: 10, c: dead ? "var(--rose-ink)" : "var(--text)" });
      });
      if (!recs.length) b += T(x + 110, y + 72, "empty file", { a: "middle", s: 13, c: "var(--text-faint)", w: 700 });
    });
    return svg(460, 232, b);
  }

  B.add("ds-log", [
    { type: "mcq", q: "Two clients append to the same log at once, and each record is sent in more than one write. Following the diagram, what goes wrong, and what is the usual fix?",
      fig: figInterleave(), o: ["Records are cut into broken lines; write each record as one uninterrupted append", "Both records are lost because the file is locked; retry the writes until it frees up", "Nothing: appends always land at the end, so each record stays whole and in order", "The second record overwrites the first; give every client a separate log file"], a: 0,
      why: "The halves interleave, giving a line that reads bike,dock,7 and another that reads 5. Neither is a valid record. A log needs concurrency control so each record goes in as one uninterrupted append, for example through a single writer or a lock." },
    { type: "cat", q: "Each dot is an application, placed by how many writes it makes per second and how many rows each of its reads must look at. Which kind of workload is each?",
      fig: figScatter(), buckets: ["Transactional (write-heavy)", "Analytics (read-heavy)"],
      items: [["Dot A", 0], ["Dot B", 1], ["Dot C", 0], ["Dot D", 1], ["Dot E", 0]],
      why: "A, C and E sit at many small writes with tiny reads, like payments or orders: transactional. B and D make few writes but scan huge amounts per read, like reports: analytics. The workload decides which storage engine fits." },
    { type: "order", q: "A key <b>dock</b> is set twice, then deleted, then a compaction runs. These four snapshots of the log file were taken right after each of those events, but are shown in a mixed order. Put them in the order they were taken.",
      fig: figSnaps(), items: ["Panel R", "Panel S", "Panel P", "Panel Q"],
      why: "The first set adds one record (R) and the second adds another (S). The delete adds a tombstone line, so the file grows to three records (P). Only compaction removes lines, so the empty file (Q) comes last: a delete never erases anything by itself." },
    { type: "bug", q: "Records are written as <code>key,value</code>. When a value such as <code>Reid, Mo</code> contains a comma, <code>get()</code> crashes. Click the faulty line.",
      code: ["def get(key):", "    last = None", "    for line in open(\"db.log\"):", "        k, v = line.rstrip().split(\",\")", "        if k == key:", "            last = v", "    return last"], a: 3,
      why: "Splitting at every comma gives three pieces for that record, so the unpacking fails. The format is ambiguous. Split once (<code>split(\",\", 1)</code>) or use a binary format that stores lengths, which is one reason real logs prefer binary files." },
  ]);

  /* ================= ds-hashidx ================= */
  function figTape() {
    const recs = [["a", 14, "0"], ["b", 9, "14"], ["c", 12, "23"], ["d", 8, "35"]], s = 8, x0 = 30;
    let b = T(8, 18, "Log file, drawn to scale (bytes)", { s: 12, c: "var(--text-dim)" }), x = x0;
    recs.forEach(([k, n, off], i) => {
      b += R(x, 34, n * s, 48, { f: "var(--blue-dim)", st: "var(--blue)", rx: 4 }) + T(x + (n * s) / 2, 56, `key ${k}`, { a: "middle", s: 12 }) + T(x + (n * s) / 2, 73, `${n} B`, { a: "middle", s: 11, c: "var(--text-dim)", w: 700 });
      b += Ln(x, 82, x, 96, "var(--text-dim)", 2) + T(x, 112, off, { a: "middle", m: true, s: 12 });
      x += n * s;
    });
    b += Ln(x, 82, x, 96, "var(--rose)", 2) + T(x, 112, "43", { a: "middle", m: true, s: 12, c: "var(--rose-ink)" }) + T(x, 130, "end of file", { a: "middle", s: 12, c: "var(--text-dim)" });
    b += T(8, 156, "Hash map in memory", { s: 12, c: "var(--text-dim)" });
    recs.forEach(([k, , off], i) => (b += R(10 + i * 104, 166, 96, 34, { f: "var(--panel)", st: "var(--line-2)" }) + T(58 + i * 104, 188, `${k} → ${off}`, { a: "middle", m: true, s: 13 })));
    return svg(440, 212, b);
  }

  function figSegMatrix() {
    const keys = ["a", "b", "c", "d", "e"], S = { 1: { a: 1, b: 2, c: 3, d: 4 }, 2: { b: 5, c: 6, e: 7 }, 3: { c: 8, e: 9 } }, x0 = 64, cw = 118;
    let b = T(8, 16, "Compaction merges S1 and S2 only. S3 is newer and is left alone.", { s: 12, c: "var(--text-dim)" });
    ["S1 (oldest)", "S2", "S3 (newer)"].forEach((t, i) => (b += T(x0 + i * cw + cw / 2, 44, t, { a: "middle", s: 12 })));
    keys.forEach((k, j) => {
      b += T(24, 78 + j * 42, k, { a: "middle", m: true });
      [1, 2, 3].forEach((s, i) => {
        const v = S[s][k], x = x0 + i * cw + 4, y = 56 + j * 42;
        if (v == null) { b += R(x, y, cw - 8, 36, { f: "none", st: "var(--line)", d: "4 4", sw: 1.5, rx: 6 }); return; }
        const cell = R(x, y, cw - 8, 36, { f: s === 3 ? "var(--panel-2)" : "var(--blue-dim)", st: s === 3 ? "var(--line-2)" : "var(--blue)", rx: 6 }) + T(x + (cw - 8) / 2, y + 23, `${k} = ${v}`, { a: "middle", m: true, s: 13 });
        b += s === 3 ? cell : PK(`S${s}${k}`, cell);
      });
    });
    return svg(430, 276, b);
  }

  function figGauge() {
    const cx = 230, cy = 176, r = 140, P = (f, rr = r) => { const t = Math.PI * (1 - f); return [(cx + rr * Math.cos(t)).toFixed(1), (cy - rr * Math.sin(t)).toFixed(1)]; };
    const arc = (f0, f1, c) => { const a = P(f0), z = P(f1); return `<path d="M${a} A${r},${r} 0 0 1 ${z}" fill="none" stroke="${c}" stroke-width="26"/>`; };
    let b = arc(0, 0.7, "var(--teal)") + arc(0.7, 0.9, "var(--amber)") + arc(0.9, 1, "var(--rose)");
    const n = P(0.4, r - 30);
    b += Ln(cx, cy, n[0], n[1], "var(--ink)", 5) + Circ(cx, cy, 9, { f: "var(--ink)", st: "var(--ink)", sw: 1 });
    const l0 = P(0, r + 30), l5 = P(0.5, r + 22), l1 = P(1, r + 30);
    b += T(l0[0], cy + 22, "0%", { a: "middle", s: 12 }) + T(l5[0], +l5[1] + 2, "50%", { a: "middle", s: 12 }) + T(l1[0], cy + 22, "100%", { a: "middle", s: 12 });
    b += T(cx, cy + 50, "Index memory used: 6.4 GB of the 16 GB set aside", { a: "middle", s: 13 });
    b += T(cx, cy + 70, "At 100% the hash map no longer fits in memory", { a: "middle", s: 12, c: "var(--text-dim)" });
    return svg(460, 262, b);
  }

  function figCrash() {
    const L = [[70, "Client"], [240, "Store (memory)"], [410, "Log (disk)"]];
    const m = [
      { id: "c1", from: 0, to: 1, y: 74, label: "set(k, v)" },
      { id: "c2", from: 1, to: 2, y: 114, label: "append  k,v" },
      { id: "c3", from: 2, to: 1, y: 154, label: "saved at byte 90", d: "5 4" },
    ];
    let extra = R(40, 180, 400, 30, { f: "var(--rose-dim)", st: "var(--rose)", rx: 6 }) + T(240, 200, "power cut here", { a: "middle", c: "var(--rose-ink)" });
    extra += R(150, 224, 180, 34, { f: "none", st: "var(--line-2)", d: "5 4", rx: 6 }) + T(240, 246, "map: k → 90  (never ran)", { a: "middle", s: 12, c: "var(--text-dim)", m: true });
    return seq(480, 270, L, m, { extra });
  }

  B.add("ds-hashidx", [
    { type: "mcq", q: "A new 11-byte record for key <b>a</b> is appended to this log. What does the hash map store for <b>a</b> afterwards?",
      fig: figTape(), o: ["0", "35", "43", "54"], a: 2, hint: "The old records fill 14 + 9 + 12 + 8 bytes. A new record starts where they end.",
      why: "The map holds the byte where the record <i>starts</i>. The file currently ends at 43 (14 + 9 + 12 + 8), so the new record begins there. The old record at 0 stays in the file until compaction, but nothing points to it any more." },
    { type: "pick", q: "S1 and S2 are merged into one segment, keeping the newest value for each key <i>within those two</i>. Compaction does not look at S3. <b>Tap every record that is kept in the merged segment.</b>",
      fig: figSegMatrix(), a: ["S1a", "S1d", "S2b", "S2c", "S2e"],
      why: "Within S1 and S2 only b = 2 and c = 3 are overwritten (by 5 and 6), so they go. Records c = 6 and e = 7 stay even though S3 has newer values, because the merge never reads S3. The newer segment simply wins at read time." },
    { type: "slider", q: "The keys will triple in number over the next year, and each key still needs the same memory. About what percentage of the 16 GB budget will the hash index need?",
      fig: figGauge(), min: 0, max: 200, step: 10, ans: 120, tol: 15, unit: "%", hint: "The gauge reads 40%. Triple it.",
      why: "6.4 GB is 40% of 16 GB, and 40% × 3 = 120%. The map would no longer fit in memory, which is the hash index's limit. Past that point you need a different design, such as sorted segments with a sparse index." },
    { type: "mcq", q: "The power fails after the log append but before the in-memory map is updated. On restart the store rebuilds its map by replaying the log. What happens to this write?",
      fig: figCrash(), o: ["It is found, as replaying the log picks the record up", "It is lost, because the map never learnt that it existed", "It is half-applied, so the store must delete that record", "It is lost unless the client sends the same write again"], a: 0,
      why: "The log is the source of truth and the map is only a shortcut that is rebuilt from it. A complete record that reached the disk comes back during the replay. Appending first and updating the map second is what makes this safe." },
  ]);

  /* ================= ds-sstable ================= */
  function figStack() {
    const layers = [["Memtable (memory)", ["m: deleted", "p = 4"], "violet", [0]], ["SSTable 3 (newest)", ["k = 2", "m = 9"], "blue"], ["SSTable 2", ["m = 7", "q = 1"], "blue"], ["SSTable 1 (oldest)", ["m = 3", "r = 5"], "blue"]];
    let b = T(8, 16, "get(m) looks in the layers from the top down", { s: 12, c: "var(--text-dim)" });
    layers.forEach(([name, chips, col, dead], j) => {
      const y = 28 + j * 62;
      b += R(40, y, 430, 52, { f: `var(--${col}-dim)`, st: `var(--${col})` }) + T(52, y + 31, name, { s: 13 });
      chips.forEach((c, i) => {
        const x = 270 + i * 100, isDead = c.includes("deleted");
        b += R(x, y + 8, 92, 36, { f: isDead ? "var(--rose-dim)" : "var(--panel)", st: isDead ? "var(--rose)" : "var(--line-2)", rx: 6 }) + T(x + 46, y + 31, c, { a: "middle", m: true, s: 12, c: isDead ? "var(--rose-ink)" : "var(--text)" });
      });
    });
    b += arrow(20, 40, 20, 262, "var(--text-dim)", 3);
    return svg(480, 284, b);
  }

  function figMergeTrace() {
    const A = ["a = 1", "c = 3", "e = 5", "g = 7"], Bn = ["c = 9", "d = 4", "g: deleted", "h = 2"], O = [["a", "a = 1"], ["c", "c = 9"], ["d", "d = 4"], ["e", "e = 5"], ["g", "g = 7"], ["h", "h = 2"]];
    let b = T(8, 18, "A and B are the two oldest segments. Nothing older exists.", { s: 12, c: "var(--text-dim)" });
    b += T(60, 44, "A (older)", { a: "middle", s: 12 }) + T(190, 44, "B (newer)", { a: "middle", s: 12 }) + T(390, 44, "Merged output", { a: "middle", s: 12 });
    A.forEach((t, i) => (b += R(8, 54 + i * 40, 104, 34, { f: "var(--panel)", st: "var(--line-2)", rx: 6 }) + T(60, 76 + i * 40, t, { a: "middle", m: true, s: 12 })));
    Bn.forEach((t, i) => {
      const dead = t.includes("deleted");
      b += R(136, 54 + i * 40, 108, 34, { f: dead ? "var(--rose-dim)" : "var(--panel)", st: dead ? "var(--rose)" : "var(--line-2)", rx: 6 }) + T(190, 76 + i * 40, t, { a: "middle", m: true, s: 12, c: dead ? "var(--rose-ink)" : "var(--text)" });
    });
    b += arrow(250, 140, 300, 140, "var(--text-dim)", 3);
    O.forEach(([id, t], i) => (b += PK(id, R(308, 54 + i * 40, 164, 34, { f: "var(--blue-dim)", st: "var(--blue)", rx: 6 }) + T(390, 76 + i * 40, t, { a: "middle", m: true, s: 12 }))));
    return svg(480, 300, b);
  }

  function figRuler() {
    const x0 = 110, cw = 14, X = (ch) => x0 + (ch.charCodeAt(0) - 97) * cw;
    let b = T(8, 18, "Key ranges covered by each file. The query asks for j to n.", { s: 12, c: "var(--text-dim)" });
    b += R(X("j"), 28, X("n") + cw - X("j"), 238, { f: "var(--amber-dim)", st: "var(--amber)", d: "5 4", rx: 4, sw: 1.5 });
    for (let i = 0; i < 26; i++) { const ch = String.fromCharCode(97 + i); b += T(x0 + i * cw + cw / 2, 46, ch, { a: "middle", m: true, s: 11, c: "var(--text-dim)", w: 700 }); }
    const bars = [["mem", "Memtable", "g", "r", "violet"], ["s1", "SSTable 1", "a", "m", "blue"], ["s2", "SSTable 2", "h", "t", "blue"], ["s3", "SSTable 3", "p", "z", "blue"], ["s4", "SSTable 4", "c", "e", "blue"]];
    bars.forEach(([id, name, a, z, col], i) => {
      const y = 64 + i * 40, w = X(z) + cw - X(a);
      b += T(8, y + 21, name, { s: 12 }) + PK(id, R(X(a), y, w, 30, { f: `var(--${col}-dim)`, st: `var(--${col})`, rx: 6 }) + T(X(a) + w / 2, y + 20, `${a}–${z}`, { a: "middle", s: 12, m: true }));
    });
    return svg(480, 278, b);
  }

  function figSteps() {
    const X = (t) => 56 + t * 6.7, Y = (n) => 240 - n * 33;
    const ev = [[0, 0], [5, 1], [10, 2], [15, 3], [20, 4], [25, 5], [30, 1], [35, 2], [40, 3], [45, 4], [50, 1], [55, 2], [60, 2]];
    let b = Ln(56, 240, 462, 240, "var(--text-dim)", 2) + Ln(56, 240, 56, 24, "var(--text-dim)", 2);
    [0, 2, 4, 6].forEach((n) => (b += Ln(56, Y(n), 462, Y(n), "var(--line)", 1.2) + T(48, Y(n) + 4, n, { a: "end", s: 11, c: "var(--text-dim)" })));
    [0, 20, 40, 60].forEach((t) => (b += T(X(t), 258, t, { a: "middle", s: 11, c: "var(--text-dim)" })));
    b += T(462, 276, "minutes", { a: "end", s: 12, c: "var(--text-dim)" }) + T(62, 16, "SSTables on disk", { s: 12, c: "var(--text-dim)" });
    let d = `M${X(0)},${Y(0)}`;
    for (let i = 1; i < ev.length; i++) d += `L${X(ev[i][0])},${Y(ev[i - 1][1])}L${X(ev[i][0])},${Y(ev[i][1])}`;
    b += `<path d="${d}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    [["A", 12, 2], ["B", 28, 5], ["C", 33, 1], ["D", 48, 4], ["E", 58, 2]].forEach(([id, t, n]) => (b += PK(id, Circ(X(t), Y(n) - 16, 13, { f: "var(--panel)", st: "var(--ink)" }) + T(X(t), Y(n) - 11.5, id, { a: "middle", s: 12 }))));
    return svg(480, 284, b);
  }

  B.add("ds-sstable", [
    { type: "mcq", q: "A store holds the layers below. A client deleted <b>m</b> recently. What does <code>get(m)</code> return?",
      fig: figStack(), o: ["Not found: the top layer to mention m says deleted", "9, because it is the newest value that m has on disk", "3, because the oldest segment holds the original value", "An error, because m appears in several layers at once"], a: 0,
      why: "A read stops at the first layer that mentions the key, going from newest to oldest. Here that is the memtable's tombstone, so the answer is not found. The older values (9, 7 and 3) are still on disk until a merge discards them." },
    { type: "pick", q: "A merge of the two oldest segments produced the output below. One output record is wrong. <b>Tap it.</b>",
      fig: figMergeTrace(), a: "g",
      why: "B deleted g, and no older segment exists, so the merge should drop g completely. Keeping g = 7 brings a deleted key back to life. The other five records are right: the newer c = 9 wins and the output stays sorted." },
    { type: "pick", q: "Each segment is sorted, but each covers its own overlapping range of keys. A range query asks for keys j to n. <b>Tap every file the query must read.</b>",
      fig: figRuler(), a: ["mem", "s1", "s2"],
      why: "Any file whose range overlaps j to n may hold such keys, including the memtable. Segments from different flushes overlap, so a range scan has to read from several and merge the results. SSTable 3 (p to z) and SSTable 4 (c to e) cannot hold keys between j and n." },
    { type: "pick", q: "A read for a key that does not exist must check the memtable and every SSTable on disk. The chart shows the number of SSTables over time as flushes add files and merges remove them. <b>Tap the moment such a read is slowest.</b>",
      fig: figSteps(), a: "B",
      why: "Each flush adds a file and each merge collapses them. Just before the first merge, at B, there are five files, so a missing-key read has the most places to look. After a merge, at C, only one is left. Merging keeps reads cheap." },
  ]);
})();

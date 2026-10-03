/* ===== bank-x-ds-2.js ===== */
/* Revision bank, third set of varied, visual questions (ds-2).
   Lecture 2 (models, schema, graph, NoSQL) and Lecture 3 (log, hash index, SSTable).
   Every module gets four new questions, each with a different diagram kind from the earlier sets:
   tree, timeline, small multiples, flowchart | presence grid, sequence diagram, grouped bars, table trace |
   matrix, rings, Venn, code | heat grid, replica map, line plot, key diagram | sequence, scatter, snapshot panels, code |
   byte tape, segment matrix, gauge, crash sequence | layer stack, merge trace, key ruler, step chart.
   Concepts only, no SQL, no calculator. Numbers verified with node. */
(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});

  const B = NIC.bank;

  /* ---------- tiny SVG toolkit ---------- */
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = (w, h, body) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto">${body}</svg>`;
  const T = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "start"}" style="font:${o.w || 800} ${(o.s || 13) + 1}px ${o.m ? "var(--mono)" : "var(--sans)"}" fill="${o.c || "var(--text)"}">${esc(s)}</text>`;
  const R = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.rx == null ? 8 : o.rx}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const Ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2.5, d = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${d ? ` stroke-dasharray="${d}"` : ""}/>`;
  const Circ = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}" stroke="${o.st || "var(--line-2)"}" stroke-width="${o.sw || 2.5}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const arrow = (x1, y1, x2, y2, c = "var(--text-dim)", w = 2.5, d = "") => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      h = 9,
      bx = x2 - Math.cos(a) * h,
      by = y2 - Math.sin(a) * h,
      s = Math.sin(a) * 5,
      k = Math.cos(a) * 5;
    return (
      Ln(x1, y1, bx, by, c, w, d) +
      `<polygon points="${x2},${y2} ${bx + s},${by - k} ${bx - s},${by + k}" fill="${c}"/>`
    );
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
      const x1 = lifelines[m.from][0],
        x2 = lifelines[m.to][0],
        dir = x2 > x1 ? 1 : -1,
        col = m.c || "var(--text-dim)";
      const row = pick ? R(10, m.y - 22, w - 20, 36, { rx: 8, f: "var(--panel)", st: "var(--line)", sw: 2 }) : "";
      let inner =
        row + T((x1 + x2) / 2, m.y - 6, m.label, { a: "middle", s: 13, c: m.soft ? "var(--text-dim)" : "var(--text)" });
      inner += arrow(x1 + dir * 4, m.y + 6, x2 - dir * 4, m.y + 6, col, 2.5, m.d || "");
      b += pick ? PK(m.id, inner) : inner;
    });
    return svg(w, h, b + extra);
  }

  /* ================= ds-models ================= */
  function figTree() {
    const depts = [
      ["Design", 90],
      ["Games", 250],
      ["Web", 410],
    ];
    const ppl = [
      ["Ana", 44],
      ["Kai", 140],
      ["Raj", 250],
      ["Mia", 350],
      ["Zed", 440],
    ];
    let b = T(8, 18, "Each team lists the people who belong to it", { s: 12, c: "var(--text-dim)" });
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ].forEach(([d, p]) => (b += Ln(depts[d][1], 76, ppl[p][1], 168, "var(--line-2)", 3)));
    depts.forEach(
      ([n, x]) =>
        (b += R(x - 48, 40, 96, 36, { f: "var(--violet-dim)", st: "var(--violet)" }) + T(x, 63, n, { a: "middle" })),
    );
    ppl.forEach(
      ([n, x]) =>
        (b += PK(
          n.toLowerCase(),
          R(x - 38, 168, 76, 36, { f: "var(--blue-dim)", st: "var(--blue)" }) + T(x, 191, n, { a: "middle" }),
        )),
    );
    return svg(480, 222, b);
  }

  function figPrice() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      x0 = 30,
      dw = 60;
    let b = "";
    days.forEach((d, i) => {
      b += T(x0 + i * dw + dw / 2, 16, d, { a: "middle", s: 12, c: "var(--text-dim)" });
      b += Ln(x0 + i * dw, 24, x0 + i * dw, 186, "var(--line)", 1.5);
    });
    b += Ln(x0 + 7 * dw, 24, x0 + 7 * dw, 186, "var(--line)", 1.5);
    b += T(x0, 44, "Price of dried figs", { s: 12, c: "var(--text-dim)" });
    b +=
      R(x0, 52, 3 * dw, 30, { f: "var(--amber-dim)", st: "var(--amber)" }) +
      T(x0 + 1.5 * dw, 72, "4 per kg", { a: "middle" });
    b +=
      R(x0 + 3 * dw, 52, 4 * dw, 30, { f: "var(--teal-dim)", st: "var(--teal)" }) +
      T(x0 + 5 * dw, 72, "5 per kg", { a: "middle" });
    b += T(x0, 112, "Orders placed (each stores a copy)", { s: 12, c: "var(--text-dim)" });
    [
      [1, "Order #1", "figs, 4 per kg"],
      [4, "Order #2", "figs, 5 per kg"],
    ].forEach(([d, t, c]) => {
      const cx = x0 + d * dw + dw / 2;
      b +=
        R(cx - 62, 122, 124, 52, { f: "var(--panel)", st: "var(--blue)" }) +
        T(cx, 143, t, { a: "middle" }) +
        T(cx, 162, c, { a: "middle", s: 12, c: "var(--text-dim)" });
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
      const x = 10 + i * 152,
        base = 196;
      b += R(x, 26, 140, 176, { f: "var(--panel-2)", st: "var(--line)" });
      b += T(x + 70, 46, title, { a: "middle", s: 12 });
      blocks.forEach((t, k) => {
        b +=
          R(x + 22, base - 30 - k * 34, 96, 28, { f: `var(--${col}-dim)`, st: `var(--${col})`, rx: 6 }) +
          T(x + 70, base - 11 - k * 34, t, { a: "middle", s: 12 });
      });
    });
    return svg(460, 210, b);
  }

  function figFlow() {
    const box = (x, y, w, h, lines, o = {}) =>
      R(x, y, w, h, { f: o.f || "var(--panel)", st: o.st || "var(--line-2)" }) +
      lines
        .map((t, i) => T(x + w / 2, y + h / 2 + 5 - (lines.length - 1) * 8 + i * 16, t, { a: "middle", s: 12 }))
        .join("");
    let b = box(130, 8, 220, 46, ["Do many records", "share this item?"], {
      f: "var(--violet-dim)",
      st: "var(--violet)",
    });
    b += arrow(160, 54, 85, 118, "var(--text-dim)", 2.5) + T(95, 84, "yes", { s: 12, c: "var(--text-dim)" });
    b += arrow(320, 54, 345, 98, "var(--text-dim)", 2.5) + T(345, 78, "no", { s: 12, c: "var(--text-dim)" });
    b += PK(
      "ref",
      box(10, 120, 150, 58, ["Its own record,", "parents point to it"], { f: "var(--amber-dim)", st: "var(--amber)" }),
    );
    b += box(235, 100, 225, 46, ["Is it read together with", "its parent almost every time?"], {
      f: "var(--violet-dim)",
      st: "var(--violet)",
    });
    b += arrow(290, 146, 245, 208, "var(--text-dim)", 2.5) + T(250, 176, "yes", { s: 12, c: "var(--text-dim)" });
    b += arrow(405, 146, 405, 208, "var(--text-dim)", 2.5) + T(412, 180, "no", { s: 12, c: "var(--text-dim)" });
    b += PK(
      "embed",
      box(165, 210, 150, 58, ["Embed it inside", "the parent document"], { f: "var(--teal-dim)", st: "var(--teal)" }),
    );
    b += PK(
      "link",
      box(335, 210, 130, 58, ["Its own record,", "linked by parent ID"], { f: "var(--blue-dim)", st: "var(--blue)" }),
    );
    return svg(480, 276, b);
  }

  B.add("ds-models", [
    {
      type: "pick",
      q: "A company stores each team's people as a list inside the team's own record. That nests neatly while every person belongs to one team. <b>Tap the person this nesting cannot store just once.</b>",
      fig: figTree(),
      a: "kai",
      why: "Kai sits under two teams, a many-to-many link. Nested inside both Design and Games, Kai's details would be copied twice and could drift apart. Everyone else has one parent, which is the one-to-many shape that documents nest well.",
    },
    {
      type: "multi",
      q: "A dried-fruit shop stores each order as a document that copies the product's name and price at the time of sale. Using the timeline, select all statements that are true.",
      fig: figPrice(),
      o: [
        "Order #1 still says 4, which is what that customer paid",
        "Copying the price into orders is a mistake: they should show the live price",
        "A report of Tuesday's takings stays right after the price rise",
        "If the product is renamed later, the copy in order #1 will not follow",
        "Order #2 would switch back to 4 if the price were cut again on Saturday",
      ],
      a: [0, 2, 3],
      why: "Orders are history, so a copy frozen at the time of sale is the point. The cost is that later edits do not reach the copies. Orders do not read the live price, so a Saturday cut changes nothing already stored.",
    },
    {
      type: "slider",
      q: "A page shows 25 profile cards, and each card is built on its own. Using the three panels, about how many lookups does the normalised-tables design need for the whole page?",
      fig: figLookups(),
      min: 0,
      max: 250,
      step: 10,
      ans: 100,
      tol: 20,
      unit: " lookups",
      hint: "Count the blocks in the first panel, then multiply by 25.",
      why: "Four tables means four lookups for each profile: 4 × 25 = 100. The document design keeps a profile in one place, so it needs 25. Locality is the difference.",
    },
    {
      type: "pick",
      q: "A user's 30 saved search filters are shown only on a settings page, and the user document is large. Follow the flowchart for the filters. <b>Tap the box where the path ends.</b>",
      fig: figFlow(),
      a: "link",
      why: "Only this user has the filters, so they are not shared. They are rarely read with the user, so embedding would load them every time for nothing. Keeping them as their own linked record avoids that waste.",
    },
  ]);

  /* ================= ds-schema ================= */
  function figPresence() {
    const cols = ["id", "name", "email", "age", "city"],
      rows = [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 0, 0],
        [1, 1, 0, 1, 0],
        [1, 1, 1, 0, 1],
        [1, 1, 0, 0, 0],
        [1, 1, 1, 1, 0],
      ];
    let b = T(8, 18, "Which fields each of six sample documents has", { s: 12, c: "var(--text-dim)" });
    cols.forEach((c, i) => (b += T(96 + i * 72, 44, c, { a: "middle", m: true })));
    rows.forEach((r, j) => {
      b += T(10, 74 + j * 34, `doc ${j + 1}`, { s: 12, c: "var(--text-dim)" });
      r.forEach(
        (on, i) =>
          (b += on
            ? R(64 + i * 72, 54 + j * 34, 64, 28, { f: "var(--blue-dim)", st: "var(--blue)", rx: 6 }) +
              Circ(96 + i * 72, 68 + j * 34, 4.5, { f: "var(--blue)", st: "var(--blue)", sw: 1 })
            : R(64 + i * 72, 54 + j * 34, 64, 28, { f: "none", st: "var(--line-2)", d: "4 4", sw: 1.5, rx: 6 })),
      );
    });
    return svg(440, 266, b);
  }

  function figRolling() {
    const L = [
      [72, "App v1"],
      [240, "Database"],
      [408, "App v2"],
    ];
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
    const base = 214,
      k = 4; // 4 px per KB
    let b = "";
    [0, 10, 20, 30, 40].forEach((v) => {
      b +=
        Ln(70, base - v * k, 450, base - v * k, "var(--line)", 1.5) +
        T(62, base - v * k + 4, v, { a: "end", s: 11, c: "var(--text-dim)" });
    });
    b += T(8, 18, "KB read for one user", { s: 12, c: "var(--text-dim)" });
    b +=
      R(190, 6, 14, 14, { f: "var(--amber-dim)", st: "var(--amber)", rx: 3 }) + T(210, 18, "Document store", { s: 12 });
    b +=
      R(320, 6, 14, 14, { f: "var(--blue-dim)", st: "var(--blue)", rx: 3 }) +
      T(340, 18, "Normalised tables", { s: 12 });
    [
      [150, "Show the whole profile", 40, 40],
      [350, "Show just the name", 40, 1],
    ].forEach(([cx, t, d, n]) => {
      b +=
        R(cx - 48, base - d * k, 40, d * k, { f: "var(--amber-dim)", st: "var(--amber)", rx: 4 }) +
        T(cx - 28, base - d * k - 6, `${d} KB`, { a: "middle", s: 12 });
      b +=
        R(cx + 8, base - n * k, 40, n * k, { f: "var(--blue-dim)", st: "var(--blue)", rx: 2 }) +
        T(cx + 28, base - n * k - 6, `${n} KB`, { a: "middle", s: 12 });
      b += T(cx, base + 22, t, { a: "middle", s: 13 });
    });
    return svg(460, 240, b);
  }

  function figBackfill() {
    const rows = [
      ["1", "Ada Byte", "Ada", "Byte", ""],
      ["2", "Cy Dee", "Cy", "Dee", ""],
      ["3", "Eli Moss", "Eli", "Moss", ""],
      ["4", "Flo Park", null, null, ""],
      ["5", "Gus Lamb", null, null, ""],
      ["6", "Ivy Cole", "Ivy", "Cole", "written by v2"],
      ["7", "Jon Reed", null, null, "written by v1"],
    ];
    let b = T(8, 16, "Backfill copies name into first and last, in id order. It has done ids 1 to 3.", {
      s: 12,
      c: "var(--text-dim)",
    });
    [
      ["id", 18],
      ["name", 62],
      ["first", 196],
      ["last", 288],
      ["", 380],
    ].forEach(([t, x]) => (b += T(x, 44, t, { s: 12, m: true, c: "var(--text-dim)" })));
    rows.forEach(([id, nm, f, l, note], j) => {
      const y = 54 + j * 36;
      b += PK(
        `r${id}`,
        R(8, y, 464, 30, { f: "var(--panel)", st: "var(--line)", sw: 1.5, rx: 6 }) +
          T(18, y + 20, id, { m: true }) +
          T(62, y + 20, nm, { m: true, s: 12 }) +
          (f
            ? T(196, y + 20, f, { m: true, s: 12 }) + T(288, y + 20, l, { m: true, s: 12 })
            : T(196, y + 20, "NULL", { m: true, s: 12, c: "var(--text-faint)", w: 700 }) +
              T(288, y + 20, "NULL", { m: true, s: 12, c: "var(--text-faint)", w: 700 })) +
          T(380, y + 20, note, { s: 11, c: "var(--text-dim)" }),
      );
    });
    return svg(480, 314, b);
  }

  B.add("ds-schema", [
    {
      type: "mcq",
      q: "These six documents come from a schema-on-read collection. Every one has <code>name</code>. May the reading code skip its check for a missing <code>name</code> from now on?",
      fig: figPresence(),
      o: [
        "No: a later write is free to leave it out",
        "Yes: six out of six documents is enough to rely on",
        "Yes: the database validates each document on save",
        "Yes: a name field is always kept in a separate place",
      ],
      a: 0,
      why: "The grid shows what happens to exist today, not a rule. Without a schema, nothing stops tomorrow's document from missing a field, so the reader has to cope with that case itself.",
    },
    {
      type: "pick",
      q: "During a rolling update, old servers (v1) and new servers (v2) run together. v1 only understands <code>name</code>. v2 writes <code>first</code> and <code>last</code> but can still read old shapes. <b>Tap the message where something breaks.</b>",
      fig: figRolling(),
      a: "m4",
      why: "In message 4 the old v1 server reads a document that v2 wrote: no name field. With schema-on-read, every reader must cope with every shape, including the old code still running during the roll-out.",
    },
    {
      type: "slider",
      q: "The user list needs just the name of 50 users. Each profile document is 40 KB. Using the chart, about how many MB does the document store load for the list?",
      fig: figBars(),
      min: 0,
      max: 6,
      step: 0.5,
      ans: 2,
      tol: 0.5,
      unit: " MB",
      hint: "50 × 40 KB = 2,000 KB, and 1,000 KB is 1 MB.",
      why: "A document is loaded whole, so every user costs 40 KB even for one short field: 50 × 40 KB = 2,000 KB, about 2 MB. Tables would read around 50 KB. Locality is wasteful when you need a sliver.",
    },
    {
      type: "pick",
      q: "A relational table gets new <code>first</code> and <code>last</code> columns while the backfill job runs and both app versions keep writing. A new feature reads <code>first</code> straight from the table. <b>Tap every row that would give it NULL.</b>",
      fig: figBackfill(),
      a: ["r4", "r5", "r7"],
      why: "Rows 4 and 5 are still waiting for the backfill. Row 7 was written by the old app after the change, so nobody filled its new columns. Row 6 came from v2, which fills them. A migration is not finished until the old writers are gone too.",
    },
  ]);
  Object.assign(partScope, { Circ, Ln, PK, R, T, arrow, seq, svg });
})();

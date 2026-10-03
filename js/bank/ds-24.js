(function () {
  const partScope = (NIC.shared.bankDs = NIC.shared.bankDs || {});
  const { pk, rc, svg, table, tx } = partScope;
  const B = NIC.bank;

  /* =====================================================================
     1.7  ds-maintain
     ===================================================================== */

  // two incident timelines
  const mtBars = (() => {
    const S = [
        ["finding it", "var(--amber)"],
        ["working out why", "var(--blue)"],
        ["fixing it", "var(--teal)"],
      ],
      k = 3.7;
    const I = [
      ["Incident last year", [40, 30, 20]],
      ["Incident this year", [2, 25, 3]],
    ];
    let s = "";
    I.forEach(([t, v], r) => {
      const y = 28 + r * 62;
      s += tx(12, y - 8, t, { a: "start", s: 12 });
      let x = 12;
      v.forEach((m, i) => {
        s +=
          rc(x, y, m * k, 34, { f: S[i][1], fo: 0.55, s: S[i][1], sw: 2, rx: 3 }) +
          (m >= 8 ? tx(x + (m * k) / 2, y + 22, m + " min", { s: 11.5 }) : "");
        x += m * k;
      });
      s += tx(x + 8, y + 22, `${v.reduce((a, b) => a + b)} min`, { a: "start", s: 13 });
    });
    S.forEach(([n, c], i) => {
      const lx = 12 + i * 142;
      s += rc(lx, 148, 16, 16, { f: c, fo: 0.55, s: c, sw: 2, rx: 4 }) + tx(lx + 22, 161, n, { a: "start", s: 12 });
    });
    s += tx(12, 185, "2 min and 3 min are too thin to label inside the bars", {
      a: "start",
      s: 10.5,
      c: "var(--text-dim)",
    });
    return svg(440, 194, s);
  })();

  // dependency matrix: a filled cell means the ROW module calls the COLUMN module
  const mtMatrix = (() => {
    const M = ["Web", "Orders", "Users", "Billing", "DB"],
      D = {
        Web: ["Orders", "Users", "Billing"],
        Orders: ["Users", "DB"],
        Users: ["DB"],
        Billing: ["Orders", "DB"],
        DB: [],
      };
    const x0 = 84,
      y0 = 54,
      c = 62,
      r = 34;
    let s = tx(x0 + 2.5 * c, 14, "the module that is CALLED", { c: "var(--text-dim)", s: 11.5 });
    M.forEach(
      (m, j) =>
        (s += pk(
          m.toLowerCase(),
          rc(x0 + j * c + 3, 22, c - 6, 26, { sw: 2.2, rx: 8 }) + tx(x0 + j * c + c / 2, 40, m, { s: 12 }),
        )),
    );
    M.forEach((m, i) => {
      s += tx(x0 - 10, y0 + i * r + r / 2 + 4, m, { a: "end" });
      M.forEach((n, j) => {
        const on = D[m].includes(n);
        s += rc(x0 + j * c + 3, y0 + i * r + 3, c - 6, r - 6, {
          sw: 2,
          s: i === j ? "var(--line-2)" : "var(--line)",
          rx: 5,
          f: i === j ? "var(--bg-2)" : "var(--panel)",
        });
        if (on)
          s +=
            rc(x0 + j * c + 3, y0 + i * r + 3, c - 6, r - 6, {
              f: "var(--amber)",
              fo: 0.55,
              s: "var(--amber)",
              sw: 2,
              rx: 5,
            }) + tx(x0 + j * c + c / 2, y0 + i * r + r / 2 + 5, "●", { s: 12 });
      });
    });
    s += tx(x0 - 10, 42, "caller ↓", { a: "end", s: 11.5, c: "var(--text-dim)" });
    return svg(440, 232, s);
  })();

  const mtTable = table(
    ["Server", "What is special about it"],
    [
      ["web-01", "Built from the standard image, restarts itself after a crash"],
      ["web-02", "Holds the only copy of the licence file, in one person's home folder"],
      ["batch-1", "The only box that can send invoices, because its IP address is whitelisted"],
      ["web-03", "Pulls its settings from the shared store when it starts"],
      ["db-2", "Settings tweaked by hand over SSH, with no copy kept anywhere"],
    ],
  );

  B.add("ds-maintain", [
    {
      type: "mcq",
      q: "The bars show how two incidents' time was spent, before and after the team improved how it runs the system. Which improvement saved the most time?",
      fig: mtBars,
      o: [
        "Monitoring that alerts the team at once",
        "Scripts that make rollbacks repeatable",
        "Simpler code that is easier to follow",
        "Hand-written notes for each machine",
      ],
      a: 0,
      hint: "Compare the saving in each colour: how many minutes did each phase shrink by?",
      why: "Finding the problem fell from 40 minutes to 2, a saving of 38. Fixing it fell from 20 to 3 (17 saved) and working out why only from 30 to 25. Operability starts with visibility: you cannot fix quickly what you have not noticed.",
    },
    {
      type: "pick",
      q: "A filled cell means that the row's module calls the column's module. One module's interface is about to change, and every module that depends on it, directly or through others, must be retested. Tap the module whose change would affect the most others.",
      fig: mtMatrix,
      a: "db",
      why: "Orders, Users and Billing call DB directly, and Web calls all three, so all four other modules are affected. Changing Users reaches Web, Orders and Billing, but not DB. A module everyone leans on is the most expensive to change. Putting a clean abstraction in front of it is how you protect evolvability.",
    },
    {
      type: "multi",
      q: "Operators want any machine to be replaceable by a fresh one in minutes, at 3 a.m. Which rows of the table would make that hard? Select all.",
      fig: mtTable,
      o: ["web-01", "web-02", "batch-1", "web-03", "db-2"],
      a: [1, 2, 4],
      why: "web-02's licence, batch-1's whitelisted address and db-2's hand-made settings each live in one machine only, so it cannot be swapped without losing something. web-01 and web-03 can be rebuilt from an image and a shared store. Operability means no dependency on individual machines.",
    },
  ]);
})();

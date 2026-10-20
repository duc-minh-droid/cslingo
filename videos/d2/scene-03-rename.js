/* Lecture 2 · scene 3 (MANY-TO-ONE): a company renames, who has to change? (lesson 2.1 "A company changes its name").
   Many profiles share one company. Relational storage keeps the name once in a companies table and every profile points to that
   row, so the rename is ONE row. A document store copies the name into every profile document, so the rename is 400 documents
   (one orange dot each) and a copy the rewrite misses is stale. Every number comes from D2.RENAME (asserted when the page loads).
   Story (local seconds): 0.25 the two tags, 0.3 the companies table, 0.5-0.9 four profiles (of 400) point at its one row, 1.0-2.1
   the 400 dots, 2.4 the name ring, 3.0 the name changes (the arrows turn green), 3.4 "rows changed 1", 4.3 "documents to rewrite
   400" and the grid pulses, 4.8-8.0 the rewrite wave (dot i turns green at 4.8 + 3.2 i / 400, the stale copy stays orange), 8.3 the
   red ring, 8.5 the "stale: Acme" tag, 9-12.5 hold. */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- the data (asserted against the storyboard) ----------
  const R = D2.RENAME;
  D2.same("rename scene: 25 x 16 dots are the 400 profiles", [R.cols * R.rows, R.profiles], [400, 400]);
  D2.same("rename scene: the stale copy sits at row 8, column 13", D2.rowCol(R.stale), { r: 8, c: 13 });
  D2.same("rename scene: one row against 400 documents", [R.relational.rows, R.document.docs], [1, 400]);
  D2.same(
    "rename scene: Acme becomes Apex, company 7",
    [R.company.id, R.company.from, R.company.to],
    [7, "Acme", "Apex"],
  );
  const N = R.profiles;

  // ---------- layout (stage px, 12 px margin) ----------
  const TABLE = { x: 12, y: 80, w: 270 }; // one row: 110 px high, its lip ends at y 196
  const GRID = { x: 326, y: 80 }; // 25 x 16 dots of 18 px with 6 px gaps: 594 x 394, ends at x 920 (room for the wave's pop)
  const PEOPLE = { cy: 330, r: 28, n: 4 };
  const personX = (i) => 46 + 66 * i;
  const arrowEnd = (i) => TABLE.x + TABLE.w / 2 + (i - 1.5) * 22; // the four arrows reach the table's lower edge side by side

  // ---------- timeline ----------
  const T = {
    tags: 0.25, // both tags pop
    table: 0.3, // the companies table
    people: 0.5, // the four profiles pop, 0.1 s apart
    arrows: 0.7, // ... and their arrows draw on to the one row
    count: 1.0, // "400 profiles"
    dots: 1.0, // the dot grid pops row by row (0.05 s a row)
    look: 2.4, // a ring on the name: this is what changes
    rename: 3.0, // Acme becomes Apex; the arrows turn green
    rows: 3.4, // "rows changed 1"
    docs: 4.3, // "documents to rewrite 400"; the dots pulse once
    wave0: 4.8, // the first dot is rewritten ...
    wave: 3.2, // ... and the last one 3.2 s later
    ring: 8.3, // the red ring round the stale copy
    tag: 8.5, // the "stale: Acme" tag
    breathe: 9.2, // the ring starts a slow pulse
  };
  const hit = (i) => T.wave0 + (T.wave * i) / N; // the rewrite reaches dot i

  /* D2.dots remembers each dot by its scale and opacity rounded to 2 decimals: hand it values that are already rounded, so a dot
     never keeps the look of a slightly different earlier frame (seeking away and back must give the identical picture) */
  const r2 = (x) => Math.round(x * 100) / 100;
  const dot = (st) => ({ ...st, s: r2(st.s), o: r2(st.o) });

  /** wipe an arrow made by L5.arrow from its head back to its tail (k 0..1): the colour runs from the row to the profile */
  const wipeBack = (g, k) => {
    const kk = clamp(k);
    g.querySelectorAll("[data-draw]").forEach((p) => {
      [p.style.strokeDasharray, p.style.strokeDashoffset] = ["1 1", String(kk - 1)];
      p.style.visibility = kk <= 0.002 ? "hidden" : "";
    });
    g.querySelectorAll("[data-head]").forEach((p) => V.show(p, ramp(kk, 0, 0.15, E.lin)));
  };

  function build(stage) {
    // ---------- the two stores ----------
    const tagRel = D2.tag(stage, { x: TABLE.x, y: 12, text: "relational: one row", tone: "grey" });
    const tagDoc = D2.tag(stage, { x: GRID.x, y: 12, text: "document: a copy per profile", tone: "grey" });
    const table = D2.table(stage, {
      ...TABLE,
      name: "companies",
      rows: [
        [
          { text: String(R.company.id), tone: "orange" },
          { text: R.company.from, tone: "orange" },
        ],
      ],
      widths: [60],
    });

    // four of the 400 profiles, each pointing at the company's one row (purple = a link between records)
    const layer = L5.svg(stage);
    const lines = Array.from({ length: PEOPLE.n }, (_, i) => {
      const [x1, y1, x2, y2] = [personX(i), PEOPLE.cy - PEOPLE.r - 6, arrowEnd(i), TABLE.y + 110 + 14];
      const opt = { w: 5, head: 16 };
      return [
        layer.appendChild(L5.arrow(x1, y1, x2, y2, "purple", 1, opt)),
        layer.appendChild(L5.arrow(x1, y1, x2, y2, "green", 1, opt)),
      ];
    });
    const people = Array.from({ length: PEOPLE.n }, (_, i) =>
      layer.appendChild(
        V.s(
          "g",
          {},
          V.s("circle", {
            cx: personX(i),
            cy: PEOPLE.cy,
            r: PEOPLE.r,
            "stroke-width": 3,
            style: { fill: "var(--blue-dim)", stroke: "var(--blue-edge)" },
          }),
          D2.icon.person(personX(i), PEOPLE.cy, 40, "blue"),
        ),
      ),
    );
    const tagMany = D2.tag(stage, { x: TABLE.x, y: 386, text: `${N} profiles`, tone: "blue" });

    // the 400 copies of the name, one dot per profile document (orange = the old name)
    const grid = D2.dots(stage, { ...GRID, cols: R.cols, rows: R.rows, size: 18, gap: 6 });
    const stale = grid.mid(R.stale);
    const halo = V.h("div", {
      class: "c-red",
      style: {
        ...D2.u.abs(stale.x - 23, stale.y - 23, 46, 46),
        boxSizing: "border-box",
        border: "5px solid var(--c)",
        borderRadius: "13px",
      },
    });
    stage.append(halo);
    const tagStale = D2.tag(stage, {
      x: stale.x + 32,
      y: stale.y - 29,
      text: `stale: ${R.company.from}`,
      tone: "red",
      solid: true,
    });

    const statRows = D2.stat(stage, { x: 12, y: 520, w: 290, h: 80, label: "rows changed", tone: "green" });
    const statDocs = D2.stat(stage, {
      x: GRID.x,
      y: 520,
      w: 594,
      h: 80,
      label: "documents to rewrite",
      tone: "orange",
    });

    return (t) => {
      const k = (a, d = 0.4) => ramp(t, a, a + d, E.lin);
      const renamed = t >= T.rename;

      // ---- relational: the name is stored once ----
      tagRel.set({ k: k(T.tags) });
      tagDoc.set({ k: k(T.tags) });
      table.set({
        k: k(T.table, 0.45),
        s: 1 + 0.05 * flash(t, T.rename, T.rename + 0.4),
        hot: t >= T.look ? 0 : -1,
        hotTone: renamed ? "green" : "orange",
        hotK: renamed ? 0.4 + 0.6 * k(T.rename, 0.25) : k(T.look, 0.3),
        cells: renamed ? { "0,1": { text: R.company.to, tone: "green", solid: true } } : {},
      });
      people.forEach((g, i) => V.place(g, D2.pop(k(T.people + 0.1 * i, 0.35))));
      lines.forEach(([plain, ok], i) => {
        L5.drawOn(plain, ramp(t, T.arrows + 0.1 * i, T.arrows + 0.1 * i + 0.3, E.out));
        // the link turns green from the row down: every profile that points at it now sees the new name
        const g = ramp(t, T.rename + 0.1 + 0.1 * i, T.rename + 0.1 + 0.1 * i + 0.4, E.inOut);
        wipeBack(ok, g);
        V.show(plain, g >= 1 ? 0 : 1);
      });
      tagMany.set({ k: k(T.count) });

      // ---- document: 400 copies, rewritten one after another ----
      const pulse = 1 + 0.14 * flash(t, T.docs, T.wave0);
      grid.set((i) => {
        const { r, c } = D2.rowCol(i, R.cols);
        const born = ramp(t, T.dots + 0.05 * r + 0.006 * c, T.dots + 0.05 * r + 0.006 * c + 0.25, E.lin);
        if (born <= 0) return dot({ s: 1, o: 0 });
        const p = D2.pop(born);
        if (i === R.stale) {
          const on = t >= T.ring;
          const grow = 1 + 0.2 * E.out(ramp(t, T.ring, T.ring + 0.3, E.lin)) + 0.3 * flash(t, T.ring, T.ring + 0.4);
          return dot({ tone: "orange", solid: on, s: p.s * pulse * grow, o: p.o });
        }
        const at = hit(i);
        if (t >= at) return dot({ tone: "green", solid: true, s: p.s * (1 + 0.3 * flash(t, at, at + 0.25)), o: p.o });
        return dot({ tone: "orange", s: p.s * pulse, o: p.o });
      });

      // ---- the miss ----
      const h = k(T.ring, 0.35);
      const breathe = (1 - Math.cos((2 * Math.PI * clamp(t - T.breathe, 0, 99)) / 1.4)) / 2; // a slow pulse draws the eye to the miss
      V.place(halo, { s: 1 + (1 - E.out(h)) + 0.08 * breathe * h, o: Math.min(1, h * 4) });
      tagStale.set({ k: k(T.tag, 0.35) });

      // ---- counters ----
      statRows.set({
        text: String(R.relational.rows),
        k: k(T.rows),
      });
      statDocs.set({
        text: String(R.document.docs),
        k: k(T.docs),
      });
    };
  }

  V.scene({
    kicker: "MANY-TO-ONE",
    title: ["A company renames,", "who has to change?"],
    dur: 12.5,
    caps: [
      [0.5, 2.8, "One company, many profiles."],
      [3.1, 4.5, "Tables: change one row."],
      [4.7, 7.6, "Documents: rewrite all 400 copies."],
      [8.7, 11.9, "Miss one and that profile is stale."],
    ],
    build,
  });
})();

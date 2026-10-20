/* Lecture 2 · scene 2 (RELATIONAL OR DOCUMENT): one profile page, two ways to store it (lesson 2.1 "Load one profile page", chef #251).
   Relational storage scatters the profile over six tables that all carry the same key (251): the page asks each table in turn
   (six lookups) and the key glues the pieces together (a join). A document keeps the same profile in one place: one read.
   The counts come from D2.PROFILE (asserted when the page loads).
   Story (local seconds): 0.15 the page, 0.25 the six tables, 2.6-5.6 six lookups, one every 0.6 s (a blue token runs from the page
   through the gaps between the tables to a table's door, the table's rows ring, the page slot fills, the counter counts), 5.9 the key
   rows ring purple, the purple bridges draw on and the tag defines the join, 7.7 tables and page empty, 8.0 the document, 8.7 one
   read, 9.2 document and page fill at once, 10 hold. */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- the data (asserted against the storyboard) ----------
  const P = D2.PROFILE;
  const N = P.fields.length;
  D2.same("profile scene: six tables", N, 6);
  D2.same(
    "profile scene: nine rows over the six tables",
    P.fields.reduce((a, f) => a + f.n, 0),
    9,
  );
  D2.same("profile scene: lookups relational / document", [P.relational.lookups, P.document.lookups], [N, 1]);
  D2.same("profile scene: the key", P.id, 251);
  const KEY = String(P.id);

  // ---------- layout (stage px) ----------
  const PAGE = { x: 12, y: 80, w: 210, h: 380 }; // 12 px stage margin on the left
  const TAB = { x0: 256, dx: 228, w: 196, y: [80, 224] }; // table i: column i % 3, row floor(i / 3); the gaps are 32 px wide; a ring stays inside x 924
  const tabPos = (i) => ({ x: TAB.x0 + (i % 3) * TAB.dx, y: TAB.y[Math.floor(i / 3)] });
  const DOC = { x: 430, y: 80, w: 420 }; // under the two counters, with room for the one-read arrow
  const LANE_X = [0, 1, 2].map((c) => TAB.x0 + c * TAB.dx - 16); // the vertical gaps: left of column c
  LANE_X[0] = (PAGE.x + PAGE.w + TAB.x0) / 2;
  const LANE_Y = (TAB.y[0] + 110 + TAB.y[1]) / 2 - 3; // the gap between the two rows (minus the tables' 6 px lips)

  // ---------- timeline ----------
  const T = {
    page: 0.15, // the profile page pops
    tables: 0.25, // the six tables pop, 0.07 s apart
    stat: 1.3, // the counter appears
    look: 2.6, // the first lookup reaches its table
    per: 0.6, // ... and one more every 0.6 s
    glue: 5.9, // the key rows ring purple, the bridges draw on
    clear: 7.7, // tables and tag fade, the page empties
    doc: 8.0, // the document pops
    read: 8.7, // the one read leaves the page
    fill: 9.2, // document and page fill at once
    one: 9.4, // the green counter pops
    tick: 10.0, // the document is complete
    cmp: 10.8, // the two counters are compared
  };
  const hit = (i) => T.look + i * T.per; // lookup i reaches its table

  /** the bridges between the six tables, as pairs of table indices: the key chips are joined in a ladder (drawn under the tables) */
  const BRIDGES = [
    [0, 2],
    [3, 5],
    [0, 3],
    [1, 4],
    [2, 5],
  ];

  /** a polyline with a point at arc length s: [{x, y}, ...] -> {len, at(f)} */
  function polyline(pts) {
    const segs = pts.slice(1).map((b, i) => ({ a: pts[i], b, len: Math.hypot(b.x - pts[i].x, b.y - pts[i].y) }));
    const len = segs.reduce((s, g) => s + g.len, 0);
    return {
      len,
      at(s) {
        let rest = clamp(s, 0, len);
        for (const g of segs) {
          if (rest <= g.len) return D2.lerp2(g.a, g.b, g.len ? rest / g.len : 0);
          rest -= g.len;
        }
        return pts[pts.length - 1];
      },
    };
  }
  const smooth = (x) => x * x * (3 - 2 * x);

  function build(stage) {
    const low = L5.svg(stage); // under the tables, so only the gaps between them show the bridges
    const tagPage = D2.tag(stage, { x: PAGE.x, y: 12, text: "profile page", tone: "blue" });
    const tagStore = D2.tag(stage, {
      x: TAB.x0,
      y: 12,
      text: `relational: ${P.relational.places} tables`,
      tone: "grey",
    });
    const page = D2.page(stage, { ...PAGE, slots: N });
    const tables = P.fields.map((f, i) =>
      D2.table(stage, {
        ...tabPos(i),
        w: TAB.w,
        name: f.table,
        rows: Array.from({ length: f.n }, () => [{ text: KEY, tone: "orange" }, ""]),
      }),
    );
    const keyChip = (i) => tables[i].cellMid(0, 0); // the first key chip of table i
    const bridges = BRIDGES.map(([a, b]) => {
      const [p, q] = [keyChip(a), keyChip(b)];
      return low.appendChild(
        V.s(
          "g",
          {},
          V.s("path", {
            d: `M ${p.x} ${p.y} L ${q.x} ${q.y}`,
            fill: "none",
            pathLength: "1",
            "data-draw": "1",
            "stroke-width": "9",
            "stroke-linecap": "round",
            style: { stroke: D2.tone("purple").c },
          }),
        ),
      );
    });
    const doc = D2.doc(stage, { ...DOC, title: `chef #${KEY}`, lines: D2.profileDoc() });
    const tagJoin = D2.tag(stage, {
      x: 430,
      y: 412,
      text: `joined by foreign key ${KEY}`,
      tone: "purple",
      solid: true,
    });
    const statT = D2.stat(stage, { x: TAB.x0, y: 520, w: 318, h: 80, label: "table reads", tone: "orange" });
    const statD = D2.stat(stage, { x: 598, y: 520, w: 300, h: 80, label: "document reads", tone: "green" }); // 300 wide: its pulse stays inside the 12 px margin
    const top = L5.svg(stage);
    const readY = DOC.y + 32; // the title row of the document: the page asks for "chef #251"
    const arrow = top.appendChild(
      L5.arrow(PAGE.x + PAGE.w + 12, readY, DOC.x - 12, readY, "blue", 1, { w: 6, head: 18 }),
    );
    const tick = top.appendChild(L5.tick(DOC.x + DOC.w - 40, DOC.y + 32, 34, "green", { w: 7 }));

    // each lookup runs from its page slot out through the gaps between the tables to the door of its table
    const routes = tables.map((tb, i) => {
      const s = page.slotMid(i);
      const c = i % 3;
      const door = { x: tb.x + 4, y: keyChip(i).y }; // the left edge of the table, level with its first key chip
      const pts = [
        { x: PAGE.x + PAGE.w - 18, y: s.y },
        { x: LANE_X[0], y: s.y },
      ];
      if (c === 0) pts.push({ x: LANE_X[0], y: door.y });
      else pts.push({ x: LANE_X[0], y: LANE_Y }, { x: LANE_X[c], y: LANE_Y }, { x: LANE_X[c], y: door.y });
      pts.push(door);
      const line = polyline(pts);
      const dur = clamp(line.len / 1000, 0.25, 0.55); // a long run takes longer, but never more than one beat
      D2.same(`profile scene: route ${i} fits in its beat`, dur < T.per, true);
      return { ...line, dur };
    });
    // a token and a short trail of ghosts behind it, so the direction of a lookup reads in a single frame
    const trail = [14, 28, 42, 56].map((back, j) => ({
      back,
      tok: D2.token(stage, { tone: "blue", size: 22 - 3 * j }),
    }));
    const tok = D2.token(stage, { tone: "blue", size: 26 });
    const readTok = D2.token(stage, { tone: "blue", size: 26 });

    return (t) => {
      const k = (a, d = 0.45) => ramp(t, a, a + d, E.lin);
      const arrived = Array.from({ length: N }, (_, i) => t >= hit(i)).filter(Boolean).length;
      const cleared = k(T.clear, 0.5);

      // ---- the lookup in flight (at most one: every run is shorter than a beat) ----
      const cur = routes.findIndex((r, i) => t >= hit(i) - r.dur && t < hit(i) + 0.06);
      const inFlight = cur >= 0 && t < hit(cur);

      // ---- the page: slots fill as the tables answer, empty again, then fill at once from the document ----
      const fillTab = P.fields.map((_, i) => ramp(t, hit(i), hit(i) + 0.25, E.lin));
      const fillRel = P.fields.map((_, i) => 1 - ramp(t, T.clear + 0.05 * i, T.clear + 0.05 * i + 0.2, E.lin));
      const fillDoc = P.fields.map((_, i) => ramp(t, T.fill + 0.05 * i, T.fill + 0.05 * i + 0.3, E.lin));
      page.set({
        k: k(T.page, 0.5),
        fill: P.fields.map((_, i) => Math.max(Math.min(fillTab[i], fillRel[i]), fillDoc[i])),
        wait: inFlight ? cur : -1,
        waitK: inFlight ? 0.5 : 0,
      });
      tagPage.set({ k: k(T.page + 0.1) });

      // ---- the six tables (relational): a blue ring while a lookup reads them, a purple one once the key joins them ----
      tables.forEach((tb, i) => {
        const rows = Array.from({ length: P.fields[i].n }, (_, r) => r);
        const reading = t >= hit(i) - 0.05 && t < hit(i) + 0.25;
        const joined = t >= T.glue + 0.05 * i;
        tb.set({
          k: D2.seq(t, T.tables, 0.07, 0.3, i),
          o: 1 - cleared,
          hot: reading || joined ? rows : -1,
          hotTone: reading ? "blue" : "purple",
          hotK: reading
            ? ramp(t, hit(i) - 0.05, hit(i) + 0.1, E.lin)
            : ramp(t, T.glue + 0.05 * i, T.glue + 0.05 * i + 0.25),
        });
      });
      bridges.forEach((g, i) => {
        L5.drawOn(g, ramp(t, T.glue + 0.2 + 0.08 * i, T.glue + 0.5 + 0.08 * i, E.out));
        V.show(g, 1 - ramp(t, T.clear - 0.15, T.clear + 0.05, E.lin)); // gone before the tables fade, so they never show through
      });
      const doc1 = t >= T.clear + 0.5; // the new tag only once the old one has faded out
      tagStore.set({
        text: doc1 ? `document: ${P.document.places} place` : `relational: ${P.relational.places} tables`,
        x: doc1 ? DOC.x - TAB.x0 : 0,
        k: doc1 ? k(T.doc, 0.4) : k(T.tables + 0.05, 0.4),
        o: doc1 ? 1 : 1 - cleared,
      });
      tagJoin.set({ k: k(T.glue + 0.1, 0.4), o: 1 - cleared });

      // ---- the six lookups: one blue token runs page -> door of its table, with a short trail ----
      if (cur >= 0) {
        const rt = routes[cur];
        const s = smooth(clamp((t - (hit(cur) - rt.dur)) / rt.dur)) * rt.len;
        const gone = ramp(t, hit(cur) - 0.05, hit(cur) + 0.05, E.lin); // it dissolves into the ring as it lands
        tok.set({ ...rt.at(s), s: 1 - 0.5 * gone, o: 1 - gone });
        trail.forEach(({ back, tok: g }, j) =>
          g.set({ ...rt.at(s - back), s: 1 - 0.5 * gone, o: s - back > 1 ? (0.55 - 0.1 * j) * (1 - gone) : 0 }),
        );
      } else {
        tok.set({ o: 0 });
        trail.forEach(({ tok: g }) => g.set({ o: 0 }));
      }

      // ---- counters ----
      statT.set({
        text: String(Math.min(arrived, P.relational.lookups)),
        k: k(T.stat),
        bump: P.fields.reduce((s, _, i) => s + flash(t, hit(i), hit(i) + 0.3), 0) + 0.5 * flash(t, T.cmp, T.cmp + 0.4),
      });
      statD.set({
        text: String(P.document.lookups),
        k: k(T.one),
        bump: flash(t, T.one, T.one + 0.4) + 0.5 * flash(t, T.cmp + 0.3, T.cmp + 0.7),
      });

      // ---- the document and its one read ----
      doc.set({ k: k(T.doc, 0.6), fill: fillDoc });
      const rd = ramp(t, T.read, T.read + 0.3, E.out);
      V.show(arrow, rd > 0 ? 1 : 0);
      L5.drawOn(arrow, rd);
      const rf = smooth(clamp((t - T.read - 0.1) / (T.fill - T.read - 0.15)));
      const rp = D2.lerp2({ x: PAGE.x + PAGE.w + 24, y: readY }, { x: DOC.x - 20, y: readY }, rf);
      readTok.set({ ...rp, s: 1 - 0.4 * ramp(rf, 0.85, 1, E.lin), o: rf > 0.01 && t < T.fill ? 1 : 0 });
      L5.drawOn(tick, ramp(t, T.tick, T.tick + 0.4, E.out));
    };
  }

  V.scene({
    kicker: "RELATIONAL OR DOCUMENT",
    title: ["One profile page,", "two ways to store it"],
    dur: 13.0,
    caps: [
      [0.8, 2.8, "One profile page needs six tables."],
      [2.8, 6.0, "The page asks each table in turn."],
      [6.1, 8.2, "Six reads, joined by a foreign key."],
      [8.4, 10.4, "A document keeps it all together."],
      [10.6, 12.7, "One read gets the whole page."],
    ],
    build,
  });
})();

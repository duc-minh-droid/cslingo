/* Lecture 2 · scene 8 (NoSQL): four kinds of NoSQL, one recipe (lesson 2.4 "One pancake recipe, four shapes"). NoSQL means
   non-relational storage that stresses simple design, scaling out and availability, and it comes in four families. The same pancake
   recipe is drawn in each: a DOCUMENT (the whole recipe in one place), a KEY-VALUE store (every item found by a two-part key: a
   partition key that groups the items, a sort key that orders them), a WIDE-COLUMN table (each row keeps its own columns) and a
   GRAPH (recipes and ingredients, linked by labelled edges: Pancakes and Waffles both USE Flour; the TAGGED edge to Breakfast is not
   labelled because its arrow is too short for a label beside the graph's title tag). Everything comes from D2.AIMS / D2.FAMILIES
   (asserted when the page loads): the four key-value items share the partition key recipe#7 and have four different sort keys,
   only "name" is a column of every wide row, and Flour is used by Pancakes and Waffles.
   Layout: part 1 is three aim cards in the middle of the stage, each with a tiny story (simple design: a tangle of joined tables is
   crossed out and one flat box remains; scales out: one box becomes four; stays available: one of four machines fails and the
   request still reaches a working one); part 2 is a 2 x 2 grid in the order document, key-value (top), wide-column, graph
   (bottom). Every family has a title tag (solid blue while it is being explained, grey afterwards) with its small pictogram. The
   grid is tight, so the key-value table carries the two key names as its first row (solid chips: partition key orange, sort key
   blue) instead of a row of separate tags, and the graph's three ingredients stand on the right, beside the graph's title tag.
   Story (local seconds): 0.3 the definition, 0.35 / 0.65 / 0.95 the three aims (simple design: cross 0.85, one box 1.35; scales
   out: split 1.45; stays available: failure 2.05, request 2.5, tick 2.85), 3.35 the aims fade; DOCUMENT 3.55 tag and sticker "recipe
   #7", 4.0 name and minutes are typed, 4.8 the three steps pop in; KEY-VALUE 6.4 tag and table, 6.8 the four items one by one, 7.7
   the orange keys pulse together (same partition key: grouped), 7.95 the blue keys pulse down the column (ordered by the sort
   key); WIDE-COLUMN 10.2 tag and sticker, 10.6 the three rows (shorter third), 11.95 the columns that are not in every row turn blue
   and get a note; GRAPH 13.1 tag, 13.2 the two recipes then the three ingredients, 14.15 the four edges draw on, 15.2 the label
   USES, 16.4 the two edges into Flour grow in purple and Flour gets a ring (Pancakes and Waffles share Flour). Then the picture
   holds. A family's title tag is solid blue from the moment its cell pops until the next cell pops. Captions read at 17
   characters per second or slower and start once their picture is on screen.
   Helper note: D2.fam("doc", size) does not scale the braces with `size` (fixed size and place), so the small pictograms are drawn at
   100 and scaled as a whole here (common-4.js is not edited). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (asserted against the storyboard and the lesson) ----------
  const F = D2.FAMILIES;
  const ORDER = D2.FAMILY_ORDER;
  const AIMS = D2.AIMS;
  D2.same(
    "families scene: the four families in grid order",
    ORDER.map((k) => F[k].name),
    ["Document", "Key-value", "Wide-column", "Graph"],
  );
  D2.same("families scene: three aims", AIMS, ["simple design", "scales out", "stays available"]);
  const KV = F.kv.rows; // [partition key, sort key]
  const RECIPE_ID = F.wide.rows[0].id; // recipe 7: the same recipe in all four shapes
  const DOC_TITLE = `${F.doc.coll.replace(/s$/, "")} #${RECIPE_ID}`; // "recipe #7": one document of the collection
  D2.same(
    "families scene: the document is recipe 7, like the key-value items",
    [DOC_TITLE, KV[0][0]],
    ["recipe #7", "recipe#7"],
  );
  D2.same(
    "families scene: one partition key, four different sort keys",
    [new Set(KV.map((r) => r[0])).size, new Set(KV.map((r) => r[1])).size, KV.length],
    [1, 4, 4],
  );
  const WIDE = F.wide.rows;
  const SHARED = [...new Set(WIDE.flatMap((r) => r.cols))].filter((c) => WIDE.every((r) => r.cols.includes(c)));
  D2.same("families scene: only name is a column of every wide row", SHARED, ["name"]);
  D2.same(
    "families scene: the wide rows have 3, 3 and 2 columns",
    WIDE.map((r) => r.cols.length),
    [3, 3, 2],
  );
  const GE = F.graph.edges.map(([a, b, label]) => ({ a, b, label, key: `${a}>${b}` }));
  const RECIPES = F.graph.nodes.filter((n) => GE.some((e) => e.a === n)); // vertices with edges leaving them
  const INGREDIENTS = F.graph.nodes.filter((n) => !RECIPES.includes(n));
  const GRAPH_ORDER = [...RECIPES, ...INGREDIENTS];
  const [SHARED_ING] = INGREDIENTS.filter((n) => D2.usersOf(n).length > 1);
  const SHARERS = D2.usersOf(SHARED_ING); // the recipes that use it
  const SHARER_KEYS = SHARERS.map((u) => `${u}>${SHARED_ING}`);
  const LABEL_KEY = SHARER_KEYS[SHARER_KEYS.length - 1]; // the edge that answers "who else uses it?"
  D2.same(
    "families scene: two recipes, three ingredients",
    [RECIPES, INGREDIENTS],
    [
      ["Pancakes", "Waffles"],
      ["Flour", "Eggs", "Breakfast"],
    ],
  );
  D2.same("families scene: Flour is the shared ingredient", [SHARED_ING, SHARERS], ["Flour", ["Pancakes", "Waffles"]]);
  D2.same(
    "families scene: both edges into Flour are USES edges of the graph",
    SHARER_KEYS.map((k) => GE.find((e) => e.key === k).label),
    ["USES", "USES"],
  );
  D2.same("families scene: the labelled edge is Waffles to Flour", LABEL_KEY, "Waffles>Flour");

  // ---------- layout (stage px; everything keeps the 12 px margin, lips included) ----------
  const COL = [
    { x: 12, w: 432 }, // document, wide-column
    { x: 468, w: 456 }, // key-value, graph
  ];
  const TAGH = 52; // the title tags are forced to this height so that two rows of them fit
  const ROW = { tag: [14, 340], body: [74, 400] }; // the 60 px pictograms stand 1 px higher than the tags: 14 keeps them off the 12 px margin
  const ICON = { size: 60, dx: 31, label: 68 }; // the family pictogram sits in front of its tag
  const GP = {
    // the graph's vertex centres: recipes on the left, ingredients on the right
    Pancakes: [554, 440],
    Waffles: [546, 548],
    Breakfast: [822, 392],
    Eggs: [822, 466],
    Flour: [822, 548],
  };
  D2.same("families scene: a position for every vertex", Object.keys(GP).sort(), [...F.graph.nodes].sort());
  const AIM = { w: 280, h: 184, gap: 24, y: 280 }; // part 1
  AIM.x0 = (936 - (3 * AIM.w + 2 * AIM.gap)) / 2;
  const aimX = (i) => AIM.x0 + i * (AIM.w + AIM.gap);
  const DEF = { text: "NoSQL: non-relational storage", y: 190 };
  const tagWidth = (text) => Math.round(40 + 14.4 * text.length); // a 28 px tag as it is really drawn
  const inside = (what, x0, x1, y1) =>
    D2.same(`families scene: ${what} keeps the 12 px margin`, x0 >= 12 && x1 <= 924 && y1 <= 628, true);
  inside("the aim cards", aimX(0), aimX(2) + AIM.w, AIM.y + AIM.h + 6);
  inside("the definition", (936 - tagWidth(DEF.text)) / 2, (936 + tagWidth(DEF.text)) / 2, DEF.y + TAGH);

  // ---------- timeline ----------
  const T = {
    def: 0.3, // the definition tag
    aim: 0.35, // the three aims pop, 0.3 s apart
    aimStep: 0.3,
    cross: 0.85, // simple design: the tangle of joined tables is crossed out, then one flat box
    one: 1.35,
    split: 1.45, // scales out: one box becomes four
    fail: 2.05, // stays available: one of four boxes fails (red cross) ...
    route: 2.5, // ... and the request still reaches a working one (arrow, then the tick)
    tick: 2.85,
    aimsOff: 3.35, // part 1 fades in 0.3 s (the document pops at 3.55, so the stage is never empty)
    cell: [3.55, 6.4, 10.2, 13.1], // the four title tags (the sticker follows 0.1 s later)
    name: 4.0, // document: name and minutes are typed, then the steps pop
    mins: 4.5,
    steps: 4.8,
    items: 6.8, // key-value: the four items, 0.28 s apart
    itemStep: 0.28,
    keys: 7.7, // the orange keys pulse together (grouped), then the blue ones one by one (ordered)
    sorts: 7.95,
    rows: 10.6, // wide-column: the three rows, 0.35 s apart
    rowStep: 0.35,
    vary: 11.95, // the columns that vary turn blue
    node: 13.2, // graph: recipes, then ingredients, 0.15 s apart
    nodeStep: 0.15,
    edge: 14.15, // the four edges, 0.2 s apart
    edgeStep: 0.2,
    label: 15.2, // USES
    focus: 16.4, // who else uses flour?
  };
  const END = 19.2; // the scene's length
  const ACTIVE = T.cell.map((a, i) => [a, i < 3 ? T.cell[i + 1] : END]); // a family's title tag is solid blue until the next one pops
  D2.same(
    "families scene: the graph is complete before the labels and the focus, and the focus before the hold",
    [T.edge + 3 * T.edgeStep + 0.4 < T.label + 0.3, T.label + 0.3 < T.focus, T.focus + 0.6 < END - 0.5],
    [true, true, true],
  );

  /** the small chips of a D2.table or D2.doc, in reading order (the helpers draw every chip with a 10 px radius) */
  const chipsOf = (box) => Array.from(box.el.children).filter((c) => c.style.borderRadius === "10px");
  const popChip = (c, k, extra = 1) => V.place(c, { s: (0.65 + 0.35 * E.pop(k)) * extra, o: Math.min(1, k * 4) });

  /** a family pictogram at ICON.size. D2.fam(k, size) does not scale the braces of the document icon (it draws them at a fixed size and
      place), so the icon is drawn at its design size of 100 and shrunk as a whole (the 60 px result matches D2.fam's other icons). */
  const icon = (kind, tone) => {
    const inner = D2.fam(kind, 100, tone);
    inner.style.transform = `scale(${ICON.size / 100})`; // an SVG element scales about the svg's origin, where the icon is centred
    return V.s("g", {}, inner);
  };

  /** a small rounded box (a machine or a copy of one) */
  const box = (cx, cy, w, h, tone) =>
    V.s(
      "g",
      {},
      V.s("rect", {
        x: (cx - w / 2).toFixed(1),
        y: (cy - h / 2).toFixed(1),
        width: w,
        height: h,
        rx: 10,
        "stroke-width": 4,
        style: { fill: "var(--panel)", stroke: D2.tone(tone).lip },
      }),
    );

  function build(stage) {
    // ---- part 1: NoSQL and its three aims ----
    const def = D2.tag(stage, { x: (936 - tagWidth(DEF.text)) / 2, y: DEF.y, text: DEF.text, tone: "grey", h: TAGH });
    const AIM_TONES = ["blue", "green", "orange"];
    const aims = AIMS.map((text, i) => {
      const c = D2.card(stage, {
        x: aimX(i),
        y: AIM.y,
        w: AIM.w,
        h: AIM.h,
        text,
        tone: AIM_TONES[i],
        plain: false,
        fs: 30,
      });
      Object.assign(c.el.style, { alignItems: "flex-end", paddingBottom: "22px" }); // the text sits under the pictogram
      return c;
    });
    const pics = L5.svg(stage);
    const [cy, mid] = [AIM.y + 66, (i) => aimX(i) + AIM.w / 2];
    // simple design: a tangle of joined tables is crossed out, one flat box is all you need
    const line = (x1, y1, x2, y2) =>
      V.s("line", {
        x1,
        y1,
        x2,
        y2,
        "stroke-width": 4,
        "stroke-linecap": "round",
        style: { stroke: D2.tone("grey").lip },
      });
    const TANGLE = [
      [mid(0) - 98, cy - 16],
      [mid(0) - 36, cy - 16],
      [mid(0) - 67, cy + 32],
    ];
    const tangle = pics.appendChild(
      V.s(
        "g",
        {},
        ...TANGLE.map(([x, y], i) => line(x, y, ...TANGLE[(i + 1) % 3])),
        ...TANGLE.map(([x, y]) => box(x, y, 42, 32, "grey")),
      ),
    );
    const crossT = pics.appendChild(L5.cross(mid(0) - 67, cy + 6, 56, "red", { w: 9 }));
    const toOne = pics.appendChild(L5.arrow(mid(0) - 16, cy + 4, mid(0) + 14, cy + 4, "blue", 1, { w: 6, head: 14 }));
    const one = pics.appendChild(box(mid(0) + 62, cy + 4, 62, 50, "blue"));
    // scales out: one box becomes four side by side
    const OFF = [-93, -31, 31, 93];
    const four = OFF.map(() => pics.appendChild(box(mid(1), cy + 4, 52, 42, "green")));
    // stays available: four machines, one fails (red cross), the request still reaches a working one (arrow, tick)
    const FX = [-78, -26, 26, 78];
    const machines = FX.map((dx) => pics.appendChild(box(mid(2) + dx, cy + 18, 44, 36, "green")));
    const failed = pics.appendChild(box(mid(2) + FX[1], cy + 18, 44, 36, "red"));
    const crossM = pics.appendChild(L5.cross(mid(2) + FX[1], cy + 18, 34, "red", { w: 8 }));
    const request = pics.appendChild(
      L5.arrow(mid(2) + FX[2], cy - 40, mid(2) + FX[2], cy - 2, "blue", 1, { w: 6, head: 14 }),
    );
    const tick = pics.appendChild(L5.tick(mid(2) + 66, cy - 22, 36, "green", { w: 8 }));

    // ---- part 2: title tags and pictograms ----
    const icons = L5.svg(stage);
    const cells = ORDER.map((k, i) => {
      const [x, y] = [COL[i % 2].x, ROW.tag[Math.floor(i / 2)]];
      return {
        k,
        tag: D2.tag(stage, { x: x + ICON.label, y, text: F[k].name, tone: "grey", h: TAGH }),
        grey: icons.appendChild(icon(k, "grey")),
        blue: icons.appendChild(icon(k, "blue")),
        at: { x: x + ICON.dx, y: y + TAGH / 2 },
      };
    });

    // ---- the document ----
    const doc = D2.doc(stage, {
      x: COL[0].x,
      y: ROW.body[0],
      w: COL[0].w,
      title: DOC_TITLE,
      lines: F.doc.lines,
      tone: "grey",
    });
    const [NAME, MINS] = F.doc.lines.map((l) => l.text);
    const steps = chipsOf(doc);
    D2.same("families scene: the document has three steps", steps.length, F.doc.lines[2].items.length);

    // ---- the key-value table: a header row with the two key names, then the four items ----
    const kvRows = [
      [
        { text: "partition key", tone: "orange", solid: true },
        { text: "sort key", tone: "blue", solid: true },
      ],
      ...KV.map(([a, b]) => [
        { text: a, tone: "orange" },
        { text: b, tone: "blue" },
      ]),
    ];
    const kv = D2.table(stage, { x: COL[1].x, y: ROW.body[0], w: COL[1].w, name: "", rows: kvRows, widths: [232] });
    const kvChips = chipsOf(kv);
    D2.same("families scene: ten key-value chips", kvChips.length, 2 * kvRows.length);

    // ---- the wide-column table: a row id, then that row's own columns ----
    const wideRows = WIDE.map((r) => [{ text: String(r.id), tone: "orange" }, ...r.cols]);
    const wide = D2.table(stage, {
      x: COL[0].x,
      y: ROW.body[1],
      w: COL[0].w,
      name: "",
      rows: wideRows,
      widths: [60, 100],
      stretch: false,
    });
    const wideChips = chipsOf(wide);
    const NOTE = "not in every row";
    const note = D2.tag(stage, { x: COL[0].x + 8, y: ROW.body[1] + wide.h + 14, text: NOTE, tone: "blue", h: TAGH });
    inside("the wide-column note", COL[0].x + 8, COL[0].x + 8 + tagWidth(NOTE), ROW.body[1] + wide.h + 14 + TAGH);
    const rowOf = wideRows.flatMap((r, ri) => r.map(() => ri)); // the row of every wide chip, in reading order
    const colOf = wideRows.flatMap((r) => r.map((_, ci) => ci));
    const varies = (i) => colOf[i] > 0 && !SHARED.includes(WIDE[rowOf[i]].cols[colOf[i] - 1]);
    D2.same("families scene: eleven wide chips (an id and 3, 3, 2 columns)", wideChips.length, 11);
    D2.same(
      "families scene: the chips that vary are mins, tags, vegan, kcal and mins",
      wideChips.map((_, i) => (varies(i) ? WIDE[rowOf[i]].cols[colOf[i] - 1] : null)).filter(Boolean),
      ["mins", "tags", "vegan", "kcal", "mins"],
    );

    // ---- the graph: the plain graph, and an overlay that grows the purple edges over it ----
    const nodes0 = Object.fromEntries(F.graph.nodes.map((id) => [id, { x: GP[id][0], y: GP[id][1], kind: "plain" }]));
    const g = D2.graph(stage, { nodes: nodes0, edges: GE });
    const hi = D2.graph(stage, { nodes: nodes0, edges: GE });
    F.graph.nodes.forEach((id) => {
      const { w, h } = g.size(id);
      const ring = id === SHARED_ING ? 9 : 3; // the ringed vertex needs room for the ring
      inside(`vertex ${id}`, GP[id][0] - w / 2 - ring, GP[id][0] + w / 2 + ring, GP[id][1] + h / 2 + 6 + ring);
    });
    inside("the wide-column table", COL[0].x, COL[0].x + COL[0].w, ROW.body[1] + wide.h + 6);
    inside("the key-value table", COL[1].x, COL[1].x + COL[1].w, ROW.body[0] + kv.h + 6);
    D2.same("families scene: the table row ends before the next title tags", ROW.body[0] + kv.h + 6 < ROW.tag[1], true);
    D2.same("families scene: the document is shorter than the table", doc.h < kv.h, true);

    return (t) => {
      const lin = (a, d = 0.35) => ramp(t, a, a + d, E.lin);
      const off = 1 - lin(T.aimsOff, 0.3); // part 1 fades out as a whole

      // ---- part 1 ----
      def.set({ k: lin(T.def, 0.4), o: off });
      aims.forEach((c, i) => c.set({ k: lin(T.aim + i * T.aimStep, 0.45), o: off }));
      const kA = AIMS.map((_, i) => lin(T.aim + i * T.aimStep, 0.45));
      const pic = (g, k, extra = {}) =>
        V.place(g, {
          s: (0.75 + 0.25 * E.pop(k)) * (extra.s ?? 1),
          x: extra.x || 0,
          o: Math.min(1, k * 4) * (extra.o ?? 1) * off,
        });
      // simple design: tangle, crossed out, then the one flat box
      pic(tangle, kA[0]);
      L5.drawOn(crossT, lin(T.cross, 0.35));
      V.place(crossT, { o: off });
      L5.drawOn(toOne, lin(T.one - 0.15, 0.3));
      V.place(toOne, { o: off });
      pic(one, lin(T.one, 0.4));
      // scales out: one box becomes four
      const p = E.inOut(lin(T.split, 0.6));
      four.forEach((b, j) => pic(b, kA[1], { x: OFF[j] * p, s: 1.5 - 0.5 * p }));
      // stays available: one machine fails, the request still gets an answer
      const fk = lin(T.fail, 0.3);
      machines.forEach((m, j) => pic(m, kA[2], { o: j === 1 ? 1 - fk : 1 }));
      pic(failed, kA[2], { o: fk });
      L5.drawOn(crossM, lin(T.fail + 0.1, 0.3));
      V.place(crossM, { o: off });
      L5.drawOn(request, lin(T.route, 0.3));
      V.place(request, { o: off });
      L5.drawOn(tick, lin(T.tick, 0.4));
      V.place(tick, { o: off });

      // ---- part 2: title tags and pictograms ----
      cells.forEach((c, i) => {
        const k = lin(T.cell[i], 0.4);
        const on = t >= ACTIVE[i][0] && t < ACTIVE[i][1];
        c.tag.set({ tone: on ? "blue" : "grey", solid: on, k });
        const [s, o] = [0.8 + 0.2 * E.pop(k), Math.min(1, k * 4)];
        V.place(c.grey, { ...c.at, s, o: on ? 0 : o });
        V.place(c.blue, { ...c.at, s, o: on ? o : 0 });
      });

      // ---- the document: name and minutes are typed, the steps pop in ----
      doc.set({
        k: lin(T.cell[0] + 0.1, 0.45),
        fill: [0, 0, 1],
        fillTone: "blue",
        texts: { 0: V.type(NAME, lin(T.name, 0.45)), 1: V.type(MINS, lin(T.mins, 0.25)) },
      });
      steps.forEach((c, j) => popChip(c, lin(T.steps + j * 0.2, 0.3)));

      // ---- the key-value table: the key names, then the four items, then the two kinds of key pulse ----
      kv.set({ k: lin(T.cell[1] + 0.1, 0.45) });
      kvChips.forEach((c, i) => {
        const [row, col] = [Math.floor(i / 2), i % 2];
        if (row === 0) return popChip(c, lin(T.cell[1] + 0.1, 0.45)); // the key names come with the table
        const r = row - 1; // item r
        const k = lin(T.items + r * T.itemStep + col * 0.07, 0.3);
        const beat =
          col === 0 ? flash(t, T.keys, T.keys + 0.45) : flash(t, T.sorts + r * 0.12, T.sorts + r * 0.12 + 0.4);
        popChip(c, k, 1 + 0.08 * beat);
      });

      // ---- the wide-column table: three rows with their own columns; then the columns that vary turn blue ----
      wide.set({
        k: lin(T.cell[2] + 0.1, 0.45),
        cells: Object.fromEntries(
          wideChips.flatMap((_, i) =>
            varies(i) && t >= T.vary ? [[`${rowOf[i]},${colOf[i]}`, { tone: "blue" }]] : [],
          ),
        ),
      });
      note.set({ k: lin(T.vary + 0.1, 0.4) });
      wideChips.forEach((c, i) => {
        const k = lin(T.rows + rowOf[i] * T.rowStep + colOf[i] * 0.06, 0.3);
        popChip(c, k, 1 + 0.1 * (varies(i) ? flash(t, T.vary, T.vary + 0.45) : 0));
      });

      // ---- the graph ----
      const gn = {};
      GRAPH_ORDER.forEach((id, i) => {
        const st = { k: D2.seq(t, T.node, T.nodeStep, 0.4, i) };
        if (t >= T.focus && SHARERS.includes(id)) st.tone = "purple";
        if (t >= T.focus && id === SHARED_ING) Object.assign(st, { ring: "orange", ringK: lin(T.focus + 0.25, 0.3) });
        gn[id] = st;
      });
      const ge = {};
      GE.forEach((e, i) => {
        const st = { tone: "grey", k: E.out(D2.seq(t, T.edge, T.edgeStep, 0.35, i)) };
        if (e.key === LABEL_KEY) Object.assign(st, { label: lin(T.label, 0.3), labelSide: 1 });
        ge[e.key] = st;
      });
      const base = { node: { k: 0 }, edge: { k: 0, label: 0 } };
      g.update({ nodes: gn, edges: ge });
      const lit = {};
      SHARER_KEYS.forEach((key, i) => {
        lit[key] = { tone: "purple", k: E.out(lin(T.focus + i * 0.15, 0.45)), w: 1.4 };
      });
      hi.update({ base, edges: lit });
    };
  }

  V.scene({
    kicker: "NoSQL",
    title: ["Four kinds of NoSQL,", "one recipe"],
    dur: END,
    caps: [
      [0.5, 3.4, "NoSQL: simple, scales out, stays available."],
      [4.6, 6.4, "Document: the whole recipe."],
      [7.8, 10.3, "A partition key groups, a sort key orders."],
      [10.9, 12.9, "Wide-column: columns vary per row."],
      [14.3, 16.3, "Graph: things and labelled links."],
      [16.6, 18.6, "Pancakes and Waffles share Flour."],
    ],
    build,
  });
})();

/* Lecture 2 · scene 4 (SCHEMA): changing the shape of your data (lesson 2.2 "Split name into first and last name").
   A document store happily keeps old documents ({name}) and new ones ({first_name, last_name}) side by side: the app splits an old
   name in code when it reads it, so there is nothing to wait for. A relational table has one shape for every row: add the two new
   columns, then rewrite ALL 1,000 rows before the table is ready. The numbers come from D2.SCHEMA / D2.migrate (asserted when the
   page loads); the names are split by D2.splitName, the same function the lesson's demo uses.
   Colours: grey = the old shape, orange = the new shape and everything that changes, blue = the name being read, purple = the app,
   green = done and ready, red = waiting.
   Story (local seconds): 0.3-1.1 the three documents (old, old, new), 1.55 rings on their keys (one field, one field, two fields),
   3.0 the app starts reading the old name (blue ring), 3.1 the app box and the arrow to it, 3.3-3.9 a blue copy of the name flies
   down the arrow (the document stays as it was), 4.0-4.5 it splits in two inside the app, 4.6 "no waiting" and a tick; 5.2 the
   relational lane, 5.3 the table with its one name column, 6.0-6.6 the table grows two new columns (NULL), 6.3 the "new columns"
   tag, 6.8 the progress bar, 7.3-11.8 the rewrite sweep (three sample rows stand for the 1,000: the ring walks down them and each
   turns green when the sweep has passed its third; the bar counts D2.migrate(p).done; a red "waiting" tag with a turning clock),
   11.8 the bar is green ("done"), 11.9 the clock becomes a tick and "waiting" becomes "ready". */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const { abs, flex, setText, setClass, f1 } = D2.u;

  // ---------- the data (asserted against the storyboard and the lesson) ----------
  const S = D2.SCHEMA;
  const OLD_KEY = Object.keys(S.old)[0];
  const NEW_KEYS = Object.keys(S.next);
  D2.same("schema scene: old shape and new shape", [OLD_KEY, NEW_KEYS], ["name", ["first_name", "last_name"]]);
  const PEOPLE = [S.old.name, "Bo Li", `${S.next.first_name} ${S.next.last_name}`];
  const SPLIT = PEOPLE.map((n) => D2.splitName(n));
  D2.same("schema scene: the lesson's old name splits in code", SPLIT[0], S.split);
  D2.same("schema scene: the new-shape user is the split of a name", SPLIT[2], [S.next.first_name, S.next.last_name]);
  D2.same(
    "schema scene: every name splits into two",
    SPLIT.map((p) => p.length),
    [2, 2, 2],
  );
  D2.same("schema scene: the sweep ends with every row rewritten", D2.migrate(1), { done: S.rows, pct: 100 });
  D2.same("schema scene: the sweep starts with none rewritten", D2.migrate(0), { done: 0, pct: 0 });
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 1000 -> "1,000"
  const ROWS = fmt(S.rows);
  D2.same("schema scene: the row count as shown", ROWS, "1,000");

  // ---------- layout (stage px, 12 px margin) ----------
  const TAGH = 50; // every tag of this scene is 50 px high (two lanes of content need the room)
  const DOC_Y = 76;
  const DOCS = [
    { x: 12, w: 290, title: "old shape", tone: "grey", lines: [{ key: OLD_KEY, text: PEOPLE[0] }] },
    { x: 322, w: 250, title: "old shape", tone: "grey", lines: [{ key: OLD_KEY, text: PEOPLE[1] }] },
    {
      x: 592,
      w: 332,
      title: "new shape",
      tone: "orange",
      lines: NEW_KEYS.map((key, i) => ({ key, text: SPLIT[2][i] })),
    },
  ];
  // the app: a purple box under the first document; the name is read from there, flies down, and splits in two
  const CHIP = { h: 44, wFull: 168, wA: 98, wB: 106, gap: 20, x0: 139 }; // widths measured: Nunito 900 28 px text + 42
  const APP = { x: 12, y: 262, h: 66 };
  const CHIPS_END = CHIP.x0 + CHIP.wA + CHIP.gap + CHIP.wB;
  APP.w = CHIPS_END + 14 - APP.x;
  const CY = APP.y + APP.h / 2;
  const SPLIT_CX = (CHIP.x0 + CHIPS_END) / 2; // where the two halves are centred
  const CHIP_TOP = CY - CHIP.h / 2;
  const NAME_AT = {
    x: DOCS[0].x + 18 + (OLD_KEY.length * 17 + 34) + (PEOPLE[0].length * 16.9) / 2, // the name's centre inside the document
    y: DOC_Y + 64 + 20,
  };
  const LAND = { x: SPLIT_CX, y: CY };
  const along = (y) => NAME_AT.x + ((LAND.x - NAME_AT.x) * (y - NAME_AT.y)) / (LAND.y - NAME_AT.y); // the flight line: x at height y
  const DOC1_BOTTOM = DOC_Y + 64 + 46 + 12;
  const ARROW = { y1: DOC1_BOTTOM + 8, y2: APP.y - 8 };
  const OK = { x: APP.x + APP.w + 20, w: 186 };
  const TBL = { x: 12, y: 410, narrow: 204, full: 460, h: 202 };
  const RIGHT = 498; // the right-hand column of lane B: tag, bar, status
  const BAR = { y: 482, w: 426, h: 56 };
  const STATUS_Y = 562;
  const CLOCK = { x: RIGHT + 27, y: STATUS_Y + TAGH / 2, r: 27 };

  // ---------- timeline ----------
  const T = {
    tagA: 0.25, // lane tag
    doc: 0.3, // first document; the others follow 0.2 s apart
    shape: 1.55, // rings on the keys: one field in the old shape, two in the new one
    ring: 3.0, // the old name gets a ring: this is what the app reads
    app: 3.1, // the app box and the arrow
    chip: 3.3, // a blue copy of the name appears on the document
    fly0: 3.45, // ... and flies down to the app
    fly1: 3.9,
    split0: 4.0, // the name splits in two
    split1: 4.5,
    ok: 4.6, // no waiting, tick
    tagB: 5.2, // lane B
    table: 5.3, // the table, one column
    cols0: 6.0, // the two new columns grow
    cols1: 6.6,
    newTag: 6.3,
    bar: 6.8,
    sweep0: 7.3, // the rewrite sweep
    sweep1: 11.8,
    wait: 7.4, // waiting + clock
    ready: 11.9, // ready + tick
  };

  /** the turning clock: a red face with four ticks and two hands (SVG group; the hands are set from the sweep) */
  function clock(parent) {
    const red = D2.tone("red");
    const hand = (w) =>
      V.s("line", {
        x1: CLOCK.x,
        y1: CLOCK.y,
        x2: CLOCK.x,
        y2: CLOCK.y,
        "stroke-width": w,
        "stroke-linecap": "round",
        style: { stroke: red.ink },
      });
    const [hour, minute] = [hand(5.5), hand(4)];
    const ticks = [0, 1, 2, 3].map((i) =>
      V.s("circle", {
        cx: f1(CLOCK.x + 20 * Math.sin((Math.PI * i) / 2)),
        cy: f1(CLOCK.y - 20 * Math.cos((Math.PI * i) / 2)),
        r: 2.2,
        style: { fill: red.edge },
      }),
    );
    const g = V.s(
      "g",
      {},
      V.s("circle", {
        cx: CLOCK.x,
        cy: CLOCK.y,
        r: CLOCK.r,
        "stroke-width": 4,
        style: { fill: red.dim, stroke: red.edge },
      }),
      ...ticks,
      hour,
      minute,
      V.s("circle", { cx: CLOCK.x, cy: CLOCK.y, r: 4.5, style: { fill: red.ink } }),
    );
    parent.appendChild(g);
    const point = (turns, len) => [
      f1(CLOCK.x + len * Math.sin(2 * Math.PI * turns)),
      f1(CLOCK.y - len * Math.cos(2 * Math.PI * turns)),
    ];
    return {
      g,
      set(turns, st) {
        [
          [hour, turns / 12, 11],
          [minute, turns, 16],
        ].forEach(([h, tr, len]) => {
          const [x2, y2] = point(tr, len);
          h.setAttribute("x2", x2);
          h.setAttribute("y2", y2);
        });
        V.place(g, st);
      },
    };
  }

  /** the users table: a name column, then (after the change) two new columns; three sample rows stand for the 1,000 */
  function usersTable(parent) {
    const COL = [170, 120, 120];
    const LEFT = [14, 192, 320];
    const TOP = 54;
    const PITCH = 46;
    const el = V.h("div", {
      class: "v-card plain c-grey",
      style: { ...abs(TBL.x, TBL.y, TBL.narrow, TBL.h), borderRadius: "22px" },
    });
    const heads = ["name", "first", "last"].map((text, c) => {
      const h = V.h("div", {
        text,
        class: c ? "c-orange" : "c-grey",
        style: { ...abs(LEFT[c], 10, COL[c], 38), ...flex, fontSize: "28px", fontWeight: "900", color: "var(--c-ink)" },
      });
      el.append(h);
      return h;
    });
    const chips = PEOPLE.map((_, r) =>
      COL.map((w, c) => {
        const chip = V.h("div", {
          style: {
            ...abs(LEFT[c], TOP + r * PITCH, w, 40),
            ...flex,
            boxSizing: "border-box",
            border: "3px solid var(--c-edge)",
            borderRadius: "10px",
            background: "var(--c-dim)",
            fontSize: "28px",
            fontWeight: "800",
            whiteSpace: "nowrap",
          },
        });
        el.append(chip);
        return chip;
      }),
    );
    const rings = PEOPLE.map((_, r) => {
      const g = V.h("div", {
        class: "c-orange",
        style: {
          ...abs(-2, TOP - 4 + r * PITCH, TBL.narrow + 4, PITCH),
          boxSizing: "border-box",
          border: "5px solid var(--c)",
          borderRadius: "18px",
          visibility: "hidden",
        },
      });
      el.append(g);
      return g;
    });
    parent.append(el);
    const paint = (chip, { tone, solid = false, text, o = 1, s = 1 }) => {
      setClass(chip, `c-${tone}`);
      chip.style.background = solid ? "var(--c)" : "var(--c-dim)";
      chip.style.borderColor = solid ? "var(--c-lip)" : "var(--c-edge)";
      chip.style.color = solid ? "var(--c-on)" : "var(--c-ink)";
      setText(chip, text);
      V.place(chip, { o, s });
    };
    return {
      el,
      /* k pops the table in; w its width; headO the opacity of the three column labels; cell(r, c) -> {tone, solid, text, o, s};
         ring = the row to ring (or -1) with ringK 0..1 */
      set({ k, w, headO, cell, ring = -1, ringK = 1 }) {
        el.style.width = `${f1(w)}px`;
        heads.forEach((h, c) => V.place(h, { o: headO[c] }));
        chips.forEach((row, r) => row.forEach((chip, c) => paint(chip, cell(r, c))));
        rings.forEach((g, r) => {
          g.style.width = `${f1(w + 4)}px`;
          g.style.visibility = r === ring && ringK > 0.002 ? "" : "hidden";
          g.style.opacity = String(Math.min(1, ringK * 3));
          g.style.transform = `scale(${(0.94 + 0.06 * E.pop(ringK)).toFixed(3)})`;
        });
        V.place(el, { s: 0.85 + 0.15 * E.pop(k), o: Math.min(1, k * 4) });
      },
    };
  }

  function build(stage) {
    // ---------- lane A: the document store ----------
    const tagDoc = D2.tag(stage, { x: 12, y: 12, text: `document store: ${ROWS} documents`, tone: "grey", h: TAGH });
    const docs = DOCS.map((d) =>
      D2.doc(stage, { x: d.x, y: DOC_Y, w: d.w, title: d.title, lines: d.lines, tone: d.tone }),
    );
    const lay = L5.svg(stage);
    const arrow = lay.appendChild(
      L5.arrow(along(ARROW.y1), ARROW.y1, along(ARROW.y2), ARROW.y2, "purple", 1, { w: 6, head: 18 }),
    );
    const app = D2.card(stage, { x: APP.x, y: APP.y, w: APP.w, h: APP.h, text: "", tone: "purple", plain: true });
    const tagApp = D2.tag(stage, {
      x: APP.x + 14,
      y: CHIP_TOP,
      text: "app",
      tone: "purple",
      solid: true,
      h: CHIP.h,
    });
    tagApp.el.style.width = "94px";
    const chipFull = D2.tag(stage, {
      x: SPLIT_CX - CHIP.wFull / 2,
      y: CHIP_TOP,
      text: PEOPLE[0],
      tone: "blue",
      solid: true,
      h: CHIP.h,
    });
    chipFull.el.style.width = `${CHIP.wFull}px`;
    const halves = [
      { text: SPLIT[0][0], x: CHIP.x0, w: CHIP.wA, from: SPLIT_CX - CHIP.wFull / 2 },
      { text: SPLIT[0][1], x: CHIP.x0 + CHIP.wA + CHIP.gap, w: CHIP.wB, from: SPLIT_CX + CHIP.wFull / 2 - CHIP.wB },
    ].map((h) => {
      const tg = D2.tag(stage, { x: h.x, y: CHIP_TOP, text: h.text, tone: "blue", solid: true, h: CHIP.h });
      tg.el.style.width = `${h.w}px`;
      return { ...h, tg };
    });
    const tagOk = D2.tag(stage, { x: OK.x, y: CY - TAGH / 2, text: "no waiting", tone: "green", h: TAGH });
    tagOk.el.style.width = `${OK.w}px`;

    // ---------- lane B: the relational table ----------
    const tagRel = D2.tag(stage, { x: 12, y: 350, text: `relational: ${ROWS} rows`, tone: "grey", h: TAGH });
    const table = usersTable(stage);
    const tagNew = D2.tag(stage, { x: RIGHT, y: TBL.y, text: "new columns", tone: "orange", h: TAGH });
    const bar = D2.bar(stage, { x: RIGHT, y: BAR.y, w: BAR.w, h: BAR.h, tone: "orange" });
    // the bar's own label turns light-on-fill half way along; this one stays dark, so it reads over fill and track alike
    const barLabel = V.h("div", {
      class: "c-orange",
      style: {
        ...abs(RIGHT + 3 + 18, BAR.y + 3, BAR.w - 6 - 36, BAR.h - 6),
        ...flex,
        justifyContent: "flex-start",
        fontSize: "28px",
        fontWeight: "900",
        color: "var(--c-on)",
      },
    });
    stage.append(barLabel);
    const tagWait = D2.tag(stage, { x: RIGHT + 68, y: STATUS_Y, text: "waiting", tone: "red", h: TAGH });
    const top = L5.svg(stage);
    const tickOk = top.appendChild(L5.tick(OK.x + OK.w + 40, CY, 44, "green", { w: 8 }));
    const clk = clock(top);
    const tickReady = top.appendChild(L5.tick(CLOCK.x, CLOCK.y, 46, "green", { w: 8 }));

    return (t) => {
      const k = (a, d = 0.4) => ramp(t, a, a + d, E.lin);

      // ---- lane A: three documents ----
      tagDoc.set({ k: k(T.tagA) });
      const ringK = k(T.ring, 0.3) * (1 - k(T.split0 + 0.2, 0.2));
      const shapeK = k(T.shape, 0.3) * (1 - k(T.ring - 0.2, 0.2)); // the keys of every document, until the app starts reading
      docs.forEach((d, i) => {
        const read = i === 0 && ringK > 0; // the app reads this name
        d.set({
          k: k(T.doc + 0.2 * i, 0.45),
          hot: read ? 0 : shapeK > 0 ? (i === 2 ? [0, 1] : 0) : -1,
          hotTone: read ? "blue" : i === 2 ? "orange" : "grey",
          hotK: read ? ringK : shapeK,
        });
      });

      // ---- the app reads the old name: an arrow, a copy of the name flies down, then it splits in two ----
      const ar = ramp(t, T.app, T.app + 0.35, E.out);
      V.show(arrow, ar > 0 ? 1 : 0);
      L5.drawOn(arrow, ar);
      app.set({ k: k(T.app, 0.4) });
      tagApp.set({ k: k(T.app + 0.05, 0.35) });
      const fly = ramp(t, T.fly0, T.fly1, E.inOut);
      const gone = ramp(t, T.split0, T.split0 + 0.12, E.lin);
      chipFull.set({
        k: k(T.chip, 0.3),
        x: -(1 - fly) * (LAND.x - NAME_AT.x),
        y: -(1 - fly) * (LAND.y - NAME_AT.y),
        o: 1 - gone,
        s: 1 - 0.12 * gone,
      });
      const sp = ramp(t, T.split0, T.split1, E.out);
      halves.forEach((h) => h.tg.set({ k: k(T.split0, 0.3), x: (h.from - h.x) * (1 - sp), s: 0.9 + 0.1 * sp }));
      tagOk.set({ k: k(T.ok, 0.4) });
      L5.drawOn(tickOk, ramp(t, T.ok + 0.2, T.ok + 0.6, E.out));

      // ---- lane B: one name column, then two new columns, then the sweep over every row ----
      tagRel.set({ k: k(T.tagB) });
      const grow = ramp(t, T.cols0, T.cols1, E.out);
      const p = ramp(t, T.sweep0, T.sweep1, E.lin);
      const third = (T.sweep1 - T.sweep0) / PEOPLE.length;
      const doneAt = (r) => T.sweep0 + third * (r + 1); // row r is rewritten when the sweep has passed its third
      const colO = (r, c) => ramp(t, T.cols0 + 0.25 + 0.08 * r + 0.05 * c, T.cols0 + 0.5 + 0.08 * r + 0.05 * c, E.lin);
      const cur = clamp(Math.floor(p * PEOPLE.length), 0, PEOPLE.length - 1);
      table.set({
        k: k(T.table, 0.45),
        w: lerp(TBL.narrow, TBL.full, grow),
        headO: [1, k(T.cols0 + 0.2, 0.3), k(T.cols0 + 0.25, 0.3)],
        cell: (r, c) => {
          if (c === 0) return { tone: "grey", text: PEOPLE[r] };
          if (t >= doneAt(r)) {
            const bump = 1 + 0.12 * flash(t, doneAt(r), doneAt(r) + 0.3);
            return { tone: "green", solid: true, text: SPLIT[r][c - 1], s: bump };
          }
          return { tone: "orange", text: "NULL", o: colO(r, c) };
        },
        ring: p > 0 && p < 1 ? cur : -1,
        ringK: k(T.sweep0, 0.25),
      });
      tagNew.set({ k: k(T.newTag, 0.4) });

      // ---- the progress bar counts the rows rewritten so far ----
      const m = D2.migrate(p);
      const complete = p >= 1;
      const bk = k(T.bar, 0.4);
      bar.set({ k: bk, p, tone: complete ? "green" : "orange", text: "" });
      setText(barLabel, complete ? "done" : `rewriting ${fmt(m.done)} / ${ROWS}`);
      setClass(barLabel, complete ? "c-green" : "c-orange");
      V.place(barLabel, { s: 0.9 + 0.1 * E.pop(bk), o: Math.min(1, bk * 4) });

      // ---- waiting (red, a turning clock) until the last row is done, then ready (green) ----
      const ready = t >= T.ready;
      const wk = k(T.wait, 0.4);
      const pop = D2.pop(wk);
      clk.set(2 * p, { ...pop, o: ready ? 0 : pop.o });
      tagWait.set({
        k: ready ? k(T.ready, 0.35) : wk,
        text: ready ? "ready" : "waiting",
        tone: ready ? "green" : "red",
        solid: ready,
      });
      L5.drawOn(tickReady, ramp(t, T.ready + 0.1, T.ready + 0.5, E.out));
    };
  }

  V.scene({
    kicker: "SCHEMA",
    title: ["Changing the shape", "of your data"],
    dur: 13.5,
    caps: [
      [0.9, 3.0, "Old and new shapes sit side by side."],
      [3.2, 5.4, "The app splits old names as it reads."],
      [5.9, 8.2, "A table must change every row first."],
      [8.4, 11.8, "On a big table that takes a long time."],
      [12.0, 13.4, "Only then is it ready."],
    ],
    build,
  });
})();

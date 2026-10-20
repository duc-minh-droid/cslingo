/* Lecture 2 · scene 5 (LOCALITY): one document, one read (lesson 2.2 "Locality: one document, one read", chef #251, 20 KB).
   A document is stored and loaded as one piece. When the page needs the whole profile that is ONE read against SIX table reads,
   and the same 20 KB comes back either way. When the page needs only the name, the tables read one tiny row (0.2 KB) but the
   document still loads all 20 KB: 19.8 KB are wasted. Every count and size comes from D2.LOCALITY (asserted when the page loads).
   Layout: the need tag on top with two blue wires under it (left: one arrow into the document; right: a trunk between the two
   columns of tables with one short arrow into each table), a "reads" counter above each store, a KB meter under each store
   (green = the part of the load the page needs, red = the part it wastes).
   Story (local seconds): 0.25 need tag, 0.35 document, 0.45 tables, 0.8 counters, 0.9 meters; PART A (whole profile) 1.2 the
   arrow into the document, 1.5-2.0 its lines fill blue, 1.9 reads 1, 2.4-4.4 one table every 0.4 s (trunk grows, stub, ring, reads
   count up, the meter fills a sixth), 4.7 both meters say "20 KB loaded"; 6.0 the page now needs only the name (everything resets);
   PART B 6.3 the arrow, 6.7 the name line fills blue, 7.1 the other five lines turn red inside a red outline and the document
   meter fills red behind a green sliver, 7.6 "20 KB loaded", 7.8-8.1 one arrow to the users table, 8.1 its green ring, reads 1
   and the 0.2 KB sliver, 8.4 "0.2 KB loaded", 10.0 the document meter reads "19.8 KB wasted". The grey tag "locality: one piece"
   (0.35, with the document) defines the kicker's word; the captions name the cause (a document loads whole), not "locality". */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const { abs, flex, setText, setClass, f1 } = D2.u;

  // ---------- the data (asserted against the storyboard and the lesson) ----------
  const LC = D2.LOCALITY;
  const P = D2.PROFILE;
  const NAMES = P.fields.map((f) => f.table);
  const LINES = D2.profileDoc();
  const N = NAMES.length;
  const SHARE = LC.name.tables.kb / LC.name.doc.kb; // the part of the document a name-only page needs
  D2.same("locality scene: six tables, one document", [N, LINES.length], [6, 6]);
  D2.same(
    "locality scene: the whole profile is one read or six reads",
    [LC.all.doc.reads, LC.all.tables.reads],
    [1, N],
  );
  D2.same(
    "locality scene: the name is the first table and the first line",
    [NAMES[0], LINES[0].key],
    ["users", "name"],
  );
  D2.same(
    "locality scene: a name-only page reads one row, the document still loads everything",
    [LC.name.doc.reads, LC.name.tables.reads, LC.name.doc.kb, LC.name.tables.kb],
    [1, 1, 20, 0.2],
  );
  D2.close("locality scene: the name is a hundredth of the document", SHARE, 0.01);
  D2.close("locality scene: wasted = loaded minus needed", LC.name.doc.kb - LC.name.tables.kb, LC.wasted);
  D2.same(
    "locality scene: sizes as shown",
    [D2.kb(LC.size), D2.kb(LC.nameKB), D2.kb(LC.wasted)],
    ["20 KB", "0.2 KB", "19.8 KB"],
  );
  const NEED = { all: "page needs: whole profile", name: "page needs: just the name" };
  const LOADED = (kb) => `${D2.kb(kb)} loaded`;

  // ---------- layout (stage px, 24 px side margins) ----------
  const NEED_AT = { x: 352, y: 16, w: 396, h: 58 }; // right of the "locality" tag (x 24 to 340) // y 16: the pop-in overshoot keeps clear of the 12 px margin
  const WIRE_Y = NEED_AT.y + NEED_AT.h / 2; // the wires start inside the tag
  const DOC = { x: 24, y: 172, w: 350 }; // 352 px high: ends at y 524
  const WL = 358; // the arrow into the document (the top edge is straight up to x 352, the corner is only 1.5 px lower here)
  // the tables zigzag down two columns (table i is the i-th read): the trunk between them grows downwards and branches left, right, left ...
  const TAB = { w: 196, h: 64, xs: [408, 714], y0: 172, pitch: 60, trunk: 659 }; // the 110 px lane between the columns holds the trunk
  const tabPos = (i) => ({ x: TAB.xs[i % 2], y: TAB.y0 + TAB.pitch * i });
  const stubY = (i) => tabPos(i).y + TAB.h / 2;
  const METER = { y: 556, h: 56, doc: { x: 24, w: 350 }, tab: { x: 408, w: 502 } };
  const STAT = { y: 84, h: 72 };

  // ---------- timeline ----------
  const T = {
    need: 0.25,
    doc: 0.35,
    tab: 0.45, // the six tables, 0.06 s apart
    stats: 0.8,
    meters: 0.9,
    wireA: 1.2, // the page asks the document
    fillA: 1.5, // its lines fill, 0.07 s apart
    barA: 1.6, // the document meter fills
    oneA: 1.9, // document reads 1
    labDocA: 2.2, // "20 KB loaded"
    trunkA: 1.85, // the trunk reaches the first row ...
    look: 2.4, // ... and table i is read at 2.4 + 0.4 i
    per: 0.4,
    labTabA: 4.7,
    swap: 6.0, // the page now needs only the name
    wireB: 6.3,
    nameB: 6.7, // the name line fills blue, reads 1
    wasteB: 7.1, // the other five lines turn red, the document meter fills
    labDocB: 7.6,
    trunkB: 7.55, // the trunk reaches the users row ...
    usersB: 8.1, // ... and the users table is read
    labTabB: 8.4,
    wasted: 10.0, // "19.8 KB wasted" (after the caption has read "all 20 KB")
  };
  const hit = (i) => T.look + i * T.per;
  const STUB = 0.25; // a stub arrow draws in the quarter second before its table is read

  /** a KB meter: a short track with up to two coloured segments (fractions of its width) and a label inside on the left */
  function meter(parent, { x, y, w, h }) {
    const iw = w - 6; // inside the 3 px border
    const el = V.h("div", {
      class: "v-card plain c-grey",
      style: { ...abs(x, y, w, h), borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 0 var(--line-2)" },
    });
    const segs = [0, 1].map(() => {
      const s = V.h("div", {
        class: "c-green",
        style: { ...abs(0, 0, 0, h - 6), background: "var(--c)", visibility: "hidden" },
      });
      el.append(s);
      return s;
    });
    const label = V.h("div", {
      style: {
        ...abs(18, 0, w - 36, h - 6),
        ...flex,
        justifyContent: "flex-start",
        fontSize: "28px",
        fontWeight: "900",
        whiteSpace: "nowrap",
      },
    });
    el.append(label);
    parent.append(el);
    return {
      el,
      /* k pops the meter in; segs = [[from, to, tone] | null, ...] as fractions of the track; text with textK 0..1, textTone,
         onFill (true = the label sits on a coloured segment) and textS (scale) */
      set({ k = 1, segs: sg = [], text, textK = 1, textTone = "green", onFill = true, textS = 1 }) {
        segs.forEach((s, i) => {
          const g = sg[i];
          const on = !!g && g[1] - g[0] > 0.0005;
          s.style.visibility = on ? "" : "hidden";
          if (!on) {
            s.style.width = "0px"; // nothing stale is left in a hidden segment
            return;
          }
          setClass(s, `c-${g[2]}`);
          s.style.left = `${f1(g[0] * iw)}px`;
          s.style.width = `${f1((g[1] - g[0]) * iw)}px`;
        });
        setClass(label, `c-${textTone}`);
        label.style.color = onFill ? "var(--c-on)" : "var(--c-ink)";
        setText(label, text);
        V.place(label, { s: textS, y: (1 - textK) * 6, o: textK });
        V.place(el, { s: 0.9 + 0.1 * E.pop(clamp(k)), o: Math.min(1, k * 4) });
      },
    };
  }

  /** a ring drawn round a box (stage coordinates): tone; set(k, o, s) pops it in with k 0..1, o = opacity, s = extra scale */
  function ring(parent, { x, y, w, h, r, tone }) {
    const el = V.h("div", {
      class: `c-${tone}`,
      style: {
        ...abs(x, y, w, h),
        boxSizing: "border-box",
        border: "5px solid var(--c)",
        borderRadius: `${r}px`,
        visibility: "hidden",
      },
    });
    parent.append(el);
    return {
      el,
      set(k, o = 1, s = 1) {
        const kk = clamp(k);
        el.style.visibility = kk * o > 0.002 ? "" : "hidden";
        el.style.opacity = String(Math.min(1, kk * 3) * o);
        el.style.transform = `scale(${((0.94 + 0.06 * E.pop(kk)) * s).toFixed(3)})`;
      },
    };
  }

  /** a one-off ping: an outline that grows sideways from x and fades (p 0..1; hidden at 0 and 1) */
  function ping(parent, { x, y, h, tone }) {
    const el = V.h("div", {
      class: `c-${tone}`,
      style: {
        ...abs(x, y, 16, h),
        boxSizing: "border-box",
        border: "4px solid var(--c)",
        borderRadius: "9px",
        visibility: "hidden",
        transformOrigin: "0% 50%",
      },
    });
    parent.append(el);
    return {
      el,
      set(p) {
        const on = p > 0.002 && p < 0.998;
        el.style.visibility = on ? "" : "hidden";
        el.style.opacity = String(on ? 1 - E.in(p) : 0);
        el.style.transform = `scale(${(1 + 3 * E.out(p)).toFixed(3)}, ${(1 + 0.15 * E.out(p)).toFixed(3)})`;
      },
    };
  }

  function build(stage) {
    const wires = L5.svg(stage); // under every sticker: the wires slide in below the need tag
    const tagNeed = D2.tag(stage, { ...NEED_AT, text: NEED.all, tone: "blue", solid: true });
    tagNeed.el.style.width = `${NEED_AT.w}px`;
    // the one word of the scene that needs a definition: a document is stored (and so read) as one piece
    const tagLoc = D2.tag(stage, { x: DOC.x, y: NEED_AT.y, text: "locality: one piece", tone: "grey" });
    const statDoc = D2.stat(stage, { x: DOC.x, y: STAT.y, w: 312, h: STAT.h, label: "document reads", tone: "green" });
    const statTab = D2.stat(stage, { x: 670, y: STAT.y, w: 250, h: STAT.h, label: "table reads", tone: "orange" });

    // ---------- the document ----------
    const doc = D2.doc(stage, { ...DOC, title: `chef #${P.id}`, lines: LINES, tone: "blue" });
    // the chips of every line (the helper paints them blue; the wasted lines are repainted red after each set())
    const chips = LINES.map(() => []);
    [...doc.el.children].forEach((c) => {
      if (parseFloat(c.style.height) !== 34) return;
      chips[Math.round((parseFloat(c.style.top) - 3 - 64) / 46)].push(c);
    });
    const wasteBox = ring(stage, {
      x: DOC.x + 8,
      y: DOC.y + 62 + 46,
      w: DOC.w - 16,
      h: (LINES.length - 1) * 46 + 4, // every line but the name
      r: 18,
      tone: "red",
    });

    // ---------- the six tables ----------
    const tables = NAMES.map((name, i) => D2.table(stage, { ...tabPos(i), w: TAB.w, name, rows: [] }));
    const ringsA = tables.map((tb) =>
      ring(stage, { x: tb.x - 5, y: tb.y - 5, w: tb.w + 10, h: tb.h + 10, r: 27, tone: "blue" }),
    );
    const ringB = ring(stage, {
      x: tables[0].x - 5,
      y: tables[0].y - 5,
      w: tables[0].w + 10,
      h: tables[0].h + 10,
      r: 27,
      tone: "green",
    });

    // ---------- the wires: one arrow into the document, a trunk with one stub per table ----------
    const blue = D2.tone("blue").c;
    const arrowOpt = { w: 6, head: 16 };
    const toDoc = [0, 1].map(() =>
      wires.appendChild(L5.arrow(WL, WIRE_Y, WL, DOC.y - 8, "blue", 1, { w: 6, head: 18 })),
    );
    const trunk = [0, 1].map(() =>
      wires.appendChild(
        V.s("line", {
          x1: TAB.trunk,
          y1: WIRE_Y,
          x2: TAB.trunk,
          y2: WIRE_Y,
          "stroke-width": 6,
          "stroke-linecap": "round",
          style: { stroke: blue },
        }),
      ),
    );
    const stubEnd = (i) => (i % 2 ? tabPos(i).x - 10 : tabPos(i).x + TAB.w + 10); // the ring is 5 px outside the table
    const stub = (i) =>
      wires.appendChild(L5.arrow(TAB.trunk + (i % 2 ? 2 : -2), stubY(i), stubEnd(i), stubY(i), "blue", 1, arrowOpt));
    const stubsA = NAMES.map((_, i) => stub(i));
    const stubB = stub(0);

    // ---------- the two KB meters ----------
    const meterDoc = meter(stage, { ...METER, ...METER.doc });
    const meterTab = meter(stage, { ...METER, ...METER.tab });
    // a green ping where each meter's sliver appears: the part of the load the page really needs is tiny
    const sliverDoc = ping(stage, { x: METER.doc.x - 4, y: METER.y - 4, h: METER.h + 8, tone: "green" });
    const sliverTab = ping(stage, { x: METER.tab.x - 4, y: METER.y - 4, h: METER.h + 8, tone: "green" });

    const setTrunk = (line, tip, o = 1) => {
      line.setAttribute("y2", f1(Math.max(WIRE_Y, tip)));
      V.show(line, tip > WIRE_Y + 1 ? o : 0);
    };

    return (t) => {
      const k = (a, d = 0.4) => ramp(t, a, a + d, E.lin);
      const inB = t >= T.swap;
      const drain = ramp(t, T.swap, T.swap + 0.35, E.lin); // part A empties away when the question changes
      const gone = 1 - ramp(t, T.swap, T.swap + 0.25, E.lin); // opacity of part A's wires and rings

      // ---- the definition of locality, with the document ----
      tagLoc.set({ k: k(T.doc, 0.4) });

      // ---- the need tag ----
      tagNeed.set({ text: inB ? NEED.name : NEED.all, k: k(T.need), s: 1 + 0.08 * flash(t, T.swap, T.swap + 0.4) });

      // ---- the document: its lines fill as the read lands ----
      const fa = LINES.map((_, i) =>
        Math.min(
          ramp(t, T.fillA + 0.07 * i, T.fillA + 0.07 * i + 0.25, E.lin),
          1 - ramp(t, T.swap + 0.04 * i, T.swap + 0.04 * i + 0.2, E.lin),
        ),
      );
      const fb = LINES.map((_, i) =>
        i === 0
          ? ramp(t, T.nameB, T.nameB + 0.25, E.lin)
          : ramp(t, T.wasteB + 0.08 * (i - 1), T.wasteB + 0.08 * (i - 1) + 0.25, E.lin),
      );
      const fill = LINES.map((_, i) => Math.max(fa[i], fb[i]));
      const nameK = k(T.nameB, 0.3);
      doc.set({
        k: k(T.doc, 0.5),
        fill,
        fillTone: "blue",
        hot: t >= T.nameB ? 0 : -1,
        hotTone: "blue",
        hotK: nameK,
      });
      if (t >= T.wasteB) {
        // the five lines the page does not need: red chips
        for (let i = 1; i < LINES.length; i++)
          chips[i].forEach((c, j) => {
            if (clamp(fill[i] * chips[i].length - j) < 0.5) return;
            setClass(c, "c-red");
            c.style.background = "var(--c)";
            c.style.borderColor = "var(--c-lip)";
          });
      }
      const breathe = (1 - Math.cos((2 * Math.PI * clamp(t - T.wasted - 0.4, 0, 99)) / 1.6)) / 2; // a slow pulse on the waste
      wasteBox.set(k(T.wasteB, 0.3), 1, 1 + 0.015 * breathe);

      // ---- the arrows into the document ----
      L5.drawOn(toDoc[0], ramp(t, T.wireA, T.wireA + 0.4, E.out));
      V.show(toDoc[0], gone);
      L5.drawOn(toDoc[1], ramp(t, T.wireB, T.wireB + 0.4, E.out));

      // ---- the tables: a stub, a ring and a count for each read ----
      tables.forEach((tb, i) => {
        const bump = inB ? (i === 0 ? flash(t, T.usersB, T.usersB + 0.3) : 0) : flash(t, hit(i), hit(i) + 0.3);
        tb.set({ k: D2.seq(t, T.tab, 0.06, 0.3, i), s: 1 + 0.05 * bump });
        ringsA[i].set(ramp(t, hit(i), hit(i) + 0.25, E.lin), gone);
        L5.drawOn(stubsA[i], ramp(t, hit(i) - STUB, hit(i), E.out));
        V.show(stubsA[i], gone);
      });
      ringB.set(ramp(t, T.usersB, T.usersB + 0.25, E.lin));
      L5.drawOn(stubB, ramp(t, T.usersB - STUB, T.usersB, E.out));
      // the trunk reaches table i's height just as its stub starts to draw
      let tipA = WIRE_Y + (stubY(0) - WIRE_Y) * ramp(t, T.trunkA, hit(0) - STUB, E.inOut);
      for (let i = 1; i < N; i++) tipA += (stubY(i) - stubY(i - 1)) * ramp(t, hit(i - 1) - STUB, hit(i) - STUB, E.lin);
      setTrunk(trunk[0], tipA, gone);
      setTrunk(trunk[1], WIRE_Y + (stubY(0) - WIRE_Y) * ramp(t, T.trunkB, T.usersB - STUB, E.inOut));

      // ---- the reads counters ----
      const arrived = NAMES.filter((_, i) => t >= hit(i)).length;
      const docReads = inB ? (t >= T.nameB ? LC.name.doc.reads : 0) : t >= T.oneA ? LC.all.doc.reads : 0;
      const tabReads = inB ? (t >= T.usersB ? LC.name.tables.reads : 0) : arrived;
      statDoc.set({
        text: String(docReads),
        tone: docReads ? "green" : "grey",
        k: k(T.stats),
        bump: 0.5 * (flash(t, T.oneA, T.oneA + 0.3) + flash(t, T.nameB, T.nameB + 0.3)), // a small pulse: it must not touch the arrow
      });
      statTab.set({
        text: String(tabReads),
        tone: tabReads ? (inB ? "green" : "orange") : "grey",
        k: k(T.stats + 0.1),
        bump:
          0.3 * (NAMES.reduce((s, _, i) => s + flash(t, hit(i), hit(i) + 0.3), 0) + flash(t, T.usersB, T.usersB + 0.3)), // keeps clear of the stage margin
      });

      // ---- the KB meters: green = what the page needs, red = what it wastes ----
      const redK = ramp(t, T.wasteB, T.wasteB + 0.5, E.inOut);
      const docGreen = Math.max(ramp(t, T.barA, T.barA + 0.6, E.inOut) * (1 - drain), SHARE * k(T.wasteB, 0.15));
      meterDoc.set({
        k: k(T.meters),
        segs: [[0, docGreen, "green"], t >= T.wasteB ? [SHARE, SHARE + (1 - SHARE) * redK, "red"] : null],
        text: inB ? (t >= T.wasted ? `${D2.kb(LC.wasted)} wasted` : LOADED(LC.name.doc.kb)) : LOADED(LC.all.doc.kb),
        textK: Math.max(k(T.labDocA, 0.3) * (1 - ramp(t, T.swap, T.swap + 0.2, E.lin)), k(T.labDocB, 0.3)),
        textTone: t < T.swap + 0.2 ? "green" : "red",
        textS: 1 + 0.08 * flash(t, T.wasted, T.wasted + 0.35),
      });
      sliverDoc.set(k(T.wasteB + 0.05, 0.8));
      const readShare = NAMES.reduce((s, _, i) => s + ramp(t, hit(i), hit(i) + 0.25, E.out), 0) / N; // a sixth per table read
      meterTab.set({
        k: k(T.meters + 0.1),
        segs: [[0, Math.max(readShare * (1 - drain), SHARE * ramp(t, T.usersB, T.usersB + 0.2, E.out)), "green"]],
        text: t >= T.swap + 0.2 ? LOADED(LC.name.tables.kb) : LOADED(LC.all.tables.kb), // part A's label fades out before the text changes
        textK: Math.max(k(T.labTabA, 0.3) * (1 - ramp(t, T.swap, T.swap + 0.2, E.lin)), k(T.labTabB, 0.3)),
        textTone: "green",
        onFill: t < T.swap + 0.2,
      });
      sliverTab.set(k(T.usersB, 0.8));
    };
  }

  V.scene({
    kicker: "LOCALITY",
    title: ["One document, one read:", "good and bad"],
    dur: 12.5,
    caps: [
      [0.5, 2.5, "The page wants the whole profile."],
      [2.6, 4.4, "One read from the document."],
      [4.5, 5.9, "Six from the tables."],
      [6.2, 8.0, "Now it wants only the name."],
      [8.4, 11.8, "A document loads whole: 20 KB for a sliver."],
    ],
    build,
  });
})();

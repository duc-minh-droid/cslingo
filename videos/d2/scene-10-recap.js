/* Lecture 2 (ds-2) · Data models and NoSQL, scene 10-recap: three rows, each a small pictogram and one bold line (bare scene).
   Story (local seconds): 0.1 title and Pebble, rows slide in at 0.8 / 1.9 / 3.0, each pictogram starts 0.4 s after its row
   (times below are pictogram time), 5.4 the call to action. EVERY PICTOGRAM PLAYS ONCE AND HOLDS ITS FINISHED FRAME (no loop,
   no fade, no reset), so for the last 2.5 seconds only Pebble's bob moves.
   Row 1 (blue): documents versus tables. Left, a document sticker (braces) whose three chips fill in one after another
          (0.45-1.3) and a green tick (1.4-1.9): one read, the tree stays together. Right, the first three profile tables
          (users, regions, industries) pop in (2.1-2.8), each with an orange key chip, and purple links draw from each to a
          purple join disc (2.5-3.1): shared data is joined by its key. No text on screen.
   Row 2 (purple): the graph and its hops. Four people (the walk Ana to Dee of D2.walk) and grey arrows between them; a blue
          walker hops from Ana to Ben, Cy and Dee (0.9-2.6): each arrow it crosses turns green, each person it reaches turns
          solid green, and one pip of the hop counter (the pill at the bottom right) fills green per hop. Three hops, the
          green path stays.
   Row 3 (green): pick the family by the question. The four family icons (D2.FAMILY_ORDER) pop in on grey tiles (0.1-0.9), a
          blue question bubble drops in above the third (1.1-1.5), the wide-column tile turns green and a green tick pops on
          it (1.7-2.3): the question picked its family.
   Every structure comes from the D2 helpers (D2.PROFILE, D2.walk, D2.FAMILY_ORDER, D2.WORKLOADS) and is asserted when the scene
   is built. D2.fam does not scale the document braces below size 100, so the icons are drawn at 100 and scaled whole. */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const { f1 } = D2.u;

  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const START = APPEAR.map((a) => a + 0.4); // a pictogram starts a little after its row has slid in
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // drawn at 340 x 140, shown 10% larger
  const NEXT = "Next: Workshop 2.W";

  // ---------- small shared pieces (all pure: they only set styles and attributes) ----------
  /** a rounded sticker: a lip under a face; paint() sets its look ("panel" = panel face with the tone's edge, "tint", "solid") */
  function sticker(parent, x, y, w, h, r) {
    const lip = V.s("rect", { x: f1(x), y: f1(y + 4), width: f1(w), height: f1(h), rx: f1(r) });
    const face = V.s("rect", { x: f1(x), y: f1(y), width: f1(w), height: f1(h), rx: f1(r), "stroke-width": 3 });
    const g = parent.appendChild(V.s("g", {}, lip, face));
    const paint = (name, mode = "panel") => {
      const t = D2.tone(name);
      const solid = mode === "solid";
      face.style.fill = solid ? t.c : mode === "tint" ? t.dim : "var(--panel)";
      face.style.stroke = solid ? t.lip : t.edge;
      lip.style.fill = solid ? t.lip : t.edge;
    };
    return { g, paint };
  }

  /** a round sticker (a person, a join, the walker); paint() works like the rectangle's */
  function disc(parent, cx, cy, r) {
    const lip = V.s("circle", { cx: f1(cx), cy: f1(cy + 4), r });
    const face = V.s("circle", { cx: f1(cx), cy: f1(cy), r, "stroke-width": 3 });
    const g = parent.appendChild(V.s("g", {}, lip, face));
    const paint = (name, mode = "panel") => {
      const t = D2.tone(name);
      const solid = mode === "solid";
      face.style.fill = solid ? t.c : mode === "tint" ? t.dim : "var(--panel)";
      face.style.stroke = solid ? t.lip : t.edge;
      lip.style.fill = solid ? t.lip : t.edge;
    };
    return { g, paint };
  }

  /** a small bar or chip (rect) in a tone: empty = tint with an edge, solid = filled */
  function chip(parent, x, y, w, h, name, solid) {
    const t = D2.tone(name);
    return parent.appendChild(
      V.s("rect", {
        x: f1(x),
        y: f1(y),
        width: f1(w),
        height: f1(h),
        rx: f1(Math.min(7, h / 2)),
        "stroke-width": 3,
        style: { fill: solid ? t.c : t.dim, stroke: solid ? t.lip : t.edge },
      }),
    );
  }

  /** a rect that fills in from its left end (k 0..1): the chip's solid layer */
  const fillIn = (el, w, k) => {
    el.setAttribute("width", f1(Math.max(0, (w - 1) * k)));
    V.show(el, k < 0.01 ? 0 : 1);
  };

  /** a round green sticker with a tick that draws on (k 0..1) and pops */
  function tickBadge(svg, x, y, r, size) {
    const green = D2.tone("green");
    const lip = V.s("circle", { cx: f1(x), cy: f1(y + 4), r, style: { fill: green.lip } });
    const disc = V.s("circle", {
      cx: f1(x),
      cy: f1(y),
      r,
      "stroke-width": 3,
      style: { fill: green.dim, stroke: green.edge },
    });
    const tick = L5.tick(x, y + 1, size, "green", { ink: true, w: 6 });
    const g = svg.appendChild(V.s("g", {}, lip, disc, tick));
    return (k) => {
      L5.drawOn(tick, ramp(k, 0.2, 1, E.lin));
      V.place(g, { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });
    };
  }

  /** a staggered pop-in of a group: scale, fade and a small rise */
  const popIn = (g, k, rise = 10, extra = 1) =>
    V.place(g, { y: -(1 - E.out(k)) * rise, s: (0.6 + 0.4 * E.pop(k)) * extra, o: clamp(k * 4) });

  // ---------- row 1: documents versus tables ----------
  function docVsTables(pic) {
    const FIELDS = D2.PROFILE.fields.slice(0, 3);
    D2.same(
      "recap row 1: the three fields (a document line each, a table each)",
      FIELDS.map((f) => [f.table, f.field, f.n]),
      [
        ["users", "name", 1],
        ["regions", "region", 1],
        ["industries", "industry", 1],
      ],
    );
    D2.same(
      "recap row 1: one read for a document, six places for the tables",
      [D2.PROFILE.document.lookups, D2.PROFILE.relational.lookups],
      [1, 6],
    );
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const grey = D2.tone("grey");

    // the dashed divider between the two ways
    const divider = svg.appendChild(
      V.s("line", {
        x1: 154,
        y1: 16,
        x2: 154,
        y2: 124,
        "stroke-width": 4,
        "stroke-linecap": "round",
        "stroke-dasharray": "1 11",
        style: { stroke: grey.edge },
      }),
    );

    // the document: braces, a title bar and one line per field, each a key bar and a chip that fills in
    const DOC = { x: 12, y: 6, w: 104, h: 128 };
    const doc = sticker(svg, DOC.x, DOC.y, DOC.w, DOC.h, 16);
    doc.paint("blue");
    const blue = D2.tone("blue");
    const braces = D2.icon.braces(40, 31, 30, "blue");
    const title = V.s("rect", { x: 62, y: 26, width: 28, height: 10, rx: 5, style: { fill: blue.edge } });
    const LINE_Y = FIELDS.map((_, i) => 64 + 26 * i);
    const lines = LINE_Y.map((cy) => {
      const key = V.s("rect", { x: 26, y: cy - 5, width: 26, height: 10, rx: 5, style: { fill: grey.edge } });
      const empty = chip(doc.g, 60, cy - 9, 40, 18, "blue", false);
      const full = chip(doc.g, 60, cy - 9, 40, 18, "blue", true);
      doc.g.append(key);
      return { empty, full };
    });
    doc.g.append(braces, title);
    const badge = tickBadge(svg, 114, 14, 17, 24);

    // the tables: each a grey sticker with an orange key chip, joined to one purple disc by purple links
    const JOIN = { x: 198, y: 70, r: 15 };
    const TB = { x: 238, w: 96, h: 34, ys: [8, 53, 98] };
    const violet = D2.tone("purple");
    const links = TB.ys.map((y) =>
      svg.appendChild(
        V.s("line", {
          x1: JOIN.x,
          y1: JOIN.y,
          x2: TB.x,
          y2: y + TB.h / 2,
          pathLength: 1,
          "stroke-width": 6,
          "stroke-linecap": "round",
          style: { stroke: violet.c },
        }),
      ),
    );
    const tables = TB.ys.map((y) => {
      const s = sticker(svg, TB.x, y, TB.w, TB.h, 11);
      s.paint("grey");
      chip(s.g, TB.x + 8, y + 9, 18, 16, "orange", true);
      chip(s.g, TB.x + 34, y + 9, 54, 16, "grey", false);
      return s.g;
    });
    const join = disc(svg, JOIN.x, JOIN.y, JOIN.r);
    join.paint("purple", "solid");

    return (t) => {
      const q = t - START[0];
      // the document, then its chips, then the tick
      popIn(doc.g, ramp(q, 0.1, 0.5, E.lin), 12);
      V.show(divider, ramp(q, 0.1, 0.5, E.lin));
      lines.forEach(({ empty, full }, i) => {
        const k = ramp(q, 0.45 + 0.25 * i, 0.45 + 0.25 * i + 0.35, E.lin);
        fillIn(full, 40, E.inOut(k));
        V.show(empty, 1);
      });
      badge(ramp(q, 1.4, 1.9, E.lin));
      // the tables, the join and its links
      tables.forEach((g, i) => popIn(g, ramp(q, 2.1 + 0.14 * i, 2.1 + 0.14 * i + 0.4, E.lin), 10));
      links.forEach((l, i) => {
        const k = ramp(q, 2.55 + 0.1 * i, 2.55 + 0.1 * i + 0.35, E.lin);
        l.style.strokeDasharray = `${clamp(k).toFixed(3)} 2`;
        V.show(l, k < 0.003 ? 0 : 1);
      });
      popIn(join.g, ramp(q, 2.5, 2.9, E.lin), 0, 1 + 0.14 * flash(q, 2.9, 3.25));
    };
  }

  // ---------- row 2: the graph and its hops ----------
  function graphWalk(pic) {
    const walk = D2.walk("Ana", D2.GRAPH.hops);
    const PEOPLE = ["Ana", ...walk.steps.map((s) => s.reached[0])];
    D2.same("recap row 2: the walk is the lesson's route Ana to Dee", PEOPLE, D2.GRAPH.path);
    D2.same(
      "recap row 2: the edges it crosses",
      walk.steps.map((s) => s.edges[0]),
      D2.pathKeys(D2.GRAPH.path),
    );
    D2.same("recap row 2: three hops", [PEOPLE.length - 1, walk.hops], [3, 3]);
    const POS = [
      [40, 98],
      [122, 42],
      [218, 98],
      [300, 42],
    ];
    const R = 24;
    const svg = L5.svg(pic, PIC.w, PIC.h);

    // the arrows run from border to border; each exists twice: grey underneath, green drawn on as the walker crosses it
    const ends = POS.slice(1).map((b, i) => {
      const a = POS[i];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const u = [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
      return { a: [a[0] + u[0] * (R + 4), a[1] + u[1] * (R + 4)], b: [b[0] - u[0] * (R + 5), b[1] - u[1] * (R + 5)] };
    });
    const arrow = (e, name) => svg.appendChild(L5.arrow(e.a[0], e.a[1], e.b[0], e.b[1], name, 1, { w: 6, head: 16 }));
    const greyArrows = ends.map((e) => arrow(e, "grey"));
    const greenArrows = ends.map((e) => arrow(e, "green"));

    // the people: a round sticker with a head and shoulders, grey until the walker reaches them
    const people = POS.map(([x, y]) => {
      const s = disc(svg, x, y, R);
      const off = s.g.appendChild(D2.icon.person(x, y + 1, 30, "grey"));
      const on = s.g.appendChild(D2.icon.person(x, y + 1, 30, "green", { col: "on" }));
      return { ...s, off, on };
    });

    // the walker: a small blue token that hops from person to person (under nothing, over the arrows)
    const blue = D2.tone("blue");
    const walker = svg.appendChild(
      V.s(
        "g",
        {},
        V.s("circle", { cx: 0, cy: 4, r: 10, style: { fill: blue.lip } }),
        V.s("circle", { cx: 0, cy: 0, r: 10, "stroke-width": 3, style: { fill: blue.c, stroke: blue.lip } }),
      ),
    );

    // the hop counter: one pip per hop in a small pill, each turns green when the walker lands
    const counter = sticker(svg, 256, 100, 82, 28, 14);
    counter.paint("grey");
    const pips = ends.map((_, i) => disc(svg, 276 + 21 * i, 114, 8));

    const T = { pop: 0.1, popStep: 0.08, arrows: 0.35, start: 0.65, depart: 0.9, hop: 0.5, pause: 0.1 };
    const departAt = (i) => T.depart + (T.hop + T.pause) * i;
    const arriveAt = (i) => departAt(i) + T.hop;
    const reachedAt = (i) => (i === 0 ? T.start : arriveAt(i - 1));

    return (t) => {
      const q = t - START[1];
      people.forEach((p, i) => {
        const k = ramp(q, T.pop + T.popStep * i, T.pop + T.popStep * i + 0.4, E.lin);
        const hit = q >= reachedAt(i);
        p.paint(hit ? "green" : "grey", hit ? "solid" : "panel");
        V.show(p.off, hit ? 0 : 1);
        V.show(p.on, hit ? 1 : 0);
        popIn(p.g, k, 12, 1 + 0.16 * flash(q, reachedAt(i), reachedAt(i) + 0.35));
      });
      ends.forEach((_, i) => {
        L5.drawOn(greyArrows[i], ramp(q, T.arrows + 0.1 * i, T.arrows + 0.1 * i + 0.3, E.lin));
        L5.drawOn(greenArrows[i], ramp(q, departAt(i), arriveAt(i), E.lin));
      });
      popIn(counter.g, ramp(q, T.arrows, T.arrows + 0.4, E.lin), 6);
      pips.forEach((p, i) => {
        const hit = q >= arriveAt(i);
        p.paint(hit ? "green" : "grey", hit ? "solid" : "panel");
        popIn(
          p.g,
          ramp(q, T.arrows + 0.1 * i, T.arrows + 0.1 * i + 0.3, E.lin),
          6,
          1 + 0.25 * flash(q, arriveAt(i), arriveAt(i) + 0.35),
        );
      });
      // the hop currently under way (none before the first or after the last: the path just holds)
      const hop = ends.findIndex((_, i) => q >= departAt(i) && q < arriveAt(i) + 0.05);
      if (hop < 0) return V.place(walker, { o: 0 });
      const k = clamp((q - departAt(hop)) / T.hop);
      const p = D2.lerp2(ends[hop].a, ends[hop].b, E.inOut(k));
      V.place(walker, {
        x: p.x,
        y: p.y,
        s: (0.6 + 0.4 * E.pop(ramp(k, 0, 0.2, E.lin))) * (1 - 0.5 * ramp(k, 0.85, 1, E.lin)),
        o: Math.min(ramp(k, 0, 0.1, E.lin), 1 - ramp(k, 0.9, 1, E.lin)),
      });
    };
  }

  // ---------- row 3: pick the family by the question ----------
  function pickFamily(pic) {
    const ORDER = D2.FAMILY_ORDER;
    const PICK = D2.WORKLOADS.find((w) => w.text === "Events with varying columns").family;
    const PI = ORDER.indexOf(PICK);
    D2.same(
      "recap row 3: four families, the question picks the wide-column one (third)",
      [ORDER.length, PICK, PI],
      [4, "wide", 2],
    );
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const [TW, TH, TY, X0, STEP] = [74, 74, 56, 9, 83];
    const ICON = 0.62; // the icons are drawn at their design size (100) and shrunk whole (D2.fam does not scale the document braces)

    const tiles = ORDER.map((kind, i) => {
      const x = X0 + STEP * i;
      const s = sticker(svg, x, TY, TW, TH, 16);
      const layer = (tone) => {
        const g = D2.fam(kind, 100, tone);
        g.setAttribute("transform", `translate(${f1(x + TW / 2)} ${f1(TY + TH / 2 + 3)}) scale(${ICON})`);
        return s.g.appendChild(g);
      };
      return { ...s, grey: layer("grey"), green: layer("green"), x };
    });

    // the question: a blue speech bubble with a drawn "?" and a tail pointing at the picked tile
    const blue = D2.tone("blue");
    const cx = tiles[PI].x + TW / 2;
    const bubble = svg.appendChild(
      V.s(
        "g",
        {},
        V.s("path", {
          d: `M ${f1(cx - 8)} 38 L ${f1(cx)} 51 L ${f1(cx + 8)} 38 Z`,
          "stroke-width": 3,
          "stroke-linejoin": "round",
          style: { fill: blue.c, stroke: blue.lip },
        }),
        V.s("rect", { x: f1(cx - 30), y: 8, width: 60, height: 34, rx: 17, style: { fill: blue.lip } }),
        V.s("rect", {
          x: f1(cx - 30),
          y: 4,
          width: 60,
          height: 34,
          rx: 17,
          "stroke-width": 3,
          style: { fill: blue.c, stroke: blue.lip },
        }),
        V.s("path", {
          d: `M ${f1(cx - 6)} 15 Q ${f1(cx - 6)} 8 ${f1(cx)} 8 Q ${f1(cx + 7)} 8 ${f1(cx + 7)} 15 Q ${f1(cx + 7)} 20 ${f1(cx)} 23 L ${f1(cx)} 26`,
          fill: "none",
          "stroke-width": 5,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: blue.on },
        }),
        V.s("circle", { cx: f1(cx), cy: 33, r: 3, style: { fill: blue.on } }),
      ),
    );
    const badge = tickBadge(svg, tiles[PI].x + TW, TY + 3, 15, 21);
    const T = { pop: 0.1, popStep: 0.12, ask: 1.1, pick: 1.7, tick: 1.8 };

    return (t) => {
      const q = t - START[2];
      tiles.forEach((tile, i) => {
        const picked = i === PI && q >= T.pick;
        tile.paint(picked ? "green" : "grey", picked ? "tint" : "panel");
        V.show(tile.grey, picked ? 0 : 1);
        V.show(tile.green, picked ? 1 : 0);
        const k = ramp(q, T.pop + T.popStep * i, T.pop + T.popStep * i + 0.4, E.lin);
        popIn(tile.g, k, 12, 1 + (i === PI ? 0.14 * flash(q, T.pick, T.pick + 0.35) : 0));
      });
      const b = ramp(q, T.ask, T.ask + 0.4, E.lin);
      V.place(bubble, { y: -(1 - E.out(b)) * 16, s: 0.6 + 0.4 * E.pop(b), o: clamp(b * 4) });
      badge(ramp(q, T.tick, T.tick + 0.5, E.lin));
    };
  }

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const head = V.h("div", {
        class: "v-title-line",
        text: "Remember",
        style: { position: "absolute", left: "72px", top: "108px", fontSize: "76px" },
      });
      // 30 px like the title card's kicker (the engine's .v-kicker is 24 px, below the 28 px minimum)
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP", style: { fontSize: "30px" } });
      const mascot = V.mascot("pebble", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["blue", "Tree or shared data?\nDocument or tables", docVsTables],
        ["purple", "Links are the data?\nUse a graph", graphWalk],
        ["green", "Four NoSQL families:\npick by the question", pickFamily],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "440px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "36px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: NEXT,
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 904, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
      });
      ctaBar.append(cta);
      stage.append(ctaBar);

      return (t) => {
        V.place(kicker, { y: (1 - ramp(t, 0.05, 0.45)) * 10, o: ramp(t, 0.05, 0.45) });
        V.place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
        const m = ramp(t, 0.2, 0.9, E.pop);
        V.place(mascot, {
          y: (1 - m) * 30 + 6 * Math.sin((2 * Math.PI * t) / 2.6),
          r: 3 * Math.sin((2 * Math.PI * t) / 3.2 + 1),
          s: 0.7 + 0.3 * m,
          o: ramp(t, 0.2, 0.5),
        });
        rows.forEach((r, i) => {
          const k = ramp(t, APPEAR[i], APPEAR[i] + 0.5);
          V.place(r.card, { y: (1 - k) * 36, o: k });
          const kl = ramp(t, APPEAR[i] + 0.15, APPEAR[i] + 0.65);
          V.place(r.label, { x: (1 - kl) * 24, o: kl });
          r.update(t);
        });
        const c = ramp(t, 5.4, 6.0, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();

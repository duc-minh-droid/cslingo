/* Lecture 5 (ds-5) · scene 8 (SECONDARY INDEXES, BY TERM): the same twelve cars, but now the index itself is split by term: index
   partition 1 holds the terms blue and ford, 2 holds green and kia, 3 holds mini and red. A search for "red" reads one index partition
   and then fetches the five cars from the partitions that hold them; but saving one new car (13, a blue mini) updates two index
   partitions as well as its own document partition: cheap reads, dearer writes (lesson 5.4). Every posting, partition and count comes
   from D5 (D5.postings, D5.idxPart, D5.search, D5.write, D5.NEWCAR), asserted on load. Colours: purple = the index partitions (the
   lookup table), blue = the search and the cars it finds, green = cheap (a search reads 1 partition), orange = attention (the write
   that updates 2 index partitions), grey = the document partitions at rest. Story (local seconds): 0.2 the index cards and the document
   cards pop; 3.6 the search "red" and an arrow to index 3 (blue ring, "search reads 1"); 5.2 the five ids fly to their cars; 7.0 car 13
   (a blue mini) is saved into Cars 1 and two small 13s fly to the "blue" and "mini" lines, which gain " 13"; "write updates 2" pops. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const S = D5.search("red");
  const NEWCAR = D5.NEWCAR;
  const WR = D5.write(NEWCAR);
  const TERMS = D5.TERMS;
  D5.same(
    "by-term scene: the index is split in three by term, a search for red reads index 3 only and fetches from partitions 1 and 3",
    [TERMS.map(D5.idxPart), S.idx, S.fetch],
    [[0, 0, 1, 1, 2, 2], 2, [0, 2]],
  );
  D5.same(
    "by-term scene: saving car 13 (blue mini) touches its document partition and two index partitions (by document: one)",
    [NEWCAR, WR],
    [[13, "blue", "mini"], { docPart: 0, idxParts: [0, 2], byDoc: 1, byTerm: 3 }],
  );
  D5.same(
    "by-term scene: the lines the new car joins are blue in index 1 and mini in index 3",
    [WR.idxParts.map((p) => TERMS.filter((t) => D5.idxPart(t) === p && [NEWCAR[1], NEWCAR[2]].includes(t))[0])],
    [["blue", "mini"]],
  );
  // the two lines of an index partition, as text: "blue: 2 5 8 11"
  const lineOf = (term, extra) => `${term}: ${[...D5.postings(term), ...(extra ? [NEWCAR[0]] : [])].join(" ")}`;
  const lines = (p) => TERMS.filter((t) => D5.idxPart(t) === p);

  const T = {
    pop: 0.2,
    pill: 3.6,
    arrow: 4.0,
    stat: 4.6,
    fetch: 5.2,
    fetchStep: 0.18,
    fetchDur: 0.7,
    ringsOff: 6.6,
    car: 7.0,
    carDur: 0.8,
    post: 8.0,
    postDur: 0.9,
    write: 9.2,
  };

  V.scene({
    kicker: "SECONDARY INDEXES",
    title: ["Split the index by term:", "one read, wider writes"],
    dur: 12,
    caps: [
      [0.6, 3.4, "Or split the index itself, by term."],
      [3.6, 6.6, "A search reads just one index partition."],
      [7.0, 10.0, `Save a ${NEWCAR[1]} ${NEWCAR[2]}: two index partitions change.`],
      [10.2, 11.9, "Cheap reads, dearer writes."],
    ],
    build(stage) {
      const ic = D5.cluster(stage, {
        x: 12,
        y: 76,
        n: 3,
        w: 288,
        gap: 24,
        cols: 1,
        rows: 1,
        cw: 250,
        ch: 44,
        h: 170,
        slots: false,
        icon: false,
        tone: "purple",
        names: ["Index 1", "Index 2", "Index 3"],
      });
      const dc = D5.cluster(stage, {
        x: 12,
        y: 340,
        n: 3,
        w: 288,
        gap: 24,
        cols: 5,
        rows: 1,
        cw: 48,
        ch: 44,
        cg: 6,
        slots: true,
        names: ["Cars 1", "Cars 2", "Cars 3"],
        icon: true,
      });
      const svg = L5.svg(stage);
      // the index lines: two per index partition
      const idxText = [0, 1, 2].map((p) =>
        lines(p).map((term, i) =>
          D5.text(stage, {
            x: ic.box(p).x + 20,
            y: ic.box(p).y + 62 + 50 * i,
            text: lineOf(term, false),
            tone: "purple",
          }),
        ),
      );
      const cars = D5.DOCS.map((ids, n) =>
        ids.map((id, j) => ({ id, n, j, chip: D5.chip(stage, { text: String(id), w: 48, h: 44, tone: "grey" }) })),
      ).flat();
      const pill = D5.tag(stage, { x: 568, y: 4, text: "red", tone: "blue", solid: true, icon: "search" });
      const link = D5.link(svg, { x: 640, y: 62 }, { x: ic.top(2).x, y: ic.top(2).y + 10 }, "blue");
      const found = S.ids.map((id) => D5.chip(stage, { text: String(id), w: 48, h: 44, tone: "blue", solid: true }));
      const car = D5.chip(stage, {
        text: `${NEWCAR[0]} ${NEWCAR[1]} ${NEWCAR[2]}`,
        w: 190,
        h: 48,
        tone: "blue",
        solid: true,
      });
      const carSmall = D5.chip(stage, { text: String(NEWCAR[0]), w: 48, h: 44, tone: "grey" });
      const posts = [0, 1].map(() =>
        D5.chip(stage, { text: String(NEWCAR[0]), w: 48, h: 44, tone: "orange", solid: true }),
      );
      const statRead = D5.stat(stage, { x: 12, y: 548, w: 440, h: 72, label: "search reads", tone: "green" });
      const statWrite = D5.stat(stage, { x: 484, y: 548, w: 440, h: 72, label: "write updates", tone: "orange" });
      const carSlot = (id) => dc.slot(D5.docPart(id), D5.DOCS[D5.docPart(id)].indexOf(id));
      const lineAt = (p, term) => ({ x: ic.box(p).x + 90, y: ic.box(p).y + 62 + 50 * lines(p).indexOf(term) + 14 });

      return (t) => {
        for (let n = 0; n < 3; n++) {
          const k = ramp(t, T.pop + 0.08 * n, T.pop + 0.08 * n + 0.5, E.lin);
          const asked =
            n === S.idx
              ? ramp(t, T.arrow + 0.4, T.arrow + 0.8, E.lin) * (1 - ramp(t, T.ringsOff, T.ringsOff + 0.4, E.lin))
              : 0;
          const written = WR.idxParts.includes(n) ? ramp(t, T.write, T.write + 0.5, E.lin) : 0;
          ic.set(n, { k, ring: written > 0 ? "orange" : "blue", ringK: Math.max(asked, written) });
          dc.set(n, { k: ramp(t, T.pop + 0.15 + 0.08 * n, T.pop + 0.65 + 0.08 * n, E.lin) });
          lines(n).forEach((term, i) => {
            const grown = WR.idxParts.includes(n) && [NEWCAR[1], NEWCAR[2]].includes(term) && t >= T.write;
            const lit = n === S.idx && term === "red" && t >= T.arrow + 0.4 && t < T.ringsOff + 0.4;
            idxText[n][i].set({ text: lineOf(term, grown), tone: lit ? "blue" : "purple", k });
          });
        }
        cars.forEach((c, i) => {
          const k = ramp(t, T.pop + 0.3 + 0.03 * i, T.pop + 0.8 + 0.03 * i, E.lin);
          const p = D5.appear(k);
          const pos = dc.slot(c.n, c.j);
          const hit =
            S.ids.includes(c.id) &&
            t >= T.fetch + T.fetchStep * S.ids.indexOf(c.id) + T.fetchDur &&
            t < T.ringsOff + 0.5;
          c.chip.set({ x: pos.x, y: pos.y, s: p.s, o: p.o, tone: hit ? "blue" : "grey", solid: hit });
        });
        pill.set({ k: ramp(t, T.pill, T.pill + 0.4, E.lin) });
        link(ramp(t, T.arrow, T.arrow + 0.5, E.lin), 1);
        statRead.set({
          text: String(1),
          k: ramp(t, T.stat, T.stat + 0.5, E.lin),
          bump: flash(t, T.stat, T.stat + 0.4),
        });
        // the five ids fly from the red line to their cars
        found.forEach((c, i) => {
          const s0 = T.fetch + T.fetchStep * i;
          const f = ramp(t, s0, s0 + T.fetchDur, E.lin);
          const pos = D5.fly(lineAt(S.idx, "red"), carSlot(S.ids[i]), E.inOut(f), { arc: 20 });
          c.set({
            x: pos.x,
            y: pos.y,
            o: f > 0 && f < 1 ? 1 : 0,
            s: f > 0 && f < 1 ? 1 : 0,
            tone: "blue",
            solid: true,
          });
        });
        // the new car is saved, then two small 13s update the two index lines it belongs to
        const kc = ramp(t, T.car, T.car + 0.4, E.lin);
        const cf = E.inOut(ramp(t, T.car + 0.3, T.car + T.carDur, E.lin));
        const cp = D5.fly({ x: 110, y: 500 }, dc.slot(WR.docPart, 4), cf, { arc: 0 });
        const cpop = D5.appear(kc);
        const swap = ramp(t, T.car + T.carDur - 0.25, T.car + T.carDur, E.lin); // the long label shrinks into its slot
        car.set({ x: cp.x, y: cp.y, s: cpop.s, o: cpop.o * (1 - swap), tone: "blue", solid: true });
        carSmall.set({
          x: dc.slot(WR.docPart, 4).x,
          y: dc.slot(WR.docPart, 4).y,
          s: 0.7 + 0.3 * E.pop(swap),
          o: swap,
          tone: "grey",
        });
        posts.forEach((c, i) => {
          const p = WR.idxParts[i];
          const term = [NEWCAR[1], NEWCAR[2]][i];
          const f = ramp(t, T.post + 0.1 * i, T.post + 0.1 * i + T.postDur, E.lin);
          const pos = D5.fly(dc.slot(WR.docPart, 4), lineAt(p, term), E.inOut(f), { arc: -20 });
          c.set({
            x: pos.x,
            y: pos.y,
            o: f > 0 && f < 1 ? 1 : 0,
            s: f > 0 && f < 1 ? 1 : 0,
            tone: "orange",
            solid: true,
          });
        });
        statWrite.set({
          text: String(WR.idxParts.length),
          k: ramp(t, T.write, T.write + 0.5, E.lin),
          bump: flash(t, T.write, T.write + 0.4),
        });
      };
    },
  });
})();

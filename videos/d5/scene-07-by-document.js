/* Lecture 5 (ds-5) · scene 7 (SECONDARY INDEXES, BY DOCUMENT): twelve used cars sit in three document partitions (car id mod 3); a
   secondary index lets you search by colour. With a LOCAL index each partition indexes only its own cars, so a search for "red"
   has to ask every partition (any of them may hold a red car) and gather the answers; a write touches only one partition
   (lesson 5.4). Every car, partition, local result and count comes from D5 (D5.CARS, D5.DOCS, D5.search, D5.carText), asserted on
   load. Colours: grey = the cars at rest, blue = the search and the matching cars (the data we ask about), purple = the index (the
   "own index" tags), red = expensive (asked 3 of 3). Story (local seconds): 0.2 the three partitions and their cars pop and each
   gets an "own index" tag; 3.4 the search "red" pops; 6.0 an arrow reaches every partition and rings them, "asked 3 of 3" pops; 7.0 the
   tags show what each local index found and the red cars light up (partition 2 has none); 8.8 the five red cars fly into the
   answer strip one after another. Hold to the end. */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- the data (asserted against the storyboard and checked again by a second rule) ----------
  const S = D5.search("red");
  D5.same(
    "by-document scene: red cars are 1 4 6 9 12, partition 2 has none, so all three partitions are asked",
    [S.ids, S.local, S.askedDoc],
    [[1, 4, 6, 9, 12], [[1, 4], [], [6, 9, 12]], 3],
  );
  D5.same(
    "by-document scene: three partitions of four cars (id mod 3), the red cars sit in partitions 1 and 3",
    [D5.DOCS.map((p) => p.length), S.fetch, S.ids.map(D5.docPart)],
    [
      [4, 4, 4],
      [0, 2],
      [0, 0, 2, 2, 2],
    ],
  );
  D5.same(
    "by-document scene: what each partition's own index finds is exactly the red cars it holds",
    D5.DOCS.map((ids, n) => ids.filter((id) => D5.CARS[id - 1][1] === "red")).map((a) => a.join()),
    S.local.map((a) => a.join()),
  );
  const localText = (n) => (S.local[n].length ? `red: ${S.local[n].join(", ")}` : "red: none");

  const T = {
    pop: 0.2,
    popStep: 0.04,
    own: 0.8,
    pill: 3.4,
    arrows: 6.0,
    stat: 7.0,
    local: 7.2,
    fly: 8.8,
    flyStep: 0.12,
    flyDur: 0.7,
  };

  V.scene({
    kicker: "SECONDARY INDEXES",
    title: ["Search by colour:", "ask every partition"],
    dur: 11.5,
    caps: [
      [0.6, 3.1, "Each partition indexes only its own cars."],
      [3.4, 5.6, "Search for red cars."],
      [6.0, 8.7, "Any partition may hold one, so ask all three."],
      [8.8, 11.1, "Gather the answers into one list."],
    ],
    build(stage) {
      const cl = D5.cluster(stage, {
        x: 12,
        y: 150,
        n: 3,
        w: 288,
        gap: 24,
        cols: 2,
        rows: 2,
        cw: 134,
        ch: 44,
        cg: 4,
        h: 246,
        names: ["Partition 1", "Partition 2", "Partition 3"],
      });
      const svg = L5.svg(stage);
      const cars = D5.DOCS.map((ids, n) =>
        ids.map((id, j) => ({ id, n, j, chip: D5.chip(stage, { text: D5.carText(id), w: 134, h: 44, tone: "grey" }) })),
      ).flat();
      const idxTags = [0, 1, 2].map((n) =>
        D5.tag(stage, { x: cl.box(n).x + 20, y: cl.box(n).y + 172, w: 248, text: "own index", tone: "purple" }),
      );
      const pill = D5.tag(stage, { x: 400, y: 20, text: "red", tone: "blue", solid: true, icon: "search" });
      const links = [0, 1, 2].map((n) =>
        D5.link(svg, { x: 468, y: 82 }, { x: cl.top(n).x, y: cl.top(n).y - 6 }, "blue"),
      );
      const answerTag = D5.tag(stage, { x: 12, y: 462, text: "answer", tone: "blue" });
      const answers = S.ids.map((id) => D5.chip(stage, { text: String(id), w: 56, h: 44, tone: "blue", solid: true }));
      const stat = D5.stat(stage, { x: 612, y: 452, w: 312, h: 72, label: "asked", tone: "red" });
      const carPos = (id) => {
        const n = D5.docPart(id);
        return cl.slot(n, D5.DOCS[n].indexOf(id));
      };

      return (t) => {
        for (let n = 0; n < 3; n++) {
          const k = ramp(t, T.pop + T.popStep * n * 4, T.pop + T.popStep * n * 4 + 0.5, E.lin);
          const ringK = ramp(t, T.arrows + 0.5, T.arrows + 0.9, E.lin);
          cl.set(n, { k, ring: "red", ringK });
          idxTags[n].set({
            k: ramp(t, T.own + 0.1 * n, T.own + 0.1 * n + 0.5, E.lin),
            text: t >= T.local ? localText(n) : "own index",
            tone: "purple",
            solid: t >= T.local && S.local[n].length > 0,
          });
          links[n](ramp(t, T.arrows + 0.1 * n, T.arrows + 0.1 * n + 0.5, E.lin), 1);
        }
        cars.forEach((c, i) => {
          const k = ramp(t, T.pop + T.popStep * i, T.pop + T.popStep * i + 0.5, E.lin);
          const p = D5.appear(k);
          const red = S.ids.includes(c.id) && t >= T.local;
          const pos = cl.slot(c.n, c.j);
          c.chip.set({
            x: pos.x,
            y: pos.y,
            s: p.s * (red ? 1 + 0.12 * flash(t, T.local, T.local + 0.4) : 1),
            o: p.o,
            tone: red ? "blue" : "grey",
            solid: red,
          });
        });
        pill.set({ k: ramp(t, T.pill, T.pill + 0.5, E.lin) });
        // the answers fly from their cars to the strip, in id order
        answerTag.set({ k: ramp(t, T.fly - 0.3, T.fly + 0.1, E.lin) });
        answers.forEach((c, i) => {
          const s0 = T.fly + T.flyStep * i;
          const f = ramp(t, s0, s0 + T.flyDur, E.lin);
          const pos = D5.fly(carPos(S.ids[i]), { x: 220 + 72 * i, y: 491 }, E.inOut(f), { arc: 20 });
          c.set({ x: pos.x, y: pos.y, o: f > 0 ? 1 : 0, s: f > 0 ? 1 : 0, tone: "blue", solid: true });
        });
        stat.set({
          text: `${S.askedDoc} of ${S.askedDoc}`,
          k: ramp(t, T.stat, T.stat + 0.5, E.lin),
          bump: flash(t, T.stat, T.stat + 0.4),
        });
      };
    },
  });
})();

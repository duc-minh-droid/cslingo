/* Lecture 6 · scene 03 (cap): two copies of the tickets left, a cut link, a sale that reaches only node A, and a read at node B
   that must either refuse (consistent, not available) or answer with its old value (available, stale). Every figure comes from
   D6.CAP (asserted in d6/common.js). */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const CAP = D6.CAP;
  const REFUSE = CAP.refuse;
  const ANSWER = CAP.answer;

  // the two sides of the choice: what the read at node B returns and which of the two properties survive
  const SIDES = [
    { x: 0, tag: "stay consistent", def: "consistent: never old", run: REFUSE, tone: "red", at: 8.6 },
    { x: 492, tag: "stay available", def: "available: always replies", run: ANSWER, tone: "orange", at: 10.8 },
  ];
  const PROPS = [
    { text: "consistent", key: "C", dx: 16 },
    { text: "available", key: "A", dx: 226 },
  ];
  const ROW = 428; // the centre line of disc, arrow and reply in each card
  // the sale arrives at 4.4; the whole picture is at rest from 12.0
  const T = { boxes: 0.3, cut: 2.4, sale: 4.4, count: 5.0, send: 5.3, old: 6.0, read: 7.0 };

  V.scene({
    kicker: "THE CAP THEOREM",
    title: ["A cut network", "forces a choice"],
    dur: 14,
    caps: [
      [0.5, 2.4, "Two copies hold the tickets left."],
      [2.9, 4.5, "The link between them is cut."],
      [5.0, 6.8, "A sale reaches only one copy."],
      [7.2, 8.9, "Node B is asked to read."],
      [9.2, 11.0, "Refuse: right, but not available."],
      [11.4, 13.3, "Answer: available, but stale."],
    ],
    build(stage) {
      // link first, so the nodes sit on top of it
      const link = D6.link(stage, { a: { x: 350, y: 105 }, b: { x: 586, y: 105 }, w: 8, gap: 84 });
      const nodeA = D6.box(stage, { x: 150, y: 20, w: 200, h: 170, name: "Node A", vfs: 60 });
      const nodeB = D6.box(stage, { x: 586, y: 20, w: 200, h: 170, name: "Node B", vfs: 60 });
      const part = D6.tag(stage, { x: 388, y: 140, text: "partition", tone: "red", solid: true });
      const units = [150, 586].map((x) => D6.label(stage, { x, y: 202, w: 200, text: "tickets left" }));
      const sell = D6.packet(stage, { tone: "blue", text: "sell 5" });
      const read = D6.packet(stage, { tone: "blue", text: "read" });
      const news = D6.packet(stage, { tone: "blue", text: String(CAP.latest) });

      // the two answers, one card each
      const sides = SIDES.map((sd) => {
        const card = D6.card(stage, { x: sd.x, y: 310, w: 444, h: 290, tone: "grey" });
        const tag = D6.tag(stage, { x: sd.x + 20, y: 326, text: sd.tag, tone: "purple" });
        const def = D6.label(stage, { x: sd.x, y: 266, w: 444, text: sd.def });
        const disc = D6.disc(stage, { x: sd.x + 80, y: ROW, size: 64, text: "B", tone: "grey" });
        const reply = D6.packet(stage, {
          tone: sd.tone,
          text: String(sd.run.reply),
          fs: 36,
        });
        const note = sd.run.stale
          ? D6.label(stage, { x: sd.x + 220, y: ROW + 40, w: 200, text: `latest: ${CAP.latest}` })
          : null;
        const chips = PROPS.map((p) => {
          const c = D6.chip(stage, { x: sd.x + p.dx, y: 506, w: 200, h: 64, text: p.text, fs: 28, radius: 20 });
          c.tile.style.paddingRight = "40px";
          return c;
        });
        return { sd, card, tag, def, disc, reply, note, chips };
      });

      // pictograms last, so they sit on top of the stickers
      const svg = L5.svg(stage);
      const gap = link.mid;
      const lost = L5.cross(gap.x, gap.y, 48, "red");
      svg.append(lost);
      sides.forEach((s) => {
        s.arrow = L5.arrow(s.sd.x + 124, ROW, s.sd.x + 214, ROW, "grey");
        s.marks = PROPS.map((p) => {
          const kept = s.sd.run[p.key];
          const cx = s.sd.x + p.dx + 176;
          return (kept ? L5.tick : L5.cross)(cx, 538, 30, kept ? "green" : "red", { w: 6 });
        });
        svg.append(s.arrow, ...s.marks);
      });

      return (t) => {
        // ---- the two copies ----
        const born = ramp(t, T.boxes, T.boxes + 0.8, E.lin);
        const counted = ramp(t, T.count, T.count + 0.35, E.lin);
        const aVal = D6.lerpN(CAP.start, CAP.latest, counted);
        const aBump = flash(t, T.count, T.count + 0.5);
        nodeA.set({ value: aVal, sub: "latest", tone: "green", k: born, s: 1 + 0.07 * aBump });
        const stale = t >= T.old + 0.2;
        const asked = ramp(t, T.read + 0.6, T.read + 1.0, E.lin);
        nodeB.set({
          value: CAP.start,
          sub: stale ? "old" : "latest",
          tone: stale ? "orange" : "green",
          k: born,
          s: 1 + 0.07 * flash(t, T.old, T.old + 0.5) + 0.05 * flash(t, T.read + 0.5, T.read + 1.1),
          mark: asked > 0 ? "qmark" : null,
          markK: asked,
        });
        const away = ramp(t, 7.8, 8.1, E.lin);
        units.forEach((u) => u.set({ k: ramp(t, 0.7, 1.1) * (1 - away), text: "tickets left" }));
        link.update({ k: ramp(t, 0.7, 1.2, E.inOut), cut: ramp(t, T.cut, T.cut + 0.8, E.inOut) });
        part.set({ k: ramp(t, 3.2, 3.6, E.lin) });

        // ---- the sale reaches node A only ----
        const slide = ramp(t, T.sale, T.sale + 0.6, E.inOut);
        const sinks = ramp(t, T.sale + 0.4, T.sale + 0.8, E.lin);
        sell.set({
          x: lerp(74, 190, slide),
          y: 105,
          s: D6.pop(ramp(t, 3.9, 4.3, E.lin)).s * (1 - 0.35 * sinks),
          o: D6.pop(ramp(t, 3.9, 4.3, E.lin)).o * (1 - sinks),
        });

        // ---- the news leaves A, stops at the gap and dies ----
        const crawl = ramp(t, T.send, T.send + 0.45, E.out);
        const dies = ramp(t, T.send + 0.5, T.send + 0.8, E.lin);
        const born2 = D6.pop(ramp(t, T.send, T.send + 0.2, E.lin));
        news.set({
          x: lerp(350, 394, crawl),
          y: 105,
          s: born2.s * (1 - dies),
          o: born2.o * (1 - dies),
        });
        const crossK = ramp(t, T.send + 0.5, T.send + 0.9, E.lin);
        L5.drawOn(lost, crossK);
        V.place(lost, { s: 0.7 + 0.3 * E.pop(crossK), o: crossK > 0 ? 1 : 0 });

        // ---- the read arrives at node B ----
        const comes = ramp(t, T.read, T.read + 0.6, E.inOut);
        const pops = D6.pop(ramp(t, 6.7, 7.0, E.lin));
        const ends = ramp(t, T.read + 0.4, T.read + 0.7, E.lin);
        read.set({ x: lerp(862, 780, comes), y: 105, s: pops.s * (1 - 0.35 * ends), o: pops.o * (1 - ends) });

        // ---- the two ways out ----
        sides.forEach((s) => {
          const a = s.sd.at;
          const k = ramp(t, a, a + 0.4, E.lin);
          s.card.set({ k });
          s.tag.set({ k: ramp(t, a + 0.1, a + 0.5, E.lin) });
          s.def.set({ k: ramp(t, a - 0.3, a + 0.1, E.lin) });
          s.disc.set({ k: ramp(t, a + 0.1, a + 0.5, E.lin) });
          const aK = ramp(t, a + 0.2, a + 0.5, E.lin);
          L5.drawOn(s.arrow, aK);
          V.place(s.arrow, { o: aK > 0 ? 1 : 0 });
          // the reply packet pops last
          const rep = D6.pop(ramp(t, a + 0.4, a + 0.8, E.lin));
          s.reply.set({ x: s.sd.x + 320, y: ROW, ...rep });
          if (s.note) s.note.set({ k: ramp(t, a + 0.4, a + 0.8, E.lin) });
          s.chips.forEach((c, j) => {
            const ck = ramp(t, a + 0.1 + 0.1 * j, a + 0.5 + 0.1 * j, E.lin);
            const p = PROPS[j];
            c.set({ text: p.text, tone: s.sd.run[p.key] ? "green" : "red", k: ck });
            const mk = ramp(t, a + 0.7 + 0.15 * j, a + 1.1 + 0.15 * j, E.lin);
            L5.drawOn(s.marks[j], mk);
            V.place(s.marks[j], { s: 0.6 + 0.4 * E.pop(mk), o: mk > 0 ? 1 : 0 });
          });
        });
      };
    },
  });
})();

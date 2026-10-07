/* Lecture 5 · Encodings, scene 02: a tour on a map is written as a chromosome of genes (and read back). */
(function () {
  const V = window.VID;
  const L5 = V.l5;
  const { ramp, ease: E, clamp } = V;
  const TOUR = "ADECB";

  V.scene({
    kicker: "ENCODING",
    title: ["A solution is written", "as a string of genes"],
    dur: 10,
    caps: [
      [0.4, 4.8, "A tour visits every city once."],
      [4.8, 9.4, "We write it as genes. Evolution changes the genes."],
    ],
    build(stage) {
      const map = L5.tourMap(stage, { x: 268, y: 24, w: 400, h: 300 });
      const row = L5.chromosome(stage, { x: 190, y: 462, genes: TOUR, size: 100, gap: 14, tone: "blue" });
      const svg = L5.svg(stage);

      const tag = (text, colour, cx, y, w) =>
        V.h("div", {
          class: `v-tag c-${colour}`,
          text,
          style: { left: `${cx - w / 2}px`, top: `${y}px`, width: `${w}px`, textAlign: "center" },
        });
      const geneTag = tag("what evolution changes: genes", "blue", 468, 588, 520);
      const writeLbl = tag("write", "purple", 196, 376, 110);
      const readLbl = tag("read", "purple", 742, 376, 110);
      stage.append(geneTag, writeLbl, readLbl);

      const write = L5.arrow(330, 340, 246, 454, "purple", 1, { bow: -22 });
      const read = L5.arrow(694, 454, 606, 340, "purple", 1, { bow: -22 });
      svg.append(write, read);
      const badge = L5.badge(stage, { x: 580, y: 2, w: 350, h: 68, valid: "every city once" });

      return (t) => {
        map.update({ order: TOUR, draw: ramp(t, 1, 4.5, E.lin), tone: "blue" });
        const n = TOUR.length;
        for (let i = 0; i < n; i++) {
          const p = ramp(t, 1.6 + 0.7 * i, 2.1 + 0.7 * i, E.lin);
          row.set(i, { s: E.pop(p), y: (1 - E.out(p)) * -26, o: clamp(p * 4) });
        }
        V.place(geneTag, { y: (1 - ramp(t, 5.4, 5.8)) * 8, o: ramp(t, 5.4, 5.8) });
        const [w, r] = [ramp(t, 6, 6.8, E.inOut), ramp(t, 7.1, 7.9, E.inOut)];
        L5.drawOn(write, w);
        L5.drawOn(read, r);
        V.place(writeLbl, { s: 0.8 + 0.2 * E.pop(ramp(t, 6, 6.5, E.lin)), o: clamp(ramp(t, 6, 6.3, E.lin) * 2) });
        V.place(readLbl, { s: 0.8 + 0.2 * E.pop(ramp(t, 7.1, 7.6, E.lin)), o: clamp(ramp(t, 7.1, 7.4, E.lin) * 2) });
        badge("valid", ramp(t, 8.6, 9.2, E.lin));
      };
    },
  });
})();

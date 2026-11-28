/* Lecture 14 (ds-14) · scene 6 (DICTIONARY OF KEYS AND COORDINATE LIST): keep the non-zeros with their positions (lesson
   14.4). The list is built from the slides' 4 x 4 matrix shown beside it (D14.M9, D14.F9.nz), so the picture and the list agree
   (the slides' separate (0,0) -> 1.0 example is not used). Colours: grey zeros, arrows and the header, blue the values, orange
   the positions (index numbers, keys, row and column of a tuple), green the value found, grey "0" for a missing key.
   Story (local seconds): 0.5 the matrix with orange row and column numbers, the four non-zeros pulse; 3.2 it slides left and
   the "dictionary of keys" list builds, one row every 0.5 s: orange key, grey arrow, blue value; 6.0 a magnifier hops onto key
   (3, 1), its value 6 turns green and the matrix cell gets a green ring; 7.4 a missing key (3, 2) is tried and returns a grey 0;
   8.8 the header becomes "coordinate list" and each row becomes a (row, column, value) tuple of three chips. Hold to 13. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const NZ = D14.F9.nz;
  const DOK = D14.DOK;
  const HIT = NZ.findIndex((e) => e[0] === DOK.hit[0] && e[1] === DOK.hit[1]);
  D14.same("keys scene: the looked-up key is the last entry", HIT, 3);
  const key = (r, c) => `(${r}, ${c})`;
  const CS = 76;
  const X0 = 281;
  const X1 = 12;
  const RY = (i) => 128 + 74 * i;
  const KX = 530;
  const VX = 700;

  V.scene({
    kicker: "DICTIONARY OF KEYS AND COORDINATE LIST",
    title: ["Keep the values,", "remember where they live"],
    dur: 13,
    caps: [
      [0.4, 3.0, "Store only the non-zeros, each with its position."],
      [3.2, 5.8, "Dictionary of keys: each (row, column) key maps to its value."],
      [6.0, 8.6, `Look up key ${key(...DOK.hit)}: ${DOK.get(...DOK.hit)}. A missing key means 0.`],
      [8.8, 12.7, "Coordinate list: a list of (row, column, value) tuples."],
    ],
    build(stage) {
      const g = D14.grid(stage, { x: X0, y: 110, M: D14.M9, cs: CS, gap: 8, fs: 34, idx: true });
      const notListed = D4.label(stage, { x: X0 + g.w / 2 + 23, y: 560, text: "anything not listed is 0", fs: 30 });
      const svg = D4.svg(stage);
      const head = D4.label(stage, { x: 450, y: 34, text: "dictionary of keys", fs: 32, anchor: "l" });
      const colHead = ["row", "col", "value"].map((text, i) =>
        D4.label(stage, { x: 486 + 82 * i, y: 82, text, fs: 28, tone: i < 2 ? "orange" : "blue" }),
      );
      const rows = NZ.map(([r, c, v], i) => {
        const k = D4.tag(stage, { x: KX, y: RY(i), text: key(r, c), tone: "orange", fs: 30 });
        const a = L5.arrow(KX + 72, RY(i), VX - 46, RY(i), "grey", 1, { w: 6, head: 18 });
        svg.append(a);
        const val = D4.chips(stage, { x: VX - 36, y: RY(i) - 28, n: 1, w: 72, h: 56, fs: 30, texts: [String(v)] });
        const tup = D4.chips(stage, {
          x: 450,
          y: RY(i) - 28,
          n: 3,
          w: 72,
          h: 56,
          gap: 10,
          fs: 30,
          texts: [r, c, v].map(String),
        });
        return { k, a, val, tup };
      });
      const missK = D4.tag(stage, { x: KX, y: 520, text: key(...DOK.miss), tone: "orange", fs: 30 });
      const missA = L5.arrow(KX + 72, 520, VX - 46, 520, "grey", 1, { w: 6, head: 18 });
      svg.append(missA);
      const missV = D4.chips(stage, { x: VX - 36, y: 492, n: 1, w: 72, h: 56, fs: 30, texts: ["0"] });
      const glass = D14.glass(70, "grey");
      svg.append(glass);
      const hitRing = D14.frame(stage, { tone: "green" });
      const missRing = D14.frame(stage, { tone: "grey", dash: true });

      return (t) => {
        const slide = ramp(t, 3.2, 3.8, E.inOut);
        const gx = lerp(X0, X1, slide);
        V.place(g.el, { x: gx - X0, o: ramp(t, 0.3, 0.6, E.lin) });
        g.idx(ramp(t, 0.6, 0.9, E.lin));
        g.all((r, c, v) => D14.cellSt(v, { s: v ? 1 + 0.15 * flash(t, 1.2, 1.7) + 0.15 * flash(t, 2.0, 2.5) : 1 }));
        notListed.set({ k: ramp(t, 2.0, 2.3, E.lin) * (1 - ramp(t, 3.0, 3.2, E.lin)) });
        const morph = ramp(t, 8.8, 9.3, E.lin);
        head.set({
          text: t < 9.05 ? "dictionary of keys" : "coordinate list",
          k: ramp(t, 3.2, 3.5, E.lin) * (t < 9.05 ? 1 - ramp(t, 8.8, 9.05, E.lin) : ramp(t, 9.05, 9.3, E.lin)),
        });
        colHead.forEach((h, i) => h.set({ k: D14.seq(t, 9.2, 0.1, 0.3, i) }));
        const kHit = ramp(t, 6.6, 6.9, E.lin);
        rows.forEach((row, i) => {
          const k = D14.seq(t, 3.4, 0.5, 0.35, i) * (1 - morph);
          row.k.set({ k, s: 1 + (i === HIT ? 0.1 * flash(t, 6.4, 6.9) : 0) });
          V.show(row.a, k);
          L5.drawOn(row.a, D14.seq(t, 3.5, 0.5, 0.3, i));
          const green = i === HIT && kHit > 0;
          row.val.set(0, {
            tone: green ? "green" : "blue",
            solid: true,
            o: k,
            s: 1 + (i === HIT ? 0.15 * flash(t, 6.6, 7.1) : 0),
          });
          const kt = D14.seq(t, 9.1, 0.15, 0.35, i);
          row.tup.all((j) => ({ tone: j < 2 ? "orange" : "blue", solid: j === 2, o: kt, s: 0.85 + 0.15 * E.pop(kt) }));
        });
        const kMiss = ramp(t, 7.4, 7.7, E.lin) * (1 - morph);
        missK.set({ k: kMiss });
        V.show(missA, kMiss);
        L5.drawOn(missA, ramp(t, 7.6, 7.9, E.lin));
        missV.set(0, { tone: "grey", o: ramp(t, 7.9, 8.1, E.lin) * (1 - morph) });
        // the magnifier: in at 6.0 onto the key, hops to the missing key at 7.3, leaves with the morph
        const hop = ramp(t, 7.2, 7.6, E.inOut);
        const gxy = { x: KX - 90, y: lerp(RY(HIT), 520, hop) - 40 * Math.sin(Math.PI * hop) };
        glass.setAttribute("transform", `translate(${gxy.x.toFixed(1)} ${gxy.y.toFixed(1)})`);
        V.show(glass, ramp(t, 6.0, 6.3, E.lin) * (1 - morph));
        const cHit = { x: gx + g.ox + DOK.hit[1] * (CS + 8) - 6, y: 110 + g.oy + DOK.hit[0] * (CS + 8) - 6 };
        hitRing.set({ x: cHit.x, y: cHit.y, w: CS + 12, h: CS + 12, k: kHit * (1 - morph) });
        missRing.set({
          x: cHit.x + CS + 8,
          y: cHit.y,
          w: CS + 12,
          h: CS + 12,
          k: ramp(t, 7.9, 8.2, E.lin) * (1 - morph),
        });
      };
    },
  });
})();

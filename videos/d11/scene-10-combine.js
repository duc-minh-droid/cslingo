/* Lecture 11 (ds-11) · scene 10 (COMBINE): the combiner runs on each mapper's own output and sends, per cluster, the SUM of
   its samples and their COUNT (lesson 11.3 step 5): 7 pairs become 4 records. The reducer can then get the true mean of
   cluster 1, (20 + 14) ÷ (2 + 1) = 11.33; averaging the two local means (10 and 14) would give 12, because a mean forgets how
   many points it had. Every figure comes from D11.MR (asserted on load).
   Colours: grey = the mapper cards; blue = cluster 0, orange = cluster 1 (pairs and records); purple = the record counter
   (what crosses the network); green = the right answer and its tick; red = the local-means answer, its cross and the means.
   Story (local seconds): 0.2-0.6 the cards pop; 0.5-1.4 the seven pair chips pop (stagger 0.1); 1.6-2.4 each group slides
   together and shrinks while its record pops (2.0-2.4), both mappers at once; 2.5 the counter '4 records instead of 7';
   4.2 orange rings on the two cluster-1 records; 4.4 the green row, 4.7 its tick; 6.6 the red row and the two local means
   under the cluster-1 records; 7.0 the cross; 7.4 the 'sum 14, count 1' record flashes. Hold to 11. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const MR = D11.MR;
  const fm = D11.fm;
  const CT = ["blue", "orange"];
  const c1 = MR.comb.map((m) => m.find((r) => r.k === 1));
  D11.same(
    "combine scene: cluster 1 records, 4 of 7, wrong 12",
    [c1.map((r) => [r.sum, r.n]), MR.records, MR.pairs, MR.wrong],
    [
      [
        [20, 2],
        [14, 1],
      ],
      4,
      7,
      12,
    ],
  );
  D11.close("combine scene: the true mean", (c1[0].sum + c1[1].sum) / (c1[0].n + c1[1].n), MR.truth, 0.01);
  const pair = (e) => `⟨${e[0]}, ${e[1]}⟩`;
  const recText = (r) => `sum ${r.sum}, count ${r.n}`;
  const RIGHT = `sums: (${c1[0].sum} + ${c1[1].sum}) ÷ (${c1[0].n} + ${c1[1].n}) = ${fm(MR.truth)}`;
  const LOCAL = MR.means.map((m) => fm(m[1]));
  const WRONG = `local means: (${LOCAL[0]} + ${LOCAL[1]}) ÷ ${LOCAL.length} = ${fm(MR.wrong)}`;
  const CARD_Y = [12, 200];
  const CARD_H = 170;
  const GX = [380, 720]; // group centres (cluster 0, cluster 1)
  const ROW = 16; // pairs and records sit this far above the card's middle (room for the local means below)
  const RW = 252; // record chip width

  V.scene({
    kicker: "COMBINE",
    title: ["Send sums and counts,", "not every point"],
    dur: 11,
    caps: [
      [0.4, 2.2, `The ${MR.pairs} pairs from the map step, grouped by cluster.`],
      [2.6, 4.6, `The combiner adds each group up: a sum and a count. ${MR.records} records instead of ${MR.pairs}.`],
      [4.8, 6.6, `Cluster 1: ${RIGHT.replace("sums: ", "")}, the true mean.`],
      [7, 10.7, `Local means would give ${fm(MR.wrong)}: a mean forgets how many points it had.`],
    ],
    build(stage) {
      D4.svg(stage); // wire layer first (holds nothing under the cards here)
      let order = 0;
      const mappers = CARD_Y.map((cy, m) => {
        const card = D4.card(stage, { x: 12, y: cy, w: 912, h: CARD_H, plain: true });
        const name = D4.label(stage, { x: 36, y: cy + CARD_H / 2, text: `Mapper ${m + 1}`, fs: 30, anchor: "l" });
        const midY = cy + CARD_H / 2 - ROW;
        const groups = [0, 1].map((k) => {
          const items = MR.emits[m].filter((e) => e[0] === k);
          const xs = items.map((_, j) => GX[k] + (j - (items.length - 1) / 2) * 130);
          const chips = items.map((e, j) => ({
            row: D4.chips(stage, { x: xs[j] - 60, y: midY - 28, n: 1, w: 120, h: 56, fs: 28, texts: [pair(e)] }),
            dx: GX[k] - xs[j],
            i: order++,
          }));
          const rec = MR.comb[m].find((r) => r.k === k);
          const recRow = D4.chips(stage, {
            x: GX[k] - RW / 2,
            y: midY - 28,
            n: 1,
            w: RW,
            h: 56,
            fs: 28,
            texts: [recText(rec)],
          });
          return { k, chips, recRow };
        });
        const mean = D4.label(stage, { x: GX[1], y: cy + CARD_H - 34, text: `mean ${LOCAL[m]}`, tone: "red", fs: 28 });
        return { card, name, groups, mean };
      });
      const counter = D4.tag(stage, {
        x: 468,
        y: 420,
        text: `${MR.records} records instead of ${MR.pairs}`,
        tone: "purple",
        solid: true,
        fs: 30,
      });
      const good = D4.tag(stage, { x: 420, y: 500, text: RIGHT, tone: "green", solid: true, fs: 30 });
      const bad = D4.tag(stage, { x: 420, y: 590, text: WRONG, tone: "red", solid: true, fs: 30 });
      const fx = D4.svg(stage);
      const tick = fx.appendChild(L5.tick(760, 500, 56, "green"));
      const cross = fx.appendChild(L5.cross(760, 590, 56, "red"));

      return (t) => {
        const sq = ramp(t, 1.6, 2.4, E.inOut);
        const kr = ramp(t, 2.0, 2.4);
        mappers.forEach((M, m) => {
          const kc = ramp(t, 0.2, 0.6, E.out);
          M.card.set({ k: kc });
          M.name.set({ k: kc });
          M.groups.forEach((G) => {
            G.chips.forEach((c) => {
              const kp = ramp(t, 0.5 + 0.1 * c.i, 0.8 + 0.1 * c.i);
              c.row.set(0, {
                tone: CT[G.k],
                solid: true,
                x: c.dx * sq,
                s: (0.6 + 0.4 * E.pop(kp)) * (1 - 0.4 * sq),
                o: clamp(kp * 3) * (1 - ramp(t, 2.0, 2.4)),
              });
            });
            const ring = G.k === 1;
            const forgot = m === 1 && G.k === 1;
            G.recRow.set(0, {
              tone: CT[G.k],
              solid: true,
              o: clamp(kr * 3),
              s: (0.6 + 0.4 * E.pop(kr)) * (1 + (forgot ? 0.15 * flash(t, 7.4, 8.0) : 0)),
              ring: ring ? "orange" : undefined,
              ringK: ring ? ramp(t, 4.2, 4.6) : 0,
            });
          });
          M.mean.set({ k: ramp(t, 6.6, 7.0, E.out) });
        });
        counter.set({ k: ramp(t, 2.5, 2.9) });
        good.set({ k: ramp(t, 4.4, 4.8) });
        L5.drawOn(tick, ramp(t, 4.7, 5.1, E.out));
        bad.set({ k: ramp(t, 6.6, 7.0) });
        L5.drawOn(cross, ramp(t, 7.0, 7.4, E.out));
      };
    },
  });
})();

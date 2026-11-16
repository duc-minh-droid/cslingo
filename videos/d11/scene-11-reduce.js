/* Lecture 11 (ds-11) · scene 11 (REDUCE): the reducer adds up the sums and counts of all the mappers, computes each cluster's
   new centre and tests convergence (lesson 11.3 step 6). The centres moved (2 -> 2.5, 9 -> 11.33), so they go back to the
   mappers and round 2 runs Map, Combine, Reduce again: no sample changes cluster, the centres stay, the test says converged
   and the reducer outputs 2.5 and 11.33. The loop strip on top shows which phase runs. Figures from D11.MR (asserted on load).
   Colours: grey = the reducer, the strip, the mappers, the number line; blue = cluster 0, orange = cluster 1 (records, samples,
   centres, results); purple = the centres travelling back (return arrow and packets); green = converged, the output, the tick.
   Story (local seconds): 0.2-0.6 strip, records, reducer and line pop ('Reduce' solid); 0.8-1.8 the four records fly into
   the reducer (stagger 0.2); 2.0 / 2.3 the two result tags; 2.6-3.4 the centres glide to 2.5 and 11.33 (a dashed ghost stays
   at the old place); 3.8 'Converged?' solid, 4.0 'centres moved'; 4.2 'Map' solid, the return arrow draws (4.2-5.0), the
   mapper tags pop and two purple packets '2.5, 11.33' fly to them (4.4-5.0). Round 2: 5.4 the samples flash (same clusters),
   5.6 'no point switched'; 6.0 'Combine', 6.4 'Reduce' (result tags bump); 7.2 'Converged?' green; 7.4 'converged',
   7.6 the output centres, 7.8 the tick. Hold to 10. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const MR = D11.MR;
  const fm = D11.fm;
  const CT = ["blue", "orange"];
  D11.same(
    "reduce scene: sums, counts, round 2 unchanged",
    [MR.red.map((r) => [r.sum, r.n]), MR.iter2.same, MR.iter2.next],
    [
      [
        [10, 4],
        [34, 3],
      ],
      true,
      MR.next,
    ],
  );
  const recs = [0, 1].flatMap((k) => MR.comb.flatMap((m) => m.filter((r) => r.k === k)));
  const resText = (r) => `${r.sum} ÷ ${r.n} = ${fm(r.c)}`;
  const PH = [
    ["Map", 110],
    ["Combine", 330],
    ["Reduce", 560],
    ["Converged?", 800],
  ];
  // which phase runs at time t (index into PH)
  const phase = (t) => (t < 3.8 ? 2 : t < 4.2 ? 3 : t < 6.0 ? 0 : t < 6.4 ? 1 : t < 7.2 ? 2 : 3);
  const LINE_Y = 540;

  V.scene({
    kicker: "REDUCE",
    title: ["Add up, move the centres,", "test, repeat"],
    dur: 10,
    caps: [
      [0.4, 2.2, `The reducer adds up the ${MR.records} records.`],
      [2.4, 4, `New centres: ${resText(MR.red[0])} and ${resText(MR.red[1])}.`],
      [4.2, 5.8, "The centres moved, so they go back to the mappers."],
      [6, 7.6, "Next round: no point changes cluster."],
      [7.8, 9.7, "The reducer's test says converged: done."],
    ],
    build(stage) {
      const svg = D4.svg(stage); // wire layer: strip arrows, the return arrow and the ghost centres lie under the cards
      const G = D4.tone("grey");
      const arrows = PH.slice(0, 3).map(([a], i) => {
        const x1 = PH[i][1] + D4.tagW(a, 30) / 2 + 10;
        const x2 = PH[i + 1][1] - D4.tagW(PH[i + 1][0], 30) / 2 - 10;
        return svg.appendChild(L5.arrow(x1, 44, x2, 44, "grey", 1, { w: 5, head: 16 }));
      });
      const back = svg.appendChild(L5.arrow(800, 80, 110, 80, "purple", 1, { w: 5, head: 18, bow: 26 }));
      const tags = PH.map(([text, x]) => D4.tag(stage, { x, y: 44, text, fs: 30 }));

      const nl = D11.numline(stage, { x: 40, y: LINE_Y, w: 856, lo: 0, hi: 15, ticks: [0, 5, 10, 15] });
      const ghosts = MR.centres.map(() =>
        svg.appendChild(
          V.s("path", {
            fill: "none",
            stroke: G.c,
            "stroke-width": 3,
            "stroke-dasharray": "6 5",
            "stroke-linejoin": "round",
          }),
        ),
      );
      ghosts.forEach((g, k) => {
        const cx = nl.X(MR.centres[k]);
        const tip = LINE_Y - 34;
        g.setAttribute("d", `M${cx} ${tip}L${cx - 18} ${tip - 28.8}L${cx + 18} ${tip - 28.8}Z`);
      });
      const red = D4.node(stage, { x: 330, y: 140, w: 300, h: 250, name: "Reducer", icon: "server", layout: "slots" });
      const b = red.body;
      const results = MR.red.map((r, k) =>
        D4.tag(stage, {
          x: b.x + b.w / 2,
          y: b.y + b.h * (k ? 0.72 : 0.28),
          text: resText(r),
          tone: CT[r.k],
          solid: true,
          fs: 30,
        }),
      );
      const recTags = recs.map((r, i) =>
        D4.tag(stage, { x: 150, y: 170 + 60 * i, text: `sum ${r.sum}, count ${r.n}`, tone: CT[r.k], solid: true }),
      );
      const flyers = recs.map((r) => D4.tag(stage, { text: `sum ${r.sum}, count ${r.n}`, tone: CT[r.k], solid: true }));
      const mapTags = [0, 1].map((m) => D4.tag(stage, { x: 150, y: 200 + 120 * m, text: `Mapper ${m + 1}`, fs: 30 }));
      const packets = [0, 1].map(() =>
        D4.packet(stage, { text: MR.next.map((c) => fm(c)).join(", "), tone: "purple", fs: 28 }),
      );
      const moved = D4.tag(stage, { x: 780, y: 200, text: "centres moved", fs: 30 });
      const same = D4.tag(stage, { x: 780, y: 200, text: "no point switched", fs: 30 });
      const conv = D4.tag(stage, { x: 780, y: 200, text: "converged", tone: "green", solid: true, fs: 30 });
      const outs = MR.next.map((c, k) =>
        D4.tag(stage, { x: 780, y: 270 + 66 * k, text: `c${k} = ${fm(c)}`, tone: CT[k], solid: true, fs: 30 }),
      );
      const fx = D4.svg(stage);
      const tick = fx.appendChild(L5.tick(780, 410, 50, "green"));
      const MID = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      const samples = MR.mappers.flatMap((ps, m) => ps.map((v, i) => ({ v, k: MR.emits[m][i][0] })));

      return (t) => {
        const kIn = ramp(t, 0.2, 0.6, E.out);
        const ph = phase(t);
        tags.forEach((tg, i) => {
          const on = i === ph && t >= 0.2;
          const done = i === 3 && t >= 7.2;
          tg.set({
            k: kIn,
            solid: on,
            tone: done ? "green" : "grey",
            s: 1 + 0.12 * (done ? flash(t, 7.2, 7.7) : 0),
          });
        });
        arrows.forEach((a) => V.show(a, kIn));
        const kb = ramp(t, 4.2, 5.0, E.lin);
        L5.drawOn(back, kb);
        V.show(back, kb > 0 ? 1 : 0);
        red.set({ k: kIn });
        recTags.forEach((tg, i) => {
          const a = 0.8 + 0.2 * i;
          tg.set({ k: kIn, o: t < a ? 1 : 0 });
          D11.fly(flyers[i], { x: 150, y: 170 + 60 * i }, MID, ramp(t, a, a + 0.6, E.inOut));
        });
        const bump = flash(t, 6.4, 6.9);
        results.forEach((tg, k) => tg.set({ k: ramp(t, 2.0 + 0.3 * k, 2.4 + 0.3 * k), s: 1 + 0.12 * bump }));
        const glide = ramp(t, 2.6, 3.4, E.inOut);
        ghosts.forEach((g) => V.show(g, glide > 0 ? 0.9 : 0));
        const flash2 = flash(t, 5.4, 5.9);
        nl.set({
          k: kIn,
          dots: samples.map((p) => ({ v: p.v, tone: CT[p.k], s: 1 + 0.25 * flash2 })),
          centres: MR.centres.map((c, k) => ({
            v: lerp(c, MR.next[k], glide),
            tone: CT[k],
            text: `c${k}`,
            k: kIn,
            s: 1 + 0.2 * flash(t, 7.6, 8.1),
          })),
        });
        moved.set({ k: ramp(t, 4.0, 4.3), o: 1 - ramp(t, 5.2, 5.4) });
        same.set({ k: ramp(t, 5.6, 5.9), o: 1 - ramp(t, 7.1, 7.3) });
        const km = ramp(t, 4.2, 4.5);
        mapTags.forEach((tg, m) => {
          tg.set({ k: km, solid: false });
          D11.fly(packets[m], MID, { x: 150, y: 200 + 120 * m }, ramp(t, 4.4 + 0.1 * m, 5.0 + 0.1 * m, E.inOut));
        });
        conv.set({ k: ramp(t, 7.4, 7.8) });
        outs.forEach((tg, k) => tg.set({ k: ramp(t, 7.6 + 0.1 * k, 8.0 + 0.1 * k) }));
        L5.drawOn(tick, ramp(t, 7.8, 8.2, E.out));
      };
    },
  });
})();

/* Lecture 11 (ds-11) · scene 9 (MAP): the assignment step of k-means split over two MAPPERS (lesson 11.3 steps 3-4). Each mapper
   gets a copy of the centres (a purple broadcast), then, at the same time, measures every one of its samples against both
   centres and emits the pair ⟨index of the nearest centre, sample⟩. Every figure comes from D11.MR (asserted on load).
   Colours: grey = the mappers, the number lines and unassigned samples; purple = the centres travelling and the pair counter;
   blue = cluster 0 (c0 = 2), orange = cluster 1 (c1 = 9).
   Story (local seconds): 0.2-0.6 the two mapper panels pop with their grey samples; 0.4 the header 'centres c0 = 2, c1 = 9';
   0.8-1.6 two purple packets '2, 9' fly down to the mappers; 1.6 the centre triangles pop on both lines. Sample i of each
   mapper is handled at 2.2 + 0.8 i (both mappers in parallel): its distance span draws, 0.3 s later the dot takes its cluster
   tone, 0.45 s later its pair chip pops. Sample 8 (3.8) shows both distances (6 to c0, 1 to c1) until 6.0; its chip ⟨1, 8⟩
   gets an orange ring at 4.4. 5.6 the purple '7 pairs' counter; 6.4 all seven chips flash. Hold to 10. */
(function () {
  const V = window.VID;
  const D11 = V.d11;
  const D4 = V.d4;
  const { ramp, flash, clamp, ease: E } = V;
  const MR = D11.MR;
  const CT = ["blue", "orange"];
  const d8 = MR.dist[0][2];
  D11.same("map scene: centres, sample 8's distances, 7 pairs", [MR.centres, d8, MR.pairs], [[2, 9], [6, 1], 7]);
  const pair = (e) => `⟨${e[0]}, ${e[1]}⟩`;
  const PANEL_Y = [96, 370];
  const sAt = (i) => 2.2 + 0.8 * i;
  const FOCUS = { m: 0, i: 2 }; // sample 8: both distances are shown

  V.scene({
    kicker: "MAP",
    title: ["Each mapper finds", "the nearest centre"],
    dur: 10,
    caps: [
      [0.4, 2, `Two mappers get a copy of the centres, ${MR.centres[0]} and ${MR.centres[1]}.`],
      [2.2, 4.2, "Each sample joins its nearest centre."],
      [
        4.4,
        6.2,
        `Sample ${MR.mappers[0][2]}: ${d8[0]} from c0, ${d8[1]} from c1, so it emits ${pair(MR.emits[0][2])}.`,
      ],
      [6.4, 9.7, `${MR.pairs} pairs go out: the key is the cluster, the value the sample.`],
    ],
    build(stage) {
      D4.svg(stage); // the wire layer (empty here: the packets fly freely), under the cards
      const panels = PANEL_Y.map((py, m) => {
        const card = D4.card(stage, { x: 12, y: py, w: 912, h: 250, plain: true });
        const nl = D11.numline(stage, {
          x: 30,
          y: py + 130,
          w: 600,
          lo: 0,
          hi: 15,
          ticks: [0, 5, 10, 15],
          labels: false,
        });
        const name = D4.label(stage, { x: 660, y: py + 40, text: `Mapper ${m + 1}`, fs: 30, anchor: "l" });
        const grid = [0, 1].map((r) =>
          D4.chips(stage, { x: 660, y: py + 90 + r * 70, n: 2, w: 116, h: 56, gap: 8, fs: 28, texts: ["", ""] }),
        );
        return { py, card, nl, name, grid, samples: MR.mappers[m], emits: MR.emits[m], dist: MR.dist[m] };
      });
      const head = D4.label(stage, { x: 70, y: 44, text: "centres", fs: 30 });
      const cTags = MR.centres.map((c, k) =>
        D4.tag(stage, { x: 220 + 150 * k, y: 44, text: `c${k} = ${c}`, tone: CT[k], solid: true, fs: 30 }),
      );
      const counter = D4.tag(stage, { x: 760, y: 44, text: `${MR.pairs} pairs`, tone: "purple", solid: true, fs: 30 });
      const packets = panels.map(() => D4.packet(stage, { text: MR.centres.join(", "), tone: "purple", fs: 30 }));
      const FROM = { x: 300, y: 70 };

      return (t) => {
        const kc = ramp(t, 0.4, 0.8, E.out);
        head.set({ k: kc });
        cTags.forEach((tg, k) => tg.set({ k: ramp(t, 0.45 + 0.1 * k, 0.85 + 0.1 * k) }));
        const fl = flash(t, 6.4, 6.9);
        panels.forEach((P, m) => {
          const kp = ramp(t, 0.2, 0.6, E.out);
          P.card.set({ k: kp });
          P.name.set({ k: kp });
          D11.fly(packets[m], FROM, { x: P.nl.X(5.5), y: P.py + 60 }, ramp(t, 0.8, 1.6, E.inOut), { bow: m ? 0 : 40 });
          const kTri = ramp(t, 1.6, 1.9);
          const dots = [];
          const spans = [];
          P.samples.forEach((v, i) => {
            const s0 = sAt(i);
            const [k, val] = P.emits[i];
            const kd = E.pop(D4.seq(t, 0.3, 0.05, 0.3, i));
            const on = t >= s0 + 0.3;
            const bump = 1 + 0.35 * flash(t, s0 + 0.3, s0 + 0.7);
            dots.push({ v, tone: on ? CT[k] : "grey", r: 19, s: kd * bump });
            const focus = m === FOCUS.m && i === FOCUS.i;
            const hold = focus ? 6.0 : s0 + 1.1;
            const o = 1 - ramp(t, hold, hold + 0.3);
            if (t < s0 || o <= 0) return;
            const draw = ramp(t, s0, s0 + 0.3, E.lin);
            if (focus) {
              spans.push({
                a: val,
                b: MR.centres[0],
                tone: "grey",
                dash: true,
                dy: 36,
                text: `${P.dist[i][0]}`,
                k: draw,
                o,
              });
              spans.push({ a: val, b: MR.centres[1], tone: "orange", dy: 76, text: `${P.dist[i][1]}`, k: draw, o });
            } else spans.push({ a: val, b: MR.centres[k], tone: CT[k], dy: 36, text: `${P.dist[i][k]}`, k: draw, o });
          });
          P.nl.set({
            k: kp,
            dots,
            spans,
            centres: MR.centres.map((c, k) => ({ v: c, tone: CT[k], text: `c${k}`, k: kTri })),
          });
          [0, 1, 2, 3].forEach((i) => {
            const chip = P.grid[i >> 1];
            const j = i & 1;
            const e = P.emits[i];
            if (!e) return chip.set(j, { o: 0 });
            const kk = ramp(t, sAt(i) + 0.45, sAt(i) + 0.75);
            const focus = m === FOCUS.m && i === FOCUS.i;
            chip.set(j, {
              text: pair(e),
              tone: CT[e[0]],
              solid: true,
              o: clamp(kk * 3),
              s: (0.6 + 0.4 * E.pop(kk)) * (1 + 0.15 * fl),
              ring: focus ? "orange" : undefined,
              ringK: focus ? ramp(t, 4.4, 4.8) : 0,
            });
          });
        });
        counter.set({ k: ramp(t, 5.6, 6.0), s: 1 + 0.12 * fl });
      };
    },
  });
})();

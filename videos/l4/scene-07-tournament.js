/* Lecture 4 · Tournament selection: draw t at random, the fittest wins; bigger t means tougher competition. */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const FIT = L4.FIT_TOURN; // [3, 8, 5, 1]
  const DRAWS = [0, 2]; // the lesson example: #1 and #3 are drawn, #3 wins
  const WIN = DRAWS.reduce((a, b) => (FIT[b] > FIT[a] ? b : a));
  const BEST = FIT.indexOf(Math.max(...FIT));
  const PROBS = [1, 2, 3, 4].map((t) => L4.tournProbs(FIT, t));
  // cross-check the closed form by brute force over every ordered draw of t tiles
  PROBS.forEach((p, ti) => {
    const wins = FIT.map(() => 0);
    let total = 0;
    const walk = (picked) => {
      if (picked.length === ti + 1) {
        total++;
        wins[picked.reduce((a, b) => (FIT[b] > FIT[a] ? b : a))]++;
        return;
      }
      FIT.forEach((_, i) => walk([...picked, i]));
    };
    walk([]);
    p.forEach((v, i) => {
      if (Math.abs(v - wins[i] / total) > 1e-9) throw new Error("tournament probability mismatch");
    });
  });
  const [TX, TY, TS, GAP] = [174, 110, 120, 36];
  const BASE = 520;
  const LEN = 160;
  const PCT = 0.7; // bar length LEN stands for 70%
  const STOPS = [
    [5.8, 6.4],
    [7.4, 8.0],
    [9.0, 9.6],
  ];

  V.scene({
    kicker: "TOURNAMENT",
    title: ["Tournament: draw t,", "the best wins"],
    dur: 11,
    caps: [
      [0.9, 3.6, "Draw two at random. The better one wins."],
      [3.8, 5.2, "The best was not even drawn."],
      [5.2, 7.6, "A bigger t means tougher competition."],
      [7.8, 10.5, "The best wins more often as t grows."],
    ],
    build(stage) {
      const row = L4.tiles(stage, { x: TX, y: TY, vals: FIT, w: TS, h: TS, gap: GAP, font: 64, tone: "grey" });
      const labels = FIT.map((_, i) =>
        V.h("div", {
          class: "v-text",
          text: `#${i + 1}`,
          style: {
            left: `${TX + i * (TS + GAP)}px`,
            top: "244px",
            width: `${TS}px`,
            textAlign: "center",
            fontSize: "28px",
            fontWeight: "900",
            color: "var(--ink)",
          },
        }),
      );
      stage.append(...labels);
      const bars = FIT.map((_, i) =>
        L4.bar(stage, { x: TX + i * (TS + GAP) + (TS - 90) / 2, y: BASE, len: LEN, thick: 90, dir: "v" }),
      );
      const tags = [
        L4.tag(stage, { x: row.mid(WIN).x, y: 290, text: "parent", tone: "blue", solid: true, anchor: "c" }),
        L4.tag(stage, { x: row.mid(BEST).x, y: 346, text: "not drawn", tone: "grey", solid: true, anchor: "c" }),
      ];
      const chance = L4.tag(stage, { x: 468, y: 284, text: "chance to be picked", tone: "green", anchor: "c" });
      const knob = L4.knob(stage, { x: 250, y: 580, w: 440, stops: [1, 2, 3, 4], pillX: 100, tone: "green" });
      const svg = L5.svg(stage);
      const crossG = L5.cross(0, 0, 64, "red");
      const tickG = L5.tick(0, 0, 64, "green", { ink: true });
      const cm = { x: row.mid(DRAWS[0]).x + 64, y: row.mid(DRAWS[0]).y - 72 };
      const tm = { x: row.mid(WIN).x + 64, y: row.mid(WIN).y - 72 };
      const crossP = V.s("g", {}, crossG);
      const tickP = V.s("g", {}, tickG);

      const dice = DRAWS.map((_, n) => V.s("g", {}, L5.dice(0, 0, 56, { face: FIT[DRAWS[n]], tone: "orange" })));
      svg.append(crossP, tickP, ...dice);
      const diceWin = [
        [1.5, 2.1],
        [2.3, 2.9],
      ];
      return (t) => {
        const pop = ramp(t, 0.5, 1.3, E.back);
        const gone = ramp(t, 5.0, 5.4);
        const orangeAt = (i) => DRAWS.includes(i) && t >= diceWin[DRAWS.indexOf(i)][1] - 0.1 && t < 5.0;
        const compare = ramp(t, 3.2, 3.8, E.inOut);
        row.all((i) => {
          const o = ramp(t, 0.5 + i * 0.1, 1.1 + i * 0.1, E.back);
          let tone = "grey";
          let s = 0.7 + 0.3 * o;
          let solid = false;
          let op = 1;
          if (t < 5.0) {
            if (orangeAt(i)) tone = "orange";
            if (i === WIN && compare > 0.5) [tone, solid, s] = ["blue", true, 1 + 0.12 * flash(t, 3.2, 3.9)];
            if (i === DRAWS[0] && compare > 0.5) [tone, solid, op] = ["grey", false, 0.55];
          }
          return { tone, solid, s: pop > 0 ? s : 0.7, o: Math.min(1, o * 2) * op, y: (1 - Math.min(1, o)) * 14 };
        });
        labels.forEach((l, i) => {
          const o = ramp(t, 0.6 + i * 0.1, 1.1 + i * 0.1);
          V.place(l, { o });
        });
        // dice hop over the tiles they draw, then disappear
        dice.forEach((d, n) => {
          const [a, b] = diceWin[n];
          const k = ramp(t, a, b, E.inOut);
          const m = row.mid(DRAWS[n]);
          const fromX = n ? m.x + 80 : m.x - 200;
          const hop = Math.sin(Math.PI * k) * -18;
          const show = ramp(t, a - 0.2, a) * (1 - ramp(t, 5.0, 5.4));
          V.place(d, { x: fromX + (m.x - fromX) * k, y: 60 + hop, o: show });
        });
        // cross and tick for the comparison
        V.place(crossP, { x: cm.x, y: cm.y, s: 0.6 + 0.4 * compare, o: compare * (1 - gone) });
        L5.drawOn(crossG, ramp(t, 3.3, 3.8));
        V.place(tickP, { x: tm.x, y: tm.y, s: 0.6 + 0.4 * compare, o: compare * (1 - gone) });
        L5.drawOn(tickG, ramp(t, 3.4, 3.9));
        tags[0].set({ s: 0.6 + 0.4 * ramp(t, 3.7, 4.1, E.back), o: ramp(t, 3.7, 4.0) * (1 - gone) });
        tags[1].set({ s: 0.6 + 0.4 * ramp(t, 4.0, 4.4, E.back), o: ramp(t, 4.0, 4.3) * (1 - gone) });
        // phase 2: knob and bars
        let v = 1;
        STOPS.forEach(([a, b], i) => {
          v += ramp(t, a, b, E.inOut) * (i + 2 - (i + 1));
        });
        const lo = Math.min(3, Math.floor(v - 1 + 1e-9));
        const p = L4.mix(PROBS[lo], PROBS[Math.min(3, lo + 1)], v - 1 - lo);
        const on = ramp(t, 5.0, 5.6, E.back);
        chance.set({ s: 0.7 + 0.3 * ramp(t, 5.4, 5.9, E.back), o: ramp(t, 5.4, 5.8) });
        knob.set({ v, text: `t = ${Math.round(v)}`, o: on });
        bars.forEach((b, i) =>
          b.set({
            k: (p[i] / PCT) * ramp(t, 5.0, 5.6),
            tone: "green",
            o: ramp(t, 5.0 + i * 0.08, 5.4 + i * 0.08),
            text: L4.pct(p[i]),
          }),
        );
      };
    },
  });
})();

/* Lecture 5 · Encodings, scene 03-mutation: one random gene change turns ADECB into ACECB, which is not a tour. */
(function () {
  const V = window.VID;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const BEFORE = "ADECB";
  const AFTER = L5.setAt(BEFORE, 1, "C"); // ACECB
  const DUPS = L5.dupsOf(AFTER); // ["C"]
  const MISS = L5.missingOf(AFTER); // ["D"]
  // the two arrows that run C -> E -> C: the route doubles back
  const EDGE = [...AFTER].map((c, i) => ([c, AFTER[(i + 1) % 5]].sort().join("") === "CE" ? "red" : "blue"));
  const GENE = 1;
  const FLIP = [2.5, 3.3]; // the gene turns over
  const BREAK = (FLIP[0] + FLIP[1]) / 2; // the second gene turns into C: from here the chromosome is not a tour

  V.scene({
    kicker: "MUTATION",
    title: ["Random mutation", "can break a tour"],
    dur: 11,
    caps: [
      [0.4, 3.9, "Mutation: pick a gene, give it a random new value."],
      [4, 10.5, "Now C is visited twice and D is never visited."],
    ],
    build(stage) {
      const map = L5.tourMap(stage, { x: 50, y: 84, w: 440, h: 330 });
      const row = L5.chromosome(stage, { x: 180, y: 436, genes: BEFORE, tone: "blue" });
      const badge = L5.badge(stage, { x: 600, y: 190 });
      const svg = L5.svg(stage);
      const mid = row.mid(GENE);
      const ring = V.h("div", {
        style: {
          position: "absolute",
          left: `${row.left + row.pos(GENE) - 10}px`,
          top: `${row.top - 10}px`,
          width: `${row.size + 20 - 6}px`,
          height: `${row.size + 20 - 6}px`,
          border: "6px solid var(--blue)",
          borderRadius: "30px",
        },
      });
      stage.append(ring);
      const dice = L5.dice(0, 0, 66, { face: 5, tone: "blue" });
      const diceG = V.s("g", {}, dice);
      svg.append(diceG);
      const tag = V.h("div", {
        class: "v-tag solid c-blue",
        text: "random new value",
        style: { left: `${mid.x + 62}px`, top: "566px", height: "52px", padding: "0 18px", fontSize: "28px" },
      });
      stage.append(tag);
      return (t) => {
        const k = ramp(t, FLIP[0], FLIP[1], E.inOut);
        const ringK = t < 3.4 ? ramp(t, 1, 1.5) : ramp(t, 4.6, 5.3);
        // the old route cross-fades into the new one (arrows both tours share stay put)
        const mix = ramp(t, 3.5, 4.5, E.inOut);
        map.update({
          order: BEFORE,
          order2: AFTER,
          mix,
          tone: "blue",
          edgeTones2: EDGE,
          hi: t < 3.4 ? [BEFORE[GENE]] : [],
          hiTone: "blue",
          dup2: DUPS,
          miss2: MISS,
          ringK,
          pulse: flash(t, 5.7, 6.7),
          phase: t * 0.25,
        });
        // chromosome: the flip, then both C tiles go red
        const bad = ramp(t, 3.3, 3.6);
        row.all((i) => {
          if (i === GENE) return {};
          if (AFTER[i] === "C") return { tone: bad > 0.5 ? "red" : "blue", s: 1 + 0.06 * flash(t, 3.3, 3.8) };
          return {};
        });
        row.flip(GENE, k, { from: "D", to: "C", tone: "blue", toTone: "red", hop: 26 });
        // ring, dice and tag around the chosen gene
        const on = ramp(t, 1, 1.5, E.back) * (1 - ramp(t, 3.7, 4.0));
        V.place(ring, { s: 0.8 + 0.2 * on, o: Math.min(1, on * 3) * (1 - ramp(t, 3.7, 4.0)) });
        const roll = ramp(t, 1.5, 2.5, E.lin);
        const faces = [5, 2, 4, 1, 6, 3, 5];
        const f = faces[Math.min(6, Math.floor(roll * 7))];
        diceG.replaceChildren(L5.dice(0, 0, 66, { face: f, tone: "blue" }));
        V.place(diceG, {
          x: mid.x,
          y: 594 + -6 * Math.abs(Math.sin(roll * 18)) * (roll > 0 && roll < 1 ? 1 : 0),
          s: 0.6 + 0.4 * on,
          r: roll > 0 && roll < 1 ? Math.sin(roll * 22) * 14 : 0,
          o: Math.min(1, on * 3),
        });
        V.place(tag, { o: Math.min(1, on * 3), s: 0.85 + 0.15 * on });
        badge(t < BREAK ? "valid" : "invalid", t < BREAK ? ramp(t, 0.0, 0.01) : ramp(t, BREAK, BREAK + 0.7, E.pop));
      };
    },
  });
})();

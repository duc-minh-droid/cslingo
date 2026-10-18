/* Lecture 8 video, scene 4: score every road. How an ant weighs its roads at one town (lesson 8.2's worked example,
   alpha = beta = 1): score = trail x closeness (1 over the distance), a visited (tabu) town scores zero however strong its
   trail, the scores are added, and each score's share of the total is the chance of taking that road. Every number comes
   from L8.HUB (the lesson's rule, run and asserted in l8/common.js) and is asserted again here.
   Story (local seconds): 0.2-1.3 the ant, the four roads (thickness = trail) and the four village tags, an empty dashed
   'score' column waits; 1.4-2.3 TRAIL header and chips (each road swells as its chip pops); 2.6-3.6 CLOSENESS header and
   chips, 3.7-5.0 each village tag and its 1/d chip light up together; 5.2-7.1 SCORE: times and equals signs, the score chips
   fill the dashed slots; 7.7-8.5 TABU: Dale's tag and road turn red and its score flips from 2 to 0; 9.3-10.8 the three
   scores are added up in a sum under the table (0.5 + 1 + 1 = 2.5, one term every 0.35 s); 10.8 CHANCE header, 10.9-11.7 each
   chance chip pops as the fraction score / total (0.5/2.5, 1/2.5, 1/2.5, 0/2.5), 11.7-12.9 each flips to its percentage. */
VID.scene({
  kicker: "THE CHOICE",
  title: ["Score every road:", "trail times closeness"],
  dur: 13.7,
  caps: [
    [0.8, 2.6, "Each road gets a score."],
    [3.0, 5.2, "Closeness (heuristic) is 1 over distance."],
    [5.5, 7.5, "Score: trail times closeness."],
    [7.8, 9.4, "A visited town scores zero."],
    [10.8, 13.4, "Each score's share of the total is its chance."],
  ],
  build(stage, V) {
    const L8 = V.l8;
    const L5 = V.l5;
    const { ramp, flash, clamp, lerp, ease: E } = V;

    // ---- the data: lesson 8.2's worked example (computed and asserted in l8/common.js), asserted again here
    const H = L8.HUB;
    const rows = H.rows;
    const num = (x) => String(+x.toFixed(2));
    L8.same(H.total, 2.5, "scene 4: total of the scores");
    L8.same(
      rows.map((r) => L8.pct(r.p)),
      [20, 40, 40, 0],
      "scene 4: chances in %",
    );
    L8.same(
      rows.map((r) => num(r.score)),
      ["0.5", "1", "1", "0"],
      "scene 4: scores",
    );
    L8.same(num(rows[3].would), "2", "scene 4: the score Dale would have had");
    L8.same(
      rows.map((r) => r.tabu === true),
      [false, false, false, true],
      "scene 4: only Dale is tabu",
    );
    rows.forEach((r) => L8.same(r.eta * r.d, 1, `scene 4: closeness of ${r.name} is 1 over its distance`));
    // the sum under the table: the scores that count (a tabu village adds nothing) add up to the total
    const terms = rows.filter((r) => r.score > 0).map((r) => r.score);
    L8.same(terms, [0.5, 1, 1], "scene 4: the terms of the sum");
    L8.same(
      terms.reduce((a, b) => a + b, 0),
      H.total,
      "scene 4: the sum ends on the total",
    );
    // each chance is its score over the total (shown first as that fraction)
    rows.forEach((r) => L8.same(r.score / H.total, r.p, `scene 4: ${r.name}'s chance is its score over the total`));

    // ---- timeline (local seconds)
    const T = {
      ant: 0.2,
      names: 0.4, // four village tags, 0.15 s apart
      scoreHead: 0.8, // the 'score' header and its dashed slots wait for the numbers
      slots: 0.9,
      trailHead: 1.4,
      trails: 1.5, // four chips, 0.15 s apart
      closeHead: 2.6,
      close: 2.8,
      pairs: 3.7, // a village tag and its 1/d chip light up together, 0.3 s apart
      scoreFlash: 5.2,
      times: 5.3,
      equals: 5.7,
      scores: 5.9, // four chips, 0.25 s apart
      tabu: 7.7,
      flip: [7.9, 8.5],
      add: 9.3, // each score is added to the sum, 0.35 s apart (the equals sign and the total follow the last one)
      chanceHead: 10.8,
      chances: 10.9, // four chips, 0.15 s apart, each first showing score / total ...
      toPct: 11.7, // ... then flipping to its percentage, 0.15 s apart, 0.5 s each
    };
    const Y = (i) => 130 + 100 * i;
    const FAN = { x0: 96, y0: 280, x1: 126 };

    // ---- the ant and the four roads that fan out of its town (thickness shows each road's trail)
    const svg = L5.svg(stage);
    const fan = rows.map(() =>
      svg.appendChild(
        V.s("line", {
          x1: FAN.x0,
          y1: FAN.y0,
          x2: FAN.x0,
          y2: FAN.y0,
          "stroke-linecap": "round",
          style: { stroke: "var(--blue)" },
        }),
      ),
    );
    const ant = svg.appendChild(L8.ant(56, 280, 78));

    // ---- column headers
    const heads = {
      trail: L8.tag(stage, { x: 341, y: 16, text: "trail", tone: "blue" }),
      close: L8.tag(stage, { x: 453, y: 16, text: "closeness", tone: "purple" }),
      score: L8.tag(stage, { x: 645, y: 16, text: "score", tone: "grey" }),
      chance: L8.tag(stage, { x: 774, y: 16, text: "chance", tone: "orange" }),
    };
    const where = L8.tag(stage, { x: 20, y: 16, text: "ant at one town", tone: "grey" });

    // ---- the four rows
    const names = rows.map((r, i) =>
      L8.tag(stage, { x: 130, y: Y(i) - 28, text: `${r.name} · ${r.d} km`, tone: "grey" }),
    );
    const tabuTag = L8.tag(stage, { x: 130, y: Y(3) + 38, text: "tabu", tone: "red", solid: true });
    const mk = (x, w, text, tone, fs = 40) =>
      rows.map((r, i) => L8.chip(stage, { x, y: Y(i) - 38, w, h: 76, text: text(r), tone, fs }));
    const trails = mk(350, 80, (r) => r.tau, "blue");
    const closes = mk(486, 104, (r) => `1/${r.d}`, "purple", 38);
    const slots = mk(646, 110, () => "", "grey"); // the dashed places the scores will fill
    const scores = mk(646, 110, (r) => num(r.would), "grey");
    const chances = rows.map((r, i) =>
      L8.chip(stage, { x: 768, y: Y(i) - 38, w: 142, h: 76, text: "", tone: "orange", fs: 32 }),
    );
    const fraction = (r) => `${num(r.score)}/${num(H.total)}`;

    // ---- the sum under the table: 0.5 + 1 + 1 = 2.5 (numbers are chips, the signs are drawn)
    const SY = 574;
    const sumTag = L8.tag(stage, { x: 318, y: SY - 31, text: "total", tone: "grey" });
    const SUMX = [
      { x: 440, w: 84 },
      { x: 584, w: 60 },
      { x: 704, w: 60 },
    ];
    const sumChips = terms.map((v, i) =>
      L8.chip(stage, { x: SUMX[i].x, y: SY - 32, w: SUMX[i].w, h: 64, text: num(v), tone: "grey", fs: 38, radius: 20 }),
    );
    const sumTotal = L8.chip(stage, {
      x: 822,
      y: SY - 32,
      w: 90,
      h: 64,
      text: num(H.total),
      tone: "grey",
      fs: 38,
      radius: 20,
    });

    // ---- signs: x between trail and closeness, = between closeness and score
    const top = L5.svg(stage);
    const times = rows.map((_, i) => top.appendChild(L8.mark("times", 458, Y(i), 40, "purple")));
    const equals = rows.map((_, i) => top.appendChild(L8.mark("equals", 618, Y(i), 40, "grey")));
    const plusSigns = [556, 676].map((x) => top.appendChild(L8.mark("plus", x, SY, 30, "grey")));
    const sumEq = top.appendChild(L8.mark("equals", 796, SY, 30, "grey"));

    return (t) => {
      // ---- ant and roads
      const antK = ramp(t, T.ant, T.ant + 0.6, E.lin);
      V.place(ant, { s: 0.5 + 0.5 * E.pop(antK), o: clamp(antK * 3) });
      rows.forEach((r, i) => {
        const k = ramp(t, T.ant + 0.08 * i, T.ant + 0.08 * i + 0.5, E.out);
        const line = fan[i];
        line.setAttribute("x2", L8.f1(lerp(FAN.x0, FAN.x1, k)));
        line.setAttribute("y2", L8.f1(lerp(FAN.y0, Y(i), k)));
        // the road swells for a moment as its trail chip pops up
        const swell = flash(t, T.trails + 0.15 * i, T.trails + 0.15 * i + 0.6);
        line.setAttribute("stroke-width", L8.f1((2 + 2.5 * r.tau) * (1 + 0.4 * swell)));
        line.style.stroke = r.tabu && t >= T.tabu ? "var(--rose)" : "var(--blue)";
        V.show(line, k);
      });

      // ---- headers
      heads.trail.set({ k: ramp(t, T.trailHead, T.trailHead + 0.4, E.lin) });
      heads.close.set({ k: ramp(t, T.closeHead, T.closeHead + 0.4, E.lin) });
      heads.score.set({
        k: ramp(t, T.scoreHead, T.scoreHead + 0.4, E.lin),
        s: 1 + 0.08 * flash(t, T.scoreFlash, T.scoreFlash + 0.5),
      });
      where.set({ k: ramp(t, 0.4, 0.8, E.lin) });
      heads.chance.set({ k: ramp(t, T.chanceHead, T.chanceHead + 0.4, E.lin) });

      rows.forEach((r, i) => {
        // ---- village tags: pop in, light up with their closeness chip, Dale turns red
        const pair = flash(t, T.pairs + 0.3 * i, T.pairs + 0.3 * i + 0.4);
        const tabuNow = r.tabu && t >= T.tabu;
        names[i].set({
          k: L8.seq(t, T.names, 0.15, 0.4, i),
          tone: tabuNow ? "red" : "grey",
          s: 1 + 0.12 * pair + (r.tabu ? 0.15 * flash(t, T.tabu, T.tabu + 0.4) : 0),
        });
        if (r.tabu) tabuTag.set({ k: ramp(t, T.tabu, T.tabu + 0.4, E.lin) });

        // ---- trail and closeness chips
        const sum = flash(t, T.scores + 0.25 * i - 0.15, T.scores + 0.25 * i + 0.25); // used while its score appears
        trails[i].set({ k: L8.seq(t, T.trails, 0.15, 0.4, i), s: 1 + 0.12 * sum });
        closes[i].set({
          k: L8.seq(t, T.close, 0.15, 0.4, i),
          s: 1 + 0.12 * sum,
          ring: "purple",
          ringK: pair,
        });

        // ---- signs
        V.place(times[i], {
          s: 0.6 + 0.4 * E.pop(L8.seq(t, T.times, 0.12, 0.3, i)),
          o: clamp(L8.seq(t, T.times, 0.12, 0.3, i) * 4),
        });
        V.place(equals[i], {
          s: 0.6 + 0.4 * E.pop(L8.seq(t, T.equals, 0.12, 0.3, i)),
          o: clamp(L8.seq(t, T.equals, 0.12, 0.3, i) * 4),
        });

        // ---- dashed slot, then the score chip (Dale's flips edge-on from 2 to 0)
        const sk = L8.seq(t, T.scores, 0.25, 0.4, i);
        slots[i].set({
          ghost: true,
          k: L8.seq(t, T.slots, 0.1, 0.35, i),
          o: 1 - ramp(t, T.scores + 0.25 * i + 0.1, T.scores + 0.25 * i + 0.3, E.lin),
        });
        const addAt = T.add + 0.35 * i;
        const adding = r.tabu ? 0 : flash(t, addAt, addAt + 0.35);
        if (r.tabu) {
          const f = ramp(t, T.flip[0], T.flip[1], E.inOut);
          const zero = f >= 0.5;
          scores[i].set({
            text: num(zero ? r.score : r.would),
            tone: zero ? "red" : "grey",
            solid: zero,
            k: sk,
            sx: Math.abs(1 - 2 * f),
            s: 1 + 0.12 * adding,
          });
        } else scores[i].set({ k: sk, s: 1 + 0.12 * adding, ring: "grey", ringK: adding });

        // ---- chances
        const f = ramp(t, T.toPct + 0.15 * i, T.toPct + 0.15 * i + 0.5, E.inOut);
        chances[i].set({
          text: f >= 0.5 ? `${L8.pct(r.p)}%` : fraction(r),
          k: L8.seq(t, T.chances, 0.15, 0.4, i),
          tone: r.tabu ? "red" : "orange",
          sx: Math.abs(1 - 2 * f),
        });
      });

      // ---- the sum: each score joins it in turn, the equals sign and the total follow the last one
      const at = (i) => T.add + 0.35 * i;
      sumTag.set({ k: ramp(t, T.add - 0.1, T.add + 0.3, E.lin) });
      sumChips.forEach((c, i) =>
        c.set({ k: ramp(t, at(i), at(i) + 0.3, E.lin), s: 1 + 0.1 * flash(t, at(i) + 0.2, at(i) + 0.55) }),
      );
      plusSigns.forEach((g, i) => {
        const k = ramp(t, at(i + 1) - 0.05, at(i + 1) + 0.2, E.lin);
        V.place(g, { s: 0.6 + 0.4 * E.pop(k), o: clamp(k * 4) });
      });
      const ek = ramp(t, at(3) - 0.05, at(3) + 0.2, E.lin);
      V.place(sumEq, { s: 0.6 + 0.4 * E.pop(ek), o: clamp(ek * 4) });
      sumTotal.set({
        k: ramp(t, at(3), at(3) + 0.3, E.lin),
        solid: t >= at(3) + 0.3,
        s: 1 + 0.12 * flash(t, at(3) + 0.2, at(3) + 0.55),
      });
    };
  },
});

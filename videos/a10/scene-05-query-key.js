/* Phase 10 · scene 05-query-key (14.1 s): how attention finds the right words, by hand on "the dog barked" (lesson 10.4). Every word
   makes a QUERY (purple: what I am looking for) and a KEY (blue: what I have to offer); each is defined on screen as its row pops, in
   the caption of that moment. The VALUE (orange) is not drawn here: scene 6 introduces it where it is used. To update "barked", its
   query [1, 1] is compared with every key: pair by
   pair the numbers are multiplied (1×1 + 1×0), then added up, which gives the scores 1, 3 and 2 ("dog" matches best). Dividing by 1.41
   (the square root of 2) gives 0.71, 2.12, 1.41 and softmax turns those into the shares 0.14, 0.58, 0.28. Every number comes from
   A10.QKV (common.js) and is asserted again here. The product cells show the multiplication itself ("1×2"), not only its result,
   because the query of "barked" is all ones and the results would just copy the key.
   Story (local seconds): 0.2-0.8 word tags; 0.7-1.5 the query row; 2.5-3.3 the key row; 3.9-4.6 "barked" turns purple and the other
   queries go grey; 4.7-8.0 for each key: an arrow from the query, a ring on the key, the two products with a plus, a blue score disc;
   8.3-8.8 the "dog" disc turns green, the arrows and rings fade; 10.0-10.9 "÷ 1.41" and the scaled scores; 11.7-12.6 the green shares,
   12.5 a ring on the "dog" share. Hold to 14.1. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const Q = A10.QKV;
  const BK = Q.barked;
  const ASK = Q.F; // the word that asks: "barked"
  const DOG = 1;
  A10.same("query-key: the sentence", Q.words.join(" "), "the dog barked");
  A10.same("query-key: the asking word", [Q.words[ASK], BK.q], ["barked", [1, 1]]);
  A10.same("query-key: the keys", Q.K, [
    [1, 0],
    [1, 2],
    [1, 1],
  ]);
  A10.same("query-key: the values", Q.V, [
    [2, 1],
    [1, 3],
    [1, 1],
  ]);
  A10.same(
    "query-key: scores",
    BK.rows.map((r) => r.score),
    [1, 3, 2],
  );
  BK.rows.forEach((r, j) => {
    A10.same(`query-key: products of ${r.word}`, r.prods, [BK.q[0] * Q.K[j][0], BK.q[1] * Q.K[j][1]]);
    A10.same(`query-key: score of ${r.word} is the sum of its products`, r.score, A10.sum(r.prods));
    A10.close(`query-key: scaled score of ${r.word}`, r.scaled, r.score / Math.sqrt(2), 1e-9);
  });
  A10.same(
    "query-key: scaled scores",
    BK.rows.map((r) => r.scaledTxt),
    ["0.71", "2.12", "1.41"],
  );
  A10.same(
    "query-key: shares",
    BK.rows.map((r) => r.wTxt),
    ["0.14", "0.58", "0.28"],
  );
  A10.close("query-key: the shares add up to 1", A10.sum(BK.weights), 1, 1e-9);
  A10.close(
    "query-key: the shares are softmax of the scaled scores",
    A10.sum(
      A10.softmax(
        BK.rows.map((r) => r.score),
        Q.root,
      ).map((v, j) => Math.abs(v - BK.weights[j])),
    ),
    0,
    1e-9,
  );
  A10.same("query-key: dog matches best", BK.rows.map((r) => r.score).indexOf(3), DOG);

  const CX = [270, 500, 730]; // column centres
  const Y = { word: 16, query: 96, key: 214, prod: 296, disc: 408, scaled: 466, share: 540 };
  const ROOT = Q.root.toFixed(2); // the divisor, "1.41" (the square root of the key length 2)
  A10.same("query-key: the divisor", [ROOT, Q.dk], ["1.41", 2]);
  A10.same("query-key: the best score", BK.rows[DOG].score, 3);
  const mid = (y, h) => y + h / 2 - 29; // top of a 58 px label tag centred on a row
  const TM = {
    word: 0.2, // word tag j at 0.2 + 0.2 j
    qLabel: 0.7, // the 'query' label, then its chips: word j at 1.0 + 0.15 j
    query: 1.0,
    kLabel: 2.5, // the 'key' label, then its chips: word j at 2.7 + 0.15 j
    key: 2.7,
    focus: [3.9, 4.6],
    score: 4.7, // key j is scored from 4.7 + 1.1 j
    step: 1.1,
    best: [8.3, 8.8],
    fade: [8.4, 8.7], // arrows and rings
    div: 10.0, // the "÷ 1.41" label
    scaled: 10.2, // scaled cell j at 10.2 + 0.12 j
    share: 11.7, // the "share" label; cell j at 11.8 + 0.15 j
    shareRing: [12.5, 12.8],
  };
  const tj = (j) => TM.score + TM.step * j;

  /* one ring round a whole chip of two cells (the cells' own rings would overlap in the gap between them) */
  function frame(stage, x, y, w, h, tone) {
    const el = V.h("div", {
      style: {
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        boxSizing: "border-box",
        border: `5px solid ${A10.tone(tone).c}`,
        borderRadius: "22px",
        visibility: "hidden",
      },
    });
    stage.append(el);
    return (k, o = 1) => V.place(el, { s: 0.88 + 0.12 * E.pop(k), o: Math.min(1, k * 3) * o });
  }

  function build(stage) {
    const tags = Q.words.map((w, j) => A10.tag(stage, { x: CX[j] - A10.tagW(w) / 2, y: Y.word, text: w }));
    const labels = {
      query: A10.tag(stage, { x: 14, y: mid(Y.query, 56), text: "query", tone: "purple" }),
      key: A10.tag(stage, { x: 14, y: mid(Y.key, 56), text: "key", tone: "blue" }),
      score: A10.tag(stage, { x: 14, y: Y.disc - 29, text: "score", tone: "blue" }),
      div: A10.tag(stage, { x: 14, y: mid(Y.scaled, 52), text: `÷ ${ROOT}`, tone: "grey" }),
      share: A10.tag(stage, { x: 14, y: mid(Y.share, 56), text: "share", tone: "green" }),
    };
    Object.entries(labels).forEach(([name, t]) =>
      A10.same(`query-key: the ${name} label clears the first chips`, t.x + t.w <= 165, true),
    );
    const chip = (j, y, texts, tone, w = 84, gap = 6) =>
      A10.cells(stage, { x: CX[j] - (2 * w + gap) / 2, y, texts: texts.map(String), w, h: 56, gap, tone });
    const qrow = Q.words.map((_, j) => chip(j, Y.query, Q.Q[j], "purple"));
    const krow = Q.words.map((_, j) => chip(j, Y.key, Q.K[j], "blue"));
    const rings = Q.words.map((_, j) => frame(stage, CX[j] - 93, Y.key - 6, 186, 68, "purple"));
    const mults = BK.rows.map((r, j) =>
      A10.cells(stage, {
        x: CX[j] - 95,
        y: Y.prod,
        texts: r.prods.map((_, d) => `${BK.q[d]}×${r.k[d]}`),
        w: 80,
        h: 48,
        gap: 30,
        tone: "grey",
      }),
    );
    const scaled = BK.rows.map((r, j) =>
      A10.cells(stage, { x: CX[j] - 50, y: Y.scaled, texts: [r.scaledTxt], w: 100, h: 52, tone: "blue" }),
    );
    const shares = BK.rows.map((r, j) =>
      A10.cells(stage, { x: CX[j] - 50, y: Y.share, texts: [r.wTxt], w: 100, h: 56, tone: "green", solid: true }),
    );
    const discs = BK.rows.map((r, j) =>
      A10.disc(stage, { x: CX[j], y: Y.disc, size: 60, text: String(r.score), tone: "blue" }),
    );
    const svg = A10.svg(stage);
    const bows = [-6, 0, 0];
    const arrows = CX.map((x, j) =>
      svg.appendChild(L5.arrow(CX[ASK], Y.query + 64, x, Y.key - 10, "purple", 1, { w: 5, head: 16, bow: bows[j] })),
    );
    const pluses = CX.map((x) => svg.appendChild(A10.op("plus", x, Y.prod + 24, 26)));
    const equals = CX.map((x) => svg.appendChild(A10.op("equals", x, (Y.prod + 48 + Y.disc - 30) / 2, 30)));

    return (t) => {
      const focus = t >= TM.focus[0];
      const bump = 1 + 0.12 * flash(t, ...TM.focus);
      const fadeOut = 1 - ramp(t, ...TM.fade, E.lin);

      // 1. the words and the row labels
      tags.forEach((g, j) => {
        const asks = focus && j === ASK;
        g.set({ k: A10.seq(t, TM.word, 0.2, 0.4, j), tone: asks ? "purple" : "grey", solid: asks, s: asks ? bump : 1 });
      });
      labels.query.set({ k: ramp(t, TM.qLabel, TM.qLabel + 0.3, E.lin) });
      labels.key.set({ k: ramp(t, TM.kLabel, TM.kLabel + 0.3, E.lin) });

      // 2. the queries (one row), then the keys (one row); then "barked" asks and the other queries step back
      // the pair being multiplied lights up: cell d of the query and cell d of the key that is being scored
      const pairBump = (d, only) =>
        1 +
        0.08 *
          BK.rows.reduce(
            (b, __, i) =>
              only != null && i !== only ? b : b + flash(t, tj(i) + 0.35 + 0.1 * d, tj(i) + 0.75 + 0.1 * d),
            0,
          );
      Q.words.forEach((_, j) => {
        const asks = focus && j === ASK;
        qrow[j].all((d) => {
          const p = A10.pop(A10.seq(t, TM.query + 0.15 * j, 0.06, 0.35, d));
          const s = p.s * (j === ASK ? pairBump(d) : 1) * (asks ? 1 + 0.07 * flash(t, ...TM.focus) : 1);
          return { ...p, s, tone: focus && !asks ? "grey" : "purple", solid: asks };
        });
        krow[j].all((d) => {
          const p = A10.pop(A10.seq(t, TM.key + 0.15 * j, 0.06, 0.35, d));
          return { ...p, s: p.s * pairBump(d, j) };
        });
      });

      // 3. scoring: for each key an arrow from the query, a ring on the key, the products added up, a score
      BK.rows.forEach((r, j) => {
        const a = tj(j);
        L5.drawOn(arrows[j], ramp(t, a, a + 0.5, E.out));
        V.show(arrows[j], fadeOut);
        rings[j](ramp(t, a + 0.05, a + 0.4, E.lin), fadeOut);
        mults[j].all((d) => A10.pop(A10.seq(t, a + 0.35, 0.1, 0.3, d)));
        V.place(pluses[j], A10.pop(ramp(t, a + 0.45, a + 0.75, E.lin)));
        V.place(equals[j], A10.pop(ramp(t, a + 0.65, a + 0.9, E.lin)));
        const best = j === DOG && t >= TM.best[0];
        discs[j].set({
          k: ramp(t, a + 0.75, a + 1.1, E.lin),
          tone: best ? "green" : "blue",
          s: j === DOG ? 1 + 0.2 * flash(t, ...TM.best) : 1,
        });
      });
      labels.score.set({ k: ramp(t, tj(0) + 0.7, tj(0) + 1.0, E.lin) });

      // 4. divide by 1.41, then softmax gives the shares
      labels.div.set({ k: ramp(t, TM.div, TM.div + 0.35, E.lin) });
      scaled.forEach((c, j) => c.set(0, A10.pop(A10.seq(t, TM.scaled, 0.12, 0.35, j))));
      labels.share.set({ k: ramp(t, TM.share, TM.share + 0.35, E.lin) });
      shares.forEach((c, j) =>
        c.set(0, {
          ...A10.pop(A10.seq(t, TM.share + 0.1, 0.15, 0.35, j)),
          ring: j === DOG ? "green" : undefined,
          ringK: ramp(t, ...TM.shareRing, E.lin),
        }),
      );
    };
  }

  V.scene({
    kicker: "QUERY AND KEY",
    title: ["A query is matched", "against every key"],
    dur: 14,
    caps: [
      [0.9, 2.4, "Query: what I am looking for."],
      [2.6, 4.1, "Key: what I have to offer."],
      [4.5, 6.3, "Compare the query of “barked” to each key."],
      [6.4, 8.1, "Multiply the pairs, then add them up."],
      [8.3, 10, `“dog” matches best: a score of ${BK.rows[DOG].score}.`],
      [10.1, 11.7, `Divide by ${ROOT} to keep scores small.`],
      [11.9, 13.7, "Softmax turns them into shares."],
    ],
    build,
  });
})();

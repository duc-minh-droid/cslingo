/* Phase 10 · scene 04-attention (12 s): ATTENTION (lesson 10.3). To read "it" in "The robot moved because it detected danger" the word
   looks at every word of the sentence, itself included, and gives each a share. The shares are very uneven: "robot" gets by far the
   most, "it" itself a little, the rest almost nothing, so the new "it" is rebuilt mostly from "robot". Every word does the same at
   once (7 x 7 = 49 shares, drawn as a 7 x 7 heat grid whose cells pop together). The scores behind the shares are ILLUSTRATIVE (A10.ATT: made-up scores pushed through the real softmax),
   so no share number is printed: shares show only as arc thickness and bar length.
   Story (local seconds): 0.1-1.0 seven word tags pop; 0.8-1.2 "it" turns purple, 0.9-1.35 a purple question mark; 2.6-4.1 seven equal
   grey arcs fan out from "it" to every word (itself last, as a loop); 4.8-5.8 they reweigh: the arcs to "robot" and to "it" itself
   thicken and turn green, the rest thin out; 5.4-5.9 "robot" lights up green; 6.8-7.7 a purple arrow drops from "it" to a share bar
   that blends robot (green) / it (purple) / the rest (grey) into the new "it" (a grey "toy scores" tag says the shares are made up);
   9.0-9.3 all of that fades, the sentence follows (9.1-9.5); 9.6-10.1 the 7 x 7 heat grid pops in (rows = the word looking, columns =
   the word looked at; only the "it" row and the "robot" column carry a tag); 10.4-10.8 the "it" row is ringed; 11.0-11.5 the
   "7 × 7 = 49 shares" tag. The grid is centred on the stage. Hold to 12. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { ramp, lerp, clamp, ease: E } = V;

  const ATT = A10.ATT;
  const { IT, ROBOT, n: N, words: WORDS } = ATT;
  const ROW = ATT.itRow; // the shares of "it": one per word of the sentence (never printed)
  const MATTERS = 0.1; // a share of at least this is drawn green (robot, and "it" itself)
  const matters = ROW.map((w) => w >= MATTERS);
  const REST = 1 - ROW[ROBOT] - ROW[IT]; // everything the other five words share

  A10.same("attention: the sentence", WORDS.join(" "), "The robot moved because it detected danger");
  A10.same("attention: the two words that matter", [WORDS[IT], WORDS[ROBOT]], ["it", "robot"]);
  A10.same("attention: seven words, 7 x 7 shares", [N, ATT.links, N * N], [7, 49, 49]);
  A10.close("attention: the row of it adds up to 1", A10.sum(ROW), 1, 1e-9);
  A10.same("attention: it looks hardest at robot", ROW.indexOf(Math.max(...ROW)), ROBOT);
  A10.same(
    "attention: only robot and it itself count",
    matters.map((m, j) => (m ? j : -1)).filter((j) => j >= 0),
    [ROBOT, IT],
  );
  A10.same(
    "attention: arc widths of robot, itself and a minor word (px)",
    [A10.arcW(ROW[ROBOT]), A10.arcW(ROW[IT]), A10.arcW(ROW[0])].map((w) => +w.toFixed(1)),
    [15.4, 5.5, 4.2],
  );
  A10.same("attention: the rest is a small slice", [REST > 0.05, REST < 0.1], [true, true]);
  ATT.w.forEach((row, i) => A10.close(`attention: row ${i} of the grid adds up to 1`, A10.sum(row), 1, 1e-9));
  A10.same(
    "attention: the brightest cell of the it row is the robot column",
    ATT.w[IT].indexOf(Math.max(...ATT.w[IT])),
    ROBOT,
  );

  const TM = {
    words: [0.1, 0.07, 0.3], // word i pops from 0.1 + 0.07 i for 0.3 s
    it: [0.8, 1.2], // "it" turns purple, with a small bump
    q: [0.9, 1.35], // the purple question mark
    qOut: [2.3, 2.6],
    arcs: 2.6, // arc n of ORDER at 2.6 + 0.16 n, 0.55 s each
    reweigh: [4.8, 5.8],
    tone: 4.9, // the arcs that matter turn green
    robot: [5.4, 5.9], // "robot" lights up (until robotOff)
    robotOff: 9.2,
    arrow: [6.8, 7.3],
    newIt: [6.95, 7.3],
    blend: [6.9, 7.7],
    label: 7.2, // label i at 7.2 + 0.2 i (robot, it, others), 0.3 s each
    fade: [9.0, 9.3],
    sentOut: [9.1, 9.5], // the sentence gives way to the grid
    grid: [9.6, 10.1], // the 49 cells pop together (a 0.02 s sweep along the diagonal)
    gridTags: [10.0, 10.35],
    ring: [10.4, 10.8],
    total: [11.0, 11.45],
  };
  const G = { cell: 64, gap: 4, y: 78 }; // the 7 x 7 heat grid: 472 px square, centred, a 58 px tag above it and one below
  const ORDER = [0, 1, 2, 3, 5, 6, IT]; // the fan of arcs: every word in turn, itself (the loop) last
  const DY = -40; // the whole figure sits 40 px above the storyboard's numbers, so the sentence is centred on the stage
  const SENT_Y = 330 + DY;

  function build(stage) {
    const s = A10.sentence(stage, { x: 16, y: SENT_Y, words: WORDS, gap: 8 });
    A10.same("attention: the sentence is 903 px wide", s.width, 903);
    A10.same(
      "attention: word centres",
      WORDS.map((_, i) => s.top(i).x),
      [62.5, 176, 309, 458.5, 573, 692.5, 850],
    );
    const itX = s.top(IT).x;
    const svg = A10.svg(stage);

    // the question over "it"
    const qm = svg.appendChild(A10.qmark(itX, 262 + DY, 70, "purple"));

    // the fan of arcs from "it" to every word, above the sentence
    const fan = WORDS.map((_, j) =>
      A10.arc(svg, {
        x1: itX,
        y1: SENT_Y,
        x2: s.top(j).x,
        y2: SENT_Y,
        lift: A10.arcLift(s.top(j).x - itX, 40, 0.22),
        tone: "grey",
        w: 6,
      }),
    );

    // the blend: how the new "it" is made (a purple arrow drops from "it" onto a share bar)
    const vals = [ROW[ROBOT], ROW[IT], REST];
    const blend = A10.shareBar(stage, { x: 188, y: 470 + DY, w: 560, h: 56 });
    const place = (text, mid, y, tone, solid) => A10.tag(stage, { x: mid - A10.tagW(text) / 2, y, text, tone, solid });
    const robotL = place("robot", blend.seg(0, vals).mid, 406 + DY, "grey");
    const itL = place("it", blend.seg(1, vals).mid, 406 + DY, "purple");
    const restL = place("others", blend.seg(2, vals).mid, 536 + DY, "grey");
    const newIt = A10.tag(stage, { x: 21, y: 469 + DY, text: "new “it”", tone: "green", solid: true });
    A10.same("attention: the new-it tag is 155 px wide", newIt.w, 155);
    const down = svg.appendChild(L5.arrow(itX, SENT_Y + 62, itX, 464 + DY, "purple", 1, { w: 6, head: 18 }));

    // the grid of every word's shares: rows = the word looking, columns = the word looked at (only "it" and "robot" are named)
    const gx = (936 - (N * G.cell + (N - 1) * G.gap)) / 2;
    const grid = A10.grid(stage, { x: gx, y: G.y, rows: N, cols: N, cell: G.cell, gap: G.gap, radius: 12 });
    const itTag = A10.tag(stage, {
      x: gx - 10 - A10.tagW(WORDS[IT]),
      y: grid.mid(IT, 0).y - 29,
      text: WORDS[IT],
      tone: "purple",
      solid: true,
    });
    const robotTag = A10.tag(stage, {
      x: grid.mid(0, ROBOT).x - A10.tagW(WORDS[ROBOT]) / 2,
      y: G.y - 66,
      text: WORDS[ROBOT],
    });
    A10.same(
      "attention: the grid fits the stage and the robot tag clears the top margin",
      [grid.height, robotTag.y >= 12, itTag.x >= 12],
      [472, true, true],
    );
    const total = A10.tag(stage, {
      x: 468 - A10.tagW(`${N} × ${N} = ${ATT.links} shares`) / 2,
      y: G.y + grid.height + 10,
      text: `${N} × ${N} = ${ATT.links} shares`,
      tone: "grey",
    });
    A10.same(
      "attention: the total tag is 272 px wide and ends inside the stage",
      [total.w, total.y + total.h <= 630],
      [272, true],
    );
    const toy = A10.tag(stage, { x: 21, y: 363, text: "toy scores", tone: "grey" });
    A10.same(
      "attention: the toy tag clears the blend labels",
      [toy.w, toy.x + toy.w < blend.seg(0, vals).mid - 59],
      [180, true],
    );

    return (t) => {
      const fade = ramp(t, ...TM.fade, E.lin); // 0 -> 1: the blend and the arcs of "it" fade out
      const rw = ramp(t, ...TM.reweigh, E.inOut); // 0 -> 1: the arcs reweigh

      // 1. the sentence, and "it" asking
      const sentO = 1 - ramp(t, ...TM.sentOut, E.lin); // the sentence gives way to the grid
      s.all((i) => {
        const k = A10.seq(t, TM.words[0], TM.words[1], TM.words[2], i);
        if (i === IT) {
          const on = t >= TM.it[0];
          return { k, o: sentO, tone: on ? "purple" : "grey", solid: on, s: 1 + 0.1 * V.flash(t, ...TM.it) };
        }
        if (i === ROBOT) {
          const on = t >= TM.robot[0] && t < TM.robotOff;
          return { k, o: sentO, tone: on ? "green" : "grey", solid: on, s: 1 + 0.08 * V.flash(t, ...TM.robot) };
        }
        return { k, o: sentO };
      });
      const qk = ramp(t, ...TM.q, E.lin);
      V.place(qm, { s: 0.5 + 0.5 * E.pop(qk), o: clamp(qk * 4) * (1 - ramp(t, ...TM.qOut, E.lin)) });
      L5.drawOn(qm, clamp(qk * 1.3));

      // 2. "it" looks at every word equally, then the shares are unequal
      ORDER.forEach((j, n) => {
        const k = ramp(t, TM.arcs + 0.16 * n, TM.arcs + 0.16 * n + 0.55, E.out);
        fan[j].set({
          k,
          w: lerp(6, A10.arcW(ROW[j]), rw),
          tone: matters[j] && t >= TM.tone ? "green" : "grey",
          o: 1 - fade,
        });
      });

      // 3. the new "it" is blended from the words it leaned on
      blend.set({ vals, tones: ["green", "purple", "grey"], k: ramp(t, ...TM.blend, E.out), o: 1 - fade });
      robotL.set({ k: ramp(t, TM.label, TM.label + 0.3, E.lin), o: 1 - fade });
      itL.set({ k: ramp(t, TM.label + 0.2, TM.label + 0.5, E.lin), o: 1 - fade });
      restL.set({ k: ramp(t, TM.label + 0.4, TM.label + 0.7, E.lin), o: 1 - fade });
      newIt.set({ k: ramp(t, ...TM.newIt, E.lin), o: 1 - fade });
      toy.set({ k: ramp(t, TM.blend[0], TM.blend[0] + 0.35, E.lin), o: 1 - fade });
      L5.drawOn(down, ramp(t, ...TM.arrow, E.out));
      V.show(down, 1 - fade);

      // 4. every word does it, all at once: the 7 x 7 grid of shares, the "it" row ringed
      const ringK = ramp(t, ...TM.ring, E.lin);
      grid.all((r, c) => ({
        v: ATT.w[r][c],
        k: ramp(t, TM.grid[0] + 0.02 * (r + c), TM.grid[1] - 0.02 * (2 * N - 2 - r - c), E.lin),
        ring: r === IT ? "purple" : undefined,
        ringK: r === IT ? ringK : 0,
      }));
      itTag.set({ k: ramp(t, ...TM.gridTags, E.lin) });
      robotTag.set({ k: ramp(t, ...TM.gridTags, E.lin) });
      total.set({ k: ramp(t, ...TM.total, E.lin) });
    };
  }

  V.scene({
    kicker: "ATTENTION",
    title: ["Every word looks at", "the whole sentence"],
    dur: 12,
    caps: [
      [1, 2.6, "Which noun does “it” stand for?"],
      [2.8, 4.6, "It looks at every word, itself included."],
      [5, 6.8, "But some words matter more than others."],
      [7.2, 9, "Its new meaning leans on “robot”."],
      [9.6, 11.6, "Every word does this, all at the same time."],
    ],
    build,
  });
})();

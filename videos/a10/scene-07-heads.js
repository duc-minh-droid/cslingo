/* Phase 10 · scene 07-heads (13 s): MULTI-HEAD attention (lesson 10.5). One attention pattern is not enough, so the model runs several
   HEADS side by side on the robot sentence. Each head has its own query, key and value (the purple / blue / orange Q K V chips) and so
   its own pattern: who is "it"?, the word before, who acts?, acts on what? (made-up scores through the real softmax, the same recipes as
   the lesson's playground: A10.HEADS). Each head hands back a short list of 16 numbers (64 / 4 = 16) and the four lists are glued side
   by side into 64 numbers (4 × 16 = 64). Every number comes from A10.HEADS (common.js) and is asserted again here.
   Story (local seconds): 0.15-0.8 the seven words; 0.7-1.2 the four head tags, each followed by its Q K V chips; 3.1-4.8 head 1 lights
   up, "it" turns purple, one arc to "robot" with its weight; 5.0-6.6 head 2: the word before (six arcs); 6.9-7.9 head 3: moved and
   detected look at robot; 7.9-8.9 head 4: detected and danger look at each other; 9.0-9.8 four "16 numbers" slices, one under each
   head, "it" turns purple again and a purple "for “it”" tag shows whose numbers they are (the caption says "per word"); 10.9-11.9
   the slices slide together into one green bar; 11.2-11.7 "for “it”" slides left, 11.8-12.3 the "4 × 16 = 64" tag pops beside
   it. Hold to 13. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const { ramp, flash, ease: E } = V;

  const H = A10.HEADS;
  const { words: WORDS, IT, ROBOT } = A10.ATT;
  const PATTERNS = H.patterns;
  const LINKS = PATTERNS.map((_, k) => H.links(k));
  const DETECTED = 5;
  const DANGER = 6;
  const MOVED = 2;
  const words = (ls) => ls.map((l) => `${WORDS[l.i]}>${WORDS[l.j]}`);

  A10.same("heads: the sentence", WORDS.join(" "), "The robot moved because it detected danger");
  A10.same(
    "heads: the words that take part",
    [WORDS[IT], WORDS[ROBOT], WORDS[MOVED], WORDS[DETECTED], WORDS[DANGER]],
    ["it", "robot", "moved", "detected", "danger"],
  );
  A10.same(
    "heads: four heads of 16, glued into 64",
    [H.n, H.dModel / H.n, H.dHead, H.n * H.dHead, H.dModel],
    [4, 16, 16, 64, 64],
  );
  A10.same(
    "heads: the four head tags",
    PATTERNS.map((p) => p.tag),
    ["who is “it”?", "word before", "who acts?", "acts on what?"],
  );
  A10.same("heads: the strong links of every head", LINKS.map(words), [
    ["it>robot"],
    ["robot>The", "moved>robot", "because>moved", "it>because", "detected>it", "danger>detected"],
    ["moved>robot", "detected>robot"],
    ["detected>danger", "danger>detected"],
  ]);
  A10.same(
    "heads: the weights of the strong links",
    LINKS.map((ls) => [...new Set(ls.map((l) => l.w.toFixed(2)))]),
    [["0.97"], ["0.96"], ["0.95"], ["0.95"]],
  );
  PATTERNS.forEach((p, k) =>
    p.w.forEach((row, i) => A10.close(`heads: head ${k}, word ${i}: the shares add up to 1`, A10.sum(row), 1, 1e-9)),
  );
  const WEIGHT_TXT = LINKS[0][0].w.toFixed(2);

  const SENT_Y = 150; // the sentence, in the same place as scene 4's words (x 16, gap 8)
  const TAG_Y = 270;
  const TX = [12, 243, 483, 692]; // left edges of the four head tags
  const DOT_Y = 340;
  const DOT = { w: 44, gap: 10 }; // the Q K V chips
  const SLICE = { y: 404, w: 180, h: 60 };
  const BAR_X = 108; // where the glued bar starts (4 slices of 180 centre on x 468)
  const TAG_ROW = 496; // the tags under the glued bar

  const TM = {
    words: [0.15, 0.06, 0.28], // word i from 0.15 + 0.06 i, 0.28 s each
    head: [0.7, 0.15, 0.35], // head tag k from 0.7 + 0.15 k, 0.35 s each; its chips 0.2 s later, 0.08 apart
    weight: [3.9, 4.2], // the "0.97" tag on the arc of head 1
    slices: [9.05, 0.15, 0.35], // slice k from 9.05 + 0.15 k
    glue: [10.9, 0.1, 0.7], // slice k slides from 10.9 + 0.1 k for 0.7 s
    green: 11.6, // the slices turn green
    forIt: [9.05, 9.4], // "it" turns purple again and the purple "for “it”" tag pops: the 16 numbers are the numbers of one word
    forSlide: [11.15, 11.7], // "for “it”" slides left, the 4 × 16 = 64 tag pops beside it
    total: [11.8, 12.3],
  };
  // one window per head: on / off = the head tag and the asking word light up; arc n draws from arc + step n for dur; fade the arcs
  const PH = [
    { on: 3.1, off: 4.65, arc: 3.2, step: 0, dur: 0.7, fade: [4.5, 4.8] },
    { on: 5.0, off: 6.45, arc: 5.1, step: 0.12, dur: 0.4, fade: [6.3, 6.6] },
    { on: 6.9, off: 7.75, arc: 6.9, step: 0.12, dur: 0.45, fade: [7.6, 7.85] },
    { on: 7.9, off: 8.8, arc: 7.95, step: 0, dur: 0.45, fade: [8.65, 8.9] },
  ];
  const bump = (t, a) => 1 + 0.08 * flash(t, a, a + 0.35);

  function build(stage) {
    const s = A10.sentence(stage, { x: 16, y: SENT_Y, words: WORDS, gap: 8 });
    A10.same("heads: the sentence is 903 px wide, as in scene 4", s.width, 903);
    A10.same(
      "heads: word centres",
      WORDS.map((_, i) => s.top(i).x),
      [62.5, 176, 309, 458.5, 573, 692.5, 850],
    );
    const svg = A10.svg(stage);

    // the strong links of every head, as arcs over the sentence (the dot sits at the word that is looked at)
    const arcs = LINKS.map((ls) =>
      ls.map((l) => {
        const dx = s.top(l.j).x - s.top(l.i).x;
        return A10.arc(svg, {
          x1: s.top(l.i).x,
          y1: SENT_Y,
          x2: s.top(l.j).x,
          y2: SENT_Y,
          lift: A10.arcLift(dx, 26, 0.16, 92),
          tone: "green",
          w: 4 + 8 * l.w,
        });
      }),
    );
    const apex = Math.min(
      ...LINKS.flatMap((ls) => ls.map((l) => SENT_Y - A10.arcLift(s.top(l.j).x - s.top(l.i).x, 26, 0.16, 92))),
    );
    A10.same("heads: the highest arc peaks inside the stage", [apex >= 50, apex <= 70], [true, true]);

    // the weight of the it -> robot link, on top of its arc
    const top = arcs[0][0].at(0.5);
    const weight = A10.tag(stage, {
      x: top.x - 50,
      y: top.y - 29,
      w: 100,
      text: WEIGHT_TXT,
      tone: "green",
      solid: true,
    });

    // four heads, each with its own query, key and value, and its own 16 numbers
    const tags = PATTERNS.map((p, k) => A10.tag(stage, { x: TX[k], y: TAG_Y, text: p.tag }));
    A10.same(
      "heads: head tag widths",
      tags.map((g) => g.w),
      [200, 209, 178, 231],
    );
    const cc = tags.map((g) => g.mid().x);
    A10.same("heads: head tag centres", cc, [112, 347.5, 572, 807.5]);
    const dotsW = 3 * DOT.w + 2 * DOT.gap;
    const dots = cc.map((c) =>
      A10.cells(stage, {
        x: c - dotsW / 2,
        y: DOT_Y,
        texts: ["Q", "K", "V"],
        w: DOT.w,
        h: DOT.w,
        gap: DOT.gap,
        tones: ["purple", "blue", "orange"],
        solid: true,
        radius: DOT.w / 2,
      }),
    );
    const slices = cc.map((c) =>
      A10.cells(stage, {
        x: c - SLICE.w / 2,
        y: SLICE.y,
        texts: [`${H.dHead} numbers`],
        w: SLICE.w,
        h: SLICE.h,
        tone: "blue",
      }),
    );
    const dxs = cc.map((c, k) => BAR_X + SLICE.w * k - (c - SLICE.w / 2));
    A10.same("heads: how far every slice slides to join the bar", dxs, [86, 30.5, -14, -69.5]);
    const barMid = BAR_X + (H.n * SLICE.w) / 2;
    const totalText = `${H.n} × ${H.dHead} = ${H.dModel}`;
    // under the bar: "for “it”" (these numbers belong to one word) first alone, then side by side with "4 × 16 = 64"
    const forText = `for “${WORDS[IT]}”`;
    const [fw, tw] = [A10.tagW(forText), A10.tagW(totalText)];
    const pairX = barMid - (fw + 16 + tw) / 2;
    const forIt = A10.tag(stage, {
      x: Math.round(barMid - fw / 2),
      y: TAG_ROW,
      text: forText,
      tone: "purple",
      solid: true,
    });
    const total = A10.tag(stage, {
      x: Math.round(pairX + fw + 16),
      y: TAG_ROW,
      text: totalText,
      tone: "green",
      solid: true,
    });
    const forSlide = Math.round(pairX) - forIt.x; // how far "for “it”" slides left to make room
    A10.same("heads: the 4 × 16 = 64 tag", total.w, 193);
    A10.same(
      "heads: the two tags under the bar sit side by side, centred",
      [
        forSlide < 0,
        Math.abs(forIt.x + forSlide + (total.x + total.w - forIt.x - forSlide) / 2 - barMid) <= 1,
        total.x - (forIt.x + forSlide + forIt.w),
      ],
      [true, true, 16],
    );

    return (t) => {
      // 1. the sentence; "it" is the asking word while head 1 works, and again when the 16 numbers are handed back (they are its)
      s.all((i) => {
        const k = A10.seq(t, TM.words[0], TM.words[1], TM.words[2], i);
        if (i !== IT) return { k };
        const on = (t >= PH[0].on && t < PH[0].off) || t >= TM.forIt[0];
        return { k, tone: on ? "purple" : "grey", solid: on, s: bump(t, PH[0].on) * bump(t, TM.forIt[0]) };
      });

      // 2. the four heads and their own query, key and value
      tags.forEach((g, k) => {
        const on = t >= PH[k].on && t < PH[k].off;
        const st = A10.seq(t, TM.head[0], TM.head[1], TM.head[2], k);
        g.set({ k: st, tone: on ? "green" : "grey", solid: on, s: bump(t, PH[k].on) });
        [0, 1, 2].forEach((j) => dots[k].set(j, A10.pop(A10.seq(t, TM.head[0] + TM.head[1] * k + 0.2, 0.08, 0.3, j))));
      });

      // 3. each head looks for its own links
      PH.forEach((p, k) => {
        const fade = ramp(t, ...p.fade, E.lin);
        arcs[k].forEach((a, n) =>
          a.set({ k: ramp(t, p.arc + p.step * n, p.arc + p.step * n + p.dur, E.out), o: 1 - fade }),
        );
      });
      weight.set({ k: ramp(t, ...TM.weight, E.lin), o: 1 - ramp(t, ...PH[0].fade, E.lin) });

      // 4. every head hands back 16 numbers; the four lists are glued into one bar of 64
      const green = t >= TM.green;
      slices.forEach((sl, k) => {
        const pop = A10.pop(A10.seq(t, TM.slices[0], TM.slices[1], TM.slices[2], k));
        const slide = ramp(t, TM.glue[0] + TM.glue[1] * k, TM.glue[0] + TM.glue[1] * k + TM.glue[2], E.inOut);
        sl.set(0, {
          ...pop,
          s: pop.s * bump(t, TM.green - 0.1),
          x: dxs[k] * slide,
          tone: green ? "green" : "blue",
          solid: green,
        });
      });
      forIt.set({ k: ramp(t, ...TM.forIt, E.lin), x: forSlide * ramp(t, ...TM.forSlide, E.inOut) });
      total.set({ k: ramp(t, ...TM.total, E.lin) });
    };
  }

  V.scene({
    kicker: "MULTI-HEAD",
    title: ["Several heads look", "for different links"],
    dur: 13,
    caps: [
      [1.1, 3.1, "Each head has its own query, key and value."],
      [3.3, 4.8, "One head finds what “it” means."],
      [5.1, 6.7, "Another looks at the word before."],
      [6.9, 9, "Others find who acts and what is acted on."],
      [9.1, 10.9, "Each head hands back 16 numbers per word."],
      [11.2, 12.8, "Glued together, they make 64 numbers."],
    ],
    build,
  });
})();

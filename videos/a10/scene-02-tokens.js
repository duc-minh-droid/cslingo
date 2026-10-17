/* Phase 10 · scene 02-tokens (14 s): text is cut into tokens, every token is looked up as a list of numbers (blue), and the two
   copies of "bank" in "the bank by the river bank" get the SAME numbers, so nothing tells them apart (lesson 10.1). Adding a position
   pattern (orange, one list per slot) to every token makes them different (green). Every number comes from A10.TOK (common.js).
   Story (local seconds): 0.2-1.4 six word tags pop; 1.6-3.9 the meaning strips pop column by column; 3.9 a tag says each strip shows
   the first 4 of 8 numbers; 4.4-5.2 the two banks get a ring and a "same" tag, an orange line with an equals sign joins them;
   6.2-6.7 the equals sign turns into a question mark ON the line (which one came first?); 8.0-8.3 all of that fades; 8.3-9.7 plus
   signs, the position strips and their slot tags pop; 9.95-11.0 ONE column is worked by hand (0.7 + 0.8 = 1.5); 11.1-11.6 the position
   strips slide onto the meaning strips; 11.6-12.0 the orange numbers fade out over the sums (blue -> green); 12.0-12.6 the figure
   drifts down to the middle of the stage; 12.2-12.6 the banks ring green and read "different"; 12.7-13.1 "model input". Hold to 14. */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { ramp, clamp, flash, ease: E } = V;

  const T = A10.TOK;
  const [B1, B2] = T.pairs.bank; // the two banks: slots 1 and 5
  const N = T.words.length;
  const ROWS = 4;
  const num = (s) => +s.replace("−", "-");
  A10.same("tokens: the sentence", T.words.join(" "), "the bank by the river bank");
  A10.same("tokens: the banks", [B1, B2], [1, 5]);
  A10.same("tokens: bank meaning strips are equal", T.embTxt[B1], T.embTxt[B2]);
  A10.same("tokens: bank meaning strip", T.embTxt[B1], ["0.7", "0.5", "−0.4", "0.3"]);
  A10.same("tokens: bank + slot 1", T.sumTxt[B1], ["1.5", "1.0", "−0.3", "1.3"]);
  A10.same("tokens: bank + slot 5", T.sumTxt[B2], ["−0.3", "0.8", "0.1", "1.2"]);
  A10.same("tokens: the two banks differ with position", T.sumTxt[B1].join() !== T.sumTxt[B2].join(), true);
  A10.same("tokens: distance of the banks", [T.dist.bank[0], T.dist.bank[1] > 1], [0, true]);
  A10.same("tokens: the lesson's tokens have 8 numbers, the video shows the first 4", [T.dim, ROWS], [8, 4]);
  T.sumTxt.forEach((row, i) =>
    row.forEach((s, j) =>
      A10.close(`tokens: shown sum ${i}.${j}`, +(num(T.embTxt[i][j]) + num(T.posTxt[i][j])).toFixed(1), num(s), 1e-9),
    ),
  );
  const WORKED = `${T.embTxt[B1][0]} + ${T.posTxt[B1][0]} = ${T.sumTxt[B1][0]}`; // the one column worked by hand
  A10.same("tokens: the worked sum", WORKED, "0.7 + 0.8 = 1.5");
  const CUE = `first ${ROWS} of ${T.dim} numbers`;

  const xc = (i) => 18 + 150 * i; // left edge of column i
  const cx = (i) => xc(i) + 60; // centre of column i
  const lin = E.lin;
  const isBank = (i) => i === B1 || i === B2;

  // layout (stage px): the words at y 12, the meaning strips, a free band (tags), the position strips, the slot tags
  const MEAN = { y: 82, h: 44, gap: 4 };
  const POS = { y: 356, h: 42, gap: 4 };
  const BAND = 284; // the tags between the two strips (58 px high)
  const SLOT_Y = 550;
  const top = (S, j) => S.y + (S.h + S.gap) * j;
  const DY = (j) => top(MEAN, j) + MEAN.h / 2 - (top(POS, j) + POS.h / 2); // strip cell j travels exactly onto meaning cell j
  const DRIFT = 120; // the finished figure moves down to sit in the middle of the stage
  A10.same(
    "tokens: nothing leaves the stage margins",
    [
      top(MEAN, ROWS) - MEAN.gap + 12 <= BAND,
      BAND + 58 + 12 <= POS.y,
      top(POS, ROWS) - POS.gap + 12 <= SLOT_Y,
      SLOT_Y + 58 <= 630,
      BAND + 58 + 4 + DRIFT <= 630,
    ],
    [true, true, true, true, true],
  );

  const TM = {
    words: 0.2, // six tags, 0.15 s apart
    meaning: 1.6, // column i starts here + 0.3 i, its cells 0.06 s apart
    cue: [3.9, 4.3], // "first 4 of 8 numbers"
    cueOut: [8.0, 8.3],
    ring: [4.4, 4.9],
    same: [4.6, 5.0],
    join: [5.0, 5.5], // the orange line and equals sign between the two "same" tags
    eqOut: [6.0, 6.2], // the equals sign turns into the question mark
    q: [6.2, 6.7],
    gone: [8.0, 8.3], // same tags, rings, line and question mark fade
    plus: 8.3, // plus i at 8.3 + 0.08 i
    pos: 8.3, // position column i at 8.3 + 0.1 i, cells 0.05 s apart
    slot: 8.5, // slot tag i at 8.5 + 0.1 i
    work: [9.95, 10.4], // the worked sum under the first bank
    workOut: [11.0, 11.2],
    slide: [11.1, 11.6], // the position strips slide up onto the meaning strips (cell j 0.02 s later each)
    plusOut: [11.1, 11.3],
    slotOut: [11.1, 11.4],
    fade: 0.3, // the orange cell fades out (in its first half) over the green sum
    drift: [12.0, 12.6],
    diff: [12.2, 12.6], // green rings and "different" tags
    input: [12.7, 13.1],
  };

  function build(stage) {
    const fig = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } }); // the whole figure drifts down at the end
    stage.append(fig);
    const tags = T.words.map((w, i) => A10.tag(fig, { x: cx(i) - A10.tagW(w) / 2, y: 12, text: w }));
    const meaning = T.words.map((_, i) =>
      A10.cells(fig, {
        x: xc(i) + 10,
        y: MEAN.y,
        texts: T.embTxt[i],
        w: 100,
        h: MEAN.h,
        gap: MEAN.gap,
        dir: "col",
        tone: "blue",
      }),
    );
    const pos = T.words.map((_, i) =>
      A10.cells(fig, {
        x: xc(i) + 10,
        y: POS.y,
        texts: T.posTxt[i],
        w: 100,
        h: POS.h,
        gap: POS.gap,
        dir: "col",
        tone: "orange",
      }),
    );
    const slot = T.words.map((_, i) => A10.tag(fig, { x: cx(i) - 60, y: SLOT_Y, text: `slot ${i}` }));
    const cue = A10.tag(fig, { x: 468 - A10.tagW(CUE) / 2, y: SLOT_Y, text: CUE });
    const same = [B1, B2].map((b) =>
      A10.tag(fig, { x: cx(b) - 81, y: BAND, w: 162, text: "same", tone: "orange", solid: true }),
    );
    const orange = A10.tone("orange").c;
    const line = (left, origin) =>
      V.h("div", {
        style: {
          position: "absolute",
          left: `${left}px`,
          top: `${BAND + 29 - 3.5}px`,
          width: "186px",
          height: "7px",
          borderRadius: "4px",
          background: orange,
          transformOrigin: origin,
        },
      });
    const joinL = line(317, "0% 50%");
    const joinR = line(553, "100% 50%");
    fig.append(joinL, joinR);
    const svg = A10.svg(fig);
    const equals = svg.appendChild(A10.op("equals", cx(3), BAND + 29, 44, "orange"));
    const q = svg.appendChild(A10.qmark(cx(3), BAND + 34, 54, "orange"));
    const plus = T.words.map((_, i) => svg.appendChild(A10.op("plus", cx(i), BAND + 29, 40, "orange")));
    const work = A10.tag(fig, {
      x: Math.round(cx(B1) - A10.tagW(WORKED) / 2),
      y: BAND,
      text: WORKED,
      tone: "green",
      solid: true,
    });
    A10.same(
      "tokens: the worked sum covers only its own plus sign",
      [work.x > cx(0) + 20, work.x + work.w < cx(2) - 20],
      [true, true],
    );
    const input = A10.tag(fig, { x: 365, y: BAND, text: "model input", tone: "green", solid: true });
    A10.same("tokens: the model input tag is 206 px wide", input.w, 206);
    A10.same(
      "tokens: the model input tag sits between the two banks",
      [input.x > cx(B1) + 81, input.x + input.w < cx(B2) - 81],
      [true, true],
    );
    A10.same(
      "tokens: the cue clears the slot tags' band",
      [cue.w, cue.x >= 12, cue.x + cue.w <= 924],
      [312, true, true],
    );

    return (t) => {
      // the whole figure sinks to the middle of the stage once the sums are done
      V.place(fig, { y: DRIFT * ramp(t, ...TM.drift, E.inOut) });

      // the six word tags
      tags.forEach((tg, i) => tg.set({ k: A10.seq(t, TM.words, 0.15, 0.4, i) }));

      const gone = 1 - ramp(t, ...TM.gone, lin);
      const ringK = ramp(t, ...TM.ring, lin) * gone; // orange rings on the two banks
      const ringG = ramp(t, ...TM.diff, lin); // green rings at the end
      const workK = ramp(t, ...TM.work, lin) * (1 - ramp(t, ...TM.workOut, lin)); // the worked column: its two top cells
      const workBump = 1 + 0.12 * flash(t, TM.work[0], TM.work[0] + 0.45);

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < ROWS; j++) {
          // the meaning cell: pops in, may carry a ring, shows the sum once the orange cell has landed on it
          const pk = A10.seq(t, TM.meaning + 0.3 * i, 0.06, 0.3, j);
          const land = TM.slide[1] + 0.02 * j; // the orange cell of this row lands on its partner
          const f0 = land + 0.02 * i;
          const fk = ramp(t, f0, f0 + TM.fade, lin); // 0 -> 1: the orange cell fades, the sum is revealed
          const worked = i === B1 && j === 0;
          let ring;
          let rk = 0;
          if (isBank(i) && ringG > 0) [ring, rk] = ["green", ringG];
          else if (isBank(i) && ringK > 0) [ring, rk] = ["orange", ringK];
          else if (worked && workK > 0) [ring, rk] = ["green", workK];
          const pp = A10.pop(pk);
          meaning[i].set(j, {
            ...pp,
            s: pp.s * (worked ? workBump : 1) * (1 + 0.1 * flash(t, f0, f0 + 0.3)),
            text: fk > 0 ? T.sumTxt[i][j] : T.embTxt[i][j],
            tone: fk > 0 ? "green" : "blue",
            ring,
            ringK: rk,
          });

          // the position cell: pops in, slides up onto its meaning cell, then fades away over the sum
          const ak = A10.seq(t, TM.pos + 0.1 * i, 0.05, 0.3, j);
          const dk = ramp(t, TM.slide[0] + 0.02 * j, land, E.inOut);
          const ap = A10.pop(ak);
          pos[i].set(j, {
            ...ap,
            s: ap.s * (worked ? workBump : 1),
            y: DY(j) * dk,
            o: ap.o * (1 - clamp(fk * 1.8)), // gone before the sum's digits finish popping, so the two never read as one smudge
            ring: worked && workK > 0 ? "green" : undefined,
            ringK: worked ? workK : 0,
          });
        }
        // the slot tag and the plus sign
        slot[i].set({
          k: ramp(t, TM.slot + 0.1 * i, TM.slot + 0.1 * i + 0.3, lin),
          o: 1 - ramp(t, ...TM.slotOut, lin),
        });
        const pk = A10.seq(t, TM.plus, 0.08, 0.3, i);
        const under = i === B1 ? 1 - ramp(t, TM.work[0], TM.work[0] + 0.2, lin) : 1; // the worked sum takes its place
        V.place(plus[i], { s: 0.4 + 0.6 * E.pop(pk), o: clamp(pk * 5) * under * (1 - ramp(t, ...TM.plusOut, lin)) });
      }
      cue.set({ k: ramp(t, ...TM.cue, lin), o: 1 - ramp(t, ...TM.cueOut, lin) });
      work.set({ k: ramp(t, ...TM.work, lin), o: 1 - ramp(t, ...TM.workOut, lin) });

      // "same" -> "different" under the two banks
      same.forEach((tg) => {
        if (t < 10) tg.set({ text: "same", tone: "orange", k: ramp(t, ...TM.same, lin), o: gone });
        else tg.set({ text: "different", tone: "green", k: ramp(t, ...TM.diff, lin) });
      });

      // the orange line joins the two banks; its equals sign turns into a question mark: which one came first?
      const jIn = ramp(t, ...TM.join, E.out);
      [joinL, joinR].forEach((e) => {
        e.style.transform = `scaleX(${jIn.toFixed(3)})`;
        e.style.opacity = String(gone);
        e.style.visibility = jIn * gone <= 0.001 ? "hidden" : "";
      });
      V.place(equals, { s: 0.5 + 0.5 * E.pop(jIn), o: clamp(jIn * 4) * (1 - ramp(t, ...TM.eqOut, lin)) * gone });
      const qk = ramp(t, ...TM.q, lin);
      V.place(q, { s: 0.5 + 0.5 * E.pop(qk), o: clamp(qk * 4) * gone });
      L5.drawOn(q, clamp(qk * 1.3));

      input.set({ k: ramp(t, ...TM.input, lin) });
    };
  }

  V.scene({
    kicker: "WORDS TO NUMBERS",
    title: ["Words become numbers,", "plus their position"],
    dur: 14,
    caps: [
      [0.5, 2.3, "Text is cut into tokens."],
      [2.5, 4.3, "Each token becomes a list of numbers."],
      [4.6, 6.4, "The two banks get exactly the same numbers."],
      [6.5, 8.2, "Nothing says which one came first."],
      [8.5, 10, "Add a position pattern to every token."],
      [10.1, 11.5, "Add them up, number by number."],
      [12.1, 13.8, "Now the two banks are different."],
    ],
    build,
  });
})();

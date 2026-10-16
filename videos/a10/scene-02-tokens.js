/* Phase 10 · scene 02-tokens (13 s): text is cut into tokens, every token is looked up as a list of numbers (blue), and the two
   copies of "bank" in "the bank by the river bank" get the SAME numbers, so nothing tells them apart (lesson 10.1). Adding a position
   pattern (orange, one list per slot) to every token makes them different (green). Every number comes from A10.TOK (common.js).
   Story (local seconds): 0.2-1.4 six word tags pop; 1.6-3.9 the meaning strips pop column by column; 4.4-5.2 the two banks get a ring
   and a "same" tag, an orange equals sign joins them; 6.3-6.9 a question mark; 8.0-8.3 all of that fades; 8.3-9.7 plus signs, the
   position strips and their slot tags pop; 10.0-10.8 the position strips slide onto the meaning strips as the numbers flip to the
   sums (blue -> green); 10.9-11.5 the banks ring green and read "different"; 11.6-12.1 "model input". */
(function () {
  const V = window.VID;
  const A10 = V.a10;
  const L5 = V.l5;
  const { ramp, clamp, ease: E } = V;

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
  T.sumTxt.forEach((row, i) =>
    row.forEach((s, j) =>
      A10.close(`tokens: shown sum ${i}.${j}`, +(num(T.embTxt[i][j]) + num(T.posTxt[i][j])).toFixed(1), num(s), 1e-9),
    ),
  );

  const xc = (i) => 18 + 150 * i; // left edge of column i
  const cx = (i) => xc(i) + 60; // centre of column i
  const lin = E.lin;
  const isBank = (i) => i === B1 || i === B2;

  const TM = {
    words: 0.2, // six tags, 0.15 s apart
    meaning: 1.6, // column i starts here + 0.3 i, its cells 0.06 s apart
    ring: [4.4, 4.9],
    same: [4.6, 5.0],
    join: [5.0, 5.5], // the orange line and equals sign between the two "same" tags
    joinOut: [6.0, 6.2],
    q: [6.3, 6.9],
    gone: [8.0, 8.3], // same tags, rings, question mark fade
    plus: 8.3, // plus i at 8.3 + 0.08 i
    pos: 8.3, // position column i at 8.3 + 0.1 i, cells 0.05 s apart
    slot: 8.5, // slot tag i at 8.5 + 0.1 i
    slide: [10.0, 10.55], // the position strips slide up as one
    absorb: [10.5, 10.78], // and shrink into the meaning strips
    plusOut: [10.0, 10.2],
    slotOut: [10.0, 10.3],
    flip: 10.58, // meaning cell (i, j) flips at 10.58 + 0.03 j + 0.02 i, 0.3 s
    diff: [11.1, 11.5], // green rings and "different" tags
    input: [11.6, 12.1],
  };
  const DY = (j) => 78 + 52 * j + 23 - (364 + 50 * j + 22); // strip cell j travels exactly onto meaning cell j (centres)

  function build(stage) {
    const tags = T.words.map((w, i) => A10.tag(stage, { x: cx(i) - A10.tagW(w) / 2, y: 0, text: w }));
    const meaning = T.words.map((_, i) =>
      A10.cells(stage, { x: xc(i) + 10, y: 78, texts: T.embTxt[i], w: 100, h: 46, gap: 6, dir: "col", tone: "blue" }),
    );
    const pos = T.words.map((_, i) =>
      A10.cells(stage, {
        x: xc(i) + 10,
        y: 364,
        texts: T.posTxt[i],
        w: 100,
        h: 44,
        gap: 6,
        dir: "col",
        tone: "orange",
      }),
    );
    const slot = T.words.map((_, i) => A10.tag(stage, { x: cx(i) - 60, y: 572, text: `slot ${i}` }));
    const same = [B1, B2].map((b) =>
      A10.tag(stage, { x: cx(b) - 81, y: 292, w: 162, text: "same", tone: "orange", solid: true }),
    );
    const orange = A10.tone("orange").c;
    const joinL = V.h("div", {
      style: {
        position: "absolute",
        left: "317px",
        top: "318px",
        width: "186px",
        height: "7px",
        borderRadius: "4px",
        background: orange,
        transformOrigin: "0% 50%",
      },
    });
    const joinR = V.h("div", {
      style: {
        position: "absolute",
        left: "553px",
        top: "318px",
        width: "186px",
        height: "7px",
        borderRadius: "4px",
        background: orange,
        transformOrigin: "100% 50%",
      },
    });
    stage.append(joinL, joinR);
    const svg = A10.svg(stage);
    const equals = svg.appendChild(A10.op("equals", cx(3), 321, 44, "orange"));
    const q = svg.appendChild(A10.qmark(cx(3), 326, 54, "orange"));
    const plus = T.words.map((_, i) => svg.appendChild(A10.op("plus", cx(i), 330, 40, "orange")));
    const input = A10.tag(stage, { x: 365, y: 372, text: "model input", tone: "green", solid: true });
    A10.same("tokens: the model input tag is 206 px wide", input.w, 206);

    return (t) => {
      // the six word tags
      tags.forEach((tg, i) => tg.set({ k: A10.seq(t, TM.words, 0.15, 0.4, i) }));

      const gone = 1 - ramp(t, ...TM.gone, lin);
      const ringK = ramp(t, ...TM.ring, lin) * gone; // orange rings on the two banks
      const ringG = ramp(t, ...TM.diff, lin); // green rings at the end

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < ROWS; j++) {
          // the meaning cell: pops in, may carry a ring, flips to the sum
          const pk = A10.seq(t, TM.meaning + 0.3 * i, 0.06, 0.3, j);
          const fk = ramp(t, TM.flip + 0.03 * j + 0.025 * i, TM.flip + 0.03 * j + 0.025 * i + 0.3, lin);
          const ring = isBank(i) ? (ringG > 0 ? "green" : "orange") : undefined;
          meaning[i].flip(j, fk, {
            ...A10.pop(pk),
            from: T.embTxt[i][j],
            to: T.sumTxt[i][j],
            tone: "blue",
            toTone: "green",
            hop: 6,
            ring,
            ringK: ringG > 0 ? ringG : ringK,
          });

          // the position cell: pops in, then slides up onto the meaning strip and melts into it
          const ak = A10.seq(t, TM.pos + 0.1 * i, 0.05, 0.3, j);
          const s0 = TM.slide[0] + 0.03 * j;
          const s1 = TM.slide[1] + 0.03 * j;
          const dk = ramp(t, s0, s1, E.inOut);
          pos[i].set(j, {
            ...A10.pop(ak),
            y: DY * dk,
            o: Math.min(1, ak * 4) * (1 - ramp(t, s1 - 0.2, s1, lin)),
          });
        }
        // the slot tag and the plus sign
        slot[i].set({
          k: ramp(t, TM.slot + 0.1 * i, TM.slot + 0.1 * i + 0.3, lin),
          o: 1 - ramp(t, ...TM.slotOut, lin),
        });
        const pk = A10.seq(t, TM.plus, 0.08, 0.3, i);
        V.place(plus[i], { s: 0.4 + 0.6 * E.pop(pk), o: clamp(pk * 5) * (1 - ramp(t, ...TM.plusOut, lin)) });
      }

      // "same" -> "different" under the two banks
      same.forEach((tg) => {
        if (t < 9) tg.set({ text: "same", tone: "orange", k: ramp(t, ...TM.same, lin), o: gone });
        else tg.set({ text: "different", tone: "green", k: ramp(t, ...TM.diff, lin) });
      });

      // the orange line and equals sign that join the two banks, then the question mark
      const jk = ramp(t, ...TM.join, E.out) * (1 - ramp(t, ...TM.joinOut, lin));
      const jIn = ramp(t, ...TM.join, E.out);
      [joinL, joinR].forEach((e) => {
        e.style.transform = `scaleX(${jIn.toFixed(3)})`;
        e.style.opacity = String(1 - ramp(t, ...TM.joinOut, lin));
        e.style.visibility = jk <= 0.001 ? "hidden" : "";
      });
      V.place(equals, { s: 0.5 + 0.5 * E.pop(jIn), o: clamp(jIn * 4) * (1 - ramp(t, ...TM.joinOut, lin)) });
      const qk = ramp(t, ...TM.q, lin);
      V.place(q, { s: 0.5 + 0.5 * E.pop(qk), o: clamp(qk * 4) * gone });
      L5.drawOn(q, clamp(qk * 1.3));

      input.set({ k: ramp(t, ...TM.input, lin) });
    };
  }

  V.scene({
    kicker: "WORDS TO NUMBERS",
    title: ["Words become numbers,", "plus their position"],
    dur: 13,
    caps: [
      [0.5, 2.3, "Text is cut into tokens."],
      [2.5, 4.3, "Each token becomes a list of numbers."],
      [4.6, 6.4, "The two banks get exactly the same numbers."],
      [6.5, 8.2, "Nothing says which one came first."],
      [8.5, 10.3, "Add a position pattern to every token."],
      [11, 12.7, "Now the two banks are different."],
    ],
    build,
  });
})();

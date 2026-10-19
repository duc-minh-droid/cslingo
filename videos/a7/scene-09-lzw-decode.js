/* Phase 7 · Information Theory & Compression (algo-7), scene 09: LZW, "The decoder rebuilds the same dictionary" (13.2 s).
   The decoder gets only the five codes 0 1 2 4 3 and the two start entries (0 A, 1 B). Each code is looked up (a blue ring on the code
   and on its dictionary chip) and its chunk drops into the decoded row. From the second code on the decoder also LEARNS an entry, and
   the rule is drawn once with a three-slot sum that stays on screen: previous chunk + first letter of this chunk = new entry
   (A + B = AB, then B + A = BA; the matching tiles in the decoded row get a blue ring (previous) and an orange ring (first letter)).
   Code 4 is the odd one: the dictionary has no entry 4 yet (a dashed '?' chip), so the same sum has a '?' in its middle slot; the
   unknown chunk is the previous chunk plus ONE letter, so it must start with the previous chunk's own first letter: AB + A = ABA,
   exactly the entry the encoder had just made. The decoded text is the original; the decoded row grows as letters arrive (one dashed
   slot shows where the next one goes).
   Every value comes from A7.LZW and A7.LZW_DEC (common.js); nothing is typed here except the storyboard's own checks. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const lin = E.lin;
  const Z = A7.LZW;
  const D = A7.LZW_DEC;

  // ---------- the model: every number comes from the helpers, checked here ----------
  const MISSING = D.steps.findIndex((s) => s.missing);
  const N = D.steps.length;
  A7.same("decode scene: the codes", Z.codes, [0, 1, 2, 4, 3]);
  A7.same(
    "decode scene: the chunks",
    D.steps.map((s) => s.entry),
    ["A", "B", "AB", "ABA", "BA"],
  );
  A7.same(
    "decode scene: the letters of each chunk",
    D.steps.map((s) => [s.outFrom, s.outTo]),
    [
      [0, 1],
      [1, 2],
      [2, 4],
      [4, 7],
      [7, 9],
    ],
  );
  A7.same(
    "decode scene: which code is unknown",
    D.steps.map((s) => s.missing),
    [false, false, false, true, false],
  );
  A7.same("decode scene: the rule for it", D.steps[MISSING].rule, { prev: "AB", first: "A", text: "ABA" });
  A7.same(
    "decode scene: the entries it adds",
    D.steps.map((s) => (s.added ? `${s.added.idx}${s.added.text}` : "")),
    ["", "2AB", "3BA", "4ABA", "5ABAB"],
  );
  A7.same(
    "decode scene: its table is the encoder's table",
    D.dict,
    Z.dict.map((e) => e.text),
  );
  A7.same("decode scene: the text comes back", D.out, Z.text);
  A7.same(
    "decode scene: the unknown code is the next free entry",
    [D.steps[MISSING].code, D.steps[MISSING].added.idx],
    [4, 4],
  );
  // the rule the sum shows: new entry = previous chunk + first letter of this chunk (for the unknown code: of the previous chunk)
  const FIRST = D.steps.map((s) => (s.missing ? s.rule.first : s.entry[0]));
  D.steps.forEach((s, k) => {
    if (k) A7.same(`decode scene: step ${k} learns previous + first letter`, s.added.text, s.prev + FIRST[k]);
  });
  A7.same("decode scene: the sum steps are 1, 2 and the unknown code", [1, 2, MISSING], [1, 2, 3]);

  // ---------- the timeline (local seconds) ----------
  const S = [2.4, 3.5, 5.5, 7.1, 10.3]; // step k starts here
  A7.same("decode scene: one start time per code", S.length, N);
  const DONE = 11.6; // the last chunk is in: the row turns solid and the tick draws (to 12.1)
  // offsets inside a step: the code's ring, the chip lookup, the chunk's letters, the new chip, the sum
  const U = [
    { look: 0.2, out: 0.5, add: null, sum: null },
    { look: 0.2, out: 0.5, add: 1.7, sum: 0.9 },
    { look: 0.2, out: 0.5, add: 1.4, sum: 0.9 },
    { ghost: 0.1, out: 2.5, add: 2.3, sum: 0.5, solve: 1.6 }, // the '?' is solved at solve, the sum's result at solve + 0.3
    { look: 0.2, out: 0.5, add: 0.8, sum: null },
  ];
  const FADE = S[MISSING] + 2.9; // the sum leaves (0.3 s)
  const pop = (t, a, d = 0.3) => ramp(t, a, a + d, lin);

  // ---------- layout ----------
  // a left column of labels (x 42, 62 px tall), the content starts at X0 so a ring never touches a label
  const X0 = 244;
  const REC = { x: X0, y: 21, w: 72, h: 72, gap: 12 };
  const DICT = { x: X0, y: 130 }; // rows y 130 and 202
  const OUT = { x: 42, y: 534, w: 80, h: 80, gap: 20 }; // nine tiles end at x 922; the 20 px gaps keep neighbouring rings apart
  // the sum [previous] + [first letter] = [new entry]: tile centres 260 px apart so the labels under them never touch
  const FY = 290;
  const FH = 80;
  const FW = { prev: 120, first: 80, entry: 140 };
  const FC = { prev: 220, first: 480, entry: 740 };
  const LABY = 386;

  function build(stage) {
    // received codes
    const recTag = A7.tag(stage, { x: 42, y: REC.y + 6, text: "received", tone: "green" });
    const rec = A7.tiles(stage, {
      ...REC,
      fs: 40,
      items: Z.codes.map((c) => ({ text: String(c), tone: "green" })),
    });
    // the dictionary
    const dictTag = A7.tag(stage, { x: 42, y: DICT.y - 1, text: "dictionary", tone: "purple" });
    const dict = A7.chips(stage, { ...DICT, cols: 3, items: Z.dict.map((d) => ({ idx: d.idx, text: d.text })) });
    // the sum
    const tile = (key) => A7.tiles(stage, { x: FC[key] - FW[key] / 2, y: FY, items: [""], w: FW[key], h: FH, fs: 48 });
    const [fPrev, fFirst, fEntry] = [tile("prev"), tile("first"), tile("entry")];
    const signs = L5.svg(stage);
    const mid = (a, b) => (FC[a] + FW[a] / 2 + FC[b] - FW[b] / 2) / 2; // the middle of the gap between two tiles
    const plus = A7.sym("plus", mid("prev", "first"), FY + FH / 2, 44);
    const equals = A7.sym("equals", mid("first", "entry"), FY + FH / 2, 44, "green");
    signs.append(plus, equals);
    // each label is centred under its tile (explicit widths, so the centres are exact)
    const label = (key, text, w) => {
      const l = A7.tag(stage, { x: FC[key] - w / 2, y: LABY, text });
      l.el.style.width = `${w}px`;
      return l;
    };
    const [lPrev, lFirst, lEntry] = [
      label("prev", "previous", 160),
      label("first", "first letter", 200),
      label("entry", "new entry", 180),
    ];
    const lOwn = label("first", `${D.steps[MISSING].rule.prev}'s first letter`, 290);
    // the decoded text
    const decTag = A7.tag(stage, { x: 42, y: 466, text: "decoded", tone: "green" });
    const out = A7.tiles(stage, { ...OUT, fs: 48, items: [...D.out] });
    const tickSvg = L5.svg(stage);
    const tick = L5.tick(240, 497, 44, "green", { w: 9 });
    tickSvg.append(tick);

    // when each decoded letter arrives: the chunk's letters drop in together, 0.05 s apart
    const stepOf = (j) => D.steps.find((s) => j >= s.outFrom && j < s.outTo);
    const arriveAt = (j) => {
      const st = stepOf(j);
      return S[st.k] + U[st.k].out + 0.05 * (j - st.outFrom);
    };
    // the sum shows step k from here: step 1 pops it in, later steps change its tiles
    const sumAt = (k) => S[k] + U[k].sum;
    const sumStep = (t) => [1, 2, MISSING].reduce((a, k) => (t >= sumAt(k) ? k : a), -1);

    return (t) => {
      // ----- the received codes: the code being read has a ring (orange when it is the unknown one) -----
      recTag.set({ k: pop(t, 0.2) });
      rec.all((i) => {
        const b = i + 1 < N ? S[i + 1] : DONE;
        const ringK = pop(t, S[i], 0.4) * (1 - pop(t, b, 0.2));
        return {
          k: pop(t, 0.2 + 0.1 * i),
          ring: ringK > 0 ? (D.steps[i].missing ? "orange" : "blue") : undefined,
          ringK,
        };
      });

      // ----- the dictionary: two start chips, then one orange chip per new entry (entry 4 first as a '?') -----
      dictTag.set({ k: pop(t, 0.8) });
      dict.all((i) => {
        const k = D.steps.findIndex((s) => s.added && s.added.idx === i); // the step that adds this entry (-1 for the start chips)
        // the lookup ring of the code being read (blue, a pulse)
        const lk = D.steps.findIndex((s, q) => s.code === i && !s.missing && t >= S[q] + U[q].look);
        const look = lk < 0 ? 0 : pop(t, S[lk] + U[lk].look, 0.15) * (1 - pop(t, S[lk] + U[lk].look + 0.55, 0.2));
        const lookRing = look > 0 ? { ring: "blue", ringK: look } : {};
        if (k < 0) return { k: pop(t, 0.8 + 0.15 * i), ...lookRing };
        const add = S[k] + U[k].add;
        const settle = add + (D.steps[k].missing ? 0.9 : 0.45);
        const made = pop(t, add, 0.4); // the chip turns into the real entry
        const fresh = t < settle;
        const ring = { ring: "orange", ringK: made * (1 - pop(t, settle, 0.2)) };
        if (D.steps[k].missing) {
          const ghostK = pop(t, S[k] + U[k].ghost, 0.4);
          if (t < add) return { k: ghostK, ghost: true, text: "?", tone: "orange", ring: "orange", ringK: ghostK };
          const bump = 1 + 0.05 * flash(t, add, add + 0.5);
          return fresh ? { tone: "orange", solid: true, s: bump, ...ring } : {};
        }
        if (made <= 0) return { k: 0 };
        return fresh ? { k: made, tone: "orange", solid: true, ...ring } : { ...lookRing };
      });

      // ----- the sum for the new entry: [previous] + [first letter] = [new entry] (steps 1 and 2, then the unknown code) -----
      const fk = sumStep(t);
      const fo = 1 - pop(t, FADE, 0.3); // the whole sum leaves, text and all
      const first = sumAt(1);
      const swap = fk > 1 ? sumAt(fk) : first; // the moment the tiles last changed (for the little bump)
      const bump = fk > 1 ? 1 + 0.08 * flash(t, swap, swap + 0.3) : 1;
      const st = fk < 0 ? null : D.steps[fk];
      const solved = fk === MISSING ? pop(t, S[MISSING] + U[MISSING].solve, 0.3) : 1;
      const done = fk === MISSING ? pop(t, S[MISSING] + U[MISSING].solve + 0.3, 0.3) : 1;
      fPrev.set(0, { tone: "blue", text: st ? st.prev : "", k: pop(t, first), o: fo, s: bump });
      fFirst.set(0, {
        tone: "orange",
        solid: solved >= 1,
        ghost: solved < 1,
        text: !st || solved < 1 ? "?" : FIRST[fk],
        k: pop(t, first + 0.2),
        o: fo,
        s: bump,
      });
      fEntry.set(0, {
        tone: "green",
        ghost: done < 1,
        text: !st || done < 1 ? "?" : st.added.text,
        k: pop(t, first + 0.4),
        o: fo,
        s: bump,
      });
      V.place(plus, { s: 0.8 + 0.2 * E.pop(pop(t, first + 0.1)), o: Math.min(1, pop(t, first + 0.1) * 4) * fo });
      V.place(equals, { s: 0.8 + 0.2 * E.pop(pop(t, first + 0.3)), o: Math.min(1, pop(t, first + 0.3) * 4) * fo });
      const own = fk === MISSING; // the unknown code's middle label names whose first letter it is
      lPrev.set({ k: pop(t, first + 0.1), o: fo });
      lFirst.set({ k: own ? 0 : pop(t, first + 0.2), o: fo });
      lOwn.set({ k: own ? pop(t, sumAt(MISSING) + 0.3) : 0, o: fo });
      lEntry.set({ k: pop(t, first + 0.5), o: fo });

      // ----- the decoded text: it grows as chunks arrive (one dashed slot marks the next letter), then turns solid green -----
      // once the sum has left, the decoded row slides up to sit nearer the dictionary (no tall empty band in the last seconds)
      const lift = 90 * ramp(t, FADE + 0.4, FADE + 1.0, E.inOut);
      decTag.set({ k: pop(t, 1.0), y: -lift });
      const next = [...D.out].findIndex((_, j) => t < arriveAt(j)); // the first letter that has not arrived (-1: all are in)
      // rings that tie the sum to the row: blue on the previous chunk, orange on the letter the sum's middle tile comes from
      const ringFor = (j) => {
        if (fk < 1) return {};
        const prev = D.steps[fk - 1];
        const k = pop(t, sumAt(fk), 0.2) * fo;
        if (fk === MISSING) {
          // the unknown chunk starts like the previous one: that chunk's first letter is where the middle tile comes from
          if (j === prev.outFrom && solved >= 1) return { ring: "orange", ringK: k };
          if (j >= prev.outFrom && j < prev.outTo) return { ring: "blue", ringK: k };
          return {};
        }
        if (j >= prev.outFrom && j < prev.outTo) return { ring: "blue", ringK: k };
        if (j === D.steps[fk].outFrom) return { ring: "orange", ringK: k };
        return {};
      };
      out.all((j) => {
        const at = arriveAt(j);
        if (t < at) return j === next ? { ghost: true, text: "", k: pop(t, 1.0 + 0.2), y: -lift } : { k: 0 };
        const sd = DONE + 0.04 * j;
        return {
          tone: "green",
          solid: t >= sd,
          s: (0.75 + 0.25 * E.pop(pop(t, at))) * (1 + 0.08 * flash(t, sd, sd + 0.3)),
          y: -lift,
          ...ringFor(j),
        };
      });
      L5.drawOn(tick, ramp(t, DONE, DONE + 0.5, lin));
      V.place(tick, { y: -lift });
    };
  }

  V.scene({
    kicker: "LZW",
    title: ["The decoder rebuilds", "the same dictionary"],
    dur: 13.2,
    caps: [
      [0.9, 2.3, "Only codes arrive, plus the A, B start."],
      [4.3, 7.0, "Each code adds an entry: previous plus first letter."],
      [7.8, 10.1, "Code 4 is not in yet: AB plus AB's first letter."],
      [10.8, 12.7, "Same text back. No dictionary sent."],
    ],
    build,
  });
})();

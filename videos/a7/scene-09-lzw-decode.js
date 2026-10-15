/* Phase 7 · Information Theory & Compression (algo-7), scene 09: LZW, "The decoder rebuilds the same dictionary" (12 s).
   The decoder gets only the five codes 0 1 2 4 3 and the two start entries (0 A, 1 B). Each code is looked up (a blue ring on the code and
   on its dictionary chip), its chunk drops into the decoded row, and one new entry (the previous chunk + the first letter of this one)
   joins the dictionary. Code 4 is the odd one: the table has no entry 4 yet (a dashed '?' chip), so the decoder builds it as
   previous + its first letter, AB + A = ABA, and that is exactly the entry the encoder had just made. The decoded text is the original.
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

  // ---------- the timeline (local seconds) ----------
  const S = [2.6, 3.8, 5.0, 6.2, 9.0]; // step k starts here
  A7.same("decode scene: one start time per code", S.length, N);
  const DONE = 10.3; // the last chunk is in: the row turns solid and the tick draws (to 10.8)
  const stepT = D.steps.map((s, k) => {
    const miss = s.missing;
    const add = s.added ? S[k] + (miss ? 1.8 : 0.8) : null;
    return {
      ring: S[k], // the code gets its ring
      look: S[k] + 0.2, // the chip it names gets a ring (the lookup)
      out: S[k] + (miss ? 2.1 : 0.5), // the chunk's letters drop into the decoded row
      add, // the new chip pops (orange)
      settle: add == null ? null : add + (miss ? 0.9 : 0.45), // ...and settles to purple
    };
  });
  const F0 = S[MISSING] + 0.7; // the formula row: AB, plus, A, equals, ABA (0.2 s apart)
  const FT = [0, 1, 2, 3, 4].map((i) => F0 + 0.2 * i);
  const LAB = [S[MISSING] + 0.9, S[MISSING] + 1.1, S[MISSING] + 1.7]; // previous, its first letter, new entry
  const FADE = S[MISSING] + 2.8; // the formula row leaves (0.4 s)
  const pop = (t, a, d = 0.3) => ramp(t, a, a + d, lin);

  // ---------- layout ----------
  // a left column of labels (x 42, 62 px tall), the content starts at X0 so a ring never touches a label
  const X0 = 244;
  const REC = { x: X0, y: 21, w: 72, h: 72, gap: 12 };
  const DICT = { x: X0, y: 130 }; // rows y 130 and 202
  const OUT = { x: 42, y: 534, w: 84, h: 80, gap: 12 };
  // the formula row [AB] + [A] = [ABA]: tile centres 215 px apart so the three labels under them (157, 223, 179 px wide) clear each other
  const FY = 300;
  const FH = 80;
  const FW = { AB: 120, A: 80, ABA: 140 };
  const FC = { AB: X0 + 78, A: X0 + 78 + 215, ABA: X0 + 78 + 430 }; // centres (labels start at X0)
  const LABY = 394;

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
    // the formula row (only for the unknown code)
    const rule = D.steps[MISSING].rule;
    const row = (key, text) =>
      A7.tiles(stage, { x: FC[key] - FW[key] / 2, y: FY, items: [text], w: FW[key], h: FH, fs: 48 });
    const fAB = row("AB", rule.prev);
    const fA = row("A", rule.first);
    const fABA = row("ABA", rule.text);
    const signs = L5.svg(stage);
    const mid = (a, b) => (FC[a] + FW[a] / 2 + FC[b] - FW[b] / 2) / 2; // the middle of the gap between two tiles
    const plus = A7.sym("plus", mid("AB", "A"), FY + FH / 2, 44);
    const equals = A7.sym("equals", mid("A", "ABA"), FY + FH / 2, 44, "green");
    signs.append(plus, equals);
    // each label is centred under its tile (the widths are the rendered ones: 157, 223 and 179 px)
    const label = (key, text, w) => A7.tag(stage, { x: FC[key] - w / 2, y: LABY, text });
    const labels = [label("AB", "previous", 157), label("A", "its first letter", 223), label("ABA", "new entry", 179)];
    // the decoded text
    const decTag = A7.tag(stage, { x: 42, y: 466, text: "decoded", tone: "green" });
    const out = A7.tiles(stage, { ...OUT, fs: 48, items: [...D.out] });
    const tickSvg = L5.svg(stage);
    const tick = L5.tick(240, 497, 44, "green", { w: 9 });
    tickSvg.append(tick);

    // the step that decodes letter j
    const stepOf = (j) => D.steps.find((s) => j >= s.outFrom && j < s.outTo);

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
        const lk = D.steps.findIndex((s, q) => s.code === i && !s.missing && t >= stepT[q].look);
        const look = lk < 0 ? 0 : pop(t, stepT[lk].look, 0.15) * (1 - pop(t, stepT[lk].look + 0.55, 0.2));
        const lookRing = look > 0 ? { ring: "blue", ringK: look } : {};
        if (k < 0) return { k: pop(t, 0.8 + 0.15 * i), ...lookRing };
        const T = stepT[k];
        const made = pop(t, T.add, 0.4); // the chip turns into the real entry
        const fresh = t < T.settle;
        const ring = { ring: "orange", ringK: made * (1 - pop(t, T.settle, 0.2)) };
        if (D.steps[k].missing) {
          const ghostK = pop(t, S[k], 0.4);
          if (t < T.add) return { k: ghostK, ghost: true, text: "?", tone: "orange", ring: "orange", ringK: ghostK };
          const bump = 1 + 0.05 * flash(t, T.add, T.add + 0.5);
          return fresh ? { tone: "orange", solid: true, s: bump, ...ring } : {};
        }
        if (made <= 0) return { k: 0 };
        return fresh ? { k: made, tone: "orange", solid: true, ...ring } : { ...lookRing };
      });

      // ----- the formula for the unknown code: [AB] + [A] = [ABA] -----
      const fo = 1 - pop(t, FADE, 0.4); // the whole row leaves, text and all
      fAB.set(0, { tone: "blue", k: pop(t, FT[0]), o: fo });
      V.place(plus, { s: 0.8 + 0.2 * E.pop(pop(t, FT[1])), o: Math.min(1, pop(t, FT[1]) * 4) * fo });
      fA.set(0, { tone: "orange", solid: true, k: pop(t, FT[2]), o: fo });
      V.place(equals, { s: 0.8 + 0.2 * E.pop(pop(t, FT[3])), o: Math.min(1, pop(t, FT[3]) * 4) * fo });
      fABA.set(0, { tone: "green", k: pop(t, FT[4]), o: fo });
      labels.forEach((l, i) => l.set({ k: pop(t, LAB[i]), o: fo }));

      // ----- the decoded text: dashed slots first, each chunk drops in as a group, then the row turns solid green -----
      decTag.set({ k: pop(t, 1.0) });
      out.all((j) => {
        const st = stepOf(j);
        const at = stepT[st.k].out + 0.05 * (j - st.outFrom); // letters of a chunk pop 0.05 s apart
        if (t < at) return { ghost: true, text: "", k: pop(t, 1.0 + 0.04 * j) };
        const sd = DONE + 0.04 * j;
        return {
          tone: "green",
          solid: t >= sd,
          s: (0.75 + 0.25 * E.pop(pop(t, at))) * (1 + 0.08 * flash(t, sd, sd + 0.3)),
        };
      });
      L5.drawOn(tick, ramp(t, DONE, DONE + 0.5, lin));
    };
  }

  V.scene({
    kicker: "LZW",
    title: ["The decoder rebuilds", "the same dictionary"],
    dur: 12,
    caps: [
      [0.9, 2.5, "Only codes arrive, plus the A, B start."],
      [4.7, 6.3, "Each code adds one entry to the table."],
      [7.4, 9.6, "Code 4 is unknown: it is AB plus its first letter."],
      [10.3, 11.9, "Same text back. No dictionary sent."],
    ],
    build,
  });
})();

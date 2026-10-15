/* Phase 7 · Information Theory & Compression (algo-7), scene 08: LZW, "LZW learns phrases as it reads" (13 s).
   The lecture's example: ABABABABA with the start dictionary A = 0, B = 1. A blue bracket marks the phrase w, an orange ring the next
   letter c. If w + c is already in the dictionary its chip gets a blue ring (the lookup) and w just grows. If it is new: the phrase w is
   sent as ONE code (the bracket turns green and stays, the code flies down into the sent row) and w + c is learned (an orange chip pops
   into the dictionary); the next phrase restarts at c. Result: 0 1 2 4 3, nine letters became five codes, four new entries.
   Story (local seconds): 0.2 the tape, 0.45 the dictionary with its start chips A and B, 0.8 the legend and the sent row, 1.0 the first
   bracket and ring. Step k runs from STEP_T[k]: it asks first (bracket, ring, and for a known phrase a blue ring on its chip) and then
   acts (grow: the bracket widens; send: the bracket turns green and stays, the code flies down, 0.3 s later the new chip pops).
   11.15 the last code leaves, 11.6 the "9 letters, 5 codes" tag. Nothing moves after 12.
   Every value comes from A7.LZW (common.js) and is asserted below; nothing is typed here. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;
  const Z = A7.LZW;
  const S = Z.steps;
  const TEXT = [...Z.text];

  // ---------- the model: every number comes from the helpers, checked here ----------
  A7.same("lzw scene: text and codes", [Z.text, Z.codes], ["ABABABABA", [0, 1, 2, 4, 3]]);
  A7.same(
    "lzw scene: acts",
    S.map((s) => s.act),
    ["emit", "emit", "grow", "emit", "grow", "grow", "emit", "grow", "final"],
  );
  A7.same(
    "lzw scene: dictionary",
    Z.dict.map((d) => `${d.idx}${d.text}`),
    ["0A", "1B", "2AB", "3BA", "4ABA", "5ABAB"],
  );
  const SENDS = S.filter((s) => s.act !== "grow"); // the five steps that send a code
  A7.same(
    "lzw scene: the sending steps match the chunks",
    SENDS.map((s) => [s.code, s.wFrom, s.wTo]),
    Z.chunks.map((c) => [c.code, c.from, c.to]),
  );
  A7.same("lzw scene: nine letters, five codes", [TEXT.length, Z.codes.length], [9, 5]);
  S.forEach((s) => {
    // a new phrase is learned as w + c; a known one grows the phrase by exactly the letter c
    if (s.act === "emit") A7.same(`lzw scene: step ${s.k} learns w + c`, s.add.text, s.w + s.c);
    if (s.act === "grow")
      A7.same(`lzw scene: step ${s.k} grows by c`, [s.wTo - s.wFrom, s.wTo2], [s.w.length, s.i + 1]);
  });
  const LEARN = Object.fromEntries(S.filter((s) => s.add).map((s) => [s.add.idx, s])); // chip index -> the step that adds it
  const LOOK = {}; // chip index -> the grow steps that look it up
  S.filter((s) => s.act === "grow").forEach((s) => {
    const idx = Z.dict.findIndex((d) => d.text === s.w + s.c);
    if (!LEARN[idx] || LEARN[idx].k >= s.k)
      throw new Error(`lzw scene: step ${s.k} looks up ${s.w + s.c} before it was learned`);
    (LOOK[idx] = LOOK[idx] || []).push(s);
  });

  // ---------- timeline (local seconds) ----------
  const STEP_T = [2.5, 3.9, 5.1, 6.1, 7.3, 8.1, 8.9, 10.1, 10.9];
  const END = 12.0; // the last step ends here
  A7.same("lzw scene: one start time per step", STEP_T.length, S.length);
  const ASK_SHARE = { grow: 0.45, emit: 0.38, final: 0.23 }; // the share of a step spent asking (the rest acts)
  const ASK0 = STEP_T.map((t, k) => (k ? t : 1.0)); // the bracket and the ring are there from here (step 0: from 1.0)
  const ACT = STEP_T.map((t, k) => t + ASK_SHARE[S[k].act] * ((STEP_T[k + 1] ?? END) - t)); // the step's action starts
  const SEND = SENDS.map((s) => ACT[s.k]); // the code of chunk m is sent here
  const FLY = 0.55; // a code takes this long to fly to the sent row
  const LEARN_AT = 0.3; // the new chip pops this long after the code leaves
  const SETTLE = 0.65; // an orange (new) chip turns purple this long after it popped
  const TAG_AT = SEND[SEND.length - 1] + FLY - 0.1;

  // ---------- layout (stage px) ----------
  const colX = (i) => 42 + 96 * i; // left edge of tape tile i
  const spanW = (from, to) => 96 * (to - from) - 12; // a bracket under tiles from..to-1
  const TAPE_Y = 84; // the tape sits under a legend row
  const SPAN_Y = 184;
  const SENT = { x: 156, y: 262 };

  const tapeOf = TEXT.map((_, j) => Z.chunks.findIndex((c) => j >= c.from && j < c.to)); // the chunk (code) of every letter
  if (tapeOf.includes(-1)) throw new Error("lzw scene: every letter must belong to a sent chunk");

  function build(stage) {
    const tape = A7.tiles(stage, { x: 42, y: TAPE_Y, items: TEXT, w: 84, h: 84, gap: 12, fs: 48 });
    const chunkSpans = Z.chunks.map((c) =>
      A7.span(stage, { x: colX(c.from), y: SPAN_Y, w: spanW(c.from, c.to), tone: "green" }),
    );
    const wSpan = A7.span(stage, { x: colX(0), y: SPAN_Y, w: 72, tone: "blue" });
    const keyPhrase = A7.tag(stage, { x: 42, y: 12, text: "phrase so far", tone: "blue", h: 52 });
    const keyNext = A7.tag(stage, { x: 300, y: 12, text: "next letter", tone: "orange", h: 52 });
    const sentTag = A7.tag(stage, { x: 42, y: SENT.y + 10, text: "sent", tone: "green", h: 52 });
    const sent = A7.tiles(stage, {
      ...SENT,
      items: Z.codes.map((c) => ({ text: String(c), tone: "green" })),
      w: 72,
      h: 72,
      gap: 12,
      fs: 40,
    });
    const dictTag = A7.tag(stage, { x: 42, y: 382, text: "dictionary", tone: "purple", h: 52 });
    const dict = A7.chips(stage, { x: 42, y: 452, cols: 3, items: Z.dict.map((d) => ({ idx: d.idx, text: d.text })) });
    const endTag = A7.tag(stage, {
      x: SENT.x + 84 * Z.codes.length + 12,
      y: SENT.y + 10,
      text: `${TEXT.length} letters, ${Z.codes.length} codes`,
      tone: "green",
      solid: true,
      h: 52,
    });

    // the step that is running at time t (-1 before the first bracket appears)
    const stepAt = (t) => ASK0.reduce((k, a, i) => (t >= a ? i : k), -1);

    function drawTape(t, k) {
      tape.all((j) => {
        const st = { k: ramp(t, 0.2 + 0.08 * j, 0.5 + 0.08 * j, lin) };
        const m = tapeOf[j];
        const sentAt = SEND[m] + 0.04 * (j - Z.chunks[m].from); // the letters of a chunk turn green together, left to right
        const step = S[Math.max(k, 0)];
        const grown = step.act === "grow" && t >= ACT[step.k] + 0.12 ? 1 : 0; // the new letter joins the phrase as the bracket widens
        if (t >= sentAt) {
          st.tone = "green";
          st.s = 1 + 0.07 * flash(t, sentAt, sentAt + 0.35);
        } else if (k >= 0 && j >= step.wFrom && j < step.wTo + grown) st.tone = "blue";
        // the ring on the next letter c: pops in while we look at it, goes when the step acts
        const own = j >= 1 ? S[j - 1] : null; // step k has c = tile k + 1
        if (own && own.act !== "final") {
          const ringK =
            ramp(t, ASK0[own.k] + 0.1, ASK0[own.k] + 0.35, lin) * (1 - ramp(t, ACT[own.k], ACT[own.k] + 0.15, lin));
          if (ringK > 0.01) Object.assign(st, { ring: "orange", ringK });
        }
        return st;
      });
    }

    function drawBrackets(t, k) {
      if (k < 0) wSpan.set({ k: 0 });
      else {
        const s = S[k];
        const grow = s.act === "grow";
        const end = grow ? lerp(s.wTo, s.wTo2, ramp(t, ACT[k], ACT[k] + 0.35, E.inOut)) : s.wTo;
        const fresh = k === 0 || S[k - 1].act !== "grow"; // the bracket restarts (pops in) after a code was sent
        const swapped = !grow && t >= ACT[k] + 0.25; // the green chunk bracket has taken over
        wSpan.set({
          x: colX(s.wFrom),
          w: spanW(s.wFrom, end),
          k: swapped ? 0 : fresh ? ramp(t, ASK0[k], ASK0[k] + 0.3) : 1,
        });
      }
      // a sent phrase keeps a green bracket: it sweeps over the blue one the moment its code leaves
      chunkSpans.forEach((sp, m) => sp.set({ k: ramp(t, SEND[m], SEND[m] + 0.25, E.out), tone: "green" }));
    }

    // the code of chunk m flies from its bracket down into its slot of the sent row
    function drawSent(t) {
      sent.all((m) => {
        const c = Z.chunks[m];
        const e = ramp(t, SEND[m], SEND[m] + FLY, E.inOut);
        const from = { x: colX(c.from) + spanW(c.from, c.to) / 2, y: SPAN_Y + 7 };
        const to = sent.mid(m);
        return {
          k: ramp(t, SEND[m], SEND[m] + 0.2, lin),
          x: (1 - e) * (from.x - to.x),
          y: (1 - e) * (from.y - to.y),
          s: (0.7 + 0.3 * e) * (1 + 0.08 * flash(t, SEND[m] + FLY - 0.1, SEND[m] + FLY + 0.2)),
        };
      });
    }

    // the dictionary: A and B at the start, then one orange chip per new phrase that settles to purple
    function drawDict(t) {
      dict.all((i) => {
        const st = {};
        if (i < Z.alpha.length) st.k = ramp(t, 0.55 + 0.12 * i, 0.9 + 0.12 * i, lin);
        else {
          const born = ACT[LEARN[i].k] + LEARN_AT;
          st.k = ramp(t, born, born + 0.35, lin);
          if (t < born + SETTLE) Object.assign(st, { tone: "orange", solid: true });
          const ringK = ramp(t, born, born + 0.25, lin) * (1 - ramp(t, born + 0.45, born + 0.7, lin));
          if (ringK > 0.01) Object.assign(st, { ring: "orange", ringK });
        }
        // the lookup: a blue ring on the chip that w + c matches
        (LOOK[i] || []).forEach((s) => {
          const ringK =
            ramp(t, ASK0[s.k] + 0.08, ASK0[s.k] + 0.28, lin) * (1 - ramp(t, ACT[s.k] + 0.3, ACT[s.k] + 0.5, lin));
          if (ringK > 0.01)
            Object.assign(st, { ring: "blue", ringK, s: 1 + 0.06 * flash(t, ASK0[s.k] + 0.08, ASK0[s.k] + 0.4) });
        });
        return st;
      });
    }

    return (t) => {
      const k = stepAt(t);
      drawTape(t, k);
      drawBrackets(t, k);
      drawSent(t);
      drawDict(t);
      keyPhrase.set({ k: ramp(t, 0.8, 1.15) });
      keyNext.set({ k: ramp(t, 0.9, 1.25) });
      sentTag.set({ k: ramp(t, 0.8, 1.15) });
      dictTag.set({ k: ramp(t, 0.45, 0.8) });
      endTag.set({ k: ramp(t, TAG_AT, TAG_AT + 0.4) });
    };
  }

  V.scene({
    kicker: "LZW",
    title: ["LZW learns phrases", "as it reads"],
    dur: 13,
    caps: [
      [0.4, 2.4, "LZW starts with a tiny dictionary: A and B."],
      [2.6, 4.8, "A new longer phrase: send a code, learn it."],
      [5.2, 6.8, "Known? Keep growing."],
      [7.2, 8.7, "Still known: grow again."],
      [8.9, 10.4, "Longer phrases get one code each."],
      [11.4, 12.9, "Nine letters became five codes."],
    ],
    build,
  });
})();

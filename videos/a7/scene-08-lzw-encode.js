/* Phase 7 · Information Theory & Compression (algo-7), scene 08: LZW, "LZW learns phrases as it reads" (14 s).
   The lecture's example: ABABABABA with the start dictionary A = 0, B = 1. A blue bracket marks the phrase w, an orange ring the next
   letter c. Every step asks "is w + c known?" and DRAWS the test: a blue tile with the candidate (w + c) appears at the right of the
   dictionary, then a green tick (known: its chip gets a blue ring and w just grows) or a red cross (new: the phrase w is sent as ONE
   code, the bracket turns green and stays, the code flies down into the sent row, and w + c is learned as an orange chip); the next
   phrase restarts at c. Result: 0 1 2 4 3, nine letters became five codes, four new entries.
   Story (local seconds): 0.2 the tape, 0.45 the dictionary with its start chips A and B, 0.8 the legend and the sent row, 1.0 the first
   bracket and ring. Step k runs from STEP_T[k]: it asks first (bracket, ring, the candidate tile and its tick or cross) and then
   acts (grow: the bracket widens; send: the bracket turns green and stays, the code flies down, 0.3 s later the new chip pops).
   Nothing moves after the "9 letters, 5 codes" tag.
   Every value comes from A7.LZW (common.js) and is asserted below; nothing is typed here. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const L5 = V.l5;
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
  const LEN = { emit: 1.35, grow: 0.95, final: 1.2 }; // how long a step runs: a new phrase takes longer (send, then learn)
  const START = 2.9; // the first step starts here: the first caption explains the start dictionary
  const STEP_T = S.reduce((a, s, k) => [...a, k ? a[k - 1] + LEN[S[k - 1].act] : START], []);
  const END = STEP_T[S.length - 1] + LEN.final; // the last step ends here
  A7.same("lzw scene: one start time per step", STEP_T.length, S.length);
  const ASK_SHARE = { grow: 0.5, emit: 0.5, final: 0.25 }; // the share of a step spent asking (the rest acts)
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
  const TEST = { x: 668, y: 452, w: 190, h: 76 }; // the "known?" test: the candidate tile, with its tick or cross at the right

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
    // the test every step runs: is the phrase plus the next letter in the dictionary?
    const lookTag = A7.tag(stage, { x: TEST.x, y: 382, text: "known?", tone: "grey", h: 52 });
    const cand = A7.tiles(stage, { x: TEST.x, y: TEST.y, items: ["ABAB"], w: TEST.w, h: TEST.h, fs: 44 });
    const verdictSvg = L5.svg(stage);
    const [vx, vy] = [TEST.x + TEST.w + 44, TEST.y + TEST.h / 2];
    const tick = L5.tick(vx, vy, 52, "green", { w: 10 });
    const cross = L5.cross(vx, vy, 52, "red", { w: 10 });
    verdictSvg.append(tick, cross);
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

    // the candidate w + c and its verdict: a tick (known) or a cross (new) lands before the step acts, and both leave with the step
    function drawLookup(t, k) {
      const s = k >= 0 ? S[k] : null;
      const asks = s && s.act !== "final";
      const u = asks ? t - STEP_T[k] : 0;
      const len = asks ? LEN[s.act] : 1;
      const ask = asks ? ASK_SHARE[s.act] * len : 1;
      const fade = 1 - ramp(u, len - 0.14, len, lin);
      cand.set(0, {
        text: asks ? s.w + s.c : "",
        tone: "blue",
        k: asks ? ramp(u, 0.05, 0.25, lin) : 0,
        o: fade,
      });
      const known = asks && s.act === "grow";
      const vk = asks ? ramp(u, 0.4 * ask, 0.4 * ask + 0.25, lin) : 0;
      L5.drawOn(tick, known ? vk : 0);
      L5.drawOn(cross, asks && !known ? vk : 0);
      V.place(tick, { s: 0.7 + 0.3 * E.pop(vk), o: known ? Math.min(1, vk * 4) * fade : 0 });
      V.place(cross, { s: 0.7 + 0.3 * E.pop(vk), o: asks && !known ? Math.min(1, vk * 4) * fade : 0 });
      // the "known?" label comes with the first test and leaves when the last one (the final step has no next letter) is over
      lookTag.set({
        k: ramp(t, STEP_T[0] - 0.2, STEP_T[0] + 0.2, lin),
        o: 1 - ramp(t, STEP_T[S.length - 1], STEP_T[S.length - 1] + 0.25, lin),
      });
    }

    return (t) => {
      const k = stepAt(t);
      drawLookup(t, k);
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
    dur: 14.4,
    caps: [
      [0.4, 2.7, "No chances needed: it starts with just A and B."],
      [2.9, 5.5, "Phrase plus next letter new? Send a code, learn it."],
      [5.7, 7.8, "Known? Keep growing. New? Send and learn."],
      [8.0, 11.0, "Same again: grow while known, send when new."],
      [11.3, 13.0, "Known again, then the text ends: send it."],
      [13.1, 14.3, "Nine letters became five codes."],
    ],
    build,
  });
})();

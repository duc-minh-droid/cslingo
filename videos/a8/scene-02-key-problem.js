/* Phase 8 · Cryptography & Blockchain (algo-8), scene 02: "The cipher needs a key but Eve is listening" (11 s).
   Alice sends Bob SECRET. Everything on the open wire can be copied by Eve: first the plain letters (she reads them), then, with
   a shift cipher (key 5), the scrambled letters XJHWJY (she copies those too, but cannot read them: red question mark). The cipher
   only moves the problem: Bob needs the same key, and a key sent along the same wire is copied by Eve as well. Scene 3 answers it.
   Colours: grey = readable letters, blue = public (anything on the wire, so the scrambled row and, once it leaves Alice's side,
   the key too), purple = Alice's secret key, orange = the +5 shifts and the question about Bob's key, red = Eve and her copies.
   Timeline (local seconds): 0.2 Alice, Bob, the wire; 0.85 the grey row pops at Alice's end; 1.5-2.2 it slides to the middle of the
   wire; 1.95 Eve; 2.35 the copy arrow, 2.6 her red copy SECRET, 2.9 the eye (she reads it); 4.1-4.55 all of that fades (Eve stays);
   4.65 the row pops again at Alice's end, the purple key 5 beside Alice, the +5 tags and the grey "toy shift cipher" tag; 5.0-5.4 one
   worked example builds under the wire (grey S, an orange +5 arrow, blue X), 5.45 the first tile flips to X and the example holds
   about a second so the rule is seen before the other five flip (6.2-6.95) to XJHWJY (blue); 7.1 the +5 tags and the example fade and
   the row slides to Bob's end; 7.6 Eve copies it too (red XJHWJY, red question mark: she cannot read it without the key);
   8.5 Bob's dashed key and the orange question mark; 8.8 Eve's copy fades; 9.15-10.05 a copy of key 5 travels up onto the wire (it
   turns blue as it enters: everything on the wire is public); 9.9 the copy arrow, 10.25 Eve's solid red key 5, 10.45 the eye.
   Every letter and the key come from A8.CIPHER (common.js) and are asserted below; nothing is typed here. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const lin = E.lin;
  const C = A8.CIPHER;

  // ---------- the model: every number and letter comes from the helper, checked here ----------
  A8.same("key problem: the cipher", [C.plain, C.key, C.cipher], ["SECRET", 5, "XJHWJY"]);
  A8.same(
    "key problem: every letter slides 5 along the alphabet",
    C.pairs.map((p) => A8.caesar(p.from, C.key) === p.to),
    [true, true, true, true, true, true],
  );
  A8.same("key problem: six letters", C.pairs.length, 6);
  const KEY_TEXT = `key ${C.key}`;
  const SHIFT_TEXT = `+${C.key}`;

  // ---------- layout (stage px) ----------
  const ROW = { x: 62, y: 156, size: 56, gap: 8 }; // the six tiles: centres x 90 + 64 i, y 184 (resting on the dashed line)
  const tileX = (i) => ROW.x + ROW.size / 2 + (ROW.size + ROW.gap) * i;
  const DX_MID = 218; // the row centred on the wire
  const DX_BOB = 432; // the row at Bob's end
  const LANE_KEY = 266; // the lower lane of the wire (the letters travel in the upper lane)
  const KEY_AT = { x: 164, y: 370 }; // Alice's key tag
  const KEY_PTS = [
    [KEY_AT.x, KEY_AT.y],
    [KEY_AT.x, LANE_KEY],
    [700, LANE_KEY],
  ]; // the copy of the key: up into the lower lane, then right
  const TURNS_BLUE = 296; // the copy turns blue (public) once its centre is inside the wire band
  const EX = { x: 364, y: 346, gap: 152 }; // the worked example S +5 X under the wire (tiles 56 px)
  const EVE = { x: 468, y: 578 };
  const COPY_Y = 392; // top of Eve's copied row

  // ---------- timeline (local seconds) ----------
  const T = {
    tiles: 0.85, // + 0.06 i
    slide1: [1.5, 2.2],
    eve: 1.95,
    arrow1: [2.35, 2.7],
    copy1: 2.6, // + 0.05 i
    eye1: 2.9,
    out1: [4.1, 4.55], // the plain row, Eve's copy, her arrow and her eye fade (Eve stays)
    pop2: 4.65, // + 0.05 i: the grey row again, at Alice's end
    keyIcon: 4.65,
    keyTag: 4.8,
    plus: 4.95, // + 0.12 i
    toy: 5.0,
    exS: 5.0,
    exArrow: [5.15, 5.4],
    exTag: 5.2,
    exX: 5.4,
    flip0: 5.45, // the first tile flips on its own, the example stays on screen beside it
    flipRest: 6.2, // + 0.1 (i - 1), 0.35 s each
    exOut: [7.1, 7.45],
    plusOut: [7.1, 7.45],
    slide2: [7.1, 8.0],
    arrow2: [7.55, 7.9],
    copy2: 7.6, // + 0.05 i
    q2: 8.1,
    bobKey: 8.5,
    bobQ: 8.65,
    out2: [8.8, 9.2],
    travel: [9.15, 10.05],
    arrow3: [9.9, 10.3],
    eveKey: 10.25,
    eye2: 10.45,
  };
  const flipAt = (i) => (i === 0 ? T.flip0 : T.flipRest + 0.1 * (i - 1));
  const PHASE_B = 4.62; // from here the row is the second life of the tiles (grey at Alice's end, then flipping)

  const popS = (k) => 0.8 + 0.2 * E.pop(clamp(k));
  const tilePop = (k, o = 1) => ({ s: popS(k), o: clamp(k * 4) * o });

  V.scene({
    kicker: "THE KEY PROBLEM",
    title: ["The cipher needs a key", "but Eve is listening"],
    dur: 11.4,
    caps: [
      [2.2, 4.3, "Anything on the open wire, Eve can read."],
      [
        5.1,
        7.4,
        `The key is ${C.key}: each letter moves ${C.key} along, so ${C.pairs[0].from} becomes ${C.pairs[0].to}.`,
      ],
      [9.2, 11.2, "But how does Bob get the key without Eve seeing it?"],
    ],
    build(stage) {
      // the open wire, Alice and Bob
      const wire = A8.wire(stage, { x: 40, y: 222, w: 856, h: 160 }); // the band y 142..302
      const wireTag = A8.tag(stage, { x: 468, y: 112, text: "the open wire" });
      const alice = A8.person(stage, { who: "alice", x: 52, y: 50 });
      const bob = A8.person(stage, { who: "bob", x: 884, y: 50, name: "left" });

      // the message and the +5 shifts
      const msg = L5.chromosome(stage, {
        x: ROW.x,
        y: ROW.y,
        genes: C.plain,
        size: ROW.size,
        gap: ROW.gap,
        tone: "grey",
      });
      const plus = C.pairs.map((_, i) =>
        A8.tag(stage, { x: tileX(i), y: 250, text: SHIFT_TEXT, tone: "orange", w: 52, h: 40 }),
      );

      // one worked example under the wire: S moves 5 along and becomes X (so the rule is seen, not just the result)
      const exS = L5.chromosome(stage, { x: EX.x, y: EX.y, genes: C.pairs[0].from, size: ROW.size, tone: "grey" });
      const exX = L5.chromosome(stage, {
        x: EX.x + EX.gap,
        y: EX.y,
        genes: C.pairs[0].to,
        size: ROW.size,
        tone: "blue",
      });
      const exArrow = A8.link(stage, {
        pts: [
          [EX.x + ROW.size + 14, EX.y + ROW.size / 2],
          [EX.x + EX.gap - 14, EX.y + ROW.size / 2],
        ],
        tone: "orange",
      });
      const exTag = A8.tag(stage, {
        x: EX.x + (ROW.size + EX.gap) / 2,
        y: EX.y - 16,
        text: SHIFT_TEXT,
        tone: "orange",
        w: 52,
        h: 40,
      });
      const toy = A8.tag(stage, { x: 720, y: 184, text: "a toy shift cipher" });

      // Alice's key, Bob's missing key and the copy of the key that travels
      const keyIcon = A8.icon(stage, "key", { x: 56, y: KEY_AT.y, tone: "purple", size: 72 });
      const keyTag = A8.tag(stage, { x: KEY_AT.x, y: KEY_AT.y, text: KEY_TEXT, tone: "purple", fs: 36 });
      const bobKey = A8.tag(stage, { x: 782, y: 370, text: "key", fs: 36, ghost: true });
      const bobQ = A8.icon(stage, "qmark", { x: 872, y: 370, tone: "orange", size: 56 });
      const keyCopy = A8.tag(stage, { x: KEY_AT.x, y: KEY_AT.y, text: KEY_TEXT, tone: "purple", fs: 36 });

      // Eve and everything she copies
      const arrow1 = A8.link(stage, {
        pts: [
          [EVE.x, 310],
          [EVE.x, 390],
        ],
        tone: "red",
      });
      const arrow2 = A8.link(stage, {
        pts: [
          [682, 312],
          [682, 344],
          [EVE.x, 344],
          [EVE.x, 390],
        ],
        tone: "red",
      });
      const arrow3 = A8.link(stage, {
        pts: [
          [700, 312],
          [700, 340],
          [EVE.x, 340],
          [EVE.x, 390],
        ],
        tone: "red",
      });
      const eve = A8.person(stage, { who: "eve", x: EVE.x, y: EVE.y });
      const eye = A8.icon(stage, "eye", { x: EVE.x, y: 495, tone: "red" });
      const copyRow = (genes) =>
        L5.chromosome(stage, { x: 280, y: COPY_Y, genes, size: ROW.size, gap: ROW.gap, tone: "red" });
      const plainCopy = copyRow(C.plain);
      const cipherCopy = copyRow(C.cipher);
      const cipherQ = A8.icon(stage, "qmark", { x: 700, y: 420, tone: "red", size: 50 });
      const eveKey = A8.tag(stage, { x: EVE.x, y: 420, text: KEY_TEXT, tone: "red", solid: true, fs: 36 });

      return (t) => {
        const pop = (a, d = 0.3) => ramp(t, a, a + d, lin);
        const out1 = 1 - ramp(t, T.out1[0], T.out1[1], lin);
        const out2 = 1 - ramp(t, T.out2[0], T.out2[1], lin);

        // the stage
        wire.set({ k: ramp(t, 0.2, 0.9), o: ramp(t, 0.2, 0.45, lin) });
        wireTag.set({ k: pop(0.7, 0.35) });
        alice.set({ k: pop(0.2, 0.4) });
        bob.set({ k: pop(0.3, 0.4) });

        // the message row: grey and readable, then (second life) flipping into the cipher
        const second = t >= PHASE_B;
        msg.tiles.forEach((_, i) => {
          const pair = C.pairs[i];
          if (!second) {
            const k = pop(T.tiles + 0.06 * i);
            const dx = DX_MID * ramp(t, T.slide1[0], T.slide1[1], E.inOut);
            msg.set(i, { x: dx, tone: "grey", ...tilePop(k, out1) });
          } else {
            const k = pop(T.pop2 + 0.05 * i);
            const fk = ramp(t, flipAt(i), flipAt(i) + 0.35, lin);
            const dx = DX_BOB * ramp(t, T.slide2[0], T.slide2[1], E.inOut);
            msg.flip(i, fk, {
              from: pair.from,
              to: pair.to,
              tone: "grey",
              toTone: "blue",
              x: dx,
              hop: 6,
              ...tilePop(k),
            });
          }
        });
        plus.forEach((p, i) =>
          p.set({ k: pop(T.plus + 0.12 * i, 0.25), o: 1 - ramp(t, T.plusOut[0], T.plusOut[1], lin) }),
        );
        const exO = 1 - ramp(t, T.exOut[0], T.exOut[1], lin);
        exS.all(() => tilePop(pop(T.exS), exO));
        exX.all(() => tilePop(pop(T.exX), exO));
        exArrow.set({ k: ramp(t, T.exArrow[0], T.exArrow[1]), o: exO });
        exTag.set({ k: pop(T.exTag, 0.25), o: exO });
        toy.set({ k: pop(T.toy), o: exO });

        // the keys
        keyIcon.set({ k: pop(T.keyIcon) });
        keyTag.set({ k: pop(T.keyTag), s: 1 + 0.07 * flash(t, 5.0, 5.4) });
        bobKey.set({ k: pop(T.bobKey), ghost: true });
        bobQ.set({ k: pop(T.bobQ) });
        const f = ramp(t, T.travel[0], T.travel[1], E.inOut);
        const p = A8.along(KEY_PTS, f);
        keyCopy.set({ x: p.x, y: p.y, o: t >= T.travel[0] ? 1 : 0, tone: p.y < TURNS_BLUE ? "blue" : "purple" });

        // Eve: she stays once she has popped; her copies come and go
        eve.set({ k: pop(T.eve) });
        arrow1.set({ k: ramp(t, T.arrow1[0], T.arrow1[1]), o: out1 });
        plainCopy.all((i) => tilePop(pop(T.copy1 + 0.05 * i), out1));
        eye.set({ k: t < 6 ? pop(T.eye1) : pop(T.eye2), o: t < 6 ? out1 : 1 });
        arrow2.set({ k: ramp(t, T.arrow2[0], T.arrow2[1]), o: out2 });
        cipherCopy.all((i) => tilePop(pop(T.copy2 + 0.05 * i), out2));
        cipherQ.set({ k: pop(T.q2), o: out2 });
        arrow3.set({ k: ramp(t, T.arrow3[0], T.arrow3[1]) });
        eveKey.set({ k: pop(T.eveKey) });
      };
    },
  });
})();

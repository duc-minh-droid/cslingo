/* Phase 6 · scene 05-check (13.9 s): the receiver divides what arrives by the same pattern. For the clean frame the division of
   scene 4 is replayed in a compact stack (two XOR rows, ending in all zeros), so the reason is on screen: a clean frame divides
   exactly and leaves 000. Then the two flips that fooled parity (scene 3) and a burst of three in a row both change the
   remainder (only the result is shown). More check bits catch longer bursts.
   Every word, remainder and count comes from A6.CRC (common.js); this file only asserts it and lays it out.
   Story (local seconds): 0.2-1.0 the received frame pops; 1.0-3.5 the division of the frame by 1101 is replayed under it (the
   frame is row 0 of the stack); 4.0-4.4 the stack fades and the summary appears under the frame: purple arrow, remainder 000
   (green), "divides exactly"; 6.0-6.9 the two flips (tiles 1 and 4), the remainder flips to 111, "check fails" (the
   verdict is hidden while a new word is being checked, never half-faded); 9.4-10.1 the damage moves: tile 1 heals, tiles 2 and
   3 flip (with tile 4: a burst of three), the remainder becomes 110; 11.9 and 12.6 the two green rule tags. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { ramp, clamp, flash, ease: E } = V;

  const C = A6.CRC;
  const [CLEAN, TWO, BURST] = C.cases;
  const CRC16 = 16; // lesson 6.4: a degree-16 generator (CRC-16) leaves 16 check bits
  A6.same("check: frame and generator", [C.frame, C.gen, C.r], ["1011100", "1101", 3]);
  A6.same(
    "check: the received words and what the division leaves",
    C.cases.map((c) => [c.name, c.flips, c.recv, c.rem]),
    [
      ["clean", [], "1011100", "000"],
      ["two", [1, 4], "1111000", "111"],
      ["burst", [2, 3, 4], "1000000", "110"],
    ],
  );
  A6.same(
    "check: the flips are where the words differ",
    [A6.diffAt(C.frame, TWO.recv), A6.diffAt(C.frame, BURST.recv)],
    [
      [1, 4],
      [2, 3, 4],
    ],
  );
  A6.same("check: the audit", C.audit, { singles: [7, 7], doubles: [21, 21], bursts: [23, 23] });
  const span = BURST.flips[BURST.flips.length - 1] - BURST.flips[0] + 1;
  A6.same("check: the burst is as long as the check bits (so the rule tag is true)", [span, C.r], [3, 3]);
  A6.same(
    "check: the remainder is the division of the received word",
    C.cases.map((c) => A6.polyMod(c.recv, C.gen)),
    ["000", "111", "110"],
  );
  // the replay: the receiver's division of the clean frame is two XOR steps and ends in all zeros
  const REPLAY = A6.divide(CLEAN.recv, C.gen);
  A6.same(
    "check: the replayed division of the clean frame",
    [REPLAY.steps.map((s) => [s.col, s.after]), REPLAY.rem],
    [
      [
        [0, "0110100"],
        [1, "0000000"],
      ],
      "000",
    ],
  );

  const lin = E.lin;
  const popIn = (k) => ({ s: E.pop(k), o: clamp(k * 5) });
  const base = (i) => (i >= C.msg.length ? "orange" : "grey"); // the tone of a tile that is back to normal
  const remTone = (r) => (r === "0".repeat(C.r) ? "green" : "red"); // a remainder of 000 is the clean verdict

  // layout (stage px): the frame is row 0 of the replayed stack, so both share one x, y and tile size
  const X0 = 104;
  const Y0 = 96;
  const S = 68;
  const GAP = 8;
  const ROW_GAP = 14;
  const FRAME_W = C.frame.length * S + (C.frame.length - 1) * GAP; // 524
  const CX = X0 + FRAME_W / 2; // the middle of the frame: the arrow and the remainder hang from it
  const REM_X = CX - (C.r * S + (C.r - 1) * GAP) / 2;
  const REM_Y = 340;
  const DIV_HOME = { x: X0 + FRAME_W + 40, y: 181 }; // the "divide by 1101" tag while the stack is on screen (right of it)
  const DIV_ARROW = { x: CX + 28, y: 220 }; // ... and beside the arrow afterwards

  // The received word over time: each step lists the tiles that flip and when. The tiles must be exactly where the words differ.
  const STEPS = [
    { word: TWO.recv, at: { 1: [6.1, 6.6], 4: [6.4, 6.9] } },
    { word: BURST.recv, at: { 1: [9.4, 9.8], 2: [9.5, 9.85], 3: [9.7, 10.05] } },
  ];
  const EVENTS = C.frame.split("").map(() => []); // per tile: {a, b, from, to} flips in time order
  STEPS.reduce((prev, s) => {
    A6.same("check: step flips", Object.keys(s.at).map(Number), A6.diffAt(prev, s.word));
    Object.entries(s.at).forEach(([i, [a, b]]) => EVENTS[i].push({ a, b, from: prev[i], to: s.word[i] }));
    return s.word;
  }, C.frame);

  // The remainder tiles over time: pop in as 000, then flip to what each received word leaves (a tile that keeps its digit stays still).
  const RPOP = 4.5;
  const REM = [
    { rem: CLEAN.rem },
    { rem: TWO.rem, t0: 7.1, step: 0.1, dur: 0.4 },
    { rem: BURST.rem, t0: 10.7, step: 0.1, dur: 0.4 },
  ];

  // The verdict badge: a new verdict pops in; while the next word is being checked the badge is hidden (never half-faded).
  const BADGE = [
    { a: 5.2, b: 5.6, state: "valid" },
    { a: 5.8, b: 6.0, hide: "valid" },
    { a: 7.9, b: 8.3, state: "invalid" },
    { a: 9.3, b: 9.5, hide: "invalid" },
    { a: 11.4, b: 11.8, state: "invalid" },
  ];
  const T = {
    divTag: [1.1, 1.4],
    s1: [1.2, 2.3], // the two XOR steps of the replay (p 0 -> 1 -> 2)
    s2: [2.4, 3.5],
    remK: [3.5, 3.9],
    stackOut: [4.0, 4.4],
    arrow: [4.1, 4.6],
    glide: [4.0, 4.5],
    remTag: [4.4, 4.7],
    fooled: [
      [6.0, 6.3],
      [9.3, 9.6],
    ], // "the flips that fooled parity": in, out
    burstTag: [10.1, 10.6],
    rule3: 11.9,
    rule16: 12.6,
  };
  const POP = 0.3;
  const RULE3 = `${C.r} check bits: every burst up to ${C.r}`;
  const RULE16 = `CRC-16: ${CRC16} check bits, every burst up to ${CRC16}`;

  function build(stage) {
    // the replayed division first (the frame row is drawn over its row 0, so the frame can flip later)
    const d = A6.division(stage, {
      x: X0,
      y: Y0,
      dividend: CLEAN.recv,
      gen: C.gen,
      size: S,
      gap: GAP,
      rowGap: ROW_GAP,
      padFrom: C.msg.length,
    });
    const frame = A6.bits(stage, {
      x: X0,
      y: Y0,
      bits: C.frame,
      size: S,
      gap: GAP,
      tones: [...C.frame].map((_, i) => base(i)),
    });
    const svg = L5.svg(stage);
    const arrow = svg.appendChild(L5.arrow(CX, Y0 + S + 14, CX, REM_Y - 12, "purple", 1, { w: 8, head: 24 }));
    const bracket = svg.appendChild(
      V.s(
        "g",
        {},
        V.s("path", {
          d: `M${frame.mid(2).x - S / 2} ${Y0 - 2} V${Y0 - 10} H${frame.mid(4).x + S / 2} V${Y0 - 2}`,
          fill: "none",
          pathLength: "1",
          "data-draw": "1",
          "stroke-width": "6",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: A6.tone("red").c },
        }),
      ),
    );
    const rem = A6.bits(stage, { x: REM_X, y: REM_Y, bits: CLEAN.rem, size: S, gap: GAP });
    const tagReceived = A6.tag(stage, { x: X0, y: 12, text: "received", tone: "grey" });
    const tagFooled = A6.tag(stage, {
      x: X0 + 154 + 24, // 154 px: the real width of the "received" tag
      y: 12,
      text: "the flips that fooled parity",
      tone: "red",
    });
    const tagDivide = A6.tag(stage, { x: DIV_HOME.x, y: DIV_HOME.y, text: `divide by ${C.gen}`, tone: "purple" });
    const tagRem = A6.tag(stage, {
      x: REM_X - 20 - 180, // 180 px: the real width of this tag
      y: REM_Y + 3,
      text: "remainder",
      tone: "orange",
    });
    const tagBurst = A6.tag(stage, {
      x: Math.round(frame.mid(3).x - A6.tagW("3 in a row") / 2),
      y: 12,
      text: "3 in a row",
      tone: "red",
      solid: true,
    });
    const tagRule3 = A6.tag(stage, { x: X0, y: 470, text: RULE3, tone: "green" });
    const tagRule16 = A6.tag(stage, { x: X0, y: 546, text: RULE16, tone: "green", solid: true });
    const badgeBox = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
    stage.append(badgeBox);
    const badge = L5.badge(badgeBox, {
      x: REM_X + C.r * S + (C.r - 1) * GAP + 30,
      y: REM_Y - 4,
      w: 330,
      h: 68,
      valid: "divides exactly",
      invalid: "check fails",
    });

    return (t) => {
      // the replayed division: the frame is its first row; two XOR steps, then the stack gives way to the summary
      const stackO = ramp(t, 1.0, 1.1, lin) * (1 - ramp(t, ...T.stackOut, lin));
      d.update({
        p: t < T.s2[0] ? ramp(t, ...T.s1, lin) : 1 + ramp(t, ...T.s2, lin),
        remK: ramp(t, ...T.remK, lin),
        o: stackO,
      });
      tagDivide.set({
        k: ramp(t, ...T.divTag, lin),
        x: (DIV_ARROW.x - DIV_HOME.x) * ramp(t, ...T.glide, E.inOut),
        y: (DIV_ARROW.y - DIV_HOME.y) * ramp(t, ...T.glide, E.inOut),
      });
      L5.drawOn(arrow, ramp(t, ...T.arrow, lin));

      // the received frame: pops, then flips tile by tile as each word arrives; its check bits pulse with the rule tag
      const rule = flash(t, T.rule3, T.rule3 + 0.5);
      for (let i = 0; i < C.frame.length; i++) {
        const st = popIn(A6.seq(t, 0.2, 0.07, POP, i));
        if (i >= C.msg.length) st.s *= 1 + 0.1 * rule;
        const ev = EVENTS[i].filter((e) => t >= e.a).pop();
        if (!ev) {
          frame.set(i, st);
          continue;
        }
        const red = (ch) => ch !== C.frame[i];
        frame.flip(i, ramp(t, ev.a, ev.b, lin), {
          ...st,
          from: ev.from,
          to: ev.to,
          tone: red(ev.from) ? "red" : base(i),
          toTone: red(ev.to) ? "red" : base(i),
          hop: 10,
        });
      }
      const fooled = ramp(t, ...T.fooled[0], lin) * (1 - ramp(t, ...T.fooled[1], lin));
      tagReceived.set({ k: ramp(t, 0.5, 0.8, lin) });
      tagFooled.set({ k: fooled });

      // the remainder: pops in as green 000, then flips to what each received word leaves
      tagRem.set({ k: ramp(t, ...T.remTag, lin) });
      for (let i = 0; i < rem.n; i++) {
        const st = { ...popIn(A6.seq(t, RPOP, 0.1, POP, i)), solid: true };
        const j = REM.findLastIndex((p, q) => q > 0 && t >= p.t0 + p.step * i);
        if (j < 0) rem.set(i, { ...st, tone: "green" });
        else {
          const p = REM[j];
          const from = REM[j - 1].rem;
          const a = p.t0 + p.step * i;
          if (from[i] === p.rem[i]) rem.set(i, { ...st, tone: remTone(p.rem), text: p.rem[i] });
          else
            rem.flip(i, ramp(t, a, a + p.dur, lin), {
              ...st,
              from: from[i],
              to: p.rem[i],
              tone: remTone(from),
              toTone: remTone(p.rem),
              hop: 6,
            });
        }
      }

      // the verdict: a new one pops in; while the next word is checked the badge is gone
      const v = BADGE.filter((e) => t >= e.a).pop();
      if (!v) {
        badge("none", 0);
        V.show(badgeBox, 1);
      } else if (v.state) {
        badge(v.state, ramp(t, v.a, v.b, lin));
        V.show(badgeBox, 1);
      } else {
        badge(v.hide, 1);
        V.show(badgeBox, 1 - ramp(t, v.a, v.b, lin));
      }

      // a burst is three in a row: the bracket under its tag
      tagBurst.set({ k: ramp(t, ...T.burstTag, lin) });
      L5.drawOn(bracket, ramp(t, T.burstTag[0], T.burstTag[1], lin));

      // the rule: as many check bits as the burst is long
      tagRule3.set({ k: ramp(t, T.rule3, T.rule3 + 0.3, lin) });
      tagRule16.set({ k: ramp(t, T.rule16, T.rule16 + 0.3, lin) });
    };
  }

  V.scene({
    kicker: "DETECTING · CHECKING",
    title: ["The receiver repeats", "the division"],
    dur: 13.9,
    caps: [
      [1.2, 3.1, "Divide the frame by the same pattern."],
      [4.5, 6.1, "A clean frame divides exactly: 000."],
      [7.1, 8.7, "These two flips change the remainder."],
      [10.2, 11.8, "A burst of three is caught too."],
      [12.6, 13.8, "More check bits catch longer bursts."],
    ],
    build,
  });
})();

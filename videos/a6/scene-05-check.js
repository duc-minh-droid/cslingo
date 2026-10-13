/* Phase 6 · scene 05-check (11 s): the receiver divides what arrives by the same pattern. A clean frame leaves 000; the two flips
   that fooled parity (scene 3) and a burst of three in a row both change the remainder. More check bits catch longer bursts.
   The long division itself was drawn in scene 4: here only its result shows (the remainder tiles flip to the computed values).
   Every word, remainder and count comes from A6.CRC (common.js); this file only asserts it and lays it out.
   Story (local seconds): 0.2-1.0 the received frame pops, 0.8-1.4 the purple "divide by 1101" arrow, 1.5-2.0 the remainder 000
   (green), 2.2 "clean"; 3.0-3.8 the two flips (tiles 1 and 4), 3.8-4.4 the remainder flips to 111, 4.5 "error found"; 5.4-5.9
   everything back to the clean frame; 6.0-6.7 a burst (tiles 2, 3, 4), 6.9-7.5 remainder 110, 7.7 "error found"; 8.4 and 9.2 the
   two green rule tags. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { ramp, clamp, ease: E } = V;

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

  const lin = E.lin;
  const popIn = (k) => ({ s: E.pop(k), o: clamp(k * 5) });
  const base = (i) => (i >= C.msg.length ? "orange" : "grey"); // the tone of a tile that is back to normal
  const remTone = (r) => (r === "0".repeat(C.r) ? "green" : "red"); // a remainder of 000 is the clean verdict

  // The received word over time: each step lists the tiles that flip and when. The tiles must be exactly where the words differ.
  const STEPS = [
    { word: TWO.recv, at: { 1: [3.0, 3.5], 4: [3.3, 3.8] } },
    { word: CLEAN.recv, at: { 1: [5.4, 5.9], 4: [5.4, 5.9] } },
    { word: BURST.recv, at: { 2: [6.0, 6.3], 3: [6.2, 6.5], 4: [6.4, 6.7] } },
  ];
  const EVENTS = C.frame.split("").map(() => []); // per tile: {a, b, from, to} flips in time order
  STEPS.reduce((prev, s) => {
    A6.same("check: step flips", Object.keys(s.at).map(Number), A6.diffAt(prev, s.word));
    Object.entries(s.at).forEach(([i, [a, b]]) => EVENTS[i].push({ a, b, from: prev[i], to: s.word[i] }));
    return s.word;
  }, C.frame);

  // The remainder tiles over time: pop in as 000, then flip to what each received word leaves.
  const RPOP = 1.5;
  const REM = [
    { rem: TWO.rem, t0: 3.8, step: 0.1, dur: 0.4 },
    { rem: CLEAN.rem, t0: 5.4, step: 0.05, dur: 0.4 },
    { rem: BURST.rem, t0: 6.9, step: 0.1, dur: 0.4 },
  ];
  const REM_ALL = [{ rem: CLEAN.rem }, ...REM];

  // The verdict badge: its own state per moment, and "stale" while a new word is being checked.
  const VERDICTS = [
    { at: [2.2, 2.6], state: "valid" },
    { at: [4.5, 4.9], state: "invalid" },
    { at: [5.6, 5.95], state: "valid" },
    { at: [7.7, 8.1], state: "invalid" },
  ];
  const PENDING = [
    [3.0, 4.5],
    [6.0, 7.7],
  ];
  const T = { arrow: [0.8, 1.4], divTag: 1.0, remTag: 1.2, burstTag: 6.5, rule3: 8.4, rule16: 9.2 };
  const POP = 0.3;
  const DY = 16; // the whole picture sits this far below the storyboard's y values, so the burst bracket fits above the frame
  const RULE3 = `${C.r} check bits: every burst up to ${C.r}`;
  const RULE16 = `${CRC16} check bits: every burst up to ${CRC16}`;

  function build(stage) {
    const frame = A6.bits(stage, {
      x: 138,
      y: 80 + DY,
      bits: C.frame,
      size: 84,
      gap: 12,
      tones: [...C.frame].map((_, i) => base(i)),
    });
    const svg = L5.svg(stage);
    const arrow = svg.appendChild(L5.arrow(468, 176 + DY, 468, 292 + DY, "purple", 1, { w: 8, head: 24 }));
    const rem = A6.bits(stage, { x: 330, y: 304 + DY, bits: CLEAN.rem, size: 84, gap: 12 });
    const bracket = svg.appendChild(
      V.s(
        "g",
        {},
        V.s("path", {
          d: `M${frame.mid(2).x - 42} ${78 + DY} V${70 + DY} H${frame.mid(4).x + 42} V${78 + DY}`,
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
    const tagReceived = A6.tag(stage, { x: 138, y: 6 + DY, text: "received", tone: "grey" });
    const tagDivide = A6.tag(stage, { x: 496, y: 214 + DY, text: `divide by ${C.gen}`, tone: "purple" });
    const tagRem = A6.tag(stage, { x: 100, y: 322 + DY, text: "remainder", tone: "orange" });
    const tagBurst = A6.tag(stage, {
      x: Math.round(frame.mid(3).x - A6.tagW("3 in a row") / 2),
      y: 6 + DY,
      text: "3 in a row",
      tone: "red",
      solid: true,
    });
    const tagRule3 = A6.tag(stage, { x: 138, y: 450 + DY, text: RULE3, tone: "green" });
    const tagRule16 = A6.tag(stage, { x: 138, y: 514 + DY, text: RULE16, tone: "green", solid: true });
    const badgeBox = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
    stage.append(badgeBox);
    const badge = L5.badge(badgeBox, { x: 624, y: 312 + DY, w: 296, h: 68, valid: "clean", invalid: "error found" });

    return (t) => {
      // the received frame: pops, then flips tile by tile as each word arrives
      for (let i = 0; i < C.frame.length; i++) {
        const st = popIn(A6.seq(t, 0.2, 0.07, 0.3, i));
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
          hop: 12,
        });
      }
      tagReceived.set({ k: ramp(t, 0.5, 0.8, lin) });

      // the purple arrow and its tag, then the remainder tiles
      L5.drawOn(arrow, ramp(t, ...T.arrow, lin));
      tagDivide.set({ k: ramp(t, T.divTag, T.divTag + 0.3, lin) });
      tagRem.set({ k: ramp(t, T.remTag, T.remTag + 0.3, lin) });
      for (let i = 0; i < rem.n; i++) {
        const pop = A6.seq(t, RPOP, 0.1, POP, i);
        const j = REM.findLastIndex((p) => t >= p.t0 + p.step * i);
        const st = { ...popIn(pop), solid: true };
        const rule = ramp(t, T.rule3, T.rule3 + 0.4, lin) * (1 - ramp(t, T.rule3 + 0.4, T.rule3 + 0.8, lin));
        st.s *= 1 + 0.08 * rule;
        if (j < 0) rem.set(i, { ...st, tone: "green" });
        else {
          const p = REM[j];
          const from = REM_ALL[j].rem;
          const a = p.t0 + p.step * i;
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

      // the verdict: stale (dimmed) while a new word is being checked
      const v = VERDICTS.filter((d) => t >= d.at[0]).pop();
      if (v) badge(v.state, ramp(t, ...v.at, lin));
      else badge("none", 0);
      const pend = Math.max(0, ...PENDING.map(([a, b]) => (t >= a && t < b ? ramp(t, a, a + 0.25, lin) : 0)));
      V.show(badgeBox, 1 - 0.65 * pend);

      // a burst is three in a row: the bracket under its tag
      tagBurst.set({ k: ramp(t, T.burstTag, T.burstTag + 0.3, lin) });
      L5.drawOn(bracket, ramp(t, T.burstTag, T.burstTag + 0.5, lin));

      // the rule: as many check bits as the burst is long
      tagRule3.set({ k: ramp(t, T.rule3, T.rule3 + 0.3, lin) });
      tagRule16.set({ k: ramp(t, T.rule16, T.rule16 + 0.3, lin) });
    };
  }

  V.scene({
    kicker: "CHECKING",
    title: ["The receiver repeats", "the division"],
    dur: 11,
    caps: [
      [1.1, 2.9, "Divide the frame by the same pattern."],
      [4, 5.6, "Even two flips change the remainder."],
      [7.1, 8.7, "A burst of three is caught too."],
      [9, 10.8, "More check bits catch longer bursts."],
    ],
    build,
  });
})();

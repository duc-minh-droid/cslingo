/* Phase 6 · scene 04-crc (12 s): a CRC check is the remainder of a long division of the message by a pattern both sides know
   (the generator), where "subtract" is XOR. Message 1011, generator 1101, so the sender divides 1011000 and sends 1011 + 100.
   Every digit comes from A6.CRC / A6.division (common.js, common-3.js).
   Story (local seconds): 0.15-1.2 the message and the generator appear (and "both sides know it"); 1.5-3.2 the message and three
   zeros go into the division; 3.35-5.05 step 1 (generator under the first four bits, XOR); 5.2-6.9 step 2 (the generator under the
   next 1); 7.3-7.8 the last three bits turn orange: the remainder; 8.6-9.7 the frame (message + remainder) builds tile by tile
   while the tile it copies lights up; 9.7-12.5 it stays, the message and then the check bits pulse once. Each caption starts
   only after its picture is on screen. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const { ramp, flash, clamp, ease: E } = V;

  const C = A6.CRC;
  A6.same(
    "crc scene: the division",
    [C.padded, C.gen, C.rem, C.frame, C.steps.length],
    ["1011000", "1101", "100", "1011100", 2],
  );

  const T = {
    msg: [0.15, 0.5], // the 'message' tag; its tiles follow 0.07 s apart from 0.3
    gen: [0.45, 0.8], // the 'generator' tag; its tiles follow from 0.6
    both: [0.9, 1.2], // 'both sides know it'
    both2: [3.1, 3.3], // ... which makes way for the XOR tag
    copy: [1.5, 2.5], // the message tiles pop into the division row (and pulse on the right)
    pad: [2.8, 3.2], // the three zeros
    padTag: [2.85, 3.15],
    s1: [3.35, 5.05], // step 1: p 0 -> 1
    s2: [5.2, 6.9], // step 2: p 1 -> 2
    xor: [3.6, 3.9],
    xorOut: [7.3, 7.5], // the XOR reminder makes way for the reason the division stops
    short: [7.45, 7.75],
    rem: [7.3, 7.8],
    remTag: [7.45, 7.75],
    frame: 8.6, // the frame tiles appear one after another, each lighting up the tile it copies
    frameStep: 0.13,
    frameDur: 0.3,
    frameTag: [9.3, 9.6],
    checkTag: [9.5, 9.8],
    pulseMsg: 10.2, // the message, then the check bits, pulse once
    pulseChk: 10.9,
  };
  const lin = E.lin;
  const DY = 4; // the whole picture sits 4 px lower than the storyboard, so no tag touches the top of the stage
  const pulseAt = (i) => T.copy[0] + (i * (T.copy[1] - T.copy[0])) / (C.msg.length + 1);

  function build(stage) {
    // right column: the message and the generator, each with its label
    const msgTag = A6.tag(stage, { x: 600, y: 8 + DY, text: "message", tone: "grey" });
    const msg = A6.bits(stage, { x: 600, y: 76 + DY, bits: C.msg, size: 60, gap: 8 });
    const genTag = A6.tag(stage, { x: 600, y: 150 + DY, text: "generator", tone: "purple" });
    const gen = A6.bits(stage, { x: 600, y: 218 + DY, bits: C.gen, size: 60, gap: 8, tone: "purple" });
    const bothTag = A6.tag(stage, { x: 600, y: 296 + DY, text: "both sides know it", tone: "purple" });
    const xorTag = A6.tag(stage, { x: 600, y: 296 + DY, text: "XOR: differ = 1", tone: "purple" });
    const shortTag = A6.tag(stage, { x: 600, y: 296 + DY, text: "too short for 1101", tone: "grey" });
    const remTag = A6.tag(stage, { x: 562, y: 378 + DY, text: "remainder", tone: "orange", solid: true });

    // the long division, five rows
    const d = A6.division(stage, {
      x: 80,
      y: 76 + DY,
      dividend: C.padded,
      gen: C.gen,
      size: 60,
      gap: 8,
      rowGap: 14,
      padFrom: 4,
    });
    const addW = A6.tagW("add 000");
    const addTag = A6.tag(stage, {
      x: (d.mid(0, 4).x + d.mid(0, 6).x - addW) / 2,
      y: 10 + DY,
      text: "add 000",
      tone: "orange",
    });

    // the frame at the bottom: its label sits to the left, the check bits are named above them
    const frameW = 7 * 72 + 6 * 10;
    const labW = A6.tagW("frame sent");
    const left = Math.round((936 - (labW + 20 + frameW)) / 2);
    const out = A6.bits(stage, {
      x: left + labW + 20,
      y: 520 + DY,
      bits: C.frame,
      size: 72,
      gap: 10,
      tones: ["grey", "grey", "grey", "grey", "orange", "orange", "orange"],
    });
    const frameTag = A6.tag(stage, { x: left, y: 520 + DY + 36 - 29, text: "frame sent", tone: "green" });
    const checkTag = A6.tag(stage, {
      x: (out.mid(4).x + out.mid(6).x - A6.tagW("check bits")) / 2,
      y: 452 + DY,
      text: "check bits",
      tone: "orange",
    });
    // an orange copy of the remainder tiles that only shows while one of them lights up (the division owns the real ones)
    const rem0 = d.mid(d.last, d.n - C.rem.length);
    const remCopy = A6.bits(stage, {
      x: rem0.x - 30,
      y: rem0.y - 30,
      bits: C.rem,
      size: 60,
      gap: 8,
      tone: "orange",
    });
    const frameAt = (i) => T.frame + i * T.frameStep;
    const nMsg = C.msg.length;

    return (t) => {
      // right column: the message (lighting up as each copy is made), the generator (lighting up in each step)
      msgTag.set({ k: ramp(t, ...T.msg, lin) });
      msg.all((i) => {
        const k = A6.seq(t, 0.3, 0.07, 0.3, i);
        const lit = Math.max(flash(t, pulseAt(i), pulseAt(i) + 0.3), flash(t, frameAt(i), frameAt(i) + 0.3));
        return {
          s: E.pop(k) * (1 + 0.12 * lit),
          o: clamp(k * 5),
          tone: lit > 0.05 && t > T.frame - 0.1 ? "blue" : "grey",
        };
      });
      genTag.set({ k: ramp(t, ...T.gen, lin) });
      gen.all((i) => {
        const k = A6.seq(t, 0.6, 0.07, 0.3, i);
        const use = Math.max(flash(t, T.s1[0], T.s1[0] + 0.4), flash(t, T.s2[0], T.s2[0] + 0.4));
        return { s: E.pop(k) * (1 + 0.1 * use), o: clamp(k * 5) };
      });
      bothTag.set({ k: ramp(t, ...T.both, lin), o: 1 - ramp(t, ...T.both2, lin) });
      xorTag.set({ k: ramp(t, ...T.xor, lin), o: 1 - ramp(t, ...T.xorOut, lin) });
      shortTag.set({ k: ramp(t, ...T.short, lin) });
      remTag.set({ k: ramp(t, ...T.remTag, lin) });

      // the division: the message and zeros go in, then two steps, then the remainder lights up
      const p = t < T.s2[0] ? ramp(t, ...T.s1, lin) : 1 + ramp(t, ...T.s2, lin);
      d.update({
        msgK: ramp(t, ...T.copy, lin),
        padK: ramp(t, ...T.pad, lin),
        p,
        remK: ramp(t, ...T.rem, lin),
      });
      addTag.set({ k: ramp(t, ...T.padTag, lin) });
      remCopy.all((j) => {
        const f = flash(t, frameAt(nMsg + j), frameAt(nMsg + j) + 0.3);
        return { solid: true, o: f > 0.001 ? 1 : 0, s: 1 + 0.2 * f };
      });

      // the frame: message tiles, then the remainder tiles drop into their slots, then pulse once
      out.all((i) => {
        const k = ramp(t, frameAt(i), frameAt(i) + T.frameDur, lin);
        const tail = i < nMsg ? T.pulseMsg + i * 0.06 : T.pulseChk + (i - nMsg) * 0.06;
        return {
          y: -24 * (1 - E.out(k)),
          s: (0.7 + 0.3 * E.pop(k)) * (1 + 0.12 * flash(t, tail, tail + 0.4)),
          o: clamp(k * 5),
          solid: i >= nMsg,
        };
      });
      frameTag.set({ k: ramp(t, ...T.frameTag, lin) });
      checkTag.set({ k: ramp(t, ...T.checkTag, lin) });
    };
  }

  V.scene({
    kicker: "DETECTING · THE CRC",
    title: ["Check bits come from", "a long division"],
    dur: 12,
    caps: [
      [1.2, 3, "The CRC: a pattern both sides know."],
      [3.3, 5.3, "Add one zero per check bit, then divide."],
      [5.6, 7.6, "Line the pattern up under the next 1."],
      [7.7, 9.7, "Too short to divide: that is the remainder."],
      [9.9, 11.9, "Send the message plus the remainder."],
    ],
    build,
  });
})();

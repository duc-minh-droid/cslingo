/* Phase 6 · scene 04-crc (12.5 s): a CRC check is the remainder of a long division of the message by a pattern both sides know
   (the generator), where "subtract" is XOR. Message 1011, generator 1101, so the sender divides 1011000 and sends 1011 + 100.
   Every digit comes from A6.CRC / A6.division (common.js, common-3.js).
   Story (local seconds): 0.15-1.2 the message and the generator appear (and "both sides know it"); 2.1-3.3 the message and three
   zeros go into the division; 3.35-5.05 step 1 (generator under the first four bits, XOR); 5.2-6.9 step 2 (the generator under the
   next 1); 7.3-7.8 the last three bits turn orange: the remainder; 8.85-9.7 the frame (message + remainder) is sent; 9.7-12.5 it
   stays, the message and then the check bits pulse once. Each caption starts only after its picture is on screen. */
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
    copy: [2.1, 2.9], // the message tiles pop into the division row (and pulse on the right)
    pad: [2.9, 3.3], // the three zeros
    padTag: [2.95, 3.25],
    s1: [3.35, 5.05], // step 1: p 0 -> 1
    s2: [5.2, 6.9], // step 2: p 1 -> 2
    xor: [3.6, 3.9],
    rem: [7.3, 7.8],
    remTag: [7.45, 7.75],
    fly: 8.85, // the frame tiles leave one after another
    flyStep: 0.05,
    flyDur: 0.55,
    frameTag: [9.4, 9.7],
    checkTag: [9.55, 9.85],
    pulseMsg: 10.2, // the message, then the check bits, pulse once
    pulseChk: 10.9,
  };
  const lin = E.lin;
  const popIn = (k) => ({ s: E.pop(k), o: clamp(k * 5) });

  function build(stage) {
    // right column: the message and the generator, each with its label
    const msgTag = A6.tag(stage, { x: 600, y: 8, text: "message", tone: "grey" });
    const msg = A6.bits(stage, { x: 600, y: 76, bits: C.msg, size: 60, gap: 8 });
    const genTag = A6.tag(stage, { x: 600, y: 150, text: "generator", tone: "purple" });
    const gen = A6.bits(stage, { x: 600, y: 218, bits: C.gen, size: 60, gap: 8, tone: "purple" });
    const bothTag = A6.tag(stage, { x: 600, y: 296, text: "both sides know it", tone: "purple" });
    const xorTag = A6.tag(stage, { x: 600, y: 296, text: "XOR: differ = 1", tone: "purple" });
    const remTag = A6.tag(stage, { x: 562, y: 378, text: "remainder", tone: "orange", solid: true });

    // the long division, five rows
    const d = A6.division(stage, { x: 80, y: 76, dividend: C.padded, gen: C.gen, size: 60, gap: 8, rowGap: 14, padFrom: 4 });
    const addW = A6.tagW("add 000");
    const addTag = A6.tag(stage, { x: (d.mid(0, 4).x + d.mid(0, 6).x - addW) / 2, y: 10, text: "add 000", tone: "orange" });

    // the frame at the bottom: its label sits to the left, the check bits are named above them
    const frameW = 7 * 72 + 6 * 10;
    const labW = A6.tagW("frame sent");
    const left = Math.round((936 - (labW + 20 + frameW)) / 2);
    const out = A6.bits(stage, {
      x: left + labW + 20,
      y: 520,
      bits: C.frame,
      size: 72,
      gap: 10,
      tones: ["grey", "grey", "grey", "grey", "orange", "orange", "orange"],
    });
    const frameTag = A6.tag(stage, { x: left, y: 520 + 36 - 29, text: "frame sent", tone: "green" });
    const checkTag = A6.tag(stage, {
      x: (out.mid(4).x + out.mid(6).x - A6.tagW("check bits")) / 2,
      y: 452,
      text: "check bits",
      tone: "orange",
    });
    // where each frame tile starts its flight: the message tiles on the right, then the remainder tiles of the last row
    const src = (i) => (i < C.msg.length ? msg.mid(i) : d.mid(d.last, i));

    return (t) => {
      // right column
      msgTag.set({ k: ramp(t, ...T.msg, lin) });
      msg.all((i) => ({
        ...popIn(A6.seq(t, 0.3, 0.07, 0.3, i)),
        s: E.pop(A6.seq(t, 0.3, 0.07, 0.3, i)) * (1 + 0.12 * flash(t, T.copy[0] + i * 0.16, T.copy[0] + i * 0.16 + 0.3)),
      }));
      genTag.set({ k: ramp(t, ...T.gen, lin) });
      gen.all((i) => ({
        ...popIn(A6.seq(t, 0.6, 0.07, 0.3, i)),
        s: E.pop(A6.seq(t, 0.6, 0.07, 0.3, i)) * (1 + 0.1 * Math.max(flash(t, T.s1[0], T.s1[0] + 0.4), flash(t, T.s2[0], T.s2[0] + 0.4))),
      }));
      const bothOut = ramp(t, ...T.both2, lin);
      bothTag.set({ k: ramp(t, ...T.both, lin), o: 1 - bothOut });
      xorTag.set({ k: ramp(t, ...T.xor, lin) });
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

      // the frame: message tiles and remainder tiles fly down into their slots, then pulse once
      out.all((i) => {
        const k = A6.seq(t, T.fly, T.flyStep, T.flyDur, i);
        const e = E.inOut(k);
        const a = src(i);
        const b = out.mid(i);
        const tail = i < C.msg.length ? T.pulseMsg + i * 0.06 : T.pulseChk + (i - C.msg.length) * 0.06;
        return {
          x: (a.x - b.x) * (1 - e),
          y: (a.y - b.y) * (1 - e),
          s: (0.83 + 0.17 * e) * (1 + 0.12 * flash(t, tail, tail + 0.4)),
          o: clamp(k * (T.flyDur / 0.2)),
          solid: i >= C.msg.length,
        };
      });
      frameTag.set({ k: ramp(t, ...T.frameTag, lin) });
      checkTag.set({ k: ramp(t, ...T.checkTag, lin) });
    };
  }

  V.scene({
    kicker: "THE CRC",
    title: ["Check bits come from", "a long division"],
    dur: 12.5,
    caps: [
      [1.2, 3, "Pick a pattern both sides know."],
      [3.3, 5.3, "Add zeros to the message, then divide."],
      [5.6, 7.6, "Line the pattern up under the next 1."],
      [8, 9.7, "What is left over is the remainder."],
      [9.9, 11.9, "Send the message plus the remainder."],
    ],
    build,
  });
})();

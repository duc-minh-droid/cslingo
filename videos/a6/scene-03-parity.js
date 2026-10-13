/* Phase 6 · scene 03-parity (12.5 s): a parity bit makes the number of 1s even. One flip makes the count odd (an alarm, but no
   hint which bit); a second flip makes it even again and parity is fooled. Every number comes from A6.PARITY (common.js).
   Story (local seconds): 0.2-0.9 the message tiles pop, 0.8 the empty slot for the check bit; 1.0-2.8 the counter counts the four
   1s (they turn blue); 2.9-3.5 the slot becomes the orange parity bit, 3.6-4.0 the count turns green and the badge says
   "even: looks fine"; 5.4-6.4 tile 2 flips (red), the count reads 5, the badge says "odd: alarm"; 8.0-10.0 eight question marks
   (which bit?); 10.0-11.5 a second flip, the count is even again, the badge is back to green and a red "missed" tag lands. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  const P = A6.PARITY;
  const ONES = [...P.data].flatMap((c, i) => (c === "1" ? [i] : [])); // tiles that hold a 1 in the message
  const [F1] = P.one.flips; // the first flip (tile 1)
  const [F2] = P.two.flips.filter((i) => !P.one.flips.includes(i)); // the second flip (tile 4)
  A6.same("parity: the 1s of the message", [ONES, ONES.length, P.ones], [[0, 2, 3, 6], 4, 4]);
  A6.same("parity: the flips", [F1, F2], [1, 4]);
  A6.same("parity: one flip is caught, two are missed", [P.one.caught, P.two.caught], [true, false]);
  A6.same("parity: counts", [P.one.ones, P.two.ones], [5, 6]);

  const T = {
    count: 1.2, // the first 1 is counted here, then one every STEP seconds
    step: 0.4,
    bit: [2.9, 3.5],
    bitTag: [3.3, 3.7],
    even: 3.6, // the count turns green and the badge appears
    flip1: [5.4, 5.9],
    odd: 6.0, // the badge switches to "odd: alarm"
    qs: 8.0,
    qsOut: [9.7, 10.0],
    flip2: [10.0, 10.5],
    even2: 10.6,
    missed: [11.1, 11.5],
  };
  const countAt = (t) => ONES.filter((_, j) => t >= T.count + j * T.step).length;
  const onesAt = (t) => (t < T.flip1[1] ? countAt(t) : t < T.flip2[1] ? P.one.ones : P.two.ones);

  const lin = E.lin;
  const DY = 28; // the whole picture sits this far below the storyboard's y values, to centre it in the stage
  const popIn = (k) => ({ s: E.pop(k), o: clamp(k * 5) });

  function build(stage) {
    const row = A6.bits(stage, {
      x: 42,
      y: 150 + DY,
      bits: P.frame,
      size: 96,
      gap: 12,
      tones: [...Array(7).fill("grey"), "orange"],
    });
    const parityTag = A6.tag(stage, {
      x: 894 - A6.tagW("parity bit"),
      y: 264 + DY,
      text: "parity bit",
      tone: "orange",
      solid: true,
    });
    const ones = A6.stat(stage, { x: 42, y: 400 + DY, w: 270, h: 80, label: "ones", tone: "blue" });
    const badge = L5.badge(stage, {
      x: 330,
      y: 406 + DY,
      w: 420,
      h: 68,
      valid: "even: looks fine",
      invalid: "odd: alarm",
    });
    const missed = A6.tag(stage, { x: 770, y: 411 + DY, text: "missed", tone: "red", solid: true });
    const svg = L5.svg(stage);
    const qs = P.frame.split("").map((_, i) => svg.appendChild(A6.qmark(row.mid(i).x, 102 + DY, 60, "orange")));

    return (t) => {
      // the message tiles (0-6), the 1s turning blue as they are counted, the two flips
      for (let i = 0; i < 7; i++) {
        const pk = A6.seq(t, 0.2, 0.07, 0.3, i);
        const j = ONES.indexOf(i);
        const at = T.count + j * T.step;
        const counted = j >= 0 && t >= at;
        const st = {
          ...popIn(pk),
          tone: counted ? "blue" : "grey",
        };
        if (j >= 0) st.s *= 1 + 0.12 * flash(t, at, at + 0.3);
        if (i === F1)
          row.flip(i, ramp(t, ...T.flip1, lin), { ...st, from: P.frame[i], to: P.one.recv[i], toTone: "red", hop: 14 });
        else if (i === F2)
          row.flip(i, ramp(t, ...T.flip2, lin), {
            ...st,
            from: P.one.recv[i],
            to: P.two.recv[i],
            toTone: "red",
            hop: 14,
          });
        else row.set(i, st);
      }
      // the parity bit: an empty orange slot, then the solid bit
      const bk = ramp(t, ...T.bit, lin);
      if (t < T.bit[0]) row.set(7, { ghost: true, text: "", o: ramp(t, 0.8, 1.1, lin) });
      else row.set(7, { solid: true, text: P.p, s: 0.6 + 0.4 * E.pop(bk), o: clamp(bk * 6) });
      parityTag.set({ k: ramp(t, ...T.bitTag, lin) });

      // the counter and the verdict
      const n = onesAt(t);
      const bump = Math.max(
        ...ONES.map((_, j) => flash(t, T.count + j * T.step, T.count + j * T.step + 0.3)),
        flash(t, T.even, 4.0),
        flash(t, T.flip1[1], 6.2),
        flash(t, T.flip2[1], 10.8),
      );
      const tone = t < T.even ? "blue" : n % 2 === 0 ? "green" : "red";
      ones.set({ text: String(n), tone, bump, k: ramp(t, 1.0, 1.4, lin) });
      if (t < T.even) badge("none", 0);
      else if (t < T.odd) badge("valid", ramp(t, T.even, 4.0, lin));
      else if (t < T.even2) badge("invalid", ramp(t, T.odd, 6.4, lin));
      else badge("valid", ramp(t, T.even2, 11.0, lin));
      missed.set({ k: ramp(t, ...T.missed, lin) });

      // which bit? a question mark over every tile
      qs.forEach((g, i) => {
        const k = A6.seq(t, T.qs, 0.05, 0.25, i);
        const out = ramp(t, ...T.qsOut, lin);
        V.place(g, { s: 0.3 + 0.7 * E.pop(k), o: clamp(k * 5) * (1 - out) });
        L5.drawOn(g, clamp(k * 1.4));
      });
    };
  }

  V.scene({
    kicker: "PARITY",
    title: ["One check bit", "catches one flip"],
    dur: 12.5,
    caps: [
      [1.1, 2.9, "Count the 1s in the message."],
      [3.1, 5.2, "Add a bit that makes the total even."],
      [6.1, 8, "One flip makes the total odd: caught."],
      [8.2, 9.9, "But which bit? Parity cannot say."],
      [10.7, 12.4, "Two flips cancel out: missed."],
    ],
    build,
  });
})();

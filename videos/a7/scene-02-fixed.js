/* Phase 7 · Information Theory & Compression (algo-7), scene 02: a fixed code spends the same 3 bits on every letter, so BBADEBC
   costs 21 bits although B is three of the seven letters. Give B a one-bit code and the total drops to 15.
   Story (local seconds): 0.2 the code book pops (C 000, E 001, D 010, A 011, B 100), 1.0 the message tiles, 1.8 the counter, 1.9-3.7 the
   21-bit strip fills (a grey bracket under every codeword says "3 bits each"), 3.7 the counter bumps at 21, 5.8 the three B tiles get a
   blue ring, 6.5 the brackets leave, 6.9-7.6 the two trailing zeros of each B code turn red, fall and fade, 7.3-7.9 the leading 1
   slides under its tile and turns green (7.5, with the book tile B turning "B 1"), 7.4-8.4 the counter counts down to 15, 8.5 "saved 6 bits".
   Roles: grey = the fixed code, blue = the letter we look at, orange = the code we change, red = the wasted bits, green = the short code. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const { ramp, flash, lerp, ease: E } = V;
  const R = A7.REDUNDANCY;

  // ---------- the model: every number comes from the helpers, asserted here ----------
  if (R.msg !== A7.MSG || R.fixedTotal !== 21 || R.shortTotal !== 15 || R.saved !== 6 || R.counts.B !== 3)
    throw new Error("fixed scene: the redundancy data differs from the storyboard (21 -> 15 bits, B three times)");
  if (R.fixed.some((c, i) => c !== A7.FIXED[R.msg[i]] || c.length !== 3))
    throw new Error("fixed scene: every letter must have its 3-bit code from the code book");
  // the groups whose code gets shorter: keep the first `keep` bits, drop the rest (a prefix of the fixed code)
  const CUT = R.fixed
    .map((c, g) => ({
      g,
      keep: R.short[g].length,
      from: R.fixed.slice(0, g).join("").length,
      len: c.length,
      letter: R.msg[g],
    }))
    .filter((c) => R.short[c.g] !== R.fixed[c.g]);
  if (CUT.some((c) => !R.fixed[c.g].startsWith(R.short[c.g]) || c.letter !== "B") || CUT.length !== R.counts.B)
    throw new Error("fixed scene: only the three B codes may be shortened, and to a prefix of the fixed code");
  const B_SHORT = R.short[R.msg.indexOf("B")];

  // ---------- timeline ----------
  const T = {
    book: 0.2, // book tile i pops at book + 0.1 i
    msg: 1.0, // message tile j pops at msg + 0.12 j
    counter: [1.8, 2.2],
    fill: [1.9, 3.7],
    tag3: [2.5, 2.9],
    bump: [3.7, 4.1],
    ring: 5.8, // the ring of the n-th B tile starts at ring + 0.1 n
    braLeave: [6.5, 6.9],
    bookRing: 6.7,
    red: 6.9,
    fall: [7.0, 7.6], // the two trailing zeros drop out first ...
    fade: [7.2, 7.6],
    slide: [7.3, 7.9], // ... then the leading 1 slides into the middle of the codeword's old slot
    green: 7.5,
    down: [7.4, 8.4],
    solid: 8.0,
    bump2: [8.4, 8.8],
    saved: [8.5, 9.0],
  };

  V.scene({
    kicker: "REDUNDANCY",
    title: ["Every letter costs", "the same bits"],
    dur: 10,
    caps: [
      [0.4, 3.6, "A fixed code spends 3 bits on every letter."],
      [3.8, 5.6, "That is 21 bits for BBADEBC."],
      [5.8, 7.8, "But B turns up three times."],
      [7.9, 9.7, "Common letters get short codes: 15 bits."],
    ],
    build(stage) {
      // positions from the storyboard (stage px); tile j of the message is centred at x = 96 + 124 j
      const bookTiles = A7.tiles(stage, {
        x: 65,
        y: 24,
        items: A7.ORDER.map((c) => ({ text: `${c} ${A7.FIXED[c]}` })),
        w: 150,
        h: 64,
        gap: 14,
        fs: 32,
      });
      const bIdx = A7.ORDER.indexOf("B");
      const msg = A7.tiles(stage, { x: 44, y: 136, items: [...A7.MSG], w: 104, h: 100, gap: 20, fs: 56 });
      const strip = A7.bits(stage, { x: 42, y: 286, groups: R.fixed, cell: 34, h: 56, gap: 3, groupGap: 16, fs: 30 });
      // a bracket under every codeword: each one is the same width, 3 bits
      const brackets = R.fixed.map((_, g) => {
        const gr = strip.group(g);
        return A7.span(stage, { x: gr.x, y: gr.y + gr.h + 16, w: gr.w, h: 12, tone: "grey" });
      });
      // the two tags get a fixed width so that they sit exactly under the middle of the strip (x = 468)
      const mid = strip.left + strip.width / 2;
      const tag3 = A7.tag(stage, { x: mid - 95, y: 380, text: `${R.fixed[0].length} bits each`, tone: "grey" });
      tag3.el.style.width = "190px";
      const cnt = A7.counter(stage, { x: mid - 138, y: 458, w: 276, label: "bits", tone: "grey" });
      const saved = A7.tag(stage, { x: mid - 110, y: 556, text: `saved ${R.saved} bits`, tone: "green", solid: true });
      saved.el.style.width = "220px";
      // where a kept leading bit has to slide so that it sits centred under its tile
      const centreShift = (c) => {
        const g = strip.group(c.g);
        const keptW = c.keep * 34 + (c.keep - 1) * 3;
        return (g.w - keptW) / 2;
      };
      const bTiles = [...A7.MSG].map((l, j) => (l === "B" ? j : -1)).filter((j) => j >= 0);

      return (t) => {
        // the code book, then the message
        bookTiles.all((i) => {
          const isB = i === bIdx;
          const st = { k: ramp(t, T.book + 0.1 * i, T.book + 0.1 * i + 0.5, E.lin) };
          if (isB && t >= T.bookRing && t < T.green)
            Object.assign(st, { ring: "orange", ringK: ramp(t, T.bookRing, T.bookRing + 0.4, E.lin) });
          if (isB && t >= T.green) Object.assign(st, { text: `B ${B_SHORT}`, tone: "green", solid: true });
          return st;
        });
        msg.all((j) => {
          const n = bTiles.indexOf(j);
          const st = { k: ramp(t, T.msg + 0.12 * j, T.msg + 0.12 * j + 0.6, E.lin) };
          if (n >= 0 && t >= T.ring + 0.1 * n)
            Object.assign(st, { ring: "blue", ringK: ramp(t, T.ring + 0.1 * n, T.ring + 0.1 * n + 0.5, E.lin) });
          return st;
        });

        // the 21-bit strip fills left to right; the counter follows it
        const fillK = ramp(t, T.fill[0], T.fill[1], E.lin);
        const cells = {};
        CUT.forEach((c) => {
          for (let b = 0; b < c.len; b++) {
            const i = c.from + b;
            if (b < c.keep)
              cells[i] = {
                x: centreShift(c) * ramp(t, T.slide[0], T.slide[1], E.inOut),
                ...(t >= T.green ? { tone: "green", solid: true } : {}),
              };
            else
              cells[i] = {
                ...(t >= T.red ? { tone: "red" } : {}),
                y: 40 * ramp(t, T.fall[0], T.fall[1], E.inOut),
                o: 1 - ramp(t, T.fade[0], T.fade[1]),
              };
          }
        });
        strip.set({ k: fillK, cells });

        // brackets: "3 bits each" while the code is fixed, gone before the shrink
        const leave = 1 - ramp(t, T.braLeave[0], T.braLeave[1], E.lin);
        brackets.forEach((b, g) => {
          const a = T.fill[0] + ((T.fill[1] - T.fill[0]) * (g * 3)) / R.fixedTotal;
          b.set({ k: ramp(t, a, a + 0.3, E.lin), o: leave });
        });
        tag3.set({ k: ramp(t, T.tag3[0], T.tag3[1], E.lin), o: leave });

        // the counter: up to 21, then down to 15
        const down = ramp(t, T.down[0], T.down[1]);
        const n = t < T.down[0] ? Math.round(R.fixedTotal * fillK) : Math.round(lerp(R.fixedTotal, R.shortTotal, down));
        const done = t >= T.solid;
        cnt.set({
          k: ramp(t, T.counter[0], T.counter[1], E.lin),
          text: String(n),
          tone: done ? "green" : "grey",
          solid: done,
          bump: Math.max(flash(t, T.bump[0], T.bump[1]), flash(t, T.bump2[0], T.bump2[1])),
        });
        saved.set({ k: ramp(t, T.saved[0], T.saved[1], E.lin) });
      };
    },
  });
})();

/* Phase 6 · scene 08-groups (14.95 s): Hamming(7,4) builds the codeword 0110011 from the data 1011: 4 useful bits in 7 (the cube's
   3 copies carried 1 in 3). The check bits sit at positions 1, 2, 4; each one guards the group of positions whose binary number
   has a 1 in its own digit (p4 the first, p2 the middle, p1 the last) and is set so that its group holds an even number of 1s.
   Every number comes from A6.HAM (common.js).
   Story (local seconds): 0.2-1.0 the seven tiles pop (check tiles p1 p2 p4 orange, data grey), the position numbers fade in and
   the legend counts them (3 check bits, 4 data bits); 2.8-4.5 the numbers 1, 2, 4 turn orange and the check tiles pulse; 4.5-5.3 the
   binary numbers fade in. Then one band per check, in the order p4, p2, p1: the band and its purple rings pop, the discs of the
   watched positions pop in while ONE counter under the bands tallies the 1s among the data bits, the check bit's own disc shows ?,
   a tag states the rule ("odd: check bit = 1" / "even: check bit = 0"), then the tile and the disc reveal the bit and the tag says
   the total is even. The first group takes longer: it also says why (its bit makes the 1s even). 13.4-14.0 the three bands pass
   their check (green, ticks); then a hold. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const { ramp, flash, clamp, ease: E } = V;
  const HM = A6.HAM;
  const lin = E.lin;

  const ORDER = ["p4", "p2", "p1"]; // the bands, top to bottom (the order they are read)
  const ENC = Object.fromEntries(HM.encode.map((e) => [e.name, e]));
  const OWN = Object.fromEntries(ORDER.map((n) => [n, HM.groups[n][0]])); // a check bit is the first position of its group
  const NAME_AT = Object.fromEntries(ORDER.map((n) => [OWN[n], n])); // position -> its check bit

  A6.same(
    "groups: 3 check bits and 4 data bits make 7; 4 useful bits in 7",
    [HM.checkPos.length, HM.dataPos.length, A6.RATE.hamming.data, A6.RATE.hamming.sent],
    [3, 4, 4, 7],
  );
  A6.same(
    "groups: the check positions",
    ORDER.map((n) => OWN[n]),
    [4, 2, 1],
  );
  A6.same(
    "groups: 1s among the data bits, the check bit, the total",
    ORDER.map((n) => [ENC[n].ones, ENC[n].bit, ENC[n].ones + ENC[n].bit]),
    [
      [2, 0, 2],
      [3, 1, 4],
      [2, 0, 2],
    ],
  );
  ORDER.forEach((n) => {
    A6.same(`groups: ${n} sits at its position in the codeword`, HM.cw[OWN[n] - 1], String(ENC[n].bit));
    A6.same(`groups: ${n} makes the count even`, (ENC[n].ones + ENC[n].bit) % 2, 0);
    A6.same(`groups: ${n} watches the whole group`, A6.hCheck(HM.cw, n).ones, ENC[n].ones + ENC[n].bit);
  });

  // one block of time per band: s = the band pops; the discs and the tally follow; the group says odd or even; the check bit is
  // revealed; the band goes quiet. The first band is slower: it also has to say that the check bit makes the 1s even.
  const STARTS = [6.1, 9.0, 11.2];
  const SHAPE = [
    { settle: 1.4, rev: [1.9, 2.4], off: 2.8 }, // the first group is held a little longer
    { settle: 1.15, rev: [1.6, 2.05], off: 2.2 },
    { settle: 1.15, rev: [1.6, 2.05], off: 2.2 },
  ];
  const B = Object.fromEntries(
    ORDER.map((n, k) => {
      const s = STARTS[k];
      const sh = SHAPE[k];
      return [
        n,
        {
          s,
          pop: [s, s + 0.4],
          ring: [s + 0.15, s + 0.55],
          dots: [s + 0.25, s + 1.05],
          settle: s + sh.settle, // the count is complete: the group says odd or even
          rev: [s + sh.rev[0], s + sh.rev[1]],
          off: s + sh.off,
        },
      ];
    }),
  );
  const T = {
    tiles: 0.2, // first tile pops here, then one every 0.07 s
    nums: [0.7, 1.2],
    hot: [2.8, 4.5], // the check positions 1, 2, 4 stand out
    bin: [4.5, 5.3],
    legend: [1.0, 1.4],
    legendOut: [5.6, 5.9],
    ok: 13.4, // the bands pass, one after the other
    tally: 0.15, // the counter appears this long after its band
    outro: [13.3, 13.65], // the counter and its tag leave as the ticks arrive
  };
  const flipMid = (n) => (B[n].rev[0] + B[n].rev[1]) / 2; // the tile is edge-on half way through its flip
  const revealed = (n, t) => t >= flipMid(n);
  const bandAt = (t) => ORDER.find((n) => t >= B[n].s && t < B[n].off) || null;
  const okAt = (n) => T.ok + 0.13 * ORDER.indexOf(n);

  // the 1s counted so far among the data bits of a group (they pop in with the discs), plus the check bit once revealed
  function countAt(n, t) {
    const b = B[n];
    let c = 0;
    HM.groups[n].forEach((p, j) => {
      if (p !== OWN[n] && HM.cw[p - 1] === "1" && t >= b.dots[0] + 0.16 * j + 0.1) c++;
    });
    return c + (revealed(n, t) ? ENC[n].bit : 0);
  }
  const countBumps = (n, t) => {
    const b = B[n];
    const hits = HM.groups[n].flatMap((p, j) =>
      p !== OWN[n] && HM.cw[p - 1] === "1" ? [b.dots[0] + 0.16 * j + 0.1] : [],
    );
    return Math.max(
      ...hits.map((h) => flash(t, h, h + 0.3)),
      flash(t, b.settle, b.settle + 0.4),
      flash(t, flipMid(n), flipMid(n) + 0.45),
    );
  };

  function build(stage) {
    const H = A6.hamRig(stage, { x: 118, y: 56, size: 88, gap: 14, rowH: 78, word: HM.cw });
    // ONE counter that sits right under the band being read (it moves down with the bands) and a tag that states the rule
    const tallyY = H.rowY(ORDER[0]) + 76;
    const tally = A6.stat(stage, { x: 150, y: tallyY, w: 270, h: 80, label: "p4 ones", tone: "blue" });
    const verdict = A6.tag(stage, { x: 452, y: tallyY + 9, text: "even: check bit = 0", tone: "green" });
    // what the colours mean, and how many of each (4 useful bits among the 7)
    const legText = [`${HM.checkPos.length} check bits`, `${HM.dataPos.length} data bits`];
    const legW = legText.map((x) => A6.tagW(x) + 20); // the real tags are about 20 px wider than the estimate
    const legX = (936 - (legW[0] + legW[1] + 28)) / 2;
    const legend = [
      A6.tag(stage, { x: legX, y: 272, text: legText[0], tone: "orange", solid: true }),
      A6.tag(stage, { x: legX + legW[0] + 28, y: 272, text: legText[1], tone: "grey" }),
    ];

    return (t) => {
      const act = bandAt(t);

      // the seven tiles: check bits show p1 p2 p4 until their value is worked out
      for (let i = 0; i < 7; i++) {
        const p = i + 1;
        const pk = A6.seq(t, T.tiles, 0.07, 0.3, i);
        const st = { s: E.pop(pk), o: clamp(pk * 5) };
        const rn = ORDER.find((n) => t >= B[n].s && t < B[n].off && HM.groups[n].includes(p));
        if (rn) Object.assign(st, { ring: "purple", ringK: ramp(t, ...B[rn].ring, lin) });
        const name = NAME_AT[p];
        if (name) {
          const nth = ORDER.length - 1 - ORDER.indexOf(name); // pulses 1, 2, 4 in that order
          st.s *= 1 + 0.12 * flash(t, T.hot[0] + 0.25 * nth, T.hot[0] + 0.25 * nth + 0.35);
          H.bits.flip(i, ramp(t, ...B[name].rev, lin), { ...st, from: name, to: HM.cw[i], hop: 10 });
        } else H.set(i, { ...st, text: HM.cw[i] });
      }

      // the position numbers, then the same numbers in binary (the digit a check reads turns purple)
      const hot = t >= T.hot[0] && t < T.hot[1] ? HM.checkPos : [];
      H.nums(ramp(t, ...T.nums, lin), { hot, tone: "orange" });
      H.bin(ramp(t, ...T.bin, lin), { hot: act });

      // the three check bands
      ORDER.forEach((n, k) => {
        const b = B[n];
        const done = revealed(n, t);
        const vals = [...HM.cw].map((c, i) => (i + 1 === OWN[n] && !done ? "0" : c)).join("");
        H.row(n, {
          k: ramp(t, ...b.pop, lin),
          dots: ramp(t, ...b.dots, lin),
          vals,
          own: done ? null : "?",
          tone: act === n ? "purple" : "grey",
          verdict: t >= okAt(n) ? "ok" : null,
          vk: ramp(t, okAt(n), okAt(n) + 0.35, lin),
        });
      });

      // the tally of the group being read: blue while counting, then the group says odd (orange) or even (green) and what its
      // check bit must be; the revealed bit makes the total even (green)
      const gi = ORDER.reduce((g, n, k) => (t >= B[n].s ? k : g), -1);
      const n = ORDER[Math.max(gi, 0)];
      const b = B[n];
      const c = countAt(n, t);
      const done = revealed(n, t);
      const odd = ENC[n].ones % 2 === 1; // an odd count of 1s among the data bits needs a 1 as the check bit
      const out = 1 - ramp(t, ...T.outro, lin);
      A6.setText(tally.el.firstChild, `${n} ones`);
      tally.set({
        text: String(c),
        tone: t < b.settle ? "blue" : c % 2 === 0 ? "green" : "orange",
        bump: countBumps(n, t),
        k: gi < 0 ? 0 : ramp(t, b.s + T.tally, b.s + T.tally + 0.3, lin),
        y: H.rowY(n) - H.rowY(ORDER[0]),
        o: out,
      });
      verdict.set({
        text: done ? `total ${c}: even` : odd ? "odd: check bit = 1" : "even: check bit = 0",
        tone: done || !odd ? "green" : "orange",
        solid: done,
        s: 1 + 0.1 * flash(t, flipMid(n), flipMid(n) + 0.4),
        k: gi < 0 ? 0 : ramp(t, b.settle, b.settle + 0.3, lin),
        y: H.rowY(n) - H.rowY(ORDER[0]),
        o: out,
      });

      // what the colours mean, shown while the tiles are still new
      const lo = ramp(t, ...T.legendOut, lin);
      legend.forEach((g, k) => g.set({ k: ramp(t, T.legend[0] + 0.15 * k, T.legend[1] + 0.15 * k, lin), o: 1 - lo }));
    };
  }

  V.scene({
    kicker: "CORRECTING · HAMMING CODE",
    title: ["Three checks,", "each guards a group"],
    dur: 14.95,
    caps: [
      [0.9, 2.7, `Hamming sends ${A6.RATE.hamming.data} useful bits in ${A6.RATE.hamming.sent}.`],
      [2.8, 4.5, "Check bits sit at positions 1, 2, 4."],
      [4.6, 6.1, "Write each position in binary."],
      [6.2, 7.6, "p4 guards positions starting with 1."],
      [7.7, 9.2, "Its bit makes the 1s even."],
      [9.3, 10.9, "p2 guards positions with a middle 1."],
      [11.3, 12.9, "p1 guards positions ending in 1."],
      [13.45, 14.9, "Every group now has an even count."],
    ],
    build,
  });
})();

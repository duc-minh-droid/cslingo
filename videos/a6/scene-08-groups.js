/* Phase 6 · scene 08-groups (12.5 s): Hamming(7,4) builds the codeword 0110011 from the data 1011. The check bits sit at positions
   1, 2, 4; each one guards the group of positions whose binary number has a 1 in its own digit (p4 the first, p2 the middle, p1
   the last) and is set so that its group holds an even number of 1s. Every number comes from A6.HAM (common.js).
   Story (local seconds): 0.2-1.0 the seven tiles pop (check tiles p1 p2 p4 orange, data grey) and the position numbers fade in;
   1.3-2.9 the numbers 1, 2, 4 turn orange and the check tiles pulse; 2.6-3.5 the binary numbers fade in. Then one band per check,
   in the order p4, p2, p1 (each 2 s): the band and its purple rings pop, the discs of the watched positions pop in while a blue
   counter tallies the 1s among the data bits, the check bit's own disc shows ?, the counter says odd (orange) or even (green), then
   the tile and the disc reveal the bit that makes the total even (the counter turns green). 10.35-11.0 the three bands pass their
   check (green, ticks); 11.0-12.5 hold. Legend tags (check bit / data bit) sit under the tiles 1.1-4.2, where the first band pops. */
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

  // one block of time per band: s = the band pops; the discs and the tally follow; the check bit is revealed; the band goes quiet
  const B = Object.fromEntries(
    ORDER.map((n, k) => {
      const s = 4.4 + 2 * k;
      return [
        n,
        {
          s,
          pop: [s, s + 0.4],
          ring: [s + 0.15, s + 0.55],
          dots: [s + 0.25, s + 1.05],
          settle: s + 0.95, // the count is complete: the group says odd or even
          rev: [s + 1.45, s + 1.9],
          off: s + 1.95,
        },
      ];
    }),
  );
  const T = {
    tiles: 0.2, // first tile pops here, then one every 0.07 s
    nums: [0.7, 1.2],
    hot: [1.3, 2.9], // the check positions 1, 2, 4 stand out
    bin: [2.6, 3.5],
    legend: [1.1, 1.5],
    legendOut: [3.9, 4.2],
    ok: 10.35, // the bands pass, one after the other
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
    const statX = (k) => 54 + 286 * k;
    const stats = ORDER.map((n, k) =>
      A6.stat(stage, { x: statX(k), y: 520, w: 262, h: 80, label: `${n} ones`, tone: "blue" }),
    );
    const legW = [A6.tagW("check bit"), A6.tagW("data bit")];
    const legX = (936 - (legW[0] + legW[1] + 28)) / 2;
    const legend = [
      A6.tag(stage, { x: legX, y: 272, text: "check bit", tone: "orange", solid: true }),
      A6.tag(stage, { x: legX + legW[0] + 28, y: 272, text: "data bit", tone: "grey" }),
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
        // the tally of 1s: blue while counting, then the group says odd (orange) or even (green); the check bit makes it even
        const c = countAt(n, t);
        const word = t < b.settle ? "ones" : c % 2 === 0 ? "even" : "odd";
        A6.setText(stats[k].el.firstChild, `${n} ${word}`);
        stats[k].set({
          text: String(c),
          tone: word === "ones" ? "blue" : word === "odd" ? "orange" : "green",
          bump: countBumps(n, t),
          k: ramp(t, b.s + 0.15, b.s + 0.45, lin),
        });
      });

      // what the colours mean, shown while the tiles are still new
      const lo = ramp(t, ...T.legendOut, lin);
      legend.forEach((g, k) => g.set({ k: ramp(t, T.legend[0] + 0.15 * k, T.legend[1] + 0.15 * k, lin), o: 1 - lo }));
    };
  }

  V.scene({
    kicker: "HAMMING CODE",
    title: ["Three checks,", "each guards a group"],
    dur: 12.5,
    caps: [
      [0.9, 2.8, "Check bits sit at positions 1, 2, 4."],
      [3, 4.6, "Write each position in binary."],
      [4.9, 6.5, "p4 guards positions starting with 1."],
      [6.7, 8.5, "p2 guards positions with a middle 1."],
      [8.8, 10.4, "p1 guards positions ending in 1."],
      [10.6, 12.3, "Every group now has an even count."],
    ],
    build,
  });
})();

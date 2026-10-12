/* Phase 6 · scene 10-limit (12.2 s): Hamming assumes ONE flip. With two flips (positions 2 and 5, the pair that fooled parity in
   scene 3 and was caught by the CRC in scene 5) every group holds exactly one wrong bit, so all three checks fail, the failures
   spell 111 = 7, and the repair flips position 7: a third bit that was correct. Now every check passes, yet three bits are wrong
   and the data reads 1110, not 1011. Over all 16 codewords every one of the 112 single flips is repaired and none of the 336
   double flips is. Every number comes from A6.HAM (common.js); nothing is typed here.
   Story (local seconds): 0.2-1.5 the rig pops in (the codeword 0110011, three green ticks); 1.3-2.4 two bolts flip positions 2
   and 5 (red); 3.0-5.4 the ticks are rubbed out and each group is recounted in turn (one wrong bit in each, so each fails);
   5.4-6.7 the failures read 1 1 1 = 7; 6.7-7.5 a copy of the answer flies to position 7; 7.5-8.0 position 7 flips red (the
   third wrong bit); 8.1-9.1 a tag says position 7 was correct and the checks run again: three green ticks; 9.1-10.4 the data
   before and after (1011 -> 1110, two bits differ); 10.5-11.4 the two audit tags (1 flip: 112 of 112 fixed, 2 flips: 0 of 336). */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { ramp, lerp, clamp, ease: E } = V;
  const lin = E.lin;

  const HM = A6.HAM;
  const TWO = HM.two;
  const EVERY = HM.every;
  const W0 = HM.cw; // the clean codeword
  const W1 = TWO.recv; // after the two flips
  const W2 = TWO.fixed; // after the "repair"
  const HIT = TWO.flips.map(A6.idx); // the two noisy tiles (indices 1 and 4)
  const AT = A6.idx(TWO.at); // the tile the failed checks point at (index 6 = position 7)
  const NAMES = TWO.checks.map((c) => c.name); // p4, p2, p1: the order of the bands on screen
  const SYN = [...TWO.syn].map(Number); // failed checks as 1 / 0, in the order p4 p2 p1
  const GOT = TWO.data; // the data the receiver ends up with
  const TXT = {
    one: `1 flip: ${EVERY.one[1]} of ${EVERY.one[0]} fixed`,
    two: `2 flips: ${EVERY.two[1]} of ${EVERY.two[0]} fixed`,
  };

  A6.same(
    "limit: words and the pointed-at position",
    [W0, W1, W2, TWO.flips, TWO.syn, TWO.at],
    ["0110011", "0010111", "0010110", [2, 5], "111", 7],
  );
  A6.same("limit: the noise changes two tiles", [A6.diffAt(W0, W1), W0[1] + W1[1], W0[4] + W1[4]], [HIT, "10", "01"]);
  A6.same(
    "limit: every group holds exactly one wrong bit, so every check fails with three 1s",
    [
      NAMES,
      NAMES.map((n) => HM.groups[n].filter((p) => TWO.flips.includes(p)).length),
      TWO.checks.map((c) => [c.ones, c.fail]),
    ],
    [
      ["p4", "p2", "p1"],
      [1, 1, 1],
      [
        [3, true],
        [3, true],
        [3, true],
      ],
    ],
  );
  A6.same(
    "limit: the clean word passes every check",
    A6.hChecks(W0).map((c) => c.fail),
    [false, false, false],
  );
  A6.same(
    "limit: after the repair every check passes (the receiver is fooled)",
    A6.hChecks(W2).map((c) => c.fail),
    [false, false, false],
  );
  A6.same("limit: position 7 was correct before the repair", [W1[AT], W0[AT], W2[AT]], ["1", "1", "0"]);
  A6.same("limit: three bits are wrong after the repair", [A6.diffAt(W2, W0).map(A6.pos), TWO.wrong], [[2, 5, 7], [2, 5, 7]]);
  A6.same(
    "limit: the data",
    [HM.data, GOT, A6.hData(W2), A6.diffAt(HM.data, GOT)],
    ["1011", "1110", "1110", [1, 3]],
  );
  A6.same("limit: the audit", [EVERY, TXT.one, TXT.two], [{ one: [112, 112], two: [336, 0] }, "1 flip: 112 of 112 fixed", "2 flips: 0 of 336 fixed"]);

  const T = {
    tile: 0.2, // the first tile pops here, then one every 0.07 s
    nums: [0.4, 1.0], // position numbers and binary numbers
    band: 0.6, // the first band pops here, then one every 0.1 s
    tick: 0.9, // the first tick draws here, then one every 0.1 s
    bolts: [
      // [pops in, fades out]: the bolt over each noisy tile
      [
        [1.3, 1.75],
        [1.7, 2.05],
      ],
      [
        [1.7, 2.15],
        [2.1, 2.45],
      ],
    ],
    noise: [
      [1.6, 2.0],
      [2.0, 2.4],
    ], // the two tiles flip
    reset: [3.0, 3.3], // the ticks are rubbed out: the receiver counts again
    read: 3.4, // the first group is read here, then one every STEP seconds
    syn: [5.4, 6.0],
    eq: [6.0, 6.3],
    num: [6.3, 6.7],
    at: 6.4, // the binary label under position 7 turns orange
    fly: [6.7, 7.4],
    ring: [7.2, 7.5],
    repair: [7.5, 7.95], // position 7 flips
    synOut: [7.8, 8.1],
    mend: [8.05, 8.3], // the crosses are rubbed out, then the checks are run again
    tick2: 8.4, // the first new tick draws here, then one every 0.15 s
    fine: [8.1, 8.45],
    fineOut: [8.95, 9.2],
    data: 9.1, // the data before and after
    dataOut: [10.1, 10.35],
    stat: [
      [10.5, 10.85],
      [10.95, 11.3],
    ],
  };
  const STEP = 0.6;
  const band0 = (j) => T.read + STEP * j;
  const popIn = (k) => ({ s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) });
  const mid = (a) => (a[0] + a[1]) / 2; // a tile is edge-on half way through its flip

  // which group (0..2) is being read at time t, or -1
  const reading = (t) => {
    const j = Math.floor((t - T.read) / STEP);
    return t >= T.read && t < band0(j) + 0.5 && j < NAMES.length ? j : -1;
  };

  function build(stage) {
    const H = A6.hamRig(stage, { x: 118, y: 56, size: 88, gap: 14, rowH: 78, word: W0 });
    const svg = L5.svg(stage);
    const bolts = HIT.map((i) => svg.appendChild(A6.bolt(H.mid(i).x, 100, 100, "orange")));
    const cover = NAMES.map((n) => H.cover(n));
    const land = { x: H.mid(AT).x, y: 38 };
    const home = H.syn.numHome();
    // the answer stays in the readout (111 = 7); a copy of its disc flies up to the tile
    const pointer = A6.disc(stage, { x: home.x, y: home.y, size: 84, text: String(TWO.at), tone: "orange" });

    // "position 7 was correct": the repair hit an innocent bit
    const fineText = `Position ${TWO.at} was correct`;
    const fine = A6.tag(stage, { x: 468 - A6.tagW(fineText) / 2, y: 532, text: fineText, tone: "green" });

    // the data before and after the repair, side by side
    const [DS, DG, DY] = [62, 10, 548];
    const DW = 4 * DS + 3 * DG;
    const dx = [150, 150 + DW + 80];
    const sent = A6.bits(stage, { x: dx[0], y: DY, bits: HM.data, size: DS, gap: DG, fs: 38 });
    const got = A6.bits(stage, { x: dx[1], y: DY, bits: GOT, size: DS, gap: DG, fs: 38 });
    const dataLab = ["data sent", "data received"].map((text, k) =>
      stage.appendChild(
        V.h("div", {
          class: "v-text dim",
          text,
          style: { ...A6.abs(dx[k], DY - 48, DW), textAlign: "center", fontSize: "30px" },
        }),
      ),
    );
    const arrow = svg.appendChild(L5.arrow(dx[0] + DW + 16, DY + DS / 2, dx[1] - 16, DY + DS / 2, "orange", 1, { w: 8, head: 22 }));
    const stats = [
      A6.tag(stage, { x: 468 - A6.tagW(TXT.one) / 2, y: 500, text: TXT.one, tone: "green" }),
      A6.tag(stage, { x: 468 - A6.tagW(TXT.two) / 2, y: 566, text: TXT.two, tone: "red", solid: true }),
    ];

    // a purple ring on the tiles of the group being read, an orange one on the tile the answer points at
    const ringFor = (t, i) => {
      let best = 0;
      NAMES.forEach((_, j) => {
        const b = band0(j);
        if (cover[j][i]) best = Math.max(best, clamp(ramp(t, b + 0.05, b + 0.4, lin) - ramp(t, b + 0.45, b + 0.6, lin)));
      });
      if (best > 0) return { ring: "purple", ringK: best };
      const k = clamp(ramp(t, ...T.ring, lin) - ramp(t, T.repair[1], T.repair[1] + 0.25, lin));
      return i === AT && k > 0 ? { ring: "orange", ringK: k } : {};
    };
    const tone0 = (i) => (HM.checkPos.includes(i + 1) ? "orange" : "grey");

    return (t) => {
      // ---- the seven tiles: the noise flips two, the "repair" flips a third ----
      for (let i = 0; i < 7; i++) {
        const st = { ...popIn(A6.seq(t, T.tile, 0.07, 0.3, i)), ...ringFor(t, i) };
        const h = HIT.indexOf(i);
        if (h >= 0) {
          const k = ramp(t, ...T.noise[h], lin);
          H.bits.flip(i, k, { ...st, from: W0[i], to: W1[i], tone: tone0(i), toTone: "red", solid: k >= 0.5, hop: 10 });
        } else if (i === AT) {
          const k = ramp(t, ...T.repair, lin);
          H.bits.flip(i, k, { ...st, from: W1[i], to: W2[i], tone: tone0(i), toTone: "red", solid: k >= 0.5, hop: 10 });
        } else H.set(i, { ...st, text: W0[i] });
      }

      // ---- noise ----
      bolts.forEach((b, h) => {
        const [on, off] = T.bolts[h];
        const bk = ramp(t, ...on, lin);
        V.place(b, { s: lerp(0.5, 1.1, E.pop(bk)), o: Math.min(1, bk * 4) * (1 - ramp(t, ...off, lin)) });
      });

      // ---- position numbers (the wrong ones turn red) and their binary names ----
      const wrong = [
        ...TWO.flips.filter((_, h) => t >= mid(T.noise[h])),
        ...(t >= mid(T.repair) ? [TWO.at] : []),
      ];
      const nk = ramp(t, ...T.nums, lin);
      const j = reading(t);
      H.nums(nk, { hot: wrong, tone: "red" });
      H.bin(nk, { hot: j >= 0 ? NAMES[j] : null, at: t >= T.at && t < mid(T.repair) ? TWO.at : null });

      // ---- the three check bands ----
      const word = t < T.reset[0] ? W0 : t < T.mend[0] ? W1 : W2;
      const bad = word === W1 ? TWO.flips : word === W2 ? TWO.wrong : [];
      NAMES.forEach((name, b) => {
        const s = band0(b);
        const st = { k: ramp(t, T.band + 0.1 * b, T.band + 0.1 * b + 0.35, lin), vals: word, bad, tone: "grey" };
        if (t < T.reset[0])
          Object.assign(st, { verdict: "ok", vk: ramp(t, T.tick + 0.1 * b, T.tick + 0.1 * b + 0.35, lin) });
        else if (t < T.reset[1]) Object.assign(st, { verdict: "ok", vk: 1 - ramp(t, ...T.reset, lin) });
        else if (t < T.mend[0]) {
          if (t < s + 0.45) st.tone = t >= s ? "purple" : "grey";
          else Object.assign(st, { tone: "purple", verdict: "bad", vk: ramp(t, s + 0.45, s + 0.8, lin) });
        } else if (t < T.mend[1]) Object.assign(st, { verdict: "bad", vk: 1 - ramp(t, ...T.mend, lin) });
        else Object.assign(st, { verdict: "ok", vk: ramp(t, T.tick2 + 0.15 * b, T.tick2 + 0.15 * b + 0.35, lin) });
        H.row(name, st);
      });

      // ---- the readout: failed, failed, failed = 1 1 1 = 7, then the answer flies up to its tile ----
      const f = E.inOut(ramp(t, ...T.fly, lin));
      const out = 1 - ramp(t, ...T.synOut, lin);
      H.syn.set({
        vals: SYN,
        k: ramp(t, ...T.syn, lin),
        eqK: ramp(t, ...T.eq, lin),
        num: String(TWO.at),
        numK: ramp(t, ...T.num, lin),
        o: out,
      });
      pointer.set({
        x: (land.x - home.x) * f,
        y: (land.y - home.y) * f,
        s: lerp(1, 0.62, f),
        o: (t < T.fly[0] ? 0 : 1) * out,
      });

      // ---- position 7 was correct ----
      fine.set({ k: ramp(t, ...T.fine, lin), o: 1 - ramp(t, ...T.fineOut, lin) });

      // ---- the data before and after: two data bits differ ----
      const dOut = 1 - ramp(t, ...T.dataOut, lin);
      sent.all((i) => ({ ...popIn(A6.seq(t, T.data, 0.05, 0.3, i)), o: popIn(A6.seq(t, T.data, 0.05, 0.3, i)).o * dOut }));
      got.all((i) => {
        const p = popIn(A6.seq(t, T.data + 0.3, 0.06, 0.3, i));
        const diff = HM.data[i] !== GOT[i];
        return { ...p, o: p.o * dOut, tone: diff ? "red" : "grey", solid: diff };
      });
      dataLab.forEach((e, k) => V.place(e, { y: 8 * (1 - ramp(t, T.data + 0.1 + 0.3 * k, T.data + 0.4 + 0.3 * k, lin)), o: ramp(t, T.data + 0.1 + 0.3 * k, T.data + 0.4 + 0.3 * k, lin) * dOut }));
      L5.drawOn(arrow, ramp(t, T.data + 0.3, T.data + 0.6, lin));
      V.show(arrow, dOut);

      // ---- the audit: one flip is always repaired, two never ----
      stats.forEach((g, k) => g.set({ k: ramp(t, ...T.stat[k], lin) }));
    };
  }

  V.scene({
    kicker: "THE LIMIT",
    title: ["Hamming fixes one", "error, not two"],
    dur: 12.2,
    caps: [
      [2.2, 3.9, "Two bits flip: positions 2 and 5."],
      [5.5, 7.2, "All fail: 111 means position 7."],
      [7.6, 9, "The repair flips an innocent bit."],
      [9.1, 10.7, "Checks pass, yet the data is wrong."],
      [10.8, 12, "Hamming fixes exactly one error."],
    ],
    build,
  });
})();

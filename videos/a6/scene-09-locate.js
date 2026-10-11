/* Phase 6 · scene 09-locate (14 s): after a flip, exactly the checks whose group holds the flipped bit fail. Read the failures as
   a binary number, p4 p2 p1, and you get the POSITION of the flipped bit; flip it back. Runs on the codeword 0110011 (scene 8)
   with position 6 flipped. Every number comes from A6.HAM (common.js); nothing is typed here.
   Story (local seconds): 0.2-1.0 the rig pops in, a clean word, three green ticks; 2.5-3.4 noise flips position 6 (red);
   4.0-8.7 each group is recounted in turn (rings on its tiles, a "ones" counter, odd = failed): p4 and p2 fail, p1 passes;
   9.0-10.5 the failures read 1 1 0 = 6 and the binary label under position 6 lights up; 10.9-11.9 a copy of the answer flies up to the
   tile (there is no room above the tile row for a separate arrow, so the disc sits on the ring); 12.1-12.6 the tile flips back (green); 12.7-13.4 the checks pass again. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  const L5 = V.l5;
  const { ramp, lerp, flash, clamp, ease: E } = V;
  const lin = E.lin;

  const HM = A6.HAM;
  const ONE = HM.one;
  const W0 = HM.cw; // the clean codeword
  const W1 = ONE.recv; // after the flip
  const W2 = ONE.fixed; // after the repair
  const FI = A6.idx(ONE.flip); // the flipped tile (index 5 = position 6)
  const NAMES = ONE.checks.map((c) => c.name); // p4, p2, p1: the order of the bands on screen
  const SYN = [...ONE.syn].map(Number); // failed checks as 1 / 0, in the order p4 p2 p1
  const ONES = ONE.checks.map((c) => c.ones);
  A6.same("locate: words", [W0, W1, W2, ONE.flip, ONE.at, ONE.syn], ["0110011", "0110001", "0110011", 6, 6, "110"]);
  A6.same("locate: the flip is one tile", [A6.diffAt(W0, W1), FI, W0[FI], W1[FI]], [[5], 5, "1", "0"]);
  A6.same(
    "locate: bands",
    [NAMES, ONE.checks.map((c) => c.fail), ONES],
    [
      ["p4", "p2", "p1"],
      [true, true, false],
      [1, 3, 2],
    ],
  );
  A6.same(
    "locate: the clean word passes every check",
    A6.hChecks(W0).map((c) => c.fail),
    [false, false, false],
  );
  A6.same(
    "locate: the repair passes every check",
    A6.hChecks(W2).map((c) => c.fail),
    [false, false, false],
  );

  const T = {
    tile: 0.2, // the first tile pops here, then one every 0.05 s
    nums: [0.3, 0.75], // position numbers and binary numbers
    band: 0.35, // the first band pops here, then one every 0.06 s
    tick: 0.55, // the first tick draws here, then one every 0.08 s
    bolt: [2.5, 2.95],
    boltOut: [2.9, 3.25],
    flip: [3.0, 3.4],
    reset: [4.0, 4.4], // the ticks are rubbed out: the receiver counts again
    read: 4.6, // the first group is read here, then one every STEP seconds
    ctrOut: [8.75, 9.0],
    syn: [9.0, 9.7],
    eq: [9.8, 10.1],
    num: [10.1, 10.5],
    at: 10.2, // the binary label under the position turns orange
    fly: [10.9, 11.6],
    ring: [11.5, 11.9],
    back: [12.1, 12.6], // the tile flips back
    synOut: [12.5, 12.9],
    mend: 12.7, // the checks are run again
  };
  const STEP = 1.4;
  const band0 = (j) => T.read + STEP * j;
  const countAt = (j) => band0(j) + 0.3; // when the counter shows this group's number of 1s
  const popIn = (k) => ({ s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) });

  // which group (0..2) is being read at time t, or -1
  const reading = (t) => {
    const j = Math.floor((t - T.read) / STEP);
    return t >= T.read && j < NAMES.length ? j : -1;
  };

  function build(stage) {
    const H = A6.hamRig(stage, { x: 118, y: 56, size: 88, gap: 14, rowH: 78, word: W0 });
    const svg = L5.svg(stage);
    const bolt = svg.appendChild(A6.bolt(H.mid(FI).x, 100, 100, "orange"));
    const ctr = A6.stat(stage, { x: 180, y: 524, w: 270, h: 80, label: "ones", tone: "blue" });
    const verdict = A6.tag(stage, { x: 464, y: 535, text: "odd: failed", tone: "red", solid: true });
    const land = { x: H.mid(FI).x, y: 24 };
    const home = H.syn.numHome();
    // the answer stays in the readout (110 = 6); a copy of its disc flies up to the tile
    const pointer = A6.disc(stage, { x: home.x, y: home.y, size: 84, text: String(ONE.at), tone: "orange" });
    const cover = NAMES.map((n) => H.cover(n));

    // a purple ring on the tiles of the group being read, an orange one on the tile the answer points at
    const ringFor = (t, i) => {
      for (let j = 0; j < NAMES.length; j++) {
        const b = band0(j);
        const k = clamp(ramp(t, b + 0.1, b + 0.5, lin) - ramp(t, b + 1.0, b + 1.3, lin));
        if (cover[j][i] && k > 0) return { ring: "purple", ringK: k };
      }
      const k = clamp(ramp(t, ...T.ring, lin) - ramp(t, T.back[1], T.back[1] + 0.3, lin));
      return i === FI && k > 0 ? { ring: "orange", ringK: k } : {};
    };

    return (t) => {
      // ---- the seven tiles; the flipped one goes red, and back to green ----
      for (let i = 0; i < 7; i++) {
        const st = { ...popIn(A6.seq(t, T.tile, 0.05, 0.3, i)), text: W0[i], ...ringFor(t, i) };
        if (i !== FI) H.set(i, st);
        else if (t < T.back[0]) {
          const k = ramp(t, ...T.flip, lin);
          H.bits.flip(i, k, { ...st, from: W0[i], to: W1[i], tone: "grey", toTone: "red", solid: k >= 0.5, hop: 10 });
        } else {
          const k = ramp(t, ...T.back, lin);
          H.bits.flip(i, k, { ...st, from: W1[i], to: W2[i], tone: "red", toTone: "green", solid: true, hop: 10 });
        }
      }

      // ---- noise ----
      const bk = ramp(t, ...T.bolt, lin);
      V.place(bolt, { s: lerp(0.5, 1.1, E.pop(bk)), o: Math.min(1, bk * 4) * (1 - ramp(t, ...T.boltOut, lin)) });

      // ---- position numbers and their binary names ----
      const nk = ramp(t, ...T.nums, lin);
      const j = reading(t);
      H.nums(nk, { hot: t >= T.flip[1] ? [ONE.flip] : [], tone: t < T.back[1] ? "red" : "green" });
      H.bin(nk, { hot: j >= 0 ? NAMES[j] : null, at: t >= T.at && t < T.back[1] ? ONE.at : null });

      // ---- the three check bands ----
      const word = t < T.reset[0] ? W0 : t < T.mend ? W1 : W2;
      NAMES.forEach((name, b) => {
        const fail = ONE.checks[b].fail;
        const st = {
          k: ramp(t, T.band + 0.06 * b, T.band + 0.06 * b + 0.35, lin),
          vals: word,
          bad: word === W1 ? [ONE.flip] : [],
          tone: "grey",
        };
        const t0 = band0(b);
        if (t < T.reset[0])
          Object.assign(st, { verdict: "ok", vk: ramp(t, T.tick + 0.08 * b, T.tick + 0.08 * b + 0.35, lin) });
        else if (t < T.reset[1]) Object.assign(st, { verdict: "ok", vk: 1 - ramp(t, ...T.reset, lin) });
        else if (t < t0 + 0.85) st.tone = t >= t0 ? "purple" : "grey";
        else if (t < T.mend || !fail)
          Object.assign(st, { verdict: fail ? "bad" : "ok", vk: ramp(t, t0 + 0.85, t0 + 1.25, lin) });
        else if (t < T.mend + 0.3) Object.assign(st, { verdict: "bad", vk: 1 - ramp(t, T.mend, T.mend + 0.3, lin) });
        else Object.assign(st, { verdict: "ok", vk: ramp(t, T.mend + 0.3, T.mend + 0.7, lin) });
        H.row(name, st);
      });

      // ---- the counter: how many 1s in the group being read, odd = failed ----
      const done = [0, 1, 2].filter((q) => t >= countAt(q));
      const c = done.length ? done[done.length - 1] : -1;
      const out = 1 - ramp(t, ...T.ctrOut, lin);
      const tone = c < 0 ? "blue" : ONE.checks[c].fail ? "red" : "green";
      ctr.set({
        text: c < 0 ? "0" : String(ONES[c]),
        tone,
        bump: Math.max(...NAMES.map((_, q) => flash(t, countAt(q), countAt(q) + 0.3))),
        k: ramp(t, countAt(0) - 0.15, countAt(0) + 0.15, lin),
        o: out,
      });
      verdict.set({
        text: c >= 0 && !ONE.checks[c].fail ? "even: passes" : "odd: failed",
        tone,
        k: c < 0 ? 0 : ramp(t, countAt(c) + 0.1, countAt(c) + 0.4, lin),
        o: out,
      });

      // ---- the readout: failed, failed, passed = 1 1 0 = 6, then the answer flies up to its tile ----
      const f = E.inOut(ramp(t, ...T.fly, lin));
      H.syn.set({
        vals: SYN,
        k: ramp(t, ...T.syn, lin),
        eqK: ramp(t, ...T.eq, lin),
        num: String(ONE.at),
        numK: ramp(t, ...T.num, lin),
        o: 1 - ramp(t, ...T.synOut, lin),
      });
      pointer.set({
        x: (land.x - home.x) * f,
        y: (land.y - home.y) * f,
        s: lerp(1, 0.62, f),
        o: (t < T.fly[0] ? 0 : 1) * (1 - ramp(t, ...T.synOut, lin)),
      });
    };
  }

  V.scene({
    kicker: "HAMMING CODE",
    title: ["The failed checks", "spell the position"],
    dur: 14,
    caps: [
      [0.7, 2.5, "A clean word passes all three checks."],
      [3.3, 4.9, "Noise flips position 6."],
      [5, 6.9, "Recount each group: odd means failed."],
      [8.8, 10.4, "p4 and p2 fail; p1 passes."],
      [10.6, 12.2, "Failures read as binary: 110 is 6."],
      [12.3, 13.9, "Flip position 6 back: fixed."],
    ],
    build,
  });
})();

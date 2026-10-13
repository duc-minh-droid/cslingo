/* Phase 6 · Error Detection & Correction: the data and algorithms every scene of this video shares (pure, no DOM, no randomness).
   Everything hangs off VID.a6; scenes start with  const A6 = VID.a6;  Drawing helpers are in common-2.js (tiles, tags, icons),
   common-3.js (the long-division widget) and common-4.js (the Hamming rig and the cube). Every number below comes from running
   the real algorithm when the page loads and is asserted against the storyboard (videos/_plan/algo-6.json): a wrong number
   throws an Error with a clear message.

   BITS.  Words are strings of "0"/"1". Indices are 0-BASED and left to right (tile i of a row = index i). Hamming POSITIONS are
   1-BASED (position 6 = index 5), as in the lessons; A6.pos(i) / A6.idx(p) convert.
     A6.bitsOf("1011") -> [1,0,1,1]     A6.str([1,0,1,1]) -> "1011"     A6.ones("1011") -> 3 (count of 1s)
     A6.parityOf("1011001") -> 0 (the even-parity bit: makes the number of 1s even)
     A6.flipAt("1011", 1, 3) -> "1110"   (flips the listed indices)       A6.diffAt(a, b) -> indices where two words differ
     A6.polyMod("1011000", "1101") -> "100"   remainder of the mod-2 long division (the CRC); the bits are not padded for you.
     A6.same(what, got, want) / A6.close(what, got, want, tol) throw when a number differs from the storyboard.

   1. THE NOISY WIRE (scene 2, and the starting point of scene 3).  The message is 1011001; one bit flips on the wire.
        A6.WIRE = {msg: "1011001", flip: 1 (index), recv: "1111001"}   (the 2nd bit, 0 -> 1)
   2. PARITY (scene 3).  Even parity: the sender adds a bit that makes the count of 1s even.
        A6.PARITY = {data: "1011001", p: "0", frame: "10110010", ones: 4,
                     one: {flips: [1], recv: "11110010", ones: 5, caught: true},     // five 1s: odd, the alarm
                     two: {flips: [1, 4], recv: "11111010", ones: 6, caught: false}} // six 1s: even, parity is fooled
        (frame = data + p: tiles 0-6 are data, tile 7 is the parity bit.)
   3. CRC (scenes 4 and 5).  Message 1011, generator 1101 (degree 3: three check bits).
        A6.divide(bits, gen) -> {rows, steps, rem}: the mod-2 long division on a string. rows[0] = bits; steps[i] = {col (index of
            the first bit under the generator), before, gen (the generator padded to full width), after} (full-width strings);
            rem = the last gen.length - 1 bits of the final row.
        A6.CRC = {msg: "1011", gen: "1101", r: 3, padded: "1011000", steps (2 of them, below), rem: "100", frame: "1011100",
                  div: A6.divide("1011000", "1101")}
            step 0: col 0  1011000 xor 1101000 = 0110000      step 1: col 1  0110000 xor 0110100 = 0000100 (remainder 100, bits 4-6)
        A6.CRC.cases (scene 5) = the frame 1011100 as received, with what the receiver's division leaves:
            {name: "clean", flips: [], recv: "1011100", rem: "000", ok: true}
            {name: "two",   flips: [1, 4], recv: "1111000", rem: "111", ok: false}   (the same two flips that fooled parity)
            {name: "burst", flips: [2, 3, 4], recv: "1000000", rem: "110", ok: false} (three bits in a row)
        A6.CRC.audit = {singles: [7, 7], doubles: [21, 21], bursts: [23, 23]}  [caught, tried] over all 7-bit patterns: nothing
            of weight 1, 2 or a burst of up to 3 leaves remainder 000. (A 16-bit CRC: every burst up to 16 bits, lesson 6.4.)
   4. ARQ (scene 6, top panel).  A parity frame with a flip: the check fails, the receiver asks again.
        A6.ARQ = {data: "1101001", frame: "11010010", hit: 3, bad: "11000010", ones: 3}   (the 4th bit 1 -> 0: three 1s, odd -> NAK)
   5. DISTANCE (scene 7).  The 3-bit cube; the two valid words 000 and 111 (repeat each bit three times).
        A6.dist(a, b) -> Hamming distance (positions that differ)     A6.nearest(w, words = A6.CODE.words) -> the closest word
        A6.CUBE_NODES = ["000", ..., "111"]   A6.CUBE_EDGES = 12 pairs ["000", "001"], ... (words one flip apart)
        A6.CODE = {words: ["000", "111"], d: 3, path: ["000", "010", "011", "111"] (three flips from one word to the other),
                   one: {recv: "010", d0: 1, d1: 2, fix: "000", right: true},
                   two: {recv: "011", d0: 2, d1: 1, fix: "111", right: false}}
        A6.RATE = {repeat: {data: 1, sent: 3, rate: 1/3}, hamming: {data: 4, sent: 7, rate: 4/7}}   (useful bits per bit sent)
   6. HAMMING (7,4) (scenes 8-10).  Positions 1..7: check bits p1 p2 p4 at 1, 2, 4; data at 3, 5, 6, 7.
        A6.HAM = {data: "1011", cw: "0110011" (position 1 = first bit),
                  checkPos: [1, 2, 4], dataPos: [3, 5, 6, 7],
                  groups: {p1: [1,3,5,7], p2: [2,3,6,7], p4: [4,5,6,7]}      // the positions each check watches
                  bin: ["001","010","011","100","101","110","111"]            // position written in binary; p1 = last digit, p2 = middle, p4 = first
                  encode: [{name, pos, vals, ones, bit}] x3 in the order p1, p2, p4: the data bits in the group and the check bit
                      that makes the count even:  p1 pos 3,5,7 vals 1,0,1 -> bit 0;  p2 pos 3,6,7 vals 1,1,1 -> bit 1;
                      p4 pos 5,6,7 vals 0,1,1 -> bit 0.
                  one: {flip: 6, recv: "0110001", checks: [p4, p2, p1 as {name, pos, vals, ones, fail}], syn: "110", at: 6, fixed: "0110011"}
                      p4 pos 4,5,6,7 vals 0,0,0,1 ones 1 FAIL;  p2 pos 2,3,6,7 vals 1,1,0,1 ones 3 FAIL;  p1 pos 1,3,5,7 vals 0,1,0,1 ones 2 ok
                  two: {flips: [2, 5], recv: "0010111", checks: all three FAIL (each group holds three 1s), syn: "111", at: 7,
                        fixed: "0010110", wrong: [2, 5, 7] (positions that now differ from cw), data: "1110" (not 1011)}
                  every: {one: [112, 112], two: [336, 0]}   // [tried, repaired] over all 16 codewords: every single flip is repaired,
                                                              // no double flip is (lesson 6.7 "Try every error")
                  }
        A6.hEnc("1011") -> "0110011"     A6.hCheck(word, "p4") -> {name, pos, vals, ones, fail}   (word = 7 bits, positions 1..7)
        A6.hChecks(word) -> the three checks in the order p4, p2, p1 (top to bottom on screen, so the failures read as binary)
        A6.hSyn(word) -> {syn: "110", at: 6}   (failed checks as p4 p2 p1 read as binary; at = 0 when nothing failed)
        A6.hFix(word) -> the word with position `at` flipped.   A6.hData(word) -> the 4 data bits (positions 3, 5, 6, 7)
        A6.pos(i) = i + 1     A6.idx(p) = p - 1

   SMALL TOOLS.  A6.rng(seed) -> () => 0..1 (mulberry32, seeded: the only randomness allowed). */
(function () {
  const V = window.VID;
  const A6 = (V.a6 = V.a6 || {});

  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.a6: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.001) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.a6: ${what} is ${got}, the storyboard says ${want}`);
  };
  const rng = (a) => () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // ---------- bits ----------
  const bitsOf = (s) => [...String(s)].map(Number);
  const str = (a) => a.join("");
  const ones = (s) => bitsOf(s).reduce((a, b) => a + b, 0);
  const parityOf = (s) => ones(s) % 2;
  const flipAt = (s, ...idx) => {
    const a = bitsOf(s);
    idx.forEach((i) => (a[i] ^= 1));
    return str(a);
  };
  const diffAt = (a, b) => [...a].flatMap((c, i) => (c !== b[i] ? [i] : []));
  const dist = (a, b) => diffAt(a, b).length;
  const polyMod = (bits, gen) => {
    const m = bitsOf(bits);
    const g = bitsOf(gen);
    for (let i = 0; i <= m.length - g.length; i++) if (m[i]) for (let j = 0; j < g.length; j++) m[i + j] ^= g[j];
    return str(m.slice(m.length - (g.length - 1)));
  };

  /* long division mod 2, written as the rows a person writes: each step lines the generator up under the first 1 that
     still has room for it, XORs, and keeps the whole row */
  function divide(bits, gen) {
    const g = bitsOf(gen);
    let row = bitsOf(bits);
    const rows = [str(row)];
    const steps = [];
    for (let col = 0; col <= row.length - g.length; col++) {
      if (!row[col]) continue;
      const pad = Array(row.length).fill(0);
      g.forEach((b, j) => (pad[col + j] = b));
      const before = str(row);
      row = row.map((b, i) => b ^ pad[i]);
      steps.push({ col, before, gen: str(pad), after: str(row) });
      rows.push(str(row));
    }
    return { rows, steps, rem: str(row.slice(row.length - (g.length - 1))) };
  }

  Object.assign(A6, { same, close, rng, bitsOf, str, ones, parityOf, flipAt, diffAt, dist, polyMod, divide });
  A6.pos = (i) => i + 1;
  A6.idx = (p) => p - 1;

  // ---------- 1. the noisy wire ----------
  A6.WIRE = { msg: "1011001", flip: 1, recv: flipAt("1011001", 1) };
  same("wire", A6.WIRE, { msg: "1011001", flip: 1, recv: "1111001" });

  // ---------- 2. parity ----------
  const P = { data: "1011001" };
  P.p = String(parityOf(P.data));
  P.frame = P.data + P.p;
  P.ones = ones(P.frame);
  const pCase = (flips) => {
    const recv = flipAt(P.frame, ...flips);
    return { flips, recv, ones: ones(recv), caught: ones(recv) % 2 === 1 };
  };
  P.one = pCase([1]);
  P.two = pCase([1, 4]);
  A6.PARITY = P;
  same("parity frame", [P.p, P.frame, P.ones], ["0", "10110010", 4]);
  same("parity one flip", P.one, { flips: [1], recv: "11110010", ones: 5, caught: true });
  same("parity two flips", P.two, { flips: [1, 4], recv: "11111010", ones: 6, caught: false });

  // ---------- 3. CRC ----------
  const C = { msg: "1011", gen: "1101", r: 3 };
  C.padded = C.msg + "0".repeat(C.r);
  C.div = divide(C.padded, C.gen);
  C.steps = C.div.steps;
  C.rem = C.div.rem;
  C.frame = C.msg + C.rem;
  const cCase = (name, flips) => {
    const recv = flipAt(C.frame, ...flips);
    const rem = polyMod(recv, C.gen);
    return { name, flips, recv, rem, ok: rem === "000" };
  };
  C.cases = [cCase("clean", []), cCase("two", [1, 4]), cCase("burst", [2, 3, 4])];
  C.recvDiv = (c) => divide(c.recv, C.gen); // the receiver's own long division of a case
  // exhaustive audit of all 7-bit error patterns: [caught, tried]
  (function audit() {
    const n = C.frame.length;
    const tried = { singles: 0, doubles: 0, bursts: 0 };
    const caught = { singles: 0, doubles: 0, bursts: 0 };
    const test = (key, flips) => {
      tried[key]++;
      if (polyMod(flipAt("0".repeat(n), ...flips), C.gen) !== "0".repeat(C.r)) caught[key]++;
    };
    for (let i = 0; i < n; i++) test("singles", [i]);
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) test("doubles", [i, j]);
    for (let len = 1; len <= C.r; len++)
      for (let s = 0; s + len <= n; s++)
        for (let m = 0; m < (len > 2 ? 2 : 1); m++) {
          const f = [s];
          if (len > 1) f.push(s + len - 1);
          if (len > 2 && m) f.push(s + 1);
          test("bursts", f);
        }
    C.audit = Object.fromEntries(Object.keys(tried).map((k) => [k, [caught[k], tried[k]]]));
  })();
  A6.CRC = C;
  same("crc padded / remainder / frame", [C.padded, C.rem, C.frame], ["1011000", "100", "1011100"]);
  same(
    "crc steps",
    C.steps.map((s) => [s.col, s.before, s.gen, s.after]),
    [
      [0, "1011000", "1101000", "0110000"],
      [1, "0110000", "0110100", "0000100"],
    ],
  );
  same(
    "crc cases",
    C.cases.map((c) => [c.name, c.recv, c.rem, c.ok]),
    [
      ["clean", "1011100", "000", true],
      ["two", "1111000", "111", false],
      ["burst", "1000000", "110", false],
    ],
  );
  same("crc audit", C.audit, { singles: [7, 7], doubles: [21, 21], bursts: [23, 23] });
  same("crc receiver rows", C.recvDiv(C.cases[0]).rows, ["1011100", "0110100", "0000000"]);
  // an independent check of the remainder: the register algorithm of lesson 6.3 (shift, XOR the last r bits of P on a 1)
  (function register() {
    const Pl = bitsOf(C.gen).slice(1);
    let reg = [0, 0, 0];
    bitsOf(C.padded).forEach((b) => {
      const out = reg[0];
      reg = reg.slice(1).concat([b]);
      if (out) reg = reg.map((x, j) => x ^ Pl[j]);
    });
    same("crc register algorithm", str(reg), C.rem);
  })();

  // ---------- 4. ARQ ----------
  A6.ARQ = { data: "1101001", frame: "11010010", hit: 3 };
  A6.ARQ.bad = flipAt(A6.ARQ.frame, A6.ARQ.hit);
  A6.ARQ.ones = ones(A6.ARQ.bad);
  same(
    "arq",
    [A6.ARQ.frame, A6.ARQ.data + parityOf(A6.ARQ.data), A6.ARQ.bad, A6.ARQ.ones],
    ["11010010", "11010010", "11000010", 3],
  );

  // ---------- 5. distance ----------
  const NODES = ["000", "001", "010", "011", "100", "101", "110", "111"];
  const EDGES = NODES.flatMap((a) => NODES.filter((b) => a < b && dist(a, b) === 1).map((b) => [a, b]));
  const nearest = (w, words) => [...words].sort((a, b) => dist(w, a) - dist(w, b) || (a < b ? -1 : 1))[0];
  const CODE = { words: ["000", "111"], d: 3, path: ["000", "010", "011", "111"] };
  const cd = (recv) => ({
    recv,
    d0: dist(recv, "000"),
    d1: dist(recv, "111"),
    fix: nearest(recv, CODE.words),
    right: nearest(recv, CODE.words) === "000",
  });
  CODE.one = cd("010");
  CODE.two = cd("011");
  Object.assign(A6, { CUBE_NODES: NODES, CUBE_EDGES: EDGES, CODE, nearest });
  A6.RATE = {
    repeat: { data: 1, sent: 3, rate: 1 / 3 },
    hamming: { data: 4, sent: 7, rate: 4 / 7 },
  };
  same("cube edges", EDGES.length, 12);
  same("code distance", dist("000", "111"), 3);
  same(
    "code path",
    CODE.path.map((w, i) => (i ? dist(CODE.path[i - 1], w) : 0)),
    [0, 1, 1, 1],
  );
  same("code one flip", CODE.one, { recv: "010", d0: 1, d1: 2, fix: "000", right: true });
  same("code two flips", CODE.two, { recv: "011", d0: 2, d1: 1, fix: "111", right: false });
  close("rate repeat", A6.RATE.repeat.rate, 0.3333, 0.0001);
  close("rate hamming", A6.RATE.hamming.rate, 0.5714, 0.0001);

  // ---------- 6. Hamming (7,4) ----------
  const GROUPS = { p1: [1, 3, 5, 7], p2: [2, 3, 6, 7], p4: [4, 5, 6, 7] };
  const hEnc = (d) => {
    const [d1, d2, d3, d4] = bitsOf(d);
    return str([d1 ^ d2 ^ d4, d1 ^ d3 ^ d4, d1, d2 ^ d3 ^ d4, d2, d3, d4]);
  };
  const hCheck = (word, name) => {
    const pos = GROUPS[name];
    const vals = pos.map((p) => +word[p - 1]);
    const n = vals.reduce((a, b) => a + b, 0);
    return { name, pos, vals, ones: n, fail: n % 2 === 1 };
  };
  const hChecks = (word) => ["p4", "p2", "p1"].map((n) => hCheck(word, n));
  const hSyn = (word) => {
    const syn = hChecks(word)
      .map((c) => +c.fail)
      .join("");
    return { syn, at: parseInt(syn, 2) };
  };
  const hFix = (word) => {
    const { at } = hSyn(word);
    return at ? flipAt(word, at - 1) : word;
  };
  const hData = (word) => [3, 5, 6, 7].map((p) => word[p - 1]).join("");
  Object.assign(A6, { hEnc, hCheck, hChecks, hSyn, hFix, hData });

  const H = { data: "1011", checkPos: [1, 2, 4], dataPos: [3, 5, 6, 7], groups: GROUPS };
  H.cw = hEnc(H.data);
  H.bin = [1, 2, 3, 4, 5, 6, 7].map((p) => p.toString(2).padStart(3, "0"));
  // building the codeword: the data bits of each group and the check bit that makes the count even (order p1, p2, p4)
  H.encode = ["p1", "p2", "p4"].map((name) => {
    const pos = GROUPS[name].filter((p) => H.dataPos.includes(p));
    const vals = pos.map((p) => +H.cw[p - 1]);
    const n = vals.reduce((a, b) => a + b, 0);
    return { name, pos, vals, ones: n, bit: n % 2 };
  });
  const hCase = (flips) => {
    const recv = flipAt(H.cw, ...flips.map((p) => p - 1));
    const checks = hChecks(recv);
    const { syn, at } = hSyn(recv);
    return { flips, recv, checks, syn, at, fixed: hFix(recv) };
  };
  H.one = { ...hCase([6]), flip: 6 };
  H.two = hCase([2, 5]);
  H.two.wrong = diffAt(H.two.fixed, H.cw).map((i) => i + 1);
  H.two.data = hData(H.two.fixed);
  // every single and double flip of every codeword: [tried, repaired]
  (function every() {
    const tally = { one: [0, 0], two: [0, 0] };
    for (let n = 0; n < 16; n++) {
      const cw = hEnc(n.toString(2).padStart(4, "0"));
      for (let i = 0; i < 7; i++) {
        tally.one[0]++;
        if (hFix(flipAt(cw, i)) === cw) tally.one[1]++;
        for (let j = i + 1; j < 7; j++) {
          tally.two[0]++;
          if (hFix(flipAt(cw, i, j)) === cw) tally.two[1]++;
        }
      }
    }
    H.every = tally;
  })();
  A6.HAM = H;
  same("ham codeword", [H.cw, H.bin], ["0110011", ["001", "010", "011", "100", "101", "110", "111"]]);
  same(
    "ham encode",
    H.encode.map((e) => [e.name, e.pos, e.vals, e.bit]),
    [
      ["p1", [3, 5, 7], [1, 0, 1], 0],
      ["p2", [3, 6, 7], [1, 1, 1], 1],
      ["p4", [5, 6, 7], [0, 1, 1], 0],
    ],
  );
  same(
    "ham one flip",
    [H.one.recv, H.one.checks.map((c) => [c.name, c.pos, c.vals, c.ones, c.fail]), H.one.syn, H.one.at, H.one.fixed],
    [
      "0110001",
      [
        ["p4", [4, 5, 6, 7], [0, 0, 0, 1], 1, true],
        ["p2", [2, 3, 6, 7], [1, 1, 0, 1], 3, true],
        ["p1", [1, 3, 5, 7], [0, 1, 0, 1], 2, false],
      ],
      "110",
      6,
      "0110011",
    ],
  );
  same(
    "ham two flips",
    [
      H.two.recv,
      H.two.checks.map((c) => [c.name, c.ones, c.fail]),
      H.two.syn,
      H.two.at,
      H.two.fixed,
      H.two.wrong,
      H.two.data,
    ],
    [
      "0010111",
      [
        ["p4", 3, true],
        ["p2", 3, true],
        ["p1", 3, true],
      ],
      "111",
      7,
      "0010110",
      [2, 5, 7],
      "1110",
    ],
  );
  same("ham every", H.every, { one: [112, 112], two: [336, 0] });
})();

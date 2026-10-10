/* Phase 8 · Cryptography & Blockchain (video algo-8): the data and algorithms every scene shares (pure, no DOM, no randomness).
   Everything hangs off VID.a8; scenes start with  const A8 = VID.a8;  Drawing helpers are in common-2.js (tags, people, icons,
   paint pots, wire) and common-3.js (digests, chain blocks, tries table, cell grids, bars). Every number below comes from
   running the real algorithm when the page loads and is asserted against the storyboard (videos/_plan/algo-8.json): a wrong
   number throws an Error with a clear message. The lessons' own toy numbers are used: nothing here is secure.

   SMALL TOOLS.  A8.toy(text) -> 8 hex digits, the lessons' toy 32-bit hash (FNV-1a plus a finaliser; NOT secure).
        A8.modpow(base, exp, mod) -> base^exp mod mod.   A8.gcd(a, b).   A8.caesar(text, shift).
        A8.same(what, got, want) throws when JSON differs.  A8.close(what, got, want, tol).  A8.must(cond, message).
        A8.commas(n) -> "1,234".

   1. CIPHER (scene 2, lesson 8.1): a shift cipher, key 5.
        A8.CIPHER = {plain: "SECRET", key: 5, cipher: "XJHWJY", pairs: [{from: "S", to: "X"}, ... six], back: "SECRET"}
        (S->X E->J C->H R->W E->J T->Y: every letter slides 5 along the alphabet).

   2. PAINT (scene 3, lesson 8.3 "the paint picture"). Three paints: P the public one, A Alice's secret, B Bob's secret.
        A8.PAINT = {
          paints: {P: "gold", A: "rose", B: "blue"},       the token colour of each paint (drawn by A8.pot / A8.drop)
          mixA: ["P","A"], mixB: ["P","B"],                what Alice and Bob SEND (public paint plus own secret)
          finalAlice: ["P","B","A"], finalBob: ["P","A","B"],   what each ends with (received mix plus own secret): the SAME
                                                                multiset, so the same colour
          eveSees: [["P"], ["P","A"], ["P","B"]]           everything on the wire: she cannot take a paint out of a mix }

   3. DIFFIE-HELLMAN with numbers (scene 4, lesson 8.3): p = 23, g = 5, secrets a = 6 and b = 15.
        A8.DH = {p: 23, g: 5, a: 6, b: 15,
                 A: 8 (= 5^6 mod 23), B: 19 (= 5^15 mod 23), shared: 2 (= 19^6 mod 23 = 8^15 mod 23),
                 powA: 15625 (5^6), quot: 679, rem: 8   i.e. 15625 = 679 x 23 + 8, the definition of "mod" for the video,
                 aliceCalc: {base: 19, exp: 6, result: 2}, bobCalc: {base: 8, exp: 15, result: 2},
                 table: [5, 2, 10, 4, 20, 8, 17, 16, 11, 9, 22, 18]   5^x mod 23 for x = 1..12,
                 search: [{x, y, hit}] x = 1..6 (y = 5, 2, 10, 4, 20, 8; hit on the last): Eve looking for a from A = 8,
                 tries: 6, digits2048: 617 (a 2048-bit prime has 617 decimal digits)}

   4. RSA in miniature (scenes 5 and 6, lesson 8.3 "RSA in miniature"): p = 5, q = 11.
        A8.RSA = {p: 5, q: 11, n: 55, z: 40 (= (p-1)(q-1) = 4 x 10), e: 3, d: 27,
                  eCands: [{e: 2, g: 2}, {e: 3, g: 1}]   gcd(e, z): 3 shares no factor with 40, 2 does,
                  dCheck: {prod: 81, k: 2, rem: 1}   3 x 27 = 81 = 2 x 40 + 1,
                  M: 7, powE: 343, quotE: 6, remE: 13   7^3 = 343 = 6 x 55 + 13,  C: 13 (= 7^3 mod 55),
                  back: 7 (= 13^27 mod 55),
                  attack: {tries: [2, 3, 4, 5], found: 5, other: 11, z: 40, d: 27}   Eve divides n = 55 by 2, 3, 4, 5 and
                                                                                    finds 5 x 11, then z, then d,
                  digits2048: 617}

   5. HASH (scene 7, lesson 8.5): the toy hash of "cat" and "cot".
        A8.HASH = {cat: "f01dce9c", cot: "cb26b6bb", diffHex: [0..7]   every hex digit differs, bits: 18   of 32 bits differ,
                   diffIdx(a, b) -> indices where two equal-length strings differ}

   6. HASH CHAIN (scene 8, lesson 8.5 chain runner): the first three blocks after the genesis block, hash = toy(i|data|prev).
        A8.CHAIN = {genesis: "ecaf011a" (the hash of block 0), edit: "ann pays EVE 50",
                    view(stage) -> [{i, data, prev, hash, linkOk, edited, fixed}] x 3 }
          stage 0 honest:        1 "ann pays ben 5"  prev ecaf011a  hash fb28ccb9
                                 2 "ben pays cat 2"  prev fb28ccb9  hash 51320862
                                 3 "cat pays dan 1"  prev 51320862  hash 57cc211e                       all links OK
          stage 1 block 1 edited: block 1 data "ann pays EVE 50", hash 9a1f8189; block 2 still holds prev fb28ccb9, so the link
                                 1->2 is BROKEN (linkOk false on block 2); blocks 2 and 3 are otherwise unchanged
          stage 2 block 2's prev repaired to 9a1f8189: block 2's hash becomes 25ebb100, so block 3 (prev 51320862) is now broken
          stage 3 block 3's prev repaired to 25ebb100: block 3's hash becomes 99c1e647: every link OK again (a forged chain).
        linkOk of block 1 is always true (its prev is the genesis hash). edited = the data was edited (block 1 from stage 1);
        fixed = the stored prev was repaired (block 2 from stage 2, block 3 from stage 3).

   7. MINING (scene 9, lesson 8.7 miner): block "block 7|cat pays dan 4", the target is a hash that starts with 0.
        A8.MINE = {data: "block 7", text: "cat pays dan 4", target: "0", win: 14, tries: 15, chance: 16,
                   rows: [{n: 0, hash: "cfc7cb5a", ok: false}, ... {n: 14, hash: "0d84059e", ok: true}]   15 rows
                   checkCost: 1   (the winner is re-hashed once to check it)}
        hashes: n 0..14 = cfc7cb5a 7d987054 66de0aae 72030365 d0998061 8499c79e 5e9431de d7cebafb 5510bdc2 33f2b038 d0cb0883
                dd0f6394 be6270a4 2c063bfb 0d84059e
        A8.ZEROS = [{zeros: 1, odds: 16, cells: 16}, {zeros: 2, odds: 256, cells: 256}]   each extra hex zero = 16 x more
        work: one hash in 16 passes "starts with 0", one in 256 passes "starts with 00".

   8. REWRITING (scene 10, lesson 8.5/8.7 and Workshop 8.W): the same three blocks, now each sealed by mining (hash starts
        with 0). Hash input is "block i|data|prev|nonce n". Block 1's prev is the genesis hash ecaf011a.
        A8.SEAL = {original: [{i, data, prev, nonce, hash, tries}] x 3, forged: the same after the edit, rows(i) , view(stage)}
          original (sealed, tries 28 + 25 + 17 = 70):  1 nonce 27 hash 017b7e46, 2 nonce 24 hash 0b2e58f5, 3 nonce 16 hash 006f9014
          forged (block 1 edited, everything after it re-mined, tries 15 + 5 + 30 = 50):
                 1 "ann pays EVE 50" nonce 14 hash 03fbf4ca, 2 nonce 4 hash 06ab4a15, 3 nonce 29 hash 0e76a113
          A8.SEAL.view(stage) -> [{i, data, prev, nonce, hash, sealOk, linkOk, edited}] x 3, five stages:
            0 sealed (all OK)  1 block 1 edited, nonce still 27: hash b411b36a (no leading 0: sealOk false); block 2's prev is
            stale (linkOk false), block 2 and 3's seals still hold  2 block 1 re-mined (nonce 14, hash 03fbf4ca, sealOk)
            3 block 2 re-mined with the new prev (nonce 4)  4 block 3 re-mined (nonce 29): everything OK again.
          A8.SEAL.hunt(stageBlock) -> {rows: [digests for nonce 0..win], tries} for the block being mined in stage 2, 3, 4
            (1, 2, 3): the digests the miner goes through (all but the last do not start with 0).
          A8.SEAL.total: 50 (forged tries), A8.SEAL.totalOriginal: 70. */
(function () {
  const V = window.VID;
  const A8 = (V.a8 = V.a8 || {});

  // ---------- small tools ----------
  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.a8: ${what} is ${JSON.stringify(got)}, the storyboard says ${JSON.stringify(want)}`);
  };
  const close = (what, got, want, tol = 0.05) => {
    if (!(Math.abs(got - want) <= tol)) throw new Error(`VID.a8: ${what} is ${got}, the storyboard says ${want}`);
  };
  const must = (cond, message) => {
    if (!cond) throw new Error(`VID.a8: ${message}`);
  };
  const commas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const toy = (s) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h = (h ^ (h >>> 13)) >>> 0;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };
  const modpow = (b, e, m) => {
    let r = 1;
    b %= m;
    while (e > 0) {
      if (e & 1) r = (r * b) % m;
      b = (b * b) % m;
      e = Math.floor(e / 2);
    }
    return r;
  };
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const caesar = (s, k) =>
    [...s]
      .map((c) => {
        const x = c.charCodeAt(0);
        return x >= 65 && x <= 90 ? String.fromCharCode(((((x - 65 + k) % 26) + 26) % 26) + 65) : c;
      })
      .join("");
  const diffIdx = (a, b) => [...a].flatMap((c, i) => (c !== b[i] ? [i] : []));
  const digits2048 = Math.floor(2048 * Math.log10(2)) + 1;
  Object.assign(A8, { same, close, must, commas, toy, modpow, gcd, caesar, diffIdx });

  // ---------- 1. cipher ----------
  const CIPHER = { plain: "SECRET", key: 5, cipher: caesar("SECRET", 5), back: caesar(caesar("SECRET", 5), -5) };
  CIPHER.pairs = [...CIPHER.plain].map((c, i) => ({ from: c, to: CIPHER.cipher[i] }));
  same("cipher text", CIPHER.cipher, "XJHWJY");
  same("deciphered", CIPHER.back, "SECRET");
  same("cipher pairs", CIPHER.pairs.map((p) => p.from + p.to).join(" "), "SX EJ CH RW EJ TY");

  // ---------- 2. paint ----------
  const PAINT = {
    paints: { P: "gold", A: "rose", B: "blue" },
    mixA: ["P", "A"],
    mixB: ["P", "B"],
    finalAlice: ["P", "B", "A"],
    finalBob: ["P", "A", "B"],
    eveSees: [["P"], ["P", "A"], ["P", "B"]],
  };
  same("final paint", PAINT.finalAlice.slice().sort(), PAINT.finalBob.slice().sort());

  // ---------- 3. Diffie-Hellman ----------
  const DH = (() => {
    const [p, g, a, b] = [23, 5, 6, 15];
    const [A, B] = [modpow(g, a, p), modpow(g, b, p)];
    const [sA, sB] = [modpow(B, a, p), modpow(A, b, p)];
    const powA = g ** a;
    const table = Array.from({ length: 12 }, (_, i) => modpow(g, i + 1, p));
    const search = [];
    for (let x = 1; x <= p; x++) {
      const y = modpow(g, x, p);
      search.push({ x, y, hit: y === A });
      if (y === A) break;
    }
    return {
      p,
      g,
      a,
      b,
      A,
      B,
      shared: sA,
      sA,
      sB,
      powA,
      quot: Math.floor(powA / p),
      rem: powA % p,
      aliceCalc: { base: B, exp: a, result: sA },
      bobCalc: { base: A, exp: b, result: sB },
      table,
      search,
      tries: search.length,
      digits2048,
    };
  })();
  same("DH public numbers", [DH.A, DH.B], [8, 19]);
  same("DH shared secret", [DH.sA, DH.sB], [2, 2]);
  same("DH 5^6 = 679 x 23 + 8", [DH.powA, DH.quot, DH.rem, DH.quot * 23 + DH.rem], [15625, 679, 8, 15625]);
  same("DH table", DH.table, [5, 2, 10, 4, 20, 8, 17, 16, 11, 9, 22, 18]);
  same(
    "DH search",
    DH.search.map((s) => s.y),
    [5, 2, 10, 4, 20, 8],
  );
  same("DH search hit", [DH.tries, DH.search[DH.tries - 1].hit], [6, true]);
  same("DH 8^15 mod 23", Number(8n ** 15n % 23n), 2);
  same("DH 19^6 mod 23", Number(19n ** 6n % 23n), 2);
  same("digits of a 2048-bit prime", digits2048, 617);

  // ---------- 4. RSA ----------
  const RSA = (() => {
    const [p, q, e, M] = [5, 11, 3, 7];
    const n = p * q;
    const z = (p - 1) * (q - 1);
    let d = 1;
    while ((e * d) % z !== 1) d++;
    const C = modpow(M, e, n);
    const tries = [];
    for (let f = 2; ; f++) {
      tries.push(f);
      if (n % f === 0) break;
    }
    const found = tries[tries.length - 1];
    return {
      p,
      q,
      n,
      z,
      e,
      d,
      eCands: [2, 3].map((c) => ({ e: c, g: gcd(c, z) })),
      dCheck: { prod: e * d, k: Math.floor((e * d) / z), rem: (e * d) % z },
      M,
      powE: M ** e,
      quotE: Math.floor(M ** e / n),
      remE: M ** e % n,
      C,
      back: modpow(C, d, n),
      attack: { tries, found, other: n / found, z: (found - 1) * (n / found - 1), d },
      digits2048,
    };
  })();
  same("RSA n, z, e, d", [RSA.n, RSA.z, RSA.e, RSA.d], [55, 40, 3, 27]);
  same("RSA e candidates", RSA.eCands, [
    { e: 2, g: 2 },
    { e: 3, g: 1 },
  ]);
  same("RSA 3 x 27 = 2 x 40 + 1", RSA.dCheck, { prod: 81, k: 2, rem: 1 });
  same("RSA lock 7^3 = 6 x 55 + 13", [RSA.powE, RSA.quotE, RSA.remE, RSA.C], [343, 6, 13, 13]);
  same("RSA unlock", RSA.back, 7);
  same("RSA 13^27 mod 55", Number(13n ** 27n % 55n), 7);
  same("RSA attack", RSA.attack, { tries: [2, 3, 4, 5], found: 5, other: 11, z: 40, d: 27 });

  // ---------- 5. hash ----------
  const HASH = { cat: toy("cat"), cot: toy("cot") };
  HASH.diffHex = diffIdx(HASH.cat, HASH.cot);
  HASH.bits = (parseInt(HASH.cat, 16) ^ parseInt(HASH.cot, 16)).toString(2).replace(/0/g, "").length;
  same("hash of cat and cot", [HASH.cat, HASH.cot], ["f01dce9c", "cb26b6bb"]);
  same("hash digits that differ", HASH.diffHex, [0, 1, 2, 3, 4, 5, 6, 7]);
  same("hash bits that differ", HASH.bits, 18);
  Object.assign(HASH, { diffIdx });

  // ---------- 6. hash chain ----------
  const CHAIN = (() => {
    const hashOf = (i, data, prev) => toy(`${i}|${data}|${prev}`);
    const genesis = hashOf(0, "genesis", "00000000");
    const data = ["ann pays ben 5", "ben pays cat 2", "cat pays dan 1"];
    const edit = "ann pays EVE 50";
    const view = (stage) => {
      const blocks = [];
      data.forEach((d, k) => {
        const i = k + 1;
        const edited = i === 1 && stage >= 1;
        const fixed = i > 1 && stage >= i; // block 2 repaired at stage 2, block 3 at stage 3
        const prevBlock = blocks[k - 1];
        // the prev stored in the block: the genesis hash, the OLD hash of the block before until it is repaired
        const prev = i === 1 ? genesis : fixed ? prevBlock.hash : oldHash(i - 1);
        blocks.push({
          i,
          data: edited ? edit : d,
          prev,
          hash: hashOf(i, edited ? edit : d, prev),
          linkOk: true,
          edited,
          fixed,
        });
        if (k > 0) blocks[k].linkOk = blocks[k].prev === blocks[k - 1].hash;
      });
      return blocks;
    };
    // the honest hash of block i (stage 0), used as the stale value a repaired-later block still holds
    const honest = [];
    let prev = genesis;
    data.forEach((d, k) => {
      const h = hashOf(k + 1, d, prev);
      honest.push(h);
      prev = h;
    });
    const oldHash = (i) => honest[i - 1];
    return { genesis, edit, view };
  })();
  same("genesis hash", CHAIN.genesis, "ecaf011a");
  same(
    "chain stage 0",
    CHAIN.view(0).map((b) => [b.prev, b.hash, b.linkOk]),
    [
      ["ecaf011a", "fb28ccb9", true],
      ["fb28ccb9", "51320862", true],
      ["51320862", "57cc211e", true],
    ],
  );
  same(
    "chain stage 1",
    CHAIN.view(1).map((b) => [b.data, b.prev, b.hash, b.linkOk]),
    [
      ["ann pays EVE 50", "ecaf011a", "9a1f8189", true],
      ["ben pays cat 2", "fb28ccb9", "51320862", false],
      ["cat pays dan 1", "51320862", "57cc211e", true],
    ],
  );
  same(
    "chain stage 2",
    CHAIN.view(2).map((b) => [b.prev, b.hash, b.linkOk]),
    [
      ["ecaf011a", "9a1f8189", true],
      ["9a1f8189", "25ebb100", true],
      ["51320862", "57cc211e", false],
    ],
  );
  same(
    "chain stage 3",
    CHAIN.view(3).map((b) => [b.prev, b.hash, b.linkOk]),
    [
      ["ecaf011a", "9a1f8189", true],
      ["9a1f8189", "25ebb100", true],
      ["25ebb100", "99c1e647", true],
    ],
  );

  // ---------- 7. mining ----------
  const MINE = (() => {
    const hashN = (n) => toy(`block 7|cat pays dan 4|nonce ${n}`);
    const rows = [];
    for (let n = 0; ; n++) {
      const hash = hashN(n);
      const ok = hash[0] === "0";
      rows.push({ n, hash, ok });
      if (ok) break;
    }
    return {
      data: "block 7",
      text: "cat pays dan 4",
      target: "0",
      win: rows.length - 1,
      tries: rows.length,
      chance: 16,
      rows,
      checkCost: 1,
    };
  })();
  same("mining wins at nonce 14 after 15 hashes", [MINE.win, MINE.tries, MINE.rows[14].hash], [14, 15, "0d84059e"]);
  same(
    "mining misses",
    MINE.rows.slice(0, 14).every((r) => !r.ok),
    true,
  );
  same(
    "mining first hashes",
    MINE.rows.slice(0, 4).map((r) => r.hash),
    ["cfc7cb5a", "7d987054", "66de0aae", "72030365"],
  );
  const ZEROS = [1, 2].map((z) => ({ zeros: z, odds: 16 ** z, cells: 16 ** z }));
  same(
    "zeros",
    ZEROS.map((z) => z.odds),
    [16, 256],
  );

  // ---------- 8. rewriting ----------
  const SEAL = (() => {
    const hashAt = (i, data, prev, n) => toy(`block ${i}|${data}|${prev}|nonce ${n}`);
    const mine = (i, data, prev) => {
      const rows = [];
      for (let n = 0; ; n++) {
        const hash = hashAt(i, data, prev, n);
        rows.push(hash);
        if (hash[0] === "0") return { i, data, prev, nonce: n, hash, tries: n + 1, rows };
      }
    };
    const chain = (datas) => {
      const out = [];
      let prev = CHAIN.genesis;
      datas.forEach((d, k) => {
        const m = mine(k + 1, d, prev);
        out.push(m);
        prev = m.hash;
      });
      return out;
    };
    const dOrig = ["ann pays ben 5", "ben pays cat 2", "cat pays dan 1"];
    const original = chain(dOrig);
    const forged = chain([CHAIN.edit, dOrig[1], dOrig[2]]);
    const strip = ({ rows, ...b }) => b;
    // view(stage): the three blocks as they stand at one of the five stages of the rewrite
    const view = (stage) =>
      [0, 1, 2]
        .map((k) => {
          const i = k + 1;
          const o = original[k];
          const f = forged[k];
          const done = stage >= i + 1; // block i has been re-mined (block 1 at stage 2, block 2 at stage 3, block 3 at stage 4)
          const edited = i === 1 && stage >= 1;
          // the stored prev: the old hash of the block before, until this block has been re-mined
          const prev = i === 1 ? CHAIN.genesis : (done ? forged : original)[k - 1].hash;
          const hash = done ? f.hash : edited ? hashAt(1, CHAIN.edit, CHAIN.genesis, o.nonce) : o.hash;
          return { i, data: edited ? CHAIN.edit : o.data, prev, nonce: done ? f.nonce : o.nonce, hash, edited };
        })
        .map((b, k, all) => ({ ...b, sealOk: b.hash[0] === "0", linkOk: k === 0 || b.prev === all[k - 1].hash }));
    const hunt = (i) => {
      const m = forged[i - 1];
      return { rows: m.rows, tries: m.tries };
    };
    return {
      original: original.map(strip),
      forged: forged.map(strip),
      view,
      hunt,
      total: forged.reduce((a, b) => a + b.tries, 0),
      totalOriginal: original.reduce((a, b) => a + b.tries, 0),
    };
  })();
  same(
    "sealed chain",
    SEAL.original.map((b) => [b.nonce, b.hash, b.tries]),
    [
      [27, "017b7e46", 28],
      [24, "0b2e58f5", 25],
      [16, "006f9014", 17],
    ],
  );
  same(
    "forged chain",
    SEAL.forged.map((b) => [b.data, b.nonce, b.hash, b.tries]),
    [
      ["ann pays EVE 50", 14, "03fbf4ca", 15],
      ["ben pays cat 2", 4, "06ab4a15", 5],
      ["cat pays dan 1", 29, "0e76a113", 30],
    ],
  );
  same("rewrite tries", [SEAL.total, SEAL.totalOriginal], [50, 70]);
  same(
    "seal stage 1",
    SEAL.view(1).map((b) => [b.nonce, b.hash, b.sealOk, b.linkOk]),
    [
      [27, "b411b36a", false, true],
      [24, "0b2e58f5", true, false],
      [16, "006f9014", true, true],
    ],
  );
  same(
    "seal stage 2",
    SEAL.view(2).map((b) => [b.nonce, b.hash, b.sealOk, b.linkOk]),
    [
      [14, "03fbf4ca", true, true],
      [24, "0b2e58f5", true, false],
      [16, "006f9014", true, true],
    ],
  );
  same(
    "seal stage 4",
    SEAL.view(4).map((b) => [b.prev, b.nonce, b.hash, b.sealOk, b.linkOk]),
    [
      ["ecaf011a", 14, "03fbf4ca", true, true],
      ["03fbf4ca", 4, "06ab4a15", true, true],
      ["06ab4a15", 29, "0e76a113", true, true],
    ],
  );

  Object.assign(A8, { CIPHER, PAINT, DH, RSA, HASH, CHAIN, MINE, ZEROS, SEAL });
})();

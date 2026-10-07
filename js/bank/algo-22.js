(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { LN, M, PK, RC, SVG, TX, lzwStrings } = partScope;
  const B = NIC.bank;
  const lzwFig = (() => {
    let s = TX(8, 18, "Dictionary starts with A to H = codes 0 to 7", { a: "start", s: 12 });
    lzwStrings.forEach((t, i) => {
      const y = 28 + i * 40;
      s += PK(
        "s" + i,
        RC(2, y - 2, 296, 36, { r: 9 }) +
          TX(18, y + 22, "S" + (i + 1), { s: 13, a: "start" }) +
          t
            .split("")
            .map((c, k) => TX(76 + k * 26, y + 23, c, { m: 1, s: 17 }))
            .join(""),
      );
    });
    return SVG(300, 192, s, "Four 8-letter strings S1 to S4 for LZW");
  })();
  const lzwDictFig = SVG(
    380,
    66,
    TX(8, 18, "After encoding, the table's new entries were:", { a: "start", s: 13 }) +
      [
        ["2", "AB"],
        ["3", "BA"],
        ["4", "AA"],
        ["5", "ABA"],
      ]
        .map(
          ([c, t], i) => RC(8 + i * 90, 28, 82, 32, { r: 8 }) + TX(8 + i * 90 + 41, 49, c + " = " + t, { m: 1, s: 14 }),
        )
        .join(""),
    "LZW table entries 2 = AB, 3 = BA, 4 = AA, 5 = ABA",
  );

  B.add("a7-lzw", [
    {
      type: "pick",
      q: "LZW starts with a dictionary of single letters A to H. Tap every string for which it sends FEWER codes than the 8 letters.",
      fig: lzwFig,
      a: ["s1", "s2"],
      hint: "LZW only saves when a phrase of two or more letters appears again.",
      why: "S3 (ABABABAB) repeats AB and ABA, giving 5 codes. S2 (ABCDEFAB) has AB at the end, which is already in the table, so 7 codes. S1 repeats the single letter A, but A alone is already a code, and every pair (AB, BA, AC…) is new, so it needs 8 codes. S4 has no repeats at all (8 codes).",
    },
    {
      type: "mcq",
      q: "These are the new dictionary entries an LZW encoder created, in order. Which 7-letter input produced them? (A = 0, B = 1.)",
      o: ["ABAABAB", "ABABAAB", "ABBABAB", "ABABABA"],
      a: 0,
      fig: lzwDictFig,
      hint: "The first entry AB means the input starts ABA…; the third entry AA means two As in a row appear soon.",
      why: "ABAABAB: A, B, A, AB, AB gives entries AB, BA, AA, ABA in that order. ABABAAB builds AB, BA, ABA, AA, with the last two in swapped order. ABBABAB would add BB, and ABABABA builds only AB, BA and ABA.",
    },
    {
      type: "slider",
      q: "An LZW encoder sends fixed 12-bit codes for 8-bit characters. Suppose the text has no repeated phrases at all, so every code stands for a single character. The output is what percentage of the input size?",
      min: 50,
      max: 200,
      step: 10,
      ans: 150,
      tol: 15,
      unit: "%",
      hint: "12 bits for every 8 bits of input.",
      why: "12 / 8 = 1.5, so the output is about 150% of the input. LZW can expand data that has nothing repeated, which is why compressing an already-compressed file is a bad idea.",
    },
    {
      type: "bug",
      q: "This LZW decoder should rebuild the table the way the encoder did. Its output is right for a few codes, then goes wrong. Click the faulty line.",
      code: [
        "def decode(codes, table):",
        "    prev = table[codes[0]]",
        "    out = prev",
        "    for c in codes[1:]:",
        "        if c in table: cur = table[c]",
        "        else: cur = prev + prev[0]",
        "        out += cur",
        "        table[len(table)] = prev + cur",
        "        prev = cur",
        "    return out",
      ],
      a: 7,
      why: "The new entry is the previous output plus only the FIRST character of the current one: prev + cur[0]. Adding the whole of cur makes the entry far too long, and every later code that points at it expands to the wrong text.",
    },
  ]);

  /* ==================== a8-hash ==================== */
  const pwFig = (() => {
    const rows = [
      ["alice", "a941a4c4"],
      ["bob", "e5133159"],
      ["carol", "a941a4c4"],
      ["dan", "1c8bfe8f"],
    ];
    let s =
      TX(8, 18, "User", { a: "start", s: 12 }) +
      TX(140, 18, "Stored SHA-256 (first 8 hex digits)", { a: "start", s: 12 });
    rows.forEach(([u, h], i) => {
      const y = 28 + i * 38;
      s += PK(
        u,
        RC(2, y, 356, 32, { r: 8 }) +
          TX(16, y + 21, u, { a: "start", s: 14 }) +
          TX(140, y + 21, h, { a: "start", m: 1, s: 15 }),
      );
    });
    return SVG(360, 188, s, "A password table where alice and carol have the same stored digest");
  })();
  const chain5Fig = (() => {
    let s = "";
    for (let i = 1; i <= 5; i++) {
      const x = 6 + (i - 1) * 84,
        ed = i === 2;
      s +=
        RC(x, 24, 74, 62, {
          r: 8,
          k: ed ? "var(--amber)" : "var(--line-2)",
          f: ed ? "var(--amber)" : "var(--panel)",
          fo: ed ? 0.2 : 1,
        }) +
        TX(x + 37, 44, "Block " + i, { s: 13 }) +
        TX(x + 37, 64, i === 1 ? "prev: none" : "prev: #" + (i - 1), { s: 11 }) +
        TX(x + 37, 79, "own: #" + i, { s: 11 });
      if (i < 5) s += TX(x + 79, 60, "→", { s: 14 });
    }
    s += TX(6 + 84 + 37, 108, "edited", { s: 12, f: "var(--amber)" });
    return SVG(430, 118, s, "A chain of five blocks, each storing the hash of the one before it; block 2 is edited");
  })();

  B.add("a8-hash", [
    {
      type: "pick",
      q: "A leaked password table stores an unsalted SHA-256 of each password. Without cracking anything, tap the two users who must have chosen the SAME password.",
      fig: pwFig,
      a: ["alice", "carol"],
      why: "The hash is deterministic, so equal passwords give equal digests. Alice and Carol share one, and one cracked guess exposes both. A random salt mixed into each hash makes identical passwords produce different digests, which hides this and stops a single pre-built table of hashes being reused.",
    },
    {
      type: "match",
      q: "Match each situation to the hash property it relies on most.",
      pairs: [
        [
          "A site publishes the digest of its installer, and nobody should be able to forge a different file with it",
          "Collision resistance",
        ],
        ["A stolen password table should not reveal the passwords", "Preimage resistance (one-way)"],
        ["A miner can't predict which nonce will win", "Avalanche effect"],
        ["Two computers hash one file and compare answers", "Determinism"],
      ],
      why: "Forging a file with the same digest would need a collision. Recovering a password from its digest would need a preimage. Proof of work only works if nonces give unpredictable digests (avalanche). Comparing digests across machines needs the same input to always give the same output.",
    },
    {
      type: "mcq",
      q: "In this chain every block stores the hash of the one before it. The amber block 2 is edited, and the attacker wants the chain to validate again. How many blocks must be re-mined, including block 2?",
      o: ["1", "2", "4", "5"],
      a: 2,
      fig: chain5Fig,
      why: "Changing block 2 changes its hash, so block 3's stored link is wrong, so block 3 must be re-mined, and so on to the end: blocks 2, 3, 4 and 5. Block 1 is untouched. That cost is why deeper blocks are safer, and why a miner would need to out-run the honest network.",
    },
    {
      type: "bug",
      q: "A programmer wants to stop identical passwords having identical stored hashes. It doesn't work. Click the faulty line.",
      code: [
        "def store(pw):",
        "    salt = os.urandom(8)",
        "    h = sha256(pw.encode()).digest()",
        "    return salt, h",
      ],
      a: 2,
      why: "The salt is generated and stored but never fed into the hash. The line should hash salt + pw.encode(). Then two users with the same password get different digests because their salts differ.",
    },
    M(
      "A hash has a 16-bit digest (65,536 possible values). Roughly how many random inputs do you need to hash before two of them probably share a digest?",
      ["16", "256", "65,536", "4,294,967,296"],
      1,
      "This is the birthday effect: collisions appear after about the square root of the number of digests, √65,536 = 256. That is why collision resistance needs digests twice as long as the work you want to guard against, and why SHA-256 has 256 bits.",
      { hint: "Pairs grow like the square of the number of inputs, so you need far fewer than 65,536." },
    ),
  ]);

  /* ==================== a8-keys ==================== */
  const rsaFig = (() => {
    const rows = [
      ["A", 5, 11, 3],
      ["B", 5, 11, 5],
      ["C", 7, 13, 5],
      ["D", 3, 11, 7],
      ["E", 7, 13, 9],
    ];
    let s = ["Set", "p", "q", "e"].map((t, i) => TX(40 + i * 80, 18, t, { s: 12 })).join("");
    rows.forEach(([n, p, q, e], i) => {
      const y = 26 + i * 36;
      s += PK(
        n,
        RC(2, y, 356, 31, { r: 8 }) + [n, p, q, e].map((t, k) => TX(40 + k * 80, y + 21, t, { s: 15 })).join(""),
      );
    });
    return SVG(360, 212, s, "Five toy RSA parameter sets A to E, each with primes p and q and a public exponent e");
  })();

  B.add("a8-keys", [
    {
      type: "pick",
      q: "Each row is a toy RSA setup with primes p and q and a chosen public exponent e. Tap the TWO rows where e is not allowed, because no private key d can exist.",
      fig: rsaFig,
      a: ["B", "E"],
      hint: "Work out φ = (p − 1)(q − 1) for each row. e must share no factor with φ.",
      why: "Row B has φ = 4 × 10 = 40 and e = 5 shares the factor 5. Row E has φ = 6 × 12 = 72 and e = 9 shares the factor 3 (and 9). In both, no d satisfies e × d = 1 mod φ. Rows A, C and D have e coprime to φ (40, 72 and 20).",
    },
    {
      type: "cat",
      q: "Eve learns each thing below. How much of Alice's private traffic can she now read? (Each chat uses a fresh Diffie–Hellman secret, and Alice's long-term RSA key pair is reused.)",
      buckets: ["Nothing useful", "One chat only", "Everything sent to Alice"],
      items: [
        ["The public numbers p and g", 0],
        ["Alice's RSA public key", 0],
        ["Last night's session key", 1],
        ["Bob's one-off DH secret from last night's chat", 1],
        ["Alice's RSA private key d", 2],
      ],
      why: "Public values give nothing away by design. A session key or a one-off secret unlocks just the chat it belongs to. The long-term RSA private key unlocks everything encrypted to Alice with it, including old recorded traffic, and lets Eve sign as her. Throwaway keys limit the damage of a leak.",
    },
    {
      type: "bug",
      q: "A toy Diffie–Hellman program works for tiny numbers but never finishes when a has 600 digits. Click the faulty line.",
      code: ["def dh_public(g, a, p):", "    r = g ** a", "    return r % p"],
      a: 1,
      why: 'g ** a builds an astronomically huge integer before reducing it. Use pow(g, a, p), which reduces mod p after every squaring. That is the "easy" direction in Diffie–Hellman: gᵃ mod p is quick, while reversing it is the hard discrete-logarithm problem.',
    },
    {
      type: "order",
      q: "Put the steps of a secure chat in order. (It uses public keys to set up, then fast symmetric encryption for the chat itself.)",
      items: [
        "Alice's browser checks Bob's certificate",
        "They run a key exchange (such as Diffie–Hellman)",
        "Both sides derive the same session key",
        "Messages are encrypted with that symmetric key",
      ],
      why: "First prove who Bob is, or Mallory could sit in the middle. Then agree a secret over the open wire. Both sides compute the same session key, and the bulk data is encrypted with it, because symmetric ciphers are thousands of times faster than RSA.",
    },
    M(
      "Alice sends Bob a signed contract. Mallory flips one bit of the contract in transit. Bob checks the signature with Alice's public key. What happens?",
      [
        "The check fails, as the hash no longer matches",
        "The check passes, as the signature itself is intact",
        "Bob can no longer open the contract at all",
        "The check fails only if the signature changes too",
      ],
      0,
      "A signature is made from a hash of the exact contract. Change one bit and the hash changes completely (avalanche), so verification fails. The signature protects the contract's integrity, not just the sender's identity.",
    ),
  ]);

  /* ==================== a9-dft ==================== */
  const aliasFig = (() => {
    const f = [
      ["A", 2, "cos"],
      ["B", 1, "sin"],
      ["C", 1, "cos"],
    ];
    let s = "";
    f.forEach(([n, hz, fn], i) => {
      const y0 = 8 + i * 98,
        cy = y0 + 44,
        X = (t) => 50 + t * 320,
        Y = (v) => cy - v * 30;
      let d = "";
      for (let k = 0; k <= 200; k++) {
        const t = k / 200,
          v = fn === "cos" ? Math.cos(2 * Math.PI * hz * t) : Math.sin(2 * Math.PI * hz * t);
        d += (k ? "L" : "M") + X(t).toFixed(1) + " " + Y(v).toFixed(1);
      }
      let dots = "";
      for (let k = 0; k <= 10; k++)
        dots += `<circle cx="${X(k / 10).toFixed(1)}" cy="${Y(Math.cos((2 * Math.PI * k) / 10)).toFixed(1)}" r="4.5" fill="var(--blue)"/>`;
      s += PK(
        "curve" + n,
        RC(2, y0, 396, 90, { r: 10 }) +
          LN(50, cy, 370, cy, { w: 1 }) +
          `<path d="${d}" fill="none" stroke="var(--amber)" stroke-width="2.5"/>` +
          dots +
          TX(26, cy + 5, n, { s: 15 }),
      );
    });
    return SVG(
      400,
      300,
      s,
      "Three panels, each showing the same eleven sample dots over one second and a different candidate wave: A, B and C",
    );
  })();
  const specFig = (() => {
    const X = (k) => 20 + k * 3.6;
    let s = LN(20, 100, 380, 100, { w: 2 });
    [40, 60].forEach((k) => (s += RC(X(k) - 3, 28, 6, 72, { r: 2, f: "var(--blue)", k: "var(--blue)", w: 1 })));
    [0, 20, 40, 60, 80, 100].forEach((k) => (s += LN(X(k), 100, X(k), 105, { w: 1 }) + TX(X(k), 120, k, { s: 11 })));
    s += TX(200, 140, "bin k   (N = 100 samples, sampled at 1,000 Hz)", { s: 12 });
    return SVG(400, 150, s, "Magnitude spectrum of a real signal with peaks at bins 40 and 60 out of 100");
  })();

  B.add("a9-dft", [
    {
      type: "pick",
      q: "A 9 Hz cosine is sampled 10 times a second, giving the 11 blue dots in every panel. A slower wave fits the same dots exactly. Tap the panel whose wave passes through ALL the dots.",
      fig: aliasFig,
      a: "curveC",
      why: "Panel C, a 1 Hz cosine, passes through every dot. The 9 Hz cosine fits the same dots, because 10 samples a second can't tell 9 Hz from 1 Hz. That is aliasing. Panel A (2 Hz) misses most dots, and panel B is the wrong phase, since a sine starts at 0 while the dots start at the peak.",
    },
    {
      type: "mcq",
      q: "The spectrum of a real signal sampled at 1,000 Hz with N = 100 samples shows peaks at bins 40 and 60. What frequency is the tone?",
      o: ["40 Hz", "400 Hz", "600 Hz", "1,000 Hz"],
      a: 1,
      fig: specFig,
      hint: "Bin spacing is fs / N.",
      why: "Bins are 1,000 / 100 = 10 Hz apart, so bin 40 is 400 Hz. Bin 60 is its mirror image (N − 40 = 60, or −400 Hz), always present for a real signal, so it does not mean a second tone at 600 Hz.",
    },
    {
      type: "order",
      q: "A recorder samples at 100 Hz and takes 100 samples, so bins are 1 Hz apart. Four tones are played: 20 Hz, 45 Hz, 60 Hz and 110 Hz. Order the tones by the bin (up to bin 50) where each shows up, lowest bin first.",
      items: ["110 Hz", "20 Hz", "60 Hz", "45 Hz"],
      hint: "Anything above 50 Hz folds back down.",
      why: "20 Hz and 45 Hz are below Nyquist (50 Hz), so they show in bins 20 and 45. 60 Hz folds to 100 − 60 = 40, and 110 Hz folds to 110 − 100 = 10. So the order is 110 Hz (bin 10), 20 Hz (20), 60 Hz (40), 45 Hz (45).",
    },
    {
      type: "cat",
      q: "A whole-number-of-cycles tone is analysed with the DFT. For each change to the signal, what happens to its magnitude spectrum?",
      buckets: ["Magnitudes unchanged", "A peak moves", "A peak grows or appears"],
      items: [
        ["Delay the tone by a quarter of a cycle", 0],
        ["Play the signal backwards", 0],
        ["Play the tone twice as fast", 1],
        ["Add the same constant to every sample", 2],
        ["Double every sample value", 2],
      ],
      why: "Delaying or reversing a pure tone changes only the phase, not how much of each frequency there is. Doubling the speed moves the peak to twice the bin. A constant is a zero-frequency component, so a new peak appears at bin 0. Doubling all the values doubles the peak heights.",
    },
    {
      type: "slider",
      q: "A cosine with amplitude 1 fits exactly 5 whole cycles in a window of N = 64 samples. How tall is its peak in the DFT magnitude (the bin at k = 5)?",
      min: 0,
      max: 70,
      step: 2,
      ans: 32,
      tol: 4,
      hint: "The sum adds up about N copies of 1, but the energy is split between bin k and its mirror.",
      why: "The matching bin multiplies the signal by a wave of the same shape, so every sample adds about 1 × 0.5 on average and the total is N / 2 = 32. The other half sits in the mirror bin N − 5 = 59. So a DFT peak scales with the number of samples, not the amplitude alone.",
    },
  ]);

  /* ==================== a9-fft ==================== */
  const slotsFig = (() => {
    let s = TX(8, 16, "Input slots of an 8-point FFT", { a: "start", s: 12 });
    for (let i = 0; i < 8; i++)
      s += PK("s" + i, RC(8 + i * 48, 26, 42, 44, { r: 8 }) + TX(29 + i * 48, 53, "slot " + i, { s: 11 }));
    return SVG(400, 84, s, "Eight input slots numbered 0 to 7");
  })();
  const circleFig = (() => {
    const cx = 130,
      cy = 120,
      r = 88;
    let s =
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line-2)" stroke-width="2"/>` +
      LN(cx - r - 10, cy, cx + r + 10, cy, { w: 1 }) +
      LN(cx, cy - r - 10, cx, cy + r + 10, { w: 1 });
    for (let k = 0; k < 8; k++) {
      const a = (2 * Math.PI * k) / 8,
        x = cx + r * Math.cos(a),
        y = cy + r * Math.sin(a);
      s += PK(
        "p" + k,
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="var(--panel)" stroke="${k < 2 ? "var(--violet)" : "var(--line-2)"}" stroke-width="3"/>`,
      );
    }
    s += TX(cx + r + 18, cy - 14, "W⁰ = 1", { a: "start", s: 13, f: "var(--violet)" });
    s += TX(cx + 66 + 10, cy + 66 + 28, "W¹", { a: "start", s: 13, f: "var(--violet)" });
    return SVG(
      300,
      240,
      s,
      "Eight points around a circle: W to the power 0 is the point on the right, W to the power 1 is one eighth of a turn clockwise from it",
    );
  })();
  Object.assign(partScope, { circleFig, slotsFig });
})();

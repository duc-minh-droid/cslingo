(function () {
  const partScope = (NIC.shared.bossAlgo = NIC.shared.bossAlgo || {});
  const { H5, bits, boss, spectrum } = partScope;
  const N = NIC,
    Qf = N.qfig;
  boss(5, {
    blurb: "Seven questions: a new point set, turn tests by hand, algorithm choice.",
    lede: "New points on a grid (y points up). Use the cross product rather than eyeballing.",
    qs: [
      {
        type: "pick",
        q: "<b>Click every point on the convex hull.</b>",
        fig: Qf.points(H5, { max: 8 }),
        a: ["P", "Q", "R", "S", "T", "U"],
        why: "The hull is U → P → Q → R → S → T. V, W and X sit inside that polygon.",
      },
      {
        type: "cat",
        q: "Walking p → a → b, which way does each path turn?",
        buckets: ["Left", "Right", "Straight"],
        items: [
          ["(1,1) → (4,2) → (3,5)", 0],
          ["(0,0) → (2,1) → (4,2)", 2],
          ["(0,0) → (3,1) → (5,0)", 1],
        ],
        why: "Cross products: (3,1)×(2,4) = 3·4 − 1·2 = <b>10</b> (left); (2,1)×(4,2) = 4 − 4 = <b>0</b> (collinear); (3,1)×(5,0) = 0 − 5 = <b>−5</b> (right).",
      },
      {
        type: "mcq",
        q: "Compute the cross product (a − p) × (b − p) for p = (2,2), a = (5,3), b = (4,6).",
        o: ["−10, a right turn", "0, collinear", "10, a left turn", "14, a left turn"],
        a: 2,
        why: "a − p = (3,1), b − p = (2,4): 3·4 − 1·2 = <b>10</b>, so it's a left turn.",
      },
      {
        type: "mcq",
        q: "1,000,000 points, and you know only about 8 of them are on the hull. Which algorithm is the better bet?",
        o: [
          "Graham scan, because O(n log n) always wins",
          "Gift wrapping: n·h ≈ 8 million vs ~20 million to sort",
          "Both take the same time on this input",
          "Neither can handle a million points",
        ],
        a: 1,
        why: "With h = 8, n·h = 8 × 10⁶, while n log₂ n ≈ 2 × 10⁷. Gift wrapping is <b>output-sensitive</b>: a small hull makes it faster.",
      },
      {
        type: "mcq",
        q: "What input makes gift wrapping slowest?",
        o: ["All points in a tight cluster", "All points on a circle", "Points on a straight line", "Two points"],
        a: 1,
        why: "Cost is n per hull point. If every point is on the hull, that's n × n.",
      },
      {
        type: "mcq",
        q: "Graham scan's stack holds (bottom → top) U, P, Q, and the next point in angle order is W. Q → W turns right. What happens?",
        o: [
          "Push W on top of Q and continue with the next point",
          "Pop Q, then re-test P → W",
          "Pop U, the bottom of the stack, and push W",
          "Stop: the hull is finished",
        ],
        a: 1,
        why: "A right turn means Q would dent the hull inward, so Q is popped. Then check the turn again with the new top pair before pushing W.",
      },
      {
        type: "multi",
        q: "Which are true of both gift wrapping and Graham scan? Select all that apply.",
        o: [
          "They decide hull membership with orientation (turn) tests",
          "They must sort all the points first",
          "They need care with collinear points",
          "Their running time depends on the hull size",
        ],
        a: [0, 2],
        why: "Both are built on the turn test and both need a rule for collinear points. Only Graham sorts; only gift wrapping's cost depends on hull size.",
      },
    ],
  });

  /* ================= Phase 6 ================= */
  boss(6, {
    blurb: "Seven questions: a new CRC, a new Hamming codeword to fix, and detection vs correction.",
    lede: "New messages and a different generator. Work the bits on paper.",
    qs: [
      {
        type: "mcq",
        q: "CRC with generator <b>1011</b>. Message 1101. Append three zeros and divide (XOR long division). What's the 3-bit remainder?",
        o: ["001", "110", "011", "100"],
        a: 0,
        hint: "1101000: XOR 1011 under the first 1, then keep shifting.",
        why: "1101000 → 1101 ⊕ 1011 = 0110 → 1100 ⊕ 1011 = 0111 → 1110 ⊕ 1011 = 0101 → 1010 ⊕ 1011 = 0001: remainder <b>001</b>. The frame sent is 1101001, which divides exactly.",
      },
      {
        type: "pick",
        q: "Hamming(7,4) received word below (positions 1–7, parity at 1, 2, 4). One bit flipped. <b>Click the flipped bit.</b>",
        fig: bits("1110110", { pick: true }),
        a: "3",
        hint: "Recompute p1 over 1,3,5,7; p2 over 2,3,6,7; p4 over 4,5,6,7.",
        why: "Checks: p1 (1,3,5,7) = 1⊕1⊕1⊕0 = 1 ✗, p2 (2,3,6,7) = 1⊕1⊕1⊕0 = 1 ✗, p4 (4,5,6,7) = 0⊕1⊕1⊕0 = 0 ✓. Syndrome p4 p2 p1 = 011 = <b>3</b>. The original codeword was 1100110.",
      },
      {
        type: "multi",
        q: "A single parity bit protects a byte. Which error patterns does it detect? Select all that apply.",
        o: ["1 bit flipped", "2 bits flipped", "3 bits flipped", "4 bits flipped", "7 bits flipped"],
        a: [0, 2, 4],
        why: "Parity detects any <b>odd</b> number of flips: 1, 3 and 7. Even counts cancel out.",
      },
      {
        type: "mcq",
        q: "Hamming(7,4) sends 4 data bits in 7. What's its code rate (the fraction of transmitted bits that are data)?",
        o: ["3/7", "1/2", "4/7", "7/4"],
        a: 2,
        why: "4 / 7 ≈ <b>0.571</b>. Hamming(15,11) is 11/15 ≈ 0.733: longer codes waste less, but still correct only one error per block.",
      },
      {
        type: "cat",
        q: "Detection plus retransmission, or forward error correction?",
        buckets: ["Detect + resend", "Correct on arrival"],
        items: [
          ["Downloading a file over a reliable home connection", 0],
          ["Commands to a Mars rover, 20 minutes away", 1],
          ["A web page request that can simply be retried", 0],
          ["Memory chips in a server where a crash is costly", 1],
        ],
        why: "If re-sending is cheap and fast, detection (CRC) is enough. If the round trip is long or retries are impossible, fix errors on arrival (Hamming-style ECC).",
      },
      {
        type: "mcq",
        q: "Two bits flip in a Hamming(7,4) codeword and the receiver applies the syndrome fix. What happens?",
        o: ["Both are fixed", "It flips a third, innocent bit", "It reports a double error", "Nothing changes"],
        a: 1,
        why: "The two errors combine into a syndrome pointing at some other position, and the 'correction' damages it. Adding an overall parity bit (SECDED) detects this case instead.",
      },
      {
        type: "mcq",
        q: "An attacker changes a packet and recomputes its CRC so it checks out. Why doesn't the CRC stop them?",
        o: [
          "A CRC is too short to be secure",
          "The CRC is a public calculation with no key",
          "The attacker got lucky with the remainder",
          "It does stop them: the remainder would change",
        ],
        a: 1,
        why: "No secret is involved, so the attacker can compute a valid CRC just like the sender. Tamper-resistance needs a keyed MAC or a digital signature.",
      },
    ],
  });

  /* ================= Phase 7 ================= */
  boss(7, {
    blurb: "Eight questions: entropy and Huffman on new distributions, an LZW trace, choosing a compressor.",
    lede: "New distributions and a new string for LZW. Keep a calculator handy for the logs.",
    qs: [
      {
        type: "mcq",
        q: "A sensor sends one of four symbols with probabilities 0.7, 0.1, 0.1, 0.1. Roughly what's its entropy?",
        o: ["0 bits: one symbol dominates", "about 0.5 bits", "about 1.4 bits", "exactly 2 bits"],
        a: 2,
        hint: "Four equally likely symbols would give 2 bits. Skew lowers it, but 30% of the time you still get one of three surprises.",
        why: "H = −0.7 log₂ 0.7 − 3 × 0.1 log₂ 0.1 ≈ 0.360 + 0.997 = <b>1.36</b> bits, well below the 2 bits a fixed-length code uses.",
      },
      {
        type: "mcq",
        q: "A biased coin lands heads 90% of the time. Roughly what's its entropy?",
        o: ["about 0.1 bits", "about 0.5 bits", "about 0.9 bits", "1 bit"],
        a: 1,
        hint: "A fair coin is 1 bit. This one is very predictable, but the rare tails are a big surprise.",
        why: "H = −0.9 log₂ 0.9 − 0.1 log₂ 0.1 ≈ <b>0.47</b> bits. Very predictable, so each toss carries less than half a bit.",
      },
      {
        type: "order",
        q: "Build a Huffman code for probabilities 0.4, 0.3, 0.2, 0.1. Put the merges in the order they happen.",
        items: ["Merge 0.1 and 0.2 → 0.3", "Merge the two 0.3 nodes → 0.6", "Merge 0.4 and 0.6 → the root"],
        why: "Always merge the two smallest weights: 0.1 + 0.2, then 0.3 + 0.3, then 0.4 + 0.6.",
      },
      {
        type: "mcq",
        q: "Same code: symbol depths come out as 1, 2, 3, 3 (for 0.4, 0.3, 0.2, 0.1). What's the average code length in bits?",
        o: ["1.75", "1.9", "2", "2.5"],
        a: 1,
        hint: "Multiply each probability by its depth, then add: 0.4 × 1, 0.3 × 2, 0.2 × 3, 0.1 × 3.",
        why: "0.4·1 + 0.3·2 + 0.2·3 + 0.1·3 = 0.4 + 0.6 + 0.6 + 0.3 = <b>1.9</b> bits.",
      },
      {
        type: "mcq",
        q: "LZW encodes <code>ABABABA</code> starting from the dictionary A = 0, B = 1. How many codes does it output?",
        o: ["3", "4", "5", "7"],
        a: 1,
        why: "Outputs 0 (A), 1 (B), 2 (AB), 4 (ABA): <b>4</b> codes for 7 characters, adding AB = 2, BA = 3 and ABA = 4 along the way.",
      },
      {
        type: "mcq",
        q: "LZW encoded <code>ABABABA</code> (starting dictionary A = 0, B = 1) as 0, 1, 2, 4. When decoding that output, which code arrives <b>before the decoder has built its entry</b>?",
        o: ["0", "1", "2", "4"],
        a: 3,
        why: "After 0, 1, 2 the decoder has built entries up to 3. Code 4 was used by the encoder immediately after creating it, so the decoder rebuilds it as previous + its own first letter: AB + A = <b>ABA</b>.",
      },
      {
        type: "cat",
        q: "Which approach compresses each source best?",
        buckets: ["Huffman", "LZW", "Neither helps"],
        items: [
          ["Symbols with very uneven frequencies, no repeated phrases", 0],
          ["Log files full of repeated long phrases", 1],
          ["Output of a good encryption algorithm", 2],
          ["A file that has already been zipped", 2],
        ],
        why: "Huffman exploits skewed symbol frequencies, and LZW exploits repeated sequences. Encrypted or already-compressed data looks random: its entropy is near the maximum, so nothing is left to squeeze out.",
      },
      {
        type: "mcq",
        q: "Why can't any lossless compressor shrink <i>every</i> possible file?",
        o: [
          "Computers can't search every possible encoding",
          "There are more files of length n than shorter files",
          "Only Huffman coding can reach the entropy limit",
          "Floating-point rounding loses information",
        ],
        a: 1,
        why: "It's a counting argument: 2ⁿ files of n bits, but only 2ⁿ − 1 shorter bit strings. A lossless code can't map them all to shorter outputs.",
      },
    ],
  });

  /* ================= Phase 8 ================= */
  boss(8, {
    blurb: "Eight questions: new DH and RSA numbers, choosing the right primitive, chain attacks.",
    lede: "New toy keys. The arithmetic is small enough for paper.",
    qs: [
      {
        type: "mcq",
        q: "Diffie–Hellman with p = 17, g = 3. Alice picks a = 4. What value A does she send?",
        o: ["12", "13", "4", "81"],
        a: 1,
        why: "3⁴ = 81 and 81 mod 17 = 81 − 68 = <b>13</b>.",
      },
      {
        type: "mcq",
        q: "Diffie–Hellman with p = 17, g = 3. Alice picked a = 4 and sent A = 13. Bob picks b = 5 and sends B = 3⁵ mod 17 = 5. What shared secret do both compute?",
        o: ["5", "8", "13", "15"],
        a: 2,
        hint: "Alice computes 5⁴ mod 17: 5⁴ = 625, and 17 × 36 = 612.",
        why: "Alice: 5⁴ = 625 and 625 mod 17 = 13. Bob: 13⁵ mod 17 = 13. Both get <b>13</b>.",
      },
      {
        type: "mcq",
        q: "Toy RSA with p = 3, q = 11, so n = 33 and φ = 20. Take e = 3. What's the private exponent d (3d ≡ 1 mod 20, smallest positive)?",
        o: ["3", "7", "9", "13"],
        a: 1,
        why: "3 × 7 = 21 = 20 + 1, so <b>d = 7</b>. Check: 4 encrypts to 4³ mod 33 = 31, and 31⁷ mod 33 = 4.",
      },
      {
        type: "mcq",
        q: "Same n = 33, φ = 20. Why can't you use e = 4?",
        o: ["4 is too small", "gcd(4, 20) = 4", "4 is even and keys must be odd", "It would work fine"],
        a: 1,
        why: "d must satisfy 4d ≡ 1 (mod 20), but 4d is always a multiple of 4, and 1 is not. No inverse, so no decryption.",
      },
      {
        type: "match",
        q: "Match each security goal to the primitive that provides it.",
        pairs: [
          ["Detect whether a downloaded file was altered, given a trusted fingerprint", "Cryptographic hash"],
          ["Two strangers agree on a secret key over a public channel", "Diffie–Hellman"],
          ["Keep the contents of a message private", "Encryption"],
          ["Prove a message really came from a specific sender", "Digital signature"],
        ],
        why: "Hashes fingerprint data, DH agrees keys, encryption hides content, and signatures bind a message to a private key.",
      },
      {
        type: "mcq",
        q: "Proof of work requires a hash starting with <b>5</b> hex zeros. About how many tries does it take on average?",
        o: ["80 (5 × 16)", "about 1 million (16⁵)", "about 1 billion (16⁷·⁵)", "32 (2⁵)"],
        a: 1,
        why: "Each hex digit is 1 in 16, so 16⁵ = <b>1,048,576</b>. Checking the result takes one hash.",
      },
      {
        type: "multi",
        q: "An attacker wants to rewrite a transaction deep in a proof-of-work chain and have the network accept it. What must they do? Select all that apply.",
        o: [
          "Recompute the proof of work for the edited block",
          "Recompute the proof of work for every block after it",
          "Out-pace the honest network while doing so",
          "Guess a user's private key",
        ],
        a: [0, 1, 2],
        why: "Editing a block invalidates it and every successor, so all of them need new work, and the attacker's chain must overtake the honest one. That's why security rests on honest miners having most of the computing power. No private keys are involved.",
      },
      {
        type: "order",
        q: "Order the steps of a typical secure connection (like HTTPS).",
        items: [
          "Server presents a certificate signed by a trusted authority",
          "Client checks the signature to authenticate the server",
          "Both sides run a key agreement (Diffie–Hellman) to create a session key",
          "Data flows encrypted with a fast symmetric cipher",
        ],
        why: "Authenticate first (this stops man-in-the-middle attacks), then agree a key, then use cheap symmetric encryption for the bulk data.",
      },
    ],
  });

  /* ================= Phase 9 ================= */
  boss(9, {
    blurb: "Eight questions: aliasing, bin spacing, a new hand DFT, FFT savings.",
    lede: "New signals and sample rates. The DFT one works out on paper.",
    qs: [
      {
        type: "mcq",
        q: "A 130 Hz tone is sampled at 100 Hz. At what frequency does it appear in the spectrum (between 0 and 50 Hz)?",
        o: ["30 Hz", "50 Hz", "70 Hz", "130 Hz"],
        a: 0,
        why: "It folds down: |130 − 100| = <b>30 Hz</b>. Anything above half the sample rate impersonates a lower frequency.",
      },
      {
        type: "mcq",
        q: "What's the smallest sample rate you'd need, in theory, to capture a 440 Hz tone without aliasing? (The Nyquist rate: you need strictly more than this.)",
        o: ["220 Hz", "440 Hz", "880 Hz", "1,320 Hz"],
        a: 2,
        why: "Twice the highest frequency: 2 × 440 = <b>880 Hz</b>. In practice you'd sample comfortably above it.",
      },
      {
        type: "mcq",
        q: "You record 250 samples at 1,000 Hz. How far apart are the DFT's frequency bins?",
        o: ["0.25 Hz", "4 Hz", "250 Hz", "1,000 Hz"],
        a: 1,
        why: "Bin spacing = fs / N = 1000 / 250 = <b>4 Hz</b>. Record for longer to get finer resolution.",
      },
      {
        type: "pick",
        q: "The DFT of the 4-sample signal <b>[2, 0, 2, 0]</b>. <b>Click every bin that is non-zero.</b>",
        fig: spectrum([0, 0, 0, 0]),
        a: ["k0", "k2"],
        hint: "The signal is a constant 1 plus an alternating ±1.",
        why: "X₀ = 2 + 0 + 2 + 0 = 4, X₁ = 2 − 2 = 0, X₂ = 2 + 2 = 4, X₃ = 0. It's a DC level (k = 0) plus the fastest alternation (k = 2).",
      },
      {
        type: "mcq",
        q: "For N = 4096, roughly how many times fewer operations does the FFT need than the direct DFT (N² vs N log₂ N)?",
        o: ["about 12", "about 340", "about 4,000", "about 16 million"],
        a: 1,
        hint: "N² / (N log₂ N) = N / log₂ N, and log₂ 4096 = 12.",
        why: "N² / (N log₂ N) = N / log₂ N = 4096 / 12 ≈ <b>341</b>.",
      },
      {
        type: "order",
        q: "Recursive radix-2 FFT with N = 4. Order the input samples as they appear at the bottom of the recursion (bit-reversed).",
        items: ["x₀", "x₂", "x₁", "x₃"],
        why: "Split into evens (x₀, x₂) and odds (x₁, x₃), then split again. Leaf order 0, 2, 1, 3 is the bit-reversal of 00, 01, 10, 11.",
      },
      {
        type: "mcq",
        q: "A 12.5 Hz tone recorded for exactly 1 second shows energy spread over several bins around 12–13 Hz. What's going on, and what helps?",
        o: [
          "Aliasing: the tone is above Nyquist, so sample much faster",
          "Leakage: 12.5 cycles don't fit; a Hann window helps",
          "The FFT is inaccurate for tones that aren't whole numbers",
          "Random noise: average several recordings",
        ],
        a: 1,
        why: "12.5 cycles don't fit the window, so its edges don't match up and energy smears. That's leakage, not aliasing (the tone is far below the Nyquist limit).",
      },
      {
        type: "mcq",
        q: "Why does the FFT give <b>exactly</b> the same answer as the direct DFT?",
        o: [
          "It's an approximation that's usually very close",
          "It's the same sum, regrouped so shared work is done once",
          "It drops the terms that are too small to matter",
          "It only computes half the bins and mirrors them",
        ],
        a: 1,
        why: "It's pure algebra: the even/odd split rewrites the same sum. Only rounding differs.",
      },
    ],
  });
})();

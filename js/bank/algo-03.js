(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { M, TF } = partScope;
  const N = NIC,
    B = N.bank;
  B.add("a6-hamming", [
    M("Hamming(7,4) syndrome p4 p2 p1 = 101. Which position is wrong?", ["2", "3", "5", "6"], 2, "101 in binary is 5."),
    M(
      "Where do the parity bits sit in Hamming(15,11)?",
      ["1, 2, 3, 4", "1, 2, 4, 8", "12–15", "odd positions"],
      1,
      "Powers of two.",
    ),
    M(
      "Which positions does p2 check in Hamming(7,4)?",
      ["1, 3, 5, 7", "2, 3, 6, 7", "4, 5, 6, 7", "2, 4, 6"],
      1,
      "Every position whose binary has the middle bit set.",
    ),
    M(
      "Data 0001 encodes to 1101001. Bit 2 flips, giving 1001001. What syndrome does the receiver compute?",
      ["000", "010", "110", "001"],
      1,
      "Only p2's group is disturbed, so the syndrome is 010 = position 2.",
    ),
    M(
      "What's SECDED's extra bit for?",
      [
        "Making decoding faster by skipping the syndrome",
        "An overall parity bit that detects double errors",
        "Encrypting the codeword",
        "Compressing the data bits",
      ],
      1,
      "Single-error correcting, double-error detecting.",
    ),
  ]);

  /* ---------- Phase 7 ---------- */
  B.add("a7-entropy", [
    M("A fair 8-sided die. Entropy?", ["1 bit", "2 bits", "3 bits", "8 bits"], 2, "log₂ 8 = 3."),
    M(
      "An event has probability 1/4. How surprising is it?",
      ["1 bit", "2 bits", "4 bits", "0.25 bits"],
      1,
      "−log₂(1/4) = 2.",
    ),
    M(
      "A source always sends the same symbol. Its entropy?",
      ["0 bits", "1 bit", "infinite", "depends on the symbol"],
      0,
      "No surprise, no information.",
    ),
    {
      type: "order",
      q: "Order these sources from lowest entropy to highest.",
      items: ["A coin that always lands heads", "A fair coin", "A fair 4-sided die", "A fair 8-sided die"],
      why: "0, 1, 2 and 3 bits.",
    },
    M(
      "What does entropy tell you about compression?",
      [
        "Nothing useful: it only measures randomness, not size",
        "No lossless code beats it on average",
        "Compression always halves the size",
        "It's the maximum possible file size",
      ],
      1,
      "It's the floor you can approach but not beat.",
    ),
  ]);
  B.add("a7-huffman", [
    M(
      "Which code is prefix-free?",
      ["{0, 01, 11}", "{0, 10, 110, 111}", "{1, 10, 11}", "{00, 0, 1}"],
      1,
      "No codeword starts another. In {0, 01, 11}, 0 is a prefix of 01.",
    ),
    M(
      "With A = 0, B = 10, C = 110, D = 111, what does <code>1100</code> decode to?",
      ["CA", "BB", "DA", "AC"],
      0,
      "110 | 0 = C, A.",
    ),
    M(
      "Huffman for probabilities 0.5, 0.25, 0.25. Average code length?",
      ["1 bit", "1.5 bits", "2 bits", "1.25 bits"],
      1,
      "Lengths 1, 2, 2: 0.5 + 0.5 + 0.5 = 1.5 (which equals the entropy here).",
    ),
    M(
      "Why must the Huffman code table be sent with the data?",
      [
        "So the data is encrypted and can't be read",
        "The receiver must know which codeword is which",
        "So errors can be detected",
        "It needn't be: the receiver can work it out",
      ],
      1,
      "It's built from the sender's frequencies.",
    ),
    M(
      "Huffman on four equally likely symbols gives…",
      ["1 bit each", "2 bits each", "3 bits each", "variable lengths"],
      1,
      "Uniform frequencies leave no skew to exploit.",
    ),
  ]);
  B.add("a7-lzw", [
    M(
      "LZW encodes <code>AAAA</code> with the dictionary A = 0. What's the output?",
      ["0, 0, 0, 0", "0, 1, 0", "0, 1", "1, 1"],
      1,
      "A → 0 (add AA = 1), AA → 1 (add AAA = 2), A → 0.",
    ),
    M(
      "Why doesn't LZW send its dictionary?",
      [
        "It's too big to send alongside the compressed data",
        "The decoder rebuilds it from the codes it receives",
        "It's encrypted and can't be sent",
        "The dictionary is fixed forever",
      ],
      1,
      "Both sides grow identical tables from the same data.",
    ),
    M(
      "The decoder receives a code it hasn't built yet. What rule rebuilds it?",
      [
        "Skip the code and carry on with the next one",
        "Previous output + its own first character",
        "Ask the encoder to resend it",
        "Treat it as code 0",
      ],
      1,
      "It must be the entry the encoder just created.",
    ),
    M(
      "Which data does LZW compress best?",
      ["Random bytes", "Text with lots of repeated phrases", "Files that are already zipped", "Encrypted data"],
      1,
      "It exploits repeated sequences.",
    ),
    TF("LZW needs the symbol frequencies before it starts.", false, "That's Huffman. LZW learns as it goes."),
  ]);

  /* ---------- Phase 8 ---------- */
  B.add("a8-hash", [
    {
      type: "multi",
      q: "Which properties should a cryptographic hash have? Select all.",
      o: [
        "Same input always gives the same digest",
        "A tiny change to the input changes the digest completely",
        "You can recover the input from the digest",
        "Fixed-length output",
      ],
      a: [0, 1, 3],
      why: "Deterministic, avalanche, fixed-length and one-way. Reversibility would defeat its purpose.",
    },
    M(
      "Proof of work needs 3 leading hex zeros. About how many tries on average?",
      ["48", "about 4,000", "about 1 million", "3"],
      1,
      "16³ = 4,096.",
    ),
    M(
      "Why does editing an old block break every later block?",
      [
        "Every block is encrypted with the same key",
        "Each block stores the previous block's hash",
        "All blocks share one timestamp",
        "Blocks are numbered consecutively",
      ],
      1,
      "The chain of hashes links them.",
    ),
    M(
      "Mining vs checking a proof of work:",
      [
        "both take many tries",
        "mining takes many tries",
        "both take a single hash",
        "checking takes longer than mining",
      ],
      1,
      "That asymmetry is the whole point.",
    ),
    TF("Hashing a password encrypts it.", false, "Encryption can be reversed with a key; a hash is one-way."),
  ]);
  B.add("a8-keys", [
    M(
      "Diffie–Hellman: p = 11, g = 2, Alice's secret a = 3, Bob's secret b = 4. What shared secret do they get?",
      ["3", "4", "5", "8"],
      1,
      "A = 2³ mod 11 = 8, B = 2⁴ mod 11 = 5. Alice: 5³ = 125 mod 11 = 4. Bob: 8⁴ mod 11 = 4.",
      { hint: "125 = 11 × 11 + 4." },
    ),
    M(
      "How do real protocols stop a man-in-the-middle during Diffie–Hellman?",
      [
        "Using bigger primes on their own, so logs are harder",
        "Authenticating it, e.g. with signed certificates",
        "Sending the shared secret twice",
        "Adding a CRC to each message",
      ],
      1,
      "DH agrees a key but doesn't prove who you're talking to.",
    ),
    M(
      "Toy RSA with p = 5, q = 7, so n = 35 and φ = 24. Take e = 5. What's d?",
      ["5", "7", "11", "29"],
      0,
      "5 × 5 = 25 = 24 + 1, so d = 5 (it happens to equal e here).",
    ),
    M(
      "In RSA, who uses which key to send you a secret?",
      [
        "They use your private key",
        "They encrypt with your public key",
        "Both use the public key to decrypt",
        "No keys are needed",
      ],
      1,
      "Public locks, private unlocks.",
    ),
    M(
      'Why is raw ("textbook") RSA risky?',
      ["It's slow", "It's deterministic", "It uses primes", "It can't encrypt numbers"],
      1,
      "Real RSA adds random padding (OAEP).",
    ),
  ]);

  /* ---------- Phase 9 ---------- */
  B.add("a9-dft", [
    M(
      "DFT of the constant signal [3, 3, 3, 3]: where is the energy?",
      ["Spread evenly", "All in bin k = 0", "All in bin k = 2", "Nowhere"],
      1,
      "A constant is pure DC.",
    ),
    M(
      "A 90 Hz tone is sampled at 100 Hz. Where does it appear?",
      ["90 Hz", "10 Hz", "50 Hz", "190 Hz"],
      1,
      "It folds down: 100 − 90 = 10 Hz.",
    ),
    M(
      "8,000 Hz sample rate, 800-sample window. Bin spacing?",
      ["1 Hz", "10 Hz", "100 Hz", "0.1 Hz"],
      1,
      "fs / N = 8000 / 800 = 10 Hz.",
    ),
    M(
      "Energy smears into neighbouring bins. What's the usual cause?",
      [
        "Sampling too slowly, so frequencies fold over (aliasing)",
        "A non-whole number of cycles in the window",
        "Taking too many samples",
        "A negative frequency in the signal",
      ],
      1,
      "Mismatched window edges spread the energy.",
    ),
    M(
      "You record twice as long at the same sample rate. The bin spacing…",
      ["doubles", "halves", "stays the same", "goes to zero"],
      1,
      "Spacing = fs / N, and N doubled.",
    ),
  ]);
  B.add("a9-fft", [
    M("How many levels of butterflies does an 8-point FFT have?", ["2", "3", "8", "4"], 1, "log₂ 8 = 3."),
    M(
      "In an 8-point FFT's bit-reversed order, which index lands in position 1?",
      ["1", "2", "4", "7"],
      2,
      "1 = 001 reversed is 100 = 4.",
    ),
    M("How many butterflies per level for N = 16?", ["4", "8", "16", "32"], 1, "N/2 pairs per level."),
    M(
      "Your signal has 1,000 samples. How does a radix-2 FFT handle it?",
      ["It can't", "Zero-pad to 1,024", "Drop to 512 samples", "Use N = 1,000 directly"],
      1,
      "Pad up to the next power of two.",
    ),
    TF("The FFT gives exactly the same result as the direct DFT, apart from rounding.", true, "Same sum, regrouped."),
  ]);

  /* ---------- Phase 10 ---------- */
  B.add("a10-attn", [
    M(
      "Softmax of scores [0, 0, 0]. The weights?",
      ["[1, 0, 0]", "[1/3, 1/3, 1/3]", "[0, 0, 0]", "undefined, since all scores are 0"],
      1,
      "Equal scores give equal shares.",
    ),
    M(
      "With a causal mask, the 3rd token in a sentence can attend to how many tokens?",
      ["1", "3", "all of them", "2"],
      1,
      "Itself and the two before it.",
    ),
    M(
      "Why use several attention heads?",
      [
        "To save memory compared with one big attention head",
        "Different heads track different relationships",
        "To avoid having to compute softmax",
        "To sort the words into order",
      ],
      1,
      "Each head has its own query, key and value projections.",
    ),
    M(
      "Why add position information to token embeddings?",
      [
        "To make every vector longer and more expressive",
        "Attention alone ignores word order",
        "To encrypt the tokens",
        "To speed up the softmax",
      ],
      1,
      "Without it, shuffled sentences look the same.",
    ),
    M("Context length triples. Attention's score matrix grows…", ["3×", "6×", "9×", "27×"], 2, "n² scaling: 3² = 9."),
  ]);
})();

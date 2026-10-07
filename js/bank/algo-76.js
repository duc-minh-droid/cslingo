/* js/bank/algo-80.js: Phase 7 revision questions (1/4): redundancy, binary entropy, Kraft. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a7-redundancy", [
    M(
      "Which stage of a communication system is called source coding?",
      [
        "Removing redundancy from the raw data",
        "Adding parity bits against noise",
        "Modulating bits onto a radio wave",
        "Encrypting the message with a key",
      ],
      0,
      "Compression is source coding. Adding safe redundancy is channel coding.",
    ),
    M(
      "Why can you still read a sentence whose middle letters of each word are jumbled?",
      [
        "Context and word shape let you rebuild the missing structure",
        "Your eyes correct the spelling of every letter",
        "English words never contain more than four letters",
        "The letters are really sorted in the right order",
      ],
      0,
      "Natural text has redundancy that people use without noticing.",
    ),
    M(
      "Five symbols are sent with a fixed-length code. How many bits per symbol?",
      ["3", "2", "5", "4"],
      0,
      "Two bits name 4 things, three bits name 8.",
    ),
    M(
      "A message B B A D E B C uses a fixed 3-bit code. Its length is…",
      ["21 bits", "7 bits", "15 bits", "35 bits"],
      0,
      "7 letters × 3 bits.",
      { hint: "Seven letters, three bits each." },
    ),
    M(
      "Morse code and ASCII are examples of which kind of model?",
      ["Static", "Dynamic", "Adaptive", "Lossy"],
      0,
      "The same model is used for every text.",
    ),
    M(
      "Which kind of model must be transmitted to the receiver along with the data?",
      [
        "A dynamic model built from this text",
        "A static model like ASCII",
        "An adaptive model learned on the fly",
        "None of them need it",
      ],
      0,
      "A model fitted to the text is not known in advance, so it has to be sent.",
    ),
    M(
      "Which model type can only be decoded from the start of the data?",
      ["Adaptive", "Static", "Dynamic with the table sent first", "Fixed-length"],
      0,
      "Adaptive decoders learn from everything before the current point.",
    ),
    TF(
      "Compression and error correction both add redundancy.",
      false,
      "Compression removes redundancy; error correction adds a controlled amount back.",
    ),
    {
      type: "cat",
      q: "Sort each coder by the kind of model it uses.",
      buckets: ["Static", "Dynamic", "Adaptive"],
      items: [
        ["ASCII", 0],
        ["Morse code", 0],
        ["Huffman code", 1],
        ["LZW", 2],
      ],
      why: "ASCII and Morse are fixed in advance; Huffman counts this text and sends the table; LZW learns as it goes.",
    },
    M(
      "Colour video compresses so well mainly because…",
      [
        "neighbouring pixels and frames are very similar",
        "the human eye cannot see any detail in video",
        "video is stored as text",
        "each frame is already a single colour",
      ],
      0,
      "Heavy repetition between and within frames is the redundancy to remove.",
    ),
    M(
      "Scrambling the letters inside each word of a text changes its single-letter entropy by…",
      [
        "nothing: the letter counts are the same",
        "raising it a lot, since order is lost",
        "lowering it to zero",
        "doubling it",
      ],
      0,
      "A per-letter count ignores order entirely.",
    ),
  ]);

  B.add("a7-binary-entropy", [
    M(
      "A coin has P(heads) = 0.5. Its entropy is…",
      ["1 bit", "0.5 bits", "2 bits", "0 bits"],
      0,
      "The fair coin is the maximum for two outcomes.",
    ),
    M(
      "P(heads) = 1. The entropy of one flip is…",
      ["0 bits", "1 bit", "infinite", "0.5 bits"],
      0,
      "No surprise at all.",
    ),
    M(
      "Compare P(heads) = 0.1 with P(heads) = 0.9. Their entropies are…",
      ["the same", "larger for 0.9", "larger for 0.1", "0.9 is zero"],
      0,
      "H(p) = H(1 − p).",
    ),
    M(
      "What does 0 · log₂ 0 count as in the entropy formula?",
      ["0", "1", "−1", "undefined, so the symbol is dropped with an error"],
      0,
      "By convention an impossible symbol adds nothing.",
    ),
    M(
      "Roughly how many bits could 200 flips of a 90/10 coin need at best? (H ≈ 0.47)",
      ["about 94", "about 200", "about 20", "about 470"],
      0,
      "200 × 0.47 ≈ 94.",
      { hint: "Half of 200 is 100; a bit less than half." },
    ),
    M(
      "Which sample size gives the most trustworthy empirical entropy of a coin?",
      ["10,000 flips", "10 flips", "100 flips", "They are all equally reliable"],
      0,
      "Frequencies settle near the true probabilities as the sample grows.",
    ),
    M(
      "For the word BANANA, which letter has the largest probability?",
      ["A (3 of 6)", "N (2 of 6)", "B (1 of 6)", "They are all equal"],
      0,
      "Counts: A 3, N 2, B 1.",
    ),
    M(
      "Why is the entropy sum written Σ p × (−log₂ p)?",
      [
        "It averages each surprise, weighted by frequency",
        "It adds up the probabilities so that they reach 1",
        "It counts how many symbols are in the alphabet",
        "It removes the symbols that never appear at all",
      ],
      0,
      "An expected value is probability times value, summed.",
    ),
    {
      type: "slider",
      q: "A source with two outcomes has probabilities 0.25 and 0.75. Estimate its entropy.",
      min: 0,
      max: 1,
      step: 0.05,
      ans: 0.81,
      tol: 0.1,
      unit: " bits",
      hint: "Between the fair coin (1 bit) and the 90/10 coin (about 0.47 bits).",
      why: "H(0.25) ≈ 0.811 bits.",
    },
    M(
      "A loaded die has probabilities 0.4, 0.2, 0.1, 0.1, 0.1, 0.1. Which face has the largest ideal codeword?",
      [
        "a 0.1 face, about 3.3 bits",
        "the 0.4 face, the most common one",
        "the 0.2 face, the middle one",
        "all faces equal in length",
      ],
      0,
      "The rarer the face, the longer its ideal word.",
    ),
    TF(
      "Empirical entropy from 10 flips is guaranteed to equal the true entropy.",
      false,
      "It is only an estimate and can be well off.",
    ),
  ]);

  B.add("a7-source-coding", [
    M(
      "The expected code length L is…",
      [
        "the sum of p × length over symbols",
        "the length of the longest codeword used",
        "the number of symbols in the alphabet",
        "the sum of all the codeword lengths",
      ],
      0,
      "Weighted by how often each symbol occurs.",
    ),
    M(
      "Kraft's inequality for a prefix code says…",
      [
        "the sum of 2^(−length) is at most 1",
        "all codewords have the same length",
        "the probabilities add up to exactly 2",
        "the lengths of the codewords add up to 1",
      ],
      0,
      "Each codeword uses a share 2^(−l) of the code tree.",
    ),
    M("Lengths 2, 2, 2, 2 for four symbols. Kraft's sum is…", ["1", "2", "½", "¼"], 0, "Four shares of ¼."),
    M(
      "Lengths 1, 1, 1 for three symbols. Does a prefix code exist?",
      ["No: the sum is 1.5", "Yes: each is one bit", "Only with probabilities", "Yes, using 0, 1 and 01"],
      0,
      "Only two one-bit words exist, 0 and 1.",
    ),
    M(
      "Which length is ideal for a symbol of probability 1/8?",
      ["3 bits", "8 bits", "1 bit", "1/8 bit"],
      0,
      "−log₂(1/8) = 3.",
    ),
    M(
      "The source coding theorem states that…",
      [
        "no decodable code beats the entropy on average",
        "every source can be coded at exactly its entropy",
        "entropy is the longest average length possible",
        "Huffman codes always have average length exactly H",
      ],
      0,
      "L ≥ H.",
    ),
    M(
      "When does the best code reach L = H exactly?",
      [
        "When every probability is a power of ½",
        "When all symbols are different",
        "When there are only two symbols",
        "Never",
      ],
      0,
      "Then every ideal length is a whole number.",
    ),
    M(
      "A code claims L = 1.2 bits for a source with H = 1.5. The most likely explanation?",
      [
        "It is not uniquely decodable",
        "It is better than entropy allows, so it is excellent",
        "H was measured in nats",
        "The source has too few symbols",
      ],
      0,
      "A code that breaks Kraft's budget can look better than the floor.",
    ),
    M(
      "Rounding ideal lengths up to whole bits gives an average length…",
      [
        "at least H but under H + 1",
        "exactly H, with nothing lost",
        "at least H + 1, one extra bit",
        "below H, beating the floor",
      ],
      0,
      "Each rounding costs under one bit.",
    ),
    M(
      "A ternary code alphabet {0, 1, 2} measures information in…",
      ["trits", "bits", "nats", "bytes"],
      0,
      "Log base 3 goes with a 3-symbol code alphabet.",
    ),
    {
      type: "order",
      q: "Put these in order, from the cost you want to the bound you reach.",
      items: ["Choose lengths l for each symbol", "Check Σ 2⁻ˡ ≤ 1", "Minimise Σ p·l under that budget", "Reach L ≥ H"],
      why: "Pick lengths, check the budget, minimise, and the optimum is the entropy bound.",
    },
  ]);
})();

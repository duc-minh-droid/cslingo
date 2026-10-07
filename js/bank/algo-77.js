/* js/bank/algo-81.js: Phase 7 revision questions (2/4): KL divergence, Huffman worked example, Huffman cost and limits. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a7-kl", [
    M(
      "A code is built for model q but the data follow p. Codeword lengths come from…",
      ["q", "p", "the average of p and q", "the dictionary size"],
      0,
      "−log₂ q(x); frequency of use comes from p.",
    ),
    M(
      "The real average length under a wrong model is…",
      ["H(p) + D(p‖q)", "H(q) + D(q‖p)", "D(p‖q) only", "H(p) − D(p‖q)"],
      0,
      "Entropy plus the KL penalty.",
    ),
    M(
      "If q equals p exactly, the KL divergence is…",
      ["0", "1", "H(p)", "infinite"],
      0,
      "Matching the source costs nothing extra.",
    ),
    M(
      "Can D(p‖q) be negative?",
      ["No, never", "Yes, if q is lucky", "Only for two symbols", "Only for uniform p"],
      0,
      "L ≥ H forces D ≥ 0.",
    ),
    M(
      "p is uniform over 4 symbols and q gives lengths 1, 2, 3, 3. D(p‖q) equals…",
      ["0.25 bits", "0 bits", "2 bits", "1.75 bits"],
      0,
      "L = 2.25 against H = 2.",
      { hint: "Average the four lengths, then subtract 2." },
    ),
    M(
      "Which is true about D(p‖q) and D(q‖p)?",
      [
        "They are generally different",
        "They are always exactly equal",
        "One of them is always zero",
        "They always add up to 1",
      ],
      0,
      "KL divergence is not symmetric.",
    ),
    M(
      "Which model type has the biggest mismatch risk for unusual text?",
      ["Static", "Dynamic", "Adaptive", "None"],
      0,
      "A fixed model fits no particular text.",
    ),
    TF(
      "An adaptive model's mismatch penalty can shrink as it sees more data.",
      true,
      "It keeps updating its estimate of p.",
    ),
    M(
      "Using a uniform guess on a skewed source gives an average length…",
      ["above the entropy", "below the entropy", "equal to the entropy", "of zero"],
      0,
      "Any mismatch adds a positive penalty.",
    ),
    {
      type: "cat",
      q: "Which quantity does each statement describe?",
      buckets: ["H(p)", "D(p‖q)"],
      items: [
        ["the best possible average length", 0],
        ["the price of the wrong model", 1],
        ["zero when q = p", 1],
        ["depends only on the true source", 0],
      ],
      why: "Entropy is a property of p alone. The KL term depends on both p and q and vanishes when they match.",
    },
  ]);

  B.add("a7-huffman-worked", [
    M(
      "In the lecture example, which letter has the shortest codeword?",
      ["B, with a 1-bit codeword", "A, with a 3-bit codeword", "C, with a 3-bit codeword", "E, with a 3-bit codeword"],
      0,
      "B has probability 0.51.",
    ),
    M(
      "In the lecture example, which two letters merge first?",
      ["C and E", "A and D", "B and A", "B and C"],
      0,
      "They are the two smallest, 0.09 and 0.11.",
    ),
    M(
      "The lecture's average length for the 5-letter code is…",
      ["1.98 bits", "3 bits", "1.5 bits", "2.5 bits"],
      0,
      "1(0.51) + 3(0.49).",
      { hint: "B costs 1 bit; the other four letters cost 3 and share 0.49." },
    ),
    M(
      "That code's entropy is 1.964 bits. So the average length is…",
      [
        "a little above the entropy",
        "a little below the entropy",
        "exactly equal to the entropy",
        "far above the entropy",
      ],
      0,
      "L ≥ H, with only a small gap.",
    ),
    M(
      "A decoder reads the bits 1 1 0 1 1 with B = 1, A = 011, D = 010, E = 001, C = 000. The output is…",
      ["BBA", "BBD", "BAB", "BBBBB"],
      0,
      "1 → B, 1 → B, then 011 → A.",
    ),
    M(
      "With a prefix-free code, when does the decoder output a letter?",
      [
        "As soon as the bits form a codeword",
        "After it has read exactly three bits",
        "Only at the very end of the stream",
        "When it sees a separator bit",
      ],
      0,
      "No codeword is a prefix of another.",
    ),
    M(
      "Encoding with a Huffman code is mostly…",
      ["a table lookup", "a tree search", "a sort", "a division"],
      0,
      "Each symbol maps straight to its codeword.",
    ),
    M(
      "Swapping every 0 and 1 in a Huffman code gives…",
      [
        "another valid code, same average length",
        "an invalid code that cannot be decoded",
        "a code with a shorter average length",
        "a code with a longer average length",
      ],
      0,
      "Codeword lengths are unchanged.",
    ),
    TF("A Huffman code for one source is unique.", false, "Tie-breaking and 0/1 labelling can differ."),
    M("Six copies of the 1-bit letter use how many bits?", ["6", "18", "12", "3"], 0, "One bit each."),
    M(
      "A message of four letters, all from the 3-bit group, costs…",
      ["12 bits", "4 bits", "8 bits", "16 bits"],
      0,
      "4 × 3.",
    ),
  ]);

  B.add("a7-huffman-algo", [
    M(
      "A greedy algorithm always…",
      [
        "takes the choice that looks best now",
        "tries every possibility, then picks",
        "works backwards from the answer",
        "picks each choice at random",
      ],
      0,
      "It never reconsiders.",
    ),
    M(
      "Coins 1, 3, 4 and a target of 6. Greedy gives…",
      [
        "3 coins, which is not the best",
        "2 coins, which is the best",
        "6 coins, all of them ones",
        "nothing, as it cannot make 6",
      ],
      0,
      "4 + 1 + 1 against the better 3 + 3.",
    ),
    M(
      "For n symbols, how many merges does Huffman perform?",
      ["n − 1", "n", "n²", "log n"],
      0,
      "Each merge reduces the node count by one.",
    ),
    M(
      "The running time of Huffman coding on n symbols is…",
      ["O(n log n)", "O(n²), comparing every pair", "O(log n), one queue operation", "O(2ⁿ), trying every tree"],
      0,
      "A sort plus n − 1 queue operations of log n.",
    ),
    M(
      "A prefix-free code is also called…",
      ["instantaneous", "adaptive", "lossy", "static only"],
      0,
      "Each codeword is recognised when its last bit arrives.",
    ),
    M(
      "What must the receiver have to decode a Huffman stream?",
      ["the code table or tree", "the original message", "the sender's dictionary history", "nothing at all"],
      0,
      "The tree travels with the data.",
    ),
    M(
      "One flipped bit in a Huffman stream can damage many symbols because…",
      ["codeword boundaries move", "every bit carries parity", "the table is rebuilt", "Huffman uses random labels"],
      0,
      "Variable-length codewords lose synchronisation.",
    ),
    M(
      "One flipped bit in a fixed 3-bit code damages at most…",
      ["one symbol", "all later symbols", "two symbols", "none"],
      0,
      "Boundaries never move.",
    ),
    M(
      "In the JPEG pipeline, Huffman coding comes…",
      [
        "after quantisation and zig-zag",
        "before the DCT is applied",
        "before the colour conversion",
        "in place of quantisation",
      ],
      0,
      "It packs the already-quantised coefficients.",
    ),
    M(
      "A source has probabilities 0.99 and 0.01. Huffman spends…",
      ["1 bit per symbol", "0.08 bits per symbol", "0.5 bits per symbol", "2 bits per symbol"],
      0,
      "A codeword is at least one bit.",
    ),
    TF(
      "Huffman coding needs the symbol probabilities before it starts.",
      true,
      "That is the main limitation compared with adaptive schemes.",
    ),
  ]);
})();

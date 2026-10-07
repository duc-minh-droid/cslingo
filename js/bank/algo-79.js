/* js/bank/algo-83.js: Phase 7 revision questions (4/4): rate and distortion, top-ups for entropy, Huffman and LZW. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a7-rate-distortion", [
    M(
      "A lossy codec can use fewer bits than the entropy of the data because…",
      ["it allows some error", "entropy is wrong for images", "it ignores the bits", "it uses a bigger dictionary"],
      0,
      "Entropy bounds lossless coding only.",
    ),
    M(
      "In a neural codec, the rate R measures…",
      [
        "expected bits for the coded latents",
        "the total training time taken",
        "the average brightness of the picture",
        "the number of layers in the network",
      ],
      0,
      "R = E[−log₂ p(ẑ)].",
    ),
    M(
      "Distortion is most simply measured by…",
      [
        "mean squared error between x and x̂",
        "the size of the compressed file",
        "the number of pixels that changed",
        "the entropy of the original x",
      ],
      0,
      "D = ‖x − x̂‖² on average.",
    ),
    M(
      "PSNR with pixels in [0, 1] and MSE = 0.01 is…",
      ["20 dB", "10 dB", "40 dB", "1 dB"],
      0,
      "10 log₁₀(1/0.01) = 20.",
      { hint: "1/0.01 is 100, and the base-10 log of 100 is 2." },
    ),
    M(
      "Higher PSNR means…",
      ["a closer reconstruction", "a smaller file", "more noise", "a bigger λ is needed"],
      0,
      "Lower error, higher PSNR.",
    ),
    M(
      "In the loss R + λD, a larger λ makes the codec favour…",
      [
        "quality, spending more bits",
        "tiny files, accepting some blur",
        "faster training and nothing else",
        "nothing different at all",
      ],
      0,
      "Error costs more.",
    ),
    M(
      "Quantising with a coarser step usually…",
      [
        "lowers the rate and raises the distortion",
        "raises both the rate and distortion",
        "lowers both the rate and distortion",
        "changes neither of the two",
      ],
      0,
      "Fewer symbols, larger rounding errors.",
    ),
    M(
      "Why can't we train through round() directly?",
      [
        "its gradient is zero almost everywhere",
        "it is far too slow to run",
        "it makes all the values negative",
        "it needs a much bigger dataset",
      ],
      0,
      "A staircase has no slope to learn from.",
    ),
    M(
      "During training, rounding is replaced by…",
      [
        "adding uniform noise between −½ and ½",
        "multiplying every value by zero",
        "taking the logarithm of each value",
        "looking each value up in a dictionary",
      ],
      0,
      "A smooth stand-in for the rounding error.",
    ),
    M(
      "A 784-pixel image is coded with 16 latents at 2 bits each. The bits per pixel are roughly…",
      ["0.04", "0.4", "4", "32"],
      0,
      "32 bits ÷ 784 ≈ 0.04.",
      { hint: "32 bits over about 800 pixels." },
    ),
    {
      type: "cat",
      q: "Lossless or lossy?",
      buckets: ["Lossless", "Lossy"],
      items: [
        ["Huffman coding", 0],
        ["LZW in GIF", 0],
        ["JPEG quantisation", 1],
        ["Rounding latents in a neural codec", 1],
      ],
      why: "Huffman and LZW can be reversed exactly. Quantisation and latent rounding discard detail.",
    },
  ]);

  // top-ups for the three original modules
  B.add("a7-entropy", [
    M(
      "Written English has an entropy of about 4.5 bits per letter in the lecture. ASCII spends…",
      ["8 bits per letter", "4.5 bits per letter", "1 bit per letter", "26 bits per letter"],
      0,
      "So a good code could in principle save a lot.",
    ),
    M(
      "Two independent events carry 1 bit and 2 bits of surprise. Together they carry…",
      ["3 bits", "2 bits", "1 bit", "0.5 bits"],
      0,
      "Probabilities multiply, so surprises add.",
    ),
    M(
      "Probabilities 0.7, 0.2, 0.1: which symbol contributes most to the entropy?",
      ["the 0.2 symbol", "the 0.7 symbol", "the 0.1 symbol", "all contribute equally"],
      0,
      "Contributions: 0.46, 0.36 and 0.33.",
    ),
    TF("An event with probability 1 carries one bit of information.", false, "It carries zero: no surprise."),
  ]);
  B.add("a7-huffman", [
    M(
      "Decoding a Huffman stream is done by…",
      [
        "walking the tree from the root, restarting at each leaf",
        "looking up fixed-size blocks of bits in a table",
        "sorting the bits and matching the probabilities",
        "dividing each bit by its probability",
      ],
      0,
      "Each leaf is a symbol.",
    ),
    M(
      "A source sends A 99% and B 1% of the time. Huffman's average length is…",
      ["1 bit per symbol", "0.08 bits per symbol", "0.99 bits per symbol", "2 bits per symbol"],
      0,
      "A codeword needs at least one bit.",
    ),
    M(
      "In a Huffman tree, the least likely symbols sit…",
      ["deepest", "closest to the root", "on the left only", "anywhere"],
      0,
      "They are merged first.",
    ),
    TF(
      "Two correct Huffman codes for the same source can have different average lengths.",
      false,
      "Both are optimal, so the average is the same.",
    ),
  ]);
  B.add("a7-lzw", [
    M(
      "An encoder with a 4-letter alphabet has emitted 5 codes mid-stream. The dictionary holds…",
      ["9 entries", "5 entries", "4 entries", "10 entries"],
      0,
      "4 plus one added per emitted code.",
    ),
    M(
      "Which message gains least from LZW?",
      ["one with no repeated sequences", "one with repeated phrases", "ABABABAB", "one long run of one letter"],
      0,
      "There is nothing for the dictionary to reuse.",
    ),
    M(
      "Why does LZW need nothing sent except the codes?",
      [
        "both sides build one dictionary from the data",
        "the dictionary is fixed in the published standard",
        "each code carries its own string with it",
        "the decoder guesses the text from context",
      ],
      0,
      "Rebuilt in lock-step.",
    ),
    TF("LZW can decode starting from the middle of the stream.", false, "The dictionary depends on everything before."),
  ]);
})();

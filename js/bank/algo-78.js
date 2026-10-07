/* js/bank/algo-82.js: Phase 7 revision questions (3/4): LZW both directions, LZW in GIF. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a7-lzw-decode", [
    M(
      "With A = 0 and B = 1, encoding ABABABABA gives…",
      ["0 1 2 4 3", "0 1 2 3 4", "0 0 1 1 2", "1 0 3 2 4"],
      0,
      "Matches A, B, AB, ABA, BA.",
    ),
    M(
      "After the encoder outputs the code for w, it adds…",
      ["w plus the next symbol", "w alone", "the next symbol alone", "nothing"],
      0,
      "A longer phrase for later.",
    ),
    M(
      "The decoder adds, after each code, the entry…",
      [
        "previous string plus current's first letter",
        "current string plus its own last letter",
        "the previous string on its own",
        "the code number as a string",
      ],
      0,
      "Mirrors what the encoder added.",
    ),
    M(
      "A code arrives that is not yet in the decoder's dictionary. The entry is…",
      [
        "previous + its own first letter",
        "previous + its own last letter",
        "an error: the stream is corrupt",
        "the current code written as a number",
      ],
      0,
      "The encoder made and used it at once.",
    ),
    M("Decoding with A = 0, B = 1 and codes 0 0: the output is…", ["AA", "A", "AAA", "BB"], 0, "Each code 0 is A."),
    M(
      "Alphabet A only. Codes 0, 1, 2 decode to…",
      ["AAAAAA", "AAAAA", "AAAA", "AAAAAAA"],
      0,
      "0 → A, 1 → AA, 2 → AAA: 1 + 2 + 3 letters.",
    ),
    M(
      "The encoder pseudocode loops over…",
      ["each input character once", "each dictionary entry", "each pair of characters", "each code twice"],
      0,
      "n steps, each with a lookup.",
    ),
    M(
      "LZW's overall running time is about…",
      ["O(n log n)", "O(n²), as in a double loop", "O(log n), as in a binary search", "O(1), constant time"],
      0,
      "n steps times a logarithmic lookup.",
    ),
    M(
      "LZW was published by Welch in…",
      ["1984", "1948", "2007", "1999"],
      0,
      "Lempel and Ziv's ideas, Welch's variant.",
    ),
    M(
      "Which of these is also a dictionary coder?",
      ["LZ77", "Huffman", "Morse", "ASCII"],
      0,
      "The lecture lists LZW, LZ77 and Sequitur.",
    ),
    TF(
      "A dictionary coder uses statistics of the symbols.",
      false,
      "It replaces repeated strings with indices and needs no statistics.",
    ),
  ]);

  B.add("a7-gif", [
    M(
      "A GIF can use at most how many colours?",
      ["256", "16", "65,536", "1,024"],
      0,
      "A palette index fits in one byte.",
    ),
    M(
      "In a GIF, each pixel is stored as…",
      ["an index into a palette", "three colour values", "a brightness only", "an LZW dictionary"],
      0,
      "Palette indices are the symbols LZW works on.",
    ),
    TF("GIF compression loses image quality.", false, "LZW is lossless."),
    M(
      "Which image does LZW compress best?",
      [
        "A flat logo with big colour blocks",
        "A noisy photograph full of detail",
        "A random-dot pattern of colours",
        "A grainy scanned page of texture",
      ],
      0,
      "Long repeated strings turn into single codes.",
    ),
    M(
      "18 identical pixels with a 4-colour palette become how many LZW codes?",
      ["6", "18", "1", "9"],
      0,
      "Codes cover 1, 2, 3, 4, 5 and then 3 pixels.",
      { hint: "Each new entry is one pixel longer than the last." },
    ),
    M(
      "The lecture's row AAAAAABBBCCCCCDDDD has how many pixels of each colour?",
      ["6 A, 3 B, 5 C, 4 D", "5 A, 4 B, 5 C, 4 D", "6 A, 4 B, 4 C, 4 D", "3 A, 3 B, 6 C, 6 D"],
      0,
      "Count each run.",
    ),
    M("That row compresses to how many codes?", ["11", "18", "6", "4"], 0, "1, 5, 6, 2, 8, 3, 10, 10, 4, 13, 4."),
    M(
      "A challenge for LZW in GIFs is…",
      [
        "highly detailed images with few repeats",
        "images with large flat areas of colour",
        "simple logos with solid colours",
        "small icons with flat colours",
      ],
      0,
      "Detail breaks up the repeats.",
    ),
    M(
      "Which is a typical use of GIFs?",
      [
        "web animations and simple logos",
        "high-quality photographs for print",
        "compressed audio tracks",
        "encrypted private messages",
      ],
      0,
      "Small, looping, flat-colour graphics.",
    ),
    M(
      "As the dictionary grows during a long GIF…",
      ["encoding can slow down", "the picture gets blurrier", "colours are removed", "decoding becomes impossible"],
      0,
      "More entries to search.",
    ),
    {
      type: "multi",
      q: "Select every benefit of LZW in GIFs.",
      o: [
        "smaller files for faster loading",
        "no loss of image quality",
        "unlimited colours",
        "efficient on repeated patterns",
      ],
      a: [0, 1, 3],
      why: "GIF is limited to a 256-colour palette, so unlimited colours is not a benefit.",
    },
  ]);
})();

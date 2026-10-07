/* boss-algo-p7-x: extra Phase 7 boss questions (Kraft, entropy sums, Huffman steps, LZW decoding, lossless versus lossy). */
(function () {
  const B = NIC.bossDef("a7-boss");
  if (!B) return;
  B.lede = "New distributions and new strings. Everything works with simple fractions, so no calculator is needed.";
  B.blurb =
    "Sixteen questions: entropy and Huffman on new distributions, Kraft's budget, LZW tracing, and what is lossless.";
  B.qs.push(
    {
      type: "mcq",
      q: "A designer proposes prefix codewords of length 1, 2, 2 and 3 bits for four symbols. Can such a prefix code exist?",
      o: [
        "Yes: the lengths are all at least one bit",
        "No: Σ 2⁻ˡ comes to 1.125, which is over the budget of 1",
        "Yes: the 3-bit word just has to avoid the others as a prefix",
        "No: a prefix code needs at least five symbols",
      ],
      a: 1,
      hint: "Add 2 to the power minus length: ½ + ¼ + ¼ + ⅛.",
      why: "Kraft's inequality needs Σ 2⁻ˡ ≤ 1. Here ½ + ¼ + ¼ + ⅛ = 1.125. The 1-bit word and the two 2-bit words already use the whole tree.",
    },
    {
      type: "slider",
      q: "A source sends five symbols with probabilities ½, ¼, ⅛, 1/16 and 1/16. Estimate its entropy.",
      min: 1,
      max: 3,
      step: 0.125,
      ans: 1.875,
      tol: 0.2,
      unit: " bits",
      hint: "−log₂ of ½, ¼, ⅛ and 1/16 are 1, 2, 3 and 4. Weight each by its probability and add.",
      why: "H = ½·1 + ¼·2 + ⅛·3 + 1/16·4 + 1/16·4 = 0.5 + 0.5 + 0.375 + 0.25 + 0.25 = <b>1.875</b> bits. All probabilities are powers of ½, so a Huffman code would hit this exactly.",
    },
    {
      type: "order",
      q: "Put the steps of Huffman's algorithm in the order they happen.",
      items: [
        "List the symbols with their probabilities",
        "Take the two smallest nodes in the queue",
        "Merge them into a parent holding the sum, and put it back in the queue",
        "Repeat until one node is left, then read the 0/1 labels from the root",
      ],
      why: "List first, then repeatedly pick the two smallest, merge and reinsert. When a single node remains it is the root, and the branch labels spell out the codewords.",
    },
    {
      type: "cat",
      q: "Sort each feature by the scheme it describes.",
      buckets: ["Huffman coding", "LZW"],
      items: [
        ["Needs the symbol frequencies counted before it starts", 0],
        ["Builds its dictionary while reading the data", 1],
        ["Every codeword is a leaf of a binary tree", 0],
        ["The decoder must begin at the start of the stream", 1],
        ["Used for the final lossless stage of JPEG", 0],
        ["Used to compress pixel indices in GIF images", 1],
      ],
      why: "Huffman is a dynamic model: count, build the tree, send the table. LZW is adaptive: both ends grow the same dictionary from the data, so decoding cannot join mid-stream. JPEG's final stage is Huffman; GIF uses LZW.",
    },
    {
      type: "bug",
      q: "This LZW decoder should rebuild a message, but it fails on codes <code>0 1 2 3</code> with alphabet a, b. Click the faulty line.",
      code: [
        "def lzw_decode(codes, D):",
        "    out = ''; p = ''",
        "    for s in codes:",
        "        if s < len(D): e = D[s]",
        "        else: e = p + p[-1]",
        "        if p: D.append(p + e[0])",
        "        out += e; p = e",
        "    return out",
      ],
      a: 4,
      why: 'An unknown code is the entry the encoder has just made: the previous string plus the <b>first</b> letter of the previous string, p + p[0]. For single letters the two coincide, but for p = "ab" the correct entry is aba, not abb.',
    },
    {
      type: "mcq",
      q: "Four symbols are equally likely. A coder built for the skewed model ½, ¼, ⅛, ⅛ uses codeword lengths 1, 2, 3, 3 on this uniform source. How does its average length compare with the best possible?",
      o: [
        "2.25 bits, which is 0.25 worse than a plain 2-bit fixed code",
        "1.75 bits, better than a fixed code because its lengths are shorter",
        "Exactly 2 bits, since the source is uniform",
        "3 bits, the longest codeword",
      ],
      a: 0,
      hint: "Each symbol is used a quarter of the time. Average the four lengths.",
      why: "L = ¼(1 + 2 + 3 + 3) = 2.25. The uniform source has H = 2, so the mismatch costs 0.25 bits per symbol: the code fits the wrong probabilities (the KL penalty).",
    },
    {
      type: "mcq",
      q: "An LZW decoder starts with a = 0 and b = 1 and receives the codes 0, 1, 2, 3. What is the decoded message?",
      o: ["ababba", "abab", "abbaab", "abcd"],
      a: 0,
      hint: "Code 2 is the entry made after reading 0 then 1. Code 3 is the entry made after reading 1 then 2.",
      why: "0 → a; 1 → b (add ab = 2); 2 → ab (add ba = 3); 3 → ba (add aba = 4). Joined: a + b + ab + ba = <b>ababba</b>.",
    },
    {
      type: "multi",
      q: "Select every step below that is <b>lossless</b> (the original can be rebuilt exactly).",
      o: [
        "Huffman coding of JPEG's coefficients",
        "LZW coding of GIF pixel indices",
        "JPEG's quantisation stage",
        "Rounding a neural codec's latents to integers",
      ],
      a: [0, 1],
      why: "Huffman and LZW only re-encode the data and can be reversed exactly. Quantisation in JPEG and rounding latents in a neural codec throw detail away on purpose, which is where the distortion comes from.",
    },
  );
  (NIC.modules || []).forEach((m) => {
    if (m.id === "a7-boss") {
      m.qCount = B.qs.length;
      m.blurb = B.blurb;
    }
  });
})();

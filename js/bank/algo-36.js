(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { growthFig, phraseFig } = partScope;
  const B = NIC.bank;

  B.add("a7-lzw", [
    {
      type: "pick",
      q: "Two 300-letter texts over A, B and C are encoded with LZW (starting dictionary A = 0, B = 1, C = 2). One text is ABCABCABC… repeated, the other is random letters. The chart shows how many codes each had produced after each stretch of input. Tap the curve for the repeating text.",
      fig: growthFig,
      a: "t1",
      hint: "Which text lets LZW reuse its dictionary entries more?",
      why: "In the repeating text the same phrases come round again and again, so each new entry is soon reused and later phrases get longer and longer: only 41 codes cover all 300 letters. The random text has fewer repeats, so its phrases stay short: 106 codes for the same 300 letters. Both climb more slowly than the input (LZW always gains a little), but the repeating text flattens far more.",
    },
    {
      type: "cat",
      q: "Sender and receiver use LZW and start with the dictionary A = 0, B = 1. Sort each item by how the receiver gets hold of it.",
      buckets: ["Agreed beforehand", "Sent as data", "Rebuilt by the decoder"],
      items: [
        ["The starting table: A = 0, B = 1", 0],
        ["The stream of code numbers, such as 0, 1, 2, 4", 1],
        ["Entry 2 = AB", 2],
        ["The fixed width of each code, say 12 bits", 0],
        ["Entry 4 = ABA", 2],
      ],
      why: "The starting table and the code width are fixed in advance, so nothing about them is sent. Only the code numbers travel. Every longer entry (AB, ABA and so on) is rebuilt by the decoder from the codes it has already read, by the same rule the encoder used, which is why LZW never has to ship a dictionary.",
    },
    {
      type: "order",
      q: "Each input has 12 letters over A, B, C and D (starting dictionary A = 0, B = 1, C = 2, D = 3). Put them in order from the FEWEST LZW codes to the MOST.",
      items: ["AAAAAAAAAAAA", "ABABABABABAB", "ABCDABCDABCD", "ABACABADABAC", "ADBCCABDBACD"],
      hint: "Repeats let LZW take bigger bites, so it needs fewer codes.",
      why: "AAAAAAAAAAAA: A | AA | AAA | AAAA | AA is 5 codes. ABABABABABAB: A | B | AB | ABA | BA | BAB is 6. ABCDABCDABCD: A | B | C | D | AB | CD | ABC | D is 8. ABACABADABAC: A | B | A | C | AB | A | D | ABA | C is 9. ADBCCABDBACD has almost no repeats, so it needs 11. The more the input repeats itself, the longer the phrases get.",
    },
    {
      type: "mcq",
      q: "Both rows hold six As and six Bs, so a Huffman code gives them the same size (12 bits). LZW (starting A = 0, B = 1) cut each row into the phrase boxes shown, one code per box. What does the comparison show?",
      fig: phraseFig,
      o: [
        "LZW uses the order of the letters as well as counts, so repeated patterns shrink and shuffled ones barely do",
        "LZW has a bigger dictionary than Huffman, so it wins whenever the letters are equally common",
        "Huffman reads patterns too, so it would also code Row 1 in fewer bits than Row 2",
        "LZW needs the letter counts first, and the counts are only clear in the patterned row",
      ],
      a: 0,
      why: "Huffman builds its code from letter counts alone, and both rows have six of each, so it cannot tell them apart. LZW grows phrases from what it has already seen: the patterned row becomes 6 codes because phrases keep getting longer, while the shuffled row needs 8 because few phrases repeat. Compression that uses order can find structure that counting misses.",
    },
  ]);
})();

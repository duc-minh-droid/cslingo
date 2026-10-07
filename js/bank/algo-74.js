/* js/bank/algo-78.js: revision questions ported from the vault. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a6-game", [
    M(
      "A secret number is 45. Which lists (by weight) say yes?",
      ["32, 8, 4 and 1", "32, 16 and 1", "16, 8, 4 and 1", "32, 8 and 2"],
      0,
      "45 = 32 + 8 + 4 + 1 (binary 101101).",
    ),
    M(
      "You answer yes to the lists weighted 1, 2 and 16 only. The number is…",
      ["13", "19", "21", "35"],
      1,
      "1 + 2 + 16 = 19.",
    ),
    M(
      "How many yes/no lists would you need to pin down a number from 1 to 1000?",
      ["8", "10", "100", "1000"],
      1,
      "$2^{10} = 1024$ covers 1000; $2^9 = 512$ does not.",
    ),
    M(
      "The secret is 5 (binary 000101). Someone lies on the weight-16 list. What number do you compute?",
      ["13", "21", "37", "4"],
      1,
      "5 is not in the weight-16 list, so a lie adds 16: 21.",
    ),
    M(
      "The secret is 12 (binary 001100). Someone lies on the weight-4 list. What number do you compute?",
      ["8", "10", "16", "20"],
      0,
      "12 is in the weight-4 list, so a lie removes 4: 8.",
    ),
    M(
      "Why does Hamming's code use exactly 3 check bits for 7 positions?",
      [
        "8 outcomes: no error plus 7 positions",
        "Three is the smallest odd number there is",
        "Each position needs its own separate check",
        "It is a convention with no real reason",
      ],
      0,
      "$2^3 = 8$ equals 7 + 1, so every outcome is used.",
    ),
    TF(
      "With six lists and no extra checks, you can always tell when one answer is a lie.",
      false,
      "A lie just produces a different, usually valid, number. Nothing warns you.",
    ),
    M(
      "Four check bits can identify a bad position among how many positions?",
      ["4", "8", "15", "16"],
      2,
      "$2^4 - 1 = 15$ positions, plus the no-error outcome.",
    ),
    {
      type: "cat",
      q: "Is the number in the weight-2 list (the numbers whose binary has a 1 in the 2s place)?",
      buckets: ["In the list", "Not in the list"],
      items: [
        ["3", 0],
        ["5", 1],
        ["6", 0],
        ["8", 1],
        ["11", 0],
      ],
      why: "3 = 11, 6 = 110 and 11 = 1011 have a 1 in the 2s place; 5 = 101 and 8 = 1000 do not.",
    },
    M(
      "Which of these numbers is in the weight-8 list?",
      ["7", "12", "16", "20"],
      1,
      "12 = 8 + 4. The others are 4 + 2 + 1, 16 and 16 + 4.",
    ),
    {
      type: "order",
      q: "Put the lists in order of the weight they carry, smallest first.",
      items: ["List 1", "List 2", "List 3", "List 4"],
      why: "Weights are 1, 2, 4 and 8, doubling each time.",
    },
  ]);

  B.add("a6-matrix", [
    M(
      "How many rows and columns does the Hamming(7,4) generator matrix G have?",
      ["7 rows, 4 columns", "4 rows, 7 columns", "3 rows, 7 columns", "7 rows, 3 columns"],
      0,
      "One row per codeword bit, one column per data bit.",
    ),
    M(
      "How many rows and columns does the parity-check matrix H have?",
      ["3 rows, 7 columns", "7 rows, 3 columns", "4 rows, 7 columns", "3 rows, 4 columns"],
      0,
      "One row per parity check, one column per codeword position.",
    ),
    M(
      "Which column of H is [1, 0, 1] (top to bottom: Bit 1, Bit 2, Bit 4)?",
      ["Column 3", "Column 4", "Column 5", "Column 6"],
      2,
      "Column 5: the number 5 is binary 101, with the 1s place on top.",
    ),
    M("H · R = [0, 0, 1]. Which position is wrong?", ["1", "2", "4", "7"], 2, "0·1 + 0·2 + 1·4 = 4."),
    M(
      "D = [1, 1, 0, 0]. What is R = G · D?",
      ["0111100", "1100000", "0011100", "0110011"],
      0,
      "p1 = 1⊕1⊕0 = 0, p2 = 1⊕0⊕0 = 1, p3 = 1⊕0⊕0 = 1; data bits go to positions 3, 5, 6, 7: 0111100.",
    ),
    M(
      "The corrected word R = 0110011. What does D = M · R give?",
      ["0110", "1011", "0011", "1100"],
      1,
      "M picks positions 3, 5, 6, 7: 1, 0, 1, 1.",
    ),
    TF("Multiplying H by G gives the all-zero matrix (mod 2).", true, "That is why every codeword gives E = 0."),
    {
      type: "match",
      q: "Match each matrix to its job.",
      pairs: [
        ["G", "Encodes 4 data bits into 7"],
        ["H", "Gives the position of a flipped bit"],
        ["M", "Picks the data bits out of the codeword"],
      ],
      why: "Generator, parity-check and decoding matrix.",
    },
    M(
      "Two codewords are each hit by a flip at position 6. Their syndromes are…",
      ["the same, [0, 1, 1]", "different, because the data differ", "both [0, 0, 0]", "[1, 1, 0] and [0, 1, 1]"],
      0,
      "E = H·(codeword + error) = H·error = column 6 of H, whatever the data.",
    ),
    {
      type: "multi",
      q: "Which statements about Hamming(7,4) matrices are true? Select all that apply.",
      o: [
        "Column j of H is j written in binary",
        "G has 4 rows and 7 columns",
        "M picks the bits at positions 3, 5, 6 and 7",
        "E = 000 means no single error was found",
      ],
      a: [0, 2, 3],
      why: "G is 7 × 4 (not 4 × 7). The rest are exactly how H, M and the syndrome work.",
    },
    M(
      "What does the lecture say the encoding step R = G · D costs?",
      [
        "Proportional to the number of bits in each codeword",
        "Proportional to the number of data bits squared",
        "Constant, regardless of codeword size",
        "Exponential in the number of parity bits",
      ],
      0,
      "It is O(N), N being the number of bits in each codeword.",
    ),
  ]);
})();

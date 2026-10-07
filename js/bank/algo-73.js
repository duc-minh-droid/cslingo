/* js/bank/algo-77.js: revision questions ported from the vault. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a6-crcpoly", [
    M(
      "Which polynomial does the bit string 1101 represent?",
      ["$x^3+x^2+1$", "$x^3+x+1$", "$x^4+x^2+1$", "$x^3+x^2+x$"],
      0,
      "Bits 1, 1, 0, 1 sit on $x^3, x^2, x^1, x^0$; the $x^1$ term is missing.",
    ),
    M(
      "A generator polynomial has degree 7. How many CRC check bits does it produce?",
      ["6", "7", "8", "15"],
      1,
      "Degree $r$ gives $r$ check bits (and an $(r+1)$-bit generator).",
    ),
    M(
      "Which bit string is the generator $x^6+x^3+x+1$?",
      ["1001011", "1010011", "1100101", "1001101"],
      0,
      "Powers 6, 3, 1 and 0 are present: 1 0 0 1 0 1 1.",
    ),
    M(
      "The message 1101 is shifted left by 3 places to 1101000. As a polynomial, that is…",
      ["$x^6+x^5+x^3$", "$x^3+x^2+1$", "$x^6+x^5+x^4$", "$x^4+x^3+x$"],
      0,
      "1101 is $x^3+x^2+1$; multiplying by $x^3$ gives $x^6+x^5+x^3$.",
    ),
    M(
      "CRC-CCITT uses $x^{16}+x^{12}+x^5+1$. How many bits long is its generator bit string?",
      ["16", "17", "18", "33"],
      1,
      "A degree-16 polynomial has 17 coefficients.",
    ),
    TF(
      "The generator $x+1$ (bits 11) gives exactly the parity bit of the message.",
      true,
      "Dividing by $x+1$ leaves the XOR of all message bits.",
    ),
    M(
      "A message 1001 is protected with the generator 11. What is the single CRC bit?",
      ["0", "1"],
      0,
      "It equals the parity: two 1s, so 0.",
    ),
    M(
      "Why does the receiver expect remainder 0 from a clean frame?",
      [
        "The frame is $M x^r + R$, an exact multiple of $P$",
        "The generator is always shorter than the message",
        "Division by $P$ never leaves a remainder",
        "The CRC bits are removed before dividing",
      ],
      0,
      "Adding the remainder to the shifted message makes the whole thing divisible by $P$.",
    ),
    {
      type: "cat",
      q: "A degree-16 CRC such as CRC-CCITT. Which errors does the lecture say are always caught?",
      buckets: ["Always caught", "Not guaranteed"],
      items: [
        ["Any single-bit error", 0],
        ["A burst of 12 bits", 0],
        ["Any odd number of flipped bits", 0],
        ["Every burst of 40 bits", 1],
      ],
      why: "Bursts up to 16 bits and all odd-count errors are guaranteed; longer bursts are caught only with high probability (99.998%).",
    },
    M(
      "What do the polynomial rules buy us over plain bit tricks?",
      [
        "Shifts become multiplications, checks divisions",
        "Messages become shorter on the wire",
        "Errors can be repaired directly from it",
        "The generator can be kept secret",
      ],
      0,
      "Algebra gives exact tools to describe and analyse encoding and decoding.",
    ),
    M(
      "A burst error is…",
      [
        "a run whose first and last bits are wrong",
        "any two flipped bits in the same frame",
        "a frame that is lost entirely in transit",
        "an error that only the parity bit can find",
      ],
      0,
      "The bits between the first and last wrong ones may or may not be wrong.",
    ),
  ]);

  B.add("a6-distance", [
    M(
      "What is the Hamming distance between 1011 and 1101?",
      ["1", "2", "3", "4"],
      1,
      "They differ at positions 2 and 3 only.",
    ),
    M(
      "What is the Hamming distance between 0000000 and 1110100?",
      ["3", "4", "5", "7"],
      1,
      "1110100 has four 1s, and the distance to all zeros is the number of 1s.",
    ),
    M(
      "The repetition code sends 000 for 0 and 111 for 1. The receiver sees 011. It decodes…",
      ["0", "1", "an error flag", "either, at random"],
      1,
      "Majority vote: two 1s against one 0.",
    ),
    M(
      "A code's minimum distance is 3. How many errors can it always correct?",
      ["0", "1", "2", "3"],
      1,
      "⌊(3 − 1)/2⌋ = 1.",
    ),
    M(
      "A code's minimum distance is 6. Up to how many errors can it always detect?",
      ["2", "3", "5", "6"],
      2,
      "It detects up to d − 1 = 5 errors.",
    ),
    M(
      "Sending each bit 7 times gives a rate of 1/7. How many flips per group can it always repair?",
      ["1", "2", "3", "6"],
      2,
      "Distance 7 corrects ⌊6/2⌋ = 3 flips.",
    ),
    TF(
      "The Hamming distance between two words equals the number of 1s in their XOR.",
      true,
      "A 1 in a ⊕ b marks exactly a position where they differ.",
    ),
    {
      type: "cat",
      q: "Repeat-3 sends the first word. The receiver sees the second. Is it decoded correctly?",
      buckets: ["Correct", "Wrong"],
      items: [
        ["Sent 000, got 010", 0],
        ["Sent 111, got 101", 0],
        ["Sent 000, got 110", 1],
        ["Sent 111, got 001", 1],
      ],
      why: "One flip is outvoted. Two flips hand the majority to the wrong value, silently.",
    },
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Codeword", "A valid element of the code"],
        ["Hamming distance", "Positions where two words differ"],
        ["Forward error correction", "Redundancy added so the receiver can repair errors"],
        ["Modulo-2 arithmetic", "Every result reduced mod 2, so addition is XOR"],
      ],
      why: "The four definitions from the lecture.",
    },
    M(
      "What is the main drawback of the repetition code?",
      [
        "It cannot correct any error",
        "Its rate is only 1/n, which wastes bandwidth",
        "It needs a return channel",
        "It only works for even numbers of bits",
      ],
      1,
      "Three copies give rate 1/3; cleverer codes protect with far fewer extra bits.",
    ),
    M(
      "A parity code (valid words have an even number of 1s) has minimum distance 2. It can…",
      ["detect 1 error and correct none", "correct 1 error", "detect 2 errors and correct 1", "detect none"],
      0,
      "Distance 2 gives d − 1 = 1 detected and ⌊1/2⌋ = 0 corrected.",
    ),
    {
      type: "order",
      q: "Order these codes from fewest to most errors they can always correct.",
      items: ["Minimum distance 1", "Minimum distance 3", "Minimum distance 5", "Minimum distance 7"],
      why: "They correct 0, 1, 2 and 3 errors: ⌊(d − 1)/2⌋.",
    },
  ]);
})();

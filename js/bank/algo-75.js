/* js/bank/algo-79.js: revision questions ported from the vault. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a6-codes", [
    M(
      "A Hamming code has 5 check bits. How many bits is its codeword, and how many carry data?",
      ["31 bits, 26 data", "32 bits, 27 data", "15 bits, 10 data", "25 bits, 20 data"],
      0,
      "$2^5 - 1 = 31$ positions and $31 - 5 = 26$ data bits.",
    ),
    M(
      "Roughly what is the code rate of Hamming(15,11)?",
      ["about 0.4", "about 0.7", "about 1.4", "exactly 1"],
      1,
      "11/15 is about 0.73.",
    ),
    {
      type: "cat",
      q: "Which kind of code does each property describe?",
      buckets: ["Detection", "Correction"],
      items: [
        ["Needs a retransmission", 0],
        ["Required when there is no feedback channel", 1],
        ["Simpler codes", 0],
        ["Repairs the data itself", 1],
      ],
      why: "Detection codes are simple but ask for a resend; correction codes are cleverer and work one-way.",
    },
    {
      type: "match",
      q: "Match each code family to its year and feature.",
      pairs: [
        ["Reed-Solomon", "1960, symbols, CDs and QR codes"],
        ["LDPC", "1960, Gallager, sparse bipartite graph"],
        ["Turbo codes", "1990-91, first practical near-capacity codes"],
      ],
      why: "Reed-Solomon and LDPC are both from 1960; turbo codes came 30 years later.",
    },
    M(
      "Which code family was the first practical one to approach the channel capacity?",
      ["Turbo codes", "Parity bits", "Repetition codes", "Hamming(7,4)"],
      0,
      "Turbo codes, developed in 1990-91, used in 3G/4G and deep space.",
    ),
    M(
      "What does SECDED add to a Hamming code?",
      [
        "An overall parity bit: distance 4",
        "A second syndrome, giving distance 6 overall",
        "A CRC computed over every block",
        "Nothing at all: it only renames the code",
      ],
      0,
      "Single-error correcting, double-error detecting.",
    ),
    TF(
      "Longer Hamming blocks have a higher rate but are more likely to suffer two flips in one block.",
      true,
      "Efficiency rises with block length, but so does the chance of an unrepairable double hit.",
    ),
    M(
      "RAID 6 disk arrays rely on which family of codes?",
      ["Reed-Solomon", "Parity bit only", "Repetition", "Gray codes"],
      0,
      "Reed-Solomon is also in CDs, DVDs, Blu-ray, QR codes and DVB.",
    ),
    M(
      "Wi-Fi and DVB-S2 use which family?",
      ["LDPC", "Hamming(7,4)", "Run-length", "Simple parity"],
      0,
      "Low-density parity-check codes built on sparse graphs.",
    ),
    M(
      "Three check bits can point at how many positions?",
      ["3", "7", "8", "9"],
      1,
      "$2^3 - 1 = 7$ positions, plus the no-error outcome.",
    ),
    {
      type: "multi",
      q: "Where are Reed-Solomon codes used? Select all that apply.",
      o: ["CDs and DVDs", "QR codes", "RAID 6 storage", "Ethernet's frame check sequence"],
      a: [0, 1, 2],
      why: "Ethernet's frame check is a CRC, which only detects.",
    },
  ]);

  // ---- top-ups for the deepened modules ----
  B.add("a6-crc", [
    M(
      "Generator 1011, message 1100. Append three zeros and divide. The check bits are…",
      ["010", "101", "110", "001"],
      0,
      "1100000 ⊕ 1011... leaves 010; the frame sent is 1100010.",
      { hint: "1100 ⊕ 1011 = 0111, so bring the next bit down and keep going." },
    ),
    M(
      "The lecture's bitwise CRC loop runs for N + r steps. For an 8-bit message and a degree-4 generator, how many?",
      ["8", "4", "12", "32"],
      2,
      "N + r = 8 + 4 = 12: the message bits plus r padding zeros.",
    ),
    M(
      "When the bit shifted out of the register is 1, the register is XORed with…",
      [
        "the last r bits of the generator",
        "the whole message read as a number",
        "the next message bit to arrive",
        "its own previous value, shifted back",
      ],
      0,
      "That is the feedback of the shift register: XOR with P without its leading 1.",
    ),
    M(
      "A receiver feeds a received frame through the register with no padding and finishes at 000. This means…",
      ["no error was detected", "exactly one bit flipped", "the frame is empty", "an even number of bits flipped"],
      0,
      "A clean frame is divisible by the generator, so the remainder is zero.",
    ),
    M(
      "In the shift-register diagram, a plain wire between two cells means the generator coefficient there is…",
      ["0", "1", "2", "undefined"],
      0,
      "A bit that is simply shifted along has coefficient 0; an XOR gate marks a coefficient of 1.",
    ),
    M(
      "A frame is 7 bits and its generator 1101. Flip any single bit. The remainder is…",
      ["always non-zero", "sometimes zero", "always zero", "always 111"],
      0,
      "1101 has a constant term, so it never divides a single power of x.",
    ),
  ]);
  B.add("a6-hamming", [
    M(
      "Hamming(7,4): data 1100 (d1 = 1, d2 = 1, d3 = 0, d4 = 0). The codeword p1 p2 d1 p3 d2 d3 d4 is…",
      ["0111100", "1100110", "1100000", "0011100"],
      0,
      "p1 = 1⊕1⊕0 = 0, p2 = 1⊕0⊕0 = 1, p3 = 1⊕0⊕0 = 1.",
    ),
    M("For data 0111, what is p3 = d2 ⊕ d3 ⊕ d4?", ["0", "1"], 1, "1 ⊕ 1 ⊕ 1 = 1 (three 1s)."),
    M(
      "The word 0001000 arrives. What does the decoder do?",
      [
        "Flips position 4, recovering data 0000",
        "Flips position 1, giving data 1000 instead",
        "Reports no error and passes it through",
        "Flips positions 4 and 7 together",
      ],
      0,
      "Only the p3 group (4, 5, 6, 7) fails: syndrome 100 = 4. The corrected word is all zeros.",
    ),
    M(
      "In the three-circle picture, a flipped d3 violates which circles?",
      ["p2 and p3", "p1 and p2", "p1 and p3", "all three"],
      0,
      "d3 sits in the overlap of circles p2 and p3 only.",
    ),
    M(
      "How many different codewords does Hamming(7,4) have?",
      ["4", "7", "16", "128"],
      2,
      "Four data bits give $2^4 = 16$ codewords.",
    ),
    TF(
      "Any two Hamming(7,4) codewords differ in at least 3 positions.",
      true,
      "That minimum distance of 3 is what lets a single flip be repaired.",
    ),
  ]);
})();

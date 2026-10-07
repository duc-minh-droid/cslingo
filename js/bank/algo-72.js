/* js/bank/algo-76.js: revision questions ported from the vault. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("a6-noise", [
    M(
      "A sender is moved from 1 km to 3 km away. The received power becomes…",
      ["a third of before", "a ninth of before", "a sixth of before", "three times as large"],
      1,
      "Power ∝ 1 / distance², so 3 times as far gives 1/9.",
    ),
    M(
      "A scheme sends 5 data bits plus 3 check bits. Its code rate is…",
      ["3/8", "5/3", "5/8", "8/5"],
      2,
      "Rate = data bits / bits sent = 5/8.",
    ),
    {
      type: "cat",
      q: "Which approach suits each link better?",
      buckets: ["Detect and resend", "Correct on arrival"],
      items: [
        ["Downloading an app update over broadband", 0],
        ["A live sports stream", 1],
        ["Radio broadcast to car stereos", 1],
        ["Fetching a web page that can simply be reloaded", 0],
      ],
      why: "Resending is fine when there is a return path and time to spare. Live and one-way links must repair errors on arrival.",
    },
    M(
      "ARQ stands for…",
      [
        "Automatic Repeat reQuest",
        "Adaptive Redundancy Quotient",
        "Alternating Rate Queue",
        "Asynchronous Receive Query",
      ],
      0,
      "The receiver asks for a repeat after a failed check.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["NAK", "The receiver reports a failed check"],
        ["ACK", "The receiver confirms a good frame"],
        ["Simplex link", "One-way only, no feedback channel"],
        ["FEC", "Redundancy lets the receiver repair errors itself"],
      ],
      why: "Negative and positive acknowledgements drive ARQ; simplex links cannot use them, so they rely on FEC.",
    },
    TF(
      "Compression adds redundancy so that errors can be repaired.",
      false,
      "Compression removes redundancy. Error coding is what adds a controlled amount back.",
    ),
    {
      type: "multi",
      q: "Which statements are true? Select all that apply.",
      o: [
        "Reverse error correction only detects errors",
        "Forward error correction lets the receiver repair data",
        "ARQ needs a way for the receiver to reply",
        "Forward error correction needs a return channel",
      ],
      a: [0, 1, 2],
      why: "REC detects and asks for a resend (needs a reply). FEC repairs in place and works one-way.",
    },
    {
      type: "order",
      q: "Order what happens when ARQ meets a corrupted frame.",
      items: [
        "Noise flips a bit in transit",
        "The receiver's check fails",
        "The receiver sends a NAK",
        "The sender retransmits the frame",
      ],
      why: "Corruption, failed check, NAK, then the resend.",
    },
    M(
      "Why is detect-and-resend a poor fit for a live video call?",
      [
        "A resend usually arrives after its frame is due",
        "Video frames cannot carry parity bits at all",
        "Resending always corrupts the data again",
        "The sender cannot store frames for later",
      ],
      0,
      "Real-time data is useless once late, so repairs must happen immediately.",
    ),
    M(
      "As noise rises, which cost grows in a detect-and-resend scheme?",
      [
        "The number of check bits in each frame",
        "The average number of transmissions per frame",
        "The length of the generator",
        "The code rate",
      ],
      1,
      "Every failed check triggers another send; the frame format itself does not change.",
    ),
    M(
      "Which pair is a correct source, medium, destination example from the lecture?",
      ["Printer, QR code, phone camera", "Phone camera, QR code, printer", "RAM, keyboard, disk", "Disk, RAM, CD"],
      0,
      "A printer makes the code, the printed QR code carries the data, and the phone camera reads it.",
    ),
  ]);

  B.add("a6-parity", [
    M("What is 1 ⊕ 0 ⊕ 1 ⊕ 1?", ["0", "1", "2", "3"], 1, "Three 1s is an odd count, so the XOR is 1."),
    M(
      "Seven data bits 1110001. What even-parity bit completes the byte?",
      ["0", "1"],
      0,
      "Four 1s is already even, so the parity bit is 0.",
    ),
    M(
      "Odd parity is used on the seven bits 0000000. Which parity bit is sent?",
      ["0", "1"],
      1,
      "There are no 1s, so one is needed to make the total odd.",
    ),
    {
      type: "multi",
      q: "An even-parity byte is hit by noise. For which numbers of flipped bits does the receiver notice? Select all that apply.",
      o: ["1", "2", "3", "4", "6"],
      a: [0, 2],
      why: "Odd numbers of flips change the parity; even numbers cancel.",
    },
    M(
      "A receiver using even parity gets 10110101. What does it conclude?",
      ["The byte is fine", "Corrupted: five 1s is an odd count", "Corrupted: it has more 1s than 0s", "It cannot tell"],
      1,
      "1+0+1+1+0+1+0+1 gives five 1s, which breaks even parity.",
    ),
    TF(
      "A parity bit tells the receiver which bit was flipped.",
      false,
      "It only reveals that an odd number of bits changed, never where.",
    ),
    {
      type: "cat",
      q: "Even parity. Which flip counts does the receiver catch?",
      buckets: ["Caught", "Missed"],
      items: [
        ["1 flipped bit", 0],
        ["2 flipped bits", 1],
        ["3 flipped bits", 0],
        ["4 flipped bits", 1],
        ["5 flipped bits", 0],
      ],
      why: "Odd counts break the parity; even counts keep it.",
    },
    M(
      "Which 7-bit word needs a parity bit of 1 under even parity?",
      ["1100110", "1000100", "1101000", "1011010"],
      2,
      "1101000 has three 1s (odd), so a 1 is added. The others have four, two and four 1s.",
    ),
    M(
      "Two adjacent bits flip in a parity-protected byte. The error is…",
      [
        "detected, since the bits are next to each other",
        "missed, since an even number flipped",
        "corrected by the parity bit",
        "detected only if both flips are 1 to 0",
      ],
      1,
      "Parity counts flips, not positions. Any even number cancels out.",
    ),
    M(
      "The lecture asks 'how can we detect more bit errors?' after parity. What is the answer it gives?",
      [
        "Add a second parity bit to each byte",
        "Use a cyclic redundancy check",
        "Send every byte twice in a row",
        "Use a longer ASCII code with more bits",
      ],
      1,
      "A CRC divides the message by a generator and sends the remainder.",
    ),
    M(
      "What does the XOR of two equal bits give?",
      ["0", "1", "the bit itself", "it depends on the bit"],
      0,
      "XOR is 1 only when the inputs differ.",
    ),
  ]);
})();

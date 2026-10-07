/* ===== bank-w-algo-3.js ===== */
/* ALGO revision bank, second set of visual and varied questions, part 3 (Phases 6 to 10).
   Every number was produced by running the real algorithms in node (CRC division, LZW, entropy, SHA-256, DFT). */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const B = NIC.bank;

  /* ---------- tiny SVG helpers (CSS variables so both themes work) ---------- */
  const SVG = (w, h, inner, label) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto" role="img" aria-label="${label}">${inner}</svg>`;
  const TX = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" fill="${o.f || "var(--text)"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "ui-monospace,Consolas,monospace" : "var(--sans)"}">${s}</text>`;
  const RC = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r == null ? 8 : o.r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const LN = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });

  /* ==================== a6-crc ==================== */
  // four corrupted copies of the valid frame 1101011110; flipped bits shown in red
  const crcFramesFig = (() => {
    const sent = "1101011110";
    const rows = [
      ["B", "1101111110"],
      ["C", "1100000110"],
      ["D", "1110111110"],
      ["E", "0110011110"],
    ];
    let s = TX(8, 20, "Sent: " + sent + "  (generator 1011)", { a: "start", m: 1, s: 13 });
    rows.forEach(([id, bits], r) => {
      const y = 36 + r * 40;
      let cells = "";
      for (let i = 0; i < 10; i++) {
        const bad = bits[i] !== sent[i];
        cells +=
          RC(70 + i * 30, y, 26, 30, {
            r: 6,
            f: bad ? "var(--rose)" : "var(--panel)",
            fo: bad ? 0.28 : 1,
            k: bad ? "var(--rose)" : "var(--line-2)",
          }) + TX(83 + i * 30, y + 21, bits[i], { m: 1, s: 15 });
      }
      s += PK(
        id,
        RC(2, y - 4, 376, 38, { r: 8, f: "var(--panel)", k: "transparent", w: 1 }) +
          TX(36, y + 21, "Copy " + id, { s: 13 }) +
          cells,
      );
    });
    return SVG(380, 200, s, "Four received copies of a CRC frame with the flipped bits marked in red");
  })();
  // long division by 11
  const crc11Fig = SVG(
    300,
    124,
    TX(150, 18, "Message 1011 plus one zero, divided by 11", { s: 13 }) +
      ["10110 ⊕ 11000 = 01110", "01110 ⊕ 01100 = 00010", "00010 ⊕ 00011 = 00001"]
        .map((t, i) => TX(150, 46 + i * 24, t, { m: 1, s: 15 }))
        .join("") +
      TX(150, 116, "Remainder: 1", { f: "var(--teal)", s: 15 }),
    "XOR long division of 10110 by 11 leaving remainder 1",
  );

  B.add("a6-crc", [
    {
      type: "pick",
      q: "The receiver checks every frame by dividing by the generator 1011. All four copies below were corrupted in transit (the flipped bits are red). Which TWO would the receiver wrongly accept?",
      fig: crcFramesFig,
      a: ["C", "E"],
      hint: "A frame passes if the error pattern divides evenly by 1011. Look at what the red bits spell.",
      why: "Copies C and E have a red pattern of exactly 1011 (shifted along the frame). The error is then a multiple of the generator, so the remainder stays 000 and the damage is invisible. B (one flip) and D (a 3-bit burst, 111) are not multiples of 1011, so the check fails and the receiver notices.",
    },
    {
      type: "mcq",
      q: "A CRC uses the tiny 2-bit generator 11. The working shows its remainder for the message 1011. What is this CRC really doing?",
      o: [
        "Making an even-parity bit",
        "Building a 2D parity grid",
        "Computing a Hamming syndrome",
        "Always returning zero",
      ],
      a: 0,
      fig: crc11Fig,
      why: "Dividing by 11 (that is, x + 1) leaves 1 when the number of 1s is odd and 0 when it is even. That is exactly the even-parity bit. A longer generator checks more patterns, so parity is just the smallest CRC.",
      hint: "1011 has three 1s. Is that odd or even?",
    },
    {
      type: "slider",
      q: "A link uses a CRC with a 3-bit remainder. Total garbage arrives instead of a real frame, so every remainder is equally likely. Out of 100 such junk frames, about how many are wrongly accepted?",
      min: 0,
      max: 50,
      step: 1,
      ans: 12,
      tol: 3,
      unit: " frames",
      why: "Junk lands on remainder 000 with probability 1 in 2³ = 1 in 8, which is about 12 in 100. This is why real CRCs use 16 or 32 bits: the chance of slipping through is 1 in 65,536 or 1 in 4 billion.",
    },
    {
      type: "match",
      q: "Match each error-checking scheme to what it can do.",
      pairs: [
        ["One parity bit", "Spots any odd number of flips"],
        ["2D parity grid", "Finds a flip where a failing row meets a failing column"],
        ["CRC with a 4-bit generator", "Catches every burst of up to 3 flipped bits in a row"],
        ["Hamming(7,4)", "Reads the position of one flip straight from the syndrome"],
      ],
      why: "A single parity bit counts 1s, so even numbers of flips cancel. The grid crosses a bad row with a bad column. A CRC's remainder is sensitive to short bursts. Hamming's three overlapping checks spell out the position in binary.",
    },
    {
      type: "bug",
      q: "The sender should append a CRC so that the whole frame divides evenly by the generator. The receiver keeps rejecting good frames. Click the faulty line.",
      code: ["def send(msg, gen):", "    k = len(gen) - 1", "    rem = mod2(msg, gen)", "    return msg + rem"],
      a: 2,
      why: 'The remainder must be computed on the message with k zeros appended: mod2(msg + "0" * k, gen). Without the zeros, the remainder is about the wrong number, and the finished frame no longer divides evenly.',
    },
  ]);

  /* ==================== a6-hamming ==================== */
  // which of the three groups failed, no binary given
  const hamGroupFig = (() => {
    const groups = [
      ["p1", [1, 3, 5, 7], false],
      ["p2", [2, 3, 6, 7], true],
      ["p4", [4, 5, 6, 7], true],
    ];
    let s = TX(8, 16, "Bit position", { a: "start", s: 12, f: "var(--text-2, var(--text))" });
    for (let i = 1; i <= 7; i++)
      s += PK("c" + i, RC(46 + (i - 1) * 46, 24, 40, 34, { r: 8 }) + TX(66 + (i - 1) * 46, 47, i, { s: 16 }));
    groups.forEach(([n, mem, fail], r) => {
      const y = 92 + r * 38;
      s += TX(8, y + 5, n + " group", { a: "start", s: 13 });
      for (let i = 1; i <= 7; i++)
        s += mem.includes(i)
          ? `<circle cx="${66 + (i - 1) * 46}" cy="${y}" r="9" fill="var(--blue)"/>`
          : `<circle cx="${66 + (i - 1) * 46}" cy="${y}" r="3" fill="var(--line-2)"/>`;
      s += TX(396, y + 5, fail ? "✗ fails" : "✓ ok", { a: "start", s: 13, f: fail ? "var(--rose)" : "var(--teal)" });
    });
    return SVG(450, 188, s, "Seven bit positions with the groups p1, p2 and p4; p2 and p4 fail, p1 passes");
  })();
  // 3-bit repetition code drawn as a path of single flips
  const hamPathFig = (() => {
    const w = ["000", "100", "110", "111"];
    let s =
      TX(60, 26, "codeword A", { f: "var(--teal)", s: 13 }) + TX(360, 26, "codeword B", { f: "var(--teal)", s: 13 });
    w.forEach((t, i) => {
      const x = 20 + i * 100,
        cw = i === 0 || i === 3;
      s += PK(
        "w" + i,
        RC(x, 36, 80, 38, { r: 10, k: cw ? "var(--teal)" : "var(--line-2)" }) + TX(x + 40, 61, t, { m: 1, s: 18 }),
      );
      if (i < 3)
        s +=
          TX(x + 90, 60, "→", { s: 18, f: "var(--text-2, var(--text))" }) +
          TX(x + 90, 92, "1 flip", { s: 11, f: "var(--text-2, var(--text))" });
    });
    return SVG(
      420,
      104,
      s,
      "A line of four words: codeword A is 000, then 100, 110, and codeword B is 111, each one flip apart",
    );
  })();

  B.add("a6-hamming", [
    {
      type: "pick",
      q: "A Hamming(7,4) receiver checks its three groups (blue dots show who is in each). Groups p2 and p4 fail and p1 passes. Exactly one bit flipped. Tap it.",
      fig: hamGroupFig,
      a: "c6",
      hint: "The flipped bit sits in every failing group and in no passing group.",
      why: "Position 6 is the only one in both p2 and p4 and outside p1. Positions 2 and 4 would fail only one group each, and 7 would also fail p1. Reading failing groups as 1s (p4 p2 p1 = 110) gives 6 in binary, the same answer.",
    },
    {
      type: "pick",
      q: "In this 3-bit repetition code the codewords are A = 000 and B = 111, so they differ in 3 places. The receiver decodes to whichever codeword is nearest. Tap every received word that gets decoded as A.",
      fig: hamPathFig,
      a: ["w0", "w1"],
      why: "000 is A itself, and 100 is one flip from A but two from B, so it decodes to A. But 110 is one flip from B, so it decodes to B: two flips fool the decoder. A distance of 3 can therefore fix one error, and Hamming(7,4) has the same minimum distance of 3.",
    },
    {
      type: "cat",
      q: "Hamming(7,4) is extended with one extra overall-parity bit (SECDED). What happens to the decoded data in each case?",
      buckets: ["Fixed correctly", "Flagged, can't be fixed", "Silently decoded wrong"],
      items: [
        ["One data bit flips", 0],
        ["One check bit flips", 0],
        ["Only the extra parity bit flips", 0],
        ["Two bits flip", 1],
        ["Three bits flip", 2],
      ],
      why: "One flip is always located and fixed, even when it hits a check bit or the extra bit (the data is untouched). Two flips leave the overall parity looking fine but the syndrome non-zero, so the decoder shouts for a resend. Three flips look like one, so the decoder confidently flips the wrong bit.",
    },
    {
      type: "slider",
      q: "A Hamming code protects a block of 127 bits using 7 check bits, and the rest are data. About what percentage of the block is check bits?",
      min: 0,
      max: 50,
      step: 1,
      ans: 6,
      tol: 2,
      unit: "%",
      hint: "7 out of 127 is about 7 out of 130, which is 1 out of 19.",
      why: "7 / 127 ≈ 5.5%. Check bits grow only as log₂ of the block size, so big Hamming blocks are cheap. Compare Hamming(7,4), where 3 of 7 bits (43%) are checks.",
    },
    {
      type: "bug",
      q: "This Hamming(7,4) decoder should compute the syndrome as p4 p2 p1 in binary, but it names the wrong position for some errors. Click the faulty line.",
      code: [
        "def syndrome(w):",
        "    s = 0",
        "    if w[1]^w[3]^w[5]^w[7]: s += 1",
        "    if w[2]^w[3]^w[6]^w[7]: s += 2",
        "    if w[4]^w[5]^w[6]^w[7]: s += 2",
        "    return s",
      ],
      a: 4,
      why: "The p4 group should add 4, the value of the 4s place. With 2 added, errors in positions 4 to 7 point at the wrong place, and an error at position 4 would be read as position 2.",
    },
  ]);

  /* ==================== a7-entropy ==================== */
  const bars4 = (x, y, p, w, h, f) =>
    p
      .map((v, i) => {
        const bh = Math.max(2, v * h);
        return RC(x + i * (w / 4) + 3, y + h - bh, w / 4 - 8, bh, {
          r: 3,
          f: f || "var(--blue)",
          k: f || "var(--blue)",
          w: 1,
        });
      })
      .join("");
  const entBarsFig = (() => {
    const p = [0.5, 0.25, 0.125, 0.125];
    let s = bars4(60, 20, p, 220, 100);
    p.forEach((v, i) => {
      s += TX(60 + i * 55 + 27, 138, "ABCD"[i], { s: 14 }) + TX(60 + i * 55 + 27, 16 + 100 - v * 100 - 4, v, { s: 12 });
    });
    s += LN(54, 120, 286, 120);
    return SVG(340, 150, s, "Bar chart of four symbol probabilities: A 0.5, B 0.25, C 0.125, D 0.125");
  })();
  const entPickFig = (() => {
    const src = [
      ["P", [0.25, 0.25, 0.25, 0.25]],
      ["Q", [0.4, 0.3, 0.2, 0.1]],
      ["R", [0.7, 0.1, 0.1, 0.1]],
      ["S", [0.3, 0.3, 0.2, 0.2]],
    ];
    let s = "";
    src.forEach(([n, p], i) => {
      const x = 8 + (i % 2) * 190,
        y = 6 + Math.floor(i / 2) * 124;
      s += PK(
        n,
        RC(x, y, 178, 114, { r: 10 }) +
          TX(x + 89, y + 18, "Source " + n, { s: 13 }) +
          bars4(x + 14, y + 28, p, 150, 66) +
          LN(x + 14, y + 94, x + 164, y + 94, { w: 1 }) +
          [0, 1, 2, 3].map((k) => TX(x + 14 + k * 37.5 + 18, y + 108, "ABCD"[k], { s: 11 })).join(""),
      );
    });
    return SVG(380, 256, s, "Four bar charts of probabilities over four symbols for sources P, Q, R and S");
  })();

  B.add("a7-entropy", [
    {
      type: "slider",
      q: "I secretly pick one of four symbols with the chances shown. You ask the best possible yes/no questions to find it out. On average, how many questions do you need?",
      fig: entBarsFig,
      min: 0,
      max: 4,
      step: 0.25,
      ans: 1.75,
      tol: 0.1,
      unit: " questions",
      hint: 'Ask "Is it A?" first. Half the time you are done after one question.',
      why: "Ask about A first (1 question, half the time), then B (2 questions, a quarter of the time), then C or D (3 questions, an eighth each). 0.5×1 + 0.25×2 + 0.125×3 + 0.125×3 = 1.75, which is exactly the entropy. Four equal symbols would need 2.",
    },
    {
      type: "pick",
      q: "Each source sends one of four symbols (A, B, C, D) with the chances shown. Tap the one source whose messages can't be squeezed below 2 bits per symbol, however clever the code.",
      fig: entPickFig,
      a: "P",
      why: "Only the perfectly even source P is already at the 2-bit maximum. Even a gentle skew like S (0.3, 0.3, 0.2, 0.2) has less than 2 bits of entropy, so a good code can save a little. You don't need an extreme skew for compression to work.",
    },
    {
      type: "order",
      q: "Order these sources from LOWEST entropy to HIGHEST.",
      items: [
        "A coin that lands heads 9 times in 10",
        "A fair coin",
        "A fair three-sided spinner",
        "Two fair coins flipped together",
      ],
      why: "The 90/10 coin is mostly predictable (about 0.47 bits). The fair coin gives 1 bit, the three-way spinner log₂ 3 ≈ 1.58 bits, and two fair coins together give 1 + 1 = 2 bits.",
    },
    M(
      "Sensor B always sends an exact copy of whatever sensor A reports, and A is a fair coin flip each second. How much entropy does the PAIR (A, B) carry per second?",
      ["1 bit", "2 bits", "0.5 bits", "0 bits"],
      0,
      "Once you have seen A, B holds no surprise, so the pair carries only A's 1 bit. Entropy adds up only for independent sources, and copying is the opposite of independent. Duplicated data is redundancy, which compression removes.",
    ),
    {
      type: "bug",
      q: "This function should return the entropy of a probability list, the AVERAGE surprise. For a fair four-sided die it returns 8 instead of 2. Click the faulty line.",
      code: [
        "from math import log2",
        "def H(p):",
        "    h = 0",
        "    for x in p:",
        "        h += log2(1 / x)",
        "    return h",
      ],
      a: 4,
      why: "Each symbol's surprise log₂(1/x) must be weighted by how often it happens: h += x * log2(1 / x). Without the weight it just adds up the surprises of all four symbols: 4 × 2 = 8.",
    },
  ]);

  /* ==================== a7-huffman ==================== */
  const huffNodesFig = (() => {
    const nodes = [
      ["C", "C", 12, ""],
      ["D", "D", 13, ""],
      ["AB", "A + B", 14, "(already merged)"],
      ["E", "E", 16, ""],
      ["F", "F", 45, ""],
    ];
    let s = TX(8, 18, "Waiting to be merged, sorted by weight:", { a: "start", s: 13 });
    nodes.forEach(([id, lab, w, sub], i) => {
      const x = 8 + i * 82;
      s += PK(
        id,
        RC(x, 30, 74, 66, { r: 10, k: id === "AB" ? "var(--violet)" : "var(--line-2)" }) +
          TX(x + 37, 52, lab, { s: 13 }) +
          TX(x + 37, 79, w, { s: 20, f: "var(--blue)" }) +
          (sub ? TX(x + 37, 91, "sub-tree", { s: 9, w: 700 }) : ""),
      );
    });
    return SVG(420, 108, s, "Five nodes with weights C 12, D 13, A+B 14, E 16 and F 45");
  })();

  B.add("a7-huffman", [
    {
      type: "pick",
      q: "Huffman's algorithm is part-way through. A and B (weights 5 and 9) have already been merged into one sub-tree of weight 14. Tap the TWO nodes it merges next.",
      fig: huffNodesFig,
      a: ["C", "D"],
      why: "Huffman always merges the two lightest nodes available: 12 and 13. The new node weighs 25. The sub-tree A+B (14) is not special just because it was built earlier; it simply isn't one of the two smallest. F (45) will be merged last, so it ends up with a very short code.",
    },
    {
      type: "order",
      q: "A decoder gets the bit stream 11010011100 using A = 0, B = 10, C = 110, D = 111. List the decoded symbols in the order they come out.",
      items: ["C", "B", "A", "D", "A", "A"],
      hint: "Read bits until they match a codeword, write it down, then start again.",
      why: "110 | 10 | 0 | 111 | 0 | 0 = C B A D A A. Because no codeword starts another, the first match is always the right one, so decoding never needs separators or to look ahead.",
    },
    {
      type: "cat",
      q: "A source sends N with probability 0.97 and Y with probability 0.03. Is each statement true or false?",
      buckets: ["True", "False"],
      items: [
        ["The entropy is under 0.5 bits per symbol", 0],
        ["Huffman gives N a 1-bit codeword", 0],
        ["Huffman's average length can go below 1 bit per symbol", 1],
        ["Huffman reaches the entropy for this source", 1],
        ["Coding pairs of symbols together could get closer to the entropy", 0],
      ],
      why: "The entropy is only about 0.19 bits per symbol, but any codeword needs at least one whole bit, so Huffman spends exactly 1 bit per symbol here, five times the entropy. Grouping symbols into pairs or longer blocks (or using arithmetic coding) lets the cost per symbol drop below 1 bit.",
    },
    {
      type: "bug",
      q: "This decoder for a prefix code works for the first symbol, then outputs garbage. Click the faulty line.",
      code: [
        "def decode(bits, code):",
        '    out, cur = [], ""',
        "    for b in bits:",
        "        cur += b",
        "        if cur in code:",
        "            out.append(code[cur])",
        "            cur = cur[1:]",
        '    return "".join(out)',
      ],
      a: 6,
      why: 'After a codeword is found, the buffer must be emptied: cur = "". Dropping only the first bit leaves the rest of the old codeword in the buffer, so every later match is polluted by leftover bits.',
    },
  ]);

  /* ==================== a7-lzw ==================== */
  const lzwStrings = ["ABACADAE", "ABCDEFAB", "ABABABAB", "ABCDEFGH"];
  Object.assign(partScope, { LN, M, PK, RC, SVG, TX, lzwStrings });
})();

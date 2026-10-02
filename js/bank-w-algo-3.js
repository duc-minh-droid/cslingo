/* ALGO revision bank, second set of visual and varied questions, part 3 (Phases 6 to 10).
   Every number was produced by running the real algorithms in node (CRC division, LZW, entropy, SHA-256, DFT). */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG helpers (CSS variables so both themes work) ---------- */
  const SVG = (w, h, inner, label) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto" role="img" aria-label="${label}">${inner}</svg>`;
  const TX = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" fill="${o.f || "var(--text)"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "ui-monospace,Consolas,monospace" : "var(--sans)"}">${s}</text>`;
  const RC = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r == null ? 8 : o.r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const LN = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });

  /* ==================== a6-crc ==================== */
  // four corrupted copies of the valid frame 1101011110; flipped bits shown in red
  const crcFramesFig = (() => {
    const sent = "1101011110";
    const rows = [["B", "1101111110"], ["C", "1100000110"], ["D", "1110111110"], ["E", "0110011110"]];
    let s = TX(8, 20, "Sent: " + sent + "  (generator 1011)", { a: "start", m: 1, s: 13 });
    rows.forEach(([id, bits], r) => {
      const y = 36 + r * 40;
      let cells = "";
      for (let i = 0; i < 10; i++) {
        const bad = bits[i] !== sent[i];
        cells += RC(70 + i * 30, y, 26, 30, { r: 6, f: bad ? "var(--rose)" : "var(--panel)", fo: bad ? 0.28 : 1, k: bad ? "var(--rose)" : "var(--line-2)" }) + TX(83 + i * 30, y + 21, bits[i], { m: 1, s: 15 });
      }
      s += PK(id, RC(2, y - 4, 376, 38, { r: 8, f: "var(--panel)", k: "transparent", w: 1 }) + TX(36, y + 21, "Copy " + id, { s: 13 }) + cells);
    });
    return SVG(380, 200, s, "Four received copies of a CRC frame with the flipped bits marked in red");
  })();
  // long division by 11
  const crc11Fig = SVG(300, 124,
    TX(150, 18, "Message 1011 plus one zero, divided by 11", { s: 13 }) +
    ["10110 ⊕ 11000 = 01110", "01110 ⊕ 01100 = 00010", "00010 ⊕ 00011 = 00001"].map((t, i) => TX(150, 46 + i * 24, t, { m: 1, s: 15 })).join("") +
    TX(150, 116, "Remainder: 1", { f: "var(--teal)", s: 15 }), "XOR long division of 10110 by 11 leaving remainder 1");

  B.add("a6-crc", [
    { type: "pick", q: "The receiver checks every frame by dividing by the generator 1011. All four copies below were corrupted in transit (the flipped bits are red). Which TWO would the receiver wrongly accept?",
      fig: crcFramesFig, a: ["C", "E"], hint: "A frame passes if the error pattern divides evenly by 1011. Look at what the red bits spell.",
      why: "Copies C and E have a red pattern of exactly 1011 (shifted along the frame). The error is then a multiple of the generator, so the remainder stays 000 and the damage is invisible. B (one flip) and D (a 3-bit burst, 111) are not multiples of 1011, so the check fails and the receiver notices." },
    { type: "mcq", q: "A CRC uses the tiny 2-bit generator 11. The working shows its remainder for the message 1011. What is this CRC really doing?",
      o: ["Making an even-parity bit", "Building a 2D parity grid", "Computing a Hamming syndrome", "Always returning zero"], a: 0, fig: crc11Fig,
      why: "Dividing by 11 (that is, x + 1) leaves 1 when the number of 1s is odd and 0 when it is even. That is exactly the even-parity bit. A longer generator checks more patterns, so parity is just the smallest CRC.",
      hint: "1011 has three 1s. Is that odd or even?" },
    { type: "slider", q: "A link uses a CRC with a 3-bit remainder. Total garbage arrives instead of a real frame, so every remainder is equally likely. Out of 100 such junk frames, about how many are wrongly accepted?",
      min: 0, max: 50, step: 1, ans: 12, tol: 3, unit: " frames",
      why: "Junk lands on remainder 000 with probability 1 in 2³ = 1 in 8, which is about 12 in 100. This is why real CRCs use 16 or 32 bits: the chance of slipping through is 1 in 65,536 or 1 in 4 billion." },
    { type: "match", q: "Match each error-checking scheme to what it can do.",
      pairs: [["One parity bit", "Spots any odd number of flips"], ["2D parity grid", "Finds a flip where a failing row meets a failing column"], ["CRC with a 4-bit generator", "Catches every burst of up to 3 flipped bits in a row"], ["Hamming(7,4)", "Reads the position of one flip straight from the syndrome"]],
      why: "A single parity bit counts 1s, so even numbers of flips cancel. The grid crosses a bad row with a bad column. A CRC's remainder is sensitive to short bursts. Hamming's three overlapping checks spell out the position in binary." },
    { type: "bug", q: "The sender should append a CRC so that the whole frame divides evenly by the generator. The receiver keeps rejecting good frames. Click the faulty line.",
      code: ["def send(msg, gen):", "    k = len(gen) - 1", "    rem = mod2(msg, gen)", "    return msg + rem"], a: 2,
      why: "The remainder must be computed on the message with k zeros appended: mod2(msg + \"0\" * k, gen). Without the zeros, the remainder is about the wrong number, and the finished frame no longer divides evenly." },
  ]);

  /* ==================== a6-hamming ==================== */
  // which of the three groups failed, no binary given
  const hamGroupFig = (() => {
    const groups = [["p1", [1, 3, 5, 7], false], ["p2", [2, 3, 6, 7], true], ["p4", [4, 5, 6, 7], true]];
    let s = TX(8, 16, "Bit position", { a: "start", s: 12, f: "var(--text-2, var(--text))" });
    for (let i = 1; i <= 7; i++) s += PK("c" + i, RC(46 + (i - 1) * 46, 24, 40, 34, { r: 8 }) + TX(66 + (i - 1) * 46, 47, i, { s: 16 }));
    groups.forEach(([n, mem, fail], r) => {
      const y = 92 + r * 38;
      s += TX(8, y + 5, n + " group", { a: "start", s: 13 });
      for (let i = 1; i <= 7; i++) s += mem.includes(i) ? `<circle cx="${66 + (i - 1) * 46}" cy="${y}" r="9" fill="var(--blue)"/>` : `<circle cx="${66 + (i - 1) * 46}" cy="${y}" r="3" fill="var(--line-2)"/>`;
      s += TX(396, y + 5, fail ? "✗ fails" : "✓ ok", { a: "start", s: 13, f: fail ? "var(--rose)" : "var(--teal)" });
    });
    return SVG(450, 188, s, "Seven bit positions with the groups p1, p2 and p4; p2 and p4 fail, p1 passes");
  })();
  // 3-bit repetition code drawn as a path of single flips
  const hamPathFig = (() => {
    const w = ["000", "100", "110", "111"];
    let s = TX(60, 26, "codeword A", { f: "var(--teal)", s: 13 }) + TX(360, 26, "codeword B", { f: "var(--teal)", s: 13 });
    w.forEach((t, i) => {
      const x = 20 + i * 100, cw = i === 0 || i === 3;
      s += PK("w" + i, RC(x, 36, 80, 38, { r: 10, k: cw ? "var(--teal)" : "var(--line-2)" }) + TX(x + 40, 61, t, { m: 1, s: 18 }));
      if (i < 3) s += TX(x + 90, 60, "→", { s: 18, f: "var(--text-2, var(--text))" }) + TX(x + 90, 92, "1 flip", { s: 11, f: "var(--text-2, var(--text))" });
    });
    return SVG(420, 104, s, "A line of four words: codeword A is 000, then 100, 110, and codeword B is 111, each one flip apart");
  })();

  B.add("a6-hamming", [
    { type: "pick", q: "A Hamming(7,4) receiver checks its three groups (blue dots show who is in each). Groups p2 and p4 fail and p1 passes. Exactly one bit flipped. Tap it.",
      fig: hamGroupFig, a: "c6", hint: "The flipped bit sits in every failing group and in no passing group.",
      why: "Position 6 is the only one in both p2 and p4 and outside p1. Positions 2 and 4 would fail only one group each, and 7 would also fail p1. Reading failing groups as 1s (p4 p2 p1 = 110) gives 6 in binary, the same answer." },
    { type: "pick", q: "In this 3-bit repetition code the codewords are A = 000 and B = 111, so they differ in 3 places. The receiver decodes to whichever codeword is nearest. Tap every received word that gets decoded as A.",
      fig: hamPathFig, a: ["w0", "w1"],
      why: "000 is A itself, and 100 is one flip from A but two from B, so it decodes to A. But 110 is one flip from B, so it decodes to B: two flips fool the decoder. A distance of 3 can therefore fix one error, and Hamming(7,4) has the same minimum distance of 3." },
    { type: "cat", q: "Hamming(7,4) is extended with one extra overall-parity bit (SECDED). What happens to the decoded data in each case?",
      buckets: ["Fixed correctly", "Flagged, can't be fixed", "Silently decoded wrong"],
      items: [["One data bit flips", 0], ["One check bit flips", 0], ["Only the extra parity bit flips", 0], ["Two bits flip", 1], ["Three bits flip", 2]],
      why: "One flip is always located and fixed, even when it hits a check bit or the extra bit (the data is untouched). Two flips leave the overall parity looking fine but the syndrome non-zero, so the decoder shouts for a resend. Three flips look like one, so the decoder confidently flips the wrong bit." },
    { type: "slider", q: "A Hamming code protects a block of 127 bits using 7 check bits, and the rest are data. About what percentage of the block is check bits?",
      min: 0, max: 50, step: 1, ans: 6, tol: 2, unit: "%",
      hint: "7 out of 127 is about 7 out of 130, which is 1 out of 19.",
      why: "7 / 127 ≈ 5.5%. Check bits grow only as log₂ of the block size, so big Hamming blocks are cheap. Compare Hamming(7,4), where 3 of 7 bits (43%) are checks." },
    { type: "bug", q: "This Hamming(7,4) decoder should compute the syndrome as p4 p2 p1 in binary, but it names the wrong position for some errors. Click the faulty line.",
      code: ["def syndrome(w):", "    s = 0", "    if w[1]^w[3]^w[5]^w[7]: s += 1", "    if w[2]^w[3]^w[6]^w[7]: s += 2", "    if w[4]^w[5]^w[6]^w[7]: s += 2", "    return s"], a: 4,
      why: "The p4 group should add 4, the value of the 4s place. With 2 added, errors in positions 4 to 7 point at the wrong place, and an error at position 4 would be read as position 2." },
  ]);

  /* ==================== a7-entropy ==================== */
  const bars4 = (x, y, p, w, h, f) => p.map((v, i) => { const bh = Math.max(2, v * h); return RC(x + i * (w / 4) + 3, y + h - bh, w / 4 - 8, bh, { r: 3, f: f || "var(--blue)", k: f || "var(--blue)", w: 1 }); }).join("");
  const entBarsFig = (() => {
    const p = [0.5, 0.25, 0.125, 0.125];
    let s = bars4(60, 20, p, 220, 100);
    p.forEach((v, i) => { s += TX(60 + i * 55 + 27, 138, "ABCD"[i], { s: 14 }) + TX(60 + i * 55 + 27, 16 + 100 - v * 100 - 4, v, { s: 12 }); });
    s += LN(54, 120, 286, 120);
    return SVG(340, 150, s, "Bar chart of four symbol probabilities: A 0.5, B 0.25, C 0.125, D 0.125");
  })();
  const entPickFig = (() => {
    const src = [["P", [0.25, 0.25, 0.25, 0.25]], ["Q", [0.4, 0.3, 0.2, 0.1]], ["R", [0.7, 0.1, 0.1, 0.1]], ["S", [0.3, 0.3, 0.2, 0.2]]];
    let s = "";
    src.forEach(([n, p], i) => {
      const x = 8 + (i % 2) * 190, y = 6 + Math.floor(i / 2) * 124;
      s += PK(n, RC(x, y, 178, 114, { r: 10 }) + TX(x + 89, y + 18, "Source " + n, { s: 13 }) + bars4(x + 14, y + 28, p, 150, 66) + LN(x + 14, y + 94, x + 164, y + 94, { w: 1 }) + [0, 1, 2, 3].map((k) => TX(x + 14 + k * 37.5 + 18, y + 108, "ABCD"[k], { s: 11 })).join(""));
    });
    return SVG(380, 256, s, "Four bar charts of probabilities over four symbols for sources P, Q, R and S");
  })();

  B.add("a7-entropy", [
    { type: "slider", q: "I secretly pick one of four symbols with the chances shown. You ask the best possible yes/no questions to find it out. On average, how many questions do you need?",
      fig: entBarsFig, min: 0, max: 4, step: 0.25, ans: 1.75, tol: 0.1, unit: " questions",
      hint: "Ask \"Is it A?\" first. Half the time you are done after one question.",
      why: "Ask about A first (1 question, half the time), then B (2 questions, a quarter of the time), then C or D (3 questions, an eighth each). 0.5×1 + 0.25×2 + 0.125×3 + 0.125×3 = 1.75, which is exactly the entropy. Four equal symbols would need 2." },
    { type: "pick", q: "Each source sends one of four symbols (A, B, C, D) with the chances shown. Tap the one source whose messages can't be squeezed below 2 bits per symbol, however clever the code.",
      fig: entPickFig, a: "P",
      why: "Only the perfectly even source P is already at the 2-bit maximum. Even a gentle skew like S (0.3, 0.3, 0.2, 0.2) has less than 2 bits of entropy, so a good code can save a little. You don't need an extreme skew for compression to work." },
    { type: "order", q: "Order these sources from LOWEST entropy to HIGHEST.",
      items: ["A coin that lands heads 9 times in 10", "A fair coin", "A fair three-sided spinner", "Two fair coins flipped together"],
      why: "The 90/10 coin is mostly predictable (about 0.47 bits). The fair coin gives 1 bit, the three-way spinner log₂ 3 ≈ 1.58 bits, and two fair coins together give 1 + 1 = 2 bits." },
    M("Sensor B always sends an exact copy of whatever sensor A reports, and A is a fair coin flip each second. How much entropy does the PAIR (A, B) carry per second?",
      ["1 bit", "2 bits", "0.5 bits", "0 bits"], 0,
      "Once you have seen A, B holds no surprise, so the pair carries only A's 1 bit. Entropy adds up only for independent sources, and copying is the opposite of independent. Duplicated data is redundancy, which compression removes."),
    { type: "bug", q: "This function should return the entropy of a probability list, the AVERAGE surprise. For a fair four-sided die it returns 8 instead of 2. Click the faulty line.",
      code: ["from math import log2", "def H(p):", "    h = 0", "    for x in p:", "        h += log2(1 / x)", "    return h"], a: 4,
      why: "Each symbol's surprise log₂(1/x) must be weighted by how often it happens: h += x * log2(1 / x). Without the weight it just adds up the surprises of all four symbols: 4 × 2 = 8." },
  ]);

  /* ==================== a7-huffman ==================== */
  const huffNodesFig = (() => {
    const nodes = [["C", "C", 12, ""], ["D", "D", 13, ""], ["AB", "A + B", 14, "(already merged)"], ["E", "E", 16, ""], ["F", "F", 45, ""]];
    let s = TX(8, 18, "Waiting to be merged, sorted by weight:", { a: "start", s: 13 });
    nodes.forEach(([id, lab, w, sub], i) => {
      const x = 8 + i * 82;
      s += PK(id, RC(x, 30, 74, 66, { r: 10, k: id === "AB" ? "var(--violet)" : "var(--line-2)" }) + TX(x + 37, 52, lab, { s: 13 }) + TX(x + 37, 79, w, { s: 20, f: "var(--blue)" }) + (sub ? TX(x + 37, 91, "sub-tree", { s: 9, w: 700 }) : ""));
    });
    return SVG(420, 108, s, "Five nodes with weights C 12, D 13, A+B 14, E 16 and F 45");
  })();

  B.add("a7-huffman", [
    { type: "pick", q: "Huffman's algorithm is part-way through. A and B (weights 5 and 9) have already been merged into one sub-tree of weight 14. Tap the TWO nodes it merges next.",
      fig: huffNodesFig, a: ["C", "D"],
      why: "Huffman always merges the two lightest nodes available: 12 and 13. The new node weighs 25. The sub-tree A+B (14) is not special just because it was built earlier; it simply isn't one of the two smallest. F (45) will be merged last, so it ends up with a very short code." },
    { type: "order", q: "A decoder gets the bit stream 11010011100 using A = 0, B = 10, C = 110, D = 111. List the decoded symbols in the order they come out.",
      items: ["C", "B", "A", "D", "A", "A"], hint: "Read bits until they match a codeword, write it down, then start again.",
      why: "110 | 10 | 0 | 111 | 0 | 0 = C B A D A A. Because no codeword starts another, the first match is always the right one, so decoding never needs separators or to look ahead." },
    { type: "cat", q: "A source sends N with probability 0.97 and Y with probability 0.03. Is each statement true or false?",
      buckets: ["True", "False"],
      items: [["The entropy is under 0.5 bits per symbol", 0], ["Huffman gives N a 1-bit codeword", 0], ["Huffman's average length can go below 1 bit per symbol", 1], ["Huffman reaches the entropy for this source", 1], ["Coding pairs of symbols together could get closer to the entropy", 0]],
      why: "The entropy is only about 0.19 bits per symbol, but any codeword needs at least one whole bit, so Huffman spends exactly 1 bit per symbol here, five times the entropy. Grouping symbols into pairs or longer blocks (or using arithmetic coding) lets the cost per symbol drop below 1 bit." },
    { type: "bug", q: "This decoder for a prefix code works for the first symbol, then outputs garbage. Click the faulty line.",
      code: ["def decode(bits, code):", "    out, cur = [], \"\"", "    for b in bits:", "        cur += b", "        if cur in code:", "            out.append(code[cur])", "            cur = cur[1:]", "    return \"\".join(out)"], a: 6,
      why: "After a codeword is found, the buffer must be emptied: cur = \"\". Dropping only the first bit leaves the rest of the old codeword in the buffer, so every later match is polluted by leftover bits." },
  ]);

  /* ==================== a7-lzw ==================== */
  const lzwStrings = ["ABACADAE", "ABCDEFAB", "ABABABAB", "ABCDEFGH"];
  const lzwFig = (() => {
    let s = TX(8, 18, "Dictionary starts with A to H = codes 0 to 7", { a: "start", s: 12 });
    lzwStrings.forEach((t, i) => {
      const y = 28 + i * 40;
      s += PK("s" + i, RC(2, y - 2, 296, 36, { r: 9 }) + TX(18, y + 22, "S" + (i + 1), { s: 13, a: "start" }) + t.split("").map((c, k) => TX(76 + k * 26, y + 23, c, { m: 1, s: 17 })).join(""));
    });
    return SVG(300, 192, s, "Four 8-letter strings S1 to S4 for LZW");
  })();
  const lzwDictFig = SVG(380, 66,
    TX(8, 18, "After encoding, the table's new entries were:", { a: "start", s: 13 }) +
    [["2", "AB"], ["3", "BA"], ["4", "AA"], ["5", "ABA"]].map(([c, t], i) => RC(8 + i * 90, 28, 82, 32, { r: 8 }) + TX(8 + i * 90 + 41, 49, c + " = " + t, { m: 1, s: 14 })).join(""), "LZW table entries 2 = AB, 3 = BA, 4 = AA, 5 = ABA");

  B.add("a7-lzw", [
    { type: "pick", q: "LZW starts with a dictionary of single letters A to H. Tap every string for which it sends FEWER codes than the 8 letters.",
      fig: lzwFig, a: ["s1", "s2"],
      hint: "LZW only saves when a phrase of two or more letters appears again.",
      why: "S3 (ABABABAB) repeats AB and ABA, giving 5 codes. S2 (ABCDEFAB) has AB at the end, which is already in the table, so 7 codes. S1 repeats the single letter A, but A alone is already a code, and every pair (AB, BA, AC…) is new, so it needs 8 codes. S4 has no repeats at all (8 codes)." },
    { type: "mcq", q: "These are the new dictionary entries an LZW encoder created, in order. Which 7-letter input produced them? (A = 0, B = 1.)",
      o: ["ABAABAB", "ABABAAB", "ABBABAB", "ABABABA"], a: 0, fig: lzwDictFig,
      hint: "The first entry AB means the input starts ABA…; the third entry AA means two As in a row appear soon.",
      why: "ABAABAB: A, B, A, AB, AB gives entries AB, BA, AA, ABA in that order. ABABAAB builds AB, BA, ABA, AA, with the last two in swapped order. ABBABAB would add BB, and ABABABA builds only AB, BA and ABA." },
    { type: "slider", q: "An LZW encoder sends fixed 12-bit codes for 8-bit characters. Suppose the text has no repeated phrases at all, so every code stands for a single character. The output is what percentage of the input size?",
      min: 50, max: 200, step: 10, ans: 150, tol: 15, unit: "%", hint: "12 bits for every 8 bits of input.",
      why: "12 / 8 = 1.5, so the output is about 150% of the input. LZW can expand data that has nothing repeated, which is why compressing an already-compressed file is a bad idea." },
    { type: "bug", q: "This LZW decoder should rebuild the table the way the encoder did. Its output is right for a few codes, then goes wrong. Click the faulty line.",
      code: ["def decode(codes, table):", "    prev = table[codes[0]]", "    out = prev", "    for c in codes[1:]:", "        if c in table: cur = table[c]", "        else: cur = prev + prev[0]", "        out += cur", "        table[len(table)] = prev + cur", "        prev = cur", "    return out"], a: 7,
      why: "The new entry is the previous output plus only the FIRST character of the current one: prev + cur[0]. Adding the whole of cur makes the entry far too long, and every later code that points at it expands to the wrong text." },
  ]);

  /* ==================== a8-hash ==================== */
  const pwFig = (() => {
    const rows = [["alice", "a941a4c4"], ["bob", "e5133159"], ["carol", "a941a4c4"], ["dan", "1c8bfe8f"]];
    let s = TX(8, 18, "User", { a: "start", s: 12 }) + TX(140, 18, "Stored SHA-256 (first 8 hex digits)", { a: "start", s: 12 });
    rows.forEach(([u, h], i) => { const y = 28 + i * 38; s += PK(u, RC(2, y, 356, 32, { r: 8 }) + TX(16, y + 21, u, { a: "start", s: 14 }) + TX(140, y + 21, h, { a: "start", m: 1, s: 15 })); });
    return SVG(360, 188, s, "A password table where alice and carol have the same stored digest");
  })();
  const chain5Fig = (() => {
    let s = "";
    for (let i = 1; i <= 5; i++) {
      const x = 6 + (i - 1) * 84, ed = i === 2;
      s += RC(x, 24, 74, 62, { r: 8, k: ed ? "var(--amber)" : "var(--line-2)", f: ed ? "var(--amber)" : "var(--panel)", fo: ed ? 0.2 : 1 }) + TX(x + 37, 44, "Block " + i, { s: 13 }) + TX(x + 37, 64, i === 1 ? "prev: none" : "prev: #" + (i - 1), { s: 11 }) + TX(x + 37, 79, "own: #" + i, { s: 11 });
      if (i < 5) s += TX(x + 79, 60, "→", { s: 14 });
    }
    s += TX(6 + 84 + 37, 108, "edited", { s: 12, f: "var(--amber)" });
    return SVG(430, 118, s, "A chain of five blocks, each storing the hash of the one before it; block 2 is edited");
  })();

  B.add("a8-hash", [
    { type: "pick", q: "A leaked password table stores an unsalted SHA-256 of each password. Without cracking anything, tap the two users who must have chosen the SAME password.",
      fig: pwFig, a: ["alice", "carol"],
      why: "The hash is deterministic, so equal passwords give equal digests. Alice and Carol share one, and one cracked guess exposes both. A random salt mixed into each hash makes identical passwords produce different digests, which hides this and stops a single pre-built table of hashes being reused." },
    { type: "match", q: "Match each situation to the hash property it relies on most.",
      pairs: [["A site publishes the digest of its installer, and nobody should be able to forge a different file with it", "Collision resistance"], ["A stolen password table should not reveal the passwords", "Preimage resistance (one-way)"], ["A miner can't predict which nonce will win", "Avalanche effect"], ["Two computers hash one file and compare answers", "Determinism"]],
      why: "Forging a file with the same digest would need a collision. Recovering a password from its digest would need a preimage. Proof of work only works if nonces give unpredictable digests (avalanche). Comparing digests across machines needs the same input to always give the same output." },
    { type: "mcq", q: "In this chain every block stores the hash of the one before it. The amber block 2 is edited, and the attacker wants the chain to validate again. How many blocks must be re-mined, including block 2?",
      o: ["1", "2", "4", "5"], a: 2, fig: chain5Fig,
      why: "Changing block 2 changes its hash, so block 3's stored link is wrong, so block 3 must be re-mined, and so on to the end: blocks 2, 3, 4 and 5. Block 1 is untouched. That cost is why deeper blocks are safer, and why a miner would need to out-run the honest network." },
    { type: "bug", q: "A programmer wants to stop identical passwords having identical stored hashes. It doesn't work. Click the faulty line.",
      code: ["def store(pw):", "    salt = os.urandom(8)", "    h = sha256(pw.encode()).digest()", "    return salt, h"], a: 2,
      why: "The salt is generated and stored but never fed into the hash. The line should hash salt + pw.encode(). Then two users with the same password get different digests because their salts differ." },
    M("A hash has a 16-bit digest (65,536 possible values). Roughly how many random inputs do you need to hash before two of them probably share a digest?",
      ["16", "256", "65,536", "4,294,967,296"], 1,
      "This is the birthday effect: collisions appear after about the square root of the number of digests, √65,536 = 256. That is why collision resistance needs digests twice as long as the work you want to guard against, and why SHA-256 has 256 bits.",
      { hint: "Pairs grow like the square of the number of inputs, so you need far fewer than 65,536." }),
  ]);

  /* ==================== a8-keys ==================== */
  const rsaFig = (() => {
    const rows = [["A", 5, 11, 3], ["B", 5, 11, 5], ["C", 7, 13, 5], ["D", 3, 11, 7], ["E", 7, 13, 9]];
    let s = ["Set", "p", "q", "e"].map((t, i) => TX(40 + i * 80, 18, t, { s: 12 })).join("");
    rows.forEach(([n, p, q, e], i) => { const y = 26 + i * 36; s += PK(n, RC(2, y, 356, 31, { r: 8 }) + [n, p, q, e].map((t, k) => TX(40 + k * 80, y + 21, t, { s: 15 })).join("")); });
    return SVG(360, 212, s, "Five toy RSA parameter sets A to E, each with primes p and q and a public exponent e");
  })();

  B.add("a8-keys", [
    { type: "pick", q: "Each row is a toy RSA setup with primes p and q and a chosen public exponent e. Tap the TWO rows where e is not allowed, because no private key d can exist.",
      fig: rsaFig, a: ["B", "E"], hint: "Work out φ = (p − 1)(q − 1) for each row. e must share no factor with φ.",
      why: "Row B has φ = 4 × 10 = 40 and e = 5 shares the factor 5. Row E has φ = 6 × 12 = 72 and e = 9 shares the factor 3 (and 9). In both, no d satisfies e × d = 1 mod φ. Rows A, C and D have e coprime to φ (40, 72 and 20)." },
    { type: "cat", q: "Eve learns each thing below. How much of Alice's private traffic can she now read? (Each chat uses a fresh Diffie–Hellman secret, and Alice's long-term RSA key pair is reused.)",
      buckets: ["Nothing useful", "One chat only", "Everything sent to Alice"],
      items: [["The public numbers p and g", 0], ["Alice's RSA public key", 0], ["Last night's session key", 1], ["Bob's one-off DH secret from last night's chat", 1], ["Alice's RSA private key d", 2]],
      why: "Public values give nothing away by design. A session key or a one-off secret unlocks just the chat it belongs to. The long-term RSA private key unlocks everything encrypted to Alice with it, including old recorded traffic, and lets Eve sign as her. Throwaway keys limit the damage of a leak." },
    { type: "bug", q: "A toy Diffie–Hellman program works for tiny numbers but never finishes when a has 600 digits. Click the faulty line.",
      code: ["def dh_public(g, a, p):", "    r = g ** a", "    return r % p"], a: 1,
      why: "g ** a builds an astronomically huge integer before reducing it. Use pow(g, a, p), which reduces mod p after every squaring. That is the \"easy\" direction in Diffie–Hellman: gᵃ mod p is quick, while reversing it is the hard discrete-logarithm problem." },
    { type: "order", q: "Put the steps of a secure chat in order. (It uses public keys to set up, then fast symmetric encryption for the chat itself.)",
      items: ["Alice's browser checks Bob's certificate", "They run a key exchange (such as Diffie–Hellman)", "Both sides derive the same session key", "Messages are encrypted with that symmetric key"],
      why: "First prove who Bob is, or Mallory could sit in the middle. Then agree a secret over the open wire. Both sides compute the same session key, and the bulk data is encrypted with it, because symmetric ciphers are thousands of times faster than RSA." },
    M("Alice sends Bob a signed contract. Mallory flips one bit of the contract in transit. Bob checks the signature with Alice's public key. What happens?",
      ["The check fails, as the hash no longer matches", "The check passes, as the signature itself is intact", "Bob can no longer open the contract at all", "The check fails only if the signature changes too"], 0,
      "A signature is made from a hash of the exact contract. Change one bit and the hash changes completely (avalanche), so verification fails. The signature protects the contract's integrity, not just the sender's identity."),
  ]);

  /* ==================== a9-dft ==================== */
  const aliasFig = (() => {
    const f = [["A", 2, "cos"], ["B", 1, "sin"], ["C", 1, "cos"]];
    let s = "";
    f.forEach(([n, hz, fn], i) => {
      const y0 = 8 + i * 98, cy = y0 + 44, X = (t) => 50 + t * 320, Y = (v) => cy - v * 30;
      let d = "";
      for (let k = 0; k <= 200; k++) { const t = k / 200, v = fn === "cos" ? Math.cos(2 * Math.PI * hz * t) : Math.sin(2 * Math.PI * hz * t); d += (k ? "L" : "M") + X(t).toFixed(1) + " " + Y(v).toFixed(1); }
      let dots = "";
      for (let k = 0; k <= 10; k++) dots += `<circle cx="${X(k / 10).toFixed(1)}" cy="${Y(Math.cos(2 * Math.PI * k / 10)).toFixed(1)}" r="4.5" fill="var(--blue)"/>`;
      s += PK("curve" + n, RC(2, y0, 396, 90, { r: 10 }) + LN(50, cy, 370, cy, { w: 1 }) + `<path d="${d}" fill="none" stroke="var(--amber)" stroke-width="2.5"/>` + dots + TX(26, cy + 5, n, { s: 15 }));
    });
    return SVG(400, 300, s, "Three panels, each showing the same eleven sample dots over one second and a different candidate wave: A, B and C");
  })();
  const specFig = (() => {
    const X = (k) => 20 + k * 3.6;
    let s = LN(20, 100, 380, 100, { w: 2 });
    [40, 60].forEach((k) => (s += RC(X(k) - 3, 28, 6, 72, { r: 2, f: "var(--blue)", k: "var(--blue)", w: 1 })));
    [0, 20, 40, 60, 80, 100].forEach((k) => (s += LN(X(k), 100, X(k), 105, { w: 1 }) + TX(X(k), 120, k, { s: 11 })));
    s += TX(200, 140, "bin k   (N = 100 samples, sampled at 1,000 Hz)", { s: 12 });
    return SVG(400, 150, s, "Magnitude spectrum of a real signal with peaks at bins 40 and 60 out of 100");
  })();

  B.add("a9-dft", [
    { type: "pick", q: "A 9 Hz cosine is sampled 10 times a second, giving the 11 blue dots in every panel. A slower wave fits the same dots exactly. Tap the panel whose wave passes through ALL the dots.",
      fig: aliasFig, a: "curveC",
      why: "Panel C, a 1 Hz cosine, passes through every dot. The 9 Hz cosine fits the same dots, because 10 samples a second can't tell 9 Hz from 1 Hz. That is aliasing. Panel A (2 Hz) misses most dots, and panel B is the wrong phase, since a sine starts at 0 while the dots start at the peak." },
    { type: "mcq", q: "The spectrum of a real signal sampled at 1,000 Hz with N = 100 samples shows peaks at bins 40 and 60. What frequency is the tone?",
      o: ["40 Hz", "400 Hz", "600 Hz", "1,000 Hz"], a: 1, fig: specFig, hint: "Bin spacing is fs / N.",
      why: "Bins are 1,000 / 100 = 10 Hz apart, so bin 40 is 400 Hz. Bin 60 is its mirror image (N − 40 = 60, or −400 Hz), always present for a real signal, so it does not mean a second tone at 600 Hz." },
    { type: "order", q: "A recorder samples at 100 Hz and takes 100 samples, so bins are 1 Hz apart. Four tones are played: 20 Hz, 45 Hz, 60 Hz and 110 Hz. Order the tones by the bin (up to bin 50) where each shows up, lowest bin first.",
      items: ["110 Hz", "20 Hz", "60 Hz", "45 Hz"], hint: "Anything above 50 Hz folds back down.",
      why: "20 Hz and 45 Hz are below Nyquist (50 Hz), so they show in bins 20 and 45. 60 Hz folds to 100 − 60 = 40, and 110 Hz folds to 110 − 100 = 10. So the order is 110 Hz (bin 10), 20 Hz (20), 60 Hz (40), 45 Hz (45)." },
    { type: "cat", q: "A whole-number-of-cycles tone is analysed with the DFT. For each change to the signal, what happens to its magnitude spectrum?",
      buckets: ["Magnitudes unchanged", "A peak moves", "A peak grows or appears"],
      items: [["Delay the tone by a quarter of a cycle", 0], ["Play the signal backwards", 0], ["Play the tone twice as fast", 1], ["Add the same constant to every sample", 2], ["Double every sample value", 2]],
      why: "Delaying or reversing a pure tone changes only the phase, not how much of each frequency there is. Doubling the speed moves the peak to twice the bin. A constant is a zero-frequency component, so a new peak appears at bin 0. Doubling all the values doubles the peak heights." },
    { type: "slider", q: "A cosine with amplitude 1 fits exactly 5 whole cycles in a window of N = 64 samples. How tall is its peak in the DFT magnitude (the bin at k = 5)?",
      min: 0, max: 70, step: 2, ans: 32, tol: 4,
      hint: "The sum adds up about N copies of 1, but the energy is split between bin k and its mirror.",
      why: "The matching bin multiplies the signal by a wave of the same shape, so every sample adds about 1 × 0.5 on average and the total is N / 2 = 32. The other half sits in the mirror bin N − 5 = 59. So a DFT peak scales with the number of samples, not the amplitude alone." },
  ]);

  /* ==================== a9-fft ==================== */
  const slotsFig = (() => {
    let s = TX(8, 16, "Input slots of an 8-point FFT", { a: "start", s: 12 });
    for (let i = 0; i < 8; i++) s += PK("s" + i, RC(8 + i * 48, 26, 42, 44, { r: 8 }) + TX(29 + i * 48, 53, "slot " + i, { s: 11 }));
    return SVG(400, 84, s, "Eight input slots numbered 0 to 7");
  })();
  const circleFig = (() => {
    const cx = 130, cy = 120, r = 88;
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line-2)" stroke-width="2"/>` + LN(cx - r - 10, cy, cx + r + 10, cy, { w: 1 }) + LN(cx, cy - r - 10, cx, cy + r + 10, { w: 1 });
    for (let k = 0; k < 8; k++) {
      const a = (2 * Math.PI * k) / 8, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      s += PK("p" + k, `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="var(--panel)" stroke="${k < 2 ? "var(--violet)" : "var(--line-2)"}" stroke-width="3"/>`);
    }
    s += TX(cx + r + 18, cy - 14, "W⁰ = 1", { a: "start", s: 13, f: "var(--violet)" });
    s += TX(cx + 66 + 10, cy + 66 + 28, "W¹", { a: "start", s: 13, f: "var(--violet)" });
    return SVG(300, 240, s, "Eight points around a circle: W to the power 0 is the point on the right, W to the power 1 is one eighth of a turn clockwise from it");
  })();

  B.add("a9-fft", [
    { type: "pick", q: "An 8-point FFT first shuffles its inputs into bit-reversed order. Tap the slot that x[3] is moved into.",
      fig: slotsFig, a: "s6", hint: "3 is 011 in three bits. Read those bits backwards.",
      why: "3 = 011, and 011 reversed is 110 = 6. So x[3] goes to slot 6 (and x[6] goes to slot 3). This shuffle puts the even/odd splitting of every level into place, so the butterflies can then work in place level by level." },
    { type: "pick", q: "In an 8-point FFT the twiddle factor Wᵏ is the point k steps clockwise round the circle from W⁰ = 1. A butterfly computes a + W·b and a − W·b using ONE multiplication. That works because the twiddle for the second output is exactly opposite. Tap the point opposite W¹.",
      fig: circleFig, a: "p5",
      why: "Opposite means half a turn, which is 4 steps out of 8, so the point is W⁵ = −W¹. The second output can therefore reuse the same product with a flipped sign, a − W·b, instead of doing another multiplication. This sharing is a big part of why the FFT is fast." },
    M("A signal has N = 1,048,576 (about a million) samples. Roughly how many times fewer operations does an FFT need than the direct DFT?",
      ["About 20×", "About 1,000×", "About 50,000×", "About 1,000,000×"], 2,
      "The direct DFT needs about N² operations and the FFT about N log₂ N, so the ratio is N / log₂ N = 1,048,576 / 20 ≈ 50,000. The gain grows with N, so it matters most for large signals.",
      { hint: "log₂ of a million is about 20. Divide a million by 20." }),
    { type: "slider", q: "How many butterflies in total does a 64-point radix-2 FFT perform?",
      min: 0, max: 400, step: 4, ans: 192, tol: 16, hint: "log₂ 64 levels, and 32 butterflies on each level.",
      why: "There are log₂ 64 = 6 levels with N / 2 = 32 butterflies each, so 6 × 32 = 192. The direct DFT would need about 64 × 64 = 4,096 multiplications." },
    { type: "bug", q: "A programmer multiplies two polynomials by FFT: transform both, multiply point by point, transform back. The product comes out wrapped round and wrong. Click the faulty line.",
      code: ["def polymul(a, b):", "    n = max(len(a), len(b))", "    A = fft(a + [0] * (n - len(a)))", "    B = fft(b + [0] * (n - len(b)))", "    C = [p * q for p, q in zip(A, B)]", "    return ifft(C)"], a: 1,
      why: "A product of lengths la and lb has la + lb − 1 coefficients, so n must be at least that (rounded up to a power of two). With a smaller n the high-order terms wrap round and add onto the low ones. Zero-padding up to that length stops it." },
  ]);

  /* ==================== a10-attn ==================== */
  const attnTableFig = (() => {
    const rows = [["the", "0.6", "10"], ["cat", "0.3", "20"], ["sat", "0.1", "30"]];
    let s = TX(60, 18, "Token", { s: 12 }) + TX(180, 18, "Attention weight", { s: 12 }) + TX(300, 18, "Value", { s: 12 });
    rows.forEach(([t, w, v], i) => { const y = 26 + i * 36; s += RC(2, y, 356, 30, { r: 8 }) + TX(60, y + 21, t, { s: 15 }) + TX(180, y + 21, w, { s: 15, f: "var(--blue)" }) + TX(300, y + 21, v, { s: 15 }); });
    return SVG(360, 138, s, "Three tokens with attention weights 0.6, 0.3, 0.1 and values 10, 20, 30");
  })();
  const causalFig = (() => {
    const w = ["The", "cat", "sat", "on", "the", "mat"];
    let s = "";
    w.forEach((t, i) => { const ed = i === 3; s += PK("t" + (i + 1), RC(6 + i * 66, 28, 60, 40, { r: 9, k: ed ? "var(--amber)" : "var(--line-2)", f: ed ? "var(--amber)" : "var(--panel)", fo: ed ? 0.22 : 1 }) + TX(36 + i * 66, 53, t, { s: 14 })); });
    s += TX(36 + 3 * 66, 90, "edited", { s: 12, f: "var(--amber)" });
    return SVG(410, 100, s, "Six tokens The cat sat on the mat, with the fourth token on being edited");
  })();
  const headsFig = (() => {
    const n = 5, cs = 22;
    const mats = [
      ["Head 1", (i, j) => (j > i ? null : 1 / (i + 1))],
      ["Head 2", (i, j) => (j > i ? null : i === 0 ? 1 : j === i - 1 ? 0.8 : j === i ? 0.2 : 0)],
      ["Head 3", (i, j) => (j > i ? null : i === 0 ? 1 : j === 0 ? 0.9 : j === i ? 0.1 : 0)],
    ];
    let s = "";
    mats.forEach(([name, f], m) => {
      const x0 = 14 + m * 132, y0 = 30;
      let g = TX(x0 + 55, 18, name, { s: 13 });
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const v = f(i, j);
        g += v === null ? RC(x0 + j * cs, y0 + i * cs, cs - 2, cs - 2, { r: 3, f: "var(--bg-2, var(--panel))", k: "var(--line)", w: 1, d: "2 2" }) : RC(x0 + j * cs, y0 + i * cs, cs - 2, cs - 2, { r: 3, f: "var(--blue)", fo: Math.max(0.04, v), k: "var(--line-2)", w: 1 });
      }
      s += PK("h" + (m + 1), RC(x0 - 8, 4, 126, 146, { r: 10, f: "transparent", k: "var(--line)", w: 1 }) + g);
    });
    s += TX(200, 166, "row = word asking, column = word it looks at; darker = more weight", { s: 11, w: 700 });
    return SVG(400, 176, s, "Three 5 by 5 attention heatmaps for Head 1, Head 2 and Head 3, with the upper triangle masked");
  })();

  B.add("a10-attn", [
    { type: "mcq", q: "One token attends to three tokens with the weights and values shown (values are plain numbers here, to keep it simple). What is its attention output?",
      o: ["10", "15", "20", "30"], a: 1, fig: attnTableFig, hint: "Weight each value: 0.6 × 10 + 0.3 × 20 + 0.1 × 30.",
      why: "The output is a weighted sum of values: 6 + 6 + 3 = 15. It is not the value of the top-weighted token (10) and not the plain average (20). Attention blends everything it looks at, in proportion to the weights." },
    { type: "pick", q: "A causal model reads \"The cat sat on the mat\". You edit token 4 (\"on\") and re-run one attention layer. Tap every token whose attention output can change.",
      fig: causalFig, a: ["t4", "t5", "t6"],
      why: "With a causal mask, each token looks only at itself and earlier tokens. So tokens 1 to 3 never see token 4, and their outputs stay the same. Token 4 itself and the later tokens 5 and 6 can all see the edit. This is why generation can reuse earlier results as it adds new tokens." },
    { type: "pick", q: "These three heads were printed for a 5-word sentence. Tap the head that mostly looks at the PREVIOUS word.",
      fig: headsFig, a: "h2",
      why: "Head 2 puts most of its weight just below the diagonal, on the word before. Head 1 spreads weight evenly over everything so far, and Head 3 sends almost everything to the first word. Different heads learn different jobs, which is the reason for having several." },
    { type: "match", q: "A model has a bug. Match each symptom to the missing piece of attention.",
      pairs: [["It predicts the next word perfectly in training, but fails when generating", "The causal mask (it peeks at the answer)"], ["Shuffling the words gives exactly the same output", "Position information"], ["Weights are almost all 0 or 1 and learning stalls", "The 1/√d scaling of scores"], ["The weights in a row add up to far more than 1", "Softmax"]],
      why: "Without a mask the model can copy the word it is meant to predict, which only looks like brilliance in training. Attention alone has no sense of order, so position must be added. Unscaled dot products get huge, pushing softmax to a hard 0/1 pick with tiny gradients. Weights that don't add to 1 mean softmax is missing." },
    { type: "bug", q: "A programmer's single attention head runs without errors but the output ignores what the tokens actually say, so it looks like a copy of the keys. Click the faulty line.",
      code: ["q = X @ Wq", "k = X @ Wk", "v = X @ Wv", "s = q @ k.T / d ** 0.5", "w = softmax(s)", "out = w @ k"], a: 5,
      why: "The weights decide how much of each token's VALUE to blend in: out = w @ v. Using k there blends the keys, which are only labels for matching. The values are the content that attention is meant to carry forward." },
  ]);
})();

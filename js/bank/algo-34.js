(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { CI, LN, PK, RC, SVG, TX, areaFig, diffFig, hit, queueFig, treeFig } = partScope;
  const B = NIC.bank;
  const MUTE = "var(--text-2, var(--text))";
  const RED = "var(--rose)",
    BLU = "var(--blue)",
    AMB = "var(--amber)";

  B.add("a7-build", [
    {
      type: "mcq",
      q: "The workshop shows the queue smallest first. The two smallest nodes merge next. After that merge, which two nodes are at the front of the queue?",
      fig: queueFig,
      o: [
        "Rain (8), then the new node (9)",
        "Rain (8), then Cloud (11)",
        "The new node (9), then Cloud (11)",
        "Wind (5), then Rain (8)",
      ],
      a: 0,
      why: "Fog+Hail (4) and Wind (5) merge into a node of weight 9. The queue stays sorted by weight, so the 9 slots in between Rain (8) and Cloud (11): the queue is now 8, 9, 11, 18. A merged node is not special, it just competes on its total.",
    },
    {
      type: "pick",
      q: "A learner merges Hail (1) with Sun (18) first, then carries on smallest-first. The table shows each code length before and after that mistake. A symbol's extra bits are its count times the change in its code length. Tap the symbol that adds the most bits to the day's total.",
      fig: diffFig,
      a: "S",
      hint: "Multiply each count by how much its code grew. Codes that got shorter are savings.",
      why: "Sun is reported 18 times and its code grows from 1 bit to 2, adding 18 bits. Fog and Hail get shorter (saving 3 and 3 bits), and Cloud, Rain and Wind do not change. Net: 18 − 3 − 3 = 12 extra bits, so 116 bits instead of 104. Hail's code changed the most, but it is so rare that it hardly matters.",
    },
    {
      type: "pick",
      q: "The reports arrive as one unbroken bit stream, 0 0 1 0 0 0 0 0 1, and the receiver walks the finished tree from the root, starting again at the root after each leaf. Tap the leaf where the SECOND report ends.",
      fig: treeFig,
      a: "W",
      hint: "Follow the first bits until you hit a leaf, restart, and do it again.",
      why: "0 0 1 goes root, 0, 0, 1 and lands on Rain: the first report. Restarting at the root, 0 0 0 0 reaches Wind: the second report. The last 0 1 is Cloud. Every codeword ends at a leaf, so the receiver never needs a separator between reports.",
    },
    {
      type: "pick",
      q: "Each rectangle is one symbol of the finished tree: its width is how many times it was reported and its height is the length of its code in bits. Its area is therefore the total bits that symbol costs over the day. Tap the symbol that spends the most bits in total.",
      fig: areaFig,
      a: "R",
      hint: "Compare 18×1, 11×2, 8×3, 5×4, 3×5 and 1×5.",
      why: "The areas are Sun 18, Cloud 22, Rain 24, Wind 20, Fog 15 and Hail 5, adding up to 104. Rain wins even though it is neither the commonest nor the rarest report. Huffman gives common symbols short codes and rare ones long codes, so the areas end up fairly level.",
    },
    {
      type: "bug",
      q: "This function should add up the bits Huffman's merging costs for a list of counts. Every merge should cost the combined count of the two nodes. It gives totals that are too small. Click the faulty line.",
      code: [
        "def total_bits(counts):",
        "    q = sorted(counts)",
        "    bits = 0",
        "    while len(q) > 1:",
        "        a = q.pop(0)",
        "        b = q.pop(0)",
        "        bits += a",
        "        q.append(a + b)",
        "        q.sort()",
        "    return bits",
      ],
      a: 6,
      why: "Merging a and b pushes every report beneath either node one bit deeper, which costs a + b bits, not just a. With bits += a + b the counts [1, 3, 5, 8, 11, 18] give the workshop's 104.",
    },
    {
      type: "match",
      q: "Match each part of the workshop's tree to what it tells you.",
      pairs: [
        ["A leaf's count", "How often that symbol was reported"],
        ["A leaf's depth", "The length of its codeword in bits"],
        ["A merged node's count", "The bits that merge adds to the total"],
        ["The root's count", "Every report of the day (46)"],
      ],
      why: "Counts of leaves are the data. How far down a leaf sits is how many 0 or 1 choices spell its code. A merged node's count is how many reports sit beneath it, and each of them pays one more bit for that merge. The root holds all of them, so its count is the whole day's 46 reports.",
    },
  ]);

  /* ======================================================================
     a6-crc
     ====================================================================== */
  // burst bands on a 12-bit frame
  const burstFig = (() => {
    const rows = [
      ["A", [4, 5]],
      ["B", [7, 9, 10]],
      ["C", [2, 3, 5, 6]],
      ["D", [5, 6, 8, 10]],
    ];
    let s = TX(8, 16, "Generator 10011 (degree 4), 12-bit frame, flipped bits in red", { a: "start", s: 12, f: MUTE });
    rows.forEach(([id, flips], r) => {
      const y = 30 + r * 56,
        first = Math.min(...flips),
        last = Math.max(...flips);
      let cells = "";
      for (let i = 1; i <= 12; i++)
        cells += RC(44 + (i - 1) * 26, y, 24, 26, {
          r: 5,
          f: flips.includes(i) ? RED : "var(--panel)",
          fo: flips.includes(i) ? 0.45 : 1,
          k: flips.includes(i) ? RED : "var(--line-2)",
        });
      const x1 = 44 + (first - 1) * 26,
        x2 = 44 + (last - 1) * 26 + 24;
      s += PK(
        id,
        hit(2, y - 6, 356, 52) +
          TX(10, y + 19, id, { a: "start", s: 14 }) +
          cells +
          LN(x1, y + 33, x2, y + 33, { k: BLU, w: 3 }) +
          LN(x1, y + 28, x1, y + 38, { k: BLU, w: 3 }) +
          LN(x2, y + 28, x2, y + 38, { k: BLU, w: 3 }),
      );
    });
    return SVG(360, 256, s, "Four damaged copies of a 12-bit frame with the damaged stretch bracketed");
  })();

  // log-scale: chance a junk frame passes vs check bits
  const junkFig = (() => {
    const X = (r) => 50 + (r - 1) * 38,
      Y = (p) => 30 + Math.log2(50 / p) * 24;
    let s = "";
    for (let k = 0; k < 8; k++) {
      const p = 50 / 2 ** k,
        y = Y(p);
      s +=
        LN(44, y, 330, y, { k: "var(--line-soft, var(--line))", w: 1 }) +
        TX(38, y + 4, +p.toFixed(1) + "%", { a: "end", s: 10, f: MUTE });
    }
    s +=
      LN(44, Y(2), 336, Y(2), { k: RED, w: 2.5, d: "7 5" }) +
      TX(336, Y(2) - 6, "limit: 2 in 100", { a: "end", s: 11, f: RED });
    let path = "";
    for (let r = 1; r <= 8; r++) path += (r === 1 ? "M" : "L") + X(r) + " " + Y(50 / 2 ** (r - 1)) + " ";
    s += `<path d="${path}" fill="none" stroke="${BLU}" stroke-width="3"/>`;
    for (let r = 1; r <= 8; r++)
      s +=
        PK(
          "r" + r,
          CI(X(r), Y(50 / 2 ** (r - 1)), 15, { f: "transparent", k: "transparent", w: 1 }) +
            CI(X(r), Y(50 / 2 ** (r - 1)), 6, { f: BLU, k: BLU, w: 1.5 }),
        ) + TX(X(r), 236, r, { s: 12 });
    s +=
      TX(190, 254, "check bits r (the remainder length)", { s: 11, f: MUTE }) +
      TX(10, 16, "chance junk is accepted (each line halves it)", { a: "start", s: 11, f: MUTE });
    return SVG(
      360,
      262,
      s,
      "Chart on a halving scale: chance that junk is accepted for a CRC with 1 to 8 check bits, with a limit line at 2 in 100",
    );
  })();

  // heatmap of pairs of flips on an 11-bit frame
  const pairsFig = (() => {
    let s = TX(180, 16, "Two flipped bits at positions i and j of an 11-bit frame", { s: 12, f: MUTE });
    for (let j = 2; j <= 11; j++) s += TX(60 + (j - 2) * 28 + 13, 38, j, { s: 11, f: MUTE });
    for (let i = 1; i <= 10; i++) {
      s += TX(40, 60 + (i - 1) * 28 + 18, i, { a: "end", s: 11, f: MUTE });
      for (let j = i + 1; j <= 11; j++) {
        const bad = j - i === 7;
        s += RC(60 + (j - 2) * 28, 60 + (i - 1) * 28, 26, 26, {
          r: 5,
          f: bad ? RED : "var(--panel-2, var(--panel))",
          fo: bad ? 0.55 : 1,
          k: bad ? RED : "var(--line-2)",
          w: bad ? 2 : 1.5,
        });
      }
    }
    s +=
      RC(60, 344, 14, 14, { r: 3, f: RED, fo: 0.55, k: RED, w: 1.5 }) +
      TX(80, 356, "slips past the CRC (generator 1101)", { a: "start", s: 12 });
    s += TX(10, 50, "i", { a: "start", s: 12, f: MUTE }) + TX(344, 38, "j", { s: 12, f: MUTE });
    return SVG(360, 368, s, "Grid of all pairs of flipped positions in an 11-bit frame; four cells are red");
  })();

  // overhead of a 32-bit CRC on small and large frames
  const overheadFig = (() => {
    const bar = (y, label, payload, pw) =>
      TX(8, y - 8, label, { a: "start", s: 13 }) +
      RC(8, y, 344, 30, { r: 5, f: BLU, fo: 0.25, k: BLU, w: 2 }) +
      RC(8 + 344 - pw, y, pw, 30, { r: 3, f: AMB, fo: 0.8, k: AMB, w: 2 });
    let s =
      bar(34, "Frame A: 64 bytes", 512, (344 * 32) / 544) +
      TX(8, 82, "payload 512 bits + CRC 32 bits", { a: "start", s: 12, f: MUTE });
    s +=
      bar(124, "Frame B: 1,500 bytes", 12000, Math.max((344 * 32) / 12032, 1.6)) +
      TX(8, 172, "payload 12,000 bits + CRC 32 bits", { a: "start", s: 12, f: MUTE });
    s +=
      RC(8, 190, 14, 14, { r: 3, f: BLU, fo: 0.25, k: BLU, w: 1.5 }) +
      TX(28, 202, "payload", { a: "start", s: 12 }) +
      RC(100, 190, 14, 14, { r: 3, f: AMB, fo: 0.8, k: AMB, w: 1.5 }) +
      TX(120, 202, "32-bit CRC", { a: "start", s: 12 });
    return SVG(
      360,
      214,
      s,
      "Two frames drawn to the same length: the CRC takes a visible slice of the 64-byte frame and a hair-thin slice of the 1,500-byte frame",
    );
  })();

  B.add("a6-crc", [
    {
      type: "pick",
      q: "A CRC with generator 10011 (degree 4) promises to catch any burst whose first and last flipped bits are at most 4 places apart, whatever sits in between. Four damaged copies of a 12-bit frame are shown, with a bracket under each damaged stretch. Tap every copy whose damage the CRC is guaranteed to catch from its span alone.",
      fig: burstFig,
      a: ["A", "B"],
      hint: "Count from the first red cell to the last red cell, gaps included.",
      why: "A spans 2 places and B spans 4 (a gap inside a burst is allowed), so both fit inside the degree-4 promise. C spans 5 and D spans 6: some patterns of that length are multiples of the generator and slip through (a 5-place burst that spells 10011 itself is one). The promise is about the span, not the number of flips: B has only three flips yet is covered, while D has four flips and is not.",
    },
    {
      type: "pick",
      q: "Junk arrives instead of a real frame, so every remainder is equally likely. The chart shows the chance that junk is wrongly accepted by a CRC with r check bits. Each gridline is half the one above. A link must let fewer than 2 junk frames in 100 through (the dashed line). Tap the smallest r that is good enough.",
      fig: junkFig,
      a: "r6",
      hint: "Each extra check bit halves the chance: 50, 25, 12.5, 6, 3, 1.6 ... in percent.",
      why: "Junk passes only if its remainder is all zeros: 1 chance in 2^r. Each extra check bit halves the chance, so the points fall on a straight line on this halving scale. With r = 5 the chance is about 3 in 100, still above the limit. r = 6 gives about 1.6 in 100, the first point below it. Real CRCs use 16 or 32 bits.",
    },
    {
      type: "mcq",
      q: "Generator 1101 caught every pair of flips on a 7-bit frame. On this longer 11-bit frame, four pairs of flips (red) slip past it. What do the red cells have in common, and why does it matter?",
      fig: pairsFig,
      o: [
        "Each pair is 7 places apart, so a longer frame lets two flips line up like a multiple of the generator",
        "Each pair includes a remainder bit, so damage to the check bits cannot be seen by the receiver",
        "Each pair touches an end of the frame, where the long division has no 1 to cancel against",
        "Each pair is a pair of neighbours, because a CRC is weakest against bits that sit side by side",
      ],
      a: 0,
      why: "The red cells all sit on one diagonal: j − i = 7. Two flips 7 places apart look like 10000001, and that divides evenly by 1101, so the remainder is 000 and nothing is noticed. In a 7-bit frame no two positions are 7 apart, so the guarantee held. A generator's guarantees depend on the frame length as well as on its degree.",
      hint: "Look at the distance between i and j for each red cell.",
    },
    {
      type: "slider",
      q: "A 32-bit CRC is added to a short 64-byte frame and to a long 1,500-byte frame (bars drawn to the same length). About how many times larger is the CRC's share of the short frame than of the long one?",
      fig: overheadFig,
      min: 1,
      max: 50,
      step: 1,
      ans: 22,
      tol: 6,
      unit: "×",
      hint: "The CRC is the same 32 bits in both. The payloads differ by 1,500 ÷ 64, which is a bit over 20.",
      why: "The CRC takes 32 of 544 bits (about 5.9%) in the short frame and 32 of 12,032 bits (about 0.27%) in the long one. 5.9 ÷ 0.27 is about 22, roughly how much longer the long payload is. A fixed-size check is almost free on big frames but costs noticeably on tiny ones.",
    },
  ]);

  /* ======================================================================
     a6-hamming
     ====================================================================== */
  // position table with binary labels and parity/data roles
  const posTableFig = (() => {
    let s = TX(8, 22, "position", { a: "start", s: 11, f: MUTE }) + TX(8, 52, "role", { a: "start", s: 11, f: MUTE });
    [
      ["p4", 4],
      ["p2", 2],
      ["p1", 1],
    ].forEach(([n, b], r) => (s += TX(8, 92 + r * 32, n, { a: "start", s: 13, f: MUTE })));
    for (let p = 1; p <= 7; p++) {
      const x = 56 + (p - 1) * 43,
        par = [1, 2, 4].includes(p);
      s +=
        RC(x, 6, 38, 196, { r: 8, f: par ? BLU : "var(--panel)", fo: par ? 0.15 : 1, k: par ? BLU : "var(--line-2)" }) +
        TX(x + 19, 28, p, { s: 17 }) +
        TX(x + 19, 54, par ? "parity" : "data", { s: 10, f: par ? BLU : MUTE });
      [4, 2, 1].forEach(
        (b, r) => (s += TX(x + 19, 98 + r * 32, p & b ? "1" : "0", { s: 17, m: 1, f: p & b ? "var(--text)" : MUTE })),
      );
    }
    return SVG(360, 212, s, "Hamming(7,4) positions 1 to 7 written in binary, with parity positions 1, 2 and 4 shaded");
  })();

  // block length vs code rate and fixable share
  const blockFig = (() => {
    const ns = [7, 15, 31, 63, 127],
      rate = [57, 73, 84, 90, 94],
      ok = [99.8, 99.0, 96.2, 86.9, 63.7];
    const X = (i) => 60 + i * 62,
      Y = (v) => 222 - v * 1.7;
    let s = "";
    [0, 25, 50, 75, 100].forEach(
      (v) =>
        (s +=
          LN(46, Y(v), 340, Y(v), { k: "var(--line-soft, var(--line))", w: 1 }) +
          TX(40, Y(v) + 4, v + "%", { a: "end", s: 10, f: MUTE })),
    );
    const path = (a, col) =>
      `<path d="${a.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ")}" fill="none" stroke="${col}" stroke-width="3"/>` +
      a.map((v, i) => CI(X(i), Y(v), 4.5, { f: col, k: col, w: 1 })).join("");
    s += path(rate, BLU) + path(ok, RED);
    ns.forEach((n, i) => (s += TX(X(i), 242, n, { s: 12 })));
    s += TX(200, 260, "block length (bits)", { s: 11, f: MUTE });
    s +=
      RC(48, 4, 12, 12, { r: 3, f: BLU, k: BLU, w: 1 }) +
      TX(66, 15, "code rate (share of bits that are data)", { a: "start", s: 11 }) +
      RC(48, 22, 12, 12, { r: 3, f: RED, k: RED, w: 1 }) +
      TX(66, 33, "blocks with one flip or none", { a: "start", s: 11 });
    return SVG(
      360,
      268,
      s,
      "Two lines against block length 7, 15, 31, 63, 127: code rate rises from 57 to 94 per cent, blocks with at most one flip fall from 99.8 to 63.7 per cent",
    );
  })();

  // pipeline with four flip spots
  const pipeFig = (() => {
    const box = (x, w, t) => RC(x, 24, w, 38, { r: 10 }) + TX(x + w / 2, 48, t, { s: 11 });
    let s = box(4, 50, "Data") + box(82, 56, "Encoder") + box(218, 56, "Decoder") + box(302, 54, "Output");
    s += LN(54, 43, 82, 43, { w: 2.5 }) + LN(138, 43, 218, 43, { w: 2.5, d: "6 4" }) + LN(274, 43, 302, 43, { w: 2.5 });
    s += TX(178, 82, "wire", { s: 11, f: MUTE });
    [
      ["A", 68],
      ["B", 160],
      ["C", 196],
      ["D", 288],
    ].forEach(([k, x]) => (s += PK(k, CI(x, 43, 11, { f: AMB, fo: 0.3, k: AMB, w: 2.5 }) + TX(x, 48, k, { s: 13 }))));
    [
      ["A", "Data bit flips in memory, before encoding"],
      ["B", "One data bit flips on the wire"],
      ["C", "One check bit flips on the wire"],
      ["D", "One bit flips in the output, after decoding"],
    ].forEach(
      ([k, t], i) => (s += TX(10, 112 + i * 24, `<tspan fill="${AMB}">${k}</tspan>  ${t}`, { a: "start", s: 12 })),
    );
    return SVG(
      360,
      206,
      s,
      "Pipeline from data through an encoder, a noisy wire and a decoder to the output, with four marked places where a bit can flip",
    );
  })();

  B.add("a6-hamming", [
    {
      type: "cat",
      q: "A Hamming(7,4) receiver shows its three checks as lamps, p4 p2 p1 (✗ = that check fails). Use the position table to decide what the single-error fix does in each case: leave the four data bits alone, or flip one of them back?",
      fig: posTableFig,
      buckets: ["Data bits already fine", "A data bit is flipped back"],
      items: [
        ["p4 ✗  p2 ✓  p1 ✓", 0],
        ["p4 ✓  p2 ✗  p1 ✗", 1],
        ["p4 ✓  p2 ✓  p1 ✗", 0],
        ["p4 ✗  p2 ✗  p1 ✗", 1],
        ["p4 ✓  p2 ✓  p1 ✓", 0],
        ["p4 ✗  p2 ✓  p1 ✗", 1],
      ],
      why: "Read the lamps as a binary number (p4 first) and find that column. 100 is position 4, 001 is position 1 and 000 is no flip at all: parity bits (or nothing), so the data was never touched. 011, 111 and 101 name positions 3, 7 and 5, which hold data bits, so the fix flips a data bit back.",
    },
    {
      type: "slider",
      q: "A Hamming code can only repair a block with at most one flipped bit. The chart compares block lengths when every bit flips with a 1% chance. About what percentage of 127-bit blocks arrive with two or more flipped bits?",
      fig: blockFig,
      min: 0,
      max: 100,
      step: 1,
      ans: 36,
      tol: 6,
      unit: "%",
      hint: "Find the red line at 127. That is the share with one flip or none. What is left?",
      why: 'At 127 bits the red line is at about 64%, so roughly 36% of blocks carry two or more flips and cannot be repaired (they may even be "repaired" wrongly). Longer blocks waste fewer bits on checks (the blue line rises) but collect more errors (the red line falls), so the best block size depends on how noisy the link is.',
    },
    {
      type: "pick",
      q: "Hamming(7,4) protects the bits between the encoder and the decoder. One bit flips at each marked spot (A to D, one spot at a time). Tap every spot where the receiver ends up with the correct data.",
      fig: pipeFig,
      a: ["B", "C"],
      hint: "Where does the code get a chance to look at the bits?",
      why: "Anything that damages the codeword on the wire, whether a data bit or a check bit, shows up in the syndrome and is repaired. A happens before the encoder: the checks are built around the wrong data, so everything passes. D happens after decoding, when no check is looking any more. The code only guards the stretch between encoder and decoder.",
    },
    {
      type: "multi",
      q: "Which of these statements about Hamming(7,4) are true? Select all that apply.",
      o: [
        "A flipped check bit still gives a non-zero syndrome",
        "Syndrome 000 proves that no bit was flipped",
        "The three checks give 8 outcomes: no error, or one of 7 positions",
        "Adding a fourth check bit lets it repair any two flips",
      ],
      a: [0, 2],
      why: 'A flipped check bit makes its own check fail (and no other), so the syndrome names that position. Three yes/no checks give 2³ = 8 outcomes: exactly "nothing wrong" plus the 7 positions. Syndrome 000 does not prove the word is clean, because three flips at positions like 1, 2 and 3 cancel out (001, 010 and 011 add up to 000). One extra check bit adds detection of two flips (SECDED), not repair.',
    },
  ]);
})();

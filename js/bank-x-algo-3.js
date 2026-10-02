/* Revision bank, third set of varied, visual questions (algo-3): the Phase 6 and 7 workshops (a6-wire, a7-build)
   and the sessions a6-crc, a6-hamming, a7-entropy, a7-huffman, a7-lzw.
   Every number was produced by running the real algorithms in node (CRC division, Huffman merges, LZW traces, entropies). */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG helpers (CSS variables so both themes work) ---------- */
  const SVG = (w, h, inner, label) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto" role="img" aria-label="${label}">${inner}</svg>`;
  const TX = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" fill="${o.f || "var(--text)"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "ui-monospace,Consolas,monospace" : "var(--sans)"}">${s}</text>`;
  const RC = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r == null ? 8 : o.r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const LN = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const CI = (x, y, r, o = {}) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"/>`;
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const MUTE = "var(--text-2, var(--text))";
  const RED = "var(--rose)", GRN = "var(--teal)", BLU = "var(--blue)", AMB = "var(--amber)", VIO = "var(--violet)";
  const hit = (x, y, w, h) => RC(x, y, w, h, { r: 8, f: "transparent", k: "transparent", w: 1 });
  const ent = (ps) => -ps.filter((p) => p > 0).reduce((s, p) => s + p * Math.log2(p), 0);

  /* ======================================================================
     a6-wire  (workshop: noisy wire)
     ====================================================================== */
  // 1. four received copies of an even-parity frame (diff view against the sent frame)
  const parityRowsFig = (() => {
    const sent = [1, 0, 1, 1, 0, 0, 1, 0];
    const rows = [["A", [5]], ["B", [1, 4]], ["C", [0, 2, 7]], ["D", [3, 4, 5, 6]]];
    const cell = (x, y, v, bad, par) => RC(x, y, 30, 28, { r: 6, f: bad ? RED : par ? BLU : "var(--panel)", fo: bad ? 0.3 : par ? 0.14 : 1, k: bad ? RED : par ? BLU : "var(--line-2)" }) + TX(x + 15, y + 20, v, { m: 1, s: 15 });
    let s = TX(8, 36, "Sent", { a: "start" }) + TX(309, 14, "parity", { s: 11, f: MUTE });
    sent.forEach((v, i) => (s += cell(78 + i * 33, 22, v, false, i === 7)));
    rows.forEach(([id, flips], r) => {
      const y = 70 + r * 44;
      let cells = "";
      sent.forEach((v, i) => { const bad = flips.includes(i); cells += cell(78 + i * 33, y, bad ? 1 - v : v, bad, false); });
      s += PK(id, hit(2, y - 6, 356, 40) + TX(10, y + 20, "Copy " + id, { a: "start", s: 12 }) + cells);
    });
    return SVG(360, 246, s, "Four received copies of an eight-bit parity frame, flipped bits in red");
  })();

  // 2. grouped bars: share of damaged frames that slip through, by number of flips
  const slipBarsFig = (() => {
    const par = [0, 100, 0, 100], crc = [0, 0, 20, 20];
    let s = RC(8, 6, 14, 14, { r: 3, f: AMB, fo: 0.55, k: AMB, w: 1.5 }) + TX(28, 18, "Parity, 8-bit frame", { a: "start", s: 12 })
      + RC(8, 26, 14, 14, { r: 3, f: BLU, fo: 0.55, k: BLU, w: 1.5 }) + TX(28, 38, "CRC 1101, 7-bit frame", { a: "start", s: 12 });
    s += LN(20, 196, 350, 196) + TX(300, 22, "% that slip through", { s: 11, f: MUTE });
    const bar = (id, x, v, col) => { const h = Math.max(v * 1.2, 2.5); return PK(id, hit(x - 1, 50, 30, 148) + RC(x, 196 - h, 28, h, { r: 3, f: col, fo: 0.6, k: col, w: 2 }) + TX(x + 14, 196 - h - 6, v + "%", { s: 12 })); };
    for (let g = 0; g < 4; g++) {
      const cx = 62 + g * 86;
      s += bar("p" + (g + 1), cx - 32, par[g], AMB) + bar("c" + (g + 1), cx + 4, crc[g], BLU) + TX(cx, 216, g + 1 + (g ? " flips" : " flip"), { s: 12 });
    }
    return SVG(360, 226, s, "Grouped bars: percentage of damaged frames that slip through, for parity and for a CRC, at one to four flipped bits");
  })();

  // 3. sphere-packing: 16 clouds of 8 words
  const cloudsFig = (() => {
    let s = "";
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const x = 10 + c * 85, y = 8 + r * 68, cx = x + 42, cy = y + 36, sent = r === 1 && c === 2;
      s += RC(x, y, 80, 62, { r: 12, f: sent ? GRN : "var(--panel)", fo: sent ? 0.14 : 1, k: sent ? GRN : "var(--line-2)", w: sent ? 3 : 2 });
      for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 - Math.PI / 2; s += CI(cx + 22 * Math.cos(a), cy + 20 * Math.sin(a), 3.4, { f: MUTE, fo: 0.5, k: "transparent", w: 0 }); }
      s += CI(cx, cy, 6.5, { f: BLU, k: BLU, w: 1.5 });
      if (sent) s += TX(x + 6, y + 13, "sent", { a: "start", s: 11, f: GRN });
    }
    s += TX(180, 294, "16 clouds × 8 words = 128 words: every possible 7-bit word", { s: 12, f: MUTE });
    return SVG(360, 304, s, "Sixteen clouds, each a codeword with its seven one-flip neighbours, covering all 128 seven-bit words");
  })();

  // 6. damaged frames by number of flips (counts out of 100,000)
  const damagedFig = (() => {
    const rows = [["1 flip", 7457, "odd"], ["2 flips", 264, "even"], ["3 flips", 5, "odd"]];
    let s = TX(180, 18, "Damaged frames out of 100,000 sent", { s: 13 });
    rows.forEach(([n, v, par], i) => {
      const y = 38 + i * 46, w = Math.max((v / 7457) * 215, 2.5);
      s += TX(10, y + 22, n, { a: "start", s: 13 }) + RC(76, y, w, 32, { r: 4, f: BLU, fo: 0.45, k: BLU, w: 2 }) + TX(76 + w + 8, y + 22, v.toLocaleString("en-GB"), { a: "start", s: 14 });
    });
    s += TX(180, 188, "8-bit frames, every bit flips with chance 1%", { s: 12, f: MUTE });
    return SVG(360, 200, s, "Bar chart of damaged frames by number of flipped bits: 7,457 with one flip, 264 with two, 5 with three");
  })();

  B.add("a6-wire", [
    { type: "pick", q: "An 8-bit frame is sent with even parity (the last bit is the parity bit). Four received copies are shown, with the flipped bits in red. Tap every copy the receiver would accept as clean even though it is damaged.",
      fig: parityRowsFig, a: ["B", "D"], hint: "Parity only checks whether the count of 1s is odd or even. What does an even number of flips do to that count?",
      why: "Each flip changes the count of 1s by one. One flip (A) or three flips (C) leave the count odd, so the receiver notices. Two flips (B) and four flips (D) change the count by an even amount, so it looks fine and the damaged frame is accepted. Whether the flips sit side by side or far apart makes no difference." },
    { type: "pick", q: "Noise on a link usually flips exactly two bits of a frame. The bars show how many damaged frames slip through undetected for each scheme. Tap the bar that shows how often the CRC lets a two-flip frame through.",
      fig: slipBarsFig, a: "c2", hint: "Blue is the CRC. Read its bar for 2 flips, even if it is hard to see.",
      why: "All 21 ways to flip two of the seven bits leave a non-zero remainder after dividing by 1101, so the CRC bar at two flips is 0%. Parity is the opposite: two flips always keep the count of 1s even, so every two-flip frame is accepted (100%). The CRC first leaks at three flips, where 7 of the 35 patterns happen to be multiples of 1101." },
    { type: "mcq", q: "Hamming(7,4) has 16 valid codewords. In the picture, each cloud is one codeword (big dot) plus the seven words one flip away from it (small dots). The sent codeword is outlined in green. Two bits flip on the wire. Where does the damaged word land, and what does the receiver do?",
      fig: cloudsFig, o: ["In a different codeword's cloud, so it is quietly \"fixed\" to the wrong word", "Outside every cloud, so the receiver can tell it is beyond repair", "Still inside the sent word's cloud, so the usual fix recovers the data", "On a border between two clouds, so the receiver reports a tie it cannot break"], a: 0,
      why: "The 16 clouds use up all 128 words (16 × 8), so no word is left outside. Two flips move the word two steps from the codeword it started as, which puts it in a different codeword's cloud, because codewords are at least three flips apart. The receiver \"repairs\" it to that wrong codeword and never knows. Hamming(7,4) cannot say \"too damaged\": every word looks fixable." },
    { type: "match", q: "Match each thing you do in the noisy-wire workshop to what the receiver reports.",
      pairs: [["Flip one bit on the Parity tab", "Count goes odd: caught, but not located"], ["Flip two bits on the Parity tab", "Count stays even: accepted, damage unseen"], ["Flip three neighbouring bits on the CRC tab (generator 1101)", "Remainder is not 000: rejected"], ["Flip two bits on the Hamming tab, then press Auto-correct", "A third, innocent bit gets flipped"]],
      why: "One flip makes the count of 1s odd, but parity cannot say which bit. Two flips cancel and parity says all clear. A degree-3 generator catches every burst up to 3 bits wide, so three in a row never leaves remainder 000. With two flips the Hamming syndrome is the XOR of the two positions, which names a third bit that was fine, so auto-correct damages it." },
    { type: "bug", q: "This receiver should accept a frame only when its count of 1s is even (even parity). In the workshop it never notices a single flipped bit. Click the faulty line.",
      code: ["def looks_clean(frame):", "    ones = 0", "    for bit in frame:", "        ones += 1", "    return ones % 2 == 0"], a: 3,
      why: "ones += 1 counts every bit, 0s as well as 1s, so it just measures the length of the frame (always 8) and the verdict never changes. It should add the bit itself: ones += bit. Then a flip changes the total by one and the answer flips with it." },
    { type: "slider", q: "Each of the 8 bits of a frame flips with a 1% chance. Out of 100,000 frames sent, the chart counts the damaged ones by how many bits flipped. Even parity accepts a damaged frame whenever an even number of bits flipped. About what percentage of the damaged frames does it accept?",
      fig: damagedFig, min: 0, max: 20, step: 1, ans: 3, tol: 2, unit: "%", hint: "Only the 2-flip bar slips past. 7,457 is about 28 times 264, so the share is roughly 1 in 30.",
      why: "The 264 frames with two flips are accepted, out of 7,726 damaged ones in total: about 3.4%. On a quiet link a single flip is by far the commonest damage, and parity catches those every time. Parity's blind spot grows as the noise gets heavier, because multi-flip damage becomes more likely." },
  ]);

  /* ======================================================================
     a7-build  (workshop: build the tree)
     ====================================================================== */
  // 1. queue chips, smallest first
  const queueFig = (() => {
    const chips = [["Fog+Hail", 4, true], ["Wind", 5], ["Rain", 8], ["Cloud", 11], ["Sun", 18]];
    let s = TX(8, 18, "The queue, smallest first", { a: "start", s: 12, f: MUTE });
    chips.forEach(([n, v, nw], i) => { const x = 8 + i * 70; s += RC(x, 30, 62, 58, { r: 12, f: nw ? AMB : "var(--panel)", fo: nw ? 0.18 : 1, k: nw ? AMB : "var(--line-2)", d: nw ? "5 4" : "" }) + TX(x + 31, 52, n, { s: n.length > 6 ? 11 : 12 }) + TX(x + 31, 77, v, { s: 20 }); });
    return SVG(360, 100, s, "Queue of nodes: Fog+Hail 4, Wind 5, Rain 8, Cloud 11, Sun 18");
  })();

  // 2. before/after diff table after the mistaken first merge
  const diffFig = (() => {
    const rows = [["S", "Sun", 18, 1, 2], ["C", "Cloud", 11, 2, 2], ["R", "Rain", 8, 3, 3], ["W", "Wind", 5, 4, 4], ["F", "Fog", 3, 5, 4], ["H", "Hail", 1, 5, 2]];
    let s = TX(70, 20, "Symbol", { s: 11, f: MUTE }) + TX(140, 20, "Count", { s: 11, f: MUTE }) + TX(208, 20, "Before", { s: 11, f: MUTE }) + TX(300, 20, "After", { s: 11, f: MUTE }) + TX(254, 9, "code length (bits)", { s: 10, f: MUTE });
    rows.forEach(([id, n, f, b, a], i) => {
      const y = 28 + i * 34, col = a > b ? RED : a < b ? GRN : "var(--line-2)";
      s += PK(id, hit(2, y - 2, 356, 32) + TX(14, y + 20, id, { a: "start", s: 15 }) + TX(40, y + 20, n, { a: "start", s: 13, f: MUTE }) + TX(140, y + 20, "× " + f, { s: 14 })
        + RC(188, y, 40, 28, { r: 8 }) + TX(208, y + 20, b, { s: 15 }) + TX(246, y + 20, "→", { s: 15, f: MUTE })
        + RC(264, y, 72, 28, { r: 8, f: a === b ? "var(--panel)" : col, fo: a === b ? 1 : 0.22, k: col }) + TX(300, y + 20, a + (a > b ? "  longer" : a < b ? "  shorter" : "  same"), { s: 12 }));
    });
    return SVG(360, 236, s, "Table of code lengths before and after the mistaken first merge: Sun 1 to 2, Cloud 2 to 2, Rain 3 to 3, Wind 4 to 4, Fog 5 to 4, Hail 5 to 2");
  })();

  // 3. the finished Huffman tree
  const treeFig = (() => {
    const L = (id, x, y, col) => ({ id, x, y, col, leaf: 1 });
    const nodes = {
      root: { x: 258, y: 30, w: 46 }, n28: { x: 200, y: 84, w: 28 }, n17: { x: 141, y: 138, w: 17 }, n9: { x: 78, y: 192, w: 9 }, n4: { x: 120, y: 246, w: 4 },
      S: L("S", 316, 84, GRN), C: L("C", 260, 138, BLU), R: L("R", 204, 192, VIO), W: L("W", 36, 246, AMB), F: L("F", 92, 300, RED), H: L("H", 148, 300, MUTE),
    };
    const edges = [["root", "n28", 0], ["root", "S", 1], ["n28", "n17", 0], ["n28", "C", 1], ["n17", "n9", 0], ["n17", "R", 1], ["n9", "W", 0], ["n9", "n4", 1], ["n4", "F", 0], ["n4", "H", 1]];
    let s = "";
    edges.forEach(([a, b, bit]) => {
      const A = nodes[a], Bn = nodes[b], mx = (A.x + Bn.x) / 2, my = (A.y + Bn.y) / 2;
      s += LN(A.x, A.y, Bn.x, Bn.y, { w: 2.5 }) + CI(mx, my, 9, { f: "var(--panel)", k: "var(--line-2)", w: 1.5 }) + TX(mx, my + 4, bit, { s: 12, m: 1 });
    });
    ["root", "n28", "n17", "n9", "n4"].forEach((k) => { const n = nodes[k]; s += CI(n.x, n.y, 15, { f: "var(--panel)", k: "var(--line-2)" }) + TX(n.x, n.y + 5, n.w, { s: 13 }); });
    ["S", "C", "R", "W", "F", "H"].forEach((k) => { const n = nodes[k]; s += PK(k, RC(n.x - 20, n.y - 16, 40, 32, { r: 10, f: n.col, fo: 0.25, k: n.col }) + TX(n.x, n.y + 6, k, { s: 16 })); });
    return SVG(360, 330, s, "Finished Huffman tree for Sun, Cloud, Rain, Wind, Fog and Hail with 0 and 1 on each branch");
  })();

  // 4. area chart: width = count, height = code length
  const areaFig = (() => {
    const d = [["S", 18, 1, GRN], ["C", 11, 2, BLU], ["R", 8, 3, VIO], ["W", 5, 4, AMB], ["F", 3, 5, RED], ["H", 1, 5, MUTE]];
    let s = "", x = 40;
    for (let b = 1; b <= 5; b++) s += LN(40, 190 - b * 30, 342, 190 - b * 30, { k: "var(--line-soft, var(--line))", w: 1 }) + TX(32, 194 - b * 30, b, { a: "end", s: 11, f: MUTE });
    s += TX(10, 14, "code length (bits)", { a: "start", s: 11, f: MUTE });
    d.forEach(([k, n, len, col]) => {
      const w = n * 6.5;
      s += PK(k, RC(x, 190 - len * 30, w, len * 30, { r: 2, f: col, fo: 0.3, k: col, w: 2 })) + TX(x + w / 2, 207, n, { s: 12 }) + TX(x + w / 2, 223, k, { s: 13, f: col });
      x += w;
    });
    s += TX(6, 207, "count", { a: "start", s: 10, f: MUTE }) + TX(6, 223, "symbol", { a: "start", s: 10, f: MUTE });
    s += TX(180, 246, "S Sun · C Cloud · R Rain · W Wind · F Fog · H Hail", { s: 11, f: MUTE });
    return SVG(360, 254, s, "Rectangles for each symbol: width is how often it was reported, height is its code length");
  })();

  B.add("a7-build", [
    { type: "mcq", q: "The workshop shows the queue smallest first. The two smallest nodes merge next. After that merge, which two nodes are at the front of the queue?",
      fig: queueFig, o: ["Rain (8), then the new node (9)", "Rain (8), then Cloud (11)", "The new node (9), then Cloud (11)", "Wind (5), then Rain (8)"], a: 0,
      why: "Fog+Hail (4) and Wind (5) merge into a node of weight 9. The queue stays sorted by weight, so the 9 slots in between Rain (8) and Cloud (11): the queue is now 8, 9, 11, 18. A merged node is not special, it just competes on its total." },
    { type: "pick", q: "A learner merges Hail (1) with Sun (18) first, then carries on smallest-first. The table shows each code length before and after that mistake. A symbol's extra bits are its count times the change in its code length. Tap the symbol that adds the most bits to the day's total.",
      fig: diffFig, a: "S", hint: "Multiply each count by how much its code grew. Codes that got shorter are savings.",
      why: "Sun is reported 18 times and its code grows from 1 bit to 2, adding 18 bits. Fog and Hail get shorter (saving 3 and 3 bits), and Cloud, Rain and Wind do not change. Net: 18 − 3 − 3 = 12 extra bits, so 116 bits instead of 104. Hail's code changed the most, but it is so rare that it hardly matters." },
    { type: "pick", q: "The reports arrive as one unbroken bit stream, 0 0 1 0 0 0 0 0 1, and the receiver walks the finished tree from the root, starting again at the root after each leaf. Tap the leaf where the SECOND report ends.",
      fig: treeFig, a: "W", hint: "Follow the first bits until you hit a leaf, restart, and do it again.",
      why: "0 0 1 goes root, 0, 0, 1 and lands on Rain: the first report. Restarting at the root, 0 0 0 0 reaches Wind: the second report. The last 0 1 is Cloud. Every codeword ends at a leaf, so the receiver never needs a separator between reports." },
    { type: "pick", q: "Each rectangle is one symbol of the finished tree: its width is how many times it was reported and its height is the length of its code in bits. Its area is therefore the total bits that symbol costs over the day. Tap the symbol that spends the most bits in total.",
      fig: areaFig, a: "R", hint: "Compare 18×1, 11×2, 8×3, 5×4, 3×5 and 1×5.",
      why: "The areas are Sun 18, Cloud 22, Rain 24, Wind 20, Fog 15 and Hail 5, adding up to 104. Rain wins even though it is neither the commonest nor the rarest report. Huffman gives common symbols short codes and rare ones long codes, so the areas end up fairly level." },
    { type: "bug", q: "This function should add up the bits Huffman's merging costs for a list of counts. Every merge should cost the combined count of the two nodes. It gives totals that are too small. Click the faulty line.",
      code: ["def total_bits(counts):", "    q = sorted(counts)", "    bits = 0", "    while len(q) > 1:", "        a = q.pop(0)", "        b = q.pop(0)", "        bits += a", "        q.append(a + b)", "        q.sort()", "    return bits"], a: 6,
      why: "Merging a and b pushes every report beneath either node one bit deeper, which costs a + b bits, not just a. With bits += a + b the counts [1, 3, 5, 8, 11, 18] give the workshop's 104." },
    { type: "match", q: "Match each part of the workshop's tree to what it tells you.",
      pairs: [["A leaf's count", "How often that symbol was reported"], ["A leaf's depth", "The length of its codeword in bits"], ["A merged node's count", "The bits that merge adds to the total"], ["The root's count", "Every report of the day (46)"]],
      why: "Counts of leaves are the data. How far down a leaf sits is how many 0 or 1 choices spell its code. A merged node's count is how many reports sit beneath it, and each of them pays one more bit for that merge. The root holds all of them, so its count is the whole day's 46 reports." },
  ]);

  /* ======================================================================
     a6-crc
     ====================================================================== */
  // burst bands on a 12-bit frame
  const burstFig = (() => {
    const rows = [["A", [4, 5]], ["B", [7, 9, 10]], ["C", [2, 3, 5, 6]], ["D", [5, 6, 8, 10]]];
    let s = TX(8, 16, "Generator 10011 (degree 4), 12-bit frame, flipped bits in red", { a: "start", s: 12, f: MUTE });
    rows.forEach(([id, flips], r) => {
      const y = 30 + r * 56, first = Math.min(...flips), last = Math.max(...flips);
      let cells = "";
      for (let i = 1; i <= 12; i++) cells += RC(44 + (i - 1) * 26, y, 24, 26, { r: 5, f: flips.includes(i) ? RED : "var(--panel)", fo: flips.includes(i) ? 0.45 : 1, k: flips.includes(i) ? RED : "var(--line-2)" });
      const x1 = 44 + (first - 1) * 26, x2 = 44 + (last - 1) * 26 + 24;
      s += PK(id, hit(2, y - 6, 356, 52) + TX(10, y + 19, id, { a: "start", s: 14 }) + cells + LN(x1, y + 33, x2, y + 33, { k: BLU, w: 3 }) + LN(x1, y + 28, x1, y + 38, { k: BLU, w: 3 }) + LN(x2, y + 28, x2, y + 38, { k: BLU, w: 3 }));
    });
    return SVG(360, 256, s, "Four damaged copies of a 12-bit frame with the damaged stretch bracketed");
  })();

  // log-scale: chance a junk frame passes vs check bits
  const junkFig = (() => {
    const X = (r) => 50 + (r - 1) * 38, Y = (p) => 30 + Math.log2(50 / p) * 24;
    let s = "";
    for (let k = 0; k < 8; k++) { const p = 50 / 2 ** k, y = Y(p); s += LN(44, y, 330, y, { k: "var(--line-soft, var(--line))", w: 1 }) + TX(38, y + 4, +p.toFixed(1) + "%", { a: "end", s: 10, f: MUTE }); }
    s += LN(44, Y(2), 336, Y(2), { k: RED, w: 2.5, d: "7 5" }) + TX(336, Y(2) - 6, "limit: 2 in 100", { a: "end", s: 11, f: RED });
    let path = ""; for (let r = 1; r <= 8; r++) path += (r === 1 ? "M" : "L") + X(r) + " " + Y(50 / 2 ** (r - 1)) + " ";
    s += `<path d="${path}" fill="none" stroke="${BLU}" stroke-width="3"/>`;
    for (let r = 1; r <= 8; r++) s += PK("r" + r, CI(X(r), Y(50 / 2 ** (r - 1)), 15, { f: "transparent", k: "transparent", w: 1 }) + CI(X(r), Y(50 / 2 ** (r - 1)), 6, { f: BLU, k: BLU, w: 1.5 })) + TX(X(r), 236, r, { s: 12 });
    s += TX(190, 254, "check bits r (the remainder length)", { s: 11, f: MUTE }) + TX(10, 16, "chance junk is accepted (each line halves it)", { a: "start", s: 11, f: MUTE });
    return SVG(360, 262, s, "Chart on a halving scale: chance that junk is accepted for a CRC with 1 to 8 check bits, with a limit line at 2 in 100");
  })();

  // heatmap of pairs of flips on an 11-bit frame
  const pairsFig = (() => {
    let s = TX(180, 16, "Two flipped bits at positions i and j of an 11-bit frame", { s: 12, f: MUTE });
    for (let j = 2; j <= 11; j++) s += TX(60 + (j - 2) * 28 + 13, 38, j, { s: 11, f: MUTE });
    for (let i = 1; i <= 10; i++) {
      s += TX(40, 60 + (i - 1) * 28 + 18, i, { a: "end", s: 11, f: MUTE });
      for (let j = i + 1; j <= 11; j++) { const bad = j - i === 7; s += RC(60 + (j - 2) * 28, 60 + (i - 1) * 28, 26, 26, { r: 5, f: bad ? RED : "var(--panel-2, var(--panel))", fo: bad ? 0.55 : 1, k: bad ? RED : "var(--line-2)", w: bad ? 2 : 1.5 }); }
    }
    s += RC(60, 344, 14, 14, { r: 3, f: RED, fo: 0.55, k: RED, w: 1.5 }) + TX(80, 356, "slips past the CRC (generator 1101)", { a: "start", s: 12 });
    s += TX(10, 50, "i", { a: "start", s: 12, f: MUTE }) + TX(344, 38, "j", { s: 12, f: MUTE });
    return SVG(360, 368, s, "Grid of all pairs of flipped positions in an 11-bit frame; four cells are red");
  })();

  // overhead of a 32-bit CRC on small and large frames
  const overheadFig = (() => {
    const bar = (y, label, payload, pw) => TX(8, y - 8, label, { a: "start", s: 13 }) + RC(8, y, 344, 30, { r: 5, f: BLU, fo: 0.25, k: BLU, w: 2 }) + RC(8 + 344 - pw, y, pw, 30, { r: 3, f: AMB, fo: 0.8, k: AMB, w: 2 });
    let s = bar(34, "Frame A: 64 bytes", 512, 344 * 32 / 544) + TX(8, 82, "payload 512 bits + CRC 32 bits", { a: "start", s: 12, f: MUTE });
    s += bar(124, "Frame B: 1,500 bytes", 12000, Math.max(344 * 32 / 12032, 1.6)) + TX(8, 172, "payload 12,000 bits + CRC 32 bits", { a: "start", s: 12, f: MUTE });
    s += RC(8, 190, 14, 14, { r: 3, f: BLU, fo: 0.25, k: BLU, w: 1.5 }) + TX(28, 202, "payload", { a: "start", s: 12 }) + RC(100, 190, 14, 14, { r: 3, f: AMB, fo: 0.8, k: AMB, w: 1.5 }) + TX(120, 202, "32-bit CRC", { a: "start", s: 12 });
    return SVG(360, 214, s, "Two frames drawn to the same length: the CRC takes a visible slice of the 64-byte frame and a hair-thin slice of the 1,500-byte frame");
  })();

  B.add("a6-crc", [
    { type: "pick", q: "A CRC with generator 10011 (degree 4) promises to catch any burst whose first and last flipped bits are at most 4 places apart, whatever sits in between. Four damaged copies of a 12-bit frame are shown, with a bracket under each damaged stretch. Tap every copy whose damage the CRC is guaranteed to catch from its span alone.",
      fig: burstFig, a: ["A", "B"], hint: "Count from the first red cell to the last red cell, gaps included.",
      why: "A spans 2 places and B spans 4 (a gap inside a burst is allowed), so both fit inside the degree-4 promise. C spans 5 and D spans 6: some patterns of that length are multiples of the generator and slip through (a 5-place burst that spells 10011 itself is one). The promise is about the span, not the number of flips: B has only three flips yet is covered, while D has four flips and is not." },
    { type: "pick", q: "Junk arrives instead of a real frame, so every remainder is equally likely. The chart shows the chance that junk is wrongly accepted by a CRC with r check bits. Each gridline is half the one above. A link must let fewer than 2 junk frames in 100 through (the dashed line). Tap the smallest r that is good enough.",
      fig: junkFig, a: "r6", hint: "Each extra check bit halves the chance: 50, 25, 12.5, 6, 3, 1.6 ... in percent.",
      why: "Junk passes only if its remainder is all zeros: 1 chance in 2^r. Each extra check bit halves the chance, so the points fall on a straight line on this halving scale. With r = 5 the chance is about 3 in 100, still above the limit. r = 6 gives about 1.6 in 100, the first point below it. Real CRCs use 16 or 32 bits." },
    { type: "mcq", q: "Generator 1101 caught every pair of flips on a 7-bit frame. On this longer 11-bit frame, four pairs of flips (red) slip past it. What do the red cells have in common, and why does it matter?",
      fig: pairsFig, o: ["Each pair is 7 places apart, so a longer frame lets two flips line up like a multiple of the generator", "Each pair includes a remainder bit, so damage to the check bits cannot be seen by the receiver", "Each pair touches an end of the frame, where the long division has no 1 to cancel against", "Each pair is a pair of neighbours, because a CRC is weakest against bits that sit side by side"], a: 0,
      why: "The red cells all sit on one diagonal: j − i = 7. Two flips 7 places apart look like 10000001, and that divides evenly by 1101, so the remainder is 000 and nothing is noticed. In a 7-bit frame no two positions are 7 apart, so the guarantee held. A generator's guarantees depend on the frame length as well as on its degree.",
      hint: "Look at the distance between i and j for each red cell." },
    { type: "slider", q: "A 32-bit CRC is added to a short 64-byte frame and to a long 1,500-byte frame (bars drawn to the same length). About how many times larger is the CRC's share of the short frame than of the long one?",
      fig: overheadFig, min: 1, max: 50, step: 1, ans: 22, tol: 6, unit: "×", hint: "The CRC is the same 32 bits in both. The payloads differ by 1,500 ÷ 64, which is a bit over 20.",
      why: "The CRC takes 32 of 544 bits (about 5.9%) in the short frame and 32 of 12,032 bits (about 0.27%) in the long one. 5.9 ÷ 0.27 is about 22, roughly how much longer the long payload is. A fixed-size check is almost free on big frames but costs noticeably on tiny ones." },
  ]);

  /* ======================================================================
     a6-hamming
     ====================================================================== */
  // position table with binary labels and parity/data roles
  const posTableFig = (() => {
    let s = TX(8, 22, "position", { a: "start", s: 11, f: MUTE }) + TX(8, 52, "role", { a: "start", s: 11, f: MUTE });
    [["p4", 4], ["p2", 2], ["p1", 1]].forEach(([n, b], r) => (s += TX(8, 92 + r * 32, n, { a: "start", s: 13, f: MUTE })));
    for (let p = 1; p <= 7; p++) {
      const x = 56 + (p - 1) * 43, par = [1, 2, 4].includes(p);
      s += RC(x, 6, 38, 196, { r: 8, f: par ? BLU : "var(--panel)", fo: par ? 0.15 : 1, k: par ? BLU : "var(--line-2)" })
        + TX(x + 19, 28, p, { s: 17 }) + TX(x + 19, 54, par ? "parity" : "data", { s: 10, f: par ? BLU : MUTE });
      [4, 2, 1].forEach((b, r) => (s += TX(x + 19, 98 + r * 32, p & b ? "1" : "0", { s: 17, m: 1, f: p & b ? "var(--text)" : MUTE })));
    }
    return SVG(360, 212, s, "Hamming(7,4) positions 1 to 7 written in binary, with parity positions 1, 2 and 4 shaded");
  })();

  // block length vs code rate and fixable share
  const blockFig = (() => {
    const ns = [7, 15, 31, 63, 127], rate = [57, 73, 84, 90, 94], ok = [99.8, 99.0, 96.2, 86.9, 63.7];
    const X = (i) => 60 + i * 62, Y = (v) => 210 - v * 1.7;
    let s = "";
    [0, 25, 50, 75, 100].forEach((v) => (s += LN(46, Y(v), 340, Y(v), { k: "var(--line-soft, var(--line))", w: 1 }) + TX(40, Y(v) + 4, v + "%", { a: "end", s: 10, f: MUTE })));
    const path = (a, col) => `<path d="${a.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ")}" fill="none" stroke="${col}" stroke-width="3"/>` + a.map((v, i) => CI(X(i), Y(v), 4.5, { f: col, k: col, w: 1 })).join("");
    s += path(rate, BLU) + path(ok, RED);
    ns.forEach((n, i) => (s += TX(X(i), 230, n, { s: 12 })));
    s += TX(200, 248, "block length (bits)", { s: 11, f: MUTE });
    s += RC(48, 6, 12, 12, { r: 3, f: BLU, k: BLU, w: 1 }) + TX(66, 17, "code rate (data share)", { a: "start", s: 11 }) + RC(210, 6, 12, 12, { r: 3, f: RED, k: RED, w: 1 }) + TX(228, 17, "blocks with 1 flip or fewer", { a: "start", s: 11 });
    return SVG(360, 256, s, "Two lines against block length 7, 15, 31, 63, 127: code rate rises from 57 to 94 per cent, blocks with at most one flip fall from 99.8 to 63.7 per cent");
  })();

  // pipeline with four flip spots
  const pipeFig = (() => {
    const box = (x, w, t) => RC(x, 24, w, 38, { r: 10 }) + TX(x + w / 2, 48, t, { s: 11 });
    let s = box(4, 56, "Data") + box(86, 60, "Encoder") + box(214, 60, "Decoder") + box(300, 56, "Output");
    s += LN(60, 43, 86, 43, { w: 2.5 }) + LN(116, 43, 214, 43, { w: 2.5, d: "6 4" }) + LN(274, 43, 300, 43, { w: 2.5 });
    s += TX(165, 82, "wire", { s: 11, f: MUTE });
    [["A", 73], ["B", 140], ["C", 190], ["D", 287]].forEach(([k, x]) => (s += PK(k, CI(x, 43, 13, { f: AMB, fo: 0.3, k: AMB, w: 2.5 }) + TX(x, 48, k, { s: 14 }))));
    [["A", "Data bit flips in memory, before encoding"], ["B", "One data bit flips on the wire"], ["C", "One check bit flips on the wire"], ["D", "One bit flips in the output, after decoding"]].forEach(([k, t], i) => (s += TX(10, 112 + i * 24, `<tspan fill="${AMB}">${k}</tspan>  ${t}`, { a: "start", s: 12 })));
    return SVG(360, 206, s, "Pipeline from data through an encoder, a noisy wire and a decoder to the output, with four marked places where a bit can flip");
  })();

  B.add("a6-hamming", [
    { type: "cat", q: "A Hamming(7,4) receiver shows its three checks as lamps, p4 p2 p1 (✗ = that check fails). Use the position table to decide what the single-error fix does in each case: leave the four data bits alone, or flip one of them back?",
      fig: posTableFig, buckets: ["Data bits already fine", "A data bit is flipped back"],
      items: [["p4 ✗  p2 ✓  p1 ✓", 0], ["p4 ✓  p2 ✗  p1 ✗", 1], ["p4 ✓  p2 ✓  p1 ✗", 0], ["p4 ✗  p2 ✗  p1 ✗", 1], ["p4 ✓  p2 ✓  p1 ✓", 0], ["p4 ✗  p2 ✓  p1 ✗", 1]],
      why: "Read the lamps as a binary number (p4 first) and find that column. 100 is position 4, 001 is position 1 and 000 is no flip at all: parity bits (or nothing), so the data was never touched. 011, 111 and 101 name positions 3, 7 and 5, which hold data bits, so the fix flips a data bit back." },
    { type: "slider", q: "A Hamming code can only repair a block with at most one flipped bit. The chart compares block lengths when every bit flips with a 1% chance. About what percentage of 127-bit blocks arrive with two or more flipped bits?",
      fig: blockFig, min: 0, max: 100, step: 1, ans: 36, tol: 6, unit: "%", hint: "Find the red line at 127. That is the share with one flip or none. What is left?",
      why: "At 127 bits the red line is at about 64%, so roughly 36% of blocks carry two or more flips and cannot be repaired (they may even be \"repaired\" wrongly). Longer blocks waste fewer bits on checks (the blue line rises) but collect more errors (the red line falls), so the best block size depends on how noisy the link is." },
    { type: "pick", q: "Hamming(7,4) protects the bits between the encoder and the decoder. One bit flips at each marked spot (A to D, one spot at a time). Tap every spot where the receiver ends up with the correct data.",
      fig: pipeFig, a: ["B", "C"], hint: "Where does the code get a chance to look at the bits?",
      why: "Anything that damages the codeword on the wire, whether a data bit or a check bit, shows up in the syndrome and is repaired. A happens before the encoder: the checks are built around the wrong data, so everything passes. D happens after decoding, when no check is looking any more. The code only guards the stretch between encoder and decoder." },
    { type: "multi", q: "Which of these statements about Hamming(7,4) are true? Select all that apply.",
      o: ["A flipped check bit still gives a non-zero syndrome", "Syndrome 000 proves that no bit was flipped", "The three checks give 8 outcomes: no error, or one of 7 positions", "Adding a fourth check bit lets it repair any two flips"], a: [0, 2],
      why: "A flipped check bit makes its own check fail (and no other), so the syndrome names that position. Three yes/no checks give 2³ = 8 outcomes: exactly \"nothing wrong\" plus the 7 positions. Syndrome 000 does not prove the word is clean, because three flips at positions like 1, 2 and 3 cancel out (001, 010 and 011 add up to 000). One extra check bit adds detection of two flips (SECDED), not repair." },
  ]);

  /* ======================================================================
     a7-entropy
     ====================================================================== */
  // entropy curve of a coin with chips on the axis
  const coinFig = (() => {
    const X = (p) => 40 + p * 280, Y = (h) => 200 - h * 150, H = (p) => ent([p, 1 - p]);
    let d = ""; for (let i = 1; i <= 99; i++) { const p = i / 100; d += (i === 1 ? "M" : "L") + X(p).toFixed(1) + " " + Y(H(p)).toFixed(1) + " "; }
    let s = LN(40, 200, 330, 200, { w: 2 }) + LN(40, 40, 40, 200, { w: 2 }) + TX(34, 54, "1", { a: "end", s: 11, f: MUTE }) + TX(34, 204, "0", { a: "end", s: 11, f: MUTE }) + TX(10, 22, "entropy (bits per flip)", { a: "start", s: 11, f: MUTE });
    s += `<path d="${d}" fill="none" stroke="${BLU}" stroke-width="3.5"/>`;
    [["A", 0.05], ["B", 0.2], ["C", 0.4], ["D", 0.7], ["E", 0.95]].forEach(([k, p]) => (s += PK(k, RC(X(p) - 19, 208, 38, 40, { r: 10, f: AMB, fo: 0.18, k: AMB }) + TX(X(p), 224, k, { s: 14 }) + TX(X(p), 240, Math.round(p * 100) + "%", { s: 11, f: MUTE }))));
    s += TX(180, 262, "chance of heads", { s: 11, f: MUTE });
    return SVG(360, 270, s, "Entropy curve of a coin against its chance of heads, rising to 1 bit at 50 per cent, with five coins marked on the axis");
  })();

  // dial of bits per symbol
  const dialFig = (() => {
    const cx = 180, cy = 160, r = 118, pt = (v, rr) => { const a = Math.PI - (v / 8) * Math.PI; return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]; };
    const arc = (v0, v1, col, w) => { const [x0, y0] = pt(v0, r), [x1, y1] = pt(v1, r); return `<path d="M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`; };
    let s = arc(0, 8, "var(--line)", 20) + arc(0, 1.5, GRN, 20);
    for (let v = 0; v <= 8; v++) { const [x0, y0] = pt(v, r - 16), [x1, y1] = pt(v, r - 24); s += LN(x0, y0, x1, y1, { w: 2 }); }
    [0, 2, 4, 6, 8].forEach((v) => { const [x, y] = pt(v, r + 18); s += TX(x, y + 4, v, { s: 13, f: MUTE }); });
    const [nx, ny] = pt(1.5, r - 34);
    s += LN(cx, cy, nx, ny, { k: "var(--text)", w: 4 }) + CI(cx, cy, 8, { f: "var(--text)", k: "var(--text)", w: 1 });
    s += TX(cx, cy + 30, "entropy: 1.5 bits per reading", { s: 14 }) + TX(cx, 14, "bits per reading", { s: 11, f: MUTE }) + TX(cx, cy + 50, "stored as plain bytes: 8 bits per reading", { s: 12, f: MUTE });
    return SVG(360, 224, s, "Dial from 0 to 8 bits per reading with the needle at 1.5");
  })();

  // four mini bar charts
  const miniDists = (() => {
    const P = [["A", [0.25, 0.5, 0.125, 0.125]], ["B", [0.5, 0.25, 0.25, 0]], ["C", [0.125, 0.125, 0.25, 0.5]], ["D", [0.5, 0.125, 0.25, 0.125]]];
    let s = "";
    P.forEach(([id, ps], k) => {
      const x = 6 + (k % 2) * 178, y = 6 + Math.floor(k / 2) * 138;
      let bars = "";
      ps.forEach((p, i) => { const h = Math.max(p * 168, 2), bx = x + 18 + i * 38; bars += RC(bx, y + 112 - h, 28, h, { r: 3, f: BLU, fo: p ? 0.5 : 0.15, k: BLU, w: 2 }) + TX(bx + 14, y + 106 - h, +(p * 100).toFixed(1) + "%", { s: 10 }); });
      s += PK(id, RC(x, y, 170, 126, { r: 12 }) + TX(x + 12, y + 18, id, { a: "start", s: 15 }) + bars);
    });
    return SVG(360, 276, s, "Four small bar charts of probabilities over four symbols");
  })();

  // heatmap: weather today given yesterday
  const weatherFig = (() => {
    const names = ["Sun", "Cloud", "Rain", "Fog"], M = [[0.7, 0.2, 0.1, 0], [0.3, 0.4, 0.2, 0.1], [0.25, 0.25, 0.25, 0.25], [0, 0.05, 0.05, 0.9]];
    let s = TX(8, 22, "yesterday", { a: "start", s: 11, f: MUTE }) + TX(216, 22, "today", { s: 11, f: MUTE });
    names.forEach((n, j) => (s += TX(84 + j * 66 + 33, 50, n, { s: 12 })));
    M.forEach((row, i) => {
      const y = 60 + i * 46;
      let cells = ""; row.forEach((p, j) => (cells += RC(84 + j * 66, y, 64, 42, { r: 6, f: BLU, fo: 0.08 + p * 0.55, k: "var(--line-2)", w: 1.5 }) + TX(84 + j * 66 + 32, y + 26, Math.round(p * 100) + "%", { s: 14 })));
      s += PK(names[i], hit(2, y - 2, 356, 46) + TX(10, y + 26, names[i], { a: "start", s: 14 }) + cells);
    });
    return SVG(360, 250, s, "Table of weather today for each weather yesterday: Sun row 70, 20, 10, 0; Cloud row 30, 40, 20, 10; Rain row 25 each; Fog row 0, 5, 5, 90 per cent");
  })();

  B.add("a7-entropy", [
    { type: "pick", q: "Five coins are marked on the axis by their chance of heads. The curve shows how many bits per flip a coin needs with the best possible code. Tap the two coins that need exactly the same number of bits per flip.",
      fig: coinFig, a: ["A", "E"], hint: "Look at the shape of the curve. What is special about it either side of 50%?",
      why: "The curve is a mirror image around 50%. A coin that lands heads 95% of the time is exactly as predictable as one that lands tails 95% of the time (heads 5%), so both need about 0.29 bits per flip. B (20%) and D (70%) are not mirror images: they need about 0.72 and 0.88 bits." },
    { type: "slider", q: "A sensor sends 1,000 readings, each stored as 8 bits (8,000 bits in all). The readings come from a source whose entropy is 1.5 bits per reading, as on the dial. At best, about what percentage of the original 8,000 bits could a perfect compressor get it down to?",
      fig: dialFig, min: 0, max: 100, step: 1, ans: 19, tol: 4, unit: "%", hint: "1.5 bits against 8. Two bits would be a quarter of 8, so 1.5 is a little under that.",
      why: "Entropy is the floor for any lossless code: 1,000 × 1.5 = 1,500 bits at the very least, which is 1,500 out of 8,000, about 19%. A real code such as Huffman lands at or just above that, never below. The distance of the needle from 8 on the dial is how much room there is to squeeze." },
    { type: "pick", q: "Each panel shows the probabilities of a source with four symbols. Three of these sources have exactly the same entropy. Tap the odd one out.",
      fig: miniDists, a: "B", hint: "Does entropy care which symbol has which probability?",
      why: "Entropy depends only on the set of probabilities, not on which symbol carries which. A, C and D are the same numbers (0.5, 0.25, 0.125, 0.125) in different orders, so each has an entropy of 1.75 bits. B uses a different set (0.5, 0.25, 0.25 and an impossible symbol), with entropy 1.5 bits." },
    { type: "pick", q: "The table gives the chance of each kind of weather today (columns) for each kind of weather yesterday (rows); every row adds to 100%. A weather station writes one code per day, using the best code for the row it is in. Tap the row where a day costs the fewest bits on average.",
      fig: weatherFig, a: "Fog", hint: "The cheapest row is the one where tomorrow is easiest to guess, not simply the row with the biggest single number.",
      why: "After Fog comes Fog 90% of the time, so that row is almost certain and its entropy is only about 0.57 bits. Sun's row is next at about 1.16 bits. Cloud (about 1.85) and Rain (exactly 2: four equal chances) are the hardest to guess. What counts is how lopsided the whole row is." },
  ]);

  /* ======================================================================
     a7-huffman
     ====================================================================== */
  // a binary trie where some codewords are not leaves
  const trieFig = (() => {
    const N = { r: [180, 34], a: [100, 98], b: [260, 98], "00": [60, 162], "01": [140, 162], "10": [220, 162], "11": [300, 162], "110": [268, 226], "111": [332, 226] };
    const E = [["r", "a", 0], ["r", "b", 1], ["a", "00", 0], ["a", "01", 1], ["b", "10", 0], ["b", "11", 1], ["11", "110", 0], ["11", "111", 1]];
    const L = { "00": "A", "01": "B", "10": "C", "11": "D", "110": "E", "111": "F" };
    let s = "";
    E.forEach(([p, c, bit]) => { const [x1, y1] = N[p], [x2, y2] = N[c], mx = (x1 + x2) / 2, my = (y1 + y2) / 2; s += LN(x1, y1, x2, y2, { w: 2.5 }) + CI(mx, my, 9, { f: "var(--panel)", k: "var(--line-2)", w: 1.5 }) + TX(mx, my + 4, bit, { s: 12, m: 1 }); });
    ["r", "a", "b"].forEach((k) => (s += CI(N[k][0], N[k][1], 8, { f: "var(--panel)", k: "var(--line-2)" })));
    Object.entries(L).forEach(([k, l]) => (s += PK(l, CI(N[k][0], N[k][1], 16, { f: BLU, fo: 0.25, k: BLU }) + TX(N[k][0], N[k][1] + 5, l, { s: 15 }))));
    s += TX(100, 244, "filled dot = a codeword", { s: 11, f: MUTE });
    return SVG(360, 256, s, "Binary tree whose filled dots A to F are codewords; D sits at 11 above E at 110 and F at 111");
  })();

  // Huffman cost per flip for blocks of 1..4 flips of a 90/10 coin
  const blockCodeFig = (() => {
    const vals = [1.0, 0.645, 0.533, 0.493], Y = (v) => 190 - v * 150;
    let s = LN(24, 190, 352, 190) + LN(30, Y(0.469), 352, Y(0.469), { k: RED, w: 2.5, d: "7 5" });
    s += LN(10, 14, 28, 14, { k: RED, w: 2.5, d: "6 4" }) + TX(34, 18, "entropy floor: 0.47", { a: "start", s: 12 }) + TX(354, 18, "bits per flip", { a: "end", s: 11, f: MUTE });
    vals.forEach((v, i) => { const cx = 70 + i * 86; s += RC(cx - 24, Y(v), 48, v * 150, { r: 4, f: BLU, fo: 0.45, k: BLU, w: 2 }) + TX(cx, Y(v) - 7, v.toFixed(2), { s: 13 }) + TX(cx, 210, i + 1 + (i ? " flips" : " flip"), { s: 12 }); });
    s += TX(190, 228, "flips coded together as one symbol", { s: 11, f: MUTE });
    return SVG(360, 236, s, "Bars of Huffman bits per flip for a 90 per cent coin when 1, 2, 3 or 4 flips are grouped: 1.00, 0.65, 0.53, 0.49, above an entropy line at 0.47");
  })();

  // three messages: fixed codes vs Huffman table + payload
  const tableCostFig = (() => {
    const msgs = [["m40", 40], ["m120", 120], ["m400", 400]];
    let s = "";
    msgs.forEach(([id, n], k) => {
      const x = 6 + k * 118, sc = 90 / (3 * n), base = 186, tbl = 100, pay = Math.round(2.3 * n);
      s += PK(id, RC(x, 4, 110, 226, { r: 12 }) + TX(x + 55, 24, n + " symbols", { s: 13 })
        + RC(x + 12, base - 3 * n * sc, 36, 3 * n * sc, { r: 3, f: MUTE, fo: 0.25, k: MUTE, w: 2 }) + TX(x + 30, base - 3 * n * sc - 6, 3 * n, { s: 12 })
        + RC(x + 62, base - pay * sc, 36, pay * sc, { r: 2, f: GRN, fo: 0.35, k: GRN, w: 2 }) + RC(x + 62, base - (pay + tbl) * sc, 36, tbl * sc, { r: 2, f: AMB, fo: 0.4, k: AMB, w: 2 })
        + TX(x + 30, 202, "fixed", { s: 11, f: MUTE }) + TX(x + 80, 202, "Huffman", { s: 11, f: MUTE })
        + TX(x + 55, 220, `<tspan fill="${AMB}">100</tspan> + <tspan fill="${GRN}">${pay}</tspan>`, { s: 12 }));
    });
    return SVG(360, 236, s, "Three panels for 40, 120 and 400 symbols comparing a fixed-code file with a Huffman table of 100 bits plus its payload");
  })();

  B.add("a7-huffman", [
    { type: "pick", q: "This binary tree is meant to be a prefix code: every filled dot is a codeword, spelled by the 0 and 1 labels on the path from the root. Tap the codeword that breaks the prefix rule.",
      fig: trieFig, a: "D", hint: "In a prefix code, no codeword may lie on the path to another codeword.",
      why: "D is spelled 11, and the paths to E (110) and F (111) pass straight through it. When the receiver has read 1 1 it cannot tell whether D is finished or E or F is coming. A prefix code puts every codeword at a leaf, with nothing hanging below it, which is what Huffman's tree guarantees." },
    { type: "mcq", q: "A coin lands heads 90% of the time (entropy about 0.47 bits per flip). Huffman needs at least 1 bit per symbol, so it is wasteful on single flips. The chart shows Huffman's average cost per flip when flips are grouped into blocks of 1, 2, 3 or 4 and each block counts as one symbol. What does grouping do?",
      fig: blockCodeFig, o: ["It pulls Huffman towards the entropy line, but never below it", "It lets Huffman beat the entropy line once the blocks get long enough", "It makes little real difference, since each flip is still just heads or tails", "It helps up to blocks of three, then the bigger table makes it worse again"], a: 0,
      why: "Blocks of two have four symbols with chances 0.81, 0.09, 0.09 and 0.01, so the likely block gets a 1-bit code: 1.29 bits per block, 0.65 per flip. Blocks of three give 0.53, blocks of four 0.49. The cost keeps sliding towards 0.47 but never crosses it, because entropy is a floor for every lossless code. The price is a bigger table and more symbols to track." },
    { type: "order", q: "Put this cause-and-effect chain in order to explain why a rare symbol gets a long Huffman codeword yet costs few bits.",
      items: ["The symbol turns up only a few times", "Its small count means it is merged early", "Early merges sit at the bottom of the tree", "The bottom of the tree means a long codeword", "It is so rare that the long code is rarely paid"],
      why: "Few appearances give a small count. The queue always merges the smallest counts first, so the symbol ends up deep in the tree, which means a long codeword. But the cost is the code length times how often it appears, and it appears rarely, so the long code adds little to the total." },
    { type: "pick", q: "A sender can use fixed 3-bit codes, or Huffman codes that average 2.3 bits per symbol but need a 100-bit code table sent first. Each panel shows one message: the grey bar is the fixed-code size in bits, and the stacked bar is the Huffman table plus its payload. Tap every message where Huffman ends up BIGGER than the fixed-code file.",
      fig: tableCostFig, a: ["m40", "m120"], hint: "Add the table and the payload, then compare with the grey bar. Careful with the middle panel.",
      why: "Huffman saves 0.7 bits per symbol, but it has to earn back the 100-bit table first: break-even is at about 143 symbols. At 40 symbols it is 192 against 120. At 120 symbols it is 376 against 360, still a small loss. At 400 symbols it is 1,020 against 1,200, a clear win. Short messages can be cheaper with plain fixed codes." },
  ]);

  /* ======================================================================
     a7-lzw
     ====================================================================== */
  // codes emitted vs input length (repeating text vs random text over A,B,C)
  const growthFig = (() => {
    const ns = [30, 60, 90, 120, 150, 200, 250, 300], rep = [12, 18, 22, 26, 29, 34, 38, 41], ran = [19, 31, 41, 51, 60, 76, 90, 106];
    const X = (i) => 52 + i * 38, Y = (v) => 206 - v * 1.6;
    let s = "";
    [0, 25, 50, 75, 100].forEach((v) => (s += LN(46, Y(v), 346, Y(v), { k: "var(--line-soft, var(--line))", w: 1 }) + TX(40, Y(v) + 4, v, { a: "end", s: 10, f: MUTE })));
    const curve = (id, a, col) => `<path data-pick="${id}" d="${a.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ")}" fill="none" stroke="transparent" stroke-width="22" stroke-linejoin="round" style="stroke-linecap:round"/>`
      + `<path d="${a.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ")}" fill="none" stroke="${col}" stroke-width="3.5" pointer-events="none"/>`;
    s += curve("t2", ran, AMB) + curve("t1", rep, BLU);
    s += TX(X(7) - 4, Y(41) + 22, "Text 1", { a: "end", s: 12, f: BLU }) + TX(X(7) - 14, Y(106) + 20, "Text 2", { a: "end", s: 12, f: AMB });
    ns.forEach((n, i) => (s += TX(X(i), 226, n, { s: 11 })));
    s += TX(200, 246, "letters of input read so far", { s: 11, f: MUTE }) + TX(10, 16, "codes sent so far", { a: "start", s: 11, f: MUTE });
    return SVG(360, 254, s, "Two curves of LZW codes sent against letters read: Text 1 climbs to 41 codes, Text 2 climbs to 106 codes");
  })();

  // phrase timelines for two rows with six As and six Bs
  const phraseFig = (() => {
    const rows = [["Row 1", "ABABABABABAB", ["A", "B", "AB", "ABA", "BA", "BAB"]], ["Row 2", "AABBABBAABAB", ["A", "A", "B", "B", "AB", "BA", "AB", "AB"]]];
    let s = "";
    rows.forEach(([name, str, segs], r) => {
      const y = 28 + r * 92;
      s += TX(8, y - 8, name, { a: "start", s: 12 });
      let i = 0;
      segs.forEach((g, k) => {
        const x = 12 + i * 27;
        s += RC(x - 1, y - 1, g.length * 27 - 1 + 2, 34, { r: 8, f: k % 2 ? BLU : AMB, fo: 0.18, k: k % 2 ? BLU : AMB, w: 2 });
        g.split("").forEach((ch, j) => (s += TX(x + j * 27 + 12, y + 22, ch, { m: 1, s: 16 })));
        i += g.length;
      });
      s += TX(8, y + 58, `${segs.length} boxes = ${segs.length} codes`, { a: "start", s: 12, f: MUTE });
    });
    return SVG(360, 200, s, "Two rows of twelve letters cut into LZW phrase boxes: Row 1 has six boxes, Row 2 has eight");
  })();

  B.add("a7-lzw", [
    { type: "pick", q: "Two 300-letter texts over A, B and C are encoded with LZW (starting dictionary A = 0, B = 1, C = 2). One text is ABCABCABC… repeated, the other is random letters. The chart shows how many codes each had produced after each stretch of input. Tap the curve for the repeating text.",
      fig: growthFig, a: "t1", hint: "Which text lets LZW reuse its dictionary entries more?",
      why: "In the repeating text the same phrases come round again and again, so each new entry is soon reused and later phrases get longer and longer: only 41 codes cover all 300 letters. The random text has fewer repeats, so its phrases stay short: 106 codes for the same 300 letters. Both climb more slowly than the input (LZW always gains a little), but the repeating text flattens far more." },
    { type: "cat", q: "Sender and receiver use LZW and start with the dictionary A = 0, B = 1. Sort each item by how the receiver gets hold of it.",
      buckets: ["Agreed beforehand", "Sent as data", "Rebuilt by the decoder"],
      items: [["The starting table: A = 0, B = 1", 0], ["The stream of code numbers, such as 0, 1, 2, 4", 1], ["Entry 2 = AB", 2], ["The fixed width of each code, say 12 bits", 0], ["Entry 4 = ABA", 2]],
      why: "The starting table and the code width are fixed in advance, so nothing about them is sent. Only the code numbers travel. Every longer entry (AB, ABA and so on) is rebuilt by the decoder from the codes it has already read, by the same rule the encoder used, which is why LZW never has to ship a dictionary." },
    { type: "order", q: "Each input has 12 letters over A, B, C and D (starting dictionary A = 0, B = 1, C = 2, D = 3). Put them in order from the FEWEST LZW codes to the MOST.",
      items: ["AAAAAAAAAAAA", "ABABABABABAB", "ABCDABCDABCD", "ABACABADABAC", "ADBCCABDBACD"],
      hint: "Repeats let LZW take bigger bites, so it needs fewer codes.",
      why: "AAAAAAAAAAAA: A | AA | AAA | AAAA | AA is 5 codes. ABABABABABAB: A | B | AB | ABA | BA | BAB is 6. ABCDABCDABCD: A | B | C | D | AB | CD | ABC | D is 8. ABACABADABAC: A | B | A | C | AB | A | D | ABA | C is 9. ADBCCABDBACD has almost no repeats, so it needs 11. The more the input repeats itself, the longer the phrases get." },
    { type: "mcq", q: "Both rows hold six As and six Bs, so a Huffman code gives them the same size (12 bits). LZW (starting A = 0, B = 1) cut each row into the phrase boxes shown, one code per box. What does the comparison show?",
      fig: phraseFig, o: ["LZW uses the order of the letters as well as counts, so repeated patterns shrink and shuffled ones barely do", "LZW has a bigger dictionary than Huffman, so it wins whenever the letters are equally common", "Huffman reads patterns too, so it would also code Row 1 in fewer bits than Row 2", "LZW needs the letter counts first, and the counts are only clear in the patterned row"], a: 0,
      why: "Huffman builds its code from letter counts alone, and both rows have six of each, so it cannot tell them apart. LZW grows phrases from what it has already seen: the patterned row becomes 6 codes because phrases keep getting longer, while the shuffled row needs 8 because few phrases repeat. Compression that uses order can find structure that counting misses." },
  ]);
})();

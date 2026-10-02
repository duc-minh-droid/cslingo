/* ALGO revision bank, visual and varied questions, part 3. Numbers computed by running the real algorithms in node. */
(function () {
  const B = NIC.bank;

  /* ---------- tiny SVG helpers (CSS variables so both themes work) ---------- */
  const SVG = (w, h, inner, label) => `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto" role="img" aria-label="${label}">${inner}</svg>`;
  const TX = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" fill="${o.f || "var(--text)"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "ui-monospace,Consolas,monospace" : "var(--sans)"}${o.ls ? `;letter-spacing:${o.ls}px` : ""}">${s}</text>`;
  const RC = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r == null ? 8 : o.r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const LN = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const bitCell = (x, y, v, o = {}) => RC(x, y, o.w || 26, o.h || 30, { f: o.f, fo: o.fo, k: o.k, w: o.sw || 2, r: 6 }) + TX(x + (o.w || 26) / 2, y + (o.h || 30) / 2 + 5, v, { m: 1, s: 15, f: o.tf });
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });

  /* ==================== a6-crc ==================== */
  // 2D parity grid, one bit flipped; failing row/column checks marked
  const parityFig = (() => {
    const data = [[1, 0, 1, 1], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 1, 0]];
    const g = data.map((r) => [...r, r.reduce((s, x) => s + x) % 2]);
    g.push([0, 1, 2, 3, 4].map((c) => g.reduce((s, r) => s + r[c], 0) % 2));
    const got = g.map((r) => r.slice());
    got[2][1] ^= 1; // the flipped bit: row 2, column 1
    const rowBad = got.map((r) => r.reduce((s, x) => s + x) % 2 === 1);
    const colBad = [0, 1, 2, 3, 4].map((c) => got.reduce((s, r) => s + r[c], 0) % 2 === 1);
    let s = "";
    const X0 = 50, Y0 = 34, W = 44, H = 40;
    ["c1", "c2", "c3", "c4", "par"].forEach((t, c) => (s += TX(X0 + c * W + W / 2, 22, t, { s: 12, f: "var(--text-2, var(--text))" })));
    got.forEach((r, i) => {
      s += TX(X0 - 8, Y0 + i * H + H / 2 + 5, i < 4 ? "r" + (i + 1) : "par", { a: "end", s: 12 });
      r.forEach((v, c) => {
        const x = X0 + c * W, y = Y0 + i * H;
        const par = i === 4 || c === 4;
        s += PK(`r${i}c${c}`, RC(x + 2, y + 2, W - 4, H - 4, { f: par ? "var(--bg-2)" : "var(--panel)", r: 6 }) + TX(x + W / 2, y + H / 2 + 5, v, { m: 1, s: 16 }));
      });
      s += rowBad[i] ? `<circle cx="${X0 + 5 * W + 18}" cy="${Y0 + i * H + H / 2}" r="8" fill="var(--rose)"/>` : "";
    });
    colBad.forEach((b, c) => { if (b) s += `<circle cx="${X0 + c * W + W / 2}" cy="${Y0 + 5 * H + 16}" r="8" fill="var(--rose)"/>`; });
    s += `<circle cx="${X0 + 6}" cy="276" r="7" fill="var(--rose)"/>` + TX(X0 + 20, 281, "red dot = this check fails", { a: "start", s: 12 });
    return SVG(330, 292, s, "A 4 by 4 grid of bits with a parity row and column; red dots mark the failing checks");
  })();

  const crcRows = [["11010000", "10110000", "01100000"], ["01100000", "01011000", "00111000"], ["00111000", "00101100", "00011100"], ["00011100", "00010110", "00001010"]];
  const crcFig = (() => {
    let s = TX(200, 20, "Message 11010, generator 1011, three zeros appended", { s: 13 });
    s += TX(60, 46, "was", { s: 12 }) + TX(170, 46, "XOR generator", { s: 12 }) + TX(305, 46, "gives", { s: 12 });
    crcRows.forEach(([a, b, c], i) => {
      const y = 56 + i * 48;
      s += PK(`r${i + 1}`, RC(6, y, 388, 40, { r: 10 }) + TX(26, y + 26, i + 1, { s: 13 }) + TX(86, y + 26, a, { m: 1, s: 15, ls: 1 }) + TX(200, y + 26, b, { m: 1, s: 15, ls: 1 }) + TX(318, y + 26, c, { m: 1, s: 15, ls: 1 }));
    });
    return SVG(400, 256, s, "Four lines of CRC long-division working");
  })();

  B.add("a6-crc", [
    { type: "multi", q: "A receiver accepts a frame when its remainder after dividing by the generator 1011 is 000. Noise XORs an error pattern E onto a frame that was valid. Which patterns would slip through unnoticed? Select all that apply.",
      fig: SVG(400, 120, TX(200, 20, "Sent frame (valid, remainder 000)", { s: 13 }) + [..."1101001"].map((b, i) => bitCell(66 + i * 36, 30, b, { w: 32 })).join("") + TX(34, 52, "sent", { s: 12 }) +
        [..."0000100"].map((b, i) => bitCell(66 + i * 36, 70, b, { w: 32, f: b === "1" ? "var(--rose)" : "var(--panel)", fo: b === "1" ? ".3" : "1" })).join("") + TX(34, 92, "E", { s: 12 }) + TX(200, 112, "Example E = 0000100 leaves remainder 100, so it is caught", { s: 12 }), "A valid frame and an example error pattern"),
      o: ["E = 0000100", "E = 0001011", "E = 0010110", "E = 0000110", "E = 1011000"], a: [1, 2, 4],
      hint: "Dividing the corrupted frame leaves the same remainder as dividing E alone. Which E are exact multiples of 1011 (1011 shifted left by 0, 1 or 3 places)?",
      why: "The valid frame leaves remainder 0, so the corrupted frame leaves the remainder of E alone. E = 0001011 is 1011 itself, 0010110 is 1011 shifted by one and 1011000 is shifted by three: all divide exactly, so the receiver sees 000 and accepts. 0000100 leaves 100 and 0000110 leaves 110, so both are caught." },
    { type: "pick", q: "A student works out a CRC by hand: generator 1011, message 11010, three zeros appended. Each line should be the previous result XOR the generator lined up under its leading 1. Tap the first line where the XOR goes wrong.",
      fig: crcFig, a: "r3",
      why: "Line 3 should be 00111000 XOR 00101100 = 00010100. The student wrote 00011100, so one bit is wrong. Lines 1, 2 and 4 are correct XORs of what is above them, which is why the error is easy to miss if you only check the final remainder." },
    { type: "bug", q: "This function should compute a CRC remainder with long division, where every step is an XOR (no carries). Click the faulty line.",
      code: ["def crc_rem(msg, gen):", "    n = len(gen) - 1", "    bits = [int(b) for b in msg + '0' * n]", "    for i in range(len(msg)):", "        if bits[i] == 1:", "            for j in range(len(gen)):", "                bits[i + j] = bits[i + j] + int(gen[j])", "    return bits[-n:]"], a: 6,
      why: "In mod-2 arithmetic the subtraction step is XOR. Adding produces 2s and carries, so the bits are no longer 0 or 1 and the remainder is garbage. The line should read bits[i + j] ^= int(gen[j])." },
    { type: "order", q: "Put the steps of a CRC round trip in order.",
      items: ["Sender appends as many zeros as the generator's degree", "Sender divides by the generator using XOR long division", "Sender swaps the appended zeros for the remainder", "Frame travels across the noisy link", "Receiver divides the whole frame by the same generator", "A remainder of zero means accept; anything else means corrupted"],
      why: "The zeros make room for the remainder, and replacing them makes the whole frame an exact multiple of the generator. The receiver therefore expects a remainder of zero." },
    { type: "pick", q: "Every row and every column of this grid should hold an even number of 1s, including the parity row and parity column. Exactly one bit flipped in transit, and the failing checks are marked with red dots. Tap the flipped bit.",
      fig: parityFig, a: "r2c1", hint: "The bad bit sits where the failing row and the failing column cross.",
      why: "Row 3 and column 2 are the only failing checks. A single flipped bit breaks exactly one row and one column, so their crossing (row 3, column 2) must be the culprit. Flipping it back makes every check pass." },
  ]);

  /* ==================== a6-hamming ==================== */
  const hamFig = (() => {
    const v = [1, 1, 1, 1, 1, 1, 0], lab = ["p1", "p2", "d3", "p4", "d5", "d6", "d7"];
    let s = TX(190, 18, "Received word (positions 1 to 7)", { s: 13 });
    v.forEach((b, i) => {
      const x = 12 + i * 48;
      s += TX(x + 22, 46, lab[i], { s: 12 }) + PK(String(i + 1), RC(x, 54, 44, 44, { r: 8 }) + TX(x + 22, 83, b, { m: 1, s: 18 })) + TX(x + 22, 116, i + 1, { s: 12 });
    });
    s += TX(12, 148, "p1 checks positions 1, 3, 5, 7", { a: "start", s: 13 }) + TX(12, 170, "p2 checks positions 2, 3, 6, 7", { a: "start", s: 13 }) + TX(12, 192, "p4 checks positions 4, 5, 6, 7", { a: "start", s: 13 }) + TX(12, 214, "Even parity: each group should hold an even number of 1s", { a: "start", s: 12, f: "var(--text-2, var(--text))" });
    return SVG(360, 226, s, "A received 7-bit Hamming word with the three parity groups listed");
  })();

  B.add("a6-hamming", [
    { type: "cat", q: "Hamming(7,4) always applies the single-error fix: flip the bit its syndrome names. After that fix, is the 4-bit data right or wrong in each case?",
      buckets: ["Data comes out right", "Data comes out wrong"],
      items: [["No bits flipped", 0], ["One data bit flipped", 0], ["One parity bit flipped", 0], ["Two bits flipped", 1], ["Three bits flipped", 1]],
      why: "With zero or one flip the syndrome is 000 or names the broken bit, so the fix gives back the sent word. With two flips the syndrome points at a third, innocent bit, and with three it either shows 000 or names another innocent bit. Either way the result is a different valid codeword with the wrong data." },
    { type: "bug", q: "This Hamming(7,4) encoder puts the data bits in positions 3, 5, 6 and 7. One parity bit is computed from the wrong group. Click the faulty line.",
      code: ["def encode(d):  # d = [d3, d5, d6, d7]", "    c = [0] * 8  # use c[1] to c[7]", "    c[3], c[5], c[6], c[7] = d", "    c[1] = c[3] ^ c[5] ^ c[7]", "    c[2] = c[3] ^ c[6] ^ c[7]", "    c[4] = c[3] ^ c[5] ^ c[6]", "    return c[1:]"], a: 5,
      why: "p4 covers positions 4, 5, 6 and 7 (the ones with a 1 in the front binary digit), so it should be c[5] ^ c[6] ^ c[7]. The buggy line uses position 3 instead of 7, so single errors at 3 or 7 would give the wrong syndrome." },
    { type: "pick", q: "Two bits flipped in transit, so Hamming(7,4) cannot know that. The receiver checks the three groups, reads the syndrome and flips the position it names. Which bit does it flip? Tap it.",
      fig: hamFig, a: "7", hint: "Count the 1s in each group. A group with an odd count fails. Read the failures as p4 p2 p1.",
      why: "All three groups hold three 1s, an odd count, so all three fail: syndrome 111 = position 7. But the real flips were at positions 2 and 5. The receiver changes bit 7, which was fine, so the word ends up with three wrong bits." },
    { type: "order", q: "Put the receiver's steps in order for a Hamming(7,4) word.",
      items: ["Recompute the parity of the p1, p2 and p4 groups", "Write the failures as a binary number p4 p2 p1 (the syndrome)", "If the syndrome is not 000, flip the bit at that position", "Read the data bits from positions 3, 5, 6 and 7"],
      why: "The syndrome has to be computed before it can be used, and the data is only read after the repair." },
    M("A syndrome with r bits can name 2^r different outcomes. It must say either \"no error\" or which one of the n positions is wrong. What is the smallest r that works for a 31-bit codeword?", ["4", "5", "6", "7"], 1, "One outcome for no error plus 31 positions is 32 outcomes, and 2^5 = 32 exactly. That is why Hamming(31,26) uses 5 parity bits. With r = 4 there are only 16 outcomes.",
      { fig: SVG(300, 136, TX(150, 20, "r parity bits can name 2^r outcomes", { s: 13 }) + [["r = 3", "8"], ["r = 4", "16"], ["r = 5", "32"], ["r = 6", "64"]].map(([a, b], i) => RC(30, 32 + i * 26, 240, 22, { r: 6 }) + TX(60, 48 + i * 26, a, { a: "start" }) + TX(250, 48 + i * 26, b, { a: "end" })).join(""), "Table of r against 2 to the power r") }),
  ]);

  /* ==================== a7-entropy ==================== */
  const surpriseFig = (() => {
    const P = [["A", 0.6, "0.7"], ["B", 0.3, "1.7"], ["C", 0.08, "3.6"], ["D", 0.02, "5.6"]];
    let s = "";
    P.forEach(([k, p, sur], i) => {
      const x = 14 + i * 96, h = Math.max(4, p * 130);
      s += PK(k, RC(x, 8, 86, 210, { r: 10, f: "var(--bg-2)" }) + RC(x + 25, 150 - h + 20, 36, h, { r: 5, f: "var(--blue)", k: "var(--blue)" }) + TX(x + 43, 176, k, { s: 16 }) + TX(x + 43, 194, "p = " + p, { s: 12 }) + TX(x + 43, 211, "surprise " + sur + " bits", { s: 11 }));
    });
    return SVG(400, 226, s, "Four symbols with their probabilities and surprise values");
  })();

  const claimFig = `<table style="border-collapse:collapse;margin:0 auto;font:800 14px var(--sans);color:var(--text)"><tr>${["Symbol", "Probability", "Claimed code length"].map((h) => `<th style="padding:6px 12px;border:2px solid var(--line);background:var(--bg-2)">${h}</th>`).join("")}</tr>${[["A", "0.5", "1 bit"], ["B", "0.25", "1 bit"], ["C", "0.125", "2 bits"], ["D", "0.125", "2 bits"]].map((r) => `<tr>${r.map((c) => `<td style="padding:6px 12px;border:2px solid var(--line);text-align:center">${c}</td>`).join("")}</tr>`).join("")}<tr><td colspan="3" style="padding:8px 12px;border:2px solid var(--line);text-align:center">Entropy of this source: 1.75 bits per symbol</td></tr></table>`;

  B.add("a7-entropy", [
    { type: "cat", q: "Entropy is measured in bits per symbol. Decide for each source whether its entropy is under 1 bit or at least 1 bit.",
      buckets: ["Under 1 bit", "1 bit or more"],
      items: [["A coin that lands heads 95% of the time", 0], ["A fair coin", 1], ["A fair six-sided die", 1], ["Four symbols: one appears 97% of the time, the other three 1% each", 0], ["Three symbols with probabilities 0.5, 0.25 and 0.25", 1], ["A lamp that is off 99.9% of the time", 0]],
      hint: "Entropy is low when one outcome nearly always wins, however many symbols exist.",
      why: "Strongly skewed sources are very predictable: the 95% coin has about 0.29 bits and the 97% source about 0.24. A fair coin is exactly 1 bit, the die about 2.6 and the 0.5/0.25/0.25 source 1.5. Two-symbol sources can never go above 1 bit, but they can go far below." },
    { type: "slider", q: "An event has a 1 in 1,000 chance of happening. Roughly how many bits of surprise does it carry when it does?", min: 0, max: 20, step: 1, ans: 10, tol: 2, unit: " bits",
      hint: "Each extra bit halves the probability: 1/2, 1/4, 1/8, ... How many halvings reach about 1/1000? (2 multiplied by itself 10 times is 1,024.)",
      why: "Surprise is log2(1/p) and 2^10 = 1,024, so a 1 in 1,000 event carries about 10 bits. Because of the log, a thousand-fold rarer event costs only 10 bits, not 1,000." },
    M("A vendor claims their code reaches the lengths shown for this source and is uniquely decodable. What is wrong with the claim?",
      ["Average length is 1.25 bits, below the 1.75-bit entropy, so it cannot work", "Average length is 1.5 bits, which is above the entropy, so it wastes space", "Codes must always be 2 bits long when there are four symbols", "Entropy only limits codes for equally likely symbols, so no limit applies"], 0,
      "Average length = 0.5×1 + 0.25×1 + 0.125×2 + 0.125×2 = 1.25 bits. No uniquely decodable code can average below the entropy (1.75), so some messages would decode ambiguously. The code lengths 1, 2, 3, 3 reach exactly 1.75.",
      { fig: claimFig, hint: "Average = 0.5 + 0.25 + 0.25 + 0.25 = 1.25." }),
    { type: "multi", q: "A source sends A, B, C, D with probabilities 0.7, 0.1, 0.1, 0.1 (entropy about 1.4 bits). Which changes would increase its entropy? Select all that apply.",
      o: ["Change the probabilities to 0.4, 0.2, 0.2, 0.2", "Add a fifth symbol E and take its 0.05 from A: 0.65, 0.1, 0.1, 0.1, 0.05", "Change the probabilities to 0.85, 0.05, 0.05, 0.05", "Swap the probabilities of A and B: 0.1, 0.7, 0.1, 0.1", "Rename the symbols to W, X, Y, Z"], a: [0, 1],
      why: "Entropy rises when probability spreads out. 0.4/0.2/0.2/0.2 is about 1.9 bits, and splitting off a fifth symbol raises it to about 1.6. The 0.85 version is more skewed (about 0.85 bits). Swapping or renaming only relabels the same distribution, so the entropy is unchanged." },
    { type: "pick", q: "Entropy is the average of p × surprise over all symbols. Using the numbers shown, which symbol contributes the most to the total? Tap it.",
      fig: surpriseFig, a: "B", hint: "Multiply each pair: 0.6 × 0.7, 0.3 × 1.7, 0.08 × 3.6, 0.02 × 5.6.",
      why: "The contributions are about 0.42 (A), 0.51 (B), 0.29 (C) and 0.11 (D). The most common symbol is not the biggest contributor: B balances being fairly common with being fairly surprising. Rare symbols are very surprising but too seldom to matter much." },
  ]);

  /* ==================== a7-huffman ==================== */
  const treeFig = (() => {
    const A = { s: "A", p: ".5" }, Bn = { s: "B", p: ".2" }, C = { s: "C", p: ".2" }, D = { s: "D", p: ".1" };
    const trees = [[[A, Bn], [C, D]], [A, [Bn, [C, D]]], [D, [C, [Bn, A]]]];
    let s = "";
    trees.forEach((t, ti) => {
      const ox = 6 + ti * 140;
      let leaf = 0;
      const lay = (n, d) => {
        if (n.s) { n.x = ox + 18 + leaf++ * 32; n.y = 30 + d * 38; return n; }
        n.k = n.map((c) => lay(c, d + 1)); n.x = (n.k[0].x + n.k[n.k.length - 1].x) / 2; n.y = 30 + d * 38; return n;
      };
      const root = lay(t.slice(), 0);
      let lines = "", nodes = "";
      const draw = (n) => {
        if (n.s) { nodes += `<circle cx="${n.x}" cy="${n.y}" r="13" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>` + TX(n.x, n.y + 5, n.s, { s: 13 }) + TX(n.x, n.y + 28, n.p, { s: 11 }); return; }
        n.k.forEach((c) => { lines += LN(n.x, n.y, c.x, c.y); draw(c); });
        nodes += `<circle cx="${n.x}" cy="${n.y}" r="5" fill="var(--line-2)"/>`;
      };
      draw(root);
      s += PK("t" + (ti + 1), RC(ox - 2, 4, 134, 188, { r: 12, f: "var(--bg-2)", k: "var(--line)" }) + lines + nodes + TX(ox + 65, 186, "Tree " + (ti + 1), { s: 13 }));
    });
    return SVG(424, 198, s, "Three candidate code trees for symbols A, B, C and D with their probabilities");
  })();

  B.add("a7-huffman", [
    { type: "pick", q: "Symbols A, B, C and D occur with probabilities 0.5, 0.2, 0.2 and 0.1 (shown under each leaf). Each tree is a valid prefix code, but only one is the tree Huffman's algorithm builds. Tap it.",
      fig: treeFig, a: "t2", hint: "Average length = sum of probability × depth. Tree 1: 2 for every symbol. Work out the other two.",
      why: "Tree 2 averages 0.5×1 + 0.2×2 + 0.2×3 + 0.1×3 = 1.8 bits, the best of the three. Tree 1 is balanced (2.0 bits), and tree 3 puts the rarest symbol nearest the root, which averages 2.6 bits. Huffman merges the two rarest, so the rarest leaves end up deepest." },
    { type: "bug", q: "This function should build a Huffman tree by repeatedly merging the two least frequent nodes. It produces a terrible code. Click the faulty line.",
      code: ["def huffman_merge(freq):", "    nodes = [(w, s) for s, w in freq.items()]", "    while len(nodes) > 1:", "        nodes.sort(reverse=True)", "        a = nodes.pop(0)", "        b = nodes.pop(0)", "        nodes.append((a[0] + b[0], (a, b)))", "    return nodes[0]"], a: 3,
      why: "Sorting in descending order puts the biggest nodes at the front, so pop(0) removes the two MOST frequent. Huffman needs the two smallest: sort ascending (the default), then pop(0) twice." },
    { type: "cat", q: "A prefix code gives each symbol a codeword of some length. Each codeword of length L uses up 1 / 2^L of the available code space, and the total cannot exceed 1. Which sets of lengths can belong to a prefix code?",
      buckets: ["Possible", "Impossible"],
      items: [["Lengths 1, 2, 3, 3", 0], ["Lengths 1, 1, 2", 1], ["Lengths 2, 2, 2", 0], ["Lengths 1, 2, 2, 2", 1], ["Lengths 1, 2, 3, 4", 0], ["Lengths 2, 2, 2, 2, 2", 1]],
      hint: "Add the fractions: length 1 is 1/2, length 2 is 1/4, length 3 is 1/8, length 4 is 1/16.",
      why: "1, 2, 3, 3 uses 1/2 + 1/4 + 1/8 + 1/8 = 1, which exactly fills the space. 2, 2, 2 and 1, 2, 3, 4 use less than 1, so they fit. 1, 1, 2 (1.25), 1, 2, 2, 2 (1.25) and five 2s (1.25) overshoot, so two codewords would have to share a prefix." },
    { type: "slider", q: "A 1,000-symbol message uses A 500 times, B 250 times, C 125 times and D 125 times. Plain 8-bit characters cost 8,000 bits. Huffman gives A = 0, B = 10, C = 110, D = 111. Roughly what percentage of the original size is the Huffman version?", min: 0, max: 100, step: 2, ans: 22, tol: 8, unit: "%",
      hint: "Count bits: 500×1 + 250×2 + 125×3 + 125×3. Then compare with 8,000 (about 1,750 out of 8,000).",
      why: "500 + 500 + 375 + 375 = 1,750 bits, and 1,750 / 8,000 is about 22%. Skewed frequencies let the common symbol cost 1 bit instead of 8." },
    { type: "multi", q: "Huffman built an optimal code for one file. Which changes would keep the average code length for that same file optimal? Select all that apply.",
      o: ["Swap the 0 and 1 labels on one branch of the tree", "Break a tie between two equal frequencies the other way round", "Give the rarest symbol the shortest codeword", "Write the frequencies as percentages instead of counts", "Reuse the tree built from a different file"], a: [0, 1, 3],
      why: "Which branch is called 0 or 1 doesn't change any length, equal frequencies can be merged in either order with the same average, and scaling all counts leaves the merges unchanged. Giving the rarest symbol the shortest code is the opposite of the rule, and a tree built from different frequencies is only optimal for that other file." },
  ]);

  /* ==================== a7-lzw ==================== */
  const lzwFig = (() => {
    const rows = [["A", 0, "AB", 2], ["B", 1, "BB", 3], ["B", 1, "BA", 4], ["AB", 2, "ABA", 5], ["BA", 4, "BAB", 6], ["BB", 3, "BBA", 7], ["A", 0, "-", "-"]];
    let s = TX(200, 20, "Input: A B B A B B A B B A   (dictionary starts A = 0, B = 1)", { s: 12 });
    ["match", "output", "new entry"].forEach((h, i) => (s += TX([86, 190, 306][i], 46, h, { s: 12 })));
    rows.forEach(([w, o, e, n], i) => {
      const y = 54 + i * 34;
      s += PK("r" + (i + 1), RC(6, y, 388, 30, { r: 8 }) + TX(26, y + 20, i + 1, { s: 12 }) + TX(86, y + 20, w, { m: 1, s: 14 }) + TX(190, y + 20, o, { m: 1, s: 14 }) + TX(306, y + 20, e === "-" ? "-" : e + " = " + n, { m: 1, s: 14 }));
    });
    return SVG(400, 296, s, "A table tracing LZW encoding of ABBABBABBA");
  })();

  const lzwDecFig = (() => {
    const T = [["0", "A"], ["1", "B"], ["2", "C"], ["3", "BA"], ["4", "AB"]];
    let s = TX(200, 20, "Decoder's table after handling codes 1, 0, 3", { s: 13 });
    T.forEach(([c, v], i) => { const x = 14 + i * 76; s += RC(x, 32, 68, 52, { r: 8, f: i > 2 ? "var(--blue)" : "var(--panel)", fo: i > 2 ? ".2" : "1", k: i > 2 ? "var(--blue)" : "var(--line-2)" }) + TX(x + 34, 54, c, { s: 12 }) + TX(x + 34, 74, v, { m: 1, s: 16 }); });
    s += TX(200, 112, "Next code to arrive: 4", { s: 14 });
    return SVG(400, 124, s, "The decoder's dictionary with entries 0 to 4");
  })();

  B.add("a7-lzw", [
    { type: "pick", q: "A learner traced LZW on the input shown, using the dictionary A = 0, B = 1. One line has the wrong new dictionary entry. Tap that line.",
      fig: lzwFig, a: "r4", hint: "Each new entry is the matched phrase plus the very next letter of the input. Re-trace the input from line 3.",
      why: "After B, B and BA are consumed the input continues A B B, so line 4 matches AB and the next letter is B: the new entry is ABB = 5, not ABA. Lines 1, 2, 3, 5 and 6 follow correctly from the input." },
    { type: "bug", q: "This LZW encoder loses data. After adding a dictionary entry it should start the next phrase with the character that did not fit. Click the faulty line.",
      code: ["def lzw_encode(text, alphabet):", "    table = {ch: i for i, ch in enumerate(alphabet)}", "    w, out = '', []", "    for c in text:", "        if w + c in table:", "            w = w + c", "        else:", "            out.append(table[w])", "            table[w + c] = len(table)", "            w = ''", "    out.append(table[w])", "    return out"], a: 9,
      why: "After emitting code(w) and storing w+c, the encoder must continue with w = c. Resetting to an empty string throws c away, so that letter never gets encoded." },
    { type: "slider", q: "LZW encodes a message of 64 letters that are all A, starting with a dictionary that holds only A = 0. About how many codes does it output?", min: 0, max: 64, step: 1, ans: 11, tol: 3, unit: " codes",
      hint: "Phrases grow by one letter each time: A, AA, AAA, ... so the lengths add up 1 + 2 + 3 + ... until they reach 64.",
      why: "The encoder emits phrases of length 1, 2, 3, ... 10 (that covers 55 letters), then one final code for the last 9 letters: 11 codes in total. The phrase length keeps growing, so the number of codes grows only like the square root of the message length." },
    { type: "cat", q: "Which method suits each data source better, Huffman or LZW?",
      buckets: ["Huffman suits it better", "LZW suits it better"],
      items: [["Letters used very unevenly, but no phrase ever repeats", 0], ["The same long phrases keep recurring, with every letter about equally common", 1], ["A live stream where nothing can be read ahead to count letters", 1], ["Random-order symbols: A 70%, C, G and T 10% each", 0], ["A log file repeating the same long lines thousands of times", 1]],
      why: "Huffman exploits uneven symbol frequencies, even when the order is random. LZW exploits repeated sequences and needs no counts in advance, because both ends build the same dictionary as the data goes by." },
    M("The decoder's table is shown. The next code that arrives is 4 (AB). Which entry does it add as code 5?", ["ABA", "ABB", "BAA", "BAB"], 2, "The new entry is the previous output (BA) plus the first letter of the current one (AB gives A): BA + A = BAA. The decoder is always one entry behind the encoder, so it can add the entry only once it sees the next phrase's first letter.",
      { fig: lzwDecFig, hint: "New entry = previous string + first letter of the current string." }),
  ]);

  /* ==================== a8-hash ==================== */
  const chainFig = (() => {
    const blocks = [["Block 1", "Ann pays Bob 5", "0000", "7c21", ""], ["Block 2", "Bob pays Cy 20", "7c21", "e7b2", "edited (was 2), hash recomputed"], ["Block 3", "Cy pays Di 1", "41af", "9d03", ""], ["Block 4", "Di pays Ed 3", "9d03", "2b58", ""]];
    let s = TX(200, 14, "Short made-up digests. prev = the parent block's hash.", { s: 12 });
    blocks.forEach(([n, d, p, h, note], i) => {
      const y = 28 + i * 64, edited = i === 1;
      s += PK("b" + (i + 1), RC(6, y, 388, 56, { r: 10, k: edited ? "var(--amber)" : "var(--line-2)" }) + TX(18, y + 20, n, { a: "start", s: 13 }) + TX(120, y + 20, d, { a: "start", s: 13 }) + TX(18, y + 42, "prev " + p, { a: "start", m: 1, s: 13 }) + TX(120, y + 42, "hash " + h, { a: "start", m: 1, s: 13 }) + (note ? TX(382, y + 42, note, { a: "end", s: 10, f: "var(--amber-ink, var(--text))" }) : ""));
    });
    return SVG(400, 288, s, "A chain of four blocks where block 2 was edited");
  })();

  const pairFig = (() => {
    const pairs = [{ id: "p1", name: "Hash P", a: "1011001110100101", b: "1011001110110101" }, { id: "p2", name: "Hash Q", a: "0110001101000010", b: "0100111010100011" }];
    let s = TX(200, 16, "First 16 bits of each digest. Inputs differ by one character.", { s: 12 });
    pairs.forEach((p, k) => {
      const y = 28 + k * 100;
      s += PK(p.id, RC(4, y, 392, 90, { r: 12, f: "var(--bg-2)", k: "var(--line)" }) + TX(40, y + 24, p.name, { s: 13 }) +
        [...p.a].map((c, i) => bitCell(76 + i * 19, y + 10, c, { w: 18, h: 28, sw: 1, tf: "var(--text)" })).join("") +
        [...p.b].map((c, i) => bitCell(76 + i * 19, y + 46, c, { w: 18, h: 28, sw: 1, f: c !== p.a[i] ? "var(--rose)" : "var(--panel)", fo: c !== p.a[i] ? ".35" : "1" })).join("") +
        TX(40, y + 40, "before", { s: 10 }) + TX(40, y + 68, "after", { s: 10 }));
    });
    return SVG(400, 232, s, "Two pairs of digests with the differing bits highlighted");
  })();

  B.add("a8-hash", [
    { type: "pick", q: "An attacker edited block 2 and recomputed only block 2's own hash. Nothing else was touched. The checker validates each block in turn: its stored hash must match its contents, and its prev must equal the previous block's stored hash. Tap the first block that fails.",
      fig: chainFig, a: "b3", hint: "Compare each block's prev with the hash stored in the block above it.",
      why: "Block 2 passes: its own hash was recomputed and its prev still matches block 1. Block 3 still stores prev 41af, the OLD hash of block 2, but block 2 now has hash e7b2, so the link breaks there. Block 4 still matches block 3's stored hash." },
    { type: "cat", q: "Should each job use a hash (a one-way fingerprint) or encryption (reversible with a key)?",
      buckets: ["Hash", "Encryption"],
      items: [["Checking a login password without storing it", 0], ["Sending a private message the receiver must read", 1], ["Confirming a big download wasn't corrupted", 0], ["Storing a card number so a shop can charge it next month", 1], ["Spotting duplicate files without comparing every byte", 0]],
      why: "Hashes give a fixed fingerprint that cannot be turned back into the input, which is right when you only need to compare or verify. When the original must be recovered later (a message, a stored card number) you need encryption, which a key can reverse." },
    { type: "pick", q: "Both hash functions below were given two inputs that differ by a single character. One is suitable for detecting tampering and for proof of work. Tap that hash.",
      fig: pairFig, a: "p2", hint: "A good hash changes about half its output bits when the input changes at all.",
      why: "Hash Q flips about half of its bits (the avalanche effect), so the digest of an edited input looks unrelated to the original. Hash P flips just one bit, so edited inputs give almost the same digest and an attacker can search for a matching one easily." },
    { type: "order", q: "Put the steps of mining one block in order.",
      items: ["Collect transactions and the previous block's hash into a block", "Choose a nonce and hash the whole block", "Check whether the digest starts with enough zeros", "Not enough zeros: change the nonce and hash again", "Enough zeros: broadcast the block", "Everyone else re-hashes it once to confirm"],
      why: "Finding a good nonce is trial and error that can repeat millions of times, while confirming it takes one hash. That imbalance (costly to make, cheap to check) is what makes proof of work useful." },
    { type: "bug", q: "A thief edits the data in the very last block of a chain, but this validity checker still says the chain is fine. Click the faulty line.",
      code: ["def valid(chain):", "    for i in range(1, len(chain) - 1):", "        cur, prev = chain[i], chain[i - 1]", "        if cur['prev'] != prev['hash']:", "            return False", "        if sha(cur['data'] + cur['prev']) != cur['hash']:", "            return False", "    return True"], a: 1,
      why: "range(1, len(chain) - 1) stops before the last block, so it is never checked. The loop should run to len(chain). This off-by-one means the newest block can be tampered with freely." },
  ]);

  /* ==================== a8-keys ==================== */
  const dhFig = (() => {
    const chips = [["p", "p (the prime)"], ["g", "g (the base)"], ["a", "a (Alice's number)"], ["b", "b (Bob's number)"], ["A", "A = g^a mod p"], ["B", "B = g^b mod p"], ["K", "K (final shared value)"]];
    let s = "";
    chips.forEach(([id, t], i) => {
      const x = 8 + (i % 2) * 196, y = 8 + Math.floor(i / 2) * 54;
      s += PK(id, RC(x, y, 184, 44, { r: 12 }) + TX(x + 92, y + 28, t, { s: 14 }));
    });
    return SVG(392, 228, s, "Seven values used in a Diffie-Hellman exchange");
  })();

  const mitmFig = (() => {
    const box = (x, t, k) => RC(x, 36, 100, 56, { r: 12, k: k || "var(--line-2)", f: k ? "var(--rose)" : "var(--panel)", fo: k ? ".15" : "1" }) + TX(x + 50, 70, t, { s: 14 });
    return SVG(400, 150, box(8, "Alice") + box(150, "Mallory", "var(--rose)") + box(292, "Bob") +
      LN(108, 64, 150, 64, { w: 3 }) + LN(250, 64, 292, 64, { w: 3 }) +
      TX(80, 22, "exchange 1", { s: 12 }) + TX(320, 22, "exchange 2", { s: 12 }) +
      TX(58, 118, "key K1", { s: 13, f: "var(--blue)" }) + TX(342, 118, "key K2", { s: 13, f: "var(--blue)" }) + TX(200, 118, "knows K1 and K2", { s: 12, f: "var(--rose)" }) +
      TX(200, 142, "Alice and Bob each believe they talk to the other directly", { s: 11 }), "Mallory sitting between Alice and Bob running two separate exchanges");
  })();

  B.add("a8-keys", [
    { type: "pick", q: "Alice and Bob run Diffie-Hellman across a wire that Eve can read. They announce p and g in the clear and then send each other A and B. Tap every value that Eve can read from the wire.",
      fig: dhFig, a: ["A", "B", "g", "p"],
      why: "p, g, A and B all cross the wire openly. Their private numbers a and b never leave their owners, and the shared value K is computed locally by each side. Eve would have to solve the discrete logarithm problem to get a or b from A or B." },
    { type: "order", q: "Put the steps of generating a toy RSA key pair in order.",
      items: ["Pick two primes p and q", "Multiply them to get n = p × q", "Compute φ = (p − 1)(q − 1)", "Choose e that shares no factor with φ", "Find d so that e × d leaves remainder 1 when divided by φ", "Publish (n, e) and keep d secret"],
      why: "Each step feeds the next: φ needs p and q, e must be coprime to φ, and d is the inverse of e modulo φ. Only n and e are published." },
    { type: "cat", q: "In RSA, which of these can Eve safely see, and which must stay secret?",
      buckets: ["Safe for Eve to see", "Must stay secret"],
      items: [["n (the modulus)", 0], ["e (the public exponent)", 0], ["d (the private exponent)", 1], ["The primes p and q", 1], ["The ciphertext sent to you", 0], ["φ = (p − 1)(q − 1)", 1]],
      why: "n, e and the ciphertext are all public. p, q and φ give away d, since anyone who knows φ can compute d from e, so they must stay secret along with d itself. Security rests on the difficulty of factoring n into p and q." },
    { type: "match", q: "Match each job to the key it uses.",
      pairs: [["Send Bob a message only he can read", "Bob's public key"], ["Bob reads that message", "Bob's private key"], ["Alice signs a contract so anyone can check it came from her", "Alice's private key"], ["A stranger checks Alice's signature", "Alice's public key"]],
      why: "Encryption uses the receiver's public key and decryption the receiver's private key. Signing flips it: only the owner can sign with her private key, and anyone can verify with her public key." },
    M("Mallory sits between Alice and Bob and runs a separate Diffie-Hellman exchange with each of them, as drawn. What is the situation afterwards?",
      ["Two different keys exist, and Mallory knows both of them", "One key is shared by all three, so Mallory can only listen", "Alice and Bob share one key that Mallory cannot work out", "The maths fails so both sides are told to start again"], 0,
      "Each exchange succeeds with its own key. Mallory decrypts with K1, reads, re-encrypts with K2 and passes it on, while both victims think they share one key. Diffie-Hellman gives a secret but no proof of who is at the other end, which is why certificates and signatures are needed.",
      { fig: mitmFig }),
  ]);

  /* ==================== a9-dft ==================== */
  const dftBars = (() => {
    const N = 32, mag = (f) => Array.from({ length: 17 }, (_, k) => {
      let re = 0, im = 0;
      for (let n = 0; n < N; n++) { const x = Math.sin(2 * Math.PI * f * n / N), a = -2 * Math.PI * k * n / N; re += x * Math.cos(a); im += x * Math.sin(a); }
      return Math.hypot(re, im);
    });
    const panels = [{ id: "A", t: "Spectrum A", m: mag(5.5) }, { id: "B", t: "Spectrum B", m: mag(5) }];
    let s = TX(200, 16, "32 samples over exactly 1 second, so bin k means k Hz", { s: 12 });
    panels.forEach((p, k) => {
      const y = 26 + k * 110;
      s += PK(p.id, RC(4, y, 392, 102, { r: 12, f: "var(--bg-2)", k: "var(--line)" }) + TX(36, y + 20, p.t, { s: 13, a: "start" }) +
        p.m.map((v, i) => { const h = Math.max(1, v / 16 * 56), x = 24 + i * 21; return `<rect x="${x}" y="${y + 90 - h - 10}" width="15" height="${h}" rx="2" fill="var(--blue)"/>`; }).join("") +
        [0, 5, 10, 15].map((i) => TX(24 + i * 21 + 7, y + 98, i, { s: 10 })).join(""));
    });
    return SVG(400, 250, s, "Two magnitude spectra from a 32-sample window");
  })();

  B.add("a9-dft", [
    { type: "pick", q: "One of these spectra comes from a 5 Hz sine and the other from a 5.5 Hz sine, both recorded for exactly 1 second. Tap the spectrum of the 5.5 Hz tone.",
      fig: dftBars, a: "A", hint: "Does the window hold a whole number of cycles for each tone?",
      why: "5 Hz fits exactly 5 cycles into the window, so all the energy lands in bin 5. 5.5 Hz leaves half a cycle dangling, the window edges look like a jump, and energy smears (leaks) into neighbouring bins. Spectrum A is the smeared one." },
    { type: "match", q: "Match each signal to the spectrum shape you would expect.",
      pairs: [["A pure musical note", "One tall spike at the note's frequency"], ["A steady offset that never changes", "A spike at bin 0 only"], ["A single sharp click", "Similar energy in every bin"], ["Random hiss", "A jagged spread with no clear spike"]],
      why: "A steady sine matches one frequency. A constant has no wiggle, so only bin 0 responds. A very short click contains every frequency equally, so its spectrum is flat. Random noise spreads energy irregularly across all bins." },
    { type: "slider", q: "A hum recording contains a 50 Hz tone and a 52 Hz tone. To see them as two separate peaks you need bins at most 2 Hz apart. Sampling at 1,000 Hz, roughly how many seconds of signal must you record?", min: 0, max: 4, step: 0.25, ans: 0.5, tol: 0.25, unit: " s",
      hint: "Bin spacing is 1 divided by the recording time, whatever the sample rate is.",
      why: "Bin spacing = fs / N = 1 / T. For 2 Hz spacing you need T = 0.5 s (500 samples at 1,000 Hz). Sampling faster adds samples but doesn't sharpen frequency resolution. Only a longer recording does." },
    { type: "multi", q: "A 60 Hz hum is being recorded at 100 Hz and shows up as a fake 40 Hz peak. Which actions would genuinely stop the false peak? Select all that apply.",
      o: ["Sample at more than 120 Hz", "Pass the signal through an analogue low-pass filter before sampling", "Record for ten times longer", "Apply a Hann window to the samples", "Delete the bins above 50 Hz after sampling"], a: [0, 1],
      why: "Aliasing happens at the moment of sampling: samples of 60 Hz and 40 Hz are identical, so nothing afterwards can tell them apart. You either sample fast enough or remove the high frequencies before sampling. A longer record or window changes resolution and leakage, not aliasing." },
    { type: "bug", q: "Every bin of the output of this DFT comes out equal to sum(x). Click the faulty line.",
      code: ["import cmath", "def dft(x):", "    N = len(x)", "    X = []", "    for k in range(N):", "        total = 0", "        for n in range(N):", "            total += x[n] * cmath.exp(-2j * cmath.pi * k * n)", "        X.append(total)", "    return X"], a: 7,
      why: "The rotation for bin k at sample n is e^(-2πj·k·n/N). Without dividing by N, the angle is always a whole number of turns, so the factor is 1 and every bin just adds up the samples. The missing / N is the bug." },
  ]);

  /* ==================== a9-fft ==================== */
  const splitFig = (() => {
    let s = RC(110, 6, 180, 32, { r: 10 }) + TX(200, 27, "x0 x1 x2 ... x15", { s: 13 });
    s += LN(160, 38, 100, 66) + LN(240, 38, 300, 66);
    s += RC(10, 66, 190, 32, { r: 10 }) + TX(105, 87, "0 2 4 6 8 10 12 14", { s: 12 }) + RC(204, 66, 190, 32, { r: 10 }) + TX(299, 87, "1 3 5 7 9 11 13 15", { s: 12 });
    s += LN(70, 98, 50, 128) + LN(140, 98, 150, 128) + LN(260, 98, 250, 128) + LN(340, 98, 350, 128);
    const G = [["g1", "0 4 8 12", 6], ["g2", "2 6 10 14", 104], ["g3", "1 5 9 13", 202], ["g4", "3 7 11 15", 300]];
    G.forEach(([id, t, x]) => (s += PK(id, RC(x, 128, 94, 40, { r: 10 }) + TX(x + 47, 153, t, { s: 12 }))));
    return SVG(400, 180, s, "Two levels of even/odd splitting for 16 samples");
  })();

  const bflyFig = (() => {
    const nodeAt = (x, y, t, o = {}) => RC(x - 26, y - 17, 52, 34, { r: 10, f: o.f, fo: o.fo, k: o.k }) + TX(x, y + 5, t, { s: 14, m: 1 });
    const ys = [34, 94, 154, 214];
    let s = "";
    // wires: E0->X0,X2; O0->X0,X2; E1->X1,X3; O1->X1,X3
    s += LN(90, ys[0], 290, ys[0]) + LN(90, ys[0], 290, ys[2]) + LN(90, ys[2], 290, ys[0]) + LN(90, ys[2], 290, ys[2]);
    s += LN(90, ys[1], 290, ys[1]) + LN(90, ys[1], 290, ys[3]) + LN(90, ys[3], 290, ys[1]) + LN(90, ys[3], 290, ys[3]);
    [["E0", "4"], ["E1", "-2"], ["O0", "6"], ["O1", "-2"]].forEach(([n, v], i) => (s += nodeAt(90, ys[i], v, { f: i < 2 ? "var(--blue)" : "var(--amber)", fo: ".2", k: i < 2 ? "var(--blue)" : "var(--amber)" }) + TX(40, ys[i] + 5, n, { s: 12 })));
    ["X0", "X1", "X2", "X3"].forEach((n, i) => (s += nodeAt(290, ys[i], "?", { f: "var(--panel)" }) + TX(340, ys[i] + 5, n, { s: 13 })));
    s += TX(190, 14, "X[k] = E[k] + W·O[k] and X[k+2] = E[k] − W·O[k]", { s: 12 });
    s += TX(190, 244, "k = 0: W = 1.   k = 1: W = −j.", { s: 12 });
    return SVG(400, 256, s, "Final butterfly stage of a 4-point FFT with E0 = 4, E1 = −2, O0 = 6, O1 = −2");
  })();

  B.add("a9-fft", [
    { type: "pick", q: "A 16-point FFT splits its samples into even-numbered and odd-numbered positions, then splits each of those lists the same way. Positions are counted from 0 within each list. After two splits, which group does sample x6 land in? Tap it.",
      fig: splitFig, a: "g2", hint: "x6 is at position 3 (odd) in the even list 0 2 4 6 8 10 12 14. Which child gets the odd positions?",
      why: "The first split sends x6 to the even list. In that list x6 sits at position 3, an odd position, so the second split sends it to the odd child: 2 6 10 14. The leaves of the full recursion therefore follow the bit-reversed order." },
    { type: "slider", q: "The direct DFT takes 20 ms on 1,000 samples, and its work grows with the square of the sample count. About how long will it take on 4,000 samples?", min: 0, max: 800, step: 20, ans: 320, tol: 100, unit: " ms",
      hint: "4 times as many samples means 4 × 4 times as much work.",
      why: "Work grows like N², so 4× the samples costs 16× the time: 20 ms × 16 = 320 ms. An FFT on the same 4,000 samples would take only a little over 4× as long as for 1,000, which is the whole point of using it." },
    { type: "order", q: "Put the stages of a recursive radix-2 FFT in order.",
      items: ["Split the samples into even-indexed and odd-indexed halves", "Keep splitting until every piece has just one sample", "Treat each single sample as its own DFT", "Combine pairs of results with butterflies", "Keep merging upwards until one full-length spectrum is left"],
      why: "The FFT first breaks the problem down, using the fact that a single sample is its own DFT, and then builds the answer back up level by level. Each level costs about N operations and there are log2 N levels." },
    { type: "bug", q: "The output of this FFT repeats its first half in its second half, so the spectrum is wrong. Click the faulty line.",
      code: ["import cmath", "def fft(x):", "    N = len(x)", "    if N == 1:", "        return x", "    even = fft(x[0::2])", "    odd = fft(x[1::2])", "    out = [0] * N", "    for k in range(N // 2):", "        t = cmath.exp(-2j * cmath.pi * k / N) * odd[k]", "        out[k] = even[k] + t", "        out[k + N // 2] = even[k] + t", "    return out"], a: 11,
      why: "A butterfly produces two outputs: even[k] + t and even[k] − t. The second half must use the minus sign, because the rotation by half a turn flips the sign of the odd part's contribution. With a plus, both halves are identical." },
    M("The last stage of a 4-point FFT is shown, built from inputs x = 1, 2, 3, 4. What is X[2]?", ["−2", "2", "6", "10"], 0, "X[2] = E[0] − W⁰·O[0] = 4 − 1×6 = −2. Check with the DFT formula: 1 − 2 + 3 − 4 = −2. X[0] would be 4 + 6 = 10 (the sum of the inputs).",
      { fig: bflyFig, hint: "Bin 2 pairs E0 with O0 using a minus sign and twiddle 1." }),
  ]);

  /* ==================== a10-attn ==================== */
  const heatFig = (() => {
    const W = [[1, 0, 0, 0], [0.3, 0.7, 0, 0], [0.2, 0.5, 0.5, 0], [0.1, 0.4, 0.2, 0.3]], tok = ["the", "dog", "chased", "it"];
    let s = TX(200, 16, "Attention weights, one row per token (decoder with a causal mask)", { s: 12 });
    tok.forEach((t, c) => (s += TX(120 + c * 60 + 28, 42, t, { s: 12 })));
    W.forEach((row, r) => {
      const y = 52 + r * 48;
      s += TX(106, y + 29, tok[r], { a: "end", s: 12 }) + PK("r" + (r + 1), RC(116, y, 248, 42, { r: 8, f: "var(--bg-2)", k: "var(--line)" }) +
        row.map((v, c) => `<rect x="${120 + c * 60}" y="${y + 4}" width="56" height="34" rx="6" fill="var(--blue)" fill-opacity="${v ? 0.12 + v * 0.55 : 0}" stroke="var(--line-2)" stroke-width="1"/>` + TX(120 + c * 60 + 28, y + 27, v, { s: 14 })).join(""));
    });
    return SVG(400, 252, s, "A four by four attention weight matrix for the sentence the dog chased it");
  })();

  const satFig = `<table style="border-collapse:collapse;margin:0 auto;font:800 14px var(--sans);color:var(--text)"><tr>${["", "Raw scores", "Softmax weights"].map((h) => `<th style="padding:6px 12px;border:2px solid var(--line);background:var(--bg-2)">${h}</th>`).join("")}</tr>${[["Row X", "0.5, 0.2, 0.1", "0.41, 0.31, 0.28"], ["Row Y", "20, 8, 4", "1.00, 0.00, 0.00"]].map((r) => `<tr>${r.map((c) => `<td style="padding:6px 12px;border:2px solid var(--line);text-align:center">${c}</td>`).join("")}</tr>`).join("")}</table>`;

  B.add("a10-attn", [
    { type: "pick", q: "A student prints the attention weights of a decoder as shown. Every row must be a valid softmax output after causal masking. Exactly one row cannot be. Tap it.",
      fig: heatFig, a: "r3", hint: "Softmax weights are never negative and each row must add up to 1.",
      why: "Row 3 adds up to 0.2 + 0.5 + 0.5 = 1.2, but softmax weights always sum to exactly 1. The other rows sum to 1, and each one has zeros where the causal mask hides later tokens." },
    M("Row Y's raw scores are what you'd see with a large key size d_k and no scaling. What goes wrong?",
      ["Softmax collapses to one-hot, so other tokens get almost no learning signal", "The weights add up to more than 1, so each output vector gets too large", "The causal mask stops working, so tokens begin to see later tokens", "Softmax outputs turn negative, so some weights fall below zero"], 0,
      "Large gaps between scores make softmax saturate: one token takes essentially all the weight and the others get almost none, so the gradients flowing to them vanish. Dividing by √d_k keeps the scores in a range where softmax stays soft. The weights still sum to 1 and stay positive.",
      { fig: satFig, hint: "Compare how spread out each row's weights are." }),
    { type: "cat", q: "A context grows from n to 2n tokens. Which quantities grow about 4 times (quadratic), and which about 2 times (linear)?",
      buckets: ["Quadratic (about 4×)", "Linear (about 2×)"],
      items: [["Query–key scores computed in one head", 0], ["Token embeddings looked up", 1], ["Entries in the attention weight matrix", 0], ["Position vectors added", 1], ["Cells the causal mask must cover", 0], ["Value vectors that get mixed", 1]],
      why: "Every token is scored against every token, giving an n × n grid: scores, weights and mask all grow with n². Anything stored once per token (embeddings, positions, values) grows only with n." },
    { type: "order", q: "Put the steps of one masked self-attention layer in order.",
      items: ["Turn tokens into vectors and add position information", "Make a query, key and value vector for each token", "Score every query against every key", "Divide the scores by the square root of the key size", "Hide future tokens with the causal mask", "Softmax each row into weights that sum to 1", "Add up the value vectors using those weights"],
      why: "Scores come before softmax, the mask must act before softmax so hidden tokens get exactly zero weight, and the values are only mixed after the weights exist." },
    { type: "bug", q: "A model built with this attention function still peeks at later tokens. Click the faulty line.",
      code: ["import numpy as np", "def attention(Q, K, V):", "    d = K.shape[-1]", "    scores = Q @ K.T / np.sqrt(d)", "    future = np.triu(np.ones_like(scores), k=1)", "    scores = scores * (1 - future)", "    w = np.exp(scores)", "    w = w / w.sum(axis=-1, keepdims=True)", "    return w @ V"], a: 5,
      why: "Multiplying by zero sets the future scores to 0, not to minus infinity. exp(0) = 1, so those tokens still get a real share of the softmax. The mask must put -inf there, for example np.where(future == 1, -np.inf, scores), so their weight is exactly 0." },
  ]);
})();

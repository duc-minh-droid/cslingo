/* ===== bank-v-algo-3.js ===== */
/* ALGO revision bank, visual and varied questions, part 3. Numbers computed by running the real algorithms in node. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const B = NIC.bank;

  /* ---------- tiny SVG helpers (CSS variables so both themes work) ---------- */
  const SVG = (w, h, inner, label) =>
    `<svg viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;display:block;margin:0 auto" role="img" aria-label="${label}">${inner}</svg>`;
  const TX = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" fill="${o.f || "var(--text)"}" style="font:${o.w || 800} ${o.s || 13}px ${o.m ? "ui-monospace,Consolas,monospace" : "var(--sans)"}${o.ls ? `;letter-spacing:${o.ls}px` : ""}">${s}</text>`;
  const RC = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r == null ? 8 : o.r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const LN = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.d ? ` stroke-dasharray="${o.d}"` : ""}/>`;
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const bitCell = (x, y, v, o = {}) =>
    RC(x, y, o.w || 26, o.h || 30, { f: o.f, fo: o.fo, k: o.k, w: o.sw || 2, r: 6 }) +
    TX(x + (o.w || 26) / 2, y + (o.h || 30) / 2 + 5, v, { m: 1, s: 15, f: o.tf });
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });

  /* ==================== a6-crc ==================== */
  // 2D parity grid, one bit flipped; failing row/column checks marked
  const parityFig = (() => {
    const data = [
      [1, 0, 1, 1],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 0],
    ];
    const g = data.map((r) => [...r, r.reduce((s, x) => s + x) % 2]);
    g.push([0, 1, 2, 3, 4].map((c) => g.reduce((s, r) => s + r[c], 0) % 2));
    const got = g.map((r) => r.slice());
    got[2][1] ^= 1; // the flipped bit: row 2, column 1
    const rowBad = got.map((r) => r.reduce((s, x) => s + x) % 2 === 1);
    const colBad = [0, 1, 2, 3, 4].map((c) => got.reduce((s, r) => s + r[c], 0) % 2 === 1);
    let s = "";
    const X0 = 50,
      Y0 = 34,
      W = 44,
      H = 40;
    ["c1", "c2", "c3", "c4", "par"].forEach(
      (t, c) => (s += TX(X0 + c * W + W / 2, 22, t, { s: 12, f: "var(--text-2, var(--text))" })),
    );
    got.forEach((r, i) => {
      s += TX(X0 - 8, Y0 + i * H + H / 2 + 5, i < 4 ? "r" + (i + 1) : "par", { a: "end", s: 12 });
      r.forEach((v, c) => {
        const x = X0 + c * W,
          y = Y0 + i * H;
        const par = i === 4 || c === 4;
        s += PK(
          `r${i}c${c}`,
          RC(x + 2, y + 2, W - 4, H - 4, { f: par ? "var(--bg-2)" : "var(--panel)", r: 6 }) +
            TX(x + W / 2, y + H / 2 + 5, v, { m: 1, s: 16 }),
        );
      });
      s += rowBad[i] ? `<circle cx="${X0 + 5 * W + 18}" cy="${Y0 + i * H + H / 2}" r="8" fill="var(--rose)"/>` : "";
    });
    colBad.forEach((b, c) => {
      if (b) s += `<circle cx="${X0 + c * W + W / 2}" cy="${Y0 + 5 * H + 16}" r="8" fill="var(--rose)"/>`;
    });
    s +=
      `<circle cx="${X0 + 6}" cy="276" r="7" fill="var(--rose)"/>` +
      TX(X0 + 20, 281, "red dot = this check fails", { a: "start", s: 12 });
    return SVG(330, 292, s, "A 4 by 4 grid of bits with a parity row and column; red dots mark the failing checks");
  })();

  const crcRows = [
    ["11010000", "10110000", "01100000"],
    ["01100000", "01011000", "00111000"],
    ["00111000", "00101100", "00011100"],
    ["00011100", "00010110", "00001010"],
  ];
  const crcFig = (() => {
    let s = TX(200, 20, "Message 11010, generator 1011, three zeros appended", { s: 13 });
    s += TX(60, 46, "was", { s: 12 }) + TX(170, 46, "XOR generator", { s: 12 }) + TX(305, 46, "gives", { s: 12 });
    crcRows.forEach(([a, b, c], i) => {
      const y = 56 + i * 48;
      s += PK(
        `r${i + 1}`,
        RC(6, y, 388, 40, { r: 10 }) +
          TX(26, y + 26, i + 1, { s: 13 }) +
          TX(86, y + 26, a, { m: 1, s: 15, ls: 1 }) +
          TX(200, y + 26, b, { m: 1, s: 15, ls: 1 }) +
          TX(318, y + 26, c, { m: 1, s: 15, ls: 1 }),
      );
    });
    return SVG(400, 256, s, "Four lines of CRC long-division working");
  })();

  B.add("a6-crc", [
    {
      type: "multi",
      q: "A receiver accepts a frame when its remainder after dividing by the generator 1011 is 000. Noise XORs an error pattern E onto a frame that was valid. Which patterns would slip through unnoticed? Select all that apply.",
      fig: SVG(
        400,
        120,
        TX(200, 20, "Sent frame (valid, remainder 000)", { s: 13 }) +
          [..."1101001"].map((b, i) => bitCell(66 + i * 36, 30, b, { w: 32 })).join("") +
          TX(34, 52, "sent", { s: 12 }) +
          [..."0000100"]
            .map((b, i) =>
              bitCell(66 + i * 36, 70, b, {
                w: 32,
                f: b === "1" ? "var(--rose)" : "var(--panel)",
                fo: b === "1" ? ".3" : "1",
              }),
            )
            .join("") +
          TX(34, 92, "E", { s: 12 }) +
          TX(200, 112, "Example E = 0000100 leaves remainder 100, so it is caught", { s: 12 }),
        "A valid frame and an example error pattern",
      ),
      o: ["E = 0000100", "E = 0001011", "E = 0010110", "E = 0000110", "E = 1011000"],
      a: [1, 2, 4],
      hint: "Dividing the corrupted frame leaves the same remainder as dividing E alone. Which E are exact multiples of 1011 (1011 shifted left by 0, 1 or 3 places)?",
      why: "The valid frame leaves remainder 0, so the corrupted frame leaves the remainder of E alone. E = 0001011 is 1011 itself, 0010110 is 1011 shifted by one and 1011000 is shifted by three: all divide exactly, so the receiver sees 000 and accepts. 0000100 leaves 100 and 0000110 leaves 110, so both are caught.",
    },
    {
      type: "pick",
      q: "A student works out a CRC by hand: generator 1011, message 11010, three zeros appended. Each line should be the previous result XOR the generator lined up under its leading 1. Tap the first line where the XOR goes wrong.",
      fig: crcFig,
      a: "r3",
      why: "Line 3 should be 00111000 XOR 00101100 = 00010100. The student wrote 00011100, so one bit is wrong. Lines 1, 2 and 4 are correct XORs of what is above them, which is why the error is easy to miss if you only check the final remainder.",
    },
    {
      type: "bug",
      q: "This function should compute a CRC remainder with long division, where every step is an XOR (no carries). Click the faulty line.",
      code: [
        "def crc_rem(msg, gen):",
        "    n = len(gen) - 1",
        "    bits = [int(b) for b in msg + '0' * n]",
        "    for i in range(len(msg)):",
        "        if bits[i] == 1:",
        "            for j in range(len(gen)):",
        "                bits[i + j] = bits[i + j] + int(gen[j])",
        "    return bits[-n:]",
      ],
      a: 6,
      why: "In mod-2 arithmetic the subtraction step is XOR. Adding produces 2s and carries, so the bits are no longer 0 or 1 and the remainder is garbage. The line should read bits[i + j] ^= int(gen[j]).",
    },
    {
      type: "order",
      q: "Put the steps of a CRC round trip in order.",
      items: [
        "Sender appends as many zeros as the generator's degree",
        "Sender divides by the generator using XOR long division",
        "Sender swaps the appended zeros for the remainder",
        "Frame travels across the noisy link",
        "Receiver divides the whole frame by the same generator",
        "A remainder of zero means accept; anything else means corrupted",
      ],
      why: "The zeros make room for the remainder, and replacing them makes the whole frame an exact multiple of the generator. The receiver therefore expects a remainder of zero.",
    },
    {
      type: "pick",
      q: "Every row and every column of this grid should hold an even number of 1s, including the parity row and parity column. Exactly one bit flipped in transit, and the failing checks are marked with red dots. Tap the flipped bit.",
      fig: parityFig,
      a: "r2c1",
      hint: "The bad bit sits where the failing row and the failing column cross.",
      why: "Row 3 and column 2 are the only failing checks. A single flipped bit breaks exactly one row and one column, so their crossing (row 3, column 2) must be the culprit. Flipping it back makes every check pass.",
    },
  ]);

  /* ==================== a6-hamming ==================== */
  const hamFig = (() => {
    const v = [1, 1, 1, 1, 1, 1, 0],
      lab = ["p1", "p2", "d3", "p4", "d5", "d6", "d7"];
    let s = TX(190, 18, "Received word (positions 1 to 7)", { s: 13 });
    v.forEach((b, i) => {
      const x = 12 + i * 48;
      s +=
        TX(x + 22, 46, lab[i], { s: 12 }) +
        PK(String(i + 1), RC(x, 54, 44, 44, { r: 8 }) + TX(x + 22, 83, b, { m: 1, s: 18 })) +
        TX(x + 22, 116, i + 1, { s: 12 });
    });
    s +=
      TX(12, 148, "p1 checks positions 1, 3, 5, 7", { a: "start", s: 13 }) +
      TX(12, 170, "p2 checks positions 2, 3, 6, 7", { a: "start", s: 13 }) +
      TX(12, 192, "p4 checks positions 4, 5, 6, 7", { a: "start", s: 13 }) +
      TX(12, 214, "Even parity: each group should hold an even number of 1s", {
        a: "start",
        s: 12,
        f: "var(--text-2, var(--text))",
      });
    return SVG(360, 226, s, "A received 7-bit Hamming word with the three parity groups listed");
  })();

  B.add("a6-hamming", [
    {
      type: "cat",
      q: "Hamming(7,4) always applies the single-error fix: flip the bit its syndrome names. After that fix, is the 4-bit data right or wrong in each case?",
      buckets: ["Data comes out right", "Data comes out wrong"],
      items: [
        ["No bits flipped", 0],
        ["One data bit flipped", 0],
        ["One parity bit flipped", 0],
        ["Two bits flipped", 1],
        ["Three bits flipped", 1],
      ],
      why: "With zero or one flip the syndrome is 000 or names the broken bit, so the fix gives back the sent word. With two flips the syndrome points at a third, innocent bit, and with three it either shows 000 or names another innocent bit. Either way the result is a different valid codeword with the wrong data.",
    },
    {
      type: "bug",
      q: "This Hamming(7,4) encoder puts the data bits in positions 3, 5, 6 and 7. One parity bit is computed from the wrong group. Click the faulty line.",
      code: [
        "def encode(d):  # d = [d3, d5, d6, d7]",
        "    c = [0] * 8  # use c[1] to c[7]",
        "    c[3], c[5], c[6], c[7] = d",
        "    c[1] = c[3] ^ c[5] ^ c[7]",
        "    c[2] = c[3] ^ c[6] ^ c[7]",
        "    c[4] = c[3] ^ c[5] ^ c[6]",
        "    return c[1:]",
      ],
      a: 5,
      why: "p4 covers positions 4, 5, 6 and 7 (the ones with a 1 in the front binary digit), so it should be c[5] ^ c[6] ^ c[7]. The buggy line uses position 3 instead of 7, so single errors at 3 or 7 would give the wrong syndrome.",
    },
    {
      type: "pick",
      q: "Two bits flipped in transit, so Hamming(7,4) cannot know that. The receiver checks the three groups, reads the syndrome and flips the position it names. Which bit does it flip? Tap it.",
      fig: hamFig,
      a: "7",
      hint: "Count the 1s in each group. A group with an odd count fails. Read the failures as p4 p2 p1.",
      why: "All three groups hold three 1s, an odd count, so all three fail: syndrome 111 = position 7. But the real flips were at positions 2 and 5. The receiver changes bit 7, which was fine, so the word ends up with three wrong bits.",
    },
    {
      type: "order",
      q: "Put the receiver's steps in order for a Hamming(7,4) word.",
      items: [
        "Recompute the parity of the p1, p2 and p4 groups",
        "Write the failures as a binary number p4 p2 p1 (the syndrome)",
        "If the syndrome is not 000, flip the bit at that position",
        "Read the data bits from positions 3, 5, 6 and 7",
      ],
      why: "The syndrome has to be computed before it can be used, and the data is only read after the repair.",
    },
    M(
      'A syndrome with r bits can name 2^r different outcomes. It must say either "no error" or which one of the n positions is wrong. What is the smallest r that works for a 31-bit codeword?',
      ["4", "5", "6", "7"],
      1,
      "One outcome for no error plus 31 positions is 32 outcomes, and 2^5 = 32 exactly. That is why Hamming(31,26) uses 5 parity bits. With r = 4 there are only 16 outcomes.",
      {
        fig: SVG(
          300,
          136,
          TX(150, 20, "r parity bits can name 2^r outcomes", { s: 13 }) +
            [
              ["r = 3", "8"],
              ["r = 4", "16"],
              ["r = 5", "32"],
              ["r = 6", "64"],
            ]
              .map(
                ([a, b], i) =>
                  RC(30, 32 + i * 26, 240, 22, { r: 6 }) +
                  TX(60, 48 + i * 26, a, { a: "start" }) +
                  TX(250, 48 + i * 26, b, { a: "end" }),
              )
              .join(""),
          "Table of r against 2 to the power r",
        ),
      },
    ),
  ]);

  /* ==================== a7-entropy ==================== */
  const surpriseFig = (() => {
    const P = [
      ["A", 0.6, "0.7"],
      ["B", 0.3, "1.7"],
      ["C", 0.08, "3.6"],
      ["D", 0.02, "5.6"],
    ];
    let s = "";
    P.forEach(([k, p, sur], i) => {
      const x = 14 + i * 96,
        h = Math.max(4, p * 130);
      s += PK(
        k,
        RC(x, 8, 86, 210, { r: 10, f: "var(--bg-2)" }) +
          RC(x + 25, 150 - h + 20, 36, h, { r: 5, f: "var(--blue)", k: "var(--blue)" }) +
          TX(x + 43, 176, k, { s: 16 }) +
          TX(x + 43, 194, "p = " + p, { s: 12 }) +
          TX(x + 43, 211, "surprise " + sur + " bits", { s: 11 }),
      );
    });
    return SVG(400, 226, s, "Four symbols with their probabilities and surprise values");
  })();

  const claimFig = `<table style="border-collapse:collapse;margin:0 auto;font:800 14px var(--sans);color:var(--text)"><tr>${["Symbol", "Probability", "Claimed code length"].map((h) => `<th style="padding:6px 12px;border:2px solid var(--line);background:var(--bg-2)">${h}</th>`).join("")}</tr>${[
    ["A", "0.5", "1 bit"],
    ["B", "0.25", "1 bit"],
    ["C", "0.125", "2 bits"],
    ["D", "0.125", "2 bits"],
  ]
    .map(
      (r) =>
        `<tr>${r.map((c) => `<td style="padding:6px 12px;border:2px solid var(--line);text-align:center">${c}</td>`).join("")}</tr>`,
    )
    .join(
      "",
    )}<tr><td colspan="3" style="padding:8px 12px;border:2px solid var(--line);text-align:center">Entropy of this source: 1.75 bits per symbol</td></tr></table>`;

  B.add("a7-entropy", [
    {
      type: "cat",
      q: "Entropy is measured in bits per symbol. Decide for each source whether its entropy is under 1 bit or at least 1 bit.",
      buckets: ["Under 1 bit", "1 bit or more"],
      items: [
        ["A coin that lands heads 95% of the time", 0],
        ["A fair coin", 1],
        ["A fair six-sided die", 1],
        ["Four symbols: one appears 97% of the time, the other three 1% each", 0],
        ["Three symbols with probabilities 0.5, 0.25 and 0.25", 1],
        ["A lamp that is off 99.9% of the time", 0],
      ],
      hint: "Entropy is low when one outcome nearly always wins, however many symbols exist.",
      why: "Strongly skewed sources are very predictable: the 95% coin has about 0.29 bits and the 97% source about 0.24. A fair coin is exactly 1 bit, the die about 2.6 and the 0.5/0.25/0.25 source 1.5. Two-symbol sources can never go above 1 bit, but they can go far below.",
    },
    {
      type: "slider",
      q: "An event has a 1 in 1,000 chance of happening. Roughly how many bits of surprise does it carry when it does?",
      min: 0,
      max: 20,
      step: 1,
      ans: 10,
      tol: 2,
      unit: " bits",
      hint: "Each extra bit halves the probability: 1/2, 1/4, 1/8, ... How many halvings reach about 1/1000? (2 multiplied by itself 10 times is 1,024.)",
      why: "Surprise is log2(1/p) and 2^10 = 1,024, so a 1 in 1,000 event carries about 10 bits. Because of the log, a thousand-fold rarer event costs only 10 bits, not 1,000.",
    },
    M(
      "A vendor claims their code reaches the lengths shown for this source and is uniquely decodable. What is wrong with the claim?",
      [
        "Average length is 1.25 bits, below the 1.75-bit entropy, so it cannot work",
        "Average length is 1.5 bits, which is above the entropy, so it wastes space",
        "Codes must always be 2 bits long when there are four symbols",
        "Entropy only limits codes for equally likely symbols, so no limit applies",
      ],
      0,
      "Average length = 0.5×1 + 0.25×1 + 0.125×2 + 0.125×2 = 1.25 bits. No uniquely decodable code can average below the entropy (1.75), so some messages would decode ambiguously. The code lengths 1, 2, 3, 3 reach exactly 1.75.",
      { fig: claimFig, hint: "Average = 0.5 + 0.25 + 0.25 + 0.25 = 1.25." },
    ),
    {
      type: "multi",
      q: "A source sends A, B, C, D with probabilities 0.7, 0.1, 0.1, 0.1 (entropy about 1.4 bits). Which changes would increase its entropy? Select all that apply.",
      o: [
        "Change the probabilities to 0.4, 0.2, 0.2, 0.2",
        "Add a fifth symbol E and take its 0.05 from A: 0.65, 0.1, 0.1, 0.1, 0.05",
        "Change the probabilities to 0.85, 0.05, 0.05, 0.05",
        "Swap the probabilities of A and B: 0.1, 0.7, 0.1, 0.1",
        "Rename the symbols to W, X, Y, Z",
      ],
      a: [0, 1],
      why: "Entropy rises when probability spreads out. 0.4/0.2/0.2/0.2 is about 1.9 bits, and splitting off a fifth symbol raises it to about 1.6. The 0.85 version is more skewed (about 0.85 bits). Swapping or renaming only relabels the same distribution, so the entropy is unchanged.",
    },
    {
      type: "pick",
      q: "Entropy is the average of p × surprise over all symbols. Using the numbers shown, which symbol contributes the most to the total? Tap it.",
      fig: surpriseFig,
      a: "B",
      hint: "Multiply each pair: 0.6 × 0.7, 0.3 × 1.7, 0.08 × 3.6, 0.02 × 5.6.",
      why: "The contributions are about 0.42 (A), 0.51 (B), 0.29 (C) and 0.11 (D). The most common symbol is not the biggest contributor: B balances being fairly common with being fairly surprising. Rare symbols are very surprising but too seldom to matter much.",
    },
  ]);
  Object.assign(partScope, { LN, M, PK, RC, SVG, TX, bitCell });
})();

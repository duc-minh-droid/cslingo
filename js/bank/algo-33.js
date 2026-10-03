/* ===== bank-x-algo-3.js ===== */
/* Revision bank, third set of varied, visual questions (algo-3): the Phase 6 and 7 workshops (a6-wire, a7-build)
   and the sessions a6-crc, a6-hamming, a7-entropy, a7-huffman, a7-lzw.
   Every number was produced by running the real algorithms in node (CRC division, Huffman merges, LZW traces, entropies). */
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
  const CI = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${o.f || "var(--panel)"}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.k || "var(--line-2)"}" stroke-width="${o.w || 2}"/>`;
  const PK = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const MUTE = "var(--text-2, var(--text))";
  const RED = "var(--rose)",
    GRN = "var(--teal)",
    BLU = "var(--blue)",
    AMB = "var(--amber)",
    VIO = "var(--violet)";
  const hit = (x, y, w, h) => RC(x, y, w, h, { r: 8, f: "transparent", k: "transparent", w: 1 });
  const ent = (ps) => -ps.filter((p) => p > 0).reduce((s, p) => s + p * Math.log2(p), 0);

  /* ======================================================================
     a6-wire  (workshop: noisy wire)
     ====================================================================== */
  // 1. four received copies of an even-parity frame (diff view against the sent frame)
  const parityRowsFig = (() => {
    const sent = [1, 0, 1, 1, 0, 0, 1, 0];
    const rows = [
      ["A", [5]],
      ["B", [1, 4]],
      ["C", [0, 2, 7]],
      ["D", [3, 4, 5, 6]],
    ];
    const cell = (x, y, v, bad, par) =>
      RC(x, y, 30, 28, {
        r: 6,
        f: bad ? RED : par ? BLU : "var(--panel)",
        fo: bad ? 0.3 : par ? 0.14 : 1,
        k: bad ? RED : par ? BLU : "var(--line-2)",
      }) + TX(x + 15, y + 20, v, { m: 1, s: 15 });
    let s = TX(8, 36, "Sent", { a: "start" }) + TX(309, 14, "parity", { s: 11, f: MUTE });
    sent.forEach((v, i) => (s += cell(78 + i * 33, 22, v, false, i === 7)));
    rows.forEach(([id, flips], r) => {
      const y = 70 + r * 44;
      let cells = "";
      sent.forEach((v, i) => {
        const bad = flips.includes(i);
        cells += cell(78 + i * 33, y, bad ? 1 - v : v, bad, false);
      });
      s += PK(id, hit(2, y - 6, 356, 40) + TX(10, y + 20, "Copy " + id, { a: "start", s: 12 }) + cells);
    });
    return SVG(360, 246, s, "Four received copies of an eight-bit parity frame, flipped bits in red");
  })();

  // 2. grouped bars: share of damaged frames that slip through, by number of flips
  const slipBarsFig = (() => {
    const par = [0, 100, 0, 100],
      crc = [0, 0, 20, 20];
    let s =
      RC(8, 6, 14, 14, { r: 3, f: AMB, fo: 0.55, k: AMB, w: 1.5 }) +
      TX(28, 18, "Parity, 8-bit frame", { a: "start", s: 12 }) +
      RC(8, 26, 14, 14, { r: 3, f: BLU, fo: 0.55, k: BLU, w: 1.5 }) +
      TX(28, 38, "CRC 1101, 7-bit frame", { a: "start", s: 12 });
    s += LN(20, 196, 350, 196) + TX(300, 22, "% that slip through", { s: 11, f: MUTE });
    const bar = (id, x, v, col) => {
      const h = Math.max(v * 1.2, 2.5);
      return PK(
        id,
        hit(x - 1, 50, 30, 148) +
          RC(x, 196 - h, 28, h, { r: 3, f: col, fo: 0.6, k: col, w: 2 }) +
          TX(x + 14, 196 - h - 6, v + "%", { s: 12 }),
      );
    };
    for (let g = 0; g < 4; g++) {
      const cx = 62 + g * 86;
      s +=
        bar("p" + (g + 1), cx - 32, par[g], AMB) +
        bar("c" + (g + 1), cx + 4, crc[g], BLU) +
        TX(cx, 216, g + 1 + (g ? " flips" : " flip"), { s: 12 });
    }
    return SVG(
      360,
      226,
      s,
      "Grouped bars: percentage of damaged frames that slip through, for parity and for a CRC, at one to four flipped bits",
    );
  })();

  // 3. sphere-packing: 16 clouds of 8 words
  const cloudsFig = (() => {
    let s = "";
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 4; c++) {
        const x = 10 + c * 85,
          y = 8 + r * 68,
          cx = x + 42,
          cy = y + 36,
          sent = r === 1 && c === 2;
        s += RC(x, y, 80, 62, {
          r: 12,
          f: sent ? GRN : "var(--panel)",
          fo: sent ? 0.14 : 1,
          k: sent ? GRN : "var(--line-2)",
          w: sent ? 3 : 2,
        });
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
          s += CI(cx + 22 * Math.cos(a), cy + 20 * Math.sin(a), 3.4, { f: MUTE, fo: 0.5, k: "transparent", w: 0 });
        }
        s += CI(cx, cy, 6.5, { f: BLU, k: BLU, w: 1.5 });
        if (sent) s += TX(x + 6, y + 13, "sent", { a: "start", s: 11, f: GRN });
      }
    s += TX(180, 294, "16 clouds × 8 words = 128 words: every possible 7-bit word", { s: 12, f: MUTE });
    return SVG(
      360,
      304,
      s,
      "Sixteen clouds, each a codeword with its seven one-flip neighbours, covering all 128 seven-bit words",
    );
  })();

  // 6. damaged frames by number of flips (counts out of 100,000)
  const damagedFig = (() => {
    const rows = [
      ["1 flip", 7457, "odd"],
      ["2 flips", 264, "even"],
      ["3 flips", 5, "odd"],
    ];
    let s = TX(180, 18, "Damaged frames out of 100,000 sent", { s: 13 });
    rows.forEach(([n, v, par], i) => {
      const y = 38 + i * 46,
        w = Math.max((v / 7457) * 215, 2.5);
      s +=
        TX(10, y + 22, n, { a: "start", s: 13 }) +
        RC(76, y, w, 32, { r: 4, f: BLU, fo: 0.45, k: BLU, w: 2 }) +
        TX(76 + w + 8, y + 22, v.toLocaleString("en-GB"), { a: "start", s: 14 });
    });
    s += TX(180, 188, "8-bit frames, every bit flips with chance 1%", { s: 12, f: MUTE });
    return SVG(
      360,
      200,
      s,
      "Bar chart of damaged frames by number of flipped bits: 7,457 with one flip, 264 with two, 5 with three",
    );
  })();

  B.add("a6-wire", [
    {
      type: "pick",
      q: "An 8-bit frame is sent with even parity (the last bit is the parity bit). Four received copies are shown, with the flipped bits in red. Tap every copy the receiver would accept as clean even though it is damaged.",
      fig: parityRowsFig,
      a: ["B", "D"],
      hint: "Parity only checks whether the count of 1s is odd or even. What does an even number of flips do to that count?",
      why: "Each flip changes the count of 1s by one. One flip (A) or three flips (C) leave the count odd, so the receiver notices. Two flips (B) and four flips (D) change the count by an even amount, so it looks fine and the damaged frame is accepted. Whether the flips sit side by side or far apart makes no difference.",
    },
    {
      type: "pick",
      q: "Noise on a link usually flips exactly two bits of a frame. The bars show how many damaged frames slip through undetected for each scheme. Tap the bar that shows how often the CRC lets a two-flip frame through.",
      fig: slipBarsFig,
      a: "c2",
      hint: "Blue is the CRC. Read its bar for 2 flips, even if it is hard to see.",
      why: "All 21 ways to flip two of the seven bits leave a non-zero remainder after dividing by 1101, so the CRC bar at two flips is 0%. Parity is the opposite: two flips always keep the count of 1s even, so every two-flip frame is accepted (100%). The CRC first leaks at three flips, where 7 of the 35 patterns happen to be multiples of 1101.",
    },
    {
      type: "mcq",
      q: "Hamming(7,4) has 16 valid codewords. In the picture, each cloud is one codeword (big dot) plus the seven words one flip away from it (small dots). The sent codeword is outlined in green. Two bits flip on the wire. Where does the damaged word land, and what does the receiver do?",
      fig: cloudsFig,
      o: [
        'In a different codeword\'s cloud, so it is quietly "fixed" to the wrong word',
        "Outside every cloud, so the receiver can tell it is beyond repair",
        "Still inside the sent word's cloud, so the usual fix recovers the data",
        "On a border between two clouds, so the receiver reports a tie it cannot break",
      ],
      a: 0,
      why: 'The 16 clouds use up all 128 words (16 × 8), so no word is left outside. Two flips move the word two steps from the codeword it started as, which puts it in a different codeword\'s cloud, because codewords are at least three flips apart. The receiver "repairs" it to that wrong codeword and never knows. Hamming(7,4) cannot say "too damaged": every word looks fixable.',
    },
    {
      type: "match",
      q: "Match each thing you do in the noisy-wire workshop to what the receiver reports.",
      pairs: [
        ["Flip one bit on the Parity tab", "Count goes odd: caught, but not located"],
        ["Flip two bits on the Parity tab", "Count stays even: accepted, damage unseen"],
        ["Flip three neighbouring bits on the CRC tab (generator 1101)", "Remainder is not 000: rejected"],
        ["Flip two bits on the Hamming tab, then press Auto-correct", "A third, innocent bit gets flipped"],
      ],
      why: "One flip makes the count of 1s odd, but parity cannot say which bit. Two flips cancel and parity says all clear. A degree-3 generator catches every burst up to 3 bits wide, so three in a row never leaves remainder 000. With two flips the Hamming syndrome is the XOR of the two positions, which names a third bit that was fine, so auto-correct damages it.",
    },
    {
      type: "bug",
      q: "This receiver should accept a frame only when its count of 1s is even (even parity). In the workshop it never notices a single flipped bit. Click the faulty line.",
      code: [
        "def looks_clean(frame):",
        "    ones = 0",
        "    for bit in frame:",
        "        ones += 1",
        "    return ones % 2 == 0",
      ],
      a: 3,
      why: "ones += 1 counts every bit, 0s as well as 1s, so it just measures the length of the frame (always 8) and the verdict never changes. It should add the bit itself: ones += bit. Then a flip changes the total by one and the answer flips with it.",
    },
    {
      type: "slider",
      q: "Each of the 8 bits of a frame flips with a 1% chance. Out of 100,000 frames sent, the chart counts the damaged ones by how many bits flipped. Even parity accepts a damaged frame whenever an even number of bits flipped. About what percentage of the damaged frames does it accept?",
      fig: damagedFig,
      min: 0,
      max: 20,
      step: 1,
      ans: 3,
      tol: 2,
      unit: "%",
      hint: "Only the 2-flip bar slips past. 7,457 is about 28 times 264, so the share is roughly 1 in 30.",
      why: "The 264 frames with two flips are accepted, out of 7,726 damaged ones in total: about 3.4%. On a quiet link a single flip is by far the commonest damage, and parity catches those every time. Parity's blind spot grows as the noise gets heavier, because multi-flip damage becomes more likely.",
    },
  ]);

  /* ======================================================================
     a7-build  (workshop: build the tree)
     ====================================================================== */
  // 1. queue chips, smallest first
  const queueFig = (() => {
    const chips = [
      ["Fog+Hail", 4, true],
      ["Wind", 5],
      ["Rain", 8],
      ["Cloud", 11],
      ["Sun", 18],
    ];
    let s = TX(8, 18, "The queue, smallest first", { a: "start", s: 12, f: MUTE });
    chips.forEach(([n, v, nw], i) => {
      const x = 8 + i * 70;
      s +=
        RC(x, 30, 62, 58, {
          r: 12,
          f: nw ? AMB : "var(--panel)",
          fo: nw ? 0.18 : 1,
          k: nw ? AMB : "var(--line-2)",
          d: nw ? "5 4" : "",
        }) +
        TX(x + 31, 52, n, { s: n.length > 6 ? 11 : 12 }) +
        TX(x + 31, 77, v, { s: 20 });
    });
    return SVG(360, 100, s, "Queue of nodes: Fog+Hail 4, Wind 5, Rain 8, Cloud 11, Sun 18");
  })();

  // 2. before/after diff table after the mistaken first merge
  const diffFig = (() => {
    const rows = [
      ["S", "Sun", 18, 1, 2],
      ["C", "Cloud", 11, 2, 2],
      ["R", "Rain", 8, 3, 3],
      ["W", "Wind", 5, 4, 4],
      ["F", "Fog", 3, 5, 4],
      ["H", "Hail", 1, 5, 2],
    ];
    let s =
      TX(60, 18, "Symbol", { s: 11, f: MUTE }) +
      TX(140, 18, "Reported", { s: 11, f: MUTE }) +
      TX(208, 18, "Code before", { s: 10, f: MUTE }) +
      TX(300, 18, "Code after", { s: 10, f: MUTE });
    rows.forEach(([id, n, f, b, a], i) => {
      const y = 28 + i * 34,
        col = a > b ? RED : a < b ? GRN : "var(--line-2)";
      s += PK(
        id,
        hit(2, y - 2, 356, 32) +
          TX(14, y + 20, id, { a: "start", s: 15 }) +
          TX(40, y + 20, n, { a: "start", s: 13, f: MUTE }) +
          TX(140, y + 20, "× " + f, { s: 14 }) +
          RC(188, y, 40, 28, { r: 8 }) +
          TX(208, y + 20, b, { s: 15 }) +
          TX(246, y + 20, "→", { s: 15, f: MUTE }) +
          RC(264, y, 72, 28, { r: 8, f: a === b ? "var(--panel)" : col, fo: a === b ? 1 : 0.22, k: col }) +
          TX(300, y + 20, a + (a > b ? "  longer" : a < b ? "  shorter" : "  same"), { s: 12 }),
      );
    });
    return SVG(
      360,
      236,
      s,
      "Table of code lengths before and after the mistaken first merge: Sun 1 to 2, Cloud 2 to 2, Rain 3 to 3, Wind 4 to 4, Fog 5 to 4, Hail 5 to 2",
    );
  })();

  // 3. the finished Huffman tree
  const treeFig = (() => {
    const L = (id, x, y, col) => ({ id, x, y, col, leaf: 1 });
    const nodes = {
      root: { x: 258, y: 30, w: 46 },
      n28: { x: 200, y: 84, w: 28 },
      n17: { x: 141, y: 138, w: 17 },
      n9: { x: 78, y: 192, w: 9 },
      n4: { x: 120, y: 246, w: 4 },
      S: L("S", 316, 84, GRN),
      C: L("C", 260, 138, BLU),
      R: L("R", 204, 192, VIO),
      W: L("W", 36, 246, AMB),
      F: L("F", 92, 300, RED),
      H: L("H", 148, 300, MUTE),
    };
    const edges = [
      ["root", "n28", 0],
      ["root", "S", 1],
      ["n28", "n17", 0],
      ["n28", "C", 1],
      ["n17", "n9", 0],
      ["n17", "R", 1],
      ["n9", "W", 0],
      ["n9", "n4", 1],
      ["n4", "F", 0],
      ["n4", "H", 1],
    ];
    let s = "";
    edges.forEach(([a, b, bit]) => {
      const A = nodes[a],
        Bn = nodes[b],
        mx = (A.x + Bn.x) / 2,
        my = (A.y + Bn.y) / 2;
      s +=
        LN(A.x, A.y, Bn.x, Bn.y, { w: 2.5 }) +
        CI(mx, my, 9, { f: "var(--panel)", k: "var(--line-2)", w: 1.5 }) +
        TX(mx, my + 4, bit, { s: 12, m: 1 });
    });
    ["root", "n28", "n17", "n9", "n4"].forEach((k) => {
      const n = nodes[k];
      s += CI(n.x, n.y, 15, { f: "var(--panel)", k: "var(--line-2)" }) + TX(n.x, n.y + 5, n.w, { s: 13 });
    });
    ["S", "C", "R", "W", "F", "H"].forEach((k) => {
      const n = nodes[k];
      s += PK(
        k,
        RC(n.x - 20, n.y - 16, 40, 32, { r: 10, f: n.col, fo: 0.25, k: n.col }) + TX(n.x, n.y + 6, k, { s: 16 }),
      );
    });
    return SVG(
      360,
      330,
      s,
      "Finished Huffman tree for Sun, Cloud, Rain, Wind, Fog and Hail with 0 and 1 on each branch",
    );
  })();

  // 4. area chart: width = count, height = code length
  const areaFig = (() => {
    const d = [
      ["S", 18, 1, GRN],
      ["C", 11, 2, BLU],
      ["R", 8, 3, VIO],
      ["W", 5, 4, AMB],
      ["F", 3, 5, RED],
      ["H", 1, 5, MUTE],
    ];
    let s = "",
      x = 40;
    for (let b = 1; b <= 5; b++)
      s +=
        LN(40, 190 - b * 30, 342, 190 - b * 30, { k: "var(--line-soft, var(--line))", w: 1 }) +
        TX(32, 194 - b * 30, b, { a: "end", s: 11, f: MUTE });
    s += TX(10, 14, "code length (bits)", { a: "start", s: 11, f: MUTE });
    d.forEach(([k, n, len, col]) => {
      const w = n * 6.5;
      s +=
        PK(k, RC(x, 190 - len * 30, w, len * 30, { r: 2, f: col, fo: 0.3, k: col, w: 2 })) +
        TX(x + w / 2, 207, n, { s: 12 }) +
        TX(x + w / 2, 223, k, { s: 13, f: col });
      x += w;
    });
    s += TX(6, 207, "count", { a: "start", s: 10, f: MUTE }) + TX(6, 223, "symbol", { a: "start", s: 10, f: MUTE });
    s += TX(180, 246, "S Sun · C Cloud · R Rain · W Wind · F Fog · H Hail", { s: 11, f: MUTE });
    return SVG(
      360,
      254,
      s,
      "Rectangles for each symbol: width is how often it was reported, height is its code length",
    );
  })();
  Object.assign(partScope, { CI, LN, PK, RC, SVG, TX, areaFig, diffFig, ent, hit, queueFig, treeFig });
})();

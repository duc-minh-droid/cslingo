(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { CI, LN, PK, RC, SVG, TX, ent, hit } = partScope;
  const B = NIC.bank;
  const MUTE = "var(--text-2, var(--text))";
  const RED = "var(--rose)",
    GRN = "var(--teal)",
    BLU = "var(--blue)",
    AMB = "var(--amber)";

  /* ======================================================================
     a7-entropy
     ====================================================================== */
  // entropy curve of a coin with chips on the axis
  const coinFig = (() => {
    const X = (p) => 40 + p * 280,
      Y = (h) => 200 - h * 150,
      H = (p) => ent([p, 1 - p]);
    let d = "";
    for (let i = 1; i <= 99; i++) {
      const p = i / 100;
      d += (i === 1 ? "M" : "L") + X(p).toFixed(1) + " " + Y(H(p)).toFixed(1) + " ";
    }
    let s =
      LN(40, 200, 330, 200, { w: 2 }) +
      LN(40, 40, 40, 200, { w: 2 }) +
      TX(34, 54, "1", { a: "end", s: 11, f: MUTE }) +
      TX(34, 204, "0", { a: "end", s: 11, f: MUTE }) +
      TX(10, 22, "entropy (bits per flip)", { a: "start", s: 11, f: MUTE });
    s += `<path d="${d}" fill="none" stroke="${BLU}" stroke-width="3.5"/>`;
    [
      ["A", 0.05],
      ["B", 0.2],
      ["C", 0.4],
      ["D", 0.7],
      ["E", 0.95],
    ].forEach(
      ([k, p]) =>
        (s += PK(
          k,
          RC(X(p) - 19, 208, 38, 40, { r: 10, f: AMB, fo: 0.18, k: AMB }) +
            TX(X(p), 224, k, { s: 14 }) +
            TX(X(p), 240, Math.round(p * 100) + "%", { s: 11, f: MUTE }),
        )),
    );
    s += TX(180, 262, "chance of heads", { s: 11, f: MUTE });
    return SVG(
      360,
      270,
      s,
      "Entropy curve of a coin against its chance of heads, rising to 1 bit at 50 per cent, with five coins marked on the axis",
    );
  })();

  // dial of bits per symbol
  const dialFig = (() => {
    const cx = 180,
      cy = 160,
      r = 118,
      pt = (v, rr) => {
        const a = Math.PI - (v / 8) * Math.PI;
        return [cx + rr * Math.cos(a), cy - rr * Math.sin(a)];
      };
    const arc = (v0, v1, col, w) => {
      const [x0, y0] = pt(v0, r),
        [x1, y1] = pt(v1, r);
      return `<path d="M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    };
    let s = arc(0, 8, "var(--line)", 20) + arc(0, 1.5, GRN, 20);
    for (let v = 0; v <= 8; v++) {
      const [x0, y0] = pt(v, r - 16),
        [x1, y1] = pt(v, r - 24);
      s += LN(x0, y0, x1, y1, { w: 2 });
    }
    [0, 2, 4, 6, 8].forEach((v) => {
      const [x, y] = pt(v, r + 18);
      s += TX(x, y + 4, v, { s: 13, f: MUTE });
    });
    const [nx, ny] = pt(1.5, r - 34);
    s += LN(cx, cy, nx, ny, { k: "var(--text)", w: 4 }) + CI(cx, cy, 8, { f: "var(--text)", k: "var(--text)", w: 1 });
    s +=
      TX(cx, cy + 30, "entropy: 1.5 bits per reading", { s: 14 }) +
      TX(cx, 14, "bits per reading", { s: 11, f: MUTE }) +
      TX(cx, cy + 50, "stored as plain bytes: 8 bits per reading", { s: 12, f: MUTE });
    return SVG(360, 224, s, "Dial from 0 to 8 bits per reading with the needle at 1.5");
  })();

  // four mini bar charts
  const miniDists = (() => {
    const P = [
      ["A", [0.25, 0.5, 0.125, 0.125]],
      ["B", [0.5, 0.25, 0.25, 0]],
      ["C", [0.125, 0.125, 0.25, 0.5]],
      ["D", [0.5, 0.125, 0.25, 0.125]],
    ];
    let s = "";
    P.forEach(([id, ps], k) => {
      const x = 6 + (k % 2) * 178,
        y = 6 + Math.floor(k / 2) * 138;
      let bars = "";
      ps.forEach((p, i) => {
        const h = Math.max(p * 140, 2),
          bx = x + 18 + i * 38;
        bars +=
          RC(bx, y + 112 - h, 28, h, { r: 3, f: BLU, fo: p ? 0.5 : 0.15, k: BLU, w: 2 }) +
          TX(bx + 14, y + 106 - h, +(p * 100).toFixed(1) + "%", { s: 10 });
      });
      s += PK(id, RC(x, y, 170, 126, { r: 12 }) + TX(x + 12, y + 18, id, { a: "start", s: 15 }) + bars);
    });
    return SVG(360, 276, s, "Four small bar charts of probabilities over four symbols");
  })();

  // heatmap: weather today given yesterday
  const weatherFig = (() => {
    const names = ["Sun", "Cloud", "Rain", "Fog"],
      M = [
        [0.7, 0.2, 0.1, 0],
        [0.3, 0.4, 0.2, 0.1],
        [0.25, 0.25, 0.25, 0.25],
        [0, 0.05, 0.05, 0.9],
      ];
    let s = TX(8, 22, "yesterday", { a: "start", s: 11, f: MUTE }) + TX(216, 22, "today", { s: 11, f: MUTE });
    names.forEach((n, j) => (s += TX(84 + j * 66 + 33, 50, n, { s: 12 })));
    M.forEach((row, i) => {
      const y = 60 + i * 46;
      let cells = "";
      row.forEach(
        (p, j) =>
          (cells +=
            RC(84 + j * 66, y, 64, 42, { r: 6, f: BLU, fo: 0.08 + p * 0.55, k: "var(--line-2)", w: 1.5 }) +
            TX(84 + j * 66 + 32, y + 26, Math.round(p * 100) + "%", { s: 14 })),
      );
      s += PK(names[i], hit(2, y - 2, 356, 46) + TX(10, y + 26, names[i], { a: "start", s: 14 }) + cells);
    });
    return SVG(
      360,
      250,
      s,
      "Table of weather today for each weather yesterday: Sun row 70, 20, 10, 0; Cloud row 30, 40, 20, 10; Rain row 25 each; Fog row 0, 5, 5, 90 per cent",
    );
  })();

  B.add("a7-entropy", [
    {
      type: "pick",
      q: "Five coins are marked on the axis by their chance of heads. The curve shows how many bits per flip a coin needs with the best possible code. Tap the two coins that need exactly the same number of bits per flip.",
      fig: coinFig,
      a: ["A", "E"],
      hint: "Look at the shape of the curve. What is special about it either side of 50%?",
      why: "The curve is a mirror image around 50%. A coin that lands heads 95% of the time is exactly as predictable as one that lands tails 95% of the time (heads 5%), so both need about 0.29 bits per flip. B (20%) and D (70%) are not mirror images: they need about 0.72 and 0.88 bits.",
    },
    {
      type: "slider",
      q: "A sensor sends 1,000 readings, each stored as 8 bits (8,000 bits in all). The readings come from a source whose entropy is 1.5 bits per reading, as on the dial. At best, about what percentage of the original 8,000 bits could a perfect compressor get it down to?",
      fig: dialFig,
      min: 0,
      max: 100,
      step: 1,
      ans: 19,
      tol: 4,
      unit: "%",
      hint: "1.5 bits against 8. Two bits would be a quarter of 8, so 1.5 is a little under that.",
      why: "Entropy is the floor for any lossless code: 1,000 × 1.5 = 1,500 bits at the very least, which is 1,500 out of 8,000, about 19%. A real code such as Huffman lands at or just above that, never below. The distance of the needle from 8 on the dial is how much room there is to squeeze.",
    },
    {
      type: "pick",
      q: "Each panel shows the probabilities of a source with four symbols. Three of these sources have exactly the same entropy. Tap the odd one out.",
      fig: miniDists,
      a: "B",
      hint: "Does entropy care which symbol has which probability?",
      why: "Entropy depends only on the set of probabilities, not on which symbol carries which. A, C and D are the same numbers (0.5, 0.25, 0.125, 0.125) in different orders, so each has an entropy of 1.75 bits. B uses a different set (0.5, 0.25, 0.25 and an impossible symbol), with entropy 1.5 bits.",
    },
    {
      type: "pick",
      q: "The table gives the chance of each kind of weather today (columns) for each kind of weather yesterday (rows); every row adds to 100%. A weather station writes one code per day, using the best code for the row it is in. Tap the row where a day costs the fewest bits on average.",
      fig: weatherFig,
      a: "Fog",
      hint: "The cheapest row is the one where tomorrow is easiest to guess, not simply the row with the biggest single number.",
      why: "After Fog comes Fog 90% of the time, so that row is almost certain and its entropy is only about 0.57 bits. Sun's row is next at about 1.16 bits. Cloud (about 1.85) and Rain (exactly 2: four equal chances) are the hardest to guess. What counts is how lopsided the whole row is.",
    },
  ]);

  /* ======================================================================
     a7-huffman
     ====================================================================== */
  // a binary trie where some codewords are not leaves
  const trieFig = (() => {
    const N = {
      r: [180, 34],
      a: [100, 98],
      b: [260, 98],
      "00": [60, 162],
      "01": [140, 162],
      10: [220, 162],
      11: [300, 162],
      110: [268, 226],
      111: [332, 226],
    };
    const E = [
      ["r", "a", 0],
      ["r", "b", 1],
      ["a", "00", 0],
      ["a", "01", 1],
      ["b", "10", 0],
      ["b", "11", 1],
      ["11", "110", 0],
      ["11", "111", 1],
    ];
    const L = { "00": "A", "01": "B", 10: "C", 11: "D", 110: "E", 111: "F" };
    let s = "";
    E.forEach(([p, c, bit]) => {
      const [x1, y1] = N[p],
        [x2, y2] = N[c],
        mx = (x1 + x2) / 2,
        my = (y1 + y2) / 2;
      s +=
        LN(x1, y1, x2, y2, { w: 2.5 }) +
        CI(mx, my, 9, { f: "var(--panel)", k: "var(--line-2)", w: 1.5 }) +
        TX(mx, my + 4, bit, { s: 12, m: 1 });
    });
    ["r", "a", "b"].forEach((k) => (s += CI(N[k][0], N[k][1], 8, { f: "var(--panel)", k: "var(--line-2)" })));
    Object.entries(L).forEach(
      ([k, l]) =>
        (s += PK(l, CI(N[k][0], N[k][1], 16, { f: BLU, fo: 0.25, k: BLU }) + TX(N[k][0], N[k][1] + 5, l, { s: 15 }))),
    );
    s += TX(100, 244, "filled dot = a codeword", { s: 11, f: MUTE });
    return SVG(
      360,
      256,
      s,
      "Binary tree whose filled dots A to F are codewords; D sits at 11 above E at 110 and F at 111",
    );
  })();

  // Huffman cost per flip for blocks of 1..4 flips of a 90/10 coin
  const blockCodeFig = (() => {
    const vals = [1.0, 0.645, 0.533, 0.493],
      Y = (v) => 200 - v * 140;
    let s = LN(24, 200, 352, 200) + LN(30, Y(0.469), 352, Y(0.469), { k: RED, w: 2.5, d: "7 5" });
    s +=
      LN(10, 14, 28, 14, { k: RED, w: 2.5, d: "6 4" }) +
      TX(34, 18, "entropy floor: 0.47", { a: "start", s: 12 }) +
      TX(354, 18, "bits per flip", { a: "end", s: 11, f: MUTE });
    vals.forEach((v, i) => {
      const cx = 70 + i * 86;
      s +=
        RC(cx - 24, Y(v), 48, v * 140, { r: 4, f: BLU, fo: 0.45, k: BLU, w: 2 }) +
        TX(cx, Y(v) - 7, v.toFixed(2), { s: 13 }) +
        TX(cx, 220, i + 1 + (i ? " flips" : " flip"), { s: 12 });
    });
    s += TX(190, 238, "flips coded together as one symbol", { s: 11, f: MUTE });
    return SVG(
      360,
      246,
      s,
      "Bars of Huffman bits per flip for a 90 per cent coin when 1, 2, 3 or 4 flips are grouped: 1.00, 0.65, 0.53, 0.49, above an entropy line at 0.47",
    );
  })();

  // three messages: fixed codes vs Huffman table + payload
  const tableCostFig = (() => {
    const msgs = [
      ["m40", 40],
      ["m120", 120],
      ["m400", 400],
    ];
    let s = "";
    msgs.forEach(([id, n], k) => {
      const x = 6 + k * 118,
        sc = 90 / (3 * n),
        base = 186,
        tbl = 100,
        pay = Math.round(2.3 * n);
      s += PK(
        id,
        RC(x, 4, 110, 226, { r: 12 }) +
          TX(x + 55, 24, n + " symbols", { s: 13 }) +
          RC(x + 12, base - 3 * n * sc, 36, 3 * n * sc, { r: 3, f: MUTE, fo: 0.25, k: MUTE, w: 2 }) +
          TX(x + 30, base - 3 * n * sc - 6, 3 * n, { s: 12 }) +
          RC(x + 62, base - pay * sc, 36, pay * sc, { r: 2, f: GRN, fo: 0.35, k: GRN, w: 2 }) +
          RC(x + 62, base - (pay + tbl) * sc, 36, tbl * sc, { r: 2, f: AMB, fo: 0.4, k: AMB, w: 2 }) +
          TX(x + 30, 202, "fixed", { s: 11, f: MUTE }) +
          TX(x + 80, 202, "Huffman", { s: 11, f: MUTE }) +
          TX(x + 55, 220, `<tspan fill="${AMB}">100</tspan> + <tspan fill="${GRN}">${pay}</tspan>`, { s: 12 }),
      );
    });
    return SVG(
      360,
      236,
      s,
      "Three panels for 40, 120 and 400 symbols comparing a fixed-code file with a Huffman table of 100 bits plus its payload",
    );
  })();

  B.add("a7-huffman", [
    {
      type: "pick",
      q: "This binary tree is meant to be a prefix code: every filled dot is a codeword, spelled by the 0 and 1 labels on the path from the root. Tap the codeword that breaks the prefix rule.",
      fig: trieFig,
      a: "D",
      hint: "In a prefix code, no codeword may lie on the path to another codeword.",
      why: "D is spelled 11, and the paths to E (110) and F (111) pass straight through it. When the receiver has read 1 1 it cannot tell whether D is finished or E or F is coming. A prefix code puts every codeword at a leaf, with nothing hanging below it, which is what Huffman's tree guarantees.",
    },
    {
      type: "mcq",
      q: "A coin lands heads 90% of the time (entropy about 0.47 bits per flip). Huffman needs at least 1 bit per symbol, so it is wasteful on single flips. The chart shows Huffman's average cost per flip when flips are grouped into blocks of 1, 2, 3 or 4 and each block counts as one symbol. What does grouping do?",
      fig: blockCodeFig,
      o: [
        "It pulls Huffman towards the entropy line, but never below it",
        "It lets Huffman beat the entropy line once the blocks get long enough",
        "It makes little real difference, since each flip is still just heads or tails",
        "It helps up to blocks of three, then the bigger table makes it worse again",
      ],
      a: 0,
      why: "Blocks of two have four symbols with chances 0.81, 0.09, 0.09 and 0.01, so the likely block gets a 1-bit code: 1.29 bits per block, 0.65 per flip. Blocks of three give 0.53, blocks of four 0.49. The cost keeps sliding towards 0.47 but never crosses it, because entropy is a floor for every lossless code. The price is a bigger table and more symbols to track.",
    },
    {
      type: "order",
      q: "Put this cause-and-effect chain in order to explain why a rare symbol gets a long Huffman codeword yet costs few bits.",
      items: [
        "The symbol turns up only a few times",
        "Its small count means it is merged early",
        "Early merges sit at the bottom of the tree",
        "The bottom of the tree means a long codeword",
        "It is so rare that the long code is rarely paid",
      ],
      why: "Few appearances give a small count. The queue always merges the smallest counts first, so the symbol ends up deep in the tree, which means a long codeword. But the cost is the code length times how often it appears, and it appears rarely, so the long code adds little to the total.",
    },
    {
      type: "pick",
      q: "A sender can use fixed 3-bit codes, or Huffman codes that average 2.3 bits per symbol but need a 100-bit code table sent first. Each panel shows one message: the grey bar is the fixed-code size in bits, and the stacked bar is the Huffman table plus its payload. Tap every message where Huffman ends up BIGGER than the fixed-code file.",
      fig: tableCostFig,
      a: ["m40", "m120"],
      hint: "Add the table and the payload, then compare with the grey bar. Careful with the middle panel.",
      why: "Huffman saves 0.7 bits per symbol, but it has to earn back the 100-bit table first: break-even is at about 143 symbols. At 40 symbols it is 192 against 120. At 120 symbols it is 376 against 360, still a small loss. At 400 symbols it is 1,020 against 1,200, a clear win. Short messages can be cheaper with plain fixed codes.",
    },
  ]);

  /* ======================================================================
     a7-lzw
     ====================================================================== */
  // codes emitted vs input length (repeating text vs random text over A,B,C)
  const growthFig = (() => {
    const ns = [30, 60, 90, 120, 150, 200, 250, 300],
      rep = [12, 18, 22, 26, 29, 34, 38, 41],
      ran = [19, 31, 41, 51, 60, 76, 90, 106];
    const X = (i) => 52 + i * 38,
      Y = (v) => 206 - v * 1.6;
    let s = "";
    [0, 25, 50, 75, 100].forEach(
      (v) =>
        (s +=
          LN(46, Y(v), 346, Y(v), { k: "var(--line-soft, var(--line))", w: 1 }) +
          TX(40, Y(v) + 4, v, { a: "end", s: 10, f: MUTE })),
    );
    const curve = (id, a, col) =>
      `<path data-pick="${id}" d="${a.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ")}" fill="none" stroke="transparent" stroke-width="22" stroke-linejoin="round" style="stroke-linecap:round"/>` +
      `<path d="${a.map((v, i) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ")}" fill="none" stroke="${col}" stroke-width="3.5" pointer-events="none"/>`;
    s += curve("t2", ran, AMB) + curve("t1", rep, BLU);
    s +=
      TX(X(7) - 4, Y(41) + 22, "Text 1", { a: "end", s: 12, f: BLU }) +
      TX(X(7) + 4, Y(106) - 10, "Text 2", { a: "end", s: 12, f: AMB });
    ns.forEach((n, i) => (s += TX(X(i), 226, n, { s: 11 })));
    s +=
      TX(200, 246, "letters of input read so far", { s: 11, f: MUTE }) +
      TX(10, 16, "codes sent so far", { a: "start", s: 11, f: MUTE });
    return SVG(
      360,
      254,
      s,
      "Two curves of LZW codes sent against letters read: Text 1 climbs to 41 codes, Text 2 climbs to 106 codes",
    );
  })();

  // phrase timelines for two rows with six As and six Bs
  const phraseFig = (() => {
    const rows = [
      ["Row 1", "ABABABABABAB", ["A", "B", "AB", "ABA", "BA", "BAB"]],
      ["Row 2", "AABBABBAABAB", ["A", "A", "B", "B", "AB", "BA", "AB", "AB"]],
    ];
    let s = "";
    rows.forEach(([name, str, segs], r) => {
      const y = 28 + r * 92;
      s += TX(8, y - 8, name, { a: "start", s: 12 });
      let i = 0;
      segs.forEach((g, k) => {
        const x = 12 + i * 27;
        s += RC(x - 1, y - 1, g.length * 27 - 1 + 2, 34, {
          r: 8,
          f: k % 2 ? BLU : AMB,
          fo: 0.18,
          k: k % 2 ? BLU : AMB,
          w: 2,
        });
        g.split("").forEach((ch, j) => (s += TX(x + j * 27 + 12, y + 22, ch, { m: 1, s: 16 })));
        i += g.length;
      });
      s += TX(8, y + 58, `${segs.length} boxes = ${segs.length} codes`, { a: "start", s: 12, f: MUTE });
    });
    return SVG(
      360,
      200,
      s,
      "Two rows of twelve letters cut into LZW phrase boxes: Row 1 has six boxes, Row 2 has eight",
    );
  })();
  Object.assign(partScope, { growthFig, phraseFig });
})();

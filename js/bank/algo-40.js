(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { circ, figChannel, figRuler, figToolFlow, lines, ln, pk, rc, svg, tx } = partScope;
  const B = NIC.bank;

  // P3: three trees on the same six sites
  function figTrees() {
    const pos = { S: [24, 56], A: [84, 20], B: [84, 92], C: [188, 20], D: [188, 92], E: [264, 56] };
    const all = [
      ["S", "A", 4],
      ["S", "B", 6],
      ["A", "B", 1],
      ["A", "C", 6],
      ["B", "D", 3],
      ["C", "D", 3],
      ["C", "E", 5],
      ["D", "E", 4],
      ["B", "C", 7],
    ];
    const panels = [
      ["p1", "Panel 1", ["SA", "SB", "BD", "CD", "DE"]],
      ["p2", "Panel 2", ["SA", "AB", "BD", "AC", "DE"]],
      ["p3", "Panel 3", ["AB", "BD", "CD", "SA", "DE"]],
    ];
    let s = "";
    panels.forEach(([id, title, keep], p) => {
      const y0 = p * 118 + 6;
      let g = rc(4, y0, 292, 112, "p", { r: 10 }) + tx(14, y0 + 20, title, { a: "start", s: 12, c: "var(--text-dim)" });
      all.forEach(([a, b, w]) => {
        const on = keep.includes(a + b),
          [xa, ya] = pos[a],
          [xb, yb] = pos[b];
        g += ln(
          xa + 16,
          ya + y0 + 8,
          xb + 16,
          yb + y0 + 8,
          on ? { c: "var(--blue)", w: 4 } : { c: "var(--line)", w: 1.5, d: "3 4" },
        );
        if (on)
          g += tx((xa + xb) / 2 + 16 + (xa === xb ? 11 : 0), (ya + yb) / 2 + y0 + 8 + (xa === xb ? 4 : -6), w, {
            s: 12,
            c: "var(--blue-ink)",
          });
      });
      Object.entries(pos).forEach(
        ([k, [x, y]]) => (g += circ(x + 16, y + y0 + 8, 11, "p") + tx(x + 16, y + y0 + 13, k, { s: 12 })),
      );
      s += pk(id, g);
    });
    return svg(
      300,
      364,
      s,
      "Three spanning trees on the same six sites S, A, B, C, D, E with the link lengths on chosen links",
    );
  }

  B.add("a11-picker", [
    {
      type: "pick",
      q: "A library robot needs the quickest route from its dock to <b>every one</b> of 40 shelves. Travel times are never negative. Follow the flow chart and tap the tool you land on.",
      fig: figToolFlow(),
      a: "dijk",
      why: "Linking everything cheaply, wrapping points and mixing under limits are all different jobs, so the first three answers are no. A* needs one goal and an honest estimate of what is left, and here there are 40 goals, so the answer is also no. That leaves Dijkstra: quickest routes from one start to everywhere, when no cost is negative.",
    },
    {
      type: "order",
      q: "A newsletter is Huffman-compressed and Hamming-protected, then sent over a noisy link where one bit in a block may flip. Put the steps in the right order.",
      fig: figChannel(),
      items: [
        "Compress the text with Huffman",
        "Add Hamming parity bits",
        "Send it across the noisy link",
        "Use the parity checks to repair the flipped bit",
        "Decompress back to the newsletter",
      ],
      why: "Compression squeezes redundancy out, and error correction deliberately puts a little back, so compress first and protect second. Protecting first would let the compressor throw the parity bits away. At the far end it must go in reverse: repair the bit while the parity bits are still there, then decompress. A flipped bit inside compressed data would otherwise scramble everything after it.",
    },
    {
      type: "pick",
      q: "Six sites must be joined into one cable network with the <b>least cable overall</b>. Each panel keeps some of the same links (lengths shown). Tap the best panel.",
      fig: figTrees(),
      a: "p3",
      hint: "Add up the five lengths in each panel.",
      why: "Panel 3 totals 1 + 3 + 3 + 4 + 4 = 15, the cheapest tree: that is what Prim or Kruskal build. Panel 2 is Dijkstra's tree from S (4 + 1 + 3 + 6 + 4 = 18): every site gets its quickest route from S, but that is a different goal from the cheapest total. Panel 1 totals 4 + 6 + 3 + 3 + 4 = 20.",
    },
    {
      type: "order",
      q: "Put these jobs in order from the <b>fewest</b> basic steps to the most.",
      fig: figRuler(),
      hint: "Binary search ≈ 10 steps. FFT ≈ N log₂ N. Attention ≈ n². 2³² is about 4 billion.",
      items: [
        "Binary search through 1,024 sorted items",
        "Direct DFT of 32 samples (N²)",
        "FFT of 1,024 samples (N log₂ N)",
        "Attention scores for 1,024 tokens (n²)",
        "Trying every subset of 32 items (2³²)",
      ],
      why: "About 10 steps; 32² = 1,024; 1,024 × 10 ≈ 10,000; 1,024² ≈ 1 million; and 2³² ≈ 4.3 billion. Log, near-linear, quadratic and exponential growth are far apart: a million-fold jump between the FFT and attention at this size is nothing next to what the exponential brute force costs.",
    },
    {
      type: "cat",
      q: "Sort each tool by the kind of thing it hands back.",
      buckets: ["A score for each item", "A route or a network of links", "A string of bits"],
      items: [
        ["PageRank", 0],
        ["Attention weights", 0],
        ["Dijkstra", 1],
        ["Minimum spanning tree", 1],
        ["Huffman coding", 2],
        ["CRC check bits", 2],
        ["LZW", 2],
      ],
      why: "PageRank scores pages and attention weights score tokens. Dijkstra returns routes and an MST a set of links. Huffman and LZW return shorter bit strings and a CRC returns a few check bits. Knowing the output shape is the quickest way to rule tools out.",
    },
    {
      type: "pick",
      q: "A planner uses four tools. Three things then change in the data. Tap <b>every</b> cell where the tool will now give wrong answers.",
      fig: (function () {
        const rows = [
            "A road gets a negative cost",
            "The cost curve gets a second dip",
            "The distance estimate sometimes overshoots",
          ],
          cols = [
            ["Dijkstra", ""],
            ["A*", ""],
            ["MST", ""],
            ["Golden-", "section"],
          ],
          x0 = 148,
          y0 = 52,
          cw = 52,
          ch = 44;
        let s = "";
        cols.forEach(([a, b], c) => (s += lines(x0 + c * cw + cw / 2, y0 - 22, b ? [a, b] : [a], { s: 11, lh: 12 })));
        rows.forEach((t, r) => {
          const w = t.split(" "),
            mid = Math.ceil(w.length / 2);
          s += lines(x0 - 8, y0 + r * ch + ch / 2 - 2, [w.slice(0, mid).join(" "), w.slice(mid).join(" ")], {
            a: "end",
            s: 11,
            c: "var(--text-dim)",
            lh: 13,
          });
          cols.forEach(
            (_, c) =>
              (s += pk(
                `r${r}c${c}`,
                rc(x0 + c * cw + 3, y0 + r * ch + 3, cw - 6, ch - 6, "p", { r: 8 }) +
                  tx(x0 + c * cw + cw / 2, y0 + r * ch + ch / 2 + 5, "?", { s: 14, c: "var(--text-faint)" }),
              )),
          );
        });
        return svg(358, y0 + 3 * ch + 6, s, "A grid of three changes against four tools");
      })(),
      a: ["r0c0", "r0c1", "r1c3", "r2c1"],
      why: "Dijkstra and A* both rely on costs never being negative (a settled place can only get worse later). A* additionally trusts its estimate never to overshoot, so an overshooting estimate breaks A* but not Dijkstra, which does not use one. Golden-section search needs a single dip, so a second dip breaks it. An MST is untouched by any of the three: Prim and Kruskal still work with negative lengths.",
    },
  ]);
})();

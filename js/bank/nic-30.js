(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { ci, hit, ln, mark, pl, rc, rng, svg, tx } = partScope;
  const B = NIC.bank;

  /* ======================================================================
     l3-landscape : heat-map grid, curve with step size, grid small multiples, basin strip
     ====================================================================== */
  const LGRID = [
    [10, 14, 18, 16, 12, 9],
    [15, 31, 20, 22, 19, 24],
    [11, 22, 27, 33, 21, 17],
    [13, 26, 40, 44, 35, 20],
    [8, 29, 25, 38, 30, 16],
    [6, 12, 14, 23, 18, 11],
  ];
  const heatFig = () => {
    const W = 52,
      H = 44,
      x0 = 14,
      y0 = 10;
    let s = "";
    LGRID.forEach((row, r) =>
      row.forEach(
        (v, c) =>
          (s += hit(
            `r${r}c${c}`,
            `${rc(x0 + c * W + 2, y0 + r * H + 2, W - 4, H - 4, { f: "var(--blue)", o: 0.06 + (v / 44) * 0.55, s: "var(--line-2)", sw: 2, r: 8 })}${tx(x0 + c * W + W / 2, y0 + r * H + H / 2 + 6, v, { f: "900 16px" })}`,
          )),
      ),
    );
    return svg(340, 280, s);
  };

  const gOf = (x, c, w, h) => h * Math.exp(-(((x - c) / w) ** 2));
  const hillF = (x) => 10 + gOf(x, 24, 9, 60) + gOf(x, 66, 10, 90);
  const hillFig = () => {
    const X = (x) => 40 + x * 4,
      Y = (f) => 200 - f * 1.6,
      pts = [];
    for (let x = 0; x <= 100; x += 1) pts.push([X(x), Y(hillF(x))]);
    let s =
      `<path d="M${X(0)} 200 ${pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")} L${X(100)} 200 Z" fill="var(--teal-dim)"/>` +
      pl(pts, "var(--teal)", 3.5);
    s += ln(40, 200, 440, 200, "var(--text-faint)", 2.5);
    [0, 20, 40, 60, 80, 100].forEach(
      (x) =>
        (s +=
          ln(X(x), 200, X(x), 206, "var(--text-faint)", 2) +
          tx(X(x), 222, x, { f: "700 12px", c: "var(--text-faint)" })),
    );
    s +=
      ln(40, Y(70), 440, Y(70), "var(--rose)", 2, "6 5") +
      tx(444, Y(70) - 6, "70", { a: "end", f: "800 12px", c: "var(--rose-ink)" });
    s +=
      ci(X(24), Y(70), 9, { f: "var(--rose)", s: "var(--panel)", sw: 2 }) +
      tx(X(24), Y(70) - 16, "you are here", { f: "800 12px", c: "var(--rose-ink)" });
    s += tx(240, 242, "x (the value being tuned), fitness is the height", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 252, s);
  };

  const spaceFig = () => {
    const G = 12,
      C = 10,
      R = rng(23);
    const val = {
      A: (r, c) => 1 - Math.min(1, Math.hypot(r - 5.5, c - 5.5) / 7.5),
      B: () => R(),
      C: (r, c) => (r === 3 && c === 8 ? 1 : 0.04),
    };
    let s = "";
    [
      ["A", 14],
      ["B", 164],
      ["C", 314],
    ].forEach(([k, px]) => {
      s += tx(px + 60, 16, "Space " + k, { f: "900 14px" });
      for (let r = 0; r < G; r++)
        for (let c = 0; c < G; c++)
          s += rc(px + c * C, 26 + r * C, C - 1, C - 1, {
            f: "var(--blue)",
            o: 0.05 + 0.85 * val[k](r, c),
            s: "none",
            sw: 0,
            r: 2,
          });
    });
    s += ["A", "B", "C"]
      .map((k, i) => hit(k, rc(10 + i * 150, 22, 128, 128, { f: "transparent", s: "transparent", sw: 2, r: 10 })))
      .join("");
    s += tx(235, 172, "each small square is one solution; darker blue = fitter", {
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(470, 182, s);
  };

  const basinFig = () => {
    const parts = [
      ["90", 10, "teal"],
      ["70", 45, "blue"],
      ["60", 30, "amber"],
      ["40", 15, "violet"],
    ];
    let x = 20,
      s = tx(20, 22, "share of random starts that climb to the peak of height…", { a: "start", f: "800 13px" });
    parts.forEach(([t, p, c]) => {
      const w = p * 4.2;
      s +=
        rc(x, 34, w, 44, { f: `var(--${c}-dim)`, s: `var(--${c})`, sw: 2.5, r: 0 }) +
        tx(x + w / 2, 54, p + "%", { f: "900 14px" }) +
        tx(x + w / 2, 70, t, { f: "700 11px", c: "var(--text-dim)" });
      x += w;
    });
    return svg(470, 96, s);
  };

  B.add("l3-landscape", [
    {
      type: "pick",
      q: "The grid shows fitness (higher is better, darker is fitter). A move goes to the cell directly above, below, left or right, never diagonally. Click every local optimum.",
      fig: heatFig(),
      a: ["r1c1", "r1c5", "r3c3", "r4c1"],
      hint: "A local optimum is higher than every neighbour it can move to. Check each cell's four neighbours only.",
      why: "The cells 31, 24, 44 and 29 each beat all of their up, down, left and right neighbours. 29 is the trap: the diagonal cell 40 is higher, but diagonals are not moves, so a hillclimber is stuck there. Every other cell has a higher neighbour to climb to. The global optimum is 44.",
    },
    {
      type: "slider",
      q: "A hillclimber tunes x. Each mutation moves x by exactly the step size, to the left or right, and the move is kept only if fitness is higher than now (70, the dashed line). About how large must the step be to escape the peak at x = 24?",
      fig: hillFig(),
      min: 0,
      max: 100,
      step: 2,
      ans: 36,
      tol: 8,
      unit: "units",
      hint: "Slide along from 24 to the right: where does the curve first rise above the dashed line again?",
      why: "To escape, a step has to land on a point fitter than 70. The second hill first rises above 70 at about x = 60, which is 36 away from 24. Smaller steps land in the valley (lower fitness) and are rejected, and a step to the left would leave the range. The step size sets which valleys can be crossed.",
    },
    {
      type: "pick",
      q: "Each square is a search space. Every small square is one solution, and darker blue means fitter. Click the space where a hillclimber with small moves has the biggest advantage over random guessing.",
      fig: spaceFig(),
      a: "A",
      hint: "A hillclimber needs the fitness of nearby solutions to tell it which way to go.",
      why: "In A, nearby solutions have similar fitness, so each small move shows which way is uphill and the climber walks to the peak. In B every solution is unrelated to its neighbours, so a move tells you nothing and guessing is as good. In C everything is flat except one needle, so there is no slope to follow.",
    },
    {
      q: "A hillclimber's random start climbs to one of four peaks. The bar shows how many starts end at each peak. You run it 3 times and report the best of the three results. Which peak value are you most likely to report?",
      fig: basinFig(),
      o: ["40", "60", "70", "90"],
      a: 2,
      hint: "A single run misses the 90 peak 9 times in 10. Missing it three runs in a row is about 0.9 × 0.9 × 0.9, about 0.7.",
      why: "The chance that at least one run reaches 90 is only 1 − 0.9³ ≈ 27%. The chance the best is 70 is 0.9³ − 0.55³ ≈ 56%, the chance it is 60 is about 15%, and 40 is under 1%. The biggest basin is not the best peak, and a few restarts usually return a good but not the best solution.",
    },
  ]);

  /* ======================================================================
     l3-neighbourhood : adjacency matrix, two bar charts, directed graph, tape strip
     ====================================================================== */
  const matrixFig = () => {
    const S = ["000", "001", "010", "011", "100", "101", "110", "111"];
    const C = 38,
      x0 = 62,
      y0 = 46,
      diff = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
    let s = tx(x0 + 4 * C, 16, "is the column a neighbour of the row?", { f: "700 12px", c: "var(--text-faint)" });
    S.forEach((a, i) => {
      s +=
        tx(x0 + i * C + C / 2, 38, a, { f: "800 12px", c: "var(--text-dim)" }) +
        tx(x0 - 8, y0 + i * C + C / 2 + 4, a, { a: "end", f: "800 12px", c: "var(--text-dim)" });
    });
    S.forEach((a, i) =>
      S.forEach(
        (b, j) =>
          (s += rc(x0 + j * C + 1, y0 + i * C + 1, C - 2, C - 2, {
            f: diff(a, b) === 2 ? "var(--blue)" : "var(--bg-2)",
            o: diff(a, b) === 2 ? 0.75 : 1,
            s: "var(--line)",
            sw: 1,
            r: 4,
          })),
      ),
    );
    return svg(380, 360, s);
  };

  const flipFig = () => {
    const A = [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1],
      Bn = [34.9, 38.7, 19.4, 5.7, 1.1, 0.15, 0, 0, 0, 0, 0];
    const X = (k) => 40 + k * 38;
    let s =
      tx(235, 14, "Chart A: how many strings are k flips away", { f: "800 13px" }) +
      tx(235, 158, "Chart B: how often one mutation flips k bits (each bit flips with chance 0.1)", { f: "800 12px" });
    A.forEach((v, k) => {
      const h = (v * 80) / 252;
      s +=
        rc(X(k), 110 - h, 28, h, { f: "var(--violet)", o: 0.35, s: "var(--violet)", sw: 2, r: 4 }) +
        tx(X(k) + 14, 106 - h, v, { f: "800 11px" }) +
        tx(X(k) + 14, 128, k, { f: "700 12px", c: "var(--text-faint)" });
    });
    Bn.forEach((v, k) => {
      const h = Math.max(v * 2, 1.5);
      s +=
        rc(X(k), 262 - h, 28, h, { f: "var(--amber)", o: 0.35, s: "var(--amber)", sw: 2, r: 4 }) +
        (v >= 1 ? tx(X(k) + 14, 258 - h, Math.round(v) + "%", { f: "800 11px" }) : "") +
        tx(X(k) + 14, 280, k, { f: "700 12px", c: "var(--text-faint)" });
    });
    s += ln(34, 110, 462, 110, "var(--text-faint)", 2) + ln(34, 262, 462, 262, "var(--text-faint)", 2);
    s += tx(248, 298, "k = number of bits flipped", { f: "700 12px", c: "var(--text-faint)" });
    A.forEach(
      (_, k) =>
        (s +=
          hit("a" + k, rc(X(k) - 3, 22, 34, 108, { f: "transparent", s: "transparent", sw: 2, r: 6 })) +
          hit("m" + k, rc(X(k) - 3, 176, 34, 106, { f: "transparent", s: "transparent", sw: 2, r: 6 }))),
    );
    return svg(470, 306, s);
  };

  const DG = {
    N: { A: [50, 50, 6], B: [190, 50, 9], C: [330, 50, 4], D: [120, 175, 7], E: [260, 175, 8], F: [400, 175, 3] },
    E: [
      ["A", "B"],
      ["B", "C"],
      ["B", "D"],
      ["C", "E"],
      ["D", "A"],
      ["E", "D"],
      ["E", "F"],
    ],
  };
  const digraphFig = () => {
    const R = 25;
    let s = mark("dga");
    DG.E.forEach(([a, b]) => {
      const [x1, y1] = DG.N[a],
        [x2, y2] = DG.N[b],
        L = Math.hypot(x2 - x1, y2 - y1),
        dx = (x2 - x1) / L,
        dy = (y2 - y1) / L;
      s += ln(x1 + dx * R, y1 + dy * R, x2 - dx * (R + 4), y2 - dy * (R + 4), "var(--text-faint)", 3).replace(
        "/>",
        ` marker-end="url(#dga)"/>`,
      );
    });
    Object.entries(DG.N).forEach(
      ([k, [x, y, f]]) =>
        (s += hit(
          k,
          `${ci(x, y, R, { s: "var(--blue)", sw: 3 })}${tx(x, y - 4, k, { f: "800 12px", c: "var(--text-dim)" })}${tx(x, y + 15, f, { f: "900 16px" })}`,
        )),
    );
    s += tx(235, 232, "arrow: a move the mutation can make. Number: fitness", {
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(470, 242, s);
  };

  const tapeFig = () => {
    let s = tx(20, 18, "starting tour (position numbers above)", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    [..."ABCDEF"].forEach(
      (c, i) =>
        (s +=
          tx(80 + i * 60 + 22, 44, i + 1, { f: "700 12px", c: "var(--text-faint)" }) +
          rc(80 + i * 60, 52, 44, 44, { f: "var(--blue)", o: 0.2, s: "var(--blue)", sw: 2.5, r: 8 }) +
          tx(80 + i * 60 + 22, 81, c, { f: "900 18px" })),
    );
    return svg(470, 108, s);
  };

  B.add("l3-neighbourhood", [
    {
      q: "The grid shows a mutation operator on 3-bit strings: a row is a string and a filled square marks a string that the operator can turn it into. Which operator is it?",
      fig: matrixFig(),
      o: ["Flip exactly one bit", "Flip exactly two bits", "Flip all three bits", "Swap two neighbouring bits"],
      a: 1,
      hint: "Look at the row 000. Which strings is it joined to, and how many bits differ from 000?",
      why: "Every row has three filled squares, and they are the strings that differ from the row in exactly two bits (000 is joined to 011, 101 and 110). One-bit flips would fill 001, 010 and 100 instead. Flipping all bits would fill one square per row, and swapping neighbouring bits would leave the rows 000 and 111 empty.",
    },
    {
      type: "pick",
      q: "A 10-bit string is mutated by flipping each bit independently with chance 0.1. Chart A counts the strings that lie k flips away, and chart B shows how often this mutation flips exactly k bits. Click the number of flips that the mutation makes most often.",
      fig: flipFig(),
      a: "m1",
      hint: "On average a mutation flips 10 × 0.1 = 1 bit.",
      why: "The big pile in chart A (252 strings at k = 5) is only a head-count of what could be reached. Flipping five bits has a chance of 0.15%, while one flip happens 39% of the time (and no change 35%, two flips 19%). The operator samples its neighbours unevenly, mostly close ones, so a huge neighbourhood on paper may rarely be explored.",
    },
    {
      type: "pick",
      q: "In this search each arrow is a move that the mutation can make from one solution to another. A solution is a local optimum when none of its moves goes to a fitter solution (higher is better). Click every local optimum.",
      fig: digraphFig(),
      a: ["B", "D", "E", "F"],
      hint: "Only follow the arrows leaving a solution. Arrows pointing into it do not matter.",
      why: "B (9) moves only to C (4) and D (7), D (7) moves only to A (6), and E (8) moves only to D (7) and F (3), so all three are stuck. F has no moves out at all, so a hillclimber stops there even though F is the worst solution. A (6) can reach B (9) and C (4) can reach E (8), so they are not local optima.",
    },
    {
      type: "cat",
      q: "The tour in the strip is changed by one mutation. Positions count along the string, with no wrap-around. Sort each result.",
      fig: tapeFig(),
      buckets: ["One swap of neighbouring positions", "One swap of far-apart positions", "More than one swap needed"],
      items: [
        ["ACBDEF", 0],
        ["ABCDFE", 0],
        ["AECDBF", 1],
        ["FBCDEA", 1],
        ["ABFEDC", 2],
        ["BADCFE", 2],
      ],
      hint: "Count how many positions hold a different letter from ABCDEF. If exactly two, are they next to each other?",
      why: "ACBDEF and ABCDFE differ in two neighbouring positions (2 and 3, 5 and 6). AECDBF differs in positions 2 and 5, and FBCDEA in positions 1 and 6: two positions that are not neighbours in the string. ABFEDC differs in four positions (the last four are reversed), and BADCFE differs in six (three separate swaps), so neither is a single swap.",
    },
  ]);

  /* ======================================================================
     l3-local : tabu queue and cost strip, stacked outcome bars, probability tree, tenure traces
     ====================================================================== */
  const tabuFig = () => {
    let s = tx(20, 18, "Tabu list (oldest first, newest last)", { a: "start", f: "800 13px" });
    ["bit 5", "bit 2", "bit 6"].forEach(
      (t, i) =>
        (s +=
          rc(20 + i * 84, 28, 74, 38, { f: "var(--violet)", o: 0.18, s: "var(--violet)", sw: 2.5, r: 10 }) +
          tx(57 + i * 84, 53, t, { f: "900 14px" })),
    );
    s += tx(290, 52, "newest joins on the right", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    s += tx(20, 106, "Cost change if this bit is flipped (a minus is cheaper)", { a: "start", f: "800 13px" });
    [
      ["bit 1", "+2"],
      ["bit 2", "−4"],
      ["bit 3", "+1"],
      ["bit 4", "−1"],
      ["bit 5", "−3"],
      ["bit 6", "−5"],
    ].forEach(([b, d], i) => {
      s +=
        rc(20 + i * 70, 116, 64, 58, { f: "var(--panel)", s: "var(--line-2)", sw: 2.5, r: 10 }) +
        tx(52 + i * 70, 136, b, { f: "800 12px", c: "var(--text-dim)" }) +
        tx(52 + i * 70, 161, d, { f: "900 18px", c: d[0] === "+" ? "var(--rose-ink)" : "var(--teal-ink)" });
    });
    return svg(450, 188, s);
  };

  const outcomeFig = () => {
    const U = 3.6,
      parts = [
        ["var(--teal-dim)", "var(--teal)"],
        ["var(--amber-dim)", "var(--amber)"],
        ["var(--bg-2)", "var(--line-2)"],
      ];
    const bar = (id, t, a, y) => {
      let s = tx(30, y - 10, t, { a: "start", f: "800 13px" }),
        x = 30;
      a.forEach((v, i) => {
        s +=
          rc(x, y, v * U, 44, { f: parts[i][0], s: parts[i][1], sw: 2.5, r: 0 }) +
          tx(x + (v * U) / 2, y + 28, v, { f: "900 15px" });
        x += v * U;
      });
      return s + hit(id, rc(26, y - 4, 100 * U + 8, 52, { f: "transparent", s: "transparent", sw: 2, r: 8 }));
    };
    let s = bar("A", "Run A: 100 steps", [40, 24, 36], 34) + bar("B", "Run B: 100 steps", [70, 15, 15], 112);
    [
      ["var(--teal-dim)", "var(--teal)", "better: moved"],
      ["var(--amber-dim)", "var(--amber)", "worse: accepted"],
      ["var(--bg-2)", "var(--line-2)", "worse: rejected"],
    ].forEach(
      ([f, st, t], i) =>
        (s +=
          rc(30 + i * 140, 176, 16, 16, { f, s: st, sw: 2, r: 3 }) +
          tx(52 + i * 140, 189, t, { a: "start", f: "700 12px", c: "var(--text-dim)" })),
    );
    return svg(470, 204, s);
  };

  const treeProbFig = () => {
    const bx = (x, y, a, b, c) =>
      rc(x - 60, y - 22, 120, 44, { r: 11, s: `var(--${c})`, sw: 2.5 }) +
      tx(x, y - 3, a, { f: "800 12px" }) +
      tx(x, y + 13, b, { f: "800 12px" });
    let s =
      ln(130, 100, 175, 52, "var(--line-2)", 2.5) +
      ln(130, 100, 175, 148, "var(--line-2)", 2.5) +
      ln(295, 48, 340, 48, "var(--line-2)", 2.5) +
      ln(295, 152, 340, 122, "var(--line-2)", 2.5) +
      ln(295, 152, 340, 188, "var(--line-2)", 2.5);
    s +=
      bx(70, 100, "pick one random", "neighbour", "blue") +
      bx(235, 48, "neighbour is", "better", "teal") +
      bx(235, 152, "neighbour is", "worse", "rose") +
      bx(400, 48, "move: cost", "falls", "teal") +
      bx(400, 122, "accept: cost", "goes up", "amber") +
      bx(400, 188, "reject: stay", "put", "line-2");
    s +=
      tx(138, 64, "0.25", { f: "900 13px", c: "var(--teal-ink)" }) +
      tx(138, 146, "0.75", { f: "900 13px", c: "var(--rose-ink)" });
    s +=
      tx(300, 118, "p = 0.2", { f: "900 13px", c: "var(--amber-ink)" }) +
      tx(312, 196, "0.8", { f: "900 13px", c: "var(--text-dim)" });
    return svg(470, 220, s);
  };
  Object.assign(partScope, { outcomeFig, tabuFig, treeProbFig });
})();

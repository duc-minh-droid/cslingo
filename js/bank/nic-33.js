(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { C, L, R, T, arrowDef, pk, svg } = partScope;
  const B = NIC.bank;
  const DIM = "var(--text-dim)",
    FAINT = "var(--text-faint)";

  /* ---------- l4-tournament ---------- */
  const gridFig = (() => {
    let s =
      T(4, 14, "A 0.9 (fittest)    B 0.6    C 0.3 (weakest)", { a: "start", s: 12, c: DIM }) +
      T(210, 40, "second entrant", { s: 11, c: DIM }) +
      T(26, 114, "first", { s: 11, c: DIM }) +
      T(26, 128, "entrant", { s: 11, c: DIM });
    "ABC".split("").forEach((c, i) => {
      s += T(130 + i * 78, 62, c, { s: 15 }) + T(70, 104 + i * 64 + 4, c, { s: 15 });
    });
    "ABC".split("").forEach((r, i) =>
      "ABC".split("").forEach((c, j) => {
        s += pk(
          r + c,
          R(92 + j * 78, 70 + i * 64, 74, 56, "var(--panel)", { r: 10 }) +
            T(129 + j * 78, 70 + i * 64 + 33, r + ", " + c, { s: 12, c: DIM }),
        );
      }),
    );
    return svg(340, 268, s);
  })();
  const seqFig = (() => {
    const X = { m1: 56, co: 178, m2: 300 },
      id = "ar" + ++partScope.uid;
    let s = arrowDef(id);
    [
      ["Machine 1", "m1"],
      ["Coordinator", "co"],
      ["Machine 2", "m2"],
    ].forEach(([n, k]) => {
      s +=
        R(X[k] - 50, 4, 100, 26, "var(--bg-2)", { r: 8 }) +
        T(X[k], 22, n, { s: 11.5 }) +
        L(X[k], 32, X[k], 262, { dash: "5 5" });
    });
    const arrow = (x1, x2, y) => L(x1, y, x2, y, { w: 3, c: "var(--blue)", mk: id });
    const hit = (x, y, w, h) => R(x, y, w, h, "transparent", { r: 8, s: "transparent" });
    s += pk("m1", hit(46, 42, 142, 34) + arrow(56, 170, 66) + T(113, 58, "subtotal", { s: 11 }));
    s += pk("m2", hit(168, 82, 142, 34) + arrow(300, 186, 106) + T(243, 98, "subtotal", { s: 11 }));
    s += pk(
      "m3",
      hit(46, 124, 264, 34) +
        arrow(170, 60, 150) +
        arrow(186, 296, 150) +
        T(113, 142, "grand total", { s: 11 }) +
        T(243, 142, "grand total", { s: 11 }),
    );
    s += pk(
      "m4",
      R(10, 172, 92, 28, "var(--amber-dim)", { r: 8, s: "var(--amber)" }) +
        T(56, 191, "pick parent", { s: 11 }) +
        R(254, 172, 92, 28, "var(--amber-dim)", { r: 8, s: "var(--amber)" }) +
        T(300, 191, "pick parent", { s: 11 }),
    );
    s += pk(
      "m5",
      hit(46, 212, 264, 40) +
        arrow(56, 170, 238) +
        arrow(300, 186, 238) +
        T(113, 230, "parent", { s: 11 }) +
        T(243, 230, "parent", { s: 11 }),
    );
    return svg(350, 268, s);
  })();
  const histFig = (() => {
    const mk = (x0, t, mean) => {
      let s = T(x0 + 50, 14, "t = " + t, { s: 13 }),
        mx = 0.28;
      for (let k = 0; k < 10; k++) {
        const p = Math.pow((k + 1) / 10, t) - Math.pow(k / 10, t),
          h = (p / mx) * 110;
        s += R(x0 + k * 10, 142 - h, 9, h, "var(--violet)", { fo: 0.8, r: 2, sw: 1 });
      }
      const mxp = x0 + mean;
      s +=
        L(mxp, 28, mxp, 142, { c: "var(--amber)", w: 3, dash: "5 4" }) +
        T(mxp, 160, "mean " + Math.round(mean), { s: 11, c: "var(--amber-ink)" }) +
        L(x0 - 2, 142, x0 + 102, 142) +
        T(x0, 176, "0", { s: 10, c: FAINT }) +
        T(x0 + 100, 176, "100", { s: 10, c: FAINT });
      return s;
    };
    return svg(340, 184, mk(6, 1, 50) + mk(122, 2, 200 / 3) + mk(238, 3, 75));
  })();
  const traceTab = `<table class="t"><tr><th>Call</th><th>Entrants: slot (fitness)</th><th>Returned</th></tr>
    <tr class="bad"><td>1</td><td>8 (0.20) &nbsp;3 (0.90) &nbsp;5 (0.40)</td><td>slot 8: 0.20</td></tr>
    <tr class="bad"><td>2</td><td>2 (0.70) &nbsp;6 (0.10) &nbsp;1 (0.50)</td><td>slot 6: 0.10</td></tr>
    <tr><td>3</td><td>4 (0.60) &nbsp;0 (0.30) &nbsp;7 (0.80)</td><td>slot 7: 0.80</td></tr></table>`;
  B.add("l4-tournament", [
    {
      type: "pick",
      q: "Size-2 tournaments with replacement among three individuals. Each cell is one equally likely pair of entrants (first draw, second draw); the fitter entrant wins. Tap every cell where <b>B</b> wins.",
      fig: gridFig,
      a: ["BB", "BC", "CB"],
      why: "A beats everyone, so B can only win when no A is drawn, and when B is drawn at least once: (B, B), (B, C) and (C, B). That is 3 of the 9 equally likely pairs, so B wins 1/3 of the time. A wins 5/9 (every cell with an A) and C only 1/9 (C, C).",
    },
    {
      type: "pick",
      q: "A population lives on two machines; a coordinator can add up their fitness. Roulette selection needs the messages below. Now the GA switches to tournament selection (each machine runs tournaments on its own individuals). Tap every message that is no longer needed.",
      fig: seqFig,
      a: ["m1", "m2", "m3"],
      why: "Roulette needs the grand total of all fitness, so every machine reports a subtotal and the total is sent back (messages 1 to 3). Tournament selection only compares the few entrants it draws, so it needs no global information at all. Picking a parent still happens locally and the parent still has to be sent on, so those messages stay.",
    },
    {
      type: "slider",
      q: "Fitness values are spread evenly from 0 to 100, and a tournament returns the fittest of t random entrants. The dashed lines show the average winner for t = 1, 2 and 3. About what is the average winner's fitness for t = 9?",
      fig: histFig,
      min: 50,
      max: 100,
      step: 5,
      ans: 90,
      tol: 5,
      hint: "The averages are 1/2, 2/3 and 3/4 of the way up the range. What is the pattern?",
      why: "The means follow t ÷ (t + 1) of the range: 50, 67, 75, and so 9/10 = 90 for t = 9. Each extra entrant makes it less likely that all of them are weak, so the winner's fitness creeps towards the top with diminishing returns.",
    },
    {
      type: "bug",
      q: "This tournament is meant to return the fittest of t random slots, but it keeps returning weak individuals. The trace of three calls is above. Tap the faulty line.",
      fig: traceTab,
      code: [
        "def tournament(pop, t):",
        "    n = len(pop)",
        "    idx = random.sample(range(n), t)",
        "    best = max(idx)",
        "    return pop[best]",
      ],
      a: 3,
      why: "max(idx) picks the largest slot NUMBER, not the fittest slot: call 1 returned slot 8 (0.20) although slot 3 (0.90) was in the tournament. It only looks right when the highest slot happens to be the fittest, as in call 3. The fix is max(idx, key=lambda i: pop[i].fit).",
    },
  ]);

  /* ---------- l4-mutation ---------- */
  const tspFig = (() => {
    const P = { A: [40, 50], B: [150, 22], C: [270, 48], D: [292, 168], E: [160, 206], F: [38, 160] };
    const par = ["AB", "BC", "CD", "DE", "EF", "FA"],
      child = ["AD", "DC", "CB", "BE", "EF", "FA"];
    let s = par
      .map((e) => L(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { c: FAINT, w: 3, dash: "3 6", cap: true }))
      .join("");
    s += child
      .map((e) =>
        pk(
          e,
          L(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { c: "var(--blue)", w: 5, cap: true }) +
            L(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { c: "transparent", w: 22 }),
        ),
      )
      .join("");
    s += Object.entries(P)
      .map(([k, [x, y]]) => C(x, y, 15, "var(--panel)", { s: "var(--ink)" }) + T(x, y + 5, k, { s: 14 }))
      .join("");
    s +=
      L(10, 240, 38, 240, { c: FAINT, w: 3, dash: "3 6" }) +
      T(44, 244, "parent tour", { a: "start", s: 11 }) +
      L(150, 240, 178, 240, { c: "var(--blue)", w: 5 }) +
      T(184, 244, "child tour", { a: "start", s: 11 });
    return svg(330, 256, s);
  })();
  const binomHist = (() => {
    const Cn = (n, k) => {
        let r = 1;
        for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
        return r;
      },
      b = (p, k) => Cn(20, k) * Math.pow(p, k) * Math.pow(1 - p, 20 - k);
    const mk = (x0, name, p) => {
      let s = T(x0 + 50, 14, name, { s: 13 });
      for (let k = 0; k <= 9; k++) {
        const h = b(p, k) * 140;
        s +=
          R(x0 + k * 10, 150 - h, 8.5, Math.max(h, 0.5), "var(--blue)", { fo: 0.85, r: 2, sw: 1 }) +
          (k % 3 === 0 ? T(x0 + k * 10 + 4, 165, k, { s: 10, c: DIM }) : "");
      }
      return s + L(x0 - 2, 150, x0 + 100, 150);
    };
    return svg(
      340,
      188,
      mk(6, "Panel X", 0.25) +
        mk(122, "Panel Y", 0.01) +
        mk(238, "Panel Z", 0.05) +
        T(170, 184, "bits flipped in a child of a 20-bit string (0 to 9)", { s: 10, c: FAINT }),
    );
  })();
  const pairGrid = (() => {
    let s = "",
      n = 0;
    for (let i = 0; i < 6; i++) {
      s += T(46 + i * 44, 16, i + 1, { s: 12, c: DIM }) + T(12, 56 + i * 44, i + 1, { s: 12, c: DIM });
      for (let j = 0; j < 6; j++) {
        const on = i < j;
        if (on) n++;
        s +=
          R(26 + j * 44, 28 + i * 44, 40, 40, on ? "var(--teal)" : "var(--bg-2)", {
            fo: on ? 0.8 : 1,
            r: 6,
            s: "var(--panel)",
            sw: 2,
          }) + (on ? T(46 + j * 44, 53 + i * 44, n, { s: 13, c: "#fff" }) : "");
      }
    }
    return svg(292, 296, s);
  })();
  const dialFig = (() => {
    const cx = 150,
      cy = 150,
      r = 112,
      set = [
        ["r0", "0", 180],
        ["r1", ".002", 135],
        ["r2", ".02", 90],
        ["r3", ".1", 45],
        ["r4", ".5", 0],
      ];
    let s = `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="var(--line-2)" stroke-width="6" stroke-linecap="round"/>`;
    set.forEach(([id, l, a]) => {
      const x = cx + r * Math.cos((a * Math.PI) / 180),
        y = cy - r * Math.sin((a * Math.PI) / 180);
      s += pk(id, C(x, y, 26, "var(--panel)") + T(x, y + 5, l, { s: 13 }));
    });
    s +=
      T(cx, cy - 36, "flip rate per bit", { s: 13 }) +
      T(cx, cy - 18, "(each bit independently)", { s: 10, c: DIM }) +
      T(cx, cy + 12, "strings are 50 bits long", { s: 11, c: DIM });
    return svg(300, 186, s);
  })();
  B.add("l4-mutation", [
    {
      type: "pick",
      q: "A tour of the six cities A to F (grey dotted lines) is mutated by reversing the segment B C D. The child's tour is drawn in blue. Tap every edge of the child that was not in the parent.",
      fig: tspFig,
      a: ["AD", "BE"],
      why: "The parent visits A B C D E F; the child visits A D C B E F. Edges D–C, C–B, E–F and F–A already existed (an edge has no direction). Only A–D and B–E are new. A reversal changes just two edges however long the segment is, which makes it a small, gentle step for tour problems.",
    },
    {
      type: "match",
      q: "Bit-flip mutation on 20-bit strings: each panel shows how many bits flip in a child (0 to 9). Match each panel to the mutation rate per bit.",
      fig: binomHist,
      pairs: [
        ["Panel X", "0.25 per bit"],
        ["Panel Y", "0.01 per bit"],
        ["Panel Z", "0.05 per bit"],
      ],
      hint: "On average a child flips 20 × rate bits: 20 × 0.05 = 1.",
      why: "The average number of flips is 20 times the rate: 0.2, 1 and 5. At 0.01 most children (82%) are untouched copies (panel Y). At 0.05, which is 1/L, the typical child flips 0 or 1 bits (panel Z). At 0.25 the peak sits at about 5 flips and the child is already far from its parent (panel X).",
    },
    {
      type: "slider",
      q: "Swap mutation exchanges two positions of a tour. With 6 cities there are 15 different swaps (the 15 coloured cells: one per pair of positions). About how many different swaps exist for 10 cities?",
      fig: pairGrid,
      min: 0,
      max: 100,
      step: 5,
      ans: 45,
      tol: 5,
      hint: "Each coloured cell is a pair (row < column). For 10 cities: 10 × 9 pairs, counted once per swap.",
      why: "The number of swaps is the number of pairs of positions: n × (n − 1) / 2. For 6 cities 6 × 5 / 2 = 15, and for 10 cities 10 × 9 / 2 = 45. The set of neighbours grows with the square of the tour length, so for long tours a single swap is a tiny sample of what is reachable.",
    },
    {
      type: "pick",
      q: "Each dial setting is a possible mutation rate per bit for strings of 50 bits. Tap every setting that flips MORE than 2 bits per child on average.",
      fig: dialFig,
      a: ["r3", "r4"],
      hint: "Average flips = 50 × rate. For example 50 × 0.02 = 1.",
      why: "50 × 0.1 = 5 flips and 50 × 0.5 = 25 flips, both above 2. At 0.02 a child flips 1 bit on average (that is 1/L, the usual choice), at 0.002 only 0.1, and at 0 nothing ever changes. A rate of 0.5 flips half the string: the child keeps almost nothing of its parent.",
    },
  ]);

  /* ---------- l4-crossover ---------- */
  const splitFig = (() => {
    const X = (d) => 50 + (d - 1) * 32,
      Y = (p) => 212 - p * 190,
      curves = [
        ["X", () => 0.5, "var(--violet)"],
        ["Y", (d) => d / 9, "var(--blue)"],
        ["Z", (d) => (d * (9 - d)) / 36, "var(--amber)"],
      ];
    let s = [0, 0.5, 1]
      .map(
        (p) =>
          L(40, Y(p), 324, Y(p), { c: "var(--line)", w: 1 }) +
          T(35, Y(p) + 4, Math.round(p * 100) + "%", { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    for (let d = 1; d <= 9; d++) s += T(X(d), 232, d, { s: 11, c: DIM });
    s +=
      T(190, 250, "distance d between the two genes", { s: 11, c: DIM }) +
      T(2, 10, "chance the two genes come from different parents", { a: "start", s: 10, c: DIM });
    curves.forEach(([n, f, c]) => {
      const pts = Array.from({ length: 9 }, (_, i) => [X(i + 1), Y(f(i + 1))]);
      s += pk(
        n,
        `<path d="${pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ")}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>` +
          pts.map((p) => C(p[0], p[1], 4.5, c, { s: "var(--panel)", sw: 2 })).join("") +
          C(X(9) + 22, Y(f(9)), 11, c, { fo: 0.9, s: "var(--panel)", sw: 2 }) +
          T(X(9) + 22, Y(f(9)) + 5, n, { s: 12, c: "#fff" }),
      );
    });
    return svg(350, 258, s);
  })();
  const dagFig = (() => {
    const id = "ar" + ++partScope.uid,
      N = { G2: [56, 34], G1: [170, 34], G3: [284, 34], X: [113, 122], Y: [227, 122], Z: [170, 210] },
      E = [
        ["G2", "X"],
        ["G1", "X"],
        ["G1", "Y"],
        ["G3", "Y"],
        ["X", "Z"],
        ["Y", "Z"],
      ];
    let s = arrowDef(id);
    s += E.map(([a, b]) => {
      const [x1, y1] = N[a],
        [x2, y2] = N[b],
        d = Math.hypot(x2 - x1, y2 - y1),
        ux = (x2 - x1) / d,
        uy = (y2 - y1) / d;
      return L(x1 + ux * 25, y1 + uy * 25, x2 - ux * 29, y2 - uy * 29, { w: 3, mk: id });
    }).join("");
    s += Object.entries(N)
      .map(
        ([k, [x, y]]) =>
          C(x, y, 23, k === "G1" ? "var(--amber-dim)" : "var(--panel)", {
            s: k === "G1" ? "var(--amber)" : "var(--ink)",
          }) + T(x, y + 5, k, { s: 14 }),
      )
      .join("");
    s +=
      T(336, 206, "arrows point from", { a: "end", s: 10, c: FAINT }) +
      T(336, 220, "parent to child", { a: "end", s: 10, c: FAINT });
    return svg(340, 242, s);
  })();
  const nodupTab = (() => {
    const cell = (v, bad) =>
      `<td class="num" style="text-align:center${bad ? ";background:var(--rose-dim)" : ""}">${v}</td>`;
    const row = (n, a, bad = []) => `<tr><td>${n}</td>${a.map((v, i) => cell(v, bad.includes(i))).join("")}</tr>`;
    return `<table class="t"><tr><th>Gene</th>${[1, 2, 3, 4, 5, 6].map((i) => `<th class="num" style="text-align:center">${i}</th>`).join("")}</tr>${row("Parent 1", [1, 2, 3, 4, 5, 6])}${row("Parent 2", [3, 6, 5, 1, 4, 2])}${row("Child", [1, 2, 3, 1, 4, 2], [3, 5])}</table><p class="dim" style="margin:6px 0 0;font-size:13px">1-point crossover after gene 3: genes 1 to 3 from parent 1, genes 4 to 6 from parent 2. Red cells repeat a city.</p>`;
  })();
  const bitFig = (() => {
    const cols = [
      "101101",
      "111111",
      "011010",
      "110011",
      "000000",
      "101110",
      "000010",
      "110100",
      "111111",
      "010110",
      "100111",
      "011001",
    ];
    let s = "";
    for (let r = 0; r < 6; r++) s += T(16, 54 + r * 30, "P" + (r + 1), { s: 11, c: DIM });
    cols.forEach((c, j) => {
      let g = T(46 + j * 25, 20, j + 1, { s: 11, c: DIM });
      [...c].forEach((b, r) => {
        g +=
          R(34 + j * 25, 30 + r * 30, 23, 27, b === "1" ? "var(--blue)" : "var(--bg-2)", { r: 5, sw: 1.5 }) +
          T(45.5 + j * 25, 49 + r * 30, b, { s: 12, c: b === "1" ? "#fff" : DIM });
      });
      s += pk("c" + (j + 1), g);
    });
    return svg(340, 216, s);
  })();
  Object.assign(partScope, { bitFig, dagFig, nodupTab, splitFig });
})();

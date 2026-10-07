(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { C, L, R, T, optCube, poly, svg } = partScope;
  const B = NIC.bank;

  const optRuler = (() => {
    const x0 = 22,
      U = 14.6,
      X = (e) => x0 + e * U,
      y = 108;
    let g = L(x0, y, X(25), y, { sw: 3 });
    [0, 5, 10, 15, 20, 25].forEach(
      (e) =>
        (g +=
          L(X(e), y - 5, X(e), y + 5, { sw: 2 }) +
          T(X(e), y + 25, e === 0 ? "1 s" : "10<tspan dy='-5' style='font-size:10px'>" + e + "</tspan>", {
            z: 12,
            c: "var(--text-dim)",
          })),
    );
    [
      [4.94, "a day", 62],
      [9.5, "a century", 40],
      [17.6, "age of the universe", 62],
    ].forEach(
      ([e, s, ty]) =>
        (g +=
          L(X(e), ty + 6, X(e), y, { c: "var(--amber)", d: "3 3", sw: 2 }) +
          T(X(e), ty, s, { z: 12, c: "var(--amber-ink)" })),
    );
    [3, 9, 15, 21, 24].forEach(
      (e, i) =>
        (g += `<g data-pick="m${e}">${C(X(e), y, 13, { f: "var(--blue-dim)", s: "var(--blue)", sw: 3 })}</g>${T(X(e), y + 5, "ABCDE"[i], { z: 13, c: "var(--ink)" })}`),
    );
    g +=
      T(205, 150, "seconds (log scale: each tick is ×100,000)", { z: 12, c: "var(--text-dim)" }) +
      T(220, 16, "How long would the full search take?", { z: 13, c: "var(--text-dim)" });
    return svg(410, 162, g);
  })();

  const optHeat = (() => {
    const cs = 29,
      cols = 14,
      rows = 9,
      ox = 8,
      oy = 8;
    const S = [3, 6],
      D = [10, 2.5],
      f = (c, r) => Math.min(4 + Math.hypot(c - S[0], r - S[1]), Math.hypot(c - D[0], r - D[1]));
    let g = "";
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const v = Math.max(0, Math.min(1, 1 - f(c + 0.5, r + 0.5) / 9));
        g += `<rect x="${ox + c * cs}" y="${oy + r * cs}" width="${cs}" height="${cs}" fill="var(--panel)"/><rect x="${ox + c * cs}" y="${oy + r * cs}" width="${cs}" height="${cs}" fill="var(--teal)" fill-opacity="${v.toFixed(2)}"/>`;
      }
    g += R(ox, oy, cols * cs, rows * cs, { f: "none", r: 0, sw: 2 });
    const pts = { A: [3, 6], B: [9, 4], C: [6, 5], D: [12, 7], E: [5, 1] };
    Object.entries(pts).forEach(
      ([k, [c, r]]) =>
        (g += `<g data-pick="${k}">${C(ox + c * cs, oy + r * cs, 13, { f: "var(--panel)", s: "var(--ink)", sw: 3 })}${T(ox + c * cs, oy + r * cs + 5, k, { z: 13, c: "var(--ink)" })}</g>`),
    );
    g +=
      T(ox + 20, oy + rows * cs + 22, "worse", { a: "start", z: 12, c: "var(--text-dim)" }) +
      R(ox + 80, oy + rows * cs + 10, 24, 14, { f: "var(--panel)", r: 3, sw: 1 }) +
      R(ox + 108, oy + rows * cs + 10, 24, 14, { f: "var(--teal)", o: 0.35, r: 3, sw: 1 }) +
      R(ox + 136, oy + rows * cs + 10, 24, 14, { f: "var(--teal)", o: 0.7, r: 3, sw: 1 }) +
      R(ox + 164, oy + rows * cs + 10, 24, 14, { f: "var(--teal)", r: 3, sw: 1 }) +
      T(ox + 198, oy + rows * cs + 22, "better", { a: "start", z: 12, c: "var(--text-dim)" });
    return svg(424, 300, g);
  })();

  const optTable = (() => {
    const cols = [
      ["110", 0],
      ["101", 5],
      ["001", 25],
      ["010", 30],
    ];
    let g =
      T(8, 28, "Subset", { a: "start", c: "var(--text-dim)", z: 13 }) +
      T(8, 68, "f", { a: "start", z: 14 }) +
      T(8, 108, "f squared", { a: "start", z: 14 });
    cols.forEach(([s, v], i) => {
      const x = 110 + i * 78;
      g +=
        R(x, 8, 70, 30, { f: "var(--blue-dim)", s: "var(--blue-edge)", r: 8 }) +
        T(x + 35, 29, s, { z: 14, c: "var(--ink)" }) +
        R(x, 48, 70, 30, { r: 8 }) +
        T(x + 35, 69, v, { z: 14 }) +
        R(x, 88, 70, 30, { r: 8 }) +
        T(x + 35, 109, (v * v).toLocaleString("en-GB"), { z: 14 });
    });
    return svg(430, 128, g);
  })();

  const optStep = (() => {
    const imp = { 0: 100, 40: 55, 110: 30, 200: 12, 412: 0 },
      x0 = 44,
      W = 340,
      y1 = 170,
      y0 = 22,
      X = (t) => x0 + (t / 1000) * W,
      Y = (v) => y1 - (v / 100) * (y1 - y0);
    let cur = 100,
      pts = [[X(0), Y(100)]];
    for (let t = 1; t <= 1000; t++) {
      if (imp[t] !== undefined) {
        pts.push([X(t), Y(cur)]);
        cur = imp[t];
        pts.push([X(t), Y(cur)]);
      }
    }
    pts.push([X(1000), Y(cur)]);
    let g = L(x0, y1, x0 + W + 4, y1) + L(x0, y0 - 6, x0, y1);
    [0, 50, 100].forEach(
      (v) =>
        (g +=
          L(x0, Y(v), x0 + W, Y(v), { c: "var(--line)", sw: 1 }) +
          T(x0 - 8, Y(v) + 4, v, { a: "end", z: 12, c: "var(--text-dim)" })),
    );
    g +=
      poly(pts, "var(--teal)", 3.5) +
      T(235, 14, "Best fitness found so far (lower is better, never below 0)", { z: 12, c: "var(--text-dim)" }) +
      T(x0 + W / 2, y1 + 56, "candidates checked", { z: 12, c: "var(--text-dim)" });
    [150, 300, 412, 700, 1000].forEach(
      (t) =>
        (g += `<g data-pick="k${t}">${L(X(t), Y(0), X(t), y1, { c: "var(--blue-edge)", d: "3 4", sw: 2 })}${C(X(t), y1 + 22, 17, { s: "var(--blue)", sw: 3 })}${T(X(t), y1 + 27, t, { z: 12, c: "var(--ink)" })}</g>`),
    );
    return svg(420, 238, g);
  })();

  B.add("l2-optim", [
    {
      type: "pick",
      q: "The cube shows all 8 on/off choices for three items weighing 30, 70 and 75 kg, with f = |total − 100| beside each (lower is better). A search starts at 000 and repeatedly moves to the neighbour (one bit flipped) with the lowest f, stopping when no neighbour is better. Where does it stop?",
      fig: optCube,
      a: "v101",
      why: "From 000 the neighbours score 70, 30 and 25, so it moves to 001. From 001 the neighbours score 5 (101), 45 and 100, so it moves to 101. Now no neighbour beats 5 (they are 25, 70 and 75), so it stops. But the true optimum is 110 with f = 0, two flips away. Neighbour-by-neighbour search can end on a good-looking answer that isn't the best, which is why exhaustive search is the only guarantee when the space is small.",
    },
    {
      type: "pick",
      q: "A timetable problem has about 10<sup>30</sup> candidate timetables. A fast computer scores 10<sup>9</sup> (a billion) of them every second. Tap where an exhaustive search would finish on this time ruler.",
      fig: optRuler,
      a: "m21",
      hint: "10 to the 30, divided by 10 to the 9, is 10 to the (30 − 9) seconds.",
      why: "10³⁰ ÷ 10⁹ = 10²¹ seconds. The age of the universe is only about 4 × 10¹⁷ seconds, so the search would take roughly 2,000 times longer than the universe has existed. Enumeration is only for small search spaces.",
    },
    {
      type: "pick",
      q: "Two numbers (x and y) are tuned, so there are infinitely many settings and enumeration is impossible. The map shades every setting by its score (darker green = better). An EA has tried the five settings marked A to E. Tap the best one.",
      fig: optHeat,
      a: "B",
      why: "B sits near the centre of the deeper valley. A sits at the bottom of the shallower valley, and it looks fine on its own, but its colour is paler than B's. C, D and E are on slopes. The EA only ever sees the scores of the settings it has tried, so it must compare them like this and breed from the better ones.",
    },
    {
      type: "mcq",
      q: "A colleague changes the fitness function from f to f² (still minimised) and re-runs the exhaustive search over all 8 subsets of weights 30, 70 and 75 kg, with target 100 kg. The table shows a few of the scores. What changes?",
      fig: optTable,
      o: [
        "Nothing about the winner: squaring keeps the order of scores that are 0 or more, so the same subset wins",
        "A different subset wins, because squaring punishes the big misses far more than it punishes the small ones",
        "Two subsets now tie for best, because 0 and 25 are close enough together once squared to count as equal",
        "The search space gets larger, because the squared scores are bigger numbers than the original scores are",
      ],
      a: 0,
      why: "Squaring a score that is never negative never swaps the order of two candidates (a smaller f always gives a smaller f²), so exhaustive search picks 110 either way. The search space is the set of candidates, not the set of scores, so it stays at 8. (Selection that depends on score ratios could still behave differently, but ranking-based best-finding does not.)",
    },
    {
      type: "pick",
      q: "Exhaustive search checks candidates one at a time and records the best fitness so far (lower is better, and no candidate can score below 0). At which marker could you first stop and be certain you have found an optimum?",
      fig: optStep,
      a: "k412",
      why: "At 412 candidates the best fitness drops to 0, and no score can be lower than 0, so nothing left unchecked can beat it. The earlier flat stretches (for example around 300) prove nothing, because an unchecked candidate might still be better. Knowing the best possible score is what lets you stop early.",
    },
  ]);

  /* =====================================================================
     l2-complexity
     ===================================================================== */
  const cxBars = (() => {
    const ns = [24, 25, 26, 27, 28],
      x0 = 56,
      base = 190,
      H = 140;
    let g =
      L(x0 - 12, base, 410, base) +
      T(220, 16, "Time for exhaustive search, 1 million candidates per second", { z: 13, c: "var(--text-dim)" });
    ns.forEach((n, i) => {
      const t = Math.pow(2, n) / 1e6,
        h = (t / 270) * H,
        x = x0 + i * 68;
      g +=
        R(x, base - h, 44, h, { f: "var(--amber)", s: "var(--amber-ink)", r: 5 }) +
        T(x + 22, base - h - 7, t.toFixed(t < 100 ? 1 : 0) + " s", { z: 13 }) +
        T(x + 22, base + 20, "n = " + n, { z: 13 });
    });
    return svg(420, 220, g);
  })();

  const cxTable = (() => {
    const ns = [10, 20, 30, 40],
      A = [1, 4, 9, 16],
      Bv = [0.032, 1.024, 32.8, 1048.6];
    const fm = (v) =>
      v < 0.1 ? v.toFixed(2) : v < 10 ? v.toFixed(1) : v < 100 ? v.toFixed(0) : Math.round(v).toLocaleString("en-GB");
    let g =
      T(60, 24, "n", { c: "var(--text-dim)" }) +
      T(190, 24, "Program A (s)", { c: "var(--blue-ink)" }) +
      T(330, 24, "Program B (s)", { c: "var(--amber-ink)" });
    ns.forEach((n, i) => {
      const y = 36 + i * 40;
      g +=
        R(24, y, 72, 32, { r: 8, f: "var(--bg-2)" }) +
        T(60, y + 22, n, { z: 15 }) +
        R(120, y, 140, 32, { r: 8, f: "var(--blue-dim)", s: "var(--blue-edge)" }) +
        T(190, y + 22, fm(A[i]), { z: 15 }) +
        R(274, y, 140, 32, { r: 8, f: "var(--amber-dim)", s: "var(--amber-edge)" }) +
        T(344, y + 22, fm(Bv[i]), { z: 15 });
    });
    return svg(440, 206, g);
  })();

  const cxTree = (() => {
    const lvX = (lv, i) => {
        const n = Math.pow(2, lv),
          w = 360;
        return 20 + (w / n) * (i + 0.5);
      },
      ys = [30, 90, 150, 210];
    let g = "";
    for (let lv = 0; lv < 3; lv++)
      for (let i = 0; i < Math.pow(2, lv); i++)
        for (const j of [2 * i, 2 * i + 1])
          g += L(lvX(lv, i), ys[lv], lvX(lv + 1, j), ys[lv + 1], { c: "var(--line-2)", sw: 2.5 });
    for (let lv = 0; lv < 4; lv++)
      for (let i = 0; i < Math.pow(2, lv); i++)
        g +=
          lv === 3
            ? R(lvX(lv, i) - 20, ys[lv] - 14, 40, 28, { f: "var(--teal-dim)", s: "var(--teal)", r: 8 }) +
              T(lvX(lv, i), ys[lv] + 5, (7 - i).toString(2).padStart(3, "0"), { z: 12 })
            : C(lvX(lv, i), ys[lv], 11, { s: "var(--blue)", sw: 3 });
    ["item 1", "item 2", "item 3"].forEach(
      (s, k) => (g += T(436, ys[k] + 34, s, { a: "end", z: 12, c: "var(--text-dim)" })),
    );
    g += T(210, 252, "left branch = take (1), right = skip (0)", { z: 12, c: "var(--text-dim)" });
    return svg(440, 262, g);
  })();

  const cxLines = (() => {
    const x0 = 66,
      W = 330,
      y1 = 190,
      y0 = 24,
      ymax = 6.2,
      X = (n) => x0 + ((n - 10) / 20) * W,
      Y = (v) => y1 - (Math.log10(v) / ymax) * (y1 - y0);
    let g = L(x0, y1, x0 + W + 6, y1) + L(x0, y0 - 6, x0, y1);
    [
      [1, "1"],
      [100, "100"],
      [1e4, "10,000"],
      [1e6, "1,000,000"],
    ].forEach(
      ([v, s]) =>
        (g +=
          L(x0, Y(v), x0 + W, Y(v), { c: "var(--line)", sw: 1 }) +
          T(x0 - 6, Y(v) + 4, s, { a: "end", z: 11, c: "var(--text-dim)" })),
    );
    const P = [],
      Q = [];
    for (let n = 10; n <= 30; n += 0.5) {
      P.push([X(n), Y(Math.pow(2, n) / 1000)]);
      Q.push([X(n), Y(n * n * n)]);
    }
    g += poly(P, "var(--amber)", 3.5) + poly(Q, "var(--blue)", 3.5);
    g +=
      L(x0 + 8, 14, x0 + 34, 14, { c: "var(--amber)", sw: 4 }) +
      T(x0 + 40, 18, "P: 2ⁿ ÷ 1000", { a: "start", z: 13, c: "var(--amber-ink)" }) +
      L(x0 + 170, 14, x0 + 196, 14, { c: "var(--blue)", sw: 4 }) +
      T(x0 + 202, 18, "Q: n³", { a: "start", z: 13, c: "var(--blue-ink)" });
    g += T(235, y1 + 50, "steps needed (log scale: each line is ×100 the one below)", { z: 12, c: "var(--text-dim)" });
    [10, 15, 20, 25, 30].forEach(
      (n) =>
        (g += `<g data-pick="n${n}">${L(X(n), y1, X(n), y0, { c: "var(--line-2)", d: "2 5", sw: 1.5 })}${C(X(n), y1 + 20, 14, { s: "var(--violet)", sw: 3 })}${T(X(n), y1 + 25, n, { z: 13, c: "var(--ink)" })}</g>`),
    );
    return svg(440, 262, g);
  })();

  B.add("l2-complexity", [
    {
      type: "mcq",
      q: "A brute-force search checks 2<sup>n</sup> candidates at a million per second. The bars show its running time for n = 24 to 28. For a one-hour budget (3,600 seconds), roughly what is the largest n it can handle?",
      fig: cxBars,
      o: ["28", "31", "34", "40"],
      a: 1,
      hint: "Each extra item doubles the time. Start from 268 s at n = 28 and keep doubling.",
      why: "Doubling from 268 s: n = 29 takes about 540 s, n = 30 about 1,070 s and n = 31 about 2,150 s (36 minutes). n = 32 would take about 4,300 s (72 minutes), which is over the hour. So n = 31 is the limit, and a computer 1,000 times faster would only buy about 10 more items.",
    },
    {
      type: "mcq",
      q: "A team times two exact programs for the same job on inputs of size n. The job will soon be run with n = 100. Which program should they keep, and why?",
      fig: cxTable,
      o: [
        "A: its time rises gently as n grows, while B's time multiplies by about 30 for every 10 extra items",
        "B: it was faster than A on the smaller inputs, so its lead should only widen as n grows towards 100",
        "B: its first two timings are the smallest, which shows that it must do less work per item than A does",
        "Neither: four timings are far too few to say anything reliable about what will happen at n = 100",
      ],
      a: 0,
      why: "A grows steadily (1, 4, 9, 16 s: like n²). B's times jump by a factor of about 32 every time n goes up by 10 (1 → 33 → 1,049), which is exponential. B only looked quicker while n was small. At n = 100, A needs about 100 s, whereas B would need over a million million seconds, which is tens of thousands of years. Early wins can fool you: a small exponential eventually loses to any polynomial.",
    },
    {
      type: "mcq",
      q: "An exhaustive search visits every leaf of a decision tree: one level per item, branching into take or skip. With 3 items there are 8 leaves. How many leaves are there after two more items are added (5 items in total)?",
      fig: cxTree,
      o: ["10", "16", "32", "64"],
      a: 2,
      why: "Each new item doubles every existing branch, so each extra level multiplies the leaves by 2. Two more levels give 8 × 2 × 2 = 32, which is 2⁵. Adding items adds levels, but the work counts leaves, so it grows exponentially, not by a fixed amount per item.",
    },
    {
      type: "match",
      q: "A programmer times a program at n = 100, then at n = 200 (or 101). Match each timing log to the growth it points to.",
      pairs: [
        ["Time doubles when n goes from 100 to 200", "Linear, n"],
        ["Time quadruples when n goes from 100 to 200", "Quadratic, n²"],
        ["Time goes up 8 times when n goes from 100 to 200", "Cubic, n³"],
        ["Time doubles when n goes from 100 to just 101", "Exponential, 2ⁿ"],
      ],
      why: "Doubling the input and getting 2, 4 or 8 times the time points to n, n² and n³ (2¹, 2², 2³ times). If a single extra item doubles the time, the exponent contains n, which is exponential. At n = 200 the exponential program would be unimaginably slow.",
    },
    {
      type: "pick",
      q: "Program P takes 2<sup>n</sup> steps but runs on a computer 1,000 times faster, so it needs 2<sup>n</sup> ÷ 1,000 time units. Program Q takes n³ steps on an ordinary computer. The chart plots both on a log scale. Tap the first marked n at which Q beats P.",
      fig: cxLines,
      a: "n25",
      why: "At n = 20, P needs about 1,000 and Q needs 8,000, so P is ahead. At n = 25, P needs about 33,500 but Q needs only 15,600. Beyond that the gap keeps widening (at n = 30 it is about a million against 27,000). A thousand-fold faster machine only delays the exponential's defeat by a few items, while a better algorithm wins for good.",
    },
  ]);
})();

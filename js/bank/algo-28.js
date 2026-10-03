(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { C, L, P, R, SVG, T, arrowDef, col, gridFig, ink, pk, stackFig, tint } = partScope;
  const B = NIC.bank;

  // 3. log-scale ruler of times
  const rulerFig = (() => {
    const t = [
      ["1 sec", 1, "s1"],
      ["1 min", 60, "min"],
      ["1 hour", 3600, "hr"],
      ["1 day", 86400, "day"],
      ["1 week", 604800, "wk"],
      ["1 month", 2592000, "mo"],
      ["1 year", 31536000, "yr"],
    ];
    const x0 = 46,
      w = 410,
      X = (s) => x0 + (Math.log10(s) / 7.6) * w,
      y = 96;
    let b = L(x0 - 10, y, x0 + w + 10, y, { sw: 4, stroke: "var(--line-2)" });
    t.forEach(([lab, s, id], i) => {
      const up = i % 2 === 0;
      b +=
        L(X(s), y - 8, X(s), y + 8, { sw: 2 }) +
        T(X(s), up ? y - 24 : y + 34, lab, { sz: 13, c: "var(--ink)", w: 900 }) +
        pk(id, C(X(s), y, 11, { fill: tint("blue"), stroke: col("blue"), sw: 3 }));
    });
    b += T(250, 160, "each tick is about 10× to 100× the one before: the scale is logarithmic", {
      sz: 12,
      c: "var(--text-faint)",
    });
    return SVG(500, 172, b, "A logarithmic ruler of times from one second to one year");
  })();

  // 4. inserting at the front of a list
  const shiftFig = (() => {
    let b = arrowDef("xa-sh");
    [3, 4, 5].forEach((k, r) => {
      const y = 10 + r * 78,
        x0 = 150,
        cw = 44;
      b += T(14, y + 28, `${k} items already`, { a: "start", sz: 13, c: "var(--ink)", w: 900 });
      b +=
        R(x0, y, cw - 4, 38, { rx: 8, fill: tint("blue"), stroke: col("blue") }) +
        T(x0 + (cw - 4) / 2, y + 25, "new", { sz: 13, c: ink("blue"), w: 900 });
      for (let i = 0; i < k; i++) {
        b +=
          R(x0 + (i + 1) * cw, y, cw - 4, 38, { rx: 8 }) +
          T(x0 + (i + 1) * cw + (cw - 4) / 2, y + 25, String.fromCharCode(97 + i), {
            sz: 15,
            c: "var(--ink)",
            w: 900,
          }) +
          P(`M${x0 + i * cw + 12},${y + 54} L${x0 + (i + 1) * cw + 14},${y + 54}`, {
            stroke: col("amber"),
            sw: 2.5,
            mk: "xa-sh",
          });
      }
      b += T(x0 + (k + 1) * cw + 14, y + 29, `${k} moves`, { a: "start", sz: 13, c: ink("amber"), w: 900 });
    });
    return SVG(
      500,
      248,
      b,
      "Inserting at the front of lists with 3, 4 and 5 items: every old item moves one place right",
    );
  })();

  B.add("a1-bigo", [
    {
      type: "pick",
      q: "A program takes 5n² + 40n + 900 steps. Each bar splits its cost into the three pieces. Click the smallest input size where the n² piece is already more than half of the total.",
      fig: stackFig,
      a: "n20",
      why: "At n = 15 the n² piece is 1,125 of 2,625 steps (43%), still under half. At n = 20 it is 2,000 of 3,700 (54%). By n = 100 it is 91%. Big-O drops the 40n and 900 because their share keeps shrinking, but at small n the extra pieces still matter.",
    },
    {
      type: "pick",
      q: "Each grid shows where <code>work()</code> runs for n = 12: a blue cell at row i, column j means the inner loop does <code>work()</code> there. Click every grid whose total work is O(n²) as n grows.",
      fig: gridFig,
      a: ["b", "d", "e", "f"],
      why: "The full square, the triangle, every fourth column and the left half all grow with the area of the grid, which is a fixed fraction of n². Constants like ½ or ¼ do not change the class. The first column strip (range(3)) and the narrow diagonal band do a fixed number of cells per row, so they are O(n).",
    },
    {
      type: "pick",
      q: "A program does n² steps, and the computer manages 1,000,000 steps per second. For n = 1,000,000, where does its running time land on this ruler? Click the nearest tick.",
      fig: rulerFig,
      a: "wk",
      hint: "n² = 10¹² steps. 10¹² ÷ 10⁶ = 10⁶ seconds. A day is about 10⁵ seconds.",
      why: "A million squared is a million million steps. At a million per second that is a million seconds, about 12 days: nearest to 1 week. An O(n log n) version needs only about 20 million steps, which is 20 seconds. Same computer, same n, and the algorithm decides whether it takes seconds or weeks.",
    },
    {
      type: "slider",
      q: "You build a list of 2,000 items by calling <code>insert(0, x)</code> for each one. Each call shifts every item already in the list one place along. About how many item moves happen in total?",
      fig: shiftFig,
      min: 0,
      max: 4000000,
      step: 100000,
      ans: 2000000,
      tol: 500000,
      unit: " moves",
      hint: "The k-th insert moves k items. 1 + 2 + … + 2,000 is about half of 2,000 × 2,000.",
      why: "The picture shows each insert moves as many items as are already there. Adding 0 + 1 + 2 + … + 1,999 gives n(n − 1) ÷ 2, about 2 million moves: quadratic, even though the loop looks like a plain O(n) pass. <code>append</code> would cost one step per item instead.",
    },
  ]);
})();

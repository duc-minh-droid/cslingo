(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { arrow, circ, f1, ln, pk, simplexGains, simplexOpen, simplexSteps, simplexTableau, svg, table, txt } =
    partScope;
  const B = NIC.bank;

  B.add("a3-simplex", [
    {
      type: "pick",
      q: "Simplex ran on a maximising LP and the chart shows z after each pivot. A normal pivot moves to a corner with a bigger z. Click every pivot that changed the basis without improving z.",
      fig: simplexSteps(),
      a: ["2", "3"],
      why: "At pivots 2 and 3 the profit stays at 12, so the plan did not move. That is degeneracy: three or more constraints meet at the same corner, the ratio test ties (or gives 0), and a pivot swaps which variables are in the basis without leaving the corner. Simplex then continues and reaches 17 and 21. In theory a bad pivot rule could cycle on a degenerate corner, but in practice it escapes.",
    },
    {
      type: "pick",
      q: "A tableau is pivoted on the orange cell: x enters and s3 leaves. The gain row shows how much z rises per unit of each column, and RHS is the right-hand side. One entry in the new tableau is wrong. Click it.",
      fig: simplexTableau(),
      a: "s1-s3",
      hint: "Row operations: new s1 = old s1 − old s3 row, new s2 = old s2 − old s3 row, new gain = old gain − 3 × the x row.",
      why: "Subtract the pivot row (x s3 = 1, RHS 4) from the s1 row: the s3 entry goes from 0 to 0 − 1 = −1, not +1. The other entries check out: s1 row 0 1 1 0 −1 | 2, s2 row 0 3 0 1 −1 | 8, gain row 0 2 0 0 −3 | z = 12. A pivot must keep every row consistent, because each row is still the same equation.",
    },
    {
      type: "pick",
      q: "Simplex stands at a corner of a four-variable LP (maximising z) where x1, x2, x3 and x4 are all 0. Each bar shows how z changes per unit if that variable is raised. Click every variable that could enter the basis.",
      fig: simplexGains(),
      a: ["x1", "x3"],
      why: "Raising a variable only helps if its gain is positive, so x1 (+2) and x3 (+4) qualify. x2 (−3) would make z worse, and x4 (0) leaves z unchanged, so neither is a useful move. Dantzig's rule picks the largest, x3, but x1 would also be a valid choice. When no gain is positive, the corner is optimal.",
    },
    {
      type: "cat",
      q: "The green region is every legal plan: x ≥ 0, y ≥ 0 and y ≤ x + 1. It never ends towards the right. Each panel maximises a different objective, and the amber arrow points the way z grows. Does each LP have a best plan, or is it unbounded?",
      fig: simplexOpen(),
      buckets: ["Has a best plan", "Unbounded"],
      items: [
        ["Panel A: max x + y", 1],
        ["Panel B: max y − x", 0],
        ["Panel C: max x − y", 1],
        ["Panel D: max −x − y", 0],
      ],
      hint: "Ask whether z can keep rising along some direction the region allows, such as along the bottom edge (to the right) or up the slanting edge.",
      why: "A: moving right and up together raises x + y without limit. C: the arrow points down-right, but sliding right along the floor y = 0 still raises x − y forever. B: y − x never exceeds 1 inside the region, and the whole upper edge ties at 1. D: −x − y is largest at the origin (0). An LP is unbounded when some direction the region allows also improves z.",
    },
    {
      type: "bug",
      q: "leaving_row(rows, col) runs the ratio test for the entering column col. Each row ends with its right-hand side. It once chose a row whose entry in that column was negative and pushed the plan out of the feasible region. Click the faulty line.",
      code: [
        "def leaving_row(rows, col):",
        "    best, pick = None, None",
        "    for i, row in enumerate(rows):",
        "        if row[col] != 0:",
        "            r = row[-1] / row[col]",
        "            if best is None or r < best:",
        "                best, pick = r, i",
        "    return pick",
      ],
      a: 3,
      why: "A negative entry means raising the entering variable makes that row's slack grow, so that constraint never stops you and it must be ignored. Only rows with a positive entry limit the step, so the test should be row[col] > 0. Keeping a negative ratio would also pick a row that gives a negative step.",
    },
  ]);

  /* =====================================================================
     a3-bracket
     ===================================================================== */
  const PHI = (Math.sqrt(5) - 1) / 2;
  // bracket width against function evaluations: golden section against splitting into thirds
  function bracketRace() {
    const X = (e) => 50 + e * 25,
      Y = (w) => 206 - w * 160;
    const gold = (e) => (e < 2 ? 1 : Math.pow(PHI, e - 2)),
      third = (e) => Math.pow(2 / 3, Math.floor(e / 2));
    let s = "";
    for (let w = 0; w <= 1.001; w += 0.25)
      s +=
        ln(X(0), Y(w), X(14), Y(w), "var(--line)", 1.5) +
        txt(X(0) - 8, Y(w) + 4, f1(w), { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    for (let e = 0; e <= 14; e += 2) s += txt(X(e), Y(0) + 17, e, { s: 11, w: 700, c: "var(--text-faint)" });
    s +=
      txt(X(7), Y(0) + 36, "function evaluations so far", { s: 12, w: 700, c: "var(--text-dim)" }) +
      txt(X(0) - 4, 16, "bracket width", { a: "start", s: 12, c: "var(--text-dim)" });
    const path = (fn) => Array.from({ length: 15 }, (_, e) => `${X(e)},${Y(fn(e))}`).join(" ");
    s += pk(
      "A",
      `<polyline points="${path(third)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>` +
        `<polyline points="${path(third)}" fill="none" stroke="transparent" stroke-width="22"/>` +
        circ(X(10), Y(third(10)) - 16, 12, "var(--panel)", "var(--blue)") +
        txt(X(10), Y(third(10)) - 12, "A", { s: 13, c: "var(--ink)" }),
    );
    s += pk(
      "B",
      `<polyline points="${path(gold)}" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linejoin="round"/>` +
        `<polyline points="${path(gold)}" fill="none" stroke="transparent" stroke-width="22"/>` +
        circ(X(6), Y(gold(6)) - 18, 12, "var(--panel)", "var(--amber)") +
        txt(X(6), Y(gold(6)) - 14, "B", { s: 13, c: "var(--ink)" }),
    );
    return svg(420, 262, s);
  }
  // worked golden-section trace on f(x) = (x - 3)^2 with one wrong "keeps" cell
  function bracketTrace() {
    let a = 0,
      b = 8;
    const f = (x) => (x - 3) * (x - 3),
      r2 = (v) => v.toFixed(2),
      rows = [["", "bracket [a, b]", "c", "d", "f(c)", "f(d)", "keeps"]];
    for (let i = 1; i <= 4; i++) {
      const c = b - PHI * (b - a),
        d = a + PHI * (b - a),
        fc = f(c),
        fd = f(d);
      let keep = fc < fd ? [a, d] : [c, b];
      if (i === 3) keep = fc < fd ? [c, b] : [a, d]; // the planted slip
      rows.push([String(i), `[${r2(a)}, ${r2(b)}]`, r2(c), r2(d), r2(fc), r2(fd), `[${r2(keep[0])}, ${r2(keep[1])}]`]);
      [a, b] = keep;
    }
    const cols = [30, 112, 50, 50, 52, 52, 112],
      rh = 34;
    let s = table(6, 6, cols, rh, [rows[0]], { s: 12.5 });
    for (let i = 1; i < rows.length; i++)
      s += pk("r" + i, table(6, 6 + i * rh, cols, rh, [rows[i]], { head: false, s: 12.5 }));
    s += txt(230, 6 + 5 * rh + 18, "Each row starts from the bracket the row above kept.", {
      s: 12,
      w: 700,
      c: "var(--text-dim)",
    });
    return svg(470, 6 + 5 * rh + 28, s);
  }
  // live number line for the new probe
  const bracketLive = (v) => {
    const X = (t) => 24 + t * 372;
    let s =
      `<rect x="${X(0.382)}" y="38" width="${X(1) - X(0.382)}" height="26" rx="8" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2.5"/>` +
      ln(X(0), 51, X(1), 51, "var(--ink)", 2.5);
    [
      [0, "a = 0"],
      [1, "b = 1"],
    ].forEach(
      ([t, l]) => (s += ln(X(t), 41, X(t), 61, "var(--ink)", 3) + txt(X(t), 86, l, { s: 12, c: "var(--text-dim)" })),
    );
    s +=
      circ(X(0.382), 51, 8, "var(--panel)", "var(--blue)") +
      txt(X(0.382), 24, "old c = 0.382", { s: 12, c: "var(--blue-ink)" });
    s +=
      circ(X(0.618), 51, 8, "var(--panel)", "var(--blue)") +
      txt(X(0.618), 24, "old d = 0.618 (reused)", { s: 12, c: "var(--blue-ink)" });
    s +=
      `<circle cx="${X(v)}" cy="51" r="10" fill="var(--amber)" stroke="var(--ink)" stroke-width="2.5"/>` +
      txt(X(v), 108, `new probe at ${f1(v)}`, { s: 13, c: "var(--amber-ink)" });
    return svg(420, 118, s);
  };
  // function values at a, c, d, b and the three pieces
  function bracketTie() {
    const X = (t) => 30 + t * 360,
      base = 138,
      k = 16;
    let s = ln(X(0), base, X(1), base, "var(--ink)", 2.5);
    [
      [0, "a", 6],
      [0.382, "c", 2],
      [0.618, "d", 2],
      [1, "b", 5],
    ].forEach(([t, n, v]) => {
      s +=
        `<rect x="${X(t) - 11}" y="${base - v * k}" width="22" height="${v * k}" rx="4" fill="var(--blue)"/>` +
        txt(X(t), base - v * k - 7, v, { s: 13, c: "var(--ink)" }) +
        txt(X(t), base + 16, n, { s: 14, c: "var(--ink)" });
    });
    [
      [0, 0.382, "L", "left piece", "var(--violet)"],
      [0.382, 0.618, "M", "middle", "var(--amber)"],
      [0.618, 1, "R", "right piece", "var(--violet)"],
    ].forEach(([t0, t1, , lab, col]) => {
      s +=
        `<rect x="${X(t0) + 3}" y="${base + 26}" width="${X(t1) - X(t0) - 6}" height="12" rx="6" fill="${col}"/>` +
        txt((X(t0) + X(t1)) / 2, base + 58, lab, { s: 12, c: "var(--text-dim)" });
    });
    s += txt(14, 14, "f at each point", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(420, 210, s);
  }
  // four candidate functions on [0, 1]
  function bracketCurves() {
    const fs = {
      a: (x) => 3 * (x - 0.45) * (x - 0.45) + 0.1,
      b: (x) => 1.2 * Math.abs(x - 0.65) + 0.05,
      c: (x) => 0.55 + 0.3 * Math.sin(15 * x),
      d: (x) => 40 * Math.pow((x - 0.25) * (x - 0.75), 2),
    };
    let s = "";
    ["a", "b", "c", "d"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208,
        y0 = 4 + Math.floor(i / 2) * 136,
        fn = fs[k];
      let lo = 1e9,
        hi = -1e9;
      for (let j = 0; j <= 100; j++) {
        const v = fn(j / 100);
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
      const P = (t) => `${x0 + 18 + t * 164},${y0 + 104 - ((fn(t) - lo) / (hi - lo)) * 70}`;
      let g = `<rect x="${x0}" y="${y0}" width="200" height="128" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      g += `<polyline points="${Array.from({ length: 101 }, (_, j) => P(j / 100)).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
      g += txt(x0 + 14, y0 + 20, k.toUpperCase(), { a: "start", s: 14, c: "var(--text-dim)" });
      s += pk(k, g);
    });
    return svg(420, 272, s);
  }

  B.add("a3-bracket", [
    {
      type: "pick",
      q: "Two methods shrink a bracket of width 1 around a minimum. Thirds search evaluates two new points every step and keeps 2/3 of the bracket. Golden-section search evaluates two points at the start, then one new point per step, and keeps 0.618 of the bracket. The chart plots bracket width against the evaluations of f so far. Click the golden-section line.",
      fig: bracketRace(),
      a: "B",
      why: "Line B is golden-section. It stays flat for the first two evaluations (it needs two probes before it can cut anything), but then each single new evaluation cuts the width to 0.618 of what it was. After 12 evaluations B is about 0.008, while thirds search (A) is only down to 0.088. Reusing one probe per step is what makes golden-section cheap.",
    },
    {
      type: "pick",
      q: "A student worked golden-section search by hand to minimise f(x) = (x − 3)² on [0, 8], listing the probes, their f values and the bracket each step keeps. One row keeps the wrong piece. Click it.",
      fig: bracketTrace(),
      a: "r3",
      hint: "In each row compare f(c) with f(d). Keep [a, d] when f(c) is smaller and [c, b] when f(d) is smaller.",
      why: "In row 3, f(c) = 0.00 is smaller than f(d) = 0.60, so the minimum cannot lie beyond d and the search must keep [a, d] = [1.89, 3.78]. The row keeps [3.06, 4.94] instead, which throws away the true minimum at x = 3. The next rows then search in the wrong place.",
    },
    {
      type: "slider",
      min: 0.4,
      max: 1,
      step: 0.01,
      start: 0.5,
      ans: 0.76,
      tol: 0.025,
      q: "A golden-section search on [0, 1] probed c = 0.382 and d = 0.618 and found f(c) > f(d), so it keeps [0.382, 1]. The old probe d is reused as one new probe. Slide the marker to where the other new probe goes.",
      live: bracketLive,
      hint: "The new probes sit 38.2% and 61.8% of the way along the kept piece, which is 0.618 wide. 0.618 × 0.618 is about 0.38.",
      why: "The kept piece is [0.382, 1], width 0.618. Its 38.2% point is 0.382 + 0.382 × 0.618 = 0.618, which is exactly the old d, so no new evaluation is needed. Its 61.8% point is 0.382 + 0.618 × 0.618 ≈ 0.764. That is the only new probe. This reuse is the whole trick of the golden ratio.",
    },
    {
      type: "cat",
      q: "f is unimodal on [a, b]. Golden-section search probes c and d and gets equal values, shown in the bars. Sort each piece of the bracket.",
      fig: bracketTie(),
      buckets: ["Can be discarded", "Must be kept"],
      items: [
        ["Left piece [a, c]", 0],
        ["Middle piece [c, d]", 1],
        ["Right piece [d, b]", 0],
      ],
      why: "Equal values at c and d mean c and d sit on opposite sides of the dip, so the minimum lies between them, in the middle piece. Both outer pieces are safe to throw away. A real implementation discards just one (either) and carries on, because the next step re-probes the smaller bracket.",
    },
    {
      type: "pick",
      q: "Golden-section search on [0, 1] is only guaranteed to find the minimum if f goes down once and up once. Click every function it is guaranteed to work on.",
      fig: bracketCurves(),
      a: ["a", "b"],
      why: "A is a smooth bowl and B is a V with a sharp kink. Both are unimodal, and golden-section only compares function values, so it does not need a derivative and the kink is no problem. C has three dips and D has two, so a comparison of two probes can send the bracket into the wrong dip.",
    },
  ]);

  /* =====================================================================
     a3-nm
     ===================================================================== */
  // contour map f = (x - 5)^2 + (y - 3)^2 with triangle ABC and three reflected candidates
  function nmContours() {
    const u = 34,
      X = (x) => 30 + u * x,
      Y = (y) => 262 - u * y;
    let s = "";
    [
      [1, "f = 1"],
      [2, "f = 4"],
      [3, "f = 9"],
      [4, "f = 16"],
    ].forEach(([r, l]) => {
      s += `<circle cx="${X(5)}" cy="${Y(3)}" r="${r * u}" fill="none" stroke="var(--line-2)" stroke-width="2"/>`;
      const a = (-28 * Math.PI) / 180,
        tx = X(5) + r * u * Math.cos(a),
        ty = Y(3) - r * u * Math.sin(a);
      s +=
        `<rect x="${tx - 24}" y="${ty - 10}" width="48" height="19" rx="7" fill="var(--panel)"/>` +
        txt(tx, ty + 4, l, { s: 11.5, w: 800, c: "var(--text-dim)" });
    });
    s +=
      `<path d="M${X(5)},${Y(3) - 9} l2.6,6 6.4,.5 -4.8,4.2 1.5,6.3 -5.7,-3.3 -5.7,3.3 1.5,-6.3 -4.8,-4.2 6.4,-.5z" fill="var(--amber)"/>` +
      txt(X(5), Y(3) + 26, "minimum", { s: 11.5, c: "var(--amber-ink)" });
    const T = { A: [2, 5], B: [3, 2.5], C: [4.5, 4.5] };
    s += `<polygon points="${Object.values(T)
      .map(([x, y]) => `${X(x)},${Y(y)}`)
      .join(
        " ",
      )}" fill="var(--violet-dim)" fill-opacity=".75" stroke="var(--violet)" stroke-width="3" stroke-linejoin="round"/>`;
    const cand = {
      P: [
        [3, 2.5],
        [3.5, 7],
      ],
      Q: [
        [2, 5],
        [5.5, 2],
      ],
      S: [
        [4.5, 4.5],
        [0.5, 3],
      ],
    };
    Object.entries(cand).forEach(([k, [from, to]]) => {
      s += arrow(
        X(from[0]),
        Y(from[1]),
        X(to[0]) - (X(to[0]) - X(from[0])) * 0.06,
        Y(to[1]) - (Y(to[1]) - Y(from[1])) * 0.06,
        "var(--text-faint)",
        2,
      );
    });
    Object.entries(T).forEach(
      ([k, [x, y]]) =>
        (s +=
          circ(X(x), Y(y), 11, "var(--panel)", "var(--violet)") + txt(X(x), Y(y) + 5, k, { s: 13, c: "var(--ink)" })),
    );
    Object.entries(cand).forEach(
      ([k, [, to]]) =>
        (s += pk(
          k,
          circ(X(to[0]), Y(to[1]), 14, "var(--panel)", "var(--blue)") +
            txt(X(to[0]), Y(to[1]) + 5, k, { s: 13, c: "var(--ink)" }),
        )),
    );
    return svg(400, 300, s);
  }
  // four moves drawn as before (grey dashed) and after (green)
  function nmMoves() {
    const Bs = [4, 1],
      Md = [5, 3.5],
      W = [1.5, 3],
      M = [(Bs[0] + Md[0]) / 2, (Bs[1] + Md[1]) / 2];
    const refl = [2 * M[0] - W[0], 2 * M[1] - W[1]],
      expd = [3 * M[0] - 2 * W[0], 3 * M[1] - 2 * W[1]],
      cont = [M[0] + 0.5 * (W[0] - M[0]), M[1] + 0.5 * (W[1] - M[1])];
    const shr = [
      Bs,
      [Bs[0] + 0.5 * (Md[0] - Bs[0]), Bs[1] + 0.5 * (Md[1] - Bs[1])],
      [Bs[0] + 0.5 * (W[0] - Bs[0]), Bs[1] + 0.5 * (W[1] - Bs[1])],
    ];
    const moves = { A: [Bs, Md, cont], B: [Bs, Md, refl], C: shr, D: [Bs, Md, expd] };
    let s = "";
    ["A", "B", "C", "D"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208,
        y0 = 4 + Math.floor(i / 2) * 138,
        ox = x0 + 14,
        oy = y0 + 112,
        u = 15;
      const pts = (T) => T.map(([x, y]) => `${ox + x * u},${oy - y * u}`).join(" ");
      s += `<rect x="${x0}" y="${y0}" width="200" height="130" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      s += `<polygon points="${pts([Bs, Md, W])}" fill="none" stroke="var(--text-faint)" stroke-width="2.5" stroke-dasharray="6 5" stroke-linejoin="round"/>`;
      s += `<polygon points="${pts(moves[k])}" fill="var(--teal-dim)" fill-opacity=".8" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>`;
      s +=
        circ(ox + W[0] * u, oy - W[1] * u, 6, "var(--rose)", "var(--rose)", 1) +
        txt(x0 + 14, y0 + 22, k, { a: "start", s: 15, c: "var(--text-dim)" });
    });
    return svg(420, 280, s);
  }
  // best / middle / worst corner values over iterations (no shrink moves); one point is impossible
  function nmLines() {
    const best = [4, 4, 3, 3, 3.6, 3.6],
      mid = [7, 7, 4, 4, 4, 4],
      worst = [11, 9, 7, 6, 5, 4.6];
    const X = (k) => 56 + k * 62,
      Y = (v) => 214 - v * 16;
    let s = "";
    for (let v = 2; v <= 12; v += 2)
      s +=
        ln(X(0), Y(v), X(5), Y(v), "var(--line)", 1.5) +
        txt(X(0) - 12, Y(v) + 4, v, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    for (let k = 0; k <= 5; k++) s += txt(X(k), Y(2) + 18, k, { s: 11, w: 700, c: "var(--text-faint)" });
    const line = (arr, col) =>
      `<polyline points="${arr.map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linejoin="round"/>`;
    s += line(worst, "var(--amber)") + line(mid, "var(--blue)") + line(best, "var(--teal)");
    best.forEach((v, k) => {
      s +=
        k === 0
          ? circ(X(k), Y(v), 7, "var(--teal)", "var(--teal)", 1)
          : pk(
              String(k),
              circ(X(k), Y(v), 12, "var(--panel)", "var(--teal)") + txt(X(k), Y(v) + 4, k, { s: 12, c: "var(--ink)" }),
            );
    });
    [
      ["best", "var(--teal)", 70],
      ["middle", "var(--blue)", 160],
      ["worst", "var(--amber)", 260],
    ].forEach(
      ([l, c, x]) => (s += ln(x - 26, 14, x - 8, 14, c, 4) + txt(x - 2, 18, l, { a: "start", s: 12, c: "var(--ink)" })),
    );
    s += txt(X(2.5), Y(2) + 36, "iteration", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 262, s);
  }
  Object.assign(partScope, { nmContours, nmLines, nmMoves });
})();

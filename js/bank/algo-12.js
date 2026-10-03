/* ===== bank-v-algo-2.js ===== */
/* ALGO revision bank, visual and varied questions, part 2.
   Modules: a3-simplex, a3-bracket, a3-nm, a4-cut, a4-mst, a5-orient, a5-wrap, a5-graham.
   Figures are inline SVG built here; every number was checked against a script that runs the real algorithm. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const B = NIC.bank;
  const txt = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tail = (s, extra) => s.replace(/<\/svg>$/, extra + "</svg>");
  const uid = () => "m" + Math.random().toString(36).slice(2, 7);
  /* a maths plane (y up) with a light grid. Returns X, Y mappers and the grid markup */
  function plane(xmax, ymax, w, h) {
    const x0 = 44,
      y0 = h - 26,
      X = (x) => x0 + (x * (w - x0 - 12)) / xmax,
      Y = (y) => y0 - (y * (y0 - 12)) / ymax;
    let g = "";
    for (let i = 0; i <= xmax; i++)
      g +=
        `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(ymax)}" stroke="var(--line)"/>` +
        txt(X(i), Y(0) + 16, i, { w: 700, s: 11, c: "var(--text-faint)" });
    for (let j = 0; j <= ymax; j++)
      g +=
        `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(xmax)}" y2="${Y(j)}" stroke="var(--line)"/>` +
        txt(X(0) - 14, Y(j) + 4, j, { a: "end", w: 700, s: 11, c: "var(--text-faint)" });
    return { X, Y, g };
  }
  const dot = (cx, cy, label, o = {}) =>
    `<g ${o.id ? `data-pick="${o.id}"` : ""}><circle cx="${cx}" cy="${cy}" r="${o.r || 11}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="3" ${o.dash ? 'stroke-dasharray="4 3"' : ""}/>${txt(cx, cy + 4, label, { s: o.s || 12, c: o.tc || "var(--ink)", w: 900 })}</g>`;
  const chip = (s, c) =>
    `<span style="display:inline-block;border:2px solid var(--line);border-radius:10px;padding:2px 9px;margin:2px 3px 2px 0;font-weight:800;background:var(--panel)">${s}${c !== undefined ? ` <span style="color:var(--amber-ink)">${c}</span>` : ""}</span>`;

  /* ---------- shared figures ---------- */
  // LP: maximise with x + y <= 7, x <= 4, y <= 5. Corners O A B C D.
  function region(opts = {}) {
    const X = (x) => 44 + x * 50,
      Y = (y) => 244 - y * 36;
    const P = { O: [0, 0], A: [4, 0], B: [4, 3], C: [2, 5], D: [0, 5] };
    let s = "";
    for (let i = 0; i <= 6; i++)
      s +=
        `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(6)}" stroke="var(--line)"/>` +
        txt(X(i), Y(0) + 16, i, { w: 700, s: 11, c: "var(--text-faint)" });
    for (let j = 0; j <= 6; j++)
      s +=
        `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(6)}" y2="${Y(j)}" stroke="var(--line)"/>` +
        txt(X(0) - 9, Y(j) + 4, j, { a: "end", w: 700, s: 11, c: "var(--text-faint)" });
    s += `<polygon points="${Object.values(P)
      .map(([x, y]) => `${X(x)},${Y(y)}`)
      .join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>`;
    s +=
      txt(X(4) + 10, Y(5.75), "x ≤ 4", { a: "start", c: "var(--blue-ink)" }) +
      txt(X(4.2), Y(4.2), "x + y ≤ 7", { a: "start", c: "var(--blue-ink)" }) +
      txt(X(4.15), Y(5) + 4, "y ≤ 5", { a: "start", c: "var(--blue-ink)" });
    s +=
      txt(X(6) + 14, Y(0) + 4, "x", { a: "start", c: "var(--text-dim)" }) +
      txt(X(0) + 8, Y(6) - 2, "y", { a: "start", c: "var(--text-dim)" });
    s += Object.entries(P)
      .map(([k, [x, y]]) => dot(X(x), Y(y), k, { id: opts.pick ? k : "", r: 13, s: 13 }))
      .join("");
    return svg(400, 262, s);
  }

  // ladder graph used by the MST questions
  const LN = { A: [60, 50], B: [200, 50], C: [340, 50], D: [60, 200], E: [200, 200], F: [340, 200] };
  const LE = [
    ["A", "B", 3],
    ["B", "C", 2],
    ["A", "D", 1],
    ["B", "E", 6],
    ["C", "F", 4],
    ["D", "E", 5],
    ["E", "F", 7],
  ];
  // graph used by the cut / cycle questions
  const CN = { A: [60, 50], B: [60, 230], C: [160, 120], D: [310, 60], E: [310, 200], F: [410, 130] };
  const CE = [
    ["A", "B", 4],
    ["A", "C", 2],
    ["B", "C", 5],
    ["B", "D", 7],
    ["C", "D", 3],
    ["C", "E", 8],
    ["D", "E", 6],
    ["D", "F", 9],
    ["E", "F", 1],
  ];

  /* =====================================================================
     a3-simplex
     ===================================================================== */
  B.add("a3-simplex", [
    {
      type: "pick",
      q: "Maximise z = 4x + 3y subject to the three limits drawn, with x, y ≥ 0. Simplex starts at O, and Dantzig's rule picks x to enter (4 beats 3). Click the corner where this first pivot stops.",
      fig: region({ pick: true }),
      a: "A",
      why: "Raise x with y fixed at 0. The limit x ≤ 4 stops it at x = 4, while x + y ≤ 7 would only stop it at x = 7. The smallest limit wins, so simplex lands on A (4, 0) and z becomes 16.",
    },
    {
      type: "pick",
      q: "Same feasible region, but the objective changes to z = x + 5y, so one step up now earns five times what one step right earns. Click the corner that is now optimal.",
      fig: region({ pick: true }),
      a: "C",
      hint: "Work out x + 5y at the corners that are high up: B is 4 + 15, C is 2 + 25, D is 0 + 25.",
      why: "Corner values are O = 0, A = 4, B = 19, C = 27, D = 25. When y is worth more, the best corner tilts towards the top, and C (2, 5) wins. The region did not change, only the direction of gain.",
    },
    {
      type: "cat",
      q: "Each card is the state of a simplex tableau (maximising). Decide what simplex does next.",
      buckets: ["Pivot again", "Stop: optimal", "Stop: unbounded"],
      items: [
        ["Gain row: x is +3, y is 0, slack is −1. The x column has positive entries in the constraint rows.", 0],
        ["Gain row: x is 0, y is −2, slack is −1.", 1],
        ["Gain row: y is +2, but y's column holds only 0 and negative entries in every constraint row.", 2],
        ["Gain row: x is +1, y is +4. Both columns have positive entries.", 0],
        ["Gain row: every entry is −3, −1 or 0.", 1],
        ["Gain row: slack is +5, and its column is −1, 0 and −3 in the constraint rows.", 2],
      ],
      why: "A positive gain with a positive entry to divide by means there is a direction to improve and a wall to stop at: pivot. No positive gain means no edge improves: optimal. A positive gain with no wall (no positive entries, so the ratio test has nothing to stop it) means z can grow forever: unbounded.",
    },
    {
      type: "pick",
      q: "Four constraint rows are shown, and x has just been chosen to enter. Click the row that leaves the basis, using the ratio test.",
      fig: svg(
        420,
        250,
        txt(40, 24, "Row", { c: "var(--text-dim)" }) +
          txt(150, 24, "x", { c: "var(--amber-ink)", s: 15 }) +
          txt(230, 24, "y", { c: "var(--text-dim)" }) +
          txt(340, 24, "right-hand side", { c: "var(--text-dim)" }) +
          [
            ["s1", 2, 1, 12],
            ["s2", -1, 2, 2],
            ["s3", 3, 1, 9],
            ["s4", 0, 1, 8],
          ]
            .map(
              ([r, a, b, c], i) =>
                `<g data-pick="${r}"><rect x="10" y="${34 + i * 38}" width="400" height="32" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(40, 55 + i * 38, r, { c: "var(--ink)" })}${txt(150, 55 + i * 38, a, { c: "var(--ink)" })}${txt(230, 55 + i * 38, b, { c: "var(--ink)" })}${txt(340, 55 + i * 38, c, { c: "var(--ink)" })}</g>`,
            )
            .join("") +
          txt(40, 214, "Gain", { c: "var(--amber-ink)" }) +
          txt(150, 214, "5", { c: "var(--amber-ink)" }) +
          txt(230, 214, "4", { c: "var(--amber-ink)" }) +
          txt(210, 238, "(slack columns left out to save space)", { s: 11, w: 700, c: "var(--text-faint)" }),
      ),
      a: "s3",
      hint: "Only rows with a positive number in the x column count. Divide right-hand side by that number: 12 ÷ 2 and 9 ÷ 3.",
      why: "s1 allows 12 ÷ 2 = 6 and s3 allows 9 ÷ 3 = 3. Row s2 has −1 in x's column, so raising x never hits that wall (it only moves further away), and s4 has 0, so it does not limit x either. The smallest valid ratio is s3's 3, so s3 leaves. The smallest right-hand side (s2's 2) is the tempting wrong answer.",
    },
    {
      type: "order",
      q: "Put one simplex pivot into the right order.",
      items: [
        "Read the gain row and choose the entering variable (largest positive gain)",
        "Divide each right-hand side by that column's positive entries",
        "The row with the smallest ratio is the leaving variable",
        "Row-reduce so the entering column becomes a single 1 in the leaving row",
        "Read the new gain row and stop if no entry is positive",
      ],
      why: "The entering variable fixes the column, the ratio test fixes the row, the row reduction moves to the new corner, and the new gain row tells you whether to go round again.",
    },
    {
      type: "bug",
      q: "pick_entering() chooses the entering variable for a maximisation problem. simplex_done() should return True only at the optimum. Click the faulty line.",
      code: [
        "def pick_entering(gain):",
        "    best = None",
        "    for j in range(len(gain)):",
        "        if gain[j] > 0 and (best is None or gain[j] > gain[best]):",
        "            best = j",
        "    return best",
        "def simplex_done(gain):",
        "    return all(g >= 0 for g in gain)",
      ],
      a: 7,
      why: "At the optimum no entry in the gain row is positive, so the test must be g <= 0. As written it would say 'done' when every gain is positive, which is exactly when there is the most room to improve z.",
    },
  ]);

  /* =====================================================================
     a3-bracket
     ===================================================================== */
  const BX = (x) => 40 + x * 440;
  const bi = (x) => 1 - 0.55 * Math.exp(-(((x - 0.25) / 0.15) ** 2)) - 0.9 * Math.exp(-(((x - 0.88) / 0.1) ** 2));
  const biY = (v) => 190 - (v - 0.05) * 150;
  const biPath = Array.from(
    { length: 101 },
    (_, i) => `${i ? "L" : "M"}${BX(i / 100).toFixed(1)} ${biY(bi(i / 100)).toFixed(1)}`,
  ).join(" ");
  B.add("a3-bracket", [
    {
      type: "pick",
      q: "Golden-section search is minimising an unimodal function on [a, b]. All it knows are the two probe values shown. Click the piece of the bracket it throws away.",
      fig: svg(
        520,
        170,
        `<line x1="${BX(0)}" y1="112" x2="${BX(1)}" y2="112" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>` +
          [
            ["L", 0, 0.382, "[a, c]"],
            ["M", 0.382, 0.618, "[c, d]"],
            ["R", 0.618, 1, "[d, b]"],
          ]
            .map(
              ([id, x1, x2, l]) =>
                `<g data-pick="${id}"><rect x="${BX(x1) + 2}" y="76" width="${BX(x2) - BX(x1) - 4}" height="68" rx="8" fill="var(--bg-2)" fill-opacity=".5" stroke="var(--line-2)" stroke-width="2" stroke-dasharray="5 4"/>${txt((BX(x1) + BX(x2)) / 2, 136, l, { c: "var(--text-dim)" })}</g>`,
            )
            .join("") +
          [
            ["a", 0],
            ["c", 0.382],
            ["d", 0.618],
            ["b", 1],
          ]
            .map(
              ([l, x]) =>
                `<circle cx="${BX(x)}" cy="112" r="6" fill="var(--blue)"/>${txt(BX(x), 162, l, { s: 14, c: "var(--ink)" })}`,
            )
            .join("") +
          `<rect x="${BX(0.382) - 46}" y="14" width="92" height="30" rx="9" fill="var(--panel)" stroke="var(--blue)" stroke-width="2"/>${txt(BX(0.382), 34, "f(c) = 2.9", { c: "var(--blue-ink)" })}` +
          `<rect x="${BX(0.618) - 46}" y="14" width="92" height="30" rx="9" fill="var(--panel)" stroke="var(--blue)" stroke-width="2"/>${txt(BX(0.618), 34, "f(d) = 2.1", { c: "var(--blue-ink)" })}`,
      ),
      a: "L",
      why: "f(d) is lower than f(c). An unimodal function that is already lower at d than at c must still be heading downhill beyond c, so the minimum cannot lie left of c. The search discards [a, c] and keeps [c, b], with d inside it.",
    },
    {
      type: "pick",
      q: "This function has TWO dips, so it is not unimodal. Golden-section search on [0, 1] probes at c and d with the values marked. Click the dip it will end up trapped in.",
      fig: svg(
        520,
        230,
        `<path d="${biPath}" fill="none" stroke="var(--teal)" stroke-width="3"/>` +
          [
            ["c", 0.382],
            ["d", 0.618],
          ]
            .map(
              ([l, x]) =>
                `<line x1="${BX(x)}" y1="30" x2="${BX(x)}" y2="200" stroke="var(--line-2)" stroke-dasharray="4 4"/><circle cx="${BX(x)}" cy="${biY(bi(x))}" r="6" fill="var(--blue)"/>` +
                txt(BX(x), 22, l, { s: 14, c: "var(--ink)" }),
            )
            .join("") +
          txt(BX(0.382) - 8, biY(bi(0.382)) - 12, "f(c) = 0.75", { a: "end", c: "var(--blue-ink)" }) +
          txt(BX(0.618) + 8, biY(bi(0.618)) - 12, "f(d) = 1.00", { a: "start", c: "var(--blue-ink)" }) +
          `<g data-pick="left"><circle cx="${BX(0.25)}" cy="${biY(bi(0.25)) + 4}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(BX(0.25), biY(bi(0.25)) + 8, "left", { s: 11, c: "var(--ink)", w: 900 })}</g>` +
          `<g data-pick="right"><circle cx="${BX(0.88)}" cy="${biY(bi(0.88)) - 4}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(BX(0.88), biY(bi(0.88)), "right", { s: 11, c: "var(--ink)", w: 900 })}</g>` +
          txt(BX(0), 218, "a = 0", { c: "var(--text-dim)" }) +
          txt(BX(1), 218, "b = 1", { c: "var(--text-dim)" }),
      ),
      a: "left",
      why: "f(c) is lower than f(d), so the search keeps [a, d] = [0, 0.618] and throws away the right-hand end, which is where the deeper dip is. Every later step shrinks inside that bracket, so it settles in the shallow left dip. The method only compares two numbers, so it cannot see a dip it has discarded. That is why it needs one dip only.",
    },
    {
      type: "order",
      q: "Put one golden-section step in order.",
      items: [
        "Place two interior probes at 38.2% and 61.8% of the bracket",
        "Compare the two function values",
        "Discard the outer piece beyond the worse probe",
        "Keep the surviving probe, which is already in a golden position of the new bracket",
        "Evaluate f at just one new probe",
        "Repeat until the bracket is narrower than the tolerance",
      ],
      why: "Comparing the probes decides which end to cut. Because of the golden ratio the surviving probe is reused, so every step after the first needs just one new evaluation.",
    },
    {
      type: "bug",
      q: "This golden-section code minimises f on [a, b]. It sometimes returns a point that is clearly not the minimum. Click the faulty line.",
      code: [
        "def golden(f, a, b, tol):",
        "    while b - a > tol:",
        "        c = a + 0.382 * (b - a)",
        "        d = a + 0.618 * (b - a)",
        "        if f(c) < f(d):",
        "            b = d",
        "        else:",
        "            a = d",
        "    return (a + b) / 2",
      ],
      a: 7,
      why: "If f(c) is not lower than f(d), the minimum cannot be left of c, so the new bracket is [c, b]. Writing a = d also throws away the stretch between c and d, which can hold the minimum. The line should be a = c.",
    },
    {
      type: "cat",
      q: "Probe values come back for c < d. Which piece does the search keep?",
      buckets: ["Keep [a, d] (left part)", "Keep [c, b] (right part)"],
      items: [
        ["Minimising: f(c) = 4, f(d) = 9", 0],
        ["Minimising: f(c) = 12, f(d) = 5", 1],
        ["Maximising: f(c) = 4, f(d) = 9", 1],
        ["Maximising: f(c) = 3.5, f(d) = 2.5", 0],
        ["Minimising: f(c) = 30, f(d) = 29", 1],
        ["Maximising: f(c) = 8, f(d) = 20", 1],
      ],
      why: "Minimising: keep the side of the lower probe. Maximising flips it: keep the side of the higher probe. Here the closeness of 30 and 29 doesn't matter, only which is lower.",
    },
    {
      type: "mcq",
      q: "A student's 'golden-section' code logs the bracket width after each step. What does the log suggest?",
      fig: `<div style="margin:6px 0">${["10", "7", "4.9", "3.43", "2.4"].map((w, i) => chip(`step ${i}: ${w}`)).join("")}</div>`,
      o: [
        "The probes sit near 30% and 70% of the bracket, not at 38.2% and 61.8%",
        "The function has two dips, so the bracket cannot shrink any faster",
        "The tolerance is too tight, which slows each step by a fixed amount",
        "One probe is reused each step, which cuts the shrink rate in half",
      ],
      a: 0,
      hint: "7 ÷ 10 = 0.7 and 4.9 ÷ 7 = 0.7. A golden run would multiply by about 0.62 each step.",
      why: "Every step multiplies the width by 0.7. With probes at 30% and 70% you keep 70% of the bracket, which is slower than golden section's 0.618 (10, 6.18, 3.82, 2.36 ...). The rate is set by where the probes are, not by the function or the tolerance.",
    },
  ]);

  /* =====================================================================
     a3-nm
     ===================================================================== */
  function nmPlane() {
    const p = plane(9, 8, 400, 290),
      { X, Y } = p;
    const T = { A: [1, 1, 29], B: [5, 1, 5], C: [3, 5, 13] };
    let s =
      p.g +
      `<polygon points="${Object.values(T)
        .map(([x, y]) => `${X(x)},${Y(y)}`)
        .join(" ")}" fill="var(--violet)" fill-opacity=".12" stroke="var(--violet)" stroke-width="2.5"/>`;
    s += Object.entries(T)
      .map(
        ([k, [x, y, v]]) =>
          dot(X(x), Y(y), k, { fill: "var(--violet)", stroke: "var(--violet)", tc: "#fff" }) +
          txt(X(x) + (k === "C" ? 16 : 0), Y(x === 3 ? y : y) + (k === "C" ? 5 : 30), `f = ${v}`, {
            a: k === "C" ? "start" : "middle",
            s: 12,
            c: "var(--violet-ink)",
          }),
      )
      .join("");
    s += [
      ["P", 7, 5],
      ["Q", 4, 3],
      ["R", 1, 5],
      ["S", 7, 1],
    ]
      .map(([k, x, y]) => dot(X(x), Y(y), k, { id: k, dash: true }))
      .join("");
    return svg(400, 290, s);
  }
  Object.assign(partScope, { CE, CN, LE, LN, chip, dot, nmPlane, plane, svg, tail, txt, uid });
})();

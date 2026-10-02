/* ALGO revision bank, visual and varied questions, part 2.
   Modules: a3-simplex, a3-bracket, a3-nm, a4-cut, a4-mst, a5-orient, a5-wrap, a5-graham.
   Figures are inline SVG built here; every number was checked against a script that runs the real algorithm. */
(function () {
  const B = NIC.bank;
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tail = (s, extra) => s.replace(/<\/svg>$/, extra + "</svg>");
  const uid = () => "m" + Math.random().toString(36).slice(2, 7);
  /* a maths plane (y up) with a light grid. Returns X, Y mappers and the grid markup */
  function plane(xmax, ymax, w, h) {
    const x0 = 30, y0 = h - 26, X = (x) => x0 + (x * (w - x0 - 12)) / xmax, Y = (y) => y0 - (y * (y0 - 12)) / ymax;
    let g = "";
    for (let i = 0; i <= xmax; i++) g += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(ymax)}" stroke="var(--line)"/>` + txt(X(i), Y(0) + 16, i, { w: 700, s: 11, c: "var(--text-faint)" });
    for (let j = 0; j <= ymax; j++) g += `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(xmax)}" y2="${Y(j)}" stroke="var(--line)"/>` + txt(X(0) - 9, Y(j) + 4, j, { a: "end", w: 700, s: 11, c: "var(--text-faint)" });
    return { X, Y, g };
  }
  const dot = (cx, cy, label, o = {}) => `<g ${o.id ? `data-pick="${o.id}"` : ""}><circle cx="${cx}" cy="${cy}" r="${o.r || 11}" fill="${o.fill || "var(--panel)"}" stroke="${o.stroke || "var(--line-2)"}" stroke-width="3" ${o.dash ? 'stroke-dasharray="4 3"' : ""}/>${txt(cx, cy + 4, label, { s: o.s || 12, c: o.tc || "var(--ink)", w: 900 })}</g>`;
  const chip = (s, c) => `<span style="display:inline-block;border:2px solid var(--line);border-radius:10px;padding:2px 9px;margin:2px 3px 2px 0;font-weight:800;background:var(--panel)">${s}${c !== undefined ? ` <span style="color:var(--amber-ink)">${c}</span>` : ""}</span>`;
  const G = NIC.qfig.graph;

  /* ---------- shared figures ---------- */
  // LP: maximise with x + y <= 7, x <= 4, y <= 5. Corners O A B C D.
  function region(opts = {}) {
    const X = (x) => 44 + x * 50, Y = (y) => 244 - y * 36;
    const P = { O: [0, 0], A: [4, 0], B: [4, 3], C: [2, 5], D: [0, 5] };
    let s = "";
    for (let i = 0; i <= 6; i++) s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(6)}" stroke="var(--line)"/>` + txt(X(i), Y(0) + 16, i, { w: 700, s: 11, c: "var(--text-faint)" });
    for (let j = 0; j <= 6; j++) s += `<line x1="${X(0)}" y1="${Y(j)}" x2="${X(6)}" y2="${Y(j)}" stroke="var(--line)"/>` + txt(X(0) - 9, Y(j) + 4, j, { a: "end", w: 700, s: 11, c: "var(--text-faint)" });
    s += `<polygon points="${Object.values(P).map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>`;
    s += txt(X(4) + 10, Y(5.75), "x ≤ 4", { a: "start", c: "var(--blue-ink)" }) + txt(X(4.2), Y(4.2), "x + y ≤ 7", { a: "start", c: "var(--blue-ink)" }) + txt(X(4.15), Y(5) + 4, "y ≤ 5", { a: "start", c: "var(--blue-ink)" });
    s += txt(X(6) - 2, Y(0) + 16, "x", { a: "end", c: "var(--text-dim)" }) + txt(X(0) + 8, Y(6) - 2, "y", { a: "start", c: "var(--text-dim)" });
    s += Object.entries(P).map(([k, [x, y]]) => dot(X(x), Y(y), k, { id: opts.pick ? k : "", r: 13, s: 13 })).join("");
    return svg(400, 262, s);
  }

  // ladder graph used by the MST questions
  const LN = { A: [60, 50], B: [200, 50], C: [340, 50], D: [60, 200], E: [200, 200], F: [340, 200] };
  const LE = [["A", "B", 3], ["B", "C", 2], ["A", "D", 1], ["B", "E", 6], ["C", "F", 4], ["D", "E", 5], ["E", "F", 7]];
  // graph used by the cut / cycle questions
  const CN = { A: [60, 50], B: [60, 230], C: [160, 120], D: [310, 60], E: [310, 200], F: [410, 130] };
  const CE = [["A", "B", 4], ["A", "C", 2], ["B", "C", 5], ["B", "D", 7], ["C", "D", 3], ["C", "E", 8], ["D", "E", 6], ["D", "F", 9], ["E", "F", 1]];

  /* =====================================================================
     a3-simplex
     ===================================================================== */
  B.add("a3-simplex", [
    { type: "pick",
      q: "Maximise z = 4x + 3y subject to the three limits drawn, with x, y ≥ 0. Simplex starts at O, and Dantzig's rule picks x to enter (4 beats 3). Click the corner where this first pivot stops.",
      fig: region({ pick: true }), a: "A",
      why: "Raise x with y fixed at 0. The limit x ≤ 4 stops it at x = 4, while x + y ≤ 7 would only stop it at x = 7. The smallest limit wins, so simplex lands on A (4, 0) and z becomes 16." },
    { type: "pick",
      q: "Same feasible region, but the objective changes to z = x + 5y, so one step up now earns five times what one step right earns. Click the corner that is now optimal.",
      fig: region({ pick: true }), a: "C", hint: "Work out x + 5y at the corners that are high up: B is 4 + 15, C is 2 + 25, D is 0 + 25.",
      why: "Corner values are O = 0, A = 4, B = 19, C = 27, D = 25. When y is worth more, the best corner tilts towards the top, and C (2, 5) wins. The region did not change, only the direction of gain." },
    { type: "cat",
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
      why: "A positive gain with a positive entry to divide by means there is a direction to improve and a wall to stop at: pivot. No positive gain means no edge improves: optimal. A positive gain with no wall (no positive entries, so the ratio test has nothing to stop it) means z can grow forever: unbounded." },
    { type: "pick",
      q: "Four constraint rows are shown, and x has just been chosen to enter. Click the row that leaves the basis, using the ratio test.",
      fig: svg(420, 250,
        txt(40, 24, "Row", { c: "var(--text-dim)" }) + txt(150, 24, "x", { c: "var(--amber-ink)", s: 15 }) + txt(230, 24, "y", { c: "var(--text-dim)" }) + txt(340, 24, "right-hand side", { c: "var(--text-dim)" }) +
        [["s1", 2, 1, 12], ["s2", -1, 2, 2], ["s3", 3, 1, 9], ["s4", 0, 1, 8]].map(([r, a, b, c], i) => `<g data-pick="${r}"><rect x="10" y="${34 + i * 38}" width="400" height="32" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2"/>${txt(40, 55 + i * 38, r, { c: "var(--ink)" })}${txt(150, 55 + i * 38, a, { c: "var(--ink)" })}${txt(230, 55 + i * 38, b, { c: "var(--ink)" })}${txt(340, 55 + i * 38, c, { c: "var(--ink)" })}</g>`).join("") +
        txt(40, 214, "Gain", { c: "var(--amber-ink)" }) + txt(150, 214, "5", { c: "var(--amber-ink)" }) + txt(230, 214, "4", { c: "var(--amber-ink)" }) + txt(210, 238, "(slack columns left out to save space)", { s: 11, w: 700, c: "var(--text-faint)" })),
      a: "s3", hint: "Only rows with a positive number in the x column count. Divide right-hand side by that number: 12 ÷ 2 and 9 ÷ 3.",
      why: "s1 allows 12 ÷ 2 = 6 and s3 allows 9 ÷ 3 = 3. Row s2 has −1 in x's column, so raising x never hits that wall (it only moves further away), and s4 has 0, so it does not limit x either. The smallest valid ratio is s3's 3, so s3 leaves. The smallest right-hand side (s2's 2) is the tempting wrong answer." },
    { type: "order",
      q: "Put one simplex pivot into the right order.",
      items: ["Read the gain row and choose the entering variable (largest positive gain)", "Divide each right-hand side by that column's positive entries", "The row with the smallest ratio is the leaving variable", "Row-reduce so the entering column becomes a single 1 in the leaving row", "Read the new gain row and stop if no entry is positive"],
      why: "The entering variable fixes the column, the ratio test fixes the row, the row reduction moves to the new corner, and the new gain row tells you whether to go round again." },
    { type: "bug",
      q: "pick_entering() chooses the entering variable for a maximisation problem. simplex_done() should return True only at the optimum. Click the faulty line.",
      code: ["def pick_entering(gain):", "    best = None", "    for j in range(len(gain)):", "        if gain[j] > 0 and (best is None or gain[j] > gain[best]):", "            best = j", "    return best", "def simplex_done(gain):", "    return all(g >= 0 for g in gain)"],
      a: 7, why: "At the optimum no entry in the gain row is positive, so the test must be g <= 0. As written it would say 'done' when every gain is positive, which is exactly when there is the most room to improve z." },
  ]);

  /* =====================================================================
     a3-bracket
     ===================================================================== */
  const BX = (x) => 40 + x * 440;
  const bi = (x) => 1 - 0.55 * Math.exp(-(((x - 0.25) / 0.15) ** 2)) - 0.9 * Math.exp(-(((x - 0.88) / 0.1) ** 2));
  const biY = (v) => 190 - (v - 0.05) * 150;
  const biPath = Array.from({ length: 101 }, (_, i) => `${i ? "L" : "M"}${BX(i / 100).toFixed(1)} ${biY(bi(i / 100)).toFixed(1)}`).join(" ");
  B.add("a3-bracket", [
    { type: "pick",
      q: "Golden-section search is minimising an unimodal function on [a, b]. All it knows are the two probe values shown. Click the piece of the bracket it throws away.",
      fig: svg(520, 170,
        `<line x1="${BX(0)}" y1="112" x2="${BX(1)}" y2="112" stroke="var(--line-2)" stroke-width="4" stroke-linecap="round"/>` +
        [["L", 0, 0.382, "[a, c]"], ["M", 0.382, 0.618, "[c, d]"], ["R", 0.618, 1, "[d, b]"]].map(([id, x1, x2, l]) => `<g data-pick="${id}"><rect x="${BX(x1) + 2}" y="76" width="${BX(x2) - BX(x1) - 4}" height="68" rx="8" fill="var(--bg-2)" fill-opacity=".5" stroke="var(--line-2)" stroke-width="2" stroke-dasharray="5 4"/>${txt((BX(x1) + BX(x2)) / 2, 136, l, { c: "var(--text-dim)" })}</g>`).join("") +
        [["a", 0], ["c", 0.382], ["d", 0.618], ["b", 1]].map(([l, x]) => `<circle cx="${BX(x)}" cy="112" r="6" fill="var(--blue)"/>${txt(BX(x), 162, l, { s: 14, c: "var(--ink)" })}`).join("") +
        `<rect x="${BX(0.382) - 52}" y="14" width="104" height="30" rx="9" fill="var(--panel)" stroke="var(--blue)" stroke-width="2"/>${txt(BX(0.382), 34, "f(c) = 2.9", { c: "var(--blue-ink)" })}` +
        `<rect x="${BX(0.618) - 52}" y="14" width="104" height="30" rx="9" fill="var(--panel)" stroke="var(--blue)" stroke-width="2"/>${txt(BX(0.618), 34, "f(d) = 2.1", { c: "var(--blue-ink)" })}`),
      a: "L", why: "f(d) is lower than f(c). An unimodal function that is already lower at d than at c must still be heading downhill beyond c, so the minimum cannot lie left of c. The search discards [a, c] and keeps [c, b], with d inside it." },
    { type: "pick",
      q: "This function has TWO dips, so it is not unimodal. Golden-section search on [0, 1] probes at c and d with the values marked. Click the dip it will end up trapped in.",
      fig: svg(520, 230,
        `<path d="${biPath}" fill="none" stroke="var(--teal)" stroke-width="3"/>` +
        [["c", 0.382], ["d", 0.618]].map(([l, x]) => `<line x1="${BX(x)}" y1="30" x2="${BX(x)}" y2="200" stroke="var(--line-2)" stroke-dasharray="4 4"/><circle cx="${BX(x)}" cy="${biY(bi(x))}" r="6" fill="var(--blue)"/>` + txt(BX(x), 22, l, { s: 14, c: "var(--ink)" })).join("") +
        txt(BX(0.382) - 8, biY(bi(0.382)) - 12, "f(c) = 0.75", { a: "end", c: "var(--blue-ink)" }) + txt(BX(0.618) + 8, biY(bi(0.618)) - 12, "f(d) = 1.00", { a: "start", c: "var(--blue-ink)" }) +
        `<g data-pick="left"><circle cx="${BX(0.25)}" cy="${biY(bi(0.25)) + 4}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(BX(0.25), biY(bi(0.25)) + 8, "left", { s: 11, c: "var(--ink)", w: 900 })}</g>` +
        `<g data-pick="right"><circle cx="${BX(0.88)}" cy="${biY(bi(0.88)) - 4}" r="14" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>${txt(BX(0.88), biY(bi(0.88)), "right", { s: 11, c: "var(--ink)", w: 900 })}</g>` +
        txt(BX(0), 218, "a = 0", { c: "var(--text-dim)" }) + txt(BX(1), 218, "b = 1", { c: "var(--text-dim)" })),
      a: "left", why: "f(c) is lower than f(d), so the search keeps [a, d] = [0, 0.618] and throws away the right-hand end, which is where the deeper dip is. Every later step shrinks inside that bracket, so it settles in the shallow left dip. The method only compares two numbers, so it cannot see a dip it has discarded. That is why it needs one dip only." },
    { type: "order",
      q: "Put one golden-section step in order.",
      items: ["Place two interior probes at 38.2% and 61.8% of the bracket", "Compare the two function values", "Discard the outer piece beyond the worse probe", "Keep the surviving probe, which is already in a golden position of the new bracket", "Evaluate f at just one new probe", "Repeat until the bracket is narrower than the tolerance"],
      why: "Comparing the probes decides which end to cut. Because of the golden ratio the surviving probe is reused, so every step after the first needs just one new evaluation." },
    { type: "bug",
      q: "This golden-section code minimises f on [a, b]. It sometimes returns a point that is clearly not the minimum. Click the faulty line.",
      code: ["def golden(f, a, b, tol):", "    while b - a > tol:", "        c = a + 0.382 * (b - a)", "        d = a + 0.618 * (b - a)", "        if f(c) < f(d):", "            b = d", "        else:", "            a = d", "    return (a + b) / 2"],
      a: 7, why: "If f(c) is not lower than f(d), the minimum cannot be left of c, so the new bracket is [c, b]. Writing a = d also throws away the stretch between c and d, which can hold the minimum. The line should be a = c." },
    { type: "cat",
      q: "Probe values come back for c < d. Which piece does the search keep?",
      buckets: ["Keep [a, d] (left part)", "Keep [c, b] (right part)"],
      items: [["Minimising: f(c) = 4, f(d) = 9", 0], ["Minimising: f(c) = 12, f(d) = 5", 1], ["Maximising: f(c) = 4, f(d) = 9", 1], ["Maximising: f(c) = 3.5, f(d) = 2.5", 0], ["Minimising: f(c) = 30, f(d) = 29", 1], ["Maximising: f(c) = 8, f(d) = 20", 1]],
      why: "Minimising: keep the side of the lower probe. Maximising flips it: keep the side of the higher probe. Here the closeness of 30 and 29 doesn't matter, only which is lower." },
    { type: "mcq",
      q: "A student's 'golden-section' code logs the bracket width after each step. What does the log suggest?",
      fig: `<div style="margin:6px 0">${["10", "7", "4.9", "3.43", "2.4"].map((w, i) => chip(`step ${i}: ${w}`)).join("")}</div>`,
      o: ["The probes sit near 30% and 70% of the bracket, not at 38.2% and 61.8%", "The function has two dips, so the bracket cannot shrink any faster", "The tolerance is too tight, which slows each step by a fixed amount", "One probe is reused each step, which cuts the shrink rate in half"], a: 0,
      hint: "7 ÷ 10 = 0.7 and 4.9 ÷ 7 = 0.7. A golden run would multiply by about 0.62 each step.",
      why: "Every step multiplies the width by 0.7. With probes at 30% and 70% you keep 70% of the bracket, which is slower than golden section's 0.618 (10, 6.18, 3.82, 2.36 ...). The rate is set by where the probes are, not by the function or the tolerance." },
  ]);

  /* =====================================================================
     a3-nm
     ===================================================================== */
  function nmPlane() {
    const p = plane(9, 8, 400, 290), { X, Y } = p;
    const T = { A: [1, 1, 29], B: [5, 1, 5], C: [3, 5, 13] };
    let s = p.g + `<polygon points="${Object.values(T).map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--violet)" fill-opacity=".12" stroke="var(--violet)" stroke-width="2.5"/>`;
    s += Object.entries(T).map(([k, [x, y, v]]) => dot(X(x), Y(y), k, { fill: "var(--violet)", stroke: "var(--violet)", tc: "#fff" }) + txt(X(x) + (k === "C" ? 16 : 0), Y(x === 3 ? y : y) + (k === "C" ? 5 : 30), `f = ${v}`, { a: k === "C" ? "start" : "middle", s: 12, c: "var(--violet-ink)" })).join("");
    s += [["P", 7, 5], ["Q", 4, 3], ["R", 1, 5], ["S", 7, 1]].map(([k, x, y]) => dot(X(x), Y(y), k, { id: k, dash: true })).join("");
    return svg(400, 290, s);
  }
  B.add("a3-nm", [
    { type: "pick",
      q: "Nelder–Mead is minimising f. The triangle's corners have the values shown (lower is better). Click where the reflected point lands when the worst corner is flipped through the midpoint of the other two.",
      fig: nmPlane(), a: "P", hint: "Find the midpoint of the two better corners first: halfway between B (5, 1) and C (3, 5).",
      why: "A is the worst (f = 29). The midpoint of B and C is (4, 3), which is Q. Reflecting A through Q puts the new point as far beyond Q as A is on the near side: (4 + 3, 3 + 2) = (7, 5), point P. Landing on Q itself would be only half a reflection." },
    { type: "cat",
      q: "For each situation, decide what Nelder–Mead does with it.",
      buckets: ["Keep the reflection", "Expand", "Contract", "Shrink"],
      items: [
        ["The reflected point is better than the best corner.", 1],
        ["The reflected point beats the old worst corner but is not a new record.", 0],
        ["The reflected point is worse than all three corners.", 2],
        ["The contracted point is no better than the old worst corner.", 3],
        ["The expanded point turns out worse than the reflected point.", 0],
        ["Reflecting overshot: the new point is worse than the old worst corner.", 2],
      ],
      why: "A record-breaking reflection invites a bolder expansion, but if the expansion does worse you keep the reflection. A bad reflection means you overshot, so contract back. Only when even a contraction fails do you shrink everything toward the best corner." },
    { type: "bug",
      q: "reflect() should flip the worst corner through the midpoint of the OTHER TWO corners. Click the faulty line.",
      code: ["def reflect(f, pts):", "    best, mid, worst = sorted(pts, key=f)", "    centre = [(best[i] + mid[i] + worst[i]) / 3 for i in range(2)]", "    refl = [2 * centre[i] - worst[i] for i in range(2)]", "    return refl"],
      a: 2, why: "The centre must be the average of the two better corners, (best + mid) / 2. Including the worst corner drags the centre towards it, so the reflection barely leaves the triangle and the search crawls." },
    { type: "mcq",
      q: "After many iterations the triangle looks like the last panel. Why is that a problem?",
      fig: svg(480, 130, [[60, "start", "50,95 120,100 80,35"], [210, "iteration 20", "200,100 280,98 235,60"], [370, "iteration 60", "320,95 440,70 440,64"]].map(([x, l, pts], i) => `<polygon points="${pts.split(" ").map((p) => { const [a, b] = p.split(","); return `${+a - (i === 0 ? 0 : 0)},${b}`; }).join(" ")}" fill="var(--violet)" fill-opacity=".15" stroke="var(--violet)" stroke-width="2.5"/>${txt(x + (i === 0 ? 25 : i === 1 ? 20 : 90), 124, l, { c: "var(--text-dim)", s: 12 })}`).join("")),
      o: ["Every reflection stays close to one line, so the search can barely move sideways and stalls", "The three corners can no longer be ranked, so the best and worst are chosen at random", "A thin triangle means the minimum has been found, so the search should already have stopped", "Reflections now always land outside the valley, so expansions are never allowed"], a: 0,
      why: "A sliver has almost no width, so flipping a corner only moves the point along the sliver's own line. Without a spread in the second direction the triangle cannot turn or follow a bend in the valley. Restarting with a fresh full-size triangle usually fixes it." },
    { type: "mcq",
      q: "A run's progress is plotted. You know the true minimum value of f is 0. What is the sensible next move?",
      fig: (() => {
        const best = [90, 40, 18, 9, 6, 4.6, 4.2, 4.1, 4.1, 4.1, 4.1], size = [3, 2.4, 1.9, 1.5, 1.2, 1, 0.8, 0.5, 0.2, 0.05, 0.01];
        const px = (i) => 24 + i * 20, ln = (arr, max, c, ox) => `<polyline points="${arr.map((v, i) => `${ox + px(i)},${120 - (v / max) * 96}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>`;
        return svg(500, 168, `<rect x="6" y="8" width="236" height="124" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/><rect x="258" y="8" width="236" height="124" rx="10" fill="var(--panel)" stroke="var(--line)" stroke-width="2"/>` + ln(best, 90, "var(--blue)", 0) + ln(size, 3, "var(--amber)", 252) + txt(124, 156, "best value found per iteration (ends at 4.1)", { s: 11, c: "var(--text-dim)" }) + txt(376, 156, "triangle size per iteration (ends near 0)", { s: 11, c: "var(--text-dim)" }));
      })(),
      o: ["Restart from the best point with a new, full-size triangle", "Keep running, because the triangle will grow back by itself", "Accept 4.1, because Nelder–Mead guarantees the global minimum", "Remove the worst corner so only two corners are left"], a: 0,
      why: "Both curves have flattened: the triangle has collapsed to a dot and cannot move, yet the value is still far from the known minimum 0. The simplex never re-expands once it is tiny, so you restart from the best point with a new full-size triangle. Nelder–Mead has no global guarantee." },
    { type: "match",
      q: "Match each starting situation to the trouble it causes.",
      pairs: [["Starting triangle far too small", "Progress crawls, since every step is tiny"], ["Starting triangle far too large", "Early moves overshoot the valley and need many contractions"], ["Starting triangle is a thin sliver", "It can only explore along one line and stalls"], ["Function is flat across the triangle", "All corners compare equal, so there is no clear worst"]],
      why: "Every Nelder–Mead move is built from the triangle's own size and shape, so a bad start shapes the whole run. It is why the initial triangle should be a reasonable, non-degenerate size." },
  ]);

  /* =====================================================================
     a4-cut
     ===================================================================== */
  const hlSides = { A: "var(--blue)", B: "var(--blue)", C: "var(--blue)", D: "var(--amber)", E: "var(--amber)", F: "var(--amber)" };
  B.add("a4-cut", [
    { type: "pick",
      q: "The dashed line cuts the graph into {A, B, C} and {D, E, F}. All weights are different. Click the one edge the cut property guarantees is in some minimum spanning tree.",
      fig: tail(G(CN, CE, { pick: "edges", w: 460, h: 260, hl: hlSides }), `<line x1="235" y1="8" x2="235" y2="252" stroke="var(--rose)" stroke-width="3" stroke-dasharray="7 6"/>${txt(235, 252, "cut", { c: "var(--rose-ink)" })}`),
      a: "C-D", why: "Only B–D (7), C–D (3) and C–E (8) cross the cut. The cheapest crossing edge, C–D, is safe. E–F (1) is the lightest in the whole graph, but it lies inside one side, so the cut says nothing about it here." },
    { type: "pick",
      q: "All weights are different. Click every edge that the cycle property rules out (an edge that is the heaviest on some cycle).",
      fig: G(CN, CE, { pick: "edges", w: 460, h: 260 }), a: ["B-C", "B-D", "C-E", "D-F"],
      hint: "Look for triangles. A–B–C has edges 4, 2 and 5. Which is heaviest?",
      why: "B–C (5) is the heaviest on A–B–C. B–D (7) is the heaviest on B–C–D (5, 3, 7). C–E (8) is the heaviest on C–D–E (3, 6, 8), and D–F (9) is the heaviest on D–E–F (6, 1, 9). The five edges left are the minimum spanning tree, total 16." },
    { type: "cat",
      q: "All edge weights are distinct. For each edge e, what do the facts guarantee?",
      buckets: ["Safe: in an MST", "Out: in no MST", "Can't tell from this"],
      items: [
        ["Edge e (6) crosses a cut. The other crossing edges weigh 9 and 11.", 0],
        ["Edge e (9) closes a cycle with edges of weight 3 and 5.", 1],
        ["Edge e (5) crosses a cut. The other crossing edges weigh 2 and 4.", 2],
        ["Edge e (8) closes a cycle with edges of weight 2 and 9.", 2],
        ["Edge e (1) is the lightest edge touching a particular node.", 0],
        ["Edge e (7) is the heaviest in a cycle of four edges: 2, 3, 4 and 7.", 1],
      ],
      why: "The cut property only vouches for the LIGHTEST crossing edge, and a node's edges form a cut of that single node. The cycle property only condemns the HEAVIEST edge on a cycle. An edge that is merely heavier-than-some or lighter-than-some tells you nothing yet." },
    { type: "bug",
      q: "lightest_crossing(edges, S) should return the lightest edge with one end in S and the other outside. Click the faulty line.",
      code: ["def lightest_crossing(edges, S):", "    best = None", "    for u, v, w in edges:", "        if (u in S) == (v in S):", "            if best is None or w < best[2]:", "                best = (u, v, w)", "    return best"],
      a: 3, why: "An edge crosses the cut when exactly one end is in S, so the test is (u in S) != (v in S). As written it keeps edges with both ends on the same side, which is the opposite of crossing." },
    { type: "order",
      q: "Put the swap argument for the cut property in order. It shows the lightest crossing edge e is in some MST.",
      items: ["Suppose some MST T does not contain e", "Add e to T: this closes exactly one cycle", "That cycle must cross the cut again, through another edge f", "f crosses the cut too, so it is at least as heavy as e", "Remove f and keep e: still a spanning tree, and no heavier", "So some MST contains e"],
      why: "Adding an edge to a tree makes one cycle, and a cycle that crosses a cut has to cross it an even number of times. The second crossing edge is the one you can swap out without losing weight." },
    { type: "mcq",
      q: "How many different minimum spanning trees does this graph have?",
      fig: svg(320, 230, `<line x1="60" y1="40" x2="260" y2="40" stroke="var(--line-2)" stroke-width="3"/><line x1="260" y1="40" x2="260" y2="180" stroke="var(--line-2)" stroke-width="3"/><line x1="260" y1="180" x2="60" y2="180" stroke="var(--line-2)" stroke-width="3"/><line x1="60" y1="180" x2="60" y2="40" stroke="var(--line-2)" stroke-width="3"/><line x1="60" y1="40" x2="260" y2="180" stroke="var(--line-2)" stroke-width="3"/>` + txt(160, 30, "1") + txt(272, 114, "1", { a: "start" }) + txt(160, 202, "1") + txt(48, 114, "1", { a: "end" }) + txt(176, 92, "3", { c: "var(--amber-ink)" }) +
        [["A", 60, 40], ["B", 260, 40], ["C", 260, 180], ["D", 60, 180]].map(([k, x, y]) => dot(x, y, k, { r: 18, s: 15 })).join("")),
      o: ["1", "2", "4", "8"], a: 2,
      why: "The diagonal (3) is the heaviest edge on both its triangles, so no MST uses it. The four weight-1 edges form a cycle, and an MST must drop exactly one of them, with four equal choices. That gives 4 MSTs, each of weight 3. A graph has many spanning trees, but only these 4 are minimum." },
  ]);

  /* =====================================================================
     a4-mst
     ===================================================================== */
  const teal = "var(--teal)";
  B.add("a4-mst", [
    { type: "pick",
      q: "Prim's algorithm started at A. Its tree so far is the green part (A, D, B, C). Click the edge it adds next.",
      fig: tail(G(LN, LE, { pick: "edges", w: 400, h: 250, hl: { A: teal, B: teal, C: teal, D: teal, "A-D": teal, "A-B": teal, "B-C": teal } }), txt(340, 125, "green = in the tree", { a: "middle", s: 12, c: "var(--teal-ink)" })),
      a: "C-F", hint: "Only edges with exactly one green end can be added. List those three weights.",
      why: "Edges leaving the tree are B–E (6), D–E (5) and C–F (4). Prim takes the cheapest one that crosses from the tree to the rest, which is C–F. E–F (7) touches no tree node, so it cannot be picked yet." },
    { type: "pick",
      q: "Kruskal takes the edges in weight order, skipping any that join two nodes already connected. Click the first edge it REJECTS.",
      fig: G(LN, LE, { pick: "edges", w: 400, h: 250 }), a: "B-E",
      hint: "Order: 1, 2, 3, 4, 5, 6, 7. After the first five are taken, which nodes are still apart?",
      why: "A–D (1), B–C (2), A–B (3), C–F (4) and D–E (5) all join different groups, so they are accepted. After them, B and E are already connected (B–A–D–E), so B–E (6) would close a loop and is rejected. E–F (7) is rejected too, but later." },
    { type: "mcq",
      q: "Prim (from A) and Kruskal both ran on the ladder graph with weights A–D 1, B–C 2, A–B 3, C–F 4, D–E 5, B–E 6, E–F 7. Their accepted edges are shown in order. Why does Kruskal take B–C before A–B, while Prim takes A–B first?",
      fig: `<div style="margin:6px 0"><div><b style="display:inline-block;width:90px">Prim from A</b>${[["A–D", 1], ["A–B", 3], ["B–C", 2], ["C–F", 4], ["D–E", 5]].map(([e, w]) => chip(e, w)).join("")}</div><div><b style="display:inline-block;width:90px">Kruskal</b>${[["A–D", 1], ["B–C", 2], ["A–B", 3], ["C–F", 4], ["D–E", 5]].map(([e, w]) => chip(e, w)).join("")}</div></div>`,
      o: ["Prim can only add edges touching its tree, while Kruskal sees every edge", "Kruskal is quicker per edge, so it reaches the lighter edge sooner than Prim does", "Prim has to take edges in the order they were drawn, whatever their weight", "B–C would close a loop in Prim's tree, but not in Kruskal's forest"], a: 0,
      why: "Both pick cheapest-first, but Prim's choice is restricted to the cut around its single growing tree. B–C (2) cannot be taken until B has joined, and B joins via A–B. Kruskal sees the whole list and takes B–C as a separate small tree. The final tree is the same, total 15." },
    { type: "cat",
      q: "Which algorithm suits each job better?",
      buckets: ["Prim (with a heap)", "Kruskal (with union-find)"],
      items: [
        ["A dense graph where nearly every pair of towns has a possible cable", 0],
        ["A sparse road map stored as a plain list of edges", 1],
        ["Group 500 data points into 4 clusters by stopping when 4 groups remain", 1],
        ["Grow the network outward from one head office, adding one town at a time", 0],
        ["The edge list arrives already sorted by cost", 1],
        ["The graph is stored as adjacency lists and you have a priority queue ready", 0],
      ],
      why: "Prim spends its effort per node and scans neighbours, which pays off when edges are plentiful. Kruskal's cost is the sort, so it shines on sparse or pre-sorted edge lists, and stopping it early leaves the forest you want for clustering." },
    { type: "bug",
      q: "This Kruskal code returns a spanning tree that is never the cheapest one, however the weights are set. Click the faulty line.",
      code: ["def kruskal(n, edges):", "    parent = list(range(n))", "    def find(x):", "        while parent[x] != x:", "            x = parent[x]", "        return x", "    edges = sorted(edges, key=lambda e: -e[2])", "    tree = []", "    for u, v, w in edges:", "        ru, rv = find(u), find(v)", "        if ru != rv:", "            parent[ru] = rv", "            tree.append((u, v, w))", "    return tree"],
      a: 6, why: "Sorting by -weight puts the heaviest edges first, so the loop builds a MAXIMUM spanning tree. The union-find part is fine. Kruskal's greedy rule only works when the cheapest edges come first." },
    { type: "slider",
      q: "A network has 12 towns. Kruskal has accepted 7 edges so far and has rejected 3 other edges for closing a loop. How many separate groups of connected towns remain?",
      min: 1, max: 12, step: 1, ans: 5, tol: 0, unit: "groups",
      why: "Every accepted edge joins two groups into one, so 12 groups drop by one per accepted edge: 12 − 7 = 5. Rejected edges change nothing, as they connect towns that are already together. It finishes with 1 group after 11 accepted edges." },
  ]);

  /* =====================================================================
     a5-orient
     ===================================================================== */
  function arrowAB(p, a, b, c) {
    const id = uid();
    return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker></defs><line x1="${p.X(a[0])}" y1="${p.Y(a[1])}" x2="${p.X(b[0])}" y2="${p.Y(b[1])}" stroke="${c}" stroke-width="3.5" marker-end="url(#${id})"/>`;
  }
  const o1 = (() => {
    const p = plane(9, 8, 420, 320), A = [1, 2], Bp = [6, 4];
    const pts = { 1: [2, 6], 2: [7, 1], 3: [5, 7], 4: [3, 1], 5: [8, 6], 6: [0, 4], 7: [7, 3] };
    return svg(420, 320, p.g + `<line x1="${p.X(-1)}" y1="${p.Y(1.6)}" x2="${p.X(9)}" y2="${p.Y(5.6)}" stroke="var(--line-2)" stroke-dasharray="5 5"/>` + arrowAB(p, A, Bp, "var(--blue)") + dot(p.X(1), p.Y(2), "A", { fill: "var(--blue)", stroke: "var(--blue)", tc: "#fff" }) + dot(p.X(6), p.Y(4), "B", { fill: "var(--blue)", stroke: "var(--blue)", tc: "#fff" }) + Object.entries(pts).map(([k, [x, y]]) => dot(p.X(x), p.Y(y), k, { id: k })).join(""));
  })();
  const o2 = (() => {
    const p = plane(9, 8, 420, 320), A = [1, 1], Bp = [7, 2];
    const pts = { 1: [2, 5], 2: [5, 7], 3: [8, 4], 4: [4, 0], 5: [3, 3] };
    return svg(420, 320, p.g + arrowAB(p, A, Bp, "var(--blue)") + dot(p.X(1), p.Y(1), "A", { fill: "var(--blue)", stroke: "var(--blue)", tc: "#fff" }) + dot(p.X(7), p.Y(2), "B", { fill: "var(--blue)", stroke: "var(--blue)", tc: "#fff" }) + Object.entries(pts).map(([k, [x, y]]) => dot(p.X(x), p.Y(y), k, { id: k })).join(""));
  })();
  const o3 = (() => {
    const p = plane(9, 8, 420, 320), V = { A: [1, 1], B: [7, 1], C: [8, 4], D: [5, 3], E: [6, 7], F: [2, 6] }, ks = Object.keys(V);
    const id = uid();
    return svg(420, 320, p.g + `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink)"/></marker></defs>` +
      `<polygon points="${ks.map((k) => `${p.X(V[k][0])},${p.Y(V[k][1])}`).join(" ")}" fill="var(--violet)" fill-opacity=".1" stroke="none"/>` +
      ks.map((k, i) => { const a = V[k], b = V[ks[(i + 1) % 6]], dx = p.X(b[0]) - p.X(a[0]), dy = p.Y(b[1]) - p.Y(a[1]), L = Math.hypot(dx, dy); return `<line x1="${p.X(a[0]) + (dx / L) * 12}" y1="${p.Y(a[1]) + (dy / L) * 12}" x2="${p.X(b[0]) - (dx / L) * 13}" y2="${p.Y(b[1]) - (dy / L) * 13}" stroke="var(--ink)" stroke-width="2.5" marker-end="url(#${id})"/>`; }).join("") +
      ks.map((k) => dot(p.X(V[k][0]), p.Y(V[k][1]), k, { id: k })).join(""));
  })();
  const o6 = svg(320, 230, `<polygon points="60,190 270,160 140,40" fill="var(--violet)" fill-opacity=".12" stroke="var(--violet)" stroke-width="3"/>` + dot(60, 190, "P", { r: 16, s: 14 }) + dot(270, 160, "Q", { r: 16, s: 14 }) + dot(140, 40, "R", { r: 16, s: 14 }) + txt(160, 222, "P, Q, R are a counter-clockwise triangle (y up)", { s: 12, w: 700, c: "var(--text-dim)" }));
  B.add("a5-orient", [
    { type: "pick",
      q: "You walk from A to B (the arrow), then look towards a point X. Click every point X for which A → B → X is a LEFT turn. (Y points up.)",
      fig: o1, a: ["1", "3", "5", "6"], hint: "A left turn means X lies on the left-hand side of the directed line through A and B, even beyond B or behind A.",
      why: "The sign of the cross product (B − A) × (X − A) tells which side of the directed line X is on: positive is left. Points 1, 3, 5 and 6 are above the line (cross products 18, 17, 6 and 12). The line carries on past both ends, so point 5 beyond B and point 6 behind A still count." },
    { type: "pick",
      q: "A → B is fixed. The cross product (B − A) × (P − A) is bigger the further P lies to the left of the line. Click the point with the LARGEST cross product.",
      fig: o2, a: "2", why: "The cross product equals the length of A→B times P's signed distance from the line, so the largest value is the point furthest to the left. That is point 2 (cross product 32; the others are 23, 11, −9 and 10). Point 3 is furthest from A in a straight line, but it sits closer to the line itself. Quickhull relies on this to find the next hull point." },
    { type: "pick",
      q: "You walk round this polygon in the order A, B, C, D, E, F and back to A, and the walk is counter-clockwise. On a convex polygon every turn would be a left turn. Click the corner where you turn RIGHT.",
      fig: o3, a: "D",
      why: "At D the path swings the wrong way: the cross product of C → D → E is −11, a right turn. That is the dent in the shape, so D could never be a corner of the convex hull. All the other corners give positive values (18, 8, 15, 19, 30)." },
    { type: "bug",
      q: "inside(poly, q) should say whether q is inside a convex polygon whose corners are listed counter-clockwise (y up). cross(a, b, q) is positive when a → b → q turns left. Click the faulty line.",
      code: ["def inside(poly, q):", "    for i in range(len(poly)):", "        a = poly[i]", "        b = poly[(i + 1) % len(poly)]", "        if cross(a, b, q) > 0:", "            return False", "    return True"],
      a: 4, why: "Going counter-clockwise, the inside is on the left of every edge. So a RIGHT turn (negative) proves q is outside, and the test should be cross(a, b, q) < 0. The buggy version rejects every point that is properly inside." },
    { type: "cat",
      q: "You walk on a map where y points up (north). Is the turn at the corner a left turn, a right turn or straight?",
      buckets: ["Left turn", "Right turn", "Straight (collinear)"],
      items: [["East for 3 steps, then north for 2", 0], ["North for 3 steps, then east for 2", 1], ["West for 2 steps, then south for 4", 0], ["South for 3 steps, then west for 2", 1], ["East for 4 steps, then east for 2 more", 2], ["East for 3 steps, then straight back west for 1", 2]],
      why: "Heading east, north is on your left. Heading north, east is on your right. Heading west, south is on your left. Heading south, west is on your right. Continuing the same way, or turning all the way back along the same line, gives cross product 0: collinear, which hull code has to handle deliberately." },
    { type: "multi",
      q: "Three points P, Q, R are in counter-clockwise order, so P → Q → R is a left turn. Which of these orders of the same three points are ALSO left turns?",
      fig: o6,
      o: ["P → Q → R", "Q → R → P", "R → P → Q", "R → Q → P", "Q → P → R", "P → R → Q"], a: [0, 1, 2],
      why: "Starting the walk at a different corner of the same cycle (Q → R → P, R → P → Q) goes round the triangle the same way, so the turn stays left. Swapping any two points reverses the direction, so R → Q → P, Q → P → R and P → R → Q are right turns. The sign of the cross product flips when two points swap." },
  ]);

  /* =====================================================================
     a5-wrap
     ===================================================================== */
  const w1 = (() => {
    const p = plane(10, 10, 420, 330), W = { A: [1, 4], B: [4, 1], C: [8, 2], D: [9, 6], E: [5, 9], F: [2, 8], G: [4, 5], H: [6, 4], I: [5, 3], J: [3, 6], K: [7, 6] };
    const id = uid();
    return svg(420, 330, p.g + `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--teal)"/></marker></defs>` +
      `<line x1="${p.X(1) + 8}" y1="${p.Y(4) + 6}" x2="${p.X(4) - 10}" y2="${p.Y(1) - 8}" stroke="var(--teal)" stroke-width="4" marker-end="url(#${id})"/>` +
      Object.entries(W).map(([k, [x, y]]) => dot(p.X(x), p.Y(y), k, { id: k === "B" ? "" : k, fill: k === "B" ? "var(--blue)" : "var(--panel)", stroke: k === "B" ? "var(--blue)" : "var(--line-2)", tc: k === "B" ? "#fff" : "var(--ink)" })).join("") + txt(p.X(4) + 20, p.Y(1) + 22, "current", { a: "start", s: 12, c: "var(--blue-ink)" }));
  })();
  B.add("a5-wrap", [
    { type: "pick",
      q: "Gift wrapping has just walked from A to B (green arrow) and B is now the current point. Click the point it picks next.",
      fig: w1, a: "C", hint: "The next point is the one with every other point on its left as you look from B. It is not simply the closest one.",
      why: "From B, point C is the one where nothing else lies to the right of B → C: it is the most clockwise direction from B. The closest point, I, is inside the hull. Gift wrapping tests every other point against its current best and keeps whichever lies furthest round, so interior points never win." },
    { type: "cat",
      q: "There are 1,000 points in each case. Which algorithm does less work?",
      buckets: ["Gift wrapping wins", "Graham scan wins"],
      items: [["All 1,000 points lie on a circle", 1], ["A dense cloud in the middle with just 4 outliers marking the corners", 0], ["All 1,000 points lie along a parabola, curving one way", 1], ["Almost all points are packed in a small blob, and only 3 stray points form a big triangle around it", 0], ["The hull has about 500 of the points", 1], ["Only 5 points are on the hull", 0]],
      why: "Gift wrapping costs about n · h and Graham scan about n · log n (log₂ 1,000 is about 10). So wrapping wins when the hull has fewer than about 10 points, and Graham wins when the hull is large. It is the hull size, not n, that decides." },
    { type: "order",
      q: "Put gift wrapping into order.",
      items: ["Start at the leftmost point, which must be on the hull", "From the current point, test every other point against the best candidate so far", "Keep the candidate that has all other points on its left", "Move to that candidate and record it as a hull point", "Stop when the walk returns to the starting point"],
      why: "The leftmost point is guaranteed to be on the hull, so it is a safe start. Each wrapping step sweeps all n points, which is why the cost is n for every hull point found." },
    { type: "bug",
      q: "wrap(pts) should return the hull counter-clockwise. turn(p, a, b) is positive for a left turn. Click the faulty line.",
      code: ["def wrap(pts):", "    start = min(pts)", "    hull, p = [], start", "    while True:", "        hull.append(p)", "        nxt = pts[0]", "        for q in pts:", "            if nxt == p or turn(p, nxt, q) > 0:", "                nxt = q", "        p = nxt", "        if p == start:", "            break", "    return hull"],
      a: 7, why: "q should replace the candidate when q lies to the RIGHT of p → nxt, meaning the turn is negative, because the true next hull point has every other point on its left. With > 0 the code keeps picking the most counter-clockwise point, which is an interior point, and the walk cuts through the middle." },
    { type: "slider",
      q: "There are 1,024 points. Gift wrapping costs about n × h, and Graham scan costs about n × log₂ n (log₂ 1,024 = 10). Gift wrapping only beats Graham when the hull has fewer than about how many points?",
      min: 0, max: 40, step: 1, ans: 10, tol: 2, unit: "hull points",
      why: "The n cancels: n × h < n × 10 when h < 10. So the crossover is at about 10 hull points. Wrapping is better with a small hull, Graham with a large one, which is why the best choice depends on the answer's size, not the input's." },
  ]);

  /* =====================================================================
     a5-graham
     ===================================================================== */
  const g1 = (() => {
    const p = plane(10, 9, 420, 330), P0 = [1, 1], S = { A: [9, 3], B: [5, 4], C: [2, 2] }, D = [5, 8];
    return svg(420, 330, p.g +
      `<polyline points="${[P0, S.A, S.B, S.C].map(([x, y]) => `${p.X(x)},${p.Y(y)}`).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>` +
      `<line x1="${p.X(2)}" y1="${p.Y(2)}" x2="${p.X(5)}" y2="${p.Y(8)}" stroke="var(--amber)" stroke-width="3" stroke-dasharray="6 5"/>` +
      dot(p.X(1), p.Y(1), "P0", { fill: "var(--teal)", stroke: "var(--teal)", tc: "#fff", s: 11 }) + dot(p.X(9), p.Y(3), "A", { id: "A" }) + dot(p.X(5), p.Y(4), "B", { id: "B" }) + dot(p.X(2), p.Y(2), "C", { id: "C" }) +
      dot(p.X(5), p.Y(8), "D", { fill: "var(--amber)", stroke: "var(--amber)", tc: "#fff" }) + txt(p.X(5) + 18, p.Y(8) + 4, "next", { a: "start", c: "var(--amber-ink)" }) + txt(p.X(7.5), p.Y(1.3), "stack: P0, A, B, C", { c: "var(--teal-ink)", s: 12 }));
  })();
  const g2 = (() => {
    const p = plane(10, 9, 420, 330), P0 = [1, 1], pts = { a: [8, 2, 1], b: [9, 4, 2], c: [7, 6, 3], d: [4, 5, 5], e: [2, 5, 4], f: [0, 6, 6] };
    return svg(420, 330, p.g + Object.values(pts).map(([x, y]) => `<line x1="${p.X(1)}" y1="${p.Y(1)}" x2="${p.X(x)}" y2="${p.Y(y)}" stroke="var(--line-2)" stroke-dasharray="3 4"/>`).join("") +
      dot(p.X(1), p.Y(1), "P0", { fill: "var(--teal)", stroke: "var(--teal)", tc: "#fff", s: 11 }) + Object.entries(pts).map(([k, [x, y, n]]) => dot(p.X(x), p.Y(y), n, { id: k, s: 13 })).join(""));
  })();
  const log = ["push 1", "push 2", "push 3", "pop", "push 4", "push 5", "pop", "pop", "push 6"];
  B.add("a5-graham", [
    { type: "pick",
      q: "Graham scan's stack is P0, A, B, C (the green chain). The next point in angle order is D. Click every point that gets popped before D is pushed.",
      fig: g1, a: ["B", "C"], hint: "Test the top two stack points with D. If that is a right turn or straight, pop the top, then test again with the new top two.",
      why: "B → C → D is a right turn (cross product −12), so C is popped. Now A → B → D is also a right turn (−16), so B is popped. Then P0 → A → D is a left turn (48), so A stays and D is pushed. Pops can cascade, yet each point is popped at most once, which keeps the whole scan linear." },
    { type: "pick",
      q: "A student sorted the points by angle round the anchor P0 and numbered them 1 to 6. The numbers on two points were swapped by mistake. Click both of them.",
      fig: g2, a: ["d", "e"],
      why: "Sweeping counter-clockwise from the right, the dotted lines meet the points in the order a, b, c, e, d, f. So the two points labelled 5 and 4 should read 4 and 5. If the sort is wrong, the stack's left-turn test no longer matches the boundary order and the scan gives a wrong hull." },
    { type: "cat",
      q: "The stack's top two points are shown, then the next point arrives. Does the scan pop the top point, or push straight away?",
      buckets: ["Pop the top point", "Keep it and push"],
      items: [["Top two: (1, 1), (5, 1). Next: (7, 4)", 1], ["Top two: (1, 1), (5, 2). Next: (8, 1)", 0], ["Top two: (2, 2), (4, 4). Next: (7, 7)", 0], ["Top two: (3, 1), (6, 3). Next: (6, 7)", 1], ["Top two: (2, 1), (5, 5). Next: (7, 5)", 0], ["Top two: (8, 2), (6, 6). Next: (3, 5)", 1]],
      hint: "Left turn: keep. Right turn or straight: pop. For (a, b, c) compute (b − a) × (c − a).",
      why: "A left turn means the stack is still convex, so the point is pushed. A right turn means the top point is a dent and is popped. The (2, 2), (4, 4), (7, 7) case is straight, so the middle point is popped too: it lies on an edge, not at a corner." },
    { type: "bug",
      q: "This Graham scan keeps points on the stack while the boundary turns the right way. Click the faulty line.",
      code: ["def graham(pts):", "    p0 = min(pts, key=lambda p: (p[1], p[0]))", "    rest = sorted((p for p in pts if p != p0), key=lambda p: angle(p0, p))", "    stack = [p0]", "    for p in rest:", "        while len(stack) >= 2 and turn(stack[-2], stack[-1], p) > 0:", "            stack.pop()", "        stack.append(p)", "    return stack"],
      a: 5, why: "turn() is positive for a left turn, and a left turn is the GOOD case: the top point stays. The scan should pop when the turn is right or straight, which is turn(...) <= 0. As written it throws away every proper corner and keeps the dents." },
    { type: "slider",
      q: "Graham scan has already sorted 300 points and starts the scan. At most how many stack operations (pushes plus pops) can the whole scan perform?",
      min: 0, max: 1200, step: 50, ans: 600, tol: 100, unit: "operations",
      why: "Every point is pushed exactly once and popped at most once, so there are at most 300 + 300 = 600 operations. The inner while loop looks as if it could make the scan quadratic, but the pops are paid for by earlier pushes. That is why the scan is O(n) and the sort's O(n log n) dominates." },
    { type: "mcq",
      q: "The input has 7 points including the anchor, and the anchor is pushed first. The rest of the scan's log is shown. How many of the 7 points end on the hull?",
      fig: `<div style="margin:6px 0">${log.map((l, i) => chip(`${i + 1}. ${l}`)).join("")}</div>`,
      o: ["3", "4", "5", "6"], a: 1, hint: "Pushes in total (plus the anchor) minus pops. Count them from the log.",
      why: "Six pushes plus the anchor makes 7 pushes in total, and the log has 3 pops, so 7 − 3 = 4 points remain on the stack. The three popped points were dents. The anchor, 1 and 2 plus the final 6th pushed point are the hull corners." },
  ]);
})();

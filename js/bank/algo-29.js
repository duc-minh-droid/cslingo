(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { arrow, buildCut, buildGroups, buildLoop, buildPanels, circ, ln, pk, svg, table, txt } = partScope;
  const B = NIC.bank;
  // order a learner laid cables in
  function buildOrder() {
    const bars = [
      ["D–F", 2, "DF"],
      ["D–E", 3, "DE"],
      ["A–C", 4, "AC"],
      ["B–D", 5, "BD"],
      ["C–D", 8, "CD"],
      ["E–G", 6, "EG"],
    ];
    let s = "";
    for (let c = 0; c <= 8; c += 2)
      s +=
        ln(46, 150 - c * 13, 400, 150 - c * 13, "var(--line)", 1.5) +
        txt(38, 154 - c * 13, c, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    bars.forEach(([lab, c, id], i) => {
      const x = 58 + i * 57,
        h = c * 13;
      s += pk(
        id,
        `<rect x="${x}" y="${150 - h}" width="42" height="${h}" rx="6" fill="var(--blue)"/>` +
          txt(x + 21, 150 - h - 6, c, { s: 13, c: "var(--ink)" }) +
          txt(x + 21, 168, lab, { s: 12, c: "var(--text-dim)" }) +
          txt(x + 21, 183, `#${i + 1}`, { s: 11, w: 700, c: "var(--text-faint)" }),
      );
    });
    s += txt(210, 206, "All cables: A–B 7, A–C 4, B–C 9, B–D 5, C–D 8, C–F 10,", {
      s: 12,
      w: 700,
      c: "var(--text-dim)",
    });
    s += txt(210, 222, "D–E 3, D–F 2, E–F 11, E–G 6, F–G 12", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 234, s);
  }

  B.add("a4-build", [
    {
      type: "cat",
      q: "Kruskal has laid five cables, so the seven towns now sit in the two groups coloured below. Sort each remaining cable by what would happen if Kruskal reached it right now.",
      fig: buildGroups(),
      buckets: ["Joins two groups", "Closes a loop"],
      items: [
        ["A–B (cost 7)", 0],
        ["E–F (cost 11)", 1],
        ["C–F (cost 10)", 0],
        ["F–G (cost 12)", 1],
        ["B–C (cost 9)", 0],
      ],
      why: "Whether a cable makes a loop depends on the groups, not on its cost. E–F and F–G have both ends in the blue group, so they would close a loop. A–B, C–F and B–C each link amber to blue and would be laid. In a real run, laying the first of those merges the groups, and the other two then become loops.",
    },
    {
      type: "pick",
      q: "The purple team is the two towns D and F, and everyone else is outside. Cables that cross the dashed boundary are in amber. The cut property says one cable is guaranteed to be in a cheapest network. Click it.",
      fig: buildCut(),
      a: "D-E",
      why: "Only cables with exactly one end in the team cross the cut, and the lightest of those is safe: D–E (3) beats B–D 5, C–D 8, C–F 10, E–F 11 and F–G 12. D–F (2) is the cheapest cable overall, but both its ends are inside the team, so this cut says nothing about it. It is safe for a different cut, such as F on its own.",
    },
    {
      type: "pick",
      q: "Five towns need cabling. Four networks are drawn, each with the cables shown. Click every network that is a valid spanning tree: everything connected with no loops and nothing spare.",
      fig: buildPanels(),
      a: ["a", "d"],
      hint: "A tree on five towns has four cables, but four cables is not enough on its own. Check that nothing is cut off.",
      why: "The path (a) and the star (d) connect all five towns with exactly four cables. Network (b) also has four cables, but they form a loop on three towns and leave two towns cut off. Network (c) connects everyone but has a spare fifth cable that closes a loop. Cable count and connectedness both matter.",
    },
    {
      type: "slider",
      min: 0,
      max: 10,
      step: 1,
      start: 7,
      ans: 3,
      tol: 0,
      q: "Your hand-built network (solid cables, total 36) connects all seven towns. You add the dashed cable B–D, costing 5, which closes a loop. Then you remove the dearest cable on that loop. By how much does the total fall?",
      fig: buildLoop(),
      hint: "The loop runs B–A–C–D–B. Find its dearest cable and compare it with the new cable, 5.",
      why: "The loop is B–A (7), A–C (4), C–D (8) and the new D–B (5). The dearest cable is C–D (8). Swapping it for the 5 keeps everything connected and saves 8 − 5 = 3, so the total drops from 36 to 33.",
    },
    {
      type: "pick",
      q: "A learner lays these cables by hand in the order of the bars (height = cost). One cable was laid too early: a cheaper cable that makes no loop was still available. Click it.",
      fig: buildOrder(),
      a: "CD",
      hint: "Before the fifth cable, which towns are still unconnected, and which cheaper cables would join them?",
      why: "Before cable 5 the learner has D–F, D–E, A–C and B–D, so A and C form one group and G is alone. E–G (6) and A–B (7) would each join two groups and are cheaper than C–D (8), so C–D should wait. E–G (6) laid afterwards is not the slip: it is correct, just late. The result costs 28 instead of the minimum 27 (2 + 3 + 4 + 5 + 6 + 7).",
    },
  ]);

  /* =====================================================================
     a5-code  (workshop: code the hull)
     ===================================================================== */
  // trace of the scan on seven points: each test, its cross product and what the scan did
  function codeTrace() {
    const rows = [
      ["#", "stack top two, then new point", "cross", "scan does"],
      ["1", "(0,0) (3,0)  →  (6,0)", "0", "pop (3,0)"],
      ["2", "(0,0) (6,0)  →  (6,3)", "18", "push (6,3)"],
      ["3", "(6,0) (6,3)  →  (6,6)", "0", "push (6,6)"],
      ["4", "(0,0) (6,0)  →  (6,6)", "36", "push (6,6)"],
      ["5", "(6,0) (6,6)  →  (0,3)", "36", "push (0,3)"],
      ["6", "(6,6) (0,3)  →  (0,6)", "−18", "pop (0,3)"],
      ["7", "(6,0) (6,6)  →  (0,6)", "36", "push (0,6)"],
    ];
    const cols = [34, 238, 62, 126],
      rh = 31;
    let s = "",
      y = 6;
    rows.forEach((r, i) => {
      if (i === 0) {
        s += table(8, y, cols, rh, [r]);
        y += rh;
        return;
      }
      const cells = r.map((t, c) => ({ t, a: c === 1 || c === 3 ? "start" : undefined, s: c === 1 ? 13 : 13 }));
      let g = table(8, y, cols, rh, [cells], { head: false });
      s += pk("r" + i, g);
      y += rh;
    });
    s += txt(230, y + 20, "Points are written (x, y). Cross = orient(first, second, new).", {
      s: 12,
      w: 700,
      c: "var(--text-dim)",
    });
    return svg(470, y + 30, s);
  }
  // two sort orders round a pivot
  function codeOrders() {
    const P0 = [3, 0],
      pts = { A: [8, 2], B: [7, 6], C: [3, 7], D: [-1, 4], E: [0, 1] };
    const panel = (x0, title, order, note) => {
      const X = (x) => x0 + 24 + (x + 1) * 17,
        Y = (y) => 190 - y * 20;
      let s =
        `<rect x="${x0}" y="4" width="204" height="236" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` +
        txt(x0 + 102, 26, title, { s: 12.5, c: "var(--ink)" });
      s += circ(X(P0[0]), Y(P0[1]), 8, "var(--violet)", "var(--violet)");
      order.forEach((k, i) => {
        const [x, y] = pts[k];
        s +=
          ln(X(P0[0]), Y(P0[1]), X(x), Y(y), "var(--line-2)", 1.5, 'stroke-dasharray="4 4"') +
          circ(X(x), Y(y), 11, "var(--panel)", "var(--blue)") +
          txt(X(x), Y(y) + 5, i + 1, { s: 13, c: "var(--ink)" });
      });
      s +=
        txt(X(P0[0]), Y(P0[1]) + 22, "pivot", { s: 11, c: "var(--violet-ink)" }) +
        txt(x0 + 102, 226, note, { s: 12, w: 700, c: "var(--text-dim)" });
      return s;
    };
    return svg(
      420,
      246,
      panel(4, "returns −1 when t > 0", ["A", "B", "C", "D", "E"], "numbers = processing order") +
        panel(212, "returns +1 when t > 0", ["E", "D", "C", "B", "A"], "first test: orient(pivot, 1, 2) = −8"),
    );
  }
  // same-angle tie-break: the dashed polygon loses the corner R
  function codeTie() {
    const P = { P: [0, 0], Q: [2, 0], R: [4, 0], S: [4, 4], T: [0, 4] };
    const X = (x) => 34 + x * 46,
      Y = (y) => 218 - y * 46;
    let s = "";
    for (let i = 0; i <= 5; i++)
      s += ln(X(i), Y(0), X(i), Y(5), "var(--line)", 1) + ln(X(0), Y(i), X(5), Y(i), "var(--line)", 1);
    s += `<polygon points="${["P", "Q", "S", "T"].map((k) => `${X(P[k][0])},${Y(P[k][1])}`).join(" ")}" fill="var(--rose-dim)" fill-opacity=".55" stroke="var(--rose)" stroke-width="3" stroke-dasharray="8 6"/>`;
    Object.entries(P).forEach(
      ([k, [x, y]]) =>
        (s += pk(
          k,
          circ(X(x), Y(y), 13, "var(--panel)", "var(--line-2)") + txt(X(x), Y(y) + 5, k, { s: 13, c: "var(--ink)" }),
        )),
    );
    s += txt(X(2.5), Y(5) + 2, "returned polygon", { s: 12, c: "var(--rose-ink)" });
    // the stack when Q arrives
    s += txt(330, 40, "stack when Q arrives", { s: 12, c: "var(--text-dim)" });
    s +=
      `<rect x="290" y="52" width="80" height="34" rx="8" fill="var(--blue-dim)" stroke="var(--blue)" stroke-width="2.5"/>` +
      txt(330, 74, "R (top)", { s: 13, c: "var(--ink)" });
    s +=
      `<rect x="290" y="88" width="80" height="34" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2.5"/>` +
      txt(330, 110, "P (bottom)", { s: 13, c: "var(--ink)" });
    s +=
      txt(330, 150, "orient(P, R, Q) = 0", { s: 12.5, c: "var(--amber-ink)" }) +
      txt(330, 168, "P, R, Q are in a line", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 244, s);
  }

  B.add("a5-code", [
    {
      type: "bug",
      q: "lowest(pts) should return the lowest point, and the leftmost one if two points are equally low. For [(5, 0), (0, 5)] it returns (0, 5), which is not the lowest. Click the faulty line.",
      code: [
        "def lowest(pts):",
        "    lx, ly = pts[0]",
        "    for x, y in pts:",
        "        if y < ly or x < lx:",
        "            lx, ly = x, y",
        "    return lx, ly",
      ],
      a: 3,
      why: "The x test must only break a tie in y. As written, any point further left replaces the pivot even when it is higher: (0, 5) beats (5, 0) on x. The fix is y < ly or (y == ly and x < lx). A wrong pivot is not on the hull, so everything after it goes wrong.",
    },
    {
      type: "pick",
      q: "The lab pops while the turn is not a left turn (cross ≤ 0). This worked trace of the scan on seven points has one wrong action. Each row is a test of the top two stack points and the new point. Click the row where the scan does the wrong thing.",
      fig: codeTrace(),
      a: "r3",
      hint: "Look at the rows where the cross product is exactly 0. What does the lab do with a straight line?",
      why: "In row 3, (6,0), (6,3) and (6,6) are in a straight line, so the cross product is 0 and the lab pops (6,3), the middle point of that edge. Row 1 shows the right behaviour for a 0: it pops. Row 4 confirms it, because it tests (0,0), (6,0), (6,6), which only happens after (6,3) has gone.",
    },
    {
      type: "cat",
      q: "With ax, ay = a − o and bx, by = b − o (y points up), orient(o, a, b) must be positive for a left turn, negative for a right turn and 0 for a straight line. Sort each candidate expression.",
      buckets: ["Left is positive", "Left is negative", "Not a turn test"],
      items: [
        ["<code>ax*by - ay*bx</code>", 0],
        ["<code>ay*bx - ax*by</code>", 1],
        ["<code>by*ax - bx*ay</code>", 0],
        ["<code>ax*bx + ay*by</code>", 2],
        ["<code>bx*ay - by*ax</code>", 1],
        ["<code>ax*by + ay*bx</code>", 2],
      ],
      hint: "Try o = (0, 0), a = (1, 0), b = (0, 1), a left turn. For the odd ones, also try a = (1, −1), b = (1, 1).",
      why: "ax*by − ay*bx is the cross product. Reordering its terms (by*ax − bx*ay) changes nothing, but swapping the two products (ay*bx − ax*by, bx*ay − by*ax) flips every sign, so left turns look negative. ax*bx + ay*by is the dot product, which measures alignment rather than turning, and ax*by + ay*bx adds where it should subtract, so it can read 0 for a real turn.",
    },
    {
      type: "mcq",
      q: "A student swaps the signs in the sort: compare returns +1 when t > 0 and −1 when t < 0 (the rest of the code is unchanged and still pops when orient ≤ 0). The panels show the order each version sorts the five points into. What does the scan return?",
      fig: codeOrders(),
      o: [
        "The full hull, listed clockwise instead",
        "Just two points: every test sees a right turn",
        "The same hull, as only the sort order moved",
        "Extra dented points, because nothing gets popped",
      ],
      a: 1,
      why: "The swapped sort visits the points clockwise, from the leftmost round to the right. Walking that way, every hull corner looks like a right turn, so orient ≤ 0 pops it every time. Only the pivot and the very last point survive. The turn test and the sort must agree about which direction is positive.",
    },
    {
      type: "pick",
      q: "The lab sorts points with the same angle from the pivot nearest first. A student sorts them farthest first instead. For these five points the scan returns the dashed polygon P, Q, S, T. Click the true hull corner that was lost.",
      fig: codeTie(),
      a: "R",
      why: "R (4, 0) comes first because it is farthest on the bottom edge, so it is pushed. Then Q (2, 0) arrives, the three points are in a line, the cross product is 0, and R is popped. The scan ends up treating Q as a corner and the real corner R is gone. Nearest first avoids this: Q goes on, then R arrives and pops Q, leaving the true corner.",
    },
  ]);

  /* =====================================================================
     a3-simplex
     ===================================================================== */
  // profit after each pivot: two pivots do not improve it
  function simplexSteps() {
    const z = [0, 12, 12, 12, 17, 21],
      X = (k) => 56 + k * 62,
      Y = (v) => 196 - v * 6.6;
    let s = "";
    for (let v = 0; v <= 24; v += 6)
      s +=
        ln(X(0), Y(v), X(5), Y(v), "var(--line)", 1.5) +
        txt(X(0) - 12, Y(v) + 4, v, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    s += `<polyline points="${z.map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    z.forEach((v, k) => {
      s +=
        k === 0
          ? circ(X(k), Y(v), 9, "var(--panel-2)", "var(--line-2)")
          : pk(
              String(k),
              circ(X(k), Y(v), 14, "var(--panel)", "var(--line-2)") +
                txt(X(k), Y(v) + 5, k, { s: 13, c: "var(--ink)" }),
            );
    });
    s +=
      txt(X(0), Y(0) + 22, "start", { s: 11, w: 700, c: "var(--text-faint)" }) +
      txt(X(3), Y(0) + 40, "pivot number", { s: 12, w: 700, c: "var(--text-dim)" }) +
      txt(X(0) - 10, 16, "profit z", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(400, 252, s);
  }
  // before and after tableaux (gain row = how much z rises per unit of each column)
  function simplexTableau() {
    const head = ["", "x", "y", "s1", "s2", "s3", "RHS"],
      cols = [46, 50, 50, 50, 50, 50, 58];
    const before = [
      head,
      ["s1", "1", "1", "1", "0", "0", "6"],
      ["s2", "1", "3", "0", "1", "0", "12"],
      ["s3", { t: "1", fill: "var(--amber-dim)", c: "var(--amber-ink)" }, "0", "0", "0", "1", "4"],
      ["gain", "3", "2", "0", "0", "0", "z = 0"],
    ];
    const after = [
      head,
      ["s1", "0", "1", "1", "0", "+1", "2"],
      ["s2", "0", "3", "0", "1", "−1", "8"],
      ["x", "1", "0", "0", "0", "1", "4"],
      ["gain", "0", "2", "0", "0", "−3", "z = 12"],
    ];
    const rn = ["s1", "s2", "x", "gain"];
    let s = txt(8, 18, "Before: pivot on the orange cell (x enters, s3 leaves)", {
      a: "start",
      s: 12.5,
      c: "var(--ink)",
    });
    s += table(8, 26, cols, 25, before);
    s += txt(8, 176, "After the pivot: one entry is wrong. Click it.", { a: "start", s: 12.5, c: "var(--ink)" });
    s += table(
      8,
      184,
      cols,
      25,
      after.map((r, i) =>
        i === 0 ? r : r.map((c, j) => (j === 0 ? { t: c, fill: "var(--panel-2)", c: "var(--text-dim)" } : c)),
      ),
    );
    // pickable overlays on the six value columns of the four body rows
    ["x", "y", "s1", "s2", "s3", "RHS"].forEach((col, j) =>
      rn.forEach((r, i) => {
        const x = 8 + cols[0] + cols.slice(1, j + 1).reduce((a, b) => a + b, 0),
          w = cols[j + 1];
        s += pk(
          `${r}-${col}`,
          `<rect x="${x}" y="${184 + 25 * (i + 1)}" width="${w}" height="25" fill="transparent" stroke="transparent" stroke-width="1"/>`,
        );
      }),
    );
    return svg(420, 320, s);
  }
  // raise-the-variable gains for the four variables at 0
  function simplexGains() {
    const v = [
        ["x1", 2],
        ["x2", -3],
        ["x3", 4],
        ["x4", 0],
      ],
      base = 116,
      k = 22;
    let s =
      ln(30, base, 400, base, "var(--ink)", 2.5) +
      txt(14, base + 4, "0", { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    [-4, -2, 2, 4].forEach(
      (g) =>
        (s +=
          ln(30, base - g * k, 400, base - g * k, "var(--line)", 1) +
          txt(24, base - g * k + 4, (g > 0 ? "+" : "") + g, { a: "end", s: 11, w: 700, c: "var(--text-faint)" })),
    );
    v.forEach(([name, g], i) => {
      const x = 62 + i * 88,
        h = Math.abs(g) * k,
        y = g >= 0 ? base - h : base;
      s += pk(
        name,
        `<rect x="${x - 40}" y="12" width="80" height="208" fill="transparent" stroke="transparent"/><rect x="${x - 22}" y="${g === 0 ? base - 2 : y}" width="44" height="${g === 0 ? 4 : h}" rx="5" fill="${g > 0 ? "var(--teal)" : g < 0 ? "var(--rose)" : "var(--text-faint)"}"/>` +
          txt(x, g > 0 ? y - 7 : g < 0 ? y + h + 16 : base - 12, (g > 0 ? "+" : "") + g, { s: 13, c: "var(--ink)" }) +
          txt(x, 238, name, { s: 14, c: "var(--ink)" }),
      );
    });
    s += txt(210, 258, "z gain per unit raised", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 266, s);
  }
  // open feasible region with four objectives
  function simplexOpen() {
    const dirs = {
      A: [1, 1, "max x + y"],
      B: [-1, 1, "max y − x"],
      C: [1, -1, "max x − y"],
      D: [-1, -1, "max −x − y"],
    };
    let s = "";
    ["A", "B", "C", "D"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208,
        y0 = 4 + Math.floor(i / 2) * 176,
        ox = x0 + 26,
        oy = y0 + 126,
        u = 28;
      const P = (x, y) => `${ox + x * u},${oy - y * u}`;
      s += `<rect x="${x0}" y="${y0}" width="200" height="168" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      s += `<polygon points="${P(0, 0)} ${P(0, 1)} ${P(2.9, 3.9)} ${P(6.1, 3.9)} ${P(6.1, 0)}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2.5" stroke-linejoin="round"/>`;
      s += txt(ox + 4.9 * u, oy - 0.45 * u, "open →", { s: 11, w: 700, c: "var(--teal-ink)" });
      const [dx, dy, lab] = dirs[k],
        cx = ox + 2.9 * u,
        cy = oy - 1.7 * u,
        L = 44 / Math.hypot(dx, dy);
      s += arrow(cx - dx * L * 0.35, cy + dy * L * 0.35, cx + dx * L, cy - dy * L, "var(--amber)", 4);
      s +=
        txt(x0 + 100, y0 + 158, lab, { s: 13, c: "var(--ink)" }) +
        txt(x0 + 12, y0 + 22, k, { a: "start", s: 15, c: "var(--text-dim)" });
    });
    return svg(420, 356, s);
  }
  Object.assign(partScope, { simplexGains, simplexOpen, simplexSteps, simplexTableau });
})();

(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});
  const { arrow, circ, dot, ln, pk, plane, rect, svg, txt } = partScope;
  const B = NIC.bank;

  /* =====================================================================
     a5-wrap
     ===================================================================== */
  const wrapPanels = (() => {
    const P = {
      A: [
        [0, 2],
        [4, 0],
        [9, 1],
        [10, 6],
        [6, 10],
        [1, 9],
        [3, 4],
        [5, 3],
        [6, 5],
        [4, 6],
        [7, 3],
        [5, 5],
      ],
      B: [
        [5, 0],
        [8, 1],
        [10, 4],
        [9, 7],
        [6, 9],
        [3, 9],
        [1, 7],
        [0, 4],
        [2, 1],
        [7, 10],
        [4, 0],
        [10, 6],
      ],
      C: [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [3, 3],
        [5, 2],
        [7, 4],
        [4, 5],
        [6, 6],
        [2, 7],
        [8, 8],
        [5, 8],
      ],
    };
    let g = "";
    ["A", "B", "C"].forEach((k, p) => {
      const x0 = 8 + p * 150,
        X = (x) => x0 + 14 + x * 11.2,
        Y = (y) => 168 - y * 12.4;
      g +=
        rect(x0, 6, 140, 184, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 70, 22, `Panel ${k}`, { s: 13, c: "var(--ink)" });
      P[k].forEach(([x, y]) => (g += circ(X(x), Y(y), 5.5, "var(--blue)", "var(--panel)", 1.5)));
      g += txt(x0 + 70, 184, "12 points", { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(460, 196, g);
  })();

  // ten points, five arrows drawn by a learner (arrow 3 skips the corner (10, 6))
  const wrapArrows = (() => {
    const p = plane(10, 9, 40, 20, 400, 290, false);
    const H = { 1: [1, 2], 2: [5, 0], 3: [9, 2], 4: [10, 6], 5: [6, 9], 6: [2, 8] };
    const I = [
      [5, 4],
      [4, 6],
      [7, 5],
      [3, 3],
    ];
    let g = "";
    I.forEach(([x, y]) => (g += circ(p.X(x), p.Y(y), 7, "var(--panel)", "var(--line-2)", 3)));
    Object.values(H).forEach(([x, y]) => (g += circ(p.X(x), p.Y(y), 7, "var(--panel)", "var(--line-2)", 3)));
    const path = [
      [1, 2, "s1"],
      [2, 3, "s2"],
      [3, 5, "s3"],
      [5, 6, "s4"],
      [6, 1, "s5"],
    ];
    path.forEach(([a, b, id], i) => {
      const [x1, y1] = H[a],
        [x2, y2] = H[b],
        mx = (p.X(x1) + p.X(x2)) / 2,
        my = (p.Y(y1) + p.Y(y2)) / 2;
      const dx = p.X(x2) - p.X(x1),
        dy = p.Y(y2) - p.Y(y1),
        d = Math.hypot(dx, dy);
      const ox = (dy / d) * 16,
        oy = (-dx / d) * 16;
      g += pk(
        id,
        arrow(
          p.X(x1) + (dx / d) * 9,
          p.Y(y1) + (dy / d) * 9,
          p.X(x2) - (dx / d) * 9,
          p.Y(y2) - (dy / d) * 9,
          "var(--blue)",
          4,
        ) +
          ln(p.X(x1), p.Y(y1), p.X(x2), p.Y(y2), "transparent", 22) +
          circ(mx - ox, my - oy, 11, "var(--panel)", "var(--blue)", 2) +
          txt(mx - ox, my - oy + 4, i + 1, { s: 12, c: "var(--ink)" }),
      );
    });
    return svg(420, 308, g);
  })();

  // cost per input point against n (log scale ticks), hull stays at 8 points
  const wrapPlot = (() => {
    const ns = [16, 32, 64, 128, 256, 512, 1024],
      x0 = 58,
      x1 = 440,
      y0 = 24,
      y1 = 226;
    const X = (i) => x0 + 18 + i * ((x1 - x0 - 36) / 6),
      Y = (v) => y1 - (v / 12) * (y1 - y0);
    let g = "";
    [0, 4, 8, 12].forEach(
      (v) =>
        (g +=
          ln(x0, Y(v), x1, Y(v), "var(--line)", 1) +
          txt(x0 - 8, Y(v) + 4, v, { a: "end", s: 12, w: 700, c: "var(--text-dim)" })),
    );
    ns.forEach((n, i) => (g += txt(X(i), y1 + 18, n, { s: 11, w: 700, c: "var(--text-dim)" })));
    g +=
      ln(X(0), Y(8), X(6), Y(8), "var(--amber)", 3, 'stroke-dasharray="8 5"') +
      txt(X(0) + 4, Y(8) - 10, "gift wrapping: h = 8", { a: "start", s: 12, c: "var(--amber-ink)" });
    g += `<polyline points="${ns.map((n, i) => `${X(i)},${Y(Math.log2(n))}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
    ns.forEach((n, i) => (g += dot(X(i), Y(Math.log2(n)), "", { r: 9, id: "n" + n, stroke: "var(--blue)" })));
    g +=
      txt(X(4), Y(12) + 4, "Graham scan: log₂ n", { s: 12, c: "var(--blue-ink)" }) +
      txt((x0 + x1) / 2, y1 + 38, "number of points n", { s: 12, c: "var(--text-dim)" }) +
      txt(6, 12, "work per point", { a: "start", s: 11, c: "var(--text-dim)" });
    return svg(460, 268, g);
  })();

  // angle diagram: scan order of six candidate points seen from the current point
  const wrapAngles = (() => {
    const cx = 40,
      cy = 232,
      d2r = Math.PI / 180,
      k = 1.2;
    const C = [
      [72, 150],
      [55, 175],
      [80, 118],
      [31, 185],
      [44, 150],
      [18, 168],
    ];
    let g = ln(cx, cy, 410, cy, "var(--line)", 2) + txt(392, cy - 8, "east", { s: 11, w: 700, c: "var(--text-dim)" });
    C.forEach(([a, d], i) => {
      const x = cx + d * k * Math.cos(a * d2r),
        y = cy - d * k * Math.sin(a * d2r);
      g += ln(cx, cy, x, y, "var(--line-2)", 2, 'stroke-dasharray="3 5"') + dot(x, y, i + 1, { r: 12, s: 13 });
    });
    g +=
      circ(cx, cy, 11, "var(--teal)", "var(--teal)") +
      txt(cx + 8, cy + 22, "cur", { a: "start", s: 13, c: "var(--teal-ink)" });
    return svg(420, 256, g);
  })();

  B.add("a5-wrap", [
    {
      type: "order",
      q: "Gift wrapping costs about n × h, where h is the number of points on the hull. Each panel has 12 points, placed differently. Put the panels in order of work, least first.",
      fig: wrapPanels,
      items: ["Panel C", "Panel A", "Panel B"],
      hint: "Count the points on the outside boundary of each panel. Interior points add nothing to h.",
      why: "Panel C has four corner points with eight inside (h = 4: about 12 × 4 = 48 checks). Panel A has six on its boundary (h = 6, about 72). Panel B has almost every point on the boundary (h = 10, about 120). Same n, so the cost follows the hull size alone. That is what 'output-sensitive' means.",
    },
    {
      type: "pick",
      q: "A learner ran gift wrapping on ten points, counter-clockwise from the leftmost point, and drew five numbered arrows. One arrow is a mistake: gift wrapping would never draw it. Click that arrow.",
      fig: wrapArrows,
      a: "s3",
      hint: "At each hull point, the next point must have every other point on its left. Is any point outside an arrow?",
      why: "Arrow 3 goes from the bottom-right corner straight to the top, but the point at (10, 6) lies outside it, on its right. Gift wrapping would have picked that point: it is the one with all other points on its left. The other four arrows each have every point on their left, so they are real hull edges. Interior points are never reached.",
    },
    {
      type: "pick",
      q: "The hull has 8 points however many points there are. Gift wrapping does about 8 checks per input point, and Graham scan about log₂ n (its sort). Click the first n at which gift wrapping does LESS work per point than Graham scan.",
      fig: wrapPlot,
      a: "n512",
      hint: "log₂ 256 = 8. Is the blue line above or below the dashed line when gift wrapping wins?",
      why: "Gift wrapping is flat at 8 per point; Graham's sorting cost per point grows as log₂ n: 4, 5, 6, 7, 8, 9, 10. At n = 256 they tie (8 against 8). Only from 512 (log₂ 512 = 9) is gift wrapping strictly cheaper. With a small, fixed hull, MORE points favours gift wrapping, because it never pays for sorting.",
    },
    {
      type: "slider",
      min: 0,
      max: 6,
      step: 1,
      start: 1,
      ans: 3,
      tol: 0,
      unit: "changes",
      q: "Gift wrapping stands at the lowest point cur, and all six candidate points are above it. The inner loop sets nxt to point 1, then scans points 2 to 6 in order. nxt changes whenever the scanned point is to the RIGHT of the arrow cur → nxt. The angles (above east) are 72°, 55°, 80°, 31°, 44° and 18°. How many times does nxt change?",
      fig: wrapAngles,
      hint: "A point to the right of cur → nxt has a smaller angle than nxt. Track the smallest angle seen so far.",
      why: "The loop keeps the smallest angle so far. Start: 72°. Point 2 (55°) is smaller: change 1. Point 3 (80°): no. Point 4 (31°): change 2. Point 5 (44°): no. Point 6 (18°): change 3. So nxt ends on point 6 after changing 3 times, and point 6 is the true next hull point: every other point is on its left.",
    },
    {
      type: "match",
      q: "A set of 100 points has a hull of 10 corners, so gift wrapping does about 100 × 10 = 1,000 checks. Match each change with what happens to the work.",
      pairs: [
        ["Add 100 more points, all inside the hull", "About twice the work"],
        ["Pull the hull out to 40 corners (still 100 points)", "About four times the work"],
        ["Move the interior points about, all still inside", "No change"],
        ["Delete 50 interior points", "About half the work"],
      ],
      hint: "Work is n × h. Which of the two numbers does each change touch?",
      why: "Work is about n × h. Adding 100 interior points doubles n and leaves h at 10: 2,000 checks. Pulling the hull out to 40 multiplies h by 4: 4,000. Moving interior points around changes neither. Deleting 50 interior points halves n: 500. Interior points only ever cost you a check per step; they never create more steps.",
    },
  ]);

  /* =====================================================================
     a5-graham
     ===================================================================== */
  const stackPlot = (() => {
    const sizes = [1, 2, 3, 4, 4, 3, 4, 5, 5],
      x0 = 52,
      x1 = 440,
      y0 = 22,
      y1 = 214;
    const X = (i) => x0 + 12 + i * ((x1 - x0 - 24) / 8),
      Y = (v) => y1 - ((v - 0.5) / 5.5) * (y1 - y0);
    let g = "";
    [1, 2, 3, 4, 5, 6].forEach(
      (v) =>
        (g +=
          ln(x0, Y(v), x1, Y(v), "var(--line)", 1) +
          txt(x0 - 8, Y(v) + 4, v, { a: "end", s: 12, w: 700, c: "var(--text-dim)" })),
    );
    sizes.forEach((v, i) => (g += txt(X(i), y1 + 18, i === 0 ? "start" : i, { s: 11, w: 700, c: "var(--text-dim)" })));
    g += `<polyline points="${sizes.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    sizes.forEach(
      (v, i) =>
        (g +=
          i === 0
            ? circ(X(i), Y(v), 7, "var(--teal)", "var(--teal)", 2)
            : dot(X(i), Y(v), "", { r: 9, id: "p" + i, stroke: "var(--blue)" })),
    );
    g +=
      txt((x0 + x1) / 2, y1 + 38, "points processed so far", { s: 12, c: "var(--text-dim)" }) +
      txt(6, 12, "stack height", { a: "start", s: 11, c: "var(--text-dim)" });
    return svg(460, 258, g);
  })();

  // four stack snapshots
  const snaps = (() => {
    const S = [
      ["1", "after pushing D", ["P0", "A", "C", "D"]],
      ["2", "after pushing E", ["P0", "B", "D", "E"]],
      ["3", "after pushing F", ["P0", "A", "C", "D"]],
      ["4", "after pushing E", ["P0", "A", "E"]],
    ];
    let g = "";
    S.forEach(([n, cap, st], i) => {
      const x0 = 8 + i * 114,
        base = 214;
      g +=
        rect(x0, 6, 106, 226, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 53, 26, `Snapshot ${n}`, { s: 13, c: "var(--ink)" }) +
        txt(x0 + 53, 44, cap, { s: 11, w: 700, c: "var(--text-dim)" });
      st.forEach((p, k) => {
        const y = base - (k + 1) * 36,
          bottom = k === 0;
        g +=
          rect(
            x0 + 24,
            y,
            58,
            32,
            bottom ? "var(--teal)" : "var(--panel-2)",
            bottom ? "var(--teal)" : "var(--line-2)",
            2,
            6,
          ) + txt(x0 + 53, y + 21, p, { s: 14, c: bottom ? "#fff" : "var(--ink)" });
      });
    });
    return svg(470, 238, g);
  })();

  // 100% stacked bars: sort share against scan share
  const shareBars = (() => {
    const D = [
      ["1,000", 16.7],
      ["10,000", 13.1],
      ["100,000", 10.7],
      ["1,000,000", 9.1],
    ];
    let g = txt(230, 16, "share of the whole run: sort (blue) and scan (amber)", { s: 12, c: "var(--ink)" });
    D.forEach(([n, sc], i) => {
      const x = 40 + i * 104,
        top = 30,
        H = 170,
        hs = (sc / 100) * H;
      g += `<rect x="${x}" y="${top}" width="70" height="${H - hs}" rx="4" fill="var(--blue)"/><rect x="${x}" y="${top + H - hs}" width="70" height="${hs}" rx="4" fill="var(--amber)"/>`;
      g +=
        txt(x + 35, top + (H - hs) / 2 + 5, (100 - sc).toFixed(1) + "%", { s: 13, c: "#fff" }) +
        txt(x + 35, top + H - hs / 2 + 4, sc + "%", { s: 11, c: "#fff" }) +
        txt(x + 35, top + H + 18, "n = " + n, { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(460, 238, g);
  })();

  // scatter: which points end off the final stack
  const hullScatter = (() => {
    const p = plane(10, 9, 30, 20, 400, 290, true);
    const P = { a: [6, 0], b: [10, 0], c: [10, 4], d: [10, 8], e: [7, 6], f: [4, 9], g: [0, 5], h: [5, 4], i: [3, 3] };
    let g =
      p.g +
      circ(p.X(2), p.Y(0), 12, "var(--teal)", "var(--teal)") +
      txt(p.X(2), p.Y(0) + 4, "P0", { s: 11, c: "#fff" });
    Object.entries(P).forEach(([k, [x, y]]) => (g += dot(p.X(x), p.Y(y), k, { r: 11, id: k, s: 13 })));
    return svg(420, 316, g);
  })();

  // stack before and after, plus the plane
  const stackScene = (() => {
    const px0 = 204,
      px1 = 452,
      py0 = 14,
      py1 = 292,
      X = (x) => px0 + (x / 12) * (px1 - px0),
      Y = (y) => py1 - (y / 12) * (py1 - py0);
    let g = "";
    for (let i = 0; i <= 12; i += 2)
      g += ln(X(i), Y(0), X(i), Y(12), "var(--line)", 1) + ln(X(0), Y(i), X(12), Y(i), "var(--line)", 1);
    const P0 = [0, 0],
      A = [8, 9],
      Bp = [5, 10],
      C = [3, 7];
    g += `<polyline points="${[P0, A, Bp, C].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
    g += circ(X(0), Y(0), 11, "var(--teal)", "var(--teal)") + txt(X(0) + 2, Y(0) + 4, "P0", { s: 10, c: "#fff" });
    [
      ["A", A],
      ["B", Bp],
      ["C", C],
    ].forEach(([n, [x, y]]) => (g += dot(X(x), Y(y), n, { r: 11, stroke: "var(--teal)" })));
    [
      ["d1", [1, 3]],
      ["d2", [0, 7]],
      ["d3", [2, 11]],
      ["d4", [3, 11]],
      ["d5", [2, 5]],
    ].forEach(
      ([id, [x, y]], i) =>
        (g += pk(
          id,
          circ(X(x), Y(y), 10, "var(--panel)", "var(--amber)", 3) +
            txt(X(x), Y(y) + 4, i + 1, { s: 12, c: "var(--ink)" }),
        )),
    );
    const col = (x, title, st, last) => {
      let s = txt(x + 42, 22, title, { s: 12, c: "var(--ink)" });
      st.forEach((p, k) => {
        const y = 262 - k * 38,
          bottom = k === 0,
          top = last && k === st.length - 1;
        s +=
          rect(
            x,
            y,
            84,
            32,
            bottom ? "var(--teal)" : top ? "var(--amber)" : "var(--panel-2)",
            bottom ? "var(--teal)" : top ? "var(--amber)" : "var(--line-2)",
            2,
            6,
          ) + txt(x + 42, y + 21, p, { s: 14, c: bottom || top ? "#fff" : "var(--ink)" });
      });
      return s;
    };
    g += col(4, "Before", ["P0", "A", "B", "C"], false) + col(96, "After", ["P0", "A", "D"], true);
    return svg(460, 304, g);
  })();
  Object.assign(partScope, { hullScatter, shareBars, snaps, stackPlot, stackScene });
})();

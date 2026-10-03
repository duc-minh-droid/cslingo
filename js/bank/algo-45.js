/* ===== bank-y-algo-2.js ===== */
/* Revision bank, fourth set: fills the gaps in the third set (algo-2).
   Modules: a4-cut, a4-mst, a5-orient, a5-wrap, a5-graham (5 each) and l2-mst (5).
   Every figure is inline SVG built here, and each module uses a different diagram kind per question (adjacency matrix, line plots,
   small-multiple bars, tree with a removed link, union-find forest, trace table, grouped bars, regions, dial, turn strips, grids,
   scatter panels, angle diagram, stack boxes, map, number line, ring). Every number was checked by running the real algorithms
   (Prim, Kruskal, monotone-chain hull, Graham scan with pop-on-straight, cross products). Questions stand alone. */
(function () {
  const partScope = (NIC.shared.bankAlgo = NIC.shared.bankAlgo || {});

  const B = NIC.bank;
  const txt = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, inner) =>
    `<svg viewBox="0 0 ${w} ${h}" style="display:block;width:100%;max-height:${h}px">${inner}</svg>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const ln = (x1, y1, x2, y2, c, w, extra = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const circ = (x, y, r, fill, stroke, sw = 3) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const rect = (x, y, w, h, fill, stroke, sw = 2, r = 6) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const arrow = (x1, y1, x2, y2, c, w = 3) => {
    const a = Math.atan2(y2 - y1, x2 - x1),
      h = 9;
    const p = [
      [x2, y2],
      [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)],
      [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)],
    ];
    return (
      ln(x1, y1, x2 - h * 0.6 * Math.cos(a), y2 - h * 0.6 * Math.sin(a), c, w) +
      `<polygon points="${p.map((q) => q.join(",")).join(" ")}" fill="${c}"/>`
    );
  };
  const MINUS = "−";
  const sgn = (v) => (v > 0 ? "+" + v : v < 0 ? MINUS + Math.abs(v) : "0");
  /* label with a panel-coloured halo so it stays readable over lines */
  const wl = (x, y, s, c = "var(--text-dim)", z = 13) =>
    `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 ${z}px var(--sans);fill:${c};paint-order:stroke;stroke:var(--panel);stroke-width:4px;stroke-linejoin:round">${s}</text>`;
  /* maths plane, y up */
  const plane = (mx, my, x0, y0, x1, y1, grid = true) => {
    const X = (x) => x0 + (x / mx) * (x1 - x0),
      Y = (y) => y1 - (y / my) * (y1 - y0);
    let g = "";
    if (grid) for (let i = 0; i <= mx; i++) g += ln(X(i), Y(0), X(i), Y(my), "var(--line)", 1);
    if (grid) for (let j = 0; j <= my; j++) g += ln(X(0), Y(j), X(mx), Y(j), "var(--line)", 1);
    return { X, Y, g };
  };
  const dot = (x, y, label, o = {}) => {
    const g =
      circ(x, y, o.r || 11, o.fill || "var(--panel)", o.stroke || "var(--line-2)") +
      (label === "" ? "" : txt(x, y + 4, label, { s: o.s || 12, c: o.tc || "var(--ink)" }));
    return o.id ? pk(o.id, g) : g;
  };

  /* =====================================================================
     a4-cut
     ===================================================================== */
  // adjacency matrix, upper triangle; S = {A, C, E} amber
  const cutMatrix = (() => {
    const N = "ABCDEF".split(""),
      S = new Set(["A", "C", "E"]);
    const W = {
      AB: 7,
      AC: 1,
      AD: 9,
      AE: 3,
      AF: "–",
      BC: 6,
      BD: 2,
      BE: 4,
      BF: 3,
      CD: 5,
      CE: 2,
      CF: 8,
      DE: "–",
      DF: 6,
      EF: 10,
    };
    const x0 = 50,
      y0 = 44,
      cw = 58,
      ch = 36;
    let g = "";
    N.forEach((n, i) => {
      const inS = S.has(n);
      g +=
        rect(
          x0 + i * cw + 6,
          8,
          cw - 12,
          28,
          inS ? "var(--amber)" : "var(--panel-2)",
          inS ? "var(--amber)" : "var(--line-2)",
          2,
        ) + txt(x0 + i * cw + cw / 2, 28, n, { c: inS ? "#fff" : "var(--ink)", s: 14 });
      g +=
        rect(
          8,
          y0 + i * ch + 4,
          34,
          ch - 8,
          inS ? "var(--amber)" : "var(--panel-2)",
          inS ? "var(--amber)" : "var(--line-2)",
          2,
        ) + txt(25, y0 + i * ch + ch / 2 + 5, n, { c: inS ? "#fff" : "var(--ink)", s: 14 });
    });
    N.forEach((r, i) =>
      N.forEach((c, j) => {
        const x = x0 + j * cw,
          y = y0 + i * ch;
        if (i < j) {
          const k = r + c;
          g += pk(
            k,
            rect(x + 2, y + 2, cw - 4, ch - 4, "var(--panel)", "var(--line-2)", 2, 6) +
              txt(x + cw / 2, y + ch / 2 + 5, W[k], { s: 14, c: W[k] === "–" ? "var(--text-dim)" : "var(--ink)" }),
          );
        } else g += rect(x + 2, y + 2, cw - 4, ch - 4, "var(--panel-2)", "none", 0, 6);
      }),
    );
    g += txt(x0 + 3 * cw, y0 + 6 * ch + 22, "amber towns = group S, – = no cable", {
      s: 12,
      w: 700,
      c: "var(--text-dim)",
    });
    return svg(410, y0 + 6 * ch + 32, g);
  })();

  // graph + line plot: MST cost against the weight w of the dashed link B-D
  const cutPlot = (() => {
    const nd = { A: [70, 30], B: [210, 30], C: [210, 100], D: [70, 100] };
    let g = "";
    [
      ["A", "B", 2, 0, -9],
      ["B", "C", 3, 11, 4],
      ["C", "D", 4, 0, 18],
      ["A", "D", 7, -11, 4],
      ["A", "C", 5, -34, -18],
    ].forEach(([a, b, w, dx, dy]) => {
      g += ln(nd[a][0], nd[a][1], nd[b][0], nd[b][1], "var(--line-2)", 3);
      g += wl((nd[a][0] + nd[b][0]) / 2 + dx, (nd[a][1] + nd[b][1]) / 2 + dy + 4, w);
    });
    g +=
      ln(nd.B[0], nd.B[1], nd.D[0], nd.D[1], "var(--amber)", 3, 'stroke-dasharray="7 5"') +
      wl(172, 52, "w", "var(--amber-ink)", 15);
    Object.entries(nd).forEach(([k, [x, y]]) => (g += dot(x, y, k, { r: 15, s: 14 })));
    g +=
      txt(300, 55, "dashed B–D costs w", { a: "start", s: 13, c: "var(--amber-ink)" }) +
      txt(300, 76, "(w changes along the", { a: "start", s: 12, w: 700, c: "var(--text-dim)" }) +
      txt(300, 92, "bottom axis of the chart)", { a: "start", s: 12, w: 700, c: "var(--text-dim)" });
    // plot
    const px0 = 62,
      px1 = 440,
      py0 = 150,
      py1 = 290,
      X = (w) => px0 + ((w - 1) / 8) * (px1 - px0 - 20) + 10,
      Y = (t) => py1 - ((t - 5.5) / 4) * (py1 - py0);
    [6, 7, 8, 9].forEach(
      (t) =>
        (g +=
          ln(px0, Y(t), px1, Y(t), "var(--line)", 1) +
          txt(px0 - 8, Y(t) + 4, t, { a: "end", s: 12, w: 700, c: "var(--text-dim)" })),
    );
    for (let w = 1; w <= 9; w++) g += txt(X(w), py1 + 18, w, { s: 12, w: 700, c: "var(--text-dim)" });
    const tot = [6, 7, 8, 9, 9, 9, 9, 9, 9];
    g += `<polyline points="${tot.map((t, i) => `${X(i + 1)},${Y(t)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    [1, 2, 3, 4, 5, 6, 8].forEach(
      (w) => (g += dot(X(w), Y(tot[w - 1]), "", { r: 9, id: "w" + w, fill: "var(--panel)", stroke: "var(--blue)" })),
    );
    g +=
      txt((px0 + px1) / 2, py1 + 38, "w, the cost of B–D", { s: 12, c: "var(--text-dim)" }) +
      txt(6, py0 - 14, "cheapest total", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(460, 335, g);
  })();

  // small multiples: weights of the edges crossing three cuts
  const cutPanels = (() => {
    const P = [[4, 4, 7, 9], [8], [2, 6, 6]];
    let g = "";
    P.forEach((ws, p) => {
      const x0 = 8 + p * 150,
        base = 170;
      g +=
        rect(x0, 6, 140, 190, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 70, 26, `Cut ${p + 1}`, { s: 13, c: "var(--ink)" });
      const bw = 24,
        gap = 8,
        tw = ws.length * bw + (ws.length - 1) * gap,
        sx = x0 + 70 - tw / 2;
      ws.forEach((w, i) => {
        const h = w * 11,
          x = sx + i * (bw + gap);
        g += pk(
          `${p + 1}${"abcd"[i]}`,
          `<rect x="${x}" y="${base - h}" width="${bw}" height="${h}" rx="5" fill="var(--blue)"/>` +
            txt(x + bw / 2, base - h - 5, w, { s: 13, c: "var(--ink)" }),
        );
      });
      g +=
        ln(x0 + 12, base, x0 + 128, base, "var(--line-2)", 2) +
        txt(x0 + 70, base + 16, "crossing edges", { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(460, 204, g);
  })();

  // MST drawn as a tree, one tree link removed, grey spare links
  const cutSwap = (() => {
    const nd = { A: [50, 50], B: [200, 35], C: [350, 55], D: [50, 190], E: [200, 175], F: [350, 190] };
    let g = "";
    const L = (a, b, c, w, extra = "") => ln(nd[a][0], nd[a][1], nd[b][0], nd[b][1], c, w, extra);
    [
      ["D", "E", 7, 0, 14],
      ["E", "F", 8, 0, 15],
      ["A", "E", 9, -4, -8],
      ["B", "F", 10, 6, -10],
    ].forEach(([a, b, w, dx, dy]) => {
      const id = a + "-" + b;
      g += pk(
        id,
        L(a, b, "var(--line-2)", 3, 'stroke-dasharray="3 6"') +
          L(a, b, "transparent", 22) +
          wl((nd[a][0] + nd[b][0]) / 2 + dx, (nd[a][1] + nd[b][1]) / 2 + dy + 4, w),
      );
    });
    [
      ["B", "E", 2, 12, 4],
      ["A", "B", 3, 0, -8],
      ["A", "D", 4, -12, 4],
      ["C", "F", 6, 12, 4],
    ].forEach(
      ([a, b, w, dx, dy]) =>
        (g +=
          L(a, b, "var(--teal)", 5) +
          wl((nd[a][0] + nd[b][0]) / 2 + dx, (nd[a][1] + nd[b][1]) / 2 + dy + 4, w, "var(--teal-ink)")),
    );
    g +=
      L("B", "C", "var(--rose)", 5, 'stroke-dasharray="8 6"') +
      wl(277, 36, "5", "var(--rose-ink)") +
      txt(277, 66, "removed", { s: 12, c: "var(--rose-ink)" });
    Object.entries(nd).forEach(([k, [x, y]]) => (g += dot(x, y, k, { r: 16, s: 14 })));
    return svg(410, 222, g);
  })();

  // sorted weights, then the same weights squared: same order
  const cutOrder = (() => {
    const a = [1, 2, 4, 5, 7],
      b = a.map((v) => v * v);
    let g = "";
    [
      [a, "weights", "var(--blue)", 8, 0],
      [b, "squared", "var(--violet)", 1.2, 1],
    ].forEach(([vals, name, col, k, row]) => {
      const x0 = 120,
        base = 86 + row * 100;
      g += txt(60, base - 24, name, { s: 13, c: "var(--ink)" });
      vals.forEach((v, i) => {
        const h = Math.max(4, v * k),
          x = x0 + i * 58;
        g +=
          `<rect x="${x}" y="${base - h}" width="38" height="${h}" rx="5" fill="${col}"/>` +
          txt(x + 19, base - h - 5, v, { s: 12, c: "var(--ink)" });
      });
      g += ln(x0 - 8, base, x0 + 5 * 58 - 12, base, "var(--line-2)", 2);
    });
    g += txt(235, 206, "the order is identical", { s: 13, c: "var(--teal-ink)" });
    return svg(430, 212, g);
  })();

  B.add("a4-cut", [
    {
      type: "pick",
      q: "Six towns, with the cost of each possible cable in the table (– means no cable). Group S is the three amber towns A, C and E. A cable crosses the cut when one end is in S and the other is not. Click the cell of the cable that the cut property guarantees is in some cheapest network.",
      fig: cutMatrix,
      a: "BE",
      hint: "Ignore any cell where both towns are amber, or both are grey. Of what is left, take the smallest.",
      why: "The crossing cables are A–B 7, A–D 9, B–C 6, C–D 5, C–F 8, B–E 4 and E–F 10. The lightest is B–E at 4, so it is in some cheapest network. The tempting cell A–C (1) is the lightest overall, but both its towns are in S, so it does not cross this cut: it says nothing here.",
    },
    {
      type: "pick",
      q: "A network has the cables shown with their costs, and a dashed cable B–D that costs w. The line chart gives the cost of the cheapest network for each w. Click every marked w for which B–D is in EVERY cheapest network.",
      fig: cutPlot,
      a: ["w1", "w2", "w3"],
      hint: "B–D closes the loop B–C–D (3, 4 and w). A cable on a loop is only certain to be dropped when it is strictly the heaviest.",
      why: "On the loop B–C–D the costs are 3, 4 and w. While w is below 4, the cable C–D (4) is the strict heaviest, so it is always dropped and B–D is forced in: the total rises with w (6, 7, 8). At w = 4 there is a tie, so B–D or C–D can go: B–D is only in SOME cheapest tree, and the total stops rising. Above 4, B–D is the heaviest on the loop, so it is never used and the total stays at 9.",
    },
    {
      type: "pick",
      q: "Each panel shows the weights of the edges that cross one cut of some graph. Use only the cut property. Click every bar that is guaranteed to be in some minimum spanning tree.",
      fig: cutPanels,
      a: ["1a", "1b", "2a", "3a"],
      hint: "Look at each panel on its own. Ask what the lightest crossing edge is, and what happens if there is only one crossing edge.",
      why: "Cut 1 has two lightest edges (4 and 4): either one is safe on its own, so both are guaranteed to be in some tree. Cut 2 has a single crossing edge, so its weight does not matter: it is the lightest crossing edge by default, and the graph would be disconnected without it. Cut 3 guarantees only its 2. The two 6s are not lightest, so the cut property does not promise them.",
    },
    {
      type: "pick",
      q: "The green links are the cheapest network (total 20). You remove the dashed red link B–C, which splits the towns into {A, B, D, E} and {C, F}. Click the grey link that rebuilds a cheapest connected network at the lowest extra cost.",
      fig: cutSwap,
      a: "E-F",
      hint: "A link only helps if one end is in each group. Cross out grey links with both ends in the same group.",
      why: "The groups are {A, B, D, E} and {C, F}. D–E (7) and A–E (9) have both ends on the left, so they cannot reconnect anything. E–F (8) and B–F (10) cross, and the lightest crossing link is E–F at 8. This is the cut property again: the lightest edge across the cut. The new total is 20 − 5 + 8 = 23.",
    },
    {
      type: "cat",
      q: "Every edge weight in a graph is changed in the way described. Does the cheapest network keep the same edges? The chart shows what happens to five weights when they are squared.",
      fig: cutOrder,
      buckets: ["Same cheapest network", "It may change"],
      items: [
        ["Add 10 to every weight", 0],
        ["Multiply every weight by 3", 0],
        ["Square every weight (all are positive)", 0],
        ["Replace each weight by its rank: 1 for the lightest, 2 for the next, and so on", 0],
        ["Replace every weight by its negative", 1],
        ["Add 6 to the weights of the links at town A only", 1],
        ["Round every weight down to a whole number", 1],
      ],
      why: "A cheapest network depends only on the ORDER of the weights: Kruskal sorts them and Prim compares them. Adding the same amount, multiplying by a positive number, squaring positives or using ranks all keep the order, and every spanning tree has the same number of edges, so the best tree stays. Negating reverses the order (you would get the most expensive tree). Changing only A's links, or rounding (which creates ties), can change the order.",
    },
  ]);

  /* =====================================================================
     a4-mst
     ===================================================================== */
  // union-find forest (arrows go to the parent)
  const forest = (() => {
    const nd = {
      A: [70, 36],
      B: [70, 96],
      C: [70, 156],
      D: [235, 36],
      E: [185, 106],
      F: [285, 106],
      G: [395, 36],
      H: [395, 106],
    };
    const par = { B: "A", C: "B", E: "D", F: "D", H: "G" };
    const grp = {
      A: "var(--blue)",
      B: "var(--blue)",
      C: "var(--blue)",
      D: "var(--amber)",
      E: "var(--amber)",
      F: "var(--amber)",
      G: "var(--violet)",
      H: "var(--violet)",
    };
    let g = "";
    Object.entries(par).forEach(([c, p]) => {
      const [x1, y1] = nd[c],
        [x2, y2] = nd[p],
        d = Math.hypot(x2 - x1, y2 - y1),
        ux = (x2 - x1) / d,
        uy = (y2 - y1) / d;
      g += arrow(x1 + ux * 17, y1 + uy * 17, x2 - ux * 19, y2 - uy * 19, "var(--text-dim)", 2.5);
    });
    Object.entries(nd).forEach(([k, [x, y]]) => {
      const root = !par[k];
      g +=
        circ(x, y, 16, root ? grp[k] : "var(--panel)", grp[k], 4) +
        txt(x, y + 5, k, { s: 14, c: root ? "#fff" : "var(--ink)" });
    });
    g += txt(230, 194, "arrows point to the parent; a filled node is a root", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(460, 204, g);
  })();

  // three Kruskal-style runs: weights in the order the edges were accepted
  const orders = (() => {
    const R = [
      [1, 2, 2, 4, 5, 7],
      [3, 1, 2, 6, 4, 5],
      [2, 2, 3, 3, 8, 9],
    ];
    let g = "";
    R.forEach((ws, p) => {
      const x0 = 8 + p * 150,
        base = 156;
      let inner =
        rect(x0, 6, 140, 190, "var(--panel)", "var(--line-2)", 3, 12) +
        txt(x0 + 70, 26, `Run ${p + 1}`, { s: 13, c: "var(--ink)" });
      ws.forEach((w, i) => {
        const h = w * 11,
          x = x0 + 12 + i * 20;
        inner +=
          `<rect x="${x}" y="${base - h}" width="16" height="${h}" rx="3" fill="var(--blue)"/>` +
          txt(x + 8, base - h - 4, w, { s: 11, c: "var(--ink)" }) +
          txt(x + 8, base + 14, i + 1, { s: 10, w: 700, c: "var(--text-dim)" });
      });
      inner +=
        ln(x0 + 8, base, x0 + 132, base, "var(--line-2)", 2) +
        txt(x0 + 70, 184, "edge number added", { s: 10, w: 700, c: "var(--text-dim)" });
      g += pk("r" + (p + 1), inner);
    });
    return svg(460, 204, g);
  })();
  Object.assign(partScope, { arrow, circ, dot, forest, ln, orders, pk, plane, rect, sgn, svg, txt, wl });
})();

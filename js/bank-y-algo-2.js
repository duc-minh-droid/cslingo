/* Revision bank, fourth set: fills the gaps in the third set (algo-2).
   Modules: a4-cut, a4-mst, a5-orient, a5-wrap, a5-graham (5 each) and l2-mst (5).
   Every figure is inline SVG built here, and each module uses a different diagram kind per question (adjacency matrix, line plots,
   small-multiple bars, tree with a removed link, union-find forest, trace table, grouped bars, regions, dial, turn strips, grids,
   scatter panels, angle diagram, stack boxes, map, number line, ring). Every number was checked by running the real algorithms
   (Prim, Kruskal, monotone-chain hull, Graham scan with pop-on-straight, cross products). Questions stand alone. */
(function () {
  const B = NIC.bank;
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="display:block;width:100%;max-height:${h}px">${inner}</svg>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const ln = (x1, y1, x2, y2, c, w, extra = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const circ = (x, y, r, fill, stroke, sw = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const rect = (x, y, w, h, fill, stroke, sw = 2, r = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const arrow = (x1, y1, x2, y2, c, w = 3) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 9;
    const p = [[x2, y2], [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)], [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)]];
    return ln(x1, y1, x2 - h * 0.6 * Math.cos(a), y2 - h * 0.6 * Math.sin(a), c, w) + `<polygon points="${p.map((q) => q.join(",")).join(" ")}" fill="${c}"/>`;
  };
  const MINUS = "−";
  const sgn = (v) => (v > 0 ? "+" + v : v < 0 ? MINUS + Math.abs(v) : "0");
  /* label with a panel-coloured halo so it stays readable over lines */
  const wl = (x, y, s, c = "var(--text-dim)", z = 13) => `<text x="${x}" y="${y}" text-anchor="middle" style="font:800 ${z}px var(--sans);fill:${c};paint-order:stroke;stroke:var(--panel);stroke-width:4px;stroke-linejoin:round">${s}</text>`;
  /* maths plane, y up */
  const plane = (mx, my, x0, y0, x1, y1, grid = true) => {
    const X = (x) => x0 + (x / mx) * (x1 - x0), Y = (y) => y1 - (y / my) * (y1 - y0);
    let g = "";
    if (grid) for (let i = 0; i <= mx; i++) g += ln(X(i), Y(0), X(i), Y(my), "var(--line)", 1);
    if (grid) for (let j = 0; j <= my; j++) g += ln(X(0), Y(j), X(mx), Y(j), "var(--line)", 1);
    return { X, Y, g };
  };
  const dot = (x, y, label, o = {}) => {
    const g = circ(x, y, o.r || 11, o.fill || "var(--panel)", o.stroke || "var(--line-2)") + (label === "" ? "" : txt(x, y + 4, label, { s: o.s || 12, c: o.tc || "var(--ink)" }));
    return o.id ? pk(o.id, g) : g;
  };

  /* =====================================================================
     a4-cut
     ===================================================================== */
  // adjacency matrix, upper triangle; S = {A, C, E} amber
  const cutMatrix = (() => {
    const N = "ABCDEF".split(""), S = new Set(["A", "C", "E"]);
    const W = { AB: 7, AC: 1, AD: 9, AE: 3, AF: "–", BC: 6, BD: 2, BE: 4, BF: 3, CD: 5, CE: 2, CF: 8, DE: "–", DF: 6, EF: 10 };
    const x0 = 50, y0 = 44, cw = 58, ch = 36;
    let g = "";
    N.forEach((n, i) => {
      const inS = S.has(n);
      g += rect(x0 + i * cw + 6, 8, cw - 12, 28, inS ? "var(--amber)" : "var(--panel-2)", inS ? "var(--amber)" : "var(--line-2)", 2) + txt(x0 + i * cw + cw / 2, 28, n, { c: inS ? "#fff" : "var(--ink)", s: 14 });
      g += rect(8, y0 + i * ch + 4, 34, ch - 8, inS ? "var(--amber)" : "var(--panel-2)", inS ? "var(--amber)" : "var(--line-2)", 2) + txt(25, y0 + i * ch + ch / 2 + 5, n, { c: inS ? "#fff" : "var(--ink)", s: 14 });
    });
    N.forEach((r, i) => N.forEach((c, j) => {
      const x = x0 + j * cw, y = y0 + i * ch;
      if (i < j) {
        const k = r + c;
        g += pk(k, rect(x + 2, y + 2, cw - 4, ch - 4, "var(--panel)", "var(--line-2)", 2, 6) + txt(x + cw / 2, y + ch / 2 + 5, W[k], { s: 14, c: W[k] === "–" ? "var(--text-dim)" : "var(--ink)" }));
      } else g += rect(x + 2, y + 2, cw - 4, ch - 4, "var(--panel-2)", "none", 0, 6);
    }));
    g += txt(x0 + 3 * cw, y0 + 6 * ch + 22, "amber towns = group S, – = no cable", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(410, y0 + 6 * ch + 32, g);
  })();

  // graph + line plot: MST cost against the weight w of the dashed link B-D
  const cutPlot = (() => {
    const nd = { A: [70, 30], B: [210, 30], C: [210, 100], D: [70, 100] };
    let g = "";
    [["A", "B", 2, 0, -9], ["B", "C", 3, 11, 4], ["C", "D", 4, 0, 18], ["A", "D", 7, -11, 4], ["A", "C", 5, -34, -18]].forEach(([a, b, w, dx, dy]) => {
      g += ln(nd[a][0], nd[a][1], nd[b][0], nd[b][1], "var(--line-2)", 3);
      g += wl((nd[a][0] + nd[b][0]) / 2 + dx, (nd[a][1] + nd[b][1]) / 2 + dy + 4, w);
    });
    g += ln(nd.B[0], nd.B[1], nd.D[0], nd.D[1], "var(--amber)", 3, 'stroke-dasharray="7 5"') + wl(172, 52, "w", "var(--amber-ink)", 15);
    Object.entries(nd).forEach(([k, [x, y]]) => (g += dot(x, y, k, { r: 15, s: 14 })));
    g += txt(300, 55, "dashed B–D costs w", { a: "start", s: 13, c: "var(--amber-ink)" }) + txt(300, 76, "(w changes along the", { a: "start", s: 12, w: 700, c: "var(--text-dim)" }) + txt(300, 92, "bottom axis of the chart)", { a: "start", s: 12, w: 700, c: "var(--text-dim)" });
    // plot
    const px0 = 62, px1 = 440, py0 = 150, py1 = 290, X = (w) => px0 + ((w - 1) / 8) * (px1 - px0 - 20) + 10, Y = (t) => py1 - ((t - 5.5) / 4) * (py1 - py0);
    [6, 7, 8, 9].forEach((t) => (g += ln(px0, Y(t), px1, Y(t), "var(--line)", 1) + txt(px0 - 8, Y(t) + 4, t, { a: "end", s: 12, w: 700, c: "var(--text-dim)" })));
    for (let w = 1; w <= 9; w++) g += txt(X(w), py1 + 18, w, { s: 12, w: 700, c: "var(--text-dim)" });
    const tot = [6, 7, 8, 9, 9, 9, 9, 9, 9];
    g += `<polyline points="${tot.map((t, i) => `${X(i + 1)},${Y(t)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    [1, 2, 3, 4, 5, 6, 8].forEach((w) => (g += dot(X(w), Y(tot[w - 1]), "", { r: 9, id: "w" + w, fill: "var(--panel)", stroke: "var(--blue)" })));
    g += txt((px0 + px1) / 2, py1 + 38, "w, the cost of B–D", { s: 12, c: "var(--text-dim)" }) + txt(6, py0 - 14, "cheapest total", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(460, 335, g);
  })();

  // small multiples: weights of the edges crossing three cuts
  const cutPanels = (() => {
    const P = [[4, 4, 7, 9], [8], [2, 6, 6]];
    let g = "";
    P.forEach((ws, p) => {
      const x0 = 8 + p * 150, base = 170;
      g += rect(x0, 6, 140, 190, "var(--panel)", "var(--line-2)", 3, 12) + txt(x0 + 70, 26, `Cut ${p + 1}`, { s: 13, c: "var(--ink)" });
      const bw = 24, gap = 8, tw = ws.length * bw + (ws.length - 1) * gap, sx = x0 + 70 - tw / 2;
      ws.forEach((w, i) => {
        const h = w * 11, x = sx + i * (bw + gap);
        g += pk(`${p + 1}${"abcd"[i]}`, `<rect x="${x}" y="${base - h}" width="${bw}" height="${h}" rx="5" fill="var(--blue)"/>` + txt(x + bw / 2, base - h - 5, w, { s: 13, c: "var(--ink)" }));
      });
      g += ln(x0 + 12, base, x0 + 128, base, "var(--line-2)", 2) + txt(x0 + 70, base + 16, "crossing edges", { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(460, 204, g);
  })();

  // MST drawn as a tree, one tree link removed, grey spare links
  const cutSwap = (() => {
    const nd = { A: [50, 50], B: [200, 35], C: [350, 55], D: [50, 190], E: [200, 175], F: [350, 190] };
    let g = "";
    const L = (a, b, c, w, extra = "") => ln(nd[a][0], nd[a][1], nd[b][0], nd[b][1], c, w, extra);
    [["D", "E", 7, 0, 14], ["E", "F", 8, 0, 15], ["A", "E", 9, -4, -8], ["B", "F", 10, 6, -10]].forEach(([a, b, w, dx, dy]) => {
      const id = a + "-" + b;
      g += pk(id, L(a, b, "var(--line-2)", 3, 'stroke-dasharray="3 6"') + L(a, b, "transparent", 22) + wl((nd[a][0] + nd[b][0]) / 2 + dx, (nd[a][1] + nd[b][1]) / 2 + dy + 4, w));
    });
    [["B", "E", 2, 12, 4], ["A", "B", 3, 0, -8], ["A", "D", 4, -12, 4], ["C", "F", 6, 12, 4]].forEach(([a, b, w, dx, dy]) => (g += L(a, b, "var(--teal)", 5) + wl((nd[a][0] + nd[b][0]) / 2 + dx, (nd[a][1] + nd[b][1]) / 2 + dy + 4, w, "var(--teal-ink)")));
    g += L("B", "C", "var(--rose)", 5, 'stroke-dasharray="8 6"') + wl(277, 36, "5", "var(--rose-ink)") + txt(277, 66, "removed", { s: 12, c: "var(--rose-ink)" });
    Object.entries(nd).forEach(([k, [x, y]]) => (g += dot(x, y, k, { r: 16, s: 14 })));
    return svg(410, 222, g);
  })();

  // sorted weights, then the same weights squared: same order
  const cutOrder = (() => {
    const a = [1, 2, 4, 5, 7], b = a.map((v) => v * v);
    let g = "";
    [[a, "weights", "var(--blue)", 8, 0], [b, "squared", "var(--violet)", 1.2, 1]].forEach(([vals, name, col, k, row]) => {
      const x0 = 120, base = 86 + row * 100;
      g += txt(60, base - 24, name, { s: 13, c: "var(--ink)" });
      vals.forEach((v, i) => {
        const h = Math.max(4, v * k), x = x0 + i * 58;
        g += `<rect x="${x}" y="${base - h}" width="38" height="${h}" rx="5" fill="${col}"/>` + txt(x + 19, base - h - 5, v, { s: 12, c: "var(--ink)" });
      });
      g += ln(x0 - 8, base, x0 + 5 * 58 - 12, base, "var(--line-2)", 2);
    });
    g += txt(235, 206, "the order is identical", { s: 13, c: "var(--teal-ink)" });
    return svg(430, 212, g);
  })();

  B.add("a4-cut", [
    { type: "pick",
      q: "Six towns, with the cost of each possible cable in the table (– means no cable). Group S is the three amber towns A, C and E. A cable crosses the cut when one end is in S and the other is not. Click the cell of the cable that the cut property guarantees is in some cheapest network.",
      fig: cutMatrix, a: "BE",
      hint: "Ignore any cell where both towns are amber, or both are grey. Of what is left, take the smallest.",
      why: "The crossing cables are A–B 7, A–D 9, B–C 6, C–D 5, C–F 8, B–E 4 and E–F 10. The lightest is B–E at 4, so it is in some cheapest network. The tempting cell A–C (1) is the lightest overall, but both its towns are in S, so it does not cross this cut: it says nothing here." },
    { type: "pick",
      q: "A network has the cables shown with their costs, and a dashed cable B–D that costs w. The line chart gives the cost of the cheapest network for each w. Click every marked w for which B–D is in EVERY cheapest network.",
      fig: cutPlot, a: ["w1", "w2", "w3"],
      hint: "B–D closes the loop B–C–D (3, 4 and w). A cable on a loop is only certain to be dropped when it is strictly the heaviest.",
      why: "On the loop B–C–D the costs are 3, 4 and w. While w is below 4, the cable C–D (4) is the strict heaviest, so it is always dropped and B–D is forced in: the total rises with w (6, 7, 8). At w = 4 there is a tie, so B–D or C–D can go: B–D is only in SOME cheapest tree, and the total stops rising. Above 4, B–D is the heaviest on the loop, so it is never used and the total stays at 9." },
    { type: "pick",
      q: "Each panel shows the weights of the edges that cross one cut of some graph. Use only the cut property. Click every bar that is guaranteed to be in some minimum spanning tree.",
      fig: cutPanels, a: ["1a", "1b", "2a", "3a"],
      hint: "Look at each panel on its own. Ask what the lightest crossing edge is, and what happens if there is only one crossing edge.",
      why: "Cut 1 has two lightest edges (4 and 4): either one is safe on its own, so both are guaranteed to be in some tree. Cut 2 has a single crossing edge, so its weight does not matter: it is the lightest crossing edge by default, and the graph would be disconnected without it. Cut 3 guarantees only its 2. The two 6s are not lightest, so the cut property does not promise them." },
    { type: "pick",
      q: "The green links are the cheapest network (total 20). You remove the dashed red link B–C, which splits the towns into {A, B, D, E} and {C, F}. Click the grey link that rebuilds a cheapest connected network at the lowest extra cost.",
      fig: cutSwap, a: "E-F",
      hint: "A link only helps if one end is in each group. Cross out grey links with both ends in the same group.",
      why: "The groups are {A, B, D, E} and {C, F}. D–E (7) and A–E (9) have both ends on the left, so they cannot reconnect anything. E–F (8) and B–F (10) cross, and the lightest crossing link is E–F at 8. This is the cut property again: the lightest edge across the cut. The new total is 20 − 5 + 8 = 23." },
    { type: "cat",
      q: "Every edge weight in a graph is changed in the way described. Does the cheapest network keep the same edges? The chart shows what happens to five weights when they are squared.",
      fig: cutOrder, buckets: ["Same cheapest network", "It may change"],
      items: [
        ["Add 10 to every weight", 0],
        ["Multiply every weight by 3", 0],
        ["Square every weight (all are positive)", 0],
        ["Replace each weight by its rank: 1 for the lightest, 2 for the next, and so on", 0],
        ["Replace every weight by its negative", 1],
        ["Add 6 to the weights of the links at town A only", 1],
        ["Round every weight down to a whole number", 1],
      ],
      why: "A cheapest network depends only on the ORDER of the weights: Kruskal sorts them and Prim compares them. Adding the same amount, multiplying by a positive number, squaring positives or using ranks all keep the order, and every spanning tree has the same number of edges, so the best tree stays. Negating reverses the order (you would get the most expensive tree). Changing only A's links, or rounding (which creates ties), can change the order." },
  ]);

  /* =====================================================================
     a4-mst
     ===================================================================== */
  // union-find forest (arrows go to the parent)
  const forest = (() => {
    const nd = { A: [70, 36], B: [70, 96], C: [70, 156], D: [235, 36], E: [185, 106], F: [285, 106], G: [395, 36], H: [395, 106] };
    const par = { B: "A", C: "B", E: "D", F: "D", H: "G" };
    const grp = { A: "var(--blue)", B: "var(--blue)", C: "var(--blue)", D: "var(--amber)", E: "var(--amber)", F: "var(--amber)", G: "var(--violet)", H: "var(--violet)" };
    let g = "";
    Object.entries(par).forEach(([c, p]) => {
      const [x1, y1] = nd[c], [x2, y2] = nd[p], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
      g += arrow(x1 + ux * 17, y1 + uy * 17, x2 - ux * 19, y2 - uy * 19, "var(--text-dim)", 2.5);
    });
    Object.entries(nd).forEach(([k, [x, y]]) => {
      const root = !par[k];
      g += circ(x, y, 16, root ? grp[k] : "var(--panel)", grp[k], 4) + txt(x, y + 5, k, { s: 14, c: root ? "#fff" : "var(--ink)" });
    });
    g += txt(230, 194, "arrows point to the parent; a filled node is a root", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(460, 204, g);
  })();

  // three Kruskal-style runs: weights in the order the edges were accepted
  const orders = (() => {
    const R = [[1, 2, 2, 4, 5, 7], [3, 1, 2, 6, 4, 5], [2, 2, 3, 3, 8, 9]];
    let g = "";
    R.forEach((ws, p) => {
      const x0 = 8 + p * 150, base = 156;
      let inner = rect(x0, 6, 140, 190, "var(--panel)", "var(--line-2)", 3, 12) + txt(x0 + 70, 26, `Run ${p + 1}`, { s: 13, c: "var(--ink)" });
      ws.forEach((w, i) => {
        const h = w * 11, x = x0 + 12 + i * 20;
        inner += `<rect x="${x}" y="${base - h}" width="16" height="${h}" rx="3" fill="var(--blue)"/>` + txt(x + 8, base - h - 4, w, { s: 11, c: "var(--ink)" }) + txt(x + 8, base + 14, i + 1, { s: 10, w: 700, c: "var(--text-dim)" });
      });
      inner += ln(x0 + 8, base, x0 + 132, base, "var(--line-2)", 2) + txt(x0 + 70, 184, "edge number added", { s: 10, w: 700, c: "var(--text-dim)" });
      g += pk("r" + (p + 1), inner);
    });
    return svg(460, 204, g);
  })();

  // Prim key table with one wrong entry
  const keyTable = (() => {
    const cols = [110, 72, 72, 72, 72], rows = [
      ["Step", "key B", "key C", "key D", "key E"],
      ["add A", 4, 2, "∞", "∞"],
      ["add C", 1, "–", 8, 10],
      ["add B", "–", "–", 8, 10],
      ["add D", "–", "–", "–", 3],
    ];
    const x0 = 8, y0 = 38, rh = 38;
    let g = txt(220, 20, "A–B 4, A–C 2, B–C 1, B–D 5, C–D 8, C–E 10, D–E 3", { s: 13, c: "var(--ink)" });
    rows.forEach((row, r) => {
      let x = x0;
      row.forEach((cell, c) => {
        const head = r === 0 || c === 0, w = cols[c], y = y0 + r * rh;
        const inner = rect(x, y, w, rh, head ? "var(--panel-2)" : "var(--panel)", "var(--line-2)", 1.5, 0) + txt(x + w / 2, y + rh / 2 + 5, cell, { s: 14, c: head ? "var(--text-dim)" : "var(--ink)" });
        g += r > 0 && c > 0 && cell !== "–" ? pk(`${r}${"BCDE"[c - 1]}`, inner) : inner;
        x += w;
      });
    });
    g += txt(220, y0 + 5 * rh + 18, "– means the town is already in the tree", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(440, y0 + 5 * rh + 28, g);
  })();

  // grouped bars: estimated work for three algorithms on a sparse and a dense network
  const costBars = (() => {
    const P = [["Sparse: 1,000 towns, 4,000 cables", [1000, 40, 48], "s"], ["Dense: 1,000 towns, 300,000 cables", [1000, 3000, 5470], "d"]];
    const names = ["Prim, array", "Prim, heap", "Kruskal"], ids = ["arr", "heap", "kr"], cols = ["var(--violet)", "var(--blue)", "var(--amber)"];
    let g = "";
    P.forEach(([title, vals, key], p) => {
      const x0 = 6 + p * 228, base = 190;
      g += rect(x0, 4, 220, 232, "var(--panel)", "var(--line-2)", 3, 12) + txt(x0 + 110, 24, title, { s: 11, c: "var(--ink)" });
      vals.forEach((v, i) => {
        const h = Math.max(3, (v / 5470) * 130), x = x0 + 22 + i * 62;
        g += pk(`${key}-${ids[i]}`, `<rect x="${x}" y="${base - h}" width="44" height="${h}" rx="5" fill="${cols[i]}"/>` + txt(x + 22, base - h - 6, v.toLocaleString("en-GB") + "k", { s: 11, c: "var(--ink)" })) + txt(x + 22, base + 16, names[i].split(", ")[0], { s: 11, w: 700, c: "var(--text-dim)" }) + txt(x + 22, base + 30, names[i].split(", ")[1] || "", { s: 11, w: 700, c: "var(--text-dim)" });
      });
      g += ln(x0 + 12, base, x0 + 208, base, "var(--line-2)", 2);
    });
    return svg(460, 242, g);
  })();

  // regions: three groups of towns, no links between groups
  const regions = (() => {
    const R = [
      [8, 10, 205, 170, "var(--blue)", { A: [50, 50], B: [120, 40], C: [180, 70], D: [70, 130], E: [150, 135] }, [["A", "B"], ["B", "C"], ["A", "D"], ["D", "E"], ["C", "E"], ["B", "E"], ["A", "E"]]],
      [220, 10, 140, 170, "var(--amber)", { F: [20, 50], G: [100, 45], H: [30, 130], I: [105, 125] }, [["F", "G"], ["F", "H"], ["G", "I"], ["H", "I"], ["F", "I"]]],
      [372, 10, 80, 170, "var(--violet)", { J: [22, 60], K: [55, 120] }, [["J", "K"]]],
    ];
    let g = "";
    R.forEach(([x, y, w, h, c, nd, ed]) => {
      g += rect(x, y, w, h, "var(--panel-2)", c, 3, 14);
      ed.forEach(([a, b]) => (g += ln(x + nd[a][0], y + nd[a][1], x + nd[b][0], y + nd[b][1], "var(--line-2)", 3)));
      Object.entries(nd).forEach(([k, [px, py]]) => (g += dot(x + px, y + py, k, { r: 13, stroke: c })));
    });
    return svg(460, 188, g);
  })();

  B.add("a4-mst", [
    { type: "cat",
      q: "Kruskal keeps each group of connected towns in a union-find forest, drawn below. It now looks at these edges. For each one, does Kruskal accept it (the ends are in different groups) or reject it (the same group)?",
      fig: forest, buckets: ["Accepts it", "Rejects it"],
      items: [["C–F", 0], ["E–H", 0], ["B–G", 0], ["D–F", 1], ["A–C", 1], ["H–G", 1]],
      hint: "Follow the arrows up to the root. Two towns are in the same group when their roots match.",
      why: "The roots are A (towns A, B, C), D (D, E, F) and G (G, H). C–F joins roots A and D, E–H joins D and G, and B–G joins A and G, so those three are accepted. D–F, A–C and H–G have both ends under the same root, so adding them would close a loop. Neither end needs to be a root itself: only the roots matter." },
    { type: "pick",
      q: "Each panel lists the weights of the edges one run accepted, in the order they were added. Click every panel that could be a run of KRUSKAL's algorithm.",
      fig: orders, a: ["r1", "r3"],
      hint: "What does Kruskal do to the edge list before it starts? Look for a panel where a lighter edge comes after a heavier one.",
      why: "Kruskal sorts all edges by weight and walks through them once, so the accepted weights never go down. Runs 1 and 3 rise or stay level (equal weights are fine). Run 2 goes 3 then 1, which Kruskal can never do. It could be a Prim run: Prim grows one tree and may have to take a heavier edge now and a lighter one later." },
    { type: "pick",
      q: "Prim's algorithm started at A on the network listed above the table. key[v] is the cheapest link from town v to the tree built so far. A student filled in the table after each step, and one entry is wrong. Click it.",
      fig: keyTable, a: "3D",
      hint: "After B joins, check every link from B to a town still outside the tree.",
      why: "When B joins the tree, link B–D (5) becomes available, which beats the old key of 8 (C–D). So key D should drop to 5, not stay at 8. The other rows are right: after A, B is 4 and C is 2; after C, B falls to 1, D is 8 and E is 10; after D joins, key E drops to 3 through D–E." },
    { type: "pick",
      q: "Which algorithm needs the fewest steps? The bars model the work (in thousands of steps): Prim with a plain array is about n², Prim with a heap is about m × log₂ n, and Kruskal is about m × log₂ m. Click the cheapest bar in EACH panel.",
      fig: costBars, a: ["s-heap", "d-arr"],
      hint: "Sparse: m is only 4 times n. Dense: m is 300 times n, so n² is smaller than m log n.",
      why: "On the sparse network, heap-Prim does about 4,000 × 10 = 40 thousand steps and Kruskal about 4,000 × 12 = 48 thousand, far under the array version's 1,000 × 1,000 = 1 million. On the dense network the picture flips: the heap versions pay for every one of 300,000 cables (3 million and about 5.5 million) while the array version still costs 1 million. The fancier algorithm is not always the cheapest." },
    { type: "slider", min: 0, max: 12, step: 1, start: 3, ans: 8, tol: 0, unit: "links",
      q: "Eleven towns are joined by the cables drawn, but the three coloured areas are not connected to each other. Kruskal runs through every cable. How many cables does it accept in total?",
      fig: regions,
      hint: "Each area ends as one tree. A tree on k towns has k − 1 edges.",
      why: "The areas hold 5, 4 and 2 towns. Kruskal builds one tree per area with 4, 3 and 1 edges: 8 in all. That is 11 towns minus 3 groups. The graph is disconnected, so no spanning TREE exists, but Kruskal quietly returns a minimum spanning FOREST. The extra cables inside each area (7, 5 and 1 in all) change nothing: they only close loops." },
  ]);

  /* =====================================================================
     a5-orient
     ===================================================================== */
  const dial = (() => {
    const cx = 210, cy = 160, R = 112, d2r = Math.PI / 180;
    const P = (a, r) => [cx + r * Math.cos(a * d2r), cy - r * Math.sin(a * d2r)];
    let g = circ(cx, cy, R, "var(--panel)", "var(--line-2)", 3) + circ(cx, cy, 4, "var(--ink)", "var(--ink)", 1);
    g += txt(cx + R + 4, cy + 20, "east", { a: "start", s: 11, w: 700, c: "var(--text-dim)" });
    const [ux, uy] = P(30, 80);
    g += arrow(cx, cy, ux, uy, "var(--blue)", 5) + txt(ux + 14, uy - 6, "u", { s: 17, c: "var(--blue-ink)" });
    [["a", 0], ["b", 60], ["c", 150], ["d", 180], ["e", 210], ["f", 300]].forEach(([id, a]) => {
      const [x, y] = P(a, R), [lx, ly] = P(a, R + 30);
      g += ln(cx, cy, x, y, "var(--line-2)", 2, 'stroke-dasharray="3 5"') + pk(id, circ(x, y, 13, "var(--panel)", "var(--amber)", 3) + txt(x, y + 5, id, { s: 13, c: "var(--ink)" })) + txt(lx, ly + 4, a + "°", { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(420, 320, g);
  })();

  // cross product against t, P slides along y = 5
  const crossPlot = (() => {
    const x0 = 58, x1 = 440, y0 = 22, y1 = 226, X = (t) => x0 + (t / 13) * (x1 - x0), Y = (v) => y1 - ((v + 8) / 22) * (y1 - y0);
    let g = "";
    [-8, -4, 0, 4, 8, 12].forEach((v) => (g += ln(x0, Y(v), x1, Y(v), v === 0 ? "var(--ink)" : "var(--line)", v === 0 ? 2.5 : 1) + txt(x0 - 8, Y(v) + 4, v === 0 ? "0" : sgn(v), { a: "end", s: 12, w: 700, c: "var(--text-dim)" })));
    for (let t = 0; t <= 12; t += 2) g += txt(X(t), y1 + 18, t, { s: 12, w: 700, c: "var(--text-dim)" });
    g += `<polyline points="${[2, 13].map((t) => `${X(t)},${Y(18 - 2 * t)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
    [3, 6, 8, 9, 10, 12].forEach((t) => (g += dot(X(t), Y(18 - 2 * t), "", { r: 10, id: "t" + t, stroke: "var(--blue)" }) + txt(X(t) + (t === 12 ? -4 : t === 10 ? 4 : 6), Y(18 - 2 * t) + (t === 10 ? 26 : -15), "t=" + t, { s: 11, c: "var(--ink)" })));
    g += txt((x0 + x1) / 2, y1 + 38, "t, where P = (t, 5)", { s: 12, c: "var(--text-dim)" }) + txt(6, 12, "(B−A) × (P−A)", { a: "start", s: 11, c: "var(--text-dim)" });
    return svg(460, 268, g);
  })();

  // triangle on a grid
  const gridTri = (() => {
    const u = 40, x0 = 24, y0 = 18, X = (x) => x0 + x * u, Y = (y) => y0 + (7 - y) * u * 0.8;
    let g = "";
    for (let i = 0; i <= 8; i++) g += ln(X(i), Y(0), X(i), Y(7), "var(--line)", 1);
    for (let j = 0; j <= 7; j++) g += ln(X(0), Y(j), X(8), Y(j), "var(--line)", 1);
    const A = [1, 1], Bp = [7, 2], C = [3, 6];
    g += `<polygon points="${[A, Bp, C].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--blue)" fill-opacity=".2" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    [["A", A, -26, 28], ["B", Bp, 26, 28], ["C", C, 0, -22]].forEach(([n, [x, y], dx, dy]) => (g += dot(X(x), Y(y), n, { r: 11, stroke: "var(--blue)" }) + wl(X(x) + dx, Y(y) + dy, `(${x},${y})`, "var(--text-dim)", 11)));
    return svg(350, 246, g);
  })();

  // turn strips
  const strips = (() => {
    const row = (y, vals, labels, id, name) => {
      let s = "";
      vals.forEach((v, i) => {
        const x = 52 + i * 62;
        s += rect(x, y, 58, 44, "var(--panel)", "var(--line-2)", 2, 6) + txt(x + 29, y + 15, labels[i], { s: 11, w: 700, c: "var(--text-dim)" }) + txt(x + 29, y + 35, sgn(v), { s: 15, c: v > 0 ? "var(--teal-ink)" : v < 0 ? "var(--rose-ink)" : "var(--ink)" });
      });
      s += txt(24, y + 28, name, { s: 14, c: "var(--ink)" });
      return id ? pk(id, rect(2, y - 5, 428, 54, "transparent", "none", 0, 8) + s) : s;
    };
    const L = ["A", "B", "C", "D", "E", "F"], V = [8, 5, -3, 6, 0, 7], Rl = ["F", "E", "D", "C", "B", "A"];
    let g = txt(215, 16, "Cross product at each corner, walking A → B → C → D → E → F", { s: 12, c: "var(--ink)" }) + row(26, V, L, null, "");
    g += txt(215, 98, "Same polygon, walked F → E → D → C → B → A. Which strip?", { s: 12, c: "var(--ink)" });
    const cands = [
      ["s2", [-8, -5, 3, -6, 0, -7], L, "2"],
      ["s4", [8, 5, -3, 6, 0, 7], L, "4"],
      ["s3", [-7, 0, -6, 3, -5, -8], Rl, "3"],
      ["s1", [7, 0, 6, -3, 5, 8], Rl, "1"],
    ];
    cands.forEach(([id, vals, labs, name], i) => (g += row(110 + i * 56, vals, labs, id, name)));
    return svg(440, 110 + 4 * 56 + 4, g);
  })();

  // four panels, each walks A -> B -> C
  const triPanels = (() => {
    const T = [
      ["W", [[1, 1], [3, 3], [5, 5]]],
      ["X", [[1, 1], [4, 1], [2, 6]]],
      ["Y", [[2, 6], [6, 6], [6, 3]]],
      ["Z", [[1, 1], [7, 1], [7, 4]]],
    ];
    let g = "";
    T.forEach(([name, pts], k) => {
      const ox = 8 + (k % 2) * 220, oy = 6 + Math.floor(k / 2) * 178, sx = 23, sy = 18;
      const X = (x) => ox + 14 + x * sx, Y = (y) => oy + 154 - y * sy;
      g += rect(ox, oy, 212, 170, "var(--panel)", "var(--line-2)", 3, 12);
      for (let i = 0; i <= 8; i++) g += ln(X(i), Y(0), X(i), Y(7), "var(--line)", 1);
      for (let j = 0; j <= 7; j++) g += ln(X(0), Y(j), X(8), Y(j), "var(--line)", 1);
      g += arrow(X(pts[0][0]), Y(pts[0][1]), X(pts[1][0]), Y(pts[1][1]), "var(--blue)", 3) + arrow(X(pts[1][0]), Y(pts[1][1]), X(pts[2][0]), Y(pts[2][1]), "var(--blue)", 3);
      pts.forEach(([x, y], i) => (g += dot(X(x), Y(y), "ABC"[i], { r: 10, s: 11 })));
      g += txt(ox + 192, oy + 20, name, { s: 16, c: "var(--ink)" });
    });
    return svg(440, 362, g);
  })();

  B.add("a5-orient", [
    { type: "pick",
      q: "A robot at the centre faces along u (30° above east, y pointing up). Each dot is a direction v it could turn to. The turn from u to v is a LEFT turn when v is anticlockwise from u by less than half a turn. Click every direction that is a left turn.",
      fig: dial, a: ["b", "c", "d"],
      hint: "Left turns are the directions between 30° and 30° + 180° = 210°. What does a turn of exactly 180° count as?",
      why: "The cross product u × v is positive for v at 60°, 150° and 180° (all within 180° anticlockwise of u). 0° and 300° are clockwise of u, so they are right turns. The direction at 210° points exactly opposite to u: the cross product is 0, so the points are collinear and it is NEITHER a left nor a right turn." },
    { type: "pick",
      q: "A = (1, 1) and B = (5, 3). Point P slides along the line y = 5 and sits at (t, 5). The chart plots the cross product (B − A) × (P − A), which is positive when A → B → P is a left turn. Click every marked t for which the walk A → P → B (visiting P first) is a RIGHT turn.",
      fig: crossPlot, a: ["t3", "t6", "t8"],
      hint: "Swapping the last two points of a walk flips the sign of the turn.",
      why: "The chart value is the cross product for A → B → P. Visiting P first reverses the order of the last two points, which flips the sign. So A → P → B turns right wherever the chart is POSITIVE: t = 3, 6 and 8 (values 12, 6 and 2). At t = 9 the value is 0: the three points are in a straight line, which is not a right turn. At t = 10 and 12 the chart is negative, so A → P → B turns left." },
    { type: "slider", min: 0, max: 40, step: 1, start: 30, ans: 14, tol: 1, unit: "squares",
      q: "A triangle has corners A (1, 1), B (7, 2) and C (3, 6) on the grid. Slide to its area in grid squares. Remember: the cross product (B − A) × (C − A) is twice the signed area.",
      fig: gridTri,
      hint: "B − A = (6, 1) and C − A = (2, 5). Cross product = 6 × 5 − 1 × 2. The area is half of that.",
      why: "The cross product is 6 × 5 − 1 × 2 = 28. It is positive, so A → B → C is a left turn, and the triangle's area is half of it: 14 squares. One cross product gives both the turn direction (its sign) and the area (half its size)." },
    { type: "pick",
      q: "The top strip lists the cross product at each corner of a polygon, walked A → B → C → D → E → F. The polygon is now walked in the opposite order, F → E → D → C → B → A. Click the strip that shows the cross products for the reversed walk.",
      fig: strips, a: "s3",
      hint: "Reversing a walk swaps 'came from' and 'going to' at every corner. What does that do to the sign? And what happens to the order of the corners?",
      why: "At each corner the turn goes the opposite way when you walk the polygon backwards, so every sign flips (zero stays zero), and the corners now come in the order F, E, D, C, B, A. Strip 3 does both: F −7, E 0, D −6, C +3, B −5, A −8. Strip 1 reverses the order but forgets to flip. Strip 2 flips but keeps the order. Strip 4 does neither." },
    { type: "order",
      q: "Each panel walks A → B → C. Put the panels in order of their cross product (B − A) × (C − A), from the most positive to the most negative.",
      fig: triPanels, items: ["Panel Z", "Panel X", "Panel W", "Panel Y"],
      hint: "For a flat first edge, the cross product is its length times how far C sits above it (or below it, for a right turn).",
      why: "Z: (6, 0) × (6, 3) = 18. X: (3, 0) × (1, 5) = 15, a left turn but a slimmer triangle. W: the three points lie on one straight line, so the product is 0. Y: (4, 0) × (4, −3) = −12, a right turn (clockwise), so it is negative. The order is therefore Z (18), X (15), W (0), Y (−12)." },
  ]);

  /* =====================================================================
     a5-wrap
     ===================================================================== */
  const wrapPanels = (() => {
    const P = {
      A: [[0, 2], [4, 0], [9, 1], [10, 6], [6, 10], [1, 9], [3, 4], [5, 3], [6, 5], [4, 6], [7, 3], [5, 5]],
      B: [[5, 0], [8, 1], [10, 4], [9, 7], [6, 9], [3, 9], [1, 7], [0, 4], [2, 1], [7, 10], [4, 0], [10, 6]],
      C: [[0, 0], [10, 0], [10, 10], [0, 10], [3, 3], [5, 2], [7, 4], [4, 5], [6, 6], [2, 7], [8, 8], [5, 8]],
    };
    let g = "";
    ["A", "B", "C"].forEach((k, p) => {
      const x0 = 8 + p * 150, X = (x) => x0 + 14 + x * 11.2, Y = (y) => 168 - y * 12.4;
      g += rect(x0, 6, 140, 184, "var(--panel)", "var(--line-2)", 3, 12) + txt(x0 + 70, 22, `Panel ${k}`, { s: 13, c: "var(--ink)" });
      P[k].forEach(([x, y]) => (g += circ(X(x), Y(y), 5.5, "var(--blue)", "var(--panel)", 1.5)));
      g += txt(x0 + 70, 184, "12 points", { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(460, 196, g);
  })();

  // ten points, five arrows drawn by a learner (arrow 3 skips the corner (10, 6))
  const wrapArrows = (() => {
    const p = plane(10, 9, 40, 20, 400, 290, false);
    const H = { 1: [1, 2], 2: [5, 0], 3: [9, 2], 4: [10, 6], 5: [6, 9], 6: [2, 8] };
    const I = [[5, 4], [4, 6], [7, 5], [3, 3]];
    let g = "";
    I.forEach(([x, y]) => (g += circ(p.X(x), p.Y(y), 7, "var(--panel)", "var(--line-2)", 3)));
    Object.values(H).forEach(([x, y]) => (g += circ(p.X(x), p.Y(y), 7, "var(--panel)", "var(--line-2)", 3)));
    const path = [[1, 2, "s1"], [2, 3, "s2"], [3, 5, "s3"], [5, 6, "s4"], [6, 1, "s5"]];
    path.forEach(([a, b, id], i) => {
      const [x1, y1] = H[a], [x2, y2] = H[b], mx = (p.X(x1) + p.X(x2)) / 2, my = (p.Y(y1) + p.Y(y2)) / 2;
      const dx = p.X(x2) - p.X(x1), dy = p.Y(y2) - p.Y(y1), d = Math.hypot(dx, dy);
      const ox = (dy / d) * 16, oy = (-dx / d) * 16;
      g += pk(id, arrow(p.X(x1) + (dx / d) * 9, p.Y(y1) + (dy / d) * 9, p.X(x2) - (dx / d) * 9, p.Y(y2) - (dy / d) * 9, "var(--blue)", 4) + ln(p.X(x1), p.Y(y1), p.X(x2), p.Y(y2), "transparent", 22) + circ(mx - ox, my - oy, 11, "var(--panel)", "var(--blue)", 2) + txt(mx - ox, my - oy + 4, i + 1, { s: 12, c: "var(--ink)" }));
    });
    return svg(420, 308, g);
  })();

  // cost per input point against n (log scale ticks), hull stays at 8 points
  const wrapPlot = (() => {
    const ns = [16, 32, 64, 128, 256, 512, 1024], x0 = 58, x1 = 440, y0 = 24, y1 = 226;
    const X = (i) => x0 + 18 + i * ((x1 - x0 - 36) / 6), Y = (v) => y1 - (v / 12) * (y1 - y0);
    let g = "";
    [0, 4, 8, 12].forEach((v) => (g += ln(x0, Y(v), x1, Y(v), "var(--line)", 1) + txt(x0 - 8, Y(v) + 4, v, { a: "end", s: 12, w: 700, c: "var(--text-dim)" })));
    ns.forEach((n, i) => (g += txt(X(i), y1 + 18, n, { s: 11, w: 700, c: "var(--text-dim)" })));
    g += ln(X(0), Y(8), X(6), Y(8), "var(--amber)", 3, 'stroke-dasharray="8 5"') + txt(X(0) + 4, Y(8) - 10, "gift wrapping: h = 8", { a: "start", s: 12, c: "var(--amber-ink)" });
    g += `<polyline points="${ns.map((n, i) => `${X(i)},${Y(Math.log2(n))}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3"/>`;
    ns.forEach((n, i) => (g += dot(X(i), Y(Math.log2(n)), "", { r: 9, id: "n" + n, stroke: "var(--blue)" })));
    g += txt(X(4), Y(12) + 4, "Graham scan: log₂ n", { s: 12, c: "var(--blue-ink)" }) + txt((x0 + x1) / 2, y1 + 38, "number of points n", { s: 12, c: "var(--text-dim)" }) + txt(6, 12, "work per point", { a: "start", s: 11, c: "var(--text-dim)" });
    return svg(460, 268, g);
  })();

  // angle diagram: scan order of six candidate points seen from the current point
  const wrapAngles = (() => {
    const cx = 40, cy = 232, d2r = Math.PI / 180, k = 1.2;
    const C = [[72, 150], [55, 175], [80, 118], [31, 185], [44, 150], [18, 168]];
    let g = ln(cx, cy, 410, cy, "var(--line)", 2) + txt(392, cy - 8, "east", { s: 11, w: 700, c: "var(--text-dim)" });
    C.forEach(([a, d], i) => {
      const x = cx + d * k * Math.cos(a * d2r), y = cy - d * k * Math.sin(a * d2r);
      g += ln(cx, cy, x, y, "var(--line-2)", 2, 'stroke-dasharray="3 5"') + dot(x, y, i + 1, { r: 12, s: 13 });
    });
    g += circ(cx, cy, 11, "var(--teal)", "var(--teal)") + txt(cx + 8, cy + 22, "cur", { a: "start", s: 13, c: "var(--teal-ink)" });
    return svg(420, 256, g);
  })();

  B.add("a5-wrap", [
    { type: "order",
      q: "Gift wrapping costs about n × h, where h is the number of points on the hull. Each panel has 12 points, placed differently. Put the panels in order of work, least first.",
      fig: wrapPanels, items: ["Panel C", "Panel A", "Panel B"],
      hint: "Count the points on the outside boundary of each panel. Interior points add nothing to h.",
      why: "Panel C has four corner points with eight inside (h = 4: about 12 × 4 = 48 checks). Panel A has six on its boundary (h = 6, about 72). Panel B has almost every point on the boundary (h = 10, about 120). Same n, so the cost follows the hull size alone. That is what 'output-sensitive' means." },
    { type: "pick",
      q: "A learner ran gift wrapping on ten points, counter-clockwise from the leftmost point, and drew five numbered arrows. One arrow is a mistake: gift wrapping would never draw it. Click that arrow.",
      fig: wrapArrows, a: "s3",
      hint: "At each hull point, the next point must have every other point on its left. Is any point outside an arrow?",
      why: "Arrow 3 goes from the bottom-right corner straight to the top, but the point at (10, 6) lies outside it, on its right. Gift wrapping would have picked that point: it is the one with all other points on its left. The other four arrows each have every point on their left, so they are real hull edges. Interior points are never reached." },
    { type: "pick",
      q: "The hull has 8 points however many points there are. Gift wrapping does about 8 checks per input point, and Graham scan about log₂ n (its sort). Click the first n at which gift wrapping does LESS work per point than Graham scan.",
      fig: wrapPlot, a: "n512",
      hint: "log₂ 256 = 8. Is the blue line above or below the dashed line when gift wrapping wins?",
      why: "Gift wrapping is flat at 8 per point; Graham's sorting cost per point grows as log₂ n: 4, 5, 6, 7, 8, 9, 10. At n = 256 they tie (8 against 8). Only from 512 (log₂ 512 = 9) is gift wrapping strictly cheaper. With a small, fixed hull, MORE points favours gift wrapping, because it never pays for sorting." },
    { type: "slider", min: 0, max: 6, step: 1, start: 1, ans: 3, tol: 0, unit: "changes",
      q: "Gift wrapping stands at the lowest point cur, and all six candidate points are above it. The inner loop sets nxt to point 1, then scans points 2 to 6 in order. nxt changes whenever the scanned point is to the RIGHT of the arrow cur → nxt. The angles (above east) are 72°, 55°, 80°, 31°, 44° and 18°. How many times does nxt change?",
      fig: wrapAngles,
      hint: "A point to the right of cur → nxt has a smaller angle than nxt. Track the smallest angle seen so far.",
      why: "The loop keeps the smallest angle so far. Start: 72°. Point 2 (55°) is smaller: change 1. Point 3 (80°): no. Point 4 (31°): change 2. Point 5 (44°): no. Point 6 (18°): change 3. So nxt ends on point 6 after changing 3 times, and point 6 is the true next hull point: every other point is on its left." },
    { type: "match",
      q: "A set of 100 points has a hull of 10 corners, so gift wrapping does about 100 × 10 = 1,000 checks. Match each change with what happens to the work.",
      pairs: [
        ["Add 100 more points, all inside the hull", "About twice the work"],
        ["Pull the hull out to 40 corners (still 100 points)", "About four times the work"],
        ["Move the interior points about, all still inside", "No change"],
        ["Delete 50 interior points", "About half the work"],
      ],
      hint: "Work is n × h. Which of the two numbers does each change touch?",
      why: "Work is about n × h. Adding 100 interior points doubles n and leaves h at 10: 2,000 checks. Pulling the hull out to 40 multiplies h by 4: 4,000. Moving interior points around changes neither. Deleting 50 interior points halves n: 500. Interior points only ever cost you a check per step; they never create more steps." },
  ]);

  /* =====================================================================
     a5-graham
     ===================================================================== */
  const stackPlot = (() => {
    const sizes = [1, 2, 3, 4, 4, 3, 4, 5, 5], x0 = 52, x1 = 440, y0 = 22, y1 = 214;
    const X = (i) => x0 + 12 + i * ((x1 - x0 - 24) / 8), Y = (v) => y1 - ((v - 0.5) / 5.5) * (y1 - y0);
    let g = "";
    [1, 2, 3, 4, 5, 6].forEach((v) => (g += ln(x0, Y(v), x1, Y(v), "var(--line)", 1) + txt(x0 - 8, Y(v) + 4, v, { a: "end", s: 12, w: 700, c: "var(--text-dim)" })));
    sizes.forEach((v, i) => (g += txt(X(i), y1 + 18, i === 0 ? "start" : i, { s: 11, w: 700, c: "var(--text-dim)" })));
    g += `<polyline points="${sizes.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linejoin="round"/>`;
    sizes.forEach((v, i) => (g += i === 0 ? circ(X(i), Y(v), 7, "var(--teal)", "var(--teal)", 2) : dot(X(i), Y(v), "", { r: 9, id: "p" + i, stroke: "var(--blue)" })));
    g += txt((x0 + x1) / 2, y1 + 38, "points processed so far", { s: 12, c: "var(--text-dim)" }) + txt(6, 12, "stack height", { a: "start", s: 11, c: "var(--text-dim)" });
    return svg(460, 258, g);
  })();

  // four stack snapshots
  const snaps = (() => {
    const S = [["1", "after pushing D", ["P0", "A", "C", "D"]], ["2", "after pushing E", ["P0", "B", "D", "E"]], ["3", "after pushing F", ["P0", "A", "C", "D"]], ["4", "after pushing E", ["P0", "A", "E"]]];
    let g = "";
    S.forEach(([n, cap, st], i) => {
      const x0 = 8 + i * 114, base = 214;
      g += rect(x0, 6, 106, 226, "var(--panel)", "var(--line-2)", 3, 12) + txt(x0 + 53, 26, `Snapshot ${n}`, { s: 13, c: "var(--ink)" }) + txt(x0 + 53, 44, cap, { s: 11, w: 700, c: "var(--text-dim)" });
      st.forEach((p, k) => {
        const y = base - (k + 1) * 36, bottom = k === 0;
        g += rect(x0 + 24, y, 58, 32, bottom ? "var(--teal)" : "var(--panel-2)", bottom ? "var(--teal)" : "var(--line-2)", 2, 6) + txt(x0 + 53, y + 21, p, { s: 14, c: bottom ? "#fff" : "var(--ink)" });
      });
    });
    return svg(470, 238, g);
  })();

  // 100% stacked bars: sort share against scan share
  const shareBars = (() => {
    const D = [["1,000", 16.7], ["10,000", 13.1], ["100,000", 10.7], ["1,000,000", 9.1]];
    let g = txt(230, 16, "share of the whole run: sort (blue) and scan (amber)", { s: 12, c: "var(--ink)" });
    D.forEach(([n, sc], i) => {
      const x = 40 + i * 104, top = 30, H = 170, hs = (sc / 100) * H;
      g += `<rect x="${x}" y="${top}" width="70" height="${H - hs}" rx="4" fill="var(--blue)"/><rect x="${x}" y="${top + H - hs}" width="70" height="${hs}" rx="4" fill="var(--amber)"/>`;
      g += txt(x + 35, top + (H - hs) / 2 + 5, (100 - sc).toFixed(1) + "%", { s: 13, c: "#fff" }) + txt(x + 35, top + H - hs / 2 + 4, sc + "%", { s: 11, c: "#fff" }) + txt(x + 35, top + H + 18, "n = " + n, { s: 11, w: 700, c: "var(--text-dim)" });
    });
    return svg(460, 238, g);
  })();

  // scatter: which points end off the final stack
  const hullScatter = (() => {
    const p = plane(10, 9, 30, 20, 400, 290, true);
    const P = { a: [6, 0], b: [10, 0], c: [10, 4], d: [10, 8], e: [7, 6], f: [4, 9], g: [0, 5], h: [5, 4], i: [3, 3] };
    let g = p.g + circ(p.X(2), p.Y(0), 12, "var(--teal)", "var(--teal)") + txt(p.X(2), p.Y(0) + 4, "P0", { s: 11, c: "#fff" });
    Object.entries(P).forEach(([k, [x, y]]) => (g += dot(p.X(x), p.Y(y), k, { r: 11, id: k, s: 13 })));
    return svg(420, 316, g);
  })();

  // stack before and after, plus the plane
  const stackScene = (() => {
    const px0 = 204, px1 = 452, py0 = 14, py1 = 292, X = (x) => px0 + (x / 12) * (px1 - px0), Y = (y) => py1 - (y / 12) * (py1 - py0);
    let g = "";
    for (let i = 0; i <= 12; i += 2) g += ln(X(i), Y(0), X(i), Y(12), "var(--line)", 1) + ln(X(0), Y(i), X(12), Y(i), "var(--line)", 1);
    const P0 = [0, 0], A = [8, 9], Bp = [5, 10], C = [3, 7];
    g += `<polyline points="${[P0, A, Bp, C].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="none" stroke="var(--teal)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
    g += circ(X(0), Y(0), 11, "var(--teal)", "var(--teal)") + txt(X(0) + 2, Y(0) + 4, "P0", { s: 10, c: "#fff" });
    [["A", A], ["B", Bp], ["C", C]].forEach(([n, [x, y]]) => (g += dot(X(x), Y(y), n, { r: 11, stroke: "var(--teal)" })));
    [["d1", [1, 3]], ["d2", [0, 7]], ["d3", [2, 11]], ["d4", [3, 11]], ["d5", [2, 5]]].forEach(([id, [x, y]], i) => (g += pk(id, circ(X(x), Y(y), 10, "var(--panel)", "var(--amber)", 3) + txt(X(x), Y(y) + 4, i + 1, { s: 12, c: "var(--ink)" }))));
    const col = (x, title, st, last) => {
      let s = txt(x + 42, 22, title, { s: 12, c: "var(--ink)" });
      st.forEach((p, k) => {
        const y = 262 - k * 38, bottom = k === 0, top = last && k === st.length - 1;
        s += rect(x, y, 84, 32, bottom ? "var(--teal)" : top ? "var(--amber)" : "var(--panel-2)", bottom ? "var(--teal)" : top ? "var(--amber)" : "var(--line-2)", 2, 6) + txt(x + 42, y + 21, p, { s: 14, c: bottom || top ? "#fff" : "var(--ink)" });
      });
      return s;
    };
    g += col(4, "Before", ["P0", "A", "B", "C"], false) + col(96, "After", ["P0", "A", "D"], true);
    return svg(460, 304, g);
  })();

  B.add("a5-graham", [
    { type: "pick",
      q: "A Graham scan starts with the anchor on the stack. The chart shows the stack height after each point of the sorted list has been processed. Every step pushes the new point, and may pop some points first. Click the step in which the MOST points were popped.",
      fig: stackPlot, a: "p5",
      hint: "Pops at a step = 1 + (old height) − (new height). A step that only rises by 1 popped nothing.",
      why: "Step 4 stays at 4: it pushed one point and popped one (1 + 4 − 4 = 1). Step 5 drops from 4 to 3: it pushed one and popped TWO (1 + 4 − 3 = 2), the most of any step. Step 8 stays at 5, with one pop. Steps 1, 2, 3, 6 and 7 rise by exactly 1, so nothing was popped there. The final height is 5, so five points are on the hull." },
    { type: "cat",
      q: "Graham scan pushes the points one by one in angle order A, B, C, D, E, F (the anchor P0 is pushed first). Each snapshot shows the stack, with the bottom at the bottom, right after the named point has been pushed. Which snapshots are possible?",
      fig: snaps, buckets: ["Possible", "Impossible"],
      items: [["Snapshot 1", 0], ["Snapshot 2", 1], ["Snapshot 3", 1], ["Snapshot 4", 0]],
      hint: "A stack only removes from the top. And where is the point that was just pushed?",
      why: "Snapshot 1 is possible: B was popped when C arrived, and D was pushed on top. Snapshot 4 is possible: D and C were popped when E arrived. Snapshot 2 is impossible: A is gone but B, which sits above A, is still there, and a stack cannot remove from the middle. Snapshot 3 is impossible: the point just pushed (F) must be on top, but F is missing." },
    { type: "slider", min: 0, max: 40, step: 0.5, start: 20, ans: 4.5, tol: 2, unit: "% shorter",
      q: "Graham scan on 1,000,000 points spends its time sorting (about n log₂ n steps) and scanning (at most 2n steps). The bars show the shares. A clever trick makes the scan twice as fast and leaves the sort alone. By about what percentage does the WHOLE run get shorter?",
      fig: shareBars,
      hint: "Out of 22 parts of time, 20 are the sort and 2 are the scan. Halving the scan saves 1 part.",
      why: "At n = 1,000,000 the scan is only about 9% of the total (sort 20 parts, scan 2 parts, out of 22). Halving it saves half of 9%, so the whole run is only about 4.5% shorter. That is why the algorithm is O(n log n): the sort dominates, and polishing the scan can never matter much." },
    { type: "pick",
      q: "Graham scan pops a point whenever the turn is not a strict left turn, so points that are straight on the boundary are popped too. The anchor P0 is always on the hull. Click every point that is NOT on the final stack.",
      fig: hullScatter, a: ["a", "c", "e", "h", "i"],
      hint: "Find the corner points first. Then check for points lying exactly on a side between two corners.",
      why: "The hull corners are P0, b, d, f and g. Points e, h and i are inside. Points a and c are different: a lies exactly on the straight bottom side from P0 to b, and c lies exactly on the right side from b to d. They make a straight line (turn 0) with their neighbours, so the scan pops them. A scan that popped only on right turns would keep a and c as flat hull points." },
    { type: "pick",
      q: "The stack before and after one step of Graham scan is shown (the new point D is amber). D comes later in angle order than C. Click every numbered position that D could be in.",
      fig: stackScene, a: ["d3", "d4"],
      hint: "Two points were popped, B and C. Each pop means that point is not a left turn. Where must D be to be right of B → C and right of A → B?",
      why: "C is popped when B → C → D is not a left turn, and then B is popped when A → B → D is not a left turn. D sits high and close in, beyond the outside edge of the chain: positions 3 and 4. Position 2 pops only C (B survives), so the stack would end P0, A, B, D. Positions 1 and 5 turn left at C, so nothing is popped and D is pushed on top of C." },
  ]);

  /* =====================================================================
     l2-mst
     ===================================================================== */
  const mapLinks = (() => {
    const T = { A: [2, 1], B: [4, 2], C: [7, 6], D: [5, 2], E: [7, 8], F: [1, 2], G: [10, 3] };
    const p = plane(11, 9, 24, 16, 416, 276, true);
    let g = p.g;
    [["A", "F", "1.4", -17, 12], ["B", "D", "1.0", 0, -17], ["C", "E", "2.0", 14, 0], ["C", "G", "4.2", 6, -10], ["A", "B", "2.2", 4, 17], ["C", "D", "4.5", -14, -6], ["F", "B", "3.0", -8, -14], ["D", "G", "5.1", 0, 16]].forEach(([a, b, w, dx, dy]) => {
      const [x1, y1] = [p.X(T[a][0]), p.Y(T[a][1])], [x2, y2] = [p.X(T[b][0]), p.Y(T[b][1])];
      g += pk(a + b, ln(x1, y1, x2, y2, "var(--blue)", 4) + ln(x1, y1, x2, y2, "transparent", 22) + wl((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy + 4, w, "var(--ink)", 12));
    });
    Object.entries(T).forEach(([k, [x, y]]) => (g += dot(p.X(x), p.Y(y), k, { r: 10, s: 12 })));
    return svg(440, 292, g);
  })();

  const planLine = (() => {
    const P = [["P1", 14, "var(--rose)", "loop, and town E is cut off"], ["P2", 17, "var(--rose)", "tree, but town C has 3 links"], ["P3", 19, "var(--teal)", "tree, no town has more than 2 links"], ["P4", 20, "var(--teal)", "tree, no town has more than 2 links"], ["P5", 23, "var(--teal)", "tree, no town has more than 2 links"]];
    const X = (c) => 30 + ((c - 12) / 13) * 400;
    let g = ln(X(12), 54, X(25), 54, "var(--line-2)", 3);
    for (let c = 12; c <= 24; c += 2) g += ln(X(c), 48, X(c), 60, "var(--line-2)", 2) + txt(X(c), 84, c, { s: 12, w: 700, c: "var(--text-dim)" });
    P.forEach(([n, c, col]) => (g += circ(X(c), 54, 12, col, col, 2) + txt(X(c), 59, n.slice(1), { s: 13, c: "#fff" })));
    g += txt(220, 22, "total cost of each plan", { s: 12, c: "var(--ink)" });
    P.forEach(([n, c, col, note], i) => {
      const y = 98 + i * 34;
      g += pk(n, rect(8, y, 424, 28, "var(--panel)", "var(--line-2)", 2, 8) + circ(28, y + 14, 11, col, col, 2) + txt(28, y + 19, n.slice(1), { s: 12, c: "#fff" }) + txt(46, y + 19, `cost ${c}: ${note}`, { a: "start", s: 12, c: "var(--ink)" }));
    });
    return svg(440, 98 + 5 * 34 + 4, g);
  })();

  const ring = (() => {
    const cx = 160, cy = 96, R = 70, d2r = Math.PI / 180, ang = [-90, -30, 30, 90, 150, 210], cost = [4, 6, 3, 7, 5, 2];
    const P = ang.map((a) => [cx + R * Math.cos(a * d2r), cy + R * Math.sin(a * d2r)]);
    let g = "";
    P.forEach((p, i) => {
      const q = P[(i + 1) % 6], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy);
      g += ln(p[0], p[1], q[0], q[1], "var(--blue)", 4) + wl(mx + (dx / d) * 16, my + (dy / d) * 16 + 4, cost[i], "var(--ink)");
    });
    P.forEach((p, i) => (g += dot(p[0], p[1], "ABCDEF"[i], { r: 14, s: 13 })));
    g += txt(300, 82, "tour cost:", { a: "start", s: 13, c: "var(--ink)" }) + txt(300, 102, "4 + 6 + 3 + 7", { a: "start", s: 13, c: "var(--ink)" }) + txt(300, 122, "+ 5 + 2 = 27", { a: "start", s: 13, c: "var(--ink)" });
    return svg(460, 196, g);
  })();

  const tiedPlans = (() => {
    const names = ["A", "B", "C", "D", "E"], ang = [-90, -18, 54, 126, 198], d2r = Math.PI / 180;
    const E = [["A", "B", 2], ["B", "C", 2], ["C", "D", 3], ["D", "E", 3], ["E", "A", 3], ["B", "D", 5]];
    const plans = [[["A", "B"], ["B", "C"], ["C", "D"], ["D", "E"]], [["A", "B"], ["B", "C"], ["D", "E"], ["E", "A"]], [["A", "B"], ["B", "C"], ["B", "D"], ["D", "E"]]];
    let g = "";
    plans.forEach((pl, p) => {
      const x0 = 8 + p * 150, cx = x0 + 70, cy = 108, R = 46;
      const P = Object.fromEntries(names.map((n, i) => [n, [cx + R * Math.cos(ang[i] * d2r), cy + R * Math.sin(ang[i] * d2r)]]));
      let inner = rect(x0, 6, 140, 196, "var(--panel)", "var(--line-2)", 3, 12) + txt(x0 + 70, 26, `Plan ${p + 1}`, { s: 13, c: "var(--ink)" });
      E.forEach(([a, b]) => {
        const on = pl.some(([u, v]) => (u === a && v === b) || (u === b && v === a)), [x1, y1] = P[a], [x2, y2] = P[b];
        inner += ln(x1, y1, x2, y2, on ? "var(--teal)" : "var(--line-2)", on ? 5 : 2, on ? "" : 'stroke-dasharray="2 5"');
      });
      E.forEach(([a, b, w]) => {
        const [x1, y1] = P[a], [x2, y2] = P[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1, diag = a === "B" && b === "D";
        inner += wl(diag ? mx + 12 : mx + (dx / d) * 11, diag ? my - 4 : my + (dy / d) * 11 + 4, w, "var(--ink)", 11);
      });
      names.forEach((n) => (inner += dot(P[n][0], P[n][1], n, { r: 11, s: 11 })));
      inner += txt(x0 + 70, 190, "green links used", { s: 10, w: 700, c: "var(--text-dim)" });
      g += pk("pl" + (p + 1), inner);
    });
    return svg(460, 210, g);
  })();

  B.add("l2-mst", [
    { type: "pick",
      q: "Seven towns lie on a map and a cable costs its straight-line length. Eight possible cables are drawn with their costs. A cable is a SURE PICK if it is the shortest cable leaving some single town (that town versus all the others is a cut). Click every drawn cable that is a sure pick.",
      fig: mapLinks, a: ["AF", "BD", "CE", "CG"],
      hint: "For each town, find its shortest cable among the drawn ones. A cable is a sure pick if it is the shortest at either of its ends.",
      why: "A's shortest is A–F (1.4), B's is B–D (1.0), C's is C–E (2.0), D's is B–D, E's is C–E, F's is A–F, and G's is C–G (4.2). So A–F, B–D, C–E and C–G are sure picks by the cut property. A–B (2.2), C–D (4.5), F–B (3.0) and D–G (5.1) are never the shortest at either end. C–D happens to be in the cheapest network, but it needs a bigger cut to prove it." },
    { type: "pick",
      q: "A firm may build only a plan that connects every town, has no loops and gives no town more than 2 links. The five plans are placed by total cost. Click the plan the firm should build.",
      fig: planLine, a: "P3",
      hint: "Cross out any plan that breaks a rule. Then take the cheapest of what is left.",
      why: "Plan 1 (14) is the cheapest overall, but a town is cut off, so it does not connect everything. Plan 2 (17) is a proper spanning tree, probably the plain MST, but town C has 3 links, which the rule forbids. Plans 3, 4 and 5 are all legal and Plan 3 is the cheapest at 19. The unconstrained MST is only a lower bound: no tree can cost less, and the rule pushes the best legal tree above it." },
    { type: "bug",
      q: "This greedy code takes the cables cheapest first and tries to build a tree where no town has more than 2 links. For a star (one hub with four cheap cables) it returns a hub with 4 links. Click the faulty line.",
      code: ["def greedy(edges, n):", "    deg = [0] * n", "    group = list(range(n))", "    tree = []", "    for w, u, v in sorted(edges):", "        if group[u] == group[v]:", "            continue", "        if deg[u] > 1 and deg[v] > 1:", "            continue", "        old, new = group[v], group[u]", "        for i in range(n):", "            if group[i] == old:", "                group[i] = new", "        deg[u] += 1", "        deg[v] += 1", "        tree.append((u, v))", "    return tree"],
      a: 7,
      why: "The code skips a cable only when BOTH ends are already full ('and'). A cable should be skipped when EITHER end is full ('or'), because adding it would give that town a third link. With 'and', the hub keeps accepting spokes while the other end has room, so it ends with 4 links. Everything else is right: the group relabelling stops loops, and the degree counts are updated." },
    { type: "mcq",
      q: "These six towns are joined by a round tour of cables that costs 27 in total, as drawn. You delete the dearest cable (7). What is certain about the cost of the CHEAPEST spanning tree of the six towns, using the cables available?",
      fig: ring, o: ["At most 20", "Exactly 20", "At least 27", "At least 20"], a: 0,
      hint: "What is left after deleting one cable from a ring: is it a spanning tree? What does it cost?",
      why: "Deleting one cable from a ring leaves a path through all six towns: connected, no loop, so it is a spanning tree. It costs 27 − 7 = 20. The cheapest spanning tree can cost no more than this one, so it is AT MOST 20. It could be less if other cables exist, so 'exactly 20' is not certain, and 'at least' is the wrong way round." },
    { type: "pick",
      q: "Five towns can be linked by the cables shown (costs on each). Three plans are drawn, each in green; every plan is a spanning tree. Click every plan that is a minimum spanning tree.",
      fig: tiedPlans, a: ["pl1", "pl2"],
      hint: "Add up the green costs of each plan. Then ask: does every minimum tree have to look the same?",
      why: "Plan 1 costs 2 + 2 + 3 + 3 = 10 and plan 2 costs 2 + 2 + 3 + 3 = 10. Plan 3 uses the dear diagonal B–D (5): 2 + 2 + 5 + 3 = 12. The three cables of cost 3 (C–D, D–E, E–A) are such that any two of them finish the tree, so there are three different cheapest trees. Ties do not change the minimum cost, but they mean the cheapest network may not be unique." },
  ]);
})();

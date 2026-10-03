/* Revision bank, third set of varied, visual questions (algo-2).
   Modules: workshops a3-lab, a4-build, a5-code and sessions a3-simplex, a3-bracket, a3-nm, a4-cut, a4-mst, a5-orient, a5-wrap, a5-graham.
   Every figure is inline SVG built here (a different diagram kind per question). Every number was checked by running the real
   algorithm (corner profits, Kruskal/Prim, golden-section, Graham scan, gift wrapping). Questions stand alone: the data is in the question or its figure. */
(function () {
  const B = NIC.bank;
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="display:block;width:100%;max-height:${h}px">${inner}</svg>`;
  const pk = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const f1 = (v) => String(Math.round(v * 100) / 100);
  const ln = (x1, y1, x2, y2, c, w, extra = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const circ = (x, y, r, fill, stroke, sw = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const arrow = (x1, y1, x2, y2, c, w = 3) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 9;
    const p = [[x2, y2], [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)], [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)]];
    return ln(x1, y1, x2 - h * 0.6 * Math.cos(a), y2 - h * 0.6 * Math.sin(a), c, w) + `<polygon points="${p.map((q) => q.join(",")).join(" ")}" fill="${c}"/>`;
  };
  /* a table drawn in SVG: rows of cells, optional pickable cells. cols = widths, rowH = height */
  function table(x0, y0, cols, rowH, rows, o = {}) {
    let s = "", y = y0;
    rows.forEach((row, r) => {
      let x = x0;
      row.forEach((cell, c) => {
        const cc = typeof cell === "object" ? cell : { t: cell };
        const head = r === 0 && o.head !== false;
        const fill = cc.fill || (head ? "var(--panel-2)" : "var(--panel)");
        const w = cols[c];
        s += `<rect x="${x}" y="${y}" width="${w}" height="${rowH}" fill="${fill}" stroke="var(--line-2)" stroke-width="1.5"/>`;
        s += txt(cc.a === "start" ? x + 8 : x + w / 2, y + rowH / 2 + 5, cc.t, { a: cc.a, s: cc.s || o.s || 13, c: cc.c || (head ? "var(--text-dim)" : "var(--ink)"), w: head ? 800 : cc.w || 800 });
        x += w;
      });
      y += rowH;
    });
    return s;
  }
  const sum = (a) => a.reduce((s, v) => s + v, 0);

  /* =====================================================================
     a3-lab  (workshop: corner hunt)
     ===================================================================== */
  // small multiples: profit at the three corners for four prices of Y (profit = 3x + c*y)
  function labPanels() {
    const cs = [1, 2, 4, 6], corners = [[5, 0], [4, 3], [0, 5]];
    let s = "";
    cs.forEach((c, i) => {
      const x0 = 6 + (i % 2) * 208, y0 = 4 + Math.floor(i / 2) * 150, base = y0 + 112;
      let g = `<rect x="${x0}" y="${y0}" width="200" height="142" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` + txt(x0 + 100, y0 + 20, `£${c} per unit of Y`, { s: 13, c: "var(--ink)" });
      corners.forEach(([x, y], k) => {
        const z = 3 * x + c * y, h = (z / 40) * 66, bx = x0 + 28 + k * 54;
        g += `<rect x="${bx}" y="${base - h}" width="38" height="${h}" rx="5" fill="var(--blue)"/>` + txt(bx + 19, base - h - 5, `£${z}`, { s: 12, c: "var(--ink)" }) + txt(bx + 19, base + 14, `(${x},${y})`, { s: 11, w: 700, c: "var(--text-dim)" });
      });
      g += ln(x0 + 16, base, x0 + 184, base, "var(--line-2)", 2);
      s += pk("c" + c, g);
    });
    return svg(420, 308, s);
  }
  // profit against a cap on Y (3x + 2y, x + 2y <= 10, 3x + y <= 15): 15 + cap below 3, then flat at 18
  function labCap() {
    const X = (c) => 52 + c * 58, Y = (p) => 212 - (p - 14) * 34;
    let s = "";
    for (let p = 14; p <= 19; p++) s += ln(X(0), Y(p), X(6), Y(p), "var(--line)", 1.5) + txt(X(0) - 8, Y(p) + 4, `£${p}`, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    for (let c = 0; c <= 6; c++) s += txt(X(c), Y(14) + 18, c, { s: 11, w: 700, c: "var(--text-faint)" });
    s += txt(X(3), Y(14) + 36, "cap on Y (at most this many sold)", { s: 12, w: 700, c: "var(--text-dim)" });
    s += `<polyline points="${X(0)},${Y(15)} ${X(3)},${Y(18)} ${X(6)},${Y(18)}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    [[1, 16], [2, 17], [3, 18], [4, 18], [5, 18]].forEach(([c, p]) => (s += pk(String(c), circ(X(c), Y(p), 13, "var(--panel)", "var(--line-2)") + txt(X(c), Y(p) + 4, c, { s: 12, c: "var(--ink)" }))));
    s += txt(X(0) + 6, 16, "best profit", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(420, 262, s);
  }
  // contour (profit) lines on the factory's feasible region
  function labLines() {
    const X = (x) => 44 + x * 50, Y = (y) => 252 - y * 33;
    let s = "";
    for (let i = 0; i <= 7; i++) s += ln(X(i), Y(0), X(i), Y(7), "var(--line)", 1) + txt(X(i), Y(0) + 15, i, { s: 11, w: 700, c: "var(--text-faint)" }) + ln(X(0), Y(i), X(7), Y(i), "var(--line)", 1) + (i ? txt(X(0) - 10, Y(i) + 4, i, { a: "end", s: 11, w: 700, c: "var(--text-faint)" }) : "");
    s += `<polygon points="${[[0, 0], [5, 0], [4, 3], [0, 5]].map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>`;
    s += txt(X(1.35), Y(1.7), "legal plans", { s: 13, c: "var(--teal-ink)" });
    // 3x + 2y = z drawn across the plot box
    const seg = (z) => { const pts = []; [[0, z / 2], [7, (z - 21) / 2], [z / 3, 0], [(z - 14) / 3, 7]].forEach(([x, y]) => { if (x >= -1e-9 && x <= 7 + 1e-9 && y >= -1e-9 && y <= 7 + 1e-9) pts.push([x, y]); }); return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null; };
    [[6, "£6"], [12, "£12"], [18, "£18"], [24, "£24"]].forEach(([z, lab]) => {
      const [[x1, y1], [x2, y2]] = seg(z);
      const top = y1 > y2 ? [x1, y1] : [x2, y2];
      s += pk("z" + z, ln(X(x1), Y(y1), X(x2), Y(y2), "var(--violet)", 3.5, 'stroke-dasharray="9 6"') + ln(X(x1), Y(y1), X(x2), Y(y2), "transparent", 20)
        + `<rect x="${X(top[0]) + 6}" y="${Y(top[1]) - 1}" width="46" height="22" rx="8" fill="var(--panel)" stroke="var(--violet)" stroke-width="2"/>` + txt(X(top[0]) + 29, Y(top[1]) + 15, lab, { s: 12, c: "var(--violet-ink)" }));
    });
    s += txt(X(7) + 8, Y(0) + 4, "x", { a: "start", c: "var(--text-dim)" }) + txt(X(0) + 8, 14, "y", { a: "start", c: "var(--text-dim)" });
    return svg(420, 278, s);
  }
  // live meters for the plan (x, 3)
  const labMeters = (x) => {
    const row = (name, used, lim) => {
      const over = used > lim + 1e-9, tight = Math.abs(used - lim) < 1e-9, pct = Math.min(100, (used / lim) * 100);
      const col = over ? "var(--rose)" : tight ? "var(--amber)" : "var(--teal)";
      return `<div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-weight:800;font-size:14px"><span>${name}</span><span style="color:${over ? "var(--rose-ink)" : tight ? "var(--amber-ink)" : "var(--text-dim)"}">${f1(used)} of ${lim}${over ? ": over!" : tight ? ": full" : ""}</span></div><div style="height:14px;border-radius:8px;background:var(--line);overflow:hidden"><div style="height:100%;width:${pct}%;background:${col}"></div></div></div>`;
    };
    return `<div style="border:2px solid var(--line);border-radius:14px;padding:8px 14px;background:var(--panel)"><div style="font-weight:900;margin-bottom:2px">Plan (${f1(x)}, 3)</div>${row("Machine hours (x + 2y)", x + 6, 10)}${row("Raw material (3x + y)", 3 * x + 3, 15)}</div>`;
  };

  B.add("a3-lab", [
    { type: "pick",
      q: "A factory earns £3 per unit of X and the price shown per unit of Y, so profit = 3x + c·y. Its feasible region never changes. Each panel's bars show the profit at the three corners (5, 0), (4, 3) and (0, 5). In which panels does the best plan lie along a whole edge of the region, not just at one corner? Click every one.",
      fig: labPanels(), a: ["c1", "c6"],
      why: "Two bars tie for the top in the £1 and £6 panels. A tie means the profit line is parallel to an edge of the region: at £1 the line 3x + y = z is parallel to the raw-material edge 3x + y = 15, and at £6 the line 3x + 6y = z is parallel to the machine-hours edge x + 2y = 10. Then every plan on that edge earns the same, and the best plan is not a single corner." },
    { type: "pick",
      q: "A demand cap says at most this many units of Y can be sold (y ≤ cap). The chart shows the best profit the factory can make (£3 per X, £2 per Y, machine hours x + 2y ≤ 10, raw material 3x + y ≤ 15) for different caps. Click the point where the cap stops being slack and starts to bind.",
      fig: labCap(), a: "3",
      why: "The best plan without a cap is (4, 3), which uses 3 units of Y. A cap of 3 or more never blocks it, so profit stays flat at £18. At a cap of exactly 3 the cap just touches that plan, and any lower cap cuts it off, so the line bends down (£17 at cap 2, £16 at cap 1). A rule that is slack changes nothing; a binding rule changes the optimum." },
    { type: "bug",
      q: "legal(x, y) should say whether a plan obeys both factory rules: machine hours x + 2y ≤ 10 and raw material 3x + y ≤ 15. It calls the plan (5, 2) legal, although it needs 17 units of raw material. Click the faulty line.",
      code: ["def legal(x, y):", "    ok_hours = x + 2*y <= 10", "    ok_raw = 3*x + y <= 15", "    return ok_hours or ok_raw"], a: 3,
      why: "A plan is legal only if every rule holds, so the two checks must be joined with and. With or, the plan (5, 2) passes on machine hours (9 of 10) and is wrongly accepted although raw material is over (17 of 15)." },
    { type: "pick",
      q: "The green area holds every legal plan of the factory. Each dashed line holds all the plans that earn one profit, z = 3x + 2y. Click every profit that at least one legal plan can earn.",
      fig: labLines(), a: ["z6", "z12", "z18"], hint: "A profit can be earned if its line meets the green area anywhere, even at a single corner.",
      why: "The £6 and £12 lines cut straight through the green area, and the £18 line just touches it at the corner (4, 3), the best plan. The £24 line lies entirely outside, so no legal plan earns that much. Sliding the line up until it only just touches the region finds the optimum." },
    { type: "slider", min: 0, max: 7, step: 0.5, start: 1, ans: 4, tol: 0, unit: "units of X",
      q: "The factory is making 3 units of Y. Slide the units of X up as far as the rules allow. Rules: machine hours x + 2y ≤ 10 and raw material 3x + y ≤ 15. What is the biggest X that keeps the plan legal?",
      live: labMeters, hint: "With y = 3: hours give x + 6 ≤ 10, raw material gives 3x + 3 ≤ 15.",
      why: "At x = 4 both rules are exactly full: hours 4 + 6 = 10 and raw material 12 + 3 = 15. Past that, both go over. A corner of the region is a plan where two rules bind at once, and (4, 3) is that corner." },
  ]);

  /* =====================================================================
     a4-build  (workshop: build the cheapest network)
     ===================================================================== */
  const POS = { A: [50, 150], B: [150, 52], C: [150, 248], D: [285, 150], E: [405, 52], F: [405, 248], G: [480, 150] };
  function buildGroups() {
    const g1 = ["A", "C"];
    let s = "";
    "ABCDEFG".split("").forEach((t, i) => {
      const x = 12 + i * 57, a = g1.includes(t);
      s += `<rect x="${x}" y="14" width="50" height="46" rx="12" fill="${a ? "var(--amber-dim)" : "var(--blue-dim)"}" stroke="${a ? "var(--amber)" : "var(--blue)"}" stroke-width="3"/>` + txt(x + 25, 44, t, { s: 20, c: "var(--ink)" });
    });
    s += txt(210, 84, "amber = one group, blue = the other group", { s: 12, w: 700, c: "var(--text-dim)" });
    s += txt(210, 106, "Laid so far: D–F 2, D–E 3, A–C 4, B–D 5, E–G 6", { s: 12.5, c: "var(--ink)" });
    return svg(420, 118, s);
  }
  function buildCut() {
    // purple team {D, F}; towns elsewhere; crossing cables are pickable
    const P = { A: [28, 150], B: [80, 48], C: [80, 252], D: [235, 98], E: [388, 52], F: [235, 204], G: [412, 236] };
    const cross = [["B", "D", 5], ["C", "D", 8], ["C", "F", 10], ["D", "E", 3], ["E", "F", 11], ["F", "G", 12]];
    const inside = [["D", "F", 2], ["A", "B", 7], ["A", "C", 4], ["B", "C", 9], ["E", "G", 6]];
    let s = `<ellipse cx="235" cy="151" rx="78" ry="98" fill="var(--violet-dim)" stroke="var(--violet)" stroke-width="3" stroke-dasharray="8 6"/>` + txt(235, 20, "purple team", { s: 12, c: "var(--violet-ink)" });
    const lab = (a, b, w, c, dx, dy) => { const [x1, y1] = P[a], [x2, y2] = P[b]; return `<rect x="${(x1 + x2) / 2 + dx - 13}" y="${(y1 + y2) / 2 + dy - 12}" width="26" height="20" rx="7" fill="var(--panel)"/>` + txt((x1 + x2) / 2 + dx, (y1 + y2) / 2 + dy + 4, w, { s: 13, c }); };
    inside.forEach(([a, b, w]) => { const [x1, y1] = P[a], [x2, y2] = P[b]; s += ln(x1, y1, x2, y2, "var(--line-2)", 3); });
    inside.forEach(([a, b, w]) => (s += lab(a, b, w, "var(--text-faint)", a === "D" ? 18 : 0, 0)));
    const off = { "B-D": [0, -2], "C-D": [-6, 6], "C-F": [0, 4], "D-E": [0, -2], "E-F": [8, 8], "F-G": [0, 0] };
    cross.forEach(([a, b, w]) => { const [x1, y1] = P[a], [x2, y2] = P[b], o = off[a + "-" + b]; s += pk(a + "-" + b, ln(x1, y1, x2, y2, "var(--amber)", 4) + ln(x1, y1, x2, y2, "transparent", 22) + lab(a, b, w, "var(--amber-ink)", o[0], o[1])); });
    Object.entries(P).forEach(([k, [x, y]]) => (s += circ(x, y, 17, "var(--panel)", ["D", "F"].includes(k) ? "var(--violet)" : "var(--line-2)") + txt(x, y + 5, k, { s: 15, c: "var(--ink)" })));
    return svg(440, 282, s);
  }
  // four candidate networks on five towns (pentagon layout)
  function buildPanels() {
    const pent = (cx, cy, r) => [0, 1, 2, 3, 4].map((k) => [cx + r * Math.cos(((-90 + 72 * k) * Math.PI) / 180), cy + r * Math.sin(((-90 + 72 * k) * Math.PI) / 180)]);
    const nets = { a: { e: [[0, 1], [1, 2], [2, 3], [3, 4]], n: 4 }, b: { e: [[0, 1], [1, 2], [2, 0], [3, 4]], n: 4 }, c: { e: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]], n: 5 }, d: { e: [[0, 1], [0, 2], [0, 3], [0, 4]], n: 4 } };
    let s = "";
    ["a", "b", "c", "d"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208, y0 = 4 + Math.floor(i / 2) * 176, P = pent(x0 + 100, y0 + 74, 52);
      let g = `<rect x="${x0}" y="${y0}" width="200" height="168" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      nets[k].e.forEach(([p, q]) => (g += ln(P[p][0], P[p][1], P[q][0], P[q][1], "var(--blue)", 4)));
      P.forEach(([x, y]) => (g += circ(x, y, 9, "var(--panel)", "var(--ink)", 3)));
      g += txt(x0 + 100, y0 + 156, `${nets[k].n} cables`, { s: 12, w: 700, c: "var(--text-dim)" });
      s += pk(k, g);
    });
    return svg(420, 356, s);
  }
  // hand-built network with a dashed extra cable
  function buildLoop() {
    const E = [["A", "B", 7], ["A", "C", 4], ["C", "D", 8], ["D", "E", 3], ["D", "F", 2], ["F", "G", 12]];
    let s = "";
    const lab = (a, b, w, c, dx = 0, dy = 0) => { const [x1, y1] = POS[a], [x2, y2] = POS[b], mx = (x1 + x2) / 2 + dx, my = (y1 + y2) / 2 + dy; return `<rect x="${mx - 14}" y="${my - 12}" width="28" height="22" rx="7" fill="var(--panel)"/>` + txt(mx, my + 5, w, { s: 14, c }); };
    s += ln(POS.B[0], POS.B[1], POS.D[0], POS.D[1], "var(--rose)", 4, 'stroke-dasharray="9 7"');
    E.forEach(([a, b]) => (s += ln(POS[a][0], POS[a][1], POS[b][0], POS[b][1], "var(--blue)", 4.5)));
    E.forEach(([a, b, w]) => (s += lab(a, b, w, "var(--ink)")));
    s += lab("B", "D", 5, "var(--rose-ink)", 2, -10);
    Object.entries(POS).forEach(([k, [x, y]]) => (s += circ(x, y, 17, "var(--panel)", "var(--ink)") + txt(x, y + 5, k, { s: 15, c: "var(--ink)" })));
    s += txt(260, 292, "solid = laid cables (total 36), dashed = the new cable B–D", { s: 12.5, w: 700, c: "var(--text-dim)" });
    return svg(520, 304, s);
  }
  // order a learner laid cables in
  function buildOrder() {
    const bars = [["D–F", 2, "DF"], ["D–E", 3, "DE"], ["A–C", 4, "AC"], ["B–D", 5, "BD"], ["C–D", 8, "CD"], ["E–G", 6, "EG"]];
    let s = "";
    for (let c = 0; c <= 8; c += 2) s += ln(46, 150 - c * 13, 400, 150 - c * 13, "var(--line)", 1.5) + txt(38, 154 - c * 13, c, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    bars.forEach(([lab, c, id], i) => { const x = 58 + i * 57, h = c * 13; s += pk(id, `<rect x="${x}" y="${150 - h}" width="42" height="${h}" rx="6" fill="var(--blue)"/>` + txt(x + 21, 150 - h - 6, c, { s: 13, c: "var(--ink)" }) + txt(x + 21, 168, lab, { s: 12, c: "var(--text-dim)" }) + txt(x + 21, 183, `#${i + 1}`, { s: 11, w: 700, c: "var(--text-faint)" })); });
    s += txt(210, 206, "All cables: A–B 7, A–C 4, B–C 9, B–D 5, C–D 8, C–F 10,", { s: 12, w: 700, c: "var(--text-dim)" });
    s += txt(210, 222, "D–E 3, D–F 2, E–F 11, E–G 6, F–G 12", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 234, s);
  }

  B.add("a4-build", [
    { type: "cat",
      q: "Kruskal has laid five cables, so the seven towns now sit in the two groups coloured below. Sort each remaining cable by what would happen if Kruskal reached it right now.",
      fig: buildGroups(), buckets: ["Joins two groups", "Closes a loop"],
      items: [["A–B (cost 7)", 0], ["E–F (cost 11)", 1], ["C–F (cost 10)", 0], ["F–G (cost 12)", 1], ["B–C (cost 9)", 0]],
      why: "Whether a cable makes a loop depends on the groups, not on its cost. E–F and F–G have both ends in the blue group, so they would close a loop. A–B, C–F and B–C each link amber to blue and would be laid. In a real run, laying the first of those merges the groups, and the other two then become loops." },
    { type: "pick",
      q: "The purple team is the two towns D and F, and everyone else is outside. Cables that cross the dashed boundary are in amber. The cut property says one cable is guaranteed to be in a cheapest network. Click it.",
      fig: buildCut(), a: "D-E",
      why: "Only cables with exactly one end in the team cross the cut, and the lightest of those is safe: D–E (3) beats B–D 5, C–D 8, C–F 10, E–F 11 and F–G 12. D–F (2) is the cheapest cable overall, but both its ends are inside the team, so this cut says nothing about it. It is safe for a different cut, such as F on its own." },
    { type: "pick",
      q: "Five towns need cabling. Four networks are drawn, each with the cables shown. Click every network that is a valid spanning tree: everything connected with no loops and nothing spare.",
      fig: buildPanels(), a: ["a", "d"], hint: "A tree on five towns has four cables, but four cables is not enough on its own. Check that nothing is cut off.",
      why: "The path (a) and the star (d) connect all five towns with exactly four cables. Network (b) also has four cables, but they form a loop on three towns and leave two towns cut off. Network (c) connects everyone but has a spare fifth cable that closes a loop. Cable count and connectedness both matter." },
    { type: "slider", min: 0, max: 10, step: 1, start: 7, ans: 3, tol: 0,
      q: "Your hand-built network (solid cables, total 36) connects all seven towns. You add the dashed cable B–D, costing 5, which closes a loop. Then you remove the dearest cable on that loop. By how much does the total fall?",
      fig: buildLoop(), hint: "The loop runs B–A–C–D–B. Find its dearest cable and compare it with the new cable, 5.",
      why: "The loop is B–A (7), A–C (4), C–D (8) and the new D–B (5). The dearest cable is C–D (8). Swapping it for the 5 keeps everything connected and saves 8 − 5 = 3, so the total drops from 36 to 33." },
    { type: "pick",
      q: "A learner lays these cables by hand in the order of the bars (height = cost). One cable was laid too early: a cheaper cable that makes no loop was still available. Click it.",
      fig: buildOrder(), a: "CD", hint: "Before the fifth cable, which towns are still unconnected, and which cheaper cables would join them?",
      why: "Before cable 5 the learner has D–F, D–E, A–C and B–D, so A and C form one group and G is alone. E–G (6) and A–B (7) would each join two groups and are cheaper than C–D (8), so C–D should wait. E–G (6) laid afterwards is not the slip: it is correct, just late. The result costs 28 instead of the minimum 27 (2 + 3 + 4 + 5 + 6 + 7)." },
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
    const cols = [34, 238, 62, 126], rh = 31;
    let s = "", y = 6;
    rows.forEach((r, i) => {
      if (i === 0) { s += table(8, y, cols, rh, [r]); y += rh; return; }
      const cells = r.map((t, c) => ({ t, a: c === 1 || c === 3 ? "start" : undefined, s: c === 1 ? 13 : 13 }));
      let g = table(8, y, cols, rh, [cells], { head: false });
      s += pk("r" + i, g); y += rh;
    });
    s += txt(230, y + 20, "Points are written (x, y). Cross = orient(first, second, new).", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(470, y + 30, s);
  }
  // two sort orders round a pivot
  function codeOrders() {
    const P0 = [3, 0], pts = { A: [8, 2], B: [7, 6], C: [3, 7], D: [-1, 4], E: [0, 1] };
    const panel = (x0, title, order, note) => {
      const X = (x) => x0 + 24 + (x + 1) * 17, Y = (y) => 190 - y * 20;
      let s = `<rect x="${x0}" y="4" width="204" height="236" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>` + txt(x0 + 102, 26, title, { s: 12.5, c: "var(--ink)" });
      s += circ(X(P0[0]), Y(P0[1]), 8, "var(--violet)", "var(--violet)");
      order.forEach((k, i) => { const [x, y] = pts[k]; s += ln(X(P0[0]), Y(P0[1]), X(x), Y(y), "var(--line-2)", 1.5, 'stroke-dasharray="4 4"') + circ(X(x), Y(y), 11, "var(--panel)", "var(--blue)") + txt(X(x), Y(y) + 5, i + 1, { s: 13, c: "var(--ink)" }); });
      s += txt(X(P0[0]), Y(P0[1]) + 22, "pivot", { s: 11, c: "var(--violet-ink)" }) + txt(x0 + 102, 226, note, { s: 12, w: 700, c: "var(--text-dim)" });
      return s;
    };
    return svg(420, 246, panel(4, "returns −1 when t > 0", ["A", "B", "C", "D", "E"], "numbers = processing order") + panel(212, "returns +1 when t > 0", ["E", "D", "C", "B", "A"], "first test: orient(pivot, 1, 2) = −8"));
  }
  // same-angle tie-break: the dashed polygon loses the corner R
  function codeTie() {
    const P = { P: [0, 0], Q: [2, 0], R: [4, 0], S: [4, 4], T: [0, 4] };
    const X = (x) => 34 + x * 46, Y = (y) => 218 - y * 46;
    let s = "";
    for (let i = 0; i <= 5; i++) s += ln(X(i), Y(0), X(i), Y(5), "var(--line)", 1) + ln(X(0), Y(i), X(5), Y(i), "var(--line)", 1);
    s += `<polygon points="${["P", "Q", "S", "T"].map((k) => `${X(P[k][0])},${Y(P[k][1])}`).join(" ")}" fill="var(--rose-dim)" fill-opacity=".55" stroke="var(--rose)" stroke-width="3" stroke-dasharray="8 6"/>`;
    Object.entries(P).forEach(([k, [x, y]]) => (s += pk(k, circ(X(x), Y(y), 13, "var(--panel)", "var(--line-2)") + txt(X(x), Y(y) + 5, k, { s: 13, c: "var(--ink)" }))));
    s += txt(X(2.5), Y(5) + 2, "returned polygon", { s: 12, c: "var(--rose-ink)" });
    // the stack when Q arrives
    s += txt(330, 40, "stack when Q arrives", { s: 12, c: "var(--text-dim)" });
    s += `<rect x="290" y="52" width="80" height="34" rx="8" fill="var(--blue-dim)" stroke="var(--blue)" stroke-width="2.5"/>` + txt(330, 74, "R (top)", { s: 13, c: "var(--ink)" });
    s += `<rect x="290" y="88" width="80" height="34" rx="8" fill="var(--panel)" stroke="var(--line-2)" stroke-width="2.5"/>` + txt(330, 110, "P (bottom)", { s: 13, c: "var(--ink)" });
    s += txt(330, 150, "orient(P, R, Q) = 0", { s: 12.5, c: "var(--amber-ink)" }) + txt(330, 168, "P, R, Q are in a line", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 244, s);
  }

  B.add("a5-code", [
    { type: "bug",
      q: "lowest(pts) should return the lowest point, and the leftmost one if two points are equally low. For [(5, 0), (0, 5)] it returns (0, 5), which is not the lowest. Click the faulty line.",
      code: ["def lowest(pts):", "    lx, ly = pts[0]", "    for x, y in pts:", "        if y < ly or x < lx:", "            lx, ly = x, y", "    return lx, ly"], a: 3,
      why: "The x test must only break a tie in y. As written, any point further left replaces the pivot even when it is higher: (0, 5) beats (5, 0) on x. The fix is y < ly or (y == ly and x < lx). A wrong pivot is not on the hull, so everything after it goes wrong." },
    { type: "pick",
      q: "The lab pops while the turn is not a left turn (cross ≤ 0). This worked trace of the scan on seven points has one wrong action. Each row is a test of the top two stack points and the new point. Click the row where the scan does the wrong thing.",
      fig: codeTrace(), a: "r3", hint: "Look at the rows where the cross product is exactly 0. What does the lab do with a straight line?",
      why: "In row 3, (6,0), (6,3) and (6,6) are in a straight line, so the cross product is 0 and the lab pops (6,3), the middle point of that edge. Row 1 shows the right behaviour for a 0: it pops. Row 4 confirms it, because it tests (0,0), (6,0), (6,6), which only happens after (6,3) has gone." },
    { type: "cat",
      q: "With ax, ay = a − o and bx, by = b − o (y points up), orient(o, a, b) must be positive for a left turn, negative for a right turn and 0 for a straight line. Sort each candidate expression.",
      buckets: ["Left is positive", "Left is negative", "Not a turn test"],
      items: [["<code>ax*by - ay*bx</code>", 0], ["<code>ay*bx - ax*by</code>", 1], ["<code>by*ax - bx*ay</code>", 0], ["<code>ax*bx + ay*by</code>", 2], ["<code>bx*ay - by*ax</code>", 1], ["<code>ax*by + ay*bx</code>", 2]],
      hint: "Try o = (0, 0), a = (1, 0), b = (0, 1), a left turn. For the odd ones, also try a = (1, −1), b = (1, 1).",
      why: "ax*by − ay*bx is the cross product. Reordering its terms (by*ax − bx*ay) changes nothing, but swapping the two products (ay*bx − ax*by, bx*ay − by*ax) flips every sign, so left turns look negative. ax*bx + ay*by is the dot product, which measures alignment rather than turning, and ax*by + ay*bx adds where it should subtract, so it can read 0 for a real turn." },
    { type: "mcq",
      q: "A student swaps the signs in the sort: compare returns +1 when t > 0 and −1 when t < 0 (the rest of the code is unchanged and still pops when orient ≤ 0). The panels show the order each version sorts the five points into. What does the scan return?",
      fig: codeOrders(), o: ["The full hull, listed clockwise instead", "Just two points: every test sees a right turn", "The same hull, as only the sort order moved", "Extra dented points, because nothing gets popped"], a: 1,
      why: "The swapped sort visits the points clockwise, from the leftmost round to the right. Walking that way, every hull corner looks like a right turn, so orient ≤ 0 pops it every time. Only the pivot and the very last point survive. The turn test and the sort must agree about which direction is positive." },
    { type: "pick",
      q: "The lab sorts points with the same angle from the pivot nearest first. A student sorts them farthest first instead. For these five points the scan returns the dashed polygon P, Q, S, T. Click the true hull corner that was lost.",
      fig: codeTie(), a: "R",
      why: "R (4, 0) comes first because it is farthest on the bottom edge, so it is pushed. Then Q (2, 0) arrives, the three points are in a line, the cross product is 0, and R is popped. The scan ends up treating Q as a corner and the real corner R is gone. Nearest first avoids this: Q goes on, then R arrives and pops Q, leaving the true corner." },
  ]);

  /* =====================================================================
     a3-simplex
     ===================================================================== */
  // profit after each pivot: two pivots do not improve it
  function simplexSteps() {
    const z = [0, 12, 12, 12, 17, 21], X = (k) => 56 + k * 62, Y = (v) => 196 - v * 6.6;
    let s = "";
    for (let v = 0; v <= 24; v += 6) s += ln(X(0), Y(v), X(5), Y(v), "var(--line)", 1.5) + txt(X(0) - 12, Y(v) + 4, v, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    s += `<polyline points="${z.map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
    z.forEach((v, k) => { s += k === 0 ? circ(X(k), Y(v), 9, "var(--panel-2)", "var(--line-2)") : pk(String(k), circ(X(k), Y(v), 14, "var(--panel)", "var(--line-2)") + txt(X(k), Y(v) + 5, k, { s: 13, c: "var(--ink)" })); });
    s += txt(X(0), Y(0) + 22, "start", { s: 11, w: 700, c: "var(--text-faint)" }) + txt(X(3), Y(0) + 40, "pivot number", { s: 12, w: 700, c: "var(--text-dim)" }) + txt(X(0) - 10, 16, "profit z", { a: "start", s: 12, c: "var(--text-dim)" });
    return svg(400, 252, s);
  }
  // before and after tableaux (gain row = how much z rises per unit of each column)
  function simplexTableau() {
    const head = ["", "x", "y", "s1", "s2", "s3", "RHS"], cols = [46, 50, 50, 50, 50, 50, 58];
    const before = [head, ["s1", "1", "1", "1", "0", "0", "6"], ["s2", "1", "3", "0", "1", "0", "12"], ["s3", { t: "1", fill: "var(--amber-dim)", c: "var(--amber-ink)" }, "0", "0", "0", "1", "4"], ["gain", "3", "2", "0", "0", "0", "z = 0"]];
    const after = [head, ["s1", "0", "1", "1", "0", "+1", "2"], ["s2", "0", "3", "0", "1", "−1", "8"], ["x", "1", "0", "0", "0", "1", "4"], ["gain", "0", "2", "0", "0", "−3", "z = 12"]];
    const rn = ["s1", "s2", "x", "gain"];
    let s = txt(8, 18, "Before: pivot on the orange cell (x enters, s3 leaves)", { a: "start", s: 12.5, c: "var(--ink)" });
    s += table(8, 26, cols, 25, before);
    s += txt(8, 176, "After the pivot: one entry is wrong. Click it.", { a: "start", s: 12.5, c: "var(--ink)" });
    s += table(8, 184, cols, 25, after.map((r, i) => (i === 0 ? r : r.map((c, j) => (j === 0 ? { t: c, fill: "var(--panel-2)", c: "var(--text-dim)" } : c)))));
    // pickable overlays on the six value columns of the four body rows
    ["x", "y", "s1", "s2", "s3", "RHS"].forEach((col, j) => rn.forEach((r, i) => { const x = 8 + cols[0] + cols.slice(1, j + 1).reduce((a, b) => a + b, 0), w = cols[j + 1]; s += pk(`${r}-${col}`, `<rect x="${x}" y="${184 + 25 * (i + 1)}" width="${w}" height="25" fill="transparent" stroke="transparent" stroke-width="1"/>`); }));
    return svg(420, 320, s);
  }
  // raise-the-variable gains for the four variables at 0
  function simplexGains() {
    const v = [["x1", 2], ["x2", -3], ["x3", 4], ["x4", 0]], base = 116, k = 22;
    let s = ln(30, base, 400, base, "var(--ink)", 2.5) + txt(14, base + 4, "0", { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    [-4, -2, 2, 4].forEach((g) => (s += ln(30, base - g * k, 400, base - g * k, "var(--line)", 1) + txt(24, base - g * k + 4, (g > 0 ? "+" : "") + g, { a: "end", s: 11, w: 700, c: "var(--text-faint)" })));
    v.forEach(([name, g], i) => {
      const x = 62 + i * 88, h = Math.abs(g) * k, y = g >= 0 ? base - h : base;
      s += pk(name, `<rect x="${x - 40}" y="12" width="80" height="208" fill="transparent" stroke="transparent"/><rect x="${x - 22}" y="${g === 0 ? base - 2 : y}" width="44" height="${g === 0 ? 4 : h}" rx="5" fill="${g > 0 ? "var(--teal)" : g < 0 ? "var(--rose)" : "var(--text-faint)"}"/>` + txt(x, g > 0 ? y - 7 : g < 0 ? y + h + 16 : base - 12, (g > 0 ? "+" : "") + g, { s: 13, c: "var(--ink)" }) + txt(x, 238, name, { s: 14, c: "var(--ink)" }));
    });
    s += txt(210, 258, "z gain per unit raised", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 266, s);
  }
  // open feasible region with four objectives
  function simplexOpen() {
    const dirs = { A: [1, 1, "max x + y"], B: [-1, 1, "max y − x"], C: [1, -1, "max x − y"], D: [-1, -1, "max −x − y"] };
    let s = "";
    ["A", "B", "C", "D"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208, y0 = 4 + Math.floor(i / 2) * 176, ox = x0 + 26, oy = y0 + 126, u = 28;
      const P = (x, y) => `${ox + x * u},${oy - y * u}`;
      s += `<rect x="${x0}" y="${y0}" width="200" height="168" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      s += `<polygon points="${P(0, 0)} ${P(0, 1)} ${P(2.9, 3.9)} ${P(6.1, 3.9)} ${P(6.1, 0)}" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2.5" stroke-linejoin="round"/>`;
      s += txt(ox + 4.9 * u, oy - 0.45 * u, "open →", { s: 11, w: 700, c: "var(--teal-ink)" });
      const [dx, dy, lab] = dirs[k], cx = ox + 2.9 * u, cy = oy - 1.7 * u, L = 44 / Math.hypot(dx, dy);
      s += arrow(cx - dx * L * 0.35, cy + dy * L * 0.35, cx + dx * L, cy - dy * L, "var(--amber)", 4);
      s += txt(x0 + 100, y0 + 158, lab, { s: 13, c: "var(--ink)" }) + txt(x0 + 12, y0 + 22, k, { a: "start", s: 15, c: "var(--text-dim)" });
    });
    return svg(420, 356, s);
  }

  B.add("a3-simplex", [
    { type: "pick",
      q: "Simplex ran on a maximising LP and the chart shows z after each pivot. A normal pivot moves to a corner with a bigger z. Click every pivot that changed the basis without improving z.",
      fig: simplexSteps(), a: ["2", "3"],
      why: "At pivots 2 and 3 the profit stays at 12, so the plan did not move. That is degeneracy: three or more constraints meet at the same corner, the ratio test ties (or gives 0), and a pivot swaps which variables are in the basis without leaving the corner. Simplex then continues and reaches 17 and 21. In theory a bad pivot rule could cycle on a degenerate corner, but in practice it escapes." },
    { type: "pick",
      q: "A tableau is pivoted on the orange cell: x enters and s3 leaves. The gain row shows how much z rises per unit of each column, and RHS is the right-hand side. One entry in the new tableau is wrong. Click it.",
      fig: simplexTableau(), a: "s1-s3", hint: "Row operations: new s1 = old s1 − old s3 row, new s2 = old s2 − old s3 row, new gain = old gain − 3 × the x row.",
      why: "Subtract the pivot row (x s3 = 1, RHS 4) from the s1 row: the s3 entry goes from 0 to 0 − 1 = −1, not +1. The other entries check out: s1 row 0 1 1 0 −1 | 2, s2 row 0 3 0 1 −1 | 8, gain row 0 2 0 0 −3 | z = 12. A pivot must keep every row consistent, because each row is still the same equation." },
    { type: "pick",
      q: "Simplex stands at a corner of a four-variable LP (maximising z) where x1, x2, x3 and x4 are all 0. Each bar shows how z changes per unit if that variable is raised. Click every variable that could enter the basis.",
      fig: simplexGains(), a: ["x1", "x3"],
      why: "Raising a variable only helps if its gain is positive, so x1 (+2) and x3 (+4) qualify. x2 (−3) would make z worse, and x4 (0) leaves z unchanged, so neither is a useful move. Dantzig's rule picks the largest, x3, but x1 would also be a valid choice. When no gain is positive, the corner is optimal." },
    { type: "cat",
      q: "The green region is every legal plan: x ≥ 0, y ≥ 0 and y ≤ x + 1. It never ends towards the right. Each panel maximises a different objective, and the amber arrow points the way z grows. Does each LP have a best plan, or is it unbounded?",
      fig: simplexOpen(), buckets: ["Has a best plan", "Unbounded"],
      items: [["Panel A: max x + y", 1], ["Panel B: max y − x", 0], ["Panel C: max x − y", 1], ["Panel D: max −x − y", 0]],
      hint: "Ask whether z can keep rising along some direction the region allows, such as along the bottom edge (to the right) or up the slanting edge.",
      why: "A: moving right and up together raises x + y without limit. C: the arrow points down-right, but sliding right along the floor y = 0 still raises x − y forever. B: y − x never exceeds 1 inside the region, and the whole upper edge ties at 1. D: −x − y is largest at the origin (0). An LP is unbounded when some direction the region allows also improves z." },
    { type: "bug",
      q: "leaving_row(rows, col) runs the ratio test for the entering column col. Each row ends with its right-hand side. It once chose a row whose entry in that column was negative and pushed the plan out of the feasible region. Click the faulty line.",
      code: ["def leaving_row(rows, col):", "    best, pick = None, None", "    for i, row in enumerate(rows):", "        if row[col] != 0:", "            r = row[-1] / row[col]", "            if best is None or r < best:", "                best, pick = r, i", "    return pick"], a: 3,
      why: "A negative entry means raising the entering variable makes that row's slack grow, so that constraint never stops you and it must be ignored. Only rows with a positive entry limit the step, so the test should be row[col] > 0. Keeping a negative ratio would also pick a row that gives a negative step." },
  ]);

  /* =====================================================================
     a3-bracket
     ===================================================================== */
  const PHI = (Math.sqrt(5) - 1) / 2;
  // bracket width against function evaluations: golden section against splitting into thirds
  function bracketRace() {
    const X = (e) => 50 + e * 25, Y = (w) => 206 - w * 160;
    const gold = (e) => (e < 2 ? 1 : Math.pow(PHI, e - 2)), third = (e) => Math.pow(2 / 3, Math.floor(e / 2));
    let s = "";
    for (let w = 0; w <= 1.001; w += 0.25) s += ln(X(0), Y(w), X(14), Y(w), "var(--line)", 1.5) + txt(X(0) - 8, Y(w) + 4, f1(w), { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    for (let e = 0; e <= 14; e += 2) s += txt(X(e), Y(0) + 17, e, { s: 11, w: 700, c: "var(--text-faint)" });
    s += txt(X(7), Y(0) + 36, "function evaluations so far", { s: 12, w: 700, c: "var(--text-dim)" }) + txt(X(0) - 4, 16, "bracket width", { a: "start", s: 12, c: "var(--text-dim)" });
    const path = (fn) => Array.from({ length: 15 }, (_, e) => `${X(e)},${Y(fn(e))}`).join(" ");
    s += pk("A", `<polyline points="${path(third)}" fill="none" stroke="var(--blue)" stroke-width="4" stroke-linejoin="round"/>` + `<polyline points="${path(third)}" fill="none" stroke="transparent" stroke-width="22"/>` + circ(X(10), Y(third(10)) - 16, 12, "var(--panel)", "var(--blue)") + txt(X(10), Y(third(10)) - 12, "A", { s: 13, c: "var(--ink)" }));
    s += pk("B", `<polyline points="${path(gold)}" fill="none" stroke="var(--amber)" stroke-width="4" stroke-linejoin="round"/>` + `<polyline points="${path(gold)}" fill="none" stroke="transparent" stroke-width="22"/>` + circ(X(6), Y(gold(6)) - 18, 12, "var(--panel)", "var(--amber)") + txt(X(6), Y(gold(6)) - 14, "B", { s: 13, c: "var(--ink)" }));
    return svg(420, 262, s);
  }
  // worked golden-section trace on f(x) = (x - 3)^2 with one wrong "keeps" cell
  function bracketTrace() {
    let a = 0, b = 8;
    const f = (x) => (x - 3) * (x - 3), r2 = (v) => v.toFixed(2), rows = [["", "bracket [a, b]", "c", "d", "f(c)", "f(d)", "keeps"]];
    for (let i = 1; i <= 4; i++) {
      const c = b - PHI * (b - a), d = a + PHI * (b - a), fc = f(c), fd = f(d);
      let keep = fc < fd ? [a, d] : [c, b];
      if (i === 3) keep = fc < fd ? [c, b] : [a, d]; // the planted slip
      rows.push([String(i), `[${r2(a)}, ${r2(b)}]`, r2(c), r2(d), r2(fc), r2(fd), `[${r2(keep[0])}, ${r2(keep[1])}]`]);
      [a, b] = keep;
    }
    const cols = [30, 112, 50, 50, 52, 52, 112], rh = 34;
    let s = table(6, 6, cols, rh, [rows[0]], { s: 12.5 });
    for (let i = 1; i < rows.length; i++) s += pk("r" + i, table(6, 6 + i * rh, cols, rh, [rows[i]], { head: false, s: 12.5 }));
    s += txt(230, 6 + 5 * rh + 18, "Each row starts from the bracket the row above kept.", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(470, 6 + 5 * rh + 28, s);
  }
  // live number line for the new probe
  const bracketLive = (v) => {
    const X = (t) => 24 + t * 372;
    let s = `<rect x="${X(0.382)}" y="38" width="${X(1) - X(0.382)}" height="26" rx="8" fill="var(--teal-dim)" stroke="var(--teal)" stroke-width="2.5"/>` + ln(X(0), 51, X(1), 51, "var(--ink)", 2.5);
    [[0, "a = 0"], [1, "b = 1"]].forEach(([t, l]) => (s += ln(X(t), 41, X(t), 61, "var(--ink)", 3) + txt(X(t), 86, l, { s: 12, c: "var(--text-dim)" })));
    s += circ(X(0.382), 51, 8, "var(--panel)", "var(--blue)") + txt(X(0.382), 24, "old c = 0.382", { s: 12, c: "var(--blue-ink)" });
    s += circ(X(0.618), 51, 8, "var(--panel)", "var(--blue)") + txt(X(0.618), 24, "old d = 0.618 (reused)", { s: 12, c: "var(--blue-ink)" });
    s += `<circle cx="${X(v)}" cy="51" r="10" fill="var(--amber)" stroke="var(--ink)" stroke-width="2.5"/>` + txt(X(v), 108, `new probe at ${f1(v)}`, { s: 13, c: "var(--amber-ink)" });
    return svg(420, 118, s);
  };
  // function values at a, c, d, b and the three pieces
  function bracketTie() {
    const X = (t) => 30 + t * 360, base = 138, k = 16;
    let s = ln(X(0), base, X(1), base, "var(--ink)", 2.5);
    [[0, "a", 6], [0.382, "c", 2], [0.618, "d", 2], [1, "b", 5]].forEach(([t, n, v]) => {
      s += `<rect x="${X(t) - 11}" y="${base - v * k}" width="22" height="${v * k}" rx="4" fill="var(--blue)"/>` + txt(X(t), base - v * k - 7, v, { s: 13, c: "var(--ink)" }) + txt(X(t), base + 16, n, { s: 14, c: "var(--ink)" });
    });
    [[0, 0.382, "L", "left piece", "var(--violet)"], [0.382, 0.618, "M", "middle", "var(--amber)"], [0.618, 1, "R", "right piece", "var(--violet)"]].forEach(([t0, t1, , lab, col]) => {
      s += `<rect x="${X(t0) + 3}" y="${base + 26}" width="${X(t1) - X(t0) - 6}" height="12" rx="6" fill="${col}"/>` + txt((X(t0) + X(t1)) / 2, base + 58, lab, { s: 12, c: "var(--text-dim)" });
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
      const x0 = 6 + (i % 2) * 208, y0 = 4 + Math.floor(i / 2) * 136, fn = fs[k];
      let lo = 1e9, hi = -1e9; for (let j = 0; j <= 100; j++) { const v = fn(j / 100); lo = Math.min(lo, v); hi = Math.max(hi, v); }
      const P = (t) => `${x0 + 18 + t * 164},${y0 + 104 - ((fn(t) - lo) / (hi - lo)) * 70}`;
      let g = `<rect x="${x0}" y="${y0}" width="200" height="128" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      g += `<polyline points="${Array.from({ length: 101 }, (_, j) => P(j / 100)).join(" ")}" fill="none" stroke="var(--blue)" stroke-width="3.5" stroke-linejoin="round"/>`;
      g += txt(x0 + 14, y0 + 20, k.toUpperCase(), { a: "start", s: 14, c: "var(--text-dim)" });
      s += pk(k, g);
    });
    return svg(420, 272, s);
  }

  B.add("a3-bracket", [
    { type: "pick",
      q: "Two methods shrink a bracket of width 1 around a minimum. Thirds search evaluates two new points every step and keeps 2/3 of the bracket. Golden-section search evaluates two points at the start, then one new point per step, and keeps 0.618 of the bracket. The chart plots bracket width against the evaluations of f so far. Click the golden-section line.",
      fig: bracketRace(), a: "B",
      why: "Line B is golden-section. It stays flat for the first two evaluations (it needs two probes before it can cut anything), but then each single new evaluation cuts the width to 0.618 of what it was. After 12 evaluations B is about 0.008, while thirds search (A) is only down to 0.088. Reusing one probe per step is what makes golden-section cheap." },
    { type: "pick",
      q: "A student worked golden-section search by hand to minimise f(x) = (x − 3)² on [0, 8], listing the probes, their f values and the bracket each step keeps. One row keeps the wrong piece. Click it.",
      fig: bracketTrace(), a: "r3", hint: "In each row compare f(c) with f(d). Keep [a, d] when f(c) is smaller and [c, b] when f(d) is smaller.",
      why: "In row 3, f(c) = 0.00 is smaller than f(d) = 0.60, so the minimum cannot lie beyond d and the search must keep [a, d] = [1.89, 3.78]. The row keeps [3.06, 4.94] instead, which throws away the true minimum at x = 3. The next rows then search in the wrong place." },
    { type: "slider", min: 0.4, max: 1, step: 0.01, start: 0.5, ans: 0.76, tol: 0.025,
      q: "A golden-section search on [0, 1] probed c = 0.382 and d = 0.618 and found f(c) > f(d), so it keeps [0.382, 1]. The old probe d is reused as one new probe. Slide the marker to where the other new probe goes.",
      live: bracketLive, hint: "The new probes sit 38.2% and 61.8% of the way along the kept piece, which is 0.618 wide. 0.618 × 0.618 is about 0.38.",
      why: "The kept piece is [0.382, 1], width 0.618. Its 38.2% point is 0.382 + 0.382 × 0.618 = 0.618, which is exactly the old d, so no new evaluation is needed. Its 61.8% point is 0.382 + 0.618 × 0.618 ≈ 0.764. That is the only new probe. This reuse is the whole trick of the golden ratio." },
    { type: "cat",
      q: "f is unimodal on [a, b]. Golden-section search probes c and d and gets equal values, shown in the bars. Sort each piece of the bracket.",
      fig: bracketTie(), buckets: ["Can be discarded", "Must be kept"],
      items: [["Left piece [a, c]", 0], ["Middle piece [c, d]", 1], ["Right piece [d, b]", 0]],
      why: "Equal values at c and d mean c and d sit on opposite sides of the dip, so the minimum lies between them, in the middle piece. Both outer pieces are safe to throw away. A real implementation discards just one (either) and carries on, because the next step re-probes the smaller bracket." },
    { type: "pick",
      q: "Golden-section search on [0, 1] is only guaranteed to find the minimum if f goes down once and up once. Click every function it is guaranteed to work on.",
      fig: bracketCurves(), a: ["a", "b"],
      why: "A is a smooth bowl and B is a V with a sharp kink. Both are unimodal, and golden-section only compares function values, so it does not need a derivative and the kink is no problem. C has three dips and D has two, so a comparison of two probes can send the bracket into the wrong dip." },
  ]);

  /* =====================================================================
     a3-nm
     ===================================================================== */
  // contour map f = (x - 5)^2 + (y - 3)^2 with triangle ABC and three reflected candidates
  function nmContours() {
    const u = 34, X = (x) => 30 + u * x, Y = (y) => 262 - u * y;
    let s = "";
    [[1, "f = 1"], [2, "f = 4"], [3, "f = 9"], [4, "f = 16"]].forEach(([r, l]) => {
      s += `<circle cx="${X(5)}" cy="${Y(3)}" r="${r * u}" fill="none" stroke="var(--line-2)" stroke-width="2"/>`;
      const a = (-28 * Math.PI) / 180, tx = X(5) + r * u * Math.cos(a), ty = Y(3) - r * u * Math.sin(a);
      s += `<rect x="${tx - 24}" y="${ty - 10}" width="48" height="19" rx="7" fill="var(--panel)"/>` + txt(tx, ty + 4, l, { s: 11.5, w: 800, c: "var(--text-dim)" });
    });
    s += `<path d="M${X(5)},${Y(3) - 9} l2.6,6 6.4,.5 -4.8,4.2 1.5,6.3 -5.7,-3.3 -5.7,3.3 1.5,-6.3 -4.8,-4.2 6.4,-.5z" fill="var(--amber)"/>` + txt(X(5), Y(3) + 26, "minimum", { s: 11.5, c: "var(--amber-ink)" });
    const T = { A: [2, 5], B: [3, 2.5], C: [4.5, 4.5] };
    s += `<polygon points="${Object.values(T).map(([x, y]) => `${X(x)},${Y(y)}`).join(" ")}" fill="var(--violet-dim)" fill-opacity=".75" stroke="var(--violet)" stroke-width="3" stroke-linejoin="round"/>`;
    const cand = { P: [[3, 2.5], [3.5, 7]], Q: [[2, 5], [5.5, 2]], S: [[4.5, 4.5], [0.5, 3]] };
    Object.entries(cand).forEach(([k, [from, to]]) => {
      s += arrow(X(from[0]), Y(from[1]), X(to[0]) - (X(to[0]) - X(from[0])) * 0.06, Y(to[1]) - (Y(to[1]) - Y(from[1])) * 0.06, "var(--text-faint)", 2);
    });
    Object.entries(T).forEach(([k, [x, y]]) => (s += circ(X(x), Y(y), 11, "var(--panel)", "var(--violet)") + txt(X(x), Y(y) + 5, k, { s: 13, c: "var(--ink)" })));
    Object.entries(cand).forEach(([k, [, to]]) => (s += pk(k, circ(X(to[0]), Y(to[1]), 14, "var(--panel)", "var(--blue)") + txt(X(to[0]), Y(to[1]) + 5, k, { s: 13, c: "var(--ink)" }))));
    return svg(400, 300, s);
  }
  // four moves drawn as before (grey dashed) and after (green)
  function nmMoves() {
    const Bs = [4, 1], Md = [5, 3.5], W = [1.5, 3], M = [(Bs[0] + Md[0]) / 2, (Bs[1] + Md[1]) / 2];
    const refl = [2 * M[0] - W[0], 2 * M[1] - W[1]], expd = [3 * M[0] - 2 * W[0], 3 * M[1] - 2 * W[1]], cont = [M[0] + 0.5 * (W[0] - M[0]), M[1] + 0.5 * (W[1] - M[1])];
    const shr = [Bs, [Bs[0] + 0.5 * (Md[0] - Bs[0]), Bs[1] + 0.5 * (Md[1] - Bs[1])], [Bs[0] + 0.5 * (W[0] - Bs[0]), Bs[1] + 0.5 * (W[1] - Bs[1])]];
    const moves = { A: [Bs, Md, cont], B: [Bs, Md, refl], C: shr, D: [Bs, Md, expd] };
    let s = "";
    ["A", "B", "C", "D"].forEach((k, i) => {
      const x0 = 6 + (i % 2) * 208, y0 = 4 + Math.floor(i / 2) * 138, ox = x0 + 14, oy = y0 + 112, u = 15;
      const pts = (T) => T.map(([x, y]) => `${ox + x * u},${oy - y * u}`).join(" ");
      s += `<rect x="${x0}" y="${y0}" width="200" height="130" rx="12" fill="var(--panel)" stroke="var(--line-2)" stroke-width="3"/>`;
      s += `<polygon points="${pts([Bs, Md, W])}" fill="none" stroke="var(--text-faint)" stroke-width="2.5" stroke-dasharray="6 5" stroke-linejoin="round"/>`;
      s += `<polygon points="${pts(moves[k])}" fill="var(--teal-dim)" fill-opacity=".8" stroke="var(--teal)" stroke-width="3" stroke-linejoin="round"/>`;
      s += circ(ox + W[0] * u, oy - W[1] * u, 6, "var(--rose)", "var(--rose)", 1) + txt(x0 + 14, y0 + 22, k, { a: "start", s: 15, c: "var(--text-dim)" });
    });
    return svg(420, 280, s);
  }
  // best / middle / worst corner values over iterations (no shrink moves); one point is impossible
  function nmLines() {
    const best = [4, 4, 3, 3, 3.6, 3.6], mid = [7, 7, 4, 4, 4, 4], worst = [11, 9, 7, 6, 5, 4.6];
    const X = (k) => 56 + k * 62, Y = (v) => 214 - v * 16;
    let s = "";
    for (let v = 2; v <= 12; v += 2) s += ln(X(0), Y(v), X(5), Y(v), "var(--line)", 1.5) + txt(X(0) - 12, Y(v) + 4, v, { a: "end", s: 11, w: 700, c: "var(--text-faint)" });
    for (let k = 0; k <= 5; k++) s += txt(X(k), Y(2) + 18, k, { s: 11, w: 700, c: "var(--text-faint)" });
    const line = (arr, col) => `<polyline points="${arr.map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linejoin="round"/>`;
    s += line(worst, "var(--amber)") + line(mid, "var(--blue)") + line(best, "var(--teal)");
    best.forEach((v, k) => { s += k === 0 ? circ(X(k), Y(v), 7, "var(--teal)", "var(--teal)", 1) : pk(String(k), circ(X(k), Y(v), 12, "var(--panel)", "var(--teal)") + txt(X(k), Y(v) + 4, k, { s: 12, c: "var(--ink)" })); });
    [["best", "var(--teal)", 70], ["middle", "var(--blue)", 160], ["worst", "var(--amber)", 260]].forEach(([l, c, x]) => (s += ln(x - 26, 14, x - 8, 14, c, 4) + txt(x - 2, 18, l, { a: "start", s: 12, c: "var(--ink)" })));
    s += txt(X(2.5), Y(2) + 36, "iteration", { s: 12, w: 700, c: "var(--text-dim)" });
    return svg(420, 262, s);
  }

  B.add("a3-nm", [
    { type: "pick",
      q: "The rings are contour lines of f, and the number on a ring is f there (lower is better). Nelder–Mead holds the violet triangle ABC and replaces its worst corner by flipping it through the midpoint of the other two. Each grey arrow shows where flipping one corner would land. Click the landing point it actually tries first.",
      fig: nmContours(), a: "Q",
      why: "Corner A sits between the f = 9 and f = 16 rings, B between 4 and 9, and C between 1 and 4, so A is the worst. Flipping A through the midpoint of B and C lands at Q, which is close to the minimum. The other two arrows flip corners that are not the worst, so Nelder–Mead would not try them. Q is also better than every corner, which makes an expansion likely next." },
    { type: "match",
      q: "Each picture shows a Nelder–Mead triangle before (grey dashed) and after one move (green). The red dot marks the old worst corner. Match each picture to its move.",
      fig: nmMoves(), pairs: [["Picture A", "Contract: pull the worst corner back towards the middle"], ["Picture B", "Reflect: flip the worst corner through the midpoint"], ["Picture C", "Shrink: squash the whole triangle towards the best corner"], ["Picture D", "Expand: flip the worst corner and go even further"]],
      why: "In B the worst corner jumps to the far side of the other two (a reflection). In D it jumps even further out on the same line (an expansion). In A it moves a little way inwards, which is a contraction. In C two corners move at once, towards the best one: that is the shrink, and the only move that changes more than one corner." },
    { type: "bug",
      q: "shrink(pts) is called when nothing else works. pts is sorted with the best corner first. It should keep the best corner and move every other corner halfway towards it (mid(p, q) is the midpoint). The triangle it returns is lopsided. Click the faulty line.",
      code: ["def shrink(pts):", "    best = pts[-1]", "    out = [best]", "    for p in pts[1:]:", "        out.append(mid(best, p))", "    return out"], a: 1,
      why: "Shrinking pulls everything towards the best corner, which is pts[0] when the list is sorted best first. pts[-1] is the worst corner, so every other corner is dragged towards the worst point, away from the minimum." },
    { type: "multi",
      q: "Select every situation where Nelder–Mead is a sensible first thing to try.",
      o: ["Tuning 3 settings of a game simulator that only returns a score", "Minimising a smooth function of 4 inputs when no gradient is available", "Fitting a model with 2,000 parameters whose gradient is cheap to compute", "Finding the guaranteed global minimum of a function with many valleys", "Tuning 2 settings of a lab experiment whose readings are slightly noisy"], a: [0, 1, 4],
      why: "Nelder–Mead only compares function values, so it works when you can only evaluate a score, even a noisy one, and the number of inputs is small. It is a poor fit for thousands of parameters (the triangle becomes huge and slow, and a cheap gradient is much better) and it offers no guarantee of finding the global minimum, since it can settle in any valley." },
    { type: "pick",
      q: "A student logs the three corner values (best, middle, worst) after each iteration of a normal Nelder–Mead run on a minimisation problem, with no shrink moves. One dot on the green best line is impossible. Click it.",
      fig: nmLines(), a: "4", hint: "In a normal iteration only the worst corner is replaced. What can that do to the best value?",
      why: "At iteration 4 the best value rises from 3 to 3.6, so the best corner was thrown away. Reflect, expand and contract only replace the worst corner, and shrink keeps the best, so the best value can only stay or fall. In fact all three lines should only stay level or go down." },
  ]);

  /* ---------- PART 4 is appended below by the rest of the file ---------- */
})();

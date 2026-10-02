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
      fig: buildLoop(), hint: "The loop runs B–A–C–D–B. Add up nothing: just find its dearest cable and compare it with 5.",
      why: "The loop is B–A (7), A–C (4), C–D (8) and the new D–B (5). The dearest cable is C–D (8). Swapping it for the 5 keeps everything connected and saves 8 − 5 = 3, so the total drops from 36 to 33." },
    { type: "pick",
      q: "A learner lays these cables by hand in the order of the bars (height = cost). One cable was laid too early: a cheaper cable that makes no loop was still available. Click it.",
      fig: buildOrder(), a: "CD", hint: "Before the fifth cable, which towns are still unconnected, and which cheaper cables would join them?",
      why: "Before cable 5 the learner has D–F, D–E, A–C and B–D, so A and C form one group and G is alone. E–G (6) and A–B (7) would each join two groups and are cheaper than C–D (8), so C–D should wait. E–G (6) laid afterwards is not the slip: it is correct, just late. The result costs 28 instead of the minimum 27 (2 + 3 + 4 + 5 + 6 + 7)." },
  ]);

  /* ---------- PART 2 is appended below by the rest of the file ---------- */
})();

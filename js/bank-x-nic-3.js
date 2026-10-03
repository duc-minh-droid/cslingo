/* NIC revision bank, third round of varied, visual questions (x-nic-3).
   Lecture 4 (types, replacement, pressure, roulette, rank, tournament, mutation, crossover, lab): four new questions each.
   Every figure is needed to answer, and each uses a diagram kind not yet used for that module.
   Figures are drawn about 340 to 380 units wide so their text stays readable at phone width. */
(function () {
  const B = NIC.bank;
  const FS = 1.1;
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${((o.s || 13) * FS).toFixed(1)}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${body}</svg>`;
  const pk = (id, body) => `<g data-pick="${id}">${body}</g>`;
  const R = (x, y, w, h, fill, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r === undefined ? 6 : o.r}" fill="${fill}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const L = (x1, y1, x2, y2, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.cap ? ' stroke-linecap="round"' : ""}${o.mk ? ` marker-end="url(#${o.mk})"` : ""}/>`;
  const C = (x, y, r, fill, o = {}) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}"/>`;
  const f2 = (v) => v.toFixed(2);
  const DIM = "var(--text-dim)", FAINT = "var(--text-faint)";
  let uid = 0;
  const arrowDef = (id, c = "var(--line-2)") => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker></defs>`;
  const swatch = (x, y, fill, label, o = {}) => R(x, y - 11, 13, 13, fill, { fo: o.fo, r: 3, s: o.s }) + T(x + 18, y, label, { a: "start", s: 11, c: DIM });

  /* ---------- l4-types ---------- */
  // Swimlane of lifespans in a generational GA (population 3, one elite)
  const lifeFig = (() => {
    const lanes = [["I1", 0, 1], ["I2", 0, 2], ["I3", 0, 1], ["C4", 1, 2], ["C5", 1, 3], ["C6", 2, 3], ["C7", 2, 3]];
    const x0 = 44, cw = 100, y0 = 34, lh = 29, X = (t) => x0 + t * cw, bottom = y0 + lanes.length * lh;
    let s = [0, 1, 2].map((g) => T(X(g) + cw / 2, 16, "Generation " + (g + 1), { c: DIM, s: 11 })).join("");
    s += [0, 1, 2, 3].map((t) => L(X(t), 24, X(t), bottom, { dash: t && t < 3 ? "6 5" : null })).join("");
    s += lanes.map(([id, a, b], i) => {
      const y = y0 + i * lh;
      return pk(id, R(X(a) + 4, y + 3, (b - a) * cw - 8, lh - 8, id[0] === "I" ? "var(--blue)" : "var(--teal)", { fo: 0.85 }) + T(22, y + lh / 2 + 4, id, { s: 13 }));
    }).join("");
    s += swatch(44, bottom + 22, "var(--blue)", "starting population", { fo: 0.85 }) + swatch(200, bottom + 22, "var(--teal)", "a child", { fo: 0.85 });
    return svg(350, bottom + 34, s);
  })();
  // Composition strips (kept vs new)
  const compFig = (() => {
    const rows = [["P", 2], ["Q", 19], ["R", 0], ["S", 5]];
    let s = swatch(46, 14, "var(--bg-2)", "copied from old population") + swatch(220, 14, "var(--teal)", "new child", { fo: 0.85 });
    rows.forEach(([id, kept], k) => {
      const y = 28 + k * 36;
      s += T(2, y + 17, "Row " + id, { a: "start", s: 11 });
      for (let i = 0; i < 20; i++) s += R(46 + i * 15 + Math.floor(i / 5) * 6, y, 12, 24, i < kept ? "var(--bg-2)" : "var(--teal)", { fo: i < kept ? 1 : 0.85, r: 3 });
    });
    return svg(370, 172, s);
  })();
  // Two state machines, side by side
  const stateFig = (() => {
    const id = "ar" + ++uid;
    const bx = (x, y, a, b, fill) => R(x, y, 156, 44, fill || "var(--panel)", { r: 10 }) + T(x + 78, y + 19, a, { s: 12 }) + T(x + 78, y + 35, b, { s: 12, c: DIM });
    let s = arrowDef(id) + T(8, 16, "Scheme 1", { a: "start", s: 13, c: "var(--blue-ink)" }) + T(190, 16, "Scheme 2", { a: "start", s: 13, c: "var(--blue-ink)" });
    [["Child", "is born"], ["Waits in a", "holding area"], ["Whole batch", "swapped in"], ["Can now be", "a parent"]].forEach(([a, b], i) => {
      s += bx(4, 26 + i * 62, a, b, i === 1 ? "var(--bg-2)" : null);
      if (i < 3) s += L(82, 72 + i * 62, 82, 86 + i * 62, { w: 3, mk: id, dash: i === 1 ? "4 3" : null });
    });
    [["Child", "is born"], ["Replaces one", "population member"], ["Can now be", "a parent"]].forEach(([a, b], i) => {
      s += bx(190, 26 + i * 62, a, b);
      if (i < 2) s += L(268, 72 + i * 62, 268, 86 + i * 62, { w: 3, mk: id });
    });
    return svg(350, 262, s);
  })();
  const genTab = `<table class="t"><tr><th>Gen</th><th>Fitness of the 5 members</th><th class="num">Best</th></tr>
    <tr><td>1</td><td>0.61 &nbsp;0.55 &nbsp;<b>0.83</b> &nbsp;0.40 &nbsp;0.72</td><td class="num">0.83</td></tr>
    <tr class="bad"><td>2</td><td>0.66 &nbsp;0.70 &nbsp;0.52 &nbsp;0.79 &nbsp;0.58</td><td class="num">0.79</td></tr>
    <tr><td>3</td><td>0.81 &nbsp;0.75 &nbsp;0.60 &nbsp;0.77 &nbsp;0.69</td><td class="num">0.81</td></tr></table>`;
  B.add("l4-types", [
    { type: "pick", q: "Each bar is one individual of a generational GA (population 3), from the generation it was born to the one it left. Tap every individual that was carried over untouched by elitism.", fig: lifeFig, a: ["I2", "C5"],
      why: "In a generational GA every individual lasts exactly one generation, apart from the elites, which are copied across the boundary. Only I2 and C5 have bars that cross a dashed line, one elite per boundary, so the elitism setting was 1. C4 and C6 were born at a boundary but left at the next one, so they were ordinary children." },
    { type: "match", q: "Each row is the population right after one round of a scheme (20 members). Match each row to its scheme.", fig: compFig,
      pairs: [["Row P", "Generational, 2 elites"], ["Row Q", "Steady-state, after one step"], ["Row R", "Generational, no elitism"], ["Row S", "Generational, 5 elites"]],
      hint: "Count the pale squares: that is how many members were copied across unchanged.",
      why: "A generational round rebuilds the population: no elitism leaves 0 old members (row R), 2 elites leaves 2 (row P), 5 elites leaves 5 (row S). A steady-state step changes just one member, so 19 of the 20 stay (row Q)." },
    { type: "mcq", q: "Two GAs are drawn as state machines. Which one is steady-state, and what does that mean for a brand-new child?", fig: stateFig,
      o: ["Scheme 1: the child can be picked as a parent straight away", "Scheme 2: the child can be picked as a parent straight away", "Scheme 1: the child must wait in a holding area until the generation ends", "Scheme 2: the child must wait in a holding area until the generation ends"], a: 1,
      why: "In scheme 2 the child goes straight into the population, replacing one member, so it can breed on the very next step: that is steady-state. In scheme 1 children collect in a holding area and the whole batch is swapped in together, which is the generational scheme." },
    { type: "multi", q: "A generational GA (maximising) lost its best individual between generations 1 and 2, shown in red. Which changes would have <b>guaranteed</b> the best fitness could not fall?", fig: genTab,
      o: ["Copy the single best individual into every new population", "Switch to steady-state and always replace the weakest member", "Double the mutation rate so children are more varied", "Use bigger tournaments so the best is chosen more often"], a: [0, 1],
      why: "Elitism of 1 and steady-state replace-weakest both protect the top individual by construction: it can never be overwritten. A higher mutation rate or bigger tournaments change the odds, but the best can still be missed by chance, so neither is a guarantee." },
  ]);

  /* ---------- l4-replacement ---------- */
  const ringFig = (() => {
    const v = [0.7, 0.3, 0.9, 0.6, 0.2, 0.8, 0.65, 0.55], cx = 150, cy = 130, r = 100;
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)" stroke-width="3" stroke-dasharray="6 6"/>`;
    s += v.map((x, i) => {
      const a = (-90 + 45 * i) * Math.PI / 180, px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
      return pk("s" + (i + 1), C(px, py, 26, "var(--panel)") + T(px, py - 2, "S" + (i + 1), { s: 11, c: DIM }) + T(px, py + 14, f2(x), { s: 12 }));
    }).join("");
    s += T(cx, cy - 4, "Child: 0.50", { s: 14 }) + T(cx, cy + 16, "scan clockwise", { s: 11, c: DIM });
    return svg(300, 262, s);
  })();
  const diffFig = (() => {
    const before = [0.7, 0.3, 0.9, 0.6, 0.2, 0.8];
    const rows = [["Before", before, -1, "var(--bg-2)"], ["Row A", before.map((v, i) => (i === 1 ? 0.5 : v)), 1], ["Row B", before.map((v, i) => (i === 4 ? 0.5 : v)), 4], ["Row C", before.map((v, i) => (i === 2 ? 0.5 : v)), 2], ["Row D", before, -1, null, "(unchanged)"], ["Row E", before.map((v, i) => (i === 0 ? 0.5 : v)), 0]];
    let s = T(4, 14, "Child fitness 0.50. Orange outline = slot that changed.", { a: "start", s: 11, c: DIM });
    rows.forEach(([name, vals, ch, fill, note], k) => {
      const y = 24 + k * 40;
      s += T(4, y + (note ? 15 : 21), name, { a: "start", s: 12 }) + (note ? T(4, y + 29, note, { a: "start", s: 10, c: DIM }) : "");
      vals.forEach((v, i) => { s += R(66 + i * 46, y, 43, 34, i === ch ? "var(--amber-dim)" : fill || "var(--panel)", { r: 6, s: i === ch ? "var(--amber)" : "var(--line-2)", sw: i === ch ? 4 : 2 }) + T(66 + i * 46 + 21.5, y + 22, f2(v), { s: 12, c: i === ch ? "var(--amber-ink)" : "var(--text)" }); });
    });
    return svg(350, 268, s);
  })();
  // Heat maps: same 12 children, replace-weakest vs replace-random
  const initPop = [0.55, 0.7, 0.4, 0.95, 0.3, 0.6, 0.8, 0.5], kids = [0.62, 0.35, 0.88, 0.45, 0.7, 0.9, 0.52, 0.66, 0.85, 0.4, 0.75, 0.58], victims = [5, 1, 7, 3, 0, 2, 6, 4, 1, 5, 2, 7];
  const evolve = (rule) => {
    const p = initPop.slice(), h = [p.slice()];
    kids.forEach((c, k) => {
      if (rule === "weakest") { let w = 0; p.forEach((v, i) => { if (v < p[w]) w = i; }); if (c > p[w]) p[w] = c; } else p[victims[k]] = c;
      h.push(p.slice());
    });
    return h;
  };
  const heat = (hist, x0, name, id) => {
    let s = T(x0 + 71, 14, name, { s: 13 });
    hist.forEach((col, t) => col.forEach((v, i) => { s += R(x0 + t * 11, 22 + i * 14, 11, 14, "var(--teal)", { fo: (0.08 + 0.92 * (v - 0.25) / 0.7).toFixed(2), r: 0, s: "var(--panel)", sw: 1 }); }));
    return pk(id, s);
  };
  const heatFig = svg(340, 170, heat(evolve("random"), 8, "Run A", "A") + heat(evolve("weakest"), 190, "Run B", "B")
    + swatch(8, 152, "var(--teal)", "weak", { fo: 0.1 }) + swatch(64, 152, "var(--teal)", "strong") + T(190, 152, "rows: 8 slots. columns: time →", { a: "start", s: 11, c: DIM }));
  const queueFig = (() => {
    const id = "ar" + ++uid;
    let s = arrowDef(id) + T(4, 14, "Population", { a: "start", s: 12, c: DIM });
    [0.7, 0.3, 0.9, 0.6, 0.2, 0.8].forEach((v, i) => { s += R(4 + i * 56, 22, 52, 34, "var(--panel)", { r: 8 }) + T(30 + i * 56, 45, f2(v), { s: 13 }); });
    s += T(4, 84, "Children waiting (first in line on the left)", { a: "start", s: 12, c: DIM });
    [0.5, 0.45, 0.25, 0.65].forEach((v, i) => {
      s += R(4 + i * 84, 92, 60, 34, "var(--teal)", { fo: 0.8, r: 8 }) + T(34 + i * 84, 115, f2(v), { s: 13, c: "#fff" });
      if (i < 3) s += L(66 + i * 84, 109, 84 + i * 84, 109, { w: 3, mk: id });
    });
    return svg(340, 140, s);
  })();
  B.add("l4-replacement", [
    { type: "pick", q: "Replace-first-weaker starts at a random slot, then scans clockwise and overwrites the first member weaker than the child. Tap every slot where the scan could START and end up overwriting S2.", fig: ringFig, a: ["s1", "s2", "s6", "s7", "s8"],
      hint: "First find which members are weaker than 0.50. Then walk backwards from S2 until you hit another weaker member.",
      why: "Only S2 (0.30) and S5 (0.20) are weaker than the child. A scan overwrites S2 if it reaches S2 before S5: starting at S6, S7, S8, S1 or S2 itself. Starting at S3, S4 or S5 meets S5 first, so S2 survives. The start slot decides which weaker member goes, which is why first-weaker is not the same as weakest." },
    { type: "cat", q: "A child with fitness 0.50 meets the population in the top row of the figure. Rows A to E show what the population looked like afterwards. Sort each outcome.", fig: diffFig,
      buckets: ["Only replace-first-weaker can do this", "Either rule can do this", "Neither rule can do this"],
      items: [["Row A", 0], ["Row B", 1], ["Row C", 2], ["Row D", 2], ["Row E", 2]],
      why: "Row B overwrote 0.20, the weakest, which replace-weakest always does and replace-first-weaker does if the scan reaches it first. Row A overwrote 0.30: a weaker member, but not the weakest, so only first-weaker can produce it. Rows C and E overwrote members stronger than the child, and row D threw the child away even though weaker members existed, which neither rule allows." },
    { type: "pick", q: "The same 12 children were fed to two copies of the same population (8 slots, one per row). One run used replace-weakest, the other replace-random. Tap the run that used replace-weakest.", fig: heatFig, a: "B",
      why: "In run B the darkest cell never disappears and the palest cells are the ones that get overwritten, so the population only gets stronger (children worse than everyone are simply dropped, hence the repeated columns). In run A the darkest cell (the best, 0.95) is wiped out by a weak 0.45 child in column 5, which only a random victim can do." },
    { type: "order", q: "Replace-weakest. The four children arrive one at a time, in the order shown. Put the members that get evicted in the order they leave.", fig: queueFig,
      items: ["The 0.20 member from the start", "The 0.30 member from the start", "The 0.45 child that arrived second"],
      hint: "Each child only gets in if it beats the weakest member at that moment. Track the weakest after each arrival.",
      why: "Child 0.50 beats the weakest (0.20), so 0.20 leaves. Child 0.45 beats the new weakest (0.30), so 0.30 leaves. Child 0.25 is worse than the weakest (now 0.45), so it is thrown away. Child 0.65 then beats the weakest, which is the 0.45 child that arrived second. Newcomers can be evicted too." },
  ]);

  /* ---------- l4-pressure ---------- */
  const heatMini = (rows, x0, title, id) => {
    let s = T(x0 + 55, 14, title, { s: 13 });
    rows.split(" ").forEach((row, g) => [...row].forEach((d, i) => { s += R(x0 + i * 11, 22 + g * 12, 11, 12, +d === 9 ? "var(--amber)" : "var(--teal)", { fo: +d === 9 ? 1 : (0.08 + 0.85 * d / 9).toFixed(2), r: 0, s: "var(--panel)", sw: 1 }); }));
    return pk(id, s);
  };
  const takeFig = svg(370, 170,
    heatMini("5378204196 7459775737 7979775597 7999799777 7797999999 9999999799 9999999999 9999999999 9999999999", 6, "Map A", "A") +
    heatMini("3546870129 0161271881 1121868712 1867118161 8618161788 1878818168 7188117116 7176781186 1166667177", 130, "Map B", "B") +
    heatMini("7832159406 9999999999 9999999999 9999999999 9999999999 9999999999 9999999999 9999999999 9999999999", 254, "Map C", "C") +
    swatch(6, 150, "var(--teal)", "weak", { fo: 0.1 }) + swatch(62, 150, "var(--teal)", "strong") + swatch(128, 150, "var(--amber)", "the original best")
    + T(185, 166, "10 individuals per row, one row per generation", { s: 10, c: FAINT }));
  // scatter: roulette vs linear rank
  const scatFig = (() => {
    const fit = [8, 9, 10, 11, 12, 40], tot = fit.reduce((a, b) => a + b), x0 = 40, Y = (p) => 224 - p * 400, X = (i) => x0 + 28 + i * 50;
    let s = [0, 10, 20, 30, 40].map((t) => L(x0, Y(t / 100), 340, Y(t / 100), { c: "var(--line)", w: 1 }) + T(x0 - 5, Y(t / 100) + 4, t + "%", { a: "end", s: 10, c: FAINT })).join("");
    s += L(x0, Y(1 / 6), 340, Y(1 / 6), { c: "var(--amber)", w: 3, dash: "7 5" }) + T(340, Y(1 / 6) - 6, "equal chance (1 in 6)", { a: "end", s: 11, c: "var(--amber-ink)" });
    fit.forEach((f, i) => {
      s += T(X(i), 246, "#" + (i + 1), { s: 12 }) + T(X(i), 262, "fit. " + f, { s: 10, c: FAINT });
      s += C(X(i) - 7, Y(f / tot), 7, "var(--blue)", { s: "var(--panel)", sw: 2 }) + R(X(i) + 1, Y((i + 1) / 21) - 7, 13, 13, "var(--violet)", { r: 3, s: "var(--panel)", sw: 2 });
    });
    s += C(60, 12, 6, "var(--blue)", { s: "var(--panel)", sw: 2 }) + T(72, 16, "roulette", { a: "start", s: 11 }) + R(150, 6, 12, 12, "var(--violet)", { r: 3, s: "var(--panel)", sw: 2 }) + T(168, 16, "linear rank", { a: "start", s: 11 });
    return svg(350, 272, s);
  })();
  // stacked 100% bars: where tournament winners come from
  const stackFig = (() => {
    const rows = [["P", 5], ["Q", 1], ["R", 10], ["S", 2]], cols = ["var(--teal)", "var(--blue)", "var(--rose)"];
    let s = swatch(30, 14, cols[0], "top third", { fo: 0.85 }) + swatch(122, 14, cols[1], "middle third", { fo: 0.85 }) + swatch(236, 14, cols[2], "bottom third", { fo: 0.85 });
    rows.forEach(([id, t], k) => {
      const top = 1 - Math.pow(2 / 3, t), bot = Math.pow(1 / 3, t), mid = 1 - top - bot, y = 30 + k * 40, vals = [top, mid, bot];
      s += T(12, y + 22, id, { s: 14 });
      let x = 28;
      vals.forEach((v, i) => { const w = 316 * v; if (w > 0.5) s += R(x, y, w, 32, cols[i], { fo: 0.85, r: 0, s: "var(--panel)", sw: 1 }) + (w > 26 ? T(x + w / 2, y + 21, Math.round(v * 100) + "%", { s: 12, c: "#fff" }) : ""); x += w; });
    });
    return svg(350, 196, s + T(175, 192, "share of tournament winners by where they come from", { s: 10, c: FAINT }));
  })();
  // region map
  const regionFig = (() => {
    const PL = 54, PR = 344, PT = 12, PB = 250, id = "cl" + ++uid, U = (x) => 112 - (x - PL) * (90 / 290);
    const xs = (t) => PL + ((t - 1) / 9) * 290, ys = [36, 100, 164, 228];
    const poly = (a, col) => `<polygon points="${a.join(" ")}" fill="${col}"/>`;
    let s = `<defs><clipPath id="${id}"><rect x="${PL}" y="${PT}" width="${PR - PL}" height="${PB - PT}"/></clipPath></defs><g clip-path="url(#${id})">` +
      poly([[PL, PT - 20], [PR, PT - 20], [PR, U(PR)], [PL, U(PL)]], "var(--amber-dim)") + poly([[PL, U(PL)], [PR, U(PR)], [PR, U(PR) + 120], [PL, U(PL) + 120]], "var(--teal-dim)") + poly([[PL, U(PL) + 120], [PR, U(PR) + 120], [PR, PB + 20], [PL, PB + 20]], "var(--rose-dim)") + "</g>";
    s += R(PL, PT, PR - PL, PB - PT, "none", { r: 0 });
    ["0.2", "0.02", "0.002", "0.0002"].forEach((l, i) => { s += T(PL - 5, ys[i] + 4, l, { a: "end", s: 10, c: DIM }); });
    [2, 4, 6, 8, 10].forEach((t) => { s += T(xs(t), PB + 15, t, { s: 11, c: DIM }); });
    s += T(200, PB + 31, "Tournament size t (more pressure →)", { s: 11, c: DIM }) + T(2, 8, "Mutation rate per bit", { a: "start", s: 10, c: DIM });
    s += T(262, 40, "wanders", { s: 11, c: "var(--amber-ink)" }) + T(250, 124, "healthy", { s: 11, c: "var(--teal-ink)" }) + T(298, 196, "premature", { s: 11, c: "var(--rose-ink)" }) + T(298, 210, "convergence", { s: 11, c: "var(--rose-ink)" });
    [["A", 2, 0], ["B", 4, 1], ["C", 6, 2], ["D", 9, 3]].forEach(([n, t, k]) => { s += C(xs(t), ys[k], 13, "var(--panel)", { s: "var(--ink)" }) + T(xs(t), ys[k] + 5, n, { s: 14 }); });
    return svg(350, 282, s);
  })();
  B.add("l4-pressure", [
    { type: "pick", q: "Three takeover runs (selection only, no mutation or crossover) used random parents, tournaments of size 2, and always-pick-the-best. Tap the map made by <b>random</b> selection.", fig: takeFig, a: "B",
      why: "Map C is one single colour from the second row: always picking the best takes over at once. Map A darkens steadily and ends up all one colour: tournaments of 2 push towards fitter individuals. Map B is random: nothing pulls it towards darker cells, the average colour just wanders, and the orange best individual was lost by row 2. Diversity still shrinks by chance (drift), but not towards fitness." },
    { type: "cat", q: "Parents are drawn by roulette or by linear rank from six individuals (fitness 8 to 40). Each mark shows a chance of being picked. Compare each individual with the dashed line (equal chance for all).", fig: scatFig,
      buckets: ["Above the line under both methods", "Below the line under both methods", "Above the line under rank only"],
      items: [["#1 (fitness 8)", 1], ["#3 (fitness 10)", 1], ["#4 (fitness 11)", 2], ["#5 (fitness 12)", 2], ["#6 (fitness 40)", 0]],
      why: "Roulette gives shares of 8, 9, 10, 11, 12 and 40 out of 90: the superfit #6 gets 44% and everyone else is squeezed below 1 in 6. Rank selection gives 1 to 6 out of 21, a steady staircase, so from #4 up (19%, 24%, 29%) the chances clear 1 in 6. The two methods disagree on #4 and #5 because roulette cares how far ahead #6 is." },
    { type: "match", q: "Each bar shows where the <b>winners</b> of many tournaments come from (large population, entrants drawn with replacement). Match each bar to its tournament size.", fig: stackFig,
      pairs: [["Bar P", "Tournament size 5"], ["Bar Q", "Tournament size 1"], ["Bar R", "Tournament size 10"], ["Bar S", "Tournament size 2"]],
      hint: "The bottom third wins only if every entrant comes from it: 1/3 for size 1, 1/3 × 1/3 for size 2.",
      why: "Size 1 is just a random pick: a third from each part. Size 2 lets the bottom third win only when both entrants are from it (1/9 = 11%), so the top third rises to 56%. Size 5 gives the top third 87%, and size 10 about 98% with the middle third almost gone. Each extra entrant shifts the winners upwards." },
    { type: "order", q: "The map shows four setups, A to D. Put them in order from MOST to LEAST likely to suffer premature convergence.", fig: regionFig,
      items: ["Setup D", "Setup C", "Setup B", "Setup A"],
      why: "Premature convergence comes from strong pressure plus too little variation: setup D (big tournaments, almost no mutation) is deepest in that corner. Moving left and up lowers the pressure and adds variation: C is near the edge, B is in the healthy band, and A, with weak tournaments and heavy mutation, has the opposite problem: it wanders." },
  ]);

  /* ---------- l4-roulette ---------- */
  const tapeFig = (() => {
    const spins = ["C", "B", "C", "A", "A", "A", "A", "A"], col = { A: "var(--teal)", B: "var(--blue)", C: "var(--amber)" };
    let s = ["A: fitness 1", "B: fitness 1", "C: fitness 2"].map((t, i) => R(4 + i * 112, 4, 14, 14, col["ABC"[i]], { fo: 0.85, r: 4 }) + T(24 + i * 112, 16, t, { a: "start", s: 12 })).join("");
    spins.concat(["?"]).forEach((v, i) => {
      const q = v === "?";
      s += R(4 + i * 37, 34, 34, 40, q ? "var(--panel)" : col[v], { fo: q ? 1 : 0.85, r: 8, dash: q ? "5 4" : null }) + T(21 + i * 37, 60, v, { s: 17, c: q ? DIM : "#fff" }) + T(21 + i * 37, 90, i + 1, { s: 11, c: FAINT });
    });
    return svg(340, 102, s);
  })();
  const scat2 = (() => {
    const pts = [[1, 98], [2, 205], [3, 301], [4, 392], [5, 395], [6, 603]], X = (f) => 46 + f * 44, Y = (v) => 212 - v * 0.31;
    let s = [0, 200, 400, 600].map((v) => L(40, Y(v), 330, Y(v), { c: "var(--line)", w: 1 }) + T(35, Y(v) + 4, v, { a: "end", s: 10, c: FAINT })).join("");
    s += T(190, 252, "fitness of the individual", { s: 11, c: DIM }) + T(4, 10, "times picked in a long run", { a: "start", s: 11, c: DIM });
    pts.forEach(([f, v]) => { s += T(X(f), 234, f, { s: 11, c: DIM }) + pk("f" + f, C(X(f), Y(v), 14, "var(--panel)", { s: "var(--blue)" }) + T(X(f), Y(v) + 4, f, { s: 12 })); });
    return svg(340, 262, s);
  })();
  const shiftTab = `<table class="t"><tr><th>Tour</th><th class="num">Profit</th><th class="num">+ 4</th><th class="num">Wheel share</th></tr>
    <tr><td>A</td><td class="num">−4</td><td class="num">0</td><td class="num"><b style="color:var(--rose-ink)">0%</b></td></tr>
    <tr><td>B</td><td class="num">2</td><td class="num">6</td><td class="num">30%</td></tr>
    <tr><td>C</td><td class="num">6</td><td class="num">10</td><td class="num">50%</td></tr>
    <tr><td>D</td><td class="num">0</td><td class="num">4</td><td class="num">20%</td></tr></table>`;
  const miniBars = (() => {
    const mk = (x0, name, vals) => {
      let s = T(x0 + 52, 14, name, { s: 13 });
      vals.forEach((v, i) => { const h = v * 1.3; s += R(x0 + 6 + i * 32, 148 - h, 26, Math.max(h, 1), "var(--blue)", { fo: 0.85, r: 4 }) + T(x0 + 19 + i * 32, 142 - h, v + "%", { s: 11 }) + T(x0 + 19 + i * 32, 164, "ABC"[i], { s: 12, c: DIM }); });
      return s + L(x0, 148, x0 + 104, 148);
    };
    return svg(340, 186, mk(4, "Chart X", [60, 40, 0]) + mk(118, "Chart Y", [14, 29, 57]) + mk(232, "Chart Z", [57, 29, 14]) + T(170, 182, "bars are tours A, B, C: their chance of being picked", { s: 10, c: FAINT }));
  })();
  B.add("l4-roulette", [
    { type: "slider", q: "A roulette wheel has three individuals (A fitness 1, B fitness 1, C fitness 2). The wheel is built correctly. What is the chance that spin 9 picks A?", fig: tapeFig, min: 0, max: 100, step: 5, ans: 25, tol: 5, unit: "%",
      hint: "The wheel is the same for every spin. A owns 1 slice out of 1 + 1 + 2 = 4.",
      why: "Every spin starts afresh: A always owns 1 out of 4 slices, so 25%, whatever happened before. Five A's in a row is rare (1 in 1,024) but it does not make A 'due' or 'hot'. If streaks like this kept showing up, you would suspect a bug in the wheel, not luck." },
    { type: "pick", q: "In a long run of roulette spins, each individual's pick count is plotted against its fitness. Roulette predicts a straight line through the origin. Tap the one individual that does not fit.", fig: scat2, a: "f5",
      why: "Picks should be proportional to fitness, about 100 per unit here: roughly 98, 205, 301, 392 and 603 for fitness 1, 2, 3, 4 and 6. Individual 5 got only 395, the count of a fitness-4 individual, where about 500 was expected. That points to a bug in how the wheel was built." },
    { type: "mcq", q: "A student makes negative profits usable in roulette by adding 4 (the biggest loss) to every score. What goes wrong?", fig: shiftTab,
      o: ["The worst tour now has a slice of zero, so it can never be picked", "The shares no longer add up to 100%, so some spins land on nothing", "Adding a constant reverses the order, so the best becomes the worst", "A score of zero is not allowed, so tour D is thrown out of the wheel"], a: 0,
      why: "Shifting by exactly the biggest loss turns the worst score into 0, so tour A has no slice and can never be selected, which throws away its (possibly useful) genes. The shares still add to 100% (0 + 30 + 50 + 20), the order is unchanged, and D with a shifted score of 4 keeps a 20% slice. Shift by a little more than the biggest loss, or switch to rank or tournament selection." },
    { type: "match", q: "Three tours cost 10, 20 and 40 (shorter is better). Each chart shows the chance of being picked under a different score-to-fitness rule. Match each chart to its rule.", fig: miniBars,
      pairs: [["Chart X", "Fitness = 40 − cost"], ["Chart Y", "Fitness = cost (wrong way round)"], ["Chart Z", "Fitness = 1 ÷ cost"]],
      hint: "Try each rule on the costs 10, 20, 40, then turn the three numbers into shares of their total.",
      why: "With 1 ÷ cost the scores are 0.1, 0.05 and 0.025, so the shares are 57%, 29% and 14% (chart Z). With 40 − cost they are 30, 20 and 0, so shares 60%, 40% and 0%: the costliest tour gets no slice (chart X). Using cost itself reverses the preference, 14%, 29%, 57% (chart Y)." },
  ]);

  /* ---------- l4-rank ---------- */
  const rankLines = (() => {
    const X = (r) => 50 + (r - 1) * 40, Y = (p) => 214 - p * 560;
    let s = [0, 0.1, 0.2, 0.3].map((p) => L(40, Y(p), 335, Y(p), { c: "var(--line)", w: 1 }) + T(35, Y(p) + 4, Math.round(p * 100) + "%", { a: "end", s: 10, c: FAINT })).join("");
    const path = (f, c) => `<path d="${[1, 2, 3, 4, 5, 6, 7, 8].map((r, i) => `${i ? "L" : "M"}${X(r)} ${Y(f(r))}`).join(" ")}" fill="none" stroke="${c}" stroke-width="3"/>` + [1, 2, 3, 4, 5, 6, 7, 8].map((r) => C(X(r), Y(f(r)), 4.5, c, { s: "var(--panel)", sw: 2 })).join("");
    s += path((r) => r / 36, "var(--blue)") + path((r) => r * r / 204, "var(--violet)");
    for (let r = 1; r <= 8; r++) s += T(X(r), 232, r, { s: 11, c: DIM });
    s += T(190, 250, "rank (1 = worst, 8 = best)", { s: 11, c: DIM });
    s += L(50, 12, 68, 12, { c: "var(--blue)", w: 4 }) + T(74, 16, "weight = rank", { a: "start", s: 11 }) + L(188, 12, 206, 12, { c: "var(--violet)", w: 4 }) + T(212, 16, "weight = rank²", { a: "start", s: 11 });
    return svg(350, 258, s);
  })();
  const pipeFig = (() => {
    const id = "ar" + ++uid, st = [["1  Raw fitness", "A 0.9012    B 0.9031    C 0.9025"], ["2  Sort worst to best", "A 0.9012    C 0.9025    B 0.9031"], ["3  Swap each value for its rank", "A 1    C 2    B 3"], ["4  Weight = rank, scale to 100%", "A 17%    C 33%    B 50%"], ["5  Spin the wheel", "slices of 17%, 33% and 50%"]];
    let s = arrowDef(id);
    st.forEach(([a, b], i) => {
      const y = 4 + i * 58;
      s += pk("s" + (i + 1), R(4, y, 342, 46, "var(--panel)", { r: 10 }) + T(16, y + 19, a, { a: "start", s: 12.5 }) + T(16, y + 37, b, { a: "start", s: 11.5, c: DIM }));
      if (i < 4) s += L(175, y + 48, 175, y + 56, { w: 3, mk: id });
    });
    return svg(350, 296, s);
  })();
  const stairs = (() => {
    let s = "";
    for (let i = 1; i <= 8; i++) s += R(6 + (i - 1) * 42, 168 - i * 18, 38, i * 18, "var(--violet)", { fo: 0.3 + i * 0.08, r: 4 }) + T(25 + (i - 1) * 42, 162 - i * 18, i, { s: 13 });
    s += T(25, 186, "worst", { s: 11, c: DIM }) + T(319, 186, "best", { s: 11, c: DIM });
    return svg(344, 194, s);
  })();
  const matFig = (() => {
    const fit = [4, 5, 9, 10, 12, 40], cols = [["X", [0.2, 1.8, 6.1, 14.5, 28.3, 49.0]], ["Y", fit.map((f) => 100 * f / 80)], ["Z", [1, 2, 3, 4, 5, 6].map((r) => 100 * r / 21)]];
    const lab = (v) => (v < 1 ? "<1" : Math.round(v));
    let s = T(36, 16, "Fitness", { s: 11, c: DIM });
    cols.forEach(([n], j) => { s += T(130 + j * 88, 16, "Column " + n, { s: 12 }); });
    fit.forEach((f, i) => {
      const y = 24 + i * 34;
      s += T(36, y + 21, f, { s: 14 });
      cols.forEach(([, vals], j) => { s += R(90 + j * 88, y, 82, 30, "var(--teal)", { fo: (0.1 + 0.8 * vals[i] / 50).toFixed(2), r: 4, s: "var(--panel)", sw: 2 }) + T(131 + j * 88, y + 20, lab(vals[i]) + "%", { s: 13 }); });
    });
    return svg(350, 232, s);
  })();
  B.add("l4-rank", [
    { type: "cat", q: "Eight individuals ranked 1 (worst) to 8 (best). Blue gives each one a chance proportional to its rank, purple proportional to its rank squared. Does squaring give each rank MORE or LESS chance?", fig: rankLines,
      buckets: ["Squaring gives more chance", "Squaring gives less chance"], items: [["Rank 2", 1], ["Rank 4", 1], ["Rank 5", 1], ["Rank 6", 0], ["Rank 8", 0]],
      hint: "Both curves are shares of 100%. If the top ranks gain, the lower ranks must lose.",
      why: "Rank weights total 36 and squared weights total 204. For rank 5 that is 5/36 = 14% against 25/204 = 12%, so squaring loses; for rank 6 it is 17% against 18%, so it wins. The curves cross between ranks 5 and 6: squaring takes chance from the lower five ranks and hands it to the top three, which is higher selection pressure." },
    { type: "pick", q: "Rank selection never looks at how <i>far apart</i> the fitness values are. Tap the stage after which the tiny gaps between these three nearly identical fitness values can no longer affect the selection.", fig: pipeFig, a: "s3",
      why: "Sorting (stage 2) still carries the real values, so they could in principle be used. Stage 3 replaces each value by its rank, 1, 2, 3: from then on only the order survives, and the size of the gaps (0.0019 or 0.19, it makes no difference) is gone. That is why rank selection keeps its pressure when a population has converged and why roulette loses it." },
    { type: "slider", q: "Linear rank selection (weight = rank). With 8 individuals, the best is 8 times as likely to be picked as the worst. With a population of 40, how many times as likely is the best?", fig: stairs, min: 0, max: 80, step: 5, ans: 40, tol: 5, unit: "×",
      hint: "The worst has weight 1 and the best has weight N.",
      why: "Weights run 1, 2, 3 … N, so the best is N times as likely as the worst: 40 times for N = 40. The ratio grows with the population, and does not depend on the fitness values at all." },
    { type: "match", q: "Same six individuals (fitness shown), three selection schemes: roulette, linear rank, and rank cubed. Each column lists the chance of being picked. Match each column to its scheme.", fig: matFig,
      pairs: [["Column X", "Rank cubed"], ["Column Y", "Roulette"], ["Column Z", "Linear rank"]],
      hint: "Roulette shares follow the fitness values: 40 is ten times 4. Linear rank rises in even steps.",
      why: "Column Y is roulette: its shares are the fitness values over their total (4, 5, 9, 10, 12 and 40 out of 80, so 50% for the best). Column Z is linear rank, an even staircase of 1 to 6 out of 21. Column X is the steepest: rank cubed gives the best 49% and the worst almost nothing." },
  ]);

  /* ---------- l4-tournament ---------- */
  const gridFig = (() => {
    let s = T(4, 14, "A 0.9 (fittest)    B 0.6    C 0.3 (weakest)", { a: "start", s: 12, c: DIM }) + T(210, 40, "second entrant", { s: 11, c: DIM }) + T(26, 114, "first", { s: 11, c: DIM }) + T(26, 128, "entrant", { s: 11, c: DIM });
    "ABC".split("").forEach((c, i) => { s += T(130 + i * 78, 62, c, { s: 15 }) + T(70, 104 + i * 64 + 4, c, { s: 15 }); });
    "ABC".split("").forEach((r, i) => "ABC".split("").forEach((c, j) => { s += pk(r + c, R(92 + j * 78, 70 + i * 64, 74, 56, "var(--panel)", { r: 10 }) + T(129 + j * 78, 70 + i * 64 + 33, r + ", " + c, { s: 12, c: DIM })); }));
    return svg(340, 268, s);
  })();
  const seqFig = (() => {
    const X = { m1: 56, co: 178, m2: 300 }, id = "ar" + ++uid;
    let s = arrowDef(id);
    [["Machine 1", "m1"], ["Coordinator", "co"], ["Machine 2", "m2"]].forEach(([n, k]) => { s += R(X[k] - 50, 4, 100, 26, "var(--bg-2)", { r: 8 }) + T(X[k], 22, n, { s: 11.5 }) + L(X[k], 32, X[k], 262, { dash: "5 5" }); });
    const arrow = (x1, x2, y) => L(x1, y, x2, y, { w: 3, c: "var(--blue)", mk: id });
    const hit = (x, y, w, h) => R(x, y, w, h, "transparent", { r: 8, s: "transparent" });
    s += pk("m1", hit(46, 42, 142, 34) + arrow(56, 170, 66) + T(113, 58, "subtotal", { s: 11 }));
    s += pk("m2", hit(168, 82, 142, 34) + arrow(300, 186, 106) + T(243, 98, "subtotal", { s: 11 }));
    s += pk("m3", hit(46, 124, 264, 34) + arrow(170, 60, 150) + arrow(186, 296, 150) + T(113, 142, "grand total", { s: 11 }) + T(243, 142, "grand total", { s: 11 }));
    s += pk("m4", R(10, 172, 92, 28, "var(--amber-dim)", { r: 8, s: "var(--amber)" }) + T(56, 191, "pick parent", { s: 11 }) + R(254, 172, 92, 28, "var(--amber-dim)", { r: 8, s: "var(--amber)" }) + T(300, 191, "pick parent", { s: 11 }));
    s += pk("m5", hit(46, 212, 264, 40) + arrow(56, 170, 238) + arrow(300, 186, 238) + T(113, 230, "parent", { s: 11 }) + T(243, 230, "parent", { s: 11 }));
    return svg(350, 268, s);
  })();
  const histFig = (() => {
    const mk = (x0, t, mean) => {
      let s = T(x0 + 50, 14, "t = " + t, { s: 13 }), mx = 0.28;
      for (let k = 0; k < 10; k++) { const p = Math.pow((k + 1) / 10, t) - Math.pow(k / 10, t), h = (p / mx) * 110; s += R(x0 + k * 10, 142 - h, 9, h, "var(--violet)", { fo: 0.8, r: 2, sw: 1 }); }
      const mxp = x0 + mean;
      s += L(mxp, 28, mxp, 142, { c: "var(--amber)", w: 3, dash: "5 4" }) + T(mxp, 160, "mean " + Math.round(mean), { s: 11, c: "var(--amber-ink)" }) + L(x0 - 2, 142, x0 + 102, 142) + T(x0, 176, "0", { s: 10, c: FAINT }) + T(x0 + 100, 176, "100", { s: 10, c: FAINT });
      return s;
    };
    return svg(340, 184, mk(6, 1, 50) + mk(122, 2, 200 / 3) + mk(238, 3, 75));
  })();
  const traceTab = `<table class="t"><tr><th>Call</th><th>Entrants: slot (fitness)</th><th>Returned</th></tr>
    <tr class="bad"><td>1</td><td>8 (0.20) &nbsp;3 (0.90) &nbsp;5 (0.40)</td><td>slot 8: 0.20</td></tr>
    <tr class="bad"><td>2</td><td>2 (0.70) &nbsp;6 (0.10) &nbsp;1 (0.50)</td><td>slot 6: 0.10</td></tr>
    <tr><td>3</td><td>4 (0.60) &nbsp;0 (0.30) &nbsp;7 (0.80)</td><td>slot 7: 0.80</td></tr></table>`;
  B.add("l4-tournament", [
    { type: "pick", q: "Size-2 tournaments with replacement among three individuals. Each cell is one equally likely pair of entrants (first draw, second draw); the fitter entrant wins. Tap every cell where <b>B</b> wins.", fig: gridFig, a: ["BB", "BC", "CB"],
      why: "A beats everyone, so B can only win when no A is drawn, and when B is drawn at least once: (B, B), (B, C) and (C, B). That is 3 of the 9 equally likely pairs, so B wins 1/3 of the time. A wins 5/9 (every cell with an A) and C only 1/9 (C, C)." },
    { type: "pick", q: "A population lives on two machines; a coordinator can add up their fitness. Roulette selection needs the messages below. Now the GA switches to tournament selection (each machine runs tournaments on its own individuals). Tap every message that is no longer needed.", fig: seqFig, a: ["m1", "m2", "m3"],
      why: "Roulette needs the grand total of all fitness, so every machine reports a subtotal and the total is sent back (messages 1 to 3). Tournament selection only compares the few entrants it draws, so it needs no global information at all. Picking a parent still happens locally and the parent still has to be sent on, so those messages stay." },
    { type: "slider", q: "Fitness values are spread evenly from 0 to 100, and a tournament returns the fittest of t random entrants. The dashed lines show the average winner for t = 1, 2 and 3. About what is the average winner's fitness for t = 9?", fig: histFig, min: 50, max: 100, step: 5, ans: 90, tol: 5,
      hint: "The averages are 1/2, 2/3 and 3/4 of the way up the range. What is the pattern?",
      why: "The means follow t ÷ (t + 1) of the range: 50, 67, 75, and so 9/10 = 90 for t = 9. Each extra entrant makes it less likely that all of them are weak, so the winner's fitness creeps towards the top with diminishing returns." },
    { type: "bug", q: "This tournament is meant to return the fittest of t random slots, but it keeps returning weak individuals. The trace of three calls is above. Tap the faulty line.", fig: traceTab,
      code: ["def tournament(pop, t):", "    n = len(pop)", "    idx = random.sample(range(n), t)", "    best = max(idx)", "    return pop[best]"], a: 3,
      why: "max(idx) picks the largest slot NUMBER, not the fittest slot: call 1 returned slot 8 (0.20) although slot 3 (0.90) was in the tournament. It only looks right when the highest slot happens to be the fittest, as in call 3. The fix is max(idx, key=lambda i: pop[i].fit)." },
  ]);

  /* ---------- l4-mutation ---------- */
  const tspFig = (() => {
    const P = { A: [40, 50], B: [150, 22], C: [270, 48], D: [292, 168], E: [160, 206], F: [38, 160] };
    const par = ["AB", "BC", "CD", "DE", "EF", "FA"], child = ["AD", "DC", "CB", "BE", "EF", "FA"];
    let s = par.map((e) => L(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { c: FAINT, w: 3, dash: "3 6", cap: true })).join("");
    s += child.map((e) => pk(e, L(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { c: "var(--blue)", w: 5, cap: true }) + L(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], { c: "transparent", w: 22 }))).join("");
    s += Object.entries(P).map(([k, [x, y]]) => C(x, y, 15, "var(--panel)", { s: "var(--ink)" }) + T(x, y + 5, k, { s: 14 })).join("");
    s += L(10, 240, 38, 240, { c: FAINT, w: 3, dash: "3 6" }) + T(44, 244, "parent tour", { a: "start", s: 11 }) + L(150, 240, 178, 240, { c: "var(--blue)", w: 5 }) + T(184, 244, "child tour", { a: "start", s: 11 });
    return svg(330, 256, s);
  })();
  const binomHist = (() => {
    const Cn = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }, b = (p, k) => Cn(20, k) * Math.pow(p, k) * Math.pow(1 - p, 20 - k);
    const mk = (x0, name, p) => {
      let s = T(x0 + 50, 14, name, { s: 13 });
      for (let k = 0; k <= 9; k++) { const h = b(p, k) * 140; s += R(x0 + k * 10, 150 - h, 8.5, Math.max(h, 0.5), "var(--blue)", { fo: 0.85, r: 2, sw: 1 }) + (k % 3 === 0 ? T(x0 + k * 10 + 4, 165, k, { s: 10, c: DIM }) : ""); }
      return s + L(x0 - 2, 150, x0 + 100, 150);
    };
    return svg(340, 188, mk(6, "Panel X", 0.25) + mk(122, "Panel Y", 0.01) + mk(238, "Panel Z", 0.05) + T(170, 184, "bits flipped in a child of a 20-bit string (0 to 9)", { s: 10, c: FAINT }));
  })();
  const pairGrid = (() => {
    let s = "", n = 0;
    for (let i = 0; i < 6; i++) { s += T(46 + i * 44, 16, i + 1, { s: 12, c: DIM }) + T(12, 56 + i * 44, i + 1, { s: 12, c: DIM }); for (let j = 0; j < 6; j++) { const on = i < j; if (on) n++; s += R(26 + j * 44, 28 + i * 44, 40, 40, on ? "var(--teal)" : "var(--bg-2)", { fo: on ? 0.8 : 1, r: 6, s: "var(--panel)", sw: 2 }) + (on ? T(46 + j * 44, 53 + i * 44, n, { s: 13, c: "#fff" }) : ""); } }
    return svg(292, 296, s);
  })();
  const dialFig = (() => {
    const cx = 150, cy = 150, r = 112, set = [["r0", "0", 180], ["r1", ".002", 135], ["r2", ".02", 90], ["r3", ".1", 45], ["r4", ".5", 0]];
    let s = `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" fill="none" stroke="var(--line-2)" stroke-width="6" stroke-linecap="round"/>`;
    set.forEach(([id, l, a]) => { const x = cx + r * Math.cos(a * Math.PI / 180), y = cy - r * Math.sin(a * Math.PI / 180); s += pk(id, C(x, y, 26, "var(--panel)") + T(x, y + 5, l, { s: 13 })); });
    s += T(cx, cy - 36, "flip rate per bit", { s: 13 }) + T(cx, cy - 18, "(each bit independently)", { s: 10, c: DIM }) + T(cx, cy + 12, "strings are 50 bits long", { s: 11, c: DIM });
    return svg(300, 186, s);
  })();
  B.add("l4-mutation", [
    { type: "pick", q: "A tour of the six cities A to F (grey dotted lines) is mutated by reversing the segment B C D. The child's tour is drawn in blue. Tap every edge of the child that was not in the parent.", fig: tspFig, a: ["AD", "BE"],
      why: "The parent visits A B C D E F; the child visits A D C B E F. Edges D–C, C–B, E–F and F–A already existed (an edge has no direction). Only A–D and B–E are new. A reversal changes just two edges however long the segment is, which makes it a small, gentle step for tour problems." },
    { type: "match", q: "Bit-flip mutation on 20-bit strings: each panel shows how many bits flip in a child (0 to 9). Match each panel to the mutation rate per bit.", fig: binomHist,
      pairs: [["Panel X", "0.25 per bit"], ["Panel Y", "0.01 per bit"], ["Panel Z", "0.05 per bit"]],
      hint: "On average a child flips 20 × rate bits: 20 × 0.05 = 1.",
      why: "The average number of flips is 20 times the rate: 0.2, 1 and 5. At 0.01 most children (82%) are untouched copies (panel Y). At 0.05, which is 1/L, the typical child flips 0 or 1 bits (panel Z). At 0.25 the peak sits at about 5 flips and the child is already far from its parent (panel X)." },
    { type: "slider", q: "Swap mutation exchanges two positions of a tour. With 6 cities there are 15 different swaps (the 15 coloured cells: one per pair of positions). About how many different swaps exist for 10 cities?", fig: pairGrid, min: 0, max: 100, step: 5, ans: 45, tol: 5,
      hint: "Each coloured cell is a pair (row < column). For 10 cities: 10 × 9 pairs, counted once per swap.",
      why: "The number of swaps is the number of pairs of positions: n × (n − 1) / 2. For 6 cities 6 × 5 / 2 = 15, and for 10 cities 10 × 9 / 2 = 45. The set of neighbours grows with the square of the tour length, so for long tours a single swap is a tiny sample of what is reachable." },
    { type: "pick", q: "Each dial setting is a possible mutation rate per bit for strings of 50 bits. Tap every setting that flips MORE than 2 bits per child on average.", fig: dialFig, a: ["r3", "r4"],
      hint: "Average flips = 50 × rate. For example 50 × 0.02 = 1.",
      why: "50 × 0.1 = 5 flips and 50 × 0.5 = 25 flips, both above 2. At 0.02 a child flips 1 bit on average (that is 1/L, the usual choice), at 0.002 only 0.1, and at 0 nothing ever changes. A rate of 0.5 flips half the string: the child keeps almost nothing of its parent." },
  ]);

  /* ---------- l4-crossover ---------- */
  const splitFig = (() => {
    const X = (d) => 50 + (d - 1) * 32, Y = (p) => 212 - p * 190, curves = [["X", () => 0.5, "var(--violet)"], ["Y", (d) => d / 9, "var(--blue)"], ["Z", (d) => d * (9 - d) / 36, "var(--amber)"]];
    let s = [0, 0.5, 1].map((p) => L(40, Y(p), 324, Y(p), { c: "var(--line)", w: 1 }) + T(35, Y(p) + 4, Math.round(p * 100) + "%", { a: "end", s: 10, c: FAINT })).join("");
    for (let d = 1; d <= 9; d++) s += T(X(d), 232, d, { s: 11, c: DIM });
    s += T(190, 250, "distance d between the two genes", { s: 11, c: DIM }) + T(2, 10, "chance the two genes come from different parents", { a: "start", s: 10, c: DIM });
    curves.forEach(([n, f, c]) => {
      const pts = Array.from({ length: 9 }, (_, i) => [X(i + 1), Y(f(i + 1))]);
      s += pk(n, `<path d="${pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ")}" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>` + pts.map((p) => C(p[0], p[1], 4.5, c, { s: "var(--panel)", sw: 2 })).join("") + C(X(9) + 22, Y(f(9)), 11, c, { fo: 0.9, s: "var(--panel)", sw: 2 }) + T(X(9) + 22, Y(f(9)) + 5, n, { s: 12, c: "#fff" }));
    });
    return svg(350, 258, s);
  })();
  const dagFig = (() => {
    const id = "ar" + ++uid, N = { G2: [56, 34], G1: [170, 34], G3: [284, 34], X: [113, 122], Y: [227, 122], Z: [170, 210] }, E = [["G2", "X"], ["G1", "X"], ["G1", "Y"], ["G3", "Y"], ["X", "Z"], ["Y", "Z"]];
    let s = arrowDef(id);
    s += E.map(([a, b]) => { const [x1, y1] = N[a], [x2, y2] = N[b], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d; return L(x1 + ux * 25, y1 + uy * 25, x2 - ux * 29, y2 - uy * 29, { w: 3, mk: id }); }).join("");
    s += Object.entries(N).map(([k, [x, y]]) => C(x, y, 23, k === "G1" ? "var(--amber-dim)" : "var(--panel)", { s: k === "G1" ? "var(--amber)" : "var(--ink)" }) + T(x, y + 5, k, { s: 14 })).join("");
    s += T(336, 206, "arrows point from", { a: "end", s: 10, c: FAINT }) + T(336, 220, "parent to child", { a: "end", s: 10, c: FAINT });
    return svg(340, 242, s);
  })();
  const nodupTab = (() => {
    const cell = (v, bad) => `<td class="num" style="text-align:center${bad ? ";background:var(--rose-dim)" : ""}">${v}</td>`;
    const row = (n, a, bad = []) => `<tr><td>${n}</td>${a.map((v, i) => cell(v, bad.includes(i))).join("")}</tr>`;
    return `<table class="t"><tr><th>Gene</th>${[1, 2, 3, 4, 5, 6].map((i) => `<th class="num" style="text-align:center">${i}</th>`).join("")}</tr>${row("Parent 1", [1, 2, 3, 4, 5, 6])}${row("Parent 2", [3, 6, 5, 1, 4, 2])}${row("Child", [1, 2, 3, 1, 4, 2], [3, 5])}</table><p class="dim" style="margin:6px 0 0;font-size:13px">1-point crossover after gene 3: genes 1 to 3 from parent 1, genes 4 to 6 from parent 2. Red cells repeat a city.</p>`;
  })();
  const bitFig = (() => {
    const cols = ["101101", "111111", "011010", "110011", "000000", "101110", "000010", "110100", "111111", "010110", "100111", "011001"];
    let s = "";
    for (let r = 0; r < 6; r++) s += T(16, 54 + r * 30, "P" + (r + 1), { s: 11, c: DIM });
    cols.forEach((c, j) => {
      let g = T(46 + j * 25, 20, j + 1, { s: 11, c: DIM });
      [...c].forEach((b, r) => { g += R(34 + j * 25, 30 + r * 30, 23, 27, b === "1" ? "var(--blue)" : "var(--bg-2)", { r: 5, sw: 1.5 }) + T(45.5 + j * 25, 49 + r * 30, b, { s: 12, c: b === "1" ? "#fff" : DIM }); });
      s += pk("c" + (j + 1), g);
    });
    return svg(340, 216, s);
  })();
  B.add("l4-crossover", [
    { type: "pick", q: "Parents are crossed over with 1-point, 2-point and uniform crossover. Each curve gives the chance that two genes d positions apart (in a 10-gene string) end up from different parents. Tap the curve for <b>2-point</b> crossover.", fig: splitFig, a: "Z",
      why: "Uniform crossover flips a fair coin per gene, so any two genes are separated half the time (curve X). With 1 cut, the further apart two genes are, the more likely the cut lands between them, a straight rise to 100% (curve Y). With 2 cuts, the middle segment swaps, so the two end genes both stay with the same parent: the chance falls back to 0 at d = 9. Curve Z is the hump: 2-point treats the string like a ring." },
    { type: "slider", q: "Uniform crossover, no mutation: each gene of a child comes from either parent with equal chance. X and Y share the parent G1. About what percentage of Z's genes come from G1?", fig: dagFig, min: 0, max: 100, step: 5, ans: 50, tol: 10, unit: "%",
      hint: "A gene of Z comes from X or from Y with equal chance. Then from G1 with what chance on each route?",
      why: "A gene of Z comes from X half the time and then from G1 half of those times: 25%. It comes from Y half the time and then from G1 half of those: another 25%. The two routes cannot both happen to one gene, so 25% + 25% = 50%. Shared ancestors pile up in a family tree, which is one way diversity shrinks over generations." },
    { type: "multi", q: "Plain 1-point crossover is applied to two city tours. Which statements about the child are true?", fig: nodupTab,
      o: ["City 1 and city 2 each appear twice", "Cities 5 and 6 are missing, so the tour is not valid", "The child is the wrong length", "Every gene came from a parent, so the tour is valid", "Replacing the repeated 1 and 2 at genes 4 and 6 with 5 and 6 would repair it"], a: [0, 1, 4],
      why: "The child is 1 2 3 1 4 2: cities 1 and 2 are visited twice, and 5 and 6 never. It still has 6 genes, so the length is right; the problem is the content. Permutations are not just any string of parent genes, which is why order crossover and similar operators exist. Putting 5 and 6 where the repeats are (genes 4 and 6) would give a valid tour." },
    { type: "pick", q: "Six members of the population are shown (blue = 1). Mutation is switched off. Tap every gene position that crossover can never change in any future child, however long the run.", fig: bitFig, a: ["c2", "c5", "c9"],
      why: "A child gene is always copied from some parent, so where every member agrees (genes 2, 5 and 9) nothing else can ever appear: crossover cannot create variation, only recombine it. Gene 7 looks nearly fixed but one member still has a 1, so crossover can pass it on. Only mutation could now change genes 2, 5 and 9." },
  ]);

  /* ---------- l4-lab ---------- */
  const labHeat = (() => {
    const cnt = [[8, 8, 7, 8, 8, 8], [8, 5, 8, 8, 0, 8], [7, 8, 8, 3, 8, 8], [8, 8, 0, 8, 8, 6], [8, 1, 8, 8, 8, 8], [8, 8, 8, 8, 0, 8]];
    let s = "";
    cnt.forEach((row, r) => row.forEach((v, c) => { s += pk("p" + r + c, R(4 + c * 50, 4 + r * 50, 46, 46, "var(--teal)", { fo: (0.06 + 0.8 * v / 8).toFixed(2), r: 8, s: "var(--panel)", sw: 2 }) + T(27 + c * 50, 33 + r * 50, v, { s: 16 })); }));
    return svg(308, 308, s);
  })();
  const evalFig = (() => {
    const panel = (y0, title, xmax, ticks, x90, label) => {
      const X = (x) => 40 + (x / xmax) * 290, Y = (v) => y0 + 94 - ((v - 0.5) / 0.5) * 80, k = Math.log(5) / x90;
      const pts = Array.from({ length: 61 }, (_, i) => { const x = (i / 60) * xmax; return `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(1 - 0.5 * Math.exp(-k * x)).toFixed(1)}`; }).join(" ");
      let s = T(4, y0, title, { a: "start", s: 12 }) + L(40, Y(0.5), 330, Y(0.5)) + L(40, Y(0.9), 330, Y(0.9), { c: "var(--amber)", w: 2, dash: "6 5" }) + T(35, Y(0.9) + 4, "0.9", { a: "end", s: 10, c: "var(--amber-ink)" }) + T(35, Y(0.5) + 4, "0.5", { a: "end", s: 10, c: FAINT });
      s += `<path d="${pts}" fill="none" stroke="var(--teal)" stroke-width="4"/>` + L(X(x90), Y(0.9), X(x90), Y(0.5), { c: "var(--amber)", w: 2, dash: "6 5" });
      ticks.forEach((t) => { s += T(X(t), Y(0.5) + 15, t, { s: 10, c: DIM }); });
      return s + T(X(x90), Y(0.9) - 7, label, { s: 11, c: "var(--amber-ink)" });
    };
    return svg(340, 276, panel(18, "Algorithm 1: x = steps (1 child per step)", 1000, [0, 250, 500, 750, 1000], 700, "0.9 at step 700") + panel(150, "Algorithm 2: x = generations (30 children each)", 60, [0, 15, 30, 45, 60], 40, "0.9 at generation 40"));
  })();
  const rateFig = (() => {
    const rates = ["0.0005", "0.002", "0.007", "0.02", "0.1", "0.5"], runs = [[0.72, 0.75, 0.7], [0.86, 0.89, 0.84], [0.96, 0.97, 0.94], [0.92, 0.9, 0.94], [0.77, 0.8, 0.74], [0.51, 0.49, 0.52]];
    const X = (i) => 66 + i * 54, Y = (v) => 224 - (v - 0.4) / 0.6 * 190;
    let s = [0.5, 0.7, 0.9].map((v) => L(36, Y(v), 340, Y(v), { c: "var(--line)", w: 1 }) + T(31, Y(v) + 4, v, { a: "end", s: 10, c: FAINT })).join("");
    s += L(X(2), 22, X(2), 232, { c: "var(--amber)", w: 2, dash: "6 5" }) + T(X(2) + 5, 18, "1/144", { a: "start", s: 11, c: "var(--amber-ink)" });
    rates.forEach((r, i) => { s += T(X(i), 248, r, { s: 10, c: DIM }); runs[i].forEach((v, k) => { s += C(X(i) + (k - 1) * 11, Y(v), 6.5, "var(--blue)", { fo: 0.85, s: "var(--panel)", sw: 2 }); }); });
    s += T(190, 266, "mutation rate per pixel (log scale)", { s: 11, c: DIM }) + T(2, 10, "final best fitness", { a: "start", s: 11, c: DIM });
    return svg(350, 274, s);
  })();
  const pixFig = (() => {
    const Tg = [".X..X.", "XXXXXX", "XXXXXX", ".XXXX.", "..XX..", "......"], par = ["XX..X.", "XXXX.X", "XXXXXX", "XXXXXX", "..XX..", "......"], flips = [[0, 1], [3, 0], [1, 4]];
    const chd = par.map((r) => r.split("")); flips.forEach(([r, c]) => { chd[r][c] = chd[r][c] === "X" ? "." : "X"; });
    const grid = (g, x0, name, mark) => {
      let s = T(x0 + 52, 14, name, { s: 13 });
      g.forEach((row, r) => [...row].forEach((v, c) => {
        const isF = mark && flips.some(([a, b]) => a === r && b === c), cellSvg = R(x0 + c * 17.5, 22 + r * 17.5, 16, 16, v === "X" ? "var(--ink)" : "var(--bg-2)", { r: 3, s: isF ? "var(--amber)" : "var(--line)", sw: isF ? 3.5 : 1 });
        s += isF ? pk("p" + r + c, cellSvg) : cellSvg;
      }));
      return s;
    };
    return svg(340, 150, grid(Tg, 4, "Target", false) + grid(par, 118, "Parent", false) + grid(chd, 232, "Child", true) + T(170, 146, "dark = on, pale = off", { s: 10, c: FAINT }));
  })();
  B.add("l4-lab", [
    { type: "pick", q: "Each number is how many of the 8 population members have that pixel of a 6 × 6 picture right. Mutation is off. Tap every pixel that selection and crossover can never fix.", fig: labHeat, a: ["p14", "p32", "p54"],
      hint: "Crossover can only reshuffle pixel values that someone in the population already has.",
      why: "A pixel that no member has right (the three zeros) offers crossover and selection nothing to combine; only mutation can flip it. A pixel that 1 or 3 members have right, such as the 1 and the 3, can still spread by selection and crossover. The 8s need no fixing at all. This is why a converged population stalls on its last wrong pixels." },
    { type: "mcq", q: "Algorithm 1 (steady-state) and algorithm 2 (generational, population 30) both reach fitness 0.9. Which one needed fewer fitness evaluations?", fig: evalFig,
      o: ["Algorithm 1: about 700 evaluations, against 1,200", "Algorithm 2: its 40 generations are far fewer than 700 steps", "They are level: both curves reach 0.9 at the same height", "Algorithm 2: each whole generation is evaluated in parallel"], a: 0,
      hint: "A step makes 1 child. A generation makes 30 children, so 30 evaluations.",
      why: "The two x axes count different things. A steady-state step evaluates one child, so 700 steps cost about 700 evaluations. A generation evaluates a whole new population, so 40 generations cost about 40 × 30 = 1,200. Compare costs in evaluations, not in generations or steps." },
    { type: "mcq", q: "Each dot is one run on the same picture with the same number of evaluations, at a different per-pixel mutation rate. What explains the weaker results at BOTH ends of the curve?", fig: rateFig,
      o: ["Too few flips means slow exploring; too many scrambles progress", "Too few flips fills the population with copies; too many makes evaluation slower", "Low rates are blocked by elitism; high rates are blocked by tournament size", "Both ends are noise: three runs per setting cannot show any pattern at all"], a: 0,
      why: "At 0.0005 per pixel most children are copies of their parents, so progress crawls. At 0.5 half the pixels flip, so a child is nearly a random picture and the good parts built so far are destroyed. The best results sit around 1/L = 1/144 per pixel, about one flip per child. Evaluation cost does not depend on the rate, and the three runs at each setting agree closely, so this is a real pattern." },
    { type: "pick", q: "The child differs from its parent in three pixels (orange outlines). Compare them with the target and tap every changed pixel where the mutation HELPED.", fig: pixFig, a: ["p30", "p14"],
      why: "A flip helps when the parent was wrong at that pixel and the child is right. The first pixel of the fourth row was wrongly on and is now off, and the fifth pixel of the second row was wrongly off and is now on: two fixes. The second pixel of the top row was right in the parent and got broken. The net effect is 4 wrong pixels down to 3, a fitness of 33/36 instead of 32/36, and that is why a mutation can still be kept when part of it is harmful." },
  ]);
})();

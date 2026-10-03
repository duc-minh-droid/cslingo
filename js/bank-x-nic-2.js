/* Revision bank, third set of varied, visual questions (nic-2: l2-approx, l3-recipe, l3-tsp, l3-hc, l3-landscape,
   l3-neighbourhood, l3-local, l3-population). Every number is checked with node (see the notes beside each figure). */
(function () {
  const B = NIC.bank;

  /* ---------- small SVG helpers (CSS variables so both themes work) ---------- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, s, { a = "middle", c = "var(--text)", f = "800 13px" } = {}) => `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${f} var(--sans);fill:${c}">${s}</text>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2, d = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const rc = (x, y, w, h, { f = "var(--panel)", s = "var(--line-2)", sw = 2, r = 8, o = 1 } = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" fill-opacity="${o}" stroke="${s}" stroke-width="${sw}"/>`;
  const ci = (x, y, r, { f = "var(--panel)", s = "var(--line-2)", sw = 2.5 } = {}) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
  const pl = (pts, c, w = 3, d = "") => `<polyline points="${pts.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const hit = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const mark = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--text-faint)"/></marker></defs>`;
  const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const pow10 = (x, y, e, c = "var(--text-faint)") => `<text x="${x}" y="${y}" text-anchor="middle" style="font:700 12px var(--sans);fill:${c}">10<tspan dy="-6" style="font-size:10px">${e}</tspan></text>`;

  /* ======================================================================
     l2-approx : number line, dot strips, pixel grid, column chart
     ====================================================================== */
  // log10 positions: day of checking at 1e9/s = 8.64e13 (13.94). Dots at 11.5, 12.7, 13.5 are under it; 14.3 (2e14 = 2.3 days), 15.6, 17.8 are over.
  const numLineFig = () => {
    const X = (e) => 40 + (e - 10) * 50;
    let s = ln(30, 120, 450, 120, "var(--text-faint)", 3);
    for (let e = 10; e <= 18; e++) s += ln(X(e), 114, X(e), 126, "var(--text-faint)", 2) + pow10(X(e), 146, e);
    [["A", 11.5], ["B", 12.7], ["C", 13.5], ["D", 14.3], ["E", 15.6], ["F", 17.8]].forEach(([k, e]) => {
      s += ln(X(e), 92, X(e), 120, "var(--line-2)", 2, "3 4") + hit(k, `${ci(X(e), 76, 16, { s: "var(--blue)", sw: 3 })}${tx(X(e), 81, k, { f: "900 14px" })}`);
    });
    s += tx(245, 178, "designs in the problem (each tick is 10 times more)", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 190, s);
  };

  const STRIPS = { A: Array(10).fill(400), B: [412, 407, 455, 431, 468, 420, 409, 444, 426, 438], C: Array(10).fill(438) };
  const stripFig = () => {
    const Y = (v) => 175 - (v - 390) * 1.55;
    let s = "";
    [400, 440, 480].forEach((v) => (s += tx(30, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) + ln(34, Y(v), 36, Y(v), "var(--text-faint)", 1.5)));
    [["A", 36], ["B", 176], ["C", 316]].forEach(([k, px]) => {
      s += rc(px, 26, 124, 164, { r: 10, s: "var(--line)", f: "var(--bg-2)" }) + tx(px + 62, 18, "Method " + k, { f: "900 14px" });
      s += ln(px + 4, Y(400), px + 120, Y(400), "var(--teal)", 2.5, "6 4");
      STRIPS[k].forEach((v, i) => (s += ci(px + 12 + i * 11.2, Y(v), 4.5, { f: "var(--amber)", s: "var(--amber-ink)", sw: 1.5 })));
    });
    ["A", "B", "C"].forEach((k, i) => (s += hit(k, rc(34 + i * 140, 22, 128, 172, { f: "transparent", s: "transparent", sw: 2, r: 12 }))));
    s += tx(235, 210, "each dot: route length (km) from one of 10 runs. Dashed green: the best possible, 400 km", { f: "700 11px", c: "var(--text-faint)" });
    return svg(470, 220, s);
  };

  const gridFig = () => {
    const R = rng(11), C = 26, x0 = 8, y0 = 8;
    const cost = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 35 + Math.floor(R() * 58)));
    cost[2][6] = 31;
    let s = "";
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
      const x = x0 + c * C, y = y0 + r * C;
      if (r < 4) s += rc(x, y, C - 2, C - 2, { f: "var(--blue)", o: 0.12 + ((93 - cost[r][c]) / 58) * 0.55, s: r === 2 && c === 6 ? "var(--teal)" : "var(--line)", sw: r === 2 && c === 6 ? 3.5 : 1, r: 4 }) + tx(x + C / 2 - 1, y + C / 2 + 4, cost[r][c], { f: "800 11px" });
      else s += rc(x, y, C - 2, C - 2, { f: "var(--bg-2)", s: "var(--line)", sw: 1, r: 4 });
    }
    s += rc(290, 22, 22, 22, { f: "var(--blue)", o: 0.45, s: "var(--line)", sw: 1, r: 4 }) + tx(322, 38, "checked: 40 designs", { a: "start" });
    s += rc(290, 58, 22, 22, { f: "var(--bg-2)", s: "var(--line)", sw: 1, r: 4 }) + tx(322, 74, "not checked: 60", { a: "start" });
    s += rc(290, 94, 22, 22, { f: "none", s: "var(--teal)", sw: 3.5, r: 4 }) + tx(322, 110, "best so far: 31", { a: "start" });
    s += tx(290, 150, "Number = cost of the design.", { a: "start", f: "700 12px", c: "var(--text-faint)" }) + tx(290, 168, "Darker blue = cheaper.", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 276, s);
  };

  const colFig = () => {
    let s = ln(40, 190, 440, 190, "var(--text-faint)", 2.5);
    for (let i = 0; i < 7; i++) {
      const h = 2 ** i, x = 56 + i * 54, bh = h * 2.2;
      s += rc(x, 190 - bh, 38, bh, { f: "var(--amber)", o: 0.35, s: "var(--amber)", sw: 2.5, r: 5 }) + tx(x + 19, 190 - bh - 7, h + " h", { f: "900 13px" }) + tx(x + 19, 210, 40 + i, { f: "800 13px", c: "var(--text-dim)" });
    }
    s += tx(245, 232, "number of in-or-out items, n", { f: "700 12px", c: "var(--text-faint)" });
    s += `<text transform="translate(16,110) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">time to check every subset</text>`;
    return svg(470, 242, s);
  };

  B.add("l2-approx", [
    { type: "pick", q: "Each dot is the number of designs in a different problem. A computer checks one billion designs a second and you can wait one day. Click every problem you could solve by checking every design.",
      fig: numLineFig(), a: ["A", "B", "C"],
      hint: "A day is about 100,000 seconds, so one billion a second gives about 10 to the power 14 checks in total.",
      why: "A day has about 86,400 seconds, so a billion checks a second covers roughly 10¹⁴ designs. A, B and C sit to the left of that mark (C is about 3 × 10¹³, around nine hours of checking). D is about 2 × 10¹⁴, over two days. E needs about 46 days and F about 20 years, so those need an approximate method." },
    { type: "pick", q: "Three methods each ran 10 times on the same routing problem. The dashed line is the proven best route, 400 km. Click the method for which running it again with a fresh random seed could give you a better answer.",
      fig: stripFig(), a: "B",
      hint: "Ask: does a second run give anything different from the first?",
      why: "Method A already lands on 400 km every time, so there is nothing to gain. Method C returns the same 438 km on every run, so a rerun just repeats it. Only B varies from run to run (407 to 468 km), so each extra run is a new chance to beat the last, and keeping the best of many runs pulls its answer towards the optimum." },
    { q: "A search checks every design in order, row by row, and is stopped after 40 of the 100. The cheapest design so far costs 31 (outlined). What can you say about the cheapest of all 100 designs?",
      fig: gridFig(),
      o: ["It could be cheaper than 31, since 60 designs are unchecked", "It is exactly 31, because the search keeps the cheapest it has seen", "It is above 31, because the cheap rows are always checked first", "It is within a few per cent of 31, since 40 designs is a fair sample"], a: 0,
      why: "Checking 40% of the designs proves nothing about the other 60%: any of them might cost less than 31. 31 is the best so far, not the best overall. An exhaustive search that is stopped early has become an approximate method with no guarantee. Only a finished search proves the optimum." },
    { type: "slider", q: "The chart shows how long a computer needs to check every in-or-out choice for n items. A new computer is 1,000 times faster. About how many items could it handle in the same 1 hour?",
      fig: colFig(), min: 40, max: 70, step: 1, ans: 50, tol: 2, unit: "items",
      hint: "Each extra item doubles the time. 1,000 is close to 1,024, which is ten doublings (2 × 2 × 2 … ten times).",
      why: "Ten doublings multiply the time by 2¹⁰ = 1,024, about 1,000. A computer 1,000 times faster therefore buys only ten more items (40 to 50) in the same hour. For exponential problems, faster hardware helps very little, which is why we turn to approximate methods." },
  ]);

  /* ======================================================================
     l3-recipe : flow diagram, 100% stacked bars, step line, small-multiple charts
     ====================================================================== */
  const recipeFlow = () => {
    const bx = (x, y, a, b) => rc(x - 55, y - 23, 110, 46, { r: 12, s: "var(--blue)", sw: 2.5 }) + (b ? tx(x, y - 3, a, { f: "800 12px" }) + tx(x, y + 13, b, { f: "800 12px" }) : tx(x, y + 5, a, { f: "800 13px" }));
    const arr = (id, x1, y1, x2, y2) => hit(id, `${ln(x1, y1, x2, y2, "var(--text-faint)", 3).replace("/>", ` marker-end="url(#rfa)"/>`)}${ln(x1, y1, x2, y2, "transparent", 26)}`);
    let s = mark("rfa");
    s += bx(72, 50, "Make random", "population") + bx(230, 50, "Score every", "member") + bx(388, 50, "Select", "parents");
    s += bx(388, 170, "Crossover +", "mutation") + bx(230, 170, "Replace the", "weakest") + bx(72, 170, "Stop?");
    s += arr("is", 127, 50, 170, 50) + arr("ss", 285, 50, 328, 50) + arr("sv", 388, 73, 388, 142) + arr("vr", 333, 170, 290, 170) + arr("rs", 175, 170, 132, 170);
    s += hit("loop", `<path d="M72 147 V112 H350 V76" fill="none" stroke="var(--text-faint)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#rfa)"/><path d="M72 147 V112 H350 V76" fill="none" stroke="transparent" stroke-width="22"/>`);
    s += tx(210, 104, "no: go round again", { f: "700 12px", c: "var(--text-faint)" }) + tx(72, 208, "yes: return the best", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 220, s);
  };

  const shareFig = () => {
    const rows = [["Population 1: fitness 50, 51, 52, 53", [50, 51, 52, 53]], ["Population 2: fitness 0, 1, 2, 3", [0, 1, 2, 3]]];
    const cols = [["blue-dim", "blue"], ["teal-dim", "teal"], ["amber-dim", "amber"], ["violet-dim", "violet"]];
    let s = "";
    rows.forEach(([t, f], r) => {
      const y = 36 + r * 88, tot = f.reduce((a, b) => a + b, 0);
      s += tx(30, y - 12, t, { a: "start", f: "800 13px" });
      let x = 30;
      f.forEach((v, i) => {
        const w = (380 * v) / tot;
        if (w > 0) s += rc(x, y, w, 40, { f: `var(--${cols[i][0]})`, s: `var(--${cols[i][1]})`, sw: 2.5, r: 0 }) + tx(x + w / 2, y + 26, v, { f: "900 14px" });
        else s += tx(x - 6, y + 26, "0", { a: "end", f: "900 14px", c: "var(--text-faint)" });
        x += w;
      });
    });
    s += tx(30, 188, "bar length = each member's share of the parent picks", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    return svg(450, 198, s);
  };

  // best fitness so far: jumps at generations 5, 12, 25, 31, 58 (levels 20, 35, 50, 58, 63)
  const stepFig = () => {
    const X = (g) => 50 + g * 1.95, Y = (f) => 200 - f * 2.3;
    const jumps = [[0, 12], [5, 20], [12, 35], [25, 50], [31, 58], [58, 63], [200, 63]];
    const pts = [[X(0), Y(12)]];
    for (let i = 1; i < jumps.length; i++) pts.push([X(jumps[i][0]), Y(jumps[i - 1][1])], [X(jumps[i][0]), Y(jumps[i][1])]);
    let s = ln(50, 200, 445, 200, "var(--text-faint)", 2.5) + ln(50, 30, 50, 200, "var(--text-faint)", 2.5);
    [0, 50, 100, 150, 200].forEach((g) => (s += ln(X(g), 200, X(g), 206, "var(--text-faint)", 2) + tx(X(g), 222, g, { f: "700 12px", c: "var(--text-faint)" })));
    [0, 20, 40, 60].forEach((f) => (s += tx(44, Y(f) + 4, f, { a: "end", f: "700 11px", c: "var(--text-faint)" })));
    s += pl(pts, "var(--teal)", 3.5);
    [[31, 58], [51, 58], [78, 63], [100, 63], [200, 63]].forEach(([g, f]) => (s += ln(X(g), Y(f) - 10, X(g), Y(f), "var(--blue)", 2, "3 3") + hit("g" + g, `${ci(X(g), Y(f) - 25, 14, { s: "var(--blue)", sw: 3 })}${tx(X(g), Y(f) - 21, g, { f: "900 11px" })}`)));
    s += tx(250, 244, "generation", { f: "700 12px", c: "var(--text-faint)" });
    s += `<text transform="translate(12,115) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">best fitness so far</text>`;
    return svg(470, 254, s);
  };

  // real simulated runs (40-bit OneMax, population 20, seed 4): [best, average] by generation
  const EA = {
    A: { b: [28, 28, 28, 30, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
      a: [20.4, 24.7, 27.9, 28.1, 28.9, 31.6, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33] },
    B: { b: [28, 26, 25, 26, 24, 26, 25, 27, 28, 25, 25, 23, 29, 28, 26, 28, 27, 26, 26, 29, 23, 29, 25, 26, 28, 26, 28, 28, 23, 24, 29, 26, 26, 24, 28, 23, 25, 25, 25, 27, 24],
      a: [20.4, 19.3, 19.6, 19.6, 19.3, 20.6, 20.1, 20.1, 20, 20.1, 20.1, 20.3, 20.6, 20.8, 19.9, 20.9, 20.9, 20.9, 20.6, 21.7, 20.4, 18.1, 20.6, 21.4, 20.3, 20.4, 20, 19.3, 19.6, 19.2, 20.1, 20, 21.3, 20.1, 20.4, 18.6, 20.7, 20.3, 19.6, 20.9, 19.7] },
    C: { b: [28, 28, 29, 29, 31, 31, 30, 32, 33, 33, 33, 34, 35, 36, 35, 36, 36, 37, 37, 38, 37, 37, 36, 36, 37, 36, 36, 37, 36, 35, 35, 35, 36, 36, 37, 37, 37, 37, 38, 38, 38],
      a: [20.4, 21.6, 24.4, 25.8, 26.9, 27.9, 28.1, 28.6, 28.6, 29.8, 30.3, 31.1, 31.6, 31.8, 32.1, 32.4, 32.5, 33.5, 34, 34, 34.1, 33.6, 33.7, 33.6, 34, 34.1, 34, 34.2, 34, 33.5, 33.1, 33, 33.2, 33.8, 34.3, 34.2, 34.6, 35, 35.6, 35.5, 35.8] },
  };
  const eaFig = () => {
    const Y = (v) => 118 - (v - 18) * 3.6;
    let s = "";
    [["A", 24], ["B", 178], ["C", 332]].forEach(([k, px]) => {
      const X = (g) => px + 6 + g * 3.2;
      s += rc(px, 26, 134, 100, { r: 8, s: "var(--line)", f: "var(--bg-2)" });
      [20, 30, 40].forEach((v) => (s += ln(px + 2, Y(v), px + 132, Y(v), "var(--line)", 1) + (k === "A" ? tx(px - 4, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) : "")));
      s += pl(EA[k].a.map((v, g) => [X(g), Y(v)]), "var(--amber)", 2.5, "5 4") + pl(EA[k].b.map((v, g) => [X(g), Y(v)]), "var(--teal)", 3);
      s += tx(px + 67, 146, "Run " + k, { f: "900 14px" }) + tx(px + 67, 164, "generations 0 to 40", { f: "700 11px", c: "var(--text-faint)" });
    });
    s += tx(235, 14, "solid green: best member    dashed orange: average member", { f: "700 12px", c: "var(--text-dim)" });
    return svg(472, 174, s);
  };

  B.add("l3-recipe", [
    { type: "pick", q: "Replacement compares fitness values, yet in this EA the children have never been scored when they reach the Replace step. Click the arrow where a box is missing.",
      fig: recipeFlow(), a: "vr",
      hint: "Which step produces new members, and which step needs to compare them with the old ones?",
      why: "Crossover and mutation make brand-new strings with no fitness yet. Replace-the-weakest has to compare a child's fitness with the population's, so a 'Score the children' box must sit on that arrow. The other arrows are fine: the starting population is scored before selection, and the loop-back repeats the cycle." },
    { q: "Both lists rank the four members the same way. Under fitness-proportional selection (chance of being picked = fitness ÷ total), which statement is true?",
      fig: shareFig(),
      o: ["Population 1 picks almost evenly, so selection there is weak", "Both populations favour their best member by the same amount", "Population 2 picks its best member about three times as often", "Population 1 picks its best member far more often than its worst"], a: 0,
      hint: "Population 1's total is 50 + 51 + 52 + 53 = 206. Is 53 out of 206 much more than 50 out of 206?",
      why: "In population 1 the shares are 24%, 25%, 25% and 26%, nearly equal, so selection is almost random even though the ranking is the same. Population 2's shares are 0%, 17%, 33% and 50%. The selection pressure depends on the gaps between fitness values, not just their order, which is why rank-based or tournament selection is often preferred." },
    { type: "pick", q: "The line is the best fitness found so far in one EA run (higher is better). The rule is: stop as soon as 20 generations pass with no improvement. Click the generation where this run would stop.",
      fig: stepFig(), a: "g51",
      hint: "Find the jump that comes before a long flat stretch. Count 20 generations along from there.",
      why: "The last improvement before the long flat patch is at generation 31. Twenty generations later, at 51, nothing has improved, so the run stops. It never sees the improvement at generation 58 (58 up to 63). Waiting 20 generations is a gamble, not a guarantee, and the stalling patch here was 27 generations long." },
    { type: "match", q: "Each chart tracks one EA on a 40-bit problem. Match each run to the settings that most likely produced it.",
      fig: eaFig(),
      pairs: [["Run A", "Very strong selection, no mutation"], ["Run B", "Mutation so heavy that children are nearly random"], ["Run C", "Moderate selection and light mutation"]],
      why: "Run A: best and average meet at 33 and stay flat. Copies of one good member fill the population and, with no mutation, nothing new can appear. Run B: the average sits near 20, which is what a random 40-bit string scores, so heavy mutation scrambles every child and progress is lost. Run C: the best keeps rising (28 to 38) and the average follows it up." },
  ]);

  /* ======================================================================
     l3-tsp : triangle heat table, decision tree, worked-example trace, stacked hop bars
     ====================================================================== */
  const TRI = { AB: 4, AC: 7, AD: 5, AE: 6, BC: 3, BD: 8, BE: 2, CD: 4, CE: 9, DE: 3 };
  const triFig = () => {
    const rows = "ABCD".split(""), cols = "BCDE".split(""), x0 = 66, y0 = 44, W = 76, H = 46;
    let s = "";
    cols.forEach((c, j) => (s += tx(x0 + j * W + W / 2, 34, c, { f: "900 15px" })));
    rows.forEach((r, i) => (s += tx(x0 - 12, y0 + i * H + H / 2 + 5, r, { f: "900 15px" })));
    const ticked = ["AC", "BC", "BE", "DE"];
    rows.forEach((r, i) => cols.forEach((c, j) => {
      if (j + 1 <= i) return;
      const k = r + c, d = TRI[k], x = x0 + j * W, y = y0 + i * H, t = ticked.includes(k);
      s += hit(k, `${rc(x + 2, y + 2, W - 4, H - 4, { f: "var(--blue)", o: 0.1 + d * 0.06, s: t ? "var(--teal)" : "var(--line-2)", sw: t ? 3.5 : 2, r: 8 })}${tx(x + W / 2, y + H / 2 + 6, d, { f: "900 18px" })}${t ? `<path d="M${x + W - 22} ${y + 14} l5 5 l9 -10" fill="none" stroke="var(--teal-ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ""}`);
    }));
    s += tx(x0 + 2 * W, y0 + 4 * H + 24, "Ticked cells add up to 15. Darker blue = farther apart.", { f: "700 12px", c: "var(--text-faint)" });
    return svg(400, 280, s);
  };

  const treeFig = () => {
    const lx = (i) => 48 + i * 72;
    const L1 = [["B", [["C", "ABCD"], ["D", "ABDC"]]], ["C", [["B", "ACBD"], ["D", "ACDB"]]], ["D", [["B", "ADBC"], ["C", "ADCB"]]]];
    let s = "", leaf = 0;
    const rootX = (lx(0) + lx(5)) / 2;
    L1.forEach(([c1, kids], i) => {
      const x1 = (lx(i * 2) + lx(i * 2 + 1)) / 2;
      s += ln(rootX, 34, x1, 82, "var(--line-2)", 2.5);
      kids.forEach(([c2, str]) => {
        const x = lx(leaf++);
        s += ln(x1, 82, x, 138, "var(--line-2)", 2.5) + ln(x, 138, x, 178, "var(--line-2)", 2.5);
      });
    });
    leaf = 0;
    s += ci(rootX, 26, 16, { s: "var(--teal)", sw: 3 }) + tx(rootX, 31, "A", { f: "900 14px" });
    L1.forEach(([c1, kids], i) => {
      const x1 = (lx(i * 2) + lx(i * 2 + 1)) / 2;
      s += ci(x1, 82, 15) + tx(x1, 87, c1, { f: "900 14px" });
      kids.forEach(([c2, str]) => {
        const x = lx(leaf++);
        s += ci(x, 138, 15) + tx(x, 143, c2, { f: "900 14px" }) + hit(str, `${rc(x - 31, 178, 62, 30, { r: 9, s: "var(--blue)", sw: 2.5 })}${tx(x, 199, str, { f: "900 14px" })}`);
      });
    });
    s += tx(235, 232, "Each path from the top is one tour that starts at A. The last city is forced.", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 242, s);
  };

  const workedFig = () => {
    const st = ["List the 7 cities in a row: 7! = 5,040 orders", "Any city could start the same loop, so ÷ 6: 840", "A loop and its reverse match, so ÷ 2: 420", "So there are 420 distinct tours"];
    let s = "";
    st.forEach((t, i) => (s += hit("s" + (i + 1), `${rc(10, 8 + i * 56, 440, 46, { r: 12, s: "var(--blue)", sw: 2.5 })}${ci(36, 31 + i * 56, 14, { f: "var(--blue-dim)", s: "var(--blue)", sw: 2 })}${tx(36, 36 + i * 56, i + 1, { f: "900 14px" })}${tx(60, 36 + i * 56, t, { a: "start", f: "800 14px" })}`)));
    return svg(460, 236, s);
  };

  const hopFig = () => {
    const G = [2, 2, 2, 4, 4, 11], O = [3, 4, 2, 3, 3, 2], U = 14;
    const bar = (t, a, y) => {
      let s = tx(30, y - 10, t, { a: "start", f: "800 13px" }), x = 30;
      a.forEach((v, i) => { s += rc(x, y, v * U, 40, { f: i % 2 ? "var(--teal-dim)" : "var(--blue-dim)", s: i % 2 ? "var(--teal)" : "var(--blue)", sw: 2.5, r: 0 }) + tx(x + (v * U) / 2, y + 26, v, { f: "900 14px" }); x += v * U; });
      return s;
    };
    return svg(460, 150, bar("Nearest-neighbour tour: the six hops in order", G, 30) + bar("Best tour: the six hops in order", O, 98));
  };

  B.add("l3-tsp", [
    { type: "pick", q: "The table gives the distance for each pair of five cities. A student adds up the tour A → C → B → E → D → A using the ticked cells, and gets 15. One cell the tour needs is not ticked. Click it.",
      fig: triFig(), a: "AD",
      hint: "List the five hops of the closed tour: A–C, C–B, B–E, E–D, and then the hop home.",
      why: "The closed tour uses AC (7), BC (3), BE (2), DE (3) and the way home, D back to A (5). The student ticked only the first four, 15 in all, and forgot the return hop. The true length is 20. A tour is a loop, so the last city always has one more hop back to the start." },
    { type: "pick", q: "The tree lists every ordered tour of four cities that starts at A. A student writes the loop A → C → D → B → A as ACDB. Click the other leaf that is the same loop travelled the opposite way round.",
      fig: treeFig(), a: "ABDC",
      hint: "Read ACDB backwards starting from A: A, then B, then D, then C.",
      why: "Going round the loop the other way from A visits B, D, C: that is ABDC. The six leaves pair up into three loops (ABCD with ADCB, ABDC with ACDB, ACBD with ADBC), so there are 3!/2 = 3 distinct tours, not 6." },
    { type: "pick", q: "A student works out how many distinct round trips there are for 7 cities. Exactly one step is wrong. Click it.",
      fig: workedFig(), a: "s2",
      hint: "Fixing the starting city means dividing by how many cities could have been the start.",
      why: "There are 7 possible starting cities for the same loop, so step 2 should divide by 7, not 6: 5,040 ÷ 7 = 720. Halving for direction gives 360, which is (7 − 1)! ÷ 2. The student's 420 is too big. Step 1 and step 3 are correct." },
    { type: "slider", q: "Each bar shows the six hop lengths of one tour of the same six cities, in order. About how many per cent longer is the nearest-neighbour tour than the best tour?",
      fig: hopFig(), min: 0, max: 120, step: 5, ans: 45, tol: 10, unit: "%",
      hint: "Add each bar's numbers. A tour 50% longer than 17 would be 25.5.",
      why: "Nearest-neighbour: 2 + 2 + 2 + 4 + 4 + 11 = 25. Best: 3 + 4 + 2 + 3 + 3 + 2 = 17. 25 is about 47% more than 17. The greedy tour spent only 14 on its first five hops, but those cheap hops used up the nearby cities and left a 11-long hop home, longer than any hop of the best tour (its longest is 4)." },
  ]);

  /* ======================================================================
     l3-hc : small-multiple runs, restart flow chart, bit-string transitions, scatter
     ====================================================================== */
  const hcF = (x) => (x <= 8 ? x : x <= 24 ? 8 : x - 16); // slope to 8, plateau 8..24, then slope up (x = 30 gives 14)
  const hcRun = (eq, seed, n = 80) => { let s = seed; const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); let x = 0; const tr = [hcF(x)];
    for (let i = 0; i < n; i++) { const y = x + (R() < 0.5 ? -1 : 1); if (y >= 0 && y <= 30 && (hcF(y) > hcF(x) || (eq && hcF(y) === hcF(x)))) x = y; tr.push(hcF(x)); }
    return tr; };
  const hcPanels = () => {
    const runs = { A: hcRun(false, 193), B: hcRun(true, 193) }, Y = (v) => 170 - v * 9;
    let s = "";
    [["A", 40], ["B", 270]].forEach(([k, px]) => {
      const X = (e) => px + e * 2.2;
      s += rc(px - 6, 26, 196, 150, { r: 8, s: "var(--line)", f: "var(--bg-2)" }) + tx(px + 92, 18, "Run " + k, { f: "900 14px" });
      [0, 7, 14].forEach((v) => (s += ln(px - 4, Y(v), px + 188, Y(v), "var(--line)", 1) + (k === "A" ? tx(px - 10, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) : "")));
      s += pl(runs[k].map((v, e) => [X(e), Y(v)]), k === "A" ? "var(--blue)" : "var(--amber)", 3.5);
      s += tx(px + 92, 196, "evaluations 0 to 80", { f: "700 11px", c: "var(--text-faint)" });
    });
    s += `<text transform="translate(12,100) rotate(-90)" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">fitness</text>`;
    s += ["A", "B"].map((k, i) => hit("run" + k, rc(34 + i * 230, 22, 208, 158, { f: "transparent", s: "transparent", sw: 2, r: 12 }))).join("");
    return svg(470, 206, s);
  };

  const restartFlow = () => {
    const bx = (x, y, a, b) => rc(x - 58, y - 24, 116, 48, { r: 12, s: "var(--violet)", sw: 2.5 }) + (b ? tx(x, y - 3, a, { f: "800 12px" }) + tx(x, y + 13, b, { f: "800 12px" }) : tx(x, y + 5, a, { f: "800 13px" }));
    const a1 = (x1, y1, x2, y2) => ln(x1, y1, x2, y2, "var(--text-faint)", 3).replace("/>", ` marker-end="url(#hfa)"/>`);
    let s = mark("hfa");
    const n = (id, x, y, a, b) => hit(id, bx(x, y, a, b));
    s += a1(131, 50, 168, 50) + a1(289, 50, 326, 50) + a1(388, 76, 388, 140) + a1(326, 170, 289, 170);
    s += `<path d="M388 196 V218 H72 V80" fill="none" stroke="var(--text-faint)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#hfa)"/>`;
    s += tx(300, 212, "yes: restart", { f: "700 12px", c: "var(--text-faint)" }) + tx(308, 160, "no", { f: "700 12px", c: "var(--text-faint)" });
    s += n("start", 72, 50, "Pick a", "random start") + n("climb", 230, 50, "Climb until no", "better neighbour") + n("save", 388, 50, "Save the final", "tour as the result") + n("time", 388, 170, "Time left?") + n("ret", 230, 170, "Return the", "result");
    return svg(470, 232, s);
  };

  const bitsTable = () => {
    const R = [["0100 1010", "0110 1010"], ["1011 0001", "1011 0101"], ["1110 0000", "1110 0000"], ["0111 1100", "0101 1100"], ["0001 0110", "1111 0110"], ["1100 1111", "1101 1111"]];
    return `<div style="max-width:360px"><table class="t"><tr><th>Row</th><th>Before</th><th>After one step</th></tr>${R.map((r, i) => `<tr><td>${i + 1}</td><td style="font-family:var(--mono);font-weight:800">${r[0]}</td><td style="font-family:var(--mono);font-weight:800">${r[1]}</td></tr>`).join("")}</table></div>`;
  };

  const SC = [[5, 40], [12, 65], [8, 90], [20, 40], [18, 65], [25, 90], [30, 40], [14, 65], [22, 40], [35, 65], [10, 40], [28, 90], [33, 40], [40, 65], [15, 90], [37, 40], [26, 65], [45, 90], [9, 40], [32, 90]];
  const scatterFig = () => {
    const X = (v) => 56 + v * 7.6, Y = (v) => 190 - (v - 30) * 2.4;
    let s = ln(56, 190, 440, 190, "var(--text-faint)", 2.5) + ln(56, 30, 56, 190, "var(--text-faint)", 2.5);
    [0, 10, 20, 30, 40, 50].forEach((v) => (s += ln(X(v), 190, X(v), 196, "var(--text-faint)", 2) + tx(X(v), 212, v, { f: "700 12px", c: "var(--text-faint)" })));
    [40, 65, 90].forEach((v) => (s += tx(50, Y(v) + 4, v, { a: "end", f: "700 12px", c: "var(--text-faint)" }) + ln(56, Y(v), 440, Y(v), "var(--line)", 1, "4 4")));
    SC.forEach(([a, b]) => (s += ci(X(a), Y(b), 6.5, { f: "var(--blue)", s: "var(--blue-ink)", sw: 1.5 })));
    s += tx(250, 232, "fitness at the start of the run", { f: "700 12px", c: "var(--text-faint)" });
    s += `<text transform="translate(12,110) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">fitness where it stopped</text>`;
    return svg(470, 242, s);
  };

  B.add("l3-hc", [
    { type: "pick", q: "Two hillclimbers start from the same point on the same landscape. One accepts a mutant that is equal in fitness, the other accepts only strictly better ones. Click the run that accepts equal moves.",
      fig: hcPanels(), a: "runB",
      hint: "Both runs are the same until they reach a flat stretch. What can each do there?",
      why: "The runs are identical until evaluation 12, when both reach the flat plateau. Run A never moves again, because on a plateau every neighbour is merely equal and a strict climber rejects it. Run B keeps accepting equal moves, drifts across the plateau, and at about evaluation 50 steps off its far edge and climbs again to 14." },
    { type: "pick", q: "This hillclimber with restarts returns poor answers even though some of its runs find excellent tours: it returns the tour the last run happened to end on. Click the box that should change.",
      fig: restartFlow(), a: "save",
      hint: "Which box decides what is remembered between runs?",
      why: "Saving every run's final tour as 'the result' overwrites an earlier, better one. The Save box should keep the new tour only if it is better than the best saved so far. Starting, climbing, the time check and returning are all fine." },
    { type: "cat", q: "A hillclimber flips one random bit and keeps the mutant if its fitness is equal or better. Fitness is the number of 1s among the first four bits (the last four bits do not count). Sort each row: what is it?",
      fig: bitsTable(),
      buckets: ["An improvement", "Sideways or no move", "Impossible for this hillclimber"],
      items: [["Row 1", 0], ["Row 2", 1], ["Row 3", 1], ["Row 4", 2], ["Row 5", 2], ["Row 6", 0]],
      hint: "Count how many bits changed, then count the 1s in the first four bits before and after.",
      why: "Rows 1 and 6 flip a single bit among the first four from 0 to 1, a gain. Row 2 flips a bit in the right half (fitness unchanged), and row 3 is a mutant that was rejected, so nothing moves: both are fine because equal moves are accepted. Row 4 loses a 1 (3 to 2), which a hillclimber never keeps. Row 5 changes three bits at once, which one-bit mutation cannot do, even though fitness rose from 1 to 4." },
    { type: "slider", q: "Each dot is one hillclimber run: across is the fitness it started at, up is the fitness where it stopped. The global optimum has fitness 90. About how many restarts would you expect to need before one reaches it?",
      fig: scatterFig(), min: 1, max: 10, step: 1, ans: 3, tol: 1, unit: "restarts",
      hint: "Count the dots on the top dashed line out of 20 dots. About one in three?",
      why: "6 of the 20 runs end at 90, so each restart succeeds about 30% of the time and you expect about 20 ÷ 6 ≈ 3 restarts. Notice where a run ends depends on which hill it started on, not how high it started: some of the best starting points (fitness 33 and 37) get stuck at 40, while a start at 8 reaches 90." },
  ]);

  /* ======================================================================
     l3-landscape : heat-map grid, curve with step size, grid small multiples, basin strip
     ====================================================================== */
  const LGRID = [[10, 14, 18, 16, 12, 9], [15, 31, 20, 22, 19, 24], [11, 22, 27, 33, 21, 17], [13, 26, 40, 44, 35, 20], [8, 29, 25, 38, 30, 16], [6, 12, 14, 23, 18, 11]];
  const heatFig = () => {
    const W = 52, H = 44, x0 = 14, y0 = 10;
    let s = "";
    LGRID.forEach((row, r) => row.forEach((v, c) => (s += hit(`r${r}c${c}`, `${rc(x0 + c * W + 2, y0 + r * H + 2, W - 4, H - 4, { f: "var(--blue)", o: 0.06 + (v / 44) * 0.55, s: "var(--line-2)", sw: 2, r: 8 })}${tx(x0 + c * W + W / 2, y0 + r * H + H / 2 + 6, v, { f: "900 16px" })}`))));
    return svg(340, 280, s);
  };

  const gOf = (x, c, w, h) => h * Math.exp(-(((x - c) / w) ** 2));
  const hillF = (x) => 10 + gOf(x, 24, 9, 60) + gOf(x, 66, 10, 90);
  const hillFig = () => {
    const X = (x) => 40 + x * 4, Y = (f) => 200 - f * 1.6, pts = [];
    for (let x = 0; x <= 100; x += 1) pts.push([X(x), Y(hillF(x))]);
    let s = `<path d="M${X(0)} 200 ${pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")} L${X(100)} 200 Z" fill="var(--teal-dim)"/>` + pl(pts, "var(--teal)", 3.5);
    s += ln(40, 200, 440, 200, "var(--text-faint)", 2.5);
    [0, 20, 40, 60, 80, 100].forEach((x) => (s += ln(X(x), 200, X(x), 206, "var(--text-faint)", 2) + tx(X(x), 222, x, { f: "700 12px", c: "var(--text-faint)" })));
    s += ln(40, Y(70), 440, Y(70), "var(--rose)", 2, "6 5") + tx(444, Y(70) - 6, "70", { a: "end", f: "800 12px", c: "var(--rose-ink)" });
    s += ci(X(24), Y(70), 9, { f: "var(--rose)", s: "var(--panel)", sw: 2 }) + tx(X(24), Y(70) - 16, "you are here", { f: "800 12px", c: "var(--rose-ink)" });
    s += tx(240, 242, "x (the value being tuned), fitness is the height", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 252, s);
  };

  const spaceFig = () => {
    const G = 12, C = 10, R = rng(23);
    const val = { A: (r, c) => 1 - Math.min(1, Math.hypot(r - 5.5, c - 5.5) / 7.5), B: () => R(), C: (r, c) => (r === 3 && c === 8 ? 1 : 0.04) };
    let s = "";
    [["A", 14], ["B", 164], ["C", 314]].forEach(([k, px]) => {
      s += tx(px + 60, 16, "Space " + k, { f: "900 14px" });
      for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) s += rc(px + c * C, 26 + r * C, C - 1, C - 1, { f: "var(--blue)", o: 0.05 + 0.85 * val[k](r, c), s: "none", sw: 0, r: 2 });
    });
    s += ["A", "B", "C"].map((k, i) => hit(k, rc(10 + i * 150, 22, 128, 128, { f: "transparent", s: "transparent", sw: 2, r: 10 }))).join("");
    s += tx(235, 172, "each small square is one solution; darker blue = fitter", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 182, s);
  };

  const basinFig = () => {
    const parts = [["90", 10, "teal"], ["70", 45, "blue"], ["60", 30, "amber"], ["40", 15, "violet"]];
    let x = 20, s = tx(20, 22, "share of random starts that climb to the peak of height…", { a: "start", f: "800 13px" });
    parts.forEach(([t, p, c]) => { const w = p * 4.2; s += rc(x, 34, w, 44, { f: `var(--${c}-dim)`, s: `var(--${c})`, sw: 2.5, r: 0 }) + tx(x + w / 2, 54, p + "%", { f: "900 14px" }) + tx(x + w / 2, 70, t, { f: "700 11px", c: "var(--text-dim)" }); x += w; });
    return svg(470, 96, s);
  };

  B.add("l3-landscape", [
    { type: "pick", q: "The grid shows fitness (higher is better, darker is fitter). A move goes to the cell directly above, below, left or right, never diagonally. Click every local optimum.",
      fig: heatFig(), a: ["r1c1", "r1c5", "r3c3", "r4c1"],
      hint: "A local optimum is higher than every neighbour it can move to. Check each cell's four neighbours only.",
      why: "The cells 31, 24, 44 and 29 each beat all of their up, down, left and right neighbours. 29 is the trap: the diagonal cell 40 is higher, but diagonals are not moves, so a hillclimber is stuck there. Every other cell has a higher neighbour to climb to. The global optimum is 44." },
    { type: "slider", q: "A hillclimber tunes x. Each mutation moves x by exactly the step size, to the left or right, and the move is kept only if fitness is higher than now (70, the dashed line). About how large must the step be to escape the peak at x = 24?",
      fig: hillFig(), min: 0, max: 100, step: 2, ans: 36, tol: 8, unit: "units",
      hint: "Slide along from 24 to the right: where does the curve first rise above the dashed line again?",
      why: "To escape, a step has to land on a point fitter than 70. The second hill first rises above 70 at about x = 60, which is 36 away from 24. Smaller steps land in the valley (lower fitness) and are rejected, and a step to the left would leave the range. The step size sets which valleys can be crossed." },
    { type: "pick", q: "Each square is a search space. Every small square is one solution, and darker blue means fitter. Click the space where a hillclimber with small moves has the biggest advantage over random guessing.",
      fig: spaceFig(), a: "A",
      hint: "A hillclimber needs the fitness of nearby solutions to tell it which way to go.",
      why: "In A, nearby solutions have similar fitness, so each small move shows which way is uphill and the climber walks to the peak. In B every solution is unrelated to its neighbours, so a move tells you nothing and guessing is as good. In C everything is flat except one needle, so there is no slope to follow." },
    { q: "A hillclimber's random start climbs to one of four peaks. The bar shows how many starts end at each peak. You run it 3 times and report the best of the three results. Which peak value are you most likely to report?",
      fig: basinFig(),
      o: ["40", "60", "70", "90"], a: 2,
      hint: "A single run misses the 90 peak 9 times in 10. Missing it three runs in a row is about 0.9 × 0.9 × 0.9, about 0.7.",
      why: "The chance that at least one run reaches 90 is only 1 − 0.9³ ≈ 27%. The chance the best is 70 is 0.9³ − 0.55³ ≈ 56%, the chance it is 60 is about 15%, and 40 is under 1%. The biggest basin is not the best peak, and a few restarts usually return a good but not the best solution." },
  ]);

  /* ======================================================================
     l3-neighbourhood : adjacency matrix, two bar charts, directed graph, tape strip
     ====================================================================== */
  const matrixFig = () => {
    const S = ["000", "001", "010", "011", "100", "101", "110", "111"];
    const C = 38, x0 = 62, y0 = 46, diff = (a, b) => [...a].filter((c, i) => c !== b[i]).length;
    let s = tx(x0 + 4 * C, 16, "is the column a neighbour of the row?", { f: "700 12px", c: "var(--text-faint)" });
    S.forEach((a, i) => { s += tx(x0 + i * C + C / 2, 38, a, { f: "800 12px", c: "var(--text-dim)" }) + tx(x0 - 8, y0 + i * C + C / 2 + 4, a, { a: "end", f: "800 12px", c: "var(--text-dim)" }); });
    S.forEach((a, i) => S.forEach((b, j) => (s += rc(x0 + j * C + 1, y0 + i * C + 1, C - 2, C - 2, { f: diff(a, b) === 2 ? "var(--blue)" : "var(--bg-2)", o: diff(a, b) === 2 ? 0.75 : 1, s: "var(--line)", sw: 1, r: 4 }))));
    return svg(380, 360, s);
  };

  const flipFig = () => {
    const A = [1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1], Bn = [34.9, 38.7, 19.4, 5.7, 1.1, 0.15, 0, 0, 0, 0, 0];
    const X = (k) => 40 + k * 38;
    let s = tx(235, 14, "Chart A: how many strings are k flips away", { f: "800 13px" }) + tx(235, 158, "Chart B: how often one mutation flips k bits (each bit flips with chance 0.1)", { f: "800 12px" });
    A.forEach((v, k) => { const h = (v * 80) / 252; s += rc(X(k), 110 - h, 28, h, { f: "var(--violet)", o: 0.35, s: "var(--violet)", sw: 2, r: 4 }) + tx(X(k) + 14, 106 - h, v, { f: "800 11px" }) + tx(X(k) + 14, 128, k, { f: "700 12px", c: "var(--text-faint)" }); });
    Bn.forEach((v, k) => { const h = Math.max(v * 2, 1.5); s += rc(X(k), 262 - h, 28, h, { f: "var(--amber)", o: 0.35, s: "var(--amber)", sw: 2, r: 4 }) + (v >= 1 ? tx(X(k) + 14, 258 - h, Math.round(v) + "%", { f: "800 11px" }) : "") + tx(X(k) + 14, 280, k, { f: "700 12px", c: "var(--text-faint)" }); });
    s += ln(34, 110, 462, 110, "var(--text-faint)", 2) + ln(34, 262, 462, 262, "var(--text-faint)", 2);
    s += tx(248, 298, "k = number of bits flipped", { f: "700 12px", c: "var(--text-faint)" });
    A.forEach((_, k) => (s += hit("a" + k, rc(X(k) - 3, 22, 34, 108, { f: "transparent", s: "transparent", sw: 2, r: 6 })) + hit("m" + k, rc(X(k) - 3, 176, 34, 106, { f: "transparent", s: "transparent", sw: 2, r: 6 }))));
    return svg(470, 306, s);
  };

  const DG = { N: { A: [50, 50, 6], B: [190, 50, 9], C: [330, 50, 4], D: [120, 175, 7], E: [260, 175, 8], F: [400, 175, 3] }, E: [["A", "B"], ["B", "C"], ["B", "D"], ["C", "E"], ["D", "A"], ["E", "D"], ["E", "F"]] };
  const digraphFig = () => {
    const R = 25;
    let s = mark("dga");
    DG.E.forEach(([a, b]) => {
      const [x1, y1] = DG.N[a], [x2, y2] = DG.N[b], L = Math.hypot(x2 - x1, y2 - y1), dx = (x2 - x1) / L, dy = (y2 - y1) / L;
      s += ln(x1 + dx * R, y1 + dy * R, x2 - dx * (R + 4), y2 - dy * (R + 4), "var(--text-faint)", 3).replace("/>", ` marker-end="url(#dga)"/>`);
    });
    Object.entries(DG.N).forEach(([k, [x, y, f]]) => (s += hit(k, `${ci(x, y, R, { s: "var(--blue)", sw: 3 })}${tx(x, y - 4, k, { f: "800 12px", c: "var(--text-dim)" })}${tx(x, y + 15, f, { f: "900 16px" })}`)));
    s += tx(235, 232, "arrow: a move the mutation can make. Number: fitness", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 242, s);
  };

  const tapeFig = () => {
    let s = tx(20, 18, "starting tour (position numbers above)", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    [..."ABCDEF"].forEach((c, i) => (s += tx(80 + i * 60 + 22, 44, i + 1, { f: "700 12px", c: "var(--text-faint)" }) + rc(80 + i * 60, 52, 44, 44, { f: "var(--blue)", o: 0.2, s: "var(--blue)", sw: 2.5, r: 8 }) + tx(80 + i * 60 + 22, 81, c, { f: "900 18px" })));
    return svg(470, 108, s);
  };

  B.add("l3-neighbourhood", [
    { q: "The grid shows a mutation operator on 3-bit strings: a row is a string and a filled square marks a string that the operator can turn it into. Which operator is it?",
      fig: matrixFig(), o: ["Flip exactly one bit", "Flip exactly two bits", "Flip all three bits", "Swap two neighbouring bits"], a: 1,
      hint: "Look at the row 000. Which strings is it joined to, and how many bits differ from 000?",
      why: "Every row has three filled squares, and they are the strings that differ from the row in exactly two bits (000 is joined to 011, 101 and 110). One-bit flips would fill 001, 010 and 100 instead. Flipping all bits would fill one square per row, and swapping neighbouring bits would leave the rows 000 and 111 empty." },
    { type: "pick", q: "A 10-bit string is mutated by flipping each bit independently with chance 0.1. Chart A counts the strings that lie k flips away, and chart B shows how often this mutation flips exactly k bits. Click the number of flips that the mutation makes most often.",
      fig: flipFig(), a: "m1",
      hint: "On average a mutation flips 10 × 0.1 = 1 bit.",
      why: "The big pile in chart A (252 strings at k = 5) is only a head-count of what could be reached. Flipping five bits has a chance of 0.15%, while one flip happens 39% of the time (and no change 35%, two flips 19%). The operator samples its neighbours unevenly, mostly close ones, so a huge neighbourhood on paper may rarely be explored." },
    { type: "pick", q: "In this search each arrow is a move that the mutation can make from one solution to another. A solution is a local optimum when none of its moves goes to a fitter solution (higher is better). Click every local optimum.",
      fig: digraphFig(), a: ["B", "D", "E", "F"],
      hint: "Only follow the arrows leaving a solution. Arrows pointing into it do not matter.",
      why: "B (9) moves only to C (4) and D (7), D (7) moves only to A (6), and E (8) moves only to D (7) and F (3), so all three are stuck. F has no moves out at all, so a hillclimber stops there even though F is the worst solution. A (6) can reach B (9) and C (4) can reach E (8), so they are not local optima." },
    { type: "cat", q: "The tour in the strip is changed by one mutation. Positions count along the string, with no wrap-around. Sort each result.",
      fig: tapeFig(),
      buckets: ["One swap of neighbouring positions", "One swap of far-apart positions", "More than one swap needed"],
      items: [["ACBDEF", 0], ["ABCDFE", 0], ["AECDBF", 1], ["FBCDEA", 1], ["ABFEDC", 2], ["BADCFE", 2]],
      hint: "Count how many positions hold a different letter from ABCDEF. If exactly two, are they next to each other?",
      why: "ACBDEF and ABCDFE differ in two neighbouring positions (2 and 3, 5 and 6). AECDBF differs in positions 2 and 5, and FBCDEA in positions 1 and 6: two positions that are not neighbours in the string. ABFEDC differs in four positions (the last four are reversed), and BADCFE differs in six (three separate swaps), so neither is a single swap." },
  ]);

  /* ======================================================================
     l3-local : tabu queue and cost strip, stacked outcome bars, probability tree, tenure traces
     ====================================================================== */
  const tabuFig = () => {
    let s = tx(20, 18, "Tabu list (oldest first, newest last)", { a: "start", f: "800 13px" });
    ["bit 5", "bit 2", "bit 6"].forEach((t, i) => (s += rc(20 + i * 84, 28, 74, 38, { f: "var(--violet)", o: 0.18, s: "var(--violet)", sw: 2.5, r: 10 }) + tx(57 + i * 84, 53, t, { f: "900 14px" })));
    s += tx(290, 52, "newest joins on the right", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    s += tx(20, 106, "Cost change if this bit is flipped (a minus is cheaper)", { a: "start", f: "800 13px" });
    [["bit 1", "+2"], ["bit 2", "−4"], ["bit 3", "+1"], ["bit 4", "−1"], ["bit 5", "−3"], ["bit 6", "−5"]].forEach(([b, d], i) => {
      s += rc(20 + i * 70, 116, 64, 58, { f: "var(--panel)", s: "var(--line-2)", sw: 2.5, r: 10 }) + tx(52 + i * 70, 136, b, { f: "800 12px", c: "var(--text-dim)" }) + tx(52 + i * 70, 161, d, { f: "900 18px", c: d[0] === "+" ? "var(--rose-ink)" : "var(--teal-ink)" });
    });
    return svg(450, 188, s);
  };

  const outcomeFig = () => {
    const U = 3.6, parts = [["var(--teal-dim)", "var(--teal)"], ["var(--amber-dim)", "var(--amber)"], ["var(--bg-2)", "var(--line-2)"]];
    const bar = (id, t, a, y) => {
      let s = tx(30, y - 10, t, { a: "start", f: "800 13px" }), x = 30;
      a.forEach((v, i) => { s += rc(x, y, v * U, 44, { f: parts[i][0], s: parts[i][1], sw: 2.5, r: 0 }) + tx(x + (v * U) / 2, y + 28, v, { f: "900 15px" }); x += v * U; });
      return s + hit(id, rc(26, y - 4, 100 * U + 8, 52, { f: "transparent", s: "transparent", sw: 2, r: 8 }));
    };
    let s = bar("A", "Run A: 100 steps", [40, 24, 36], 34) + bar("B", "Run B: 100 steps", [70, 15, 15], 112);
    [["var(--teal-dim)", "var(--teal)", "better: moved"], ["var(--amber-dim)", "var(--amber)", "worse: accepted"], ["var(--bg-2)", "var(--line-2)", "worse: rejected"]].forEach(([f, st, t], i) => (s += rc(30 + i * 140, 176, 16, 16, { f, s: st, sw: 2, r: 3 }) + tx(52 + i * 140, 189, t, { a: "start", f: "700 12px", c: "var(--text-dim)" })));
    return svg(470, 204, s);
  };

  const treeProbFig = () => {
    const bx = (x, y, a, b, c) => rc(x - 60, y - 22, 120, 44, { r: 11, s: `var(--${c})`, sw: 2.5 }) + tx(x, y - 3, a, { f: "800 12px" }) + tx(x, y + 13, b, { f: "800 12px" });
    let s = ln(130, 100, 175, 52, "var(--line-2)", 2.5) + ln(130, 100, 175, 148, "var(--line-2)", 2.5) + ln(295, 48, 340, 48, "var(--line-2)", 2.5) + ln(295, 152, 340, 122, "var(--line-2)", 2.5) + ln(295, 152, 340, 188, "var(--line-2)", 2.5);
    s += bx(70, 100, "pick one random", "neighbour", "blue") + bx(235, 48, "neighbour is", "better", "teal") + bx(235, 152, "neighbour is", "worse", "rose") + bx(400, 48, "move: cost", "falls", "teal") + bx(400, 122, "accept: cost", "goes up", "amber") + bx(400, 188, "reject: stay", "put", "line-2");
    s += tx(138, 64, "0.25", { f: "900 13px", c: "var(--teal-ink)" }) + tx(138, 146, "0.75", { f: "900 13px", c: "var(--rose-ink)" });
    s += tx(300, 118, "p = 0.2", { f: "900 13px", c: "var(--amber-ink)" }) + tx(312, 196, "0.8", { f: "900 13px", c: "var(--text-dim)" });
    return svg(470, 220, s);
  };

  // real tabu runs on an 8-bit problem (same start, tabu list holds the last 1 or 6 solutions visited)
  const TT = { P: [57, 39, 41, 48, 41, 45, 45, 47, 49, 58, 45, 44, 36, 40, 29, 38, 37, 31, 37, 27, 31, 36, 41, 43, 45, 37, 32, 45, 47, 36, 37], Q: [57, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41, 48, 41, 39, 41] };
  const tenureFig = () => {
    const Y = (c) => 130 - (c - 20) * 2.4;
    let s = "";
    [["P", 44], ["Q", 270]].forEach(([k, px]) => {
      const X = (i) => px + i * 5.8;
      s += rc(px - 6, 26, 194, 118, { r: 8, s: "var(--line)", f: "var(--bg-2)" }) + tx(px + 91, 18, "Run " + k, { f: "900 14px" });
      [30, 40, 50].forEach((v) => (s += ln(px - 4, Y(v), px + 186, Y(v), "var(--line)", 1) + (k === "P" ? tx(px - 10, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) : "")));
      s += pl(TT[k].map((v, i) => [X(i), Y(v)]), k === "P" ? "var(--violet)" : "var(--blue)", 3);
      s += tx(px + 91, 164, "steps 0 to 30", { f: "700 11px", c: "var(--text-faint)" });
    });
    s += `<text transform="translate(12,85) rotate(-90)" text-anchor="middle" style="font:700 11px var(--sans);fill:var(--text-faint)">cost</text>`;
    s += ["P", "Q"].map((k, i) => hit(k, rc(38 + i * 226, 22, 206, 126, { f: "transparent", s: "transparent", sw: 2, r: 12 }))).join("");
    return svg(470, 176, s);
  };

  B.add("l3-local", [
    { type: "multi", q: "Tabu search keeps the last 3 flipped bits on its list. Each step flips the cheapest bit that is NOT on the list, then adds it to the list (the oldest entry drops out). After this step, which bits will be tabu? Select all.",
      fig: tabuFig(), o: ["bit 1", "bit 2", "bit 3", "bit 4", "bit 5", "bit 6"], a: [1, 3, 5],
      hint: "Bits 5, 2 and 6 are on the list now, so their savings are not allowed. Pick the best of the rest, then update the list.",
      why: "The cheapest legal move is bit 4 (−1), because bits 2, 5 and 6 are tabu even though they would save more. Flipping bit 4 puts it on the list and pushes out the oldest entry, bit 5. The list is now bit 2, bit 6, bit 4." },
    { type: "pick", q: "Two Monte Carlo runs each made 100 steps. In every step the run looked at one random neighbour, and the bars sort the outcomes. p is the chance of accepting a worse neighbour. Click the run that used the larger p.",
      fig: outcomeFig(), a: "B",
      hint: "p only concerns worse neighbours. For each run: accepted worse ÷ (accepted worse + rejected).",
      why: "Run A met 60 worse neighbours and accepted 24 of them (0.4). Run B met only 30 and accepted 15 (0.5). Run A accepted more worse moves in total, but that is just because it met more of them, so the raw count is misleading. p is the accepted share of the worse neighbours." },
    { type: "slider", q: "A Monte Carlo search picks one random neighbour per step. A quarter of the neighbours are better; the other three quarters are worse and are accepted with p = 0.2. In about what percentage of steps does the cost go up?",
      fig: treeProbFig(), min: 0, max: 50, step: 1, ans: 15, tol: 5, unit: "%",
      hint: "Follow the lower branch: three quarters of the time, then one fifth of that.",
      why: "The cost goes up only along the path 'worse' (0.75) then 'accept' (0.2): 0.75 × 0.2 = 0.15, so about 15% of steps. The other worse neighbours (0.75 × 0.8 = 0.6) are rejected and the search stays put, and the better ones (0.25) are always taken." },
    { type: "pick", q: "Two tabu searches start from the same 8-bit solution and always move to the cheapest solution that is not on their list (cost is minimised). One list holds only the last 1 solution visited, the other the last 6. Click the run with the list of 1.",
      fig: tenureFig(), a: "Q",
      hint: "A search that can only forbid one solution may soon wander back to where it was.",
      why: "Run Q repeats 41, 39, 41, 48 over and over: with a list of 1 it only avoids going straight back, so it falls into a four-step loop and never improves on 39. Run P's longer memory forbids the places it has just been, so it keeps exploring and finds a cost of 27." },
  ]);

  /* ======================================================================
     l3-population : pixel grid, lineage tree, scatter snapshots, lifespan Gantt
     ====================================================================== */
  const PIX = [[1, 0, 1, 1, 0, 0, 1, 0, 1, 1], [1, 1, 1, 0, 0, 1, 1, 0, 0, 1], [1, 0, 1, 1, 0, 1, 0, 1, 0, 1], [1, 1, 1, 0, 0, 0, 1, 0, 1, 1], [1, 0, 1, 1, 0, 1, 1, 0, 0, 1], [1, 1, 1, 0, 0, 0, 0, 0, 1, 1]];
  const pixFig = () => {
    const C = 28, x0 = 54, y0 = 40;
    let s = "";
    for (let c = 0; c < 10; c++) s += tx(x0 + c * C + C / 2, 32, c + 1, { f: "700 12px", c: "var(--text-faint)" });
    PIX.forEach((row, r) => { s += tx(x0 - 8, y0 + r * C + C / 2 + 5, "M" + (r + 1), { a: "end", f: "800 12px", c: "var(--text-dim)" }); row.forEach((v, c) => (s += rc(x0 + c * C + 1, y0 + r * C + 1, C - 2, C - 2, { f: v ? "var(--blue)" : "var(--bg-2)", o: v ? 0.7 : 1, s: "var(--line)", sw: 1, r: 4 }) + tx(x0 + c * C + C / 2, y0 + r * C + C / 2 + 5, v, { f: "800 13px" }))); });
    for (let c = 0; c < 10; c++) s += hit("c" + (c + 1), rc(x0 + c * C - 1, y0 - 3, C + 2, 6 * C + 6, { f: "transparent", s: "transparent", sw: 2, r: 6 }));
    s += tx(x0 + 5 * C, y0 + 6 * C + 32, "column number", { f: "700 12px", c: "var(--text-faint)" });
    return svg(370, 262, s);
  };

  const LIN = { p1: [1, 1, 1, 3, 1], p2: [0, 1, 3, 0, 2], p3: [0, 0, 2, 3, 4] };
  const lineageFig = () => {
    const X = [60, 170, 280, 390], Y = [50, 90, 130, 170, 210], P = [LIN.p1, LIN.p2, LIN.p3];
    let s = "";
    P.forEach((par, g) => par.forEach((p, i) => (s += ln(X[g] + 8, Y[p], X[g + 1] - 8, Y[i], "var(--line-2)", 2.5))));
    X.forEach((x, g) => { s += tx(x, 22, g === 0 ? "start" : "gen " + g, { f: "700 12px", c: "var(--text-faint)" }); Y.forEach((y, i) => { if (g) s += ci(x, y, 8, { s: "var(--line-2)", sw: 2 }); }); });
    "ABCDE".split("").forEach((c, i) => (s += hit(c, `${ci(X[0], Y[i], 16, { s: "var(--blue)", sw: 3 })}${tx(X[0], Y[i] + 5, c, { f: "900 14px" })}`)));
    s += tx(235, 246, "each dot has one parent: the line to its left", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 256, s);
  };

  const snapFig = () => {
    const R = rng(5), rnd = (a, b) => a + R() * (b - a), P = { big: [95, 45], small: [38, 98] };
    const dots = { A: Array.from({ length: 14 }, () => [rnd(8, 132), rnd(8, 132)]), B: [...Array.from({ length: 6 }, () => [P.big[0] + rnd(-9, 9), P.big[1] + rnd(-9, 9)]), ...Array.from({ length: 6 }, () => [P.small[0] + rnd(-8, 8), P.small[1] + rnd(-8, 8)])], C: Array.from({ length: 12 }, () => [P.small[0] + rnd(-9, 9), P.small[1] + rnd(-9, 9)]) };
    let s = "";
    [["A", 14], ["B", 164], ["C", 314]].forEach(([k, px]) => {
      s += rc(px, 26, 140, 140, { r: 10, s: "var(--line)", f: "var(--bg-2)" }) + tx(px + 70, 18, "Panel " + k, { f: "900 14px" });
      [10, 20, 30].forEach((r) => (s += ci(px + P.big[0], 26 + P.big[1], r, { f: "none", s: "var(--teal)", sw: 1.5 })));
      [8, 16, 24].forEach((r) => (s += ci(px + P.small[0], 26 + P.small[1], r, { f: "none", s: "var(--violet)", sw: 1.5 })));
      dots[k].forEach(([x, y]) => (s += ci(px + x, 26 + y, 4.5, { f: "var(--amber)", s: "var(--amber-ink)", sw: 1.5 })));
    });
    s += tx(235, 186, "rings: contour lines of two hills (tall green, lower purple). Dots: members", { f: "700 11px", c: "var(--text-faint)" });
    return svg(470, 196, s);
  };

  const ganttFig = () => {
    const X = (t) => 60 + t * 62, rows = [["P1", 5, 0, 2], ["P2", 8, 0, 3], ["P3", 3, 0, 1], ["P4", 6, 0, 4], ["C1", 7, 1, 5], ["C2", 9, 2, 6], ["C3", 10, 3, 6], ["C4", 8, 4, 6], ["C5", 12, 5, 6]];
    let s = "";
    for (let t = 0; t <= 6; t++) s += ln(X(t), 26, X(t), 238, "var(--line)", 1) + tx(X(t), 18, t, { f: "700 12px", c: "var(--text-faint)" });
    rows.forEach(([id, f, b, d], i) => {
      const y = 30 + i * 23, key = id.toLowerCase();
      s += tx(52, y + 15, id, { a: "end", f: "800 12px", c: "var(--text-dim)" });
      s += hit(key, `${rc(X(b), y, X(d) - X(b), 19, { f: d === 6 ? "var(--teal)" : "var(--blue)", o: 0.25, s: d === 6 ? "var(--teal)" : "var(--blue)", sw: 2.5, r: 6 })}${tx((X(b) + X(d)) / 2, y + 14, f, { f: "900 13px" })}`);
    });
    s += tx(X(3), 256, "time step (one child is born at each step)", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 266, s);
  };

  B.add("l3-population", [
    { type: "pick", q: "Six members of an EA population are drawn as rows of bits. Click every column where crossover alone can never again produce a different value.",
      fig: pixFig(), a: ["c1", "c3", "c5", "c10"],
      hint: "Crossover only copies bits that parents already carry. Which columns have no variety left?",
      why: "Crossover only shuffles values the parents already have. In columns 1, 3, 5 and 10 every member holds the same bit, so every child gets that bit too: only mutation could change it. Column 8 still has one member with a 1, so a child can inherit it, and the rest of the columns are mixed." },
    { type: "pick", q: "Each dot is one member and has one parent: the line to its left. Starting individuals are A to E. Click every starting individual that has no descendants left in generation 3.",
      fig: lineageFig(), a: ["A", "C", "E"],
      hint: "Follow lines rightwards from each start. Which ones never get a line out?",
      why: "A, C and E were never chosen as a parent, so they have no line out at all. B's line branches into most of generation 1, and D's single child survives to generation 3. Only B and D contribute to generation 3, so the population has lost the genes of the other three. Selection alone shrinks diversity over time." },
    { type: "match", q: "Each panel is a snapshot of an EA population on a landscape with two hills. Match each panel to what it shows.",
      fig: snapFig(),
      pairs: [["Panel A", "Just started: members spread out everywhere"], ["Panel B", "Searching both hills at once"], ["Panel C", "Converged on the lower hill"]],
      why: "Panel A has members all over the space, as in a random start. Panel B has groups near both peaks, which is a population exploring two hills in parallel (a single hillclimber could only follow one). In panel C every member sits on the lower hill. Unless mutation throws some far away, the taller hill will never be found: premature convergence." },
    { type: "pick", q: "A steady-state EA with a population of 4 should always replace the weakest member with the new child. Each bar is one individual's life (its fitness inside), and a child is born at each step. Exactly one replacement broke the rule. Click the bar that was replaced wrongly.",
      fig: ganttFig(), a: "p2",
      hint: "At step 3, which of the individuals alive had the lowest fitness?",
      why: "At step 3 the population was P2 (8), P4 (6), C1 (7) and C2 (9), so the weakest was P4 (6). But the child replaced P2 (8) and P4 stayed alive until step 4. The earlier replacements were right: the weakest died at steps 1, 2, 4 and 5 (3, 5, 6 and 7)." },
  ]);
})();

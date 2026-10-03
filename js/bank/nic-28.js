/* ===== bank-x-nic-2.js ===== */
/* Revision bank, third set of varied, visual questions (nic-2: l2-approx, l3-recipe, l3-tsp, l3-hc, l3-landscape,
   l3-neighbourhood, l3-local, l3-population). Every number is checked with node (see the notes beside each figure). */
(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});

  const B = NIC.bank;

  /* ---------- small SVG helpers (CSS variables so both themes work) ---------- */
  const svg = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${inner}</svg>`;
  const tx = (x, y, s, { a = "middle", c = "var(--text)", f = "800 13px" } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${a}" style="font:${f} var(--sans);fill:${c}">${s}</text>`;
  const ln = (x1, y1, x2, y2, c = "var(--line-2)", w = 2, d = "") =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const rc = (x, y, w, h, { f = "var(--panel)", s = "var(--line-2)", sw = 2, r = 8, o = 1 } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" fill-opacity="${o}" stroke="${s}" stroke-width="${sw}"/>`;
  const ci = (x, y, r, { f = "var(--panel)", s = "var(--line-2)", sw = 2.5 } = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
  const pl = (pts, c, w = 3, d = "") =>
    `<polyline points="${pts.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ""}/>`;
  const hit = (id, inner) => `<g data-pick="${id}">${inner}</g>`;
  const mark = (id) =>
    `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--text-faint)"/></marker></defs>`;
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  };
  const pow10 = (x, y, e, c = "var(--text-faint)") =>
    `<text x="${x}" y="${y}" text-anchor="middle" style="font:700 12px var(--sans);fill:${c}">10<tspan dy="-6" style="font-size:10px">${e}</tspan></text>`;

  /* ======================================================================
     l2-approx : number line, dot strips, pixel grid, column chart
     ====================================================================== */
  // log10 positions: day of checking at 1e9/s = 8.64e13 (13.94). Dots at 11.5, 12.7, 13.5 are under it; 14.3 (2e14 = 2.3 days), 15.6, 17.8 are over.
  const numLineFig = () => {
    const X = (e) => 40 + (e - 10) * 50;
    let s = ln(30, 120, 450, 120, "var(--text-faint)", 3);
    for (let e = 10; e <= 18; e++) s += ln(X(e), 114, X(e), 126, "var(--text-faint)", 2) + pow10(X(e), 146, e);
    [
      ["A", 11.5],
      ["B", 12.7],
      ["C", 13.5],
      ["D", 14.3],
      ["E", 15.6],
      ["F", 17.8],
    ].forEach(([k, e]) => {
      s +=
        ln(X(e), 92, X(e), 120, "var(--line-2)", 2, "3 4") +
        hit(k, `${ci(X(e), 76, 16, { s: "var(--blue)", sw: 3 })}${tx(X(e), 81, k, { f: "900 14px" })}`);
    });
    s += tx(245, 178, "designs in the problem (each tick is 10 times more)", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 190, s);
  };

  const STRIPS = {
    A: Array(10).fill(400),
    B: [412, 407, 455, 431, 468, 420, 409, 444, 426, 438],
    C: Array(10).fill(438),
  };
  const stripFig = () => {
    const Y = (v) => 175 - (v - 390) * 1.55;
    let s = "";
    [400, 440, 480].forEach(
      (v) =>
        (s +=
          tx(30, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) +
          ln(34, Y(v), 36, Y(v), "var(--text-faint)", 1.5)),
    );
    [
      ["A", 36],
      ["B", 176],
      ["C", 316],
    ].forEach(([k, px]) => {
      s +=
        rc(px, 26, 124, 164, { r: 10, s: "var(--line)", f: "var(--bg-2)" }) +
        tx(px + 62, 18, "Method " + k, { f: "900 14px" });
      s += ln(px + 4, Y(400), px + 120, Y(400), "var(--teal)", 2.5, "6 4");
      STRIPS[k].forEach(
        (v, i) => (s += ci(px + 12 + i * 11.2, Y(v), 4.5, { f: "var(--amber)", s: "var(--amber-ink)", sw: 1.5 })),
      );
    });
    ["A", "B", "C"].forEach(
      (k, i) => (s += hit(k, rc(34 + i * 140, 22, 128, 172, { f: "transparent", s: "transparent", sw: 2, r: 12 }))),
    );
    s += tx(235, 210, "each dot: route length (km) from one of 10 runs. Dashed green: the best possible, 400 km", {
      f: "700 11px",
      c: "var(--text-faint)",
    });
    return svg(470, 220, s);
  };

  const gridFig = () => {
    const R = rng(11),
      C = 26,
      x0 = 8,
      y0 = 8;
    const cost = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 35 + Math.floor(R() * 58)));
    cost[2][6] = 31;
    let s = "";
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 10; c++) {
        const x = x0 + c * C,
          y = y0 + r * C;
        if (r < 4)
          s +=
            rc(x, y, C - 2, C - 2, {
              f: "var(--blue)",
              o: 0.12 + ((93 - cost[r][c]) / 58) * 0.55,
              s: r === 2 && c === 6 ? "var(--teal)" : "var(--line)",
              sw: r === 2 && c === 6 ? 3.5 : 1,
              r: 4,
            }) + tx(x + C / 2 - 1, y + C / 2 + 4, cost[r][c], { f: "800 11px" });
        else s += rc(x, y, C - 2, C - 2, { f: "var(--bg-2)", s: "var(--line)", sw: 1, r: 4 });
      }
    s +=
      rc(290, 22, 22, 22, { f: "var(--blue)", o: 0.45, s: "var(--line)", sw: 1, r: 4 }) +
      tx(322, 38, "checked: 40 designs", { a: "start" });
    s +=
      rc(290, 58, 22, 22, { f: "var(--bg-2)", s: "var(--line)", sw: 1, r: 4 }) +
      tx(322, 74, "not checked: 60", { a: "start" });
    s +=
      rc(290, 94, 22, 22, { f: "none", s: "var(--teal)", sw: 3.5, r: 4 }) +
      tx(322, 110, "best so far: 31", { a: "start" });
    s +=
      tx(290, 150, "Number = cost of the design.", { a: "start", f: "700 12px", c: "var(--text-faint)" }) +
      tx(290, 168, "Darker blue = cheaper.", { a: "start", f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 276, s);
  };

  const colFig = () => {
    let s = ln(40, 190, 440, 190, "var(--text-faint)", 2.5);
    for (let i = 0; i < 7; i++) {
      const h = 2 ** i,
        x = 56 + i * 54,
        bh = h * 2.2;
      s +=
        rc(x, 190 - bh, 38, bh, { f: "var(--amber)", o: 0.35, s: "var(--amber)", sw: 2.5, r: 5 }) +
        tx(x + 19, 190 - bh - 7, h + " h", { f: "900 13px" }) +
        tx(x + 19, 210, 40 + i, { f: "800 13px", c: "var(--text-dim)" });
    }
    s += tx(245, 232, "number of in-or-out items, n", { f: "700 12px", c: "var(--text-faint)" });
    s += `<text transform="translate(16,110) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">time to check every subset</text>`;
    return svg(470, 242, s);
  };

  B.add("l2-approx", [
    {
      type: "pick",
      q: "Each dot is the number of designs in a different problem. A computer checks one billion designs a second and you can wait one day. Click every problem you could solve by checking every design.",
      fig: numLineFig(),
      a: ["A", "B", "C"],
      hint: "A day is about 100,000 seconds, so one billion a second gives about 10 to the power 14 checks in total.",
      why: "A day has about 86,400 seconds, so a billion checks a second covers roughly 10¹⁴ designs. A, B and C sit to the left of that mark (C is about 3 × 10¹³, around nine hours of checking). D is about 2 × 10¹⁴, over two days. E needs about 46 days and F about 20 years, so those need an approximate method.",
    },
    {
      type: "pick",
      q: "Three methods each ran 10 times on the same routing problem. The dashed line is the proven best route, 400 km. Click the method for which running it again with a fresh random seed could give you a better answer.",
      fig: stripFig(),
      a: "B",
      hint: "Ask: does a second run give anything different from the first?",
      why: "Method A already lands on 400 km every time, so there is nothing to gain. Method C returns the same 438 km on every run, so a rerun just repeats it. Only B varies from run to run (407 to 468 km), so each extra run is a new chance to beat the last, and keeping the best of many runs pulls its answer towards the optimum.",
    },
    {
      q: "A search checks every design in order, row by row, and is stopped after 40 of the 100. The cheapest design so far costs 31 (outlined). What can you say about the cheapest of all 100 designs?",
      fig: gridFig(),
      o: [
        "It could be cheaper than 31, since 60 designs are unchecked",
        "It is exactly 31, because the search keeps the cheapest it has seen",
        "It is above 31, because the cheap rows are always checked first",
        "It is within a few per cent of 31, since 40 designs is a fair sample",
      ],
      a: 0,
      why: "Checking 40% of the designs proves nothing about the other 60%: any of them might cost less than 31. 31 is the best so far, not the best overall. An exhaustive search that is stopped early has become an approximate method with no guarantee. Only a finished search proves the optimum.",
    },
    {
      type: "slider",
      q: "The chart shows how long a computer needs to check every in-or-out choice for n items. A new computer is 1,000 times faster. About how many items could it handle in the same 1 hour?",
      fig: colFig(),
      min: 40,
      max: 70,
      step: 1,
      ans: 50,
      tol: 2,
      unit: "items",
      hint: "Each extra item doubles the time. 1,000 is close to 1,024, which is ten doublings (2 × 2 × 2 … ten times).",
      why: "Ten doublings multiply the time by 2¹⁰ = 1,024, about 1,000. A computer 1,000 times faster therefore buys only ten more items (40 to 50) in the same hour. For exponential problems, faster hardware helps very little, which is why we turn to approximate methods.",
    },
  ]);

  /* ======================================================================
     l3-recipe : flow diagram, 100% stacked bars, step line, small-multiple charts
     ====================================================================== */
  const recipeFlow = () => {
    const bx = (x, y, a, b) =>
      rc(x - 55, y - 23, 110, 46, { r: 12, s: "var(--blue)", sw: 2.5 }) +
      (b
        ? tx(x, y - 3, a, { f: "800 12px" }) + tx(x, y + 13, b, { f: "800 12px" })
        : tx(x, y + 5, a, { f: "800 13px" }));
    const arr = (id, x1, y1, x2, y2) =>
      hit(
        id,
        `${ln(x1, y1, x2, y2, "var(--text-faint)", 3).replace("/>", ` marker-end="url(#rfa)"/>`)}${ln(x1, y1, x2, y2, "transparent", 26)}`,
      );
    let s = mark("rfa");
    s +=
      bx(72, 50, "Make random", "population") + bx(230, 50, "Score every", "member") + bx(388, 50, "Select", "parents");
    s += bx(388, 170, "Crossover +", "mutation") + bx(230, 170, "Replace the", "weakest") + bx(72, 170, "Stop?");
    s +=
      arr("is", 127, 50, 170, 50) +
      arr("ss", 285, 50, 328, 50) +
      arr("sv", 388, 73, 388, 142) +
      arr("vr", 333, 170, 290, 170) +
      arr("rs", 175, 170, 132, 170);
    s += hit(
      "loop",
      `<path d="M72 147 V112 H350 V76" fill="none" stroke="var(--text-faint)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#rfa)"/><path d="M72 147 V112 H350 V76" fill="none" stroke="transparent" stroke-width="22"/>`,
    );
    s +=
      tx(210, 104, "no: go round again", { f: "700 12px", c: "var(--text-faint)" }) +
      tx(72, 208, "yes: return the best", { f: "700 12px", c: "var(--text-faint)" });
    return svg(470, 220, s);
  };

  const shareFig = () => {
    const rows = [
      ["Population 1: fitness 50, 51, 52, 53", [50, 51, 52, 53]],
      ["Population 2: fitness 0, 1, 2, 3", [0, 1, 2, 3]],
    ];
    const cols = [
      ["blue-dim", "blue"],
      ["teal-dim", "teal"],
      ["amber-dim", "amber"],
      ["violet-dim", "violet"],
    ];
    let s = "";
    rows.forEach(([t, f], r) => {
      const y = 36 + r * 88,
        tot = f.reduce((a, b) => a + b, 0);
      s += tx(30, y - 12, t, { a: "start", f: "800 13px" });
      let x = 30;
      f.forEach((v, i) => {
        const w = (380 * v) / tot;
        if (w > 0)
          s +=
            rc(x, y, w, 40, { f: `var(--${cols[i][0]})`, s: `var(--${cols[i][1]})`, sw: 2.5, r: 0 }) +
            tx(x + w / 2, y + 26, v, { f: "900 14px" });
        else s += tx(x - 6, y + 26, "0", { a: "end", f: "900 14px", c: "var(--text-faint)" });
        x += w;
      });
    });
    s += tx(30, 188, "bar length = each member's share of the parent picks", {
      a: "start",
      f: "700 12px",
      c: "var(--text-faint)",
    });
    return svg(450, 198, s);
  };

  // best fitness so far: jumps at generations 5, 12, 25, 31, 58 (levels 20, 35, 50, 58, 63)
  const stepFig = () => {
    const X = (g) => 50 + g * 1.95,
      Y = (f) => 200 - f * 2.3;
    const jumps = [
      [0, 12],
      [5, 20],
      [12, 35],
      [25, 50],
      [31, 58],
      [58, 63],
      [200, 63],
    ];
    const pts = [[X(0), Y(12)]];
    for (let i = 1; i < jumps.length; i++)
      pts.push([X(jumps[i][0]), Y(jumps[i - 1][1])], [X(jumps[i][0]), Y(jumps[i][1])]);
    let s = ln(50, 200, 445, 200, "var(--text-faint)", 2.5) + ln(50, 30, 50, 200, "var(--text-faint)", 2.5);
    [0, 50, 100, 150, 200].forEach(
      (g) =>
        (s +=
          ln(X(g), 200, X(g), 206, "var(--text-faint)", 2) +
          tx(X(g), 222, g, { f: "700 12px", c: "var(--text-faint)" })),
    );
    [0, 20, 40, 60].forEach((f) => (s += tx(44, Y(f) + 4, f, { a: "end", f: "700 11px", c: "var(--text-faint)" })));
    s += pl(pts, "var(--teal)", 3.5);
    [
      [31, 58],
      [51, 58],
      [78, 63],
      [100, 63],
      [200, 63],
    ].forEach(
      ([g, f]) =>
        (s +=
          ln(X(g), Y(f) - 10, X(g), Y(f), "var(--blue)", 2, "3 3") +
          hit(
            "g" + g,
            `${ci(X(g), Y(f) - 25, 14, { s: "var(--blue)", sw: 3 })}${tx(X(g), Y(f) - 21, g, { f: "900 11px" })}`,
          )),
    );
    s += tx(250, 244, "generation", { f: "700 12px", c: "var(--text-faint)" });
    s += `<text transform="translate(12,115) rotate(-90)" text-anchor="middle" style="font:700 12px var(--sans);fill:var(--text-faint)">best fitness so far</text>`;
    return svg(470, 254, s);
  };

  // real simulated runs (40-bit OneMax, population 20, seed 4): [best, average] by generation
  const EA = {
    A: {
      b: [
        28, 28, 28, 30, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
      ],
      a: [
        20.4, 24.7, 27.9, 28.1, 28.9, 31.6, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
        33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33,
      ],
    },
    B: {
      b: [
        28, 26, 25, 26, 24, 26, 25, 27, 28, 25, 25, 23, 29, 28, 26, 28, 27, 26, 26, 29, 23, 29, 25, 26, 28, 26, 28, 28,
        23, 24, 29, 26, 26, 24, 28, 23, 25, 25, 25, 27, 24,
      ],
      a: [
        20.4, 19.3, 19.6, 19.6, 19.3, 20.6, 20.1, 20.1, 20, 20.1, 20.1, 20.3, 20.6, 20.8, 19.9, 20.9, 20.9, 20.9, 20.6,
        21.7, 20.4, 18.1, 20.6, 21.4, 20.3, 20.4, 20, 19.3, 19.6, 19.2, 20.1, 20, 21.3, 20.1, 20.4, 18.6, 20.7, 20.3,
        19.6, 20.9, 19.7,
      ],
    },
    C: {
      b: [
        28, 28, 29, 29, 31, 31, 30, 32, 33, 33, 33, 34, 35, 36, 35, 36, 36, 37, 37, 38, 37, 37, 36, 36, 37, 36, 36, 37,
        36, 35, 35, 35, 36, 36, 37, 37, 37, 37, 38, 38, 38,
      ],
      a: [
        20.4, 21.6, 24.4, 25.8, 26.9, 27.9, 28.1, 28.6, 28.6, 29.8, 30.3, 31.1, 31.6, 31.8, 32.1, 32.4, 32.5, 33.5, 34,
        34, 34.1, 33.6, 33.7, 33.6, 34, 34.1, 34, 34.2, 34, 33.5, 33.1, 33, 33.2, 33.8, 34.3, 34.2, 34.6, 35, 35.6,
        35.5, 35.8,
      ],
    },
  };
  const eaFig = () => {
    const Y = (v) => 118 - (v - 18) * 3.6;
    let s = "";
    [
      ["A", 24],
      ["B", 178],
      ["C", 332],
    ].forEach(([k, px]) => {
      const X = (g) => px + 6 + g * 3.2;
      s += rc(px, 26, 134, 100, { r: 8, s: "var(--line)", f: "var(--bg-2)" });
      [20, 30, 40].forEach(
        (v) =>
          (s +=
            ln(px + 2, Y(v), px + 132, Y(v), "var(--line)", 1) +
            (k === "A" ? tx(px - 4, Y(v) + 4, v, { a: "end", f: "700 11px", c: "var(--text-faint)" }) : "")),
      );
      s +=
        pl(
          EA[k].a.map((v, g) => [X(g), Y(v)]),
          "var(--amber)",
          2.5,
          "5 4",
        ) +
        pl(
          EA[k].b.map((v, g) => [X(g), Y(v)]),
          "var(--teal)",
          3,
        );
      s +=
        tx(px + 67, 146, "Run " + k, { f: "900 14px" }) +
        tx(px + 67, 164, "generations 0 to 40", { f: "700 11px", c: "var(--text-faint)" });
    });
    s += tx(235, 14, "solid green: best member    dashed orange: average member", {
      f: "700 12px",
      c: "var(--text-dim)",
    });
    return svg(472, 174, s);
  };
  Object.assign(partScope, { ci, eaFig, hit, ln, mark, pl, rc, recipeFlow, rng, shareFig, stepFig, svg, tx });
})();

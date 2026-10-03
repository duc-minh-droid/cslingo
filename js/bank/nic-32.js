/* ===== bank-x-nic-3.js ===== */
/* NIC revision bank, third round of varied, visual questions (x-nic-3).
   Lecture 4 (types, replacement, pressure, roulette, rank, tournament, mutation, crossover, lab): four new questions each.
   Every figure is needed to answer, and each uses a diagram kind not yet used for that module.
   Figures are drawn about 340 to 380 units wide so their text stays readable at phone width. */
(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});

  const B = NIC.bank;
  const FS = 1.1;
  const T = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${((o.s || 13) * FS).toFixed(1)}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px">${body}</svg>`;
  const pk = (id, body) => `<g data-pick="${id}">${body}</g>`;
  const R = (x, y, w, h, fill, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r === undefined ? 6 : o.r}" fill="${fill}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}/>`;
  const L = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || "var(--line-2)"}" stroke-width="${o.w || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ""}${o.cap ? ' stroke-linecap="round"' : ""}${o.mk ? ` marker-end="url(#${o.mk})"` : ""}/>`;
  const C = (x, y, r, fill, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"${o.fo ? ` fill-opacity="${o.fo}"` : ""} stroke="${o.s || "var(--line-2)"}" stroke-width="${o.sw || 3}"/>`;
  const f2 = (v) => v.toFixed(2);
  const DIM = "var(--text-dim)",
    FAINT = "var(--text-faint)";
  partScope.uid = 0;
  const arrowDef = (id, c = "var(--line-2)") =>
    `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker></defs>`;
  const swatch = (x, y, fill, label, o = {}) =>
    R(x, y - 11, 13, 13, fill, { fo: o.fo, r: 3, s: o.s }) + T(x + 18, y, label, { a: "start", s: 11, c: DIM });

  /* ---------- l4-types ---------- */
  // Swimlane of lifespans in a generational GA (population 3, one elite)
  const lifeFig = (() => {
    const lanes = [
      ["I1", 0, 1],
      ["I2", 0, 2],
      ["I3", 0, 1],
      ["C4", 1, 2],
      ["C5", 1, 3],
      ["C6", 2, 3],
      ["C7", 2, 3],
    ];
    const x0 = 44,
      cw = 100,
      y0 = 34,
      lh = 29,
      X = (t) => x0 + t * cw,
      bottom = y0 + lanes.length * lh;
    let s = [0, 1, 2].map((g) => T(X(g) + cw / 2, 16, "Generation " + (g + 1), { c: DIM, s: 11 })).join("");
    s += [0, 1, 2, 3].map((t) => L(X(t), 24, X(t), bottom, { dash: t && t < 3 ? "6 5" : null })).join("");
    s += lanes
      .map(([id, a, b], i) => {
        const y = y0 + i * lh;
        return pk(
          id,
          R(X(a) + 4, y + 3, (b - a) * cw - 8, lh - 8, id[0] === "I" ? "var(--blue)" : "var(--teal)", { fo: 0.85 }) +
            T(22, y + lh / 2 + 4, id, { s: 13 }),
        );
      })
      .join("");
    s +=
      swatch(44, bottom + 22, "var(--blue)", "starting population", { fo: 0.85 }) +
      swatch(200, bottom + 22, "var(--teal)", "a child", { fo: 0.85 });
    return svg(350, bottom + 34, s);
  })();
  // Composition strips (kept vs new)
  const compFig = (() => {
    const rows = [
      ["P", 2],
      ["Q", 19],
      ["R", 0],
      ["S", 5],
    ];
    let s =
      swatch(46, 14, "var(--bg-2)", "copied from old population") +
      swatch(220, 14, "var(--teal)", "new child", { fo: 0.85 });
    rows.forEach(([id, kept], k) => {
      const y = 28 + k * 36;
      s += T(2, y + 17, "Row " + id, { a: "start", s: 11 });
      for (let i = 0; i < 20; i++)
        s += R(46 + i * 15 + Math.floor(i / 5) * 6, y, 12, 24, i < kept ? "var(--bg-2)" : "var(--teal)", {
          fo: i < kept ? 1 : 0.85,
          r: 3,
        });
    });
    return svg(370, 172, s);
  })();
  // Two state machines, side by side
  const stateFig = (() => {
    const id = "ar" + ++partScope.uid;
    const bx = (x, y, a, b, fill) =>
      R(x, y, 156, 44, fill || "var(--panel)", { r: 10 }) +
      T(x + 78, y + 19, a, { s: 12 }) +
      T(x + 78, y + 35, b, { s: 12, c: DIM });
    let s =
      arrowDef(id) +
      T(8, 16, "Scheme 1", { a: "start", s: 13, c: "var(--blue-ink)" }) +
      T(190, 16, "Scheme 2", { a: "start", s: 13, c: "var(--blue-ink)" });
    [
      ["Child", "is born"],
      ["Waits in a", "holding area"],
      ["Whole batch", "swapped in"],
      ["Can now be", "a parent"],
    ].forEach(([a, b], i) => {
      s += bx(4, 26 + i * 62, a, b, i === 1 ? "var(--bg-2)" : null);
      if (i < 3) s += L(82, 72 + i * 62, 82, 86 + i * 62, { w: 3, mk: id, dash: i === 1 ? "4 3" : null });
    });
    [
      ["Child", "is born"],
      ["Replaces one", "population member"],
      ["Can now be", "a parent"],
    ].forEach(([a, b], i) => {
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
    {
      type: "pick",
      q: "Each bar is one individual of a generational GA (population 3), from the generation it was born to the one it left. Tap every individual that was carried over untouched by elitism.",
      fig: lifeFig,
      a: ["I2", "C5"],
      why: "In a generational GA every individual lasts exactly one generation, apart from the elites, which are copied across the boundary. Only I2 and C5 have bars that cross a dashed line, one elite per boundary, so the elitism setting was 1. C4 and C6 were born at a boundary but left at the next one, so they were ordinary children.",
    },
    {
      type: "match",
      q: "Each row is the population right after one round of a scheme (20 members). Match each row to its scheme.",
      fig: compFig,
      pairs: [
        ["Row P", "Generational, 2 elites"],
        ["Row Q", "Steady-state, after one step"],
        ["Row R", "Generational, no elitism"],
        ["Row S", "Generational, 5 elites"],
      ],
      hint: "Count the pale squares: that is how many members were copied across unchanged.",
      why: "A generational round rebuilds the population: no elitism leaves 0 old members (row R), 2 elites leaves 2 (row P), 5 elites leaves 5 (row S). A steady-state step changes just one member, so 19 of the 20 stay (row Q).",
    },
    {
      type: "mcq",
      q: "Two GAs are drawn as state machines. Which one is steady-state, and what does that mean for a brand-new child?",
      fig: stateFig,
      o: [
        "Scheme 1: the child can be picked as a parent straight away",
        "Scheme 2: the child can be picked as a parent straight away",
        "Scheme 1: the child must wait in a holding area until the generation ends",
        "Scheme 2: the child must wait in a holding area until the generation ends",
      ],
      a: 1,
      why: "In scheme 2 the child goes straight into the population, replacing one member, so it can breed on the very next step: that is steady-state. In scheme 1 children collect in a holding area and the whole batch is swapped in together, which is the generational scheme.",
    },
    {
      type: "multi",
      q: "A generational GA (maximising) lost its best individual between generations 1 and 2, shown in red. Which changes would have <b>guaranteed</b> the best fitness could not fall?",
      fig: genTab,
      o: [
        "Copy the single best individual into every new population",
        "Switch to steady-state and always replace the weakest member",
        "Double the mutation rate so children are more varied",
        "Use bigger tournaments so the best is chosen more often",
      ],
      a: [0, 1],
      why: "Elitism of 1 and steady-state replace-weakest both protect the top individual by construction: it can never be overwritten. A higher mutation rate or bigger tournaments change the odds, but the best can still be missed by chance, so neither is a guarantee.",
    },
  ]);

  /* ---------- l4-replacement ---------- */
  const ringFig = (() => {
    const v = [0.7, 0.3, 0.9, 0.6, 0.2, 0.8, 0.65, 0.55],
      cx = 150,
      cy = 130,
      r = 100;
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--line)" stroke-width="3" stroke-dasharray="6 6"/>`;
    s += v
      .map((x, i) => {
        const a = ((-90 + 45 * i) * Math.PI) / 180,
          px = cx + r * Math.cos(a),
          py = cy + r * Math.sin(a);
        return pk(
          "s" + (i + 1),
          C(px, py, 26, "var(--panel)") +
            T(px, py - 2, "S" + (i + 1), { s: 11, c: DIM }) +
            T(px, py + 14, f2(x), { s: 12 }),
        );
      })
      .join("");
    s += T(cx, cy - 4, "Child: 0.50", { s: 14 }) + T(cx, cy + 16, "scan clockwise", { s: 11, c: DIM });
    return svg(300, 262, s);
  })();
  const diffFig = (() => {
    const before = [0.7, 0.3, 0.9, 0.6, 0.2, 0.8];
    const rows = [
      ["Before", before, -1, "var(--bg-2)"],
      ["Row A", before.map((v, i) => (i === 1 ? 0.5 : v)), 1],
      ["Row B", before.map((v, i) => (i === 4 ? 0.5 : v)), 4],
      ["Row C", before.map((v, i) => (i === 2 ? 0.5 : v)), 2],
      ["Row D", before, -1, null, "(unchanged)"],
      ["Row E", before.map((v, i) => (i === 0 ? 0.5 : v)), 0],
    ];
    let s = T(4, 14, "Child fitness 0.50. Orange outline = slot that changed.", { a: "start", s: 11, c: DIM });
    rows.forEach(([name, vals, ch, fill, note], k) => {
      const y = 24 + k * 40;
      s +=
        T(4, y + (note ? 15 : 21), name, { a: "start", s: 12 }) +
        (note ? T(4, y + 29, note, { a: "start", s: 10, c: DIM }) : "");
      vals.forEach((v, i) => {
        s +=
          R(66 + i * 46, y, 43, 34, i === ch ? "var(--amber-dim)" : fill || "var(--panel)", {
            r: 6,
            s: i === ch ? "var(--amber)" : "var(--line-2)",
            sw: i === ch ? 4 : 2,
          }) + T(66 + i * 46 + 21.5, y + 22, f2(v), { s: 12, c: i === ch ? "var(--amber-ink)" : "var(--text)" });
      });
    });
    return svg(350, 268, s);
  })();
  // Heat maps: same 12 children, replace-weakest vs replace-random
  const initPop = [0.55, 0.7, 0.4, 0.95, 0.3, 0.6, 0.8, 0.5],
    kids = [0.62, 0.35, 0.88, 0.45, 0.7, 0.9, 0.52, 0.66, 0.85, 0.4, 0.75, 0.58],
    victims = [5, 1, 7, 3, 0, 2, 6, 4, 1, 5, 2, 7];
  const evolve = (rule) => {
    const p = initPop.slice(),
      h = [p.slice()];
    kids.forEach((c, k) => {
      if (rule === "weakest") {
        let w = 0;
        p.forEach((v, i) => {
          if (v < p[w]) w = i;
        });
        if (c > p[w]) p[w] = c;
      } else p[victims[k]] = c;
      h.push(p.slice());
    });
    return h;
  };
  const heat = (hist, x0, name, id) => {
    let s = T(x0 + 71, 14, name, { s: 13 });
    hist.forEach((col, t) =>
      col.forEach((v, i) => {
        s += R(x0 + t * 11, 22 + i * 14, 11, 14, "var(--teal)", {
          fo: (0.08 + (0.92 * (v - 0.25)) / 0.7).toFixed(2),
          r: 0,
          s: "var(--panel)",
          sw: 1,
        });
      }),
    );
    return pk(id, s);
  };
  const heatFig = svg(
    340,
    170,
    heat(evolve("random"), 8, "Run A", "A") +
      heat(evolve("weakest"), 190, "Run B", "B") +
      swatch(8, 152, "var(--teal)", "weak", { fo: 0.1 }) +
      swatch(64, 152, "var(--teal)", "strong") +
      T(190, 152, "rows: 8 slots. columns: time →", { a: "start", s: 11, c: DIM }),
  );
  const queueFig = (() => {
    const id = "ar" + ++partScope.uid;
    let s = arrowDef(id) + T(4, 14, "Population", { a: "start", s: 12, c: DIM });
    [0.7, 0.3, 0.9, 0.6, 0.2, 0.8].forEach((v, i) => {
      s += R(4 + i * 56, 22, 52, 34, "var(--panel)", { r: 8 }) + T(30 + i * 56, 45, f2(v), { s: 13 });
    });
    s += T(4, 84, "Children waiting (first in line on the left)", { a: "start", s: 12, c: DIM });
    [0.5, 0.45, 0.25, 0.65].forEach((v, i) => {
      s +=
        R(4 + i * 84, 92, 60, 34, "var(--teal)", { fo: 0.8, r: 8 }) + T(34 + i * 84, 115, f2(v), { s: 13, c: "#fff" });
      if (i < 3) s += L(66 + i * 84, 109, 84 + i * 84, 109, { w: 3, mk: id });
    });
    return svg(340, 140, s);
  })();
  B.add("l4-replacement", [
    {
      type: "pick",
      q: "Replace-first-weaker starts at a random slot, then scans clockwise and overwrites the first member weaker than the child. Tap every slot where the scan could START and end up overwriting S2.",
      fig: ringFig,
      a: ["s1", "s2", "s6", "s7", "s8"],
      hint: "First find which members are weaker than 0.50. Then walk backwards from S2 until you hit another weaker member.",
      why: "Only S2 (0.30) and S5 (0.20) are weaker than the child. A scan overwrites S2 if it reaches S2 before S5: starting at S6, S7, S8, S1 or S2 itself. Starting at S3, S4 or S5 meets S5 first, so S2 survives. The start slot decides which weaker member goes, which is why first-weaker is not the same as weakest.",
    },
    {
      type: "cat",
      q: "A child with fitness 0.50 meets the population in the top row of the figure. Rows A to E show what the population looked like afterwards. Sort each outcome.",
      fig: diffFig,
      buckets: ["Only replace-first-weaker can do this", "Either rule can do this", "Neither rule can do this"],
      items: [
        ["Row A", 0],
        ["Row B", 1],
        ["Row C", 2],
        ["Row D", 2],
        ["Row E", 2],
      ],
      why: "Row B overwrote 0.20, the weakest, which replace-weakest always does and replace-first-weaker does if the scan reaches it first. Row A overwrote 0.30: a weaker member, but not the weakest, so only first-weaker can produce it. Rows C and E overwrote members stronger than the child, and row D threw the child away even though weaker members existed, which neither rule allows.",
    },
    {
      type: "pick",
      q: "The same 12 children were fed to two copies of the same population (8 slots, one per row). One run used replace-weakest, the other replace-random. Tap the run that used replace-weakest.",
      fig: heatFig,
      a: "B",
      why: "In run B the darkest cell never disappears and the palest cells are the ones that get overwritten, so the population only gets stronger (children worse than everyone are simply dropped, hence the repeated columns). In run A the darkest cell (the best, 0.95) is wiped out by a weak 0.45 child in column 5, which only a random victim can do.",
    },
    {
      type: "order",
      q: "Replace-weakest. The four children arrive one at a time, in the order shown. Put the members that get evicted in the order they leave.",
      fig: queueFig,
      items: ["The 0.20 member from the start", "The 0.30 member from the start", "The 0.45 child that arrived second"],
      hint: "Each child only gets in if it beats the weakest member at that moment. Track the weakest after each arrival.",
      why: "Child 0.50 beats the weakest (0.20), so 0.20 leaves. Child 0.45 beats the new weakest (0.30), so 0.30 leaves. Child 0.25 is worse than the weakest (now 0.45), so it is thrown away. Child 0.65 then beats the weakest, which is the 0.45 child that arrived second. Newcomers can be evicted too.",
    },
  ]);

  /* ---------- l4-pressure ---------- */
  const heatMini = (rows, x0, title, id) => {
    let s = T(x0 + 55, 14, title, { s: 13 });
    rows.split(" ").forEach((row, g) =>
      [...row].forEach((d, i) => {
        s += R(x0 + i * 11, 22 + g * 12, 11, 12, +d === 9 ? "var(--amber)" : "var(--teal)", {
          fo: +d === 9 ? 1 : (0.08 + (0.85 * d) / 9).toFixed(2),
          r: 0,
          s: "var(--panel)",
          sw: 1,
        });
      }),
    );
    return pk(id, s);
  };
  const takeFig = svg(
    370,
    170,
    heatMini(
      "5378204196 7459775737 7979775597 7999799777 7797999999 9999999799 9999999999 9999999999 9999999999",
      6,
      "Map A",
      "A",
    ) +
      heatMini(
        "3546870129 0161271881 1121868712 1867118161 8618161788 1878818168 7188117116 7176781186 1166667177",
        130,
        "Map B",
        "B",
      ) +
      heatMini(
        "7832159406 9999999999 9999999999 9999999999 9999999999 9999999999 9999999999 9999999999 9999999999",
        254,
        "Map C",
        "C",
      ) +
      swatch(6, 150, "var(--teal)", "weak", { fo: 0.1 }) +
      swatch(62, 150, "var(--teal)", "strong") +
      swatch(128, 150, "var(--amber)", "the original best") +
      T(185, 166, "10 individuals per row, one row per generation", { s: 10, c: FAINT }),
  );
  // scatter: roulette vs linear rank
  const scatFig = (() => {
    const fit = [8, 9, 10, 11, 12, 40],
      tot = fit.reduce((a, b) => a + b),
      x0 = 40,
      Y = (p) => 224 - p * 400,
      X = (i) => x0 + 28 + i * 50;
    let s = [0, 10, 20, 30, 40]
      .map(
        (t) =>
          L(x0, Y(t / 100), 340, Y(t / 100), { c: "var(--line)", w: 1 }) +
          T(x0 - 5, Y(t / 100) + 4, t + "%", { a: "end", s: 10, c: FAINT }),
      )
      .join("");
    s +=
      L(x0, Y(1 / 6), 340, Y(1 / 6), { c: "var(--amber)", w: 3, dash: "7 5" }) +
      T(340, Y(1 / 6) - 6, "equal chance (1 in 6)", { a: "end", s: 11, c: "var(--amber-ink)" });
    fit.forEach((f, i) => {
      s += T(X(i), 246, "#" + (i + 1), { s: 12 }) + T(X(i), 262, "fit. " + f, { s: 10, c: FAINT });
      s +=
        C(X(i) - 7, Y(f / tot), 7, "var(--blue)", { s: "var(--panel)", sw: 2 }) +
        R(X(i) + 1, Y((i + 1) / 21) - 7, 13, 13, "var(--violet)", { r: 3, s: "var(--panel)", sw: 2 });
    });
    s +=
      C(60, 12, 6, "var(--blue)", { s: "var(--panel)", sw: 2 }) +
      T(72, 16, "roulette", { a: "start", s: 11 }) +
      R(150, 6, 12, 12, "var(--violet)", { r: 3, s: "var(--panel)", sw: 2 }) +
      T(168, 16, "linear rank", { a: "start", s: 11 });
    return svg(350, 272, s);
  })();
  Object.assign(partScope, { C, L, R, T, arrowDef, pk, scatFig, svg, swatch, takeFig });
})();

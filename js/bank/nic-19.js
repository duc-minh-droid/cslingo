/* ===== bank-w-nic-3.js ===== */
/* NIC revision bank, second set of visual and varied questions, part 3.
   Lecture 4 (selection, replacement, pressure, mutation, crossover, the lab). Every figure is needed to answer. */
(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});

  const B = NIC.bank;
  const txt = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="font:${o.w || 800} ${o.s || 13}px var(--sans);fill:${o.c || "var(--text)"}">${s}</text>`;

  /* Bar chart. vals: numbers; ids: data-pick ids (optional); labels under bars; line: {y, label} horizontal marker. */
  function bars(
    vals,
    {
      ids = null,
      labels = null,
      max = null,
      w = 520,
      h = 210,
      line = null,
      colors = null,
      show = true,
      inside = false,
      fmt = (v) => v,
    } = {},
  ) {
    const m = max || Math.max(...vals) * 1.1,
      n = vals.length,
      bw = Math.min(54, (w - 40) / n - 12),
      gap = (w - 40) / n;
    const Y = (v) => h - 34 - (v / m) * (h - 66);
    const body = vals
      .map((v, i) => {
        const x = 20 + gap * i + (gap - bw) / 2;
        const r = `<rect x="${x}" y="${Y(v)}" width="${bw}" height="${h - 34 - Y(v)}" rx="6" fill="${colors ? colors[i] : "var(--blue)"}" stroke="var(--line-2)" stroke-width="2" fill-opacity=".85"/>`;
        const val = show
          ? inside
            ? txt(x + bw / 2, h - 44, fmt(v), { s: 12, c: "#fff" })
            : txt(x + bw / 2, Y(v) - 6, fmt(v), { s: 12 })
          : "";
        const lab = labels ? txt(x + bw / 2, h - 14, labels[i]) : "";
        return ids ? `<g data-pick="${ids[i]}">${r}${val}${lab}</g>` : `<g>${r}${val}${lab}</g>`;
      })
      .join("");
    const ln = line
      ? `<line x1="14" x2="${w - 10}" y1="${Y(line.y)}" y2="${Y(line.y)}" stroke="var(--rose)" stroke-width="3" stroke-dasharray="7 5"/>${txt(w - 12, Y(line.y) - 6, line.label, { a: "end", c: "var(--rose-ink)" })}`
      : "";
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="14" x2="${w - 10}" y1="${h - 34}" y2="${h - 34}" stroke="var(--line-2)" stroke-width="2"/>${body}${ln}</svg>`;
  }

  /* A row of genes. cells: [text, colour]. */
  function strip(cells, x, y, { cw = 34, ch = 34 } = {}) {
    return cells
      .map(
        (c, i) =>
          `<rect x="${x + i * cw}" y="${y}" width="${cw - 3}" height="${ch}" rx="6" fill="${c[1] || "var(--panel)"}" stroke="var(--line-2)" stroke-width="2"/>${txt(x + i * cw + (cw - 3) / 2, y + ch / 2 + 5, c[0], { c: c[2] || "var(--text)" })}`,
      )
      .join("");
  }

  /* Pie wheel. vals, labels; ids optional (pick). */
  function pie(vals, labels, cx, cy, r, ids, cols) {
    const tot = vals.reduce((a, b) => a + b, 0);
    let a0 = -Math.PI / 2;
    return vals
      .map((v, i) => {
        const a1 = a0 + (v / tot) * Math.PI * 2,
          big = a1 - a0 > Math.PI ? 1 : 0;
        const p = `M${cx} ${cy} L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 ${big} 1 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} Z`;
        const mid = (a0 + a1) / 2,
          lx = cx + r * 0.66 * Math.cos(mid),
          ly = cy + r * 0.66 * Math.sin(mid);
        a0 = a1;
        const g = `<path d="${p}" fill="${cols[i]}" fill-opacity=".75" stroke="var(--panel)" stroke-width="3"/>${txt(lx, ly + 5, labels[i], { s: 13 })}`;
        return ids ? `<g data-pick="${ids[i]}">${g}</g>` : `<g>${g}</g>`;
      })
      .join("");
  }

  const addSvg = (svg, extra) => svg.replace(/<\/svg>$/, extra + "</svg>");
  const tbl = (head, rows, pick) =>
    `<table class="t"><tr>${head.map((h, i) => `<th${i ? ' class="num"' : ""}>${h}</th>`).join("")}</tr>${rows.map((r, k) => `<tr${pick ? ` data-pick="${pick[k]}"` : ""}>${r.map((c, i) => `<${i ? 'td class="num"' : "td"}>${c}</${i ? "td" : "td"}>`).join("")}</tr>`).join("")}</table>`;

  /* ---------- l4-types ---------- */
  B.add("l4-types", [
    {
      type: "pick",
      q: "A generational GA keeps 2 elites. Here is the current population (fitness, higher is better). Tap every member that is certain to be in the next generation.",
      fig: bars([0.42, 0.9, 0.55, 0.8, 0.3, 0.65, 0.7, 0.5], {
        ids: ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"],
        labels: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"],
        max: 1.05,
        fmt: (v) => v.toFixed(2),
      }),
      a: ["m2", "m4"],
      why: "Elitism copies the best 2 members unchanged: 0.90 (M2) and 0.80 (M4). Everyone else, even a decent 0.70, has to be picked as a parent and survive crossover and mutation to leave any trace, and the new population has no room for the old members.",
    },
    {
      type: "bug",
      q: "A generational GA with 2 elites should end each generation with a population of the same size. Tap the faulty line.",
      code: [
        "pop.sort(key=fitness, reverse=True)",
        "new = pop[:2]",
        "while len(new) < len(pop):",
        "    new.append(make_child(pop))",
        "pop = pop + new",
      ],
      a: 4,
      why: "pop + new glues the old population and the new one together, so the population doubles every generation and nothing is ever replaced. It should be pop = new. The elites are already inside new.",
    },
    {
      type: "match",
      q: "Match each design choice to its main consequence.",
      pairs: [
        ["Generational", "Children wait a whole generation before they can breed"],
        ["Steady-state", "A new child can be picked as a parent straight away"],
        ["No elitism", "The best fitness can fall from one generation to the next"],
        ["Elitism of 2", "The two best survive untouched into the next generation"],
      ],
      why: "Generational schemes build a full new population from the old one, so children cannot be parents until the next round. Steady-state inserts one child at a time into the live population. Elitism is what protects the best; without it, a bad round of crossover and mutation can lose it.",
    },
    {
      type: "slider",
      q: "A steady-state GA has a population of 100 and makes one child per step, replacing one member each time. After 50 steps, at most what percentage of the population can be new children?",
      min: 0,
      max: 100,
      step: 5,
      ans: 50,
      tol: 5,
      unit: "%",
      hint: "Each step replaces at most 1 member out of 100. 50 steps replace at most 50 members, which is half.",
      why: "One replacement per step means 50 steps touch at most 50 of the 100 slots. It is 'at most' because a slot can be overwritten twice, and a child may be rejected. This slow, gentle turnover is why steady-state GAs change the population smoothly rather than in big jumps.",
    },
    {
      type: "multi",
      q: "A generational GA has a population of 20 and 2 elites. Which statements are true?",
      o: [
        "18 new children are made and evaluated each generation",
        "The elites can still be picked as parents for the children",
        "The best fitness in the population can never fall",
        "The elites skip the breeding stage entirely, so they are never parents",
        "With 20 elites the GA would stand still, because no children are made",
      ],
      a: [0, 1, 2, 4],
      why: "Elites are copied into the new population (2 slots), leaving 18 slots for children. They still sit in the old population, so selection can pick them as parents. Because the best is copied, best fitness cannot fall. Setting elites equal to the population size leaves no room for children, so nothing ever changes.",
    },
  ]);

  /* ---------- l4-replacement ---------- */
  B.add("l4-replacement", [
    {
      type: "pick",
      q: "Replace-first-weaker, scanning right from slot 3 and wrapping round. The child has fitness 0.65 (dashed line). Tap the slot that gets overwritten.",
      fig: addSvg(
        bars([0.8, 0.4, 0.9, 0.7, 0.6, 0.5], {
          ids: ["s1", "s2", "s3", "s4", "s5", "s6"],
          labels: ["Slot 1", "Slot 2", "Slot 3", "Slot 4", "Slot 5", "Slot 6"],
          max: 1.15,
          line: { y: 0.65, label: "child 0.65" },
          fmt: (v) => v.toFixed(2),
        }),
        txt(220, 20, "scan starts here ▼", { s: 12, c: "var(--amber-ink)" }),
      ),
      a: "s5",
      why: "Slot 3 (0.90) and slot 4 (0.70) are both stronger than the child, so the scan carries on. Slot 5 (0.60) is the first one weaker than 0.65, so it is overwritten and the scan stops. Slot 6 (0.50) is weaker still and would be the victim under replace-weakest, but this strategy never gets that far.",
    },
    {
      type: "mcq",
      q: "Two runs each used one replacement rule on the same problem. Which statement fits the evidence best?",
      fig: tbl(
        ["Run", "After 3,000 steps", "Mean fitness", "Distinct genomes of 50"],
        [
          ["P", "best 0.94", "0.93", "3"],
          ["Q", "best 0.86", "0.71", "28"],
        ],
      ),
      o: [
        "P is replace-weakest: it keeps culling the lowest, so the mean climbs and variety drains",
        "Q is replace-weakest: it shields weak members, so many different genomes stay alive",
        "P is replace-first-weaker: random victims keep the mean high but variety low",
        "Neither can be told apart, because replacement rules never change variety",
      ],
      a: 0,
      why: "Replace-weakest always removes the lowest member, which is strong selection pressure: the mean rises right up to the best and the population fills with near-copies (3 genomes). Replace-first-weaker picks a victim by scan position, so weaker members linger: lower mean, more variety (28), and a slower best.",
    },
    {
      type: "multi",
      q: "Which statements about the two replacement rules are true?",
      o: [
        "Replace-first-weaker can overwrite the current best, if the child is better still",
        "Replace-weakest can never overwrite the current best (population of 2 or more)",
        "Under replace-first-weaker the best fitness in the population still never falls",
        "Replace-weakest picks its victim at random, so it needs no comparisons",
        "Replace-first-weaker can insert a child that is weaker than every member",
      ],
      a: [0, 1, 2],
      why: "If the child beats the best, the best is 'weaker than the child' and may be the first the scan meets, but the child is better still, so best fitness only goes up. Replace-weakest removes the lowest, never the best. It needs a full pass to find the weakest, not a random pick. And a child weaker than everyone has no weaker member to replace, so it is rejected.",
    },
    {
      type: "slider",
      q: "A population of 1,000 uses replace-weakest, which looks at every member to find the weakest. About how many members are looked at in total over 5,000 steps?",
      min: 0,
      max: 10,
      step: 1,
      ans: 5,
      tol: 1,
      unit: " million",
      hint: "1,000 looks per step × 5,000 steps = 5,000,000.",
      why: "1,000 × 5,000 = 5 million. That is the price of strong pressure: replace-first-weaker usually stops after a couple of looks, so on big populations it is far cheaper per step (a heap or a tracked 'weakest' pointer can reduce the cost, but the plain scan is linear).",
    },
    {
      type: "bug",
      q: "Replace-first-weaker should scan the slots and overwrite the first member weaker than the child, then stop. Tap the faulty line.",
      code: [
        "for i in range(P):",
        "    if fit[i] < child_fit:",
        "        pop[i] = child",
        "        fit[i] = child_fit",
        "    break",
      ],
      a: 4,
      why: "The break is indented under the for loop, not under the if, so the loop always stops after slot 1 whether or not it was replaced. Most children would never be inserted. The break belongs inside the if, after the two assignments.",
    },
  ]);

  /* ---------- l4-pressure ---------- */
  const takeFig = (() => {
    const w = 520,
      h = 230,
      X = (g) => 50 + g * 60,
      Y = (p) => 190 - p * 150;
    const curves = [
      ["A", [0.02, 0.078, 0.276, 0.726, 0.994, 1, 1, 1], "var(--teal)"],
      ["B", [0.02, 0.149, 0.726, 1, 1, 1, 1, 1], "var(--blue)"],
      ["C", [0.02, 0.04, 0.078, 0.149, 0.276, 0.476, 0.726, 0.925], "var(--amber)"],
    ];
    const paths = curves
      .map(([id, v, c]) => {
        const d = v.map((p, g) => `${g ? "L" : "M"}${X(g)} ${Y(p)}`).join(" ");
        return `<g data-pick="${id}"><path d="${d}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/></g>`;
      })
      .join("");
    const leg = curves
      .map(
        ([id, , c], i) =>
          `<circle cx="${300 + i * 70}" cy="14" r="7" fill="${c}"/>${txt(312 + i * 70, 19, id, { a: "start" })}`,
      )
      .join("");
    const ticks = [0, 1, 2, 3, 4, 5, 6, 7].map((g) => txt(X(g), 212, g, { s: 11, c: "var(--text-dim)" })).join("");
    return `<svg viewBox="0 0 ${w} ${h}" style="max-height:${h}px"><line x1="40" x2="${w - 20}" y1="190" y2="190" stroke="var(--line-2)" stroke-width="2"/>${txt(10, 14, "Share of population that copies the best", { a: "start", c: "var(--text-dim)", s: 12 })}${leg}${paths}${ticks}${txt(490, 226, "generation", { a: "end", s: 11, c: "var(--text-faint)" })}${txt(36, 44, "100%", { a: "end", s: 11, c: "var(--text-dim)" })}</svg>`;
  })();
  B.add("l4-pressure", [
    {
      type: "pick",
      q: "Three runs start with 2% of the population as copies of the best individual (no mutation, no crossover). They use tournament sizes 2, 4 and 8. Tap the curve of the size 8 run.",
      fig: takeFig,
      a: "B",
      why: "A bigger tournament means each pick is more likely to include a good entrant, so copies of the best spread faster. Size 8 takes over in about 3 generations (B), size 4 needs about 5 (A) and size 2 is still not complete after 7 (C). Fast takeover is exactly what high selection pressure means.",
    },
    {
      type: "order",
      q: "Put these selection rules from the LOWEST to the HIGHEST selection pressure.",
      items: [
        "Random selection (tournament of 1)",
        "Binary tournament (size 2)",
        "Tournament of size 5",
        "Always pick the single best member",
      ],
      why: "Size 1 ignores fitness altogether. Each extra entrant raises the chance that a strong individual is in the draw. Always taking the best is the extreme end: the rest of the population never breeds at all.",
    },
    {
      type: "match",
      q: "Match each symptom to the most sensible fix.",
      pairs: [
        ["Everyone is a copy of one genome by generation 15", "Lower the tournament size or raise the mutation rate"],
        ["Best and mean both crawl, with plenty of variety left", "Raise the tournament size"],
        ["The roulette wheel is almost flat late in the run", "Switch to rank selection"],
        ["Best fitness dips between generations", "Add elitism"],
      ],
      why: "Too much pressure kills variety, so soften it. Too little pressure wastes variety, so tighten it. Roulette flattens as fitnesses converge, and rank selection keeps its spread. A dipping best is a loss of the champion, and elitism copies it forward.",
    },
    {
      type: "bug",
      q: "A self-adjusting EA should loosen selection when the population has almost converged. Tap the faulty line.",
      code: [
        "div = len(set(pop)) / len(pop)",
        "if div < 0.1:          # almost everyone identical",
        "    t = t + 1",
        "return tournament(pop, t)",
      ],
      a: 2,
      why: "When diversity is below 10%, selection is already too strong, and a bigger t makes it stronger. It should reduce t (for example t = max(2, t - 1)). The comparison is right; the direction of the change is wrong.",
    },
    {
      type: "slider",
      q: "Entrants for a size 3 tournament are drawn with replacement from a large population. About what percentage of the time does the winner come from the better half?",
      min: 50,
      max: 100,
      step: 5,
      ans: 87.5,
      tol: 5,
      unit: "%",
      hint: "The winner is from the worse half only if all 3 entrants are. (1/2) × (1/2) × (1/2) = 1/8.",
      why: "All three entrants must be from the worse half for the winner to be from it: 1/8 = 12.5%. So the better half supplies 87.5% of winners. Even a modest tournament size is a strong filter.",
    },
  ]);

  /* ---------- l4-roulette ---------- */
  const stripFig = (() => {
    const x0 = 40,
      u = 44,
      segs = [
        ["A", 3, "var(--teal)"],
        ["B", 1, "var(--blue)"],
        ["C", 4, "var(--amber)"],
        ["D", 2, "var(--violet)"],
      ];
    let c = 0;
    const body = segs
      .map(([id, v, col]) => {
        const x = x0 + c * u,
          s = `<g data-pick="${id}"><rect x="${x}" y="50" width="${v * u}" height="56" fill="${col}" fill-opacity=".8" stroke="var(--line-2)" stroke-width="2"/>${txt(x + (v * u) / 2, 84, id + " " + v, { s: 14, c: "#fff" })}</g>`;
        c += v;
        return s;
      })
      .join("");
    const ticks = [0, 3, 4, 8, 10].map((t) => txt(x0 + t * u, 128, t, { s: 12, c: "var(--text-dim)" })).join("");
    const mx = x0 + 3.4 * u;
    return `<svg viewBox="0 0 520 150" style="max-height:150px">${txt(x0, 16, "The wheel laid flat: slice size = fitness", { a: "start", c: "var(--text-dim)", s: 12 })}${body}${ticks}<path d="M${mx} 46 l-7 -12 h14 z" fill="var(--rose)"/>${txt(mx, 30, "random point 3.4", { a: "start", c: "var(--rose-ink)", s: 12 }).replace(`x="${mx}"`, `x="${mx + 12}"`)}</svg>`;
  })();
  const wheelsFig = (() => {
    const cols = ["var(--teal)", "var(--blue)", "var(--amber)", "var(--violet)"];
    const lab = (a) => a.map((v, i) => "F" + (i + 1) + " " + v);
    return `<svg viewBox="0 0 520 250" style="max-height:250px">${txt(130, 18, "Generation 2", { s: 15 })}<g data-pick="early">${pie([1, 2, 5, 8], lab([1, 2, 5, 8]), 130, 135, 95, null, cols)}</g>${txt(390, 18, "Generation 80", { s: 15 })}<g data-pick="late">${pie([91, 92, 95, 98], lab([91, 92, 95, 98]), 390, 135, 95, null, cols)}</g></svg>`;
  })();
  B.add("l4-roulette", [
    {
      type: "pick",
      q: "Individuals A to D sit on the wheel in that order, laid out flat below (slice size = fitness). The random point lands at 3.4. Tap the individual that is selected.",
      fig: stripFig,
      a: "B",
      why: "The running totals are A 0 to 3, B 3 to 4, C 4 to 8 and D 8 to 10. The point 3.4 sits in the narrow B slice, even though B has the smallest fitness. A small slice is picked rarely (1 in 10 spins), not never.",
    },
    {
      type: "pick",
      q: "The same roulette selection is used throughout one run. Tap the wheel where selection pressure has all but vanished.",
      fig: wheelsFig,
      a: "late",
      why: "In generation 80 every slice is about a quarter, so each individual is picked about equally often: selection is nearly random. In generation 2 the best owns about half the wheel. As a population converges, fitness ratios shrink towards 1, which is why roulette stalls late in a run and rank selection helps.",
    },
    {
      type: "match",
      q: "Match each change to what it does to roulette selection probabilities.",
      pairs: [
        ["Multiply every fitness by 10", "Nothing changes"],
        ["Add 100 to every fitness", "The wheel gets flatter"],
        ["Square every fitness (all positive)", "The best gets a bigger share"],
        ["Use 1 divided by tour length for a TSP", "Shorter tours get bigger slices"],
      ],
      why: "Probabilities are shares of the total, so scaling cancels out. Adding a constant pushes every share towards equal. Squaring exaggerates differences (3 versus 2 becomes 9 versus 4). For minimisation you need a transform that rewards small values, such as 1 divided by the length.",
    },
    {
      type: "bug",
      q: "This builds the running totals (the wheel edges) for roulette selection. Tap the faulty line.",
      code: ["cum = []", "running = 0", "for ind in pop:", "    running = ind.fit", "    cum.append(running)"],
      a: 3,
      why: "running = ind.fit overwrites the total each time, so cum just repeats the fitnesses and is not increasing. It must add: running += ind.fit. Only then do the entries mark the right edges of the slices.",
    },
    {
      type: "mcq",
      q: "In 1,000 roulette spins on four individuals A, B, C, D the picks were as shown. Which fitness values for A, B, C, D could have produced them?",
      fig: bars([405, 297, 208, 90], { labels: ["A", "B", "C", "D"], max: 480, h: 200 }),
      o: ["4, 3, 2, 1", "10, 5, 3, 2", "4, 4, 1, 1", "1, 2, 3, 4"],
      a: 0,
      hint: "Shares of about 40, 30, 20 and 10 per cent are in the ratio 4 : 3 : 2 : 1.",
      why: "The picks are about 41%, 30%, 21% and 9%, the ratio 4 : 3 : 2 : 1. Fitnesses 10, 5, 3, 2 would give A half the picks, 4, 4, 1, 1 would make A and B equal, and 1, 2, 3, 4 would put D on top.",
    },
  ]);
  Object.assign(partScope, { bars, strip, tbl, txt });
})();

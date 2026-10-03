(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { C, L, R, T, appsGantt, appsHeat, appsScatter, arrowDef, hit, poly, rng, svg } = partScope;
  const B = NIC.bank;

  const appsLamps = (() => {
    const desks = ["0,1", "1,1", "1,2", "2,0", "3,2", "3,3", "2,3"];
    const cands = {
      A: [[1, 1]],
      B: [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 2],
        [2, 3],
      ],
      C: [
        [1, 1],
        [2, 3],
        [3, 2],
      ],
      D: [
        [1, 1],
        [3, 3],
        [2, 0],
      ],
    };
    const pos = { A: [14, 28], B: [164, 28], C: [14, 178], D: [164, 178] },
      cs = 30;
    let g = "";
    Object.entries(cands).forEach(([k, lamps]) => {
      const [ox, oy] = pos[k];
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++) {
          const desk = desks.includes(r + "," + c);
          g += R(ox + c * cs, oy + r * cs, cs, cs, {
            f: desk ? "var(--amber-dim)" : "var(--bg-2)",
            s: "var(--line-2)",
            r: 0,
            sw: 1,
          });
          if (desk)
            g += R(ox + c * cs + 8, oy + r * cs + 9, 14, 12, {
              f: "var(--amber-edge)",
              s: "var(--amber-ink)",
              r: 2,
              sw: 1.5,
            });
        }
      lamps.forEach(
        ([r, c]) =>
          (g += C(ox + c * cs + cs / 2, oy + r * cs + cs / 2, 9, { f: "var(--gold)", s: "var(--gold-lip)", sw: 2.5 })),
      );
      g += T(ox + 2 * cs, oy - 8, "Layout " + k, { z: 13 });
      g += hit(k, ox - 6, oy - 24, 4 * cs + 12, 4 * cs + 32, 10);
    });
    return svg(320, 322, g);
  })();

  B.add("l1-apps", [
    {
      type: "pick",
      q: "A designer scores each antenna design as fitness = gain (dB) − 2 × size (cm), and higher is better. The plot shows eight candidate designs. Tap the fittest one.",
      fig: appsScatter,
      a: "H",
      hint: "Read gain up the side and size along the bottom, then do gain minus twice the size.",
      why: "H has gain 12 and size 3, so 12 − 6 = 6. The top-gain design G scores 14 − 12 = 2, and the smallest design A scores 4 − 2 = 2. B and D score 4. A fitness function turns a trade-off (more gain against more size) into one number, so the EA can rank any two designs without anyone saying how to build a good one.",
    },
    {
      type: "slider",
      q: "Scoring one candidate takes a 30-second simulation. The population has 50 candidates, and 10 machines share the work as drawn (one generation). Picking parents and making children takes almost no time. How long will 40 generations take?",
      fig: appsGantt,
      min: 0,
      max: 200,
      step: 10,
      ans: 100,
      tol: 20,
      unit: " minutes",
      hint: "One generation is 5 rounds of 30 seconds. Then multiply by 40.",
      why: "50 candidates over 10 machines is 5 rounds of 30 s = 150 s per generation. 40 generations is 40 × 150 = 6,000 s, which is 100 minutes. Almost all the time goes on evaluating fitness, so a cheaper simulation or more machines is what speeds an EA up, not faster selection.",
    },
    {
      type: "order",
      q: "A designer tunes two settings, each with 7 values (the 49 squares). The squares are shaded by the score each of three scoring rules gives them (darker green = higher; the star is the best design under all three). An EA starts at a random square and keeps changes to a neighbouring square that do not lower the score. Order the rules from most to least helpful for guiding it.",
      fig: appsHeat,
      items: ["Score P", "Score R", "Score Q"],
      why: "P rises smoothly to the star, so every step uphill is rewarded and the EA is always pulled towards it. R is shaded in bands: it only gives feedback when the EA crosses a band edge, but it still points the right way. Q scores 0 everywhere except the star itself, so there is nothing to climb and the EA is reduced to guessing. A good fitness function ranks near-misses as better than bad misses.",
    },
    {
      type: "pick",
      q: "An office has desks (the small boxes). A lamp lights its own square and the squares directly above, below, left and right. Fitness = number of desks lit − number of lamps used, higher is better. Tap the fittest layout.",
      fig: appsLamps,
      a: "D",
      hint: "Count the lit desks for each layout, then take away the number of lamps.",
      why: "Layout D lights all 7 desks with 3 lamps: 7 − 3 = 4. Layout C lights 6 desks with 3 lamps: 3. Layout B lights all 7 desks but needs 5 lamps: 2. Layout A uses one lamp for 3 desks: 2. The score has to weigh both aims at once, which is why neither the most lamps nor the fewest wins.",
    },
    {
      type: "cat",
      q: "An engineer uses an EA to evolve a new antenna design. Who does each piece of work: you (the engineer), the EA, or neither because it isn't needed?",
      buckets: ["You", "The EA", "Neither"],
      items: [
        ["Decide what makes a design good, as a score", 0],
        ["Choose how a design is written down as a chromosome", 0],
        ["Create the first batch of random designs", 1],
        ["Tweak and combine promising designs into new ones", 1],
        ["Decide which designs get to be parents", 1],
        ["Know a step-by-step recipe for the best design", 2],
        ["Know in advance what the best design looks like", 2],
      ],
      why: "The engineer supplies the two problem-specific parts: a fitness function and an encoding. Everything else (random starts, variation, selection) is generic and the EA does it. Neither needs a recipe or a picture of the answer: that is why EAs can produce designs that surprise the experts.",
    },
  ]);

  /* =====================================================================
     l2-generic
     ===================================================================== */
  const genRuns = (() => {
    const Lb = 30,
      P = 8,
      G = 20,
      PM = 2 / 30,
      fit = (a) => a.reduce((s, b) => s + b, 0);
    const sim = (rule, seed) => {
      const r = rng(seed);
      let pop = Array.from({ length: P }, () => Array.from({ length: Lb }, () => (r() < 0.5 ? 1 : 0)));
      const hist = [Math.max(...pop.map(fit))];
      const tour = () => {
        const a = pop[Math.floor(r() * P)],
          b = pop[Math.floor(r() * P)];
        return fit(a) >= fit(b) ? a : b;
      };
      for (let g = 0; g < G; g++) {
        const kids = [];
        for (let i = 0; i < P; i++) {
          const p = tour().slice();
          for (let j = 0; j < Lb; j++) if (r() < PM) p[j] = 1 - p[j];
          kids.push(p);
        }
        if (rule === "all") pop = kids;
        else if (rule === "merge") pop = [...pop, ...kids].sort((a, b) => fit(b) - fit(a)).slice(0, P);
        else {
          pop = pop.slice().sort((a, b) => fit(b) - fit(a));
          const ks = kids.slice().sort((a, b) => fit(b) - fit(a));
          for (let i = 0; i < 4; i++) pop[P - 1 - i] = ks[i];
        }
        hist.push(Math.max(...pop.map(fit)));
      }
      return hist;
    };
    const order = [
      ["P", "merge"],
      ["Q", "all"],
      ["R", "some"],
    ];
    let g = "";
    order.forEach(([name, rule], i) => {
      const ox = 4 + i * 148,
        w = 136,
        x0 = ox + 26,
        y0 = 14,
        y1 = 134,
        data = sim(rule, 8),
        X = (t) => x0 + (t / G) * (w - 34),
        Y = (v) => y1 - ((v - 15) / 15) * (y1 - y0);
      g += R(ox, 2, w, 184, { r: 12 }) + L(x0, y1, ox + w - 6, y1) + L(x0, y0, x0, y1);
      [20, 25, 30].forEach(
        (v) =>
          (g +=
            L(x0, Y(v), ox + w - 6, Y(v), { c: "var(--line)", sw: 1 }) +
            T(ox + 20, Y(v) + 4, v, { a: "end", z: 11, c: "var(--text-dim)" })),
      );
      g +=
        poly(
          data.map((v, t) => [X(t), Y(v)]),
          "var(--teal)",
          3,
        ) +
        T(ox + w / 2, y1 + 18, "Run " + name, { z: 14 }) +
        T(ox + w / 2, y1 + 34, "generations 0 to 20 →", { z: 11, c: "var(--text-dim)" });
      g += hit("run" + name, ox, 2, w, 184, 12);
    });
    return svg(450, 192, g);
  })();

  const genStop = (() => {
    const imp = { 0: 11, 2: 14, 6: 18, 11: 21, 22: 24 },
      best = [];
    let cur = 0;
    for (let t = 0; t <= 60; t++) {
      if (imp[t] !== undefined) cur = imp[t];
      best.push(cur);
    }
    const x0 = 44,
      W = 380,
      y1 = 190,
      y0 = 24,
      X = (t) => x0 + (t / 60) * W,
      Y = (v) => y1 - ((v - 8) / 20) * (y1 - y0);
    let pts = [];
    best.forEach((v, t) => {
      if (t) pts.push([X(t), Y(best[t - 1])]);
      pts.push([X(t), Y(v)]);
    });
    let g = L(x0, y1, x0 + W + 4, y1) + L(x0, y0 - 6, x0, y1);
    [10, 20, 28].forEach(
      (v) =>
        (g +=
          L(x0, Y(v), x0 + W, Y(v), { c: "var(--line)", sw: 1 }) +
          T(x0 - 8, Y(v) + 4, v, { a: "end", z: 12, c: "var(--text-dim)" })),
    );
    g += poly(pts, "var(--teal)", 3.5);
    g +=
      T(235, 16, "Best fitness in the population", { z: 13, c: "var(--text-dim)" }) +
      T(x0 + W / 2, y1 + 48, "generation", { z: 12, c: "var(--text-dim)" });
    [22, 30, 37, 45, 60].forEach(
      (t) =>
        (g += `<g data-pick="g${t}">${L(X(t), Y(best[t]), X(t), y1, { c: "var(--blue-edge)", d: "3 4", sw: 2 })}${C(X(t), y1 + 18, 14, { s: "var(--blue)", sw: 3 })}${T(X(t), y1 + 23, t, { z: 13, c: "var(--ink)" })}</g>`),
    );
    return svg(440, 244, g);
  })();

  const genScatter = (() => {
    const x0 = 40,
      y1 = 300,
      S = 36,
      X = (v) => x0 + v * S,
      Y = (v) => y1 - v * 28;
    const kids = { A: [2, 3], B: [4.5, 4.5], C: [7, 6], D: [3, 7], E: [9, 1] };
    let g = "";
    for (let i = 0; i <= 10; i++)
      g +=
        L(X(i), y1, X(i), Y(10), { c: "var(--line)", sw: 1 }) +
        L(x0, Y(i), X(10), Y(i), { c: "var(--line)", sw: 1 }) +
        (i % 2 === 0
          ? T(X(i), y1 + 17, i, { z: 12, c: "var(--text-dim)" }) +
            T(x0 - 8, Y(i) + 4, i, { a: "end", z: 12, c: "var(--text-dim)" })
          : "");
    g +=
      L(x0, y1, X(10), y1) +
      L(x0, y1, x0, Y(10)) +
      T(X(5), y1 + 36, "gene x", { z: 13, c: "var(--text-dim)" }) +
      T(10, 160, "gene y", { z: 13, c: "var(--text-dim)" }).replace("<text ", `<text transform="rotate(-90 10 160)" `);
    [
      ["Parent 1", [2, 6]],
      ["Parent 2", [7, 3]],
    ].forEach(
      ([n, [x, y]]) =>
        (g +=
          R(X(x) - 11, Y(y) - 11, 22, 22, { f: "var(--violet-dim)", s: "var(--violet)", r: 5, sw: 3 }) +
          T(X(x), Y(y) + 28, n, { z: 12, c: "var(--violet-ink)" })),
    );
    Object.entries(kids).forEach(
      ([k, [x, y]]) =>
        (g += `<g data-pick="${k}">${C(X(x), Y(y), 13, { s: "var(--blue)", sw: 3 })}${T(X(x), Y(y) + 5, k, { z: 13, c: "var(--ink)" })}</g>`),
    );
    return svg(420, 346, g);
  })();

  const genBars = (() => {
    const v = [100, 3, 2, 2, 1],
      x0 = 50,
      base = 150,
      H = 110;
    let g = L(x0 - 10, base, 410, base) + L(x0 - 10, base - H - 6, x0 - 10, base);
    v.forEach((val, i) => {
      const x = x0 + i * 70,
        h = Math.max(3, (val / 100) * H);
      g +=
        R(x, base - h, 44, h, {
          f: i === 0 ? "var(--amber)" : "var(--blue)",
          s: i === 0 ? "var(--amber-ink)" : "var(--blue-ink)",
          r: 5,
        }) +
        T(x + 22, base - h - 7, val, { z: 14 }) +
        T(x + 22, base + 18, i === 0 ? "leader" : "#" + (i + 1), { z: 12, c: "var(--text-dim)" });
    });
    g += T(235, 16, "Fitness of the five individuals", { z: 13, c: "var(--text-dim)" });
    return svg(420, 178, g);
  })();

  const genFlow = (() => {
    const [id, defs] = arrowDef();
    const bx = 40,
      bw = 240,
      bh = 36,
      ys = [26, 84, 142, 200],
      decY = 262;
    const names = [
      "Random population, scored",
      "Select parents",
      "Vary: mutate / recombine",
      "Score children, update population",
    ];
    let g = defs;
    const arrow = (pid, d, label) =>
      `<g data-pick="${pid}"><path d="${d}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/><path d="${d}" stroke="transparent" stroke-width="22" fill="none"/></g>`;
    ys.forEach(
      (y, i) =>
        (g +=
          R(bx, y, bw, bh, {
            r: 10,
            f: i === 0 ? "var(--teal-dim)" : "var(--blue-dim)",
            s: i === 0 ? "var(--teal)" : "var(--blue-edge)",
            sw: 2.5,
          }) + T(bx + bw / 2, y + 23, names[i], { z: 14, c: "var(--ink)" })),
    );
    g +=
      `<polygon points="${bx + bw / 2},${decY - 4} ${bx + bw / 2 + 80},${decY + 22} ${bx + bw / 2},${decY + 48} ${bx + bw / 2 - 80},${decY + 22}" fill="var(--amber-dim)" stroke="var(--amber)" stroke-width="2.5"/>` +
      T(bx + bw / 2, decY + 27, "Time left?", { z: 13, c: "var(--ink)" });
    g +=
      R(312, decY + 2, 100, 42, { r: 10, f: "var(--rose-dim)", s: "var(--rose)", sw: 2.5 }) +
      T(362, decY + 20, "Stop and", { z: 13, c: "var(--ink)" }) +
      T(362, decY + 36, "report best", { z: 13, c: "var(--ink)" });
    g +=
      arrow("a1", `M${bx + bw / 2} ${ys[0] + bh} L${bx + bw / 2} ${ys[1] - 6}`) +
      arrow("a2", `M${bx + bw / 2} ${ys[1] + bh} L${bx + bw / 2} ${ys[2] - 6}`) +
      arrow("a3", `M${bx + bw / 2} ${ys[2] + bh} L${bx + bw / 2} ${ys[3] - 6}`) +
      arrow("a4", `M${bx + bw / 2} ${ys[3] + bh} L${bx + bw / 2} ${decY - 8}`);
    g +=
      arrow("a5", `M${bx + bw / 2 + 80} ${decY + 22} L${306} ${decY + 22}`) +
      T(272, decY + 14, "no", { z: 12, c: "var(--text-dim)" });
    g +=
      arrow(
        "a6",
        `M${bx + bw / 2 - 80} ${decY + 22} L${14} ${decY + 22} L${14} ${ys[0] + bh / 2} L${bx - 4} ${ys[0] + bh / 2}`,
      ) + T(64, decY + 14, "yes", { z: 12, c: "var(--text-dim)" });
    return svg(420, 318, g);
  })();

  B.add("l2-generic", [
    {
      type: "pick",
      q: "Three runs of one EA share the same starting population of 8 candidates (fitness = number of 1s in a 30-bit string). They differ only in how the next population is chosen. Rule ① all 8 children replace the old population. Rule ② old and new are merged and the best 8 are kept. Rule ③ the 4 weakest are replaced by the 4 best children. Each panel plots the best fitness per generation. Tap the run that used rule ①.",
      fig: genRuns,
      a: "runQ",
      why: "Under rule ① the best parent is thrown away every generation, and its children are not guaranteed to match it, so the best fitness can fall (it dips several times in run Q and ends lower than it started climbing). Rules ② and ③ both keep the best individual, so their best-so-far never goes down.",
    },
    {
      type: "pick",
      q: "An EA stops as soon as its best fitness has not improved for 15 generations in a row. The chart shows its best fitness per generation (drawn out to generation 60 so you can see what would follow). At which generation does it stop? Tap it.",
      fig: genStop,
      a: "g37",
      hint: "Find the last generation where the line steps up, then add 15.",
      why: "The last improvement is at generation 22. Fifteen generations without any gain brings us to generation 37, so the run stops there, even though the line is flat from 22 to 60. A patience rule like this saves time once progress has dried up, at the risk of stopping just before a late jump.",
    },
    {
      type: "pick",
      q: "Each individual has two genes, x and y, drawn as a point. Uniform crossover builds a child by copying each gene unchanged from one parent or the other (the x gene from either, the y gene from either). Tap every child that crossover of Parent 1 and Parent 2 could produce.",
      fig: genScatter,
      a: ["A", "C"],
      why: "Parent 1 is (2, 6) and Parent 2 is (7, 3). Child A (2, 3) takes x from Parent 1 and y from Parent 2, and child C (7, 6) takes x from Parent 2 and y from Parent 1. B (4.5, 4.5) is the average of the parents: that is blending, not copying a gene. D has both genes nudged, which is a mutation, and E is far from both parents.",
    },
    {
      type: "slider",
      q: "Fitness-proportional selection gives each individual a share of the parent slots equal to its share of the total fitness. The five individuals have the fitness values shown. About what percentage of the parent slots goes to the leader?",
      fig: genBars,
      min: 0,
      max: 100,
      step: 5,
      ans: 93,
      tol: 7,
      unit: "%",
      hint: "The total is 100 + 3 + 2 + 2 + 1 = 108.",
      why: "The leader's share is 100 ÷ 108, about 93%. The other four individuals fight over the remaining 7%, so the next generation is nearly all copies of the leader. One outlier can make proportional selection almost greedy, which is why many EAs pick by rank instead, where the leader's share would only be 5 out of 15.",
    },
    {
      type: "pick",
      q: "This flowchart of the generic EA has one wrong arrow. Tap it.",
      fig: genFlow,
      a: "a6",
      why: "When there is time left, the loop must go back to selecting parents from the updated population. This arrow goes back to the random starting population, which would throw away everything the EA has learned and restart each generation as a random search.",
    },
  ]);

  /* =====================================================================
     l2-optim
     ===================================================================== */
  const optCube = (() => {
    const w = [30, 70, 75],
      Tg = 100,
      f = (b) => Math.abs(b[0] * w[0] + b[1] * w[1] + b[2] * w[2] - Tg);
    const posOf = (b) => [60 + 160 * b[0] + 70 * b[2], 224 - 110 * b[1] - 46 * b[2]];
    const all = [...Array(8).keys()].map((i) => [(i >> 2) & 1, (i >> 1) & 1, i & 1]);
    let g = "";
    all.forEach((a) =>
      all.forEach((b) => {
        const d = (a[0] !== b[0]) + (a[1] !== b[1]) + (a[2] !== b[2]);
        if (d === 1 && a.join("") < b.join("")) {
          const [x1, y1] = posOf(a),
            [x2, y2] = posOf(b);
          g += L(x1, y1, x2, y2, { c: "var(--line-2)", sw: 3 });
        }
      }),
    );
    all.forEach((b) => {
      const [x, y] = posOf(b),
        k = b.join("");
      g += `<g data-pick="v${k}">${C(x, y, 28, { s: "var(--blue)", sw: 3 })}</g>${T(x, y - 2, k, { z: 14 })}${T(x, y + 14, "f = " + f(b), { z: 12, c: "var(--text-dim)" })}`;
    });
    g += T(215, 16, "Weights 30, 70, 75 kg · f = |total − 100| · lower is better", { z: 12, c: "var(--text-dim)" });
    return svg(400, 262, g);
  })();
  Object.assign(partScope, { optCube });
})();

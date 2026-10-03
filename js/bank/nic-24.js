(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { C, L, R, T, arrowDef, hit, monkeyGrid, monkeyRuns, monkeyTrace, rng, svg } = partScope;
  const B = NIC.bank;

  const monkeyCycle = (() => {
    const [id, defs] = arrowDef();
    const bx = [
        [10, 40],
        [250, 40],
        [250, 170],
        [10, 170],
      ],
      names = [
        ["Make a child:", "change one letter"],
        ["Count how many", "letters match"],
        ["Keep the child unless", "it matches fewer"],
        ["The kept string", "becomes the parent"],
      ];
    const w = 180,
      h = 64;
    let g = defs;
    g += `<path d="M${bx[0][0] + w} ${bx[0][1] + h / 2} L${bx[1][0] - 4} ${bx[1][1] + h / 2}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    g += `<path d="M${bx[1][0] + w / 2} ${bx[1][1] + h + 2} L${bx[2][0] + w / 2} ${bx[2][1] - 6}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    g += `<path d="M${bx[2][0] - 2} ${bx[2][1] + h / 2} L${bx[3][0] + w + 6} ${bx[3][1] + h / 2}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    g += `<path d="M${bx[3][0] + w / 2} ${bx[3][1] - 2} L${bx[0][0] + w / 2} ${bx[0][1] + h + 6}" stroke="var(--text-dim)" stroke-width="3" fill="none" marker-end="url(#${id})"/>`;
    bx.forEach(([x, y], i) => {
      g += `<g data-pick="b${i + 1}">${R(x, y, w, h, { r: 14, s: "var(--blue-edge)", f: "var(--blue-dim)", sw: 3 })}</g>${T(x + w / 2, y + 27, names[i][0], { z: 15, c: "var(--ink)" })}${T(x + w / 2, y + 48, names[i][1], { z: 15, c: "var(--ink)" })}`;
    });
    return svg(440, 250, g);
  })();

  B.add("l1-monkey", [
    {
      type: "pick",
      q: "A keep-if-better run changes exactly ONE letter per step and keeps the child if its match count does not drop. Each row shows which of 8 letters match the target after that step. (A wrong letter swapped for another wrong letter does not show.) One row cannot have come from the row above it under these rules. Tap it.",
      fig: monkeyGrid,
      a: "r5",
      why: "From step 4 to step 5 the count stays at 5, which is allowed on its own, but look at which letters moved: letter 7 went from right to wrong while letter 8 went from wrong to right. That is two letters changed in one step. Steps 1 to 2 look identical because a wrong letter became another wrong letter, which is a legal, unseen change.",
    },
    {
      type: "mcq",
      q: "Keep-if-better changes one letter and keeps the child if its match count is not lower than its parent's. Starting from PIANO (target PLANT), the four proposals below are tried in order. What is the current string after proposal 4?",
      fig: monkeyTrace,
      o: ["PLANS", "PLANO", "BLANS", "PLAES"],
      a: 0,
      hint: "Count matches after each proposal. Only the proposals that do not lower the count are kept.",
      why: "Proposal 1 gives PLANO (4 matches, up from 3): kept. Proposal 2 gives PLANS (still 4 matches): not worse, so it is kept. Proposal 3 would give PLAES (3 matches) and proposal 4 would give BLANS (3 matches): both worse, so both are thrown away. The string stays PLANS. Accepting equal scores is what lets the search drift across flat patches.",
    },
    {
      type: "bug",
      q: "This keep-if-better search is meant to build on its improvements, but it never gets further than one lucky letter beyond where it started. Click the faulty line.",
      code: [
        "start = random_text()",
        "best = start",
        "for step in range(5000):",
        "    kid = mutate(start)",
        "    if score(kid) >= score(best):",
        "        best = kid",
      ],
      a: 3,
      why: "Every child is made from the original start string, not from the current best. Improvements are recorded in best but never built on, so the search can only ever beat start by a single change. The child must be made from the current best: mutate(best).",
    },
    {
      type: "mcq",
      q: "Three runs of one search try to match a 28-letter sentence. Each step they re-roll some random letters and keep the child if its match count is not lower. The runs differ only in how many letters they re-roll per step. The middle run shot ahead early but then crawled at about 19. Why?",
      fig: monkeyRuns,
      o: [
        "Near the end, re-rolling four at once nearly always spoils a right letter, so few children are kept",
        "Once about 19 of the 28 letters are right, there are no different letters left for it to try out",
        "Keep-if-better only lets a child be kept while the match count is below about 20, then it switches off",
        "Re-rolling four letters costs four times as much, so its curve is simply the same one stretched sideways",
      ],
      a: 0,
      why: "Early on almost any change helps, so big steps are fast. Near the end most letters are right, and four random changes almost surely break a right letter without fixing a wrong one, so the child scores lower and is rejected. The one-letter run is slower at first but keeps finding the odd improvement. Re-rolling all 28 letters is little better than random typing.",
    },
    {
      type: "pick",
      q: "In nature the environment “scores” each offspring by how well it survives. Which box of this keep-if-better loop does that job?",
      fig: monkeyCycle,
      a: "b2",
      why: "Counting the matching letters is the fitness function: it is the judge of how well a child does, like the environment. Box 1 is variation (mutation), box 3 is selection (acting on the score) and box 4 is the next generation.",
    },
  ]);

  /* =====================================================================
     l1-ingredients
     ===================================================================== */
  const ingGrids = (() => {
    const r = rng(20),
      Ln = 10,
      P = 6;
    let pop = Array.from({ length: P }, () => Array.from({ length: Ln }, () => (r() < 0.5 ? 1 : 0)));
    const fit = (a) => a.reduce((s, b) => s + b, 0);
    const snaps = { 0: pop.map((a) => a.slice()) };
    for (let gI = 1; gI <= 30; gI++) {
      const np = [];
      for (let i = 0; i < P; i++) {
        const a = pop[Math.floor(r() * P)],
          b = pop[Math.floor(r() * P)];
        np.push((fit(a) >= fit(b) ? a : b).slice());
      }
      pop = np;
      if (gI === 4 || gI === 30) snaps[gI] = pop.map((a) => a.slice());
    }
    const names = [
      ["a", 0, "generation 0"],
      ["b", 4, "generation 4"],
      ["c", 30, "generation 30"],
    ];
    let g = "";
    names.forEach(([id, gen, label], pi) => {
      const ox = 6 + pi * 148,
        cell = 11;
      g += R(ox, 2, 136, 128, { r: 12 });
      snaps[gen].forEach((row, i) =>
        row.forEach(
          (b, k) =>
            (g += R(
              ox + 13 + k * cell,
              12 + i * cell + i * 3,
              cell - 1,
              cell + 1,
              b
                ? { f: "var(--blue)", s: "var(--blue-ink)", r: 2, sw: 1 }
                : { f: "var(--bg-2)", s: "var(--line-2)", r: 2, sw: 1 },
            )),
        ),
      );
      g += T(ox + 68, 120, label, { z: 13 });
      g += hit(id, ox, 2, 136, 128, 12);
    });
    return svg(450, 136, g);
  })();

  const ingBars = (() => {
    const schemes = [
      ["s1", "A: always take the single fittest", [100, 0, 0, 0]],
      ["s2", "B: anyone, with equal chance", [25, 25, 25, 25]],
      ["s3", "C: chance proportional to fitness", [50, 31.25, 12.5, 6.25]],
      ["s4", "D: pick from the fittest two only", [50, 50, 0, 0]],
      ["s5", "E: chance by rank (4, 3, 2, 1 shares)", [40, 30, 20, 10]],
    ];
    const col = ["var(--teal)", "var(--blue)", "var(--amber)", "var(--violet)"],
      ink = ["var(--teal-ink)", "var(--blue-ink)", "var(--amber-ink)", "var(--violet-ink)"];
    const x0 = 16,
      W = 400,
      y0 = 36,
      rh = 46;
    let g = ["Fittest", "2nd", "3rd", "4th"]
      .map(
        (s, i) =>
          R(x0 + i * 100, 8, 12, 12, { f: col[i], s: ink[i], r: 3, sw: 1.5 }) +
          T(x0 + 18 + i * 100, 18, s, { a: "start", z: 12 }),
      )
      .join("");
    schemes.forEach(([id, name, ps], i) => {
      const y = y0 + i * rh;
      g += T(x0, y + 12, name, { a: "start", z: 13 });
      let x = x0;
      ps.forEach((p, k) => {
        const w = (p / 100) * W;
        if (!w) return;
        g +=
          R(x, y + 18, w, 20, { f: col[k], s: ink[k], r: 0, sw: 1.5 }) +
          (w > 30 ? T(x + w / 2, y + 33, (p % 1 ? p.toFixed(1) : p) + "%", { z: 12, c: "#fff" }) : "");
        x += w;
      });
      g += hit(id, x0 - 8, y - 2, W + 16, 44, 8);
    });
    return svg(440, y0 + schemes.length * rh, g);
  })();

  const ingDots = (() => {
    const f = (x) => 0.6 * Math.exp(-(((x - 0.2) / 0.08) ** 2)) + 1.0 * Math.exp(-(((x - 0.72) / 0.1) ** 2));
    const r = rng(2 * 131);
    const climb = (x) => {
      for (let t = 0; t < 200; t++) {
        const y = Math.min(1, Math.max(0, x + (r() < 0.5 ? -0.02 : 0.02)));
        if (f(y) >= f(x)) x = y;
      }
      return x;
    };
    const sizes = [1, 2, 4, 8],
      res = {};
    sizes.forEach((N) => {
      res[N] = [];
      for (let k = 0; k < 12; k++) {
        let best = 0;
        for (let j = 0; j < N; j++) best = Math.max(best, f(climb(r())));
        res[N].push(best);
      }
    });
    const x0 = 56,
      cw = 88,
      y1 = 196,
      y0 = 24,
      Y = (v) => y1 - ((v - 0.5) / 0.55) * (y1 - y0);
    let g = L(x0 - 10, y1, 430, y1) + L(x0 - 10, y0 - 6, x0 - 10, y1);
    g +=
      L(x0 - 10, Y(1), 430, Y(1), { c: "var(--teal)", d: "5 5", sw: 1.5 }) +
      T(x0 - 14, Y(1) + 4, "big", { a: "end", z: 12, c: "var(--teal-ink)" });
    g +=
      L(x0 - 10, Y(0.6), 430, Y(0.6), { c: "var(--amber)", d: "5 5", sw: 1.5 }) +
      T(x0 - 14, Y(0.6) + 4, "small", { a: "end", z: 12, c: "var(--amber-ink)" });
    sizes.forEach((N, i) => {
      const cx = x0 + 10 + i * cw + cw / 2 - 4;
      res[N].forEach(
        (v, k) =>
          (g += C(cx + ((k % 6) - 2.5) * 11.5, Y(Math.min(v, 1.02)) + (k < 6 ? -6 : 6), 5, {
            f: v > 0.9 ? "var(--teal)" : "var(--amber)",
            s: "var(--panel)",
            sw: 1,
          })),
      );
      g += T(cx, y1 + 20, N === 1 ? "1 climber" : N + " climbers", { z: 13 });
      g += hit("n" + N, cx - cw / 2 + 2, y0 - 8, cw - 4, y1 - y0 + 34, 10);
    });
    return svg(440, 232, g);
  })();

  const ingCut = (() => {
    const P1 = "1110100011",
      P2 = "0101111100",
      x0 = 58,
      cw = 34;
    let g = T(26, 62, "P1", { z: 14 }) + T(26, 104, "P2", { z: 14 });
    [
      [P1, 44],
      [P2, 86],
    ].forEach(([s, y]) =>
      [...s].forEach(
        (b, k) =>
          (g +=
            R(
              x0 + k * cw + 1,
              y,
              cw - 2,
              30,
              b === "1" ? { f: "var(--teal-dim)", s: "var(--teal)", r: 6 } : { f: "var(--bg-2)", r: 6 },
            ) + T(x0 + k * cw + cw / 2, y + 21, b, { z: 15 })),
      ),
    );
    for (let k = 1; k <= 9; k++) {
      const x = x0 + k * cw;
      g += `<g data-pick="c${k}">${L(x, 36, x, 126, { c: "var(--blue)", d: "4 4", sw: 3 })}<rect x="${x - 8}" y="36" width="16" height="90" rx="6" fill="transparent" stroke="none"/></g>${T(x, 148, "cut " + k, { z: 11, c: "var(--blue-ink)" })}`;
    }
    g += T(220, 18, "Cut after position…", { z: 13, c: "var(--text-dim)" });
    return svg(410, 160, g);
  })();

  const ingStrip = (() => {
    const bits = "0110100111010010100110101100100101101010".split("");
    let g = T(8, 16, "Parent: 40 bits", { a: "start", z: 13 });
    bits.forEach((b, i) => {
      const x = 8 + (i % 20) * 20,
        y = 26 + Math.floor(i / 20) * 24;
      g +=
        R(
          x,
          y,
          18,
          20,
          b === "1"
            ? { f: "var(--blue-dim)", s: "var(--blue-edge)", r: 4, sw: 1.5 }
            : { f: "var(--bg-2)", s: "var(--line-2)", r: 4, sw: 1.5 },
        ) + T(x + 9, y + 15, b, { z: 12, c: "var(--text-dim)" });
    });
    g += T(8, 92, "Each bit flips on its own, with chance 1 in 20.", { a: "start", z: 13, c: "var(--amber-ink)" });
    return svg(416, 104, g);
  })();

  B.add("l1-ingredients", [
    {
      type: "pick",
      q: "A population of six 10-bit candidates is bred by selection and copying only: no mutation and no crossover. Each panel shows the six rows (one per candidate) at a different generation. Tap the panel after which recombination (crossover) on its own can no longer make anything new.",
      fig: ingGrids,
      a: "c",
      why: "By generation 30 all six rows are identical. Crossing two identical parents gives a child identical to both, so recombination has nothing to mix. At generation 4 there are still three different rows, so crossover could still build new combinations. Selection alone shrinks variety; mutation is what puts new variety back in.",
    },
    {
      type: "pick",
      q: "Selection should have a weak bias towards the fittest: fitter parents are likelier, but nobody is ruled out. Each bar shows how a scheme shares parent slots among four candidates with fitness 8, 5, 2 and 1. Select every scheme that matches that description.",
      fig: ingBars,
      a: ["s3", "s5"],
      hint: "C splits 16 total fitness: 8, 5, 2 and 1 sixteenths.",
      why: "C gives shares of 8/16, 5/16, 2/16 and 1/16: the fittest is favoured, yet the weakest still has a 6% chance. E does the same by rank. A gives everyone else no chance at all, B has no bias, and D rules out the bottom two. Zero chances throw away variety; no bias throws away progress.",
    },
    {
      type: "pick",
      q: "Each dot is one run of a hill-climbing search on a landscape with a small hill (height 0.6) and a big mountain (height 1.0). In a run, a population of climbers starts at random places and each only walks uphill. The dot is the best height any climber reached. Tap the smallest population size for which all 12 runs reached the big mountain.",
      fig: ingDots,
      a: "n4",
      why: "With one climber, a start near the small hill ends up on it, so about half the runs are stuck at 0.6. With two climbers, both must be unlucky, which still happens now and then. With four climbers, at least one almost always starts in the mountain's catchment area, and every run reaches 1.0. A population is insurance against a bad start.",
    },
    {
      type: "pick",
      q: "One-point crossover: a child takes everything before the cut from Parent 1 and everything after it from Parent 2. Fitness is the number of 1s in the child. Tap the cut that gives the fittest child.",
      fig: ingCut,
      a: "c3",
      hint: "Count the 1s in the left part of P1 and the right part of P2 for each cut.",
      why: "Cutting after position 3 gives 111 from P1 and 1111100 from P2: 1111111100, which has eight 1s. Every other cut gives 7 or fewer (cut 1 or 2 gives 7, cut 4 or 5 gives 7, cut 6 gives 6, cut 7 or 9 gives 5, cut 8 gives 4). Crossover works when each parent has a good piece the other lacks.",
    },
    {
      type: "slider",
      q: "A parent has 40 bits. Mutation flips each bit independently with chance 1 in 20. On average, how many bits differ between a child and its parent?",
      fig: ingStrip,
      min: 0,
      max: 10,
      step: 1,
      ans: 2,
      tol: 1,
      unit: " bits",
      hint: "40 bits, each with a 1 in 20 chance: 40 ÷ 20.",
      why: "Expected flips = number of bits × chance per bit = 40 × 1/20 = 2. A rate of about one flip per child makes mutation a small tweak, which is what an EA wants: small changes mostly stay near a good parent, and the odd child still lands somewhere new.",
    },
  ]);

  /* =====================================================================
     l1-apps
     ===================================================================== */
  const appsScatter = (() => {
    const P = { A: [1, 4], B: [2, 8], C: [3, 9], D: [4, 12], E: [5, 13], F: [2, 5], G: [6, 14], H: [3, 12] };
    const x0 = 50,
      y1 = 250,
      W = 350,
      H = 220,
      X = (s) => x0 + (s / 6.5) * W,
      Y = (g) => y1 - (g / 15) * H;
    let g = "";
    for (let i = 0; i <= 6; i++)
      g += L(X(i), y1, X(i), Y(15), { c: "var(--line)", sw: 1 }) + T(X(i), y1 + 18, i, { z: 12, c: "var(--text-dim)" });
    for (let v = 0; v <= 15; v += 5)
      g +=
        L(x0, Y(v), X(6.5), Y(v), { c: "var(--line)", sw: 1 }) +
        T(x0 - 10, Y(v) + 4, v, { a: "end", z: 12, c: "var(--text-dim)" });
    g += L(x0, y1, X(6.5), y1) + L(x0, y1, x0, Y(15));
    g +=
      T(235, y1 + 38, "Size (cm)", { z: 13, c: "var(--text-dim)" }) +
      T(12, 130, "Gain (dB)", { z: 13, c: "var(--text-dim)" }).replace(
        "<text ",
        `<text transform="rotate(-90 12 130)" `,
      );
    Object.entries(P).forEach(
      ([k, [s, ga]]) =>
        (g += `<g data-pick="${k}">${C(X(s), Y(ga), 13, { s: "var(--blue)", sw: 3 })}${T(X(s), Y(ga) + 5, k, { z: 13, c: "var(--ink)" })}</g>`),
    );
    return svg(420, 288, g);
  })();

  const appsGantt = (() => {
    const x0 = 44,
      W = 380,
      top = 24,
      rh = 19;
    let g = "";
    for (let k = 0; k <= 5; k++) {
      const x = x0 + (k / 5) * W;
      g +=
        L(x, top - 4, x, top + 10 * rh, { c: "var(--line)", sw: 1 }) +
        T(x, top + 10 * rh + 16, k * 30, { z: 12, c: "var(--text-dim)" });
    }
    for (let m = 0; m < 10; m++) {
      g += T(x0 - 8, top + m * rh + 13, "M" + (m + 1), { a: "end", z: 11, c: "var(--text-dim)" });
      for (let b = 0; b < 5; b++)
        g += R(x0 + (b / 5) * W + 1.5, top + m * rh + 1, W / 5 - 3, rh - 3, {
          f: b % 2 ? "var(--blue)" : "var(--teal)",
          s: b % 2 ? "var(--blue-ink)" : "var(--teal-ink)",
          r: 4,
          sw: 1.5,
        });
    }
    g += T(x0 + W / 2, top + 10 * rh + 36, "seconds into one generation (each block = one 30-second simulation)", {
      z: 12,
      c: "var(--text-dim)",
    });
    return svg(440, top + 10 * rh + 46, g);
  })();

  const appsHeat = (() => {
    const px = 5,
      py = 2,
      v = (c, r) => Math.max(0, 8 - (Math.abs(c - px) + Math.abs(r - py)));
    const rules = [
      ["P", (c, r) => v(c, r) / 8],
      ["Q", (c, r) => (c === px && r === py ? 1 : 0)],
      ["R", (c, r) => Math.floor(v(c, r) / 3) / 2],
    ];
    const cs = 19;
    let g = "";
    rules.forEach(([name, fn], pi) => {
      const ox = 4 + pi * 150;
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 7; c++) {
          const val = fn(c, r);
          g += `<rect x="${ox + 8 + c * cs}" y="${8 + r * cs}" width="${cs}" height="${cs}" fill="var(--panel)" stroke="var(--line)" stroke-width="1"/><rect x="${ox + 8 + c * cs}" y="${8 + r * cs}" width="${cs}" height="${cs}" fill="var(--teal)" fill-opacity="${val}" stroke="var(--line)" stroke-width="1"/>`;
        }
      g +=
        T(ox + 8 + px * cs + cs / 2, 8 + py * cs + 13, "★", { z: 13, c: "var(--ink)" }) +
        T(ox + 8 + 3.5 * cs, 8 + 7 * cs + 20, "Score " + name, { z: 14 });
    });
    return svg(450, 176, g);
  })();
  Object.assign(partScope, { appsGantt, appsHeat, appsScatter });
})();

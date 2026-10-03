(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { cutFig, ln, path, svg, tx } = partScope;
  const B = NIC.bank;
  const runCharts = () => {
    const runs = [
      ["Run 1", (g) => 30 + 30 * (1 - Math.exp(-g / 2.5)), (g) => 100 * Math.exp(-g / 3)],
      [
        "Run 2",
        (g) => 30 + 4 * (1 - Math.exp(-g / 10)) + 1.5 * Math.sin(g * 1.3),
        (g) => 95 - 0.1 * g + 2 * Math.sin(g * 0.9),
      ],
      ["Run 3", (g) => 30 + 62 * (1 - Math.exp(-g / 16)), (g) => 100 * Math.exp(-g / 45)],
    ];
    return svg(
      480,
      214,
      runs
        .map(([nm, bf, df], k) => {
          const x0 = 14 + k * 156,
            X = (g) => x0 + 22 + (g / 50) * 120,
            Y = (v) => 150 - v * 1.1,
            b = [],
            d = [];
          for (let g = 0; g <= 50; g++) {
            b.push([X(g), Y(bf(g))]);
            d.push([X(g), Y(df(g))]);
          }
          return `${ln(x0 + 22, 150, x0 + 142, 150, "var(--line-2)", 2)}${ln(x0 + 22, 38, x0 + 22, 150, "var(--line-2)", 2)}${path(b, "var(--teal)", 3)}${path(d, "var(--amber)", 3, "6 4")}${tx(x0 + 82, 24, nm, { f: "900 14px" })}${tx(x0 + 82, 172, "generation", { f: "700 11px", c: "var(--text-faint)" })}`;
        })
        .join("") +
        `${tx(240, 204, "solid green = best fitness, dashed orange = diversity (how different the members are)", { f: "700 11px", c: "var(--text-dim)" })}`,
    );
  };

  B.add("l3-population", [
    {
      type: "pick",
      q: "Fitness is the number of 1s (8 is the maximum). Each parent scores 4. A child takes the first k bits from Parent 1 and the rest from Parent 2. Click the cut that gives the best child.",
      fig: cutFig(),
      a: "c4",
      why: "Cutting after bit 4 joins Parent 1's four 1s (left half) to Parent 2's four 1s (right half), giving 11111111 with fitness 8. Each parent holds a different good half, which is exactly what recombination can combine and mutation alone could not do in one step.",
    },
    {
      type: "cat",
      q: "OneMax fitness is the number of 1s. Look at each population of four strings. Is it converged in genes, converged only in fitness, or not converged?",
      buckets: ["Not converged", "Same fitness, different genes", "Identical genes"],
      items: [
        ["10000, 11100, 01111, 11001", 0],
        ["11111, 01110, 10001, 00011", 0],
        ["10110, 01101, 11010, 01011", 1],
        ["01100, 10010, 00101, 11000", 1],
        ["11100, 11100, 11100, 11100", 2],
        ["00111, 00111, 00111, 00111", 2],
      ],
      hint: "Count the 1s in each string first. Then ask whether the strings are the same.",
      why: "The first two sets have a mix of scores (1, 3, 4, 3 and 5, 3, 2, 2). In the next two every string has three or two 1s, but the strings differ, so only the fitness has converged. In the last two the genes are identical, which also means the same fitness.",
    },
    {
      type: "match",
      q: "Each chart tracks one EA run: best fitness (solid green) and diversity (dashed orange). Match each run to its diagnosis.",
      fig: runCharts(),
      pairs: [
        ["Run 1", "Premature convergence"],
        ["Run 2", "Almost no selection pressure"],
        ["Run 3", "Healthy progress"],
      ],
      why: "Run 1: diversity collapses within a few generations and the best fitness freezes well below the top, so the population has converged too soon. Run 2: diversity stays high but nothing improves, so selection is not favouring the fit. Run 3: fitness climbs while diversity fades slowly.",
    },
    {
      type: "order",
      q: "Put the usual story of a population converging in order.",
      items: [
        "A random, varied population is created",
        "Selection favours the fitter members",
        "Copies of good solutions spread through the population",
        "Members end up with the same genes",
        "Crossover of identical parents makes nothing new, so progress now relies on mutation",
      ],
      why: "Selection spreads good solutions, which reduces diversity. Once members are alike, crossover just reproduces them. Some convergence is progress, but too much too early leaves only mutation to explore.",
    },
    {
      type: "bug",
      q: "This EA is meant to combine two different parents, but its children never contain anything new from recombination. Click the faulty line.",
      code: [
        "p1 = tournament(pop, size=2)",
        "p2 = tournament(pop, size=2)",
        "child = crossover(p1, p1)",
        "child = mutate(child)",
        "replace_weakest(pop, child)",
      ],
      a: 2,
      why: "crossover(p1, p1) mixes a parent with itself, so the child is just a copy of p1 before mutation. It should be crossover(p1, p2) so that material from two different solutions is combined.",
    },
  ]);
})();

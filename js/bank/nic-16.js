(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { gridFig, labFig } = partScope;
  const B = NIC.bank;
  B.add("l4-lab", [
    {
      type: "pick",
      q: "The dashboard of one lab run is below (generations on the x axis). Tap the first mark at which the run is already stuck for good.",
      fig: labFig,
      a: "g12",
      why: "Diversity hits 0 at generation 12 and the mean has caught up with the best, so every member is the same. With no mutation left to create anything new, nothing can improve after that. At generation 8 diversity is still above 0 and the mean is still climbing.",
    },
    {
      type: "mcq",
      q: "All three runs spent exactly 2,000 fitness evaluations on the same picture. Why does run C trail?",
      fig: `<table class="t"><tr><th>Run</th><th>Population</th><th>Scheme</th><th class="num">Final best</th></tr><tr><td>A</td><td>10</td><td>steady-state, 1 child per step</td><td class="num">0.88</td></tr><tr><td>B</td><td>100</td><td>steady-state, 1 child per step</td><td class="num">0.80</td></tr><tr><td>C</td><td>100</td><td>generational, 100 children per generation</td><td class="num">0.71</td></tr></table>`,
      o: [
        "It got only 20 generations, as each one costs 100 evaluations",
        "Big populations can never beat small ones in a fixed budget",
        "Generational schemes are not able to use any mutation at all",
        "2,000 evaluations is too few for a population of any size",
      ],
      a: 0,
      why: "The budget is shared out differently: run C gets 2000 ÷ 100 = 20 generations of improvement, run B gets 2000 steps and run A gets 2000 steps on a small population. When the budget is fixed, a bigger population means fewer rounds of selection. That is the cost of more diversity.",
    },
    {
      type: "order",
      q: "Put the typical story of a lab run in order.",
      items: [
        "The population starts as random noise, with about half the pixels right",
        "The best rises fast as good pixels spread through the population",
        "Progress slows because most pixels are already right",
        "Only rare lucky mutations fix the last few wrong pixels",
      ],
      why: "Random pictures match about half the pixels, so early improvements are cheap and spread quickly. As the picture fills in, fewer changes help, and the last fixes need a lucky mutation to hit exactly the right pixel.",
    },
    {
      type: "slider",
      q: "This best candidate has 4 wrong pixels (red outlines) out of 144. A mutation flips exactly one random pixel. About what percentage of such mutants are better than the parent?",
      fig: gridFig,
      min: 0,
      max: 20,
      step: 1,
      ans: 3,
      tol: 2,
      unit: "%",
      hint: "A flip helps only if it hits one of the 4 wrong pixels: 4 out of 144, about 1 in 36.",
      why: "Only the 4 wrong pixels can be improved, so 4/144 ≈ 3% of single flips help. The other 97% make it worse. That is why late progress is slow: the closer you get, the harder improvements are to find.",
    },
    {
      type: "bug",
      q: "This fitness function should give 1.0 for a perfect copy of the target. Tap the faulty line.",
      code: [
        "def fitness(pic, target):",
        "    wrong = sum(1 for a, b in zip(pic, target) if a != b)",
        "    return wrong / len(target)",
      ],
      a: 2,
      why: "wrong / len(target) is the error rate: 0 for a perfect copy and larger for worse pictures, so the GA would be steered towards the worst pictures. Fitness should be 1 - wrong / len(target).",
    },
  ]);
})();

(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { divFig, tbl } = partScope;
  const B = NIC.bank;
  B.add("l4-lab", [
    {
      type: "pick",
      q: "In the lab, algorithm 1 (steady-state, mutation only, population 30) was run with three tournament sizes. Diversity and best fitness after 600 evaluations are shown. Tap the setting that is most at risk of premature convergence.",
      fig: divFig,
      a: "30",
      why: "With t = 30 almost every pick is the current best, so diversity has fallen to 1%: the population is nearly all copies. Its best score is highest so far, but with no variety left only rare mutations can improve it, so on a harder target it would stall. t = 1 keeps variety but climbs slowly.",
    },
    {
      type: "mcq",
      q: "These lab runs used algorithm 1 on the heart picture (144 pixels), typical runs, up to 20,000 evaluations. Why did the 0.05 run not reach 144?",
      fig: tbl(
        ["Mutation per bit", "Flips per child", "Result"],
        [
          ["0.0001", "0.01", "stuck at 135"],
          ["1/144", "1", "144 after about 3,000 evaluations"],
          ["0.05", "7.2", "stuck at 138"],
          ["0.2", "29", "stuck at 109"],
        ],
      ),
      o: [
        "A child flips about 7 bits, so it usually breaks more correct pixels than it fixes",
        "Seven flips per child means too few new pictures are tried, so exploration is poor",
        "A population of 30 is too small to hold the extra variety that this rate creates",
        "Tournament selection stops working as soon as the mutation rate passes 1 flip",
      ],
      a: 0,
      why: "Near the end, only a few pixels are wrong, and each child flips about 7 random ones. Nearly every flip hits a correct pixel, so children are almost always worse and replace-worst rejects them. Rate 1/144 changes about one pixel, which is the right size of step. The tiny rate 0.0001 has almost no flips at all, and 0.2 is close to random.",
    },
    {
      type: "match",
      q: "Match each lab setting to what you would see.",
      pairs: [
        ["Population of 4", "Quick early gains, then variety runs out"],
        ["Tournament size 10 on 30 members", "Diversity line collapses almost at once"],
        ["Mutation 0.05 per bit", "Best creeps up but stays noisy and short of perfect"],
        ["Elites = 0 (generational)", "The best score can drop between generations"],
      ],
      why: "A tiny population has too little variety to keep improving. A large tournament makes selection greedy, so copies of the best flood the population. A high mutation rate scrambles good pictures about as fast as it finds them. Without elites, the champion can be lost in a bad round.",
    },
    {
      type: "bug",
      q: "This lab mutation should flip each pixel with probability pm (a small number). Tap the faulty line.",
      code: [
        "child = []",
        "for b in x:",
        "    if random() > pm:    # flip this pixel",
        "        b = 1 - b",
        "    child.append(b)",
      ],
      a: 2,
      why: "random() > pm is true most of the time (about 99% for a small pm), so nearly every pixel flips and the child is the photo-negative of the parent. It should be random() < pm.",
    },
    {
      type: "cat",
      q: "Which knob change would you try for each dashboard symptom in the lab?",
      buckets: ["Lower selection pressure or raise mutation", "Raise selection pressure"],
      items: [
        ["Diversity hit 0 at generation 40 while the best sits at 0.92", 0],
        ["The mean is far below the best and has not moved in 200 generations", 1],
        ["Best, mean and diversity all stay flat, with a wide spread of members", 1],
        ["All 30 thumbnails look identical, 6 pixels wrong", 0],
        ["Every run converges to a different wrong picture", 0],
      ],
      why: "Identical members (diversity near 0) mean selection is too strong: soften it or add mutation to get variety back. Lots of variety but no progress means selection is too weak to exploit what it has found. Different wrong pictures every run are a sign of early convergence in each run, so look at loosening pressure as well.",
    },
  ]);
})();

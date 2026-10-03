(function () {
  const partScope = (NIC.shared.bankNic = NIC.shared.bankNic || {});
  const { M, TF } = partScope;
  const B = NIC.bank;
  B.add("l4-lab", [
    M(
      "Target is 144 pixels. A candidate has 18 wrong. Fitness?",
      ["0.5", "0.75", "0.875", "0.99"],
      2,
      "18 wrong is 1/8 of 144, so 7/8 = 0.875 match.",
      { hint: "18 is one-eighth of 144." },
    ),
    M(
      "Diversity reads 1. What does that mean?",
      [
        "Every member of the population is identical",
        "Members are all different from each other",
        "The best member has perfect fitness",
        "Mutation has been switched off",
      ],
      1,
      "Diversity 0 = identical, 1 = all different.",
    ),
    M(
      "All the population thumbnails look identical. What has happened?",
      [
        "The population is very diverse",
        "The population has converged",
        "The display has a bug",
        "Mutation is set very high",
      ],
      1,
      "Everyone is a copy.",
    ),
    M(
      "How big is the search space of 12×12 black/white pictures?",
      ["144", "144²", "2¹⁴⁴", "12!"],
      2,
      "Each pixel is on or off: 2¹⁴⁴.",
    ),
    TF(
      "With no selection at all (random parents), best fitness improves only a little.",
      true,
      "Nothing favours better pictures, so progress is mostly luck.",
    ),
    M(
      "You raise the tournament size. Expected effect?",
      [
        "Slower convergence and more diversity, since tournaments are fairer",
        "Faster convergence, faster loss of diversity",
        "No effect on the run",
        "Fitness drops over time",
      ],
      1,
      "More pressure.",
    ),
    M(
      'Elitism is on. What does the "best" line look like?',
      ["It jumps around", "It never goes down", "It always goes down", "It's flat at 0"],
      1,
      "The best is always kept.",
    ),
    M(
      "Best fitness is stuck at 0.95 and diversity is 0. What might help?",
      [
        "Lower mutation further, so the good solution isn't disturbed",
        "Raise mutation a little to restore variation",
        "Raise selection pressure",
        "Stop the run now",
      ],
      1,
      "Only mutation can reintroduce variety once everyone is the same.",
    ),
  ]);
})();

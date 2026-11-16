/* Nature-Inspired boss quiz for Lecture 15 (multi-objective particle swarm optimisation): a ferry timetable planner, fresh scenarios, mixed formats. Numbers checked with node. */
(function () {
  const N = NIC;
  const Qf = N.qfig;

  N.registerBoss({
    id: "l15-boss",
    lecture: 15,
    title: "Lecture 15 boss quiz",
    blurb:
      "Ten questions: pbest rules, the archive, pruning, leader selection and many objectives, for a ferry planner.",
    lede: "Tidewise plans harbour ferry timetables with a multi-objective PSO. Every timetable has a fuel use and an average passenger wait, and both should be as small as possible. Help it keep its bests, its archive and its leaders in order, without a calculator.",
    qs: [
      {
        type: "mcq",
        q: "A particle's pbest is the timetable (4, 6) as (fuel, wait). It moves to (5, 3). Tidewise uses the 'keep the oldest' rule. What is the pbest now?",
        o: [
          "Still (4, 6)",
          "(5, 3)",
          "The average, (4.5, 4.5)",
          "Whichever has lower fuel, (4, 6) or (5, 3), picked at random",
        ],
        a: 0,
        why: "Keep-the-oldest replaces pbest only if the new position dominates it. (5, 3) is worse on fuel, so it does not dominate (4, 6), and pbest stays. Keep-the-newest would have moved to (5, 3).",
      },
      {
        type: "cat",
        q: "The archive holds (2, 8), (4, 5) and (7, 2) as (fuel, wait). Sort each newcomer by what happens to it.",
        buckets: ["Joins and removes a member", "Joins, removes nobody", "Turned away"],
        items: [
          ["(3, 4)", 0],
          ["(6, 1)", 0],
          ["(1, 9)", 1],
          ["(3, 7)", 1],
          ["(5, 6)", 2],
          ["(8, 2)", 2],
        ],
        why: "(3, 4) beats (4, 5) and (6, 1) beats (7, 2). (1, 9) and (3, 7) trade off against every member. (5, 6) is beaten by (4, 5), and (8, 2) by (7, 2): a tie on wait plus more fuel.",
      },
      {
        type: "pick",
        q: "Archive members A to E as (fuel, wait), and a newcomer N at (3, 3). Click every archive member that N removes.",
        fig: Qf.points({ A: [1, 7], B: [2, 5], C: [4, 4], D: [5, 3], E: [7, 1], N: [3, 3] }),
        a: ["C", "D"],
        why: "N (3, 3) beats C (4, 4) on both and D (5, 3) on fuel with a tie on wait. A and B use less fuel, and E waits less, so they stay. N itself joins.",
      },
      {
        type: "order",
        q: "Put Tidewise's archive update for one new timetable y in order.",
        items: [
          "Take the next archive member a",
          "If y dominates a, remove a",
          "If a dominates y, mark y as dominated",
          "After the last member, add y only if it is not marked",
        ],
        why: "y is compared with every member: it removes those it dominates and is marked if any member dominates it. Only an unmarked y joins.",
      },
      {
        type: "slider",
        q: "The capped archive is P (1, 9), Q (2, 8), R (3, 5), S (7, 3), T (9, 1) as (fuel, wait). Estimate R's crowding distance.",
        min: 0,
        max: 2,
        step: 0.05,
        ans: 1.25,
        tol: 0.1,
        hint: "Fuel: R's neighbours are Q (2) and S (7), gap 5, range 9 − 1 = 8. Wait: neighbours S (3) and Q (8), gap 5, range 8.",
        why: "5 ÷ 8 + 5 ÷ 8 = 0.625 + 0.625 = 1.25. P and T are the ends and score ∞.",
      },
      {
        type: "match",
        q: "Match each part of Tidewise's MOPSO to what it does.",
        pairs: [
          ["Clustering", "Keeps the member nearest each cluster centre"],
          ["Crowding distance pruning", "Removes the most crowded member, then recomputes"],
          ["Dominated solution count", "Favours leaders that dominate few particles"],
          ["Hypervolume leader", "Uses the particle as the reference point"],
        ],
        why: "Clustering and crowding distance both prune an overfull archive. Dominated count and hypervolume both choose leaders from it.",
      },
      {
        type: "multi",
        q: "Tidewise caps its archive at 20 timetables. Which reasons from the lecture support a cap?",
        o: [
          "Finding leaders in a large archive is expensive",
          "Harbour managers cannot use hundreds of options",
          "A diversity rule can keep the 20 spread out",
          "Dominance stops working above 20 members",
          "Particles move faster with fewer archive members",
        ],
        a: [0, 1, 2],
        why: "A cap keeps leader search cheap and gives a readable choice, and a diversity-preserving rule decides who leaves. Dominance works at any size, and the cap does not change how particles move.",
      },
      {
        type: "mcq",
        q: "A particle sits at (8, 8) as (fuel, wait). The archive members that dominate it are (2, 6), (4, 3) and (7, 1). Using hypervolume, which leads it?",
        o: ["(4, 3)", "(2, 6)", "(7, 1)", "One of the three, at random"],
        a: 0,
        hint: "Each member's own box runs to the next member's fuel and the previous member's wait (or to the particle). (2, 6): 2 × 2. (4, 3): 3 × 3. (7, 1): 1 × 2.",
        why: "Own shares: (2, 6) adds 4, (4, 3) adds 9, (7, 1) adds 2. The largest contribution leads. Random choice is only for a particle that no member dominates.",
      },
      {
        type: "bug",
        q: "This pseudocode should update Tidewise's archive A with a new timetable y. Click the faulty line.",
        code: [
          "marked = false",
          "for each a in A:",
          "    if y dominates a: remove a from A",
          "    else if a dominates y: marked = true",
          "if marked: add y to A",
        ],
        a: 4,
        why: "y should join only if no member dominates it: 'if not marked'. As written, the archive would keep dominated timetables and lose the good ones.",
      },
      {
        type: "mcq",
        q: "Tidewise adds three more objectives, five in all. Among the archive, timetable K ranks 1, 1, 5, 5 and 3 on the five objectives; timetable L ranks 2, 2, 2, 3 and 3. Which does average rank prefer as a leader?",
        o: ["L", "K", "They tie"],
        a: 0,
        hint: "Add the ranks: K is 15, L is 12. Divide each by 5.",
        why: "K averages 15 ÷ 5 = 3 and L averages 12 ÷ 5 = 2.4. Lower is better, so L is preferred, though K is best on two objectives.",
      },
    ],
  });
})();

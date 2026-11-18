/* l15-05: Lecture 15 lessons 15.4 to 15.6: pruning by crowding distance, choosing leaders, and many-objective rankings. Figures come from l15-02 and l15-03 (NIC.shared.nicL15). */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS;
  const sh = NIC.shared.nicL15;
  const { C, pr, pruneView, cuboidFig, crowdPruneFig } = sh;
  const { tallyFig, countFig, hvFig, manyFig15, avgFig, distFig, leaderLab } = sh;

  // ---------- 15.4 prune the crowd, keep the ends (demo) ----------
  N.register({
    id: "l15-prune",
    lecture: 15,
    order: 4,
    num: "15.4",
    title: "Prune the crowd, keep the ends",
    blurb:
      "Drop the most crowded member, recompute, repeat: crowding distance keeps the archive spread and its ends safe.",
    render(root) {
      root.appendChild(
        header(
          this,
          "Twelve archive members on one front. Change the <b>Archive cap</b> and switch between <b>Crowding distance</b> and <b>Clustering</b> to see who survives.",
        ),
      );
      const card = el(
        `<div class="card nw13-demo"><div class="card-head"><h2>Prune an archive</h2></div><div data-box></div></div>`,
      );
      root.appendChild(card);
      pruneView(qs("[data-box]", card), { methods: ["crowd", "clu"], cap: 6, slider: true });
      root.appendChild(
        pr(
          "l15-bounded-2",
          "With <b>Crowding distance</b>, slide the cap from 11 down to 2. Which two members are left at the end? | a and l, the two ends | f and g, the middle of the front | h and i, the two loners | The ends have crowding distance ∞, so they are always the last ones standing.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Crowding distance</b> (as in NSGA-II) scores each member's elbow room; the two ends get ∞.",
            "To prune, drop the <b>smallest</b> distance, <b>recompute</b>, and repeat until the archive fits.",
            "Crowding always keeps the ends; <b>clustering</b> can lose an end inside a cluster.",
          ],
          "Prune the crowd, not the frontier.",
        ),
      );
    },
  });

  L["l15-prune"] = {
    sum: "Crowding distance scores each archive member by the gaps to its neighbours, with the ends at ∞. Pruning drops the smallest distance, recomputes and repeats, so it always keeps the ends, unlike clustering.",
    steps: [
      {
        t: "Crowding distance, again",
        b: `<p>Recap from <b>Lesson 13.4</b>: a member's <b>crowding distance</b> measures its elbow room. Add up the gaps to its neighbours along each goal, each divided by that goal's range.</p><p>A <b>low</b> score means a crowded spot and a <b>high</b> one an isolated spot, and the two <b>ends get ∞</b>. Tap members to see each one's box and score.</p><details class="math-more"><summary>Show the maths</summary><p>Sort the archive by each objective $m$; with neighbours $i-1$ and $i+1$ in that order,</p>$$d_i=\\sum_{m=1}^{M}\\frac{f_m^{(i+1)}-f_m^{(i-1)}}{f_m^{\\max}-f_m^{\\min}},\\qquad d_{\\text{ends}}=\\infty$$<p>Example: f sits between e $(3.6, 4.3)$ and g $(4.4, 3.6)$. Gaps 0.8 and 0.7, ranges 9 and 9: $0.09 + 0.08 = 0.17$.</p></details>`,
        v: (b) => cuboidFig(b),
        c: C(
          "In a crowding-distance archive, which member has the best chance of surviving a prune? | An end of the front | The member with the smallest distance | The member nearest the front's middle | Pruning removes the smallest distances first, and the ends score ∞, so they are always kept.",
        ),
      },
      {
        t: "Thinning the seedlings",
        b: `<p>Thinning a crowded seed tray, you pull the seedling with the least room, then look again.</p><p>Pruning by crowding distance works the same way. Compute every distance, remove the member with the <b>smallest</b>, then <b>recompute</b>, because its neighbours just got more room. Repeat until the archive fits. From 12 down to 6, one member of each clump survives, plus all three loners. Step through it.</p>`,
        v: (b) => crowdPruneFig(b),
        c: C(
          "Why are crowding distances recomputed after each removal? | The removed member's neighbours now have more room | The ends of the front move after every removal | Removing a member changes who dominates whom | Removing one member widens its neighbours' gaps, so their distances rise. Using stale numbers could empty a whole stretch of the front.",
        ),
      },
      {
        t: "Clustering or crowding?",
        b: `<p>Both rules keep the archive spread, but they have different habits.</p><p><b>Crowding distance</b> always keeps the two ends. <b>Clustering</b> keeps a central member of each cluster, so an end can merge into a cluster and vanish. At cap 5, clustering puts l in with i, j and k, keeps k, and loses the longest-time end. Switch between them.</p>`,
        v: (b) => pruneView(b, { methods: ["crowd", "clu"], cap: 5 }),
      },
    ],
    guide: [
      "Slide the <b>Archive cap</b> down and watch who turns grey.",
      "Switch between <b>Crowding distance</b> and <b>Clustering</b> at the same cap.",
      "Answer the question after the demo.",
    ],
  };

  // ---------- 15.5 who leads the swarm? (demo) ----------
  N.register({
    id: "l15-leaders",
    lecture: 15,
    order: 5,
    num: "15.5",
    title: "Who leads the swarm?",
    blurb:
      "No single global best: pick leaders from the archive at random, by crowding, by dominated count or by hypervolume.",
    render(root) {
      root.appendChild(
        header(
          this,
          "Five archive members (blue) and seven particles (red). Tap a particle, then switch between <b>Random</b>, <b>Dominated count</b> and <b>Hypervolume</b> to see who would lead it.",
        ),
      );
      leaderLab(root);
      root.appendChild(
        pr(
          "l15-leaders-2",
          "Choose <b>Dominated count</b>. Which member is least likely to lead? | c | a | e | c dominates four particles (P, T, U and V), more than anyone else, so its weight is the smallest. It sits where the swarm is already crowded.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "MOPSO picks a <b>leader</b> from the archive for each particle; <b>random</b> is simplest, preferring <b>sparse</b> members spreads the swarm.",
            "<b>Dominated count</b>: members that dominate many particles are less likely to lead.",
            "<b>Hypervolume</b>: with the particle as reference point, the largest own share leads; if nobody dominates it, pick at random.",
          ],
          "Lead the swarm towards the empty parts of the front.",
        ),
      );
    },
  });

  L["l15-leaders"] = {
    sum: "Leaders come from the archive: at random, preferring sparse regions, by how few swarm members they dominate, or by their hypervolume contribution with the particle as reference point.",
    steps: [
      {
        t: "Draw a leader from a hat",
        b: `<p>Plain PSO pulls every particle towards one point, g. In MOPSO the best is a set, the archive, so each particle needs its own <b>leader</b> chosen from it.</p><p>The simplest rule is like drawing a name from a hat: pick a member <b>at random</b>, so every member has the same chance. Pick a few, then 100 more, and watch the tally even out.</p>`,
        v: (b) => tallyFig(b, ["rand"]),
      },
      {
        t: "Prefer the quiet corners",
        b: `<p>Random choice ignores where the swarm already is. To <b>maintain diversity</b>, prefer leaders in <b>sparser</b> parts of the archive, so particles get drawn into the gaps of the front.</p><p>One way: draw two members and keep the one with the larger <b>crowding distance</b>. The ends score ∞, so they win most duels and the middle members lead less often. Compare the tallies.</p>`,
        v: (b) => tallyFig(b, ["rand", "sparse"]),
        c: C(
          "Why prefer leaders from sparse parts of the archive? | They pull particles into the gaps of the front | They are always the newest archive members | They dominate more of the swarm than others | A leader in an empty region draws particles there, so new non-dominated solutions fill the gaps.",
        ),
      },
      {
        t: "Dominated solution count",
        b: `<p>A tour guide with a huge group already? Send newcomers to a quieter guide.</p><p>For each archive member, count how many <b>swarm particles it dominates</b>. A member that dominates many sits where the swarm is already busy, so it is made <b>less likely</b> to lead. Tap the members to see the particles each one dominates.</p><details class="math-more"><summary>Show the maths</summary><p>With $n_i$ the number of swarm particles that archive member $\\mathbf{a}_i$ dominates, one simple choice is</p>$$P(\\mathbf{a}_i)=\\frac{1/(1+n_i)}{\\sum_j 1/(1+n_j)}$$<p>Here c dominates four particles (weight 1/5) and e only one (weight 1/2). The lecture only fixes the direction: more dominated particles, less likely to be chosen.</p></details>`,
        v: (b) => countFig(b),
        c: C(
          "Archive member A dominates 6 swarm particles; member B dominates 1. Under dominated solution count, which is more likely to lead? | B | A | Both equally | Members that dominate more of the swarm are less likely to be selected, so B is favoured: it is where fewer particles already are.",
        ),
      },
      {
        t: "Lead by hypervolume",
        b: `<p>Recap from <b>Lesson 13.6</b>: the <b>hypervolume</b> is the area a set dominates up to a <b>reference point</b>. Here the particle needing a leader is the reference point.</p><p>Each member that dominates it owns a slice of that area, its <b>contribution</b>: what would be lost without it. The <b>largest contribution</b> leads. If nobody dominates the particle, the leader is picked <b>at random</b>. Step through each member's own box.</p><details class="math-more"><summary>Show the maths</summary><p>With the particle's objective vector $\\mathbf{r}$ as reference,</p>$$\\Delta HV(\\mathbf{a})=HV(A,\\mathbf{r})-HV(A\\setminus\\{\\mathbf{a}\\},\\mathbf{r}),\\qquad \\text{leader}=\\arg\\max_{\\mathbf{a}\\in A}\\Delta HV(\\mathbf{a})$$<p>For particle P at $(7, 7.5)$, dominated by b, c and d: b adds 1.5, c adds 4 and d adds 1.5, so c leads.</p></details>`,
        v: (b) => hvFig(b, true),
      },
    ],
    guide: [
      "Tap particle <b>Q</b> and switch between <b>Random</b>, <b>Dominated count</b> and <b>Hypervolume</b>.",
      "With <b>Hypervolume</b>, tap <b>R</b>: nobody dominates it.",
      "With <b>Dominated count</b>, find the member with the smallest bar.",
      "Answer the question after the demo.",
    ],
  };

  // ---------- 15.6 many goals, new rankings (no demo) ----------
  N.register({
    id: "l15-many",
    lecture: 15,
    order: 6,
    num: "15.6",
    title: "Many goals, new rankings",
    blurb: "With four or more objectives dominance stops working, so leaders are ranked by average rank or distance.",
    render(root) {
      root.appendChild(header(this, "Many-objective PSO: average rank and distance ranking."));
      root.appendChild(
        takeaways(
          [
            "Many objectives bring three problems: the front <b>can't be drawn</b>, <b>search weakens</b>, and the solutions needed grow <b>exponentially</b>.",
            "<b>Average rank</b>: rank members once per objective and average; a lower average is preferred.",
            "<b>Distance ranking</b>: sum the absolute objective differences to every other member; a larger total (less crowded) is preferred.",
          ],
          "When dominance goes blind, rank by places or by distance.",
        ),
      );
    },
  });

  L["l15-many"] = {
    sum: "With many objectives dominance stops separating solutions, the front can't be drawn and needs exponentially many points. Average rank and distance ranking replace dominance when choosing leaders.",
    steps: [
      {
        t: "Too many ways to win",
        b: `<p>Judge cars on price alone and it's easy. Add speed, comfort, safety and boot space, and almost every car wins at something.</p><p>With <b>four or more</b> objectives MOPSO hits the same walls as Lecture 13. The front <b>can't be drawn</b>. <b>Search weakens</b>, because almost every pair is mutually non-dominating, so dominance can't rank them. And the <b>number of solutions</b> needed grows <b>exponentially</b>. Slide M.</p><details class="math-more"><summary>Show the maths</summary><p>Around a point, the share of objective space that is comparable (it dominates the point or is dominated by it) is</p>$$\\frac{2}{2^{M}}$$<p>so with $M=6$ only $1/32$ of the space can be ranked by dominance. With 5 points along each objective, 2 objectives need 5 points and 5 objectives need 625.</p></details>`,
        v: (b) => manyFig15(b),
        c: C(
          "Which is NOT one of the three many-objective issues in the lecture? | Particles can no longer move | The front is hard to visualise | Dominance stops separating solutions | The three issues are visualisation, weaker search, and the exponential number of solutions needed. The PSO move itself still works.",
        ),
      },
      {
        t: "Average rank",
        b: `<p>In a decathlon, athletes are placed in each event and the places are combined. <b>Average rank</b> does the same.</p><p>Rank the archive members <b>once per objective</b> (1 = best), then take each member's <b>average</b> rank. A <b>lower</b> average makes a member more likely to lead. Being best at one thing doesn't help much if you're worst at the rest. Rank the columns one by one.</p><details class="math-more"><summary>Show the maths</summary><p>With $r_{im}$ the rank of member $i$ on objective $m$,</p>$$\\bar r_i=\\frac{1}{M}\\sum_{m=1}^{M} r_{im}$$<p>X ranks 3, 1, 2 and 1: average 1.75, the best here.</p></details>`,
        v: (b) => avgFig(b),
      },
      {
        t: "Distance ranking",
        b: `<p>Spreading picnic blankets on a lawn, the one far from everyone else has the most room.</p><p><b>Distance ranking</b> adds up, for each member, the <b>absolute differences</b> between its objective values and every other member's. A <b>large</b> total means it sits far from the rest, in an <b>uncrowded</b> region, so it is preferred. Pick a member to see its gaps.</p><details class="math-more"><summary>Show the maths</summary>$$r(\\mathbf{x}_i)=\\sum_{m=1}^{M}\\sum_{j\\ne i}\\big|f_m(\\mathbf{x}_i)-f_m(\\mathbf{x}_j)\\big|$$<p>For s1 = (1, 6, 3) against s2 = (2, 5, 4): 1 + 1 + 1 = 3. Add its gaps to s3 and s4 too and r(s1) = 25.</p></details>`,
        v: (b) => distFig(b),
        c: C(
          "Under distance ranking, member U has r = 40 and member V has r = 12. Which does the rule prefer? | U: it lies in a less crowded region | V: it lies closer to the other members | Neither: r only measures convergence | A larger summed distance means the member is far from the others, in an uncrowded part of the space, which is what the rule prefers.",
        ),
      },
    ],
  };
})();

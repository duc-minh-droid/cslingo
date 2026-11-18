/* l13-05: Lectures 13-14 lessons 13.4 to 13.6: niching and crowding distance, NSGA-II, and the limits (weighted sums, hypervolume, many objectives). Figures come from l13-02 and l13-03; the NSGA-II demo is in l13-workshop.js (sh.nsgaDemo, looked up at call time). */
(function () {
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL13;
  const { C, pr, nicheFig, crowdFig, duelFig } = sh;
  const { tourFig, nsgaFig, elitFig, wsFig, DENT, windFig, manyFig, pcFig } = sh;
  const S2 = [1, 1];

  // ---------- 13.4 prefer the lonely ones (no demo) ----------
  N.register({
    id: "l13-crowding",
    lecture: 13,
    order: 4,
    num: "13.4",
    title: "Prefer the lonely ones",
    blurb: "Break ties inside a front by how much room each solution has: niching or crowding distance.",
    render(root) {
      root.appendChild(header(this, "Two ways to break ties inside a front."));
      root.appendChild(
        takeaways(
          [
            "<b>Niching</b> counts neighbours within a <b>niche radius</b> and prefers the smaller count; the radius is a new parameter to tune.",
            "<b>Crowding distance</b> adds up the normalised gaps to each point's neighbours; the two ends get <b>∞</b>. No extra parameter.",
            "NSGA-II compares <b>rank first</b>; only on a tie does the larger crowding distance win.",
          ],
          "Rank first, then prefer the lonely.",
        ),
      );
    },
  });

  L["l13-crowding"] = {
    sum: "Ties inside a front are broken in favour of spread: niching prefers the smaller niche count (needs a niche radius), crowding distance prefers the larger gap to the neighbours (no parameter, ends get ∞). NSGA-II compares rank first, crowding distance second.",
    steps: [
      {
        t: "Count the neighbours",
        b: `<p>Picking a picnic spot, you'd choose the one with the fewest people nearby. <b>Niching</b> does just that.</p><p>Draw a circle of the <b>niche radius</b> round each point, count who is inside (itself included), and prefer the <b>smaller</b> count. The catch: too small and everyone counts 1, too big and everyone counts everyone. So the radius is a <b>new parameter</b> to tune. Slide it.</p><details class="math-more"><summary>Show the maths</summary><p>With niche radius $\\sigma$ and distance $d_{ij}$ between solutions $i$ and $j$, the niche count is</p>$$m_i=\\sum_{j}\\,[\\,d_{ij}\\le\\sigma\\,]$$<p>where $[\\cdot]$ is 1 when true and 0 otherwise. Prefer the smaller $m_i$. Classic fitness sharing uses a smooth version that falls from 1 to 0 as $d_{ij}$ grows to $\\sigma$.</p></details>`,
        v: (b, life) => nicheFig(b, life),
        c: C(
          "The niche radius is set so large that every circle holds the whole front. What happens to the tie-break? | Every count is equal, so it can't prefer anyone | It now always picks the two ends of the front | It works better, as each count includes more points | When every count is the same the counts carry no information, so ties are back to random.",
        ),
      },
      {
        t: "Measure the elbow room",
        b: `<p>NSGA-II measures elbow room instead, with the <b>crowding distance</b>.</p><p>For each point on a front, look at its two neighbours along each goal: together they make a box round it. Add up the box's sides, each divided by that goal's range so different units compare fairly. A big total means plenty of room. The two <b>ends</b> of a front get <b>∞</b>, so they are always kept. Step through it.</p><details class="math-more"><summary>Show the maths</summary><p>Sort the front $Y$ of $N$ points by each objective $m$ in turn. The ends get $d_1=d_N=\\infty$; each inner point adds</p>$$d_i \\mathrel{+}= \\frac{Y^m_{i+1}-Y^m_{i-1}}{f^{\\max}_m-f^{\\min}_m},\\qquad i=2,\\dots,N-1$$<p>For Q at $(2, 6)$: along $f_1$ the gap is $3 - 1 = 2$ out of a range of 8, so $0.25$; along $f_2$ it is $9 - 5 = 4$ out of 8, so $0.5$. Total $0.75$.</p></details>`,
        v: (b) => crowdFig(b),
      },
      {
        t: "Rank first, room second",
        b: `<p>A league table sorts by points first, and looks at goal difference only on a tie. NSGA-II compares two solutions the same way.</p><p>The lower <b>rank</b> wins outright. Only when the ranks are equal does <b>crowding distance</b> decide, and the <b>larger</b> distance wins. So a rank 0 point with little room still beats a rank 1 point with ∞. Try the three duels.</p>`,
        v: (b) => duelFig(b),
      },
      {
        t: "Niching or crowding?",
        b: `<p>Both tie-breakers reward solutions in empty regions, so both keep the front spread.</p><p>The difference is the set-up. Niching needs a <b>niche radius</b>, and a bad choice blinds it. Crowding distance measures the gaps between neighbours directly, so it has <b>no extra parameter</b> to tune. That is one reason NSGA-II uses it.</p>`,
        v: F.compare(
          {
            title: "Niching",
            c: "violet",
            body: "count neighbours in a radius<br>prefer the smaller count<br>needs a niche radius",
          },
          {
            title: "Crowding distance",
            c: "teal",
            body: "measure the gaps to neighbours<br>prefer the larger distance<br>no extra parameter",
          },
        ),
        c: C(
          "Why is crowding distance easier to set up than niching? | There is no niche radius to choose | It only works with a single objective | It ignores how close the points are | Niching depends on a radius that must be tuned. Crowding distance uses the neighbours' gaps, which the front provides.",
        ),
      },
    ],
  };

  // ---------- 13.5 NSGA-II (demo) ----------
  N.register({
    id: "l13-nsga",
    lecture: 13,
    order: 5,
    num: "13.5",
    title: "NSGA-II: keep the best, spread the rest",
    blurb: "Same GA loop, new selection: merge parents and children, sort, crowd, and keep the elite.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A small NSGA-II with 12 solutions, minimising cost and power shortfall. Press <b>Step generation</b> or <b>Run</b> and watch the population settle on the dashed true front, then switch to <b>Non-elitist</b> and compare.",
        ),
      );
      sh.nsgaDemo(root, life);
      root.appendChild(
        pr(
          "l13-nsga-2",
          "Switch to <b>Non-elitist</b> and run 30 generations. Compared with elitist, what do you usually see? | Fewer solutions near the front and a narrower spread | More solutions near the front, found faster | Exactly the same picture, since the operators are unchanged | Without elitism the children replace the parents, so good solutions can be lost and the search drifts. Keeping the best of parents and children is what makes NSGA-II converge quickly.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Crossover and mutation stay the same; <b>selection</b> changes, using dominance (a <b>comparison set</b> of size C raises the pressure).",
            "<b>NSGA-II</b>: merge parents and children (2N), fast non-dominated sort, fill by rank, split the last rank by <b>crowding distance</b>.",
            "It is <b>elitist</b>, needs no niche radius and converges fast, though it can converge prematurely.",
          ],
          "Rank, crowd, keep the elite: a whole front in one run.",
        ),
      );
    },
  });

  L["l13-nsga"] = {
    sum: "A multi-objective GA keeps crossover and mutation but selects by dominance. NSGA-II merges parents and children, sorts them into fronts, fills the next generation rank by rank and splits the last rank by crowding distance. It is elitist.",
    steps: [
      {
        t: "Same loop, new selection",
        b: `<p>The GA loop from Lectures 3 and 4 stays: initialise, make offspring, evaluate, check whether to stop, select, repeat.</p><p>Crossover and mutation work on the genes, and the genes haven't changed, so they stay <b>broadly the same</b>. The only part that compares solutions is <b>selection</b>. That is the piece to redesign, using rank and dominance.</p>`,
        v: F.flow(
          ["Initialise", "Generate offspring", "Evaluate offspring", "Finished?", { t: "Selection", c: "violet" }],
          { loop: true },
        ),
        c: C(
          "Turning a GA into a multi-objective GA, which part needs a new design? | Selection, which compares solutions | Mutation, which must change more genes | Initialisation, which must start on the front | Variation works on the genes, which have not changed. Only selection compares solutions, and that now needs dominance.",
        ),
      },
      {
        t: "Duels with a jury",
        b: `<p>A tournament is a quick duel: draw two solutions, and if one dominates the other, select it. Often neither does, so it's a coin toss and the <b>selection pressure</b> is weak.</p><p>The Pareto version adds a jury: a <b>comparison set</b> of C other solutions. A contestant that no jury member dominates passes. If exactly one passes, it wins. A bigger jury settles more duels on merit. Run a few.</p>`,
        v: (b, life) => tourFig(b, life),
      },
      {
        t: "Picking the squad",
        b: `<p><b>NSGA-II</b> (Deb and colleagues, 2002) picks each generation like a coach picking a squad from trialists.</p><p>Put the N parents and N children together (<b>2N</b>). Rank them with a <b>fast non-dominated sort</b>. Fill the N places rank by rank. When a rank won't fit whole, take its members with the <b>largest crowding distance</b>. Step through one generation.</p>`,
        v: (b) => nsgaFig(b),
      },
      {
        t: "Keep the champions",
        b: `<p>If every parent retires each generation, a champion can vanish. A <b>non-elitist</b> GA does exactly that: children replace parents. An <b>elitist</b> one lets parents and children compete, so the best so far always survive.</p><p>Elitist MOGAs (PAES, SPEA, NSGA-II) have largely replaced the old ones. NSGA-II needs <b>no extra parameters</b> such as niche sizes and <b>converges faster</b>, though on some problems it can <b>converge prematurely</b>.</p>`,
        v: (b) => elitFig(b),
        c: C(
          "Which is a reason given for preferring NSGA-II to older non-elitist MOGAs? | It needs no niche size or similar parameter | It can never converge too early on any problem | It needs no crossover or mutation at all | NSGA-II breaks ties with crowding distance, which has no parameter, and it converges faster. Premature convergence can still happen on some problems.",
        ),
      },
    ],
    guide: [
      "Press <b>Step generation</b> a few times, then <b>Run</b>, and watch the green rank 0 points reach the dashed front.",
      "Switch to <b>Non-elitist</b>, press <b>Run</b> again and compare.",
      "Answer the question after the demo.",
    ],
  };

  // ---------- 13.6 when the shortcuts fail (no demo) ----------
  N.register({
    id: "l13-beyond",
    lecture: 13,
    order: 6,
    num: "13.6",
    title: "When the shortcuts fail",
    blurb: "Why adding the goals up misses solutions, how to score a front, and what goes wrong with many goals.",
    render(root) {
      root.appendChild(header(this, "Weighted sums, hypervolume and many objectives."));
      root.appendChild(
        takeaways(
          [
            "<b>Weighted sums</b> need one run per point and miss the non-convex dents of the front.",
            "<b>Hypervolume</b> scores a front by the space it dominates up to a reference point; it rewards closeness and spread.",
            "With <b>many objectives</b> (4 or more) almost everything is incomparable, the front needs far more points, and it is shown with <b>parallel coordinates</b>.",
          ],
          "One run, a whole front, and plots that fit many goals.",
        ),
      );
    },
  });

  L["l13-beyond"] = {
    sum: "Weighted sums need one run per point and miss non-convex regions. Hypervolume scores a whole front. With many objectives dominance stops discriminating, the front needs exponentially many points and is shown with parallel coordinate plots.",
    steps: [
      {
        t: "Why not just add them up?",
        b: `<p>A tempting shortcut: blend the goals into one score, say cost plus three times shortfall, and run an ordinary GA. Two snags.</p><p>Each choice of weights gives just <b>one point</b>, so you need a <b>separate run per point</b>. And a weighted sum is a straight ruler pushed against the front: it only touches the <b>convex</b> bulges, never points in a dent. Slide the weight: <b>U3</b> and <b>U4</b> never light up.</p><details class="math-more"><summary>Show the maths</summary><p>Minimise $F(\\mathbf{x}) = w f_1(\\mathbf{x}) + (1-w) f_2(\\mathbf{x})$ for a weight $0 \\le w \\le 1$. Points with equal $F$ lie on a line of slope</p>$$\\frac{df_2}{df_1} = -\\frac{w}{1-w}$$<p>The optimum is where that line first touches the front. A point inside a dent always has a line through its neighbours that does better, so no $w$ selects it.</p></details>`,
        v: (b, life) =>
          wsFig(b, life, { pts: DENT, s: S2, xr: [0, 10], yr: [0, 10], xl: "f₁ ← minimise", yl: "↓ minimise f₂" }),
        c: C(
          "Why can a weighted sum never pick a Pareto-optimal point that sits in a dent of the front? | A straight line of equal score touches a neighbour first | Points in a dent are dominated by both their neighbours | The weights would have to add up to more than one | Dent points are non-dominated, but for every weighting some point on the bulge scores better, so the sum never picks them.",
        ),
      },
      {
        t: "Scoring a whole front",
        b: `<p>How do you say one front is better than another? Papers often quote the <b>hypervolume</b>: the area the front dominates, up to a chosen <b>reference point</b>. Think of it as the floor space the front claims.</p><p>Bigger is better, and it rewards both getting close to the ideal and spreading out. In the wind study, the ideal corner (full power at no cost) is <b>infeasible</b>. Compare the two runs.</p><details class="math-more"><summary>Show the maths</summary><p>With reference point $\\mathbf{r}$ (here power 0, cost 50), the hypervolume of a front $A$ is the size of the union of boxes</p>$$HV(A)=\\text{area}\\Big(\\bigcup_{\\mathbf{a}\\in A}\\,[\\mathbf{a},\\mathbf{r}]\\Big)$$<p>In the figure it is shown as a share of the box from the reference point to the ideal corner.</p></details>`,
        v: (b) => windFig(b),
      },
      {
        t: "Too many goals",
        b: `<p>Add more goals and comparing gets hopeless. With 2 goals, half the space around a point is <b>incomparable</b> to it; with 3, three quarters.</p><p>With <b>four or more</b> (<b>many objectives</b>), three problems grow. Dominance hardly ranks anything, so the <b>search weakens</b>. The front needs <b>exponentially more points</b> to cover. And you <b>can't draw it</b>. Slide M.</p><details class="math-more"><summary>Show the maths</summary><p>Each objective splits the space into better and worse halves. A point is comparable only if it is better on all $M$ or worse on all $M$:</p>$$P(\\text{comparable})=\\frac{1}{2^M}+\\frac{1}{2^M}=2^{\\,1-M}$$<p>For $M=6$ that is $1/32$, about 3%. With 5 points per axis the front needs $5^{M-1}$ points.</p></details>`,
        v: (b) => manyFig(b),
      },
      {
        t: "Seeing six goals at once",
        b: `<p>Think of a pupil's marks across six subjects, drawn as one zig-zag line. A <b>parallel coordinate plot</b> does that: one vertical axis per objective, and each solution a line crossing them all.</p><p>A later wind farm study had six objectives, such as turbines, area, energy cost and energy produced. It used <b>NSGA-III</b>, built for many objectives, and plotted results this way. Pick a layout: none of the four beats another everywhere.</p>`,
        v: (b) => pcFig(b),
        c: C(
          "In a parallel coordinate plot of 50 solutions with 6 objectives, how is one solution drawn? | As one line crossing all 6 axes | As one dot on a single scatter plot | As 6 dots, each on its own small chart | Each axis is an objective and each solution is a line that crosses every axis at its value.",
        ),
      },
    ],
  };
})();

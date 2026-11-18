/* l13-04: Lectures 13-14 lessons 13.1 to 13.3: trade-offs and dominance, the Pareto front, and non-dominated sorting. Figures come from l13-01 and l13-02 (NIC.shared.nicL13). */
(function () {
  const N = NIC;
  const { el, qs, takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL13;
  const { C, pr, explorer, FARM_O, MIN_O, wakeFig, vectorFig, frontFig, spreadFig } = sh;
  const { rankedSVG, PEEL, peelFig, tieFig, sortDemo } = sh;

  // ---------- 13.1 when two goals pull apart (no demo) ----------
  N.register({
    id: "l13-pareto",
    lecture: 13,
    order: 1,
    num: "13.1",
    title: "When two goals pull apart",
    blurb: "Cheap or powerful? Meet trade-offs, two-number scores and the idea of one solution beating another.",
    render(root) {
      root.appendChild(header(this, "Wind farm layouts scored on cost and power."));
      root.appendChild(
        takeaways(
          [
            "A multi-objective problem scores each solution with an <b>objective vector</b>: one number per goal.",
            "<b>a dominates b</b> when a is at least as good on every goal and strictly better on at least one.",
            "When each solution wins somewhere, they are <b>mutually non-dominating</b>: both are fair trade-offs.",
          ],
          "Two goals, two numbers, and 'better' needs a rule.",
        ),
      );
    },
  });

  L["l13-pareto"] = {
    sum: "Multi-objective problems score each solution with an objective vector. One solution dominates another when it is no worse anywhere and better somewhere; when each wins somewhere they are mutually non-dominating.",
    steps: [
      {
        t: "The wind farm dilemma",
        b: `<p>Picture a row of wind turbines out at sea. A turbine standing behind another sits in its <b>wake</b>, the wind shadow, and makes less power. Spread them out and the power goes up, but so does the cable bill.</p><p>You want <b>low cost</b> and <b>high power</b> at the same time, and these two goals, or <b>objectives</b>, pull apart. That tug-of-war is a <b>trade-off</b>. Slide the gap and watch both numbers move together.</p>`,
        v: (b, life) => wakeFig(b, life),
        c: C(
          "In the toy farm you move the back turbine further from the front one. What happens? | Power goes up and cost goes up | Power goes up and cost goes down | Power goes down and cost goes up | Leaving the wake raises power, and the longer cable raises cost. Improving one goal makes the other worse: that is a trade-off.",
        ),
      },
      {
        t: "A score with two numbers",
        b: `<p>A school report with one grade can't say a pupil shines at maths but struggles with art. Same here: each layout gets <b>two</b> numbers, its cost and its power.</p><p>Together they form its <b>objective vector</b>, which you can draw as a dot in <b>objective space</b>: cost across, power up. Press the button to plot three layouts. A whole design, every turbine, becomes one dot.</p><details class="math-more"><summary>Show the maths</summary><p>For $M$ objectives the quality of $x$ is the vector</p>$$\\mathbf{y}=\\big(f_1(\\mathbf{x}),\\,f_2(\\mathbf{x}),\\,\\dots,\\,f_M(\\mathbf{x})\\big)$$<p>subject to any feasibility constraints. Here $M=2$: $f_1$ is cost and $f_2$ is power. Layout B costs £25m and makes 42 MW, so $\\mathbf{y}=(25, 42)$.</p></details>`,
        v: (b) => vectorFig(b),
      },
      {
        t: "When one solution simply wins",
        b: `<p>Two cafés: one is cheaper <i>and</i> makes better coffee. Easy choice. That is <b>dominance</b>.</p><p>Solution <b>a dominates b</b> when a is <b>at least as good on every goal</b> and <b>strictly better on at least one</b>. A tie on one goal is fine, as long as it wins on the other. Tap a dot: green shows what it beats, red shows what beats it.</p><details class="math-more"><summary>Show the maths</summary><p>For minimisation, $\\mathbf{a}$ dominates $\\mathbf{b}$, written $\\mathbf{a}\\prec\\mathbf{b}$, when</p>$$\\forall i:\\ f_i(\\mathbf{a})\\le f_i(\\mathbf{b})\\quad\\text{and}\\quad\\exists j:\\ f_j(\\mathbf{a})<f_j(\\mathbf{b})$$<p>For an objective you maximise, flip that objective's inequalities. Minimising both, $(2, 3)$ dominates $(4, 5)$ and also $(2, 5)$.</p></details>`,
        v: (b, life) => explorer(b, life, MIN_O),
        c: C(
          "Two solutions have exactly the same score on both goals. Which one dominates? | Neither: no goal is strictly better | The one that was found first in the run | Both: each one dominates the other | Dominating needs a strict win on at least one goal. Identical scores tie everywhere, so neither dominates.",
        ),
      },
      {
        t: "When nobody wins",
        b: `<p>Now one café is cheaper but the other makes better coffee. Neither wins outright.</p><p>Such a pair is <b>mutually non-dominating</b>: both are sensible trade-offs, and only your own priorities can choose between them. This happens all the time, which is why a multi-objective search ends with a <b>set</b> of answers rather than one. Tap any two dots to compare them goal by goal.</p>`,
        v: (b, life) => explorer(b, life, { ...MIN_O, pair: true }),
      },
    ],
  };

  // ---------- 13.2 the best trade-offs on offer (demo) ----------
  N.register({
    id: "l13-front",
    lecture: 13,
    order: 2,
    num: "13.2",
    title: "The best trade-offs on offer",
    blurb: "Keep only the solutions nobody beats: the Pareto front, and what makes a good set of choices.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Eleven wind farm layouts, each scored by <b>cost</b> (lower is better) and <b>power</b> (higher is better). Tap a layout to see what it beats and what beats it, then show the <b>Pareto front</b>.",
        ),
      );
      const card = el(
        `<div class="card nw13-demo"><div class="card-head"><h2>Wind farm layouts</h2></div><div data-box></div></div>`,
      );
      root.appendChild(card);
      explorer(qs("[data-box]", card), life, { ...FARM_O, front: true });
      root.appendChild(
        pr(
          "l13-pareto-2",
          "Show the front. K costs more than D, yet both are on it. Why? | K makes more power than D, so D does not beat it on both | K is the cheapest of the layouts that make over 60 MW | Every layout that costs over £40m is on the front | D wins on cost and K wins on power, so neither dominates the other. Being on the front needs only that nobody beats you on every goal.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "The solutions nobody dominates form the <b>Pareto front</b>: the best trade-offs on offer.",
            "A good approximation of the front is <b>evenly spaced</b> and <b>covers</b> the whole front.",
            "A multi-objective GA hands back a <b>set</b> of trade-offs, not one winner.",
          ],
          "No single best answer: a menu of best trade-offs.",
        ),
      );
    },
  });

  L["l13-front"] = {
    sum: "The non-dominated solutions form the Pareto front. A good approximation is evenly spaced and covers the whole front, and a multi-objective GA returns such a set.",
    steps: [
      {
        t: "The best-value shelf",
        b: `<p>Think of a shop's 'best value' shelf: everything on it is the best you can get for its price.</p><p>Keep only the solutions that <b>nobody dominates</b> and you get the same idea: the <b>Pareto front</b>, the best trade-offs on offer. Along it you can only gain on one goal by giving up some of the other. Which corner it hugs depends on the goals: switch them and watch the front move.</p>`,
        v: (b) => frontFig(b),
        c: C(
          "Both goals are maximised. Towards which corner of the plot does the Pareto front bulge? | Top right, where both values are large | Bottom left, where both values are small | Top left, where f₁ is small and f₂ large | Maximising both, better means larger, so the non-dominated points sit up and to the right.",
        ),
      },
      {
        t: "A good menu of choices",
        b: `<p>A search can't list every point of the front, so it hands back a handful: an <b>approximation</b> of the true front (dashed).</p><p>A good one is like a well-stocked menu. Its points are <b>evenly spaced</b>, and they <b>cover as much of the front as possible</b>. A clumped set leaves a gap in the middle and misses the ends, so whoever picks a design has fewer real options. Compare the two sets.</p>`,
        v: (b) => spreadFig(b),
        c: C(
          "Two runs give five front points each. Run 1 packs them into one small patch; Run 2 spreads them from end to end. Which is the better approximation? | Run 2: it covers the front evenly | Run 1: close points are more accurate | Neither: both found five points | A good approximation is spread out and wide, so a decision maker can see the whole range of trade-offs.",
        ),
      },
      {
        t: "From a GA to a multi-objective GA",
        b: `<p>Good news: no brand-new algorithm needed. Take the <b>generational GA</b> from Lectures 3 and 4 and change three things.</p><p>The score becomes <b>several objectives</b>. Selection uses the <b>dominance</b> rule. And the run hands back a <b>Pareto front approximation</b>, a curve for two goals or a surface for three, instead of a single winner.</p>`,
        v: F.compare(
          {
            title: "Single-objective GA",
            c: "blue",
            body: "one fitness number<br>pick the fitter parent<br>return the best solution",
          },
          {
            title: "Multi-objective GA",
            c: "teal",
            body: "an objective vector<br>select with dominance<br>return a front: a set of solutions",
          },
        ),
      },
    ],
    guide: [
      "Tap a layout and read which layouts it dominates and which dominate it.",
      "Press <b>Show Pareto front</b> and count the green layouts.",
      "Tap <b>K</b> and <b>D</b> in turn and compare their cost and power.",
      "Answer the question after the demo.",
    ],
  };

  // ---------- 13.3 ranking the whole crowd (demo) ----------
  N.register({
    id: "l13-sorting",
    lecture: 13,
    order: 3,
    num: "13.3",
    title: "Ranking the whole crowd",
    blurb: "Peel the population like an onion: non-dominated sorting gives everyone a rank.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Fourteen random solutions, both goals minimised. Press <b>Peel next front</b> to rank them layer by layer.",
        ),
      );
      sortDemo(root, life);
      root.appendChild(
        pr(
          "l13-sorting-1",
          "Peel two fronts. Pick any point in rank 1. What is always true of it? | At least one rank 0 point dominates it | It dominates every point of rank 2 | No rank 0 point dominates it | It was dominated before rank 0 was removed, and whoever beat it is either in rank 0 or is itself beaten by a rank 0 point. Dominance passes along, so some rank 0 point beats it.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Non-dominated sorting</b>: rank 0 is the non-dominated set; remove it, and the next non-dominated set is rank 1, and so on.",
            "A <b>lower rank is better</b>, so rank plays the part fitness used to play.",
            "Points in the same rank are tied, so a <b>tie-breaker</b> that favours spread is needed.",
          ],
          "Peel the layers: the outer layer is the best.",
        ),
      );
    },
  });

  L["l13-sorting"] = {
    sum: "Non-dominated sorting peels the population into ranked fronts: rank 0 is the non-dominated set, rank 1 is non-dominated once rank 0 is removed, and so on. Points in one front are tied.",
    steps: [
      {
        t: "Peeling an onion",
        b: `<p>Dominance finds the very best, but selection must compare <i>everyone</i>. Think of peeling an onion.</p><p>The outer layer is the solutions nobody dominates: <b>rank 0</b>. Peel it off, and the new outer layer is <b>rank 1</b>. Keep going until everyone has a rank. This is <b>non-dominated sorting</b>. A <b>lower rank is better</b>, so rank does the job fitness did in Lecture 3.</p>`,
        v: rankedSVG(PEEL, 3, {
          say: "Twelve points in four fronts: rank 0 green, rank 1 blue, rank 2 purple, rank 3 orange.",
        }).svg,
        c: C(
          "Point Z ends up in rank 2. What does that tell you? | It was peeled in the third round, after ranks 0 and 1 | Exactly two points in the population dominate it | It sits two units away from the front on one axis | A rank counts peeling rounds, not points or distances. Z only became non-dominated once ranks 0 and 1 were gone.",
        ),
      },
      {
        t: "Watch the layers come off",
        b: `<p>Press the button to peel one layer at a time. Each round asks the same question of whoever is left: <b>who does nobody dominate?</b></p><p>Point <b>g</b> is beaten by <b>c</b>, which is lower on both goals, so g waits for round two. Once c's layer is gone, nothing left beats g, and it joins rank 1.</p><details class="math-more"><summary>Show the maths</summary><p>Peeling naively compares every pair in every round: up to $N$ rounds of $O(MN^2)$ checks, so $O(MN^3)$ for $N$ solutions and $M$ objectives. NSGA-II's <b>fast non-dominated sort</b> compares each pair once, storing for every solution $p$ a count $n_p$ of who dominates it and a list $S_p$ of whom it dominates:</p>$$\\text{rank 0}=\\{p: n_p=0\\},\\qquad \\text{then for } q\\in S_p:\\ n_q\\leftarrow n_q-1$$<p>Points whose count drops to 0 form the next front. The cost is $O(MN^2)$.</p></details>`,
        v: (b) => peelFig(b),
      },
      {
        t: "A tie at the top",
        b: `<p>Two runners cross the line together: who gets the medal? Points in the same front have the same problem. They are mutually non-dominating, so dominance can't separate them, and something else must break the tie.</p><p>Look at the two candidates. One sits in a crowd of front points; the other has a stretch to itself. Picking the <b>lonely</b> one fills a gap and spreads the front.</p>`,
        v: tieFig(),
        c: C(
          "A tournament draws two solutions from the same front. One sits in a dense cluster, the other in an empty stretch. Which should win? | The one in the empty stretch | The one in the dense cluster | Either one, chosen at random | The aim is an evenly spread front. Choosing from sparse regions pushes the population to cover the gaps.",
        ),
      },
    ],
    guide: [
      "Press <b>Peel next front</b> until every point has a rank, and watch the colours.",
      "Press <b>New population</b> and peel again: the number of fronts changes.",
      "Answer the question after the demo.",
    ],
  };
})();

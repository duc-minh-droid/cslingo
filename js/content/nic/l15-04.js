/* l15-04: Lecture 15 lessons 15.1 to 15.3: personal bests with two goals, the archive, and capping it (clustering). Figures come from l15-01 and l15-02 (NIC.shared.nicL15); the MOPSO demo is in l15-workshop.js (sh.mopsoDemo, looked up at call time). */
(function () {
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;
  const sh = NIC.shared.nicL15;
  const L13 = NIC.shared.nicL13;
  const { C, pr, AX, SWARM9, pbestFig, snapFig, updFig, growFig } = sh;
  const { pruneView, capFig, clusterFig } = sh;
  const S2 = [1, 1];

  // ---------- 15.1 a swarm with two goals (no demo) ----------
  N.register({
    id: "l15-archive",
    lecture: 15,
    order: 1,
    num: "15.1",
    title: "A swarm with two goals",
    blurb: "PSO chases one best point. With two goals there is no single best, so personal bests need a new rule.",
    render(root) {
      root.appendChild(header(this, "Drone routes scored on delivery time and energy."));
      root.appendChild(
        takeaways(
          [
            "PSO pulls each particle towards its <b>own best</b> p and the <b>swarm best</b> g.",
            "With several objectives there is no single <b>global best</b>: the best is a set, so MOPSO must pick <b>leaders</b>.",
            "<b>pbest rules</b>: replace only if the new position dominates pbest (keep the oldest), or replace unless pbest dominates it (keep the newest).",
          ],
          "Two goals: the swarm's 'best' becomes a set.",
        ),
      );
    },
  });

  L["l15-archive"] = {
    sum: "PSO pulls each particle towards its own best and the swarm best. With two objectives there is no single swarm best, and a particle's own best is updated with a dominance rule: keep the oldest or keep the newest.",
    steps: [
      {
        t: "PSO in one breath",
        b: `<p>Picture a flock of birds searching a field for food. Each bird remembers the best spot it has found, and hears about the best spot anyone has found.</p><p>That is <b>particle swarm optimisation</b> (Lesson 12.3). Each particle has a <b>velocity</b> and is pulled three ways: keep going, head for its <b>own best</b> p, and head for the <b>swarm best</b> g. Roll the random weights and watch the arrows.</p><details class="math-more"><summary>Show the maths</summary>$$v_{ij}(t+1)=v_{ij}(t)+c_1 z_1\\,(p_{ij}-x_{ij})+c_2 z_2\\,(g_j-x_{ij})$$$$x_{ij}(t+1)=x_{ij}(t)+v_{ij}(t+1)$$<p>$c_1 z_1 (p_{ij}-x_{ij})$ is the personal information and $c_2 z_2 (g_j-x_{ij})$ the global information. Example: velocity 1, own best 3 ahead, swarm best 2 behind, $z_1=z_2=0.5$ and $c_1=c_2=2$: the particle moves $1 + 3 - 2 = 2$.</p></details>`,
        v: (b, life) => NIC.shared.nicL12.live({ show: ["v", "p", "g"], live: true })(b, life),
        c: C(
          "Which two remembered points does a basic PSO particle need? | Its own best p and the swarm best g | Its first position and its last position | The worst point found and the swarm centre | The update pulls towards p (personal information) and g (global information). Both are a single best, which is what breaks with two objectives.",
        ),
      },
      {
        t: "Two goals, no single best",
        b: `<p>Now the swarm plans drone deliveries, and each route is scored twice: <b>delivery time</b> and <b>energy</b>, both lower is better. From Lesson 13.1, one route beats another only if it <b>dominates</b> it.</p><p>Show the front: five routes are unbeaten, and none beats the other four. So which is the swarm best g? There isn't one. The best is a <b>set</b>, and multi-objective PSO (<b>MOPSO</b>) must <b>pick leaders</b> from it.</p>`,
        v: (b, life) => L13.explorer(b, life, { pts: SWARM9, s: S2, ...AX, front: true, names: ["time", "energy"] }),
        c: C(
          "Five routes are mutually non-dominating. Which is the swarm best g in plain PSO terms? | There is no single one | The one with the lowest delivery time | The one with the smallest time plus energy | Dominance cannot separate them, so there is no single global best. MOPSO has to choose a leader among them.",
        ),
      },
      {
        t: "Updating a personal best",
        b: `<p>Each drone also remembers its own best, pbest. Say it is (5, 5) and the drone lands on (4, 6): faster but hungrier. Should pbest change?</p><p>Two common rules. <b>Keep the oldest</b>: switch only if the new spot <b>dominates</b> pbest. <b>Keep the newest</b>: switch <b>unless pbest dominates</b> the new spot. On a trade-off like this one, the first stays put and the second moves. Step through four moves.</p><details class="math-more"><summary>Show the maths</summary><p>With $\\mathbf{y}_i=(f_1(\\mathbf{x}_i),\\dots,f_M(\\mathbf{x}_i))$ and pbest $\\mathbf{p}_i$:</p>$$\\text{keep oldest: } \\mathbf{p}_i\\leftarrow\\mathbf{y}_i \\text{ only if } \\mathbf{y}_i\\prec\\mathbf{p}_i$$$$\\text{keep newest: } \\mathbf{p}_i\\leftarrow\\mathbf{y}_i \\text{ unless } \\mathbf{p}_i\\prec\\mathbf{y}_i$$</details>`,
        v: (b) => pbestFig(b),
      },
    ],
  };

  // ---------- 15.2 the archive (demo) ----------
  N.register({
    id: "l15-store",
    lecture: 15,
    order: 2,
    num: "15.2",
    title: "The swarm's hall of fame",
    blurb:
      "An archive keeps every unbeaten solution found so far. Who gets in, who gets thrown out, and why it keeps growing.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A swarm of drone routes, scored by <b>delivery time</b> and <b>energy</b> (both lower is better). Step it, watch the archive fill, and switch the pbest rule or the <b>archive cap</b>.",
        ),
      );
      sh.mopsoDemo(root, life, { ctl: ["rule", "cap"], title: "A swarm with an archive" });
      root.appendChild(
        pr(
          "l15-archive-1",
          "Set <b>Archive cap</b> to <b>No cap</b> and run for a while. What does <b>Archive size</b> do? | It keeps climbing, into the hundreds | It settles at the swarm size of 10 | It rises, then falls back to a handful | Every new non-dominated position joins, and on a smooth front there is always room for another. Nothing removes them, so the archive grows without limit.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "The <b>archive</b> holds the mutually non-dominated solutions found so far: the run's Pareto front approximation.",
            "A newcomer removes every member it dominates, and joins unless some member dominates it.",
            "Without a cap the archive keeps growing, and every update and leader search gets slower.",
          ],
          "pbest remembers each particle's best; the archive remembers the swarm's front.",
        ),
      );
    },
  });

  L["l15-store"] = {
    sum: "MOPSO keeps an archive of the non-dominated solutions found so far, standing in for the global best. A newcomer removes the members it dominates and joins unless a member dominates it; with no cap the archive keeps growing.",
    steps: [
      {
        t: "A hall of fame",
        b: `<p>Think of a hall of fame that keeps every record-breaker. MOPSO keeps an <b>archive</b> of every non-dominated solution found so far. Its members are <b>mutually non-dominated</b>, so the archive is the run's <b>Pareto front approximation</b>, and it stands in for g.</p><p>Slide through a real run. Beaten members drop out, new ones join, and the green set creeps towards the dashed true front.</p>`,
        v: (b) => snapFig(b),
        c: C(
          "Which statement about the archive is always true? | No member dominates another member | It holds one solution per particle | Its members are the swarm's current positions | The archive keeps only mutually non-dominated solutions, which is why it approximates the Pareto front.",
        ),
      },
      {
        t: "Who gets in?",
        b: `<p>A new solution y arrives at the door. Compare it with every member in turn.</p><p>If y <b>dominates</b> a member, that member leaves. If a member <b>dominates y</b>, y is marked as dominated. At the end, y joins only if it was <b>never marked</b>. Try the three newcomers: a strong one, a weak one and a fresh trade-off.</p><details class="math-more"><summary>Show the maths</summary><p>For a new solution $\\mathbf{y}$:</p>$$\\forall\\,\\mathbf{a}_i\\in A_t:\\ \\mathbf{y}\\prec\\mathbf{a}_i\\Rightarrow A_t\\leftarrow A_t\\setminus\\{\\mathbf{a}_i\\}$$$$\\nexists\\,\\mathbf{a}_i\\in A_t:\\ \\mathbf{a}_i\\prec\\mathbf{y}\\ \\Rightarrow\\ A_{t}\\leftarrow A_t\\cup\\{\\mathbf{y}\\}$$</details>`,
        v: (b) => updFig(b),
        c: C(
          "A newcomer dominates two archive members, and no member dominates it. What happens? | The two members leave and it joins | It joins and the two members stay | It is turned away and nothing changes | Members the newcomer dominates are removed, and since nobody dominates it, it is added.",
        ),
      },
      {
        t: "A hall that never closes",
        b: `<p>A hall of fame that never removes anyone gets crowded. On a smooth front almost every new trade-off is non-dominated, so the archive keeps growing.</p><p>Every newcomer is compared with every member, and choosing a leader means searching them all. This run starts with a handful of members and passes 200 within 60 iterations. The next lesson puts a cap on it.</p>`,
        v: (b) => growFig(b),
      },
    ],
    guide: [
      "Press <b>Step</b> a few times and watch the green archive.",
      "Press <b>Run</b> and watch <b>Archive size</b>.",
      "Switch <b>Archive cap</b> to <b>No cap</b>, press <b>Reset</b> and run again.",
      "Answer the question after the demo.",
    ],
  };

  // ---------- 15.3 too many to choose from (no demo) ----------
  N.register({
    id: "l15-bounded",
    lecture: 15,
    order: 3,
    num: "15.3",
    title: "Too many to choose from",
    blurb: "Cap the archive, then decide who goes without tearing holes in the front: clustering.",
    render(root) {
      root.appendChild(header(this, "Capping the archive and pruning it by clustering."));
      root.appendChild(
        takeaways(
          [
            "A <b>capped archive</b> keeps leader search cheap and gives a decision maker a readable number of options.",
            "When it is full, a <b>diversity-preserving</b> rule decides who goes, so the members stay spread.",
            "<b>Clustering</b> (Zitzler, 1999) joins the closest clusters until the cap, then keeps the member nearest each centre.",
          ],
          "Cap the archive, but keep it spread.",
        ),
      );
    },
  });

  L["l15-bounded"] = {
    sum: "A MOPSO archive is usually capped, because a big archive is slow and a decision maker wants a handful of options. When it overflows, a diversity-preserving rule decides who leaves; hierarchical clustering keeps one representative per cluster.",
    steps: [
      {
        t: "Why cap the archive?",
        b: `<p>Imagine a menu of 200 near-identical dishes: slow to read, and no help choosing. A big archive has both problems.</p><p>It is <b>slow</b>: every newcomer and every leader search goes through all the members. And a person choosing a drone route wants a <b>handful</b> of options that span the front, not hundreds. So the archive gets a <b>cap</b>. Slide the size and watch the checks pile up.</p>`,
        v: (b) => capFig(b),
        c: C(
          "Which two reasons does the lecture give for limiting the archive size? | Searching it is slow, and too many options swamp the user | Dominance stops working, and the particles slow right down | Particles stop moving, and the true front gets hidden from view | Finding leaders in a large archive is costly, and presenting a decision maker with a very large set is not useful.",
        ),
      },
      {
        t: "Who leaves when it's full?",
        b: `<p>Once the archive hits its cap, someone has to go. Throw out the oldest, or someone at random, and you can tear holes in the front: keeping the 6 oldest of these 12 keeps only one end.</p><p>A <b>diversity-preserving</b> rule decides instead, so the survivors stay spread along the whole front. Compare the three rules on the same twelve members.</p>`,
        v: (b) => pruneView(b, { methods: ["first", "rand", "crowd"], cap: 6 }),
        c: C(
          "An archive is cut from 12 to 6 by keeping the 6 oldest members, which all sit at one end of the front. What is lost? | The trade-offs at the other end | Nothing: every member is still unbeaten | The members the newer ones dominated | Every kept member is still non-dominated, but the spread is gone. A decision maker sees only one end of the trade-off.",
        ),
      },
      {
        t: "One spokesperson per group",
        b: `<p>Picture choosing one spokesperson for each group of friends. <b>Clustering</b> (Zitzler, 1999) does that.</p><p>Start with every member as its own group. Repeatedly <b>join the two closest groups</b> until there are only as many as the cap allows. Each group then keeps one member: the one <b>nearest its centre</b>. With a cap of 6, the three clumps become three clusters and the loners stay alone. Step through it.</p><details class="math-more"><summary>Show the maths</summary><p>The centre of cluster $K$ is its mean objective vector and the distance between clusters is the distance between centres:</p>$$\\bar{\\mathbf{y}}_K=\\frac{1}{|K|}\\sum_{\\mathbf{a}\\in K}\\mathbf{y}(\\mathbf{a}),\\qquad d(K,K')=\\lVert\\bar{\\mathbf{y}}_K-\\bar{\\mathbf{y}}_{K'}\\rVert$$<p>The representative of $K$ is $\\arg\\min_{\\mathbf{a}\\in K}\\lVert\\mathbf{y}(\\mathbf{a})-\\bar{\\mathbf{y}}_K\\rVert$. (Zitzler's SPEA uses average linkage; the idea is the same.)</p></details>`,
        v: (b) => clusterFig(b),
      },
    ],
  };
})();

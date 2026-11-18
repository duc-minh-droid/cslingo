/* Data Science (COM3021), Lecture 11: distributed machine learning.
   This part: the lessons 11.4 (ds11-cluster, distributed SGD with all-reduce), 11.5 (ds11-kmeans, k-means) and
   11.6 (ds11-mapreduce, k-means with map, combine and reduce). Figures come from ds-l11-02.js and ds-l11-03.js. */
(function () {
  const S = NIC.shared.ds11;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, mm, card } = S;

  /* ============ 11.4 Training as a team ============ */
  reg({
    id: "ds11-cluster",
    order: 4,
    num: "11.4",
    title: "Training as a team",
    blurb: "Every machine computes its gradient, an all-reduce shares the sum, and everyone takes the same step.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Run a training cluster", "B = 8 per iteration");
      root.appendChild(c);
      S.cluster(c.lastElementChild);
      root.appendChild(
        pr(
          "ds11-sgd-1",
          "You ran with <b>1 worker</b>, then with <b>4 workers</b>. How did the two weight paths compare?",
          ["They were the same path", "The 4-worker path was noisier", "The 4-worker path ended higher"],
          "Four workers with B′ = 2 average the same 8 examples as one worker with B = 8, and the all-reduce puts the full sum on every machine, so every update is identical.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "An <b>all-reduce</b> sums the workers' gradients onto <b>every</b> machine, so each updates its own copy the same way.",
            "It is <b>statistically equivalent to minibatch SGD</b>, keeps the <b>same hyperparameters</b>, and is <b>easy to implement</b>.",
            "Drawback: workers sit <b>idle during the all-reduce</b>; computation and communication are not overlapped.",
          ],
          "Same algorithm, more machines: the price is the wait at every all-reduce.",
        ),
      );
    },
  });

  L["ds11-cluster"] = {
    sum: "Distributed SGD: each machine computes the gradient of its own share, an <b>all-reduce</b> sums them on every machine, and all copies take the same step. Equivalent to minibatch SGD, but workers are idle during the communication.",
    steps: [
      st(
        "One round together",
        `<p>Picture a pub-quiz team: everyone works on their own round, then they pool answers so all hold the same sheet.</p><p>In distributed SGD every machine starts with the same weights. Each iteration, it picks its own minibatch, computes its gradient and joins an <b>all-reduce</b>, so every machine holds the <b>sum</b> of all the gradients. Then each updates its own copy in the same way, dividing by M to turn the sum into an average. Step through two iterations.</p>${mm("<p>Algorithm 1, per machine $m$ and iteration $t$:</p>$$g_{m,t} = \\frac{1}{B'} \\sum_{b=1}^{B'} \\nabla f_{i_{m,b,t}}(w_{t-1}) \\qquad G_t = \\sum_{m=1}^{M} g_{m,t} \\qquad w_t = w_{t-1} - \\frac{\\alpha_t}{M} G_t$$<p>At the end the algorithm returns $w_T$ from any machine: they all hold the same value.</p>")}`,
        (b, life) => S.iterRun(b, life),
        mc(
          "Why is the update w − (α / M) · G and not w − α · G?",
          [
            "G is a sum of M averages, so dividing by M averages them",
            "Each worker only owns 1 / M of the weights",
            "The step must shrink as more machines join in",
          ],
          "The all-reduce adds up M gradient averages. Dividing by M turns the sum into the average gradient of the whole minibatch, exactly as in minibatch SGD.",
        ),
      ),
      st(
        "Same algorithm, same settings",
        `<p>A recipe cooked by four chefs sharing the work still tastes like the recipe. Because the all-reduce rebuilds the full minibatch gradient, the method is <b>statistically equivalent to minibatch SGD</b> with B = M · B′.</p><p>So it is easy to reason about, keeps the <b>same hyperparameters</b> (learning rate, batch size), and is <b>easy to implement</b>: every worker has the same role, on top of standard distributed computing primitives. Compare the paths.</p>`,
        (b) => S.sameFig(b),
      ),
      st(
        "The catch: waiting for the network",
        `<p>Our quiz team cannot start the next round until everyone has handed in. Likewise, while the all-reduce is happening the workers are <b>idle</b>: we are not overlapping computation and communication.</p><p>And because the all-reduce needs every gradient, one slow worker (beyond the slides, a <b>straggler</b>) holds the whole team back. Try the straggler and watch the dashed idle bars.</p>${mm("<p>With compute times $c_1, \\dots, c_M$ and all-reduce time $r$, a synchronous iteration takes</p>$$T_{\\text{iter}} = \\max_m c_m + r \\qquad \\text{busy} = \\frac{\\sum_m c_m}{M \\, T_{\\text{iter}}}$$<p>Equal workers at 3 s with a 1 s all-reduce: $\\frac{3}{3 + 1} = 75\\%$ busy.</p>")}`,
        (b) => S.idleFig(b),
        mc(
          "Why does one slow worker slow down every iteration?",
          [
            "The all-reduce needs every worker's gradient",
            "The slow worker's gradients get sent twice over",
            "The fast workers must redo the slow one's work",
          ],
          "Nobody can update until the all-reduce has every gradient, so each iteration lasts as long as the slowest worker.",
        ),
      ),
      st(
        "No waiting, stale news",
        `<p><i>This step goes beyond the slides.</i> Picture a group chat where people reply whenever they are free: nobody waits, but some replies answer a question that has already moved on.</p><p>A <b>parameter server</b> holds the parameters; workers <b>push</b> gradients to it and <b>pull</b> fresh parameters back. <b>Synchronous</b>: the server waits for everyone each round. <b>Asynchronous</b>: each worker pushes and pulls when ready, so nobody idles, but gradients can be <b>stale</b>.</p>`,
        (b) => S.asyncFig(b),
      ),
    ],
    guide: [
      "Press <b>Run 10 iterations</b> with <b>1 worker</b>, then pick <b>4 workers</b> and run again: compare the paths and <b>Final weight</b>.",
      "Raise <b>All-reduce time (s)</b> and run: watch <b>Busy</b> and <b>Wall time</b>.",
      "Pick <b>One straggler</b> and run again. Then answer the question after the demo.",
    ],
  };

  /* ============ 11.5 Finding groups with k-means ============ */
  reg({
    id: "ds11-kmeans",
    order: 5,
    num: "11.5",
    title: "Finding groups with k-means",
    blurb: "Assign each point to its nearest centre, move the centres, repeat: and why it splits nicely over machines.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>k-means</b> repeats two steps: <b>assign</b> each point to its nearest centre, then <b>update</b> each centre to the mean of its points.",
            "It stops when the partition no longer changes, or after a <b>MAX</b> number of iterations.",
            "Each point needs only itself and the centres, so the points can be spread over machines.",
          ],
          "Walk to the nearest van, move the vans, repeat.",
        ),
      );
    },
  });

  L["ds11-kmeans"] = {
    sum: "<b>k-means</b> alternates an assignment step and an update step until the clusters stop changing. Each point's assignment is independent, so the work can be spread over machines.",
    steps: [
      st(
        "Assign, then update",
        `<p>Picture two ice-cream vans on a beach. Each sunbather walks to the nearest van; then each van drives to the middle of its crowd; repeat. That is <b>k-means</b>, which splits data into k clusters.</p><p>The <b>assignment step</b> puts every point in the cluster with the <b>nearest centre</b>. The <b>update step</b> moves every centre to the <b>mean</b> of its points. Step through it on a line.</p>${mm("<p>Assignment, with distance $d$:</p>$$C_i^{(t)} = \\{\\, x_j : d(x_j, \\mu_i) \\le d(x_j, \\mu_h) \\text{ for all } h = 1, \\dots, K \\,\\}$$<p>Update:</p>$$\\mu_i^{(t+1)} = \\frac{1}{|C_i^{(t)}|} \\sum_{x_j \\in C_i^{(t)}} x_j$$<p>For $\\{1, 2, 4\\}$: $7 / 3 \\approx 2.33$.</p>")}`,
        (b, life) => S.lineRun(b, life),
        mc(
          "In the assignment step, which cluster does a point join?",
          ["The one whose centre is nearest", "The one with the fewest points", "The one it joined at the very start"],
          "The assignment step sends each point to the cluster with the nearest centre. The update step then moves the centres.",
        ),
      ),
      st(
        "When to stop",
        `<p>At first the vans shuffle about a lot, then they barely move, then they stay put. k-means stops when <b>the partition no longer changes</b> (no point switches cluster), or after a <b>MAX</b> number of iterations.</p><p>Here are 45 points and 3 centres, two of them badly placed close together. Press play and watch the centres' dashed trails settle.</p>${mm("<p>The stopping rule from the algorithm:</p>$$\\text{stop if } t \\ge \\text{MAX} \\ \\text{ or } \\ \\mathcal{P}^{t} = \\mathcal{P}^{t-1}$$<p>Each iteration can only lower the total squared distance from points to their centres, which is why the partition settles.</p>")}`,
        (b, life) => S.cloudRun(b, life),
        mc(
          "When does k-means stop?",
          [
            "When no point changes cluster, or after MAX iterations",
            "When every cluster holds the same number of points",
            "After one assignment step and one update step",
          ],
          "The loop ends when the partition is unchanged since the last iteration, or when the iteration limit MAX is reached.",
        ),
      ),
      st(
        "Too many points for one machine",
        `<p>Imagine millions of sunbathers: working out every walk takes a while. Each iteration measures the distance from <b>every</b> point to <b>every</b> centre.</p><p>Luckily, a point's assignment needs only that point and the centres, never the other points. So the points can be split across machines and handled at the same time. Each machine just needs a copy of the centres: a <b>broadcast</b>. Slide the number of machines.</p>`,
        (b) => S.costFig(b),
      ),
    ],
  };

  /* ============ 11.6 k-means with MapReduce ============ */
  reg({
    id: "ds11-mapreduce",
    order: 6,
    num: "11.6",
    title: "k-means with MapReduce",
    blurb: "Mappers assign, combiners shrink, and the reducer averages and decides whether to go round again.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Parallel k-means on three mappers", "k = 3");
      root.appendChild(c);
      S.kmLab(c.lastElementChild);
      root.appendChild(
        pr(
          "ds11-kmeans-2",
          "You ran to convergence with the combiner on, and again with <b>Combiner off</b>. How did the final centres compare?",
          [
            "They were exactly the same",
            "Without the combiner they were more accurate",
            "Without the combiner it never converged",
          ],
          "Sums and counts add up to exactly the same totals as the raw points, so the centres are identical. The combiner only saves network traffic.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Map</b>: compute distances to the K centres, assign each point, emit ⟨cluster, point⟩.",
            "<b>Combine</b>: per cluster, send the local <b>sum</b> in each dimension and the <b>number of samples</b>, never a local mean.",
            "<b>Reduce</b>: add the sums and counts, compute the new centres, <b>test convergence</b>, and loop back if needed.",
          ],
          "Mappers assign, combiners shrink, the reducer averages and decides.",
        ),
      );
    },
  });

  L["ds11-mapreduce"] = {
    sum: "In <b>MapReduce</b> k-means the mappers assign points, a <b>combiner</b> sends local sums and counts per cluster, and the <b>reducer</b> computes new centres and tests convergence.",
    steps: [
      st(
        "Map: find the nearest centre",
        `<p>Picture post-office sorters, each with their own sack of letters, dropping every letter into the right pigeonhole.</p><p>The MapReduce version of k-means has three phases. In <b>Map</b>, each mapper takes its share of the samples, works out the distance from each to the K centres, picks the closest, and emits a pair: ⟨<b>index of the closest centre</b>, the sample⟩. Step through one mapper.</p>`,
        (b, life) => S.mapRun(b, life),
        mc(
          "In the map phase, what is the key of each emitted pair?",
          [
            "The index of the closest centre",
            "The position of the sample in the file",
            "The distance to the closest centre",
          ],
          "The key is the cluster index, so everything for one cluster can be grouped together. The value is the sample itself.",
        ),
      ),
      st(
        "Combine: sums and counts",
        `<p>Before posting, each sorter bundles every pigeonhole and labels it with how many letters it holds and their total.</p><p>The <b>combiner</b> runs on each mapper's own output. For every cluster it sends the local <b>sum</b> of the values in each dimension and the <b>number of samples</b>. Never a local mean: a mean forgets how many points it came from, so averaging means gives the wrong centre. Compare the two buttons.</p>${mm("<p>Mapper $m$ sends $(S_{m,i}, n_{m,i})$ with $S_{m,i} = \\sum x_j$ over its points in cluster $i$. The reducer computes</p>$$\\mu_i = \\frac{\\sum_m S_{m,i}}{\\sum_m n_{m,i}} = \\frac{20 + 14}{2 + 1} = \\frac{34}{3}$$<p>whereas $\\frac{1}{2}\\big(\\frac{20}{2} + \\frac{14}{1}\\big) = 12$ gives one point the weight of two.</p>")}`,
        (b) => S.combineFig(b),
      ),
      st(
        "Reduce, test, repeat",
        `<p>At the depot, one clerk adds up every bundle's label. The <b>reducer</b> aggregates all the mappers' sums and counts, computes each cluster's new centre, and <b>tests convergence</b>.</p><p>Not converged? The new centres go back to the mappers and the next iteration starts with Map again. Converged? It outputs the final centres.</p>`,
        (b) => S.loopFig(b),
        mc(
          "Which phase of parallel k-means decides whether to run another iteration?",
          ["Reduce", "Map", "Combine"],
          "The reducer has every cluster's totals, so it computes the new centres and tests convergence. Mappers and combiners only see their own share.",
        ),
      ),
      st(
        "What the combiner saves",
        `<p>Bundles beat loose letters. The combiner does not change the answer; it changes the <b>traffic</b>. Without it, every point crosses the network to the reducer each iteration. With it, each mapper sends one record per cluster.</p><p>In the patterns of 11.1: the centres are <b>broadcast</b> to the mappers, combine-then-reduce is a <b>reduce</b>, and the reducer waits for every mapper, like a <b>barrier</b>.</p>`,
        (b) => S.trafficFig(b),
      ),
    ],
    guide: [
      "Press <b>Map</b>, <b>Combine</b> and <b>Reduce</b> in turn and watch <b>Records to reducer</b> and <b>Centre shift</b>.",
      "Press <b>Run to convergence</b> and read <b>Status</b> and <b>Iteration</b>.",
      "Press <b>Reset</b>, pick <b>Combiner off</b>, and run again. Then answer the question after the demo.",
    ],
  };
})();

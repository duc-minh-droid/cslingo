/* Data Science (COM3021), Lecture 11: distributed machine learning.
   This part: the lessons 11.1 (ds11-patterns, push, pull, broadcast, reduce, all-reduce), 11.2 (ds11-idle, idle
   machines, wait, barrier, overlap) and 11.3 (ds11-sgd, minibatches and splitting them across machines).
   Figures come from ds-l11-01.js and ds-l11-02.js through NIC.shared.ds11. */
(function () {
  const S = NIC.shared.ds11;
  const N = NIC;
  const { el, takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, mm } = S;
  const card = (title, tag) =>
    el(
      `<div class="card"><div class="card-head"><h2>${title}</h2><span class="tag">${tag}</span></div><div></div></div>`,
    );
  S.card = card;

  /* ============ 11.1 Machines that talk ============ */
  reg({
    id: "ds11-patterns",
    order: 1,
    num: "11.1",
    title: "Machines that talk",
    blurb: "Push, pull, broadcast, reduce and all-reduce: the few ways machines share data.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Pattern playground", "six patterns");
      root.appendChild(c);
      S.playground(c.lastElementChild);
      root.appendChild(
        pr(
          "ds11-patterns-1",
          "You ran a <b>Reduce</b> in the playground. Afterwards, what does C3 hold?",
          ["Its own number, unchanged", "The total of all four", "Nothing: it handed its number over"],
          "A reduce puts the result on one machine, B. The senders keep their own numbers and never see the total; that is what all-reduce adds.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Push</b>: A sends to B. <b>Pull</b>: B requests from A. <b>Broadcast</b>: A sends the same data to many.",
            "<b>Reduce</b>: combine (usually sum) values from C1…Cn onto <b>one</b> machine.",
            "<b>All-reduce</b>: the same result lands on <b>all</b> the machines that took part.",
          ],
          "Who sends, who receives, and who ends up knowing the answer.",
        ),
      );
    },
  });

  L["ds11-patterns"] = {
    sum: "Machines share data in a few standard <b>communication patterns</b>: push, pull, broadcast, reduce and all-reduce.",
    steps: [
      st(
        "Push and pull",
        `<p>Picture two ways to get a newspaper: it lands on your doormat, or you walk to the shop and ask for one. Machines share data the same two ways.</p><p>In a <b>push</b>, machine A sends data to machine B: A decides when. In a <b>pull</b>, B <b>requests</b> the data from A: B decides when, and it costs a request plus the reply. How machines talk, the <b>pattern of communication</b>, is one of the most important choices in a distributed algorithm.</p>`,
        (b) => S.pushPullFig(b),
        mc(
          "A monitoring dashboard asks the training cluster for its latest accuracy once a minute. Which pattern is that?",
          ["Pull", "Push", "Broadcast"],
          "The dashboard (the receiver) asks for the data each time: that is a pull. In a push the cluster would send it unasked.",
        ),
      ),
      st(
        "Broadcast: one to many",
        `<p>Think of a teacher handing the same worksheet to every pupil. In a <b>broadcast</b>, machine A sends the <b>same data to many machines</b>.</p><p>It is how every worker gets the same starting model, or the same settings. The catch: each receiver needs its own copy, so the more machines there are, the more A has to send.</p>${mm("<p>Sending every copy from A costs A $n \\times s$ for $n$ receivers and data size $s$: 4 workers and a 50 MB model means 200 MB. <i>Beyond the slides:</i> real systems relay through a tree (each receiver forwards to others), which needs only about $\\lceil \\log_2 n \\rceil$ rounds: 3 rounds for 8 machines.</p>")}`,
        (b) => S.broadcastFig(b),
      ),
      st(
        "Reduce: many into one",
        `<p>Picture four friends each counting the coins in their pocket and telling one person, who adds them up.</p><p>A <b>reduce</b> combines (usually <b>sums</b>) values spread over machines C1, C2, …, Cn and puts the result on <b>one</b> machine, B. The senders still know only their own number. Press play.</p>${mm("<p>A reduce with the sum as its operation:</p>$$B \\leftarrow \\sum_{i=1}^{n} x_i = 3 + 5 + 2 + 6 = 16$$<p>Any operation that can be applied in any order and grouping works the same way (a maximum, a minimum, a count).</p>")}`,
        (b, life) => S.reduceRun(b, life),
      ),
      st(
        "All-reduce: everyone gets the answer",
        `<p>Now everyone at the table wants the total, not just the friend doing the adding. An <b>all-reduce</b> computes the same reduction but puts the result on <b>all</b> the machines that took part.</p><p>You can picture it as a reduce followed by a broadcast of the answer. Distributed training leans on this pattern, as you will see in 11.4.</p>${mm("<p>After an all-reduce every machine $i$ holds</p>$$y_i = \\sum_{j=1}^{n} x_j$$<p><i>Beyond the slides:</i> the <b>ring all-reduce</b> passes chunks around a ring of $n$ machines. Each machine sends about $2\\frac{n-1}{n}$ times the data size, almost independent of $n$, so no single machine becomes a bottleneck.</p>")}`,
        (b) => S.allReduceFig(b),
        mc(
          "After an all-reduce, which machines know the total?",
          ["Every machine that took part", "Only one chosen machine", "None: each keeps only its own number"],
          "An all-reduce puts the result on every participating machine. A plain reduce would leave it on one machine only.",
        ),
      ),
    ],
    guide: [
      "Pick <b>Push</b> and press <b>Run</b>, then try <b>Pull</b> and compare <b>Messages</b>.",
      "Try <b>Broadcast</b>, <b>Reduce</b> and <b>All-reduce</b>: watch <b>Holding the result</b>.",
      "Answer the question after the demo.",
    ],
  };

  /* ============ 11.2 Nobody likes waiting ============ */
  reg({
    id: "ds11-idle",
    order: 2,
    num: "11.2",
    title: "Nobody likes waiting",
    blurb: "Uneven work, waits and barriers leave machines idle; overlapping work with sending hides the network.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "A split job is only as fast as its slowest share; avoid machines <b>waiting idle</b>.",
            "<b>Wait</b>: one machine pauses for another's signal. <b>Barrier</b>: everyone waits until all reach the same point.",
            "<b>Overlap computation and communication</b> to hide network latency.",
          ],
          "Keep every machine busy.",
        ),
      );
    },
  });

  L["ds11-idle"] = {
    sum: "Machines left <b>waiting idle</b> waste time. <b>Wait</b> and <b>barrier</b> synchronise machines; <b>overlapping computation and communication</b> hides the network's latency.",
    steps: [
      st(
        "Many hands, one job",
        `<p>Picture four cooks making one big meal. Share the chopping evenly and dinner is ready four times sooner. Give one cook most of the onions, and the other three stand around with nothing to do.</p><p>Distributed algorithms work the same way: a job split over machines finishes only when the slowest share does. Machines <b>waiting idle</b> for each other waste time and money. Try the three splits.</p>${mm("<p>With work $w_1, \\dots, w_n$ and combine time $c$, the job ends at</p>$$T = \\max_i w_i + c \\qquad \\text{idle} = \\sum_i \\big(\\max_j w_j - w_i\\big)$$<p>Uneven split: $T = 6 + 1 = 7$ and idle $= 4 + 4 + 4 + 0 = 12$ s.</p>")}`,
        (b) => S.splitFig(b),
        mc(
          "A job is split unevenly across four machines. What decides when it finishes?",
          [
            "The machine with the biggest share",
            "The machine with the smallest share",
            "The average of all four shares",
          ],
          "Everyone waits for the slowest machine, so the biggest share sets the finishing time while the others sit idle.",
        ),
      ),
      st(
        "Wait and barrier",
        `<p>Picture a school trip: the coach cannot leave until every pupil is back on board. Two patterns are about <b>time</b>, not data.</p><p>In a <b>wait</b>, one machine pauses until a <b>signal</b> arrives from another. A <b>barrier</b> makes many machines wait until <b>all</b> of them reach the same point, then everyone carries on together. Drag the slowest machine and watch the dashed idle bars grow.</p>${mm("<p>For arrival times $t_1, \\dots, t_n$ the barrier opens at $\\max_i t_i$ and wastes</p>$$\\text{idle} = \\sum_{i=1}^{n} \\big(\\max_j t_j - t_i\\big) = n \\max_j t_j - \\sum_i t_i$$<p>With arrivals 4, 6, 5 and 9 s: $4 \\times 9 - 24 = 12$ s.</p>")}`,
        (b) => S.barrierFig(b),
        mc(
          "Five machines meet at a barrier. When can they carry on?",
          ["When the slowest one arrives", "As soon as the first one gets there", "After a fixed time limit"],
          "A barrier holds everyone until all of them reach it, so the last arrival decides when they move on.",
        ),
      ),
      st(
        "Do two things at once",
        `<p>While the pasta boils you chop the salad; you don't stand watching the pot. The network can be slow, so we want to <b>hide this latency</b>.</p><p>An important principle of distributed computing is to <b>overlap computation and communication</b>: keep working on the next round while the last result is still being sent. It works whenever the next piece of work doesn't need the result that is on its way.</p>${mm("<p>With $k$ rounds of computing $c$ and sending $m$:</p>$$T_{\\text{wait}} = k(c + m) \\qquad T_{\\text{overlap}} = k\\max(c, m) + \\min(c, m)$$<p>For 4 rounds of 3 s and 2 s: $4(3 + 2) = 20$ against $4 \\times 3 + 2 = 14$. Once sending is slower than computing ($m > c$), the network sets the pace.</p>")}`,
        (b) => S.overlapFig(b),
      ),
    ],
  };

  /* ============ 11.3 Learning in small bites ============ */
  reg({
    id: "ds11-sgd",
    order: 3,
    num: "11.3",
    title: "Learning in small bites",
    blurb: "Epochs, batches and minibatches, and how one minibatch can be shared out across machines.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Epoch</b>: one pass over the training set. <b>Batch</b>: all the data per gradient. <b>Minibatch</b>: a subset per iteration.",
            "With <b>M</b> machines and <b>B = M · B′</b>, each machine averages the gradient of its own B′ examples.",
            "Copy the model, split the data: <b>data parallelism</b>. Split the model itself: <b>model parallelism</b>.",
          ],
          "Small bites, shared out fairly.",
        ),
      );
    },
  });

  L["ds11-sgd"] = {
    sum: "Minibatch SGD averages the gradients of a small subset of examples per step. With M machines, each takes B′ of the B = M · B′ examples: <b>data parallelism</b>.",
    steps: [
      st(
        "Epoch, batch, minibatch",
        `<p>Picture revising from a pile of 12 flashcards. You could read all 12 before adjusting your plan once, or adjust after every 4.</p><p>An <b>epoch</b> is one pass over the full training set. <b>Batch</b> means using <b>all</b> your data to compute the gradient in one iteration. <b>Minibatch</b> means using only a <b>subset</b> of the data in each iteration, so you get more updates per epoch. Watch which cards feed each update.</p>`,
        (b, life) => S.batchFig(b, life),
        mc(
          "Training uses only a small subset of the examples for each update. What is this called?",
          ["Minibatch", "Batch", "Epoch"],
          "A minibatch is a subset of the data used in one iteration. Batch uses all the data per gradient, and an epoch is a full pass over the data.",
        ),
      ),
      st(
        "One small step",
        `<p>Imagine asking four friends which way to walk, and heading in their average direction.</p><p>Minibatch SGD does just that. It takes the gradients of the examples in the minibatch, <b>averages</b> them, and moves the weights a little against that average. The <b>learning rate α</b> sets how big each step is. Slide it and watch w move.</p>${mm("<p>The update from the slides, for a minibatch of size $B$ at iteration $t$:</p>$$w_{t+1} = w_t - \\alpha_t \\cdot \\frac{1}{B} \\sum_{b=1}^{B} \\nabla f_{i_{b,t}}(w_t)$$<p>Here $10 - 0.5 \\times \\frac{2 + 6 + 4 + 0}{4} = 10 - 1.5 = 8.5$.</p>")}`,
        (b) => S.updateFig(b),
      ),
      st(
        "Share the minibatch",
        `<p>Now each friend asks a few people of their own, and you average the friends' answers. With <b>M</b> machines, each takes an equal share of the minibatch: <b>B = M · B′</b>, where B′ is each machine's own minibatch.</p><p>Because the shares are equal, the average of their averages is exactly the average of the whole minibatch. Every machine keeps a full copy of the model and works on different data: this is <b>data parallelism</b>.</p>${mm("<p>Split the inner sum by machine. With $B = M B'$:</p>$$w_{t+1} = w_t - \\alpha_t \\cdot \\frac{1}{M} \\sum_{m=1}^{M} \\frac{1}{B'} \\sum_{b=1}^{B'} \\nabla f_{i_{m,b,t}}(w_t)$$<p>Worker $m$ computes the inner average; only the outer sum needs communication.</p>")}`,
        (b) => S.dealFig(b),
      ),
      st(
        "Too big for one machine",
        `<p><i>This step goes beyond the slides.</i> Think of a car built on an assembly line: each station adds its own part, then passes the car along.</p><p>When a model is too big for any one machine, <b>model parallelism</b> splits the <b>model</b> itself (say, one group of layers per machine) and passes each minibatch from machine to machine. Data parallelism, by contrast, copies the whole model onto every machine and splits the data.</p>`,
        (b) => S.parallelFig(b),
        mc(
          "A model's parameters do not fit in the memory of any single machine. Which approach can still train it?",
          ["Model parallelism", "Data parallelism", "A larger minibatch per machine"],
          "Data parallelism needs a full copy of the model on every machine. Splitting the model itself across machines is model parallelism.",
        ),
      ),
    ],
  };
})();

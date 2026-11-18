/* Data Science (COM3021), Lecture 9: batch and online machine learning.
   This part: ds9-epochs (9.2, epochs, the true gradient and full batch learning) and ds9-mini (9.4, mini-batches,
   randomness and the batch size). The figures live in ds-l9-01.js and ds-l9-02.js. */
(function () {
  const S = NIC.shared.ds9;
  const { reg, mc, pr, st, mm, epochRun, estimateFig, noiseFig, tradeFig, race } = S;
  const N = NIC;
  const { el, takeaways, header } = N;
  const L = N.LESSONS;

  /* ============ 9.2 Laps over the data: epochs and full batch learning ============ */
  reg({
    id: "ds9-epochs",
    order: 2,
    num: "9.2",
    title: "Laps over the data",
    blurb: "Training goes round the data in laps called epochs. Full batch learning uses every trip in every step.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "Neural networks train over <b>epochs</b>: one <b>forward pass</b> and one <b>backpropagation</b> pass over the training data.",
            "<b>Full batch learning</b> uses <b>all</b> the data for the <b>true gradient</b>: one update per epoch. Part of the data gives an <b>approximation</b>.",
            "Batch learning trains <b>before deployment</b>: simpler to reason about, with <b>smoother, more consistent convergence</b>.",
          ],
          "Look at everything, then take one careful step.",
        ),
      );
    },
  });

  L["ds9-epochs"] = {
    sum: "An <b>epoch</b> is one forward and one backward pass over the training data. <b>Full batch learning</b> uses all of it to compute the <b>true gradient</b>, one update per epoch.",
    steps: [
      st(
        "Laps of the track",
        `<p>Picture a runner doing laps: each lap they check their time and adjust their pace for the next. Neural networks train in laps called <b>epochs</b>. Each epoch is one <b>forward pass</b> (predict every training example and measure the errors) and one <b>backpropagation</b> pass (turn those errors into gradients for the weights). Then the weights change and the next lap begins. Step through three epochs.</p>${mm("<p>For mean squared error over $n$ trips, the gradient is</p>$$\\frac{dC}{dw} = \\frac{2}{n}\\sum_{i=1}^{n} x_i\\,(w x_i - y_i)$$<p>For 4 trips at 4 min per km, starting at $w = 6$: $\\frac{2}{4}(1\\cdot2 + 2\\cdot4 + 3\\cdot6 + 2\\cdot4) = 18$, so with learning rate 0.05, $w = 6 - 0.9 = 5.1$. A network does the same through many layers: backpropagation is the chain rule applied layer by layer.</p>")}`,
        (box, life) => epochRun(box, life),
        mc(
          "What does one epoch of training involve?",
          [
            "A forward and a backward pass over all the training data",
            "A forward pass over one randomly chosen training example",
            "Training again and again until the cost reaches zero",
          ],
          "An epoch is one full pass over the training data: forward to get predictions and errors, backward to get the gradients.",
        ),
      ),
      st(
        "Ask everyone, or ask a few?",
        `<p>Before choosing a restaurant you could ask the whole office, or just the two people nearest you. Asking everyone gives the true answer; asking a few gives a guess that may be off. Gradients work the same way. Each epoch can compute the <b>true gradient</b> from <b>all</b> the data, or an <b>approximation</b> from part of it. Pick some trips and compare.</p>${mm("<p>True gradient over all $n$ examples, and the estimate from a batch $B$:</p>$$g = \\frac{1}{n}\\sum_{i=1}^{n} g_i \\qquad \\hat g = \\frac{1}{|B|}\\sum_{i \\in B} g_i$$<p>Here $g = 78/6 = 13$. A random batch gives the right answer <b>on average</b>, but any single batch can be off.</p>")}`,
        (box) => estimateFig(box),
      ),
      st(
        "Full batch learning",
        `<p><b>Full batch learning</b> asks everyone, every time: it uses <b>all the data</b> to compute the <b>true gradient</b>, so there is exactly <b>one update per epoch</b>. The model is trained <b>before deployment</b> and then used as it is. It's the usual way models are trained: <b>simpler to reason about</b>, with <b>smoother, more consistent convergence</b>, because the same data gives the same step every time.</p>${mm("<p>With $n$ examples and batch size $b$, an epoch makes $n / b$ updates. Full batch is $b = n$:</p>$$\\text{updates per epoch} = \\frac{n}{n} = 1$$")}`,
        (box, life) => S.pipes(box, life, 8, false),
        mc(
          "Why does full batch learning converge so smoothly?",
          [
            "Every step uses the true gradient, not a sample",
            "It uses a bigger learning rate than other methods",
            "It updates the weight after every single example",
          ],
          "With all the data in every step there is no sampling noise: the step is the same each time you run it.",
        ),
      ),
    ],
  };

  /* ============ 9.4 Bite-sized batches ============ */
  reg({
    id: "ds9-mini",
    order: 4,
    num: "9.4",
    title: "Bite-sized batches",
    blurb: "Update from a handful of examples at a time: quicker steps, more wobble, and a batch size to choose.",
    render(root) {
      root.appendChild(header(this, ""));
      const card = el(
        `<div class="card"><div class="card-head"><h2>Batch size race</h2><span class="tag">24 trips, learning rate 0.02</span></div><div></div></div>`,
      );
      root.appendChild(card);
      race(card.lastElementChild);
      root.appendChild(
        pr(
          "ds9-batches-2",
          "Look at the <b>One at a time</b> curve you ran. Did the loss fall at every single update?",
          [
            "No: now and then one trip pushed it back up",
            "Yes: every update lowered the loss a little",
            "No: it only fell at the end of each epoch",
          ],
          "Each update follows one trip's gradient, which is only an estimate. A trip that disagrees with the rest can raise the overall loss for a step, so the curve is jagged.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Mini-batch learning</b> uses part of the data per update, so it computes an <b>estimate</b> of the gradient.",
            "<b>The smaller the batch, the greater the randomness</b>, and convergence is less stable.",
            "Full batch is <b>rarely used in production</b>: it only suits very small datasets. The <b>batch size</b> is an important decision.",
          ],
          "A little data per step is cheap and quick, but noisy.",
        ),
      );
    },
  });

  L["ds9-mini"] = {
    sum: "<b>Mini-batch</b> learning uses part of the data for each update and estimates the gradient: more updates per epoch, but noisier as the batch shrinks. Choosing the batch size matters.",
    steps: [
      st(
        "A handful at a time",
        `<p>Back to the office poll: instead of waiting to ask everyone, you ask a small group, decide, then ask the next group. <b>Mini-batch learning</b> uses <b>part</b> of the data for each update, so it computes an <b>estimate of the gradient</b>. One epoch now holds several updates, one per batch: the smaller the batch, the more updates per epoch. Switch batch sizes and watch which trips feed each update.</p>${mm("<p>With $n$ examples and batch size $b$:</p>$$\\text{updates per epoch} = \\frac{n}{b}, \\qquad \\hat g_j = \\frac{1}{b}\\sum_{i \\in \\text{batch } j} g_i$$<p>$n = 8$, $b = 2$: $4$ updates, each from its own estimate $\\hat g_j$.</p>")}`,
        (box, life) => S.pipes(box, life, 2, true),
        mc(
          "Compared with full batch, how does a small mini-batch change one epoch?",
          [
            "More updates, each from an estimated gradient",
            "One update, from the true gradient",
            "Fewer updates, each from more of the data",
          ],
          "Each update uses only one batch, so an epoch is split into many updates, and each one estimates the gradient from part of the data.",
        ),
      ),
      st(
        "Smaller batch, more wobble",
        `<p>Ask two people and you might catch the only two who hate curry; ask twenty and the oddballs even out. A small batch averages few examples, so its estimate depends on <b>which</b> ones it happened to get. <b>The smaller the batch size, the greater the randomness</b>, and <b>convergence is less stable</b>, rising and falling with the data in each batch. Pick a batch size.</p>${mm("<p>For a batch of $b$ examples drawn at random, the estimate is right on average and its spread (standard deviation) shrinks like</p>$$\\operatorname{sd}(\\hat g) \\approx \\frac{\\sigma}{\\sqrt{b}}$$<p>where $\\sigma$ is the spread of single-example gradients. Four times the batch halves the noise.</p>")}`,
        (box) => noiseFig(box),
        mc(
          "A team halves its batch size. What happens to the gradient estimates?",
          [
            "They get noisier: each averages fewer examples",
            "They get more accurate: smaller batches are fresher",
            "Nothing changes: the true gradient is the same",
          ],
          "The true gradient is unchanged, but each estimate now averages fewer examples, so it wanders more from batch to batch.",
        ),
      ),
      st(
        "Picking a batch size",
        `<p>So why not always ask everyone? Because with big data, every single step would mean reading the lot. <b>Full batch</b> is <b>rarely used in production</b>: it only suits <b>very small datasets</b>. That makes the <b>batch size</b> an important decision, and it works together with the learning rate: small batches like small learning rates, and blow up sooner as the rate grows.</p>`,
        (box) => tradeFig(box),
      ),
    ],
    guide: [
      "With <b>Full batch (24)</b> selected, press <b>Run 1 epoch</b> and note the <b>Loss</b>.",
      "Switch to <b>Batch of 8</b>, <b>Batch of 4</b> and <b>One at a time</b>, running one epoch each. Compare <b>Updates in that epoch</b>.",
      "Run more epochs and compare how smooth each curve is, then answer the question after the demo.",
    ],
  };
})();

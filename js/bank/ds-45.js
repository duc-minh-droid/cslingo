/* js/bank/ds-45.js: Data Science lecture 9 revision questions, part 1: ds9-descent and ds9-batches. */
(function () {
  const B = NIC.bank;
  const { mc, svg, tx } = NIC.shared.ds9;
  /** Tappable cards for pick questions: [id, title, line]. */
  const pk = (list) =>
    `<div class="ds9-days" style="justify-content:center">${list.map(([id, t, v]) => `<span class="ds9-day" data-pick="${id}" style="cursor:pointer;padding:6px 10px">${t}${v ? `<br>${v}` : ""}</span>`).join("")}</div>`;
  /** A cost bowl with three tappable points. */
  const bowlPick = svg(
    420,
    170,
    `<path d="M30 20 Q210 290 390 20" fill="none" stroke="var(--blue)" stroke-width="3"/>` +
      [
        ["a", 75, 70],
        ["b", 210, 155],
        ["c", 330, 85],
      ]
        .map(
          ([k, x, y]) =>
            `<g data-pick="${k}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="13" fill="color-mix(in srgb,var(--rose) 30%,var(--panel))" stroke="var(--rose)" stroke-width="2"/>${tx(x, y + 4, k.toUpperCase(), { s: 12 })}</g>`,
        )
        .join(""),
    "A bowl-shaped cost curve with point A on the left slope, B at the bottom and C on the right slope",
  );

  B.add("ds9-descent", [
    mc(
      "At the current weight the gradient is +12 and the learning rate is 0.1. How does gradient descent change the weight?",
      ["Down by 1.2", "Up by 1.2", "Down by 12", "Up by 0.12"],
      "It moves against the gradient by learning rate × gradient: 0.1 × 12 = 1.2, downwards because the gradient is positive.",
    ),
    {
      type: "slider",
      q: "The cost is (w − 4)² and the learning rate is 0.25, so each step halves the distance to 4. Starting at w = 12, where is w after <b>two</b> steps?",
      min: 4,
      max: 12,
      step: 1,
      start: 12,
      ans: 6,
      tol: 0.4,
      hint: "Distance 8, then 4, then 2.",
      why: "From 12 the distance to 4 is 8. Halved twice it is 2, so w = 6 (12 → 8 → 6).",
    },
    {
      type: "cat",
      q: "Is each symptom a sign that the learning rate is too <b>small</b> or too <b>big</b>?",
      buckets: ["Too small", "Too big"],
      items: [
        ["The loss falls, but only a sliver per epoch", 0],
        ["The loss grows from one epoch to the next", 1],
        ["The weight flips side of the minimum, further each time", 1],
        ["Thousands of epochs are needed to get anywhere", 0],
        ["The weights end up as enormous numbers", 1],
      ],
      why: "Small steps make slow but steady progress. Steps that are too big overshoot the minimum, and if each overshoot is bigger the weights diverge.",
    },
    {
      type: "order",
      q: "Put the gradient descent loop in order.",
      items: [
        "Start from an initial weight",
        "Work out the gradient of the cost at that weight",
        "Move the weight by learning rate × gradient, against the gradient",
        "Repeat until the cost stops falling",
      ],
      why: "Gradient descent starts somewhere, measures the slope, steps downhill by a scaled amount, and repeats.",
    },
    mc(
      "A network is trained full batch for 5 epochs on 10,000 images. How many times is each image used in a forward pass?",
      ["5", "1", "10,000"],
      "An epoch is one pass over all the training data, so each image is used once per epoch: 5 times in 5 epochs.",
    ),
    {
      type: "multi",
      q: "Select every statement that is <b>true</b> about full batch learning.",
      o: [
        "It uses all the available data in each update",
        "It computes the true gradient",
        "It makes one update per epoch",
        "It makes one update per training example",
        "It is the usual choice for huge production data",
      ],
      a: [0, 1, 2],
      why: "Full batch uses everything, so it gets the true gradient and updates once per epoch. Updating per example is online learning, and full batch is rarely used in production because it only suits small datasets.",
    },
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Gradient", "The slope of the cost at the current weight"],
        ["Learning rate", "How big each step is"],
        ["Epoch", "One pass over the training data"],
        ["Backpropagation", "Turns the errors into gradients"],
      ],
      why: "The gradient says which way is uphill, the learning rate scales the step, an epoch is a pass over the data, and backpropagation computes the gradients from the errors.",
    },
    {
      type: "pick",
      q: "Tap the point on the cost curve where the gradient is <b>zero</b>.",
      fig: bowlPick,
      a: "b",
      why: "The gradient is the slope. At the bottom of the bowl (B) the curve is flat, so the gradient is zero and gradient descent stops moving.",
    },
    mc(
      "Five examples give gradients 2, 4, 6, 8 and 10. A mini-batch of the last two is used. What does it estimate, against the true gradient?",
      ["9, against a true 6", "6, against a true 9", "3, against a true 6"],
      "The batch averages 8 and 10 to 9. The true gradient averages all five: 30 ÷ 5 = 6.",
      "Average of 8 and 10; then the sum of all five divided by 5.",
    ),
    mc(
      "Why is a model trained by batch learning before deployment called simpler to reason about?",
      [
        "It is fixed once deployed, so you can test exactly what runs",
        "It keeps changing after deployment, so it is always fresh",
        "It never needs a learning rate, so there is nothing to tune",
      ],
      "Batch learning finishes training before deployment. The deployed model does not change, so what you evaluated is what runs.",
    ),
    {
      type: "bug",
      q: "This loop is meant to be <b>full batch</b> gradient descent. Tap the line that breaks that.",
      code: [
        "for epoch in range(20):",
        "    grad = gradient(w, all_trips[:32])",
        "    w = w - learning_rate * grad",
        "    print(epoch, cost(w, all_trips))",
      ],
      a: 1,
      hint: "Full batch means the true gradient.",
      why: "all_trips[:32] uses only the first 32 trips, so the gradient is an estimate from a mini-batch. Full batch needs gradient(w, all_trips).",
    },
  ]);

  B.add("ds9-batches", [
    mc(
      "A clothing shop's recommender was trained on last winter's sales. In spring it keeps pushing coats and sales drop. What is the best description?",
      [
        "Concept drift: preferences changed, so the model needs updating",
        "Divergence: the learning rate was too big during training",
        "Overfitting: the model memorised individual customers",
      ],
      "What customers want has moved since training. The data is not static, so the model must be updated with newer data.",
    ),
    {
      type: "slider",
      q: "5 GB of data arrives each week and the model is retrained weekly on <b>all</b> of it. The machine has 128 GB of memory. In which week does a retrain first no longer fit?",
      min: 10,
      max: 40,
      step: 1,
      start: 10,
      ans: 26,
      tol: 0.5,
      unit: "",
      hint: "128 ÷ 5 is about 25.6, so week 25 still fits.",
      why: "Week 25 reads 125 GB, which fits. Week 26 reads 130 GB, which does not.",
    },
    {
      type: "cat",
      q: "Is each point an advantage of <b>full batch</b> learning or of training on <b>recent data</b> in mini-batches?",
      buckets: ["Full batch", "Recent data / mini-batch"],
      items: [
        ["Smoother, more consistent convergence", 0],
        ["Simpler to reason about", 0],
        ["Less computationally intensive", 1],
        ["Older data affects the model less", 1],
        ["Every step uses the true gradient", 0],
        ["Does not need all the data in memory", 1],
      ],
      why: "Full batch is smooth, exact and easy to reason about. Recent data in batches is cheaper, needs less memory and lets old data fade.",
    },
    {
      type: "multi",
      q: "A team switches to retraining on recent data. Select every decision they now have to make.",
      o: [
        "How often to retrain",
        "How much recent data to use",
        "What batch size to use",
        "How to fit all the history in memory",
        "How to make every step use the true gradient",
      ],
      a: [0, 1, 2],
      why: "The slides list how often (daily, weekly, monthly), how much data (week, month, year) and the batch size. Training on recent data avoids holding all the history and gives up the true gradient.",
    },
    {
      type: "order",
      q: "Order these from the <b>noisiest</b> gradient to the <b>smoothest</b>.",
      items: ["Online (batch of 1)", "Mini-batch of 16", "Mini-batch of 256", "Full batch"],
      why: "The smaller the batch, the greater the randomness. One example is the noisiest estimate, and all the data gives the true gradient.",
    },
    mc(
      "A data set has 6,000 rows. Switching from full batch to a batch of 60 changes the updates per epoch from 1 to how many?",
      ["100", "60", "6,000"],
      "Updates per epoch = rows ÷ batch size = 6,000 ÷ 60 = 100.",
      "6,000 ÷ 60 = 600 ÷ 6.",
    ),
    {
      type: "pick",
      q: "It is now week 8 and the model retrains on the <b>last 4 weeks</b>. Tap the <b>oldest</b> week it uses.",
      fig: pk([
        ["1", "W1"],
        ["2", "W2"],
        ["3", "W3"],
        ["4", "W4"],
        ["5", "W5"],
        ["6", "W6"],
        ["7", "W7"],
        ["8", "W8"],
      ]),
      a: "5",
      hint: "Count back four weeks, including week 8.",
      why: "The last 4 weeks are W5, W6, W7 and W8, so W5 is the oldest one used. W1 to W4 no longer affect the model.",
    },
    mc(
      "Keeping a 30-day window, a team retrains every day instead of every week. What changes?",
      [
        "It tracks change sooner, for seven times as many retrains",
        "It tracks change later, but each retrain reads less data",
        "Nothing: the window decides everything about freshness",
      ],
      "Retraining daily picks up new data within a day instead of within a week, but there are about 7 retrains for every 1 before.",
    ),
    {
      type: "slider",
      q: "2 GB of data arrives each week. The model retrains weekly on the <b>last 6 weeks</b>. How much does the retrain in week 80 read?",
      min: 0,
      max: 40,
      step: 2,
      start: 0,
      ans: 12,
      tol: 1,
      unit: " GB",
      why: "A fixed window always reads 6 weeks × 2 GB = 12 GB, in week 8 or week 80.",
    },
    mc(
      "On a loss-against-learning-rate plot, the batch-of-4 curve reaches its lowest loss at a smaller learning rate than batch 64, then shoots up sooner. What does that suggest?",
      [
        "Smaller batches suit smaller learning rates",
        "Smaller batches suit larger learning rates",
        "The batch size has no effect on the learning rate",
      ],
      "Small batches update often with noisy estimates, so they need smaller steps and become unstable at rates that larger batches still tolerate.",
    ),
    {
      type: "match",
      q: "Match each term to its meaning.",
      pairs: [
        ["Incremental learning", "Updating the model from newer data"],
        ["Concept drift", "What the data means changes over time"],
        ["Mini-batch", "Part of the data per update"],
        ["Full batch", "All of the data per update"],
      ],
      why: "Incremental learning keeps updating a model with newer data, often in mini-batches, because of concept drift. Full batch uses everything each step.",
    },
  ]);
})();

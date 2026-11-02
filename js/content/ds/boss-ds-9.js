/* Data Science boss quiz for Lecture 9 (batch and online machine learning). New scenario: an e-scooter hire app (Hopscotch)
   that predicts how much battery each ride will use. */
(function () {
  const { svg, tx } = NIC.shared.ds9;

  /** Three small loss curves for the pick question: smooth, a little noisy, very jagged. */
  const curves = (() => {
    const r = NIC.shared.ds9.rng(41);
    const line = (x0, noise) =>
      Array.from({ length: 40 }, (_, i) => {
        const y = 20 + 90 * Math.exp(-i / 9) + noise * (r() - 0.5);
        return `${i ? "L" : "M"}${(x0 + 10 + i * 3.6).toFixed(1)} ${(130 - Math.max(0, Math.min(115, y))).toFixed(1)}`;
      }).join("");
    const panel = (k, x0, noise, name) =>
      `<g data-pick="${k}" style="cursor:pointer"><rect x="${x0}" y="6" width="164" height="150" rx="12" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2"/><path d="${line(x0, noise)}" fill="none" stroke="var(--blue)" stroke-width="2.5"/>${tx(x0 + 82, 148, name, { s: 12 })}</g>`;
    return svg(
      520,
      162,
      panel("a", 4, 0, "Curve A") + panel("b", 178, 14, "Curve B") + panel("c", 352, 60, "Curve C"),
      "Three loss curves: A is smooth, B is a little noisy, C is very jagged",
    );
  })();

  NIC.registerBoss({
    id: "ds9-boss",
    subject: "ds",
    lecture: 9,
    title: "Lecture 9 boss quiz",
    blurb:
      "Ten questions set at a scooter-hire app: gradient descent, epochs, full batch, mini-batch and online learning, and data shifts.",
    lede: "A new scenario: <b>Hopscotch</b> rents e-scooters and predicts how much battery each ride will use, so it can send a van before scooters run flat. Its model learns from ride data. Keep the predictions honest as the city changes.",
    qs: [
      {
        type: "cat",
        q: "Which kind of training is each Hopscotch plan?",
        buckets: ["Full batch", "Mini-batch", "Online"],
        items: [
          ["One gradient from every stored ride, then one update per epoch", 0],
          ["Each update averages the gradients of 64 rides", 1],
          ["The weights change the moment each ride ends", 2],
          ["Train on all rides before launch, then deploy as is", 0],
          ["Split 50,000 rides into groups of 500 and update after each", 1],
          ["Every update uses a single ride", 2],
        ],
        why: "Full batch uses all the data per update, a mini-batch uses part of it, and online learning updates on each single observation as it arrives.",
      },
      {
        type: "slider",
        q: "Hopscotch trains on 48,000 rides with a batch size of 400. How many weight updates are there in one epoch?",
        min: 0,
        max: 240,
        step: 10,
        start: 0,
        ans: 120,
        tol: 5,
        unit: " updates",
        hint: "48,000 ÷ 400 is the same as 480 ÷ 4.",
        why: "One epoch passes over all 48,000 rides, 400 per update: 48,000 ÷ 400 = 120 updates.",
      },
      {
        type: "mcq",
        q: "With a learning rate of 0.1 the loss per epoch goes 30, 12, 5, 2. An engineer switches to 0.9 and sees 30, 41, 57, 80. What is happening?",
        o: [
          "Each step jumps past the minimum by more than before",
          "The data has drifted since the first training run",
          "The model has reached its minimum and is resting",
          "Each step now uses a smaller part of the data",
        ],
        a: 0,
        why: "A learning rate that is too big overshoots: every step lands further up the other side of the bowl, so the loss grows epoch after epoch and the weights diverge.",
      },
      {
        type: "order",
        q: "Put one epoch of full batch training in order.",
        items: [
          "Predict battery use for every ride in the training set",
          "Measure the error of each prediction",
          "Backpropagate the errors into one gradient",
          "Update the weights once",
          "Start the next epoch with the new weights",
        ],
        hint: "Forward pass first, then backpropagation, then the single update.",
        why: "An epoch is one forward pass over all the data, one backpropagation pass, and (for full batch) exactly one update before the next epoch begins.",
      },
      {
        type: "multi",
        q: "Hopscotch retrains every week on <b>all</b> the rides it has ever logged. Select every statement that is <b>true</b>.",
        o: [
          "Each retrain costs more than the last as rides pile up",
          "All the training data has to fit in memory",
          "Old rides keep pulling on the model however stale",
          "Its gradient is noisier than a small mini-batch's",
          "It adapts to change faster than a recent window",
        ],
        a: [0, 1, 2],
        why: "All the data gives the true gradient (not a noisy one), but each retrain reads more data, needs it in memory, and lets old behaviour weigh as much as new, so it adapts more slowly.",
      },
      {
        type: "match",
        q: "Match each Hopscotch change to the kind of data shift.",
        pairs: [
          ["Covariate shift", "Riders move into hilly suburbs the model never saw"],
          ["Prior probability shift", "The same rides, but far more end in a damage report"],
          ["Concept drift", "New firmware makes each km use less battery"],
        ],
        why: "New kinds of input (hills) is covariate shift. A change in how common an outcome is, with inputs unchanged, is a prior probability shift. A change in the input-output relationship itself (battery per km) is concept drift.",
      },
      {
        type: "pick",
        q: "These are loss curves from training with full batch, a batch of 32 and a batch of 1. Tap the curve from the <b>batch of 1</b>.",
        fig: curves,
        a: "c",
        hint: "The smaller the batch, the greater the randomness.",
        why: "One ride per update gives the noisiest gradient estimate, so its loss curve is the most jagged (C). Full batch uses the true gradient and is smooth (A).",
      },
      {
        type: "bug",
        q: "Hopscotch's online learner should step the weight downhill after every ride. Tap the faulty line.",
        code: [
          "w = starting_weight",
          "for ride in live_rides:",
          "    pred = w * ride.km",
          "    grad = 2 * ride.km * (pred - ride.battery)",
          "    w = w + learning_rate * grad",
        ],
        a: 4,
        hint: "Which way does gradient descent move: with the gradient or against it?",
        why: "The gradient points uphill. Adding it climbs the cost; the update must be w = w − learning_rate × grad.",
      },
      {
        type: "slider",
        q: "The online model says <b>w = 3</b> % of battery per km. A 2 km ride used 8%. With learning rate 0.05, what is w after this one update?",
        min: 2,
        max: 4,
        step: 0.1,
        start: 3,
        ans: 3.4,
        tol: 0.05,
        unit: " % per km",
        hint: "Predict 3 × 2 = 6, error 6 − 8 = −2, gradient 2 × 2 × (−2) = −8, then w − 0.05 × (−8).",
        why: "The prediction is 2 too low, so the gradient is −8 and the step is 0.05 × 8 = 0.4 upwards: w = 3.4.",
      },
      {
        type: "mcq",
        q: "A broken scooter reports 0% battery used for a 9 km ride. Hopscotch learns online with a high learning rate. What is the main risk?",
        o: [
          "The weight lurches towards free rides, hurting the next predictions",
          "Nothing: the record is averaged with the rest of the data",
          "The model will stop updating until the scooter is fixed",
          "The next nightly retrain will quietly remove the record",
        ],
        a: 0,
        why: "Online learning updates immediately on every record, so one bad record shifts the weights at once, more so with a high learning rate. That is why online learning needs closer monitoring.",
      },
    ],
  });
})();

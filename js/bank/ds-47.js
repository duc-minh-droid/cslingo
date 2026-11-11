/* js/bank/ds-47.js: Data Science lecture 10 revision questions, part 1: ds10-drift. */
(function () {
  const B = NIC.bank;
  const { mc, svg, tx } = NIC.shared.ds10;

  /** Three small error-over-time panels: a step, a ramp and a square wave. */
  const shapes = (() => {
    const P = {
      a: "M14 110 L60 110 L60 40 L150 40",
      b: "M14 110 L44 110 L120 40 L150 40",
      c: "M14 110 L44 110 L44 40 L74 40 L74 110 L104 110 L104 40 L134 40 L134 110 L150 110",
    };
    return svg(
      510,
      150,
      ["a", "b", "c"]
        .map(
          (k, i) =>
            `<g data-pick="${k}" style="cursor:pointer" transform="translate(${i * 170},0)"><rect x="4" y="6" width="160" height="138" rx="12" fill="var(--panel-2)" stroke="var(--line-2)" stroke-width="2"/><path d="${P[k]}" fill="none" stroke="var(--rose)" stroke-width="3"/>${tx(84, 134, `Error over time ${"ABC"[i]}`, { s: 11.5 })}</g>`,
        )
        .join(""),
      "Three error curves: A jumps once and stays high, B climbs slowly, C goes up and down repeatedly",
    );
  })();

  B.add("ds10-drift", [
    {
      type: "cat",
      q: "Which kind of concept drift is each case?",
      buckets: ["Abrupt", "Gradual", "Recurring"],
      items: [
        ["A payment method is banned overnight and checkouts change at once", 0],
        ["A product recall flips its reviews within a day", 0],
        ["Younger customers adopt a new app over two years", 1],
        ["Wages creep up, slowly shifting what people can afford", 1],
        ["Ice-cream orders peak every summer", 2],
        ["Commuter traffic changes every weekend and back on Monday", 2],
      ],
      why: "A change at one moment is abrupt; a slow change over months or years is gradual; a pattern that returns on a cycle is recurring.",
    },
    mc(
      "A loan model sees the same kinds of applicants as last year, but after an interest-rate rise the same profile now defaults far more often. Which shift is this?",
      ["Concept drift", "Covariate shift", "Prior probability shift"],
      "The applicants (inputs) look the same; what changed is the link between a profile and defaulting. That is concept drift.",
    ),
    mc(
      "Why does a batch learner become outdated on a stream?",
      [
        "It was fitted once to past data, and the relationship moves on",
        "Its weights decay a little with every prediction it makes",
        "Streams arrive too fast for a batch model to predict at all",
      ],
      "A batch model is trained before deployment and stays fixed. Streaming data changes over time, so its learned rule stops matching reality.",
    ),
    {
      type: "pick",
      q: "Each panel shows a frozen model's error over time. Tap the one caused by <b>recurring</b> drift.",
      fig: shapes,
      a: "c",
      hint: "Recurring drift comes back again and again.",
      why: "Recurring drift switches between rules on a cycle, so the frozen model's error goes up and back down repeatedly (C). A is abrupt, B is gradual.",
    },
    {
      type: "slider",
      q: "A frozen model's error is 10% plus 40% times the share of customers who have switched to a new habit. Three quarters have switched. What is its error?",
      min: 0,
      max: 60,
      step: 5,
      start: 0,
      ans: 40,
      tol: 2,
      unit: "%",
      hint: "40 × 0.75 = 30, then add the 10.",
      why: "10% + 40% × 0.75 = 10% + 30% = 40%.",
    },
    {
      type: "multi",
      q: "Select every example the lecture gives for a <b>kind of concept drift</b>.",
      o: [
        "Cultural or economic changes",
        "A pandemic",
        "The seasons",
        "Faces covered by masks",
        "Flu estimates during COVID",
      ],
      a: [0, 1, 2],
      why: "Gradual drift: cultural or economic changes. Abrupt: a pandemic. Recurring: seasons. Masks are the covariate shift example and flu during COVID the prior probability shift example.",
    },
    {
      type: "order",
      q: "Put the steps of noticing drift through a model's errors in order.",
      items: [
        "The model makes a prediction",
        "The true outcome arrives later",
        "The prediction is marked right (0) or wrong (1)",
        "The rolling error rate is updated",
        "A sustained rise suggests the concept has drifted",
      ],
      why: "The concept cannot be seen directly, but every prediction becomes a 0 or 1 once the truth arrives, and a rising error rate is the visible sign of drift.",
    },
    mc(
      "A team averages its model's errors over the last 5,000 predictions to spot drift. What is the main weakness?",
      [
        "It reacts slowly: new errors are diluted by thousands of old ones",
        "It is too jumpy: chance alone makes it swing up and down",
        "It cannot be updated until all 5,000 predictions are replaced",
      ],
      "A long window is smooth but slow: after a drift it takes thousands of new records to move the average. A very short window has the opposite problem.",
    ),
    mc(
      "A model retrains on the first day of every month. An abrupt drift hits on the 3rd. Roughly how long is the model stale?",
      [
        "About four weeks, until the next retrain",
        "About a day, the drift fixes itself",
        "For ever, retraining cannot help",
      ],
      "A fixed schedule cannot see the drift. The model keeps the old rule until the next scheduled retrain, nearly a month later.",
    ),
    mc(
      "A heating-demand model is retrained at the end of every winter, on winter data only. What happens each summer?",
      [
        "Its error rises, because it learned winter's pattern",
        "Its error falls, because summer demand is easier",
        "Nothing changes, because retraining fixes all drift",
      ],
      "Seasons are recurring drift. A model fitted to winter is wrong in summer, and the cycle repeats every year.",
    ),
    {
      type: "bug",
      q: "This loop should retrain every 4 weeks on the <b>last 4 weeks</b> of data only. Tap the faulty line.",
      code: [
        "for week in range(1, 53):",
        "    report(evaluate(model, data[week]))",
        "    if week % 4 == 0:",
        "        model = train(data[1:week + 1])",
      ],
      a: 3,
      hint: "Which weeks does the slice cover?",
      why: "data[1:week + 1] trains on every week so far, not the last 4. It should be data[week - 3:week + 1], so old weeks stop pulling the model back.",
    },
    {
      type: "match",
      q: "Match each kind of drift to a music app's listeners.",
      pairs: [
        ["Abrupt", "A viral video makes one song everyone's favourite overnight"],
        ["Gradual", "Tastes move from one genre to another over several years"],
        ["Recurring", "Christmas songs return to the top every December"],
      ],
      why: "Overnight is abrupt, a slow move is gradual, and a pattern that returns each year is recurring.",
    },
  ]);
})();

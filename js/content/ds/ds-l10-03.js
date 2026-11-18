/* Data Science (COM3021), Lecture 10: concept drift detection.
   This part: the lessons 10.1 (ds10-drift, when the rule changes and why models go stale) and 10.2 (ds10-kinds,
   abrupt, gradual and recurring drift). Figures and the demo come from ds-l10-01.js through NIC.shared.ds10. */
(function () {
  const S = NIC.shared.ds10;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, mm, card } = S;

  /* ============ 10.1 When shoppers change their minds ============ */
  reg({
    id: "ds10-drift",
    order: 1,
    num: "10.1",
    title: "When shoppers change their minds",
    blurb:
      "Same shoppers, same baskets, different choices: meet concept drift, and see why a model trained once goes stale.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Concept drift</b>: the <b>relationship</b> between input and output changes, even if the inputs look the same.",
            "Streaming data is <b>dynamic</b>: its patterns can (and probably will) change, like <b>consumer preferences and behaviours</b>.",
            "A <b>batch learner</b> trained once becomes <b>outdated</b>, and a fixed retraining timetable cannot see when a drift happens.",
          ],
          "The world moves on whether or not the model does.",
        ),
      );
    },
  });

  L["ds10-drift"] = {
    sum: "<b>Concept drift</b> is a change in the input-output relationship over time. Streams are dynamic, so a <b>batch</b> model trained once goes stale.",
    steps: [
      st(
        "Same shoppers, new habits",
        `<p>Picture <b>Basketly</b>, a grocery app that suggests plant milk. Last year its model was spot on. This year the same shoppers, with the same baskets, click differently.</p><p>Nothing about the inputs changed. The <b>rule</b> linking input to outcome did. That is <b>concept drift</b>. You met its cousins in Lecture 9: <b>covariate shift</b> (the inputs move, like faces in masks) and <b>prior probability shift</b> (the mix of answers moves, like flu cases during COVID).</p>`,
        S.recapFig(),
        mc(
          "Basketly's shoppers and baskets look exactly as they did last year, but the same basket now leads to a different purchase. Which shift is this?",
          ["Concept drift", "Covariate shift", "Prior probability shift"],
          "The inputs are unchanged; what changed is the link from inputs to outcome. That is concept drift. Covariate shift changes the inputs, and prior shift changes the mix of answers.",
        ),
      ),
      st(
        "The world keeps moving",
        `<p>Think of a river: the water you step in today is not yesterday's water. Streaming data is like that. It is <b>dynamic</b>: its patterns can, and probably will, change over time.</p><p>The lecture's example is <b>consumer preferences and behaviours</b>. Drag the week: more and more Basketly shoppers click the plant-milk suggestion (blue bars), while the model (purple dashes) still believes what it saw in week 1.</p>`,
        (box) => S.prefsFig(box),
      ),
      st(
        "Why a model trained once goes stale",
        `<p>Imagine using a paper map printed ten years ago: the new roads are missing. A <b>batch learner</b> is like that map. It is trained once on past data and then used as it is, so it <b>becomes outdated</b> when the concept drifts.</p><p>Retraining on a timetable (say every 4 weeks) helps, but the timetable cannot see <i>when</i> a drift happens, so the model stays wrong until its next retrain. Step through the weeks: red is the frozen model, blue the monthly retrain.</p>`,
        (box, life) => S.staleRun(box, life),
        mc(
          "Basketly retrains its model on a fixed timetable. Why can it still be wrong for weeks after a drift?",
          [
            "The timetable cannot see when the drift happens",
            "Each retrain makes the model forget the new rule",
            "A retrain only ever uses the very oldest records",
          ],
          "A timetable retrains on its own schedule, not when the world changes. Between the drift and the next retrain the model keeps the old rule.",
        ),
      ),
    ],
  };

  /* ============ 10.2 Three ways the world drifts ============ */
  reg({
    id: "ds10-kinds",
    order: 2,
    num: "10.2",
    title: "Three ways the world drifts",
    blurb: "Overnight, little by little, or round and round: abrupt, gradual and recurring drift.",
    render(root, life) {
      root.appendChild(header(this, ""));
      const c = card("A drifting stream of predictions", "inject a drift");
      root.appendChild(c);
      S.live(c.lastElementChild, life);
      root.appendChild(
        pr(
          "ds10-drift-1",
          "You tried a <b>Gradual</b> drift on the <b>Frozen model</b>. How did the blue error line change after you injected it?",
          [
            "It climbed slowly over a few hundred records",
            "It jumped to about 50% straight away",
            "It went up and down in regular waves",
          ],
          "Gradual drift moves shoppers to the new rule a little at a time, so the frozen model's error rises slowly rather than all at once.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Abrupt</b> drift happens all at once, like a <b>pandemic</b>.",
            "<b>Gradual</b> drift creeps in, like <b>cultural or economic changes</b>; no single week looks alarming.",
            "<b>Recurring</b> (cyclical) drift comes and goes, like the <b>seasons</b>, so the old rule is worth remembering.",
          ],
          "Overnight, little by little, or round and round.",
        ),
      );
    },
  });

  L["ds10-kinds"] = {
    sum: "Concept drift can be <b>abrupt</b> (a pandemic), <b>gradual</b> (cultural or economic change) or <b>recurring</b> (the seasons).",
    steps: [
      st(
        "Overnight: abrupt drift",
        `<p>Picture a supermarket on the day a lockdown begins: the pasta shelves are empty by lunchtime. <b>Abrupt</b> drift happens all at once. One day the old rule holds, the next day a new one does.</p><p>The lecture's example is a <b>pandemic</b>. Move the week slider past week 12: Basketly's frozen model goes from mostly right to wrong half the time, in a single week.</p>${mm("<p>Model it with a concept level $c(t)$ between 0 (the old rule) and 1 (the new rule). Abrupt drift at time $t_0$ is a step:</p>$$c(t) = \\begin{cases} 0 & t < t_0 \\\\ 1 & t \\ge t_0 \\end{cases}$$<p>In this lesson a frozen model's error rate is $10\\% + 40\\% \\times c(t)$.</p>")}`,
        (box) => S.shapeFig(box, "abrupt"),
        mc(
          "A city bans cars from its centre overnight, and a delivery-time model's errors jump the next morning. Which kind of drift is this?",
          ["Abrupt", "Gradual", "Recurring"],
          "The rule changed at one moment and stays changed: abrupt drift.",
        ),
      ),
      st(
        "Little by little: gradual drift",
        `<p>Think of how a new fashion catches on: a few people first, then more, then nearly everyone. <b>Gradual</b> drift creeps in the same way. The new rule takes over a little at a time.</p><p>The lecture's examples are <b>cultural or economic changes</b>, such as tastes shifting or prices rising over months. No single week looks alarming, and that is exactly what makes gradual drift hard to spot.</p>${mm("<p>A linear ramp from $t_0$ over $T$ steps:</p>$$c(t) = \\min\\left(1, \\max\\left(0, \\frac{t - t_0}{T}\\right)\\right)$$<p>Beyond the slides: some papers split this into <b>incremental</b> drift (the rule itself slides slowly) and <b>gradual</b> drift (old and new rules alternate, the new one more and more often). Both look like a slow climb in the error.</p>")}`,
        (box) => S.shapeFig(box, "gradual"),
      ),
      st(
        "Round and round: recurring drift",
        `<p>Every winter your coat comes out of the wardrobe, and every summer it goes back in. <b>Recurring</b> (or <b>cyclical</b>) drift is like that: the rule switches, and later switches back.</p><p>The lecture's example is the <b>seasons</b>: what people buy in winter is not what they buy in summer, and next winter looks like this one. The old rule is not gone for good, so it is worth remembering.</p>${mm("<p>A square wave with period $2P$:</p>$$c(t) = \\left\\lfloor \\frac{t}{P} \\right\\rfloor \\bmod 2$$<p>Beyond the slides: systems facing recurring drift often keep a library of old models and switch back to the one that fits, instead of relearning each season from scratch.</p>")}`,
        (box) => S.shapeFig(box, "recurring"),
        mc(
          "Sales of barbecue food rise every summer and fall every winter, year after year. Which kind of drift is this?",
          ["Recurring", "Abrupt", "Gradual"],
          "The pattern returns on a cycle, like the seasons: recurring or cyclical drift.",
        ),
      ),
    ],
    guide: [
      "Keep the <b>Frozen model</b>, pick <b>Abrupt</b>, press <b>Inject drift</b> and then <b>+50 records</b>: watch <b>Error, last 50</b> jump.",
      "Press <b>Reset</b>, pick <b>Gradual</b>, press <b>Inject drift</b>, then <b>Play</b> and watch the blue line climb.",
      "Press <b>Reset</b>, try <b>Recurring</b>, then <b>Retrain every 200</b>. Then answer the question after the demo.",
    ],
  };
})();

/* js/bank/ds-46.js: Data Science lecture 9 revision questions, part 2: ds9-online. */
(function () {
  const B = NIC.bank;
  const { mc } = NIC.shared.ds9;
  const pk = (list) =>
    `<div class="ds9-days" style="justify-content:center">${list.map(([id, t, v]) => `<span class="ds9-day" data-pick="${id}" style="cursor:pointer;padding:6px 10px">${t}<br>${v}</span>`).join("")}</div>`;

  B.add("ds9-online", [
    mc(
      "A ride-hailing app adjusts its fare model a little after every finished trip, as soon as the trip ends. What is this?",
      ["Online learning", "Full batch learning", "Mini-batch learning on a window"],
      "Updating the parameters whenever a new observation arrives, one data point per update, is online learning.",
    ),
    {
      type: "slider",
      q: "An online model has <b>w = 6</b> minutes per km. A 1 km trip took 4 minutes. With learning rate 0.1, what is w after this update?",
      min: 5,
      max: 6.5,
      step: 0.1,
      start: 6,
      ans: 5.6,
      tol: 0.05,
      unit: " min per km",
      hint: "Predict 6, error 6 − 4 = 2, gradient 2 × 1 × 2 = 4, then w − 0.1 × 4.",
      why: "The prediction is 2 too high. Gradient 4, step 0.1 × 4 = 0.4 downwards: w = 5.6.",
    },
    {
      type: "cat",
      q: "Which kind of data shift is each case?",
      buckets: ["Covariate shift", "Prior probability shift", "Concept drift"],
      items: [
        ["A crop model trained in one region is used on another region's soils", 0],
        ["A camera model meets photos from a new, much darker sensor", 0],
        ["Symptoms look the same, but a disease becomes far rarer", 1],
        ["Shoppers browse as before, but the share who buy doubles on a sale day", 1],
        ["After a law change the same CV now leads to a different hiring outcome", 2],
        ["The same route now takes far longer because of new traffic rules", 2],
      ],
      why: "New kinds of input are covariate shift. A change in how common each target is, with inputs unchanged, is prior probability shift. A changed input-output relationship is concept drift.",
    },
    {
      type: "multi",
      q: "Select every drawback of online learning named in the lecture.",
      o: [
        "Bad data has an immediate impact",
        "It needs closer monitoring",
        "Convergence is less stable",
        "It must store every record for later epochs",
        "It cannot adapt to changes in the data",
      ],
      a: [0, 1, 2],
      why: "Online learning updates on every record, so bad data hits at once, it must be watched closely and it converges less smoothly. It does not store data for epochs, and adapting to change is its strength.",
    },
    {
      type: "order",
      q: "Put one step of online learning in order.",
      items: [
        "A new observation arrives",
        "Predict it with the current weights",
        "Compare the prediction with the real outcome",
        "Update the weights from this one observation",
        "Move on to the next observation",
      ],
      why: "Online learning handles each observation as it arrives: predict, measure the error, update, and move on. The stream is processed in one pass.",
    },
    mc(
      "Prices on a market site change by the hour and the incoming data is clean and trusted. How should the online learning rate be set?",
      [
        "Fairly high: fast change and little risk from bad data",
        "Very low: so the model barely notices any change",
        "Zero: online models must not change after deployment",
      ],
      "A higher learning rate adapts faster. That suits fast-moving data, and the usual cost (bad data having an immediate impact) is small when the data is clean.",
    ),
    mc(
      "Why is streaming data called the extreme case for model training?",
      [
        "Data must be processed in one pass and may evolve",
        "The data is too small to train any useful model",
        "Every record must be stored and re-read each epoch",
      ],
      "With a stream multiple passes are no longer possible, the data may change over time so the model can become outdated, and it arrives at high speed.",
    ),
    {
      type: "match",
      q: "Match each approach to how much data each update uses.",
      pairs: [
        ["Full batch", "All the available data"],
        ["Mini-batch", "A part of the data"],
        ["Online", "One single data point"],
      ],
      why: "Full batch computes the true gradient from everything, a mini-batch estimates it from part, and online learning (stochastic gradient descent) uses one point at a time.",
    },
    {
      type: "pick",
      q: "An online model has w ≈ 4 minutes per km. Tap the record that will move w the <b>most</b> when it arrives.",
      fig: pk([
        ["a", "3 km", "13 min"],
        ["b", "2 km", "70 min"],
        ["c", "1 km", "5 min"],
        ["d", "4 km", "15 min"],
      ]),
      a: "b",
      hint: "Which record is furthest from 4 minutes per km?",
      why: "A 2 km trip at 70 minutes is wildly off the model's 8-minute prediction, so its gradient is huge. The others are within a couple of minutes. Bad data hits an online model at once.",
    },
    mc(
      "What is stochastic gradient descent?",
      [
        "Updating from one randomly chosen example at a time",
        "Updating once per epoch from all the examples",
        "Choosing a random learning rate for every update",
      ],
      "Stochastic gradient descent estimates the gradient from a single example per update. Online learning uses it on each new observation.",
    ),
    {
      type: "bug",
      q: "This code is meant to learn online from a live stream. Tap the line that cannot work on a stream.",
      code: [
        "w = 4",
        "for epoch in range(5):",
        "    for record in live_stream:",
        "        w = w - learning_rate * gradient(w, record)",
      ],
      a: 1,
      hint: "How many times can a stream be read?",
      why: "Epochs re-read the same data. A live stream is processed in one pass and is not stored, so the loop over 5 epochs has nothing to re-read.",
    },
  ]);
})();

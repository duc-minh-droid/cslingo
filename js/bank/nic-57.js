/* Revision bank, Nature-Inspired Lecture 16: 16.4 generalisation and graceful degradation, 16.5 evolving a rainfall-runoff network. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l16-graceful", [
    M(
      "What lets a neural network recognise a letter written in a style it never saw?",
      [
        "It learned the common patterns in the data",
        "It memorised every possible style of handwriting",
        "It follows explicit drawing rules from an expert",
      ],
      0,
      "Networks learn the patterns that distinguish classes, so they generalise and are tolerant of noise.",
    ),
    M(
      "Several neurons are removed from a trained network. What does the lecture expect?",
      [
        "Reduced performance, probably not total failure",
        "Total failure, just as in a rule system",
        "No change in performance at all, ever",
      ],
      0,
      "That is graceful degradation, which echoes fault tolerance in the brain.",
    ),
    M(
      "In a symbolic system, what usually happens when one component is removed?",
      ["The system fails", "Performance dips slightly", "It retrains itself"],
      0,
      "Symbolic systems are serial and fragile: removing a component usually results in failure.",
    ),
    TF(
      "Generalisation lets neural networks tolerate noise in their inputs.",
      true,
      "Learning common patterns, not exact copies, is what makes them noise tolerant.",
    ),
    {
      type: "cat",
      q: "Sort each behaviour into the idea it shows.",
      buckets: ["Generalisation", "Graceful degradation"],
      items: [
        ["Recognising a mug from an unusual angle", 0],
        ["Reading a smudged handwritten digit", 0],
        ["Still forecasting after losing a few neurons", 1],
        ["Accuracy drops a little when units fail", 1],
      ],
      why: "Generalisation handles new or noisy inputs; graceful degradation handles damage to the network itself.",
    },
    {
      type: "multi",
      q: "Which reasons does the lecture give for why generalisation is useful?",
      o: [
        "We do it all the time ourselves",
        "We infer properties of new objects and events",
        "We recognise objects despite their orientation",
        "It makes networks easy to interpret",
        "It removes the need for any data",
      ],
      a: [0, 1, 2],
      why: "The lecture ties generalisation to everyday human skills: inferring about new things and recognising objects from any angle.",
    },
    TF(
      "Graceful degradation in neural networks is said to replicate our understanding of fault tolerance in the brain.",
      true,
      "The brain tolerates the loss of neurons; networks show the same behaviour.",
    ),
  ]);

  B.add("l16-evolve", [
    M(
      "In the lecture's runoff study, what did the network take as inputs?",
      ["Rainfall and air temperature", "River depth and wind speed", "Soil type and sunshine hours"],
      0,
      "Rainfall and air temperature were used to model sewer flow.",
    ),
    M(
      "What structure did the runoff network have?",
      [
        "One hidden layer of 10 neurons and one output",
        "Two hidden layers of 100 neurons each",
        "No hidden layer and ten outputs",
      ],
      0,
      "A single hidden layer of 10 neurons and a single output neuron for predicted flow.",
    ),
    M(
      "How did the study use cross-validation?",
      ["Each rainfall event was one split", "Each calendar year was one split", "Each sewer sensor was one split"],
      0,
      "With 15 rainfall events, each event served as a held-out split, to check the model generalises.",
    ),
    {
      type: "match",
      q: "Match each part of the evolutionary algorithm to how the study set it up.",
      pairs: [
        ["Representation", "A continuous vector of D network weights"],
        ["Fitness", "Mean absolute error of the predictions"],
        ["Mutation", "Add small Gaussian noise to one random weight"],
        ["Crossover", "Combine the weights of two parents"],
      ],
      why: "Each solution is a set of weights; fitness is MAE; additive Gaussian mutation and crossover adapt the weights.",
    },
    {
      type: "multi",
      q: "Which statements about the Nash-Sutcliffe efficiency coefficient are true?",
      o: [
        "Its best value is 1",
        "It can fall towards minus infinity",
        "It measures model accuracy",
        "Its best value is 0",
        "It cannot be negative",
      ],
      a: [0, 1, 2],
      why: "NSE scores accuracy: 1 is perfect and in the worst case it heads to minus infinity.",
    },
    M(
      "Why does runoff modelling matter more in urban areas?",
      ["The ground is impervious", "Cities get more rain", "Sewers never overflow elsewhere"],
      0,
      "Hard urban surfaces do not absorb rain, so runoff reaches the drains fast and flooding risk is higher.",
    ),
    TF(
      "The lecture names backpropagation and nature-inspired optimisation as two ways to optimise a network's weights.",
      true,
      "The summary says networks are optimised with backpropagation or nature-inspired techniques, such as the EA in the runoff study.",
    ),
    M(
      "Additive Gaussian mutation mostly makes which kind of change to a weight?",
      [
        "Small nudges, with occasional larger ones",
        "Large jumps of the same size every time",
        "Resetting it straight back to zero",
      ],
      0,
      "Gaussian noise centred on 0 is usually small, with rarer bigger values, so the search mostly fine-tunes.",
    ),
  ]);
})();

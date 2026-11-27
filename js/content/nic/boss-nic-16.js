/* Nature-Inspired boss quiz for Lecture 16 (neural networks): a cider orchard's harvest forecaster, fresh scenarios, mixed formats, no calculation. */
(function () {
  const N = NIC;

  N.registerBoss({
    id: "l16-boss",
    lecture: 16,
    title: "Lecture 16 boss quiz",
    blurb:
      "Ten questions: brains versus computers, neurons, XOR, generalisation and evolving the weights, for an orchard.",
    lede: "Pippin Hollow, a cider orchard, wants a neural network that forecasts each tree's apple harvest from weather and soil readings. Help the growers understand what they are building, no calculator needed.",
    qs: [
      {
        type: "cat",
        q: "The growers list strengths. Sort each into the machine the lecture credits it to.",
        buckets: ["Conventional computer", "Human brain"],
        items: [
          ["Adds up a season's sales in a blink", 0],
          ["Keeps every record exactly, for years", 0],
          ["Memory kept apart from processing", 0],
          ["Spots a ripe apple in dappled light", 1],
          ["Forgets unimportant details over time", 1],
          ["Generalises to a tree variety it never saw", 1],
        ],
        why: "Computers are fast, sequential, exact, with separate memory and long-term storage. Brains are distributed, learn, generalise and forget the unimportant.",
      },
      {
        type: "match",
        q: "Match each part of a biological neuron to its job.",
        pairs: [
          ["Dendritic tree", "Receives signals"],
          ["Cell body", "Processes signals"],
          ["Axon", "Transmits signals"],
          ["Synapse", "Adjustable junction where learning is thought to happen"],
        ],
        why: "Dendrites receive, the cell body processes and the axon transmits. The synapse can excite or inhibit and be strengthened, so it is where learning is thought to occur.",
      },
      {
        type: "mcq",
        q: "Pippin Hollow's old system is a list of IF-THEN rules written by an expert grower. Which label fits it?",
        o: ["Symbolic AI", "Connectionism", "A multi-layer perceptron", "A spiking neural network"],
        a: 0,
        why: "Explicit IF-THEN rules typed in by an expert make an expert system, which is symbolic AI. Connectionism learns weights in a network instead.",
      },
      {
        type: "multi",
        q: "Which properties does the lecture give to connectionism rather than to symbolic AI?",
        o: [
          "Knowledge is learned from data",
          "Degrades gracefully when parts fail",
          "Generalises beyond the cases it saw",
          "Every decision is easy to interpret",
          "Reasoning uses explicit symbols",
        ],
        a: [0, 1, 2],
        why: "Connectionism learns, degrades gracefully and generalises, but it is a black box. Interpretability and explicit symbols belong to symbolic AI.",
      },
      {
        type: "mcq",
        q: "A grower wants one artificial neuron to sound an alarm when exactly one of two frost sensors is on, but not both. What will happen?",
        o: [
          "No single neuron can do it: a hidden layer is needed",
          "It works once the threshold is set high enough",
          "It works once both weights are made negative",
          "It works once a third, unused input is added",
        ],
        a: 0,
        why: "'Exactly one' is XOR. One threshold neuron splits inputs with a single straight line and cannot separate XOR's cases; a multi-layer perceptron with a hidden layer can.",
      },
      {
        type: "order",
        q: "Put these milestones of neural computation in time order, earliest first.",
        items: [
          "McCulloch and Pitts build an artificial neuron that handles simple logic",
          "Rumelhart and McClelland publish Parallel Distributed Processing",
          "Multi-layer perceptrons become one of the most widely used ML techniques",
        ],
        why: "McCulloch and Pitts came in 1943; Parallel Distributed Processing, which solved XOR with an extra layer, in 1986; wide use followed.",
      },
      {
        type: "mcq",
        q: "A hailstorm corrupts a few hidden neurons of the orchard's trained network. What should the growers expect?",
        o: [
          "Somewhat worse forecasts, but still usable ones",
          "No forecasts at all until the network is rebuilt",
          "Exactly the same forecasts as before the storm",
          "Better forecasts, since the network got simpler",
        ],
        a: 0,
        why: "Graceful degradation: removing neurons reduces performance but probably does not cause overall failure, much as the brain tolerates damage.",
      },
      {
        type: "cat",
        q: "The growers will train the network with an evolutionary algorithm, as in the lecture's runoff study. Sort each item into its role.",
        buckets: ["Representation", "Fitness", "Variation"],
        items: [
          ["One list holding every network weight", 0],
          ["Each decision variable is one weight", 0],
          ["Mean absolute error of the forecasts", 1],
          ["Add small Gaussian noise to one random weight", 2],
          ["Mix two parents' weight lists", 2],
        ],
        why: "The genome is a continuous vector of weights; fitness is the MAE between forecast and real harvest; mutation and crossover vary the weights.",
      },
      {
        type: "mcq",
        q: "The orchard has harvest records from 12 seasons. To check that the network generalises, what should each cross-validation split do?",
        o: [
          "Train on 11 seasons and test on the one held out",
          "Train and test on all 12 seasons together",
          "Train on the wettest season and test on the driest",
          "Test only on the season with the biggest harvest",
        ],
        a: 0,
        why: "The runoff study held out one rainfall event per split. Holding out one season tests the model on data it never trained on.",
      },
      {
        type: "multi",
        q: "The final model's Nash-Sutcliffe efficiency is reported. Which statements about that score are true?",
        o: [
          "The best possible value is 1",
          "A very poor model can score far below 0",
          "Higher values mean a more accurate model",
          "It can never be lower than 0",
          "The best possible value is 0",
        ],
        a: [0, 1, 2],
        why: "Nash-Sutcliffe is 1 for a perfect model and has no lower limit: in the worst case it heads to minus infinity.",
      },
    ],
  });
})();

/* Revision bank, Nature-Inspired Lecture 17: 17.4 STDP, 17.5 backpropagation, the Dirac delta and surrogates, and 17.6 evolving SNNs. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l17-stdp", [
    {
      type: "cat",
      q: "A 'smell food' neuron (pre) connects to a 'turn' neuron (post). Sort each event by what STDP does.",
      buckets: ["Strengthen (potentiation)", "Weaken (depression)"],
      items: [
        ["Smell food fires, then turn fires", 0],
        ["Pre fires a moment before post", 0],
        ["Turn fires, then smell food fires", 1],
        ["Post fires a moment before pre", 1],
      ],
      why: "Pre before post strengthens the connection; post before pre weakens it.",
    },
    M(
      "In STDP, which neuron is the pre-synaptic one?",
      [
        "The neuron that sends the signal across the synapse",
        "The neuron that receives the signal",
        "Whichever of the two neurons fired most recently",
        "The neuron with the higher threshold of the pair",
      ],
      0,
      "The pre-synaptic neuron transmits; the post-synaptic neuron receives.",
    ),
    TF(
      "STDP needs a labelled target output to decide how to change a weight.",
      false,
      "It uses only the relative timing of pre and post spikes, which is why it supports unsupervised learning.",
    ),
    M(
      "Over a day, a doorbell neuron usually fires just before a 'visitor' neuron. What does STDP do to the link between them?",
      ["Makes it stronger", "Makes it weaker", "Leaves it unchanged", "Removes it entirely"],
      0,
      "Pre repeatedly firing before post is potentiation, so the synapse strengthens.",
    ),
    M(
      "What does the 'timing-dependent' in spike-timing-dependent plasticity refer to?",
      [
        "Which of the two neurons fired first",
        "How long the network has been running",
        "How fast the learning rate decays",
        "The time taken to compute the output",
      ],
      0,
      "The change depends on the order of the pre- and post-synaptic spikes.",
    ),
    M(
      "A synapse starts at 0 and changes by +1 for potentiation and −1 for depression. Over a run, post fires just after pre four times and just before pre once. Where does it end?",
      ["Above 0: strengthened overall", "Below 0: weakened overall", "Back at exactly 0"],
      0,
      "Four strengthening pairs outweigh one weakening pair, so the connection ends stronger.",
      { hint: "Four steps up, one step down." },
    ),
  ]);

  B.add("l17-surrogate", [
    {
      type: "order",
      q: "Put the argument for surrogate functions in order.",
      items: [
        "Backpropagation needs each neuron's derivative",
        "A spike function's derivative is the Dirac delta",
        "That gives no gradient information",
        "So use a smooth surrogate such as a sigmoid",
      ],
      why: "No usable slope means backprop is stuck, so a smooth stand-in supplies one.",
    },
    M(
      "What does the Dirac delta look like?",
      [
        "Zero except one thin spike at a single point",
        "A gentle bell curve centred on zero",
        "A straight line rising steadily from left to right",
        "A constant value of one everywhere",
      ],
      0,
      "δ(x) = 0 for all x ≠ 0, yet its total area is 1: an infinitely thin, infinitely tall spike.",
    ),
    M(
      "What shape is the slope of a sigmoid surrogate?",
      [
        "A bell centred on the threshold",
        "A flat line at zero",
        "A step from zero to one",
        "A curve that keeps rising forever",
      ],
      0,
      "f'(a) = f(a)(1 − f(a)) is a bell centred at a = 0, a bit like a Gaussian.",
    ),
    {
      type: "match",
      q: "Match each sharpness factor k to how the surrogate's slope looks.",
      pairs: [
        ["Small k (like 1)", "Low, wide bell"],
        ["Large k (like 20)", "Tall, thin bell"],
        ["k grows without limit", "The Dirac delta"],
      ],
      why: "k squeezes the bell; in the limit it becomes the true spike's derivative.",
    },
    TF(
      "Backpropagation starts at the output layer and works backwards through the network.",
      true,
      "It computes the output error first, then passes error back to the hidden units to adapt their weights.",
    ),
    M(
      "Why does a very sharp surrogate (huge k) bring back some of the original problem?",
      [
        "Away from the threshold its slope is nearly zero",
        "It stops the network from producing spikes",
        "It makes every weight update the same size",
        "It turns the network back into a plain ANN",
      ],
      0,
      "As k grows the bell approaches the Dirac delta, so neurons not near threshold get almost no gradient.",
    ),
  ]);

  B.add("l17-evolve", [
    M(
      "What is neural architecture search?",
      [
        "Searching for a good network structure",
        "Searching the training data for errors",
        "Tracing which neuron fired first",
        "Finding the threshold of one neuron by hand",
      ],
      0,
      "It searches over the network's shape: how many neurons and how they are connected.",
    ),
    {
      type: "match",
      q: "Match each part of a bi-level SNN optimisation to its role.",
      pairs: [
        ["Upper problem", "The network structure"],
        ["Lower problem", "The weights for that structure"],
        ["The search", "Periodically switches between the two"],
      ],
      why: "Structure is the upper problem, weights the lower one, and the optimiser alternates.",
    },
    {
      type: "multi",
      q: "Which challenges of optimising SNNs with EAs does the lecture name?",
      o: [
        "SNNs are more expensive to optimise than ANNs",
        "EAs are highly iterative, adding to the cost",
        "Co-evolving several aspects of the SNN together",
        "EAs cannot handle more than one parameter",
      ],
      a: [0, 1, 2],
      why: "Cost (SNN expense times many EA iterations) and wider co-evolution are the two challenges. EAs handle many parameters fine.",
    },
    TF(
      "An EA can optimise spike delays and firing thresholds as well as weights.",
      true,
      "The lecture lists weights, delays and thresholds among the parameters an EA can tune.",
    ),
    M(
      "Why is an EA a natural fit for spiking networks?",
      [
        "It needs no gradients, which spikes don't provide",
        "It always finds the best network in one generation",
        "It needs far fewer tests than backpropagation",
        "It removes the need for spikes altogether",
      ],
      0,
      "EAs rely on selection and variation, not derivatives, so the Dirac delta problem doesn't block them. They are costly, not fast.",
    ),
    TF(
      "In the bi-level set-up, the weights are optimised once at the start and then never touched again.",
      false,
      "The search keeps switching between structure and weights, because each new structure needs its own weights.",
    ),
  ]);
})();

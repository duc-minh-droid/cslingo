/* Revision bank, Nature-Inspired Lecture 17: 17.1 why spiking networks, 17.2 spike coding and 17.3 the leaky neuron and spike propagation. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l17-why", [
    {
      type: "multi",
      q: "A warehouse robot must react to its sensors. Which needs does the lecture say robots have?",
      o: [
        "Perceive the world through high-dimensional sensor data",
        "Energy-efficient, low-latency processing",
        "Self-learn to adapt to changing surroundings",
        "Retrain from scratch every night on a server",
      ],
      a: [0, 1, 2],
      why: "Robots perceive through many sensors, need efficient fast processing of sparse, redundant data, and adapt as they go. Nightly retraining is not one of the listed needs.",
    },
    {
      type: "cat",
      q: "Which kind of network does each line describe?",
      buckets: ["Conventional ANN", "Spiking neural network"],
      items: [
        ["Energy hungry", 0],
        ["High latency", 0],
        ["Time-consuming and expensive to train", 0],
        ["Neurons activated only when necessary", 1],
        ["Information sent as discrete spikes over time", 1],
        ["Closer to how real brains work", 1],
      ],
      why: "The lecture lists ANNs as costly to train, slow to respond and energy hungry; SNNs send spikes over time, process sparsely and are more biologically plausible.",
    },
    M(
      "A hearing aid must pick out speech as it unfolds, on a tiny battery. Why might an SNN suit it?",
      [
        "It handles time-varying data with sparse, low-power activity",
        "It turns the sound into one large number every second",
        "It never needs any training at all",
        "It keeps every neuron busy all the time so nothing is ever missed",
      ],
      0,
      "SNNs are suited to sequential, time-varying data such as speech and only activate neurons when needed, which saves power.",
    ),
    TF(
      "A spiking neural network is described as more biologically plausible than a traditional ANN.",
      true,
      "It mimics the brain's activity by sending discrete spikes over time.",
    ),
    M(
      "Which application area is NOT one the lecture names for SNNs?",
      ["Sorting a list", "Robotics", "Speech recognition", "Sensory processing"],
      0,
      "The lecture names robotics, speech recognition, sensory processing and other dynamic, temporal pattern tasks. Sorting a static list has no time dimension.",
    ),
    TF(
      "In an SNN, every neuron does work on every time step, just like in an ANN.",
      false,
      "SNNs process data sparsely: neurons only become active when needed, which is the source of the energy saving.",
    ),
  ]);

  B.add("l17-codes", [
    {
      type: "match",
      q: "Match each coding scheme to where the message lives.",
      pairs: [
        ["Rate coding", "How many spikes arrive in a window"],
        ["Temporal coding", "When the spikes arrive"],
        ["Population coding", "Which neurons of a group fire"],
      ],
      why: "Rate counts, temporal times, population spreads the message across many neurons.",
    },
    M(
      "A thermometer neuron fires 3 spikes a second when cool and 12 when hot. Which coding is that?",
      ["Rate coding", "Temporal coding", "Population coding"],
      0,
      "The strength is carried by how many spikes arrive in a time window.",
    ),
    M(
      "In a smell sensor, a strong scent makes its neuron fire its first spike very early, and a faint scent much later. Which coding is that?",
      ["Temporal coding", "Rate coding", "Population coding"],
      0,
      "The message is in the timing of the spike, not the count.",
    ),
    M(
      "What is a spike train?",
      [
        "A sequence of spikes from one neuron over time",
        "A row of neurons that pass one spike along",
        "The training data used for an SNN",
        "A spike that is larger than usual",
      ],
      0,
      "A spike train is the timeline of one neuron's spikes. Each neuron receives spike trains and emits its own.",
    ),
    TF(
      "In a spiking network, a stronger input makes each spike taller.",
      false,
      "Spikes are all-or-nothing blips of the same size. Strength shows up in their number, timing or which neurons fire.",
    ),
    M(
      "Eight neurons each prefer a different compass direction, and the ones near 'north-east' are busy. What tells you the heading?",
      [
        "Which neurons in the group are firing",
        "How tall the loudest spike is",
        "The exact time of the very first spike",
        "The total weight of all connections",
      ],
      0,
      "That is population coding: the pattern across the group carries the value.",
    ),
  ]);

  B.add("l17-neuron", [
    {
      type: "order",
      q: "Put the life of a spiking neuron in order, starting from an empty charge.",
      items: [
        "Inputs arrive and the charge accumulates",
        "The charge reaches the threshold",
        "The neuron fires along each outgoing connection",
        "The charge resets and builds again",
      ],
      why: "Charge builds over time, firing happens at the threshold, the spike goes down every outgoing connection, then the neuron starts again.",
    },
    M(
      "What does leakage do in a spiking neuron?",
      [
        "Below-threshold charge dissipates over time",
        "Spikes leak into neighbouring neurons without connections",
        "The threshold slowly rises after each spike",
        "Weights shrink every time the neuron fires",
      ],
      0,
      "Leakage drains charge that hasn't reached the threshold, so old or weak input fades away.",
    ),
    M(
      "Two neurons get the same weak, steady input. Neuron P has no leak, neuron Q a strong leak. Which is more likely to never fire?",
      ["Q, the leaky one", "P, the one with no leak", "Both fire equally often"],
      0,
      "With no leak, even a weak drip eventually reaches the threshold. A strong leak can drain it as fast as it arrives.",
    ),
    TF(
      "A neuron's charge can come from external inputs or from spikes sent by other neurons.",
      true,
      "Charge accumulates from input signals or from signals received from other neurons.",
    ),
    M(
      "Neuron Z needs 3 spikes in the same step to fire. Neurons X and Y each send it 2 spikes when they fire. When does Z fire?",
      [
        "When X and Y fire in the same step",
        "Whenever X fires on its own",
        "Only after X has fired three times in a row",
        "Never: 2 spikes is all it can ever get",
      ],
      0,
      "Alone, X or Y gives only 2 spikes. Together they give 4 at once, which crosses the threshold.",
      { hint: "Spikes arriving together add up within a step." },
    ),
    TF(
      "When a spiking neuron fires, it sends a spike along only one of its outgoing connections, chosen at random.",
      false,
      "It emits a signal along each of its outgoing connections.",
    ),
  ]);
})();

/* Nature-Inspired boss quiz for Lecture 17 (spiking neural networks): Nightjar, a bat-like night drone that listens for echoes. Fresh scenarios, mixed formats, no calculation. */
(function () {
  const N = NIC;

  N.registerBoss({
    id: "l17-boss",
    lecture: 17,
    title: "Lecture 17 boss quiz",
    blurb: "Ten questions: spikes, coding, leaky neurons, STDP, surrogates and evolving SNNs, for a night drone.",
    lede: "Nightjar is a bat-sized night drone that finds its way by listening to echoes. Its makers want a spiking brain that runs all night on a tiny battery. Help them get it right, no calculator needed.",
    qs: [
      {
        type: "multi",
        q: "Nightjar's makers list reasons to pick a spiking neural network over a conventional ANN. Which come from the lecture?",
        o: [
          "Neurons are only activated when needed, enabling low-power computing",
          "Spikes over time suit sequential, time-varying data like echoes",
          "SNNs are more biologically plausible",
          "SNNs are easy to train with standard backpropagation",
          "Every neuron outputs a number on every step",
        ],
        a: [0, 1, 2],
        why: "Sparse, event-driven activity saves energy, spikes in time fit temporal data, and SNNs mimic the brain more closely. Backprop is exactly what they struggle with, and 'every neuron, every step' describes a conventional ANN.",
      },
      {
        type: "cat",
        q: "Sort each echo-reading scheme by the spike coding it uses.",
        buckets: ["Rate coding", "Temporal coding", "Population coding"],
        items: [
          ["A louder echo gives more spikes per second", 0],
          ["Count the spikes in a short window", 0],
          ["A closer wall makes the first spike arrive sooner", 1],
          ["One spike, and its moment is the message", 1],
          ["Twelve neurons each prefer a different distance", 2],
          ["Which neurons in a group are busy says where the wall is", 2],
        ],
        why: "Rate coding counts spikes, temporal coding reads their timing, and population coding spreads the message across a group of neurons.",
      },
      {
        type: "order",
        q: "Put one of Nightjar's leaky neurons through its cycle, starting from rest.",
        items: [
          "Echo spikes arrive and the charge builds up",
          "Between echoes, some charge leaks away",
          "A burst of echoes pushes the charge to the threshold",
          "The neuron fires along every outgoing connection",
          "The charge resets and starts building again",
        ],
        why: "Charge accumulates over time, below-threshold charge leaks, reaching the threshold fires a spike along each outgoing connection, and then it starts again.",
      },
      {
        type: "mcq",
        q: "A faint echo reaches one of Nightjar's neurons, and nothing else arrives for a long while. The neuron has a strong leak. What happens?",
        o: [
          "The charge drains away and the neuron does not fire",
          "The charge waits in the neuron until the next echo",
          "The neuron fires once to report the faint echo",
          "The charge passes straight on to the next neuron",
        ],
        a: 0,
        why: "Leakage means below-threshold charge dissipates over time. A lone faint input fades without a spike.",
      },
      {
        type: "mcq",
        q: "A deep neuron in Nightjar's network fires only when it receives 3 spikes in the same step. Two earlier neurons each send it one spike whenever an echo arrives. When does it fire?",
        o: [
          "Never: at most 2 spikes reach it in a step",
          "Every time either earlier neuron fires",
          "Only on the very first echo",
          "Whenever an echo is louder than usual",
        ],
        a: 0,
        why: "With only two incoming connections, at most 2 spikes can arrive at once, short of its threshold of 3. Spike size never changes, so loudness doesn't help.",
      },
      {
        type: "match",
        q: "Nightjar's 'hear echo' neuron (pre) connects to its 'swerve' neuron (post). Match each pattern to what STDP does.",
        pairs: [
          ["Hear echo fires, then swerve fires", "Connection strengthened (potentiation)"],
          ["Swerve fires, then hear echo fires", "Connection weakened (depression)"],
          ["No labels or targets supplied", "Unsupervised learning still happens"],
        ],
        why: "Pre before post strengthens the synapse; post before pre weakens it. Only spike timing is used, so STDP is unsupervised.",
      },
      {
        type: "mcq",
        q: "An engineer tries plain backpropagation on Nightjar's spiking network and the weights never change. What is the reason given in the lecture?",
        o: [
          "The spike function's derivative is the Dirac delta, zero almost everywhere",
          "Spiking networks have far too many layers for backpropagation to reach",
          "The learning rate is always set to zero for spikes",
          "Backpropagation only works on image data",
        ],
        a: 0,
        why: "Backprop needs the slope of each neuron's function. A spike's slope is the Dirac delta: zero except at one point, so there is no gradient information.",
      },
      {
        type: "mcq",
        q: "The engineer swaps in a sigmoid surrogate with sharpness k. Raising k from 2 to 50 makes the surrogate's slope…",
        o: [
          "taller and thinner, closer to the Dirac delta",
          "lower and wider, spread over more inputs",
          "flat at zero everywhere",
          "the same: k only changes the threshold",
        ],
        a: 0,
        why: "The slope is a bell centred on the threshold. Larger k squeezes it, and as k grows without limit it becomes the Dirac delta.",
      },
      {
        type: "bug",
        q: "This plan for evolving Nightjar's brain as a bi-level problem has one faulty line. Click it.",
        code: [
          "Upper problem: evolve the network structure",
          "Lower problem: evolve the weights for that structure",
          "Periodically switch between the two problems",
          "Expect it to be cheaper than optimising an ANN",
        ],
        a: 3,
        why: "The lecture warns the opposite: SNNs are more expensive to optimise than ANNs, and an EA is highly iterative on top. The first three lines are the bi-level set-up.",
      },
      {
        type: "multi",
        q: "Which of these can an evolutionary algorithm optimise in Nightjar's spiking network?",
        o: [
          "Connection weights",
          "Spike delays",
          "Firing thresholds",
          "The network structure",
          "The echoes in the cave",
        ],
        a: [0, 1, 2, 3],
        why: "EAs can tune parameters such as weights, delays and thresholds, and search the structure itself (neural architecture search). The echoes are the data, not part of the network.",
      },
    ],
  });
})();

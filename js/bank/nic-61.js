/* Revision bank, Nature-Inspired Lecture 18: 18.4 challenges, 18.5 neuromorphic cameras, 18.6 metaheuristics on neuromorphic hardware. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l18-catch", [
    {
      type: "cat",
      q: "Sort each problem into the challenge it belongs to.",
      buckets: ["Performance", "Usability and access", "Benchmarks", "Programming abstractions"],
      items: [
        ["Deep learning still gives better results", 0],
        ["Few cases where it beats deep learning", 0],
        ["Little accessible hardware or software", 1],
        ["Large training times", 1],
        ["No ImageNet-style competition", 2],
        ["Proposed problems ignore the temporal aspect", 2],
        ["Networks designed neuron by neuron", 3],
        ["Choosing every parameter by hand is error prone", 3],
      ],
      why: "These are the four challenge areas in the lecture: results, access, benchmarks and abstractions.",
    },
    M(
      "Against which kind of hardware does the lecture say neuromorphic computing wins on energy efficiency?",
      ["Edge GPUs", "Paper and pencil", "Quantum annealers"],
      0,
      "Neuromorphic hardware outperforms alternatives such as edge GPUs on energy efficiency, even where it loses on results.",
    ),
    M(
      "What possible reason does the lecture give for neuromorphic computing lagging behind deep learning?",
      ["Its reliance on backpropagation", "Its lack of any parallelism at all", "Its use of binary data everywhere"],
      0,
      "The slide suggests the reliance on backpropagation, a training method designed for conventional networks, may be part of the reason.",
    ),
    TF(
      "Benchmarks such as the ImageNet competition helped drive the development of deep learning.",
      true,
      "Shared challenge problems drove deep learning, and neuromorphic computing lacks an equivalent suite.",
    ),
    TF(
      "Graph modelling is a popular neuromorphic example because graphs map readily onto a spiking network.",
      true,
      "With designers working at the neuron and synapse level, problems that already look like networks are the easiest to build.",
    ),
    M(
      "A student must choose every neuron's parameters and every connection by hand, and keeps making mistakes. Which challenge is this?",
      ["Defining programming abstractions", "Lack of shared benchmark problems", "Poor energy efficiency on the chip"],
      0,
      "Without higher-level abstractions, developers design SNNs at the neuron and synapse level, which is error prone.",
    ),
  ]);

  B.add("l18-camera", [
    M(
      "What is another name for a neuromorphic vision sensor?",
      ["An event-based camera", "A frame-rate camera", "A depth camera"],
      0,
      "Neuromorphic vision sensors are event-based cameras, modelled on how the eye works.",
    ),
    M(
      "A bird flies across an event camera's view, then the sky is empty. Which pixels spike afterwards?",
      ["None, since nothing changes", "All of them, once per frame", "Only the pixels at the edges"],
      0,
      "Event cameras emit spikes when a pixel's intensity changes. An unchanging sky produces no spikes.",
    ),
    {
      type: "cat",
      q: "Which camera does each statement describe best?",
      buckets: ["Event camera", "Conventional camera"],
      items: [
        ["Spikes when a pixel's brightness changes", 0],
        ["Very high temporal resolution", 0],
        ["Greatly reduced power use", 0],
        ["Sends every pixel in every frame", 1],
        ["Gives a full picture of a still scene", 1],
      ],
      why: "Event cameras report changes, quickly and cheaply. Conventional cameras send full frames, which still helps in some circumstances such as still scenes.",
    },
    M(
      "What is sensor fusion in this lecture?",
      [
        "Combining event camera output with a conventional camera's",
        "Melting two camera chips into one physical sensor",
        "Replacing every camera pixel with a synapse",
      ],
      0,
      "Event cameras can be combined with conventional cameras using sensor fusion, getting the strengths of both.",
    ),
    TF(
      "Event-based cameras have made conventional cameras useless in every situation.",
      false,
      "Conventional cameras are still advantageous in some circumstances.",
    ),
    TF(
      "Event-based cameras are based on the way the eye operates.",
      true,
      "They copy the eye, which responds mainly to change.",
    ),
  ]);

  B.add("l18-evolve", [
    M(
      "Why might metaheuristics such as GAs and PSO suit neuromorphic hardware?",
      [
        "They are highly parallel, and costly in energy on conventional hardware",
        "They only work with spikes and never with ordinary numbers at all",
        "They need a separate memory bank for every single candidate solution",
      ],
      0,
      "Metaheuristics are highly parallelisable but computationally intensive and energy hungry on conventional hardware, while neuromorphic chips are parallel and efficient.",
    ),
    {
      type: "match",
      q: "Match each feature of neuromorphic heuristic units to what it means.",
      pairs: [
        ["Asynchronous evolution", "Candidates are updated without lock-step generations"],
        ["Operators as state transitions", "Heuristic moves are built into the units' states"],
        ["Global coordination", "A neighbourhood manager and high-level selector steer the search"],
      ],
      why: "These are the three features of neuromorphic heuristic units from the lecture.",
    },
    M(
      "In the perturbation rule, what happens when a unit emits a spike?",
      [
        "The candidate moves by the neuron's internal dynamics, h_d",
        "The candidate moves by the heuristic perturbation, h_s",
        "The candidate is deleted from the population",
      ],
      0,
      "With a spike, v becomes h_d(v), the internal neuron dynamics. Without one, v becomes h_s(v), the heuristic perturbation.",
    ),
    {
      type: "order",
      q: "Put the steps of the general metaheuristic loop in order, starting from the beginning.",
      items: [
        "Initialise",
        "Generate offspring",
        "Evaluate offspring",
        "Check whether finished",
        "Selection, then back to generating",
      ],
      why: "Initialise, generate and evaluate offspring, then check whether to stop; if not, select and generate again.",
    },
    TF(
      "Neuromorphic computing is still highly experimental.",
      true,
      "The lecture's summary calls it promising but still highly experimental, with a way to go before it is usable and accessible.",
    ),
    TF(
      "Spiking neural networks are less biologically plausible than deep learning.",
      false,
      "It is the other way round: spiking networks are more biologically plausible than techniques such as deep learning.",
    ),
  ]);
})();

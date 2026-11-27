/* Nature-Inspired boss quiz for Lecture 18 (neuromorphic computing): a river-watch buoy, fresh scenarios, mixed formats, no calculation. */
(function () {
  const N = NIC;

  N.registerBoss({
    id: "l18-boss",
    lecture: 18,
    title: "Lecture 18 boss quiz",
    blurb:
      "Ten questions on neuromorphic computing for a solar river buoy: architectures, strengths, machines, challenges and event cameras.",
    lede: "Ripple is a small solar buoy that watches a river for otters and floods. Its team wonders whether a neuromorphic chip could keep it running through dark winter weeks. Help them think it through.",
    qs: [
      {
        type: "cat",
        q: "Ripple's team lists features of two chips. Sort each feature into the architecture it belongs to.",
        buckets: ["von Neumann", "Neuromorphic"],
        items: [
          ["CPU for processing, memory for storing", 0],
          ["Instructions come from a program", 0],
          ["Data encoded in binary", 0],
          ["Synapses store data and process it", 1],
          ["Instructions set by synapse structure", 1],
          ["Information in spike timing and magnitude", 1],
        ],
        why: "von Neumann machines separate processing and memory, run programs and use binary. Neuromorphic machines compute in their synapses, whose structure plays the part of the program, and take spikes as input.",
      },
      {
        type: "mcq",
        q: "On a still winter night nothing moves on the river, and Ripple's neuromorphic chip barely uses any energy. Which strength explains this?",
        o: ["Event driven", "Scalability", "Collocated processing and memory", "Parallel operation"],
        a: 0,
        why: "An event-driven chip processes only when a spike arrives. No movement means few spikes, so little work. The other strengths are real but do not explain the quiet-night saving.",
      },
      {
        type: "match",
        q: "Match each neuromorphic strength to what it means for Ripple's chip.",
        pairs: [
          ["Parallel operation", "All neurons can work at the same time"],
          ["Collocated processing and memory", "No slow trips to a separate memory"],
          ["Scalability", "Add more chips with more neurons"],
          ["Event driven", "Work happens only when a spike arrives"],
        ],
        why: "These are the four characteristics from the lecture: parallel, collocated, scalable and event driven.",
      },
      {
        type: "multi",
        q: "Which of these jobs does the lecture list as applications of neuromorphic computing?",
        o: [
          "Routing messages through a communication network",
          "Integer optimisation such as QUBO",
          "Random walkers simulating a Markov chain",
          "Detecting seizures from brain oscillations",
          "Replacing a hard disk for long-term storage",
        ],
        a: [0, 1, 2, 3],
        why: "Graph algorithms (routing), optimisation (QUBO, constraint satisfaction), Markov chains and signal processing (seizure detection, vehicle control) are all listed. Bulk storage is not.",
      },
      {
        type: "match",
        q: "The team reads about three machines. Match each fact to its machine.",
        pairs: [
          ["18 ARM cores, about 1 W per chip", "SpiNNaker"],
          ["1 million neurons per chip, Corelet language", "TrueNorth"],
          ["Unveiled 2023, aimed at low-latency AI pipelines", "NorthPole"],
        ],
        why: "SpiNNaker uses ARM cores and a tiny energy budget; TrueNorth packs a million neurons per chip and is configured in Corelet; NorthPole is its 2023 successor focused on usability and latency.",
      },
      {
        type: "mcq",
        q: "One engineer says: 'A neuromorphic chip will beat our deep learning model on accuracy.' What does the lecture say?",
        o: [
          "Traditional machine learning is still usually superior",
          "Neuromorphic chips always win on accuracy",
          "The two have never been compared at all",
          "Accuracy is identical; only the price differs",
        ],
        a: 0,
        why: "There are few cases where neuromorphic computing beats deep learning. Its advantage today is energy efficiency, for example against edge GPUs.",
      },
      {
        type: "cat",
        q: "Sort each complaint from the team into the challenge it illustrates.",
        buckets: ["Usability and access", "Lack of benchmarks", "Programming abstractions"],
        items: [
          ["We can't find hardware we can actually buy", 0],
          ["Training our network takes far too long", 0],
          ["There's no ImageNet-style contest for spiking chips", 1],
          ["Proposed test problems ignore timing", 1],
          ["We have to wire every neuron and synapse by hand", 2],
          ["Setting every parameter ourselves keeps causing mistakes", 2],
        ],
        why: "Access and long training are usability problems; missing shared, temporal challenge problems is the benchmark gap; designing at the neuron and synapse level is the abstraction problem.",
      },
      {
        type: "mcq",
        q: "Ripple swaps its camera for an event-based camera. An otter swims past quickly, then the river is still. What does the camera output?",
        o: [
          "Spikes while the otter moves, then almost nothing",
          "A full frame every moment, otter or not",
          "Nothing at all, since it only sees still scenes",
          "Spikes only when the frame clock ticks",
        ],
        a: 0,
        why: "Event cameras emit spikes when pixel brightness changes. The moving otter changes pixels; the still river does not.",
      },
      {
        type: "bug",
        q: "This pseudocode should perturb a candidate in a neuromorphic heuristic unit. Click the faulty line.",
        code: [
          "for each unit u:",
          "    update u's neuron state",
          "    if u emitted a spike:",
          "        v = h_d(v)    # internal neuron dynamics",
          "    else:",
          "        v = v         # wait for the next spike",
        ],
        a: 5,
        why: "Without a spike the candidate should still move: v = h_s(v), the heuristic perturbation. As written, units only change on spikes, so the heuristic operators never act.",
      },
      {
        type: "multi",
        q: "Which statements match the lecture's summary of neuromorphic computing?",
        o: [
          "It is based on spiking neural networks",
          "It is more biologically plausible than deep learning",
          "It is still highly experimental",
          "It is already easy to access and use",
          "It no longer needs any expensive machines",
        ],
        a: [0, 1, 2],
        why: "It rests on spiking networks, which are more biologically plausible, and it is still experimental, with large and very expensive machines and a way to go before it is usable and accessible.",
      },
    ],
  });
})();

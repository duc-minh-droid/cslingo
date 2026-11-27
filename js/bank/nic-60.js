/* Revision bank, Nature-Inspired Lecture 18: 18.1 von Neumann against neuromorphic, 18.2 the four strengths, 18.3 applications and machines. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l18-brain", [
    {
      type: "cat",
      q: "Sort each description into the architecture it describes.",
      buckets: ["von Neumann", "Neuromorphic"],
      items: [
        ["A processor fetches data from memory", 0],
        ["A program lists the instructions", 0],
        ["Everything stored as binary", 0],
        ["Synapses both remember and compute", 1],
        ["How neurons connect decides what it does", 1],
        ["Inputs arrive as spikes", 1],
      ],
      why: "von Neumann: separate CPU and memory, a program, binary data. Neuromorphic: synapses store and process, their structure sets the instructions, inputs are spikes.",
    },
    M(
      "A smart doorbell spends most of its energy moving data between its processor and memory. Which architecture is it using?",
      ["von Neumann", "Neuromorphic", "Event-based camera"],
      0,
      "Shuttling data between a separate processor and memory is the hallmark of the von Neumann architecture. Neuromorphic machines keep memory and processing together.",
    ),
    M(
      "In a neuromorphic computer, which two properties of a spike carry information?",
      ["Its timing and its magnitude", "Its colour and its voltage source", "Its binary address and its opcode"],
      0,
      "Neuromorphic machines receive spikes as inputs, and their timing and magnitude encode the information.",
    ),
    TF(
      "The term 'neuromorphic computing' originally referred to mixed analogue-digital implementations of brain-inspired techniques.",
      true,
      "It began in the 1980s with mixed analogue-digital hardware and now covers a broad range of brain-inspired techniques.",
    ),
    TF(
      "Today, 'neuromorphic computing' still means only 1980s analogue chips.",
      false,
      "The term has broadened: it now includes a broad range of brain-inspired techniques.",
    ),
    {
      type: "match",
      q: "Match each part of a computer to the job it does.",
      pairs: [
        ["CPU (von Neumann)", "Does the processing"],
        ["Memory (von Neumann)", "Stores the data"],
        ["Synapses (neuromorphic)", "Store the data and do the processing"],
        ["Program (von Neumann)", "Instructs the computer"],
      ],
      why: "A von Neumann machine splits processing (CPU), storage (memory) and instructions (program). In a neuromorphic machine the synapses do the first two, and their structure takes the place of the program.",
    },
  ]);

  B.add("l18-powers", [
    {
      type: "match",
      q: "Match each neuromorphic characteristic to its description.",
      pairs: [
        ["Parallel operation", "Every neuron can run simultaneously"],
        ["Collocated processing and memory", "No fetching from a separate memory"],
        ["Scalability", "Simply add more chips with more neurons"],
        ["Event driven", "Processing occurs when a spike arrives"],
      ],
      why: "These four are the characteristics and advantages listed in the lecture.",
    },
    M(
      "Why does collocating processing and memory save energy?",
      [
        "Data no longer has to be retrieved from a separate memory",
        "The chip runs at a much higher clock speed instead",
        "Binary numbers take fewer bits when stored nearby",
      ],
      0,
      "Collocated processing and memory avoid the costly trips to memory, so the chip is faster and uses less energy.",
    ),
    M(
      "A wildlife sensor sees one animal an hour. Which neuromorphic strength saves it the most energy between animals?",
      ["Event driven", "Scalability", "Parallel operation"],
      0,
      "Event-driven processing only happens when a spike arrives, so the quiet time between animals costs almost nothing.",
    ),
    TF(
      "Each neuron on a neuromorphic chip performs simpler operations than the cores of a parallelised von Neumann machine.",
      true,
      "The lecture notes that simpler operations are possible compared with parallelised von Neumann machines.",
    ),
    TF(
      "To make a neuromorphic machine bigger, you must redesign every chip from scratch.",
      false,
      "They are scalable: you simply add more chips with more neurons.",
    ),
    {
      type: "cat",
      q: "Which characteristic does each scene illustrate?",
      buckets: ["Parallel", "Event driven", "Scalable"],
      items: [
        ["Thousands of neurons update at the same moment", 0],
        ["Many simple jobs run side by side", 0],
        ["Nothing happens until a spike comes in", 1],
        ["A silent sensor uses almost no power", 1],
        ["A lab doubles its network by adding chips", 2],
        ["A bigger machine is built from many identical chips", 2],
      ],
      why: "Simultaneous simple work is parallelism; waiting for spikes is event driven; growing by adding chips is scalability.",
    },
  ]);

  B.add("l18-machines", [
    {
      type: "cat",
      q: "Sort each application into the lecture's category.",
      buckets: ["Graph algorithms", "Optimisation", "Signal processing"],
      items: [
        ["Routing in a communication network", 0],
        ["Analysing a network's structure", 0],
        ["Solving a QUBO problem", 1],
        ["Constraint satisfaction", 1],
        ["Autonomous vehicle control", 2],
        ["Detecting seizures from brain oscillations", 2],
      ],
      why: "Routing and network analysis are graph jobs; QUBO and constraint satisfaction are integer optimisation; vehicle control and seizure detection are signal processing.",
    },
    M(
      "How are Markov chains run on neuromorphic hardware?",
      [
        "Random walkers hop between neurons that stand for states",
        "Each state is stored as a binary word in a separate memory",
        "A frame camera photographs the chain at every step",
      ],
      0,
      "Nodes represent states, random walkers move between them, and the synaptic connections are trained to simulate a real-world distribution.",
    ),
    {
      type: "match",
      q: "Match each fact to the machine.",
      pairs: [
        ["Monitor processor plus fascicle processors", "SpiNNaker"],
        ["Each neuron has an axon to other neurons or itself", "TrueNorth"],
        ["Energy efficiency without sacrificing accuracy", "NorthPole"],
      ],
      why: "SpiNNaker splits its cores into one monitor and many fascicle processors. TrueNorth neurons talk through axons. NorthPole adds efficiency optimisations without losing accuracy.",
    },
    M(
      "What was SpiNNaker mainly designed for?",
      [
        "Exploring the potential of spiking neural networks",
        "Beating deep learning on image accuracy contests",
        "Running ordinary office software at low power",
      ],
      0,
      "SpiNNaker is less about accuracy and focused on exploring the potential of spiking neural networks.",
    ),
    TF(
      "TrueNorth chips are configured with Corelet, a bespoke object-oriented language.",
      true,
      "IBM built Corelet specifically for configuring TrueNorth chips.",
    ),
    TF(
      "SpiNNaker 2, announced in 2019, is about ten times bigger than the original SpiNNaker.",
      true,
      "The lecture gives SpiNNaker 2 (2019) as ten times bigger than SpiNNaker.",
    ),
    M(
      "A SpiNNaker chip has 18 ARM cores. What does the one monitor processor do?",
      ["Runs the operating system", "Models a group of 1,000 neurons", "Stores the chip's synapse weights"],
      0,
      "One core is the monitor running the OS; the others are fascicle processors modelling groups of up to 1,000 neurons.",
    ),
  ]);
})();

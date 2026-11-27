/* Revision bank, Nature-Inspired Lecture 16: 16.1 brains versus computers, 16.2 the neuron, 16.3 the multi-layer perceptron. */
(function () {
  const B = NIC.bank;
  const M = (q, o, a, why, x = {}) => ({ type: "mcq", q, o, a, why, ...x });
  const TF = (q, yes, why) => ({ type: "mcq", q: `True or false? ${q}`, o: ["True", "False"], a: yes ? 0 : 1, why });

  B.add("l16-brain", [
    {
      type: "cat",
      q: "Sort each feature into the machine the lecture credits it to.",
      buckets: ["Conventional computer", "Human brain"],
      items: [
        ["Performs tasks one after another, very fast", 0],
        ["Rarely makes mistakes", 0],
        ["Distributed architecture", 1],
        ["Able to learn", 1],
        ["Memory and processing not separated", 1],
        ["Stores information indefinitely", 0],
      ],
      why: "Computers are sequential, exact, keep memory separate and store indefinitely. Brains are distributed, learn, generalise and mix memory with processing.",
    },
    M(
      "Roughly how many neurons does the lecture say a human brain contains?",
      ["About 100 billion", "About 10,000", "About 100 million"],
      0,
      "About 100 billion neurons, compared to the raindrops needed to fill an Olympic swimming pool. 10,000 is the number of connections each neuron has.",
    ),
    M(
      "Each neuron in the brain connects to roughly how many others?",
      ["About 10,000", "About 10", "About 100 billion"],
      0,
      "Around 10,000 connections each, across about 100 billion neurons.",
    ),
    TF(
      "A brain forgets unimportant information over time, while a computer can keep it indefinitely.",
      true,
      "Forgetting the unimportant is on the brain's list; indefinite storage (disks, optical drives) is on the computer's.",
    ),
    {
      type: "match",
      q: "Match each symbolic AI trait to its connectionist counterpart.",
      pairs: [
        ["Explicit reasoning with symbols", "Implicit reasoning with numbers"],
        ["Expert system of IF-THEN rules", "Neural network as a weighted graph"],
        ["Knowledge programmed", "Knowledge learned"],
        ["Interpretable", "Black box"],
      ],
      why: "These are rows of the lecture's comparison table (credited to Marvin Minsky).",
    },
    M(
      "A weather service wants a system that can explain every forecast as a readable chain of reasons. Which weakness of neural networks matters most here?",
      ["They are a black box", "They cannot learn from data", "They cannot handle perception"],
      0,
      "Networks store knowledge in many weights, so their reasoning is hard to interpret. Learning and perception are their strengths.",
    ),
    TF(
      "Symbolic AI degrades gracefully, while connectionism is serial and fragile.",
      false,
      "It is the other way round: symbolic systems are serial and fragile; connectionist ones are distributed and degrade gracefully.",
    ),
  ]);

  B.add("l16-neuron", [
    {
      type: "match",
      q: "Match each part of a neuron to its role.",
      pairs: [
        ["Dendritic tree", "Receives signals"],
        ["Cell body", "Processes signals"],
        ["Axon", "Transmits signals"],
      ],
      why: "Dendrites receive, the cell body processes and the axon transmits to other neurons.",
    },
    M(
      "Where in the nervous system is learning thought to take place?",
      ["At the synapses", "Inside the axon", "In the cell nucleus"],
      0,
      "The synapse is a chemical junction that can be modified, for example by releasing more neurotransmitter, so it is thought to be where learning happens.",
    ),
    {
      type: "multi",
      q: "Which statements about synapses come from the lecture?",
      o: [
        "They can excite the next neuron",
        "They can inhibit the next neuron",
        "They can strengthen the coupling between cells",
        "They are fixed and never change",
        "They carry signals along the axon",
      ],
      a: [0, 1, 2],
      why: "Synapses excite or inhibit, and can release more neurotransmitter to enhance coupling. They are modifiable junctions between neurons, not the axon itself.",
    },
    M(
      "Who created the first artificial neuron, in 1943?",
      ["McCulloch and Pitts", "Rumelhart and McClelland", "Nash and Sutcliffe"],
      0,
      "McCulloch and Pitts (1943). Rumelhart and McClelland wrote Parallel Distributed Processing in 1986; Nash-Sutcliffe is an accuracy score.",
    ),
    M(
      "What could the McCulloch and Pitts artificial neuron do?",
      [
        "Process simple logical expressions",
        "Recognise faces in blurry camera images",
        "Learn XOR on its own, with no hidden layer",
      ],
      0,
      "It could process simple logic such as AND and OR. XOR needed an extra layer, decades later.",
    ),
    {
      type: "cat",
      q: "Two-input threshold neuron, weights 1 and 1. Sort each threshold by the gate it gives.",
      buckets: ["AND", "OR"],
      items: [
        ["Threshold 1.5", 0],
        ["Threshold 2", 0],
        ["Threshold 0.5", 1],
        ["Threshold 1", 1],
      ],
      hint: "One active input gives a sum of 1; two give 2.",
      why: "If one input (sum 1) already reaches the threshold, it is OR. If only both together (sum 2) reach it, it is AND.",
    },
    TF(
      "In an artificial neuron, a negative weight plays the role of an inhibiting synapse.",
      true,
      "A negative weight pulls the weighted sum down when its input is active, making firing less likely, just as an inhibiting synapse does.",
    ),
  ]);

  B.add("l16-mlp", [
    M(
      "Which logic function could a single-layer network not compute, until a hidden layer was added?",
      ["XOR", "AND", "OR"],
      0,
      "XOR's true cases sit in opposite corners, so no single straight dividing line separates them. A hidden layer fixes it.",
    ),
    M(
      "What did Rumelhart and McClelland's 1986 work add to solve XOR?",
      ["A further layer of neurons", "A larger learning rate", "Negative inputs"],
      0,
      "Adding a further (hidden) layer gave the multi-layer perceptron.",
    ),
    {
      type: "order",
      q: "Put the layers of a multi-layer perceptron in the order data flows through them.",
      items: ["Input units", "Hidden units", "Output units"],
      why: "Input data enters, weighted connections pass it through hidden units, and output units give the response.",
    },
    {
      type: "multi",
      q: "Which tasks does the lecture give as examples of networks relating inputs to an output?",
      o: [
        "Predict fuel consumption from car attributes",
        "Predict the stock market from history",
        "Classify blood values as cancerous or not",
        "Sort a list of numbers into order",
        "Compute 6,783 × 4,592 exactly",
      ],
      a: [0, 1, 2],
      why: "Those three are the lecture's examples of learning a mapping. Sorting and exact multiplication are tasks a normal program does perfectly.",
    },
    M(
      "XOR built from three threshold neurons: the output neuron is AND. Which pair of hidden gates makes it work?",
      ["OR and NAND", "AND and NOR", "OR and AND"],
      0,
      "OR says 'at least one on', NAND says 'not both on'. Both are true only when exactly one input is on, which is XOR.",
    ),
    TF(
      "The multi-layer perceptron is one of the most widely used machine learning techniques.",
      true,
      "The lecture describes it exactly that way.",
    ),
    M(
      "In a multi-layer perceptron, where is what the network has learned stored?",
      ["In the connection weights", "In a list of IF-THEN rules", "In the input data"],
      0,
      "Learning sets the weights on the connections. Rules belong to symbolic AI.",
    ),
  ]);
})();

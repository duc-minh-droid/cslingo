/* js/bank/ds-57.js: Data Science lecture 15 revision questions, part 1: ds15-hpc, ds15-flops and ds15-moore. */
(function () {
  const B = NIC.bank;
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });

  B.add("ds15-hpc", [
    mc(
      "Which three things does the lecture say a high-performance computational system is built around?",
      [
        "Processing power, communication and I/O",
        "Screens, keyboards, mice and printers",
        "Memory, passwords, logins and backups",
      ],
      "High-performance systems combine processing power, communication between parts, and I/O (reading and writing data).",
    ),
    {
      type: "cat",
      q: "Distributed or non-distributed supercomputer?",
      buckets: ["Distributed", "Non-distributed"],
      items: [
        ["Hundreds of separate computers joined by a network", 0],
        ["Nodes that swap data over a LAN", 0],
        ["One very large machine whose parts share memory", 1],
        ["A single huge box, not a team of computers", 1],
      ],
      why: "A distributed supercomputer is many linked computers (nodes) working together; a non-distributed one is a single big machine.",
    },
    {
      type: "order",
      q: "Order these parts of a cluster from biggest to smallest.",
      items: ["Cluster", "Node", "Processor", "Core"],
      why: "A cluster is made of nodes, each node holds processors, and each processor holds several cores.",
    },
    mc(
      "According to the lecture, what mostly drives a cluster's processing power?",
      [
        "Its count of cores and how fast they run",
        "How large the disks on every node are",
        "How many users have accounts on the system",
      ],
      "Processing power is driven by the size of the cluster in processor cores (nodes × processors per node × cores per processor) and their speeds.",
    ),
    {
      type: "multi",
      q: "Select every change that adds cores to a cluster.",
      o: [
        "Adding more nodes",
        "More processors per node",
        "More cores per processor",
        "A faster network",
        "Bigger disks",
      ],
      a: [0, 1, 2],
      why: "Cores = nodes × processors per node × cores per processor. The network and the disks help communication and I/O, not the core count.",
    },
    mc(
      "In a cluster, what is a <b>core</b>?",
      [
        "A small worker in a processor that runs instructions",
        "One whole computer in the cluster, with its own disks",
        "The network cable that joins two nodes together",
      ],
      "Each processor contains several cores, which actually run instructions. A whole computer in the cluster is a node.",
    ),
  ]);

  B.add("ds15-flops", [
    mc(
      "What does FLOPS stand for?",
      ["Floating-point operations per second", "File loads per second", "Fast logic operations per server"],
      "FLOPS counts floating-point operations (sums, products and so on with decimal numbers) per second.",
    ),
    {
      type: "match",
      q: "Match each unit to its size in operations per second.",
      pairs: [
        ["GFLOPS", "10⁹"],
        ["TFLOPS", "10¹²"],
        ["PFLOPS", "10¹⁵"],
        ["EFLOPS", "10¹⁸"],
      ],
      why: "Giga is 10⁹, tera 10¹², peta 10¹⁵ and exa 10¹⁸: each step is a thousand times bigger.",
    },
    {
      type: "order",
      q: "Order these devices from slowest to fastest, using today's figures from the slides.",
      items: ["Smartphone", "High-end server CPU", "Consumer GPU", "Data-centre GPU (H100)"],
      why: "Phones reach hundreds of GFLOPS, a server CPU 1 to 2 TFLOPS, a consumer GPU 20 to 90 TFLOPS, and a data-centre GPU over 1000 TFLOPS.",
    },
    mc(
      "Why does network performance matter so much for a distributed system?",
      [
        "Its nodes must keep swapping data over the network",
        "The network decides how many cores each node has",
        "Every node stores its files on the network cable",
      ],
      "In a distributed system nodes exchange data constantly; a slow network leaves fast processors waiting.",
    ),
    mc(
      "In the lecture, what kind of network joins the nodes inside one building?",
      ["A LAN (local-area network)", "A satellite link between continents", "A phone line"],
      "The slides name the LAN, local-area network, as the network piece of a distributed system.",
    ),
    mc(
      "Why do big data-science models usually run on GPUs?",
      [
        "GPUs do far more floating-point sums per second than CPUs",
        "GPUs come with much larger hard disks than CPU servers",
        "GPUs never need a network to share their results with others",
      ],
      "On the slides a data-centre GPU reaches over 1000 TFLOPS, against 1 to 2 TFLOPS for a server CPU.",
    ),
  ]);

  B.add("ds15-moore", [
    mc(
      "What does Moore's law observe?",
      [
        "Transistors on integrated circuits double about every two years",
        "Processor clock speed doubles every single month",
        "The cost of electricity halves every two years for data centres",
      ],
      "Moore's law is the observation that transistor counts on chips double approximately every two years.",
    ),
    mc(
      "What does the lecture say about Moore's law today?",
      [
        "The industry is hitting its limits and lagging behind it",
        "Chips now double far faster than it ever predicted they would",
        "It has been replaced by Amdahl's law",
      ],
      "The slides say the industry is hitting its limits and lagging behind Moore's law.",
    ),
    {
      type: "cat",
      q: "Does each statement fit Moore's law?",
      buckets: ["Fits", "Does not fit"],
      items: [
        ["Transistor counts double roughly every two years", 0],
        ["It is an observation about the history of chips", 0],
        ["It describes integrated circuits", 0],
        ["It predicts the speedup from more processors", 1],
        ["It measures operations per second", 1],
        ["It says networks double in speed each year", 1],
      ],
      why: "Moore's law is an observation about transistor counts on integrated circuits. Speedup from more processors is Amdahl's law; operations per second is FLOPS.",
    },
    mc(
      "A transistor is best described as…",
      [
        "A tiny switch that chips are built from",
        "A program that schedules jobs on a cluster",
        "A cable between two nodes",
      ],
      "Chips are made of huge numbers of transistors, tiny switches. Moore's law counts them.",
    ),
    mc(
      "Single cores are no longer getting much faster. How do computers keep getting more powerful?",
      ["By adding more cores and more nodes", "By making each file smaller", "By running every job at night"],
      "With chips lagging behind Moore's law, extra speed comes mostly from parallelism: many cores and many nodes.",
    ),
    mc(
      "Which law is about the number of transistors on a chip?",
      ["Moore's law", "Amdahl's law", "Neither of them"],
      "Moore's law counts transistors. Amdahl's law is about the speedup from using more processors.",
    ),
  ]);
})();

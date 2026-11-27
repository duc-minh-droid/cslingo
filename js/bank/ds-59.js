/* js/bank/ds-59.js: Data Science lecture 16 revision questions, part 1: ds16-why, ds16-ai and ds16-flows. */
(function () {
  const B = NIC.bank;
  const { mc } = NIC.shared.ds16;

  B.add("ds16-why", [
    mc(
      "What is hardware–software co-design?",
      [
        "Shaping hardware and software around each other",
        "Writing software once a chip is finished",
        "Buying the fastest general-purpose chip",
      ],
      "Co-design specialises both: hardware built around the software's characteristics, and software tuned to exploit that hardware.",
    ),
    mc(
      "Why is co-design getting more attention now?",
      [
        "Moore's law scaling is slowing, and AI demands more",
        "General chips are getting faster every month",
        "Software no longer needs any hardware",
      ],
      "With general chips speeding up less each year, the extra performance AI and data science need has to come from specialising.",
    ),
    mc(
      "Why does a new specialised chip need a large demand?",
      [
        "Designing a new architecture is extremely expensive",
        "Small orders of chips are illegal to make",
        "Specialised chips wear out after a few uses",
      ],
      "The design cost is huge, so it only pays off when many units will be sold or used.",
    ),
    {
      type: "cat",
      q: "Sort each choice into its side of co-design.",
      buckets: ["Hardware side", "Software side"],
      items: [
        ["Adding a unit for the model's main operation", 0],
        ["Sizing on-chip memory to fit the model's weights", 0],
        ["Rewriting a library to use the chip's new unit", 1],
        ["Tuning a model to fit the chip's number format", 1],
      ],
      why: "Hardware designed around the software's characteristics, and software fine-tuned to the hardware's capabilities.",
    },
    mc(
      "A team runs a general image library on a chip built only for images. Which combination is that?",
      [
        "General software on specialised hardware",
        "Specialised software on general hardware",
        "General software on general hardware",
      ],
      "The library is general; the chip is specialised. The slides name both mixes as affecting performance.",
    ),
    {
      type: "multi",
      q: "Which statements about co-design match the lecture? Select all that apply.",
      o: [
        "It is not a new field",
        "AI and ML have recently pushed it forward",
        "Software may be tuned to hardware that does not exist yet",
        "It only applies to phones",
        "It means using only general-purpose chips",
      ],
      a: [0, 1, 2],
      why: "The field is old but driven lately by AI/ML, and software can be tuned for hardware still being designed. It applies far beyond phones.",
    },
  ]);

  B.add("ds16-ai", [
    {
      type: "cat",
      q: "Does each workload mostly use dense or sparse tensors?",
      buckets: ["Dense", "Sparse"],
      items: [
        ["A CNN sorting X-ray images", 0],
        ["A network colouring old photos", 0],
        ["A film site's viewer–film ratings", 1],
        ["A social network's friend graph", 1],
      ],
      why: "Images fill every cell: dense, as in CNNs. Ratings and graphs are mostly empty: sparse, as in recommendation and graph applications.",
    },
    mc(
      "What are most AI and ML models built from?",
      ["Tensor operations", "Text-file reads", "Network packets"],
      "Models are based on tensor operations, dense or sparse, which is why specialised tensor hardware helps.",
    ),
    mc(
      "A smart doorbell recognises family faces inside the doorbell, without sending video away. What is this?",
      ["Edge computing", "Cloud computing", "Platform-based design"],
      "Running the model on the device itself is edge computing, pushed by personalised models and privacy.",
    ),
    mc(
      "Why is there pressure to run AI on devices instead of the cloud?",
      [
        "Models are becoming more personalised",
        "Clouds can no longer run AI models",
        "Devices have more power than data centres",
      ],
      "As models become personalised there is pressure to compute on the device, which needs specialised hardware and software.",
    ),
    {
      type: "match",
      q: "Match each processor to where it is used.",
      pairs: [
        ["ADAS chip", "Lane keeping and emergency braking in a car"],
        ["DPU", "Routing packets and encryption beside a server"],
        ["GPU", "The same maths on many numbers in parallel"],
      ],
      why: "ADAS = advanced driver-assistance systems in vehicles. DPUs and IPUs handle networking, storage and security in data centres. GPUs run similar calculations in parallel.",
    },
    {
      type: "multi",
      q: "Which jobs do infrastructure processors (DPUs, IPUs) take over? Select all that apply.",
      o: [
        "Balancing network traffic",
        "Storage virtualisation",
        "Applying firewall rules",
        "Running the customer's spreadsheet",
        "Drawing the operating system's desktop",
      ],
      a: [0, 1, 2],
      why: "They handle networking, storage and security for the server. The customer's applications stay on the main processors.",
    },
    mc(
      "Which of these is an Intel product named in the lecture as an infrastructure processor?",
      ["IPU", "BlueField", "Pensando"],
      "Intel's is the IPU (infrastructure processing unit). BlueField is NVIDIA's DPU and Pensando is AMD's.",
    ),
  ]);

  B.add("ds16-flows", [
    {
      type: "match",
      q: "Match each design flow to its description.",
      pairs: [
        ["Bottom-up", "Hardware first, software written for it"],
        ["Top-down", "The workload drives new hardware"],
        ["Co-design", "Both designed and optimised together"],
      ],
      why: "Bottom-up (platform-based) starts with hardware; top-down starts with the software workload; co-design couples them.",
    },
    mc(
      "Early general-purpose GPU computing is an example of which flow?",
      ["Bottom-up", "Top-down", "Co-design"],
      "GPUs existed for graphics first; general-purpose software was then written for them: bottom-up.",
    ),
    mc(
      "NVIDIA's Volta tensor cores are an example of which flow?",
      ["Top-down", "Bottom-up", "Platform-based"],
      "The tensor-heavy AI workload drove the design of those units: top-down.",
    ),
    mc(
      "Qualcomm's Snapdragon Ride Flex and Ride Vision are given as an example of what?",
      ["Hardware–software co-design", "Bottom-up, platform-based design", "High-level synthesis of a chip"],
      "The car platform and its vision software were designed, analysed and optimised together.",
    ),
    {
      type: "order",
      q: "Put the iterative loop in order, starting from demand.",
      items: [
        "Demand grows for a new capability",
        "More specialised software is written",
        "New hardware architectures follow",
        "Even more specialised software appears",
      ],
      why: "Demand creates the need for specialised software, which drives new architectures, which lead to more specialised software.",
    },
    mc(
      "Which design flow does the lecture say is best?",
      [
        "Neither: they often walk together",
        "Always top-down, as the workload leads",
        "Always bottom-up, as the chip comes first",
      ],
      "The slides say neither approach is better than the other; they often work together in an iterative process.",
    ),
  ]);
})();

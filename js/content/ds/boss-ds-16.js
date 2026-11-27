/* Data Science Lecture 16 (hardware–software co-design): the boss quiz. New scenario: Hivewatch, a sensor box on a
   beehive that listens to the buzz and warns the beekeeper when a colony is in trouble. */
(function () {
  const S = NIC.shared.ds16;
  const { svg, box, arrow } = S;

  const stackFig = svg(
    520,
    110,
    ["Framework", "Compiler", "Runtime"]
      .map(
        (n, i) =>
          `<g data-pick="${n}" data-k="${n}">${box(10 + i * 176, 24, 150, 60, n, ["blue", "violet", "teal"][i])}</g>` +
          (i < 2 ? arrow(162 + i * 176, 54, 184 + i * 176, 54) : ""),
      )
      .join(""),
    "Hivewatch's software stack: framework, compiler, runtime",
  );

  NIC.registerBoss({
    id: "ds16-boss",
    subject: "ds",
    lecture: 16,
    title: "Lecture 16 boss quiz",
    blurb:
      "Ten questions set on a beehive: specialised chips, design flows, partitioning, data movement and measuring.",
    lede: "A new scenario: <b>Hivewatch</b> is a solar-powered box on a beehive. It listens to the bees' buzz with a small neural network and texts the beekeeper when a colony sounds unwell. Help its team design the chip and the code together.",
    qs: [
      {
        type: "match",
        q: "Match each Hivewatch situation to the design flow it describes.",
        pairs: [
          ["Bottom-up", "The team buys an existing board, then writes software to suit it"],
          ["Top-down", "The buzz model's operations decide what a new chip must contain"],
          ["Co-design", "Chip and model are tested and changed together every sprint"],
          ["Iterative", "More beekeepers want it, so smarter software drives a newer chip"],
        ],
        why: "Bottom-up starts from hardware; top-down lets the workload drive new hardware; co-design couples the two; demand keeps the software–hardware loop turning.",
      },
      {
        type: "cat",
        q: "Partition Hivewatch's functions: which belong in hardware, which in software?",
        buckets: ["Hardware", "Software"],
        items: [
          ["Filtering the microphone signal, thousands of times a second", 0],
          ["The buzz network that runs on every recording", 0],
          ["Encrypting each upload with a fixed cipher", 0],
          ["The wording of the text sent to the beekeeper", 1],
          ["Thresholds the bee scientists retune each season", 1],
          ["The settings menu in the companion app", 1],
        ],
        why: "Hardware suits heavy, stable work that needs speed and parallelism. Anything that changes or needs easy updates stays in software.",
      },
      {
        type: "order",
        q: "Put the steps of a Hivewatch co-design decision in order.",
        items: [
          "Profile the device on real hive recordings",
          "Identify the slowest, most costly function",
          "Choose a suitable processor for it",
          "Check the cost of moving its data there",
        ],
        why: "Start with the workload on realistic inputs, find what dominates, pick a processor, then check that moving the data does not cancel the gain.",
      },
      {
        type: "mcq",
        q: "Hivewatch's network moves to a fast accelerator, yet each recording takes almost as long as before. What is the likeliest cause?",
        o: [
          "Copying the audio across now dominates",
          "The accelerator runs the network more slowly",
          "The network has become more accurate",
          "The CPU now does more of the maths",
        ],
        a: 0,
        why: "Moving data may cost more than computing on it. If the recording must be copied to the accelerator and back, a faster compute stage barely changes the total.",
      },
      {
        type: "multi",
        q: "Which of these should Hivewatch's team measure when judging a design? Select all that apply.",
        o: [
          "End-to-end latency",
          "Energy per result",
          "Hardware and development cost",
          "Throughput",
          "The number of source files",
          "The colour of the circuit board",
        ],
        a: [0, 1, 2, 3],
        why: "The lecture's list: end-to-end latency and throughput, energy per result, and hardware and development cost.",
      },
      {
        type: "pick",
        q: "Hivewatch moves to a new chip. Tap the layer that schedules the work and the memory while the model runs.",
        fig: stackFig,
        a: "Runtime",
        why: "The framework expresses the model, the compiler selects hardware-specific operations, and the runtime schedules work and memory.",
      },
      {
        type: "mcq",
        q: "Hivewatch has no mobile signal in the field, so the buzz model must run inside the box. What is this called?",
        o: ["Edge computing", "Cloud computing", "High-level synthesis", "Platform-based design"],
        a: 0,
        why: "Computing on the device rather than in the cloud is edge computing, which needs software and hardware frugal enough for the device.",
      },
      {
        type: "cat",
        q: "Which processor suits each Hivewatch job best?",
        buckets: ["CPU", "GPU", "Specialised chip"],
        items: [
          ["Deciding whether to text, call or wait", 0],
          ["Handling the solar panel, clock and menus", 0],
          ["Training a new model on many recordings at once", 1],
          ["The same matrix maths on a big batch, in parallel", 1],
          ["The fixed buzz filter, run all day for years", 2],
          ["A stable network on every clip, at tiny power", 2],
        ],
        why: "CPU: varied tasks and control flow. GPU: similar calculations in parallel. Specialised chip: frequent, stable operations.",
      },
      {
        type: "mcq",
        q: "The team writes what the buzz filter should do in a high-level description, and a tool produces the hardware design. What is that process?",
        o: ["High-level synthesis", "Partitioning", "Profiling", "Platform-based design"],
        a: 0,
        why: "High-level synthesis translates a behaviour specification, free of hardware details, into a hardware design in an HDL.",
      },
      {
        type: "multi",
        q: "Why might Hivewatch's makers hesitate to design their own chip? Select all that apply.",
        o: [
          "A new architecture is extremely expensive to design",
          "It only pays off with a large demand",
          "Functions baked into it are hard to update",
          "Specialised chips cannot run neural networks",
          "Chips must be designed after all the software",
        ],
        a: [0, 1, 2],
        why: "Custom silicon is very costly and needs large demand, and hardware trades flexibility for speed. Specialised chips run networks very well, and co-design means the software need not come first.",
      },
    ],
  });
})();
